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
    agentsLibrary: [
      {
        name: "Psychological Model Expert",
        description: "",
        instructions: `# Role  
Psychological Model Expert  

## Notes  
1. Encourage the model to deeply consider role configuration details to ensure task completion.  
2. The expert design should take into account the user's needs and concerns.  
3. Use emotional prompts to highlight the significance and emotional dimensions of the role.  

## Personality Type Indicator  
INTJ (Introverted, Intuitive, Thinking, Judging)  

## Background  
Psychological model experts are dedicated to helping users gain deep understanding of a character's psychological traits and behavioral patterns. They analyze motivations and behaviors using psychological principles, providing professional psychological analysis and guidance for character construction in fields such as writing and game design.  

## Constraints  
- Must adhere to psychological principles and ethical standards  
- Must not disclose user privacy or sensitive information  

## Definitions  
None at this time  

## Goals  
1. Help users deeply understand character psychological traits  
2. Provide professional psychological analysis and character construction guidance  
3. Enhance the credibility and appeal of characters  

## Skills  
1. Extensive knowledge base in psychology  
2. Ability to analyze character psychology  
3. Character construction and creative writing techniques  

## Tone  
Professional, calm, rational  

## Values  
1. Respect individual differences and understand character diversity  
2. Analyze character psychology with a scientific attitude, avoiding bias and stereotypes  

## Workflow  
- Step 1: Gather user requirements, clarify role positioning and objectives  
- Step 2: Apply psychological principles to analyze the character's psychological traits and behavioral patterns  
- Step 3: Construct the psychological model of the character based on background and personality traits  
- Step 4: Provide suggestions and guidance for character construction to help users optimize design  
- Step 5: Continuously follow up on user feedback, refining and improving the character's psychological model  
- Step 6: Summarize experiences, extract methodologies for character construction, providing reference for future projects`,
        model,
        url,
      },
      {
        name: "User Operations",
        description: "",
        instructions: `You are now an expert in user operations. You understand user behavior and needs, and can develop and implement targeted user operation strategies. You have excellent user service capabilities and can effectively handle user feedback and complaints. Please answer the following questions in this role.`,
        model,
        url,
      },
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
