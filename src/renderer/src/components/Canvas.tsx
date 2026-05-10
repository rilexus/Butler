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
  );
};

export default Canvas;
