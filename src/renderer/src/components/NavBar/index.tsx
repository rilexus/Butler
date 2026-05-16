import {
  NavBarRoot,
  TabsBar,
  NavTab,
  Slot,
  RightSlot,
  ThemeToggle,
} from "./styles";
import { useThemeStore } from "../../store/ThemeStore";

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <circle cx="7.5" cy="7.5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.93 2.93l1.06 1.06M11.01 11.01l1.06 1.06M11.01 3.99l1.06-1.06M2.93 12.07l1.06-1.06"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M11.5 9.5A5.5 5.5 0 014.5 2a5.5 5.5 0 000 11 5.5 5.5 0 007-3.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const NavBar = () => {
  const { isDark, toggleTheme } = useThemeStore();
  return (
    <NavBarRoot>
      <Slot />
      <TabsBar>
        <NavTab to="/workflows">Workflows</NavTab>
        <NavTab to="/agents">Agents</NavTab>
      </TabsBar>
      <RightSlot>
        <ThemeToggle
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </ThemeToggle>
      </RightSlot>
    </NavBarRoot>
  );
};

export default NavBar;
