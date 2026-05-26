import { app, BrowserWindow, ipcMain, nativeTheme } from "electron";
import OpenAI from "openai";
import { join, dirname } from "path";
import { readUIMessageStream, streamText, tool, ToolLoopAgent } from "ai";
import { fileURLToPath } from "url";
import store, { getStoreSnapshot, setToStore } from "./store/index.js";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import z from "zod";
import { fromWorkflow } from "./orchestration/fromWorkflow.js";
import { createActor, fromPromise, setup } from "xstate";
import { randomUUID } from "crypto";
import { start } from "./server.js";
import { createMCPClient } from "@ai-sdk/mcp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === "development";
const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";
const isLinux = process.platform === "linux";
const isPortable = isWin && "PORTABLE_EXECUTABLE_DIR" in process.env;

// Start express server with UI-MCP
start()
  .then(() => {})
  .catch(() => {});

const send = (type, data) => {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(type, data);
  });
};

const broadcastEvent = (type, data) => {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(type, { type, ...data });
  });
};

const getAgents = () => getStoreSnapshot().agents;
const getWorkflows = (name) => getStoreSnapshot().workflows;

const getWorkflow = (name) => getWorkflows().find(({ name: n }) => n === name);

const toMachineWorkflow = ({ name, nodes, edges }) => {
  const startNode = nodes.find(({ type }) => type === "start");

  const buildTree = (node) => {
    const nextNode = nodes.find(
      ({ name }) =>
        name ===
        edges.find(({ from, type }) => from === node.name && type === "next")
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

const set = (key, val) => {
  setToStore(key, val);
  broadcastStore();
};

const setActiveAgent = ({ value, context, status }) => {
  const activeAgentsMap = getStoreSnapshot((s) => s.active);
  activeAgentsMap[value] = { value, context, status };
  set("active", activeAgentsMap);
};

const setAgentStatus = (name, status) => {
  const activeAgentsMap = getStoreSnapshot((s) => s.active);
  if (!activeAgentsMap[name]) {
    activeAgentsMap[name] = {};
  }
  activeAgentsMap[name].status = status;
  set("active", activeAgentsMap);
};

const startFlow = ({ name, prompt }) => {
  const flow = getWorkflow(name);

  if (!flow) {
    console.warn(
      `startFlow(name: string): No flow with name: "${name}" found!`,
    );
    return;
  }

  const machineFlow = toMachineWorkflow(flow);

  const actor = fromWorkflow({ ...machineFlow, prompt: prompt });

  actor.on("agent.active", (event) => {
    const { name } = event;

    if (!name) return;
    setAgentStatus(name, "active");
  });

  actor.on("agent.done", (event) => {
    const { name } = event;

    if (!name) return;
    setAgentStatus(name, "done");
  });

  actor.on("final", (event) => {
    const { name } = event;

    if (!name) return;
    setAgentStatus(name, "done");
  });

  actor.on("agent.error", (event) => {
    const { name } = event;
    if (!name) return;
    setAgentStatus(name, "error");
  });

  actor.on("agent.UIMessageStream", ({ name, chunk }) => {
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

const removeActiveAgent = (name) => {
  const activeAgentsMap = getStoreSnapshot((s) => active);
  if (name in activeAgentsMap) {
    delete activeAgentsMap[name];
    set("active", activeAgentsMap);
  }
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
  let mainWindowBackgroundColor = null;

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
    // For Windows and Linux, we use frameless window with custom controls
    // For Mac, we keep the native title bar style
    ...(isMac
      ? {
          titleBarStyle: "hidden",
          titleBarOverlay: nativeTheme.shouldUseDarkColors
            ? titleBarOverlayDark
            : titleBarOverlayLight,
          trafficLightPosition: { x: 13, y: 13 },
        }
      : {
          // On Linux, allow using system title bar if setting is enabled
          frame: isLinux && configManager.getUseSystemTitleBar() ? true : false,
        }),
    ...(windowsBackgroundMaterial
      ? { backgroundMaterial: windowsBackgroundMaterial }
      : {}),
    ...(mainWindowBackgroundColor
      ? { backgroundColor: mainWindowBackgroundColor }
      : {}),
    darkTheme: nativeTheme.shouldUseDarkColors,
    ...(isLinux ? { icon: linuxIcon } : {}),

    webPreferences: {
      preload: join(__dirname, "../preload/index.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    // win.webContents.openDevTools();
  } else {
    win.loadFile(join(__dirname, "../../dist/renderer/index.html"));
  }
}

const activeStreams = new Map();

const createUIMCPClient = () => {
  return createMCPClient({
    transport: { type: "http", url: `http://localhost:3005/mcp` },
  });
};

const registerHandlers = () => {
  ipcMain.on("workflow:start", (event, { name, prompt }) => {
    startFlow({ name, prompt });
  });

  // --- IPC handlers ---
  ipcMain.handle("app:get-version", () => app.getVersion());
  ipcMain.handle("app:get-path", (_event, name) => app.getPath(name));

  ipcMain.on("store:get", (event, val) => {
    event.returnValue = val ? store.get(val) : getStoreSnapshot();
  });

  ipcMain.on("store:set", (event, key, val) => {
    setToStore(key, val);
    broadcastStore();
  });

  ipcMain.on("session.message", async (event, { session, message }) => {
    const sessionId = session.id;
    const snapshot = getStoreSnapshot();

    const agentId = session.agent?.id;
    const agentConfig = snapshot.agents?.find((a) => a.id === agentId);

    if (!agentConfig) {
      event.sender.send("session:error", {
        sessionId,
        error: `No agent found for id: ${agentId}`,
      });
      return;
    }

    // Persist the incoming user message
    const updatedSessions = (snapshot.sessions ?? []).map((s) =>
      s.id === sessionId
        ? { ...s, messages: [...(s.messages ?? []), message] }
        : s,
    );
    set("sessions", updatedSessions);

    // Build history from store (before the new message was added)
    const previousMessages = (
      snapshot.sessions?.find((s) => s.id === sessionId)?.messages ?? []
    ).map((m) => ({
      role: m.role,
      content: (m.parts ?? [])
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join(""),
    }));

    const userContent = (message.parts ?? [])
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");

    const provider = createOpenAICompatible({
      name: agentConfig.name ?? "agent",
      headers: {
        Authorization: `Bearer ${agentConfig.apiKey ?? "sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X"}`,
      },
      baseURL: agentConfig.url ?? url,
    });

    // Cancel any in-flight stream for this session
    if (activeStreams.has(sessionId)) {
      activeStreams.get(sessionId).abort();
    }
    const abortController = new AbortController();
    activeStreams.set(sessionId, abortController);

    const uiMCPClient = await createUIMCPClient();
    const uiGenerationTools = await uiMCPClient.tools();

    try {
      const result = streamText({
        model: provider(agentConfig.model ?? model),
        tools: uiGenerationTools, // TODO: add tools based on the agentConfig
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
          latestSessions.map((s) => {
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
    } catch (err) {
      if (err.name !== "AbortError") {
        event.sender.send("session:error", { sessionId, error: err.message });
      }
    } finally {
      activeStreams.delete(sessionId);
    }
  });

  ipcMain.on("session.abort", (_event, { sessionId }) => {
    if (activeStreams.has(sessionId)) {
      activeStreams.get(sessionId).abort();
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
  async (event, { messages, provider, apiKey, baseUrl, model }) => {
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

      for await (const chunk of stream.toUIMessageStream()) {
        // console.log(chunk);
      }

      // for await (const chunk of stream) {
      //   const text = chunk.choices[0]?.delta?.content || "";
      //   if (text) event.sender.send("chat:chunk", text);
      // }

      event.sender.send("chat:done");
    } catch (err) {
      event.sender.send("chat:error", err.message);
    }
  },
);

// -------------------

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
