# Magic Value Comments / 魔法值注释

## Purpose

对代码中的字面常量（数字、字符串、标志位）进行注释，说明其含义、控制范围以及修改时的影响面。消除"魔法值"的歧义性，让 AI 修改时能准确判断值的调整是否安全。

## When to Use

- 定义数值常量、超时时间、阈值、限制值
- 定义状态码、错误码、枚举值
- 定义 URL、路径、Key 等字符串常量
- 定义布尔标志位（feature flag 等）
- 配置项或环境变量

## Rules

### Rule 1: 所有非 0/1/true/false 的字面常量必须有注释

0、1、true、false 作为初始化值时不需要注释。但对于业务含义明确的标志位的 true/false 需要注释。

### Rule 2: 注释必须说明「这个值控制什么」和「修改范围」

```typescript
// GOOD: 说明了含义和影响
const SESSION_TTL_MS = 3_600_000; // Session expiry: 1h. Shorter increases login friction, longer weakens security.
```

### Rule 3: 有关联的值必须互相关联注释

如果一个值的变化必然要求另一个值同步变化，注释中必须指出。

### Rule 4: 已提取为命名常量的魔法值仍须注释

命名常量只表达了「值是什么」，注释补充「这个值控制什么」和「修改的安全范围」。
命名常量不应成为省略注释的理由。不要在业务逻辑中直接写 `if (status === 3)`，应使用 `if (status === OrderStatus.CONFIRMED)` 并在枚举定义处加注释。

## Examples

### ✅ Good

```typescript
// Rate limit: 100 requests per minute per IP.
// Above this threshold the API returns 429. Adjust based on peak traffic analysis.
const RATE_LIMIT_PER_MINUTE = 100;
```

```typescript
// Session TTL: 30 minutes in milliseconds.
// Must be kept in sync with REFRESH_THRESHOLD_MS (currently 300_000 = 5 min before expiry).
const SESSION_TTL_MS = 1_800_000;
```

```typescript
// Feature flag: enable new checkout flow (v2). Remove after 2026-Q2 once
// the old flow's traffic drops below 1%.
const USE_NEW_CHECKOUT = process.env.FEATURE_CHECKOUT_V2 === 'true';
```

### ❌ Bad

```typescript
const RATE_LIMIT_PER_MINUTE = 100;
```

```typescript
// Rate limit
const RATE_LIMIT_PER_MINUTE = 100;
```

```typescript
if (status === 3) { ... }  // What is 3?
```

## Auto-trigger

当定义数值/字符串/布尔常量、配置项、超时时间、限制值、或 feature flag 时自动加载此 Skill。

## Related Skills

- [decision-comments](../extension/decision-comments.md) — 注释"值是什么/控制什么"后，用 @decision 补充"为什么选这个值"
