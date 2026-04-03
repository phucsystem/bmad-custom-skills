# BMAD Custom Skills — Codebase Summary

## Overview

A lightweight configuration repository containing reusable Claude Code skill definitions. No runtime code, packages, or build system — pure skill definitions and documentation.

## Repository Structure

```
bmad-custom-skills/
├── README.md                          # Usage guide and skill overview
├── .git/                              # Version control
├── .claude/
│   └── skills/
│       ├── bmad-dev-test-loop/
│       │   └── SKILL.md               # Automated dev-test feedback loop
│       └── bmad-ui-verify/
│           └── SKILL.md               # Visual QA — mockup vs implementation
├── docs/
│   ├── project-overview-pdr.md        # Vision, scope, requirements
│   ├── code-standards.md              # Standards for writing skills
│   └── codebase-summary.md            # This file
└── plans/                             # Work plans and reports (optional)
```

## Current Skills

### bmad-dev-test-loop
**Path:** `.claude/skills/bmad-dev-test-loop/SKILL.md` (235 lines)

**Purpose:** Automates iterative feature development with structured feedback loops.

**Agents:**
- **Amelia** (fullstack-developer) — builds features per spec, writes tests
- **Quinn** (tester) — validates tests, checks coverage, provides feedback

**Execution Flow:**
1. Parse arguments (story file or intent, max iterations)
2. Detect project context (git root, test/typecheck commands, package manager)
3. Loop (while iterations < max and status == "running"):
   - **Step A:** Amelia implements changes and writes tests
   - **Step B:** Quinn validates via test run, typecheck, coverage review
   - **Step C:** Evaluate verdict — pass/fail/blocked, provide feedback if needed

**Activation:** `/bmad-dev-test-loop <story-file-or-intent> [--max N] [--mockup <source>]`

**Key Features:**
- Story file mode (reads .md spec) or intent mode (freeform description)
- Automatic project context detection (package manager, test command)
- Structured feedback format prevents rework of passing code
- Configurable iteration limit (default: 3)
- BMAD agent principles embedded in prompts
- UI mode via `--mockup` flag — invokes `bmad-ui-verify` during Quinn's validation

### bmad-ui-verify
**Path:** `.claude/skills/bmad-ui-verify/SKILL.md` (227 lines)

**Purpose:** Visual QA — compares running UI against design mockup using AI vision + DOM inspection.

**Execution Flow:**
1. Extract design spec from mockup (Figma URL, image, or PDF → reference image + design brief)
2. Capture implementation (screenshot via Chrome MCP or headless browser + DOM computed styles)
3. Compare & report (AI vision comparison + DOM cross-validation → structured verdict)

**Activation:** `/bmad-ui-verify <mockup> --url <live-url> | --cmd <dev-server-cmd>`

**Key Features:**
- Supports Figma URLs, PNG/JPG images, and PDF mockups
- Two-layer comparison: AI vision (broad) + DOM inspection (precise)
- Desktop (1440×900) and mobile (390×844) viewport support
- Confidence levels: high (both layers agree) vs medium (vision only)
- Output format compatible with DTL feedback structure

## Directory Summary

| Directory | Purpose | Ownership |
|-----------|---------|-----------|
| `.claude/skills/` | Skill definitions | Community |
| `.claude/skills/bmad-dev-test-loop/` | Dev-test loop skill | MedAdvisor |
| `.claude/skills/bmad-ui-verify/` | Visual QA skill | MedAdvisor |
| `docs/` | Documentation | Technical Writer |
| `plans/` | Work plans and reports | Project Lead |

## File Inventory

| File | Lines | Purpose |
|------|-------|---------|
| README.md | 75 | Quick start, skill list, contributing guide |
| project-overview-pdr.md | 95 | Vision, scope, success metrics, risks |
| code-standards.md | 280 | Standards for writing and maintaining skills |
| codebase-summary.md | This file | Repository structure and content overview |
| bmad-dev-test-loop/SKILL.md | 260 | Dev-test loop orchestration logic (with UI mode) |
| bmad-ui-verify/SKILL.md | 227 | Visual QA — mockup vs implementation |

**Total:** ~900 lines of configuration and documentation, 0 lines of runtime code.

## Key Concepts

### SKILL.md Format

Each skill is a single markdown file with:
- **Frontmatter** (YAML) — name, description, argument-hint
- **Content** — Instructions, templates, rules

Example frontmatter:
```yaml
---
name: bmad-dev-test-loop
description: 'BMAD Dev->Test feedback loop. Use when user says "dev test loop"'
argument-hint: '<story-file-or-intent> [--max N]'
---
```

### Agent Orchestration

Skills define agent spawning behavior:
- **Subagent type:** `fullstack-developer`, `tester`, `code-reviewer`, etc.
- **Prompt templates:** Embedded in SKILL.md for consistency
- **Status parsing:** Skills define how to interpret agent output (PASS/FAIL, DONE/BLOCKED)
- **Feedback loops:** Structured feedback format prevents redundant work

### Project Independence

Each skill:
- References `CLAUDE.md` in the target project (not hardcoded conventions)
- Auto-detects project context (test commands, package manager, build system)
- Works across different codebases with zero configuration

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single skill per `.md` file | Simplicity, discoverability, version control |
| No external dependencies | Easy adoption (copy/symlink, no npm/pip setup) |
| Config, not code | Maximum portability across projects and teams |
| Centralized repo | Discovery, reuse, consistent standards |

## Development Status

- **Created:** 2026-04-03
- **Status:** Active (2 production skills)
- **Next:** Validation with 2+ projects by Q2 2026, expand library

## How to Extend

### Add a New Skill

1. Create directory:
   ```bash
   mkdir -p .claude/skills/{skill-name}
   ```

2. Create `SKILL.md` with frontmatter and instructions (reference `code-standards.md`)

3. Update README.md to mention the new skill

4. Commit:
   ```bash
   git add .claude/skills/{skill-name}/SKILL.md README.md
   git commit -m "feat: add {skill-name} skill"
   ```

### Use a Skill in Another Project

```bash
# Copy
cp -r .claude/skills/bmad-dev-test-loop /path/to/project/.claude/skills/

# Or symlink
ln -s /path/to/bmad-custom-skills/.claude/skills/bmad-dev-test-loop \
      /path/to/project/.claude/skills/bmad-dev-test-loop
```

Then invoke: `/bmad-dev-test-loop <args>`

---

**Last Updated:** 2026-04-03  
**Status:** Active  
**Audience:** Developers, DevOps, Technical Writers
