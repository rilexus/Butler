import { useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useStore } from "../../../../main/store/hooks/useStore";
import { AgentList } from "./components/AgentList";
import { PageRoot } from "../../components/PageRoot";
import { Flex } from "../../ui/Flex";
import { WorkflowAgentDef, AgentSession } from "./types";
import { Chat } from "../../components/Chat";

type StoreShape = {
  agents: WorkflowAgentDef[];
  agentsLibrary: WorkflowAgentDef[];
  sessions: AgentSession[];
  selectedSession: string | number | null;
};

const AgentsPage = () => {
  const [storeRaw, set] = useStore();
  const store = storeRaw as StoreShape;
  const agents = store.agents ?? [];
  const sessions = store.sessions ?? [];
  const agentsLibrary = store.agentsLibrary ?? [];

  const selectedSession = store.selectedSession;
  const session = sessions.find(({ id }) => id === selectedSession);
  const messages = session?.messages ?? [];

  const handleAddAgent = useCallback(
    (agent: WorkflowAgentDef) => {
      set((store) => ({
        ...store,
        agents: [...(store.agents as WorkflowAgentDef[]), agent],
      }));
    },
    [set],
  );

  const handleSelectSession = useCallback(
    (id: string | number) => {
      set((store) => ({ ...store, selectedSession: id }));
    },
    [set],
  );

  const handleNewSession = useCallback(
    (agentId: string | null) => {
      const id = uuid();
      set((store) => ({
        ...store,
        sessions: [
          ...(store.sessions ?? []),
          {
            id,
            agent: { id: agentId },
            label: "New Session",
            messages: [],
            startedAt: new Date().toISOString(),
          },
        ],
        selectedSession: id,
      }));
    },
    [set],
  );

  const handleEditSession = useCallback(
    (updated: { id: string | number; name?: string }) => {
      set((store) => ({
        ...store,
        sessions: (store.sessions ?? []).map((s) =>
          s.id === updated.id ? { ...s, name: updated.name } : s,
        ),
      }));
    },
    [set],
  );

  const handleDeleteSession = useCallback(
    (deleted: { id: string | number }) => {
      set((store) => ({
        ...store,
        sessions: (store.sessions ?? []).filter((s) => s.id !== deleted.id),
        selectedSession:
          store.selectedSession === deleted.id ? null : store.selectedSession,
      }));
    },
    [set],
  );

  const handleDeleteAgent = (agent) => {
    set((store) => ({
      ...store,
      agents: store.agents.filter(({ id }) => agent.id !== id),
    }));
  };

  return (
    <PageRoot>
      <Flex style={{ height: "100%" }}>
        <AgentList
          sessions={sessions}
          agents={agents}
          agentsLibrary={agentsLibrary}
          onAddAgent={handleAddAgent}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
          onEditSession={handleEditSession}
          onDeleteSession={handleDeleteSession}
          onDeleteAgent={handleDeleteAgent}
        />

        <Chat messages={messages} onSubmit={() => {}}></Chat>
      </Flex>
    </PageRoot>
  );
};

export default AgentsPage;
