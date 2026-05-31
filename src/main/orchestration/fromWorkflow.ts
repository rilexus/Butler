import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { readUIMessageStream, tool, ToolLoopAgent } from "ai";
import z from "zod";
import { Provider } from "../store";

interface AgentConfig {
  name: string;
  provider: Provider;
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
  { name, provider, instructions, prompt, tools = [] }: AgentConfig,
  { input }: { input: AgentInput },
): Promise<AgentMessage> => {
  const { model: modelName } = provider;
  const { prompt: initialPrompt, parent } = input;

  const content = initialPrompt ?? prompt;

  parent.send({ type: "agent.active", name, prompt: content, instructions });
  parent.send({
    type: `agent.${name}.active`,
    name,
    prompt: content,
    instructions,
  });

  const providerClient = createOpenAICompatible({
    name,
    headers: { Authorization: `Bearer ${provider.apiKey ?? "lm-studio"}` },
    baseURL: provider.url ?? "http://127.0.0.1:1234/v1",
  });

  const agent = new ToolLoopAgent({
    model: providerClient(modelName),
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

  let lastUIMessage: any = null;
  for await (const uiMsg of readUIMessageStream({
    stream: stream.toUIMessageStream(),
  })) {
    lastUIMessage = uiMsg;
    parent.send({ type: "agent.UIMessageStream", message: uiMsg, name });
    parent.send({ type: `agent.${name}.UIMessageStream`, message: uiMsg, name });
  }

  const text: string = (lastUIMessage?.parts ?? [])
    .filter((p: any) => p.type === "text")
    .map((p: any) => p.text ?? "")
    .join("");

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
  provider,
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
        { name, tools, provider, instructions, prompt },
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
