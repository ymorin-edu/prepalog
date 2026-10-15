---
description: Active ou désactive les sons de fin de travail et d'attente
allowed-tools: Bash(f="$HOME/.claude/alertes-off":*)
---

!`f="$HOME/.claude/alertes-off"; if [ -f "$f" ]; then rm "$f"; echo "Alertes ACTIVÉES"; else touch "$f"; echo "Alertes DÉSACTIVÉES"; fi`

Répète à Tristan, en une seule ligne et sans rien ajouter, l'état affiché ci-dessus.
