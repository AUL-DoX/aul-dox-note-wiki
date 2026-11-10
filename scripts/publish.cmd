@echo off
setlocal
cd /d "%~dp0.."

echo [1/3] Building site (build check)...
call npm.cmd run build
if errorlevel 1 (
  echo.
  echo [ERROR] build failed. See the message above.
  pause
  exit /b 1
)

echo.
echo [2/3] Staging content (Reference analysis articles + dashboards/reports)...
git add src\content\analysis
git add src\dashboards src\pages\data src\reports src\pages\reports src\data-titles.json

git diff --cached --quiet
if errorlevel 1 (
  echo.
  echo [3/3] Committing and pushing...
  git commit -m "Update Reference analysis articles and data content"
  git push
  if errorlevel 1 (
    echo.
    echo [ERROR] git push failed. See the message above.
    pause
    exit /b 1
  )
  echo.
  echo Done. ref.aul-dox.jp will update after Vercel finishes building.
) else (
  echo.
  echo Nothing new to publish.
)

pause
endlocal
