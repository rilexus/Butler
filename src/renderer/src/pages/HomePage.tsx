import { useRef, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Chat } from "../components/Chat";
import { useStore } from "../store/AppStore";

const Layout = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const SidebarPanel = styled.div`
  /* min-width: 160px;
  max-width: 480px; */
  flex-shrink: 0;
  background: transparent;
  border-right: 1px solid #2a2a4a;
  overflow: hidden;
`;

const ResizeHandle = styled.div`
  width: 4px;
  cursor: col-resize;
  background: transparent;
  flex-shrink: 0;
  transition: background 0.15s;
  &:hover,
  &:active {
    background: #e94560;
  }
`;

const MainPanel = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const Sidebar = () => {
  const assistants = useStore((state) => state.assistants);
  return (
    <div style={{ padding: "16px", color: "#888" }}>
      {assistants.map((assistant) => {
        const { id, name, icon } = assistant;
        return (
          <div key={id}>
            {icon}
            {name}
          </div>
        );
      })}
      <Link
        to="/orchestration"
        style={{
          display: "block",
          marginTop: "16px",
          color: "#888",
          textDecoration: "none",
        }}
      >
        Orchestration
      </Link>
    </div>
  );
};

const Window = ({ sidebar, main, min, max }) => {
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      startX.current = e.clientX;
      startWidth.current = sidebarWidth;

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        const delta = ev.clientX - startX.current;
        const next = Math.min(max, Math.max(min, startWidth.current + delta));
        setSidebarWidth(next);
      };

      const onMouseUp = () => {
        dragging.current = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [sidebarWidth],
  );

  const style = useMemo(
    () => ({
      width: `${sidebarWidth}px`,
    }),
    [sidebarWidth],
  );
  return (
    <Layout>
      <SidebarPanel style={style}>{sidebar}</SidebarPanel>
      <ResizeHandle onMouseDown={onMouseDown} />
      <MainPanel>{main}</MainPanel>
    </Layout>
  );
};

export const HomePage = () => {
  return <Window min={50} max={450} sidebar={<Sidebar />} main={<Chat />} />;
};
