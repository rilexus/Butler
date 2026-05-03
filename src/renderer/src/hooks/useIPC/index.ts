import { useEffect } from "react";

export const usePIC = (event, callback) => {
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
