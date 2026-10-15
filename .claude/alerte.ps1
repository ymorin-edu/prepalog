# Son quand Claude Code attend (besoin) ou a terminé (fin). Pas de fenêtre.
# Appelé par les hooks Notification et Stop de .claude/settings.json.
# Se relance lui-même en arrière-plan pour ne jamais bloquer Claude Code.
param([string]$Quoi = 'fin', [switch]$Enfant)

# Coupées par /alertes (fichier témoin propre à cet ordinateur, hors du dépôt).
if (Test-Path "$env:USERPROFILE\.claude\alertes-off") { exit 0 }

if (-not $Enfant) {
  Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @(
    '-NoProfile', '-ExecutionPolicy', 'Bypass',
    '-File', "`"$PSCommandPath`"", $Quoi, '-Enfant')
  exit 0
}

# Son seulement, pas de fenêtre (choix de Tristan, 15/10/2026).
# « besoin » = son d'exclamation, « fin » = son d'information : on les distingue à l'oreille.
if ($Quoi -eq 'besoin') {
  [System.Media.SystemSounds]::Exclamation.Play()
} else {
  [System.Media.SystemSounds]::Asterisk.Play()
}
Start-Sleep -Milliseconds 1500   # laisse le son se jouer avant que le processus ne se ferme
