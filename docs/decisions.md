# Journal des décisions

Une ligne par décision, la plus récente en haut : **date · qui · décision · pourquoi (si ça
n'est pas évident)**. Claude Code y ajoute toute décision prise en cours de route ; Cowork la
reporte dans les fiches du projet PREPALOG. Une décision de fond sur la pédagogie reste dans
`docs/fiches/prepalog-finalite.md`.

- 03/10/2026 · Tristan · **ENT-3.2 : un imprévu en cours de journée** (brief `docs/briefs/ENT-3.2-imprevu.md`) : quand la
  tournée de la phase 1 tient tout, un message du responsable arrive (un client annule, un créneau est avancé) et l'élève
  replanifie sur la même carte et la même feuille. Choisi parmi : plusieurs contraintes à la fois, deux vélos-cargos à répartir.
  Maquette « Maquette imprévu ENT-3.2 » validée. Dépend du chantier « données qui changent » pour les valeurs de la journée.
- 03/10/2026 · Tristan · **ENT-3.3 : consigne en trois étapes courtes + pastilles d'avancement** (brief
  `docs/briefs/ENT-3.3-consigne-trois-etapes.md`) : Contrôler → Répondre → Réparer, un seul rôle par écran ; mail d'Inès
  réorganisé en blocs (mêmes six intitulés, le moteur de réponse et les jalons ne bougent pas) ; accueil à quatre étapes ;
  **trois pastilles qui passent au vert quand l'étape est faite** (feuille remplie, réponse envoyée, tournée modifiée) et
  **ne disent jamais si c'est juste**. Maquette « Maquette consigne ENT-3.3 » validée dans l'esprit, pastilles ajoutées au chantier.
- 03/10/2026 · Tristan (sur question) · **ENT-3.1, quartiers de la carte réelle** : Courbessac (6 à 8 km, hors de la
  carte de 5 km) → **Croix de Fer** ; Grézan (pas d'IRIS) → **Gambetta** ; **Costières** = IRIS Marronniers +
  Capouchiné + Maréchal Juin (liste du conseil de quartier), la Ville Active reste à part. Courbessac et Grézan
  deviennent des leurres du menu ; **Valdegour sort** pour garder douze noms (choix de Claude Code).
- 03/10/2026 · Claude Code · **ENT-3.1 refonte de la carte, choix de construction** : (1) noms des clients **dans le
  tableau** au temps 2, pas sur la carte (illisibles au centre-ville) ; (2) **départ à 14 h 00** (par les rues, tout
  ordre attrapait le train à 13 h) : 26 % des ordres tiennent ; (3) quadrillage d'ENT-3.1 calé sur l'**éloignement des
  points** (pas sur « la rue tient dans une case », inutile quand le point est visible) : tout point, entrepôt
  compris, à 210 m au moins d'une ligne, pour que le rond tienne dans sa case même sur un cadre de 440 px ; d'où trois
  rues choisies pour leur position (Edmond-Rostand, Graverol, Roger-Sabatier) ; (4) noms de quartier placés par le
  générateur hors des points, sans mordre sur un autre quartier ; (5) plus de lien vers un plan en ligne.
- 03/10/2026 · Tristan · **Feuille de calcul de moins en moins guidée, avec de l'information à chercher** (brief
  `docs/briefs/ENT-3.x-feuille-moins-guidee.md`, maquette validée dans l'esprit, **chantier reporté**, trop long pour
  le 03/10) : les arrêts cliqués arrivent dans la feuille **sans leur poids** (à chercher dans le mail et à taper) ;
  3.1 guidée (étapes, exemples), 3.2 sans étapes ni exemples, 3.4 sans aide avec brouillon libre.
  **Règle pour tous les scénarios à venir : les données changent d'une séance à l'autre** (départ, train, vitesse,
  temps par arrêt, charge utile, créneau), **sauf quand deux séances se jouent dans la même journée de travail**
  (ENT-3.2 et 3.3 gardent la même journée).
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
- 03/10/2026 · Tristan · **ENT-2.1 : les mails arrivent dans l'ordre de la trame** (option A) : Bienvenue, consigne de Nadia, retour client, casse ; le plus récent reste en haut de la boîte. Seules les dates des mails changent, les mouvements de stock gardent les leurs. Le badge « 4 » dès l'arrivée est gardé (« comme un matin au poste »).
- 03/10/2026 · Tristan · **Option B mise en réserve : messages qui arrivent en cours de séance** (au bout d'un temps, quand un jalon est validé, ou quand l'élève ouvre un écran). Demande au moteur à cadrer plus tard (Opus, conversation neuve) ; Claude Code la rappelle à Tristan après le chantier moteur de 3.1.
- 03/10/2026 · Tristan · **Réponse écrite préremplie** : un mail peut déclarer `amorce`, le champ « Répondre » s'ouvre alors avec ce texte (curseur au bout de la première ligne). Sans `amorce`, rien ne change. ENT-2.1 y met les six intitulés de Nadia ; envoyer l'amorce telle quelle ne valide aucun jalon. Moteur : `core/types/entreprise.js` ; un cas ajouté au bloc `cdiscount` ; suite 336/336. À réutiliser dans les séances à réponse écrite (ENT-2.3, Boost).
