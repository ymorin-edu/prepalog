# Brief de chantier moteur — Tournée : des points qui se lisent dans la base de l'élève

**Statut** : **option A validée par Tristan le 18/10/2026** (« A et retouches 9.2 après ») : construction en cours ; ENT-9.2 sera
retouchée **après**, dans un chantier contenu à part (§6, question 2)
**Date du brief** : 18/10/2026
**Conversation d'origine** : Claude Code (session Fable, lancée par la session ENT-9.2 / 9.3). Demande au moteur **n° 6** du brief
`ENT-9.2-chep-ramasse-et-retours.md` (§7). Séances servies : **ENT-9.4** (évaluation CHEP, jeu tiré par élève : §6.3 du brief, « vides
tirés par site »), ENT-9.2 si Tristan le décide (§6 ci-dessous), puis toute tournée tirée par élève (France Boissons en 1re, messagerie CAP).
**Modèle** : **Opus** pour la construction (vue du moteur) ; Sonnet pour l'état des lieux (fait, en lecture seule). Fable relit, commite, pousse ;
Fable n'écrit pas de code.
**Un seul chantier moteur à la fois** : `docs/EN-COURS.md` vérifié le 18/10 : ENT-9.3 (contenus seulement) est l'autre session ; aucun autre
chantier dans `core/`.
**Durée estimée** : **≈ 4 h** en tout (construction Opus ≈ 2 h 30 : la vue ≈ 45 min, les tests ≈ 1 h 15, la fiche ≈ 30 min ; suite entière en
parallèle ≈ 5 min, relecture et commits ≈ 1 h). Le temps part dans les **tests éprouvés par sabotage**, pas dans l'écriture.

## 1. Le problème, en une phrase

La vue Tournée (`core/types/tournee.js`, `creerTournee`) fige sa liste de points **une fois pour toutes** à la création (`POINTS = T.points ||
PLAN.points`, ligne 233). Une séance tirée par élève ne peut donc pas donner à chaque élève **ses** quantités (ENT-9.2 a dû garder 140, 120,
95, 70 palettes pour tout le monde). Pour la fiche et les documents, le moteur sait déjà faire : `fiche.blocs`, `fiche.documents`,
`documents[].html` et `ecran` acceptent une fonction `(db) => …` relue à chaque dessin (chantier D-1 bis, 09/10/2026). On veut la même chose
pour `tournee.points`.

## 2. État des lieux (lu dans le code le 18/10/2026, vérifié)

- **Une seule source, figée** : `POINTS` (233), lu par `pointDe` (237), `FENETRES` (268, journée à fenêtres), le contrôle des phases (291-296),
  `ids` (469), le contrôle d'`etatInitial` (470-480), `vide()` (462), `pointsDe(etat)` (311, filtre des annulés d'une phase), `numeroDe` (326),
  et le dessin des annulés (965).
- **Le bilan est pur** (`bilanDe`, 505-657 : « Rien n'est mémorisé ») : il recalcule tout à chaque appel à partir de `pointsDe(etat)`. Il
  expose déjà `points`, `retenus`, `ecartes`. Les cases de report, les jauges, les profils, la feuille de calcul (`grille.lignes(bilan)`) et les
  onglets ne lisent **jamais** les points directement : ils passent par le bilan. C'est la bonne nouvelle : **un seul endroit à nourrir**.
- **La base de l'élève (`db`) est déjà là** au dessin (`html(etat, { db })`, passé par `entreprise.js:2361`), dans `brancher` (`api.db`) et
  dans `quand(db)`. Elle **manque** dans `bilan(etat)`, `amorcer(etat)` et `passerPhase(etat, n)` — et leurs appelants l'ont sous la main
  (`entreprise.js:688` et `2360` ; les contenus qui appellent `VUE.bilan(etat)` depuis un jalon `verifier(db)`).
- **La carte se dessine depuis le plan, pas depuis `points`** : positions, noms et numéros des marqueurs viennent de `plan.clients`
  (`planDeCarte`, `carteTournee`, `svgPlan`), construits une fois. `points` ne pilote que le **calcul** (quantités, créneaux, service) et les
  listes sous la carte. Aujourd'hui toutes les séances passent **la même liste** aux deux (CHEP, FB) ou laissent `points` vide (Boost).
- **Aucune mémoire par élève** dans la vue (pas d'index `parId`). Les seuls caches qui figent des quantités sont **dans les contenus**
  (ENT-9.2 : `SITES`, `ADRESSE`, `memo`, `equiteBanque`, corrigé ; Boost : `_optimum`, `A_QUAI` ; FB : `journee()`) : ils ne bougent pas tant
  que la séance ne tire pas ses points.
- **Le modèle à recopier** : `evaluerChamp` (`core/types/fiche.js:195-201`), contrôle au chargement sur une base vide `{}` avec un message qui
  nomme l'objet (`fiche.js:205-210`, `documents.js:123-127`), avis d'erreur au dessin (`<div class="avis avis-err">`), `signaler(quoi, x)`
  d'`entreprise.js:394` (déjà passé à `creerFiche` et `creerDocuments`, pas encore à `creerTournee`). Rien n'est exporté : on recopie le
  motif, comme `localiser.js` l'a fait.
- `outils/carte/calibrer.mjs` ne charge pas la vue (il recode la formule sur des quantités fixes) : **pas touché**.

## 3. Les options

### Option A — `points: (db) => […]`, relu à chaque dessin et par le bilan (recommandée)

Ce que la séance écrit :

```js
tournee: {
  plan: { carte: CARTE, clients: POINTS_PLAN },        // identité et positions : FIXES (ids, x, y, nom, numéro)
  points: (db) => POINTS_PLAN.map((p) => ({ ...p, vides: videsDe(db, p.id) })),   // quantités, créneaux, zone : PAR ÉLÈVE
  mesures: [{ id: 'vides', depart: 0, reprend: 'vides', max: 390 }],
  …
}
```

Règles :
1. **La composition est fixe, les valeurs varient.** `points(db)` rend **les mêmes ids** que sur la base vide (ceux du plan quand il y a une
   carte). Tout le reste du point (`vides`, `kg`, `colis`, `zone`, `creneau`, `nom` dans les listes) peut dépendre de l'élève. Raison : la carte
   dessine le plan ; des ids différents donneraient des marqueurs sans calcul ou des calculs sans marqueur (et `carte.trajets` lèverait une
   erreur). Un besoin de **sites différents par élève** = une carte par élève = un autre chantier (ce n'est pas la demande n° 6).
2. **Relu partout où ça compte** : au dessin (`html`, `opts.db`), dans `brancher` (`api.db`), et le bilan gagne un second argument
   **`bilan(etat, db)`** ; de même `amorcer(etat, db)` et `passerPhase(etat, n, db)`. `entreprise.js` les passe (trois lignes). `FENETRES`,
   `numeroDe`, `vide()`, `pointsDe` et le dessin des annulés lisent la liste évaluée, plus `POINTS`.
3. **Sans `db`, la base vide** : `bilan(etat)` tout court évalue sur `{}` (compatibilité : les contenus qui ne tirent rien continuent de marcher ;
   une séance tirée passe `db` à son `bilan`, comme ses jalons ont déjà `db`).
4. **Contrôle au chargement**, comme D-1 bis : `points` est appelé une fois sur `{}` ; s'il plante ou ne rend pas un tableau de points avec
   des ids, **la séance ne se charge pas** (message : « tournée « <id> » : « points(db) » ne marche pas sur une base vide : … »). Les
   contrôles d'`etatInitial` et des phases (ids existants) se font sur cette liste.
5. **Au dessin, une fonction qui plante** est signalée (console, une fois) et la vue montre un avis d'erreur à la place de la tournée (rien
   n'est écrit, rien ne part) ; une liste dont les ids diffèrent de la base vide = même avis (« la tournée « <id> » rend d'autres sites que sur
   une base vide »). Dans le bilan, la même faute rend un bilan de base vide et signale : aucun jalon ne plante.
6. **Jamais mémorisée, jamais d'écriture** : même piège que `blocs(db)` (la fiche le dit). Rapide : une `map` sur 4 à 8 points.
7. **Liste fixe : rien ne change**, octet pour octet (Boost ENT-3.1 à 3.3, ENT-6.9, ENT-9.2 : blocs `boost`, `carte`, `transport`, `fb-6.9`,
   `ramasse`, `chep-92` verts **sans modification**).

Coût : ≈ 2 h 30 de construction. Toucher `core/types/tournee.js` (la vue) et trois lignes de `core/types/entreprise.js` (passer `db` et
`signaler`). Pas de style.

### Option B — une instance de vue par graine (comme le quai tiré, `quaiDeGraine`)

Le moteur crée une tournée **par graine d'élève** (`Map`), réaffectée à l'ouverture, avec une déclaration `tournee: (graine) => { … }`.
Avantage : rien à changer dans la vue. Inconvénients : on reconstruit la carte entière (SVG, trajets) par élève pour changer quatre nombres ;
les contenus qui appellent `VUE.bilan` depuis un jalon devraient retrouver l'instance de la graine ; l'état d'interface de la fermeture
(onglet ouvert, bras armés) se multiplie. Le quai l'a fait parce qu'un quai tiré change **de composition** (palettes, anomalies) ; ici seule la
valeur change. **Écartée.**

### Option C — des mesures qui lisent la base (`champ: (p, db) => …`), points fixes

Plus étroit : les quantités seules varient, pas les créneaux, ni la zone, ni le service. Suffirait à ENT-9.4 §6.3 (horaires fixes), mais c'est
un **format parallèle** (une fonction par mesure, une autre pour `service.champ`, encore une pour le créneau le jour où il bouge), et ce n'est
pas ce que demande le brief. **Écartée**, sauf si Tristan veut le strict minimum.

## 4. Ce que le chantier livre (option A)

- `core/types/tournee.js` : `points` accepte une fonction, règles 1 à 7 ci-dessus ; en-tête du fichier complété (bloc « POINTS PAR ÉLÈVE »).
- `core/types/entreprise.js` : `creerTournee(cfg, { signaler })`, `db` passé à `bilan` n'est pas nécessaire là (le moteur n'appelle pas le
  bilan), à `amorcer` (2360) et `passerPhase` (688).
- `outils/test/ramasse.mjs` : **un cas par comportement**, chacun **éprouvé par sabotage** (le sabotage est décrit dans le compte rendu) :
  1. liste fixe inchangée : le montage 1 existant (`points: SITES`) ne bouge pas, et un montage identique en `points: () => SITES` rend le même
     bilan (même pic, mêmes arrivées) ;
  2. deux bases, deux résultats : `points: (db) => …` qui lit `db.essai.vides` ; avec deux bases, le pic, les arrivées et le texte de la liste
     changent, et la carte (marqueurs) reste la même ;
  3. relu à chaque dessin : la base change entre deux dessins (comme après « Réinitialiser »), l'écran suit sans rouvrir ;
  4. `bilan(etat)` sans `db` = base vide (compatibilité) ;
  5. chargement : une fonction qui plante sur `{}` fait refuser la séance avec le message qui nomme la tournée ; une fonction qui rend autre
     chose qu'un tableau aussi ;
  6. dessin : une fonction qui plante sur la base réelle montre l'avis d'erreur, signale une fois dans la console, et la page ne plante pas ;
     une liste aux ids différents aussi ;
  7. `etatInitial` et `passerPhase` avec des points en fonction (ids stables) : l'amorce et la phase marchent comme en liste fixe.
- `activites/FICHE-SEANCE.md` : la ligne `tournee` du tableau et le paragraphe « Fonction de la base de l'élève » (D-1 bis) citent
  `tournee.points` et sa règle « ids fixes, valeurs tirées » ; le piège « ENT-9.2 garde ses médianes » est corrigé.
- Compte rendu dans ce brief, ligne dans `docs/decisions.md`, état dans `docs/chantiers.md` (ligne F-4), §7 n° 6 du brief ENT-9.2 pointé ici,
  `EN-COURS` effacé.

## 5. Ce que ce chantier n'écrit pas

- **Aucune séance** : ENT-9.2 garde ses médianes (ses caches `SITES`, `ADRESSE`, `memo`, son corrigé et `chep-92` figent les quantités : les
  faire tirer est un chantier **contenu** à part, ≈ 2 à 3 h, voir §6). ENT-9.4 l'utilisera à sa construction.
- Ni carte par élève, ni sites différents par élève (règle 1).
- `outils/carte/calibrer.mjs` (quantités fixes, indépendant de la vue), `styles/`, `core/types/grille.js`, `core/types/carte.js`.

## 6. Questions à Tristan (réponse attendue avant de coder)

1. **Option A** (recommandée), B ou C ?
2. **ENT-9.2 ensuite ?** Une fois le moteur livré, tirer aussi les vides d'ENT-9.2 (135 à 145, 115 à 125…, comme son brief §6.3 le prévoyait)
   demande un chantier contenu de ≈ 2 à 3 h (données, corrigé, tests `chep-92`, contrôle d'équité à refaire). Proposition : **ne pas y toucher
   maintenant** (séance livrée, à essayer à l'écran), le décider après ENT-9.4.

## Compte rendu *(Claude Code, 18/10/2026 : session Fable ; état des lieux par un sous-agent Sonnet, construction par un sous-agent Opus)*

**Livré** : option A, telle que décrite au §3, dans `core/types/tournee.js` (en-tête « POINTS PAR ÉLÈVE », `creerTournee(T, { signaler })`,
`evaluerPoints`, `POINTS0` / `IDS0`, `pointsBruts`, `pointsSurs`, `fenetresDe`, `pointsDe(e, L)`, `numeroDeL`, `bilanDe(etat, db)` /
`bilanSur(etat, L)`, `lignesGrille(etat, db)`, avis `[data-tournee-erreur]`, `bilan(etat, db)`, `amorcer(etat, db)`, `passerPhase(etat, n, db)`,
`brancher` sur `api.db`), trois lignes dans `core/types/entreprise.js` (`signaler` passé, `db` à `passerPhase` et `amorcer`), huit cas dans
`outils/test/ramasse.mjs` (section « points par élève », dans une page à part pour que les erreurs attendues en console ne touchent pas le cas
« aucune erreur de console » du bloc), fiche de séance à jour (ligne `tournee`, paragraphe « `tournee.points` aussi »).

**Les sept comportements, chacun tombé sous sabotage** (sabotages appliqués un à un par script, bloc relancé, moteur remis à l'identique) :
1. fonction qui rend la liste fixe = même bilan et même écran (tombé quand `vide()` relit `T.points` comme une constante) ;
2. deux bases, deux résultats : pic 425 → 485, retour 08 h 13 → 08 h 25, la liste dit « 200 », marqueurs du plan identiques (tombé quand la
   base est ignorée, quand `bilan` oublie `db`, quand la liste est mémorisée au premier appel) ;
3. séance montée, la base change entre deux dessins, l'écran suit ; le refus du report lit la même base (tombé quand le dessin ignore `opts.db`,
   quand `brancher` ignore `api.db`) ;
4. `bilan(etat)` sans base = base vide, sans erreur (tombé sans le repli `|| {}`) ;
5. chargement : fonction qui plante, rend un texte ou un point sans `id` → refusée, message avec le nom de la tournée et « base vide », refusée
   aussi par `creerEntreprise` (tombé sans le nom dans le message, sans contrôle du type) ;
6. dessin : fonction qui plante ou autres sites → avis, un seul signalement après deux dessins, rien d'écrit ; bilan de la base vide (tombé sans
   comparaison des ids, si `brancher` branche malgré l'avis, si le bilan plante au lieu de repartir de la base vide) ;
7. `etatInitial` et `passerPhase` avec une fonction : amorce et phase 2 comme en liste fixe, ids inconnus refusés (tombé quand `etatInitial`
   est contrôlé sur une liste vide).

**Écarts par rapport au cadrage, assumés** : `vide()`, `etatDepart`, `amorcer` et `passerPhase` lisent les ids de la base vide (`IDS0`) sans
réévaluer `points(db)` : ils n'utilisent que les ids, les mêmes pour tous par la règle 1, et n'ont pas à dépendre d'une fonction qui pourrait
planter au moment d'écrire dans la base (`db` y est accepté, sans effet, c'est écrit). L'avis d'erreur passe avant le verrou de repérage.
Libellés des signalements : « la tournée « id » ne se dessine pas : … », « le bilan de la tournée « id » repart de la base vide : … »,
« « points(db) » rend d'autres sites que sur une base vide (A, B, C au lieu de A, B, C, D) ».

**Vérifié** (tests) : liste fixe identique (HTML au caractère près, blocs `boost`, `carte`, `transport`, `fb-6.9`, `chep-92` : 227/227 sans
modification) ; `ramasse` 22/22 (14 + 8). **Supposé** : le rendu sur une vraie carte (`plan.carte`) avec une fonction (la carte se dessine
depuis `plan.clients`, inchangé ; seul un plan dessiné a été testé avec une fonction) ; le chemin hôte → feuille de calcul (`grille.lignes`)
avec une fonction (le code passe `db`, aucun test ne le couvre) : ENT-9.4 les couvrira. **Rien n'a été vu à l'écran dans un navigateur** par
Tristan : il n'y a pas d'écran nouveau à juger, seulement un comportement ; la première séance qui l'utilise (ENT-9.4) sera celle à essayer.

**Reste ouvert** : le commentaire de `contenus/chep-ent92-donnees.js` (ligne ~17) dit encore que les quantités de la tournée sont figées par le
moteur : à corriger dans le chantier contenu « ENT-9.2 : tirer les vides » (décision de Tristan du 18/10 : « retouches 9.2 après »).
**→ Fait le 18/10/2026 au soir** : ENT-9.2 tire ses vides par cette fonction (compte rendu dans le brief ENT-9.2, dernier point) ; c'est la
première séance qui l'utilise, donc la première à essayer à l'écran (la tournée, sa liste et sa jauge, avec deux comptes d'élèves).
