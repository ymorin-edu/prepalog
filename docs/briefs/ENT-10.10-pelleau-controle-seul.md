# Brief de séance — ENT-10.10 Transports Pelleau — le contrôle, seul (CAP OL, entraînement CAP-C1.4)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, docs/briefs/ENT-10.9-pelleau-controler.md puis docs/briefs/ENT-10.10-pelleau-controle-seul.md en entier. Les poids du §5 sont validés par Tristan ; annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : à implémenter · **Date** : 18/10/2026 · Cowork, sur délégation · **Modèle** : Sonnet · **Durée estimée** : ≈ 3 h.

---

## 0. Règles communes

Feuille de route Pelleau ; **jeudi 21 mai, 8 h**. Même séance qu'ENT-10.9, **seul** : Erwan est au bureau, aides de comptage éteintes chez le
confirmé et le standard (« Accompagné » : rappel « Fais le tour de la palette » si la vue lit le niveau, sinon standard), anomalies tirées **avec un
niveau de plus** : `produit` (l'étiquette ne dit pas l'article de la feuille : la palette d'Agri-Kerlann est notée « terreau » et l'étiquette dit
« engrais »).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.10 / `pelleau-controle-seul` |
| Titre / desc | « Transports Pelleau — le contrôle, seul » / « Contrôler seul les palettes de la ramasse, écrire les réserves, les faire signer et rendre compte. » |
| Compétence / temps | `CAP-C1.4`, `temps: 'entrainement'` |
| Notation | `bareme: 20`, `parcours`, `correction`, `bilanDetail`, `precedente: 'pelleau-controler'` ; `niveauxPrevus: ['confirme']` ; `questions: 'ENT-10.10'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 4. Déroulé (≈ 40 min)

Comme ENT-10.9 (quai `pelleau-quai-110`, `commence: 'controle'`, feuille de ramasse, signature de Loïc, phrases à Erwan). Motifs `['avarie',
'manquant', 'produit']`, `libelles.produit` : `{ nom: 'Article différent' }`.

## 4 bis. Questions au fil — choix de Cowork : Q1, Q2, Q3

| id | Geste | Qui | Question (juste en gras) | Notée | Corrigée |
|---|---|---|---|---|---|
| `reserve-precise` (Q1) | `quai:pelleau-quai-110:cloturer` | Erwan | « Quelle réserve vaut quelque chose ? » — **« P2 : 2 sacs percés »** · « Marchandise en mauvais état » · « Sous réserve de déballage » | **1,5** | tout de suite (le quai est clos) |
| `article-different` (Q2) | `quai:pelleau-quai-110:valider` (1re palette) | Erwan | « L'étiquette dit « engrais », la feuille dit « terreau ». Tu fais quoi ? » — **je l'écris en réserve : article différent, et on prévient le client** (`reserve`) · je change l'étiquette (`etiquette`) · rien, c'est du jardin pareil (`rien`) | **1,5** | **au bilan** (proche d'un jalon chez les élèves qui ont tiré `produit`) |
| `rendre-meme-3` (Q3) | `messagerie:phrase:fin` | Erwan | « Pourquoi le client doit-il savoir qu'un sac était percé **à l'arrivée** ? » — **pour qu'on ne nous reproche pas, au départ, un sac abîmé dans nos racks** (`preuve`) · pour qu'il nous paie plus (`payer`) · ça ne le regarde pas (`regarde`) | **1** | tout de suite (C. civ. 1932) |

## 4 ter. Avant de commencer

Banque d'ENT-10.9 (mêmes ids), plus `article` (« Un article différent, c'est… » **un produit qui n'est pas celui du document**) et `img-etiquette`.

## 5. Jalons — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

Comme ENT-10.9 : contrôler 8 · réserves et signature 5 · rendre compte 3 · questions 4 = 20.

## 6 bis. Tirage

2 palettes à problème, **une de chaque client** : 1 `facile` + 1 parmi `moyen` (`cache`, `manquant`) ou `difficile` (`produit`, sur Agri-Kerlann seulement),
le difficile une fois sur trois ; 1 piège `couche-normale`. Ordre des palettes dans les cases : celui de la ramasse tirée. Confirmé : pas de bonus
(même camion), aides éteintes.

## 7. Demandes au moteur

Aucune. **À vérifier** : `produit` sur une palette de sacs (l'étiquette lue à ③ dit l'article).

## 8. Tests (bloc `pelleau-ctrl`)

300 graines : deux clients différents, au moins une avarie, `produit` ≈ un tiers ; parcours juste sur 3 graines → 20/20 ; inaction → 0 ; réserve « produit »
avec la mauvaise référence → réserve ✗.

## 9 à 11

Pas de nouvelle trame (celle d'ENT-10.9). Critère : 40 min. Question ouverte : aucune.

---

## Compte rendu *(rempli par Claude Code à la livraison)*
