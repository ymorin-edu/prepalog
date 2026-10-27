# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| Amazon CAP (ENT-19.x), puis Leroy Merlin 1re (ENT-20.x), Lidl 2de (ENT-21.x), Stellantis C3.4 (ENT-13.10 à 13.12) (fil cloud « prochains blocs ») | `activites/amazon-*`, `contenus/amazon*`, `outils/test/amazon*.mjs`, `docs/briefs/amazon/`, puis les mêmes pour `leroy-merlin`, `lidl`, `stellantis` ; `activites/index.js`, `activites/catalogue.js`, `outils/test.mjs`, `contenus/trames/logos/` | 27/10/2026 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
