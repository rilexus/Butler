import type { FlowNode } from "../index";
import type { WorkflowAgentDef } from "../../../types";
import { Card, NodeName, FieldRow, FieldLabel, FieldValue } from "./styles";

const CARD_W = 240;
const CARD_H = 180;
const ARROW_H = 7;
const GAP = 10;

const FIELDS: { label: string; key: keyof WorkflowAgentDef }[] = [
  { label: "Description", key: "description" },
  { label: "Instructions", key: "instructions" },
  { label: "Model", key: "model" },
  { label: "URL", key: "url" },
];

export const NodeTooltip = ({ node }: { node: FlowNode }) => {
  const { x, y } = node.position;
  const { width } = node.size;
  const name = String(node.data.name ?? node.id);
  const agent = node.data.agent as WorkflowAgentDef | undefined;

  const cx = x + width / 2;
  const arrowBaseY = y - GAP - ARROW_H;
  const cardY = arrowBaseY - CARD_H;
  const cardX = cx - CARD_W / 2;

  return (
    <g style={{ pointerEvents: "none" }}>
      <foreignObject
        x={cardX}
        y={cardY}
        width={CARD_W}
        height={CARD_H}
        style={{ overflow: "visible" }}
      >
        <Card>
          <NodeName>{name}</NodeName>
          {FIELDS.map(({ label, key }) => {
            const value = agent?.[key];
            if (!value) return null;
            return (
              <FieldRow key={key}>
                <FieldLabel>{label}</FieldLabel>

                <FieldValue>{value as string}</FieldValue>
              </FieldRow>
            );
          })}
        </Card>
      </foreignObject>
      <polygon
        points={`${cx - 6},${arrowBaseY} ${cx + 6},${arrowBaseY} ${cx},${arrowBaseY + ARROW_H}`}
        fill="#ffffff"
        style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.08))" }}
      />
    </g>
  );
};
