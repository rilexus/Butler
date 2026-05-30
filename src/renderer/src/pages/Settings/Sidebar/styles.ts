import styled from "styled-components";

export const SidebarRoot = styled.nav`
  width: 180px;
  flex-shrink: 0;
  padding: 16px 8px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const NavItem = styled.li``;

export const NavButton = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  padding: 7px 10px;
  border: none;
  border-radius: 7px;
  background: ${({ $active }) => ($active ? "var(--selected)" : "transparent")};
  color: ${({ $active }) => ($active ? "var(--fg)" : "var(--fg-2)")};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "500" : "400")};
  cursor: pointer;
  text-align: left;
  transition: background 120ms ease, color 120ms ease;

  &:hover {
    background: ${({ $active }) =>
      $active ? "var(--selected)" : "var(--hover)"};
    color: var(--fg);
  }
`;
