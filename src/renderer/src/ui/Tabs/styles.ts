import styled from "styled-components";

export const TabsList = styled.div`
  display: inline-flex;
  align-items: center;
  background: var(--selected);
  border-radius: 9999px;
  padding: 4px;
  gap: 2px;
`;

export const Tab = styled.div<{ $selected: boolean }>`
  padding: 8px 20px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: ${({ $selected }) => ($selected ? "600" : "400")};
  color: ${({ $selected }) => ($selected ? "var(--fg)" : "var(--fg-2)")};
  background: ${({ $selected }) => ($selected ? "var(--overlay)" : "transparent")};
  box-shadow: ${({ $selected }) => ($selected ? "0 1px 4px rgba(0,0,0,0.2)" : "none")};
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease, background 0.15s ease;
  white-space: nowrap;

  &:hover {
    color: var(--fg);
  }
`;

export const TabPanel = styled.div``;
