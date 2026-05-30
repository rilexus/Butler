import styled from "styled-components";

export const PanelRoot = styled.nav`
  width: 200px;
  flex-shrink: 0;
  padding: 16px 8px;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PanelTitle = styled.p`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
  margin: 0;
  padding: 0 10px 4px;
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

export const AddButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--fg-3);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: background 120ms ease, color 120ms ease;
  margin-top: 4px;

  &:hover {
    background: var(--hover);
    color: var(--fg-2);
  }
`;
