# comments-as-context — CLAUDE.md Configuration Template
#
# Copy this file into your project's CLAUDE.md to enable
# auto-trigger rules for comment convention skills.
#
# Core skills (8) are recommended for daily use.
# Extension skills (7) are for large projects — uncomment as needed.
#
# ─────────────────────────────────────────────────────────────

## Auto-trigger Rules

### Core (always active)

| When I... | Load this skill |
|-----------|-----------------|
| Creating/editing files | `file-header-comments` |
| Writing functions/classes/methods | `function-block-comments` |
| Writing complex logic lines | `line-comments` |
| Defining variables | `variable-annotation` |
| Detecting side effects | `side-effect-comments` |
| Functions with caller/callee relationships | `dependency-comments` |
| Invariants or constraints exist | `invariant-comments` |
| Defining constants/config | `magic-value-comments` |

### Extension (opt-in, uncomment as needed)

<!--
| When I... | Load this skill |
|-----------|-----------------|
| Cross-layer code in multi-module projects | `boundary-comments` |
| Complex data flow scenarios | `dataflow-comments` |
| Technical decisions or special design | `decision-comments` |
| Boundary/error path handling | `edge-case-comments` |
| Refactoring/deprecating code | `deprecation-migration-comments` |
| After modifying implementation | `related-test-comments` |
| Defining interfaces or complex types | `type-interface-comments` |
-->

# ─────────────────────────────────────────────────────────────
# Quick reference: https://github.com/<your-org>/comments-as-context
