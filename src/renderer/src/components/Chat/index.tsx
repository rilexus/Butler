import { useEffect, useRef, useState } from "react";
import Button from "../../ui/Button";
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
import {
  AppRenderer,
  UI_EXTENSION_CAPABILITIES,
  isUIResource,
} from "@mcp-ui/client";
import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";
import { useChat } from "./hooks/useChat";

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

type Props = {
  messages: ChatMessage[];
  onSubmit: (value: string) => void;
};

export async function createMcpClient(serverUrl) {
  const client = new Client(
    { name: "Delta AI MCP Client", version: "1.0.0" },
    {
      capabilities: {
        roots: { listChanged: true },
        extensions: UI_EXTENSION_CAPABILITIES,
      },
    },
  );

  const transport = new StreamableHTTPClientTransport(new URL(serverUrl));
  await client.connect(transport);
  return client;
}

function ToolUI({ client, toolName, toolResult, toolInput }) {
  const appRef = useRef(null);
  const { sendMessage } = useChat();
  return (
    <AppRenderer
      ref={appRef}
      client={client}
      toolName={toolName}
      sandbox={{
        url: new URL("sandbox_proxy.html", window.location.href),
      }}
      toolInput={toolInput}
      toolResult={toolResult}
      onOpenLink={async ({ url }) => {
        if (url.startsWith("https://") || url.startsWith("http://")) {
          window.open(url);
        }
        return { isError: false };
      }}
      onMessage={async (params) => {
        console.log("Message from UI:", params);
        sendMessage(params.content[0].text);
        return { isError: false };
      }}
      onError={(error) => console.error("UI error:", error)}
    />
  );
}

function ReasoningPart({ text, state }: { text?: string; state?: string }) {
  return (
    <details
      open={state === "streaming"}
      style={{ opacity: 0.6, fontSize: "0.85em" }}
    >
      <summary style={{ cursor: "pointer", userSelect: "none" }}>
        Reasoning
      </summary>
      <pre
        style={{
          margin: "4px 0 0",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {text}
      </pre>
    </details>
  );
}

function hasUIContent(output) {
  return output?.content?.some(isUIResource) ?? false;
}

function ToolPart({ part, mcpClient }) {
  const { state, output, toolName, input } = part;

  if (state !== "output-available") {
    return (
      <div className="tool-call">
        <code>
          {toolName}({JSON.stringify(input ?? {})})
        </code>
      </div>
    );
  }

  if (hasUIContent(output)) {
    if (!mcpClient) return <div>Connecting to MCP...</div>;

    return (
      <ToolUI
        client={mcpClient}
        toolName={toolName}
        toolInput={input}
        toolResult={output}
      />
    );
  }

  const text = output?.content?.[0]?.text;
  return (
    <div className="tool-call">
      <code>{text ?? JSON.stringify(output)}</code>
    </div>
  );
}

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

  const [mcpClient, setMcpClient] = useState<any>(null);

  useEffect(() => {
    createMcpClient("http://localhost:3005/mcp").then(setMcpClient);
  }, []);

  return (
    <Container>
      <MessageList>
        {messages
          .filter((msg) => msg.role !== "system")
          .map((msg, i) => {
            const isSent = msg.role === "user";
            // const text = msg.parts
            //   .filter((p) => p.type === "text")
            //   .map((p) => p.text ?? "")
            //   .join("");

            // const isStreaming = msg.parts.some((p) => p.state === "streaming");

            return (
              <MessageRow key={i} $sent={isSent}>
                {!isSent && <AIAvatar>AI</AIAvatar>}
                <MessageContent>
                  {msg.sender && <SenderName>{msg.sender}</SenderName>}

                  <Bubble $sent={isSent} $streaming={false}>
                    {msg.parts.map((part, pi) => {
                      if (part.type === "reasoning")
                        return (
                          <ReasoningPart
                            key={pi}
                            text={part.text}
                            state={part.state}
                          />
                        );
                      if (part.type.includes("tool"))
                        return (
                          <ToolPart
                            key={pi}
                            part={part}
                            mcpClient={mcpClient}
                          />
                        );
                      return part.text;
                    })}
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
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setValue(e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
            e.key === "Enter" && handleSend()
          }
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
