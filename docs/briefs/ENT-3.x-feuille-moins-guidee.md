# Brief de chantier — Feuille de calcul de moins en moins guidée (Boost ENT-3.2, 3.3, puis 3.4)

> **📋 Phrase à copier-coller dans ccode — LOT 1 (moteur, Opus) :**
>
> ```
> Lis docs/briefs/COORDINATION-boost.md puis implémente le LOT 1 du brief ENT-3.x-feuille-moins-guidee. Annonce la durée avant de commencer. Fabrique-moi la page d'essai cliquable de la §5 avant de toucher aux séances.
> ```
>
> **📋 Phrase à copier-coller dans ccode — LOT 2 (séances 3.2 et 3.3, après validation du lot 1) :**
>
> ```
> Lis docs/briefs/COORDINATION-boost.md puis implémente le LOT 2 du brief ENT-3.x-feuille-moins-guidee. Annonce la durée, propose-moi 2 ou 3 jeux de valeurs chiffrés avec le script de calage (journée ET imprévu) et 2 ou 3 formules fausses pour Inès, et attends mon choix avant de coder.
> ```

**Statut** : **à implémenter** — décisions prises par Tristan le 03/10/2026 (questions fermées, §1).
**Date du brief** : 03/10/2026, **recadré le 03/10/2026 après-midi** (Cowork).
**Maquette** : « Maquette tableur ENT-3.x » (Cowork, 03/10/2026). **Attention** : la maquette met les arrêts dans un seul
tableau ; la décision finale est **deux tableaux** (§2). La page d'essai du lot 1 fait foi.
**Ordre dans le plan Boost** : chantier D, **avant ENT-3.4** (la feuille de 3.4 se fera dans le brief 3.4 avec les outils du lot 1).
**Ne pas toucher à ENT-3.1.**

## 1. Décisions de Tristan (03/10/2026)

| # | Question | Décision |
|---|---|---|
| 1 | Ordre et découpage | **D avant ENT-3.4, en deux lots** : lot 1 = moteur ; lot 2 = ENT-3.2 et 3.3 recalées. La feuille de 3.4 sera écrite dans le brief 3.4. |
| 2 | Données de 3.2 / 3.3 | **On change**, valeurs **recalées par le script** (§4). 3.2 et 3.3 gardent la même journée entre elles (même jour de travail). |
| 3 | Rangement des arrêts | **Dans l'ordre de la tournée**, et **deux tableaux séparés** : « Commandes du jour » (ordre du mail) et « Tournée » (ordre des arrêts). |
| 4 | Tableau « Tournée » | **Rempli tout seul** : les arrêts cliqués y apparaissent avec le poids **que l'élève a tapé** dans « Commandes du jour ». |
| 5 | Données à chercher dans le mail (3.2) | **Toutes** : poids, vitesse, temps par arrêt, heure de départ, charge utile, heure du train, limite du créneau. Chaque valeur tapée est comparée au mail. |
| 6 | Aides en 3.2 | **Un « ? » par ligne, non compté** : il affiche la phrase d'aide (celle de 3.1). Rien n'est enregistré. |
| 7 | Couleurs (jaune = étape, violet = résultat) | **Gardées en 3.2**, **retirées en 3.4**. En 3.2 on retire déjà les numéros d'étape, les exemples et les phrases d'aide visibles. |
| 8 | Feuille d'Inès (3.3) | **Dans ce chantier (lot 2)** : la feuille arrive remplie, avec **une formule fausse** à repérer. |

**Point proposé par Cowork, gardé faute d'objection mais à confirmer à l'écran** : *une erreur de lecture ne se paie qu'une
fois*. Un poids (ou une donnée) mal recopié est faux sur sa ligne ; les cases calculées ensuite (total, à écarter, heures)
sont jugées **sur ce que l'élève a tapé**, pas sur la valeur du mail. Sinon une seule faute de lecture fait tomber toute la feuille.
(Même esprit que l'alerte 14 : on juge la formule, pas deux fois la même erreur.)

## 2. La feuille de 3.2 (cible du lot 2, ce que le lot 1 doit rendre possible)

Trois blocs, dans cet ordre. **Adresses de cellules stables** : quel que soit l'ordre ou le nombre d'arrêts, les cellules ne bougent pas.

**Bloc A — Données de la journée** (à chercher dans le mail, saisie simple, **pas de formule**, comparées au mail) :
heure de départ · vitesse (km/h) · temps par arrêt (min) · charge utile (kg) · départ du train · limite du créneau.
*(Bloc construit par Cowork pour loger la décision 5 ; la colonne « contraintes » de droite peut lire ces cellules. Libellés
seulement, pas d'exemple ; l'heure se tape sous la forme 14:30.)*

**Bloc B — Commandes du jour** (ordre du mail, 8 lignes fixes) :
nom du client (donné) · poids (**tapé** par l'élève, comparé au mail) · **Poids total** (formule) · **Poids à laisser à quai, au moins** (formule).

**Bloc C — Tournée** (ordre des arrêts cliqués, **rempli tout seul**) :
- **8 lignes réservées** (lignes vides si moins d'arrêts, y compris après l'imprévu) : les cellules en dessous ne bougent jamais ;
- chaque ligne : n° d'arrêt, client, poids = **la valeur tapée en bloc B** pour ce client (vide s'il ne l'a pas encore tapée) ;
- puis : **Poids chargé** (formule) · Distance du parcours (donnée par la carte) · **Temps de route (min)** en **une seule case**
  (`=distance/vitesse*60`) · **Temps aux arrêts** (formule) · **Heure d'arrivée à la gare** (formule) ;
- partie créneau (comme aujourd'hui) : distance jusqu'au client, arrêts servis avant lui, **heure d'arrivée chez lui** (formule).

Ce qui disparaît par rapport à aujourd'hui : « Étape 1/2/3 », les phrases d'aide visibles (elles passent derrière le « ? »),
la conversion heures → minutes en deux cases, l'exemple « 14:10 » en placeholder.

## 3. LOT 1 — Moteur (Opus ; `core/types/grille.js`, `core/types/tournee.js`, `styles/base.css`)

Chaque point est **déclaratif** : une séance qui ne le déclare pas garde exactement le comportement d'aujourd'hui (ENT-3.1, 3.2 et 3.3
actuelles doivent rester vertes **sans modification** à la fin du lot 1).

1. **Attendus calculés sur les saisies de l'élève** : `grille.lignes(b, cases)` (ou équivalent) reçoit les valeurs tapées, pour que
   le contenu puisse dire « attendu = somme des poids **tapés** ». À trancher par Claude Code : la manière la plus simple, à expliquer.
2. **Cellule recopiée** (bloc C) : une case dont la valeur affichée est celle d'une autre case saisie (le poids tapé du client),
   non modifiable, vide tant que la source est vide. Utilisable dans une formule (`=SOMME(B20:B27)`).
3. **Lignes réservées** : la tournée occupe toujours N lignes (N = nombre de commandes), vides au-delà du nombre d'arrêts.
4. **Aide derrière un « ? »** : option de grille (ex. `aides: 'bouton'`) ; la `note` d'une ligne n'est plus affichée mais révélée au
   clic sur un « ? ». **Rien n'est enregistré** dans la base. Accessible au clavier.
5. **Formules pré-remplies** (pour 3.3) : une case peut arriver avec une formule déjà écrite (`prerempli: '=B12/B13*60'`), modifiable
   par l'élève, jugée comme une saisie. « Recommencer la tournée » ne l'efface pas ; un retour à l'état d'origine se fait par la
   remise à zéro existante de la séance (à vérifier, et à dire).
6. **Couleurs coupables** (pour 3.4) : option de grille (ex. `couleurs: false`) qui ne distingue plus étape / résultat ; seules les
   cases à remplir restent repérées (bordure, jamais d'aplat — charte).
7. **Temps de service selon les colis** (pour 3.4) : `horaire.service` accepte `{ base: 4, parColis: 1 }` en plus d'un nombre ;
   appliqué partout où le service compte : arrivées, créneau, jauge, `exigeConforme`, et **`outils/carte/calibrer.mjs`** (même formule).
8. **Brouillon libre** (pour 3.4) : option de grille, zone de saisie à droite, **jamais jugée**, enregistrée avec la copie, qui ne gêne
   pas la lecture des cellules de résultat. Les formules du brouillon peuvent lire la feuille ; la feuille ne lit jamais le brouillon.
9. **Données de la journée propres à chaque séance** : vérifier que les séances ne lisent pas toutes `VELO` de `contenus/boost.js`
   (ENT-3.2 fait aujourd'hui `limite: VELO.train`, `chargeUtile: VELO.chargeUtile`, `vitesse: VELO.vitesse`, `service: VELO.service`).
   Au lot 2, 3.2 déclare **ses** valeurs ; `VELO` reste celui d'ENT-3.1.

**À vérifier dans le code et à dire (pas à demander à Tristan)** : en copie rendue (3.4), la distance de la tournée reste-t-elle
lisible alors que les jauges sont muettes ? Elle doit l'être (c'est une donnée, pas un verdict).

## 4. LOT 2 — Contenu ENT-3.2 et ENT-3.3 (Sonnet suffit ; `contenus/boost-ent32*.js`, `boost-ent33.js`, `activites/`, calage)

### 4.1 La journée de 3.2 (= 3.3) — valeurs de départ proposées, **à recaler par le script**

| | Aujourd'hui (3.2) | Proposé | Pourquoi |
|---|---|---|---|
| Départ | 14 h 10 | **14 h 30** | change par rapport à 3.1 (14 h 00) |
| Vitesse | 12 km/h | **14 km/h** (vélo à assistance électrique) | change |
| Temps par arrêt | 6 min | **5 min** | change |
| Charge utile | 180 kg | **190 kg** | 230 − 190 = 40 kg : **seule la Cave Teissier (52 kg) suffit** encore, à elle seule, à passer sous la charge (Mazel 38 kg ne suffit pas) |
| Train | 16 h 10 | **fixé par le calage** | avec 14 km/h et 5 min, garder ~15 min de marge sur la meilleure tournée donne un train vers **16 h 15** (à confirmer) |
| Créneau Pâtisserie Arnaud | avant 14 h 45 | **fixé par le calage** | |

**Pourquoi pas les valeurs du premier brief** (train 16 h 45, 200 kg) : calcul de Cowork, à vérifier par le script — à 14 km/h et
5 min par arrêt, la meilleure tournée (~12,5 km, 7 arrêts) prend ~89 min : départ 14 h 30 → gare ~16 h 00, soit **45 min d'avance**
sur un train à 16 h 45 (presque tous les ordres passent) ; et sous 200 kg, **quatre** clients suffisent à eux seuls (52, 38, 34, 31 kg).

**Profil à garantir (comme aujourd'hui, mesuré par `calibrer.mjs`)** : un seul client écartable ; le **plus court rate une contrainte** ;
une minorité d'ordres tient tout (5 à 10 %) ; l'optimum diffère du plus court.
**L'imprévu se recale aussi** (brief `ENT-3.2-imprevu.md` §4) : l'ancienne tournée ne tient plus, une nouvelle existe, la meilleure
nouvelle diffère de l'ancienne, ne rien faire ne rapporte rien. Le nouveau créneau de l'imprévu est fixé par le script.
**Clients et adresses ne changent pas** (même carte `boost-ent32-carte.js`, pas de géocodage à refaire). Poids et colis : inchangés sauf
si le calage l'exige — le dire.

Claude Code **propose 2 ou 3 jeux chiffrés** (journée + imprévu) **et attend le choix de Tristan** avant d'écrire le contenu.

### 4.2 Le mail de 3.2

Toutes les données du bloc A sont **dans le texte du mail**, en phrases courantes (aujourd'hui la vitesse y est « une douzaine de
kilomètres à l'heure » : la valeur doit être exacte et unique). Les poids restent dans la fiche des commandes du mail.
Le message de l'imprévu reste en texte courant.

### 4.3 La feuille de 3.2

Celle de la §2. Jalons : **le jalon « choix » et le jalon « formules » se recâblent** sur les nouvelles cellules (adresses déduites des
lignes, jamais écrites en dur, comme `adresseDe` aujourd'hui). Proposer s'il faut **un jalon de plus « données recopiées justes »**
(bloc A + poids) ou s'il entre dans « formules » — à demander à Tristan avec le compte des jalons (aujourd'hui 10).

### 4.4 ENT-3.3 — la feuille d'Inès

Même journée que 3.2 (nouvelles valeurs), **sans l'imprévu**. La feuille arrive **remplie par Inès** (blocs A et B tapés, formules
écrites), avec **une formule fausse**. Piste de Cowork, cohérente avec la consigne en trois étapes (Contrôler, Répondre, Réparer) :
la formule fausse **soutient une affirmation fausse d'Inès dans son message** (ex. elle oublie les arrêts dans l'heure d'arrivée et
écrit « le train est tenu »). L'élève la trouve en contrôlant, le dit dans sa réponse, la répare.
Claude Code **propose 2 ou 3 formules fausses** chiffrées (ce qu'elle fait dire, si la tournée d'Inès reste fausse pour une autre
raison) et un **jalon** pour l'erreur repérée/réparée, puis attend le choix de Tristan.

### 4.5 Supports, tests, mise en ligne

- **ENT-3.2 et ENT-3.3 sont ouvertes aux élèves** (`pret: true`). Les passer en `pret: false` les cacherait : **ne pas le faire**.
  Travailler sur une branche locale ou sans pousser, et **dire à Tristan avant le push** ce qui change pour un élève qui a déjà
  commencé (horaires, feuille vidée ou non). Alerte 6 si une séance est prévue le jour même ou le lendemain.
- Tests d'ENT-3.2 et 3.3 réécrits (valeurs écrites à la main) : **alerte 7, le dire**. Sabotages à éprouver : total jugé contre le mail
  au lieu des poids tapés ; tableau Tournée qui ne suit pas l'ordre ; cellule sous le tableau qui bouge quand un arrêt est retiré ;
  « ? » qui enregistre quelque chose ; formule d'Inès corrigée d'origine ; jalon qui récompense une feuille vide.
- Corrigés enseignant de 3.2 / 3.3 s'ils existent : régénérés. Pas de trame pour 3.2 / 3.3 (Tristan : « aucune pour l'instant »).
- `calibrer.mjs` : paramétrable par séance (il servira à 3.4).

## 5. Page d'essai du lot 1 (avant toute séance)

Règle de Tristan : un changement d'interaction se juge **en cliquant**. Fournir `outils/essai-feuille.html` (ou un mode de
`essai-carte.html`), décor Boost, journée de 3.2 **provisoire**, qui montre : bloc A à taper, poids à taper, tableau Tournée qui se
remplit et se réordonne quand on change la tournée, un « ? » qui s'ouvre, une formule pré-remplie fausse, le brouillon et la feuille
sans couleurs (bascule pour comparer). Lancer : `lancer.bat` puis l'adresse à donner. **Tristan valide avant le lot 2.**

## 6. Moteur touché et travail en parallèle

| Partie | Fichiers | Lot |
|---|---|---|
| Attendus sur saisies, cellule recopiée, lignes réservées, « ? », pré-rempli, couleurs, brouillon | `core/types/grille.js`, `styles/base.css` | 1 |
| Service selon les colis, données de journée par séance | `core/types/tournee.js`, `outils/carte/calibrer.mjs` | 1 |
| Journée, mail, feuille, jalons de 3.2 ; feuille d'Inès et jalon de 3.3 ; imprévu recalé | `contenus/boost-ent32*.js`, `contenus/boost-ent33.js`, `activites/boost-ent32.js`, `activites/boost-ent33.js` | 2 |
| Tests | `outils/test/boost.mjs` (+ bloc grille si pertinent) | 1 et 2 |

**Un seul chantier moteur à la fois** (`tournee.js`, `grille.js`, `base.css`, `outils/test/boost.mjs`). S'inscrire dans `docs/EN-COURS.md`.

## 7. Ce qui est construit (à redire dans le contenu)

Rien n'est tiré d'une source sur Boost pour ces chiffres : départ, vitesse, temps par arrêt, charge utile, train, créneaux, poids,
Inès et sa feuille sont **construits**. Les adresses des clients restent réelles (BAN), les clients inventés.

## 8. Questions encore ouvertes (à poser par Claude Code au moment voulu)

- [ ] Lot 2 : quel jeu de valeurs (journée + imprévu) parmi ceux proposés par le script.
- [ ] Lot 2 : quelle formule fausse pour Inès ; quel jalon.
- [ ] Lot 2 : « données recopiées justes » = jalon à part, ou dans « formules » ? (nombre de jalons de 3.2)
- [ ] À l'écran (page d'essai) : la règle « une erreur de lecture ne se paie qu'une fois » convient-elle ?
- [ ] 3.4 (brief 3.4, pas ici) : matinée, charge, colis, mail moins explicite — valeurs à caler avec le script, **même méthode qu'en §4.1**
      (les valeurs 9 h 30 / 11 h 50 / 15 km/h / 160 kg du premier brief sont probablement trop larges, comme celles de 3.2).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

### Lot 1 — livré le 03/10/2026 (Claude Code), en attente de validation à l'écran
- **Fichiers créés / modifiés** : `core/types/grille.js`, `core/types/tournee.js`, `styles/base.css`,
  `outils/carte/calibrer.mjs`, `outils/essai-feuille.html` (page d'essai, nouvelle), `outils/test/boost.mjs` (cas ajoutés).
- **Comment chaque point est fait** (tout est déclaratif, rien ne change pour une feuille qui ne le déclare pas) :
  1. *Attendus sur les saisies* : une cellule à remplir peut déclarer `attendu: (lire) => nombre`, où `lire('B5')` rend
     la valeur de B5 **sur la feuille de l'élève** (ce qu'il a tapé ou ce que sa formule donne). Plus simple que de passer
     les saisies à `lignes()` : formules, cellules recopiées et pré-remplies sont déjà évaluées. Si la fonction rend `null`
     (donnée manquante), la case n'est pas juste : verdict `attente`, pastille « données à remplir d'abord » (sans ça, une
     feuille vide donnait un total « juste » de 0).
  2. *Cellule recopiée* : `{ copie: 'B12' }`, lecture seule, vide tant que la source l'est, lisible par `=SOMME(…)`.
  3. *Lignes réservées* : rien dans le moteur ; le contenu engendre toujours N lignes (vides au-delà des arrêts).
  4. *« ? »* : `aides: 'bouton'` ; vrai bouton (clavier, `aria-expanded`), ouvert/fermé en mémoire de page seulement,
     rien dans la base ; la liste d'aides sous la feuille disparaît ; cliquer « ? » en écrivant une formule n'insère rien.
  5. *Pré-rempli* : `prerempli: '=B2+B32'` ; rien n'est écrit dans la base tant que l'élève n'y touche pas ; jugé comme une
     saisie ; « Recommencer la tournée » ne l'efface pas. **Retour à l'état d'origine** : ENT-3.3 est `reinitialisable: false`,
     l'élève n'a donc pas de bouton pour retrouver la formule d'Inès s'il l'a modifiée (il peut la retaper). Seule une remise
     à zéro de sa base (côté enseignant) la ramène. À trancher au lot 2 si c'est gênant.
  6. *Sans couleurs* : `couleurs: false` ; ni jaune ni violet (feuille, légende, cartes de contraintes, « à comparer ») ;
     cellules à remplir repérées par une bordure verte, sans aplat.
  7. *Service par colis* : `horaire.service: { base, parColis, champ }` ; un seul calcul (`serviceDe`) pour arrivées, créneau,
     train, jauges, `exigeConforme` ; le bilan expose `service` (minutes aux arrêts). `calibrer.mjs` applique la même formule
     (sortie identique à avant avec un service à nombre fixe, vérifié).
  8. *Brouillon* : `brouillon: { colonnes, lignes }` ; à droite de la feuille (sous elle sous 1100 px), reste en vue en
     descendant ; enregistré dans `etat.brouillon` (donc avec la copie), jamais jugé ; ses formules lisent la feuille ; une
     formule de la feuille qui cite le brouillon le lit comme une case vide, et on ne peut pas désigner le brouillon à la souris
     depuis la feuille. Deux décimales au moins (0,98 h ne s'arrondit pas à 1).
  9. *Données par séance* : confirmé, ENT-3.2 lit `VELO` (`limite`, `chargeUtile`, `vitesse`, `service`) ; le moteur prend
     déjà tout de `horaire` : c'est au contenu du lot 2 de déclarer ses valeurs.
  - *Distance en copie rendue* : la carte n'affiche pas de km ; avec `contraintesDansGrille`, la distance n'est lisible que
    **si la feuille la donne** (ligne « Distance du parcours », comme aujourd'hui). La feuille de 3.4 devra la garder.
- **Écarts par rapport au brief** : précision de Tristan pendant l'essai (03/10) : sur une **heure à taper**, le « ? » ne
  donne que le format, avec un exemple neutre (9:05) — les anciennes aides donnaient l'heure du jour (« sous la forme 16:10 »
  = l'heure du train) ; sur une **formule avec des calculs**, l'aide de méthode d'ENT-3.1 reste (plus le format pour une heure calculée).
- **Tests** : 9 cas ajoutés au bloc `boost` (aucun cas existant réécrit, `test.mjs` et `commun.mjs` non touchés), sur la page
  d'essai. Chacun éprouvé dans les deux sens : 10 sabotages du moteur et 1 du contenu, chacun fait tomber le cas attendu.
  Non testé : `calibrer.mjs` avec un service par colis (seule la sortie à nombre fixe est vérifiée identique). Suite 377/377.
- **Commits** : voir l'historique du 03/10 (« Feuille de calcul moins guidée : moteur… »).
- **Reste ouvert** : validation de Tristan sur la page d'essai (dont la règle « une erreur de lecture ne se paie qu'une fois »),
  avant le lot 2. Journée de l'essai provisoire (14 h 30, 14 km/h, 5 min, 190 kg, train 16 h 10, Pâtisserie avant 15 h 00) :
  ~5 % des ordres tiennent tout ; le lot 2 recale avec le script.

### Lot 2
- **Fichiers créés / modifiés** :
- **Valeurs retenues (journée, imprévu, formule d'Inès)** :
- **Écarts par rapport au brief** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
