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
  tools = [],
  model: modelName,
  instructions,
  prompt,
  next,
}) => {
  const machine = setup({
    actors: {
      [name]: fromPromise(async ({ input }) => {
        const { messages, prompt: initialPrompt, parent } = input;

        const agentInstance = new ToolLoopAgent({
          model: lmstudio(modelName),
          toolChoice: "auto",
          tools: {
            ...tools.reduce((acc, { name, description }) => {
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
            name: name,
          });
        }

        for await (const chunk of stream.fullStream) {
          parent.send({
            type: "agent.fullStream",
            chunk,
            name: name,
          });
        }

        const toolCall = (await stream.toolCalls)[0];
        const text = await stream.text;

        return {
          role: "assistant",
          content: [toolCall ?? { type: "text", value: text }],
        };
      }),
      ...tools.reduce((acc, managed) => {
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
      ...(next
        ? {
            [next.name]: fromPromise(async ({ input }) => {
              const nextMachine = fromWorkflow(next);
              const { parent } = input;

              const actor = createActor(nextMachine, {
                input: {
                  prompt: input.results.at(-1),
                },
              });

              actor.start();

              parent.send({ type: "agent.active", name: next.name });

              return await toPromise(actor);
            }),
          }
        : {}),
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
      merge_next_output: assign({
        results: ({ event, context }) => [
          ...context.results,
          ...event.output.results,
        ],
        messages: ({ event, context }) => [
          ...context.messages,
          ...(event.output.messages ?? []),
        ],
      }),
    },
    guards: {
      ...tools.reduce((acc, { name }) => {
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
            ...tools.map(({ name }) => {
              return {
                target: name,
                actions: ["add_message"],
                guard: name,
              };
            }),
            {
              target: next ? next.name : "done",
              actions: [
                "add_message",
                "add_results",
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
      ...tools.reduce((acc, { name: managedName }) => {
        return {
          ...acc,
          [managedName]: {
            invoke: {
              id: managedName,
              src: managedName,
              input: ({ event, context, self }) => ({
                ...event,
                ...context,
                parent: self,
              }),
              onDone: [
                {
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
                },
              ],
            },
          },
        };
      }, {}),

      ...(next
        ? {
            [next.name]: {
              invoke: {
                id: next.name,
                src: next.name,
                input: ({ context, self }) => ({ ...context, parent: self }),
                onDone: {
                  target: "done",
                  actions: [
                    "merge_next_output",
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
            },
          }
        : {}),

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
      "agent.fullStream": {
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
