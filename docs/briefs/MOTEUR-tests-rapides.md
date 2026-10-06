# Brief d'outillage — MOTEUR-tests-rapides : suite de tests plus rapide et plus fiable

> Écrit par Cowork (diagnostic), lu et complété par Claude Code (construction).
> **Ne rien inventer** : ce qui n'est pas décidé va dans « Questions ouvertes ».

**Statut** : à implémenter
**Date du brief** : 06/10/2026
**Origine** : audit Cowork du 06/10 (`claude/prepalog-audit-tests-06-10.md` dans le projet)
**Périmètre** : `outils/test.mjs`, `outils/test/*.mjs`, `.github/workflows/tests.yml`. **Aucun fichier de `core/`,
`contenus/` ni `styles/`** (sauf lot 4, voir là). C'est un chantier « moteur » au sens de la règle 3 : un seul à la fois
dans tout le dépôt → s'inscrire dans `docs/EN-COURS.md` et vérifier `git status` avant d'écrire
(au moment de l'audit, `outils/test.mjs` était modifié localement par le chantier demi-groupes).

## 1. Constat (mesures Cowork, clone de `main` c6dc1a4, Playwright 1.56, machine 2 cœurs)

- Suite entière : **771 cas, ~14 min**. Le workflow GitHub a `timeout-minutes: 15` → **une minute de marge**.
- 4 blocs = 72 % du temps : `picard` 231 s, `smoby` 189 s, `entrepot` 110 s, `boost` 76 s.
- `waitForTimeout` : ~156 s au total, dont **61 s dans un seul cas** (`picard`, « ENT-4.4 : Précédent par erreur… »,
  68 s) et 5,6 s × 4 (`smoby` « Repérage : le temps passé… » × 3, `socle` « Précédent dans une séance = Quitter »).
- `reducedMotion: 'reduce'` essayé sur `picard` : **aucun gain** (le temps vient des ~250 clics). Ne pas le généraliser.
- Les blocs sont **indépendants** en dehors de `PREREQUIS` : trois groupes lancés seuls sont verts
  (G1 145 cas ~4,5 min ; G2 229 cas ~4,5 min ; G3 397 cas ~4,7 min, voir lot 1).
- **`entrepot` instable** : « page.evaluate: Execution context was destroyed, most likely because of a navigation »
  sur 2 lancers sur 4, sur un cas différent à chaque fois (« capteur de charge jamais en rouge en évaluation… » ;
  « Entrepôt évaluation : rien avant la copie, « Rendre mon travail » en deux clics… »).
- **`outils/test-seances.mjs` ne tourne pas sur GitHub et il est rouge : 28/31** (voir lot 4).
- `outils/test-regles.mjs` (émulateur Firebase) ne tourne pas non plus sur GitHub.
- `egal` / `vrai` recopiés à l'identique dans 6 blocs ; port `8099` écrit en dur 29 fois dans 17 fichiers.

## 2. Travail demandé, par lots (un commit par lot, suite verte à chaque fois)

### Lot 1 — Trois groupes en parallèle sur GitHub (gain ≈ 9 min) — prioritaire
1. **Port configurable** : `commun.mjs` lit `process.env.PORT_TESTS` (défaut 8099) et exporte l'URL de base
   (`BASE`) ; les 29 occurrences de `127.0.0.1:8099` dans les blocs l'utilisent (passée par le lanceur comme les
   autres objets). Commande inchangée en local.
2. **Groupes dans le lanceur** : constante `GROUPES` dans `outils/test.mjs` et option `--groupe N`
   (`node outils/test.mjs --groupe 1`). Le lanceur **refuse de partir** si un bloc de `BLOCS` n'est dans aucun groupe
   ou dans deux (même logique que le contrôle des blocs oubliés). `PREREQUIS` reste respecté dans un groupe.
   Répartition mesurée :
   - G1 : `quiz`, `carte`, `picard`
   - G2 : `socle`, `spartoo`, `groupes`, `tableur-export`, `smoby`, `animation`, `visibilite`
   - G3 : `dependances`, `transport`, `boost`, `inventaire`, `cdiscount`, `planning`, `entrepot`, `copie`, `amenagements`
   - `demi-groupes` (bloc ajouté après l'audit) : le placer dans le groupe le plus court après l'avoir chronométré.
3. **Workflow** : `strategy.matrix.groupe: [1, 2, 3]`, `fail-fast: false`, chaque job lance `--groupe ${{ matrix.groupe }}`.
   Garder le « Résumé des échecs » par job. `timeout-minutes` peut rester à 15.
4. Sans `--groupe`, la suite entière tourne comme aujourd'hui (local, Tristan).

### Lot 2 — Horloge simulée pour les chronos (gain ≈ 1 min 20)
Remplacer les longues attentes réelles par `page.clock` (Playwright ≥ 1.45 : `clock.install()` avant le chargement,
puis `clock.runFor()` / `fastForward()`). Cas visés : `picard` l. ~1856 (61 s) et ~1838 / ~1864 ; `smoby` l. ~351-361
(3 × 5,6 s) ; `socle` l. ~1888 (5,6 s). Les minuteries visées sont dans `core/types/entreprise.js` (comptage toutes les
5 s, sauvegarde toutes les 60 s) — **lire seulement, ne pas les modifier**.
**Exigence** : chaque cas réécrit doit toujours tomber si on sabote ce qu'il surveille (le commentaire picard rappelle
qu'avec 3 s le sabotage passait). Éprouver le sabotage et le noter dans le compte rendu.

### Lot 3 — Bloc `entrepot` fiable
Trouver ce qui navigue pendant `monter()` (cas précédent qui laisse une navigation en cours, `goBack`, lien, rechargement)
et attendre la fin de la navigation avant d'évaluer. Critère : **5 lancers de suite de `node outils/test.mjs entrepot`
verts**. Ne pas « corriger » en ajoutant un `waitForTimeout`.

### Lot 4 — `test-seances.mjs` sur GitHub — **après réponse de Tristan (Questions ouvertes)**
État au 06/10 : 28/31. Échecs :
- « ENT-1.3 · étape 6 : bloquer le stock restant, comme le corrigé » → question introuvable : « Que vaut maintenant » ;
- « porte de sortie : à la réouverture, Léa retrouve la photo de fin de 1.1, une seule fois » → `page.click` timeout ;
- « aucun écart entre les écrans et les corrigés » → 2 écarts sur ENT-1.3 étape 2 : expéditeur de l'alerte, nature du défaut.
Diagnostiquer d'abord (test périmé ? corrigé faux ? séance faux ?) et **demander à Tristan avant de changer un corrigé ou
une séance**. Puis ajouter un 4e job au workflow (port 8098, déjà prévu par le fichier).

### Lot 5 — Petits rangements (facultatif, à faire seulement si les lots 1-3 sont livrés)
- `egal` / `vrai` exportés par `commun.mjs` (on le signale : règle 4) et retirés des blocs.
- Cache du navigateur Playwright dans le workflow (`actions/cache` sur `~/.cache/ms-playwright`, clé = version de Playwright).
- `test-regles.mjs` sur GitHub (firebase-tools + Java) : **seulement si Tristan le demande** (Questions ouvertes).

## 3. Ce qui ne doit pas changer
- La commande `node outils/test.mjs` (suite entière, même ordre, même bilan, même code de retour).
- Le mode démonstration par construction (`prepalog-config.json` refusé), le relevé des erreurs JS, des 404 et des hôtes extérieurs.
- Aucun cas supprimé : le nombre de cas avant / après est donné dans le compte rendu.

## 4. Critères de validation par Tristan
- Sur GitHub, un push affiche **trois coches** (Tests 1, 2, 3) et le passage complet dure **moins de 6-7 min**.
- En local, `node outils/test.mjs` marche comme avant.

## 5. Questions ouvertes
- [ ] Lot 4 : pour les écarts ENT-1.3, qui a raison, l'écran ou le corrigé ? (Claude Code prépare le diagnostic, Tristan tranche.)
- [ ] Lot 5 : faire tourner les tests Firebase (`test-regles.mjs`) sur GitHub, oui ou non ?

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Durées mesurées** (avant / après, par groupe, sur GitHub) :
- **Sabotages éprouvés** (lot 2) :
- **Tests** : nombre de cas avant / après
- **Commits** :
- **Reste ouvert** :
