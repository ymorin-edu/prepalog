# Brief de séance — ENT-5.5 Smoby, ranger les palettes et saisir l'entrée en stock (2de, poste C — cariste, guidage)

> **⚠ Mis à jour par Cowork le 04/10 (après-midi)** : décisions de Tristan sur le Plan d'entrepôt (logique travée → emplacement,
> 3 palettes par niveau, plus de règle « lourd en bas », vocabulaire « emplacement »). **Renumérotation** : une séance « visite
> de la plateforme » s'insère avant la réception ; **cette séance est désormais ENT-5.5** (voir `COORDINATION-smoby.md`).

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-smoby.md puis implémente le brief docs/briefs/ENT-5.5-smoby-rangement.md (il faut que la vue « Plan d'entrepôt » et les lots 1, 2, 3 et 7 de MOTEUR-2de-S1 soient livrés). Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : **en attente** — la vue « Plan d'entrepôt » a une page d'essai (`Claude outputs\essai-plan-zone.html`, piste A)
mais **pas encore de maquette v2 ni de brief moteur**. Ce brief fixe la séance ; les données du plan (§4, étape 1) seront
**recalées sur la maquette v2** quand Tristan l'aura jouée.
**Date du brief** : 04/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-2de-s1-cadrage.md` (section « Séance C2 »).
**Modèle** : Opus.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-5.5 |
| `id` | `smoby-rangement` |
| Titre / desc | « Smoby — ranger et saisir l'entrée » / « Cariste : ranger sur le plan de l'entrepôt les palettes reçues d'Arinthod (choisir la travée, puis l'emplacement) en respectant les règles (emplacement libre et en service, charge maximale du niveau, zone litiges), saisir l'entrée en stock des quantités réellement reçues, vérifier le stock et prévenir l'exploitation Kuehne+Nagel. » |
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
4 palettes reçues, réserves portées : dossier propre) ; précède ENT-5.6 (la commande de Noël peut partir).

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

   Palettes (reprises d'ENT-5.4, poids **à recaler sur la maquette v2**) :

   | Palette | Produit | Cartons en stock | Poids (construit) | Attendu |
   |---|---|---|---|---|
   | P1 | Maison Neo Jura Lodge | 8 | 420 kg | un emplacement libre où **la charge du niveau** le permet |
   | P2 | Cuisine Tefal | 45 | 270 kg | idem |
   | P3 | Établi Black+Decker | 36 (1 écrasé) | 290 kg | **zone litiges** |
   | P4 | Porteur Little Smoby | 34 | 180 kg | idem P1 |

   **Charge maximale par niveau** (pour les 3 palettes du niveau ensemble), affichée sur une plaque de la lisse ; des niveaux
   déjà presque pleins font le piège (« la somme dépasse »). Valeurs : à recaler sur la maquette v2.
2. **Les règles** (encadré, une ligne chacune) : (1) un emplacement **libre et en service** ; (2) la **charge totale du
   niveau** ne dépasse pas sa charge maximale ; (3) une palette **en litige ne va pas en stock** : zone litiges.
   **Décision de Tristan (04/10) : pas de règle « lourd en bas » dans un rack** — chaque palette repose sur une lisse ;
   une palette n'est jamais refusée ni signalée parce qu'une plus légère est en dessous, **aucun conseil non plus**.
   « Lourd en bas » ne vaut que quand une charge en écrase une autre (gerbage, préparation de commandes) : autre séance.
   Ancienne formulation, remplacée : « Mettre en bas les produits lourds (et les
   produits en picking) est un **conseil de bon sens**, pas une erreur. Encadré : « Monter aux niveaux 2 et 3 demande le
   chariot rétractable : il faut le **CACES 5**. Yanis l'a. »
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
| 1-4 | Chaque palette au bon endroit (règles 1 à 3) | le plan | palette non posée = faux |
| 5 | P1 et P2 saisies justes | réception | — |
| 6 | P4 saisie avec 2 cartons de moins (34) | réception | 36 = faux |
| 7 | P3 non saisie en stock disponible | réception / stock | **vrai seulement si l'entrée a été saisie** (sinon vrai par inaction) |
| 8 | Lecture juste de l'écran Stock | la réponse | — |
| 9 | Message juste | `phrasesJustes` | non envoyé = faux |

## 6. Contenu

`contenus/smoby-ent54.js` (plan, palettes, stock de départ, réception, messages, étapes). Références et désignations reprises
d'ENT-5.4 (`contenus/smoby.js`).

## 7. Demandes au moteur

- **Vue « Plan d'entrepôt »** (n° 7 de la liste des vues, avancée pour S1) : **maquette v2 à faire par Cowork et à jouer
  par Tristan**, puis brief `MOTEUR-vue-plan-entrepot.md`. Principe retenu le 04/10 : **le moteur fournit des briques**
  (types de zones, racks paramétrables — allées, travées, niveaux, emplacements par niveau, charge par niveau —, règles
  types, vues activables) et **chaque séance déclare son plan**. Règles de cette séance : libre / hors service, charge
  totale du niveau, zone imposée. Mêmes gestes que le Planning. Les modes « visite » (vue du ciel, repères photo, photo
  légendée, photo à cliquer) de la séance de visite vont dans le même brief moteur.
- `MOTEUR-2de-S1.md` : lot 0 (statut « en litige » d'une ligne de réception : existe-t-il ? `bloquer` du quai, `annulee` des
  commandes ?), lots 1, 2, 3, 7.

## 8. Tests attendus

Bloc `smoby` : parcours juste 9/9 ; une palette posée sur un niveau dont la **charge totale dépasserait** → jalon faux ;
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
- [ ] Charges maximales par niveau, poids des palettes, stock de départ : à recaler sur la maquette v2.
- [x] Format d'adresse : **`A1-T03-N2-E1`** (décision de Tristan, 04/10), côtés d'allée numérotés selon le plan.
- [x] Emplacement occupé : refusé. Imprévu : aucun. Conseil « lourd en bas » : aucun dans un rack (Tristan, 04/10).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
