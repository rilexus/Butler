import ElectronStore from "electron-store";

const model9b = "qwen3.5-9b-uncensored-hauhaucs-aggressive";
const model7b = "qwen2.5-7b-instruct-uncensored";

import { randomUUID } from "node:crypto";

const model = model7b;
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
    workflows: [
      {
        name: "poem",
        nodes: [
          {
            id: randomUUID(),
            name: "poemWriter",
            type: "start", // start node'
            agent: "poemWriter",
          },
          {
            id: randomUUID(),
            name: "wordRemover",
            type: "final", // final node'
            agent: "wordRemover",
          },
          {
            id: crypto.randomUUID(),
            name: "some",
            agent: "some",
          },
        ],
        edges: [{ id: randomUUID(), from: "poemWriter", to: "wordRemover" }],
        agents: [
          {
            name: "wordRemover",
            description: 'Replace "wolf" with "banana."',
            instructions:
              'You receive a text and replace every occurance of the word "wolf" with "banana".',
            model,
            url,
          },
          {
            name: "poemWriter",
            description: "Writes a short poem.",
            instructions: `You write a short peom about the topic user ask you to write about. The poem should have a title and a rhyme scheme.`,
            model,
            url,
          },
        ],
      },
    ],
    agents: [
      {
        name: "wordRemover",
        description: 'Replace "wolf" with "banana."',
        instructions:
          'You receive a text and replace every occurance of the word "wolf" with "banana".',
        model,
        url,
      },
      {
        name: "poemWriter",
        description: "Writes a short poem.",
        instructions: `You write a short peom about the topic user ask you to write about. The poem should have a title and a rhyme scheme.`,
        model,
        url,
      },

      {
        name: "addSix",
        model,
        url,
        description: "Increment the given number by 6",
        instructions:
          "You receive one number and you increment it by 6. Return only the resulting number. No other text.",
      },
      {
        name: "addFive",
        model,
        url,
        description: "Increment the given number by 5",
        instructions:
          "You receive one number and you increment it by 3. Return only the resulting number. No other text.",
      },
    ],
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
