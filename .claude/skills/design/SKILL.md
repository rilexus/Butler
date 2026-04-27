---
name: react-from-design
description: Reads reference images from `./.claude/design/`, extracts visual design tokens (colors, typography, spacing, layout, shadows), and generates React components with styled-components. Use when creating React UI from design mockups, screenshots, or reference images, or when the user says "implement this design", "build from reference", or points to images in .claude/design/.
---

# React from Design

Converts design reference images into styled React components using styled-components.

## Workflow

1. **Read images** — List and read all files in `./.claude/design/`
2. **Extract design tokens** — Identify colors, typography, spacing, layout
3. **Plan components** — Map visual hierarchy to React component tree
4. **Generate code** — Write React + styled-components matching the design
5. **Verify** — Cross-check output against the reference images

## Step 1: Read the Design References

```bash
ls ./.claude/design/
```

Read every image file found. If multiple images exist, treat them as:

- Different screen sizes (responsive breakpoints)
- Different states (default, hover, active, empty, error)
- Different components (header, card, form, etc.)

## Step 2: Extract Design Tokens

Document these before writing any component code:

| Token             | What to capture                                             |
| ----------------- | ----------------------------------------------------------- |
| **Colors**        | HEX/RGBA for bg, text, border, interactive states, overlays |
| **Typography**    | font-family, size (px), weight, line-height, letter-spacing |
| **Spacing**       | Padding, margin, gap values — measure consistently          |
| **Border radius** | Exact values per element                                    |
| **Shadows**       | Full box-shadow value with spread, blur, offset, color      |
| **Layout**        | Flex/grid, column count, alignment, max-width               |

Define a `tokens` const at the top of each file (or in a shared `tokens.ts`).

## Step 3: Generate Components

Structure:

- One folder per component type (e.g., `Header`, `Card`)
- styled-componets go in to `styles.ts` and are exported
- One file (e.g., `Header`) per component type, PascalCase filename
- Componet file imports styled components
- TypeScript props interface when props are present
- Tokens defined at file top, never hardcoded inline

See [styled-components-patterns.md](references/styled-components-patterns.md) for:

- Token object structure
- Responsive breakpoints
- Variant props pattern
- Hover/focus/active states
- Dark mode via CSS custom properties

## Step 4: Quality Checklist

- [ ] All colors match the reference exactly
- [ ] Font sizes and weights match
- [ ] Spacing is pixel-accurate
- [ ] Hover/focus/active states included (if visible in design)
- [ ] Responsive behavior handled (if multiple breakpoints shown)
- [ ] No magic numbers — all values come from the tokens object
