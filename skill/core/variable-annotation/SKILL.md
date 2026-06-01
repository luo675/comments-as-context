---
name: variable-annotation
description: Annotates module-level variables, shared state, and config objects with usage scope, read-write sources, and modification impact. Triggers on: defining or modifying module-scope variables.
---

# Variable Annotation / 变量标注

## Purpose

对模块级/类级的重要变量、配置对象、共享状态进行注释，标注其用途、读写方和修改影响。这让 AI 在修改变量时能知道影响哪些代码路径。

## When to Use

- 定义模块级或全局变量
- 定义共享可变状态
- 定义配置对象或常量（魔法值另由 magic-value-comments 覆盖）
- 修改已有变量的类型、默认值或可变性

## Rules

### Rule 1: 模块级/类级变量必须使用 `@state` 标签族注释用途和范围

```typescript
/**
 * @state 描述该变量控制什么行为
 * @writtenBy 函数A, 函数B  — 哪些函数写入
 * @readBy    函数C, 函数D  — 哪些函数读取
 */
```

- 如果变量是可变状态，还需额外说明修改影响面（数据一致性、并发安全等）
- 配置对象和常量优先使用 [magic-value-comments](../magic-value-comments/SKILL.md)

### Rule 2: 具象命名 + 注释互补

变量名本身应尽量自文档化，注释补充命名无法表达的部分（如值的范围、单位、线程安全约束）。

## Examples

### ✅ Good

```typescript
/**
 * @state Maximum number of concurrent WebSocket connections allowed per user.
 * @readBy ConnectionManager.accept(), DashboardController.stats()
 * @writtenBy AdminPanel.updateLimits() (via config API)
 * Effect: Changing this value will disconnect excess connections immediately.
 */
let maxConnectionsPerUser: number = 10;
```

```typescript
/**
 * @state Cache of resolved DNS records keyed by hostname.
 *        TTL is 300s; entries are evicted lazily on read-after-expiry.
 * @writtenBy lookupHostname() — after each successful DNS resolution
 * @readBy lookupHostname(), getConnectionPool()
 */
const dnsCache = new Map<string, DnsRecord>();
```

### ❌ Bad

```typescript
let maxConnectionsPerUser = 10;
```

```typescript
// max connections
let maxConnectionsPerUser = 10;
```

## Auto-trigger

当定义或修改文件作用域/模块作用域的变量时自动加载此 Skill，检查是否需要补充用途与影响范围注释。

## Related Skills

- [magic-value-comments](../magic-value-comments/SKILL.md) — 常量和配置值优先使用该 Skill（当变量值不会在运行时改变时）
- [side-effect-comments](../side-effect-comments/SKILL.md) — 标注变量修改带来的副作用
