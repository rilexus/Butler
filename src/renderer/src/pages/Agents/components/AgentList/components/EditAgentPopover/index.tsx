import { useState } from "react";
import Popover from "../../../../../../ui/Popover";
import { Flex } from "../../../../../../ui/Flex";
import Button from "../../../../../../ui/Button";
import ListBox from "../../../../../../ui/ListBox";
import { WorkflowAgentDef } from "../../../../types";
import { PopoverContent, ItemLabel, ItemDescription } from "./styles";
import EditAgentModal from "./EditAgentModal";

type Props = {
  agent: WorkflowAgentDef;
  onSave?: (agent: WorkflowAgentDef) => void;
  onDuplicate?: (agent: WorkflowAgentDef) => void;
  onDelete?: (agent: WorkflowAgentDef) => void;
};

const EditAgentPopover = ({ agent, onSave, onDuplicate, onDelete }: Props) => {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <Popover
        trigger={
          <Button variant="ghost" size="sm" title="Edit agent">
            ···
          </Button>
        }
      >
        {(close) => (
          <PopoverContent>
            <ListBox
              aria-label="Agent actions"
              selectionMode="none"
              onAction={(key) => {
                if (key === "edit") {
                  setEditOpen(true);
                }
                if (key === "duplicate") {
                  onDuplicate?.(agent);
                }
                if (key === "delete") {
                  onDelete?.(agent);
                }
                close();
              }}
            >
              <ListBox.Section>
                <div>Actions</div>
                <ListBox.Item id="edit" textValue="Edit">
                  <Flex direction="column">
                    <ItemLabel>Edit</ItemLabel>
                    <ItemDescription>
                      Modify agent configuration
                    </ItemDescription>
                  </Flex>
                </ListBox.Item>
                <ListBox.Item id="duplicate" textValue="Duplicate">
                  <Flex direction="column">
                    <ItemLabel>Duplicate</ItemLabel>
                    <ItemDescription>Clone this agent</ItemDescription>
                  </Flex>
                </ListBox.Item>
              </ListBox.Section>
              <ListBox.Section>
                <div>Danger Zone</div>
                <ListBox.Item id="delete" textValue="Delete" variant="danger">
                  <Flex direction="column">
                    <ItemLabel>Delete</ItemLabel>
                    <ItemDescription>Remove from workflow</ItemDescription>
                  </Flex>
                </ListBox.Item>
              </ListBox.Section>
            </ListBox>
          </PopoverContent>
        )}
      </Popover>
      <EditAgentModal
        agent={agent}
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        onSave={onSave}
      />
    </>
  );
};

export default EditAgentPopover;
