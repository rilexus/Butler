import { useState } from "react";
import { WorkflowAgentDef } from "../../types";
import { CollapsiblePanel } from "../../../../ui/CollapsiblePanel";
import {
  SectionLabel,
  Row,
  Info,
  Name,
  Description,
  EditButton,
  CreateForm,
  FormInput,
  FormTextarea,
  FormActions,
  PrimaryButton,
  SecondaryButton,
  DashedCreateButton,
} from "./styles";

type AgentFormState = {
  name: string;
  description: string;
  instructions: string;
};

export const AgentList = ({
  agents,
  onCreateAgent,
  onEditAgent,
}: {
  agents: WorkflowAgentDef[];
  onCreateAgent: (
    name: string,
    agent: { description: string; instructions: string },
  ) => void;
  onEditAgent?: (agent: WorkflowAgentDef) => void;
}) => {
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<AgentFormState>({
    name: "",
    description: "",
    instructions: "",
  });

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    onCreateAgent(name, {
      description: form.description,
      instructions: form.instructions,
    });
    setForm({ name: "", description: "", instructions: "" });
    setCreating(false);
  };

  return (
    <CollapsiblePanel label="Agents" width={220} background="#f8f9fa">
      <SectionLabel>Agents</SectionLabel>
      {agents.map((agent) => (
        <Row key={agent.name}>
          <Info>
            <Name>{agent.name}</Name>
            {agent.description && (
              <Description>{agent.description}</Description>
            )}
          </Info>
          <EditButton onClick={() => onEditAgent?.(agent)} title="Edit agent">
            ···
          </EditButton>
        </Row>
      ))}
      {creating ? (
        <CreateForm onSubmit={handleSubmit}>
          <FormInput
            autoFocus
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <FormInput
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <FormTextarea
            placeholder="Instructions"
            value={form.instructions}
            onChange={(e) =>
              setForm((f) => ({ ...f, instructions: e.target.value }))
            }
            rows={3}
          />
          <FormActions>
            <PrimaryButton type="submit">Create</PrimaryButton>
            <SecondaryButton type="button" onClick={() => setCreating(false)}>
              Cancel
            </SecondaryButton>
          </FormActions>
        </CreateForm>
      ) : (
        <DashedCreateButton onClick={() => setCreating(true)}>
          + Create Agent
        </DashedCreateButton>
      )}
    </CollapsiblePanel>
  );
};
