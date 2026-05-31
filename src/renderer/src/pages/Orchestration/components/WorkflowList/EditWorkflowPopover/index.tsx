import { useState } from "react";
import Popover from "@ui/Popover";
import { Flex } from "@ui/Flex";
import Button from "@ui/Button";
import ListBox from "@ui/ListBox";
import { Workflow } from "../../../types";
import { PopoverContent, ItemLabel, ItemDescription } from "./styles";
import DeleteConfirmModal from "../DeleteConfirmModal";

type Props = {
  workflow: Workflow;
  onEdit?: (workflow: Workflow) => void;
  onDuplicate?: (workflow: Workflow) => void;
  onDelete?: (workflow: Workflow) => void;
};

export const EditWorkflowPopover = ({
  workflow,
  onEdit,
  onDuplicate,
  onDelete,
}: Props) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Popover
        trigger={
          <Button variant="ghost" size="sm" title="Edit workflow">
            ···
          </Button>
        }
      >
        {(close) => (
          <PopoverContent>
            <ListBox
              aria-label="Workflow actions"
              selectionMode="none"
              onAction={(key) => {
                if (key === "edit") {
                  onEdit?.(workflow);
                }
                if (key === "duplicate") {
                  onDuplicate?.(workflow);
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
                      Modify workflow configuration
                    </ItemDescription>
                  </Flex>
                </ListBox.Item>
                <ListBox.Item item="duplicate" textValue="Duplicate">
                  <Flex direction="column">
                    <ItemLabel>Duplicate</ItemLabel>
                    <ItemDescription>Clone this workflow</ItemDescription>
                  </Flex>
                </ListBox.Item>
              </ListBox.Section>
              <ListBox.Section>
                <div>Danger Zone</div>
                <ListBox.Item item="delete" textValue="Delete" variant="danger">
                  <Flex direction="column">
                    <ItemLabel>Delete</ItemLabel>
                    <ItemDescription>Remove this workflow</ItemDescription>
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
        title="Delete Workflow"
        message={`Are you sure you want to delete "${workflow.name}"? This action cannot be undone.`}
        onConfirm={() => onDelete?.(workflow)}
      />
    </>
  );
};
