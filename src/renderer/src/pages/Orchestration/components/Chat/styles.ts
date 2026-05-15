import styled from "styled-components";

export const Container = styled.div`
  max-width: 30%;
  height: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e2e8f0;
`;

export const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Message = styled.div`
  font-size: 13px;
  color: #1e293b;
  line-height: 1.5;
`;

export const MessageText = styled.p`
  margin: 0;
`;

export const InputBar = styled.div`
  padding: 12px 16px;
  border-top: 1px solid #e2e8f0;
`;

export const Input = styled.input`
  width: 100%;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  outline: none;
  font-family: inherit;

  &:focus {
    border-color: #3b82f6;
  }
`;
