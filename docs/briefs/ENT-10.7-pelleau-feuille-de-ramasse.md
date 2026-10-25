# Brief de séance — ENT-10.7 Transports Pelleau — la feuille de ramasse se trompe (CAP OL, entraînement CAP-C1.3, erreur induite)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, docs/briefs/ENT-10.6-pelleau-ramasse-du-mercredi.md puis docs/briefs/ENT-10.7-pelleau-feuille-de-ramasse.md en entier. Les poids du §5 sont validés par Tristan ; annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : livré (19/10/2026, commité et poussé) · **Date** : 18/10/2026 · Cowork, sur délégation · **Modèle** : Sonnet · **Durée estimée** : ≈ 4 h.

---

## 0. Règles communes

Feuille de route Pelleau ; **lundi 18 mai, 7 h 30** (après le pont de l'Ascension). **L'erreur induite** : Loïc, pressé, a rempli sa feuille de ramasse trop vite : **une palette
y est notée chez le mauvais client**. Il dit : « Pose comme c'est écrit sur la feuille, j'ai tout noté. » L'étiquette de la palette, elle, dit vrai.
L'élève doit **suivre l'étiquette**, voir que l'écart avec les annonces vient d'une **erreur d'écriture** (un client +1, l'autre −1) et le dire.

Écrans : **Avant de commencer → Préparer → Loïc (dialogue) → Le quai A → Rapprocher → La feuille corrigée → Rendre compte** → bilan.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.7 / `pelleau-feuille-de-ramasse` |
| Titre / desc | « Transports Pelleau — la feuille de ramasse se trompe » / « Trier les palettes d'après leur étiquette même quand la feuille dit autre chose, trouver l'erreur d'écriture et la faire corriger. » |
| Compétence / temps | `CAP-C1.3` (C1.3.4 surtout), `temps: 'entrainement'` (erreur induite) |
| Notation | `bareme: 20`, `parcours`, `correction`, `bilanDetail`, `precedente: 'pelleau-ramasse-du-mercredi'` ; `niveauxPrevus: ['confirme']` ; `questions: 'ENT-10.7'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

Comme ENT-10.5. L'erreur de Loïc est construite.

## 3. Objectif

Savoir **quel document croire** à la réception : l'étiquette de la palette et ce qu'on voit, avant une feuille écrite à la main ; ne pas « faire coller »
les chiffres ; faire corriger le document.

## 4. Déroulé (≈ 45 min)

- **Étape 1 — Préparer** (comme ENT-10.6, 2 lignes) : les valeurs viennent de la **feuille** (fausse) et des **annonces** (justes) : l'élève voit déjà
  que la feuille et les annonces ne disent pas la même chose (Ar Vag : feuille 3, annonce 2 ; Agri-Kerlann : feuille 1, annonce 2). La fiche demande
  seulement le total (4) et le nombre de clients (2) : rien n'est faux à ce stade.
- **Étape 2 — Loïc** (`pelleau-loic-107`, 2 tours) : 1) feuille ; 2) Loïc : « Pose comme c'est écrit sur la feuille, j'ai tout noté, on gagne du
  temps. » — **« Je regarde quand même chaque étiquette avant de poser. »** · « D'accord, je suis la feuille. » · « Alors je ne regarde rien. »
- **Étape 3 — Le quai A** (`pelleau-quai-107`) : inspection 1 défaut tiré (comme ENT-10.6) ; dépose par client, 4 palettes, **2 + 2 en vrai** ; la palette
  **mal notée** (tirée parmi les 4) a pour étiquette son vrai client ; la légende de la pause dit l'étiquette (moteur). Le jalon de cette palette est
  son premier clic **dans la zone de son vrai client** (poids plus fort, §5).
- **Étape 4 — Rapprocher** : reçues **comptées dans la zone** (2 et 2) contre les annonces (2 et 2) → **conforme** pour les deux ; et une ligne de plus :
  « La feuille de ramasse est-elle juste ? » — **Non : la palette P{n} est notée chez Ar Vag, son étiquette dit Agri-Kerlann** (choix calculés : la
  bonne palette et la bonne correction, deux pièges : une autre palette ; « oui, elle est juste »).
- **Étape 5 — La feuille corrigée** (fiche `liste`, 1 ligne) : « Qui corrige la feuille ? » — **Loïc, qui l'a écrite, avec Maëlys** · moi, je raye et
  je réécris seul · personne, c'est trop tard.
- **Étape 6 — Rendre compte à Maëlys** (phrases) : reçu (« 4 palettes, 2 par client, conformes aux annonces ») · l'erreur (calculée) · fin.
- **Fin** : Maëlys : « Merci, je vois ça avec Loïc. » ; `finFige` (dialogue, quai).

## 4 bis. Questions au fil — choix de Cowork : A, B, C

| id | Geste | Qui | Question (juste en gras) | Notée | Corrigée |
|---|---|---|---|---|---|
| `croire-quoi` (A) | `dialogue:pelleau-loic-107:fin` | Erwan | « La feuille et l'étiquette ne disent pas la même chose. Tu crois… » — **l'étiquette, posée sur la palette par le client** (`etiquette`) · la feuille, c'est Loïc qui l'a écrite (`feuille`) · ce qui t'arrange (`arrange`) | **1,5** | **au bilan** (donnerait la dépose) |
| `si-on-suit` (B) | `fiche:rapprocher:envoyer` | Erwan | « Si on avait suivi la feuille, que se passerait-il le jour où Ar Vag reprend ses palettes ? » — **on lui rendrait une palette d'Agri-Kerlann** (`erreur`) · rien (`rien`) · Ar Vag paierait moins (`paie`) | **1,5** | tout de suite (éco-droit appliqué : C. civ. 1932) |
| `qui-corrige` (C) | `fiche:corriger` | Maëlys | « Pourquoi ne pas raturer seul la feuille ? » — **elle est signée : on corrige avec celui qui l'a écrite, pour qu'elle reste une preuve** (`preuve`) · pour aller plus vite (`vite`) · ça ne change rien (`rien`) | **1** | tout de suite |

## 4 ter. Avant de commencer

Banque d'ENT-10.5, `tirage: { preparation: 3, image: 1 }`.

## 5. Jalons — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids |
|---|---|---|
| **Préparer** | 2 lignes | **1** |
| **Accueillir Loïc** | réplique 1 (feuille) 0,5 · réplique 2 (« je regarde l'étiquette ») 1,5 | **2** |
| **Avant de décharger** | défaut 2 · aucun faux 1 | **3** |
| **Trier par client** | la palette mal notée 2 · les 3 autres 0,5 chacune | **3,5** |
| **Rapprocher** | 2 × (reçues 0,5 + résultat 0,5) · « la feuille est-elle juste ? » 2 | **4** |
| **Faire corriger** | qui corrige 1 | **1** |
| **Rendre compte** | l'erreur 1 · forme 0,5 | **1,5** |
| **Questions** | A 1,5 · B 1,5 · C 1 | **4** |
| **Total** | | **20** |

## 6 / 6 bis. Contenu et tirage

`contenus/pelleau-ent107.js` etc. Tirés : la palette mal notée (P1 à P4, uniforme), le sens de l'erreur (Ar Vag ↔ Agri-Kerlann), le défaut du quai,
l'ordre dans le camion. **Contrôle** : la feuille fausse donne toujours +1 / −1 ; les annonces restent conformes au vrai ; 3 cases par client pour
2 palettes chacun (3 + 3 + 2 pièges = 8 : il reste toujours une case libre de chaque client, la dernière palette ne se pose pas par élimination). Confirmé : aucun bonus ;
document « Règles du quai » non joint.

## 7. Demandes au moteur

Aucune. **À vérifier** : la légende de la pause dit l'étiquette (option du `MOTEUR-depose-par-client.md` §3) et **jamais** la feuille.

## 8. Tests

300 graines : la palette mal notée varie ; parcours juste → 20/20 ; « je suis la feuille » + dépose selon la feuille → blocs 2 et 4 ✗, la palette mal
notée ✗ seule ; « la feuille est juste » → ✗ ; inaction → 0 ; A au bilan.

## 9 à 11

Trame : feuille de ramasse imprimée (la fausse) pour la correction en classe. Critère : la contradiction feuille / étiquette se voit sans aide.
Question ouverte : faut-il que Loïc s'excuse au message de fin ? (Défaut : non, Maëlys gère.)

---

## Compte rendu *(rempli par Claude Code à la livraison)*

**19/10/2026, phase 3 du chantier Pelleau (Sonnet, sous-agent du chef ; non commité, le chef commite).** Fichiers : `activites/pelleau-feuille-de-ramasse.js`, `contenus/pelleau-ent107.js`, `contenus/pelleau-ent107-donnees.js` (données pures et jeu tiré, chargées aussi sous Node par le corrigé), `contenus/questions/ENT-10.7.js`, `contenus/corriges/ENT-10.7.js`, `outils/test/pelleau-107.mjs` (22 cas) ; lignes AJOUTÉES dans `activites/index.js`, `outils/test.mjs` (`BLOCS`, `GROUPES` groupe 4), `outils/test/socle.mjs` (`ATTENDU_CAP`). Aucun `core/`, `styles/`, `commun.mjs` ni fichier d'ENT-10.1, 10.5 ou 10.6 touché. Pas de `declarerTirage` : le jeu est une fonction pure de la graine (comme l'anomalie d'ENT-8.7), donc rien dans `BANQUES_FIGEES` ; un cas « jeu figé » épingle trois élèves.

**Statut : livré** (`pret: true, ouverture: 'prof'`). Vérifié : `pelleau-107` 22/22 ; `socle dependances questions tirage-niveaux pelleau-105 pelleau-107` 227/227.

**Poids codés (brief §5, tels quels).** Préparer 0,5 × 2 · Loïc : demander la feuille 0,5, « je regarde l'étiquette » 1,5 · défaut 2, aucun faux 1 · trier : la palette mal notée 2, les trois autres 0,5 · rapprocher : reçues et résultat 0,5 × 4, « la feuille est-elle juste ? » 2 · faire corriger 1 · erreur 1, salutation 0,25, fin 0,25 · questions A 1,5, B 1,5, C 1 (`part: 4`). Total 20.

**Le jeu tiré par la graine (décision 14).** Par élève : le client de chaque palette P1 à P4 (donc l'ordre dans le camion), LA palette mal notée (P1 à P4, uniforme), donc le sens de l'erreur, une « autre » palette du même groupe (le piège), le défaut du quai (lampe, niveleur ou cale) et l'ordre des trois choix. Les ids de jalons sont les mêmes pour tous (`securite-defaut`, `depose-mal`, `depose-autre-1` à `3`). La feuille liste, par client, les numéros des palettes que Loïc y a notées ; le nombre de colis suit le nombre de palettes notées, jamais le contenu réel. Sur 300 graines, la feuille et les annonces laissent toujours trois candidates : seule l'étiquette, lue au quai, désigne la palette.

**Sabotages joués puis remis (fichiers relus identiques).**

| Sabotage | Cas tombés |
|---|---|
| « La feuille est juste » vrai sans envoi (inaction) | inaction ; jalons sans écran ; parcours juste |
| « Tout est conforme » accepté (ligne erreur juste = 3) | 10 cas (jalons sans écran, l'écart change avec la graine, parcours, suivre la feuille, pire cas…) |
| Colis réels du contenu sur la feuille (écart déductible) | contenu |
| Total écrit sur la feuille (écart déductible) | contenu ; ouverture |
| Palette mal notée plus tirée (toujours P4) | jeu tiré ; jeu figé ; l'écart change ; suivre la feuille ; corrigé |
| Sens plus tiré (Ar Vag toujours P1 et P2) | jeu figé ; contenu ; l'autre sens ; corrigé |
| `depose-mal` lit la ligne d'une autre palette | jalons sans écran ; l'écart change ; suivre la feuille |

**Écarts avec le brief (décisions prises en route).**
1. Bloc `pelleau-107` (un bloc par séance), aucun jour de la semaine (« 18 mai »), chiffres calculés (4 palettes, colis, phrases).
2. Question A (`croire-quoi`) : énoncé en hypothèse (« Imagine que la feuille et l'étiquette… ») : à ce moment l'élève n'a pas vu l'étiquette, la question ne doit pas lui annoncer l'erreur.
3. Question B : `selon` nomme les clients de l'élève (« le jour où Ar Vag reprend… une palette d'Agri-Kerlann »), jamais le numéro de palette. Question C posée à l'envoi de la fiche « La feuille de ramasse ».
4. Deux messages d'Erwan neutres ajoutés (« Loïc arrive », « Yann est prêt »), et un pour la fiche « Faire corriger » (« Dernière question sur la feuille de ramasse… ») qui ne dit pas qu'elle est fausse. Réactions de Loïc, retours d'« Avant de commencer » et phrases-pièges écrits par Claude Code, à relire.
5. Quai de huit cases (trois par client + allée + quai B) : le plafond du moteur ; lisible à 1366 × 768. Choix de « La feuille est-elle juste ? » : les trois du brief, ordre tiré ; les quatre phrases du compte rendu ajoutent le sens inversé.
6. Confirmé : seul le document « Règles du quai » n'est pas joint (message et fiche) ; aucun bonus ; accompagné = standard.
7. `precedente: 'pelleau-ramasse-du-mercredi'` : l'élève reste fermé tant qu'ENT-10.6 n'a pas son bilan.
8. Le moteur déclare maintenant `document.article: 'la'`, `tutoiement` et `prenomChauffeur` (modifications non commitées de `quai.js`) : utilisés ici ; sans elles, la légende dirait « le feuille ».

**À vérifier à l'écran par Tristan.** Le tableau de la feuille (numéros des palettes) et la lisibilité de « AR VAG 1 » à « AGRI 3 » ; que l'élève peut retrouver la palette mal notée de mémoire (légende « étiquette : … (1 sur 4) » à chaque pause : si c'est trop dur pour des CAP, ajouter un rappel) ; la réaction de Yann devant la case du client de la feuille ; les textes construits (réactions de Loïc, phrases, message d'Erwan « La feuille de ramasse ») ; la légende à ① (« Loïc te remet la feuille de ramasse ») une fois le moteur commité ; le défaut tiré dans les trois vues.

**21/10/2026 (retouche décidée par Tristan, Sonnet ; non commité).** La fiche « Rapprocher » affiche maintenant, en standard et accompagné, un cadre « Ce que tu as lu sur les étiquettes, au quai » : une ligne par palette (« P1 — étiquette : Biscuiterie Ar Vag »), l'expéditeur de l'étiquette réelle, jamais la feuille, aucune comparaison. Le moteur ne range pas les étiquettes lues : le rappel reprend celles des palettes réellement posées (`db.quais[…].depose[id].pose`) ; une palette pas encore posée dit « pas encore vue ». Le confirmé n'a pas ce cadre. Corrigé inchangé (il ne décrit pas la fiche). Fichiers : `contenus/pelleau-ent107.js` (`lignesEtiquettes`, `posee`), `outils/test/pelleau-107.mjs` (deux cas ajoutés, aucun cas existant recalé).
**21/10/2026 (vérifié).** `pelleau-107 tirage-niveaux dependances` 90/90 ; sabotages joués puis remis (le rappel lit la feuille au lieu de l'étiquette : les deux cas tombent ; le rappel montré aussi au confirmé : les deux tombent). À voir à l'écran par Tristan : le cadre prend la teinte ambre standard des encadrés (même rendu que les autres notes de fiche) ; si elle fait trop « à lire en priorité », dire.
