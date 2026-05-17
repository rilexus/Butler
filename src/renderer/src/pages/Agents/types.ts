export type { WorkflowAgentDef } from "../Orchestration/types";

export type AgentSession = {
  id: string | number;
  agent?: { id: string | number | null };
  startedAt: string;
  name?: string;
  messages?: {
    role: "system" | "user" | "assistant";
    parts: { type: string; text?: string; state?: string }[];
    sender?: string;
  }[];
};
