import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { darkTheme, lightTheme } from "../ui/theme";

type Theme = typeof darkTheme;

type ThemeStoreValue = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeStoreContext = createContext<ThemeStoreValue>({
  theme: darkTheme,
  isDark: true,
  toggleTheme: () => {},
});

export const useThemeStore = () => useContext(ThemeStoreContext);

export const ThemeStoreProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    window.ipc.send("theme:change", { isDark: next });
  };

  useEffect(() => {
    return window.ipc.on("nativeTheme:updated", (...args: unknown[]) => {
      const [{ isDark: next }] = args as [{ isDark: boolean }];
      setIsDark(next);
    });
  }, []);

  return (
    <ThemeStoreContext value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeStoreContext>
  );
};
