#!/usr/bin/env node
/**
 * Copy skills from this repo into .claude/skills/ for local dev or target project.
 * Usage:
 *   node scripts/dev-link.mjs                  # copies to this repo's .claude/skills/
 *   node scripts/dev-link.mjs /path/to/project  # copies to target project
 */

import { cpSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsSrc = join(repoRoot, "skills");
const targetArg = process.argv[2];
const targetRoot = targetArg ? resolve(targetArg) : repoRoot;
const targetDir = join(targetRoot, ".claude", "skills");

mkdirSync(targetDir, { recursive: true });

let copied = 0;
for (const entry of readdirSync(skillsSrc)) {
  const skillPath = join(skillsSrc, entry);
  if (!statSync(skillPath).isDirectory()) continue;

  const dest = join(targetDir, entry);
  cpSync(skillPath, dest, { recursive: true });
  console.log(`  copied: ${entry}`);
  copied++;
}

console.log(`Done. ${copied} skill(s) → ${targetDir}`);
