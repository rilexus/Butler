import { createContext, ReactNode, useContext, useState } from "react";
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
  const [isDark, setIsDark] = useState(true);
  const theme = isDark ? darkTheme : lightTheme;
  return (
    <ThemeStoreContext value={{ theme, isDark, toggleTheme: () => setIsDark((d) => !d) }}>
      {children}
    </ThemeStoreContext>
  );
};
