import { useEffect } from "react";

export const useIPC = (
  event?: string,
  callback?: (...args: unknown[]) => void,
) => {
  useEffect(() => {
    if (!event || !callback) {
      return;
    }
    const handler = (...args) => callback(...args);
    const clean = window.ipc.on(event, handler);
    return clean;
  }, [event, callback]);

  return window.ipc;
};
