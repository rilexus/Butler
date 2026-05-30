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

type Provider = {
  id: string;
  active: boolean;
  name: string;
  url: string;
  apiKey: string;
  models: { id: string; name: string }[];
  headers: Record<string, string>;
};

interface ProvidersPanelProps {
  selectedProviderId: string | null;
  onSelect: (id: string) => void;
}

const ProvidersPanel = ({ selectedProviderId, onSelect }: ProvidersPanelProps) => {
  const [providers, setProviders] = useStore(({ providers }) => providers);

  const [name, setName] = useState("");

  const handleAdd = (close: () => void) => {
    if (!name.trim()) return;
    const newProvider: Provider = {
      id: uuid(),
      active: true,
      name: name.trim(),
      url: "",
      apiKey: "",
      models: [],
      headers: {},
    };
    setProviders((store) => ({
      ...store,
      providers: [...((store.providers as Provider[]) ?? []), newProvider],
    }));
    setName("");
    close();
  };

  return (
    <PanelRoot>
      <PanelTitle>Providers</PanelTitle>
      <NavList>
        {(providers as Provider[])?.map(({ id, name }) => (
          <NavItem key={id}>
            <NavButton
              $active={selectedProviderId === id}
              onClick={() => onSelect(id)}
            >
              {name}
            </NavButton>
          </NavItem>
        ))}
      </NavList>
      <Modal
        title="Add Provider"
        trigger={<AddButton>+ Add Provider</AddButton>}
        footer={(close) => (
          <Button disabled={!name.trim()} onClick={() => handleAdd(close)}>
            Add
          </Button>
        )}
      >
        <TextField
          label="Name"
          placeholder="My Provider"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Modal>
    </PanelRoot>
  );
};

export default ProvidersPanel;
