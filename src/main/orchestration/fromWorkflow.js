import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, tool, ToolLoopAgent } from "ai";
import {
  assign,
  createActor,
  emit,
  fromPromise,
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

const buildAgentActor = async (
  { name, model: modelName, instructions, prompt, tools, description },
  { input },
) => {
  const { prompt: initialPrompt, parent } = input;

  const content = initialPrompt ?? prompt;

  parent.send({ type: "agent.active", name, prompt: content, instructions });
  parent.send({
    type: `agent.${name}.active`,
    name,
    prompt: content,
    instructions,
  });

  const agent = new ToolLoopAgent({
    model: lmstudio(modelName),
    toolChoice: "auto",
    tools: tools.reduce((acc, subAgent) => {
      return {
        ...acc,
        [subAgent.name]: tool({
          inputSchema: z.object({ input: z.string() }),
          description,
          execute: async ({ input: toolInput }) => {
            const result = await buildAgentActor(subAgent, {
              input: { ...input, prompt: toolInput, parent },
            });

            return result.content[0].value;
          },
        }),
      };
    }, {}),
  });

  const stream = await agent.stream({
    messages: [
      { role: "system", content: instructions },
      { role: "user", content },
    ],
  });

  for await (const chunk of stream.toUIMessageStream()) {
    parent.send({ type: "agent.UIMessageStream", chunk, name });
    parent.send({ type: `agent.${name}.UIMessageStream`, chunk, name });
  }

  const text = await stream.text;

  const message = {
    role: "assistant",
    content: [{ type: "text", value: text }],
  };

  parent.send({ type: "agent.done", name, ...message });
  parent.send({ type: `agent.${name}.done`, name, ...message });

  return message;
};

export const fromWorkflow = ({
  name,
  tools = [],
  model,
  instructions,
  prompt,
  next,
}) => {
  const listeners = {};

  const send = (event) => {
    if (event.type in listeners) {
      listeners[event.type].forEach((callback) => {
        callback(event);
      });
    }
  };

  return {
    async start() {
      let result = await buildAgentActor(
        { name, tools, model, instructions, prompt },
        {
          input: {
            prompt,
            parent: { send },
          },
        },
      );

      if (next) {
        result = await buildAgentActor(next, {
          input: { prompt: result.content[0].value, parent: { send } },
        });
      }

      send({ type: "final", name: "workflow", ...result });
    },
    on(type, callback) {
      if (type in listeners) {
        listeners[type].push(callback);
      } else {
        listeners[type] = [callback];
      }
    },
    off(type, callback) {
      if (type in listeners) {
        listeners[type] = listeners[type].map((c) => c !== callback);
      }
    },
  };
};
