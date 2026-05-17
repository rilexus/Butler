import styled from "styled-components";

export const TabStrip = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border);
  margin-bottom: 4px;
`;

export const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 8px 0;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ $active }) => ($active ? "var(--fg)" : "transparent")};
  margin-bottom: -1px;
  font-size: 12px;
  font-weight: ${({ $active }) => ($active ? "600" : "400")};
  color: ${({ $active }) => ($active ? "var(--fg)" : "var(--fg-2)")};
  cursor: pointer;
  transition:
    color 0.15s,
    border-color 0.15s;

  &:hover {
    color: var(--fg);
  }
`;

export const AgentMeta = styled.div`
  flex: 1;
  min-width: 0;
`;

export const AgentName = styled.div`
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const AgentDescription = styled.div`
  font-size: 11px;
  color: var(--fg-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const AgentForm = styled.form`
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const FormActions = styled.div`
  display: flex;
  gap: 6px;
`;

export const CreateTrigger = styled.div`
  padding: 8px 16px 0;
`;

export const SessionMeta = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SessionLabel = styled.div`
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const SessionTime = styled.div`
  font-size: 11px;
  color: var(--fg-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const AgentArrow = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 4px;
  color: var(--fg-3);
  font-size: 12px;
  cursor: pointer;
  transition:
    color 0.15s,
    background 0.15s;

  &:hover {
    color: var(--fg);
    background: var(--bg-2, #f0f0f0);
  }
`;
