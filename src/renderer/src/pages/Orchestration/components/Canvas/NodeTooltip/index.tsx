import { useState } from "react";
import type { FlowNode } from "../index";
import type { WorkflowNodeDef } from "../../../types";
import {
  FieldRow,
  FieldLabel,
  CardRoot,
  CardTitle,
  CardBody,
  NativeInput,
  NativeSelect,
} from "./styles";
import { useStore } from "../../../../../../../main/store/hooks/useStore";

type Provider = { id: string; name: string };

const CARD_W = 240;
const CARD_H = 350;
const ARROW_H = 7;
const GAP = 10;

const FIELDS: { label: string; key: keyof WorkflowNodeDef }[] = [
  { label: "Name", key: "name" },
  { label: "Description", key: "description" },
  { label: "Instructions", key: "instructions" },
];

export const NodeTooltip = ({
  node,
  onFieldChange,
}: {
  node: FlowNode;
  onFieldChange?: (key: string, value: string) => void;
}) => {
  const [providers] = useStore(({ providers }) => providers as Provider[]);
  const nodeDef = node.data.agent as WorkflowNodeDef | undefined;
  const [role, setRole] = useState<WorkflowNodeDef["role"]>(nodeDef?.role ?? "agent");
  const { x, y } = node.position;
  const { width } = node.size;
  const name = String(node.data.name ?? node.id);

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
            <FieldRow>
              <FieldLabel>Provider</FieldLabel>
              <NativeSelect
                defaultValue={nodeDef?.providerId ?? ""}
                onChange={(e) => onFieldChange?.("providerId", e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">None</option>
                {providers?.map(({ id, name: providerName }) => (
                  <option key={id} value={id}>
                    {providerName}
                  </option>
                ))}
              </NativeSelect>
            </FieldRow>
            <FieldRow>
              <FieldLabel>Role</FieldLabel>
              <NativeSelect
                defaultValue={nodeDef?.role ?? "agent"}
                onChange={(e) => {
                  setRole(e.target.value as WorkflowNodeDef["role"]);
                  onFieldChange?.("role", e.target.value);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="agent">Agent</option>
                <option value="tool">Tool</option>
              </NativeSelect>
            </FieldRow>
            {role !== "tool" && <FieldRow>
              <FieldLabel>Type</FieldLabel>
              <NativeSelect
                defaultValue={nodeDef?.type ?? ""}
                onChange={(e) => onFieldChange?.("type", e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <option value="">None</option>
                <option value="start">Start</option>
                <option value="final">Final</option>
              </NativeSelect>
            </FieldRow>}
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
