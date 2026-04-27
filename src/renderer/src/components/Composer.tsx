import { createContext, use } from "react";

const Context = createContext<any>(null);

function Provider({
  children,
  state,
  actions,
  meta,
}: {
  children: any;
  state: any;
  actions: any;
  meta: any;
}) {
  return <Context value={{ state, actions, meta }}>{children}</Context>;
}

function Consumer({ Component }: any) {
  const { state, actions, meta } = use(Context);
  return <Component meta={meta} state={state} actions={actions} />;
}

export { Provider, Consumer };
