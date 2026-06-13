import { useStore } from "@store/hooks/useStore";
import Switch from "@ui/Switch";
import { McpServer } from "../../../../../../../Settings/McpForm/types";
import { Empty, ServerList, ServerName, ServerRow } from "./styles";

type Props = {
  enabledIds: string[];
  onChange: (ids: string[]) => void;
};

const McpSection = ({ enabledIds, onChange }: Props) => {
  const [servers] = useStore(({ mcpServers }) => mcpServers as McpServer[]);
  const list = servers ?? [];

  if (list.length === 0) {
    return <Empty>No MCP servers configured</Empty>;
  }

  const toggle = (id: string, checked: boolean) => {
    onChange(
      checked ? [...enabledIds, id] : enabledIds.filter((s) => s !== id),
    );
  };

  return (
    <ServerList>
      {list.map(({ id, name }) => (
        <ServerRow key={id}>
          <ServerName>{name}</ServerName>
          <Switch
            label=""
            size="sm"
            checked={enabledIds.includes(id)}
            onChange={(checked) => toggle(id, checked)}
          />
        </ServerRow>
      ))}
    </ServerList>
  );
};

export default McpSection;
