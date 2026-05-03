import { useRef, useState } from "react";

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

type Point = { x: number; y: number };
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

type EdgeType = "straight" | "bezier" | "orthogonal" | "curved";

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

const CanvasNode = ({
  node,
  selected,
  onSelect,
}: {
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

const CanvasEdge = ({ edge }: { edge: Edge }) => {
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

const Canvas = ({ canvas }) => {
  const [vp, setVp] = useState({ x: 60, y: 60, zoom: 1 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const panning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const nodes = Object.values(canvas.nodes as unknown as Record<string, Node>);
  const edges = Object.values(canvas.edges as unknown as Record<string, Edge>);

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
        onClick={() => setSelectedId(null)}
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
          {edges.map((edge) => (
            <CanvasEdge key={edge.id} edge={edge} />
          ))}
          {nodes.map((node) => (
            <CanvasNode
              key={node.id}
              node={node}
              selected={selectedId === node.id}
              onSelect={setSelectedId}
            />
          ))}
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
  );
};

export default Canvas;
