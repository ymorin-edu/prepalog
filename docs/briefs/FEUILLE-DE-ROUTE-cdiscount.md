# Feuille de route Cdiscount — avancer avec Claude Code (CC)

*Préparée par Cowork le 03/10/2026. Coche chaque étape quand elle est faite.*
*Tout ce que CC doit savoir est dans `docs/briefs/` du dépôt : tu n'as qu'à coller la phrase d'amorce.*

## Les règles qui valent pour chaque étape

- **Une étape = une nouvelle conversation CC.** Tu la fermes quand CC a commité et poussé.
- **Choisis le modèle avant de coller la phrase** (indiqué à chaque étape). Opus seulement pour le geste tableur et la
  première séance qui s'en sert.
- **Avant une étape qui touche le moteur** (marquée ⚙), ouvre `docs/EN-COURS.md` : si un autre chantier y est inscrit,
  attends qu'il soit effacé.
- **Tu juges à l'écran, pas dans le code.** Quand CC dit « à valider », joue la séance ou la page d'essai.
- **Les questions des briefs sont déjà tranchées (03/10)** : CC enchaîne et te liste à la fin ce qu'il a choisi seul.
  Chaque brief a aussi une liste « Détails tranchés par Cowork » : c'est là que tu corriges ce qui te gêne.
- Toutes les séances arrivent **fermées aux élèves** : tu les ouvres toi-même dans « Conduite de séance ».
- **Niveau standard / confirmé** : réglé sur la fiche de chaque élève (chantier tiers-temps). Pour 2.1, 2.2, 2.3, 2.4
  et 2.6, **joue chaque séance deux fois, une en standard et une en confirmé** : le confirmé a plus de lignes ou de
  documents, rien d'autre ne doit changer, et le mot « confirmé » ne doit apparaître nulle part côté élève.

---

## Étape 0 — Attendre la fin de la chaîne Picard

- [ ] Picard P6 (ENT-4.4, tirage d'un jeu par élève) est livré : `docs/EN-COURS.md` ne contient plus de chantier Picard.

Rien à coller. *(La vue Planning passe après Cdiscount.)*

---

## Étape 1 — Le bouton « Fiche d'intention » ⚙ *(peut aussi se faire plus tard, avant l'étape 13)*

| | |
|---|---|
| **Modèle** | **Sonnet** |
| **Durée annoncée** | 30 à 45 min |
| **Ce qu'il construit** | un bouton visible de toi seul, dans l'onglet Corrigés et dans le bandeau des séances, qui ouvrira la fiche d'intention d'un scénario |
| **Brief** | `docs/briefs/MOTEUR-fiche-intention.md` |

```
Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis implémente le brief docs/briefs/MOTEUR-fiche-intention.md. Annonce la durée avant de commencer, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§7).
```

- [ ] CC a commité et poussé (aucun bouton visible pour l'instant : aucune fiche n'est encore déclarée).

---

## Étape 2 — Le statut « Annulée » et le niveau de l'élève dans la séance ⚙

| | |
|---|---|
| **Modèle** | **Sonnet** |
| **Durée annoncée** | 40 min à 1 h |
| **Brief** | `docs/briefs/MOTEUR-statut-annulee.md` |

```
Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis implémente le brief docs/briefs/MOTEUR-statut-annulee.md. Annonce la durée avant de commencer, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§6).
```

- [ ] CC a commité et poussé, suite de tests verte.

---

## Étape 3 — ENT-2.1 « Le stock raconte » recadrée

| | |
|---|---|
| **Modèle** | **Sonnet** |
| **Durée annoncée** | 1 h 30 à 2 h 30 |
| **Ce qu'il construit** | la commande annulée de la cliente, le constat « 2 » saisi « 1 », la 7e ligne « Ce qui cloche » |
| **Brief** | `docs/briefs/ENT-2.1-recadrage.md` |

```
Lis docs/briefs/COORDINATION-cdiscount.md puis implémente le brief docs/briefs/ENT-2.1-recadrage.md (le statut « Annulée » doit être livré : MOTEUR-statut-annulee.md). Annonce la durée, dis-moi si un point du brief contredit le code, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
```

- [ ] J'ai lu la liste de ce que CC a choisi seul (nom de la cliente, textes) et corrigé ce qui me gêne.
- [ ] J'ai joué la séance : CMD-731602 est « Annulée », le stock trouvé décroche à partir de CMD-731530, 6/6 avec la bonne
  réponse ; citer CMD-731602 ou RET-26-0091 fait tomber le bon jalon.

## Étape 4 — Trame et corrigé d'ENT-2.1 (Cowork, pas CC)

- [ ] Dans une conversation **Cowork** : « Régénère la trame élève et le corrigé d'ENT-2.1 Cdiscount, séance validée à
  l'écran. »

---

## Étape 5 — La renumérotation

| | |
|---|---|
| **Modèle** | **Sonnet** |
| **Durée annoncée** | 30 à 45 min |
| **Brief** | `docs/briefs/CDISCOUNT-renumerotation.md` |

```
Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis applique le brief docs/briefs/CDISCOUNT-renumerotation.md. Annonce la durée, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§6).
```

- [ ] Sous le logo Cdiscount : ENT-2.1, ENT-2.3, ENT-2.4, toutes fermées aux élèves.

---

## Étape 6 — ENT-2.3 « Inventaire tournant » recadrée ⚙ (lot 0 : écran Inventaire)

| | |
|---|---|
| **Modèle** | **Sonnet** |
| **Durée annoncée** | 2 à 3 h |
| **Ce qu'il construit** | l'écran Inventaire qui ne fait compter qu'une partie de l'allée ; la liste redonnée à Nadia ; l'aléa de l'oubli ; « Absent » |
| **Brief** | `docs/briefs/ENT-2.3-inventaire-recadre.md` |

```
Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis implémente le brief docs/briefs/ENT-2.3-inventaire-recadre.md : d'abord le lot moteur du §7 (écran Inventaire, commité à part), puis la séance. Annonce la durée, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
```

- [ ] J'ai joué la séance **trois fois** : liste exacte ; liste sans CAB-USBC-1M (le préparateur la signale) ; « Absent ».
- [ ] **À dire aux élèves absents en 2.2** (le mot n'est écrit nulle part) : « réponds “Absent” à Nadia ».

## Étape 7 — Trame d'ENT-2.3 (Cowork)

- [ ] « Fais la trame élève d'ENT-2.3 Cdiscount (Word/PDF), séance validée à l'écran. »

---

## Étape 8 — Le geste tableur ⚙

| | |
|---|---|
| **Modèle** | **Opus** |
| **Durée annoncée** | 6 à 8 h, en plusieurs lots (CC te dira où il coupe) |
| **Ce qu'il construit** | le bouton « Exporter », le menu « Fichiers » avec « Déposer mon fichier », le contrôle des formules et des valeurs, les trois sortes de retour, une page d'essai |
| **Brief** | `docs/briefs/MOTEUR-geste-tableur.md` |

```
Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis le brief docs/briefs/MOTEUR-geste-tableur.md. Annonce la durée avant de commencer, découpe en lots, fabrique la page d'essai, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§12).
```

- [ ] Sur la page d'essai, j'ai déposé **un fichier fait sous Excel et un fait sous LibreOffice** : les deux passent.
- [ ] J'ai vu les trois retours (guidage, entraînement, évaluation) et le refus d'un .csv.
- [ ] Si CC a modifié les règles Firebase : je les ai publiées dans la console.

---

## Étape 9 — ENT-2.2 « Ce que disent les chiffres »

| | |
|---|---|
| **Modèle** | **Opus** (première séance sur le geste tableur) |
| **Durée annoncée** | 3 à 4 h |
| **Brief** | `docs/briefs/ENT-2.2-ce-que-disent-les-chiffres.md` |

```
Lis docs/briefs/COORDINATION-cdiscount.md, le compte rendu de docs/briefs/MOTEUR-geste-tableur.md (API livrée), puis implémente le brief docs/briefs/ENT-2.2-ce-que-disent-les-chiffres.md. Annonce la durée, dis-moi si un point du brief contredit l'API livrée, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
```

- [ ] J'ai fait la séance en élève jusqu'au message « À recompter » ; quatre références ressortent.

## Étape 10 — ENT-2.4 « Régularisé à l'aveugle » + export

| | |
|---|---|
| **Modèle** | **Sonnet** |
| **Durée annoncée** | 2 à 3 h |
| **Brief** | `docs/briefs/ENT-2.4-regularise-export.md` |

```
Lis docs/briefs/COORDINATION-cdiscount.md, le compte rendu de docs/briefs/MOTEUR-geste-tableur.md (API livrée), puis implémente le brief docs/briefs/ENT-2.4-regularise-export.md. Annonce la durée, dis-moi si un point du brief contredit le code, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
```

- [ ] J'ai lu le message du vendeur (fictif) et la réponse attendue ; 8/8 avec la bonne réponse.

## Étape 11 — ENT-2.6 bonus

| | |
|---|---|
| **Modèle** | **Sonnet** |
| **Durée annoncée** | 2 à 3 h |
| **Brief** | `docs/briefs/ENT-2.6-bonus.md` |

```
Lis docs/briefs/COORDINATION-cdiscount.md, le compte rendu de docs/briefs/MOTEUR-geste-tableur.md (API livrée), puis implémente le brief docs/briefs/ENT-2.6-bonus.md. Annonce la durée, dis-moi si l'API du dépôt ne sait pas contrôler un point du §7, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
```

- [ ] J'ai fait le bonus : le piège de la date (BAT-10K) et le piège de la fréquence se voient.

## Étape 12 — ENT-2.5 « Le compte à rebours » (évaluation)

| | |
|---|---|
| **Modèle** | **Sonnet** |
| **Durée annoncée** | 3 à 4 h |
| **Brief** | `docs/briefs/ENT-2.5-compte-a-rebours.md` |

```
Lis docs/briefs/COORDINATION-cdiscount.md, docs/briefs/DECISION-jeu-unique-evaluations.md, le compte rendu de docs/briefs/ENT-4.4-picard-evaluation.md (API du tirage) et celui de docs/briefs/MOTEUR-geste-tableur.md (API du dépôt), puis implémente le brief docs/briefs/ENT-2.5-compte-a-rebours.md. Annonce la durée, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
```

- [ ] J'ai passé l'évaluation avec **deux identifiants d'élève** : deux allées différentes, même difficulté, aucun retour.
- [ ] La copie rendue apparaît dans le suivi avec le corrigé de cet élève.

---

## Étape 13 — Trames et fiche d'intention (Cowork)

- [ ] « Fais les trames élève d'ENT-2.2, ENT-2.4 et ENT-2.6 Cdiscount (Word/PDF), séances validées à l'écran. »
- [ ] « Fais la fiche d'intention pédagogique de la série Cdiscount (Word + PDF), à partir des briefs, des comptes rendus et
  du code livré. » Puis, quand je l'ai relue : CC (Sonnet) la déclare dans `ENTREPRISES` (`intention`).

---

## Récapitulatif

| Étape | Quoi | Modèle | Durée | ⚙ |
|---|---|---|---|---|
| 0 | Fin de la chaîne Picard | — | — | — |
| 1 | Bouton fiche d'intention (C0) | Sonnet | 30-45 min | oui |
| 2 | Statut « Annulée » + niveau dans la séance (C1) | Sonnet | 40 min-1 h | oui |
| 3 | ENT-2.1 recadrée (C2) | Sonnet | 1 h 30-2 h 30 | non |
| 4 | Trame + corrigé 2.1 | Cowork | — | non |
| 5 | Renumérotation (C3) | Sonnet | 30-45 min | non |
| 6 | ENT-2.3 recadrée + lot Inventaire (C4) | Sonnet | 2-3 h | oui (lot 0) |
| 7 | Trame 2.3 | Cowork | — | non |
| 8 | Geste tableur (C5) | **Opus** | 6-8 h | oui |
| 9 | ENT-2.2 (C6) | **Opus** | 3-4 h | non |
| 10 | ENT-2.4 (C7) | Sonnet | 2-3 h | non |
| 11 | ENT-2.6 bonus (C9) | Sonnet | 2-3 h | non |
| 12 | ENT-2.5 évaluation (C8) | Sonnet | 3-4 h | non |
| 13 | Trames 2.2 / 2.4 / 2.6 + fiche d'intention | Cowork | — | non |

*Les durées sont des estimations de Cowork ; CC annonce la sienne au début de chaque étape et elle fait foi.*
