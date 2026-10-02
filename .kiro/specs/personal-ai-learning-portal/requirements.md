# Requirements Document

## Introduction

A static, GitHub Pages-compatible personal AI learning portal built with Astro that organizes and presents existing Markdown course notes from the `claude-code-knowledge-base` repository. The portal renders notes verbatim without modification, auto-discovers courses from the filesystem, and provides search, navigation, and curated quick-access links to external resources. The target audience is the portal owner — a developer actively learning Claude and AI tooling.

## Glossary

- **Portal**: The Astro-based static site that constitutes the personal AI learning portal.
- **Course**: A top-level folder in the content directory containing one or more Note files (e.g. `Claude-academy/`, `NetNinja-masterclass/`).
- **Note**: A single Markdown file that forms a readable unit within a Course (e.g. `anthropic_claude_101.md`).
- **Asset**: A supplementary Markdown file with YAML frontmatter found under an `assets/` subfolder of a Course, representing an agent definition, custom command, or skill definition (e.g. files under `NetNinja-masterclass/assets/`).
- **Asset_Category**: A subcategory folder under `assets/` that groups Assets by type (e.g. `agents`, `commands`, `skills`).
- **Note_Reader**: The Portal page that renders a single Note with a three-column layout.
- **TOC**: The auto-generated Table of Contents derived from the headings of a Note.
- **Search_Engine**: The client-side static search implementation (e.g. Pagefind) integrated into the Portal.
- **Theme_Toggle**: The UI control that switches between light and dark color schemes.
- **Quick_Access**: The curated list of three external learning platform links shown on the Homepage and the dedicated `/quick-access` page.
- **Next_Courses**: The curated list of five planned future courses shown on the Homepage and the dedicated `/next-courses` page.
- **Resources**: The curated list of tools and external resources shown on the dedicated `/resources` page.
- **Build_System**: The Astro static site generator and associated npm scripts.
- **CI_CD_Pipeline**: The GitHub Actions workflow that builds and deploys the Portal to GitHub Pages.
- **Content_Validator**: The build-time process that checks for broken internal links and missing referenced assets.

---

## Requirements

### Requirement 1: Content Fidelity

**User Story:** As a portal user, I want the portal to render my Markdown notes exactly as authored, so that none of my learning content is lost, altered, or misrepresented.

#### Acceptance Criteria

1. THE Portal SHALL render every Note's Markdown content verbatim, without rewriting, summarizing, or modifying source files.
2. WHEN a Note contains GitHub Flavored Markdown (GFM) elements — including headings, unordered and ordered lists, fenced code blocks with language identifiers, tables, images, blockquotes, task-list checkboxes, and inline HTML — THE Note_Reader SHALL render each element according to GFM specification.
3. THE Note_Reader SHALL apply syntax highlighting to fenced code blocks using the language identifier present in the source Markdown.
4. THE Note_Reader SHALL render Mermaid diagram fences as visual diagrams, not as raw code blocks.

---

### Requirement 2: Automatic Content Discovery

**User Story:** As the portal owner, I want courses and notes to appear automatically when I add new folders and Markdown files, so that I never need to manually register content.

#### Acceptance Criteria

1. WHEN a new folder containing at least one Markdown file is added to the content directory at build time, THE Build_System SHALL include that folder as a Course in the Portal without any manual configuration change.
2. WHEN a Markdown file is added to an existing Course folder at build time, THE Build_System SHALL include that file as a Note within that Course.
3. THE Portal SHALL derive the Course name for display from the folder name by converting hyphens and underscores to spaces and applying title case.
4. THE Portal SHALL derive the Note title for display from the first H1 heading found in the Note file; IF no H1 heading is present, THEN THE Portal SHALL derive the title from the filename by converting hyphens and underscores to spaces and applying title case.
5. THE Portal SHALL derive the note count for each Course card by counting the Markdown files directly within the Course folder, excluding files in subdirectories.

---

### Requirement 3: Technology Stack and Build

**User Story:** As the portal owner, I want the site built with Astro and deployable to GitHub Pages as a fully static site, so that I have no hosting costs and no server to maintain.

#### Acceptance Criteria

1. THE Build_System SHALL use Astro as the static site generator and produce a fully static HTML/CSS/JS output with no server-side runtime dependency.
2. THE Build_System SHALL support a configurable `base` path so that the Portal can be deployed to a GitHub Pages subdirectory (e.g. `/claude-code-knowledge-base/`).
3. THE Build_System SHALL expose the following npm scripts: `npm install` for dependency installation, `npm run dev` for local development server, `npm run build` for production static output, and `npm run preview` for previewing the production build locally.
4. THE Build_System SHALL produce pre-rendered HTML pages for every route at build time, with JavaScript used only for interactive enhancements.

---

### Requirement 4: Page Routes

**User Story:** As a portal user, I want dedicated pages for each section of the portal, so that I can bookmark and navigate directly to any content area.

#### Acceptance Criteria

1. THE Portal SHALL serve a Homepage at the root path `/`.
2. THE Portal SHALL serve a courses index page at `/courses`.
3. THE Portal SHALL serve a course detail page at `/courses/[course]` for each discovered Course.
4. THE Portal SHALL serve a note reader page at `/courses/[course]/[note]` for each discovered Note within a Course.
5. THE Portal SHALL serve a quick-access page at `/quick-access`.
6. THE Portal SHALL serve a next-courses page at `/next-courses`.
7. THE Portal SHALL serve a resources page at `/resources`.

---

### Requirement 5: Homepage Layout

**User Story:** As the portal user, I want the homepage to give me an immediate overview of available content and quick navigation options, so that I can reach any section within one or two clicks.

#### Acceptance Criteria

1. THE Portal SHALL render a compact hero section on the Homepage containing a site title, a tagline, and exactly two call-to-action links.
2. THE Portal SHALL render a course cards grid on the Homepage showing one card per discovered Course.
3. THE Portal SHALL render a Quick Access section on the Homepage as an inline list of the three Quick Access links defined in Requirement 10.
4. THE Portal SHALL render a Next Courses section on the Homepage listing the five planned courses defined in Requirement 11.
5. THE Portal SHALL render a Tools and Resources section on the Homepage linking to the `/resources` page and surfacing at least the `ccstatusline` entry defined in Requirement 12.
6. THE Homepage SHALL NOT display invented metadata such as course duration, difficulty ratings, or completion badges.

---

### Requirement 6: Course Cards

**User Story:** As a portal user, I want each course card to show only verified information, so that I am not misled by invented metadata.

#### Acceptance Criteria

1. THE Portal SHALL display on each course card: the Course name derived per Requirement 2.3, the course provider name as configured in the course's metadata file, and the note count derived per Requirement 2.5.
2. THE Portal SHALL NOT display on a course card any metadata that is not present in the source content or explicit configuration, including duration, difficulty level, ratings, or progress indicators.
3. WHERE a source URL is configured for a Course, THE Portal SHALL render a link to that URL on the course card.

---

### Requirement 7: Note Reader Layout

**User Story:** As a portal user, I want a three-column reading experience with navigation and table of contents, so that I can efficiently move through long notes and jump to sections.

#### Acceptance Criteria

1. THE Note_Reader SHALL present a three-column layout on desktop viewports: a left sidebar showing the course note list, a central content column rendering the Note, and a right sidebar showing the TOC.
2. THE Note_Reader SHALL display breadcrumb navigation above the Note content showing the path: Home › Courses › [Course Name] › [Note Title].
3. THE Note_Reader SHALL display previous-note and next-note navigation links at the bottom of the Note content, ordered by the filesystem order of Note files within the Course.
4. THE Note_Reader SHALL render a copy-to-clipboard button on each fenced code block that copies the block's raw text content to the clipboard when activated.
5. THE TOC SHALL be auto-generated from the H2 and H3 headings present in the Note and SHALL update to highlight the currently visible section as the user scrolls.
6. IF a Note contains no H2 or H3 headings, THEN THE Note_Reader SHALL render the central content column without a TOC sidebar.

---

### Requirement 8: Assets Section

**User Story:** As a portal user, I want to browse the agents, commands, and skills from my course assets folder, so that I can reference and copy them without leaving the portal.

#### Acceptance Criteria

1. THE Portal SHALL discover Asset files by scanning every `assets/` subfolder found within a Course directory at build time.
2. THE Portal SHALL derive Asset_Category names from the immediate subfolder names under `assets/` (e.g. `agents`, `commands`, `skills`).
3. THE Portal SHALL render each Asset file's content with syntax highlighting applied to its YAML frontmatter and any code blocks within the body.
4. THE Portal SHALL render a copy-to-clipboard button on each Asset's full content block.
5. WHEN a new subfolder is added under `assets/` at build time, THE Portal SHALL include it as a new Asset_Category without configuration changes.

---

### Requirement 9: Client-Side Search

**User Story:** As a portal user, I want to search all my notes from anywhere in the portal, so that I can quickly find a topic without browsing course by course.

#### Acceptance Criteria

1. THE Search_Engine SHALL index all Note content at build time and serve the index as static files alongside the Portal output.
2. WHEN the user presses Ctrl+K (Windows/Linux) or Cmd+K (Mac), THE Portal SHALL open a search dialog.
3. WHEN the search dialog is open and the user types a query, THE Search_Engine SHALL display matching results within the dialog without a page reload.
4. THE Search_Engine SHALL display search results in a compact format showing the Note title, the matching Course name, and a brief text excerpt around the matched term.
5. WHEN the user selects a search result, THE Portal SHALL navigate to the corresponding Note reader page.
6. WHEN the user presses Escape while the search dialog is open, THE Portal SHALL close the dialog and return focus to the triggering element.

---

### Requirement 10: Quick Access Links

**User Story:** As a portal user, I want one-click access to the external learning platforms I use most, so that I can resume coursework without searching for URLs.

#### Acceptance Criteria

1. THE Portal SHALL include exactly the following three Quick Access links on the `/quick-access` page and on the Homepage: Anthropic Skilljar (linking to `https://anthropic.skilljar.com`), Claude Academy (linking to `https://anthropic.skilljar.com/claude-101`), and Claude Partners Network.
2. THE Portal SHALL render the Quick Access list as a simple styled list without progress indicators, completion status, or external badges.

---

### Requirement 11: Next Courses List

**User Story:** As the portal owner, I want a curated list of upcoming courses shown prominently, so that I always know what to study next.

#### Acceptance Criteria

1. THE Portal SHALL include on the `/next-courses` page and on the Homepage exactly the following five entries, in this order: FastAPI for AI Engineers, Net Ninja Git Crash Course, Complete Agentic AI Course, Claude Code (DeepLearning.AI), Claude Architect Exam Guide.
2. THE Portal SHALL render each Next Course entry as a list item with the course title only; THE Portal SHALL NOT invent or display enrollment links, durations, or difficulty levels for Next Courses.

---

### Requirement 12: Resources Section

**User Story:** As the portal owner, I want a resources page that lists useful tools with descriptions and links, so that I can grow my reference library over time.

#### Acceptance Criteria

1. THE Portal SHALL serve a `/resources` page that displays resources organised by category.
2. THE Portal SHALL include on the `/resources` page the following entry in an appropriate category: tool name `ccstatusline`, a brief description of the tool, and a link to its GitHub repository.
3. THE Portal SHALL support adding new resource entries and categories without structural code changes — only data changes SHALL be required.

---

### Requirement 13: Light/Dark Theme

**User Story:** As a portal user, I want the portal to respect my OS color-scheme preference and let me override it manually, so that I can read comfortably in any lighting condition.

#### Acceptance Criteria

1. THE Portal SHALL apply a color scheme on initial page load that matches the user's OS-level `prefers-color-scheme` media feature.
2. THE Theme_Toggle SHALL allow the user to switch between light and dark modes at any time.
3. WHEN the user changes the theme via THE Theme_Toggle, THE Portal SHALL persist the selection in `localStorage` and apply it on all subsequent page loads, overriding the OS preference.
4. WHILE the `prefers-reduced-motion` media feature is active, THE Portal SHALL disable all non-essential CSS transitions and animations.

---

### Requirement 14: Responsive Layout

**User Story:** As a portal user, I want the layout to adapt to my screen size, so that I can read notes on desktop, tablet, and mobile devices.

#### Acceptance Criteria

1. WHILE the viewport is at desktop width (≥1024px), THE Portal SHALL render the Note_Reader in a three-column layout as defined in Requirement 7.1.
2. WHILE the viewport is at tablet width (≥640px and <1024px), THE Portal SHALL render the Note_Reader in a two-column layout showing the central content column and either the left sidebar or the TOC sidebar, with the other accessible via a toggle.
3. WHILE the viewport is at mobile width (<640px), THE Portal SHALL render the Note_Reader in a single-column layout with navigation accessible via a drawer or off-canvas panel.
4. THE Portal SHALL render all pages with a fully usable layout at every viewport width from 320px upward.

---

### Requirement 15: Accessibility

**User Story:** As a portal user, I want the portal to be usable with keyboard-only navigation and assistive technologies, so that the content is accessible regardless of how I interact with my computer.

#### Acceptance Criteria

1. THE Portal SHALL use semantic HTML elements — including `<nav>`, `<main>`, `<article>`, `<aside>`, `<header>`, `<footer>` — for all page regions.
2. THE Portal SHALL ensure every interactive element is reachable and operable via keyboard Tab and Enter/Space keys without requiring a mouse.
3. THE Portal SHALL maintain a visible focus indicator on every focused interactive element that meets WCAG 2.1 AA non-text contrast requirements.
4. THE Portal SHALL include ARIA labels or roles on all custom interactive components (search dialog, theme toggle, drawer navigation, copy buttons) that lack sufficient native semantics.
5. THE Portal SHALL ensure all text content meets WCAG 2.1 AA minimum contrast ratio (4.5:1 for normal text, 3:1 for large text) in both light and dark themes.
6. WHILE the `prefers-reduced-motion` media feature is active, THE Portal SHALL disable or reduce all animations and transitions (as also specified in Requirement 13.4).

---

### Requirement 16: Performance

**User Story:** As a portal user, I want pages to load quickly and feel responsive, so that I am not slowed down while navigating my notes.

#### Acceptance Criteria

1. THE Build_System SHALL pre-render all pages to static HTML at build time so that no JavaScript execution is required to display the primary content of any page.
2. THE Portal SHALL lazy-load images that appear below the initial viewport fold using the HTML `loading="lazy"` attribute or equivalent mechanism.
3. THE Portal SHALL use system fonts as the primary typeface to eliminate render-blocking web font downloads.
4. THE Portal SHALL ship minimal JavaScript, limited to interactive enhancements (theme toggle, search dialog, copy buttons, TOC scroll-spy, drawer navigation).

---

### Requirement 17: GitHub Actions CI/CD

**User Story:** As the portal owner, I want every push to the main branch to automatically build and deploy the portal to GitHub Pages, so that my published notes are always up to date.

#### Acceptance Criteria

1. THE CI_CD_Pipeline SHALL trigger automatically on every push to the repository's default branch.
2. THE CI_CD_Pipeline SHALL execute `npm install` and `npm run build` and fail the workflow if either command exits with a non-zero status.
3. THE CI_CD_Pipeline SHALL deploy the static build output to GitHub Pages using the official `actions/deploy-pages` action or equivalent.
4. WHEN the build step fails, THE CI_CD_Pipeline SHALL NOT deploy any output to GitHub Pages.

---

### Requirement 18: Build-Time Content Validation

**User Story:** As the portal owner, I want the build to warn me about broken internal links and missing referenced assets, so that I never unknowingly publish a broken portal.

#### Acceptance Criteria

1. WHEN THE Build_System encounters an internal link (a Markdown link whose target is a local path) that does not resolve to an existing file, THE Content_Validator SHALL emit a build warning identifying the source file and the unresolved target path.
2. WHEN THE Build_System encounters a Markdown image reference whose source path does not resolve to an existing file, THE Content_Validator SHALL emit a build warning identifying the source file and the missing image path.
3. THE Content_Validator SHALL NOT silently omit any Note or Asset file discovered during content scanning; IF a file cannot be parsed, THEN THE Content_Validator SHALL emit a build warning and include the file with raw content fallback.

---

### Requirement 19: Visual Design

**User Story:** As the portal owner, I want the portal to look clean and professional, suited to a developer and AI learning context, so that I am proud to use and share it.

#### Acceptance Criteria

1. THE Portal SHALL use system font stacks (e.g. `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` for UI; `'SFMono-Regular', Consolas, monospace` for code) with no external web font dependencies.
2. THE Portal SHALL apply a single restrained accent color consistently across interactive elements (links, buttons, active states, focus rings) in both light and dark themes.
3. THE Portal SHALL use subtle borders and box shadows (low elevation) rather than heavy drop shadows or flat borderless layouts.
4. THE Portal SHALL apply medium border-radius (e.g. 6–10px) to card and button elements for a modern but not overly rounded appearance.
5. THE Portal SHALL apply generous line-height (≥1.6) and comfortable paragraph max-width (≤72ch) in the Note content column for optimal reading typography.

---

### Requirement 20: Known Course Source URLs

**User Story:** As the portal owner, I want the portal to link to the original course pages for each course I have notes for, so that I can easily return to the source material.

#### Acceptance Criteria

1. THE Portal SHALL display a source URL link for the Net Ninja Masterclass course pointing to `https://netninja.dev/courses/enrolled/2931538`.
2. THE Portal SHALL display a source URL link for the Claude 101 course pointing to `https://anthropic.skilljar.com/claude-101`.
3. THE Portal SHALL display a source URL link for the Claude Code in Action course pointing to `https://anthropic.skilljar.com/claude-code-in-action`.

---

### Requirement 21: No Backend, Authentication, or Analytics

**User Story:** As the portal owner, I want the portal to have no server-side dependencies, user authentication, or third-party analytics, so that it remains simple, private, and maintenance-free.

#### Acceptance Criteria

1. THE Portal SHALL NOT implement any user authentication or authorization mechanism.
2. THE Portal SHALL NOT send any telemetry, analytics events, or tracking pixels to any third-party service.
3. THE Portal SHALL NOT depend on any server-side runtime for content delivery; all content SHALL be served as static files.
4. THE Portal SHALL NOT implement any progress tracking, completion tracking, or user-state persistence beyond the theme preference stored in `localStorage`.
