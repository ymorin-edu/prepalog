# Brief moteur — Le palettier « à adresse donnée » : ranger, scanner, passer la main, compter, retrouver (pour ENT-8.11 à 8.14 Action)

> **📋 Phrase à copier-coller dans Claude Code (Opus pour les lots 1, 4 et 5 ; Sonnet suffit pour les lots 2, 3 et 6) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/chantiers.md, activites/FICHE-SEANCE.md (section « Vue Plan d'entrepôt », modes rangement et préparation, et « Le terminal vocal »), docs/briefs/MOTEUR-vue-plan-entrepot.md (§5.2 et §7 : le lot 3 « comptage » jamais construit) puis docs/briefs/MOTEUR-palettier-adresse-donnee.md en entier. Fais l'état des lieux du §3 (lecture seule) : dis-moi ce qui existe déjà, ce qui contredit le brief, et propose un découpage en lots avec leur durée. N'écris rien avant ma réponse.
> ```

**Statut** : à implémenter
**Date du brief** : 21/10/2026
**Conversation d'origine** : Cowork (Opus), cadrage de C1.5 chez Action du 21/10/2026, 16 h 14 → 17 h 00 (13 décisions de Tristan, fiche du projet
`claude/prepalog-action-cadrage-c1.5.md`).
**Pour** : ENT-8.11 (lots 1, 2), ENT-8.12 (lot 4), ENT-8.13 (lots 3, 5), ENT-8.14 (lot 6). **Un seul chantier moteur à la fois** : ce brief en est un.
**Durée estimée par Cowork** : ≈ 12 à 14 h en tout, tests compris. Ce qui prend le temps : le comptage (dessin des cartons, à l'aveugle, recomptage),
« le lendemain » (un état de départ qui ment), et les tests dans les deux sens. **Version courte possible** : lots 1, 2 et 4 seulement (≈ 7 h) →
ENT-8.11 et ENT-8.12 se construisent ; 8.13 et 8.14 attendent les lots 3, 5, 6.

---

## 1. Pourquoi

Chez Action (CAP OL, C1.5 « Mettre en stock »), **c'est le système qui donne l'adresse** : l'opérateur ne choisit pas où ranger, il lit l'adresse,
va à l'emplacement, vérifie qu'on peut y poser (place libre, plaque de charge), pose — ou, au-dessus du sol, **passe la main au cariste** —, puis
**scanne** pour que le système sache où est la palette. C'est l'inverse du mode `rangement` actuel (Smoby, ENT-5.5 : l'élève choisit d'après des
critères). Décisions de Tristan (21/10/2026) :

1. Palettier en hauteur, avec la préparation au sol (N1 = picking, N2 et plus = réserve).
2. L'élève (catégories R489 1A, 1B, 3 du CAP) **range lui-même au niveau 1 (sol)** ; au-dessus, il **vérifie l'adresse et la plaque de charge, puis
   passe la main au cariste** (Kevin à Ensuès), qui monte la palette. Il **scanne** pour confirmer dans les deux cas.
3. Inventaire tournant **au terminal à scanner, à l'aveugle**, compté **en cartons** ; un écart → **recomptage** ; écart confirmé → **signalé au
   chef d'équipe** avec une cause possible (le CAP « participe » à l'inventaire, il ne corrige pas le stock).
4. Erreur induite (ENT-8.13) : une palette posée « à côté » **sans scan** ; le lendemain, le système la croit ailleurs ; l'élève la retrouve et la
   **transfère** (scan).
5. Évaluation (ENT-8.14) : rangement + comptage dans **le site d'évaluation** de l'élève (Onnaing ou Belleville), en copie.

**Vue pensée pour servir à plusieurs séances** (garde-fou de la décision 13) : déstockage CAP-C3.2 (ENT-8.16), réapprovisionnement du picking, et
le Bac Pro (inventaire tournant en palettier, lot 3 jamais construit).

## 2. Ce qui existe (à confirmer à l'état des lieux)

D'après `activites/FICHE-SEANCE.md` (relu le 21/10/2026) :

- Mode **`rangement`** : plan vu de dessus, travée de face, adresse `A1-T03-N2-E1` (**N1 = sol**), emplacement occupé refusé tout de suite,
  critère `charge` (charge totale du niveau, « dire que, jamais de combien »), copie en évaluation, jalons par palette.
- Mode **`preparation`** : N1 picking / réserve, descente de réserve par le cariste.
- Mode **`picking`** et **terminal** (D-6, D-7) : un boîtier qui dit une phrase, attend une réponse tapée, « Code de contrôle ? » ; modes `masse`
  + `comptage` (ENT-6.6) qui rédigent ses lignes depuis le plan ; `comptagesTerminal` vers l'écran Inventaire (`source: 'comptages'`).
- **Lot 3 « comptage »** du brief `MOTEUR-vue-plan-entrepot.md` (§5.2, §7, §11) : **spécifié, jamais construit** (« une séance qui le déclare ne se
  charge pas »). Il prévoyait : liste d'adresses, fiche de comptage avec **cartons dessinés en perspective**, à l'aveugle, aucune surbrillance,
  trace des comptages hors liste, tableau des écarts calculés par l'élève (Bac Pro).
- `rendCopie: false` (quai, planning) pour une copie faite de plusieurs écrans.

## 3. État des lieux demandé (lecture seule, avant tout)

Pour chaque lot : ce qui existe déjà, ce qui manque, ce qui contredit le brief. En particulier : le terminal peut-il servir **sans voix**, comme
**terminal à scanner** (même boîtier, un mot « Scanne l'adresse » au lieu de « Code de contrôle ? ») ? Le mode `rangement` peut-il recevoir une
**adresse imposée par palette** sans casser ENT-5.5 ? Un seul `entrepot` par séance, ou plusieurs (ENT-8.13 range le soir, cherche le lendemain) ?

## 4. Les demandes

### Lot 1 — Ranger à l'adresse donnée, passer la main au cariste (ENT-8.11)

- Une palette déclare son **adresse donnée** (`adresse: 'A1-T03-N1-E2'`), montrée sur sa carte comme une **étiquette du système** (« Adresse :
  A1-T03-N1-E2 »). Aucun critère de choix (gamme, rotation, parcours) : ils ne sont pas déclarés.
- **Niveaux du cariste** (`cariste: { nom: 'Kevin', role: 'cariste', niveaux: [2, 3, 4] }`) : cliquer un emplacement d'un de ces niveaux ne pose pas
  la palette ; l'élève voit l'emplacement de près (plaque de charge, charge déjà posée — l'« aide charge » existante en guidage) et choisit
  **« Confier à Kevin »** ou **« Signaler : on ne peut pas ranger ici »**. Confiée : la palette part dans une **zone « À monter »** (dessinée au
  pied de l'allée), avec son adresse ; Kevin la monte quand l'élève envoie sa demande (lot 1 bis ci-dessous) ou à la fin. **L'élève ne peut jamais
  poser lui-même au-dessus du niveau 1** (refusé : « Au-dessus du sol, c'est Kevin qui monte la palette. »).
- **« Signaler : on ne peut pas ranger ici »** : un motif à choisir (`occupé`, `charge dépassée`, `emplacement abîmé`, `autre`) ; la vue publie
  `entrepot:<id>:signaler:<palette>` avec le motif. La séance déclare ce qui suit (`apresSignalement` : une **nouvelle adresse** donnée en guidage,
  ou rien). Le signalement est jugé **contre la vérité de l'emplacement** (charge réelle, occupation) : signaler à tort est faux.
- **Jalons par palette** (ids stables, la séance y pose ses poids) : `place-<P>` (posée au sol ou confiée, **à son adresse**), `signale-<P>`
  (palette dont l'adresse est impossible : signalée avec le bon motif, et **non posée ni confiée** là), `pasPoseHaut` (aucune tentative de pose
  au-dessus du sol : garde, compté seulement si toutes les palettes sont traitées).
- **Lot 1 bis (petit)** : la demande au cariste se fait par la **Messagerie existante** (réponse par phrases, choix calculés sur les palettes
  confiées) : rien de nouveau si la séance peut lire « les palettes confiées » dans l'état de la vue. À confirmer.

### Lot 2 — Scanner pour confirmer (ENT-8.11, 8.13, 8.14)

- Après une pose (ou une confiance au cariste), la palette est **« posée, non scannée »** : le système ne la connaît pas encore à cette adresse.
  Geste : **« Scanner »** sur l'étiquette de l'emplacement (vue de près) puis sur l'étiquette de la palette — ou un seul bouton « Scanner
  l'emplacement » si l'état des lieux le juge assez clair pour du CAP (deux clics préférés : on scanne l'adresse **et** la palette).
- Le terminal (sans voix) affiche « A1-T03-N1-E2 — Lessive liquide 3 L — 24 cartons. Confirmé. » ; un scan à **une autre adresse que celle de la
  palette** : « Ce n'est pas l'adresse de cette palette. » (refusé, compté en trace, jamais noté seul).
- État : `scan: { P1: 'A1-T03-N1-E2' }` ; jalons `scan-<P>`. **Ce que le système croit** (`ouSystemeCroit(db, P, 'P1')`) : l'adresse scannée,
  sinon l'adresse donnée — c'est ce qui sert au lendemain (lot 5).

### Lot 3 — Adresse prise, adresse libre, poser sans scanner (ENT-8.13, 8.14)

- Une palette dont l'adresse donnée est **occupée** (déclarée dans le stock de départ). Ouvrir l'emplacement : « Occupé ». Trois gestes possibles,
  tous permis par la vue (c'est la séance qui juge) :
  1. **« Demander une adresse libre »** (au terminal) : le terminal donne une adresse libre déclarée par la séance (`adresseLibre`), l'élève y
     range (ou la confie) et scanne → c'est le bon geste ;
  2. **poser à un emplacement libre voisin sans rien demander** : permis ; s'il ne scanne pas, le système la croit toujours à l'adresse donnée ;
     s'il scanne, le scan est refusé (« Ce n'est pas l'adresse de cette palette. ») tant qu'il n'a pas demandé d'adresse libre ;
  3. **laisser la palette dans l'allée** (ne rien faire) : « Valider mon rangement » reste possible (avec confirmation), la palette compte non rangée.
- Jalon `adresseLibre-<P>` : adresse libre demandée, palette rangée là **et** scannée. Garde : faux si la palette est restée dans l'allée.
- Une déclaration `pousse` permet à la séance d'envoyer un message (Kevin : « Mets-la à côté, on verra demain ») au premier « Occupé » : par les
  déclencheurs existants (`apresGeste('entrepot:<id>:occupe:<P>')`), si la vue publie ce geste. À confirmer.

### Lot 4 — Compter au terminal, à l'aveugle, en cartons (ENT-8.12, 8.14)

Reprend le **lot 3 jamais construit** de `MOTEUR-vue-plan-entrepot.md` §5.2, adapté au CAP :

- La séance déclare une **liste d'adresses à compter** (5 à 6), le stock du système de chacune (`systeme: 36`) et le **réel** (`reel: 33`) : ce qui
  est dessiné.
- Geste : aller à l'adresse (aucune surbrillance), **scanner l'adresse** (sinon : « Scanne d'abord l'adresse. »), voir la **palette de cartons
  dessinée en perspective** (couches du dessous complètes, cartons manquants sur la couche du dessus, carton en trop posé dessus : la règle du lot 3),
  taper le **nombre de cartons** au terminal. **Le stock du système n'est jamais affiché** (à l'aveugle).
- **Recomptage (CAP)** : si le compte diffère du système, le terminal dit « Quantité différente. Recompter ou confirmer ? » — **sans dire de
  combien ni dans quel sens**. « Recompter » efface et redemande ; « Confirmer » garde. Un compte égal au système : « Compris. », adresse suivante.
- **Pas de calcul d'écart par l'élève** (c'est le Bac Pro, lot 3 d'origine) : la vue rend la liste des **écarts confirmés** (`ecartsConfirmes(db,
  P)` → `[{ adresse, compte }]`) ; la séance s'en sert pour une fiche « Signaler à Samia » (vue Fiche existante, choix calculés).
- Comptage à une adresse hors liste : gardé en **trace** (enseignant), jamais noté seul.
- Jalons : `compte-<adresse>` (dernier compte confirmé = réel) ; `recompte-<adresse>` pour les adresses où le **premier** compte de l'élève diffère du
  système (vrai s'il a choisi « Recompter » au moins une fois ; « à faire » sinon, **jamais faux si son premier compte égalait le système**, ce qui
  ne récompense ni ne punit rien) ; `scanAvant` (aucun compte tapé sans scan de la bonne adresse ; **faux si rien n'est compté** : inaction).
- **Option `recompte: 'ecart'` (défaut) | 'jamais'** : `'jamais'` en évaluation si Tristan le veut (§11 d'ENT-8.14 : on le garde en évaluation).
- Les **cartons dessinés** : cartons par couche (2 × 3, 3 × 3, 2 × 4…), couches (3 à 5), couche du dessus incomplète : déclarés par adresse ou
  calculés depuis `reel` et le format (`couche: [3, 2], couches: 5` → 30 pleins ; `reel: 27` → la couche du dessus a 3 cartons).

### Lot 5 — « Le lendemain » : retrouver une palette et la transférer (ENT-8.13)

- **Deux temps dans la même vue** : `phases: ['soir', 'lendemain']` (ou deux `entrepot` dans la séance si l'état des lieux le préfère). Le
  lendemain repart de **l'état laissé par l'élève le soir** (ses palettes posées, scannées ou non) **plus** une palette posée par Kevin, déclarée
  par la séance (`kevin: { palette: 'P9', adresseDonnee, posee }`).
- Au lendemain, une **adresse vide** que le système croit pleine (celle de sa palette s'il ne l'a pas scannée, sinon celle de Kevin : la séance
  choisit par `ouSystemeCroit`). L'élève **ouvre des emplacements** pour chercher (chaque ouverture comptée : trace et jalon facultatif
  `trouveEn: 4`), voit l'**étiquette de la palette** de près.
- **« Transférer »** : scanner la palette trouvée, puis l'adresse où elle doit aller (l'adresse donnée si elle est libre, sinon une adresse libre
  demandée) ; si elle doit monter : « Confier à Kevin » ; le terminal : « Transfert enregistré : P9 de A1-T02-N1-E3 vers A1-T03-N1-E2. »
- Jalons : `retrouvee` (palette ouverte), `trouveeVite` (en `trouveEn` ouvertures au plus), `transfert-place` (palette à une adresse juste),
  `transfert-scan` (le système la sait là). Gestes publiés : `entrepot:<id>:trouvee`, `entrepot:<id>:transfert`.

### Lot 6 — Évaluation : rangement + comptage en copie, par site (ENT-8.14)

- Les lots 1 à 4 **en copie** (`copie: true`) : rien de signalé (ni « Ce n'est pas l'adresse » ? — à trancher à l'état des lieux : un refus de
  scan à la mauvaise adresse **reste dit**, c'est le terminal, pas une aide), pas de « Les règles », pas de verdict ; **`rendCopie: false`** (la
  copie se rend à la fin d'un autre écran, comme le quai et le planning).
- **Un plan par site** (Onnaing, Belleville : module des sites d'ENT-8.5, `contenus/action-eval-sites.js`) : nombre d'allées, de travées, de
  niveaux, plaques de charge différents. **La forme de l'adresse** reste `A1-T03-N2-E1` (la changer par site n'est pas demandé : l'élève lit un
  plan inconnu, c'est assez).

## 5. Ce qui ne change pas

ENT-5.5 Smoby (rangement à critères), ENT-5.6 (préparation), ENT-6.5 / 6.6 / 6.7 (masse, comptage à la voix, picking) : **aucun cas existant
réécrit** ; une option absente = le comportement d'aujourd'hui. Le dire au compte rendu (alerte 7 si `outils/test.mjs` est touché).

## 6. Couleurs et dessin

Charte d'Action (rouge) : la règle des chartes rouges ou vertes s'applique déjà (le moteur remplace l'accent par l'encre dans la zone de travail).
Zone « À monter » et palettes confiées : trait ou bordure, **jamais d'aplat vert** (le vert plein ne dit que « juste »). Le refus de scan : texte
rouge, sans aplat. Tient en 1366 × 768.

## 7. Tests attendus (bloc `entrepot`, plus un cas par lot dans les blocs des séances)

- Lot 1 : poser au sol à l'adresse donnée → `place` ✓ ; ailleurs → ✗ ; cliquer N2 → la pose est refusée, « Confier à Kevin » la met dans « À
  monter » → `place` ✓ ; signaler `charge dépassée` sur l'adresse qui dépasse vraiment → ✓, sur une adresse qui ne dépasse pas → ✗ ; inaction →
  tout faux ou « à faire », `pasPoseHaut` non compté.
- Lot 2 : posée non scannée → `scan` ✗ et le système la croit à l'adresse donnée ; scan à une autre adresse → refusé, trace.
- Lot 3 : adresse libre demandée + rangée + scannée → ✓ ; posée à côté sans scan → ✗ ; restée dans l'allée → ✗.
- Lot 4 : à l'aveugle (le nombre du système n'apparaît **nulle part** dans le DOM avant la fin, testé) ; recomptage proposé seulement si le compte
  diffère ; `recompte` jamais faux quand le premier compte égale le système ; rien compté → `scanAvant` faux.
- Lot 5 : élève qui n'a pas scanné → c'est **sa** palette qui manque ; élève qui a scanné → c'est celle de Kevin ; transfert juste → ✓✓.
- Lot 6 : en copie, aucun verdict dans le DOM ; deux sites, deux plans.
- **Chaque cas éprouvé dans les deux sens** (un sabotage qui ne fait rien tomber = un test mal écrit). Valeurs attendues **écrites à la main**.

## 8. Fiche à tenir à jour

`activites/FICHE-SEANCE.md`, section « Vue Plan d'entrepôt » : un paragraphe par option, l'exemple de déclaration, les ids des jalons, les gestes
publiés. Page d'essai `outils/essai-entrepot.html` : un cas « Palettier à adresse donnée » où Tristan peut cliquer (règle : un changement
d'interaction se juge sur une page d'essai, pas sur une capture).

## 9. Critères de validation par Tristan (page d'essai)

- Un élève de CAP comprend sans lire deux fois : « l'adresse est sur la palette, je vais à l'emplacement, je pose ou je confie, je scanne ».
- On ne peut pas monter une palette soi-même ; on voit la plaque de charge de près.
- Au comptage, rien ne trahit le stock du système ; « Recompter ou confirmer ? » ne dit pas dans quel sens.

## 10. Questions ouvertes

- [ ] Un ou deux scans pour confirmer une pose (adresse puis palette, ou l'adresse seule) : à montrer à Tristan sur la page d'essai.
- [ ] Le terminal à scanner = le terminal vocal sans voix, ou un dessin de scanner à main (« douchette ») ? Préférence de Cowork : le même boîtier,
  pour ne pas multiplier les objets ; à trancher sur la page d'essai.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
