import { GlobalStyle } from "./styles";
import { Router } from "./Router";
import { AppStoreProvider } from "./store/AppStore";
import { ThemeStoreProvider, useThemeStore } from "./store/ThemeStore";
import { ThemeProvider } from "styled-components";

function AppWithTheme() {
  const { theme } = useThemeStore();
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router />
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <ThemeStoreProvider>
        <AppWithTheme />
      </ThemeStoreProvider>
    </AppStoreProvider>
  );
}
