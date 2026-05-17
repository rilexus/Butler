# CLAUDE.md

## Component structure (`src/renderer` only)

Don't co-locate multiple components in the same file. Every component gets its own file at `components/[ComponentName]/index.tsx` next to the component that owns it. Shared domain types go in a `types.ts` beside the parent. Each component file is self-contained — it owns its own local types and logic. Do not share styled-components across sibling component files.

All styled-components for a component live in a `styles.ts` file next to its `index.tsx`. The `index.tsx` imports them from `./styles` and contains no `styled.*` definitions itself.

When building UI, prefer components from `src/renderer/src/ui/` over creating new primitives. Only build a new component if nothing in `ui/` covers the use case.
Update the "component inventory" description in this file every time there is an update in the `ui` folder.

## `src/preload`

## `src/main`

## `src/renderer`

- `components/[ComponentName]/index.tsx` - Component
- `components/[ComponentName]/types.ts` - Component types
- `components/[ComponentName]/styles.ts` - Styled-components for the component
- `components/[ComponentName]/index.test.tsx` - Component

## `src/renderer/src/ui/` component inventory

```text
ui/
├── theme.ts                          # Design tokens (colors, spacing, etc.)
├── Flex.tsx                          # Flexbox layout helper
├── Avatar/                           # User avatar display
├── Breadcrumbs/                      # Navigation breadcrumb trail
├── Button/                           # Clickable button
├── CollapsiblePanel/                 # Expandable/collapsible content panel
├── ComboBox/                         # Text input with dropdown suggestions
├── FieldSet/                         # Grouped form fields with legend
├── Form/                             # Form wrapper
├── ListBox/                          # Selectable list
│   ├── context.ts
│   ├── ListBoxItem/                  # Individual list row
│   └── ListBoxSection/               # Grouped section within a list
├── Modal/                            # Overlay dialog
├── Popover/                          # Floating contextual overlay
├── RadioGroup/                       # Radio button group
│   └── Radio/                        # Single radio option
├── Select/                           # Dropdown select input
├── Surface/                          # Elevated card/panel surface
├── Switch/                           # Toggle switch
├── Tabs/                             # Tab navigation
├── TextField/                        # Text input field
└── ToolBar/                          # Toolbar container
    ├── ButtonGroup/                  # Grouped buttons
    ├── Separator/                    # Visual divider
    └── ToggleButtonGroup/            # Group of toggle buttons
        └── ToggleButton/             # Single toggle button
```
