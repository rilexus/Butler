import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";

export const uiAgent = ({
  prompt,
}: {
  prompt: string;
}): Promise<{ text: string }> => {
  const provider = createOpenAICompatible({
    name: "ui-agent",
    headers: {
      Authorization: `Bearer`,
    },
    baseURL: "http://127.0.0.1:1234/v1",
  });

  return generateText({
    model: provider("qwen3.5-9b-uncensored-hauhaucs-aggressive"),
    messages: [
      {
        role: "system",
        content:
          "You generate self-contained HTML with inline CSS and JavaScript based on the user request. Return ONLY the raw HTML document — no markdown, no code fences, no explanation.",
      },
      { role: "user", content: prompt },
    ],
  });
};
