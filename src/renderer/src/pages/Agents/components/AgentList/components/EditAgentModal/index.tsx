import { useEffect, useState } from "react";
import Modal from "@ui/Modal";
import Button from "@ui/Button";
import { WorkflowAgentDef } from "../../../../types";
import {
  EditFormActions,
  EditFormLayout,
  MainContent,
  Sidebar,
  SidebarItem,
} from "./styles";
import { useStore } from "@store/hooks/useStore";
import GeneralSection from "./GeneralSection";
import InstructionsSection from "./InstructionsSection";
import McpSection from "./McpSection";
import ProviderSection from "./ProviderSection";
import ToolsSection from "./ToolsSection";

type Props = {
  agent: WorkflowAgentDef;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (agent: WorkflowAgentDef) => void;
};

type Section = "general" | "instructions" | "provider" | "tools" | "mcp";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "general", label: "General" },
  { id: "instructions", label: "Instructions" },
  { id: "provider", label: "Provider" },
  { id: "tools", label: "Tools" },
  { id: "mcp", label: "MCP" },
];

const EditAgentModal = ({ agent, isOpen, onOpenChange, onSave }: Props) => {
  const [form, setForm] = useState<WorkflowAgentDef>({ ...agent });
  const [section, setSection] = useState<Section>("general");
  const [providers] = useStore(
    ({ providers }) => providers as Array<{ id: string; name: string }>,
  );

  useEffect(() => {
    if (isOpen) {
      setForm({ ...agent });
      setSection("general");
    }
  }, [isOpen]);

  const set =
    (field: keyof WorkflowAgentDef) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.stopPropagation();
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Edit Agent"
      width={560}
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
      <EditFormLayout>
        <Sidebar>
          {SECTIONS.map(({ id, label }) => (
            <SidebarItem
              key={id}
              $active={section === id}
              onClick={() => setSection(id)}
            >
              {label}
            </SidebarItem>
          ))}
        </Sidebar>
        <MainContent>
          {section === "general" && (
            <GeneralSection
              name={form.name}
              description={form.description ?? ""}
              onChangeName={set("name")}
              onChangeDescription={set("description")}
            />
          )}
          {section === "instructions" && (
            <InstructionsSection
              instructions={form.instructions ?? ""}
              onChange={set("instructions")}
            />
          )}
          {section === "provider" && (
            <ProviderSection
              providerId={form.providerId ?? ""}
              providers={providers ?? []}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, providerId: value }))
              }
            />
          )}
          {section === "tools" && <ToolsSection />}
          {section === "mcp" && (
            <McpSection
              enabledIds={form.mcpServerIds ?? []}
              onChange={(ids) =>
                setForm((prev) => ({ ...prev, mcpServerIds: ids }))
              }
            />
          )}
        </MainContent>
      </EditFormLayout>
    </Modal>
  );
};

export default EditAgentModal;
