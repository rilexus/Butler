export type WorkflowNodeDef = {
  id: string;
  name: string;
  role?: "agent" | "tool";
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
};
export type Workflow = {
  name: string;
  nodes: WorkflowNodeDef[];
  edges: WorkflowEdgeDef[];
  agents: WorkflowAgentDef[];
};
