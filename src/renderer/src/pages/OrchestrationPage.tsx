import { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useStore } from "../../../main/store/hooks/useStore";
import Canvas from "../components/Diagram";
import { orchestraToCanvas } from "./orchestraToCanvas";

const pulseAnim = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.6); }
  70%  { box-shadow: 0 0 0 20px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
`;

const CIRCLE_R = 48;

const Circle = styled.div<{ $active?: boolean }>`
  position: absolute;
  width: ${CIRCLE_R * 2}px;
  height: ${CIRCLE_R * 2}px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? "#c1e8f4" : "white")};
  border: 2px solid ${({ $active }) => ($active ? "#3b82f6" : "#ccc")};
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  font-size: 0.8rem;
  color: #333;
  text-align: center;
  padding: 0.5rem;
  user-select: none;
  animation: ${({ $active }) => ($active ? pulseAnim : "")} 0.7s ease-out
    infinite;
`;

const canvas: Canvas = {
  metadata: {
    id: "cvs_01HZ4K9",
    name: "order-checkout-v2",
    activeLayerId: "lyr_main",
  },
  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
    width: 1440,
    height: 900,
  },
  layers: [
    {
      id: "lyr_main",
      name: "order-flow",
      visible: true,
      locked: false,
      opacity: 1,
      order: 0,
    },
  ],
  nodes: {},
  edges: {},
  history: {
    maxSize: 100,
    past: [],
    future: [],
  },
};

type AgentOn = {
  finish?: { actions?: Record<string, unknown>; targets?: string[] };
};

type Agent = {
  name: string;
  instructions?: string;
  model?: string;
  url?: string;
  tools?: string[];
  on?: AgentOn;
};

type Orchestra = {
  id: string;
  initial?: string;
  prompt?: string;
  context?: Record<string, unknown>;
  agents: Record<string, Agent>;
};

export default function OrchestrationPage() {
  const [{ orchestra }, set] = useStore();

  const derivedCanvas = orchestra
    ? orchestraToCanvas(orchestra as Orchestra, canvas)
    : canvas;

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      <button
        onClick={() => {
          window.ipc.send("concert:start");
        }}
      >
        RUN
      </button>
      <Canvas canvas={derivedCanvas} />
    </div>
  );
}
