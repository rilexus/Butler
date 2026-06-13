import styled from "styled-components";

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

export const CreateTrigger = styled.div`
  padding: 8px 16px 0;
`;
