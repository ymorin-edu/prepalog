# Brief de séance — ENT-8.8 Action — on vérifie qu'il ne manque rien (CAP OL, guidage CAP-C1.4)

> **📋 Phrase à copier-coller dans Claude Code :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/ENT-8.7-action-decharger.md (§0, §6.3 et §7) puis docs/briefs/ENT-8.8-action-controler.md en entier. ENT-8.7 et le lot 1 du chantier moteur « quai en deux séances » (§7 d'ENT-8.7) doivent être livrés. Fais l'état des lieux du §7, dis-moi ce qui contredit le brief, puis construis la séance. Annonce la durée avant de commencer.
> ```

**Statut** : livré
**Date du brief** : 16/10/2026
**Conversation d'origine** : Cowork (Opus), 16/10/2026 à 19 h 02, **sur délégation de Tristan** (« écris le brief de 8.7 et 8.8, tu prends les
décisions »). Aucune question de cadrage n'a été posée pour cette séance : **toutes les décisions sont de Cowork** (§11), à relire par Tristan à l'écran.
Cadre fixé par Tristan : feuille de route d'Action (16/10, « 8.8 guidage C1.4 : comptage, avaries, réserves sur la lettre de voiture, rendre
compte ») et décision 1 du cadrage d'ENT-8.7 (8.8 reprend **le même camion** au contrôle).
**Modèle** : **Opus** (séance nouvelle).
**Place dans l'ordre** : juste après ENT-8.7 (`docs/briefs/ENT-8.7-action-decharger.md`) ; le lot 1 du chantier moteur d'ENT-8.7 (`commence: 'controle'`) avant.
**Durée estimée par Cowork** : ≈ 4 à 5 h. Ce qui prend le temps : le tirage des anomalies sur les 4 palettes et son contrôle d'équité, les phrases
du compte rendu calculées sur le tirage de l'élève, les tests.

---

## 0. Règles communes

- **§0 d'ENT-8.7** (CAP, Geodis à Ensuès, Samia / Kevin / Julie, un écran par étape, `bilanDetail`, suite d'ENT-8.2, transporteur construit
  « Transports Seine-Provence », chauffeur Marc).
- **Date du scénario : mardi 9 novembre, 7 h 30** (sans année) — la suite immédiate d'ENT-8.7 : les 4 palettes du camion du Havre sont en zone de
  réception du quai 2, Marc attend au local chauffeurs.
- **Ce qu'ENT-5.4 et ENT-6.4 font déjà** (vue quai, contrôle, réserves, ouvertes au CAP sur C1.4) : ENT-8.8 les reprend **en guidage CAP**, sans
  l'inspection ni le déchargement (faits en 8.7), et ajoute ce qu'elles n'ont pas : **les anomalies tirées par élève**, le **délai de protestation**
  (question au fil), le **compte rendu calculé sur ses palettes**.

Écrans de l'élève : **Avant de commencer → Le quai 2 : contrôler les palettes, écrire les réserves, faire signer → Rendre compte à Samia** → bilan.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.8 (provisoire) |
| `id` (jamais modifié ensuite) | `action-controler` |
| Titre / desc | « Action — on vérifie qu'il ne manque rien » / « Contrôler les palettes du camion contre le bon de livraison, repérer les cartons abîmés ou manquants, écrire des réserves précises, faire signer le chauffeur et rendre compte. » |
| Rubrique | simulog, entreprise n° 8 Action |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competences: []`, `competencesCap: ['CAP-C1.4']` (« Contrôler les quantités et l'état de la livraison ») ; sous-compétences : C1.4.1 détecter les anomalies et les avaries · C1.4.2 compléter les documents de transport · C1.4.3 rendre compte de l'activité de réception. Ligne `'ENT-8.8': 'CAP-C1.4'` dans `ATTENDU_CAP` (alerte 7). |
| Temps pédagogique | `temps: 'guidage'` (coefficient 1) |
| Notation | jalons pondérés, note sur 20, `parcours: true`, `correction: true`, `bilanDetail: true`, `precedente: 'action-decharger'` |
| Barème | `bareme: 20` |
| Niveaux d'élève | `niveauxPrevus: ['confirme', 'accompagne']` (§6 bis) |
| `questions` | `'ENT-8.8'` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

- **Vérifié** : voir ENT-8.7 §2.
- **Texte de loi** (vérifié le 16/10/2026, **à recopier mot pour mot sur Légifrance à la construction**, date en pied) : **Code de commerce,
  art. L133-3**, 1er alinéa — la réception des objets transportés éteint toute action contre le transporteur pour avarie ou perte partielle si,
  dans les **trois jours, non compris les jours fériés**, qui suivent cette réception, le destinataire n'a pas notifié au transporteur, par **acte
  extrajudiciaire ou par lettre recommandée**, sa **protestation motivée**. Repère : des réserves **précises** écrites à la livraison et non
  contestées par le transporteur valent protestation ; une réserve « de style » ne vaut rien (CMS Francis Lefebvre, [« Avarie ou perte
  partielle »](https://cms.law/fr/FRA/Publication/Avarie-ou-perte-partielle), 8/03/2019 — **jurisprudence, pas un texte à fournir à l'élève**).
- **Construit** : les palettes (`CAMION_HAVRE`, ENT-8.7 §6.3), les anomalies, le BL, la lettre de voiture, la saisie par Julie.
- **Documents reconstitués** : pied « Document pédagogique — reconstitution, non contractuel ».
- **Image** : carton écrasé, palette filmée, étiquette de palette : photos libres sans marque ni visage, ou le rendu iso du quai (alerte 10).

## 3. Objectif pédagogique

À la fin, l'élève sait **contrôler une palette contre le bon de livraison** (compter par couches, faire le tour, lire l'étiquette), **décider**
(accepter / accepter avec réserves), **écrire une réserve précise** et la **faire signer** au chauffeur, sans ajouter de mention vague, et **rendre
compte** à sa cheffe d'équipe. Premier temps de CAP-C1.4, la suite immédiate d'ENT-8.7. Ensuite : ENT-8.9 (entraînement à Labastide, erreur
induite : une palette abîmée acceptée sans réserve par un collègue), ENT-8.10 (évaluation C1.3 / C1.4).

## 4. Déroulé (≈ 45 min)

### Étape 0 — Avant de commencer (non notée, Samia) — §4 ter

### Étape 1 — Le quai 2 : contrôler, écrire les réserves, faire signer (vue quai iso, sans froid, **`commence: 'controle'`** (nom retenu à l'état des lieux du 17/10), lot 1 du §7 d'ENT-8.7)

- **Message de Samia** (aussi en consigne du quai) : « Les 4 palettes sont au sol. Pour chacune : compte les cartons, fais le tour, lis l'étiquette,
  puis décide. S'il y a un problème, écris une réserve précise et fais-la signer par Marc. Samia »
- La vue s'ouvre à l'étape ③ : les palettes P1 à P4 en zone de réception, le BL (§6.1) à côté. Pour chaque palette : tourner, compter (aides de
  guidage, §6 bis), lire l'étiquette, décider (**accepter** / **accepter avec réserves**, motifs `['avarie', 'manquant']`, et `produit` chez le
  confirmé seulement si l'état des lieux le permet : §6 bis), fiche de contrôle comme Smoby / Picard.
- **Étape ④** : réserves sur le document (une ligne par palette à problème, quantité et motif), **sans** la mention « sous réserve de déballage »
  (piège de la vue, jalon `deballage`), **signature de Marc** (au vous : « Je signe sous vos réserves. »), palettes rentrées en zone de réception
  (non noté). Le document porte le titre **« Bon de livraison — lettre de voiture »** si le moteur le permet (§7), sinon « BL » et le cours le dit.
- Questions Q2 (première palette validée) et Q1 (clôture) : §4 bis.
- `recommencer: false` (comme Smoby) : après la signature, le quai ne se refait pas ; le bilan le dit.

### Étape 2 — Rendre compte à Samia (Messagerie, réponse par phrases)

- **Message de Samia** (déclencheur : BL signé, `apresQuai` ou équivalent ; barre « Étape suivante ») : « Marc est reparti. Fais-moi ton compte rendu :
  ce que tu as reçu, tes réserves, ce que tu as mis de côté. Samia »
- **Réponse par phrases** (5 lignes, choix **calculés sur le tirage de l'élève**, semés au moment du message comme ENT-8.4 §6.3) : salutation ·
  reçu (imposée) · réserves · zone litiges · fin (§6.3).
- Question Q3 au geste `messagerie:phrase:fin` ; réflexion Q4 à l'envoi.

### Fin

- **Samia** (`apresMail`, ne dit pas si c'est juste) : « Merci {prénom}. Julie saisit la réception dans le WMS, et j'envoie tes réserves au
  transporteur. Demain, on range les palettes. Samia » (amorce de C1.5, ENT-8.11).
- Premier bilan, `bilanDetail` ; « Corriger » rouvre la réponse par phrases ; **pas le quai** (`finFige` : « Le chauffeur a signé et il est reparti :
  le contrôle ne se refait pas. »).

**Mots cliquables** : réserve, avarie, manquant, couche, bon de livraison, lettre de voiture, zone litiges, WMS, « sous réserve de déballage ».

## 4 bis. Questions au fil — tranché par Cowork (délégation de Tristan du 16/10/2026, 19 h 02) : Q1, Q2, Q3, Q4

Fichier `contenus/questions/ENT-8.8.js`, `part: 4`, personnes : Samia (`equipe`). Une ligne du bandeau : « Les questions de Samia ».

| id | Geste | Qui pose | Question (juste en gras) | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| `trois-jours` (Q1) | `quai:<quai>:cloturer` | Samia | « Demain, Julie ouvre un carton d'**assiettes** (palette P2, acceptée sans réserve) : des assiettes sont cassées. Combien de temps a-t-on pour protester auprès du transporteur ? » — **3 jours, sans compter les jours fériés, par lettre recommandée** (`3j`) · 1 mois, par courriel (`1m`) · 1 an (`1a`) · plus rien n'est possible : on a signé (`rien`) | fil | **1,5** | tout de suite (le quai est clos) | **éco-droit appliqué au cas** (C. com. L133-3, texte fourni) ; ancrée sur une palette du camion ; montre aussi pourquoi les réserves du jour comptent |
| `pourquoi-signer` (Q2) | `quai:<quai>:valider` (la première palette validée) | Samia | « Pourquoi Marc doit-il signer sous tes réserves ? » — **pour reconnaître devant toi ce qui a été constaté** (`reconnaitre`) · pour être payé (`paye`) · pour pouvoir partir plus vite (`partir`) | fil | **1,5** | **au bilan** (elle dirait d'avance qu'il faut faire signer : jalon `signature`) | C1.4.2 |
| `qui-saisit` (Q3) | `messagerie:phrase:fin` (le premier choix de la ligne de fin) | Samia | « Ta réception, qui la saisit dans le WMS ? » — **Julie, l'agent administratif** (`julie`) · toi (`toi`) · Kevin (`kevin`) · Marc, le chauffeur (`marc`) | fil | **1** | tout de suite | C1.4.3 et lien avec ENT-8.2 (qui fait quoi) ; prépare C1.5.3 (actualiser) |
| `pourquoi-litiges` (Q4) | envoi de la réponse à Samia | Samia | « Pourquoi les cartons abîmés vont en zone litiges, et pas en stock ? » — « Pour ne pas les envoyer à un magasin » · « Pour que le transporteur ou le fournisseur puisse les voir » · « Pour ne pas fausser le stock » · « Je n'y avais pas pensé » | fil | réflexion | tout de suite | C1.4.3 ; ne touche aucun jalon (le message est envoyé) |

**Propositions écartées** (pour mémoire) : « Kevin te propose d'écrire juste « sous réserve de déballage » : bonne idée ? » (donnerait le jalon
`deballage`) · « Une palette pleine de 5 couches de 8 cartons en contient… » (donnerait le piège de comptage) · « Qui paie les cartons abîmés
pendant le transport ? — le transporteur » (C. com. L133-1 : deux questions de droit, c'est trop pour une séance CAP ; gardée pour ENT-8.9).

- **Retours proposés** : Q1 : « 3 jours, et par lettre recommandée. Après, c'est trop tard. C'est pour ça qu'on écrit des réserves précises
  **aujourd'hui**, devant le chauffeur. » · Q2 : « En signant, il reconnaît ce qu'on a vu ensemble. Sans sa signature, c'est notre parole contre
  la sienne. » · Q3 : « Julie : elle saisit ce que tu as reçu, avec tes réserves. Le stock du WMS doit dire la vérité. » · Q4 (« Ce qu'en pense
  Samia ») : « Les trois : un carton abîmé ne part pas en magasin, il attend qu'on décide, et il ne compte pas dans le stock. »
- Poids : Q1 1,5 · Q2 1,5 · Q3 1 (Q4 non notée) → 4.
- **Document « Le droit »** : C. com. L133-3, 1er alinéa (texte exact de Légifrance), joint au message de Samia de l'étape 1 et cité dans l'énoncé
  de Q1 (« lis le document Le droit »), comme ENT-8.2.

## 4 ter. Avant de commencer — tranché par Cowork

Bloc `ouverture` (Samia), **tirage 3 notions + 1 image** : `tirage: { preparation: 3, image: 1 }`. Non notées.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `reserve` | préparation | Une réserve, c'est… | une remarque écrite sur le document du transporteur, qui dit ce qui ne va pas | une palette de secours · un carton en stock | — | ★ |
| `avarie` | préparation | Une avarie, c'est… | une marchandise abîmée pendant le transport | une marchandise en retard · une erreur de facture | — | ★ |
| `manquant` | préparation | Un manquant, c'est… | un carton prévu sur le bon de livraison mais qui n'est pas là | un carton abîmé · un carton en trop | — | |
| `couches` | préparation | Une palette **pleine** de {c} couches de {k} cartons contient… | {c × k} cartons | {c + k} · {c × k − k} | dessin d'une palette pleine | ★ |
| `bl` | préparation | Le bon de livraison dit… | ce que le camion apporte | ce qu'Action a commandé · le prix en magasin | BL d'ENT-8.2 (en-tête seul) | |
| `lettre-voiture` | préparation | La lettre de voiture dit… | qui transporte la marchandise, d'où à où | ce que le magasin vend · qui range les palettes | — | |
| `zone-litiges` | préparation | La zone litiges sert à… | mettre de côté la marchandise qui pose problème | jeter les cartons vides · ranger les EPI | plan de la réception d'ENT-8.2 | |
| `img-carton-ecrase` | image | Ce carton est… | écrasé : la marchandise dedans est peut-être abîmée | neuf · vide | photo libre ou rendu iso | ★ |
| `img-film` | image | Le film autour de la palette sert à… | tenir les cartons ensemble pendant le transport | garder les cartons au froid · cacher l'étiquette | photo libre (palette filmée d'ENT-8.2) | |
| `img-etiquette` | image | Cette étiquette sur la palette dit… | ce que contient la palette | le nom du chauffeur · le prix en magasin | rendu iso d'une étiquette (référence construite) | |

- `couches` : {c} et {k} **tirés** (c de 3 à 6, k de 4 à 10), jamais ceux d'une palette du camion.
- **Écartées** : `deballage` (donnerait le jalon `deballage`), `trois-jours` (donnerait Q1), `signature` (donnerait Q2).

## 5. Jalons / notation (sur 20) — poids proposés par Cowork, **validés par Tristan le 16/10/2026 à 19 h 20**

| Bloc (ligne du bandeau) | Cases (un jalon chacune) | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Contrôler les palettes** | 2 palettes sans problème (dont le piège) : comptage **et** décision justes, 1,5 chacune · 2 palettes à problème : comptage **et** décision (bon motif) justes, 2,5 chacune | **8** | `jalonsQuai` : `<P>-comptage` et `<P>-decision` (un jalon de la séance = les deux) | le piège de la couche incomplète : compter la palette « pleine » = faux ; `titreBilan` = « Palette P3 » |
| **Les réserves et la signature** | réserve écrite juste (quantité et motif) 1,5 × 2 · pas de « sous réserve de déballage » 1 · signature de Marc 1 | **5** | `<P>-reserve`, `deballage`, `signature` | `deballage` n'est vrai **qu'une fois les réserves écrites** (vue : `E.ecrit && !mention`) : pas de prime à l'inaction |
| **Rendre compte** | réserves 1 · zone litiges 1 · salutation 0,5 · fin 0,5 | **3** | réponse par phrases (dernier envoi) | forme = 1 sur 20 (5 %) ; message non envoyé = faux |
| **Les questions de Samia** | Q1 1,5 · Q2 1,5 · Q3 1 | **4** (`part: 4`) | moteur des questions | — |
| **Total** | | **20** | | |

- Jalons de la vue **non retenus** (aucun jalon à 0 : ils ne sont pas déclarés) : `rentre` (non noté, comme ENT-5.4 et 6.4), `<P>-detail` (déjà hors
  compte dans la vue), les `<P>-reserve` des palettes acceptées (absents de la vue).
- **Sous-compétences** : C1.4.1 = 8 · C1.4.2 = 5 + Q1 1,5 + Q2 1,5 = 8 · C1.4.3 = 3 + Q3 1 = 4.
- **Corriger** : `ecran: 'phrases:<id du message>'` pour le compte rendu ; le quai sans `ecran` (`finFige`).
- **Anti-inaction** : rien fait = 0/20.

## 6. Contenu (données)

- **`contenus/action-ent88.js`** : messages, déclaration du quai (fonction de la graine : les anomalies sont tirées), BL, phrases, banques, jalons,
  ouverture. Les palettes viennent de **`CAMION_HAVRE`** (`contenus/action.js`, ENT-8.7 §6.3) : désignations, couches, cartons. Pas d'import d'un
  autre fichier de séance (séances cloisonnées).
- **`contenus/questions/ENT-8.8.js`** ; **`activites/action-controler.js`** ; **`contenus/corriges/ENT-8.8.js`** (par élève : ses palettes à problème,
  le réel, les réserves attendues, les phrases justes).
- Valeurs attendues **calculées** (`couches × cartons − manque`, `bl − réel`, cartons abîmés) ; dans les tests, écrites à la main.

### 6.1 Le BL et la lettre de voiture (reconstitués)

- **BL** (du hub d'import Action, Gonfreville-l'Orcher → entrepôt Action / Geodis, Ensuès-la-Redonne), mardi 9 novembre : une ligne par palette (P1 à
  P4 : référence, désignation, cartons **au BL**). Le BL dit toujours le nombre de cartons **plein** de la palette, sauf pour la palette au piège
  « couche incomplète normale » (le BL dit le nombre réel).
- **Lettre de voiture** : Transports Seine-Provence (construit), 4 palettes, case « Réserves », signature du destinataire et du transporteur. Si la
  vue ne montre qu'un document (§7), il est titré « Bon de livraison — lettre de voiture ».

### 6.2 Les anomalies possibles (banque `anomalies`)

| id | Ce que voit l'élève | Décision attendue | Réserve attendue | Difficulté |
|---|---|---|---|---|
| `ecrase-face` | 2 cartons écrasés sur la face **avant** | accepter avec réserves — avarie | « {n} cartons endommagés » (n = 2) | facile |
| `ecrase-cache` | 1 carton écrasé visible **seulement en faisant le tour** (face arrière) | accepter avec réserves — avarie | « 1 carton endommagé » | moyen |
| `manquant` | couche du dessus incomplète (2 cartons absents), le BL dit la palette pleine | accepter avec réserves — manquant | « {n} cartons manquants » (n = 2) | moyen |
| `couche-normale` | couche du dessus incomplète, **le BL dit le même nombre** (piège de comptage) | accepter | aucune ligne | (piège, sur une palette sans problème) |
| `produit` | l'étiquette ne dit pas l'article du BL | accepter avec réserves — produit différent | « produit différent : {référence lue} » | difficile (confirmé, §6 bis) |

Les quantités (2 cartons) sont des valeurs de départ : le code peut les tirer de 1 à 3 (bornes à dire au compte rendu).

### 6.3 Le compte rendu à Samia (réponse par phrases, choix calculés sur le tirage)

| Ligne | Juste (exemple : problèmes sur P2 `ecrase-face` et P4 `manquant`) | Pièges (calculés) |
|---|---|---|
| salutation | « Bonjour Samia, » | « Salut ma grande, » · « Madame la directrice, » |
| reçu (imposée) | « J'ai contrôlé les 4 palettes du camion du Havre. » | — |
| réserves | « Réserves signées par le chauffeur : P2, 2 cartons abîmés ; P4, 2 cartons manquants. » | « Tout est conforme, aucune réserve. » · une palette fausse à la place d'une juste · une quantité fausse |
| zone litiges | « J'ai mis les 2 cartons abîmés de P2 en zone litiges. » | « J'ai rangé les cartons abîmés en stock avec les autres. » · « J'ai rendu les cartons abîmés au chauffeur. » |
| fin | « Je reste au quai. {prénom} » | « Bisous » · « À plus. » |

- Ligne « zone litiges » quand aucune avarie n'est tirée (deux problèmes `manquant` impossible : §6 bis) : sans objet — la banque garantit au
  moins une avarie.
- Les phrases sont **figées au moment où le mail entre dans la base** (moteur, cf. ENT-8.4 §6.3) : le mail est semé **après la signature**.

## 6 bis. Tirage et niveaux

- **Pièce fixe** : les 4 palettes de `CAMION_HAVRE` (désignations, couches, cartons), le BL et la lettre de voiture.
- **Tirage par élève** (graine) :
  - **2 palettes à problème** parmi P1 à P4 : une `facile` (`ecrase-face`) et une `moyen` (`ecrase-cache` **ou** `manquant`) ;
  - **1 palette au piège** `couche-normale`, sur une autre palette ;
  - la dernière : conforme, pleine.
  - `verifier` : 3 palettes différentes ; **au moins une avarie** (garanti par `ecrase-face`) ; le piège ne tombe jamais sur une palette dont la
    couche du dessus est déjà incomplète au départ.
- **Confirmé** : **aides de comptage éteintes** (pas de détail du comptage, pas de rappel de la règle des couches), comme l'entraînement ENT-6.4 ;
  **pas de cas bonus** : ⚠ §11 n° 3 (le camion est celui d'ENT-8.7, 4 palettes, on n'en ajoute pas). Si l'état des lieux montre qu'une palette peut
  porter un **jalon bonus** sans changer le socle (par exemple une 2e référence `produit` sur une palette conforme qui ne compte qu'en bonus), le
  proposer à Tristan avant de le faire.
- **Standard** : aides de guidage **allumées** (règle des couches, détail du comptage, Samia qui explique), comme ENT-5.4.
- **Accompagné** : standard + la consigne de chaque palette rappelle « Fais le tour de la palette avant de décider. » (texte, pas d'indice sur la
  palette) ; si la vue ne sait pas rendre ses aides fonction de `db.aisance`, contenu standard (le dire).
- **Consigne neutre** : rien ne dit combien de palettes ont un problème.
- **Niveaux et lot 4** : l'état des lieux du 17/10 (§7 d'ENT-8.7) montre que la vue quai ne lit pas le niveau de l'élève ; les aides fonction
  du niveau demandent le **lot 4 facultatif** (≈ 1 h 30). Sans lui : contenu standard pour tous, et le dire à Tristan.

## 7. Demandes au moteur

- **Lot 1 du chantier « quai en deux séances »** (ENT-8.7 §7.1) : `commence: 'controle'` (nommé `depart` au premier jet du brief). Rien d'autre de nouveau a priori.
- **À vérifier à l'état des lieux** (le dire à Tristan avant de contourner) :
  - le **titre du document** de l'étape ④ (« BL ») se règle-t-il par le contenu ? Sinon, petite demande : `document: 'Bon de livraison — lettre de
    voiture'` (Sonnet, ≈ 20 min) ; à défaut on garde « BL » et le cours le dit ;
  - le **quai fonction de la graine** (`quai: (graine) => …`, ENT-4.4) avec `commence: 'controle'` et `etapesQuaiTire` ;
  - les aides fonction du niveau (`db.aisance`) ;
  - le déclencheur « BL signé » pour semer le mail du compte rendu (ENT-6.4 le fait : le reprendre).

### 7 bis. Séance déjà jouée par des élèves ?

Non : séance nouvelle.

## 8. Tests attendus

Bloc **`action-88`** (fichier `outils/test/action-88.mjs`, ligne dans `BLOCS` et `GROUPES` : alerte 7).

- **Parcours juste** (standard, graine fixée, valeurs à la main) : 20/20, bandeau 4 lignes ✓.
- **Inaction** → 0/20 (dont `deballage` faux tant que rien n'est écrit) ; **pire cas** → premier bilan, `finFige`, « Corriger » rouvre les phrases.
- Piège de comptage : la palette `couche-normale` comptée « pleine » → seule cette palette ✗ (`titreBilan` « Palette P… »).
- `ecrase-cache` acceptée sans faire le tour → ✗ ; réserve « 2 cartons » au lieu de 1 → réserve ✗, décision ✓.
- Mention « sous réserve de déballage » ajoutée → `deballage` ✗, le reste juste.
- Compte rendu : phrases calculées sur **son** tirage (300 graines : la phrase juste nomme ses deux palettes et ses quantités ; toujours au moins
  une avarie ; 3 palettes différentes) ; « Tout est conforme » → ✗.
- Questions : Q2 au bilan, Q1 / Q3 tout de suite, Q4 sans note ; `part` 4 ; somme des poids 20 ; Q1 cite « Le droit ».
- **Confirmé** : aides de comptage absentes, bandeau identique, note sur le socle. **Accompagné** : rappel « Fais le tour » présent.
- **Parcours** : fermée tant qu'ENT-8.7 n'a pas son premier bilan.
- 1366 × 768 sans défilement. Sabotages : garde « au moins une avarie » retirée → le cas des 300 graines tombe ; phrase juste calculée sur une autre
  palette → le cas du compte rendu tombe.

## 9. Supports pour les élèves

- **Trame** (Cowork, après validation à l'écran) : **brouillon** de comptage (une ligne par palette : couches × cartons − manque = réel ; BL ;
  écart) ; **cours** d'une demi-page : contrôler une palette (compter, faire le tour, lire l'étiquette), écrire une réserve précise (quoi, combien),
  pas de « sous réserve de déballage », faire signer, 3 jours pour protester. Noir et blanc.
- **Corrigé enseignant** : `contenus/corriges/ENT-8.8.js`.

## 10. Critères de validation par Tristan

- On voit sur un petit écran les cartons écrasés, l'étiquette et la couche incomplète.
- Le passage d'ENT-8.7 à ENT-8.8 se comprend sans explication : mêmes palettes, même quai, même chauffeur.
- Les phrases du compte rendu nomment **ses** palettes.
- 45 minutes suffisent ; aucun texte à taper (le comptage se tape en chiffres, comme ENT-5.4).

## 11. Décisions de Cowork à faire valider par Tristan (délégation du 16/10/2026, 19 h 02)

1. [x] **Poids** (§5) : Contrôler les palettes 8 · Réserves et signature 5 · Rendre compte 3 · Questions 4 — **validés par Tristan le
   16/10/2026 à 19 h 20**.
2. [x] **Questions au fil** : Q1 (délai de 3 jours, L133-3) 1,5 · Q2 (pourquoi signer) 1,5 au bilan · Q3 (qui saisit dans le WMS) 1 · Q4 réflexion.
3. [x] **Confirmé sans cas bonus** (aides de comptage éteintes) : le camion est le même qu'en 8.7, on n'ajoute pas de palette.
4. [x] **Anomalies** : 2 problèmes par élève (1 facile + 1 moyen) + 1 piège de comptage, sur les 4 palettes fixes (la 4e est conforme) ; `produit` gardé pour plus tard.
5. [x] **Réserves sur « Bon de livraison — lettre de voiture »** (un seul document à l'écran si la vue n'en sait pas deux).
6. [x] **4 palettes** (et non 5) et option **`commence: 'controle'`** : ajustés le 17/10 après l'état des lieux d'ENT-8.7.
7. [ ] Textes construits par Cowork (messages, BL, phrases, ouverture, retours) : à relire à l'écran.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

(Claude Code, sous-agent constructeur, 17/10/2026 ; décisions du chef de chantier : `COORDINATION-action.md` §8.)

- **Texte de loi** : C. com. L133-3, 1er alinéa, **relu sur Légifrance le 17/10/2026** (LEGIARTI000021486442, version en vigueur depuis le
  10/12/2009), recopié dans le document « Le droit » (apostrophe typographique). Légifrance écrit « si dans les trois jours » **sans** virgule après
  « si » (le document d'ENT-6.4 en met une).
- **Fichiers créés / modifiés** : créés `contenus/action-ent88.js`, `contenus/action-ent88-donnees.js` (tirage, quai d'un élève, phrases calculées),
  `contenus/questions/ENT-8.8.js`, `contenus/corriges/ENT-8.8.js`, `outils/test/action-88.mjs` ; `activites/action-controler.js` remplace le squelette
  (`pret: true, ouverture: 'prof'`) ; `outils/test.mjs` : une ligne dans `BLOCS`, une dans `GROUPES` (groupe 2) (alerte 7). Rien dans
  `tirage-niveaux.mjs` : la séance ne déclare aucune banque `declarerTirage` (anomalies tirées par `tirerJeu`, comme ENT-4.4).
- **Écarts par rapport au brief** (et pourquoi) :
  1. **Niveaux** : aides de comptage **allumées pour tous**, pas de rappel « Fais le tour » propre à l'Accompagné (la vue quai ne lit pas
     `db.aisance`, décision §8.2 n° 4) ; pas de `niveauxPrevus` (aucun jalon bonus possible sans changer le socle).
  2. **Réplique de Marc** : « Je signe sous vos réserves. » impossible, la vue écrivait en dur « C'est signé. Je recharge les palettes refusées et j'y
     vais. Bonne journée ! » (et « Le chauffeur », sans prénom). **Fait le 20/10/2026** (décision de Tristan) : clé `paroleSignee` du camion ; Marc dit
     « Je signe sous vos réserves. Bonne journée ! » (signature ordinaire : le bon jeu signe toujours avec des réserves, aucune palette à refuser) ; la variante avec refus ne s'entend que sur un mauvais choix.
  3. **Q1** : l'énoncé de Cowork (« palette P2, acceptée sans réserve ») serait faux chez un élève dont P2 a un problème : énoncé **calculé**
     (`selon`) : P2 quand elle est acceptée, sinon la palette conforme de l'élève ; dommages construits (bougies cassées, boîtes fendues, torchons
     déchirés).
  4. **Q4** « à l'envoi » : `quand(db)` = compte rendu envoyé (aucun geste « envoi de phrases » n'est publié).
  5. **Ligne « zone litiges »** quand les deux problèmes sont des avaries : « J'ai mis les 2 cartons abîmés de P2 et le carton abîmé de P3 en zone
     litiges. » (construit).
  6. **Couche « normale »** (piège) : la moitié de la couche du dessus manque (4 sur 8, 3 sur 6, 2 sur 5 : construit, le brief ne fixait pas le
     nombre). Disposition dans la couche déduite de `parCouche` (8 → 4 × 2, 6 → 3 × 2, 5 → 5 × 1).
  7. **« Avant de commencer »** : `bl` montre l'en-tête du document de ce camion (pas celui d'ENT-8.2, séances cloisonnées) ; `zone-litiges` le dessin
     de la zone litiges déjà au dépôt (le plan d'ENT-8.2 n'est pas un document) ; carton écrasé, palette pleine et étiquette : dessins en traits
     dans les documents de la séance (aucune image nouvelle).
- **Décisions prises en route** : un jalon = un **rôle** (facile, moyen, piège, conforme), la palette change d'un élève à l'autre, `titreBilan`
  « Palette P3 » / « Réserve de la palette P3 » ; les jalons du quai ne sont jugés qu'à la signature ; quai `action-quai2-controler` avec la dépose de
  la variante A déclarée (palettes dessinées dans R1 à R4, comme à la fin d'ENT-8.7) ; graine = identifiant + « |action-controler ». Pire cas réel =
  1/20 (la signature est obligatoire pour continuer).
- **Tests** : bloc `action-88`, 16 cas verts ; `action-88 tirage-niveaux action questions` (avec `socle`) : 185/185. Sabotages : garde « au moins une
  avarie » retirée → le cas « contrôle d'équité » tombe (le cas des 300 graines, lui, ne bouge pas : `ecrase-face` garantit déjà l'avarie) ; tirage
  sans écrasé devant → tout tombe (aucun jeu conforme : le module lève maintenant une erreur claire) ; phrase juste calculée sur la palette au piège →
  7 cas tombent (300 graines, témoins, parcours…) ; un poids changé (piège 2, conforme 1) → déclaration et note tombent. Suite entière : non lancée
  (le chef de chantier la lance).
- **Commits** : (chef de chantier)
- **Reste ouvert** : textes de Cowork à relire à l'écran (messages de Samia, consigne du quai, phrases, Q1 à Q4 et retours, 10 notions) et ceux
  construits par Claude Code (deux phrases du premier message, ouverture « Bonjour ! Les palettes… », 5 définitions du lexique, dommages de Q1,
  dessins) ; la Messagerie affiche l'année réelle de la date du scénario (limite connue) ; la barre « lis ton nouveau message » pendant « Avant de
  commencer » (moteur) ; la palette de ③ est sous la ligne de flottaison à 1366 × 768 (défilement vertical) ; trame élève (Cowork). **Rien n'a été vu à
  l'écran par Tristan.**
- **Lot 4 appliqué (17/10/2026 soir, après le chantier moteur « contenus selon le niveau », option 3 de Tristan)** : le quai reçoit le niveau de l'élève. **Confirmé** : aides de comptage éteintes (ni règle des couches, ni détail, ni repère, ni rappel ; brouillon libre comme ENT-6.4), Samia explique toujours (`chefDeQuai`, `consignes`) ; pas de cas bonus (le socle ne change pas). **Accompagné** : les aides du standard, et la consigne de Samia en tête du quai ajoute « Fais le tour de la palette avant de décider. » (texte, aucun indice sur une palette ; l'aide par palette de l'étape ③ est un texte du moteur, le même pour tous, qui dit déjà « Fais le tour de la palette si besoin »). `niveauxPrevus: ['confirme', 'accompagne']`. Cas : « confirmé » réécrit (il affirmait les aides allumées), 1 cas ajouté (accompagné + standard sans le rappel) ; le cas « déclaration » suit le nouveau `niveauxPrevus`.
