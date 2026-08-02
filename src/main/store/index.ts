import ElectronStore from "electron-store";

interface TextPart {
  type: "text";
  text: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  parts: TextPart[];
}

interface AgentRef {
  id: number;
}

interface WorkflowRef {
  id: number;
}

interface Session {
  id: number;
  name: string;
  agent: AgentRef;
  workflow: WorkflowRef;
  messages: Message[];
}

type WorkflowNodeId = string;

interface WorkflowNode {
  id: WorkflowNodeId;
  name: string;
  role?: "agent" | "subagent";
  type?: "start" | "final";
  description?: string;
  modelName: string;
  instructions?: string;
  model?: string;
  url?: string;
  tools?: string[];
  providerId?: string;
}

interface WorkflowEdge {
  id: string;
  from: string;
  type: "subagent" | "next";
  to: string;
}

interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface Agent {
  id?: number;
  name: string;
  description?: string;
  instructions?: string;
  model?: string;
  url?: string;
  apiKey?: string;
  tools?: string[];
  providerId?: string;
}

export interface Provider {
  id: string;
  active: boolean;
  name: string;
  model: string;
  type: string;
  apiKey: string;
  url: string;
}

interface Assistant {
  id: string;
  name: string;
  icon: string;
  providerId: string;
  systemPrompt: string;
}

export interface McpServer {
  id: string;
  name: string;
  command: string;
  args: string[];
  enabled: boolean;
}

export interface StoreSchema {
  apiKey: string;
  conversations: unknown[];
  settings: { theme: "light" | "dark" };
  active: Record<string, unknown>;
  selectedSession: number;
  sessions: Session[];
  activeWorkflows: Record<string, unknown>;
  workflows: Workflow[];
  agentsLibrary: Agent[];
  agents: Agent[];
  providers: Provider[];
  assistants: Assistant[];
  mcpServers: McpServer[];
}

const model9b = "qwen3.5-9b-uncensored-hauhaucs-aggressive";
const model7b = "qwen2.5-7b-instruct-uncensored";
const model = model9b;
const url = "http://127.0.0.1:1234/v1";

const store = new ElectronStore<StoreSchema>({
  defaults: {
    apiKey: "",
    conversations: [],
    settings: {
      theme: "light",
    },

    active: {},
    selectedSession: 1,
    sessions: [
      {
        id: 1,
        name: "Some",
        agent: { id: 1 },
        workflow: { id: null },
        messages: [
          {
            role: "user",
            parts: [{ type: "text", text: "Some" }],
          },
        ],
      },
      {
        id: 2,
        name: "More",
        agent: { id: 1 },
        workflow: { id: null },
        messages: [
          {
            role: "user",
            parts: [{ type: "text", text: "More" }],
          },
        ],
      },
      {
        id: 3,
        name: "Dropdown",
        workflow: { id: null },
        agent: { id: 5 },
        messages: [],
      },

      {
        id: 1,
        name: "Some",
        workflow: { id: "poem-1" },
        agent: { id: null },
        messages: [],
      },
    ],
    activeWorkflows: {},
    workflows: [
      {
        id: "counter",
        name: "counter",
        nodes: [
          {
            id: "counter-1",
            modelName: '"qwen3.5-4b"',
            name: "plus one 1",
            role: "agent",
            type: "start",
            description: "Countes +1",
            instructions:
              "You will be given a number. Add 1 (one) to it. Return only the result.",
            providerId: "1",
            tools: [],
          },
          {
            id: "counter-2",
            modelName: '"qwen3.5-4b"',
            name: "plus one 2",
            role: "agent",
            description: "Countes +1",
            instructions:
              "You will be given a number. Add 1 (one) to it. Return only the result.",
            providerId: "1",
            tools: [],
          },
          {
            id: "counter-3",
            modelName: '"qwen3.5-4b"',
            name: "plus one 3",
            role: "agent",
            description: "Countes +1",
            instructions:
              "You will be given a number. Add 1 (one) to it. Return only the result.",
            providerId: "1",
            tools: [],
          },
          {
            id: "counter-4",
            modelName: '"qwen3.5-4b"',
            name: "Sum",
            type: "final",
            role: "agent",
            description: "Countes +1",
            instructions:
              "You will be given multiple numbers. Sum them up. Return only the result.",
            providerId: "1",
            tools: [],
          },
        ],
        edges: [
          {
            id: "edge-1",
            type: "next",
            from: "counter-1",
            to: "counter-2",
          },
          {
            id: "edge-2",
            type: "next",
            from: "counter-1",
            to: "counter-3",
          },
          {
            id: "edge-3",
            type: "next",
            from: "counter-3",
            to: "counter-4",
          },
          {
            id: "edge-4",
            type: "next",
            from: "counter-2",
            to: "counter-4",
          },
        ],
      },
      {
        id: "poem-1",
        name: "poem",
        nodes: [
          {
            id: "poem-1",
            modelName: '"qwen3.5-4b"',
            name: "poemWriter",
            role: "agent",
            type: "start",
            description: "Writes a short poem.",
            instructions: `You write a short, 10 lines max peom about the topic user ask you to write about. The poem should have a title and a rhyme scheme.`,
            providerId: "1",
            tools: [],
          },
          {
            id: "word-remover-1",
            name: "wordRemover",
            modelName: '"qwen3.5-4b"',
            role: "agent",
            type: "final",
            description: 'Replace "wolf" with "banana."',
            instructions:
              'You receive a text and replace every occurance of the word "wolf" with "banana".',
            providerId: "1",
          },
          {
            id: "some-1",
            role: "subagent",
            modelName: '"qwen3.5-4b"',
            instructions: `You write a short, 10 lines max peom about the topic user ask you to write about. The poem should have a title and a rhyme scheme.`,
            name: "some",
            tools: [],
            providerId: "1",
          },
        ],
        edges: [
          {
            id: "edge-1",
            from: "poem-1",
            type: "next",
            to: "word-remover-1",
          },
          {
            id: "edge-2",
            from: "poem-1",
            type: "subagent",
            to: "some-1",
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
        model,
        url,
      },
    ],
    agents: [
      {
        id: 1,
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
        providerId: "1",
      },
      {
        id: 2,
        name: "wordRemover",
        description: 'Replace "wolf" with "banana."',
        instructions:
          'You receive a text and replace every occurance of the word "wolf" with "banana".',
        providerId: "1",
      },
      {
        name: "poemWriter",
        description: "Writes a short poem.",
        instructions: `You write a short peom about the topic user ask you to write about. The poem should have a title and a rhyme scheme.`,
        providerId: "1",
      },
      {
        id: 3,
        name: "addSix",
        description: "Increment the given number by 6",
        instructions:
          "You receive one number and you increment it by 6. Return only the resulting number. No other text.",
        providerId: "1",
      },
      {
        id: 4,
        name: "addFive",
        description: "Increment the given number by 5",
        instructions:
          "You receive one number and you increment it by 3. Return only the resulting number. No other text.",
        providerId: "1",
      },
      {
        id: 5,
        name: "UI Interface Generator",
        tools: ["generate-ui"],
        description: "Generates UI based on a prompt",
        instructions:
          "You extract feature requiraments for web interfaces from the user prompt and generate web interfaces by using the extracted feature requiraments by calling the available tools with the requiraments as an argument.",
        providerId: "1",
      },
    ],
    providers: [
      {
        id: "1",
        active: true,
        name: "LM Studio - 4B",
        type: "antropic",
        model: "qwen3.5-4b",
        url: "http://127.0.0.1:1234/v1",
        apiKey: "sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X",
      },
      {
        id: "2",
        active: true,
        name: "OpenAI",
        type: "open-ai",
        apiKey: "",
        model: "qwen2.5-coder-3b-instruct",
        url: "http://127.0.0.1:1234/v1",
      },

      {
        id: "3",
        active: true,
        name: "Antropic",
        type: "antropic",
        model: "qwen2.5-coder-3b-instruct",
        url: "http://127.0.0.1:1234/v1",
        apiKey: "",
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
    mcpServers: [],
  },
});

export function getStoreSnapshot(): StoreSchema;
export function getStoreSnapshot<T>(selector: (state: StoreSchema) => T): T;
export function getStoreSnapshot<T>(
  selector?: (state: StoreSchema) => T,
): StoreSchema | T {
  const state = JSON.parse(JSON.stringify(store.store)) as StoreSchema;
  if (typeof selector === "function") return selector(state);
  return state;
}

export const setToStore = (
  key: keyof StoreSchema | null | undefined,
  val: unknown,
): ElectronStore<StoreSchema> => {
  if (key) {
    store.set(key, val as StoreSchema[typeof key]);
  } else {
    store.store = val as StoreSchema;
  }
  return store;
};

store.clear();

export default store;
