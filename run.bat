@echo off
title MediScan AI
color 0A
cls

echo.
echo  Starting MediScan AI...
echo.

set BACKEND=%~dp0backend
set FRONTEND=%~dp0frontend

start "Backend" /d "%BACKEND%" cmd /k "python main.py"
echo  [1/2] Backend starting...

if not exist "%FRONTEND%\node_modules" (
    echo  [npm] Installing frontend packages -- first time only...
    pushd "%FRONTEND%"
    call npm install --silent
    popd
    echo  [npm] Done.
)

timeout /t 18 /nobreak > nul

start "Frontend" /d "%FRONTEND%" cmd /k "npm run dev"
echo  [2/2] Frontend starting...

timeout /t 7 /nobreak > nul

start http://localhost:3000

echo.
echo  Running at http://localhost:3000
echo  Keep both black windows open.
echo.
pause
