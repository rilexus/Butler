import { useCallback, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { useStore } from "@store/hooks/useStore";
import { AgentList } from "./components/AgentList";
import { PageRoot } from "../../components/PageRoot";
import { Flex } from "@ui/Flex";
import { WorkflowAgentDef, AgentSession } from "./types";
import { Chat } from "../../components/Chat";
import { useIPC } from "@hooks/useIPC";

type StoreShape = {
  agents: WorkflowAgentDef[];
  agentsLibrary: WorkflowAgentDef[];
  sessions: AgentSession[];
  selectedSession: string | number | null;
};

const useChat = () => {
  const [inFlightText, setInFlightText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const [session] = useStore((store) => {
    const s = store as unknown as StoreShape;
    return (s.sessions ?? []).find(({ id }) => s.selectedSession === id);
  });

  const sessionId = session?.id ?? null;

  useEffect(() => {
    setInFlightText("");
    setIsStreaming(false);
  }, [sessionId]);

  useEffect(() => {
    if (sessionId === null) return;

    const unsubChunk = window.ipc.on("session:chunk", (...args: unknown[]) => {
      const { sessionId: sid, chunk } = args[0] as {
        sessionId: string | number;
        chunk: string;
      };
      if (sid !== sessionId) return;
      setIsStreaming(true);
      setInFlightText((prev) => prev + chunk);
    });
    const unsubDone = window.ipc.on("session:done", (...args: unknown[]) => {
      const { sessionId: sid } = args[0] as { sessionId: string | number };
      if (sid !== sessionId) return;
      setIsStreaming(false);
      setInFlightText("");
    });
    const unsubError = window.ipc.on("session:error", (...args: unknown[]) => {
      const { sessionId: sid } = args[0] as { sessionId: string | number };
      if (sid !== sessionId) return;
      setIsStreaming(false);
      setInFlightText("");
    });

    return () => {
      unsubChunk();
      unsubDone();
      unsubError();
    };
  }, [sessionId]);

  const ipc = useIPC();

  const persistedMessages = session?.messages ?? [];
  const streamingMessage =
    isStreaming || inFlightText
      ? {
          role: "assistant" as const,
          parts: [{ type: "text", text: inFlightText, state: "streaming" }],
        }
      : null;

  const messages = streamingMessage
    ? [...persistedMessages, streamingMessage]
    : persistedMessages;

  const sendMessage = useCallback(
    (text: string) => {
      if (!session) return;
      ipc.send("session.message", {
        session,
        message: { role: "user", parts: [{ type: "text", text }] },
      });
    },
    [session, ipc],
  );

  return { messages, sendMessage, isStreaming };
};

const AgentsPage = () => {
  const [storeRaw, set] = useStore();
  const store = storeRaw as StoreShape;
  const agents = store.agents ?? [];
  const sessions = store.sessions ?? [];
  const agentsLibrary = store.agentsLibrary ?? [];

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
            name: "New Session",
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

  const { messages, sendMessage } = useChat();

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

        <Chat messages={messages} onSubmit={sendMessage} />
      </Flex>
    </PageRoot>
  );
};

export default AgentsPage;
