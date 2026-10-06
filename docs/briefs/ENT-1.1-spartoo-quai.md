# Brief de séance — ENT-1.1 Spartoo réception : passage par le quai

> Écrit par Cowork (conception), lu et complété par Claude Code (construction).
> **Ne rien inventer** : ce qui n'est pas décidé va dans « Questions ouvertes ».

**Statut** : livré (06/10/2026, soir) — sauf §7.7, chantier commun à venir — **le quai passe en 2D iso (§7.8) : chantier moteur d'abord**
**Maquette du quai iso VALIDÉE par Tristan le 06/10/2026** (`docs/briefs/spartoo/maquette-quai-spartoo-iso.html`) : elle fait foi
pour le rendu et l'interaction ; le code de la maquette est jetable (on reprend le comportement, pas le code).

**Ordre proposé** (un chantier moteur à la fois) : (1) kit iso — roues rondes (§7.9) + nouveaux objets et option `rendu: 'iso'`
du quai (§7.8) ; (2) réception sans tableau des colis + statut « Annoncée » (§7.1, §7.3) ; (3) contenu ENT-1.1 (§6) et bases
déjà commencées (§7.4) ; (4) bandeau de fin de séance (§7.6) ; (5) infobulle du Suivi (§7.7). Validation en local avant push.
**Date du brief** : 06/10/2026
**Conversation d'origine** : Cowork, « parcours élève 1.1 » (compte rendu de jeu : `claude/prepalog-parcours-eleve-1.1.md` du projet)

> ⚠ **ENT-1.1 est une séance OUVERTE aux élèves** (`pret: true`, première du parcours strict Spartoo) et le site publié
> est en **mode réel**. Un push est en ligne tout de suite. → Construire, faire valider par Tristan **en local**
> (`lancer.bat`), pousser ensuite. Voir aussi §7.4 (bases d'élèves déjà commencées).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-1.1 (inchangé) |
| `id` | `spartoo-reception` (**jamais modifié**) |
| Titre / desc | inchangés ; desc à compléter : « …du quai à l'entrée en stock » |
| Rubrique | simulog |
| Entreprise | Spartoo (réelle) — entrepôt de sa filiale Toolog |
| Niveau(x) | inchangé |
| Compétence(s) | C1.4 |
| Temps pédagogique | guidage |
| Notation | avancement (jalons) |
| Barème | 3 → **7 jalons** (§5) |
| `pret` à la livraison | reste `true` (séance en service) : ne pousser qu'après validation de Tristan en local |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

- **Vérifié (web, 06/10/2026)** :
  - L'entrepôt de Spartoo est exploité par sa filiale **Toolog**, à **Saint-Quentin-Fallavier (38)**, parc de Chesnes ;
    88 000 m², ~150 salariés (180 en soldes), 2 millions de paires, 100 % RFID —
    [mesinfos.fr](https://mesinfos.fr/auvergne-rhone-alpes/toolog-le-coeur-de-la-logistique-de-spartoo-a-saint-quentin-fallavier-121237.html),
    [FashionNetwork](https://fr.fashionnetwork.com/news/Spartoo-immersion-dans-son-entrepot-de-saint-quentin-fallavier-en-plein-rush-des-soldes,1598503.html).
  - Cartons de chaussures livrés aux enseignes (cahier des charges fournisseurs Foot Locker Europe, section 6) :
    **une seule référence et une seule taille par carton**, étiquette avec n° de commande, référence, quantité, taille,
    n° de carton ; 17 kg maximum ; palette mixte signalée comme telle —
    [Foot Locker VSM section 6](https://www.footlocker-inc.com/content/dam/flincfoundation/footlockerinc_documents/vms/europe/2022/Section%2006.%20-%20Carton%20Packaging,%20packaging%20and%20Shipping%20requirements.pdf).
    (Norme courante : 12 paires par carton ; **6 paires retenu ici**, choix de Tristan, pour garder des quantités compatibles avec le catalogue.)
- **Construit** : le quai n° 7, l'heure, le chauffeur Geodis, la palette, les cartons, les numéros (BL, REC, commande, lot), les réceptions leurres.
- **Documents reconstitués** : la vue quai porte déjà la mention de pied.
- **À vérifier avant d'écrire** : rien de plus côté entreprise. Photos : réutiliser celles de Smoby (`contenus/smoby/quai-*.jpg`, Pexels, licence déjà inscrite) ou en prendre d'autres si Claude Code juge qu'un quai « messagerie » doit différer.

## 3. Objectif pédagogique

Recevoir une livraison **de bout en bout, dans l'ordre réel** : le camion arrive et le chauffeur remet le BL (E4), on
**compte les cartons sur la palette** et on écrit les réserves **au transporteur** sur le BL avant de signer (E5), puis on
**retrouve sa réception dans le logiciel par son n° de BL** et on saisit le bon de réception **en paires** (conversion
cartons × 6) (E6). Les réserves au **fournisseur** (E8) restent par message : l'élève voit les deux destinataires, ce que
l'étape 2 de la trame enseigne déjà.

Avant (constat de Tristan) : E4 BL lu dans la messagerie, E5 colis lus dans un tableau qui donnait la vérité, E6 saisie —
trois écrans de lecture sans geste, et le tableau des colis rendait le comptage inutile.

## 4. Déroulé

Numéros = étapes de la trame (les étapes 1-3, 7 et 8 ne changent pas, sauf le texte de 3 et 8, §6.4).

| Trame | Écran | Ce que fait l'élève |
|---|---|---|
| E3 | Messagerie | Lit la procédure (mise à jour §6.4) et l'**avis d'expédition** de Puma (remplace le message « Bon de livraison », §6.3) |
| **E4** | **Quai ①** | Le camion Geodis arrive au **quai 7 de Toolog** ; le chauffeur parle et **remet le BL** (n° BL, lot, 3 lignes en cartons, « 6 paires par carton ») ; « Oui, vous pouvez décharger » |
| — | Quai ② | Déchargement animé : **le chauffeur** sort **1 palette** au transpalette (messagerie : c'est le chauffeur qui décharge, pas le cariste) |
| **E5** | **Quai ③④** | Palette mixte en 3D : faire le tour, lire les étiquettes, **compter chaque référence** (en cartons), noter la fiche de contrôle, décider « Accepter avec réserves » (avarie + manquant) ; ④ réserves précises sur le BL, **signature du chauffeur**, palette posée en zone de réception |
| **E6** | **Données > Réceptions** | **10 réceptions** dans la liste ; l'élève retrouve **la sienne par le n° de BL** (BL-77421 → REC-04127), un **piège** au BL voisin (BL-77412) est saisissable ; bon de réception **en paires** : annoncé et compté = cartons × 6 |
| E7 | Console | Inchangé (66 paires au lot au lieu de 24) |
| E8 | Messagerie | Message à Puma : lot, ce qui manque (6 paires, ou 1 carton), le carton endommagé |

Plus de **tableau des colis** dans la réception (§7.1) : la vérité est sur la palette, nulle part ailleurs.

## 5. Jalons / notation (8 avec le jalon 0 du questionnaire, dans l'ordre du déroulé)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 0 | Procédure lue : questionnaire juste (§6.3 bis) | `ficheEnvoyee(db, 'procedure')`, 5 réponses justes | attente avant l'envoi |
| 1 | Palette comptée juste (3 références, en cartons) | `jalonsQuai` : ligne `P1-comptage` (refs) | attente tant que rien n'est compté |
| 2 | Palette décidée juste : accepter avec réserves | `P1-decision` | idem |
| 3 | Réserves précises sur le BL (1 carton endommagé PM-RSX-BL-42 ; manque 1 carton PM-SUE-MA-41) | `P1-reserve` (motifs avarie + manquant) | vérifier que la vue sait juger **deux motifs sur une palette multi-références** (§7.2) |
| 4 | BL signé par le chauffeur | `etat.signe` | — |
| 5 | Contrôle à réception (bon de REC-04127) | jalon `controle` actuel, attendus recalculés (§6.1) **+ ko si la réception piège REC-04129 a été validée**, détail : « Réception REC-04129 saisie : ce n'est pas votre BL » | ne pas accuser tant que REC-04127 n'est pas validée et que le piège non plus |
| 6 | Entrée en stock des quantités acceptées, avec le lot | jalon `entree` actuel ; les entrées du piège sont déjà des « intrus » | — |
| 7 | Réserves signalées à Puma | jalon `reserve` actuel ; **accepter « 6 » (paires) OU « 1 carton »** pour le manquant | la trame dit « en chiffres » : garder |

`bareme: SEANCE.ETAPES.length` suit tout seul. La photo de fin de séance (parcours strict) se prend à 7/7.

## 6. Contenu (données)

Fichier : `contenus/spartoo-reception.js` (+ `activites/spartoo-reception.js` : `menu` gagne l'entrée du quai, `quai` déclaré,
**et perd `stock`** — décision de Tristan, 06/10 : l'écran Stock demandait un code, impasse pour l'élève ; on vérifie à la console).
Les attendus restent **calculés** (`attendu()` lit la palette), jamais recopiés.

### 6.1 La palette (P1, mixte, 2 × 2 × 3 = 12 cartons au BL, 6 paires par carton)

| Couches | Référence | Article | BL (cartons) | Réel | Aléa |
|---|---|---|---|---|---|
| 0 (bas) | PM-SUE-RG-39 | Puma Suede Classic XXI Rouge T.39 | 4 | 4 | aucun |
| 1 | PM-RSX-BL-42 | Puma RS-X Blanc T.42 | 4 | 4 | **1 carton enfoncé sur la face arrière** (il faut faire le tour) |
| 2 (haut) | PM-SUE-MA-41 | Puma Suede Classic XXI Bleu marine T.41 | 4 | 3 | **1 carton manquant au fond** (invisible de face) |

Étiquette de carton (modèle Smoby, champ `poids` détourné) : `PUMA · PM-SUE-MA-41 · SUEDE CLASSIC XXI BLEU MARINE · T.41 ·
6 paires par carton · Cde CF-20261003 · lot LOT-PM-2609`.
Décision attendue : `reserves`, motifs `avarie` + `manquant` (`motifs: ['avarie', 'manquant']`).

**Bon de réception attendu (en paires)** — calculé : `annonce = bl × 6`, `compte = reel × 6`.

| Réf. | Annoncé | Compté | État | Décision |
|---|---|---|---|---|
| PM-SUE-RG-39 | 24 | 24 | Conforme | Accepté |
| PM-RSX-BL-42 | 24 | 24 | Colis endommagé | Accepté sous réserve |
| PM-SUE-MA-41 | 24 | 18 | Conforme | Accepté sous réserve |

72 paires annoncées, **66 entrées** au lot LOT-PM-2609 ; manque 6 paires (1 carton).
`ANNONCE` et `COLIS` (exportés, lus par la traçabilité ENT-1.3) restent la source : `COLIS` devient la liste des **12 cartons
réels** (n° de carton, sku, 6, état), d'où se déduisent la palette du quai, `attendu()` et l'aval de 1.3.

### 6.2 Le quai (`QUAI` sur le modèle de `QUAI_ENT54`)

`froid: false`, `motifs: ['avarie', 'manquant']`, `lieu: { nom: 'Quai 7' }`, `zone: { nom: 'Zone de réception' }`,
titre « Toolog (Spartoo), Saint-Quentin-Fallavier (38) — Quai 7, réception », `dechargement: { par: 'chauffeur' }`
(transpalette, une palette), aides de guidage comme Smoby (`regleCouches`, `repere`, `chefDeQuai`, `consignes`),
**pas d'étape sécurité ⓪** (décision de Tristan, 06/10).
Camion : `transporteur: 'Geodis, tournée 14'`, `fournisseur: 'Puma France, B2B'`, `bl: 'BL-77421'`, `arrivee: '10:30'`,
parole : « Bonjour ! Geodis, une palette de chez Puma pour Spartoo. Voilà le bon de livraison : vous me signez quand c'est bon ? »
`avertissement` : « Réels : Spartoo, son entrepôt Toolog de Saint-Quentin-Fallavier, Puma, Geodis. Le quai 7, l'horaire, le
chauffeur, les références, quantités et défauts sont construits pour l'exercice. »

### 6.3 Les messages

- **Avis d'expédition** (remplace « Bon de livraison BL-77421 — expédition du jour ») : Puma, J-1 16 h, `kind: 'text'`
  (plus de document BL dans la messagerie) : « Votre commande CF-20261003 est partie hier avec Geodis (tournée 14), BL-77421,
  1 palette, livraison demain matin. Vos réserves éventuelles sous 48 heures, en rappelant le numéro de lot. » → corrige au
  passage la contradiction de dates relevée au jeu (BL daté J-2, mail « remise ce matin »). La date d'expédition du BL = J-1.
- **Procédure de M. Morin** : règle 2 réécrite « On compte carton par carton sur la palette, référence par référence, en
  faisant le tour. Sur l'étiquette : le nombre de paires par carton » ; nouvelle règle « Avant de signer le BL du chauffeur,
  on y écrit les réserves précises. Puis on prévient le fournisseur le jour même » ; règle 3 « …le bon de réception, **en
  paires** ». Garder 5 règles au plus si possible (lecteurs faibles).
- Bienvenue : inchangé.

### 6.3 bis Le QCM de lecture de la procédure (retour de classe de Tristan, 06/10 : « on peut ajouter un QCM à l'écran
qui valide la lecture »)

**Aucun code moteur** : la **fiche à remplir** existe (`core/types/fiche.js`, Smoby ENT-5.1). `documents: ['procedure']` (la
procédure de M. Morin en document à gauche) + `fiche: { id: 'procedure', libelle: 'Questionnaire procédure', bouton: 'Répondre au
questionnaire', blocs: [...], envoi: { bouton: 'Envoyer à M. Morin', a: 'M. Morin' } }` ; le message « Procédure de réception »
porte `ouvreFiche: 'procedure'`. Blocs `choix` (une réponse), choix mélangés par le contenu :

| # | Question | Juste | Leurres |
|---|---|---|---|
| 1 | Le chauffeur te tend le BL : tu signes… | après avoir compté | tout de suite, il est pressé · quand le chef de quai arrive |
| 2 | Une ligne où il manque des paires : | acceptée sous réserve | refusée · acceptée |
| 3 | Un carton est enfoncé, les chaussures sont intactes : | accepté sous réserve | refusé · accepté sans rien dire |
| 4 | On refuse une ligne seulement si… | la marchandise est inutilisable | il manque une paire · le carton est sale |
| 5 | Le numéro de lot sert à… | retrouver d'où vient une paire et chez qui elle est partie | calculer le prix · compter les cartons |

**Jalon 0 (nouveau, en tête)** : « Procédure lue : questionnaire juste » — `ficheEnvoyee(db, 'procedure')`, attente avant l'envoi,
ok si les 5 sont justes, sinon ko avec le détail (n° des questions fausses). Le barème passe de 7 à **8 jalons**.
Les questions suivent les règles réécrites au §6.3 (si M. Morin garde 5 règles, une question par règle).
**Le quai est FERMÉ tant que le questionnaire n'est pas envoyé** (décision de Tristan, 06/10) : l'entrée « Quai de réception »
du menu reste grisée avec « Réponds d'abord au questionnaire de la procédure (Messagerie) » (demande moteur §7.10). Le
questionnaire ouvre le quai à l'envoi, **même s'il y a des réponses fausses** (le jalon 0 le dira ; on ne bloque pas un élève
sur une lecture).

### 6.4 Les réceptions (Données > Réceptions), 10 lignes, triées par n°

| N° | Fournisseur | BL | Statut | Remarque |
|---|---|---|---|---|
| REC-04109 | Nike | BL-N-55120 | Réceptionnée | leurre |
| REC-04111 | adidas | BL-AD-30871 | Réceptionnée | leurre |
| REC-04114 | Vans | BL-V-1188 | Réceptionnée | leurre |
| REC-04116 | New Balance | BL-NB-90412 | Réceptionnée | leurre |
| REC-04120 | Puma | BL-77398 | Réceptionnée | leurre (même fournisseur, autre BL) |
| REC-04122 | Converse | BL-C-44107 | Réceptionnée | leurre |
| REC-04125 | ASICS | BL-AS-7730 | Réceptionnée | leurre |
| **REC-04127** | **Puma** | **BL-77421** | À contrôler | **la vraie** |
| **REC-04129** | **Puma** | **BL-77412** | À contrôler | **piège** (chiffres inversés) : PM-SUE-NR-40 (2 cartons), PM-RSX-GR-44 (2 cartons), lot LOT-PM-2614 ; saisissable |
| REC-04131 | Reebok | BL-RB-2266 | **Annoncée** | leurre : camion pas encore arrivé, non saisissable (§7.3) |

**Ne pas utiliser REC-04118** (réception du collègue posée par ENT-1.3). Les « Réceptionnée » sont semées avec `ctrl.validated: true`
et des lignes plausibles, **sans mouvements** (elles ne doivent rien changer au stock ni aux lots ; à vérifier : `.movements`
et les KPI n'en tiennent pas compte).
Le piège n'a pas de palette au quai : un élève attentif voit que ses références ne sont pas sur sa palette.

### 6.5 L'accueil (6 étapes, tutoiement — la trame tutoie, l'accueil vouvoie aujourd'hui)

1. Lire la procédure et l'avis d'expédition — Messagerie. 2. Recevoir le camion — Quai : le chauffeur te remet le BL.
3. Compter la palette — fais le tour, compte chaque référence, écris tes réserves sur le BL, fais signer.
4. Retrouver ta réception — Données > Réceptions : cherche ton n° de BL. 5. Saisir le bon de réception, en paires — puis
Console pour vérifier. 6. Prévenir Puma — un message avec le lot, ce qui manque, ce qui est abîmé.

## 7. Demandes au moteur

1. **Réception sans tableau des colis** : option de contenu (par réception, ex. `colisVisibles: false`, ou au niveau de
   la séance) qui **masque le tableau « Colis reçus sur le quai »** et la phrase « Additionnez-les… » tout en gardant
   `r.colis` pour `compteReel` / `refsReception`. À la place, un encadré : « Les cartons ont été comptés au quai : reprends ta
   fiche de contrôle. Sur le bon, on écrit des **paires**. » Colonne « Colis » de la liste : afficher « 1 palette » ou masquer.
   (`core/types/entreprise.js`, `vueReception` / `vueReceptions`.)
2. **À vérifier dans `quai.js`, sans rien changer si ça marche** : palette multi-références (`refs`) **avec** un manquant dans
   un groupe de couches **et** une avarie dans un autre ; réserve à deux motifs jugée par `P1-reserve` ; le lot visible sur le BL
   remis à l'étape ① (sinon demande : afficher `etiq.lot` ou un champ `lot` du camion) ; `dechargement.par: 'chauffeur'` avec
   décor fixe.
3. **Statut « Annoncée »** (décidé par Tristan, 06/10) : une réception dont le camion n'est pas arrivé, visible, non saisissable.
4. **Bases déjà commencées** : le `VOLET` change (palette, 10 réceptions, nouveaux messages). Proposer un nouvel `id` de volet
   (`reception-2`) et vérifier ce que voient : (a) un élève neuf ; (b) un élève qui a **déjà validé** 1.1 (photo prise, 1.2
   ouverte) ; (c) un élève **en cours** sur l'ancienne version. Et ENT-1.3 « élève sans 1.1 »
   (réception du collègue `REC-04118`) : la recaler sur 72/66 paires.
   **Règle décidée par Tristan (06/10, précisée) : « 3 élèves ont travaillé ce matin, quelle que soit l'avancée on repart
   à 0 »** → **toute base Spartoo créée avant la nouvelle version repart de zéro**, que 1.1 soit commencée ou validée : base
   remise à neuf à la prochaine ouverture (une seule fois : numéro de version du volet, comme la porte de sortie), photos
   `db.points` de 1.1 et suivantes effacées, scores 1.1 / 1.2 / 1.3 effacés du suivi, **1.2 refermée** tant que la nouvelle 1.1
   n'est pas validée. Aucun geste demandé à l'enseignant. (Cas (b) ci-dessus : on ne garde donc rien.)
5. **Stocks maximum** du catalogue : PM-SUE-RG-39 était déjà à 17 pour un maximum de 12 (« Statut OK ») ; après 66 paires,
   l'écart grossit. Relever le maximum de ces 3 références (contenu `spartoo.js`) si ça ne casse pas les jalons de
   réapprovisionnement d'ENT-1.2 (qui ne touche pas ces références, d'après `spartoo-tracabilite.js`).

6. **Bandeau de fin de séance pour l'élève** (décision de Tristan, 06/10 ; vaut pour **toutes les séances `parcours: true`**,
   donc chantier moteur à part, `core/types/entreprise.js`) : quand **tous les jalons sont jugés** (aucun en `attente` / `na`),
   un bandeau visible sur tous les écrans de l'environnement :
   - tous `ok` → « Séance validée ✓ — la suivante est ouverte » ;
   - sinon → « Il reste quelque chose à corriger : **<titre du (des) jalon(s) faux>** » + « Appelle ton professeur ou
     réinitialise ta séance » (X.1 seulement pour le second). **Le titre du jalon, jamais le `detail`** (qui donne la réponse).
   Les titres de jalons d'ENT-1.1 doivent donc se lire par un élève sans trahir la solution (ex. « Contrôle à réception du bon
   BL-77421 », pas « Le piège a été validé »). Ne pas l'afficher en évaluation (copie rendue) sans décision de Tristan.
   Sur la tuile Simulog, 1.1 réussie gagne une marque « validée ✓ ».

7. **Détail des jalons dans le Suivi de classe** (décision de Tristan, 06/10 ; toutes les séances Simulog à jalons) : au survol
   d'une case « n/N », une infobulle liste chaque jalon ✓ / ✗ / … (pas encore fait) et, sous chaque ✗, **la phrase `detail`**
   que `verifier()` calcule déjà (aujourd'hui perdue : seul `ok/ko` est rangé dans `detail[e.id]`). Il faut donc **ranger
   aussi le texte du détail** des jalons faux dans la note enregistrée (taille raisonnable pour Firestore, tronquer si besoin),
   et le lire dans `core/prof.js`. Pied : premier coup et temps passé (déjà mesurés). Maquette :
   `docs/briefs/spartoo/maquette-retours-jalons-1.1.html` (écran ①). Le bandeau élève (§7.6) = écrans ② et ③.

8. **Le quai en 2D iso** (décision de Tristan, 06/10 : « on passe en 2D iso ») — **change l'ampleur du chantier** : ce n'est
   plus « la vue quai telle quelle ». Maquette jouable qui fait foi pour le rendu et l'interaction :
   `docs/briefs/spartoo/maquette-quai-spartoo-iso.html`. Proposé : une option de la vue quai (`rendu: 'iso'`) qui remplace
   la photo et la palette 3D par le **kit iso** (`core/iso.js`, mêmes constantes que l'animation d'ENT-6.5), avec :
   - ① **dehors** : façade, portes numérotées, camion porteur qui recule à la porte, chauffeur (silhouette sans visage) et
     sa bulle, BL à droite ;
   - ② **dedans** : porte sectionnelle qui se lève, intérieur de remorque vu **seulement par l'ouverture** (clip), le chauffeur
     sort la palette au **transpalette manuel** jusqu'à la zone de réception marquée au sol ;
     **règle de profondeur** (relevée par Tristan le 06/10 : « on voit à travers le mur ») : **tout** ce qui est dans la remorque
     — palette, chauffeur, transpalette — ne se voit que par l'ouverture ; un objet qui passe la porte est coupé au plan du mur ;
     le **niveleur** se dessine avec le sol, **avant** tout ce qui roule ou marche dessus (sinon on passe « à travers ») ;
   - **personnage** (Tristan, 06/10 : « doit ressembler un peu plus à un humain ») : chaussures, deux jambes qui marchent,
     pantalon, gilet à bandes, bras et mains, cou, tête **sans traits du visage**, cheveux ; vu de dos quand il tire le
     transpalette, la main sur le timon — voir `personne()` dans la maquette ;
   - **bulle de parole** : largeur mesurée sur le texte, marges égales, coins arrondis, pointe vers la tête — voir `bulle()` ;
   - ③ **la palette en grand** : « ⟲ Tourner / Tourner ⟳ » (4 vues, pastilles des faces vues), cartons cliquables, étiquette
     lisible au zoom (n° de carton « x / 12 », réf., taille, paires par carton, commande, lot), enfoncement dessiné sur la
     seule face concernée ; fiche de comptage **par référence, en cartons** + cartons endommagés ; décision + motifs ;
   - ④ BL avec les réserves manuscrites composées depuis la fiche, signatures.
   Nouveaux objets du kit : façade de quai, camion porteur, porte sectionnelle, transpalette manuel, personne debout,
   palette EUR + cartons rotatifs. Le mode photo/3D reste pour Picard et Smoby.
9. **Roues rondes dans le kit iso** (Tristan, 06/10 : « les roues, rondes, faudra qu'on change ça aussi sur les autres
   animations ») : une roue = un cercle dans le plan du flanc, projeté par la matrice iso (une ellipse), avec épaisseur et
   moyeu — voir `roue()` dans la maquette. **À appliquer au `chariotFrontal` de `core/iso.js`** (roues en boîtes aujourd'hui)
   et à tout véhicule ajouté au kit (camion porteur, vélo-cargo, transpalette).

11. **Confirmation avant de valider le bon de réception** (décision de Tristan, 06/10) : « Valider la réception (entrée en
   stock) » ouvre une confirmation qui rappelle le n° de réception et le n° de BL (« Tu valides la réception **REC-04127**
   du BL **BL-77421** : 3 lignes, 66 paires. Après validation, tu ne pourras plus la modifier. » — **Annuler** / **Valider**).
   Rappeler les deux numéros, c'est la dernière chance de voir qu'on est sur la réception piège. Pour toutes les séances
   qui utilisent le bon de réception (`core/types/entreprise.js`, `vueReception`) ; à faire avec le lot (2). Pas de
   `window.confirm` (bloque l'automatisation des tests) : une boîte dans la page.
10. **Écran du menu fermé par une condition** (décision de Tristan, 06/10) : la séance déclare, pour une entrée du menu, une
   condition d'ouverture et un message (ex. `quai: { …, ouvertSi: (db) => ficheEnvoyee(db, 'procedure').envoye, ferme:
   'Réponds d'abord au questionnaire de la procédure (Messagerie)' }`). Entrée grisée avec ce message tant que la condition
   est fausse ; garde aussi sur l'accès direct à l'écran. Ne concerne que les élèves (l'enseignant navigue librement). Petit
   chantier, à faire avec le lot (2) de l'ordre (réception sans tableau des colis, statut « Annoncée »).
   Test : quai fermé au départ ; questionnaire envoyé (même faux) → quai ouvert ; sabotage : condition ignorée → le test tombe.

## 8. Tests attendus

Bloc `outils/test/spartoo.mjs` (cas 31-34 à réécrire) + `outils/test-seances.mjs` (rouge 28/31 au 06/10, voir
`claude/prepalog-audit-tests-06-10.md`) :
- parcours complet juste → 7/7, photo prise, 1.2 ouverte ; `.getlot LOT-PM-2609` → 66 entrées ;
- le tableau des colis n'apparaît plus dans REC-04127 ;
- la liste montre 10 réceptions ; REC-04118 absente ;
- **piège validé** → jalon 5 ko avec le détail, jalon 6 ko (intrus) ;
- message à Puma avec « 1 carton » au lieu de « 6 » → jalon 7 ok ;
- 1.3 : l'aval reste cohérent (ventes plafonnées par le lot) ;
- sabotages : palette sans carton manquant → jalon 1 doit tomber ; attendu recopié en dur au lieu de calculé.

## 9. Supports pour les élèves

- **Retours de classe de Tristan (06/10, matin) — à intégrer à la nouvelle trame, en une fois avec la refonte (décision
  de Tristan : « tout avec la refonte »)** :
  - **E1** : « va voir les CGV » est trop difficile → **extrait imprimé dans la trame**. Attention : Spartoo accorde **30 jours**
    pour retourner un article (retour gratuit en France), le délai **légal** de rétractation est **14 jours**
    ([Medicys, 29/06/2026](https://www.medicys-consommation.fr/article/retour-spartoo-guide-pratique-et-conditions), à recouper
    sur spartoo.com avant d'écrire). L'extrait distingue les deux ; le QCM « combien de jours pour changer d'avis ? » devient
    « …d'après **la loi** ? » + une question « pourquoi Spartoo donne-t-il plus que la loi ? ». **Objectif fixé par Tristan (06/10)** : faire comprendre la
    différence **loi (14 jours, obligatoire pour tous les vendeurs en ligne — Code de la consommation, art. L221-18 ; [economie.gouv.fr](https://www.economie.gouv.fr/particuliers/mes-droits-conso/bien-consommer/vente-distance-tout-savoir-sur-votre-droit-de-retractation))** /
    **Spartoo (30 jours, choix commercial = approche client : rassurer, fidéliser, se démarquer)**. Petit tableau à deux
    colonnes « Ce que la loi impose / Ce que Spartoo choisit d'offrir » + QCM « Les 30 jours de Spartoo, c'est… » (une
    obligation légale · **un service pour attirer et garder les clients** · une erreur du site). **Plus de place pour répondre**
    (contrôle du remplissage des pages au rendu PDF).
  - **E2** : la recherche Internet « Code de commerce » est trop vague → **un document dans la trame** « Le bon de livraison et
    les réserves » : définition du BL (qui le rédige), ce qu'est une réserve, **article L133-3 al. 1** cité mot pour mot (« La
    réception des objets transportés éteint toute action contre le voiturier pour avarie ou perte partielle si dans les trois
    jours, non compris les jours fériés, qui suivent celui de cette réception, le destinataire n'a pas notifié au voiturier, par
    acte extrajudiciaire ou par lettre recommandée, sa protestation motivée » — cité par
    [CMS Francis Lefebvre](https://cms.law/fr/fra/publication/avarie-ou-perte-partielle) ; version Légifrance en vigueur à
    vérifier, page en 403 depuis le conteneur), réserves **précises** acceptées par la jurisprudence, « sous réserve de
    déballage » sans valeur. Les questions d'E2 se répondent dans le document.
  - **E3** : la **transition Internet → Prepalog** doit être claire : encart avec panneau ⚠ « À partir d'ici, tu travailles dans
    Prepalog » + connexion pas à pas. Puis le **QCM de la procédure à l'écran** (§6.3 bis) ; la trame garde une question de
    réflexion, pas de recopie des règles.
  - **Console** : elle est utilisée en 1.1 mais expliquée en 1.2 → **initiation en 1.1** (décision de Tristan) : l'étape 7
    devient « Découvrir la console et vérifier ta réception » (`.help`, puis `.movements`, `.getstock <réf.>`, `.getlot <lot>`,
    chacune avec ce qu'on doit voir). Le message de bienvenue et l'accueil le disent. **Trame d'ENT-1.2** : son étape console
    devient un rappel court (à retoucher en même temps).
- Trame : **étapes 3 à 8 à réécrire par Cowork** (`outils/trame-*.py` de Spartoo réception + `corriges_data.py`), **après
  validation à l'écran** (règle 6). Étape 4 « Le camion arrive » (relevé du BL au quai), étape 5 « Compter la palette » (tableau
  cartons → écart, réserves écrites sur le BL), étape 6 « Retrouver ta réception et saisir en paires » (n° de REC trouvé,
  conversion × 6).
- Corrigés 1.1 **et 1.3** à régénérer (24 → 66 paires au lot).
- **Durée : ≈ 1 h 30, on ne coupe pas la séance** (décision de Tristan, 06/10 : « je gère le temps en classe »).

## 10. Critères de validation par Tristan (en local, avant push)

Jouer 1.1 avec un élève neuf : le camion, le BL remis, le déchargement, la palette (le carton enfoncé ne se voit qu'en faisant
le tour, le manquant aussi), les réserves, la signature ; puis trouver REC-04127 parmi les 10 ; la saisie en paires ; 7/7 et
1.2 qui s'ouvre. Rejouer en validant le piège : voir le jalon tomber et le détail dans le suivi.

## 11. Questions ouvertes

- [x] Étape sécurité ⓪ au quai : **non** (Tristan, 06/10) — pas de `securite` dans le quai.
- [x] REC-04131 Reebok : statut **« Annoncée »**, non saisissable (Tristan, 06/10) → demande §7.3.
- [x] Retour à l'élève en fin de séance : **bandeau qui nomme le jalon faux, sans la réponse** (Tristan, 06/10) → §7.6. Maquette : `docs/briefs/spartoo/maquette-retours-jalons-1.1.html`.
- [x] Détail des jalons faux au Suivi : **infobulle avec la phrase de détail** (Tristan, 06/10) → §7.7.
- [x] Quai fermé tant que le questionnaire de la procédure n'est pas envoyé : **oui** (Tristan, 06/10) → §6.3 bis, §7.10.

---

## Pour Cowork — trame d'ENT-1.1 et corrigés 1.1 / 1.2 / 1.3 (06/10/2026, soir)

> Écrit par Claude Code. Décision de Tristan (06/10, soir) : la nouvelle 1.1 part en ligne **ce soir avec sa trame**.
> Tout ce qui suit est **lu à l'écran** de la version locale (vérifié en jouant la séance), sauf mention.

**Le déroulé à l'écran (menu de la séance)** : Accueil · Messagerie · *Questionnaire procédure* · *Quai de réception*
(grisé « Réponds d'abord au questionnaire de la procédure (Messagerie) » tant que le questionnaire n'est pas envoyé) ·
Réceptions · Fournisseurs · Console. **Plus d'écran Stock.**

**Messagerie** (3 messages) : Bienvenue (inchangé) ; « Procédure de réception : à lire avant le quai » (M. Morin, tutoie,
5 règles + la console : `.help`, `.movements`, `.getstock <réf.>`, `.getlot <lot>`, bouton « Répondre au questionnaire ») ;
« Avis d'expédition — commande CF-20261003 » (Puma : Geodis tournée 14, BL-77421, 1 palette, livraison demain matin,
réserves sous 48 h en rappelant le lot). **Le BL n'est plus dans la messagerie** : le chauffeur le remet au quai.

**Questionnaire** (envoyé à M. Morin ; le quai s'ouvre à l'envoi, même faux) : les 5 questions du §6.3 bis, une réponse
chacune ; ordre des choix à l'écran = celui du tableau du §6.3 bis, juste en 2e, 3e, 1re, 3e, 2e position.

**Quai — ① le camion arrive** : 10:30, porte 7. BL remis : **BL-77421**, Puma France B2B, commande **CF-20261003**,
expédié **la veille de la séance** (date du jour − 1, calculée), transporteur **Geodis, tournée 14**, lot **LOT-PM-2609**.
Lignes (palette P1) : PM-SUE-RG-39 · 4 cartons · 6 paires ; PM-RSX-BL-42 · 4 · 6 paires ; PM-SUE-MA-41 · 4 · 6 paires ;
total **1 palette mixte, 12 cartons**. Bouton « Oui, vous pouvez décharger ». ② le chauffeur sort la palette au transpalette.

**③ Compter la palette** : 3 couches, une par référence (bas RG-39, milieu RSX-BL-42, haut MA-41). Cartons numérotés « n / 12 »
sur leur étiquette. **Comptés : RG-39 = 4, RSX-BL-42 = 4, MA-41 = 3** (le carton **n° 9** manque, au fond de la couche du
haut, invisible de face). **1 carton endommagé : n° 6, PM-RSX-BL-42**, enfoncé sur la face **arrière** (visible seulement
en tournant). Fiche de contrôle : « Réf. lue », « Endommagés », « Manquants ». Décision : **Accepter avec réserves**,
motifs **Cartons endommagés + Manquant**.

**④ Réserves et signature** : deux cases « Nombre de cartons endommagés » = **1**, « Nombre de cartons manquants » = **1**.
Ligne écrite sur le BL (texte exact) : « P1 PM-SUE-RG-39 + PM-RSX-BL-42 + PM-SUE-MA-41 : acceptée sous réserve — 1 carton
endommagé (écrasé) ; manque 1 carton (BL 12, reçu 11). » Ne pas cocher « Sous réserve de déballage ». Faire signer.
⚠ La ligne ne nomme pas la référence concernée (limite de la vue quai, voir « Reste ouvert ») : la trame peut demander de
l'écrire à la main sur le BL papier, l'écran ne le juge pas.

**Données > Réceptions** (10 lignes, la plus récente en haut) : REC-04131 Reebok BL-RB-2266 *Annoncée* (« camion pas encore
arrivé », pas de bouton) · **REC-04129 Puma BL-77412 À contrôler (le piège)** · **REC-04127 Puma BL-77421 À contrôler (la
bonne)** · REC-04125 ASICS · 04122 Converse · 04120 Puma BL-77398 · 04116 New Balance · 04114 Vans · 04111 adidas · 04109 Nike
(*Réceptionnée*). Colonne « Colis » : « 1 palette ». Dans REC-04127, **plus de tableau des colis** : l'encadré dit « Les
cartons ont été comptés au quai : reprends ta fiche de contrôle. Sur le bon de réception, on écrit des paires. »

**Bon de réception attendu (en paires)** : lot **LOT-PM-2609** ; PM-SUE-RG-39 annoncé **24**, compté **24**, Conforme, Accepté ;
PM-RSX-BL-42 **24 / 24**, Colis endommagé, Accepté sous réserve ; PM-SUE-MA-41 **24 / 18**, Conforme, Accepté sous réserve.
Total 72 annoncées, **66 entrées**.

**Console** : `.getlot LOT-PM-2609` → Entrées **66 paires** (24 + 24 + 18, « Entrée : réception », REC-04127), Sorties 0,
Reste **66**, « Aucune sortie : tout le lot est encore en stock. » `.movements` : « Entrée : réception ».

**Message à Puma** : jugé juste avec le lot, PM-SUE-MA-41 et le manquant **« 6 » (paires) ou « 1 carton »**, et PM-RSX-BL-42.

**Jalons (8)**, titres lus par l'élève : Procédure lue : questionnaire juste · Palette comptée, référence par référence ·
Décision pour la palette · Réserves précises écrites sur le BL · BL signé par le chauffeur · Contrôle à réception du bon
BL-77421 · Entrée en stock des quantités acceptées, avec le lot · Réserves signalées à Puma. Suivi : **8/8**.

**Effets sur 1.2 et 1.3 (calculés, à vérifier par le test des séances)** : après 1.1, le stock contient **42 paires de plus**
qu'avant la refonte (66 au lieu de 24 au lot). ENT-1.3 : Entrées **66**, Sorties **6** (RG-39 : 3, MA-41 : 1, RSX-BL-42 : 2,
mêmes commandes CMD-048301 / 048307 / 048312), Reste **60** : à bloquer **RG-39 = 21, RSX-BL-42 = 22, MA-41 = 17**
(avant : 9, 4, 5). La réception du collègue (élève sans 1.1, REC-04118) suit les mêmes chiffres.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `core/iso.js` (roues rondes, objets du quai), `core/types/quai.js` (`rendu: 'iso'`, BL avec
  en-tête, fiche par référence), `core/types/entreprise.js` (réception « Annoncée » et sans colis, `fermetures`, bandeau de fin
  de séance, confirmation du bon de réception et des phrases), `core/types/fiche.js` (`colonne`, confirmation), `core/types/planning.js`
  (confirmation), `core/ui.js` (`confirmerDansLaPage`), `core/app.js` et `core/parcours.js` (`versionBase`, séance suivante, tuile
  « validée ✓ »), `styles/quai.css`, `styles/base.css`, `activites/spartoo-reception.js`, `contenus/spartoo-reception.js` ; tests :
  `outils/test/spartoo.mjs`, `animation.mjs`, `smoby.mjs`, `planning.mjs`, `outils/test-seances.mjs`. Trame et corrigés : Cowork
  (`docs/briefs/COWORK-trames-spartoo-refonte-1.1.md`).
- **Écarts par rapport au brief** (et pourquoi) : 8 jalons (§6.3 bis) et non 7 ; §7.5 non fait (le maximum est par modèle, ENT-1.2
  en dépend) ; la réserve écrite au quai ne nomme pas la référence (limite de la vue quai) ; pas d'étape « rentrer » en rendu iso
  (la palette est posée en zone de réception, comme la maquette) ; l'avis d'expédition est daté de la veille au soir.
- **Décisions prises en route** : voir `docs/decisions.md` (06/10/2026).
- **Tests** : bloc spartoo 85+ cas (quai iso, questionnaire, piège, remise à zéro des bases, bandeau, confirmation, fiche par
  référence), chacun éprouvé par sabotage ; `test-seances.mjs` recalé sur les corrigés de Cowork (aucun écart) ; suite entière verte.
  Le cas « Repérage » de `smoby.mjs` échoue quand on lance `spartoo smoby` seuls (il prend la première séance d'entreprise, qui
  dépend des blocs déjà passés) : vert dans la suite entière et sur GitHub, à rendre indépendant un jour.
- **Commits** : dc0676a (quai iso, moteur), 5d286d2 (réceptions, fermetures), b5f15de (ENT-1.1), 0812cab (bandeau), 83f234e
  (confirmation), 5b6afa5 (fiche par référence), puis le commit des trames et corrigés.
- **Reste ouvert** : §7.7 détail des jalons au Suivi (chantier commun avec Smoby C4) ; retours Smoby (lots A, B, puis C3, C5-C7).
