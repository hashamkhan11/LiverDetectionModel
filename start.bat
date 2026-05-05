@echo off
title Liver Detection - Starting...
echo ============================================
echo    Liver Detection System - Starting
echo ============================================
echo.

echo Starting backend (AI model)...
start "Backend - AI Model" cmd /k "cd /d "%~dp0backend" && python main.py"

echo Waiting for backend to load model (30 seconds)...
timeout /t 30 /nobreak

echo Starting frontend (website)...
start "Frontend - Website" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Waiting for website to start...
timeout /t 8 /nobreak

echo Opening browser...
start http://localhost:3000

echo.
echo ============================================
echo    System is running!
echo    Website: http://localhost:3000
echo    Close both black windows to stop.
echo ============================================
