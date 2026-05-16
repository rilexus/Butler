export type WorkflowNodeDef = {
  name: string;
  agent: string;
  description?: string;
  instructions?: string;
  model?: string;
  url?: string;
};
export type WorkflowEdgeDef = { from: string; to: string };
export type WorkflowAgentDef = {
  name: string;
  description?: string;
  instructions?: string;
  model?: string;
  url?: string;
};
export type Workflow = {
  name: string;
  nodes: WorkflowNodeDef[];
  edges: WorkflowEdgeDef[];
  agents: WorkflowAgentDef[];
};
