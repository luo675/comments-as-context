---
name: function-block-comments
type: comment-convention
description: Ensures JSDoc/TSDoc block comments on functions, methods, and constructors describing purpose, parameters, return values, and exceptions. Triggers on: writing or modifying function/method declarations.
---

# Function Block Comments / 函数块注释

## Purpose

确保每个函数、方法、构造函数上方都有 JSDoc/TSDoc 风格的块注释，描述函数的功能、参数、返回值以及可能抛出的异常。这让 AI 在调用或修改函数时无需跳转到函数体内部就能理解其契约。

## When to Use

- 编写新函数/方法时
- 修改已有函数的签名、行为或异常时
- 阅读代码需要快速理解函数作用时

## Rules

### Rule 1: 所有公开函数必须有块注释

- 包含 `@param` 描述每个参数的类型和含义
- 包含 `@returns` 描述返回值的含义
- 如果函数可能抛出异常，包含 `@throws` 说明条件和异常类型

**例外**：以下场景可简化为单行注释或省略：

- Trivial getter/setter（`get name() { return this._name; }`）——但包含副作用或复杂逻辑（如延迟初始化、缓存、验证）的 getter/setter 仍需标准注释
- 框架强制覆盖的生命周期方法（React `render()`、Angular `ngOnInit()`）
- 类型守卫/类型谓词（`isString(x): x is string`）——类型签名已自文档化

### Rule 2: 私有/内部函数也必须有简要注释

- 至少一句话说明函数作用
- 参数和返回值非显而易见时仍需 `@param` / `@returns`

以下情况视为「非显而易见」：

- 参数名包含缩写或非标准简称
- 参数具有合法值范围、格式约束或边界限制
- 返回值类型无法完整表达含义（如 boolean 的 true/false 各代表什么）
- 返回值在特定条件下可能为 null/undefined
- 参数之间存在关联关系（如 startDate 必须早于 endDate）

### Rule 3: 注释描述行为而非实现

- 描述「做什么」「返回什么」，而非「怎么做的」
- 实现细节由行注释或内联注释覆盖

### Rule 4: 修改签名时必须同步更新注释

- 新增参数 → 新增 `@param`
- 改变返回值 → 更新 `@returns`
- 新增异常路径 → 新增 `@throws`

## Examples

### ✅ Good

```typescript
/**
 * Calculates the total price of an order after applying all applicable
 * discounts and promotions. Discounts are applied in order: membership
 * discount first, then coupon, then seasonal promotion.
 *
 * @param items - Array of cart items, each with quantity and unit price
 * @param memberTier - Customer's membership level (basic, silver, gold)
 * @param couponCode - Optional promotional coupon code
 * @returns The final total in cents (integer) to avoid floating-point errors
 * @throws {InvalidItemError} if any item has a negative price or zero quantity
 */
function calculateOrderTotal(
  items: CartItem[],
  memberTier: string,
  couponCode?: string
): number { ... }
```

### ❌ Bad

```typescript
function calculateOrderTotal(items: CartItem[], memberTier: string, couponCode?: string): number {
  // Step 1: sum all item prices
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  // Step 2: apply membership discount
  const afterMemberDisc = subtotal * (1 - MEMBER_DISCOUNT[memberTier]);
  // Step 3: apply coupon if present
  const afterCoupon = couponCode ? applyCoupon(afterMemberDisc, couponCode) : afterMemberDisc;
  // Step 4: calculate tax
  const tax = afterCoupon * TAX_RATE;
  // Step 5: return final total
  return afterCoupon + tax;
}
```

Comments say "Step 1/2/3/4/5" without explaining business intent or constraints (e.g., membership discount must apply before coupon, tax must be calculated AFTER discounts). An AI might reorder steps or insert a new step in the wrong position, producing incorrect financial calculations.

## Auto-trigger

当编写或修改函数/方法声明时自动加载此 Skill，在生成实现代码之前检查块注释是否完整。

## Related Skills

- [dependency-comments](../dependency-comments/SKILL.md) — 函数签名 + callers/callees 构成完整契约
- [side-effect-comments](../side-effect-comments/SKILL.md) — 补充 @throws 无法覆盖的隐式副作用
- [edge-case-comments](../../extension/edge-case-comments/SKILL.md) — 补充函数签名无法表达的边界场景

## Checklist

- [ ] Frontmatter (name, type, description) is present?
- [ ] Description includes trigger conditions ("Triggers on: ...")?
- [ ] Contains at least one ✅ Good and one ❌ Bad example?
- [ ] File does not exceed 500 lines?
- [ ] @tags used in examples match the rules defined above?
- [ ] Chinese description of auto-trigger conditions is included?
