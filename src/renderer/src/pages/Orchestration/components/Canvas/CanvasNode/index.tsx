import { useContext, useState } from "react";
import { CanvasViewportContext, FlowNode, getPortCenter } from "../";
import { useThemeStore } from "@store/ThemeStore";
import { NodeTooltip } from "../NodeTooltip";

export const CanvasNode = ({
  node,
  active,
  onPositionChange,
  onRemove,
  onEdit,
  onRename,
  onAgentFieldChange,
}: {
  active: boolean;
  node: FlowNode;
  onPositionChange?: (id: string, pos: { x: number; y: number }) => void;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  onAgentFieldChange?: (id: string, key: string, value: string) => void;
}) => {
  const { zoom, selectedId, onSelect, edgeDrag, startEdgeDrag, endEdgeDrag } =
    useContext(CanvasViewportContext);
  const { isDark } = useThemeStore();
  const selected = selectedId === node.id;
  const { x, y } = node.position;
  const { width, height } = node.size;
  const s = node.style;
  const isSubagent = node.data.role === "subagent";
  const isTool = node.data.role === "tool";
  const isStart = node.data.workflowType === "start";
  const isFinal = node.data.workflowType === "final";
  const cx = x + width / 2;
  const cy = y + height / 2;
  const r = Math.min(width, height) / 2;
  const agentDef = node.data.agent as
    | { instructions?: string }
    | null
    | undefined;
  const instructions = !isSubagent ? agentDef?.instructions : undefined;
  const instructionsTruncated =
    instructions && instructions.length > 22
      ? instructions.slice(0, 22) + "…"
      : instructions;
  const nodeFill = isDark ? (isSubagent ? "#1f1f23" : "#27272a") : s.fill;
  const nodeStroke = isDark ? (isSubagent ? "#3f3f46" : "#52525b") : s.stroke;
  const nodeFontColor = isDark
    ? isSubagent
      ? "#71717a"
      : "#e4e4e7"
    : (s.fontColor ?? "#333");

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [hovered, setHovered] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (editing || edgeDrag) return;
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

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDraft(s.label ?? "");
    setEditing(true);
  };

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== s.label) onRename?.(node.id, trimmed);
    setEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setEditing(false);
  };

  return (
    <g
      style={{ cursor: editing ? "default" : "grab" }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {active &&
        (isTool ? (
          <circle
            cx={cx}
            cy={cy}
            r={r + 6}
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
          </circle>
        ) : (
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
        ))}
      {selected &&
        (isTool ? (
          <circle
            cx={cx}
            cy={cy}
            r={r + 3}
            fill="none"
            stroke="#4F46E5"
            strokeWidth={1.5}
            strokeDasharray="4 2"
          />
        ) : (
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
        ))}
      {isTool ? (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={nodeFill}
          stroke={nodeStroke}
          strokeWidth={s.strokeWidth}
          opacity={s.opacity}
        />
      ) : (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={s.borderRadius ?? 0}
          fill={nodeFill}
          stroke={nodeStroke}
          strokeWidth={s.strokeWidth}
          strokeDasharray={isSubagent ? "4 3" : undefined}
          opacity={s.opacity}
        />
      )}
      {editing ? (
        <foreignObject
          x={x + 4}
          y={y + (height - 24) / 2}
          width={width - 8}
          height={24}
        >
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={handleInputKeyDown}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              textAlign: "center",
              fontSize: s.fontSize ?? 13,
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 500,
              color: nodeFontColor,
              padding: 0,
            }}
          />
        </foreignObject>
      ) : isTool ? (
        <>
          <text
            x={cx}
            y={y + 12}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={7}
            fill={isDark ? "#a78bfa" : "#8b5cf6"}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight={600}
            letterSpacing={0.6}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            TOOL
          </text>
          {s.label && (
            <text
              x={cx}
              y={cy + 6}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={s.fontSize ?? 11}
              fill={nodeFontColor}
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight={500}
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              <title>{instructions}</title>
              {s.label}
            </text>
          )}
        </>
      ) : (
        <>
          <text
            x={x + width / 2}
            y={y + 14}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8}
            fill={
              isSubagent
                ? isDark
                  ? "#71717a"
                  : "#a1a1aa"
                : isDark
                  ? "#818cf8"
                  : "#6366f1"
            }
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight={600}
            letterSpacing={0.8}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            {isSubagent ? "SUBAGENT" : "AGENT"}
          </text>
          {s.label && (
            <text
              x={x + width / 2}
              y={instructionsTruncated ? y + height / 2 : y + (height + 14) / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={s.fontSize ?? 14}
              fill={nodeFontColor}
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight={500}
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {s.label}
            </text>
          )}
          {instructionsTruncated && (
            <text
              x={x + width / 2}
              y={y + height - 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill={isDark ? "#71717a" : "#a1a1aa"}
              fontFamily="system-ui, -apple-system, sans-serif"
              fontStyle="italic"
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              <title>{instructions}</title>
              {instructionsTruncated}
            </text>
          )}
        </>
      )}
      {node.ports.map((port) => {
        const p = getPortCenter(node, port.id);
        const isSource =
          edgeDrag?.sourceNodeId === node.id &&
          edgeDrag?.sourcePortId === port.id;
        const isValidTarget = !!edgeDrag && edgeDrag.sourceNodeId !== node.id;
        return (
          <circle
            key={port.id}
            cx={p.x}
            cy={p.y}
            r={edgeDrag ? 6 : 4}
            fill={isSource ? "#4F46E5" : isValidTarget ? "#22c55e" : nodeFill}
            stroke={
              isSource ? "#4F46E5" : isValidTarget ? "#22c55e" : nodeStroke
            }
            strokeWidth={1.5}
            style={{ cursor: "crosshair" }}
            onMouseDown={(e) => {
              e.stopPropagation();
              startEdgeDrag({
                sourceNodeId: node.id,
                sourcePortId: port.id,
                startPos: p,
              });
            }}
            onMouseUp={(e) => {
              if (edgeDrag && edgeDrag.sourceNodeId !== node.id) {
                e.stopPropagation();
                endEdgeDrag(node.id, port.id);
              }
            }}
          />
        );
      })}
      {isStart && (
        <circle
          cx={x + 10}
          cy={y + height - 10}
          r={5}
          fill="#22c55e"
          style={{ pointerEvents: "none" }}
        />
      )}
      {isFinal && (
        <circle
          cx={x + 10}
          cy={y + height - 10}
          r={5}
          fill="#f97316"
          style={{ pointerEvents: "none" }}
        />
      )}
      {onEdit && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onEdit(node.id);
          }}
          style={{ cursor: "pointer" }}
        >
          <circle
            cx={x}
            cy={y}
            r={8}
            fill={nodeFill}
            stroke={nodeStroke}
            strokeWidth={1}
          />
          <text
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fill={nodeFontColor}
            fontWeight={700}
            style={{ pointerEvents: "none", userSelect: "none" }}
          >
            •••
          </text>
        </g>
      )}
      {hovered && onRemove && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onRemove(node.id);
          }}
          style={{ cursor: "pointer" }}
        >
          <circle cx={x + width} cy={y} r={8} fill="#ef4444" />
          <text
            x={x + width}
            y={y}
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
      {selected && (
        <NodeTooltip
          node={node}
          onFieldChange={(key, value) =>
            onAgentFieldChange?.(node.id, key, value)
          }
        />
      )}
    </g>
  );
};
