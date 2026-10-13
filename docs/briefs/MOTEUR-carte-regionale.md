# Brief moteur — Carte régionale des itinéraires (route, barge, rail) — pour Decathlon ENT-7.1 à 7.4, puis la Terminale

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/audit-architecture.md (partie carte) puis docs/briefs/MOTEUR-carte-regionale.md. Fais d'abord l'état des lieux du §6 en lecture seule (carte.js, geo.py, construire-cote.py, itineraires.py, extraire-cote.mjs) et dis-moi ce que tu réutilises et ce qui est neuf. Annonce la durée avant de commencer. Lot par lot, et montre-moi une capture de la carte (lot 1) avant d'écrire la vue cliquable (lot 2).
> ```

**Statut** : lots 1 et 2 livrés (13/10/2026) ; lot 3 à faire
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

### Lot 1 — extraction et build (13/10/2026)

- **Fichiers créés / modifiés** : `outils/carte/extraire-region.mjs` (nouveau) ; `outils/carte/geo.py` (emprise `region`, projection à
  50,8° N, `km_geo`) ; `outils/carte/itineraires.py` (ajouts en fin de fichier : `reseau_lignes`, `candidats`, `par_passages`,
  `reseau_porteur_coeur` ; rien d'existant n'a changé) ; `outils/carte/construire-region.py` (nouveau) ; `outils/carte/decathlon.json`
  (nouveau) ; `contenus/decathlon-carte.js` (généré, **167 Ko**) ; `outils/essai-carte-region.html` (page d'essai, pas du moteur).
- **Distances obtenues** (mesurées sur la sphère, arrondies au km par tronçon) :

  | Destination | Mode | Tronçons | Total | Brief (provisoire) |
  |---|---|---|---|---|
  | Rouvignies | route | route 168 | **168 km** | 165 |
  | Rouvignies | barge | barge 194 + camion 13 | **207 km** | 215 + 6 |
  | Rouvignies | rail | rail 162 + camion 45 | **207 km** | 175 + 48 |
  | Dourges | route | route 153 | **153 km** | — |
  | Dourges | barge | barge 263 + camion 3 (2,5) | **266 km** | — |
  | Dourges | rail | rail 162 + camion 3 (2,5) | **165 km** | — |

- **Ordre du CO₂** (facteurs du brief 7.1 §6.2, km arrondis par tronçon) : vers Rouvignies, 13,5 t : barge 61 < rail 67 < route 116 kg ;
  15,8 t : 72 < 78 < 135. Vers Dourges, 13,5 t : rail 38 < barge 73 < route 105 ; 15,8 t : 45 < 86 < 123. **L'ordre voulu tient.**
- **Lieux** (vérifié = objet OSM nommé ; supposé = à confirmer par Tristan) :
  - port d'Anvers : terminal **Antwerp Gateway** (DP World) au Deurganckdok, relation OSM 21119015 — **vérifié dans OSM ; le choix du terminal
    est construit** (le brief n'en nommait aucun) ;
  - terminal de Bruay-sur-l'Escaut : relation OSM 21189603 « Terminal Bruay-sur-l'Escaut » — vérifié ;
  - entrepôt Decathlon de Dourges : nœud OSM 3971089596 « decathlon » dans Delta 3 — vérifié ;
  - **terminal LDCT** : **non nommé dans OSM** ; posé au quai du canal de la Deûle, sur les voies de desserte de Delta 3 — **supposé** ;
  - **entrepôt de Rouvignies** : **non nommé dans OSM** ; posé sur le plus grand entrepôt récent de la ZAC de l'Aérodrome Ouest (way
    427004502) — **supposé**. D'où un camion de **13 km** depuis Bruay (le brief disait 6).
- **Écarts par rapport au brief** :
  - **Rail vers Dourges** : le brief proposait Bruxelles → Mons → Valenciennes → Douai ; par les voies OSM, cela fait 313 km (la ligne
    Mons-Valenciennes ne passe plus la frontière). Pris par Gand → Courtrai → Lille, comme vers Rouvignies (162 km).
  - **Estuaire de l'Escaut (Flessingue)** : hors du cadre. Le cadre s'arrête au nord à environ 51,37° N, et l'agrandir réduirait toute la
    carte ; la mer du Nord tient dans le coin nord-ouest.
  - **Contargo Prouvy** : OSM montre un terminal « Contargo Prouvy » (Contargo Container Escaut Service) à **500 m** du site supposé de
    l'entrepôt de Rouvignies. Le brief 7.1 garde Bruay ; à vérifier par Cowork (si la barge de Decathlon y arrive, le camion final fait
    moins de 1 km).
- **Décisions prises en route** : les kilomètres se mesurent sur la sphère (la projection plate se tromperait d'environ 1 % aux bords) ;
  les trains ne roulent ni sur les lignes à grande vitesse ni dans les faisceaux de gare, mais entrent au terminal par les embranchements ;
  un point de passage s'accroche à la chaussée qui évite un demi-tour ; les noms des lieux sont placés par destination et collés à leur
  point en pixels.
- **Tests** : construction rejouée deux fois sur les mêmes sources, même empreinte (alerte 11) ; modules de Nîmes (×3) et de la côte
  reconstruits, **identiques octet pour octet** ; bloc `dependances` 42/42. Le bloc `carte-region` viendra avec la vue (lot 2).
- **Après l'essai de Tristan (13/10)** : le passage imposé à Valenciennes faisait faire à la route un aller-retour de 4,6 km sur une
  bretelle ; retiré (la route prend l'A2 d'elle-même) : 173 → 168 km. Derniers kilomètres : **bouton qui zoome** (§9 n° 1, choix de
  Tristan). Tracés à rendre plus distincts « en jouant sur les formes et/ou la couleur » : trois variantes dans la page d'essai
  (A formes renforcées, B formes + couleurs, C couleurs et traits simples), choix de Tristan attendu.
- **Reste ouvert** : confirmer LDCT et Rouvignies ; au zoom de Dourges, les noms du terminal et de l'entrepôt se chevauchent (lot 3).

### Lot 2 — la vue cliquable (13/10/2026)

- **Choix de Tristan** : derniers kilomètres par un **bouton qui zoome** ; tracés **variante C** (route trait plein encre, barge tirets
  violets, rail trait ambre à traverses, camion pointillé encre) ; **pas de quadrillage** (aucune séance Decathlon ne lit une case ;
  option `quadrillage: true` pour une séance future) ; noms de villes à déplacer hors des tracés (fait au build : huit directions,
  trois distances, les tracés évités avec la largeur des traverses ; les points ne bougent pas).
- **Fichiers** : `core/types/carte.js` (le socle commun `monterCadre` — viewBox et zoom animé, échelle, repères, bulle,
  redimensionnement — séparé du dessin de la ville ; échelle prolongée à 20 et 50 km ; **Boost et la côte inchangés**, blocs `boost`,
  `carte`, `fb-6.9` 172/172) ; `core/types/carte-itineraires.js` (nouveau) ; `core/types/entreprise.js` (vue `itineraires`, menu,
  repérage) ; `core/types/entreprise-options.js` (option `carteItineraires`) ; `styles/carte.css` (section « la carte des
  itinéraires ») ; `activites/FICHE-SEANCE.md` (ligne d'option et section de la vue) ; `outils/carte/construire-region.py` (placement
  des noms) ; `outils/test/carte-region.mjs` (nouveau) ; **`outils/test.mjs` touché** : `carte-region` ajouté à `BLOCS` et au groupe 4.
- **Décisions prises en route** : la légende est **dans la carte** (coin haut gauche), pas sous la fiche : à 1280 × 720 la colonne ne
  tenait pas ; les échantillons de trait sont posés sur une pastille papier (l'encre de la route disparaissait sur un panneau sombre) ;
  les tracés se cliquent à la souris (zone élargie à 18 px, invisible) mais ne sont pas des arrêts de tabulation : le clavier passe par
  la liste de boutons, une seule fois ; ouvrir un itinéraire est compté (`db.indicateurs[séance].carte[mode]`) sans déclencher de geste
  (ni déclencheur, ni question au fil) ; le choisi grossit de 1,4 et passe au-dessus des autres, avec un halo à l'encre pâle.
- **Tests** : bloc `carte-region` 14/14 (ouverture, distances écrites à la main, ordre du CO₂, forme et couleurs, clic sur chaque tracé,
  clavier, repérage, derniers kilomètres, quadrillage absent / présent, Dourges, 1366 × 768 et 1280 × 720). Sabotages faits : route
  verte → le cas « aucun vert » tombe ; camion dessiné comme la barge → le cas de forme tombe ; facteur barge à 0,05 → le build
  s'arrête (« ORDRE DU CO₂ NON TENU ») sans écrire de fichier. Le build lui-même n'est pas rejoué par la suite (il lui faut Python et
  les extractions OSM).
- **Mesure de l'écran** : la VUE tient à 1366 × 768 et 1280 × 720 ; la page, elle, défile dans le décor d'essai Boost à cause de son
  long menu de gauche (le menu d'une séance Decathlon sera plus court : à revérifier sur la séance).
- **Reste ouvert (lot 3)** : marques d'aléa (écluse de Kain), noms du terminal et de l'entrepôt de Dourges au zoom ; le Suivi de classe
  n'affiche pas encore les itinéraires ouverts (ils sont rangés, comme demandé) ; confirmer LDCT et l'entrepôt de Rouvignies.
