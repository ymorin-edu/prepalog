# Prepalog — consignes pour Claude Code

Lis ce fichier en entier au début de chaque session. Il résume ce qui, jusqu'ici, vivait dans
les fiches du projet Claude « PREPALOG » (que Claude Code ne voit pas). En cas de doute sur une
décision de fond, la **finalité** ci-dessous passe avant tout.

## Qui est Tristan, comment travailler avec lui

- Enseignant en Bac Pro Logistique (lycée). Il **n'est pas développeur** : un peu de web (6 mois
  de formation), mais il ne débogue pas du code. Il juge **à l'écran**, pas dans le code.
- **Tout se dit en français courant, sans jargon.** Quand une action de sa part devient
  nécessaire, le dire tout de suite, en haut du message, avec le *pourquoi*.
- **Annoncer la durée avant de commencer** dès qu'une tâche dépasse ~20 minutes, dire ce qui la
  prend (presque jamais l'écriture : la suite de tests, les essais, les fiches), et proposer une
  version courte quand elle existe. Livrer dès que c'est vert plutôt qu'attendre la fin.
- **Quand il y a un choix, lui écrire les options avant de coder.** Il tranche vite. Pour un
  changement d'interaction, une capture ne suffit pas : fabriquer une page d'essai où il peut
  cliquer.
- Dire franchement ce qui est **vérifié** et ce qui est **construit/supposé**. Dire aussi
  quels tests valent leur prix et lesquels non.
- Avant une séance en classe : si quelque chose a été modifié **le jour même**, le dire. Un
  échec devant les élèves n'est pas rattrapable.
- **Règle « changer de conversation ».** Une conversation longue coûte de plus en plus cher : tout
  ce qui a été lu y reste. Dire à Tristan **quand c'est le bon moment de repartir de zéro**, en une
  ligne, et jamais en plein échec de test ni entre un changement et son commit. Les bons moments :
  un chantier vient d'être commité et poussé (séance, correctif moteur, fiche) ; la conversation a
  lu beaucoup de gros fichiers ou lancé plusieurs fois la suite ; on passe à un sujet sans lien.
  Avant de proposer, tout ce qu'il faut pour reprendre est **dans le dépôt** (compte rendu du
  brief, `docs/decisions.md`, commits) : sinon l'écrire d'abord, puis proposer.
- **Règle « modèle adapté ».** Au début d'une tâche, dire en une ligne quel modèle convient.
  **Sonnet par défaut** : documentation, correctifs, contenus, tests, commits, vérifications.
  **Opus se justifie dans deux cas seulement** : une **vue nouvelle du moteur** (`core/types/`,
  `core/app.js`) et une **séance nouvelle** à construire de bout en bout (cadrage, pièges,
  jalons). Si la tâche est d'un autre type que le modèle courant, le dire avant de commencer.

## Finalité du projet

Prepalog fait travailler aux élèves de **Bac Pro Logistique (2de, 1re, Tle) et de CAP OL** la
totalité des compétences du référentiel **qui ne demandent pas de manipulation physique**, dans
des environnements numériques d'**entreprises réelles** (Simulog), avec suivi de classe et notes
par compétence. Public : Tristan et son équipe (diffusion plus large possible un jour, ne rien
fermer qui l'empêche, mais ne pas concevoir pour elle).

Décisions pédagogiques arrêtées :

1. **Trois temps obligatoires, dans des séances distinctes** : guidage → entraînement (± erreur
   induite) → évaluation. Une compétence = 3 ou 4 séances. Guidage/entraînement = formatif,
   coefficient 1 ; évaluation = sommatif, coefficient 3 (modifiable par l'enseignant dans le site).
   **Exception 2de GATL** (05/10/2026) : pas d'évaluation sans au moins un temps de travail avant ;
   logistique à un seul temps = découverte, reprise en 1re/Tle ; OTM et AGOrA = un temps + l'évaluation
   dans l'année de 2de (détail dans `docs/fiches/prepalog-finalite.md`, décision 3).
2. **La note porte sur une compétence.** Export élève × compétence (scénarios associés + notes).
3. **On part du métier réel de l'entreprise** et on y travaille les compétences qui s'y
   prêtent, jamais l'inverse. Limiter le fictif : le réel porte métier, lieux, produits,
   contraintes ; le fictif se limite aux chiffres internes qu'on ne peut pas connaître.
   **Vérifier par recherche web ce que fait l'entreprise avant d'écrire**, et dire dans le
   livrable ce qui est vérifié et ce qui est construit. Ne pas inventer d'entreprise : Tristan
   les donne. Pas de visages de salariés, pas de paroles prêtées à un salarié réel identifié.
   Pas de faux document conçu pour passer pour authentique (mention en pied sur un document
   reconstitué). TechPro Distribution (fictive) est **abandonnée**.
4. **Prepalog ≠ Simulog.** Prepalog = plateforme d'entrée (entraînements sans scénario : tableur,
   quiz ; magasin ; groupes, suivi, compétences, conduite de séance). Simulog = simulation de
   scénarios d'entreprise, toujours en logique de scénario. Avant d'ajouter quelque chose, se
   demander de quel côté il va. Pas d'usine à gaz.
5. Le module **SCE (SCE-1 à SCE-5) est ancien** et sera absorbé par Simulog : ne pas l'enrichir.
   **Spartoo (ENT-1.x) ne se prend pas pour modèle** (point de comparaison). ENT-1.1 a été refondue le
   06/10/2026 (parcours, `versionBase`) ; ENT-1.2 et ENT-1.3 seront refondues comme elle (deux briefs
   Cowork à venir) et sont **gelées d'ici là : bugs seulement**, aucune règle commune (tutoiement,
   correction après bilan, confirmation…) ne s'y applique avant leur refonte (décision du 09/10/2026).
   **Le modèle, c'est Boost** (ENT-3.x).
6. Une séance nouvelle se fabrique **d'abord avec les vues existantes**, en déclarant du contenu.
   Mais si une compétence peut être abordée sous un **angle nouveau, ludique ou innovant** grâce à
   une vue nouvelle, **on prend le temps de l'insérer dans le moteur** (décision 13 du 03/10/2026).
   Garde-fous : durée annoncée, un seul chantier moteur à la fois, vue pensée pour servir à
   plusieurs séances.

## L'application

Site statique, **modules ES natifs, sans build, sans framework**. Ce qui est dans le dépôt est
ce qui est servi. Publié sur GitHub Pages (branche `main`, racine) : **chaque push sur `main`
est immédiatement visible des élèves.** Backend Firebase (projet Spark, europe-west1) en mode
réel ; sans `prepalog-config.json` valide, le site tourne en **mode démonstration**
(localStorage, aucun réseau) — c'est le mode de tous les tests.

```
index.html  lancer.bat  README.md  firebase.json  firestore.rules  database.rules.json
core/        app.js backend*.js store.js niveaux.js notes.js competences.js copie.js prof.js ui.js
             theme.js formules.js calculette.js parcours.js quiz.js config.js
             declencheurs.js tirage.js lexique.js phrases.js iso.js amenagements.js
core/types/  qcm ordre assoc numerique tableur tableau lien entreprise inventaire tournee grille …
activites/   index.js (registre + rubriques + icônes) et un fichier par activité
contenus/    données des activités, trames Word/PDF, corrigés, logos
styles/      base.css polices.css polices/ logo*.png + une feuille par vue (quai, planning, entrepot,
             animation, questions, quiz, carte, plan, grille, inventaire), toutes chargées par index.html
vendor/      xlsx + SDK Firebase servis par le dépôt (avec leurs licences, voir LISEZMOI.md)
outils/      test.mjs (lanceur) test/<bloc>.mjs, générateurs de trames (Python), pages d'essai
```

Lancer en local : `lancer.bat` (serveur sur le port 8000) ou `python -m http.server 8000`.
Ouvrir `index.html` en double-clic ne marche pas (modules ES). Après une modif, **Ctrl+Maj+R**
(le serveur local laisse Chrome garder les anciens fichiers).

### Règles techniques non négociables

- **Aucune requête hors du domaine du site** (en mode démonstration) : ni CDN, ni Google Fonts,
  ni image d'un autre domaine, ni `iframe`/`embed`/`object`. Raisons : filtrage académique qui
  casse la séance, et RGPD (IP des élèves). Une bibliothèque va dans `vendor/` avec sa licence
  et une ligne dans `vendor/LISEZMOI.md` ; un fichier d'habillage dans `styles/`. Une capture
  locale de carte OpenStreetMap est permise avec la mention « © contributeurs OpenStreetMap ».
  Un test relit tout le dépôt et fait échouer la suite si une adresse d'hébergeur apparaît.
- **LF partout** (`.gitattributes` en place). Seul `lancer.bat` est en CRLF.
- Les **corrigés sont lisibles dans le navigateur** : l'outil est **formatif**. Une évaluation
  notée se passe en classe, sous surveillance, sur un jeu de données neuf.
- **Contenu repris de la Suite Logistique** (`suite-logistique-darboux`) : vérifier qu'il ne
  transporte pas son corrigé. Les calculs/valeurs attendues sont recalculés par le générateur,
  pas recopiés ; dans un test, c'est l'inverse : valeurs écrites à la main.

## Conventions du code

### Activités (`activites/<id>.js`)

```js
export const meta = {
  id: 'quiz-flux',          // clé technique, JAMAIS modifiée (écrite dans les chemins Firebase)
  code: 'QUI-5',            // ce que lit l'élève ET ce qui décide du rang d'affichage
  titre, desc, rubrique,    // rubrique = pastille d'accueil, doit exister dans activites/index.js
  niveaux: ['2de','1re'],   // absent = tous niveaux
  competences: [], temps,   // pour les notes par compétence (séance Simulog : toujours déclarés)
  bareme: 6,                // présence = apparaît dans le suivi de classe
  notation: 'prof' | 'avancement',  // absent = score auto ramené sur 20 ; séance ENT-x.y : jalons pondérés, bareme: 20 (voir ci-dessous)
  portee: 'eleve' | 'groupe',
  pret: true,               // false = cachée aux élèves (l'enseignant la voit, étiquetée)
  ouverture: 'prof',        // fermée aux élèves tant que l'enseignant ne l'a pas cochée (Conduite de séance)
};
```

Ajouter une activité = un fichier + **une ligne** dans `activites/index.js`.

- **Notation des séances d'entreprise** : **Toute séance d'entreprise (ENT-x.y) est notée par jalons pondérés, total 20** (`bareme: 20`, un `poids` par jalon du socle, jalons regroupés par `groupe`) : le poids va au cœur de la compétence, la forme (ton, politesse, présentation) ne dépasse pas ~15 %, aucun jalon à 0 ; les poids de chaque séance sont **validés par Tristan avant d'être codés** (règle du 10/10/2026, `docs/briefs/NOTATION-ponderation.md`). Hors règle : QUI, TAB, DEC-1, SCE, ACT-1.
La liste complète des champs de `meta` (parcours, jeuId, corrige, immersif…), des exports et de
ce que reçoit `rendre` est dans `activites/FICHE-SEANCE.md` : **la lire avant d'écrire ou
modifier une séance**, et la corriger si le code a changé.

- Préfixes de code par nature de travail : `DEC` découverte, `ACT` outil métier, `ENT` environnement
  d'entreprise (`ENT-1.2` : entreprise 1, séance 2), `TAB` tableur, `REF` exercices par
  compétence, `SCE` scénario ancien, `QUI` quiz, `MES` messagerie. Le tri se fait segment par
  segment (`ENT-1.10` après `ENT-1.9`). Pour déplacer une activité, changer son `code`.
  `TAB-4` est destiné au CAP OL (sans `niveaux` dans le code pour l'instant, donc ouvert à tous :
  chantier 12 de `docs/chantiers.md`). Changer un `code` déplace les étiquettes partout (aucun score
  perdu) : le dire.
- **Séance en cours d'écriture : `pret: false`**, ce qui permet de commiter à tout moment
  (brouillon que personne ne peut ouvrir aux élèves).
- **Séance livrée : `pret: true, ouverture: 'prof'`** (règle adoptée par Tristan le 03/10/2026).
  Elle reste fermée aux élèves ; Tristan l'essaie à l'écran, puis l'**ouvre lui-même** en la
  cochant pour son groupe dans « Conduite de séance » — plus de commit pour ouvrir. Les seules séances
  ouvertes avant cette règle et non converties sont Boost (ENT-3.1 à 3.3) ; elles ne le seront pas sans
  son accord. Spartoo (ENT-1.1 à 1.3) a été converti le 09/10/2026 ; Cdiscount, Picard et Smoby sont déjà
  en `'prof'`.
  Une séance `pret: false` compte quand même dans le tableau des compétences (décision de Tristan).
- Évaluation : `meta.copie: true`, `copie: meta.copie` dans `creerEntreprise`, et
  `export const noter = (db) => moteur.noter(db);` dans le fichier d'activité.
- Données d'une entreprise : `contenus/<nom>.js`, une base par séance (pas de `jeuId` partagé
  sauf Spartoo et Boost ENT-3.x). Inventaire : suivre `docs/fiches/prepalog-inventaire-format.md` (catalogue
  d'articles simples) — un besoin qui n'y entre pas = demande au moteur, pas un format parallèle.
- **Cloisonner par séance** tout état nouveau rangé dans la base d'un élève.
- Une séance qui juge un travail sous contrainte : vérifier ce que le jalon dit **avant** que
  l'élève commence et qu'il **ne récompense pas l'inaction**. Un chiffre caché à l'élève ne doit
  pas être déductible ailleurs (« dépassée de 57 kg » le rend par soustraction : dire *que*,
  jamais *de combien*).

### Charte visuelle

- Variables CSS sémantiques (`--fond`, `--panneau`, `--encre`, `--ardoise` = l'accent **vert**
  même si le nom a été gardé, `--vert` = « juste », `--terre` = ambre…). Déclarées **trois
  fois** dans `styles/base.css` : `:root`, `:root[data-theme="sombre"]`, et le bloc
  `@media (prefers-color-scheme: dark)`. **Toujours modifier les trois ensemble.**
  Une activité n'a jamais à connaître le thème.
- **Pas de blanc pur** (thème clair « papier » chaud). Pas de couleur d'aplat fixe sur un écran
  d'entreprise (les chartes peuvent être sombres) : teintes translucides `rgba`.
- **Le vert plein (aplat) ne dit que « juste »** ; ailleurs le vert n'est que texte, trait ou
  bordure (on distingue par la forme, pas par la teinte). Un champ de saisie ne prend jamais
  d'aplat. Le faux reste du texte rouge, sans aplat.
- Sur les cartes/vues de transport : **vert = l'ordre de la tournée, bleu = le client et son
  emplacement**, partout à la fois. Le décor d'une carte ne reprend aucune couleur de repère et
  on ne déplace jamais un point pour faire de la place à une étiquette.
- **Charte rouge ou verte** (Smoby, Spartoo, Boost) : sa couleur reste au bandeau et au menu, **jamais dans la zone où
  l'élève travaille** (le rouge y dirait « faux », le vert « juste ») : le moteur y remplace l'accent par l'encre, tout
  seul, d'après la teinte (décision de Tristan, 05/10/2026). Texte et aplats sont jugés à part.
- Une entreprise prend **sa** charte, mais vérifier que son accent et son vert ne sont pas la
  même couleur. Contrastes WCAG ≥ 4,5 pour le texte.
- Interface qui se redessine à chaque action : conserver le focus (au clavier seulement).
- Le thème sombre est masqué aux élèves (bouton visible de l'enseignant seul).

## Tests

- Suite Playwright en mode démonstration, ~1 000 cas. **En local, la lancer en parallèle :
  `node outils/test-parallele.mjs`** (tous les blocs, six navigateurs à la fois, ~4 min 30 ; le temps
  est celui du bloc le plus long, Smoby). `node outils/test.mjs` joue la même suite dans un seul
  navigateur (~14 min) ; sur GitHub, en trois groupes (`--groupe N`, voir l'en-tête de `outils/test.mjs`).
  Un bloc seul : `node outils/test.mjs boost` (plusieurs : `boost carte`). Un bloc par fichier
  dans `outils/test/` ; un fichier non inscrit dans `BLOCS` du lanceur fait refuser le départ, et un
  bloc absent de `GROUPES` aussi (une entreprise nouvelle = sa ligne dans les deux ; le lanceur
  parallèle, lui, lit `BLOCS` et n'a rien à régler). Un cas qui ne tombe qu'en parallèle est d'abord un
  cas trop pressé : le rejouer seul avant de chercher ailleurs.
- Installation locale (pas globale) : `npm install --no-save --no-package-lock playwright@1.63.0
  xlsx@0.18.5` puis `npx playwright install chromium`.
- **Lancer la suite entière avant tout push** qui touche `core/`, `styles/` ou `activites/`.
  Un échec massif et incompréhensible (`page.click: Timeout` dès `#btnProf`) = d'abord un
  fichier manquant ou un serveur de test muet, avant d'être un bug.
- **Toucher `outils/test.mjs`, `outils/test/commun.mjs` ou réécrire un cas existant : toujours
  le dire explicitement à Tristan.** Une conversation écrit dans le bloc de son entreprise/vue ;
  une entreprise nouvelle crée son fichier de bloc et une ligne dans `BLOCS`.
- **Éprouver chaque test dans les deux sens** : un sabotage qui ne fait rien tomber est d'abord
  un test mal écrit. Un test de suppression nomme ce qui **reste**, pas seulement ce qui part.
- Ne jamais écrire de test qui dépend de l'**absence** d'un fichier (le serveur de test répond
  404 sur `prepalog-config.json` exprès : la suite est en mode démo par construction).
- La suite ne couvre pas le mode réel ; les règles se testent à l'émulateur :
  `outils\tester-regles.bat` (Java requis). Pour les défauts d'interaction, **piloter l'écran**
  (souris sur `boundingBox()`, `scrollIntoViewIfNeeded()` avant) trouve ce que les tests ne
  trouvent pas.

## Firebase — zone à risque

- **Modifier `firestore.rules` ou `database.rules.json` ne protège rien tant que ce n'est pas
  publié dans la console Firebase** (action de Tristan : coller le contenu ; pour RTDB, **sans**
  le bloc `_commentaire`). Le dire à chaque fois qu'on touche à ces fichiers.
- Une règle ne doit **jamais supposer qu'un document ou un champ existe** (`get()` sur absent
  = `null`, lire un champ de `null` fait échouer toute l'évaluation et se confond avec un vrai
  refus). Utiliser `exists()`, `.get(clé, défaut)`, `x != true` plutôt que `!x`.
- `prepalog-config.json` est versionné (config web publique par construction) ; `superAdmins`
  y reste **vide** exprès. Nouveau collègue enseignant : **double amorçage** (profil Firestore
  `users/{uid}` à la main **et** uid dans `profsGlobaux` côté RTDB ; procédure en une page, avec le cas
  du simple co-enseignant : `docs/amorcer-un-collegue.md`). Bascule sur `prepalog.fr` :
  ajouter le domaine dans Authentication → Domaines autorisés.
- Suppression d'un élève/groupe : irréversible, sans corbeille. Toute fonction qui supprime ou
  détache des données doit vérifier qu'elle ne laisse rien d'**invisible** derrière elle.
  Supprimer l'élève **avant** le groupe. L'ordre d'effacement de `supprimerGroupe()` (le miroir
  `acces/{gid}` part en dernier) ne doit pas être cassé.
- Ne jamais tester contre le vrai projet des élèves.
- Entre enseignants (chantier 11, règles publiées) : un profil d'élève ne se supprime que par son auteur (`creePar`), un enseignant s'il n'a pas d'auteur, ou le responsable (`profs[0]`) de son premier groupe ; un groupe, que par son responsable ; le miroir `acces/{gid}` se crée par `profsGlobaux` mais ne se réécrit que par ses inscrits. La garde du code (`core/collegues.js`) passe avant les règles.

## Git — Claude s'en occupe

Branche `main`, dépôt public `ymorin-edu/prepalog`. Avant, Tristan commitait et poussait à la
main dans GitHub Desktop : **c'est maintenant à Claude de le faire.**

- **Commits petits et fréquents**, un par ensemble cohérent (une séance, un correctif, une
  fiche), message en **français**, au présent, qui dit ce qui change pour l'utilisateur
  (« ENT-2.1 : trame élève et corrigé », pas « update »). Ajouter les fichiers par leur nom,
  pas `git add -A` à l'aveugle : vérifier `git status` d'abord.
- **Ne jamais commiter** : `node_modules/`, `outils/paquets/`, `outils/.rtdb-emulateur.json`,
  `*-debug.log`, `outils/carte/sources/`, `__pycache__/`, ni aucun secret (jeton, mot de passe,
  fichier hors config web).
- **Pousser quand la suite est verte** (ou quand le changement n'est que de la doc/des
  contenus `pret: false`). Jamais de `push --force`, jamais de réécriture d'historique publié.
  Avant de pousser : `git pull --rebase` ; en cas de conflit, résoudre en fusionnant, pas en
  écrasant, et le dire.
- **Un push = en ligne pour les élèves.** Si une séance est annoncée pour aujourd'hui ou
  demain, dire ce qui a changé depuis le dernier essai de Tristan.
- Si le push échoue (réseau, droits), ne pas contourner : dire à Tristan ce qui s'est passé.
- Après un push touchant `firestore.rules`/`database.rules.json` : rappeler qu'il reste à
  **publier dans la console**.

## Plusieurs sessions à la fois : `docs/EN-COURS.md`

Tristan peut avoir deux conversations Claude Code ouvertes sur le dépôt. **Avant d'écrire**, lire
`docs/EN-COURS.md` et lancer `git status` : si un fichier dont on a besoin est modifié sans qu'on l'ait
fait, ou inscrit là, **s'arrêter et le dire** (ne pas écraser, ne pas deviner). Sinon, s'inscrire (une
ligne, commitée et poussée aussitôt), et **s'effacer** une fois le travail commité et poussé. Ne jamais
commiter les fichiers d'une autre session : `git add` par nom, uniquement les siens.
Chercher dans le dépôt avec `git grep`, jamais `grep -r` : `.claude/worktrees/` contient des copies du
dépôt qui faussent tout balayage.

## Alertes — à signaler à Tristan quand elles se présentent

1. Règles de sécurité modifiées (voir Firebase). 2. Un nouvel enseignant rejoint. 3. Bascule
de domaine. 4. Suppression/détachement de données. 5. Contenu repris de la Suite Logistique.
6. Séance en classe imminente et fichiers modifiés le jour même. 7. `outils/test.mjs` touché.
8. Activité ajoutée (son `code` décide du rang) ou `code` changé. 9. Entreprise réelle dans un
contenu (vérification web, dire le vérifié/construit). 10. Image nécessaire : récupérer par
script (lire, encoder, écrire, **relire et redécoder**) et vérifier par empreinte — ne jamais
recopier du base64 à la main. 11. Générateur de fichiers binaires : le rendre reproductible.
12. Contenu qui dépend d'Internet pendant la séance : prévoir un filet de sécurité.
13. Vue nouvelle au noyau : l'activer seulement si le contenu la déclare.
14. Case autocorrigée dans une vue de transport : elle se corrige contre le bilan **de l'élève**
(`exigeConforme`), donc ne juge jamais son travail d'organisation.
15. Poser un point sur un plan quadrillé : le rond (rayon 12) doit tenir entièrement dans une
cellule (≥ 12 unités de chaque ligne ; le bloc `boost` des tests vérifie que chaque rond
d'ENT-3.1 tient dans sa case, il doit rester vert).
16. Les briefs citent des alertes au-delà de 15 (16, 18, 28…) : elles viennent des fiches du projet
Cowork, pas de cette liste ; demander la fiche à Tristan avant d'agir dessus.

## Travail à deux : Cowork conçoit, Claude Code construit

Tristan utilise **deux outils** (organisation décidée le 02/10/2026) :

- **Cowork** (conversations + projet Claude « PREPALOG », que Claude Code ne voit pas) : concevoir
  une séance, vérifier une entreprise par recherche web, fabriquer trames Word/PDF et
  diaporamas, tenir la mémoire de conception.
- **Claude Code** (toi, ici) : écrire les séances dans le moteur, tester, corriger, **commiter et
  pousser**.

Le relais passe par le dossier **`docs/`** du dépôt. **Lis `docs/LISEZMOI.md`** : il décrit le
cycle d'une séance et les règles d'écriture. En résumé :

- Une séance à construire arrive sous forme de **brief** dans `docs/briefs/` (modèle :
  `docs/briefs/MODELE.md`). Quand Tristan dit « implémente le brief ENT-x.y », lis-le en entier,
  annonce la durée, construis avec **`pret: false`**, et livre avec **`pret: true, ouverture: 'prof'`** :
  Tristan l'essaie à l'écran et l'ouvre lui-même à son groupe.
- **À la livraison, remplis la section « Compte rendu » du brief**, passe son statut à `livré`, et
  ajoute une ligne à `docs/decisions.md` pour toute décision prise en route : c'est ce qui permet à
  Cowork de tenir à jour la mémoire de conception.
- **Une demande au moteur** (écran ou comportement qu'`core/` ne sait pas faire) s'écrit dans la
  section 7 du brief ; une séance n'écrit rien dans `core/` ni `styles/base.css`. Un chantier
  moteur à part s'en charge, un seul à la fois.
- Si un brief est incomplet, ambigu, ou contredit le code ou la finalité : **pose la question à
  Tristan avant d'écrire**, ne comble pas les trous toi-même (surtout sur l'entreprise : ne rien
  inventer de « réel » sans source).
- **Cowork écrit dans `docs/` et dans les supports** (depuis le 04/10/2026) : trames et corrigés
  (`contenus/trames/`, `contenus/corriges/`) et leurs générateurs (`outils/trame-*.py`,
  `outils/corriges_*.py`) ; jamais dans le code des séances ni le moteur. Il ne commite pas : quand
  Tristan dit que Cowork a fini, relis ses fichiers (texte des trames, aucun nombre attendu là où les
  données varient), lance la suite, commite par nom et pousse. Pour tout autre changement que tu n'as
  pas fait, regarde `git status` et `git diff` avant de l'écraser, et dis-le à Tristan.

Fiches de référence copiées dans `docs/fiches/` : `prepalog-finalite` (la boussole),
`prepalog-nomenclature`, `prepalog-progression-pedagogique`, `prepalog-entreprises-reelles`,
`prepalog-notes-competences`, `prepalog-inventaire-format`, `prepalog-vues-transport`. Ce sont des
**copies datées du 02/10/2026** : en cas de contradiction avec le code, c'est le code qui dit ce qui
existe, et la fiche est à signaler. Les autres fiches (architecture, Firebase, règles vérifiées,
chantiers, référentiels Bac Pro 2025 / 2de GATL / CAP OL, carte de couverture, entreprises…) restent
dans le projet : si Tristan colle ou exporte l'une d'elles, la lire avant de toucher au sujet.

Les pages d'essai jetables et maquettes vont dans
`G:\Mon Drive\Travail\Logistique\1L\Claude outputs`.

**Audit et feuille de route (08/10/2026)** : `docs/audit-architecture.md` dit ce qui est solide, fragile
ou empilé ; `docs/chantiers.md` donne les chantiers dans l'ordre, avec leur état. **À relire avant tout
chantier moteur**, et à tenir à jour (état, ligne dans `decisions.md`) quand un chantier est livré.

## Pièges connus de l'ancien circuit (utile à savoir, plus nécessaire en Claude Code)

- Le pont de fichiers de Cowork pouvait écrire une version périmée en répondant « écrit » : ce
  n'est plus pertinent avec Claude Code, qui écrit directement dans le dépôt.
- Les PNG étaient ré-encodés à l'écriture par ce pont : comparer image contre image si un
  doute subsiste sur un binaire.
