---
name: file-header-comments
type: comment-convention
description: Enforces structured file header comments explaining file purpose, related files, and modification history. Triggers on: creating or editing files without header comments.
---

# File Header Comments / 文件头注释

## Purpose

确保每个源文件开头有一段结构化的注释，说明该文件在整个系统中的角色、关联了哪些其他文件，以及最近的修改历史。当 AI 后续修改该文件时，能通过头部注释迅速理解上下文，无需在全文搜索中重建认知。

## When to Use

- 创建新文件时
- 编辑已有文件时，检查并更新文件头中的关联文件和修改日期
- 重构移动文件内容时

## Rules

### Rule 1: 每个文件必须有文件头注释块

文件顶部必须用 JSDoc 块注释包裹，使用 `@file`、`@related`、`@updated` 标签：

- `@file` — 一句话说明这个文件负责什么（1-2 行）
- `@related` — 列出与本文件有直接依赖或调用关系的其他文件路径（相对路径）
- `@updated` — `YYYY-MM-DD` 最后修改日期

### Rule 2: 文件头信息必须随代码变更同步更新

- 添加新依赖时，更新 `@related` 列表
- 修改文件时，更新 `@updated` 日期
- 合并多个文件内容时，合并并精简文件头

### Rule 3: 头注释应保持简洁

- `@file` 描述不超过 3 行
- `@related` 不超过 8 项，超出说明文件职责过重，应考虑拆分

## Examples

### ✅ Good

```typescript
/**
 * @file Manages user authentication flow — login, logout, token refresh.
 *       Acts as the single entry point for all auth-related operations.
 *
 * @related
 *   - services/api-client.ts      // HTTP layer for auth endpoints
 *   - stores/auth-store.ts        // Reactive auth state management
 *   - components/LoginForm.tsx    // UI that calls the login method
 *   - middleware/auth-guard.ts    // Route guard that reads session
 *
 * @updated 2026-05-28
 */
export class AuthService { ... }
```

### ❌ Bad

```typescript
/**
 * @file Auth related utilities
 * @updated 2026-05-28
 */
export class AuthService {
  async login(email: string, password: string): Promise<Session> { ... }
  async refreshToken(token: string): Promise<string> { ... }
}
```

The `@file` is too generic ("Auth related utilities"). No `@related` listing the files that depend on this service (e.g., `components/LoginForm.tsx`, `stores/auth-store.ts`, `middleware/auth-guard.ts`). When an AI modifies `login()`'s return type, it won't know to also update the callers in those related files.

## Auto-trigger

当创建新文件或首次编辑一个尚无文件头注释的已有文件时，自动加载此 Skill。

## Related Skills

- [dependency-comments](../dependency-comments/SKILL.md) — 函数级的 @callers/@callees 是 @related 的细化
- [related-test-comments](../../extension/related-test-comments/SKILL.md) — 测试文件关联是 @related 的子集

## 标签格式约定

本技能集混合使用了两种标签风格，选择原则如下：

- **`@tag` 格式**（JSDoc 块注释内使用）：`@param`、`@returns`、`@state`、`@sideEffects`、`@callers`、`@invariant`、`@deprecated`、`@template`——用于标注「代码块」（函数、类、模块）的整体属性
- **`// TAG:` 格式**（代码行上方独立使用）：`// DECISION:`、`// DATAFLOW:`、`// CONDITION BRANCH:`、`// LAYER:`、`// DEPENDS ON:`、`// IRREVERSIBLE:`——用于标注「单点位置」（单行、单步骤、单变量）的特性和约束
