import Modal from "../../../../../../ui/Modal";
import { WorkflowAgentDef } from "../../../../types";
import {
  LibraryItem,
  LibraryItemDescription,
  LibraryItemName,
  LibraryList,
  LibrarySeparator,
} from "./styles";

type Props = {
  agents: WorkflowAgentDef[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (agent: WorkflowAgentDef) => void;
};

const AddAgentModal = ({ agents, isOpen, onOpenChange, onAdd }: Props) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} title="Add Agent">
      <LibraryList>
        <LibraryItem
          onClick={() => {
            onAdd({ name: "Custom" });
            onOpenChange(false);
          }}
        >
          <LibraryItemName>Custom</LibraryItemName>
          <LibraryItemDescription>
            Blank agent with no predefined configuration
          </LibraryItemDescription>
        </LibraryItem>
        {agents.length > 0 && <LibrarySeparator />}
        {agents.map((agent) => (
          <LibraryItem
            key={agent.name}
            onClick={() => {
              onAdd(agent);
              onOpenChange(false);
            }}
          >
            <LibraryItemName>{agent.name}</LibraryItemName>
            {agent.description && (
              <LibraryItemDescription>
                {agent.description}
              </LibraryItemDescription>
            )}
          </LibraryItem>
        ))}
      </LibraryList>
    </Modal>
  );
};

export default AddAgentModal;
