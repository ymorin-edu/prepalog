# Coordination — CHEP (entreprise n° 9, 1re Bac Pro, C2.5) — ENT-9.1 à ENT-9.4

**Date** : 17/10/2026 (soir). **Conversation d'origine** : Cowork (Opus). **Décisions déléguées par Tristan** (« tu vas faire le cadrage
complet de CHEP en prenant les décisions et écrire les briefs, je valide juste le nombre de séances ») : **4 séances validées par Tristan**.
Tout le reste a été tranché par Cowork. Chaque choix secondaire est marqué **(Cowork)** dans les briefs, pour que Tristan le corrige à
l'écran. Fiche du projet : `claude/prepalog-chep-cadrage.md` (mêmes décisions, avec les sources).

> **Ce document passe avant les briefs** pour tout ce qui est commun (univers, personnes, lieux, vocabulaire, règles de calcul). Un brief
> qui le contredit a tort : le signaler à Tristan.

## 1. Pourquoi CHEP, et ce que la série couvre

- **Le trou** : en 1re, aucune séance ne porte encore **C2.5 « Traiter les retours des supports de charges et/ou des contenants »**,
  prévue en P2 (4/01 → 5/03/2027, entre les deux PFMP) par la carte de couverture. Les retours des fûts et des casiers de France Boissons
  (ENT-6.10, 2de) sont une découverte en un seul temps.
- **Le métier réel de CHEP, c'est exactement C2.5** : louer des palettes, les suivre d'un compte à l'autre, les récupérer, les trier, les
  réparer et les remettre en circulation.
- **Les quatre indicateurs de réussite du référentiel** (arrêté du 8/01/2025, relus le 17/10/2026, cités mot pour mot) et la séance qui
  porte chacun :

| Indicateur (texte officiel) | 9.1 | 9.2 | 9.3 | 9.4 |
|---|---|---|---|---|
| « Repérage des informations relatives au suivi des supports de charge » | **guidage** | | entraînement | évaluation |
| « Mise à jour de la base de données pour la traçabilité des supports de charges/contenants consignés » | **guidage** | rappel (crédit) | entraînement | évaluation |
| « Organisation de la ramasse des supports de charge » | | **guidage** | entraînement (court) | évaluation |
| « Contrôle qualitatif et quantitatif des retours » | | **guidage** | entraînement (dossier) | évaluation |

Le référentiel **ne découpe pas C2.5 en sous-compétences** (pas de C2.5.1) : `competences: ['C2.5']` partout.
Les trois temps, dans des séances distinctes : **9.1 et 9.2 guidage** (coefficient 1), **9.3 entraînement avec erreur induite**
(coefficient 1), **9.4 évaluation** (coefficient 3). Cette série suit la règle « 3 ou 4 séances par compétence ».

## 2. Ce qui est vérifié et ce qui est construit (commun aux quatre séances)

### Vérifié (recherche web du 17/10/2026)

| Fait | Source |
|---|---|
| CHEP fait de la **location-gestion de palettes**. Filiale du groupe **Brambles**, elle travaille en France depuis **1981**. Couleurs des pools : **bleu CHEP**, **rouge LPR**, **brique Logipal** (IPP). | [Autorité de la concurrence, décision 09-D-33 du 10/11/2009](https://www.autoritedelaconcurrence.fr/sites/default/files/commitments//09d33.pdf), §12, §17 |
| **Le fonctionnement** : le loueur met des palettes à disposition d'un **« émetteur »** (l'expéditeur). **La location court jusqu'au transfert vers un « distributeur »**, et **c'est l'émetteur qui doit déclarer ce transfert**. Un distributeur ne réutilise les palettes qu'après avoir signé un contrat avec le loueur. Le loueur **collecte, trie, répare** puis remet les palettes en circulation. Les palettes ne sont pas numérotées : le système repose sur la **bonne foi des déclarations**. | même décision, §29, §31, §32 |
| Dans les entrepôts du loueur ou de ses sous-traitants, les palettes collectées subissent **un tri et un contrôle systématiques**. Celles qui ne sont pas conformes sont **lavées, séchées, peintes ou réparées**. Le **transport, la collecte et la maintenance** sont parfois **sous-traités**. | même décision, §12 |
| Les **palettes Europe (EPAL)** sont des palettes blanches qu'on échange : l'industriel les achète, expédie sa marchandise et récupère des palettes vides chez son client. | même décision, §10 |
| **CHEP France en 2025** : **260 salariés**, **28 centres de service**, plus de **45 millions de mouvements** pour **1 400 clients** sur **9 600 points de collecte**, environ **900 transports par jour** (surtout des camions complets), **5 millions de km à vide évités**. En France, environ **60 %** des palettes sont louées en pool fermé. | [L'Officiel des transporteurs, 28/05/2026](https://www.lofficieldestransporteurs.fr/strategie/la-palette-locative-gagne-des-parts-de-marche-973670.php) |
| **Centre de service de Templemars (Nord)** : premier centre de tri et de réparation en France, géré par CHEP elle-même, ouvert en **1984**. C'est le plus gros site du réseau (environ 15 % des palettes de CHEP France). **85 à 100 salariés**, environ **100 camions par jour**, **144 000 palettes** stockables, **5 millions de palettes par an** pour **265 clients**, une moyenne de **950 palettes à l'heure**. Les palettes y sont **inspectées et triées**, puis stockées avant de repartir chez un client, d'être recyclées ou d'être réparées. Une palette pèse **environ 25 kg**. | [Terra Nuna, 11/10/2017](http://www.terranuna.com/chep-france-37-ans-dinnovation-continue-et-durable-au-service-de-la-gestion-de-palettes/717). **Chiffres de 2017, à donner comme tels.** Je n'ai pas vérifié si le site existe toujours sous cette forme en 2026. |
| CHEP sert surtout le secteur des **fruits et légumes** (en 2017 : 27 centres de service, environ 39 millions de flux par an, plus de 1 200 clients). | [Réussir Fruits & Légumes, 03/11/2017](https://www.reussir.fr/fruits-legumes/chep-france-veut-orchestrer-les-flux-de-marchandises) |
| **La collecte** : les distributeurs **préviennent CHEP** quand des palettes vides sont prêtes. CHEP collecte régulièrement des **camions complets** dans les grandes plates-formes, et des volumes faibles et irréguliers dans les petits sites. | [CHEP, sujet de master, Université de Cologne](https://scm.uni-koeln.de/sites/scm/user_upload/Master_Challenge/CHEP/CHEP_Master_Challenge_Optimizing_Pallet_Collections.pdf) |
| **Les déclarations** (pratique de CHEP en Australie, à généraliser avec prudence) : l'expéditeur déclare le transfert et un **bordereau accompagne chaque chargement**. Un transfert non déclaré fait **payer la location à l'expéditeur pour des palettes qu'il n'a plus**, et l'écart apparaît à l'inventaire suivant. Les corrections se font **dans les 60 jours** qui suivent la facture. | [CHEP Australie, *Introduction to Equipment Control*](https://www.chep.com/files/download/CHEP%20Australia_Introduction%20to%20Equipment%20Control%20Cards.pdf) |
| **Les frais** : frais d'émission, location à la journée, frais de transfert ou de mouvement, frais de transport, frais pour perte ou pour déclaration tardive. | [Brambles, présentation de 2008](https://www.brambles.com/Content/cms/pdf/Slides/PDF/2009/BXB_280109_CHEPUnder_Presentation.pdf) |
| **Groupe Brambles au 30/06/2026** : environ **352 millions** de palettes, caisses et conteneurs, environ **60 pays**, plus de **750 centres de service**, environ **12 000 salariés**. | [brambles.com/about](https://www.brambles.com/about) |
| **Règlement (UE) 2025/40 (PPWR)**, applicable depuis le **12/08/2026**. Au **1/01/2030**, au moins **40 %** des emballages de transport visés, **palettes comprises**, doivent être réutilisables et entrer dans un **système de réemploi**. Ce taux passe à **70 %** au 1/01/2040. Réemployer, c'est passer par un système qui prépare la palette avant chaque nouvel usage et en suit l'usage, le retour, la réparation et la remise en circulation. Le pooling n'est **pas imposé** par la loi. | [trans.info, 07/10/2026](https://trans.info/fr/ppwr-les-palettes-au-coeur-de-la-gestion-des-emballages-506639) (**texte du règlement à relire sur EUR-Lex avant de le citer**) |
| **Code civil, art. 1732** (louage) : « Il répond des dégradations ou des pertes qui arrivent pendant sa jouissance, à moins qu'il ne prouve qu'elles ont eu lieu sans sa faute. » | [Criminocorpus, version de 1804](https://criminocorpus.org/fr/legislation/droit/versions/946/1732/pdf/). **Version en vigueur à relire sur Légifrance** (inchangé à ma connaissance) |
| **Art. 1709** (définition du louage de choses) et **art. 1103** (« Les contrats légalement formés tiennent lieu de loi à ceux qui les ont faits ») | **Cités de mémoire, non relus** (Légifrance refuse l'outil) : à relire avant de les citer dans une séance |
| **Contrat type** (transport routier) : « les supports de charge ne donnent lieu ni à consignation ni à location au transporteur ». Disposition **supplétive** : les parties peuvent y déroger. | Citation reprise par l'[OTRE, 22/03/2023](https://www.otre.org/gestion-des-palettes-ce-que-demande-lotre/). **Article exact du contrat type (décret 2017-461) à relire** |
| **L'endive** : les **Hauts-de-France** sont le **principal bassin de production**. La campagne se fait surtout d'**octobre à avril**, et les cours se donnent à l'expédition par **colis de 5 kg**. | [DRAAF Hauts-de-France, bilan de campagne 2023-2024](https://draaf.hauts-de-france.agriculture.gouv.fr/IMG/pdf/bilan_de_campagne_endive_2023-2024.pdf) |

### Construit (dit en pied de chaque document : « Document reconstitué — document pédagogique Prepalog. CHEP et son centre de Templemars sont réels ; les clients, les personnes, les numéros et les quantités sont construits. »)

- **Le poste de l'élève** : {prénom}, alternant(e) au **service relation clients et flux** du centre de Templemars. Le service est construit, le centre est réel.
- **Les personnes (fictives)** : **Sandrine Delattre**, responsable relation clients, qui est la tutrice ; **Grégory Vandamme**, chef d'équipe
  au quai des retours ; **Yannick Desmet**, exploitant transport, qui affrète les collectes. Tutoiement entre collègues, vouvoiement avec les clients.
  *(Claude Code vérifie qu'aucun nom n'est déjà pris par une autre série du site.)*
- **Les clients (tous fictifs : une faute de déclaration ne s'attribue jamais à une entreprise réelle)** :
  - les **émetteurs** : **Endives du Ternois**, coopérative d'endives à Saint-Pol-sur-Ternoise (62), avec sa responsable logistique **Hélène Caron**
    (séances 9.1 et 9.3) ; **Légumes de la Lys**, à Estaires (59), avec **M. Thomas Deroo** (séance 9.4) ;
  - les **distributeurs**, des plates-formes de produits frais aux enseignes fictives, dans des villes réelles : **Frais du Nord** (Lesquin),
    **Halles d'Artois** (Douai), **Hainaut Primeurs** (Prouvy, près de Valenciennes), **MarchéLys** (Roubaix), **Distri Escaut** (Dourges),
    **Opale Frais** (Dunkerque) ;
  - le **transporteur sous-traitant** de la collecte : **Transports Lys-Escaut** (Lomme).
  *(Recherche du 17/10 : « Endives du Ternois », « Transports Lys-Escaut » et « Maraîchers de la Deûle » n'ont donné aucune entreprise ; les
  autres noms restent à vérifier par Claude Code, et à renommer s'ils existent, comme « Rail Fret Benelux » en ENT-7.1.)*
- **Le compte palettes et ses documents** (relevé, bordereaux, bon d'émission, bon de collecte, rapport de tri), les **numéros**, les
  **quantités**, les **horaires des quais**, le **prix de location** (0,04 € HT par palette et par jour) et le délai de déclaration du contrat.
- **Le camion de collecte**, un ordre de grandeur **calculé dans les séances** : semi-remorque de 13,6 m, **26 places au sol** pour des
  palettes de 1 200 × 1 000, **piles de 15 palettes vides** (≈ 2,25 m de haut, à 0,15 m la palette, chiffre construit), soit **390
  palettes**. À 25 kg pièce (fait vérifié de 2017), le camion pèse ≈ 9,75 t. *(Le format 1 200 × 1 000 de la palette bleue est courant
  chez CHEP, mais je ne l'ai pas vérifié en source : à recouper ; à défaut, dire « format construit ».)*

**Pas de logo image** sans l'accord de Tristan : le bandeau écrit « CHEP » en texte, comme Decathlon. Le bleu de la marque reste au bandeau et
au menu. Claude Code relève la couleur exacte. Sur la carte de la ramasse, **le bleu garde son sens** (les clients et leur emplacement), et
le vert donne l'ordre de la tournée.

## 3. Le vocabulaire (le même dans les quatre séances, mots cliquables du `lexique`)

| Mot | Définition donnée à l'élève |
|---|---|
| pool (de palettes) | Un parc de palettes partagé entre de nombreuses entreprises, géré par un loueur qui les récupère et les remet en état. |
| location-gestion | CHEP reste propriétaire des palettes. Le client paie pour s'en servir, chaque jour où elles sont sur son compte. |
| émetteur | L'entreprise qui reçoit des palettes de CHEP et y charge sa marchandise (un producteur, un industriel). |
| distributeur | L'entreprise qui reçoit la marchandise sur les palettes (une plate-forme, un magasin). Elle doit avoir un contrat avec CHEP. |
| émission | CHEP livre des palettes vides à un émetteur : elles entrent sur son compte. |
| transfert | Les palettes partent chez un distributeur : elles passent du compte de l'émetteur à celui du distributeur, **une fois le transfert déclaré**. |
| retour | Les palettes reviennent dans un centre de service CHEP : elles sortent du compte du client. |
| solde (du compte) | Le nombre de palettes dont le client est responsable, et dont il paie la location. |
| ramasse / collecte | L'enlèvement des palettes vides chez les distributeurs, pour les ramener au centre de service. |
| centre de service | Le site où CHEP trie, contrôle, répare et stocke les palettes avant de les réémettre. |
| palette Europe (EPAL) | Une palette en bois brut, qu'on échange une pour une. Elle n'appartient pas au pool CHEP. |
| autre pool | Des palettes louées par un autre loueur (rouges chez LPR, brique chez Logipal). Elles ne se créditent pas sur un compte CHEP. |
| bon de collecte | Le document qui accompagne les palettes vides collectées : le nombre annoncé par le distributeur. |
| réserve | Ce qu'on écrit sur le bon quand ce qu'on reçoit ne correspond pas à ce qui est annoncé. |

## 4. Règles de calcul (le code les calcule, les tests les écrivent à la main)

1. **Solde** = solde de départ + émissions − transferts déclarés − retours (± corrections).
2. **Seules les palettes CHEP comptent** : une palette Europe ou d'un autre pool ne se déclare pas sur un compte CHEP.
3. **Un transfert existe quand des palettes CHEP partent chez un distributeur** sous contrat (tous les distributeurs du socle en ont un ;
   le cas « sans contrat » est un bonus du confirmé, en 9.1).
4. **Un document daté après le jour du relevé, ou une commande, n'est pas encore un mouvement.**
5. **Au retour** : palettes **à créditer** = palettes **CHEP reçues**, abîmées comprises (CHEP les répare) ; ni les manquantes, ni celles
   d'un autre pool, ni les palettes Europe (écartées en « zone hors pool »). Palettes **à envoyer en réparation** = les CHEP abîmées.
6. **Ramasse** : capacité du camion = 26 places × 15 = **390** palettes vides. Un site qui a **au moins 390 vides** reçoit un **camion
   complet** à lui seul. Les autres se regroupent en **tournée** dans la limite de 390. Si tout ne tient pas, **on laisse le site qui a
   signalé ses vides le plus tard**, qui passe à la tournée suivante (règle construite, écrite dans la consigne de l'exploitant). Les
   **horaires d'enlèvement** de chaque quai se respectent.

## 5. L'ordre de construction (un seul chantier moteur à la fois dans tout le dépôt)

| Étape | Quoi | Modèle | Durée estimée | Dépend de |
|---|---|---|---|---|
| 1 | **ENT-9.1** (aucune vue nouvelle) | Opus | ≈ 5 h | — |
| 2 | **MOTEUR-chep, lot A** : tournée de ramasse (le lot 4 de `MOTEUR-vue-tournee-camion.md`, départ à vide, carte régionale de la ramasse) | Opus | ≈ 7 h | chantier moteur libre (`docs/EN-COURS.md`) |
| 3 | **MOTEUR-chep, lot B** : `forme: 'pile'` sur le quai iso (piles de palettes vides) | Opus | ≈ 9 h | lot A commité |
| 4 | **ENT-9.2** | Opus | ≈ 6 h | lots A et B |
| 5 | **ENT-9.3** (aucune vue nouvelle) | Opus | ≈ 5 h | 9.1 (univers) |
| 6 | **ENT-9.4** | Sonnet | ≈ 4 h | 9.1 à 9.3 |

L'étape 1 peut commencer **tout de suite**, sans attendre le moteur. L'étape 5 aussi, si l'on veut avancer pendant que le moteur attend.

### Les phrases à coller dans Claude Code

- Étape 1 : `Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/COORDINATION-chep.md puis docs/briefs/ENT-9.1-chep-compte-palettes.md en entier. Fais l'état des lieux du §7 en lecture seule, dis-moi ce qui contredit le brief, annonce la durée, puis construis la séance (univers contenus/chep.js compris).`
- Étapes 2 et 3 : `Lis CLAUDE.md, docs/EN-COURS.md, docs/chantiers.md, docs/briefs/COORDINATION-chep.md, docs/briefs/MOTEUR-vue-tournee-camion.md (§6) puis docs/briefs/MOTEUR-chep-ramasse-et-piles.md. Fais l'état des lieux du lot A en lecture seule, annonce la durée, construis le lot A avec sa page d'essai, et envoie-moi une capture avant le lot B.`
- Étape 4 : `Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/COORDINATION-chep.md, docs/briefs/MOTEUR-chep-ramasse-et-piles.md (compte rendu) puis docs/briefs/ENT-9.2-chep-ramasse-et-retours.md. État des lieux du §7, durée, puis construis.`
- Étape 5 : `Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/COORDINATION-chep.md, docs/briefs/ENT-9.1-chep-compte-palettes.md (§6, compte rendu) puis docs/briefs/ENT-9.3-chep-releve-conteste.md. État des lieux du §7, durée, puis construis.`
- Étape 6 : `Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/COORDINATION-chep.md, les comptes rendus d'ENT-9.1 à 9.3, puis docs/briefs/ENT-9.4-chep-evaluation.md. État des lieux du §7, durée, puis construis.`

## 6. Règles communes aux quatre séances

- **Date de la série** : janvier 2027, en pleine campagne de l'endive. 9.1 : **lundi 18/01/2027** ; 9.2 : **mardi 19/01/2027** ; 9.3 : **lundi
  25/01/2027** ; 9.4 : **lundi 01/02/2027**. Les messages portent la date du scénario, jamais la date réelle (règle du 10/10).
- **Livraison** : `pret: true, ouverture: 'prof'` ; `parcours` et `correction` comme ENT-6.1 et 7.1 (premier bilan, correction qui relève la
  note) sauf en 9.4 ; « Avant de commencer » en tête de chaque séance (notée en 9.4 seulement) ; tirage par élève et niveaux
  (`niveauxPrevus: ['confirme']`, l'accompagné reçoit le contenu standard plus les aides listées dans chaque brief) ; jalons pondérés sur 20
  (`bareme: 20`), forme ≤ 15 %, aucun jalon à 0.
- **Les poids des jalons ont été fixés par Cowork sur délégation de Tristan (17/10/2026).** La règle du 10/10 veut qu'ils soient validés
  avant d'être codés : **Claude Code les code tels quels** et les liste au compte rendu pour que Tristan les corrige à l'écran.
- **Questions au fil** : Cowork a gardé 3 questions notées par séance (part 3) et une réflexion. Les autres propositions des tableaux
  restent en réserve (`actif: false` ou non écrites).
- **Un personnage reprend ce que l'élève a écrit, sans corriger** (règle du 10/10).
- **« Que, jamais de combien »** : un écart caché (palettes manquantes, intrus) ne doit jamais pouvoir se déduire d'un autre écran.
- **Écrans du lycée** : 1366 × 768 et 1280 × 720 sans défilement de page (fiches longues : `defile: true`).
- **Impression noir et blanc** : un pool ne se reconnaît jamais à sa seule couleur. Chaque palette porte aussi son marquage
  (« CHEP », « LPR », « EPAL »).
- **Tests** : un bloc par séance (`outils/test/chep-91.mjs` … `chep-94.mjs`), aides communes dans `outils/test/chep/commun.mjs` (sous-dossier
  exprès, comme France Boissons) ; une ligne dans `BLOCS` et dans `GROUPES` pour chaque bloc ; **dire à Tristan que `outils/test.mjs` est touché**.
- **Entreprise n° 9** : une ligne dans `ENTREPRISES` (`activites/index.js`) : `{ n: 9, nom: 'CHEP', metier: 'Location-gestion de palettes — Templemars' }`.

## 7. Après la série (pistes, rien de décidé)

- **France Boissons en 1re** (spirale) pour la reprise de C2.5 avec les fûts consignés.
- **CAP-C3.7** (logistique inversée) : la vue « pile de palettes » sert aussi aux retours de palettes vides des magasins Action (idée de la feuille de route Action).
- **Idée n° 3 de la réserve sécurité** (palettes à écarter à la réception : clous, planche cassée) : même vue.
- **Terminale C3.3 (RSE)** : le réemploi et le PPWR, les km à vide évités par la collecte.
