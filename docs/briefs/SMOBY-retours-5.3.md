# Brief — retours du parcours élève ENT-5.3 (Smoby, la visite de la plateforme)

> **📋 Phrase à copier-coller dans Claude Code :**
>
> ```
> Lis docs/briefs/SMOBY-retours-5.3.md et implémente le lot A. Avant d'écrire, lis docs/EN-COURS.md : si le chantier « Smoby retours 5.1/5.2 » y est encore inscrit, attends qu'il soit commité (il touche outils/test/smoby.mjs). Annonce la durée avant de commencer et dis-moi si un point contredit le code.
> ```

**Auteur** : Cowork, 06/10/2026 au soir (proposition n° 1 retenue par Tristan : « remettre 5.3 d'aplomb, sans moteur »).
**Source** : parcours joué en mode démo sur `main` (addefdb), 1366 × 657 et 1366 × 768, compte prof → groupe 2de →
2 élèves → séance cochée → jeu élève (erreurs plausibles puis juste), Suivi, Repérage, « Élève bloqué ».
Compte rendu complet : projet Cowork `claude/prepalog-parcours-eleve-5.3.md`.
**Statut** : prêt à implémenter (images validées). **Modèle** : Sonnet suffit (contenu seul).
**Contexte** : Tristan n'a **pas encore de groupe de 2de** sur le site : aucun élève n'a joué 5.3, donc rien à conserver
(règle 9 sans objet). Rien ne presse ; la séance reste `pret: true, ouverture: 'prof'`.

**Fichiers touchés par le lot A** : `contenus/smoby-ent53.js` (A1 à A6), et pour la règle du tu dans toute la série
(A5 bis) `contenus/smoby-ent52.js`, `contenus/smoby-ent57.js`, `docs/decisions.md`, `activites/FICHE-SEANCE.md` (+ les tests : `outils/test/entrepot.mjs`, et
`outils/test/smoby.mjs` **après** le chantier « Smoby retours 5.1/5.2 », qui l'a réservé dans `EN-COURS.md`).
`activites/smoby-visite.js` n'est **pas** touché (réservé aussi ; la description qui nomme Yanis devient sans objet avec
le verrou du lot B de `SMOBY-retours-5.1-5.2.md`).

**Images de contrôle** (déposées par Cowork, **validées par Tristan le 06/10 au soir**) :
`docs/briefs/smoby/visite/quiz-zones-v4.png` (zones A1 ; remplace la v2 et la v3, à supprimer) et `docs/briefs/smoby/visite/mots-du-rack-v2.png` (points A2).
Ce sont des aides de relecture : **ne pas les servir au site**.

---

## Lot A — contenu de la séance (pas de `core/`)

### A1. Quiz : plus aucune bonne réponse refusée
**Constat** : une seule zone par lisse / palette / échelle, alors que la photo en montre beaucoup d'autres. Testé : une
vraie lisse (640, 220), la lisse de gauche (100, 560), une palette filmée en haut à gauche (100, 300), une échelle du fond
(760, 900) → « Non, pas ici ». L'élève apprend que sa bonne réponse est fausse.
**Décision** : des questions **ciblées** (une cible qu'on ne peut pas confondre) et, pour la palette, **toutes** les
palettes filmées visibles. Échelles : toutes celles des racks de gauche, de la première à la plus lointaine, et celle de droite (ajout de Tristan le
06/10). Lisses : toutes celles qui portent une palette filmée, dont les deux de gauche sous les
palettes de cartons (relevées par Tristan le 06/10) ; la lisse des fûts bleus (sans film) n'en fait pas partie. Étape `quiz` de `contenus/smoby-ent53.js`, repère 1280 × 1920 inchangé :

| id | `mot` (affiché dans « Sur cette photo… clique sur {mot} ») | `zones` | `aide` (dans le message faux) |
|---|---|---|---|
| `echelle` | `une échelle` | `[165, 0, 335, 1560]`, `[300, 150, 425, 1500]`, `[545, 380, 660, 1340]`, `[705, 530, 770, 1240]`, `[800, 650, 860, 1190]`, `[865, 720, 955, 1140]`, `[1135, 0, 1280, 1700]` | `Une échelle est un montant vertical percé de trous, relié à un autre par des barres en diagonale.` |
| `lisse` | `une lisse qui porte une palette filmée` | `[305, 80, 1190, 165]`, `[0, 495, 190, 558]`, `[0, 555, 330, 650]`, `[330, 690, 565, 728]`, `[0, 998, 560, 1068]` | `Une lisse est la barre horizontale sous la palette : la palette pose dessus.` |
| `palette` | `une palette filmée` | `[0, 150, 265, 500]`, `[350, 490, 560, 700]`, `[0, 680, 250, 960]`, `[340, 0, 640, 85]`, `[630, 0, 905, 75]`, `[365, 820, 560, 960]` | `Cherche des cartons ou des seaux entourés de film plastique.` |
| `allee` | `l’allée` | `[0, 1560, 1180, 1920]`, `[230, 1350, 1150, 1560]`, `[780, 1100, 1140, 1350]` | `L’allée est le couloir au sol, entre les racks.` |

- `faux` : `'Non, pas ici. {aide}'` (le moteur remplit `{aide}` : vérifier dans `repondre()` de
  `core/types/entrepot-visite.js` que `fmt(Q.faux, q)` lit bien `q.aide` ; sinon le dire, ne pas toucher au moteur).
- `juste` : `'Oui : c’est {mot}.'` (inchangé).
- Les gestes justes des tests actuels tombent toujours dans les nouvelles zones ((300, 500), (450, 600), (800, 1700)) : à revérifier.
  **Sauf la lisse** : (800, 400) tombe sur la lisse des fûts bleus, qui ne compte plus → prendre (700, 120).
- La **photo reste petite** (≈ 265 × 398 px à 657 de haut, 340 × 510 à 768) : voir la question 1 en fin de brief.

### A2. Les mots du rack : « Travée » et « Croisillons » remis à leur place
**Constat** : sur la photo de l'allée, les échelles de droite sont vues **de profil** (deux montants bleus reliés par des
diagonales). Le point 7 « Travée » (1100, 420) est posé **sur une échelle, sur ses croisillons** ; le point 8
« Croisillons » (930, 470) est sur une palette au sol. Ça contredit la définition enseignée deux étapes plus loin.
**Décision** (repère 1400 × 788) :
- point 7 `Travée` : **(330, 330)** — à gauche, entre deux échelles successives, là où sont posées les palettes ;
- point 8 `Croisillons` : **(1100, 420)** — l'ancienne place du 7, exactement sur une diagonale.
Vérifier à l'écran que les bulles des points 2, 4 et 7 ne se chevauchent pas (rayon 24).

### A3. Échelle et lisse sans couleur
**Constat** : « le montant vertical **(bleu)** » est vrai sur la photo de l'allée, faux au quiz (échelles grises) et à la
travée (échelles orange). Ces définitions sont aussi celles du **lexique cliquable** (lues dans les points).
**Décision** :
- `Échelle` : `Le montant vertical, percé de trous, qui porte les lisses. Deux échelles délimitent une travée.`
- `Lisse` : `La barre horizontale sur laquelle on pose les palettes. Sa charge maximale est écrite sur une plaque.`
- Dans l'étape `travee`, `rappel` des lisses : enlever « (orange) » aussi. Les messages `horsCible` (« une barre
  horizontale orange ») restent : sur cette photo-là, c'est vrai.

### A4. Vue du ciel : l'aide nomme le point au lieu de son numéro
**Constat** : « Pas ici. Relisez le point n° 3 » alors que, pendant les questions, les numéros ne sont plus sur la photo et
que le point 3 est caché plus bas dans la colonne (il faut la faire défiler).
**Décision** : `faux: 'Pas ici. Relis le point « {aide} », dans la liste à gauche.'` et `aide` = le **nom** du point :
`camions` → `Parking poids lourds`, `pietons` → `Passage piétons`, `quais` → `Les quais`.
Les questions elles-mêmes ne changent pas (elles reprennent les phrases des points : c'est du guidage, assumé).

### A5. La voix du site au tu (décision de Tristan, 06/10 au soir : « il faut juste qu'on soit cohérent »)
Constat : Smoby mélange. Les accueils, aides et jalons de 5.1, 5.2, 5.4, 5.5, 5.6 et 5.8 sont au **tu** ; les consignes de
5.3 (~35), quelques légendes de 5.2 et 5.7, et une bonne partie du moteur sont au **vous**. **Décision : tu partout pour
la voix du site** (option la moins coûteuse : Smoby est déjà surtout au tu, et ses personnages tutoient).

**Qui dit tu, qui dit vous** (vaut pour toute la série, et pour toute séance écrite ensuite) :
1. **La voix du site** (consignes, aides, légendes, invites, messages juste / faux, détails des jalons, accueil) → **tu**.
2. **Les collègues de l'élève** (Sophie, Bruno quand l'élève est cariste chez Smoby, le responsable d'exploitation et
   l'atelier de K+N quand l'élève est agent K+N) tutoient l'élève, et l'élève leur répond au **tu poli** (décision 4a :
   la faute est le ton, pas le tu).
3. **Les personnes extérieures** (le chauffeur de la navette d'Arinthod en 5.4 ; le client Jouets du Rhône en 5.8 ;
   Smoby / Bruno vu depuis K+N, c'est-à-dire un client du transporteur) → **vous**, dans les deux sens.
   « Pouvez-vous nous confirmer que le quai 2 sera libre ? », « avant votre heure limite », « Je vous attends au local
   chauffeurs » **restent au vous** : c'est ce qu'on enseigne.
4. Un message adressé à **un service** (« Bonjour l'exploitation ! … sur votre planning ») reste au **vous** (pluriel).
5. Les **phrases pièges** gardent leur registre familier (« Salut ! », « Bisous », « À plus ») : fausses par le ton.
6. Lexique et glossaire : tournure **neutre** ; descriptions des séances (`meta.desc`) : à l'**infinitif** (déjà le cas).
7. Impératif : « clique », « glisse », « pose », « reprends », « renvoie-le-moi » (pas de *s* final aux verbes en -er).
8. L'**espace enseignant** reste au vous ; les **trames élève** (Cowork) suivent les mêmes règles que l'écran.

**Dans `contenus/smoby-ent53.js`** : Lisez → Lis, Cliquez/cliquez → Clique/clique, Ouvrez → Ouvre, Relisez → Relis,
Répondez → Réponds, Suivez → Suis, Commencez → Commence, Associez → Associe, Regardez → Regarde, revoyez/Revoyez →
revois/Revois, Trouvez → Trouve, Placez → Place, Cherchez → Cherche, Restez → Reste, Décomposez → Décompose,
Choisissez → Choisis, validez → valide, Retrouvez → Retrouve ; « Délimiter **vous-même** » → « Délimiter **toi-même** » ;
« Bruno **vous** montre » → « Bruno **te** montre » ; « c'est **à vous** de » → « c'est **à toi** de » ; « **votre**
travée » → « **ta** travée ». Relever par `grep` avant, relire après : plus aucun « vous » hors commentaire.

### A5 bis. Le reste de la série Smoby
Relevé du 06/10 (`main`, 59bbf78 ; refaire le `grep`, les numéros de ligne bougent) :
- `contenus/smoby-ent52.js` : légende du planning (« Glissez une carte… ou cliquez-la puis cliquez le jour »), consigne
  `regles` (« Posez chaque absence… »), `invite` (« Cliquez une demande… »). **Fichier réservé** par le chantier
  « Smoby retours 5.1/5.2 » : attendre qu'il soit effacé d'`EN-COURS.md`.
- `contenus/smoby-ent57.js` : légende du planning des camions (« quand vous choisissez un camion »), légende du planning
  des chauffeurs (« Glissez… cliquez… choisissez »), aide `conduite` (« posez une carte Pause »), `invite` (« Cliquez un
  enlèvement »), **aléa de l'atelier K+N** (collègue) : « Reprenez le planning… renvoyez-le-moi » → « Reprends le planning
  des chauffeurs et renvoie-le-moi ». **Reste au vous** : le message de Bruno à « l'exploitation K+N » (règle 4).
- `contenus/smoby-ent58.js`, `smoby-ent54.js` : **rien à changer** (vous justifiés, règle 3).
- `contenus/smoby-ent51.js`, `smoby-ent55.js`, `smoby-ent56.js`, `smoby.js`, `smoby-entrepot.js` : rien relevé.
- **Moteur** : lot C3 de `SMOBY-retours-5.1-5.2.md` (« tout au tu côté élève »), qui devient la règle de tout le site.
Tests : chercher dans `outils/test/smoby.mjs`, `entrepot.mjs` et `planning.mjs` les textes changés qu'un cas lirait et les
recaler **à la main**. Une ligne dans `docs/decisions.md` (la règle ci-dessus, en résumé), recopiée dans
`activites/FICHE-SEANCE.md` (règles d'écriture).

**Pour plus tard (hors de ce brief)** : la même règle vaut pour les autres entreprises (Cdiscount surtout au vous, Boost
mélangé, Picard surtout au tu). **Spartoo reste tel quel** (CLAUDE.md), sauf ce que la refonte d'ENT-1.1 réécrit. Un brief
à part, quand Tristan le décidera.

### A6. Message de Bruno daté dans l'histoire
**Constat** : le message s'affiche « 06/10/2026 20:15 » (date réelle, `ts: Date.now() - 60000`) alors que la visite est
le **mercredi 9 décembre**, 8 h.
**Décision** : dans `VOLET.semer`, `ts` = le 9 décembre de l'année scolaire en cours, 7 h 55, **heure locale**. Calcul
proposé : année = celle de `Date.now()` si on est entre septembre et décembre, sinon l'année d'avant (le scénario est
« fin 2026 » ; l'an prochain, la même règle donne décembre 2027). Vérifier à l'écran la date affichée dans la liste et
dans le message. **Ne rien changer dans 5.1 / 5.2 / 5.4 et suivantes** : la date de toute la série est la proposition
n° 3 (« une seule horloge »), pas encore décidée.

### Tests (lot A)
- Bloc `entrepot` (il porte la déclaration d'ENT-5.3 avec des valeurs écrites à la main, brief §6) : recaler **à la
  main** les zones du quiz, les points 7 / 8, les définitions et les messages changés ; ajouter les quatre clics
  refusés du constat A1 → maintenant **justes**, et un clic vraiment faux (le mur du fond, (1000, 900)) → toujours faux.
- Bloc `smoby` (après le chantier 5.1/5.2) : la visite juste de bout en bout reste à 17 / 17.
- Sabotage : remettre une zone à l'ancienne valeur → le cas des clics refusés doit tomber.
- Suite entière, puis essai à l'écran (une erreur par étape, puis juste). Commit par nom de fichier.

---

## Ce qui va avec les lots moteur déjà décidés (`SMOBY-retours-5.1-5.2.md`), à **étendre à 5.3**

Rien à écrire ici : à ajouter au moment où ces lots se font.
- **Lot B (verrou)** : 5.3 fermée tant que 5.2 n'est pas validée (aujourd'hui 5.3 s'ouvre seule).
- **C1 (bandeau de fin)** — et, pour la visite : l'étape **Fin** affiche « La visite » tout en ✓ même quand un jalon est
  perdu (adresse décomposée fausse → 16 / 17, liste toute verte). Proposition : ✗ devant l'étape qui a un jalon faux,
  **sans la réponse** (`core/types/entrepot-visite.js`, étape `fin`).
- **C3 (tout au tu)** : textes de `core/types/entrepot-visite.js` et de la barre d'adresse (`core/types/entrepot.js`)
  (« Vous êtes en », « (vous : niveau) », « vous êtes en A2, il faut A1 »).
- **C2 (confirmation)** : « Valider » de l'adresse joue le jalon en une seule fois → Oui / Non dans la page.
- **C4 (suivi)** : « 19/20 **(51)** » ; repérage en identifiants (`ciel-camions`, `travee-cibles`, `adresse-retrouver`…).
  Le brief ENT-5.3 §5 promettait aussi le **nombre de clics pour retrouver l'emplacement** : absent.
- **C5 (« Répondre »)** : sous le message de Bruno, qui n'attend pas de réponse.
- **C6 (logo)**, **C7 (élision)** : la confirmation de remise à zéro dit aussi « de Inaya… **Il** repart… **leurs**
  scores », et passe par `confirm()` du navigateur.
- **C8 (nouveau, petit)** : étape **travée**, le message d'erreur des coins **déborde sous « Vérifier / Effacer »**
  (texte coupé, illisible) à 1366 × 657. Correctif de mise en page dans `entrepot-visite.js`.

## Questions à Tristan (une à une)

1. **Photo du quiz trop petite** (portrait 1280 × 1920 : 265 × 398 px à l'écran). Défaut : **on la garde** et on voit
   avec les zones ciblées du lot A. Autres options : (a) la recadrer sur le haut (perd une partie de l'allée) ;
   (b) une demande au moteur : bouton « agrandir la photo » dans `photoQuestions`.
2. ~~Images de contrôle~~ : **validées par Tristan le 06/10 au soir** (`quiz-zones-v4.png`, `mots-du-rack-v2.png`).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- Fichiers modifiés (07/10/2026) : `contenus/smoby-ent53.js` (A1 à A6), `contenus/smoby-ent52.js` et `contenus/smoby-ent57.js`
  (A5 bis), `docs/decisions.md`, `activites/FICHE-SEANCE.md` (section « Écrire les textes : tu ou vous »),
  `outils/test/entrepot.mjs`, `outils/test/smoby.mjs`.
- Vérifié dans le moteur : `fmt(Q.faux, q)` lit bien `q.aide` (`core/types/entrepot-visite.js`, `repondre`) ; rien touché dans `core/`.
- Écarts par rapport au brief :
  - **Clic (640, 220)** du constat A1 (« une vraie lisse ») : il ne tombe dans **aucune** zone de lisse validée (image
    `quiz-zones-v4.png`) ; il est du côté de la lisse des fûts bleus, exclue. Il reste donc refusé ; le test ne le compte
    pas parmi les clics devenus justes (les trois autres le sont). À trancher par Tristan si cette lisse doit compter.
  - `liste: 'Vos réponses'` du quiz → `'Tes réponses'` (pas dans la liste du brief, même règle).
  - 5.2 : l'aléa du responsable de la plateforme (« Reprenez… renvoyez-le-moi ») passé au tu, comme celui de l'atelier
    K+N en 5.7 (règle 2 : un collègue) ; il n'était pas dans le relevé du brief.
  - Images de contrôle v2 et v3 du quiz non supprimées (jamais commitées, hors dépôt suivi) : à renommer « A-SUPPRIMER »
    ou à laisser à Cowork.
- Tests : bloc `entrepot` 59/59 (cas recalés à la main : message de la vue du ciel, quiz, coins, lisses, « Où est-ce ? » ;
  deux cas nouveaux : les clics du constat devenus justes + fûts bleus et mur du fond faux avec l'aide ; points 7 / 8 et
  définitions sans couleur). Bloc `smoby` : visite juste 17 / 17 (geste de la lisse (800, 400) → (700, 120)) et date du
  message de Bruno (9 décembre, 7 h 55). Sabotage : les anciennes zones de la lisse remises → le cas nouveau tombe.
  Suite entière : 807 / 808 ; le seul échec est **ENT-2.4** (Cdiscount), sans lien : le message écrit « le 1er octobre »
  et le test attend « le 1 octobre » ; il ne tombe que le jour où la réception du scénario est un 1er du mois (le 07/10).
- Essai à l'écran : pas fait par Claude Code.
- Commits : voir `git log` (« ENT-5.3 : retours du parcours élève, lot A… »).
