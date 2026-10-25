# Brief de séance — ENT-10.8 Transports Pelleau — évaluation : recevoir le camion de ramasse (CAP OL, évaluation CAP-C1.3)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, les briefs ENT-10.5 à ENT-10.7 puis docs/briefs/ENT-10.8-pelleau-evaluation-reception.md en entier. Les poids du §5 sont validés par Tristan ; annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : livré (19-20/10/2026, `pret: true, ouverture: 'prof'`) · **Date** : 18/10/2026 · Cowork, sur délégation · **Modèle** : Sonnet · **Durée estimée** : ≈ 4 h.

---

## 0. Règles communes

Feuille de route Pelleau ; **mardi 19 mai, 7 h**. `copie: true`, sans aide, sous surveillance, un jeu tiré par élève ; rien ne dit juste ou faux avant
la remise ; le quai se joue avec `rendCopie: false` (la copie se rend après le compte rendu).

Écrans : **Avant de commencer (notée) → Le planning et la préparation → Loïc (dialogue, mode évaluation) → Le quai A → Rapprocher → Rendre compte**
→ remise.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.8 / `pelleau-evaluation-reception` |
| Titre / desc | « Transports Pelleau — évaluation : recevoir le camion de ramasse » / « Recevoir seul un camion de ramasse : préparer, accueillir, vérifier le quai, trier par client, rapprocher des annonces et rendre compte, sans aide. » |
| Compétence / temps | `CAP-C1.3`, `temps: 'evaluation'` |
| Notation | `bareme: 20`, `copie: true`, `noter`, `parcours`, `precedente: 'pelleau-feuille-de-ramasse'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 4. Déroulé (≈ 45 min)

- **Ouverture notée** (4 / 20) : `tirage: { preparation: 3, image: 1 }` parmi les questions `cle` d'ENT-10.5 à 10.7 (annonce, feuille de ramasse,
  étiquette de palette ; img-porteur-quai), « Je ne sais pas », faux = − 1 ÷ (mauvaises réponses), plancher 0.
- **Étape 1** : document « Planning des quais du mardi 19 mai » (grille tirée parmi 2) + feuille de ramasse + annonces ; fiche « Préparer » 3 lignes :
  heure du camion de Loïc · quai · nombre de palettes par client (un client tiré).
- **Étape 2** : dialogue `pelleau-loic-108` en mode évaluation (2 tours : feuille ; moteur, cale, local).
- **Étape 3** : quai `pelleau-quai-108`, `copie` : 1 défaut tiré (4 objets) + 1 point en ordre ; dépose par client (premier clic pose) ; 4 palettes,
  répartition tirée (2 + 2 ou 3 + 1).
- **Étape 4** : « Rapprocher » : écart tiré (`aucun` / `moins` / `plus` / **`feuille`** : l'erreur d'écriture d'ENT-10.7), au plus un.
- **Étape 5** : phrases (reçu, écart calculé, fin) → « Rendre ma copie ».

## 5. Jalons — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids |
|---|---|---|
| **Avant de commencer** | 4 questions | **4** |
| **Préparer** | 3 lignes, 2/3 chacune | **2** |
| **Accueillir** | 2 répliques, 1 chacune | **2** |
| **Avant de décharger** | défaut 2 · aucun faux 1 | **3** |
| **Trier par client** | 4 palettes, 1 chacune | **4** |
| **Rapprocher** | 2 clients × 1,5 (reçues 0,75 + résultat 0,75 ; pour `feuille` : la palette et la correction) | **3** |
| **Rendre compte** | contenu 1,5 · forme 0,5 | **2** |
| **Total** | | **20** |

Pas de questions au fil (évaluation). Inaction : 0.

## 6 bis. Tirage

Socle tiré, ni bonus ni niveau. Écart : quart chacun sur 300 graines. Équité : chaque copie a exactement 1 défaut, 4 palettes, au plus 1 écart.

## 7. Demandes au moteur

Aucune. **À vérifier** : `depose` en copie avec `client` (prévu au `MOTEUR-depose-par-client.md`) ; `rendCopie: false`.

## 8. Tests (bloc `pelleau-recep`)

Parcours juste sur 4 graines (un par écart) → 20/20 ; inaction → 0 ; rien ne dit juste / faux avant la remise ; ouverture : plancher 0 ; premier clic
faux en dépose → jalon ✗, palette dessinée là à ④ (ici : pas d'étape ④, `arret` : dessinée là en fin de déchargement).

## 9 à 11

Pas de trame ; corrigé enseignant par élève. Critère : 45 min. Question ouverte : aucune.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

**Livré le 19/10/2026** (Claude Code, Sonnet 5.5, ≈ 4 h) : `pret: true, ouverture: 'prof'` (fermée aux élèves jusqu'à la coche de l'enseignant). Fichiers :
`activites/pelleau-evaluation-reception.js`, `contenus/pelleau-ent108.js` (+ `-donnees.js`), `contenus/questions/ENT-10.8.js`, `contenus/corriges/ENT-10.8.js`,
`outils/test/pelleau-108.mjs` (24 cas) ; lignes ajoutées (jamais réécrites) à `activites/index.js`, `outils/test.mjs` (`BLOCS`, `GROUPES` : groupe 4) et
`outils/test/socle.mjs` (`'ENT-10.8': 'CAP-C1.3'`). **Alerte 7** : `outils/test.mjs` touché (deux lignes) ; **alerte 8** : activité ajoutée, code `ENT-10.8`. Aucune
demande au moteur, rien dans `core/` ni `styles/` ; `tirage-niveaux.mjs` non touché (aucun `declarerTirage`).

**Poids codés** (tels que le brief §5) : ouverture 4 (`part: 4`) · Préparer 3 × 2/3 = 2 · Accueillir 1 + 1 = 2 · Avant de décharger : défaut 2, aucun faux 1 · Trier : 4 × 1 ·
Rapprocher : reçues 0,75 × 2 + 0,75 × 2 · Rendre compte : écart 1,5, salutation 0,25, fin 0,25 · total 20 (16 de jalons + 4).

**Écarts au brief (à valider)** :
1. **Aucun jour de la semaine** (décision n° 9 du chef) : « Planning des quais — 19 mai », pas « du mardi 19 mai ».
2. **Pas de `parcours` ni de `precedente`** (§1 les listait ; demande du chef : comme ENT-8.6 et 8.10, la séance s'ouvre quand l'enseignant la coche).
3. **« Rapprocher » : le brief dit « pour `feuille` : la palette et la correction » sans dire où.** Choix de Claude Code : la fiche a **les mêmes six lignes pour tous**
   (reçues + résultat pour chaque client, puis « La feuille de Loïc est… » et « Que fais-tu de la feuille ? »), sinon la forme de la fiche dirait l'écart. Jalons :
   `rapprocher-recues-<client>` 0,75 × 2 ; `rapprocher-resultat-ar-vag` et `-agri-kerlann` 0,75 chacun = sans erreur de feuille, le résultat du client **et** « la feuille est
   juste » (Ar Vag) / « rien à corriger » (Agri-Kerlann), pour qu'accuser la feuille à tort coûte ; avec l'erreur de feuille, « la palette » (le sens de l'erreur, deux sens
   possibles) et « la correction » (« Loïc la corrige avec Maëlys »). **« Quelle palette (P1 à P4) » n'existe pas** : la feuille donne des nombres par client, pas des palettes
   (comme ENT-10.7), donc la « palette » est le sens de l'erreur (« une palette d'Agri-Kerlann est notée chez Ar Vag »).
4. **Rendre compte** : contenu 1,5 = la seule ligne « écart » ; la ligne « reçu » reste un texte imposé (vrai : ce qui est compté au quai). Les quatre phrases de l'écart sont
   **toujours les quatre mêmes sortes** (conforme · moins · plus · la feuille se trompe), sinon la présence d'un choix dirait le cas. Maëlys **ne reprend pas** ce que l'élève a
   écrit (règle du 10/10 valable en entraînement ; ici, évaluation : « Merci… Rendre ma copie »).
5. **« Préparer »** : heure et quai lus dans le planning (deux grilles : Loïc à 7 h 30 au quai A, ou à 7 h 00 au quai B) ; troisième ligne = « Combien de palettes [client tiré] annonce-t-il ? »
   (lue dans l'annonce : unique même quand la feuille se trompe). Le menu s'appelle « Le quai » (pas « Le quai A ») : « Le quai B » dirait la réponse avant « Préparer ».
   La case « devant l'autre quai » s'appelle `autre-quai-1` et nomme le quai où Loïc n'est pas.
6. **Feuille de ramasse sans colonne « Observation »** (« 2e palette pas prête » d'ENT-10.6 disait l'écart) ni total. « Ta matinée » ne donne pas d'heure.
7. **Banque d'ouverture** : 8 questions (les ★ d'ENT-10.5 à 10.7 — annonce, feuille de ramasse, étiquette, photo des camions — plus zone de réception, cale, « gerber », marques au sol),
   parce que le moteur exige le double de ce qu'on tire par rubrique (6 pour 3, 2 pour 1). Mêmes ids qu'ENT-10.6, documents suffixés `-108`.
8. Texte d'arrêt du quai : « Les 4 palettes sont triées par client. » (jamais l'écart ; pas de « contrôle la semaine prochaine »).

**Ce que Tristan doit vérifier à l'écran** : (a) la fiche « Rapprocher » : six lignes, le dernier cadre (« La feuille de ramasse ») est-il compréhensible pour un CAP, et les
trois choix de « La feuille de Loïc est… » (« fausse : une palette d'Ar Vag est notée chez Agri-Kerlann ») ? (b) le planning (deux grilles) lu à 1366 × 768 ; (c) le quai B
(Loïc à 7 h 00 : porte B, « devant le quai A ») ; (d) le bouton « Rendre ma copie » : une seule remise, rien ne dit juste ou faux ; (e) les prénoms (Loïc, Yann…) : décision du chef,
à corriger par lui. **Séance jamais ouverte à des élèves ; rien de modifié « le jour même » d'une séance annoncée.**

**VÉRIFIÉ** (`node outils/test.mjs pelleau-108`, 24/24, six passages de suite ; puis `socle dependances copie questions pelleau-106` : 224/224 avec les autres séances Pelleau en
cours) : meta et poids jalon par jalon ; 300 graines (écart à un quart chacun, 2 plannings, un seul défaut, 4 palettes, au plus un écart, feuille toujours à ±1 sur deux lignes,
`verifierQuai`, zéro secours) ; jeu stable par graine et différent d'un élève à l'autre ; cinq camions écrits à la main ; parcours juste à l'écran à 20/20 sur cinq camions
(dont quai B et les deux sens de l'erreur de feuille) ; remise = `noter` ; le quai ne rend pas la copie ; dépose au premier clic sans réaction ; inspection neutre ; dialogue sans
réaction ; inaction 0 ; aucun texte lisible avant « Rapprocher » ne dit l'écart ; aucune requête externe. Captures 1366 × 768 regardées : accueil, « Préparer », quai A et B, dépose,
« Rapprocher », avant la remise, copie rendue (une table du planning cassée par la classe `pe-num` du moteur a été trouvée ainsi et corrigée : `pe-nb`).
**SUPPOSÉ** : la lisibilité pour des élèves de CAP (aucun essai avec eux) ; le mode réel (la suite ne couvre que la démonstration).

| Sabotage joué puis remis | Cas tombé(s) |
|---|---|
| un jalon vrai par inaction (`juge` rend `ok` quand la fiche n'est pas envoyée) | « inaction », « jalons sans écran », « Avant de commencer » (note), un parcours |
| réaction du cariste en copie (`repare` du défaut = « Bien vu : je répare. ») | « inspection en copie » (réponses identiques) |
| écart déductible d'un autre écran (le texte d'arrêt du quai ajoute « Il y a un écart avec les annonces ») | « jeu figé », « contenu » (aucun texte ne dit l'écart), un parcours |
| la forme des choix trahit le jeu (une phrase « la feuille se trompe » retirée hors du cas feuille) | « mêmes choix pour tous », « rendre compte » |
| `rendCopie: false` retiré du quai | seule la déclaration le voit : c'est `arret: 'dechargement'` qui empêche le quai de rendre la copie (aucun bouton « Clore ») |
