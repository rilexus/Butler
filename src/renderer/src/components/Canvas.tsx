import { createContext, useContext, useRef, useState } from "react";

export const CanvasViewportContext = createContext({ x: 60, y: 60, zoom: 1 });

interface Viewport {
  x: number; // pan offset
  y: number;
  zoom: number; // scale factor, e.g. 1.0 = 100%
  width: number; // visible area dimensions
  height: number;
}
interface Group {
  id: string;
  nodeIds: string[];
  label?: string;
  collapsed: boolean;
  style: Partial<NodeStyle>;
}

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number;
}

interface HistoryStack {
  past: Command[];
  future: Command[];
  maxSize: number; // e.g. 100 steps
}

interface Command {
  type: string; // "ADD_NODE" | "MOVE_NODE" | "DELETE_EDGE" | etc.
  timestamp: number;
  apply: () => void;
  undo: () => void;
}

type WorkflowNode = {
  name: string;
  tools?: WorkflowNode[];
  next?: WorkflowNode;
};

export type FlowNode = {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    opacity: number;
    borderRadius?: number;
    fontSize?: number;
    fontColor?: string;
    label?: string;
    labelPosition?: string;
  };
  data: Record<string, unknown>;
  ports: Port[];
  layerId: string;
  zIndex: number;
  locked: boolean;
  visible: boolean;
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

export function deriveCanvas(workflow: WorkflowNode) {
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
        {
          id: `${id}_bottom`,
          nodeId: id,
          position: "bottom",
          direction: "out",
        },
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

type EdgeType = "straight" | "bezier" | "orthogonal" | "curved";
export type Point = { x: number; y: number };

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

interface Canvas {
  id: string;
  name: string;
  viewport: Viewport;
  nodes: Map<string, Node>;
  edges: Map<string, Edge>;
  groups: Map<string, Group>;
  layers: Layer[];
  activeLayerId: string;
  history: HistoryStack;
  metadata: Record<string, unknown>;
}

type NodeType =
  | "rectangle"
  | "ellipse"
  | "diamond"
  | "text"
  | "image"
  | "custom";

type Size = { width: number; height: number };

interface Node {
  id: string;
  type: NodeType; //
  position: Point; // { x, y } — top-left corner
  size: Size; // { width, height }
  rotation: number; // degrees
  style: NodeStyle;
  data: Record<string, unknown>; // user-defined payload
  ports: Port[]; // connection points
  layerId: string;
  groupId?: string;
  zIndex: number;
  locked: boolean;
  visible: boolean;
}

interface NodeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  borderRadius?: number;
  fontSize?: number;
  fontColor?: string;
  label?: string;
  labelPosition?: "center" | "top" | "bottom";
}

interface Port {
  id: string;
  nodeId: string;
  position: "top" | "right" | "bottom" | "left" | "custom";
  offset?: Point; // for custom positions
  direction?: "in" | "out" | "both";
}

export const CanvasNode = ({
  node,
  selected,
  onSelect,
  active,
  onPositionChange,
}: {
  active: boolean;
  node: FlowNode;
  selected: boolean;
  onSelect: (id: string) => void;
  onPositionChange?: (id: string, pos: { x: number; y: number }) => void;
}) => {
  const { zoom } = useContext(CanvasViewportContext);
  const { x, y } = node.position;
  const { width, height } = node.size;
  const s = node.style;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const startX = node.position.x;
    const startY = node.position.y;
    const startScreenX = e.clientX;
    const startScreenY = e.clientY;
    const capturedZoom = zoom;
    let moved = false;

    const onMove = (me: MouseEvent) => {
      const dx = (me.clientX - startScreenX) / capturedZoom;
      const dy = (me.clientY - startScreenY) / capturedZoom;
      if (!moved && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        moved = true;
        document.body.style.cursor = "grabbing";
      }
      if (moved)
        onPositionChange?.(node.id, { x: startX + dx, y: startY + dy });
    };

    const onUp = () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (!moved) onSelect(node.id);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <g style={{ cursor: "grab" }} onMouseDown={handleMouseDown}>
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

export const CanvasEdge = ({
  edge,
  active,
}: {
  edge: Edge;
  active?: boolean;
}) => {
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

const Canvas = ({ children }) => {
  const [vp, setVp] = useState({ x: 60, y: 60, zoom: 1 });

  const panning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    panning.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!panning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setVp((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUp = () => {
    panning.current = false;
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const ox = e.nativeEvent.offsetX;
    const oy = e.nativeEvent.offsetY;
    setVp((prev) => {
      const newZoom = Math.max(0.15, Math.min(5, prev.zoom * factor));
      const r = newZoom / prev.zoom;
      return {
        x: ox - (ox - prev.x) * r,
        y: oy - (oy - prev.y) * r,
        zoom: newZoom,
      };
    });
  };

  return (
    <CanvasViewportContext.Provider value={vp}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <svg
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            background: "#FAFAF8",
            cursor: "grab",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          // onClick={() => setSelectedId(null)}
        >
          <defs>
            <pattern
              id="dots"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="#D0CEC7" />
            </pattern>
          </defs>
          <g transform={`translate(${vp.x}, ${vp.y}) scale(${vp.zoom})`}>
            <rect
              x={-50000}
              y={-50000}
              width={100000}
              height={100000}
              fill="url(#dots)"
              style={{ pointerEvents: "none" }}
            />
            {children}
          </g>
        </svg>
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            fontSize: 11,
            color: "#888780",
            fontFamily: "system-ui, sans-serif",
            background: "rgba(250,250,248,0.9)",
            padding: "2px 8px",
            borderRadius: 4,
            border: "1px solid #E5E3DC",
            pointerEvents: "none",
          }}
        >
          {Math.round(vp.zoom * 100)}%
        </div>
      </div>
    </CanvasViewportContext.Provider>
  );
};

export default Canvas;
