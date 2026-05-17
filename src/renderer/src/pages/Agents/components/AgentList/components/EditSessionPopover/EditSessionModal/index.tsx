import { useEffect, useState } from "react";
import Modal from "../../../../../../../ui/Modal";
import TextField from "../../../../../../../ui/TextField";
import Button from "../../../../../../../ui/Button";
import { AgentSession } from "../../../../../types";
import { EditFormActions, EditFormFields } from "./styles";

type Props = {
  session: AgentSession;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (session: AgentSession) => void;
};

const EditSessionModal = ({ session, isOpen, onOpenChange, onSave }: Props) => {
  const [label, setLabel] = useState(session.label ?? "");

  useEffect(() => {
    if (isOpen) setLabel(session.label ?? "");
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit Session"
      footer={(close) => (
        <EditFormActions>
          <Button variant="secondary" size="sm" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onSave?.({ ...session, label });
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
          value={label}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setLabel(e.target.value)
          }
        />
      </EditFormFields>
    </Modal>
  );
};

export default EditSessionModal;
