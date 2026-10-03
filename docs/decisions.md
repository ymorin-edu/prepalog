# Journal des décisions

Une ligne par décision, la plus récente en haut : **date · qui · décision · pourquoi (si ça
n'est pas évident)**. Claude Code y ajoute toute décision prise en cours de route ; Cowork la
reporte dans les fiches du projet PREPALOG. Une décision de fond sur la pédagogie reste dans
`docs/fiches/prepalog-finalite.md`.

- 03/10/2026 · Tristan · **Reprise de l'enchaînement ENT-3.1 → 3.4, étape 1 : la carte d'ENT-3.1** (brief
  `docs/briefs/ENT-3.1-refonte-carte.md`) : la carte réelle remplace le plan schématique ; **contours + noms de
  quartiers visibles** ; **sept points numérotés visibles dès le départ** (guidage : peu de recherche). Ce niveau
  est celui de 3.1 seulement : **la difficulté du repérage doit monter dans 3.2, 3.3, 3.4**. Autres retours à traiter
  ensuite, dans l'ordre et avec maquette : tableur de moins en moins guidé, consigne d'ENT-3.3 floue, 3.2 trop proche de 3.1.
- 03/10/2026 · Claude Code · **Logisim rangé par entreprise, choix de construction** : la pastille Logisim
  passe toujours par les logos, même s'il ne reste qu'une séance ouverte (prolongement de la décision 2 du brief) ;
  une séance dont le numéro n'est dans aucune ligne de `ENTREPRISES` va sous une carte « Autres séances », sans
  logo, toujours en dernier ; la plaque `#f7f4ee` reste une couleur fixe et non une variable (elle ne doit pas
  suivre le thème) ; l'enseignant voit la carte de toute entreprise qui a au moins une séance au registre.
- 02/10/2026 · Tristan · **Logisim rangé par entreprise** (chantier moteur, brief
  `docs/briefs/MOTEUR-logisim-par-entreprise.md`) : Logisim → logos des entreprises (logo seul) → séances de
  l'entreprise ; la liste s'affiche même pour une seule séance ; « Quitter » ramène à la liste de l'entreprise.
  Maquette cliquable dans « Claude outputs ». Plaque claire fixe sous les logos (choix de Claude Code, signalé).
- 02/10/2026 · Tristan · **ENT-3.3 sans `niveaux`**, comme ENT-3.1 et ENT-3.2 : les trois séances Boost restent
  ouvertes à tous les niveaux.
- 02/10/2026 · Tristan · **ENT-3.3 : la collègue est Inès, livreuse vélo-cargo** ; l'élève lui répond **une ligne par
  contrainte** (« respectée ou dépassée », « attrapé ou manqué », « tenu ou raté ») puis trois chiffres (poids chargé,
  arrivée à la Pâtisserie Arnaud, arrivée à la gare), plutôt qu'une liste des contraintes violées : il se prononce aussi
  sur le leurre.
- 02/10/2026 · Claude Code · **ENT-3.3 construite** (`boost-ent33`, `pret: false`, à valider à l'écran) : même journée
  qu'ENT-3.2 (carte, feuille et meilleure tournée importées), pas de menu Plan, 6 jalons « Diagnostic · » / « Réparation · »,
  base `boost` partagée et cloisonnée. Pas de `niveaux` (comme ENT-3.1/3.2). Suite 327/327, 7 sabotages éprouvés.
- 02/10/2026 · Claude Code · **Chantier moteur d'ENT-3.3 livré** (`core/types/tournee.js`, un appel dans
  `entreprise.js`) : `etatInitial` (tournée déjà construite, posée **une seule fois**, marquée `amorce`
  dans la base de l'élève ; « Recommencer » la remet au lieu de vider) et `sansVerdict` (jauges sans
  verdict, sans être une copie ; la feuille garde son « Vérifier »). Inactifs tant qu'une séance ne les
  déclare pas. 9 cas dans le bloc `boost`, 4 sabotages éprouvés ; suite 311/311.
- 02/10/2026 · Tristan · **ENT-3.3 : réponses aux questions du brief** : recommandations de Cowork pour
  1 (même journée qu'ENT-3.2), 2 (deux contraintes sur trois, la troisième en leurre), 3 (« Recommencer »
  remet la tournée du collègue) et 5 (6 jalons, poids égal) ; 4 : jalons distincts, sans toucher
  à `core/prof.js`. **Tournée du collègue : B** — Mercerie Pellet (12 kg) laissée à quai, puis l'ordre le
  plus court (c4 c3 c8 c1 c7 c6 c5, ≈ 11,5 km) : 218 kg pour 180 (surcharge), créneau de la Pâtisserie
  Arnaud raté, train tenu (leurre).
- 02/10/2026 · Tristan · **ENT-2.2 (Cdiscount, inventaire tournant) confirmée validée à l'écran** : elle
  reste `pret: true`. Confirmation donnée à Claude Code après le constat de Cowork (ci-dessous),
  qui n'en trouvait aucune trace écrite.
- 02/10/2026 · Cowork · **Fiches du projet remises à jour** après le passage à Claude Code : tableau
  des chantiers et « où on en est » refondus, nomenclature (tableau des 26 séances relu dans le
  registre) et finalité mises à jour, copies recopiées dans `docs/fiches/`. Pas de décision de fond
  nouvelle ; constat : **ENT-2.2 est `pret: true` sans trace de validation de Tristan à l'écran**.
- 02/10/2026 · Tristan · **Organisation à deux outils** (option 3) : Cowork pour concevoir (briefs,
  supports, mémoire), Claude Code pour construire et pour **commiter et pousser**. Cowork n'écrit
  que dans `docs/`. Le relais passe par `docs/briefs/`.
- 02/10/2026 · Tristan · Une séance en préparation continue de **compter** dans le tableau des
  compétences et l'export CSV (« on laisse comme ça »).
- 02/10/2026 · Tristan · TechPro Distribution (entreprise fictive) **abandonnée** ; le numéro `ENT-2`
  est utilisé par Cdiscount, `ENT-3` par Boost.
- 02/10 · Tristan · 8 entreprises validées (« oui ») : Mondial Relay, IKEA, Cdiscount, Lactalis, Airbus, La Redoute, Action, Geodis. Carte de couverture v2.1 à jour. Chiffres à rafraîchir : Cdiscount, Action, Kuehne+Nagel France ; Airbus à recouper avec une source Airbus.
- 02/10 · Cowork · Trois briefs écrits pour Claude Code dans `docs/briefs/` : ENT-3.3 (Boost, erreur induite), ENT-3.4 (Boost, évaluation en copie rendue), ENT-2.4 (Cdiscount, évaluation inventaire). Ordre conseillé 3.3 → 3.4 → 2.4. ENT-3.3 demande un chantier moteur d'abord (état initial de la tournée). Questions ouvertes dans chaque brief, à trancher par Tristan.
- 03/10/2026 · Tristan · ENT-3.3 validée à l'écran, passée en `pret: true` (visible des élèves). La consigne de la case « poids chargé » (B13) est réécrite pour ENT-3.3 seulement : où lire ce qui reste à quai, forme de la formule, sans donner la cellule. Deux tests qui supposaient la séance cachée ont été mis à jour (`boost.mjs`, `socle.mjs`).
