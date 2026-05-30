import { PageRoot } from "../../components/PageRoot";
import { SettingsLayout } from "./styles";
import { useState } from "react";
import Sidebar from "./Sidebar";
import ProvidersPanel from "./ProvidersPanel";
import ProviderForm from "./ProviderForm";

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
  const [selectedPage, setSelectedPage] = useState<"general" | "providers">(
    "general",
  );

  return (
    <PageRoot>
      <SettingsLayout>
        <Sidebar selected={selectedPage} onClick={setSelectedPage} />
        {selectedPage === "general" && <div></div>}
        {selectedPage === "providers" && <Providers />}
      </SettingsLayout>
    </PageRoot>
  );
};

export default SettingsPage;
