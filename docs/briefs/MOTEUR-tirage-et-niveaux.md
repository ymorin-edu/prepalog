# Brief de chantier — MOTEUR : tirage mémorisé, niveaux par scénario, bonus du confirmé

> **📋 Phrase à copier-coller dans Claude Code :**
>
> ```
> Lis docs/EN-COURS.md puis docs/briefs/MOTEUR-tirage-et-niveaux.md en entier (les décisions du §1 d'abord). Fais le lot 1, puis le lot 2, puis le lot 3, un commit par lot. Annonce la durée avant de commencer, et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à implémenter
**Date du brief** : 08/10/2026
**Auteur** : Claude (conversation Cowork, Opus), d'après la fiche projet `prepalog-randomisation-et-niveaux.md` (08/10) et
la lecture du code de `main` : `core/tirage.js`, `core/amenagements.js`, `core/notes.js`, `core/prof.js` (onglet
« Comptes élèves »), `firestore.rules`, `activites/FICHE-SEANCE.md`, les contenus Cdiscount qui lisent `db.aisance`.
**Rien n'a été essayé dans le site.**
**Place dans l'ordre (décision de Tristan, 08/10)** : **après** « questions au fil » et « jugé au premier essai »,
**juste avant la construction d'ENT-6.1**. France Boissons est la première série à s'en servir.
**Modèle** : **Opus** (touche `core/app.js`, la note, les règles Firestore).
**Durée estimée par Cowork** : **1 à 1,5 jour**, dont la moitié en tests (des centaines de tirages à éprouver, l'écran
élèves × scénarios, la migration de l'ancien niveau, l'émulateur de règles).
**⚠ Alerte 1** : les règles Firestore changent (un élève ne doit pas pouvoir écrire ses niveaux). **Tristan devra les
publier dans la console.**

---

## 1. Ce que Tristan a décidé (08/10/2026)

Source : `prepalog-randomisation-et-niveaux.md` (projet), complété par les réponses de ce matin.

**Tirage**

1. **Fixe + tiré.** Une pièce fixe porte le fil conducteur, tout le monde la traite (même résultat attendu). Les autres
   pièces sont tirées dans une **banque**. Exemple : banque de 30 CV, chaque élève en reçoit 4 tirés + celui de Yanis.
2. **Tirage mémorisé, jamais recalculé.** Les pièces reçues sont **rangées** au premier passage. Rechargement,
   changement de poste, banque enrichie plus tard : l'élève garde son tirage. Règle absolue : aucun élève bloqué,
   aucune progression à remettre à zéro.
3. **Tirage équilibré.** Chaque pièce porte une difficulté (facile / moyen / difficile) ; la séance déclare un mélange
   fixe (ex. 1 facile, 2 moyens, 1 difficile) pour que la note reste juste d'un élève à l'autre.
4. **Valeurs numériques variables** (quantités, prix, stocks) : même logique, tirées puis rangées.
5. La **correction cas par cas** (règle du 07/10) juge chaque élève sur **ses** pièces.

**Niveaux**

6. **Trois emplacements** : `standard` (défaut), `confirme`, `accompagne` (nom choisi par Tristan le 08/10 : « Accompagné »).
   Le contenu « accompagné » reste **à concevoir** : en attendant, un élève accompagné reçoit **le contenu standard**.
7. **Un niveau par élève et par scénario** (scénario = une entreprise : ENT-6.x = France Boissons). Un élève peut être
   confirmé chez Smoby et standard chez France Boissons.
8. **L'ancienne colonne « Niveau » de Comptes élèves est remplacée** (Tristan, 08/10) par un tableau élèves ×
   scénarios. Ce qui était réglé (utilisé seulement par Cdiscount ENT-2.x) **devient la colonne Cdiscount** : rien de perdu.
9. **Seul l'enseignant change un niveau.** Le site **propose**, l'enseignant valide d'un clic.
   Règle de proposition retenue (08/10) : **au moins 2 séances du scénario avec un premier bilan ≥ 16/20 ET un temps
   passé sous la médiane du groupe** sur ces séances → « proposer confirmé ». Seuils dans un seul réglage du code.
10. **Un changement prend effet à la séance suivante**, jamais dans une séance commencée (déjà vrai : `db.aisance` figé à
    la première ouverture). Les séances terminées gardent leur note.
11. Réglage possible **pour tout un demi-groupe** (1L1, 1L2) d'un coup.
12. Niveaux en **guidage et entraînement** seulement ; **l'évaluation est la même pour tous** (elle reste tirée par
    élève) ; **l'élève ne voit jamais son niveau**.

**Note du confirmé**

13. **Notée sur le socle**, exactement comme un standard (mêmes jalons, mêmes poids, total 20).
14. **Cas supplémentaires = bonus qui ne peut que monter** : un cas bonus raté ne retire rien.
    Départ : **+0,5 point par cas bonus juste, plafond +2 par séance, note plafonnée à 20**, dans **un seul réglage**.
15. **Bonus caché à l'élève** (Tristan, 08/10, pour ne pas lui révéler son niveau) : le bandeau de fin ne montre que les
    groupes du socle ; les cas bonus n'y apparaissent jamais, ni ✓ ni ✗. Le bonus se voit **dans la vue enseignant**
    seulement (détail de la note). Si l'élève voit une note chiffrée quelque part, c'est la note avec bonus, sans son détail.
    **Conséquence** : l'élève ne sait pas qu'un cas bonus est faux, il ne le corrige donc pas exprès. Le bonus suit
    quand même la règle du premier bilan (§5.3) pour ne jamais baisser.

---

## 2. Ce qui existe déjà (lu dans le code)

| Brique | Où | Ce qu'il manque |
|---|---|---|
| Générateur reproductible `hasard(graine)` (`entier`, `choisir`, `prendre`, `melanger`, `dixieme`), `tirerJeu(decl, graine)` avec `verifier` et `secours` | `core/tirage.js` | Le jeu est **recalculé** depuis la graine à chaque ouverture : enrichir la réserve change le jeu des élèves (le fichier le dit en tête). Contraire au point 2. |
| Graine = `ctx.profil.uid`, rangée dans `db.tirage.graine` | `poserGraine` | Une seule graine par base, pas par séance : deux séances d'une même base partagée tireraient pareil. |
| Niveau `aisance` (`'standard'` / `'confirme'`) sur le profil, réglé dans « Comptes élèves », relu à l'ouverture (`ctx.aisance`), recopié et **figé** dans la base de la séance (`db.aisance`, `db.aisancePour`) | `core/amenagements.js`, `core/app.js`, `core/prof.js` l. ≈ 509-564 | Un seul niveau pour tout le site ; deux valeurs ; pas de proposition ; pas de réglage par demi-groupe. |
| Règle Firestore : l'élève ne change pas `aisance` ni `tiersTemps` | `firestore.rules` l. ≈ 63-69 | Ajouter le nouveau champ. |
| Note des séances `correction` : premier bilan, moyenne à la 1re correction, figée ; poids par jalon, somme 20 | moteur des entreprises, `FICHE-SEANCE.md` l. 249-291 | Aucune notion de bonus. |
| Corrigé par élève dans l'onglet Corrigés (évaluations tirées) | ENT-4.4, ENT-2.5 | À étendre aux séances de guidage / entraînement tirées. |
| Temps passé remonté toutes les 2 min | `MOTEUR-temps-passe` | Sert à la proposition (médiane). |

Les contenus Cdiscount testent `db.aisance === 'confirme'` : un élève **accompagné** y reçoit donc déjà le contenu
standard, sans rien changer. **Garder le nom `db.aisance`** dans la base de séance (valeurs `'standard'`, `'confirme'`,
`'accompagne'`) : aucun contenu à réécrire.

---

## 3. Lot 1 — Niveau par scénario (≈ 4 h)

### 3.1 Stockage

- Profil de l'élève : **`niveaux: { '<n° entreprise>': 'confirme' | 'accompagne' }`**. Clé = premier nombre du `code`
  (`ENT-6.4` → `'6'`), comme la table `ENTREPRISES`. Absent = `standard` (on ne range pas `standard`).
- **Migration sans écriture** : à la lecture, un profil qui a encore `aisance: 'confirme'` et pas de `niveaux['2']` est lu
  comme `niveaux['2'] = 'confirme'` (Cdiscount). Le premier réglage enregistré dans le tableau écrit `niveaux` et
  retire `aisance`. Aucune écriture de masse au chargement.
- `core/amenagements.js` : `NIVEAUX = [standard, confirme, accompagne]` (libellés « Standard », « Confirmé »,
  « Accompagné ») ; `niveauScenario(profil, n)` toujours valide ; `filtrerAmenagements` accepte `niveaux` (seulement des
  clés numériques et ces trois valeurs).
- `ctx.aisance` = le niveau **du scénario de la séance ouverte** (séance hors entreprise : `standard`). Le recopier et le
  figer dans `db.aisance` comme aujourd'hui (rien ne change pour une séance commencée).
- Enseignant : toujours `standard`.

### 3.2 Règles Firestore

- L'élève ne peut ni ajouter, ni changer, ni retirer `niveaux` sur son profil (même tournure que pour `aisance` :
  `diff().affectedKeys().hasAny([...])`, sans supposer que le champ existe). Garder `aisance` dans la liste interdite.
- Tests à l'émulateur (`outils\tester-regles.bat`). **Puis le dire à Tristan : publier dans la console.**

### 3.3 Écran « Niveaux » (enseignant)

- Dans **Comptes élèves**, la colonne « Niveau » disparaît (Tiers-temps et demi-groupe restent). Un **nouvel onglet ou
  sous-onglet « Niveaux »** (Claude Code choisit la place ; Tristan juge à l'écran) : lignes = élèves du groupe actif,
  colonnes = entreprises qui ont au moins une séance déclarant des niveaux (§4.4) **plus Cdiscount**, logo en en-tête.
- Une liste déroulante par case, enregistrée au changement sans redessiner (mécanique de `regler()` : un refus remet la valeur).
- En tête de chaque colonne : **« Tout le demi-groupe → … »** (choix du demi-groupe, puis du niveau, avec confirmation
  dans la page : « 12 élèves de 1L1 passent en Confirmé chez France Boissons à leur prochaine séance »).
- Une phrase sous le tableau : « Un changement vaut à partir de la prochaine séance ouverte par l'élève. »
- **Pas dans le Suivi de classe** (projetable) ; **pas dans l'export** de la liste d'élèves (même règle que le tiers-temps).
  L'export des notes, lui, peut porter la colonne « niveau » de la séance (déjà dans `detail`) : ne pas l'ajouter s'il
  n'y est pas.

### 3.4 Propositions

- Dans chaque case, quand la règle du §1 point 9 est remplie et que l'élève est standard : une **marque discrète**
  « proposé : Confirmé » (texte, pas d'aplat) ; au survol ou au clic, **ce qui la fonde** : les séances comptées, leur
  premier bilan, le temps de l'élève et la médiane du groupe. Un bouton « Appliquer » = le même enregistrement qu'à la main.
- Pas assez de données (moins de 2 séances notées du scénario) : rien n'est affiché.
- Réglage unique, en tête d'un fichier du moteur (Claude Code choisit lequel) :
  `PROPOSITION = { seances: 2, noteMin: 16, temps: 'mediane' }`.
- Rien ne change sans clic. Pas de proposition « Accompagné » pour l'instant (son contenu n'existe pas) : **porte ouverte**,
  pas de code.

---

## 4. Lot 2 — Tirage mémorisé et banques (≈ 4-5 h)

### 4.1 Ce que déclare une séance

Dans le contenu de la séance (`contenus/<entreprise>-entXY.js`), à côté des jalons :

```js
tirage: {
  banques: {
    cv: {
      pieces: [                                   // la banque : JAMAIS de pièce supprimée ni renumérotée
        { id: 'cv-07', difficulte: 'facile', … },  // id stable, unique dans la banque
        { id: 'cv-12', difficulte: 'difficile', retiree: true, … }, // retirée : plus tirée, gardée pour qui l'a reçue
      ],
      fixes: ['cv-yanis'],                         // la pièce du fil conducteur, donnée à tous, en tête
      melange: { facile: 1, moyen: 2, difficile: 1 },          // socle
      bonus: { confirme: { moyen: 1, difficile: 1 } },        // cas en plus du confirmé (absent = pas de bonus)
      ordre: 'melange',                           // 'melange' (ordre tiré, la pièce fixe à une place tirée) ou 'fixe'
    },
  },
  valeurs: (h) => ({ quantite: h.entier(6, 12), prix: h.dixieme(1.5, 3) }), // facultatif
  verifier: (jeu) => [],                          // écarts d'équité en clair (liste vide = conforme), comme tirerJeu
}
```

### 4.2 Ce que fait le moteur

- **Graine par séance** : `uid + '|' + id de la séance` (deux séances d'un même scénario ne tirent pas pareil).
- **À la première ouverture** (après avoir figé `db.aisance`) : tire, vérifie (re-tire comme `tirerJeu` : `#1`, `#2`…,
  secours = premières pièces conformes de chaque difficulté, jamais un élève sans jeu), puis **range le résultat** :
  `db.tirages[<id séance>] = { graine, pieces: { cv: ['cv-yanis', 'cv-07', …] }, bonus: { cv: ['cv-21', 'cv-03'] },
  valeurs: { … }, essai, at }`.
- **Ensuite, on ne retire plus jamais** : la séance lit les **ids rangés** et va chercher les pièces dans la banque par
  leur id. Enrichir la banque, changer `melange`, ajouter une pièce : sans effet sur un élève qui a déjà ouvert la séance.
- Une pièce rangée **introuvable** dans la banque (supprimée par erreur malgré la règle) : le moteur la remplace par une
  pièce de même difficulté, la note dans `db.tirages[…].remplacees`, et la séance continue. Jamais de blocage. Un test
  de la suite échoue si une banque perd un id présent dans la version précédente du fichier (voir §6).
- **Bonus** : tiré seulement si `db.aisance === 'confirme'`, **en même temps que le socle** (à la première ouverture), parmi
  les pièces non tirées. Un élève standard n'a pas de clé `bonus`.
- **Évaluation** (`copie`) : tire le socle, **jamais de bonus**, le niveau est ignoré. Le mécanisme d'ENT-4.4 / ENT-2.5
  (`quai: (graine) => …`, `inventaire: (graine) => …`) **reste tel quel** pour ces séances : ne pas les migrer.
- « Réinitialiser » une base (enseignant) efface le tirage avec le reste, comme aujourd'hui.
- Outils pour la séance : `piecesTirees(db, 'cv')` (socle, dans l'ordre affiché), `piecesBonus(db, 'cv')`,
  `valeursTirees(db)`. À documenter dans `FICHE-SEANCE.md`.

### 4.3 Corrigé enseignant

- Onglet **Corrigés** : pour une séance tirée, choisir un élève (comme ENT-4.4) montre **ses** pièces, ses valeurs, ce
  qu'attend chaque jalon, et ses cas bonus marqués « bonus ».

### 4.4 Déclarer les niveaux d'une séance

- `meta.niveauxPrevus: ['confirme']` (ou `['confirme', 'accompagne']` plus tard) : la séance prévoit un contenu par niveau.
  Sert au tableau du §3.3 (colonnes) et à un test (une séance qui déclare des bonus doit déclarer `confirme`).
- Ne **rien** grossir dans le moteur : comme aujourd'hui, le contenu en plus est déclaré par la séance.

---

## 5. Lot 3 — Bonus dans la note (≈ 3 h)

### 5.1 Jalons bonus

- Un jalon déclare `bonus: true` : **sans `poids`**, sans `groupe` montré à l'élève. La somme des poids du **socle** reste
  20 (le contrôle existant ne compte pas les jalons bonus).
- Un jalon bonus n'existe que pour un élève confirmé (la séance les fabrique à partir de `piecesBonus`). Chez un standard,
  aucun jalon bonus.

### 5.2 Le réglage

En tête de `core/notes.js` : `export const BONUS = { parCas: 0.5, plafond: 2 };` — **le seul endroit à toucher** quand
Tristan affinera après les tests en classe.

### 5.3 Le calcul

- `bonus(état) = min(plafond, parCas × nombre de jalons bonus justes)`.
- Séance `correction` : `bonus1` rangé avec le premier bilan (`db.indicateurs[séance].bilan1`). À la 1re correction,
  le bonus retenu = **max(bonus1, moyenne(bonus1, bonus à ce moment))**, figé avec la note. Il ne peut que monter.
- **Note = min(20, note du socle + bonus retenu)**, arrondie au demi-point comme aujourd'hui.
- Score rangé : `score` = points du socle + bonus, `max` = 20 ; `detail.bonus = { justes, total, points }` et
  `detail.niveau` (déjà là). Une note déjà écrite n'est jamais recalculée à la baisse (`meilleurScore`).

### 5.4 Ce que voit qui

- **Élève** : bandeau de fin = groupes du socle seulement. **Aucune ligne, aucun mot « bonus »**, aucun compteur de cas
  qui différerait d'un voisin standard (attention aux « 3 / 5 » ou aux listes numérotées qui trahiraient 7 pièces au lieu
  de 5 : le nombre de pièces affiché dans la consigne vient de la séance, à elle d'écrire une consigne neutre — le
  rappeler dans `FICHE-SEANCE.md`).
- **Enseignant** : infobulle du Suivi : « dont bonus +1 (2 cas sur 2) » ; Corrigés : cas bonus marqués « bonus ».
- Export des notes : la note avec bonus (la colonne est la note de la séance) ; pas de colonne bonus à part (sauf avis
  contraire de Tristan à l'écran).

---

## 6. Tests (bloc nouveau `tirage-niveaux`, une ligne dans `BLOCS` : **le dire à Tristan**)

Séance d'essai déclarée dans les contenus d'essai (comme `entrepot-essai.js`), jamais une vraie séance.

1. **Niveau par scénario** : confirmé chez 6, standard chez 5 → `ctx.aisance` vaut `confirme` en 6.x, `standard` en 5.x.
2. **Migration** : profil `aisance: 'confirme'` sans `niveaux` → Cdiscount confirmé, les autres standard ; après un
   réglage, `aisance` a disparu et `niveaux['2']` porte la valeur. Nommer ce qui **reste** (tiers-temps, demi-groupe).
3. **Effet à la séance suivante** : séance ouverte en standard, niveau passé à confirmé → la séance reste standard (pas de
   bonus), la séance suivante ouvre en confirmé.
4. **Accompagné** : reçoit exactement le contenu standard (mêmes pièces que si standard, mêmes jalons).
5. **Demi-groupe** : « Tout 1L1 → Confirmé » change les élèves de 1L1, **pas** ceux de 1L2.
6. **Proposition** : 2 séances à 16 et temps sous la médiane → marque ; 1 seule → rien ; rapide mais 12/20 → rien ;
   « Appliquer » enregistre.
7. **Tirage mémorisé** : ouvrir, relever les ids ; ajouter 10 pièces à la banque et changer `melange` → rouvrir : mêmes ids.
   Recharger, changer de « poste » (nouvelle page) : mêmes ids.
8. **Équité** : 300 graines → chaque jeu respecte le mélange, la pièce fixe est toujours là, zéro secours.
9. **Pièce introuvable** : retirer un id rangé de la banque → la séance s'ouvre, une pièce de même difficulté la remplace.
10. **Banque stable** : un test relit chaque banque déclarée et échoue si un id disparaît par rapport à une liste figée
    dans le test (la liste ne peut que s'allonger, comme les points fautifs du plan quadrillé).
11. **Bonus** : confirmé, 2 cas bonus justes → +1 ; 4 justes avec plafond 2 → +2 ; socle à 19,5 + 2 → 20 ; cas bonus
    faux → la note du socle, pas moins. Standard → aucun jalon bonus.
12. **Bonus caché** : le bandeau élève d'un confirmé et celui d'un standard ont les **mêmes lignes** ; le mot « bonus »
    n'apparaît nulle part côté élève ; il apparaît dans l'infobulle enseignant.
13. **Évaluation** : un confirmé n'a ni bonus ni pièce en plus.
14. **Règles** (émulateur) : un élève ne peut ni écrire ni effacer `niveaux` ; l'enseignant peut.

Chaque test éprouvé dans les deux sens (relecture du tirage retirée, garde du plafond retirée, filtre des lignes bonus
retiré : des cas doivent tomber). Suite entière avant chaque push.

---

## 7. Ce que ce chantier ne fait pas

- Le **contenu** du niveau Accompagné (aides, indices, champ pré-rempli) : à concevoir plus tard avec Tristan.
- Le **test de positionnement** et les entraînements ciblés (fiche projet, §4 : module à part, plus tard).
- Reprendre les anciens scénarios (Smoby, Cdiscount, Picard, Boost, Spartoo) : seulement si ça fait ses preuves sur FB.
  Cdiscount garde son contenu confirmé tel quel (il lit `db.aisance`).
- Les briefs ENT-6.1 à 6.10 : chacun, à sa réécriture par Cowork, prend une section **« Tirage et niveaux »** (pièce
  fixe, banque et difficultés, mélange du socle, cas bonus du confirmé, valeurs tirées, consigne neutre). Voir le
  §6 bis de `docs/briefs/MODELE.md`.

## 8. Choix laissés à Claude Code (Tristan juge à l'écran)

- La place de l'écran « Niveaux » (onglet ou sous-onglet de Comptes élèves).
- Le fichier qui porte le réglage `PROPOSITION`.
- La forme de la marque « proposé ».

## 9. Questions ouvertes

Aucune à ce jour (toutes tranchées le 08/10). Si un point contredit le code : s'arrêter et demander.

---

## Compte rendu *(rempli par Claude Code à la livraison de chaque lot)*

### Lot 1 — niveau par scénario (09/10/2026, Claude Code, chantier D-C)

- **Fichiers modifiés** : `core/amenagements.js` (réécrit : `NIVEAUX`, `scenarioDe`, `niveauxDe` avec la migration,
  `niveauScenario`, `niveauxApres`, `PROPOSITION`, `proposition`, `mediane`) ; `core/app.js` (`ctx.aisance` = niveau du
  scénario de la séance) ; `core/backend-demo.js` et `core/backend-firebase.js` (`majAmenagements` : écrire `niveaux`
  retire `aisance`) ; `core/prof.js` (colonne « Niveau » retirée de Comptes élèves, onglet **« Niveaux »**) ;
  `core/types/entreprise.js` (`db.aisance` accepte `'accompagne'`, `detail.niveau: 'accompagné'`, `note1` rangé au premier
  bilan) ; `outils/test-regles.mjs` (5 cas) ; `outils/test/tirage-niveaux.mjs` (bloc nouveau) ; `outils/test.mjs` (le bloc
  dans `BLOCS` **et dans le groupe 1 de `GROUPES`**, sans quoi le lanceur refuse de partir) ; `outils/test/amenagements.mjs`
  (cas adaptés, voir Tests) ; `activites/FICHE-SEANCE.md`.
- **Écart avec le brief (le code le contredisait)** : §3.2 demandait d'ajouter `niveaux` à la liste interdite des règles
  Firestore. Depuis l'audit du 08/10 (C1), la règle de l'élève est une **liste blanche** (`nom`, `prenom` seulement) :
  `niveaux` lui est déjà fermé. **`firestore.rules` n'a pas changé : rien à publier dans la console pour ce lot.** Les cas
  à l'émulateur le prouvent (et tombent si on ajoute `niveaux` à la liste blanche).
- **Décisions techniques (§8)** : l'écran est un **onglet « Niveaux »** entre « Comptes élèves » et « Suivi de classe » ;
  `PROPOSITION` est en tête de `core/amenagements.js` ; la marque est un texte discret « proposé : Confirmé » qui se déplie
  au clic (séances comptées, premier bilan, temps de l'élève, médiane du groupe) avec un bouton « Appliquer ». Le choix
  « Tout le demi-groupe → » propose aussi « Toute la classe ». Une écriture de niveaux réécrit la carte entière de l'élève
  (`niveaux`), migration comprise.
- **Lecture de la règle de proposition (SUPPOSÉ, à confirmer par Tristan à l'écran)** : « temps sous la médiane » est jugé
  **séance par séance** (temps de l'élève < médiane des temps du groupe sur cette séance) ; une séance compte si son
  premier bilan ≥ 16 **et** son temps est sous la médiane ; il en faut 2. « Premier bilan » = `note1` (rangée désormais par
  le moteur au premier bilan d'une séance `correction`), sinon la note de la séance (meilleur score sur 20) pour les
  séances sans premier bilan et les résultats d'avant le 09/10. Les évaluations (`copie`) ne comptent pas.
- **Tests** : bloc `tirage-niveaux` 10/10 (colonnes, scénario 2 confirmé / 4 standard, effet à la séance suivante,
  accompagné = contenu standard, migration avec ce qui reste, demi-groupe 1L1 sans 1L2, proposition et « Appliquer »,
  rien dans le Suivi ni chez l'élève). Sabotages faits, chacun fait tomber au moins un cas : scénario ignoré, migration
  retirée, `aisance` non retirée, accompagné non figé, demi-groupe ignoré, seuil de note, médiane, « 2 séances » ramené à 1,
  niveau relu à chaque ouverture. Règles : **179/179** à l'émulateur (174 avant, +5 cas) ; sabotage `hasOnly([...,
  'niveaux'])` → 3 cas tombent. Suite entière **936/936** (926 + 10). **Cas existants modifiés** (le comportement change) dans
  `outils/test/amenagements.mjs` : « l'onglet Comptes élèves montre le niveau… » (devient « …sans colonne Niveau »),
  « l'enseignant coche le tiers-temps et passe l'élève en confirmé » (le niveau se règle dans l'onglet Niveaux, chez
  Cdiscount), « case cochée → … aisance confirme » (le quiz témoin, hors entreprise, reçoit désormais « standard »),
  « un élève ne peut pas changer ses propres réglages » (lit `niveaux['2']`), « l'enseignant décoche… » (attend
  « standard » dans le quiz).
- **Reste ouvert** : « proposer Accompagné » (porte ouverte, pas de code) ; la lecture de la règle ci-dessus.

