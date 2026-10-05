# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| MOTEUR plan d'entrepôt : « posée » sur la carte de palette (retire le contour du plan) | `core/types/entrepot.js`, `styles/entrepot.css`, `outils/test/entrepot.mjs`, brief MOTEUR-vue-plan-entrepot, `docs/decisions.md` | 06/10/2026 |
| MOTEUR demi-groupes (1L → 1L1 / 1L2) | `core/prof.js`, `core/niveaux.js`, `core/store.js`, `core/app.js`, `core/backend-demo.js`, `core/backend-firebase.js`, `outils/test.mjs` (BLOCS), `outils/test/demi-groupes.mjs`, brief MOTEUR-demi-groupes (+ `docs/decisions.md` en fin, après l'autre chantier) | 06/10/2026 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
