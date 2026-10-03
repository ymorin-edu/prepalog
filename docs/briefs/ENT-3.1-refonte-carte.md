# Brief de chantier — ENT-3.1 Refonte de la carte (Boost, tournée du vélo-cargo)

**Statut** : à implémenter *(étape 1 sur 4 de la reprise de l'enchaînement ENT-3.1 → 3.4)*
**Date du brief** : 03/10/2026
**Conversation d'origine** : Cowork, 03/10/2026 (retours de Tristan sur l'enchaînement 3.1 / 3.2 / 3.3)
**Maquette validée** : `G:\Mon Drive\Travail\Logistique\1L\Claude outputs\maquette-31-carte.html`
(positions des clients et contours de quartiers y sont **indicatifs**, la correction n'est pas branchée)

## 1. Pourquoi

Retours de Tristan après avoir réfléchi à l'enchaînement : les exercices se ressemblent trop ; la carte
schématique d'ENT-3.1 (quadrillage, blobs, traits) est « trop moche » ; la zone tableur doit être de moins
en moins guidée ; la consigne d'ENT-3.3 est peu claire. **On les traite dans l'ordre, une maquette à valider
à chaque étape. Ce brief ne couvre que l'étape 1 : la carte d'ENT-3.1.** Suivront : tableur moins guidé,
consigne de 3.3, différenciation de 3.2.

## 2. Décisions de Tristan (03/10/2026)

1. **La carte réelle** (celle des séances 3.2+) remplace le plan schématique dans ENT-3.1. Validée à l'écran sur maquette.
2. **Contours des quartiers + noms visibles** (pas « noms seuls ») : « ça facilite l'exercice ici ».
3. **Les sept points restent numérotés et visibles dès le départ** : c'est un guidage, il y a peu de recherche à faire.
   Tristan a écarté l'alternative (points cachés) : elle changerait complètement l'exercice.
4. **Ce niveau de difficulté est celui de 3.1 seulement.** Il faudra **le compliquer dans la suite des scénarios**
   (Tristan : « il faudra qu'elle se complique dans la suite »). Échelle de départ proposée, à valider séance par séance :

| Séance | Carte | Ce que l'élève doit chercher |
|---|---|---|
| 3.1 guidage | points numérotés visibles, contours + noms de quartiers | lire la case et choisir le quartier |
| 3.2 entraînement (déjà en place) | points cachés, clic sur la bonne rue, index des rues | situer lui-même les nouveaux clients |
| 3.3 erreur induite | tournée du collègue déjà posée | diagnostiquer, pas repérer |
| 3.4 évaluation | à décider (pas de contours ? noms de quartiers seuls ? clics comptés) | tout seul |

## 3. Ce que l'élève voit dans ENT-3.1 après la refonte

Mail du responsable et accueil : inchangés (à relire, voir §6). Menu « Plan de Nîmes » : la carte réelle
(vue d'ensemble 5 × 5 km, cases A à E × 1 à 5), contours des **sept** quartiers avec leur nom, sept points
numérotés, entrepôt et gare. Sous la carte, le tableau actuel : n°, adresse, **quartier (menu à 12 noms)**,
**case**. Mêmes règles de repérage qu'aujourd'hui (une case fausse tolérée, porte de sortie après 3 essais,
« Mode hors connexion » dans le bandeau, correction dont jalon « débloquer n'est pas valider »).
Puis les noms des clients apparaissent et la **tournée** s'ouvre.

## 4. Demandes au moteur (§ à traiter par un chantier moteur, un seul à la fois)

**À faire en Opus** (vue nouvelle du moteur, règle « modèle adapté »).

1. **Un mode « lire la case » dans `core/types/carte.js`** : la carte réelle avec points numérotés visibles et
   contours de quartier nommés, couplée au tableau de repérage de `plan.js` (case + menu de quartiers,
   `toleres`, `essaisAvantIssue`, `secours`, `blocant`). La correction attendue de la case se **recalcule**
   depuis la position du point (comme `caseDe`), jamais recopiée.
2. **Contours de plusieurs quartiers** (aujourd'hui 2 : Écusson, Jardins de la Fontaine) : la vue doit en
   dessiner N, déclarés par le contenu.
3. Faire coexister `carte` + `tournee` pour ENT-3.1 comme pour 3.2 (déjà acquis depuis l'étape 2 du chantier
   carte) ; vérifier que le mode « lire la case » ne casse pas le mode « clic sur la rue » de 3.2/3.3/3.4.

## 5. Contenu (données)

- `outils/carte/boost-ent31.json` (nouveau, même format que `boost-ent32.json`) puis
  `python outils/carte/construire.py outils/carte/boost-ent31.json` → `contenus/boost-ent31-carte.js`.
- **Les 7 clients d'ENT-3.1 sont à re-situer sur la vraie carte** : adresses BAN (géocodage par le Chrome de
  Tristan, voir `claude/prepalog-boost-cadrage-ent32-34.md`, « Mécanique de récupération des données »).
  Les rues d'ENT-3.1 n'ont pas de numéro : point au milieu de la rue.
- **Les 7 quartiers** viennent des IRIS INSEE regroupés (`outils/carte/quartiers.py`, Licence Ouverte).
  OSM n'a aucun contour de quartier pour Nîmes. Sources brutes : `essai-plan-osm-sources\` (Drive),
  à copier dans `outils/carte/sources/` (ignoré par git).
- ⚠ **Constat déjà fait (02/10)** : sur les 7 rues d'ENT-3.1, seules 3 concordent avec les IRIS
  (Général Perrier/Écusson, Ville Active, Saint-Césaire). Quai de la Fontaine → IRIS Carré d'Art ;
  route de Courbessac → Mas de Mingue ; rue de Grézan → Saint-Baudile ; avenue de la Bouvine → Ville Active
  (ENT-3.1 dit Costières). **Il faut trancher quartier par quartier** (voir questions ouvertes) : le contenu et
  le corrigé de 3.1 changent.
- **La tournée d'ENT-3.1 passe aussi sur la carte réelle** (trajets par les rues, `carte.trajets`). Conséquence :
  les distances changent (la fiche dit 22,1 km), donc le **calage** (237 kg pour 180, départ 13 h, train 16 h 10,
  12 km/h, 6 min par arrêt) est à **revérifier avec `calibrer.mjs`** et les valeurs de la feuille et des jalons
  sont à recalculer par le code. Garder un calage où il faut écarter un client et où l'ordre compte.

## 6. Alertes (voir CLAUDE.md)

- **Alerte 5/9** : entreprise réelle (Boost, Nîmes) : adresses de rues réelles, clients fictifs ; dire le vérifié / construit.
- **Alerte 8** : aucun nouveau `code`, mais une séance `pret: true` change : ENT-3.1 est **en ligne pour les élèves**.
  Construire dans une **copie** (`boost-tournee` reste intacte tant que la nouvelle n'est pas validée), ou
  repasser ENT-3.1 en `pret: false` avant de pousser. Dire à Tristan ce qui a changé si une séance est proche.
- **Alerte 7** : des tests d'ENT-3.1 (bloc `boost`) seront à réécrire : le dire explicitement.
- Supports qui portent l'ancien contenu et sont à régénérer : la **trame Word/PDF d'ENT-3.1**, le **corrigé**
  `contenus/corriges/ENT-3.1.js` (QCM d'éco-droit : inchangé), le mail et l'accueil (quartiers, cases, km).
- `id` `boost-tournee` et `transportId` `boost-ent31` : **jamais modifiés** (chemins Firebase, scores existants).
  Un changement de contenu qui rend des scores anciens incohérents est à signaler.

## 7. Tests attendus

Bloc `boost`. Données : chaque client sur sa rue ; sa case recalculée ; chaque point dans le contour de son
quartier déclaré (ou écart expliqué) ; noms de quartier lisibles entiers. Comportement : mode « lire la case »
avec points visibles, case juste/fausse, tolérance, porte de sortie, mode hors connexion ; 3.2 non régressée.
Sabotages : case acceptée sans comparaison ; quartier mal rattaché ; points masqués par erreur ; calage cassé.

## 8. Critères de validation par Tristan

Page d'essai à jouer (`outils/essai-carte.html` ou équivalent pour 3.1) : voir la carte, repérer les 7 clients,
valider, ouvrir la tournée, finir 6/6. **Vérifier à l'écran au vidéoprojecteur** : lisibilité des noms de
quartiers et des numéros.

## 9. Questions ouvertes (à poser à Tristan avant d'écrire le contenu)

- [x] **Quartiers de la fiche vs contours officiels** : *déplacer l'adresse* (réponse de Tristan, 03/10/2026).
      Les noms de quartiers d'ENT-3.1 restent ; le client prend une rue réelle qui tombe dans le bon contour.
- [x] Les douze noms du menu (7 vrais + 5 leurres) : **mêmes 12 noms, adaptés** si besoin (03/10/2026).
- [x] La tournée d'ENT-3.1 sur carte réelle : **confirmée** (03/10/2026). Recalage avec `calibrer.mjs`.
- [ ] 3.4 : quelle est la complication retenue (voir l'échelle du §2) ? À décider **avant** de construire 3.4,
      pas maintenant.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
