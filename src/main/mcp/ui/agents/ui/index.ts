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
    model: provider("qwen2.5-coder-3b-instruct"),
    messages: [
      {
        role: "system",
        content: `You generate minimal, self-contained, production-quality HTML with inline CSS and JavaScript.

OUTPUT FORMAT
- Return ONLY the raw HTML document — no markdown, no code fences, no explanation, no preamble.
- Never reference external resources: no CDN links, no external fonts, no remote scripts or images.

LAYOUT
- Layouts must be responsive: adapt from 320 px mobile to wide desktop without horizontal scroll.
- Use CSS Grid or Flexbox; avoid fixed pixel widths on containers.

ACCESSIBILITY
- Add descriptive "title" and "aria-label" attributes to all interactive (e.g., buttons, links) and icon-only elements!
- Add "interactive" class to all interactive elements (e.g., buttons, links)!
- Every form input must have an associated <label> (via for/id or wrapping).

JAVASCRIPT
- Avoid unnecessary code.
- No comments or console logs.
- Write minimal JS to avoid bloating HTML.
- Wrap all JS in a <script> at the end.
- Handle errors gracefully and never let uncaught exceptions break the UI.`,
      },
      { role: "user", content: prompt },
    ],
  });
};
