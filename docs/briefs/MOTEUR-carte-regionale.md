# Brief moteur — Carte régionale des itinéraires (route, barge, rail) — pour Decathlon ENT-7.1 à 7.4, puis la Terminale

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/audit-architecture.md (partie carte) puis docs/briefs/MOTEUR-carte-regionale.md. Fais d'abord l'état des lieux du §6 en lecture seule (carte.js, geo.py, construire-cote.py, itineraires.py, extraire-cote.mjs) et dis-moi ce que tu réutilises et ce qui est neuf. Annonce la durée avant de commencer. Lot par lot, et montre-moi une capture de la carte (lot 1) avant d'écrire la vue cliquable (lot 2).
> ```

**Statut** : à implémenter
**Date du brief** : 13/10/2026
**Conversation d'origine** : Cowork (Opus). Décision de Tristan du 13/10/2026 : **carte cliquable** pour ENT-7.1 (brief 7.1 §11 n° 1),
plutôt qu'un dessin fixe. Maquette : `G:\Mon Drive\Travail\Logistique\1L\Claude outputs\maquette-decathlon-7x.html` (écran « Carte
des itinéraires » : tracés approximatifs dessinés à la main, à remplacer par des tracés réels).
**Modèle** : **Opus** (vue nouvelle du moteur). **Un seul chantier moteur à la fois** : s'inscrire dans `docs/EN-COURS.md`.
**Durée estimée** (à confirmer après l'état des lieux) : ≈ 4 à 6 h en trois lots. Ce qui prend le temps : l'extraction OpenStreetMap
d'une région entière (filtrée), le calcul des tracés réels, les essais d'affichage, la suite de tests. Version courte possible : lot 1
+ lot 2 suffisent à 7.1 ; le lot 3 (aléa, Dourges) peut attendre 7.3.

## 1. Ce que l'élève fait sur cette carte

ENT-7.1 (et 7.3, 7.4, puis la Terminale) : un conteneur est au port d'**Anvers** ; trois façons de l'amener à l'entrepôt Decathlon de
**Rouvignies** (ou de **Dourges** en 7.4) : **route**, **barge + camion**, **rail + camion**. L'élève **regarde** les trois itinéraires,
en clique un pour voir sa fiche (distance, terminaux, ruptures de charge, offres reçues pour ce mode), et comprend pourquoi la barge
et le rail finissent en camion. **Rien n'est noté sur cette carte** et rien n'y est un geste de travail (ouvrir, cliquer un itinéraire :
règle du 03/10). Le travail noté est au comparateur (fiche existante).

## 2. Les décisions qui encadrent le chantier

- **Une carte réelle, dessinée en vecteur, rien d'extérieur** (règle des cartes de Boost et de la côte d'ENT-6.9) : fond calculé depuis
  OpenStreetMap au build, rangé dans un module `contenus/…-carte.js`, mention **« © contributeurs OpenStreetMap »** affichée. Aucune
  tuile, aucune requête hors du domaine.
- **Les tracés sont calculés, pas dessinés à la main** : la route sur le réseau routier, la barge sur l'Escaut et les canaux, le rail
  sur les voies ferrées, avec des **points de passage imposés** par le contenu pour coller à l'itinéraire voulu (§4). Les **distances
  sortent du build** et remplacent les distances provisoires des briefs 7.1 à 7.4 (165 / 215 + 6 / 175 + 48 km, etc.) ; le CO₂ des
  devis se calcule ensuite sur ces distances (brief 7.1 §6.2).
- **Les modes se distinguent par la FORME, pas par la couleur** (Tristan imprime en noir et blanc ; un élève daltonien doit s'y
  retrouver) : route = **trait plein épais** ; barge = **tirets longs** ; rail = **trait fin à traverses** ; camion final = **pointillé
  fin**. Légende avec les quatre échantillons.
- **Couleurs** (fiche `prepalog-vues-transport.md`) : `--vert` est réservé à l'ordre d'une tournée — **aucun vert** ici. Le **bleu** dit
  « le client et son emplacement » : seul **l'entrepôt d'arrivée** est en bleu. Le décor recule (eau, frontière, villes) dans sa propre
  palette pâle, sans aucune couleur de repère. **Un itinéraire choisi se distingue par l'épaisseur et le contraste** (les deux autres
  s'estompent), pas par une couleur.
- **Charte Decathlon** (bleue) : au bandeau et au menu seulement (brief 7.1 §2, à vérifier dans le moteur).

## 3. Ce que montre la carte

- **Emprise** : d'Anvers (nord) à Rouvignies et Dourges (sud) — ≈ 51,40° N → 50,25° N, 2,85° E → 4,55° E (≈ 120 × 130 km). À ajuster
  au build pour que les deux entrepôts et le port tiennent avec une marge.
- **Fond** : la mer et l'estuaire de l'Escaut au nord-ouest (Flessingue) ; les **frontières** France / Belgique / Pays-Bas (trait
  mixte gris, libellés « BELGIQUE », « FRANCE », « PAYS-BAS ») ; les **voies d'eau navigables** utiles (Escaut / Schelde, canal
  Dunkerque-Escaut, Deûle, Scarpe canalisée si elle tient) ; les **autoroutes** (gris clair) ; les **voies ferrées principales** (gris
  très clair) ; les **villes repères** en texte (Anvers, Gand, Bruxelles, Malines, Audenarde, Tournai, Courtrai, Lille, Mons,
  Valenciennes, Condé, Douai) avec un petit point. Pas de bâti, pas de rues.
- **Points** : le port d'Anvers (terminaux à conteneurs), les terminaux de **Bruay-sur-l'Escaut** (fluvial) et de **Dourges** (rail-barge,
  LDCT), les entrepôts de **Rouvignies** et de **Dourges (Delta 3)**. Coordonnées à prendre dans OSM et à **vérifier** (nom de l'objet
  OSM cité dans le JSON de la séance, comme `fb-ent69.json`).
- **Quadrillage** de 10 km, lettres et chiffres en bordure (comme la côte : un rond doit tenir dans sa case, alerte 15).
- **Échelle** et **zoom** : ceux de `carte.js` (`monterScene` : zoom animé, barre d'échelle). Un bouton **« Voir les derniers kilomètres »**
  zoome sur Valenciennes – Bruay – Rouvignies (ou sur Dourges) — **ou** un encart fixe comme la maquette (§9 n° 1).

## 4. Les itinéraires (déclarés dans le JSON de la séance, calculés au build)

| Destination | Mode | Passages imposés (proposés) | Puis | Ce qui est construit |
|---|---|---|---|---|
| Rouvignies | route | Anvers → Malines → Bruxelles (ring) → Mons → Valenciennes → Rouvignies (E19 / A2) | — | le choix de l'itinéraire |
| Rouvignies | barge | Anvers → Escaut par Gand, Audenarde, Tournai (écluse de **Kain**), Condé → terminal de Bruay | camion terminal → entrepôt | que Decathlon utilise la ligne |
| Rouvignies | rail | Anvers → Gand → Courtrai → Lille → terminal de Dourges | camion Dourges → Rouvignies | l'itinéraire ferroviaire et l'existence du service |
| Dourges | route | Anvers → Gand → Courtrai → Lille → Dourges (E17 / A1) | — | |
| Dourges | barge | Escaut jusqu'à Valenciennes, puis canal Dunkerque-Escaut par Bouchain et Douai → terminal de Dourges | camion 2 km | |
| Dourges | rail | Anvers → Bruxelles → Mons → Valenciennes → Douai → Dourges | camion 2 km | |

- **Route** : plus court chemin sur le réseau `motorway`/`trunk`/`primary` (profil **porteur** d'`itineraires.py`, extraction qui garde
  `junction`, `oneway`, `hgv`), contraint par les passages.
- **Barge** : les voies d'eau OSM (`waterway=river|canal`, filtrées par nom) fusionnées puis coupées entre les points ; vérifier que le
  tracé suit bien l'Escaut **à travers Gand** (canal de ceinture, `Ringvaart`) — sinon passage imposé supplémentaire.
- **Rail** : plus court chemin sur `railway=rail` (sans `service=yard|siding|spur`), contraint par les passages.
- **Camion final** : route (profil porteur) du terminal à l'entrepôt.
- Chaque itinéraire porte au module : `mode`, `segments: [{ type: 'route'|'barge'|'rail'|'camion', d, km }]`, `km` (total arrondi au km),
  `terminaux`, `ruptures` (nombre de changements de mode), `texte` (phrase de la fiche, écrite par le contenu).
- **Contrôle au build** (échec sinon) : tracés continus, dans l'emprise, distances dans des fourchettes plausibles déclarées par le JSON ;
  **ordre du CO₂** du brief 7.1 §6.2 vérifié pour 13,5 t et 15,8 t avec les distances réelles : vers Rouvignies barge < rail < route, vers
  Dourges rail < barge < route. **Si l'ordre ne tient plus avec les vraies distances, le build s'arrête et Claude Code le dit à Tristan**
  (on ajuste alors les facteurs construits, jamais les distances).
- **Reproductible** : rejoué sur les mêmes extractions, le build redonne le même fichier, octet pour octet (alerte 11).

## 5. La vue (lot 2)

- Entrée de menu « Carte des itinéraires » ; à droite, la liste « Trois façons d'aller à {destination} » (un bouton par itinéraire avec
  son échantillon de trait, son nom, sa distance) ; sous la liste, la **fiche** de l'itinéraire choisi : trajet en une phrase, distance
  par tronçon (« barge 214 km + camion 6 km »), terminaux, nombre de ruptures de charge, **offres reçues pour ce mode** (noms des
  prestataires, lus dans la séance : la carte ne connaît ni les prix ni le CO₂ — « Les prix, dates et CO₂ sont dans les devis »).
- **Clic** sur un tracé (zone de clic élargie, invisible) ou sur un bouton de la liste : l'itinéraire s'épaissit, les deux autres
  s'estompent ; un second clic désélectionne. **Clavier** : Tab parcourt les trois itinéraires, Entrée / Espace choisit ; focus gardé au
  redessin (règle de la charte). Texte alternatif de la carte : « Carte d'Anvers à {destination} : trois itinéraires, route, barge et
  rail » (sans chiffre).
- **1366 × 768 et 1280 × 720 sans défilement de page** ; la carte prend la place disponible, la liste et la fiche tiennent dans une
  colonne de 300 px.
- **Repérage** (enseignant, sans note) : itinéraires ouverts, comptés dans `db.indicateurs[séance].carte` (comme les documents).
- **Aucun état de travail** n'est rangé dans la base de l'élève (l'itinéraire choisi est un état d'affichage).
- **Option de `creerEntreprise`** (une ligne dans `OPTIONS` + une ligne dans `FICHE-SEANCE.md`) : par exemple
  `carteItineraires: { module: CARTE, destination: 'rouvignies', libelle, offres: (mode, db) => [noms], marques: [...] }`. Le nom exact
  est laissé à Claude Code ; une vue qui ne sert qu'à Decathlon serait une erreur : **elle doit servir à toute carte « d'un point A à un
  point B par plusieurs modes »** (Terminale : plan multimodal ; Kuehne+Nagel ; Boost 3.5 ?).

## 6. État des lieux demandé (lecture seule, avant d'écrire)

- `core/types/carte.js` : `svgCarte`, `monterScene` (zoom, échelle, cadre) sont-ils réutilisables tels quels pour un fond **sans rues ni
  quartiers** (couches différentes : mer, frontières, voies d'eau, autoroutes, rail, villes) ? Sinon, ce qu'il faut séparer (une
  fonction de scène commune, deux dessins de fond).
- `outils/carte/geo.py` : ajouter une emprise `region` (projection à ≈ 50,8° N, comme `cote` l'a fait pour 49,36° N) ;
  `extraire-cote.mjs` → `extraire-region.mjs` (requêtes Overpass **filtrées** : `natural=coastline`, `boundary=administrative` +
  `admin_level=2`, `waterway=river|canal` nommés, `railway=rail` hors voies de service, `highway=motorway|trunk|primary` avec tags
  d'accès, `place=city|town` pour les villes), en tuiles si besoin ; sorties dans `outils/carte/sources/region/` (**ignoré par git**).
- `construire-cote.py` → `construire-region.py` (même format de module, couches nouvelles, itinéraires) ; `itineraires.py` : le Dijkstra
  sait-il prendre des **passages imposés** et un graphe **ferroviaire** ou **fluvial** ? Sinon, le généraliser (un graphe par mode).
- Poids du module : viser **< 400 Ko** (simplification des tracés à 30-80 m selon la couche) ; dire le poids obtenu.
- `tournee.js` et `plan.js` utilisent `carte.js` : **rien ne doit bouger pour Boost ni pour ENT-6.9** (tests `boost`, `carte`, `fb-6.9`
  verts, modules de Nîmes et de la côte identiques octet pour octet).

## 7. Lots

1. **Lot 1 — Extraction et build** : `extraire-region.mjs`, emprise `region` dans `geo.py`, `construire-region.py`, JSON de la séance
   (`outils/carte/decathlon.json` : points, passages, fourchettes de distances), module `contenus/decathlon-carte.js`, page d'essai
   statique `outils/essai-carte-region.html` qui l'affiche. **Capture envoyée à Tristan** (thème clair, sombre, et impression noir et
   blanc) avant le lot 2. Distances réelles écrites dans le compte rendu : Cowork met à jour les briefs 7.1 à 7.4.
2. **Lot 2 — La vue cliquable** (§5), branchée sur une séance d'essai ; option `creerEntreprise` ; `FICHE-SEANCE.md`.
3. **Lot 3 — Marques d'aléa et seconde destination** : `marques: [{ id, lonlat, titre, texte, quand(db) }]` (ENT-7.3 : **écluse de
   Kain**, « Arrêt de navigation du 02/02 au 05/03 », n'apparaît qu'après le déclencheur ; dessin **sans couleur** : rond blanc, croix
   épaisse à l'encre, cartouche ; le tracé de la barge passe en trait estompé **après** la marque) ; destination **Dourges** (7.4).

## 8. Tests attendus

Bloc `carte-region` (nouveau fichier `outils/test/carte-region.mjs`, une ligne dans `BLOCS` et `GROUPES` de `outils/test.mjs` — **le
dire à Tristan**) :
- **Build reproductible** (deux builds sur les mêmes sources → même empreinte) ; module chargé sans réseau ; **aucune adresse
  d'hébergeur** (le test du dépôt reste vert).
- **Distances** écrites à la main après le premier build (dans les fourchettes du JSON) ; **ordre du CO₂** vérifié à 13,5 et 15,8 t pour
  les deux destinations.
- **Forme** : les quatre types de trait ont des `stroke-dasharray` différents (dont un plein) ; **aucun aplat ni trait vert** ; seul
  l'entrepôt d'arrivée porte la couleur « client » ; mention OSM présente.
- **Clic** sur chaque tracé (souris sur `boundingBox()`, `scrollIntoViewIfNeeded()` avant) → fiche du bon mode ; **clavier** (Tab,
  Entrée) ; second clic → rien de choisi ; focus gardé.
- **Ergonomie** 1366 × 768 et 1280 × 720 : aucun défilement de page.
- **Marque d'aléa** : absente avant le déclencheur, présente après ; texte alternatif sans chiffre.
- **Non-régression** : blocs `boost`, `carte`, `fb-6.9` verts ; modules de Nîmes et de la côte identiques.
- **Sabotages** : colorer la route en vert → le test « aucun vert » tombe ; inverser deux `stroke-dasharray` identiques → le test de forme
  tombe ; facteur barge à 0,05 → le contrôle d'ordre du build échoue.

## 9. Questions ouvertes (valeur par défaut entre parenthèses)

1. [ ] Les derniers kilomètres : **bouton qui zoome** (réutilise le zoom de `carte.js`) ou **encart fixe** comme la maquette ? (bouton :
   moins de code, la carte reste lisible ; l'encart montre tout d'un coup d'œil)
2. [ ] Itinéraire choisi : estomper les deux autres (oui) ; ajouter un halo à l'encre autour du tracé choisi (oui).
3. [ ] Les distances réelles remplacent les distances des briefs, et le CO₂ suit (oui, décidé par le §2).
4. [ ] Libellés des pays et des villes en néerlandais ou en français ? (français : Anvers, Gand, Malines, Audenarde, Courtrai)
5. [ ] Carte imprimable pour la trame (export SVG en noir et blanc par Cowork après le lot 1) ? (oui)

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Distances obtenues** (par itinéraire et par tronçon) :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
