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
set LUNG_CLS_MODEL=lung_classifier_model.pth
set LUNG_CANCER_MODEL=lung_resnet50_stage1_safe.keras
set HF_BASE=https://huggingface.co/hashammubarak1/lits_tumor_model_fixed/resolve/main
set LIVER_URL=%HF_BASE%/liver_model.pth
set TUMOR_URL=%HF_BASE%/lits_tumor_model_fixed.pth
set LUNG_CLS_URL=%HF_BASE%/lung_classifier_model.pth
set LUNG_CANCER_URL=%HF_BASE%/lung_resnet50_stage1_safe.keras

:: ── Check Python version (must be 3.11) ───────────────────────
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
for /f "tokens=2 delims= " %%v in ('python --version 2^>^&1') do set PY_VER=%%v
for /f "tokens=1,2 delims=." %%a in ("%PY_VER%") do (
    set PY_MAJOR=%%a
    set PY_MINOR=%%b
)
if %PY_MINOR% gtr 11 (
    echo  ERROR: Python %PY_VER% is not supported. Python 3.11 is required.
    echo.
    echo  TensorFlow does not support Python 3.12 or 3.13 yet.
    echo  Download Python 3.11 from:
    echo    https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe
    echo  During install: check "Add Python to PATH" then click Install Now.
    echo  Then close this window and run setup.bat again.
    echo.
    pause
    exit /b 1
)
echo  [OK] Python %PY_VER% -- compatible.
echo.

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

:: Try curl with retry + resume
curl -L --retry 5 --retry-delay 3 -C - --progress-bar -o "%MODEL_DIR%\%LIVER_MODEL%" "%LIVER_URL%"
if %errorlevel% equ 0 goto :liver_done

:: Fallback to PowerShell with retry
echo  [INFO] Trying PowerShell download...
powershell -Command "& { $ProgressPreference='SilentlyContinue'; $attempts=0; do { $attempts++; try { Invoke-WebRequest -Uri '%LIVER_URL%' -OutFile '%MODEL_DIR%\%LIVER_MODEL%' -UseBasicParsing; break } catch { Write-Host \"  Retry $attempts...\"; Start-Sleep 3 } } while ($attempts -lt 5) }"
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
    goto :check_backend_env
)

echo  [DOWNLOAD] Downloading tumor model from HuggingFace (~108 MB)...
echo             This will take a few minutes depending on your internet.
echo.

:: Try curl with retry + resume
curl -L --retry 5 --retry-delay 3 -C - --progress-bar -o "%MODEL_DIR%\%TUMOR_MODEL%" "%TUMOR_URL%"
if %errorlevel% equ 0 goto :tumor_done

:: Fallback to PowerShell with retry
echo  [INFO] Trying PowerShell download...
powershell -Command "& { $ProgressPreference='SilentlyContinue'; $attempts=0; do { $attempts++; try { Invoke-WebRequest -Uri '%TUMOR_URL%' -OutFile '%MODEL_DIR%\%TUMOR_MODEL%' -UseBasicParsing; break } catch { Write-Host \"  Retry $attempts...\"; Start-Sleep 3 } } while ($attempts -lt 5) }"
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
::  LUNG CLASSIFIER  (auto-download from HuggingFace)
:: ════════════════════════════════════════════════════════════
:check_lung_cls
echo.
echo  Checking %LUNG_CLS_MODEL%...

if exist "%MODEL_DIR%\%LUNG_CLS_MODEL%" (
    echo  [SKIP] %LUNG_CLS_MODEL% already in place.
    goto :check_lung_cancer
)

echo  [DOWNLOAD] Downloading lung classifier from HuggingFace (~45 MB)...
echo             This will take a minute depending on your internet.
echo.

curl -L --retry 5 --retry-delay 3 -C - --progress-bar -o "%MODEL_DIR%\%LUNG_CLS_MODEL%" "%LUNG_CLS_URL%"
if %errorlevel% equ 0 goto :lung_cls_done

echo  [INFO] Trying PowerShell download...
powershell -Command "& { $ProgressPreference='SilentlyContinue'; $attempts=0; do { $attempts++; try { Invoke-WebRequest -Uri '%LUNG_CLS_URL%' -OutFile '%MODEL_DIR%\%LUNG_CLS_MODEL%' -UseBasicParsing; break } catch { Write-Host \"  Retry $attempts...\"; Start-Sleep 3 } } while ($attempts -lt 5) }"
if %errorlevel% equ 0 goto :lung_cls_done

echo.
echo  [ERROR] Download failed. Check your internet connection and try again.
echo.
pause
exit /b 1

:lung_cls_done
echo.
echo  [OK] %LUNG_CLS_MODEL% downloaded and installed.

:: ════════════════════════════════════════════════════════════
::  LUNG CANCER MODEL  (auto-download from HuggingFace)
:: ════════════════════════════════════════════════════════════
:check_lung_cancer
echo.
echo  Checking %LUNG_CANCER_MODEL%...

if exist "%MODEL_DIR%\%LUNG_CANCER_MODEL%" (
    echo  [SKIP] %LUNG_CANCER_MODEL% already in place.
    goto :check_backend_env
)

echo  [DOWNLOAD] Downloading lung cancer model from HuggingFace (~102 MB)...
echo             This will take a few minutes depending on your internet.
echo.

curl -L --retry 5 --retry-delay 3 -C - --progress-bar -o "%MODEL_DIR%\%LUNG_CANCER_MODEL%" "%LUNG_CANCER_URL%"
if %errorlevel% equ 0 goto :lung_cancer_done

echo  [INFO] Trying PowerShell download...
powershell -Command "& { $ProgressPreference='SilentlyContinue'; $attempts=0; do { $attempts++; try { Invoke-WebRequest -Uri '%LUNG_CANCER_URL%' -OutFile '%MODEL_DIR%\%LUNG_CANCER_MODEL%' -UseBasicParsing; break } catch { Write-Host \"  Retry $attempts...\"; Start-Sleep 3 } } while ($attempts -lt 5) }"
if %errorlevel% equ 0 goto :lung_cancer_done

echo.
echo  [ERROR] Download failed. Check your internet connection and try again.
echo.
pause
exit /b 1

:lung_cancer_done
echo.
echo  [OK] %LUNG_CANCER_MODEL% downloaded and installed.

:: ════════════════════════════════════════════════════════════
::  backend .env  (vision config)
:: ════════════════════════════════════════════════════════════
:check_backend_env
echo.
echo  Checking backend\.env...

if exist "%SCRIPT_DIR%backend\.env" (
    echo  [SKIP] backend\.env already exists.
    goto :check_env
)

echo.
echo  ────────────────────────────────────────────────────────
echo    Google Gemini API Key  (for CT scan visual validation)
echo  ────────────────────────────────────────────────────────
echo.
echo  Get your free key at:
echo    https://aistudio.google.com/app/apikey
echo.
echo  Paste your key below and press Enter.
echo  (Press Enter to skip -- the app still works without it)
echo.
set /p GEMINI_KEY=  Your Gemini API Key:

(
echo VISION_API_KEY=%GEMINI_KEY%
echo VISION_API_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
) > "%SCRIPT_DIR%backend\.env"

if "%GEMINI_KEY%"=="" (
    echo  [SKIP] No key entered -- visual CT check will be skipped automatically.
    echo         To add it later, edit backend\.env and fill in VISION_API_KEY.
) else (
    echo  [OK] backend\.env created with your Gemini API key.
)

:: ════════════════════════════════════════════════════════════
::  .env.local  (Firebase + API URL)
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
