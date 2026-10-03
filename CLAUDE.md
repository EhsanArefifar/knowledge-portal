# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This repo is a collection of Markdown course notes plus an Astro site (`portal/`) that renders them. The notes are the source of truth; the portal is a pure rendering layer and must not modify or generate note content.

- `Claude-academy/`, `NetNinja-masterclass/` — one folder per course. Each has a `_course.json` (`provider`, `sourceUrl`) and root-level `*.md` notes. `NetNinja-masterclass/assets/{agents,commands,skills}/` holds reusable Claude Code assets (also Markdown).
- `portal/` — the Astro 5 static site. All npm commands run from here.
- `.kiro/specs/personal-ai-learning-portal/` — requirements, design, and task list for the portal (design.md has the architecture diagram; the validator cites requirement numbers from requirements.md).

## Commands (run in `portal/`)

- `npm run dev` — dev server
- `npm run build` — `astro build` then `pagefind --site dist --output-path dist/_pagefind` (search index is only produced by the full build, not `dev`)
- `npm run preview` — serve built `dist/`
- Tests: vitest (+ fast-check for property tests) is configured to pick up `src/**/*.{test,spec}.ts`, but there is no `test` script and no tests yet. Run with `npx vitest run` or `npx vitest run path/to/file.test.ts`. `tests/build/` is an empty placeholder.

## Architecture

- **Content comes from outside `src/`.** `portal/src/content/config.ts` defines two collections via the `glob()` loader with `base: '../'` (repo root): `notes` (`*/*.md`, root-level notes per course) and `assets` (`*/assets/**/*.md`), both excluding `portal/**` and `.kiro/**`. Adding a course = adding a top-level folder with `.md` files and a `_course.json`; no portal change needed. Entry ids look like `Course-folder/note-file` (no extension).
- **Routing/naming.** Pages in `src/pages/courses/[course]/[note].astro` etc. derive URLs and titles from folder/file names through `src/lib/naming.ts` (`toSlug`, `folderToTitle`, `extractTitle` = first `# H1`, else filename; `countNotes` counts only root-level entries).
- **Hand-maintained pages** (`quick-access`, `next-courses`, `resources`) are driven by `src/data/*.ts`, not by the Markdown.
- **Markdown pipeline** (`astro.config.mjs`): Shiki (`github-dark`) for code, `rehype-mermaid` with `inline-svg` strategy renders ```` ```mermaid ```` blocks to SVG at build time (needs a Playwright browser: run `npx playwright install chromium-headless-shell` once in `portal/`; the CI workflow does this too). Mermaid is excluded from Shiki (`excludeLangs`) so it reaches the rehype plugin. If a failed build leaves notes rendering empty, delete `portal/.astro` and `portal/node_modules/.astro`.
- **Content validator** (`src/plugins/contentValidator.ts`): an Astro integration on `astro:build:done` that scans emitted HTML for broken internal `<a href>`/`<img src>` and only warns — it never fails the build. It strips the configured `base` from absolute paths.
- Client JS is limited to theme toggle, search dialog, copy button, TOC scroll-spy, and drawer nav; everything else is zero-JS Astro.

## Deployment

`.github/workflows/deploy.yml` builds on push to `main` (Node 20, `npm install` in `portal/`) and deploys `portal/dist/` to GitHub Pages. `astro.config.mjs` sets `site: https://ehsanarefifar.github.io` and `base: /knowledge-portal` — the base path must match the GitHub repo name, and all internal links must respect it. The workflow caches on `portal/package-lock.json`, so keep that file committed.
