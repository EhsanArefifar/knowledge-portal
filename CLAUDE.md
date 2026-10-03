# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo is a collection of Markdown course notes plus an Astro site (`portal/`) that renders them. The notes are the source of truth; the portal is a pure rendering layer and must not modify or generate note content.

- `Claude-academy/`, `NetNinja-masterclass/` — one folder per course. Each has a `_course.json` (`title`, `provider`, `sourceUrl`, `description`, all optional) and root-level `*.md` notes. A folder is one course by default; a `courses` map in `_course.json` (note filename → course fields) splits it into one course per note, which is how `Claude-academy/` holds two separate Anthropic courses. Assets go to the folder course, or to the first course when the folder is split. `<course>/assets/{agents,commands,skills}/` holds reusable Claude Code assets (also Markdown).
- `portal/` — the Astro 5 static site. All npm commands run from here.
- `.kiro/specs/personal-ai-learning-portal/` — the original requirements/design for the portal. The site has since been redesigned, so treat it as history, not as the current spec.

## Commands (run in `portal/`)

- `npm run dev` — dev server (search only works on a built site)
- `npm run build` — `astro build` then `pagefind --site dist --output-path dist/_pagefind`
- `npm run preview` — serve built `dist/`
- Tests: `npx vitest run` (or `npx vitest run src/lib/sections.test.ts`). Vitest + fast-check, files matching `src/**/*.{test,spec}.ts`; there is no `test` npm script.

## Architecture

- **Content comes from outside `src/`.** `src/content/config.ts` defines `notes` (`*/*.md`) and `assets` (`*/assets/**/*.md`) with the `glob()` loader at `base: '../'` (repo root). Frontmatter schemas are `.passthrough()` because asset frontmatter varies (`name`, `model`, `tools`, `allowed-tools`, …).
- **`src/lib/content.ts` is the single source of the page model.** `getCourses()` (memoized) groups entries by folder, reads `_course.json` from disk (`process.cwd()/..` — Astro must run from `portal/`), splits each note into sections, and builds asset metadata, install paths (`.claude/<kind>/<file>`) and download URLs. Pages call it instead of `getCollection` directly. `href()` prefixes the base path — use it for every internal link.
- **Notes are split into one page per chapter** by `src/lib/sections.ts` (pure, unit-tested): it slices the note's pre-rendered `entry.rendered.html` at the shallowest heading level that occurs twice (H2, else H3). The next level down becomes the "On this page" list. An intro of 60+ words becomes its own first section, and a shorter one shows on the note overview. Routes: `courses/[course]/` (hub + assets), `courses/[course]/[note]/` (overview), `courses/[course]/[note]/[section]/` (reader, `ReaderLayout.astro`).
- **Downloads** are static endpoints: `pages/downloads/[course]/[...file].ts` (raw asset file) and `pages/downloads/[course].zip.ts` (all assets zipped as a `.claude/` tree via `fflate`).
- **Hand-maintained data**: `src/data/links.ts` (upcoming courses, quick access, tools) and `src/data/providers.ts` (provider → logo in `public/logos/`, brand color). A course's `provider` string is matched against `providers.ts`; an unknown provider falls back to initials.
- **No study tracking by design**: the courses are finished and the portal is a reference to come back to, so there are no reading-time estimates, progress, "current" badges, start/continue buttons or mark-as-complete. Client JS in `src/scripts/enhance.ts` only adds code copy buttons and diagram pop-ups; localStorage holds just the theme, text size and focus mode.
- **Search** (`SearchDialog.astro`) uses Pagefind's JS API. Only elements with `data-pagefind-body` are indexed (reader content and the assets list), with `title`/`course` meta. `pagefind.js` is loaded through `new Function('url', 'return import(url)')` on purpose: a bundled `import()` breaks when Astro inlines the script (`__VITE_PRELOAD__ is not defined`).
- **Markdown pipeline** (`astro.config.mjs`): Shiki dual themes with `defaultColor: false` (colors switched by `data-theme` in `global.css`). `rehype-mermaid` (`inline-svg`, neutral theme, Inter loaded via its `css` option so label widths are measured with the font the site renders) renders diagrams at build time and needs a Playwright browser: run `npx playwright install chromium-headless-shell` once (CI does this too). Mermaid is excluded from Shiki so it reaches the plugin. Dark mode inverts diagrams with a CSS filter. `enhanceDiagrams()` fits each diagram to the content width and adds an expand button that opens a natural-size copy in a lightbox. If a failed build leaves notes rendering empty, delete `portal/.astro` and `portal/node_modules/.astro`.
- **Styling**: tokens in `src/styles/tokens.css` (light/dark via `:root[data-theme]`), shared primitives and `.prose` reading styles in `global.css`, component styles scoped in `.astro` files. Fonts are self-hosted via `@fontsource-variable` (Inter, JetBrains Mono).
- **Content validator** (`src/plugins/contentValidator.ts`): warns (never fails) on broken internal links/images in the built HTML; `<script>` bodies are skipped.
- Nested code fences in notes need a longer outer fence (```` ```` ````), otherwise the inner fence closes the block and the rest renders as raw HTML.

## Deployment

`.github/workflows/deploy.yml` builds on push to `main` (Node 20, `npm install` in `portal/`) and deploys `portal/dist/` to GitHub Pages. `astro.config.mjs` sets `site: https://ehsanarefifar.github.io` and `base: /knowledge-portal` — the base path must match the GitHub repo name, and all internal links must respect it. The workflow caches on `portal/package-lock.json`, so keep that file committed.
