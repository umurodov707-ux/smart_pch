@echo off
title ZKTeco Fingerprint Bridge - Smart PCH
cd /d "%~dp0"

echo ==================================================
echo   ZKTeco Biometric Hardware Bridge
echo ==================================================
echo.

:: --- NODE.JS PATH DISCOVERY (CLONED FROM SERVER STARTUP) ---
set "NODE_EXE="

:: 1. Check system path
where node >nul 2>&1
if %errorlevel% equ 0 (
    set "NODE_EXE=node"
    echo [ OK ] Node.js tizimda topildi.
    goto :run_bridge
)

:: 2. NVM
if exist "%APPDATA%\nvm" (
    for /d %%d in ("%APPDATA%\nvm\v*") do (
        if exist "%%d\node.exe" (
            set "NODE_EXE=%%d\node.exe"
            echo [ OK ] NVM Node.js topildi: %%d
            goto :run_bridge
        )
    )
)

:: 3. Program Files
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files\nodejs\node.exe"
    echo [ OK ] Node.js topildi: Program Files
    goto :run_bridge
)

:: 4. Playwright (Specific to this environment)
if exist "%LOCALAPPDATA%\ms-playwright-go\1.50.1\node.exe" (
    set "NODE_EXE=%LOCALAPPDATA%\ms-playwright-go\1.50.1\node.exe"
    echo [ OK ] Playwright Node.js topildi.
    goto :run_bridge
)

:: 5. Fail
echo.
echo ============================================
echo [XATOLIK] Node.js TOPILMADI!
echo Server ishlayotgan Node.js topilmadi.
echo ============================================
pause
exit /b 1

:run_bridge
echo.
echo [%time%] Bridge ishga tushirilmoqda (Port 8080)...
echo.
echo QURILMA BILAN BOG'LANISHDA XORIJDA...
echo Iltimos, bu oynani yopmang!
echo.

if exist "zk-bridge\Bridge.exe" (
    cd zk-bridge
    Bridge.exe
    cd ..
) else (
    "%NODE_EXE%" zk-bridge.js
)

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Bridge to'xtadi.
    pause
)
