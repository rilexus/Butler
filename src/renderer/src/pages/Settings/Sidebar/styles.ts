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
  gap: 9px;
  padding: 7px 10px;
  border: none;
  border-radius: 7px;
  background: ${({ $active }) => ($active ? "#3478F6" : "transparent")};
  color: ${({ $active }) => ($active ? "#ffffff" : "var(--fg-2)")};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? "500" : "400")};
  cursor: pointer;
  text-align: left;
  transition: background 120ms ease, color 120ms ease;

  svg {
    flex-shrink: 0;
    opacity: ${({ $active }) => ($active ? 1 : 0.6)};
  }

  &:hover {
    background: ${({ $active }) => ($active ? "#3478F6" : "var(--hover)")};
    color: ${({ $active }) => ($active ? "#ffffff" : "var(--fg)")};

    svg {
      opacity: 1;
    }
  }
`;
