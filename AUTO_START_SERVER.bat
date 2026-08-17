@echo off
chcp 65001 >nul 2>&1
title SMART PCH SERVER - ALWAYS ONLINE (PORT 7007)
cd /d "%~dp0"
echo ==================================================
echo [ %date% %time% ] - Serverni ishga tushirish...
echo ==================================================

:: Node.js ni qidirish
set "NODE_EXE="

:: 1. Tizimda o'rnatilgan Node.js ni tekshirish
where node >nul 2>&1
if %errorlevel% equ 0 (
    set "NODE_EXE=node"
    echo [ OK ] Node.js tizimda topildi.
    goto :start_server
)

:: 2. NVM orqali o'rnatilgan Node.js
if exist "%APPDATA%\nvm" (
    for /d %%d in ("%APPDATA%\nvm\v*") do (
        if exist "%%d\node.exe" (
            set "NODE_EXE=%%d\node.exe"
            echo [ OK ] NVM Node.js topildi: %%d
            goto :start_server
        )
    )
)

:: 3. Program Files da Node.js
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files\nodejs\node.exe"
    echo [ OK ] Node.js topildi: Program Files
    goto :start_server
)

:: 4. Playwright node.exe (oxirgi variant)
if exist "%LOCALAPPDATA%\ms-playwright-go\1.50.1\node.exe" (
    set "NODE_EXE=%LOCALAPPDATA%\ms-playwright-go\1.50.1\node.exe"
    echo [ OK ] Playwright Node.js topildi.
    goto :start_server
)

:: 5. Hech narsa topilmadi
echo.
echo ============================================
echo [XATOLIK] Node.js TOPILMADI!
echo.
echo Node.js ni o'rnatish kerak:
echo   https://nodejs.org/en/download/
echo.
echo "LTS" versiyasini yuklab, o'rnating.
echo ============================================
echo.
pause
exit /b 1

:start_server
echo.
echo [ INFO ] Node.js: %NODE_EXE%
echo [ INFO ] Port: 7007
echo [ INFO ] Sayt adresi: http://localhost:7007
echo ==================================================

:: Avval portni tozalash
echo [ INFO ] Port 7007 ni tekshirish...
for /f "tokens=5" %%p in ('netstat -aon ^| findstr :7007 ^| findstr LISTENING 2^>nul') do (
    echo [ INFO ] Port 7007 da PID %%p topildi, o'chirilmoqda...
    taskkill /f /pid %%p >nul 2>&1
)

echo [ INFO ] Server ishga tushirilmoqda...
echo.

:loop
echo ==================================================
echo [ %date% %time% ] SERVER ISHGA TUSHMOQDA...
echo ==================================================
"%NODE_EXE%" server/index.js
set EXIT_CODE=%errorlevel%
echo.
echo ==================================================
echo [ WARNING ] Server to'xtadi! (Exit code: %EXIT_CODE%)
echo [ INFO ] 5 soniyadan so'ng qayta yuklanadi...
echo ==================================================
timeout /t 5 /nobreak >nul
goto loop
