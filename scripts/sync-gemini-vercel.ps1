# Sync GEMINI_API_KEY from .env to Vercel (Production + Preview + Development)
# Prerequisites: npx vercel login && npx vercel link (in repo root)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root '.env'

if (-not (Test-Path $envFile)) {
  Write-Error ".env not found. Copy .env.example to .env and set GEMINI_API_KEY first."
}

$line = Get-Content $envFile | Where-Object { $_ -match '^\s*GEMINI_API_KEY\s*=' } | Select-Object -First 1
if (-not $line) {
  Write-Error 'GEMINI_API_KEY not found in .env'
}

$key = ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")
$key = $key -replace '^\uFEFF', ''

if ($key -in @('', 'MY_GEMINI_API_KEY', 'your_key', 'your_gemini_api_key')) {
  Write-Error 'GEMINI_API_KEY in .env is still a placeholder. Get a key from https://aistudio.google.com/apikey'
}

Write-Host "Setting GEMINI_API_KEY on Vercel (length $($key.Length))..."
foreach ($target in @('production', 'preview', 'development')) {
  Write-Host "  -> $target"
  $key | npx vercel env add GEMINI_API_KEY $target --force
}

Write-Host 'Done. Redeploy: npx vercel --prod  (or push to main if Git-connected)'
