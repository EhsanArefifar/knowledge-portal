# Anthropic - Claude Code in Action

## Steering Long Sessions

**Two core habits for long sessions:** scope before Claude starts, then steer while it runs.

**Plan mode:** Claude does read-only research first, hands you a plan before writing code — actually read it, don't skim; iterating on the plan is much faster than cleaning up after a bad run.

**Compact (`/compact`):** summarizes the conversation, uses that as new context, deletes old messages — frees the context window, but risks dropping something important. Always add instructions after the command to steer what gets kept, e.g. `/compact Focus on the --version flag implementation`.

**Rewind:** double-tap Escape on an empty prompt to open it. Every user prompt is a checkpoint you can revert to:
- Restore code and conversation / Restore conversation only / Restore code only
- Summarize from here (frees space after a side-tangent) / Summarize up to here (compresses a long setup phase, keeps the implementation intact)

**Goal (`/goal`):** sets a completion condition — Claude keeps working across turns until a fast evaluator confirms it's met, e.g. `/goal all tests in src/billing pass, and the type checker reports zero errors`. Clear it with `/goal clear`. Constraint: the evaluator only reads the transcript, so the condition must be checkable from Claude's own output (like a test run result).

**Loop (`/loop`) — clarified, since the course text alone was unclear:**
- Re-runs a prompt on an interval while the session stays open — good for polling something external (CI status, a deploy, a long build) instead of you checking back manually.
- Fixed-interval example: `/loop 10m check if the CI build for PR #482 finished; if it failed, pull the logs and summarize why` — re-runs that exact check every 10 minutes.
- Self-paced example (no interval given): `/loop check back on the deploy and tell me when it's done` — Claude decides the check-in cadence itself instead of you fixing one.
- Stop anytime with Escape. Requires Claude Code v2.1.72+; minimum interval is 1 minute.

**Worktrees — clarified (how it actually works + how to turn it on):**
- What it solves: running several Claude Code sessions on the same repo at once without them overwriting each other's file edits.
- How it works: a worktree is a separate working directory with its own files/branch, sharing the same repo history — so each session literally can't touch another session's files.
- How to start one: pass `--worktree <name>` (or `-w <name>`) when launching a session — e.g. `claude --worktree feature-auth` creates an isolated folder (default `.claude/worktrees/feature-auth/`) on a new branch (`worktree-feature-auth`) and starts Claude there. Run the same command with a different name in another terminal to get a second, fully independent parallel session.
- Desktop app does this automatically for every new session — nothing to enable manually there.
- Cleanup: an unchanged worktree is removed automatically when the session exits; if it has uncommitted work, Claude asks whether to keep or remove it.
- `.worktreeinclude` (repo root): lists gitignored files to copy into every new worktree — e.g. your `.env` or local secrets/config — since a fresh worktree won't have those (or installed dependencies) by default.

---

## A CLAUDE.md That Follows

- CLAUDE.md = guidance, not enforced — the longer it gets, the less reliably Claude follows any single line. Keep it lean.
- Hard rules ("never push to main") → pre-tool-use hooks, not CLAUDE.md — a hook actually blocks the action; CLAUDE.md only asks nicely.
- 4 locations, all loaded together: Managed policy (org, can't exclude) / User (personal, all projects) / Project (shared, in repo) / Local (gitignored, personal to this repo only)
- Imports (`@path/to/file.md`) organize the file, but **don't reduce context** — they expand inline at launch, so full content still loads.
- Rules stick when specific + checkable, and name the replacement instead of just banning something.
- Emphasis (IMPORTANT/YOU MUST) is a budget — spend it on 2–3 rules max, or it stops meaning anything.
- Treat it as living: when Claude does the wrong thing, tell it "add that to CLAUDE.md" instead of just fixing by hand.

---

## Verification Skills

- Why build this one first: checking normally depends on you remembering to ask (run tests, read diff) — a verification skill fires automatically instead, runs the tests, reads the diff, checks no test was weakened just to pass, and reports pass/fail with evidence
- Key insight: "done" = gates actually run + results stated explicitly, not just "the diff looks right" — green tests alone aren't proof
- Rule of thumb: typed the same multi-step instruction twice? That's a skill — release checklist, migration recipe, pre-PR check, etc.

**A skill folder is more than `skill.md`:**
- `reference.md` — detailed material, linked from `skill.md`, only loaded when actually needed → keeps `skill.md` short
- Scripts (e.g. `check.sh`) — Claude *executes* these rather than loading their contents into context, so a skill can carry its own tooling
- Keep `skill.md` itself lean; push heavy explanations/tools into side files

**Which surface owns which rule:**
- Always-true conventions (naming, file locations) → CLAUDE.md
- Procedures/reference tied to a specific task type → skill
- A rule that must never be skippable → hook (CLAUDE.md and skills are both instructions Claude *follows*; a hook is code that actually runs and enforces)

**Recap:** only a skill's description loads into context until it's actually needed, so there's no cost to packaging every repeated procedure. Check a verification skill into `.claude/skills` and the whole team inherits the same automatic check.

---

## Permission Modes

**What they are:** decide once what Claude can run without asking — pick the trust level for the job instead of approving every action one at a time.

**Cycling (`Shift+Tab`):** cycles through the everyday modes — manual, accept edits, plan, auto. Status bar at the bottom always shows the current mode.

**The six modes:**
- Manual — reads only without prompting; everything else asks first
- Accept edits — reads, file edits, common fs bash commands run without asking (you review after the fact)
- Plan — reads only, researches + proposes changes, edits nothing
- Auto — accepts everything, but a separate classifier model reviews each action before it runs
- Don't ask — only pre-approved tools run; everything else auto-denied, no prompt
- Bypass permissions — skips all checks (`--dangerously-skip-permissions`) — only inside an isolated container/VM

**Auto mode in depth:**
- Classifier guards *intent*, not correctness — blocks things like prod deploys/migrations, force pushes, piping downloaded code into a shell, sending sensitive data externally, destroying session files
- Waves through: local edits, installing deps from your lockfile, read-only requests, pushing to your own branch
- What it *can't* catch: whether the code actually works — a broken-but-harmless change sails through, since broken isn't dangerous

**Pairing auto mode with a stop hook — clarified (this is on you to set up, it's not automatic):**
- A "stop hook" is a hook *you* configure, for the `Stop` lifecycle event (in `.claude/settings.json`, or via `/hooks`) — auto mode doesn't create or run it for you
- It fires every time Claude finishes responding, and typically runs your test suite / linter / type-checker
- If it returns a "block" decision, Claude is forced to keep working instead of stopping — that's how an "auto-continue until tests pass" pattern works
- Division of labor: auto mode's classifier checks intent *before* each action; your stop hook checks correctness *after* Claude finishes. You need to build both — auto mode alone only covers the first half.

**Don't ask, for unattended runs:** the move for CI pipelines, scheduled jobs, overnight batches — no human around to approve, so only pre-approved tools run and everything else is silently denied, keeping the pipeline moving.

---

## Hooks

**The pitch:** CLAUDE.md is a request Claude *usually* follows; a hook is deterministic code that runs at a fixed point in the loop, so it *can't* be skipped — "usually" becomes "always."

**Hook events worth knowing** (~30 exist total, these cover the everyday cases):
- `PreToolUse` — fires before a tool call; the enforcement primitive, can stop something before it happens
- `PostToolUse` — fires after a successful tool call; usually where auto-format/auto-lint goes
- `Stop` (+ `SubagentStop`) — fires when Claude wants to end its turn; can refuse ("not done yet") if a condition isn't met
- `PreCompact`/`PostCompact` — fire before/after compaction
- `InstructionsLoaded` — fires when a CLAUDE.md/rule file loads; useful for auditing what actually made it into context
- `SessionStart` — fires at session start, primes the environment

**`SessionStart` matchers — clarified, since "fresh vs. compact vs. startup" wasn't clear from the text:**
`SessionStart` fires whenever a session begins, for *any* reason — the `matcher` is what lets you scope a hook to only the specific reason you care about:
- `startup` — a genuinely fresh `claude` launch from the terminal
- `resume` — resumed via `--resume`, `--continue`, or `/resume`
- `clear` — triggered by `/clear`
- `compact` — fires right after a compaction (manual or automatic)
- Practical use: a "re-inject context after compaction" hook uses matcher `"compact"` (not `PostCompact` — that event's output doesn't get fed back into the conversation; `SessionStart` with the `compact` matcher does). A "load fresh dev context" hook uses matcher `"startup"` so it doesn't also re-fire on every resume.
- Example — two independent handlers under the same event:
```json
{
  "hooks": {
    "SessionStart": [
      { "matcher": "compact", "hooks": [{"type": "command", "command": ".claude/hooks/reinject-summary.sh"}] },
      { "matcher": "startup",  "hooks": [{"type": "command", "command": ".claude/hooks/load-dev-context.sh"}] }
    ]
  }
}
```

**`PreToolUse` → `permissionDecision`:** `allow` / `deny` / `ask` (a rare 4th, `defer`, only for non-interactive `-p` runs).

**`updatedInput` — clarified:**
Instead of only allow/deny, a `PreToolUse` hook can *rewrite* the call before it runs. Concretely: Claude tries to run a Bash command; your hook returns `permissionDecision: "allow"` plus an `updatedInput.command` that's an edited version of that command — Claude Code executes the edited one instead of the original.
- ⚠️ The catch: `updatedInput` replaces the *whole* input object, not just the field you touched. If the original tool input had both `command` and `description`, and your `updatedInput` only includes `command`, `description` gets silently dropped — always echo back every field you're not changing.

**A real guardrail: redact instead of block — worked example:**
The obvious move is `deny` — stop the call outright. The more useful move is to let the call through but sanitize it first:
1. Claude is asked to run a Bash command that happens to contain something that looks like a live secret (e.g. matches an `sk_live_...` pattern).
2. A `PreToolUse` hook, matcher `Bash` (optionally narrowed with `if`), inspects the command text.
3. It finds the pattern and returns `permissionDecision: "allow"` + `updatedInput.command` with the secret swapped for a placeholder (echoing back any other input fields unchanged).
4. Claude Code runs the *edited* command — the task still completes, but the raw secret is never actually executed or exposed.
- The distinction that matters: `deny` stops the work entirely; `updatedInput` lets the work continue while surgically removing just the dangerous part.

**Exit codes (for hooks that skip JSON):**
- `0` = success — stdout parsed as JSON if present; on `SessionStart`/`UserPromptSubmit`/`UserPromptExpansion`, plain text stdout gets added to context directly (what a state-preserving hook relies on)
- `2` = blocking error — stderr fed back to Claude as context; the blocking code almost everywhere, and can even block `Stop`
- `1` = **not** blocking, despite feeling like one — Claude runs the command anyway. Common mistake: meaning to block and using exit 1 instead of 2.
- `PostToolUse` fires after the tool already ran, so it's too late to block that call — it can still feed text back to Claude, though.
- `Notification` and `SessionStart` ignore blocking entirely, regardless of exit code.

**Preserving state across a compact:** a `SessionStart` hook with matcher `"compact"` runs right after compaction — have it print a short summary of files you were working on; that text lands back in context so Claude picks up where it left off instead of starting cold.

---

## Routines and Headless

**The spectrum:** routines (build nothing, runs on Anthropic's infra) on one end, headless mode / Agent SDK (runs from your own code) on the other.

**Routines — a saved prompt that runs in the cloud:**
- Bundles: a prompt + the repo it works on + any connectors it needs — runs in the cloud on trigger
- No machine of yours stays on, no workflow file to maintain — Anthropic hosts it
- Triggers: cron schedule, HTTP POST to its API endpoint, or a GitHub event (e.g. new PR)
- Good fits: same prompt on a recurring trigger — morning dependency audit, PR triager, daily Sentry scan
- Create it two ways: web at claude.ai/code/routines (name, instructions, repo, trigger), or in-terminal with `/schedule` + plain language, e.g. `/schedule daily dependency audit at 9am`

**Three limits to know before relying on routines:**
- Still a research preview — behavior/limits will keep changing
- Recurring schedule runs at most hourly — not for anything more frequent
- Each run starts from a fresh clone of your default branch and can only push to `claude/`-prefixed branches unless you loosen that per repo — the guardrail against an autonomous run rewriting main

**Headless mode (`-p` / `--print`):**
- Runs Claude Code as a one-shot command, no interactive UI — reads stdin, writes stdout, pipes like any shell tool: `claude -p "summarize the changes in this diff"`
- Skips auto-discovery of hooks, skills, plugins, MCP servers, and CLAUDE.md — you get Claude + only the tools you explicitly allow. Trade-off: much faster startup.

**Structured output:** pair a JSON schema with `--output-format json`, and Claude constrains its output to match it — the result lands in `structured_output`, pull it with `jq` and pipe into a DB/script:
```bash
claude -p "Extract the exported function names from src/core/style.js" \
  --output-format json \
  --json-schema '{"type":"object","properties":{"functions":{"type":"array","items":{"type":"string"}}},"required":["functions"]}' \
  | jq '.structured_output.functions'
```

**Multi-step automation:** capture the session ID from the JSON output, resume it later with full context — `claude --resume "$(jq -r .session_id /tmp/plan.json)"`. Useful when one pass produces a plan and a second pass carries it out.

**`--bare`:** deterministic mode for CI — repeatable, predictable output run to run, instead of the usual variation.

**Agent SDK:** embeds Claude Code inside your own TypeScript/Python app — same engine as the CLI, a `query` function taking a prompt + options (`allowedTools`, system prompt, permission mode), and you iterate over the streamed messages yourself.

**Which to reach for:**
- Routines — default for repeat work, nothing to host
- Headless (`-p`) — job needs your pipeline, want to pipe data through a script
- `--bare` — CI needs identical results every run
- Agent SDK — the work belongs inside your own product
- Start with routines, drop down the spectrum only when the job actually needs the extra control

---

## GitHub Actions and Code Review

**What "the PR is the best place to hand off repetitive work" actually means — clarified, since this reads oddly at first:**
It's not saying you need to open a PR to get Claude to do something. It's the other way round: a PR is *already* a checkpoint you hit every time you have code to merge — so it's a natural, zero-extra-effort anchor point to attach automation to. Two concrete shapes:
- **Automatic review** (Managed Code Review or the GitHub Action): you keep opening PRs exactly as you already do for real code changes — no new step on your side. Because the automation is wired to the "PR opened" / "push" event, review just happens on top of your existing workflow.
- **Comment as a delegation interface**: tag `@claude` in a comment on a PR or issue you *already have open* (e.g. "@claude implement the spec in the linked issue"), and the action picks it up, pushes commits, and reports back — using a surface you're already looking at instead of a separate tool.
So nothing about your workflow changes — you're not manufacturing PRs just to trigger something. Claude is plugged into checkpoints (PR events, comments) that were already part of your normal process.

**Managed Code Review — the "turn it on" path:**
- Anthropic-hosted; reviews PRs through the Claude GitHub app — nothing for you to build or host
- An org admin enables it in Claude Code admin settings, installs the app, picks repos and a trigger (PR open, every push, or on "@claude review" comments)
- Posts inline comments on specific lines, tagged by severity, plus a summary table in the check run — deduplicated and ranked, so you get a handful of real issues, not a wall of nits
- Never approves or blocks the PR itself — judgment stays with a human
- Research preview, currently Team/Enterprise only
- No auto-fix from the managed service — it only posts findings; apply them locally with `/code-review --fix`

**The GitHub Action — for anything beyond review:**
- Use when you want Claude to *implement* something from a comment, run scheduled reports, or anything you'd otherwise write a custom workflow for
- `/install-github-app` (needs repo admin) walks through installing the app + setting the API key secret
- Action: `anthropics/claude-code-action@v1`
- Key inputs: `anthropic_api_key`, `github_token` (defaults to `secrets.GITHUB_TOKEN`), `trigger_phrase` (defaults to `@claude`), Bedrock/Vertex provider switches, `prompt`, `claude_args` (raw CLI args passed through)
- Example — comment-triggered implementation: someone writes "@claude implement the spec in the linked issue" on a PR/issue → the action picks it up, pushes commits, posts comments
- Example — scheduled rollup: a cron trigger (e.g. 9am UTC) fires the action, Claude posts results; `workflow_dispatch` also lets you trigger it manually from the Actions tab
- Tune via `claude_args`: cap the agent loop with max turns, use permission mode "don't ask" for unattended runs, scope allowed tools to the job (e.g. read-only for a report)

**Bottom line:** take the managed path for PR review (nothing to build); reach for the action when the job is more than review — implementing something, or running on a schedule.

---

## Trust It: Verifying Unsupervised Runs

**Core rule:** the less supervised the run, the more you need to check it. If you watched it happen, a quick look is enough. If nobody watched it — like a CI run — check it properly.

**Ground rules for unattended runs:**
- Use auto mode, not bypass mode — the classifier still checks each action for danger
- The classifier only checks for danger, not correctness — so you still need to check the actual work yourself, even when unattended

**Start from the diff, not the summary:**
- Run `/code-review` first, then read `git diff` yourself
- Don't just trust the summary — it can look fine even when the diff touched files you didn't expect
- Check what actually changed, especially the files that were in the plan

**Make tests the real gate:**
- Two questions matter: did the tests pass, and did Claude actually run them — not just claim to?
- Set this up as a hook: a `Stop` hook that runs the tests and won't let Claude finish if they fail, or a `PostToolUse` hook that lints/type-checks after every edit
- If the hook exits with code 2, Claude sees the failure and fixes it on its own
- This check runs every time — you don't have to remember to ask for it

**Cold second opinion:**
- Open a new session or subagent to review the code, one with no memory of how it was built
- Because it wasn't involved, it can catch problems the original session missed

**Headless runs:** check the JSON result and exit code instead — there's no transcript to read.

**Bottom line:** the less you watched, the more you check — read the diff first, use a hook to enforce tests, and get a fresh review for anything important.

---

## Plugins

**What a plugin is:** one installable package that can include skills, subagents, hooks, and MCP server configs — plus LSP servers, background monitors, themes, and a small part of `settings.json`.
- Install directly: `/plugin install org-name@plugin-name`, then `/reload-plugins`
- For a team, add a private marketplace once: `/plugin marketplace add your-org/claude-plugins` — after that, every install goes through it (one place to discover, track versions, and update). Browse it under the Discover tab.

**Read before you install — this matters:**
- A plugin runs code on your machine, with your permissions. Its hooks fire on every matching tool call.
- If you install it just for the skills, you also get its `PreToolUse` and `Stop` hooks — whether you read them or not.
- Example risk: a community plugin could include a `Stop` hook that calls some network address every time, with no warning shown to you.
- The community marketplace has an automated review before a submission goes live; the official marketplace is curated separately.
- Reviewed is not the same as trusted — automated review catches some problems, not all of them.
- Before installing, check what it adds — Claude Code shows what it will install and roughly how much context it will use.

**How it runs alongside your own setup:**
- Hooks stack: a plugin's `PreToolUse` hook and your own both fire on every tool call — neither one replaces the other.
- Skills, agents, and commands are namespaced under the plugin's name, so they never clash with yours.
- A plugin's `settings.json` is only honored for two things: the `agent` key and the subagent status line.
- The `agent` key can promote one of the plugin's subagents to run as the main thread (its system prompt, tool limits, and model) — so simply enabling a plugin can change how Claude Code behaves by default.

**Packaging your own plugin:**
- Same `.claude` layout you already use: one folder per skill, one markdown file per subagent under `agents/`, `hooks/hooks.json` and `.mcp.json` at the plugin root. Claude Code finds these just by folder convention.
- Optional manifest file: `.claude-plugin/plugin.json`, with `name`, `version`, `description`, `author`.
- `name` is the only required field — it's what namespaces your skills as `plugin-name:skill-name`.
- Version it like you would any other dependency.

**Bottom line:** read every hook, agent, and MCP server a plugin adds before installing it. Once your own `.claude` setup works well, package it — one manifest, one install command, and the whole team gets the same setup.

---
