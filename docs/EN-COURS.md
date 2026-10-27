# Qui travaille sur quoi (à tenir à jour par chaque session Claude Code)

**Règle** : une session qui va écrire dans le dépôt s'inscrit ici **avant** de commencer
(une ligne, commitée et poussée tout de suite) et **s'efface** quand elle a commité et poussé son travail.
Avant d'inscrire la sienne, elle lit ce fichier et lance `git status` : si un fichier dont elle a besoin
est déjà modifié ou inscrit ci-dessous, **elle s'arrête et le dit à Tristan** (jamais d'écrasement).

| Chantier | Fichiers qu'il touche | Depuis |
|---|---|---|
| Blocs 1re/Tle (fil « Proposer les prochains blocs ») : Boost ENT-3.4, puis Lactalis (ENT-14.x), Cdiscount pic de Noël (ENT-2.7 à 2.10), Syngenta (ENT-15.x), Royal Canin (ENT-16.x), La Redoute (ENT-17.x), Airbus (ENT-18.x) | `activites/boost-ent34.js`, `contenus/boost-ent34*.js`, `outils/carte/boost-ent34.json`, `outils/test/boost.mjs` (cas ENT-3.4), puis les fichiers de chaque entreprise (`*/lactalis*`, `*/syngenta*`, `*/royal-canin*`, `*/la-redoute*`, `*/airbus*`, `*/cdiscount-*` nouveaux), `contenus/questions/ENT-1[4-8].*`, `docs/briefs/lactalis/` (puis un dossier par entreprise) ; des LIGNES ajoutées dans `activites/index.js`, `activites/catalogue.js`, `outils/test.mjs` (comme Stellantis : fusion au rebase) | 26/10/2026 |

Rappel : un seul chantier à la fois dans `core/types/tournee.js`, `core/types/grille.js`,
`core/types/entreprise.js`, `styles/base.css` et `outils/test/boost.mjs` (voir `docs/briefs/COORDINATION-boost.md`).
