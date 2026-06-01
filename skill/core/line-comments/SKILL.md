---
name: line-comments
description: Adds inline comments for non-obvious logic, algorithm decisions, hacks, performance optimizations, and business rules. Triggers on: complex logic, algorithm implementation, performance optimization, or framework workaround code.
---

# Line Comments / 行内注释

## Purpose

对代码中非显而易见的逻辑、算法决策、hack、性能优化或特定业务规则添加行注释。行注释帮助 AI 在逐行阅读代码时理解「为什么这行代码存在」而不是「这行代码做了什么」——后者由代码本身表达。

## When to Use

- 遇到不直观的边界条件或特殊判断
- 使用不常见的算法或数据结构
- 存在性能敏感的特殊处理
- 针对特定框架/平台 bug 的 workaround
- 业务规则中的隐含假设

## Rules

### Rule 1: 注释解释「为什么」，而非「是什么」

代码本身已经表达了「做了什么」，行注释应解释「为什么」。

### Rule 2: 少于 3 行的简单逻辑不需要行注释

`const total = price * quantity;` 不需要注释。但包含隐含假设时需要。

### Rule 3: Workaround/hack 必须标注原因和预期移除条件

```typescript
// TODO: Remove when upgrading to React 19 which fixes this issue
// https://github.com/facebook/react/issues/12345
```

### Rule 4: 复杂的正则表达式必须拆分并注释

用多行注释解释正则的每个组成部分。

### Rule 5: 与 edge-case-comments 的分界

- **行注释（本 Skill）**：适用于局部、单点、实现层面的"为什么这样写"。例如一个算法步骤、一个条件判断的理由。
- **[edge-case-comments](../skill/extension/edge-case-comments.md)**：适用于函数/模块级别的边界输入、并发竞态、错误恢复等场景。
- 如果一个注释说明的是"当 X 发生时如何处理"，应使用 @edgeCase 而非行注释。

## Examples

### ✅ Good

```typescript
// Subtract 1ms to avoid the lock contention window that occurs
// when multiple workers complete at the exact same millisecond.
// See: https://github.com/our-org/issues/lock-storm-0421
const adjustedDeadline = deadline - 1;
```

```typescript
// We intentionally do NOT await this promise: the event emitter
// will deadlock if the handler blocks on the same thread.
notifySubscribers(payload).catch(logError);
```

### ❌ Bad

```typescript
// Adjust deadline
const adjustedDeadline = deadline - 1;
```

```typescript
const total = price * quantity; // calculate total
```

## Auto-trigger

当处理复杂逻辑、算法实现、性能优化或框架 workaround 时自动加载此 Skill。

## Related Skills

- [edge-case-comments](../extension/edge-case-comments.md) — 边界条件应优先使用 @edgeCase，行注释仅补充其内联细节
- [magic-value-comments](./magic-value-comments.md) — 字面常量应提升为命名常量后注释，而非在行内注释数值
