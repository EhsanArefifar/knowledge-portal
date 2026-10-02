# Anthropic - Claude 101

*Running notes from Claude Academy courses. Focused on points that are new or could meaningfully change day-to-day Claude usage — not a full course recap.*

---

## Claude 101

**Main capabilities:**
- Content creation
- Research & analysis: explore angles, compile findings, analyze data — helped by large context window (200K+ tokens standard, up to 1M on Pro/Max/Team/Enterprise w/ supported models)
- Coding assistance
- Problem-solving & reasoning: complex cognitive tasks, math, strategy — Claude can respond instantly or use "Thinking" to reason step-by-step first
- Learning mode: guides your reasoning rather than giving answers — builds critical thinking

**Best approach: talk like a coworker — natural, concise, conversational**
- Setting the stage: your role, objectives, relevant context
- Define the task: what action — write, analyze, build, etc.
- Rule specification: style/tone + examples if you have them

**Personalizing Claude:**
- Memory: auto-saves context (role, preferences, past decisions, working style) across chats; editable/deletable in Settings; syncs across devices
- Styles: presets (concise/formal/explanatory) or custom description of how you want Claude to write; applies across all conversations — separate from Memory

**Fixing common issues:**
- Too generic → add specific context (audience, role, constraints)
- Too long/short → state length explicitly ("2-paragraph summary", "under 100 words")
- Wrong format → show an example or describe structure explicitly, don't just tell
- Confident but wrong info → verify independently for high-stakes stuff; ask Claude to cite sources/confidence; enable web search
- Wrong tone → describe tone in plain language + give an example

**Evals:** systematic way to test how well Claude performs on tasks that matter to you — builds discernment, shows where Claude needs more context/examples, builds confidence for recurring tasks

**Simple eval approach:**
1. Gather 5–10 real examples of a task you do regularly
2. Write test prompts with the context you'd naturally have
3. Compare outputs: key info captured? tone/style right? what's missing?
4. Refine prompts / add examples based on the gaps

### Claude on Desktop — Three Ways of Working

**Three shapes of work — the tab follows the task, not the other way round:**
- Turn-by-turn (Chat) — back-and-forth, thinking happens in the exchange
- Hand-off (Cowork) — describe an outcome, Claude plans it + does it + returns the result
- Build software (Code tab) — Claude works directly in a codebase, dev-only (covered separately in the Claude Code course)

**Chat — desktop-native extras:**
- Quick entry: double-tap Option (Mac) → compact always-on-top window over whatever you're doing
- Screenshot/window sharing + dictation (Mac)
- Desktop connectors: hooks into local tools/services on your machine

**Cowork — hand off multi-step work (new to me, more detail):**
- Core shift: you give an *outcome*, not a question — Claude gathers context, does the analysis, and produces a real deliverable (Word doc, spreadsheet, deck, PDF) **saved into a folder**, not just pasted into a chat window. That's the concrete difference from Chat, which only hands finished files back as downloads.
- Still steerable, not black-box: Claude may ask a few scoping questions before starting, shows you its plan, and you can watch it work (sources it's pulling, files forming, progress) and steer mid-task.
- "Ask before acting" setting: Claude pauses for your approval before consequential actions (sending an email, sharing a file) — you stay in control of what leaves your desk.
- **Local folder access**: point Claude at a folder → it reads what's there and saves finished work back to that same folder.
- **Scheduled tasks**: set up once (daily briefing, Friday roll-up, Monday inbox triage), runs on the cadence you set; if your computer/app was closed at trigger time, it catches up when you're back.
- **Subagents**: for big jobs, Claude splits work across parallel background workers (each with its own context) and hands you one combined deliverable.
- **Projects**: workspace grouping related *tasks* with their own files/instructions/memory — same concept as Chat projects, but built around tasks rather than conversations.
- **Browser use** (via Claude in Chrome): navigates websites and pulls what it finds into the task — e.g. competitor pricing across many sites with no API.
- **Computer use**: when no connector exists for what's needed, Claude can operate your computer directly (click, type, open apps) — asks permission per app, has a blocklist for anything off-limits. Currently research preview, Pro/Max only.
- **Plugins**: ready-made bundles of skills + connectors + agents for a specific role (sales, finance, legal) — browse/add under Customize → Plugins.
- Available on Pro, Max, Team, Enterprise.

**Code tab (build software) — brief, dev-focused:**
- Claude works directly in your codebase: reads, writes, runs commands; visual diffs, built-in terminal, git for rollback
- Environment choice: Local (folder on your machine, live dev server preview) or Cloud (GitHub repo, sessions persist after closing the app — better for big refactors/larger codebases)
- Autonomy settings: Manually approve / Accept edits / Plan first
- Pro/Max/Team/Enterprise; multiple sessions, filterable by environment + status

### Projects

- Project description field is for humans only — Claude doesn't read it directly (instructions are what it follows)
- RAG scaling: once knowledge base nears context limit, Claude auto-switches to retrieval (searches relevant docs instead of loading everything) — expands capacity ~10x, shows a visual indicator when active
- File names matter: Claude uses filename + grouping/proximity to understand & retrieve docs — name descriptively ("Q4-2025-Sales-Report.pdf", not "report.pdf")
- Can reference a doc by name mid-chat to focus the search ("Based on our Q3 report...")
- Team/Enterprise sharing tiers: Can view / Can edit / Owner
- Instructions can automate workflows, not just set tone: "when I upload X, do Y"

### Artifacts

**Types you can ask for:**
- Documents (markdown/plain text) — notes, reports, blog posts, plans
- Code snippets — any language
- HTML pages — full single-file sites (landing pages, prototypes, interactive demos)
- SVG images — logos, icons, illustrations
- Mermaid diagrams — flowcharts, sequence/Gantt/org charts
- React components — real interactive UI (calculators, dashboards, games), not just mockups
- Word/Excel/PPT/PDF — separate "file creation" capability (not artifacts), returned as downloadable files

- Publishing: only the selected version goes public, viewable without a Claude account, but **not indexed by search engines** (won't show in Google) — unpublish anytime from the same artifact
- Org sharing (Team/Enterprise) ≠ public publish — internal share stays behind team authentication

### Skills

- **What/why:** folders of instructions, scripts, resources Claude loads dynamically for specialized, repeatable tasks — "expertise packages." Already powers Excel/Word/PPT/PDF creation behind the scenes.
- **Types:** Anthropic Skills (built-in, auto-invoked, e.g. doc creation) vs. Custom Skills (yours/org's — brand guidelines, checklists, specific workflows)
- **Enabling:** needs "Code execution and file creation" on (Settings → Capabilities); feature preview on Pro/Max/Team/Enterprise; Enterprise needs org Owner to enable first at Admin level; Team has it on by default
- **Security:** only install custom Skills from trusted sources; review contents before use (they can include executable code); Skills you upload yourself are private to your account
- **Creating a custom Skill by just asking Claude:** tell it what you want ("I want a skill for writing QBRs") → Claude interviews you (what should it do, what's good output, example use cases) → optionally upload templates/examples → Claude generates the skill file, no coding needed. Manage/edit under the Customize tab; ask Claude to edit a skill to iterate on it.
- **Skills vs. Projects:** *"Skills are procedural machines — they encode how Claude should execute a task: the specific steps, order of operations, and methodology you want followed every time. Skills shine when you have repeatable workflows you want Claude to run consistently."* Projects = knowledge (the *what*), Skills = process (the *how*) — a skill can pull from a project's knowledge base, so they combine.
- Practical: watch Claude's chain-of-thought to see when a skill actually fires.

### Connectors

- Two types: Web connectors (cloud apps — Slack, Notion, Gmail, etc.) vs. Desktop extensions (local file system/native apps like Figma — Claude Desktop app only)
- MCP is the protocol underneath ("USB-C for AI") — open standard, so anyone can build a connector for any tool
- Security: Claude only sees what *you* have access to — connecting your email ≠ access to others' inboxes
- Permissions are scoped/toggleable per connector, revocable anytime; custom/community connectors exist too — same "trusted sources only" rule as Skills

### Enterprise Search

- What it is: adds "Ask {Org Name}" to the sidebar — a pre-built, org-wide project with your company's knowledge already loaded; searches across all connected tools (SharePoint, Slack, Gmail, Drive, etc.) and synthesizes a cited answer
- Usage: best for cross-source questions — catching up on what you missed, policy/process Qs, research/synthesis across docs, onboarding, tracking decisions/project status
- Only on Team/Enterprise plans — i.e. org accounts, not personal Free/Pro/Max
- Enabling: two-step — admin sets it up org-wide first, then each user authenticates individually

### Research

- What it is: agentic, multi-step investigation — Claude plans first (via Thinking), runs many searches that build on each other, synthesizes into a cited report. Takes minutes, not seconds.
- Use when: comprehensive/cross-source reports, in-depth analysis, comparative research (vendors/competitors), investigations that'd take hours manually
- Ideal for: market/competitive analysis, complex project planning, synthesizing across email/calendar/docs, technical documentation, briefings needing current verified info
- Use web search instead when: quick single fact, 1–2 sources are enough, speed > comprehensiveness
- Prompt tips: be specific about the goal; specify the structure/sections you want; include constraints (budget, timeline, geography); can ask Claude to help refine the prompt before running it
- Combine with connectors: with Google Workspace etc. connected, Research pulls from your email/calendar/docs alongside the web — e.g. "summarize what's been said about X across email/Slack, then research industry best practices"

### Claude in Action — Use Cases by Role

- Use Case Gallery: https://claude.com/resources/use-cases — step-by-step guides by role (sales, marketing, finance, HR, legal, research, general)
- Worth it because: a ready-made library of proven prompt patterns/workflows — quicker to check here before reinventing a prompt from scratch for a new type of task

### Other Ways to Work with Claude

**Quick reference:**

| Tool | Best for | Where it runs |
|---|---|---|
| Claude Code | Software dev, codebase nav, git workflows | Terminal/IDE/browser |
| Claude Cowork | Multi-step tasks: research briefs, docs, file org, data analysis | Desktop (+ web/mobile beta) |
| Claude Tag | Team collab, meeting prep, quick in-context answers | Slack |
| Claude Design | UI prototypes, design exploration | Web |
| Claude for M365 | Editing in place, context carried across docs | Excel/PPT/Word/Outlook sidebars |
| Claude in Chrome | Web research, email, browser automation | Chrome sidebar |

- **Claude Tag — nice one:** tag Claude directly in a bug report or feature-discussion thread in Slack and it can spin up a Claude Code session using that surrounding context — no manual copy-paste into a separate coding session.
- **Claude Design (clarifying note, since the lesson text is thin):** a separate space from chat artifacts — dedicated specifically to UI/prototype work. Give it a brief, a sketch, or a screenshot → get back an *interactive, clickable* prototype (not a static mock), can generate/compare several variations, and you iterate by describing changes rather than editing code. Can stay aligned to your team's actual design system, so what you hand off to engineering is closer to what actually ships.
- **Excel/PowerPoint/Word sidebars, one-liner each:**
  - Excel: edits/debugs formulas & workbook logic in place (traces #REF!/#VALUE!/circular refs), builds pivots/charts
  - PowerPoint: turns notes into a draft deck / restructures an existing one, keeping your template & brand styling intact
  - Word: drafts/revises the open document in place, works with tracked changes & comments
- **Claude in Chrome:** sidebar that sees what you're doing in-browser and can act on it — summarize pages, draft email replies, auto-fill repetitive forms, navigate multi-step flows, keeps context across tabs (handy for niche internal tools/CRMs with no connector). Still beta: use for low-risk tasks on trusted sites; asks permission before high-risk actions (purchases, sharing personal data); some site categories (financial, adult) blocked by default.

---
