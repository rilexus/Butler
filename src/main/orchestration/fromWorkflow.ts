import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, tool, ToolLoopAgent } from "ai";
import z from "zod";

const lmstudio = createOpenAICompatible({
  name: "lmstudio",
  headers: {
    Authorization: "Bearer sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X",
  },
  baseURL: "http://127.0.0.1:1234/v1",
});

interface AgentConfig {
  name: string;
  model: string;
  instructions: string;
  prompt?: string;
  description?: string;
  tools?: AgentConfig[];
  next?: AgentConfig | null;
}

interface AgentInput {
  prompt: string;
  parent: { send: (event: Record<string, unknown>) => void };
}

interface AgentMessage {
  role: "assistant";
  content: Array<{ type: "text"; value: string }>;
}

const buildAgentActor = async (
  { name, model: modelName, instructions, prompt, tools = [], description }: AgentConfig,
  { input }: { input: AgentInput },
): Promise<AgentMessage> => {
  const { prompt: initialPrompt, parent } = input;

  const content = initialPrompt ?? prompt;

  parent.send({ type: "agent.active", name, prompt: content, instructions });
  parent.send({ type: `agent.${name}.active`, name, prompt: content, instructions });

  const agent = new ToolLoopAgent({
    model: lmstudio(modelName),
    toolChoice: "auto",
    tools: tools.reduce(
      (acc, subAgent) => ({
        ...acc,
        [subAgent.name]: tool({
          inputSchema: z.object({ input: z.string() }),
          description: subAgent.description,
          execute: async ({ input: toolInput }) => {
            const result = await buildAgentActor(subAgent, {
              input: { ...input, prompt: toolInput, parent },
            });
            return result.content[0].value;
          },
        }),
      }),
      {} as Record<string, ReturnType<typeof tool>>,
    ),
  });

  const stream = await agent.stream({
    messages: [
      { role: "system", content: instructions },
      { role: "user", content: content ?? "" },
    ],
  });

  for await (const chunk of stream.toUIMessageStream()) {
    parent.send({ type: "agent.UIMessageStream", chunk, name });
    parent.send({ type: `agent.${name}.UIMessageStream`, chunk, name });
  }

  const text = await stream.text;

  const message: AgentMessage = {
    role: "assistant",
    content: [{ type: "text", value: text }],
  };

  parent.send({ type: "agent.done", name, ...message });
  parent.send({ type: `agent.${name}.done`, name, ...message });

  return message;
};

type EventCallback = (event: Record<string, unknown>) => void;

export const fromWorkflow = ({
  name,
  tools = [],
  model,
  instructions,
  prompt,
  next,
}: AgentConfig) => {
  const listeners: Record<string, EventCallback[]> = {};

  const send = (event: Record<string, unknown>) => {
    const type = event.type as string;
    if (type in listeners) {
      listeners[type].forEach((callback) => callback(event));
    }
  };

  return {
    async start() {
      let result = await buildAgentActor(
        { name, tools, model, instructions, prompt },
        { input: { prompt: prompt ?? "", parent: { send } } },
      );

      if (next) {
        result = await buildAgentActor(next, {
          input: { prompt: result.content[0].value, parent: { send } },
        });
      }

      send({ type: "final", name: "workflow", ...result });
    },
    on(type: string, callback: EventCallback) {
      if (type in listeners) {
        listeners[type].push(callback);
      } else {
        listeners[type] = [callback];
      }
    },
    off(type: string, callback: EventCallback) {
      if (type in listeners) {
        listeners[type] = listeners[type].filter((c) => c !== callback);
      }
    },
  };
};
