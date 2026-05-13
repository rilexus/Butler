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

const model = "qwen2.5-7b-instruct-uncensored";
const url = "http://127.0.0.1:1234/v1";

export const fromWorkflow = ({
  name,
  manages = [],
  targets = [],
  model: modelName,
  instructions,
  prompt,
}) => {
  const machine = setup({
    actors: {
      [name]: fromPromise(async ({ input }) => {
        const { messages, prompt: initialPrompt, parent } = input;

        const agentInstance = new ToolLoopAgent({
          model: lmstudio(modelName),
          toolChoice: "auto",
          tools: {
            ...manages.reduce((acc, { name, description }) => {
              return {
                ...acc,
                [name]: tool({
                  inputSchema: z.object({ input: z.string() }),
                  description,
                }),
              };
            }, {}),
          },
        });

        parent.send({
          type: "agent.active",
          name: name,
        });

        const stream = await agentInstance.stream({
          messages: [
            { role: "system", content: instructions },
            { role: "user", content: initialPrompt ?? prompt },
            ...messages,
          ],
        });

        for await (const chunk of stream.toUIMessageStream()) {
          parent.send({
            type: "agent.UIMessageStream",
            chunk,
            name: "manager",
          });
        }

        const toolCall = (await stream.toolCalls)[0];
        const text = await stream.text;

        return {
          role: "assistant",
          content: [toolCall ?? { type: "text", value: text }],
        };
      }),
      ...manages.reduce((acc, managed) => {
        const { name } = managed;
        const machine = fromWorkflow(managed);

        return {
          ...acc,
          [name]: fromPromise(async ({ input }) => {
            const prompt = input.output.content[0].input.input;
            const { toolCallId, toolName } = input.output.content[0];
            const messages = input.messages;
            const parent = input.parent;

            const actor = createActor(machine, {
              input: {
                prompt: prompt,
              },
            });

            actor.start();

            parent.send({
              type: "agent.active",
              name: name,
            });

            const { results } = await toPromise(actor);

            return {
              role: "tool",
              content: [
                {
                  type: "tool-result",
                  output: { type: "text", value: results.at(-1) },
                  toolCallId,
                  toolName,
                },
              ],
            };
          }),
        };
      }, {}),
    },

    actions: {
      add_results: assign({
        results: ({ event, context }) => {
          const value = event.output.content[0].value.replace(/^\n+|\n+$/g, "");
          return [...context.results, value];
        },
      }),
      add_message: assign({
        messages: ({ event, context }) => [...context.messages, event.output],
      }),
    },
    guards: {
      ...manages.reduce((acc, { name }) => {
        return {
          ...acc,
          [name]: ({ event }) => {
            return event.output.content[0].toolName === name;
          },
        };
      }, {}),
    },
  }).createMachine({
    context: ({ input }) => ({
      results: [],
      messages: [],
      prompt: input?.prompt ?? prompt ?? null,
    }),
    initial: name,
    states: {
      [name]: {
        invoke: {
          id: name,
          src: name,
          input: ({ context, self }) => ({ ...context, parent: self }),
          onDone: [
            ...manages.map(({ name }) => {
              return {
                target: name,
                actions: ["add_message"],
                guard: name,
              };
            }),
            {
              target: "done",
              actions: ["add_message", "add_results"],
            },
          ],
        },
      },
      ...manages.reduce((acc, { name, targets = [] }) => {
        return {
          ...acc,
          [name]: {
            invoke: {
              id: name,
              src: name,
              input: ({ event, context, self }) => ({
                ...event,
                ...context,
                parent: self,
              }),
              onDone: [
                ...targets.map(({ name }) => {
                  return {
                    target: name,
                    actions: [
                      "add_message",
                      emit(({ event, context }) => {
                        return {
                          type: "agent.done",
                          name: event.actorId,
                          ...context,
                        };
                      }),
                    ],
                  };
                }),
              ],
            },
          },
        };
      }, {}),

      done: {
        type: "final",
        entry: [
          emit(({ event, context }) => {
            return {
              type: "final",
              name: event.actorId,
              ...context,
            };
          }),
          emit(({ event, context }) => {
            return {
              type: "agent.done",
              name: event.actorId,
              ...context,
            };
          }),
        ],
      },
    },
    on: {
      "agent.UIMessageStream": {
        actions: emit(({ event }) => event),
      },
      "agent.active": {
        actions: emit(({ event }) => event),
      },
    },

    output: ({ context }) => {
      return context;
    },
  });

  return machine;
};
