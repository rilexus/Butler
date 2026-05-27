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
import { CollapsiblePanel } from "../../ui/CollapsiblePanel";
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

const useFlow = (name: string) => {
  const [messages, setMessages] = useState<UIMessage[]>([]);

  useEffect(() => {
    const handleStream = ({
      sender,
      data: {
        id,
        delta,
        type,
        finishReason,
        toolCallId,
        inputTextDelta,
        toolName,
        input,
      },
    }: StreamEvent) => {
      setMessages((prev) => {
        const msgId = `${sender}:${id}`;
        const idx = prev.findIndex((m) => m.id === id);
        const msg: UIMessage =
          idx !== -1
            ? { ...prev[idx], parts: [...prev[idx].parts] }
            : { id: id, role: "assistant", parts: [], sender };

        if (type === "text-delta" && delta != null) {
          const last = msg.parts[msg.parts.length - 1];
          if (last?.type === "text" && last.state === "streaming") {
            msg.parts[msg.parts.length - 1] = {
              ...last,
              text: last.text + delta,
            };
          } else {
            msg.parts.push({ type: "text", text: delta, state: "streaming" });
          }
        } else if (type === "reasoning-delta" && delta != null) {
          const last = msg.parts[msg.parts.length - 1];
          if (last?.type === "reasoning" && last.state === "streaming") {
            msg.parts[msg.parts.length - 1] = {
              ...last,
              text: last.text + delta,
            };
          } else {
            msg.parts.push({
              type: "reasoning",
              text: delta,
              state: "streaming",
            });
          }
        } else if (
          type === "tool-call-streaming-start" &&
          toolCallId &&
          toolName
        ) {
          msg.parts.push({
            type: `tool-${toolName}`,
            toolCallId,
            state: "input-streaming",
            input: undefined,
          });
        } else if (
          type === "tool-call-delta" &&
          toolCallId &&
          inputTextDelta != null
        ) {
          const ti = msg.parts.findIndex(
            (p) => "toolCallId" in p && p.toolCallId === toolCallId,
          );
          if (ti !== -1) {
            const p = msg.parts[ti] as ToolUIPart;
            msg.parts[ti] = {
              ...p,
              input:
                (typeof p.input === "string" ? p.input : "") + inputTextDelta,
            };
          }
        } else if (type === "tool-call" && toolCallId && toolName) {
          const ti = msg.parts.findIndex(
            (p) => "toolCallId" in p && p.toolCallId === toolCallId,
          );
          const next: ToolUIPart = {
            type: `tool-${toolName}`,
            toolCallId,
            state: "input-available",
            input,
          };
          if (ti !== -1) msg.parts[ti] = next;
          else msg.parts.push(next);
        } else if (type === "tool-result" && toolCallId) {
          const ti = msg.parts.findIndex(
            (p) => "toolCallId" in p && p.toolCallId === toolCallId,
          );
          if (ti !== -1) {
            msg.parts[ti] = {
              ...(msg.parts[ti] as ToolUIPart),
              state: "output-available",
              output: input,
            };
          }
        } else if (finishReason != null) {
          msg.parts = msg.parts.map((p) =>
            "state" in p && p.state === "streaming"
              ? { ...p, state: "done" }
              : p,
          );
        }

        if (idx === -1) return [...prev, msg];
        const updated = [...prev];
        updated[idx] = msg;
        return updated;
      });
    };
    const clean = window.ipc.on("workflow:stream", handleStream);
    return clean;
  }, []);

  const start = ({ name: n, prompt }: { name: string; prompt: string }) => {
    window.ipc.send("workflow:start", { name: n, prompt });
  };
  return {
    messages,
    sendMessage(message: UIMessage) {
      setMessages((s) => {
        const text = message.parts.find((p) => p.type === "text")?.text ?? "";
        start({ name, prompt: text });
        return [...s, message];
      });
    },
  };
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
};

export default function OrchestrationPage() {
  const [storeRaw, set] = useStore();
  const store = storeRaw as StoreShape;
  const [selectedWorkflowKey, setSelectedWorkflowKey] = useState<string>(
    () => store.workflows?.[0]?.name ?? "",
  );
  const { messages, sendMessage } = useFlow("poem");

  const workflows = store.workflows ?? [];
  const selectedWorkflow = workflows.find(
    (w) => w.name === selectedWorkflowKey,
  );
  const active = store.active;

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
      set((store) => ({
        ...store,
        workflows: [
          ...(store.workflows as Workflow[]),
          { id: uuid(), name, nodes: [], edges: [], agents: [] },
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
    (id: string, newName: string) => {
      const oldName = id.replace(/^node_/, "");
      set((store) => ({
        ...store,
        workflows: (store.workflows as Workflow[]).map((w) =>
          w.name === selectedWorkflowKey
            ? {
                ...w,
                nodes: w.nodes.map((n) =>
                  n.name === oldName ? { ...n, name: newName } : n,
                ),
                edges: w.edges.map((e) => ({
                  ...e,
                  from: e.from === oldName ? newName : e.from,
                  to: e.to === oldName ? newName : e.to,
                })),
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
          ? { ...w, nodes: [...w.nodes, { name, agent: "" }] }
          : w,
      ),
    }));
  }, [set, selectedWorkflow, selectedWorkflowKey]);

  const handleNodeFieldChange = useCallback(
    (nodeId: string, key: string, value: string) => {
      const name = nodeId.replace(/^node_/, "");
      set((store) => ({
        ...store,
        workflows: (store.workflows as Workflow[]).map((w) =>
          w.name === selectedWorkflowKey
            ? {
                ...w,
                nodes: w.nodes.map((n) =>
                  n.name === name ? { ...n, [key]: value } : n,
                ),
              }
            : w,
        ),
      }));
    },
    [set, selectedWorkflowKey],
  );

  const handleRemoveNode = useCallback(
    (id: string) => {
      const name = id.replace(/^node_/, "");
      set((store) => ({
        ...store,
        workflows: (store.workflows as Workflow[]).map((w) =>
          w.name === selectedWorkflowKey
            ? {
                ...w,
                nodes: w.nodes.filter((n) => n.name !== name),
                edges: w.edges.filter((e) => e.from !== name && e.to !== name),
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
        const nodeName = node.data.name as string;
        const nodeDef = selectedWorkflow?.nodes.find(
          (n) => n.name === nodeName,
        );
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
          workflows={workflows}
          selectedKey={selectedWorkflowKey}
          onSelect={setSelectedWorkflowKey}
          onDelete={handleDeleteWorkflow}
          onCreate={handleCreateWorkflow}
        />
        {/* <NodesList
          nodes={selectedWorkflow?.nodes ?? []}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRemove={handleRemoveNode}
          onAdd={handleAddNode}
        /> */}

        <Canvas onAddNode={handleAddNode}>
          {edges.map((edge) => (
            <CanvasEdge key={edge.id} edge={edge} />
          ))}
          {nodes.map((node) => {
            let isActive = false;
            const name = node.data.name as string;
            if (name in active) {
              isActive = active[name].status === "active";
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

        <CollapsiblePanel
          label="Chat"
          width={360}
          background="#fff"
          side="right"
        >
          <Chat
            messages={messages}
            onSubmit={(prompt) => {
              sendMessage({
                id: uuid(),
                role: "user",
                parts: [{ type: "text", text: prompt }],
              });
            }}
          />
        </CollapsiblePanel>
      </Flex>
    </PageRoot>
  );
}
