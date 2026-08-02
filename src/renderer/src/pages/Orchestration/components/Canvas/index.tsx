import { createContext, useRef, useState, type RefObject } from "react";
import Button from "../../../../ui/Button";
import { GhostEdge } from "./GhostEdge";
import { useThemeStore } from "../../../../store/ThemeStore";
export { CanvasNode } from "./CanvasNode";

export type Point = { x: number; y: number };

export interface EdgeDrag {
  sourceNodeId: string;
  sourcePortId: string;
  startPos: Point;
  currentPos: Point;
}

export const CanvasViewportContext = createContext<{
  x: number;
  y: number;
  zoom: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  edgeDrag: EdgeDrag | null;
  startEdgeDrag: (drag: Omit<EdgeDrag, "currentPos">) => void;
  endEdgeDrag: (targetNodeId: string, targetPortId: string) => void;
  cancelEdgeDrag: () => void;
  overlayRef: RefObject<HTMLDivElement | null>;
}>({
  x: 60,
  y: 60,
  zoom: 1,
  selectedId: null,
  onSelect: () => {},
  edgeDrag: null,
  startEdgeDrag: () => {},
  endEdgeDrag: () => {},
  cancelEdgeDrag: () => {},
  overlayRef: { current: null },
});

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

const NODE_W = 160;
const NODE_H = 72;
const TOOL_DIAMETER = 64;
const H_GAP = 60;
const V_GAP = 120;
const CHAIN_GAP = 80;
const LAYER_ID = "lyr_main";

export function deriveCanvas(
  nodeDefs: { id: string; name: string; role?: string; type?: string }[],
  edgeDefs: { from: string; to: string }[],
) {
  const outgoing = new Map<string, string[]>();
  const incomingCount = new Map<string, number>();
  for (const { id } of nodeDefs) {
    outgoing.set(id, []);
    incomingCount.set(id, 0);
  }
  for (const { from, to } of edgeDefs) {
    outgoing.get(from)?.push(to);
    incomingCount.set(to, (incomingCount.get(to) ?? 0) + 1);
  }

  const nodesInEdges = new Set(edgeDefs.flatMap(({ from, to }) => [from, to]));
  const roots = nodeDefs
    .map((n) => n.id)
    .filter((id) => nodesInEdges.has(id) && (incomingCount.get(id) ?? 0) === 0);

  const positions = new Map<string, { x: number; y: number }>();
  const visited = new Set<string>();

  let chainY = 100;
  for (const root of roots) {
    let x = 100;
    let cur: string | undefined = root;
    while (cur && !visited.has(cur)) {
      visited.add(cur);
      positions.set(cur, { x, y: chainY });
      x += NODE_W + CHAIN_GAP;
      cur = outgoing.get(cur)?.[0];
    }
    chainY += NODE_H + V_GAP;
  }

  // Any unvisited node (loose or unreachable sink) goes in the bottom row
  let looseX = 100;
  for (const { id } of nodeDefs) {
    if (!visited.has(id)) {
      positions.set(id, { x: looseX, y: chainY });
      looseX += NODE_W + H_GAP;
    }
  }

  const nodes: Record<string, object> = {};
  for (const { id: nodeId, name, role: nodeRole, type: nodeType } of nodeDefs) {
    const isTool = nodeRole === "tool";
    const pos = positions.get(nodeId)!;
    const canvasId = `node_${nodeId}`;
    nodes[canvasId] = {
      id: canvasId,
      type: isTool ? "ellipse" : "rectangle",
      position: pos,
      size: {
        width: isTool ? TOOL_DIAMETER : NODE_W,
        height: isTool ? TOOL_DIAMETER : NODE_H,
      },
      rotation: 0,
      style: {
        fill: isTool ? "#ffffff" : "#fff",
        stroke: isTool ? "#e4e4e7" : "#ccc",
        strokeWidth: isTool ? 1 : 1.5,
        opacity: 1,
        borderRadius: 8,
        fontSize: isTool ? 11 : 13,
        fontColor: "#333",
        label: name,
        labelPosition: "center",
      },
      data: { id: nodeId, name, role: nodeRole, workflowType: nodeType },
      ports: [
        {
          id: `${canvasId}_top`,
          nodeId: canvasId,
          position: "top",
          direction: "in",
        },
        {
          id: `${canvasId}_bottom`,
          nodeId: canvasId,
          position: "bottom",
          direction: "out",
        },
        {
          id: `${canvasId}_right`,
          nodeId: canvasId,
          position: "right",
          direction: "out",
        },
        {
          id: `${canvasId}_left`,
          nodeId: canvasId,
          position: "left",
          direction: "in",
        },
      ],
      layerId: LAYER_ID,
      zIndex: 1,
      locked: false,
      visible: true,
    };
  }

  const edges: Record<string, object> = {};
  let edgeIdx = 0;
  for (const { from, to } of edgeDefs) {
    const srcPos = positions.get(from);
    const tgtPos = positions.get(to);
    if (!srcPos || !tgtPos) continue;
    const srcCanvasId = `node_${from}`;
    const tgtCanvasId = `node_${to}`;
    const edgeId = `edge_${edgeIdx++}`;
    const targetRole = nodeDefs.find((n) => n.id === to)?.role;
    const isTool = targetRole === "tool";
    edges[edgeId] = {
      id: edgeId,
      source: { nodeId: srcCanvasId, portId: `${srcCanvasId}_right` },
      target: { nodeId: tgtCanvasId, portId: `${tgtCanvasId}_left` },
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
        ...(isTool && { strokeDash: [5, 5] }),
      },
      layerId: LAYER_ID,
      zIndex: 0,
    };
  }

  return {
    metadata: { id: "cvs_workflow", name: nodeDefs[0]?.name ?? "" },
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

type EdgeType =
  | "straight"
  | "bezier"
  | "orthogonal"
  | "curved"
  | "tool"
  | string;

export interface Edge {
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

export function getPortCenter(node: FlowNode, portId: string): Point {
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

export interface Port {
  id: string;
  nodeId: string;
  position: "top" | "right" | "bottom" | "left" | "custom";
  offset?: Point;
  direction?: "in" | "out" | "both";
}

export const CanvasEdge = ({
  edge,
  active,
  onRemove,
}: {
  edge: Edge;
  active?: boolean;
  onRemove?: (id: string) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const { isDark } = useThemeStore();
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
    <g
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
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
          fill={isDark ? "#71717a" : "#6B6967"}
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {edge.label}
        </text>
      )}
      {edge.type && edge.type !== "straight" && (
        <text
          x={labelPt.x}
          y={labelPt.y - (edge.label ? 20 : 7)}
          textAnchor="middle"
          fontSize={10}
          fill={isDark ? "#71717a" : "#6B6967"}
          fontFamily="system-ui, -apple-system, sans-serif"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {edge.type}
        </text>
      )}
      {hovered && onRemove && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onRemove(edge.id);
          }}
          style={{ cursor: "pointer" }}
        >
          <circle cx={labelPt.x} cy={labelPt.y} r={8} fill="#ef4444" />
          <text
            x={labelPt.x}
            y={labelPt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={10}
            fill="#fff"
            fontWeight={700}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
};

const Canvas = ({
  children,
  onAddNode,
  onEdgeCreate,
}: {
  children: React.ReactNode;
  onAddNode?: () => void;
  onEdgeCreate?: (
    sourceNodeId: string,
    sourcePortId: string,
    targetNodeId: string,
    targetPortId: string,
  ) => void;
}) => {
  const [vp, setVp] = useState<{
    x: number;
    y: number;
    zoom: number;
    selectedId: string | null;
  }>({ x: 60, y: 60, zoom: 1, selectedId: null });

  const [edgeDrag, setEdgeDrag] = useState<EdgeDrag | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { isDark } = useThemeStore();
  const panning = useRef(false);
  const panMoved = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const onSelect = (id: string | null) => {
    setVp((v) => ({ ...v, selectedId: id }));
  };

  const startEdgeDrag = (drag: Omit<EdgeDrag, "currentPos">) => {
    setEdgeDrag({ ...drag, currentPos: drag.startPos });
  };

  const endEdgeDrag = (targetNodeId: string, targetPortId: string) => {
    if (edgeDrag) {
      onEdgeCreate?.(
        edgeDrag.sourceNodeId,
        edgeDrag.sourcePortId,
        targetNodeId,
        targetPortId,
      );
    }
    setEdgeDrag(null);
  };

  const cancelEdgeDrag = () => setEdgeDrag(null);

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (edgeDrag) return;
    panning.current = true;
    panMoved.current = false;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (edgeDrag) {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const canvasX = (e.clientX - rect.left - vp.x) / vp.zoom;
        const canvasY = (e.clientY - rect.top - vp.y) / vp.zoom;
        setEdgeDrag((prev) =>
          prev ? { ...prev, currentPos: { x: canvasX, y: canvasY } } : null,
        );
      }
      return;
    }
    if (!panning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    if (!panMoved.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
      panMoved.current = true;
    }
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setVp((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  };

  const handleMouseUp = () => {
    if (edgeDrag) {
      setEdgeDrag(null);
      return;
    }
    if (panning.current && !panMoved.current) {
      onSelect(null);
    }
    panning.current = false;
    panMoved.current = false;
  };

  const handleMouseLeave = () => {
    if (edgeDrag) {
      setEdgeDrag(null);
    }
    panning.current = false;
    panMoved.current = false;
  };

  const zoomBy = (delta: number) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const ox = rect.width / 2;
    const oy = rect.height / 2;
    setVp((prev) => {
      const newZoom = Math.max(0.15, Math.min(5, prev.zoom + delta));
      const r = newZoom / prev.zoom;
      return {
        ...prev,
        x: ox - (ox - prev.x) * r,
        y: oy - (oy - prev.y) * r,
        zoom: newZoom,
      };
    });
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
        ...prev,
        x: ox - (ox - prev.x) * r,
        y: oy - (oy - prev.y) * r,
        zoom: newZoom,
      };
    });
  };

  return (
    <CanvasViewportContext.Provider
      value={{
        ...vp,
        onSelect,
        edgeDrag,
        startEdgeDrag,
        endEdgeDrag,
        cancelEdgeDrag,
        overlayRef,
      }}
    >
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <svg
          ref={svgRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            background: isDark ? "#18181b" : "#FAFAF8",
            cursor: edgeDrag ? "crosshair" : "grab",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        >
          <defs>
            <pattern
              id="dots"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="1"
                cy="1"
                r="1"
                fill={isDark ? "#2e2e32" : "#D0CEC7"}
              />
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
            {edgeDrag && (
              <GhostEdge
                startPos={edgeDrag.startPos}
                endPos={edgeDrag.currentPos}
              />
            )}
          </g>
        </svg>
        <div
          ref={overlayRef}
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        />
        {onAddNode && (
          <Button
            onClick={onAddNode}
            title="Add node"
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              width: 28,
              height: 28,
              padding: 0,
              background: isDark
                ? "rgba(24,24,27,0.9)"
                : "rgba(250,250,248,0.9)",
            }}
          >
            +
          </Button>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <Button
            variant="outline"
            size="sm"
            iconOnly
            onClick={() => zoomBy(-0.2)}
            title="Zoom out"
            style={{
              background: isDark
                ? "rgba(24,24,27,0.9)"
                : "rgba(250,250,248,0.9)",
              border: isDark ? "1px solid #3f3f46" : "1px solid #E5E3DC",
              color: isDark ? "#a1a1aa" : "#888780",
              borderRadius: 4,
              fontSize: 16,
            }}
          >
            −
          </Button>
          <div
            style={{
              fontSize: 11,
              color: isDark ? "#a1a1aa" : "#888780",
              background: isDark
                ? "rgba(24,24,27,0.9)"
                : "rgba(250,250,248,0.9)",
              padding: "2px 8px",
              borderRadius: 4,
              border: isDark ? "1px solid #3f3f46" : "1px solid #E5E3DC",
              pointerEvents: "none",
              minWidth: 40,
              textAlign: "center",
            }}
          >
            {Math.round(vp.zoom * 100)}%
          </div>
          <Button
            variant="outline"
            size="sm"
            iconOnly
            onClick={() => zoomBy(0.2)}
            title="Zoom in"
            style={{
              background: isDark
                ? "rgba(24,24,27,0.9)"
                : "rgba(250,250,248,0.9)",
              border: isDark ? "1px solid #3f3f46" : "1px solid #E5E3DC",
              color: isDark ? "#a1a1aa" : "#888780",
              borderRadius: 4,
              fontSize: 16,
            }}
          >
            +
          </Button>
        </div>
      </div>
    </CanvasViewportContext.Provider>
  );
};

export default Canvas;
