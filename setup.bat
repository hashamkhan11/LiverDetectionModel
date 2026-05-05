@echo off
title Liver Detection - First Time Setup
echo ============================================
echo    Liver Detection System - Setup
echo ============================================
echo.
echo Step 1: Installing Python backend dependencies...
echo This may take 5-10 minutes (downloading PyTorch)
echo Please wait...
echo.
cd /d "%~dp0backend"
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo ERROR: pip install failed. Make sure Python is installed.
    pause
    exit /b 1
)
echo.
echo Step 2: Setting up frontend...
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed. Make sure Node.js is installed.
    pause
    exit /b 1
)
echo.
echo Step 3: Creating environment file...
if not exist ".env.local" (
    copy ".env.local.example" ".env.local"
    echo Created .env.local
) else (
    echo .env.local already exists, skipping.
)
echo.
echo ============================================
echo    Setup Complete!
echo    Now double-click start.bat to run.
echo ============================================
pause
