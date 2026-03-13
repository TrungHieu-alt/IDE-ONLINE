# Design Guide

## Stack

- Use Tailwind for styling.
- Use shadcn UI components for common UI building blocks.
- If a shadcn component is needed but not installed yet, add it with:

```bash
pnpm dlx shadcn@latest add <component-name>
```

Do not hand-roll a component that already exists in shadcn unless there is a clear product reason.

## Current Design Direction

- Tone: clean, editor-first, calm, technical
- Base: light stone background with soft contrast
- Accent: green is the main brand/action color
- Surfaces: rounded cards and panels with subtle borders
- Top bars: slightly translucent with blur
- Workspace: dense, practical, and space-efficient

## Current Visual Tokens

Based on `frontend/src/index.css` and current screens:

- Font: `Inter Variable`
- Primary color: green
- Base neutrals: stone / warm gray
- Radius: medium-large rounded corners
- Light mode is the default reference
- Dark mode exists and should stay aligned with the same structure and emphasis

## Layout Rules

- Keep the current wide desktop layout for dashboard and workspace.
- Use `max-w-7xl` to `max-w-[90rem]` container widths depending on page density.
- Keep the workspace optimized for the editor, not for marketing-style spacing.
- Prefer grid and resizable panel layouts over stacked long pages for coding flows.

## Component Rules

- Prefer shadcn primitives in `frontend/src/components/ui`.
- Reuse existing button, card, input, textarea, tabs, select, separator, accordion, and resizable components before creating new ones.
- Keep card corners, border weight, and spacing visually consistent with the current dashboard and workspace.
- Primary actions should use the existing green emphasis.
- Secondary actions should usually use `outline` or muted styling.
- Error states should use rose/red tinted containers similar to the current loading/error blocks.

## Consistency Rules

- Do not introduce a new color system without updating this guide.
- Do not mix unrelated visual styles on different pages.
- New pages should feel like part of the same product as the current dashboard and workspace.
- If a new reusable pattern appears more than once, convert it into a shared component.
