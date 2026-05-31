import { useState, useEffect } from "react";
import Modal from "@ui/Modal";
import TextField from "@ui/TextField";
import Button from "@ui/Button";
import { FormRow } from "./styles";

type Session = {
  id: string | number;
  name: string;
};

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session;
  onSave: (name: string) => void;
};

const EditSessionModal = ({ isOpen, onOpenChange, session, onSave }: Props) => {
  const [name, setName] = useState(session.name);

  useEffect(() => {
    if (isOpen) setName(session.name);
  }, [isOpen, session.name]);

  const handleSave = (close: () => void) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit Session"
      footer={(close) => (
        <FormRow>
          <Button variant="secondary" size="sm" style={{ flex: 1 }} onClick={close}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            style={{ flex: 1 }}
            onClick={() => handleSave(close)}
          >
            Save
          </Button>
        </FormRow>
      )}
    >
      <TextField
        autoFocus
        placeholder="Session name"
        value={name}
        onChange={(e) => setName((e.target as HTMLInputElement).value)}
      />
    </Modal>
  );
};

export default EditSessionModal;
