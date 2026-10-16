# Coordination du chantier Action (vue « Localiser », ENT-8.1, ENT-8.2) — décisions du chef de chantier

**Date** : 15/10/2026 au soir. **Qui décide** : Claude (Fable), chef de chantier, sur délégation de Tristan
(« tu fais le chef de chantier pour 8.1 et 8.2, tu prends les décisions »). Les sous-agents (Sonnet pour les
balayages et les petits chantiers, Opus pour la vue nouvelle et les deux séances) construisent ; Fable relit les
diffs, commite et pousse. **Ce fichier est la mémoire du chantier** : ce qu'il faut pour reprendre si la
conversation s'arrête. Les trois briefs restent la référence du *quoi* ; ce fichier dit le *comment* et tranche
les questions ouvertes.

Briefs : `docs/briefs/MOTEUR-vue-localiser.md`, `docs/briefs/ENT-8.1-action-se-situer.md`,
`docs/briefs/ENT-8.2-action-prise-de-poste.md`. Maquette validée : `docs/briefs/action/`.

## 1. Règles de conduite (tirées des chantiers précédents)

- **Aucun sous-agent ne commite ni ne pousse.** Fable commite par nom, à chaque jalon vert ; il pousse quand
  l'arbre est propre et la suite verte (ou quand il n'y a que de la doc / du `pret: false`).
- Un sous-agent n'écrit que dans les fichiers de sa mission ; deux sous-agents n'écrivent jamais le même fichier
  en même temps (exception : `CREDITS.md` racine et `outils/test.mjs`, édités par **ajout de ligne** à l'outil
  Edit, jamais réécrits en entier).
- Ports des serveurs de test : 8107 (lot 1), 8108 (zones visite), 8109 (vue Localiser), 8110 (ENT-8.2),
  8111 (ENT-8.1). Un processus s'arrête par PID, jamais par nom.
- Python = `py` (shapely 2.1.2 présent) ; `python` est le raccourci du Store et échoue.
- Tout ce qui est écrit sur Action ou Geodis est marqué VÉRIFIÉ (source) ou CONSTRUIT, dans le code
  (commentaires) et dans les comptes rendus des briefs.

## 2. Ordre et parallélisme

| Phase | Chantiers (en parallèle) | Modèle | Dépend de |
|---|---|---|---|
| 1 | **Lot 1** contours (`outils/carte/construire-france.py`, `contenus/france-contours.js`, `CREDITS.md`, `outils/essai-localiser.html`) | Sonnet | — |
| 1 | **Zones de visite** `zone:vestiaire`, `zone:controle` + geste `entrepot:<id>:visite:fin` (`core/types/entrepot-visite.js`, `entrepot.js`, `outils/test/entrepot.mjs`) | Sonnet | — |
| 1 | **Univers Action** : logo (licence relue), photos libres Pexels, positions OSM des lieux, `contenus/action.js`, `contenus/images/action/` + `CREDITS.md` | Sonnet | — |
| 2 | **Vue Localiser, lots 2 et 3 d'un seul tenant** (`core/types/localiser.js`, `styles/localiser.css`, `entreprise.js`, `entreprise-options.js`, `declencheurs.js`, `index.html`, `FICHE-SEANCE.md`, `contenus/localiser-essai.js`, `outils/test/localiser.mjs`) | Opus | lot 1 |
| 2 | **ENT-8.2** (`contenus/action-ent82.js`, `contenus/questions/ENT-8.2.js`, `contenus/corriges/ENT-8.2.js`, `activites/action-prise-de-poste.js`, entreprise n° 8 dans `activites/index.js`, **squelette `pret: false` d'`activites/action-se-situer.js`** pour que `precedente` existe, `outils/test/action.mjs`, lignes `ATTENDU_CAP` de `outils/test/socle.mjs`) | Opus | zones visite, univers |
| 3 | **ENT-8.1** (`contenus/action-ent81.js`, `contenus/questions/ENT-8.1.js`, `contenus/corriges/ENT-8.1.js`, `activites/action-se-situer.js` complété, cas dans `outils/test/action.mjs`) | Opus | vue Localiser, univers, ENT-8.2 (squelette) |
| 4 | Suite complète en parallèle, comptes rendus des trois briefs, `decisions.md`, `chantiers.md`, `EN-COURS.md` effacé, push | Fable | tout |

ENT-8.2 ne dépend pas de la vue Localiser : elle se construit **pendant** la vue. ENT-8.1 attend la vue.

## 3. Décisions sur les questions ouvertes des briefs

### Brief moteur (§11)

1. **Évaluation** : la vue **refuse** de se charger dans une séance `copie: true` (défaut du brief). À
   retrancher avec le brief de l'évaluation C1.1 + C1.2 de janvier.
2. **Formes des points** : ronds de couleur (maquette validée), pas de carré ni de losange.
3. **Seuil « lieux proches → encart »** : règle automatique : si le cadre des lieux du `flux` tient dans **un
   quart de la largeur et un quart de la hauteur** de la France projetée → encart zoomé ; sinon trajet fléché sur
   la France entière. Montré sur les deux jeux d'essai (Action éloigné, France Boissons proche) ; Tristan
   tranche à l'écran s'il n'aime pas.
4. **`CREDITS.md`** : il n'existait pas à la racine. Créé par le lot 1 pour les **données** (contours IGN,
   positions OSM) ; les **images** restent créditées **par dossier** comme France Boissons
   (`contenus/images/action/CREDITS.md`), et le fichier racine y renvoie.
5. **Durée du zoom** : `monterCadre` a 520 ms en dur ; on la rend **paramétrable** (défaut 520 inchangé pour Boost
   et Decathlon), la vue Localiser demande 650 ms. L'échelle en mètres de `monterCadre` devient optionnelle
   (`echelle: false`) ; si l'adaptation s'avère plus coûteuse qu'un petit cadre propre à la vue, la vue écrit son
   propre cadre et on le dit. **Rien ne bouge pour Boost, ENT-6.9, Decathlon** (blocs verts exigés).
6. **Gel par les questions au fil** : le gel du moteur ne bloque pas `keydown` et l'API des vues n'expose pas
   `gele`. On **n'élargit pas le gel global** (il casserait le clavier du panneau des questions) : l'API de la
   vue Localiser reçoit `db` et `gele()` (comme `apiFiche` reçoit `db`), et la vue ignore clics et touches tant
   que `gele()` est vrai.
7. **Noms des champs** de l'option `localiser` : ceux du §4 du brief, tels quels. Jalons `etapesLocaliser(L)`,
   déclencheur `localiserFini('<vue>')`, gestes `localiser:<lieu>:region|departement|ville` et
   `localiser:<vue>:fin`, état `db.localiser[<séance>][<vue>]`.
8. **Réinitialisation** (bouton de l'enseignant) : efface `db.localiser` comme elle efface `db.entrepots`
   (comportement cohérent, rien à ajouter).
9. **Lots 2 et 3** : un seul sous-agent Opus, lot 2 vert (tests) avant d'attaquer le lot 3, note d'avancement dans
   le compte rendu du brief à chaque lot.

### Brief ENT-8.1 (§11)

1. **`competences` (Bac Pro)** : **`[]`** (pratiqué par `activites/magasin.js` ; le socle ne l'exige pas), avec
   `competencesCap: ['CAP-C1.1']`. Une séance réservée au CAP ne compte que dans les compétences CAP.
   Lignes `'ENT-8.1': 'CAP-C1.1', 'ENT-8.2': 'CAP-C1.2'` à ajouter dans `ATTENDU_CAP` de `outils/test/socle.mjs`
   (sinon le socle refuse) : **à dire à Tristan** (fichier de test du socle touché).
2. **« le bateau »** : gardé (« conteneurs » donnerait la question D).
3. **Question C** : geste **`localiser:entrepot:departement`** (et non `magasin`) : chez un confirmé, « près de
   Marseille » donnait d'avance la région du 2e lieu ; après le département de l'entrepôt, elle ne donne plus rien
   (le port est ailleurs) et elle tombe mieux (« pourquoi un entrepôt ici ? » juste après l'avoir trouvé).
4. **Textes construits par Cowork** : écrits tels quels, **liste à relire à l'écran** dans le compte rendu.
5. **« Toi, tu travailles ici »** : gardé, 1,5 point.
6. **`finFige`** : le moteur l'affiche aussi quand une **question** est fausse (les jalons de question n'ont pas
   d'`ecran`). Phrase générale : « La carte et les questions de Samia se jouent au premier essai : elles ne se
   rejouent pas. »
7. **Bandeau** : avec `correction: true`, le moteur écrit « juste / à corriger » (pas « du premier coup ») : on
   l'accepte, sans toucher `entreprise-fin.js`.
8. **Charte** : la couleur du logo d'Action décide du `THEME` (règle rouge/verte si c'est le cas). **Les couleurs
   de la carte (bleu client, terre entrepôt, encre port, vert juste) viennent de `styles/base.css`, jamais du
   `THEME`** : aucune confusion possible dans la zone de travail, même si l'accent d'Action est bleu.

### Brief ENT-8.2 (§7.2 et §11)

1. **Plan de la réception** : disposition par défaut du brief (4 quais au nord, réception et contrôle au milieu,
   litiges, bureau et vestiaire au sud). Le moteur exige au moins une allée avec un rack : **un rack minimal**
   (`travees: 1, niveaux: 1`) au bord, légendé comme le départ du stock ; c'est dit dans le compte rendu.
2. **Fin de visite** : geste nouveau **`entrepot:<id>:visite:fin`** (publié une fois à l'étape `fin`), d'où
   `quand: apresGeste('entrepot:action-reception:visite:fin')` pour le message de l'étape 2. Secours si le geste
   manquait : `quand: (db) => (db.entrepots?.['action-reception']?.atteinte || 0) >= <rang de fin>`.
3. **Visite au premier essai dans une séance `correction`** : compatible (précédent ENT-5.4 : jalons sans
   `ecran` + `finFige`). Bandeau « juste / à corriger » accepté. `finFige` : « La visite et les questions de
   Samia se jouent au premier essai : elles ne se rejouent pas. »
4. **Planigramme** : grille identique pour tous (décision de Tristan). Deux jalons de planning (règle du quai
   pris, règle de la fenêtre), 1 point chacun ; `occupe` exige `unAlaFois` sur chaque ligne.
5. **Document « Le droit »** : le panneau des questions au fil n'affiche pas de document → joint au **message de
   Samia de l'étape 4**, cité dans l'énoncé de F et I (« lis le document Le droit »). Textes exacts recopiés de
   Légifrance par le sous-agent, date de consultation en pied.
6. **Question I** : corrigée tout de suite (gardé : elle arrive après le choix de la 1re ligne).
7. **Questions au fil** : le champ s'appelle `quand: apresGeste('…')` et la correction au bilan `apres: 'bilan'`
   (les briefs disent « geste » et « corrigée au bilan » : même chose).
8. **Squelette d'ENT-8.1** : ENT-8.2 crée `activites/action-se-situer.js` en `pret: false` avec le `meta` du
   brief 8.1 (sans contenu) pour que `precedente: 'action-se-situer'` et la ligne `ENTREPRISES` n° 8 existent ;
   ENT-8.1 le complète en phase 3.

## 4. Alertes à dire à Tristan à la livraison

- **7** : `outils/test.mjs` touché (blocs `localiser` et `action` dans `BLOCS` et `GROUPES`) ; `outils/test/socle.mjs`
  touché (`ATTENDU_CAP`).
- **8** : deux activités ajoutées (ENT-8.1, ENT-8.2), entreprise n° 8.
- **9** : entreprise réelle ; le hub du Havre est réel mais placé au **centre de la commune** de
  Gonfreville-l'Orcher si aucun objet OSM ne le situe (dit dans le texte de fin : « imaginé pour l'exercice »).
- **10** : logo et photos récupérés par script, empreintes dans les `CREDITS.md`.
- **11** : `construire-france.py` reproductible (deux SHA-256 identiques).
- **13** : vue nouvelle activée seulement par `localiser` dans le contenu.
- Rien ne change dans Firebase.

## 5. Journal

- 15/10 20 h : briefs et maquette commités (712ff99), inscription dans `EN-COURS.md` (2809171), états des lieux
  faits (carte ; moteur d'entreprise), phase 1 lancée.
- 15/10 soir : phase 1 livrée et commitée : lot 1 contours (800687f), univers Action + logo + photos (177da27, 39356e0), zones de visite + geste `entrepot:<id>:visite:fin` (9691a0c). Le logo est rangé dans `contenus/trames/logos/action.svg|png` (convention des autres logos). Décisions en route : la photo du transpalette est manuelle (aucune électrique libre), la question `img-transpalette` dit « un transpalette » ; `palette-filmee.jpg` est un recadrage de `zone-colis.jpg` (ne pas montrer les deux sur un même écran) ; la place du hub du Havre est le centre de la commune de Gonfreville-l'Orcher (approchée, dite dans `MENTION`). Phase 2 lancée : vue Localiser (Opus) et ENT-8.2 (Opus) en parallèle.
- 15/10 nuit : phase 2 et 3 livrées : vue Localiser lots 2-3 (dc9a875, 16 cas), ENT-8.2 (17ecc48, 20 cas), ENT-8.1 (0de1c0c, 16 cas). Finitions : correctif `jalonJuge` (jalon bonus `null` jugé sans erreur de console), contournement `sansNull` retiré d'ENT-8.1, cas existants adaptés à l'entreprise n° 8 (`socle.mjs` : CAP-C1.1 compte 4 séances ; `tirage-niveaux.mjs` : colonne Action et banques figées). Comptes rendus des trois briefs remplis, statuts « livré ». **Rien n'a été vu à l'écran par Tristan.** Ce que les sous-agents ont laissé ouvert : le menu se redessine en retard après un point d'étape et après le bilan de la carte (moteur, l'élève passe par la carte « Nouveau message ») ; en guidage le planning dit « déjà pris » avant l'envoi (moteur) ; la question au fil fait défiler la page d'≈ 40 px (bandeau du moteur) ; sous la charte sombre de Boost la mer et les zones éteintes sont peu contrastées ; la règle du quart (encart) et les `etiq` des noms sur la carte sont à juger à l'écran ; trames élèves à faire par Cowork.

## 6. Chantier 2 (16/10/2026) : ENT-8.3 et ENT-8.4 — décisions du chef de chantier

**Délégation** : Tristan, 16/10/2026, « tu vas faire le chef de chantier pour 8.3 8.4, tu prends les décisions ». Même schéma qu'au §1 :
aucun sous-agent ne commite ; Fable commite par nom et pousse à la fin, suite verte. Briefs : `ENT-8.3-action-autre-site.md`,
`ENT-8.4-action-avant-noel.md`. Squelettes `pret: false` des deux séances posés par Fable (91479ff) : registre et `ATTENDU_CAP` déjà à jour.

### 6.1 Organisation

| Chantier | Modèle | Port | Fichiers (et personne d'autre) |
|---|---|---|---|
| Images (porte de quai numérotée, chariot élévateur, pictogramme du point de rassemblement, remorque à deux planchers) | Sonnet | — | `contenus/images/action/porte-quai-numero.jpg`, `chariot-elevateur.jpg`, `point-rassemblement.svg`, `remorque-deux-planchers.svg`, `CREDITS.md` (ajout) |
| Moteur : carte pré-posée dans le Planning (`depart` sur une carte) | Sonnet | 8114 | `core/types/planning.js`, `outils/test/planning.mjs` (cas ajoutés), `activites/FICHE-SEANCE.md` (section planning) |
| ENT-8.3 | Opus | 8112 | `contenus/action-ent83.js`, `action-ent83-donnees.js`, `contenus/questions/ENT-8.3.js`, `contenus/corriges/ENT-8.3.js`, `activites/action-autre-site.js`, `contenus/action.js` (ajouts seulement : Roques, Onnaing), `activites/index.js` (ligne `metier` de l'entreprise n° 8), `outils/test/action-83.mjs`, `outils/test/socle.mjs` (cas CAP-C1.1 recalé), lignes dans `outils/test.mjs` (groupe 2) et `tirage-niveaux.mjs` |
| ENT-8.4 | Opus | 8113 | `contenus/action-ent84.js`, `action-ent84-donnees.js`, `contenus/questions/ENT-8.4.js`, `contenus/corriges/ENT-8.4.js`, `activites/action-avant-noel.js`, `outils/test/action-84.mjs`, lignes dans `outils/test.mjs` (groupe 3) et `tirage-niveaux.mjs` |

`outils/test.mjs` et `outils/test/tirage-niveaux.mjs` : édités **par ajout de ligne**, à l'outil Edit, après relecture du fichier juste
avant. Les quatre tournent en parallèle ; ENT-8.4 n'écrit pas dans `planning.js` et joue son bloc une fois le correctif moteur posé.

### 6.2 ENT-8.3 — ce que l'état des lieux a établi (VÉRIFIÉ) et ce qui est tranché

- **Lieux propres à la séance** : `localiser.lieux` se déclare dans la séance (`core/types/entreprise.js:245`, `localiser.js:135`) ; le filtre
  `reseauDe` (`localiser.js:324`) écarte un site de `RESEAU` à moins de 2 km d'un lieu joué → Labastide et Onnaing ne sont jamais dessinés deux
  fois. **Décision** : ENT-8.3 déclare sa propre liste dans `action-ent83-donnees.js` ; Labastide y est copié de `contenus/action.js` avec un
  `indice` et sans `bonus` ; **Roques** (centre de la commune, OSM, dep 31, région 76) et **Onnaing** (lieu complet, dep 59, région 32, bonus) sont
  construits et ajoutés à `contenus/action.js` comme exports nouveaux (`LIEUX` d'ENT-8.1 intact).
- **`suite` + `apresFiche`** : la barre mène à l'écran dès qu'il est ouvert, message lu ou non (`entreprise.js:1313`). Rien à demander ; un cas
  du bloc 8.3 le couvre (le bloc 8.1 passe par des points d'étape).
- **Documents** : `html: (db) =>` accepté, `<img>` local accepté, `largeurDocs` sans plafond (1,85 en ENT-6.10), `sousTitre` texte simple.
- **Fiche « Corriger la chaîne »** : le moteur n'a pas de ligne à deux listes → deux `cadre` « Erreur 1 » / « Erreur 2 », chacun avec une
  `liste` « case n° » (1 à 6) et une `liste` « devrait dire » (9 étiquettes mélangées par élève). Jalons sans ordre, dans le contenu.
- **Remorque à deux planchers** : dessin SVG du chantier images, affiché en `<img>` dans le document de l'étape 4 ; si le fond des documents est
  sombre sous le thème sombre (enseignant seul), la figure reçoit un fond translucide clair.
- **Entreprise n° 8** (`activites/index.js:165`) : `metier` devient « Commerce à petits prix — entrepôts Geodis (Ensuès-la-Redonne) et GXO
  (Labastide-Saint-Pierre) » : à dire à Tristan.
- **Socle** : avec ENT-8.3, CAP-C1.1 compte cinq séances (une `pret: false` compte) : le cas « 10/20 (1/4) » et l'export « 1 sur 4;10 » du bloc
  `socle` sont recalés sur la valeur réelle (cas existant réécrit : alerte 7).
- Questions ouvertes du brief (§11) : **1** carte aux mêmes niveaux qu'en 8.1 (aucun chantier moteur) ; **2** textes de Cowork tels quels,
  liste à relire à l'écran dans le compte rendu ; **3** pictogramme en traits seulement ; le piège « Geodis » de la question L est gardé.
- Tirage : banques `entrepots` (fixe Labastide, 2 tirés, `verifier` ≥ 2 exploitants), `acteurs` (facile 1, moyen 1), `erreurs` (facile 1 +
  moyen ou difficile 1 : deux banques ou une `verifier`, au choix du constructeur, sur deux cases différentes), `situations` (facile 1, moyen 1,
  difficile 1, bonus confirmé moyen 1, jamais `s-etiquette` avec `e-nimes`).

### 6.3 ENT-8.4 — ce que l'état des lieux a établi (VÉRIFIÉ) et ce qui est tranché

- **Carte pré-posée** : impossible aujourd'hui (`etatNeuf` : `place: {}`, `planning.js:500`). **Décision : petit correctif moteur** plutôt que le
  repli du brief (un `occupe` « place de Romain » chevaucherait l'`occupe` « produits ménagers » : deux blocs superposés, illisible). Clé nouvelle
  sur une carte : `depart: { ligne: '<id de ligne>', de: 'HH:MM' }` ; `etatNeuf` la pose dans `place` ; « Réinitialiser » et la rouverture par
  « Corriger » la gardent telle qu'elle est (la correction repart de la pose envoyée, comme aujourd'hui) ; contrôle au chargement (ligne connue,
  heure dans l'échelle, la carte tient) ; la carte posée se déplace comme toute carte posée. Sans `depart`, rien ne change (bloc `planning`
  vert, ENT-6.3, 6.8, 7.2, 8.2 inchangées). Jalon « replacé » : règles `quai` (conflit avec les produits ménagers tant qu'elle n'a pas bougé) et
  `fenetre` ; une carte laissée à sa place = faux, sans rien de plus à écrire.
- **Fenêtre « avant midi »** : `poser` ramène une carte dans l'échelle (`planning.js:662`) et `fenetre` finissant à la fin de l'échelle ne se
  déclenche jamais. **Décision** : échelle **06:00–13:00** (pas 30 min), `fenetre` avant 12:00 ; « Quai 3 à 11 h » finit à 12 h 30 → ✗ ; le
  document du planigramme montre la même échelle (après-midi vide).
- **Ligne « nouveau créneau »** : une ligne de phrases peut être `choix: (db) =>` / `juste: (db) =>` mais elle est figée quand le mail entre
  dans la base (`entreprise.js:1189`). **Décision** : le mail du compte rendu est semé après la fiche des documents (donc après l'envoi du
  planning) avec ses phrases calculées sur la pose envoyée (`db.plannings[id].v1.place`) ; carte jamais déplacée → la phrase juste est « Je ne
  l'ai pas déplacé. » ; **le jalon de la ligne est écrit dans le contenu** : il compare le texte choisi à la phrase recalculée sur la pose
  **courante** ; si cette phrase n'est pas parmi les choix du mail (planning corrigé après le compte rendu), il juge sur la pose du moment du
  compte rendu. Dit dans le compte rendu du brief.
- **Document planigramme** : fabriqué comme en 8.2 (`tablePlanigramme`, mêmes données que les `occupe`), recopié dans le fichier de 8.4 avec
  une classe par camion pour dessiner le camion de Romain à sa place fausse, **sans le signaler** (même style que les autres).
- **Plan de Labastide** : SVG dessiné dans `action-ent84-donnees.js` (8 lieux numérotés, indices dessinés, pictogramme du point de
  rassemblement inclus par `<image href="./contenus/images/action/point-rassemblement.svg">`), `largeurDocs: 1.6`, vérifié à 1366 × 768 par un
  cas du bloc. Il ne va pas dans `contenus/action.js` (seule ENT-8.3 y écrit ce soir) : l'évaluation de janvier l'importera du fichier de 8.4.
- **Banque `lectures`** : le tirage veut des effectifs fixes par difficulté → les quatre lectures du socle sont déclarées `facile` (une tirée),
  les deux dernières `difficile` (bonus du confirmé). Les mentions « moyen » du brief restent indicatives.
- **Banque `taches`** : les 8 tâches d'ENT-8.2 recopiées (Romain, Lucas, Inès) + `t-retours`, `t-changer-rdv` ; pas d'import de
  `action-ent82.js` (séances cloisonnées).
- **Convention de PFMP (question Q)** : les citations du brief (vérifiées par Cowork le 16/10/2026 sur le PDF d'éduscol) sont reprises telles
  quelles, avec la date de consultation ; si le constructeur relit le PDF lui-même, il le dit.
- Questions ouvertes (§11) : **1** Lucas (cariste), Inès (agent administratif) ; **2** « Qui fait quoi ? » 0,75 · 0,75 · 1 ; **3** « Rendre
  compte » conflit 0,75 · créneau 0,75 · salutation 0,5 · fin 0,5 ; **4** textes de Cowork tels quels, liste à relire.
- Images : `chariot-elevateur.jpg` pour `img-chariot` ; `img-niveleur` sur la photo de quai de Smoby comme en 8.2.

### 6.4 Alertes à dire à Tristan à la livraison

- **7** : `outils/test.mjs` (blocs `action-83`, `action-84`), `outils/test/socle.mjs` (lignes `ATTENDU_CAP`, cas CAP-C1.1 recalé),
  `tirage-niveaux.mjs` (banques figées), `outils/test/planning.mjs` (cas ajoutés).
- **8** : deux activités ajoutées (ENT-8.3, ENT-8.4) ; `metier` de l'entreprise n° 8 changé.
- **9** : entreprise réelle (GXO, Kuehne+Nagel, Onnaing, Roques) : vérifié par Cowork, rien de nouveau inventé ; Roques au centre de la commune.
- **10** : deux photos récupérées par script, deux dessins originaux.
- **13** : `depart` n'agit que si une carte le déclare.
- Rien ne change dans Firebase.

### 6.5 Journal du chantier 2

- 16/10 après-midi : briefs commités (eee6db1), squelettes (91479ff), feuille §6 (12acd92) ; deux états des lieux Sonnet en parallèle, puis quatre sous-agents : images (eafefd8), moteur `depart` (55cb2c3), ENT-8.4 Opus (23a8ebc, 19 cas), ENT-8.3 Opus (4d6e197, 21 cas) ; cas du registre du bloc `action` recalé (62d00f5). Comptes rendus des deux briefs remplis par les constructeurs, statuts « livré ». **Rien n'a été vu à l'écran par Tristan.** Laissé ouvert par les constructeurs : cartes « Nouveau message » qui s'empilent sans passage par la Messagerie ; barre « Ouvrir la Messagerie » pendant « Avant de commencer » ; bouton « Vérifier mon planning » gardé en 8.4 (`aides.verifier: false` pour le retirer) ; lexique « remorque à deux planchers » (« deux étages ») proche de la réponse à P ; PDF d'éduscol non relu.

## 7. Chantier 3 (16/10/2026) : ENT-8.5 (évaluation CAP-C1.1) — décisions du chef de chantier

**Délégation** : Tristan, 16/10/2026, « tu vas faire le chef de chantier pour 8.5, tu prends les décisions ». **Mise à jour (Tristan) : « tu feras 8.6 après » : ENT-8.6 suit dans ce même chantier, sans attendre l'essai à l'écran de 8.5.** Même règles qu'au §1 (aucun
sous-agent ne commite ; le chef commite par nom et pousse suite verte). **Périmètre : la demande au moteur du §7 d'ENT-8.5, puis ENT-8.5.**
ENT-8.6 (jumelle) n'est **pas** dans ce chantier : elle fera l'objet d'un chantier suivant, après l'essai de 8.5 à l'écran ; 8.5 pose pour elle
le module partagé `contenus/action-eval-sites.js` (les deux sites + fonction pure `siteDe(identifiantEleve)`).

| Chantier | Modèle | Port | Fichiers (et personne d'autre) |
|---|---|---|---|
| Moteur : vue Localiser acceptée en `copie` (niveau standard, pas de bonus, aide après 2 erreurs, rien au Suivi avant la remise) | Opus | 8115 | `core/types/localiser.js`, `core/types/entreprise.js` (si la remise l'exige), `styles/localiser.css`, `outils/test/localiser.mjs` (cas ajoutés), `activites/FICHE-SEANCE.md` (section localiser) |
| ENT-8.5 | Opus | 8116 | `contenus/action-eval-sites.js`, `contenus/action-ent85-donnees.js`, `contenus/action-ent85.js`, `contenus/questions/ENT-8.5.js`, `contenus/corriges/ENT-8.5.js`, `activites/action-evaluation-se-situer.js`, `contenus/action.js` (ajouts seulement : Belleville, Villefranche, La Sentinelle), `activites/index.js` (si la rubrique l'exige), `outils/test/action-85.mjs`, `outils/test/socle.mjs` (ligne `ATTENDU_CAP` + cas CAP-C1.1 recalé), lignes dans `outils/test.mjs` (`BLOCS`, `GROUPES`) et `tirage-niveaux.mjs` |

Séquence : moteur d'abord (ENT-8.5 s'appuie sur la vue), puis ENT-8.5. Décisions du chef :

1. **`lieux` en fonction** : déjà accepté par le moteur (`listeLieux`, `localiser.js:135`) : le point 2 du §7 est acquis ; le sous-agent le vérifie
   par un cas et n'écrit que le point 1. Pas de repli à deux vues.
2. **Fin de la carte en évaluation** : « le trajet fléché » du `fin` est conservé (rien ne dit juste ou faux) ; le sous-agent le dit si le
   moteur impose autre chose.
3. **Même site 8.5 / 8.6** : fonction pure sur l'identifiant de l'élève (brief §7 point 3, 2ᵉ voie), dans `action-eval-sites.js`, sans graine de séance.
4. **Poids du §5 du brief** : repris tels quels (décidés par Cowork sur délégation de Tristan, §11 du brief).
5. **Textes construits par Cowork** : écrits tels quels, liste à relire à l'écran dans le compte rendu.
6. **Alertes à dire à Tristan** : 7 (`test.mjs`, `socle.mjs`, `tirage-niveaux.mjs`, `localiser.mjs` touchés ; CAP-C1.1 passe à 6 séances) ; 8 (activité ajoutée) ; 9 (entreprise réelle : GXO, Kuehne+Nagel, Onnaing, Belleville, La Sentinelle, Villefranche : vérifié par Cowork, sources au brief) ; 13 (la vue n'agit que si `localiser` est déclaré). Rien ne change dans Firebase.
