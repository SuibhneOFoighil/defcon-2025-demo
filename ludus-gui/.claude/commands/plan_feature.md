# /plan_feature Command

The `/plan_feature` command creates a **Feature Implementation Plan (FIP)**—a detailed, step-by-step guide an agent can follow to build a specific feature.  
Each plan is saved in `__agents__/features/` as a Markdown file so it can be version-controlled and referenced in future work.

---

## 0. Initial Setup
When the command is invoked, immediately reply:
```
I'm ready to plan your feature. Please provide:
1. A short title
2. A one-sentence outcome (what success looks like)
3. (Optional) Deadline or hard constraints
```
Then wait for the user’s reply.

---

## 1. Clarify Intent
After receiving the user’s inputs:
1. Restate the goal in the user’s own words for confirmation.
2. Ask ONLY for missing critical details (e.g., hard deadline, compliance constraints, success metric). Keep follow-ups minimal.
3. Record in memory:
   - `feature_title`
   - `goal_statement`
   - `constraints` (deadline, tech stack, compliance)
   - `success_metric` (if provided)

---

## 2. Draft the Todo Plan (pre-work)
Use `todo_write` to break the feature into atomic, actionable tasks **before** writing the plan file.

Typical todos (modify as needed):
- Confirm design assets / UI mocks exist
- Review existing code for extension points
- Technical feasibility spike (if needed)
- Draft Feature Implementation Plan skeleton
- Conduct security / compliance review (if required)
- Peer review & iteration

Rules:
* Each task has a unique ID.
* Declare dependencies so work can be parallelised safely.
* Only ONE task should be `in_progress` at a time.

---

## 3. Spawn Parallel Sub-agents (optional)
If deeper **technical or compliance** research is required, create Task agents that only use READ-ONLY tools (`read_file`, `grep_search`, etc.).
Each sub-agent must return:
* File paths + line numbers
* Concise findings relevant to the feature

Examples:
* *“Find all components that render the user avatar”*
* *“List API routes touching the `/users` table”*

---

## 4. Wait & Synthesise
Wait until **all** todos and sub-agents complete. Consolidate their results so the main agent has full context.

---

## 5. Generate the Plan File
### 5.1 Gather Metadata (shell commands shown)
```
DATE=$(date '+%Y-%m-%d %H:%M:%S %Z')
COMMIT=$(git log -1 --format=%H)
BRANCH=$(git branch --show-current)
REPO=$(basename $(git rev-parse --show-toplevel))
```
Ask the user for their preferred author name once per session.

### 5.2 File Naming
`__agents__/features/<YYYY-MM-DD_HH-MM-SS>_<kebab-case-title>.md`

### 5.3 YAML Front-matter
```yaml
---
date: "<DATE>"
author: "<author>"
git_commit: "<COMMIT>"
branch: "<BRANCH>"
repository: "<REPO>"
title: "<feature_title>"
status: draft
last_updated: "<YYYY-MM-DD>"
last_updated_by: "<author>"
tags: [feature_plan]
---
```

---

## 6. Document Structure (after front-matter)
1. **Overview & Intent** – Brief paragraph describing the feature and why it matters.
2. **Assumptions & Context** – Key background, links to research docs in `__agents__/research/`, existing code refs (file:line).
3. **Technical Approach** – High-level explanation of how the feature will be built (architecture, libraries, patterns).
4. **Prerequisites** – Bullet list of items that must exist or be completed before work starts (APIs, design tokens, infra).
5. **Step-by-Step Task Plan** – Numbered list mirroring the `todo_write` tasks. For each task include:
   * Task ID
   * Description
   * Owner (default: agent)
   * Dependencies
6. **Deliverables & Acceptance Criteria** – Explicit outputs + measurable tests (use Gherkin `Given/When/Then` where helpful).
7. **Timeline / Milestones** *(optional)* – If a deadline exists, map tasks to dates.
8. **Dependencies** – External teams, services, or decisions that could block progress.
9. **Risks & Mitigations** – Table listing risk, likelihood, impact, mitigation.
10. **Open Questions** – Task-list style `[ ] Question` entries to track outstanding items.
11. **Changelog** – Append every significant edit: `YYYY-MM-DD – author – summary`.

---

## 7. Save & Present
1. Write the file.
2. Reply with a concise summary:
   * Confirm file path
   * Highlight next immediate action (often the first todo)

---

## 8. Follow-up Runs
When `/plan_feature` is run again for the **same file**:
1. Load the existing plan (read_file).
2. Append new section `## Update <timestamp>` describing changes.
3. Update front-matter: `last_updated`, `last_updated_by`, optionally change `status` (e.g., `in_progress`, `complete`).

---

### Important Guidelines
* **Granularity** – Keep tasks small enough to complete in <1 day of work.
* **Parallelism** – Use parallel sub-agents whenever their outputs are independent.
* **Path Discipline** – All generated paths must reside in `__agents__/features/`.
* **Consistency** – Use `snake_case` for multi-word front-matter keys.
* **Evidence** – Include concrete file:line references whenever citing existing code.
* **No Market Research** – This command focuses on *technical implementation*, not product/market discovery.

---

## Example Interaction
```
/user> /plan_feature "Profile Picture Upload" — users can upload & crop an avatar image; deadline next sprint.
/assistant> I'm ready to plan your feature. Please provide:
 1. Short title ✅
 2. Outcome ✅
 3. Deadline ✅ (next sprint)
(assistant asks no further questions)

# After processing…
✓ File created: __agents__/features/2025-07-05_15-00-00_profile-picture-upload.md
✓ First task in progress: FEAT-1 – Confirm design assets
```

---

*End of command specification* 