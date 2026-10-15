# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| Action ENT-8.x (chef de chantier Fable, sous-agents) : vue « Localiser » puis ENT-8.1 et ENT-8.2 | `core/types/localiser.js` (à créer), `styles/localiser.css` (à créer), `core/types/entreprise.js`, `core/types/entreprise-options.js`, `core/types/entrepot-visite.js` (zones vestiaire/contrôle), `core/declencheurs.js`, `index.html`, `CREDITS.md`, `outils/carte/construire-france.py` (à créer), `contenus/france-contours.js` (à créer), `contenus/action*.js` (à créer), `contenus/questions/ENT-8.*.js` (à créer), `contenus/corriges/ENT-8.*.js` (à créer), `activites/action-*.js` (à créer), `activites/index.js`, `activites/FICHE-SEANCE.md`, `outils/test.mjs` (lignes BLOCS/GROUPES), `outils/test/localiser.mjs` (à créer), `outils/test/action.mjs` (à créer), `outils/test/entrepot.mjs`, `outils/test/socle.mjs`, `docs/briefs/MOTEUR-vue-localiser.md`, `docs/briefs/ENT-8.*.md`, `docs/decisions.md`, `docs/chantiers.md` | 15/10/2026 20 h |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
