# PowerShell script to push all changes to GitHub
param (
    [string]$message = "Update website content and configurations"
)

Write-Host ">>> Checking Git status..." -ForegroundColor Cyan
git status

Write-Host "`n>>> Staging all changes..." -ForegroundColor Cyan
git add .

Write-Host "`n>>> Committing changes with message: '$message'..." -ForegroundColor Cyan
git commit -m "$message"

Write-Host "`n>>> Pushing to GitHub (origin main)..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n>>> Successfully pushed all updates to GitHub!" -ForegroundColor Green
    Write-Host "GitHub Repository: https://github.com/nivethitha1704/sninfra" -ForegroundColor Green
} else {
    Write-Host "`n>>> Failed to push. Please check error output above." -ForegroundColor Red
}
