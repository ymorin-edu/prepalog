# Brief de séance — ENT-8.2 Action — ma prise de poste à la réception (CAP OL, guidage CAP-C1.2)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md puis docs/briefs/ENT-8.2-action-prise-de-poste.md en entier. Vérifie d'abord qu'ENT-8.1 est livrée (univers contenus/action.js), puis fais la demande au moteur du §7.1 (deux lieux de visite : vestiaire et zone de contrôle) et l'état des lieux du §7.2, puis la séance. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : livré (15/10/2026, `pret: true, ouverture: 'prof'` — à essayer à l'écran avant de l'ouvrir au groupe)
**Date du brief** : 15/10/2026
**Conversation d'origine** : Cowork (Opus), cadrage d'Action du 15/10/2026 — fiches du projet `claude/prepalog-action-cadrage.md` et
`claude/prepalog-action-deroule-8.1-8.2.md` (décisions de Tristan de 19 h 09 à 19 h 20), plus deux décisions du 15/10 au soir (§11).
**Modèle** : **Opus** (séance nouvelle de bout en bout). La demande du §7.1 seule : Sonnet suffit.
**Place dans l'ordre** : après ENT-8.1 (`docs/briefs/ENT-8.1-action-se-situer.md`) et la demande du §7.1.
**Durée estimée par Cowork** : demande du §7.1 ≈ 1 h (tests compris) ; séance ≈ 6 à 7 h, dont **≈ une demi-journée pour le contenu lourd** :
le plan de la réception (construit), 6 à 7 photos libres, 3 documents reconstitués. Le reste : cinq fiches, le planning, la réponse par phrases,
les questions, les tests.

---

## 0. Règles communes à Action (CAP OL)

Celles du §0 d'ENT-8.1 (public CAP : une consigne par écran, 3 lignes au plus, tout en cliquant ; stagiaire en PFMP chez Geodis à
Ensuès-la-Redonne ; Samia tutrice, Kevin cariste, Julie agent administratif — construits ; aucune année ; « Avant de commencer » sur les notions
du scénario ; jalons pondérés sur 20, questions au fil 4 points, `parcours`, `correction` ; jamais un élève bloqué ; ce qui est construit se dit
dans la séance). Plus, pour cette séance (décision 1 de la fiche des déroulés) : **le stagiaire tient son poste seul après les consignes de
Samia, qui reste sa tutrice** — le premier message le dit.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.2 |
| `id` (jamais modifié ensuite) | `action-prise-de-poste` |
| Titre / desc | « Action — ma prise de poste à la réception » / « Repérer son poste et l'équipe de la réception, lire le planigramme, reconnaître les documents du camion et rendre compte à sa cheffe d'équipe. » |
| Rubrique | simulog, entreprise n° 8 Action (ligne créée par ENT-8.1) |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competencesCap: ['CAP-C1.2']` (« Prendre un poste en autonomie ») ; sous-compétences visées : C1.2.1 planigramme de réception · C1.2.2 repérer le poste · C1.2.3 missions de l'équipe · C1.2.4 contrat de vente et documents · C1.2.5 conditions de mise en œuvre · C1.2.6 rendre compte. `competences` (Bac Pro) : comme ENT-8.1 (§11 n° 1 de son brief). Une ligne de plus dans la liste des séances CAP du socle : le dire. |
| Temps pédagogique | `temps: 'guidage'` (coefficient 1) |
| Notation | jalons pondérés, note sur 20, `parcours: true`, `correction: true`, `precedente: 'action-se-situer'` |
| Barème | `bareme: 20` |
| Niveaux d'élève | `niveauxPrevus: ['confirme']` (Accompagné : contenu standard) |
| `questions` | `'ENT-8.2'` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

- **Vérifié** : voir ENT-8.1 §2 (Action, Geodis à Ensuès, hub du Havre). En plus : offre France Travail « GEODIS/ACTION » à Ensuès
  (préparation vocale, filmage, mise à quai, CACES 1) ; métiers recrutés à Ensuès (opérateurs, caristes, inventoristes, chefs d'équipe,
  contrôleurs, agents administratifs) — fiche du projet `claude/prepalog-action-recherche.md`.
- **Textes de loi** (Cowork, 15/10/2026 au soir) :
  - **Code civil, art. 1604** : « La délivrance est le transport de la chose vendue en la puissance et possession de l'acheteur. »
    (texte d'origine de 1804, relu sur [Criminocorpus](https://criminocorpus.org/fr/legislation/droit/versions/932/1604/pdf/) ; **à
    recouper sur Légifrance** à la construction, avec l'art. 1603 : le vendeur a deux obligations principales, délivrer et garantir).
  - **Code du travail, art. L4111-5** : pour la partie « Santé et sécurité au travail », les travailleurs sont « les salariés, y compris
    temporaires, et les stagiaires », ainsi que toute personne placée sous l'autorité de l'employeur ([code.travail.gouv.fr](https://code.travail.gouv.fr/code-du-travail/l4111-5)).
  - **Code du travail, art. L4141-1** : « L'employeur organise et dispense une information des travailleurs sur les risques pour la santé et
    la sécurité » et sur les mesures prises ([code.travail.gouv.fr](https://code.travail.gouv.fr/code-du-travail/l4141-1)).
  - Convention de PFMP (modèle d'un lycée de l'académie de Versailles, [conditions générales](https://lyc-vinci-bagneux.ac-versailles.fr/IMG/pdf/condition-generale-convention-pfmp.pdf)) :
    l'organisme d'accueil accueille l'élève, qui « est informé des règles applicables dans l'établissement et notamment de celles relatives à
    la santé et à la sécurité » (art. 4) ; il évalue les risques et fournit les EPI (art. 12). **Un modèle de lycée, pas un texte national** :
    la séance cite le Code du travail ; la convention sert de repère pour Tristan.
  - **Recopier le texte exact depuis Légifrance** à la construction (les citations ci-dessus sont partielles pour L4111-5 et L4141-1).
- **Construit (à dire dans la séance)** : le **plan de la réception d'Ensuès**, le **planigramme** et ses camions, les **horaires de poste**,
  les **documents** (bon de commande, bon de livraison, lettre de voiture : noms de fournisseurs et de transporteur construits), le
  transpalette en charge, le trajet du camion du Havre (conteneurs d'Asie dépotés au hub et rechargés en camion).
- **Photos** : 6 à 7 **photos libres** (Pexels / Unsplash), **ni Action ni Geodis, sans visage**, mention sous chaque photo (« Photo d'un
  autre entrepôt »), ligne dans `CREDITS.md`, récupérées par script (alerte 10), dans `contenus/action/`.
- **Documents reconstitués** : pied « Document pédagogique — reconstitution, non contractuel ».

## 3. Objectif pédagogique

À la fin, l'élève sait **repérer son poste** et les zones de la réception, dire **qui fait quoi** dans l'équipe, **lire le planigramme** et y
**placer un camion**, reconnaître **les trois documents du camion**, vérifier **ce qu'il lui faut avant d'ouvrir un camion**, et **rendre
compte** à sa cheffe d'équipe. Premier temps (guidage) de CAP-C1.2, le lendemain d'ENT-8.1 ; la suite (C1.3, réception) commence par « on
décharge ensemble ». Entraînement et évaluation de C1.1 / C1.2 après la PFMP (séances à écrire).

## 4. Déroulé (≈ 50 min)

**Date du scénario : mardi 9 novembre, 6 h.**

### Étape 0 — Avant de commencer (non notée, Samia) — voir §4 ter

### Étape 1 — Repérer mon poste (plan d'entrepôt, mode `visite`, `premierEssai`)

- **Message de Samia** (6 h, proposé) : « Bonjour {prénom} ! Aujourd'hui, tu tiens le poste de réception. Je te donne d'abord les consignes,
  ensuite tu travailles seul ; je reste ta tutrice, tu me rends compte. / On commence par un tour de la réception. Ouvre « Visite de la
  réception ». Samia »
- **Visite** (`entrepot`, id `action-reception`, libellé « Visite de la réception », `mode: 'visite'`, `premierEssai: true`) sur le **plan
  construit** de la réception d'Ensuès (quais 1 à 4, zone de réception, zone de contrôle, zone litiges, bureau de la cheffe d'équipe,
  vestiaire ; allée principale) :
  - `accueil` : photo libre de quai, « Bienvenue à la réception », programme de la visite.
  - `parcours` numéroté, **6 arrêts** (décision de Tristan du 15/10 au soir : moteur complété, §7.1), une photo libre et 3 lignes chacun
    (textes proposés, **qui travaille là** à chaque arrêt) :

    | n | Ancre | Titre | Texte (qui travaille là) |
    |---|---|---|---|
    | 1 | `zone:vestiaire` (nouvelle) | Vestiaire et EPI | Tout le monde passe ici d'abord : chaussures de sécurité, gilet, gants. Personne n'entre sur le quai sans. |
    | 2 | `quai:Quai 2` | Les quais | Les camions s'y mettent à quai. **Kevin**, le cariste, les décharge au chariot. |
    | 3 | `zone:reception` | Zone de réception | Les palettes déchargées attendent ici. Les **réceptionnaires** (ton poste aujourd'hui) vérifient le bon de livraison. |
    | 4 | `zone:controle` (nouvelle) | Zone de contrôle | On compte les cartons et on regarde leur état avant de les ranger. |
    | 5 | `zone:litiges` | Zone litiges | Ce qui pose problème (abîmé, en trop, pas commandé) est mis de côté ici, avec une étiquette. |
    | 6 | `zone:bureau` | Bureau de la réception | **Samia**, cheffe d'équipe, organise le travail et décide en cas de problème. **Julie**, agent administratif, tient le planigramme et saisit les réceptions dans le WMS. |

  - `associer` « Où est-ce ? » : **4 photos** à associer chacune à un numéro du plan (jalon au premier essai, 0,75 chacune) ; comme ENT-5.3
    (`contenus/smoby-ent53.js`) pour le choix des photos (parmi les 6 à 7 photos libres de la séance).
  - `fin` : « Tu connais la réception. Maintenant, l'équipe. »
- Rien d'attendu n'est montré avant la réponse ; un clic faux ne bloque pas (l'élève recommence), le premier essai compte.

### Étape 2 — Qui fait quoi à la réception ?

- **Message de Samia** (fin de la visite, §7.2) : « Voici l'équipe de la réception. Pour chaque tâche, choisis qui la fait, puis renvoie-moi
  la fiche. Samia »
- **Fiche « Qui fait quoi ? »** (`liste` × 3 tirées, + 1 bonus chez un confirmé, §6 bis) : chaque ligne une tâche, 4 choix (ordre de
  l'équipe, toujours le même) : **Kevin, cariste** · **toi, réceptionnaire** · **Samia, cheffe d'équipe** · **Julie, agent administratif**.
- Envoi : « Envoyer la fiche à Samia » (confirmation dans la page).

### Étape 3 — Le planigramme de réception (grille **identique pour toute la classe**, décision de Tristan du 15/10 au soir)

- **Message de Julie** (`apresFiche('qui-fait-quoi')`, proposé) : « Salut {prénom}, voici le planigramme de ce matin. Lis-le et réponds à
  mes questions. Julie » — pièce jointe : **document « Planigramme du mardi 9 novembre »** (tableau quais × heures, **fabriqué à partir des
  mêmes données que le planning**, jamais recopié), et la fiche « Lire le planigramme » qui l'a à gauche.
- **Fiche « Lire le planigramme »** (`liste` × 2 tirées, + 1 bonus chez un confirmé, §6 bis) : les bonnes réponses et les pièges sont
  **calculés sur la grille** par le code.
- **Message d'un fournisseur** (`apresFiche('planigramme')`, extérieur, **vous**, proposé) : « Bonjour, nous avons un camion de linge de
  maison pour Action Ensuès. Pouvez-vous nous donner un créneau d'une heure entre 9 h et 11 h ce matin ? Merci. Le service transport d'un
  fournisseur européen » — le **planning** s'ouvre (`fermetures`, ou `quand` du planning) : la grille montre les camions déjà prévus
  (`occupe`, lot 3 du moteur ENT-7.2), **une carte à poser** (« Linge de maison — 1 h »).
- Envoi du planning → accusé de Julie (« Merci, je préviens le fournisseur. »), sans dire si c'est juste.
- Question au fil H au geste `planning:action-quais:poser` (§4 bis), corrigée **au bilan**.

### Étape 4 — Les documents du camion et « Avant d'ouvrir le camion »

- **Message de Samia** (après l'envoi du planning, proposé) : « Le camion du Havre arrive bientôt. Voici ses trois documents. Dis-moi à quoi
  sert chacun. Samia » — pièces jointes : **bon de commande** d'Action à son fournisseur, **bon de livraison** du fournisseur, **lettre de
  voiture** du transporteur (reconstitués, n° de commande et quantités **tirés**, §6 bis).
- **Fiche « Les documents du camion »** (`liste` × 3, documents à gauche) : « Quel document dit ce qu'Action a commandé ? » → bon de
  commande · « … ce que le camion apporte ? » → bon de livraison · « … qui transporte la marchandise ? » → lettre de voiture ; choix : les
  trois documents + « la facture » (piège).
- Question I au geste `fiche:documents:commande` (le choix de la 1re ligne), **tout de suite**.
- **Fiche « Avant d'ouvrir le camion »** (`quand: apresFiche('documents')`, bloc `cases`) : « Coche ce qu'il te faut avant d'ouvrir le
  camion. » Justes : **mes EPI (chaussures de sécurité, gilet)** · **un transpalette électrique chargé** · **un quai libre et préparé** ·
  **le bon de livraison du camion** ; pièges : la clé du magasin de Nîmes · la carte grise de ma voiture · le planning des congés.
- Question F au geste `fiche:avant-ouvrir:envoyer`, **tout de suite**.

### Étape 5 — Rendre compte à Samia

- **Message de Kevin** (`apresFiche('avant-ouvrir')`, proposé) : « Salut ! Le transpalette du quai 2 était déchargé : je l'ai mis en
  charge. Kevin »
- **Message de Samia** (même déclencheur) : « Avant que le camion arrive, rends-moi compte : le quai, l'heure du camion, ce qui manque.
  Samia » — **réponse par phrases** (existante) : 5 lignes à choisir (§6.3) : salutation · le quai · l'heure du camion · ce qui manque ·
  fin.
- Question K (réflexion) au geste `messagerie:phrase:fin` (le premier choix de la ligne de fin), retour **au bilan**.

### Fin

- **Samia** (envoi de la réponse) : « Merci {prénom}. Le camion arrive : on décharge ensemble. Samia » (amorce de C1.3).
- Premier bilan → bandeau ✓ / ✗ par bloc (§5) ; « Corriger » rouvre les fiches fausses, le planning et la réponse par phrases, **pas la
  visite** (premier essai) ; `finFige` : « La visite se joue au premier essai : elle ne se rejoue pas. »

**Mots cliquables** : planigramme, créneau, quai, réceptionnaire, zone litiges, EPI, WMS, bon de commande, bon de livraison, lettre de
voiture, transpalette, niveleur, rendre compte, tuteur / tutrice.

## 4 bis. Questions au fil — **tranché par Tristan le 15/10/2026 à 19 h 16 : F, H, I, K** (G et J écartées)

Fichier `contenus/questions/ENT-8.2.js`, `part: 4`, personnes : Samia (`equipe`). Une ligne du bandeau : « Les questions de Samia ».

| id | Geste | Qui pose | Question | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| `consignes-securite` (F) | `fiche:avant-ouvrir:envoyer` | Samia | « Tu es en stage chez Geodis. Qui doit te donner les consignes de sécurité du site ? » — **Geodis, l'entreprise qui t'accueille** (`geodis`) · ton lycée (`lycee`) · Action (`action`) · personne : tu dois les connaître seul (`personne`) | fil | **1** | tout de suite | éco-droit appliqué au cas (stagiaire = travailleur pour la sécurité) ; texte fourni : C. trav. L4111-5 et L4141-1 (§2), en document « Le droit » |
| `retard-havre` (H) | `planning:action-quais:poser` (poser la carte du fournisseur) | Samia | « Imagine : le camion du Havre a 2 heures de retard. Tu le dis à qui en premier ? » — **à moi, ta cheffe d'équipe** (`samia`) · au chauffeur (`chauffeur`) · à Action (`action`) · à personne, il finira par arriver (`personne`) | fil | **1,5** | **au bilan** | C1.2.6, ancrée sur son planigramme ; au bilan car proche du jalon « rendre compte » |
| `qui-doit` (I) | `fiche:documents:commande` | Samia | `selon` : « Action a commandé {N} cartons au fournisseur. Le camion n'en apporte que {N − k}. Qui doit les {k} cartons ? » — **le fournisseur : il s'est engagé à livrer ce qui est commandé** (`fournisseur`) · Geodis (`geodis`) · le chauffeur (`chauffeur`) · le magasin de Nîmes (`magasin`) | fil | **1,5** | tout de suite | éco-droit appliqué (contrat de vente, obligation de délivrer) ; chiffres **tirés**, les mêmes que sur **ses** documents ; texte fourni : C. civ. 1603 et 1604 |
| `pourquoi-rendre-compte` (K) | `messagerie:phrase:fin` | Samia | « Pourquoi je te demande de me prévenir, même quand tout va bien ? » — « Pour organiser l'équipe et les camions qui suivent » · « Pour réagir vite si quelque chose change » · « Parce que c'est moi qui réponds de la réception devant Action » · « Je n'y avais pas pensé » | fil | **réflexion** | **au bilan** | C1.2.6, ne touche aucun jalon |

- **Retours proposés** : F : « C'est Geodis : pour la sécurité, un stagiaire est un travailleur comme les autres. L'entreprise doit
  t'informer des risques et te donner tes EPI. » · H : « C'est à moi : je change l'ordre des camions et je préviens l'équipe. » · I : « C'est
  le fournisseur : en vendant, il s'est engagé à livrer ce qu'Action a commandé. On le note sur le bon de livraison. » · K (« Ce qu'en pense
  Samia ») : « Les trois sont vrais : quand je sais ce qui se passe, j'organise, je réagis, et je peux répondre à Action. »
- Poids dans la `part` : F 1 · H 1,5 · I 1,5 (K non notée) → 4.
- I : `selon` lit le tirage de l'élève (`commande`, §6 bis) ; contrôle sur base vide (énoncé déclaré).
- **Document « Le droit »** (joint au message de l'étape 4 et à la question F/I si le moteur le permet) : C. trav. L4111-5, L4141-1 ;
  C. civ. 1603, 1604 — texte exact recopié de Légifrance, date de consultation.

## 4 ter. Avant de commencer — **validé par Tristan le 15/10/2026 à 19 h 16**

Bloc `ouverture` (Samia), **tirage 3 notions + 1 image** : `tirage: { preparation: 3, image: 1 }` (7 ≥ 2 × 3 ; 3 ≥ 2 × 1). Non notées.
Textes proposés (ids validés par Tristan ; formulations de Cowork, à relire à l'écran) :

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `tutrice` | préparation | Pendant ton stage, ta tutrice… | t'accueille, te donne les consignes et suit ton travail | te paie ton salaire · fait ton travail à ta place | — | ★ |
| `planigramme` | préparation | Un planigramme de réception montre… | quel camion arrive, à quelle heure, à quel quai | les salaires de l'équipe · les produits en rayon du magasin | extrait de planigramme **vide** (aucun camion de la séance) | ★ |
| `creneau` | préparation | Un créneau de réception, c'est… | une heure et un quai réservés pour un camion | une pause de l'équipe · une place de parking pour les voitures | idem | ★ |
| `quai-sert` | préparation | Un quai sert à… | charger et décharger les camions | ranger les palettes pour longtemps · garer les voitures | photo libre de quai | |
| `zone-litiges` | préparation | La zone litiges sert à… | mettre de côté la marchandise qui pose problème | jeter les cartons vides · ranger les EPI | — | |
| `epi` | préparation | Les EPI, ce sont… | les équipements de protection individuelle : chaussures de sécurité, gilet, gants | les engins de la réception · les documents du camion | — | |
| `rendre-compte` | préparation | « Rendre compte », c'est… | dire à son chef ce qu'on a fait ou vu | rendre un colis au fournisseur · compter les palettes | — | |
| `img-transpalette` | image | Comment s'appelle cet engin ? | un transpalette électrique | un chariot élévateur frontal · un gerbeur | photo libre | ★ |
| `img-gilet` | image | Ce gilet sert à… | être bien vu des caristes et des chauffeurs | avoir chaud · ranger le scanner | photo libre | |
| `img-niveleur` | image | Cette plaque au bord du quai sert à… | passer du quai au camion avec l'engin | bloquer les roues du camion · peser la palette | **dessin du quai iso** (kit `core/iso.js`, ou une scène de quai existante du dépôt) | |

- **Écartées** (Tristan) : `bl-dit` (donnerait un jalon de l'étape 4), `vendeur-livre` (donnerait I), `pause`, `epi-qui-paie`.
- `epi` nomme le gilet et les chaussures : la fiche « Avant d'ouvrir le camion » demande **si** on les prend, pas ce que c'est (validé).

## 5. Jalons / notation (sur 20) — **poids validés par Tristan le 15/10/2026 à 19 h 18**

| Bloc (ligne du bandeau) | Cases (un jalon chacune) | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Repérer mon poste** | 4 photos associées, 0,75 chacune | **3** | jalons de `etapesEntrepot` (visite, premier essai) | aucun `ecran` ; la découverte (parcours) ne rapporte rien |
| **Qui fait quoi ?** | 3 tâches tirées, 1 chacune | **3** | `ficheEnvoyee(db,'qui-fait-quoi').valeurs[<ligne>]` | ranger par rang de ligne ; la banque garantit 3 personnes différentes (sinon « tout à Samia » rapporte) |
| **Le planigramme** | 2 lectures tirées 1 chacune ; la carte posée 2 | **4** | fiche `planigramme` ; `etapesPlanning` (règles `quai` et `fenetre`) | carte non posée = faux à l'envoi (rien n'est vrai avant l'envoi ; envoyer à vide = 0) |
| **Les documents du camion** | 3 documents 1 chacun ; « avant d'ouvrir » 1 | **4** | fiches `documents` et `avant-ouvrir` (les 4 justes cochées, aucun piège) | cocher tout ne rapporte rien (exige « rien de trop ») |
| **Rendre compte** | contenu (quai, heure, manque : les trois justes) 1 ; salutation 0,5 ; fin 0,5 | **2** | réponse par phrases | forme = 1 point sur 20 (5 %) |
| **Les questions de Samia** | F 1 · H 1,5 · I 1,5 | **4** (`part: 4`) | moteur des questions | — |
| **Total** | | **20** | | |

- **Corriger** : `ecran: 'fiche:qui-fait-quoi'`, `'fiche:planigramme'`, `'planning:action-quais'`, `'fiche:documents'`,
  `'fiche:avant-ouvrir'`, `'phrases:<id du message>'` ; accusé de réception à chaque renvoi (`volet.corrections`), jamais « juste ».
- **Confirmé** : 1 tâche et 1 lecture bonus (jalons `bonus: true`, sans poids ni groupe) ; bandeau identique à celui d'un standard.
- **Anti-inaction** : rien fait = 0/20.

## 6. Contenu (données)

- **`contenus/action.js`** (univers, créé par ENT-8.1) : y ajouter le **plan de la réception** (s'il sert à d'autres séances : C1.3 la
  suivra) et le document « Le droit » si l'ENT-8.x suivantes le joignent.
- **`contenus/action-ent82.js`** : messages, visite, fiches, planning, documents, phrases, banques et tirage, jalons, accueil.
- **`contenus/questions/ENT-8.2.js`** ; **`activites/action-prise-de-poste.js`** ; **`contenus/corriges/ENT-8.2.js`** (par élève : ses
  tâches, ses lectures et leurs réponses calculées, son n° de commande et ses quantités, cas bonus marqués).
- Photos libres et dessin du niveleur dans `contenus/action/`.
- Valeurs attendues **recalculées par le code** (lectures, quantités) ; dans les tests, écrites à la main.

### 6.1 Le planigramme (grille **identique pour tous**, construite — proposition à vérifier par le code)

Planning `action-quais`, échelle `{ type: 'heures', debut: '06:00', fin: '12:00', pas: 15 }`, lignes = **Quai 1 à Quai 4**, camions déjà
prévus en `occupe` (gris pointillé), règle `unAlaFois` sur la ligne (obligatoire avec `occupe`) et règle `fenetre` :

| Quai | Déjà prévu (`occupe`) |
|---|---|
| Quai 1 | 06:00–07:30 fournisseur de bougies · 09:00–10:30 fournisseur de jouets |
| Quai 2 | 07:00–08:30 **camion du Havre** (conteneur d'Asie dépoté au hub) |
| Quai 3 | 06:30–08:00 fournisseur de produits ménagers · 08:30–10:00 fournisseur de papeterie |
| Quai 4 | 08:30–10:00 retour de palettes vides |

- **Carte à poser** : « Linge de maison — 1 h » (famille d'une couleur permise, ni verte, ni bleue, ni rouge), fenêtre `des: '09:00'`,
  `avant: '11:00'`. Plusieurs places justes (Quai 2 de 9 h à 11 h, Quai 3 ou 4 à partir de 10 h) : le jalon juge les règles, pas une place.
- **Contrôle au chargement** (dans le contenu) : chaque lecture de la banque a **une seule** bonne réponse sur cette grille ; la carte a au
  moins une place juste ; si la grille proposée ne tient pas, l'ajuster et le dire.
- Noms des fournisseurs : **génériques** (« fournisseur de bougies »), aucun nom d'entreprise réelle.

### 6.2 Les documents du camion (reconstitués)

- **Bon de commande** : Action (acheteur) → un fournisseur de vaisselle (nom construit), n° de commande **tiré**, article(s), **{N} cartons**
  commandés, livraison à l'entrepôt d'Ensuès-la-Redonne.
- **Bon de livraison** : du fournisseur, référence de la commande, **{N − k} cartons** livrés, case « Réserves » vide.
- **Lettre de voiture** : transporteur (nom construit), expéditeur « hub d'import Action, Gonfreville-l'Orcher », destinataire « entrepôt
  Action / Geodis, Ensuès-la-Redonne », nombre de palettes, date du mardi 9 novembre (sans année).
- Pied de chaque document : « Document pédagogique — reconstitution, non contractuel. »

### 6.3 Rendre compte (réponse par phrases, textes proposés)

| Ligne | Choix (juste en gras) |
|---|---|
| salutation | **Bonjour Samia,** · Salut ma grande, · Madame la directrice, |
| le quai | **Le quai 2 est prêt pour le camion du Havre.** · Le quai 1 est prêt pour le camion du Havre. · Le quai 4 est prêt pour le camion du Havre. |
| l'heure | **Le camion est attendu à 7 h.** · Le camion est attendu à 8 h 30. · Le camion est attendu à 9 h. |
| ce qui manque | **Il manque un transpalette chargé : Kevin a mis celui du quai 2 en charge.** · Il ne manque rien. · Il manque la clé du magasin. |
| fin | **Je t'attends au quai. {prénom}** · Bisous · (rien) |

Les valeurs (quai 2, 7 h) sont **lues dans la grille** par le code, pas recopiées.

## 6 bis. Tirage et niveaux (règle du 08/10/2026)

### Banque `taches` — fiche « Qui fait quoi ? »

| id | Tâche | Qui | Difficulté |
|---|---|---|---|
| `t-decharger` | Décharger le camion au chariot. | Kevin, cariste | facile |
| `t-saisir` | Saisir la réception dans le WMS. | Julie, agent administratif | facile |
| `t-bl` | Vérifier le bon de livraison avec le chauffeur. | toi, réceptionnaire | facile |
| `t-compter` | Compter les cartons d'une palette et regarder leur état. | toi, réceptionnaire | moyen |
| `t-rdv` | Noter au planigramme le rendez-vous d'un fournisseur. | Julie, agent administratif | moyen |
| `t-ranger` | Amener une palette contrôlée jusqu'au stock. | Kevin, cariste | moyen |
| `t-refuser` | Décider de refuser une palette abîmée. | Samia, cheffe d'équipe | difficile |
| `t-equipe` | Répartir le travail de l'équipe le matin. | Samia, cheffe d'équipe | difficile |

- Socle `{ facile: 1, moyen: 1, difficile: 1 }` → 3 tâches ; bonus confirmé `{ moyen: 1 }`. `ordre: 'melange'`.
- `verifier` : **3 personnes différentes** dans le socle (re-tirage sinon).
- Tâches construites d'après les métiers vérifiés (§2) ; la répartition (Julie tient le planigramme) est construite.

### Banque `lectures` — fiche « Lire le planigramme » (réponses calculées sur la grille du §6.1)

| id | Question | Réponse sur la grille proposée | Difficulté |
|---|---|---|---|
| `l-havre-heure` | À quelle heure le camion du Havre est-il attendu ? | 7 h | facile |
| `l-havre-quai` | À quel quai le camion du Havre se met-il ? | quai 2 | facile |
| `l-premier` | Quel camion arrive le premier ce matin ? | fournisseur de bougies | facile |
| `l-libre-9h` | Quel quai est libre de 9 h à 10 h ? | quai 2 | moyen |
| `l-q3-combien` | Combien de camions sont prévus au quai 3 ce matin ? | 2 | moyen |
| `l-dernier` | Quel camion libère son quai le dernier ? | fournisseur de jouets (10 h 30) | difficile |

- Socle `{ facile: 1, moyen: 1 }` → 2 lectures ; bonus confirmé `{ difficile: 1 }`. Choix (4) calculés : la bonne réponse et 3 autres
  valeurs de la grille.
- `l-havre-heure` et `l-havre-quai` donnent deux lignes de « Rendre compte » : c'est voulu (la lecture prépare le compte rendu).

### Banque `commande` — valeurs des documents et de la question I

- n° de commande tiré (format construit, par exemple `AC-` + 6 chiffres) ; **N** tiré parmi des multiples de 24 entre 720 et 1 440 ; **k**
  tiré entre 24 et 96 (multiple de 24 : des cartons par couche). Contrôle : `0 < k < N`. Les mêmes valeurs sur les documents et dans
  l'énoncé de I.

### Le reste

- Visite, fiche documents, « Avant d'ouvrir », phrases : **pièces fixes** (les mêmes pour tous) ; ordre des choix mélangé par élève.
- **Accompagné** : contenu standard.
- **Consignes neutres** : aucune ne donne le nombre de tâches ni de lectures.

## 7. Demandes au moteur

### 7.1 Deux lieux de visite : vestiaire et zone de contrôle (décision de Tristan du 15/10/2026 au soir)

Le mode `visite` (`core/types/entrepot-visite.js`) connaît les ancres `quai:<nom>`, `zone:reception`, `zone:litiges`, `zone:bureau`,
`allee:principale`, `allee:<id>`. Ajouter **`zone:vestiaire`** et **`zone:controle`** : une zone déclarée dans `entrepot.zones` (décor : nom
écrit, place sur le plan), une ancre de parcours, la trace qui s'y calcule comme pour les autres zones. Pensé pour servir à d'autres visites
(toute réception a un vestiaire et une zone de contrôle). Petit chantier (Sonnet, ≈ 1 h tests compris) ; tests dans le bloc `entrepot` :
ancre connue → trace calculée ; ancre inconnue → la séance ne s'ouvre pas ; **ENT-5.3 inchangée** (bloc `smoby` vert).

### 7.2 À vérifier à l'état des lieux (le dire à Tristan avant de contourner)

- **Une visite sans stock** : le mode `visite` prend `plan, gammes, produits, stock` du rangement ; la réception d'Ensuès n'a pas de travée à
  montrer (pas d'étape `adresse`). Un plan **sans stock** se charge-t-il ?
- **Une visite au premier essai dans une séance `correction`** : `premierEssai` ouvre la suite à la fin de la visite et donne un bandeau
  « du premier coup » sans « Corriger » (ENT-5.3 est une visite seule). Ici, la visite n'est qu'une étape : la séance doit garder « Corriger »
  pour ses fiches, son planning et ses phrases. Si le moteur ne sait pas mêler les deux, c'est une demande au moteur : le dire.
- **Déclencheur de fin de visite** (pour le message de l'étape 2) : existe-t-il (`apresVisite`, ou le geste d'une étape) ?
- **Planning ouvert après un message** (`quand` du planning ou `fermetures`) et **carte unique à poser** sur une grille d'`occupe` : déjà
  fait pour ENT-7.2, à confirmer.
- **Document fabriqué depuis les données du planning** (le planigramme en tableau) : rien à demander (fonction du contenu).
- **Geste `messagerie:phrase:fin`** pour K : la ligne `fin` doit exister dans un mail semé par le volet ou un déclencheur (règle D-3).
- **Document joint à une question** (« Le droit » à côté de F et I) : si le panneau des questions ne montre pas de document, joindre « Le
  droit » au message de l'étape 4 et le citer dans l'énoncé (« lis le document Le droit »).

### 7 bis. Séance déjà jouée par des élèves ?

Non : séance nouvelle.

## 8. Tests attendus

Bloc `action` (créé par ENT-8.1). Graines choisies dans le test, valeurs attendues écrites à la main.

- **Parcours juste** (standard) : 20/20, bandeau 6 lignes ✓.
- **Inaction** → 0/20. **Pire cas** : tout faux → premier bilan, séance finie sans l'enseignant.
- Visite : une photo mal associée au premier essai → bloc 1 ✗, l'élève finit quand même ; « Corriger » ne rouvre pas la visite.
- « Qui fait quoi ? » : refuser une palette attribué à Kevin → bloc 2 ✗ ; « Corriger » le rouvre ; 300 graines → 3 personnes différentes.
- Planigramme : carte posée au Quai 1 à 9 h (pris) → jalon carte ✗ ; au Quai 2 à 9 h → ✓ ; au Quai 3 à 11 h (hors fenêtre) → ✗ ; chaque
  lecture de la banque a une seule bonne réponse (cas qui relit la grille) ; valeurs écrites à la main (7 h, quai 2, bougies, quai 2, 2, jouets).
- Documents : « la facture » choisie → bloc 4 ✗ ; « Avant d'ouvrir » : tout coché → ✗ (rien de trop) ; les 4 justes seules → ✓.
- Rendre compte : salutation fausse seule → bloc 5 ✗, le contenu reste juste au détail.
- **Questions** : I affiche **ses** N et k, les mêmes que sur ses documents (300 graines) ; H et K au bilan ; F tout de suite ; `part` 4, somme
  des poids 20.
- **Tirage** : mêmes tâches, lectures, valeurs après rechargement ; zéro secours.
- **Confirmé** : 4 tâches, 3 lectures, bandeau identique, mot « bonus » absent ; cas bonus faux → note du socle inchangée.
- **Parcours** : ENT-8.2 fermée tant qu'ENT-8.1 n'a pas son premier bilan, ouverte ensuite.
- Sabotage par bloc ; garde « 3 personnes » retirée → le cas des 300 graines tombe ; lecture rendue ambiguë (un camion déplacé) → le contrôle
  du contenu tombe.

## 9. Supports pour les élèves

- **Trame** (Cowork, après validation à l'écran) : page de connexion ; **brouillon** : un planigramme vierge à remplir à la main ; **cours**
  d'une demi-page : les zones de la réception, l'équipe, les trois documents, « rendre compte » ; mise en page lisible en **noir et blanc**.
- **Corrigé enseignant** : `contenus/corriges/ENT-8.2.js` (§6).

## 10. Critères de validation par Tristan

- La visite se suit sans aide ; les photos se reconnaissent ; les mentions « photo d'un autre entrepôt » sont visibles.
- Le planigramme se lit au vidéoprojecteur ; la carte se pose sans aide.
- Les trois documents se distinguent du premier coup d'œil (titre en grand).
- Chaque écran a une consigne de 3 lignes au plus ; aucun texte à taper.
- 50 minutes suffisent.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [x] Planigramme : **grille identique pour toute la classe**, lectures tirées (Tristan, 15/10 au soir ; pas de chantier moteur).
- [x] Visite : **6 arrêts**, le moteur reçoit `zone:vestiaire` et `zone:controle` (Tristan, 15/10 au soir ; §7.1).
- [ ] Textes construits par Cowork, à relire à l'écran : messages, parcours, tâches, lectures, documents, phrases, ouverture, retours.
- [ ] Le plan de la réception (4 quais, zones) : construit par Claude Code d'après le parcours, à valider à l'écran. (Défaut : 4 quais au
  nord, zones de réception et de contrôle au milieu, litiges, bureau et vestiaire au sud.)
- [ ] La question I est corrigée **tout de suite** (décision) alors que la fiche des documents n'est pas encore envoyée : l'énoncé (« Action a
  commandé {N} cartons ») aide à reconnaître le bon de commande. (Défaut : gardé ; autre possibilité : au bilan.)

---

## Compte rendu *(rempli par Claude Code à la livraison)*

Livré le 15/10/2026 par un sous-agent (Opus) du chantier Action ; le chef de chantier relit et commite.

- **Fichiers créés / modifiés** :
  - créés : `contenus/action-ent82.js` (contenu de la séance ; exporte aussi pour C1.3 le plan de la réception `PLAN_RECEPTION` /
    `ZONES_RECEPTION`, le document « Le droit » `DOC_DROIT`, le planigramme `CAMIONS` / `docPlanigramme`), `contenus/questions/ENT-8.2.js`,
    `contenus/corriges/ENT-8.2.js`, `activites/action-prise-de-poste.js`, `outils/test/action.mjs` (bloc `action`, 20 cas) ;
    `activites/action-se-situer.js` créé en squelette `pret: false`… puis **remplacé pendant le travail** par le chantier ENT-8.1 (séance complète).
  - modifiés : `activites/index.js` (entreprise n° 8 « Action » + deux `import()`), `outils/test.mjs` (`'action'` dans `BLOCS` et dans le
    **groupe 4** de `GROUPES`, le moins chargé en nombre de blocs), `outils/test/socle.mjs` (deux lignes `ATTENDU_CAP` : `'ENT-8.1': 'CAP-C1.1',
    'ENT-8.2': 'CAP-C1.2'`). **Alerte 7 : deux fichiers de test touchés.** Alerte 8 : ENT-8.2 ajoutée (rang ENT-8.2, après ENT-8.1).
- **Écarts par rapport au brief** (et pourquoi) :
  - **Plan de la réception** : le moteur dessine les **quais sur le mur du bas** (au sud, pas au nord) et empile les zones nommées à droite
    des racks, de haut en bas : litiges, bureau, vestiaire, zone de contrôle, zone de réception (contre l'allée principale). Il exige au moins
    une allée de racks : **deux allées de racks à un niveau** (le stock, où partent les palettes contrôlées), et non un rack minimal, parce
    qu'avec une seule allée le plan est trop étroit pour **quatre** quais (le Quai 4 sortait du dessin).
  - **Transpalette** : la seule photo libre est un transpalette **manuel** et le kit iso n'en a pas d'électrique : la question d'image devient
    « Comment s'appelle cet engin ? → un transpalette » (pièges : chariot élévateur frontal, gerbeur) ; la fiche « Avant d'ouvrir » garde
    « Un transpalette électrique chargé » en texte.
  - **Niveleur** : le kit iso (`core/iso.js`) le dessine dans le quai iso, mais ne produit pas d'image fichier ; `img-niveleur` prend la
    **photo du quai intérieur déjà au dépôt** (`contenus/smoby/quai-interieur.jpg`, Pexels 1267327, marques effacées, crédité dans
    `contenus/smoby/LISEZMOI.md`) : énoncé « La plaque bleue au bord du quai sert à… ». Banque image : 3 questions (2 × 1 tirée).
  - **Photos de la visite** : 4 photos d'Action (`PHOTOS` : quai, vestiaire, zone-colis pour la réception, palette filmée pour le contrôle) +
    **deux reprises de Smoby** déjà au dépôt : le dessin de la zone litiges et la photo de bureau (Pexels 7658310). Photos à associer : quai (2),
    bureau (6), vestiaire (1), réception (3) — pas le contrôle (sa photo ressemble trop à celle de la réception).
  - **Rendre compte, ligne « fin »** : « (rien) » remplacé par « À plus. » (le texte « (rien) » se serait écrit tel quel dans le message envoyé).
  - **Message de Julie ajouté** à l'arrivée de la demande du fournisseur (« Place ce camion sur le planning des quais… ») : sans lui, rien ne
    disait à un CAP d'aller au planning (le fournisseur écrit au vous, sans consigne).
  - **« Banque `commande` »** : ce sont des **valeurs tirées** (`valeurs` du tirage : n°, N, k), pas une banque de pièces. Lettre de voiture :
    nombre de palettes = livrés ÷ 96 arrondi au-dessus (construit).
  - **Date** : les messages sont datés du 9 novembre de l'année scolaire en cours, de 6 h à 6 h 58 (une heure par étape) ; la Messagerie
    affiche « 09/11/2026 » (avec l'année : moteur) mais pas le jour de la semaine (le 9/11/2026 est un lundi).
  - « Le droit » : quatre textes (L4111-5, L4141-1 **1er alinéa seulement**, 1603, 1604), joint au message de Samia de l'étape 4 et cité dans
    les énoncés de F et I.
- **Décisions prises en route** :
  - Grille du planigramme **telle que proposée** (§6.1), contrôlée au chargement par `ecartsGrille()` : une seule bonne réponse par lecture,
    bonne réponse dans les choix, au moins une place juste (quai 2 de 9 h à 10 h, quais 3 et 4 à 10 h). Choix des lectures : heures = les 3
    arrivées les plus proches ; camions = ordre alphabétique (le premier ne se devine pas à sa place).
  - Textes de loi **recopiés mot pour mot sur Légifrance le 15/10/2026** : C. civ. 1603 (LEGIARTI000006441528), 1604 (LEGIARTI000006441557) ;
    C. trav. L4111-5 (LEGIARTI000006903144), L4141-1 (LEGIARTI000027326445 ; 1er alinéa relu aussi sur code.travail.gouv.fr).
  - Noms construits : fournisseur « Vaisselle Lotus », transporteur « Transports Seine-Provence » (dit en pied des documents), article
    « Assiettes plates en grès, lot de 6 ».
  - Les écrans qui suivent une fiche restent au menu pendant une correction (condition « déjà envoyée une fois » : `dejaEnvoyee`).
  - Questions : le fichier `contenus/questions/ENT-8.2.js` n'importe rien de la séance (cycle d'import) ; la commande témoin (960 / 48) y est
    recopiée, un cas vérifie que l'énoncé de I et les documents disent les mêmes nombres.
- **Tests** : bloc `action` **20 cas verts** (`PORT_TESTS=8110 node outils/test.mjs action`, ~10 s) : données du planigramme (valeurs à la main :
  7 h, quai 2, bougies, quai 2, 2, jouets ; places justes), contrôle de grille (trois grilles rendues ambiguës refusées), déclaration et
  poids (16 + part 4), jalons sans écran (inaction 0, chaque piège sur SON jalon, planning vide = 0), bonus du confirmé, tirage (300 graines ×
  2 niveaux : trois personnes, commande cohérente, zéro secours ; sans la garde, > 30 tirages fautifs), question I (300 graines : mêmes N, N − k,
  k que ses documents), parcours juste à l'écran (ouverture répondue FAUX → 20/20, bandeau 6 lignes ✓, menu progressif, 10 messages dans
  l'ordre, aucun « juste / faux / bonus », heures croissantes), F / I / H / K à l'écran, pire cas (0/20, bandeau ✗ partout, « Corriger »,
  `finFige`, photo de fin rangée), corriger (visite figée, salutation, « refuser une palette » à Kevin), planning à l'écran (Q1 9 h, Q3 11 h,
  Q2 9 h), confirmé à l'écran (4 tâches, 3 lectures, bandeau identique, pas de « bonus », note du socle 20), tirage stable, verrou du parcours,
  écrans à 1366 × 768, corrigé par élève.
  **Sabotages éprouvés** (11, chacun fait tomber au moins un cas, fichier remis) : jalon de visite inversé (5 cas), tâches toujours à Samia (8),
  lecture décalée (7), règle du quai pris retirée du jalon (4), facture attendue (8), « rien de trop » retiré (2), salutation jamais jugée (3),
  « avant d'ouvrir » juste sans envoi (3), garde « 3 personnes » retirée (2, dont le cas des 300 graines), un camion déplacé (19 : la séance
  ne se charge plus), énoncé de I avec N au lieu de N − k (3).
  **Non-régression** `socle dependances entrepot planning questions tirage-niveaux` : 348 / 351. **Trois échecs dus à l'entreprise n° 8, dans
  des fichiers hors de cette mission** (à corriger par le chef de chantier) :
  1. `outils/test/tirage-niveaux.mjs` `BANQUES_FIGEES` : ajouter `'contenus/action-ent82.js': { taches: ['t-decharger', 't-saisir', 't-bl',
     't-compter', 't-rdv', 't-ranger', 't-refuser', 't-equipe'], lectures: ['l-havre-heure', 'l-havre-quai', 'l-premier', 'l-libre-9h',
     'l-q3-combien', 'l-dernier'] }` (et la ligne de `contenus/action-ent81-donnees.js` pour ENT-8.1) ;
  2. même fichier, ligne ≈ 140 : colonnes de l'onglet « Niveaux » `['2', '4', '6', '7', '8']` et en-têtes `[…, 'Decathlon', 'Action']` ;
  3. `outils/test/socle.mjs` ≈ 814 et 824 : CAP-C1.1 compte maintenant 4 séances (ENT-8.1 s'ajoute à DEC-1, QUI-6, ENT-6.1) : `'10/20 (1/4)'`
     et `';1 sur 4;10'` (cause : ENT-8.1, pas ENT-8.2).
- **Commits** : aucun (le chef de chantier commite).
- **Reste ouvert** :
  - **Moteur, à savoir** : à la fin de la visite et à l'envoi du planning, le menu ne se redessine qu'au changement d'écran (l'élève voit la
    carte du message de Samia / Julie et y va ; les tests passent par la Messagerie). En guidage, le planning dit en direct « déjà pris » ou
    « aucun problème » avant l'envoi (comportement du moteur). La Messagerie affiche l'année des messages.
  - Le plan est construit : à valider à l'écran (disposition, place des racks).
  - Pas de trame élève (Cowork, après validation).
  - **Textes à relire à l'écran par Tristan** : les 7 messages (Samia ×4, Julie ×3, Kevin, le fournisseur) et les 4 accusés « Bien reçu » ;
    l'accueil et la mention « Bon à savoir » ; la visite (accueil, 6 arrêts, consignes d'« Où est-ce ? », fin) ; les 8 tâches ; les 6 lectures et
    leurs choix ; la consigne du planning ; les trois documents et leurs noms construits ; « Le droit » ; les deux fiches des documents ; les
    phrases du compte rendu (dont « À plus. ») ; les 10 questions d'ouverture et leurs retours (dont `img-niveleur` sur la photo du quai
    intérieur) ; F, H, I, K et leurs retours ; `finFige`.
