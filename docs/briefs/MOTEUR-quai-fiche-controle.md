# Brief de chantier — MOTEUR : la fiche de contrôle du quai (Picard ENT-4.1 à 4.4)

**Statut** : livré le 04/10/2026 (à essayer à l'écran par Tristan) — **ergonomie arrêtée avec Tristan le 04/10/2026** sur la page d'essai
`docs/briefs/picard/essai-fiche-controle.html` (section 3 ci-dessous) : c'est la référence d'interaction
*(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Origine** : essai d'ENT-4.4 à l'écran par Tristan, 04/10/2026.
**Modèle** : Opus (vue du moteur, `core/types/quai.js`, qui sert les quatre séances Picard).

## 1. Le problème (constaté par Tristan)

À l'étape ④ « Réserves et chambre froide », le formulaire « Tes réserves » reprend la décision et le motif choisis
à l'étape ③ pour chaque palette (« P1 — Refuser · Cartons endommagés »), puis demande un **chiffre** que l'étape ③
n'a jamais fait noter (`CHAMP_RES` dans `quai.js`) :
- Température non conforme → « Température à cœur relevée (°C) » ;
- Produit différent → « Référence réellement livrée (lue sur l'étiquette) » ;
- Cartons endommagés → « Nombre de cartons endommagés » ;
- Manquant → « Nombre de cartons manquants ».

L'élève doit donc **retrouver de mémoire** ce qu'il a vu à l'étape d'avant. Seul contournement : recliquer sur
l'onglet ③, ce que rien n'indique, et qui n'a pas de sens une fois le lot rentré en chambre froide.

## 2. Décision de Tristan (04/10/2026) : option A, une fiche de contrôle

- À l'étape ③, **pendant le contrôle de chaque palette**, l'élève note ses constats sur une **fiche de contrôle** :
  ce qu'il a relevé (température à cœur, référence lue, cartons endommagés, cartons manquants…).
- À l'étape ④, **ses notes s'affichent** à côté du formulaire de réserves : il les reporte sur le bon de livraison.
- Les notes **ne sont pas corrigées** et ne sont pas des jalons : s'il a mal noté, il recopie son erreur, et c'est la
  réserve qui est jugée, comme aujourd'hui. On ne préremplit pas les réserves (le report est le geste).
- C'est le geste réel : le réceptionnaire note pendant le contrôle, puis reporte sur le BL.
- Écartées : B (lien « revoir la palette » à l'étape ④, peu réaliste), C (noter sur papier, demande une trame
  partout, ENT-4.4 n'en a pas).

## 3. Ergonomie arrêtée avec Tristan (04/10/2026, page d'essai)

Référence d'interaction : `docs/briefs/picard/essai-fiche-controle.html` (copie de la page d'essai ; le haut de la
page résume les choix). Ouvrir en double-clic. Ses palettes sont dessinées par `palette3d` copié de `quai.js` ;
le reste du code de la page est jetable (ne pas le recopier tel quel : l'écrire dans les conventions du moteur).
Charte respectée : pas de blanc pur, aucun aplat vert, champs sans aplat, messages « manquant » en ambre (`--terre`).

### Étape ③ — mise en page du poste
- **Colonne de gauche** : la palette 3D, **bloc moins haut** (dessin limité à ~250 px de haut, cadré serré),
  puis **juste en dessous la fiche de contrôle** de la palette ouverte. Colonne de droite : les outils et la
  validation. Deux colonnes de même largeur.
- La fiche a **le même habillage que les autres blocs du quai** (`.quai-doc` : `--fond`, `--filet`, champs
  ordinaires). Pas de papier ligné ni d'écriture manuscrite (essayé, refusé par Tristan).

### Étape ③ — la fiche
- **Toujours les quatre constats pour chaque palette** : Température à cœur (°C), Référence lue sur l'étiquette,
  Cartons endommagés (cartons), Cartons manquants (cartons). L'unité est écrite à côté de la case. Écartés :
  « seulement ceux du motif » (oblige à décider avant de noter, et un mauvais motif empêche de noter le bon
  constat) ; texte libre (trop dur pour un faible lecteur).
- **Rien de prérempli, rien de corrigé, aucun indice** : une palette conforme reste vide, c'est normal.
- **Noter ne coûte rien** en temps simulé.
- **Entrée** passe à la case suivante de la fiche ; focus conservé au redessin (clavier seulement).
- Les notes vivent dans l'état de la palette (`e.palettes[id].fiche = { temp, ref, endo, manq }`, cloisonné par
  séance comme tout l'état du quai) ; `normaliser()` complète les bases anciennes.

### Étape ③ — la sonde
- « Sonder à cœur » affiche un **thermomètre à sonde dessiné** (SVG, appareil générique, **sans marque**), planté
  dans un carton de la palette. L'afficheur part de la température du quai et **se stabilise en ~1,2 s**
  (« STAB… » clignote, puis « HOLD ») ; `prefers-reduced-motion` → valeur directe. Revenir sur une palette
  sondée réaffiche la valeur sans rejouer l'animation. Remplace le texte « −19,6 °C à cœur ».
- La température **se recopie à la main** sur la fiche (rien ne s'inscrit seul).

### Étape ③ — la validation (choix « décision en boutons »)
- **Comptage** : plus de bouton « Noter le comptage ». On tape le total puis Entrée (ou on quitte la case) : il est
  noté, avec le coût `compter` et la phrase « Comptage noté : 44 cartons (BL : 48). ». Palette multi-références
  (`p.refs`, absente de la page d'essai) : une case par référence, chacune notée par Entrée, même phrase
  qu'aujourd'hui ; garder le coût `compter` × nombre de références.
- **Décision en trois boutons** (Accepter / Accepter avec réserves / Refuser), état choisi = bordure et texte
  d'accent + « ● », jamais d'aplat.
- **Motif en étiquettes à cocher** (☐ / ☑), affichées **seulement** pour une réserve ou un refus ; libellé
  « Motif de la réserve | du refus · deux au plus ». **Deux au plus** quand la séance déclare `deuxMotifs`
  (ENT-4.4) : recliquer décoche ; un troisième clic est refusé avec « Deux motifs au plus : décoche-en un
  d'abord. » Sans `deuxMotifs`, une seule (le clic remplace). Remplace les menus `motif` / `motif2` (même état
  `motif`, `motif2`). Passer à « Accepter » efface les motifs.
- **« ✓ Valider P1 » toujours cliquable** : s'il manque quelque chose, le message s'écrit **sous la case
  concernée** (« Note le comptage. », « Choisis une décision. », « Donne le motif. ») et le focus y va. Les
  conditions de validation ne changent pas (comptage, décision, motif si réserve/refus) — la fiche n'en fait
  **pas** partie (non corrigée).
- **Valider reste sur la palette**, qui devient un **résumé** (« ✓ P1 validée : Accepter avec réserves —
  Manquant + Cartons endommagés », comptage) avec un bouton **« Modifier »**. Fin du dé-validage silencieux
  quand on touchait un menu.
- **En dessous, « Palette suivante : P2 → »** : la palette d'après dans l'ordre (validée ou non), **absent sur la
  dernière**. Idée proposée, non tranchée : sur la dernière, mettre à la place « Contrôles terminés → réserves ».
- « Contrôles terminés → réserves et chambre froide » passe en bouton plein quand tout est validé (déjà le cas).

### Étape ④
- **Colonne de gauche : la chambre froide (animation), puis juste en dessous la fiche entière** (toutes les
  palettes, y compris acceptées, en lecture seule, tableau Palette / Temp. à cœur / Réf. lue / Endommagés /
  Manquants). Colonne de droite : « Tes réserves », inchangé, où l'élève **reporte**. Écarté : la note sous
  chaque ligne de réserve (désigne la ligne à lire).
- Une palette à deux motifs a deux cases (`res`, `res2`), comme aujourd'hui.

### Nombres à virgule
Rien à changer : `nombre()` accepte déjà « −13,8 », « -13.8 », tiret long, espaces ; le BL écrit toujours
« −13,8 °C ». La fiche est du texte libre (non corrigée).

## 4. Ce que touche le chantier

`core/types/quai.js` et `styles/quai.css` (pas `base.css` a priori), les tests du bloc `picard` (ENT-4.1 à 4.4), les
trames Picard si elles parlent de l'étape ③ ou ④ (à signaler à Cowork). Un seul chantier à la fois dans le quai.

Vérifier aussi le mode « déjà réceptionné » d'ENT-4.3 (`vueControle`) : il partage `MOTIFS`, `DECISIONS`, les
menus ? Ne le changer que s'il affiche le même poste de contrôle (sinon le laisser tel quel et le dire).

**Tests à réécrire (le dire à Tristan)** : les cas du bloc `picard` qui choisissent `#qDecision` / `#qMotif` /
`#qMotif2` dans un menu, qui cliquent `[data-q="compter"]`, ou qui attendent que le bouton Valider soit grisé.
Nouveaux cas, éprouvés dans les deux sens : la fiche se remplit, survit au changement de palette et au
rechargement, réapparaît à ④ en lecture seule, n'est jamais préremplie ni corrigée (une note fausse ne change
aucun jalon) ; Entrée passe à la case suivante ; troisième motif refusé (ENT-4.4) ; Valider avec un manque
écrit le message sous la case et ne valide pas ; « Palette suivante » absent sur la dernière ; résumé +
« Modifier ». Durée estimée : ~2 h (la suite Picard et la suite entière, plusieurs passages).

## 5. En attendant

Essai d'ENT-4.4 (seuils de temps réel, provisoires à 12 / 16 min) **en pause**. Premier relevé de Tristan, en
expert : 7 min 44 de temps réel en arrivant à l'étape ④, 24 min hors froid. Un élève mettra sans doute 2 à 3 fois
plus : les seuils de 12 / 16 min paraissent trop courts. À reprendre une fois la fiche livrée.

## Compte rendu *(rempli par Claude Code)*

Livré le 04/10/2026 (Claude Code, Opus). Commit « Quai : fiche de contrôle… ».

**Ce qui est fait** (`core/types/quai.js`, `styles/quai.css`, rien dans `base.css`) :
- Étape ③ : deux colonnes égales ; à gauche la palette (cadrée serré, 250 px de haut au plus) puis la fiche de la
  palette ouverte (`.quai-doc`, quatre cases avec unité, `palettes[id].fiche = { temp, ref, endo, manq }`, complétée
  par `normaliser()` sur les bases anciennes). Rien de prérempli, rien de corrigé, aucun coût, aucun jalon ; Entrée
  passe à la case suivante, puis au comptage.
- Sonde : thermomètre dessiné, sans marque ; l'afficheur part de la température du quai et se stabilise en 1,2 s
  (« STAB… » clignote, puis « HOLD ») ; `prefers-reduced-motion` → valeur directe ; revenir sur la palette ne rejoue pas.
- Validation : total noté par Entrée ou en quittant la case (coût `compter`, une case par référence pour une palette
  multi-références) ; décision en trois boutons ; motifs à cocher, affichés pour une réserve ou un refus seulement,
  un seul (le clic remplace) ou deux au plus avec `deuxMotifs` (le troisième est refusé avec le message) ; « Accepter »
  efface les motifs ; « Valider » toujours cliquable, le manque s'écrit sous la case et le focus y va ; palette
  validée = résumé + « Modifier » ; « Palette suivante » dessous, absent sur la dernière.
- Étape ④ : colonne de gauche = chambre froide puis la fiche entière en lecture seule (toutes les palettes du camion).
- Le mode « déjà réceptionné » d'ENT-4.3 (`vueControle`) **n'est pas touché** : il a son propre poste (recompter,
  re-sonder, bloquer), sans décision ni motif.

**Vérifié** : bloc `picard` 85/85 ; suite entière 603/603 ; sept sabotages du moteur (fiche préremplie par la sonde,
troisième motif accepté, « Palette suivante » sur la dernière, Entrée qui saute une case, Valider sans contrôle, deux
motifs sans `deuxMotifs`) font tomber exactement les sept cas visés. Écran regardé dans le navigateur (③ et ④).

**Tests réécrits** (`outils/test/picard.mjs`, à savoir) : les parcours (`jouer`, `camion42`, `jouer44`) passent par deux
aides `compter` (Entrée) et `decider` (boutons) au lieu des menus et du bouton « Noter le comptage » ; les deux cas
« Valider » réécrits (résumé + Modifier + Palette suivante ; manques sous la case) ; la sonde d'ENT-4.2 se lit sur
l'attribut `data-q-sonde` ; le cas « second motif sur chaque palette » d'ENT-4.4 lit « deux au plus » ; le cas
`prefers-reduced-motion` vérifie aussi le thermomètre. **Nouveaux cas** : fiche vide / gratuite / gardée / rechargée /
relue à ④ en lecture seule ; jamais corrigée (notes fausses ou vides = mêmes jalons et même note, contre-épreuve sur une
décision) ; Entrée ; motifs sans `deuxMotifs` et pas d'aplat ; thermomètre ; troisième motif refusé (ENT-4.4).

**Décisions prises en route** (aussi dans `docs/decisions.md`) :
- Le comptage noté ne redessine pas l'écran (mise à jour sur place) : sinon un clic sur « Valider » juste après la
  frappe se perdait (la case perd le focus, l'écran se redessinait sous la souris).
- Sans `deuxMotifs`, recliquer un motif coché le décoche (cohérent avec la case ☑). Décocher le premier de deux motifs
  fait passer le second en premier, avec sa valeur de réserve.
- Sur la dernière palette, à la place de « Palette suivante » : le bouton « Contrôles terminés → réserves et chambre
  froide », le même qu'en haut à droite (même confirmation). Tranché par Tristan le 04/10/2026, après livraison.
- Case « Température » de la fiche en clavier texte (le clavier « décimal » des tablettes n'a pas de signe moins).
- Guidage (`aides.consignes`) : la consigne de l'étape ③ dit en plus « Note ce que tu constates sur ta fiche, sous la
  palette : tu le reporteras sur le bon de livraison. »

**À faire ailleurs** :
- **Cowork : trames Picard à revoir.** `outils/trame-picard-premier-camion.py` (l. 145, 166-167, 183 : « Noter le
  comptage », « les deux menus », « Valider cette palette » qui « reste gris ») et `outils/trame-picard-deux-camions.py`
  (l. 130) décrivent l'ancien poste ; dire plutôt : noter ses constats sur la fiche, taper le total puis Entrée, cliquer la
  décision et le motif, « ✓ Valider P1 ». ENT-4.3 et 4.4 : rien à changer a priori.
- Reprendre l'essai d'ENT-4.4 (seuils de temps réel 12 / 16 min, §5).

## Suite du 04/10/2026 : la zone de calcul et la nouvelle disposition de l'étape ③ *(livrée)*

**Demande de Tristan** (essai d'ENT-4.1 à l'écran) : une petite zone tableur pour calculer le comptage, et voir la
palette pendant qu'on remplit. Maquette validée : `docs/briefs/picard/maquette-quai-calcul.html` (copie dans
`Claude outputs`).

**Arrêté avec Tristan :**
- **Disposition** : à gauche, la palette **reste à l'écran** (elle ne défile pas) ; à droite, dans l'ordre du travail :
  **① Compter** (explication en guidage, zone de calcul, puis la case « Total ») → **② Sonder et lire l'étiquette** →
  **③ la fiche de contrôle** → **④ Décider** (décision, motifs, Valider) → « Palette suivante » ou « Contrôles terminés ».
- **Zone de calcul**, déclarée par la séance (`quai.calcul`) :
  - guidage ENT-4.1 : `{ forme: 'feuille', rappel: true }` : lignes nommées en colonne A (cartons dans une couche,
    couches, manquants, total), valeurs et formule en B, rappel pas à pas (« tape =, clique sur B1, tape *… ») ;
  - entraînement ENT-4.2 : `{ forme: 'feuille' }` : colonne A remplie, **sans rappel** ni explication ;
  - évaluation ENT-4.4 : `{ forme: 'brouillon' }` : 2 colonnes × 5 lignes vides, libres.
- **Cases cliquables** (geste du tableur) : pendant qu'on écrit une formule, juste après `=`, un signe ou une
  parenthèse, un clic sur une case écrit sa référence ; les cases citées sont entourées en pointillé.
- Le résultat **ne se recopie pas** : l'élève remplit lui-même « Total ». La zone **n'est pas notée**.

**Fait** (`core/types/quai.js`, `styles/quai.css`, déclarations dans `contenus/picard-ent41.js`, `-ent42.js`,
`-ent44.js`, `outils/essai-quai.js`) : calculs par `core/formules.js` (le moteur des feuilles Boost : virgule, SOMME,
erreurs comme Excel) ; résultats recalculés sur place, sans redessin (le curseur reste dans la formule) ; Entrée descend
d'une case, puis va au Total ; `=12x5-3` affiche « #VALEUR! » et « Pour multiplier, le tableur veut une étoile : * ».
La feuille vit dans `palettes[id].calcul` (complétée par `normaliser()`), sans coût en temps simulé.

**Décisions prises en route** (aussi dans `docs/decisions.md`) :
- Palette à **plusieurs références** (ENT-4.2, A2) : la feuille aux lignes nommées n'a pas de sens (un comptage par
  référence) ; elle reçoit le **brouillon libre**.
- En guidage, les trois cases « détail du comptage » disparaissent (la feuille les remplace) ; la ligne « détail » du
  bilan, **non comptée**, se lit sur la feuille (B1, B2, B3).
- Entrée dans la dernière case de la fiche mène maintenant à la décision (la fiche vient juste avant).
- Une palette validée garde son Total visible mais grisé ; la fiche reste modifiable (ce ne sont que des notes).
- La consigne de guidage de l'étape ③ est maintenant l'explication du bloc « Compter » (la phrase « Note ce que tu
  constates sur ta fiche… » ajoutée plus tôt est retirée : la fiche est numérotée ③ dans l'ordre du poste).

**Vérifié** : bloc `picard` 91/91 ; suite entière 609/609 ; contre-épreuves (palette non fixée, aide « x » retirée,
feuille comptée, rappel en entraînement, feuille en évaluation, clic sur case inactif, résultat recopié dans Total) :
chacune fait tomber son test. Geste du clic sur les cases essayé à la souris dans le navigateur.

**Tests** : deux cas existants ajustés (Entrée en fin de fiche → décision ; Total grisé sur une palette validée) ;
nouveaux : ordre du poste et palette fixe, feuille + rappel + clic sur les cases + rien de recopié + rechargement,
erreur « x » et Entrée, jamais notée, ligne « détail » ; ENT-4.2 sans rappel et brouillon pour A2 ; ENT-4.4 brouillon.

**À faire ailleurs** : **Cowork, trames Picard** (ENT-4.1, 4.2, et 4.4 si elle décrit l'écran) : le poste a changé
d'ordre (compter avec la zone de calcul, puis sonder, puis la fiche, puis décider).

