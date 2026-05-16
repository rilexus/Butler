import { useState } from "react";
import Popover from "../../../../../ui/Popover";
import Button from "../../../../../ui/Button";
import { WorkflowAgentDef } from "../../../types";
import { MenuList, MenuItem } from "./styles";
import EditAgentModal from "./EditAgentModal";

type Props = {
  agent: WorkflowAgentDef;
  onSave?: (agent: WorkflowAgentDef) => void;
  onDuplicate?: (agent: WorkflowAgentDef) => void;
  onDelete?: (agent: WorkflowAgentDef) => void;
};

const EditAgentPopover = ({ agent, onSave, onDuplicate, onDelete }: Props) => {
  const [editOpen, setEditOpen] = useState(false);

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
          <MenuList>
            <MenuItem
              onClick={() => {
                setEditOpen(true);
                close();
              }}
            >
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDuplicate?.(agent);
                close();
              }}
            >
              Duplicate
            </MenuItem>
            <MenuItem
              $danger
              onClick={() => {
                onDelete?.(agent);
                close();
              }}
            >
              Delete
            </MenuItem>
          </MenuList>
        )}
      </Popover>
      <EditAgentModal
        agent={agent}
        isOpen={editOpen}
        onOpenChange={setEditOpen}
        onSave={onSave}
      />
    </>
  );
};

export default EditAgentPopover;
