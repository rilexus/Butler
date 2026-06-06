import { Settings, Server, Plug, Database } from "lucide-react";
import { SidebarRoot, NavList, NavItem, NavButton } from "./styles";

const ITEMS = [
  { id: "general", label: "General", Icon: Settings },
  { id: "providers", label: "Providers", Icon: Server },
  { id: "mcp", label: "MCP", Icon: Plug },
  { id: "state", label: "State", Icon: Database },
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
        {ITEMS.map(({ id, label, Icon }) => (
          <NavItem key={id}>
            <NavButton $active={selected === id} onClick={() => onClick(id)}>
              <Icon size={15} />
              {label}
            </NavButton>
          </NavItem>
        ))}
      </NavList>
    </SidebarRoot>
  );
};

export default Sidebar;
