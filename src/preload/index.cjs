const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  platform: process.platform,

  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),

  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  on: (channel, listener) => {
    const wrapped = (_event, ...args) => listener(...args);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },
});

contextBridge.exposeInMainWorld("ipc", {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  send: (channel, ...args) => ipcRenderer.send(channel, ...args),
  sendSynch: (channel, ...args) => ipcRenderer.sendSynch(channel, ...args),

  on: (channel, listener) => {
    const wrapped = (_event, ...args) => listener(...args);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  },
});

contextBridge.exposeInMainWorld("store", {
  get(key) {
    return ipcRenderer.sendSync("store:get", key);
  },

  set(property, val) {
    ipcRenderer.send("store:set", property, val);
  },

  on: (channel, listener) => {
    const wrapped = (_event, ...args) => listener(...args);
    ipcRenderer.on(`store:${channel}`, wrapped);
    return () => ipcRenderer.removeListener(`store:${channel}`, wrapped);
  },
});
