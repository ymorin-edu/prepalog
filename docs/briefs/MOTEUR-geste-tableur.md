# Brief de chantier — MOTEUR : le geste tableur « Exporter, traiter, Déposer, décider » (Cdiscount C5)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis le brief docs/briefs/MOTEUR-geste-tableur.md. Annonce la durée avant de commencer, découpe en lots, fabrique la page d'essai, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§12).
> ```

**Statut** : livré (04/10/2026).
**Date du brief** : 03/10/2026
**Modèle** : **Opus** — **Durée estimée par Cowork** : 6 à 8 h, en lots (export ; dépôt et contrôles ; retours selon le
temps ; copie rendue ; page d'essai et tests témoins).
**Touche le moteur** : oui — `core/types/entreprise.js` (câblage), un module neuf `core/types/export-tableur.js`,
réutilisation de `core/types/tableur.js`, styles, `outils/test.mjs` (ligne `BLOCS`). S'inscrire dans `docs/EN-COURS.md`.
**Conception** : `claude/prepalog-geste-export-tableur.md` (décisions et **règles de construction**, essai des fichiers
témoins), `claude/prepalog-cdiscount-serie-decisions.md` (décision 9), `docs/decisions.md` (03/10, geste tableur).

## 1. Le geste (décision de Tristan, 03/10/2026)

En entrepôt, on **exporte** une liste du logiciel, on la **retravaille** dans un tableur, on **décide**. Dans Logisim :

| Temps | Où | L'élève | Le site |
|---|---|---|---|
| 1. Extraire | un écran de l'environnement | clique **« Exporter »** | fabrique un **.xlsx comme un vrai export**, **à partir de la base de l'élève** |
| 2. Traiter | Excel ou LibreOffice, sur le poste | écrit des **formules** | rien |
| 3. Remonter | l'environnement : **« Déposer mon fichier »** | dépose son classeur | le lit **dans le navigateur** (SheetJS, `vendor/`), contrôle **les valeurs** (comparées à **son** export, avec tolérance) et **les noms de fonctions** ; **le fichier n'est pas stocké**, seul le résultat du contrôle l'est |
| 4. Décider | le scénario | décide (message, inventaire…) | les jalons de la séance lisent les résultats déposés |

Pilote : Cdiscount ENT-2.2 (guidage), ENT-2.4 (entraînement), ENT-2.5 (évaluation), ENT-2.6 (bonus).

## 2. Règles de construction (non négociables, essai du 03/10)

1. **Export en .xlsx** ; nombres et dates **vrais** (sauf « salissures » déclarées).
2. **Fonctions anciennes et communes** seulement dans les corrigés : SOMME, MOYENNE, NB, NBVAL, SI, ET, OU, NB.SI,
   SOMME.SI, NB.SI.ENS, SOMME.SI.ENS, RECHERCHEV, SIERREUR, ARRONDI, MAX, MIN. Interdites : RECHERCHEX, FILTRE, UNIQUE,
   TRIER, LET.
3. **Contrôle de formule = présence des noms de fonctions**, jamais le texte exact (Excel écrit `FALSE`, LibreOffice
   `FALSE()` ; une autre feuille s'écrit `Tarifs!$A$2` ou `[$Tarifs.$A$2]` dans un .ods).
4. **Dépôt : .xlsx et .ods acceptés ; .csv refusé** : « Ce format perd les formules : enregistrez votre fichier en .xlsx. »
   Autre format : « Ce fichier n'est pas un classeur. »
5. Tableau croisé dynamique (Tle, plus tard) : contrôlé sur ses valeurs seulement.
6. **Tolérance sur les valeurs** (les deux logiciels ne donnent pas les mêmes décimales).
7. **Fichiers témoins** : `temoin-excel.xlsx`, `temoin-libreoffice.xlsx`, `temoin-libreoffice.ods`, dans
   `G:\Mon Drive\Travail\Logistique\1L\Claude outputs\temoins-tableur\` → **les copier** dans `outils/test/fichiers/`
   et les faire passer par les contrôles. Vérifier la version de SheetJS de `vendor/` contre celle de l'essai (0.18.5).

## 3. Ce qui existe

`core/types/tableur.js` : lecture d'un classeur (SheetJS chargé depuis `vendor/`, jamais un CDN), zone de dépôt
(clic, glisser-déposer), `controler(classeur, controles)` (cellule, liste à ordre libre, `formuleAttendue`),
`memeValeur`, pliage du texte. **À réutiliser, pas à recopier** : extraire ce qui sert dans des fonctions exportées si
besoin, sans changer le comportement des séries TAB existantes (leurs tests doivent rester verts).

## 4. API proposée (déclaration dans `creerEntreprise`)

```js
tableur: {
  exports: [{
    id: 'preparations',                 // clé, unique dans la séance
    ecran: 'commandes',                 // écran qui porte le bouton « Exporter » (commandes, stock, mouvements, receptions…)
    libelle: 'Exporter les lignes de préparation',
    fichier: 'cdiscount-preparations-allee-A.xlsx',
    feuilles: [{
      nom: 'Préparations',
      colonnes: ['Date', 'N° bon', 'Commande', 'Référence', 'Désignation', 'Emplacement',
                 'Qté préparée', 'Stock logiciel', 'Stock trouvé', 'Préparateur'],
      lignes(db) { return [[date, 'BP-732101', …], …]; },   // fonction PURE de la base
      types: { Date: 'date' },          // vraies dates
    }, {
      nom: 'Synthèse',                  // feuille d'amorce facultative (en-têtes, clés déjà écrites)
      colonnes: ['Référence', 'Nb constats'],
      lignes(db) { return [['CAB-USBC-1M', null], …]; },
    }],
    salissures: { vides: 4, doublons: 3, datesTexte: 5 },   // facultatif, déterministe (graine = élève + séance)
  }],
  depot: {
    id: 'analyse',
    libelle: 'Déposer mon fichier',
    export: 'preparations',            // l'export auquel les valeurs se comparent
    retour: 'guidage',                 // 'guidage' | 'entrainement' | 'evaluation' ; défaut : déduit de meta.temps
    controles(db) { return [ /* voir § 5 */ ]; },
  },
}
```

**Niveau standard / confirmé** : un confirmé reçoit un export plus long ; la séance le décide dans `lignes(db)` en
lisant `db.niveau` (rien à prévoir dans le moteur du geste, sinon que `lignes` reçoive bien la base).

**L'export est une fonction pure de la base** (et de la graine pour les salissures) : réexporter donne le même fichier,
et le contrôle recalcule les attendus à partir des mêmes lignes. `db.tableur.exports[id] = { at, n }` garde la trace du
premier export (un jalon « export fait » peut la lire).

## 5. Les contrôles nouveaux (en plus de ceux de `tableur.js`)

L'élève **trie, filtre, insère des colonnes** : les contrôles ne lisent jamais une adresse fixe dans une feuille de
données. Ils retrouvent :

| Type | Déclaration | Ce qu'il vérifie |
|---|---|---|
| **colonne** | `{ type: 'colonne', feuille: 'Préparations', titre: 'Écart', cle: ['N° bon', 'Référence'], attendu: (ligne) => ligne['Stock trouvé'] - ligne['Stock logiciel'], fonctions: [], formule: true, tolerance: 0.01, libelle: 'Colonne Écart' }` | trouve la colonne par son **titre en ligne 1** (pliage : casse, accents, espaces) ; retrouve chaque ligne de l'export par sa **clé** ; compare la valeur ; si `formule`, la cellule doit contenir une formule ; si `fonctions`, la formule contient ces fonctions |
| **table** | `{ type: 'table', feuille: 'Synthèse', cle: 'Référence', colonne: 'Nb constats', attendu: { 'CAB-USBC-1M': 2, … }, fonctions: ['COUNTIF'] }` | retrouve chaque clé dans la colonne de clés, lit la valeur de la colonne demandée |
| **lignes** | `{ type: 'lignes', feuille: 'Préparations', attendu: 143, libelle: 'Lignes vides et doublons supprimés' }` | compte les lignes de données non vides et sans doublon exact restant (pour ENT-2.6) |
| **liste** (existant) | `{ plage, lignes }` | inchangé |

**Noms de fonctions** : lus dans `c.f` (SheetJS) en majuscules, **nom entier** (`IF` ne doit pas être trouvé dans
`COUNTIF` ni `COUNTIFS`) ; préfixes `of:` / `_xlfn.` ignorés. Affichage à l'élève **en français** (table : SUM SOMME,
AVERAGE MOYENNE, COUNT NB, COUNTA NBVAL, IF SI, AND ET, OR OU, COUNTIF NB.SI, SUMIF SOMME.SI, COUNTIFS NB.SI.ENS,
SUMIFS SOMME.SI.ENS, VLOOKUP RECHERCHEV, IFERROR SIERREUR, ROUND ARRONDI, MAX, MIN).

Résultat d'un contrôle : `{ id, libelle, ok, justes, total, remarques: [...] }` — `justes / total` compte les lignes ou
les clés justes (une colonne de 30 lignes dont 29 justes : 29 / 30, `ok` faux).

## 6. Retour au dépôt selon le temps pédagogique (décision 9)

| Temps | Ce que l'élève voit après le dépôt | Redépôt |
|---|---|---|
| **guidage** | **détaillé, case par case** : pour chaque contrôle, juste ou non, et pour une ligne fausse sa clé et ce qui cloche (« ligne BP-732118 / CHG-20W : la cellule contient un nombre tapé, pas une formule » ; « la formule n'utilise pas SI ») | illimité |
| **entraînement** | seulement **« n résultats justes sur m »** (total des `justes` sur le total), sans dire lesquels | possible, illimité |
| **évaluation** | « Fichier reçu. » — **aucun** retour | **un seul dépôt** (un fichier refusé pour son format ne compte pas comme dépôt) ; entre dans la **copie rendue** |

Réglable par la séance (`depot.retour`). Les jalons lisent `db.tableur.depots[id] = { essais, dernier: { at, resultats },
meilleur: { at, resultats } }` : **en guidage et en entraînement, les jalons lisent le meilleur dépôt** (un redépôt moins
bon ne fait rien perdre, comme « le meilleur essai est retenu » d'ENT-2.4) ; en évaluation, l'unique dépôt.
Fonction utilitaire exportée pour les jalons : `resultatDepot(db, idDepot)` → `{ depose, essais, controles: { [id]: {…} } }`.

## 7. Où vivent les boutons (environnement d'entreprise)

- **« Exporter »** : dans l'en-tête de l'écran déclaré (`ecran`), à côté du titre, pictogramme `ICONE_TELECHARGER` de
  `tableur.js`. Pas d'export si la séance n'en déclare pas.
- **Entrée de menu « Fichiers »** (seulement si la séance déclare `tableur`) : la liste des exports (re-télécharger) et
  la **zone « Déposer mon fichier »** (pictogramme `ICONE_DEPOSER`), avec le retour du § 6.
- **Bandeau d'aide** : une séance peut déclarer `tableur.aide` (texte court : rappel SI / NB.SI…) affiché dans le
  bandeau d'aide, **jamais dans l'écran de travail** (décision 5).
- Comptage à l'aveugle (écran Inventaire) : un export ne doit **jamais** donner le stock système d'une référence en cours
  de comptage. Garde : un export déclaré sur une séance qui a un inventaire `aveugle` non validé n'expose pas la colonne
  « Stock logiciel » du jour (les stocks **historiques** des bons de préparation, oui). Le dire au compte rendu.

## 8. Copie rendue et mode réel

- `copie: true` : le dépôt fait partie de la copie ; « Rendre ma copie » fige dépôt et reste de la base ; la note de
  `noter(db)` lit `resultatDepot`. Ramassage par l'enseignant = même note.
- **Mode réel** : rien de nouveau ne part ailleurs que dans la base de l'élève (les résultats du contrôle, pas le
  fichier). Si un chemin Firebase nouveau était nécessaire : **le dire avant de coder** (règles à publier, alerte 1).
- Le **tirage d'un jeu par élève** (ENT-2.5) se fait en amont : l'export lit la base tirée, rien à prévoir ici.

## 9. Page d'essai

`outils/essai-tableur.html` : une mini-séance factice sur le catalogue Cdiscount (10 lignes de préparation, colonne
Écart, colonne SI, synthèse NB.SI), avec un sélecteur **guidage / entraînement / évaluation** pour voir les trois
retours. Tristan y dépose un fichier fait sous Excel **et** un fait sous LibreOffice.

## 10. Tests (nouveau bloc `outils/test/tableur-export.mjs`, une ligne dans `BLOCS`)

- export : même base → mêmes lignes (pureté) ; dates vraies ; salissures déterministes (même élève → même fichier ;
  deux élèves → positions différentes) et en nombre déclaré ;
- les **trois fichiers témoins** passent : valeurs à la tolérance, noms de fonctions trouvés, « nombre tapé » repéré ;
- `IF` non trouvé dans une cellule `COUNTIF` ; `COUNTIF` non trouvé dans `COUNTIFS` ;
- colonne retrouvée après tri des lignes et insertion d'une colonne ; titre « ecart » = « Écart » ;
- .csv refusé avec le message ; .ods accepté ;
- retours : guidage détaillé, entraînement « n sur m » sans détail, évaluation sans retour et second dépôt refusé ;
- meilleur dépôt retenu en entraînement ;
- **sabotages** : contrôle sur le texte exact de la formule (le témoin LibreOffice doit échouer) ; tolérance à 0 (le
  témoin LibreOffice doit échouer) ; retour détaillé en évaluation (le cas doit échouer).
- Les tests des séries TAB (`tableur.js`) restent verts.

## 11. Documentation

Une section « Geste tableur » dans `activites/FICHE-SEANCE.md` (déclaration, contrôles, retours) ; une ligne au journal
`docs/decisions.md`.

## 12. Questions — toutes tranchées

> **Réponses données d'avance par Tristan (03/10/2026, Cowork)** : ne pas s'arrêter ; appliquer ces choix et **lister au
> compte rendu** tout ce que tu as choisi seul. Si un point de l'API du § 4 se révèle mauvais dans le code, change-le et
> **décris l'API livrée** au compte rendu : les briefs C6, C7, C8, C9 s'y adapteront.

Décisions de fond : dépôt du fichier (pas de recopie) ; Excel **et** LibreOffice ; contrôle des valeurs avec tolérance
et des noms de fonctions ; retour selon le temps pédagogique ; fichier jamais stocké.

### Détails tranchés par Cowork (à corriger à l'écran par Tristan)

- [x] Module neuf `core/types/export-tableur.js` ; `tableur.js` seulement réutilisé.
- [x] Bouton « Exporter » sur l'écran déclaré + entrée de menu **« Fichiers »** (exports et dépôt au même endroit).
- [x] Contrôles **par titre de colonne et par clé**, jamais par adresse fixe, dans les feuilles de données.
- [x] Feuille « Synthèse » d'amorce possible dans l'export (en-têtes et clés déjà écrites) : choisi par chaque séance.
- [x] **Meilleur dépôt** retenu en guidage et entraînement ; dépôt unique en évaluation ; fichier refusé ≠ dépôt.
- [x] Textes : « Ce format perd les formules : enregistrez votre fichier en .xlsx. » ; « Ce fichier n'est pas un
  classeur. » ; évaluation : « Fichier reçu. » ; entraînement : « n résultats justes sur m. »
- [x] Noms de fonctions affichés en français (table du § 5).
- [x] Garde « comptage à l'aveugle » du § 7.
- [x] Nom de la page d'essai : `outils/essai-tableur.html` ; du bloc de tests : `tableur-export`.

---

## Compte rendu *(rempli par Claude Code)*

- **Fichiers créés / modifiés** : `core/types/export-tableur.js` (neuf), `core/types/classeur.js` (neuf : le chargement de
  SheetJS, les pictogrammes, `pliage`, `memeValeur`, `controler`… sortis **sans changement** de `tableur.js` et
  `numerique.js`, qui les réexportent — il fallait pouvoir les importer hors navigateur), `core/types/entreprise.js`
  (câblage), `styles/base.css` (5 règles, aucune variable), `contenus/cdiscount.js` (`lignesPreparation(db, CAT, filtre)`,
  pure, pour les séances), `outils/essai-tableur.html` + `outils/essai-tableur.js` (page d'essai),
  `outils/test/tableur-export.mjs` (19 cas), `outils/test/fichiers/` (les 3 témoins, copiés à l'identique, empreintes
  vérifiées), **`outils/test.mjs` (une ligne dans `BLOCS`)**, `activites/FICHE-SEANCE.md` (section « Geste tableur »).
- **API livrée** — la déclaration du § 4 telle quelle, avec ces précisions :
  - `feuilles[].lignes(db)` rend des tableaux ; une date est un **horodatage (ms)** déclaré dans `types` (`'date'` ou
    `'dateHeure'`) ; `feuilles[].aveugle: ['Stock logiciel']` = colonnes retirées tant qu'un comptage à l'aveugle n'est
    pas validé (garde du § 7, **à déclarer par la séance**) ;
  - contrôles : `colonne` (`titre`, `cle`, `attendu(ligne)` où `ligne` = la ligne **propre** de l'export en objet
    `{ 'Stock trouvé': 45, … }`, `filtre(ligne)` facultatif, `formule`, `fonctions`, `tolerance`), `table` (`cle`,
    `colonne`, `attendu: { clé: valeur }` ; **son résultat porte aussi `lu: { clé: valeur lue }`**, ajouté pour ENT-2.2), `lignes` (`attendu`), `cellule` et liste (ceux de `tableur.js`, + `fonctions`) ;
    chaque contrôle a un `id` et un `libelle` ;
  - fonctions en **noms anglais** de SheetJS (`IF`, `COUNTIF`, `COUNTIFS`, `VLOOKUP`, `IFERROR`…), nom entier ;
    tolérance par défaut **1e-6** (`tolerance: null` = exacte) ;
  - `resultatDepot(db, idDepot)` → `{ depose, essais, at, controles: { [id]: { id, libelle, ok, justes, total, remarques } } }`
    (meilleur dépôt ; en évaluation l'unique) ; aussi `exportFait(db, idExport)`, `totalJustes(liste)`,
    `totalControles(liste)` ; état : `db.tableur.exports[id] = { at, n }`, `db.tableur.depots[id] = { essais, dernier,
    meilleur }` (`{ at, fichier, resultats }`) ;
  - pour une séance : `import { resultatDepot } from '../core/types/export-tableur.js'` fonctionne aussi dans Node (tests).
- **Ajouts du 04/10 (pour ENT-2.6)** : `salissures.cible(ligne)` + `doublonsCible` / `datesTexteCible` (au moins ce nombre
  de salissures sur les lignes visées) ; contrôle `lignes` : `colonneDate: 'Date'` (plus aucune date écrite en texte) ;
  contrôle `table` : `fonctionsFeuille: ['VLOOKUP']` (la fonction doit figurer quelque part dans la feuille).
- **Écarts par rapport au brief** : le « bandeau d'aide » n'existait pas : c'est un bouton **« Rappel tableur »** dans
  le bandeau de l'entreprise, qui déplie une ligne de rappel sous le bandeau (hors de l'écran de travail ; il reste
  cliquable après la remise de la copie). La graine des salissures est `uid` de l'élève (à défaut prénom + nom) +
  `id` de la séance + `id` de l'export. `.xlsm` accepté en plus.
- **Décisions prises en route** : un fichier qui n'est pas une archive zip (texte renommé en .xlsx) est refusé avant
  lecture (« Ce fichier n'est pas un classeur. ») ; le meilleur dépôt est remplacé à égalité (le plus récent des
  meilleurs) ; une feuille introuvable par son nom est prise si le classeur n'en a qu'une ; un doublon de salissure
  n'est jamais tiré d'une ligne à date en texte (le nombre de dates en texte reste celui déclaré) ; « Exporter »
  télécharge à chaque clic (seul le premier export est tracé) ; en évaluation, la zone de dépôt disparaît après le dépôt.
- **Règles Firebase** : non modifiées (tout vit dans la base de l'élève de la séance, chemin existant).
- **Tests** : bloc `tableur-export` 19/19 — export pur, vraies dates, salissures déterministes ; noms de fonctions ;
  colonne retrouvée après tri et insertion ; nombre tapé, SI absent, COUNTIFS au lieu de COUNTIF repérés ; les 3
  témoins passent (E13 « nombre tapé » repéré) ; sabotages « texte exact de la formule » et « égalité exacte » font
  échouer LibreOffice ; à l'écran : export réel téléchargé, rappel dans le bandeau, guidage détaillé, entraînement
  « n sur m » et meilleur retenu, évaluation « Fichier reçu. » et second dépôt refusé, .csv / .txt / faux .xlsx refusés
  sans compter, .ods accepté. Sabotage « retour détaillé en évaluation » → le cas tombe. Séries TAB vertes. Suite
  entière 516/516.
- **Commits** : « Geste tableur : Exporter, Déposer, contrôles et retours selon le temps (C5) ».
- **Reste ouvert** : **le témoin « Excel » n'a probablement jamais été réenregistré par Excel** (contenu identique
  au fichier « à ouvrir dans Excel », seul un octet diffère) : à refaire un jour à la main pour un vrai essai Excel.
  Tristan doit déposer à l'écran un fichier Excel ET un LibreOffice sur `outils/essai-tableur.html`.

## Retours de Tristan du 04/10/2026 (à traiter dans un chantier à part)

1. **« Rappel tableur »** : il doit bien parler du **format « texte »** et de la **cellule A1**, **avec les guillemets**.
   *Compréhension de Claude Code, à confirmer avant d'écrire* : expliquer qu'un critère texte s'écrit entre guillemets
   (`=NB.SI(B:B;"Cassé")`), qu'une référence de cellule s'écrit sans guillemets (`=NB.SI(B:B;A1)`), et qu'un nombre
   « au format texte » n'est pas compté comme un nombre.
2. **Menu « Fichiers » (l'export)** : il ne respecte pas le geste d'entreprise : **l'élève doit choisir ce qu'il exporte**
   (aujourd'hui l'export déclaré par la séance part tel quel).
