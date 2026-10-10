# Brief de séance — ENT-2.6 Cdiscount « Cinq recomptages, pas un de plus » (bonus)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-cdiscount.md, le compte rendu de docs/briefs/MOTEUR-geste-tableur.md (API livrée), puis implémente le brief docs/briefs/ENT-2.6-bonus.md. Annonce la durée, dis-moi si l'API du dépôt ne sait pas contrôler un point du §7, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
> ```

**Statut** : livré (04/10/2026), fermé aux élèves (`ouverture: 'prof'`) : Tristan l'ouvre à qui a fini.
**Date du brief** : 03/10/2026
**Modèle** : Sonnet — **Durée estimée par Cowork** : 2 à 3 h.
**Touche le moteur** : non (si le contrôle « lignes » et les salissures du geste tableur sont livrés ; sinon le lister).
**Conception** : `claude/prepalog-cdiscount-serie-decisions.md` (décisions 15, 16).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-2.6 / **`cdiscount-priorites`** (nouveau) |
| Titre | « Cdiscount — cinq recomptages, pas un de plus » |
| desc | « Bonus : nettoyer un export d'un mois sur deux allées, chiffrer les écarts et choisir les cinq références à recompter. » |
| Niveau / compétences | 1re / C1.6 (et C3.2 si déclarée en ENT-2.2) |
| Temps | **entraînement** (coefficient 1) — bonus, « réservé à ceux qui ont fini » (dit par la trame et l'enseignant) |
| Notation | `avancement`, 4 jalons |
| Ouverture | `pret: true, ouverture: 'prof'` — **Tristan l'ouvre** pour qui a fini |

L'évaluation reste ENT-2.5 ; le bonus porte le numéro 2.6 (décision 15).

## 2. Vérifié / construit

Comme ENT-2.1. **Construit** : l'export, ses salissures, la feuille de tarifs (coûts du catalogue de `cdiscount.js`).
Un export « sale » (lignes vides, doublons, dates en texte) est une réalité des extractions de logiciel : la trame peut le
dire.

## 3. Objectif

Avant le Black Friday, Nadia **ne peut faire recompter que 5 références**. L'élève nettoie un export d'un mois sur
**deux allées** (~150 lignes), compte les constats d'écart **depuis le dernier inventaire** par référence (**NB.SI.ENS**),
chiffre l'écart de chaque référence en euros (**RECHERCHEV** vers la feuille Tarifs), et choisit **les 5 plus coûteuses**
— pas seulement les plus fréquentes.

## 4. Déroulé

1. Ouverture : mission de Nadia (§ 5).
2. Écran Commandes → **« Exporter les lignes de préparation »** → `cdiscount-preparations-allees-A-B.xlsx` : feuilles
   **« Préparations »** (sale) et **« Tarifs »** (Référence | Désignation | Coût unitaire), **« Synthèse »** (colonne
   « Référence » seule, 18 lignes).
3. Tableur :
   - **nettoyer** : supprimer les lignes vides et les doublons, convertir les dates écrites en texte ;
   - colonne **« Écart »** (trouvé − logiciel) ;
   - colonne **« Réf. en écart »** : la référence si l'écart n'est pas nul **et** la date est postérieure ou égale au
     dernier inventaire (SI, ET) ; colonne **« Écart retenu »** juste à droite (recopie de l'écart) ;
   - **Synthèse** : « Constats » `=NB.SI.ENS(Préparations!D:D;A2;Préparations!K:K;"<>0";Préparations!A:A;">="&<date>)` ;
     « Écart » `=SIERREUR(RECHERCHEV(A2;Préparations!L:M;2;FAUX);0)` ; « Coût » `=RECHERCHEV(A2;Tarifs!A:C;3;FAUX)` ;
     « Valeur de l'écart » `= Écart × Coût`.
4. Dépôt : **retour d'entraînement** (« n résultats justes sur m »), redépôt possible.
5. Décision : message `À recompter : ` avec **5 références**.

Encarts NB.SI.ENS et RECHERCHEV (trame), rappel court dans le bandeau d'aide.

## 5. Messages

| Arrivée | De | Contenu |
|---|---|---|
| ouverture | Nadia | « Bonus, pour ceux qui ont fini : le Black Friday approche et l'équipe inventaire ne peut recompter que **cinq** références dans les allées A et B. Exportez les lignes de préparation du mois (attention : l'export sort brut du logiciel, il faut le nettoyer). Comptez, par référence, les constats d'écart **depuis le dernier inventaire du <date>** (NB.SI.ENS), puis chiffrez l'écart de chaque référence avec son coût, que vous trouverez dans la feuille Tarifs (RECHERCHEV). Une erreur coûte plus cher sur une batterie que sur une pile : choisissez les cinq références où l'écart pèse le plus en euros, et écrivez-les-moi sur une ligne « À recompter : ». » |
| après le message « À recompter : » | Nadia | « Merci. Je lance les cinq recomptages. » (neutre) |

## 6. Données (`contenus/cdiscount-priorites.js`)

- **Allées A et B** : 18 références (A-01-1 à A-06-2, B-01-1 à B-03-2) ; base propre.
- **≈ 150 lignes** de bons de préparation sur 30 jours ; **dernier inventaire = J-14** (date écrite dans la mission).
- **8 références à écart** depuis J-14, **écart constant** pour chacune après son apparition (un écart persiste tant qu'on
  ne régularise pas) ; les 10 autres : aucun constat depuis J-14.
- **Piège de la date** : une référence chère (**BAT-10K**) a de nombreux constats **avant** J-14, régularisés à
  l'inventaire, **aucun après** : sans le critère de date, elle entre à tort dans les cinq.
- **Piège de la fréquence** : le top 5 par **valeur** diffère du top 5 par **nombre de constats** d'au moins **2
  références** (ex. des piles ou des câbles souvent signalés pour 1 ou 2 unités, contre des écouteurs signalés deux fois
  pour 3 unités). Calculé et vérifié par le code.
- **Salissures** (déterministes, graine élève + séance) : **4 lignes vides**, **3 doublons exacts** (dont au moins un
  sur une référence à écart, pour fausser NB.SI.ENS), **5 dates en texte** (au moins 3 sur des lignes à écart après J-14).
- **Tarifs** : coût unitaire de `cdiscount.js` (une seule source).

## 7. Contrôles et jalons

| Contrôle | Type | Attendu |
|---|---|---|
| Export nettoyé | `lignes` | nombre de lignes de données sans vide ni doublon ; colonne Date entièrement en vraies dates |
| Constats depuis le dernier inventaire | table « Synthèse », clé Référence, colonne « Constats » | `COUNTIFS` |
| Valeur de l'écart | table « Synthèse », colonne « Valeur de l'écart » (tolérance 0,01) | `VLOOKUP` présent dans la feuille Synthèse |

| # | Jalon | Lit |
|---|---|---|
| 1 | Export nettoyé | contrôle « Export nettoyé » (meilleur dépôt) |
| 2 | Constats comptés depuis le dernier inventaire (NB.SI.ENS) | contrôle « Constats » |
| 3 | Écarts chiffrés en euros (RECHERCHEV) | contrôle « Valeur de l'écart » |
| 4 | **Les cinq bonnes priorités** | message « À recompter : » : **exactement 5** références = les 5 plus grandes valeurs **en valeur absolue** selon la synthèse **déposée** (sans dépôt : les vraies) |

## 8. Tests (`outils/test/cdiscount.mjs`)

Valeurs à la main : nombre de lignes brutes et nettoyées ; les 8 références à écart, leurs constats depuis J-14 et leur
valeur ; le top 5 par valeur et le top 5 par fréquence (≥ 2 différences) ; BAT-10K hors du top 5 avec le critère de date,
dedans sans. Classeur juste fabriqué dans le test → 4/4. **Sabotages** : synthèse calculée sur le fichier non nettoyé
(jalon 2 doit échouer) ; NB.SI au lieu de NB.SI.ENS (jalon 2 doit échouer) ; top 5 par fréquence envoyé (jalon 4 doit
échouer) ; salissures non déterministes (même élève, deux fichiers différents : doit échouer).

## 9. Supports

Trame élève Word/PDF (Cowork, après validation à l'écran) : encarts **NB.SI.ENS** et **RECHERCHEV** (syntaxe, exemple,
erreur fréquente : FAUX oublié, plage de recherche qui ne commence pas par la colonne cherchée), une page « nettoyer un
export ». Corrigé (Cowork).

## 10. Critères de validation par Tristan

Faire le bonus sous Excel **et** sous LibreOffice ; vérifier que le piège de la date (BAT-10K) et le piège de la fréquence
se voient ; que le retour reste « n sur m ».

## Niveau de l'élève : standard / confirmé

> **Décision de Tristan (03/10/2026)** : à partir de la série Cdiscount, chaque élève a un niveau **standard** (par
> défaut) ou **confirmé**, réglé par l'enseignant sur la fiche de l'élève (chantier « tiers-temps et niveau élève » :
> nom exact du réglage dans le compte rendu de `MOTEUR-tiers-temps.md`). Un confirmé a **plus d'opérations** à traiter
> — même travail, mêmes aides, mêmes pièges —, en **guidage et en entraînement** ; **l'évaluation est la même pour
> tous** ; **l'élève ne voit jamais son niveau** (aucune étiquette, aucun message qui le trahit). La séance lit le
> niveau dans sa base (`db.niveau`, posé à l'ouverture : `MOTEUR-statut-annulee.md`, partie 2) : il est **figé à la
> première ouverture** ; un changement de niveau ensuite ne touche pas une séance déjà commencée.

**Ce que ça change ici (détails tranchés par Cowork)** :

- **Standard** : ≈ 150 lignes sur 30 jours (inchangé). **Confirmé** : **≈ 220 lignes** sur les mêmes 30 jours et les
  mêmes 18 références (plus de commandes), salissures en proportion : **6 lignes vides, 5 doublons, 8 dates en texte**.
- Mêmes pièges (BAT-10K avant l'inventaire, top 5 par valeur ≠ top 5 par fréquence d'au moins 2 références) : **vérifiés
  par le code pour chaque niveau**.
- Tests : lignes nettoyées, constats et top 5 attendus **par niveau**.

## 11. Questions — toutes tranchées

> **Réponses données d'avance par Tristan (03/10/2026, Cowork)** : ne pas s'arrêter ; appliquer ces choix et **lister au
> compte rendu** tout ce que tu as choisi seul.

Décisions de fond : ENT-2.6, bonus ouvert par Tristan, coefficient 1 ; deux allées, un mois, ~150 lignes ; export sale ;
NB.SI.ENS + RECHERCHEV ; 5 références, les plus coûteuses ; retour façon entraînement.

### Détails tranchés par Cowork (à corriger à l'écran par Tristan)

- [x] `id` `cdiscount-priorites` ; titre « Cdiscount — cinq recomptages, pas un de plus ».
- [x] **Allées A et B** (18 références) ; l'allée C reste vierge pour l'évaluation.
- [x] **Critère de date** (depuis le dernier inventaire, J-14) : il donne leur sens à NB.SI.ENS et aux dates en texte.
- [x] **Valeur d'une référence = écart constaté × coût unitaire** (écart constant par référence) ; classement en valeur
  absolue (un surplus coûte aussi).
- [x] Méthode attendue pour l'écart par référence : RECHERCHEV sur la colonne « Réf. en écart » (avec SI et ET) suivie de
  « Écart retenu » ; **SIERREUR** autorisée (dans la liste des fonctions communes). Toute autre méthode qui donne les
  bonnes valeurs est acceptée : le contrôle porte sur les valeurs et sur la présence de `VLOOKUP` dans la Synthèse.
- [x] Salissures : 4 vides, 3 doublons, 5 dates en texte.
- [x] Piège de la date sur **BAT-10K** ; piège de la fréquence vérifié par le code (≥ 2 différences).
- [x] Fichier `cdiscount-preparations-allees-A-B.xlsx`, feuilles Préparations, Tarifs, Synthèse.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `activites/cdiscount-priorites.js`, `contenus/cdiscount-priorites.js` (neufs), une ligne dans
  `activites/index.js`, `contenus/cdiscount-inventaire.js` (`extraireRefs(texte, modeles)` accepte une liste),
  `outils/essai-cdiscount.html`, `outils/test/cdiscount.mjs` (6 cas), `outils/test/socle.mjs` (ENT-2.6 dans la liste).
  **Moteur** (commit à part, chantier du geste) : salissures visées (`cible`, `doublonsCible`, `datesTexteCible`),
  `salissures(db)` en fonction de la base (niveau), contrôle `lignes` avec `colonneDate`, contrôle `table` avec
  `fonctionsFeuille`.
- **Écarts par rapport au brief** :
  - Compétence : C1.6 seule (C3.2 = traçabilité).
  - Le contrôle « Valeur de l'écart » exige une **formule** dans chaque cellule et **RECHERCHEV quelque part dans la
    feuille Synthèse** (la cellule Valeur = Écart × Coût n'en contient pas elle-même).
  - Le contrôle « Export nettoyé » compte les lignes, les doublons **et** les dates encore écrites en texte
    (`colonneDate`) : les trois salissures sont jugées ensemble (un seul jalon, comme le brief).
- **Décisions prises en route** :
  - Données **fabriquées par un générateur à graine fixe** (`periode`, `core/tirage.js`) : mêmes commandes pour tous les
    élèves d'un niveau ; seules les salissures dépendent de l'élève. Dernier inventaire **J-14** (INV-2026-49), aucune
    préparation ce jour-là ; stock de départ 40 partout.
  - **Les 8 références à écart et leur écart (standard)** : PIL-AA-8 −2 (8 constats, −6,20 €), CAB-USBC-1M +1 (7, +4,90 €),
    SUP-VOIT −2 (5, −9,60 €), CHG-20W −3 (4, −29,70 €), CLA-SF-01 −2 (3, −28,40 €), ECO-BT-01 −3 (2, −59,70 €),
    BOU-17L −2 (2, −27,80 €), MIX-PLG +2 (2, +25,20 €).
  - **Top 5 par valeur** : ECO, CHG, CLA, BOU, MIX. **Top 5 par fréquence** : PIL, CAB, SUP, CHG, CLA (3 différences).
  - **BAT-10K** : écart −2 de J-27 à l'inventaire (5 constats, 6 en confirmé), régularisé à J-14 (ajustement « Démarque
    inconnue » de Nadia) ; sans critère de date, elle entre 2e dans les cinq.
  - **Lignes** : standard 151 propres / 158 brutes ; confirmé 223 / 234 (constats CAB 9, CHG 7, ECO 4, SUP 7, CLA 6, PIL 9,
    BOU 4, MIX 3 ; mêmes valeurs, même top 5 en valeur).
  - Valeur = écart × coût **signée** (un surplus est positif) ; classement en valeur absolue ; à égalité au 5e rang,
    l'une ou l'autre référence est acceptée. Jalon 4 jugé sur la synthèse déposée (`lu`), le meilleur message compte.
  - Salissures visées : au moins **1 doublon** et **3 dates en texte** sur des constats d'après l'inventaire.
- **Tests** : 6 cas (lignes brutes / propres, salissures et leur déterminisme, constats et valeurs à la main, pièges de
  la date et de la fréquence, par niveau ; classeur juste → 4/4 ; export non nettoyé → jalons 1-2 ko ; NB.SI au lieu de
  NB.SI.ENS → 2 ko ; top 5 par fréquence → 4 ko ; date oubliée → BAT-10K dans ses chiffres ; à l'écran : export de 158
  lignes brutes, trois feuilles, « 37 résultats justes sur 37 »). Sabotage « salissures non déterministes » → le cas
  tombe. Suite entière 537/537.
- **Commits** : « Geste tableur : salissures visées… », « ENT-2.6 bonus : cinq recomptages… (C9) ».
- **Reste ouvert** : trame (encarts NB.SI.ENS, RECHERCHEV, « nettoyer un export ») et corrigé (Cowork) ; essai par
  Tristan sous Excel **et** LibreOffice (NB.SI.ENS avec un critère de date `">="&DATE(…)`).

- **Notation pondérée sur 20 (10/10/2026, lot 4 de `docs/briefs/NOTATION-ponderation.md`)** : export 1,5, nettoyage 3, constats 4, valeur 4, cinq priorités 7,5 (le code a 5 jalons, le brief en annonçait 4). Poids validés par Tristan ; tableau `BAREME` du fichier de contenu, `bareme: 20` dans l'activité, plus de `notation: 'avancement'`. Les anciennes lignes du Suivi gardent leur proportion (`meilleurScore`).
