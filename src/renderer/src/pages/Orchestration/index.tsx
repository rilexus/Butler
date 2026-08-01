import { useCallback, useEffect, useMemo, useState } from "react";
import { useStore } from "../../../../main/store/hooks/useStore";
import Canvas, {
  CanvasEdge,
  CanvasNode,
  deriveCanvas,
  Edge,
  FlowNode,
  Point,
} from "./components/Canvas";
import { Flex } from "../../ui/Flex";
import { Chat } from "../../components/Chat";
import { WorkflowList } from "./components/WorkflowList";
import { Workflow, WorkflowAgentDef } from "./types";
import { ExpandiblePanel } from "../../ui/ExpandiblePanel";
import { v4 as uuid } from "uuid";
import { PageRoot } from "../../components/PageRoot";

type TextUIPart = { type: "text"; text: string; state?: "streaming" | "done" };
type ReasoningUIPart = {
  type: "reasoning";
  text: string;
  state?: "streaming" | "done";
};
type ToolUIPart = {
  type: `tool-${string}`;
  toolCallId: string;
  state:
    | "input-streaming"
    | "input-available"
    | "output-available"
    | "output-error";
  input?: unknown;
  output?: unknown;
  errorText?: string;
};
type UIMessagePart = TextUIPart | ReasoningUIPart | ToolUIPart;
type UIMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  parts: UIMessagePart[];
  sender?: string;
};
type StreamEvent = {
  type: string;
  sender: string;
  data: {
    id: string;
    type: string;
    delta?: string;
    finishReason?: string;
    toolCallId?: string;
    inputTextDelta?: string;
    toolName?: string;
    input?: unknown;
  };
};

const useFlow = (selectedSessionId: string | number | undefined) => {
  const [storeRaw] = useStore();
  const store = storeRaw as any;

  const sessions: any[] = store?.sessions ?? [];
  const session =
    sessions.find((s: any) => s?.id === selectedSessionId) ?? null;
  const storedMessages = session?.messages ?? [];

  const sendMessage = useCallback(
    (text: string) => {
      if (!session) return;
      const message = { role: "user", parts: [{ type: "text", text }] };
      window.ipc.send("workflow:message", { session, message });
    },
    [session],
  );

  return { sendMessage, messages: storedMessages };
};

function getPortCenter(node: FlowNode, portId: string): Point {
  const port = node.ports.find((p) => p.id === portId);
  if (!port) return { x: node.position.x, y: node.position.y };
  const { x, y } = node.position;
  const { width, height } = node.size;
  switch (port.position) {
    case "top":
      return { x: x + width / 2, y };
    case "right":
      return { x: x + width, y: y + height / 2 };
    case "bottom":
      return { x: x + width / 2, y: y + height };
    case "left":
      return { x, y: y + height / 2 };
    case "custom":
      return port.offset
        ? { x: x + port.offset.x, y: y + port.offset.y }
        : { x, y };
  }
}

type StoreShape = {
  workflows: Workflow[];
  active: Record<string, { status: string }>;
  agents: WorkflowAgentDef[];
  selectedSession: string | number | undefined;
  sessions: unknown[];
};

export default function OrchestrationPage() {
  const [storeRaw, set] = useStore();
  const store = storeRaw as StoreShape;
  const [selectedWorkflowKey, setSelectedWorkflowKey] = useState<string>(
    () => store.workflows?.[0]?.name ?? "",
  );

  const workflows = store.workflows ?? [];
  const selectedWorkflow = workflows.find(
    (w) => w.name === selectedWorkflowKey,
  );
  const active = store.active;

  console.log({ selectedWorkflow: selectedWorkflow?.id });

  const { messages, sendMessage } = useFlow(store.selectedSession);

  const derivedCanvas = useMemo(
    () =>
      deriveCanvas(
        selectedWorkflow?.nodes ?? [],
        selectedWorkflow?.edges ?? [],
      ),
    [selectedWorkflow],
  );

  const [nodePositionOverrides, setNodePositionOverrides] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const handleDeleteWorkflow = useCallback(
    (key: string) => {
      set((store) => ({
        ...store,
        workflows: (store.workflows as Workflow[]).filter(
          (w) => w.name !== key,
        ),
      }));
      setSelectedWorkflowKey((prev) => {
        if (prev !== key) return prev;
        const remaining = workflows.filter((w) => w.name !== key);
        return remaining[0]?.name ?? "";
      });
    },
    [set, workflows],
  );

  const handleCreateWorkflow = useCallback(
    (name: string) => {
      const workflowId = uuid();
      set((store) => ({
        ...store,
        sessions: [
          ...store.sessions,
          {
            id: uuid(),
            workflow: { id: workflowId },
            agent: { id: null },
            name: "New Session",
            messages: [],
            startedAt: new Date().toISOString(),
          },
        ],
        workflows: [
          ...(store.workflows as Workflow[]),
          { id: workflowId, name, nodes: [], edges: [], agents: [] },
        ],
      }));
      setSelectedWorkflowKey(name);
    },
    [set],
  );

  const handleNodePositionChange = useCallback(
    (id: string, pos: { x: number; y: number }) => {
      setNodePositionOverrides((prev) => ({ ...prev, [id]: pos }));
    },
    [],
  );

  const handleRenameNode = useCallback(
    (canvasId: string, newName: string) => {
      const nodeId = canvasId.replace(/^node_/, "");
      set((store) => ({
        ...store,
        workflows: (store.workflows as Workflow[]).map((w) =>
          w.name === selectedWorkflowKey
            ? {
                ...w,
                nodes: w.nodes.map((n) =>
                  n.id === nodeId ? { ...n, name: newName } : n,
                ),
              }
            : w,
        ),
      }));
    },
    [set, selectedWorkflowKey],
  );

  const handleAddNode = useCallback(() => {
    const existingNames = new Set(
      selectedWorkflow?.nodes.map((n) => n.name) ?? [],
    );
    let i = 1;
    while (existingNames.has(`Node ${i}`)) i++;
    const name = `Node ${i}`;
    set((store) => ({
      ...store,
      workflows: (store.workflows as Workflow[]).map((w) =>
        w.name === selectedWorkflowKey
          ? {
              ...w,
              nodes: [
                ...w.nodes,
                { id: uuid(), name, role: "agent", agent: "" },
              ],
            }
          : w,
      ),
    }));
  }, [set, selectedWorkflow, selectedWorkflowKey]);

  const handleNodeFieldChange = useCallback(
    (canvasId: string, key: string, value: string) => {
      const nodeId = canvasId.replace(/^node_/, "");

      set((store) => ({
        ...store,
        workflows: (store.workflows as Workflow[]).map((w) =>
          w.name === selectedWorkflowKey
            ? {
                ...w,
                nodes: w.nodes.map((n) =>
                  n.id === nodeId ? { ...n, [key]: value } : n,
                ),
              }
            : w,
        ),
      }));
    },
    [set, selectedWorkflowKey],
  );

  const handleRemoveEdge = useCallback(
    (edgeId: string) => {
      const idx = parseInt(edgeId.replace(/^edge_/, ""), 10);
      set((store) => ({
        ...store,
        workflows: (store.workflows as Workflow[]).map((w) =>
          w.name === selectedWorkflowKey
            ? { ...w, edges: w.edges.filter((_, i) => i !== idx) }
            : w,
        ),
      }));
    },
    [set, selectedWorkflowKey],
  );

  const handleEdgeCreate = useCallback(
    (
      sourceNodeId: string,
      _sourcePortId: string,
      targetNodeId: string,
      _targetPortId: string,
    ) => {
      const fromId = sourceNodeId.replace(/^node_/, "");
      const toId = targetNodeId.replace(/^node_/, "");
      if (
        selectedWorkflow?.edges.some((e) => e.from === fromId && e.to === toId)
      )
        return;
      set((store) => ({
        ...store,
        workflows: (store.workflows as Workflow[]).map((w) =>
          w.name === selectedWorkflowKey
            ? { ...w, edges: [...w.edges, { from: fromId, to: toId }] }
            : w,
        ),
      }));
    },
    [set, selectedWorkflowKey, selectedWorkflow],
  );

  const handleRemoveNode = useCallback(
    (canvasId: string) => {
      const nodeId = canvasId.replace(/^node_/, "");
      set((store) => ({
        ...store,
        workflows: (store.workflows as Workflow[]).map((w) =>
          w.name === selectedWorkflowKey
            ? {
                ...w,
                nodes: w.nodes.filter((n) => n.id !== nodeId),
                edges: w.edges.filter(
                  (e) => e.from !== nodeId && e.to !== nodeId,
                ),
              }
            : w,
        ),
      }));
    },
    [set, selectedWorkflowKey],
  );

  const nodes = useMemo(
    () =>
      Object.values(
        derivedCanvas.nodes as unknown as Record<string, FlowNode>,
      ).map((node) => {
        const nodeId = node.data.id as string;
        const nodeDef = selectedWorkflow?.nodes.find((n) => n.id === nodeId);
        return {
          ...node,
          position: nodePositionOverrides[node.id] ?? node.position,
          data: { ...node.data, agent: nodeDef } as Record<string, unknown>,
        };
      }),
    [derivedCanvas, nodePositionOverrides, selectedWorkflow],
  );

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const edges = useMemo(
    () =>
      Object.values(derivedCanvas.edges as unknown as Record<string, Edge>).map(
        (edge) => {
          const srcNode = nodeById.get(edge.source.nodeId ?? "");
          const tgtNode = nodeById.get(edge.target.nodeId ?? "");
          if (
            !srcNode ||
            !tgtNode ||
            !edge.source.portId ||
            !edge.target.portId
          )
            return edge;
          return {
            ...edge,
            waypoints: [
              getPortCenter(srcNode, edge.source.portId),
              getPortCenter(tgtNode, edge.target.portId),
            ],
          };
        },
      ),
    [derivedCanvas, nodeById],
  );

  return (
    <PageRoot>
      <Flex style={{ height: "100%" }}>
        <WorkflowList
          onSelect={setSelectedWorkflowKey}
          onDelete={handleDeleteWorkflow}
          onCreate={handleCreateWorkflow}
        />

        <Canvas onAddNode={handleAddNode} onEdgeCreate={handleEdgeCreate}>
          {edges.map((edge) => (
            <CanvasEdge key={edge.id} edge={edge} onRemove={handleRemoveEdge} />
          ))}
          {nodes.map((node) => {
            let isActive = false;
            const id = node.data.agent.id as string;

            if (id in active) {
              isActive = active[id].status === "active";
            }

            return (
              <CanvasNode
                key={node.id}
                active={isActive}
                node={node}
                onPositionChange={handleNodePositionChange}
                onRemove={handleRemoveNode}
                onRename={handleRenameNode}
                onAgentFieldChange={handleNodeFieldChange}
              />
            );
          })}
        </Canvas>

        <ExpandiblePanel width={360} background="#fff" side="right">
          <Chat messages={messages} onSubmit={sendMessage} />
        </ExpandiblePanel>
      </Flex>
    </PageRoot>
  );
}
