import styled from "styled-components";

export const SectionLabel = styled.span`
  padding: 0 16px 8px;
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-2);
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
