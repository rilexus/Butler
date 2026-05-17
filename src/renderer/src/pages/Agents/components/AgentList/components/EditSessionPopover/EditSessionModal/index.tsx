import { useEffect, useState } from "react";
import Modal from "@ui/Modal";
import TextField from "@ui/TextField";
import Button from "@ui/Button";
import { AgentSession } from "../../../../../types";
import { EditFormActions, EditFormFields } from "./styles";

type Props = {
  session: AgentSession;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (session: AgentSession) => void;
};

const EditSessionModal = ({ session, isOpen, onOpenChange, onSave }: Props) => {
  const [name, setName] = useState(session.name ?? "");

  useEffect(() => {
    if (isOpen) setName(session.name ?? "");
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit Session"
      footer={(close: () => void) => (
        <EditFormActions>
          <Button variant="secondary" size="sm" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onSave?.({ ...session, name });
              close();
            }}
          >
            Save
          </Button>
        </EditFormActions>
      )}
    >
      <EditFormFields>
        <TextField
          label="Label"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
        />
      </EditFormFields>
    </Modal>
  );
};

export default EditSessionModal;
