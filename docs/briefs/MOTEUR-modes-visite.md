# Brief de chantier — MOTEUR : les modes « visite » de la vue Plan d'entrepôt (second chantier)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/EN-COURS.md, puis le brief docs/briefs/MOTEUR-modes-visite.md et ouvre la maquette docs/briefs/smoby/visite/maquette-visite-2de-v2.html. Il faut que MOTEUR-vue-plan-entrepot.md soit livré (sinon arrête-toi et dis-le). Annonce la durée avant de commencer, découpe en lots (§9), puis enchaîne : les questions du §12 ont toutes une valeur par défaut, applique-la et note au compte rendu ce que tu as choisi.
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 04/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-2de-s1-visite.md` (décisions 1 à 11 de Tristan,
maquette v2 validée le 04/10 au soir).
**Modèle** : **Opus** (vue nouvelle du moteur).
**Dépend de** : **`MOTEUR-vue-plan-entrepot.md` livré** (plan vu de dessus déclaré, vue de face d'une travée, barre
d'adresse, bandeau, onglets plan / vue ouverte, clé `entrepot`). Ce chantier **ajoute un mode** à cette vue ; il ne la
refait pas. Un seul chantier moteur à la fois (`docs/EN-COURS.md`).
**Durée estimée par Cowork** : **10 à 13 h** en lots livrables (§9). Ce qui prend le temps : quatre briques nouvelles
(photo à points, photo à cliquer, délimiter sur une photo, zones à trouver), le parcours posé **sur le plan du premier
chantier** (ancres, pas de pixels), et le bloc de tests (inaction, sabotages, coordonnées écrites à la main).
**Débloque** : **ENT-5.3** (visite de la plateforme Smoby, 2de). Plus tard : visite de sécurité (plan affiché au mur), toute
séance de vocabulaire sur photo (CAP, 2de d'autres entreprises).

## 1. Pourquoi ce chantier

Avant de recevoir et de ranger (ENT-5.4, 5.5), l'élève de 2de doit **se repérer** sur une plateforme et **nommer** ce qu'il
voit. Aucune vue ne le fait : `plan.js` est un plan de transport, la vue Plan d'entrepôt (premier chantier) sait ranger,
compter et préparer, pas faire visiter. Décision de Tristan (04/10) : **les modes visite sont un second chantier**, après une
maquette de la visite. Cette maquette est **validée** (v2, 04/10 au soir).

**Principe (décision 8 du Plan d'entrepôt) : pas de maquette universelle.** Le moteur fournit des **briques** ; la séance
déclare **ses étapes**, ses photos, ses coordonnées, ses textes. Rien de « Smoby » dans `core/`.

## 2. La référence : la maquette v2 de la visite

`docs/briefs/smoby/visite/maquette-visite-2de-v2.html` (2 907 810 octets, SHA-256 `5f14957593397257…b55930fa7b7`, un seul
fichier, photos incluses, aucune requête, double-clic). **Elle fait foi pour l'interaction, pas pour le code** (état global,
plan en pixels écrit à la main, stock tiré par un générateur, couleurs en dur sur les photos). Reprendre le comportement.

- **Barre du haut de la maquette** (8 étapes **cliquables dans le désordre**, « Recommencer ») : la navigation libre est
  **un outil d'essai** ; en séance, l'élève **revient** sur les étapes faites mais **ne saute pas en avant** (§3.2).
- **Données** en tête du script : `POINTS_G`, `QUESTIONS_G` (vue du ciel), `PARCOURS`, `TRACE`, `POINTS_D` (mots du rack),
  `QUIZ`, `TRAVEE`, `ADRESSE`, `BRUNO`. **Toutes reprises au §6 du brief `ENT-5.3-smoby-visite.md`** : le contenu les
  reprend de là, pas de la maquette.
- **Le plan et le stock** sont ceux de la maquette v2 du Plan d'entrepôt (même graine) : **reprendre
  `docs/briefs/plan-entrepot/donnees-maquette.json`**, jamais le générateur.
- En bas, « Pour l'enseignant » : brouillon de la déclaration (dépassé par le §8 ci-dessous).

Rejouée par Cowork le 04/10 au soir (vrais clics, 1366 × 768 clair et sombre, 1280 × 720, 1920 × 1080, avec et sans
animations) : parcours complet, réponses fausses exprès (voir les tests du §10), sauts d'étape, aucune erreur de console,
aucun défilement de page à 1366 × 768 et 1280 × 720.

## 3. L'écran

### 3.1 La mise en page (comme la vue Plan d'entrepôt)

Une **entrée du menu** de l'environnement d'entreprise (libellé du contenu : « Visite de la plateforme »). De haut en bas :

- **La file des étapes**, sur **une seule ligne** au-dessus de 1 000 px de large : pastilles numérotées avec le titre court
  (« 1 Accueil », « 2 Vue du ciel »…) ; l'étape en cours est marquée ; **✓ seulement sur une étape vraiment finie** (§3.2).
- **Le bandeau** (celui de la vue, hauteur fixe) : à gauche **le message du personnage** (« Bruno, chef de quai · mercredi
  9 décembre, 8:05 » + texte, **heure par étape** déclarée) ; au centre **la consigne numérotée** (`2/6` « Ouvrez les 6
  points… ») ; à droite **« Suivant → »** (inactif tant que l'étape n'est pas finie ; « Voir le bilan → » ou rien sur la
  dernière, §12) et, dessous, une aide d'une ligne (« Ouvrez les 6 points, puis répondez aux 3 questions. »).
- **La colonne de côté** (250 px dans la maquette, celle de la vue) : la liste de l'étape (points, questions, coins,
  lisses…), le message du dernier geste (« Oui, c'est bien ici. » / « Pas ici. Relisez le point n° 3. »), un encadré de
  rappel.
- **La vue en grand** : la photo ou le plan, **à la plus grande taille qui tient sans défilement**, proportions gardées.
  Sous chaque photo, **une mention** déclarée par le contenu (« Photo d'un autre entrepôt : Handi Boyz LLC, Pexels
  n° 5775099. »).
- **Photo ou travée ouverte = onglet dans la page** (même mécanique que la vue ouverte du premier chantier) : en-tête fixe
  avec le **fil** (« Plan › 4. Les allées de stockage › photo »), le message, **« ← Retour au plan » en haut à droite** ;
  **Échap** fait la même chose. Jamais une fenêtre du navigateur.

### 3.2 La navigation entre les étapes (décision 11 de Tristan)

| | Élève | Enseignant, page d'essai |
|---|---|---|
| Étapes déjà faites | **cliquables** (il revient relire, ce qui a été fait reste fait) | cliquables |
| Étape suivante | par « Suivant → », **seulement si l'étape en cours est finie** | idem |
| Étapes plus loin | **non cliquables** (pas de saut en avant) | **cliquables** (navigation libre) |

Changer d'étape **garde l'état** de chaque étape. Une étape « finie » est définie par sa brique (§4). L'accueil et la fin
n'ont pas de condition.

### 3.3 Ce qui n'est jamais montré à l'élève

Les zones de réponse, les coins attendus, les bandes des lisses, la cible de l'adresse (**aucune surbrillance** avant
« Trouvé »), le nombre d'essais (sauf « (2 essais) » à côté d'une réponse du quiz, déjà trouvée, comme la maquette). Les
indicateurs (nombre de clics, premier coup) vont au **repérage de l'enseignant** (lot 6 de `MOTEUR-2de-S1`, livré).

## 4. Les briques (types d'étape)

Chaque étape déclare un `type`. Les coordonnées sont **dans le repère de la photo** (largeur × hauteur déclarées avec
l'image, §5) : le moteur pose un calque SVG `viewBox="0 0 L H"` sur l'image et convertit le clic (`getScreenCTM().inverse()`
dans la maquette). Tout point cliquable a le **focus clavier** (Tab, Entrée, Espace) et un `aria-label`.

### 4.1 `accueil`

Image de fond (voile sombre, titre, texte), liste « Ce que tu vas faire » (déclarée), encadré (« Les photos viennent
d'autres entrepôts : ce ne sont pas celles de Smoby »), mention. Finie d'emblée.

### 4.2 `photoPoints` — découvrir des points sur une photo

Points numérotés (disque de **rayon 31** en coordonnées image pour la vue du ciel, **24** pour les mots du rack : ils
faisaient ~11 px à l'écran dans la v1, trop petits), un halo sombre derrière. Un clic (sur le point **ou** sur la ligne de
la liste de côté) **ouvre** le point : il passe « vu », la liste montre son mot et sa phrase. Deux effets, déclarés :

- `effet: 'zoom'` (vue du ciel) : la photo **zoome** sur `zoom: { cx, cy, s }` (effet drone, ~1,5 s, translation bornée
  aux bords de la photo) ; bouton « ⤢ Vue d'ensemble » sous la photo quand un point est ouvert. **Sans animation** si
  `prefers-reduced-motion` (le zoom est immédiat).
- `effet: 'bulle'` (mots du rack) : une **étiquette** avec le mot à côté du point (à gauche si elle sortirait de la photo) ;
  un point peut déclarer un **trait de rappel** vers ce qu'il montre (`cx`, `cy` : l'étiquette d'adresse de la maquette).

**Finie** quand tous les points sont ouverts. **Aucun jalon** (la découverte débloque la suite, décision du déroulé).

**Enchaînement sur la même photo** : une `photoPoints` peut déclarer `puis: { type: 'photoQuestions', bouton: 'Passer aux
3 questions →', … }`. Le bouton apparaît dans la colonne **quand tous les points sont ouverts** ; **les questions ne
commencent qu'au clic sur ce bouton, jamais automatiquement** (retour de Tristan sur la v1 : « lorsque je clique sur le 6, je
bascule directement sur les questions »). Pendant les questions, la photo revient à la vue d'ensemble, les points
disparaissent, la colonne garde les 6 points et leurs phrases (pour relire).

### 4.3 `photoQuestions` — cliquer sur la photo pour répondre

Une question à la fois (`1/3`), curseur de visée sur la photo. Chaque question déclare **ses zones de réponse**
(rectangles `[x0, y0, x1, y1]`, une ou plusieurs) et une **aide** pour le message d'erreur.

- Clic dans une zone : « Oui, c'est bien ici. » (ou le message déclaré, « Oui : c'est une lisse. »), question suivante.
- Clic ailleurs : message déclaré (« Pas ici. Relisez le point n° 3. » / « Non, pas ici. Revoyez le mot à l'étape
  précédente si besoin. »), **l'élève recommence** (guidage).
- Chaque clic compte un essai. **Jalon par question** : juste quand la question est réussie ; **premier coup** = réussie au
  premier essai (décision 11 : un clic faux ne fait pas perdre le jalon, « du premier coup » le trace).

**Finie** quand toutes les questions sont réussies.

### 4.4 `parcours` — suivre le parcours de visite sur le plan

Le **plan vu de dessus du premier chantier**, en lecture (travées non cliquables), avec :

- **Les étapes du parcours** : disques numérotés (blanc bordé tant que non vue, plein une fois vue, plus grand quand
  ouverte) posés sur des **ancres du plan**, pas sur des pixels (§5.2) ;
- **la trace** de visite : un trait **en tirets** d'une couleur réservée à la visite (§7), qui va d'étape en étape **en
  suivant les allées** (la maquette descend à l'allée principale, la longe et remonte : voir `TRACE`) ;
- **un cône de vue** par étape qui a une photo (direction en degrés, `0` = est, `90` = sud ; longueur déclarable, 70 par
  défaut dans le repère 800 × 562 de la maquette).

**Ordre imposé** : un clic sur une étape plus loin que la suivante → message « Dans l'ordre : l'étape suivante est la
n° … » (colonne), rien ne s'ouvre. Un clic sur l'étape suivante ou une étape vue **l'ouvre** : la colonne montre la parole
du personnage (« Bruno — 4. Les allées de stockage » + texte) et la vue passe à **l'onglet photo** (§3.1) ; « ← Retour au
plan » ou Échap y revient ; la colonne garde alors un bouton « 📷 Revoir la photo ». Une étape peut déclarer **plusieurs
images**, affichées **côte à côte**, chacune avec **sa** mention (zone litiges : la photo et le dessin). Une étape sans
image ouvre seulement la parole. La liste de côté répète les étapes (« … » tant que non vues) et ouvre aussi.

**Décor du plan pour la visite** (déclaré, §5.2) : zone de réception **vide** avec une note (« vide à 8 h ») ; **passage
piétons** (bandes) sur l'allée principale devant la zone de réception ; le stock reste dessiné (petits carrés gris).

**Finie** quand toutes les étapes du parcours ont été ouvertes. **Aucun jalon.**

### 4.5 `delimiter` — placer les 4 coins d'une forme sur une photo

La séance déclare **les coins attendus** (`hg`, `hd`, `bg`, `bd`), leurs **noms** (« en haut à gauche »…), une
**tolérance** (distance dans le repère de la photo) et la **correction légendée**.

- L'élève clique **4 points, dans n'importe quel ordre** ; chaque point posé est un disque numéroté. **Un clic sur un point
  posé l'enlève.** Au-delà de 4, les clics ne font rien.
- Dès 4 points : le **quadrilatère en pointillés** (couleur de saisie, pas le vert). Les points sont **rangés en coins** :
  les 2 plus hauts = haut, puis gauche / droite dans chaque paire (`coinsDe()` de la maquette).
- **« Vérifier »** (actif à 4 points) et **« Effacer »** (actif dès 1 point). Vérifier : chaque coin est juste s'il est à
  moins de la tolérance du coin attendu.
  - Faux : liste des 4 coins ✓ / ✗ dans la colonne, **points faux en rouge** (✗ dans le disque), message « Pas encore :
    coins en bas à gauche, en bas à droite. Un coin se place là où une échelle touche le sol ou s'arrête en haut. Cliquez le
    point rouge pour l'enlever. » (texte du contenu, la liste des coins faux est calculée). L'élève corrige et revérifie.
  - Juste : **la correction légendée** remplace les points — la forme attendue (contour et voile **verts** : ici le vert dit
    « juste »), les étiquettes déclarées (texte, position, rotation : « échelle » ×2 à la verticale, « sol », « 1 travée ») ;
    la colonne se résume en « ✓ Les 4 coins sont justes » + message déclaré.
- **Jalon** : juste quand les 4 coins sont justes ; **premier coup** = juste au premier « Vérifier ».

### 4.6 `zones` — trouver des éléments sur la même photo (suite de `delimiter`)

Déclarée en `puis` d'une `delimiter` (même photo, correction légendée toujours affichée), elle **commence dès que la
délimitation est juste**. Consigne déclarée (« cliquez chaque lisse de cette travée… »). La séance déclare :

- **les cibles** : bandes avec un **nom** (`{ nom: 'lisse du haut', y0: 60, y1: 96 }`), une étendue en x commune (`x: [270,
  870]`) ou propre à la cible, une **marge** (± 8 en hauteur dans ENT-5.3) ;
- **les pièges**, chacun avec **son message** : bandes **du fond** (« Cette barre est au fond, sur le rack de derrière… ») ;
  **bonne hauteur hors de l'étendue** (« C'est bien une lisse, mais celle de la travée d'à côté… ») ;
- **le message hors cible** (« Ici, ce n'est pas une lisse… ») et **le message de re-clic** sur une cible trouvée
  (« Celle-ci est déjà trouvée. », **pas compté faux**).

Ordre de jugement (maquette) : cible (dans la bande **et** dans l'étendue) → bonne hauteur hors étendue → piège déclaré → hors
cible. Chaque cible trouvée s'entoure (trait clair) avec **son nom** en étiquette ; colonne « Les lisses (n / 3) ».
**Jalon** : toutes les cibles trouvées ; **premier coup** = aucun clic compté faux. L'étape (`delimiter` + `zones`) est
**finie** quand les deux sont justes ; la photo n'est plus cliquable ensuite.

### 4.7 `adresse` — décomposer une adresse, puis la retrouver

**a) Décomposer.** L'étiquette en grand (`A1-T03-N2-E1`, police à chasse fixe, tirets), une **liste déroulante par partie**
(« … choisir », puis les choix déclarés dans l'ordre déclaré : *allée et côté, emplacement, niveau, travée*), « Valider »
(actif quand les 4 sont choisies ; sinon « Choisissez le sens des 4 parties. »). **Une seule validation** : juste ou faux, on
passe à b) ; **la correction reste affichée** dans la colonne pour toute la suite (chaque partie : sens juste, ✓ ou ✗ « (vous :
travée) »), avec l'encadré déclaré (« A1 : allée A, côté 1. Une allée a deux côtés… le sol est N1… 3 palettes par
niveau »). **Jalon** : les 4 parties justes à cette validation (pas de second essai : avec 4 choix, recommencer reviendrait à
deviner par élimination).

**b) Retrouver.** Consigne ② « Retrouvez A1-T03-N2-E1 : cliquez la bonne travée sur le plan », puis ③ « Cliquez
l'emplacement … dans la travée vue de face ». **Ce sont le plan et la vue de face du premier chantier**, en lecture :

- **barre d'adresse** du premier chantier, libellée **« Vous êtes en »** : elle se remplit au choix de la travée puis **au
  survol** d'un emplacement ; à droite « On cherche : A1-T03-N2-E1 » ;
- travée cliquable → vue de face (bascule, regard dans l'allée sur le plan), **aucune surbrillance de la cible** ;
  emplacements avec leur contenu comme au rangement (« Maison 420 kg », « libre », hachures « HORS SERVICE »), étiquette de
  niveau sur la lisse, plaque de charge ;
- clic sur un emplacement **faux** : message qui **nomme la partie fausse**, calculé en comparant les 4 parties : « ✗
  A2-T03-N2-E1 : le côté (vous êtes en A2, il faut A1). Revenez au plan. », « … : le niveau (N3 au lieu de N2 — le sol est
  N1). », « … : la travée (T02 au lieu de T03). Revenez au plan. » (« Revenez au plan. » si le côté ou la travée est faux) ;
- clic **juste** : « ✓ Trouvé : A1-T03-N2-E1 — une Maison Neo Jura Lodge de 420 kg. » (désignation et poids **lus dans le
  stock déclaré**, pas recopiés), l'emplacement se marque (seul endroit où la cible est mise en avant), les clics suivants ne
  font plus rien.
- **Jalon** : emplacement trouvé ; **premier coup** = 1 seul clic d'emplacement. Le **nombre de clics** va au repérage de
  l'enseignant.

**Finie** quand a) est validée **et** l'emplacement trouvé.

### 4.8 `fin` (facultative)

Message du personnage. Le **bilan** de la maquette (11 jalons, « du premier coup ») est **le suivi existant** (jalons de la
séance, repérage enseignant) : **pas d'écran de bilan dans la vue** (défaut, §12).

## 5. Les données que le moteur attend

### 5.1 Images

```js
images: {
  ciel:    { src: '<chemin servi par le site>', repere: [1600, 1066], alt: 'Plateforme logistique vue par drone',
             mention: "Photo d'un autre entrepôt : Marcin Jozwiak, Pexels n° 2804929." },
  allee:   { src: …, repere: [1400, 788], … },   // repère de la maquette ; fichier 1600 × 900, même proportion
  …
}
```

Le **repère** est celui dans lequel les coordonnées sont écrites ; il doit avoir **la proportion du fichier** (le moteur le
vérifie au chargement en page d'essai, et un test le vérifie pour chaque image d'une séance : écart ≤ 1 %). Les photos sont
**dans le dépôt** (aucune requête hors du site) : Claude Code les copie depuis `docs/briefs/smoby/visite/` (et
`docs/briefs/smoby/quai-interieur.jpg`) vers le dossier d'images des contenus, **vérifie les empreintes** (`LISEZMOI.md`) et
les note dans le `LISEZMOI` de destination. **Rien sur le site ne pointe vers `docs/`.**

### 5.2 Ancres du plan (parcours)

Le parcours ne déclare **pas de pixels** : la géométrie du plan est celle du premier chantier. Une étape déclare une
**ancre** que la vue sait placer (proposition, à adapter au code et à dire au compte rendu) :

| Ancre | Où (maquette, repère 800 × 562) |
|---|---|
| `quai:QUAI 2` | devant le quai, sur l'allée principale (410, 505) |
| `zone:reception` | dans la zone de réception, côté allée (680, 400) |
| `allee:principale` | sur l'allée principale, à gauche des quais (300, 509) |
| `allee:A` | au milieu de l'allée A (155, 330) |
| `zone:litiges` | dans le couloir à droite des racks, face à la zone litiges (553, 92) |
| `zone:bureau` | même couloir, face au bureau (553, 189) |

Option : `{ ancre: 'allee:A', decalage: [0, -40] }`. **La trace** est calculée par la vue (chaque étape rejoint l'allée
principale, la longe, remonte), ou déclarée en liste d'ancres si c'est plus simple : la maquette donne le dessin attendu.
Le décor de visite se déclare dans `plan.zones` : `reception: { vide: true, note: 'vide à 8 h' }`, `passagePietons: {
sur: 'principale', devant: 'reception' }` (forme à adapter).

### 5.3 La déclaration (proposée par Cowork : l'adapter si le code l'impose, et le noter au compte rendu)

```js
entrepot: {
  id: 'smoby-visite',
  libelle: 'Visite de la plateforme',
  mode: 'visite',
  plan, stock, gammes, produits,            // ceux d'ENT-5.5 (donnees-maquette.json), importés : données partagées, état cloisonné
  zones: { reception: { vide: true, note: 'vide à 8 h' }, passagePietons: { … } },
  personnage: { nom: 'Bruno', role: 'chef de quai', date: 'mercredi 9 décembre' },
  images: { … },                            // §5.1
  etapes: [
    { id: 'accueil',  type: 'accueil', titre: 'Accueil', heure: '8:00', texte: '…', image: 'ciel', programme: […], encadre: '…' },
    { id: 'ciel',     type: 'photoPoints', titre: 'Vue du ciel', heure: '8:05', texte: '…', image: 'ciel', effet: 'zoom',
      points: [ { n: 1, x: 1080, y: 120, mot: "L'entrepôt", def: '…', zoom: { cx: 1090, cy: 155, s: 1.62 } }, … ],
      puis: { type: 'photoQuestions', bouton: 'Passer aux 3 questions →', faux: 'Pas ici. Relisez le {aide}.',
              questions: [ { id: 'camions', q: "Où attendent les camions avant d'aller à quai ?", zones: [[720, 470, 1360, 650]], aide: 'point n° 3' }, … ] } },
    { id: 'parcours', type: 'parcours', titre: 'Le parcours', heure: '8:15', texte: '…', ordre: true,
      etapes: [ { n: 1, ancre: 'quai:QUAI 2', titre: 'Le quai', images: ['quaiInt'], dir: 90, cone: 34, texte: '« … »' }, … ] },
    { id: 'mots',     type: 'photoPoints', effet: 'bulle', image: 'allee', points: [ … ] },
    { id: 'quiz',     type: 'photoQuestions', image: 'quiz', juste: 'Oui : c\'est {mot}.', faux: '…', questions: [ … ] },
    { id: 'travee',   type: 'delimiter', image: 'travee', coins: { hg: [287, 45], … }, tolerance: 80, noms: { … },
      messages: { juste: '…', faux: 'Pas encore : {coins}. …' }, correction: { legendes: [ … ] },
      puis: { type: 'zones', consigne: '…', x: [270, 870], marge: 8, cibles: [ … ], pieges: [ … ], horsCible: '…', dejaTrouve: '…' } },
    { id: 'adresse',  type: 'adresse', code: 'A1-T03-N2-E1', sens: [ … ], choix: [ … ], rappel: '…', encadre: '…' },
  ],
  fin: { heure: '9:00', texte: '…' },
  jalons: [                                 // §6
    { id: 'ciel-camions', etape: 'ciel', question: 'camions', libelle: "Vue du ciel : où attendent les camions…" }, …
    { id: 'travee', etape: 'travee', quoi: 'coins' }, { id: 'lisses', etape: 'travee', quoi: 'cibles' },
    { id: 'decompose', etape: 'adresse', quoi: 'decomposer' }, { id: 'retrouve', etape: 'adresse', quoi: 'retrouver' },
  ],
}
```

Toutes les valeurs d'ENT-5.3 sont au §6 de son brief. État dans **`db.entrepots['smoby-visite']`** (clé du premier
chantier), **cloisonné par séance** : étape en cours, étapes finies, points ouverts, réponses et essais par question, points
posés et vérifications, cibles trouvées et clics faux, choix de l'adresse, clics d'emplacement.

## 6. Jalons

Un jalon de la vue = une étape du suivi (`etapesEntrepot`, comme `etapesQuai`). Types :

| Brique | Jalon | Vrai si | Premier coup (repérage) | Inaction |
|---|---|---|---|---|
| `photoQuestions` | un par question | question réussie | réussie au 1er clic | non répondue = faux |
| `delimiter` | coins | 4 coins justes | juste au 1er « Vérifier » | aucun point = faux |
| `zones` | cibles | toutes trouvées | aucun clic compté faux | rien = faux |
| `adresse` | décomposer | 4 parties justes à la validation | = le jalon | non validée = faux |
| `adresse` | retrouver | emplacement juste cliqué | 1 seul clic | non trouvé = faux |

**Aucun jalon** pour `accueil`, `photoPoints`, `parcours` : ils **débloquent la suite**. **Convention du lot 6** (livré) :
chaque étape rend **`'attente'`** tant que l'élève n'a rien tenté (premier clic sur la photo, premier « Vérifier », première
validation), puis `ok` / `ko` ; le moteur garde le premier jugement pour « du premier coup ». Note : jalons / jalons × 20
(barème déclaré par la séance ; 11 pour ENT-5.3). **Pas d'évaluation dans ce chantier** (la visite est un guidage) : une
évaluation (rien de signalé avant la copie rendue) se fera quand une séance la demandera.

## 7. Charte

- **Couleur de la visite** (trace, disques, cônes) : une variable nouvelle (`--visite`, `--visite-voile` dans la maquette),
  **distincte du vert** (juste / ordre d'une tournée) **et du bleu des clients** des vues de transport, déclarée **trois
  fois** dans `styles/entrepot.css` ou `base.css` selon la règle du premier chantier ; contraste ≥ 4,5 pour les numéros.
- **Le vert plein ne dit que « juste »** : ici, seulement la correction de la travée (contour, voile, étiquette « 1 travée »)
  et ✓. **Points vus** : la maquette les remplit d'un vert très pâle (`#d9f2e3`) → **le rendre par la forme** (disque plein
  de la couleur d'accent ou contour épais), pas par un aplat vert.
- **Sur les photos**, les couleurs des repères ne changent pas avec le thème (la photo non plus) : la maquette a des
  valeurs fixes (`#1565c0` pour les points posés, `#9d2727` pour les faux, `#107c41` pour la correction, étiquettes
  blanches à texte foncé). Les garder **en variables propres aux photos**, contrastées sur photo claire et sombre, et le dire
  au compte rendu. **Pas de blanc pur** hors des photos.
- Focus conservé au redessin (au clavier seulement) ; `prefers-reduced-motion` coupe le zoom et la bascule.

## 8. Ce que la séance ENT-5.3 déclarera (pour mémoire)

8 étapes : accueil · vue du ciel (6 points, zoom, puis 3 questions) · parcours (6 étapes, 7 images) · mots du rack (8 points,
bulle) · quiz (4 questions) · travée (4 coins, puis 3 lisses) · adresse (décomposer, retrouver) · fin. **11 jalons.** Tout
le contenu : `ENT-5.3-smoby-visite.md` §4 et §6.

## 9. Fichiers attendus (indicatif) et lots

**Fichiers** : `core/types/entrepot.js` (mode `visite`) **ou** `core/types/entrepot-visite.js` importé par lui si le fichier
devient trop gros (au choix, le dire) ; `styles/entrepot.css` ; `contenus/entrepot-essai.js` : un **cas « visite »** qui
reprend le contenu d'ENT-5.3 (page d'essai) ; `outils/essai-entrepot.html` : le mode visite dans l'en-tête (élève /
enseignant, navigation libre côté enseignant) ; `outils/test/entrepot.mjs` (bloc existant du premier chantier : cas
**ajoutés**) ; `activites/FICHE-SEANCE.md` : section « mode visite » ; `docs/decisions.md`.

**Lots** (chacun commité ; pousser quand la suite est verte) :

1. **Le cadre et les photos** (3-4 h) : `mode: 'visite'`, file des étapes et navigation (§3.2), bandeau par étape, état
   cloisonné, `etapesEntrepot` pour la visite ; briques `accueil`, `photoPoints` (zoom et bulle, enchaînement par bouton),
   `photoQuestions` ; page d'essai avec la vue du ciel, les mots et le quiz.
2. **Le parcours** (2-3 h) : ancres, trace, cônes, ordre imposé, onglet photo à une ou plusieurs images, décor de visite.
3. **La travée** (2 h) : `delimiter` puis `zones`, correction légendée.
4. **L'adresse** (1 h 30-2 h) : décomposer, retrouver avec le plan et la vue de face du premier chantier en lecture.
5. **Tests, fiche, compte rendu** (le reste).

## 10. Tests attendus (bloc `entrepot`, cas ajoutés)

Valeurs **écrites à la main** (celles d'ENT-5.3, §6 de son brief) :

- **Navigation** : élève — étape 3 non cliquable depuis l'étape 1, « Suivant » inactif tant que l'étape n'est pas finie,
  retour sur une étape faite sans rien perdre ; enseignant — saut libre. ✓ seulement sur une étape finie.
- **Vue du ciel** : ouvrir les 6 points **ne lance pas les questions** (le bouton seul les lance) ; clic dans
  `[720,470,1360,650]` → question 1 juste ; clic à (100, 100) → « Pas ici. Relisez le point n° 3. », jalon encore faux, puis
  juste après un bon clic avec premier coup **faux** ; passage piétons : les **deux** zones comptent.
- **Quiz** : « une lisse » cliquée dans `[405,367,1173,427]` → juste ; cliquée sur l'allée → faux.
- **Travée** : les 4 coins exacts **dans le désordre** (bd, hg, bg, hd) → juste ; coins du bas **trop hauts** (258, 1050)
  et (876, 1050) → « coins en bas à gauche, en bas à droite » et seulement eux en rouge ; un point à 79 de son coin → juste,
  à 81 → faux (tolérance) ; clic sur un point posé → enlevé ; 5e clic sans effet.
- **Lisses** : (570, 80) → « lisse du haut » ; (570, 160) → message du **fond**, compté faux ; (950, 450) → message de la
  **travée d'à côté** ; (570, 600) → « pas une lisse » ; re-clic (570, 80) → « déjà trouvée », **non compté faux** ; les 3
  trouvées sans faute → premier coup vrai.
- **Adresse** : travée et niveau **inversés** dans les listes → jalon décomposer faux, correction affichée, on passe quand
  même à « retrouver » ; clic `A2-T03-N2-E1` → message « le côté » + « Revenez au plan » ; `A1-T03-N3-E1` → « le niveau (N3
  au lieu de N2 — le sol est N1) » sans « Revenez au plan » ; `A1-T03-N2-E1` → « Trouvé … une Maison Neo Jura Lodge de
  420 kg » (désignation **lue dans le stock** : un sabotage du stock change le message) ; **aucune surbrillance** de la
  cible avant le clic juste (lire le DOM).
- **Inaction** : séance ouverte puis rien → **0 / 11**, toutes les étapes du suivi en `'attente'` ; parcourir toute la
  découverte (points, parcours, mots) sans répondre → toujours **0 / 11**.
- **Parcours juste** → **11 / 11**, premier coup 11 / 11 ; avec les erreurs ci-dessus → 10 / 11 (décomposer faux) et
  premier coup réduit.
- **Images** : chaque image déclarée existe dans le dépôt, repère à la proportion du fichier (≤ 1 %), **aucune requête hors
  du site** (le test d'adresses d'hébergeurs existant passe).
- **État** retrouvé après rechargement ; deux séances ne se mélangent pas. **Sabotages** : chaque jalon tombe quand on casse
  sa règle (zone décalée, tolérance à 0, piège rangé en cible, partie de l'adresse inversée).
- Piloter l'écran au moins une fois (souris sur `boundingBox()` après `scrollIntoViewIfNeeded()`), à 1366 × 768 et
  1280 × 720 : **aucun défilement de page**.

## 11. Décisions à reporter dans `docs/decisions.md` (Tristan, 04/10/2026)

Visite = séance à part avant la réception ; vue du ciel + photo légendée + parcours à photos ; une photo par endroit de la
visite (deux pour les litiges : photo + dessin) ; questions de la vue du ciel lancées **par un bouton**, jamais
automatiquement ; étape « La travée » (4 coins placés par l'élève, puis ses 3 lisses) ; adresse « décomposer puis
retrouver » ; un clic faux ne fait pas perdre le jalon (« du premier coup » le trace) ; l'élève revient en arrière mais ne
saute pas en avant ; photo de la travée gardée (le passage au bas de la travée se dit en classe) ; la lisse du haut compte
même vide. *(Cowork a ajouté une ligne de dépôt ; Claude Code reporte ces décisions à la livraison.)*

## 12. Questions ouvertes (chacune a une valeur par défaut : l'appliquer et le dire au compte rendu)

1. **Écran de bilan dans la vue** ? *(Défaut : non — le suivi et le repérage existants le font ; la dernière étape montre le
   message de fin de Bruno.)*
2. **Ancres du plan** : noms et forme (§5.2) ? *(Défaut : ceux du tableau, adaptés à la géométrie du premier chantier.)*
3. **Photo à cliquer au clavier** : une alternative ? *(Défaut : non pour les questions et la travée — c'est un geste de
   pointage, comme la maquette ; points, étapes, listes et boutons restent au clavier.)*
4. **Un fichier ou deux** (`entrepot.js` / `entrepot-visite.js`) ? *(Défaut : deux si `entrepot.js` dépasse ~1 500 lignes.)*
5. **Couleurs sur photo** en variables à part, fixes quel que soit le thème ? *(Défaut : oui, §7.)*

## 13. Critères de validation par Tristan

Sur la page d'essai, à 1366 × 768 : la visite se joue **comme la maquette v2**, de l'accueil à la fin, sans défilement ; la
vue du ciel zoome et ne passe aux questions qu'au bouton ; le parcours suit l'ordre et chaque étape montre sa photo en
grand ; la travée se délimite et ses lisses se trouvent avec les bons messages ; l'adresse se retrouve sans que la cible
soit montrée ; côté élève, pas de saut en avant.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** : bloc / suite entière, nombre de cas, sabotages éprouvés
- **Commits** :
- **Reste ouvert** :
