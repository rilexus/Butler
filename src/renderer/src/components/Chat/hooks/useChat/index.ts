import { useCallback, useEffect, useRef, useState } from "react";
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

function splitAt<T>(arr: T[], index: number): [T[], T[]] {
  return [arr.slice(0, index), arr.slice(index)];
}

export const useChat = () => {
  const [storeRaw] = useStore();
  const store = storeRaw as any;

  const selectedSessionId = store?.selectedSession;
  const sessions: any[] = store?.sessions ?? [];
  const session = sessions.find((s: any) => s.id === selectedSessionId) ?? null;
  const storedMessages: ChatMessage[] = session?.messages ?? [];

  const [streamingParts, setStreamingParts] = useState<MessagePart[] | null>(
    null,
  );

  const [messages, setMessages] = useState([]);

  const prevSessionIdRef = useRef(selectedSessionId);
  useEffect(() => {
    if (prevSessionIdRef.current !== selectedSessionId) {
      prevSessionIdRef.current = selectedSessionId;
      setStreamingParts(null);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    if (!selectedSessionId) return;

    const offChunk = window.ipc.on(
      "session:UIMessageStream",
      (payload: any) => {
        const { sessionId, message } = payload;

        setMessages((prev) => {
          const [head, last] = splitAt(prev, prev.length);

          if (last.length === 0) {
            return [message];
          }

          if (last[0].role === "assistent") {
            return [...head, { ...last[0], ...message }];
          }

          return [...head, ...last, message];
        });
      },
    );

    return () => {
      offChunk();
    };
  }, [selectedSessionId]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!session) return;

      const message = {
        role: "user",
        parts: [{ type: "text", text }],
      };

      setMessages((prev) => [...prev, message]);

      window.ipc.send("session.message", {
        session,
        message,
      });
    },
    [session],
  );

  return { messages, sendMessage };
};
