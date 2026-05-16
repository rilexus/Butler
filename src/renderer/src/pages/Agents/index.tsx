import { useCallback } from "react";
import { useStore } from "../../../../main/store/hooks/useStore";
import { AgentList } from "./components/AgentList";
import { PageRoot } from "../../components/PageRoot";
import { Flex } from "../../ui/Flex";
import { WorkflowAgentDef } from "./types";

type StoreShape = {
  agents: WorkflowAgentDef[];
  agentsLibrary: WorkflowAgentDef[];
};

const AgentsPage = () => {
  const [storeRaw, set] = useStore();
  const store = storeRaw as StoreShape;
  const agents = store.agents ?? [];
  const agentsLibrary = store.agentsLibrary ?? [];

  const handleAddAgent = useCallback(
    (agent: WorkflowAgentDef) => {
      set((store) => ({
        ...store,
        agents: [...(store.agents as WorkflowAgentDef[]), agent],
      }));
    },
    [set],
  );

  return (
    <PageRoot>
      <Flex style={{ height: "100%" }}>
        <AgentList
          agents={agents}
          agentsLibrary={agentsLibrary}
          onAddAgent={handleAddAgent}
        />
      </Flex>
    </PageRoot>
  );
};

export default AgentsPage;
