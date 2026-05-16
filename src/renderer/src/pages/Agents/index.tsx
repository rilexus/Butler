import { useCallback } from "react";
import { useStore } from "../../../../main/store/hooks/useStore";
import { AgentList } from "./components/AgentList";
import { PageRoot } from "../../components/PageRoot";
import { Flex } from "../../ui/Flex";

const AgentsPage = () => {
  const [storeRaw, set] = useStore();
  const store = storeRaw;
  const agents = store.agents ?? [];

  const handleCreateAgent = useCallback(
    (name: string, agent: { description: string; instructions: string }) => {
      const existingAgent = agents[0];
      set((store) => ({
        ...store,
        agents: [...store.agents, agent],
      }));
    },
    [agents, set],
  );

  return (
    <PageRoot>
      <Flex style={{ height: "100%" }}>
        <AgentList agents={agents} onCreateAgent={handleCreateAgent} />
      </Flex>
    </PageRoot>
  );
};

export default AgentsPage;
