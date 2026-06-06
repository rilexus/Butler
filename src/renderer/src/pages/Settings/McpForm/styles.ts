import styled from "styled-components";

export const FormRoot = styled.div`
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  background-color: #ffffff74;
`;

export const FormHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
`;

export const ServerName = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--fg);
  margin: 0;
`;

export const EmptyState = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--fg-3);
  font-size: 14px;
`;

export const FormFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border);
`;

export const ArgsInput = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  font-family: "Menlo", "Monaco", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.5;
  padding: 8px 10px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: var(--surface);
  color: var(--fg);
  resize: vertical;
  min-height: 72px;
  outline: none;

  &:focus {
    border-color: var(--fg-3);
  }
`;

export const FieldLabel = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-2);
`;
