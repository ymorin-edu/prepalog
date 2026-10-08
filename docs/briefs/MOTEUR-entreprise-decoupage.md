# Brief de chantier moteur — MOTEUR-entreprise-decoupage : découper `entreprise.js` en modules (lot 9c)

**Statut** : en cours *(à valider → en cours → livré)* — validé par Tristan le 08/10/2026 ; **passes 1 et 2 (modules 1 à 9) livrées** ; décision : 9c s'arrête à ≈ 1 850 lignes (chaque écran de données dans son fichier), le « 9c bis » viendra plus tard
**Date** : 08/10/2026 — cadrage Opus (lecture seule), d'après `core/types/entreprise.js` à 3 461 lignes (commit `2ba3243`).
**Modèle** : **Sonnet** pour chaque module, un module par conversation ou presque (voir §8).
**Fichiers** : `core/types/entreprise.js` + un fichier nouveau par module dans `core/types/`. **Rien dans `styles/`, `contenus/`,
`activites/` ni `outils/test/`.** Un seul chantier à la fois dans `entreprise.js` : s'inscrire dans `docs/EN-COURS.md`.

**En une phrase pour Tristan** : on range le fichier en tiroirs, **rien ne doit changer à l'écran**. La preuve à chaque tiroir :
la suite de tests verte, et le texte des écrans relevé avant et après, identique octet pour octet.

Légende : **VÉRIFIÉ** = lu dans le code ; **SUPPOSÉ** = déduit sans l'avoir exécuté.

## 1. La carte du fichier aujourd'hui (VÉRIFIÉ, numéros de lignes de `2ba3243`)

| Zone | Lignes | Taille | Ce qu'elle lit de la fermeture | Destin |
|---|---|---|---|---|
| Imports, formats (`eur`, `fdt`, `norm`, `pad`, `pastille`) | 1–42 | 42 | rien | formats → `entreprise-outils` |
| Table `OPTIONS`, `controlerOptions`, `controlerIdentifiants` | 44–146 | 103 | rien (fonctions pures) | `entreprise-options` |
| Lecture des options, création des vues, contrôle des gestes | 148–298 | 151 | `U`, `CATALOGUE`, `COPIE` | **reste** |
| Aides « articles » (`label`, `precision`, `tdVariante`…) + menu | 300–341 | 42 | `CATALOGUE`, `VOCAB`, `U.couleurs`, `U.livraisons`, `U.menu`, `U.fermetures` | articles → `outils` ; menu **reste** |
| Note d'une base, jalon qui plante (`noterBase`, `signaler`) | 343–455 | 113 | `etapes`, `U`, `MQ`, `VDOC`, `VPL`, `VENT`, `quaiDeBase` | **reste** |
| `rendre` : gardes, base neuve, aisance, volet, déclencheurs | 461–617 | 157 | `ctx`, `db`, `volet`, `VTOUR`, `VQUAI`, `VPL` | **reste** |
| État d'écran `E` | 619–637 | 19 | `estProf`, `U.stockOuvert` | **reste** (partagé, voir §4) |
| Cartes des messages (`majCartes`, `PILE`) | 639–709, 931–943 | 84 | `db`, `MQ`, `estProf`, `rendue`, `aller`, `ouvrirMail`, `dessiner` | reste (9c bis) |
| Questions au fil (arrivée, panneau, gel, sorties de page) | 710–929 | 220 | `MQ`, `db`, `E.vue`, `COPIE`, `sauver`, `dessinerVue`, `aller`, `noterBase`, `fini` | reste (9c bis) |
| Thème (`styleTheme`, `accentRougeOuVert`, `surCouleur`) | 945–1039 | 95 | `THEME` seul | `entreprise-theme` |
| `habiller` / `deshabiller`, lexique, temps passé, sortie | 1041–1099 | 59 | `VDOC`, `ctx`, `rendue`, `copie` | **reste** |
| Copie, correction, `sauver`, `signal`, `ajouterMail` | 1101–1143 | 43 | `ctx`, `db`, `declencher`, `remonterEtapes` | **reste** |
| Stock et tiers (`stockDe`, `mouvement`, `clientDe`, `codeSuivant`) | 1136, 1144–1156 | 14 | `db`, `prenom`, `CUSTOMERS`, `CM`, `SUPPLIERS` | `entreprise-base` |
| Bandeau de fin (`groupesDuBilan`, `bandeauAncien`, `bandeauFin`) | 1158–1293 | 136 | `etapes`, `noterBase`, `fini`, `CORRECTION`, `PREMIER_ESSAI`, `SUITE_AU_BILAN`, `ctx.suivante`, `ctx.meta`, `MQ`, `db`, `U.finFige` | `entreprise-fin` (≈107) |
| `corriger`, note du suivi, photo de fin, repérage | 1295–1428 | 134 | tout le cœur | **reste** |
| Aides des commandes (`totaux`, `statutCommande`, `corpsMailCommande`) | 1430–1486 | 57 | `db`, `VM`, `label`, `clientDe`, `livraisonDe`, `ENTREPRISE` | `entreprise-commandes` |
| `dessiner` (bandeau du haut, menu), bouton replier | 1488–1636 | 149 | presque tout | **reste** |
| Copie rendue, verrou, gel, `figerVue` | 1638–1736 | 99 | `copie`, `rendue`, `MQ`, `hote` | reste (9c bis possible) |
| Étiquette, `aller`, `dessinerVue`, `reinitialiser` | 1738–1834 | 97 | tout | **reste** |
| Accueil | 1836–1880 | 45 | `db`, `accueil`, `VARIANTS`, `stockDe`, `statutCommande` | reste (9c bis) |
| Messagerie | 1882–2109 | 228 | voir §2, module 13 | `entreprise-messagerie` |
| Commandes, bon de préparation | 2111–2294 | 184 | `db`, `E.no`, `VM`, `sortirFifo`, `clientDe`… | `entreprise-commandes` |
| Réceptions, bon de livraison | 2296–2520 | 225 | `db`, `E.no`, `VM`, `SUP_BY_ID`, `U.receptionLitige`… | `entreprise-receptions` |
| Lots (`restesParLot`, `sortirFifo`) | 2522–2552 | 31 | `db`, `stockDe`, `mouvement` | `entreprise-base` |
| Blocage qualité (+ `resteDuLot`) | 2554–2641 | 88 | `db`, `E.blocage`, `VM`, `stockDe`, `mouvement` | `entreprise-blocage` |
| Branchement des vues (transport, inventaire, tableur, quai, planning, entrepôt, fiche, animation, chrono, tournée) | 2643–2880 | 238 | `db`, `ctx`, `sauver`, `dessinerVue`, `rendreLaCopie`… | **reste** |
| Catalogue, fiche produit | 2882–2938 | 57 | `MODELS`, `MM`, `COLORS`, `SUP_BY_ID`, `aller` (pas `db`) | `entreprise-catalogue` |
| Stock | 2940–3020 | 81 | `db`, `E.onglet`, `E.stockOuvert`, `inventaireBloque`, `VINV` | `entreprise-stock` |
| Tiers (clients, fournisseurs) | 3022–3064 | 43 | `E.vue`, `tousClients`, `tousFournisseurs` | `entreprise-tiers` |
| Console (`CMDS`, `executer`) | 3066–3330 | 265 | `db`, `E.console`, catalogue, `stockDe`, `sortirFifo`, `totaux`, `inventaireBloque`, `sauver`, `aller` | `entreprise-console` |
| `brancher(z)` (tous les clics) | 3332–3442 | 111 | tout ; ≈ 80 lignes appartiennent aux écrans de données | ≈ 31 restent |
| Ouverture finale | 3444–3458 | 15 | `declencher`, `remonterEtapes`, `copie` | **reste** |

**Ce que dit la carte.** Les écrans de données ne lisent presque rien du cœur (`db`, `E`, `hote`, `sauver`, `dessiner`, `aller`,
le catalogue) : ils s'extraient. Les questions au fil, les cartes, la copie, la note et le menu lisent **tout** : ils restent.
Trois liens cachés à connaître : le cœur appelle la messagerie (`ouvrirMail` aux lignes 834 et 940, `docVu` / `compterDoc` dans
`apiFiche` l. 2790) ; le menu et l'accueil comptent les commandes et réceptions (`statutCommande` l. 1491 et 1839) ;
`corriger()` écrit l'état de la messagerie (`E.brouillon`, `E.mailSel`, l. 1319–1327).

## 2. Les modules à extraire, du plus sûr au plus risqué

Tailles = lignes qui quittent `entreprise.js` (zone + ses lignes de `brancher`), arrondies ; « reçoit » = la liste exacte passée.

| # | Fichier | Emporte (lignes) | Taille | Reçoit | Rend |
|---|---|---|---|---|---|
| 1 | `entreprise-options.js` | 44–146 | ≈ 103 | rien (pur) | `OPTIONS`, `controlerOptions(U)`, `controlerIdentifiants(familles)` |
| 2 | `entreprise-theme.js` | 945–1039 (+ 984–986) | ≈ 95 | `THEME` en paramètre | `styleTheme(THEME)`, `accentRougeOuVert(h)` |
| 3 | `entreprise-outils.js` | 34–42, 300, 306, 310, 328–341 | ≈ 25 | `creerArticles({ CATALOGUE, VOCAB, couleurs })` | formats ; `SIMPLE`, `unite`, `label`, `nomCouleur`, `swatch`, `precision`, `precisionTexte`, `thVariante`, `tdVariante`, `etatStock`, `pastilleStock`, `REF_EX`, `MODELE_EX` |
| 4 | `entreprise-fin.js` | 1166–1180, 1184–1190, 1207–1281 | ≈ 107 | `bandeauFin(st, { etapes, correction, premierEssai, suiteAuBilan, suivante, reinitialisable, avecQuestions, finFige, retours, peutCorriger })` | le HTML du bandeau (pur) |
| 5 | `entreprise-base.js` | 1136, 1144–1156, 2522–2552, 2555–2562 | ≈ 52 | `{ db, prenom, CUSTOMERS, CM, SUPPLIERS }` | `stockDe`, `mouvement`, `restesParLot`, `sortirFifo`, `resteDuLot`, `tousClients`, `tousFournisseurs`, `clientDe`, `codeSuivant` |
| 6 | `entreprise-tiers.js` | 3022–3064 | ≈ 44 | `{ E, hote, VOCAB, A, B }` | `vues: { clients, fournisseurs }`, `brancher`, `apres` |
| 7 | `entreprise-catalogue.js` | 2882–2938 | ≈ 59 | `{ E, hote, A, MODELS, MM, VARIANTS, VOCAB, SUP_BY_ID, couleurs, aller }` | `vues: { catalogue, produit }`, `brancher`, `apres` |
| 8 | `entreprise-stock.js` | 2940–3020, 3404–3411 | ≈ 90 | `{ db, E, hote, A, MODELS, VARIANTS, VINV, B, inventaireBloque, codeStock: () => ctx.codeStock, dessinerVue }` | `vues: { stock }`, `brancher`, `apres` |
| 9 | `entreprise-blocage.js` | 2570–2641, 3401 | ≈ 74 | `{ db, E, hote, A, VM, VOCAB, B, sauver, dessinerVue }` | `vues: { blocage }`, `brancher` |
| 10 | `entreprise-commandes.js` | 1430–1486, 2111–2294, 3376, 3388–3400, 3402–3403 | ≈ 258 | `{ db, E, hote, prenom, ENTREPRISE, A, VM, VOCAB, livraisons: U.livraisons \|\| {}, B, sauver, dessiner }` | `vues: { commandes, commande }`, `brancher`, `statutCommande`, `totaux`, `livraisonDe`, `preparer`, `corpsMailCommande`, `aFaire()` |
| 11 | `entreprise-receptions.js` | 2296–2520, 3377–3384 | ≈ 233 | `{ db, E, hote, ENTREPRISE, A, VM, SUP_BY_ID, litige: !!U.receptionLitige, B, sauver, dessiner }` | `vues: { receptions, reception }`, `brancher`, `receptionDe`, `bonDeLivraison`, `aRecevoir()` |
| 12 | `entreprise-console.js` | 3066–3330, 3417–3420, 1796 | ≈ 270 | `{ db, E, hote, A, MODELS, MM, VM, VARIANTS, VOCAB, CUSTOMERS, SUPPLIERS, SUP_BY_ID, B, COM, inventaireBloque, sauver, aller, dessinerVue }` | `vues: { console }`, `brancher`, `apres` |
| 13 | `entreprise-messagerie.js` | 1882–2109, 3338–3375 | ≈ 265 | `{ db, E, hote, prenom, estProf, rendue, A, VOCAB, VARIANTS, SUP_BY_ID, B, COM, REC, VDOC, VFICHES, vueDeFiche, VINV, VQUAI, MQ, SEANCE, reponsesFournisseur: U.reponsesFournisseur \|\| [], ajouterMail, declencher, accuseCorrection, etapeQuiFerme, sauver, dessiner, dessinerVue, aller }` | `vues: { mail }`, `brancher`, `ouvrirMail`, `docVu`, `compterDoc` |

`A` = l'objet rendu par `creerArticles` (module 3), `B` = celui de `monterBase` (5), `COM` = commandes (10), `REC` = réceptions (11).

**Jalons et `db` qui les traversent, couverture, pièges (VÉRIFIÉ sauf mention).**

1. **Options.** Aucun jalon. Blocs : `dependances` (cas des options et de la fabrique), `socle` (les 24 séances se chargent). **Piège** :
   le cas `dependances.mjs:337` relit **le texte d'`entreprise.js`** pour y trouver les `U.xxx` et la ligne `const { … } = U;`, et
   importe `OPTIONS` depuis `entreprise.js` : garder ces lectures dans `entreprise.js` et y ré-exporter `OPTIONS`
   (`export { OPTIONS } from './entreprise-options.js'`). La phrase « Ajouter une option = ajouter sa ligne ici » de
   `FICHE-SEANCE.md` change d'adresse (une ligne de doc).
2. **Thème.** Aucun jalon. Blocs : `boost` (encre sur la menthe), `smoby` (travail neutre), `picard`, `cdiscount` (papier).
   **Piège** : les 43 valeurs recopiées de `base.css` / `entrepot.css` (l. 996–1008) partent telles quelles (dédoublonnage = C12).
3. **Outils.** Aucun jalon. **Pièges** : ne pas l'appeler `entreprise-commun.js` (existe dans `contenus/`) ; un module n'importe
   **jamais** `entreprise.js` (import circulaire) ; `entreprise.js` ré-exporte `eur`, `fdate`, `fdt`, `norm`, `normLoc`
   (exports publics, importés par personne aujourd'hui).
4. **Fin.** Lit le détail de `noterBase`. Blocs : `spartoo` (ancien bandeau), `smoby` (bandeau par blocs, Corriger, premier essai,
   jalon qui plante, l. 2711–2730, 3561–3605), `questions` (retours au bilan, l. 301). **Non couverts** : la phrase `finFige`
   (`data-fin-fige`, ENT-5.4) et `data-fin-questions`. **Pièges** : `bilanComplet`, `sansFaux`, `ecransAFaire`, `retoursAuBilan`,
   `majBandeauFin`, `brancherBandeauFin` restent au cœur (la note et `corriger` s'en servent) ; `U.finFige` est passé par nom.
5. **Base.** Écrit `db.stock`, `db.moves`, `db.customers`, `db.suppliers`. Blocs : `spartoo` (FIFO, `.getlot`), `cdiscount`,
   `inventaire` (ajustements). **Piège** : `reinitialiser` vide `db` puis le reremplit (l. 1808–1830) : même objet, mais
   **tableaux neufs** → toujours relire `db.moves`, `db.stock`, jamais les garder dans une variable.
6. **Tiers.** Aucun jalon. **Aucun bloc ne l'ouvre** (`smoby.mjs:3469` ne vérifie que la présence au menu), alors que
   **Clients** est au menu des Boost ENT-3.1 à 3.3 et de Spartoo : capture obligatoire. **Piège** : `[data-filtre]` est partagé
   par catalogue, stock et tiers (l. 3412–3416) ; chaque module ne branche le sien **que sur son écran** (`E.vue`), sinon le
   filtre du stock appellerait `majCatalogue` et planterait (`#cQ` absent).
7. **Catalogue.** Blocs : `dependances` (pastilles Spartoo, fiche produit), `inventaire` (catalogue simple, `CAL-SCI`).
   **Non couvert** : la recherche et les filtres. `apres` = `majCatalogue` (l. 1793).
8. **Stock.** Blocs : `cdiscount` (code, onglet Mouvements), `inventaire` (comptage à l'aveugle), `entrepot`. **Non couverts** :
   filtres `#sQ`/`#sB`/`#sS`, code faux. **Pièges** : `inventaireBloque` reste au cœur (la console s'en sert) ; `#codeStock`,
   `[data-deverrouiller]`, `[data-onglet]` sont nommés dans la liste du gel (l. 1703–1704) : ne pas renommer.
9. **Blocage.** Écrit `db.stock`, `db.moves`. Bloc : `spartoo` (cas 35). État `E.blocage`, `E.erreurBlocage`, `E.okBlocage`.
10. **Commandes.** Écrit `db.orders[].prep`. Jalons Spartoo/Cdiscount lus sur `prep`. Blocs : `spartoo`, `cdiscount` (annulée,
    boutons), `dependances` (livraison inconnue), `amenagements`. **Non couvert** : « Copier le bon en texte ». **Pièges** :
    `majChamp` ne redessine pas (la case garde le focus, l. 2204–2207) ; le bouton du bon rappelle `brancher(b)` sur le seul bloc
    du bon (l. 3397 ; il n'y a dedans que `[data-valider]` et `[data-copier]`) → le module rappelle **son** `brancher(b)` ;
    `U.livraisons` reste lu dans `entreprise.js`.
11. **Réceptions.** Écrit `db.receptions[].ctrl`, `db.stock`, `db.moves`. Blocs : `spartoo` (confirmation, l. 432–441),
    `smoby` (ENT-5.5 litige), `cdiscount`, `picard`. **Pièges** : le drapeau `confirmeRec` (l. 2488) vit **dans le montage**
    (une ouverture), jamais en haut du fichier : les tests montent plusieurs hôtes dans la même page (`#hote22`, `#hoteR`,
    `#invTest`) ; pas de redessin pendant la saisie (l. 2474–2475).
12. **Console.** Écrit via `.addclient`, `.addsupplier`, `.setstock`, `.addstock`, `.removestock`. Blocs : `spartoo`, `cdiscount`,
    `inventaire`, `dependances`. **Commandes jamais jouées par un test** : `.find`, `.getprice`, `.getclient`, `.getsupplier`,
    `.addclient`, `.addsupplier`, `.addstock`, `.removestock`, `.stockvalue`, `.clear`. **Pièges** : `E.console` est initialisé
    dans `E` (l. 632) et y reste ; `executer` remet le focus sur `#champCmd` (l. 3329) ; `.clear` remplace `E.console`.
13. **Messagerie.** Écrit `db.mails`, `db.orders` (« Enregistrer la commande »), `db.indicateurs[séance].docs`. Jalons « réponse
    par phrases » et déclencheurs `apresMail`. Blocs : `spartoo`, `cdiscount`, `smoby` (phrases, pièces jointes), `questions`
    (cadenas, cartes), `picard` (retour au quai), `boost`, `amenagements`. **Pièges** : le drapeau `confirmeEnvoi` (l. 1990) dans
    le montage ; trois focus à garder (`[data-pj-retour]` l. 3346, `[data-repondre]` et son curseur l. 3352–3364, `[data-phrase]`
    sans redessin l. 3367–3374) ; `corriger()` et `apiQuai.messagerie` écrivent `E.brouillon`, `E.mailSel`, `E.retourQuai` ;
    **France Boissons ENT-6.1 §7.1** demande « Transférer à… » dans la messagerie : ce chantier se fait **après** l'extraction,
    jamais en même temps.

**Candidats ajoutés** : options, thème, outils, base (purs ou sans écran, ils simplifient les suivants) et blocage (écran de
données à part entière, l. 2570). **Écartés de 9c** : accueil et cartes, qui lisent les questions au fil et la copie (cœur).

## 3. Ce qui reste dans `entreprise.js`, et pourquoi

Lecture des options, création et contrôle des vues (l. 148–298), note d'une base, base neuve, aisance, volet, déclencheurs,
`E`, cartes, questions au fil, copie rendue, verrou, gel, `sauver`, `signal`, `ajouterMail`, `corriger`, note du suivi, photo de
fin, repérage, `dessiner` (bandeau, menu, fermetures), `aller`, `dessinerVue`, `reinitialiser`, accueil, branchement des vues
(quai, planning…) et le reste de `brancher`. **Raison** : ce sont les endroits que **toutes** les séances traversent et qui lisent tout ; les découper
demanderait de changer leur façon de communiquer, c'est-à-dire un changement de comportement possible.

## 4. Le contrat commun

```js
// core/types/entreprise-<écran>.js — un écran de données, monté à chaque ouverture (il lit la base de CET élève).
import { ech, toast } from '../ui.js';                    // les aides du site s'importent, comme dans fiche.js
import { eur, fdt } from './entreprise-outils.js';        // jamais d'import d'entreprise.js
export function monter<Écran>({ db, E, hote, … }) {      // la liste EXACTE de ce que l'écran lit et demande
  let confirme = false;                                  // un état d'une ouverture vit ici, jamais en haut du fichier
  return {
    vues: { <écran>: () => html },                       // entre telle quelle dans la table de dessinerVue (l. 1766)
    brancher(z) { … },                                   // appelé par brancher(z) ; ses seuls sélecteurs, gardés par E.vue
    apres(z) { … },                                      // facultatif : ce que dessinerVue faisait après le dessin (l. 1793–1796)
    …services,                                           // facultatif, nommés : ce que le cœur ou un autre écran appelle
  };
}
// Dans rendre, après la définition de `sauver` (l. 1126 ; avant, une constante n'existe pas encore) :
const COM = monterCommandes({ db, E, hote, prenom, ENTREPRISE, A, VM, VOCAB, livraisons: U.livraisons || {}, B, sauver, dessiner });
```

Règles : **ni `ctx` ni `U` ni `...`** passés à un module (une option passe par son nom, ce qui garde la lecture `U.xxx` dans
`entreprise.js` pour le test des options) ; ce qui change pendant la séance passe en **fonction** (`rendue`, `codeStock`) ;
`E` est passé entier, mais chaque module ne touche que ses clés (tiers : `vue` ; stock : `onglet`, `stockOuvert`,
`erreurCode` ; blocage : `blocage`, `erreurBlocage`, `okBlocage` ; commandes et réceptions : `no` ; catalogue : `ref` ;
console : `console` ; messagerie : `mailSel`, `dossier`, `redige`, `piece`, `vus`, `brouillon`, `retourQuai`). Aucun attribut
`data-*` ni `id` ne change (le gel, le verrou et les tests les nomment). Les modules purs (1 à 4) n'ont pas de `monter` : des
fonctions exportées à paramètres nommés. **Différence avec `fiche.js`** : une fiche est créée une fois par séance avec sa
déclaration (`creerFiche(F, VDOC)`) et reçoit son état à chaque dessin ; un écran de données n'a pas de déclaration et lit toute
la base, il est donc monté à chaque ouverture.

## 5. Le compte

| Après | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Lignes (≈, branchements déduits) | 3 360 | 3 270 | 3 250 | 3 150 | 3 100 | 3 060 | 3 000 | 2 920 | 2 845 | 2 590 | 2 365 | 2 105 | **≈ 1 850** |

**1 500 n'est pas atteint avec les écrans seuls** (SUPPOSÉ à ± 50 lignes : chaque branchement coûte 3 à 7 lignes). Pour passer
dessous, il faudrait sortir aussi des morceaux du cœur (« 9c bis ») : cartes des messages (≈ − 75), branchement des questions au
fil (≈ − 195), accueil (≈ − 40), copie rendue et verrou (≈ − 80) → **≈ 1 460**. Les questions au fil datent d'aujourd'hui et ne
sont jouées par aucune séance (seulement l'essai et le bloc `questions`) : peu de risque en classe, mais un seul bloc de tests ;
la copie rendue porte les évaluations. **Proposé** : finir 9c à ≈ 1 850 et écrire dans `chantiers.md` « fini quand chaque écran de
données est dans son fichier » ; 9c bis plus tard, une fois les questions au fil stabilisées.

## 6. La preuve à chaque étape

Méthode du chantier 8 : `ecran.mjs` (scratchpad de la session, `C:\Users\trist\AppData\Local\Temp\claude\C--Users-trist-Documents-GitHub-prepalog\da5e888e-3313-42ca-99c3-8fc1cfddb77a\scratchpad`)
monte une séance avec l'heure et le hasard figés, parcourt les écrans et écrit leur texte (et du HTML) dans un JSON ; `SERVE=`
lui fait servir un autre dossier. **Avant** = `git archive HEAD` dépaqueté dans le scratchpad (rien ne change dans le dépôt),
**après** = l'arbre de travail ; comparer les deux JSON (identiques octet pour octet, sinon on s'arrête). Le script sert
aujourd'hui messagerie, commandes, bon, catalogue, clients, stock, `.getorder` : il faut l'étendre une fois (≈ 45 min, au module 6).

| # | Blocs ciblés avant la suite | Capture avant / après (séances) |
|---|---|---|
| 1 | `dependances socle` | `capture.mjs` (24 séances : meta et options) + texte des refus d'options |
| 2 | `boost smoby picard cdiscount` | attribut `style` de `body` et de `.ent-page`, classes `ent-travail-neutre*` : 24 séances |
| 3 | `spartoo cdiscount inventaire dependances` | `ecran.mjs` tel quel : ENT-1.1 à 1.3, six Cdiscount |
| 4 | `spartoo smoby questions` | bandeau (`[data-fin-seance]`) d'ENT-1.1, 5.1, 5.3, **5.4 avec la phrase `finFige`** (obligatoire) |
| 5 | `spartoo cdiscount inventaire` | `.getlot`, Mouvements, blocage : ENT-1.3, ENT-2.x |
| 6 | `socle boost` (**aucun bloc ne joue l'écran**) | **obligatoire** : Clients et Fournisseurs, filtre tapé : ENT-3.1, ENT-1.1, ENT-1.2, ENT-2.4 |
| 7 | `dependances inventaire` | catalogue + fiche produit + **filtres tapés** : Spartoo, deux Cdiscount |
| 8 | `cdiscount inventaire entrepot` | verrouillé, code faux, déverrouillé, **filtres**, Mouvements, aveugle : ENT-1.2, ENT-2.3, ENT-5.5 |
| 9 | `spartoo` | refus (lot vide, référence inconnue, trop) et blocage réussi : ENT-1.3 |
| 10 | `spartoo cdiscount dependances amenagements` | liste, commande, annulée, bon, validation, **copier le bon** : ENT-1.2, 1.3, six Cdiscount |
| 11 | `spartoo smoby cdiscount picard` | liste, annoncée, sans colis, saisie, confirmation, validée : ENT-1.1, ENT-5.5, ENT-2.4 |
| 12 | `spartoo cdiscount inventaire dependances` | **obligatoire : les 19 commandes**, avec et sans argument, et deux erreurs : Spartoo et Cdiscount |
| 13 | `spartoo cdiscount smoby questions picard boost amenagements` | chaque mail ouvert, nouveau message (fournisseur : sans référence, sous et au-dessus du minimum), réponse, phrases, pièce jointe : ENT-1.1, 1.2, 5.1, 5.2, 4.3 |

Puis **la suite entière** (`node outils/test.mjs`, ≈ 13 min) avant chaque commit. Écrans qu'aucun test ne joue (capture
obligatoire) : Clients, Fournisseurs, recherche du catalogue, filtres du stock, code faux, copier le bon, phrase `finFige`,
dix commandes de console sur dix-neuf.

## 7. Ce qu'on ne fait pas dans 9c

Pas de dédoublonnage (C11, chantier 14) ; pas de changement de comportement ni de texte ; pas de renommage d'option, d'attribut
`data-*` ou d'`id` ; rien dans `styles/` ; aucun test réécrit (le plan n'en demande aucun ; si un cas devait changer : le dire à
Tristan avant) ; pas de correction des points ci-dessous ; pas de chantier France Boissons dans `entreprise.js` en même temps.

### Vu en passant (non corrigé)

- **Bug** : `majStock`, l. 3018 : `colspan="${SIMPLE ? 6 : 8}"` est entre apostrophes simples, donc écrit tel quel dans la page
  (« Aucun résultat. » tient dans une seule colonne). VÉRIFIÉ. La capture du module 8 doit le retrouver **à l'identique**.
- Deux constantes `MENU` : l. 320 (écrans gardés au menu) et l. 1628 (libellés du bouton replier), la seconde cache la première
  dans `rendre`. À ne pas confondre en passant `MENU` à un module.
- Comptes du menu calculés deux fois à l'identique (l. 1490–1492 et 1838–1840) ; recherche d'un fournisseur écrite quatre fois
  avec trois replis différents (l. 2077, 2308, 2365, 2386) ; trois formats d'heure (`fdt`, `jourHeure` l. 1449, `heureDe` l. 1656).
- `reinitialiser` passe par la boîte `confirm()` du navigateur (l. 1800), que le commentaire de la copie (l. 1639–1640) dit à éviter.
- Écritures pendant un dessin : `vueTournee` appelle `sauver()` (l. 2878), `etatInventaire` sauve (l. 2671–2672).
- `.addsupplier` pose `moq: 16` en dur (l. 3245) ; `.getstock <modèle>` reconstruit la référence au format Spartoo
  `modèle-couleur-taille` (l. 3092, 3152 ; reliquat C15).

## 8. Durée

Ce qui prend le temps : la suite complète (≈ 13 min à chaque module), les blocs ciblés (`picard` ≈ 4 min, `smoby` ≈ 3 min), les
captures ; l'écriture elle-même est courte.

| # | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Durée (≈) | 40 min | 50 min | 45 min | 1 h 10 | 45 min | 1 h 15 (+ script) | 40 min | 1 h | 50 min | 1 h 15 | 1 h 25 | 1 h 20 | 1 h 45 |

**Total ≈ 13 h 30**, en quatre conversations Sonnet (1–4, 5–9, 10–11, 12–13 : repartir de zéro après chaque commit poussé).
Chaque module = un commit, poussé quand la suite est verte ; **un push est en ligne pour les élèves** : éviter la veille d'une
séance Spartoo, Boost, Cdiscount ou Smoby, et le dire.

**Version courte** : modules 1, 2 et 3 (purs, aucun écran déplacé) → **≈ 3 250 lignes**, ≈ 2 h 15. Elle ne gagne que 210 lignes,
mais pose le contrat et les outils dont tous les écrans auront besoin. Version moyenne : jusqu'au module 9 → ≈ 2 845, ≈ 7 h.

**Question pour Tristan** : on accepte de finir 9c vers 1 850 lignes (les écrans seuls), ou on veut les 1 500, avec le « 9c bis »
qui touche aussi les questions au fil et la copie rendue ?

## Compte rendu *(rempli à la livraison de chaque module)*

**Passe 1 (modules 1 à 4), 08/10/2026.** Suite complète à chaque module : 895/895 (≈ 13 min). « Avant » = `git archive` du commit
précédent (fins de ligne LF, comme le dépôt) servi à côté ; « après » = l'arbre de travail copié en LF.

| # | Commit | `entreprise.js` après | Capture avant / après | Blocs ciblés |
|---|---|---|---|---|
| 1 options | d342503 | 3 461 -> 3 360 | options des 24 séances (`capture.mjs`) et messages de refus (clé inconnue, 44 options × 6 mauvais types, null / undefined, identifiants de vue, fabrique) : identiques | `dependances socle` : 94/94 |
| 2 thème | ba22f0c | -> 3 281 | `style` de `body` et de `.ent-page`, classes `ent-travail-neutre*`, 24 séances, élève et enseignant (72 relevés) : identiques | `boost smoby picard cdiscount` : 512/512 |
| 3 outils | bc347e8 | -> 3 257 | texte et HTML de la messagerie, des commandes, du bon, du catalogue, du stock, de la console : ENT-1.1 à 1.3 et six Cdiscount (54 pastilles de couleur, 11 « Rupture ») ; options des 24 séances ; formats (`eur`, `fdate`, `fdt`, `norm`, `normLoc`) : identiques | `spartoo cdiscount inventaire dependances` : 250/250 |
| 4 fin | 001c788 | -> 3 168 | bandeau `[data-fin-seance]` : 24 séances, états de jalons scriptés (tout juste, tout faux, un faux, un « à vérifier », faux + « à vérifier » ; tous les jalons un par un pour ENT-1.1, 5.1, 5.3, 5.4), 314 relevés dont 14 avec la phrase `finFige` ; séance d'essai des questions : `data-fin-questions` et `data-fin-retour` dans trois réglages : identiques | `spartoo smoby questions` : 247/248 (voir ci-dessous) |

**Sabotage (module 1).** `finFige` retiré de `OPTIONS` dans `entreprise-options.js` : 7 cas tombent (`dependances` : « option inconnue refuse
la séance… liste les clés connues », « la table OPTIONS est exactement l'ensemble des clés que le code du moteur lit », « le refus
d'une option inconnue nomme la séance », « les 24 séances du registre se chargent » et le meta complet, « séance refusée » ×2 ; 24/31).
Remis, relancé : vert.

**Écarts au plan.**
- Module 2 : `TRAVAIL_NEUTRE` et `TRAVAIL_NEUTRE_FOND` (3 lignes, lues par `dessiner`) restent dans `entreprise.js` ; seuls les calculs
  (`styleTheme(THEME)`, `accentRougeOuVert`, et en privé `enRgb`, `surCouleur`) partent.
- Module 3 : `pad` et `pastille` sont exportés d'`entreprise-outils.js` (le plan ne les nommait pas dans « rend ») parce que
  `entreprise.js` s'en sert encore ; `creerArticles` dérive `VARIANTS` de `CATALOGUE` ; `COLORS` reste lu dans `entreprise.js`
  (`U.couleurs || {}`, il sert au catalogue) et est passé par son nom `couleurs`.
- Module 4 : `bandeauFin(st, options)` du module est la partie **après** les gardes (élève, parcours, tout jugé), qui restent dans
  `entreprise.js` ; `groupesDuBilan`, `jalonsAVerifier`, `aVerifierHtml`, `bandeauAncien` partent aussi (ils ne servent qu'au bandeau) ;
  `peutCorriger` est une valeur calculée au cœur (`ecransAFaire(st).length > 0`), `avecQuestions` un booléen (`!!MQ`).
  **L'indentation des corps de fonction et des gabarits est gardée** (8 espaces) : l'espace entre deux balises fait partie du HTML
  rendu, un redentage aurait changé les octets du bandeau (relevé qui l'a montré avant de commiter).
- Le décompte du plan (3 360 / 3 270 / 3 250 / 3 150) est tenu à ± 20 lignes près (3 360 / 3 281 / 3 257 / 3 168).

**Le cas qui relit le texte d'`entreprise.js`** (piège 1) : rien à adapter. `entreprise.js` ré-exporte `OPTIONS`, garde la ligne
`const { … } = U;` et toutes les lectures `U.xxx` (`finFige: U.finFige` est passé par son nom au module 4).

**Un rouge hors suite entière, pas à moi.** `node outils/test.mjs spartoo smoby questions` (sous-ensemble) échoue sur
« Repérage : l'enseignant voit… → colonne des documents sans documents » ; **le même sous-ensemble échoue de la même façon sur le
commit d'avant toute modification** (vérifié en servant `git archive` du commit 60b276b), et ce cas passe dans la suite entière
(895/895). Cause probable : il prend la première séance immersive (ENT-1.1, qui a des documents) et suppose qu'aucun élève du groupe
n'y a joué ; selon les blocs qui ont tourné avant, un élève y a joué. Non réparé (cas existant, hors périmètre).

**Passe 2 (modules 5 à 9), 08/10/2026.** Suite complète à chaque module : 895/895 (≈ 13 min). Méthode de la passe 1 : « avant » =
`git archive` du commit précédent (LF), « après » = l'arbre de travail copié en LF. **Deux relevés**, refaits à chaque module et
comparés à une référence prise une fois sur le code d'avant la passe (relevée **deux fois, identique** : le relevé est déterministe) :
`ecran.mjs` (messagerie, commandes, bon, catalogue, stock, console : 9 séances, 174 379 caractères) et un **nouveau `ecran2.mjs`**
(24 séances × élève / enseignant / élève sans code du stock, **1 321 relevés, 4 348 559 caractères**, texte et HTML) : Clients et
Fournisseurs avec 13 filtres tapés et la frappe touche par touche (focus relevé) ; catalogue avec recherche, marque, catégorie,
combinaison et la fiche de chacun des 40 premiers produits ; stock verrouillé, code vide / faux / bon (espaces et minuscules),
filtres `#sQ` `#sB` `#sS`, Mouvements, comptage à l'aveugle (étape 1 puis 2) ; blocage : 13 refus ou réussites (vide, lot seul,
référence inconnue, quantité en lettres / zéro / décimale / négative, sans motif, lot vide, trop, deux succès, lot épuisé, clic
réel) sur un lot posé exprès ; console (`.getlot`, `.removestock`, `.addstock`, `.setstock`, `.movements`, `.addclient` ×2,
`.addsupplier` ×2, `.getclient`, `.getsupplier`) et préparation validée.

| # | Commit | `entreprise.js` après | Capture avant / après | Blocs ciblés |
|---|---|---|---|---|
| 5 base | fa7e393 | 3 168 -> 3 119 | 1 321 relevés + 9 séances : identiques | `spartoo cdiscount inventaire` : 220/220 |
| 6 tiers | abe7e47 | -> 3 079 | idem (Clients / Fournisseurs : aucun bloc ne les joue, relevé obligatoire) : identiques | `socle boost` : 183/183 |
| 7 catalogue | 3d4dc61 | -> 3 026 | idem : identiques | `dependances inventaire` : 69/69 |
| 8 stock | 40db919 | -> 2 938 | idem (le `colspan` de « Aucun résultat. » est retrouvé à l'identique, 45 fois) : identiques | `cdiscount inventaire entrepot` : 192/192 |
| 9 blocage | f493e7c | -> 2 861 | idem : identiques | `spartoo` : 88/88 |

**Sabotage (module 6).** Dans `entreprise-tiers.js`, « Client depuis » devenu « Client depuis le » : le relevé le voit (DIFFÉRENT sur
les 4 relevés d'élève / enseignant de Spartoo et de Boost ENT-3.1 qui ouvrent Clients). Remis, relevé identique.

**Écarts au plan.**
- Module 5 : `entreprise.js` garde les mêmes noms (`const { stockDe, mouvement, … } = B`), donc aucun appelant ne change. Les fonctions
  du plan étaient des déclarations (hissées) ; ce sont maintenant des constantes montées juste avant `ajouterMail`, après `sauver` :
  aucun appel avant ce point (`semerVolet` écrit `db.stock` directement, comme avant). Le code est dédenté de deux niveaux (pas de gabarit).
- Module 6 : reçoit `{ E, hote, VOCAB, B }` (le `A` du plan ne sert pas : les formats viennent d'`entreprise-outils.js`).
- Modules 7 à 9 : `A` est maintenant gardé entier dans `entreprise.js` (`const A = creerArticles(…)`, la destructuration suit,
  inchangée) pour être passé aux modules.
- **L'indentation est gardée** (6 espaces) dans les modules 6 à 9, comme au module 4 : l'espace entre deux balises fait partie du HTML.
- Le clic sur un onglet (`[data-onglet]`, branché pour `E.onglet`) reste au cœur : générique, le plan ne le comptait pas dans le stock.
  `[data-deverrouiller]` est branché par le stock (`ctx.codeStock` passé en fonction `codeStock()`) ; `[data-filtre]` n'est branché que
  sur son écran par chacun des trois modules (le bloc partagé du cœur a disparu).
- `brancher(z)` des écrans qui filtrent gardent leur test d'écran (`E.vue`) au moment du branchement ; le comportement est le même
  qu'avant (le champ n'existe que sur l'écran, la vue ne change qu'avec un redessin).
- Décompte du plan (3 100 / 3 060 / 3 000 / 2 920 / 2 845) : réel 3 119 / 3 079 / 3 026 / 2 938 / 2 861 (+ 16 à 26 lignes : chaque
  montage, ses imports et ses en-têtes de fichier).
- **Non rejoué par le relevé** : la validation d'une réception (écrit stock et mouvements par le socle), couverte par les blocs
  `spartoo`, `smoby`, `cdiscount`, `picard` de la suite complète seulement.

**Le « rouge hors suite entière »** de la passe 1 (« Repérage… colonne des documents » avec `spartoo smoby questions` lancés seuls)
n'a pas été rencontré dans cette passe (les blocs lancés étaient ceux de la colonne du §6) ; il reste connu et non réparé.

**Passe 3 (modules 10 et 11), 08/10/2026.** Même méthode : « avant » = `git archive` du commit précédent (LF), « après » = l'arbre de
travail en LF. Relevés refaits à chaque module : les deux de la passe 2 (`ecran.mjs`, `ecran2.mjs`, mêmes références) et un
**nouveau `ecran3.mjs`** : 24 séances × élève / enseignant (48 séances×variantes, **3 170 674 caractères**, texte et HTML, relevé deux fois
sur le code d'avant : identique ; l'heure, le hasard et le délai du « toast » sont figés). Commandes : chaque mail de commande et de bon
de livraison, liste, fiche, saisie touche par touche (focus relevé), valeurs refusées, bon édité / régénéré / effacé par une
modification / « rien à préparer », **Copier le bon en texte** (texte écrit dans le presse-papiers, puis copie refusée de deux façons),
stock changé (refus), validation complète et avec reliquat, annulée (jamais ouverte, sans date ni motif, en cours de préparation, avec bon),
livraison inconnue ou absente, `.getorder`. Réceptions : liste, fiche, saisie, confirmation (Annuler puis Valider), validée, tout refusé,
tout accepté, référence inconnue, litige (ENT-5.5), sans tableau des colis (avec et sans consigne), annoncée, liste vide. Les commandes et
réceptions semées déjà préparées / validées (Cdiscount) sont relevées telles quelles, puis remises à zéro pour jouer la saisie.

| # | Commit | `entreprise.js` après | Capture avant / après | Blocs ciblés |
|---|---|---|---|---|
| 10 commandes | (voir le commit) | 2 861 -> 2 606 | `ecran3` 3 170 674 car., `ecran2` 4 348 559, `ecran` 174 379 : identiques | `spartoo cdiscount dependances amenagements` : 224/224 |

**Fait / à faire.** Passes 1 et 2 faites (modules 1 à 9). **Reste ouvert** : passes 3 et 4 (modules 10 à 13 : commandes, réceptions,
console, messagerie). Rien n'a été fait dans `styles/`, `contenus/`, `activites/*.js`, `outils/test.mjs`, `outils/test/*` (aucun cas
touché). Les relevés (scripts et JSON) sont dans le dossier temporaire de la session, pas dans le dépôt.
