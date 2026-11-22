<#
.SYNOPSIS
  Hollow Woods V1.5.4 - Private Owner/QA Build Generator with F9 Developer Mode
.DESCRIPTION
  Builds an isolated QA build into dist-qa/ with VITE_HOLLOW_WOODS_QA='1'.
  Sets the environment variable ONLY for the current PowerShell session/process,
  and always restores the previous environment in a finally block to prevent leaking
  into subsequent retail builds.
#>
[CmdletBinding()]
param(
  [string]$OutDir = "dist-qa",
  [switch]$Serve,
  [int]$Port = 8080
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🔨 HOLLOW WOODS V1.5.4 — PRIVATE OWNER/QA BUILD GENERATOR" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# Preserve previous environment variable value
$prevEnv = [System.Environment]::GetEnvironmentVariable("VITE_HOLLOW_WOODS_QA", "Process")

try {
  Write-Host "[1/3] Setting process-isolated QA environment: VITE_HOLLOW_WOODS_QA=1" -ForegroundColor Yellow
  [System.Environment]::SetEnvironmentVariable("VITE_HOLLOW_WOODS_QA", "1", "Process")

  Write-Host "[2/3] Compiling TypeScript & building private QA bundle to $OutDir..." -ForegroundColor Yellow
  # Run typecheck first
  & npx tsc --noEmit
  if ($LASTEXITCODE -ne 0) { throw "TypeScript typecheck failed" }

  # Build with Vite targeting isolated output directory
  & npx vite build --outDir $OutDir
  if ($LASTEXITCODE -ne 0) { throw "Vite build to $OutDir failed" }

  Write-Host "[3/3] Private QA build successfully created in $OutDir!" -ForegroundColor Green
  Write-Host "      - QA Mode: ACTIVE (F9 / Hitbox Inspector / Watermark enabled)" -ForegroundColor Green
  Write-Host "      - Save Isolation: ACTIVE (QA_SAVE_KEY: hollow_woods_qa_v1_savegame)" -ForegroundColor Green
  Write-Host "      - Progress Reporting: BLOCKED (Leaderboard submissions rejected)" -ForegroundColor Green
  Write-Host "      - Retail dist/: UNTOUCHED" -ForegroundColor Green

  if ($Serve) {
    Write-Host "`n🚀 Serving QA Build at http://127.0.0.1:$Port (Press Ctrl+C to stop)..." -ForegroundColor Cyan
    & npx http-server $OutDir -p $Port -c-1
  }
}
finally {
  # Always restore environment variable
  [System.Environment]::SetEnvironmentVariable("VITE_HOLLOW_WOODS_QA", $prevEnv, "Process")
  Write-Host "🔒 Restored VITE_HOLLOW_WOODS_QA to: '$prevEnv' (No leak to subsequent builds)" -ForegroundColor DarkGray
}
