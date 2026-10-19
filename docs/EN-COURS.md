# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| Transports Pelleau (ENT-10.1 à 10.12 + vue « inspection du poste » + dépose par client) — session Fable, chef de chantier | `docs/briefs/COORDINATION-pelleau.md (à créer)`, `contenus/pelleau*.js (à créer)`, `activites/pelleau-*.js (à créer)`, `activites/index.js`, `core/types/inspection.js (à créer)`, `core/iso.js`, `core/types/quai.js`, `core/declencheurs.js`, `styles/`, `outils/essai-inspection-poste.html (à créer)`, `outils/test.mjs`, `outils/test/pelleau*.mjs (à créer)`, `outils/test/socle.mjs`, `outils/test/quai-iso.mjs`, `contenus/trames/logos/pelleau*`, `CREDITS.md`, `activites/FICHE-SEANCE.md`, `docs/briefs/ENT-10.*.md` (comptes rendus), `docs/briefs/MOTEUR-inspection-poste.md`, `docs/briefs/MOTEUR-depose-par-client.md` | 19/10/2026 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
