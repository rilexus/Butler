import { EventEmitter } from "node:events";
import { ToolLoopAgent, tool } from "ai";
import { z } from "zod";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const graph = {
  nodes: [
    {
      id: 1,
      instructions:
        "You receive a number and you add 1 (one) to it. Return only the resuilt",
    },
    {
      id: 2,
      instructions:
        "You receive a number and you add 1 (one) to it. Return only the resuilt",
    },
    {
      id: 3,
      instructions:
        "You receive a number and you add 1 (one) to it. Return only the resuilt",
    },
    {
      id: 4,
      instructions:
        "You receive a number and you add 1 (one) to it. Return only the resuilt",
    },
  ],
  edges: [
    {
      from: 1,
      type: "next",
      to: 2,
    },
    {
      from: 1,
      type: "next",
      to: 4,
    },
    {
      from: 1,
      type: "subagent",
      to: 3,
    },
  ],
};

class DAGOrchestrator extends EventEmitter {
  constructor() {
    super();
    this.nodes = new Map(); // node name → agent
    this.edges = new Map(); // node name → [dependencies]
    this.results = new Map(); // node name → execution result
    this.executionOrder = [];
  }

  // Define a node in the DAG
  addNode(name, agent) {
    this.nodes.set(name, agent);
    if (!this.edges.has(name)) {
      this.edges.set(name, []);
    }
  }

  // Define an edge (dependency)
  addEdge(from, to) {
    // 'to' depends on 'from'
    if (!this.edges.has(to)) {
      this.edges.set(to, []);
    }
    this.edges.get(to).push(from);
  }

  // Topological sort to determine execution order (for visualization)
  topologicalSort() {
    const visited = new Set();
    const stack = [];

    const visit = (node) => {
      if (visited.has(node)) return;
      visited.add(node);

      // Visit all nodes that depend on this one
      for (const [dependent, dependencies] of this.edges) {
        if (dependencies.includes(node) && !visited.has(dependent)) {
          visit(dependent);
        }
      }
      stack.push(node);
    };

    for (const node of this.nodes.keys()) {
      visit(node);
    }

    return stack;
  }

  // Find all nodes ready to execute (all dependencies satisfied)
  getReadyNodes() {
    const ready = [];
    for (const [nodeName, dependencies] of this.edges) {
      const allDependenciesMet = dependencies.every((dep) =>
        this.results.has(dep),
      );
      if (
        allDependenciesMet &&
        !this.results.has(nodeName) &&
        this.nodes.has(nodeName)
      ) {
        ready.push(nodeName);
      }
    }
    return ready;
  }

  // Execute the entire DAG
  async execute(prompt) {
    console.log("\n📊 DAG EXECUTION STARTED\n");
    console.log(this.visualizeDAG());
    this.emit("execution:start", { prompt });

    let executionPhase = 0;

    while (this.results.size < this.nodes.size) {
      const readyNodes = this.getReadyNodes();

      if (readyNodes.length === 0) {
        console.error("❌ Circular dependency detected!");
        this.emit("execution:error", {
          reason: "circular-dependency",
        });
        break;
      }

      executionPhase++;
      console.log(
        `\n⏱️  PHASE ${executionPhase}: Executing ${readyNodes.length} node(s) in parallel`,
      );
      console.log(`   Ready nodes: ${readyNodes.join(", ")}`);
      this.emit("phase:start", {
        phase: executionPhase,
        readyNodes,
      });

      // Execute all ready nodes in parallel
      const executionPromises = readyNodes.map((nodeName) =>
        this.executeNode(nodeName, prompt),
      );

      await Promise.all(executionPromises);

      console.log(`   ✅ Phase ${executionPhase} complete\n`);
      this.emit("phase:complete", { phase: executionPhase });
    }

    this.emit("execution:complete", { results: this.results });

    return this.results;
  }

  // Execute a single node
  async executeNode(nodeName, input) {
    const agent = this.nodes.get(nodeName);
    const dependencies = this.edges.get(nodeName);

    // If any dependency failed, this node can't be given a meaningful
    // prompt — fail it too instead of running with missing input.
    const failedDependencies = dependencies.filter(
      (dep) => this.results.get(dep)?.status === "failed",
    );
    if (failedDependencies.length > 0) {
      console.error(
        `     ⏭️  ${nodeName} skipped: upstream dependency failed (${failedDependencies.join(", ")})`,
      );
      const result = {
        status: "failed",
        error: `Upstream dependency failed: ${failedDependencies.join(", ")}`,
      };
      this.results.set(nodeName, result);
      this.emit("node:failed", { nodeName, result, reason: "upstream-failure" });
      return;
    }

    console.log(`   → Executing: ${nodeName}`);
    this.emit("node:start", { nodeName });

    try {
      // Root nodes (no dependencies) receive the original prompt.
      // Dependent nodes receive their parent's output as the prompt.
      const prompt =
        dependencies.length > 0
          ? dependencies.map((dep) => this.results.get(dep).output).join("\n")
          : `${input}`;

      const { text } = await agent.generate({ prompt });

      // Store result (simplified - in real scenario would parse structured output)
      const result = {
        status: "completed",
        output: text,
        timestamp: new Date().toISOString(),
      };
      this.results.set(nodeName, result);

      console.log(`     ✓ ${nodeName} completed`);
      this.emit("node:complete", { nodeName, result });
    } catch (error) {
      console.error(`     ❌ ${nodeName} failed: ${error.message}`);
      const result = {
        status: "failed",
        error: error.message,
      };
      this.results.set(nodeName, result);
      this.emit("node:failed", { nodeName, result });
    }
  }

  // Visualize the DAG
  visualizeDAG() {
    let viz = "📈 DAG STRUCTURE:\n\n";

    const sortedNodes = this.topologicalSort();

    for (const nodeName of sortedNodes) {
      const dependencies = this.edges.get(nodeName);
      if (dependencies.length === 0) {
        viz += `  [${nodeName}] (START)\n`;
      } else {
        viz += `  [${nodeName}]\n`;
        viz += `    ↑ depends on: ${dependencies.join(", ")}\n`;
      }
    }

    return viz;
  }

  // Show execution timeline
  showTimeline() {
    console.log("\n⏲️  EXECUTION TIMELINE:\n");

    let phase = 1;
    const timeline = this.groupByPhase();

    for (const phaseNodes of timeline) {
      console.log(`  Phase ${phase}: ${phaseNodes.join(", ")}`);
      phase++;
    }
  }

  // Group nodes by execution phase
  groupByPhase() {
    const phases = [];
    const phaseMap = new Map();
    const visited = new Set();

    const getPhase = (nodeName, currentPhase = 0) => {
      if (phaseMap.has(nodeName)) return phaseMap.get(nodeName);

      const dependencies = this.edges.get(nodeName);
      if (dependencies.length === 0) {
        phaseMap.set(nodeName, currentPhase);
        return currentPhase;
      }

      const maxDepPhase = Math.max(
        ...dependencies.map((dep) => getPhase(dep, currentPhase)),
      );
      const nodePhase = maxDepPhase + 1;
      phaseMap.set(nodeName, nodePhase);
      return nodePhase;
    };

    for (const nodeName of this.nodes.keys()) {
      getPhase(nodeName);
    }

    const maxPhase = Math.max(...phaseMap.values());
    for (let i = 0; i <= maxPhase; i++) {
      const phaseNodes = Array.from(phaseMap.entries())
        .filter(([_, phase]) => phase === i)
        .map(([node, _]) => node);
      phases.push(phaseNodes);
    }

    return phases;
  }
}

export const buildDAG = (graph) => {
  const dag = new DAGOrchestrator();

  const { nodes, edges } = graph;
  const nodesById = new Map(nodes.map((node) => [node.id, node]));

  const lmStudioClient = createOpenAICompatible({
    name: "lmstudio",
    baseURL: "http://127.0.0.1:1234/v1",
  });

  // Subagent edges attach the child node as a callable tool on the parent
  // rather than as a node in the DAG's own execution flow.
  const subagentIdsByParent = new Map();
  for (const edge of edges) {
    if (edge.type !== "subagent") continue;
    if (!subagentIdsByParent.has(edge.from)) {
      subagentIdsByParent.set(edge.from, []);
    }
    subagentIdsByParent.get(edge.from).push(edge.to);
  }
  const subagentTargetIds = new Set(
    edges.filter((edge) => edge.type === "subagent").map((edge) => edge.to),
  );

  const makeAgent = (node, tools) =>
    new ToolLoopAgent({
      model: lmStudioClient(node.modelName),
      instructions: node.instructions,
      ...(tools && { tools }),
    });

  for (const node of nodes) {
    // Nodes that only exist as a subagent target are invoked via their
    // parent's tool call, not scheduled as their own DAG node.
    if (subagentTargetIds.has(node.id)) continue;

    const subagentIds = subagentIdsByParent.get(node.id);
    if (!subagentIds || subagentIds.length === 0) {
      dag.addNode(node.id, makeAgent(node));
      continue;
    }

    const tools = {};
    for (const subagentId of subagentIds) {
      const subagentNode = nodesById.get(subagentId);
      const subagentAgent = makeAgent(subagentNode);
      tools[`subagent_${subagentId}`] = tool({
        description: `Delegate to a subagent that: ${subagentNode.instructions}`,
        inputSchema: z.object({
          input: z.string().describe("The input to pass to the subagent"),
        }),
        execute: async ({ input }) => {
          dag.emit("subagent:start", {
            nodeName: node.id,
            subagentId,
            input,
          });

          try {
            const { text } = await subagentAgent.generate({ prompt: input });
            dag.emit("subagent:complete", {
              nodeName: node.id,
              subagentId,
              output: text,
            });
            return text;
          } catch (error) {
            dag.emit("subagent:failed", {
              nodeName: node.id,
              subagentId,
              error: error.message,
            });
            throw error;
          }
        },
      });
    }

    dag.addNode(
      node.id,
      makeAgent(
        {
          ...node,
          instructions: `${node.instructions}\n\nYou have access to subagent tool(s) that can handle parts of this task. Call them if appropriate.`,
        },
        tools,
      ),
    );
  }

  for (const edge of edges) {
    const { from, to, type } = edge;
    if (type === "next") {
      dag.addEdge(from, to);
    }
  }

  return dag;
};

// ============================================
// MAIN EXECUTION
// ============================================

const main = async () => {
  console.log("=== Graph-Based Orchestration (DAG) ===");

  const dag = buildDAG(graph);
  dag.on("execution:start", ({ prompt }) =>
    console.log(`🔔 execution:start`, { prompt }),
  );
  dag.on("execution:complete", ({ results }) =>
    console.log(`🔔 execution:complete`, { results }),
  );
  dag.on("execution:error", ({ reason }) =>
    console.log(`🔔 execution:error`, { reason }),
  );
  dag.on("phase:start", ({ phase, readyNodes }) =>
    console.log(`🔔 phase:start`, { phase, readyNodes }),
  );
  dag.on("phase:complete", ({ phase }) =>
    console.log(`🔔 phase:complete`, { phase }),
  );
  dag.on("node:start", ({ nodeName }) =>
    console.log(`🔔 node:start`, { nodeName }),
  );
  dag.on("node:complete", ({ nodeName, result }) =>
    console.log(`🔔 node:complete`, { nodeName, result }),
  );
  dag.on("node:failed", ({ nodeName, result }) =>
    console.log(`🔔 node:failed`, { nodeName, result }),
  );
  dag.on("subagent:start", ({ nodeName, subagentId, input }) =>
    console.log(`🔔 subagent:start`, { nodeName, subagentId, input }),
  );
  dag.on("subagent:complete", ({ nodeName, subagentId, output }) =>
    console.log(`🔔 subagent:complete`, { nodeName, subagentId, output }),
  );
  dag.on("subagent:failed", ({ nodeName, subagentId, error }) =>
    console.log(`🔔 subagent:failed`, { nodeName, subagentId, error }),
  );

  console.log(dag.visualizeDAG());

  try {
    const startTime = Date.now();
    const results = await dag.execute("0");
    const totalTime = Date.now() - startTime;

    console.log("\n📊 EXECUTION SUMMARY\n");
    dag.showTimeline();

    console.log(`\n⏱️  Total Execution Time: ${totalTime}ms\n`);

    console.log("✅ FINAL RESULTS:\n");
    for (const [nodeName, result] of results) {
      console.log(`  ${nodeName}:`);
      console.log(`    Status: ${result.status}`);
      console.log(`    Output: ${result.output}`);
      console.log(`    Time: ${result.timestamp}`);
    }
  } catch (error) {
    console.error("Orchestration failed:", error);
    process.exit(1);
  }
};
