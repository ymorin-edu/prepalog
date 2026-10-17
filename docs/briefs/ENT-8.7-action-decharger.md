# Brief de séance — ENT-8.7 Action — on décharge ensemble (CAP OL, guidage CAP-C1.3)

> **📋 Phrase à copier-coller dans Claude Code :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md puis docs/briefs/ENT-8.7-action-decharger.md et docs/briefs/ENT-8.8-action-controler.md en entier. Commence par l'état des lieux du §7.4 et dis-moi ce qui contredit le brief. Puis le chantier moteur du §7 (lots 1 à 3, un seul chantier moteur à la fois : attends que le chantier ENT-8.5 soit effacé de EN-COURS), puis ENT-8.7, puis ENT-8.8. Annonce la durée avant de commencer.
> ```

**Statut** : à implémenter
**Date du brief** : 16/10/2026
**Conversation d'origine** : Cowork (Opus), cadrage du 16/10/2026, 18 h 23 → 18 h 54 (fiche du projet `claude/prepalog-action-cadrage-8.7.md`,
11 décisions de Tristan), puis brief écrit le 16/10 à 19 h 02 sur délégation de Tristan (« écris le brief de 8.7 et 8.8, tu prends les
décisions »). **Les décisions de Cowork qui changent une décision de Tristan sont signalées ⚠ et listées au §11.**
**Modèle** : chantier moteur §7 : **Sonnet** pour les lots 1 et 3, **Opus** pour le lot 2 (interaction nouvelle dans la vue quai). Séance : **Opus**.
**Place dans l'ordre** : après ENT-8.6 (fin du chantier ENT-8.5 / 8.6 en cours le 16/10) ; le chantier moteur §7 avant la séance ; ENT-8.8 juste après.
**Durée estimée par Cowork** : moteur ≈ 5 à 6 h (lot 1 ≈ 2 h, lot 2 ≈ 3 h, lot 3 ≈ 45 min, tests compris) ; séance ≈ 5 h. Ce qui prend le temps :
le protocole de sécurité dessiné (une page), le dialogue et ses réactions, la déclaration du quai (scène, 5 palettes, cases de dépose), les tests.

---

## 0. Règles communes à Action (CAP OL)

- **§0 d'ENT-8.1 et §0 d'ENT-8.2** : public CAP (une consigne par écran, 3 lignes au plus, tout en cliquant) ; stagiaire en PFMP chez
  **Geodis à Ensuès-la-Redonne** ; **Samia** (cheffe d'équipe réception, tutrice), **Kevin** (cariste), **Julie** (agent administratif) —
  construits ; aucune année ; « Avant de commencer » sur les notions du scénario ; jalons pondérés sur 20, questions au fil 4 points,
  `parcours`, `correction` ; jamais un élève bloqué ; ce qui est construit se dit dans la séance.
- **§0 bis d'ENT-8.3 : un écran par étape** (document à gauche de la fiche, consigne de Samia en haut de l'écran, écran suivant ouvert à
  l'envoi du précédent, barre « Étape suivante » (`suite`), pas de point d'étape, `bilanDetail: true`, `titreBilan` sur les jalons tirés).
- **Suite directe d'ENT-8.2** : même jour (**mardi 9 novembre**), même camion du Havre, **quai 2, 7 h** (grille identique pour toute la classe
  en 8.2 : on la garde), même transporteur construit qu'en 8.2 (**« Transports Seine-Provence »**, ⚠ §11 n° 1).

Écrans de l'élève : **Avant de commencer → Le protocole du quai 2 → Au quai : accueillir le chauffeur → Le quai 2 (inspecter, décharger)** → bilan.
Trois écrans de travail, deux vues nouvelles pour ces élèves (le dialogue, le quai) : pas plus.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.7 (provisoire) |
| `id` (jamais modifié ensuite) | `action-decharger` |
| Titre / desc | « Action — on décharge ensemble » / « Appliquer le protocole de sécurité du quai, accueillir le chauffeur, vérifier que le quai et le camion sont sûrs avant de décharger, et diriger le déchargement. » |
| Rubrique | simulog, entreprise n° 8 Action |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competences: []`, `competencesCap: ['CAP-C1.3']` (« Prendre en charge les opérations de réception ») ; sous-compétences : C1.3.1 accueillir · C1.3.2 protocole de sécurité · C1.3.3 pré-contrôle · C1.3.4 décharger. Ligne `'ENT-8.7': 'CAP-C1.3'` dans `ATTENDU_CAP` (`outils/test/socle.mjs`) : le dire (alerte 7). |
| Temps pédagogique | `temps: 'guidage'` (coefficient 1) |
| Notation | jalons pondérés, note sur 20, `parcours: true`, `correction: true`, `bilanDetail: true`, `precedente: 'action-avant-noel'` (ENT-8.4, dernière séance du parcours d'Action : les évaluations 8.5 / 8.6 n'ont pas de `parcours`) |
| Barème | `bareme: 20` |
| Niveaux d'élève | `niveauxPrevus: ['confirme', 'accompagne']` (§6 bis) |
| `questions` | `'ENT-8.7'` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

- **Vérifié** (Cowork, 15 et 16/10/2026) : voir ENT-8.1 et ENT-8.2 §2 (Action ; centre de distribution d'Ensuès-la-Redonne exploité par Geodis,
  55 000 m², inauguré le 1/06/2023, magasins du Sud-Est : [communiqué d'Action](https://company.action.com/wp-content/uploads/2023/06/PressRelease_DC-Ensuess.pdf) ;
  offre « GEODIS/ACTION » : [France Travail 191TDTN](https://candidat.francetravail.fr/offres/recherche/detail/191TDTN), actualisée le 29/04/2025).
- **Textes de loi** (vérifiés le 16/10/2026 sur [code.travail.gouv.fr](https://code.travail.gouv.fr/code-du-travail/r4515-6)) — **recopier le texte
  exact depuis Légifrance à la construction**, date de consultation en pied :
  - **R4515-4** : « Les opérations de chargement ou de déchargement font l'objet d'un document écrit, dit « protocole de sécurité »,
    remplaçant le plan de prévention. »
  - **R4515-6** (ce que contient le protocole pour l'entreprise d'accueil) : 1° les consignes de sécurité, particulièrement celles qui
    concernent l'opération de chargement ou de déchargement ; 2° le lieu de livraison, les modalités d'accès et de stationnement aux postes
    de chargement ou de déchargement, accompagnées d'un plan et des consignes de circulation ; 3° les matériels et engins spécifiques
    utilisés ; 4° les moyens de secours en cas d'accident ou d'incident ; 5° l'identité du responsable désigné par l'entreprise d'accueil.
  - **R4515-8** : « Le protocole de sécurité est établi dans le cadre d'un échange entre les employeurs intéressés, préalablement à la
    réalisation de l'opération. » (+ R4515-3 / R4515-9 : opérations répétitives, un seul protocole avant la première.)
  - INRS : préciser dans le protocole **l'emplacement d'attente du conducteur**, à l'écart des chariots ([INRS](https://www.inrs.fr/metiers/transport/transport-routier-marchandises/transport-routier-marchandises-agir.html)).
- **Construit (à dire dans la séance)** : l'accueil des chauffeurs chez Geodis à Ensuès (rien de publié) ; le **protocole du quai 2** (reconstitué
  d'après R4515-6, consignes et valeurs construites : 10 km/h, local chauffeurs, point de rassemblement…) ; le chauffeur **Marc** ; le chargement du
  camion (**5 palettes filmées, une sorte de produit par palette**, refaites au hub du Havre) ; les produits (désignations génériques, aucune marque) ;
  la scène du quai ; les cases de dépose. Les gestes de quai (cale, clés, niveleur, lampe, butoirs) sont la pratique courante, déjà utilisée en ENT-5.4
  et ENT-6.4, **sans source officielle relue** sur ces gestes précis.
- **Documents reconstitués** : pied « Document pédagogique — reconstitution, non contractuel ». Logo d'Action : déjà au dépôt (ENT-8.1).
- **Image** : `contenus/images/action/chariot-elevateur.jpg` (ENT-8.4) pour la ligne « qui décharge » ; dessin de cale pour `img-cale` (kit iso ou
  photo libre sans marque ni visage, alerte 10) ; feux de quai : photo libre ou dessin.

## 3. Objectif pédagogique

À la fin, l'élève sait **appliquer le protocole de sécurité** d'un quai à des situations, **accueillir un chauffeur** poliment et l'envoyer au
bon endroit, **vérifier que le camion et le quai sont sûrs** avant de décharger et **signaler** ce qui ne va pas sans décharger, et **diriger le
déchargement** (qui décharge, avec quoi, où poser chaque palette). Premier temps de CAP-C1.3, juste après ENT-8.2. Le contrôle des palettes est
**laissé à ENT-8.8** (CAP-C1.4) : la séance s'arrête quand les 5 palettes sont au sol. Pas de doublon avec ENT-5.4 / 6.4 (déjà ouvertes au CAP) :
ici le déchargement est fait par le cariste, l'élève applique le protocole et dirige.

## 4. Déroulé (≈ 45 min)

**Date : mardi 9 novembre, 6 h 45 → 7 h 30** (sans année).

### Étape 0 — Avant de commencer (non notée, Samia) — §4 ter

### Étape 1 — Le protocole du quai 2 (fiche, document à gauche)

- **Message de Samia** (aussi en `sousTitre`) : « Le camion du Havre arrive dans un quart d'heure. Avant, lis le protocole de sécurité du quai 2,
  et dis-moi ce qu'il faut faire dans chaque cas. Samia »
- **Document à gauche** : « Protocole de sécurité — chargement et déchargement — Geodis, Ensuès-la-Redonne, quai 2 » (une page, §6.1), en
  rubriques numérotées comme R4515-6, avec pictogrammes.
- **Fiche « Le protocole du quai 2 »** (`liste`) :
  - **3 situations tirées** (§6 bis, banque de 8) : « Que dit le protocole ? » — 3 ou 4 consignes **toutes tirées du protocole**, une seule
    s'applique au cas.
  - **1 ligne fixe « Qui décharge le camion du Havre, et avec quoi ? »** (rubrique 3 du protocole « Matériels et engins »), photo du chariot
    élévateur à gauche de la ligne si le moteur le permet : **Kevin, cariste, au chariot élévateur frontal** · toi, au chariot élévateur
    frontal · le chauffeur, au transpalette · toi, au gerbeur. (Jalon du groupe « Déchargement », §5.) ⚠ §11 n° 3.
- Envoi : « Envoyer à Samia » ; questions M et L à l'envoi (§4 bis).

### Étape 2 — Au quai : accueillir le chauffeur (vue Dialogue à choix, mode « face à face », lot 3 du §7)

- **Message de Samia** (`apresFiche('protocole')`, aussi en `situation`) : « Le camion est là. Accueille le chauffeur et installe-le comme le dit
  le protocole. Planigramme : camion du Havre, quai 2, 7 h. Samia »
- Entrée de menu **« Au quai »** (`telephone.libelle`), contact **« Marc — chauffeur, camion du Havre »**, bouton « Aller le voir » (lot 3).
  Vouvoiement. Les réponses maladroites font **réagir Marc** (il ne corrige pas), la réplique revient, personne n'est bloqué.
- Répliques (textes proposés §6.2) : **arrivée** (saluer, se présenter) → **documents** (demander la lettre de voiture et le BL) → **quai**
  (quai 2, en marche arrière jusqu'aux butoirs) → **attente** (moteur coupé, clés remises, local chauffeurs) → **fin** (formule polie).
- ⚠ §11 n° 2 : c'est la **vue Dialogue** (prévue par la feuille de route « Dialogue à choix »), pas la réponse par phrases de la Messagerie.
- Ordre ⚠ §11 n° 4 : le protocole **avant** l'accueil (l'élève applique au chauffeur ce qu'il vient de lire).

### Étape 3 — Le quai 2 : inspecter, puis décharger (vue quai iso, sans froid, inspection sur la scène)

- **Message de Samia** (`dialogueFini('marc')`, aussi en consigne du quai) : « Kevin est prêt. Avant qu'il entre dans le camion, regarde le quai
  et le camion. Si quelque chose ne va pas, signale-le-moi. Samia »
- **Inspection sur la scène** (`securite.mode: 'scene'`, comme ENT-6.4) : vues **dehors** (cabine, cale, butoirs) et **dedans** (niveleur,
  lampe) ; **une anomalie tirée** (§6 bis) parmi les 5 objets de la vue ; « Signaler à Samia » / « C'est bon, on peut décharger ».
  **Guidage** : décharger avec un défaut non signalé → Samia arrête (sans dire lequel), l'élève peut encore signaler (comportement du lot 5).
  Réponses de Samia composées point par point (jamais un mot sur ce qui n'a pas été signalé), comme ENT-6.4 : `cabine` : « Bien vu : je fais
  couper le moteur, Marc me donne ses clés et va au local. » · `cale` : « Bien vu : je fais poser la cale. » · `niveleur` : « Bien vu : je pose
  le niveleur. » · `lampe` : « Bien vu : j'allume la lampe de quai. » · `butoirs` : « Bien vu : on ne décharge pas à ce quai sans butoirs, je
  préviens la maintenance… et je les fais remettre. » · une marque à côté : « Là, je ne vois rien qui cloche. »
- Question N à l'envoi du premier signalement (§4 bis).
- **Déchargement** : Kevin (silhouette sans visage) sort les palettes au **chariot frontal** (`dechargement: { par: 'cariste', nom: 'Kevin' }`,
  rendu iso). **Lot 2 du §7 : avant chaque palette, l'élève clique la case où Kevin la pose** dans la zone de réception du quai 2 (6 cases
  R1–R6) ; deux cases sont **sur l'allée piétonne** (marquage au sol hachuré) et deux **devant le quai 3** (pièges). Un choix faux : Kevin
  réagit (« Là, c'est l'allée piétonne : je ne pose pas ici. » / « Ça, c'est la zone du quai 3. ») et l'élève choisit à nouveau ; **le premier
  choix compte** (jalon). Une case occupée ne se propose pas (pas de gerbage à la réception : dit par Kevin dans sa première bulle).
- **Fin du quai** (lot 1 du §7, `arret: 'dechargement'`) : les 5 palettes sont au sol, le camion reste à quai porte ouverte, le chauffeur au local.
  Bandeau du quai : « Les 5 palettes sont en zone de réception. Le contrôle, c'est la prochaine fois. » Question P (§4 bis).

### Fin

- **Samia** : « Les palettes sont au sol. Maintenant, on vérifie qu'il ne manque rien. Samia » (amorce d'ENT-8.8).
- Premier bilan → bandeau ✓ / ✗ par bloc, détail à la case (`bilanDetail`). « Corriger » rouvre la fiche du protocole et le dialogue
  (« Revenir le voir », lot 3) ; **pas le quai** (`finFige` : « Le quai se joue une fois : le camion est déchargé. »).

**Mots cliquables** : protocole de sécurité, local chauffeurs, lettre de voiture, cale, butoirs, niveleur, allée piétonne, zone de réception,
cariste, CACES, chariot élévateur frontal.

## 4 bis. Questions au fil — tranché par Tristan le 16/10/2026 à 18 h 50 : M, N, P, L (Q et R écartées)

Fichier `contenus/questions/ENT-8.7.js`, `part: 4`, personnes : Samia, Kevin (`equipe`). Une ligne du bandeau : « Les questions de Samia ».

| id | Geste | Qui pose | Question (juste en gras) | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| `qui-ecrit` (M) | `fiche:protocole:envoyer` | Samia | « Ce protocole, qui l'a écrit ? » — **Geodis et le transporteur, ensemble, avant la première livraison** (`ensemble`) · le chauffeur, seul (`chauffeur`) · Action (`action`) · l'inspection du travail (`inspection`) | fil | **1,5** | tout de suite | notion juridique utile au cas ; texte fourni : R4515-4 et R4515-8 (document « Le droit », §6.1) |
| `pourquoi-local` (L) | `fiche:protocole:envoyer` (après M) | Samia | « Pourquoi le chauffeur attend-il au local et pas à côté de son camion ? » — « Pour ne pas être sur le passage des chariots » · « Pour ne pas repartir pendant qu'on décharge » · « Pour que chacun sache qui est où en cas d'accident » · « Je n'y avais pas pensé » | fil | réflexion | tout de suite | C1.3.2 : comprendre la règle ; ne touche aucun jalon (l'attente au local est jugée au dialogue, qui vient après : la réflexion n'en dit pas plus que le protocole lu) |
| `decharge-quand-meme` (N) | `scene:<quai>:signaler` (premier envoi) | **Kevin** ⚠ §11 n° 5 | « On a du retard. Je décharge quand même pendant que Samia regarde ? » — **Non : on attend que Samia ait réglé le problème** (`attendre`) · Oui, vas-y (`oui`) · Je décharge moi-même (`moi`) · On renvoie le camion (`renvoyer`) | fil | **1,5** | tout de suite (le jalon de signalement est déjà joué) | C1.3.2 : tenir la règle face à la pression |
| `peut-partir` (P) | `quai:<quai>:decharge` (nouveau geste, lot 1) | Samia | « Kevin a posé la dernière palette. Marc peut-il repartir ? » — **Pas encore : il attend la fin du contrôle et la signature des documents** (`attendre`) · Oui, tout de suite (`oui`) · Oui, dès que Kevin est sorti du camion (`kevin`) | fil | **1** | tout de suite | ⚠ §11 n° 6 (texte changé) : le départ trop tôt reste le risque visé, et la réponse prépare ENT-8.8 |

- **Retours proposés** : M : « Les deux employeurs, ensemble, avant la première livraison : Geodis pour le site, le transporteur pour son camion.
  Pour un camion qui revient tous les jours, un seul protocole suffit. » · L (« Ce qu'en pense Samia ») : « Les trois : loin des chariots, il est
  en sécurité ; avec ses clés chez nous, le camion ne bouge pas ; et on sait où il est. » · N : « On attend. Un camion pas sûr, on n'y entre pas,
  même en retard. » · P : « Pas encore : on contrôle d'abord, on écrit les réserves s'il y en a, il signe, et là seulement je lui rends ses clés. »
- Poids : M 1,5 · N 1,5 · P 1 (L non notée) → 4.
- **Document « Le droit »** (joint à la fiche du protocole, à gauche, sous le protocole ou en second document) : R4515-4, R4515-6, R4515-8 (texte
  exact de Légifrance, date de consultation).

## 4 ter. Avant de commencer — validé par Tristan le 16/10/2026 à 18 h 51 (deux notions remplacées ⚠ §11 n° 7)

Bloc `ouverture` (Samia), **tirage 3 notions + 1 image** : `tirage: { preparation: 3, image: 1 }`. Non notées.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `protocole` | préparation | Un protocole de sécurité, c'est… | un document qui dit comment livrer et décharger sans danger sur ce site | un contrat de vente · le planning des camions | en-tête du protocole (titre et rubriques, **sans les consignes**) | ★ |
| `plan-circulation` ⚠ | préparation | Le plan de circulation d'un site montre… | par où passent les camions et les piétons | les rayons du magasin · les horaires de l'équipe | — | ★ |
| `anomalie` | préparation | Une anomalie, c'est… | quelque chose qui n'est pas normal et qu'on signale | une palette de plus · une pause | — | ★ |
| `zone-reception` | préparation | La zone de réception, c'est… | l'endroit devant les quais où on pose les palettes déchargées | le parking des camions · le stock | plan de la réception d'ENT-8.2 (`PLAN_RECEPTION`) | |
| `remorque` ⚠ | préparation | La remorque, c'est… | la partie du camion qui porte la marchandise | la cabine du chauffeur · le quai | — | |
| `caces` | préparation | Le CACES prouve que… | tu as appris à conduire un engin en sécurité | tu as le permis voiture · tu es chef d'équipe | — | |
| `vouvoiement` | préparation | Au chauffeur, que tu ne connais pas, tu dis… | « vous » | « tu » · « salut » | — | |
| `img-cale` | image | Cet objet devant la roue sert à… | empêcher le camion de bouger | gonfler le pneu · laver la roue | dessin ou photo libre | ★ |
| `img-feux` | image | Ces feux au bord du quai servent à… | dire au chauffeur s'il peut bouger ou non | éclairer la cour · signaler un incendie | photo libre ou dessin | |
| `img-niveleur` | image | La plaque bleue au bord du quai sert à… | passer du quai au camion avec l'engin | bloquer les roues du camion · peser la palette | photo du quai intérieur de Smoby, comme ENT-8.2 | |

- **Écartées** (Tristan) : `local-chauffeurs` (donnerait L et une situation), `img-transpalette` (donnerait l'engin), `qui-ecrit-protocole`
  (donnerait M). `vouvoiement` gardé en connaissance de cause (léger coup de pouce à la forme du dialogue).
- `caces` et la ligne « qui décharge » : la notion ne dit pas quelle catégorie conduit quel engin (c'est le protocole qui le dit) : gardé.

## 5. Jalons / notation (sur 20) — poids validés par Tristan le 16/10/2026 à 18 h 54 (répartition interne ⚠ §11 n° 8)

| Bloc (ligne du bandeau) | Cases (un jalon chacune) | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Accueillir le chauffeur** | salutation 0,5 · documents 1 · quai 1 · attente (moteur, clés, local) 1,5 · fin 0,5 | **4,5** | dernier appel terminé (`jalonDialogue` / `premiereReponse(appel, '<réplique>') === '<v juste>'`) | rien de vrai avant le raccrochage ; forme = 1 sur 20 (5 %) |
| **Le protocole** | 3 situations tirées : facile 1 · moyenne 1,5 · difficile 1,5 | **4** | `ficheEnvoyee(db,'protocole').valeurs[<ligne>]` | `titreBilan` (la situation, pas son rang) ; envoyer à vide = 0 |
| **Avant de décharger** | anomalie signalée **avant** « C'est bon » 3 · aucun faux signalement 1 | **4** | `securite.signaux` du quai (jalons `securite-<id>`, `securite-aucun-faux`) | « aucun faux » est **faux si rien n'a été signalé** (pas de prime à l'inaction) ; une marque enlevée avant l'envoi ne compte pas |
| **Diriger le déchargement** | « qui décharge, avec quoi » 1 · dépose de chaque palette au premier choix 0,5 × 5 | **3,5** | fiche `protocole` (ligne `engin`) ; état du quai (lot 2 : `depose[<palette>].premier`) | une palette non posée = faux ; rien n'est vrai avant la fin du déchargement |
| **Les questions de Samia** | M 1,5 · N 1,5 · P 1 | **4** (`part: 4`) | moteur des questions | — |
| **Total** | | **20** | | |

- **Corriger** : `ecran: 'fiche:protocole'`, `'dialogue:marc'` ; le quai n'a pas d'`ecran` (`finFige`). Accusé de réception à chaque renvoi.
- **Confirmé** : jalons `bonus: true` (sans poids ni groupe) : 4e situation, 2e anomalie (§6 bis) ; bandeau identique, mot « bonus » absent.
- **Anti-inaction** : rien fait = 0/20 (cas de test).
- **Sous-compétences** (pour Tristan) : C1.3.1 = 4,5 · C1.3.2 = 4 + M 1,5 + N 1,5 = 7 · C1.3.3 = 4 · C1.3.4 = 3,5 + P 1 = 4,5.

## 6. Contenu (données)

- **`contenus/action.js`** (univers) : y ajouter **`CAMION_HAVRE`** — les 5 palettes du camion du Havre, **pièce fixe partagée par ENT-8.7 et
  ENT-8.8** (§6.3), et le document « Le droit — quai » (R4515-4, -6, -8) s'il sert aux deux. ⚠ Le chantier ENT-8.5 touche `contenus/action*.js` le
  16/10 : attendre qu'il soit effacé de `docs/EN-COURS.md`.
- **`contenus/action-ent87.js`** (et `action-ent87-donnees.js` si besoin) : messages, protocole, fiche, dialogue, quai, banques et tirage, jalons, ouverture.
- **`contenus/questions/ENT-8.7.js`** ; **`activites/action-decharger.js`** ; **`contenus/corriges/ENT-8.7.js`** (par élève : ses situations et leurs
  réponses, son anomalie, les cases justes).
- Valeurs attendues **calculées par le code** ; dans les tests, écrites à la main.

### 6.1 Le protocole du quai 2 (document reconstitué, une page, lisible en noir et blanc)

Titre : « Protocole de sécurité — opérations de chargement et de déchargement ». En-tête : Geodis, centre de distribution Action,
Ensuès-la-Redonne — quai 2 ; transporteur : Transports Seine-Provence (construit) ; livraisons répétitives du hub d'import du Havre ; « établi
avant la première livraison, entre Geodis et le transporteur » ; signatures des deux employeurs (noms construits, pas de vrai salarié).

| Rubrique (R4515-6) | Contenu proposé (construit) |
|---|---|
| 1. Consignes de sécurité | Gilet haute visibilité et chaussures de sécurité pour toute personne sur le quai, chauffeur compris. Camion à quai : **moteur coupé, clés remises au réceptionnaire, cale posée**. Personne n'entre dans la remorque avant que le **niveleur** soit posé et la **lampe de quai** allumée. **Pas de gerbage** en zone de réception. |
| 2. Accès, stationnement, circulation | Plan de la cour (dessin simple : entrée, poste de garde, quais 1 à 4, **allée piétonne** hachurée, local chauffeurs, point de rassemblement). Vitesse **10 km/h** dans la cour. Marche arrière jusqu'aux **butoirs**. Les piétons ne passent que par l'allée piétonne. **Le chauffeur attend au local chauffeurs** pendant le déchargement et le contrôle ; il ne repart qu'après la **signature des documents**. |
| 3. Matériels et engins | Chariot élévateur frontal, **conduit par un cariste titulaire du CACES R489 catégorie 3 et autorisé par Geodis**. Le chauffeur ne décharge pas. |
| 4. Moyens de secours | Accident : prévenir le **sauveteur secouriste du travail (SST)** de l'équipe et la cheffe d'équipe ; numéro d'urgence interne (construit) ; trousse de secours au bureau de la réception ; point de rassemblement. |
| 5. Responsable désigné | **Samia, cheffe d'équipe réception** (prénom seul). |
| Produits | Marchandises non alimentaires d'Action ; **aérosols** (produits inflammables) : le transporteur le signale, la cheffe d'équipe décide des précautions. |

Pied : « Document pédagogique — reconstitution, non contractuel. Contenu d'après le Code du travail, art. R4515-6 ; consignes et valeurs construites. »

### 6.2 Le dialogue « Au quai » (textes proposés, vouvoiement)

| Réplique | Marc dit | Juste (`v`) | Maladroits (`v` : réaction de Marc) |
|---|---|---|---|
| `arrivee` | « Bonjour ! Je livre pour Action, j'arrive du Havre. » | `presente` : « Bonjour monsieur, bienvenue chez Geodis. Je suis {prenom}, stagiaire à la réception. » | `salut` : « Salut ! C'est pour quoi ? » → « Euh… bonjour. Je livre, je viens de vous le dire. » · `attendez` : « Attendez là. » → « … Bonjour quand même. » |
| `documents` | « Je vous donne quoi ? » | `ldv` : « Votre lettre de voiture et le bon de livraison, s'il vous plaît. » | `rien` : « Rien, on décharge directement. » → « Ah bon ? D'habitude, on me demande mes papiers. » · `permis` : « Votre permis de conduire. » → « Mon permis ? Ce n'est pas un contrôle de police… » |
| `quai` | « Merci. Je me mets où ? » | `quai2` : « Au quai 2, en marche arrière jusqu'aux butoirs. » | `ou` : « Où vous voulez, il y a de la place. » → « Il y a quatre quais… Lequel ? » · `quai4` : « Au quai 4. » → « Le quai 4 ? Sur mon papier, c'est le 2. Vous êtes sûr ? » |
| `attente` | « Je reste dans ma cabine pendant que vous déchargez ? » | `local` : « Non : vous coupez le moteur, vous me laissez vos clés et vous attendez au local chauffeurs. » | `cabine` : « Oui, restez au chaud. » → « D'accord… mais votre protocole ne dit pas ça, il me semble. » · `aider` : « Venez plutôt nous aider à décharger. » → « Moi ? Je n'ai pas le droit de toucher à vos chariots. » |
| `fin` | « D'accord. Je peux repartir quand ? » | `fin-poli` : « Je viens vous chercher quand le contrôle est fini. Bonne pause ! » | `fin-sec` : « Je ne sais pas. » → « … Bon. Je vais attendre. » (`accepte`) · `fin-copain` : « À plus ! » → « Euh… à tout à l'heure. » (`accepte`) |

Situation affichée avant l'appel : « Le camion du Havre arrive au quai. Planigramme : quai 2, 7 h. » `fin` (dernière bulle) : « Merci, à tout à
l'heure. » Le jalon `fin` lit la première réponse à `fin` (les maladroits y sont `accepte` : ils font avancer et comptent une reprise).

### 6.3 Le camion du Havre (`CAMION_HAVRE`, pièce fixe des deux séances — désignations génériques, quantités construites)

| Palette | Désignation (BL) | Couches × cartons | Cartons |
|---|---|---|---|
| P1 | Bougies parfumées, lot de 3 | 5 × 8 | 40 |
| P2 | Assiettes plates en grès, lot de 6 | 4 × 6 | 24 |
| P3 | Boîtes de rangement plastique | 4 × 5 | 20 |
| P4 | Torchons de cuisine, lot de 3 | 6 × 8 | 48 |
| P5 | Puzzles 500 pièces | 5 × 10 | 50 |

Références construites (format libre, par exemple `ACT-` + 5 chiffres). ENT-8.7 n'en montre que l'aspect (palettes filmées) ; ENT-8.8 y
place les anomalies tirées. ⚠ §11 n° 9 : **5 palettes fixes** (et non 4 à 6 tirées) pour que les deux séances parlent du même camion.

### 6.4 La scène et les cases de dépose

- Quai iso sans froid, un camion (porteur ou semi selon le kit), `securite.mode: 'scene'`, points déclarés selon le tirage (§6 bis) ; les objets non
  tirés gardent leur état sûr.
- Zone de réception du quai 2 : **6 cases** R1–R6 (2 rangées de 3) ; **2 cases pièges sur l'allée piétonne** (hachures, pictogramme piéton) et
  **2 devant le quai 3** (légende « Quai 3 »). Lot 2 du §7.

## 6 bis. Tirage et niveaux (règle du 08/10/2026)

### Banque `situations` — fiche du protocole (8 situations ; une seule bonne consigne par situation, contrôle dans le contenu)

| id | Situation | Consigne juste (rubrique) | Difficulté |
|---|---|---|---|
| `s-pieton` | Un collègue à pied traverse devant le quai pendant que Kevin décharge. | Les piétons passent par l'allée piétonne (2) | facile |
| `s-aider` | Le chauffeur propose d'aider Kevin avec son transpalette. | Le chauffeur ne décharge pas (3) | facile |
| `s-vitesse` | Un camion entre dans la cour à vive allure. | 10 km/h dans la cour (2) | facile |
| `s-partir` | Le chauffeur veut repartir avant la fin du contrôle. | Il repart après la signature des documents (2) | moyen |
| `s-blesse` | Kevin se coince la main en descendant du chariot. | Prévenir le SST et la cheffe d'équipe (4) | moyen |
| `s-gilet` | Le chauffeur descend de sa cabine sans gilet. | Gilet et chaussures de sécurité pour tous sur le quai (1) | moyen |
| `s-responsable` | Le chauffeur demande qui commande le quai. | Samia, la responsable désignée (5) | difficile |
| `s-aerosols` | Le chauffeur dit qu'une palette contient des aérosols. | La cheffe d'équipe décide des précautions (produits) | difficile |

- Socle `{ facile: 1, moyen: 1, difficile: 1 }` ; bonus confirmé `{ moyen: 1 }` ; `ordre: 'melange'`.
- Choix de chaque ligne : la consigne juste + 2 ou 3 autres consignes **du même protocole** (toutes vraies en général, une seule s'applique).
- Écartée de la banque : « le chauffeur reste dans sa cabine » (jugée au dialogue, réplique `attente`).

### Banque `anomalies` — inspection (les 5 objets de la vue)

| id (objet) | État dangereux | Vue | Difficulté |
|---|---|---|---|
| `cabine` | `conduite` (chauffeur au volant, moteur allumé, fumée) | dehors | facile |
| `cale` | `absente` | dehors | facile |
| `niveleur` | `releve` | dedans | moyen |
| `lampe` | `eteinte` | dedans | moyen |
| `butoirs` | `absents` | dehors | difficile |

- Socle : **1 anomalie** tirée `{ facile ou moyen : 1 }` (les 4 premières ; équité : chacune a une réponse de Samia et la même valeur au bilan).
- Bonus confirmé : **une 2e anomalie** parmi les autres objets (difficile compris), jalon `bonus: true`. ⚠ §11 n° 10 (scellé, immatriculation et
  palette penchée de la décision 5 : la vue ne les connaît pas).
- ⚠ `cabine` tirée + réplique `attente` : l'élève a dit « coupez le moteur » au dialogue, le chauffeur ne l'a pas fait : c'est l'anomalie (cohérent
  avec le récit : Samia le dit dans sa réponse).

### Le reste

- Dialogue, protocole, ligne « qui décharge », cases de dépose : **pièces fixes** ; ordre des choix mélangé par élève.
- **Accompagné** (décision 9 de Tristan) : **2 choix par réplique** du dialogue au lieu de 3 (le juste + le premier maladroit) ; à l'inspection, la
  consigne nomme **la vue** où regarder (« Regarde dehors. » / « Regarde dedans, porte ouverte. »), jamais l'objet. Si le moteur ne sait pas filtrer
  les choix par niveau ou rendre la consigne du quai fonction de la base : **état des lieux §7.4**, sinon Accompagné = contenu standard (le dire).
- **Consignes neutres** : rien ne dit combien d'anomalies il y a.

## 7. Demandes au moteur — chantier « quai en deux séances » (un seul chantier, avant ENT-8.7)

Pensé pour servir à d'autres séances : toute réception CAP / 2de peut désormais séparer **décharger** (C1.3) et **contrôler** (C1.4).
Tests dans le bloc `quai` (ou le bloc où vit la vue) ; **ENT-1.1, 4.x, 5.4, 6.4 inchangées** (blocs verts).

### 7.1 Lot 1 — arrêter après le déchargement / partir du contrôle (Sonnet, ≈ 2 h)

- **`arret: 'dechargement'`** sur la déclaration du quai : la vue finit quand la dernière palette est posée ; pas d'étapes ③ ④ ; bandeau de fin
  (texte du contenu, `arret.texte`) ; état figé ; geste nouveau **`quai:<id>:decharge`** (fin du déchargement, une fois) et déclencheur
  `quaiDecharge('<id>')` pour les messages et les fermetures.
- **`depart: 'controle'`** (pour ENT-8.8) : la vue s'ouvre à l'étape ③, palettes **déjà en zone de réception**, BL en main, chauffeur au local ;
  pas d'étapes ⓪ ① ② ; le reste (contrôle, réserves, signature) inchangé. Contrôle au chargement : `depart` et `arret` incompatibles ; `depart:
  'controle'` sans `securite`.
- Les jalons de la vue n'existent que pour les étapes jouées (rien d'« à faire » pour une étape absente).

### 7.2 Lot 2 — la dépose dirigée par l'élève (Opus, ≈ 3 h ; interaction nouvelle : page d'essai cliquable pour Tristan d'abord)

- **`depose: { cases: [{ id, x, y, juste: true|false, reaction }], premier: true }`** (rendu iso, `par: 'cariste'`) : avant chaque palette, le
  cariste attend avec la palette sur les fourches ; les cases libres s'éclairent (contour, jamais d'aplat vert) ; l'élève clique une case ; case
  `juste: false` → bulle du cariste (`reaction`), la case se grise, l'élève rechoisit ; case juste → le cariste pose et repart. État :
  `depose[<palette>] = { premier: <case>, essais: [...] }`. Une case occupée n'est pas cliquable.
- Fonction pure pour les jalons (`jalonsDepose`) : par palette, `ok` si le premier choix est une case juste.
- Lecteur d'écran : les cases portent leur nom (« Case R3 », « Allée piétonne »), pas leur verdict. Écran 1366 × 768 sans défilement.

### 7.3 Lot 3 — le dialogue en face à face (Sonnet, ≈ 45 min)

- **`face: true`** sur `telephone` (ou sur un dialogue) : libellés « Aller le voir » / « Terminer » / « Revenir le voir » au lieu de « 📞 Appeler » /
  « Raccrocher » / « 📞 Rappeler » ; pas de « poste » ni de messagerie vocale ; tout le reste inchangé (état, jalons, correction). Decathlon 7.2 à
  7.4 inchangées.

### 7.4 État des lieux à faire d'abord (le dire à Tristan avant de contourner)

- `securite.mode: 'scene'` **avec** `dechargement: { par: 'cariste' }` dans le même quai (6.4 : l'élève décharge lui-même ; ici Kevin) : la
  silhouette du cariste, le chauffeur parti au local après le signalement `cabine` — à vérifier.
- Un **point de scène tiré** (fonction de la graine) : `securite` accepte-t-il une fonction, ou faut-il `quai: (graine) => …` comme ENT-4.4 ?
- **Accompagné** : choix d'une réplique filtrés par `db.aisance` ? consigne du quai fonction de la base ? Sinon : contenu standard (dit au compte rendu).
- **Image dans une ligne de fiche** (le chariot à côté de « qui décharge ») ; sinon, l'image en second document à gauche.
- Questions au fil sur un geste `scene:…:signaler` dont l'écran est le quai (le panneau des questions s'ouvre-t-il par-dessus la scène sans la casser ?).

#### État des lieux fait le 17/10/2026 (Claude Code, lignes de `core/types/quai.js` et `core/types/dialogue.js` au 17/10)

- **Scène + cariste** : ENT-6.4 déclare déjà `securite.mode: 'scene'` et `dechargement.par: 'cariste'` ensemble ; le moteur est le même qu'ici
  (cariste animé, silhouette sans visage), seule la narration de 6.4 dit « tu conduis ». Rien à construire. ⚠ Le brief se trompe en disant que
  l'élève de 6.4 décharge lui-même.
- **Chauffeur après `cabine`** : il descend et reste debout près de la porte « Accueil chauffeurs » jusqu'à la signature du BL (`quai.js:1429`,
  `parti = k.signe`). Aucun local n'est dessiné ; à la fin du déchargement il est encore visible sur le quai. Accepté tel quel (il est « à l'accueil »).
- **Tirage** : `securite` ne peut pas être une fonction (ignorée en silence, `quai.js:247, 489-490`) ; il faut `quai: (graine) => …` comme ENT-4.4
  (`contenus/picard-ent44.js:187-197`, `etapesQuaiTire`), qui marche en guidage.
- **Accompagné** : ni le dialogue (choix compilés une fois sans la base, `dialogue.js:101`) ni le quai (aides figées à la création, aucune lecture
  de `db.aisance`) ne connaissent le niveau → **contenu standard** en 8.7 ; un lot 4 facultatif (aides et consigne du quai `(db) => …`, ≈ 1 h 30)
  rendrait l'Accompagné de 8.7 et le Confirmé sans aides de 8.8 possibles. `selon: (db) => ({ dit, libs })` adapte seulement les textes.
- **Image dans une ligne de fiche** : impossible (libellés échappés, `liste` = menu déroulant) → **photo du chariot en second document à gauche**
  (onglet), ce qui existe (`core/types/documents.js:37-41`, loupe comprise).
- **Titre du document de l'étape ④** : en dur (`quai.js:2509`, « Bon de livraison n° … — exemplaire du destinataire ») → option `document`
  ajoutée au lot 1.
- **Questions au fil sur `scene:…:signaler`** : le panneau est accroché à la séance, pas à la vue (`entreprise.js:1688`) ; ENT-6.4 pose déjà des
  questions sur `scene:…:decharger` et `quai:…:valider`. Jamais essayé sur « signaler » : supposé bon, le test le prouvera.
- **Noms changés** (collision avec l'existant) : `depart: 'controle'` → **`commence: 'controle'`** (`Q.debut` est déjà l'heure de début du
  quai et `R.depart` l'heure de départ) ; geste `quai:<id>:decharge` → **`quai:<id>:dechargement`** (trop proche de `quai:<id>:decharger`, le
  clic du début). Le déclencheur garde le nom `quaiDecharge('<id>')`.
- **Durée revue** : lot 1 ≈ 3 h, lot 2 ≈ 7 h (rien n'existe : ni case, ni pause de l'animation précalculée, places en 2 colonnes, plan éprouvé
  jusqu'à 4 palettes seulement ; `placesIso` `quai.js:1321-1325`), lot 3 ≈ 1 h 30 (une douzaine de textes en dur, `dialogue.js:276-380`).
  **Décision de Tristan (17/10/2026)** : on garde la dépose dirigée ; ordre : lot 1, lot 3, puis maquette du lot 2.

### 7 bis. Séance déjà jouée par des élèves ?

Non : séance nouvelle. Le moteur (§7) ne change rien aux séances qui ne déclarent pas `arret`, `depart`, `depose`, `face`.

## 8. Tests attendus

Bloc **`action-87`** (fichier `outils/test/action-87.mjs`, ligne dans `BLOCS` et dans le groupe le plus léger de `GROUPES` : alerte 7).

- **Parcours juste** (standard, graine fixée) : 20/20, bandeau 5 lignes ✓.
- **Inaction** → 0/20 ; **pire cas** (tout faux) → premier bilan sans l'enseignant, « Corriger », `finFige` du quai.
- Protocole : une consigne d'une autre rubrique choisie → bloc ✗ au détail de **cette** situation (`titreBilan`) ; 300 graines : 3 situations de
  3 difficultés, une seule consigne juste par ligne (contrôle relu).
- Ligne « qui décharge » : « toi, au chariot élévateur frontal » → ✗.
- Dialogue : `cabine` répondu à `attente` → ✗ sur ce seul jalon ; Marc réagit, la réplique revient, l'appel finit ; « Corriger » → « Revenir le voir ».
- Inspection : anomalie signalée → 3 + 1 ; « C'est bon » sans signaler → Samia arrête (guidage), signaler ensuite → jalon ✗ (pas avant la première
  tentative) ; une marque sur un objet sûr envoyée → « aucun faux » ✗ ; **rien envoyé → « aucun faux » ✗**.
- Dépose : allée piétonne au premier choix pour P3 → seule P3 ✗ ; Kevin réagit, P3 finit posée.
- Questions : M et N tout de suite ; P au geste `quai:<id>:decharge` ; L sans note ; `part` 4 ; somme des poids 20.
- **Confirmé** : 4 situations, 2 anomalies, bandeau identique, pas de « bonus » ; bonus faux → note du socle inchangée.
- **Accompagné** : 2 choix par réplique (si le moteur le permet).
- **Parcours** : fermée tant que la précédente n'a pas son premier bilan.
- Écrans à 1366 × 768. Sabotage par bloc ; « aucun faux » rendu vrai à vide → le cas d'inaction tombe.

## 9. Supports pour les élèves

- **Trame** (Cowork, après validation à l'écran) : **cours** d'une demi-page — le protocole de sécurité (les 5 rubriques), accueillir un chauffeur
  (4 gestes), « avant d'entrer dans un camion » (cale, moteur coupé et clés, niveleur, lampe, butoirs) ; pas de brouillon. Noir et blanc.
- Le protocole du quai 2 imprimable (même document qu'à l'écran).
- **Corrigé enseignant** : `contenus/corriges/ENT-8.7.js`.

## 10. Critères de validation par Tristan

- Le protocole se lit en entier sans défiler à côté de la fiche (1366 × 768) et au vidéoprojecteur.
- Le dialogue avec Marc se joue sans aide ; les réactions de Marc font sourire et font comprendre l'erreur sans la dire.
- Sur le quai, l'anomalie se voit sur un petit écran ; Samia arrête l'élève qui veut décharger trop tôt.
- La dépose : on comprend tout seul où cliquer ; Kevin réagit sur l'allée piétonne.
- 45 minutes suffisent ; aucun texte à taper.

## 11. Questions ouvertes et décisions de Cowork (délégation du 16/10, 19 h 02) — valeur retenue en gras

1. [x] **Nom du transporteur** : décision 11 de Tristan « aucun nom », mais ENT-8.2 (livrée) montre déjà **« Transports Seine-Provence »** (construit)
   sur la lettre de voiture du même camion → **on garde ce nom** pour la cohérence, dit construit en pied de chaque document.
2. [x] **Accueil** : décision 3 « dans la messagerie » → **vue Dialogue à choix** (déjà prévue par la feuille de route) : un chauffeur ne
   répond pas par courriel, et la vue fait réagir le personnage. Lot 3 pour le « face à face ».
3. [x] **Qui décharge** : décision 6 « l'élève choisit l'engin, transpalette CACES 1 » → **Kevin décharge au chariot frontal, l'élève dirige**
   (choisit qui / quoi d'après le protocole, puis chaque case). Raisons : la vue iso ne dessine que le chariot frontal (cariste) ou le transpalette
   **manuel du chauffeur** — que le protocole interdit ; ENT-8.2 dit déjà « Kevin les décharge au chariot » ; un stagiaire de CAP souvent mineur
   ne conduit pas d'engin sans autorisation. Le geste « poser chaque palette » reste à l'élève (lot 2).
4. [x] **Ordre** : décision 4 / Q3 → **protocole avant l'accueil** (Samia le donne avant l'arrivée du camion ; l'élève l'applique ensuite à Marc).
5. [x] **N posée par Kevin** (et non par le chauffeur) : le chauffeur est au local selon le protocole ; c'est Kevin, pressé, qui pousse à décharger.
6. [x] **P reformulée** : « qui dit au chauffeur qu'il peut partir ? — Samia, une fois le niveleur relevé » ne tient plus, puisque le camion reste à
   quai pour le contrôle d'ENT-8.8 → « Marc peut-il repartir ? — **pas encore : fin du contrôle et signature** ».
7. [x] **Avant de commencer** : `scelle` et `immatriculation` (validées) ne servent plus (pas de scellé ni d'immatriculation dans la vue) →
   remplacées par **`plan-circulation`** ★ et **`remorque`**. À relire.
8. [x] **Poids internes** : « Avant de décharger » 4 = **signalée 3 + aucun faux 1** (au lieu de « repérer 2 + signaler 2 » : la vue juge le
   signalement avant de décharger et les faux signalements, pas un « repérage » à part) ; « qui décharge » 1 (au lieu de « engin » 1).
9. [x] **Palettes** : décision 9 « 4 à 6 tirées » → **5 palettes fixes** (`CAMION_HAVRE`), parce qu'ENT-8.8 contrôle le même camion et que les
   séances sont cloisonnées (pas de tirage partagé).
10. [x] **Anomalies** : décision 5 (banque de 6 dont scellé cassé, n° de scellé, immatriculation, palette penchée) → **les 5 objets de la vue**
    (cabine, cale, niveleur, lampe, butoirs), sans chantier moteur de plus. Le scellé et l'immatriculation (pré-contrôle documentaire) restent une
    idée pour l'entraînement **ENT-8.9** (demande moteur à cadrer alors).
11. [ ] Si Tristan refuse le lot 2 (dépose dirigée) : Kevin pose seul, le bloc « Diriger le déchargement » tombe à 1 → **poids à refaire avec lui**.
12. [ ] Textes construits par Cowork (protocole, dialogue, réponses de Samia, situations, retours), à relire à l'écran.
13. [x] `precedente` : **ENT-8.4** (`action-avant-noel`) ; ENT-8.5 / 8.6 sont des évaluations sans `parcours`, ouvertes par l'enseignant.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** : bloc / suite entière, nombre de cas, sabotages éprouvés
- **Commits** :
- **Reste ouvert** :
