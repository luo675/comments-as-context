#!/usr/bin/env bash
#
# install.sh — Install comments-as-context skills to ~/.claude/skills/
#
# Usage:
#   ./install.sh              # install all skills
#   ./install.sh --core       # install core skills only
#   ./install.sh --extension  # install extension skills only
#
# This script also outputs a CLAUDE.md configuration snippet that you
# can copy into your project's CLAUDE.md for auto-trigger rules.
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SKILL_SOURCE="$PROJECT_ROOT/skill"
SKILL_TARGET="${HOME}/.claude/skills"

# Defaults
CORE=false
EXTENSION=false

# Parse arguments
for arg in "$@"; do
  case "$arg" in
    --core|-c)    CORE=true ;;
    --extension|-e) EXTENSION=true ;;
    --all|-a)     CORE=true; EXTENSION=true ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Install comments-as-context skills to ~/.claude/skills/"
      echo ""
      echo "Options:"
      echo "  --core, -c        Install core skills only"
      echo "  --extension, -e   Install extension skills only"
      echo "  --all, -a         Install all skills (default)"
      echo "  --help, -h        Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: $0 [--core|--extension|--all|--help]"
      exit 1
      ;;
  esac
done

# If no flags specified, install all
if [ "$CORE" = false ] && [ "$EXTENSION" = false ]; then
  CORE=true
  EXTENSION=true
fi

# Create target directory
mkdir -p "$SKILL_TARGET"

# Track what we installed
INSTALLED_CORE=()
INSTALLED_EXTENSION=()

# Install function — copies SKILL.md from source to target
install_skill() {
  local set_name="$1"       # "core" or "extension"
  local skill_name="$2"
  local src="$SKILL_SOURCE/$set_name/$skill_name/SKILL.md"
  local dst="$SKILL_TARGET/$skill_name/SKILL.md"

  if [ ! -f "$src" ]; then
    echo "⚠  SKILL.md not found: $src"
    return
  fi

  mkdir -p "$(dirname "$dst")"
  cp "$src" "$dst"
  echo "✓  Installed  $skill_name  →  $dst"

  if [ "$set_name" = "core" ]; then
    INSTALLED_CORE+=("$skill_name")
  else
    INSTALLED_EXTENSION+=("$skill_name")
  fi
}

echo ""
echo "  comments-as-context — Installer"
echo "  ───────────────────────────────"
echo ""

# Install core skills
if [ "$CORE" = true ]; then
  echo "  📦 Core skills:"
  for skill_dir in "$SKILL_SOURCE/core/"*/; do
    skill_name="$(basename "$skill_dir")"
    install_skill "core" "$skill_name"
  done
  echo ""
fi

# Install extension skills
if [ "$EXTENSION" = true ]; then
  echo "  📦 Extension skills:"
  for skill_dir in "$SKILL_SOURCE/extension/"*/; do
    skill_name="$(basename "$skill_dir")"
    install_skill "extension" "$skill_name"
  done
  echo ""
fi

echo "  ✅  Installation complete!"
echo ""

# --- Output CLAUDE.md config snippet ---
echo "  ─────────────────────────────────────────────────────────────"
echo "  📋  CLAUDE.md — Auto-trigger Rules"
echo "  ─────────────────────────────────────────────────────────────"
echo ""
echo "  Copy the block below into your project's CLAUDE.md:"
echo ""

if [ "$CORE" = true ]; then
  echo "  ## Auto-trigger Rules (Core)"
  echo "  | When I... | Load this skill |"
  echo "  |-----------|-----------------|"
  echo "  | Creating/editing files | \`file-header-comments\` |"
  echo "  | Writing functions/classes/methods | \`function-block-comments\` |"
  echo "  | Writing complex logic lines | \`line-comments\` |"
  echo "  | Defining variables | \`variable-annotation\` |"
  echo "  | Detecting side effects | \`side-effect-comments\` |"
  echo "  | Functions with caller/callee relationships | \`dependency-comments\` |"
  echo "  | Invariants or constraints exist | \`invariant-comments\` |"
  echo "  | Defining constants/config | \`magic-value-comments\` |"
fi

if [ "$EXTENSION" = true ]; then
  echo ""
  echo "  ## Auto-trigger Rules (Extension)"
  echo "  # Uncomment skills you need:"
  echo "  # | When I... | Load this skill |"
  echo "  # |-----------|-----------------|"
  echo "  # | Cross-layer code in multi-module projects | \`boundary-comments\` |"
  echo "  # | Complex data flow scenarios | \`dataflow-comments\` |"
  echo "  # | Technical decisions or special design | \`decision-comments\` |"
  echo "  # | Boundary/error path handling | \`edge-case-comments\` |"
  echo "  # | Refactoring/deprecating code | \`deprecation-migration-comments\` |"
  echo "  # | After modifying implementation | \`related-test-comments\` |"
  echo "  # | Defining interfaces or complex types | \`type-interface-comments\` |"
fi

echo ""
echo "  ─────────────────────────────────────────────────────────────"
echo ""
