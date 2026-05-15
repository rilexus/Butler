import { useState } from "react";
import { Workflow } from "../../types";
import { CollapsiblePanel } from "../../../../ui/CollapsiblePanel";
import {
  SectionLabel,
  Item,
  ItemLabel,
  DeleteButton,
  CreateForm,
  FormInput,
  FormActions,
  PrimaryButton,
  SecondaryButton,
  DashedCreateButton,
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
    <CollapsiblePanel label="Workflows" width={180} background="#f1f5f9">
      <SectionLabel>Workflows</SectionLabel>
      {workflows.map(({ name }) => (
        <Item
          key={name}
          $selected={selectedKey === name}
          onClick={() => onSelect(name)}
        >
          <ItemLabel>{name}</ItemLabel>
          <DeleteButton
            onClick={(e) => {
              e.stopPropagation();
              onDelete(name);
            }}
            title="Delete workflow"
          >
            ×
          </DeleteButton>
        </Item>
      ))}
      {creating ? (
        <CreateForm onSubmit={handleSubmit}>
          <FormInput
            autoFocus
            placeholder="Workflow name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <FormActions>
            <PrimaryButton type="submit">Create</PrimaryButton>
            <SecondaryButton
              type="button"
              onClick={() => {
                setCreating(false);
                setName("");
              }}
            >
              Cancel
            </SecondaryButton>
          </FormActions>
        </CreateForm>
      ) : (
        <DashedCreateButton onClick={() => setCreating(true)}>
          + Create Workflow
        </DashedCreateButton>
      )}
    </CollapsiblePanel>
  );
};
