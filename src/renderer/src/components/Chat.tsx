import { useState, useRef, useEffect, useCallback } from "react";
import styled from "styled-components";

declare global {
  interface Window {
    api: {
      send: (channel: string, ...args: unknown[]) => void;
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      on: (
        channel: string,
        listener: (...args: unknown[]) => void,
      ) => () => void;
    };
  }
}

type Provider = "anthropic" | "lmstudio";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: transparent;
`;

const Header = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid #2a2a4a;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #e94560;
  letter-spacing: 0.5px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProviderToggle = styled.div`
  display: flex;
  background: #16213e;
  border: 1px solid #2a2a4a;
  border-radius: 8px;
  overflow: hidden;
`;

const ProviderTab = styled.button<{ $active: boolean }>`
  background: ${({ $active }) => ($active ? "#e94560" : "transparent")};
  color: ${({ $active }) => ($active ? "#fff" : "#888")};
  border: none;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 12px;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  &:hover {
    color: ${({ $active }) => ($active ? "#fff" : "#e94560")};
  }
`;

const KeyButton = styled.button`
  background: none;
  border: 1px solid #2a2a4a;
  color: #888;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;
  &:hover {
    border-color: #e94560;
    color: #e94560;
  }
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #2a2a4a;
    border-radius: 2px;
  }
`;

const MessageRow = styled.div<{ $role: "user" | "assistant" }>`
  display: flex;
  justify-content: ${({ $role }) =>
    $role === "user" ? "flex-end" : "flex-start"};
`;

const Bubble = styled.div<{ $role: "user" | "assistant" }>`
  max-width: 72%;
  padding: 12px 16px;
  border-radius: ${({ $role }) =>
    $role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px"};
  background: ${({ $role }) => ($role === "user" ? "#e94560" : "#16213e")};
  color: ${({ $role }) => ($role === "user" ? "#fff" : "#eaeaea")};
  font-size: 0.92rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Cursor = styled.span`
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #e94560;
  margin-left: 2px;
  vertical-align: text-bottom;
  animation: blink 0.9s step-end infinite;
  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

const InputArea = styled.div`
  padding: 16px;
  border-top: 1px solid #2a2a4a;
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;

const TextInput = styled.textarea`
  flex: 1;
  background: #16213e;
  border: 1px solid #2a2a4a;
  border-radius: 12px;
  color: #eaeaea;
  font-size: 0.92rem;
  font-family: inherit;
  padding: 12px 16px;
  resize: none;
  outline: none;
  min-height: 44px;
  max-height: 160px;
  line-height: 1.5;
  transition: border-color 0.15s;
  &::placeholder {
    color: #555;
  }
  &:focus {
    border-color: #e94560;
  }
  &:disabled {
    opacity: 0.5;
  }
`;

const SendButton = styled.button`
  background: #e94560;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  white-space: nowrap;
  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
  &:not(:disabled):hover {
    opacity: 0.85;
  }
`;

const SetupScreen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #1a1a2e;
  gap: 16px;
  padding: 32px;
`;

const SetupTitle = styled.h2`
  font-size: 1.25rem;
  color: #eaeaea;
  font-weight: 600;
`;

const SetupSubtitle = styled.p`
  font-size: 0.875rem;
  color: #888;
  text-align: center;
  max-width: 360px;
`;

const SetupInput = styled.input`
  width: 100%;
  max-width: 380px;
  background: #16213e;
  border: 1px solid #2a2a4a;
  border-radius: 12px;
  color: #eaeaea;
  font-size: 0.92rem;
  font-family: inherit;
  padding: 12px 16px;
  outline: none;
  transition: border-color 0.15s;
  &::placeholder {
    color: #555;
  }
  &:focus {
    border-color: #e94560;
  }
`;

const PrimaryButton = styled.button`
  background: #e94560;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 12px 28px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover {
    opacity: 0.85;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #444;
`;

const EmptyTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #555;
`;

const EmptySubtitle = styled.div`
  font-size: 0.85rem;
  color: #444;
`;

const FieldLabel = styled.label`
  font-size: 0.75rem;
  color: #888;
  align-self: flex-start;
  margin-left: 2px;
  width: 100%;
  max-width: 380px;
`;

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<Provider>(
    () => (localStorage.getItem("provider") as Provider) || "anthropic",
  );
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("anthropic_api_key") || "",
  );
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [lmBaseUrl, setLmBaseUrl] = useState(
    () =>
      localStorage.getItem("lmstudio_base_url") || "http://localhost:1234/v1",
  );
  const [lmBaseUrlInput, setLmBaseUrlInput] = useState("");
  const [lmModel, setLmModel] = useState(
    () => localStorage.getItem("lmstudio_model") || "",
  );
  const [lmModelInput, setLmModelInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const removeChunk = window.api.on("chat:chunk", (text) => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + (text as string) },
          ];
        }
        return prev;
      });
    });

    const removeDone = window.api.on("chat:done", () => {
      setIsStreaming(false);
    });

    const removeError = window.api.on("chat:error", (errMsg) => {
      setIsStreaming(false);
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: `Error: ${errMsg as string}` },
      ]);
    });

    return () => {
      removeChunk();
      removeDone();
      removeError();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const send = useCallback(() => {
    if (!input.trim() || isStreaming) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsStreaming(true);
    window.api.send("chat:send", {
      messages: nextMessages,
    });
  }, [input, isStreaming, messages, provider, apiKey, lmBaseUrl, lmModel]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const switchProvider = (p: Provider) => {
    localStorage.setItem("provider", p);
    setProvider(p);
    setShowSettings(false);
  };

  const openSettings = () => {
    if (provider === "anthropic") {
      setApiKeyInput("");
    } else {
      setLmBaseUrlInput(lmBaseUrl);
      setLmModelInput(lmModel);
    }
    setShowSettings(true);
  };

  const saveAnthropicKey = () => {
    const key = apiKeyInput.trim();
    if (!key) return;
    localStorage.setItem("anthropic_api_key", key);
    setApiKey(key);
    setApiKeyInput("");
    setShowSettings(false);
  };

  const saveLmSettings = () => {
    const url = lmBaseUrlInput.trim() || "http://localhost:1234/v1";
    const model = lmModelInput.trim();
    localStorage.setItem("lmstudio_base_url", url);
    localStorage.setItem("lmstudio_model", model);
    setLmBaseUrl(url);
    setLmModel(model);
    setShowSettings(false);
  };

  const needsSetup = showSettings || (provider === "anthropic" && !apiKey);

  if (needsSetup) {
    return (
      <SetupScreen>
        <ProviderToggle style={{ marginBottom: 8 }}>
          <ProviderTab
            $active={provider === "anthropic"}
            onClick={() => switchProvider("anthropic")}
          >
            Claude
          </ProviderTab>
          <ProviderTab
            $active={provider === "lmstudio"}
            onClick={() => switchProvider("lmstudio")}
          >
            LM Studio
          </ProviderTab>
        </ProviderToggle>

        {provider === "anthropic" ? (
          <>
            <SetupTitle>
              {showSettings ? "Update API Key" : "Welcome to Butler"}
            </SetupTitle>
            <SetupSubtitle>
              Enter your Anthropic API key to start chatting. It's stored
              locally on your device.
            </SetupSubtitle>
            <SetupInput
              type="password"
              placeholder="sk-ant-..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveAnthropicKey()}
              autoFocus
            />
            <div style={{ display: "flex", gap: "10px" }}>
              {showSettings && (
                <PrimaryButton
                  style={{ background: "#2a2a4a" }}
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </PrimaryButton>
              )}
              <PrimaryButton onClick={saveAnthropicKey}>
                Save & Start
              </PrimaryButton>
            </div>
          </>
        ) : (
          <>
            <SetupTitle>LM Studio Settings</SetupTitle>
            <SetupSubtitle>
              Make sure LM Studio is running with the local server enabled.
            </SetupSubtitle>
            <FieldLabel>Server URL</FieldLabel>
            <SetupInput
              type="text"
              placeholder="http://localhost:1234/v1"
              value={lmBaseUrlInput}
              onChange={(e) => setLmBaseUrlInput(e.target.value)}
              autoFocus
            />
            <FieldLabel>Model name (optional)</FieldLabel>
            <SetupInput
              type="text"
              placeholder="leave blank to use loaded model"
              value={lmModelInput}
              onChange={(e) => setLmModelInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveLmSettings()}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              {showSettings && (
                <PrimaryButton
                  style={{ background: "#2a2a4a" }}
                  onClick={() => setShowSettings(false)}
                >
                  Cancel
                </PrimaryButton>
              )}
              <PrimaryButton onClick={saveLmSettings}>
                Save & Start
              </PrimaryButton>
            </div>
          </>
        )}
      </SetupScreen>
    );
  }

  return (
    <Wrapper>
      <Header>
        <HeaderTitle>Butler</HeaderTitle>
        <HeaderRight>
          <ProviderToggle>
            <ProviderTab
              $active={provider === "anthropic"}
              onClick={() => switchProvider("anthropic")}
            >
              Claude
            </ProviderTab>
            <ProviderTab
              $active={provider === "lmstudio"}
              onClick={() => switchProvider("lmstudio")}
            >
              LM Studio
            </ProviderTab>
          </ProviderToggle>
          <KeyButton onClick={openSettings}>Settings</KeyButton>
        </HeaderRight>
      </Header>

      {messages.length === 0 ? (
        <EmptyState>
          <EmptyTitle>How can I help?</EmptyTitle>
          <EmptySubtitle>Send a message to start a conversation.</EmptySubtitle>
        </EmptyState>
      ) : (
        <MessageList>
          {messages.map((msg, i) => (
            <MessageRow key={i} $role={msg.role}>
              <Bubble $role={msg.role}>
                {msg.content}
                {msg.role === "assistant" &&
                  isStreaming &&
                  i === messages.length - 1 && <Cursor />}
              </Bubble>
            </MessageRow>
          ))}
          <div ref={bottomRef} />
        </MessageList>
      )}

      <InputArea>
        <TextInput
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            autoResize();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Message Butler… (Enter to send, Shift+Enter for newline)"
          disabled={isStreaming}
          rows={1}
        />
        <SendButton onClick={send} disabled={isStreaming || !input.trim()}>
          {isStreaming ? "···" : "Send"}
        </SendButton>
      </InputArea>
    </Wrapper>
  );
};
