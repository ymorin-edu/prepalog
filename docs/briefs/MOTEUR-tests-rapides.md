# Brief d'outillage — MOTEUR-tests-rapides : suite de tests plus rapide et plus fiable

> Écrit par Cowork (diagnostic), lu et complété par Claude Code (construction).
> **Ne rien inventer** : ce qui n'est pas décidé va dans « Questions ouvertes ».

**Statut** : lots 1-3 livrés ; lot 4 diagnostiqué (en attente de Tristan) ; lot 5 non commencé
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

*06/10/2026 — lots 1, 2, 3 livrés ; lot 4 diagnostiqué, en attente de Tristan ; lot 5 non commencé.*

- **Fichiers créés / modifiés** : `outils/test.mjs` (GROUPES, `--groupe N`, garde des groupes, durée par
  bloc), `outils/test/commun.mjs` (`PORT_TESTS`, `BASE`), les 17 blocs qui écrivaient `127.0.0.1:8099`
  (reçoivent `BASE`), `outils/test/picard.mjs`, `smoby.mjs`, `socle.mjs` (horloge simulée),
  `.github/workflows/tests.yml` (trois jobs). Rien dans `core/`, `contenus/`, `styles/`.
- **Écarts par rapport au brief** (et pourquoi) :
  - `demi-groupes` (17 s) est rangé dans le **groupe 1**, le plus court une fois le lot 2 fait.
  - La garde des groupes refuse aussi un bloc **séparé de son prérequis** (`spartoo`, `groupes`, `smoby`
    sans `socle`) : sinon le prérequis tournerait deux fois. Éprouvée dans les trois sens (bloc oublié,
    bloc en double, prérequis ailleurs).
  - Le lanceur affiche une ligne **« Durée par bloc »** avant le bilan (le bilan et le code de retour
    ne changent pas) : c'est elle qui sert à rééquilibrer les groupes.
  - **Cas existant réécrit** (smoby, « la bulle d'un mot proche du bord droit reste entière à l'écran ») :
    la bulle est refermée (clic dessus) avant de cliquer le mot suivant. C'était **le seul cas rouge sur
    GitHub depuis le 05/10** (au moins 12 passages de suite) : avec les polices de Linux, la bulle
    couvrait le mot suivant et le clic restait bloqué. Ce que le cas vérifie n'a pas changé.
  - **Lot 3 : aucune modification.** L'instabilité de l'audit n'a pas été reproduite : 4 lancers
    simultanés, 3 lancers avec le processeur de la page ralenti ×4 (mouchard qui note chaque
    navigation : seulement les deux rechargements voulus par les cas « état retrouvé après
    rechargement »), puis les **5 lancers de suite demandés, verts (56/56)**. Sur GitHub, le bloc
    n'apparaît dans aucun des 12 derniers passages rouges. Rien dans le site ne recharge la page
    pendant ces cas (cherché : `location`, formulaires, liens, `history.back`). Je n'ai pas ajouté de
    correctif « au cas où » : une attente sans cause démontrée masquerait un vrai défaut. Si le
    message revient sur GitHub, le relever avec le nom du cas.
- **Durées mesurées** :
  - GitHub, avant : **12 à 13,5 min**, suite **rouge** (passage du 05/10 22:52, da2d10c : 13 min 20).
  - GitHub, lot 1 (351573f) : trois coches vertes, jobs **4 min 27 / 4 min 48 / 4 min 27** (groupes 1/2/3).
  - GitHub, lot 2 (338594c) : jobs **4 min 13 / 4 min 14 / 4 min 38**, dont la suite seule 201 s / 220 s /
    246 s ; le reste est l'installation de Playwright et Chromium (~30 s, cible du lot 5).
  - Local (Windows), suite entière dans l'ordre : **12 min 21 → 10 min 41** ; les trois groupes en
    parallèle sur un poste : 4 min 23. Blocs : picard 213 → 147 s, smoby 161 → 144 s, socle 28 → 22 s.
- **Sabotages éprouvés** (lot 2, moteur modifié le temps d'un lancer puis restauré, vérifié par `git status`) :
  - chrono du quai qui continue hors de la séance (plus de `clearInterval` à la sortie, plus de garde
    « hôte détaché ») → picard « Précédent par erreur » tombe : « chrono qui tourne hors de la séance : 60 au lieu de 3 » ;
  - temps de repérage compté onglet caché → smoby tombe : « 10 au lieu de 5 » ;
  - temps de repérage compté chez l'enseignant → smoby tombe : « {"temps":5} au lieu de null » ;
  - temps de repérage jamais compté → socle « Précédent dans une séance = Quitter » tombe : « temps passé dans la base : 0 ».
- **Tests** : 784 cas avant, 784 après (157 + 229 + 398 dans les trois groupes). Aucun cas supprimé.
- **Commits** : 2fa34ca (brief, inscription), 351573f (lot 1), 338594c (lot 2), celui de ce compte rendu.
- **Diagnostic du lot 4** (`node outils/test-seances.mjs` : 28/31) — dans les trois cas, c'est **le test
  qui est en retard** ; l'écran et le corrigé disent la même chose :
  1. « étape 6 : bloquer le stock restant » : la question « Que vaut maintenant le « Reste en stock »
     du lot ? » (réponse 0) a été **retirée du corrigé ENT-1.3** par la reprise des trames du 04/10
     (b658247). Le test la cherche encore.
  2. Les deux « écarts » de l'étape 2 (expéditeur, nature du défaut) : le même commit a **réordonné
     le tableau** de l'étape 2 (lot, nature, ce que Puma demande, expéditeur — avant : lot, expéditeur,
     nature). Le test lit les lignes par leur rang : il compare l'expéditeur à la ligne « nature » et la
     nature à « ce que Puma demande ». Le mail à l'écran contient bien « Marc Oberlé » et « collage »,
     comme le corrigé.
  3. « porte de sortie : Léa retrouve la photo de fin de 1.1 » : le test clique « Réceptions » dans
     ENT-1.2, qui n'a plus ce menu depuis le 05/10 (1dff0f8 : chaque séance n'affiche que ses écrans).
  Correction proposée, **dans le test seulement** : lire les lignes du tableau par leur intitulé ;
  remplacer la question disparue par le nombre écrit dans la note du corrigé (ou ne plus comparer ce
  point) ; vérifier REC-04127 par la console (`.getlot`) au lieu du menu Réceptions. Puis 4e job sur
  GitHub (port 8098). **En attente de l'accord de Tristan.**
- **Reste ouvert** : lot 4 (accord de Tristan) ; lot 5 (accord de Tristan) ; question `test-regles.mjs`
  sur GitHub.
