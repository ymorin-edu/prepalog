# Brief de séance — ENT-8.10 Action, évaluation : recevoir un camion dans un nouveau site (CAP OL, évaluation CAP-C1.3 et CAP-C1.4)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/ENT-8.5-action-evaluation-se-situer.md (§0 bis, §2), docs/briefs/ENT-8.7-action-decharger.md (§6, §7) puis docs/briefs/ENT-8.10-action-evaluation-reception.md en entier. ENT-8.9, ENT-8.5 / 8.6 (module des sites) et le chantier moteur « quai en deux séances » (avec son mode évaluation) doivent être livrés. Fais l'état des lieux du §7, dis-moi ce qui contredit le brief, puis construis la séance. Annonce la durée avant de commencer.
> ```

**Statut** : à implémenter
**Date du brief** : 17/10/2026
**Conversation d'origine** : Cowork (Opus), 17/10/2026, **décisions déléguées par Tristan** (« A, prépare les briefs, tu prends les décisions » :
Action s'arrête à ENT-8.10, la dernière séance de la série). Toutes les décisions sont de Cowork (§11).
**Modèle** : **Opus**.
**Place dans l'ordre** : après ENT-8.9.
**Durée estimée par Cowork** : ≈ 4 h. Presque tout est repris (protocole, dialogue, quai, banques) ; ce qui prend le temps : le jeu neuf par site,
la note de chaque bloc en mode copie, les tests.

---

## 0. Ce qui vaut pour cette séance

- **Tout le §0 bis d'ENT-8.5** : copie rendue (rien ne dit juste ou faux, aucun bilan, aucun « Corriger »), jeu neuf tiré par élève, sans aide (pas de
  mot cliquable, pas de question au fil), « Avant de commencer » noté (4 points, « Je ne sais pas », faux = − 1 ÷ nombre de mauvaises réponses,
  plancher 0), un écran par étape, ni bonus ni niveau, jamais un élève bloqué, une erreur ne se paie qu'une fois.
- **Même site qu'ENT-8.5 / 8.6** pour un même élève (module des sites partagé) : **Onnaing (GXO)** ou **Belleville-en-Beaujolais (Kuehne+Nagel)** ;
  tuteur **Karim** ou **Sandrine** ; cariste **Léo** ou **Hugo** ; agent administratif **Manon** ou **Chloé** (construits, ENT-8.6 §11).
- **Date : mercredi 13 janvier, 6 h 30** (sans année), le lendemain d'ENT-8.6 : le troisième stage continue.
- **Une seule évaluation pour C1.3 et C1.4** (feuille de route du 16/10) : la réception d'un camion de bout en bout, comme l'entraînement ENT-8.9.
  ⚠ §11 n° 1 sur la note par compétence.

Écrans : **Avant de commencer (noté) → Le protocole du quai → Au quai : accueillir le chauffeur → Le quai (inspecter, faire décharger, contrôler,
réserves) → Rendre compte → Rendre ma copie.**

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.10 (provisoire ; tri segment par segment : après ENT-8.9) |
| `id` (jamais modifié ensuite) | `action-evaluation-reception` |
| Titre / desc | « Action — évaluation : recevoir un camion dans un nouveau site » / « Appliquer le protocole de sécurité, accueillir le chauffeur, vérifier le quai et le camion, faire décharger, contrôler les palettes, écrire les réserves et rendre compte. » |
| Rubrique | simulog, entreprise n° 8 Action |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competences: []`, `competencesCap: ['CAP-C1.3', 'CAP-C1.4']` ; lignes dans `ATTENDU_CAP` (alerte 7) |
| Temps pédagogique | `temps: 'evaluation'` (coefficient 3), `copie: true` |
| Notation | jalons pondérés, `bareme: 20` ; pas de `parcours` (ouverture par l'enseignant) |
| `questions` | `'ENT-8.10'` (ouverture seulement) |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

- **Vérifié** : les sites et prestataires (ENT-8.5 §2) ; textes R4515-4, R4515-6, R4515-8 (ENT-8.7), C. com. L133-3 (ENT-8.8), L133-1 (ENT-8.9 :
  **à relire sur Légifrance** si ENT-8.9 ne l'a pas fait).
- **Construit** (dit dans `MENTION`) : le protocole du quai de chaque site, le chauffeur (**Thomas**), le fournisseur (« un fournisseur de
  décoration »), le transporteur (sans nom), les 4 palettes, les anomalies.

## 3. Objectif

Vérifier que l'élève **reçoit seul un camion** dans un site qu'il ne connaît pas : il applique le protocole, accueille le chauffeur, repère ce qui
empêche de décharger, fait décharger au bon endroit, contrôle les palettes contre le bon de livraison, écrit une réserve précise et la fait signer,
puis rend compte.

## 4. Déroulé (≈ 40 min, en classe, sous surveillance)

### Accueil (message du tuteur)

« Bonjour {prénom}. Ce matin, tu reçois seul le camion de décoration, quai 3, 7 h. {cariste} décharge, tu diriges et tu contrôles. Je suis en
réunion : tu me rends compte par message. {tuteur} »

### Étape 0 — Avant de commencer (noté) — §4 ter

### Étape 1 — Le protocole du quai 3 (fiche, protocole à gauche)

Le protocole du site (trame d'ENT-8.7 §6.1 : {prestataire}, {site}, quai 3, responsable désigné {tuteur} ; local chauffeurs et vitesse propres au
site). Fiche : **3 situations tirées** (banque d'ENT-8.7, consignes réécrites pour le site), une ligne chacune.

### Étape 2 — Au quai : accueillir le chauffeur (Dialogue, `face: true`, **mode évaluation**)

Contact « Thomas — chauffeur, camion de décoration » ; mêmes répliques qu'ENT-8.7 (arrivée, documents, quai, attente, fin), **textes réécrits** et
ordre des choix tiré ; **aucune réaction** (la première réponse compte, `neutre` facultatif) ; un seul appel.

### Étape 3 — Le quai 3 (vue quai iso, sans froid, complète, mode copie)

- ⓪ inspection : **1 anomalie tirée** (`facile` ou `moyen`, banque d'ENT-8.7) ; rien n'arrête l'élève ; un défaut oublié est remis en ordre sans un mot.
- ① ② BL, « vous pouvez décharger », {cariste} au chariot frontal, **dépose dirigée en mode évaluation** (§7 : le premier clic pose, sans réaction).
- ③ ④ **4 palettes** (cadres photo, vases en verre, guirlandes lumineuses, coussins ; construits) : **1 à problème** tirée (`ecrase-face`,
  `ecrase-cache` ou `manquant`), **1 piège** `couche-normale`, 2 conformes ; aides éteintes ; réserves sur « Bon de livraison — lettre de voiture »,
  signature, palettes rentrées (non noté).

### Étape 4 — Rendre compte (Messagerie, réponse par phrases)

Message du tuteur (BL signé) : « Fais-moi le point sur le camion de décoration. » Phrases : salutation · ma réception (calculée sur **ses**
décisions) · fin. Envoi → « Merci {prénom}. » ; **Rendre ma copie**.

## 4 bis. Questions au fil

**Aucune** (évaluation).

## 4 ter. Avant de commencer — noté (questions clés des séances de travail)

`ouverture: { part: 4, tirage: { preparation: 3, image: 1 } }`, personne : le tuteur. **À gauche** : « Le droit » (R4515-4, R4515-8, L133-1, L133-3),
sans mot cliquable (comme ENT-8.6 : on teste la lecture d'un texte, pas la mémoire).

| id | Reprise de | Question | Juste | Pièges |
|---|---|---|---|---|
| `k-protocole` | 8.7 ★, 8.9 ★ | Un protocole de sécurité, c'est… | un document qui dit comment livrer et décharger sans danger sur ce site | un contrat de vente · le planning des camions |
| `k-qui-ecrit` | 8.7 M | Le protocole de ce quai, qui l'a écrit ? (lis « Le droit ») | {prestataire} et le transporteur, ensemble, avant la première livraison | le chauffeur, seul · Action |
| `k-plan-circulation` | 8.7 ★ | Le plan de circulation d'un site montre… | par où passent les camions et les piétons | les rayons du magasin · les horaires de l'équipe |
| `k-anomalie` | 8.7 ★ | Une anomalie, c'est… | quelque chose qui n'est pas normal et qu'on signale | une palette de plus · une pause |
| `k-attendre` | 8.7 N | {cariste} veut décharger avant que le problème du quai soit réglé. Que fais-tu ? | on attend que {tuteur} ait réglé le problème | je le laisse faire · je décharge moi-même |
| `k-reserve` | 8.8 ★, 8.9 ★ | Une réserve, c'est… | une remarque écrite sur le document du transporteur, qui dit ce qui ne va pas | une palette de secours · un carton en stock |
| `k-signer` | 8.8 Q2 | Pourquoi le chauffeur signe-t-il sous tes réserves ? | pour reconnaître ce qui a été constaté devant lui | pour être payé · pour partir plus vite |
| `k-trois-jours` | 8.8 Q1, 8.9 | Une palette acceptée sans réserve est abîmée. Combien de temps pour protester auprès du transporteur ? (lis « Le droit ») | 3 jours, sans compter les jours fériés, par lettre recommandée | 1 mois, par courriel · 1 an |
| `k-qui-paie` | 8.9 | Des cartons sont abîmés pendant le transport. Qui en répond ? (lis « Le droit ») | le transporteur | {prestataire} · le magasin |
| `k-img-cale` | 8.7 ★, 8.9 ★ | « Cet objet devant la roue sert à… » | empêcher le camion de bouger | gonfler le pneu · laver la roue |
| `k-img-carton-ecrase` | 8.8 ★, 8.9 ★ | « Ce carton est… » | écrasé : la marchandise dedans est peut-être abîmée | neuf · vide |
| `k-img-niveleur` | 8.2, 8.7 | « Cette plaque au bord du quai sert à… » | passer du quai au camion avec l'engin | bloquer les roues · peser la palette |

Banque : 9 ≥ 6, 3 ≥ 2. **Écartée** : « le chauffeur attend où ? » (donnerait la réplique `attente` du dialogue).

## 5. Jalons / notation (sur 20) — décidés par Cowork (§11)

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Avant de commencer** | 4 questions | **4** | ouverture | — |
| **Le protocole** | 3 situations, 1 chacune | **3** | fiche `protocole` | — |
| **Accueillir le chauffeur** | salutation 0,5 · documents 0,75 · quai 0,5 · attente 0,75 · fin 0,5 | **3** | appel (`premiereReponse`) | forme 1 / 20 (5 %) |
| **Avant de décharger** | anomalie signalée avant « C'est bon » 2 · aucun faux signalement 0,5 | **2,5** | `securite-<id>`, `securite-aucun-faux` | « aucun faux » faux si rien n'est signalé |
| **Faire décharger** | dépose 0,25 × 4 | **1** | dépose (premier clic) | — |
| **Contrôler les palettes** | 2 sans problème (dont le piège) 0,75 chacune · la palette à problème (comptage et décision) 2 | **3,5** | `<P>-comptage`, `<P>-decision` | — |
| **Réserves et signature** | réserve écrite juste 1 · pas de « sous réserve de déballage » 0,5 · signature 0,5 | **2** | `<P>-reserve`, `deballage`, `signature` | `deballage` vrai seulement une fois les réserves écrites |
| **Rendre compte** | ma réception 1 | **1** | phrases | jugée contre **ses** décisions au quai ; salutation et fin non notées |
| **Total** | | **20** | | |

- Par compétence : **C1.3 = 9,5** (protocole 3, accueil 3, avant de décharger 2,5, dépose 1) ; **C1.4 = 6,5** (contrôle 3,5, réserves 2, compte rendu 1) ;
  ouverture 4 (questions des deux).
- `noter(db)` = la note du Suivi.

## 6. Contenu (données)

`contenus/action-ent810.js` (+ `-donnees.js`), `contenus/questions/ENT-8.10.js`, `activites/action-evaluation-reception.js`, `contenus/corriges/ENT-8.10.js`
(par élève : site, situations, anomalie, palette à problème et piège, réserves attendues, phrase juste). Repris **par import** : le module des sites
(ENT-8.5), la trame du protocole et la banque `situations` (ENT-8.7), les banques d'anomalies (ENT-8.7 scène, ENT-8.8 palettes), « Le droit » (ENT-8.7
à 8.9). Protocole et dialogue **réécrits par site** (aucune phrase identique à ENT-8.7 / 8.9 dans les bonnes réponses, pour que la mémoire seule ne suffise pas).

## 6 bis. Tirage

- **Site** : celui d'ENT-8.5. **Situations** : `{ facile: 1, moyen: 1, difficile: 1 }`. **Scène** : 1 anomalie `facile` ou `moyen`. **Palettes** :
  1 problème parmi `ecrase-face`, `ecrase-cache`, `manquant` (répartition contrôlée sur 200 graines : chaque type entre 20 et 45 %), 1 piège, 2 conformes,
  3 palettes différentes. Ordre des choix du dialogue tiré.
- **Ni bonus ni niveau** ; un élève accompagné joue le standard (tiers-temps possible).

## 7. Demandes au moteur

- **Lot 2 du chantier d'ENT-8.7 en mode évaluation** (ajouté au §7.2 d'ENT-8.7 le 17/10) : dans une séance `copie`, le premier clic sur une case pose
  la palette, **sans réaction** du cariste et sans case grisée ; le jalon lit ce premier clic.
- À vérifier à l'état des lieux : la vue quai en `copie` (rien au Suivi avant la remise, `noter` = note figée) avec l'inspection sur la scène ; le
  Dialogue `face: true` en mode évaluation ; la note **par compétence** quand une séance déclare deux `competencesCap` (§11 n° 1).

### 7 bis. Séance déjà jouée ? Non.

## 8. Tests attendus

Bloc `action-810` (ligne dans `BLOCS` et `GROUPES` : alerte 7).

- Deux témoins (un par site) : 20/20 ; inaction 0 ; même site qu'ENT-8.5.
- Rien ne dit juste ou faux (aucun ✓ / ✗, aucune réaction de Thomas ni du cariste) ; aucun « Corriger ».
- Dialogue : première réponse maladroite à `attente`, puis la bonne → jalon ✗ (la première compte).
- Inspection : « C'est bon » sans signaler → 0 sur le bloc, l'élève continue.
- Compte rendu : élève qui a accepté sa palette à problème et l'écrit honnêtement (« Tout est conforme ») → contrôle ✗, compte rendu ✓.
- Ouverture : barème « Je ne sais pas » / fausse ; « Le droit » à gauche.
- Sabotages : compte rendu jugé contre la bonne décision → le cas « honnête » tombe ; dépose avec réaction en copie → le cas « rien ne dit juste » tombe.

## 9. Supports

Pas de trame. Fiche enseignant d'une page (Cowork, après livraison) : ce que mesure chaque bloc, les deux sites, comment lire la note par compétence.

## 10. Critères de validation par Tristan

- 40 minutes suffisent à un CAP ; rien ne dit juste ou faux ; le passage d'un écran à l'autre se fait par la barre « Étape suivante ».
- Deux voisins n'ont presque jamais le même jeu (site, situations, anomalie, palette).

## 11. Décisions prises par Cowork (délégation de Tristan, 17/10/2026)

1. **Une seule évaluation pour C1.3 et C1.4** (feuille de route), alors qu'ENT-8.5 / 8.6 ont séparé C1.1 et C1.2. Si le moteur sait donner à chaque
   compétence **sa part** de la note (C1.3 = 9,5 + sa part de l'ouverture, C1.4 = 6,5 + la sienne, ramenées sur 20), le faire ; sinon la même note va
   aux deux compétences, et **le dire à Tristan** : il peut alors demander de couper en deux séances (8.10 et 8.11) comme 8.5 / 8.6.
2. Même site et mêmes personnes qu'ENT-8.5 / 8.6 ; date du 13 janvier.
3. Pas d'erreur induite en évaluation ; 1 anomalie de scène, 4 palettes avec 1 problème et 1 piège.
4. Ouverture : questions clés d'ENT-8.7 à 8.9, « Le droit » à gauche.
5. Poids du §5.
6. Textes de Cowork (protocoles par site, dialogue de Thomas, phrases) : à relire à l'écran.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
