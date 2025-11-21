param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

if (-not $FrontendOnly) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$PSScriptRoot/..`"; uvicorn backend.main:app --reload" | Out-Null
}

if (-not $BackendOnly) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"$PSScriptRoot/../frontend`"; npm run dev" | Out-Null
}
