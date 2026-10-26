# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| IKEA 2de (ENT-12.1 à 12.8, brief `docs/briefs/FEUILLE-DE-ROUTE-ikea.md`) | `activites/ikea-*.js`, `contenus/ikea*.js`, `contenus/questions/ENT-12.*`, `outils/test/ikea*`, `activites/index.js`, `activites/catalogue.js`, `outils/test.mjs` (lignes BLOCS/GROUPES) | 26/10/2026 |
| Jalons hors Smoby : fausses phrases plausibles (33 séances) et paliers Cdiscount 2.2 / 2.6 | `contenus/cdiscount-chiffres.js`, `contenus/cdiscount-priorites.js`, `outils/test/cdiscount.mjs` (et les phrases des contenus Action, Pelleau, France Boissons, Mondial Relay, CHEP) | 26/10/2026 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
