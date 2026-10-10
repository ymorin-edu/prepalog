# Lot 3 de la notation pondérée — propositions de poids (à valider par Tristan)

**Statut** : propositions du 10/10/2026, **validées par Tristan et codées le même jour** (lot 3 livré, voir le compte rendu de `NOTATION-ponderation.md`). Suite de `docs/briefs/NOTATION-ponderation.md` (règle 0.1 :
total 20, le poids va au cœur de la compétence, la forme ≤ ~15 %, aucun jalon à 0, regroupement par bloc).
Séances : Picard ENT-4.2 et 4.3, Smoby ENT-5.5 et 5.6, Cdiscount ENT-2.5.

## Point 0.3 — les élèves qui ont fini gardent-ils leur note ? (lu dans le code, pas essayé sur le vrai site)

Oui, sans correctif moteur. La note du Suivi est **rangée** (`score`, `max`, `meilleur`) au moment où l'élève travaille, jamais
recalculée à la lecture. Quand le barème d'une séance change, `meilleurScore` (`core/notes.js`) convertit l'ancien meilleur en
**proportion** du nouveau maximum : un élève à 9 jalons sur 9 reste à 20/20, un élève à 7 sur 9 reste à 15,56/20, jamais
recalculé à la baisse (même mécanisme qu'à la repondération d'ENT-5.1 le 07/10/2026). Si un élève rouvre la séance, sa note ne
peut que monter. ENT-2.5 est une copie rendue : une copie déjà rendue est figée, et la séance est fermée tant que Tristan ne l'ouvre pas.

## ENT-4.2 — Picard, deux camions, un seul quai (30 jalons, C1.4 + C1.3)

Cœur : organiser la réception selon l'aléa (ordre des camions, C1.3.2), puis décider palette par palette, surtout sur les
pièges (B2 chaude malgré un ticket parfait, B3 étiquette déchirée, B4 carton manquant, A2 deux références). Une ligne du bandeau
par palette. Dans une palette : comptage 0,25 · décision 0,5 (palette sans piège) à 1,5 (B2, B3) · réserve écrite 0,5.

| Bloc (ligne du bandeau) | Jalons | Points |
|---|---|---|
| L'ordre des deux camions | `ordre` | 4 |
| Les deux enregistreurs | `ticket-A` 0,5 · `ticket-B` 0,5 | 1 |
| Palette A1 | comptage 0,25 · décision 0,5 · réserve 0,5 | 1,25 |
| Palette A2 (deux références) | comptage 0,25 · décision 1 · réserve 0,5 | 1,75 |
| Palette A3 | comptage 0,25 · décision 0,5 · réserve 0,5 | 1,25 |
| Palette B1 | comptage 0,25 · décision 0,5 | 0,75 |
| Palette B2 (chaude malgré le ticket) | comptage 0,25 · décision 1,5 · réserve 0,5 | 2,25 |
| Palette B3 (étiquette déchirée) | comptage 0,25 · décision 1,5 · réserve 0,5 | 2,25 |
| Palette B4 (carton manquant) | comptage 0,25 · décision 1 · réserve 0,5 | 1,75 |
| Palette B5 | comptage 0,25 · décision 0,5 | 0,75 |
| Pas de « sous réserve de déballage » | `deballage` | 1 |
| Les signatures du chauffeur | `signature-A` 0,5 · `signature-B` 0,5 | 1 |
| Les lots rentrés en chambre froide | `rentre-A` 0,5 · `rentre-B` 0,5 | 1 |
| **Total** | | **20** |

## ENT-4.3 — Picard, la réception de nuit (10 jalons, C1.4.2, erreur induite)

Cœur : trouver ce que Mathis a laissé passer (N2 chaude, N3 manquant), ne pas accuser N1 à tort, bloquer ce qu'il faut, puis
protester dans le délai avec les bonnes références et la bonne quantité.

| Bloc (ligne du bandeau) | Jalons | Points |
|---|---|---|
| Diagnostic : N2 acceptée à tort, avec sa preuve | `diag-n2` | 3 |
| Diagnostic : le manquant de N3 et sa quantité | `diag-n3` | 3 |
| Diagnostic : « sous réserve de déballage » et délai | `diag-deballage` 1,5 · `diag-delai` 1,5 | 3 |
| Diagnostic : N1 n'est pas accusée | `diag-n1` | 2 |
| Le blocage | `N2-bloquee` 2 · `bloque-autres` 1 | 3 |
| La protestation | `prot-refs` 1,5 · `prot-palettes` 1,5 · `prot-constat` 3 | 6 |
| **Total** | | **20** |

## ENT-5.5 — Smoby, ranger et saisir l'entrée (9 jalons, C1.5 + C1.6)

Cœur : moitié rangement (C1.5, les quatre palettes à égalité), moitié entrée en stock (C1.6, le piège des cartons manquants de
P4 et le litige de P3 pèsent le plus). Le message à Kuehne+Nagel est la partie « forme » (1,5 sur 20).

| Bloc (ligne du bandeau) | Jalons | Points |
|---|---|---|
| Palette P1 bien rangée | `P1-rangee` | 2,5 |
| Palette P2 bien rangée | `P2-rangee` | 2,5 |
| Palette P3 bien rangée | `P3-rangee` | 2,5 |
| Palette P4 bien rangée | `P4-rangee` | 2,5 |
| Entrée en stock : P1 et P2 | `saisie-p1-p2` | 2 |
| Entrée en stock : P4 et ses cartons manquants | `saisie-p4` | 3 |
| P3 en litige, pas en stock disponible | `p3-litige` | 2 |
| L'écran Stock lu juste | `stock-lu` | 1,5 |
| Réponse à Kuehne+Nagel | `message-kn` | 1,5 |
| **Total** | | **20** |

## ENT-5.6 — Smoby, la palette de la commande de Noël (9 jalons, C2.1)

Cœur : les bonnes lignes et le réapprovisionnement (la rupture du Trotteur), puis la palette stable (lourds en bas, fragiles en
haut, poids, hauteur). Film et étiquettes sont des gestes courts (2,5 sur 20). Le parcours en serpentin sans marge est le point
discutable : je propose 3 ; à baisser si Tristan le juge trop sévère pour de la 2de.

| Bloc (ligne du bandeau) | Jalons | Points |
|---|---|---|
| Les lignes prélevées | `lignesJustes` | 4 |
| Le réapprovisionnement | `reappro` | 3 |
| Lourds en bas, fragiles en haut | `lourds` 2 · `fragiles` 2 | 4 |
| Poids et hauteur de la palette | `poids` 2 · `hauteur` 1,5 | 3,5 |
| Film et étiquettes | `film` 1 · `etiquettes` 1,5 | 2,5 |
| Le parcours le plus court | `parcours` | 3 |
| **Total** | | **20** |

## ENT-2.5 — Cdiscount, le compte à rebours (12 jalons, évaluation, C1.6)

Cœur : choisir quoi recompter (la liste) et décider les trois écarts. Le tableur est l'outil, pas le but (4,5 sur 20). Le compte
rendu à Nadia compte 1,5 (il porte aussi un calcul de valeur).
**À noter** : le brief et l'en-tête de l'activité disent 11 jalons, le code en a 12 (le jalon `export` est arrivé avec l'écran
Extractions, commit `d31cbc8`) ; la note actuelle est bien réussis / 12 × 20.

| Bloc | Jalons | Points |
|---|---|---|
| Le tableur | `export` 1 · `ecart` 1 · `si` 1 · `synthese` 1,5 | 4,5 |
| La liste à recompter | `liste` | 3 |
| Le comptage | `comptage` 2 · `ecarts` 1 | 3 |
| Les trois décisions | `rayon` 2 · `regul` 2,5 · `recompter` 2,5 | 7 |
| Le taux d'écart | `taux` | 1 |
| Le compte rendu | `compteRendu` | 1,5 |
| **Total** | | **20** |

## Ce que coûtera la construction (une fois les tableaux validés)

Par séance : `bareme: 20` et des `poids` (+ `groupe` pour le bandeau) dans le fichier de contenu, réécriture en points des cas
de test qui lisent « x/9 », « x/10 », « x/30 », « x/12 » (**réécriture de cas existants : à dire à Tristan**), corrigé et
commentaires d'en-tête, ligne dans `decisions.md`. ENT-2.5 est une évaluation : le bandeau de fin n'y est pas montré, les blocs
servent au détail que voit l'enseignant.
