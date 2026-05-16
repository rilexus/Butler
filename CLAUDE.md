# CLAUDE.md

## Component structure (`src/renderer` only)

Don't co-locate multiple components in the same file. Every component gets its own file at `components/[ComponentName]/index.tsx` next to the component that owns it. Shared domain types go in a `types.ts` beside the parent. Each component file is self-contained — it owns its own local types and logic. Do not share styled-components across sibling component files.

All styled-components for a component live in a `styles.ts` file next to its `index.tsx`. The `index.tsx` imports them from `./styles` and contains no `styled.*` definitions itself.

When building UI, prefer components from `src/renderer/src/ui/` over creating new primitives. Only build a new component if nothing in `ui/` covers the use case.

