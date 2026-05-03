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

const NODE_W = 160;
const NODE_H = 56;
const COL_GAP = 90;
const ROW_GAP = 44;
const START_X = 40;

const NODE_COLORS = [
  { fill: "#EEEDFE", stroke: "#534AB7", fontColor: "#3C3489" },
  { fill: "#E1F5EE", stroke: "#0F6E56", fontColor: "#085041" },
  { fill: "#E6F1FB", stroke: "#185FA5", fontColor: "#0C447C" },
  { fill: "#FAEEDA", stroke: "#854F0B", fontColor: "#633806" },
  { fill: "#F1EFE8", stroke: "#5F5E5A", fontColor: "#444441" },
];

export function orchestraToCanvas(orchestra: Orchestra, base: Canvas): Canvas {
  const agentKeys = Object.keys(orchestra.agents);

  // assign BFS levels from roots (nodes with no incoming edges)
  const inCount: Record<string, number> = Object.fromEntries(
    agentKeys.map((k) => [k, 0]),
  );
  for (const key of agentKeys) {
    for (const t of orchestra.agents[key].on?.finish?.targets ?? []) {
      if (t in inCount) inCount[t]++;
    }
  }

  const levels: Record<string, number> = {};
  const queue = agentKeys.filter((k) => inCount[k] === 0);
  queue.forEach((k) => (levels[k] = 0));

  while (queue.length > 0) {
    const key = queue.shift()!;
    for (const t of orchestra.agents[key].on?.finish?.targets ?? []) {
      const next = (levels[key] ?? 0) + 1;
      if (levels[t] === undefined || levels[t] < next) {
        levels[t] = next;
        queue.push(t);
      }
    }
  }

  // group keys by level, compute (x, y) positions
  const byLevel: Record<number, string[]> = {};
  for (const k of agentKeys) {
    const lvl = levels[k] ?? 0;
    (byLevel[lvl] ??= []).push(k);
  }

  const viewH = base.viewport?.height ?? 900;
  const positions: Record<string, { x: number; y: number }> = {};
  for (const [lvl, keys] of Object.entries(byLevel)) {
    const x = START_X + Number(lvl) * (NODE_W + COL_GAP);
    const totalH = keys.length * NODE_H + (keys.length - 1) * ROW_GAP;
    const startY = (viewH - totalH) / 2;
    keys.forEach((k, i) => {
      positions[k] = { x, y: startY + i * (NODE_H + ROW_GAP) };
    });
  }

  // build nodes
  const layerId = (base.metadata.activeLayerId as string) ?? "lyr_main";
  const nodes: Record<string, unknown> = {};

  agentKeys.forEach((key, i) => {
    const agent = orchestra.agents[key];
    const nodeId = `nd_${key}`;
    const targets = agent.on?.finish?.targets ?? [];
    const hasOut = targets.length > 0;
    const hasIn = agentKeys.some((k) =>
      (orchestra.agents[k].on?.finish?.targets ?? []).includes(key),
    );
    const color = NODE_COLORS[i % NODE_COLORS.length];

    const ports: unknown[] = [];
    if (hasIn)
      ports.push({
        id: `pt_${key}_in`,
        nodeId,
        position: "left",
        direction: "in",
      });
    if (hasOut)
      ports.push({
        id: `pt_${key}_out`,
        nodeId,
        position: "right",
        direction: "out",
      });

    nodes[nodeId] = {
      id: nodeId,
      type: "rectangle",
      position: positions[key],
      size: { width: NODE_W, height: NODE_H },
      rotation: 0,
      zIndex: i + 1,
      locked: false,
      visible: true,
      layerId,
      groupId: null,
      style: {
        ...color,
        strokeWidth: 0.5,
        opacity: 1,
        borderRadius: 8,
        label: agent.name,
        labelPosition: "center",
        fontSize: 14,
      },
      ports,
      data: {
        model: agent.model,
        tools: agent.tools,
        instructions: agent.instructions,
      },
    };
  });

  // build edges from targets
  const edges: Record<string, unknown> = {};

  for (const key of agentKeys) {
    for (const targetKey of orchestra.agents[key].on?.finish?.targets ?? []) {
      const edgeId = `eg_${key}_${targetKey}`;
      const src = positions[key];
      const tgt = positions[targetKey];
      edges[edgeId] = {
        id: edgeId,
        type: "orthogonal",
        label: "finish",
        zIndex: 0,
        layerId,
        waypoints: [
          { x: src.x + NODE_W, y: src.y + NODE_H / 2 },
          { x: tgt.x, y: tgt.y + NODE_H / 2 },
        ],
        source: { nodeId: `nd_${key}`, portId: `pt_${key}_out` },
        target: { nodeId: `nd_${targetKey}`, portId: `pt_${targetKey}_in` },
        style: {
          stroke: "#888780",
          strokeWidth: 1,
          startMarker: "none",
          endMarker: "arrow",
          opacity: 0.7,
        },
      };
    }
  }

  return { ...base, nodes, edges } as unknown as Canvas;
}
