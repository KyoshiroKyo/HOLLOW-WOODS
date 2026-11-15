@echo off
chcp 65001 >nul
title HOLLOW WOODS V1.2 - Playtest Launcher

echo ========================================================
echo   HOLLOW WOODS V1.2 - DỊ CẢNH RỪNG LIỄU
echo   Khởi động máy chủ chơi thử nghiệm nội bộ...
echo ========================================================
echo.

cd /d "%~dp0"

:: 1. Kiem tra Python
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Dang khoi dong may chu bang Python...
    start http://localhost:8080/
    python -m http.server 8080
    exit /b
)

:: 2. Kiem tra py launcher
where py >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Dang khoi dong may chu bang Python Launcher...
    start http://localhost:8080/
    py -m http.server 8080
    exit /b
)

:: 3. Kiem tra npx (Node.js)
where npx >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [OK] Dang khoi dong may chu bang Node serve...
    start http://localhost:8080/
    npx serve -l 8080 -s .
    exit /b
)

:: 4. Mac dinh tren moi may tinh Windows (PowerShell HttpListener tich hop)
echo [OK] Dang khoi dong may chu tich hop Windows PowerShell...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080
pause
