import { useState, useEffect } from "react";
import TextField from "@ui/TextField";
import Switch from "@ui/Switch";
import Select from "@ui/Select";
import Button from "@ui/Button";
import { useStore } from "../../../../../main/store/hooks/useStore";
import {
  EmptyState,
  FormFooter,
  FormHeader,
  FormRoot,
  ProviderName,
} from "./styles";

import { Provider } from "../../../../../main/store";

type StoreState = Record<string, unknown>;

const TYPE_OPTIONS = [
  { value: "anthropic", label: "Anthropic" },
  { value: "open-ai", label: "OpenAI" },
  { value: "ollama", label: "Ollama" },
];

interface ProviderFormProps {
  providerId: string | null;
}

const ProviderForm = ({ providerId }: ProviderFormProps) => {
  const [providers, setProviders] = useStore(
    ({ providers }) => providers as Provider[],
  );

  const provider = (providers ?? []).find((p) => p.id === providerId) ?? null;

  const [draft, setDraft] = useState<Provider | null>(provider);

  useEffect(() => {
    setDraft(provider ?? null);
  }, [providerId]);

  if (!providerId) {
    return <EmptyState>Select a provider to view its settings</EmptyState>;
  }

  if (!provider || !draft) {
    return <EmptyState>Provider not found</EmptyState>;
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(provider);

  const patch = (updates: Partial<Provider>) =>
    setDraft((d) => (d ? { ...d, ...updates } : d));

  const save = () => {
    setProviders((store: StoreState) => ({
      ...store,
      providers: (store.providers as Provider[]).map((p) =>
        p.id === providerId ? { ...p, ...draft } : p,
      ),
    }));
  };

  const cancel = () => setDraft(provider);

  return (
    <FormRoot>
      <FormHeader>
        <ProviderName>{draft.name}</ProviderName>
        <Switch
          label="Enabled"
          checked={draft.active}
          onChange={(checked) => patch({ active: checked })}
        />
      </FormHeader>

      <TextField
        label="Name"
        value={draft.name}
        onChange={(e) => patch({ name: e.target.value })}
      />

      <Select
        label="Type"
        options={TYPE_OPTIONS}
        value={draft.type}
        onChange={(value) => patch({ type: value })}
      />

      <TextField
        label="Base URL"
        placeholder="https://api.example.com/v1"
        value={draft.url}
        onChange={(e) => patch({ url: e.target.value })}
      />

      <TextField
        label="API Key"
        placeholder="sk-..."
        value={draft.apiKey}
        onChange={(e) => patch({ apiKey: e.target.value })}
      />

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

export default ProviderForm;
