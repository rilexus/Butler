import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
  //@ts-ignore
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { createUIResource } from "@mcp-ui/server";
import { uiAgent } from "./agents/ui";
import mcpAppBundle from "./mcp-app-bundle";

function stripMarkdownFences(text: string): string {
  return text
    .replace(/^```[\w]*\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "Quickstart MCP App Server",
    version: "1.0.0",
  });

  // Two-part registration: tool + resource, tied together by the resource URI.

  // ---------------------
  const ui = createUIResource({
    uri: `ui://mcp-ui/generated.html`,
    content: { type: "rawHtml", htmlString: "<div>Loading ...</div>" },
    encoding: "text",
  });

  const resourceUri = ui.resource.uri;

  registerAppResource(
    server,
    "UI",
    resourceUri,
    {
      mimeType: RESOURCE_MIME_TYPE,
      description: "Generated UI (HTML & JavaScript)",
    },
    async (uri) => {
      return {
        contents: [
          {
            uri: uri.toString(),
            mimeType: RESOURCE_MIME_TYPE,
            text: `
            <html>
        <body>
          <div id="root"></div>
          
          <script>${mcpAppBundle}</script>
        </body>
      </html>`,
          },
        ],
      };
    },
  );

  registerAppTool(
    server,
    "generate_ui",
    {
      title: "UI Generator",
      description: "Generates UI based on a given prompt",
      inputSchema: {
        prompt: z.string().describe("UI specification"),
        data: z.object({}).describe("Data to be displayed in the UI"),
      },
      _meta: { ui: { resourceUri } }, // Links this tool to its UI resource
    },
    async ({ prompt, data }) => {
      const { text } = await uiAgent({ prompt, data });
      const html = stripMarkdownFences(text);

      return {
        content: [
          {
            type: "text",
            text: html,
          },
          ui,
        ],
      };
    },
  );

  return server;
}
