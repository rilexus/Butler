import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { tool, ToolLoopAgent } from "ai";
import { type } from "node:os";
import {
  assign,
  createActor,
  emit,
  fromPromise,
  sendParent,
  setup,
  toPromise,
} from "xstate";
import z from "zod";

const lmstudio = createOpenAICompatible({
  name: "lmstudio",
  headers: {
    Authorization: "Bearer sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X",
  },
  baseURL: "http://127.0.0.1:1234/v1",
});

export const fromWorkflow = ({
  name: agentName,
  manages = [],
  targets = [],
  model: modelName,
  instructions,
  prompt,
}) => {
  const managedActors = manages.reduce((acc, managedNode) => {
    const {
      name: managedAgentName,
      manages: subManages = [],
      instructions,
      model,
    } = managedNode;

    if (subManages.length === 0) {
      // Leaf node: execute the task directly
      const actor = fromPromise(
        async ({
          input: {
            parent,
            content: [{ toolCallId, input, toolName }],
          },
        }) => {
          // console.log(parent);
          const agentInstance = new ToolLoopAgent({
            instructions: instructions,
            model: lmstudio(model),
          });

          const { text } = await agentInstance.generate({
            prompt: `${input.input}`,
          });

          return {
            role: "tool",
            content: [
              {
                type: "tool-result",
                output: { type: "text", value: text },
                toolCallId,
                toolName,
              },
            ],
          };
        },
      );

      acc[managedAgentName] = actor;
    } else {
      // Orchestrator node: run a nested sub-machine
      const subMachine = fromWorkflow(managedNode);

      acc[managedAgentName] = fromPromise(
        async ({
          input: {
            parent,
            content: [{ toolCallId, input, toolName }],
          },
        }) => {
          const subActor = createActor(subMachine, {
            input: { initialPrompt: input.input },
          });

          subActor.start();

          const { results } = await toPromise(subActor);

          return {
            role: "tool",
            content: [
              {
                type: "tool-result",
                output: { type: "text", value: results.at(-1) ?? "" },
                toolCallId,
                toolName,
              },
            ],
          };
        },
      );
    }

    return acc;
  }, {});

  const machine = setup({
    actors: {
      [agentName]: fromPromise(async ({ input }) => {
        const { messages, initialPrompt } = input;

        const agentInstance = new ToolLoopAgent({
          model: lmstudio(modelName),
          toolChoice: "required",
          tools: {
            ...manages.reduce(
              (acc, { name: managedAgent, description }) => ({
                ...acc,
                [managedAgent]: tool({
                  inputSchema: z.object({ input: z.string() }),
                  description: description,
                }),
              }),
              {},
            ),
            done: tool({
              inputSchema: z.object({}),
              description: "Exit the flow",
            }),
          },
        });

        const { toolCalls } = await agentInstance.generate({
          messages: [
            { role: "system", content: instructions },
            { role: "user", content: initialPrompt ?? prompt },
            ...messages,
          ],
        });

        return { role: "assistant", content: [toolCalls[0]] };
      }),
      ...managedActors,
    },
    guards: {
      ...manages.reduce(
        (acc, { name: managedAgent }) => ({
          ...acc,
          [managedAgent]: ({ event }) =>
            event.output.content?.[0]?.toolName === managedAgent,
        }),
        {},
      ),
      done: ({ event }) => event.output.content?.[0]?.toolName === "done",
    },
    actions: {
      onSnapshot: emit(({ event }) => {
        // console.log(event);
        return {
          type: "agent.snapshot",
          data: {
            ...event,
          },
        };
      }),
      onStream: emit(({ event }) => {
        return {
          type: "agent.stream",
          data: {
            ...event,
          },
        };
      }),
      onDone: emit(({ event }) => {
        return {
          type: "agent.done",
          data: {
            id: event.actorId,
            status: "done",
            output: event.output,
          },
        };
      }),
      add_results: assign({
        results: ({ event, context }) => {
          const value = event.output.content[0].output.value.replace(
            /^\n+|\n+$/g,
            "",
          );
          return [...context.results, value];
        },
      }),
      add_message: assign({
        messages: ({ event, context }) => [...context.messages, event.output],
      }),
    },
  }).createMachine({
    context: ({ input }) => ({
      results: [],
      messages: [],
      initialPrompt: input?.initialPrompt ?? prompt ?? null,
    }),
    initial: agentName,
    states: {
      [agentName]: {
        invoke: {
          id: agentName,
          src: agentName,
          input: ({ context }) => context,
          onSnapshot: {
            actions: ["onSnapshot"],
          },
          onDone: [
            ...manages.map(({ name: managedAgent }) => ({
              target: managedAgent,
              guard: managedAgent,
              actions: "add_message",
            })),
            {
              target: "done",
              actions: ["add_message", "onDone"],
              guard: "done",
            },
          ],
        },
      },
      ...manages.reduce(
        (acc, { name: managedAgent, targets: managedTargets = [] }) => ({
          ...acc,
          [managedAgent]: {
            invoke: {
              id: managedAgent,
              src: managedAgent,
              input: ({ event, self }) => ({ ...event.output, parent: self }),
              onSnapshot: {
                actions: ["onSnapshot"],
              },
              onDone: [
                ...managedTargets.map(({ name: targetAgent }) => ({
                  target: targetAgent,
                  actions: ["add_message", "add_results", "onDone"],
                })),
              ],
            },
          },
        }),
        {},
      ),
      done: { type: "final" },
    },

    output: ({ context }) => {
      // console.log(context);
      return context;
    },
  });

  return machine;
};
