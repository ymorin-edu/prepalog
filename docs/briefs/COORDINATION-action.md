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
