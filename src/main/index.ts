import { app, BrowserWindow, ipcMain, nativeTheme } from "electron";
import { join } from "path";
import { readUIMessageStream, streamText, tool, ToolLoopAgent } from "ai";
import store, { getStoreSnapshot, setToStore } from "./store/index";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import z from "zod";
import { fromWorkflow } from "./orchestration/fromWorkflow";
import { start } from "./server";
import { createMCPClient } from "@ai-sdk/mcp";

const isDev = process.env.NODE_ENV === "development";
const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";
const isLinux = process.platform === "linux";


const WINDOWS_11_22H2_BUILD = 22621;

// Start express server with UI-MCP
start()
  .then(() => {})
  .catch(() => {});

const send = (type: string, data?: unknown) => {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(type, data);
  });
};

const broadcastEvent = (type: string, data?: Record<string, unknown>) => {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(type, { type, ...data });
  });
};

const getWorkflows = () => getStoreSnapshot().workflows;

const getWorkflow = (name: string) => getWorkflows().find(({ name: n }) => n === name);

const toMachineWorkflow = ({ nodes, edges }: { nodes: any[]; edges: any[] }) => {
  const startNode = nodes.find(({ type }) => type === "start");

  const buildTree = (node: any): any => {
    const nextNode = nodes.find(
      ({ name }) =>
        name ===
        edges.find(({ from, type }: any) => from === node.name && type === "next")
          ?.to,
    );

    return {
      ...node,
      next: nextNode ? buildTree(nextNode) : null,
      tools: [],
    };
  };

  return buildTree(startNode);
};

const broadcastStore = () => {
  const state = getStoreSnapshot();
  send("store:update", state);
};

const set = (key: any, val: unknown) => {
  setToStore(key, val);
  broadcastStore();
};

const setAgentStatus = (name: string, status: string) => {
  const activeAgentsMap = getStoreSnapshot().active as Record<string, any>;
  if (!activeAgentsMap[name]) {
    activeAgentsMap[name] = {};
  }
  activeAgentsMap[name].status = status;
  set("active", activeAgentsMap);
};

const startFlow = ({ name, prompt }: { name: string; prompt: string }) => {
  const flow = getWorkflow(name);

  if (!flow) {
    console.warn(
      `startFlow(name: string): No flow with name: "${name}" found!`,
    );
    return;
  }

  const machineFlow = toMachineWorkflow(flow);

  const actor = fromWorkflow({ ...machineFlow, prompt: prompt });

  actor.on("agent.active", (event: any) => {
    const { name } = event;

    if (!name) return;
    setAgentStatus(name, "active");
  });

  actor.on("agent.done", (event: any) => {
    const { name } = event;

    if (!name) return;
    setAgentStatus(name, "done");
  });

  actor.on("final", (event: any) => {
    const { name } = event;

    if (!name) return;
    setAgentStatus(name, "done");
  });

  actor.on("agent.error", (event: any) => {
    const { name } = event;
    if (!name) return;
    setAgentStatus(name, "error");
  });

  actor.on("agent.UIMessageStream", (event) => {
    const { name, chunk } = event as { name: string; chunk: any };
    console.log(chunk);

    broadcastEvent("workflow:stream", {
      sender: name,
      data: {
        ...chunk,
        id: `${name}:${chunk.id}`,
      },
    });
  });

  actor.start();
  return actor;
};

export const titleBarOverlayDark = {
  height: 42,
  color: isWin ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0)",
  symbolColor: "#fff",
};

export const titleBarOverlayLight = {
  height: 42,
  color: "rgba(255,255,255,0)",
  symbolColor: "#000",
};

const isWindowsMicaSupported = () => {
  if (!isWin) {
    return false;
  }

  const systemVersion = process.getSystemVersion();
  const buildNumber = Number.parseInt(systemVersion.split(".")[2] ?? "", 10);

  return Number.isFinite(buildNumber) && buildNumber >= WINDOWS_11_22H2_BUILD;
};

export const getWindowsBackgroundMaterial = () => {
  return isWindowsMicaSupported() ? "mica" : undefined;
};

function createWindow() {
  const windowsBackgroundMaterial = getWindowsBackgroundMaterial();
  let mainWindowBackgroundColor: string | null = null;

  if (!isMac && !windowsBackgroundMaterial) {
    mainWindowBackgroundColor = nativeTheme.shouldUseDarkColors
      ? "#181818"
      : "#FFFFFF";
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    transparent: false,
    vibrancy: "sidebar",
    visualEffectState: "active",
    ...(isMac
      ? {
          titleBarStyle: "hidden",
          titleBarOverlay: nativeTheme.shouldUseDarkColors
            ? titleBarOverlayDark
            : titleBarOverlayLight,
          trafficLightPosition: { x: 13, y: 13 },
        }
      : {
          frame: isLinux ? false : false,
        }),
    ...(windowsBackgroundMaterial
      ? { backgroundMaterial: windowsBackgroundMaterial as any }
      : {}),
    ...(mainWindowBackgroundColor
      ? { backgroundColor: mainWindowBackgroundColor }
      : {}),
    darkTheme: nativeTheme.shouldUseDarkColors,
    ...(isLinux ? { icon: undefined } : {}),

    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

const activeStreams = new Map<string, AbortController>();

const createUIMCPClient = () => {
  return createMCPClient({
    transport: { type: "http", url: `http://localhost:3005/mcp` },
  });
};

const registerHandlers = () => {
  ipcMain.on("workflow:start", (_event, { name, prompt }: { name: string; prompt: string }) => {
    startFlow({ name, prompt });
  });

  ipcMain.handle("app:get-version", () => app.getVersion());
  ipcMain.handle("app:get-path", (_event, name) => app.getPath(name));

  ipcMain.on("store:get", (event, val) => {
    event.returnValue = val ? store.get(val) : getStoreSnapshot();
  });

  ipcMain.on("store:set", (_event, key, val) => {
    setToStore(key, val);
    broadcastStore();
  });

  ipcMain.on("session.message", async (event, { session, message }: { session: any; message: any }) => {
    const sessionId = session.id;
    const snapshot = getStoreSnapshot();

    const agentId = session.agent?.id;
    const agentConfig = snapshot.agents?.find((a: any) => a.id === agentId);

    if (!agentConfig) {
      event.sender.send("session:error", {
        sessionId,
        error: `No agent found for id: ${agentId}`,
      });
      return;
    }

    const updatedSessions = (snapshot.sessions ?? []).map((s: any) =>
      s.id === sessionId
        ? { ...s, messages: [...(s.messages ?? []), message] }
        : s,
    );
    set("sessions", updatedSessions);

    const previousMessages = (
      snapshot.sessions?.find((s: any) => s.id === sessionId)?.messages ?? []
    ).map((m: any) => ({
      role: m.role,
      content: (m.parts ?? [])
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join(""),
    }));

    const userContent = (message.parts ?? [])
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join("");

    const provider = createOpenAICompatible({
      name: agentConfig.name ?? "agent",
      headers: {
        Authorization: `Bearer ${agentConfig.apiKey ?? "sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X"}`,
      },
      baseURL: agentConfig.url ?? "http://127.0.0.1:1234/v1",
    });

    if (activeStreams.has(sessionId)) {
      activeStreams.get(sessionId)!.abort();
    }
    const abortController = new AbortController();
    activeStreams.set(sessionId, abortController);

    const uiMCPClient = await createUIMCPClient();
    const uiGenerationTools = await uiMCPClient.tools();

    try {
      const result = streamText({
        model: provider(agentConfig.model ?? "qwen2.5-coder-3b-instruct"),
        tools: uiGenerationTools as any,
        messages: [
          { role: "system", content: agentConfig.instructions ?? "" },
          ...previousMessages,
          { role: "user", content: userContent },
        ],
        abortSignal: abortController.signal,
      });

      for await (const message of readUIMessageStream({
        stream: result.toUIMessageStream(),
      })) {
        const latestSessions = getStoreSnapshot().sessions ?? [];
        set(
          "sessions",
          latestSessions.map((s: any) => {
            if (s.id !== sessionId) return s;
            const messages = s.messages ?? [];

            const last = messages.at(-1);

            if (!last) {
              return {
                ...s,
                messages: [message],
              };
            }

            if (last.role === "assistant") {
              return {
                ...s,
                messages: [...messages.slice(0, -1), { ...last, ...message }],
              };
            }

            return { ...s, messages: [...messages, message] };
          }),
        );
      }

      event.sender.send("session:done", { sessionId });
    } catch (err: any) {
      if (err.name !== "AbortError") {
        event.sender.send("session:error", { sessionId, error: err.message });
      }
    } finally {
      activeStreams.delete(sessionId);
    }
  });

  ipcMain.on("session.abort", (_event, { sessionId }: { sessionId: string }) => {
    if (activeStreams.has(sessionId)) {
      activeStreams.get(sessionId)!.abort();
    }
  });
};

registerHandlers();

const lmstudio = createOpenAICompatible({
  name: "lmstudio",
  headers: {
    Authorization: "Bearer sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X",
  },
  baseURL: "http://127.0.0.1:1234/v1",
});

ipcMain.on(
  "chat:send",
  async (event, { messages }: { messages: any[] }) => {
    try {
      const agent = new ToolLoopAgent({
        model: lmstudio("qwen2.5-coder-3b-instruct"),
        instructions: "You are a helpful assistant.",
        headers: {
          Authorization: "Bearer sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X",
        },
        tools: {
          echo: tool({
            title: "echo",
            description: "Echo users input back to the user.",
            inputSchema: z.object({
              input: z.string().describe("Users input string"),
            }),
            execute: async ({ input }) => ({ output: input }),
          }),
        },
      });

      const stream = await agent.stream({
        messages: [
          {
            role: "system",
            content: "You are Butler, a helpful AI assistant.",
          },
          ...messages,
        ],
      });

      for await (const _chunk of stream.toUIMessageStream()) {
        // consumed for side effects
      }

      event.sender.send("chat:done");
    } catch (err: any) {
      event.sender.send("chat:error", err.message);
    }
  },
);

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
