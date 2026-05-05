import { app, BrowserWindow, ipcMain, nativeTheme } from "electron";
import OpenAI from "openai";
import { join, dirname } from "path";
import { tool, ToolLoopAgent } from "ai";
import { fileURLToPath } from "url";
import store, { getStoreSnapshot } from "./store/index.js";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import z from "zod";
import { createConcert, createOrchestra } from "./orchestration/index.js";
import { machine } from "./orchestration/test-machine.js";
import { createActor } from "xstate";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV === "development";
const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";
const isLinux = process.platform === "linux";
const isPortable = isWin && "PORTABLE_EXECUTABLE_DIR" in process.env;

const actor = createActor(machine);
actor.start();

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

// --- IPC handlers ---
ipcMain.handle("app:get-version", () => app.getVersion());
ipcMain.handle("app:get-path", (_event, name) => app.getPath(name));

const broadcastStore = () => {
  const state = getStoreSnapshot();
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send("store:update", state);
  });
};

ipcMain.on("store:get", (event, val) => {
  event.returnValue = val ? store.get(val) : getStoreSnapshot();
});

ipcMain.on("store:set", (event, key, val) => {
  key ? store.set(key, val) : (store.store = val);
  broadcastStore();
});

const lmstudio = createOpenAICompatible({
  name: "lmstudio",
  headers: {
    Authorization: "Bearer sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X",
  },
  baseURL: "http://127.0.0.1:1234/v1",
});

const orchestra = createOrchestra(store.get("orchestra"));
orchestra.provide({
  tools: {
    sum: tool({
      description: "Sum two given numbers. Returns only the result.",
      inputSchema: z.object({
        value1: z.string().describe("First value"),
        value2: z.string().describe("Second value"),
      }),
      execute: async ({ value1, value2 }) => {
        console.log("Sum called with: ", value1, value2);
        return `${value1 + value2}`;
      },
    }),
    echo: tool({
      description: "Echo text back to the user.",
      inputSchema: z.object({
        text: z.string().describe("Text to echo back"),
      }),
      execute: async ({ text }) => {
        console.log("Echo called with: ", text);
        return text;
      },
    }),
    addOne: tool({
      description: "Add 1 to the input value. Return only the result.",
      inputSchema: z.object({
        value: z.string(),
      }),
      execute: async ({ value }) => {
        console.log(`AddOne: ${value}`);
        return `${Number(value) + 1}`;
      },
    }),
  },
});

const concert = createConcert(orchestra);

concert.subscribe("stream:agent1", (chunk) => {
  console.log("agent1", chunk);
});

concert.subscribe("stream:agent2_1", (chunk) => {
  console.log("agent2_1", chunk);
});

concert.subscribe("stream:agent2_2", (chunk) => {
  console.log("agent2_2", chunk);
});

concert.subscribe("stream:agent3", (chunk) => {
  console.log("agent3", chunk);
});

ipcMain.on("concert:start", () => {
  console.log("start");
  concert.start();
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
        console.log(chunk);
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
