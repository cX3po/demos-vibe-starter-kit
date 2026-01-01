@echo off
REM Demos Vibe Starter Kit - Installation Script (Windows)
REM This script automates the installation process

echo.
echo ==========================================
echo   🚀 Demos Vibe Starter Kit Installer
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed!
    echo.
    echo Please install Node.js v16 or higher from:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1 delims=." %%i in ('node -v') do set NODE_MAJOR=%%i
set NODE_MAJOR=%NODE_MAJOR:v=%

if %NODE_MAJOR% LSS 16 (
    echo ❌ Node.js version is too old!
    echo Current version:
    node -v
    echo Required: v16 or higher
    echo.
    echo Please update Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected
node -v
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm is not installed!
    pause
    exit /b 1
)

echo ✅ npm detected
npm -v
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo ✅ Dependencies installed successfully!
) else (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   🎉 Installation Complete!
echo ==========================================
echo.
echo Next steps:
echo   1. Run 'npm run setup' to configure your environment
echo   2. Run 'npm start' to launch the interactive menu
echo   3. Or run 'npm run hello' for your first Demos connection
echo.
echo Need help? Check out the docs\ folder or README.md
echo.
echo Happy vibe coding! 🚀
echo.
pause
