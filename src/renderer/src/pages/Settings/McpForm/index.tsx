import { useState, useEffect } from "react";
import TextField from "@ui/TextField";
import Switch from "@ui/Switch";
import Button from "@ui/Button";
import { useStore } from "../../../../../main/store/hooks/useStore";
import {
  EmptyState,
  FormFooter,
  FormHeader,
  FormRoot,
  ServerName,
  ArgsInput,
  FieldLabel,
} from "./styles";
import { McpServer } from "./types";

type StoreState = Record<string, unknown>;

interface McpFormProps {
  serverId: string | null;
}

const McpForm = ({ serverId }: McpFormProps) => {
  const [servers, setServers] = useStore(
    ({ mcpServers }) => mcpServers as McpServer[],
  );

  const server = (servers ?? []).find((s) => s.id === serverId) ?? null;

  const [draft, setDraft] = useState<McpServer | null>(server);

  useEffect(() => {
    setDraft(server ?? null);
  }, [serverId]);

  if (!serverId) {
    return <EmptyState>Select an MCP server to view its settings</EmptyState>;
  }

  if (!server || !draft) {
    return <EmptyState>Server not found</EmptyState>;
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(server);

  const patch = (updates: Partial<McpServer>) =>
    setDraft((d) => (d ? { ...d, ...updates } : d));

  const save = () => {
    setServers((store: StoreState) => ({
      ...store,
      mcpServers: (store.mcpServers as McpServer[]).map((s) =>
        s.id === serverId ? { ...s, ...draft } : s,
      ),
    }));
  };

  const cancel = () => setDraft(server);

  const argsText = draft.args.join("\n");

  const handleArgsChange = (raw: string) => {
    patch({ args: raw.split("\n").filter((a) => a.trim() !== "") });
  };

  return (
    <FormRoot>
      <FormHeader>
        <ServerName>{draft.name}</ServerName>
        <Switch
          label="Enabled"
          checked={draft.enabled}
          onChange={(checked) => patch({ enabled: checked })}
        />
      </FormHeader>

      <TextField
        label="Name"
        value={draft.name}
        onChange={(e) => patch({ name: e.target.value })}
      />

      <TextField
        label="Command"
        placeholder="npx, node, python, ..."
        value={draft.command}
        onChange={(e) => patch({ command: e.target.value })}
      />

      <FieldLabel>
        Arguments (one per line)
        <ArgsInput
          value={argsText}
          placeholder="-y&#10;@modelcontextprotocol/server-filesystem&#10;/path/to/dir"
          onChange={(e) => handleArgsChange(e.target.value)}
        />
      </FieldLabel>

      <FormFooter>
        <Button variant="ghost" onClick={cancel} disabled={!isDirty}>
          Cancel
        </Button>
        <Button onClick={save} disabled={!isDirty}>
          Save
        </Button>
      </FormFooter>
    </FormRoot>
  );
};

export default McpForm;
