import { useState } from "react";
import Button from "../../../../ui/Button";
import TextField from "../../../../ui/TextField";
import { WorkflowAgentDef } from "../../types";
import { CollapsiblePanel } from "../../../../ui/CollapsiblePanel";
import EditAgentPopover from "./EditAgentPopover";
import {
  SectionLabel,
  AgentListRoot,
  AgentItem,
  AgentMeta,
  AgentName,
  AgentDescription,
  AgentForm,
  FormActions,
  CreateTrigger,
} from "./styles";

type AgentFormState = {
  name: string;
  description: string;
  instructions: string;
};

const emptyForm = (): AgentFormState => ({
  name: "",
  description: "",
  instructions: "",
});

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
  const [form, setForm] = useState<AgentFormState>(emptyForm());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    onCreateAgent(name, {
      description: form.description,
      instructions: form.instructions,
    });
    setForm(emptyForm());
    setCreating(false);
  };

  const set =
    (field: keyof AgentFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <CollapsiblePanel label="Agents" width={220} background="#fff">
      <SectionLabel>Agents</SectionLabel>
      <AgentListRoot>
        {agents.map((agent) => (
          <AgentItem key={agent.name}>
            <AgentMeta>
              <AgentName>{agent.name}</AgentName>
              {agent.description && (
                <AgentDescription>{agent.description}</AgentDescription>
              )}
            </AgentMeta>
            <EditAgentPopover agent={agent} onSave={onEditAgent} />
          </AgentItem>
        ))}
      </AgentListRoot>
      {creating ? (
        <AgentForm onSubmit={handleSubmit}>
          <TextField
            autoFocus
            placeholder="Agent name"
            value={form.name}
            onChange={set("name")}
          />
          <TextField
            placeholder="Short description"
            value={form.description}
            onChange={set("description")}
          />
          <TextField
            multiline
            placeholder="System instructions"
            rows={3}
            value={form.instructions}
            onChange={set("instructions")}
          />
          <FormActions>
            <Button variant="primary" size="sm" type="submit">
              Create
            </Button>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => {
                setForm(emptyForm());
                setCreating(false);
              }}
            >
              Cancel
            </Button>
          </FormActions>
        </AgentForm>
      ) : (
        <CreateTrigger>
          <Button
            variant="outline"
            size="sm"
            style={{ width: "100%" }}
            onClick={() => setCreating(true)}
          >
            + Create Agent
          </Button>
        </CreateTrigger>
      )}
    </CollapsiblePanel>
  );
};
