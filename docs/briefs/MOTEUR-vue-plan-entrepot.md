# Brief de chantier — MOTEUR : la vue « Plan d'entrepôt » (ranger, compter à une liste, préparer une commande)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/EN-COURS.md, puis le brief docs/briefs/MOTEUR-vue-plan-entrepot.md et ouvre la maquette docs/briefs/plan-entrepot/maquette-plan-entrepot-v2.html. Annonce la durée avant de commencer, découpe en lots (§10), puis enchaîne sans attendre : les questions du §13 ont toutes une valeur par défaut, applique-la et note au compte rendu ce que tu as choisi.
> ```

**Statut** : en cours — **lots 1 et 2 (le cœur, le mode rangement) et lot 4 (le mode préparation) livrés le 04/10/2026, validés à l'écran par Tristan le 06/10/2026** sur `outils/essai-entrepot.html` ; lot 3 (comptage, renvoyé à S2 France Boissons) et lot 5 à faire *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 04/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-plan-entrepot-cadrage.md` (décisions 1 à 22,
recalage Smoby, onglets, plan agrandi), `claude/prepalog-2de-s1-cadrage.md`.
**Modèle** : **Opus** (vue nouvelle du moteur).
**Durée estimée par Cowork** : **12 à 16 h** en lots livrables (§10). Ce qui prend le temps : les trois modes (rangement,
comptage, préparation) dans une seule vue, les critères déclarés (§6), le calcul des mètres (§5.4), et le bloc de tests
(inaction, sabotages, bonnes réponses écrites à la main).
**Quand** : quand le moteur est libre (un seul chantier moteur à la fois, voir `docs/EN-COURS.md` et
`COORDINATION-smoby.md`). Débloque **ENT-5.5** (rangement), puis une séance de préparation de commande (2de, à écrire) et
une séance d'inventaire au plan Smoby. Les **modes « visite »** (vue du ciel, photo légendée, repères photo) d'**ENT-5.3**
ne sont **pas** dans ce chantier (décision de Tristan, 04/10) : un second chantier suivra, après une maquette de la visite.

## 1. Pourquoi une vue nouvelle

Ranger une palette, compter un emplacement, prélever des cartons : l'élève doit **se repérer dans un entrepôt**, choisir une
**travée** puis un **emplacement**, et comprendre qu'une travée vue de dessus **cache plusieurs niveaux**. Aucune vue
existante ne le fait : `plan.js` est un plan de transport (villes, clients), `inventaire.js` est une liste d'articles sans
géographie. La vue servira au moins : ENT-5.5 (rangement, 2de), une séance de préparation de commande (2de, domaine 4 ;
bac C2.1-C2.2 ; CAP C3.1 à C3.4), l'inventaire au plan (Smoby, puis Cdiscount), la rotation ABC et la préparation par lot
(1re), plus tard la sécurité (plan affiché au mur) et la visite (second chantier).

**Principe décidé par Tristan (décision 8) : pas de maquette universelle.** Le moteur fournit des **briques** (racks
paramétrables, zones, critères types, modes) ; **chaque séance déclare son plan**. Rien de « Smoby » dans `core/`.

## 2. La référence : la maquette v2

`docs/briefs/plan-entrepot/maquette-plan-entrepot-v2.html` (double-clic, un seul fichier, aucune requête). **Validée par
Tristan le 04/10/2026** après plusieurs tours (recalage Smoby, onglets plan / vue, cartes une ligne = une info, plan agrandi).
**Elle fait foi pour l'interaction, pas pour le code** : état global, stock tiré par un générateur, géométrie en pixels
écrite à la main. Reprendre le comportement, pas le code.

- **En-tête de la maquette** (onglets ① Rangement / ② Inventaire / ③ Préparation, Guidage / Entraînement / Évaluation,
  « charge déjà posée », Recommencer) : **seulement pour l'essai**, c'est la future page d'essai (§9).
- **Données** en tête du script (`PLAN`, `PROD`, `IMPOSE`/`STOCK`, `PALETTES`, `LISTE`, `CTN`, `CMD`, `PICK0`) et
  **figées** dans `docs/briefs/plan-entrepot/donnees-maquette.json` (stock de départ complet, 99 emplacements occupés, bonnes
  réponses, meilleurs tours) : **le contenu d'essai reprend ce fichier tel quel, sans générateur aléatoire.**
- **Critères** : `fautes()` (rangement), `reglesPalette()` (palette de commande), `bilanPrep()` (indicateurs).
- En bas de la maquette, « Pour l'enseignant : ce que la séance déclare au moteur » : brouillon de la déclaration, à lire.

Contrôlé par Cowork le 04/10 (navigateur sans écran, 1366 × 768 et 1920 × 1080, thèmes clair et sombre, vrais clics) :
les trois cas × trois niveaux sans erreur, aucune requête hors du fichier, fins de ligne LF.

## 3. Ce que fait la vue : l'écran

**Une entrée du menu de l'environnement d'entreprise** (comme le quai, l'inventaire, le planning), libellé donné par le
contenu (« Plan de l'entrepôt », « Ranger les palettes », « Inventaire tournant »…). De haut en bas :

### 3.1 La barre d'adresse et la consigne numérotée

Toujours en haut de la vue : **l'adresse qui se construit** en **4 cases lettrées** — `A1` (allée · côté) – `T03` (travée) –
`N2` (niveau) – `E1` (emplacement) — avec la case suivante en surbrillance ; le survol d'un emplacement remplit les cases.
À droite, **une consigne numérotée** ① ② ③ qui dit le geste suivant (« Choisissez une travée sur le plan »,
« Choisissez le niveau et l'emplacement dans la vue de face »). Adresse **`A1-T03-N2-E1`**, une lettre devant chaque
partie (décision 10) ; **niveau 1 = sol** ; « **emplacement** », jamais « place » (décision 6).

### 3.2 Le bandeau (au-dessus, toute la largeur)

À gauche, le **message du personnage** (date, heure, texte selon le temps) ; au centre, la **liste de travail** en cartes
côte à côte ; à droite, les **boutons** (Vérifier / Terminer…) et **« Les règles ▾ »**, qui s'ouvre **par-dessus le plan**
(état gardé d'un clic à l'autre). **Le bandeau ne change jamais de hauteur pendant la manipulation** (correctif du 04/10 :
une consigne affichée dans une carte faisait passer le plan de 418 à 220 px de haut).

- **Rangement** : une carte par palette, **une ligne = une information** (demande de Tristan) : titre « [P1] Maison Neo
  Jura Lodge », puis `Poids` · `Gamme` · `Rotation` · `Contrainte` (lourd / fragile / —) · `Réception` (conforme, ou la
  réserve en texte rouge : « 1 carton écrasé ») · `Emplacement` (« — », « en main » ou l'adresse). Après vérification, le
  verdict tient en une ligne sous la carte.
- **Comptage** : 8 cartes d'adresses (2 rangées), « … » puis « 46 ctn » une fois compté.
- **Préparation** : une carte par ligne du bon (n°, adresse, désignation, étiquettes LOURD / FRAGILE, commandé, prélevé) ;
  en évaluation, le **choix du parcours** (serpentin / retour) dans le bandeau.

### 3.3 La colonne de côté (230 px, à gauche du plan et de la vue ouverte)

Toujours visible : en guidage, **la consigne de l'objet en main**, une information par ligne (« Consigne pour P1 : gamme
Maisons et ateliers : côté A1 ou B2 / produit lourd : début de parcours (allée A) / rotation rapide : T01, niveau N1 ou N2 /
vérifie la charge du niveau »), avec une ligne réservée dès le départ (« Prenez une palette : sa consigne s'affiche ici ») ;
« Cliquez une travée sur le plan : elle s'ouvre en grand » (onglet plan seulement) ; **l'implantation** (A1 Maisons et
ateliers…) ; en préparation : « N1 = picking · N2-N3 = réserve » et le compteur de mètres (§5.4).

### 3.4 Deux onglets : le plan **ou** la vue ouverte (demande de Tristan, 04/10)

Sous le bandeau, à droite de la colonne de côté, **un seul grand espace** qui montre :

- **le plan vu de dessus** (§4), **ou**
- **la vue ouverte**, en pleine largeur : la travée vue de face (§4.3), la fiche de comptage, la fiche de prélèvement, la
  palette de commande, le tableau des écarts.

Un clic sur une travée **ouvre** la vue ; **en-tête fixe de la vue ouverte** : à gauche un **fil** (« Plan › Travée B1-T04
(vue depuis l'allée B) › Comptage B1-T04-N2-E1 ») ; au milieu **le message** du dernier geste (« P1 posée en
A1-T01-N1-E3. », « Emplacement déjà occupé. La palette reste en main. ») — **à hauteur fixe**, pour que les emplacements ne
bougent pas sous la souris ; à droite **un gros bouton vert plein « ← Retour au plan »** (« ← Retour à la travée » depuis
une fiche ; « ✕ Annuler le réapprovisionnement » pendant un réappro). **Échap** fait la même chose (sauf dans un champ de
saisie). Le bouton est masqué quand la vue est figée (tableau des écarts, palette terminée). En préparation, l'en-tête porte
aussi « Palette de commande (n) ». Un onglet **dans la page**, pas une fenêtre du navigateur (la partie serait perdue).

⚠ **Charte** : le bouton « Retour » de la maquette est un aplat vert plein. Le vert plein ne dit que « juste »
(`CLAUDE.md`) : **le rendre en bouton plein `--ardoise` seulement si la charte du moteur l'autorise déjà pour un bouton
d'action** (« Vérifier », « Envoyer » le sont-ils ?) ; sinon bordure épaisse + flèche, bien visible, en haut à droite.
Le dire au compte rendu.

## 4. Le plan

### 4.1 Le plan vu de dessus (`800 × 562` dans la maquette)

- Les **racks** : chaque **côté** (`A1`, `A2`, `B1`, `B2`) est découpé **entre chaque échelle** (montants dessinés) ;
  chaque **travée** est une grande case cliquable (focus clavier, Entrée) qui montre `T03` et une **pile de 3 × 3 petits
  carrés** (niveaux × emplacements) avec les lisses : l'élève voit que **la travée cache 3 niveaux** (décision 2). Couleurs
  des petits carrés : occupé (gris), posé par l'élève (carton), compté (accent), hors service (hachures rouges), libre (fond).
  **T01 en bas, près de l'allée principale.**
- Les **allées** entre les racks (« ALLÉE A », « ALLÉE B », écrites à la verticale), le **passage du haut** qui les relie,
  l'**allée principale** en bas (lignes jaunes au sol, flèches de sens unique sauf en évaluation de la préparation), les
  **quais** sur le mur du bas, sous l'allée principale (« QUAI 1 · E1 » en préparation).
- **À droite des racks** (déplacé là le 04/10 pour agrandir le plan) : **zone litiges** (`L1`, `L2`, cliquables), **bureau
  du chef de quai**, **zone de réception** (rangement : les palettes à ranger, en 2 × 2, cliquables) ou **zone
  d'expédition** (préparation : la palette de commande, cliquable). Rose des vents en haut à droite.
- **La place libre en largeur est réservée pour ajouter des allées** quand l'exercice se complique (décision de Tristan,
  04/10) : le moteur doit dessiner **n allées** déclarées, pas deux en dur.
- **Le regard** : quand une travée est ouverte, un œil dans l'allée et une flèche vers le rack montrent d'où l'on regarde.
- **Guidage du rangement** : bandes de **rotation** (A rapide / B moyenne / C lente) en fond, légende à la verticale à
  droite des racks. **Parcours de prélèvement** (rangement ; préparation hors évaluation) : tracé en pointillés, « départ »
  en bas de l'allée A, « arrivée » en bas de l'allée B, flèches.
- **Préparation** : numéros des lignes du bon sur les travées (guidage), **trace du tour de l'élève** (trait ambré qui suit
  les allées) et points de prélèvement.

### 4.2 Les briques déclarées

Côtés de rack **à un ou deux côtés par allée**, numérotés **selon le plan** (A1, A2, B1, B2…, décision 10) ; travées,
niveaux, emplacements par niveau (**3 palettes par niveau**, décision 5) ; **charge maximale par niveau** (somme des
palettes du niveau) ; hors service ; **gammes** (plan d'implantation) ; zones (litiges, réception / expédition, bureau,
quais). Prévoir dans la forme (sans les dessiner dans ce chantier) : cellule produits dangereux, zone sécurisée, stockage au
sol, chambre froide (décision 4).

### 4.3 La travée vue de face

La travée **se relève** (animation courte de bascule, coupée si `prefers-reduced-motion`) : **3 niveaux × 3 emplacements**,
montants bleus, lisses orange, sol. Sur chaque niveau : l'étiquette `A1-T01-N2`, la **plaque jaune** « max 1 200 kg /
niveau » (rangement), et l'**aide désactivable « déjà posé : 840 kg »** (case « charge déjà posée » ; coupée en évaluation).
Voisines « ← T02 » / « T00 → » sur les bords, selon le côté regardé. Chaque emplacement est une **grande cible** (≈ 150 ×
110 dans la maquette) avec son contenu :

| Mode | Emplacement occupé montre | Clic |
|---|---|---|
| Rangement | gamme courte + poids (« Maison 410 kg »), palette de l'élève en carton | pose la palette en main (§5.1) |
| Comptage | l'**étiquette** (référence `SM-311054`), **pas la quantité** | ouvre la fiche de comptage (§5.2) |
| Préparation | N1 : désignation + « 22 ctn / min 6 » (bordure rouge si sous le minimum) ; N2-N3 : « réserve » | N1 : fiche de prélèvement ; N2-N3 : refus ou réappro (§5.3) |

Hors service : hachures + « HORS SERVICE ». Libre : « libre ».

## 5. Les trois modes

### 5.1 Rangement (cas ENT-5.5)

Prendre une palette (carte du bandeau **ou** palette de la zone de réception) → choisir une travée (ou la zone litiges) →
choisir l'emplacement. **Emplacement occupé : refus immédiat** (« Emplacement déjà occupé. La palette reste en main. »,
décision 12). Hors service et surcharge sont **acceptés** puis jugés faux à la vérification. Reprendre une palette posée =
cliquer sa carte. **Pas d'imprévu** (décision 13). **Aucune règle ni remarque « lourd en bas » dans un rack** (décisions 7
et 14) : une palette sur une lisse n'écrase rien.

**Critères** (déclarés par la séance, §6) : type de produit (gamme du côté) · **parcours : lourd en début de parcours, fragile
en fin de parcours** · rotation ABC (travées et niveaux) · fragile pas en N3 · poids (charge totale du niveau) · état (libre,
en service) · litige (zone litiges ou pas). « Vérifier mon rangement » affiche le verdict **dans la carte** de chaque palette.

### 5.2 Comptage à une liste d'adresses (inventaire)

L'élève reçoit une **liste d'adresses** (décision 11) ; il va sur la travée, ouvre l'emplacement et voit la **fiche de
comptage** : étiquette (référence + désignation, **jamais la quantité**), **la palette de cartons dessinée en perspective**
(décision 19 : proportions propres à chaque produit, ruban, étiquette, flèches « haut », palette en bois ; **couches du
dessous complètes**, les cartons manquants se voient sur la couche du dessus, le carton en trop est posé dessus), champ
« Cartons comptés » + Enregistrer (Entrée). Encadré « Compter une palette » (couche = largeur × profondeur, × couches
complètes, + couche du dessus).

- **Aucune surbrillance** des adresses de la liste dans la vue de face (décision 20) : l'élève cherche seul.
- **Aucun message « pas sur votre liste »** (décision 21) : toute palette s'ouvre et se compte ; un comptage à une mauvaise
  adresse ne remplit pas la liste mais **est gardé comme trace d'erreur**, visible de l'enseignant, et **fait perdre des
  points** (§7).
- « Terminer le comptage » (actif quand les 8 sont comptées) → **tableau des écarts** : adresse, produit, compté,
  théorique (affiché **seulement maintenant**), **colonne écart à remplir par l'élève** (compté − théorique, décision 17),
  « Vérifier mes écarts » → ✓ / ✗ par ligne, « Écarts justes n/8 · comptages justes n/8 ».

### 5.3 Préparation de commande au colis complet

**N1 = picking, N2-N3 = réserve.** Bon de préparation (lignes : adresse, produit, quantité), palette de commande en zone
d'expédition, enlèvement (transporteur, heure, quai).

- **Prélever** : clic sur un emplacement N1 → fiche de prélèvement (étiquette, « Picking : 22 cartons · minimum 6 »,
  « 5 kg le carton · lourd / fragile », dessin des cartons restants, champ « Cartons à prélever », Prélever). Prélever plus
  que le stock du picking : refus. Clic sur N2-N3 : « palette de **réserve** : on prélève au niveau N1 ».
- **Réapprovisionner** : « ↻ Descente de la réserve » sur la fiche (refusé si le picking n'est pas sous son minimum) →
  bandeau ambré « cliquez la palette de réserve de la même référence » → clic sur une palette N2-N3 : mauvaise référence,
  N1 ou vide = refus ; juste = le cariste (CACES 5) descend la palette, **l'emplacement de réserve se libère**, le picking
  augmente.
- **« ↶ Reposer le dernier »** annule le dernier prélèvement.
- **La palette de commande** se monte **dans l'ordre du prélèvement** (pas de placement à la main) : vue de face, couches
  dessinées par produit (lourd plus foncé, fragile plus clair avec « FRAGILE »), étiquette de chaque couche (« 2. Établi × 6
  (48 kg) »), trait rouge « 1,80 m max (transporteur) », poids et hauteur en tête.
- **Terminer la préparation** → film étirable (liste 1 à 6 tours) et étiquettes d'expédition (5 cases : avant, arrière,
  gauche, droite, dessus) → « Vérifier ma préparation » → indicateurs ; « Reprendre la préparation » pour corriger.

**Le parcours (§5.4) et le temps pédagogique** (décision de Tristan, 04/10) :

| | Guidage | Entraînement | Évaluation |
|---|---|---|---|
| Ordre de la liste | trié dans l'ordre du serpentin | désordre (déclaré) | désordre |
| Parcours | serpentin imposé, dessiné, numéros des lignes sur le plan | serpentin imposé (sens unique), dessiné | **l'élève choisit serpentin ou retour** (allées à double sens ce jour-là), **verrouillé au 1er prélèvement**, non dessiné |
| Aide sur la fiche | reste à prélever, rupture expliquée | — | — |

### 5.4 Les mètres parcourus

Points de prélèvement **au milieu de l'allée, devant la travée** (les deux côtés d'une allée = même point). Tour = quai →
points dans l'ordre → quai.
- **Serpentin** (sens unique) : on monte l'allée A, passage du haut, on redescend l'allée B, retour par l'allée principale ;
  **revenir en arrière = refaire un tour complet** (affiché « 3 tours » au compteur et au bilan).
- **Retour** : on entre dans chaque allée par l'allée principale et on en ressort par le même bout.
- **Meilleur tour** : recherche exhaustive sur l'ordre des points (6 lignes, 4 points distincts dans la maquette).

**Valeurs de la maquette** (100 px = 3 m ; géométrie dans `donnees-maquette.json`, `geometrieMaquette`) : serpentin juste
**47 m**, retour **40 m** (toutes les lignes sont en T01-T02 : le retour gagne — c'est le lien rotation ↔ parcours),
liste du désordre suivie en serpentin **141 m (3 tours)**. **Le moteur calcule en mètres à partir de dimensions déclarées**
(longueur d'une travée, entraxe des allées, longueur du passage du haut, position du quai) : proposer la forme, reproduire
ces trois valeurs avec le contenu d'essai, sinon **recalculer et le dire au compte rendu** (les fiches et ENT-5.5 citent
47 / 40).

## 6. Les critères : déclarés par le contenu, types fournis par le moteur

Le moteur fournit des **types** ; chaque séance déclare les siens avec un `id`, un **nom court** (affiché en entraînement :
« critère : parcours ») et un **message** (guidage) qui respecte « **que**, pas **de combien** » (« la charge totale du niveau
dépasse son maximum », jamais « de 57 kg »).

### 6.1 Rangement (`fautes(id, adresse)` de la maquette)

| Type | Paramètres | Faux si | Message (guidage) |
|---|---|---|---|
| `etat` | — | emplacement hors service | « emplacement hors service » |
| `litige` | — | palette en litige hors zone litiges, ou palette saine en zone litiges | « carton écrasé : elle va en zone litiges » / « elle n'est pas en litige : elle va en stock » |
| `gamme` | gammes des côtés | côté qui n'a pas la gamme du produit | « la gamme Cuisines se range en B2 » |
| `parcours` | `debut: 'A'`, `fin: 'B'` (allées), classe du produit | **lourd** hors de l'allée de début, **fragile** hors de l'allée de fin (jugé seulement si la gamme est juste) | « produit lourd : en début de parcours (allée A) » |
| `rotation` | classes `A/B/C` → travées et niveaux | travée ou niveau hors de sa classe | « rotation rapide : T01, niveau N1 ou N2 » |
| `niveauInterdit` | `si: fragile`, `niveaux: [3]` | fragile en N3 | « pas au niveau N3 » |
| `charge` | charge max par niveau du côté | somme des palettes du niveau (stock + élève) > max | « la charge totale du niveau dépasse son maximum » |

Rotation (recalée sur des sources le 04/10 : rackdestockage.eu, mecalux.fr) : **A → T01, N1 ou N2 · B → T02 · C → T03-T04,
tous niveaux** (classes sans recouvrement ; la classe est sur la fiche produit). Parcours (MWPVL, slotting ; CIRRELT
2015-49) : l'implantation prépare l'ordre de la palette préparée — lourds au début, fragiles à la fin.

**Le moteur calcule les bonnes réponses** (tous les emplacements libres sans faute, sur le stock de départ) : elles servent à
la page d'essai (vue enseignant) et aux tests ; **jamais affichées à l'élève**.

### 6.2 Palette de commande (`reglesPalette()` de la maquette)

Chaque produit porte une **classe** : `lourd` (carton ≥ 15 kg) > `normal` > `fragile`. Règle des sources : **jamais une
classe plus lourde posée sur une classe plus fragile**, jugée en deux critères :

| Critère | Faux si |
|---|---|
| `lourds en bas` | un carton lourd prélevé après un non-lourd |
| `fragiles en haut` | quoi que ce soit prélevé après un fragile |
| `poids` | poids de la palette (support compris) > max transporteur |
| `hauteur` | hauteur (support + couches arrondies au supérieur) > max transporteur |
| `film` | tours de film hors de 3 à 5 |
| `étiquettes` | pas exactement 2 côtés opposés + dessus |

⚠ **Piège d'inaction** : une palette vide ou incomplète respecte « lourds en bas », « fragiles en haut », poids et hauteur.
Ces critères ne comptent **que si toutes les lignes du bon sont prélevées en quantité juste** (§7).

## 7. Jalons (lus dans l'état de la vue)

Un jalon de la vue = une étape du suivi (`etapes…` comme `etapesQuai`, `etapesPlanning`). Jalons **déclarés par la
séance** ; types proposés :

| Mode | Jalon type | Vrai si | Garde contre l'inaction |
|---|---|---|---|
| Rangement | `palette(id)` | la palette est posée **et** aucun critère faux à son adresse | non posée = faux |
| Comptage | `comptagesJustes` (ou un par adresse) | chaque adresse de la liste comptée au réel | non comptée = faux |
| Comptage | `ecartsJustes` | chaque écart saisi = compté − théorique **de l'élève** | seulement après « Terminer le comptage » |
| Comptage | `aucunHorsListe` | aucun comptage hors liste | **seulement si les 8 adresses sont comptées** (sinon il récompense l'inaction) |
| Préparation | `lignesJustes` | chaque ligne prélevée en quantité juste, aucune ligne hors commande | — |
| Préparation | `reappro` | la ligne en rupture a été réapprovisionnée depuis la bonne référence | rupture non traitée = faux |
| Préparation | `palette` (ou un par critère) | les critères §6.2 | **seulement si `lignesJustes`** |
| Préparation | `parcours` | mètres ≤ meilleur tour du mode (**sans marge**, Tristan 04/10 ; tolérance déclarable pour plus tard) | au moins une ligne prélevée |

**ENT-5.5** déclare 4 jalons de rangement (P1 à P4, voir son brief). Les autres jalons d'ENT-5.5 (saisie de l'entrée,
lecture du stock, message) sont hors de cette vue.

**Ranger sans afficher** (indicateurs de repérage, chantier à part) : clics sur « Vérifier », comptages hors liste (adresses),
essais de prélèvement en réserve, nombre de tours, heure du premier geste.

## 8. Temps pédagogique et évaluation

| | Guidage | Entraînement | Évaluation |
|---|---|---|---|
| Message du personnage | précis | moyen | court |
| Consigne de l'objet en main (colonne de côté) | oui | non | non |
| Bandes de rotation, parcours dessiné | oui | parcours seul | non (« affichés au mur ») |
| « Les règles ▾ » | oui | oui | non (rangement) / non (préparation) |
| Aide « charge déjà posée » | oui (désactivable) | oui (désactivable) | coupée |
| Verdict rangement | critère par critère, expliqué | nom du critère seul | voir ⚠ |
| Bilan préparation | ligne par ligne et règle par règle, expliqué | nom du critère (« quantité », « fragiles en haut ») | chiffres + ✓ / ✗ global (n/6) |

✅ **Évaluation : tranché par Tristan le 04/10** (écart à la maquette, qui affichait ✓ / ✗ après « Vérifier ») : **comme le
Planning** — en évaluation, « Vérifier » devient « **Rendre mon travail** » (copie rendue existante : `meta.copie`, `noter`),
**rien n'est signalé avant** ; la note = jalons réussis / jalons × 20. La colonne « Évaluation » du tableau ci-dessus vaut
donc **après** la copie rendue.

## 9. API de contenu (proposée par Cowork : l'adapter si le code l'impose, et le noter au compte rendu)

Sur le modèle de `quai`, `inventaire`, `planning` : la vue n'existe que si la séance déclare **`entrepot`** dans
`creerEntreprise` (nom à confirmer : **`plan` est déjà pris par la vue transport**). État dans **`db.entrepots[<id>]`**,
**cloisonné par séance**.

```js
entrepot: {
  id: 'smoby-rangement',
  libelle: 'Plan de l\'entrepôt',                 // entrée de menu
  mode: 'rangement',                               // 'rangement' | 'comptage' | 'preparation'
  plan: {
    allees: [ { id: 'A', cotes: ['A1', 'A2'] }, { id: 'B', cotes: ['B1', 'B2'] } ],    // n allées, 1 ou 2 côtés
    cotes: { A1: { gammes: ['MAT'], charge: { 1: 3000, 2: 1200, 3: 1200 } },
             B2: { gammes: ['CUI', 'MAT'], charge: { 1: 3000, 2: 800, 3: 800 }, note: 'ancien rack' }, … },
    travees: 4, niveaux: 3, emplacements: 3,
    horsService: ['A1-T02-N2-E2', …],
    zones: { litiges: ['L1', 'L2'], reception: true, bureau: 'chef de quai', quais: ['QUAI 1', 'QUAI 2', 'QUAI 3'] },
    parcours: { debut: 'A', fin: 'B', sens: 'serpentin' },
    rotation: { A: { lib: 'rapide', travees: [1], niveaux: [1, 2] }, B: { … }, C: { … } },
    metres: { travee: 3, … },                      // §5.4
  },
  gammes: { MAT: 'Maisons et ateliers', CUI: 'Cuisines', VEH: 'Véhicules', PLA: 'Plein air' },
  produits: { MAI: { nom, ref, gamme, couches: [2, 2, 2], carton: [1.4, 1.2, 1.3], classe: 'lourd', kgCarton: 50, … } },
  stock: { 'A1-T01-N1-E1': { produit: 'MAI', kg: 420 }, … },     // figé (donnees-maquette.json)
  criteres: [ { type: 'etat' }, { type: 'litige' }, { type: 'gamme' }, { type: 'parcours' }, { type: 'rotation' },
              { type: 'niveauInterdit', si: 'fragile', niveaux: [3] }, { type: 'charge' } ],
  // rangement
  palettes: [ { id: 'P1', produit: 'MAI', kg: 420, rotation: 'A', reception: null }, { id: 'P3', …, litige: true,
              reception: '1 carton écrasé' }, … ],
  // comptage
  liste: ['A1-T01-N1-E2', …], ecarts: { 'A1-T03-N2-E3': -2, … },          // écarts cachés à l'élève
  // préparation
  commande: { num, client, enlevement, transporteur, heure, hMax: 1.80, kgMax: 800, support: { h: .15, kg: 25 },
              lignes: [ { a: 'A1-T01-N1-E1', produit: 'MAI', q: 2 }, … ], desordre: [4, 5, 3, 0, 2, 1] },
  picking: { 'B1-T01-N1-E1': { q: 2, min: 6 }, … },                         // les autres N1 : plein, min = max(2, théorique/4)
  personnage: { nom: 'Bruno', role: 'chef de quai', date: 'mer. 9 déc., 17 h', texte: { guidage, entrainement, evaluation } },
  jalons: [ … ],                                   // §7
}
```

Le libellé du menu, les textes, les couleurs viennent du contenu et du `THEME` de l'entreprise.

## 10. Fichiers attendus (indicatif) et lots

**Fichiers** : `core/types/entrepot.js` (vue, critères, jalons, `etapesEntrepot` ; contrat `nav` / `html` / `brancher` /
`etatNeuf` comme `quai.js`) ; câblage minimal dans `core/types/entreprise.js` ; `styles/entrepot.css` (chargé par
`index.html` ; toute variable nouvelle déclarée **trois fois** ; teintes translucides ; jamais de vert plein hors « juste » ;
contrastes ≥ 4,5 à mesurer, notamment sur les lisses et les plaques en thème sombre) ; `contenus/entrepot-essai.js` (les trois
cas de la maquette, données de `donnees-maquette.json`) ; page d'essai `outils/essai-entrepot.html` (+ `.js`) avec l'en-tête
de la maquette (mode, temps, élève / enseignant, bonnes réponses visibles côté enseignant) ; `outils/test/entrepot.mjs` +
**une ligne dans `BLOCS`** (**le dire à Tristan**, alerte 7) ; `activites/FICHE-SEANCE.md` : section « vue Plan
d'entrepôt » ; `docs/decisions.md` : les décisions du §12.

**Lots** (chacun commité ; pousser quand la suite est verte) :

1. **Le cœur** (3-4 h) : plan vu de dessus déclaré (n allées, côtés, travées, zones à droite), vue de face, onglets plan /
   vue ouverte avec en-tête fixe et bouton retour, barre d'adresse, bandeau et colonne de côté, état `db.entrepots`,
   entrée de menu ; page d'essai avec le mode **rangement** sans critères (poser / refuser l'occupé / reprendre).
2. **Rangement complet** (2-3 h) : critères §6.1, bonnes réponses calculées, verdicts selon le temps, consigne de guidage,
   bandes de rotation et parcours dessiné, aide « charge déjà posée », jalons `palette(id)`.
3. **Comptage** (2-3 h) : fiche de comptage, **dessin des cartons en perspective** (reprendre `pile()` de la maquette),
   liste, trace hors liste, tableau des écarts, jalons.
4. **Préparation** (3-4 h) : picking / réserve, minimum, réappro, palette par ordre de prélèvement, critères §6.2, film et
   étiquettes, mètres (§5.4) serpentin / retour et meilleur tour, trace du tour, indicateurs et bilans selon le temps, jalons.
5. **Évaluation, tests, fiche, compte rendu** (le reste).

## 11. Tests attendus (bloc `entrepot`)

Valeurs **écrites à la main** dans le test (trouvées par la maquette le 04/10, à recontrôler contre le moteur avant de les
figer) :

- **Rangement — bonnes réponses** : **P1** Maison = `A1-T01-N1-E3` seule ; **P2** Cuisine = `B2-T02-N1-E2`, `B2-T02-N1-E3` ;
  **P3** Établi (litige) = `L1`, `L2` ; **P4** Porteur = `B1-T03-N3-E1`, `B1-T04-N1-E2`, `B1-T04-N3-E2`.
- **Rangement — chaque piège nomme son critère, et lui seul** : P1 en `A1-T01-N2-E3` → poids ; `A1-T02-N1-E2` → rotation ;
  `B2-T01-N1-E3` → **parcours** ; `A1-T03-N1-E1` → rotation. P2 en `B2-T02-N2-E2` → poids ; `B2-T02-N3-E2` → **fragile
  (N3) seul** ; `B2-T03-N1-E3` → rotation ; `B2-T01-N1-E3` → rotation ; côté A2 → type de produit. P4 en `B1-T01-N2-E3` →
  rotation ; `B1-T04-N2-E3` → état. P3 en rack → litige. Emplacement occupé (`A2-T02-N1-E2`) → refusé, palette en main.
- **Garde de la décision 7** : une palette posée **au-dessus d'une plus légère**, charge respectée → **aucune** faute.
- **Comptage** : liste `A1-T01-N1-E2` (8) · `A1-T03-N2-E3` (théorique 36, réel **34**) · `A2-T02-N2-E2` (12) ·
  `A2-T04-N1-E1` (12) · `B1-T01-N2-E1` (36) · `B1-T03-N1-E3` (24, réel **21**) · `B2-T02-N1-E1` (48) · `B2-T04-N2-E2`
  (48, réel **49**). Parcours juste → 8/8 et 8/8 ; un comptage hors liste → trace + jalon `aucunHorsListe` faux ; **rien
  compté → `aucunHorsListe` faux aussi** (inaction) ; le théorique n'apparaît nulle part avant « Terminer ».
- **Préparation** : bon `A1-T01-N1-E1` Maison × 2 · `A1-T02-N1-E1` Établi × 6 · `B1-T02-N1-E3` Tricycle × 4 ·
  `B1-T01-N1-E2` Porteur × 6 · `B1-T01-N1-E1` Trotteur × 6 (**rupture** : 2 au picking, min 6 ; réserve juste au-dessus en
  `B1-T01-N2-E2` ou `N3-E1/E2/E3` ; **piège `B1-T01-N2-E1` = Porteur**) · `B2-T01-N1-E1` Cuisine × 8 (fragile, en dernier).
  Guidage dans l'ordre → **47 m**, 6/6, palette conforme 6/6, **331 kg, 1,74 m** ; Cuisine prise avant Porteur et
  Trotteur → mètres inchangés mais « fragiles en haut » faux ; évaluation en retour → **40 m** ; ordre du désordre en
  serpentin → **141 m, 3 tours**, « lourds en bas » et « fragiles en haut » faux ; prélever en réserve → refusé ; réappro
  avec picking au-dessus du minimum → refusé ; **palette vide terminée → aucun jalon vrai**.
- **« Que, pas de combien »** : relire tous les messages de faute produits par les sabotages (aucun « de 57 kg »).
- **Temps** : guidage / entraînement / évaluation (§8) ; en évaluation, rien de signalé avant la copie rendue ; note
  (valeurs écrites à la main).
- **Onglets** : clic sur une travée → vue ouverte, plan caché ; bouton et Échap → retour ; depuis une fiche → retour à la
  travée ; **le bandeau garde la même hauteur** avant / après avoir pris une palette (mesurer).
- **État** retrouvé après rechargement ; deux séances ne se mélangent pas (cloisonnement). **Sabotages** : chaque jalon tombe
  quand on casse son critère.
- Piloter l'écran au moins une fois (souris sur `boundingBox()` après `scrollIntoViewIfNeeded()`), à 1366 × 768.

## 12. Décisions à reporter dans `docs/decisions.md` (Tristan, 04/10/2026)

Logique « je choisis la travée, puis l'emplacement » ; palettier découpé entre chaque échelle ; 3 palettes par niveau ;
« emplacement », jamais « place » ; adresse `A1-T03-N2-E1` ; allées à double sens, côtés numérotés selon le plan ; pas de
« lourd en bas » dans un rack (charge totale du niveau seulement) ; occupé refusé ; pas d'imprévu au rangement 2de ;
comptage à une liste, à l'aveugle, sans surbrillance, sans message « pas sur votre liste », comptage hors liste = trace +
points perdus ; l'élève calcule l'écart ; cartons dessinés ; rotation ABC sur sources ; parcours lourd au début / fragile
à la fin, implantation Smoby recalée (Cuisines en B2) ; palette « jamais une classe plus lourde sur une plus fragile » ;
parcours gradué en préparation ; une ligne en rupture ; bandeau au-dessus ; cartes une ligne = une info ; onglets plan /
vue ouverte ; zones à droite du plan, place réservée pour d'autres allées ; pas de maquette universelle.
⚠ `docs/EN-COURS.md` indique qu'une autre session écrit dans `docs/decisions.md` : **Cowork n'y a pas touché** ; Claude
Code les ajoute quand le fichier est libre.

## 13. Questions ouvertes (chacune a une valeur par défaut : l'appliquer et le dire au compte rendu)

1. ~~Évaluation~~ : **tranché par Tristan le 04/10 : comme le Planning**, rien avant la copie rendue (§8).
2. **Nom de la clé** : `entrepot` / `db.entrepots` ? *(Défaut : oui.)*
3. **Bouton « Retour » en aplat vert** : autorisé par la charte ? *(Défaut : non → bordure épaisse ; le dire.)*
4. **Un mode par séance ou plusieurs ?** *(Défaut : un mode par déclaration ; une séance qui en voudrait deux déclare deux
   entrées de menu.)*
5. ~~Picking hors de sa classe de rotation~~ (Cuisine B et Porteur C en picking T01, cas 3) : **tranché par Tristan le
   04/10 : on garde les données et on l'explique en classe** (le picking suit la rotation en cartons, pas en palettes) ;
   le moteur ne le juge pas.
6. ~~Tolérance du jalon `parcours`~~ : **tranché par Tristan le 04/10 : meilleur tour exact** (0 m de marge).
7. **Le critère `parcours` ne peut pas piéger un fragile** dans le plan Smoby (les Cuisines ne sont qu'en B2 : le type de
   produit arrête avant). Accepté par Cowork ; à garder en tête pour la 1re.
8. **Teintes** : reprendre celles de la maquette (gris occupé, carton, ambre du tour, jaune des plaques) en variables ;
   contrastes à mesurer en thème sombre.

## 14. Critères de validation par Tristan

Sur la page d'essai, à 1366 × 768 : le plan se lit comme un vrai entrepôt et se voit en grand ; la travée s'ouvre en grand
et le retour se trouve sans chercher ; les cartes se lisent ligne par ligne ; les trois modes se jouent comme dans la
maquette, dans les trois temps ; les bonnes réponses et les mètres sont ceux du §11.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

*Lots 1 et 2 (04/10/2026, Claude Code) — le reste viendra avec les lots 3 à 5.*

- **Fichiers créés / modifiés** : `core/types/entrepot.js` (nouveau : vue, critères, jalons, `etapesEntrepot`,
  `noteEntrepot`, `bonnesReponses`) ; `core/types/entreprise.js` (câblage : menu, état `db.entrepots`, note en
  évaluation, couleurs du décor reposées quand l'entreprise impose le papier) ; `styles/entrepot.css` (nouveau, variables
  déclarées trois fois) et sa ligne dans `index.html` ; `contenus/entrepot-essai.js` (cas rangement, stock figé repris de
  `donnees-maquette.json` par script) ; `outils/essai-entrepot.html` + `.js` ; `outils/test/entrepot.mjs` et **une ligne
  dans `BLOCS` de `outils/test.mjs`** ; `activites/FICHE-SEANCE.md` (section « Plan d'entrepôt ») ; `docs/decisions.md`.
- **Écarts par rapport au brief** : la vue tient dans l'environnement d'entreprise (menu à gauche, bandeau rouge en haut)
  et non sur tout l'écran comme la maquette : le plan prend la hauteur qui reste sous le bandeau (420 px environ à
  1366 × 768) ; la case « charge déjà posée » passe dans l'en-tête de la vue ouverte ; pas d'œil « regard » sur le plan
  (il est caché quand la travée est ouverte, le fil dit « vue depuis l'allée … ») ; le message d'un geste fait sur le plan
  (zone litiges) s'affiche dans la colonne de côté.
- **Décisions prises en route (§13)** : 2. clé `entrepot` / `db.entrepots` (défaut) ; 3. « ← Retour au plan » en
  **bouton plein à l'accent de l'entreprise** : la charte l'autorise déjà pour les boutons d'action (« Envoyer »,
  `btn btn-p`) ; 4. un mode par déclaration (défaut) ; 8. teintes de la maquette en variables `--pe-*`, texte foncé sur
  carton et plaque dans les deux thèmes (4,8 sur le carton sombre). Le critère `parcours` n'est jugé que si le type de
  produit est juste (comme la maquette).
- **Tests** : bloc `entrepot`, 20 cas : bonnes réponses écrites à la main = celles du moteur ; les 13 pièges du §11
  nomment chacun leur critère seul ; « que, pas de combien » ; décision 7 (au-dessus d'une plus légère → aucune faute) ;
  parcours juste **à la souris** à 1366 × 768 ; chaque jalon tombe quand sa palette est mal rangée ; occupé refusé ;
  inaction 0/4 ; les trois temps ; évaluation 15/20 sur 3 palettes justes ; onglets, Échap, clavier, hauteur du bandeau ;
  rechargement et cloisonnement. **Sabotages du moteur éprouvés** (charge sans le stock, occupé non refusé, Échap
  coupé) : 7 cas tombent. Suite entière : voir le commit.
- **Commits** : voir `git log` (« Plan d'entrepôt : … »).
- **Reste ouvert** : lots 3 (comptage), 4 (préparation, mètres 47 / 40 / 141), 5 ; le plan est dessiné pour 4 travées
  et 3 niveaux (géométrie générale, mais seul ce cas est essayé) ; rendu en thème sombre non essayé à l'écran (Smoby
  impose le papier).

*Lot 4 (04/10/2026, Claude Code) — le mode préparation.*

- **Fichiers modifiés** : `core/types/entrepot.js` (mode `preparation` : compilation et contrôles de la déclaration,
  calcul des mètres, de la palette et des jalons, vue — bon, colonne de côté, tracé sur le plan, vue de face picking /
  réserve, fiche de prélèvement, palette de commande, bilan — et gestes ; exports `attendusPreparation`,
  `calculPreparation`, `TYPES_JALONS_PREP`, `ETIQUETTES`) ; `styles/entrepot.css` (aucune variable nouvelle) ;
  `contenus/smoby-entrepot.js` (cartons et classes des 8 produits, `plan.metres`) ; `contenus/entrepot-essai.js` (cas
  `PREPARATION`) ; `outils/essai-entrepot.html` (choix du cas ③) ; `outils/test/entrepot.mjs` (12 cas, et la fonction
  `monter` accepte `cas`, `commande`, `jalons`) ; `activites/FICHE-SEANCE.md` ; `docs/decisions.md`.
- **Écarts par rapport au brief** : les mètres se déclarent en mètres (`plan.metres`), pas en pixels ; deux prélèvements
  de suite à la même adresse = une seule couche ; le jalon `parcours` accepte `garde: 'lignesJustes'` (ENT-5.6) ; le bon
  tient en deux rangées de trois cartes ; la fiche de prélèvement est en deux colonnes ; les refus s'affichent dans
  l'en-tête de la vue ouverte (pas de bandeau ambré au-dessus de la travée : il faisait bouger les emplacements) ;
  « Aussi sur la palette » (hors commande) va dans la colonne de côté.
- **Valeurs recontrôlées contre le moteur** : serpentin dans l'ordre **47 m**, retour **40 m** (40,4), désordre en
  serpentin **141 m, 3 tours**, palette **331 kg, 1,74 m** — celles du §11, sans recalcul.
- **Tests** : bloc `entrepot`, 30 cas (dont 12 de préparation) : ordre du bon, heure, quai ; parcours juste **à la souris**
  à 1366 × 768 → 9 / 9 ; réserve, mauvaise référence, picking au-dessus du minimum, trop de cartons : refusés ; Échap
  annule le réappro ; palette vide terminée et inaction → 0 / 9 ; une ligne seule → parcours faux avec la garde, vrai
  sans ; Cuisine avant Porteur → 47 m et « fragiles en haut » faux ; film 2 tours, étiquettes voisines ; poids et hauteur
  (limites baissées) ; « que, pas de combien » ; entraînement 141 m / 3 tours / nom seul ; évaluation (choix verrouillé,
  retour 40 m, rien avant la copie, 20 / 20 ; serpentin 47 m → parcours faux) ; Trotteur en deux fois → 1,74 m ;
  rechargement, cloisonnement rangement / préparation, attendus côté enseignant seulement. **Sabotages éprouvés** (garde
  des critères retirée, réappro toute référence, garde du parcours ignorée, couches non fusionnées, réserve prélevable) :
  chacun fait tomber un cas.
- **Reste ouvert** : lot 3 (comptage) ; les indicateurs de repérage propres à la préparation (essais en réserve, tours)
  sont gardés dans l'état de l'élève (et dans `detail.entrepot` de la note en évaluation), pas encore dans le tableau
  « Repérage » de l'enseignant (ENT-5.6 les demande : à voir avec la séance) ; rendu en
  thème sombre non essayé à l'écran (Smoby impose le papier).

*Aides au poids du rangement (05/10/2026, Claude Code) — après l'essai de l'évaluation par Tristan.*

- **« Déjà posé : … kg »** reste en évaluation (il était coupé), sans jamais passer en rouge en évaluation.
- **Calcul de charge selon le temps** : en guidage, sous l'en-tête de la travée, « Si vous posez P2 (270 kg) dans cette
  travée : N3 : 1 110 + 270 = 1 380 kg · N2 : … · N1 (sol) : pas de limite » (suit la case « charge déjà posée ») ; en
  entraînement et en évaluation, la calculette du site (`core/calculette.js`) sur l'écran du plan seulement, bouton à
  l'encre (jamais l'accent rouge de Smoby). `creerEntrepot(…).calculette(api)` dit quand ; `entreprise.js` la pose et la retire.
- **Au sol (N1), aucune limite** : ni plaque ni « déjà posé », critère « poids » non jugé ; `plan.cotes[x].charge[1]`
  devient facultatif (les contenus Smoby gardent 3 000 kg, non lus).
- Tests (bloc `entrepot`, 54 cas) : cas « aide de charge en évaluation » **réécrit** (elle est désormais présente) ;
  3 cas ajoutés ou complétés (sol, rouge / calculette, calcul en guidage). Sept sabotages, chacun fait tomber un cas.
- Lot 5 : l'évaluation existait déjà (lots 2 et 4) ; reste la fiche et ce compte rendu final.

*Capteur de charge (05/10/2026, Claude Code) — demandé par Tristan sur la page d'essai (maquette B, sans barre).*

- L'étiquette « déjà posé : … kg » devient un **capteur** : boîtier sombre fixé au montant droit de la vue de face, un
  par niveau au-dessus du sol (« CHARGE N2 », chiffres jaunes, « MAX 1 200 kg », puis « posé » ou « dont 290 en main »).
- Il **ajoute la palette en main** au déjà posé, **dans les trois temps** (il calcule). En guidage et en entraînement,
  chiffres et cadre passent au rouge avec « SURCHARGE » au-delà de la plaque ; **en évaluation, jamais** (ni rouge ni mot).
- La case devient « capteur de charge » ; la ligne de calcul du guidage reste sous l'en-tête. Au sol, pas de capteur.
- Tests (bloc `entrepot`, 55 cas) : trois cas **réécrits** (guidage, rouge/calculette, évaluation) et un ajouté (palette en
  main en évaluation) ; deux sabotages (rouge en évaluation, palette en main oubliée) font chacun tomber deux cas.
- **Contour des travées posées** (demande de Tristan, même soir) : sur le plan vu de dessus, une travée où l'élève a posé au
  moins une palette prend un contour épais à l'encre (6 px ; le brun « votre palette » se perdait parmi les lisses orange), dans les trois temps (ni vert
  ni rouge : il ne juge rien). Pas en préparation. Test ajouté (bloc `entrepot`, 56 cas), éprouvé par sabotage.
- **Remplacé le 06/10/2026** (Tristan) : le contour des travées sur le plan est **retiré** ; l'indicateur va sur la **carte de
  la palette** dans « Palettes à ranger » : posée = trait épais brun « votre palette » et fond carton léger (au lieu d'une
  simple transparence), pour lire d'un coup d'œil fait / à faire. Test remplacé (bloc `entrepot`).
