import { useEffect, useRef, useState } from "react";
import Button from "../../../../ui/Button";
import {
  Container,
  InputBar,
  MessageContent,
  MessageList,
  MessageRow,
  SenderName,
  Bubble,
  ChatInput,
  AIAvatar,
} from "./styles";

type MessagePart = { type: string; text?: string; state?: string };

type ChatMessage = {
  role: "system" | "user" | "assistant";
  parts: MessagePart[];
  sender?: string;
};

type Props = {
  messages: ChatMessage[];
  onSubmit: (value: string) => void;
};

export const Chat = ({ messages, onSubmit }: Props) => {
  const [value, setValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  };

  return (
    <Container>
      <MessageList>
        {messages
          .filter((msg) => msg.role !== "system")
          .map((msg, i) => {
            const isSent = msg.role === "user";
            const text = msg.parts
              .filter((p) => p.type === "text")
              .map((p) => p.text ?? "")
              .join("");
            const isStreaming = msg.parts.some((p) => p.state === "streaming");

            if (!text) return null;

            return (
              <MessageRow key={i} $sent={isSent}>
                {!isSent && <AIAvatar>AI</AIAvatar>}
                <MessageContent>
                  {msg.sender && <SenderName>{msg.sender}</SenderName>}
                  <Bubble $sent={isSent} $streaming={isStreaming}>
                    {text}
                  </Bubble>
                </MessageContent>
              </MessageRow>
            );
          })}
        <div ref={bottomRef} />
      </MessageList>
      <InputBar>
        <ChatInput
          placeholder="Message"
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && handleSend()}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleSend}
          disabled={!value.trim()}
          style={{ borderRadius: "50%", width: 28, height: 28, padding: 0 }}
        >
          ↑
        </Button>
      </InputBar>
    </Container>
  );
};
