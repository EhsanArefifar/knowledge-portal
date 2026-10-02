# Implementation Plan: Personal AI Learning Portal

## Overview

Implement a fully-static, GitHub Pages-compatible personal AI learning portal using Astro 5 that reads existing Markdown course notes from the `claude-code-knowledge-base` repository root and renders them as a navigable, searchable, styled site. The portal lives in a `portal/` subdirectory, uses Astro's Content Layer API with `glob()` loaders, Pagefind for client-side search, `rehype-mermaid` for diagram rendering, and Shiki for syntax highlighting.

## Tasks

- [x] 1. Scaffold the Astro project and configure the build system
  - Create `portal/` directory at the repo root as the Astro 5 project root
  - Initialise `package.json` with exact dependency versions: `astro@5`, `rehype-mermaid`, `pagefind`, `fast-check`, `vitest`
  - Configure `astro.config.mjs` with `site`, `base: '/claude-code-knowledge-base'`, Shiki syntax highlighting (theme: `github-dark`), `remark-gfm`, and `rehype-mermaid` with `strategy: 'inline-svg'`
  - Add npm scripts: `dev`, `build` (`astro build && pagefind --site dist --output-path dist/_pagefind`), `preview`
  - Configure `vitest.config.ts` with `globals: true` and `include: ['src/**/*.{test,spec}.ts']`
  - Create the directory layout: `src/content/`, `src/data/`, `src/pages/`, `src/layouts/`, `src/components/`, `src/styles/`, `src/lib/`, `src/plugins/`, `tests/build/`
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 2. Define content collections and name-derivation utilities
  - [x] 2.1 Implement `src/content/config.ts` with `notes` and `assets` collections
    - Define `notes` collection using `glob({ pattern: '*/*.md', base: '../', exclude: ['portal/**', '.kiro/**'] })`
    - Define `assets` collection using `glob({ pattern: '*/assets/**/*.md', base: '../', exclude: ['portal/**', '.kiro/**'] })`
    - Add Zod schemas for optional frontmatter fields (`title`, `provider`, `sourceUrl`, `description`)
    - _Requirements: 2.1, 2.2, 8.1, 8.2_

  - [x] 2.2 Implement `src/lib/naming.ts` with pure name-derivation functions
    - `toSlug(name: string): string` — converts folder/file name to URL-safe slug
    - `folderToTitle(folderName: string): string` — hyphens/underscores → spaces, title case
    - `extractTitle(content: string, filename: string): string` — first H1 or filename title-case fallback
    - `countNotes(entries: CollectionEntry<'notes'>[], course: string): number` — root-level `.md` only
    - _Requirements: 2.3, 2.4, 2.5_

  - [ ]* 2.3 Write property tests for `folderToTitle` (Property 1)
    - **Property 1: Course name derivation is deterministic**
    - **Validates: Requirements 2.3**
    - Use `fast-check` arbitrary strings with hyphens, underscores, and mixed case; assert all hyphens/underscores become spaces and each word is title-cased
    - Tag: `// Feature: personal-ai-learning-portal, Property 1`
    - _Requirements: 2.3_

  - [ ]* 2.4 Write property tests for `extractTitle` (Property 2)
    - **Property 2: Note title extraction prefers H1, falls back to filename**
    - **Validates: Requirements 2.4**
    - Use `fast-check` to generate Markdown strings with/without H1 headings; assert correct title selection
    - Tag: `// Feature: personal-ai-learning-portal, Property 2`
    - _Requirements: 2.4_

  - [ ]* 2.5 Write property tests for `countNotes` (Property 3)
    - **Property 3: Note count excludes asset subdirectory files**
    - **Validates: Requirements 2.5**
    - Use `fast-check` to generate mixed entry arrays (root-level + asset-subdir paths); assert count equals root-level only
    - Tag: `// Feature: personal-ai-learning-portal, Property 3`
    - _Requirements: 2.5_

  - [x] 2.6 Create `_course.json` files for existing courses
    - `Claude-academy/_course.json` — provider: "Anthropic", sourceUrl: `https://anthropic.skilljar.com/claude-101`
    - `NetNinja-masterclass/_course.json` — provider: "Net Ninja", sourceUrl: `https://netninja.dev/courses/enrolled/2931538`
    - _Requirements: 6.1, 20.1, 20.2, 20.3_

- [x] 3. Implement static data files and global CSS design tokens
  - [x] 3.1 Create `src/data/quickAccess.ts`, `src/data/nextCourses.ts`, and `src/data/resources.ts`
    - `quickAccess.ts`: three `QuickAccessLink` entries per Requirement 10.1
    - `nextCourses.ts`: five course title strings in order per Requirement 11.1
    - `resources.ts`: `Resource` interface and array including the `ccstatusline` entry per Requirement 12.2
    - _Requirements: 10.1, 11.1, 12.2, 12.3_

  - [x] 3.2 Create `src/styles/tokens.css` and `src/styles/global.css`
    - Define CSS custom properties for light and dark themes on `:root`, `[data-theme="light"]`, `[data-theme="dark"]`
    - Use system font stacks for UI (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`) and code (`'SFMono-Regular', Consolas, monospace`) — no external font imports
    - Apply single restrained accent color, medium border-radius (6–10px), subtle borders/shadows
    - Add `@media (prefers-reduced-motion: reduce)` rules disabling all CSS transitions and animations
    - Add responsive grid media queries at `min-width: 1024px`, `min-width: 640px`, `max-width: 639px`
    - Apply `line-height: ≥1.6` and `max-width: ≤72ch` for note content column
    - _Requirements: 13.4, 14.1–14.4, 15.5, 16.3, 19.1–19.5_

- [x] 4. Implement layouts and core shell components
  - [x] 4.1 Implement `BaseLayout.astro`
    - Semantic HTML shell: `<html>`, `<head>`, `<header>`, `<main>`, `<footer>` using semantic elements
    - Include synchronous theme-initialization `<script>` in `<head>` to avoid FOUC (reads `localStorage`, falls back to `prefers-color-scheme`)
    - Include skip-to-content link as first focusable element
    - Integrate `ThemeToggle` and `SearchDialog` components in header
    - _Requirements: 3.4, 13.1, 13.2, 15.1, 15.2, 16.1_

  - [x] 4.2 Implement `ThemeToggle.astro`
    - `<button>` toggling `data-theme` attribute on `<html>` element
    - Persist selection to `localStorage`; catch `SecurityError` for private browsing gracefully
    - Include ARIA label for accessibility
    - _Requirements: 13.2, 13.3, 15.4_

  - [x] 4.3 Implement `NoteLayout.astro`
    - Three-column CSS Grid layout: left sidebar (note list), center (note content), right (TOC)
    - Responsive collapse: two-column at 640–1023px (sidebar via toggle), single-column at <640px (sidebar in DrawerNav)
    - Render `<aside>` for sidebars, `<article>` for main content per semantic HTML requirements
    - _Requirements: 7.1, 14.1, 14.2, 14.3, 15.1_

  - [x] 4.4 Implement `DrawerNav.astro`
    - Off-canvas drawer for left sidebar on mobile viewports
    - Controlled via `aria-expanded` toggle button with ARIA label
    - Visible focus indicator on all interactive elements
    - _Requirements: 14.3, 15.2, 15.3, 15.4_

- [x] 5. Implement page components
  - [x] 5.1 Implement `CourseCard.astro`
    - Display course name (from `folderToTitle`), provider name (from `_course.json`), and note count
    - Render source URL link when `sourceUrl` is configured; omit otherwise
    - Do not render any duration, difficulty, ratings, or progress indicators
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ]* 5.2 Write property tests for course card content (Property 7)
    - **Property 7: Course cards contain required fields and no invented metadata**
    - **Validates: Requirements 6.1, 6.2, 5.6**
    - Use `fast-check` to generate course data and assert card HTML contains name/provider/count and lacks duration/difficulty/rating patterns
    - Tag: `// Feature: personal-ai-learning-portal, Property 7`
    - _Requirements: 6.1, 6.2, 5.6_

  - [ ]* 5.3 Write property tests for source URL link presence (Property 8)
    - **Property 8: Source URL link appears when configured**
    - **Validates: Requirements 6.3, 20.1, 20.2, 20.3**
    - Use `fast-check` to generate courses with/without `sourceUrl`; assert anchor presence matches configuration
    - Tag: `// Feature: personal-ai-learning-portal, Property 8`
    - _Requirements: 6.3, 20.1–20.3_

  - [x] 5.4 Implement `Breadcrumb.astro`
    - Render four-item breadcrumb: Home → Courses → [Course] → [Note]
    - Use `<nav aria-label="breadcrumb">` with proper semantic markup
    - Apply `aria-current="page"` to the final (current) item; it has no link
    - _Requirements: 7.2, 15.1, 15.4_

  - [ ]* 5.5 Write property tests for breadcrumb structure (Property 9)
    - **Property 9: Breadcrumb navigation reflects the correct hierarchical path**
    - **Validates: Requirements 7.2**
    - Use `fast-check` to generate course/note slug pairs; assert rendered breadcrumb always has exactly four items with correct hrefs and order
    - Tag: `// Feature: personal-ai-learning-portal, Property 9`
    - _Requirements: 7.2_

  - [x] 5.6 Implement `TOC.astro`
    - Extract H2/H3 headings from note content and render as anchor links
    - Implement `IntersectionObserver` scroll-spy to highlight the currently visible section
    - Include ARIA label on the TOC nav element
    - When no H2/H3 headings are present, render nothing (suppress TOC sidebar)
    - _Requirements: 7.5, 7.6, 15.4_

  - [ ]* 5.7 Write property tests for TOC heading extraction (Property 11)
    - **Property 11: TOC entries match the note's H2 and H3 headings**
    - **Validates: Requirements 7.5, 7.6**
    - Use `fast-check` to generate Markdown with arbitrary H1/H2/H3/H4 mixes; assert TOC contains only H2+H3, in document order
    - Tag: `// Feature: personal-ai-learning-portal, Property 11`
    - _Requirements: 7.5, 7.6_

  - [x] 5.8 Implement `CopyButton.astro`
    - Inject a copy-to-clipboard `<button>` as a sibling of each `<pre>` code block via post-processing script
    - Fallback to `window.prompt` with pre-selected text when Clipboard API is unavailable
    - Include ARIA label; ensure focus indicator is visible
    - _Requirements: 7.4, 8.4, 15.3, 15.4_

  - [ ]* 5.9 Write property tests for copy button presence (Property 12)
    - **Property 12: Copy buttons are present on all fenced code blocks**
    - **Validates: Requirements 7.4, 8.4**
    - Use `fast-check` to generate HTML with arbitrary numbers of `<pre>` blocks; assert each has an associated copy button
    - Tag: `// Feature: personal-ai-learning-portal, Property 12`
    - _Requirements: 7.4, 8.4_

  - [x] 5.10 Implement `SearchDialog.astro`
    - Native `<dialog>` element housing the Pagefind UI widget
    - Open on Ctrl+K / Cmd+K; close on Escape with focus return to triggering element
    - Lazy-load `/_pagefind/pagefind-ui.js` only on first open
    - Display "Search unavailable" message when Pagefind WASM fails to load
    - Include ARIA label on the dialog; trap focus while open
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 15.4_

- [ ] 6. Checkpoint — Ensure all component tests pass
  - Ensure all component-level unit tests and property tests pass, ask the user if questions arise.

- [x] 7. Implement page routes
  - [x] 7.1 Implement `src/pages/index.astro` (Homepage)
    - Render hero section with site title, tagline, and exactly two CTA links
    - Render course cards grid (one `CourseCard` per discovered course)
    - Render Quick Access inline list (three links from `quickAccess.ts`)
    - Render Next Courses list (five entries from `nextCourses.ts`)
    - Render Tools and Resources section linking to `/resources` and surfacing `ccstatusline`
    - Do not display duration, difficulty, ratings, or completion badges
    - _Requirements: 4.1, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 7.2 Implement `src/pages/courses/index.astro` (Courses index)
    - List all discovered courses with `CourseCard` components
    - Group and display note count per course
    - _Requirements: 4.2, 6.1_

  - [x] 7.3 Implement `src/pages/courses/[course]/index.astro` (Course detail)
    - Use `getStaticPaths()` to generate one route per discovered course
    - Build `CourseModel` by grouping `notes` entries by top-level folder
    - List all notes for the course with links to note reader pages
    - Display assets section grouped by `Asset_Category` when assets exist
    - _Requirements: 4.3, 8.1, 8.2, 8.3, 8.5_

  - [x] 7.4 Implement `src/pages/courses/[course]/[note].astro` (Note reader)
    - Use `getStaticPaths()` to generate one route per note per course
    - Render note content using `NoteLayout` with three-column structure
    - Include `Breadcrumb`, `TOC`, `CopyButton`, previous/next navigation
    - Render previous/next links by filesystem order; omit for first/last notes
    - Render copy-to-clipboard on every `<pre>` block and on asset full-content blocks
    - _Requirements: 4.4, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 1.1, 1.2, 1.3, 1.4_

  - [ ]* 7.5 Write property tests for previous/next navigation ordering (Property 10)
    - **Property 10: Previous/next navigation is consistent with filesystem ordering**
    - **Validates: Requirements 7.3**
    - Use `fast-check` to generate ordered note arrays; assert prev/next links reflect filesystem order and absent links for first/last
    - Tag: `// Feature: personal-ai-learning-portal, Property 10`
    - _Requirements: 7.3_

  - [x] 7.6 Implement `src/pages/quick-access.astro`, `src/pages/next-courses.astro`, and `src/pages/resources.astro`
    - `quick-access.astro`: render three Quick Access links as styled list (no progress or external badges)
    - `next-courses.astro`: render five Next Course titles as list items (title only, no invented metadata)
    - `resources.astro`: render resources grouped by category from `resources.ts`; `ccstatusline` entry must be present
    - _Requirements: 4.5, 4.6, 4.7, 10.1, 10.2, 11.1, 11.2, 12.1, 12.2, 12.3_

- [x] 8. Implement the content validation Vite plugin
  - [x] 8.1 Implement `src/plugins/contentValidator.ts`
    - Hook into Astro's `astro:build:done` integration hook
    - Scan all emitted HTML for internal `<a href>` and `<img src>` references
    - Check each resolved local path against the emitted file list
    - Emit `console.warn` (non-fatal) for broken links and missing images, including source file and unresolved target
    - Emit `console.warn` and include raw content fallback for unparseable files
    - _Requirements: 18.1, 18.2, 18.3_

  - [ ]* 8.2 Write property tests for the content validator (Property 14)
    - **Property 14: Content validator emits warnings for broken internal links**
    - **Validates: Requirements 18.1, 18.2**
    - Use `fast-check` to generate sets of HTML with arbitrary internal links (some resolving, some not); assert warning emitted for each broken link including source and target
    - Tag: `// Feature: personal-ai-learning-portal, Property 14`
    - _Requirements: 18.1, 18.2_

- [x] 9. Implement theme system and persistence
  - [x] 9.1 Verify and harden the theme initialization script in `BaseLayout.astro`
    - Ensure synchronous `<script>` in `<head>` reads `localStorage` and sets `data-theme` before first paint
    - Handle `SecurityError` when `localStorage` is unavailable (private browsing) — fall back to `prefers-color-scheme`
    - _Requirements: 13.1, 13.2, 13.3_

  - [ ]* 9.2 Write property tests for theme persistence (Property 13)
    - **Property 13: Theme selection persists across page loads**
    - **Validates: Requirements 13.3**
    - Use `fast-check` to generate `'light' | 'dark'` values; assert that the initialization script reads stored value and applies correct `data-theme` attribute, overriding OS preference
    - Tag: `// Feature: personal-ai-learning-portal, Property 13`
    - _Requirements: 13.3_

- [ ] 10. Configure GitHub Actions CI/CD pipeline
  - Create `.github/workflows/deploy.yml` at the repo root
  - Trigger on push to default branch (`main`)
  - Steps: checkout, Node.js setup, `npm install`, `npm run build` — fail the workflow on non-zero exit
  - Deploy static output using `actions/deploy-pages`; do NOT deploy if build step fails
  - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [ ] 11. Checkpoint — Ensure all tests pass
  - Run `npm run build` in `portal/` to verify zero build errors
  - Run `npx vitest --run` to verify all unit and property tests pass
  - Ask the user if any questions arise before proceeding to build output tests.

- [ ] 12. Write build output smoke and integration tests
  - [ ] 12.1 Write smoke tests in `tests/build/`
    - Verify `dist/index.html` exists and `dist/` is non-empty after build
    - Verify `dist/_pagefind/` directory and index files exist (Pagefind ran successfully)
    - Verify no server-side runtime is referenced in `dist/` output
    - _Requirements: 3.1, 3.4, 9.1, 17.2_

  - [ ]* 12.2 Write unit tests for route existence
    - Verify every expected route has a corresponding `.html` file in `dist/`: `/courses`, `/courses/[course]`, `/courses/[course]/[note]`, `/quick-access`, `/next-courses`, `/resources`
    - _Requirements: 4.1–4.7_

  - [ ]* 12.3 Write unit tests for static data integrity and semantic HTML
    - Verify the three Quick Access links match specified URLs
    - Verify five Next Course titles appear in correct order
    - Verify `ccstatusline` is present on the resources page
    - Verify `<nav>`, `<main>`, `<article>`, `<aside>`, `<header>`, `<footer>` present in correct page regions
    - Verify `<head>` contains the synchronous theme-initialization script
    - Verify ARIA labels on search dialog, theme toggle, drawer navigation, and copy buttons
    - _Requirements: 10.1, 11.1, 12.2, 15.1, 15.4_

  - [ ]* 12.4 Write unit tests for responsive CSS and system fonts
    - Verify stylesheet contains `min-width: 1024px`, `min-width: 640px`, `max-width: 639px` media queries
    - Verify CSS contains system font stacks with no `@import` or external `<link>` for fonts
    - Verify CSS contains `@media (prefers-reduced-motion: reduce)` rules
    - _Requirements: 14.1–14.4, 15.6, 16.3, 19.1_

  - [ ]* 12.5 Write unit tests for Mermaid rendering and Pagefind
    - Verify at least one rendered note page contains an SVG element in place of a mermaid fenced block
    - Verify no `<pre><code class="language-mermaid">` elements remain in rendered HTML
    - _Requirements: 1.4_

  - [ ]* 12.6 Write unit tests for CI/CD workflow file
    - Verify `.github/workflows/deploy.yml` contains push trigger on default branch, `npm install`, `npm run build`, and `actions/deploy-pages` step
    - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [ ] 13. Final checkpoint — Ensure all tests pass
  - Run complete test suite (`npx vitest --run`) and confirm all pass.
  - Verify `npm run build` completes with exit code 0 and `dist/` is fully populated.
  - Ask the user if any questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use `fast-check` with minimum 100 iterations (`numRuns: 100`)
- Checkpoints ensure incremental validation throughout the build
- The portal lives in `portal/` subdirectory; all npm commands should run from that directory
- `_course.json` files are placed in each course folder at the repo root (not inside `portal/`)
- Content collections use `glob()` loaders with `base: '../'` to reach course folders from `portal/src/content/config.ts`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2", "3.1", "3.2"] },
    { "id": 1, "tasks": ["2.3", "2.4", "2.5", "2.6", "4.1", "4.2", "4.3", "4.4"] },
    { "id": 2, "tasks": ["5.1", "5.4", "5.6", "5.8", "5.10", "7.6", "8.1", "9.1"] },
    { "id": 3, "tasks": ["5.2", "5.3", "5.5", "5.7", "5.9", "7.1", "7.2", "7.3"] },
    { "id": 4, "tasks": ["7.4", "8.2", "9.2", "10"] },
    { "id": 5, "tasks": ["7.5", "12.1"] },
    { "id": 6, "tasks": ["12.2", "12.3", "12.4", "12.5", "12.6"] }
  ]
}
```
