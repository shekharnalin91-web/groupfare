@echo off
title GroupFare - CORRUPTX
echo ========================================================
echo   Launching GroupFare (Team CORRUPTX - ID: d362a123)
echo ========================================================
echo.

echo [1/2] Starting Backend Server (FastAPI on Port 8000)...
start "GroupFare Backend" cmd /k "cd /d %~dp0backend && python run.py"

echo [2/2] Starting Frontend Dev Server (Vite on Port 5173)...
start "GroupFare Frontend" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

timeout /t 3 /nobreak >nul
echo.
echo Opening GroupFare in your default browser...
start http://localhost:5173

echo.
echo Both servers are running! Keep the windows open while using the app.
pause
