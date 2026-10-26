# Brief de séance — ENT-12.8 IKEA, évaluation gestion : la facture de mars (2de, poste A — gestion, évaluation)

**Statut** : livré (27/10/2026) — `pret: true, ouverture: 'prof'`, à essayer à l'écran puis à ouvrir par Tristan
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé par Tristan le 26/10
**Modèle** : Sonnet

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-12.8 |
| `id` | `ikea-evaluation-gestion` |
| Titre / desc | « IKEA — évaluation : la facture de mars » / « Sans aide : contrôler la facture du prestataire de livraison contre les bons signés et le tarif, calculer le bon montant et écrire la réclamation. » |
| Niveau(x) | `['2de']` |
| Compétence(s) | **AGO-2.1** ; D3 |
| Temps pédagogique | **évaluation** (règle 15 : AGO-2.1 travaillée en 12.4) |
| Notation | `copie: true`, jalons pondérés sur 20, un jeu tiré par élève ; `export const noter = (db) => moteur.noter(db);` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise

Comme 12.4 : prestataire **non nommé**, tarif, bons et facture **construits**, reconstitués avec mention en pied.

## 3. Objectif

Sans aide, l'élève rapproche chaque ligne d'une facture de sa preuve et du tarif, trouve les erreurs, calcule le montant juste
et le réclame par écrit.

## 4. Déroulé (≈ 45 min)

1. **Avant de commencer**, notées (4 / 20) : questions ★ de 12.4, tirées.
2. **Les pièces** : tarif, 12 bons, facture de mars de 12 lignes avec **3 erreurs tirées** dans une banque de 6 (doublon ;
   mauvais tarif ; livraison non faite facturée entière ; supplément d'étage facturé avec ascenseur ; erreur de quantité de colis ;
   erreur de calcul du total HT). La consigne ne dit pas combien.
3. **Le contrôle** (fiche, comme 12.4), **le montant** (`grille`), **la réclamation** (phrases à choisir).
4. Copie rendue.

## 4 bis. Questions au fil (notées, sans retour)

| Geste | Question | Pourquoi |
|---|---|---|
| Une ligne contestée | « Quelle pièce prouve ton motif pour la ligne X ? » (cliquer le bon ou la ligne du tarif) | justifier par la preuve, ancrée sur sa ligne |
| ★ Réclamation envoyée | « Le prestataire a été payé deux fois pour la livraison du bon X. Il doit… » (art. 1302 du Code civil cliqué) | **éco-droit appliqué**, reprise de 12.4 |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| 1-3 | Chaque erreur tirée trouvée avec le bon motif (un jalon par erreur, 3 points chacun) | contrôle | 9 |
| 4 | Aucune ligne juste contestée (vrai seulement si au moins une ligne est contestée) | contrôle | 2 |
| 5 | Total HT, TVA, TTC justes | calcul | 3 |
| 6 | Réclamation : lignes, motifs et montant justes | réclamation | 1 |
| 7 | Questions au fil | questions | 1 |
| — | Avant de commencer | questions | 4 |

## 6 bis. Tirage

Un jeu par élève : 3 erreurs parmi 6 (équité : toujours une erreur « facile » (doublon ou calcul), une « moyenne », une
« difficile » (livraison non faite, supplément d'étage)), montants tirés, clients tirés. Ni bonus ni niveau.

## 7. Demandes au moteur

Celle de 12.4 s'il y en a une (fiche à 12 lignes ou vue « Document à contrôler »).

## 8. Tests attendus

Bloc `outils/test/ikea-12.8.mjs`. Cas : copie juste ; chacune des 6 erreurs jouée au moins une fois ; une ligne juste contestée ;
fiche vide (jalon 4 faux) ; équité sur 500 tirages ; sabotage.

## 11. Questions ouvertes

- [ ] Aucune de plus que 12.4.

## Compte rendu *(rempli à la livraison, 27/10/2026)*

- **Fichiers créés / modifiés** : `activites/ikea-evaluation-gestion.js`, `contenus/ikea-ent128.js`, `ikea-ent128-donnees.js`, `questions/ENT-12.8.js`, `corriges/ENT-12.8.js`, `outils/test/ikea-12.8.mjs` ; `activites/index.js`, `activites/catalogue.js`, `outils/test.mjs` (BLOCS et GROUPES).
- **Écarts par rapport au brief** (et pourquoi) : Évaluation : trois erreurs tirées parmi six, copie rendue.
- **Décisions prises en route** : voir `docs/decisions.md` (ligne IKEA du 26/10/2026 et suite).
- **Tests** : bloc `ikea-12.8` (10 cas, valeurs attendues écrites à la main, cas éprouvés dans les deux sens) ; suite entière lancée avant le push.
- **Commits** : `d2cb6d9`.
- **Reste ouvert** : à essayer à l'écran par Tristan, puis à ouvrir au groupe de 2de dans « Conduite de séance ». Vérifié : la logique, les calculs et le moteur par les tests. Construit (non vérifié par une source) : les chiffres internes du centre et des camions, signalés en pied de document.
