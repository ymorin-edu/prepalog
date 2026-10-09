# Brief de séance — ENT-1.3 Spartoo traçabilité : remonter le lot et isoler les boîtes

> Écrit par Cowork (conception), lu et complété par Claude Code (construction).
> **Ne rien inventer** : ce qui n'est pas décidé va dans « Questions ouvertes ».

**Statut** : à implémenter — **après** ENT-1.2 (brief jumeau `docs/briefs/ENT-1.2-spartoo-poste-rfid.md`)
**Date du brief** : 09/10/2026
**Conversation d'origine** : Cowork, « ENT-1.2 et ENT-1.3, refonte sur le modèle du brief ENT-1.1 » (09/10/2026)
**Modèle** : le brief `ENT-1.1-spartoo-quai.md`.

**Décisions de Tristan (09/10/2026)** :
1. Geste ajouté : **isoler les boîtes** — aux emplacements, des casiers du lot en cause côtoient des casiers d'un autre
   lot ; l'élève lit l'étiquette et classe chaque casier « à isoler / reste vendable », puis bloque. Avec la **fiche
   existante** (`core/types/fiche.js`), sans vue nouvelle.
2. **Fil conducteur** : l'aval du lot, ce sont **les commandes que l'élève a préparées en 1.2** (CMD-048307, CMD-048312),
   plus des commandes de collègue semées (sauf filet, §6.5).

> ⚠ **ENT-1.3 est OUVERTE aux élèves** (`pret: true`) ; site en **mode réel**. Valider en local avant push ; les élèves
> qui ont fini l'ancienne 1.3 gardent leur note (§7 bis).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-1.3 (inchangé) |
| `id` | `spartoo-tracabilite` (**jamais modifié**) |
| Titre / desc | « Spartoo — traçabilité » ; desc : « Remonter un lot défectueux dans les deux sens, isoler et bloquer le stock restant, et rendre compte. » |
| Rubrique | simulog |
| Entreprise | Spartoo (réelle) — Toolog, Saint-Quentin-Fallavier |
| Niveau(x) | inchangé |
| Compétence(s) | C3.2 (inchangé) |
| Temps pédagogique | guidage |
| Notation | avancement, **une note par case, pondérée par blocs**, questions au fil |
| Barème | §5 (total 20) |
| `pret` à la livraison | reste `true` ; ne pousser qu'après validation de Tristan en local |

## 2. L'entreprise et le droit : ce qui est vérifié et ce qui est construit

- **Vérifié (web, 09/10/2026)** :
  - Toolog : une puce RFID sur chaque produit, qui le suit tout au long de son parcours ; chaque produit a un emplacement
    enregistré dans le système — [FashionNetwork](https://fr.fashionnetwork.com/news/Spartoo-immersion-dans-son-entrepot-de-saint-quentin-fallavier-en-plein-rush-des-soldes,1598503.html).
  - **Retrait / rappel** : le *retrait* consiste à retirer le produit de la vente (en magasin comme en ligne) ; le
    *rappel* consiste à demander aux consommateurs qui l'ont acheté de le rapporter. Les avis de rappel se publient
    sur **RappelConso** (rappel.conso.gouv.fr) ; **depuis le 11 mars 2026**, la fiche doit indiquer **la quantité de
    produits vendus concernés** et son unité ; arrêté du 20 janvier 2021, articles L423-3 et R452-5 du Code de la
    consommation — [economie.gouv.fr, Bercy infos Entreprises](https://www.economie.gouv.fr/node/243751).
  - Règlement (UE) 2023/988 sur la sécurité générale des produits, applicable depuis le 13/12/2024 (vendeurs en ligne
    compris) — [KPMG Avocats](https://kpmg.com/av/fr/avocats/eclairages/2025/01/entree-en-vigueur-du-nouveau-reglement-relatif-a-la-securite-generale-des-produits.html).
    Culture pour l'enseignant, **pas** dans la séance (trop loin des élèves).
- **Construit** : le défaut de collage (inchangé), les casiers et leurs étiquettes, le lot d'origine de l'ancien stock
  (`LOT-PM-2588`, à aligner sur le choix de 1.2 §6.3), les commandes de collègue, la fiche de rapport.
- **À vérifier avant d'écrire** : rien côté entreprise ; le texte retrait / rappel est repris de la page de Bercy citée
  (pas d'article de code à recopier).

## 3. Objectif pédagogique

Remonter un lot dans les deux sens (amont : réception ; aval : **ses** commandes préparées en 1.2), puis **isoler
physiquement** ce qui reste du lot **sans toucher à la même référence venue d'un autre lot**, le bloquer dans le
logiciel et rendre compte avec les chiffres qu'un rappel exige (quantité vendue concernée). Distinguer **retrait**
(ce qui est encore chez nous) et **rappel** (ce qui est chez les clients), appliqué à son cas.

Avant (constat) : `.getlot` puis un formulaire de blocage et un mail ; le piège « lot, pas référence » ne se jouait que
dans un calcul.

## 4. Déroulé

| Étape | Écran | Ce que fait l'élève |
|---|---|---|
| 1 | Messagerie | Lit l'alerte de Puma (vous) et le message de M. Morin (**tu**, réécrit §6.3) |
| 2 | Console | `.getlot LOT-PM-2609` : entrées (sa réception REC-04127, date), sorties (**ses** BP-048307, BP-048312, et celles de collègues §6.2), reste |
| 3 | **Fiche « Isoler le lot »** | Aux trois emplacements, **8 casiers** étiquetés (référence, pointure, lot, date d'entrée) : pour chacun, « À isoler en zone qualité » oui / non. Envoi à Nadia (cheffe d'équipe) |
| 4 | Blocage qualité | Bloque, référence par référence, **le reste du lot** (écran actuel, inchangé) |
| 5 | **Fiche « Rapport de traçabilité »** | Pour M. Morin, qui le transmet à Puma : date d'entrée, fournisseur, commandes touchées (cases à cocher parmi 6), **quantité vendue concernée**, nombre de clients, **quantité retirée** du stock. Envoi à M. Morin |

- **Le compte rendu par mail disparaît** : la fiche le remplace (répondre en montrant, règle du 08/10). Le mail de
  M. Morin porte `ouvreFiche: 'rapport'`.
- Fiche « Rapport » fermée tant que « Isoler le lot » n'est pas envoyée (`fermetures`, même faux).
- Écrans : Accueil · Messagerie · *Isoler le lot* · Blocage qualité · *Rapport de traçabilité* · Commandes · Clients ·
  Console. **Durée visée** : ≈ 1 h.

## 4 bis. Questions au fil (part : 3 points sur 20)

Document joint à la séance : **« Retrait ou rappel ? »** (deux définitions de la page de Bercy citée au §2, mot pour mot,
avec la source et la date). Posées par **Nadia** (collègue, tu) ou **M. Morin**.

| id | Geste | Qui | Énoncé | Choix (juste en gras) | Retour |
|---|---|---|---|---|---|
| `autreLot` | `fiche:isoler:casiers:rg39-2588` (il classe le casier de l'ancien lot) — **`apres: 'bilan'`** (sinon le retour corrigerait la fiche avant l'envoi) | Nadia | « Tu viens de classer le casier **PM-SUE-RG-39 · LOT-PM-2588**. Relis l'alerte de Puma. Les paires de ce casier… » | **restent vendables : leur lot n'est pas en cause** · sont isolées par précaution, toute la référence · repartent chez Puma | « Si on isole toute la référence, on arrête de vendre des paires saines : le numéro de lot sert justement à ne bloquer que ce qui est en cause. » |
| `retrait` | `fiche:isoler:envoyer` | M. Morin | « Les paires de **ton** lot encore dans nos casiers : d'après le document « Retrait ou rappel ? », on parle de… » | **retrait** · rappel · ni l'un ni l'autre, on attend Puma | « Retirer de la vente, c'est ce que tu fais avec le blocage : plus rien ne part. » |
| `rappel` | `fiche:rapport:commandes` (il coche les commandes) — **`apres: 'bilan'`** | M. Morin | « Et les paires de ton lot déjà parties chez Clara Bernard et Noah Fournier ? » *(clients lus dans les sorties du lot de l'élève)* | **rappel : on leur demande de les rapporter** · retrait : on les retire du site · rien, elles sont vendues | « C'est pour eux que Puma doit déclarer sur RappelConso la quantité vendue concernée : le chiffre de ton rapport. » |

## 5. Jalons / notation (une note par case ; total 20)

| Bloc | Poids | Cases | Ce qu'elles lisent | Piège à éviter |
|---|---|---|---|---|
| A. Isoler le lot | 5 | **casier** (8, §6.4) : oui pour le lot en cause, non pour les autres | `ficheEnvoyee(db, 'isoler')` | attente avant l'envoi ; « non » partout ne doit pas être à moitié juste par défaut : les 3 casiers du lot pèsent autant que les 5 leurres (poids des cases à régler pour que « non » partout rapporte moins de la moitié du bloc) |
| B. Blocage | 4 | **référence** (3) : reste du lot = 0 | `bilanDuLot` actuel, par référence | attente tant qu'aucun blocage ; un blocage sur `LOT-PM-2588` est refusé par l'écran (il dit déjà « vérifiez avec .getlot ») |
| C. Rapport | 8 | date d'entrée ; fournisseur ; chaque commande du lot **cochée** ; **aucune** commande hors lot cochée (une case) ; quantité vendue concernée ; nombre de clients ; quantité retirée | `ficheEnvoyee(db, 'rapport')`, attendus **calculés** depuis les mouvements du lot | une fiche vide ne gagne rien : la case « aucune en trop » n'est juste que si au moins une commande est cochée |
| Questions | 3 | `autreLot`, `retrait`, `rappel` | moteur des questions | — |

Bandeau de fin par blocs, `suiteAuBilan` sans objet (dernière séance), **« Corriger »** après le bilan (règle du 07/10 :
les fiches se rouvrent, le premier bilan est gardé, note = moyenne). C'est la **dernière** séance du parcours : bandeau
« Parcours Spartoo terminé ✓ » quand tout est jugé (texte à confirmer, §11).

## 6. Contenu (données)

Fichiers : `contenus/spartoo-tracabilite.js` (volet, jalons), `contenus/questions/ENT-1.3.js`. **Tout attendu se déduit
des mouvements du lot** (comme aujourd'hui) ; rien d'écrit en dur.

### 6.1 Valeurs prévues (élève qui a tout fait juste en 1.1 et 1.2 — à recalculer par le code)

| Réf. | Entré (REC-04127) | Sorti (ses préparations) | Reste à bloquer | Ancien stock (autre lot) |
|---|---|---|---|---|
| PM-SUE-RG-39 | 24 | 0 | 24 | 17 (`LOT-PM-2588`, reste vendable) |
| PM-SUE-MA-41 | 18 | 3 (BP-048307 : 1, BP-048312 : 2) | 15 | 0 (vidé par les commandes de la nuit, 1.2 §6.3) |
| PM-RSX-BL-42 | 24 | 2 (BP-048307) | 22 | 0 |

Quantité vendue concernée : **5 paires**, **2 clients** (Clara Bernard, Noah Fournier), **2 commandes** ; quantité retirée :
**61 paires**. PM-SUE-RG-39 n'a rien vendu du lot : tout le lot reste, à côté de 17 paires saines.

### 6.2 Commandes de collègue (aval)

**Proposé** : on n'en sème plus pour l'aval si l'élève a des sorties du lot (fil conducteur). Les **commandes de la
nuit** semées par 1.2 (sorties de l'ancien stock de MA-41 et RSX-BL-42, sans le lot) servent de **leurres** au rapport :
mêmes références, pas le même lot. Numéros proposés : CMD-048290, CMD-048294 (construits).

### 6.3 Les messages

- **Alerte Puma** : inchangée (vous).
- **M. Morin** (**tu**) : « Le lot LOT-PM-2609, c'est celui que tu as reçu au quai et dont tu as préparé des paires hier.
  1. Remonte-le avec `.getlot`. 2. Va aux emplacements et dis à Nadia quels casiers isoler (fiche « Isoler le lot ») :
  seulement ce lot, rien d'autre. 3. Bloque le reste du lot, référence par référence (Blocage qualité). 4. Remplis-moi le
  rapport de traçabilité : Puma en a besoin pour déclarer le rappel. » Bouton « Remplir le rapport ».
- **Accueil** (5 étapes, tu) : lire les deux messages · remonter le lot (Console) · isoler les casiers (fiche) · bloquer
  le reste (Blocage qualité) · rendre le rapport (fiche).

### 6.4 La fiche « Isoler le lot » (bloc `ouinon`, une colonne « À isoler en zone qualité »)

`documents` à gauche : l'alerte de Puma. Huit casiers (ordre mélangé par le contenu, le même pour tous) :

| id | Casier (étiquette) | À isoler ? | Pourquoi |
|---|---|---|---|
| `rg39-2609` | PM-SUE-RG-39 · T.39 · LOT-PM-2609 · entré le *date de sa réception* | **oui** | le lot |
| `rg39-2588` | PM-SUE-RG-39 · T.39 · LOT-PM-2588 · entré *30 jours plus tôt* | non | même référence, autre lot |
| `ma41-2609` | PM-SUE-MA-41 · T.41 · LOT-PM-2609 | **oui** | le lot |
| `ma40-2690` | PM-SUE-MA-40 · T.40 · LOT-PM-2690 | non | voisin, chiffres inversés |
| `rsx42-2609` | PM-RSX-BL-42 · T.42 · LOT-PM-2609 | **oui** | le lot |
| `rsx43-2614` | PM-RSX-BL-43 · T.43 · LOT-PM-2614 | non | le lot du BL piège de 1.1 |
| `rsxgr42-2602` | PM-RSX-GR-42 · T.42 · LOT-PM-2602 | non | même modèle et pointure, autre couleur, autre lot |
| `nb574-2609` | NB-574-GR-42 · T.42 · LOT-NB-2609 | non | même numéro, autre fournisseur |

Les dates sont **calculées** (celle de la réception de l'élève lue dans ses mouvements). Les lots leurres sont des
étiquettes construites (aucun mouvement) : `.getlot` sur l'un d'eux répond « aucun mouvement », sans contradiction.
**Pas de quantités** sur les étiquettes de casier (elles viennent de `.getlot`, et une fiche ne les calcule pas).
D'après `MODELS_RAW_P42` (`contenus/spartoo.js`), `PM-SUE-MA-40`, `PM-RSX-BL-43`, `PM-RSX-GR-42` et `NB-574-GR-42` existent
(couleurs et pointures du modèle) ; **à confirmer** dans `CATALOGUE.VM` à la construction.

### 6.5 Le volet

Nouveau `VOLET` **`tracabilite-2`** : les deux messages, rien d'autre si l'élève a des sorties du lot. **Filets** (gardés) :
(a) lot jamais entré (pas de 1.1) → réception du collègue REC-04118, comme aujourd'hui ; (b) lot entré mais **aucune
sortie** (1.2 non faite ou vague non validée) → préparation de CMD-048307 et CMD-048312 par un collègue, plafonnée par
le lot (code actuel de `VENTES`, réduit à ces deux commandes).

## 6 bis. Tirage et niveaux

Non tirée (règle du 08/10, ancien scénario). La liste des casiers est une donnée : un tirage dans une banque de leurres
serait possible plus tard.

## 7. Demandes au moteur

Aucune vue nouvelle. À vérifier seulement :
1. Deux fiches dans la séance (`fiches: [ISOLER, RAPPORT]`) avec `fermetures` sur la seconde, et `ouvreFiche` sur un mail
   semé par un volet (déjà utilisé par Smoby 5.8 et Spartoo 1.1, a priori rien à faire).
2. Un bloc `ouinon` à une seule colonne et 8 lignes : rendu lisible à 1366 × 768.
3. Une **étiquette de casier** dont la date est calculée à l'ouverture (texte de ligne fourni par une fonction du contenu
   ou posé par le volet) : si la fiche n'accepte qu'un texte fixe, **demande** : `lib` calculable (`lib: (db) => …`).

### 7 bis. Séance déjà jouée par des élèves

- **Ont fini l'ancienne 1.3** : gardent leur note et leur travail ; rien n'est semé.
- **En cours** (volet `tracabilite-1` semé) : **proposé** — `tracabilite-2` semé à la prochaine ouverture (messages
  nouveaux) ; leurs blocages déjà faits restent valables (bloc B inchangé) ; leurs commandes de collègue
  (CMD-048301, 048307, 048312) restent et comptent comme aval (les attendus se lisent dans les mouvements) ; leur
  compte rendu par mail n'est plus lu : ils remplissent la fiche. **Décision de Tristan** (§11).

## 8. Tests attendus

Bloc `spartoo` :
- parcours 1.1 → 1.2 → 1.3 juste : casiers justes, blocage 24/15/22, rapport 5 / 2 / 61, les deux commandes **de l'élève**
  cochées ; `.getstock PM-SUE-RG-39` = 17 après blocage ;
- casier `rg39-2588` isolé → case A fausse ; **blocage** tenté sur `LOT-PM-2588` refusé ;
- leurre de la nuit coché → case « aucune en trop » fausse ;
- « non » partout → bloc A sous la moitié ; fiche rapport vide → bloc C à 0 (sabotage : case « aucune en trop » sans
  garde → le test tombe) ;
- filets (a) et (b) ; les situations du §7 bis.

## 9. Supports pour les élèves

- Trame **réduite** (règle du 07/10), réécrite par Cowork après validation à l'écran : brouillon « entré − sorti = reste »
  par référence, et la page de cours (lot, amont / aval, **retrait / rappel**, RappelConso). Les étapes 1 et 2 actuelles
  (définitions, relevé de l'alerte) passent à l'écran ou au cours.
- Corrigé calculé à recalculer (`contenus/corriges/ENT-1.3.js`).

## 10. Critères de validation par Tristan

Jouer 1.1, 1.2, 1.3 avec un même élève : retrouver **ses** commandes dans `.getlot` ; se laisser tenter par le casier de
l'ancien lot ; bloquer ; rendre le rapport ; voir le bandeau de fin de parcours.

## 11. Questions ouvertes

- [ ] Remplacer le compte rendu par mail par la **fiche** (proposé) ou garder le mail en plus ?
- [ ] Élèves **en cours** sur l'ancienne 1.3 : passent à la nouvelle (proposé) ?
- [ ] Bandeau de fin de **parcours** (« Parcours Spartoo terminé ✓ ») : oui / texte ?
- [ ] La question `rappel` cite les clients de l'élève par leur nom : d'accord ?

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
