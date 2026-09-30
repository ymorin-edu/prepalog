@echo off
REM Prepalog - lance un petit serveur local et ouvre le site dans le navigateur.
REM Double-cliquez sur ce fichier. Laissez la fenetre noire ouverte pendant que vous
REM travaillez : c'est elle qui sert le site. Fermez-la pour arreter.

cd /d "%~dp0"
set PORT=8000

echo.
echo   Prepalog - serveur local
echo   ------------------------
echo.

REM 1) Python (lanceur Windows)
where py >nul 2>&1
if %errorlevel%==0 (
  echo   Demarrage avec Python...
  start "" http://localhost:%PORT%/
  py -m http.server %PORT%
  goto :fin
)

REM 2) Python (commande directe)
where python >nul 2>&1
if %errorlevel%==0 (
  echo   Demarrage avec Python...
  start "" http://localhost:%PORT%/
  python -m http.server %PORT%
  goto :fin
)

REM 3) Node.js
where npx >nul 2>&1
if %errorlevel%==0 (
  echo   Python introuvable, demarrage avec Node...
  start "" http://localhost:%PORT%/
  npx --yes http-server -p %PORT% -c-1
  goto :fin
)

echo   Ni Python ni Node ne sont installes sur ce poste.
echo.
echo   Installez Python depuis https://www.python.org/downloads/
echo   en cochant "Add python.exe to PATH" pendant l'installation,
echo   puis relancez ce fichier.
echo.
pause

:fin
