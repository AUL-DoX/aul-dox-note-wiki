@echo off
setlocal
cd /d "%~dp0"
echo AUL DoX 管理画面サーバーを起動します...
echo ブラウザで http://127.0.0.1:4455/ を開いてください。
echo 終了するときはこのウィンドウで Ctrl+C を押してください。
echo.
call npm.cmd run admin
pause
endlocal
