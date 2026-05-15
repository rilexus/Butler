import {
  Container,
  Input,
  InputBar,
  Message,
  MessageList,
  MessageText,
} from "./styles";

type MessagePart = { type: string; text?: string };

type ChatMessage = {
  parts: MessagePart[];
};

type Props = {
  messages: ChatMessage[];
  onSubmit: (value: string) => void;
};

export const Chat = ({ messages, onSubmit }: Props) => {
  return (
    <Container>
      <MessageList>
        {messages.map((msg, i) => (
          <Message key={i}>
            {msg.parts.map((part, j) => {
              if (part.type === "text") {
                return <MessageText key={j}>{part.text}</MessageText>;
              }
              return null;
            })}
          </Message>
        ))}
      </MessageList>
      <InputBar>
        <Input
          type="text"
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
        />
      </InputBar>
    </Container>
  );
};
