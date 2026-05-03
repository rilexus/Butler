import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { ToolLoopAgent } from "ai";

export const createOrchestra = (config) => {
  let provided = {};
  return {
    getConfig() {
      return config;
    },
    provide(values) {
      provided = values;
    },
    getProvided() {
      return provided;
    },
  };
};

export const createConcert = (orchestra) => {
  const listeners = new Map();
  const orchestraConfig = orchestra.getConfig();
  const provided = orchestra.getProvided();

  const emit = (event, data) => {
    const handlers = listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  };

  const createToolLoopAgent = ({ model, instructions, url, tools }) => {
    const lmstudio = createOpenAICompatible({
      name: "lmstudio",
      headers: {
        Authorization: "Bearer sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X",
      },
      baseURL: url,
    });

    return new ToolLoopAgent({
      model: lmstudio(model),
      instructions: instructions,
      headers: {
        Authorization: "Bearer sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X",
      },
      ...(tools ? { tools } : {}),
    });
  };

  const getTarget = (agents, target) => {
    return agents[target];
  };

  const run = async ({
    id,
    model,
    url,
    name,
    instructions,
    on,
    prompt,
    type,
    agents,
    onDone,
    tools,
  }) => {
    const agentTools =
      tools && provided.tools
        ? tools.reduce((acc, name) => {
            if (name in provided.tools) {
              return {
                ...acc,
                [name]: provided.tools[name],
              };
            }
            return acc;
          }, {})
        : {};

    const agent = createToolLoopAgent({
      model,
      url,
      instructions,
      tools: agentTools,
    });
    if (type === "parallel") {
      const results = await Promise.all(
        Object.entries(agents).map(([agentKey, config]) =>
          run({ ...config, id: agentKey, prompt }),
        ),
      );

      if (!onDone || !("targets" in onDone)) return results.join(" ");

      const { targets } = onDone;

      for (const target of targets) {
        const targetAgentConfig = getTarget(orchestraConfig.agents, target);
        if (!targetAgentConfig) break;

        // start target agents here with the text of previous agent
        run({ ...targetAgentConfig, id: target, prompt: results.join(" ") });
      }
    } else {
      const stream = await agent.stream({
        prompt,
      });

      let text = "";
      for await (const chunk of stream.toUIMessageStream()) {
        const { type, delta } = chunk;
        if (type === "text-delta") {
          text += delta;
        }
        const agentAction = on[type];
        if (agentAction) {
          const { actions, targets } = agentAction;
          for (const action in actions) {
            // execute actions here
          }
          for (const target of targets) {
            const targetAgentConfig = getTarget(orchestraConfig.agents, target);
            if (!targetAgentConfig) break;

            // start target agents here with the text of previous agent
            run({ ...targetAgentConfig, id: target, prompt: text });
          }
        }

        emit(`stream`, chunk);
        emit(`stream:${id}`, chunk);
      }

      return text;
    }
  };

  return {
    async start() {
      const initial = orchestraConfig.initial;
      const initialAgentConfig = orchestraConfig.agents[initial];
      const initialPrompt = orchestraConfig.prompt;

      const res = await run({
        ...initialAgentConfig,
        id: initial,
        prompt: initialPrompt,
      });

      console.log({ res });

      return res;
    },
    stop() {},
    subscribe(event, handler) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event).add(handler);
      return () => listeners.get(event).delete(handler);
    },
    unsubscribe(event, handler) {
      listeners.get(event)?.delete(handler);
    },
  };
};
