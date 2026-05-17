import { useState } from "react";
import Button from "../../../../ui/Button";
import { WorkflowAgentDef } from "../../types";
import { AgentSession } from "../../types";
import { CollapsiblePanel } from "../../../../ui/CollapsiblePanel";
import ListBox from "../../../../ui/ListBox";
import EditAgentPopover from "./components/EditAgentPopover";
import EditSessionPopover from "./components/EditSessionPopover";
import AddAgentModal from "./components/AddAgentModal";
import {
  AgentMeta,
  AgentName,
  AgentDescription,
  AgentArrow,
  CreateTrigger,
  TabStrip,
  TabButton,
  SessionMeta,
  SessionLabel,
  SessionTime,
} from "./styles";

type Tab = "agents" | "sessions";

const SessionsList = ({
  sessions,
  onNewSession,
  onSelectSession,
  onEditSession,
  onDeleteSession,
}: {
  sessions: AgentSession[];
  onNewSession?: () => void;
  onSelectSession?: (id: AgentSession["id"]) => void;
  onEditSession?: (session: AgentSession) => void;
  onDeleteSession?: (session: AgentSession) => void;
}) => {
  return (
    <>
      <CreateTrigger>
        <Button
          variant="outline"
          size="sm"
          style={{ width: "100%" }}
          onClick={onNewSession}
        >
          + New Session
        </Button>
      </CreateTrigger>
      <ListBox
        aria-label="Sessions"
        selectionMode="none"
        style={{ flex: 1, overflowY: "auto" }}
        onAction={(key) => onSelectSession?.(key as AgentSession["id"])}
      >
        {sessions.map((session) => (
          <ListBox.Item
            key={session.id}
            id={session.id}
            textValue={session.label ?? session.agentName}
          >
            <SessionMeta>
              <SessionLabel>{session.label ?? session.agentName}</SessionLabel>
              <SessionTime>{session.startedAt}</SessionTime>
            </SessionMeta>
            <EditSessionPopover
              session={session}
              onSave={onEditSession}
              onDelete={onDeleteSession}
            />
          </ListBox.Item>
        ))}
      </ListBox>
    </>
  );
};

export const AgentList = ({
  agents,
  agentsLibrary = [],
  sessions = [],
  onAddAgent,
  onEditAgent,
  onNewSession,
  onSelectSession,
  onEditSession,
  onDeleteSession,
}: {
  agents: WorkflowAgentDef[];
  agentsLibrary?: WorkflowAgentDef[];
  sessions?: AgentSession[];
  onAddAgent?: (agent: WorkflowAgentDef) => void;
  onEditAgent?: (agent: WorkflowAgentDef) => void;
  onNewSession?: (agentId: string | null) => void;
  onSelectSession?: (id: AgentSession["id"]) => void;
  onEditSession?: (session: AgentSession) => void;
  onDeleteSession?: (session: AgentSession) => void;
}) => {
  const [addOpen, setAddOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("agents");
  const [selectedAgent, setSelectedAgent] = useState<string | null>(
    () => agents[0].id,
  );

  return (
    <CollapsiblePanel label="Agents" width={220} background="#fff">
      <TabStrip>
        <TabButton
          $active={activeTab === "agents"}
          onClick={() => setActiveTab("agents")}
        >
          Agents
        </TabButton>
        <TabButton
          $active={activeTab === "sessions"}
          onClick={() => setActiveTab("sessions")}
        >
          Sessions
        </TabButton>
      </TabStrip>

      {activeTab === "agents" && (
        <>
          <CreateTrigger>
            <Button
              variant="outline"
              size="sm"
              style={{ width: "100%" }}
              onClick={() => setAddOpen(true)}
            >
              + Add Agent
            </Button>
          </CreateTrigger>
          <ListBox
            aria-label="Agents"
            selectionMode="none"
            style={{ flex: 1, overflowY: "auto" }}
            onAction={(key) => {
              setSelectedAgent(key);
              setActiveTab("sessions");
            }}
          >
            {agents.map((agent) => (
              <ListBox.Item
                key={agent.name}
                id={agent.id}
                textValue={agent.name}
              >
                <AgentMeta>
                  <AgentName>{agent.name}</AgentName>
                  {agent.description && (
                    <AgentDescription>{agent.description}</AgentDescription>
                  )}
                </AgentMeta>
                <EditAgentPopover agent={agent} onSave={onEditAgent} />
                <AgentArrow
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAgent(agent.id);
                    setActiveTab("sessions");
                  }}
                  title="View sessions"
                >
                  ›
                </AgentArrow>
              </ListBox.Item>
            ))}
          </ListBox>
        </>
      )}

      {activeTab === "sessions" && (
        <SessionsList
          sessions={sessions.filter(({ agent }) => agent.id === selectedAgent)}
          onNewSession={() => onNewSession?.(selectedAgent)}
          onSelectSession={onSelectSession}
          onEditSession={onEditSession}
          onDeleteSession={onDeleteSession}
        />
      )}

      <AddAgentModal
        agents={agentsLibrary}
        isOpen={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(agent) => onAddAgent?.(agent)}
      />
    </CollapsiblePanel>
  );
};
