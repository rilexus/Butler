import styled from "styled-components";

export const StatePanelRoot = styled.div`
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
`;

export const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const StateTextArea = styled.textarea`
  flex: 1;
  width: 100%;
  box-sizing: border-box;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.5;
  padding: 12px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: var(--surface);
  color: var(--fg);
  resize: none;
  outline: none;

  &:focus {
    border-color: var(--border-strong);
  }
`;
