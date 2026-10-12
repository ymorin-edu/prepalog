# Brief de chantier moteur — Vue Tournée « camion » : fenêtres d'ouverture, conduite, vides, plan de chargement

> **📋 Phrase à copier-coller dans ccode — LOTS 1 à 3 (ce qu'il faut pour ENT-6.9) :**
>
> ```
> Lis docs/EN-COURS.md puis docs/briefs/MOTEUR-vue-tournee-camion.md. Fais d'abord l'état des lieux en lecture seule (§2) et dis-moi ce qui existe déjà. Puis implémente les LOTS 1, 2 et 3, avec la page d'essai de la §8 avant toute séance. Annonce la durée avant de commencer.
> ```
>
> **📋 Phrase — LOT 4 (vides et place), plus tard :** `Lis docs/briefs/MOTEUR-vue-tournee-camion.md et implémente le LOT 4, avec sa page d'essai.`
> **LOT 5 (plan de chargement)** : **à cadrer avec Cowork avant toute construction** (maquette à valider).

**Statut** : en cours — **lots 1 et 2 livrés le 12/10/2026, lot 3 : profil porteur livré**, carte de la côte reportée à ENT-6.9 (choix de Tristan), page d'essai à faire *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 06/10/2026
**Conversation d'origine** : Cowork (Opus), cadrage d'ENT-6.9 ; fiche projet `claude/prepalog-reprise-6.9.md` (décision 65 :
« on peut mettre les 4 cas dans le moteur et utiliser 1 et 2 pour cette séance »).
**Modèle** : **Opus** (vue du moteur).
**Fichiers** : `core/types/tournee.js`, `core/types/carte.js` si besoin, `core/types/grille.js` (lot 2, cellules de tronçon),
`styles/base.css`, `outils/carte/itineraires.py`, `outils/carte/construire.py`, `outils/carte/calibrer.mjs`, tests.
**Un seul chantier moteur à la fois** : s'inscrire dans `docs/EN-COURS.md`. Ordre des chantiers (Tristan, 05/10) : clôturer
Smoby, puis la vue animation, puis France Boissons → ce chantier passe **après la vue animation**, sauf décision contraire.

## 1. Pourquoi

La vue Tournée a été écrite pour un **vélo-cargo en ville** (Boost, 1re) : une seule vitesse, des créneaux « livrer avant »,
un plafond de charge. La 2de (France Boissons) et la suite de l'année demandent un **porteur 16 t sur une côte** : autoroute
puis petites villes, bars qui n'ouvrent qu'à 10 h, 4 h 30 de conduite, vides repris en route, plan de chargement (C1.3 :
« déterminer un itinéraire ; les temps de conduite, de repos et de travail ; élaborer un plan de chargement »).
**Tout est déclaratif** : une séance qui ne déclare rien garde exactement le comportement d'aujourd'hui (ENT-3.1 à 3.4 vertes
**sans modification**).

## 2. État des lieux d'abord (lecture seule, à dire à Tristan)

Ce que Cowork a lu le 06/10 dans `tournee.js` (en-tête) : `horaire { depart, limite, vitesse, service }`, service par colis,
`creneau: { avant }`, phases, `etatInitial`, `sansVerdict`, `fige`, `onglets`, `termine`, jauges muettes, `bilanDe` avec
`arrivees`, `creneaux`. À vérifier : comment le quai se désactive ; si la feuille peut lire **les km d'un tronçon** et **le
nom de l'arrêt n° i** (le bloc C de Boost lit-il déjà le client par rang ?) ; si les **phrases à choisir** acceptent des menus
calculés depuis les données ; comment `itineraires.py` filtre les voies (profil vélo : `motorway`/`trunk` exclus, sens unique
ignoré dans les petites rues).

## 3. LOT 1 — Fenêtres d'ouverture (pour ENT-6.9)

1. `creneau` accepte **`apres`** (pas avant), **`avant`**, ou **les deux** (fenêtre) : `{ apres: 10*60, avant: 11*60+30, libelle }`.
2. **Arrivée avant l'ouverture = attente** (défaut, question ouverte d'ENT-6.9 §11) : le camion repart à `apres + service`.
   Option `tropTot: 'attente' | 'rate'` sur la vue (défaut `'attente'`). L'attente **n'est pas de la conduite**.
3. `bilanDe` expose par arrêt : `arrivee`, `attente` (min), `depart` ; `creneaux[i].trop` = `'tot' | 'tard' | null` ;
   `creneauxRates` ne contient que les « trop tard » en mode attente.
4. Jauges : en guidage, elles disent **que** (« trop tôt chez X : le camion attend », « X : après 11 h 30 »), **jamais de
   combien** ni l'heure ; muettes comme aujourd'hui avec `jaugesRepere` / `sansVerdict`. Fiche du client sur la carte et dans la
   liste : « ouvre à 10 h », « avant 11 h 30 », « de 10 h à 11 h 30 ».
5. `calibrer.mjs` applique la même règle (attente).

## 4. LOT 2 — Approche, conduite et pause (pour ENT-6.9)

1. **Approche hors carte** : `horaire.approche: { km, vitesse: 90, libelle: 'A13 Buchelay → sortie de Touques', retour: true }`.
   Le trajet part du dépôt réel, roule `km` à `vitesse` jusqu'au point d'entrée de la carte (le « départ » du plan), et revient
   de même si `retour`. Bandeau : « {libelle} : {km} km d'autoroute ».
2. **Deux vitesses** : `vitesse` reste celle de la carte ; l'approche a la sienne.
3. **Conduite comptée à part** : `bilan.conduite` (min) = approche aller + km sur la carte ÷ vitesse + approche retour. Le
   temps aux arrêts et l'attente n'y entrent pas.
4. **Pause réglementaire** : `horaire.pause: { apres: 270, duree: 45 }`. Si `conduite > apres`, `bilan.pauseDue = true` et
   l'heure de retour inclut `duree` (le chauffeur la prend ; simplification : on ne place pas la pause dans le temps, on l'ajoute).
   Jauge « Conduite » : repère 4 h 30, dit **que** la limite est franchie (« pause de 45 min obligatoire »), pas de combien.
   Option `pause.plafondJour: 540` (9 h) prévue, non utilisée en 6.9.
5. **Sans quai** : option `quai: false` — pas de bouton « laisser à quai », tous les points sont à servir ; « Envoyer » (ou
   `termine`) refuse une tournée incomplète, avec un message.
6. **Feuille** (`grille.js`) : cellules recopiées depuis la tournée, rang par rang (lignes réservées, comme le bloc C de Boost) :
   `{ arret: i, champ: 'nom' | 'km' | 'creneau' }` — `km` = **km du tronçon** de l'arrêt i−1 (ou de l'entrée) à i, donné par la
   carte ; plus `{ tourneeKmRetour: true }` (dernier arrêt → sortie). Vides si moins d'arrêts. Si cela existe déjà, le dire.
7. `calibrer.mjs` : approche, conduite, pause, attente — **même formule que la vue** (un seul calcul, comme `serviceDe`).

## 5. LOT 3 — Profil « porteur » et carte d'une côte (pour ENT-6.9)

1. `itineraires.py` : **profil** déclaré dans le JSON de la séance (`"profil": "porteur"`, défaut `"velo"` = aujourd'hui,
   **octet pour octet** pour Boost) : voies `motorway`, `trunk`, `primary` à `residential` oui ; `pedestrian`, `cycleway`,
   `footway`, `steps`, `service` non ; **sens uniques respectés partout**. Si l'extraction OSM garde `maxweight` / `hgv=no`,
   les exclure ; sinon le dire (limite connue, non bloquante).
2. `construire.py` : une emprise **côte normande** (Honfleur → Houlgate, ≈ 35 × 15 km), **communes** au lieu de quartiers
   (contours INSEE ou OSM `admin_level=8`, Licence Ouverte / ODbL) avec leur nom ; un point d'entrée « Sortie de l'A13
   (Touques) » ; adresses BAN géocodées comme pour Boost (Chrome de Tristan si besoin). Lisibilité au vidéoprojecteur à vérifier.
3. Le profil vélo de Boost **ne change pas** (tests Boost verts sans modification).

## 6. LOT 4 — Vides et place dans le camion (pour plus tard dans l'année)

Une **mesure qui baisse et remonte** : le camion part chargé ; à chaque arrêt il **dépose** des pleins et **reprend** des vides.
`mesures: [{ id: 'place', libelle: 'Places au sol', unite: 'pal.', max: 14, depart: 'somme', depose: 'pleins', reprend: 'vides' }]`
- charge au départ = somme des `pleins` des arrêts retenus ; après l'arrêt i : `charge − pleins_i + vides_i` ;
- **le pic** compte (pas le total) : `bilan.pics[id]`, `bilan.depassements` si un point du parcours dépasse `max` ;
- **ordre de traitement à l'arrêt** : on dépose avant de reprendre (défaut, réaliste) ;
- jauge : profil en marches le long de la tournée (guidage) ou repère seul (entraînement) ; feuille : cellules
  `{ arret: i, champ: 'charge' }` ;
- `calibrer.mjs` : même règle. Page d'essai : un gros retour placé trop tôt ne rentre pas, placé plus tard il rentre.

## 7. LOT 5 — Plan de chargement (à cadrer avec Cowork avant construction)

Idée (décision 65, à maquetter) : après la tournée, l'élève **place les palettes dans la caisse** (vue de dessus, N places) ; la
règle dépend de l'accès : `acces: 'arriere'` → le **dernier livré est chargé en premier, au fond** (vérifié, source pro) ;
`acces: 'lateral'` (carrosserie « brasseur » à rideaux) → chaque client accessible de son côté, règle plus souple. Peut
réutiliser le **kit iso** de la vue animation (caisse, palettes, fûts). Jalons possibles : ordre de chargement inverse de la
tournée ; répartition des charges (à décider). **Ne rien construire avant une maquette validée par Tristan.**

## 8. Page d'essai (avant toute séance)

`outils/essai-tournee-camion.html` : décor France Boissons, côte **provisoire** (ou carte de Nîmes si le lot 3 n'est pas fait),
qui montre : un client « ouvre à 10 h » (attente visible), une fenêtre « de 10 h à 11 h 30 », l'approche d'autoroute dans le
bandeau, la jauge de conduite qui passe la pause, l'option sans quai, une feuille qui lit le km de chaque tronçon ; au lot 4,
la jauge de place en marches. **Tristan valide avant ENT-6.9.**

## 9. Tests

Bloc `boost` (ou nouveau bloc `tournee`, une ligne dans `BLOCS`). Pour chaque lot : un cas qui marche, un cas limite, et un
**sabotage** qui fait tomber le cas : attente retirée (Malo en premier ne coûte plus rien) ; service compté dans la conduite ;
approche oubliée dans la conduite ; pause non ajoutée au retour ; profil porteur qui passe par une rue piétonne ; profil vélo
modifié (Boost doit rester octet pour octet) ; au lot 4, total au lieu du pic. **ENT-3.1 à 3.4 et `calibrer.mjs` à nombre fixe :
sortie identique à avant.** « Que, pas de combien » : aucune jauge n'affiche une durée de dépassement.

## 10. Questions ouvertes

- [ ] Arrivée avant l'ouverture : **attente** (défaut) ou « raté » ? (même question dans ENT-6.9 §11)
- [ ] Pause : ajoutée au retour sans la placer dans le temps (défaut) — suffisant pour la 2de ?
- [ ] Lot 4 : places au sol (palettes) ou poids ? (défaut : places, c'est ce qui bloque un camion de boissons)
- [ ] Lot 5 : à cadrer (maquette) avant construction.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

**Lot 1 — fenêtres d'ouverture (12/10/2026)**

- **État des lieux (§2), pour le lot 1** : existaient `creneau: { avant, libelle }`, l'heure d'arrivée à chaque arrêt
  (`bilan.arrivees`), `creneaux[i].rate`, les jauges muettes et les créneaux changés par une phase. N'existaient pas : `apres`,
  l'attente, `tropTot`, `trop`. La fiche du client sur la carte (infobulle) ne disait aucun créneau. `calibrer.mjs` ne
  connaissait que `avant`. Les autres questions du §2 (km d'un tronçon dans la feuille, phrases à menus calculés, filtre des
  voies) relèvent des lots 2 et 3 : pas encore regardées.
- **Fichiers modifiés** : `core/types/tournee.js` (en-tête, `bilanDe`, jauges, liste, étiquettes, refus du report),
  `core/types/carte.js` (infobulle du client : option `notes`), `outils/carte/calibrer.mjs`, `outils/test/carte.mjs`.
- **Écarts par rapport au brief** : aucun sur le calcul. §3.4 lu ainsi : les jauges **muettes** disent *que* (« Trop tôt :
  attente jusqu'à l'ouverture »), jamais combien ni l'heure ; les jauges **parlantes** donnent l'arrivée et la durée de
  l'attente, comme elles donnent déjà le retard d'un créneau raté. Textes neutres sur le véhicule (« on attend qu'il ouvre »).
- **Décisions prises en route** : voir `docs/decisions.md` (12/10/2026, D-9 lot 1). Le défaut « attente » est celui du brief ;
  la question ouverte du §10 reste à trancher par Tristan (`tropTot: 'rate'` existe et est testé).
- **Tests** : 5 cas « fenêtre » dans le bloc `carte` (attente et décalage de la journée recalculés à la main ; pile à
  l'ouverture, mode « raté », trop tard dans une fenêtre ; moteur et calage comptent les mêmes ordres sur une journée où l'on
  attend ; écran parlant, muet, sans verdict, étiquettes, fiche de carte ; refus du report en mode « raté »). Sabotages qui
  font tomber un cas : attente retirée de la vue ; attente retirée du calage ; jauge muette qui donne la durée ; attente en
  mode « raté ». Sortie de `calibrer.mjs` identique avant/après pour ENT-3.1 et ENT-3.2. Suite entière : 1314/1314.
- **Commits** : « Tournée : fenêtres d'ouverture… » (D-9 lot 1).
- **Reste ouvert** : lot 3 ; la page d'essai du §8.

**Lot 2 — approche, conduite, pause, sans quai (12/10/2026)**

- **État des lieux (§2), pour le lot 2** : le quai n'avait pas d'interrupteur (bouton « retirer », liste « Laissés à quai »
  toujours là). La feuille **lit déjà l'arrêt n° i** : elle est engendrée par le contenu depuis le bilan (`b.retenus[i]`, lignes
  réservées comme Boost) ; ce qui manquait, c'était les **km de chaque tronçon** (Boost les reconstituait à rebours depuis l'heure
  d'arrivée). Les phrases à menus calculés et le filtre des voies relèvent du lot 3 / d'ENT-6.9 : pas regardés.
- **Fichiers modifiés** : `core/types/tournee.js` (en-tête, `bilanDe`, jauge « Conduite », bandeau, étiquettes, liste « à placer »,
  refus du report et de « J'ai terminé »), `outils/carte/calibrer.mjs`, `outils/test/carte.mjs`.
- **Écarts par rapport au brief** : §4.6, pas de syntaxe de cellule `{ arret: i, champ }` dans `grille.js` : le bilan donne
  `troncons[id]` (km depuis le point précédent, `null` si le départ n'est pas posé) et `kmRetour`, que le contenu recopie rang
  par rang dans ses lignes, comme il le fait déjà pour le nom et le poids. Un seul mécanisme au lieu de deux ; `grille.js` intact.
  §4.4 `plafondJour` non construit (non utilisé en 6.9). §4.1 « bandeau » lu comme une ligne au-dessus de la carte, reprise en
  étiquette.
- **Décisions prises en route** : voir `docs/decisions.md` (12/10/2026, D-9 lot 2). Questions du §10 : la pause est ajoutée au
  retour (défaut), à trancher par Tristan.
- **Tests** : 7 cas « camion » dans le bloc `carte` (approche : journée décalée, km de la carte inchangés, conduite à la main,
  aller seul, vitesse par défaut ; attente et service hors conduite ; pause juste au-dessus / juste en dessous, arrivées non
  déplacées ; km par tronçon et retour, somme = distance, bouts non posés ; moteur et calage comptent les mêmes ordres avec
  approche et pause ; écran parlant, muet, sans verdict, étiquettes, journée sans approche ; sans quai). Sabotages qui font tomber
  un cas : approche oubliée dans la conduite ; service compté dans la conduite ; pause non ajoutée au retour ; pause retirée du
  calage ; jauge muette qui donne la conduite ; report accepté incomplet sans quai. Sortie de `calibrer.mjs` identique
  avant/après pour ENT-3.1 et ENT-3.2. Suite entière : 1321/1321.
- **Piège vu en route** : le moteur et le calage additionnent les km dans un ordre différent ; à l'égalité **exacte** avec une
  limite (une conduite pile à 4 h 30), l'arrondi peut les départager d'un ordre. Sans effet en séance (des minutes réelles ne
  tombent pas pile) ; le test choisit une limite qui ne tombe sur aucune conduite.
- **Commits** : « Tournée : approche d'autoroute, conduite et pause… » (D-9 lot 2).
- **Reste ouvert** : lot 3 ; la page d'essai du §8.

**Lot 3, partie A — profil « porteur » des itinéraires (12/10/2026)**

- **Découpage (choix de Tristan)** : le §5.1 est fait ; le §5.2 (carte de la côte, communes, point d'entrée, adresses BAN)
  se construira **avec ENT-6.9**, quand les six clients et leurs adresses seront validés (le brief d'ENT-6.9 attend encore
  leurs noms de Cowork). Le §5.3 est tenu.
- **État des lieux (§2)** : `itineraires.py` n'avait qu'un réseau, celui du vélo (`motorway`/`trunk` exclus, sens unique
  respecté sur les grands axes seulement). L'extraction de Nîmes n'a gardé, pour les voies, que `highway`, `name`, `oneway`,
  `service`, `ref`, `layer`, `bridge`, `tunnel`, `area` : **ni `hgv`, ni `maxweight`, ni `access`, ni `junction`**.
- **Fichiers** : `outils/carte/itineraires.py` (profils `velo` / `porteur`), `outils/carte/construire.py` (lit `profil` dans
  le JSON de la séance), `outils/carte/essai-profils.py` (nouveau).
- **Ce que fait le porteur** : §5.1 tel quel, plus la zone de rencontre (`living_street`) permise ; autoroute, bretelle et
  rond-point à sens unique même sans le tag `oneway` (convention OSM) ; `hgv=no`, `motor_vehicle=no`, `access=no|private` et
  `maxweight` sous 16 t exclus — **ils ne jouent qu'avec une extraction qui garde ces tags** (limite connue, non bloquante :
  l'extraction de la côte devra les garder, ainsi que `junction`).
- **Choix faits en route** (voir `docs/decisions.md`) : un client dans une rue hors réseau (rue piétonne) s'accroche à la voie
  permise la plus proche — **à savoir pour ENT-6.9, la brasserie de la rue des Bains** ; pour le porteur, l'accrochage se fait
  seulement sur les voies d'où l'on va partout et d'où l'on revient (sinon une impasse à sens unique rendait une tournée de
  Nîmes impossible). Le vélo garde l'accrochage d'avant.
- **Tests** : hors de la suite Playwright (il faut Python, shapely et les données brutes, absentes de GitHub) :
  `python outils/carte/essai-profils.py` — 12 réseaux fabriqués (rue piétonne, piste cyclable, voie de service, sens unique
  sur petite rue et sur grand axe, sens inversé, autoroute et rond-point sans tag, poids lourds interdits, 3,5 t, 19 t, accès
  privé), un client en rue piétonne, et le réseau réel de Nîmes (56 trajets, 55 différents du vélo, aucun par une voie
  interdite ni à contresens). Sabotages qui le font tomber : porteur par les rues piétonnes ; sens uniques ignorés ; autoroute
  sans sens implicite ; `hgv` ignoré ; accrochage hors du cœur du réseau. **Boost régénéré octet pour octet** (`construire.py`
  sur `essai.json`, `boost-ent31.json`, `boost-ent32.json` : aucun changement dans `contenus/`).
- **Commits** : « Itinéraires : profil porteur… » (D-9 lot 3, partie A).
- **Reste ouvert** : la carte de la côte (§5.2), avec ENT-6.9 ; la page d'essai du §8.
