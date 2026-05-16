import { useState } from "react";
import Button from "../../../../ui/Button";
import TextField from "../../../../ui/TextField";
import { Workflow } from "../../types";
import { CollapsiblePanel } from "../../../../ui/CollapsiblePanel";
import {
  SectionLabel,
  MenuList,
  MenuItem,
  MenuItemLabel,
  CreateForm,
  FormRow,
  CreateTrigger,
} from "./styles";

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
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
    setCreating(false);
  };

  return (
    <CollapsiblePanel label="Workflows" width={180} background="#fff">
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
      {creating ? (
        <CreateForm onSubmit={handleSubmit}>
          <TextField
            autoFocus
            placeholder="Workflow name"
            value={name}
            onChange={(e) => setName((e.target as HTMLInputElement).value)}
          />
          <FormRow>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              style={{ flex: 1 }}
            >
              Create
            </Button>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              style={{ flex: 1 }}
              onClick={() => {
                setCreating(false);
                setName("");
              }}
            >
              Cancel
            </Button>
          </FormRow>
        </CreateForm>
      ) : (
        <CreateTrigger>
          <Button
            variant="outline"
            size="sm"
            style={{ width: "100%" }}
            onClick={() => setCreating(true)}
          >
            + Create Workflow
          </Button>
        </CreateTrigger>
      )}
    </CollapsiblePanel>
  );
};
