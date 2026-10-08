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
| 1 | Règles Firestore : élève, groupes, score ; droits des enseignants | C1 | moyen | Sonnet | non (règles) | — | **livré** (7a86d42 puis 1 bis, 08/10) ; reste à **publier les deux consoles** (Tristan) |
| 2 | Remettre `CLAUDE.md` et `FICHE-SEANCE.md` d'aplomb | C18 | petit | Sonnet | non | — | **livré** (08/10, Fable, doc seule : les fiches de `docs/fiches/` restent à Cowork, voir l'annexe de l'audit) |
| 3 | Tests de règles sur GitHub, hôtes externes partout, port pris lisible | C10a | petit | Sonnet | non (tests) | — | à faire |
| 4 | Fiabiliser le mode réel (écoutes, échecs remontés, geler, suivi) | C2 | moyen | Sonnet | oui | 3 | **en cours** (autre session, 08/10) |
| 5 | Un bug de contenu n'est plus noté « faux » | C3 | petit | Sonnet | oui | 4 fini | à faire |
| 6 | Suppressions sans traces invisibles, miroir reconstruisible | C4 | moyen | Sonnet | oui | 1, 4 | à faire |
| 7 | Quota Spark : mesurer, puis supprimer les écritures inutiles | C9 | moyen | Sonnet | oui | 4 | à faire |
| **Lot B — rendre la croissance possible** | | | | | | | |
| 8 | Fabrique de séance d'entreprise (24 fichiers recopiés) | C6 | moyen | Sonnet | oui (petit) | — | à faire, **avant France Boissons** |
| 9 | `entreprise.js` : options figées, `COLORS`/`SHIP` sortis, modules extraits | C5 | gros | Opus puis Sonnet | oui | 8 | à faire, par lots |
| 10 | Un seul drapeau « Simulog » dans tout le code | C13 | petit | Sonnet | oui | — | à faire |
| 11 | Plusieurs enseignants : co-prof, groupes par prof, orphelins filtrés | C7 | moyen à gros | Opus (décision) puis Sonnet | oui + règles | 1, 6 | à faire |
| 12 | CAP OL et niveaux : référentiel, défauts, TAB-4 | C8 | moyen | Sonnet (Cowork d'abord) | oui | référentiel CAP relevé | à faire |
| **Lot C — hygiène** | | | | | | | |
| 13 | Tests : compteurs en dur, cas vides, `ATTENDU` complété, doublons | C10b | moyen | Sonnet | non (tests) | — | à faire |
| 14 | Doublons des vues (`ech`, étapes, note, palette, confirmation, mélange, focus) | C11 | moyen | Sonnet | oui | 9 avancé | à faire |
| 15 | Couleurs en dur et `base.css` fourre-tout | C12 | petit à moyen | Sonnet | `styles/` + vues | — | à faire |
| 16 | Champs `meta`, portées et options morts | C14 | petit | Sonnet | oui | décision 14 (cœur) | à faire |
| 17 | Contenus orphelins, trames Smoby à déclarer, commentaires périmés | C16 | petit | Sonnet | non | — | à faire |
| 18 | Deux sessions à la fois : port, `git grep`, `EN-COURS` | C17 | petit | Sonnet | non (`commun.mjs`) | — | à faire |
| 19 | Reliquats SCE / Spartoo : acter la règle | C15 | petit | Sonnet | non | 9 | à décider |
| 20 | Stratelog | C19 | ? | Opus | ? | 10 | à cadrer |

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

### 6. Suppressions sans traces (C4)
- **Ce qu'on fait.** Effacer `classements/{aid}/{uid}` et les `travaux` orphelins à la suppression
  d'un élève ; nettoyer `demiDe` et `equipes` dans tous les groupes ; effacer `_reprise-*` avec
  `_debloque-*` ; un bouton « Reconstruire le miroir d'accès » pour un groupe dont `acces/{gid}`
  manque ; ordre inchangé (élève avant groupe, miroir en dernier).
- **Fini quand.** Le test de suppression nomme **ce qui reste** après chaque opération et la liste est
  vide ; essai à l'émulateur sur un groupe à deux profs.

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

### 9. `entreprise.js` : arrêter l'empilement (C5) — par lots, un à la fois
- **Lot 9a (Sonnet).** Table unique des options acceptées par `creerEntreprise`, contrôle au
  chargement (clé inconnue = refus, comme `menu`), contrôle d'unicité des `id` de quai, planning,
  entrepôt, fiche, et refus de `correction: true` sur une séance qui juge en continu.
- **Lot 9b (Sonnet).** Sortir `COLORS`, `SHIP`, `pad` de `core/` (le contenu les fournit).
- **Lot 9c (Opus pour le découpage, Sonnet pour chaque module).** Extraire, un module par commit :
  console, messagerie, écrans de données (commandes, réceptions, stock, catalogue, tiers), bandeau de
  fin. Suite verte entre chaque.
- **Fini quand.** `entreprise.js` sous 1 500 lignes ; `FICHE-SEANCE.md` liste les options en une
  table, sans paragraphes datés.

### 10. Un seul drapeau Simulog (C13)
- **Ce qu'on fait.** `estSimulog(meta)` (rubrique `simulog`) utilisé à la place de `/^ENT-/` et
  d'`immersif` dans `prof.js` et `app.js` ; renommer l'un des deux `questions.js`. Pas de
  déménagement de dossiers.
- **Fini quand.** Un grep de `ENT-` et d'`immersif` dans `core/` ne trouve plus de filtre « c'est une
  séance d'entreprise ».

### 11. Plusieurs enseignants (C7)
- **Décision à prendre (Opus, options à écrire à Tristan avant de coder)** : identifiant de groupe
  préfixé par l'enseignant ou espace commun avec nom affiché ; co-prof ajouté depuis le site ou depuis
  la console ; orphelins filtrés par `creePar` ou visibles de tous.
- **Ce qu'on fait ensuite (Sonnet).** Le choix retenu, l'écran « Ajouter un collègue », un sélecteur
  de groupe pour un élève multi-groupes, la procédure d'amorçage en une page.
- **Fini quand.** Un second enseignant amorcé à l'émulateur crée « 1L1 » sans conflit, ne voit ni les
  élèves ni les orphelins de l'autre, et peut être ajouté comme co-prof d'un groupe.

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

### 14. Doublons des vues (C11)
- **Ce qu'on fait.** Par petits commits : `ech` et `pad2` depuis `ui.js` (en gardant la contrainte
  « corrigés chargés hors navigateur » : un module sans DOM) ; une seule « jalons → étapes » ; une seule
  « note = ok/total×sur » ; un seul mélange (celui de `tirage.js`) ; une seule confirmation en deux clics ;
  une seule conservation du focus, étendue à `inventaire.js` et au redessin d'`entreprise.js`.
- **Fini quand.** Chaque fonction citée n'existe qu'à un endroit ; suite verte.

### 15. Couleurs et `base.css` (C12)
- **Ce qu'on fait.** Les couleurs Boost de `carte.js` en variables ; la copie du thème papier
  d'`entreprise.js` lue depuis le CSS ; sortir de `base.css` le CSS du quiz, de la carte, du plan, de la
  grille et de l'inventaire vers des feuilles de vue ; vérifier le thème sombre sur plan et visite.
- **Fini quand.** Une entreprise à charte sombre s'affiche sans retouche de vue ; `base.css` ne porte
  plus que la charte et le site.

### 16. Champs, portées et options morts (C14)
- **Ce qu'on fait.** Décider `coeur` (décision 14 : écran ou retrait), `domaines`, `volume` ; retirer
  `equipe`/`commun` et leurs règles si personne n'en veut ; `purger`, `brancherDeconnexion` ;
  `ecriture: 'tous'` du magasin : l'écrire ou le retirer.
- **Fini quand.** Chaque champ de `FICHE-SEANCE.md` est lu quelque part.

### 17. Contenus orphelins (C16)
- **Ce qu'on fait.** Déclarer les trames et corrigés Smoby 5.3 à 5.8 (ou les renommer
  `A-SUPPRIMER-…`) ; déclarer la fiche d'intention Smoby quand Tristan l'a relue ; logos sans
  référence renommés ; commentaires TechPro et « ENT-3.4 reste à écrire » ; vérifier `tab2-stocks.js`
  (règle « recalculé, pas recopié ») ; `picard-ent43.js:172-178` sans quantités attendues en clair.
- **Fini quand.** Chaque fichier de `contenus/` est référencé ou renommé.

### 18. Deux sessions à la fois (C17)
- **Ce qu'on fait.** Port de test tiré au hasard si 8099 est pris, ou message clair ; `git grep` dans
  les consignes ; `EN-COURS.md` relu par un test léger (fichiers inscrits ↔ `git status`).
  **Touche `commun.mjs` : à dire.**
- **Fini quand.** Deux suites lancées en même temps passent toutes les deux.

### 19. Reliquats SCE / Spartoo (C15)
- **À décider par Tristan** : la règle « Spartoo tel quel » est-elle maintenue après la refonte du
  06/10 ? Le reliquat qui gêne (`COLORS`/`SHIP`) part avec le lot 9b. SCE attend sa migration dans
  Simulog, comme prévu par la finalité.

### 20. Stratelog (C19)
- **À cadrer en Cowork** : un troisième côté (ni Prepalog ni Simulog) ou une entreprise Simulog de
  plus ? Dans le premier cas, le chantier 10 passe avant.
