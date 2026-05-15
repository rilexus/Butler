import { app, BrowserWindow, ipcMain, nativeTheme } from "electron";
import OpenAI from "openai";
import { join, dirname } from "path";
import { tool, ToolLoopAgent } from "ai";
import { fileURLToPath } from "url";
import store, { getStoreSnapshot, setToStore } from "./store/index.js";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import z from "zod";
import { fromWorkflow } from "./orchestration/fromWorkflow.js";
import { createActor, fromPromise, setup } from "xstate";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV === "development";
const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";
const isLinux = process.platform === "linux";
const isPortable = isWin && "PORTABLE_EXECUTABLE_DIR" in process.env;

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
const getWorkflow = (name) => getWorkflows()[name];

const toMachineWorkflow = (agents, workflow) => {
  const agent = agents[workflow.name];
  const tools = workflow.tools ?? [];

  return {
    id: randomUUID(),
    ...workflow,
    ...agent,
    tools: tools.map((w) => toMachineWorkflow(agents, w)),
    next: workflow.next ? toMachineWorkflow(agents, workflow.next) : undefined,
  };
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

  const machineFlow = toMachineWorkflow(getAgents(), flow);

  const actor = fromWorkflow({ ...machineFlow, prompt: prompt });

  actor.on("agent.active", (event) => {
    const { name } = event;
    console.log("active: ", event);
    if (!name) return;
    setAgentStatus(name, "active");
  });

  actor.on("agent.done", (event) => {
    const { name } = event;
    console.log("done: ", event);
    if (!name) return;
    setAgentStatus(name, "done");
  });

  actor.on("final", (event) => {
    const { name } = event;
    console.log("final: ", event);
    if (!name) return;
    setAgentStatus(name, "done");
  });

  actor.on("agent.error", (event) => {
    const { name } = event;
    if (!name) return;
    setAgentStatus(name, "error");
  });

  actor.on("agent.UIMessageStream", ({ name, chunk }) => {
    broadcastEvent("workflow:stream", { agentName: name, data: chunk });
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
    win.webContents.openDevTools();
  } else {
    win.loadFile(join(__dirname, "../../dist/renderer/index.html"));
  }
}

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
