# Brief moteur — Vue « Localiser » : situer un lieu sur la carte de France (région → département → ville) — pour Action ENT-8.1, puis toute entreprise

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/chantiers.md puis docs/briefs/MOTEUR-vue-localiser.md en entier, et ouvre la maquette docs/briefs/action/maquette-localiser-action.html dans le navigateur. Commite d'abord les fichiers de docs/briefs/action/ et les trois briefs Action (MOTEUR-vue-localiser, ENT-8.1, ENT-8.2) s'ils ne le sont pas. Fais l'état des lieux du §8 en lecture seule et dis-moi ce que tu réutilises et ce qui est neuf. Annonce la durée avant de commencer. Lot par lot : montre-moi une capture des contours (lot 1) avant d'écrire la vue cliquable (lot 2).
> ```

**Statut** : à implémenter
**Date du brief** : 15/10/2026
**Conversation d'origine** : Cowork (Opus), cadrage d'Action (CAP OL) du 15/10/2026 — fiches du projet
`claude/prepalog-action-cadrage.md` (décisions 3, 4, 9, 10, 11) et `claude/prepalog-action-deroule-8.1-8.2.md`.
**Maquette validée par Tristan le 15/10/2026 à 18 h 57** : `docs/briefs/action/maquette-localiser-action.html` (générateur des contours :
`docs/briefs/action/maquette-localiser-build_geo.py`). **Attention** : le fichier du dépôt est la version de 18 h 21. Il montre encore le
**port de Marseille-Fos** et n'a pas de trajet sur la France entière (la boucle des flèches y est vide). Les décisions de 19 h (port =
**hub d'import du Havre à Gonfreville-l'Orcher**, trajet fléché sur la France entière quand les lieux sont éloignés) sont écrites ici :
**ce brief passe avant la maquette** quand ils diffèrent.
**Modèle** : **Opus** (vue nouvelle du moteur). **Un seul chantier moteur à la fois** : s'inscrire dans `docs/EN-COURS.md`.
**Place dans l'ordre** : **avant ENT-8.1** (`docs/briefs/ENT-8.1-action-se-situer.md`), qui en est la première séance.
**Durée estimée par Cowork** (à confirmer après l'état des lieux) : ≈ 5 à 7 h en trois lots. Ce qui prend le temps : le build des contours
(deux niveaux de détail, contrôle, reproductibilité), les essais d'affichage au zoom, la suite de tests (parcours, niveaux, reprise, gestes,
questions au fil). Version courte possible : lots 1 et 2 suffisent pour essayer ENT-8.1 ; le lot 3 (fin dessinée, réseau, encart, lieu bonus)
peut suivre.

---

## 1. Le besoin

**Règle CAP de Tristan (15/10/2026, toutes entreprises)** : à **chaque découverte d'entreprise**, l'élève de CAP **situe les lieux sur une
carte de France**. Déroulé voulu par Tristan : 1) la France découpée en régions → l'élève clique la région ; 2) la région découpée en
départements → il clique le département ; 3) dans le département, il **choisit la ville parmi 4 points marqués** (choix C, décision 4) ;
4) à la fin, il voit la ville sur la carte de la France entière.

La vue doit **servir à toutes les entreprises** (CAP d'abord, Bac Pro possible) : rien d'Action dans le moteur. Le contenu déclare ses
lieux ; le moteur fournit la carte, le geste, l'aide, la note et la fin.

**Fini quand** : une séance déclare `localiser: { … }` dans `creerEntreprise`, l'élève situe chaque lieu en trois clics guidés, la région
et le département sont notés au premier essai, l'étape ville se joue sans note, et la fin montre la France entière avec les lieux, le trajet
de la marchandise et les autres sites de l'entreprise.

## 2. Les décisions qui encadrent le chantier (Tristan, 15/10/2026)

1. **Trois étapes par lieu** : région → département → ville (4 points : 1 bon, 3 villes **réelles du même département**).
2. **Notation (décision 9, après essai de la maquette)** : « le niveau ville est difficile » → **seules la région et le département sont
   notés**, au **premier essai**. L'étape ville reste (même geste, même aide après 2 erreurs) mais **sans note** et **hors du bilan**.
3. **On recommence jusqu'à trouver** : une erreur dit « Ce n'est pas la bonne région. Essaie encore. » ; **après 2 erreurs** sur la même
   étape, la bonne zone (ou le bon point) est **entourée en pointillés terre** (« Regarde la zone entourée. »). Le jalon garde le premier
   essai (comme `premierEssai` de la visite Smoby).
4. **Fin** : retour sur la France entière avec chaque point posé à sa couleur ; **si les lieux sont éloignés** (cas d'Action : Le Havre,
   Ensuès, Nîmes), **trajet en pointillés fléchés sur la France entière** (port → entrepôt → magasin) avec les noms ; **s'ils sont
   proches**, encart zoomé du trajet. Les **autres sites de l'entreprise** en ronds creux (« autres entrepôts Action »).
5. **Niveaux de l'élève** (`db.aisance`) — repris de la maquette :

   | | Étape région | Étape département | Étape ville | Fiche du lieu (colonne) |
   |---|---|---|---|---|
   | **Accompagné** | noms des régions | **nom et numéro** des départements | **noms écrits sur les 4 points** | ville, département (nom et numéro) |
   | **Standard** | noms des régions | **numéros** des départements | points sans nom + **villes repères** (carrés gris) + **indice** d'une phrase | ville, département (nom et numéro) |
   | **Confirmé** | **aucun nom** | **aucun numéro** | points sans nom + villes repères, **pas d'indice** | **la ville seule** |

   Le confirmé peut recevoir en plus un **lieu bonus** (`bonus: true` dans le contenu ; ENT-8.1 : l'entrepôt de Labastide-Saint-Pierre).
6. **Couleurs** (règle « bleu = client », fiche `prepalog-vues-transport.md`) : **magasin = bleu**, **entrepôt = terre**, **port = encre** ;
   **vert plein seulement pour « juste »** (la zone trouvée prend `--vert-pale` et le trait `--vert`) ; le faux = **trait rouge**, jamais
   d'aplat rouge. Le décor (mer, zones éteintes, contours) recule dans les tons du papier.
7. **Données** : contours **IGN Admin Express COG** par `gregoiredavid/france-geojson` (**Licence Ouverte**), embarqués (aucune requête
   extérieure). La maquette prend la version simplifiée : contours **un peu grossiers au zoom département** → **la vraie vue prend la version
   non simplifiée (ou moins simplifiée) au zoom département**. Les **positions des villes** de la maquette sont **approchées** : la vraie vue les
   reprend **dans OpenStreetMap** (objet OSM cité dans le contenu, comme `outils/carte/decathlon.json`).
8. **Aucune saisie de texte** : tout se fait en cliquant (public CAP).

## 3. Ce que l'élève voit et fait

Écran en deux colonnes (comme la maquette) : à gauche le **panneau** (≈ 330 px), à droite la **carte**.

- **Panneau** : « Lieu 1 sur 3 » (compté sur les lieux **de cet élève** : un confirmé avec bonus lit « sur 4 », sans mot « bonus ») ;
  la **pastille** du lieu (lettre `lettre` du contenu, bordure à la couleur du type) ; le **nom** et le **rôle** du lieu (texte du contenu) ;
  la ville (et le département selon le niveau, §2.5) ; la **consigne de l'étape** (« Clique la région où se trouve ce lieu. » / « Clique
  maintenant le département. » / « Clique la bonne ville parmi les points. » / « Voilà où se trouve ce lieu en France. ») ; l'**indice**
  (standard, étape ville) ; le **message** juste / faux ; la **file des trois étapes** (Région, Département, Ville : en cours, faite) ;
  le bouton « Lieu suivant » puis « Voir le bilan ».
- **Carte** : la France en régions ; au clic juste, la région passe en « juste » et la carte **zoome** (animation ≈ 650 ms) sur la région,
  découpée en départements (les autres régions éteintes) ; au clic juste, zoom sur le département, les autres éteints, **4 points** ronds
  (zone de clic élargie, invisible) dans un **ordre stable** pour l'élève ; au clic juste, retour animé sur la France entière avec le point
  posé à la couleur de son type et le nom de la ville ; « Lieu suivant ».
- **Bilan** (dans le panneau, après le dernier lieu) : un tableau lieu × (Région, Département) en ✓ / ✗ **du premier coup**, et « Du premier
  coup : x sur 6 ». **L'étape ville n'y est pas.** Puis la **fin** (§2.4) : la France entière, tous les lieux posés, le trajet fléché ou
  l'encart, les autres sites en ronds creux, la légende (magasin, entrepôt, port, autres sites), le texte de fin du contenu (qui dit ce qui est
  construit).
- **Légende** sous la carte et **mention** : « Contours : IGN Admin Express (Licence Ouverte). Positions : © contributeurs OpenStreetMap. »

## 4. Ce que la séance déclare (option `localiser` de `creerEntreprise`)

Forme proposée (le nom exact des champs est laissé à Claude Code, une ligne dans `OPTIONS` + une section dans `FICHE-SEANCE.md`) :

```js
localiser: {
  id: 'action-carte',                       // id de la vue (état rangé sous cet id, cloisonné par séance)
  libelle: 'Carte de France',               // entrée de menu
  titre: 'Où sont les lieux ?',             // en-tête de la vue (facultatif)
  lieux: [                                  // dans l'ordre du jeu ; ou (db) => [...] (D-1 bis), contrôlé sur une base vide
    { id: 'magasin', lettre: 'M', type: 'magasin',          // type : 'magasin' | 'entrepot' | 'port' | 'usine' | 'site'
      nom: 'Action Nîmes Cap Costières', role: '…',          // textes du panneau
      ville: 'Nîmes', dep: '30', region: '76',               // codes INSEE (COG) du département et de la région
      lonlat: [4.36, 43.81], osm: 'way …',                   // position relevée dans OSM, objet cité
      autres: [{ ville: 'Alès', lonlat: […], osm }, { ville: 'Uzès', … }, { ville: 'Beaucaire', … }],   // exactement 3, même département
      reperes: [{ ville: 'Montpellier', lonlat: […] }, { ville: 'Avignon', lonlat: […] }],              // standard et confirmé
      indice: 'Au sud du département, entre Montpellier et Avignon.',                                     // standard seulement
      etiq: 'h' },                                           // place du nom sur la carte de fin : h, b, g, d
    …,
    { id: 'labastide', …, bonus: true },                     // lieu bonus : seulement chez un confirmé, jamais en évaluation
  ],
  flux: ['port', 'entrepot', 'magasin'],    // ordre du trajet de la marchandise à la fin (ids de lieux) ; facultatif
  reseau: { libelle: 'autres entrepôts Action', sites: [{ ville: 'Moissy-Cramayel', lonlat: […] }, …] },  // ronds creux ; facultatif
  fin: { titre: 'Le chemin de la marchandise', texte: '…' },  // texte du panneau à la fin (le contenu y dit ce qui est construit)
}
```

**Contrôles au chargement** (la séance ne s'ouvre pas, message en français qui nomme le lieu) : `id` en double (entre lieux, ou avec la vue) ;
`dep` absent des contours ou pas dans `region` ; un point (`lonlat` du lieu, de ses `autres`) **hors de son département** (point dans le
polygone, contours détaillés) ; `autres` ≠ 3 ; deux points du même lieu à moins d'une distance minimale (à fixer au lot 2 pour qu'ils ne se
touchent pas au zoom du département, ≈ 8 km proposé) ; un `flux` qui cite un lieu inconnu ou un lieu bonus ; un `type` inconnu ; un texte vide ;
un lieu bonus sans `niveauxPrevus: ['confirme']` dans le `meta`. Les `reperes` peuvent être hors du département (Montpellier pour le Gard).

## 5. Les données : contours de la France (lot 1)

- **Build** (Python, comme `outils/carte/construire-region.py`) : `outils/carte/construire-france.py` lit les contours
  `gregoiredavid/france-geojson` (régions et départements de France **métropolitaine**, Corse comprise ; IGN Admin Express COG, Licence
  Ouverte) rangés dans `outils/carte/sources/france/` (**ignoré par git**, comme les extractions OSM ; récupération décrite en tête du script,
  Claude Code la fait chez Tristan) et écrit **`contenus/france-contours.js`** (module généré, versionné) : régions (code, nom, tracé,
  cadre, point d'étiquette) ; départements (code, nom, région, tracé **simplifié** pour la vue région, tracé **détaillé** pour le zoom
  département, cadre, point d'étiquette) ; la projection (`lonMin`, `latMax`, `k`, `s`, équirectangulaire à 46,5° N comme la maquette).
- **Deux niveaux de détail** : la maquette simplifie à 1,2 (régions) et 0,6 (départements) unités sur une largeur de 1000 : bon à l'échelle de
  la France et de la région, **grossier au zoom département** (décision 7). Le tracé détaillé du département est **plus fin** (tolérance à
  régler au lot 1, voir le poids) ; frontières communes **sans jour** entre départements voisins (simplifier la topologie, pas chaque
  polygone à part, sinon des fentes apparaissent : à vérifier à l'œil au zoom).
- **Poids** : viser **< 600 Ko** pour le module (le site se charge au lycée) ; dire le poids obtenu. Les petites îles sous un seuil sont
  retirées (comme la maquette), sauf si un lieu y est.
- **Reproductible** (alerte 11) : rejoué sur les mêmes sources, le build redonne le même fichier octet pour octet.
- **Contrôle au build** : 13 régions métropolitaines, 96 départements, chaque département dans une région, codes uniques.
- **Licence** : ligne dans `CREDITS.md` (source, licence, date de récupération) et mention affichée sous la carte (§3).
- **Outre-mer** : hors de la carte (une entreprise dont un lieu est outre-mer ne peut pas déclarer `localiser` : le contrôle le refuse).

## 6. La vue (lot 2)

- **Socle commun des cartes** : réutiliser `monterCadre` de `core/types/carte.js` (viewBox, zoom animé, redimensionnement) si l'état des
  lieux le permet ; sinon dire ce qu'il faut séparer. **Rien ne doit bouger pour Boost, ENT-6.9 ni Decathlon** (blocs `boost`, `carte`,
  `fb-6.9`, `carte-region` verts).
- **Fichiers** : `core/types/localiser.js` (vue), `styles/localiser.css` (chargée par `index.html` comme les autres feuilles de vue),
  une ligne dans `core/types/entreprise-options.js`, l'entrée de menu dans `core/types/entreprise.js`.
- **Clic** : zones et points cliquables à la souris ; au **clavier**, Tab parcourt les zones de l'étape (ou les 4 points), Entrée / Espace
  choisit ; **focus gardé** au redessin (règle de la charte). Nom lu par un lecteur d'écran : le nom de la zone **seulement si le niveau
  l'affiche** (confirmé : « Région 1 », « Département 3 »…, jamais le nom).
- **Erreur** : la zone cliquée prend un **trait rouge** ≈ 0,7 s, message « Ce n'est pas la bonne région. Essaie encore. » (département,
  ville : idem) ; à la 2e erreur de la même étape, la bonne zone ou le bon point est entouré en **pointillés terre** et le message devient
  « Ce n'est pas la bonne région. Regarde la zone entourée. ». Jamais le nom de la bonne réponse dans le message.
- **Juste** : « Bien vu ! », zone en `--vert-pale` / trait `--vert`, puis l'étape suivante ; à la ville : « Nîmes est placée sur la carte. »
- **Taille des textes et des points** constante à l'écran quel que soit le zoom (la maquette calcule la taille sur la largeur du viewBox).
- **Reprise** : rechargement en cours de jeu → l'élève retrouve le lieu et l'étape où il en était, les lieux déjà placés posés ; un premier
  essai faux reste faux.
- **Gel** (questions au fil) : pendant une question, les clics sur la carte ne font rien (curseur normal) ; la carte reste visible.
- **Enseignant** : voit la vue, peut cliquer librement (rien n'est écrit pour lui), sélecteur de lieu pour aller directement à un lieu ; il
  voit les ✓ / ✗ de l'élève dans le détail de la note (Suivi), pas dans la vue.
- **Évaluation** (`copie: true`) : **à trancher plus tard** (§11 n° 1) ; d'ici là, la vue refuse de se charger dans une séance `copie` (comme
  la visite).
- **Écran** : 1366 × 768 et 1280 × 720 **sans défilement de page** ; la carte prend la place disponible, le panneau tient dans sa colonne ;
  au-dessous de 820 px de large, l'un sous l'autre (comme la maquette).
- **Thèmes** : variables de `styles/base.css` (pas de couleur en dur ; le décor ne reprend aucune couleur de repère) ; lisible en thème
  sombre ; la **charte de l'entreprise reste au bandeau** (Action : voir son brief).

## 7. Notation, gestes, déclencheurs, état (lot 2)

- **État** (cloisonné par séance) : par exemple `db.localiser[<séance>][<vue>] = { courant: { lieu, etape }, lieux: { <lieu>: { region:
  { premier: true|false, essais, at }, departement: {…}, ville: {…} } }, fini: <heure> }`. Le premier essai s'écrit **une fois**.
- **Jalons** : une fonction exportée, par exemple `etapesLocaliser(L)` (comme `etapesPlanning`), rend **deux jalons par lieu du socle** :
  `localiser:<lieu>:region` et `localiser:<lieu>:departement`, `'attente'` tant que l'étape n'est pas finie, puis `'ok'` (trouvé du premier
  coup) ou `'ko'` (trouvé après au moins une erreur). La séance y pose `poids` et `groupe`. **Aucun `ecran`** : la carte ne se rouvre pas
  par « Corriger » (premier essai) ; la séance dit pourquoi au bandeau par `finFige`. **L'étape ville n'a pas de jalon.** Un lieu `bonus`
  rend deux jalons `bonus: true` (sans poids ni groupe), `null` chez un élève qui ne l'a pas reçu (règle D-C, lot 3). Inaction = « à faire »
  partout (aucun jalon vrai par défaut).
- **Bilan au premier essai et séance `correction`** : les jalons de la carte sont jugés quand l'étape est finie ; une séance `correction`
  qui mêle cette vue et des fiches doit garder « Corriger » pour ses fiches. **À vérifier à l'état des lieux** (ce que fait le moteur d'une
  séance à `correction: true` dont une partie des jalons n'a pas d'`ecran` : ENT-5.4 l'a déjà, avec `finFige`).
- **Gestes publiés** (questions au fil et messages déclenchés), un par lieu et par étape, **quand l'étape est finie** (le bon endroit
  trouvé, du premier coup ou non), une seule fois : `localiser:<lieu>:region`, `localiser:<lieu>:departement`, `localiser:<lieu>:ville`.
  Plus `localiser:<vue>:fin` (bilan atteint). Les noms suivent la décision de la fiche de cadrage (`localiser:<id>:…`, id = **le lieu**) ;
  les ids de lieu sont uniques dans la séance (contrôle du §4). Une question au fil arrive **entre deux étapes**, après l'animation du zoom.
- **Déclencheur** : `localiserFini('<vue>')` dans `core/declencheurs.js` (vrai quand le bilan est atteint), pour le message qui suit la
  carte et pour `fermetures`.
- **Repérage** (enseignant) : nombre d'erreurs par lieu et par étape (ville comprise) dans `db.indicateurs[<séance>].localiser`, montré dans le
  détail de la note, sans effet sur la note.
- **Corrigé enseignant** : la vue fournit de quoi écrire, par lieu, la région, le département et la ville attendus (la séance l'écrit dans
  son corrigé).

## 8. État des lieux demandé (lecture seule, avant d'écrire)

- `core/types/carte.js` (`monterCadre`), `core/types/carte-itineraires.js` : ce qui se réutilise tel quel pour une carte **sans OSM ni
  rues** (contours seuls) et un zoom sur un cadre (région, département).
- `outils/carte/geo.py`, `construire-region.py` : la forme du module généré, la reproductibilité, l'écriture des tracés ; ce qui est commun
  avec `construire-france.py`.
- `core/types/entrepot-visite.js` (`premierEssai`) : comment le premier essai est rangé et lu, pour faire pareil.
- `core/types/entreprise.js` : ajout d'une vue au menu, gel par les questions au fil (`gele`), `signaux`, `fermetures`, `finFige` ;
  comportement d'une séance `correction` dont des jalons n'ont pas d'`ecran` (§7).
- `core/tirage.js` et le lot 3 de D-C : un lieu `bonus` passe-t-il par une banque de tirage, ou suffit-il de lire `db.aisance` ? (Proposer la
  forme la plus simple qui respecte « bonus caché, jamais en évaluation ».)
- `index.html` (feuille `styles/localiser.css`), `CREDITS.md`, `vendor/` (aucune bibliothèque à ajouter a priori : shapely sert au build,
  pas au site).

## 9. Lots

1. **Lot 1 — Contours** : récupération des sources (chez Tristan, une fois), `outils/carte/construire-france.py`, module
   `contenus/france-contours.js`, ligne `CREDITS.md`, page d'essai statique `outils/essai-localiser.html` (la France, une région, un
   département au zoom). **Capture envoyée à Tristan** (France ; Occitanie ; Gard au zoom ; thème clair et sombre) avant le lot 2. Dire le
   poids du module et la tolérance retenue.
2. **Lot 2 — La vue cliquable** : §3, §4, §6, §7 ; contenu d'essai `contenus/localiser-essai.js` avec **deux jeux** : les trois lieux
   d'Action (positions relevées dans OSM, celles d'ENT-8.1) et un jeu de **trois lieux proches** d'une autre entreprise du site (au choix de
   Claude Code, par exemple Buchelay et deux clients de France Boissons) pour éprouver l'encart du lot 3 ; les trois niveaux ; option
   `creerEntreprise` ; `FICHE-SEANCE.md`.
3. **Lot 3 — La fin et le bonus** : trajet fléché sur la France entière (lieux éloignés) ou encart zoomé (lieux proches) — **règle
   automatique** à proposer (par exemple : le cadre des lieux du `flux` fait moins d'un quart de la largeur de la France → encart) ; réseau en
   ronds creux ; légende ; texte de fin ; lieu bonus du confirmé.

## 10. Tests attendus

Bloc **nouveau** `localiser` (`outils/test/localiser.mjs`, une ligne dans `BLOCS` et dans `GROUPES` de `outils/test.mjs` : **alerte 7, le
dire à Tristan**), sur le contenu d'essai :

- **Build** reproductible (deux builds, même empreinte) ; module chargé **sans réseau** ; aucune adresse d'hébergeur (le test du dépôt reste
  vert) ; 13 régions, 96 départements.
- **Contrôles au chargement** : département hors de sa région, point hors de son département, 2 « autres » au lieu de 3, deux points trop
  proches, `flux` inconnu → la séance ne s'ouvre pas, le message nomme le lieu.
- **Parcours juste** (standard) : 3 lieux, 6 jalons ✓, bilan « 6 sur 6 », fin dessinée, geste `localiser:<vue>:fin` publié.
- **Une erreur à la région** du 1er lieu → jalon région ✗ (les autres ✓), l'élève recommence et finit ; **deux erreurs** → zone entourée en
  pointillés (classe ou attribut vérifié), message sans nom de zone.
- **Ville non notée** : trois erreurs à la ville → aucun jalon ne change, l'étape ville absente du bilan, l'aide apparaît quand même.
- **Inaction** : rien fait → tous les jalons « à faire ».
- **Reprise** : rechargement au 2e lieu, étape département → même lieu, même étape, 1er lieu posé ; un premier essai faux reste faux.
- **Niveaux** : accompagné → noms des départements et noms sur les 4 points ; standard → numéros, indice, repères, aucun nom sur les points ;
  confirmé → aucun nom de région ni de numéro, pas d'indice, panneau sans département ; un confirmé avec un lieu bonus → « sur 4 », jalons
  bonus jugés, **mot « bonus » absent** côté élève ; un standard → lieu bonus absent, ses jalons `null`.
- **Gestes et questions au fil** : chaque geste publié une fois, à la fin de son étape ; une question branchée sur
  `localiser:<lieu>:departement` arrive après le zoom, la carte est gelée tant qu'on n'a pas répondu.
- **Couleurs** : aucun aplat vert hors de la zone trouvée, aucun aplat rouge ; magasin bleu, entrepôt terre ; mention IGN / OSM présente.
- **Clavier** : Tab atteint les zones de l'étape, Entrée choisit, focus gardé.
- **Écran** : 1366 × 768 et 1280 × 720 sans défilement de page (souris sur `boundingBox()`, `scrollIntoViewIfNeeded()` avant tout clic).
- **Enseignant** : clique sans rien écrire dans une base.
- **Non-régression** : blocs `boost`, `carte`, `fb-6.9`, `carte-region` verts.
- **Sabotages** (saboter, voir tomber, remettre) : jalon lu sur le **dernier** essai au lieu du premier → « une erreur à la région » tombe ;
  étape ville comptée dans les jalons → « ville non notée » tombe ; nom de la région dans le message d'erreur → le cas des messages tombe ;
  aplat vert sur une zone fausse → le cas des couleurs tombe ; contrôle « point hors du département » retiré → son cas tombe.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

1. [ ] **Évaluation** (C1.1 + C1.2 en janvier, décision 6 du cadrage) : la carte en évaluation garde-t-elle l'aide après 2 erreurs ?
   (Défaut : la vue est refusée en évaluation tant que ce n'est pas tranché ; à décider avec le brief de l'évaluation.)
2. [ ] Distinguer les types de lieux **aussi par la forme** pour l'impression en noir et blanc (rond, carré, losange) ? La maquette validée
   n'a que des ronds de couleur, avec le nom écrit à la fin. (Défaut : ronds de la maquette ; la lettre de la pastille et le nom écrit
   suffisent à l'écran.)
3. [ ] Seuil « lieux proches → encart » (lot 3). (Défaut : la proposition de Claude Code, montrée à Tristan sur les deux jeux d'essai.)

## 12. Alertes

- **7** : `outils/test.mjs` touché (bloc `localiser`) — le dire.
- **9** : les lieux d'essai d'Action sont réels : positions relevées dans OSM, objet cité.
- **11** : générateur de fichier (module des contours) reproductible.
- **13** : vue nouvelle au noyau, **activée seulement si le contenu la déclare** (aucune séance ne change sans `localiser`).
- Aucune règle Firebase ne doit changer (l'état est dans la base de l'élève, comme les autres vues).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** : bloc / suite entière, nombre de cas, sabotages éprouvés
- **Commits** :
- **Reste ouvert** :
