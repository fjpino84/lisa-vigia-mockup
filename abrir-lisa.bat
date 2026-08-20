@echo off
REM ---------------------------------------------------------------
REM  LISA vigIA - Lanzador local
REM  Levanta un servidor estatico y abre el navegador.
REM  La app usa modulos ES, que no funcionan abriendo el HTML
REM  directamente con doble clic (protocolo file://).
REM ---------------------------------------------------------------

cd /d "%~dp0"

echo.
echo   LISA vigIA - iniciando servidor local...
echo.

where node >nul 2>nul
if errorlevel 1 (
    echo   [ERROR] No se encontro Node.js en este equipo.
    echo   Instalalo desde https://nodejs.org y vuelve a ejecutar este archivo.
    echo.
    pause
    exit /b 1
)

echo   Abriendo http://localhost:3000 en el navegador...
start "" "http://localhost:3000"

echo.
echo   Servidor activo. Para detenerlo, cierra esta ventana o pulsa Ctrl+C.
echo.

npx --yes serve . -l 3000

pause
