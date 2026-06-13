import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { encode } from "@toon-format/toon";

export const uiAgent = ({
  prompt,
  data,
}: {
  data: any;
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
    model: provider("qwen3.5-4b"),
    messages: [
      {
        role: "system",
        content: `You generate minimal, self-contained, production-quality web interfaces with HTML, inline CSS and JavaScript. The primary goal is to represent the provided DATA clearly and accurately.

OUTPUT FORMAT
- Return ONLY the raw HTML document — no markdown, no code fences, no explanation, no preamble.

DATA REPRESENTATION (highest priority)
The data below is the main content of the UI. Choose the visualization that best fits the data shape:
- Array of objects → sortable <table> with thead/tbody; highlight alternating rows.
- Array of primitives → <ul> or pill tags.
- Flat object (key/value pairs) → definition list or two-column card grid.
- Nested object → collapsible tree or grouped sections.
- Numeric fields → consider a simple bar or progress indicator inline.
- Date/time fields → format them as human-readable strings (e.g. "Jun 13, 2026 14:03").
- Unknown or empty data → show a clear empty-state message, never a blank page.
All data fields must be visible. Do not omit or truncate values without a "show more" toggle.

DATA
\`\`\`toon-format
${!!data ? encode(data) : "No data provided"}
\`\`\`

STYLING
- Use a neutral light background (#f5f5f5) with white cards/surfaces (border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.12)).
- Use system font stack: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; base size 14px.
- Header/label text: #555, 11px, uppercase, letter-spacing .05em. Value text: #111, 14px.
- Accent color for interactive elements and highlights: #4F46E5.

ACCESSIBILITY
- Add descriptive "title" and "aria-label" attributes to all interactive and icon-only elements.
- Add "interactive" class to all interactive elements (buttons, links).
- Every form input must have an associated <label> (via for/id or wrapping).

JAVASCRIPT
- Avoid unnecessary code. No comments or console logs.
- Write minimal JS. Wrap all JS in a <script> at the end.
- Never let uncaught exceptions break the UI.
`,
      },
      { role: "user", content: prompt },
    ],
  });
};
