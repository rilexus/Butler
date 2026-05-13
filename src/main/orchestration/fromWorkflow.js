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
  name: agentName,
  manages = [],
  targets = [],
  model: modelName,
  instructions,
  prompt,
}) => {
  const machine = setup({
    actors: {
      addOne: fromPromise(async ({ input }) => {
        const prompt = input.output.content[0].input.input;
        const { toolCallId, toolName } = input.output.content[0];
        const messages = input.messages;
        const parent = input.parent;

        const agentInstance = new ToolLoopAgent({
          model: lmstudio(modelName),
          toolChoice: "auto",
          tools: {},
        });

        parent.send({
          type: "agent.active",
          name: "addOne",
        });

        const stream = await agentInstance.stream({
          messages: [
            {
              role: "system",
              content:
                "Increment the given number by 1. Return only the result. No other text",
            },
            { role: "user", content: prompt },
          ],
        });

        for await (const chunk of stream.toUIMessageStream()) {
          parent.send({
            type: "agent.UIMessageStream",
            chunk,
            name: "addOne",
          });
        }

        const text = await stream.text;

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
      }),
      manager: fromPromise(async ({ input }) => {
        const { messages, prompt: initialPrompt, parent } = input;

        const agentInstance = new ToolLoopAgent({
          model: lmstudio(modelName),
          toolChoice: "auto",
          tools: {
            addOne: tool({
              inputSchema: z.object({ input: z.string() }),
              description:
                "Add 1 to the input. Returns the result. No other text!",
            }),
          },
        });

        parent.send({
          type: "agent.active",
          name: "manager",
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
      addOne: ({ event }) => {
        return event.output.content[0].toolName === "addOne";
      },
    },
  }).createMachine({
    context: ({ input }) => ({
      results: [],
      messages: [],
      prompt: input?.prompt ?? prompt ?? null,
    }),
    initial: "manager",
    states: {
      manager: {
        invoke: {
          id: "manager",
          src: "manager",
          input: ({ context, self }) => ({ ...context, parent: self }),
          onDone: [
            {
              target: "addOne",
              actions: ["add_message"],
              guard: "addOne",
            },
            {
              target: "done",
              actions: ["add_message", "add_results"],
            },
          ],
        },
      },
      addOne: {
        invoke: {
          id: "addOne",
          src: "addOne",
          input: ({ event, context, self }) => ({
            ...event,
            ...context,
            parent: self,
          }),
          onDone: [
            {
              target: "manager",
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
            },
          ],
        },
      },
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
