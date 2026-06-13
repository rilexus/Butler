import { App } from "@modelcontextprotocol/ext-apps";

const app = new App({ name: "Dynamic UI", version: "1.0.0" });

app.addEventListener("toolresult", (result) => {
  const html =
    result.content?.find((c) => c.type === "text")?.text ?? "[NO HTML]";
  document.getElementById("root")!.innerHTML = html;

  Array.from(document.getElementsByTagName("button")).forEach((el) => {
    el.addEventListener("click", () => {
      app.sendMessage({
        role: "user",
        content: [
          {
            type: "text",
            text: `Button: "${el.getAttribute("title") || el.getAttribute("aria-label") || el.id}" was clicked.`,
          },
        ],
      });
    });
  });
});

app.connect();
