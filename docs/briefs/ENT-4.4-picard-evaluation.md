# Brief de séance — ENT-4.4 Picard, le rush du lundi (évaluation)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-picard.md puis implémente le brief docs/briefs/ENT-4.4-picard-evaluation.md avec les seuils de temps réel provisoires (12 et 16 min) : ils seront ajustés plus tard, garde-les dans un réglage facile à changer. Annonce la durée puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§10).
> ```

**Statut** : **livré le 03/10/2026, fermé aux élèves** (`pret: true, ouverture: 'prof'`) — à essayer à l'écran. Avant : à implémenter — **après** ENT-4.1 et `MOTEUR-tiers-temps`. **L'essai en classe ne bloque pas** (décision de
Tristan, 03/10) : construire avec les seuils provisoires (12 / 16 min), rangés dans un réglage du contenu facile à
changer ; Tristan les ajustera après l'essai, avant le jour de l'évaluation.
**Date du brief** : 03/10/2026

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-4.4 / `picard-ent44` |
| Titre | « Picard — le rush du lundi » |
| Niveau | 1re |
| Compétence | **C1.4** |
| Temps pédagogique | évaluation (coefficient 3) |
| Notation | **copie rendue** (`meta.copie: true`, `copie: meta.copie`, `noter`) |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

Comme ENT-4.1. **Construit** : nouveau fournisseur fictif (pâtisseries, plats cuisinés), transporteur fictif, les deux
jeux de données.

## 3. Objectif

L'élève réceptionne seul un camion complet, sans aide, sur des données neuves : tous les gestes d'ENT-4.1, plus **une
palette qui porte deux problèmes à la fois**. L'évaluation porte sur **ce qui a été vu en guidage** (décision de
Tristan : pas de piège « ticket propre » ni de multi-références ici).

## 4. Déroulé

Mail d'accueil court (sans conseil) ; déroulé d'ENT-4.1 (4 étapes) ; **aucune aide** (pas de chef de quai, pas de repère
P1, pas de règle des couches, total seul) ; « Revoir le BL » gardé ; **chrono qui mesure** (affiché « Temps passé »,
horloge murale) ; « Rendre ma copie » ; aucun verdict à l'écran ; en fin d'heure l'enseignant ramasse.

## 5. Un jeu tiré par élève (décision de Tristan, 03/10/2026 — remplace les deux jeux alternés)

> Décision générale : `docs/briefs/DECISION-jeu-unique-evaluations.md` (« un jeu par élève, cette règle vaut pour toutes les évaluations si c'est
> applicable »). Elle remplace les **deux jeux alternés un élève sur deux** prévus jusque-là.

**Chaque élève reçoit un camion tiré pour lui**, graine = **identifiant de l'élève** (stable : même jeu sur un autre
poste, après rechargement, après réouverture de la copie par l'enseignant ; pas de `reinitialisable`). Un absent passe
plus tard sur son propre jeu. La **structure commune est la contrainte d'équité** que le tirage respecte toujours :
6 palettes, avec exactement les six aléas ci-dessous :

| # | Aléa | Attendu |
|---|---|---|
| 1 | **manquant + cartons écrasés** sur la même palette | Réserves — deux constats, deux quantités |
| 2 | température non conforme à cœur | Refuser — température |
| 3 | produit différent (étiquette) | Refuser — produit différent |
| 4 | cartons écrasés seuls (visibles d'un côté) | Réserves — avarie |
| 5 | couche du dessus incomplète, **conforme au BL** | Accepter |
| 6 | conforme | Accepter |

Ticket : une remontée à signaler (comme ENT-4.1).
**Tirés** pour chaque élève : les produits et colisages (dans une réserve de produits Picard plausibles), l'ordre des
palettes (quelle position porte quel aléa), les valeurs (quantités, températures dans les zones de la règle du quai
−18 / −15 °C, manquants), le moment de la remontée du ticket. **Jalons et note calculés sur le jeu de l'élève**, jamais
écrits en dur. Les seuils de rapidité sont **communs à tous** (ils ne dépendent pas du jeu).

> **Règle du quai pour la température à cœur (décision de Tristan, 03/10/2026, après ENT-4.2)** — vaut pour toutes
> les séances Picard. **−18 °C ou plus froid : accepter. Entre −18 et −15 °C : accepter avec réserves — température,
> en écrivant la valeur relevée. Au-dessus de −15 °C : refuser — température.** Vérifié : −18 °C exigé, tolérance
> brève −15 °C au déchargement ; les trois zones sont une règle du quai, construite (à annoncer comme telle). La vue
> l'applique d'elle-même pour un camion qui se réchauffe (`seuilReserve`, `seuilRefus`) ; pour les autres palettes, le
> contenu déclare `attendu` / `motifAttendu` conformes : un test du bloc `picard` relit chaque `contenus/picard-ent4*.js`
> et refuse une palette hors de la règle.

## 6. Note (décision de Tristan, 03/10/2026)

**15 points de réception** (jalons réussis / jalons × 15) + **5 points de rapidité** :
- **3 sur le temps hors froid** : ≤ 20 min → 3, ≤ 25 → 2, ≤ 30 → 1 ;
- **2 sur le temps réel** : seuils **fixés par Tristan d'après les temps mesurés en ENT-4.1** (provisoirement 12 / 16
  min → 2 / 1), **× 4/3 en tiers-temps** (`ctx.tiersTemps`) ;
- **seulement si la réception est complète** (tout décidé, lot rentré, BL signé), **en proportion des palettes
  justes**.
Le temps réel court de l'ouverture de la séance à la remise, quel que soit l'écran, et survit à un rechargement.
Le détail (réception, hors froid, réel, rapidité retenue) va dans `detail`, lisible par l'enseignant.

## 7. Demandes au moteur

Aucune nouvelle sur la vue quai si elle (avec note de rapidité) et le tiers-temps sont livrés. **Nouveau : le tirage
d'un jeu par élève**, à construire **générique** (pas propre au quai) : graine = identifiant de l'élève, une réserve et
des contraintes d'équité déclarées par la séance. Cdiscount ENT-2.5 le réutilisera (6 références, quantités, pièges
d'inventaire) : décrire au compte rendu l'API, où vit le code et comment une autre séance le déclare (`docs/briefs/DECISION-jeu-unique-evaluations.md`).

## 8. Tests

Note (valeurs écrites à la main) : parcours juste rapide → 20 ; une palette fausse → rapidité × 5/6 ; BL non signé → 0
point de rapidité ; tiers-temps → seuils × 4/3 ; ramassage = même note que la remise ; chaque élève garde son jeu après
rechargement ; deux élèves voisins ont deux jeux différents ; aucun verdict visible avant la remise.
**Tirage** (obligatoire) : tirer quelques centaines de graines et vérifier que chaque jeu respecte les contraintes
d'équité (les six aléas, les zones de température, la remontée du ticket) — aucun tirage hors règle ne doit atteindre un
élève ; deux élèves différents → deux jeux différents ; même élève → même jeu.

## 9. Supports

Pas de trame (décision de Tristan : l'écran suffit). **Plus de corrigé fixe par jeu** : l'enseignant voit, **par élève**,
le jeu reçu, l'attendu et la réponse (dans le `detail` du suivi, ou une vue « corrigé de cet élève » si le corrigé actuel
ne sait pas le faire — le dire au compte rendu). `contenus/corriges/ENT-4.4.js` décrit la règle et la structure commune.

## 10. Questions ouvertes

- [ ] Seuils de temps réel (après l'essai d'ENT-4.1 en classe).
> **Réponses données d'avance par Tristan (03/10/2026, Cowork)** : ne pas s'arrêter pour les questions ci-dessous ; appliquer ces choix, et **lister au compte rendu** tout ce que tu as choisi seul (noms, textes, chiffres) pour que Tristan le corrige à l'écran.

- [x] **Noms fictifs, réserve de produits et plages de valeurs du tirage** (tranché le 03/10/2026) : **choisis par
  Claude Code** sur la grille du §5 (noms vérifiés par recherche web), listés au compte rendu ; Tristan les vérifie en
  passant l'évaluation.
- [x] **Mail d'accueil** : écrit par Claude Code, court, **sans conseil**.
- [x] ~~Attribution du jeu : alternance dans l'ordre alphabétique du groupe~~ — **supprimée le 03/10/2026** : un jeu
  tiré par élève, graine = identifiant (`docs/briefs/DECISION-jeu-unique-evaluations.md`).

---

## Compte rendu *(rempli par Claude Code à la livraison, 03/10/2026)*

- **Fichiers créés / modifiés** :
  - créés : `core/tirage.js` (tirage générique), `activites/picard-ent44.js`, `contenus/picard-ent44.js` (réserve,
    tirage, contraintes d'équité, réglage de la note `NOTE_ENT44`, mail), `contenus/corriges/ENT-4.4.js` ;
  - moteur : `core/types/quai.js` (second motif `deuxMotifs` / `motif2Attendu`, `etapesQuaiTire`, `resume` pour le
    détail de la copie), `core/types/entreprise.js` (`quai` en fonction de la graine : graine posée à l'ouverture,
    note et ramassage sur le quai de la base), `core/prof.js` (onglet Corrigés : « le corrigé de cet élève »),
    `core/copie.js` (`baseDeLEleve` exportée, rien d'autre) ;
  - `contenus/picard.js` (fournisseur fictif F-CDD, `catalogue(produits, fournisseur)`), `activites/index.js` (une
    ligne), `activites/FICHE-SEANCE.md` (tirage et second motif) ;
  - tests : 13 cas ENT-4.4 dans `outils/test/picard.mjs` ; **une ligne d'un cas existant de `outils/test/socle.mjs`
    réécrite** (la liste des séances Logisim gagne ENT-4.4). `outils/test.mjs` et `commun.mjs` non touchés.
- **Écarts par rapport au brief** :
  - **Seuils hors froid inatteignables avec 6 palettes** : un parcours juste sans aucun geste en trop prend déjà
    21 min 30 hors froid (6 min 30 de déchargement + 6 sondes + 6 comptages + 3 min pour rentrer le lot) ; un élève
    prudent qui lit les 6 étiquettes et fait le tour de chaque palette arrive vers 27-28 min. Avec « ≤ 20 → 3 », les
    3 points sont hors d'atteinte : le parcours juste et rapide fait **19/20**, pas 20. Les seuils du brief sont
    gardés tels quels dans `NOTE_ENT44` ; proposition à trancher : **≤ 25 → 3, ≤ 30 → 2, ≤ 35 → 1**. Le test « juste
    rapide → 20 » est écrit avec un temps hors froid ramené à 20 min dans l'état.
  - Le suivi de classe n'affiche pas le `detail` : le corrigé par élève est donc une **vue de l'onglet Corrigés**
    (choisir un élève du groupe actif : son camion, l'attendu, sa réponse jalon par jalon, sa note), et le détail
    est AUSSI rangé dans la copie (`detail.quai.jeu`, `detail.quai.graine`).
  - La palette « deux problèmes » demandait un **second motif** que la vue ne savait pas faire (demande au moteur
    non listée au §7) : ajouté, visible seulement quand la séance le déclare (ENT-4.1 à 4.3 inchangées à l'écran).
- **Décisions prises en route (à corriger à l'écran si besoin)** :
  - Noms fictifs : fournisseur **« Les Cuisines de la Deûle »**, transporteur **« Transports Polarix »** (aucune
    société de ce nom trouvée par recherche web le 03/10/2026) ; BL `CD-26-xxxx`, remorque `FR-xxx`, arrivée 06:00.
  - Réserve de 14 produits (pâtisseries et plats cuisinés), chacun avec sa « référence voisine » livrée par erreur :
    lasagnes bolognaise / aux légumes, gratin dauphinois / savoyard, hachis parmentier / de canard, bœuf
    bourguignon / carottes, blanquette de veau / de dinde, paëlla royale / au poulet, risotto champignons /
    asperges, tarte citron meringuée / citron, tarte aux pommes / fine aux pommes, éclairs chocolat / café, macarons
    assortis / chocolat, moelleux chocolat / cœur caramel, profiteroles / choux à la crème, tiramisu / framboise.
  - Plages tirées : palettes 3-4 × 2-3 × 4-5 cartons ; températures froides −22,4 à −18,6 °C, palette chaude −14,6 à
    −12,4 °C (toujours au-dessus de −15 : refuser) ; « double » : 1-2 manquants sur la couche du dessus + 1-3
    écrasés ; « avarie » : 1-3 écrasés ; tous les écrasés sur la **face arrière** (il faut faire le tour, comme P2
    d'ENT-4.1, et c'est la même face pour tous : équité du temps) ; « couche » : 2 à (couche − 2) cartons absents du
    dessus, BL = cartons réels ; remontée du ticket d'1 h, débutant entre 01:00 et 04:30, trois relevés au-dessus de
    −15 °C (−13,4 à −11,8).
  - Mail d'accueil : « lundi chargé : tu réceptionnes le camion de 6 h 00 au quai 32, sans moi. Les Cuisines de la
    Deûle, 6 palettes, transporteur Transports Polarix. »
  - Graine posée **une fois pour toutes** dans la base (`db.tirage`) : une base ouverte ensuite sous un autre
    identifiant garde son camion. Un élève qui n'a pas ouvert : le corrigé montre déjà le camion qu'il recevra.
  - 20 jalons pour tous : ticket, 6 comptages, 6 décisions, 4 réserves, pas de « déballage », signature, lot rentré.
- **Tests** (vérifié : suite entière 470/471 puis `socle` 47/47 après la ligne ENT-4.4 ; bloc `picard` 79/79) :
  500 graines conformes du premier coup (zéro secours, même structure, règle −18/−15, ticket) ; cinq sabotages
  refusés par le vérificateur ; même élève → même camion, 300 élèves → 300 camions ; jeu figé (valeurs à la main) ;
  meta ; graine posée, aucune aide, second motif sur chaque palette ; parcours juste → rien de visible avant la
  remise, copie 19/20, ramassage = même note ; deux problèmes (ligne de réserve, un seul motif → faux, motifs dans
  l'autre ordre → juste, motif en trop → faux) ; seconde quantité fausse → seule la réserve tombe ; notes du brief
  (rapide 20, palette fausse 18,42, BL non signé 14,25, tiers-temps 13 min 20 → 20 au lieu de 19) ; rechargement ;
  voisins ; corrigé par élève dans l'onglet ; ouverture dans Logisim. Éprouvés à l'envers : graine identique pour
  tous → 8 cas tombent ; second motif ignoré → le cas « deux problèmes » tombe.
- **Commits** : voir `git log` (« ENT-4.4 Picard : … »).
- **Reste ouvert** : seuils du temps réel (12 / 16 min, provisoires) et du hors froid (voir écart ci-dessus), à
  régler dans `NOTE_ENT44` avant le jour de l'évaluation ; le mode réel (Firebase) n'est pas couvert par la suite :
  la copie porte maintenant un `detail.quai.jeu` de 20 objets (taille modeste, pas de tableau de tableaux) ;
  réutilisation par Cdiscount ENT-2.5 : voir la fiche séance (une vue inventaire tirée reste à brancher).
