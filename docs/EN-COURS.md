# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| Mondial Relay 2de : séances ENT-11.1 à 11.7 et vue Tri des colis (agents en parallèle, intégration par cette session) | `activites/mondial-relay-*.js`, `contenus/mondial-relay*.js`, `contenus/questions/ENT-11.*.js`, `outils/test/mr-11.*.mjs`, `outils/test/mondial-relay/`, `activites/index.js`, `activites/catalogue.js`, `outils/test.mjs` (BLOCS, GROUPES), `core/types/tri.js` (nouveau), `core/types/entreprise*.js`, `styles/tri.css`, `index.html`, `docs/briefs/ENT-11.*`, `docs/decisions.md` | 26/10/2026 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
