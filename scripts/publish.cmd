@echo off
setlocal
cd /d "%~dp0.."

echo [1/4] Collecting note articles (sync:note)...
call npm.cmd run sync:note
if errorlevel 1 (
  echo.
  echo [ERROR] sync:note failed. See the message above.
  pause
  exit /b 1
)

echo.
echo [2/4] Building site (build check)...
call npm.cmd run build
if errorlevel 1 (
  echo.
  echo [ERROR] build failed. See the message above.
  pause
  exit /b 1
)

echo.
echo [3/4] Staging content (note data + dashboards/reports)...
git add data\note-links.json data\note-magazines.json data\note-hashtags.json
git add src\dashboards src\pages\data src\reports src\pages\reports

git diff --cached --quiet
if errorlevel 1 (
  echo.
  echo [4/4] Committing and pushing...
  git commit -m "Update note links and data content"
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
