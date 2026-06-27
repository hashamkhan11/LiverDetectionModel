@echo off
title LiverDetect AI -- Setup
color 0B
cls

echo.
echo  ============================================
echo    LiverDetect AI -- First-Time Setup
echo  ============================================
echo.

:: ── Paths ─────────────────────────────────────────────────────
set SCRIPT_DIR=%~dp0
set MODEL_DIR=%~dp0backend\model
set LIVER_MODEL=liver_model.pth
set TUMOR_MODEL=lits_tumor_model_fixed.pth

:: ── Create model folder if missing ────────────────────────────
if not exist "%MODEL_DIR%" (
    mkdir "%MODEL_DIR%"
    echo  [OK] Created model folder: backend\model\
)

:: ════════════════════════════════════════════════════════════
::  LIVER MODEL
:: ════════════════════════════════════════════════════════════
echo  Checking %LIVER_MODEL%...

if exist "%MODEL_DIR%\%LIVER_MODEL%" (
    echo  [SKIP] %LIVER_MODEL% already in place.
    goto :check_tumor
)

:: Search locations for liver model
set FOUND_LIVER=

:: 1. Same folder as setup.bat
if exist "%SCRIPT_DIR%%LIVER_MODEL%" (
    set FOUND_LIVER=%SCRIPT_DIR%%LIVER_MODEL%
    goto :copy_liver
)

:: 2. models\ subfolder next to setup.bat
if exist "%SCRIPT_DIR%models\%LIVER_MODEL%" (
    set FOUND_LIVER=%SCRIPT_DIR%models\%LIVER_MODEL%
    goto :copy_liver
)

:: 3. Desktop
if exist "%USERPROFILE%\Desktop\%LIVER_MODEL%" (
    set FOUND_LIVER=%USERPROFILE%\Desktop\%LIVER_MODEL%
    goto :copy_liver
)

:: 4. Downloads
if exist "%USERPROFILE%\Downloads\%LIVER_MODEL%" (
    set FOUND_LIVER=%USERPROFILE%\Downloads\%LIVER_MODEL%
    goto :copy_liver
)

:: 5. OneDrive Desktop
if exist "%USERPROFILE%\OneDrive\Desktop\%LIVER_MODEL%" (
    set FOUND_LIVER=%USERPROFILE%\OneDrive\Desktop\%LIVER_MODEL%
    goto :copy_liver
)

:: Not found -- ask user
echo.
echo  [!] %LIVER_MODEL% not found automatically.
echo.
echo  Please paste the full path to %LIVER_MODEL% below.
echo  Example: C:\Users\Mahnoor\Downloads\liver_model.pth
echo.
set /p FOUND_LIVER=  Path:

if not exist "%FOUND_LIVER%" (
    echo.
    echo  [ERROR] File not found at: %FOUND_LIVER%
    echo  Make sure the path is correct and try again.
    echo.
    pause
    exit /b 1
)

:copy_liver
echo  [COPY] Copying %LIVER_MODEL% to backend\model\...
copy /Y "%FOUND_LIVER%" "%MODEL_DIR%\%LIVER_MODEL%" >nul
if %errorlevel% neq 0 (
    echo  [ERROR] Failed to copy %LIVER_MODEL%.
    pause
    exit /b 1
)
echo  [OK] %LIVER_MODEL% installed.

:: ════════════════════════════════════════════════════════════
::  TUMOR MODEL
:: ════════════════════════════════════════════════════════════
:check_tumor
echo.
echo  Checking %TUMOR_MODEL%...

if exist "%MODEL_DIR%\%TUMOR_MODEL%" (
    echo  [SKIP] %TUMOR_MODEL% already in place.
    goto :check_env
)

set FOUND_TUMOR=

:: 1. Same folder as setup.bat
if exist "%SCRIPT_DIR%%TUMOR_MODEL%" (
    set FOUND_TUMOR=%SCRIPT_DIR%%TUMOR_MODEL%
    goto :copy_tumor
)

:: 2. models\ subfolder
if exist "%SCRIPT_DIR%models\%TUMOR_MODEL%" (
    set FOUND_TUMOR=%SCRIPT_DIR%models\%TUMOR_MODEL%
    goto :copy_tumor
)

:: 3. Desktop
if exist "%USERPROFILE%\Desktop\%TUMOR_MODEL%" (
    set FOUND_TUMOR=%USERPROFILE%\Desktop\%TUMOR_MODEL%
    goto :copy_tumor
)

:: 4. Downloads
if exist "%USERPROFILE%\Downloads\%TUMOR_MODEL%" (
    set FOUND_TUMOR=%USERPROFILE%\Downloads\%TUMOR_MODEL%
    goto :copy_tumor
)

:: 5. OneDrive Desktop
if exist "%USERPROFILE%\OneDrive\Desktop\%TUMOR_MODEL%" (
    set FOUND_TUMOR=%USERPROFILE%\OneDrive\Desktop\%TUMOR_MODEL%
    goto :copy_tumor
)

:: Not found -- ask user
echo.
echo  [!] %TUMOR_MODEL% not found automatically.
echo.
echo  Please paste the full path to %TUMOR_MODEL% below.
echo  Example: C:\Users\Mahnoor\Downloads\lits_tumor_model_fixed.pth
echo.
set /p FOUND_TUMOR=  Path:

if not exist "%FOUND_TUMOR%" (
    echo.
    echo  [ERROR] File not found at: %FOUND_TUMOR%
    echo  Make sure the path is correct and try again.
    echo.
    pause
    exit /b 1
)

:copy_tumor
echo  [COPY] Copying %TUMOR_MODEL% to backend\model\...
copy /Y "%FOUND_TUMOR%" "%MODEL_DIR%\%TUMOR_MODEL%" >nul
if %errorlevel% neq 0 (
    echo  [ERROR] Failed to copy %TUMOR_MODEL%.
    pause
    exit /b 1
)
echo  [OK] %TUMOR_MODEL% installed.

:: ════════════════════════════════════════════════════════════
::  .env.local CHECK
:: ════════════════════════════════════════════════════════════
:check_env
echo.
echo  Checking .env.local...

if exist "%SCRIPT_DIR%frontend\.env.local" (
    echo  [SKIP] .env.local already exists.
    goto :done
)

if exist "%SCRIPT_DIR%frontend\.env.local.example" (
    copy "%SCRIPT_DIR%frontend\.env.local.example" "%SCRIPT_DIR%frontend\.env.local" >nul
    echo  [OK] Created .env.local from example -- fill in your Firebase keys.
) else (
    echo  [WARN] frontend\.env.local is missing.
    echo         Create it with your Firebase config before running the app.
)

:: ════════════════════════════════════════════════════════════
::  DONE
:: ════════════════════════════════════════════════════════════
:done
echo.
echo  ============================================
echo    Setup complete!
echo.
echo    Both AI models are in place.
echo    Now double-click run.bat to start the app.
echo  ============================================
echo.
pause
