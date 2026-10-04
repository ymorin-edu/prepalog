# Brief de séance — ENT-5.4 Smoby, ranger les palettes et saisir l'entrée en stock (2de, poste C — cariste, guidage)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-smoby.md puis implémente le brief docs/briefs/ENT-5.4-smoby-rangement.md (il faut que la vue « Plan d'entrepôt » et les lots 1, 2, 3 et 7 de MOTEUR-2de-S1 soient livrés). Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : **en attente** — la vue « Plan d'entrepôt » n'a encore **ni maquette ni brief moteur**. Ce brief fixe la
séance ; les données du plan (§4, étape 1) seront **recalées sur la maquette** quand Tristan l'aura jouée.
**Date du brief** : 04/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-2de-s1-cadrage.md` (section « Séance C2 »).
**Modèle** : Opus.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-5.4 |
| `id` | `smoby-rangement` |
| Titre / desc | « Smoby — ranger et saisir l'entrée » / « Cariste : ranger sur le plan de l'entrepôt les palettes reçues d'Arinthod en respectant les règles (emplacement libre, charge maximale, lourd en bas, zone litiges), saisir l'entrée en stock des quantités réellement reçues, vérifier le stock et prévenir l'exploitation Kuehne+Nagel. » |
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
- **Construit** : le plan de la zone (allées, travées, niveaux, charges maximales), les emplacements déjà occupés, les poids,
  les références, la zone litiges.

## 3. Objectif pédagogique

L'élève sait **choisir un emplacement** en respectant des règles de stockage, **isoler une marchandise en litige**, **saisir
une entrée en stock à la quantité réellement reçue** (pas celle du BL) et **vérifier** l'écran Stock. Suit ENT-5.3 (les
4 palettes reçues, réserves portées : dossier propre) ; précède ENT-5.5 (la commande de Noël peut partir).

## 4. Déroulé

Accueil — **Bruno, chef de quai** : « Yanis, on range les 4 palettes d'Arinthod. Attention : l'**établi Black+Decker** a un
carton écrasé, il va en **zone litiges** en attendant la réponse de l'usine. Ensuite, saisis l'entrée en stock. » —
mercredi 9 décembre 2026, fin d'après-midi.

1. **Ranger sur le plan d'entrepôt** (vue nouvelle) : racks **vus de face**, 2 allées (A, B), 4 travées, **3 niveaux**
   (0 = sol, 1, 2), chaque case avec sa **charge maximale** et son occupation ; une **zone litiges** au sol près du quai.
   L'élève pose chaque palette sur une case (glisser-déposer ou clic-clic, clavier ; mêmes gestes que le Planning).
   Données proposées (**à recaler sur la maquette**) :

   | Palette (ENT-5.3) | Produit | Cartons en stock | Poids (construit) | Attendu |
   |---|---|---|---|---|
   | P1 | Maison Neo Jura Lodge | 8 | **420 kg** (lourde) | niveau 0 |
   | P2 | Cuisine Tefal | 45 | 270 kg | niveau 0, 1 ou 2 si la charge le permet |
   | P3 | Établi Black+Decker | 36 (1 écrasé) | 290 kg | **zone litiges** |
   | P4 | Porteur Little Smoby | 34 | 180 kg | niveau 0, 1 ou 2 |

   Charges maximales proposées : niveau 0 = 1 000 kg, niveau 1 = 500 kg, niveau 2 = 300 kg ; quelques cases déjà occupées ;
   **une case du niveau 1 à 250 kg** (piège de charge pour P2).
2. **Les 4 règles** (encadré, une ligne chacune) : (1) un emplacement **libre** ; (2) poids de la palette **≤ charge
   maximale** de la case ; (3) **lourd en bas** : une palette de plus de **400 kg** va au niveau 0 (seuil construit, à
   confirmer) ; (4) une palette **en litige ne va pas en stock** : zone litiges. Encadré : « Monter au niveau 2 demande le
   chariot rétractable : il faut le **CACES 5**. Yanis l'a. »
3. **Saisie de l'entrée en stock** (écran Réceptions de l'environnement, existant) : la réception d'Arinthod (BL
   ARI-26-1209) est ouverte ; l'élève saisit **les quantités réellement reçues** : P1 = 8, P2 = 45, **P4 = 34 (BL 36)** ;
   **P3 n'est pas saisie en stock disponible** (statut « en litige », lot 0 du brief moteur : à vérifier).
4. **Vérifier l'écran Stock** : une question, « Combien de porteurs Little Smoby en stock maintenant ? » (stock de départ
   construit + 34, calculé).
5. **Message à l'exploitation Kuehne+Nagel**, par phrases à choisir : salutation · « La marchandise d'Arinthod est en
   stock. » · « La commande de Noël pourra partir **jeudi 10 décembre**. » (pièges : « vendredi 11 » ; « Tout est parti. »)
   · fin → passage de relais vers ENT-5.5.

Mots cliquables : emplacement, niveau, charge maximale, litige, chariot rétractable, entrée en stock.

## 5. Jalons / notation (9, validés)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1-4 | Chaque palette au bon endroit (règles 1 à 4) | le plan | palette non posée = faux |
| 5 | P1 et P2 saisies justes | réception | — |
| 6 | P4 saisie avec 2 cartons de moins (34) | réception | 36 = faux |
| 7 | P3 non saisie en stock disponible | réception / stock | **vrai seulement si l'entrée a été saisie** (sinon vrai par inaction) |
| 8 | Lecture juste de l'écran Stock | la réponse | — |
| 9 | Message juste | `phrasesJustes` | non envoyé = faux |

## 6. Contenu

`contenus/smoby-ent54.js` (plan, palettes, stock de départ, réception, messages, étapes). Références et désignations reprises
d'ENT-5.3 (`contenus/smoby.js`).

## 7. Demandes au moteur

- **Vue « Plan d'entrepôt »** (n° 7 de la liste des vues, avancée pour S1) : **maquette à faire par Cowork et à jouer par
  Tristan**, puis brief `MOTEUR-vue-plan-entrepot.md`. Règles déclarées par le contenu (libre, charge, lourd en bas, zone
  imposée), mêmes gestes que le Planning.
- `MOTEUR-2de-S1.md` : lot 0 (statut « en litige » d'une ligne de réception : existe-t-il ? `bloquer` du quai, `annulee` des
  commandes ?), lots 1, 2, 3, 7.

## 8. Tests attendus

Bloc `smoby` : parcours juste 9/9 ; P1 au niveau 2 → jalon faux ; P2 sur la case à 250 kg → faux ; P3 en rack → faux ;
P4 saisie 36 → jalon 6 faux ; rien saisi → jalon 7 faux ; inaction 0/9.

## 9. Supports

Trame courte (règles de rangement, plan à colorier sur papier) : Cowork, après validation. Corrigé
`contenus/corriges/ENT-5.4.js`, calculé.

## 10. Critères de validation par Tristan

Le plan se lit comme un vrai rack vu de face ; les règles se vérifient d'un coup d'œil ; la saisie fait le lien avec les
réserves d'ENT-5.3.

## 11. Questions ouvertes (valeur par défaut)

- [ ] Seuil « lourd » (400 kg) et charges maximales : à recaler sur la maquette.
- [ ] Le plan : vue de face (choix de Cowork, validé dans le cadrage : « racks vus de face »).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
