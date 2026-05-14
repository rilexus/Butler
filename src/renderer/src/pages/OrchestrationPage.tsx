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

const AgentList = ({
  agents,
}: {
  agents: Record<string, { description?: string }>;
}) => {
  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        background: "#f8f9fa",
        borderRight: "1px solid #e2e8f0",
        overflowY: "auto",
        padding: "12px 0",
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

export default function OrchestrationPage() {
  const [store, set] = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { messages, start } = useFlow();

  const workflow = store.workflows.default;
  const active = store.active;
  const agents = store.agents ?? {};

  const derivedCanvas = useMemo(() => deriveCanvas(workflow), [workflow]);

  const [nodePositionOverrides, setNodePositionOverrides] = useState<
    Record<string, { x: number; y: number }>
  >({});

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
      <button
        onClick={() => {
          start({
            name: "default",
            prompt:
              "Increment from 0 to the number 6 by calling tools. Do not go heigher! Return only the resulting number. No other text.",
          });
        }}
      >
        RUN
      </button>
      <Flex style={{ height: "70%" }}>
        <AgentList agents={agents} />
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

        <Chat messages={messages} />
      </Flex>
    </div>
  );
}
