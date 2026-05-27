import React, { useState } from "react";
import Modal from "../../../../../ui/Modal";
import TextField from "../../../../../ui/TextField";
import Button from "../../../../../ui/Button";
import { FormRow } from "./styles";

export const AddWorkflowModal = ({
  trigger,
  onCreate,
}: {
  trigger: React.ReactElement;
  onCreate: (name: string) => void;
}) => {
  const [name, setName] = useState("");

  const handleCreate = (close: () => void) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
    close();
  };

  return (
    <Modal
      trigger={trigger}
      title="New Workflow"
      footer={(close) => (
        <FormRow>
          <Button
            variant="secondary"
            size="sm"
            style={{ flex: 1 }}
            onClick={() => {
              setName("");
              close();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            style={{ flex: 1 }}
            onClick={() => handleCreate(close)}
          >
            Create
          </Button>
        </FormRow>
      )}
    >
      <TextField
        autoFocus
        placeholder="Workflow name"
        value={name}
        onChange={(e) => setName((e.target as HTMLInputElement).value)}
      />
    </Modal>
  );
};
