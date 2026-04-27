import { app, BrowserWindow, ipcMain, nativeTheme } from "electron";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import store from "./store/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const isDev = process.env.NODE_ENV === "development";
const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";
const isLinux = process.platform === "linux";
const isPortable = isWin && "PORTABLE_EXECUTABLE_DIR" in process.env;

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

// --- State handlers ---
ipcMain.handle("state:set", (_event, { key, value }) => {
  store.set(key, value);
});
ipcMain.handle("state:get", (_event, key) => {
  return store.get(key);
});
ipcMain.handle("state:get-all", () => {
  return store.store;
});

ipcMain.on(
  "chat:send",
  async (event, { messages, provider, apiKey, baseUrl, model }) => {
    console.log(messages, provider, apiKey, baseUrl, model);
    try {
      if (provider === "lmstudio") {
        const client = new OpenAI({
          baseURL: baseUrl || "http://localhost:1234/v1",
          apiKey: "sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X",
          headers: {
            Authorization: "Bearer sk-lm-aftl4L4L:dCUnehUL2Yq5ADgGe75X",
          },
        });
        const list = await client.models.list();

        console.log(list);

        const stream = await client.chat.completions.create({
          model: model || "local-model",
          messages: [
            {
              role: "system",
              content: "You are Butler, a helpful AI assistant.",
            },
            ...messages,
          ],
          stream: true,
        });

        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) event.sender.send("chat:chunk", text);
        }
      }

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
