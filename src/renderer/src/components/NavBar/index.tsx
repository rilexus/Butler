import {
  NavBarRoot,
  TabsBar,
  NavTab,
  Slot,
  RightSlot,
  ThemeToggle,
  NavIconLink,
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

const SettingsIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M7.5 9.5a2 2 0 100-4 2 2 0 000 4z"
      stroke="currentColor"
      strokeWidth="1.4"
    />
    <path
      d="M6.07 1.5l-.42 1.26a5.5 5.5 0 00-.9.52L3.5 2.84 1.84 4.5l.44 1.25a5.5 5.5 0 00-.52.9L.5 7.07v2.13l1.26.42c.13.32.31.62.52.9L1.84 11.5 3.5 13.16l1.25-.44c.28.21.58.39.9.52l.42 1.26h2.86l.42-1.26a5.5 5.5 0 00.9-.52l1.25.44 1.66-1.66-.44-1.25c.21-.28.39-.58.52-.9l1.26-.42V6.07l-1.26-.42a5.5 5.5 0 00-.52-.9l.44-1.25L11.5 1.84l-1.25.44a5.5 5.5 0 00-.9-.52L8.93 1.5H6.07z"
      stroke="currentColor"
      strokeWidth="1.4"
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
        {/* <ThemeToggle
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </ThemeToggle> */}
        <NavIconLink to="/settings" title="Settings">
          <SettingsIcon />
        </NavIconLink>
      </RightSlot>
    </NavBarRoot>
  );
};

export default NavBar;
