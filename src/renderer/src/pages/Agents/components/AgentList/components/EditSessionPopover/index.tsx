import { useState } from "react";
import Popover from "../../../../../../ui/Popover";
import { Flex } from "../../../../../../ui/Flex";
import Button from "../../../../../../ui/Button";
import ListBox from "../../../../../../ui/ListBox";
import { AgentSession } from "../../../../types";
import { PopoverContent, ItemLabel, ItemDescription } from "./styles";
import EditSessionModal from "./EditSessionModal";
import DeleteConfirmModal from "../DeleteConfirmModal";

type Props = {
  session: AgentSession;
  onSave?: (session: AgentSession) => void;
  onDelete?: (session: AgentSession) => void;
};

const EditSessionPopover = ({ session, onSave, onDelete }: Props) => {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Popover
        trigger={
          <Button variant="ghost" size="sm" title="Edit session">
            ···
          </Button>
        }
      >
        {(close) => (
          <PopoverContent>
            <ListBox
              aria-label="Session actions"
              selectionMode="none"
              onAction={(key) => {
                if (key === "edit") {
                  setEditOpen(true);
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
                    <ItemDescription>Rename this session</ItemDescription>
                  </Flex>
                </ListBox.Item>
              </ListBox.Section>
              <ListBox.Section>
                <div>Danger Zone</div>
                <ListBox.Item item="delete" textValue="Delete" variant="danger">
                  <Flex direction="column">
                    <ItemLabel>Delete</ItemLabel>
                    <ItemDescription>Remove this session</ItemDescription>
                  </Flex>
                </ListBox.Item>
              </ListBox.Section>
            </ListBox>
          </PopoverContent>
        )}
      </Popover>
      <EditSessionModal
        session={session}
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        onSave={onSave}
      />
      <DeleteConfirmModal
        isOpen={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Session"
        message={`Are you sure you want to delete "${session.name}"? This action cannot be undone.`}
        onConfirm={() => onDelete?.(session)}
      />
    </>
  );
};

export default EditSessionPopover;
