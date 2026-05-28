import { useState } from "react";
import Popover from "@ui/Popover";
import { Flex } from "@ui/Flex";
import Button from "@ui/Button";
import ListBox from "@ui/ListBox";
import { WorkflowAgentDef } from "../../../../types";
import { PopoverContent, ItemLabel, ItemDescription } from "./styles";
import DeleteConfirmModal from "../DeleteConfirmModal";

type Props = {
  agent: WorkflowAgentDef;
  onEdit?: (agent: WorkflowAgentDef) => void;
  onDuplicate?: (agent: WorkflowAgentDef) => void;
  onDelete?: (agent: WorkflowAgentDef) => void;
};

const EditAgentPopover = ({ agent, onEdit, onDuplicate, onDelete }: Props) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

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
                  onEdit?.(agent);
                }
                if (key === "duplicate") {
                  onDuplicate?.(agent);
                }
                if (key === "delete") {
                  setDeleteOpen(true);
                }
                close();
              }}
            >
              <ListBox.Section>
                <div>Actions</div>
                <ListBox.Item item="edit" textValue="Edit">
                  <Flex direction="column">
                    <ItemLabel>Edit</ItemLabel>
                    <ItemDescription>
                      Modify agent configuration
                    </ItemDescription>
                  </Flex>
                </ListBox.Item>
                <ListBox.Item item="duplicate" textValue="Duplicate">
                  <Flex direction="column">
                    <ItemLabel>Duplicate</ItemLabel>
                    <ItemDescription>Clone this agent</ItemDescription>
                  </Flex>
                </ListBox.Item>
              </ListBox.Section>
              <ListBox.Section>
                <div>Danger Zone</div>
                <ListBox.Item item="delete" textValue="Delete" variant="danger">
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
      <DeleteConfirmModal
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Agent"
        message={`Are you sure you want to delete "${agent.name}"? This action cannot be undone.`}
        onConfirm={() => onDelete?.(agent)}
      />
    </>
  );
};

export default EditAgentPopover;
