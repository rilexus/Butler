import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "Get Time App", version: "1.0.0" });

app.addEventListener("toolresult", (result) => {
  const html =
    result.content?.find((c) => c.type === "text")?.text ?? "[NO HTML]";

  document.getElementById("root")!.innerHTML = html;
});

app.connect();
