---
name: deprecation-migration-comments
type: comment-convention
description: Labels deprecated code with replacement, removal plan, and migration path. Triggers on: API signature changes, function/module renaming, library upgrades, refactoring deletions, or TODO-marked code for removal.
---

# Deprecation & Migration Comments / 废弃与迁移注释

## Purpose

标注已废弃、待移除或正在迁移中的代码。记录废弃原因、替代方案、迁移路径以及版本边界。与简单标注 "TODO: remove later" 不同，此 Skill 要求给出可执行的迁移计划，让 AI 在实际进行移除或替换时知道怎么操作。

## When to Use

- 标记函数/类/模块为已废弃（deprecated）
- 逐步迁移到新实现的过渡期（新旧并存）
- 版本弃用计划（不推荐在旧版本中使用）
- 删除或重命名公共 API
- 已有代码被标记为 TODO 需要移除

## Rules

### Rule 1: 所有废弃标记必须包含三个要素

- **替代方案**：用什么替代
- **移除计划**：预计在哪个版本移除
- **迁移指南**：从旧到新的具体步骤或自动迁移脚本链接

### Rule 2: 使用标准的 `@deprecated` 标签（JSDoc/TSDoc）

不要用自定义标记或非标准格式（如 `// OBSOLETE`）。

### Rule 3: 过渡期的新旧并行代码必须标注版本边界

标注哪个版本开始引入新方案、哪个版本计划移除旧方案、以及在过渡期两者的行为差异。

## Examples

### ✅ Good

```typescript
/**
 * Creates a new user account using the legacy registration flow.
 *
 * @deprecated Use createUserV2() instead.
 *   Reason: Legacy flow doesn't support OAuth and MFA (security audit finding).
 *   Remove in: v4.0.0 (planned 2026-Q3)
 *   Migration: run `npm run migrate:legacy-users` to bulk-migrate existing accounts.
 *              V2 accepts the same input shape — drop-in replacement for most callers.
 */
async function createUser(input: CreateUserInput): Promise<User> { ... }
```

```typescript
/**
 * Generates the monthly report in XLSX format.
 *
 * @deprecated Will be removed in v5.0. The new ReportService (currently behind
 *             the REPORT_V2 feature flag) generates PDF and CSV instead.
 *             Migration: Update dashboard components to use ReportService.
 *             For API clients: new endpoint GET /api/reports/v2/{type}.
 *
 * Current status (v4.2): Both v1 and v2 run in parallel.
 *                         v1: this function (XLSX, synchronous)
 *                         v2: ReportService (PDF/CSV, async, supports 3x larger datasets)
 *                         Feature flag: REPORT_V2 (default: off for API, on for web dashboard)
 */
async function generateMonthlyReport(month: string): Promise<Buffer> { ... }
```

### ❌ Bad

```typescript
// TODO: remove later
async function createUser(input: CreateUserInput): Promise<User> { ... }
```

```typescript
/**
 * @deprecated Use the new function instead.
 */
async function createUser(input: CreateUserInput): Promise<User> { ... }
```

## Auto-trigger

当修改涉及 API 签名变更、函数/模块重命名、库升级、重构删除代码、或标记 TODO 需要移除的代码时自动加载此 Skill。

## Related Skills

- [related-test-comments](../related-test-comments/SKILL.md) — 迁移后需运行关联测试验证
- [decision-comments](../decision-comments/SKILL.md) — 记录为什么放弃旧方案、为什么选新方案
