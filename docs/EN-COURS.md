# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| Suite de tests plus rapide (palettier en mouvement réduit, lanceur parallèle qui lit les durées mesurées, 8 groupes GitHub) — session « Optimisations suite de test » | `outils/test/palettier.mjs`, `outils/test-parallele.mjs`, `outils/test.mjs` (GROUPES et en-tête), `.github/workflows/tests.yml`, `.gitignore`, `CLAUDE.md` (section Tests), `docs/decisions.md` | 22/10/2026 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
