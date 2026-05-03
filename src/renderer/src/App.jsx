import { GlobalStyle } from "./styles";
import { Router } from "./Router";
import { AppStoreProvider } from "./store/AppStore";
import { Link } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { darkTheme } from "./ui/theme";

export default function App() {
  return (
    <AppStoreProvider>
      <GlobalStyle />
      <ThemeProvider theme={darkTheme}>
        <Router />
      </ThemeProvider>
    </AppStoreProvider>
  );
}
