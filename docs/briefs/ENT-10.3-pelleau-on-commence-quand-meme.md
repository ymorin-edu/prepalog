# Brief de séance — ENT-10.3 Transports Pelleau — « On commence quand même ? » (CAP OL, entraînement CAP-C1.2, erreur induite)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet suffit si ENT-10.2 est livrée) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, docs/briefs/ENT-10.2-pelleau-premier-jour.md (§0, §6) puis docs/briefs/ENT-10.3-pelleau-on-commence-quand-meme.md en entier. Les poids du §5 sont validés par Tristan ; annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : livré (19/10/2026, sous-agent Sonnet, chantier Pelleau ; rien commité par le sous-agent)
**Date du brief** : 18/10/2026
**Conversation d'origine** : Cowork, 18/10/2026, sur délégation. Décision de cadrage n° 5 de Tristan : **en entraînement, l'un des deux pièges tiré au
sort** (« le site n'est pas fini » ou « l'engin n'a pas été contrôlé »).
**Modèle** : Sonnet (même matière qu'ENT-10.2). **Durée estimée** : ≈ 4 h (deux variantes tirées, deux dialogues, tests du tirage).

---

## 0. Règles communes

Feuille de route Pelleau. **Mercredi 6 mai, 6 h.** Erwan est en réunion jusqu'à 8 h : l'élève prend son poste avec **Yann**, pressé (un camion à
6 h 30). **L'erreur induite** : c'est Yann qui pousse à commencer sans contrôler. Yann n'est pas un méchant : il est pressé et il croit bien faire.

Écrans : **Avant de commencer → Yann (dialogue) → Mon poste (inspection) → Yann insiste (dialogue) → Fiche de signalement → Rendre compte à
Erwan** → bilan.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-10.3 |
| `id` | `pelleau-on-commence-quand-meme` |
| Titre / desc | « Transports Pelleau — on commence quand même ? » / « Contrôler son poste et son engin même quand un collègue presse, refuser ce qui n'est pas sûr, le signaler par écrit et rendre compte. » |
| Niveau / compétence | `niveaux: ['cap']`, `competencesCap: ['CAP-C1.2']` (C1.2.5, C1.2.6) |
| Temps | `temps: 'entrainement'` (erreur induite) |
| Notation | jalons pondérés, `bareme: 20`, `parcours`, `correction`, `bilanDetail`, `precedente: 'pelleau-premier-jour'` |
| Niveaux | `niveauxPrevus: ['confirme']` |
| `questions` | `'ENT-10.3'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

- **Vérifié** : voir ENT-10.2 §2 (ED 36, Code du travail). En plus, **à recopier sur Légifrance** : **C. trav. L4122-1** (il incombe à chaque
  travailleur de prendre soin, en fonction de sa formation et selon ses possibilités, de sa santé et de sa sécurité ainsi que de celles des autres
  personnes concernées par ses actes ou ses omissions au travail).
- **Construit** : la réunion d'Erwan, le camion de 6 h 30, les défauts tirés, les répliques de Yann.

## 3. Objectif pédagogique

Refaire **seul** le contrôle d'ENT-10.2, sur un piège **tiré**, et **ne pas céder** quand un collègue presse : ne pas utiliser ce qui n'est pas sûr,
proposer ce qu'on fait à la place, **signaler par écrit** et rendre compte. Entraînement de C1.2 ; ENT-10.4 évalue.

## 4. Déroulé (≈ 45 min) — mercredi 6 mai

### Étape 0 — Avant de commencer (Erwan) — §4 ter

### Étape 1 — Yann (Dialogue à choix, `face: true`)

- **Message d'Erwan** (envoyé la veille, 18 h) : « Demain je suis en réunion jusqu'à 8 h. Prends ton poste avec Yann. S'il y a un problème, écris-le-moi.
  Erwan »
- **Dialogue `pelleau-yann-1`** (6 h 05) : Yann : « Salut ! Le camion de 6 h 30 arrive, faut aller vite. J'ai sorti le transpalette n° 2 pour toi,
  vas-y ! » — répliques (juste en gras) : **« Je le contrôle d'abord, ça prend deux minutes. »** · « D'accord, j'y vais. » · « Tu l'as contrôlé, toi ? »
  (réaction : « Euh… non. Fais-le, alors. » → compte comme juste au 2e tour) · « Je t'attends, fais-le pour moi. ». Jalon : une réplique « je contrôle »
  au premier choix (1,5) ; le dialogue continue toujours (jamais bloqué).

### Étape 2 — Mon poste (Inspection, entraînement)

- Inspection `pelleau-poste-103`, **une variante tirée** (§6.1) :
  - **Variante S « le site n'est pas fini »** : `extincteur` absent au quai A **ou** `affichage` absent (tiré) ; les deux transpalettes en ordre.
  - **Variante E « l'engin n'a pas été contrôlé »** : transpalette n° 2 (celui que Yann a sorti) avec **un défaut tiré** parmi `fourcheTordue`,
    `roueAbimee`, `batterie`, `arretUrgence`, `fuite`, `avertisseur` (muet) ; transpalette n° 1 en ordre (à essayer aussi) ; le site en ordre.
  - Dans les deux : un **point en ordre** déclaré (piège : ne pas le signaler).
- `qui: 'Erwan'` mais Erwan est en réunion : bouton « **Noter pour Erwan** » (texte de `signaler.bouton`), réponse « (Message noté pour Erwan.) » ; pas de
  réparation (`reparable: false` partout).
- **Pas d'arrêt** (`arret: false`) : c'est un entraînement ; la note le dira.

### Étape 3 — Yann insiste (Dialogue `pelleau-yann-2`, `quand: inspectionFinie('pelleau-poste-103')`, texte selon la variante)

- **S** : Yann : « Bon, l'extincteur arrive cette semaine. On commence quand même ? » — **« On travaille au quai B, où il y en a un, et je préviens
  Erwan par écrit. »** · « Oui, on commence. » · « Je prends l'extincteur du quai B pour le mettre au quai A. » · « Je rentre chez moi. »
  (Plan : **« Montre-moi le sens de circulation, et je préviens Erwan par écrit. »** · « Oui, on roule. » · « Je dessine un plan moi-même. » · « On
  ne travaille pas aujourd'hui. »)
- **E** : Yann : « Le n° 2 marche, roule doucement, ça ira. » — **« Je prends le n° 1, je l'ai contrôlé. Le n° 2, je le mets de côté avec un mot pour
  Erwan. »** · « D'accord, je roule doucement. » · « Je le répare moi-même. » · « Je décharge à la main, sans engin. »
- Réaction de Yann à la bonne réplique : « OK, t'as raison. » (il ne fait pas la leçon). Jalon : la bonne réplique **au premier choix** (3).

### Étape 4 — Fiche de signalement (fiche, `apresDialogue('pelleau-yann-2')`)

- **Fiche « Signalement »** (comme une étiquette de consignation, construite) : 3 lignes `liste`, choix **calculés** sur la variante :
  **quoi** (« Transpalette n° 2 : fourche tordue » / « Quai A : extincteur absent »… parmi 4 choix dont 3 défauts faux) · **ce qu'on ne fait pas**
  (« Ne pas utiliser le transpalette n° 2 » / « Ne pas travailler au quai A ») · **ce que j'ai fait** (« J'ai pris le n° 1 contrôlé » / « On travaille au
  quai B »). Envoi « Poser la fiche et l'envoyer à Erwan ».

### Étape 5 — Rendre compte à Erwan (phrases, réponse au message d'Erwan)

- 4 lignes (§6.3) : salutation · ce que j'ai vu (calculé) · ce que j'ai fait (calculé) · fin.

### Fin

- **Erwan** (8 h 05) : « Merci {prénom}, j'ai lu ta fiche. Bien fait de ne pas commencer comme ça. Erwan » — **toujours le même message** (il ne dit
  pas si le détail est juste). Premier bilan ; « Corriger » rouvre la fiche et les phrases ; **pas l'inspection ni les dialogues** (`finFige` : « Ce
  matin-là ne se rejoue pas : Yann a déjà entendu ta réponse. »).

## 4 bis. Questions au fil — choix de Cowork : A, B, C, D

| id | Geste | Qui | Question (juste en gras) | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| `l4122` (A) | `inspection:pelleau-poste-103:fini` | Erwan (message noté avant sa réunion) | « Si un collègue te presse, que dit le Code du travail ? » — **chacun doit prendre soin de sa sécurité et de celle des autres** (`chacun`) · le stagiaire obéit au plus ancien (`ancien`) · seul le chef répond de la sécurité (`chef`) · on peut tout refuser, toujours (`tout`) | point d'étape | **1,5** | **au bilan** (elle donnerait la réplique de l'étape 3) | **éco-droit appliqué au cas** ; « Le droit » : L4122-1 |
| `qui-repare` (B) | `fiche:signalement` 1re ligne | Erwan | `selon` : « Qui fait réparer le transpalette n° 2 ? » / « Qui fait installer l'extincteur ? » — **l'entreprise : Erwan s'en occupe** (`entreprise`) · toi (`toi`) · Yann (`yann`) · le fabricant vient tout seul (`fabricant`) | fil | **1** | tout de suite | C1.2.5, ancrée sur **son** défaut |
| `pourquoi-ecrire` (C) | `fiche:signalement:envoyer` | Erwan | « Pourquoi l'écrire, et pas seulement le dire à Yann ? » — **pour qu'Erwan le sache même absent, et que personne d'autre ne s'en serve** (`trace`) · pour avoir une bonne note (`note`) · pour accuser Yann (`accuser`) | fil | **1,5** | tout de suite | C1.2.6 |
| `le-plus-dur` (D) | envoi des phrases | Erwan | « Ce matin, qu'est-ce qui était le plus dur ? » — « Trouver ce qui n'allait pas » · « Dire non à Yann » · « Savoir quoi faire à la place » · « Rien » | fil | réflexion | tout de suite | — |

**Retours** : A : « Chacun : toi aussi. Un engin en défaut, on ne s'en sert pas, même si on est pressé. » · B : « L'entreprise : moi. Toi, tu le
signales et tu ne t'en sers pas. » · C : « Écrit, ça reste : la personne de l'après-midi le lira aussi. » · D : « Dire non à un collègue, c'est souvent le
plus dur. Tu peux le dire gentiment : « je contrôle d'abord ». »

**Document « Le droit »** : L4122-1 (1er alinéa) + rappel d'ENT-10.2 (D4153-27, R4153-40).

## 4 ter. Avant de commencer

`tirage: { preparation: 3, image: 1 }`, non notées ; banque d'ENT-10.2 (mêmes ids, `cle` inchangés) **sauf** `prise-poste` remplacée par
`consigner` (« Mettre un engin de côté avec un mot « ne pas utiliser », c'est… » — **éviter qu'un autre s'en serve avant la réparation** · le
ranger pour la nuit · le prêter à un collègue) ★, et deux images : `img-fourche` (photo libre de fourches de transpalette : « Les fourches servent
à… » **soulever la palette**) et `img-batterie` (« Ce câble branché au mur sert à… » **recharger la batterie**).
Écartées : tout ce qui donnerait un défaut à trouver.

## 5. Jalons / notation — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids | Ce qu'il lit |
|---|---|---|---|
| **Avant le premier geste** | réplique « je contrôle d'abord » au premier choix | **1,5** | dialogue `pelleau-yann-1` |
| **Mon poste** | défaut signalé 3,5 · avertisseur(s) essayé(s) 1 · aucun faux 1,5 | **6** | inspection |
| **Ne pas céder** | bonne réplique au premier choix | **3** | dialogue `pelleau-yann-2` |
| **Signaler par écrit** | 3 lignes, 1 chacune | **3** | fiche `signalement` |
| **Rendre compte** | vu 0,75 · fait 0,75 · forme 1 | **2,5** | phrases |
| **Les questions d'Erwan** | A 1,5 · B 1 · C 1,5 | **4** | questions |
| **Total** | | **20** | |

- Variante E, avertisseur muet : le défaut **est** l'avertisseur → le jalon « essayé » et le jalon « défaut signalé » sont deux cases différentes (on peut
  essayer sans signaler). Inaction : 0/20. Confirmé : aucun bonus (même matin) ; **aides** : aucune dans la vue ; la liste « Ma prise de poste »
  n'est **pas** jointe chez le confirmé (il la connaît), jointe chez le standard.

## 6. Contenu

`contenus/pelleau-ent103.js`, `contenus/questions/ENT-10.3.js`, `activites/pelleau-on-commence-quand-meme.js`, `contenus/corriges/ENT-10.3.js` (sa
variante, son défaut, ses justes).

### 6.1 Tirage

- `variante` : `S` ou `E` (moitié-moitié sur 300 graines, contrôlé). `S` → `defautSite` ∈ {`extincteur` quai A, `affichage`}. `E` → `defautEngin` ∈
  {`fourcheTordue` facile, `batterie` facile, `fuite` moyen, `roueAbimee` moyen, `arretUrgence` difficile, `avertisseur` difficile} (uniforme).
- Le point en ordre : l'autre objet du site (S) ou l'extincteur (E).
- Dialogues, fiche, phrases : **calculés** sur le tirage (aucun texte qui nomme un autre défaut que le sien, sauf les pièges).

### 6.3 Phrases

salutation (**Bonjour Erwan,** · Salut mon grand, · Yo,) · vu (calculé : **le défaut tiré** · « Tout était en ordre. » · un autre défaut) · fait
(calculé : **ce que dit la bonne réplique** · « J'ai commencé avec le n° 2. » · « J'ai attendu ton retour sans rien faire. ») · fin (**À tout à l'heure.
{prénom}** · Bisous · rien de plus : « Voilà. »).

## 7. Demandes au moteur

Aucune de nouvelle (vue `inspection` et dialogue `face: true` livrés avant). **À vérifier** : dialogue dont le texte dépend de la graine ;
`apresDialogue` ; bouton de signalement renommé ; réplique « juste au 2e tour » (sinon : 2 justes au premier choix seulement).

### 7 bis. Non.

## 8. Tests attendus (bloc `pelleau`)

- Parcours juste, variantes S et E → 20/20 ; inaction → 0 ; tirage : 300 graines → S et E entre 40 et 60 %, chaque défaut E au moins 10 fois.
- « D'accord, j'y vais » puis contrôle → bloc 1 ✗, le reste juste ; dialogue 2 mauvais choix → bloc 3 ✗, l'élève finit.
- Fiche et phrases conformes à **sa** variante ; texte d'un autre défaut jamais en « juste ».
- A au bilan ; B, C tout de suite ; somme 20 ; pas d'arrêt de l'inspection.
- Sabotage : variante fixée à S → le cas du tirage tombe ; fiche juste calculée sur une autre graine → tombe.

## 9. Supports

Trame : fiche de signalement vierge (noir et blanc). Corrigé par élève.

## 10. Critères de validation par Tristan

Yann sonne juste (pressé, pas méchant) ; les deux variantes se jouent en 45 min ; le défaut tiré se voit au vidéoprojecteur.

## 11. Questions ouvertes

- [ ] Textes de Yann à relire à l'écran (ton CAP, pas de leçon).
- [ ] Variante E « avertisseur muet » : défaut invisible, seul l'essai le montre — difficile pour un CAP. (Défaut : gardé, classé difficile.)

---

## Compte rendu *(rempli par Claude Code à la livraison)*

**19/10/2026 — sous-agent Sonnet, chantier Pelleau.** Rien n'est commité (le chef relit, commite et pousse).

- **Fichiers** : `activites/pelleau-on-commence-quand-meme.js` (`pret: true, ouverture: 'prof'`), `contenus/pelleau-ent103.js` (messages, documents, dialogues, fiche, jalons), `contenus/pelleau-ent103-donnees.js` (données pures : tirage, inspection, dialogues, fiche, phrases ; chargé aussi sous Node par le corrigé), `contenus/questions/ENT-10.3.js`, `contenus/corriges/ENT-10.3.js`, `outils/test/pelleau-103.mjs` (21 cas + 1 de captures sous `CAPTURES_ENT103`). Lignes ajoutées : `activites/index.js` (sous ENT-10.2), `outils/test.mjs` (`BLOCS`, `GROUPES` 1), `outils/test/socle.mjs` (`'ENT-10.3': 'CAP-C1.2'`) ; `qFilSelecteur` ajoutée à la fin de `outils/test/pelleau/commun.mjs`. Pas de `declarerTirage` : le tirage est une fonction pure de la graine (rien à ajouter à `BANQUES_FIGEES`).
- **Poids codés** (ceux du §5) : avant le premier geste 1,5 · mon poste 6 (défaut signalé 3,5 · avertisseur n° 1 0,5 · avertisseur n° 2 0,5 · aucun faux 1,5) · ne pas céder 3 · signaler par écrit 3 (1 × 3) · rendre compte 2,5 (vu 0,75 · fait 0,75 · salutation 0,5 · fin 0,5) · questions 4 (A 1,5 · B 1 · C 1,5 ; D réflexion). Inaction : 0/20 (testé, y compris un poste « pris » sans signal ni essai). Aucun bonus ; confirmé : « Ma prise de poste » non jointe.
- **Écarts avec le brief** (à valider) :
  1. **Quai A / quai B inversés** : la vue d'inspection dessine « QUAI B » sur sa porte (aucun réglage de nom). Le site manque de l'extincteur / du plan DU QUAI B et l'élève travaille au quai A (comme ENT-10.2).
  2. **Pas d'arrêt** (`arret: false`, le brief le dit) : le défaut oublié n'est pas relevé par Erwan ; le jalon est faux, l'élève continue. La consigne du chef citait « arrêt sans nommer le point » : non applicable ici (le test vérifie qu'aucun arrêt n'existe).
  3. **Juste au 2e tour** : repli de la feuille : seule la première réponse compte (« Tu l'as contrôlé, toi ? » fait dire à Yann « Euh… non. Fais-le, alors. » sans racheter).
  4. **Erwan en réunion répond la même chose à tout signalement** (« Reçu. Je lis ça à ma sortie de réunion. », défaut ou point en ordre) : réglé par `signaler.rien/deja: ''` et `repare: ' '` (ruse : la vue n'a pas d'option « même réponse »).
  5. **Quatre points déclarés pour toutes les graines** (n° 1, n° 2, extincteur, plan ; exactement un en défaut ; ids `tp1`, `defaut`, `ordre-1`, `ordre-2`) au lieu d'« un point en ordre » ; deux essais (n° 1 et n° 2), 0,5 chacun. Le n° 2 est déclaré avec son défaut (décision du chef sur la question d'ENT-10.2).
  6. **Réactions de Yann (2e rencontre) communes aux trois variantes** (le moteur ne calcule pas les réactions) : « Et si Erwan nous demande pourquoi on n'a rien dit ? » · « Tout seul ? Ce n'est pas notre boulot, ça. » · « Hé, pas si vite ! Il y a quand même un camion qui arrive. ». Son texte et les quatre réponses suivent le défaut (`selon`).
  7. **Dernier message d'Erwan neutre** : « Merci {prénom}, j'ai lu ta fiche. On en reparle tout à l'heure, avec Yann. » à la place de « Bien fait de ne pas commencer comme ça » (faux pour l'élève qui a cédé).
  8. **Question A** : `fil` avec `apres: 'bilan'` au lieu d'un « point d'étape » (même effet, pas d'écran de transition). B se déclenche sur le geste de la première ligne de la fiche (`fiche:signalement-103:quoi`).
  9. **Dessins d'« Avant de commencer »** : engin et local de charge tracés par le kit iso (aucune photo libre au dépôt). « Ma prise de poste » est recopiée dans la séance (une séance n'importe jamais le fichier d'une autre). Deux messages guidés non prévus au brief : « Alors ? » de Yann après l'inspection, « Ta fiche » d'Erwan (ouvre la fiche).
  10. L4122-1 (1er alinéa) : début confirmé sur code.travail.gouv.fr (19/10/2026), **reste non relu mot à mot sur Légifrance** (dit en pied du document « Le droit »).
- **Tests** : `pelleau-103` 22/22 (21 + captures) ; `socle dependances tirage-niveaux questions inspection dialogue pelleau-102 pelleau-103` 278/278. Sabotages joués puis remis (empreintes vérifiées) :

  | Sabotage | Cas tombés |
  |---|---|
  | jalon du compte rendu vrai sans envoi (inaction) | inaction |
  | variante toujours S (piège E jamais tiré) | tirage 300 graines, parcours E (f, a), Yann 2, inspection E, compte rendu, pire cas, socle |
  | arrêt qui nomme le point | inspection « aucun arrêt », tirage, pire cas |
  | Erwan dit « rien qui cloche » sur un point en ordre | inspection « même réponse défaut ou non » |
  | fiche juste calculée sur une autre graine | parcours juste (g, f, a), Yann 2, inspection E, fiche, confirmé |

- **Écran** : 1366 × 768, la page ne défile pas sur l'inspection (messages lus) ; captures (accueil, Yann, inspection après signalement, bilan) regardées. 1280 × 720 non mesuré ici.
- **À vérifier par Tristan à l'écran** : le ton de Yann (pressé, pas méchant ; ses 3 réactions, sa réplique selon la variante) ; que « Reçu. Je lis ça à ma sortie de réunion. » ne trahit rien ; les deux transpalettes et le défaut tiré visibles au vidéoprojecteur (l'avertisseur muet est invisible : seul l'essai le montre, difficile pour un CAP, classé difficile) ; les deux messages ajoutés ; le menu « Avec Yann » à deux contacts ; le texte final d'Erwan (écart 7).
