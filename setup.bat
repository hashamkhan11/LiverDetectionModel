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
set LIVER_URL=https://huggingface.co/hashammubarak1/lits_tumor_model_fixed/resolve/main/liver_model.pth
set TUMOR_URL=https://huggingface.co/hashammubarak1/lits_tumor_model_fixed/resolve/main/lits_tumor_model_fixed.pth

:: ── Create model folder if missing ────────────────────────────
if not exist "%MODEL_DIR%" (
    mkdir "%MODEL_DIR%"
    echo  [OK] Created model folder: backend\model\
)

:: ════════════════════════════════════════════════════════════
::  LIVER MODEL  (auto-download from HuggingFace)
:: ════════════════════════════════════════════════════════════
echo  Checking %LIVER_MODEL%...

if exist "%MODEL_DIR%\%LIVER_MODEL%" (
    echo  [SKIP] %LIVER_MODEL% already in place.
    goto :check_tumor
)

echo  [DOWNLOAD] Downloading liver model from HuggingFace (~43 MB)...
echo             This will take a minute depending on your internet.
echo.

:: Try curl first (built into Windows 10/11)
curl -L --progress-bar -o "%MODEL_DIR%\%LIVER_MODEL%" "%LIVER_URL%"
if %errorlevel% equ 0 goto :liver_done

:: Fallback to PowerShell
echo  [INFO] Trying PowerShell download...
powershell -Command "& { $ProgressPreference='Continue'; Invoke-WebRequest -Uri '%LIVER_URL%' -OutFile '%MODEL_DIR%\%LIVER_MODEL%' -UseBasicParsing }"
if %errorlevel% equ 0 goto :liver_done

:: Both failed
echo.
echo  [ERROR] Download failed. Check your internet connection and try again.
echo.
pause
exit /b 1

:liver_done
echo.
echo  [OK] %LIVER_MODEL% downloaded and installed.

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
