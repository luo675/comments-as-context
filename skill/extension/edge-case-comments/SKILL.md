---
name: edge-case-comments
description: Annotates edge case handling — boundary inputs, concurrency conditions, error recovery paths beyond the happy path. Triggers on: input validation, error recovery, concurrency control, distributed system communication, or type boundary code.
---

# Edge Case Comments / 边界条件注释

## Purpose

标注代码中处理边界输入、并发条件、错误恢复等非主路径的逻辑。边界条件是 AI 最容易遗漏的地方——因为 AI 倾向于只看 happy path。

## When to Use

- 输入值为空、null、undefined、负数、极大/极小值时的处理
- 并发竞态条件（race condition、ABA 问题、脏读）
- 分布式系统中的部分失败（超时、重试、熔断、降级）
- 类型边界（整数溢出、浮点精度、时区、闰年）
- 错误恢复和幂等性处理

## Rules

### Rule 1: 每个边界条件处理必须用 `@edgeCase` 或行注释标注

说明什么条件下触发此路径，以及为什么这样处理。

### Rule 2: 缺失的边界处理也需标注

如果故意不处理某个边界条件，必须在注释中说明理由和后果。

### Rule 3: 并发相关的边界处理必须标注竞态条件窗口

说明两个操作之间的时间窗口有多长，以及为什么这个窗口需要保护。

## Examples

### ✅ Good

```typescript
/**
 * Retrieves the current user's profile.
 *
 * @edgeCase User is not logged in → returns anonymous profile (no error)
 * @edgeCase User profile incomplete (created but not filled) → returns partial data with null fields
 * @edgeCase User ID not found in DB → this should never happen (auth guarantees existence);
 *            if it does, returns 500 with correlation ID for debugging
 */
async function getUserProfile(userId: string): Promise<UserProfile> { ... }
```

```typescript
// @edgeCase: Concurrent withdrawal requests could cause negative balance.
//            The database row-level lock (SELECT ... FOR UPDATE) prevents this.
//            Window: between read and write, approximately 2-5ms.
await db.transaction(async (tx) => {
  const account = await tx.one<Account>(
    'SELECT * FROM accounts WHERE id = $1 FOR UPDATE',
    [accountId]
  );
  if (account.balance < amount) throw new InsufficientFundsError();
  await tx.execute('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, accountId]);
});
```

### ❌ Bad

```typescript
async function getUserProfile(userId: string): Promise<UserProfile> {
  if (!userId) return defaultProfile();
  const profile = await db.findUser(userId);
  return profile ?? createAnonymousProfile();
}
```

```typescript
/**
 * Gets user profile. Handles missing user and anonymous access.
 */
async function getUserProfile(userId: string): Promise<UserProfile> { ... }
```

## Auto-trigger

当处理输入验证、错误恢复、并发控制、分布式系统通信、或涉及类型边界（数值溢出/时区/精度）的代码时自动加载此 Skill。

## Related Skills

- [invariant-comments](../../core/invariant-comments/SKILL.md) — 不变量定义了"什么情况下才算边界"
- [line-comments](../../core/line-comments/SKILL.md) — 简单的边界条件可用行注释代替 @edgeCase
