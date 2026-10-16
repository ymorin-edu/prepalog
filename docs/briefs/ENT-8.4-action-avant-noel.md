# Brief de séance — ENT-8.4 Action — la semaine avant Noël (CAP OL, entraînement CAP-C1.2)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md puis docs/briefs/ENT-8.4-action-avant-noel.md en entier. ENT-8.3 doit être livrée (précédente du parcours). Fais d'abord l'état des lieux du §7 (dis-moi ce qui manque au moteur avant de contourner), puis construis la séance. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : livré (16/10/2026, Claude Code, sous-agent Opus du chantier 2 ; non commité : le chef de chantier commite)
**Date du brief** : 16/10/2026
**Conversation d'origine** : Cowork (Opus) — cadrage du 15/10/2026 au soir (`claude/prepalog-action-entrainement-c1.md`, décisions 8 à 13),
puis la décision « un écran par étape » du 16/10/2026 (§0 bis d'ENT-8.3, retours de classe des CAP).
**Modèle** : **Opus** (séance nouvelle de bout en bout).
**Place dans l'ordre** : après ENT-8.3 (`docs/briefs/ENT-8.3-action-autre-site.md`).
**Durée estimée par Cowork** : ≈ 5 à 6 h. Ce qui prend le temps : le **plan dessiné de la réception de Labastide** (8 lieux numérotés,
chacun avec un indice dessiné), la grille saturée et son contrôle, les quatre documents, la réponse par phrases calculée sur le travail de
l'élève, les tests.

---

## 0. Règles communes

- **§0 et §0 bis d'ENT-8.3** (CAP ; nouvelle PFMP chez **GXO à Labastide-Saint-Pierre**, tuteur **Romain, chef d'équipe réception** ;
  **un écran par étape** : document à gauche de la fiche, consigne en haut de l'écran, écran suivant ouvert à l'envoi du précédent, barre
  « Étape suivante », pas de point d'étape, `bilanDetail`).
- **Date du scénario : jeudi 17 décembre, 6 h** (sans année). La semaine avant Noël : le planigramme est plein.
- **Moins guidé qu'ENT-8.2** : pas de visite commentée, pas de photo par lieu ; l'élève lit un plan, une grille, des documents qu'il a déjà vus.
- **Exception assumée au « un écran par étape »** : l'étape 3 tient sur **deux écrans** (la fiche de lecture, puis le planning pour replacer
  le camion), parce que le planning est une vue à part. La barre « Étape suivante » relie les deux.

Écrans de l'élève : **Avant de commencer → Repérer mon poste → Qui fait quoi ? → Le planigramme (lire) → Le planigramme (replacer) →
Les documents du camion → Messagerie (rendre compte)** → bilan.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.4 (provisoire) |
| `id` (jamais modifié ensuite) | `action-avant-noel` |
| Titre / desc | « Action — la semaine avant Noël » / « Repérer les lieux d'une réception, dire qui fait quoi, trouver et corriger une erreur du planigramme, reconnaître les documents du camion et rendre compte à son tuteur. » |
| Rubrique | simulog, entreprise n° 8 Action |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competences: []`, `competencesCap: ['CAP-C1.2']` ; sous-compétences : C1.2.1 planigramme · C1.2.2 repérer le poste · C1.2.3 missions de l'équipe · C1.2.4 contrat de vente et documents · C1.2.5 conditions de mise en œuvre · C1.2.6 rendre compte. Ligne `'ENT-8.4': 'CAP-C1.2'` dans `ATTENDU_CAP` : **le dire à Tristan**. |
| Temps pédagogique | `temps: 'entrainement'`, avec une **erreur induite** (le camion mal placé par Romain) |
| Notation | jalons pondérés, note sur 20, `parcours: true`, `correction: true`, `bilanDetail: true`, `precedente: 'action-autre-site'` |
| Barème | `bareme: 20` |
| Niveaux d'élève | `niveauxPrevus: ['confirme']` (Accompagné : contenu standard) |
| `questions` | `'ENT-8.4'` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

- **Vérifié** : voir ENT-8.3 §2 (Labastide, GXO, Action). **Non vérifié** : les volumes du pic de Noël chez Action (rien de publié) → **tout
  chiffre de la séance est construit**.
- **Texte de référence de la question Q** (vérifié le 16/10/2026) : **convention-type nationale de PFMP** (DGESCO, version de septembre 2023,
  « Convention-type PFMP et annexes », [éduscol](https://eduscol.education.fr/document/51185/download)) :
  - art. 8 : « tous les élèves sont soumis à la durée hebdomadaire légale ou conventionnelle si celle-ci est inférieure à la durée légale » ;
  - art. 10 (élève mineur) : « La durée de travail de l'élève mineur ne peut excéder 8 heures par jour et 35 heures par semaine » ; pause
    d'au moins 30 minutes au-delà de 4 h 30 de travail ; pas de travail de nuit.
  - **Recopier mot à mot depuis le PDF d'éduscol** à la construction (date de consultation en pied) ; ne rien citer d'un modèle de lycée.
- **Construit (à dire dans la séance)** : le plan de la réception de Labastide (**rien n'est repris du livret d'accueil GXO publié**), les
  collègues de Romain et leurs prénoms, la grille du planigramme et l'erreur de Romain, les documents (fournisseur et transporteur aux noms
  construits), l'état du quai, les horaires.
- **Images** : celles de `contenus/images/action/` ; la photo du **chariot élévateur** (nouvelle, libre, sans visage ni marque) pour « Avant de
  commencer » ; le pictogramme du point de rassemblement dessiné pour ENT-8.3 (réutilisé dans le plan).
- **Documents reconstitués** : pied « Document pédagogique — reconstitution, non contractuel ».

## 3. Objectif pédagogique

L'élève **reprend seul** ce qu'il a vu avec Samia en ENT-8.2, sur un autre site et un jour chargé : il repère les lieux d'une réception sur un
plan, dit qui fait quoi, lit un planigramme plein, **y trouve une erreur et la corrige**, reconnaît les documents du camion et vérifie qu'on
peut ouvrir le camion, puis **rend compte** de ce qu'il a fait. Deuxième temps (entraînement) de CAP-C1.2 ; évaluation C1.1 + C1.2 en janvier.

## 4. Déroulé (≈ 45 min)

### Étape 0 — Avant de commencer (non notée, Romain) — voir §4 ter

### Accueil (premier message de Romain, proposé)

« Bonjour {prénom}. Aujourd'hui, c'est la semaine avant Noël : les magasins vendent beaucoup, les camions arrivent sans arrêt. Tu es à la
réception avec moi. Je te donne les consignes, ensuite tu travailles seul et tu me rends compte. On commence par le plan. Romain »

### Étape 1 — Repérer mon poste (une fiche, plan dessiné à gauche)

- **À gauche, en grand** (`largeurDocs` ≥ 1,5 ; retour de classe du 16/10 : le plan d'ENT-8.2 était trop petit) : **plan de la réception de
  Labastide**, dessiné (SVG, noir et blanc lisible), **8 lieux numérotés 1 à 8 sans nom**, chacun avec un **indice dessiné** :

  | Lieu | Indice dessiné (aucun mot) |
  |---|---|
  | un quai | une porte numérotée au bord du bâtiment, un camion reculé contre elle |
  | le vestiaire | des casiers, près de l'entrée du personnel |
  | le point de rassemblement | **dehors**, le pictogramme redessiné (ENT-8.3) |
  | la zone de contrôle | une table et des palettes ouvertes, entre les quais et le stock |
  | le bureau du chef d'équipe | un bureau et une chaise, vitré sur la réception |
  | le local de charge | des transpalettes alignés contre un mur, un éclair (prise) |
  | la zone de retours | des rolls et palettes marqués d'une flèche de retour, près d'un quai |
  | la zone litiges | des palettes marquées d'un « ! », à l'écart |

- **Consigne** (Romain) : « Sur le plan, trouve le numéro de chaque lieu. »
- **Fiche « Repérer mon poste »** : `liste` × 4 lieux tirés (§6 bis), « {Lieu} : n° [1 à 8] ».
- Jugée au bilan (pas au premier essai : c'est une fiche, « Corriger » la rouvre).

### Étape 2 — Qui fait quoi ? (une fiche)

- **Message de Romain** (`apresFiche('reperer')`) : « Voici l'équipe d'aujourd'hui. Pour chaque tâche, choisis qui la fait. Romain »
- **À gauche** : document « L'équipe de la réception » (4 cartes **sans visage** : un pictogramme de métier et un prénom) : **Romain, chef
  d'équipe** · **{cariste}**, cariste · **toi, réceptionnaire** · **{agent}**, agent administratif (prénoms : §11 question 1).
- **Fiche** : `liste` × 3 tâches tirées (+ 1 bonus chez un confirmé) ; 4 choix, ordre fixe de l'équipe.

### Étape 3a — Le planigramme : lire et trouver l'erreur (une fiche, grille à gauche)

- **Message de Romain** (`apresFiche('qui-fait-quoi')`) : « J'ai fait le planigramme de ce matin hier soir, trop vite. Je crois qu'un camion
  est mal placé. Lis-le et dis-moi lequel. Romain »
- **À gauche** : document « Planigramme du jeudi 17 décembre » (quais × heures), **fabriqué à partir des mêmes données que le planning**
  (§6.1), **avec le camion de Romain dessiné à sa place fausse**.
- **Fiche « Le planigramme »** :
  - une **lecture** tirée (`liste`, §6 bis ; + 1 bonus chez un confirmé) ;
  - « **Quel camion Romain a-t-il mal placé ?** » (`liste`, 4 choix : le juste et 3 autres camions de la grille, calculés).
- Question **R** au choix de la 2e ligne (`fiche:planigramme:trouve`), tout de suite.

### Étape 3b — Le planigramme : replacer le camion (vue Planning)

- **Message de Romain** (`apresFiche('planigramme')`) : « Trouve-lui un créneau libre, avant midi. Romain »
- **Planning** `action-labastide-quais` : la grille du §6.1 (`occupe`, `unAlaFois`, `fenetre`) ; **le camion de Romain est posé à sa place
  fausse** et l'élève le **déplace** (si le moteur ne sait pas pré-placer une carte mobile : §7, repli). Envoi → accusé de Romain (« Merci,
  je préviens le transporteur. »), sans dire si c'est juste.
- Question **Q** à la pose (`planning:action-labastide-quais:poser`), tout de suite.

### Étape 4 — Les documents du camion (une fiche, quatre documents à gauche)

- **Message de Romain** (après l'envoi du planning) : « Le camion du Havre est au quai 2. Voici ses documents et ce que {cariste} a noté au quai.
  Romain »
- **À gauche, en onglets** : **bon de commande** (Action → un fournisseur de jouets, nom construit, n° et **{N} cartons** tirés), **bon de
  livraison** (**{N − k} cartons**), **lettre de voiture** (transporteur construit, expéditeur « hub d'import Action, Gonfreville-l'Orcher »,
  destinataire « entrepôt Action / GXO, Labastide-Saint-Pierre », « jeudi 17 décembre ») et **« Le quai 2 à 6 h 40 »** (note du cariste, 4 lignes :
  « Chaussures et gilet : OK. Transpalette : chargé. Bon de livraison : reçu du chauffeur. Devant la porte : 12 palettes de retours des
  magasins, pas encore rangées. »).
- **Fiche « Les documents du camion »** (une seule fiche, deux parties — en 8.2 c'étaient deux fiches) :
  - 2 questions tirées parmi 3 (`liste`) : « Quel document dit ce qu'Action a commandé ? » / « … ce que le camion apporte ? » / « … qui
    transporte la marchandise ? » ; choix : les 3 documents + « la facture » ;
  - « **Peut-on ouvrir le camion maintenant ?** » (`choix`) : **non : le quai est encombré par les palettes de retours** · oui, tout est prêt ·
    non : il manque le bon de livraison · non : je n'ai pas mes EPI ;
  - « **Que fais-tu d'abord ?** » (`choix`) : **je fais dégager le quai et je préviens Romain** · j'ouvre quand même et je pose les palettes du
    camion à côté · j'attends que le chauffeur range les retours · je repars au vestiaire.
- Question **S** à l'envoi, tout de suite.

### Étape 5 — Rendre compte à Romain (Messagerie, réponse par phrases)

- **Message de Romain** (`apresFiche('documents')`) : « Avant que je parte en réunion, rends-moi compte du planigramme : ce qui n'allait pas et
  ce que tu as fait. Romain »
- **Réponse par phrases** (§6.3) : salutation · le conflit · le nouveau créneau · fin. Le « nouveau créneau » **juste est celui que l'élève a
  posé** (rendre compte = dire ce qu'on a fait) : un élève qui a mal replacé le camion perd les points du planning, pas ceux du compte rendu.

### Fin

- **Romain** : « Merci {prénom}, c'est clair. Bon courage pour la journée, ça va être long ! Romain »
- Premier bilan → bandeau détaillé ; « Corriger » rouvre les fiches fausses, le planning et la réponse par phrases ; `finFige` : « Les
  questions de Romain se jouent au premier essai : elles ne se rejouent pas. »

**Mots cliquables** : planigramme, créneau, quai, zone de retours, point de rassemblement, local de charge, réceptionnaire, bon de commande,
bon de livraison, lettre de voiture, rendre compte, convention de stage.

## 4 bis. Questions au fil — **tranché par Tristan le 15/10/2026 : Q, S, R** (U et T écartées)

Fichier `contenus/questions/ENT-8.4.js`, `part: 4`, personne : Romain. Ligne du bandeau : « Les questions de Romain ». Texte de loi **dans
l'énoncé** (le panneau ne montre pas de document).

| id | Geste | Qui pose | Question | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| `heure-de-plus` (Q) | `planning:action-labastide-quais:poser` | Romain | « Avec tous ces camions, je te demande de rester une heure de plus ce soir. Ta convention de stage dit : “tous les élèves sont soumis à la durée hebdomadaire légale” et, pour un mineur, “8 heures par jour et 35 heures par semaine” au plus. Qui fixe la durée de ton travail en stage ? » — **ta convention de stage, qui fixe aussi des limites** (`convention`) · Romain, c'est lui qui décide (`romain`) · Action, c'est son magasin (`action`) · personne : avant Noël, il n'y a pas de limite (`personne`) | fil | **1,5** | tout de suite | droit appliqué au cas (convention de PFMP, texte national cité) ; ne touche aucun jalon |
| `qui-doit-livrer` (S) | `fiche:documents:envoyer` | Romain | `selon` : « Le bon de commande dit {N} cartons, le bon de livraison {N − k}. Ce que le fournisseur devait livrer est écrit sur… » — **le bon de commande : c'est ce qu'il a promis en vendant** (`commande`) · le bon de livraison (`bl`) · la lettre de voiture (`lv`) | fil | **1,5** | tout de suite | reprise de la question I d'ENT-8.2, **sans le texte de loi** (entraînement) ; chiffres tirés, les mêmes que **ses** documents ; après l'envoi : ne donne plus rien |
| `pourquoi-decembre` (R) | `fiche:planigramme:trouve` | Romain | « Pourquoi y a-t-il tant de camions en décembre ? » — **avant Noël, les magasins vendent plus : il leur faut plus de produits** (`noel`) · les chauffeurs ont plus de temps (`temps`) · il fait froid, les camions roulent moins vite (`froid`) | fil | **1** | tout de suite | environnement économique (saisonnalité) ancré sur sa grille ; ne dit pas quel camion est mal placé |

- **Retours proposés** : Q : « C'est ta convention : elle fixe tes horaires, avec des limites. Je ne peux pas te garder plus longtemps comme ça.
  Merci quand même ! » · S : « Le bon de commande : c'est ce qu'Action a acheté. Le fournisseur doit les {k} cartons qui manquent. » · R :
  « Avant Noël, les magasins vendent beaucoup plus : il faut les remplir, donc plus de camions. »
- Poids : Q 1,5 · S 1,5 · R 1 → 4.

## 4 ter. Avant de commencer — **validé par Tristan le 15/10/2026**

Bloc `ouverture` (Romain), `tirage: { preparation: 3, image: 1 }`. Non notées, sans le dire.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `creneau` | préparation | Un créneau de réception, c'est… | une heure réservée pour un camion à un quai | une pause · un jour férié | — | ★ |
| `zone-retours` | préparation | La zone de retours sert à… | recevoir ce que les magasins renvoient | ranger les EPI · garer les camions | — | ★ |
| `rassemblement` | préparation | Quand l'alarme sonne, tu vas… | au point de rassemblement | à ton poste · au vestiaire | — | ★ |
| `planigramme` | préparation | Un planigramme de réception montre… | quel camion arrive, à quelle heure, à quel quai | les salaires · les produits du magasin | — | |
| `rendre-compte` | préparation | « Rendre compte », c'est… | dire à son chef ce qu'on a fait ou vu | rendre un colis · compter les palettes | — | |
| `cariste` | préparation | Un cariste… | conduit un chariot élévateur, avec son CACES | conduit le camion · tient la caisse du magasin | — | |
| `consigne` | préparation | Une consigne que tu ne comprends pas, tu… | la fais répéter par ton tuteur | la devines · l'ignores | — | |
| `img-transpalette` | image | Comment s'appelle cet engin ? | un transpalette | un chariot élévateur · un gerbeur | photo `transpalette` | |
| `img-chariot` | image | Comment s'appelle cet engin ? | un chariot élévateur | un transpalette · un camion | photo libre (nouvelle) | |
| `img-niveleur` | image | Cette plaque au bord du quai sert à… | passer du quai au camion avec l'engin | bloquer les roues · peser la palette | comme ENT-8.2 | |

- Écartées (Tristan) : « deux camions au même quai en même temps ? » (donnerait l'erreur), pic de Noël (R), lettre de voiture (étape 4),
  convention (Q).
- `img-transpalette` et `img-chariot` ne tombent jamais ensemble chez un même élève (une seule image tirée : rien à faire).

## 5. Jalons / notation (sur 20) — **poids des blocs validés par Tristan le 15/10/2026**

| Bloc (ligne du bandeau) | Cases (un jalon chacune) | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Repérer mon poste** | 4 lieux tirés, 0,625 chacun | **2,5** | fiche `reperer` | `titreBilan` : le **nom du lieu** (ordre tiré), jamais le numéro |
| **Qui fait quoi ?** | 3 tâches : facile 0,75 · moyenne 0,75 · difficile 1 (§11 question 2) | **2,5** | fiche `qui-fait-quoi` | 3 personnes différentes dans le socle ; `titreBilan` : la tâche |
| **Le planigramme** | lecture 1 ; camion trouvé 1,5 ; camion replacé 2 | **4,5** | fiche `planigramme` ; `etapesPlanning` (règles `quai`, `fenetre`) | « replacé » : faux tant que le camion n'est pas **déplacé** sur un créneau libre (le laisser à sa place fausse = faux : **aucun point pour l'inaction**) |
| **Les documents du camion** | 2 documents 1 chacun ; « peut-on ouvrir ? » 1 ; « que fais-tu ? » 1 | **4** | fiche `documents` | — |
| **Rendre compte** | conflit 0,75 ; nouveau créneau 0,75 ; salutation 0,5 ; fin 0,5 | **2,5** | réponse par phrases | « nouveau créneau » jugé contre **ce que l'élève a posé** (comme l'alerte 14) ; forme = 1 point (5 %) |
| **Les questions de Romain** | Q 1,5 · S 1,5 · R 1 | **4** (`part: 4`) | moteur des questions | — |
| **Total** | | **20** | | |

- **Corriger** : `ecran: 'fiche:reperer'`, `'fiche:qui-fait-quoi'`, `'fiche:planigramme'`, `'planning:action-labastide-quais'`,
  `'fiche:documents'`, `'phrases:<id du message>'`. Si l'élève corrige le planning, la ligne « nouveau créneau » du compte rendu est
  rejugée contre la nouvelle place (et le dire dans le compte rendu du brief si le moteur ne le permet pas).
- **Confirmé** : 1 tâche et 1 lecture bonus (`bonus: true`) ; bandeau identique.
- **Anti-inaction** : rien fait = 0/20.

## 6. Contenu (données)

- `contenus/action.js` : y ajouter le **plan de Labastide** (il resservira à l'évaluation) et l'équipe de Labastide.
- `contenus/action-ent84.js` (+ `-donnees.js` si besoin), `contenus/questions/ENT-8.4.js`, `activites/action-avant-noel.js`,
  `contenus/corriges/ENT-8.4.js` (par élève : ses lieux, tâches, lecture, N et k, le camion fautif et les créneaux libres, ses phrases justes).

### 6.1 Le planigramme (grille **identique pour toute la classe**, comme ENT-8.2 ; proposition à vérifier par le code)

Planning `action-labastide-quais`, échelle `{ type: 'heures', debut: '06:00', fin: '12:00', pas: 30 }`, lignes **Quai 1 à Quai 4**,
camions en `occupe`, `unAlaFois`, `fenetre`. Noms **génériques** (aucune entreprise réelle).

| Quai | Déjà prévu (`occupe`) |
|---|---|
| Quai 1 | 06:00–07:30 jouets · 07:30–09:00 décorations de Noël · 09:30–11:00 confiserie |
| Quai 2 | 06:00–07:00 retours des magasins · 07:00–08:30 **camion du Havre** · 08:30–10:00 bougies · 10:30–12:00 papeterie |
| Quai 3 | 06:30–08:00 produits ménagers · 09:00–10:30 vaisselle |
| Quai 4 | 06:00–08:00 camion du Havre (2e) · 08:00–09:30 textile · 10:00–11:30 jeux de plein air |

- **Erreur de Romain** : « **Jeux de société — 1 h 30** » posé **Quai 3, 07:30–09:00** : il chevauche les produits ménagers (07:30–08:00).
- **Créneau libre de 1 h 30 avant 12:00** : sur cette grille, **Quai 3, 10:30–12:00** seulement (la semaine est saturée). Le jalon juge les
  **règles** (quai libre, fin avant 12:00), pas une place.
- **Contrôle au chargement** (dans le contenu) : une seule paire en conflit ; au moins un créneau libre ; chaque lecture de la banque a une
  seule bonne réponse. Si la grille ne tient pas, l'ajuster et le dire.
- **Quai 2 / camion du Havre** : c'est le camion des documents de l'étape 4 et de la note du quai.

### 6.2 Les documents (reconstitués)

Comme ENT-8.2 §6.2 (bon de commande, bon de livraison, lettre de voiture), avec Labastide et GXO, un fournisseur de **jouets** au nom construit,
« jeudi 17 décembre », et la note « Le quai 2 à 6 h 40 » (§4, étape 4). Pied « Document pédagogique — reconstitution, non contractuel ».

### 6.3 Rendre compte (réponse par phrases, textes proposés)

| Ligne | Choix (juste en gras) |
|---|---|
| salutation | **Bonjour Romain,** · Salut mon pote, · Monsieur le directeur, |
| le conflit | **Le camion de jeux de société était au quai 3 en même temps que les produits ménagers.** · Le camion de jeux de société était au quai 2 en même temps que le camion du Havre. · Il n'y avait aucun problème sur le planigramme. |
| le nouveau créneau | **Je l'ai mis au {quai posé} de {début} à {fin}.** (calculé sur le planning de l'élève) · deux autres créneaux de la grille (calculés, différents de sa pose) · Je ne l'ai pas déplacé. |
| fin | **Je reste à la réception. {prénom}** · Bisous · (rien) |

- Si l'élève n'a **pas** déplacé le camion, la phrase juste devient « Je ne l'ai pas déplacé. » (il rend compte honnêtement) ; le planning,
  lui, est faux.

## 6 bis. Tirage et niveaux (règle du 08/10/2026)

### Banque `lieux` — fiche « Repérer mon poste » (plan fixe, 8 lieux)

| id | Lieu | Difficulté |
|---|---|---|
| `l-quai` | Un quai | facile |
| `l-vestiaire` | Le vestiaire | facile |
| `l-rassemblement` | Le point de rassemblement | facile |
| `l-controle` | La zone de contrôle | moyen |
| `l-bureau` | Le bureau du chef d'équipe | moyen |
| `l-charge` | Le local de charge des transpalettes | moyen |
| `l-retours` | La zone de retours | difficile |
| `l-litiges` | La zone litiges | difficile |

Socle `{ facile: 1, moyen: 2, difficile: 1 }` → 4 lieux. Les numéros du plan sont fixes. Ordre des lignes mélangé.

### Banque `taches` — fiche « Qui fait quoi ? »

Les 8 tâches d'ENT-8.2 (§6 bis de son brief), avec Romain à la place de Samia et les prénoms de Labastide, **plus** :

| id | Tâche | Qui | Difficulté |
|---|---|---|---|
| `t-retours` | Trier les palettes renvoyées par les magasins. | toi, réceptionnaire | moyen |
| `t-changer-rdv` | Changer l'heure d'un rendez-vous au planigramme. | {agent}, agent administratif | moyen |

Socle `{ facile: 1, moyen: 1, difficile: 1 }` ; bonus confirmé `{ moyen: 1 }`. `verifier` : 3 personnes différentes.

### Banque `lectures` — fiche « Le planigramme » (réponses **calculées** sur la grille du §6.1)

| id | Question | Réponse sur la grille proposée | Difficulté |
|---|---|---|---|
| `l-retours-quai` | À quel quai arrivent les retours des magasins ? | quai 2 | facile |
| `l-q2-dernier` | Quel camion arrive le dernier au quai 2 ? | papeterie | facile |
| `l-q1-10h` | Quel camion est au quai 1 à 10 h ? | confiserie | moyen |
| `l-havre-combien` | Combien de camions du Havre arrivent ce matin ? | 2 | moyen |
| `l-q4-premier` | Quel camion libère le quai 4 en premier ? | camion du Havre (2e), 8 h | difficile |
| `l-total` | Combien de camions sont prévus ce matin, sans celui de Romain ? | 12 | difficile |

Socle `{ facile: 1 }` ou `{ moyen: 1 }` (une lecture, tirée parmi les 4 premières) ; bonus confirmé `{ difficile: 1 }`. Aucune lecture ne porte
sur le quai 3 entre 7 h 30 et 9 h (elle montrerait l'erreur).

### Banque `commande` — documents et question S

Comme ENT-8.2 : n° de commande tiré, **N** multiple de 24 entre 720 et 1 440, **k** multiple de 24 entre 24 et 96 ; mêmes valeurs dans les
documents et dans S.

### Le reste

- Plan, grille, erreur de Romain, note du quai, phrases (hors créneau) : pièces fixes ; ordre des choix mélangé.
- **Accompagné** : contenu standard. **Consignes neutres** (aucune ne dit le nombre de lignes tirées).

## 7. Demandes au moteur — état des lieux d'abord (le dire à Tristan avant de contourner)

1. **Carte pré-placée et mobile dans le Planning** : le camion de Romain posé au départ sur sa place fausse, que l'élève déplace. **Repli** si
   le moteur ne sait pas : la place fausse dessinée en `occupe` hachuré « Jeux de société (place de Romain) », et une carte « Jeux de société —
   1 h 30 » à poser ; le jalon « replacé » juge la pose. Dire lequel est construit.
2. **Phrases calculées sur le travail de l'élève** (ligne « nouveau créneau ») : une ligne de réponse par phrases peut-elle être `(db) => …` ?
   Sinon, demande au moteur (petite) ou repli : trois créneaux fixes + « autre créneau » : **le dire à Tristan avant**.
3. **Rejuger une ligne de phrases après un « Corriger » du planning** (§5) : à vérifier ; si non, la ligne reste jugée sur la première pose
   et c'est dit dans le compte rendu.
4. **Plan dessiné en grand dans une fiche** sur un écran du lycée (`largeurDocs`, `defile`) : vérifier à 1366 × 768.
5. **`suite`** avec deux écrans pour l'étape 3 (fiche puis planning) et un dernier écran en Messagerie.

### 7 bis. Séance déjà jouée par des élèves ?

Non : séance nouvelle.

## 8. Tests attendus

Bloc nouveau `outils/test/action-84.mjs` (+ une ligne dans `BLOCS` et `GROUPES` : **le dire à Tristan**) ; ligne `ATTENDU_CAP`.

- **Parcours juste** : 20/20, bandeau à 6 lignes ✓. **Inaction** : 0/20 (camion laissé à la place de Romain = faux). **Tout faux** : premier
  bilan atteint.
- Un écran par étape : la grille est à gauche de la fiche « Le planigramme » ; les quatre documents à gauche de la fiche des documents.
- Planning : camion au Quai 3 à 10 h 30 → ✓ ; au Quai 3 à 7 h 30 (place de Romain) → ✗ ; au Quai 1 à 9 h → ✗ (pris) ; au Quai 3 à 11 h → ✗
  (finit après midi). Contrôle de la grille : une seule paire en conflit, au moins un créneau libre (valeurs écrites à la main).
- Rendre compte : élève qui a posé au Quai 2 à 10 h (faux) et qui écrit « Je l'ai mis au quai 2 de 10 h à 11 h 30 » → ligne créneau ✓,
  planning ✗ ; élève qui n'a rien déplacé et choisit « Je ne l'ai pas déplacé. » → ligne ✓.
- Documents : « oui, tout est prêt » → ✗ ; « la facture » → ✗.
- Questions : S affiche **ses** N et k (300 graines) ; R au choix du camion ; Q à la pose ; part 4.
- Repérer : `titreBilan` donne le lieu, jamais le numéro.
- Confirmé : 4 tâches, 2 lectures, bandeau identique. Parcours : fermée tant qu'ENT-8.3 n'a pas son premier bilan.
- Sabotages : la règle `quai` retirée → le cas « place de Romain » tombe ; phrase « créneau » jugée contre la bonne réponse au lieu de la pose de
  l'élève → le cas « Quai 2 à 10 h » tombe.

## 9. Supports pour les élèves

- **Trame** (Cowork, après validation à l'écran) : connexion, mission ; **brouillon** : la grille vierge pour recopier le planigramme et
  chercher le créneau ; **cours** à part (« distribué à la fin ») : les lieux d'une réception, la convention de stage (durée), saisonnalité.
  Noir et blanc.
- **Corrigé enseignant** : `contenus/corriges/ENT-8.4.js`.

## 10. Critères de validation par Tristan

- Le plan se lit sur un écran du lycée sans zoomer ; chaque lieu se devine par son dessin.
- On voit le camion mal placé sur la grille sans qu'il soit signalé.
- On ne change d'écran qu'entre deux étapes (sauf 3a → 3b, relié par la barre).
- 45 minutes suffisent.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [ ] **1. Prénoms des collègues de Labastide** (construits) : (défaut : **Lucas**, cariste ; **Inès**, agent administratif).
- [ ] **2. Partage des 2,5 points de « Qui fait quoi ? »** entre 3 tâches : (défaut : facile 0,75 · moyenne 0,75 · difficile 1, comme les
  situations d'ENT-8.1). À valider par Tristan avant codage (règle du 10/10).
- [ ] 3. Partage des 2,5 points de « Rendre compte » : conflit 0,75 · créneau 0,75 · salutation 0,5 · fin 0,5 (contenu 1,5 + forme 1, comme
  validé ; le partage interne est une proposition).
- [ ] 4. Textes construits par Cowork (messages, note du quai, phrases, retours) : à relire à l'écran.
- [x] Un écran par étape (Tristan, 16/10) ; étape 3 en deux écrans, assumé.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `contenus/action-ent84-donnees.js` (données pures : plan de Labastide en SVG, équipe, grille, contrôle,
  banques et tirage, phrases calculées), `contenus/action-ent84.js` (documents, fiches, planning, messages, jalons, options),
  `contenus/questions/ENT-8.4.js`, `contenus/corriges/ENT-8.4.js`, `activites/action-avant-noel.js` (squelette remplacé, `pret: true,
  ouverture: 'prof'`), `outils/test/action-84.mjs` (19 cas, nouveau bloc) ; lignes ajoutées : `outils/test.mjs` (`action-84` dans `BLOCS` et
  `GROUPES[3]`, **alerte 7**), `outils/test/tirage-niveaux.mjs` (`BANQUES_FIGEES` de `action-ent84-donnees.js`). Rien dans `core/` ni
  `contenus/action.js` (décision §6.3 du chef de chantier).
- **Écarts par rapport au brief** (et pourquoi) :
  - §6 : le plan et l'équipe de Labastide vivent dans `action-ent84-donnees.js` (`PLAN_LABASTIDE`, `LIEUX_PLAN`, `EQUIPE_84`), pas dans
    `contenus/action.js` (décision §6.3) ; l'évaluation de janvier les importera de là.
  - §6.1 : échelle **06:00–13:00** (et non 12:00), pour que la règle « avant midi » puisse se déclencher (décision §6.3) ; le document du
    planigramme montre la même échelle (12 h – 13 h vide). La grille du brief tient telle quelle : une seule paire en conflit (jeux de société
    / produits ménagers), un seul créneau libre (quai 3, 10 h 30 – 12 h), une bonne réponse par lecture — contrôlé au chargement.
  - §4, étape 3a : « Quel camion Romain a-t-il mal placé ? » ne propose **jamais les produits ménagers** : les deux camions se recouvrent et
    rien ne dit lequel a été mal posé ; les trois pièges sont des camions hors conflit (vaisselle, décorations de Noël, camion du Havre),
    calculés. Sans cela la question avait deux bonnes réponses.
  - §6.3, ligne « fin » : le choix « (rien) » est remplacé par « À plus. » (une phrase vide n'est pas un choix lisible dans une liste ; comme
    ENT-8.2). La ligne « nouveau créneau » propose toujours 4 choix : sa pose (ou, s'il n'a rien bougé, un troisième créneau de la grille),
    deux autres créneaux de la grille, « Je ne l'ai pas déplacé. ».
  - §4, étape 4 : les documents sont à gauche de la fiche, pas joints au message (§0 bis : jamais « ouvre le document X »).
  - Banques : les deux questions « Quel document… ? » sont tirées dans une banque `documents` (3 pièces, 2 tirées), inscrite dans
    `BANQUES_FIGEES` ; lectures : les 4 du socle en `facile`, les 2 dernières en `difficile` (décision §6.3).
- **Décisions prises en route** :
  - Planning : la carte « Jeux de société — 1 h 30 » porte `depart: { ligne: 'Q3', de: '07:30' }` (correctif moteur 55cb2c3). Un seul jalon de
    planning, « le camion replacé » (règles `quai` + `fenetre`, 2 points) : laissé à sa place = faux. Le planning est **grisé au menu**
    (`fermetures`) jusqu'à l'envoi de la fiche « Le planigramme ». « Vérifier mon planning » reste disponible (défaut du moteur en
    entraînement) : **à juger par Tristan** (`aides.verifier: false` le retire).
  - Jalon « nouveau créneau » (§6.3) : la phrase choisie au dernier envoi est comparée à la phrase recalculée sur le planning **envoyé**
    courant (`v1`) ; si elle n'est pas parmi les choix du mail (planning corrigé ensuite vers une autre place), ou pendant une correction du
    planning, on juge sur la phrase juste du moment du compte rendu. Le §5 « rejuger après Corriger » est donc fait, dans ces limites. Carte
    retirée puis planning envoyé : la phrase juste reste « Je ne l'ai pas déplacé. » (cas limite).
  - Documents « plan » et « planigramme » élargis à toute la colonne par `&:has(…){width:100%}` dans `documentsStyle` (la feuille de papier
    fait 560 px ; le plan y était trop petit). Plan : `largeurDocs: 1.6`, ≈ 650 px de large à 1366 × 768, tient sans défiler.
  - Plan : les portes de quai portent « Q1 » à « Q4 » (sans rond) ; la légende dit que seuls les ronds numérotés sont les lieux à trouver.
    Numéros fixes : contrôle 1, vestiaire 2, quai 3, local de charge 4, point de rassemblement 5, litiges 6, bureau 7, retours 8.
  - Planigramme : deux camions qui se recouvrent sont dessinés sur **deux rangs du même quai** (quai 3), même style que les autres.
  - Domaine des mails `gxo-labastide.example` ; `ENTREPRISE.sousTitre` « Entrepôt GXO de Labastide-Saint-Pierre (82) » (export de la séance).
  - Convention de PFMP (Q) : citations reprises du brief (vérifiées par Cowork sur le PDF d'éduscol le 16/10/2026), **non relues par Claude
    Code** ; source et date dans l'en-tête de `contenus/questions/ENT-8.4.js`.
  - Construit (commentaires du code et `MENTION` de l'accueil) : plan, Romain, Lucas, Inès, tâches, grille et camions, fournisseur « Jouets
    Clairbois », transporteur « Transports Estuaire-Garonne », article, quantités, note du quai, horaires. Vérifié (ENT-8.3 §2) : Labastide,
    GXO, Action, hub du Havre.
- **Tests** : bloc `action-84` 19/19 (≈ 40 s) ; `tirage-niveaux` et `action` verts (65/65 avec `action-84`) ; `questions` et `dependances`
  verts ; `socle` : un cas tombe (« CAP-C1.1 : 10/20 (1/5) »), recalé par le chantier ENT-8.3, pas par celui-ci. Sabotages : règle `quai`
  retirée du jalon → 5 cas tombent dont « place de Romain » ; ligne « créneau » jugée contre la bonne place → 5 cas tombent dont « quai 2 à
  10 h » ; poids « replacé » et « trouvé » échangés → le cas « quai 2 à 10 h » à l'écran tombe (18,5 au lieu de 18), et le cas de déclaration
  pose maintenant les poids jalon par jalon.
- **Commits** : aucun (le chef de chantier commite).
- **Reste ouvert** :
  - **Textes construits à relire à l'écran par Tristan** : les messages de Romain, la note « Le quai 2 à 6 h 40 », les phrases du compte rendu,
    les retours des questions, les 10 questions « Avant de commencer », les quatre définitions nouvelles du lexique (zone de retours, point de
    rassemblement, local de charge, convention de stage), les consignes en haut d'écran, les noms construits du fournisseur et du transporteur.
  - À juger à l'écran : le plan (chaque lieu se devine-t-il ?), le camion de Romain visible sans être signalé, « Vérifier mon planning » gardé
    ou non, 45 minutes.
  - Les messages ENVOYÉS par l'élève portent la date réelle (limite connue du moteur).
  - Trame et cours (Cowork, après validation à l'écran).
