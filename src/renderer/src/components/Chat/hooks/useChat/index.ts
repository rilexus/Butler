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

export const useChat = () => {
  const [storeRaw] = useStore();
  const store = storeRaw as any;

  const selectedSessionId = store?.selectedSession;
  const sessions: any[] = store?.sessions ?? [];
  const session = sessions.find((s: any) => s.id === selectedSessionId) ?? null;
  const storedMessages: ChatMessage[] = session?.messages ?? [];

  const sendMessage = useCallback(
    (text: string) => {
      if (!session) return;

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

  return { messages: storedMessages, sendMessage };
};
