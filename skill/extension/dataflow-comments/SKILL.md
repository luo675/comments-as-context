---
name: dataflow-comments
type: comment-convention
description: Documents data flow paths — sources, processing chains, and destinations through the system. Triggers on: implementing data pipelines, ETL processes, multi-step processing chains, or cross-service data sync code.
---

# Dataflow Comments / 数据流注释

## Purpose

标注数据在系统中的流转路径——来源、处理链、去向。当 AI 修改数据处理链中的某个环节时，能通过注释看到完整的数据流，理解修改的上游输入变化和下游输出影响。

## When to Use

- 数据从输入到输出经过多个处理步骤（ETL、管道、消息链）
- 数据经过多个系统或服务之间的传输
- 存在数据转换、映射、聚合操作
- 存在缓存层导致的数据一致性风险

## Rules

### Rule 1: 数据流入口和出口必须标注

- 数据来源（API 请求、数据库查询、消息队列、文件上传）
- 最终去向（数据库写入、API 响应、文件生成、下游事件）

### Rule 2: 核心处理函数标注数据经过的步骤和变换

```typescript
// DATAFLOW: Raw order JSON → Parse → Validate → Enrich with user profile →
//           Apply promotions → Calculate totals → Persist → Emit event
```

### Rule 3: 存在分支数据流时用 `CONDITION BRANCH:` 标注条件

在 DATAFLOW 注释块内标注分支条件，或在分支发生处使用行注释：

```typescript
// CONDITION BRANCH: If --json flag is set, skip text formatting (step 4a → 4b)
```

需要说明在什么条件下数据走哪个路径。

### Rule 4: 存在缓存层时必须标注缓存策略

在 DATAFLOW 注释块内或函数头部注释中标注：

- 缓存 key 组成规则
- TTL 或失效策略
- 缓存与源数据的一致性和延迟容忍度
- Stale data 的影响范围

## Examples

### ✅ Good

```typescript
/**
 * DATAFLOW:
 *   SOURCE: api-gateway request body (JSON)
 *   STEP 1: ParseAndValidate — schema validation via Zod
 *   STEP 2: EnrichUserProfile — fetch user data from UserService (gRPC)
 *   STEP 3: CalculatePricing — apply pricing rules, promotions, tax
 *   STEP 4: BuildResponse — map internal model to API response shape
 *   SINK: HTTP 200 response + OrderConfirmed event on message bus
 *
 *  CACHING: Step 2 data is cached for 60s (user profile rarely changes).
 *           Cache key = userId. Stale data means potentially wrong pricing.
 */
async function handleOrderCheckout(req: Request, res: Response): Promise<void> { ... }
```

```typescript
/**
 * DATAFLOW: Raw log lines from stdin →
 *           1. Filter: keep only ERROR and WARN level entries
 *           2. Parse: extract [timestamp] [level] [module] message
 *           3. Aggregate: group by module, count by level
 *           4. Format: JSON output with summary stats
 *           SINK: stdout (JSON)
 *
 * CONDITION BRANCH: If --json flag is not set, step 4 outputs plain text instead.
 */
function processLogs(input: ReadStream): void { ... }
```

### ❌ Bad

```typescript
async function handleOrderCheckout(req: Request, res: Response): Promise<void> { ... }
```

```typescript
/**
 * Handles checkout request
 */
async function handleOrderCheckout(req: Request, res: Response): Promise<void> { ... }
```

## Auto-trigger

当实现数据管道、ETL 流程、多步骤处理链、或涉及跨服务数据同步的代码时自动加载此 Skill。

## Related Skills

- [side-effect-comments](../../core/side-effect-comments/SKILL.md) — 数据流中的 I/O 步骤需同时标注副作用
- [boundary-comments](../boundary-comments/SKILL.md) — 数据跨层流转需遵守架构边界
