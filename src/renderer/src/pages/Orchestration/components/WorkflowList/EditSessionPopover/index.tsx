import { useState } from "react";
import Popover from "@ui/Popover";
import { Flex } from "@ui/Flex";
import Button from "@ui/Button";
import ListBox from "@ui/ListBox";
import { PopoverContent, ItemLabel, ItemDescription } from "./styles";
import DeleteConfirmModal from "../DeleteConfirmModal";
import EditSessionModal from "../EditSessionModal";

type Session = {
  id: string | number;
  name: string;
};

type Props = {
  session: Session;
  onEdit?: (session: Session, name: string) => void;
  onDelete?: (session: Session) => void;
};

export const EditSessionPopover = ({ session, onEdit, onDelete }: Props) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

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
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        session={session}
        onSave={(name) => onEdit?.(session, name)}
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
