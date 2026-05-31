import { useEffect, useState } from "react";
import Button from "@ui/Button";
import { StatePanelRoot, ActionBar, StateTextArea } from "./styles";

const StatePanel = () => {
  const [original, setOriginal] = useState("");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const snapshot = (window as any).store.get();
    const json = JSON.stringify(snapshot, null, 2);
    setOriginal(json);
    setDraft(json);
  }, []);

  const isDirty = draft !== original;

  const handleSave = () => {
    try {
      const parsed = JSON.parse(draft);
      (window as any).store.set(null, parsed);
      setOriginal(draft);
    } catch {
      // invalid JSON — do nothing
    }
  };

  const handleCancel = () => {
    setDraft(original);
  };

  return (
    <StatePanelRoot>
      <StateTextArea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <ActionBar>
        <Button variant="outline" size="sm" disabled={!isDirty} onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" disabled={!isDirty} onClick={handleSave}>
          Save
        </Button>
      </ActionBar>
    </StatePanelRoot>
  );
};

export default StatePanel;
