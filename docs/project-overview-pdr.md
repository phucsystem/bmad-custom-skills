# BMAD Custom Skills — Project Overview & PDR

## Vision

A centralized repository for reusable Claude Code skill definitions that encode BMAD (Build Measure Analyze Deploy) automation patterns. Skills are declarative task templates that teams across MedAdvisor can adopt without modification.

## Purpose

Enable rapid, consistent execution of complex development workflows by:
- Defining structured automation patterns (dev→test→feedback loops)
- Sharing standardized agent orchestration across projects
- Reducing setup friction for new projects adopting BMAD practices
- Centralizing skill maintenance and updates

## Scope

**Included:**
- SKILL.md definitions with frontmatter, arguments, and execution logic
- Skills for common BMAD patterns (dev-test loops, code review, deployment)
- Documentation and standards for extending the skill library

**Excluded:**
- Runtime code, packages, or dependencies
- Project-specific implementations
- Compiled artifacts or build outputs

## Target Audience

- MedAdvisor development team
- Project leads implementing BMAD workflows
- Developers using Claude Code for task automation

## Success Metrics

- **Skill Adoption:** 2+ projects using `bmad-dev-test-loop` by Q2 2026
- **Library Growth:** 5+ skills available by end of 2026
- **Maintenance:** 0 stale skills (all tested and documented)
- **Clarity:** All skills documented with clear triggers and examples

## Requirements

### Functional
- Skills must be copy/symlink-able into any MedAdvisor project
- Each skill must declare activation trigger(s) in description
- Each skill must document expected arguments and flags
- SKILL.md files must be self-contained (no external dependencies)

### Non-Functional
- Keep individual SKILL.md files under 400 lines
- Maintain consistent frontmatter structure across all skills
- Each skill must reference CLAUDE.md conventions (project-specific, not hardcoded)
- Documentation must be searchable and cross-referenced

## Key Constraints

1. **No Runtime Dependencies** — skills contain declarative config only
2. **Project Independence** — skills must work across different codebases
3. **Standards Compliance** — all skills must follow `docs/code-standards.md`
4. **Version Transparency** — skill behavior driven by CLAUDE.md in target project, not hardcoded

## Acceptance Criteria

- [x] Repository initialized with clear structure
- [x] One production-grade skill present (bmad-dev-test-loop)
- [x] README with usage instructions
- [x] Code standards documented
- [x] Project overview and PDR documented
- [ ] 3+ additional skills defined (future)
- [ ] Skill catalog with examples (future)

## Timeline

- **Current (Apr 2026):** Repository creation, initial skill, documentation
- **Q2 2026:** Validation with 2+ projects, minor improvements
- **Q3 2026:** Expand library (3+ new skills), refine standards
- **Q4 2026+:** Ongoing maintenance and evolution

## Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Skills drift from CLAUDE.md standards | Low quality, poor adoption | Review standards quarterly, test skills in fresh projects |
| SKILL.md files become unmaintainable (>400 LOC) | Readability, debugging difficulty | Enforce max 400 lines; split large skills into multiple files if needed |
| Vague skill descriptions | Incorrect usage, lost time | Require activation triggers and clear argument hints in frontmatter |

## Decision Log

- **Skills as Config, Not Code:** Chose declarative SKILL.md format over executable scripts to ensure portability
- **Centralized vs. Distributed:** Centralized repo (vs. scattered skills per project) to enable discovery and reuse
- **No Package Manager:** Avoided npm/pip packaging to keep barrier to adoption low (copy/symlink is simpler)

---

**Last Updated:** 2026-04-03  
**Status:** Active  
**Owner:** MedAdvisor DevOps
