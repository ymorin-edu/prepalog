# Brief de séance — ENT-11.4 Mondial Relay, évaluation : chauffeurs et camions du samedi (2de, poste B — transport, évaluation)

**Statut** : à implémenter (aucune vue nouvelle : peut se construire avant la vue Tri, version courte du cadrage §7)
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé
**Modèle** : Sonnet

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-11.4 |
| `id` | `mondial-relay-evaluation-planning` |
| Titre / desc | « Mondial Relay — évaluation : le samedi du pic » / « Agent d'exploitation de l'agence de Buchères : affecter un chauffeur et un camion à chaque tournée des Points Relais du samedi, en respectant permis, temps de conduite et repos, puis replanifier après un imprévu. » |
| Niveau(x) | 2de |
| Compétence(s) | **OTM-C2.2** (réserver les moyens, planifier), **OTM-C3.2** (temps de conduite et de repos) ; D2 |
| Temps pédagogique | **évaluation** (travaillées en 5.7 et 6.8) |
| Notation | copie rendue, jalons pondérés sur 20, un jeu tiré par élève |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise

Vérifié : Buchères est aussi une agence (livraison et collecte dans l'Aube et la Marne) ; tournées des Points Relais du
mardi au samedi ; le pic double les volumes. **Construit** : les 5 tournées (celles du plan de tri de 11.2, T1 à T5), les
chauffeurs, les camions (porteurs 12 t et fourgons 3,5 t : permis C ou B), les horaires.
**À vérifier** : les tournées Mondial Relay sont-elles faites par des salariés ou des sous-traitants ? (souvent
sous-traitées dans la messagerie ; si c'est vérifié, l'imprévu devient « le sous-traitant manque un chauffeur »).

## 3. Objectif

Sans aide, l'élève remplit le planning du samedi en respectant les règles déjà vues (permis, 4 h 30 puis 45 min de pause,
9 h par jour, 11 h de repos) et replanifie après un aléa.

## 4. Déroulé (≈ 45 min)

1. **Avant de commencer**, notées (4 / 20) : questions clés de 5.7 et 6.8 (cle: true dans `contenus/questions/ENT-6.8.js`),
   tirées par élève.
2. **Le planning du samedi** (vue `planning`, cas enlèvements × chauffeurs + camions, comme 6.8) : 5 tournées, 6
   chauffeurs, 5 camions ; contraintes tirées : un chauffeur a fini tard vendredi (repos de 11 h), un a seulement le
   permis B, une tournée longue (T5 Est) frôle les 4 h 30.
3. **L'imprévu de 6 h** (tiré parmi 3) : un camion en panne / un chauffeur malade / une tournée doublée par le volume du
   pic (deux camions pour T2). L'élève replanifie.
4. **Message à Samia**, responsable d'exploitation (phrases à choisir, comme 6.8) : ce qui change et pourquoi.
5. Copie rendue.

## 4 bis. Questions au fil — propositions (notées, sans retour)

| Geste | Question | Pourquoi |
|---|---|---|
| Chauffeur au repos posé (s'il le pose) ou évité | « Pourquoi Kevin ne peut-il pas partir à 6 h ? » (cliquer la ligne de sa fin de service hier) | règle appliquée à **son** planning |
| Tournée T5 affectée | « Ton chauffeur de T5 doit-il faire une pause ? » (calculé sur sa durée tirée) | 4 h 30, valeur tirée |
| **Éco-droit**, après l'imprévu | « Le chauffeur malade prévient à 5 h 30. Que doit-il fournir à son employeur ? » (arrêt de travail sous 48 h ; rien ; une lettre de démission) — texte : Code de la sécurité sociale, art. L321-2 (**à relever**) | règle appliquée au cas tiré (seulement si l'imprévu tiré est la maladie ; sinon une question sur le repos) |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| 1 | Chaque tournée a un chauffeur et un camion | planning | 3 |
| 2 | Permis compatible avec chaque camion | règles | 3 |
| 3 | Repos de 11 h respecté | règles | 3 |
| 4 | Conduite et pause : aucune journée hors règle | règles | 3 |
| 5 | Après l'imprévu : planning de nouveau complet et dans les règles | replanifier | 3 |
| 6 | Message à Samia : changements justes (phrases) | rendre compte | 1 |
| — | Avant de commencer | questions | 4 |

## 6 bis. Tirage

Graine = élève : noms des chauffeurs (banque), fins de service de la veille, durées des tournées (bornes : T5 entre 4 h 10
et 4 h 50), imprévu (1 parmi 3). Contrainte : au moins une solution juste existe toujours (vérifiée par un solveur dans le
test, comme le calage de 6.3).

## 7. Demandes au moteur

Aucune a priori : le cas 3 de la vue Planning (5.7, 6.8) fait déjà permis, conduite, repos et aléa. Vérifier qu'il tire
ses données par élève (sinon, demande au moteur : `planning` + `tirage`).

## 11. Questions ouvertes

- [ ] Tournées en propre ou sous-traitées (§2) : à vérifier avant d'écrire le contenu.
- [ ] Samia (responsable d'exploitation) et Kevin : prénoms construits.
