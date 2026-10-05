# Brief de séance — ENT-5.3 Smoby, premier jour de Yanis : la visite de la plateforme (2de, poste C — cariste, guidage)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-smoby.md puis implémente le brief docs/briefs/ENT-5.3-smoby-visite.md. Il faut que MOTEUR-vue-plan-entrepot.md et MOTEUR-modes-visite.md soient livrés, ainsi que le lot 7 de MOTEUR-2de-S1 (Smoby dans activites/index.js) : sinon arrête-toi et dis-le. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : **à implémenter** — les deux chantiers moteur sont livrés (mode visite le 05/10/2026) ; **le contenu du §6 est
déjà déclaré** dans `contenus/smoby-ent53.js` (cas « visite » de la page d'essai) : reste le fichier d'activité, le `lexique`
des 8 mots et la ligne dans `activites/index.js`. Brief **à jour de la maquette v2 validée** (04/10/2026, soir).
**Date du brief** : 04/10/2026 (mis à jour le 04/10 au soir : maquette v2, 8 étapes, 11 jalons)
**Conversation d'origine** : Cowork (Opus) ; fiches projet `claude/prepalog-2de-s1-visite.md` (décisions 1 à 11) et
`claude/prepalog-plan-entrepot-cadrage.md`.
**Modèle** : Opus pour les deux chantiers moteur ; **Sonnet suffit pour la séance** une fois les modes visite livrés (elle
ne fait que déclarer du contenu).
**Référence d'interaction** : `docs/briefs/smoby/visite/maquette-visite-2de-v2.html` (**validée**). La v1
(`maquette-visite-2de.html`, ancien plan, adresse `A-03-2-1`) est **dépassée** : à supprimer (`git rm`) au commit de ces
briefs.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-5.3 |
| `id` | `smoby-visite` |
| Titre / desc | « Smoby — la visite de la plateforme » / « Premier jour de Yanis : découvrir la plateforme vue du ciel, suivre le parcours de visite dans l'entrepôt, apprendre les mots du rack, délimiter une travée, lire et retrouver une adresse d'emplacement. » |
| Rubrique | simulog, entreprise n° 5 Smoby |
| Niveau(x) | 2de |
| Compétence(s) | **C1.2 et C1.5** en initiation (confirmé par Tristan le 04/10) ; `domaines: ['D4']` |
| Temps pédagogique | guidage ; `coeur: true` (nom retenu au lot 1 de `MOTEUR-2de-S1`, `parcours` étant pris) |
| Notation | jalons + note sur 20 |
| Barème | **11** |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** : plateforme de **stockage logistique de Smoby à Moirans-en-Montagne** (hebdo39.net, voir
  `COORDINATION-smoby.md`).
- **Construit** : le plan de la zone (celui d'ENT-5.5, maquette v2 du Plan d'entrepôt), le parcours de visite, le stock,
  Bruno (chef de quai, prénom inventé), l'adresse `A1-T03-N2-E1`.
- **Photos : libres, aucune n'est la plateforme Smoby, aucun visage** — dit à l'élève sous **chaque** photo (« Photo d'un
  autre entrepôt : … »). Fichiers, sources, retouches et empreintes : `docs/briefs/smoby/visite/LISEZMOI.md`.

| Où | Image (clé) | Source | Fichier dans `docs/briefs/smoby/` | Repère des coordonnées |
|---|---|---|---|---|
| Accueil, vue du ciel | `ciel` | Marcin Jozwiak, Pexels 2804929 | `visite/ciel-pexels-2804929.jpg` (1600 × 1066) | 1600 × 1066 |
| Parcours ① le quai | `quaiInt` | Pexels 1267327, marques effacées par Cowork (photo du déchargement d'ENT-5.4) | `quai-interieur.jpg` (1280 × 854) | — |
| Parcours ② zone de réception | `reception` | Tiger Lily, Pexels 4481326 | `visite/visite-reception-pexels-4481326.jpg` (1280 × 854) | — |
| Parcours ③ allée principale | `principale` | Willians Huerta, Pexels 36398150, logo du chariot flouté | `visite/visite-allee-principale-pexels-36398150.jpg` (1280 × 853) | — |
| Parcours ④ allée A, et mots du rack | `allee` | Handi Boyz LLC, Pexels 5775099 | `visite/allee-pexels-5775099.jpg` (1600 × 900) | **1400 × 788** (même proportion) |
| Parcours ⑤ zone litiges (photo) | `litiges` | Duc LE, Unsplash `mFUIel9hWos`, recadrée, marques effacées | `visite/visite-litiges-unsplash-mFUIel9hWos.jpg` (900 × 922) | — |
| Parcours ⑤ zone litiges (dessin) | `litigesDessin` | **dessin de Cowork** | `visite/visite-litiges-dessin.jpg` (1280 × 854) | — |
| Parcours ⑥ bureau du chef de quai | `bureau` | Pavel Danilyuk, Pexels 7658310 | `visite/visite-bureau-pexels-7658310.jpg` (1280 × 854) | — |
| Quiz | `quiz` | Pexels 4483609 | `visite/rack-pexels-4483609.jpg` (1280 × 1920) | 1280 × 1920 |
| La travée | `travee` | Pexels 29454378, recadrée, marques floutées | `visite/visite-travee-pexels-29454378.jpg` (1100 × 1246) | 1100 × 1246 |

La photo de quai Pexels 16924265 (v1) **n'est plus utilisée**. Mentions sous les photos : §6.9.

## 3. Objectif pédagogique

L'élève **se repère** sur une plateforme logistique (vue du ciel, puis plan), **nomme** les éléments d'un rack à palettes,
**délimite une travée** lui-même et **lit puis retrouve une adresse d'emplacement** (allée et côté, travée, niveau,
emplacement). Séance d'accueil du poste cariste : suit ENT-5.2 (l'arrivée de Yanis), précède la réception (ENT-5.4), le
rangement (ENT-5.5) et la préparation (ENT-5.6), où ce vocabulaire et l'adresse servent.

## 4. Déroulé (validé par Tristan le 04/10 ; maquette v2 validée le 04/10 au soir)

Mercredi 9 décembre 2026 : Yanis arrive. **8 étapes**, une entrée de menu « Visite de la plateforme » (mode `visite` de la
vue Plan d'entrepôt). Heure affichée dans le message de Bruno, par étape : 8:00, 8:05, 8:15, 8:30, 8:40, 8:45, 8:50, 9:00.
Navigation : l'élève **revient** sur une étape faite, **ne saute pas en avant** ; « Suivant → » seulement quand l'étape est
finie (`MOTEUR-modes-visite.md` §3.2).

1. **Accueil** (`accueil`) — la vue du ciel en fond, titre, « Ce que tu vas faire » (6 lignes), encadré « photos d'autres
   entrepôts ».
2. **Vue du ciel** (`photoPoints`, zoom) — **6 points** à ouvrir ; un clic fait « descendre le drone » et affiche la phrase.
   Tous ouverts → bouton **« Passer aux 3 questions → »** (jamais automatique) → **3 questions** où l'on clique sur la photo.
   Faux → « Pas ici. Relisez le point n° … », l'élève recommence.
3. **Le parcours** (`parcours`) — le plan de la plateforme avec le **parcours de visite numéroté**, dans l'ordre : ① quai 2
   → ② zone de réception (par le passage piétons) → ③ allée principale → ④ allée A → ⑤ zone litiges → ⑥ bureau. Chaque
   étape : la parole de Bruno et **la photo prise depuis ce point** en grand (deux images côte à côte pour les litiges).
4. **Les mots du rack** (`photoPoints`, bulle) — **8 mots** sur la photo d'allée (aussi dans la liste de côté).
5. **Quiz** (`photoQuestions`) — sur une autre photo **sans légende** : une échelle, une lisse, une palette filmée, l'allée.
6. **La travée** (`delimiter` puis `zones`) — sur une photo de racks **vus de face**, l'élève **place les 4 coins** de la
   seule travée complète, « Vérifier » ; juste → correction légendée (échelle ×2, sol, 1 travée) ; puis il **clique les 3
   lisses** de cette travée (pièges : barres du rack du fond, lisse de la travée voisine).
7. **L'adresse** (`adresse`) — (a) **décomposer** `A1-T03-N2-E1` : une liste par partie, « Valider » (une seule fois, la
   correction reste affichée) ; (b) **retrouver** : clic sur la travée A1-T03 dans le plan, puis sur l'emplacement N2-E1 dans
   la travée vue de face (aucune surbrillance de la cible, message qui nomme la partie fausse).
8. **Fin** — message de Bruno (cet après-midi, premier camion d'Arinthod au quai n° 2). Le bilan est celui du suivi.

## 5. Jalons / notation (11)

| # | Jalon | Ce qu'il lit | Premier coup (repérage) | Piège à éviter |
|---|---|---|---|---|
| 1 | Vue du ciel : « Où attendent les camions avant d'aller à quai ? » | question réussie | 1er clic | non répondue = faux ; **pas avant le bouton** |
| 2 | Vue du ciel : « Par où un piéton traverse-t-il la cour ? » | idem | 1er clic | idem |
| 3 | Vue du ciel : « Où les camions sont-ils chargés et déchargés ? » | idem | 1er clic | idem |
| 4 | Quiz : cliquer sur une échelle | question réussie | 1er clic | non répondue = faux |
| 5 | Quiz : cliquer sur une lisse | idem | 1er clic | idem |
| 6 | Quiz : cliquer sur une palette filmée | idem | 1er clic | idem |
| 7 | Quiz : cliquer sur l'allée | idem | 1er clic | idem |
| 8 | Travée délimitée (4 coins justes) | coins justes | juste au 1er « Vérifier » | aucun point = faux |
| 9 | Les 3 lisses de la travée trouvées | 3 cibles trouvées | aucun clic faux | rien = faux |
| 10 | Adresse A1-T03-N2-E1 décomposée (4 parties justes) | choix à la validation | = le jalon | non validée = faux ; **une seule validation** |
| 11 | Emplacement A1-T03-N2-E1 retrouvé | clic juste | 1 seul clic | non trouvé = faux |

**Un clic faux ne fait pas perdre le jalon** (guidage : l'élève recommence ; « du premier coup » le trace — décision 11).
Exception assumée : le jalon 10 se joue en une validation (4 listes : recommencer reviendrait à deviner). La découverte
(points du ciel, parcours, mots du rack) **ne donne pas de jalon** : elle débloque la suite. Indicateurs de repérage
(lot 6, livré) : premier coup, temps, **nombre de clics pour retrouver l'emplacement**.

## 6. Contenu

`contenus/smoby-ent53-visite.js` : déclaration `entrepot` en mode `visite` (`MOTEUR-modes-visite.md` §5.3). **Plan, stock,
gammes, produits : ceux d'ENT-5.5**, repris de `docs/briefs/plan-entrepot/donnees-maquette.json` (importés d'une source
commune Smoby si ENT-5.5 en a créé une ; état cloisonné). **Zone de réception vide à 8 h** (aucune palette reçue). Les
valeurs ci-dessous sont celles de la maquette v2 (reprises de son script) ; les coordonnées sont dans le **repère de
chaque image** (§2). Textes **au mot près** (Tristan les a validés à l'écran).

### 6.1 Messages de Bruno (un par étape)

1. « Bienvenue Yanis ! Avant de toucher un chariot, on fait le tour de la plateforme. D'abord vue du ciel, puis on entre
   dans l'entrepôt. »
2. « Voilà la plateforme vue d'en haut. Repère bien où passent les camions… et où passent les piétons. »
3. « On entre. Suis-moi : je te montre le chemin d'une palette, du quai jusqu'au rack. »
4. « Un rack à palettes a son vocabulaire. Si tu dis « l'étagère orange », personne ne te comprend. »
5. « Même vocabulaire, autre entrepôt. Montre-moi que tu as retenu. »
6. « La travée, c'est le mot qu'on emploie le plus ici. Montre-moi où commence et où finit une travée. »
7. « Chaque emplacement a une adresse. Avec elle, tu retrouves n'importe quelle palette sans chercher. »
8. « Bien, Yanis. Cet après-midi, premier camion de l'usine d'Arinthod au quai n° 2. On commence par la sécurité. »

En-tête : « Bruno, chef de quai · mercredi 9 décembre, 8:05 ».

### 6.2 Accueil

Sur-titre « Smoby · plateforme de Moirans-en-Montagne (Jura) » ; titre « Premier jour de Yanis : la visite de la
plateforme » ; texte « Mercredi 9 décembre, 8 h. Yanis commence au poste de cariste. Avant de toucher un chariot, Bruno, le
chef de quai, lui fait faire le tour. » Programme : Découvrir la plateforme vue du ciel · Suivre le parcours de visite dans
l'entrepôt · Apprendre les mots du rack · Les retrouver sur une autre photo · Délimiter vous-même une travée · Lire une
adresse d'emplacement (A1-T03-N2-E1) et la retrouver dans l'entrepôt. Encadré : « Les photos viennent **d'autres
entrepôts** : ce ne sont pas celles de Smoby. »

### 6.3 Vue du ciel (repère 1600 × 1066)

| n | x, y | Mot | Phrase | Zoom (cx, cy, s) |
|---|---|---|---|---|
| 1 | 1080, 120 | L'entrepôt | Le bâtiment de stockage : sous ce toit, les racks et les allées où travaille Yanis. | 1090, 155, 1.62 |
| 2 | 470, 420 | Les quais | Les portes où les camions se mettent à cul pour être chargés ou déchargés. Ici, deux semi-remorques sont à quai. | 495, 400, 3 |
| 3 | 1040, 575 | Parking poids lourds | Les remorques attendent leur tour, garées en épi, avant d'aller à quai. | 1040, 560, 2.2 |
| 4 | 330, 760 | Aire de manœuvre | Le grand espace où les camions reculent vers les quais. On n'y circule pas à pied. | 350, 640, 2 |
| 5 | 440, 578 | Passage piétons | Le seul chemin pour traverser à pied la cour des camions. | 470, 560, 2.6 |
| 6 | 667, 1000 | Parking des salariés | Les voitures restent à part : voitures et camions ne se croisent pas. | 700, 960, 2 |

Points : rayon 31. Consignes : « Ouvrez les **6 points** de la photo : un clic fait descendre le drone. » ; « Les 6 points
sont ouverts. Relisez-les si besoin, puis cliquez **Passer aux 3 questions** (à gauche). » ; « … **Cliquez sur la photo.** »

| Question | Zones `[x0, y0, x1, y1]` | Aide |
|---|---|---|
| Où attendent les camions avant d'aller à quai ? | `[720,470,1360,650]` | point n° 3 |
| Par où un piéton traverse-t-il la cour ? | `[180,545,700,605]`, `[30,420,200,560]` | point n° 5 |
| Où les camions sont-ils chargés et déchargés ? | `[390,300,600,510]` | point n° 2 |

Juste : « Oui, c'est bien ici. » · Faux : « Pas ici. Relisez le point n° 3. »

### 6.4 Le parcours (ancres du plan, `MOTEUR-modes-visite.md` §5.2)

Consigne : « Cliquez les étapes du parcours **dans l'ordre**, sur le plan : chacune montre ce qu'on voit depuis ce point. »
Avant la première : encadré « Commencez par l'étape **n° 1**, devant le quai. » Ordre forcé : « Dans l'ordre : l'étape
suivante est la n° … ».

| n | Titre | Ancre (maquette, repère 800 × 562) | Image(s) | Sens (°) / cône | Parole de Bruno |
|---|---|---|---|---|---|
| 1 | Le quai | `quai:QUAI 2` (410, 505) | `quaiInt` | 90 / 34 | « Ici arrivent les camions, à reculons contre la porte. Le niveleur fait le pont entre le camion et le sol. On ne décharge jamais un camion qui n'est pas calé. » |
| 2 | La zone de réception | `zone:reception` (680, 400) | `reception` | −90 / 70 | « Les palettes déchargées attendent ici. On les contrôle avec le bon de livraison avant de les ranger. Cet après-midi, ce sera ton travail. » |
| 3 | L'allée principale | `allee:principale` (300, 509) | `principale` | 180 / 70 | « Les chariots roulent ici dans les deux sens. À pied, on reste sur le côté, et on traverse seulement au passage piétons. » |
| 4 | Les allées de stockage | `allee:A` (155, 330) | `allee` | −90 / 70 | « Les racks à palettes, de chaque côté de l'allée : A1 à gauche, A2 à droite. Chaque emplacement a une adresse collée sur la lisse : c'est comme ça qu'on retrouve une palette. » |
| 5 | La zone litiges | `zone:litiges` (553, 92) | `litiges`, `litigesDessin` | 0 / 50 | « Une palette abîmée ou en attente d'une réponse du fournisseur vient ici, en L1 ou L2. Elle ne va pas en stock. » |
| 6 | Le bureau du chef de quai | `zone:bureau` (553, 189) | `bureau` | 0 / 50 | « Mon bureau. Un problème, un document à signer : c'est ici. » |

Trace de la maquette (pour le dessin attendu) : (410,505) → (680,505) → (680,400) → (680,505) → (300,505) → (155,505) →
(155,330) → (155,505) → (553,505) → (553,92) → (553,189). Décor : zone de réception « vide à 8 h », passage piétons sur
l'allée principale devant la zone de réception.

### 6.5 Les mots du rack (image `allee`, repère 1400 × 788)

| n | x, y | Mot | Définition |
|---|---|---|---|
| 1 | 215, 430 | Échelle | Le montant vertical (bleu), percé de trous, qui porte les lisses. Deux échelles délimitent une travée. |
| 2 | 430, 247 | Lisse | La barre horizontale (orange) sur laquelle on pose les palettes. Sa charge maximale est écrite sur une plaque. |
| 3 | 150, 118 (trait vers 155, 182) | Étiquette d'adresse | L'adresse de l'emplacement, collée sur la lisse. On la lit avant de poser la palette. |
| 4 | 385, 470 | Palette filmée | Les cartons sont tenus par un film plastique étirable enroulé autour de la palette. |
| 5 | 740, 620 | Allée | Le couloir entre deux racks, où roulent les chariots. |
| 6 | 1300, 290 | Niveau | Chaque étage de lisses est un niveau. Le sol est le niveau 1. |
| 7 | 1100, 420 | Travée | L'espace entre deux échelles, sur toute la hauteur du rack. |
| 8 | 930, 470 | Croisillons | Les barres en diagonale qui rigidifient l'échelle. Un croisillon tordu : rack à signaler. |

Points : rayon 24. Consigne : « Ouvrez les **8 mots** du rack : cliquez un numéro sur la photo, ou un mot dans la liste. »
Ces 8 mots vont aussi dans le **`lexique`** de la séance (mots cliquables, lot 3 livré), même définition.

### 6.6 Quiz (image `quiz`, repère 1280 × 1920)

| Consigne « Sur cette photo d'un autre entrepôt, cliquez sur … » | Zones |
|---|---|
| une échelle | `[171,43,416,1408]`, `[544,427,661,1280]`, `[1150,0,1280,1600]` |
| une lisse | `[309,85,1184,160]`, `[405,367,1173,427]`, `[0,998,192,1066]` |
| une palette filmée | `[0,683,171,1003]`, `[352,501,555,693]` |
| l'allée | `[427,1323,1152,1920]` |

Juste : « Oui : c'est une lisse. » · Faux : « Non, pas ici. Revoyez le mot à l'étape précédente si besoin. » · Encadré :
« Pas de légende ici : c'est à vous de reconnaître chaque élément. »

### 6.7 La travée (image `travee`, repère 1100 × 1246)

Une **seule travée complète** (celle du milieu) : une seule bonne réponse. Son niveau du bas est un **passage** (on voit
l'allée au travers) : c'est toujours une travée — **à dire en classe** (décision 11).

- **Coins attendus** : haut gauche (287, 45), haut droit (847, 47), bas gauche (258, 1175), bas droit (876, 1173) ;
  **tolérance 80** (≈ 30 px à l'écran à 1366 × 768) ; noms « en haut à gauche », « en haut à droite », « en bas à
  gauche », « en bas à droite ».
- Consigne : « Une travée, c'est l'espace **entre deux échelles**, **du sol jusqu'en haut** du rack. Cliquez **les 4
  coins** d'une travée complète sur la photo. » Rappel : « Une **échelle** est le montant vertical percé de trous ; une
  travée va d'une échelle à la suivante, sur **toute la hauteur**. Cliquez un point déjà posé pour l'enlever. »
- Faux : « Pas encore : coins {liste}. Un coin se place là où une **échelle** touche le **sol** ou s'arrête **en haut**.
  Cliquez le point rouge pour l'enlever. » · Juste : « Oui : cette travée va de l'échelle de gauche à l'échelle de droite, du
  sol jusqu'en haut. »
- **Correction légendée** : la travée (coins attendus) ; « échelle » à (268, 780) tourné −90° et à (866, 780) tourné 90° ;
  « sol » à (550, 1122) ; « 1 travée » à (550, 590).
- **Lisses** (cibles, x 270 → 870, marge ± 8) : **lisse du haut** y 60–96 · **lisse du milieu** y 436–472 · **lisse du bas**
  y 670–704. **La lisse du haut compte même vide** (décision 11).
- **Pièges du fond** (rack de derrière) : y 145–178, 208–242, 288–312, 368–394.
- Consigne : « Maintenant, cliquez **chaque lisse de cette travée** : les barres horizontales accrochées à ses deux
  échelles, qui portent les palettes. » Rappel : « Une **lisse** est la barre horizontale (orange) posée entre deux
  échelles ; les palettes reposent dessus. Attention aux barres **du fond**, qu'on voit à travers la travée. »
- Messages : trouvée « Oui : c'est la lisse du haut. » · fond « Cette barre est **au fond**, sur le rack de derrière.
  Cherchez les lisses accrochées aux échelles **de devant**. » · hors travée « C'est bien une lisse, mais celle de la
  **travée d'à côté**. Restez entre les deux échelles de votre travée. » · ailleurs « Ici, ce n'est pas une lisse. Une
  lisse est une barre horizontale orange, entre les deux échelles. » · re-clic « Celle-ci est déjà trouvée. »

### 6.8 L'adresse

- Code `A1-T03-N2-E1`, parties `A1`, `T03`, `N2`, `E1` ; sens attendus **allée et côté / travée / niveau / emplacement** ;
  ordre des choix dans les listes : **allée et côté, emplacement, niveau, travée**.
- Consigne (a) : « Bruno vous montre une étiquette collée sur une lisse. **Que veut dire chaque partie ?** Choisissez, puis
  validez. » Rappel : « Une adresse se lit **de la plus grande zone à la plus petite** : on trouve l'allée, puis la travée,
  puis le niveau, puis l'emplacement. »
- Encadré (b) : « **A1** : allée A, côté 1. Une allée a deux côtés : **A1** et **A2** sont les racks de part et d'autre de
  l'allée A. **T** = travée, **N** = niveau (le sol est N1), **E** = emplacement (3 palettes par niveau). »
- Consignes (b) : « Retrouvez **A1-T03-N2-E1** : cliquez la bonne **travée** sur le plan. » puis « Cliquez l'**emplacement**
  A1-T03-N2-E1 dans la travée vue de face. »
- **Cible** : dans le stock de `donnees-maquette.json`, `A1-T03-N2-E1` = **Maison Neo Jura Lodge, 420 kg** (vérifié par
  Cowork le 04/10) → « ✓ Trouvé : A1-T03-N2-E1 — une Maison Neo Jura Lodge de 420 kg. » (lu dans le stock par le moteur).
- Vocabulaire : **« emplacement », jamais « place »** (décision de Tristan).

### 6.9 Mentions sous les photos

« Photo d'un autre entrepôt : Marcin Jozwiak, Pexels n° 2804929. » · « … : Pexels n° 1267327, marques effacées. » · « … :
Tiger Lily, Pexels n° 4481326. » · « … : Willians Huerta, Pexels n° 36398150, marque du chariot floutée. » · « … : Handi Boyz
LLC, Pexels n° 5775099. » · litiges : « Photo d'un autre entrepôt : Duc LE, Unsplash, marques effacées » et « Dessin : ce
qu'on doit voir dans une zone litiges » · « … : Pavel Danilyuk, Pexels n° 7658310. » · « … : Pexels n° 4483609. » · « … :
Pexels n° 29454378, recadrée, marques floutées. »

### 6.10 Le dessin de la zone litiges (ce qu'il montre, pour la trame)

Marquage rouge hachuré au sol, panneau « ZONE LITIGES — Ne pas stocker · Ne pas expédier », emplacements L1 / L2, palettes
étiquetées « BLOQUÉ » (1 carton écrasé, 2 cartons manquants).

## 7. Demandes au moteur

Toutes dans **`MOTEUR-modes-visite.md`** (second chantier), qui s'appuie sur **`MOTEUR-vue-plan-entrepot.md`** (plan, vue
de face, barre d'adresse, onglets). `MOTEUR-2de-S1.md` : lots **1** (note par spécialité), **3** (mots cliquables) et **6**
(repérage) **livrés** ; lot **7** (Smoby n° 5 dans `activites/index.js`, logo) **à faire** avec la première séance Smoby.

## 8. Tests attendus

Bloc `smoby` (la séance) ; les briques sont testées dans le bloc `entrepot` (`MOTEUR-modes-visite.md` §10). Pour la
séance : parcours juste **11 / 11** ; inaction **0 / 11** (et 0 / 11 après toute la découverte sans répondre) ; vue du ciel
cliquée à côté puis juste → jalon vrai, premier coup faux ; **travée juste avec les points dans le désordre** ; **un coin
faux** (coins du bas trop hauts) → seuls les coins du bas en rouge ; **3 lisses** sans faute → premier coup vrai ; **lisse du
fond** et **travée voisine** → messages déclarés, comptés faux ; adresse avec **travée et niveau inversés** → jalon 10 faux,
la suite reste jouable ; emplacement **retrouvé du premier coup** / **après une erreur** (1 clic / 2 clics au repérage) ;
chaque image déclarée existe, repère à la proportion du fichier ; aucune requête externe.

## 9. Supports

Trame courte (plan de la plateforme à légender, les 8 mots, une travée à délimiter, une adresse à décomposer) et fiche
d'intention du scénario : Cowork, **après validation à l'écran**.

## 10. Critères de validation par Tristan

À l'écran (1366 × 768), la séance se joue **comme la maquette v2** : l'élève de 2de se repère sans aide sur la vue du ciel
et le plan, suit le parcours dans l'ordre avec une photo à chaque endroit, reconnaît les mots du rack sur une autre photo,
délimite la travée et trouve ses lisses, lit l'adresse et retrouve l'emplacement.

## 11. Questions ouvertes (valeur par défaut)

- [x] Compétences : **C1.2 et C1.5** en initiation, `domaines: ['D4']` (confirmé par Tristan le 04/10, soir).
- [x] Mention « photo d'un autre entrepôt » sous chaque photo : **oui** (maquette validée).
- [x] Un clic faux fait-il perdre le jalon ? **Non**, « du premier coup » le trace (décision 11, valeur par défaut retenue).
- [x] Navigation élève : **retour sur les étapes faites, pas de saut en avant** (décision 11).
- [x] Photo de la travée gardée malgré le passage au bas : **oui**, à dire en classe (décision 11).
- [x] La lisse du haut compte même vide : **oui** (décision 11).
- [ ] Écran de bilan dans la vue (défaut : non, le suivi le fait — `MOTEUR-modes-visite.md` §12).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
