# Coordination des chantiers Boost (ENT-3.1 → 3.4) — 03/10/2026

Tableau de bord des chantiers issus de la réflexion de Tristan sur l'enchaînement ENT-3.1 / 3.2 / 3.3 / 3.4.
**À lire avant de lancer un chantier.** Règle de fond : **un seul chantier moteur à la fois** (`core/`, `styles/base.css`) ;
la préparation de contenu et les supports peuvent avancer en parallèle.

## Les chantiers

| Lettre | Chantier | Brief | Statut | Taille | Modèle |
|---|---|---|---|---|---|
| A | Consigne d'ENT-3.3 + pastilles d'avancement | `ENT-3.3-consigne-trois-etapes.md` | **à lancer en premier** | petit | Sonnet |
| B | Carte réelle dans ENT-3.1 | `ENT-3.1-refonte-carte.md` | **livré**, à valider à l'écran (`pret: false`) | gros | Opus (fait) |
| C | Un imprévu en cours de journée (ENT-3.2) | `ENT-3.2-imprevu.md` | prêt, **après A** | moyen à gros | Opus |
| D | Feuille de calcul moins guidée + données qui changent | `ENT-3.x-feuille-moins-guidee.md` | reporté, **en dernier** | gros | Opus |

## Qui touche quoi (moteur)

| Fichier | A | B | C | D |
|---|---|---|---|---|
| `core/types/tournee.js` | pastilles (rendu) | — (livré) | phases, bilan, notification | grille, service par colis, aides |
| `core/types/entreprise.js` | déclaration des pastilles | — | message déclenché | — |
| `core/types/carte.js` | — | mode « lire la case » (livré) | client barré, créneau repéré | — |
| `core/types/grille.js` | — | — | — | poids saisis, brouillon libre |
| `core/types/plan.js` | — | tableau réutilisable (livré) | — | — |
| `styles/base.css` | pastilles | halo ambre (livré) | notification | brouillon libre |
| `outils/test/boost.mjs` | cas ENT-3.3 | cas ENT-3.1 (réécrits) | cas ENT-3.2 | cas 3.2 / 3.4 |

**Lecture** : A, C et D se touchent tous (même `tournee.js`) : **jamais en même temps**. B est terminé côté moteur ; ce qu'il reste de B (validation, trame, corrigé) ne touche pas le moteur.

## Ordre conseillé

1. **A** (petit, indépendant) → pousser, valider à l'écran.
2. **B** : valider à l'écran, puis `pret: true` ; régénérer trame et corrigé (peut se faire pendant A).
3. **C** (imprévu).
4. **D** (feuille de calcul + données). Il recale ensuite 3.2/3.3 : **l'imprévu sera à recaler** (ou faire D avant C, au choix de Tristan).

## Ce qui peut se faire en même temps

| En parallèle | Pourquoi c'est sans risque |
|---|---|
| A (moteur) + validation à l'écran de B | Tristan valide, ccode ne touche pas à B |
| A (moteur) + trame Word/PDF et corrigé d'ENT-3.1 | supports : aucun fichier de `core/` |
| A ou C ou D (moteur) + choix des valeurs / clients dans `calibrer.mjs` | outil de calage, hors moteur |
| Tout chantier + rédaction des mails et textes (Cowork) | `contenus/*.js` ; un seul lot à la fois par fichier de contenu |
| Tout chantier + notes et fiches du projet PREPALOG (Cowork) | n'écrit que dans `docs/` |

**Pas en parallèle** : deux chantiers qui écrivent dans `core/types/tournee.js`, `core/types/grille.js`, `core/types/entreprise.js` ou `styles/base.css` ;
deux sessions qui ajoutent des cas dans `outils/test/boost.mjs` (conflit de fusion) ; un `git push` pendant qu'un autre chantier est à mi-chemin et rouge.

## Phrases à copier-coller dans ccode

Une phrase par chantier, aussi en tête de chaque brief. Elles disent à ccode de lire ce document d'abord.

| Chantier | Phrase |
|---|---|
| A · consigne ENT-3.3 | `Lis docs/briefs/COORDINATION-boost.md puis implémente le brief ENT-3.3-consigne-trois-etapes. Annonce la durée avant de commencer et construis les pastilles et les textes ; dis-moi quels tests tu réécris.` |
| B · trame et corrigé ENT-3.1 | `Lis docs/briefs/COORDINATION-boost.md puis, pour ENT-3.1 (carte déjà livrée), régénère la trame Word/PDF et le corrigé d'ENT-3.1 d'après le brief ENT-3.1-refonte-carte (section « Reste ouvert »). Je valide la carte à l'écran de mon côté.` |
| C · imprévu ENT-3.2 | `Lis docs/briefs/COORDINATION-boost.md puis implémente le brief ENT-3.2-imprevu. Annonce la durée avant de commencer, propose-moi 2 ou 3 imprévus chiffrés avec le script de calage, et attends mon choix avant de coder.` |
| D · feuille de calcul | `Lis docs/briefs/COORDINATION-boost.md puis implémente le brief ENT-3.x-feuille-moins-guidee. Annonce la durée avant de commencer et pose-moi les questions ouvertes du brief avant d'écrire.` |

## Règles posées par Tristan (03/10/2026), valables pour tous les scénarios à venir

- Les **données changent** d'une séance à l'autre, **sauf** deux séances jouées le même jour de travail (3.2 et 3.3).
- La **difficulté du repérage monte** : 3.1 points visibles avec contours ; 3.2 points cachés, clic sur la rue ; 3.4 à décider.
- La **feuille de calcul est de moins en moins guidée**, avec de l'information à chercher dans le mail.
