import { useCallback, useEffect, useState } from "react";
import { useStore } from "@store/hooks/useStore";

type MessagePart = {
  type: string;
  text?: string;
  state?: string;
  toolName?: string;
  toolInput?: unknown;
  toolCallId?: string;
  output?: unknown;
};

type ChatMessage = {
  role: "system" | "user" | "assistant";
  parts: MessagePart[];
  sender?: string;
};

export type ChatStatus = "submitted" | "streaming" | "ready" | "error";

export const useChat = () => {
  const [storeRaw] = useStore();
  const store = storeRaw as any;
  const [status, setStatus] = useState<ChatStatus>("ready");

  const selectedSessionId = store?.selectedSession;
  const sessions: any[] = store?.sessions ?? [];
  const session = sessions.find((s: any) => s.id === selectedSessionId) ?? null;
  const storedMessages: ChatMessage[] = session?.messages ?? [];

  useEffect(() => {
    setStatus("ready");
  }, [selectedSessionId]);

  useEffect(() => {
    if (status === "submitted") {
      const last = storedMessages.at(-1);
      if (last?.role === "assistant") {
        setStatus("streaming");
      }
    }
  }, [storedMessages, status]);

  useEffect(() => {
    const cleanDone = window.ipc.on(
      "session:done",
      ({ sessionId }: { sessionId: string }) => {
        if (sessionId === selectedSessionId) setStatus("ready");
      },
    );
    const cleanError = window.ipc.on(
      "session:error",
      ({ sessionId }: { sessionId: string }) => {
        if (sessionId === selectedSessionId) setStatus("error");
      },
    );
    return () => {
      cleanDone();
      cleanError();
    };
  }, [selectedSessionId]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!session) return;
      setStatus("submitted");

      const message = {
        role: "user",
        parts: [{ type: "text", text }],
      };

      window.ipc.send("session.message", {
        session,
        message,
      });
    },
    [session],
  );

  return { messages: storedMessages, sendMessage, status };
};
