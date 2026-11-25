@echo off
setlocal enabledelayedexpansion

title PDF Downloader
color 0A

echo ========================================
echo       PDF Downloader
echo ========================================
echo Paste a PDF link and press Enter to download.
echo Type 'q' or 'quit' to exit.
echo ========================================
echo.

:loop
set /p url=Link: 

if /i "%url%"=="q" goto :end
if /i "%url%"=="quit" goto :end

if "%url%"=="" (
    echo.
    goto :loop
)

for %%a in ("%url%") do set "name=%%~nxa"
if "%name%"=="" set "name=downloaded.pdf"

echo Downloading...
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { try { Invoke-WebRequest -Uri '%url%' -OutFile '%name%' -TimeoutSec 30; Write-Host 'Saved:' '%name%' -ForegroundColor Green } catch { Write-Host 'ERROR:' $_.Exception.Message -ForegroundColor Red } }"
echo.

goto :loop

:end
echo Done. Closing...
