<#
.SYNOPSIS
    Install comments-as-context skills to ~/.claude/skills/
.DESCRIPTION
    Copies SKILL.md files from the repository to the user's
    ~/.claude/skills/ directory, then outputs a CLAUDE.md config snippet
    for auto-trigger rules.
.PARAMETER Core
    Install core skills only.
.PARAMETER Extension
    Install extension skills only.
.EXAMPLE
    .\install.ps1              # install all skills
    .\install.ps1 -Core        # core skills only
    .\install.ps1 -Extension   # extension skills only
#>

param(
    [switch]$Core,
    [switch]$Extension
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$SkillSource = Join-Path $ProjectRoot "skill"
$SkillTarget = Join-Path $env:USERPROFILE ".claude" "skills"

# Determine scope
if (-not $Core -and -not $Extension) {
    $Core = $true
    $Extension = $true
}

# Ensure target exists
New-Item -ItemType Directory -Path $SkillTarget -Force | Out-Null

$InstalledCore = @()
$InstalledExtension = @()

function Install-Skill {
    param([string]$SetName, [string]$SkillName)

    $src = Join-Path $SkillSource $SetName $SkillName "SKILL.md"
    $dst = Join-Path $SkillTarget $SkillName "SKILL.md"

    if (-not (Test-Path $src)) {
        Write-Host "⚠  SKILL.md not found: $src" -ForegroundColor Yellow
        return
    }

    $dstDir = Split-Path $dst -Parent
    New-Item -ItemType Directory -Path $dstDir -Force | Out-Null
    Copy-Item -Path $src -Destination $dst -Force
    Write-Host "✓  Installed  $SkillName  →  $dst" -ForegroundColor Green

    if ($SetName -eq "core") {
        $script:InstalledCore += $SkillName
    } else {
        $script:InstalledExtension += $SkillName
    }
}

Write-Host ""
Write-Host "  comments-as-context — Installer" -ForegroundColor Cyan
Write-Host "  ───────────────────────────────" -ForegroundColor Cyan
Write-Host ""

if ($Core) {
    Write-Host "  📦 Core skills:" -ForegroundColor Yellow
    Get-ChildItem (Join-Path $SkillSource "core") -Directory | ForEach-Object {
        Install-Skill "core" $_.Name
    }
    Write-Host ""
}

if ($Extension) {
    Write-Host "  📦 Extension skills:" -ForegroundColor Gray
    Get-ChildItem (Join-Path $SkillSource "extension") -Directory | ForEach-Object {
        Install-Skill "extension" $_.Name
    }
    Write-Host ""
}

Write-Host "  ✅  Installation complete!" -ForegroundColor Green
Write-Host ""

# Output CLAUDE.md config snippet
Write-Host "  ─────────────────────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host "  📋  CLAUDE.md — Auto-trigger Rules" -ForegroundColor Cyan
Write-Host "  ─────────────────────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Copy the block below into your project's CLAUDE.md:"
Write-Host ""

if ($Core) {
    Write-Host "  ## Auto-trigger Rules (Core)"
    Write-Host "  | When I... | Load this skill |"
    Write-Host "  |-----------|-----------------|"
    @(
        @("Creating/editing files", "file-header-comments"),
        @("Writing functions/classes/methods", "function-block-comments"),
        @("Writing complex logic lines", "line-comments"),
        @("Defining variables", "variable-annotation"),
        @("Detecting side effects", "side-effect-comments"),
        @("Functions with caller/callee relationships", "dependency-comments"),
        @("Invariants or constraints exist", "invariant-comments"),
        @("Defining constants/config", "magic-value-comments")
    ) | ForEach-Object {
        Write-Host "  | $($_[0]) | ``$($_[1])`` |"
    }
}

if ($Extension) {
    Write-Host ""
    Write-Host "  ## Auto-trigger Rules (Extension)"
    Write-Host "  # Uncomment skills you need:"
    Write-Host "  # | When I... | Load this skill |"
    Write-Host "  # |-----------|-----------------|"
    @(
        @("Cross-layer code in multi-module projects", "boundary-comments"),
        @("Complex data flow scenarios", "dataflow-comments"),
        @("Technical decisions or special design", "decision-comments"),
        @("Boundary/error path handling", "edge-case-comments"),
        @("Refactoring/deprecating code", "deprecation-migration-comments"),
        @("After modifying implementation", "related-test-comments"),
        @("Defining interfaces or complex types", "type-interface-comments")
    ) | ForEach-Object {
        Write-Host "  # | $($_[0]) | ``$($_[1])`` |"
    }
}

Write-Host ""
Write-Host "  ─────────────────────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host ""
