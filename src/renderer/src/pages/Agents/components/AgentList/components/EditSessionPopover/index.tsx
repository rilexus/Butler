import { useState } from "react";
import Popover from "../../../../../../ui/Popover";
import { Flex } from "../../../../../../ui/Flex";
import Button from "../../../../../../ui/Button";
import ListBox from "../../../../../../ui/ListBox";
import { AgentSession } from "../../../../types";
import { PopoverContent, ItemLabel, ItemDescription } from "./styles";
import EditSessionModal from "./EditSessionModal";

type Props = {
  session: AgentSession;
  onSave?: (session: AgentSession) => void;
  onDelete?: (session: AgentSession) => void;
};

const EditSessionPopover = ({ session, onSave, onDelete }: Props) => {
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
                  onDelete?.(session);
                }
                close();
              }}
            >
              <ListBox.Section>
                <div>Actions</div>
                <ListBox.Item id="edit" textValue="Edit">
                  <Flex direction="column">
                    <ItemLabel>Edit</ItemLabel>
                    <ItemDescription>Rename this session</ItemDescription>
                  </Flex>
                </ListBox.Item>
              </ListBox.Section>
              <ListBox.Section>
                <div>Danger Zone</div>
                <ListBox.Item id="delete" textValue="Delete" variant="danger">
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
    </>
  );
};

export default EditSessionPopover;
