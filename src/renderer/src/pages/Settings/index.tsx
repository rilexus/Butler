import { PageRoot } from "../../components/PageRoot";
import { SettingsLayout } from "./styles";
import { useState } from "react";
import Sidebar from "./Sidebar";
import ProvidersPanel from "./ProvidersPanel";
import ProviderForm from "./ProviderForm";
import StatePanel from "./StatePanel";
import McpPanel from "./McpPanel";
import McpForm from "./McpForm";

const Providers = () => {
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  );
  return (
    <div
      style={{
        display: "flex",
      }}
    >
      <ProvidersPanel
        selectedProviderId={selectedProviderId}
        onSelect={setSelectedProviderId}
      />
      <ProviderForm providerId={selectedProviderId} />
    </div>
  );
};

const Mcp = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", flex: 1 }}>
      <McpPanel selectedId={selectedId} onSelect={setSelectedId} />
      <McpForm serverId={selectedId} />
    </div>
  );
};

const SettingsPage = () => {
  const [selectedPage, setSelectedPage] = useState<
    "general" | "providers" | "mcp" | "state"
  >("general");

  return (
    <PageRoot>
      <SettingsLayout>
        <Sidebar selected={selectedPage} onClick={setSelectedPage} />
        {selectedPage === "general" && <div></div>}
        {selectedPage === "providers" && <Providers />}
        {selectedPage === "mcp" && <Mcp />}
        {selectedPage === "state" && <StatePanel />}
      </SettingsLayout>
    </PageRoot>
  );
};

export default SettingsPage;
