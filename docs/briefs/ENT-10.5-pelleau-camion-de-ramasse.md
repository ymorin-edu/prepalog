# Brief de séance — ENT-10.5 Transports Pelleau — le camion de ramasse rentre (CAP OL, guidage CAP-C1.3)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, docs/briefs/MOTEUR-depose-par-client.md, docs/briefs/ENT-8.7-action-decharger.md (§4 à §7 : le modèle du quai) puis docs/briefs/ENT-10.5-pelleau-camion-de-ramasse.md en entier. L'option « dépose par client » doit être livrée. Les poids du §5 sont validés par Tristan ; fais l'état des lieux du §7, annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : livré (19/10/2026, non commité : le chef commite) · **Date** : 18/10/2026
**Conversation d'origine** : Cowork, 18/10/2026, sur délégation. Décision de cadrage n° 4 de Tristan : **« un camion, plusieurs clients »** — le
camion Pelleau rentre de ramasse avec les palettes de 2 ou 3 clients mélangées ; l'élève les sépare par client et les rapproche de l'**annonce** de
chaque client. Vue : « étendre la dépose » (Tristan, 21 h 50).
**Modèle** : **Opus**. **Durée estimée** : ≈ 5 h (documents, dialogue, quai avec dépose par client, rapprochement, tests).

---

## 0. Règles communes

Feuille de route Pelleau. **Mardi 12 mai, 7 h 30** (amorcé à la fin d'ENT-10.2). Le camion est **un porteur Pelleau** conduit par **Loïc**, un collègue
(**tu**). **Yann** décharge au chariot frontal, **l'élève dirige** (case de chaque palette), comme ENT-8.7 (stagiaire souvent mineur).

**Différence avec Action (ENT-8.7)** : chez Action, un camion apporte la marchandise **d'un fournisseur** pour **un** client (Action). Ici, le camion
de la maison rapporte la marchandise de **plusieurs clients** qui vont la **stocker** chez Pelleau : on sépare par client avant tout. Pas de protocole
de sécurité écrit (conducteur de l'entreprise : règles internes, dites par Erwan) ; le pré-contrôle du quai reste.

Écrans : **Avant de commencer → Préparer la réception → Loïc arrive (dialogue) → Le quai A (inspection, déchargement trié par client) →
Rapprocher des annonces → Rendre compte à Maëlys** → bilan.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.5 / `pelleau-camion-de-ramasse` |
| Titre / desc | « Transports Pelleau — le camion de ramasse rentre » / « Préparer la réception, accueillir le conducteur, vérifier le quai, faire décharger en séparant les palettes de chaque client, puis les rapprocher de ce que chaque client a annoncé. » |
| Compétence | `competencesCap: ['CAP-C1.3']` ; C1.3.1 préparer la réception · C1.3.2 accueillir le conducteur · C1.3.3 décharger en sécurité · C1.3.4 vérifier la conformité documentaire (nombre de colis / palettes). Ligne `ATTENDU_CAP`. |
| Temps | `temps: 'guidage'` |
| Notation | `bareme: 20`, `parcours`, `correction`, `bilanDetail`, `precedente: 'pelleau-evaluation-prise-de-poste'` |
| Niveaux | `niveauxPrevus: ['confirme']` |
| `questions` | `'ENT-10.5'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

- **Vérifié** : ramasses quotidiennes chez les producteurs locaux, livraisons quotidiennes vers la région parisienne (site Pelleau) ; entrepôt ambiant
  avec réception, stockage, préparation, expédition (site, presse). C. civ. **1932** (dépôt : rendre la chose même), texte d'ENT-10.1.
- **Construit (dit en pied des documents)** : le passage de la ramasse par l'entrepôt, les clients (fictifs), la **feuille de ramasse** de Loïc (document
  construit : expéditeur, nombre de palettes, colis, signature du client au chargement), les **annonces** des clients (courriels), le quai A.
- Documents : pied « Document pédagogique — reconstitution, non contractuel. Entreprises clientes fictives. »

## 3. Objectif

À la fin, l'élève sait **préparer** une réception (combien de palettes, de quels clients), **accueillir** un conducteur (feuille de ramasse, moteur
coupé, cale, local), **vérifier le quai**, **faire poser chaque palette dans la zone de son client** en lisant l'étiquette, et **rapprocher** ce qui
est arrivé de ce que chaque client a annoncé. Premier temps de C1.3 ; ENT-10.6 et 10.7 entraînent, ENT-10.8 évalue ; le contrôle des palettes
(comptage, avaries) est le bloc suivant (ENT-10.9).

## 4. Déroulé (≈ 50 min) — mardi 12 mai

### Étape 0 — Avant de commencer (Erwan) — §4 ter

### Étape 1 — Préparer la réception (Messagerie + fiche)

- **Message de Maëlys** (7 h) : « Salut {prénom}, Loïc rentre de sa ramasse vers 7 h 30, quai A. Voici sa feuille et les annonces des clients. Prépare
  la réception. Maëlys » — pièces jointes : **feuille de ramasse** (§6.1) et **deux annonces** (courriels des clients au vous : « Nous vous confions
  ce jour 2 palettes de biscuits… »).
- **Fiche « Préparer »** (`liste`, 2 lignes) : « Combien de palettes arrivent ? » (4) · « Pour combien de clients ? » (2). Valeurs **lues** dans les
  documents (calculées par le code).

### Étape 2 — Loïc arrive (Dialogue `face: true`, `pelleau-loic-105`)

Loïc recule au quai A. Trois tours, une réplique juste par tour (au premier choix = jalon) :
1. Loïc : « Salut ! J'ai la ramasse : Ar Vag et Agri-Kerlann. » — **« Salut Loïc, tu me donnes ta feuille de ramasse ? »** · « Vas-y, décharge. » · « C'est
   pour quel magasin ? »
2. Loïc : « Tiens. Je reste dans la cabine ? » — **« Tu coupes le moteur, tu mets la cale, et tu attends au local pendant qu'on décharge. »** · « Oui,
   reste au volant, on fait vite. » · « Aide Yann à décharger. »
3. Loïc : « La palette du fond, c'est celle d'Agri-Kerlann. » — **« Merci. On regarde chaque étiquette avant de poser. »** · « OK, je te crois, on pose
   tout ensemble. » · « Pas besoin, on met tout au même endroit. »
(Les règles « moteur coupé, cale, local » sont celles d'Erwan, construites : rappelées dans le document « Règles du quai » joint au message de l'étape 1.)

### Étape 3 — Le quai A (vue quai iso)

- Déclaration (§6.2) : `rendu: 'iso'`, `froid: false`, `dechargement: { par: 'cariste', nom: 'Yann' }`, **inspection sur la scène** (1 défaut fixe :
  `lampe` éteinte ; 1 point en ordre : `cale` posée — Loïc l'a mise), **dépose par client** (6 cases : allée, AV1, AV2, AK1, AK2, devant le quai B),
  `arret: 'dechargement'` (texte : « Les 4 palettes sont triées par client. Le contrôle des colis, ce sera la semaine prochaine. »).
- 4 palettes : P1, P2 Agri-Kerlann ; P3, P4 Ar Vag (ordre du contenu ; elles sortent P4, P3, P2, P1). Étiquette lue à la pause : « Expéditeur : … ».
- Question A à `quai:pelleau-quai-105:depose` (première palette posée).

### Étape 4 — Rapprocher des annonces (fiche, `quand: quaiDecharge('pelleau-quai-105')`)

- **Message d'Erwan** : « Les palettes sont triées. Pour chaque client, compare ce qui est arrivé avec ce qu'il a annoncé. Erwan »
- **Fiche « Rapprocher »** : un tableau 2 lignes (Ar Vag, Agri-Kerlann) × 2 colonnes : **reçues** (nombre, liste 1 à 5) et **résultat** (`conforme` /
  `il en manque` / `il y en a trop`). En guidage : **Agri-Kerlann a annoncé 3 palettes**, la feuille de ramasse et le camion en ont **2** (Loïc l'a noté
  sur sa feuille : « 3e palette pas prête »). Ar Vag : conforme.

### Étape 5 — Rendre compte à Maëlys (phrases)

- **Message de Maëlys** : « Alors, la ramasse ? Maëlys » — 4 lignes : salutation · reçu (« 4 palettes : 2 Ar Vag, 2 Agri-Kerlann, triées en zone de
  réception. ») · écart (calculé : « Agri-Kerlann : 1 palette de moins que l'annonce, pas prête à la ramasse. ») · fin.

### Fin

- **Maëlys** : « Merci, je préviens Agri-Kerlann. Maëlys ». Premier bilan ; « Corriger » rouvre « Préparer », « Rapprocher », les phrases ; **ni le
  dialogue ni le quai** (`finFige` : « Le camion est déchargé : le quai ne se rejoue pas. »).

**Mots cliquables** : ramasse, feuille de ramasse, annonce, expéditeur, étiquette de palette, zone de réception, cale, niveleur, rapprocher, écart.

## 4 bis. Questions au fil — choix de Cowork : A, B, C, D

| id | Geste | Qui | Question (juste en gras) | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| `pourquoi-trier` (A) | `quai:pelleau-quai-105:depose` | Yann | « Pourquoi on ne mélange pas les palettes des deux clients ? » — **chaque client a son stock : on doit lui rendre ses palettes à lui** (`stock`) · c'est plus joli (`joli`) · pour aller plus vite au chariot (`vite`) | fil | **1** | tout de suite (la règle est déjà dite par la vue) | C1.3.3 ; ancrée sur sa première dépose |
| `rendre-meme` (B) | `fiche:rapprocher` 1re ligne | Erwan | « Un jour, Agri-Kerlann reprendra ses palettes. Que doit-on lui rendre ? » — **exactement ce qu'il nous a confié** (`meme`) · des palettes du même poids (`poids`) · ce qui reste dans l'entrepôt (`reste`) · rien, il a payé (`rien`) | fil | **1,5** | tout de suite | **éco-droit appliqué au cas** (C. civ. 1932, « Le droit ») : pourquoi on rapproche dès l'arrivée |
| `signature-ramasse` (C) | `dialogue:pelleau-loic-105:fin` | Erwan | « Pourquoi le client signe-t-il la feuille de ramasse quand Loïc charge ? » — **pour reconnaître ce qu'il a remis à Loïc** (`reconnaitre`) · pour payer Loïc (`payer`) · pour avoir un autographe (`autographe`) | fil | **1,5** | **au bilan** (aide à l'écart de l'étape 4) | C1.3.4 |
| `quand-ecart` (D) | envoi des phrases | Maëlys | « Quand il manque une palette, à qui ça sert de le dire tout de suite ? » — « Au client, qui l'attend » · « À Maëlys, qui organise la prochaine ramasse » · « À Erwan, qui répond du stock » · « Je ne sais pas » | fil | réflexion | tout de suite | — |

**Écartées** : « Où se met le conducteur pendant le déchargement ? » (donnerait la réplique 2) ; « Que veut dire AV1 ? » (donnerait la dépose).
**Retours** : A : « Chaque client a son stock à lui. Mélangé, on ne sait plus à qui est quoi. » · B : « La même chose, exactement : c'est la règle quand
on garde la marchandise d'un autre. D'où le comptage dès l'arrivée. » · C : « En signant, il reconnaît ce qu'il a donné : 2 palettes, pas 3. » ·
D : « Les trois. » **Document « Le droit »** : C. civ. 1927, 1932 (repris de `contenus/pelleau.js`).

## 4 ter. Avant de commencer

`tirage: { preparation: 3, image: 1 }`, non notées.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `annonce` | préparation | Une annonce de livraison, c'est… | un message du client qui dit ce qu'il va nous envoyer | une publicité · une facture | — | ★ |
| `feuille-ramasse` | préparation | La feuille de ramasse dit… | ce que le conducteur a chargé chez chaque client | le salaire du conducteur · la météo | — | ★ |
| `etiquette-palette` | préparation | L'étiquette d'une palette dit… | à qui elle est et ce qu'elle contient | la vitesse du camion · le prix en magasin | — | ★ |
| `zone-reception` | préparation | La zone de réception sert à… | poser les palettes qui viennent d'arriver, avant de les contrôler | stocker pour longtemps · garer les engins | plan d'ENT-10.2 | |
| `cale` | préparation | La cale sert à… | empêcher le camion de bouger pendant le déchargement | soulever la palette · ouvrir la porte | — | |
| `gerber` | préparation | « Gerber », c'est… | poser une palette sur une autre | filmer une palette · compter les colis | — | |
| `img-porteur-quai` | image | Ce camion est à quai : on peut… | décharger, une fois le moteur coupé et la cale posée | décharger moteur allumé · monter dans la remorque en marche | rendu iso du quai | ★ |
| `img-sol` | image | Ces marques au sol délimitent… | les emplacements de la zone de réception | une piste de course · le parking | rendu iso (cases R1…) | |

## 5. Jalons — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids | Ce qu'il lit |
|---|---|---|---|
| **Préparer la réception** | 2 lignes, 1 chacune | **2** | fiche `preparer` |
| **Accueillir Loïc** | 3 répliques au premier choix, 1 chacune | **3** | dialogue |
| **Avant de décharger** | défaut signalé avant de décharger 2 · aucun faux 1 | **3** | `securite-lampe`, `securite-aucun-faux` |
| **Trier par client** | 4 palettes, 1 chacune (premier clic dans la zone de son client) | **4** | `depose-P1`…`P4` (groupe renommé « Trier par client ») |
| **Rapprocher** | reçues 0,75 × 2 · résultat 0,75 × 2 | **3** | fiche `rapprocher` |
| **Rendre compte** | écart 0,5 · forme (salutation 0,25, fin 0,25) 0,5 | **1** | phrases |
| **Les questions** | A 1 · B 1,5 · C 1,5 | **4** | questions |
| **Total** | | **20** | |

Inaction : 0/20 (rien posé = dépose fausse ; `aucun-faux` exige un signal). Confirmé : 1 ligne bonus à « Préparer » (« Combien de palettes
Ar Vag ? »).

## 6. Contenu

`contenus/pelleau-ent105.js`, `contenus/questions/ENT-10.5.js`, `activites/pelleau-camion-de-ramasse.js`, `contenus/corriges/ENT-10.5.js`. Palettes types
dans `contenus/pelleau.js` (`PALETTE_AR_VAG` : cartons de biscuits, 5 couches × 8 ; `PALETTE_AGRI` : sacs de terreau, 4 couches × 10) — reprises par
ENT-10.6 à 10.12.

### 6.1 Feuille de ramasse (construite) — mardi 12 mai, Loïc, porteur Pelleau

| Expéditeur | Palettes | Colis | Signature client |
|---|---|---|---|
| Biscuiterie Ar Vag | 2 | 80 cartons | ✓ |
| Agri-Kerlann | 2 (annonce : 3 — « 3e palette pas prête ») | 80 sacs | ✓ |

### 6.2 Le quai (forme indicative)

```js
quai: { id: 'pelleau-quai-105', rendu: 'iso', froid: false, lieu: { nom: 'Quai A' },
  dechargement: { par: 'cariste', nom: 'Yann' }, document: { nom: 'Feuille de ramasse', court: 'FR' },
  securite: { mode: 'scene', points: [ { id: 'lampe', objet: 'lampe', etat: 'eteinte', ok: false, lib: 'Lampe de quai éteinte' },
    { id: 'cale', objet: 'cale', etat: 'posee', ok: true, lib: 'Cale posée' } ], signaler: { qui: 'Yann' } },
  depose: { passage: 3, cases: [ /* allée, AV1, AV2, AK1, AK2, devant le quai B */ ], clients: { /* ar-vag, agri-kerlann */ } },
  arret: { etape: 'dechargement', texte: '…' }, camions: [ { palettes: [ /* P1, P2 agri-kerlann ; P3, P4 ar-vag */ ] } ] }
```

## 6 bis. Tirage et niveaux

Guidage : **pièces fixes** (même camion, même écart pour tous) ; ordre des répliques mélangé ; Confirmé : 1 ligne bonus ; Accompagné : standard.

## 7. Demandes au moteur

- `MOTEUR-depose-par-client.md` (choisi par Tristan), avant.
- **À vérifier** : `document: { nom, court }` à ① avec `arret` (pas d'étape ④ : le document sert seulement à ①) ; renommer le groupe des jalons de dépose
  par le barème ; geste `dialogue:<id>:fin`.

### 7 bis. Non.

## 8. Tests (bloc `pelleau-recep`, nouveau : `outils/test/pelleau-recep.mjs`, `BLOCS` et `GROUPES`, alerte 7)

Parcours juste → 20/20 ; inaction → 0 ; une palette Ar Vag posée en AK1 au premier clic → seul son jalon ✗, réaction de Yann, la case reste juste pour
la palette Agri-Kerlann suivante ; lampe non signalée → arrêt (guidage) puis ✗ ; « Rapprocher » : Agri-Kerlann « conforme » → ✗ ; valeurs à la main
(4, 2 ; reçues 2 et 2) ; C au bilan ; somme 20. Sabotages : `client` de la case ignoré → le cas de la dépose tombe.

## 9. Supports

Trame : feuille de ramasse et annonces imprimables, tableau de rapprochement vierge (noir et blanc). Corrigé.

## 10. Critères de validation

L'étiquette se lit à la pause du chariot au vidéoprojecteur ; les zones des deux clients se distinguent au sol **sans couleur** (noms écrits) ; 50 min.

## 11. Questions ouvertes

- [ ] Textes de Cowork à relire. - [ ] Les « Règles du quai » d'Erwan (moteur coupé, cale, local) : construites, d'après les règles courantes
  d'un protocole de sécurité ; à dire dans le document.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

**19/10/2026, phase 3 du chantier Pelleau (Opus, sous-agent du chef ; non commité, le chef commite).** Fichiers : `activites/pelleau-camion-de-ramasse.js`,
`contenus/pelleau-ent105.js`, `contenus/pelleau-ent105-donnees.js` (données pures, chargées aussi sous Node par le corrigé), `contenus/questions/ENT-10.5.js`,
`contenus/corriges/ENT-10.5.js`, `outils/test/pelleau-105.mjs` (15 cas) ; lignes AJOUTÉES dans `activites/index.js`, `outils/test.mjs` (`BLOCS`, `GROUPES` groupe 1),
`outils/test/socle.mjs` (`ATTENDU_CAP`), `outils/test/pelleau/commun.mjs` (`aidesQuai` : inspection et dépose, pour 10.6 à 10.8) et `contenus/pelleau.js`
(`AU_SOL`, `clientsDepose`, voir écart 4). Pas de `declarerTirage` (pièces fixes) : rien dans `BANQUES_FIGEES`.

**Vérifié (tests lancés).** `pelleau-105` 16/16 ; `socle dependances tirage-niveaux questions pelleau-101` 206/206. Sabotages joués puis remis : jalon vrai par
inaction (fiche non envoyée = ✓) → 3 cas ; cases des deux clients mélangées (une palette Ar Vag acceptée en AK1) → 9 cas ; « ce mardi » dans le message de
Maëlys → 2 cas ; « Les 4 palettes » écrit en dur → 1 cas. Captures 1366 × 768 regardées (accueil, « Avant de commencer », quai à la pause « choix » avec la
légende de l'étiquette, bilan).

**Poids codés (brief §5, tels quels).** Préparer 1 + 1 · Accueillir Loïc 1 × 3 (première réponse) · lampe signalée avant de décharger 2, aucun faux 1 ·
Trier par client 1 × 4 (groupe « Trier par client ») · Rapprocher 0,75 × 4 · Rendre compte : écart 0,5, salutation 0,25, fin 0,25 · questions A 1, B 1,5,
C 1,5 (`part: 4`, ligne « Les questions »), D réflexion. Confirmé : « Combien de palettes Ar Vag ? » en bonus caché.

**Écarts avec le brief (décisions prises en route).**
1. Bloc de tests `pelleau-105` (un bloc par séance, COORDINATION §2 n° 21), pas `pelleau-recep`. Aucun jour de la semaine (« 12 mai », décision 9).
2. Tous les chiffres se calculent (décision 13) : 4 palettes, 2 clients, « 3e palette pas prête », résultats du rapprochement, phrase de l'écart, texte de
   l'arrêt, retour de C (« 2 palettes, pas 3 »). La feuille de ramasse ne donne pas de total (sinon « Combien de palettes ? » se lirait tout fait).
3. La dernière réponse de Maëlys reprend l'écart que l'élève a écrit (« je préviens Agri-Kerlann » / « Ar Vag » / « tout est conforme »), règle du 10/10/2026.
4. **Nom au sol** : « AGRI-KERLANN » ne se lisait pas (deux lignes en petit) ; `AU_SOL` de l'univers donne **« AGRI 1 / AGRI 2 »** (proposition à valider ;
   « KERLANN » possible, mais trop proche de « KERVÉGUEN » d'ENT-10.11). `CLIENTS` d'ENT-10.1 inchangé.
5. Ajoutés (construits) : messages d'Erwan « Loïc arrive » et « Yann est prêt » entre les étapes ; documents « Les règles du quai » (dit construit),
   « Ta matinée », « Une étiquette de palette » ; réactions de Loïc ; pièges des phrases et retours d'« Avant de commencer » (à relire).
6. « Avant de commencer » : pas d'image « rendu iso » au dépôt → photos d'Action déjà présentes (quai, palettes au sol).
7. La fiche « Rapprocher » est en deux cadres côte à côte (un par client : reçues, résultat), pas un tableau. D se déclenche à l'envoi du mail à Maëlys
   (aucune vue ne publie de geste « phrases envoyées »).
8. `precedente: 'pelleau-evaluation-prise-de-poste'` : ENT-10.4 n'existe pas encore, l'élève reste fermé tant qu'elle n'a pas son bilan (l'enseignant peut
   débloquer).

**Défauts du moteur vus (questions pour le chef, rien touché dans `core/`).** (a) Après « C'est bon », la légende de ① dit « Le chauffeur te remet **le**
feuille de ramasse. » (`core/types/quai.js:1930`, article masculin écrit en dur pour `document: { nom, court }`) et appelle Loïc « le chauffeur ». (b) Le
bouton « Oui, **vous** pouvez décharger » vouvoie un collègue. (c) Déployées (8 s), les cartes des messages couvrent le haut du panneau d'une question au fil
(le premier choix peut être caché ; le test les ferme comme le ferait l'élève).

**À vérifier à l'écran par Tristan.** La lisibilité de « AGRI 1 » et « AR VAG 1 » au sol ; la légende « Yann attend avec la palette P4 — étiquette :
« Expéditeur : Biscuiterie Ar Vag » (1 sur 4) » au vidéoprojecteur ; le défaut (a) à ① ; les textes construits (règles du quai, réactions de Loïc, phrases) ;
la scène (lampe éteinte, cale posée). Clavier non pris en charge pour l'inspection (comme ENT-8.7).
