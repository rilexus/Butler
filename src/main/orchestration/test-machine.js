import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { tool, ToolLoopAgent } from "ai";
import { assign, createActor, createMachine, fromPromise, setup } from "xstate";
import z from "zod";

const model = "qwen2.5-coder-7b-instruct";
const url = "http://127.0.0.1:1234/v1";

const agents = {
  manager: {
    description: "Delegates tasks to other AI agents.",
    instructions:
      "Your mission is to deliver a meal to a customer by coordinating actions using the tools available. You must start by creating a detailed execution plan to accomplish the goal. Each tool must be invoked once and only once, in the appropriate sequence based on your execution plan. Only one tool must be called at a time. Do not invoke the next tool until the previous has returned a result. Execute the `done` tool last.",
    prompt:
      "Increment from 0 to the number 10 by calling tools. Return only the resulting number. No other text.",
    model,
    url,
  },
  addTwo: {
    model,
    url,
    description: "Increment the given number by 2",
    instructions:
      "You receive one number and you increment it by 2. Return only the resulting number. No other text.",
  },
  addThree: {
    model,
    url,
    description: "Increment the given number by 3",
    instructions:
      "You receive one number and you increment it by 3. Return only the resulting number. No other text.",
  },
  addFive: {
    model,
    url,
    description: "Increment the given number by 5",
    instructions:
      "You receive one number and you increment it by 3. Return only the resulting number. No other text.",
  },
  addOne: {
    model,
    url,
    description: "Increment the given number by 1",
    instructions:
      "You receive one number and you increment it by 1. Return only the resulting number. No other text.",
  },
};

const getAgent = (name) => agents[name];

const workflow = {
  agent: "manager",
  targets: [],
  manages: [
    {
      agent: "addTwo",
      targets: [
        {
          agent: "manager",
        },
      ],
      manages: [
        {
          agent: "addOne",
          targets: [{ agent: "addTwo" }],
        },
      ],
    },
    {
      agent: "addThree",
      manages: [],
      targets: [
        {
          agent: "manager",
        },
      ],
    },
    {
      agent: "addFive",
      manages: [],
      targets: [
        {
          agent: "manager",
        },
      ],
    },
  ],
};

const lmstudio = createOpenAICompatible({
  name: "lmstudio",
  headers: {
    Authorization: "Bearer sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X",
  },
  baseURL: url,
});

const fromWorkflow = ({ agent, manages, targets }) => {
  const machine = setup({
    actors: {
      [agent]: fromPromise(async ({ input, system, self, emit }) => {
        const { messages } = input; // this is the state of the application
        const { model, instructions, prompt } = getAgent(agent);

        try {
          const agent = new ToolLoopAgent({
            model: lmstudio(model),
            toolChoice: "required",
            tools: {
              ...manages.reduce((acc, { agent, description }) => {
                return {
                  ...acc,
                  [agent]: tool({
                    inputSchema: z.object({ input: z.string() }),
                    description,
                  }),
                };
              }, {}),

              done: tool({
                inputSchema: z.object({}),
                description: "Exit the flow",
              }),
            },
          });
          const { toolCalls } = await agent.generate({
            messages: [
              {
                role: "system",
                content: instructions,
              },
              {
                role: "user",
                content: prompt,
              },
              ...messages,
            ],
          });

          return {
            role: "assistant",
            content: [toolCalls[0]],
          };
        } catch (e) {
          console.error(e);
        }
      }),
      ...manages.reduce((acc, { agent, manages }) => {
        const { instructions, model, url } = getAgent(agent);
        return {
          ...acc,
          [agent]: fromPromise(
            async ({
              input: {
                content: [{ toolCallId, input, toolName }],
              },
            }) => {
              const agent = new ToolLoopAgent({
                instructions,
                model: lmstudio(model),
              });

              const { text } = await agent.generate({
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
          ),
        };
      }, {}),
    },
    guards: {
      ...manages.reduce((acc, { agent }) => {
        return {
          ...acc,
          [agent]: function ({ context, event }) {
            return event.output.content?.[0]?.toolName === agent;
          },
        };
      }, {}),

      done: function ({ context, event }) {
        return event.output.content?.[0]?.toolName === "done";
      },
    },
    actions: {
      add_results: assign({
        results: ({ event, context }) => {
          const value = event.output.content[0].output.value.replace(
            /^\n+|\n+$/g,
            "",
          );
          console.log("add_result: ", value);
          return [...context.results, value];
        },
      }),
      add_message: assign({
        messages: ({ event, context }) => {
          return [...context.messages, event.output];
        },
      }),
    },
  }).createMachine({
    context: {
      results: [],
      messages: [],
    },
    initial: agent,
    states: {
      [agent]: {
        invoke: {
          src: agent,
          input: ({ context }) => context, // this is the state of the application
          onDone: [
            // All possible next states guarded by a guard
            ...manages.map(({ agent }) => {
              return {
                target: agent,
                guard: agent,
                actions: "add_message",
              };
            }),
            {
              target: "done",
              actions: "add_message",
              guard: "done",
            },
          ],
        },
      },
      ...manages.reduce((acc, { agent, targets }) => {
        return {
          ...acc,
          [agent]: {
            invoke: {
              src: agent,
              input: ({ event }) => event.output,
              onDone: targets.map(({ agent }) => {
                return {
                  target: agent,
                  actions: ["add_message", "add_results"],
                };
              }),
            },
          },
        };
      }, {}),
      done: {
        type: "final",
      },
    },
    output: ({ context }) => {
      console.log("finished with: ", context.results);
      return context.messages;
    },
  });
  return machine;
};

export const machine = fromWorkflow(workflow);
