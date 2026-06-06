import styled from "styled-components";

export const EditFormLayout = styled.div`
  display: flex;
  gap: 16px;
  min-height: 220px;
`;

export const Sidebar = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 120px;
  flex-shrink: 0;
  padding-top: 2px;
`;

export const SidebarItem = styled.button<{ $active?: boolean }>`
  background: ${({ $active }) => ($active ? "var(--selected)" : "transparent")};
  border: none;
  border-radius: 8px;
  padding: 7px 10px;
  text-align: left;
  color: ${({ $active }) => ($active ? "var(--fg)" : "var(--fg-2)")};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "500" : "400")};
  cursor: pointer;
  transition:
    background 0.1s,
    color 0.1s;
  white-space: nowrap;

  &:hover {
    background: var(--hover);
    color: var(--fg);
  }
`;

export const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`;

export const EditFormActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;
