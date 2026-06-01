---
name: invariant-comments
type: comment-convention
description: Documents invariants that must always hold — conditions whose violation would cause crashes, data corruption, or security vulnerabilities. Triggers on: data structure definitions, business rule implementations, concurrency control, or code with sorting/unique/non-null constraints.
---

# Invariant Comments / 不变量注释

## Purpose

标注必须始终保持的不变量（invariants）——一旦破坏会导致系统崩溃、数据损坏或安全漏洞的约束，是修改代码时的警戒线。

## When to Use

- 数据结构中必须保持的约束（排序、唯一性、非空、范围）
- 业务规则中的不变条件（余额不能为负、状态机不允许的转换）
- 并发安全约束（锁顺序、原子操作边界）
- 循环/递归中的不变量（排序算法中的循环不变量）
- 数据库约束的业务层映射

## Rules

### Rule 1: 不变量必须显式标注，使用 `@invariant` 标签

标注位置在约束启用的区域开始处（函数、类、代码块）。

### Rule 2: 不变量说明必须包含「如果违反会怎样」

让 AI 理解破坏该不变量的实际危害等级。

### Rule 3: 修改不变量相关代码时，必须同步更新不变量注释

如果约束本身发生变化，注释也必须更新，否则注释会变成误导。

## Examples

### ✅ Good

```typescript
/**
 * @invariant The items array MUST remain sorted by priority (descending)
 *            at all times. Insertion and deletion operations must re-sort.
 *            Violation: task scheduler will process tasks out of order,
 *            potentially skipping critical high-priority work.
 */
class PriorityTaskQueue {
  private items: Task[] = [];

  add(task: Task): void {
    this.items.push(task);
    this.items.sort((a, b) => b.priority - a.priority);
  }
}
```

```typescript
/**
 * @invariant The order of acquire() calls MUST be db.lock → cache.lock,
 *            never the reverse. Violation: deadlock between concurrent
 *            transfers (see docs/deadlock-analysis.md for the proof).
 */
async function transferFunds(tx: Transfer): Promise<void> {
  await db.acquire(tx.accountId);
  await cache.acquire(tx.accountId);
  ...
}
```

### ❌ Bad

```typescript
async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  // Update cache
  await cache.set(`order:${orderId}`, { status });

  // Update database
  await db.orders.update(orderId, { status });
}
```

Each operation is commented separately ("Update cache", "Update database"), but no `@invariant` declares that cache and DB MUST remain consistent. An AI might "optimize" these writes to be async (fire-and-forget) — if the DB write then fails, the system serves stale cached data, potentially showing "shipped" status for a cancelled order.

## Auto-trigger

当处理数据结构定义、业务规则实现、并发控制、或包含排序/唯一性/非空约束的代码时自动加载此 Skill。

## Related Skills

- [edge-case-comments](../../extension/edge-case-comments/SKILL.md) — 不变量被破坏时即触发边界条件处理路径，两者互补
