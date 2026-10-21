# Coordination — Transports Pelleau (entreprise n° 10, CAP OL) — ENT-10.1 à 10.12 + deux chantiers moteur

**Date** : 19/10/2026. **Chef de chantier** : session Claude Code (Fable), qui coordonne sans coder : états des lieux et
construction par sous-agents (Sonnet pour balayages, logo, tests, finitions ; Opus pour les vues et les séances). **Aucun sous-agent ne
commite** : le chef relit chaque compte rendu, commite par nom, pousse quand l'arbre est propre et la suite verte.
**Cadrage** : `docs/briefs/FEUILLE-DE-ROUTE-pelleau.md` (règles communes §0, poids validés par Tristan le 18/10/2026 à 22 h 03),
les 12 briefs `docs/briefs/ENT-10.*.md`, `docs/briefs/MOTEUR-inspection-poste.md`, `docs/briefs/MOTEUR-depose-par-client.md`.

> **Cette feuille passe avant les briefs** pour tout ce qu'elle tranche ci-dessous (§2). Un brief qui la contredit a tort : le dire au chef
> dans le compte rendu, ne pas trancher soi-même. Tout ce qui est marqué **(chef)** est une décision prise le 19/10/2026 sur délégation,
> à corriger par Tristan à l'écran.

## 1. État des lieux (19/10/2026, trois balayages Sonnet, lecture seule)

- **Inspection du quai** (`core/types/quai.js`, `securite.mode: 'scene'`) : objets `OBJETS_SCENE` (quai.js:384-390), vues `VUES_SCENE`
  (393-396), fonctions pures `etatsScene` (1000), `zonesScene` (1014), `pointTouche` (1027), `securiteNeuve` (1061), `jalonsScene`
  (1297-1318) ; dessin et gestes dans `creerQuai` (2637-2819). **Suppose un camion partout** (`decorDehors` dessine le camion, `zonesScene`
  appelle `boitesCamion`, l'inspection n'apparaît qu'après l'animation d'arrivée, `verifierQuai` exige un camion). État :
  `db.quais[id].securite` (non cloisonné par séance). Gestes existants : `scene:<id>:signaler`, `scene:<id>:decharger`.
- **Kit iso** (`core/iso.js`, 1 742 lignes) : objet multi-états modèle = le niveleur (677-724 : `niveleur(I, part, etat, o)`,
  `boitesNiveleur(etat)`), lampe (736-774). Convention : paramètres ajoutés **en dernier**, défaut = dessin d'avant octet pour octet ;
  `o.essai` entoure l'objet d'un `<g data-essai-objet data-etat>` pour la page d'essai et les tests. **N'existent pas** : transpalette
  électrique (`transpaletteManuel`:804 est manuel, rouge), extincteur, affichage/plan de circulation, borne de charge.
- **Dépose dirigée** (quai.js 496-735 et 1983-3570) : `deposeDe` (328), `normaliserCases` (575), clés `CLES_DEPOSE`/`CLES_CASE` (519-520,
  toute clé inconnue refusée, donc `client` aujourd'hui refusé), `verifierDepose` (561), `casesGrisees` (588, `grise: 'palette'` existe),
  `casesProposees` (598), `choisirCase` (604), `jalonsDepose` (622), `texteAttente` (2111), `texteBulleDep` (2134), `coucheCases` (2118),
  `choisirDepose` (3545). Bilan « une ligne par palette » : **n'existe pas**. `copie: true` → `casesGrisees` vide, premier clic pose.
- **Brancher une vue** : pas de registre ; import dans `core/types/entreprise.js` (modèle `creerLocaliser`, lignes 25 et 257), option dans
  la table `OPTIONS` de `core/types/entreprise-options.js` (localiser:65), entrée de menu « Mon poste » (entreprise.js:1643-1655), table
  `vues` (1925-1945), branchement des événements (2414-2418), `ecranOuvert` (1318-1330), `V.signaux` (293), `controlerIdentifiants` (281).
  Déclencheurs : `core/declencheurs.js` (`quaiDecharge` ≈139, `dialogueFini` ≈108 avec `f.dialogues = [id]`). État cloisonné par séance :
  `db.localiser[séance][id]` (entreprise.js:2282-2284) ; `db.dialogues[séance]` (2258).
- **Pages d'essai** : `outils/essai-quai-inspection.html` + `.js` chargent le vrai `creerEntreprise` avec un faux univers et un faux `ctx`
  (essai-quai-inspection.js:233-289), sans Firebase. **Tests** : `outils/test/quai-iso.mjs` (104 cas, dépose aux lignes 2447-2850, 12 cas) ;
  le serveur de test prend 8099 puis le port libre suivant (`outils/test/commun.mjs:48-72`) : **un bloc ne choisit pas de port**.
- **Séance CAP modèle** : `activites/action-prise-de-poste.js` (ENT-8.2, 38 lignes : `seanceEntreprise(ACTION, SEANCE, {meta}, SEANCE.OPTIONS)`),
  contenu `contenus/action-ent82.js` (tirage 240-249, jalons 593-627 avec `poids`, `groupe`, `ecran`, bonus `bonus: true`), questions
  `contenus/questions/ENT-8.2.js` (`ouverture` « Avant de commencer » avec `tirage: {preparation: 3, image: 1}`, questions `type: 'fil'`,
  `quand: apresGeste(...)`), corrigé `contenus/corriges/ENT-8.2.js`. Évaluation modèle : `activites/action-evaluation-prise-de-poste.js`
  (ENT-8.6 : `copie: true`, `questions`, `export const noter = s.noter`, ni `parcours` ni `correction` ni `niveauxPrevus`).
- **Univers modèle** : `contenus/chep.js` (ENTREPRISE, VOCAB, THEME `{accent, papier: true}`, LIEUX, EQUIPE, mailDe, clients, LEXIQUE,
  les cinq clés exigées `CATALOGUE = catalogueSimple([])`, `SUPPLIERS`, `SUP_BY_ID`, `CUSTOMERS`, `CM`, `baseDeDepart`, STYLE_DOCUMENTS,
  PIED, gabarits `doc*`) ; en-tête « Vérifié / Construit » comme `contenus/action.js:1-32`. Neuf clés exigées par la fabrique
  (`core/types/seance-entreprise.js:55-56`).
- **Registre** : `activites/index.js` (imports 89-93, `ENTREPRISES` 164-179, dernière ligne n° 9 CHEP:178). Une séance sans ligne
  `ENTREPRISES` tombe sous « Autres séances ».
- **Tests à toucher** (alerte 7, dit à Tristan) : `outils/test.mjs` (`BLOCS` dès :35, `GROUPES` :80-93) ; `outils/test/socle.mjs`
  `ATTENDU_CAP` (:432-445 : **12 lignes `'ENT-10.x'` à ajouter**, sinon :464 tombe) ; `outils/test/tirage-niveaux.mjs` :139-142 (colonnes
  `['2','4','6','7','8','9']` et en-têtes `[…,'CHEP']` : ajouter `'10'` et `'Transports Pelleau'` dès qu'une séance déclare `niveauxPrevus`)
  et `BANQUES_FIGEES` (:517, une entrée par `contenus/*.js` qui appelle `declarerTirage`) ; `outils/test/dependances.mjs` :273 (**au plus
  deux séances ENT sans corrigé**, marge actuelle : une) et :922-939 (tout fichier de `contenus/` doit être cité par son nom).
- **Logo** : seul `outils/logo-france-boissons.mjs` est un script de récupération (télécharge, écrit tel quel, relit, refuse script/image/URL,
  rend le PNG par Playwright, affiche taille et SHA-256). Ligne de crédit modèle : `contenus/images/action/CREDITS.md:20` (colonnes
  Fichier | Auteur | Page source | Licence | Retouche | Dimensions | Taille | SHA-256).
- **Noms** : Erwan, Loïc, Maëlys, Ar Vag, Kerlann, Kervéguen, Pelleau, Gouesnou : **0 occurrence** dans `activites/` et `contenus/`.
  « Yann » existe comme contact fournisseur Cdiscount (`contenus/cdiscount.js:132`, Yann Lalanne) et « Yannick » chez CHEP (1re).
- **Briefs** : les 12 ont §4 bis et §4 ter (10.6, 10.7, 10.10 : 3 questions au fil au lieu de 4, accepté), tous les poids font 20,
  `copie: true` en 10.4, 10.8, 10.12. Contradictions relevées : jours de la semaine écrits dans des documents datés (10.2:108, 10.5:158,
  10.8:35) contre FDR §0.7 ; 10.2:114 « avant que Loïc arrive » contre 10.2:119 ; 10.5:66 « 4 palettes » contre les annonces 2 + 3 ;
  10.7:42 (sens de l'erreur fixé) contre 10.7:86 (tiré) ; ids 10.3 `pelleau-yann-1/2` sans suffixe ; 10.4 sans id de dialogue ni de planning ;
  10.3 `apresDialogue` (le déclencheur réel est `dialogueFini`) ; 10.10 Q2 à texte fixe alors que `produit` est tiré.

## 2. Décisions du chef (19/10/2026) — valent pour tous les sous-agents

### Architecture

1. **Vue nouvelle `core/types/inspection.js`** (pas un mode du quai : le quai suppose un camion partout). Elle **réutilise** les fonctions
   pures du quai qui n'ont rien du camion (`pointTouche`, la logique des marques et signaux, `jalonsScene`) en les **important** depuis
   `quai.js` si elles sont exportées ou exportables sans changer leur comportement ; sinon, les extraire dans un petit module commun
   `core/types/inspection-commun.js` importé par les deux (jamais recopier). Toute extraction laisse les blocs `quai-iso`, `action`, `fb-6.4`,
   `smoby` **verts et inchangés**.
2. **Objets du kit** (`core/iso.js`, paramètres en dernier, défaut = dessin d'avant) : `transpaletteElectrique` (états `ok`, `fourcheTordue`,
   `roueAbimee`, `batterie`, `arretUrgence`, `fuite` ; `n` peint sur le capot ; jaune ou gris, **jamais vert**), `extincteur` (`present`,
   `absent`), `affichage` (`affiche`, `absent`), `borneCharge` (décor). Chacun rend aussi ses boîtes de clic (`boitesTranspalette(etat)`, …).
   Le rouge de l'extincteur est un petit objet, pas un aplat d'interface. Lisible à 1366 × 768.
3. **Déclaration** : option `inspection` dans `core/types/entreprise-options.js`, champs du brief §3 (`id`, `libelle`, `qui`, `consigne`,
   `vues: ['charge', 'quai']`, `points[]` avec `reparable: false` possible, `essai` pour l'avertisseur, `arret`, `commencer`, `bilan`) ;
   `inspection` peut être une **fonction de la graine**. `verifierInspection` au chargement (objets et états connus, un point par objet et
   numéro, `ok` cohérent, `aucun-faux` réservé).
4. **État** : `db.inspections[<id de la séance>][<id>] = { marques, signaux, essais, arrete, fait }` — **cloisonné par séance** comme
   `db.localiser` (règle CLAUDE.md), les états des objets se calculent. **Gestes** : `inspection:<id>:signaler`, `inspection:<id>:essai`,
   `inspection:<id>:fini`. **Déclencheur** : `inspectionFinie('<id>')` dans `core/declencheurs.js` avec `f.inspections = [id]` et un contrôle
   au chargement (modèle `dialogueFini`).
5. **Jalons** : `securite-<id>` (libellé neutre « Défaut n° i signalé avant de prendre le poste », défaut nommé dans `attendu`),
   `securite-aucun-faux`, et **`essai-<n>` dès qu'un `essai` est déclaré sur un transpalette, même quand l'avertisseur sonne** (ENT-10.2 et
   10.4 notent « avertisseur essayé » sur un engin en ordre). Aucun jalon vrai par inaction. En copie : premier clic, pas d'arrêt, pas de
   réparation commentée.
6. **Deux vues** « Le local de charge » / « Le quai », bouton de bascule **sans porte à ouvrir** (pas de camion). Bouton « Essayer
   l'avertisseur » par engin déclaré avec `essai` ; texte « Tu appuies : le klaxon sonne. » / « Tu appuies : rien ne sonne. » ; aucun son.
7. **Dépose par client** : exactement `MOTEUR-depose-par-client.md` §2 à §5 (clé `client` sur cases et palettes, `depose.clients`,
   `verifierDepose` élargi, légende qui cite l'étiquette et jamais la zone, `reactionClient`, `grise: 'palette'` imposé, jalons `depose-Px`
   inchangés dans leur forme, `attendu` nommant la zone du client), **plus** le bilan détaillé « une ligne par palette » (au bilan seulement,
   sous `bilanDetail`). Un quai sans `client` reste **octet pour octet** identique (le bloc `quai-iso` existant le prouve). Un seul écrivain
   dans `quai.js` : le constructeur de ce lot, inscrit dans `docs/EN-COURS.md` par le chef.
8. **Page d'essai d'abord** (règle de Tristan) : `outils/essai-inspection-poste.html` + `.js` (+ `.css` si besoin, dans `outils/`),
   modèle `outils/essai-quai-inspection.*` : partie 1 = chaque objet dans chaque état (avec `data-essai-objet data-etat`), partie 2 = la
   scène cliquable (marques, « Signaler à Erwan », réparation ou « pas encore réparé », essai de l'avertisseur, bascule des deux vues,
   « C'est bon, je prends mon poste »). **La vue n'est branchée dans `entreprise.js` qu'après le clic de Tristan sur la maquette.**

### Contenu (règles qui tranchent les briefs)

9. **Jamais le jour de la semaine** dans un message ou un document daté (FDR §0.7 gagne sur 10.2:108, 10.5:158, 10.8:35). Le titre
   d'ENT-10.6 « la ramasse du mercredi » reste (c'est un titre de séance, pas un document daté).
10. **Un id par séance**, suffixé : `pelleau-poste-102`, `pelleau-yann-103`, `pelleau-quai-105`, `pelleau-dialogue-104`, `pelleau-planning-104`…
    (10.3 et 10.4 complétés ainsi).
11. **Déclencheurs** : `apresDialogue` n'existe pas → `dialogueFini('<id>')` ; « Noter pour Erwan » (10.3) = le bouton « Signaler à Erwan » de
    la vue inspection, pas un bouton à part.
12. **Pas de demande au moteur hors des deux chantiers** sans passer par le chef (qui demande à Tristan). Replis adoptés d'avance :
    fiche `ordre` à départ tiré (10.1) → départ fixe, jamais déjà juste ; planning dont `occupe` dépendrait de la graine (10.2, 10.4) →
    **une grille fixe** par séance (pas de tirage du planning) ; texte de fiche calculé (10.2 `selon`) → `blocs` de fiche en fonctions
    (fiche.js:211, existe) ; « visite et inspection au premier essai » (10.2) → jalons avec `ecran` comme ENT-8.2, rien de plus ;
    10.10 Q2 → énoncé qui ne nomme pas le produit (il est tiré) ; **dessin des sacs** (10.9) → **Tristan a choisi (19/10/2026) : les sacs sont dessinés** (objet de kit `paletteSacs` dans
    `core/iso.js`, livré avant ENT-10.9, états et étiquette comme `paletteCartons`).
13. **Chiffres jamais écrits à la main** dans le contenu quand ils se déduisent des données (10.5:66 « 4 palettes ») : la réponse attendue se
    calcule depuis la feuille de ramasse et les annonces, qui doivent se correspondre ; dans les **tests**, c'est l'inverse (valeurs à la main).
14. **Sens de l'erreur induite d'ENT-10.7** : tiré par la graine (10.7:86), le texte de 10.7:42 n'est qu'un exemple.
15. **Prénoms** : Erwan, Yann, Loïc, Maëlys gardés (**chef** : Yannick de CHEP est en 1re, Yann Lalanne de Cdiscount est un contact
    fournisseur ; à dire à Tristan, qui peut renommer).
16. **Pied de tout document** : « Document pédagogique — reconstitution, non contractuel. Les clients cités sont des entreprises fictives. »
    (ENT-10.1:67), `PIED` dans `contenus/pelleau.js`. Jamais les logos de l'accueil du site comme clients.
17. **Charte** : couleurs relevées sur le logo officiel par le constructeur d'ENT-10.1 (après le logo) ; vérifier que l'accent n'est ni le
    vert « juste » ni le bleu « client » ; règle des chartes rouges ou vertes (le moteur remplace l'accent par l'encre dans la zone de
    travail d'après la teinte). Contraste ≥ 4,5 justifié en commentaire comme `contenus/chep.js:28-31`.
18. **Ligne `ENTREPRISES`** : `{ n: 10, nom: 'Transports Pelleau', metier: 'Transporteur devenu entreposeur — entrepôt neuf de Gouesnou',
    logo: './contenus/trames/logos/pelleau.svg' }` (ou `.png` si le site n'offre pas de SVG : le constructeur du logo le dit au chef).
19. **Chaque séance a son corrigé** `contenus/corriges/ENT-10.x.js` (marge de `dependances.mjs` : une seule séance sans corrigé).
20. **Univers** `contenus/pelleau.js` créé par ENT-10.1 avec, dès le départ, les **palettes types** (`PALETTE_AR_VAG`, `PALETTE_AGRI`,
    `PALETTE_KERVEGUEN`) et les clés `clients` au format de `MOTEUR-depose-par-client.md` (`{ 'ar-vag': { nom, court } … }`), pour que
    10.5 à 10.12 n'aient rien à ajouter au fichier commun. Textes de droit : `DOC_DROIT_DEPOT` (Code civil 1927, 1928, 1932) et
    `DOC_DROIT_JEUNES` (D4153-27, R4153-40, R4153-51) dans `pelleau.js`, relus sur Légifrance par le constructeur (dire vérifié/construit).

### Tests

21. **Un bloc par séance** : `outils/test/pelleau-101.mjs` … `pelleau-112.mjs`, aides communes dans `outils/test/pelleau/commun.mjs`
    (sous-dossier, comme CHEP). **(chef)** : la feuille de route prévoyait trois blocs ; un bloc par séance permet de construire plusieurs
    séances en même temps (ce qui a marché pour Action et CHEP). La vue inspection a son bloc `inspection` ; la dépose par client s'ajoute
    au bloc `quai-iso`. Chaque constructeur ajoute **sa** ligne à `BLOCS`, à `GROUPES` (groupe le plus léger : `test.mjs:78`), à
    `ATTENDU_CAP`, et à `BANQUES_FIGEES` s'il tire ; par **ajout de ligne seulement** (jamais réécrire une ligne existante).
22. **Chaque cas éprouvé dans les deux sens** : tableau « sabotage → cas tombé » exigé dans le compte rendu, un sabotage réel joué et
    remis. Un jalon ne récompense jamais l'inaction (cas explicite). Un test de suppression nomme ce qui reste.
23. Pour une vue : captures 1366 × 768 et 1280 × 720 sans défilement de page, rendues au chef dans son dossier de travail (pas dans le dépôt).

## 3. Ordre de construction et sous-agents

| Phase | Lot | Modèle | Fichiers (disjoints) | Fini quand |
|---|---|---|---|---|
| 1 | **A. Logo** par script | Sonnet | `outils/logo-pelleau.mjs`, `contenus/trames/logos/pelleau.*`, `CREDITS.md` (ligne) | fichier relu et redécodé, SHA-256, couleurs relevées données au chef |
| 1 | **B. Maquette inspection** | Opus | `core/iso.js` (ajouts), `outils/essai-inspection-poste.*` | Tristan clique la maquette (**arrêt**) |
| 1 | **C. ENT-10.1** + univers | Opus | `contenus/pelleau.js`, `contenus/pelleau-ent101.js`, `activites/pelleau-se-situer.js`, `activites/index.js` (lignes), `contenus/questions/ENT-10.1.js`, `contenus/corriges/ENT-10.1.js`, `outils/test/pelleau-101.mjs`, `outils/test/pelleau/commun.mjs`, lignes de tests | bloc vert, suite verte, compte rendu du brief |
| 1 | **D. Dépose par client** | Opus | `core/types/quai.js`, `activites/FICHE-SEANCE.md` (section dépose), `outils/test/quai-iso.mjs` (ajouts), `outils/essai-depose.*` (partie en plus) | `quai-iso` vert, cas nouveaux, sabotages |
| 2 | **E. Vue inspection** branchée | Opus | `core/types/inspection.js`, `entreprise.js`, `entreprise-options.js`, `declencheurs.js`, `styles/inspection.css` + `index.html`, `FICHE-SEANCE.md`, `outils/test/inspection.mjs` | bloc vert, captures |
| 2 | ENT-10.2 (Opus), puis 10.3 et 10.4 (Sonnet, en parallèle) | | leurs fichiers | blocs verts |
| 3 | ENT-10.5 (Opus), puis 10.6, 10.7, 10.8 (Sonnet) | | | |
| 4 | ENT-10.9 (Opus), puis 10.10, 10.11, 10.12 (Sonnet) | | | |

Consignes valables pour tout sous-agent : lire `CLAUDE.md`, cette feuille, la feuille de route, son brief, `activites/FICHE-SEANCE.md` pour
les vues qu'il utilise ; **ne jamais commiter ni `git add`** ; ne jamais arrêter un processus par son nom (PID seulement) ; ne pas toucher
aux fichiers d'un autre lot ; compte rendu ≤ 15 lignes en VÉRIFIÉ / SUPPOSÉ, avec le tableau des sabotages et la liste de ce que Tristan
doit vérifier à l'écran.

## 4. Suivi (tenu par le chef)

- 19/10/2026 : feuille écrite après trois états des lieux ; inscription dans `docs/EN-COURS.md` ; phase 1 lancée (A, B, C, D en parallèle).
- 19/10/2026 : maquette validée par Tristan (après deux retours : prises de la borne, aucune marque dans le vide) ; G-5 lancé ; ENT-10.5 lancée pendant l'arrêt ; sacs : dessinés ; photos Pelleau : accordées (script).
- 20/10/2026 : phase 4 livrée (sacs, étiquette conservation, ligne de refus, ENT-10.9 à 10.12) ; douze séances construites ; suite entière finale puis push ; EN-COURS effacé.
- 21/10/2026 : reliquats du chantier (six traits du moteur relevés par les constructeurs) soumis à Tristan un par un, six « oui » ; livrés par sous-agents Sonnet, G-9 dans `chantiers.md`, lignes du 21/10 dans `decisions.md` ; suite entière 2137/2137 ; EN-COURS effacé.
