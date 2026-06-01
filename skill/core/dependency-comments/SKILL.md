---
name: dependency-comments
type: comment-convention
description: Annotates callers and callees at function/module headers to form explicit call chain knowledge. Triggers on: writing or modifying public functions called from multiple sites, or functions in deep call chains.
---

# Dependency Comments / 上下游依赖注释

## Purpose

在函数或模块头部标注其调用方（callers）和被调用方（callees），形成显式的调用链知识。这让 AI 在修改一个函数时能立刻知道「这个函数被谁调用」「这个函数又调用了谁」，无需全局搜索，也不会遗漏下游影响。

## When to Use

- 定义或修改被多处调用的公共函数
- 定义调用链较深的核心处理函数
- 重构涉及函数签名变更时
- 存在循环依赖或间接递归时

## Rules

### Rule 1: 核心/公共函数必须标注 callers 和 callees

- `@callers` — 列出直接调用此函数的上游函数/模块（至少显式列出最重要的 3-5 个）
- `@callees` — 列出此函数内部调用的下游函数/模块

### Rule 2: 调用方超过 5 个时使用通配描述

不要列出一长串名字，用分组描述代替。

### Rule 3: 修改签名时必须检查所有 callers

文件注释中的 `@callers` 列表是修改时的安全检查清单——必须逐一确认每个调用方是否需要同步修改。

## Examples

### ✅ Good

```typescript
/**
 * Generates a signed JWT token for authenticated users.
 *
 * @callers
 *   - AuthController.login()        // Issue token on login
 *   - AuthController.refresh()      // Re-issue on token refresh
 *   - Middleware: tokenMiddleware()  // Verify and attach to request
 *
 * @callees
 *   - KeyService.getSigningKey()    // Fetch RSA private key
 *   - TokenBlacklist.check()        // Verify token not revoked
 */
function generateToken(payload: JwtPayload): string { ... }
```

```typescript
/**
 * Syncs local inventory changes to the warehouse management system.
 *
 * @callers
 *   All mutation endpoints in InventoryController (approx 8 routes),
 *   including:
 *   - InventoryController.createStock()
 *   - InventoryController.updateQuantity()
 *
 * @callees
 *   - WarehouseApiClient.pushUpdate()  // POST /api/sync
 *   - AuditLogger.logSync()            // Record sync attempt
 *   - SyncQueue.enqueue()              // Retry queue on failure
 */
async function syncToWarehouse(changes: InventoryChange[]): Promise<SyncResult> { ... }
```

### ❌ Bad

```typescript
function generateToken(payload: JwtPayload): string { ... }
```

```typescript
/**
 * Generates JWT token
 */
function generateToken(payload: JwtPayload): string { ... }
```

## Auto-trigger

当编写或修改被多处引用的公共函数，或涉及跨模块调用链的函数时自动加载此 Skill。

## Related Skills

- [file-header-comments](../file-header-comments/SKILL.md) — 文件级 @related → 模块间依赖，函数级 @callers → 调用链
- [boundary-comments](../../extension/boundary-comments/SKILL.md) — 跨层调用需同时满足架构边界约束
