---
name: related-test-comments
type: comment-convention
description: Associates implementation code with test files and test coverage scenarios. Triggers on: modifying implementation code (especially bug fixes, new features, core logic refactoring).
---

# Related Test Comments / 关联测试注释

## Purpose

在实现代码中标注关联的测试文件，并在测试文件中标注覆盖的场景。当 AI 修改实现代码后，可以通过这些关联找到对应的测试并验证修改不破坏已有覆盖。

## When to Use

- 实现代码修改后，运行或检查关联测试
- 添加新功能后，补充对应的测试文件注释
- 修复 bug 后，在实现代码中关联 bug 对应的测试用例
- 重构代码时，确认测试覆盖了哪些场景

## Rules

### Rule 1: 实现代码中标注关联的测试文件

使用 `@tests` 标签列出关联测试文件的路径。

### Rule 2: 测试文件头部标注覆盖的场景清单

列出该测试文件覆盖的功能场景和边界条件。

### Rule 3: bug 修复必须在测试注释中关联 issue/bug 编号

```typescript
// Tests: tests/bugs/bug-1423-payment-overflow.test.ts
// This test covers the edge case where payment amount exceeds Integer.MAX_SAFE_INTEGER.
```

### Rule 4: 新增边界条件时必须同步更新测试注释

修改实现代码引入新的边界条件后，应：

- 在实现代码的 `@tests` 注释中标注新增的测试场景
- 在测试文件头部的场景清单中补充新增覆盖

## Examples

### ✅ Good

```typescript
/**
 * Calculates the shipping cost based on weight and destination zone.
 *
 * @tests
 *   - tests/unit/shipping/calculator.test.ts  (unit tests, standard cases)
 *   - tests/integration/shipping/zone-pricing.test.ts  (integration, multi-zone)
 */
function calculateShipping(weightGrams: number, zone: ZoneCode): Money { ... }
```

```typescript
/**
 * Coverage scenarios:
 *   - Standard domestic shipping (zone: US, weight < 500g)
 *   - International shipping (zone: EU, weight 500g-20kg)
 *   - Oversize package (weight > 30kg) → throws OversizeError
 *   - Zero weight → uses minimum flat rate
 *   - Invalid zone code → throws InvalidZoneError
 *   - Free shipping for prime members (regression: bug #892)
 *
 * Run: npx vitest tests/unit/shipping/calculator.test.ts
 */
```

### ❌ Bad

```typescript
/**
 * Calculates shipping cost based on weight and destination zone.
 * Updated to support new international zone rates.
 */
function calculateShipping(weightGrams: number, zone: ZoneCode): Money { ... }
```

The comment announces an update ("new international zone rates") but doesn't include `@tests` linking to the relevant test files. An AI or reviewer modifying this function has no way to know which test files cover it (`tests/unit/shipping/calculator.test.ts`) or what scenarios are already tested — changes might silently break existing coverage.

## Auto-trigger

当修改实现代码（尤其是修复 bug、添加新功能、重构核心逻辑）时自动加载此 Skill，检查是否需要定位并运行关联测试。

## Related Skills

- [edge-case-comments](../edge-case-comments/SKILL.md) — 测试场景应覆盖测试文件中标注的所有 @edgeCase
- [function-block-comments](../../core/function-block-comments/SKILL.md) — 测试应验证 @throws 中声明的异常路径
