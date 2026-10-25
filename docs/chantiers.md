# Chantiers issus de l'audit du 08/10/2026 — dans l'ordre

> Source : `docs/audit-architecture.md` (les numéros C1 à C19 renvoient à ses sections). Ce fichier
> est la **feuille de route** : Tristan coche, réordonne, raye. Une ligne par chantier, l'état à jour
> dans la colonne « État ». Quand un chantier est livré, une ligne va aussi dans `docs/decisions.md`.
>
> **Règles de marche** (de `CLAUDE.md`) : un seul chantier `core/` à la fois ; suite verte avant tout
> push qui touche `core/`, `styles/` ou `activites/` ; toucher `outils/test.mjs` ou `commun.mjs` se dit
> avant ; une modification de `firestore.rules` ou `database.rules.json` ne protège rien tant qu'elle
> n'est pas **publiée dans la console Firebase**.
>
> **Pourquoi cet ordre.** D'abord ce qui protège la note et les données (lot A), avant d'ajouter des
> entreprises. Ensuite ce qui rend l'ajout d'entreprises, de collègues et de niveaux possible sans
> casser (lot B) : à faire **avant** les dix séances France Boissons si le calendrier le permet, sinon
> entre deux. Enfin l'hygiène (lot C), par petits lots, quand une séance est en attente de validation.

## Vue d'ensemble

| # | Chantier | Audit | Taille | Modèle | `core/` | Dépend de | État |
|---|---|---|---|---|---|---|---|
| **Lot A — protéger la note et les données** | | | | | | | |
| 1 | Règles Firestore : élève, groupes, score ; droits des enseignants | C1 | moyen | Sonnet | non (règles) | — | **livré** (7a86d42 puis 1 bis, 08/10) ; consoles publiées le 09/10 (avec les règles du chantier 11) |
| 2 | Remettre `CLAUDE.md` et `FICHE-SEANCE.md` d'aplomb | C18 | petit | Sonnet | non | — | **livré** (08/10, Fable, doc seule : les fiches de `docs/fiches/` restent à Cowork, voir l'annexe de l'audit) |
| 3 | Tests de règles sur GitHub, hôtes externes partout, port pris lisible | C10a | petit | Sonnet | non (tests) | — | **livré** (08/10, 917ffb6) |
| 4 | Fiabiliser le mode réel (écoutes, échecs remontés, geler, suivi) | C2 | moyen | Sonnet | oui | 3 | **livré** (08/10, b85c141, autre session : écoutes fermées, échecs signalés, démo alignée, tests de règles sur GitHub) |
| 5 | Un bug de contenu n'est plus noté « faux » | C3 | petit | Sonnet | oui | 4 fini | **livré** (08/10, b0776d1) |
| 6 | Suppressions sans traces invisibles, miroir reconstruisible | C4 | moyen | Sonnet | oui | 1, 4 | **livré** (08/10, 9ba74a9 puis d96f6c7) ; console RTDB publiée le 08/10 |
| 7 | Quota Spark : mesurer, puis supprimer les écritures inutiles | C9 | moyen | Sonnet | oui | 4 | **mesuré** (11/10, voir `decisions.md`) : ~63 écritures par élève et par heure, aucune optimisation nécessaire pour l'instant |
| 22 | Console élève : règles bornées, session qui expire, alertes dans le suivi (note à la main sans `parProf`, copie rendue avant l'ouverture, bouton « Vérifier ») | audit du 15/10 | moyen | Fable + Sonnet | oui + règles | 1 | **livré** (15/10/2026, voir `decisions.md`) ; **consoles Firestore et RTDB publiées le 15/10** |
| **Lot B — rendre la croissance possible** | | | | | | | |
| 8 | Fabrique de séance d'entreprise (24 fichiers recopiés) | C6 | moyen | Sonnet | oui (petit) | — | **livré** (08/10, db5ed50 à ee13996) |
| 9 | `entreprise.js` : options figées, `COLORS`/`SHIP` sortis, modules extraits | C5 | gros | Opus puis Sonnet | oui | 8 | **livré** (9a, 9a bis, 9b, 9c ; 9c bis à faire plus tard) |
| 10 | Un seul drapeau « Simulog » dans tout le code | C13 | petit | Sonnet | oui | — | livré (09/10/2026, 7cd4a21, 58fe9e7) |
| 11 | Plusieurs enseignants : co-prof, groupes par prof, orphelins filtrés | C7 | moyen à gros | Opus (décision) puis Sonnet | oui + règles | 1, 6 | **livré** (11a 09/10, 076ec30, 8ad642a ; 11b 09/10, 8ba2042, af1d707, 6191913) ; **consoles Firestore et RTDB publiées le 09/10** |
| 12 | CAP OL et niveaux : référentiel, défauts, TAB-4 | C8 | moyen | Sonnet (Cowork d'abord) | oui | référentiel CAP relevé | **livré** (15/10 : compétences f4f63dd, 250c6bb, 24e2062 ; niveau à choisir 7a847a0 ; avis 2de ffcb8bd) |
| **Lot C — hygiène** | | | | | | | |
| 13 | Tests : compteurs en dur, cas vides, `ATTENDU` complété, doublons | C10b | moyen | Sonnet | non (tests) | — | **livré** (09/10, 06f57c6 à 03eb63e) |
| 14 | Doublons des vues (`ech`, étapes, note, palette, confirmation, mélange, focus) | C11 | moyen | Sonnet | oui | 9 avancé | **livré** (09/10, f3cec57 à d637118) |
| 15 | Couleurs en dur et `base.css` fourre-tout | C12 | petit à moyen | Sonnet | `styles/` + vues | — | **livré** (09/10, 6e52000 à fe50e77) |
| 16 | Champs `meta`, portées et options morts | C14 | petit | Sonnet | oui | décision 14 (cœur) | **livré** (09/10, 77fc170 à 4003e49) ; **console RTDB publiée le 09/10** |
| 17 | Contenus orphelins, trames Smoby à déclarer, commentaires périmés | C16 | petit | Sonnet | non | — | **livré** (09/10, e0bb05e à 2cda9cb) ; Smoby déclaré le 09/10 (17 bis, 9dbfa00, 9d5c144) ; `tab2-stocks.js` livré (générateur, 2f35e24, 09/10) ; reste : la mention TechPro de `core/types/entreprise.js:103` (suivi moteur) ; ENT-5.3 : corrigé de trame laissé non branché (décision de Tristan, 09/10) |
| 21 | Tests lot A : un échec dit sa ligne et son sélecteur, capture d'écran, erreurs JS par cas, `egal`/`vrai` communs, Playwright épinglé | C10c | petit | Sonnet | non (tests) | — | **livré** (09/10, 793c16a) |
| 18 | Deux sessions à la fois : port, `git grep`, `EN-COURS` | C17 | petit | Sonnet | non (`commun.mjs`) | — | **livré** (09/10, 9310e5e à 197c9ba) |
| 19 | Reliquats SCE / Spartoo : acter la règle | C15 | petit | Sonnet | non | 9 | **livré** (09/10, cd622f5) |
| 20 | Stratelog | C19 | ? | Opus | ? | 10 | à cadrer |
| 23 | Accueil léger : catalogue des séances séparé du code | mesure du 22/10 | moyen (≈ 7 h, 4 lots) | Opus cadrage, Sonnet construction | oui | — | **livré** (22/10/2026, 4df8283, 40ca64e, b592008 ; accueil élève 41 requêtes / 0,7 Mo au lieu de 359 / 8,9 Mo) |
| 24 | Vue Localiser : mouvement réduit (pause, zoom) | piste restante de la décision du 22/10 (suite de tests plus rapide) | petit (≈ 1 h) | Sonnet | oui (`localiser.mjs`, deux cas rejoués en mouvement normal, un cas nouveau ; toast attendu dans `action-81.mjs` et `pelleau/commun.mjs`) | — | **livré** (22/10/2026 ; `localiser` 205 s → 54 s, `action-85` 212 s → 67 s) |
| **Lot D — France Boissons (scénario S2, ENT-6.1 → 6.10)** : relevé du 09/10/2026, ordre de la refonte du 07/10 (Q2) | | | | | | | |
| D-A | Questions au fil (lots 1 à 4) | brief `MOTEUR-questions-au-fil` | gros | Opus | oui | — | **livré le 08/10, vue validée par Tristan le 09/10** (page d'essai ; lot 4 à revoir avec ENT-6.1) ; **banques « Avant de commencer » d'ENT-6.1 et 6.2 + calculette sur l'écran d'ouverture livrées (étape A, 10/10)**, avec trois questions au fil d'ENT-6.1 ; geste `messagerie:transfert:<clé>` et réflexion corrigée au bilan ajoutés au moteur |
| D-B | « Jugé au premier essai » | SMOBY-notation lot 3 | — | — | oui | — | **livré** (visite ENT-5.3 ; l'animation garde la première réponse) |
| D-C | Tirage mémorisé, niveaux par scénario, bonus du confirmé (lots 1 à 3) | brief `MOTEUR-tirage-et-niveaux` | 1 à 1,5 j | Opus | oui + règles | D-A | **livré** (09/10 : lot 1 d63d9e0, lot 2 bd61630, lot 3 dans le commit « D-C lot 3 ») ; **aucune règle Firestore modifiée** (la liste blanche de l'élève ferme déjà `niveaux`), rien à publier ; à juger à l'écran : onglet « Niveaux », lecture de la règle de proposition |
| D-D | Images libres FB (11 photos, crédits, script reproductible) | brief `IMAGES-france-boissons` | petit | Sonnet | non | — | **livré (09/10), les 11 validées par Tristan** |
| D-E | Logo France Boissons (`contenus/trames/logos/`) et relevé de la charte | ENT-6.2 §11 | petit | Sonnet | non | — | livré (09/10), à valider par Tristan à l'écran |
| D-1 | Messagerie : bouton « Transférer à… » | ENT-6.1 §7.1 | ≈ 3 h | Opus | oui | D-A, D-C | **livré** (09/10, 754f2f0 : `core/types/transfert.js`, `apresTransfert`, `ecran: 'transfert:<clé>'`, essai dans `outils/essai-questions.html`) ; choix à valider dans `docs/decisions.md` → **ENT-6.1 livrée** (09/10, 8713104 + fddd1f6 + commit de livraison : univers `contenus/france-boissons.js`, `pret: true, ouverture: 'prof'`, à essayer à l'écran ; demande au moteur ENT-6.1 §7.3 : fiche et documents « fonction de la base ») |
| D-1 bis | Fiche, documents et `ecran` « fonction de la base » ; retrait du contournement d'ENT-6.1 | ENT-6.1 §7.3 | petit | Opus | oui | D-1, D-C | **livré** (09/10, 7900170 : `fiche.blocs`, `fiche.documents`, `documents[].html`, `ecran` acceptent `(db) => …`, contrôle sur base vide, avis d'erreur au dessin ; ENT-6.1 déclare ses écrans comme les autres) |
| D-2 | Fiche : case « nombre » (entier, refus, unité), bloc « lignes » si utile | ENT-6.2 §7 | petit | Sonnet | oui | — | **livré** (09/10, a6425ba : `min` et `entier` sur le bloc `nombre`, refus à l'envoi avec la raison, unité après la case ; pas de bloc `lignes`, décision dans `decisions.md`) → **ENT-6.2 livrée** (10/10, cd289ad + c341f32 + commit de livraison : `pret: true, ouverture: 'prof'`, à essayer à l'écran ; demande au moteur facultative : fermer « Répondre » d'un mail par phrases tant que le bon n'est pas envoyé) |
| D-3 | Planning : état des lieux (semaines, ligne retirée par l'aléa, critère « plus ancienne »), calage par script | ENT-6.3 §7 | petit | Sonnet | lecture | — | **livré** (10/10, d3a2a69 : `alea.retraits` (ligne et carte retirées), `aides.verifier: false` (sert aussi à 6.8), gestes `messagerie:phrase:<ligne>` des messages déclenchés ; 54cfd7b : un écran fermé pendant qu'on y est redessine le menu) → **ENT-6.3 livrée** (10/10, `pret: true, ouverture: 'prof'`, à essayer à l'écran) |
| D-4 | Quai : motif « fût endommagé » chiffré, palette de fûts (`forme: 'fut'`), zones de sécurité à cliquer sur le quai iso (Q3 du 07/10 ; §7.3 du brief 6.4 à réécrire par Cowork) | ENT-6.4 §7 | 1,5 à 2 j | Opus | oui | — | **livré (10/10/2026)**, voir `docs/briefs/MOTEUR-quai-inspection.md` §3 (étapes 0 à 6 ; ce qu'il reste ouvert y est regroupé en fin de §3 ; fiche de séance à jour dans `activites/FICHE-SEANCE.md`). Détail : étapes 0-5 et 1 bis livrées (10/10/2026 : référence Spartoo, kit sécurité, mode scène et page d'essai jouable, cale dans le bon sens, lampe et fumée plus lisibles, palette de fûts `forme: 'fut'` et quai à plusieurs palettes, puis unité déclarable `unite: 'fûts'` et libellés de motifs, textes des quais existants inchangés, puis le déchargement au chariot frontal `dechargement.par: 'cariste'` en iso : palettes sorties dans l'ordre inverse du chargement), étape 6 : fiche de séance et garde-fou de l'unité (une palette de fûts sans `unite` est refusée au chargement) ; étapes 3, 4 et 5 à valider à l'écran par Tristan ; suite → **ENT-6.4** (sert aussi à ENT-5.4 et 1.1) |
| D-5 | Plan d'entrepôt, **mode stockage de masse** en iso ; écran « matériel du poste » ; script de l'animation dans le contenu | ENT-6.5 §7 | 12 à 16 h | Opus | oui | D-2 | **livré (11/10/2026)** : lot 1 animation à 8 fûts et palettes gerbables (2d73e85), lot 2 mode `masse` (05c3151), lot 3 la 3D lisible, lot 4 écrans de présentation de l'animation, lot 5 fiche de séance ; voir `decisions.md` ; **à juger à l'écran par Tristan** (`outils/essai-entrepot.html` cas « Stockage de masse », `outils/essai-animation.html` « avec les écrans ») ; le script de l'animation d'ENT-6.5 s'écrira avec la séance (contenu) → **ENT-6.5** |
| D-6 | Sous-mode **comptage** ; **terminal vocal** (voix locales, son réglé par l'enseignant, coupé par défaut) ; comptages vers l'écran Inventaire | ENT-6.6 §7 | ≈ 16 h | Opus | oui | D-5 | **en cours** : lot 1 sous-mode comptage livré et validé (11/10, page d'essai cas « Masse, comptage ») ; lot 2 terminal vocal (texte, sans son) livré le 11/10 ; lot 3 son livré le 12/10 (**à essayer par Tristan** avec casque : réglage dans Conduite de séance) ; lot 4 comptages → Inventaire livré le 12/10 (**à essayer par Tristan** : page d'essai, cas « Masse, comptage », puis menu « Inventaire ») → **ENT-6.6 construite le 12/10** (`pret: true, ouverture: 'prof'`, à essayer par Tristan) |
| D-7 | Terminal vocal : ajouts préparation ; **allée de picking** en iso ; **montage par cases** sur plusieurs palettes ; film et étiquettes | ENT-6.7 §7 | ≈ 18 h | Opus | oui | D-6 | **livré (12/10/2026)** (découpage du 12/10 : 1 terminal de préparation, 2 dessins du kit iso, 3 allée en 3D, 4 montage sur deux palettes, 5 fiche de séance) : lot 1 livré et **validé par Tristan** le 12/10 (`outils/essai-terminal.html`) ; lot 2 (dessins du kit iso : fût debout 20/30 L et cabossé, casier plein ou vide, travée à tiroir et étiquette de lisse, palette client à 6 cases avec film et étiquettes, préparateur au casque) livré le 12/10, **à juger par Tristan** (`outils/essai-kit-iso.html`) ; lot 3 (l’allée en 3D : mode `picking` de la vue, survol et clic des travées, vue de près avec le code, terminal branché, jalons des lignes) livré le 12/10, **à juger par Tristan** (`outils/essai-entrepot.html`, cas « Allée de picking ») ; lot 4 (montage sur deux palettes : pose ligne à ligne, « à côté », règle des 6 cases, film et étiquettes par palette, « Reposer le dernier », jalons 6 à 10) livré le 12/10, **à juger par Tristan** (`outils/essai-entrepot.html`, cas « Allée de picking ») ; lot 5 (fiche de séance : mode `picking` et montage, branchement d'une séance et `id` des jalons, terminal vocal, objets du kit) livré le 12/10 ; voir `decisions.md` ; **lots 2 à 4 à juger à l'écran par Tristan** → **ENT-6.7 construite le 12/10** (`pret: true, ouverture: 'prof'`, à essayer par Tristan ; ENT-6.8 la suit) |
| D-8 | Planning : `conduite` par carte, ligne qui porte sa seconde ressource (`porteAffectation`) ; noms fictifs par Cowork | ENT-6.8 §7 | ½ j | Opus | oui | — | **livré (12/10/2026)** : `conduite` par carte (lue par `cumulSansPause`, `plafond`, compteur), ligne `porteAffectation` (pas de bulle, comptée affectée, ignorée des règles `sur: 'affectation'` et de la lecture, `affectation.porte` écrit « son camion ») ; `versions` sur un jalon : déjà livré ; §7.4 et 7.5 : repli `critere`, rien au moteur ; 4 cas dans le bloc `planning` ; noms fictifs choisis (Locaporteur, Transports Ancelin) → **ENT-6.8 construite le 12/10** (`pret: true, ouverture: 'prof'`, à essayer par Tristan) |
| D-9 | **Tournée « camion », lots 1 à 3** (fenêtres, approche, conduite et pause, sans quai, profil porteur, carte de la côte) + page d'essai validée ; calage et jeux de valeurs | brief `MOTEUR-vue-tournee-camion` | ≈ 3,5 j | Opus | oui | — | **lots 1 à 3 livrés le 12/10** (fenêtres d'ouverture ; approche, conduite, pause, sans quai ; profil porteur ; carte de la côte, construite avec ENT-6.9) ; **page d'essai à valider par Tristan** (`outils/essai-tournee-camion.html`) → **ENT-6.9** (lots 4 et 5 plus tard) |
| D-10 | Grille dans une fiche (lisant une autre fiche) ; image SVG en document avec loupe ; objets du kit iso (porteur, fût vide, casier, bâtiments, route) ; écran d'animation à `quand` ; **maquette Cowork à valider par Tristan** | ENT-6.10 §7 | ≈ 2 j | Opus | oui | D-5 | **livré (13/10/2026)** : lot 1 (`cfe1bc5` : feuille dans une fiche, loupe, pastilles, animation à `quand`) et lot 2 (scène « trajet », porteur à rideaux, bâtiments, route) → **ENT-6.10 livrée** (`pret: true, ouverture: 'prof'`) ; captures des objets envoyées à Tristan, à valider à l'écran (`outils/essai-boucle-vides.html`) ; question ouverte : cartes de messages par-dessus l'écran |
| **Lot E — Action (CAP OL, ENT-8.1 → 8.2)** : briefs du 15/10/2026, chef de chantier Fable, coordination dans `docs/briefs/COORDINATION-action.md` | | | | | | | |
| E-1 | **Vue « Localiser »** : situer un lieu sur la carte de France (région → département → ville), trois niveaux, aide après 2 erreurs, jalons au premier essai, fin (trajet fléché ou encart), lieu bonus ; contours IGN (`contenus/france-contours.js`, 570 Ko) | brief `MOTEUR-vue-localiser` | ≈ 6 h | Opus | oui | D-C | **livré (15/10/2026)** : lot 1 800687f, lots 2-3 dc9a875 ; bloc `localiser` (16 cas) ; **à valider à l'écran** (`outils/essai-localiser-vue.html`) ; évaluation en `copie` refusée tant que non cadrée |
| E-2 | Visite : zones `vestiaire` et `controle`, geste de fin de visite `entrepot:<id>:visite:fin` | ENT-8.2 §7.1 | ≈ 1 h | Sonnet | oui | — | **livré (15/10/2026, 9691a0c)** : 7 cas dans `entrepot`, ENT-5.3 identique à l'octet |
| E-3 | Univers Action (`contenus/action.js`), logo, 9 photos libres, lieux relevés dans OSM, entreprise n° 8 | ENT-8.1 §2, §6 | ≈ 1,5 h | Sonnet | non | — | **livré (15/10/2026, 177da27, 39356e0)** |
| E-4 | ENT-8.1 « d'où viennent les produits du magasin de Nîmes ? » (CAP-C1.1) et ENT-8.2 « ma prise de poste à la réception » (CAP-C1.2) | briefs ENT-8.1, ENT-8.2 | ≈ 6 h chacune | Opus | non | E-1, E-2, E-3 | **livrées (15/10/2026, 0de1c0c et 17ecc48)** en `pret: true, ouverture: 'prof'` ; blocs `action-81` (16 cas) et `action` (20 cas) ; textes de Cowork à relire à l'écran (listes dans les comptes rendus des briefs) ; trames à faire par Cowork |
| E-5 | **Quai en deux séances** : `arret: 'dechargement'`, `commence: 'controle'`, `document`, geste `quai:<id>:dechargement`, déclencheur `quaiDecharge` (lot 1) ; dialogue en face à face `face: true` (lot 3) ; **dépose dirigée par l'élève** (lot 2) | ENT-8.7 §7 | lot 1 ≈ 3 h, lot 3 ≈ 1 h 30, lot 2 ≈ 7 h | Fable (chef), Sonnet (lots 1, 3), Opus (lot 2) | oui | — | **lots 1 et 3 livrés (17/10/2026, 2d0259e, 0c96f44)** : 12 cas dans `quai-iso`, 5 dans `dialogue`, pages d'essai `outils/essai-quai-inspection.html#deux` et `outils/essai-dialogue.html` ; **lot 2 livré (17/10/2026, commits 25fc3ed, f543815, 132a2d2)** : `depose: { passage, grise, cases }` dans `quai.js` (feuille `docs/briefs/MOTEUR-depose-dirigee.md`), options `sol` / `nomAuSol` de `solQuai`, 12 cas « Dépose » dans `quai-iso`, fiche à jour, page d'essai `outils/essai-quai-inspection.html#depose` **à juger par Tristan à l'écran** ; la maquette `outils/essai-depose.html` reste comme témoin |
| E-6 | **Séances de la réception, ENT-8.7 → 8.10** (guidage C1.3, guidage C1.4, entraînement à Labastide avec erreur induite, évaluation C1.3 + C1.4 dans le site d'ENT-8.5) ; correctif moteur en route : quai en copie dans une séance pondérée (garde `AVEC_POIDS`, option `rendCopie: false`) | briefs ENT-8.7 à 8.10, `COORDINATION-action.md` §8 | ≈ 4 × 5 h | Fable (chef), Opus (séances), Sonnet (correctif) | oui | E-5 | **livré (17/10/2026, commits 46fa7f9, 0a80653, b8d90ce, c752701, correctif d859c66)** : blocs `action-87` (17 cas), `action-88` (16), `action-89` (16), `action-810` (16), 3 cas dans `quai-iso` ; `pret: true, ouverture: 'prof'` ; **rien n'a été vu à l'écran par Tristan** ; même note aux deux compétences en 8.10 (le moteur ne répartit pas : à trancher) ; **lot 4 « contenus selon le niveau » livré au moteur (17/10/2026 soir, option 3 choisie par Tristan)** : le quai tiré reçoit `(graine, { niveau, copie })`, un quai par graine et par niveau, trois variantes vérifiées au chargement, `etapesQuaiTire(…, niveauDe)` ; Dialogue : `niveaux` sur un choix (montré) et sur une réplique (jouée), `appel.niveau` rangé, contrôle par niveau ; `niveauEleve(db, { copie })` dans `core/tirage.js` ; 6 cas `quai-iso`, 5 cas `dialogue`, éprouvés par sabotage ; **appliqué le même soir à ENT-8.7, 8.8, 8.9** (confirmé : 2e / 3e anomalie de scène en bonus, aides de comptage éteintes en 8.8 ; accompagné : 2 réponses par réplique, consigne de scène qui nomme la vue en 8.7, rappel « Fais le tour » en 8.8, aides allumées en 8.9 ; `niveauxPrevus: ['confirme', 'accompagne']` ; 5 cas ajoutés, 3 réécrits, 3 « déclaration » suivis) ; **rien n'a été vu à l'écran par Tristan** ; trames à faire par Cowork |
| E-7 | **Palettier à adresse donnée** (mode `palettier` à part, dans son fichier : adresse imposée par palette, niveaux du cariste et zone « À monter », signaler, terminal à scanner sans voix, adresse prise / adresse libre / poser sans scanner, comptage à l'aveugle en cartons avec recomptage, « le lendemain » par phases, copie d'évaluation avec un plan par site) ; **lot 0 préalable : l'entrepôt se tire par élève**, comme le quai | brief `MOTEUR-palettier-adresse-donnee.md` ; état des lieux `MOTEUR-palettier-adresse-donnee-etat-des-lieux.md` | ≈ 22 à 26 h (lot 0 ≈ 2 h 30 · lot 1 ≈ 5-6 h · lot 2 ≈ 3 h · lot 4 ≈ 4-5 h · lot 3 ≈ 2 h · lot 5 ≈ 4-5 h · lot 6 ≈ 2-3 h) | Fable (chef), Opus (lots 1, 4, 5), Sonnet (0, 2, 3, 6) | oui (bloc nouveau `palettier` : alerte 7) | D-6, D-7, E-6 | **livré le 22/10/2026** (lots 0 → 1 → 2 → 4 → 3 → 5 → 6 en une journée et demie, Fable chef, Opus lots 1/4/5, Sonnet 0/2/3/6 ; pages d'essai des lots 1 et 2 validées à l'écran par Tristan, deux retours sur le lot 1 : fenêtre du système, bouton « Faire monter », palette non montée = point perdu) ; `core/types/entrepot-palettier.js`, bloc `palettier` 113 cas, `outils/essai-palettier.html` (quatre cas) ; décisions du chef dans `docs/briefs/COORDINATION-palettier.md` §3 ; ENT-8.11 à 8.14 construites dans la foulée (`pret: true, ouverture: 'prof'`), pas encore vues à l'écran par Tristan ; reste ouvert : la Messagerie date les messages malgré « sans date » |
| E-8 | **Préparation vocale en cartons** (le terminal vocal de France Boissons branché sur le mode `preparation` de Smoby : plus de bon papier, code de contrôle sur la lisse, « Où poses-tu ? Palette · À côté », palette jugée sur l'ordre de pose, carton abîmé et emplacement vide avec réserve descendue, deux commandes et « Contrôler mes palettes », copie d'évaluation avec un plan par site) ; **lot 0 : l'entrepôt de préparation se tire par élève** | brief `MOTEUR-preparation-vocale-cartons.md` | ≈ 18 à 22 h (lot 0 ≈ 2 h · lot 1 ≈ 4-5 h · lot 2 ≈ 3-4 h · lot 3 ≈ 2-3 h · lot 4 ≈ 3-4 h · lot 5 ≈ 2-3 h · lot 6 ≈ 1 h) | Opus (lots 1, 2, 4), Sonnet (0, 3, 5, 6) | oui (bloc nouveau `preparation-vocale` : alerte 7) | D-6, D-7, E-7 | **lot 0 livré le 25/10/2026** (entrepôt de préparation tiré par élève, `contenus/action-prepa-donnees.js`, bloc `preparation-vocale`) ; cadré le même jour (sert à ENT-8.15 à 8.19, briefs écrits le même jour) ; vue choisie par Tristan le 25/10 (préparation Smoby + terminal vocal), poids des cinq séances validés le 25/10 ; page d'essai du lot 2 à faire juger par Tristan avant le lot 3 |
| **Lot F — CHEP (1re, C2.5, ENT-9.1 → 9.4)** : briefs Cowork du 17/10/2026, coordination dans `docs/briefs/COORDINATION-chep.md`, ordre dans `FEUILLE-DE-ROUTE-chep.md` | | | | | | | |
| F-0 | ENT-9.1 « le compte palettes » (aucune vue nouvelle), univers `contenus/chep.js`, entreprise n° 9 | brief ENT-9.1 | ≈ 5 h | Fable | non | — | **livrée (18/10/2026)**, `pret: true, ouverture: 'prof'`, à essayer par Tristan |
| F-1 | **Tournée de ramasse (MOTEUR-chep lot A)** : mesure en profil (le pic compte), jauge en marches, `quai: { … }` borné, gestes `tournee:<id>:envoyer` / `reporter`, `quand`, `service.unite` ; carte régionale du Nord (`construire-ramasse.py`, `extraire-chep.mjs`, `contenus/chep-carte.js`), couche `frontiere` ; `calibrer.mjs` mode ramasse | brief `MOTEUR-chep-ramasse-et-piles` §2 | ≈ 7 h | Fable | oui | D-9 | **livré (18/10/2026)** : bloc `ramasse` (13 cas), non-régression `transport`, `boost`, `carte`, `carte-region`, `fb-6.9`, `chep-91` sans modification ; page d’essai `outils/essai-tournee-ramasse.html` et captures **à valider par Tristan** avant le lot B ; horaires d’ENT-9.2 §6.3 à recaler par Cowork |
| F-2 | **Piles de palettes vides au quai iso** (`forme: 'pile'`, `comptePile`, `decisionPile`, unité au féminin, `decisions`, `document: { nom, court }`, MOTEUR-chep lot B) | brief §3 | ≈ 9 h | Fable | oui | F-1 | **livré et validé par Tristan (18/10/2026)**, page `outils/essai-quai-inspection.html#piles` ; ENT-9.2 peut commencer |
| F-3 | **ENT-9.2** « un retour à contrôler, une ramasse à organiser » (quai de piles → crédit → besoin de la ramasse → tournée du Nord ; tirage des piles et de la plate-forme à reporter) | brief ENT-9.2 | ≈ 6 h | Fable (chef), Opus (séance) | non (`outils/test.mjs` : deux lignes) | F-1, F-2 | **livrée (18/10/2026)**, `pret: true, ouverture: 'prof'`, bloc `chep-92` (25 cas), à essayer par Tristan ; **vides des quatre plates-formes tirés par élève le 18/10/2026 au soir** (chantier contenu après F-5 ; demande au moteur n° 6 close) |
| F-4 | **ENT-9.3** « le relevé contesté » (entraînement avec erreur induite : enquête document par document, relevé corrigé en grille, réponse honnête par phrases ; aucune vue nouvelle) | brief ENT-9.3 | ≈ 5 h | Fable (chef), Opus (séance) | non (`outils/test.mjs` : deux lignes ; `tirage-niveaux.mjs` : une banque) | F-0 (univers), se joue après F-3 | **livrée (18/10/2026)**, `pret: true, ouverture: 'prof'`, bloc `chep-93` (16 cas), à essayer par Tristan |
| F-5 | **Points de tournée par élève** (`tournee.points: (db) => […]`, demande n° 6 du brief ENT-9.2) : mêmes sites pour tous, valeurs tirées ; relu à chaque dessin et par `bilan(etat, db)` ; contrôle sur base vide au chargement, avis d'erreur au dessin ; liste fixe inchangée | brief `MOTEUR-tournee-points-par-eleve` | ≈ 4 h | Fable (chef), Sonnet (état des lieux), Opus (construction) | oui | F-1 | **livré (18/10/2026)**, option A validée par Tristan ; 8 cas « points par élève » dans `ramasse` (22), éprouvés par sabotage ; `boost`, `carte`, `transport`, `fb-6.9`, `chep-92` verts sans modification ; **à suivre** : ENT-9.4 l'utilise à sa construction, puis chantier contenu « ENT-9.2 : tirer les vides » (décision de Tristan : « retouches 9.2 après ») |
| F-6 | **ENT-9.4** « la semaine de Légumes de la Lys » (évaluation C2.5, coefficient 3 : déclarations et relevé d’un client neuf, retour en quatre piles, ramasse du jeudi ; tout tiré par élève, rien jugé avant la remise ; fiches, quai et tournée de 9.1/9.2 en fabriques paramétrées) | brief ENT-9.4 | ≈ 4 h | Fable (chef), Sonnet (état des lieux), Opus (séance) | non (`outils/test.mjs` : deux lignes) | F-0, F-3, F-5 | **livrée (19/10/2026)**, `pret: true, ouverture: prof`, bloc `chep-94` (19 cas), suite 1847/1847 ; créneau de Frais du Nord recalé à 9 h 30 – 17 h (option A tranchée par Tristan le 19/10/2026) ; le détail jalon par jalon d’une copie rendue se lit au survol de la note dans le Suivi (chantier moteur clos le 19/10/2026, `core/prof.js`) ; **reste** : validation à l’écran par Tristan |
| **Lot G — Transports Pelleau (CAP OL, C1.1 → C1.4, ENT-10.1 → 10.12)** : briefs Cowork du 18/10/2026, coordination dans `docs/briefs/COORDINATION-pelleau.md`, ordre dans `FEUILLE-DE-ROUTE-pelleau.md` | | | | | | | |
| G-1 | **Logo** officiel récupéré par script (`outils/logo-pelleau.mjs`, PNG seulement sur le site, bleu nuit `#242d5b`, ligne dans `CREDITS.md`) | FDR §« Logo » | ≈ 30 min | Fable (chef), Sonnet | non | — | **livré (19/10/2026)**, reproductible (mêmes empreintes à deux lancements) |
| G-2 | **Maquette cliquable « Inspection du poste »** : objets du kit iso (transpalette électrique à six états, extincteur, plan de circulation, borne de charge), page `outils/essai-inspection-poste.html` (états, scène cliquable, copie), logique pure dans `outils/essai-inspection-poste-logique.js` à déplacer dans `core/types/inspection.js` | brief `MOTEUR-inspection-poste` | ≈ 3 h | Fable (chef), Opus | `core/iso.js` seulement (ajouts) | — | **livrée (19/10/2026)**, `quai-iso` 114/114 ; **arrêt : à cliquer par Tristan** avant la vue (G-5) ; à juger : panneau « Quai B » vert dans la scène (charte : le vert plein dit « juste »), un bouton d'avertisseur par engin ou seulement sur l'engin déclaré, encoche de la roue abîmée |
| G-3 | **ENT-10.1** « de Plabennec à l'entrepôt neuf » (guidage C1.1 : messagerie, fiches, carte Localiser, histoire à ranger), univers `contenus/pelleau.js`, entreprise n° 10 | brief ENT-10.1 | ≈ 5 h | Fable (chef), Opus | non (`outils/test.mjs` : deux lignes ; `socle.mjs` : `ATTENDU_CAP` + cas C1.1 recalé 1/6 → 1/7 ; `tirage-niveaux.mjs` : colonne 10) | G-1 (charte) | **livrée (19/10/2026)**, `pret: true, ouverture: 'prof'`, bloc `pelleau-101` (17 cas), à essayer par Tristan ; photos de porteur et de porte-voitures remplacées par deux photos d'Action déjà au dépôt (accord de Tristan à demander pour en télécharger) |
| G-4 | **Dépose dirigée par client** (`client` sur cases et palettes, `depose.clients`, légende = étiquette, `reactionClient`, `grise: 'palette'` imposé, bilan une ligne par palette) | brief `MOTEUR-depose-par-client` | ≈ 3 h | Fable (chef), Opus | oui (`quai.js`) | E-5 | **livré (19/10/2026)**, 9 cas dans `quai-iso` (114/114), `action`, `fb-6.4`, `smoby` verts sans modification, page `outils/essai-quai-inspection.html#depose-client` **à juger par Tristan** (phrase de la bulle « de Biscuiterie Ar Vag », lisibilité du nom au sol) |
| G-5 | **Vue « Inspection du poste » branchée** (`core/types/inspection.js`, option `inspection`, menu « Mon poste », `db.inspections[séance][id]`, gestes `inspection:<id>:*`, déclencheur `inspectionFinie`, jalons `securite-*` et `essai-<n>`, bloc `inspection`) | brief `MOTEUR-inspection-poste`, coordination §2 points 1-6 | ≈ 1 jour | Fable (chef), Opus | oui | G-2 validée par Tristan | **livrée (19/10/2026)** après validation de la maquette par Tristan (deux retours : prises de la borne, aucune marque dans le vide) : `core/types/inspection.js`, `styles/inspection.css`, option `inspection`, `db.inspections[séance][id]`, `inspectionFinie`, bloc `inspection` (18 cas), page `outils/essai-inspection-poste.html` sur le vrai moteur ; **reste** : option « réponse unique » du collègue (10.3 l'obtient par `repare: ' '`), scène du quai toujours « QUAI B », l'inspection du quai accepte encore les marques dans le vide |
| G-6 | **ENT-10.2, 10.3, 10.4** (prise de poste C1.2 : guidage, entraînement à erreur induite tirée, évaluation) | briefs | ≈ 6 h + 4 h + 4 h | Opus (10.2), Sonnet (10.3, 10.4) | non | G-3, G-5 | **livrées (19/10/2026)**, `pret: true, ouverture: 'prof'`, blocs `pelleau-102` (19 cas), `pelleau-103` (22), `pelleau-104` (25), sabotages joués ; planning fixe (décision 12), défaut du site tiré (extincteur ou plan), transpalette n° 2 non dessiné en 10.2 ; **à voir par Tristan** : bandeau sur deux lignes à 1280 × 720 (cadre dépassé de 30 px, sous-titre à raccourcir), 4e réponse de Yann en 10.4 qui dépasse de 130 px (vue Dialogue), avertisseur muet invisible (2,5 points en 10.4), réponse unique d'Erwan en 10.3 obtenue par `repare: ' '` (option « réponse unique » à prévoir à la vue) |
| G-7 | **ENT-10.5 à 10.8** (réception du camion de ramasse C1.3 : « un camion, plusieurs clients ») ; correctif quai `document.article`, `tutoiement`, `prenomChauffeur` | briefs | ≈ 5 h + 3 h + 4 h + 4 h | Opus (10.5), Sonnet (10.6 à 10.8, correctif) | oui (`quai.js`, correctif) | G-3, G-4 | **livrées (19/10/2026)**, `pret: true, ouverture: 'prof'`, blocs `pelleau-105` (17 cas), `pelleau-106` (20), `pelleau-107` (22), `pelleau-108` (24) ; camion tiré par élève en 10.6 à 10.8 (300 graines vérifiées), nom au sol « AGRI » ; **à voir par Tristan** : lisibilité des 8 cases, fiche « Rapprocher » en 10.8, retrouver la palette mal notée de mémoire en 10.7 (peut-être dur pour un CAP), cartes « Nouveau message » qui recouvrent une question au fil pendant 8 s |
| G-8 | **ENT-10.9 à 10.12** (contrôle C1.4, le piège du froid) ; sacs dessinés (choix de Tristan du 19/10/2026 : objet `paletteSacs` dans `core/iso.js`) | briefs | ≈ 1 h + 4 h + 3 h + 4 h + 4 h | Opus (sacs, 10.9), Sonnet (10.10 à 10.12, correctifs) | oui (`core/iso.js` : `paletteSacs` ; `quai.js` : `forme: 'sacs'`, `conservation` sur l'étiquette, ligne de réserve d'un refus à motif libre) | G-7 | **livrées (19-20/10/2026)**, `pret: true, ouverture: 'prof'`, blocs `pelleau-109` (17 cas), `pelleau-110` (19), `pelleau-111` (25), `pelleau-112` (21) ; palette de sacs (5 cas `quai-iso`), champ `conservation` (2 cas), ligne de refus « ne se stocke pas ici » (2 cas, cas témoin de 10.11 recalé) ; **à voir par Tristan** : sacs et sac percé au vidéoprojecteur, ligne « Conservation » au zoom, étiquette « Colis n / 40 » quand la feuille dit 36 (numérotation du moteur), réplique de signature de Loïc (le brief voulait « Je signe sous tes réserves », demande au moteur non faite), « Avant de commencer » ne connaît pas le niveau (notion `conservation` visible du confirmé en 10.11) |
| G-9 | **Reliquats Pelleau** (six traits du moteur relevés pendant le chantier, soumis à Tristan un par un, 20-21/10/2026) : 1. bandeau sur deux lignes à 1280 × 720 ; 2. marque dans le vide au quai ; 3. clé « réponse unique » du collègue (vue inspection) ; 4. réplique de signature du chauffeur ; 5. « Avant de commencer » selon le niveau ; 6. étiquette « Colis n / 40 » quand la feuille dit 36 | coordination §4, `decisions.md` du 21/10/2026 | ≈ 1 jour | Fable (chef), Sonnet | selon le point (blocs `quai-iso`, `fb-6.4`, `action-87`, `action-810` recalés au point 2) | G-5 à G-8 | **livrés (21/10/2026)**, six « oui » de Tristan : 1 cadre qui s'adapte + sous-titre court ; 2 plus de marque dans le vide au quai (blocs `quai-iso`, `fb-6.4`, `action-87`, `action-810` recalés) ; 3 clé `signaler.reponse` aux deux inspections ; 4 clé `paroleSignee` (Loïc, Marc d'ENT-8.8) ; 5 clé `niveaux` sur une question d'ouverture (ENT-10.11) ; 6 étiquette sans total, référence Spartoo régénérée ; **reste à voir par Tristan à l'écran** : le mot « Clique un objet du quai. » sous la scène, la face des cartons |
| G-10 | **Retouches après relecture des décisions par Tristan (21/10/2026)** : réponses à Yann neutres en 10.4 ; avertisseur cliqué sur le bouton à la trompe de la tête de timon (kit + vue, plus de bouton d'interface) ; rappel des étiquettes lues sur la fiche « Rapprocher » de 10.7 (pas chez le confirmé) ; consigne de 10.2 qui dit où est le bouton | questions une à une | ≈ 3 h | Fable (chef), Opus (avertisseur), Sonnet (10.4, 10.7, 10.2) | oui (`core/iso.js`, `core/types/inspection.js`) | G-5, G-6, G-7 | **livrées (21/10/2026)**, cas recalés dans `inspection` et `pelleau-104` (dits à Tristan) ; gardés tels quels par Tristan : planning fixe, 10.3 sans arrêt, prénom Yann, tirage de 10.12 ; ~~en 10.4 le dialogue de Yann dépasse encore le bas de l'écran~~ **corrigé le 25/10/2026** (l'écran Téléphone mesure sa hauteur, `core/types/dialogue.js`, voir `decisions.md`) ; **reste** : le bouton à la trompe (≈ 16 px) à juger au vidéoprojecteur |

## Le détail, dans l'ordre

Pour chaque chantier : **ce qu'on fait**, et **fini quand** (ce que Tristan peut constater lui-même).

### 1. Règles Firestore (C1)
- **Ce qu'on fait.** Interdire à un élève de modifier `groupes`, `matricule`, `code` dans son profil ;
  valider le contenu d'un travail écrit par l'élève (pas de `rendu`, pas de `_debloque-*`, score borné
  par `max`) ; limiter un enseignant aux profils des élèves de ses groupes, et interdire la
  suppression du profil d'un autre enseignant ; borner `classements` (clé = son uid, champs connus).
  Un cas de test par interdiction dans `outils/test-regles.mjs`.
- **Fini quand.** `outils\tester-regles.bat` vert avec les nouveaux cas ; règles **publiées dans la
  console** ; une ligne dans `docs/decisions.md`.

#### 1 bis. Reste du chantier 1 — consigne prête pour Sonnet (inspection du 08/10/2026)

État : le commit 7a86d42 a fermé la faille des groupes, verrouillé le profil élève (nom et prénom
seulement), protégé les profils des collègues et interdit à l'élève la suppression, la marque
`parProf`, les drapeaux `_debloque-*`, un uid ou gid étranger et un score non numérique. Il a aussi
introduit deux effets de bord et laissé un morceau de côté. **Décisions de Tristan (08/10/2026)** :

1. **L'élève retrouve le droit de supprimer ses propres travaux non rendus et non notés par
   l'enseignant.** Raison : la remise à neuf d'un parcours (`versionBase`, `core/app.js:428-429`)
   est faite par l'élève lui-même, qui efface ses scores du parcours et ses déblocages ; depuis
   7a86d42 ce nettoyage échoue en silence en réel (la démo, elle, réussit : la suite ne le voit pas).
   Le risque de l'audit portait sur la falsification, pas sur la suppression : un élève n'a rien à
   gagner à effacer son travail en cours.
   - `firestore.rules`, bloc `travaux` : `allow delete` pour l'élève sur son propre document si
     `membreDuGroupe(gid)`, pas de `rendu`, `parProf != true`, et `aid` qui ne commence pas par
     `_debloque-` ni `_reprise-`. L'enseignant du groupe garde tout.
   - Attention : `app.js:429` efface aussi `_debloque-<id>` au nom de l'élève. Ce drapeau est posé par
     l'enseignant : soit la règle l'autorise à la suppression seulement (pas à la création), soit ce
     seul effacement passe par l'enseignant. Préférer la première solution (une règle, pas d'écran).
   - `outils/test-regles.mjs` : retourner « un élève ne supprime pas un travail non rendu » en
     « un élève supprime son travail non rendu », ajouter « un élève ne supprime pas une note posée
     par l'enseignant », « un élève ne supprime pas une copie rendue », « un élève retire son drapeau
     de déblocage mais n'en crée pas ».
2. **Une note posée par l'enseignant (« mettre 0 », `parProf: true`) reste figée pour l'élève** :
   règle de 7a86d42 confirmée. Elle rejoint la copie rendue. Ce qui doit suivre :
   - `core/backend-demo.js`, `ecrireScore`, `majTemps`, `rendreCopie` : refuser (même erreur que le
     réel) quand le document existant porte `parProf: true`, pour que la suite voie le comportement
     réel. Attendre que la session du chantier 2 ait commité `backend-demo.js` avant d'y écrire.
   - `core/app.js`, `ctx.enregistrer` : à la place de « Le score n'a pas pu être enregistré », un
     message qui dit la cause quand le document est noté par l'enseignant : « Ton enseignant a posé une
     note sur cette séance, elle ne bouge plus. » Détecter par une lecture préalable (`lireScore`,
     déjà faite dans `ecrireScore`) plutôt qu'en devinant d'après l'erreur.
   - `enregistrerTemps` et `rendreCopie` côté élève : s'arrêter sans erreur sur une séance notée
     (comme sur une copie rendue).
   - Un cas de test Playwright dans `outils/test/socle.mjs` ou `copie.mjs` : le 0 posé par
     l'enseignant tient quand l'élève refait la séance, et l'élève lit le message.
   - `docs/decisions.md` : une ligne. `docs/fiches/prepalog-notes-competences.md` (Cowork) dit encore
     que l'élève écrase le 0 : à signaler.
3. **Fermer `classements` dans `database.rules.json`** : clé = uid du compte connecté ; `aid` limité
   par une validation sur les champs (`$other: validate false`) et les types que `core/types/
   entrainement.js:276-291` écrit réellement (`gid`, `groupe`, `score`, `max`, `temps`, `ts`, `nom`
   facultatif) plus ce que le backend ajoute (`_par`, `_parNom`, `_ts`) ; relire le commentaire des
   lignes 34-39, qui promet déjà ce que la règle ne fait pas. Au passage : `_parNom` écrit toujours le
   nom complet, ce qui contredit l'anonymat promis par `entrainement.js:284-286` (écart relevé par
   l'audit, C2) : le chantier 2 ou celui-ci doit le trancher, pas les deux. Cas de test dans
   `outils/test-regles.mjs` dans les deux sens.

Livraison : un seul commit pour les règles et leurs tests, suite Playwright verte si `core/` est
touché, puis **Tristan publie les deux consoles le même jour** (Firestore : le fichier entier ;
RTDB : sans le bloc `_commentaire`). Modèle : Sonnet. Taille : une demi-journée. Rappeler Fable
seulement si un test de règles ne tombe pas quand il le devrait, ou si démo et réel refusent de
s'aligner.

### 2. `CLAUDE.md` et `FICHE-SEANCE.md` d'aplomb (C18)
- **Ce qu'on fait.** Corriger : « ~545 cas, ~5 min » → 862, ~13 min ; ENT-2.1 et 2.3 sont en
  `ouverture: 'prof'` ; TAB-4 n'est pas réservé au CAP ; Spartoo a été refondue le 06/10 (acter ou
  annuler la règle « tel quel ») ; structure de `styles/` ; 42 fichiers de séance ; alertes 23, 26, 28
  à numéroter ou à retirer des briefs. Dans `FICHE-SEANCE.md` : date de relevé, « 24 séances », la note
  de `correction` (une seule version), les six options lues et non documentées. Les fiches de
  `docs/fiches/` sont pour Cowork (annexe de l'audit).
- **Fini quand.** Les deux fichiers ne contredisent plus le code sur les points de l'annexe.

### 3. Tests de règles en CI, hôtes externes partout, port pris (C10a)
- **Ce qu'on fait.** Un quatrième ou cinquième job GitHub qui lance `outils/test-regles.mjs` avec
  l'émulateur ; `hotesExternes` et `introuvables` branchés sur **tous** les contextes créés par les
  blocs, pas seulement la page partagée ; un message en français si le port est pris, avec le nom de la
  variable `PORT_TESTS`. **Touche `commun.mjs` : à dire à Tristan.**
- **Fini quand.** Un sabotage (ajouter une `<img src="https://…">` dans une vue d'entreprise) fait
  tomber la suite dans le groupe 3 aussi ; le workflow montre le job des règles.
- **Fait (08/10/2026).** `commun.mjs` enveloppe `nav.newContext` : toute page de tout contexte alimente
  `hotesExternes` et `introuvables` (les erreurs JS restent celles de la page partagée) ; `test.mjs` ajoute,
  après la boucle des blocs, un dernier cas « aucune requête externe, aucun fichier introuvable hors
  `prepalog-config.json` », valable pour tout groupe ou bloc lancé ; un port pris (`EADDRINUSE`) affiche
  un message en français avec `PORT_TESTS=…` (aussi dans `test-seances.mjs`, `PORT_SEANCES`). Sabotage
  éprouvé : une `<img>` externe dans `planning.js` (contexte propre du bloc) fait tomber le nouveau cas.
  Les tests de règles sur GitHub existaient déjà (chantier 2, job `regles` de `.github/workflows/tests.yml`,
  émulateurs Firestore et RTDB, `outils/test-regles.mjs`) : ils couvrent les règles dans les deux sens,
  pas le mode réel du site lui-même.

### 4. Fiabiliser le mode réel (C2) — en cours par une autre session
- **Ce qu'on fait.** Appeler la fonction de désabonnement renvoyée par `onValue` au lieu de `off` ;
  faire remonter un échec de sauvegarde (bandeau « non enregistré », réessai) au lieu de `.catch(() => {})` ;
  rappel d'erreur sur les écoutes ; `geler/dégeler` qui attend la première valeur de `meta` ; règle
  `{path=**}/activites` pour le `collectionGroup` du suivi ou suppression du repli ; `majTemps`,
  `majLigne`, `supprimerEleve` démo alignés sur le réel ; retirer `superAdmins` de l'exemple.
- **Fini quand.** Essai en réel sur un groupe de test : couper le réseau pendant une séance affiche
  un message ; geler le magasin le gèle vraiment ; une ligne dans `decisions.md` par écart résolu.

### 5. Un bug de contenu n'est plus noté « faux » (C3)
- **Ce qu'on fait.** Dans `noterBase` et les quatre autres avalements d'`entreprise.js`, journaliser
  l'erreur (`console.error` avec l'id du jalon) et marquer l'étape « indéterminée », distincte de
  « ko », qui ne compte ni juste ni faux et qui s'affiche à l'enseignant dans le Repérage.
- **Fini quand.** Un jalon volontairement cassé dans un contenu d'essai apparaît « indéterminé »
  au Suivi et la note de l'élève n'en souffre pas ; test dans le bloc de la vue.
- **Fait (08/10/2026, b0776d1).** État `'erreur'` : 0 point (comme `'ko'`, la note ne monte pas), pas
  compté faux au bandeau de fin (ligne « à vérifier », jamais ✗), absent de `premier`, `console.error` et
  `indicateurs[séance].erreurs`, mention « ⚠ jalon en erreur » au Repérage. **Choix** : l'état `'erreur'`
  compte comme *jugé* (`bilanComplet`, photo de fin qui ouvre la séance suivante, rattrapage des questions) :
  un bug de contenu ne bloque aucun élève ; sans rien de faux à côté, il ne retient pas non plus la séance
  suivante des séances sans `correction`. Les quatre autres `catch` journalisent, comportement inchangé
  (sauf le rattrapage des questions, qui n'attend plus un jalon planté). Tests : bloc `smoby`.

### 6. Suppressions sans traces (C4)
- **Ce qu'on fait.** Effacer `classements/{aid}/{uid}` et les `travaux` orphelins à la suppression
  d'un élève ; nettoyer `demiDe` et `equipes` dans tous les groupes ; effacer `_reprise-*` avec
  `_debloque-*` ; un bouton « Reconstruire le miroir d'accès » pour un groupe dont `acces/{gid}`
  manque ; ordre inchangé (élève avant groupe, miroir en dernier).
- **Fini quand.** Le test de suppression nomme **ce qui reste** après chaque opération et la liste est
  vide ; essai à l'émulateur sur un groupe à deux profs.
- **Fait (08/10/2026, 9ba74a9 puis d96f6c7).** *Lot 6a* : `supprimerEleve(uid, { aids, groupesProf, nettoyerGroupes })`
  efface en plus `classements/{aid}/{uid}` (pour chaque activité du registre, passé par `prof.js`), les
  `travaux` de **tous les groupes de l'enseignant** (union avec ceux du profil), et `demiDe[uid]` /
  `equipes[uid]` dans tous ses groupes (mise à jour en champ pointé, y compris depuis « sans groupe »). Ce qui ne
  peut pas partir est **nommé** (`restes`, dit dans le message) : un groupe cité par le profil mais refusé ou
  disparu n'arrête plus la suppression. `supprimerGroupe` garde l'ordre élèves → `jeux/{gid}` → `acces/{gid}` →
  `groupes/{gid}` ; la démo passe par le même effacement que le réel. Règle RTDB : l'enseignant inscrit dans
  `acces/{gid}/profs` efface (effacement seul) la ligne dont le `gid` est le sien ; effacer une ligne absente est
  permis. *Lot 6b* : bouton « Reconstruire l'accès » par groupe (`reconstruireAcces(gid)`, réécrit les profs du
  groupe et ses élèves ; refusé hors `profsGlobaux` avec le message d'amorçage ; no-op en démo).
  **Choix.** Travaux orphelins : Firestore ne retrouve pas les travaux d'un élève sans connaître le `gid` (aucune
  règle de groupe de collections) — on se borne aux groupes de l'enseignant + ceux du profil ; un groupe d'un
  collègue ou disparu reste hors d'atteinte (nommé). `_reprise-*` : drapeau périmé **inoffensif** (la date est
  retenue dans `base.reprise`, un drapeau plus ancien ne se rejoue pas, un nouveau remplace l'ancien) ; la règle
  « l'élève ne l'efface pas » n'est pas touchée, le drapeau part avec les travaux de l'élève supprimé ; commentaire
  dans `prof.js` (remise à zéro). **Restent volontairement** : lignes d'un élève dans les bases partagées de ses
  groupes (`jeux/{gid}`, à la classe) ; ligne de classement d'un élève seulement détaché d'un groupe supprimé ;
  comptes d'authentification sans code. **Cas limite connu** : si la base d'un parcours est remise à neuf par
  `versionBase` (`app.js`), `base.reprise` est perdu et un vieux drapeau `_reprise-*` se rejoue une fois sur une
  base déjà neuve (sans perte). Tests : bloc `groupes` (liste de ce qui reste, sabotages), `outils/test-regles.mjs`
  (127/127).

### 7. Quota Spark (C9)
- **Ce qu'on fait.** D'abord mesurer dans la console Firebase après une vraie séance d'une heure.
  Ensuite seulement : ne pas écrire à la vidange si rien n'a changé ; une seule écriture par tranche
  de deux minutes (sauvegarde + temps fusionnées) ; `elevesSansGroupe` filtré sur `creePar`.
- **Fini quand.** Le compteur d'écritures d'une séance d'une heure est connu et noté dans
  `decisions.md` ; le test « note non réécrite » reste vert.
- **Mesuré (11/10/2026).** Séance du 07/10, 11 élèves, 13h30–14h30 : 694 écritures et 801 lectures, soit
  ~63 écritures par élève et par heure (le fond de 2 minutes explique presque tout). Une classe de 30 pendant
  une heure ≈ 9,5 % du quota quotidien d'écritures. **Optimisations différées** : on ne les fait que si une
  mesure dépasse ~50 % du quota sur un jour de classe, ou si une séance à vue « quai » (chrono de 60 s, non
  mesurée) pose problème. Détail, réserves et chiffres de la Realtime Database dans `decisions.md`.
- **Mesuré (15/10/2026), journée du 14/10.** 6 425 écritures et 6 381 lectures sur la journée (32 % et 13 % du
  quota). Spartoo ENT-1.1 à 1.3 : **147 écritures par élève et par heure** (1L1, 12 élèves, 11–12 h) et **196**
  (1L2, 8 élèves, 16–17 h), contre 63 le 07/10 sur Smoby. Cause vérifiée dans le code : la vue « quai » écrit à
  chaque palette de l'animation, à chaque clic, toutes les 60 s (chrono) et toutes les 2 min (temps passé, deux
  écritures) : fond de 120 par élève et par heure sans aucun geste. Seuil des 50 % non atteint ; options B (chrono
  rangé dans la sauvegarde des 2 min, −60) et C (une sauvegarde par animation, pas par palette) **faites le
  15/10/2026** (choix de Tristan) : fond de 60 au lieu de 120, une écriture par déchargement au lieu d'une par
  palette ; effet à mesurer à la prochaine séance ENT-1.1. Détail dans `decisions.md`.

### 8. Fabrique de séance d'entreprise (C6) — avant France Boissons
- **Ce qu'on fait.** `seanceEntreprise(UNIVERS, SEANCE, meta)` dans `core/types/` qui dérive `trame`,
  `corrige`, `bareme`, `rubrique`, `immersif`, `tables` et `rendre` ; les 24 fichiers migrent un par un
  (les anciens restent valides) ; `metier` d'`ENTREPRISES` lu du contenu ou déclaré une seule fois.
- **Fini quand.** Un fichier de séance fait ~20 lignes ; les 24 migrés ; suite verte ; la fiche séance
  décrit la fabrique en premier.
- **Fait (08/10/2026, db5ed50 puis 0403eff, 24edc0c, 6a39a8e, 4bd2068, ee13996).** `core/types/seance-entreprise.js` :
  `seanceEntreprise(univers, contenu, meta, options)` rend `{ meta, rendre, noter }` ; `composerSeance` fait le même
  calcul sans créer le moteur (c'est ce que les tests appellent). Déduit : `rubrique`, `immersif`, `portee`, `tables`,
  `bareme` (nombre de jalons), `corrige` (`./contenus/corriges/<code>.js`) dans le `meta` ; les neuf clés d'univers,
  `etapes`/`accueil`/`volet` (lus du contenu), `copie` et `trame` pour le moteur. Ordre : univers < contenu de la séance <
  options ; une valeur écrite dans `meta` l'emporte. Refus en français avec l'`id` (pas d'`ETAPES`, `meta` sans `id`/`code`,
  clé d'univers introuvable). Les **24 séances** sont migrées, entreprise par entreprise (Smoby 8, Picard 4, Cdiscount 6,
  Boost 3, Spartoo 3) : un fichier passe de 44-61 lignes à 23-39 hors en-tête (code seul : 41-52 → 21-35). Preuve : une
  capture du `meta` complet et des options passées à `creerEntreprise` (hash clé par clé) faite avant, refaite après chaque
  entreprise : **24/24 identiques**. **Choix.** Le nom de la trame (`meta.trame: 'picard-deux-camions'`) est déclaré une fois,
  il ne se déduit pas de l'`id`, et il ne reste pas dans le `meta` rendu (le bandeau lit la trame dans le moteur, un test
  l'impose) ; `corrige: false` pour la seule séance sans corrigé (ENT-5.3) ; `menu` n'a aucun défaut (sans lui, tous les
  écrans restent). **`metier` d'`ENTREPRISES` reste déclaré à la main** : il ne peut pas être lu du `sousTitre` sans changer
  le texte de l'accueil (Picard : « Entrepôt de surgelés — Sainghin-en-Mélantois » contre « Entrepôt de Sainghin-en-Mélantois
  (59) — réception » ; Smoby : « Jouets — plateforme de Moirans-en-Montagne (Jura) » contre « Plateforme logistique de
  Moirans-en-Montagne (39) ») ; c'est à Tristan de trancher le libellé. **Test existant modifié** : le cas « tout corrigé de
  trame déclaré existe… » (`outils/test/spartoo.mjs`) cherchait `corrige: '…'` dans le texte des fichiers, il lit aussi le
  corrigé déduit par la fabrique. **Restes** : `stockOuvert`, `sansTrame` et `menu: []` sont encore recopiés dans plusieurs
  fichiers Smoby (options, pas déduites) ; la fabrique ne contrôle pas les options (c'est le lot 9a). Tests : cinq cas dans le
  bloc `dependances` (composition, refus, registre, trames), sabotés dans les deux sens. Suite complète : 878/878 (12 min 52).

### 9. `entreprise.js` : arrêter l'empilement (C5) — par lots, un à la fois
- **Lot 9a (Sonnet).** Table unique des options acceptées par `creerEntreprise`, contrôle au
  chargement (clé inconnue = refus, comme `menu`), contrôle d'unicité des `id` de quai, planning,
  entrepôt, fiche, et refus de `correction: true` sur une séance qui juge en continu.
- **Lot 9b (Sonnet) — livré.** Sortir `COLORS`, `SHIP`, `pad` de `core/` (le contenu les fournit).
- **Lot 9c (Opus pour le découpage, Sonnet pour chaque module).** Extraire, un module par commit :
  console, messagerie, écrans de données (commandes, réceptions, stock, catalogue, tiers), bandeau de
  fin. Suite verte entre chaque.
- [x] **Fini quand (décision de Tristan, 08/10/2026) — atteint le 09/10/2026 (1 851 lignes).** Chaque écran de données est dans son fichier (`entreprise.js` ≈ 1 850
  lignes) ; `FICHE-SEANCE.md` liste les options en une table. Le plan est `docs/briefs/MOTEUR-entreprise-decoupage.md`
  (13 modules, 4 passes : 1 à 4, 5 à 9, 10 et 11, 12 et 13).
- **9c bis (plus tard).** Sortir aussi les cartes des messages, les questions au fil, l'accueil et la copie rendue :
  `entreprise.js` ≈ 1 460 lignes. À reprendre quand les questions au fil seront stabilisées ; la copie rendue porte les évaluations.
- **Fait, lot 9a (08/10/2026, 7a79945, 14cf3b7, 6c516c6).** `OPTIONS` en tête de `core/types/entreprise.js` : **42 options**, une
  ligne chacune (rôle, type quand c'est sans risque). `creerEntreprise` la contrôle en première ligne : une clé inconnue, ou
  d'un mauvais type, refuse la séance (message en français : la clé, la bonne casse si c'est une faute de majuscule, les clés
  connues ; la fabrique y ajoute le nom de la séance, seul changement de `seance-entreprise.js` côté message). **Choix** : pas de
  type sur `tirage` (le moteur ne lit que sa présence) ; `quai` et `inventaire` acceptent objet ou fonction (tirage par
  élève) ; `null` et `undefined` valent « absent » ; les champs du `meta` (`correction`, `suiteAuBilan`, `parcours`…) ne sont pas
  des options. Relevé : 37 options passées par au moins une des 24 séances ; `animation`, `animations`, `questions` ne le sont que par des essais et des tests ; **lues mais passées nulle part** : `equipe` et `tirage` ; **aucune option
  morte** (rien n'est passé sans être lu). Unicité : chaque vue a un `id` texte non vide, deux fiches de même `id` sont refusées
  (`fiche` et `fiches` ensemble comptent) ; quai, planning et plan d'entrepôt sont uniques par séance, l'animation l'était déjà.
  Un `id` de vue peut encore être commun à **deux séances qui partagent une base** (Spartoo, Boost) : le contrôle ne les voit
  pas (il ne connaît qu'une séance à la fois). **Partie 3 (`correction: true`) : livrée en version limitée.** Aucun marqueur du code
  ne distingue « juge à l'envoi » de « juge en continu » ; la seule propriété de jalon que la correction elle-même exige est
  `ecran` (ce que « Corriger » rouvre). Mesure sur les 24 séances : les cinq qui ont `correction` ont de 3 à 26 jalons à `ecran`,
  les dix-neuf autres zéro. La fabrique refuse donc `correction: true` sans aucun jalon à `ecran` (Spartoo, Boost, Picard,
  Cdiscount seraient refusées) ; elle **laisse passer** une séance qui mêle quelques jalons à `ecran` et un jugement continu.
  Si Tristan veut davantage, deux pistes : **(A)** déclarer le mode de jugement dans le `meta` (`jugement: 'envoi' | 'continu'`)
  et refuser `correction` hors `'envoi'` (franc, mais c'est un second drapeau que la même erreur peut fausser) ; **(B)** un
  contrôle à l'ouverture sur la base de départ (aucun jalon à l'état `na` : Smoby et Picard rendent tous `attente`, Spartoo et
  Boost rendent `na`), à ne faire qu'avec un cas par séance parce que `na` n'est pas un contrat. Tests : six cas dans le bloc
  `dependances`, sabotés dans les deux sens. Suite complète : voir `decisions.md`.
- **Fait, lot 9a bis (08/10/2026, 5e53938 ; décidé par Tristan le jour même).** Une séance qui refuse de se charger ne
  fait plus tomber l'accueil de tout le monde. `chargerActivites()` (`activites/index.js`) charge chaque fichier à part
  (`Promise.allSettled`) : la séance fautive est écartée du registre, son erreur est retenue (`activitesEnEchec()` →
  `{ fichier, id, erreur }`, message du moteur tel quel) et répétée en `console.error`. Les élèves ne voient rien ; **l'enseignant
  lit un avis rouge en haut de l'accueil** (`core/app.js`, `cartouche`, une ligne par échec, sur tous les niveaux de l'accueil).
  Un fichier qui s'importe sans `meta.id` compte comme un refus. Suivi, compétences, conduite de séance : ils parcourent les
  séances chargées et lisent les scores par `par[uid][aid]`, donc un score enregistré sur une séance écartée est simplement
  ignoré (aucun `null` à tolérer, **aucun garde ajouté**, vérifié par un test avec un score semé). **Seul ajout dans
  `core/prof.js`** : la liste des identifiants donnée à la suppression d'un élève ou d'un groupe garde les séances écartées
  (l'`id` = le nom du fichier, vrai pour les 43), sinon leurs classements restaient derrière, invisibles. Le filet ne rend pas
  la suite aveugle : le cas « les 24 séances se chargent » exige une liste d'échecs vide. Quatre cas dans `dependances.mjs`
  (élève, enseignant, onglets de l'espace enseignant, suppression), sabotés dans les deux sens. Suite : 889/889.

- **Fait, lot 9b (08/10/2026, 3d63525).** `core/types/entreprise.js` n'importe plus rien de `contenus/` (l'import de
  `COLORS`, `SHIP` et `pad` est parti). **Relevé** : les commandes avec un code `ship` (`COL`, `CHR`, `REL`) n'existent que
  chez **Spartoo** (`contenus/spartoo.js`, `spartoo-tracabilite.js`) et **Cdiscount** (six fichiers `cdiscount-*.js`) ; Picard, Smoby
  et Boost sèment `orders: []`. Les modèles à `colors` ne sont que ceux de **Spartoo** (`buildCatalog`) ; `catalogueSimple`
  met toujours `colors: []`. **Deux options nouvelles** dans `OPTIONS` (44 au total) : `couleurs` (`{ code: [nom, teinte] }`)
  et `livraisons` (`{ code: [libellé, prix du port] }`), toutes deux de type objet, **facultatives** : la fabrique les prend dans
  l'univers, puis le contenu de la séance, puis les options (`CLES_FACULTATIVES`, `seance-entreprise.js`), sans rien refuser si elles
  manquent. `contenus/spartoo.js` exporte les deux (`couleurs = COLORS`, `livraisons = SHIP`, importés d'`entreprise-commun.js`
  qui les garde), `contenus/cdiscount.js` exporte `livraisons`. **Les 24 fichiers de séance n'ont pas bougé.** Sans table : une
  couleur inconnue n'a ni nom ni pastille (comme avant) ; un code de livraison inconnu s'affiche tel quel avec un port de 0 (avant :
  la page plantait). `pad` : une ligne locale dans `entreprise.js` (`core/ui.js` n'en avait pas ; `entreprise-commun.js` garde la sienne
  pour les contenus). **Preuve que l'écran ne change pas** : texte de la messagerie, de la fiche de commande, du bon de préparation,
  de la console (`.getorder`), du catalogue (HTML des pastilles) et de la fiche produit relevé avant et après sur les neuf séances
  qui ont des commandes (ENT-1.1 à 1.3, six Cdiscount) : octet pour octet identique. **Cinq cas** dans `dependances.mjs` (aucun
  import de `contenus/` dans `core/`, options et fabrique, code de livraison inconnu avec et sans table, Spartoo ENT-1.2, trois
  modes de livraison sur ENT-1.3 et Cdiscount), sabotés dans les deux sens. Reste de `contenus/` dans `core/` : un `import()`
  dynamique dans `core/prof.js` (les questions d'une séance, `contenus/questions/<nom>.js`), qui n'est pas une dépendance figée ;
  le test ne regarde que les imports statiques. Suite complète : 895/895.
- **Fait, 9c passe 1 (08/10/2026, d342503, ba22f0c, bc347e8, 001c788).** Quatre modules purs sortis d'`entreprise.js` (3 461 -> 3 168 lignes), un commit chacun, suite complète 895/895 à chaque fois : `entreprise-options.js` (3 461 -> 3 360 ; la table `OPTIONS` et ses deux contrôles ; `entreprise.js` la ré-exporte et garde les lectures `U.xxx`, car un cas de `dependances.mjs` relit son texte), `entreprise-theme.js` (-> 3 281 ; `styleTheme(THEME)`, `accentRougeOuVert`), `entreprise-outils.js` (-> 3 257 ; formats et `creerArticles`), `entreprise-fin.js` (-> 3 168 ; HTML du bandeau de fin, `retours` et `peutCorriger` calculés au cœur). **Preuve que l'écran ne change pas**, relevée avant (`git archive` du commit précédent) et après : options des 24 séances et messages de refus (plus de 100 cas) ; attribut `style` de `body` et de `.ent-page` et classes `ent-travail-neutre*` des 24 séances, élève et enseignant ; texte et HTML des écrans d'ENT-1.1 à 1.3 et des six Cdiscount ; bandeau `[data-fin-seance]` des 24 séances sous 7 à 49 états de jalons (dont ENT-5.4 avec `finFige`, que aucun test ne jouait, et les questions fausses / retours au bilan sur la séance d'essai) : tout identique octet pour octet. **Sabotage** : retirer `finFige` de `OPTIONS` fait tomber 7 cas de `dependances`. **Écarts au plan** : voir le compte rendu du brief. Reste : passes 3 et 4 (commandes, réceptions, console, messagerie).
- **Fait, 9c passe 2 (08/10/2026, fa7e393, abe7e47, 3d4dc61, 40db919, f493e7c).** Cinq modules sortis d'`entreprise.js` (3 168 -> 2 861 lignes), un commit chacun, suite complète 895/895 à chaque fois : `entreprise-base.js` (stock, mouvements, lots premier entré / premier sorti, clients et fournisseurs ; 3 119), `entreprise-tiers.js` (écrans Clients et Fournisseurs ; 3 079), `entreprise-catalogue.js` (catalogue et fiche produit ; 3 026), `entreprise-stock.js` (verrou à code, niveaux, Mouvements, comptage à l'aveugle ; 2 938), `entreprise-blocage.js` (blocage qualité ; 2 861). **Contrat posé** : `monter<Écran>({ … })` rend `{ vues, brancher(z), apres(z), …services }`, monté à chaque ouverture, qui reçoit chaque option par son nom (jamais `ctx` ni `U`), ne touche que ses clés de `E`, et branche `[data-filtre]` seulement sur son écran. **Preuve** : un relevé `ecran2.mjs` écrit pour l'occasion (24 séances, élève / enseignant / sans code, 1 321 relevés texte + HTML : filtres tapés, code faux, comptage à l'aveugle, 13 tentatives de blocage, console, préparation) plus le relevé de la passe 1 ; référence prise deux fois, identique ; chaque module identique octet pour octet. Clients et Fournisseurs n'étaient joués par aucun test : le relevé est la seule preuve. **Sabotage** : un mot changé dans `entreprise-tiers.js` est vu par le relevé. **Écarts au plan** : voir le compte rendu du brief. Reste : passes 3 et 4.
- **Fait, 9c passe 3 (08/10/2026, 489bede, 9e3b1de).** Deux modules sortis d'`entreprise.js` (2 861 -> 2 379 lignes), un commit chacun, suite complète 895/895 à chaque fois : `entreprise-commandes.js` (liste, fiche, bon de préparation, validation avec sortie au plus ancien lot, copie du bon en texte, commande annulée, et les aides `statutCommande`, `totaux`, `livraisonDe`, `preparer`, `corpsMailCommande`, `aFaire()` ; 2 606) et `entreprise-receptions.js` (liste, fiche, saisie, confirmation, validation, litige, bon de livraison ; `receptionDe`, `bonDeLivraison`, `aRecevoir()` ; 2 379). Le drapeau de confirmation de la réception vit dans le montage. **Preuve** : un troisième relevé, `ecran3.mjs` (24 séances x élève / enseignant, 3 170 674 caractères de texte et HTML : mails de commande et de bon de livraison, saisie touche par touche, bon édité / effacé / copié en texte et copie refusée, stock changé, validation complète et avec reliquat, annulée de quatre façons, livraison inconnue, réception validée / tout refusée / tout acceptée / référence inconnue / litige / sans colis / annoncée), relevé deux fois sur l'ancien code (identique), plus les deux relevés de la passe 2 : tout identique octet pour octet à chaque module. Le bon copié en texte et la validation d'une réception n'étaient joués par aucun test (la seule preuve est le relevé). **Sabotage** : un mot changé dans le bon copié est vu par le relevé. **Écarts au plan** : voir le compte rendu du brief (les clics « Ouvrir » restent au cœur, la messagerie les partage). Reste : la passe 4 (console, messagerie).
- **Fait, 9c passe 4 (09/10/2026, be855c4, 8e39667) : 9c livré.** Deux derniers modules sortis d'`entreprise.js` (2 379 -> 2 116 -> **1 851 lignes**, 3 461 au départ), un commit chacun, suite complète 895/895 à chaque fois : `entreprise-console.js` (les 19 commandes, l'historique, le refus pendant un comptage à l'aveugle ; 2 116) et `entreprise-messagerie.js` (boîte, mail ouvert, pièces jointes, nouveau message, réponse libre et par phrases, cadenas d'un point d'étape ; `ouvrirMail`, `docVu`, `compterDoc` rendus au cœur ; 1 851). **Les treize fichiers** de `core/types/` : `entreprise-options`, `-theme`, `-outils`, `-fin`, `-base`, `-tiers`, `-catalogue`, `-stock`, `-blocage`, `-commandes`, `-receptions`, `-console`, `-messagerie` (`.js`). **Preuve** : un quatrième relevé, `ecran4.mjs` (146 relevés séance x profil, 15 028 489 caractères : les 19 commandes de la console avec et sans argument, chaque mail, pièces jointes, réponse libre et par phrases avec confirmation et renvoi, nouveau message au fournisseur dans six cas, retour au quai, cartes, cadenas de la séance d'essai des questions), relevé deux fois sur l'ancien code (identique), plus les trois relevés précédents : tout identique octet pour octet à chaque module. Dix commandes de console sur dix-neuf n'étaient jouées par aucun test, ni la réponse par phrases dans son détail : le relevé est la seule preuve. **Sabotages** : un libellé de `.stockvalue` et la phrase du renvoi d'une réponse sont vus par le relevé. **Écart notable** : `[data-ouvrir-cmd]` et `[data-ouvrir-rec]` sont branchés par la messagerie, mais servent aussi aux boutons « Ouvrir » des listes des commandes et des réceptions. Le « 9c bis » (cartes des messages, questions au fil, accueil, copie rendue ; ≈ 1 460 lignes) reste à faire plus tard.

### 10. Un seul drapeau Simulog (C13)
- **Ce qu'on fait.** `estSimulog(meta)` (rubrique `simulog`) utilisé à la place de `/^ENT-/` et
  d'`immersif` dans `prof.js` et `app.js` ; renommer l'un des deux `questions.js`. Pas de
  déménagement de dossiers.
- **Fini quand.** Un grep de `ENT-` et d'`immersif` dans `core/` ne trouve plus de filtre « c'est une
  séance d'entreprise ».
- **Fait (09/10/2026, 7cd4a21 puis 58fe9e7).** `estSimulog(meta)` (rubrique `simulog`) est défini une fois, dans
  `activites/index.js` à côté des rubriques (le fichier n'importe rien : aucun cycle), et remplace les six filtres :
  Suivi de classe (colonnes d'entreprise et cellule « notée sur 20 »), repérage, remise à zéro, version de base et
  reprise (`app.js`), et celui de `parcours.js` (`seancesDuParcours`), que le brief ne citait pas. Relevé avant/après
  sur le registre : les mêmes 24 séances pour chaque filtre, et l'écran (colonnes du Suivi, liste de la remise à zéro
  et du déblocage) identique. **Constaté** : les 11 séances qui déclarent `parcours` (Spartoo, Smoby) sont toutes
  Simulog, donc `|| parcours` est retiré (un cas le garantit désormais) ; toutes les séances Simulog ont
  `portee: 'eleve'`, mais la fabrique laisse la séance l'écraser, donc `portee === 'eleve'` est gardé à côté du
  drapeau. `immersif` reste dans `app.js` comme **option d'affichage plein écran** (seule ligne autorisée par le
  test), de même que `logo: 'simulog'` (déjà la rubrique). Deux cas dans `dependances.mjs` : rubrique, code `ENT-` et
  `immersif` vont ensemble (calculé depuis le registre), et `core/` + `core/types/` ne contiennent plus de filtre
  `ENT-`/`immersif` (éprouvés : un `/^ENT-/` remis dans `prof.js`, un `immersif` remis dans `parcours.js`, une séance
  dont l'`immersif`, la rubrique ou le drapeau diverge : chacun fait tomber le cas). `core/questions.js` (fabrique de
  quiz) devient `core/quiz.js` ; `core/types/questions.js` (questions au fil) garde son nom. Pas de déménagement de
  dossiers (`core/simulog/` reste possible, le drapeau étant en place).

### 11. Plusieurs enseignants (C7)
- **Décision à prendre (Opus, options à écrire à Tristan avant de coder)** : identifiant de groupe
  préfixé par l'enseignant ou espace commun avec nom affiché ; co-prof ajouté depuis le site ou depuis
  la console ; orphelins filtrés par `creePar` ou visibles de tous.
- **Ce qu'on fait ensuite (Sonnet).** Le choix retenu, l'écran « Ajouter un collègue », un sélecteur
  de groupe pour un élève multi-groupes, la procédure d'amorçage en une page.
- **Fini quand.** Un second enseignant amorcé à l'émulateur crée « 1L1 » sans conflit, ne voit ni les
  élèves ni les orphelins de l'autre, et peut être ajouté comme co-prof d'un groupe.
- **Fait, lot 11a (09/10/2026, 076ec30, 8ad642a).** Cadrage : `docs/briefs/MOTEUR-plusieurs-enseignants.md`. Choix de Tristan (délégation) : D1 = C (nom d'abord, suffixe `-<uid court>` si un collègue l'a pris), D2 = A (ajout par adresse par le responsable, « Quitter » pour le collègue), D3 = A (orphelins par `creePar`), D4 = rien. **Construit sans toucher aux règles** : nouveau `core/collegues.js` (gardes de suppression, suffixe, messages lisibles, partagé par les deux backends et l'écran), `ajouterCollegue` / `retirerCollegue` / `detacherEleve` / `nomsProfs` dans les deux backends, panneau « Enseignants de … » et étiquette « groupe de … » dans `prof.js`, « Retirer du groupe » à la place de « Supprimer » quand la garde ne passerait pas, garde en tête de `supprimerEleve` et `supprimerGroupe`, ouverture des séances en champ pointé (`majGroupe` accepte `ouverts.<id>`, par `FieldPath`), `email` écrit dans le profil de l'enseignant au chargement, `groupe()` rend `null` pour un groupe dont on a été retiré (l'accueil abandonne le groupe actif). **Ce que la démonstration imite** : le suffixe, `creePar` à la création d'un élève, les gardes et leurs messages, l'ajout par adresse, le champ pointé (`appliquerPatch`), un second enseignant nommé d'après son adresse. **Preuves** : 10 cas Playwright à deux enseignants dans `groupes.mjs` (sabotés un à un : filtre `creePar`, suffixe, garde élève, garde groupe, champ pointé, bouton Supprimer, `creePar`, patch pointé de la démo : chacun fait tomber au moins un cas), 18 cas d'émulateur (145/145 en local ; sabotés : retirer la lecture par `profs` et l'écriture de son propre profil fait tomber les cas attendus), suite complète 907/907. **Reste (11b)** : les mêmes restrictions écrites dans `firestore.rules` (et en option `database.rules.json`), puis **publication des deux consoles** par Tristan. Hors chantier, assumé : la lecture de tous les profils par tout enseignant.
- **Fait, lot 11b (09/10/2026, 8ba2042, 794682c, af1d707, 6191913, df28f48, 0e17ef3).** Les règles font ceinture aux gardes du 11a. `firestore.rules` : un profil d'élève ne se supprime que par son auteur (`creePar`), par n'importe quel enseignant s'il n'a pas d'auteur (comportement d'avant, gardé), ou par le responsable de son premier groupe ; un groupe ne se supprime que par son responsable (`profs[0]`). `database.rules.json` (option prise) : `acces/{gid}` est créé par `profsGlobaux`, réécrit seulement par ses inscrits. **Correction du 11a** : un groupe cité par le profil mais disparu n'arrête plus la suppression d'un élève (`etatGroupe` dans les deux backends, la garde reçoit les groupes étrangers qui existent). 19 cas d'émulateur ajoutés (164/164), éprouvés par sabotage dans les deux sens ; 3 cas Playwright. **Reste à publier : la console Firestore (le fichier entier) et la console Realtime Database (sans le bloc `_commentaire`)** ; tant que ce n'est pas fait, les règles actuelles protègent comme avant et le site ne tente déjà plus ce que les nouvelles interdisent.

### 12. CAP OL et niveaux (C8)
- **Ce qu'on fait.** Cowork relève le référentiel CAP OL (fiche) ; puis codes et libellés dans
  `competences.js`, défaut de niveau d'un groupe à choisir, moyennes par spécialité étendues, TAB-4
  avec `niveaux: ['cap']` si c'est voulu ; un contrôle qui signale un référentiel 2de sans évaluation.
- **Fini quand.** Un groupe CAP voit ses séances et son tableau de compétences avec des libellés.
- **Fait, part « compétences » (15/10/2026, f4f63dd, 250c6bb, 24e2062).** Brief `docs/briefs/MOTEUR-cap-ol.md`.
  12 compétences `CAP-C1.1` à `CAP-C3.7` (blocs 1 et 3 du CAP OL 2026) dans `competences.js` ; une séance les
  déclare dans un champ à part, `competencesCap`, lu à la place de `competences` par un groupe `cap` (option B,
  choix de Tristan) ; 21 séances les déclarent et reçoivent le niveau `cap` ; TAB-4 reste ouvert à tous.
  `SPECIALITES` n'a pas bougé (notion de 2de). Socle : compteur 36 → 48, liste des séances CAP tenue à la main,
  un cas à l'unité, un cas d'écran (groupe CAP puis 1re, export), trois sabotages éprouvés.
- **Fait, le reste (15/10/2026, 7a847a0, ffcb8bd).** Deux choix de Tristan le même jour (`docs/decisions.md`).
  **Niveau d'un nouveau groupe** : plus de présélection (« — choisir le niveau — »), « Créer le groupe » refuse sans
  niveau et garde le nom saisi (`prof.js`) ; un cas neuf dans `groupes.mjs`, treize créations de groupe des blocs
  existants choisissent « 1re » explicitement ; sabotage éprouvé (garde retirée : le cas tombe). **Avis « à prévoir
  en 2de »** : `sansEvaluation2de(metas)` dans `competences.js` (OTM / AGOrA travaillées par une séance de 2de ou
  sans niveau, sans séance d'évaluation de 2de ; la logistique jamais), affiché sous le tableau de l'onglet
  « Compétences » d'un groupe de 2de seulement, libellé en infobulle ; un cas à l'unité (évaluée en 2de, évaluée
  en 1re seulement, jamais évaluée, séance sans niveau, sans temps, sans barème) et des vérifications dans le cas
  d'écran 2de / 1re du socle. Les « moyennes par spécialité étendues » sont écartées (`SPECIALITES` reste à trois).
  Chantier clos.

### 13. Tests : la forme (C10b)
- **Ce qu'on fait.** Remplacer les compteurs en dur par des valeurs calculées depuis le registre ;
  réécrire le cas « corrigé non lisible » (ou le retirer en le disant) ; les cinq cas « meilleur » lisent
  la séance ; `ATTENDU` complété avec ENT-2.x, 4.x, 5.x ; un test que les trois blocs de variables de
  `base.css` sont identiques ; réduire les `waitForTimeout` des blocs boost, cdiscount, spartoo au
  profit d'attentes sur l'écran. **Réécrire un cas existant : à dire à Tristan.**
- **Fini quand.** Ajouter une séance factice au registre ne fait tomber aucun test du socle.
- **Livré le 09/10/2026** (06f57c6 à 03eb63e, tests seulement, rien dans `core/`, `activites/`, `styles/`) : la liste Simulog et
  les logos du socle viennent du registre ; « corrigé non lisible » devenu « avant Valider, aucune correction à l'écran » ;
  `ATTENDU` : 18 lignes de plus (ENT-2.x, 4.x, 5.x, à valider par Tristan) ; les cinq cas « meilleur » lisent `meta.id` et
  `meta.bareme` ; le cas « Repérage » choisit une séance que personne n'a jouée (`spartoo smoby questions` passe sans
  socle) ; un cas compare les trois blocs de variables de `base.css` (`--r` et `--mono`, sans valeur par thème, sont
  déclarées dans le seul bloc clair, liste écrite dans le cas) ; `waitForTimeout` : spartoo 27 -> 7, cdiscount 38 -> 16,
  boost 67 -> 48 (restent : gestes à la souris, redessins sans signal lisible, cas qui prouvent qu'un texte NE vient PAS).
  Séance factice au registre : socle et dependances restent verts (elle doit seulement avoir `portee`). Les 260 attentes
  des autres blocs (transport 29, etc.) ne sont pas traitées.
- **Relevé le 08/10/2026 (pendant 9c).** Les blocs `spartoo smoby questions` lancés seuls font tomber « Repérage… colonne des documents », qui passe dans la suite entière (état partagé entre blocs : le cas prend la première séance immersive et suppose qu'aucun élève du groupe n'y a joué).

### 14. Doublons des vues (C11)
- **Ce qu'on fait.** Par petits commits : `ech` et `pad2` depuis `ui.js` (en gardant la contrainte
  « corrigés chargés hors navigateur » : un module sans DOM) ; une seule « jalons → étapes » ; une seule
  « note = ok/total×sur » ; un seul mélange (celui de `tirage.js`) ; une seule confirmation en deux clics ;
  une seule conservation du focus, étendue à `inventaire.js` et au redessin d'`entreprise.js`.
- **Fini quand.** Chaque fonction citée n'existe qu'à un endroit ; suite verte.
- **Livré le 09/10/2026** (f3cec57 à d637118, suite 916/916) : `ech` et `pad2` dans `core/texte.js` (sans navigateur à l'import ;
  `ui.js` les ré-exporte) ; `noteProportionnelle` dans `notes.js` ; `melangerListe` dans `tirage.js` ; `core/gestes.js`
  (`secondClic`, `memoriserFocus`, `retrouverFocus`, `garderFocus`, `auClavier`) ; les redessins du moteur gardent le focus
  clavier (inventaire compris). **Ce qui reste, et pourquoi** : les cinq « jalons → étapes » ne sont PAS fusionnées (sources,
  états rendus et champs en plus diffèrent : le quai ne rend jamais `ko`, le planning attend l'envoi, l'animation lit les
  réponses, les questions portent un poids) ; la palette de cartons n'est pas recopiée (une seule `KRAFT`) ; les
  confirmations « Oui / Non » dans la page, l'étape à trois états de `planning.js` et les armements de `tournee.js` restent à
  la main (tournee : une autre session) ; aucun délai d'annulation ajouté (à décider avec Tristan : ce serait un changement
  visible).

### 15. Couleurs et `base.css` (C12)
- **Ce qu'on fait.** Les couleurs Boost de `carte.js` en variables ; la copie du thème papier
  d'`entreprise.js` lue depuis le CSS ; sortir de `base.css` le CSS du quiz, de la carte, du plan, de la
  grille et de l'inventaire vers des feuilles de vue ; vérifier le thème sombre sur plan et visite.
- **Fini quand.** Une entreprise à charte sombre s'affiche sans retouche de vue ; `base.css` ne porte
  plus que la charte et le site.
- **Livré le 09/10/2026** (6e52000 à fe50e77, suite 919/919) : `carte.js` sans aucune couleur (légende sur `--vert`, `--terre`, `--ardoise-fond`) ; le thème papier devient la classe `theme-papier` (blocs clairs de `base.css`, `quai.css`, `planning.css`, `entrepot.css`), `styleTheme` ne recopie plus rien ; `quiz.css`, `carte.css`, `plan.css`, `grille.css`, `inventaire.css` sortis de `base.css` (1 734 -> 1 239 lignes ; déplacement pur, sauf un `@media` de `plan-svg` qui suit sa règle) ; `--sur-terre` remplace quatre `#fff` ; thème sombre du plan d'entrepôt et de la visite vérifié, rien de cassé. Rendu identique (empreintes de ~70 propriétés par élément, 27 écrans x 3 thèmes à 1366 px, 11 à 800 px). **Ce qui reste, et pourquoi** : `base.css` porte encore le CSS de la **tournée** (`tour-*`, 68 règles, imbriqué avec la grille : feuille `tournee.css` à tirer d'un prochain passage), de la messagerie, des documents, de la fiche, du suivi de classe, de la copie rendue (tout ce qui est `ent-*` et `suivi-*`), et deux règles mixtes (`.avis-ok`, qui a encore la menthe de Boost en `rgba`) ; `carte.css` garde les teintes de dessin de la carte (30 couleurs : rues, bâti, eau, nuances sombres des marqueurs) ; `iso.js` 198, `quai.js` 154, `entrepot.js` 58, `entrepot-visite.js` 20 couleurs de dessin (cartons, papier, sol), à ne pas convertir en masse ; `.ent-doc` (`base.css`) et `planning.js:484` recopient encore des valeurs du thème clair. **Défauts de contraste vus, non corrigés** : voir la ligne de `decisions.md` du 09/10 (Boost, boutons principaux 3,71 : `--sur-ardoise` prend `surAccent` alors que les aplats sont bleus ; pastille `.ent-n` 2,06 en sombre ; trois étiquettes d'ambre du plan de rangement 3,2 à 3,8 en clair).

### 16. Champs, portées et options morts (C14)
- **Ce qu'on fait.** Décider `coeur` (décision 14 : écran ou retrait), `domaines`, `volume` ; retirer
  `equipe`/`commun` et leurs règles si personne n'en veut ; `purger`, `brancherDeconnexion` ;
  `ecriture: 'tous'` du magasin : l'écrire ou le retirer.
- **Fini quand.** Chaque champ de `FICHE-SEANCE.md` est lu quelque part.
- **Livré le 09/10/2026** (77fc170 à 4003e49, suite 920/920, règles 174/174 ; **console RTDB publiée par Tristan le 09/10/2026**) :
  **décisions de Tristan** : `coeur` gardé (option A, sur les 8 séances) et `domaines` gardé, tous deux documentés « déclaré,
  pas encore lu » dans la fiche, en attente de l'écran cœur / complément (décision 14) ; `volume` gardé parce que
  `outils/test/cdiscount.mjs` le relit. **Retiré** : l'option `purger` de `supprimerGroupe` (les deux backends) et l'alias
  `brancherDeconnexion` ; les portées `equipe` et `commun` (`PORTEES = ['eleve', 'groupe']`, `cheminDe(aid, gid, demi)`, plus
  d'`eqId` ; un cas de `dependances.mjs` garde le registre et le refus du moteur) ; côté règles RTDB, la branche `communs/` et le
  `.read` de `acces/{gid}` (aucune donnée existante n'y passait : l'application n'y lit jamais). `firestore.rules` : rien à retirer.
  **Écrit** : `meta/ouvert/{table} = 'tous'` par le semis de l'enseignant (`semer`, `core/store.js`) pour les tables
  `ecriture: 'tous'` ; sept cas de règles. **Limite constatée, non traitée** : `core/types/tableau.js` (`peutModifier`) ne lit pas
  `ecriture` et ne montre « Modifier » que sur les lignes portant son `_par` ; la démo n'écrit pas `_par` (aucune ligne modifiable
  par un élève) : l'écart démo/réel que l'audit décrivait n'existe donc pas à l'écran, et l'écriture de `meta/ouvert` n'aura d'effet
  visible que si l'écran lit `ecriture` (changement de comportement des deux modes, à décider). « Fini quand » tenu pour tout champ
  sauf `coeur` et `domaines`, déclarés pour l'écran de la décision 14.

### 17. Contenus orphelins (C16)
- **Ce qu'on fait.** Déclarer les trames et corrigés Smoby 5.3 à 5.8 (ou les renommer
  `A-SUPPRIMER-…`) ; déclarer la fiche d'intention Smoby quand Tristan l'a relue ; logos sans
  référence renommés ; commentaires TechPro et « ENT-3.4 reste à écrire » ; vérifier `tab2-stocks.js`
  (règle « recalculé, pas recopié ») ; `picard-ent43.js:172-178` sans quantités attendues en clair.
- **Fini quand.** Chaque fichier de `contenus/` est référencé ou renommé.
- **Livré le 09/10/2026** (e0bb05e à 2cda9cb, suite 921/921) : **relevé** des 198 fichiers de `contenus/` : aucun logo ni
  image ni classeur ni fichier de données orphelin (`picard.png`, `simulog.png` et `smoby.png` de `contenus/trames/logos/`,
  cités par l'audit, sont lus par les générateurs `outils/trame-*.py` : ils restent, rien n'est renommé `A-SUPPRIMER-…`).
  Les corrigés `contenus/corriges/ENT-x.y.js` se déduisent du `code` de la séance. `activites/index.js` : « ENT-3.4 : pas encore
  écrite », et la mention de TechPro remplacée par Cdiscount (une seule mention reste, dans un commentaire de `core/types/entreprise.js:103`,
  hors lot). `picard-ent43.js` : les chiffres attendus des jalons (3 manquants, 37 au lieu de 40, −14 °C, 44 cartons) viennent
  des palettes et de la fiche, même texte à l'écran. `tab2-stocks.js` : les 151 valeurs attendues sont des **littéraux** (aucun
  générateur dans le dépôt, contrairement à TAB-1, TAB-3, TAB-4) : laissé tel quel, décision de Tristan (voir `decisions.md`).
  Nouveau cas de `dependances.mjs` : chaque image, classeur et fichier de données de `contenus/` est cité au moins une fois.
  **Smoby déclaré le 09/10/2026 (17 bis, 9dbfa00 et 9d5c144, suite 925/925)** : `meta.trame` des séances 5.3 à 5.8, corrigés de trame `ENT-5.4-trame.js` à `ENT-5.8-trame.js` ajoutés aux corrigés calculés, fiche d'intention Smoby dans `ENTREPRISES`. **`tab2-stocks.js` livré le 09/10/2026 (2f35e24, suite verte)** : générateur `outils/tab2-exercices.mjs`, fichier régénéré à l'identique (151 contrôles comparés champ par champ), un cas de `socle.mjs` ajouté ; plus aucun corrigé de TAB-1 à TAB-4 n'est recopié. **Reste** : la mention TechPro de `core/types/entreprise.js:103` (suivi moteur), **ENT-5.3** : Tristan a tranché le 09/10/2026 (option B) : le corrigé de trame reste non branché, la trame est servie, l'onglet Corrigés ne montre pas ses 39 questions ; rien à faire.

### 18. Deux sessions à la fois (C17)
- **Ce qu'on fait.** Port de test tiré au hasard si 8099 est pris, ou message clair ; `git grep` dans
  les consignes ; `EN-COURS.md` relu par un test léger (fichiers inscrits ↔ `git status`).
  **Touche `commun.mjs` : à dire.**
- **Fini quand.** Deux suites lancées en même temps passent toutes les deux.
- **Livré le 09/10/2026** (suite 926/926) : port libre trouvé et annoncé quand 8099 est pris ; dossier temporaire propre à chaque suite (les classeurs de `socle.mjs` ne s'écrasent plus) ; cas « EN-COURS.md » dans `dependances.mjs` ; consigne `git grep` dans `CLAUDE.md`. Deux suites en parallèle (`dependances socle` x2, puis `boost` et `cdiscount`) passent. **Ce qui reste** : `.claude/worktrees/` n'est ignoré que par `.git/info/exclude` (local ; un `.gitignore` partagé serait plus sûr, hors de ce chantier) ; `test-seances.mjs` (`PORT_SEANCES`) garde son port fixe ; le test EN-COURS ne vérifie pas que la ligne d'une session est effacée une fois son travail poussé.

### 19. Reliquats SCE / Spartoo (C15)
- **Décidé par Tristan le 09/10/2026, livré le même jour (cd622f5, suite 927/927).** Le reliquat qui gênait
  (`COLORS`/`SHIP`) était déjà parti du moteur avec le lot 9b (08/10/2026).
  1. **Spartoo ENT-1.2 et ENT-1.3 seront refondues comme ENT-1.1** (refonte du 06/10, brief
     `docs/briefs/ENT-1.1-spartoo-quai.md`), sur **deux briefs Cowork à écrire sur ce modèle** (ENT-1.2 et ENT-1.3).
     D'ici là elles sont **gelées : bugs seulement**, aucune règle commune (tutoiement, correction après
     bilan, confirmation…) ne s'y applique. La règle « Spartoo tel quel » de `CLAUDE.md` est remplacée par cette formulation.
  2. **Spartoo ENT-1.1, 1.2 et 1.3 passent en `ouverture: 'prof'`** : fermées aux élèves tant que l'enseignant ne les
     coche pas dans Conduite de séance, comme Cdiscount, Picard et Smoby. Boost (ENT-3.1 à 3.3) ne change pas.
  3. **SCE-1 à SCE-5 : rien ne change.** Elles ne s'enrichissent plus et partiront avec leur reprise dans Simulog.
  **Tests** : `spartoo.mjs` coche les trois séances pour le groupe dans « Conduite de séance » avant de les jouer ;
  `socle.mjs` attend désormais la seule carte Boost chez l'élève (Spartoo n'en montre plus).

### 20. Stratelog (C19)
- **À cadrer en Cowork** : un troisième côté (ni Prepalog ni Simulog) ou une entreprise Simulog de
  plus ? Dans le premier cas, le chantier 10 passe avant.

### 21. Tests lot A : diagnostic des échecs (C10c)
- **Ce qu'on fait.** Après le chantier 13 (le fond), la forme de ce que la suite DIT quand elle tombe. Un cas rouge ne
  donnait que la première ligne du message Playwright (« page.click: Timeout 5000ms exceeded. »), sans sélecteur, sans
  ligne, sans image ; les erreurs JavaScript étaient comptées en bloc, jamais reliées à un cas ; `egal`/`vrai` recopiés
  dans sept blocs, `proche` cinq fois dans smoby ; Playwright installé sans numéro de version sur GitHub.
- **Livré le 09/10/2026** (793c16a, tests et workflow seulement, rien dans `core/`, `activites/`, `styles/`) :
  le bilan d'un échec porte la ligne du bloc (« dependances.mjs:971 »), le journal Playwright (sélecteur attendu, état
  de l'élément) et une capture de chaque page ouverte dans `outils/captures/<date>-<pid>/` (ignoré par git, purgé après
  sept jours, joint au passage GitHub quand un groupe est rouge) ; chaque erreur JavaScript, sur toute page de tout
  contexte, est notée avec son bloc et son cas, celles des pages des blocs affichées à part et seulement si la suite est
  rouge ; `egal`/`vrai` viennent de `commun.mjs` ; playwright@1.63.0 épinglé (workflow et CLAUDE.md). Éprouvé par
  sabotage (clic sur un bouton absent, `egal` faux, erreur JS pendant un cas, sur la page partagée et sur une page de
  bloc, erreur hors cas) : ligne, sélecteur, cas et captures ressortent. Suite : 927/927 ; le seul rouge du premier
  lancer était la ligne EN-COURS de ce chantier (accolades non comprises par le cas « chemins cités existants »).
  En vérifiant la coche GitHub : « Tests séances » rouge depuis le chantier 19 (Spartoo fermée aux élèves, le test de
  bout en bout ne la cochait pas) ; `outils/test-seances.mjs` corrigé dans la foulée (amorçage : l'enseignant coche les
  trois séances), 31/31.
- **Non fait, à part** : les aides plus grosses recopiées (connexion enseignant x6 dans smoby, création de page avec
  écouteurs x6, `ouvrir`/`jalons` par séance dans boost), les cas « aucune erreur » des blocs (gardés tels quels, ils jugent
  toujours), et le point 2 des propositions du 09/10 (chaînes de cas sans remise à zéro dans boost : lot B).

### 23. Accueil léger : catalogue des séances (mesure du 22/10/2026)

**(a) Le problème.** À l'ouverture de l'accueil, `vueAccueil` (`core/app.js:209-211`) appelle `chargerActivites()`
(`activites/index.js:297`), qui importe **tous** les fichiers de séance de `ACTIVITES` (`activites/index.js:11`) pour lire
leur `meta`. Chaque fichier de séance tire ses contenus (`contenus/<entreprise>.js`, `contenus/<séance>.js`,
`contenus/questions/*`, les cartes `*-carte.js` de 160 à 700 Ko) et ses vues (`core/types/*`). Mesure en mode démonstration,
serveur local sans compression (VÉRIFIÉ, deux mesures concordantes le 22/10) : écran de connexion **40 requêtes, 0,65 Mo** ;
accueil de l'enseignant **359 requêtes, 8,9 Mo bruts** (≈ 3,2 Mo compressés), graphe d'imports profond de 13 niveaux. Sur le
réseau d'un lycée, ce sont les allers-retours en cascade qui font attendre, et ça grossit à chaque séance ajoutée. Le registre
compte **86 séances** (86 lignes dans `ACTIVITES`, 86 fichiers ; `activites/` contient 87 `.js` avec `index.js`).

**But.** L'accueil, et tout ce qui ne lit que les `meta`, lit un **catalogue léger** ; le code d'une séance (contenus, vues)
ne se télécharge que **quand on l'ouvre**. Cible : accueil ≈ 50 requêtes et < 1 Mo brut. Rien ne change pour l'élève sauf la
vitesse ; aucune étape pour Tristan ; pas de build.

**(b) État des lieux.**

*1. Qui consomme le registre, et de quoi a-t-il besoin* (VÉRIFIÉ, `git grep` sur `core/`, `activites/`, `outils/`) :

| Consommateur | Appel | A besoin de | Après le chantier |
|---|---|---|---|
| Accueil, pastilles, tuiles, entreprises (`core/app.js:211`, `:226`, `:269`) | `chargerActivites()` | `meta` seule (visibilité, rubriques, `entreprisesDe`, verrous, « validée ») | `catalogue()` |
| Avis « séance écartée » de l'accueil enseignant (`core/app.js:232`) | `activitesEnEchec()` | la liste des échecs | inchangé, mais la liste ne se remplit plus qu'à l'ouverture (voir 4) |
| Ouverture d'une séance (`core/app.js:385`) | `activite(aid)` | **le module** : `m.rendre(...)` (`core/app.js:592`) | `activite(aid)` **à la demande** (un seul fichier) |
| Verrou de parcours, version de base, reprise, séance suivante (`core/app.js:394`, `:443`, `:477`, `:505`) | `chargerActivites()` puis `.map(x => x.meta)` | `meta` seule ; `verrou`, `seancesDuParcours`, `versionDuParcours`, `appliquerReprise` (`core/parcours.js:32`, `:51`, `:64`, `:90`) ne lisent que des champs de `meta` | `catalogue()` (même forme `{ meta }`, rien à changer dans `parcours.js`) |
| `aidsConnus` (suppression d'élève, `core/prof.js:100`) | `chargerActivites()` + `activitesEnEchec()` | les `id` | `catalogue()` (il porte déjà les séances qui échoueraient : `activitesEnEchec()` reste ajouté par prudence) |
| Corrigés (`core/prof.js:153-166`) | `chargerActivites()` | `meta.corrige` (un chemin, le fichier de corrigé est importé à part) | `catalogue()` |
| Retrait d'un demi-groupe (`core/prof.js:426`) | `chargerActivites()` | `meta.portee`, `jeuId`, `code` | `catalogue()` |
| Niveaux (`core/prof.js:779-785`) | `chargerActivites()` | `meta` seule | `catalogue()` |
| Suivi de classe (`core/prof.js:1006-1034`) | `chargerActivites()` | `meta` pour les colonnes ; **le module** pour savoir si la séance « sait se noter » (`core/prof.js:1307`) et pour ramasser / vérifier les copies (`core/prof.js:1465-1498` → `ramasser`, `verifierCopie`, `core/copie.js:56`, `:78`, qui appellent `module.noter`) | `catalogue()` pour le tableau ; le bouton « Vérifier » lit `exports` du catalogue ; `activite(aid)` **au clic** sur Ramasser / Vérifier |
| Tableau des compétences (`core/prof.js:1619-1628`) | `chargerActivites()` | `meta` seule | `catalogue()` |
| Conduite de séance (`core/prof.js:1843-1845`) | `chargerActivites()` | `meta` seule | `catalogue()` |
| Semer / Geler / Réinitialiser (`core/prof.js:2020-2048`) | `activite(aid)` | `meta.tables`, `jeuId`, `portee` ; **le module** pour `graines` (Semer, seul `magasin` l'exporte) | `activite(aid)` à la demande (déjà au clic) |
| `core/parcours.js:23`, `core/competences.js`, `core/niveaux.js` | `estSimulog` seulement / rien | — | inchangé |

Exports vus sur les 86 modules (VÉRIFIÉ dans le navigateur) : `meta` et `rendre` partout, `noter` sur 11 (les évaluations en
copie), `graines` sur 1 (`magasin`). Aucun autre export n'est lu par `core/`.

*2. Ce que contient `meta`* (VÉRIFIÉ : les 86 `meta` vivants inspectés dans le navigateur, récursivement). 31 clés : `id`,
`code`, `titre`, `desc`, `rubrique`, `competences`, `portee`, `pret` (86 chacune), `bareme` (85), `tables` (74), `immersif`
(68), `corrige` (67), `ouverture` (65), `niveaux` (56), `competencesCap` (47), `parcours` (46), `questions` (44),
`precedente` (39), `correction` (35), `niveauxPrevus` (26), `bilanDetail` (19), `domaines` (18), `reinitialisable` (14),
`coeur` (12), `copie` (11), `suiteAuBilan` (7), `jeuId` (6), `notation` (5), `volume` (4), `versionBase` (1), `temps` (80).
**Tout est sérialisable en JSON** : aucune fonction, classe, `Set`, `Map`, valeur `undefined` ni nombre non fini ; l'aller-retour
JSON redonne la même chose ; aucun objet partagé entre deux `meta`. Le tout pèse **47 Ko bruts, 9 Ko compressés**.
**Mais les `meta` ne sont pas des littéraux** : 68 fichiers font `export const meta = s.meta` (fabrique `seanceEntreprise`,
`core/types/seance-entreprise.js:79-89`, qui **déduit** `rubrique`, `immersif`, `portee`, `tables`, `corrige` et, quand il
n'est pas écrit, `bareme` = nombre de jalons du contenu, cas de `activites/picard-ent44.js`) ; parmi les 18 `meta` écrits à la
main, 7 calculent `bareme` depuis le contenu importé (`bareme: EXERCICES.length`, `GENERATEURS.length`, `CORRIGEABLES` :
`activites/calculs-commerciaux.js:26`, `entr-arrondis.js:22`, `entr-conversions.js:25`, `entr-proportionnalite.js:22`,
`excel-pas-a-pas.js:27`, `excel-stock.js:21`, `journee-entrepot.js:52`) ; les séances Cdiscount mettent un objet importé dans
`meta` (`volume: SEANCE.VOLUME`, `activites/cdiscount-chiffres.js:29`, et trois autres). `verifier()` (`activites/index.js:284`)
ne contrôle que la présence d'un `meta` objet avec un `id` ; `ordonner()` (`activites/index.js:247`) range par code **segment
par segment**, mais le rang d'une **famille** (ENT, TAB, QUI…) est celui de sa première apparition **dans l'ordre de
`ACTIVITES`**, et deux codes égaux gardent l'ordre de la liste : le catalogue doit donc garder l'ordre de `ACTIVITES`.

*3. Les tests* (VÉRIFIÉ par lecture). Une cinquantaine d'appels à `chargerActivites()`, `activitesEnEchec()` ou
`ACTIVITES.map(f => f())` dans 38 blocs (`dependances`, `socle` dont `ATTENDU` / `ATTENDU_CAP` / tri par code, `action` « au
registre », `smoby`, `cdiscount`, `chep-9x`, `pelleau-10x`, `fb-6.x`, `copie`, `questions`, `tirage-niveaux`…) : ils **passent
tels quels** si `chargerActivites()`, `activitesEnEchec()` et le tableau `ACTIVITES` (fonctions d'import) gardent leur sens.
Les trois lectures du texte de `activites/index.js` (`outils/test/cdiscount.mjs:402`, `:1149`, `:1531` : « la ligne
`import('./…')` existe ») aussi, si `ACTIVITES` garde sa forme. **Ce qui casse** : les contextes qui **réécrivent le fichier
d'une séance** au vol pour changer sa `meta` et regardent ensuite l'accueil ou l'espace enseignant, car ces écrans liront le
catalogue et plus le fichier :
- `outils/test/demi-groupes.mjs:21` (`quiz-flux` servi avec `ouverture: 'prof'`) ;
- `outils/test/socle.mjs:2177` (ENT-3.2 servie `pret: false`) ;
- `outils/test/visibilite.mjs:30-44` (trois séances Cdiscount : `pret`, `ouverture`) ;
- `outils/test/tirage-niveaux.mjs:33` (`picard-ent42` avec `niveauxPrevus`, lu par l'onglet Niveaux) et `:329` (une séance
  d'essai **injectée dans `ACTIVITES`**, cherchée à l'accueil et dans les Corrigés) ;
- `outils/test/dependances.mjs:658-730`, cas 45 « séance refusée » : l'élève ne doit **pas** voir la séance cassée (voir 4).
Les réécritures de `core/app.js` (`outils/test/amenagements.mjs:22`, `tirage-niveaux.mjs:22`) s'accrochent au texte exact
`m.rendre(document.getElementById('hoteActivite'), ctx);` (`core/app.js:592`) : **cette ligne ne doit pas changer**. La
réécriture de `ENTREPRISES` (`outils/test/socle.mjs:2365`) reste valable si `ENTREPRISES` reste dans `activites/index.js`.

*4. Une séance qui échoue.* Aujourd'hui (`activites/index.js:303-318`, `activites/FICHE-SEANCE.md:2814-2820`) : le fichier
fautif est écarté au chargement global, l'élève ne voit ni tuile ni message, l'enseignant lit un avis rouge
`data-seance-ecartee` en haut de l'accueil (`core/app.js:232`), la suite tombe (`outils/test/dependances.mjs:471`). Avec un
catalogue, **l'échec n'est connu qu'à l'ouverture** : la tuile est là (le catalogue dit que la séance existe), le clic
échoue. Proposé : message « Cette séance ne s'ouvre pas pour l'instant : préviens ton enseignant », l'élève reste sur la
liste, l'échec entre dans `activitesEnEchec()` (l'avis de l'enseignant s'affiche donc après une tentative), `console.error`
comme avant. Ce cas ne peut arriver qu'après un push sans suite verte (le catalogue n'est fabriqué qu'à partir de séances qui
se chargent) ou sur une coupure réseau en cours de chargement (aujourd'hui, la même coupure écarte la séance sans rien dire).
**Décision de Tristan à prendre** (une question, avant le lot 2) : accepter ce changement visible.

**(c) Les options.**

- **A. Catalogue extrait du texte par un script Node** (`outils/catalogue.mjs` lit `export const meta = {…}` sans importer).
  **Impossible ici** : 68 `meta` sur 86 sont fabriqués par `seanceEntreprise`, 7 calculent `bareme` depuis le contenu, 4
  embarquent un objet importé (point 2). Il faudrait réécrire la fabrique en Node ou importer les modules dans Node (fichiers
  `.js` sans `"type": "module"`, vues qui supposent le navigateur) : on recalculerait autrement que le site, donc on se
  tromperait autrement. Écartée.
- **B. Catalogue fabriqué dans le navigateur** par `node outils/catalogue.mjs` : petit serveur local, Playwright (déjà
  installé pour la suite), mode démonstration, appel au vrai `chargerActivites()`, écriture de `activites/catalogue.js`
  (une ligne par séance, dans l'ordre de `ACTIVITES`, clés triées, LF, sortie identique d'un lancer à l'autre : alerte 11).
  Un cas de la suite recalcule le texte attendu à partir des `meta` vivants et le compare **au fichier** : une séance
  ajoutée, retirée, déplacée ou une `meta` modifiée sans relancer le script = suite rouge = pas de push. Fichiers : 2
  nouveaux (`outils/catalogue.mjs`, `activites/catalogue.js`), `activites/index.js`, `core/app.js`, `core/prof.js`, les
  tests du point 3. Pour une séance nouvelle : **une commande de plus** (≈ 15 s, SUPPOSÉ), aucune pour Tristan. Accueil
  attendu : ≈ 41 à 45 requêtes, ≈ 0,7 Mo brut (connexion + catalogue de 47 Ko). Risque de désynchronisation : attrapé par
  la suite ; reste le push « contenus seulement » sans suite (CLAUDE.md le permet) qui changerait un `bareme` déduit du
  contenu : couvert par la vérification rapide `node outils/catalogue.mjs --verifier` avant tout push qui touche
  `activites/` ou `contenus/`, et par la garde à l'ouverture (lot 2).
- **C. `meta` déclarée à la main hors du fichier de séance** (dans le registre, ou un `activites/<id>.meta.js` par séance que
  la séance réimporte). Pas de génération, mais : 86 fichiers réécrits ; la fabrique doit être coupée en deux (une part
  « déduire `rubrique`, `immersif`, `corrige`… » sans contenu) et `bareme` devient obligatoire partout (8 séances le
  calculent aujourd'hui) ; en fichiers séparés, **86 requêtes de plus** à l'accueil (≈ 130 en tout, cible manquée) ; dans le
  registre, un `index.js` de 50 Ko écrit à la main où une virgule casse tout le site. Désynchronisation : impossible pour les
  clés écrites, possible pour les déduites. Coût ≈ 2 fois B, risque plus grand pendant la conversion. Écartée.
- *Écartées aussi* : alléger chaque fichier de séance en n'important ses contenus que dans `rendre` (86 fichiers et la
  fabrique touchés, et `bareme` dépend du contenu) ; un service worker (n'enlève pas la cascade au premier chargement).

**Recommandation : B.** C'est la seule qui calcule le catalogue **avec le code même du site** (aucune deuxième façon de
déduire une `meta`), qui ne touche à aucun fichier de séance, et dont l'oubli est attrapé par la suite. Le prix est une
commande de plus pour Claude à chaque séance, écrite dans la procédure et rappelée par le message du test.

Forme proposée (dans `activites/index.js`, à côté de l'existant qui reste) :
```
export async function catalogue()   // → [{ meta, fichier, exports }] rangés comme chargerActivites() ; lit catalogue.js à la demande
export async function activite(id)  // → le module d'UNE séance, importé à la demande (null + avis si échec)
export function chargerActivites()  // inchangée : tout charger (tests, script du catalogue)
```

**(d) Les lots, pour Sonnet** (un à la fois, suite verte et commit entre deux ; aucun ne laisse l'accueil cassé).

*Lot 1 — le catalogue et sa garde, sans rien brancher* (≈ 1 h 30).
Fichiers : `outils/catalogue.mjs` (nouveau : serveur local, Playwright, écrit `activites/catalogue.js` ; option `--verifier`
qui compare sans écrire et sort en erreur ; la fonction de mise en forme est exportée et le script ne s'exécute pas quand on
l'importe), `activites/catalogue.js` (généré : en-tête « généré par outils/catalogue.mjs, ne pas modifier à la main », un
tableau `CATALOGUE` d'entrées `{ fichier, exports, meta }`), `activites/index.js` (ajoute `catalogue()` : import dynamique
de `catalogue.js`, passage dans `ordonner()` ; **filet** : catalogue illisible → `console.error` et repli sur
`chargerActivites()`), `outils/test/dependances.mjs` (cas nouveaux), `CLAUDE.md` et `activites/FICHE-SEANCE.md` (la
commande, **dès ce lot**, sinon une autre session qui ajoute une séance tombe sans comprendre).
Tests, dans les deux sens :
- « le catalogue est à jour » : texte recalculé depuis `chargerActivites()` = fichier, à l'octet ; le message nomme la séance,
  la clé et dit « lancer `node outils/catalogue.mjs` ». Sabotages qui doivent le faire tomber : changer un `titre` dans un
  fichier de séance ; ajouter une ligne à `ACTIVITES` ; retirer une entrée du catalogue à la main ; intervertir deux
  entrées ; une fin de ligne CRLF.
- « `catalogue()` rend les mêmes séances, dans le même ordre, que `chargerActivites()` » (ids, codes, `exports`). Sabotage :
  `catalogue()` qui oublie `ordonner()` → rouge.
- « catalogue absent → repli » : `catalogue.js` servi en 404 dans un contexte à part, `catalogue()` rend quand même les 86
  séances. Sabotage : retirer le repli → rouge.
- Reproductibilité : deux lancers du script donnent un fichier identique (empreinte) — vérifié à la main au lot 1, dit
  dans le compte rendu.

*Lot 2 — accueil et ouverture sur le catalogue* (≈ 2 h 30).
Fichiers : `activites/index.js` (`activite(id)` importe **le seul** fichier demandé, par la fonction de `ACTIVITES` qui
porte ce nom de fichier ; **piège** : `chargerActivites()` croit tout chargé dès que `cache.size` est non nul
(`activites/index.js:298`) : les modules chargés un par un vont dans un autre `Map`, ou un drapeau « tout chargé » remplace
le test de taille), `core/app.js` (`vueAccueil` et les quatre lectures de `meta` de `vueActivite` passent à `catalogue()` ;
**garde à l'ouverture** : pour un élève, `activiteVisible(m.meta…)` relu sur la `meta` du module avant de dessiner, refus
sinon — aujourd'hui `vueActivite` ne revérifie pas la visibilité, VÉRIFIÉ ; message d'échec du point 4 ; la ligne
`m.rendre(...)` inchangée), les tests du point 3 : chaque contexte qui réécrit une séance réécrit **aussi** son entrée du
catalogue, par une aide commune `forcerCatalogue(ctx, (entrees) => …)` dans `outils/test/commun.mjs` (**à dire à
Tristan** : `commun.mjs` touché) ; le cas 45 de `dependances.mjs` réécrit (**à dire**) : l'élève voit la tuile, le clic donne
le message, aucune erreur de page, l'enseignant lit ensuite l'avis.
Tests, dans les deux sens :
- « accueil élève : aucun fichier de séance téléchargé » (aucune requête `activites/<séance>.js` ni `contenus/*.js` avant
  un clic sur une tuile ; requêtes de l'accueil ≤ 55). Sabotage : remettre `chargerActivites()` dans `vueAccueil` → rouge.
- « ouvrir une séance ne télécharge qu'elle » (la requête de son fichier, pas celle d'une autre séance). Sabotage :
  `activite()` qui appelle `chargerActivites()` → rouge.
- « catalogue périmé : une séance `pret: false` dans son fichier mais `pret: true` au catalogue ne s'ouvre pas pour
  l'élève ». Sabotage : retirer la garde → rouge.
- « séance cassée à l'ouverture » (cas 45 réécrit). Sabotage : laisser l'erreur remonter → erreur de page → rouge.

*Lot 3 — espace enseignant sur le catalogue* (≈ 2 h).
Fichiers : `core/prof.js` (`aidsConnus`, Corrigés, demi-groupe, Niveaux, Suivi, Compétences, Conduite de séance sur
`catalogue()` ; « Vérifier » actif selon `exports` contient `noter` ; Ramasser / Tout ramasser / Vérifier font
`activite(aid)` au clic ; Semer / Réinitialiser déjà à la demande), tests de `copie.mjs` / `socle.mjs` relus.
Tests, dans les deux sens :
- « Suivi, Compétences, Conduite : aucun fichier de séance téléchargé ». Sabotage : une vue qui rappelle
  `chargerActivites()` → rouge.
- « Ramasser une copie charge la séance au clic et note comme avant » (les cas existants de `copie.mjs` gardent la note).
  Sabotage : `ramasser` sans module → rouge.
- « Vérifier est grisé pour une séance sans `noter` » : entrée de catalogue servie sans `noter` → bouton désactivé.

*Lot 4 — mesure, fiches, clôture* (≈ 45 min).
`outils/mesure-accueil.mjs` (ou un cas de `dependances`) qui compte requêtes et octets connexion / accueil / ouverture ;
compte rendu ici, ligne dans `docs/decisions.md`, `docs/EN-COURS.md` effacé. Suite entière (≈ 4 min 30 en parallèle) à
chaque lot.

Total ≈ 7 h, dont la moitié en essais et en adaptation des tests ; version courte possible : lots 1 et 2 seuls (≈ 4 h), qui
règlent l'attente des **élèves** ; le lot 3 ne sert que l'espace enseignant.

**(e) Fini quand.**
- Tristan, à l'écran (Ctrl+Maj+R) : la connexion, l'accueil, la pastille Simulog et ses logos, une séance d'entreprise, une
  séance de quiz, le Suivi, les Compétences, la Conduite de séance et les Corrigés s'affichent comme avant ; une séance
  fermée ne s'ouvre pas pour un élève ; l'accueil arrive nettement plus vite sur le réseau du lycée.
- Mesure (mode démonstration, serveur local) : accueil **≤ 50 requêtes et < 1 Mo brut** (attendu ≈ 41-45 et ≈ 0,7 Mo, contre
  359 et 8,9 Mo) ; ouvrir une séance d'entreprise ≈ 55 requêtes et 0,3 à 0,6 Mo de plus (VÉRIFIÉ sur ENT-8.11, ENT-3.1,
  ENT-6.9 : 53 à 55 requêtes, 271 à 556 Ko), une séance de quiz 3 requêtes ; Suivi ouvert sans aucun fichier de séance.
- Suite entière verte ; `node outils/catalogue.mjs --verifier` vert ; deux lancers du script, même empreinte.

**(f) Ce qui change dans les fiches.** `CLAUDE.md` (« Ajouter une activité = un fichier + une ligne ») et
`activites/FICHE-SEANCE.md:6` deviennent : un fichier, une ligne dans `ACTIVITES`, **puis `node outils/catalogue.mjs`** et
commit de `activites/catalogue.js` avec la séance ; même commande après toute modification d'une `meta` (code, titre, `pret`,
`ouverture`, niveaux, compétences…) ou d'un contenu dont dépend un `bareme` déduit. `FICHE-SEANCE.md:2814-2820` (séance qui
refuse de se charger) réécrit selon le point 4. Section Tests de `CLAUDE.md` : `forcerCatalogue` dans `commun.mjs`, et
« avant un push qui touche `activites/` ou `contenus/` : `node outils/catalogue.mjs --verifier` ».

**(g) Risques, et ce qui ne change pas.**
- Ne changent pas : les `id` (chemins Firebase, scores, classements), les `code` et l'ordre d'affichage (même `ordonner()`,
  même ordre de liste), `ENTREPRISES` et `RUBRIQUES` (restent dans `index.js`), le mode réel, les règles Firebase (rien à
  publier), les fichiers de séance (aucun touché), `chargerActivites()` et `ACTIVITES`.
- Catalogue périmé en production (push sans suite, ou cache du navigateur : GitHub Pages garde les fichiers quelques
  minutes, SUPPOSÉ ≈ 10 min, catalogue et séances pouvant être d'âges différents) : au pire une tuile en trop ou en moins,
  ou un titre ancien ; **jamais une séance fermée ouverte à un élève** grâce à la garde à l'ouverture du lot 2.
- Changement visible (point 4, à valider par Tristan) : une séance cassée montre sa tuile et refuse de s'ouvrir.
- Ce chantier n'allège pas **l'ouverture** d'une séance d'entreprise : `core/types/entreprise.js` importe toutes ses vues
  (38 imports), d'où ≈ 55 requêtes par séance ouverte. Un chantier à part pourra charger les vues à la demande si la mesure
  en classe le justifie.
- Non vérifié : la durée du script (≈ 15 s supposées), le temps réel gagné sur le réseau du lycée, la compression réelle de
  GitHub Pages sur le catalogue.

**Compte rendu (22/10/2026, livré).** Lots 1 à 3 construits le soir même, un Sonnet par lot (lots 2 et 3 en parallèle sur
des fichiers disjoints), Opus pour le cadrage, Fable chef de chantier ; commits 4df8283 (lot 1), 40ca64e (lot 2), b592008 (lot 3).
Le lot 4 n'a pas de script de mesure à part : la mesure vit dans les cas de `dependances` (« accueil élève : au plus 55
requêtes, aucun fichier de séance ni de contenu ») et de `copie` (onglets de l'espace enseignant sans aucune séance téléchargée).
- **Mesuré** (mode démonstration, serveur local, sans compression) : connexion 40 requêtes / 652 Ko (inchangé) ; accueil
  élève **41 requêtes / 707 Ko** (contre 359 / 8,9 Mo) ; liste des séances d'une entreprise 44 / 744 Ko ; ouvrir une séance
  de quiz : son seul fichier. Ouvrir ENT-2.1 (Cdiscount) ajoute 53 requêtes et ≈ 2,1 Mo, là où le cadrage mesurait 271 à
  556 Ko sur ENT-8.11, 3.1 et 6.9 : écart **non expliqué**, à regarder si un chantier « vues à la demande » s'ouvre un jour.
  Le script `node outils/catalogue.mjs` prend 1,2 s (le cadrage supposait 15 s) ; deux lancers, même empreinte.
- **Écarts au cadrage** : `.gitattributes` fixe `activites/catalogue.js` en LF (comparé à l'octet par la suite, il serait
  revenu en CRLF au prochain `pull` sur ce poste) ; `releverCatalogue()` exporté par le registre (le relevé fait avec les vrais
  modules, lu par le script, le test et le repli) ; dans `vueActivite`, la lecture du groupe est faite une fois, avant la garde ;
  `tirage-niveaux` : la garde `picardDeclare` (le fichier de la séance est téléchargé) devient `picardAuCatalogue` ; le cas
  « suivi, compétences, conduite » de `dependances` perd son affirmation « sans sa tuile » (ces onglets lisent le catalogue) ;
  le cas 45 devient trois cas (tuile gardée et message pour l'élève, cause au clic puis avis rouge pour l'enseignant, pas
  d'avis avant la tentative). `outils/test/commun.mjs` reçoit `forcerCatalogue` (dit à Tristan).
- **Suite** : 2327/2328 en parallèle (1 377 s) ; le seul rouge, `quai-iso` (animation du chariot, bloc que le chantier ne
  touche pas), est vert rejoué seul (134/134) : cas trop pressé en parallèle. `node outils/catalogue.mjs --verifier` vert.
- **Surprise à retenir** : l'accueil est maintenant assez rapide pour finir **avant** le rechargement de page des anciens cas ;
  un cas qui sème des données depuis le site (`B.connexionProf` puis `deconnexion`) peut lever « démarrage interrompu :
  profil null » dans la console. Vu dans le cas 45, contourné en semant depuis une page `styles/base.css`.
- **Ce qui n'est pas fait, et ne relève pas de ce chantier** : ouvrir une séance d'entreprise coûte toujours ≈ 55 requêtes
  (`core/types/entreprise.js` importe ses 38 vues en statique) ; les 15 feuilles CSS restent séparées ; `core/prof.js`
  (136 Ko) reste dans la chaîne statique d'`app.js`, donc téléchargé par les élèves. Petits gains, à prendre si la mesure
  en classe le demande.
- **À vérifier par Tristan à l'écran** (Ctrl+Maj+R) : connexion, accueil, pastille Simulog et ses logos, une séance
  d'entreprise, une séance de quiz, le Suivi (Ramasser, Vérifier), les Compétences, la Conduite de séance, les Corrigés ;
  une séance fermée ne s'ouvre pas pour un élève ; et surtout l'accueil **sur le réseau du lycée** (F12, onglet Réseau).

### Lot D. France Boissons : les chantiers avant chaque séance (relevé du 09/10/2026)
- **D'où ça vient.** Lecture des dix briefs `docs/briefs/ENT-6.1` à `ENT-6.10`, du brief `MOTEUR-vue-tournee-camion`
  et de `FRANCE-BOISSONS-refonte.md` (Q1 à Q10 tranchées le 07/10), vérifiée dans `core/` : ce qui est marqué « livré »
  existe dans le code, le reste n'existe pas. **Rien de France Boissons n'est construit** (ni `contenus/france-boissons.js`,
  ni activité ENT-6.x).
- **Ordre (Tristan, 07/10, Q2).** Les chantiers communs (D-A à D-E) d'abord, puis les séances **dans l'ordre 6.1 → 6.10**,
  chacune précédée de ses vues, un seul chantier moteur à la fois, chaque vue finie et testée (page d'essai) avant la séance.
  Presque tout est en **Opus** (vues nouvelles) ; les séances elles-mêmes déclarent des données (Sonnet).
- **Ce qui attend Tristan, hors code.** Valider les questions au fil à l'écran (D-A) ; relire les textes et barèmes marqués
  `[ ]` aux §11 des briefs (6.1, 6.8, 6.9, 6.10) ; valider la maquette de 6.10 ; publier les règles Firestore après D-C.
  **Cowork** : noms fictifs (loueur, transporteur, six clients de la côte), réécriture du §7.3 de 6.4 (zones sur le quai iso),
  dessins restants du matériel.
- **Ordre de grandeur.** 15 à 20 jours de chantiers moteur, l'un après l'autre (estimation de la refonte, non éprouvée).
- **Fini quand.** Les dix séances livrées `pret: true, ouverture: 'prof'`, le lot D coché ligne par ligne ci-dessus, une
  ligne dans `docs/decisions.md` par chantier livré.
