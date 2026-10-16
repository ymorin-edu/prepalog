# Brief de séance — ENT-8.3 Action — un autre site, un autre prestataire (CAP OL, entraînement CAP-C1.1)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md puis docs/briefs/ENT-8.3-action-autre-site.md en entier. Fais d'abord l'état des lieux du §7 (dis-moi ce qui manque au moteur avant de contourner), puis construis la séance. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : livré (16/10/2026, `pret: true, ouverture: 'prof'`, pas encore vu à l'écran par Tristan)
**Date du brief** : 16/10/2026
**Conversation d'origine** : Cowork (Opus) — cadrage du 15/10/2026 au soir (`claude/prepalog-action-entrainement-c1.md`, décisions 1 à 13),
puis deux décisions du 16/10/2026 (§0 bis et §2) prises après les retours de classe des CAP sur ENT-8.1 et ENT-8.2.
**Modèle** : **Opus** (séance nouvelle de bout en bout).
**Place dans l'ordre** : après ENT-8.2 et les corrections CAP du 16/10 (options `bilanDetail`, `suite`, `deuxBlocs`, liste « À corriger »,
`docs/decisions.md` du 16/10). Avant ENT-8.4 (`docs/briefs/ENT-8.4-action-avant-noel.md`), qui en dépend (`precedente`).
**Durée estimée par Cowork** : ≈ 4 à 5 h. Ce qui prend le temps : le **document dessiné de la chaîne de Romain** (6 cases, 2 fausses tirées),
le lieu de Roques dans la carte, l'image de la remorque à deux planchers, les tests. Les fiches elles-mêmes sont courtes.

---

## 0. Règles communes à Action (CAP OL)

Celles du §0 d'ENT-8.1 (une consigne par écran, 3 lignes au plus, tout en cliquant ; aucune année ; « Avant de commencer » sur les notions
du scénario ; jalons pondérés sur 20, questions au fil 4 points, `parcours`, `correction`, `bilanDetail` ; jamais un élève bloqué ; ce qui
est construit se dit dans la séance). **Changent pour ENT-8.3 et 8.4** (décisions de Tristan du 15/10 au soir) :

- **Nouvelle PFMP** de l'élève, cette fois chez **GXO à Labastide-Saint-Pierre** (Tarn-et-Garonne), l'entrepôt qui travaille pour Action dans
  le Sud-Ouest. Tuteur : **Romain, chef d'équipe réception** (construit). Samia et Ensuès (ENT-8.1, 8.2) servent de **point de comparaison**.
- ENT-8.3 : « **lundi 7 décembre, 8 h** » (sans année).

## 0 bis. Un écran par étape (décision de Tristan du 16/10/2026)

Retour de classe du 16/10 : les CAP « se perdent quand il y a trop de changements de vue » (Messagerie → écran → document ailleurs). Pour
ENT-8.3 et ENT-8.4, **chaque étape tient sur un seul écran** :

1. **Le document est à gauche de la fiche**, sur le même écran (`fiche.documents`, `largeurDocs` si le dessin doit être grand). Jamais
   « ouvre le document X dans Documents ».
2. **La consigne de Romain est en haut de l'écran** (`sousTitre`, 3 lignes au plus), pas seulement dans un message.
3. **L'écran de l'étape suivante s'ouvre à l'envoi de la précédente** (`quand: apresFiche(...)` / `localiserFini(...)`), pas à la lecture
   d'un message. Romain envoie quand même un message court à chaque étape (le récit, et la notification à l'écran exigée le 07/10), mais
   l'élève n'a pas besoin de passer par la Messagerie : la **barre « Étape suivante »** (option `suite`) le mène droit à l'écran.
4. **Pas de point d'étape** (il garde un écran fermé et ajoute un détour) : les questions arrivent au fil, sur l'écran où l'élève travaille.
5. **Bilan** : `bilanDetail: true` (une ligne par case, « Corriger dans « … » », liste « À corriger » en haut) ; `titreBilan` sur chaque jalon
   dont l'ordre des lignes est tiré (§5).

Écrans de l'élève, dans l'ordre : **Avant de commencer → Carte de France → Qui est qui ? → La chaîne de Romain → Ce que je change** → bilan.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.3 (provisoire, comme toute la série) |
| `id` (jamais modifié ensuite) | `action-autre-site` |
| Titre / desc | « Action — un autre site, un autre prestataire » / « Situer un autre entrepôt et un nouveau magasin d'Action, reconnaître qui exploite quel entrepôt, corriger la chaîne d'un produit et dire ce que change le travail de l'opérateur. » |
| Rubrique | simulog, entreprise n° 8 Action |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competences: []`, `competencesCap: ['CAP-C1.1']` (comme ENT-8.1) ; sous-compétences : C1.1.1 types d'organisation · C1.1.2 environnement économique · C1.1.3 se situer dans l'organisation et la supply chain · C1.1.4 contribution de l'opérateur. Une ligne de plus dans `ATTENDU_CAP` de `outils/test/socle.mjs` (`'ENT-8.3': 'CAP-C1.1'`) : **le dire à Tristan**. |
| Temps pédagogique | `temps: 'entrainement'` (coefficient 1), avec une **erreur induite** (la chaîne de Romain) |
| Notation | jalons pondérés, note sur 20, `parcours: true`, `correction: true`, `bilanDetail: true`, `precedente: 'action-prise-de-poste'` |
| Barème | `bareme: 20` |
| Niveaux d'élève | `niveauxPrevus: ['confirme', 'accompagne']` (Accompagné : la carte seulement ; fiches standard) |
| `questions` | `'ENT-8.3'` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

- **Vérifié** (recherche Cowork du 15/10 au soir et du 16/10 ; détail dans `claude/prepalog-action-entrainement-c1.md`) :
  - **Labastide-Saint-Pierre (82)** : entrepôt de 45 000 m² construit par Action, exploité par XPO puis **GXO** (établissement « GXO Logistics
    Toulouse France »), ≈ 215 personnes, plus de 50 magasins du Sud à l'ouverture ; transport France à l'époque XPO : **195 semi-remorques à
    deux planchers** ([XPO](https://europenews.xpo.com/en/1656/action-chooses-xpo-to-manage-key-sites-for-logistics-and-distribution/) ;
    [annuaire des entreprises](https://annuaire-entreprises.data.gouv.fr/etablissement/79883670600050)).
  - **Onnaing (59)** : centre inauguré le 15/10/2026, exploité par **GXO**, 3e site GXO pour Action en France après **Moissy-Cramayel** et
    Labastide ([GXO, 15/10/2026](https://www.globenewswire.com/news-release/2026/10/15/3381579/0/en/gxo-and-action-expand-partnership-in-france.html)).
  - **Belleville (69, 60 000 m², Sud-Est)** et **Verrières-en-Anjou (49, 70 000 m², Ouest)** : exploités par **Kuehne+Nagel**, partenariat
    prolongé ([communiqué du 06/09/2023](https://www.faq-logistique.com/CP20230906-Kuehne+Nagel-Action-Prolongent-Collaboration-France.htm),
    relu le 16/10/2026).
  - **Ensuès-la-Redonne (13)** : **Geodis** (ENT-8.1). **Moissy-Cramayel** : exploité par ID Logistics (2015), puis XPO, puis GXO → un vrai
    changement de prestataire (question L).
  - Chez Action, **environ 150 nouveautés par semaine** (`claude/prepalog-action-recherche.md`).
  - **Magasin de Roques (Roques-sur-Garonne, 31)** : arrivée d'Action au centre commercial de Roques annoncée le 07/07/2026, ouverture
    annoncée pour octobre 2026 ([Le Bonbon, 21/07/2026](https://www.lebonbon.fr/toulouse/bons-plans/magasin-action-centre-commercial-roques-toulouse/)).
    **Ouverture effective et adresse exacte non trouvées le 16/10/2026.** → **Décision de Tristan (16/10)** : la séance dit « **le nouveau
    magasin Action de Roques** », sans dire s'il est ouvert ni donner d'adresse ; sur la carte, le point est le **centre de la commune de
    Roques** (OSM), dit « placé au centre de la commune » dans `MENTION`.
- **Construit (à dire dans la séance)** : Romain et ses messages ; le fait que **Labastide livre Roques** ; les **premières livraisons** de ce
  magasin ; le trajet Le Havre → Labastide (comme Le Havre → Ensuès en 8.1) ; la chaîne dessinée par Romain et ses erreurs ; les situations de
  « Ce que je change ».
- **Le livret d'accueil GXO Action Labastide (2021, Calaméo)** est publié, mais **rien n'en est recopié**.
- **Images** : réutiliser celles de `contenus/images/action/` ; **nouvelles** : une porte de quai numérotée (photo libre, Pexels/Unsplash, sans
  visage ni marque) ; le **pictogramme du point de rassemblement**, **redessiné** en SVG (traits à l'encre, **sans aplat vert** : le vert plein
  ne dit que « juste ») ; la **remorque à deux planchers** (dessin du kit iso de `core/iso.js`, ou photo libre si elle existe ; sinon dessin).
  Récupération par script, empreinte, `contenus/images/action/CREDITS.md` (alerte 10).
- **Documents reconstitués** : pied « Document pédagogique — reconstitution, non contractuel ».

## 3. Objectif pédagogique

À la fin, l'élève sait **se situer dans un autre site** du même réseau : il place sur la carte le nouvel entrepôt, le nouveau magasin et le
port ; il sait qu'**un même donneur d'ordres (Action) confie ses entrepôts à plusieurs prestataires** (GXO, Geodis, Kuehne+Nagel) ; il **repère
les erreurs** dans le chemin d'un produit et les corrige ; il relie un geste d'opérateur à ce qui arrive au magasin. Deuxième temps
(entraînement) de CAP-C1.1, moins guidé qu'ENT-8.1 ; l'évaluation C1.1 + C1.2 viendra en janvier (à cadrer).

## 4. Déroulé (≈ 45 min)

**Date du scénario : lundi 7 décembre, 8 h.**

### Étape 0 — Avant de commencer (non notée, Romain) — voir §4 ter

### Accueil (premier message de Romain, proposé)

« Bonjour {prénom}, bienvenue chez GXO à Labastide-Saint-Pierre ! Je suis Romain, chef d'équipe à la réception, ton tuteur pour ce stage.
Ici, on travaille pour Action, comme Geodis à Ensuès. Cette semaine, on prépare les premières livraisons du nouveau magasin de Roques.
Commence par la carte. Romain »

### Étape 1 — Carte de France (vue « Localiser »)

- `localiser` : 3 lieux du socle, dans l'ordre : **l'entrepôt GXO de Labastide-Saint-Pierre** (82, Occitanie) → **le nouveau magasin Action de
  Roques** (31, Occitanie) → **le port du Havre** (hub de Gonfreville-l'Orcher, 76, Normandie, comme en 8.1). Bonus du confirmé : **le nouveau
  centre d'Onnaing** (59, Hauts-de-France, GXO).
- Consigne d'écran (Romain) : « Retrouve où nous sommes, où va la marchandise et d'où elle arrive. »
- `flux` : Le Havre → Labastide → Roques. `fin` (titre « Le chemin des produits vers Roques ») : « Les produits arrivent d'Asie au Havre,
  l'entrepôt de Labastide prépare les commandes des magasins du Sud-Ouest. Le nouveau magasin de Roques est à une heure de route. (Le trajet
  du Havre à Labastide, puis à Roques, est imaginé pour l'exercice ; le point de Roques est au centre de la commune.) »
- Niveaux : **les mêmes qu'en 8.1** (décision 13 du 15/10 : « niveaux comme en 8.1/8.2 ») ; l'entraînement vient des lieux nouveaux, pas d'un
  niveau plus dur (§11, question 1). Étape ville : sans note, hors bilan (règle du 15/10).
- Jalons : région et département × 3 lieux (premier essai, comme en 8.1).

### Étape 2 — Qui est qui ? (une fiche, document à gauche)

- **Message de Romain** (`localiserFini`) : « Bravo. Action a plusieurs entrepôts, et ce n'est pas toujours la même entreprise qui les fait
  tourner. Lis le document et remplis la fiche. Romain »
- **Document à gauche** « **Le réseau d'Action en France** » (reconstitué, faits vérifiés du §2, en phrases, **dans un ordre différent de celui
  de la fiche**) : 6 lignes, une par entrepôt — Labastide (GXO), Ensuès (Geodis), Verrières-en-Anjou (Kuehne+Nagel), Belleville
  (Kuehne+Nagel), Onnaing (GXO, ouvert cette année : **ne pas écrire d'année**, « le plus récent »), Moissy-Cramayel (GXO, « après ID Logistics
  puis XPO »). Une phrase d'en-tête : « Action possède les marchandises et choisit, pour chaque entrepôt, une entreprise qui le fait tourner :
  un prestataire logistique. »
- **Fiche « Qui est qui ? »**, deux parties :
  - « **Qui fait tourner cet entrepôt ?** » — `liste` × 3 : **Labastide (fixe)** + 2 entrepôts tirés ; choix (mêmes pour chaque ligne) :
    GXO · Geodis · Kuehne+Nagel · Action lui-même.
  - « **Quel est son rôle ?** » — `liste` × 2 acteurs tirés (§6 bis) ; 7 rôles offerts à chaque ligne.
- Envoi : « Envoyer la fiche à Romain ». Question **L** à l'envoi (§4 bis).

### Étape 3 — La chaîne de Romain (erreur induite, une fiche, dessin à gauche)

- **Message de Romain** (`apresFiche('qui')`) : « J'ai dessiné le chemin d'un produit jusqu'à Roques pour les nouveaux. J'ai fait deux erreurs.
  Trouve-les et corrige-les. Romain » — l'élève est prévenu qu'il y en a **deux** (consigne CAP : on ne fait pas chercher un nombre inconnu).
- **Document à gauche** « La chaîne de Romain » : **6 cases numérotées** reliées par des flèches, dessin (`documents[].html` en fonction de
  `db`, ou dessin en document D-10), **2 cases fausses tirées** par élève (§6 bis), les 4 autres justes. Lisible en noir et blanc, grand
  (`largeurDocs`).
- **Fiche** « Corriger la chaîne », deux lignes identiques :
  - « **Erreur 1** : la case n° [liste 1 à 6] devrait dire [liste d'étiquettes] »
  - « **Erreur 2** : la case n° [liste 1 à 6] devrait dire [liste d'étiquettes] »
  - Étiquettes offertes (ordre mélangé par élève) : les 6 étiquettes justes + 3 fausses (prises dans la banque, dont les 2 de l'élève).
- Jugé **sans ordre** : peu importe quelle ligne nomme quelle erreur (§5). Question **N** à l'envoi.

### Étape 4 — Ce que je change (une fiche, image à gauche)

- **Message de Romain** (`apresFiche('chaine')`) : « Dernière chose : ce que tu fais ici se voit au magasin de Roques. Pour chaque situation,
  choisis ce qui arrive là-bas. Romain »
- **À gauche** : l'image de la **remorque à deux planchers** qui part pour Roques (légende : « Le camion qui livre les magasins »), utile à
  la question P et à une situation.
- **Fiche** : 3 situations tirées (facile, moyenne, difficile) + 1 bonus chez un confirmé ; une `liste` chacune : « Au magasin de Roques… »
  (4 choix, §6 bis). Question **P** au choix de la **première** ligne.

### Fin

- **Romain** (envoi de la fiche) : « Merci {prénom}. Jeudi 17, avant Noël, tu viens avec moi à la réception : ça va être chargé. Romain »
  (amorce d'ENT-8.4).
- Premier bilan → bandeau détaillé (`bilanDetail`) ; « Corriger » rouvre les fiches fausses, **pas la carte** (premier essai) ;
  `finFige` : « La carte et les questions de Romain se jouent au premier essai : elles ne se rejouent pas. »

**Mots cliquables** : prestataire logistique, donneur d'ordres, entrepôt, hub, porte-conteneurs, tuteur, remorque à deux planchers, filmer,
emplacement.

## 4 bis. Questions au fil — **tranché par Tristan le 15/10/2026 : L, N, P** (M et O écartées)

Fichier `contenus/questions/ENT-8.3.js`, `part: 4`, personne : Romain (`equipe`). Ligne du bandeau : « Les questions de Romain ».
Le panneau des questions ne montre pas de document (constat d'ENT-8.2) : **le texte utile est dans l'énoncé** ou à gauche de l'écran en cours.

| id | Geste | Qui pose | Question | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| `changer-prestataire` (L) | `fiche:qui:envoyer` | Romain | « Imagine : GXO livre mal les magasins pendant des mois. Que peut faire Action ? » — **choisir un autre prestataire à la fin du contrat, comme à Moissy-Cramayel** (`changer`) · fermer ses magasins (`fermer`) · rien : GXO appartient à Action (`rien`) · demander à Geodis de diriger GXO (`geodis`) | fil | **1,5** | tout de suite | contrat de prestation (client / prestataire) appliqué au cas ; le fait de Moissy est dans le document à gauche |
| `comme-geodis` (N) | `fiche:chaine:envoyer` | Romain | « Je dis souvent : “ici, c'est comme chez Geodis à Ensuès”. Qu'est-ce qui est pareil ? » — **les deux stockent et préparent les commandes pour Action** (`metier`) · c'est la même entreprise (`meme`) · c'est le même patron (`patron`) · ils fabriquent les produits (`fabrique`) | fil | **1** | tout de suite | types d'organisation (C1.1.1) ; après l'envoi : ne touche plus aucun jalon |
| `deux-planchers` (P) | `fiche:change:<id de la 1re ligne>` | Romain | « Regarde le camion à gauche : il a deux planchers. À quoi ça sert ? » — **mettre plus de palettes dans un camion, donc faire moins de trajets** (`plus`) · le rendre plus solide (`solide`) · séparer deux magasins (`separer`) | fil | **1,5** | tout de suite | fait vérifié (195 semi-remorques à deux planchers) ; ancrée sur l'image de l'écran ; ne donne aucune situation |

- **Retours proposés** : L : « Oui : Action est le client de GXO. Si le travail est mal fait, Action peut choisir un autre prestataire, comme à
  Moissy-Cramayel. » · N : « C'est le même métier : on stocke et on prépare pour Action. Mais ce sont deux entreprises différentes. » · P :
  « Deux planchers, c'est presque deux fois plus de palettes par voyage : moins de camions sur la route. »
- Poids : L 1,5 · N 1 · P 1,5 → 4.
- `geodis` dans L est un piège volontairement absurde pour un CAP qui a fait 8.1 ; à retirer si Tristan le trouve trop facile (3 choix restent).

## 4 ter. Avant de commencer — **validé par Tristan le 15/10/2026**

Bloc `ouverture` (Romain), `tirage: { preparation: 3, image: 1 }` (7 ≥ 6 ; 3 ≥ 2). Non notées, sans le dire.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `prestataire` | préparation | Une entreprise qui fait la logistique pour une autre, c'est… | un prestataire logistique | un fournisseur · un client | — | ★ |
| `tuteur` | préparation | Ton tuteur de stage, c'est… | la personne de l'entreprise qui te guide | ton professeur · le directeur d'Action | — | ★ |
| `ouverture` | préparation | Avant qu'un nouveau magasin ouvre, il faut… | le remplir avec des produits livrés par l'entrepôt | attendre les clients · fabriquer les produits | photo `rayon` | ★ |
| `etiquette-palette` | préparation | L'étiquette sur une palette sert à savoir… | à quel magasin elle va | qui l'a filmée · combien elle coûte | photo `palette` | |
| `nouveautes` | préparation | Chez Action, chaque semaine… | environ 150 nouveaux produits arrivent | rien ne change · tous les magasins ferment | — | |
| `code-postal` | préparation | Lyon 69003 : quel département ? | 69 | 03 · 690 | — | |
| `client-prestataire` | préparation | GXO travaille pour Action. Pour GXO, Action est… | un client | un concurrent · un salarié | — | |
| `img-quai-numero` | image | Ce numéro au-dessus de la porte sert à… | savoir à quel quai le camion doit se mettre | compter les camions · ranger les palettes | photo libre (nouvelle) | |
| `img-rassemblement` | image | Ce panneau montre… | le point de rassemblement, où aller quand l'alarme sonne | la sortie des camions · le vestiaire | pictogramme redessiné (nouveau) | |
| `img-palette-filmee` | image | Pourquoi filme-t-on une palette ? | pour que les cartons ne tombent pas pendant le transport | pour la décorer · pour la peser | photo `palette` | |

- Écartées (Tristan) : remorque à deux planchers (donnerait P), « même métier qu'à Ensuès » (donnerait N), code postal de Labastide (donnerait
  un département).
- `etiquette-palette` et `img-palette-filmee` touchent des situations faciles de l'étape 4 sans en donner la réponse (elles disent à quoi sert
  l'objet, pas ce qui arrive au magasin) : à juger à l'écran.

## 5. Jalons / notation (sur 20) — **poids validés par Tristan le 15/10/2026**

| Bloc (ligne du bandeau) | Cases (un jalon chacune) | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **La carte de France** | région et département × 3 lieux, 0,75 chacun | **4,5** | `etapesLocaliser(L, séance)` | premier essai ; pas d'`ecran` ; l'étape ville ne compte pas |
| **Qui est qui ?** | 3 entrepôts 0,75 chacun ; 2 rôles 0,875 chacun | **4** | `ficheEnvoyee(db,'qui').valeurs` | `titreBilan` : le **nom de l'entrepôt** ou de l'acteur (ordre tiré) ; la banque garantit **au moins 2 exploitants différents** parmi les 3 lignes (sinon « tout GXO » rapporte) |
| **La chaîne de Romain** | erreur trouvée × 2 (1 chacune) ; bonne étiquette × 2 (1 chacune) | **4** | fiche `chaine` | jugé **sans ordre** (voir dessous) ; une même case nommée deux fois ne compte qu'une fois ; une case juste nommée « fausse » ne rapporte rien |
| **Ce que je change** | situation facile 1 ; moyenne 1,25 ; difficile 1,25 | **3,5** | fiche `change` | `titreBilan` : « la situation n° k » (rang sur la fiche de l'élève) |
| **Les questions de Romain** | L 1,5 · N 1 · P 1,5 | **4** (`part: 4`) | moteur des questions | — |
| **Total** | | **20** | | |

- **La chaîne, jugée sans ordre** : soit F = {f1, f2} les cases fausses de l'élève. Jalon « erreur trouvée n° i » = une des deux lignes nomme
  `fi`. Jalon « bonne étiquette n° i » = la ligne qui nomme `fi` propose l'étiquette juste de `fi`. Titres au bilan : « La chaîne : une
  erreur trouvée », « La chaîne : l'erreur corrigée » (numérotés 1 et 2 par le moteur), **jamais le numéro de la case**.
- **Anti-inaction** : fiche vide = 0 ; rien fait = 0/20.
- **Corriger** : `ecran: 'fiche:qui'`, `'fiche:chaine'`, `'fiche:change'` ; accusé de réception de Romain à chaque renvoi, jamais « juste ».
- **Confirmé** : Onnaing (2 jalons bonus) et une situation de plus (`bonus: true`, sans poids ni groupe) ; bandeau identique.

## 6. Contenu (données)

- `contenus/action.js` (univers) : ajouter **Roques** et (si absente) **Onnaing** aux lieux possibles, sans changer les lieux d'ENT-8.1 ; le
  document « Le réseau d'Action en France » s'il peut servir à l'évaluation.
- `contenus/action-ent83.js` (+ `action-ent83-donnees.js` si besoin, comme 8.1) : messages, carte, fiches, document dessiné, banques, jalons.
- `contenus/questions/ENT-8.3.js` ; `activites/action-autre-site.js` ; `contenus/corriges/ENT-8.3.js` (par élève : ses entrepôts et
  acteurs tirés et leurs réponses, ses 2 cases fausses et leurs étiquettes justes, ses situations).
- Valeurs attendues **recalculées par le code** ; dans les tests, écrites à la main.

### 6.1 La chaîne juste (6 cases, fixe)

| n | Étiquette juste |
|---|---|
| 1 | Une usine en Asie fabrique le produit |
| 2 | Un porte-conteneurs le transporte |
| 3 | Le port du Havre le reçoit |
| 4 | L'entrepôt GXO de Labastide le stocke et le prépare |
| 5 | Le nouveau magasin de Roques le vend |
| 6 | Le client l'achète |

## 6 bis. Tirage et niveaux (règle du 08/10/2026)

### Banque `entrepots` — fiche « Qui est qui ? », partie 1

Fixe : **Labastide-Saint-Pierre → GXO**. Tirés : **2** parmi Ensuès-la-Redonne (Geodis), Verrières-en-Anjou (Kuehne+Nagel), Belleville
(Kuehne+Nagel), Onnaing (GXO), Moissy-Cramayel (GXO). `verifier` : **au moins 2 exploitants différents** sur les 3 lignes (re-tirage sinon).
Ordre des lignes mélangé. Confirmé : rien de plus (son bonus est Onnaing sur la carte : si Onnaing est tiré ici, c'est permis).

### Banque `acteurs` — fiche « Qui est qui ? », partie 2

| id | Acteur | Rôle juste | Difficulté |
|---|---|---|---|
| `roques` | Le nouveau magasin de Roques | vend les produits aux clients | facile |
| `romain` | Romain | te guide pendant ton stage | facile |
| `lycee` | Ton lycée | t'envoie en stage et suit ta formation | moyen |
| `fournisseur` | Un fournisseur | fabrique les produits qu'Action achète | moyen |
| `transporteur` | Le transporteur | emmène les palettes de l'entrepôt au magasin | difficile |

- Rôles offerts à chaque ligne (7, ordre fixe) : les 5 rôles justes + « stocke et prépare les commandes pour Action » + « achète au magasin ».
- Socle `{ facile: 1, moyen: 1 }` ; bonus : aucun. Ordre mélangé.

### Banque `erreurs` — la chaîne de Romain (2 cases fausses par élève, positions différentes)

| id | Case | Étiquette fausse | Difficulté |
|---|---|---|---|
| `e-avion` | 2 | Un avion le transporte | facile |
| `e-nimes` | 5 | Le magasin de Nîmes le vend | facile |
| `e-ensues` | 4 | L'entrepôt Geodis d'Ensuès le stocke et le prépare | moyen |
| `e-marseille` | 3 | Le port de Marseille le reçoit | moyen |
| `e-labastide` | 1 | Une usine à Labastide fabrique le produit | difficile |
| `e-fournisseur` | 6 | Le fournisseur l'achète | difficile |

- Socle : **1 facile + 1 moyenne ou difficile**, sur deux cases différentes. `e-marseille` : vérifié qu'aucune source ne relie Action au port de
  Marseille-Fos (cadrage d'Action) ; l'erreur reste plausible pour un élève du Sud.
- Étiquettes offertes dans la fiche : les 6 justes + 3 fausses, dont **les 2 de l'élève** (la 3e tirée parmi les autres).

### Banque `situations` — « Ce que je change » (au magasin de Roques)

| id | Situation (ce que tu fais) | Juste | Pièges | Difficulté |
|---|---|---|---|---|
| `s-etiquette` | Tu colles l'étiquette « Nîmes » sur une palette pour Roques. | La palette part à Nîmes : le rayon de Roques reste vide. | Rien, le magasin corrige l'étiquette · La palette arrive plus vite | facile |
| `s-film` | Tu oublies de filmer une palette. | Des cartons tombent dans le camion : des produits arrivent cassés. | Rien, le film ne sert à rien · Le camion part plus vite | facile |
| `s-cartons` | Tu prépares 10 cartons de bougies au lieu de 12. | Il manque 2 cartons de bougies en rayon. | Il y a 2 cartons de trop · Rien, personne ne compte | facile |
| `s-emplacement` | Tu ranges une palette de jouets au mauvais emplacement. | On ne la trouve pas pour préparer Roques : les jouets manquent. | Les jouets arrivent en double · Rien, le magasin a d'autres jouets | moyen |
| `s-lourd` | Tu poses une palette lourde sur des cartons fragiles. | Des produits fragiles arrivent écrasés. | Rien, le carton protège tout · La palette arrive plus vite | moyen |
| `s-compte` | À la réception, tu notes 50 cartons au lieu de 40. | L'ordinateur croit qu'il y a du stock : la commande de Roques est incomplète. | Le magasin reçoit 10 cartons de plus · Rien, c'est un détail | moyen |
| `s-ordre` | Roques est le premier magasin livré, mais tu charges sa palette au fond du camion. | Le chauffeur doit décharger d'autres palettes : Roques est livré en retard. | Rien, le chauffeur trouve toujours · Roques reçoit deux fois ses produits | difficile |
| `s-reserve` | Un carton arrive abîmé du fournisseur et tu ne le signales pas. | Le magasin reçoit un produit abîmé, et on ne peut plus se retourner contre le fournisseur. | Le fournisseur le remplace tout seul · Rien, le client ne verra pas | difficile |

- Choix par ligne : le juste + ses 2 pièges + « Rien ne change au magasin » (4 ; ordre mélangé). Socle `{ facile: 1, moyen: 1, difficile: 1 }` ;
  bonus confirmé `{ moyen: 1 }`. Toutes les situations sont **construites** ; `s-cartons` et `s-reserve` reprennent l'esprit d'ENT-8.1 (entraînement).
- `s-etiquette` ressemble à `e-nimes` : jamais tirées ensemble (`verifier`).

### Le reste

- Carte : 3 lieux fixes, bonus Onnaing. Romain, messages, chaîne juste : pièces fixes.
- **Accompagné** : la carte au niveau accompagné ; fiches standard.
- **Consignes neutres** : aucune ne dit le nombre de lignes tirées (la chaîne dit « deux erreurs » : ce n'est pas un nombre de cas bonus).

## 7. Demandes au moteur — état des lieux d'abord (le dire à Tristan avant de contourner)

Aucune vue nouvelle. À vérifier :

1. **Localiser avec des lieux propres à la séance** : ENT-8.1 lit `LIEUX` de l'univers. Une séance peut-elle déclarer ses lieux (Labastide
   dans le socle, alors qu'il est **bonus** dans `LIEUX` et dessiné dans `RESEAU`) ? Labastide ne doit pas être dessinée deux fois (rond
   creux + lieu). Si le moteur ne sait pas, c'est une demande au moteur : le dire.
2. **`suite` avec des écrans ouverts par `apresFiche`** (§0 bis, point 3) : la barre « Étape suivante » doit mener à l'écran, pas à la
   Messagerie, quand l'écran est ouvert et que le message de Romain n'est pas lu.
3. **Un document dessiné qui dépend du tirage**, assez grand sur un petit écran (`largeurDocs`) : la chaîne de Romain (6 cases).
4. **Jalons « sans ordre »** de la chaîne : contenu seul (fonction de jalon), rien à demander a priori.
5. **Image à gauche d'une fiche** (la remorque) : document `html` avec `<img>`, comme `DOC_ACTION`.

### 7 bis. Séance déjà jouée par des élèves ?

Non : séance nouvelle.

## 8. Tests attendus

Bloc nouveau `outils/test/action-83.mjs` (+ une ligne dans `BLOCS` et dans `GROUPES` de `outils/test.mjs` : **le dire à Tristan**) ; ligne
`ATTENDU_CAP` dans `outils/test/socle.mjs`. Graines choisies dans le test, valeurs écrites à la main.

- **Parcours juste** : 20/20, bandeau à 5 lignes ✓. **Inaction** : 0/20. **Tout faux** : premier bilan atteint, séance finie, ENT-8.4 ouverte.
- **Un écran par étape** : après l'envoi de « Qui est qui ? », l'écran « La chaîne de Romain » est ouvert **sans passer par la Messagerie** ;
  la barre « Étape suivante » y mène ; le document est visible à gauche de la fiche (sans clic).
- Carte : département faux au premier essai → bloc ✗, l'élève finit ; « Corriger » ne rouvre pas la carte.
- Qui est qui : 300 graines → toujours ≥ 2 exploitants différents ; Labastide toujours présente ; « Action lui-même » partout → 0 sur la partie 1.
- Chaîne : les deux erreurs nommées **dans l'ordre inverse** → 4/4 ; la même case deux fois → 1 erreur trouvée au plus ; une case juste nommée →
  rien ; bonne case mais mauvaise étiquette → trouvée ✓, corrigée ✗ ; 300 graines → 2 cases différentes, jamais `s-etiquette` avec `e-nimes`.
- Ce que je change : « Rien ne change » partout → 0 sur le bloc.
- Questions : P se déclenche au choix de la **1re** ligne ; part 4 ; somme des poids 20.
- `bilanDetail` : les titres de ligne ne contiennent ni le rôle juste, ni l'exploitant juste, ni le numéro d'une case fausse.
- Confirmé : Onnaing sur la carte, 4 situations, bandeau identique, mot « bonus » absent.
- Parcours : ENT-8.3 fermée tant qu'ENT-8.2 n'a pas son premier bilan.
- Sabotage par bloc ; garde « 2 exploitants » retirée → le cas des 300 graines tombe ; jugement de la chaîne rendu dépendant de l'ordre → le
  cas « ordre inverse » tombe.

## 9. Supports pour les élèves

- **Trame** (Cowork, après validation à l'écran) au format court d'ENT-8.1 : connexion, mission, déroulé à cocher, vrai/construit ; **cours**
  sur une feuille à part (« distribué à la fin ») : un donneur d'ordres, plusieurs prestataires ; la chaîne jusqu'à Roques ; 4 mots du lexique.
  Noir et blanc.
- **Corrigé enseignant** : `contenus/corriges/ENT-8.3.js`.

## 10. Critères de validation par Tristan

- **On ne change jamais d'écran au milieu d'une étape** ; la barre « Étape suivante » suffit pour avancer.
- La chaîne de Romain se lit au vidéoprojecteur et sur un écran du lycée ; les deux erreurs se voient sans être soulignées.
- Le document « Le réseau d'Action » se lit en moins d'une minute.
- Chaque consigne fait 3 lignes au plus ; aucun texte à taper.
- 45 minutes suffisent.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [ ] **1. Carte « un cran au-dessus » en entraînement ?** (Défaut : **non**, mêmes niveaux qu'en 8.1, décision 13 du 15/10 ; aucun chantier
  moteur. Si Tristan veut moins d'aide sur la carte en entraînement, c'est une option de séance à demander au moteur.)
- [ ] 2. Textes construits par Cowork (messages, document du réseau, situations, retours) : à relire à l'écran.
- [ ] 3. Pictogramme du point de rassemblement en traits seulement (sans vert) : à juger à l'écran.
- [x] Roques = « le nouveau magasin », sans adresse ni date d'ouverture (Tristan, 16/10).
- [x] Un écran par étape (Tristan, 16/10).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

*(Claude Code, Opus, sous-agent du chef de chantier, 16/10/2026 ; décisions de cadrage : `COORDINATION-action.md` §6.2.)*

- **Fichiers créés / modifiés** :
  - créés : `contenus/action-ent83.js` (messages, carte, documents, fiches, jalons, options), `contenus/action-ent83-donnees.js` (lieux,
    banques, tirage, chaîne, jugement sans ordre), `contenus/questions/ENT-8.3.js`, `contenus/corriges/ENT-8.3.js`, `outils/test/action-83.mjs` (21 cas) ;
  - remplacé : `activites/action-autre-site.js` (le squelette ; `id` inchangé) ;
  - ajouts seulement : `contenus/action.js` (exports nouveaux `LIEU_ROQUES`, `LIEU_ONNAING` ; `LIEUX`/`RESEAU` d'ENT-8.1 intacts) ;
    `activites/index.js` (ligne `metier` de l'entreprise n° 8 : « Commerce à petits prix — entrepôts Geodis (Ensuès-la-Redonne) et GXO
    (Labastide-Saint-Pierre) ») ; `outils/test.mjs` (`action-83` dans `BLOCS` et `GROUPES[2]`) ; `outils/test/tirage-niveaux.mjs`
    (`BANQUES_FIGEES`) ; `outils/test/socle.mjs` : **cas existant réécrit** (alerte 7) — CAP-C1.1 compte maintenant 5 séances :
    « 10/20 (1/5) » et « 1 sur 5;10 » au lieu de « 1/4 » (commentaire du cas daté).
- **Vérifié / construit** : VÉRIFIÉ = les faits du §2 (exploitants des six entrepôts, Moissy ID Logistics → XPO → GXO, Onnaing le plus
  récent, deux planchers, ≈ 150 nouveautés, arrivée annoncée d'Action à Roques) ; positions relevées par Claude Code dans OSM (Nominatim,
  16/10/2026) : Roques = **centre de la commune** (relation 158891, dit dans le texte de fin de la carte et dans `MENTION`), Onnaing =
  centre de la commune (relation 53706), villes « autres » et repères = centres de commune. CONSTRUIT (dit dans `MENTION`) : Romain, ses
  messages, que Labastide livre Roques, le trajet, la chaîne de Romain, les situations, tous les documents.
- **Écarts par rapport au brief** (et pourquoi) :
  1. Banque `erreurs` coupée en **deux banques** (`erreurs` : les 2 faciles, 1 tirée ; `erreursMd` : les 4 autres déclarées `moyen`, 1 tirée,
     la difficulté du brief gardée dans `niveau` pour le corrigé) : le tirage veut des effectifs fixes par difficulté, « 1 moyenne OU
     difficile » ne s'écrit pas autrement (option laissée au constructeur par le chef de chantier). Chaque erreur a sa case : deux
     erreurs ne tombent jamais sur la même case.
  2. Banque `entrepots` : le brief ne donne pas de difficulté ; les 5 tirables sont `moyen` (2 tirés).
  3. « Qui est qui ? » s'ouvre par `quand` (absente du menu jusqu'à la fin de la carte), « La chaîne » et « Ce que je change » par
     `fermetures` (grisées avec la raison). Vu à l'écran : le menu n'est pas redessiné à la fin de la carte (limite connue du moteur), une
     entrée grisée « Après la carte de France » y restait alors que la barre menait déjà à la fiche.
  4. La chaîne est dessinée en **deux rangées de trois** (1 → 2 → 3, retour fléché, 4 → 5 → 6) et non en colonne : la colonne descendait
     sous l'écran à 1366 × 768 (895 px).
  5. Titres du bilan de la chaîne sans chiffre (« une erreur trouvée » / « l'autre erreur trouvée », idem « corrigée ») plutôt que la
     numérotation du moteur, pour qu'aucun chiffre ne se confonde avec un numéro de case.
  6. Clés des choix : celles des situations sont propres à chaque conséquence, celles des étiquettes de la chaîne sont des lettres
     neutres (la valeur d'une option ne trahit pas la bonne réponse).
  7. Énoncé `img-quai-numero` adapté à la photo livrée : « La plaque au-dessus de chaque porte (B56, B57…) sert à… ».
  8. L'entreprise de la séance remplace celle de l'univers (`ENTREPRISE`, `VOCAB` exportés par le contenu) : le bandeau dit « Entrepôt GXO
     de Labastide-Saint-Pierre (82) » ; Romain est déclaré dans le fichier de questions (l'univers ne connaît que l'équipe d'Ensuès).
- **Décisions prises en route** : `largeurDocs: 1.25` pour la chaîne ; remorque sur un fond clair translucide (`.ac-trait`) ; mot cliquable
  « remorque à deux planchers » défini sans dire à quoi elle sert (« deux étages ») — il rapproche quand même de P, à juger.
- **Tests** (port 8112) : `action-83` **21/21** ; `socle`, `tirage-niveaux`, `action-81`, `action`, `questions`, `dependances` verts.
  Sabotages : garde « 2 exploitants » retirée → tombe « équité sur 300 graines » (seul) ; jugement de la chaîne rendu dépendant de l'ordre →
  tombent « la chaîne à l'écran (ordre inverse) » et « jugement sans ordre (fonction pure) » ; deux poids échangés dans « Qui est qui ? »
  (somme gardée à 20) → tombent « la séance se charge » (poids jalon par jalon) et « Action lui-même partout » (17,625 au lieu de 17,75).
  Captures de chaque écran relues à 1366 × 768.
- **Commits** : aucun (le chef de chantier commite).
- **Reste ouvert** :
  1. **Moteur** : les cartes « Nouveau message » non lues s'empilent en haut à droite (jusqu'à trois) **par-dessus le panneau des
     questions et le haut des fiches** : avec « un écran par étape », l'élève ne passe plus par la Messagerie, les cartes restent (le test
     les ferme avant de répondre). Piste : fermer la carte quand l'élève ouvre l'écran que le message apporte (`ouvreFiche`).
  2. **Moteur** : pendant « Avant de commencer », la barre dit « lis ton nouveau message — Ouvrir la Messagerie » alors que la Messagerie
     est fermée jusqu'aux réponses ; le menu n'est pas redessiné à la fin de la carte (voir écart 3).
  3. Textes construits à relire à l'écran (Tristan) : messages de Romain, document « Le réseau d'Action en France », « Ton stage chez
     GXO », consignes d'écran (`sousTitre`), titre de la carte, texte de fin de la carte, les 8 situations et leurs pièges, les 7 rôles,
     les 10 questions d'ouverture et leurs retours, L, N, P et leurs retours, les définitions nouvelles du lexique.
  4. À juger à l'écran : la chaîne au vidéoprojecteur ; le titre de la carte (consigne de Romain, sur 4 lignes en petites capitales) ;
     les listes longues de « Ce que je change » coupées dans la case fermée (lisibles une fois ouverte) ; le pictogramme en traits.
  5. Trame et cours : Cowork, après validation à l'écran.
