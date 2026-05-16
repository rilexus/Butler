import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import OrchestrationPage from "./pages/Orchestration";
import AgentsPage from "./pages/Agents";
import NavBar from "./components/NavBar";
import { Flex } from "./ui/Flex";

export const Router = () => {
  return (
    <HashRouter>
      <Flex direction={"column"}>
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/workflows" replace />} />
          <Route path="/workflows" element={<OrchestrationPage />} />
          <Route path="/agents" element={<AgentsPage />} />
        </Routes>
      </Flex>
    </HashRouter>
  );
};
