# Code Standards for BMAD Custom Skills

This document defines standards for writing, documenting, and maintaining skills in the BMAD Custom Skills repository.

## File Organization

### Directory Structure

```
.claude/skills/
├── {skill-name}/
│   └── SKILL.md          # Single file per skill
```

**Naming Rule:** Use kebab-case for skill directories.
- ✅ Good: `bmad-dev-test-loop`, `code-review-workflow`
- ❌ Bad: `BMadDevTestLoop`, `bmad_dev_test_loop`, `bmad-dev-test-loop-v2`

### Single-File Requirement

Each skill must consist of exactly one `SKILL.md` file. If a skill definition exceeds 400 lines, split it into separate skills rather than creating additional files.

## SKILL.md Frontmatter

Every SKILL.md must begin with YAML frontmatter (three hyphens on top and bottom):

```markdown
---
name: {skill-name}
description: 'Brief description. Use when user says "{trigger-phrase}"'
argument-hint: '<arg-description> [--flag value]'
---
```

### Required Fields

| Field | Purpose | Example |
|-------|---------|---------|
| `name` | Unique identifier (must match directory name) | `bmad-dev-test-loop` |
| `description` | One sentence explaining skill purpose + activation trigger(s) | `Automated Dev→Test loop. Use when user says "dev test loop" or "dtl"` |
| `argument-hint` | Describes expected arguments and flags | `<story-file-or-intent> [--max N]` |

**Guidelines:**
- `description` must include at least one trigger phrase users will say to activate the skill
- `argument-hint` uses angle brackets for positional args and brackets for optional flags
- Keep descriptions under 140 characters

## SKILL.md Content Structure

### Recommended Sections

Use these headings to organize skill logic:

1. **Title** — H1, matches skill name
2. **Overview** — 1-2 paragraphs describing what the skill does
3. **Arguments** — Numbered or bulleted list of parameters
4. **Initialization** — Setup steps (parse args, detect project context, load config)
5. **Execution** — Main loop or workflow (numbered steps, subsections as needed)
6. **Completion** — Success/failure/blocked outcomes with output format examples
7. **Rules** — Non-negotiable constraints and best practices

### Content Guidelines

**Language:**
- Use imperative, direct language: "Parse arguments", "Spawn agent", "Evaluate verdict"
- Avoid narrative prose; prefer lists and numbered steps
- Use code blocks for templates, commands, and example output

**Formatting:**
- Use markdown code blocks with language hints:
  ```
  ```yaml
  config: value
  ```
  ```
- Use nested lists for hierarchical logic (initialization → detection → loading)
- Bold key terms on first mention: **agent**, **feedback**, **iteration**

**Examples:**
- Include template prompts for spawned agents
- Show expected output formats with placeholders: `{iteration}`, `{status}`
- Demonstrate argument parsing with real examples

## Max File Size

**Limit:** 400 lines per SKILL.md file

If a skill exceeds 400 lines:
1. Identify logical sub-workflows or phases
2. Create separate skills for each sub-workflow (e.g., `bmad-dev-loop`, `bmad-test-loop`, `bmad-review-loop`)
3. Document how sub-skills integrate via cross-references in README

**Line Count Check:**
```bash
wc -l .claude/skills/{skill-name}/SKILL.md
```

## Argument Design

### Naming Conventions

- Positional arguments: lowercase, `<arg-name>` with hyphens
  - Example: `<story-file-or-intent>`
- Flag names: lowercase, double-dash prefix
  - Example: `--max N`, `--skip-typecheck`
- Environment fallback: `${ENV_VAR_NAME}` if arg omitted
  - Example: `${PROJECT_ROOT:-$(pwd)}`

### Parsing Guidelines

1. Accept both file paths and freeform text (auto-detect based on `.md` extension or content patterns)
2. Document defaults explicitly: "default: 3"
3. Support both explicit flags (`--max 5`) and environment variables (`MAX_ITERATIONS=5`)
4. Always provide help text in argument descriptions: "max iterations before aborting"

## Agent Orchestration

### Naming Conventions

- Agent type: `subagent_type: "fullstack-developer"`, `"tester"`, `"code-reviewer"`
- Roles: Title case, descriptive names (Amelia, Quinn, Pat, Sam)
- Prompt sections: Capitalized, descriptive headers ("## Identity & Principles", "## Task", "## Project Standards")

### Prompt Templates

When spawning agents, include:
1. **Identity section** — agent role, BMAD principles, communication style
2. **Task section** — clear goal and acceptance criteria
3. **Context section** — relevant standards, conventions, feedback from previous iterations
4. **Instructions section** — ordered steps and output requirements
5. **Work context** — project root path, reports path, plans path

**Template Example:**
```markdown
You are {Name} — BMAD {Role}.

## Identity & Principles
- Principle 1
- Principle 2

## Task
{Task description}

## Project Standards
{Standards from CLAUDE.md or project files}

## Instructions
1. Step 1
2. Step 2

## Required Output Format
STATUS: ...

Work context: {project_root}
```

## Output Format Conventions

### Agent Output Structure

Define expected output with clear separators:

```
STATUS: DONE | BLOCKED | FAILED

### Section Name
Content

### Another Section
Content

Summary
[Brief summary]
```

**Standards:**
- Use `STATUS:` line as first machine-readable output
- Use `###` (H3) for section headers
- Provide fixed sections (e.g., "Files Changed", "Tests Written") followed by bulleted lists
- End with brief summary (1-2 sentences)

### Verdict Parsing

Clearly document how to parse agent responses:

```
- Parse response for "VERDICT: PASS" or "VERDICT: FAIL"
- If PASS: set status = "passed", break loop
- If FAIL: format feedback, increment iteration
```

## Documentation Requirements

### README Coverage

Each skill should be mentioned in the repo's main README with:
- Brief description (one line)
- Activation trigger(s) (how to invoke)
- Key features (2-3 bullets)

### Cross-References

Document integration points:
- Link to related skills in "See Also" sections
- Reference CLAUDE.md sections if skill depends on project conventions
- Link to any external BMAD documentation

## Testing Skills

Before committing a new skill:

1. **Syntax Check:** Ensure YAML frontmatter is valid (use `yamllint` or manual inspection)
2. **Format Check:** Verify SKILL.md renders correctly in markdown viewer
3. **Activation Test:** Copy skill to a test project and invoke it once
4. **Documentation Test:** Verify all referenced files/commands exist
5. **Argument Test:** Test skill with various argument patterns (with/without flags, env vars, etc.)

## Version Control

### Commit Messages

Use conventional commit format:

```
feat: add bmad-dev-test-loop skill
docs: update skill code standards
fix: correct argument parsing in bmad-code-review skill
```

### No Breaking Changes

Skills are immutable once published. If a skill requires significant changes:
1. Create a new version (`bmad-dev-test-loop-v2`) OR
2. Create a new skill with improved logic and deprecate the old one

Always maintain backward compatibility where possible.

## Checklist for New Skills

Before submitting a skill to the repository:

- [ ] Skill directory uses kebab-case naming
- [ ] SKILL.md has valid YAML frontmatter with name, description, argument-hint
- [ ] SKILL.md includes: Initialization, Execution, Completion, Rules sections
- [ ] SKILL.md is under 400 lines (use `wc -l`)
- [ ] All agent prompts use BMAD naming conventions and include required sections
- [ ] Output format is clearly documented with parseable status/verdict lines
- [ ] Skill references project-specific conventions via CLAUDE.md (not hardcoded)
- [ ] README.md mentions the skill with description, trigger, and usage example
- [ ] Markdown renders without errors (test in viewer)
- [ ] Skill tested in at least one real project (copy or symlink test)

---

**Last Updated:** 2026-04-03  
**Status:** Active  
**Owner:** Documentation
