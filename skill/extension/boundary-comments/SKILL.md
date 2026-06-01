---
name: boundary-comments
type: comment-convention
description: Marks code's architectural layer, dependency direction, and forbidden crossing boundaries in multi-module projects. Triggers on: creating or modifying files on layer boundaries in layered architecture or multi-module projects.
---

# Boundary Comments / 边界注释

## Purpose

在多模块、多层架构的项目中标注当前代码所属的层级、依赖方向以及禁止跨越的边界。当 AI 修改代码时，边界注释能防止违反架构约束，比如在数据访问层直接调用 UI 组件，或者在基础设施层引入业务逻辑。

## When to Use

- 分层架构（Controller / Service / Repository 等）
- 六边形架构 / 整洁架构（Domain / Application / Infrastructure 各层）
- 模块化单体或微服务之间的边界
- 有禁止逆向依赖的模块

## Rules

### Rule 1: 每层入口文件（或关键文件）标注层级和依赖方向

```typescript
// LAYER: application/service
// DEPENDS ON: domain/ — can NOT depend on infrastructure/ or presentation/
```

### Rule 2: 在跨层调用的地方标注是否允许

使用以下格式标注：

- 允许的跨层调用：`// CROSS-LAYER: allowed — <reason>`
- 禁止的跨层调用：`// CROSS-LAYER: DENIED — <violation description>`

例如在 Repository 中调用另一个 Repository 是允许的，但 Service 直接调用另一个 Service 的 Repository 则是不允许的越界：

```typescript
// CROSS-LAYER: allowed — Service → Repository via DI interface
// CROSS-LAYER: DENIED — Presentation layer must not import Infrastructure directly
```

### Rule 3: 存在依赖方向例外时必须标注原因

```typescript
// EXCEPTION: This domain event handler needs to trigger email dispatch.
// This is allowed via domain events (inversion of control), NOT direct dependency.
```

## Examples

### ✅ Good

```typescript
// LAYER: infrastructure/repository
// DEPENDS ON: domain/ entities and repository interfaces
// DEPENDENCY RULE: Must NOT depend on application/ or presentation/
//                  Return domain entities only (not ORM models).
export class PostgresUserRepository implements UserRepository { ... }
```

```typescript
// LAYER: presentation/controller
// DEPENDS ON: application/ (service layer only)
// DEPENDENCY RULE: Must NOT import from infrastructure/ directly.
//                  Use dependency injection provided by the framework.
@Controller('/api/users')
export class UserController { ... }
```

### ❌ Bad

```typescript
// LAYER: user module
class UserController {
  async getUser(id: string): Promise<User> {
    return PostgresUserRepository.findById(id);
  }
}
```

The layer annotation "user module" is too vague — it doesn't specify the architectural tier (presentation/application/domain/infrastructure) or dependency direction. An AI reading this has no way to know that `UserController` is in the presentation layer and must NOT directly call `PostgresUserRepository` in the infrastructure layer. Violation of dependency rule: UI → Service → Repository.

## Auto-trigger

在分层架构或多模块项目中，创建或修改位于层边界上的文件时自动加载此 Skill。

## Related Skills

- [dependency-comments](../../core/dependency-comments/SKILL.md) — 跨层调用的 callers/callees 需遵守边界规则
- [invariant-comments](../../core/invariant-comments/SKILL.md) — 架构约束是不变量的一种

## Checklist

- [ ] Frontmatter (name, type, description) is present?
- [ ] Description includes trigger conditions ("Triggers on: ...")?
- [ ] Contains at least one ✅ Good and one ❌ Bad example?
- [ ] File does not exceed 500 lines?
- [ ] @tags used in examples match the rules defined above?
- [ ] Chinese description of auto-trigger conditions is included?
