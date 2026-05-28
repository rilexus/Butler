import type { FlowNode } from "../index";
import type { WorkflowNodeDef } from "../../../types";
import { FieldRow, FieldLabel, CardRoot, CardTitle, CardBody, NativeInput, NativeSelect } from "./styles";

const CARD_W = 240;
const CARD_H = 260;
const ARROW_H = 7;
const GAP = 10;

const FIELDS: { label: string; key: keyof WorkflowNodeDef }[] = [
  { label: "Description", key: "description" },
  { label: "Instructions", key: "instructions" },
  { label: "Model", key: "model" },
  { label: "URL", key: "url" },
];

export const NodeTooltip = ({
  node,
  onFieldChange,
}: {
  node: FlowNode;
  onFieldChange?: (key: string, value: string) => void;
}) => {
  const { x, y } = node.position;
  const { width } = node.size;
  const name = String(node.data.name ?? node.id);
  const nodeDef = node.data.agent as WorkflowNodeDef | undefined;

  const cx = x + width / 2;
  const arrowBaseY = y - GAP - ARROW_H;
  const cardY = arrowBaseY - CARD_H;
  const cardX = cx - CARD_W / 2;

  return (
    <g>
      <foreignObject
        x={cardX}
        y={cardY}
        width={CARD_W}
        height={CARD_H}
        style={{ overflow: "visible" }}
      >
        <CardRoot
          style={{ width: CARD_W }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <CardTitle>{name}</CardTitle>
          <CardBody>
            <FieldRow>
              <FieldLabel>Role</FieldLabel>
              <NativeSelect
                defaultValue={nodeDef?.role ?? "agent"}
                onChange={(e) => onFieldChange?.("role", e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="agent">Agent</option>
                <option value="tool">Tool</option>
              </NativeSelect>
            </FieldRow>
            {FIELDS.map(({ label, key }) => (
              <FieldRow key={key}>
                <FieldLabel>{label}</FieldLabel>
                <NativeInput
                  defaultValue={String(nodeDef?.[key] ?? "")}
                  onBlur={(e) => onFieldChange?.(key, e.target.value)}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
              </FieldRow>
            ))}
          </CardBody>
        </CardRoot>
      </foreignObject>
      <polygon
        points={`${cx - 6},${arrowBaseY} ${cx + 6},${arrowBaseY} ${cx},${arrowBaseY + ARROW_H}`}
        fill="#ffffff"
        style={{
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.08))",
          pointerEvents: "none",
        }}
      />
    </g>
  );
};
