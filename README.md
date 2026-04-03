# BMAD Custom Skills

Centralized repository for reusable Claude Code skill definitions used across MedAdvisor projects.

## Purpose

This repo stores custom BMAD (Build Measure Analyze Deploy) skills — declarative task definitions that extend Claude Code with project-specific automation workflows. Skills are designed to be shared across multiple projects without modification.

## Repository Structure

```
.claude/skills/
├── {skill-name}/
│   └── SKILL.md          # Skill definition with frontmatter & instructions
├── bmad-dev-test-loop/
│   └── SKILL.md          # Automated Dev→Test→Feedback loop (Amelia & Quinn)
├── bmad-ui-verify/
│   └── SKILL.md          # Visual QA — compare UI against mockup
└── ...
```

## Available Skills

### bmad-dev-test-loop
Orchestrates iterative feature development using two BMAD agents in a structured feedback loop:
- **Amelia** (Senior Dev) builds features with strict adherence to specs
- **Quinn** (QA Engineer) validates with test coverage and structured feedback

**Trigger:** `dev test loop`, `build and test`, or `dtl`  
**Features:** Automated testing, type checking, feedback loops, configurable max iterations  
**UI Mode:** Add `--mockup <figma-url|image|pdf>` to enable visual QA via `bmad-ui-verify`

### bmad-ui-verify
Visual QA skill that compares a running UI against a design mockup using AI vision analysis and DOM style inspection. Produces structured, actionable feedback.

**Trigger:** `verify UI`, `check design`, `ui verify`, `compare mockup`  
**Features:** Figma/image/PDF mockup support, Chrome or headless browser capture, two-layer comparison (AI vision + DOM inspection), desktop/mobile viewports

```bash
# Compare against a Figma design
/bmad-ui-verify figma.com/design/abc123/MyPage --url http://localhost:3000

# Compare against an image mockup
/bmad-ui-verify ./designs/dashboard.png --cmd "npm run dev" --path /dashboard

# Check both viewports
/bmad-ui-verify ./mockup.pdf --url http://localhost:3000 --viewport both
```

## Usage

### Copy a Skill to Your Project

```bash
# Copy entire skill directory into your project
cp -r .claude/skills/bmad-dev-test-loop /path/to/your/project/.claude/skills/

# Or symlink (preferred for shared repos)
ln -s /path/to/bmad-custom-skills/.claude/skills/bmad-dev-test-loop \
      /path/to/your/project/.claude/skills/bmad-dev-test-loop
```

### Invoke a Skill in Claude Code

```
/bmad-dev-test-loop <story-file-or-intent> [--max N]
```

Skill activation requires:
- Claude Code CLI
- Project with `.claude/skills/` directory
- SKILL.md in the skill directory with valid frontmatter

## Contributing

### Add a New Skill

1. Create skill directory:
   ```bash
   mkdir -p .claude/skills/{skill-name}
   ```

2. Create `SKILL.md` with required frontmatter:
   ```markdown
   ---
   name: {skill-name}
   description: 'Brief description. Use when user says "trigger phrase"'
   argument-hint: '<arg-description> [--flag value]'
   ---
   
   # Skill Title
   
   Detailed instructions...
   ```

3. Follow code standards in `docs/code-standards.md`
4. Commit to `main` — no pull requests needed

## Standards

- **Naming:** kebab-case for skill directories (`bmad-dev-test-loop`)
- **Files:** Keep SKILL.md under 400 lines; split if larger
- **Frontmatter:** name, description, argument-hint (required)
- **Documentation:** Clear sections — Initialization, Execution, Completion, Rules

See `docs/code-standards.md` for detailed standards.

## Learn More

- [Project Overview & PDR](./docs/project-overview-pdr.md)
- [Codebase Summary](./docs/codebase-summary.md)
- [Code Standards](./docs/code-standards.md)
