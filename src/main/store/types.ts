export type AgentFinishEvent = {
  actions: Record<string, unknown>;
  targets: string[];
};

export type AgentEvents = {
  finish: AgentFinishEvent;
};

export type Agent = {
  name: string;
  instructions: string;
  model: string;
  url: string;
  tools: string[];
  on: AgentEvents;
};

export type Orchestra = {
  id: string;
  initial: string;
  prompt: string;
  context: Record<string, unknown>;
  agents: Record<string, Agent>;
};
