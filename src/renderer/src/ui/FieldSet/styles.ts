import styled from "styled-components";

export const FieldSetRoot = styled.fieldset`
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px 24px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Legend = styled.legend`
  font-size: 15px;
  font-weight: 600;
  color: var(--fg);
  padding: 0 4px;
`;

export const FieldSetDescription = styled.span`
  font-size: 13px;
  color: var(--fg-2);
  margin-top: -8px;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 4px;
`;
