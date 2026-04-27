import { createContext, useContext, useReducer } from "react";

const initialState = {
  // State here
  assistants: [
    {
      id: 1,
      name: "Some",
      icon: `✅`,
    },
  ],
};

const reducer = (state) => {
  return state;
};

const AppStateContext = createContext(initialState);
const AppDispatchContext = createContext(() => {});

const useDispatch = () => useContext(AppDispatchContext);
const useStore = (selector: any) => {
  return selector(useContext(AppStateContext));
};

const AppStoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppStateContext value={state}>
      <AppDispatchContext value={dispatch}>{children}</AppDispatchContext>
    </AppStateContext>
  );
};

export { useDispatch, useStore, AppStoreProvider };
