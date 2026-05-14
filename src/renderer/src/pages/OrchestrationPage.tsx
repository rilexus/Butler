import React, { CSSProperties, useEffect, useMemo, useState } from "react";
import { useStore } from "../../../main/store/hooks/useStore";
import Canvas from "../components/Canvas";
import { Flex } from "../ui/Flex";

type WorkflowNode = {
  name: string;
  tools?: WorkflowNode[];
  next?: WorkflowNode;
};

const NODE_W = 120;
const NODE_H = 50;
const H_GAP = 60;
const V_GAP = 120;
const CHAIN_GAP = 80;
const LAYER_ID = "lyr_main";

function subtreeWidth(node: WorkflowNode): number {
  const tools = node.tools ?? [];
  if (tools.length === 0) return NODE_W;
  const childrenTotal = tools.reduce(
    (sum, child, i) => sum + subtreeWidth(child) + (i > 0 ? H_GAP : 0),
    0,
  );
  return Math.max(NODE_W, childrenTotal);
}

function assignPositions(
  node: WorkflowNode,
  positions: Map<string, { x: number; y: number }>,
  offsetX: number,
  offsetY: number,
) {
  const sw = subtreeWidth(node);
  positions.set(node.name, { x: offsetX + sw / 2 - NODE_W / 2, y: offsetY });

  let childX = offsetX;
  for (const child of node.tools ?? []) {
    const cw = subtreeWidth(child);
    assignPositions(child, positions, childX, offsetY + NODE_H + V_GAP);
    childX += cw + H_GAP;
  }

  if (node.next) {
    assignPositions(node.next, positions, offsetX + sw + CHAIN_GAP, offsetY);
  }
}

function collectNodes(node: WorkflowNode, out: Map<string, WorkflowNode>) {
  out.set(node.name, node);
  for (const child of node.tools ?? []) collectNodes(child, out);
  if (node.next) collectNodes(node.next, out);
}

function deriveCanvas(workflow: WorkflowNode) {
  const nodeMap = new Map<string, WorkflowNode>();
  collectNodes(workflow, nodeMap);

  const positions = new Map<string, { x: number; y: number }>();
  assignPositions(workflow, positions, 100, 100);

  const nodes: Record<string, object> = {};
  for (const [name, pos] of positions) {
    const id = `node_${name}`;
    const hasTools = (nodeMap.get(name)?.tools?.length ?? 0) > 0;
    nodes[id] = {
      id,
      type: "rectangle",
      position: pos,
      size: { width: NODE_W, height: NODE_H },
      rotation: 0,
      style: {
        fill: "#fff",
        stroke: hasTools ? "#3b82f6" : "#ccc",
        strokeWidth: hasTools ? 2 : 1.5,
        opacity: 1,
        borderRadius: 8,
        fontSize: 13,
        fontColor: "#333",
        label: name,
        labelPosition: "center",
      },
      data: { name },
      ports: [
        { id: `${id}_top`, nodeId: id, position: "top", direction: "in" },
        { id: `${id}_bottom`, nodeId: id, position: "bottom", direction: "out" },
        { id: `${id}_right`, nodeId: id, position: "right", direction: "out" },
        { id: `${id}_left`, nodeId: id, position: "left", direction: "in" },
      ],
      layerId: LAYER_ID,
      zIndex: 1,
      locked: false,
      visible: true,
    };
  }

  const edges: Record<string, object> = {};
  let edgeIdx = 0;
  for (const [name, wfNode] of nodeMap) {
    for (const tool of wfNode.tools ?? []) {
      const srcId = `node_${name}`;
      const tgtId = `node_${tool.name}`;
      const srcPos = positions.get(name);
      const tgtPos = positions.get(tool.name);
      if (!srcPos || !tgtPos) continue;

      const srcCx = srcPos.x + NODE_W / 2;
      const tgtCx = tgtPos.x + NODE_W / 2;

      const edgeId = `edge_${edgeIdx++}`;
      edges[edgeId] = {
        id: edgeId,
        source: { nodeId: srcId, portId: `${srcId}_bottom` },
        target: { nodeId: tgtId, portId: `${tgtId}_top` },
        type: "straight",
        waypoints: [
          { x: srcCx, y: srcPos.y + NODE_H },
          { x: tgtCx, y: tgtPos.y },
        ],
        style: {
          stroke: "#94a3b8",
          strokeWidth: 1,
          opacity: 0.7,
          endMarker: "arrow",
        },
        layerId: LAYER_ID,
        zIndex: 0,
      };
    }

    if (wfNode.next) {
      const srcId = `node_${name}`;
      const tgtId = `node_${wfNode.next.name}`;
      const srcPos = positions.get(name);
      const tgtPos = positions.get(wfNode.next.name);
      if (srcPos && tgtPos) {
        const edgeId = `edge_${edgeIdx++}`;
        edges[edgeId] = {
          id: edgeId,
          source: { nodeId: srcId, portId: `${srcId}_right` },
          target: { nodeId: tgtId, portId: `${tgtId}_left` },
          type: "straight",
          waypoints: [
            { x: srcPos.x + NODE_W, y: srcPos.y + NODE_H / 2 },
            { x: tgtPos.x, y: tgtPos.y + NODE_H / 2 },
          ],
          style: {
            stroke: "#6366f1",
            strokeWidth: 2,
            opacity: 0.85,
            endMarker: "arrow",
          },
          layerId: LAYER_ID,
          zIndex: 0,
        };
      }
    }
  }

  return {
    metadata: { id: "cvs_workflow", name: workflow.name },
    viewport: { x: 0, y: 0, zoom: 1, width: 1440, height: 900 },
    layers: [
      {
        id: LAYER_ID,
        name: "main",
        visible: true,
        locked: false,
        opacity: 1,
        order: 0,
      },
    ],
    nodes,
    edges,
    history: { maxSize: 100, past: [], future: [] },
  };
}

const CanvasNode = ({
  node,
  selected,
  onSelect,
  active,
}: {
  active: boolean;
  node: Node;
  selected: boolean;
  onSelect: (id: string) => void;
}) => {
  const { x, y } = node.position;
  const { width, height } = node.size;
  const s = node.style;

  return (
    <g
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
    >
      {active && (
        <rect
          x={x - 6}
          y={y - 6}
          width={width + 12}
          height={height + 12}
          rx={(s.borderRadius ?? 0) + 6}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2}
        >
          <animate
            attributeName="opacity"
            values="0.7;0;0.7"
            dur="2s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          />
          <animate
            attributeName="stroke-width"
            values="2;5;2"
            dur="1s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          />
        </rect>
      )}
      {selected && (
        <rect
          x={x - 3}
          y={y - 3}
          width={width + 6}
          height={height + 6}
          rx={(s.borderRadius ?? 0) + 3}
          fill="none"
          stroke="#4F46E5"
          strokeWidth={1.5}
          strokeDasharray="4 2"
        />
      )}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={s.borderRadius ?? 0}
        fill={s.fill}
        stroke={s.stroke}
        strokeWidth={s.strokeWidth}
        opacity={s.opacity}
      />
      {s.label && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={s.fontSize ?? 14}
          fill={s.fontColor ?? "#000"}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight={500}
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {s.label}
        </text>
      )}
      {node.ports.map((port) => {
        const p = getPortCenter(node, port.id);
        return (
          <circle
            key={port.id}
            cx={p.x}
            cy={p.y}
            r={4}
            fill="#fff"
            stroke={s.stroke}
            strokeWidth={1}
            style={{ pointerEvents: "none" }}
          />
        );
      })}
    </g>
  );
};

const CanvasEdge = ({ edge, active }: { edge: Edge; active?: boolean }) => {
  const s = edge.style;
  const pts = edge.waypoints;
  if (pts.length === 0) return null;

  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const midIdx = Math.max(1, Math.floor(pts.length / 2));
  const labelPt = {
    x: (pts[midIdx - 1].x + pts[midIdx].x) / 2,
    y: (pts[midIdx - 1].y + pts[midIdx].y) / 2,
  };

  const markerId = `arrow-${edge.id}`;
  const activeMarkerId = `arrow-active-${edge.id}`;

  return (
    <g>
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <path d="M 0 0 L 9 3.5 L 0 7 Z" fill={s.stroke} opacity={s.opacity} />
        </marker>
        {active && (
          <marker
            id={activeMarkerId}
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <path d="M 0 0 L 9 3.5 L 0 7 Z" fill="#22c55e" opacity={1} />
          </marker>
        )}
      </defs>
      {/* wider invisible stroke for easier hover/click targeting */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={12} />
      <path
        d={d}
        fill="none"
        stroke={s.stroke}
        strokeWidth={s.strokeWidth}
        strokeDasharray={s.strokeDash?.join(" ")}
        opacity={s.opacity}
        markerEnd={s.endMarker === "arrow" ? `url(#${markerId})` : undefined}
        markerStart={
          s.startMarker === "arrow" ? `url(#${markerId})` : undefined
        }
      />
      {active && (
        <path
          d={d}
          fill="none"
          stroke="#22c55e"
          strokeWidth={s.strokeWidth + 0.5}
          strokeDasharray="10 14"
          opacity={1}
          markerEnd={
            s.endMarker === "arrow" ? `url(#${activeMarkerId})` : undefined
          }
        >
          <animate
            attributeName="stroke-dashoffset"
            values="24;0"
            dur="0.9s"
            repeatCount="indefinite"
            calcMode="linear"
          />
        </path>
      )}
      {edge.label && (
        <text
          x={labelPt.x}
          y={labelPt.y - 7}
          textAnchor="middle"
          fontSize={11}
          fill="#6B6967"
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {edge.label}
        </text>
      )}
    </g>
  );
};

type EdgeType = "straight" | "bezier" | "orthogonal" | "curved";
type Point = { x: number; y: number };

interface Edge {
  id: string;
  source: EdgeEndpoint;
  target: EdgeEndpoint;
  type: EdgeType;
  waypoints: Point[]; // intermediate routing points
  style: EdgeStyle;
  label?: string;
  layerId: string;
  zIndex: number;
}

interface EdgeEndpoint {
  nodeId?: string; // undefined = floating/unattached
  portId?: string;
  position?: Point; // used when nodeId is absent
}

interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  strokeDash?: number[];
  startMarker?: "none" | "arrow" | "circle" | "diamond";
  endMarker?: "none" | "arrow" | "circle" | "diamond";
  opacity: number;
}

function getPortCenter(node: Node, portId: string): Point {
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
      agentName,
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
    start() {
      window.ipc.send("workflow:start", { name: "default" });
    },
  };
};

const Chat = ({ messages }) => {
  return (
    <div
      style={{
        maxWidth: "30%",
        background: "white",
      }}
    >
      <Flex
        direction="column"
        style={{ height: "100%" }}
        justify={"space-between"}
      >
        <div>
          {messages.map((msg, i) => {
            return (
              <div key={i}>
                {msg.parts.map((part, i) => {
                  if (part.type === "text") {
                    return <p key={i}>{part.text}</p>;
                  }
                  return null;
                })}
              </div>
            );
          })}
        </div>
        <div>
          <input type="text" />
        </div>
      </Flex>
    </div>
  );
};

const AgentList = ({ agents }: { agents: Record<string, { description?: string }> }) => {
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

export default function OrchestrationPage() {
  const [store, set] = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { messages, start } = useFlow();

  const workflow = store.workflows.default;
  const active = store.active;
  const agents = store.agents ?? {};

  const derivedCanvas = useMemo(() => deriveCanvas(workflow), [workflow]);

  const nodes = Object.values(
    derivedCanvas.nodes as unknown as Record<string, Node>,
  );

  const edges = Object.values(
    derivedCanvas.edges as unknown as Record<string, Edge>,
  );

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      <button
        onClick={() => {
          start();
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
            const name = node.data.name;
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
              />
            );
          })}
        </Canvas>

        <Chat messages={messages} />
      </Flex>
    </div>
  );
}
