import styled from "styled-components";

export const GroupRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const GroupLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
  margin-bottom: 2px;
`;

export const GroupDescription = styled.span`
  font-size: 13px;
  color: var(--fg-2);
  margin-bottom: 4px;
`;
