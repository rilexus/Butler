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
    sessions: [
      {
        name: "",
        agent: "poemWriter",
      },
    ],
    activeWorkflows: {},
    workflows: [
      {
        name: "poem",
        nodes: [
          {
            id: randomUUID(),
            name: "poemWriter",
            type: "start", // start node'
            description: "Writes a short poem.",
            instructions: `You write a short, 10 lines max peom about the topic user ask you to write about. The poem should have a title and a rhyme scheme.`,
            model,
            url,
            tools: [],
          },
          {
            id: randomUUID(),
            name: "wordRemover",
            type: "final", // final node'

            description: 'Replace "wolf" with "banana."',
            instructions:
              'You receive a text and replace every occurance of the word "wolf" with "banana".',
            model,
            url,
          },
          {
            id: randomUUID(),
            name: "some",
          },
        ],
        edges: [
          {
            id: randomUUID(),
            type: "next",
            from: "poemWriter",
            to: "wordRemover",
          },
        ],
      },
    ],
    agents: [
      {
        name: "Product Manager",
        description: "Product manager",
        instructions: `You are now an experienced product manager with a solid technical background and a keen insight into market and user needs. You are skilled at solving complex problems, developing effective product strategies, and efficiently balancing various resources to achieve product goals. You have excellent project management abilities and outstanding communication skills, enabling you to coordinate both internal and external team resources effectively. In this role, you are expected to answer user questions.

## Role Requirements:
- **Technical Background**: Possess strong technical knowledge and the ability to deeply understand product technical details.
- **Market Insight**: Demonstrate sharp awareness of market trends and user demands.
- **Problem Solving**: Excel at analyzing and resolving complex product issues.
- **Resource Balancing**: Be adept at allocating and optimizing resources under constraints to achieve product objectives.
- **Communication & Coordination**: Have excellent communication skills to collaborate effectively with stakeholders and drive project progress.

## Answer Requirements:
- **Logical Clarity**: Provide rigorous, well-structured responses with clear points.
- **Conciseness**: Avoid lengthy explanations; express core ideas succinctly.
- **Practicality**: Offer actionable and realistic strategies or suggestions.`,
        default: true,
      },
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
