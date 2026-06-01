---
name: decision-comments
type: comment-convention
description: Records technical decision context — why a choice was made, what alternatives were considered, and trade-offs accepted. Triggers on: technology choices, architecture pattern decisions, performance optimization strategies, or non-obvious trade-off decisions.
---

# Decision Comments / 决策注释

## Purpose

记录技术选型和设计的决策上下文——**为什么这么做**，而非做了什么。代码无法表达这些理由，后续修改者（包括 AI）容易无意推翻。

## When to Use

- 技术选型（为什么选这个库/数据库/协议而非替代方案）
- 架构决策（为什么选这个模式而非另一个）
- 性能与可维护性的权衡决策
- 安全/合规约束导致的设计决策
- 数字和阈值的选定理由

## Rules

### Rule 1: 决策注释用 `@decision` 或 `// DECISION:` 标签

放在决策生效的代码位置附近，不要放在 Git 提交信息中（太隐蔽）。

### Rule 2: 每条决策注释包含三个必要要素，可附加第 4 个可选要素

- **What** 做了什么选择
- **Why** 为什么选这个（对比了哪些选项）
- **Context** 什么条件下的决策（时间、版本、外部约束）
- **Trade-off** (可选) 选择了什么、放弃了什么，以及对应的缓解措施

### Rule 3: 如果决策条件已变化，必须更新或移除注释

过时的决策注释比没有更危险——它会误导 AI 继续遵守已经不成立的约束。

### 与行注释的分界

- **本 Skill（decision-comments）**：覆盖架构/设计层面的「为什么」——为什么选 A 不选 B、为什么是这个阈值；
- **[line-comments](../../core/line-comments/SKILL.md)**：覆盖实现层面的局部「为什么」——为什么这行代码这样写（算法步骤、workaround 理由）；
- 如果决策理由影响函数整体或跨多个代码行，优先使用 `@decision` / `// DECISION:`；
- 如果是单行代码的实现理由，优先使用行注释。

## Examples

### ✅ Good

```typescript
// DECISION: Use raw SQL instead of ORM for this bulk insert.
//   WHY: TypeORM's save() generates N+1 queries for 10k+ rows.
//        Raw COPY FROM statement is ~40x faster in benchmarks.
//   CONTEXT: PG 16, Node 22, tested with 50k rows (2026-03).
//   TRADE-OFF: Loses ORM-level type validation. Validate via Zod upstream.
await db.query(`
  COPY inventory_items (sku, warehouse_id, quantity)
  FROM STDIN (FORMAT CSV)
`, { stream: true });
```

```typescript
// DECISION: Use polling instead of WebSocket for real-time updates.
//   WHY: Our deployment environment (AWS Lambda) doesn't support
//        persistent connections. WebSocket would require API Gateway.
//   CONTEXT: Serverless architecture on Lambda + API Gateway (2026-01).
//   CONSIDERED: SSE (sse-channel) — rejected because client requires
//               bidirectional communication for acknowledgment.
async function pollForUpdates(deviceId: string): Promise<Update[]> { ... }
```

### ❌ Bad

```typescript
// Use raw SQL here for performance
await db.query(`COPY inventory_items ...`);
```

```typescript
// DECISION: Use polling
async function pollForUpdates(deviceId: string): Promise<Update[]> { ... }
```

## Auto-trigger

当出现技术选型（库/框架/数据库）、架构模式选择、性能优化策略、以及非显而易见的权衡决策时自动加载此 Skill。

## Related Skills

- [magic-value-comments](../../core/magic-value-comments/SKILL.md) — 值由 magic-value 注释，选的理由由 decision 注释
- [deprecation-migration-comments](../deprecation-migration-comments/SKILL.md) — 过期的决策应进入废弃迁移流程
