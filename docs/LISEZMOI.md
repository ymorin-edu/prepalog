# docs/ — le pont entre la conception (Cowork) et le code (Claude Code)

Ce dossier existe parce que Claude Code ne voit pas le projet Claude « PREPALOG » où Tristan
conçoit ses séances. **Tout ce que Claude Code doit savoir pour écrire du code est ici, dans le
dépôt, versionné.**

## Le principe (option 3, décidée le 02/10/2026)

| Où | Rôle |
|---|---|
| **Cowork** (conversations + projet PREPALOG) | **Concevoir** : cadrer une entreprise, vérifier ce qu'elle fait réellement, décider de la séance, fabriquer les supports (trames Word/PDF, diaporamas), tenir la mémoire de conception |
| **Claude Code** (dossier prepalog) | **Construire** : écrire la séance dans le moteur, lancer les tests, corriger, commiter et pousser |
| **Ce dossier `docs/`** | Le relais entre les deux : briefs, décisions, fiches de référence |

Tristan passe d'un outil à l'autre selon ce qu'il fait : modifier un écran, corriger un bug,
ajouter un test, lancer la suite → **Claude Code**. Décider d'une séance, chercher des infos sur
une entreprise, fabriquer une trame ou un diaporama → **Cowork**.

## Qui écrit où

- **Cowork écrit dans `docs/` et dans les SUPPORTS** (règle élargie par Tristan le 04/10/2026) :
  les trames et corrigés (`contenus/trames/`, `contenus/corriges/`) et leurs générateurs
  (`outils/trame-*.py`, `outils/corriges_*.py`). Jamais dans `core/`, `activites/`, les autres
  fichiers de `contenus/`, `styles/`, `outils/test*`, jamais dans `CLAUDE.md` sans le dire. Cowork ne
  commite pas : Claude Code relit, lance la suite (les corrigés sont chargés par le site), commite et
  pousse. Le code des séances reste à Claude Code seul : deux outils qui modifient le même fichier de
  code, c'est l'écriture périmée assurée.
- **Claude Code écrit partout**, et met `docs/` à jour quand une décision change en cours de route
  (une ligne dans `docs/decisions.md`, le compte rendu du brief).
- **Ne pas travailler dans les deux en même temps sur le dépôt.** Quand Tristan ouvre Claude Code
  pour construire, Cowork reste en conception ; quand Cowork écrit un brief, Claude Code est fermé
  ou inactif.
- **Pour le code, le dépôt fait foi** (ce qui est commité). **Pour l'intention pédagogique, la
  fiche `docs/fiches/prepalog-finalite.md` fait foi.** Si les deux se contredisent, le dire à
  Tristan avant de trancher.

## Le cycle d'une séance

1. **Cowork — conception.** Vérification de l'entreprise par recherche web, choix du temps
   pédagogique (guidage / entraînement / erreur induite / évaluation), compétence(s), niveaux,
   déroulé, jalons. Résultat : un **brief** dans `docs/briefs/<code>-<nom>.md`, écrit sur le
   modèle `docs/briefs/MODELE.md`, statut **à implémenter**.
2. **Claude Code — construction.** Tristan dit : « implémente le brief ENT-x.y ». Claude Code lit
   le brief, annonce la durée, écrit la séance avec **`pret: false`**, lance le bloc de tests de
   l'entreprise puis la suite entière, **commite par petits lots**. Statut du brief : **en cours**.
3. **Tristan — validation à l'écran** (page d'essai, ou site en local). C'est le seul juge : ce
   qu'il voit vaut mieux que toute relecture de code. Corrections éventuelles, toujours en
   Claude Code.
4. **Claude Code — livraison.** `pret: true`, suite verte, commit, push. Il remplit la section
   **Compte rendu** du brief (ce qui a été fait, ce qui a changé par rapport au brief, ce qui reste
   ouvert) et passe le statut à **livré**. Une ligne dans `docs/decisions.md` pour toute décision
   prise en route.
5. **Cowork — mise à jour de la mémoire.** Je relis le compte rendu et je mets à jour les fiches du
   projet PREPALOG (carte de couverture, chantiers…). Les supports pour les élèves (trame,
   corrigé, diaporama) se fabriquent ici ou en Claude Code selon l'outil nécessaire.

Un brief n'est jamais supprimé : il garde l'historique de la séance.

## Statuts d'un brief

`à implémenter` → `en cours` → `à valider par Tristan` → `livré` (ou `abandonné`, avec la raison).

## Contenu du dossier

```
docs/
  LISEZMOI.md          ce fichier
  decisions.md         journal des décisions, une ligne par décision, datée
  reglages-claude-code.json   modèle de `.claude/settings.json` (autorisations git/tests)
  briefs/              un brief par séance (MODELE.md = le modèle à copier)
  fiches/              copies des fiches de référence du projet PREPALOG
```

### Les fiches (`docs/fiches/`)

Ce sont des **copies datées** (02/10/2026) des fiches du projet PREPALOG qui décident du code :

- `prepalog-finalite.md` — la boussole : finalité, décisions pédagogiques (passe avant les autres) ;
- `prepalog-nomenclature.md` — codes, préfixes, `meta`, ordre d'affichage, état des activités ;
- `prepalog-progression-pedagogique.md` — la doctrine des trois temps ;
- `prepalog-entreprises-reelles.md` — ce qu'on peut faire d'une entreprise réelle (logos, documents) ;
- `prepalog-notes-competences.md` — notes par compétence, coefficients, export ;
- `prepalog-inventaire-format.md` — format des données de l'écran Inventaire ;
- `prepalog-vues-transport.md` — API des vues plan et tournée.

**Une copie peut vieillir.** La source de conception reste le projet PREPALOG : quand une fiche y
change, Cowork recopie la nouvelle version ici (en mettant la date en tête). Si une fiche contredit
le code actuel, c'est le code qui dit ce qui existe, et la fiche est à corriger.

**Restent seulement dans le projet** (à demander à Tristan si besoin) : les fiches d'architecture,
de mise en service Firebase, des règles vérifiées, des chantiers en cours, des référentiels (Bac
Pro 2025, 2de GATL, CAP OL), de la carte de couverture, de la montée en compétences, de chaque
entreprise (Boost, Cdiscount…) et des trames. Les résumés qui comptent pour le code sont dans
`CLAUDE.md`.

## Premier démarrage de Claude Code (à faire une fois)

1. Ouvrir une session Claude Code **en local** sur `C:\Users\trist\Documents\GitHub\prepalog`.
2. Demander : « Lis CLAUDE.md et docs/LISEZMOI.md, puis fais un `git status` ».
3. Demander : « Copie `docs/reglages-claude-code.json` vers `.claude/settings.json` (c'est la liste
   des commandes git et de test autorisées sans confirmation, et l'interdiction du push forcé). »
   Cowork ne peut pas écrire dans `.claude/` : c'est pour cela que le fichier est déposé dans `docs/`.
4. Demander : « Commite CLAUDE.md, docs/ et .claude/settings.json en un seul commit, puis fais un
   `git push --dry-run` pour vérifier que l'envoi est possible. »
5. Si Windows ou GitHub demande de se connecter une fois, le faire. Si `git` est introuvable,
   demander à Claude Code de dire exactement ce qu'il manque : GitHub Desktop embarque son propre
   git, qui n'est pas forcément accessible aux autres programmes.
6. Lancer `node outils/test.mjs` une première fois pour vérifier que la suite tourne chez Tristan.
