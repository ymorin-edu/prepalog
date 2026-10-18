# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| ENT-9.3 CHEP (séance : le relevé contesté) — session Fable, séance construite par un sous-agent Opus | `activites/chep-releve-conteste.js (à créer)`, `contenus/chep-ent93*.js (à créer)`, `contenus/questions/ENT-9.3.js (à créer)`, `contenus/corriges/ENT-9.3.js (à créer)`, `outils/test/chep-93.mjs (à créer)`, `outils/test.mjs` (lignes BLOCS/GROUPES), `outils/test/tirage-niveaux.mjs` (une ligne BANQUES_FIGEES), `activites/index.js` (une ligne), `outils/test/chep/commun.mjs` (ajouts seulement), `docs/briefs/ENT-9.3-*.md`, `docs/decisions.md`, `docs/chantiers.md` | 18/10/2026 |
| Chantier moteur : points de tournée en fonction de la base de l'élève (`tournee.points: (db) => …`, demande n° 6 du brief ENT-9.2) — session Fable, cadrage à valider par Tristan, construction par un sous-agent Opus | `core/types/tournee.js`, `outils/test/ramasse.mjs` (ajouts), `activites/FICHE-SEANCE.md` (vue tournee), `docs/briefs/MOTEUR-tournee-points-par-eleve.md (à créer)`, `docs/briefs/ENT-9.2-chep-ramasse-et-retours.md` (§7 n° 6, une ligne), `docs/decisions.md` (une ligne), `docs/chantiers.md` (une ligne) | 18/10/2026 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
