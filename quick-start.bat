@echo off
REM NUT HID GUI - Quick Start Script

echo ============================================
echo  NUT HID Configurator - Quick Start
echo ============================================
echo.

REM Check if Rust is installed
where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Rust/Cargo not found!
    echo Please install Rust from https://rustup.rs/
    echo.
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [INFO] Checking prerequisites...
echo.

REM Check if driver is installed
echo [INFO] Checking if nut_hid driver is installed...
pnputil /enum-drivers | findstr /i "nut_hid" >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARN] nut_hid driver not found!
    echo.
    echo Please install the driver first:
    echo   cd ..\nut_hid_driver
    echo   pnputil.exe /add-driver nut_hid_driver.inf /install
    echo.
    set /p install="Would you like to try installing now? (Y/N): "
    if /i "%install%"=="Y" (
        cd ..\nut_hid_driver
        pnputil.exe /add-driver nut_hid_driver.inf /install
        cd ..\nut_hid_gui
    )
) else (
    echo [OK] nut_hid driver is installed
)

echo.
echo [INFO] Building application...
echo.

REM Build in release mode
cargo tauri build

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed!
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo [OK] Build completed successfully!
echo.
echo The installer can be found in:
echo   target\release\bundle\msi\
echo   target\release\bundle\nsis\
echo.
echo Or run in development mode with:
echo   cargo tauri dev
echo.
pause
