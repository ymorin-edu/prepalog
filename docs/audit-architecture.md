# Audit d'architecture de Prepalog — 08/10/2026

> Audit en **lecture seule**, demandé par Tristan. Aucun fichier de code, de contenu, de style ni de
> test n'a été modifié. Ce rapport est le seul fichier écrit.
>
> **Comment il a été fait.** Lecture directe de `CLAUDE.md`, `docs/LISEZMOI.md`, `docs/EN-COURS.md`,
> `docs/fiches/prepalog-finalite.md`, `activites/index.js`, `activites/FICHE-SEANCE.md` (sections
> exports, `meta`, `ctx`), `firestore.rules` et le code des écoutes temps réel. Six balayages délégués
> à un modèle plus léger ont lu le reste (noyau, vues et styles, séances et contenus, tests, Firebase,
> fiches), chacun avec obligation de citer `fichier:ligne`. La suite de tests a été lancée une fois.
>
> **Ce que veulent dire les étiquettes.** **VÉRIFIÉ** = le code ou le test a été lu, la ligne est citée.
> **SUPPOSÉ** = déduit (par exemple du comportement documenté de Firebase), non exécuté : à confirmer
> avant d'agir dessus. Deux points lourds (règles Firestore, désabonnement des écoutes) ont été relus
> une seconde fois directement.
>
> **État du dépôt au moment de l'audit.** Une autre session travaillait (chantier « Questions au fil,
> lot 3 », inscrit dans `docs/EN-COURS.md`) : 21 fichiers modifiés non commités, dont sept de `core/`
> (+92 / −14 lignes). L'audit a lu **le disque, ce chantier compris**. Les lignes citées dans ces
> fichiers peuvent bouger de quelques unités après son commit.
>
> **Suite de tests : 862 / 862 réussis**, en 12 min 45 (VÉRIFIÉ, lancée sur un autre port parce que le
> port habituel 8099 était pris par l'autre session). `CLAUDE.md` parle encore de « ~545 cas, ~5 min ».

---

## Résumé en dix lignes

1. Le socle tient : site statique sans build, registre d'activités à une ligne, tri par `code`, notes
   par compétence, 862 tests verts, aucune requête hors domaine. Il ne faut surtout pas y toucher.
2. Le vrai danger n'est pas dans le code que tu vois à l'écran, il est dans les **règles Firebase** :
   un élève peut s'inscrire lui-même dans n'importe quel groupe et écrire ses propres notes ; tout
   enseignant peut lire, modifier ou supprimer le profil de n'importe qui.
3. Le **mode réel n'est couvert par aucun test** et il diffère du mode démonstration sur une dizaine de
   points : écoutes jamais fermées, sauvegardes qui échouent en silence, requêtes refusées puis
   contournées, geler/dégeler qui ne marche sans doute pas en réel.
4. `core/types/entreprise.js` fait 3 283 lignes, dont une seule fonction de près de 3 000 lignes, et
   accepte plus de trente options : chaque séance nouvelle y ajoute la sienne. C'est là que la
   prochaine régression sur une séance déjà jouée se produira.
5. Les 24 fichiers de séance d'entreprise sont recopiés à 70-80 % les uns des autres ; les champs
   `meta` morts (`domaines`, `coeur`, `volume`) et les fiches périmées montrent que la documentation
   suit le code avec retard.
6. Un bug de contenu est noté « faux » pour l'élève : les erreurs de jalon sont avalées sans journal.
7. Les tests valent leur prix sur les jalons et les règles de fond, mais 260 attentes fixes, des
   compteurs écrits en dur et quelques cas vides les rendent fragiles à chaque séance ajoutée.
8. Les suppressions laissent des traces invisibles (classements, travaux sans parent, comptes Auth).
9. La frontière Prepalog / Simulog existe (rubrique `simulog`) mais elle est portée par trois critères
   indépendants que rien ne relie.
10. Pour ajouter des entreprises, des collègues, le CAP OL et prepalog.fr : la bascule de domaine est
    prête ; le CAP, les collègues et le volume d'entreprises ne le sont pas.

## Les trois chantiers à faire en premier

| # | Chantier | Taille | Modèle | `core/` ? |
|---|---|---|---|---|
| 1 | **Règles Firestore** : interdire à un élève de changer sa liste de groupes et de forger un score ; limiter ce qu'un enseignant peut faire sur les profils des autres. Puis **publier dans la console**. | moyen | Sonnet | non (`firestore.rules`, `outils/test-regles.mjs`) |
| 2 | **Fiabiliser le mode réel** : fermer vraiment les écoutes, faire remonter les échecs de sauvegarde, aligner la démo sur le réel, lancer les tests de règles sur GitHub. | moyen | Sonnet | oui (`backend-firebase.js`, `backend-demo.js`, `store.js`) |
| 3 | **Arrêter l'empilement dans `entreprise.js`** : une fabrique de séance pour les 24 fichiers recopiés, une liste d'options figée et documentée, les erreurs de jalon journalisées au lieu d'être notées « faux ». Sans réécriture. | gros | Opus (cadrage) puis Sonnet | oui, un seul chantier à la fois |

---

## 1. Ce qui est solide et qu'il ne faut pas casser

Tout ce qui suit est **VÉRIFIÉ**.

- **Le site statique sans build ni framework.** Ce qui est dans le dépôt est ce qui est servi. Aucune
  requête hors domaine : le seul `https://` du code applicatif, ce sont cinq liens Padlet/Digipad ouverts
  en onglet par les séances SCE (`activites/*.js:23-24`). Le test qui relit le dépôt existe
  (`outils/test/dependances.mjs:183-239`).
- **Le registre à une ligne** (`activites/index.js:11-63`) et le **tri par `code`** segment par segment
  (`index.js:160-205`), avec un test (`socle.mjs:124`). L'accueil, le suivi, la conduite de séance en
  héritent tous. Le regroupement Simulog par entreprise d'après le premier nombre du code
  (`index.js:230-232`) est simple et juste.
- **Le circuit de la note** : `ctx.enregistrer` (`core/app.js:530-539`) garde `bareme`, rôle, groupe,
  ignore en `copie` ; `ecrireScore` ne réécrit que si la note change (`siChange`, test `socle.mjs:1915`) ;
  la copie rendue est figée côté règles (`firestore.rules:102-104`). Les notes par compétence
  (`core/competences.js`) suivent la fiche à la lettre : coefficients 1/1/1/3, double compte d'une séance à
  deux compétences, conversion des jalons sur 20, export en sept colonnes.
- **Le cloisonnement par séance** dans une base partagée : `db.transport[cle]`, `db.quais[id]`,
  `db.plannings[id]`, `db.entrepots[id]`, `db.fiches[id]`, `db.indicateurs[séance]`, `db.gestes[séance]`
  (`entreprise.js:2476-2639, 985, 1235`). Boost et Picard fixent bien leur identifiant.
- **Les tests qui figent une règle de fond** : hôtes externes et SDK local (`dependances.mjs`), blocs
  oubliés et groupes mal remplis (`test.mjs:37-77`), suppression qui nomme ce qui reste
  (`groupes.mjs:19-155`), rond qui tient dans la case (`boost.mjs:208-272`), jalons qui ne récompensent pas
  l'inaction (une quinzaine de cas, ex. `cdiscount.mjs:218`, `picard.mjs:293`, `smoby.mjs:138`), valeurs
  écrites à la main (`socle.mjs:326-363`), copie figée (`copie.mjs:251-303`), horloge simulée (`temps.mjs`).
- **La charte CSS « trois fois »** est respectée pour les vingt variables thématiques de `styles/base.css`
  et pour les feuilles de vue (`entrepot.css`, `planning.css`, `quai.css`, `animation.css`). Seules quatre
  variables `--gr-*` (`base.css:106-109`) ne sont déclarées qu'une fois, avec des valeurs fixes voulues.
- **Le tirage reproductible par élève** (`core/tirage.js`) et le principe « aucun jeu hors règle n'atteint
  un élève ».
- **La bascule sur prepalog.fr** : aucun domaine en dur dans le code, `CNAME` versionné, `authDomain` sur
  firebaseapp.com. Il ne restera que la ligne « Domaines autorisés » dans la console.
- **Le fonctionnement des gardes de l'autre session** : les sept fichiers modifiés passent `node --check`
  et la suite complète est verte avec eux.

---

## 2. Les chantiers, par priorité

Pour chacun : le problème en une phrase, ce que ça risque concrètement, la taille (petit = une
demi-journée, moyen = un à trois jours, gros = plus), le modèle, et s'il touche `core/`.

### Priorité 1 — sécurité des données et fiabilité devant les élèves

#### C1. Les règles Firestore laissent un élève choisir ses groupes et sa note — VÉRIFIÉ

- **Problème.** La règle de mise à jour d'un profil (`firestore.rules:67-70`) interdit à l'élève de
  changer son `role`, son `aisance` et son `tiersTemps`, **mais pas sa liste `groupes`**, ni son
  `matricule`, ni son `code`. Comme l'appartenance à un groupe est lue dans ce profil
  (`mesGroupes()`, `firestore.rules:29-31`), un élève qui s'ajoute un identifiant de groupe (le slug du
  nom, devinable) lit ce groupe (`:87`) et y écrit des travaux (`:102`). Par ailleurs, l'écriture d'un
  travail par l'élève (`:102-104`) n'a aucune validation de contenu : il peut créer d'emblée un document
  à 20/20, poser un drapeau `_debloque-*` (déblocage de parcours) ou supprimer un travail non rendu.
- **Risque.** Une note de bulletin truquée par un élève qui lit le code public ; un élève qui apparaît
  dans la classe d'un collègue. Faible probabilité au lycée, mais la note porte au bulletin.
- **Aussi (VÉRIFIÉ)** : tout enseignant peut lire tous les profils (noms, matricules, **codes en clair**),
  mettre à jour (`:70`) ou supprimer (`:73`) n'importe lequel, y compris celui d'un autre enseignant ;
  tout compte authentifié peut écrire `classements/{aid}/{son uid}` pour un `aid` quelconque et sans
  limite de champs (`database.rules.json:89-104`, contrairement au commentaire des lignes 34-36).
- **Taille** : moyen. **Modèle** : Sonnet. **`core/`** : non, mais `firestore.rules` et
  `database.rules.json`, donc **publication dans la console** à la fin, et cas à ajouter dans
  `outils/test-regles.mjs`.

#### C2. Le mode réel diffère du mode démonstration, et personne ne le teste — VÉRIFIÉ (écarts) / SUPPOSÉ (effets)

La suite tourne en démo par construction. Voici ce qu'elle ne voit pas :

- **Écoutes jamais fermées.** `ecouterJeu` et `ecouterMeta` passent à `off` la fonction de désabonnement
  renvoyée par `onValue`, pas le rappel d'origine (`core/backend-firebase.js:448, 502`) ; `off` compare
  les rappels, donc rien n'est retiré. Les écoutes s'accumulent et se rebranchent au prochain passage en
  ligne. (VÉRIFIÉ sur le code ; l'effet est SUPPOSÉ d'après le SDK.)
- **Sauvegardes qui échouent en silence.** `jeu.sauver()` et la vidange avalent toute erreur
  (`core/store.js:134, 178`) : hors-ligne, document de plus d'un Mio, refus de règle = travail perdu sans
  message. Les écoutes temps réel n'ont pas de rappel d'erreur (`backend-firebase.js:444, 501`) : un refus
  = écran vide.
- **Requête refusée puis contournée.** `suivi()` fait un `collectionGroup('activites')`
  (`backend-firebase.js:415`) que les règles ne couvrent pas (il faudrait un chemin `{path=**}`) ; le
  `catch` bascule sur une requête par élève. Le suivi marche, mais coûte N lectures de plus et le
  commentaire attribue le repli à l'index.
- **Geler / dégeler une base partagée** lit `jeu.meta.gele` juste après l'ouverture (`core/prof.js:1500-1503`).
  En démo le rappel est synchrone, en réel il est asynchrone : `gele` serait toujours posé à `true`.
  (SUPPOSÉ, à essayer en classe avec le magasin.)
- **La branche `superAdmins`** (`backend-firebase.js:99-107`) tente de créer un profil `role: 'prof'`
  que la règle `:59` refuse : elle est inopérante même remplie. Tant mieux pour la sécurité, mais le
  fichier d'exemple la propose.
- **`classements` écrit toujours le nom complet** (`_parNom`, `backend-firebase.js:470-478`) alors que
  `entrainement.js:288-290` et les règles promettent le contraire ; `basculerNom(false)` ne l'enlève pas.
- **Autres écarts** : `majTemps` prend le max en démo et écrase en réel ; `majLigne` lève « introuvable »
  en démo et crée la ligne en réel ; `supprimerEleve` démo n'efface que le profil ; `supprimerGroupe` démo
  efface aussi les bases d'un groupe dont l'identifiant commence pareil (`backend-demo.js:132-136`).
- **Taille** : moyen. **Modèle** : Sonnet. **`core/`** : oui (`backend-firebase.js`, `backend-demo.js`,
  `store.js`). Première étape sans risque : ajouter `outils/test-regles.mjs` au workflow GitHub.

#### C3. Un bug de contenu est noté « faux » pour l'élève — VÉRIFIÉ

- **Problème.** `noterBase` transforme tout plantage d'un jalon en `'ko'` sans journal
  (`core/types/entreprise.js:251`) ; même avalement aux lignes 345, 457, 585-586, 1245.
- **Risque.** Une coquille dans un contenu (clé renommée, donnée absente) se traduit par une note
  baissée, sans que ni l'élève ni toi ne voyiez qu'il s'agit d'un bug. C'est le pire des échecs : il est
  silencieux et il frappe la note.
- **Taille** : petit (un `console.error` et un marquage « indéterminé » distinct de « faux »).
  **Modèle** : Sonnet. **`core/`** : oui.

#### C4. Les suppressions laissent des données invisibles — VÉRIFIÉ

- Jamais effacés : `classements/{aid}/{uid}` (nom, groupe) ; les `travaux/{gid}/eleves/{uid}/…` d'un
  élève dont le profil ne porte plus ce groupe (sous-collections sans parent, qu'aucune interface ne
  montre) ; `demiDe[uid]` depuis l'onglet « sans groupe » ; les drapeaux `_reprise-*` (`app.js:428-429`
  n'efface que `_debloque-*`) ; les comptes Auth sans `code` enregistré ou dont la reconnexion échoue
  (`backend-firebase.js:324-337`, échec avalé).
- Toutes les suppressions et créations sont en plusieurs écritures non atomiques : `creerGroupe`
  (Firestore puis RTDB), `creerEleves` (Auth, Firestore par élève, RTDB à la fin), `supprimerEleve`
  (six étapes). Si `profsGlobaux` manque côté RTDB, le groupe Firestore est créé puis le miroir `acces`
  échoue : groupe orphelin, « nom déjà pris », aucune interface ne reconstruit le miroir.
- **Risque.** Un collègue qui s'amorce à moitié ; des données d'élèves qui survivent à leur suppression
  (RGPD) ; un suivi qui ne montre pas tout.
- **Taille** : moyen. **Modèle** : Sonnet. **`core/`** : oui. Règle à garder : supprimer l'élève avant le
  groupe, le miroir `acces` en dernier (ordre actuel VÉRIFIÉ, `backend-firebase.js:194-217`).

### Priorité 2 — ce qui coincera quand tu ajouteras

#### C5. `entreprise.js` grossit à chaque séance — VÉRIFIÉ

- **Problème.** 3 283 lignes ; `creerEntreprise` en fait 3 240, dont `rendre` ≈ 2 966 en une seule
  fermeture. Il lit plus de trente clés du contenu (`accueil`, `animation`, `copie`, `documents`,
  `entrepot`, `fiche(s)`, `finFige`, `inventaire`, `lexique`, `menu`, `plan`, `planning`, `quai`,
  `receptionLitige`, `seanceFinie`, `stockOuvert`, `tableur`, `tirage`, `tournee`, `transportSection`…).
  `activites/FICHE-SEANCE.md` est devenu le journal daté de ces ajouts (03/10, 04/10, 05/10, 07/10,
  08/10) : des paragraphes de 20 lignes, pas une liste d'options.
- **Couplages cachés** : `correction: true` ne doit pas être activé sur une séance qui juge en continu
  (Spartoo, Boost), c'est écrit dans la fiche (`:295`) mais rien ne l'empêche dans le code ; les `id` de
  quai, planning, entrepôt et fiche viennent du contenu sans contrôle d'unicité (seul `MQ.id === meta.id`
  est vérifié, `entreprise.js:326`) ; le moteur **importe un fichier de contenus**
  (`contenus/entreprise-commun.js`, `entreprise.js:15`) pour `COLORS`, `SHIP`, `pad`, reliquat Spartoo, et
  suppose des commandes avec variantes modèle-couleur-taille.
- **Risque.** France Boissons arrive avec dix séances et un chiffrage de 15 à 20 jours de moteur
  (brief de refonte). Chaque option nouvelle est un chemin de plus dans la même fonction que jouent déjà
  24 séances. La régression sur une séance jouée viendra de là.
- **Ce qu'il faut faire** : pas une réécriture. Trois gestes : (a) continuer à sortir des écrans en
  modules comme `fiche.js` et `documents.js` l'ont été (console, messagerie, écrans de données) ;
  (b) **figer la liste des options** de `creerEntreprise` dans une table unique avec un contrôle au
  chargement (clé inconnue = refus, comme pour `menu`) ; (c) sortir `COLORS`/`SHIP` de `core/`.
- **Taille** : gros. **Modèle** : Opus pour le découpage, Sonnet pour chaque module. **`core/`** : oui,
  **un seul chantier à la fois**, et jamais pendant qu'une séance s'écrit dessus.

#### C6. Vingt-quatre fichiers de séance recopiés à 70-80 % — VÉRIFIÉ

- **Problème.** Pour chaque entreprise, 23 à 32 lignes sont identiques d'un fichier à l'autre
  (`menu`, `ENTREPRISE`, `VOCAB`, `SUPPLIERS`, `CUSTOMERS`, `THEME`, `accueil`, `volet`, `bareme`,
  `tables`, `rubrique`, `rendre`). Les chemins de `trame` et de `corrige` sont reconstruits à la main.
  `metier` dans `ENTREPRISES` est recopié du `sousTitre` des contenus (`index.js:117`). Le logo Smoby est
  écrit à trois endroits.
- **Risque.** À quinze entreprises par niveau, un changement d'option commun = 24, puis 150 fichiers à
  reprendre ; une coquille dans un chemin ne se voit qu'à l'écran.
- **Ce qu'il faut faire** : une fabrique `seanceEntreprise(univers, SEANCE, meta)` qui dérive `trame`,
  `corrige`, `bareme` de l'`id` et du `code`. Les fichiers existants restent valides pendant la
  migration.
- **Taille** : moyen. **Modèle** : Sonnet. **`core/`** : une petite fonction, oui.

#### C7. Plusieurs enseignants : le code suppose un seul prof — VÉRIFIÉ

- `profs: [profUid]` à la création et aucun code pour ajouter un co-prof (`backend-firebase.js:154`) ;
  l'identifiant de groupe est le slug du nom, espace global (deux enseignants avec « 1L1 » = refus de
  permission brut, pas « nom déjà pris », SUPPOSÉ) ; `elevesSansGroupe()` renvoie les orphelins de
  **tous** les enseignants, et l'onglet permet de les rattacher ou de les supprimer (`prof.js:685-701`) ;
  matricule global (`config.js:90`) ; un élève de plusieurs groupes prend `groupes[0]` sans sélecteur
  (`app.js:192`) ; amorçage à la main dans deux consoles.
- **Risque.** Le premier collègue qui arrive supprime par erreur un élève de ta classe depuis « sans
  groupe » ; un nom de groupe pris chez lui le bloque chez toi.
- **Taille** : moyen à gros. **Modèle** : Opus pour décider (préfixe de l'enseignant dans le gid ? filtre
  `creePar` ?), Sonnet pour écrire. **`core/`** : oui + règles (publication).

#### C8. CAP OL et les niveaux : prêts dans `niveaux.js`, pas ailleurs — VÉRIFIÉ

- `cap` et `tle` existent (`core/niveaux.js:8-13`) et aucune séance ne les déclare (quatre en `1re`, huit
  en `2de`). Mais : aucun référentiel CAP dans `core/competences.js:247-294` (un code CAP aurait un
  libellé vide, `:367`) ; `'1re'` par défaut d'un groupe (`prof.js:277`) ; moyennes par spécialité
  réservées à `'2de'` (`prof.js:1199`) ; `TAB-4` « réservé au CAP OL » dans `CLAUDE.md` est en fait sans
  `niveaux`, donc ouvert à tous (`activites/journee-entrepot.js:42`).
- La finalité (décision 3) exige pour OTM/AGOrA « un temps **et** l'évaluation dans l'année de 2de » :
  les huit séances Smoby sont toutes en `guidage`, aucune évaluation 2de n'existe. Rien dans le code ne
  signale un référentiel sans évaluation.
- **Taille** : moyen. **Modèle** : Sonnet (relevé du référentiel CAP par Cowork d'abord). **`core/`** :
  `competences.js`, `prof.js`.

#### C9. Quota Spark : une classe par jour, pas deux — SUPPOSÉ (estimation d'après le code)

- Par élève et par heure : sauvegarde du blob entier à chaque rafale d'actions (antirebond 500 ms,
  `store.js:41-44`) ; une écriture à chaque vidange même sans changement (`store.js:86-87`,
  `app.js:631-634`) ; sauvegarde + temps toutes les 120 s (`entreprise.js:924-939`) ; note si changée.
  Ordre de grandeur **100 à 400 écritures par élève et par heure**, soit 3 000 à 12 000 par classe de
  30 sur les 20 000 quotidiennes du plan gratuit. Côté lectures : l'espace enseignant charge tous les
  élèves du projet à chaque ouverture (`prof.js:76-82`) et le suivi fait N requêtes de repli (C2).
- **Risque.** Deux classes le même jour, ou une séance de deux heures, et les sauvegardes commencent à
  échouer **en silence** (C2).
- **Taille** : moyen. **Modèle** : Sonnet. **`core/`** : oui. Mesurer d'abord dans la console Firebase
  après une séance réelle avant d'optimiser.

#### C10. Les tests : solides sur le fond, fragiles sur la forme — VÉRIFIÉ

- **Fragiles** : 260 `waitForTimeout` (~63 s d'attentes fixes, boost 67, cdiscount 38, transport 29,
  spartoo 27, socle 25) ; des compteurs en dur qui tombent à chaque séance ajoutée (liste des 24 codes
  Simulog `socle.mjs:187`, « cinq logos » `'1,2,3,4,5'` `socle.mjs:1553-1581`) ; réécriture de la source
  servie par regex (`visibilite.mjs:30-44`, `socle.mjs:1503-1509, 1684-1692`) ; état partagé entre blocs
  (spartoo, groupes, smoby, questions dépendent du socle ; quiz dépend du bloc précédent, `quiz.mjs:78`).
- **Ne protègent rien** : « corrigé non lisible en clair » (`socle.mjs:223-232`) a une assertion vide, le
  module n'exporte pas les questions, et le fichier source contient les réponses (`quiz-flux.js:28`) ;
  cinq cas « meilleur » (`smoby.mjs:1406, 2224, 2762, 2975, 3336`) appellent le backend démo avec un id en
  dur et ne lisent pas la séance ; ~17 cas « déclaration (meta) » recopient la config et ne testent pas un
  comportement ; `dependances.mjs:283-318` ne vérifie que 28 noms de méthodes.
- **Angles morts** : la détection d'hôtes externes n'écoute que la page partagée, et en `--groupe 3`
  sur GitHub elle n'a vu qu'une page d'accueil ; `test-regles.mjs` (86 cas) n'est pas dans le workflow ;
  les 18 séances ENT-2.x, 4.x, 5.x ne sont pas dans la table `ATTENDU` des compétences
  (`socle.mjs:366-374`) ; rien ne teste que les trois blocs de variables CSS restent identiques ; aucun
  test de l'espace enseignant pour « Télécharger les identifiants », la suppression par l'écran, geler/
  dégeler, le ramassage par l'interface ; pas de test de taille mobile ni de contraste du site.
- **Port pris** : `srv.listen` sans écouteur d'erreur (`commun.mjs:50`) donne une pile Node brute. Avec
  deux sessions, c'est arrivé pendant cet audit.
- **La CI ne bloque pas** : le workflow signale après le push, le site est déjà en ligne. C'est
  documenté et c'est un choix ; il faut le savoir.
- **Taille** : moyen (par lots : d'abord `hotesExternes` sur tous les contextes et `test-regles` en CI,
  puis les compteurs en dur). **Modèle** : Sonnet. **Touche `outils/test.mjs` et `commun.mjs`** : à te
  dire explicitement avant.

### Priorité 3 — hygiène, empilements, documentation

#### C11. Les vues se recopient — VÉRIFIÉ

- `ech` (échappement HTML) copiée six fois (`quai.js:122`, `entrepot.js:87`, `entrepot-visite.js:74`,
  `planning.js:55`, `inventaire.js:40`, `export-tableur.js:76` ↔ `ui.js:8`) ; `pad2` quatre fois ; la
  conversion « jalons → étapes » cinq fois (`etapesPlanning`, `etapesEntrepot`, `etapesQuai`,
  `etapesAnimation`, `etapesQuestions`) ; la note « ok/total×sur » deux fois ; la palette de cartons
  dessinée trois fois (quai, entrepôt, `iso.js`) avec ses marrons en dur ; la confirmation en deux clics
  écrite de cinq façons ; le mélange aléatoire de quatre façons dont trois biaisées
  (`sort(() => Math.random() - 0.5)`, `qcm.js:33`, `assoc.js:19`, `numerique.js:20`) ; la conservation du
  focus après redessin de cinq façons, et absente d'`inventaire.js` et du redessin complet d'`entreprise.js`
  (`:1343`).
- Vues utilisées par un seul contenu : `grille`, `entrepot-visite`, `animation` (aucune séance, seulement
  l'essai), `questions` (idem), `qcm`, `ordre`, `assoc`, `numerique`, `tableau`.
- **Taille** : moyen, par petits lots. **Modèle** : Sonnet. **`core/`** : oui.

#### C12. Couleurs en dur dans le JavaScript — VÉRIFIÉ

- `iso.js` 190 occurrences, `quai.js` 154, `entrepot.js` 55, `entreprise.js` 41 (dont la copie de 43
  valeurs du thème papier, `:849-861`), `carte.js:564-566, 630-632` avec **les couleurs Boost écrites dans
  une vue générique** ; blanc pur `#fff` dans `base.css:206, 643` et dans plusieurs vues. `base.css`
  (1 734 lignes) porte aussi le CSS du quiz, de la carte, du plan, de la grille, de l'inventaire : la
  charte et les vues sont mélangées. Sept feuilles chargées pour tout le monde (`index.html:19-25`).
- **Risque.** Une entreprise à charte sombre ou à accent proche du vert ; le thème sombre non vérifié sur
  plan et visite (dette avouée dans `decisions.md`).
- **Taille** : petit à moyen. **Modèle** : Sonnet. **`styles/` et `core/types/`** : oui.

#### C13. Frontière Prepalog / Simulog : trois critères pour une seule idée — VÉRIFIÉ

- Les 24 séances Simulog ont toutes `rubrique: 'simulog'`, un code `ENT-` et `immersif: true`, mais
  **rien ne l'impose** : le Suivi filtre sur `/^ENT-/` (`prof.js:718`), le repérage et la remise à zéro sur
  `immersif` (`prof.js:732, 843`), l'accueil sur la rubrique (`index.js:108`). `app.js` porte la logique
  d'environnement (version de base, reprise, parcours, `:416-459`). `parcours.js`, `copie.js`,
  `tirage.js`, `lexique.js`, `phrases.js`, `declencheurs.js`, `iso.js` sont propres à Simulog mais rangés
  à plat dans `core/`. « Scénario » a deux sens (rubrique SCE et séances Simulog). `core/questions.js`
  (fabrique de quiz) et `core/types/questions.js` (questions au fil) portent le même nom.
- **Ce qu'il faut faire** : un seul drapeau dérivé (`estSimulog(meta)`) utilisé partout, et des
  sous-dossiers `core/simulog/` seulement si le drapeau est en place. Pas de grand déménagement.
- **Taille** : petit. **Modèle** : Sonnet. **`core/`** : oui.

#### C14. Champs, portées et options morts — VÉRIFIÉ

- `meta.domaines` (8 séances) et `meta.coeur` (8) ne sont lus nulle part dans `core/` ; `meta.volume`
  (4) n'est lu que par un test. La fiche le dit (`FICHE-SEANCE.md:242-243, 299`), donc c'est assumé, mais
  la décision 14 de la finalité (cœur / complément) attend toujours son écran.
- Portées `equipe` et `commun` : aucun consommateur, aucune séance ; les règles `communs/*` et
  `acces/*/.read` ne servent à rien ; `meta/ouvert/{table} = 'tous'` n'est écrit nulle part alors que
  `ecriture: 'tous'` de `magasin.js:42` l'attendrait (écart démo/réel : en réel, les lignes semées par
  l'enseignant ne sont pas modifiables par les élèves ; en démo, si).
- `purger: false` « ne sert qu'aux tests » et aucun test ne l'utilise (`backend-firebase.js:192`) ;
  `brancherDeconnexion` « ancien nom conservé » sans consommateur (`ui.js:90-91`).
- **Taille** : petit. **Modèle** : Sonnet.

#### C15. Reliquats SCE et Spartoo — VÉRIFIÉ

- SCE : cinq liens Padlet via `core/types/lien.js`, `FAMILLES.SCE` (`prof.js:17`) et la colonne de saisie
  manuelle (`notation: 'prof'`, `prof.js:727`, seul usage). Peu gênant ; à reprendre tel que la finalité
  le prévoit (compétences et temps repris dans la séance Simulog qui remplace).
- Spartoo : aucune branche propre dans `core/` (les mentions sont des commentaires), mais **le moteur
  dépend de son modèle de données** : `COLORS` et `SHIP` importés de `contenus/entreprise-commun.js`
  (`entreprise.js:15, 220-221, 1256, 1305, 2730, 3077`), commandes à variantes couleur/taille. C'est le vrai
  reliquat, et il est dans C5.
- `CLAUDE.md` dit « Spartoo reste tel quel » alors qu'ENT-1.1 a été refondue le 06/10 (versionBase,
  parcours) : la règle n'est plus vraie, à acter ou à annuler.

#### C16. Contenus orphelins et oublis — VÉRIFIÉ

- Corrigés `ENT-5.3-trame.js` à `ENT-5.8-trame.js` et trames `ENT-5.3` à `5.8` (docx, pdf) présents mais
  non déclarés : six séances Smoby disent « Pas encore de trame élève ». `contenus/intentions/
  smoby-intention-pedagogique.*` existe sans ligne `intention` dans `ENTREPRISES` (conforme à « déclarer =
  valider », mais à ne pas oublier). Logos `picard.png`, `simulog.png`, `smoby.png` sans référence.
- Pas de générateur pour `tab2-stocks.js` (« Généré depuis la Suite Logistique », SUPPOSÉ : valeurs
  reprises de l'origine, à vérifier au regard de la règle « recalculées, pas recopiées »).
- `picard-ent43.js:172-178` : des quantités attendues en clair dans les textes (« 37 au lieu de 40 ») à
  côté d'un `ok` calculé.
- `index.js:45` « ENT-3.4 reste à écrire » (vrai) ; `index.js:148` parle encore de TechPro.
- Règle « ne jamais faire supprimer » : renommer `A-SUPPRIMER-…`, pas effacer.
- **Taille** : petit. **Modèle** : Sonnet.

#### C17. Travailler à deux sessions — VÉRIFIÉ (vécu pendant l'audit)

- Le port de test 8099 est partagé ; `EN-COURS.md` est tenu à la main et il citait `core/types/questions.js`
  qui n'était pas modifié ; `.claude/worktrees/` contient deux copies du dépôt qui faussent tout
  `grep -r` non limité à `git grep`.
- **Taille** : petit (port par défaut tiré au hasard ou message clair ; `git grep` dans les consignes).
  **Modèle** : Sonnet. **Touche `commun.mjs`** : à dire.

#### C18. Les fiches et `CLAUDE.md` ont pris du retard — VÉRIFIÉ

Écarts relevés fiche ↔ code (détail en annexe) : nomenclature (numéros Cdiscount décalés, douze séances
avec `niveaux`, Picard et Smoby absents, ENT-2.1/2.3 en `'prof'`) ; notes-compétences (36 séances dans
le tableau, pas 16 ; arrondi au demi-point non documenté ; moyenne par spécialité non documentée) ;
inventaire (déclaré par ENT-2.3 et 2.5, pas 2.2 et 2.4 ; `perimetre` non documenté) ; vues-transport
(une quinzaine d'options non documentées ; `grille.js` absent ; rayon 11 dans `carte.js`, 12 dans
`plan.js` ; **l'alerte 15 « liste de points fautifs figée dans un test » est introuvable**) ;
progression (huit séances en `avancement` là où la fiche l'interdit) ; entreprises-réelles (mention en
pied absente de Cdiscount, Spartoo, Boost, Picard ; description du logo Cdiscount ne correspondant pas
au fichier). `FICHE-SEANCE.md` se dit « relevé au 02/10 » et se contredit sur la note de `correction`
(`:295` vs `:276`, le code suit `:276`). `CLAUDE.md` : « ~545 cas, ~5 min » (862, ~13 min) ; structure de
`styles/` incomplète ; alertes 23, 26, 28 citées dans les briefs et inconnues de sa liste 1-15.

- **Taille** : petit (Cowork pour les fiches, Claude Code pour `CLAUDE.md` et `FICHE-SEANCE.md`).
  **Modèle** : Sonnet.

#### C19. Stratelog — SUPPOSÉ

Aucune trace dans le dépôt. Ce qui le décidera : si c'est un troisième « côté » (ni Prepalog ni Simulog),
il faut d'abord C13 (un drapeau par famille), sinon il s'empilera sur les mêmes trois critères implicites.
Si c'est une entreprise Simulog de plus, C5 et C6 suffisent.

---

## 3. Réponses aux huit questions

1. **Solide** : section 1.
2. **Fragile** : C1 à C4 (données), C5 (régression sur séance jouée), C3 (bug noté faux), le redessin
   complet d'`entreprise.js` sans focus, la CI qui ne bloque pas.
3. **Répété / empilé** : C5, C6, C11, C12, C14, C15, et la fiche séance devenue journal.
4. **Ce qui coincera** : entreprises (C5, C6, compteurs en dur des tests C10) ; collègues (C7, C1, C4) ;
   CAP OL et niveaux (C8) ; prepalog.fr (prêt, une ligne de console) ; Stratelog (C19, après C13).
5. **Frontière Prepalog / Simulog** : visible à l'accueil, mélangée dans `core/` et dans les filtres de
   l'espace enseignant (C13).
6. **Firebase** : C1, C2, C4, C9.
7. **Tests** : C10 et section 1.
8. **Écarts fiches / code** : C18 et annexe.

---

## 4. Ce qu'il ne faut pas faire

- **Passer à un framework ou à un build** (React, Vue, bundler). Le site statique sans dépendance est ce
  qui passe le filtrage académique et ce qui permet à Tristan de juger à l'écran et de livrer en un push.
  Un build ajoute une étape qui casse en silence et une couche que personne ici ne débogue.
- **Réécrire `entreprise.js`** d'un bloc. Vingt-quatre séances jouées et 862 tests reposent dessus. Le
  bon geste est l'extraction progressive déjà commencée (`fiche.js`, `documents.js`), un module à la fois,
  la suite verte entre chaque.
- **Déménager `core/` en sous-dossiers** avant d'avoir le drapeau `estSimulog` : ce serait changer tous
  les chemins d'import pour un gain nul tant que la frontière reste dans trois filtres.
- **Renuméroter les `code`** pour « ranger » (ENT-2 libre, ENT-3.4 absent) : un changement de `code`
  déplace les étiquettes partout, et la règle est écrite.
- **Convertir Spartoo** ou supprimer SCE maintenant : la finalité les gèle, et aucun des chantiers
  ci-dessus n'en dépend. Le seul reliquat qui gêne (C15) est dans le moteur, pas dans ces séances.
- **Ajouter des Cloud Functions** pour sécuriser la note : plan Spark, et la conséquence A de la finalité
  l'a déjà tranché (évaluation en classe, sous surveillance, jeu neuf). C1 suffit côté règles.
- **Remplacer l'antirebond de sauvegarde par une écriture à chaque clic** « pour ne rien perdre » : c'est
  l'inverse qui protège le quota (C9) ; ce qu'il faut, c'est faire remonter les échecs (C2).
- **Effacer les orphelins** (contenus, documents Firestore) sans les nommer d'abord : renommer
  `A-SUPPRIMER-…` pour les fichiers ; pour Firestore, lister avant d'effacer, et jamais contre le vrai
  projet sans export.
- **Attendre une « grande version 2 »**. Chaque chantier ci-dessus est livrable seul, suite verte, en un
  commit.

---

## Annexe — écarts fiche ↔ code (relevés par balayage, VÉRIFIÉ sur les lignes citées)

### `prepalog-nomenclature.md`
- :138, :209 « aucune activité ne déclare `niveaux` » ↔ 12 séances le font (Picard `['1re']`, Smoby `['2de']`).
- :235-236 numéros Cdiscount : fiche 2.2 = inventaire, 2.3 = régularise ↔ code 2.2 chiffres, 2.3 inventaire,
  2.4 régularise, 2.5 compte-à-rebours, 2.6 priorités.
- :234-238 `pret` : ENT-2.1, 2.3 sont `pret: true, ouverture: 'prof'` ; boost-ent32 `pret: true`.
- :238 « 8 jalons » ENT-3.2 ↔ `bareme: 11`.
- :244-245 « prévus, pas écrits » : ENT-2.4 et 3.3 existent ; seul ENT-3.4 manque.
- Absents du tableau : ENT-2.2, 2.5, 2.6, 3.3, 4.1-4.4, 5.1-5.8 ; Picard et Smoby absents d'`ENTREPRISES` côté fiche.
- :28-37 codes cités sans activité : ACT-2 à 5, QUI-1 à 4, REF-1 à 3, MES-1.
- :150-154 visibilité : `ouverture: 'prof'` et demi-groupes (`niveaux.js:54-101`) absents.

### `prepalog-notes-competences.md`
- :15 « 16 séances déclarent » ↔ 36 entrent dans le tableau (`competences.js:128`).
- :95-97 `ATTENDU` ↔ `socle.mjs:366-374` : 18 entrées, aucune ENT-2.x, 4.x, 5.x.
- Non documentés : arrondi au demi-point avant moyenne (`notes.js:41`) ; moyenne par spécialité 2de
  (`competences.js:171`, `prof.js:1197`) ; suffixe demi-groupe dans le CSV (`prof.js:1336`) ; BOM + `;` +
  CRLF (`store.js:152`) ; `bareme` requis pour entrer dans le tableau (`competences.js:129`).

### `prepalog-inventaire-format.md`
- :13 « ENT-2.2 et 2.4 » ↔ ENT-2.3 et 2.5 ; :9 « 33 cas » ↔ 38.
- :54 menu « section Articles » ↔ groupe « Mon poste » (`entreprise.js:1389-1395`).
- Non documentés : `perimetre`, `attentePerimetre` (`inventaire.js:68-80`), inventaire fonction de la
  graine (`entreprise.js:119-125`), `ajustements: []`, champs supplémentaires de `bilanInventaire`.
- :90 « `compte` obligatoire en mode relevé » : aucune vérification au chargement.

### `prepalog-vues-transport.md`
- :208 ordre du bandeau : « Fiche d'intention » et « Rappel tableur » intercalés ; « Réinitialiser »
  dépend de `meta.reinitialisable`.
- :236 `bilan` : onze champs de plus (`tournee.js:464-480`).
- :260-262 `exigeConforme` refuse aussi créneau raté et départ/arrivée non placés (`tournee.js:1219-1226`) ;
  message « de combien » sauf mode muet (`:1205-1215`) ; sans effet en copie (`:293`).
- Options non documentées : `etatInitial, sansVerdict, pastilles, rappel, phases, fige, recapitulatif,
  etiquettes, termine, onglets, creneau, carteCliquable, jaugesRepere, extremitesACliquer,
  contraintesDansGrille, grille, horaire.service` ; `reperage.quartiers` ; `grille.js` jamais cité.
- :299-309 « tout en variables CSS » ↔ `.ct-mk` de `carte.js` en hexadécimal fixe.
- Rayon 11 dans `carte.js:561, 651`, 12 dans `plan.js:244-246`. Alerte 15 (« liste figée ») introuvable.

### `prepalog-progression-pedagogique.md`, `prepalog-entreprises-reelles.md`
- progression :50-51 ↔ 5 guidages en `avancement` (Spartoo ×3, ENT-2.1, 2.2) et 3 entraînements
  (ENT-2.3, 2.4, 2.6).
- entreprises :103 « La Caisse à Outils, Transports Cévennes » : 0 occurrence dans le code.
- entreprises :24-25 Sagenta / C2.6 : aucune trace ; C2.6 jamais déclarée.
- entreprises :45-46 mention en pied : présente seulement dans `quai.js`, `fiche.js`, Smoby.
- `cdiscount.js:46-48` décrit un SVG de 3 789 octets ↔ le dépôt a `cdiscount.png`, 22 656 octets.

### Référentiels OTM / AGOrA
- Codes présents dans `competences.js:64-86`. Jamais utilisés : AGO-1.1 à 2.3, AGO-3.3 ; OTM-C1.1 à 1.4,
  C3.1, C3.3, C3.4. Sous-code « C1.4.2 » (otm :132) absent.
- Aucune évaluation 2de, contrairement à la finalité (décision 3).

### `activites/FICHE-SEANCE.md`
- :3-4 « relevé au 02/10 » ↔ contenu daté jusqu'au 08/10.
- :65 « les 20 séances d'entreprise » ↔ 24.
- :207 « il restera à faire accepter une fonction de la graine à l'inventaire » ↔ fait (`entreprise.js:119-125`).
- :295 note de `correction` = (bilan1 + actuel)/2 ↔ code lit `bilan2` (`entreprise.js:1193`), comme :276.
- :241 « un code absent fait tomber la suite » ↔ à l'exécution, libellé vide (`competences.js:160`) ; seul
  le test tombe.
- Lus par `creerEntreprise` et absents : `exercice`, `reponsesFournisseur`, `sansTrame`, `trame`, `THEME`,
  `transportId`. `ctx` : `intention`, `suivante`, `enregistrer(res, { siChange, cle })` absents.

### `CLAUDE.md`
- « ~545 cas, ~5 min » ↔ 862 cas, ~13 min.
- « ENT-2.1, 2.3, 3.2 ne sont pas converties » ↔ 2.1 et 2.3 sont en `'prof'`, 3.2 non.
- « TAB-4 réservé au CAP OL » ↔ sans `niveaux`.
- « Spartoo reste tel quel » ↔ refonte d'ENT-1.1 le 06/10.
- Structure de `styles/` : manque `animation.css`, `entrepot.css`, `planning.css`, `quai.css`, `questions.css`.
- Alertes 23, 26, 28 citées ailleurs, inconnues de la liste 1-15.
- `activites/` : 42 fichiers de séance, pas 44 (les deux autres sont `index.js` et la fiche).
