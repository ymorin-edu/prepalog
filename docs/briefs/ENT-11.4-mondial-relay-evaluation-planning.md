# Brief de séance — ENT-11.4 Mondial Relay, évaluation : chauffeurs et camions du samedi (2de, poste B — transport, évaluation)

**Statut** : livré (26/10/2026, `pret: true, ouverture: 'prof'`, en ligne, cachée aux élèves) ; à essayer à l'écran par Tristan avant de l'ouvrir
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

**Demande au moteur (vérifiée, écrite le 26/10/2026)** : l'option `planning` de `seanceEntreprise` est un objet statique, compilé une fois
(WeakMap dans `core/types/planning.js`) : le moteur ne sait pas tirer un planning (lignes, cartes, aléa) par élève. Demande : accepter
`planning: (graine) => objet`, évalué à l'ouverture avec la graine posée par `tirage: true`. En attendant, contournement sans toucher à `core/` :
un moteur par graine (cache dans `activites/mondial-relay-evaluation-planning.js`), les jalons relisant le jeu dans la base de l'élève.

## 11. Questions ouvertes

- [ ] Tournées en propre ou sous-traitées (§2) : à vérifier avant d'écrire le contenu.
- [ ] Samia (responsable d'exploitation) et Kevin : prénoms construits.

## Compte rendu (26/10/2026, Claude Sonnet)

**Livré** : `activites/mondial-relay-evaluation-planning.js` (ENT-11.4, 2de, OTM-C2.2 + C3.2, évaluation, copie rendue, `pret: true, ouverture: 'prof'`),
`contenus/mondial-relay-ent114.js` + `-donnees.js` (données pures et solveur), `contenus/questions/ENT-11.4.js`, `contenus/corriges/ENT-11.4.js`,
logo texte `contenus/trames/logos/mondial-relay-texte.svg`, ligne n° 11 dans `ENTREPRISES` (`activites/index.js`), bloc `outils/test/mr-11.4.mjs`
(+ aides `outils/test/mondial-relay/commun.mjs`), inscrit dans `BLOCS` et dans `GROUPES[6]` de `outils/test.mjs`.

**Poids codés** (total 20) : Avant de commencer 4 (`ouverture.part`) · tous les tournées posées 3 · permis/camions 3 · repos 11 h 3 · conduite et pause 3 ·
après l'imprévu 3 · message à Samia 1.

**Écarts au brief** : (1) trois questions au fil sont `reflexion` (non notées) : les poids ne laissent aucune place à des points de plus ; (2) le texte de
l'arrêt maladie n'a pas été relu à une source : il n'est pas cité, la question est signalée ; (3) T5 dépasse 4 h 30 de conduite avec une seule carte : la
pause de 45 min est dite « en route », la conduite jugée est plafonnée à 270 min ; (4) `contenus/mondial-relay.js` n'a pas six clés requises par
`composerSeance` (VOCAB, CATALOGUE, SUPPLIERS, SUP_BY_ID, CUSTOMERS, CM, baseDeDepart, THEME) : fournies par le fichier de la séance ; (5) tournées « en propre »
vs sous-traitées (§11) : construit, non vérifié.

**Tirage** : un chauffeur au repos (aucune tournée possible), un tardif, un permis B, trois libres ; T5 de 4 h 10 à 4 h 50 ; imprévu parmi panne / malade / T2 doublée,
choisi pour toujours toucher le planning. 300 graines contrôlées : zéro jeu de secours, une solution juste avant et après l'imprévu, jugée par le vrai moteur.

**Vérifié** (bloc `mr-11.4`, 18 cas verts) : 3 parcours juste = 20/20 égal à `noter(db)` ; chaque piège fait tomber son jalon ; sabotages des règles (repos, fenêtre,
type de camion) ; inaction 0, ouverture seule 4, copie vide 0 ; copie rendue et verrou ; deux élèves, deux jeux ; aucun message « de combien » ; aucune requête externe.
Suite `socle fb-6.8 smoby dependances questions` verte, sauf le cas `docs/EN-COURS.md` (chemins d'autres agents absents de ce worktree, étranger à cette séance).
**Non vérifié** : le rendu à l'écran par Tristan (lisibilité des lignes, bulle des camions, libellés de Samia).
