import styled from "styled-components";

export const Container = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--surface);
`;

export const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const MessageRow = styled.div<{ $sent: boolean }>`
  display: flex;
  flex-direction: ${({ $sent }) => ($sent ? "row-reverse" : "row")};
  align-items: flex-end;
  gap: 8px;
  margin-top: 2px;
`;

export const MessageContent = styled.div`
  max-width: 72%;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

export const SenderName = styled.div`
  font-size: 11px;
  color: var(--fg-2);
  margin-bottom: 2px;
  padding-left: 4px;
`;

export const Bubble = styled.div<{ $sent: boolean; $streaming?: boolean }>`
  padding: 8px 12px;
  border-radius: ${({ $sent }) =>
    $sent ? "18px 18px 4px 18px" : "18px 18px 18px 4px"};
  background: ${({ $sent }) => ($sent ? "#007AFF" : "var(--selected)")};
  color: ${({ $sent }) => ($sent ? "#ffffff" : "var(--fg)")};
  font-size: 15px;
  line-height: 1.45;
  word-break: break-word;
  white-space: pre-wrap;
  opacity: ${({ $streaming }) => ($streaming ? 0.75 : 1)};
  transition: opacity 0.15s ease;
`;

export const InputBar = styled.div`
  padding: 8px 12px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
`;

export const ChatInput = styled.input`
  flex: 1;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 16px;
  font-size: 15px;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  outline: none;
  background: var(--surface);
  color: var(--fg);

  &:focus {
    border-color: #007aff;
    background: var(--selected);
  }

  &::placeholder {
    color: var(--fg-3);
  }
`;

export const AIAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #8e8e93;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;
