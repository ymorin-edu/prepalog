# Brief de séance — ENT-5.5 Smoby, ranger les palettes et saisir l'entrée en stock (2de, poste C — cariste, guidage)

> **⚠ Recalé par Cowork le 04/10 (soir) sur la maquette v2 validée** (`docs/briefs/plan-entrepot/`) : rangement à
> **critères** (type de produit, parcours, rotation, fragile, poids, état, litige), implantation, palettes et bonnes réponses
> ci-dessous. Vue décrite dans `MOTEUR-vue-plan-entrepot.md`.

> **⚠ Mis à jour par Cowork le 04/10 (après-midi)** : décisions de Tristan sur le Plan d'entrepôt (logique travée → emplacement,
> 3 palettes par niveau, plus de règle « lourd en bas », vocabulaire « emplacement »). **Renumérotation** : une séance « visite
> de la plateforme » s'insère avant la réception ; **cette séance est désormais ENT-5.5** (voir `COORDINATION-smoby.md`).

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-smoby.md puis implémente le brief docs/briefs/ENT-5.5-smoby-rangement.md (il faut que la vue « Plan d'entrepôt » et les lots 1, 2, 3 et 7 de MOTEUR-2de-S1 soient livrés). Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : **livré** (04/10/2026, `pret: true, ouverture: 'prof'` : fermée aux élèves, à essayer à l'écran). Avant : en attente du chantier `MOTEUR-vue-plan-entrepot.md` (brief écrit le 04/10, maquette v2 validée par
Tristan) et des lots 1, 2, 3, 7 de `MOTEUR-2de-S1.md`. Les données du plan (§4) sont **recalées sur la maquette v2**.
**Date du brief** : 04/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-2de-s1-cadrage.md` (section « Séance C2 »).
**Modèle** : Opus.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-5.5 |
| `id` | `smoby-rangement` |
| Titre / desc | « Smoby — ranger et saisir l'entrée » / « Cariste : ranger sur le plan de l'entrepôt les palettes reçues d'Arinthod (choisir la travée, puis l'emplacement) en respectant les règles de l'entrepôt (type de produit, parcours, rotation, produit fragile, charge maximale du niveau, emplacement libre et en service, zone litiges), saisir l'entrée en stock des quantités réellement reçues, vérifier le stock et prévenir l'exploitation Kuehne+Nagel. » |
| Rubrique | logisim, entreprise n° 5 Smoby |
| Niveau(x) | 2de |
| Compétence(s) | **C1.5** (mettre en stock), **C1.6** (suivi des stocks : flux d'information des entrées, C1.6.1) ; domaine D4 |
| Temps pédagogique | guidage ; `parcours: 'coeur'` |
| Notation | jalons + note sur 20 |
| Barème | 9 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** : plateforme de **stockage logistique de Smoby à Moirans-en-Montagne** (hebdo39.net) ; CACES R489 **cat. 5 =
  chariot à mât rétractable pour le stockage en hauteur** (gefor.com).
- **Construit** : le plan de la zone (allées, travées, niveaux, emplacements, charges maximales), les emplacements déjà
  occupés, les poids, les références, la zone litiges.

## 3. Objectif pédagogique

L'élève sait **choisir un emplacement** en respectant des règles de stockage, **isoler une marchandise en litige**, **saisir
une entrée en stock à la quantité réellement reçue** (pas celle du BL) et **vérifier** l'écran Stock. Suit ENT-5.4 (les
4 palettes reçues, réserves portées : dossier propre) ; précède ENT-5.6 (préparation de la palette mixte d'E1, nouvelle séance du 04/10 au soir).

## 4. Déroulé

Accueil — **Bruno, chef de quai** : « Yanis, on range les 4 palettes d'Arinthod. Attention : l'**établi Black+Decker** a un
carton écrasé, il va en **zone litiges** en attendant la réponse de l'usine. Ensuite, saisis l'entrée en stock. » —
mercredi 9 décembre 2026, fin d'après-midi.

1. **Ranger sur le plan d'entrepôt** (vue nouvelle) — **logique décidée par Tristan le 04/10 : « je choisis la zone, puis je
   choisis l'emplacement »** :
   - **le plan vu de dessus** montre le palettier **découpé entre chaque échelle** : chaque travée est une case cliquable,
     avec un rappel visible qu'elle cache **3 niveaux** (l'élève doit comprendre qu'une travée vue de dessus cache plusieurs
     niveaux) ;
   - un clic sur une travée la fait **basculer en vue de face** : **3 niveaux × 3 emplacements** (3 palettes par niveau,
     décision de Tristan) ; l'élève clique l'emplacement (ou glisse la palette) ;
   - **l'adresse se construit sous ses yeux**, en 4 parties **lettrées** (décision de Tristan, 04/10) : **`A1-T03-N2-E1`**
     = allée A côté 1, travée 03, niveau 2, emplacement 1 ; **niveau 1 = sol**. Les allées sont **à double sens** : A1 et
     A2 sont les deux racks de part et d'autre de l'allée A ; la numérotation des côtés **se suit selon le plan** (A1, A2,
     B1, B2…) et elle est **déclarée par le contenu** ;
   - un emplacement **déjà occupé est refusé tout de suite** (« Emplacement déjà occupé », la palette reste en main) ;
   - **pas d'imprévu** en cours de séance (décision de Tristan, 04/10).
   - Pour la 2de : **2 allées (A, B)** et la **zone litiges** au sol près du quai suffisent (proposition de Cowork) ; les
     zones produits dangereux, forte valeur et rotation sont pour un cas de 1re.

   **Plan de la séance = plan de la maquette v2** (`docs/briefs/plan-entrepot/donnees-maquette.json`, stock de départ
   figé, 99 emplacements occupés) : côtés **A1 | allée A | A2 · B1 | allée B | B2**, 4 travées × 3 niveaux × 3 emplacements,
   T01 près de l'allée principale. **Implantation** : **A1 Maisons et ateliers · A2 Plein air · B1 Véhicules · B2 Cuisines +
   Maisons et ateliers (suite, ancien rack)**. Charges N2/N3 : A1 1 200 · A2 800 · B1 1 000 · B2 800 kg ; N1 (sol) 3 000.
   Hors service : A1-T02-N2-E2, A2-T02-N3-E2, B1-T04-N2-E3, B2-T03-N2-E1. Parcours de prélèvement à sens unique : on monte
   l'allée A, on redescend l'allée B. Zone litiges L1, L2 (à droite du plan).

   Palettes (reprises d'ENT-5.4 ; fiche produit sur la carte, une ligne par information ; classes, contraintes et poids
   **construits**) :

   | Palette | Produit | Cartons | Poids | Gamme | Rotation | Contrainte | Réception | Bonne(s) réponse(s) |
   |---|---|---|---|---|---|---|---|---|
   | P1 | Maison Neo Jura Lodge | 8 | 420 kg | Maisons et ateliers | A | lourd | conforme | **A1-T01-N1-E3** (seule) |
   | P2 | Cuisine Tefal | 45 | 270 kg | Cuisines | B | fragile | conforme | **B2-T02-N1-E2**, **B2-T02-N1-E3** |
   | P3 | Établi Black+Decker | 36 (1 écrasé) | 290 kg | Maisons et ateliers | B | lourd | 1 carton écrasé | **L1** ou **L2** |
   | P4 | Porteur Little Smoby | 34 | 180 kg | Véhicules | C | — | 2 cartons manquants | **B1-T03-N3-E1**, **B1-T04-N1-E2**, **B1-T04-N3-E2** |

   Pièges (un seul critère faux chacun) : P1 en A1-T01-N2-E3 (poids), A1-T02-N1-E2 et A1-T03-N1-E1 (rotation), B2-T01-N1-E3
   (**parcours** : bonne gamme, fin de parcours) ; P2 en B2-T02-N2-E2 (poids), B2-T02-N3-E2 (**fragile en N3**), B2-T03-N1-E3
   et B2-T01-N1-E3 (rotation) ; P4 en B1-T01-N2-E3 (rotation), B1-T04-N2-E3 (hors service). **Bonnes réponses calculées par le
   moteur** sur le stock de départ : les recontrôler (bloc de tests).
2. **Les règles** (bouton « Les règles ▾ », une ligne chacune) : (1) **type de produit** : le côté de sa gamme (plan
   d'implantation) ; (2) **parcours** : un produit **lourd** en début de parcours (allée A), un produit **fragile** en fin
   de parcours (allée B) — à la préparation, le lourd fait la base de la palette, le fragile va en haut ; (3) **produit
   fragile** : jamais au niveau N3 ; (4) **rotation** : A rapide → T01 (près des quais), N1 ou N2 · B moyenne → T02 · C
   lente → T03-T04, tous niveaux ; (5) **poids** : la charge totale du niveau ne dépasse pas la plaque jaune ; (6) un
   emplacement **libre et en service** ; une palette **en litige** va en zone litiges.
   **Décision de Tristan (04/10) : pas de règle « lourd en bas » dans un rack** — chaque palette repose sur une lisse ;
   une palette n'est jamais refusée ni signalée parce qu'une plus légère est en dessous, **aucun conseil non plus**.
   « Lourd en bas » ne vaut que quand une charge en écrase une autre (gerbage, préparation de commandes) : autre séance.
   Encadré : « Monter aux niveaux 2 et 3 demande le chariot rétractable : il faut le **CACES 5**. Yanis l'a. »
   **Guidage** (temps de cette séance) : consigne précise de la palette en main (colonne à gauche du plan), bandes de
   rotation et parcours dessinés sur le plan, erreurs expliquées critère par critère, aide « charge déjà posée ».
3. **Saisie de l'entrée en stock** (écran Réceptions de l'environnement, existant) : la réception d'Arinthod (BL
   ARI-26-1209) est ouverte ; l'élève saisit **les quantités réellement reçues** : P1 = 8, P2 = 45, **P4 = 34 (BL 36)** ;
   **P3 n'est pas saisie en stock disponible** (statut « en litige », lot 0 du brief moteur : à vérifier).
4. **Vérifier l'écran Stock** : une question, « Combien de porteurs Little Smoby en stock maintenant ? » (stock de départ
   construit + 34, calculé).
5. **Message à l'exploitation Kuehne+Nagel**, par phrases à choisir : salutation · « La marchandise d'Arinthod est en
   stock. » · « La commande de Noël pourra partir **jeudi 10 décembre**. » (pièges : « vendredi 11 » ; « Tout est parti. »)
   · fin → passage de relais vers ENT-5.6.

Mots cliquables : emplacement, travée, niveau, charge maximale, litige, chariot rétractable, entrée en stock.

## 5. Jalons / notation (9, validés)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1-4 | Chaque palette au bon endroit (critères 1 à 6, jalon `palette(id)` de la vue) | le plan | palette non posée = faux |
| 5 | P1 et P2 saisies justes | réception | — |
| 6 | P4 saisie avec 2 cartons de moins (34) | réception | 36 = faux |
| 7 | P3 non saisie en stock disponible | réception / stock | **vrai seulement si l'entrée a été saisie** (sinon vrai par inaction) |
| 8 | Lecture juste de l'écran Stock | la réponse | — |
| 9 | Message juste | `phrasesJustes` | non envoyé = faux |

## 6. Contenu

`contenus/smoby-ent54.js` (plan, palettes, stock de départ, réception, messages, étapes). Références et désignations reprises
d'ENT-5.4 (`contenus/smoby.js`).

## 7. Demandes au moteur

- **Vue « Plan d'entrepôt »**, mode **rangement** : brief **`MOTEUR-vue-plan-entrepot.md`** (04/10), maquette v2 validée et
  données figées dans `docs/briefs/plan-entrepot/`. Critères déclarés par cette séance : état, litige, gamme, parcours,
  rotation, fragile pas en N3, charge.
- `MOTEUR-2de-S1.md` : lot 0 (statut « en litige » d'une ligne de réception : existe-t-il ? `bloquer` du quai, `annulee` des
  commandes ?), lots 1, 2, 3, 7.

## 8. Tests attendus

Bloc `smoby` : parcours juste 9/9 (bonnes réponses du §4) ; chaque piège du §4 → jalon de la palette faux ; une palette posée sur un niveau dont la **charge totale dépasserait** → jalon faux ;
une palette posée **au-dessus d'une plus légère, charge respectée → jalon juste** (garde de la décision du 04/10) ; P3 en
rack → faux ; emplacement hors service → faux ; P4 saisie 36 → jalon 6 faux ; rien saisi → jalon 7 faux ; inaction 0/9.

## 9. Supports

Trame courte (règles de rangement, plan à colorier sur papier) : Cowork, après validation. Corrigé
`contenus/corriges/ENT-5.5.js`, calculé.

## 10. Critères de validation par Tristan

Le plan se lit comme un vrai rack vu de face ; les règles se vérifient d'un coup d'œil ; la saisie fait le lien avec les
réserves d'ENT-5.4.

## 11. Questions ouvertes (valeur par défaut)

- [x] ~~Seuil « lourd » (400 kg)~~ : **supprimé** (décision de Tristan du 04/10 : seule la charge totale du niveau compte).
- [x] Le plan : **vue de dessus découpée par travée → vue de face de la travée (3 niveaux × 3 emplacements)** (Tristan, 04/10).
- [x] Charges maximales par niveau, poids des palettes, stock de départ : **recalés sur la maquette v2** (04/10, §4).
- [x] Critères du rangement : **type de produit, parcours (lourd au début, fragile à la fin), rotation, fragile pas en N3, poids,
  état, litige** (Tristan, 04/10 : « l'élève prend une réelle décision », solutions parfois uniques, parfois multiples).
- [x] Format d'adresse : **`A1-T03-N2-E1`** (décision de Tristan, 04/10), côtés d'allée numérotés selon le plan.
- [x] Emplacement occupé : refusé. Imprévu : aucun. Conseil « lourd en bas » : aucun dans un rack (Tristan, 04/10).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `activites/smoby-rangement.js` (+ une ligne dans `activites/index.js`) ;
  `contenus/smoby-ent55.js` (palettes, réception, messages, 9 jalons, lexique) ; `contenus/smoby-entrepot.js` (nouveau :
  la plateforme Smoby — plan, produits, stock figé, critères — partagée avec ENT-5.6 et la page d'essai, qui la reprend) ;
  `contenus/corriges/ENT-5.5.js` (calculé) ; `core/types/entreprise.js` (décision « En litige », option
  `receptionLitige`) ; `outils/test/smoby.mjs` (8 cas ajoutés) ; `outils/test/socle.mjs` (liste Simulog **allongée**
  d'ENT-5.5) ; `activites/FICHE-SEANCE.md`.
- **Écarts par rapport au brief** : la vue « Plan d'entrepôt » n'a d'abord été construite que pour le rangement
  (lots 1 et 2 du chantier moteur, même jour). **Lecture de l'écran Stock** : par phrases à choisir dans une réponse à
  Bruno (la fiche à remplir n'a pas encore de case « nombre ») — 394 juste, pièges 396 (quantité du BL) et 360 (entrée
  pas validée). Fichier de données `smoby-ent55.js` (le §6 disait `smoby-ent54.js`, coquille).
- **Décisions prises en route** : P3 = **« En litige (zone litiges) »**, nouvelle décision de l'écran Réceptions
  (Tristan, 04/10), activée par la séance seule. Jalons 5 et 6 : la quantité réellement reçue, ligne **acceptée avec ou
  sans réserve** (le brief juge la quantité ; la décision a été jugée en ENT-5.4). Jalon 9 : toutes les lignes justes.
  Références des 8 produits au format d'ENT-5.4 (`SMB-NJL`, `SMB-CTF`, `SMB-EBD`, `SMB-PLS`, et `SMB-TCO`, `SMB-TBF`,
  `SMB-TXL`, `SMB-BAS` construites). Stock de départ de l'écran Stock **calculé** : palettes du plan × cartons d'une
  palette (porteurs : 10 × 36 = 360). **Construits** : numéro de lot `ARI-26-49` (semaine 49), adresse
  `exploitation@kn-besancon.example`, le relais « à 17 h 30 on prépare la palette mixte ». Le BL arrive par un message
  de Bruno (« signé avec tes réserves »). « Demain » se déduit de la date donnée par Bruno (mercredi 9 décembre).
- **Tests** : bloc `smoby` 124 cas (dont 8 pour ENT-5.5 : déclaration, attendus calculés = brief, ouverture et
  inaction, trois décisions sans l'option, parcours juste à l'écran 9 / 9, 11 pièges qui font tomber chacun leur jalon,
  P3 « en litige » sans validation = aucun jalon). Suite entière : voir le commit.
- **Commits** : voir `git log` (« ENT-5.5 Smoby : … »).
- **Reste ouvert** : trame élève courte (Cowork, après validation à l'écran) ; la fiche à remplir pourra porter la
  question du stock en case « nombre » quand le lot 4 de `MOTEUR-documents-formulaire` sera fait.
