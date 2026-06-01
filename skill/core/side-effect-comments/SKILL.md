# Side Effect Comments / 副作用注释

## Purpose

标注函数或代码块中超出返回值的副作用——修改全局状态、写文件、网络请求、DOM 操作、定时器、订阅等。副作用是 AI 分析代码时最容易遗漏的行为，显式标注能防止修改时破坏系统其他部分。

## When to Use

- 函数直接修改了外部状态（全局变量、单例、持久化存储）
- 函数发起网络请求、写入文件系统、操作 DOM
- 函数注册定时器、订阅事件流、分配外部资源
- 函数修改了传入的可变参数（非纯函数行为）

## Rules

### Rule 1: 有副作用的函数必须在块注释中用 `@sideEffects` 标签声明

列出所有副作用类型，按影响程度从大到小排列。

### Rule 2: 在副作用发生的具体代码行上方添加行注释

块注释声明「有副作用」，行注释说明具体的副作用操作和理由。

### Rule 3: 不可逆副作用必须标明不可逆性

如果副作用不可逆（如删除文件、销毁资源、修改生产数据），注释中必须用 `IRREVERSIBLE` 醒目警告，并说明后果和前置条件。

## Examples

### ✅ Good

```typescript
/**
 * Sends an order confirmation email and updates the order status.
 *
 * @sideEffects
 *   - MODIFIES order.status to "confirmed" in the database
 *   - SENDS email via the EmailService (external SMTP)
 *   - PUBLISHES OrderConfirmedEvent to the message queue
 */
async function confirmOrder(orderId: string): Promise<void> {
  // Database write: order.status = "confirmed"
  await db.orders.update(orderId, { status: 'confirmed' });

  // External call: send confirmation email (fire-and-forget)
  emailService.sendConfirmation(orderId).catch(logError);

  // Event publish: notify downstream services
  await eventBus.publish(new OrderConfirmedEvent(orderId));
}
```

```typescript
/**
 * Applies theme and persists the user's preference to localStorage.
 *
 * @sideEffects
 *   - WRITES to localStorage ("theme" key)
 *   - MODIFIES document.documentElement dataset (DOM)
 */
function applyTheme(theme: 'light' | 'dark'): void {
  // Persist preference
  localStorage.setItem('theme', theme);

  // DOM mutation: toggle data attribute on root element
  document.documentElement.dataset.theme = theme;
}
```

```typescript
/**
 * Permanently deletes a user account and all associated data.
 *
 * @sideEffects
 *   - IRREVERSIBLE: DELETES user row from the production database
 *   - IRREVERSIBLE: PURGES PII from the data warehouse
 *   - SENDS email notification to the user (fire-and-forget)
 *
 * Prerequisites:
 *   - 30-day grace period must have elapsed (checked by DataRetentionService)
 *   - User must have been soft-deleted first (set deleted_at before calling this)
 */
async function purgeUserData(userId: string): Promise<void> {
  // IRREVERSIBLE: Delete from primary database — no soft-delete recovery
  await db.users.delete(userId);

  // IRREVERSIBLE: Purge from warehouse — data cannot be reconstructed
  await warehouse.purgePII(userId);

  // Notify user (non-critical, failure should not block the purge)
  emailService.sendDeletionNotice(userId).catch(logError);
}
```

### ❌ Bad

```typescript
async function confirmOrder(orderId: string): Promise<void> {
  await db.orders.update(orderId, { status: 'confirmed' });
  emailService.sendConfirmation(orderId).catch(logError);
  await eventBus.publish(new OrderConfirmedEvent(orderId));
}
```

```typescript
/**
 * Confirms an order
 */
async function confirmOrder(orderId: string): Promise<void> {
  ...
}
```

## Auto-trigger

当函数包含数据库写操作、网络请求、文件 I/O、DOM 操作、定时器注册、外部资源分配等代码时自动加载此 Skill。

## Related Skills

- [variable-annotation](./variable-annotation.md) — 副作用修改的全局/模块变量需同时标注 @state
- [boundary-comments](../extension/boundary-comments.md) — I/O 副作用应遵守架构层边界约束
