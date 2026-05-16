interface Window {
  ipc: {
    invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    send: (channel: string, ...args: unknown[]) => void;
    sendSynch: (channel: string, ...args: unknown[]) => unknown;
    on: (channel: string, listener: (...args: unknown[]) => void) => () => void;
  };
}
