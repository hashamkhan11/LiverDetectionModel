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
set TUMOR_URL=https://huggingface.co/hashammubarak1/lits_tumor_model_fixed/resolve/main/lits_tumor_model_fixed.pth

:: ── Create model folder if missing ────────────────────────────
if not exist "%MODEL_DIR%" (
    mkdir "%MODEL_DIR%"
    echo  [OK] Created model folder: backend\model\
)

:: ════════════════════════════════════════════════════════════
::  LIVER MODEL  (manual -- rename your file to liver_model.pth)
:: ════════════════════════════════════════════════════════════
echo  Checking %LIVER_MODEL%...

if exist "%MODEL_DIR%\%LIVER_MODEL%" (
    echo  [SKIP] %LIVER_MODEL% already in place.
    goto :check_tumor
)

:: Search common locations
set FOUND_LIVER=

if exist "%SCRIPT_DIR%%LIVER_MODEL%"                       set FOUND_LIVER=%SCRIPT_DIR%%LIVER_MODEL%
if exist "%SCRIPT_DIR%models\%LIVER_MODEL%"               set FOUND_LIVER=%SCRIPT_DIR%models\%LIVER_MODEL%
if exist "%USERPROFILE%\Desktop\%LIVER_MODEL%"            set FOUND_LIVER=%USERPROFILE%\Desktop\%LIVER_MODEL%
if exist "%USERPROFILE%\Downloads\%LIVER_MODEL%"          set FOUND_LIVER=%USERPROFILE%\Downloads\%LIVER_MODEL%
if exist "%USERPROFILE%\OneDrive\Desktop\%LIVER_MODEL%"   set FOUND_LIVER=%USERPROFILE%\OneDrive\Desktop\%LIVER_MODEL%

if not "%FOUND_LIVER%"=="" goto :copy_liver

:: Not found -- ask user
echo.
echo  [!] %LIVER_MODEL% not found automatically.
echo.
echo  Rename your 42 MB model file to:  liver_model.pth
echo  Then place it next to setup.bat and press any key,
echo  OR paste the full file path below and press Enter.
echo.
set /p FOUND_LIVER=  Path (or press Enter after placing file):

if "%FOUND_LIVER%"=="" set FOUND_LIVER=%SCRIPT_DIR%%LIVER_MODEL%

if not exist "%FOUND_LIVER%" (
    echo.
    echo  [ERROR] File not found. Place liver_model.pth next to setup.bat and run again.
    echo.
    pause
    exit /b 1
)

:copy_liver
echo  [COPY] Installing %LIVER_MODEL%...
copy /Y "%FOUND_LIVER%" "%MODEL_DIR%\%LIVER_MODEL%" >nul
if %errorlevel% neq 0 (
    echo  [ERROR] Failed to copy %LIVER_MODEL%.
    pause
    exit /b 1
)
echo  [OK] %LIVER_MODEL% installed.

:: ════════════════════════════════════════════════════════════
::  TUMOR MODEL  (auto-download from HuggingFace)
:: ════════════════════════════════════════════════════════════
:check_tumor
echo.
echo  Checking %TUMOR_MODEL%...

if exist "%MODEL_DIR%\%TUMOR_MODEL%" (
    echo  [SKIP] %TUMOR_MODEL% already in place.
    goto :check_env
)

echo  [DOWNLOAD] Downloading tumor model from HuggingFace (~108 MB)...
echo             This will take a few minutes depending on your internet.
echo.

:: Try curl first (built into Windows 10/11)
curl -L --progress-bar -o "%MODEL_DIR%\%TUMOR_MODEL%" "%TUMOR_URL%"
if %errorlevel% equ 0 goto :tumor_done

:: Fallback to PowerShell
echo  [INFO] Trying PowerShell download...
powershell -Command "& { $ProgressPreference='Continue'; Invoke-WebRequest -Uri '%TUMOR_URL%' -OutFile '%MODEL_DIR%\%TUMOR_MODEL%' -UseBasicParsing }"
if %errorlevel% equ 0 goto :tumor_done

:: Both failed
echo.
echo  [ERROR] Download failed. Check your internet connection and try again.
echo          Or manually place %TUMOR_MODEL% next to setup.bat.
echo.
pause
exit /b 1

:tumor_done
echo.
echo  [OK] %TUMOR_MODEL% downloaded and installed.

:: ════════════════════════════════════════════════════════════
::  .env.local
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
    echo  [OK] Created .env.local automatically.
) else (
    echo  [WARN] frontend\.env.local is missing. Create it before running the app.
)

:: ════════════════════════════════════════════════════════════
::  DONE
:: ════════════════════════════════════════════════════════════
:done
echo.
echo  ============================================
echo    Setup complete!
echo.
echo    Now double-click run.bat to start the app.
echo  ============================================
echo.
pause
