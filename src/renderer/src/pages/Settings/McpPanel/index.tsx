import { useState } from "react";
import {
  PanelRoot,
  PanelTitle,
  NavList,
  NavItem,
  NavButton,
  AddButton,
} from "./styles";
import Modal from "@ui/Modal";
import TextField from "@ui/TextField";
import Button from "@ui/Button";
import { v4 as uuid } from "uuid";
import { useStore } from "../../../../../main/store/hooks/useStore";
import { McpServer } from "../McpForm/types";

interface McpPanelProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const McpPanel = ({ selectedId, onSelect }: McpPanelProps) => {
  const [servers, setServers] = useStore(
    ({ mcpServers }) => mcpServers as McpServer[],
  );

  const [name, setName] = useState("");

  const handleAdd = (close: () => void) => {
    if (!name.trim()) return;
    const newServer: McpServer = {
      id: uuid(),
      name: name.trim(),
      command: "",
      args: [],
      enabled: true,
    };
    setServers((store) => ({
      ...store,
      mcpServers: [...((store.mcpServers as McpServer[]) ?? []), newServer],
    }));
    setName("");
    close();
  };

  return (
    <PanelRoot>
      <PanelTitle>MCP Servers</PanelTitle>
      <NavList>
        {(servers ?? []).map(({ id, name }) => (
          <NavItem key={id}>
            <NavButton $active={selectedId === id} onClick={() => onSelect(id)}>
              {name}
            </NavButton>
          </NavItem>
        ))}
      </NavList>
      <Modal
        title="Add MCP Server"
        trigger={<AddButton>+ Add Server</AddButton>}
        footer={(close) => (
          <Button disabled={!name.trim()} onClick={() => handleAdd(close)}>
            Add
          </Button>
        )}
      >
        <TextField
          label="Name"
          placeholder="My MCP Server"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Modal>
    </PanelRoot>
  );
};

export default McpPanel;
