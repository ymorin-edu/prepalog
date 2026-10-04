# Brouillons de Claude Code (pas du code servi)

## MOTEUR-2de-S1, lots 4 et 5 (quai sans froid, chariot, étape sécurité) — 04/10/2026

Écrits mais **jamais appliqués ni testés** (pause demandée par Tristan avant l'application). Pour reprendre :

1. `MOTEUR-2de-S1-lots4-5-quai.py` : script Python qui modifie `core/types/quai.js` par remplacements exacts
   (il s'arrête si un morceau attendu a changé). Depuis la racine du dépôt :
   `python -X utf8 docs/briefs/brouillons/MOTEUR-2de-S1-lots4-5-quai.py`.
2. `MOTEUR-2de-S1-lots4-5-essai.js.txt` : le quai d'essai (sans froid, cariste, sécurité) à ajouter à
   `outils/essai-2de.js` ; `univers()` doit accepter une option `quai` et ajouter `etapesQuai(quai)` aux étapes.
3. `MOTEUR-2de-S1-lots4-5-tests.mjs.txt` : 10 cas à ajouter au bloc `outils/test/smoby.mjs` (`monter` doit accepter
   `quai` et `evaluation`, et ranger les options du quai dans `window.__s.quaiOpts`).

Puis : bloc `picard` vert (non-régression), sabotages, suite entière, page d'essai, compte rendu dans le brief.
Ce dossier peut être effacé une fois les lots livrés.
