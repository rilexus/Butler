import { HashRouter, Link, Route, Routes } from "react-router-dom";
import OrchestrationPage from "./pages/Orchestration";

const Header = () => {
  return (
    <div
      style={{
        padding: "50px 0 10px 0",
        borderBottom: "1px solid #2a2a4a",
      }}
    >
      <Link to="/orchestration">Orches</Link>
      <Link to="/">Start</Link>
    </div>
  );
};

export const Router = () => {
  return (
    <HashRouter>
      <Header />
      <Routes>
        {/* <Route path="/" element={<HomePage />} /> */}
        <Route path="/orchestration" element={<OrchestrationPage />} />
        <Route path="/" element={<OrchestrationPage />} />
      </Routes>
    </HashRouter>
  );
};
