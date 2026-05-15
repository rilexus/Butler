import { WorkflowNodeDef } from "../../types";
import { CollapsiblePanel } from "../../../../ui/CollapsiblePanel";
import {
  SectionLabel,
  Item,
  ItemLabel,
  DeleteButton,
  DashedCreateButton,
} from "./styles";

export const NodesList = ({
  nodes,
  selectedId,
  onSelect,
  onRemove,
  onAdd,
}: {
  nodes: WorkflowNodeDef[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}) => {
  return (
    <CollapsiblePanel label="Nodes" width={180}>
      <SectionLabel>Nodes</SectionLabel>
      {nodes.map(({ name }) => {
        const id = `node_${name}`;
        return (
          <Item
            key={id}
            $selected={selectedId === id}
            onClick={() => onSelect(id)}
          >
            <ItemLabel>{name}</ItemLabel>
            <DeleteButton
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
              title="Remove node"
            >
              ×
            </DeleteButton>
          </Item>
        );
      })}
      <DashedCreateButton onClick={onAdd}>+ Add Node</DashedCreateButton>
    </CollapsiblePanel>
  );
};
