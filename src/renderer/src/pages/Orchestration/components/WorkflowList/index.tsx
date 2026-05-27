import Button from "../../../../ui/Button";
import { Workflow } from "../../types";
import { CollapsiblePanel } from "../../../../ui/CollapsiblePanel";
import {
  SectionLabel,
  MenuList,
  MenuItem,
  MenuItemLabel,
  CreateTrigger,
} from "./styles";
import { AddWorkflowModal } from "./AddWorkflowModal";

export const WorkflowList = ({
  workflows,
  selectedKey,
  onSelect,
  onDelete,
  onCreate,
}: {
  workflows: Workflow[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onDelete: (key: string) => void;
  onCreate: (name: string) => void;
}) => {
  return (
    <CollapsiblePanel label="Workflows" width={230} background="#fff">
      <SectionLabel>Workflows</SectionLabel>
      <MenuList>
        {workflows.map(({ name }) => (
          <MenuItem
            key={name}
            $selected={name === selectedKey}
            onClick={() => onSelect(name)}
          >
            <MenuItemLabel>{name}</MenuItemLabel>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(name);
              }}
              style={{ flexShrink: 0, color: "#8e8e93" }}
            >
              ×
            </Button>
          </MenuItem>
        ))}
      </MenuList>
      <CreateTrigger>
        <AddWorkflowModal
          trigger={
            <Button variant="outline" size="sm" style={{ width: "100%" }}>
              + Create Workflow
            </Button>
          }
          onCreate={onCreate}
        />
      </CreateTrigger>
    </CollapsiblePanel>
  );
};
