import { createContext } from "react";

type ListBoxContextValue = {
  onAction?: (key: string) => void;
  selectionMode?: "none" | "single" | "multiple";
};

export const ListBoxContext = createContext<ListBoxContextValue>({});
