# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

| Command | Action |
|---------|--------|
| `pnpm dev` | Start dev server at `localhost:4321` |
| `pnpm build` | Build for production to `./dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm lint:fix` | Lint with oxlint + auto-fix |
| `pnpm format` | Format all files with oxfmt |

## Tech Stack

- **Framework**: [Astro](https://astro.build/) v6 (static site, no SSR)
- **UI Components**: [SolidJS](https://www.solidjs.com/) — only for interactive/stateful widgets
- **Styling**: [UnoCSS](https://unocss.dev/) with Wind3 preset, icons (Ri icon set), web fonts (DM Sans, DM Mono)
- **Linting**: oxlint runs on `pnpm lint:fix`
- **Formatting**: oxfmt runs on `pnpm format`

## Architecture

### Client-side only (no SSR)

This is a purely static Astro site. All processing happens in the browser — no data is sent to a server.

### Routing

Each tool lives on its own `.astro` page file in `src/pages/`. Page routes use Astro's file-based routing. There is no client-side router or dynamic routing.

### Tool pages follow a pattern

Every tool page imports `PageLayout` and embeds either:
- An interactive **SolidJS component** (for tools with state/real-time manipulation), **OR**
- Inline HTML/JS (for simpler tools)

SolidJS interactives are placed in `src/components/<tool-name>/` directories, each with a `.tsx` component and optional `.css` stylesheet.

### Layout hierarchy

- `MainLayout.astro` — outermost HTML shell with `<head>`, global CSS, Header, and Sidebar
- `PageLayout.astro` — wraps `MainLayout` with shared page chrome
- `Header.astro` / `Sidebar.astro` / `ThemeIcon.astro` — shared navigation and theme toggle

### Styles

- `src/styles/global.css` — CSS variables for the dark/light theme (HSL-based color scheme via `astro-color-scheme`)
- Component `.css` files are co-located with each SolidJS component
- UnoCSS utility classes are used throughout `.astro` and `.tsx` templates
- `astro-color-scheme` handles automatic light/dark detection

### Import alias

Use `~/` as a path alias for `src/` (configured in `tsconfig.json`).

## Project Structure

```
src/
├── components/       # SolidJS interactive widgets + co-located CSS
│   ├── colorConverter/
│   ├── colorMix/
│   ├── copy/          # Shared ClipboardCopy component
│   ├── hash-calc/
│   ├── img-hide/
│   └── *.astro       # Shared Astro components (Header, Sidebar, etc.)
├── layouts/          # Astro layout components
├── pages/            # One .astro file per route/tool
└── styles/           # Global CSS
```

## Development Notes

- Components use SolidJS signals (`createSignal`) for reactive state; no stores or complex state management is used.
- Some tools (img-hide) perform canvas-based pixel manipulation entirely in the browser.
- Dark/light theme uses CSS custom properties defined in `global.css`; no Tailwind dark variant is needed.
- The `astro-color-scheme` integration automatically sets a `data-color-scheme` attribute on `<html>` for theme selection.
