# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| D-C tirage mémorisé et niveaux (brief `MOTEUR-tirage-et-niveaux`, session Fable + agent Opus) | `core/tirage.js`, `core/amenagements.js`, `core/notes.js`, `core/prof.js`, `core/app.js`, `firestore.rules`, `outils/test-regles.mjs`, `outils/test.mjs` (ligne `BLOCS`), `outils/test/tirage-niveaux*.mjs`, `activites/FICHE-SEANCE.md`, `docs/briefs/MOTEUR-tirage-et-niveaux.md`, `docs/chantiers.md`, `docs/decisions.md` | 09/10/2026 |
| D-D photos libres France Boissons (brief `IMAGES-france-boissons`, agent Sonnet) | `contenus/images/france-boissons/*`, `outils/images-france-boissons*`, `docs/briefs/IMAGES-france-boissons.md` | 09/10/2026 |
| D-E logo et charte France Boissons (ENT-6.2 §11, agent Sonnet) | `contenus/trames/logos/france-boissons*`, `docs/briefs/france-boissons/charte*`, `docs/briefs/ENT-6.2-france-boissons-commande.md` (§11 seulement) | 09/10/2026 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
