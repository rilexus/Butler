import { HashRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";

export const Router = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </HashRouter>
  );
};
