# Brief de séance — ENT-13.6 Stellantis Sochaux, le bord de ligne (Tle, temps 2, guidage C2.3)

**Statut** : livré (27/10/2026, `pret: true, ouverture: 'prof'`)
**Date du brief** : 27/10/2026 — Claude, d'après le cadrage validé par Tristan (§4 temps 2, §5) et son choix du 27/10 (« Les quatre,
dans l'ordre conseillé », délégation des poids et des questions au fil comme pour les blocs précédents)
**Modèle** : Opus (première séance de la vue nouvelle) ; vue : `docs/briefs/MOTEUR-vue-bord-de-ligne.md`

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-13.6 / `stellantis-bord-de-ligne` |
| Titre / desc | « Stellantis Sochaux — le bord de ligne » / « Tenir l'approvisionnement de quatre postes de la ligne 3008 / 5008 : lire les cartes kanban, envoyer les robots à temps, calculer ce que tient un poste. » |
| Niveau / compétence / temps | `['tle']` / **C2.3** (C2.3.1 approvisionner une ligne) / guidage |
| Notation | jalons pondérés, `bareme: 20` |

## 2. Vérifié / construit

- **Vérifié** (cadrage §2) : une voiture par minute ; 3008 (environ 70 %) et 5008 (environ 30 %) sur la même ligne ; trois quarts des
  pièces arrivent au bord de ligne sur des robots autonomes qui portent une tonne ; le stock au bord de ligne ne couvre que quelques
  heures ; une chaîne à l'arrêt immobilise environ 1 200 personnes ; la 5008 a sept places (troisième rang), pas la 3008.
- **Construit** : les quatre postes, les quantités par contenant, les poids, les délais des robots, les stocks, la séquence ; le kanban
  à deux contenants est une **méthode générale** de l'industrie, présentée comme telle (on ne sait pas comment Sochaux appelle ses pièces).
- Retour dans l'usine en **février 2028** (temps 2) : l'élève, en deuxième PFMP, revient dans l'équipe de Karim.

## 3. Déroulé (≈ 55 min) — mardi 1er février 2028, 6 h, montage

1. **Avant de commencer** (non noté, 3 questions tirées dont une d'éco-droit).
2. **Fiche « Le kanban »** (document « Le kanban à deux contenants ») : quand la carte tombe, ce qu'elle dit, pourquoi deux contenants.
3. **Bord de ligne, matinée guidée** : 6 h - 7 h, quatre postes (roues, rétroviseurs, planches de bord, sièges du 3e rang), deux
   robots ; ralenti, « tient N voitures » affiché, Karim arrête la ligne au premier geste.
4. **Fiche « Combien de temps tient un poste ? »** : le poste 2 (12 rétroviseurs en cours, 30 d'avance, 2 par voiture) : combien de
   voitures il tient (21), dans combien de minutes le bac en cours sera vide (6), au plus tard combien de minutes après la carte
   envoyer le robot (15 − 5 = 10).
5. **Compte rendu** à Karim (phrases à choisir, dont une sur **sa** matinée).

## 4 bis. Questions au fil (décidées par Claude)

| Geste | Question | Notée |
|---|---|---|
| après la fiche « Le kanban » | Pourquoi deux contenants par poste plutôt qu'un ? | oui |
| après la matinée | Pourquoi mettre deux cartes dans le même robot ? | oui |
| après la matinée | ★ Éco-droit : pourquoi l'usine garde-t-elle si peu de pièces au bord de ligne ? (un stock immobilise de l'argent et de la place ; le flux tendu en contrepartie exige des livraisons sûres) | oui |
| après le compte rendu | réflexion : ce qui t'a paru le plus dur | non |

## 4 ter. Avant de commencer (non noté)

Banque : ce qu'est un bord de ligne · ce que veut dire « une voiture par minute » · ★ les robots roulent dans l'allée : qui doit
assurer la sécurité des salariés (l'employeur, L4121-1, résumé).

## 5. Poids (sur 20)

Le kanban 3 (1 × 3) · la matinée : voitures 4, aucun arrêt 3, robots pleins 2 · la couverture 3 (1 × 3) · compte rendu 2 · questions 3.
Pas de forme notée (le compte rendu est fait de phrases).

## 7. Demandes au moteur

La vue « Bord de ligne » (`docs/briefs/MOTEUR-vue-bord-de-ligne.md`), et l'option `ligne` de la fabrique en fiches (`contenus/fabrique-fiches.js`).

## Compte rendu

Livré le 27/10/2026 avec la vue. Voir `docs/decisions.md`.
