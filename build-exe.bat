@echo off
echo ====================================================
echo   Internet Download Manager - Windows EXE Builder   
echo ====================================================
echo.
echo Installing dependencies...
call npm install
echo.
echo Building React Application...
call npm run build
echo.
echo Packaging Windows .exe using Electron...
call npx electron-builder --win nsis
echo.
echo ====================================================
echo  SUCCESS! Your .exe installer is generated in /dist
echo ====================================================
pause
