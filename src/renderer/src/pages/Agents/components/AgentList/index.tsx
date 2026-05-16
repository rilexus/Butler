import { useState } from "react";
import Button from "../../../../ui/Button";
import { WorkflowAgentDef } from "../../types";
import { CollapsiblePanel } from "../../../../ui/CollapsiblePanel";
import ListBox from "../../../../ui/ListBox";
import EditAgentPopover from "./components/EditAgentPopover";
import AddAgentModal from "./components/AddAgentModal";
import {
  SectionLabel,
  AgentMeta,
  AgentName,
  AgentDescription,
  CreateTrigger,
} from "./styles";

export const AgentList = ({
  agents,
  agentsLibrary = [],
  onAddAgent,
  onEditAgent,
}: {
  agents: WorkflowAgentDef[];
  agentsLibrary?: WorkflowAgentDef[];
  onAddAgent?: (agent: WorkflowAgentDef) => void;
  onEditAgent?: (agent: WorkflowAgentDef) => void;
}) => {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <CollapsiblePanel label="Agents" width={220} background="#fff">
      <SectionLabel>Agents</SectionLabel>
      <CreateTrigger>
        <Button
          variant="outline"
          size="sm"
          style={{ width: "100%" }}
          onClick={() => setAddOpen(true)}
        >
          + Add Agent
        </Button>
      </CreateTrigger>
      <ListBox
        aria-label="Agents"
        selectionMode="none"
        style={{ flex: 1, overflowY: "auto" }}
      >
        {agents.map((agent) => (
          <ListBox.Item key={agent.name} id={agent.name} textValue={agent.name}>
            <AgentMeta>
              <AgentName>{agent.name}</AgentName>
              {agent.description && (
                <AgentDescription>{agent.description}</AgentDescription>
              )}
            </AgentMeta>
            <EditAgentPopover agent={agent} onSave={onEditAgent} />
          </ListBox.Item>
        ))}
      </ListBox>

      <AddAgentModal
        agents={agentsLibrary}
        isOpen={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(agent) => onAddAgent?.(agent)}
      />
    </CollapsiblePanel>
  );
};
