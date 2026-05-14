import ElectronStore from "electron-store";

const model = "qwen2.5-7b-instruct-uncensored";
const url = "http://127.0.0.1:1234/v1";

const orchestra = {
  id: "first orchestra",
  initial: "agent1",
  prompt: "1",
};

const store = new ElectronStore({
  defaults: {
    apiKey: "",
    conversations: [],
    settings: {
      theme: "light",
    },
    active: {},
    activeWorkflows: {},
    workflows: {
      default: {
        name: "echo",
        next: {
          name: "manager",
          tools: [
            { name: "addThree" },
            {
              name: "addTwo",
              tools: [{ name: "addOne" }],
            },
          ],
        },
      },
    },
    agents: {
      manager: {
        description: "Delegates tasks to other AI agents.",

        instructions: `Your mission is to delegate tasks to other AI agents via tool calls.
        You must delegate tasks to other AI agents based on their expertise.
        You must coordinate actions using the tools available.
        You must start by creating a detailed execution plan to accomplish the goal.
        Each tool must be invoked once and only once, in the appropriate sequence based on your execution plan.
        Only one tool must be called at a time.
        Do not invoke the next tool until the previous has returned a result.
        `,

        model,
        url,
      },
      echo: {
        model,
        url,
        description: "Echo given input to the user.",
        instructions:
          "Echo back whatever is provided to you. Do not modify or alter the input in any way.",
        prompt:
          "Increment from 0 to the number 5 by calling tools. Do not go heigher! Return only the resulting number. No other text.",
      },
      addTwo: {
        model,
        url,
        description: "Increment the given number by 2",
        instructions:
          "You receive one number and you increment it by 2. Use tools! Return only the resulting number. No other text.",
      },
      addThree: {
        model,
        url,
        description: "Increment the given number by 3",
        instructions:
          "You receive one number and you increment it by 3. Return only the resulting number. No other text.",
      },
      addSix: {
        model,
        url,
        description: "Increment the given number by 6",
        instructions:
          "You receive one number and you increment it by 6. Return only the resulting number. No other text.",
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
    },
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

export const getStoreSnapshot = (seletor) => {
  const state = JSON.parse(JSON.stringify(store.store));

  if (typeof seletor === "function") {
    return seletor(state);
  }
  return state;
};

export const setToStore = (key, val) => {
  key ? store.set(key, val) : (store.store = val);
  return store;
};

store.clear();

export default store;
