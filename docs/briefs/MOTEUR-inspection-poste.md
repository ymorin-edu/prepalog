# Chantier moteur — « Inspection du poste » : le transpalette, l'extincteur, l'affichage (pour ENT-10.2 à 10.4)

**Statut** : **livré** (19/10/2026, lot G-5 : vue branchée dans le moteur, fermée tant qu'aucune séance ne la déclare) — page d'essai cliquable d'abord (lot B, validée par Tristan le 19/10/2026)
**Date** : 18/10/2026 (Cowork)
**Décision de Tristan** (18/10/2026, 21 h 50) : « Nouveau dessin » — le transpalette électrique, l'extincteur et le plan de circulation entrent
dans le dessin ; l'élève clique les défauts. Les autres choix ci-dessous sont **de Cowork** (délégation du même soir) : à relire sur la maquette.
**Modèle** : **Opus** (vue nouvelle du moteur). **Durée estimée** : maquette ≈ 3 h ; vue branchée, tests compris ≈ 1 jour. Ce qui prend le
temps : les objets du kit iso (dessin, états, zones de clic) et les tests (sabotages, jalons sans inaction).
**Sert à** : ENT-10.2, 10.3, 10.4 (Pelleau) ; ensuite les séances d'**ouverture de poste** d'Amazon et de Leclerc (progression CAP, C1.2 en
4 passes) et Bricomarché (charges lourdes). Règle « une vue pensée pour plusieurs séances » : rien de Pelleau dans le moteur.

## 1. Le besoin

Une prise de poste se fait **avant** tout camion : l'élève regarde son poste et son engin, repère ce qui ne va pas, le signale. La vue quai sait
déjà le faire **sur la scène** (`securite.mode: 'scene'` : marques numérotées, « Signaler à … », réparation sous les yeux, arrêt en guidage,
jalons `securite-<id>` et `securite-aucun-faux`), mais **seulement autour d'un camion à quai** et avec 5 objets (cabine, cale, butoirs, niveleur,
lampe). Il manque : une scène **sans camion**, et trois objets.

## 2. Ce que voit et fait l'élève

- Une scène iso **« Le poste »** : le **local de charge** (borne de charge murale, un ou deux transpalettes) et le **quai vu de l'intérieur** (porte
  fermée, mur). Deux vues comme le quai (« Le local de charge » / « Le quai »), un bouton pour passer de l'une à l'autre.
- L'élève **clique ce qui ne va pas** (rond numéroté, comme le quai), puis **« Signaler à {qui} »** ; le collègue répond (`repare` ou texte
  « pas encore réparé »), l'objet se répare ou non (voir §3, `reparable`).
- **L'avertisseur ne se voit pas** : un bouton « **Essayer l'avertisseur** » à côté du transpalette (un seul par engin) : texte « Tu appuies :
  le klaxon sonne. » ou « Tu appuies : rien ne sonne. » (**aucun son** : le site n'en joue pas en classe). L'essai est rangé (jalon possible :
  « avertisseur essayé avant de signaler »). Ensuite l'élève peut marquer l'engin (défaut `avertisseur`) comme les autres.
- **« C'est bon, je prends mon poste »** (deux clics, comme « C'est bon, on peut décharger ») fige l'inspection. En guidage, un défaut jamais
  signalé arrête l'élève (texte `arret`, sans nommer le point), comme le quai. En copie, rien n'arrête.

## 3. Déclaration proposée (à affiner à l'état des lieux)

```js
inspection: {
  id: 'pelleau-poste-102',                 // un id par séance (état cloisonné : db.inspections[id])
  libelle: 'Mon poste',                    // entrée du menu
  qui: 'Erwan',                            // « Signaler à Erwan »
  consigne: 'Regarde ton poste et ton transpalette. Clique ce qui ne va pas, puis signale-le à Erwan.',
  vues: ['charge', 'quai'],                // ordre d'affichage
  points: [
    { id: 'tp-fourche',  objet: 'transpalette', etat: 'fourcheTordue', ok: false, lib: 'Fourche tordue', repare: 'Je le mets de côté : prends le n° 1.' },
    { id: 'extincteur',  objet: 'extincteur',   etat: 'absent',        ok: false, lib: 'Extincteur absent au quai B', reparable: false,
      repare: 'Il arrive jeudi. En attendant, on ne travaille pas au quai B.' },
    { id: 'plan',        objet: 'affichage',    etat: 'affiche',       ok: true,  lib: 'Plan de circulation affiché' },
  ],
  arret: true, commencer: 'C’est bon, je prends mon poste', bilan: '…',
}
```

**Objets à ajouter au kit `core/iso.js`** (règle : jamais de dessin dans `contenus/`) :

| Objet | Vue | États (le sûr en premier) | Ce qu'on voit |
|---|---|---|---|
| `transpalette` (électrique, conducteur accompagnant ; `n` : numéro peint sur le capot) | charge | `ok` · `fourcheTordue` (une fourche relevée de travers) · `roueAbimee` (galet arrière éclaté) · `batterie` (voyant rouge sur la tête de timon, câble **débranché**) · `arretUrgence` (bouton d'arrêt d'urgence de la tête de timon absent, trou noir) · `fuite` (flaque sombre sous le groupe hydraulique) · `avertisseur` (rien ne se voit : seulement l'essai) | engin jaune ou gris (**jamais vert**), timon, tête de timon, fourches, capot ; câble de charge branché ou non |
| `extincteur` | quai | `present` (extincteur rouge sur son support + panneau) · `absent` (support vide, panneau seul) | le rouge de l'extincteur est un **objet**, pas un verdict : à vérifier avec la règle « le faux reste du texte rouge » (petit objet, pas d'aplat d'interface) |
| `affichage` (plan de circulation) | quai | `affiche` (cadre au mur, schéma de flèches) · `absent` (cadre vide, ou feuille « à afficher ») | lisible à 1366 × 768 |
| `borneCharge` | charge | décor (pas un point) | prise murale, câble |

Un transpalette sans point déclaré est dessiné `ok` ; on peut en déclarer **deux** (n° 1 et n° 2) pour le choix « prends l'autre ».

**Champs nouveaux par rapport au quai** : `reparable: false` (le collègue répond, mais l'objet **reste** dans son état : l'extincteur n'apparaît pas
d'un coup ; le jalon est quand même juste s'il a été signalé) ; `essai` pour l'avertisseur (`{ objet: 'transpalette', n: 2, resultat: 'muet' |
'sonne' }`).

## 4. Jalons, gestes, état (comme le quai, pour que les séances s'écrivent pareil)

- **Jalons** : `securite-<id>` par défaut (« Défaut n° 1 signalé avant de prendre le poste » : libellé neutre, le défaut nommé dans `attendu`, lu au
  bilan), `securite-aucun-faux`, et si un point `avertisseur` est déclaré, `essai-<n>` (avertisseur essayé). **Aucun n'est vrai par inaction.**
  Re-signaler un défaut non réparable n'est pas un faux signalement.
- **Gestes** : `inspection:<id>:signaler` (chaque envoi), `inspection:<id>:essai` (premier essai d'avertisseur), `inspection:<id>:fini` (figeage) ;
  déclencheur `inspectionFinie('<id>')` (modèle : `quaiDecharge`, `dialogueFini`).
- **État** : `db.inspections[<id>] = { marques, signaux, essais, arrete, fait }` ; l'état des objets se **calcule** (jamais rangé), comme `etatsScene`.
- **Copie** (`copie: true`) : premier clic, pas d'arrêt, pas de réparation commentée ; « Je ne prends pas ce transpalette » reste possible (geste).
- **Tirage** : les `points` peuvent être une **fonction de la graine** (`inspection: (graine) => ({ … })`, modèle du quai tiré d'ENT-4.4) ;
  `verifierInspection` contrôle au chargement : objets et états connus, un seul point par objet et par numéro, `ok` cohérent avec l'état.

## 5. Ce qui reste au choix de Claude Code (le dire à Tristan)

- **Où loger le code** : une vue à part `core/types/inspection.js` qui reprend les primitives de l'inspection du quai (recommandation de Cowork :
  le quai suppose un camion partout), ou un mode du quai sans camion. Ne pas recopier : extraire les fonctions communes si c'est simple, sinon le dire.
- Clavier : l'inspection du quai ne le prend pas en charge (arbitrage ENT-6.4) ; même règle ici, à dire dans le compte rendu.
- Charte : aucune couleur d'aplat fixe dans l'interface ; la scène est une image (fond clair en sombre aussi), comme l'animation.

## 6. Tests attendus (bloc `inspection` ou `pelleau`)

- Déclaration refusée : objet inconnu, état inconnu, deux points sur le même transpalette, `ok` incohérent, `reparable` sur un point `ok`.
- Parcours juste : tous les défauts signalés, aucun faux → tous les jalons justes ; inaction → tous faux ; marque à côté → `aucun-faux` faux.
- Avertisseur : déclaré muet, non essayé et non signalé → jalon faux ; essayé puis signalé → justes.
- Non réparable : l'extincteur reste absent après le signalement ; le jalon est juste.
- Guidage : défaut oublié → arrêt sans nommer le point ; copie : pas d'arrêt.
- **Rien ne change** pour les quais existants (blocs `quai-iso`, `action`, `smoby`, `fb-6.4` verts).
- Le DOM ne nomme aucun objet (même garde que le quai) ; 1366 × 768 sans défilement.

## 7. Page d'essai

`outils/essai-inspection-poste.html` : les deux vues, chaque état de chaque objet (un sélecteur), guidage / copie, mouvement réduit simulé.
**Tristan la valide à l'écran avant le branchement** ; ses retours vont au §8.

## 8. Retours d'écran de Tristan (à remplir)

## Compte rendu *(rempli par Claude Code à la livraison)*

**19/10/2026 — lot G-5 (Opus) : la vue branchée.** Rien n'est commité par le lot (le chef relit, commite et pousse).

- **Fichiers** : `core/types/inspection.js` (nouveau : la logique de la maquette déplacée telle quelle, plus la vue, `creerInspection`,
  `etapesInspection`, `lignesInspection`, `etatInspection`) ; `core/types/entreprise.js` (import, création conditionnelle fixe ou tirée,
  contrôle `inspectionFinie` au chargement, `controlerIdentifiants`, gestes connus, graine, `ecranOuvert`, menu « Mon poste », table
  `vues`, état `db.inspections[séance][id]`, branchement, graine au détail de la note) ; `core/types/entreprise-options.js` (option
  `inspection`) ; `core/declencheurs.js` (`inspectionFinie`, `tous` garde `.inspections`) ; `styles/inspection.css` + une ligne dans
  `index.html` ; `outils/essai-inspection-poste.js` / `.html` (parties 2 et 3 jouées dans le vrai moteur, partie 1 inchangée) ;
  `activites/FICHE-SEANCE.md` (section « Vue « Inspection du poste » », une ligne d'option, une ligne de gestes) ;
  `outils/test/inspection.mjs` (18 cas) et deux lignes ajoutées dans `outils/test.mjs` (`BLOCS`, `GROUPES` 3). **Supprimé du disque** :
  `outils/essai-inspection-poste-logique.js` (plus rien ne l'importe ; `git rm` à faire par le chef).
- **Logement du code (§5)** : vue à part, **rien importé du quai** et `quai.js` non touché. Raison : `pointTouche`/`zonesScene` du quai
  sont liés au camion ; `signalerScene`, `validerScene`, `jalonsScene` sont des fonctions internes de `creerQuai` (fermeture sur
  `db.quais[id]`), exportables seulement en les réécrivant. La logique propre à la vue est celle de la maquette, même algorithme.
- **Écarts avec le brief / la maquette** : (1) `essai` sur un transpalette qu'aucun point ne déclare est **refusé** (demande du chef) ;
  (2) libellé du jalon `essai-<n>` : « Avertisseur du n° X essayé avant de prendre le poste » ; (3) les balises `data-iso-…` que le kit
  pose sur les défauts du transpalette (`data-iso-fourche-tordue`, `-voyant`, `-fuite`…) nommaient le défaut dans le DOM : la vue les
  **retire** du dessin (le kit n'a pas d'option `balises: false` pour le transpalette, à ajouter un jour dans `core/iso.js`) ;
  (4) la copie garde la confirmation **en deux clics** de la maquette validée (« premier clic » lu comme : la marque se pose au premier
  clic, sans retour) ; (5) les réglages « un bouton d'avertisseur par engin dessiné » et « Montrer les zones » de la maquette ne sont
  plus dans les parties 2 et 3 (la vraie vue n'a qu'un bouton par essai déclaré ; les zones restent visibles en partie 1) ; (6) un clic
  hors du cadre dit aussi « Clique un objet du poste. ». Clavier : boutons oui, marques non (comme l'inspection du quai).
- **Tests** : bloc `inspection` **18/18** ; non-régression `socle dependances fb-6.4 quai-iso dialogue localiser inspection action chep-91
  pelleau-101` **384/384**, sans modifier aucun de leurs cas. Sabotages joués puis remis (chaque fois le bloc relancé) :

  | Sabotage | Cas tombé |
  |---|---|
  | `securite-aucun-faux` juste sans signal (jalon vrai par inaction) | « inaction — aucun jalon vrai » |
  | `cliquer` pose une marque sans objet (marque dans le vide) | « un clic dans le vide ne pose rien » |
  | l'arrêt cite le défaut oublié | « guidage — arrêt sans nommer le point » |
  | état rangé sous `db.inspections[id]` (non cloisonné) | « état cloisonné par séance » (+ 13 autres) |
  | arrêt aussi en copie | « copie (évaluation) » |
  | `reparable: false` ignoré | « extincteur reparable: false » |
  | `essai-<n>` seulement quand il est muet | « avertisseur » |
  | entrée « Mon poste » même sans `inspection` (alerte 13) | « alerte 13 » |

- **Captures** (1366 × 768 et 1280 × 720, vraie vue) : rendues au chef. La vue tient sous le bandeau ; dans la séance d'essai, la
  **page** défilait à 1280 × 720 à cause du **menu** (écrans de données de l'univers d'essai) : `menu: []` ajouté à l'univers d'essai ;
  et en copie, quand le **bandeau** passe sur deux lignes (nom d'entreprise long + « Évaluation », « Rendre ma copie »), le cadre du
  moteur (`.ent-page`) dépasse de ~35 px alors que la vue tient : trait du moteur, pas de la vue (nom de l'essai raccourci). À regarder
  sur ENT-10.4 (copie) avec le vrai nom « Transports Pelleau ».
- **À vérifier par Tristan à l'écran** (`outils/essai-inspection-poste.html`, parties 2 et 3) : la place du panneau à droite de la
  scène ; la phrase grise « Clique un objet du poste. » ; le filet terre de l'arrêt ; la réponse « Oui, je sais : c'est noté. » au
  re-signalement de l'extincteur ; la phrase de bilan sous « Tu as pris ton poste » ; la copie en deux clics.
