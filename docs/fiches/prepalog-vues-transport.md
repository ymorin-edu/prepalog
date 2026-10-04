> *Copie du 02/10/2026 de la fiche `claude/prepalog-vues-transport.md` du projet Claude PREPALOG
> (source de conception : le projet). Voir `docs/LISEZMOI.md`. Les tailles de fichiers et le nombre de
> cas de test cités sont ceux du 03/10 : se fier au code et à `node outils/test.mjs` pour les
> valeurs actuelles. Complétée le 03/10/2026 par la section « La vue carte ».*

# Prepalog — les deux vues de transport du noyau (03/10/2026 — bandeau, départ à quai, report conditionnel)

Lot 1 d'ENT-3.1, **écrit et éprouvé**, et **utilisé par un vrai contenu**
(`contenus/boost-tournee.js`, ENT-3.1). Deux vues génériques : elles ne connaissent ni Nîmes, ni
Boost, ni le vélo-cargo — tout vient du contenu.

## ▶ Trois leçons de conception, et elles ne sont pas techniques

Ce sont les trois corrections que Tristan a demandées en regardant l'écran. Chacune vaut pour
toute séance future.

**1. Où l'on met une aide décide si les élèves la prennent.** Le mode hors connexion était un
bouton posé **sous la carte**, avec un libellé prudent et un habillage peu confortable. Ça ne
suffit pas :

> *« Il ne faut pas mettre ça ici, la majorité des élèves va juste cliquer dessus pour avoir les
> réponses. »*

**Un bouton placé dans la zone de travail se lit comme une aide à l'exercice, quoi qu'on écrive
dessus.** Il vit maintenant dans le **bandeau du module**, à côté de « Réinitialiser », où il se
lit comme un réglage de poste. Et il n'est **pas annoncé dans la vue** : un élève bloqué demande
à son enseignant.

**2. On charge un véhicule, on ne le décharge pas.**

> *« Lorsqu'on débloque la tournée, toutes les commandes sont sélectionnées, ce n'est pas
> intuitif, je préfère qu'elle commence dans la catégorie laissés à quai. »*

C'est le geste réel, et c'est aussi meilleur pédagogiquement : la jauge part de zéro et monte
jusqu'au plafond, donc la contrainte **se voit** au lieu d'être annoncée. `departAQuai: true`.

**3. Une case qui se corrige contre le bilan de l'élève ne peut pas juger son travail.**

> *« Il suffit de garder les 6 premières et on tombe juste, aucun travail de tournée à faire. »*

Défaut structurel, pas un défaut de contenu : chaque case de report attend `valeur(bilan)`, où
`bilan` est **celui de l'élève**. Une case ne peut donc jamais dire qu'un ordre est mauvais. Dans
ENT-3.1, les quatre valeurs attendues sont même identiques quel que soit l'ordre — 237, 57, 179,
36 — si bien qu'un élève obtenait 4/4 en manquant le train de cinquante minutes.

**La réponse n'est pas de tordre une case, c'est de refuser le report tant que les contraintes
sont violées** (`exigeConforme: true`). L'élève est renvoyé à sa tournée, pas à son calcul, et
l'écran cesse de se contredire.

## Ce qu'est Simulog, rappelé par Tristan le 02/10 au soir

> *« Les objectifs de Simulog sont de recréer des environnements numériques d'entreprise. De
> permettre aux élèves de travailler les compétences du référentiel dans un environnement
> immersif, ludique et pédagogique. »*

**Ce sont des écrans de logiciel d'entreprise, pas des exercices posés dans un logiciel.** D'où la
carte dessinée au lieu d'un fond de carte, les jauges plutôt qu'un score, la charte de l'entreprise
reprise partout, et l'élève qui va chercher une adresse en ligne comme il le ferait au travail.

## Elles sont utilisables dans n'importe quel scénario

**1. Déclaratif et optionnel, séance par séance.** Une séance qui déclare `plan:` ou `tournee:`
obtient les écrans ; une séance qui n'en déclare pas n'a **aucune entrée de menu en plus**, et pas
de bouton de bandeau en plus non plus. Spartoo n'a pas bougé d'un pixel.

**2. Un état par séance, pas par entreprise.** L'état est rangé sous
`db.transport[<clé>].plan` / `.tournee`, la clé étant `transportId` ou, à défaut, `ctx.meta.id`.
**Chaque séance nouvelle doit déclarer son propre `transportId`** — ENT-3.1 déclare
`'boost-ent31'`.

**3. Le plan est facultatif dans la vue tournée.** Sans plan : pas de carte, pas de distance, donc
pas d'horaire, et la vue ne se verrouille pas. Les cumuls, les plafonds, l'ordre, le quai et les
cases de report fonctionnent tels quels.

**L'intitulé de la section du menu est réglable** (`transportSection`) : ENT-3.1 l'appelle
« Tournées ».

### Ce qui reste à faire si l'envie en vient

- **Plusieurs plans ou plusieurs tournées dans une même séance** : non prévu, une de chaque.
- **Hors d'un environnement d'entreprise** : les deux modules n'attendent qu'un `{ etat, sauver,
  redessiner, toast }` — **mais il faudrait leur donner un équivalent du bandeau** pour le mode
  hors connexion.
- **Un bouton « remettre dans l'ordre d'origine »** dans la vue tournée.

## Où est le code

`core/types/plan.js` et `core/types/tournee.js`, qu'`entreprise.js` importe et branche. S'y ajoute `core/types/carte.js` (voir plus bas) :
elle donne à `plan` et à `tournee` une **carte réelle** à la place du décor dessiné.

## La vue carte — `creerCarte(…)` et ses deux modes *(ajoutée le 03/10/2026)*

La carte **réelle** de Nîmes (rues, voie ferrée, parcs, bâti d'après OpenStreetMap et l'IGN ; quartiers
= IRIS de l'INSEE regroupés ; positions = Base Adresse Nationale). Le module de carte est **généré**
(`outils/carte/construire.py` depuis un `boost-entNN.json`) : on ne le modifie pas à la main. La vue ne
connaît ni Nîmes ni Boost. Les **kilomètres se comptent par les rues** (table `carte.trajets`) et le
tracé de la tournée suit les rues. Deux modes, choisis par ce que le contenu déclare :

| Mode | Il s'active quand… | Ce que l'élève voit et fait | Séance |
|---|---|---|---|
| **Lire la case** | le plan déclare `carte` **et** `reperage` | les sept points numérotés visibles dès le départ, les contours des quartiers **avec leur nom**, le quadrillage de 1 km (A à E × 1 à 5) ; sous la carte, le tableau de `plan.js` : n°, adresse, **quartier (menu)**, **case**. Un clic sur un point ou sur une ligne les entoure d'un halo ambre. Les noms des clients n'apparaissent **qu'après validation, dans le tableau** (pas sur la carte : trop larges au centre-ville). | ENT-3.1 (guidage) |
| **Clic sur la rue** | le plan déclare `carte` **sans** `reperage` | points **cachés** : l'élève clique la bonne rue, le point s'aimante au numéro ; une autre rue est refusée avec son nom et compte comme un essai (jalon en évaluation seulement) ; index des rues par quartier et case | ENT-3.2 et suivantes |

Règles du mode « lire la case » :

- il **réutilise le tableau de repérage de `plan.js`** (`creerPlan(PLAN, options)` : `caseDe`, `dessin`,
  `brancherDessin`, `nomsDansTableau`), donc les mêmes réglages : `toleres`, `essaisAvantIssue`, `issue`,
  `blocant`, et le mode hors connexion du **bandeau** (qui remplit les menus de quartier, pas les cases) ;
- la **case attendue est recalculée** depuis la position du point, jamais recopiée (comme `caseDe`) ;
- les quartiers dessinés et nommés viennent du module de carte : **autant que la séance en déclare**
  (sept en ENT-3.1, deux en ENT-3.2) ;
- **plus de lien vers un plan en ligne** : le zoom d'un quartier donne les noms de rues ;
- `plan` et `tournee` cohabitent avec `carte` : la tournée se pose sur la même carte (départ, gare,
  clients cliquables, tracé par les rues).

**Échelle de difficulté du repérage** (décision de Tristan, 03/10/2026) : 3.1 points visibles + contours
+ noms ; 3.2 points cachés, clic sur la rue ; 3.3 la tournée du collègue est déjà posée (on diagnostique) ;
3.4 à décider. Le premier mode est donc un **guidage**, pas un niveau à réutiliser en évaluation.

## La vue plan — `creerPlan(PLAN)`

```js
plan: {
  libelle: 'Plan de Nîmes',        // entrée de menu
  titre, consigne, alt,
  largeur: 600, hauteur: 420,      // repère SVG
  fond: '<g>…</g>',                // LE DÉCOR, dessiné par le contenu
  grille: { colonnes: 'ABCDEF', lignes: 4 },
  echelle: { pixels: 60, facteurRoute: 1.30, libelle: '1 km' },
  depart:  { nom: 'Entrepôt Boost', lettre: 'B', x, y },
  arrivee: { nom: 'Gare de Nîmes-Centre', x, y },     // facultatif
  points:  [{ id, nom, zone, adresse, x, y, …données libres }],
  enLigne: { libelle: 'Ouvrir un plan en ligne', url: '…' },   // facultatif
  legende: [{ forme, couleur, texte }],  legendePoints: 'Client à livrer',
  reperage: {
    consigne, champ: 'Case',
    secours: 'Mode hors connexion',   // LIBELLÉ DU BOUTON DE BANDEAU, pas d'un bouton de la vue
    toleres: 0, blocant: true, essaisAvantIssue: 2,
    issue: 'Je ne trouve pas, continuer quand même',
  },
}
```

Le noyau dessine **le quadrillage, les repères de départ et d'arrivée, les points numérotés, la
légende, l'échelle et le tracé**. Le contenu ne fournit que le décor — s'il redessine l'un de ces
éléments, on le voit en double, et un test le garde.

**Les deux temps sont tenus par l'état**, pas par un réglage d'affichage : un élève qui revient la
semaine suivante retrouve son plan nommé.

**La case attendue est RECALCULÉE depuis la position du point** (`caseDe`), jamais recopiée dans le
contenu. *(Dans un test, c'est l'inverse qui vaut : écrire les cases à la main, pour que les deux
calculs aient à tomber d'accord.)*

### Écrire le décor (`fond`)

1. **Le décor n'est pas une série de données.** Il ne doit reprendre AUCUNE des trois couleurs que
   le noyau réserve aux repères — `--vert` (départ et tracé), `--terre` (arrivée),
   `--ardoise-fond` (points). La première version du plan de Nîmes peignait ses quartiers en
   `--ardoise-fond` : sept pastilles bleues sur six aplats bleus, et les pastilles
   disparaissaient. Un décor se peint dans sa propre palette, en dur si besoin, et il **recule**.
2. **Il faut des repères reconnaissables** : monuments, axes structurants (voie ferrée,
   autoroute, grande avenue), et une **flèche du nord**. Sans orientation, comparer notre plan
   avec un plan en ligne est une devinette.
3. **Le décor se dessine AUTOUR des points, jamais l'inverse.** Les positions commandent les cases
   attendues et tout le calibrage.

Un plan schématique agrandit nécessairement son centre-ville. C'est le bon choix, mais il faut le
dire en classe : les distances mesurées en ligne ne seront pas les nôtres.

### Les quatre réglages de l'autocorrection

| Réglage | Défaut | Ce qu'il fait |
|---|---|---|
| `toleres` | `0` | combien de cases peuvent rester fausses sans empêcher la validation |
| `blocant` | `true` | à `false`, la suite de la séance n'attend pas la validation |
| `essaisAvantIssue` | `2` | au bout de N échecs, un bouton **« continuer quand même »** apparaît. `0` l'offre tout de suite, **`null` le supprime** |
| `issue` | « Je ne trouve pas… » | son libellé |

La porte de sortie ouvre le temps 2 **sans** marquer le repérage réussi : `force` est horodaté,
`valide` reste vide. **Débloquer n'est pas valider.**

- `temps2(etat)` — les noms sont-ils affichés ? (vrai aussi après la porte de sortie)
- `ouvreSuite(etat)` — la suite est-elle ouverte ? (vrai aussi si `blocant: false`)
- `etat.valide` — le repérage est-il **réussi** ? C'est celle que lisent les jalons.

> **La porte de sortie, elle, reste DANS la vue**, contrairement au mode hors connexion, et c'est
> voulu : elle n'apparaît qu'après N échecs. Elle n'est pas offerte, elle est méritée, et elle
> doit se présenter au moment exact où l'élève bloque.

### Le mode hors connexion — dans le bandeau

```js
horsConnexion               // { libelle } — ou null si la séance n'a pas de `reperage`
estHorsConnexion(etat)      // booléen
activerHorsConnexion(etat)  // horodate `etat.secours`, une seule fois
```

`entreprise.js` dessine le bouton dans le bandeau, le désactive une fois pris (avec un ✓), et
**lit l'état sans le créer** : passer par `etatTransport('plan')` au moment de dessiner le bandeau
poserait l'état de la vue plan dans la base d'un élève qui ne l'a jamais ouverte.

Il **révèle le quartier, pas la case**. Son usage est horodaté, donc un jalon peut en tenir compte.
**Une séance ne peut pas le supprimer**, seulement en changer le libellé.

### L'ordre du bandeau

`Réinitialiser · Trame PDF · Trame Word · Mode hors connexion · | · Quitter`

Les deux trames vont par paire ; le réglage de poste passe après. Un test garde cet ordre et
vérifie que **le bandeau ne déborde pas en largeur**. Mesuré : **une ligne jusqu'à 1 280 px**
(60 px de haut), **deux lignes à 1 024 px** (103 px) — il se replie, il ne déborde jamais.

Exports : `svgPlan(PLAN, {noms, ordre, id})`, `legendePlan`, `caseDe`, `normCase`, `distanceKm`.

## La vue tournée — `creerTournee(T)`

```js
tournee: {
  libelle: 'Tournée', titre, consigne,
  plan: PLAN,                       // FACULTATIF — sans lui, ni carte ni distance ni horaire
  points: […],                      // par défaut, ceux du plan
  mesures: [{ id, libelle, unite, champ, max }],      // ce qui se cumule ; `max` = plafond
  horaire: { depart, limite, vitesse, service, libelleLimite },   // minutes depuis minuit
  report: [{ id, libelle, unite, tolerance, valeur: (bilan) => … }],
  titreReport, consigneReport,

  departAQuai: false,               // le véhicule part-il VIDE ?
  libelleCharge: 'Chargé…',         // titre de la liste chargée (facultatif)
  libelleQuai: 'Laissés à quai',    // titre de la liste à quai
  libelleCharger: 'reprendre',      // libellé du bouton qui charge un arrêt
  exigeConforme: false,             // refuser le report tant que les contraintes sont violées
}
```

`bilan` = `{ retenus, ecartes, cumuls, km, minutes, arrivee, depassements, enRetard }`, recalculé
à **chaque** dessin — rien n'est mis en cache, une valeur gardée finirait par mentir.

**`bilan` est exposé** (`VUE.bilan(etat)`) et c'est par là qu'un contenu doit juger. ENT-3.1 monte
une **seconde instance de `creerTournee`** avec le même objet `T` et lui demande son bilan.
**Attention** : `bilan` est la fonction brute, elle suppose un état déjà formé — un jalon doit
sortir sur `if (!etat || !etat.ordre) return 'na'`.

### `departAQuai` — le véhicule part vide

Par défaut (`false`), tous les arrêts sont déjà chargés et l'élève retire ce qui ne passe pas.
À `true`, l'état de départ est `{ ordre: [], quai: [tous] }` : l'élève **charge**. La liste vide
porte alors un message qui dit où prendre les arrêts.

**Conséquence à ne pas manquer pour les jalons** : avec un véhicule vide, la charge est à 0 sur
180 et un jalon naïf la déclare « respectée » **avant que l'élève ait rien fait**. Il gagnerait un
point en ne faisant rien. Deux garde-fous dans ENT-3.1, chacun avec son test :

- `commencee(etat)` = `etat.ordre.length > 0` **ou** une case de report saisie ;
- le jalon de charge rend `attente` tant que `bilan.retenus` est vide, même si `commencee` est
  vrai (cas de l'élève qui tape un chiffre sans rien charger).

### `exigeConforme` — le report refusé tant que la tournée ne tient pas

À `true`, « Valider mes résultats » commence par regarder le bilan. Si une mesure dépasse son
plafond, si l'horaire est manqué, ou si rien n'est chargé, il **ne juge rien** : il pose
`etat.bloque`, un message qui nomme le ou les problèmes, efface `juge` et `valide`, et renvoie
l'élève à sa tournée. Le message s'efface dès qu'il touche à l'ordre ou au chargement — on ne le
laisse pas devant un reproche qui ne correspond plus à rien.

C'est le seul moyen, dans ce mécanisme, d'exiger un vrai travail de tournée : **aucune case ne
peut juger un ordre, puisqu'elle se corrige contre le bilan de celui qui la remplit.**

### Le reste

**Trois gestes, deux voies.** Glisser pour ordonner, **et** deux flèches ↑ ↓ au clic. Le repli au
clic est obligatoire : le glisser-déposer n'a jamais été éprouvé sur les postes du lycée.

> **Piège :** une case dont la valeur attendue peut devenir **négative** (« minutes d'avance sur
> l'horaire limite ») fait taper « −12 » à l'élève qui s'est déjà trompé. La jauge le lui dit déjà
> en clair ; mieux vaut un jalon.

**Réordonner après une correction l'efface** — et efface aussi le refus. Conséquence pour les
jalons : le jalon du report repasse en `na`, pas en `ko`.

## Deux règles de parcours tenues par le noyau

- **Si un plan est déclaré et qu'il est bloquant, la tournée reste fermée tant que le repérage
  n'est pas validé** — ou forcé par la porte de sortie. Sans plan, pas de verrou.
- **Tout l'état vit dans la base de l'élève**, donc il survit à une fermeture d'onglet. Les jalons
  le lisent directement :
  `verifier: (db) => ({ status: db.transport?.['boost-ent31']?.plan?.valide ? 'ok' : 'attente' })`.

## Quatre pièges pour qui écrit un contenu par-dessus

1. **Le jalon qui accuse avant que l'élève ait commencé.** Distinguer `na`, `attente` et `ko`.
2. **Le jalon qui récompense l'inaction.** Un véhicule vide respecte tous les plafonds.
3. **Le test qui lit le suivi après avoir posé un état à la main.** Le moteur ne remonte les
   jalons **qu'au moment où il sauve**. Appeler `ETAPES[n].verifier(db)` directement.
4. **Mettre une aide à portée de souris dans l'écran de travail.** C'est le bandeau, ou rien.

## Habillage

Classes dans `styles/base.css` : `.plan-svg`, `.plan-boite`, `.plan-legende`, `.plan-table`,
`.plan-issue`, `.tour-grille`, `.tour-liste`, `.tour-item`, `.tour-jauge`, `.tour-cases`… **Tout
est écrit en variables CSS.** Les trois qui comptent :

| Variable | Ce qu'elle peint | Boost |
|---|---|---|
| `--vert` | l'entrepôt et le tracé de la tournée | menthe `#25c998` |
| `--terre` | l'arrivée (la gare) | jaune `#f0bd3c` |
| `--ardoise-fond` | les points à desservir | bleu électrique `#345cfd` |

**Ces trois-là appartiennent aux repères. Le décor d'un scénario ne doit pas les reprendre.**

Le bouton de bandeau réutilise `.ent-act`. `.plan-secours` n'est plus utilisée et pourra
disparaître.

## Les tests

Les vues ont leurs cas dans les blocs `transport` et `boost` de `outils/test/` : sept séances
d'essai montées à la main (avec plan et tournée, sans rien, jumelle sur la même base, sans plan,
avec porte de sortie, avec tolérance, et une qui déclare les deux trames et un plan pour garder
l'ordre du bandeau). Aucune ne déclare `departAQuai` : elles prouvent donc aussi que l'option est
bien optionnelle. Les cas du contenu d'ENT-3.1 couvrent l'adresse sans numéro, le calibrage, le
vélo-cargo qui part vide, les jalons qui ne récompensent pas l'inaction, le report refusé tant que
la tournée ne tient pas, la porte de sortie, la charte couleur par couleur et l'absence de carte
intégrée.

**Éprouvés dans les deux sens** (sabotages). Cinq leçons, toutes revues plusieurs fois :

- **un test trop faible** — mesurer un état `na`, c'est ne rien mesurer ;
- **un sabotage sans effet** — retirer `secours:` ne retire pas le bouton, `plan.js` a un défaut ;
- **un sabotage qui croit cacher** — `hidden` sur un `<g>` SVG ne le retire pas de
  `querySelectorAll` ;
- **un test qui déplace quelque chose doit garder les deux moitiés du déménagement** : parti d'où
  ça partait, *et* arrivé où c'est attendu ;
- **un garde-fou sans test est invisible** — le jalon de charge protégé contre le véhicule vide
  n'était atteint par aucun cas ; le sabotage est passé au vert jusqu'à ce qu'on écrive le
  chemin qui y mène.

**Pour les lancer en parallèle** : copier le dépôt dans N dossiers et **remplacer le port `8099`
par un port distinct** dans chaque copie de `outils/test.mjs`. Quatre de front passent.
