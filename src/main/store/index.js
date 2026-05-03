import ElectronStore from "electron-store";

const model = "qwen2.5-coder-3b-instruct";

const orchestra = {
  id: "first orchestra",
  initial: "agent1",
  prompt: "1",
  agents: {
    agent1: {
      name: "Agent 1",
      instructions: "Echo given text back to the user by calling a tool.",
      model,
      url: "http://127.0.0.1:1234/v1",
      tools: ["addOne"],
      on: {
        finish: { actions: {}, targets: ["agent2"] },
      },
    },
    agent2: {
      name: "Agent 2",
      type: "parallel",
      agents: {
        agent2_1: {
          name: "Agent 2.1",
          instructions:
            "You get a number and you add 1 to it. Return only the result. No other text.",
          model,
          url: "http://127.0.0.1:1234/v1",
          tools: ["addOne"],
          on: {
            finish: { actions: {}, targets: [] },
          },
        },
        agent2_2: {
          name: "Agent 2.2",
          instructions:
            "You get a number and you add 1 to it. Return only the result. No other text.",
          model,
          url: "http://127.0.0.1:1234/v1",
          tools: ["addOne"],
          on: {
            finish: { actions: {}, targets: [] },
          },
        },
      },
      onDone: {
        targets: ["agent3"],
      },
    },
    agent3: {
      name: "Agent 3",
      instructions:
        "Sum the two given numbers by calling the 'sum' tool. Return only the result. No other text.",

      model,
      url: "http://127.0.0.1:1234/v1",
      tools: ["sum"],
      on: {
        finish: { actions: {}, targets: [] },
      },
    },
  },
};

const store = new ElectronStore({
  defaults: {
    apiKey: "",
    conversations: [],
    settings: {
      theme: "light",
    },
    orchestra: orchestra,
    providers: [
      {
        id: "1",
        active: true,
        name: "Lm Studio",
        url: "",
        apiKey: "sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X",
        models: [
          {
            id: "1",
            name: "qwen2.5-coder-3b-instruct",
          },
        ],
        headers: {},
      },
    ],
    assistants: [
      {
        id: "1",
        name: "Some",
        icon: "",
        providerId: "1",
        systemPrompt: "",
      },
    ],
  },
});

export const getStoreSnapshot = () => JSON.parse(JSON.stringify(store.store));

store.clear();

export default store;
