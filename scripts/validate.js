#!/usr/bin/env node

/**
 * validate.js — Validate SKILL.md files against project standards.
 *
 * Checks:
 *   1. File has YAML frontmatter (surrounded by ---)
 *   2. name field is kebab-case
 *   3. description field contains "trigger" (case-insensitive)
 *   4. File does not exceed 500 lines
 *   5. File contains ✅ Good and ❌ Bad examples
 *
 * Usage:
 *   node scripts/validate.js            # check all skills
 *   node scripts/validate.js --core     # check core only
 *   node scripts/validate.js --extension  # check extension only
 */

const fs = require("fs");
const path = require("path");

// --- Config ---
const ROOT = path.resolve(__dirname, "..");
const SKILL_DIR = path.join(ROOT, "skill");
const LINE_LIMIT = 500;
const NAME_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// --- ANSI colors (no dependencies) ---
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GRAY = "\x1b[2m";
const RESET = "\x1b[0m";

// --- Collect files ---
const collections = {
  core: [],
  extension: [],
};

const sets = fs.readdirSync(SKILL_DIR, { withFileTypes: true });
for (const set of sets) {
  if (!set.isDirectory() || !collections[set.name]) continue;
  const setPath = path.join(SKILL_DIR, set.name);
  const skillDirs = fs.readdirSync(setPath, { withFileTypes: true });
  for (const dir of skillDirs) {
    if (!dir.isDirectory()) continue;
    const skillPath = path.join(setPath, dir.name, "SKILL.md");
    if (fs.existsSync(skillPath)) {
      collections[set.name].push({
        set: set.name,
        name: dir.name,
        filePath: skillPath,
      });
    }
  }
}

// Determine which files to check
const args = process.argv.slice(2);
let filesToCheck = [];
if (args.includes("--core")) {
  filesToCheck = collections.core;
} else if (args.includes("--extension")) {
  filesToCheck = collections.extension;
} else {
  filesToCheck = [...collections.core, ...collections.extension];
}

// --- Validation ---
function validate(file) {
  const errors = [];
  const warnings = [];
  const content = fs.readFileSync(file.filePath, "utf-8");
  const lines = content.split(/\r?\n/);

  // 1. Frontmatter check
  const firstLine = lines[0]?.trim();
  // Find closing ---
  let closingIdx = -1;
  for (let i = 1; i < Math.min(lines.length, 20); i++) {
    if (lines[i].trim() === "---") {
      closingIdx = i;
      break;
    }
  }

  if (firstLine !== "---" || closingIdx === -1) {
    errors.push("缺少 frontmatter（--- 包围的 YAML 块）");
  } else {
    const frontmatterLines = lines.slice(1, closingIdx);
    const frontmatter = frontmatterLines.join("\n");

    // 2. name is kebab-case (strip YAML quotes if present)
    const nameMatch = frontmatter.match(/^name:\s*["']?(.+?)["']?\s*$/m);
    if (!nameMatch) {
      errors.push("frontmatter 中缺少 name 字段");
    } else {
      const name = nameMatch[1].trim();
      if (!NAME_REGEX.test(name)) {
        errors.push(`name "${name}" 不是 kebab-case 格式`);
      }
    }

    // 3. description contains trigger keyword
    const descMatch = frontmatter.match(/^description:\s*["']?(.+?)["']?\s*$/m);
    if (!descMatch) {
      errors.push("frontmatter 中缺少 description 字段");
    } else {
      const desc = descMatch[1];
      if (!/trigger/i.test(desc)) {
        errors.push("description 缺少触发条件关键词（trigger）");
      }
    }

    // Check for other recommended frontmatter fields (full-line match only)
    const hasTypeField = frontmatterLines.some((l) => /^type:\s*\S/.test(l.trim()));
    if (!hasTypeField) {
      warnings.push("frontmatter 建议添加 type 字段");
    }
  }

  // 4. File line count
  if (lines.length > LINE_LIMIT) {
    errors.push(
      `文件超过 ${LINE_LIMIT} 行（当前 ${lines.length} 行）`
    );
  }

  // 5. Good / Bad examples
  if (!content.includes("✅ Good") && !content.includes("- [x] Good")) {
    warnings.push("未找到 ✅ Good 示例");
  }
  if (!content.includes("❌ Bad") && !content.includes("- [x] Bad")) {
    warnings.push("未找到 ❌ Bad 示例");
  }

  return { errors, warnings, lineCount: lines.length };
}

// --- Output ---
let passed = 0;
let failed = 0;
const details = [];

const header = `检查 ${filesToCheck.length} 个文件 — ${LINE_LIMIT} 行限制`;
console.log(`\n  ${GRAY}${header}${RESET}\n`);

for (const file of filesToCheck) {
  const result = validate(file);
  const relPath = path.relative(ROOT, file.filePath).replace(/\\/g, "/");
  const icon = result.errors.length === 0 ? GREEN + "✓" : RED + "✗";
  const label =
    file.set === "core"
      ? YELLOW + "core" + RESET
      : GRAY + "ext" + RESET;

  if (result.errors.length === 0) {
    console.log(`  ${icon}${RESET} ${relPath}`);
    passed++;
  } else {
    console.log(`  ${icon}${RESET} ${relPath}`);
    failed++;
  }

  details.push({ file, result, relPath });
}

// Print detailed failures
if (failed > 0) {
  console.log(`\n  ${RED}── 失败详情 ──${RESET}\n`);
  for (const d of details) {
    if (d.result.errors.length === 0) continue;
    for (const err of d.result.errors) {
      console.log(`  ${RED}✗${RESET} ${d.relPath} — ${err}`);
    }
  }
}

// Print warnings
let warningCount = 0;
for (const d of details) {
  if (d.result.warnings.length > 0) {
    warningCount += d.result.warnings.length;
    for (const w of d.result.warnings) {
      console.log(`  ${YELLOW}⚠${RESET} ${d.relPath} — ${w}`);
    }
  }
}

// Summary
console.log(`\n  ${GRAY}${"=".repeat(40)}${RESET}`);
const allGood = failed === 0 ? GREEN : RED;
console.log(
  `  ${allGood}${filesToCheck.length} files checked: ${passed} passed, ${failed} failed${RESET}`
);
if (warningCount > 0) {
  console.log(`  ${YELLOW}${warningCount} warnings${RESET}`);
}
console.log();

process.exit(failed > 0 ? 1 : 0);
