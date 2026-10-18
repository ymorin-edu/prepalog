# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| ENT-9.1 CHEP (le compte palettes) | `contenus/chep*.js (à créer)`, `contenus/questions/ENT-9.1.js (à créer)`, `contenus/corriges/ENT-9.1.js (à créer)`, `activites/chep-compte-palettes.js (à créer)`, `activites/index.js` (ligne ENTREPRISES + ligne registre), `outils/test/chep-91.mjs (à créer)`, `outils/test/chep/commun.mjs (à créer)`, `outils/test.mjs` (lignes BLOCS/GROUPES), `docs/briefs/ENT-9.1-chep-compte-palettes.md`, `docs/decisions.md` | 18/10/2026 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
