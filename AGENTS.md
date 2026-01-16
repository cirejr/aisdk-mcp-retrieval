# AGENTS – Canonical AI Instructions


You are an AI coding agent working inside a Git repository.

## 🛠️ Global Skills
The following skills are available to ALL agents (Cursor, Gemini, Copilot, Claude). Use them to enhance your capabilities in specific domains.

- **TypeScript Expert**: `view_file .claude/skills/typescript-expert/SKILL.md`
  - *Trigger*: When writing/refactoring TS/TSX, designing types, or fixing type errors.
- **Zod Expert**: `view_file .claude/skills/zod-expert/SKILL.md`
  - *Trigger*: When creating validation schemas, form definitions, or API contracts.
- **UI Styling**: `view_file .claude/skills/ui-styling/SKILL.md`
  - *Trigger*: When working on CSS, Tailwind, or Shadcn UI components.
- **Skill Creator**: `view_file .claude/skills/skill-creator/SKILL.md`
  - *Trigger*: When the user asks you to create a new skill or document a workflow.
- **AI SDK MCP Expert**: `view_file .claude/skills/ai-sdk-mcp-expert/SKILL.md`
  - *Trigger*: When configuring MCP clients, transports, or using MCP tools/resources.
- **AI SDK Tool Calling**: `view_file .claude/skills/ai-sdk-tool-calling/SKILL.md`
  - *Trigger*: When defining tools with `zod` schemas or implementing multi-step agent loops.
- **AI SDK Next.js App Router**: `view_file .claude/skills/ai-sdk-nextjs-app-router/SKILL.md`
  - *Trigger*: When building chat UIs with Next.js App Router, using `useChat` or `streamText`.


## 🎯 Objective
Build a full‑stack Next.js demo app that:
- Uses Next.js App Router
- Uses AI SDK with Ollama
- Uses Vercel AI Elements
- Connects to Neon DB through MCP
- Allows natural‑language queries over database data


## 📚 Mandatory Files to Read First
1. docs/prd.md
2. tasks/kanban.md
3. docs/architecture.md


## 🧭 Workflow Rules (STRICT)
0. **Kanban Check (CRITICAL)**:
   - **Before starting ANY work** (even if requested by user), check `tasks/kanban.md`.
   - If the request is NOT in BACKLOG:
     1. Create a new task entry in `tasks/kanban.md` (Backlog).
     2. Ask user for confirmation if needed.
     3. Proceed to Step 1.
1. Pick ONE task from tasks/kanban.md in BACKLOG
2. If task is large → break into subtasks inside the task
3. Move task to IN PROGRESS
4. **Ralph Wiggum Loop (Iterative Verification)**:
   - **Implement** code.
   - **Define** a verification command (e.g., `bun test`, `bun build`, or custom script) that proves the feature works.
   - **Run** the verification command.
   - **IF FAIL**: You are NOT DONE. Fix code. Retry verification. (**REPEAT UNTIL PASS**)
   - **IF PASS**: Proceed to next step.
5. Final Self-Review: Ensure code matches `docs/prd.md` requirements and `docs/testing.md`.
6. Move task to DONE
7. Create a git commit with message: `TASK‑XXX: <summary>`
8. If absolutely stuck (after multiple retries):
   - Leave task IN PROGRESS
   - Add notes explaining blockers


## 🧪 Quality Gates
- App must build without errors
- Types must pass
- Lint must pass
- Features must match acceptance criteria


## 🧠 Behavior Rules
- Never work on multiple tasks at once
- Never modify AGENTS.md unless instructed
- Always explain decisions in commit messages


## 🧱 Tech Constraints
- Use TypeScript
- Prefer server actions where possible
- Keep components minimal and composable


## 🚫 Forbidden
- No mock implementations for core logic
- No skipping MCP usage for DB access