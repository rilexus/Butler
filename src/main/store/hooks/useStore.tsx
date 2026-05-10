import { useEffect, useState } from "react";

type StoreState = Record<string, unknown>;

declare global {
  interface Window {
    store: {
      get(key: string): StoreState;
      set(property: string, val: unknown): void;
      on(channel: string, listener: (store: StoreState) => void): () => void;
    };
  }
}

type Setter = (store: StoreState) => StoreState;

export const useStore = <T,>(
  getter?: (store: StoreState) => T,
): [T, (setter: Setter) => void] => {
  const [, setState] = useState(true);

  useEffect(() => {
    const a = window.store.on("update", () => {
      setState((s) => !s); // rerender
    });
    return a;
  }, []);

  const set = (setter: Setter) => {
    if (typeof setter === "function") {
      const store = window.store.get("");
      const updatedStore = setter(store);
      window.store.set("", updatedStore); // Update the entire

      setState((s) => !s); // rerender
    }
  };

  const s = getter ? getter(window.store.get("")) : window.store.get("");
  return [s, set];
};
