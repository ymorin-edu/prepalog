# Brief de séance — ENT-10.2 Transports Pelleau — mon premier jour dans l'entrepôt neuf (CAP OL, guidage CAP-C1.2)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, docs/briefs/MOTEUR-inspection-poste.md puis docs/briefs/ENT-10.2-pelleau-premier-jour.md en entier. ENT-10.1 et la vue « Inspection du poste » doivent être livrées. Les poids du §5 sont validés par Tristan ; fais l'état des lieux du §7, annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : à implémenter
**Date du brief** : 18/10/2026
**Conversation d'origine** : Cowork (Opus), 18/10/2026 au soir, sur délégation de Tristan ; la vue nouvelle a été choisie par Tristan (« Nouveau
dessin », 21 h 50). Décision de cadrage n° 5 de Tristan : **le piège « le site n'est pas fini » est obligatoire en guidage**.
**Modèle** : **Opus**. **Place** : après ENT-10.1 et `MOTEUR-inspection-poste.md`. **Durée estimée** : ≈ 6 h (plan de l'entrepôt, visite, poste,
planning, phrases, tests). Ce qui prend le temps : le plan construit, les photos, les tests de l'inspection tirée.

---

## 0. Règles communes

Celles de la feuille de route Pelleau. Pour cette séance : **mardi 5 mai, 7 h**. Erwan donne les consignes, puis l'élève **tient son poste seul,
Erwan reste son tuteur** (le premier message le dit, comme ENT-8.2).

**Différence avec ENT-8.2 (Action)** : chez Action, le site tourne depuis longtemps ; ici **rien n'est rodé** : il manque quelque chose au site, et
l'élève apprend à **contrôler son engin avant usage** (gestes de l'INRS, ED 36).

Écrans : **Avant de commencer → Visite de l'entrepôt → Mon poste → Le planning des quais → Rendre compte à Erwan** → bilan.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-10.2 |
| `id` | `pelleau-premier-jour` |
| Titre / desc | « Transports Pelleau — mon premier jour dans l'entrepôt neuf » / « Repérer les zones de l'entrepôt, contrôler son poste et son transpalette avant de commencer, lire le planning des quais et rendre compte à son tuteur. » |
| Rubrique | simulog, entreprise n° 10 |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competencesCap: ['CAP-C1.2']` ; sous-compétences : C1.2.1 planigramme · C1.2.2 repérer le poste · C1.2.3 missions de l'équipe · C1.2.5 conditions de mise en œuvre (sécurité, engin) · C1.2.6 rendre compte. Ligne `ATTENDU_CAP`. |
| Temps | `temps: 'guidage'` |
| Notation | jalons pondérés, `bareme: 20`, `parcours: true`, `correction: true`, `bilanDetail: true`, `precedente: 'pelleau-se-situer'` |
| Niveaux | `niveauxPrevus: ['confirme']` |
| `questions` | `'ENT-10.2'` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

- **Vérifié** : voir ENT-10.1 §2. En plus :
  - **INRS, ED 36** (transpalettes électriques à conducteur accompagnant, 2e édition 1999, réimpr. 2008 — **document ancien**, cité comme repère) :
    au début du service, le conducteur s'assure du **frein d'immobilisation**, de l'**avertisseur**, du **frein de service** et de l'**élévation**,
    que la **batterie est chargée et correctement branchée**, qu'il n'y a **pas de fuite hydraulique**, et du contact d'**arrêt d'urgence** sur la tête
    de timon ; l'utilisation n'est confiée qu'à du personnel **formé**.
  - **Code du travail** (code.travail.gouv.fr, consulté le 18/10/2026 ; **texte exact à recopier sur Légifrance**) : **D4153-27** (interdit
    d'affecter les jeunes à la conduite d'équipements de travail mobiles automoteurs ; dérogation possible), **R4153-40** (conditions de la
    dérogation : évaluation des risques, information et formation à la sécurité, encadrement par une personne compétente, avis médical d'aptitude,
    déclaration de l'article R4153-41), **R4153-51** (formation de R4323-55) ; **L4141-1** (l'employeur informe les travailleurs sur les risques).
- **Construit** : le plan de l'entrepôt (`PLAN_ENTREPOT` de `contenus/pelleau.js`), le planning du mardi 5 mai, les deux transpalettes et leurs
  numéros, la liste « Ma prise de poste », ce qui manque au site (tiré), les heures de poste.
- **Photos** : libres, sans visage, « Photo d'un autre entrepôt » ; reprises possibles de celles déjà au dépôt (Action, Smoby : vestiaire, quai,
  bureau, zone litiges), créditées.

## 3. Objectif pédagogique

À la fin, l'élève sait **repérer** les zones d'un entrepôt, **contrôler son poste et son transpalette** avant de s'en servir (liste de l'INRS),
**repérer ce qui manque** sur un site qui démarre et le **signaler**, savoir ce qu'il peut faire **en attendant**, **lire** le planning des quais et
**rendre compte**. Premier temps de C1.2 chez Pelleau ; ENT-10.3 (entraînement, piège tiré) suit, puis ENT-10.4 (évaluation).

## 4. Déroulé (≈ 50 min)

### Étape 0 — Avant de commencer (Erwan) — §4 ter

### Étape 1 — Visite de l'entrepôt (plan d'entrepôt, mode `visite`, `premierEssai`, `deuxBlocs: true`)

- **Message d'Erwan** (7 h) : « Bonjour {prénom} ! Aujourd'hui, tu tiens le poste de réception avec Yann. Je te donne les consignes, ensuite tu
  travailles seul et tu me rends compte. On commence par un tour de l'entrepôt. Erwan »
- Visite `pelleau-visite-102` sur `PLAN_ENTREPOT` : `accueil` (photo de racks, « Bienvenue dans l'entrepôt neuf »), `parcours` de **6 arrêts** :

  | n | Ancre | Titre | Texte (qui travaille là) |
  |---|---|---|---|
  | 1 | `zone:vestiaire` | Vestiaire et EPI | Chaussures de sécurité et gilet avant tout. À côté : le **local de charge** des transpalettes. |
  | 2 | `quai:Quai A` | Les quais A et B | Les camions s'y mettent à quai. **Yann** décharge au chariot. |
  | 3 | `zone:reception` | Zone de réception | Les palettes déchargées attendent ici, **rangées par client**. |
  | 4 | `zone:controle` | Zone de contrôle | On compte les colis et on regarde leur état. |
  | 5 | `zone:litiges` | Zone litiges | Ce qui pose problème attend ici, avec une étiquette. |
  | 6 | `zone:bureau` | Le bureau | **Erwan** organise l'entrepôt. **Maëlys** tient le planning des camions et saisit les réceptions. |

- `associer` « Où est-ce ? » : 4 photos (vestiaire, quai, réception, bureau) à associer à un numéro, jalon au premier essai.
- `fin` : « Tu connais l'entrepôt. Maintenant, ton poste. »

### Étape 2 — Mon poste (vue « Inspection du poste », guidage)

- **Message d'Erwan** (`apresGeste('entrepot:pelleau-visite-102:visite:fin')`) : « Avant de toucher un engin, on contrôle. Prends la liste « Ma prise
  de poste », regarde ton poste et le transpalette n° 1. Si quelque chose ne va pas, signale-le-moi. Erwan » — pièce jointe : document **« Ma prise de
  poste »** (liste en 2 parties : *le poste* — EPI, extincteur à chaque quai, plan de circulation affiché, allée piétonne libre ; *le transpalette* —
  freins, avertisseur, élévation, batterie chargée et bien branchée, pas de fuite, arrêt d'urgence). D'après l'ED 36 ; mise en forme construite.
- **Inspection** `pelleau-poste-102` (§6.1) : **un défaut du site tiré** (`extincteur` absent au quai B **ou** `affichage` absent) — **toujours
  présent** (décision 5 de Tristan) ; le transpalette n° 1 est **en ordre** mais l'avertisseur **doit être essayé** (jalon) ; un point en ordre de
  l'autre objet du site (le piège : ne pas le signaler).
- Erwan répond au défaut (`reparable: false`) : « Bien vu. L'extincteur du quai B arrive jeudi. » / « Bien vu. Le plan sera affiché demain. »
- **Fiche « En attendant »** (`quand: inspectionFinie('pelleau-poste-102')`, bloc `cases`, texte **calculé** sur le défaut tiré) : « L'extincteur du
  quai B n'est pas là. Coche ce que tu fais en attendant. » — justes : **je travaille au quai A, où il y a un extincteur** · **je le note dans mon
  compte rendu à Erwan** ; pièges : je travaille au quai B comme d'habitude · je prends l'extincteur du quai A pour le mettre au quai B · je
  rentre chez moi. (Plan : justes : **je demande à Yann de me montrer le sens de circulation** · **je le note dans mon compte rendu** ; pièges : je
  roule où je veux · j'affiche moi-même un plan dessiné à la main · je ne prends pas mon poste.)

### Étape 3 — Le planning des quais (Planning, grille identique pour la classe)

- **Message de Maëlys** (`apresFiche('en-attendant')`) : « Salut {prénom}, voici le planning des quais de ce matin. Réponds à mes deux questions,
  puis place la livraison de la Biscuiterie. Maëlys » — document « Planning des quais du mardi 5 mai » (fabriqué depuis les données, §6.2).
- **Fiche « Lire le planning »** (2 lectures tirées, + 1 bonus) ; puis **planning** `pelleau-quais-102` : une carte « Biscuiterie Ar Vag — 1 h »
  à poser entre 10 h et 12 h, **jamais au quai sans extincteur** si le défaut tiré est l'extincteur (règle du contenu : la ligne Quai B porte
  `occupe` « quai fermé : pas d'extincteur » ; si le défaut est le plan, les deux quais sont ouverts). Accusé de Maëlys sans verdict.

### Étape 4 — Rendre compte à Erwan (Messagerie, réponse par phrases)

- **Message d'Erwan** (envoi du planning) : « Avant que Loïc arrive, rends-moi compte : ton engin, ce qui manque, l'heure du camion. Erwan »
- 5 lignes (§6.3), choix **calculés** sur le tirage (le défaut du site) et la grille (heure du camion de Loïc).

### Fin

- **Erwan** : « Merci {prénom}. Loïc arrive : la semaine prochaine, on reçoit son camion ensemble. Erwan » (amorce d'ENT-10.5). Premier bilan ; « Corriger » rouvre
  « En attendant », la fiche de lecture, le planning, les phrases ; **ni la visite ni l'inspection** (`finFige` : « La visite et le contrôle du poste
  se jouent au premier essai. »).

**Mots cliquables** : EPI, local de charge, transpalette électrique, avertisseur, arrêt d'urgence, timon, extincteur, plan de circulation, allée
piétonne, planning des quais, rendre compte, tuteur.

## 4 bis. Questions au fil — choix de Cowork : A, B, C, D

Fichier `contenus/questions/ENT-10.2.js`, `part: 4`, personne : Erwan.

| id | Geste | Qui | Question (juste en gras) | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| `mineur-engin` (A) | `inspection:pelleau-poste-102:essai` | Erwan | « Tu as 17 ans. As-tu le droit de conduire ce transpalette électrique ? » — **oui, si j'ai été formé, déclaré apte par le médecin, encadré, et que l'entreprise l'a déclaré** (`derogation`) · non, jamais avant 18 ans (`jamais`) · oui, comme tout le monde (`libre`) · oui, si Yann est d'accord (`yann`) | fil | **1,5** | tout de suite | **éco-droit appliqué au cas** ; « Le droit » : D4153-27, R4153-40, R4153-51 |
| `qui-affiche` (B) | `inspection:pelleau-poste-102:signaler` (1er envoi) | Erwan | `selon` le défaut : « Le plan de circulation n'est pas affiché. Qui doit s'en occuper ? » / « L'extincteur manque. Qui doit le faire installer ? » — **l'entreprise : moi, pour Pelleau** (`employeur`) · toi (`toi`) · le lycée (`lycee`) · le conducteur du camion (`conducteur`) | fil | **1** | tout de suite | C. trav. L4141-1 (information sur les risques) ; ancrée sur **son** défaut |
| `retard-loic` (C) | `planning:pelleau-quais-102:poser` | Erwan | « Loïc appelle : il a une heure de retard. Tu le dis à qui en premier ? » — **à Erwan, ton tuteur** (`erwan`) · à la Biscuiterie (`client`) · à personne (`personne`) · à Yann (`yann`) | fil | **1,5** | **au bilan** | C1.2.6 ; proche du jalon « rendre compte » |
| `pourquoi-controler` (D) | envoi de la réponse | Erwan | « Pourquoi contrôler un transpalette neuf ? » — « Neuf ne veut pas dire chargé ou réglé » · « Quelqu'un a pu l'abîmer hier » · « C'est la règle à chaque prise de poste » · « Je n'y avais pas pensé » | fil | réflexion | tout de suite | C1.2.5 ; ne touche aucun jalon |

**Écartées** : « Que fait l'arrêt d'urgence ? » (donnerait un point de l'inspection) ; « Peux-tu quitter ton poste (droit de retrait) ? » (gardée
pour ENT-10.3, plus juste avec la pression d'un collègue).

- **Retours** : A : « Oui, mais seulement comme ça : formé, apte, encadré, et Pelleau l'a déclaré. Sans ça, tu ne conduis pas. » · B : « C'est à
  l'entreprise : elle doit informer et protéger. Toi, tu le vois et tu le dis. » · C : « À moi : je préviens Maëlys et je change l'organisation. » ·
  D : « Les trois. »
- **Document « Le droit »** (joint au message de l'étape 2) : D4153-27, R4153-40, R4153-51, L4141-1 (1er alinéa), recopiés de Légifrance, date.

## 4 ter. Avant de commencer — choix de Cowork

`tirage: { preparation: 3, image: 1 }`, non notées.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `epi` | préparation | Les EPI, ce sont… | les équipements de protection individuelle : chaussures de sécurité, gilet, gants | les engins de l'entrepôt · les documents du camion | — | ★ |
| `prise-poste` | préparation | « Prendre son poste », c'est… | se préparer et vérifier son matériel avant de commencer | partir en pause · rendre son badge | — | ★ |
| `planning-quais` | préparation | Le planning des quais montre… | quel camion arrive, à quelle heure, à quel quai | les congés de l'équipe · le stock du client | planning vide | ★ |
| `allee-pietonne` | préparation | L'allée piétonne sert à… | marcher à l'abri des engins | garer les transpalettes · poser les palettes | — | |
| `rendre-compte` | préparation | « Rendre compte », c'est… | dire à son chef ce qu'on a fait ou vu | rendre un colis · compter les palettes | — | |
| `local-charge` | préparation | Le local de charge sert à… | recharger les batteries des engins | ranger les EPI · garer les camions | — | |
| `img-tpe` | image | Comment s'appelle cet engin ? | un transpalette électrique | un chariot élévateur frontal · un gerbeur | photo libre | ★ |
| `img-extincteur` | image | Où doit être l'extincteur ? | sur son support, visible et dégagé | dans un placard fermé · dans le camion du chauffeur | photo libre | |
| `img-gilet` | image | Ce gilet sert à… | être bien vu des caristes et des conducteurs | avoir chaud · ranger le scanner | photo libre | |

**Écartées** : `avertisseur` et `arret-urgence` (donneraient l'inspection).

## 5. Jalons / notation (sur 20) — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Repérer l'entrepôt** | 4 photos, 0,75 chacune | **3** | visite, premier essai | la découverte ne rapporte rien |
| **Mon poste** | défaut du site signalé avant de prendre le poste 2,5 · avertisseur essayé 1,5 · aucun faux signalement 1,5 · « En attendant » (2 justes, rien de trop) 1,5 | **7** | jalons de l'inspection ; fiche `en-attendant` | `aucun-faux` n'est vrai qu'avec au moins un signal ; cocher tout = faux |
| **Le planning** | 2 lectures 1 chacune · carte posée 1 | **3** | fiche `lecture` ; `etapesPlanning` | carte non posée = faux |
| **Rendre compte** | ce qui manque 1 · l'heure du camion 1 · forme (salutation 0,5, fin 0,5) 1 | **3** | réponse par phrases | forme = 1 / 20 |
| **Les questions d'Erwan** | A 1,5 · B 1 · C 1,5 | **4** | questions | — |
| **Total** | | **20** | | |

- Sous-compétences : C1.2.2 = 3 · C1.2.5 = 7 + A 1,5 + B 1 · C1.2.1 = 3 · C1.2.6 = 3 + C 1,5.
- Confirmé : 1 lecture bonus. Inaction : 0/20.

## 6. Contenu

- `contenus/pelleau-ent102.js` (messages, visite, inspection tirée, fiches, planning, phrases, banques, jalons) ; `contenus/questions/ENT-10.2.js` ;
  `activites/pelleau-premier-jour.js` ; `contenus/corriges/ENT-10.2.js` (par élève : son défaut, ses lectures, ses phrases justes).

### 6.1 L'inspection (fonction de la graine)

- `defautSite` tiré : `extincteur` (quai B) ou `affichage` ; l'autre objet du site est déclaré **en ordre** (`ok: true`).
- Transpalette n° 1 : `ok` ; `essai` : `sonne`. Transpalette n° 2 : dessiné au fond, **hors poste** (non déclaré, en charge) : ENT-10.3 s'en sert.
- `arret` (guidage) : « Attends : regarde encore ton poste avec la liste. » ; `bilan` : « Avant de prendre ton poste, on regarde tout ce qui est sur la
  liste. »

### 6.2 Le planning (grille identique pour tous)

`pelleau-quais-102`, échelle 6 h – 12 h, pas 15 min, lignes Quai A, Quai B. `occupe` : Quai A 07:30–08:15 « Retour de ramasse (Loïc) » ; Quai B
09:00–10:00 « Livraison pour Agri-Kerlann (transporteur) » ; **si le défaut est l'extincteur** : Quai B 06:00–12:00 « Fermé : extincteur » (les autres
créneaux du quai B passent au quai A, 09:00–10:00 → l'élève a des places au quai A à partir de 10 h). Carte « Biscuiterie Ar Vag — 1 h », fenêtre
10:00–12:00. **Contrôle au chargement** (les deux variantes) : une seule bonne réponse par lecture, au moins une place juste.

Banque `lectures` : `l-loic-heure` (à quelle heure Loïc revient ? 7 h 30, facile) · `l-loic-quai` (quel quai ? A, facile) · `l-premier-libre` (premier
créneau libre au quai A après Loïc ? 8 h 15, moyen) · `l-combien` (combien de camions ce matin ? calculé, moyen) · `l-fin-matin` (quel quai est libre
à 11 h ? calculé, difficile). Socle `{ facile: 1, moyen: 1 }`, bonus `{ difficile: 1 }`.

### 6.3 Rendre compte (phrases)

| Ligne | Choix (juste en gras) |
|---|---|
| salutation | **Bonjour Erwan,** · Salut mon grand, · Monsieur le directeur général, |
| mon engin | **J'ai contrôlé le transpalette n° 1 : il est en ordre.** · Je n'ai pas eu le temps de regarder le transpalette. · Le transpalette n° 1 est en panne. |
| ce qui manque | (calculé) **Il manque l'extincteur du quai B : je travaille au quai A.** / **Le plan de circulation n'est pas affiché : Yann m'a montré le sens.** · Il ne manque rien. · (l'autre défaut, faux) |
| l'heure | (lue dans la grille) **Loïc revient à 7 h 30 au quai A.** · Loïc revient à 9 h au quai B. · Loïc ne revient pas ce matin. |
| fin | **Je suis au quai A. {prénom}** · Bisous · À plus. |

## 6 bis. Tirage et niveaux

Pièces fixes : visite, liste « Ma prise de poste », phrases. Tirées : le défaut du site (2 variantes, moitié-moitié sur 300 graines), les lectures.
Confirmé : 1 lecture bonus ; inspection sans aide (identique : la vue n'a pas d'aide). Accompagné : standard. Consignes neutres.

## 7. Demandes au moteur

- **`MOTEUR-inspection-poste.md`** (choisi par Tristan) : à livrer avant.
- **À vérifier à l'état des lieux** : visite **et** inspection au premier essai dans une séance `correction` (ENT-8.2 l'a fait pour la visite) ;
  `occupe` dépendant de la graine (le planning comme fonction `(db) => …`) — sinon deux grilles déclarées et le choix par la graine ; texte d'une
  fiche calculé sur l'inspection (`selon`).

### 7 bis. Non : séance nouvelle.

## 8. Tests attendus (bloc `pelleau`)

- Parcours juste (les deux variantes) → 20/20 ; inaction → 0 ; pire cas → premier bilan, `finFige`.
- Inspection : défaut non signalé → arrêt sans nommer le point (guidage) puis jalon ✗ ; avertisseur non essayé → ✗ ; le point en ordre signalé →
  `aucun-faux` ✗.
- « En attendant » : texte et choix conformes au défaut tiré (300 graines) ; cocher tout → ✗.
- Planning : variante extincteur → carte au quai B = ✗ ; contrôle de grille vert dans les deux variantes.
- Phrases : « ce qui manque » juste = celui de **son** tirage (300 graines) ; heure lue dans la grille (7 h 30, écrite à la main).
- Questions : B dit **son** défaut ; C au bilan ; somme 20. Confirmé : bandeau identique. 1366 × 768.
- Sabotages : défaut du site jamais tiré (toujours le même) → le cas des 300 graines tombe ; phrase juste non calculée → tombe.

## 9. Supports

Trame (Cowork, après validation) : la liste « Ma prise de poste » imprimable (noir et blanc), un planning vierge, demi-page de cours (zones, prise de
poste, rendre compte). Corrigé : `contenus/corriges/ENT-10.2.js`.

## 10. Critères de validation par Tristan

- Le transpalette, l'extincteur et le plan se reconnaissent sur le dessin au vidéoprojecteur ; l'essai de l'avertisseur se trouve sans aide.
- 50 minutes suffisent ; aucune consigne de plus de 3 lignes.

## 11. Questions ouvertes

- [ ] Textes de Cowork à relire à l'écran.
- [ ] La règle « 17 ans et engin » (A) : texte du Code du travail exact à recopier ; Tristan peut préférer la poser en ENT-10.3 seulement. (Défaut :
  ici, tout de suite.)

---

## Compte rendu *(rempli par Claude Code à la livraison)*
