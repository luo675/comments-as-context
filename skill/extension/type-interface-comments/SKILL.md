---
name: type-interface-comments
type: comment-convention
description: Ensures structured annotations on TypeScript type aliases, interfaces, generic parameters, and complex union types. Triggers on: defining interfaces, type aliases, generic parameters, union types, or modifying existing type fields.
---

# Type & Interface Comments / 类型与接口注释

## Purpose

确保 TypeScript 中的类型别名（type alias）、接口（interface）、泛型参数和复杂联合类型有结构化注释。类型定义是代码中最核心的契约，AI 在推导类型时会丢失设计意图——注释应补充类型签名无法表达的设计约束、字段关系和使用场景。

## When to Use

- 定义模块对外暴露的公共接口或类型
- 定义包含多个字段的复杂对象类型
- 使用泛型参数且其约束非显而易见时
- 定义联合类型（union）或交叉类型（intersection）时
- 定义包含条件类型（conditional type）或映射类型（mapped type）时

## Rules

### Rule 1: 所有公开接口/类型必须有块注释描述其用途

- 说明这个类型代表什么业务概念
- 说明这个类型在什么场景下使用

### Rule 2: 非自文档化的字段必须用行注释说明

- 字段命名无法表达含义时（如缩写、业务术语、单位）
- 字段存在约束时（如只读、非空、必须是正数）
- 字段之间存在关联关系时（如 startDate MUST be before endDate）

### Rule 3: 泛型参数必须用 `@template` 注释

- 说明泛型参数代表的含义和约束
- 如果有默认类型，说明默认值的选用理由

### Rule 4: 联合类型的分支必须标注各成员的语义

- 每个分支成员说明在什么场景下使用
- 如果有新增分支的约定，需标注扩展规则

### Rule 5: 使用 `@deprecated` 标记已废弃的字段

不要在类型定义中直接删除字段，而应先废弃并标注替代字段。

## Examples

### ✅ Good

```typescript
/**
 * Represents a paginated API response wrapper.
 * Used by all list-type endpoints in the public API.
 *
 * @template T - The item type returned in the data array
 */
interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[];

  /** Total number of items across all pages (not just this page) */
  total: number;

  /** Current page number, 1-indexed */
  page: number;

  /** Number of items per page. Defaults to 20, max 100. */
  pageSize: number;

  /**
   * Cursor for the next page, if available.
   * null means this is the last page.
   */
  nextCursor: string | null;
}
```

```typescript
/**
 * Represents the state of an order in the fulfillment workflow.
 *
 * Transitions:
 *   pending → confirmed → processing → shipped → delivered
 *   pending → cancelled          (customer-initiated)
 *   confirmed → cancelled        (admin-initiated, before processing starts)
 *
 * Rules:
 *   - Once shipped, an order cannot transition to any other status.
 *   - Cancellation after confirmed requires a refund.
 */
type OrderStatus =
  | 'pending'    // Order placed, awaiting payment confirmation
  | 'confirmed'  // Payment confirmed, preparing for fulfillment
  | 'processing' // Items being picked and packed
  | 'shipped'    // Handed to carrier, tracking available
  | 'delivered'  // Confirmed delivered by carrier
  | 'cancelled'; // Order cancelled before shipping
```

### ❌ Bad

```typescript
interface OrderSummary {
  id: string;          // order ID
  status: string;      // current status
  total: number;       // order total
  items: OrderItem[];  // order items
  createdAt: string;   // creation time
}
```

Field names like `status` are ambiguous (order status? payment status? fulfillment status?) with only a trivial line comment "current status" that restates the name. The `total` comment "order total" doesn't specify currency, precision, or whether it includes tax/shipping. `createdAt` doesn't specify timezone or format (ISO 8601? Unix timestamp?). An AI constructing this type might populate `status` with a payment status instead of an order status, or omit timezone info in `createdAt`.

## Auto-trigger

当定义接口（interface）、类型别名（type）、泛型参数、联合类型、或为已有类型添加/修改字段时自动加载此 Skill。

## Related Skills

- [function-block-comments](../../core/function-block-comments/SKILL.md) — 类型注释是函数签名注释的前置条件
- [invariant-comments](../../core/invariant-comments/SKILL.md) — 类型层面的约束（如字段间关系）是不变量的一种
- [deprecation-migration-comments](../deprecation-migration-comments/SKILL.md) — 废弃字段的 @deprecated 标签应遵循其完整格式（替代方案 + 移除计划 + 迁移指南）
