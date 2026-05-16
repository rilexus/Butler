import { useEffect, useState } from "react";
import Modal from "../../../../../../../ui/Modal";
import TextField from "../../../../../../../ui/TextField";
import Button from "../../../../../../../ui/Button";
import { WorkflowAgentDef } from "../../../../../types";
import { EditFormActions, EditFormFields } from "./styles";

type Props = {
  agent: WorkflowAgentDef;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (agent: WorkflowAgentDef) => void;
};

const EditAgentModal = ({ agent, isOpen, onOpenChange, onSave }: Props) => {
  const [form, setForm] = useState<WorkflowAgentDef>({ ...agent });

  useEffect(() => {
    if (isOpen) setForm({ ...agent });
  }, [isOpen]);

  const set =
    (field: keyof WorkflowAgentDef) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit Agent"
      footer={(close) => (
        <EditFormActions>
          <Button variant="secondary" size="sm" onClick={close}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onSave?.(form);
              close();
            }}
          >
            Save
          </Button>
        </EditFormActions>
      )}
    >
      <EditFormFields>
        <TextField label="Name" value={form.name} onChange={set("name")} />
        <TextField
          label="Description"
          value={form.description ?? ""}
          onChange={set("description")}
        />
        <TextField
          multiline
          label="Instructions"
          value={form.instructions ?? ""}
          rows={4}
          onChange={set("instructions")}
        />
      </EditFormFields>
    </Modal>
  );
};

export default EditAgentModal;
