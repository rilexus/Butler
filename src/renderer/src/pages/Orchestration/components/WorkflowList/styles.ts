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

export const MenuList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;
  overflow-y: auto;
`;

export const MenuItem = styled.li<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 6px 16px;
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? "var(--selected)" : "transparent")};
  border-left: 2px solid ${({ $selected }) => ($selected ? "#007aff" : "transparent")};

  &:hover {
    background: var(--hover);
  }
`;

export const MenuItemLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  font-size: 13px;
`;

export const CreateForm = styled.form`
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const FormRow = styled.div`
  display: flex;
  gap: 6px;
`;

export const CreateTrigger = styled.div`
  padding: 8px 16px 0;
`;
