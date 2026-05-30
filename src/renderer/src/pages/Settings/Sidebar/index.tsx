import { SidebarRoot, NavList, NavItem, NavButton } from "./styles";

const ITEMS = [
  { id: "general", label: "General" },
  { id: "providers", label: "Providers" },
] as const;

type Page = (typeof ITEMS)[number]["id"];

interface SidebarProps {
  selected: Page;
  onClick: (page: Page) => void;
}

const Sidebar = ({ selected, onClick }: SidebarProps) => {
  return (
    <SidebarRoot>
      <NavList>
        {ITEMS.map(({ id, label }) => (
          <NavItem key={id}>
            <NavButton $active={selected === id} onClick={() => onClick(id)}>
              {label}
            </NavButton>
          </NavItem>
        ))}
      </NavList>
    </SidebarRoot>
  );
};

export default Sidebar;
