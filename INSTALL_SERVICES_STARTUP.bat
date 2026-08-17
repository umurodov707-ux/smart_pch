@echo off
title Smart PCH - Install Auto Startup
cd /d "%~dp0"
echo ==================================================
echo   Avtomatik ishga tushirish (Startup) o'rnatish
echo ==================================================
echo.

set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"

echo [ INFO ] Tizim ishga tushganda orqa fonda ishlash uchun 
echo          VBS scriptlar Windows Startup papkasiga ko'chirilmoqda.

copy START_SMART_PCH.vbs "%STARTUP_FOLDER%\" /Y
copy START_HARDWARE_SILENT.vbs "%STARTUP_FOLDER%\" /Y

echo.
if %errorlevel% equ 0 (
    echo [ OK ] O'rnatish muvaffaqiyatli yakunlandi! 
    echo Kompyuter o'chib yonganda Tizim va Hardware Bridge avtomatik ishga tushadi.
) else (
    echo [ XATO ] O'rnatishda xatolik yuz berdi. Administrator huquqi kerak bo'lishi mumkin.
)

pause
