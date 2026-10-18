# Brief de séance — ENT-9.2 CHEP, contrôler un retour et organiser la ramasse (1re, guidage C2.5)

> **📋 Phrase à copier-coller dans Claude Code (Opus), après le chantier `MOTEUR-chep-ramasse-et-piles` (lots A et B) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/COORDINATION-chep.md, docs/briefs/MOTEUR-chep-ramasse-et-piles.md (compte rendu) puis docs/briefs/ENT-9.2-chep-ramasse-et-retours.md. État des lieux du §7, durée, puis construis.
> ```

**Statut** : à implémenter
**Date du brief** : 17/10/2026
**Conversation d'origine** : Cowork (Opus), 17/10/2026, décisions déléguées par Tristan (seul le nombre de séances est de lui). Choix
secondaires marqués **(Cowork)**. **À lire avec `COORDINATION-chep.md`** et le chantier moteur `MOTEUR-chep-ramasse-et-piles.md`.
**Modèle** : **Opus**. **Durée estimée** : ≈ 6 h (contenu de deux vues neuves, tirage des piles et de la tournée, calage des horaires, tests).
**Place dans l'ordre** : après ENT-9.1 et les lots A et B du chantier moteur.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-9.2 |
| `id` | `chep-ramasse-retours` |
| Titre / desc | « CHEP — un retour à contrôler, une ramasse à organiser » / « Au centre CHEP de Templemars : contrôler un camion de palettes vides au quai (compter, repérer les palettes d'un autre pool et les palettes abîmées, écrire les réserves), créditer le compte du distributeur, puis organiser la collecte du lendemain. » |
| Rubrique | simulog, entreprise n° 9 CHEP |
| Niveau(x) | `['1re']` |
| Compétence(s) | `['C2.5']`, indicateurs « contrôle qualitatif et quantitatif des retours » et « organisation de la ramasse » (rappel de « mise à jour de la base de données ») |
| Temps | `guidage` |
| Notation | jalons pondérés sur 20, coefficient 1 ; `bareme: 20` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |
| Niveaux prévus | `['confirme']` |
| Autres | `parcours`, `correction` ; `questions: 'ENT-9.2'` |

**Durée en classe : ≈ 1 h 30**, en deux temps qui tiennent chacun dans une heure de cours (matin : le quai et le crédit ; après-midi : la
ramasse). Le travail est gardé d'une heure à l'autre. **(Cowork)** : la séance n'est pas coupée en deux séances, parce que Tristan a validé 4
séances.

## 2. Vérifié / construit

Voir la **coordination §2**. Propre à cette séance :
- **Vérifié** : au centre de service, **tri et contrôle systématiques** des palettes collectées ; les non conformes sont réparées (ADLC 2009,
  §12 ; Templemars, 2017). La collecte se fait sur **avis des distributeurs**, en **camions complets** dans les grandes plates-formes et en
  petits volumes ailleurs (CHEP, Université de Cologne). La collecte est **souvent sous-traitée** à des transporteurs (ADLC 2009, §12).
  **900 transports par jour** en France, surtout des camions complets, et **5 millions de km à vide évités** en 2025 (L'Officiel des
  transporteurs, 28/05/2026).
- **Construit** : le quai des retours de Templemars et sa porte, Grégory, Yannick, Opale Frais et son camion, les piles et leurs histoires,
  les avis de vides, les horaires d'enlèvement, la capacité calculée (26 × 15 = 390), la règle « on reporte le site qui a signalé le plus
  tard », la vitesse moyenne et le temps d'enlèvement. Ce que deviennent ensuite les palettes d'un autre pool (« mises de côté ») : je n'ai
  pas vérifié la suite de leur trajet.

## 3. Objectif pédagogique

L'élève sait **contrôler un retour de palettes vides** en quantité (compter chaque pile, comparer au bon de collecte) et en qualité (repérer
les palettes d'un autre pool et les palettes abîmées). Il sait **écrire les réserves**, **calculer ce qui se crédite** au compte du distributeur
et ce qui part en réparation. Il sait aussi **organiser une ramasse** : calculer la capacité du camion, réserver un camion complet au gros
site, regrouper les autres dans une tournée qui tient dans le camion et respecte les horaires des quais, et reporter le bon site quand tout
ne tient pas.

## 4. Déroulé

**Date : mardi 19/01/2027.** Matin, 8 h, au quai des retours ; après-midi, 14 h, au bureau d'exploitation.
**Pastilles** : ① Contrôler le retour · ② Créditer le compte · ③ Préparer la ramasse · ④ Construire la tournée.
**Barre « Étape suivante »** : Messagerie → Quai des retours → Crédit du retour → Besoin de la ramasse → Tournée de ramasse.
**Menu** : Avant de commencer · Messagerie · Quai des retours · Crédit du retour · Ramasse du mercredi · Tournée de ramasse (`menu: []`).

### Étape 0 — Avant de commencer (≈ 5 min, non noté) — §4 ter.

### Temps 1 — Le retour d'Opale Frais (≈ 40 min)

**Message de Grégory** (8 h 05) : « Salut {prénom}, / le porteur de Transports Lys-Escaut arrive de chez Opale Frais (Dunkerque) avec les vides
de la semaine. Le bon de collecte annonce 75 palettes CHEP en 5 piles. Contrôle chaque pile : combien il y en a, si ce sont bien des
CHEP, si elles sont en état. Écris les réserves sur le bon, puis prépare le crédit pour Opale Frais. / Grégory »

**Le quai iso** (`quai`, lot B) : `rendu: 'iso'`, `froid: false`, un porteur, cariste au chariot frontal, `unite: { un: 'palette', des:
'palettes', feminin: true }`, `document: { nom: 'bon de collecte' }`, `decisions: ['accepter', 'reserves']`, `motifs: ['manquant', 'avarie',
'produit']` avec les libellés du lot B, `deuxMotifs: true`. **Pas d'inspection de la scène** (pas de `securite`) **(Cowork)** : 9.2 porte
sur le retour, pas sur le quai. Les étapes ① (accueil et bon) à ④ (réserves, clôture) sont celles du quai.
- Aides de guidage : `aides.consignes` (« Compte les palettes de la pile une à une, en cliquant. Fais le tour de la pile : un dégât ne se voit
  pas de partout. Regarde le marquage des blocs. »), `detailComptage` propre aux piles si le lot B le fournit, brouillon de calcul.
- Les cinq piles du §6.2, dans l'ordre tiré.

**Suite** (`apresGeste('quai:retours:cloturer')`) : Grégory : « Merci. Prépare le crédit d'Opale Frais : je le valide avant midi. »

**Fiche `credit`** « **Crédit du retour — Opale Frais — bon de collecte BC-27-{n}** » (documents à gauche : le bon de collecte avec les
réserves **de l'élève**, et « Règles de crédit » de la coordination §4, règle 5) :
1. « Palettes annoncées sur le bon » [nombre]
2. « Palettes CHEP reçues (abîmées comprises) — **à créditer au compte d'Opale Frais** » [nombre]
3. « Palettes d'un autre pool, mises en zone hors pool » [nombre]
4. « Palettes CHEP à envoyer en réparation » [nombre]
5. « Les palettes d'un autre pool… » [choix] : ✓ « …sont mises de côté : elles ne sont pas à CHEP et ne se créditent pas. » · « …sont mises dans le
   stock CHEP, puisqu'elles sont arrivées avec les nôtres. » · « …sont créditées puis facturées à leur loueur. »
Bouton : « Envoyer le crédit à Grégory ». Suite : Grégory reprend **les nombres de l'élève**, sans corriger : « Je note : {n2} à créditer,
{n4} en réparation. Bon appétit ! »

### Temps 2 — La ramasse du mercredi (≈ 40 min)

**Message de Yannick Desmet** (14 h 02), pièces jointes = **les avis de palettes vides** reçus cette semaine (§6.3, un par site, avec la date
et l'heure du signalement et les horaires d'enlèvement) : « Salut {prénom}, / prépare la collecte de demain mercredi. La règle : un camion
complet pour un site qui peut le remplir à lui seul ; les autres, en tournée. Si tout ne tient pas, on reporte le site qui a signalé ses
vides le plus tard : il passera vendredi. Nos semis prennent 26 piles au sol, et on empile les vides par 15. Départ et retour ici, à 6 h. /
Yannick »

**Fiche `besoin`** « **Ramasse du mercredi 20/01 — besoin** » :
1. « Capacité d'un camion (palettes vides) » [nombre] → 390.
2. « Frais du Nord (Lesquin), {V} palettes vides » [liste] : *un camion complet rien que pour lui* · *dans la tournée* · *attendre la semaine
   prochaine*.
3. « Les autres sites : total des palettes à collecter » [nombre] → la somme des quatre sites.
4. « Tout tient-il dans un camion ? » [choix oui / non].
Bouton : « Envoyer à Yannick ». Suite : Yannick : « OK pour Frais du Nord : je réserve son camion. » (si l'élève a choisi le camion complet)
ou « Je note : {choix de l'élève} pour Frais du Nord. » (sinon). Puis la tournée s'ouvre (`quand`).

**La tournée de ramasse** (`tournee`, lot A) : Templemars (dépôt) → les quatre sites → Templemars. L'élève ordonne les arrêts sur la carte,
peut en **reporter un** (« Reporter à la tournée de vendredi ») et regarde la jauge « Palettes vides à bord » (guidage : profil en marches) et
les horaires (« trop tôt : le camion attend », « après l'heure : le quai est fermé »). Bouton : « Envoyer la tournée à Yannick ».
**Fin** : Yannick reprend l'ordre **de l'élève** : « Je la passe à Lys-Escaut : {ordre}. {site reporté} vendredi. Merci ! » Bandeau de fin.

**Pour réfléchir** (bilan, non noté) : « Si Primeurs du Delta avait signalé ses vides avant les autres, qu'est-ce qui aurait changé dans ta tournée ? »

### Ergonomie
- Quai iso et tournée : 1366 × 768 et 1280 × 720 sans défilement de page (règles des vues).
- La carte s'imprime en noir et blanc (autoroutes par l'épaisseur) ; l'ordre de la tournée se lit par les numéros, pas par la couleur seule.

## 4 bis. Questions au fil — propositions et choix (Cowork, sur délégation)

| # | Geste | Qui pose | Question proposée | Type | Notée / réflexion | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| 1 | `quai:retours:valider` **de la pile où l'élève a coché « autre pool »** (`quand` lit la palette validée) | Grégory | `selon` : « Tu as mis {k} palette(s) de côté dans la pile {Pn}. Pourquoi ne pas les créditer à Opale Frais ? » — ✓ « Elles appartiennent à un autre loueur : elles ne sont pas sur le compte CHEP d'Opale Frais. » · « Parce qu'elles sont abîmées. » · « Parce qu'Opale Frais les a déjà payées. » | fil | notée | **au bilan** | ancrée sur **sa** pile ; donnerait la ligne 3 et le choix 5 du crédit : au bilan. Si l'élève ne coche jamais « autre pool », rattrapage au plus tard |
| 2 | `fiche:besoin:envoyer` | Yannick | « Transports Lys-Escaut transporte nos palettes vides jusqu'ici. D'après le contrat type, lui fait-on payer la location de ces palettes pendant le trajet ? » — ✓ « Non : les supports de charge ne donnent lieu ni à location ni à consignation au transporteur, sauf accord contraire. » · « Oui, dès qu'elles sont dans son camion. » · « Oui, mais seulement s'il roule à vide. » · « Non, parce que des palettes vides ne valent rien. » | fil | notée | tout de suite | **éco-droit appliqué au cas** (texte du contrat type en document joint, source OTRE 2023, article à relire) ; ne souffle rien de la tournée |
| 3 | `fiche:besoin:capacite` (sortie de la case) | Yannick | « 390 palettes vides à 25 kg, c'est environ 9,75 t. Pourquoi CHEP préfère-t-elle envoyer des camions pleins ? » — ✓ « Pour faire moins de trajets, et moins de km à vide, pour le même nombre de palettes. » · « Parce qu'un camion plein roule plus vite. » · « Parce que la loi interdit les camions à moitié vides. » | fil | notée | **au bilan** | souffle la ligne 2 (camion complet) : au bilan. Chiffre réel cité au retour (5 millions de km à vide évités en 2025) |
| 4 | `quai:retours:valider` d'une pile **abîmée** | Grégory | « Tes palettes abîmées partent en réparation. Pourquoi CHEP les répare-t-elle au lieu d'en acheter des neuves ? » — ✓ « Une palette réparée resservira : c'est moins cher et ça consomme moins de bois. » · « Parce que la loi interdit les palettes neuves. » · « Parce que le client paie la réparation. » | fil | notée | tout de suite | ancrée sur sa pile ; **en réserve** |
| 5 | Envoi de la tournée | Yannick | « Ta tournée laisse {site reporté} à vendredi. Que dirais-tu à son responsable de quai s'il appelle demain ? » | fil | réflexion | au bilan | la relation au client ; réflexion seulement (pas de geste de tournée garanti, voir §7 n° 4) |

**Retenues (Cowork)** : **1, 2, 3** notées (`part: 3`) ; 5 en réflexion **si** la tournée publie un geste d'envoi (sinon au bandeau de fin) ;
4 en réserve.
Retours : n° 1 « Créditées, elles feraient croire à Opale Frais qu'il lui reste moins de palettes CHEP qu'en réalité. » ; n° 2 « C'est le
distributeur qui les avait en location : le camion ne fait que les ramener. » ; n° 3 « CHEP dit avoir évité 5 millions de km à vide en 2025
en regroupant ses transports. »

## 4 ter. Avant de commencer — banque (Cowork)

`ouverture.tirage: { preparation: 2, image: 1, droit: 1 }` **(la rubrique « image » est-elle bien `image` dans le moteur ? Sinon,
`preparation` avec un visuel à gauche.)** Visuels : **dessins du kit iso** produits après le lot B (une palette de chaque pool, une palette
abîmée), jamais une photo d'une autre source. Non notées, sans le dire.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| p1 | preparation | « Un bon de collecte, c'est… » | « le document qui accompagne les palettes vides collectées et en annonce le nombre » | « la facture de la location » · « le bon de commande de palettes neuves » | Lexique + un bon vierge | |
| p2 | preparation | « Une réserve sur le bon de collecte sert à… » | « garder par écrit l'écart entre ce qui est annoncé et ce qui est reçu » | « refuser les palettes vides » · « commander d'autres palettes » | Lexique « réserve » | |
| p3 | preparation | « Une palette CHEP abîmée, au retour… » | « reste à CHEP : elle est créditée et part en réparation » | « est jetée et retirée du crédit » · « est rendue au distributeur » | Règles de crédit | ★ |
| p4 | preparation | « La ramasse, c'est… » | « l'enlèvement des palettes vides chez les distributeurs, pour les ramener au centre de service » | « la livraison de palettes neuves aux producteurs » · « le tri des palettes à Templemars » | Lexique | ★ |
| i1 | image | (dessin : palette rouge marquée LPR) « Cette palette arrive avec un retour CHEP. Que fais-tu ? » | « Je la mets de côté : c'est une palette d'un autre pool » | « Je la crédite : elle est arrivée avec les nôtres » · « Je l'envoie en réparation » | dessin | ★ |
| i2 | image | (dessin : palette bleue CHEP, planche de façade cassée) « Cette palette, c'est… » | « une palette CHEP à envoyer en réparation » | « une palette d'un autre pool » · « une palette prête à repartir chez un client » | dessin | |
| d1 | droit | « Le transporteur qui ramène nos vides doit-il payer leur location pendant le trajet ? » | « Non : le contrat type dit que les supports de charge ne donnent lieu ni à location ni à consignation au transporteur, sauf accord contraire » | « Oui, dès qu'il les charge » · « Oui, s'il en perd une » | Texte du contrat type (source OTRE, article à relire) | |
| d2 | droit | `variante` : « Opale Frais avait {n} palettes CHEP sur son compte et n'en rend que {n − k}. Qui répond des {k} manquantes ? » | « Opale Frais, qui les avait en location, sauf si elle prouve qu'elle n'y est pour rien » | « CHEP, propriétaire » · « Le transporteur de la collecte » | Art. 1732 | ★ |

## 5. Jalons / notation (sur 20) — poids fixés par Cowork (délégation du 17/10/2026)

| # | Groupe | Jalon (`lib` neutre) | Poids | Ce qu'il lit | Piège |
|---|---|---|---|---|---|
| 1 | Contrôler le retour | Le compte de chaque pile (0,4 par pile) | 2 | quai : total compté de chaque pile = `hauteur` | 15 lu sur le bon recopié pour la pile à 14 |
| 2 | Contrôler le retour | Les palettes d'un autre pool repérées (motif « autre pool » et nombre justes sur les piles concernées, aucun sur les autres) | 2 | quai, motifs et nombres | intrus non vu ; un pool coché sur une pile juste |
| 3 | Contrôler le retour | Les palettes abîmées repérées (motif et nombre justes, aucun sur les autres) | 2 | quai | la palette abîmée sur la face arrière, non vue |
| 4 | Contrôler le retour | Décision par pile (accepter / sous réserve) et réserves écrites sur le bon | 2 | quai, `decision` et réserves | pile juste mise « sous réserve » ; réserves non écrites |
| 5 | Créditer le compte | À créditer = palettes CHEP reçues **d'après son contrôle** | 2 | `credit.aCrediter` = Σ (son total − son nombre « autre pool ») | créditer les 75 annoncées ; retirer les abîmées |
| 6 | Créditer le compte | Hors pool et réparation **d'après son contrôle**, et le sort des palettes d'un autre pool | 1 | `credit.horsPool`, `credit.reparation`, `credit.sort` | « mises dans le stock CHEP » |
| 7 | Organiser la ramasse | Capacité du camion : 390 | 1 | `besoin.capacite` | 26 ; 15 ; 375 |
| 8 | Organiser la ramasse | Frais du Nord : un camion complet à lui seul | 1 | `besoin.frais` | « dans la tournée » |
| 9 | Organiser la ramasse | Le site reporté est celui qui a signalé le plus tard (pièce tirée) | 1,5 | `bilan.reportes` = [le site tiré] | le plus petit site ; le plus loin ; aucun reporté |
| 10 | Organiser la ramasse | La tournée tient dans le camion | 1 | `bilan.depassements` vide | tous les sites gardés |
| 11 | Organiser la ramasse | Les horaires d'enlèvement respectés (aucun quai fermé à l'arrivée) | 1,5 | `bilan.creneaux` sans « tard » | l'ordre de la carte au plus court, qui arrive à Roubaix avant 13 h ou à Douai après 10 h |
| — | Questions au fil | n° 1, 2, 3 | 3 | moteur | |

Total : Contrôler 8 · Créditer 3 · Organiser 6 · Questions 3 = **20**. Aucun jalon de forme. Aucun jalon à 0.
- **Une erreur ne se paie qu'une fois** : les jalons 5 et 6 lisent **son** contrôle (une pile mal comptée coûte au jalon 1, pas au 5). Les
  jalons 10 et 11 lisent **sa** tournée, même si le site reporté est faux (jalon 9).
- Fiche `besoin` : les lignes 3 et 4 ne sont pas notées (elles préparent la tournée) **(Cowork)**.
- Inaction : 0 (aucun jalon n'est vrai avant le geste qui le juge ; une tournée non envoyée laisse 9 à 11 « à faire » puis faux au bilan).

**Bonus du confirmé** (+0,5 par cas, plafond +2) : une 6e pile (§6 bis), jugée comme les autres.

## 6. Contenu (données)

Fichiers : `contenus/chep.js` (univers, de 9.1) ; `contenus/chep-ent92-donnees.js` ; `contenus/chep-ent92.js` ; `contenus/chep-carte.js` (généré
au lot A, partagé avec 9.4) ; `contenus/questions/ENT-9.2.js` ; `contenus/corriges/ENT-9.2.js` ; `activites/chep-ramasse-retours.js`.

### 6.1 Le bon de collecte
BC-27-{n} (n tiré), Opale Frais (Dunkerque) → CHEP Templemars, lundi 18/01 : « **75** palettes CHEP 1 200 × 1 000 vides, en 5 piles de 15 ».
Pied de reconstitution.

### 6.2 Les cinq piles (le quai)

**Pièce fixe** : cinq piles annoncées à 15. **Cinq histoires**, une par pile, **ordre des piles tiré** (P1 à P5) :

| Histoire | Ce qui est sur la pile | Valeurs tirées | Attendu |
|---|---|---|---|
| `juste` | 15 CHEP en état | — | accepter |
| `manque` | `hauteur` = 15 − m | m de 1 à 2 | sous réserve : manquant (m) |
| `intrus` | 15, dont i palettes d'un autre pool | i de 1 à 2 ; pool tiré parmi `lpr`, `epal`, `logipal` ; places tirées (jamais en haut ni en bas de la pile) | sous réserve : autre pool (i) |
| `abimees` | 15, dont a palettes CHEP abîmées | a de 1 à 3 ; **au moins une visible seulement de l'arrière** (faces N ou W) | sous réserve : abîmées (a) |
| `double` | 15 − 1, dont 1 d'un autre pool | pool tiré | sous réserve : manquant (1) + autre pool (1) |

**Élève témoin** (tests, à la main) : P1 `juste` 15 ; P2 `manque` hauteur 14 ; P3 `intrus` {6: 'lpr'} ; P4 `abimees` {4: 'N', 11: 'S'} ;
P5 `double` hauteur 14, {9: 'epal'}. Reçues 73 ; autre pool 2 ; **CHEP à créditer 71** ; réparation 2 ; manquantes 2.
**Contrôle d'équité** : total à créditer entre 66 et 72 ; une seule pile juste ; les intrus ne sont jamais la palette du haut (sinon on les
voit sans tourner) ; au moins une palette abîmée visible seulement de l'arrière ; aucune palette à la fois intruse et abîmée (refusé par le
moteur).

### 6.3 Les sites de la ramasse

| Site (fictif) | Ville (réelle) | Vides signalés | Signalé le | Enlèvement des vides (construit) |
|---|---|---|---|---|
| **Frais du Nord** | Lesquin | **V** tiré de 390 à 400, par pas de 5 (le reste, 10 au plus, attend la semaine suivante : Yannick le dit) | lun. 18/01, 7 h 40 | 6 h – 14 h (camion complet, hors tournée) |
| Halles d'Artois | Douai | 140 (135 à 145, pas de 5) | voir la banque | 9 h – 12 h |
| Hainaut Primeurs | Prouvy | 120 (115 à 125) | voir la banque | 8 h – 12 h |
| MarchéLys | Roubaix | 95 (90 à 100) | voir la banque | 6 h – 9 h |
| Primeurs du Delta | Dourges | 70 (65 à 75) | voir la banque | 9 h – 12 h |

> **Recalé le 18/10/2026 (Claude Code, choix de Tristan : « jeu B »)**. Les horaires d'origine (Douai 6 h–10 h, Roubaix 13 h–17 h,
> Dourges 7 h–11 h) ne tenaient pas le contrôle d'équité ci-dessous : l'ordre au plus court respectait tous les horaires dans trois
> tirages sur quatre, et le camion attendait plus de 3 h devant MarchéLys. Avec le jeu B (calcul sur la carte réelle, 55 km/h, temps
> d'enlèvement de la vue) : au moins un ordre tient dans chaque tirage, l'ordre au plus court rate dans deux tirages sur quatre
> (Prouvy ou Dourges reporté), attente la plus longue 1 h 27, retour au plus tard 10 h 27. **« Distri Escaut » (vraie société de
> Caudry) est renommé « Primeurs du Delta »** (nom vérifié libre sur les registres d'entreprises le 18/10/2026).

Bornes vérifiées à la main : total des quatre sites de 405 à 445 (toujours > 390) ; sans le plus petit possible (65), au plus 380 (toujours
≤ 390). Quel que soit le site reporté, la tournée tient donc dans le camion.

**Banque `dernier`** (une pièce au socle, `melange: { moyen: 1 }`, quatre pièces) : laquelle des quatre plates-formes a signalé **le plus tard**
(dates et heures des quatre avis calculées pour que ce soit elle, les trois autres étant plus tôt, du lundi 18/01 au mardi 19/01 à 11 h).
**Contrôle d'équité** (`verifier`, avec `calibrer.mjs` ou le calcul de la vue) : total des quatre sites > 390 ; total sans le site tiré ≤ 390 ;
**pour chaque pièce, au moins un ordre** des trois sites restants respecte tous les horaires (départ 6 h de Templemars, vitesse 55 km/h, temps
d'enlèvement de la vue) ; **l'ordre « au plus court » de la carte ne respecte pas tous les horaires** dans au moins deux pièces sur quatre (sinon
les horaires ne servent à rien) ; Frais du Nord ≥ 390 toujours.
Avis de vides (documents) : « Avis de palettes vides — {site} — {n} palettes CHEP prêtes à l'enlèvement — signalé le {date, heure} — quai des
vides ouvert de {h} à {h} ». Pied de reconstitution.

## 6 bis. Tirage et niveaux
- **Quai** : ordre des cinq histoires, m, i, a, pools et places tirés ; structure fixe (5 piles).
- **Ramasse** : banque `dernier` (4 pièces) ; quantités tirées dans les bornes ; V tiré.
- **Confirmé** : une **6e pile** (histoire `abimees` à 2 dégâts, tous deux visibles seulement de l'arrière), ajoutée **après** les cinq, jugée
  comme les autres (bonus « la 6e pile bien contrôlée »). **Pas de site de plus dans la tournée (Cowork)** : avec les bornes du §6.3, un 5e site
  ne tiendrait pas dans le camion dans tous les tirages. Le socle ne change pas.
- **Accompagné** (Cowork) : aides de comptage plus détaillées (« Tu en es à la palette {n} »), jauge parlante en entraînement aussi. Sinon,
  contenu standard.
- **Consigne neutre** : « les avis de la semaine », « les piles ».

## 7. Demandes au moteur — état des lieux d'abord, en lecture seule

1. **Lot A et lot B** du chantier `MOTEUR-chep-ramasse-et-piles.md` **livrés** (sinon ne pas commencer).
2. Un quai **sans `securite`** en iso : accepté ? (sinon, une inspection minimale, une cale posée en piège « ok », à dire).
3. Une fiche (`credit`) qui lit **le quai** de l'élève pour ses documents (le bon avec ses réserves) : `documents[].html: (db) => …` (D-1 bis).
4. **La tournée publie-t-elle des gestes** (`tournee:<id>:envoyer`) ? La table des gestes de FICHE-SEANCE n'en cite pas. Sinon, la question
   de réflexion n° 5 passe au bandeau de fin, et **le lot A doit ajouter le geste d'envoi** (une ligne au moteur, à faire dans le lot A).
5. Une tournée qui ne s'ouvre qu'après l'envoi d'une fiche (`quand`, comme une fiche ou une animation) : si la tournée ne l'accepte pas,
   `fermetures` avec `ouvertSi(db)`.

## 7 bis. Séance déjà jouée ? Non.

## 8. Tests attendus

Bloc **`chep-92`** (`outils/test/chep-92.mjs`, aides `outils/test/chep/commun.mjs`), lignes dans `BLOCS` et `GROUPES`.
- **À la main** : témoin des piles (73 reçues, 2 autres pools, 71 à créditer, 2 en réparation, 2 manquantes) ; capacité 390 ; pour chaque pièce
  de `dernier`, un ordre juste et un ordre faux écrits à la main.
- Parcours juste de chaque pièce = 20 / 20 ; parcours d'une pièce joué sur une autre ≠ 20 ; inaction = 0.
- **Pièges** : pile à 14 comptée 15 → 1 faux ; intrus non vu → 2 faux ; dégât de l'arrière non vu → 3 faux ; 75 crédités → 5 faux ; « dans la
  tournée » pour Frais du Nord → 8 faux ; aucun site reporté → 9 et 10 faux ; ordre au plus court → 11 faux (sur les pièces où il échoue).
- **Une erreur ne se paie qu'une fois** : intrus non vu, puis crédit cohérent avec son contrôle → 5 vrai.
- Tirage : 200 graines, contrôle d'équité sans secours, répartition des pièces de `dernier` entre 15 et 35 % chacune ; banques figées.
- **Neutralité** : Grégory et Yannick reprennent les nombres et l'ordre de l'élève.
- Ergonomie : 1366 × 768 et 1280 × 720.
- **Sabotages** : 71 écrit en dur → le second témoin tombe ; jalon 5 jugé sur le réel → le cas « erreur payée une fois » tombe ; un `title` sur
  une palette intruse → test du lot B ; horaires qui rendent l'ordre au plus court juste partout → contrôle d'équité.

## 9. Supports
- Trame courte (Cowork, après validation à l'écran) : fiche de comptage de piles pour le brouillon ; le calcul de la capacité ; le schéma
  « annoncé → reçu → crédité → en réparation → hors pool » ; la carte en noir et blanc.
- Corrigé `contenus/corriges/ENT-9.2.js` : ses piles, ses comptes, sa pièce `dernier`, un ordre juste.

## 10. Critères de validation par Tristan
Une palette LPR se voit sans être nommée, une palette abîmée de l'arrière ne se voit qu'en tournant ; on compte une pile sans se tromper
au vidéoprojecteur ; la jauge dit « le camion ne peut pas tout prendre » sans dire de combien ; la carte se lit en noir et blanc ; chaque temps
tient dans une heure.

## 11. Décisions prises par Cowork (à corriger à l'écran si besoin)
1. Une séance en deux temps d'une heure, plutôt que deux séances.
2. Pas d'inspection de sécurité sur ce quai.
3. Retour d'un **petit** site (porteur, 5 piles) : le contrôle d'un semi de 26 piles serait trop long.
4. « Refuser » n'existe pas pour des palettes vides du pool.
5. La règle de report (« le plus tard signalé ») et les horaires d'enlèvement sont construits.
6. Poids du §5 ; questions 1, 2, 3.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
