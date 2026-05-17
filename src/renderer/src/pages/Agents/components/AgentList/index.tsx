import { useState } from "react";
import Button from "../../../../ui/Button";
import { WorkflowAgentDef } from "../../types";
import { AgentSession } from "../../types";
import { CollapsiblePanel } from "../../../../ui/CollapsiblePanel";

import EditAgentPopover from "./components/EditAgentPopover";
import EditSessionPopover from "./components/EditSessionPopover";

import AddAgentModal from "./components/AddAgentModal";
import { AgentMeta, AgentName, AgentDescription } from "./styles";

import { useNavigationList } from "../NavigationList/hooks/useNavigationList";
import Breadcrumbs from "../../../../ui/Breadcrumbs";
import ListBox from "../../../../ui/ListBox";
import { ChildIndicator } from "../NavigationList/styles";
import { v4 as uuid } from "uuid";

type Tab = "agents" | "sessions";

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
  onDeleteAgent,
}: {
  agents: WorkflowAgentDef[];
  agentsLibrary?: WorkflowAgentDef[];
  sessions?: AgentSession[];
  onAddAgent?: (agent: WorkflowAgentDef) => void;
  onDeleteAgent?: (agent: WorkflowAgentDef) => void;
  onEditAgent?: (agent: WorkflowAgentDef) => void;
  onNewSession?: (agentId: string | null) => void;
  onSelectSession?: (id: AgentSession["id"]) => void;
  onEditSession?: (session: AgentSession) => void;
  onDeleteSession?: (session: AgentSession) => void;
}) => {
  const [addOpen, setAddOpen] = useState(false);
  const {
    crumbs,
    path,
    onPathClick,
    node: currentNode,
    onNodeClick,
    options,
  } = useNavigationList(
    {
      id: "root",
      label: "Agents",
      options: [
        ...agents.map((agent) => {
          const { name } = agent;
          return {
            ...agent,
            label: name,
            type: "agent",
            options: [
              ...sessions
                .filter(({ agent: { id } }) => agent.id === id)
                .map((session) => {
                  return { ...session, label: session.name, type: "session" };
                }),
            ],
          };
        }),
      ],
    },
    "",
  );

  const isAgentsList = path === "";
  const isSessionsList = path.includes("options");

  return (
    <CollapsiblePanel label="Agents" width={250} background="#fff">
      <div
        style={{
          padding: "0 12px",
        }}
      >
        <Breadcrumbs
          items={crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return {
              label: crumb.label,
              onClick: isLast ? undefined : () => onPathClick(crumb),
            };
          })}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "15px 10px",
        }}
      >
        {isAgentsList && (
          <Button
            variant={"outline"}
            size={"sm"}
            onClick={() => {
              setAddOpen(true);
            }}
          >
            + Add Agent
          </Button>
        )}

        {isSessionsList && (
          <Button
            variant={"outline"}
            size={"sm"}
            title="New session"
            onClick={() => onNewSession(currentNode.id)}
          >
            + Add Session
          </Button>
        )}
      </div>

      <ListBox
        aria-label={currentNode?.label}
        onAction={(option) => {
          if (option.type === "session") {
            onSelectSession(option.id);
          }

          onNodeClick(option.id);
        }}
      >
        {options.map((option) => {
          const hasChildren = (option.options?.length ?? 0) > 0;
          return (
            <ListBox.Item key={option.id} item={option}>
              <AgentMeta>
                <AgentName>{option.label}</AgentName>
                {option.description && (
                  <AgentDescription>{option.description}</AgentDescription>
                )}
              </AgentMeta>
              {option.type === "agent" && (
                <EditAgentPopover
                  agent={option}
                  onSave={onEditAgent}
                  onDelete={onDeleteAgent}
                />
              )}
              {option.type === "session" && (
                <EditSessionPopover
                  session={option as AgentSession}
                  onSave={onEditSession}
                  onDelete={onDeleteSession}
                />
              )}

              {hasChildren && <ChildIndicator>›</ChildIndicator>}
            </ListBox.Item>
          );
        })}
      </ListBox>

      <AddAgentModal
        agents={agentsLibrary}
        isOpen={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(agent) => onAddAgent?.({ ...agent, id: uuid() })}
      />
    </CollapsiblePanel>
  );
};
