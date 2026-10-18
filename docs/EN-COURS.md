# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| MOTEUR-chep lot A : tournée de ramasse (charge qui monte, pic, report, gestes) et carte du Nord | `core/types/tournee.js`, `core/types/entreprise.js` (gestes et `quand` de la tournée), `outils/carte/calibrer.mjs`, `outils/carte/chep.json`, `outils/carte/construire-*.py`, `contenus/chep-carte.js`, `outils/essai-tournee-ramasse.html`, `outils/test/ramasse.mjs`, `outils/test.mjs` (BLOCS, GROUPES), `activites/FICHE-SEANCE.md`, `docs/briefs/MOTEUR-chep-ramasse-et-piles.md`, `docs/decisions.md`, `docs/chantiers.md` | 18/10/2026 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
