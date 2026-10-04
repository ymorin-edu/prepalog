# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| Cowork — reprise des trames élève (audit du 04/10) : Picard 4.1 et 4.2, puis Cdiscount, puis Spartoo ; PDF regénérés à la fin | `outils/trame-*.py`, `outils/corriges_data.py`, `outils/corriges_cdiscount.py`, `contenus/trames/*.docx`, `contenus/corriges/*-trame.js` et `ENT-1.x`/`ENT-2.x`/`ENT-3.1`.js | 04/10 |
| Claude Code — séance ENT-5.1 Smoby recrutement (+ lot 7 : entreprise n° 5) | `activites/smoby-recrutement.js`, `activites/index.js`, `contenus/smoby.js`, `contenus/smoby-ent51.js`, `contenus/corriges/ENT-5.1.js`, `outils/test/smoby.mjs`, `docs/briefs/ENT-5.1-smoby-recrutement.md` | 04/10 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
