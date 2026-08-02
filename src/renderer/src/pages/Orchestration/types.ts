export type WorkflowNodeDef = {
  id: string;
  name: string;
  role?: "agent" | "subagent" | "tool";
  type?: "start" | "final";
  agent?: string;
  description?: string;
  instructions?: string;
  model?: string;
  url?: string;
  tools?: string[];
  providerId?: string;
};
export type WorkflowEdgeDef = { from: string; to: string };
export type WorkflowAgentDef = {
  id?: string | number;
  name: string;
  description?: string;
  instructions?: string;
  model?: string;
  url?: string;
  providerId?: string;
  mcpServerIds?: string[];
};
export type Workflow = {
  id: string;
  name: string;
  nodes: WorkflowNodeDef[];
  edges: WorkflowEdgeDef[];
  agents: WorkflowAgentDef[];
};
