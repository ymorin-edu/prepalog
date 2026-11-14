# ENT-25.1 — « Et si tu choisissais la Logistique ? » (semaine des filières : une réception chez Spartoo)

**Statut : livré** (12/11/2026, refait le 14/11/2026), `pret: true, ouverture: 'prof'` : cachée aux élèves tant que Tristan ne l'a pas cochée dans « Conduite de séance ».

## 1. La demande

Tristan, 12/11/2026 : « semaine prochaine, nous avons la semaine des filières logistique, il faut préparer un travail de découverte pour les
secondes sur prepalog » ; « le but est de mettre en avant le BAC PRO logistique » ; « les élèves sont de GATL » ; « 1h ».

Public : 2de GATL, avant le choix de spécialité de fin d'année (Logistique, OTM, AGOrA).## 2. Le cadrage retenu (14/11/2026)

Historique : une visite de quatre entreprises en fiches (12/11 matin), puis en écrans de jeu (12/11, « plus ludique et interactif »). Le 14/11, Tristan :
« c'est que 30 minutes », puis « je veux tout retirer pour laisser que Spartoo » ; « la carte pour Spartoo, […] une réception comme Spartoo, camion qui
arrive, 1 palette, contrôle qualitatif et quantitatif, mise en stock dans un emplacement puis saisie informatique dans le stock […] tout se fera à l'écran,
pas de trame ». Les versions précédentes sont dans l'historique git (commits 7ad2292 et 43728d3).

| Étape | Écran (vue existante) | Ce que fait l'élève | Points |
|---|---|---|---|
| ⓪ | Carte de France (Localiser) | situer Toolog, l'entrepôt de Spartoo, à Saint-Quentin-Fallavier : région, département | 1 + 1 |
| ① | Le camion arrive (Quai, rendu iso, comme ENT-1.1) | BL de 12 cartons de Puma RS-X (6 paires par carton) ; compter (11), faire le tour (1 carton enfoncé à l'arrière), accepter avec réserves, écrire les réserves, faire signer | comptage 3, décision 3, réserves 3 |
| ② | La mise en stock (Plan d'entrepôt, rangement) | côté A1 (sport), rotation A → T01, N1 ou N2, seul emplacement libre A1-T01-N2-E2 | 3 |
| ③ | La saisie (écran Réceptions) | REC-04140 : lot LOT-PM-2611, 72 paires annoncées, 66 comptées, endommagé, accepté sous réserve ; 66 paires entrent en stock | lot 1, quantités 3, état et décision 2 |

Guide : **Sarah**, élève de Terminale (construite), par messages, au tu. Chaque écran s'ouvre quand le précédent est fini. Charte de Spartoo (celle d'ENT-1.x).
Poids proposés par Claude le 14/11/2026, à valider par Tristan.

**Questions au fil (§4 bis) : proposées à Tristan le 14/11/2026, son choix attendu ; aucune n'est écrite.** (1) signer tout de suite ? ; (2) combien de paires
annoncées ? ; (3) éco-droit : Code de commerce art. L133-3, pourquoi écrire les réserves avant que le chauffeur reparte ? ; (4) pourquoi ranger près des
quais ce qui part souvent ? ; (5) pourquoi saisir 66 et pas 72 ? ; (6) la fiche « Le Bac Pro Logistique en bref » de la version précédente.

## 3. Vérifié / construit (alerte 9)

- **Vérifié** (briefs ENT-1.1 du 06/10/2026 et ENT-1.2 du 09/10/2026) : Spartoo, son entrepôt exploité par sa filiale Toolog à Saint-Quentin-Fallavier (38),
  88 000 m², environ 150 salariés, 2 millions de paires, 100 % RFID, produits rangés par catégorie et non par marque ; Puma, Geodis.
- **Construit** : Sarah ; le quai 7, l'horaire, le chauffeur, le BL BL-77436, le lot, la commande, la palette et ses défauts ; 6 paires par carton (choix de
  Tristan pour ENT-1.1) ; le plan à palettes, le stock et la rotation (le vrai stockage de Toolog est en massifs sur cinq étages) ; la réception REC-04140.
  Place sur la carte : centre de la commune (approchée).

## 4. Choix faits en construisant (à revoir à l'écran par Tristan)

- **Code `ENT-25.1`** gardé (entreprise n° 25 « Le Bac Pro Logistique » au catalogue), mais l'écran porte le nom, le logo et la charte de Spartoo.
- **Non comptée dans les compétences** (`competences: []`), résultat sur 20.
- **Pas de « Corriger »** (`bilanListe: true` au lieu de `correction: true`) : rien ne se corrige (carte au premier essai, BL signé, réception validée) ; le
  moteur refuse `correction` sans écran à rouvrir.
- Quai : sans froid, `recommencer: false`, aides de guidage (règle des couches, détail du comptage, repère, chef de quai), pas de zone de calcul.
- Une seule réception dans la liste (pas de réception piège, contrairement à ENT-1.1).

## 5. Compte rendu

- Fichiers : `contenus/vitrine-logistique.js` (réécrit), `activites/vitrine-logistique.js`, `contenus/corriges/ENT-25.1.js` (quatre étapes),
  `activites/catalogue.js` régénéré. `outils/test.mjs` non touché.
- Tests : bloc `vitrine` (6 cas, `outils/test/vitrine.mjs`, réécrit) : déclaration (10 jalons, 2 + 9 + 3 + 6), ouverture et inaction (0/20, quai, plan et
  Réceptions fermés), parcours juste (20/20, les écrans s'ouvrent l'un après l'autre, 66 paires en stock avec le lot), une erreur par étape (10/20, chaque
  jalon tombe seul), corrigé et document. Éprouvé par sabotage (aucun carton manquant et saisie attendue à 60 : deux cas tombent).
- Trouvé en essayant, **non corrigé (moteur)** : sur le thème sombre de Spartoo, le bandeau vert « Réception validée… » de l'écran Réceptions est presque
  illisible (texte clair sur fond vert clair) ; même défaut dans ENT-1.1. Le message en bas d'écran (« Réception validée : 66 paires entrées en stock ») reste
  lisible. Et le plan dit « Les 1 palettes sont posées » (accord au pluriel du moteur).
