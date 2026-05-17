import styled from "styled-components";
import { NavLink } from "react-router-dom";

export const NavBarRoot = styled.nav`
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
  -webkit-app-region: drag;
  flex-shrink: 0;
`;

export const Slot = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

export const RightSlot = styled(Slot)`
  justify-content: flex-end;
  gap: 4px;
  -webkit-app-region: no-drag;
`;

export const TabsBar = styled.div`
  display: inline-flex;
  align-items: center;
  background: var(--selected);
  border-radius: 9999px;
  padding: 3px;
  gap: 2px;
  -webkit-app-region: no-drag;
`;

export const NavTab = styled(NavLink)`
  padding: 5px 18px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-2);
  background: transparent;
  text-decoration: none;
  user-select: none;
  transition:
    color 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
  white-space: nowrap;

  &:hover {
    color: var(--fg);
  }

  &.active {
    font-weight: 600;
    color: var(--fg);
    background: var(--overlay);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  }
`;

const iconButtonBase = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  color: var(--fg-2);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: var(--hover);
    color: var(--fg);
  }

  &:active {
    background: var(--selected);
  }
`;

export const ThemeToggle = styled.button`
  ${iconButtonBase}
`;

export const NavIconLink = styled(NavLink)`
  ${iconButtonBase}
  text-decoration: none;

  &.active {
    color: var(--fg);
    background: var(--selected);
  }
`;
