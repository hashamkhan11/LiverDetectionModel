@echo off
title LiverDetect AI
color 0A
cls

echo.
echo  ============================================
echo    LiverDetect AI -- Two-Stage Pipeline
echo  ============================================
echo.

:: ── Set paths ────────────────────────────────────────────────
set BACKEND=%~dp0backend
set FRONTEND=%~dp0frontend

:: ── Check Python ─────────────────────────────────────────────
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Python is not installed.
    echo  Download Python 3.11 from:
    echo    https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe
    echo  During install: check "Add Python to PATH" then click Install Now.
    echo.
    pause
    exit /b 1
)

:: ── Check Python version (must be 3.9 to 3.11) ────────────────
for /f "tokens=2 delims= " %%v in ('python --version 2^>^&1') do set PY_VER=%%v
for /f "tokens=1,2 delims=." %%a in ("%PY_VER%") do (
    set PY_MAJOR=%%a
    set PY_MINOR=%%b
)
if %PY_MAJOR% neq 3 (
    echo  ERROR: Python 3.11 is required. You have Python %PY_VER%.
    echo  Download Python 3.11 from:
    echo    https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe
    echo.
    pause
    exit /b 1
)
if %PY_MINOR% gtr 11 (
    echo  ERROR: Python %PY_VER% is not supported. Python 3.11 is required.
    echo.
    echo  TensorFlow does not support Python 3.12 or 3.13 yet.
    echo  Download Python 3.11 from:
    echo    https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe
    echo  During install: check "Add Python to PATH" then click Install Now.
    echo  Then close this window and run again.
    echo.
    pause
    exit /b 1
)

:: ── Check Node.js ─────────────────────────────────────────────
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Node.js is not installed.
    echo  Download from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: ── Check model files ─────────────────────────────────────────
if not exist "%BACKEND%\model\liver_model.pth" (
    echo  ERROR: liver_model.pth is missing.
    echo  Place it in: %BACKEND%\model\
    echo.
    pause
    exit /b 1
)

if not exist "%BACKEND%\model\lits_tumor_model_fixed.pth" (
    echo  ERROR: lits_tumor_model_fixed.pth is missing.
    echo  Place it in: %BACKEND%\model\
    echo.
    pause
    exit /b 1
)

:: ── Check .env.local ──────────────────────────────────────────
if not exist "%FRONTEND%\.env.local" (
    echo  ERROR: frontend\.env.local file is missing.
    echo  Copy .env.local.example to .env.local and fill in your Firebase keys.
    echo.
    pause
    exit /b 1
)

:: ── Install backend dependencies (fast if already installed) ──
echo  [1/3] Checking Python packages...
pip install -r "%BACKEND%\requirements.txt" -q --disable-pip-version-check --timeout 300 --retries 5
if %errorlevel% neq 0 (
    echo  ERROR: Failed to install Python packages.
    pause
    exit /b 1
)
echo        Done.

:: ── Install frontend dependencies (only if node_modules missing)
echo  [2/3] Checking Node packages...
if not exist "%FRONTEND%\node_modules" (
    echo        Installing for the first time, please wait...
    cd /d "%FRONTEND%"
    call npm install --silent
    if %errorlevel% neq 0 (
        echo  ERROR: npm install failed.
        pause
        exit /b 1
    )
)
echo        Done.

:: ── Start backend ─────────────────────────────────────────────
echo  [3/3] Starting backend and frontend...
start "LiverDetect - Backend (do not close)" /d "%BACKEND%" cmd /k "python main.py"

:: ── Wait for models to load ───────────────────────────────────
echo.
echo  Loading AI models -- please wait about 20 seconds...
timeout /t 20 /nobreak > nul

:: ── Start frontend ────────────────────────────────────────────
start "LiverDetect - Frontend (do not close)" /d "%FRONTEND%" cmd /k "npm run dev"
timeout /t 8 /nobreak > nul

:: ── Open browser ──────────────────────────────────────────────
start http://localhost:3000

echo.
echo  ============================================
echo    System is running!
echo    Website: http://localhost:3000
echo.
echo    Keep both black windows open.
echo    Close them when done.
echo  ============================================
echo.
pause
