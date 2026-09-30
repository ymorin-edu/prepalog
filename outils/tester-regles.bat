@echo off
REM Prepalog - joue les tests des regles de securite contre l'emulateur Firebase.
REM Double-cliquez sur ce fichier. Rien ne touche le vrai projet prepalog-e592d :
REM tout se passe en local, sur un projet de demonstration nomme demo-prepalog.
REM
REM Premiere execution : l'installation des paquets et le telechargement des emulateurs
REM prennent quelques minutes. Les fois suivantes, c'est immediat.

cd /d "%~dp0.."
setlocal

echo.
echo   Prepalog - tests des regles de securite
echo   ---------------------------------------
echo.

REM 1) Node
where node >nul 2>&1
if not %errorlevel%==0 (
  echo   Node.js est introuvable sur ce poste.
  echo   Installez-le depuis https://nodejs.org/ ^(version LTS^), puis relancez ce fichier.
  echo.
  pause
  exit /b 1
)

REM 2) Java - les emulateurs Firestore et Realtime Database sont des programmes Java.
where java >nul 2>&1
if not %errorlevel%==0 (
  echo   Java est introuvable sur ce poste.
  echo.
  echo   Les emulateurs Firestore et Realtime Database sont des programmes Java :
  echo   sans lui, ils ne demarrent pas. Installez un JDK, par exemple celui-ci :
  echo   https://adoptium.net/  ^(Temurin, version LTS, installateur .msi^)
  echo   Cochez "Set JAVA_HOME variable" pendant l'installation, puis relancez ce fichier.
  echo.
  pause
  exit /b 1
)

REM 3) Paquets de test, isoles dans outils\paquets pour ne rien ajouter a la racine.
REM    Le depot n'a pas de package.json et n'en veut pas : aucune etape de compilation.
if not exist "outils\paquets\node_modules\@firebase\rules-unit-testing" (
  echo   Installation des paquets de test dans outils\paquets ^(une seule fois^)...
  echo.
  call npm install --prefix outils\paquets firebase @firebase/rules-unit-testing firebase-tools
  if not %errorlevel%==0 (
    echo.
    echo   L'installation a echoue. Verifiez la connexion reseau et relancez.
    echo.
    pause
    exit /b 1
  )
  echo.
)

REM 4) Les regles RTDB du depot portent un bloc _commentaire en tete : c'est leur
REM    documentation, et ni la console Firebase ni l'emulateur ne l'acceptent. On ecrit
REM    une copie sans lui, que firebase.json designe. Le fichier du depot reste intact.
node -e "const fs=require('fs');const r=JSON.parse(fs.readFileSync('database.rules.json','utf8'));delete r._commentaire;fs.writeFileSync('outils/.rtdb-emulateur.json',JSON.stringify(r,null,2));"
if not %errorlevel%==0 (
  echo   Impossible de preparer les regles Realtime Database. Arret.
  echo.
  pause
  exit /b 1
)

REM 5) Demarrage des deux emulateurs, execution des tests, arret automatique.
echo   Demarrage des emulateurs et execution des tests...
echo.
call "outils\paquets\node_modules\.bin\firebase.cmd" emulators:exec --project demo-prepalog --only firestore,database "node outils/test-regles.mjs"
set CODE=%errorlevel%

echo.
if %CODE%==0 (
  echo   Toutes les regles sont conformes.
) else (
  echo   Au moins un test est tombe - voir le detail plus haut, ligne par ligne.
)
echo.
pause
exit /b %CODE%
