# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| Correctifs moteur après ENT-9.2 (chauffeur « palettes refusées », pastille de créneau déclarable, menu après « Clore ») — session Fable | `core/types/quai.js`, `core/types/tournee.js`, `core/types/entreprise.js`, `activites/FICHE-SEANCE.md`, `outils/test/quai-iso.mjs`, `outils/test/ramasse.mjs`, `outils/test/transport.mjs` (ajouts), `contenus/chep-ent92.js` (déclaration), `docs/decisions.md` | 18/10/2026 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
