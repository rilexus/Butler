import { GlobalStyle } from "./styles";
import { Router } from "./Router";
import { AppStoreProvider } from "./store/AppStore";

const Header = () => {
  return (
    <div
      style={{
        padding: "10px 0 10px 0",
        borderBottom: "1px solid #2a2a4a",
      }}
    >
      Header
    </div>
  );
};
export default function App() {
  return (
    <AppStoreProvider>
      <GlobalStyle />
      <Header />
      <Router />
    </AppStoreProvider>
  );
}
