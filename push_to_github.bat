@echo off
title Push GroupFare to GitHub
echo ========================================================
echo   Pushing GroupFare to GitHub
echo   Repository: https://github.com/shekharnalin91-web/groupfare.git
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Git Status...
git status -s

echo.
echo [2/3] Setting Remote Origin...
git remote set-url origin https://github.com/shekharnalin91-web/groupfare.git 2>nul || git remote add origin https://github.com/shekharnalin91-web/groupfare.git

echo.
echo [3/3] Pushing to main branch...
echo (If a GitHub sign-in window appears, please authorize Git Credential Manager)
echo.
git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo   SUCCESS! GroupFare was pushed to GitHub:
    echo   https://github.com/shekharnalin91-web/groupfare
    echo ========================================================
) else (
    echo ========================================================
    echo   NOTE: If it says 'Repository not found', please make
    echo   sure you have clicked 'Create repository' on:
    echo   https://github.com/new?name=groupfare
    echo ========================================================
)

echo.
pause
