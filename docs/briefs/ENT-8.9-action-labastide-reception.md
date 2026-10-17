# Brief de séance — ENT-8.9 Action — la palette de Lucas (CAP OL, entraînement CAP-C1.3 et CAP-C1.4, erreur induite)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/ENT-8.7-action-decharger.md (§0, §6, §7), docs/briefs/ENT-8.8-action-controler.md (§6) puis docs/briefs/ENT-8.9-action-labastide-reception.md en entier. ENT-8.8 et le chantier moteur « quai en deux séances » doivent être livrés. Fais l'état des lieux du §7, dis-moi ce qui contredit le brief, puis construis la séance. Annonce la durée avant de commencer.
> ```

**Statut** : livré
**Date du brief** : 17/10/2026
**Conversation d'origine** : Cowork (Opus), 17/10/2026, **décisions déléguées par Tristan** (« A, prépare les briefs, tu prends les décisions » :
Action s'arrête à ENT-8.10). Cadre fixé par Tristan : feuille de route du 16/10 (« 8.9 entraînement à Labastide, erreur induite : palette abîmée
acceptée sans réserve ») ; idée gardée au cadrage d'ENT-8.7 (décision 3) : **un chauffeur qui parle peu français**. Toutes les autres décisions
sont de Cowork (§11).
**Modèle** : **Opus** (séance nouvelle).
**Place dans l'ordre** : après ENT-8.8.
**Durée estimée par Cowork** : ≈ 5 h. Ce qui prend le temps : le second protocole (Labastide), le dialogue simplifié, la déclaration du quai complet
(inspection, dépose, contrôle), la fiche de l'erreur avec ses deux cas de délai, les phrases calculées, les tests. Rien de nouveau au moteur.

---

## 0. Règles communes

- **§0 d'ENT-8.7** (CAP, un écran par étape, `bilanDetail`, ce qui est construit se dit) et **§0 / §0 bis d'ENT-8.3** pour Labastide : PFMP chez
  **GXO à Labastide-Saint-Pierre** (Tarn-et-Garonne), tuteur **Romain, chef d'équipe réception** ; collègues d'ENT-8.4 : **Lucas** (cariste),
  **Inès** (agent administratif) — construits.
- **Date : vendredi 18 décembre, 7 h** (sans année), le lendemain d'ENT-8.4 (« jeudi 17 décembre »).
- **Entraînement** : moins guidé qu'ENT-8.7 / 8.8 — l'élève fait **toute la réception seul** (accueillir, inspecter, faire décharger, contrôler,
  réserves), puis découvre **l'erreur de Lucas** (erreur induite) et la traite.
- **Aides** : aides de comptage **éteintes** (comme ENT-6.4, entraînement), pas de liste de points à l'inspection, pas d'arrêt par Romain (le
  défaut oublié est remis en ordre sans un mot, comme ENT-6.4) ; le bilan dit le critère, jamais l'endroit.

Écrans de l'élève : **Avant de commencer → Au quai : accueillir le chauffeur → Le quai 5 (inspecter, faire décharger, contrôler, réserves) → La
palette de Lucas → Rendre compte à Romain** → bilan. Quatre écrans de travail, un par étape (ENT-8.4 en avait six).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.9 (provisoire) |
| `id` (jamais modifié ensuite) | `action-palette-lucas` |
| Titre / desc | « Action — la palette de Lucas » / « Recevoir seul un camion de jouets à Labastide, de l'accueil du chauffeur aux réserves, puis traiter une palette abîmée acceptée sans réserve la veille. » |
| Rubrique | simulog, entreprise n° 8 Action |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competences: []`, `competencesCap: ['CAP-C1.3', 'CAP-C1.4']` ; lignes dans `ATTENDU_CAP` (alerte 7) |
| Temps pédagogique | `temps: 'entrainement'`, avec une **erreur induite** (la palette acceptée sans réserve par Lucas) |
| Notation | jalons pondérés, note sur 20, `parcours: true`, `correction: true`, `bilanDetail: true`, `precedente: 'action-controler'` |
| Barème | `bareme: 20` |
| Niveaux d'élève | `niveauxPrevus: ['confirme', 'accompagne']` (§6 bis) |
| `questions` | `'ENT-8.9'` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

- **Vérifié** : Labastide-Saint-Pierre, entrepôt Action exploité par GXO, > 250 fournisseurs à l'ouverture (ENT-8.3 §2). Textes : **R4515-4,
  R4515-6, R4515-8** (ENT-8.7 §2), **C. com. L133-3** (ENT-8.8 §2).
- **Texte de plus, à vérifier et recopier sur Légifrance à la construction** : **C. com. art. L133-1**, 1er alinéa : le transporteur
  (« voiturier ») est garant de la perte des objets à transporter, hors force majeure, et des avaries autres que celles qui viennent du vice propre
  de la chose ou de la force majeure. *(Relevé par Cowork de mémoire le 17/10 : **non relu** ; le constructeur le relit et le dit au compte rendu.)*
- **Construit** : le protocole du quai 5 de Labastide (même trame qu'Ensuès, consignes différentes), le chauffeur **Jan** (il parle un peu
  français ; aucune nationalité nommée), le fournisseur (« un fournisseur de jouets »), le transporteur (sans nom), les 4 palettes, l'erreur de
  Lucas, les dates.

## 3. Objectif

L'élève refait **seul** toute la réception d'un camion (C1.3 puis C1.4) dans un autre site, avec un chauffeur qu'il faut comprendre et se faire
comprendre, puis il **reconnaît et traite l'erreur d'un collègue** : ce qui aurait dû être fait au quai, si l'on peut encore protester auprès du
transporteur (délai de 3 jours), où va la palette. Prépare l'évaluation ENT-8.10.

## 4. Déroulé (≈ 50 min)

### Accueil (message de Romain, aussi en `sousTitre` du premier écran)

« Bonjour {prénom} ! Ce matin, tu reçois seul le camion de jouets, quai 5, 7 h. Tu connais le protocole : il est au mur du quai. Ensuite, j'aurai
une question sur un camion d'hier. Romain »

### Étape 0 — Avant de commencer (non notée, Romain) — §4 ter

### Étape 1 — Au quai : accueillir le chauffeur (Dialogue à choix, `face: true`)

- Contact « Jan — chauffeur, camion de jouets ». **Jan parle peu français** : il fait des phrases courtes. Les bonnes réponses sont **courtes, polies
  et claires** ; les phrases longues ou familières le font réagir (« Pardon ? Pas compris. »). Le **protocole du quai 5** (§6.1) est le **document à
  gauche** de l'écran si la vue le permet (§7), sinon dans la `situation` en 3 lignes (pictogrammes : moteur coupé, clés, local chauffeurs).
- Répliques (§6.2) : arrivée · documents · quai · attente · fin.

### Étape 2 — Le quai 5 (vue quai iso, sans froid, **complète** : ⓪ → ④)

- Message de Romain (`dialogueFini('jan')`, aussi en consigne) : « Le camion est à quai. Tu sais ce qu'il faut regarder avant que Lucas entre. Puis
  contrôle les palettes et fais tes réserves. Romain »
- **⓪ Inspection** (`securite.mode: 'scene'`) : **2 anomalies tirées** (§6 bis) ; « Signaler à Romain » / « C'est bon, on peut décharger » ;
  entraînement : rien n'arrête l'élève ; un défaut oublié est remis en ordre sans un mot.
- **① ②** Le BL remis par Jan, « Oui, vous pouvez décharger » ; **Lucas** décharge au chariot frontal ; **dépose dirigée** (lot 2 du §7 d'ENT-8.7) :
  4 cases justes, 2 sur l'allée piétonne, 2 devant le quai 6.
- **③ ④** Contrôle des **4 palettes** (aides de comptage éteintes), réserves sur « Bon de livraison — lettre de voiture », signature de Jan,
  palettes rentrées (non noté).

### Étape 3 — La palette de Lucas (fiche, documents à gauche) — **l'erreur induite**

- Message d'Inès (déclencheur : BL signé ; barre « Étape suivante ») : « {prénom}, regarde : la palette de peluches reçue par Lucas a des cartons
  écrasés. Lucas l'a acceptée sans réserve. Dis-nous ce qu'on fait. Inès »
- À gauche : **le BL signé par Lucas** (« reçu le {date tirée} », case Réserves **vide**, signature du chauffeur) ; le dessin de la palette (3
  cartons écrasés, face arrière) ; **le calendrier de la semaine** (lundi 14 → vendredi 18 décembre, aujourd'hui entouré) ; « Le droit » (L133-3).
- Fiche « La palette de Lucas » (`liste` × 3) :
  1. « Qu'aurait dû faire Lucas au quai ? » — **faire le tour de la palette et écrire une réserve précise, signée par le chauffeur** · rien : le
     chauffeur est responsable de tout · refuser tout le camion · écrire « sous réserve de déballage ».
  2. « Peut-on encore protester auprès du transporteur ? » — selon la date tirée (§6 bis) : **oui : on est dans les 3 jours, par lettre recommandée
     motivée** · **non : plus de 3 jours sont passés** · oui, par un simple courriel · oui, on a un an.
  3. « En attendant, la palette va… » — **en zone litiges, avec une étiquette** · en stock avec les autres · à la benne · au magasin, on verra.
- Envoi : « Envoyer à Inès ».

### Étape 4 — Rendre compte à Romain (Messagerie, réponse par phrases)

- Message de Romain (`apresFiche('lucas')`) : « Fais-moi le point : ton camion de ce matin, et la palette de Lucas. Romain »
- Phrases (§6.3), choix **calculés** sur son tirage : salutation · ma réception · la palette de Lucas · fin.

### Fin

- Romain (`apresMail`) : « Merci. Je reparle avec Lucas : faire le tour de chaque palette, à chaque fois. Romain »
- Premier bilan, `bilanDetail` ; « Corriger » rouvre le dialogue (« Revenir le voir »), la fiche de Lucas et les phrases ; **pas le quai** (`finFige`).

**Mots cliquables** : protocole de sécurité, pictogramme, réserve, avarie, lettre recommandée, jour férié, zone litiges, transporteur.

## 4 bis. Questions au fil — tranché par Cowork (délégation)

`contenus/questions/ENT-8.9.js`, `part: 4`, personnes : Romain, Inès.

| id | Geste | Qui pose | Question (juste en gras) | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| `qui-paie` | `quai:<quai>:cloturer` | Romain | « Les cartons abîmés de **ta** palette P{x} l'ont été pendant le transport. Qui doit les rembourser ? » — **le transporteur : il répond des avaries pendant le transport** (`transporteur`) · GXO (`gxo`) · Action (`action`) · Jan, de sa poche (`jan`) | fil | **1,5** | tout de suite (quai clos) | **éco-droit appliqué au cas** (C. com. L133-1, texte fourni) ; P{x} = sa palette à problème tirée |
| `refus-signer` | `quai:<quai>:valider` (première palette validée) | Romain | « Imagine : le chauffeur refuse de signer tes réserves. Que fais-tu ? » — **j'écris qu'il refuse de signer, et je préviens Romain** (`noter`) · je retire mes réserves (`retirer`) · je le laisse partir sans rien dire (`laisser`) | fil | **1,5** | **au bilan** (proche du jalon de signature) | C1.4.2 / C1.4.3 |
| `rappel-lucas` | `fiche:lucas:envoyer` | Inès | « Lucas n'a pas fait exprès. Que faire pour que ça ne recommence pas ? » — **lui rappeler de faire le tour de chaque palette avant de signer** (`rappeler`) · le renvoyer (`renvoyer`) · ne rien dire (`rien`) · signer à sa place (`signer`) | fil | **1** | tout de suite | C1.4.3 ; ancrée sur l'erreur de la séance |
| `se-comprendre` | `dialogue:jan:fin` | Romain | « Jan parlait peu français. Qu'est-ce qui aide le plus ? » — « Des phrases courtes » · « Montrer les pictogrammes du protocole » · « Parler calmement, avec des gestes » · « Je n'y avais pas pensé » | fil | réflexion | tout de suite | C1.3.1 |

- **Écartées** : « J'ai vu un problème, on décharge ? » à l'inspection (dirait qu'il y en a d'autres : consigne neutre) ; « Combien de jours pour
  protester ? » (donnerait la ligne 2 de la fiche).
- **Retours proposés** : `qui-paie` : « Le transporteur : il répond de ce qui arrive pendant le transport. Ta réserve signée, c'est la preuve. » ·
  `refus-signer` : « On l'écrit sur le document, et on prévient le chef : le refus aussi est une preuve. » · `rappel-lucas` : « On le lui rappelle,
  simplement. Tout le monde peut oublier ; la règle, elle, ne change pas. » · `se-comprendre` : « Les trois : court, montré, calme. »
- **Document « Le droit »** : L133-1 et L133-3 (texte exact de Légifrance), joint à gauche de la fiche de Lucas et cité dans `qui-paie`.

## 4 ter. Avant de commencer — tranché par Cowork

`ouverture`, Romain, tirage **3 notions + 1 image**, non notées.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `pictogramme` | préparation | Un pictogramme, c'est… | un petit dessin qui se comprend sans lire | une signature · un numéro de quai | 3 pictogrammes du protocole (sans légende) | ★ |
| `transporteur` | préparation | Le transporteur, c'est… | l'entreprise qui emmène la marchandise du fournisseur jusqu'à nous | le magasin · le fabricant | — | ★ |
| `reserve` | préparation | Une réserve, c'est… | une remarque écrite sur le document du transporteur, qui dit ce qui ne va pas | une palette de secours · un carton en stock | — | ★ |
| `avarie` | préparation | Une avarie, c'est… | une marchandise abîmée pendant le transport | une marchandise en retard · une erreur de facture | — | |
| `jour-ferie` | préparation | Un jour férié, c'est… | un jour de fête légale, en général non travaillé | un jour de congé que tu choisis · le dernier jour du mois | — | |
| `couches` | préparation | Une palette **pleine** de {c} couches de {k} cartons contient… | {c × k} cartons | {c + k} · {c × k − k} | dessin | |
| `protocole` | préparation | Le protocole de sécurité d'un quai est écrit… | avant la première livraison, par le site et le transporteur | par le chauffeur, en arrivant · par Action | — | ★ |
| `img-cale` | image | Cet objet devant la roue sert à… | empêcher le camion de bouger | gonfler le pneu · laver la roue | dessin (ENT-8.7) | ★ |
| `img-carton-ecrase` | image | Ce carton est… | écrasé : la marchandise dedans est peut-être abîmée | neuf · vide | (ENT-8.8) | ★ |
| `img-feux` | image | Ces feux au bord du quai servent à… | dire au chauffeur s'il peut bouger ou non | éclairer la cour · signaler un incendie | (ENT-8.7) | |

- `protocole` reprend la question M d'ENT-8.7 (★ pour l'évaluation) : en entraînement, la reprendre en ouverture est voulu.
- **Écartées** : `trois-jours` (donnerait la ligne 2 de la fiche), `qui-paie` (donnerait la question au fil), `deballage` (jalon du quai).

## 5. Jalons / notation (sur 20) — décidés par Cowork (délégation, §11)

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Accueillir le chauffeur** | salutation 0,5 · documents 0,75 · quai 0,5 · attente (moteur, clés, local) 0,75 · fin 0,5 | **3** | dernier appel (`premiereReponse`) | forme 1 / 20 (5 %) |
| **Avant de décharger** | 2 anomalies signalées avant « C'est bon », 1,25 chacune · aucun faux signalement 0,5 | **3** | `securite-<id>`, `securite-aucun-faux` | « aucun faux » faux si rien n'est signalé |
| **Faire décharger et contrôler** | dépose 0,25 × 4 · 2 palettes sans problème (dont le piège) 0,5 chacune · la palette à problème (comptage et décision) 1,5 · sa réserve écrite 1 · pas de « sous réserve de déballage » 0,5 · signature 0,5 | **5,5** | dépose (lot 2), `<P>-comptage`, `<P>-decision`, `<P>-reserve`, `deballage`, `signature` | `deballage` vrai seulement une fois les réserves écrites |
| **La palette de Lucas** | 3 lignes, 1 chacune | **3** | fiche `lucas` | ligne 2 jugée contre **la date tirée** |
| **Rendre compte** | ma réception 0,75 · la palette de Lucas 0,75 | **1,5** | phrases | salutation et fin **non notées** (la forme est déjà notée au dialogue) |
| **Les questions de Romain** | `qui-paie` 1,5 · `refus-signer` 1,5 · `rappel-lucas` 1 | **4** | moteur des questions | — |
| **Total** | | **20** | | |

- Par compétence (pour Tristan) : C1.3 = 3 + 3 + 1 (dépose) = 7 ; C1.4 = 4,5 + 3 + 1,5 = 9 ; questions 4 (1,5 C1.4 · 1,5 C1.4 · 1 C1.4) → C1.4 pèse
  plus : c'est voulu, l'erreur induite porte sur C1.4.
- Rendre compte : « une erreur ne se paie qu'une fois » — la ligne « la palette de Lucas » est jugée contre **ce que l'élève a répondu** à la ligne 2
  de la fiche (comme ENT-8.6) ; la ligne « ma réception » contre **ses** décisions au quai.
- **Corriger** : `'dialogue:jan'`, `'fiche:lucas'`, `'phrases:<id>'` ; pas le quai.

## 6. Contenu (données)

`contenus/action-ent89.js` (+ `-donnees.js`), `contenus/questions/ENT-8.9.js`, `activites/action-palette-lucas.js`, `contenus/corriges/ENT-8.9.js`.
Réutilisés par import si possible : `PLAN_LABASTIDE` (non nécessaire à l'écran), le protocole d'ENT-8.7 comme **trame** (texte et dessin à
paramétrer), les banques d'anomalies d'ENT-8.7 (scène) et d'ENT-8.8 (palettes). Séances cloisonnées : rien n'est lu dans la base d'une autre séance.

### 6.1 Le protocole du quai 5 (Labastide, reconstitué)

Comme ENT-8.7 §6.1, avec : GXO, Labastide-Saint-Pierre, **quai 5** ; responsable désigné **Romain** ; local chauffeurs **à droite du poste de
garde** ; vitesse **10 km/h** ; mêmes rubriques et pictogrammes (moteur coupé, clés, cale, local chauffeurs, gilet, allée piétonne, pas de gerbage).

### 6.2 Le dialogue avec Jan (phrases courtes, vouvoiement)

| Réplique | Jan dit | Juste | Maladroits (réaction de Jan) |
|---|---|---|---|
| `arrivee` | « Bonjour. Livraison. Jouets. » | « Bonjour ! Bienvenue. Je suis {prenom}. » | « Salut, c'est pour quoi exactement, votre livraison ? » → « Pardon ? Pas compris. » · « Ouais. » → « … Bonjour ? » |
| `documents` | « Papiers ? » | « Oui : la lettre de voiture et le bon de livraison, s'il vous plaît. » | « Non, pas besoin. » → « Pas besoin ? Sûr ? » · « Montrez-moi votre carte d'identité. » → « Carte ? Pourquoi ? » |
| `quai` | « Quel quai ? » | « Quai 5. Marche arrière, jusqu'aux butoirs. » (et la main montre le 5) | « Vous voyez le grand bâtiment au fond à gauche après le rond-point, c'est un peu plus loin. » → « Pardon ? Trop vite. » · « Où vous voulez. » → « Où ? Quel numéro ? » |
| `attente` | « Moi, attendre où ? » | « Moteur coupé. Les clés, s'il vous plaît. Vous attendez au local chauffeurs, là. » (pictogramme montré) | « Restez dans votre camion, au chaud. » → « Dans camion ? Protocole dit non… » · « Venez aider Lucas. » → « Moi décharger ? Non, pas permis. » |
| `fin` | « D'accord. Merci. » | « Merci à vous. Je viens vous chercher après le contrôle. » | « Ciao ! » (`accepte`) → « … Ciao. » · « Bon. » (`accepte`) → « … » |

### 6.3 Les phrases du compte rendu (calculées)

| Ligne | Juste | Pièges |
|---|---|---|
| salutation | « Bonjour Romain, » | « Salut chef, » · « Coucou, » |
| ma réception | « Camion de jouets reçu : réserve signée par Jan sur P{x}, {n} cartons {abîmés / manquants}. » (calculée sur **ses** décisions) | « Tout est conforme, aucune réserve. » · une autre palette · une autre quantité |
| la palette de Lucas | **la phrase qui suit sa ligne 2** : « On est dans les 3 jours : Inès envoie une lettre recommandée au transporteur. La palette est en zone litiges. » ou « Plus de 3 jours sont passés : on ne peut plus protester. La palette est en zone litiges. » | « Ce n'est pas grave, je la mets en stock. » · « J'ai envoyé un courriel au chauffeur. » |
| fin | « {prénom} » | « Bisous » · « À plus. » |

## 6 bis. Tirage et niveaux

- **Scène** : 2 anomalies parmi les 5 objets (ENT-8.7 §6 bis) : 1 `facile` + 1 `moyen` ou `difficile` ; consigne neutre.
- **Palettes** (4, désignations génériques : peluches, jeux de société, voitures miniatures lot de 5, pâte à modeler lot de 8 ; couches et cartons
  construits) : **1 palette à problème** (`ecrase-cache` ou `manquant`, ENT-8.8 §6.2), **1 piège** `couche-normale`, 2 conformes ; 3 palettes
  différentes.
- **La palette de Lucas** : peluches, 3 cartons écrasés, reçue **la veille** (`recent` : jeudi 17 décembre → on peut protester) ou **le lundi**
  (`ancien` : lundi 14 décembre → plus de 3 jours) ; 50 / 50, contrôlé sur 200 graines (chaque cas entre 35 et 65 %). Les deux dates évitent tout
  doute sur les dimanches et jours fériés (aucun dans la semaine ; 1 jour d'un côté, 4 jours ouvrés de l'autre).
- **Confirmé** : une **3e anomalie de scène** en bonus (jalon `bonus: true`) ; pas de 5e palette (le plan de dépose est éprouvé jusqu'à 4).
  Bandeau identique.
- **Accompagné** : aides de comptage **allumées** (comme le standard d'ENT-8.8) ; 2 choix par réplique du dialogue (si le moteur du lot 3 le permet).
- **Standard** : aides de comptage éteintes.
- **Niveaux et lot 4** : l'état des lieux du 17/10 (§7 d'ENT-8.7) montre que la vue quai ne lit pas le niveau de l'élève ; les aides fonction
  du niveau demandent le **lot 4 facultatif** (≈ 1 h 30). Sans lui : contenu standard pour tous, et le dire à Tristan.

## 7. Demandes au moteur

**Aucune nouvelle** : chantier « quai en deux séances » d'ENT-8.7 (lots 2 et 3 ; le quai d'ENT-8.9 est **complet**, sans `arret` ni `depart`).
À vérifier à l'état des lieux :
- la **dépose dirigée** (lot 2) dans un quai complet avec inspection et contrôle ;
- une **anomalie de scène bonus** (jalon `bonus: true`) ;
- un **document à gauche** de l'écran du Dialogue ; sinon le protocole en 3 lignes dans la `situation` ;
- la phrase « la palette de Lucas » calculée sur la **ligne 2 de la fiche** (mail semé à l'envoi de la fiche, comme ENT-8.4).

### 7 bis. Séance déjà jouée ? Non.

## 8. Tests attendus

Bloc `action-89` (ligne dans `BLOCS` et `GROUPES` : alerte 7).

- Parcours juste (deux témoins : `recent` et `ancien`) : 20/20 ; inaction 0/20 ; pire cas → premier bilan, `finFige`.
- Dialogue : la phrase longue au `quai` → ✗ sur ce seul jalon, Jan réagit, l'appel finit.
- Inspection : 1 anomalie sur 2 signalée → 1,25 / 2,5 ; rien signalé → « aucun faux » ✗.
- Lucas : témoin `ancien` qui répond « oui, dans les 3 jours » → ligne 2 ✗ ; et dans ses phrases « On est dans les 3 jours… » → ligne du compte rendu
  ✓ (une erreur ne se paie qu'une fois) ; 200 graines → répartition `recent` / `ancien`.
- Questions : `refus-signer` au bilan ; les trois autres tout de suite ; `part` 4 ; somme 20.
- Confirmé : 3e anomalie présente, bandeau identique, note du socle inchangée si elle n'est pas signalée.
- Sabotages : ligne 2 jugée sans la date tirée → le témoin `ancien` tombe ; phrase de Lucas jugée contre la bonne réponse au lieu de la sienne →
  le cas « une erreur ne se paie qu'une fois » tombe.

## 9. Supports

Trame (Cowork, après validation à l'écran) : **cours** d'une demi-page — « Recevoir un camion, dans l'ordre » (accueillir, protocole, inspecter, faire
décharger, contrôler, réserves, signature, rendre compte) et « Une palette abîmée découverte après coup » (3 jours, lettre recommandée, zone
litiges). Noir et blanc. Corrigé : `contenus/corriges/ENT-8.9.js`.

## 10. Critères de validation par Tristan

- Jan fait sourire et oblige à choisir des phrases simples ; on ne bloque jamais.
- La date de réception de Lucas et le calendrier se lisent d'un coup d'œil.
- 50 minutes suffisent (sinon : passer à 3 palettes, dire lequel des jalons perd du poids).

## 11. Décisions prises par Cowork (délégation de Tristan, 17/10/2026)

1. Une seule séance d'entraînement pour C1.3 **et** C1.4 (la réception entière), à Labastide, le lendemain d'ENT-8.4.
2. Chauffeur **Jan** qui parle peu français (idée gardée par Tristan au cadrage d'ENT-8.7) : bonnes réponses courtes et claires.
3. L'erreur induite : la palette de peluches acceptée **sans réserve** par Lucas ; date de réception **tirée** (dans les 3 jours / après) ;
   C. com. L133-3 appliqué au cas, L133-1 en question au fil.
4. Aides de comptage éteintes (standard), allumées (accompagné) ; 2 anomalies de scène ; 4 palettes, 1 problème + 1 piège.
5. Poids du §5 (C1.4 un peu plus lourde que C1.3 : l'erreur induite porte sur C1.4).
6. Questions au fil : `qui-paie` 1,5 · `refus-signer` 1,5 (au bilan) · `rappel-lucas` 1 · `se-comprendre` réflexion.
7. Textes de Cowork (protocole, Jan, Inès, Romain, fiche, phrases, ouverture) : à relire à l'écran.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

*(Claude Code, sous-agent constructeur, 17/10/2026 ; décisions du chef : `COORDINATION-action.md` §8.2 et §8.5.)*

- **Texte de loi** : C. com. **L133-1 relu sur Légifrance le 17/10/2026** (WebFetch, LEGIARTI000006220288, en vigueur depuis le 21/09/2000). Écart : ce
  que le brief appelait « 1er alinéa » tient en **deux alinéas** sur Légifrance (1er : la perte, hors force majeure ; 2e : les avaries, hors vice propre
  ou force majeure) : les deux sont écrits dans « Le droit ». L133-3 recopié du fichier d'ENT-8.8, texte identique (un cas le vérifie mot pour mot).
- **Fichiers créés / modifiés** : créés `contenus/action-ent89-donnees.js` (protocole du quai 5, scène, camion de jouets, tirage, quai d'un élève, Jan,
  fiche, phrases calculées, `qui-paie`), `contenus/action-ent89.js` (documents, Au quai, fiche, messages, jalons, options), `contenus/questions/ENT-8.9.js`,
  `contenus/corriges/ENT-8.9.js`, `outils/test/action-89.mjs` (16 cas) ; `activites/action-palette-lucas.js` remplace le squelette, livré `pret: true,
  ouverture: 'prof'` ; `outils/test.mjs` : une ligne dans `BLOCS`, une dans `GROUPES` (groupe 3) (alerte 7). Rien dans `tirage-niveaux.mjs` : la
  séance ne déclare aucune banque `declarerTirage` (tout est tiré de la graine par `tirerJeu`, comme ENT-8.8).
- **Écarts par rapport au brief** (et pourquoi) :
  1. **Pas de 3e anomalie de scène pour le confirmé, pas de `niveauxPrevus`** : le quai est une fonction de la seule graine, il ne reçoit pas le niveau
     (même limite qu'ENT-8.7) ; aucun autre bonus n'est prévu par le brief : la séance est la même pour tous (Accompagné = standard, décision §8.2 n° 4).
  2. **Dépose en variante A** (6 cases sur une ligne : allée piétonne, R1 à R4, devant le quai 6), poids 0,25 × 4 ; **aides de comptage éteintes pour
     tous** (`aides: {}`, brouillon de calcul libre), comme ENT-6.4.
  3. **Protocole à gauche du dialogue : impossible** (la vue Dialogue n'affiche que la `situation`, en texte) : la situation dit en une phrase
     « moteur coupé, clés remises, le chauffeur attend au local chauffeurs », et le protocole du quai 5 est joint au premier message de Romain.
  4. **« Local chauffeurs à droite du poste de garde » non écrit** : le plan de la cour du gabarit commun le dessine en haut à gauche, loin du poste.
  5. **Fiche de Lucas en boutons radio** (pas en listes déroulantes) : réponses longues, même raison qu'ENT-8.7.
  6. **`qui-paie`** : énoncé calculé sur SA palette à problème ; quand c'est un manquant, « Les cartons qui manquent sur ta palette P… ont été perdus
     pendant le transport » et la bonne réponse « il répond des pertes » (« abîmés » / « avaries » seraient faux). L'énoncé renvoie à « Le droit », joint
     au message « Le camion est à quai » (la question tombe à la clôture du quai, avant la fiche).
  7. **« 2 palettes sans problème (dont le piège) 0,5 chacune »** : il y en a trois (le piège + 2 conformes) ; jalons « le piège » 0,5 et « les deux
     conformes » 0,5 (justes ensemble). Le reste du §5 tel quel ; somme 20 vérifiée par un cas.
  8. Le transporteur sans nom : la vue écrit « Le camion de … », « Le chauffeur (…) » : on y lit « Jan ». Dernière bulle de Jan (« D'accord.
     J'attends. ») et réplique au quai (« Papiers. Pour vous. J'attends au local. ») construites ; les gestes du §6.2 écrits en indication (« (Tu
     montres le 5 de la main.) », « (Tu montres le pictogramme.) »).
- **Décisions prises en route** : « ma réception » juste = la phrase de CE QUE L'ÉLÈVE A ÉCRIT sur le document signé (rien écrit → « Tout est conforme,
  aucune réserve. » est la juste, le vrai problème devient un piège) ; « la palette de Lucas » juste = la phrase de SA ligne 2 (une réponse sans phrase,
  « courriel » ou « un an » : celle de sa date) ; phrases figées à l'envoi de la fiche. Inès écrit à la signature, la fiche s'ouvre à la signature, le quai
  compte « fait » à la clôture. Graine = identifiant + « |action-palette-lucas » ; dangers n° 1 (cabine ou cale) / n° 2 (niveleur, lampe ou butoirs).
  Quantités fixes (écrasé derrière 1, manquants 2, piège = moitié de la couche du dessus), comme ENT-8.8.
- **Tests** : bloc `action-89`, **16 cas verts** (dont 200 graines : date de Lucas 99 récentes / 101 anciennes, zéro secours). Sabotages éprouvés puis
  remis : ligne 2 jugée sans la date tirée → 3 cas tombent (dont le témoin `ancien`) ; phrase de Lucas jugée contre la bonne réponse → 2 cas tombent
  (dont « une erreur ne se paie qu'une fois ») ; poids du piège à 1 → la séance ne se charge plus, 10 cas tombent dont la somme.
- **Commits** : aucun (le chef de chantier commite).
- **Reste ouvert** : textes à relire à l'écran — ceux de Cowork (Jan, Romain, Inès, fiche, phrases, questions et retours) et ceux de Claude Code
  (protocole du quai 5 découpé, situation de « Au quai », dernière bulle de Jan, phrase « Je te joins aussi « Le droit » », lexique, aides et retours
  d'« Avant de commencer », trois pictogrammes, dessins de la palette de Lucas et du calendrier) ; la Messagerie affiche l'année réelle sur l'envoi de
  l'élève (limite connue) ; à 1366 × 768 la scène du quai commence sous la ligne de flottaison (moteur, comme ENT-6.4) ; l'inspection ne se joue pas au
  clavier (moteur) ; mots cliquables « lettre recommandée » et « zone litiges » définis mais non posés dans un texte (les textes où ils tombent sont de
  Cowork ou de loi) ; 50 minutes à juger en classe ; trame de Cowork. **Rien n'a été vu à l'écran par Tristan.**
