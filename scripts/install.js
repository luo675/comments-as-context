#!/usr/bin/env node

/**
 * install.js — Cross-platform installer for comments-as-context skills.
 *
 * Usage:
 *   node scripts/install.js              # install all skills
 *   node scripts/install.js --core       # install core skills only
 *   node scripts/install.js --extension  # install extension skills only
 *
 * Outputs a CLAUDE.md config snippet after installation.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = path.resolve(__dirname, "..");
const SKILL_SOURCE = path.join(ROOT, "skill");
const SKILL_TARGET = path.join(
  process.env.HOME ||
    process.env.USERPROFILE ||
    os.homedir(),
  ".claude",
  "skills"
);

// Parse args
const args = process.argv.slice(2);
const installCore =
  args.includes("--core") || (!args.includes("--extension") && !args.includes("--core"));
const installExtension =
  args.includes("--extension") || (!args.includes("--core") && !args.includes("--extension"));

// Color helpers (no dependencies)
const c = (code, s) => `\x1b[${code}m${s}\x1b[0m`;
const green = (s) => c(32, s);
const yellow = (s) => c(33, s);
const cyan = (s) => c(36, s);
const gray = (s) => c(2, s);

/** Install a single skill by copying SKILL.md to ~/.claude/skills/<name>/ */
function installSkill(setName, skillName) {
  const src = path.join(SKILL_SOURCE, setName, skillName, "SKILL.md");
  const dst = path.join(SKILL_TARGET, skillName, "SKILL.md");

  if (!fs.existsSync(src)) {
    console.log(`  ${yellow("⚠")}  SKILL.md not found: ${src}`);
    return false;
  }

  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  console.log(`  ${green("✓")}  Installed  ${skillName}  →  ${dst}`);
  return true;
}

// ─── Install ────────────────────────────────────────────────
console.log("");
console.log(`  ${cyan("comments-as-context — Installer")}`);
console.log(`  ${gray("───────────────────────────────")}`);
console.log("");

const coreSkills = [];
const extSkills = [];

if (installCore) {
  console.log(`  ${yellow("📦 Core skills:")}`);
  const coreDir = path.join(SKILL_SOURCE, "core");
  if (fs.existsSync(coreDir)) {
    for (const entry of fs.readdirSync(coreDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (installSkill("core", entry.name)) coreSkills.push(entry.name);
      }
    }
  }
  console.log("");
}

if (installExtension) {
  console.log(`  ${gray("📦 Extension skills:")}`);
  const extDir = path.join(SKILL_SOURCE, "extension");
  if (fs.existsSync(extDir)) {
    for (const entry of fs.readdirSync(extDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (installSkill("extension", entry.name)) extSkills.push(entry.name);
      }
    }
  }
  console.log("");
}

console.log(`  ${green("✅  Installation complete!")}`);
console.log("");

// ─── CLAUDE.md Config Snippet ───────────────────────────────
console.log(`  ${cyan("─────────────────────────────────────────────────────────────")}`);
console.log(`  ${cyan("📋  CLAUDE.md — Auto-trigger Rules")}`);
console.log(`  ${cyan("─────────────────────────────────────────────────────────────")}`);
console.log("");
console.log("  Copy the block below into your project's CLAUDE.md:");
console.log("");

if (installCore) {
  console.log("  ## Auto-trigger Rules (Core)");
  console.log("  | When I... | Load this skill |");
  console.log("  |-----------|-----------------|");
  const coreTable = [
    ["Creating/editing files", "file-header-comments"],
    ["Writing functions/classes/methods", "function-block-comments"],
    ["Writing complex logic lines", "line-comments"],
    ["Defining variables", "variable-annotation"],
    ["Detecting side effects", "side-effect-comments"],
    ["Functions with caller/callee relationships", "dependency-comments"],
    ["Invariants or constraints exist", "invariant-comments"],
    ["Defining constants/config", "magic-value-comments"],
  ];
  for (const [trigger, skill] of coreTable) {
    console.log(`  | ${trigger} | \`${skill}\` |`);
  }
}

if (installExtension) {
  console.log("");
  console.log("  ## Auto-trigger Rules (Extension)");
  console.log("  # Uncomment skills you need:");
  console.log("  # | When I... | Load this skill |");
  console.log("  # |-----------|-----------------|");
  const extTable = [
    ["Cross-layer code in multi-module projects", "boundary-comments"],
    ["Complex data flow scenarios", "dataflow-comments"],
    ["Technical decisions or special design", "decision-comments"],
    ["Boundary/error path handling", "edge-case-comments"],
    ["Refactoring/deprecating code", "deprecation-migration-comments"],
    ["After modifying implementation", "related-test-comments"],
    ["Defining interfaces or complex types", "type-interface-comments"],
  ];
  for (const [trigger, skill] of extTable) {
    console.log(`  # | ${trigger} | \`${skill}\` |`);
  }
}

console.log("");
console.log(`  ${cyan("─────────────────────────────────────────────────────────────")}`);
console.log("");
