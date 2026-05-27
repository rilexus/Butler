export const GhostEdge = ({
  startPos,
  endPos,
}: {
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
}) => {
  const d = `M ${startPos.x} ${startPos.y} L ${endPos.x} ${endPos.y}`;
  return (
    <g style={{ pointerEvents: "none" }}>
      <path
        d={d}
        fill="none"
        stroke="#4F46E5"
        strokeWidth={2}
        strokeDasharray="6 4"
        opacity={0.7}
      />
    </g>
  );
};
