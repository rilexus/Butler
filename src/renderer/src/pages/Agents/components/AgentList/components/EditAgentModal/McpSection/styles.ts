import styled from "styled-components";

export const ServerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ServerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--surface-2, var(--hover));
`;

export const ServerName = styled.span`
  font-size: 13px;
  color: var(--fg);
`;

export const Empty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 120px;
  color: var(--fg-3);
  font-size: 13px;
`;
