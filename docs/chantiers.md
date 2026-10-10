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
| 7 | Quota Spark : mesurer, puis supprimer les écritures inutiles | C9 | moyen | Sonnet | oui | 4 | à faire |
| **Lot B — rendre la croissance possible** | | | | | | | |
| 8 | Fabrique de séance d'entreprise (24 fichiers recopiés) | C6 | moyen | Sonnet | oui (petit) | — | **livré** (08/10, db5ed50 à ee13996) |
| 9 | `entreprise.js` : options figées, `COLORS`/`SHIP` sortis, modules extraits | C5 | gros | Opus puis Sonnet | oui | 8 | **livré** (9a, 9a bis, 9b, 9c ; 9c bis à faire plus tard) |
| 10 | Un seul drapeau « Simulog » dans tout le code | C13 | petit | Sonnet | oui | — | livré (09/10/2026, 7cd4a21, 58fe9e7) |
| 11 | Plusieurs enseignants : co-prof, groupes par prof, orphelins filtrés | C7 | moyen à gros | Opus (décision) puis Sonnet | oui + règles | 1, 6 | **livré** (11a 09/10, 076ec30, 8ad642a ; 11b 09/10, 8ba2042, af1d707, 6191913) ; **consoles Firestore et RTDB publiées le 09/10** |
| 12 | CAP OL et niveaux : référentiel, défauts, TAB-4 | C8 | moyen | Sonnet (Cowork d'abord) | oui | référentiel CAP relevé | à faire |
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
| D-4 | Quai : motif « fût endommagé » chiffré, palette de fûts (`forme: 'fut'`), zones de sécurité à cliquer sur le quai iso (Q3 du 07/10 ; §7.3 du brief 6.4 à réécrire par Cowork) | ENT-6.4 §7 | 1,5 à 2 j | Opus | oui | — | étapes 0-1 livrées (10/10/2026 : référence Spartoo, kit sécurité et page d'essai), à valider à l'écran ; suite : étape 2 → **ENT-6.4** (sert aussi à ENT-5.4 et 1.1) |
| D-5 | Plan d'entrepôt, **mode stockage de masse** en iso ; écran « matériel du poste » ; script de l'animation dans le contenu | ENT-6.5 §7 | 12 à 16 h | Opus | oui | D-2 | à faire → **ENT-6.5** |
| D-6 | Sous-mode **comptage** ; **terminal vocal** (voix locales, son réglé par l'enseignant, coupé par défaut) ; comptages vers l'écran Inventaire | ENT-6.6 §7 | ≈ 16 h | Opus | oui | D-5 | à faire → **ENT-6.6** |
| D-7 | Terminal vocal : ajouts préparation ; **allée de picking** en iso ; **montage par cases** sur plusieurs palettes ; film et étiquettes | ENT-6.7 §7 | ≈ 18 h | Opus | oui | D-6 | à faire → **ENT-6.7** |
| D-8 | Planning : `conduite` par carte, ligne qui porte sa seconde ressource (`porteAffectation`) ; noms fictifs par Cowork | ENT-6.8 §7 | ½ j | Opus | oui | — | à faire (`versions` sur un jalon : déjà livré) → **ENT-6.8** |
| D-9 | **Tournée « camion », lots 1 à 3** (fenêtres, approche, conduite et pause, sans quai, profil porteur, carte de la côte) + page d'essai validée ; calage et jeux de valeurs | brief `MOTEUR-vue-tournee-camion` | ≈ 3,5 j | Opus | oui | — | à faire → **ENT-6.9** (lots 4 et 5 plus tard) |
| D-10 | Grille dans une fiche (lisant une autre fiche) ; image SVG en document avec loupe ; objets du kit iso (porteur, fût vide, casier, bâtiments, route) ; écran d'animation à `quand` ; **maquette Cowork à valider par Tristan** | ENT-6.10 §7 | ≈ 2 j | Opus | oui | D-5 | à faire (formule en cliquant : déjà dans `grille.js`, à vérifier) → **ENT-6.10** |

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
