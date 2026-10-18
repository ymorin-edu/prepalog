# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| Chantier moteur : points de tournée en fonction de la base de l'élève (`tournee.points: (db) => …`, demande n° 6 du brief ENT-9.2) — session Fable, cadrage à valider par Tristan, construction par un sous-agent Opus | `core/types/tournee.js`, `core/types/entreprise.js` (trois lignes : `db` et `signaler` passés à la tournée), `outils/test/ramasse.mjs` (ajouts), `activites/FICHE-SEANCE.md` (vue tournee), `docs/briefs/MOTEUR-tournee-points-par-eleve.md (à créer)`, `docs/briefs/ENT-9.2-chep-ramasse-et-retours.md` (§7 n° 6, une ligne), `docs/decisions.md` (une ligne), `docs/chantiers.md` (une ligne) | 18/10/2026 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
