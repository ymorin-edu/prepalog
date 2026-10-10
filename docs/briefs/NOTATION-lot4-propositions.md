# Lot 4 de la notation pondérée — propositions de poids (à valider par Tristan)

**Statut** : propositions du 10/10/2026, **validées par Tristan et codées le même jour** (lot 4 livré, voir le compte rendu de `NOTATION-ponderation.md`). Suite de `docs/briefs/NOTATION-ponderation.md` (règle 0.1 :
total 20, le poids va au cœur de la compétence, la forme ≤ ~15 %, aucun jalon à 0) et du lot 3 livré.
Séances du lot : Spartoo ENT-1.1 ; Cdiscount ENT-2.1, 2.2, 2.3, 2.4, 2.6 ; Boost ENT-3.1.
Spartoo ENT-1.2 et 1.3 restent gelées (leur pondération viendra avec leur refonte).

## Ce que le lot change, et le point 0.3 (lu dans le code, pas essayé sur le vrai site)

Six des sept séances déclarent `notation: 'avancement'` : le Suivi y montre aujourd'hui « 5/6 » (jalons). Boost ENT-3.1 ne le
déclare pas : elle est déjà ramenée sur 20, à raison de 3,33 points par jalon. Après le lot, les sept séances donnent une note
sur 20 pondérée.

- **Les élèves qui ont fini gardent leur note.** La note rangée au Suivi est `score` + `max` : le Suivi affiche une ancienne
  ligne « 5 sur 6 » en proportion (16,5/20) dès que `notation: 'avancement'` disparaît, et `meilleurScore` convertit l'ancien
  meilleur en proportion du nouveau maximum s'ils rouvrent la séance : jamais de baisse. Le tableau par compétence faisait déjà
  cette conversion proportionnelle. Aucun correctif moteur.
- **Spartoo ENT-1.1 ouvre ENT-1.2 par la photo de fin de séance**, pas par le score (`core/parcours.js` lit `db.points`) :
  changer le maximum ne peut refermer la suite à personne.
- **Boost ENT-3.1 est ouverte aux élèves** : certains l'ont déjà jouée. Ils gardent leur proportion de jalons ; le changement
  se voit seulement à la prochaine ouverture.
- Les titres de jalons ne changent pas (ceux d'ENT-1.1 ont été relus pour ne pas trahir la réponse). Seuls les poids et, pour
  les séances à bandeau de fin, les lignes de bandeau comptent.

## ENT-1.1 — Spartoo, réception (8 jalons, C1.4, guidage)

Cœur : décider de la palette et écrire des réserves précises (deux motifs sur une palette à plusieurs références), puis
contrôler le bon de réception sans tomber dans le piège du BL voisin. Le questionnaire de procédure est la partie « savoir ».
**Lignes du bandeau de fin : une par jalon, comme aujourd'hui** (les titres sont déjà validés) ; pas de regroupement.

| Jalon | Points |
|---|---|
| `procedure` · questionnaire de procédure | 2 |
| `comptage` · palette comptée, référence par référence | 2,5 |
| `decision` · décision pour la palette | 3 |
| `reserves-bl` · réserves précises écrites sur le BL | 3,5 |
| `signature` · BL signé par le chauffeur | 1 |
| `controle` · contrôle du bon BL-77421 (piège REC-04129) | 3 |
| `entree` · entrée en stock avec le lot | 2,5 |
| `reserve` · réserves signalées à Puma | 2,5 |
| **Total** | **20** |

## ENT-2.1 — Cdiscount, les mouvements (6 jalons, C1.6, guidage)

Cœur : retrouver l'erreur (le document qui ne correspond pas à son mouvement) et ne citer que les commandes qui ont fait
bouger le stock (CMD-731602, annulée, est le piège).

| Jalon | Points |
|---|---|
| `actuel` · stock actuel relevé | 2 |
| `reception` · réceptions retrouvées | 3 |
| `commandes` · commandes citées, et seulement elles | 3,5 |
| `retour-casse` · retour client et casse identifiés | 3 |
| `inventaire` · stock du dernier inventaire recalculé | 3 |
| `erreur` · erreur trouvée et son écart | 5,5 |
| **Total** | **20** |

## ENT-2.2 — Cdiscount, ce que disent les chiffres (5 jalons, C1.6, guidage)

Ici le tableur est la matière enseignée (export, formule d'écart, SI, NB.SI : 12 points), et la liste à recompter est la
décision qui en découle (8 points). En ENT-2.5 (évaluation) le rapport est inverse : c'est voulu.

| Jalon | Points |
|---|---|
| `export` · lignes de préparation exportées | 2 |
| `ecart` · écart calculé en formule | 3 |
| `si` · références en écart isolées avec SI | 3 |
| `synthese` · constats comptés avec NB.SI | 4 |
| `liste` · bonne liste à recompter | 8 |
| **Total** | **20** |

## ENT-2.3 — Cdiscount, l'inventaire (5 jalons, C1.6, entraînement)

Cœur : distinguer l'article mal rangé de l'écart réel (ne pas régulariser à tort), puis régulariser l'écart sans cause avec
son motif.

| Jalon | Points |
|---|---|
| `comptage` · comptage reporté sans erreur | 4 |
| `ecarts` · écarts calculés | 3 |
| `rangements` · articles mal rangés repérés, sans régulariser à tort | 6 |
| `temoin` · écart sans cause régularisé avec son motif | 4,5 |
| `taux` · taux d'écart calculé | 2,5 |
| **Total** | **20** |

## ENT-2.4 — Cdiscount, ajustements à justifier (9 jalons, C1.6, erreur induite)

Cœur : trouver que l'écart est une erreur de réception et non une démarque (le piège), puis la suite à donner (réclamer au
fournisseur). Le tableur pèse 5 points ; l'enquête sur la réception, 15.

| Jalon | Points |
|---|---|
| `export` · ajustements du mois exportés | 1,5 |
| `averifier` · ajustements sans justificatif repérés (SI) | 1,5 |
| `parmotif` · ajustements comptés par motif (NB.SI) | 2 |
| `ajustements` · orphelin repéré, justifié reconnu | 3 |
| `reception` · réception où l'écart est né retrouvée | 2 |
| `quantites` · quantité annoncée et quantité reçue relevées | 2 |
| `valeur` · valeur du manque calculée | 2 |
| `motif` · erreur de réception, pas démarque | 3,5 |
| `suite` · réclamer auprès du fournisseur | 2,5 |
| **Total** | **20** |

## ENT-2.6 — Cdiscount, les priorités (5 jalons, C1.6, entraînement)

Cœur : les cinq bonnes priorités (les cinq plus grandes valeurs d'écart, jugées sur la synthèse déposée par l'élève). Le
nettoyage de l'export, NB.SI.ENS et RECHERCHEV sont les outils qui y mènent.
**À noter** : le brief dit 4 jalons, le code en a 5 (le jalon `export` est arrivé avec l'écran Extractions).

| Jalon | Points |
|---|---|
| `export` · lignes du mois exportées | 1,5 |
| `nettoye` · export nettoyé | 3 |
| `constats` · constats comptés (NB.SI.ENS) | 4 |
| `valeur` · écarts chiffrés en euros (RECHERCHEV) | 4 |
| `cinq` · les cinq bonnes priorités | 7,5 |
| **Total** | **20** |

## ENT-3.1 — Boost, la tournée du vélo-cargo (6 jalons, C2.4, guidage ; ouverte aux élèves)

Cœur : laisser à quai la bonne commande, respecter la charge utile et attraper le train de 16 h 10 (11 points sur 20). Le
repérage sur le plan compte 4 : c'est la première étape de la séance. Les deux jalons de tableur (résultats reportés, formules)
valent 2,5 chacun. Aujourd'hui, chaque jalon vaut 3,33.

| Jalon | Points |
|---|---|
| `reperage` · les sept clients situés sur le plan | 4 |
| `choix` · la bonne commande laissée à quai | 4 |
| `charge` · charge utile respectée | 3 |
| `horaire` · train de 16 h 10 attrapé | 4 |
| `report` · les deux résultats reportés | 2,5 |
| `formules` · formules de la feuille justes | 2,5 |
| **Total** | **20** |

## Découvert en chemin : trois séances que la liste « déjà conformes » range à tort

En balayant les jalons de toutes les séances, ces trois-là n'ont **aucun poids** (un jalon = un point, ramené sur 20), alors
que `NOTATION-ponderation.md` les range parmi les conformes. À ajouter au lot 4 si Tristan est d'accord ; propositions moins
étudiées que les précédentes (je n'ai pas relu leurs briefs en entier).

### ENT-4.1 — Picard, le premier camion (18 jalons, C1.4, guidage)

Une palette par aléa : P1 aucun (couche incomplète mais conforme), P2 avarie, P3 température, P4 manquant, P5 étiquette
d'un autre produit. Une ligne de bandeau par palette, comme ENT-4.2.

| Bloc | Jalons | Points |
|---|---|---|
| Enregistreur | `ticket` | 2 |
| Palette P1 | comptage 0,75 · décision 1,25 | 2 |
| Palette P2 (avarie) | comptage 0,75 · décision 1,75 · réserve 0,75 | 3,25 |
| Palette P3 (température) | comptage 0,75 · décision 1,75 · réserve 0,75 | 3,25 |
| Palette P4 (manquant) | comptage 0,75 · décision 1,75 · réserve 0,75 | 3,25 |
| Palette P5 (étiquette) | comptage 0,75 · décision 1,75 · réserve 0,75 | 3,25 |
| Pas de « sous réserve de déballage » | `deballage` | 1 |
| Signature du chauffeur | `signature` | 1 |
| Lot rentré en chambre froide | `rentre` | 1 |
| **Total** | | **20** |

### ENT-3.2 — Boost, entraînement (11 jalons, C2.4, entraînement)

| Jalon | Points |
|---|---|
| `reperage` · les nouveaux clients situés | 1,5 |
| `donnees` · données du mail recopiées dans la feuille | 1,5 |
| `choix` · poids à écarter calculé, bonne commande à quai | 3 |
| `charge` · charge utile respectée | 2 |
| `horaire` · train attrapé | 2 |
| `creneau` · créneau de livraison tenu | 2 |
| `formules` · formules de la feuille justes | 2 |
| `trajet10` · à moins de 10 % de la meilleure tournée | 1,5 |
| `trajet5` · à moins de 5 % de la meilleure tournée | 1 |
| `replanif` · après l'imprévu, la tournée replanifiée tient tout | 2 |
| `trajet2` · après l'imprévu, à moins de 10 % de la meilleure | 1,5 |
| **Total** | **20** |

### ENT-3.3 — Boost, la tournée à corriger (7 jalons, C2.4, erreur induite)

| Jalon | Points |
|---|---|
| `contraintes` · diagnostic : chaque contrainte dite tenue ou non, sans en accuser une à tort | 4 |
| `preuves` · diagnostic : les chiffres qui le prouvent | 3 |
| `formule` · réparation : la formule fausse corrigée | 3 |
| `charge` · réparation : bonne commande à quai, charge respectée | 2,5 |
| `horaire` · réparation : train attrapé | 2,5 |
| `creneau` · réparation : créneau tenu | 2,5 |
| `trajet` · réparation : à moins de 10 % de la meilleure tournée | 2,5 |
| **Total** | **20** |

## Ce que coûtera la construction (une fois les tableaux validés)

Par séance : `bareme: 20`, retrait de `notation: 'avancement'` (six séances), `poids` et `groupe` dans le fichier de contenu
(l'outil `contenus/ponderation.js` du lot 3 sert pour les jalons déjà fabriqués), réécriture en points des cas de test qui
lisent « 5/6 », « 8/9 »… (**réécriture de cas existants : à dire à Tristan**), corrigé et en-têtes, ligne dans `decisions.md`.
Spartoo ENT-1.1 et Boost ENT-3.1 ont des tests dans les blocs `spartoo` et `boost` ; les cinq Cdiscount dans `cdiscount`.
Durée estimée : 1 h 15 à 1 h 30 pour les sept séances, 30 minutes de plus pour les trois découvertes.
