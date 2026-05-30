import styled from "styled-components";

export const FormRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
`;

export const ProviderName = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--fg);
  margin: 0;
`;

export const EmptyState = styled.div`
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
  padding-top: 16px;
  border-top: 1px solid var(--border);
`;
