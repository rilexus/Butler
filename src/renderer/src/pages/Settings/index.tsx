import { PageRoot } from "../../components/PageRoot";
import { SettingsLayout } from "./styles";
import { useState } from "react";
import Sidebar from "./Sidebar";
import ProvidersPanel from "./ProvidersPanel";
import ProviderForm from "./ProviderForm";
import StatePanel from "./StatePanel";

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

const SettingsPage = () => {
  const [selectedPage, setSelectedPage] = useState<
    "general" | "providers" | "state"
  >("general");

  return (
    <PageRoot>
      <SettingsLayout>
        <Sidebar selected={selectedPage} onClick={setSelectedPage} />
        {selectedPage === "general" && <div></div>}
        {selectedPage === "providers" && <Providers />}
        {selectedPage === "state" && <StatePanel />}
      </SettingsLayout>
    </PageRoot>
  );
};

export default SettingsPage;
