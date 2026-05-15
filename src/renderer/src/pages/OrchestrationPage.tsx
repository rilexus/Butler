import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../../../main/store/hooks/useStore";
import Canvas, {
  CanvasEdge,
  CanvasNode,
  deriveCanvas,
  FlowNode,
  Point,
} from "../components/Canvas";
import { Flex } from "../ui/Flex";
import { Chat } from "../components/Chat";

type TextUIPart = { type: "text"; text: string; state?: "streaming" | "done" };
type ReasoningUIPart = {
  type: "reasoning";
  text: string;
  state?: "streaming" | "done";
};
type ToolUIPart = {
  type: `tool-${string}`;
  toolCallId: string;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  input?: unknown;
  output?: unknown;
  errorText?: string;
};
type UIMessagePart = TextUIPart | ReasoningUIPart | ToolUIPart;
type UIMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  parts: UIMessagePart[];
};
type StreamEvent = {
  type: string;
  agentName: string;
  data: {
    id: string;
    type: string;
    delta?: string;
    finishReason?: string;
    toolCallId?: string;
    inputTextDelta?: string;
    toolName?: string;
    input?: unknown;
  };
};

const useFlow = () => {
  const [messages, setMessages] = useState<UIMessage[]>([]);

  useEffect(() => {
    const handleStream = ({
      data: {
        id,
        delta,
        type,
        finishReason,
        toolCallId,
        inputTextDelta,
        toolName,
        input,
      },
    }: StreamEvent) => {
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === id);
        const msg: UIMessage =
          idx !== -1
            ? { ...prev[idx], parts: [...prev[idx].parts] }
            : { id, role: "assistant", parts: [] };

        if (type === "text-delta" && delta != null) {
          const last = msg.parts[msg.parts.length - 1];
          if (last?.type === "text" && last.state === "streaming") {
            msg.parts[msg.parts.length - 1] = {
              ...last,
              text: last.text + delta,
            };
          } else {
            msg.parts.push({ type: "text", text: delta, state: "streaming" });
          }
        } else if (type === "reasoning-delta" && delta != null) {
          const last = msg.parts[msg.parts.length - 1];
          if (last?.type === "reasoning" && last.state === "streaming") {
            msg.parts[msg.parts.length - 1] = {
              ...last,
              text: last.text + delta,
            };
          } else {
            msg.parts.push({
              type: "reasoning",
              text: delta,
              state: "streaming",
            });
          }
        } else if (
          type === "tool-call-streaming-start" &&
          toolCallId &&
          toolName
        ) {
          msg.parts.push({
            type: `tool-${toolName}`,
            toolCallId,
            state: "input-streaming",
            input: undefined,
          });
        } else if (
          type === "tool-call-delta" &&
          toolCallId &&
          inputTextDelta != null
        ) {
          const ti = msg.parts.findIndex(
            (p) => "toolCallId" in p && p.toolCallId === toolCallId,
          );
          if (ti !== -1) {
            const p = msg.parts[ti] as ToolUIPart;
            msg.parts[ti] = {
              ...p,
              input:
                (typeof p.input === "string" ? p.input : "") + inputTextDelta,
            };
          }
        } else if (type === "tool-call" && toolCallId && toolName) {
          const ti = msg.parts.findIndex(
            (p) => "toolCallId" in p && p.toolCallId === toolCallId,
          );
          const next: ToolUIPart = {
            type: `tool-${toolName}`,
            toolCallId,
            state: "input-available",
            input,
          };
          if (ti !== -1) msg.parts[ti] = next;
          else msg.parts.push(next);
        } else if (type === "tool-result" && toolCallId) {
          const ti = msg.parts.findIndex(
            (p) => "toolCallId" in p && p.toolCallId === toolCallId,
          );
          if (ti !== -1) {
            msg.parts[ti] = {
              ...(msg.parts[ti] as ToolUIPart),
              state: "output-available",
              output: input,
            };
          }
        } else if (finishReason != null) {
          msg.parts = msg.parts.map((p) =>
            "state" in p && p.state === "streaming"
              ? { ...p, state: "done" }
              : p,
          );
        }

        if (idx === -1) return [...prev, msg];
        const updated = [...prev];
        updated[idx] = msg;
        return updated;
      });
    };
    const clean = window.ipc.on("workflow:stream", handleStream);
    return clean;
  }, []);
  return {
    messages,
    start({ name, prompt }) {
      window.ipc.send("workflow:start", {
        name,
        prompt,
      });
    },
  };
};

type AgentFormState = {
  name: string;
  description: string;
  instructions: string;
};

const AgentList = ({
  agents,
  onCreateAgent,
}: {
  agents: Record<string, { description?: string }>;
  onCreateAgent: (
    name: string,
    agent: { description: string; instructions: string },
  ) => void;
}) => {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AgentFormState>({
    name: "",
    description: "",
    instructions: "",
  });

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    onCreateAgent(name, {
      description: form.description,
      instructions: form.instructions,
    });
    setForm({ name: "", description: "", instructions: "" });
    setCreating(false);
  };

  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        background: "#f8f9fa",
        borderRight: "1px solid #e2e8f0",
        overflowY: "auto",
        padding: "12px 0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "0 16px 8px",
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#94a3b8",
        }}
      >
        Agents
      </div>
      {Object.entries(agents).map(([name, agent]) => (
        <div
          key={name}
          style={{
            padding: "8px 16px",
            cursor: "default",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>
            {name}
          </div>
          {agent.description && (
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                marginTop: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {agent.description}
            </div>
          )}
        </div>
      ))}
      {creating ? (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <input
            autoFocus
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #cbd5e1",
              outline: "none",
            }}
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #cbd5e1",
              outline: "none",
            }}
          />
          <textarea
            placeholder="Instructions"
            value={form.instructions}
            onChange={(e) =>
              setForm((f) => ({ ...f, instructions: e.target.value }))
            }
            rows={3}
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #cbd5e1",
              outline: "none",
              resize: "vertical",
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                fontSize: 12,
                padding: "4px 0",
                borderRadius: 4,
                border: "none",
                background: "#3b82f6",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setCreating(false)}
              style={{
                flex: 1,
                fontSize: 12,
                padding: "4px 0",
                borderRadius: 4,
                border: "1px solid #cbd5e1",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setCreating(true)}
          style={{
            margin: "8px 16px 0",
            padding: "6px 0",
            fontSize: 12,
            borderRadius: 4,
            border: "1px dashed #cbd5e1",
            background: "transparent",
            color: "#64748b",
            cursor: "pointer",
          }}
        >
          + Create Agent
        </button>
      )}
    </div>
  );
};

function getPortCenter(node: FlowNode, portId: string): Point {
  const port = node.ports.find((p) => p.id === portId);
  if (!port) return { x: node.position.x, y: node.position.y };
  const { x, y } = node.position;
  const { width, height } = node.size;
  switch (port.position) {
    case "top":
      return { x: x + width / 2, y };
    case "right":
      return { x: x + width, y: y + height / 2 };
    case "bottom":
      return { x: x + width / 2, y: y + height };
    case "left":
      return { x, y: y + height / 2 };
    case "custom":
      return port.offset
        ? { x: x + port.offset.x, y: y + port.offset.y }
        : { x, y };
  }
}

const WorkflowList = ({
  workflows,
  selectedKey,
  onSelect,
  onDelete,
  onCreate,
}: {
  workflows: Record<string, unknown>;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onDelete: (key: string) => void;
  onCreate: (name: string) => void;
}) => {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
    setCreating(false);
  };

  return (
    <div
      style={{
        width: 180,
        flexShrink: 0,
        background: "#f1f5f9",
        borderRight: "1px solid #e2e8f0",
        overflowY: "auto",
        padding: "12px 0",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "0 16px 8px",
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#94a3b8",
        }}
      >
        Workflows
      </div>
      {Object.keys(workflows).map((key) => (
        <div
          key={key}
          onClick={() => onSelect(key)}
          style={{
            padding: "8px 16px",
            cursor: "pointer",
            background: selectedKey === key ? "#e0e7ef" : "transparent",
            borderLeft:
              selectedKey === key
                ? "3px solid #3b82f6"
                : "3px solid transparent",
            fontSize: 13,
            fontWeight: selectedKey === key ? 600 : 400,
            color: selectedKey === key ? "#1e293b" : "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {key}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(key);
            }}
            style={{
              flexShrink: 0,
              marginLeft: 4,
              width: 16,
              height: 16,
              padding: 0,
              border: "none",
              background: "transparent",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: 12,
              lineHeight: 1,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Delete workflow"
          >
            ×
          </button>
        </div>
      ))}
      {creating ? (
        <form
          onSubmit={handleSubmit}
          style={{
            padding: "8px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <input
            autoFocus
            placeholder="Workflow name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid #cbd5e1",
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                fontSize: 12,
                padding: "4px 0",
                borderRadius: 4,
                border: "none",
                background: "#3b82f6",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setName("");
              }}
              style={{
                flex: 1,
                fontSize: 12,
                padding: "4px 0",
                borderRadius: 4,
                border: "1px solid #cbd5e1",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setCreating(true)}
          style={{
            margin: "8px 16px 0",
            padding: "6px 0",
            fontSize: 12,
            borderRadius: 4,
            border: "1px dashed #cbd5e1",
            background: "transparent",
            color: "#64748b",
            cursor: "pointer",
          }}
        >
          + Create Workflow
        </button>
      )}
    </div>
  );
};

type StoreShape = {
  workflows: Record<string, unknown>;
  active: Record<string, { status: string }>;
  agents: Record<
    string,
    { description?: string; model?: string; url?: string }
  >;
};

export default function OrchestrationPage() {
  const [storeRaw, set] = useStore();
  const store = storeRaw as StoreShape;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedWorkflowKey, setSelectedWorkflowKey] = useState<string>(
    () => Object.keys(store.workflows ?? {})[0] ?? "poem",
  );
  const { messages, start } = useFlow();

  const workflows = store.workflows ?? {};
  const workflow = workflows[selectedWorkflowKey].node;
  const active = store.active;
  const agents = workflows[selectedWorkflowKey].agents ?? {};

  const derivedCanvas = useMemo(() => {
    console.log("hier");
    return deriveCanvas(workflow as Parameters<typeof deriveCanvas>[0]);
  }, [workflow]);

  const [nodePositionOverrides, setNodePositionOverrides] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const handleDeleteWorkflow = useCallback(
    (key: string) => {
      set((store) => {
        const { [key]: _, ...rest } =
          store.workflows ?? ({} as Record<string, unknown>);
        return { ...store, workflows: rest };
      });
      setSelectedWorkflowKey((prev) => {
        if (prev !== key) return prev;
        const remaining = Object.keys(workflows).filter((k) => k !== key);
        return remaining[0] ?? "";
      });
    },
    [set, workflows],
  );

  const handleCreateWorkflow = useCallback(
    (name: string) => {
      set((store) => ({
        ...store,
        workflows: {
          ...(store.workflows as Record<string, unknown>),
          [name]: { node: { name: "agent1" }, agents: {} },
        },
      }));
      setSelectedWorkflowKey(name);
    },
    [set],
  );

  const handleCreateAgent = useCallback(
    (name: string, agent: { description: string; instructions: string }) => {
      const existingAgent =
        Object.values(
          agents as Record<string, { model?: string; url?: string }>,
        )[0] ?? {};
      set((store) => ({
        ...store,
        workflows: {
          ...store.workflows,
          [selectedWorkflowKey]: {
            ...store.workflows[selectedWorkflowKey],
            agents: {
              ...store.workflows[selectedWorkflowKey].agents,
              [name]: {
                ...agent,
                model: existingAgent.model,
                url: existingAgent.url,
              },
            },
          },
        },
      }));
    },
    [agents, set],
  );

  const handleNodePositionChange = useCallback(
    (id: string, pos: { x: number; y: number }) => {
      setNodePositionOverrides((prev) => ({ ...prev, [id]: pos }));
    },
    [],
  );

  const nodes = useMemo(
    () =>
      Object.values(
        derivedCanvas.nodes as unknown as Record<string, FlowNode>,
      ).map((node) => ({
        ...node,
        position: nodePositionOverrides[node.id] ?? node.position,
      })),
    [derivedCanvas, nodePositionOverrides],
  );

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const edges = useMemo(
    () =>
      Object.values(derivedCanvas.edges as unknown as Record<string, Edge>).map(
        (edge) => {
          const srcNode = nodeById.get(edge.source.nodeId ?? "");
          const tgtNode = nodeById.get(edge.target.nodeId ?? "");
          if (
            !srcNode ||
            !tgtNode ||
            !edge.source.portId ||
            !edge.target.portId
          )
            return edge;
          return {
            ...edge,
            waypoints: [
              getPortCenter(srcNode, edge.source.portId),
              getPortCenter(tgtNode, edge.target.portId),
            ],
          };
        },
      ),
    [derivedCanvas, nodeById],
  );

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      <Flex style={{ height: "70%" }}>
        <WorkflowList
          workflows={workflows}
          selectedKey={selectedWorkflowKey}
          onSelect={setSelectedWorkflowKey}
          onDelete={handleDeleteWorkflow}
          onCreate={handleCreateWorkflow}
        />
        <AgentList agents={agents} onCreateAgent={handleCreateAgent} />
        <Canvas>
          {edges.map((edge) => (
            <CanvasEdge key={edge.id} edge={edge} active={true} />
          ))}
          {nodes.map((node) => {
            let isActive = false;
            const name = node.data.name as string;
            if (name in active) {
              isActive = active[name].status === "active";
            }

            return (
              <CanvasNode
                key={node.id}
                active={isActive}
                node={node}
                selected={selectedId === node.id}
                onSelect={setSelectedId}
                onPositionChange={handleNodePositionChange}
              />
            );
          })}
        </Canvas>

        <Chat
          messages={messages}
          onSubmit={(prompt) => {
            start({
              name: "poem",
              prompt,
            });
          }}
        />
      </Flex>
    </div>
  );
}
