---
name: bmad-ui-verify
description: 'Visual QA — compare UI implementation against mockup/design. Use when "verify UI", "check design", "ui verify", "compare mockup"'
argument-hint: '<mockup-source> --url <live-url> | --cmd <dev-server-cmd> [--path /route] [--viewport desktop|mobile|both]'
---

# BMAD UI Verify

Visual QA skill that compares a running UI against a design mockup using AI vision analysis and DOM inspection. Produces structured, actionable feedback compatible with `bmad-dev-test-loop`.

## Arguments

- `$ARGUMENTS` first positional — mockup source (Figma URL, image path, or PDF path)
- `--url <url>` — live URL to capture (e.g., `http://localhost:3000/dashboard`)
- `--cmd <command>` — dev server command to start (e.g., `npm run dev`)
- `--path <route>` — route to navigate after server starts (default: `/`)
- `--viewport <mode>` — `desktop` (default), `mobile`, or `both`

## Initialization

1. **Parse mockup source** — detect type from first argument:
   - Contains `figma.com/` → Figma mode
   - Ends with `.png`, `.jpg`, `.jpeg`, `.webp` → Image mode
   - Ends with `.pdf` → PDF mode
   - Otherwise → ask user for supported format

2. **Parse flags** — extract `--url`, `--cmd`, `--path`, `--viewport`
   - Require at least one of `--url` or `--cmd`
   - If neither provided → ask user

3. **Detect browser tool** — try in order:
   - `mcp__claude-in-chrome__navigate` available → use Chrome MCP
   - `/ck:browse` or `/ck:gstack` available → use headless browser
   - `scripts/capture-screenshot.mjs` exists in skill repo → use Playwright capture
   - None available → fallback to manual screenshot (ask user)

4. **Initialize state:**
   - `reference_image = null`
   - `design_brief = null`
   - `implementation_screenshot = null`
   - `computed_styles = null`

## Phase 1: Extract Design Spec

Goal: Normalize any mockup input into a reference image + structured design brief.

### Figma Mode
1. Parse fileKey and nodeId from URL (see Figma MCP URL parsing rules)
2. Call `mcp__claude_ai_Figma__get_screenshot` with fileKey, nodeId → `{reference_image}`
3. Call `mcp__claude_ai_Figma__get_design_context` with fileKey, nodeId → extract design tokens
4. Build `{design_brief}` from Figma design context (colors, typography, spacing, components)

### Image Mode
1. Use `Read` tool on the image path → Claude sees the mockup visually
2. Analyze the mockup image and extract `{design_brief}`:
   - **Colors**: List all distinct colors with approximate hex values
   - **Typography**: Font sizes (sm/md/lg/xl), weights (normal/medium/bold), hierarchy
   - **Layout**: Grid structure, column count, flex direction, alignment
   - **Components**: Inventory of UI elements (buttons, cards, inputs, nav, etc.)
   - **Spacing**: Padding/margin patterns (tight/normal/loose)
3. Store the image path as `{reference_image}`

### PDF Mode
1. Use `Read` tool with `pages` parameter on the PDF → Claude sees the design
2. Extract `{design_brief}` same as Image Mode
3. Store as `{reference_image}`

### Design Brief Output Format
```
DESIGN BRIEF:
- Colors: primary=#XXXX, secondary=#XXXX, bg=#XXXX, text=#XXXX, accent=#XXXX
- Typography: headings=bold/xl, subheadings=medium/lg, body=normal/md
- Layout: [grid N-col | flex-row | flex-col | sidebar+main | etc.]
- Components: [list of UI elements with key visual traits]
- Spacing: [pattern description]
- Key visual features: [anything distinctive — shadows, borders, gradients, icons]
```

## Phase 2: Capture Implementation

Goal: Screenshot the running UI and extract computed DOM styles.

### Start Dev Server (if --cmd provided)
1. Run `{cmd}` via Bash with `run_in_background: true`
2. Wait for server ready — poll with `curl -s -o /dev/null -w "%{http_code}" {url}` every 2s, max 30s
3. If timeout → report BLOCKED with server startup failure

### Screenshot Capture

**Using Chrome MCP:**
1. Call `mcp__claude-in-chrome__navigate` to `{url}{path}`
2. Wait for page load (2s settle time)
3. For `desktop` viewport: `mcp__claude-in-chrome__resize_window` to 1440×900
4. For `mobile` viewport: resize to 390×844
5. For `both`: capture both viewports sequentially
6. Use `mcp__claude-in-chrome__computer` with action `screenshot` → `{implementation_screenshot}`

**Using headless browser (gstack/browse):**
1. Navigate to `{url}{path}`
2. Screenshot with appropriate viewport
3. Store as `{implementation_screenshot}`

**Using Playwright capture script:**
1. Locate script: find `capture-screenshot.mjs` in the skill repo's `scripts/` directory
2. For `desktop` viewport:
   ```bash
   node {script_path} --url "{url}{path}" --viewport 1440x900 --output /tmp/ui-verify-desktop.png --js "{dom_extraction_js}"
   ```
3. For `mobile` viewport:
   ```bash
   node {script_path} --url "{url}{path}" --viewport 390x844 --output /tmp/ui-verify-mobile.png --js "{dom_extraction_js}"
   ```
4. Parse JSON output → `{implementation_screenshot}` from `screenshot` field
5. If `js_result` present → `{computed_styles}` from that field (skip separate DOM extraction)
6. If script fails with "playwright not installed" → report BLOCKED with install instructions

**Manual fallback:**
1. Ask user: "Please screenshot {url}{path} and provide the file path"
2. Read provided screenshot path

### DOM Style Extraction

Execute via `mcp__claude-in-chrome__javascript_tool` or equivalent:

```javascript
JSON.stringify(
  Array.from(document.querySelectorAll(
    '[data-testid], h1, h2, h3, h4, p, button, a, nav, main, header, footer, section, .card, .btn, input, select, textarea, img'
  )).slice(0, 50).map(el => {
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      class: el.className?.toString().slice(0, 80) || undefined,
      text: el.textContent?.slice(0, 40) || undefined,
      styles: {
        color: cs.color,
        bg: cs.backgroundColor,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        fontFamily: cs.fontFamily.split(',')[0],
        padding: cs.padding,
        margin: cs.margin,
        display: cs.display,
        gap: cs.gap,
        gridCols: cs.gridTemplateColumns,
        borderRadius: cs.borderRadius,
        boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : undefined,
      }
    };
  })
);
```

Store result as `{computed_styles}`.

## Phase 3: Compare & Report

Goal: Two-layer comparison producing structured verdict.

### Layer 1: AI Vision Comparison

View both `{reference_image}` (mockup) and `{implementation_screenshot}` side by side.

Analyze with this structured prompt:
```
Compare the MOCKUP (design) against the IMPLEMENTATION (screenshot).
For each difference found, report:
- Region: which part of the UI (header, hero, card, button, footer, etc.)
- Category: layout | color | typography | spacing | missing-element | extra-element
- Expected: what the mockup shows
- Actual: what the implementation shows
- Severity: critical (wrong layout/missing section) | major (wrong colors/sizes) | minor (subtle spacing)

Also provide:
- Overall visual match estimate (0-100%)
- List of elements present in both (checklist)
```

### Layer 2: DOM Cross-Validation

Compare `{computed_styles}` against `{design_brief}`:
- Check color values (convert rgb→hex for comparison)
- Check font sizes against typography spec
- Check layout (display, grid-template-columns) against layout spec
- Check spacing (padding, margin, gap) against spacing patterns
- Flag exact mismatches with element selector and computed value

### Merge Results

Combine both layers into unified verdict:
- Issues found by BOTH layers → **high confidence**
- Issues found by vision ONLY → **medium confidence** (prefix with "⚠ review:")
- Issues found by DOM ONLY → **high confidence** (exact value mismatch)

## Output Format

```
STATUS: UI_PASS | UI_FAIL | BLOCKED

### Visual Match
- Score: N%
- Viewport: desktop | mobile | both
- Screenshots: [paths]

### Design Brief Checklist
- [x] Component present and correct
- [~] Component present but has issues
- [ ] Component MISSING

### Issues
For each issue:
- **[severity][category]** element/region — expected X, actual Y
- Confidence: high | medium
- Fix: file:line (if determinable) — CSS/Tailwind suggestion

### Blockers (if BLOCKED)
[what prevented verification — server timeout, no browser tool, missing mockup]

### Summary
[1-2 sentence overall assessment]
```

### DTL-Compatible Feedback Format

When invoked by Quinn within `bmad-dev-test-loop`, issues map to:
```
- **File:** path/to/component.tsx:lineNumber
- **Severity:** critical | major | minor
- **Category:** ui-layout | ui-color | ui-typography | ui-spacing | ui-missing | ui-extra
- **Issue:** description with expected vs actual
- **Fix suggestion:** specific CSS/Tailwind change
```

## Rules

- **Always capture before comparing** — never guess from code alone, always screenshot
- **Two-layer validation** — vision comparison AND DOM inspection, never just one
- **Structured output only** — every issue must have severity, category, expected, actual
- **No false precision** — vision-only findings are "medium confidence", say so
- **Viewport matters** — if `--viewport both`, report issues per viewport
- **Non-destructive** — never modify source code, only report findings
- **Timeout handling** — if dev server doesn't start in 30s, verdict is BLOCKED not FAIL
- **Element limit** — DOM extraction capped at 50 elements to avoid token bloat
- **Color normalization** — always convert rgb() to hex for comparison readability
- **No manual fallback in DTL** — when invoked by Quinn inside DTL, if no browser tool is available, report BLOCKED instead of asking user for manual screenshot
