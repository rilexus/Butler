import { tool } from "ai";
import z from "zod";

const tools = {
  "ui-generator": tool({
    name: "ui-generator",
    // TODO: move this near the ui-mcp folder
    description: "Generate UI based on a prompt.",
    inputSchema: z.object({
      prompt: z.string().describe("Definition of the UI."),
    }),
    execute: async ({ prompt }) => {
      // TODO: call the mcp server here to generate the UI resource and return its URI.
      
      return "UI generated based on prompt: " + prompt;
    },
  }),
};
