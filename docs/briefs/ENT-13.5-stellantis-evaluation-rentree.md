# Brief de séance — ENT-13.5 Stellantis Sochaux, évaluation de rentrée (Tle)

**Statut** : à construire
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé par Tristan le 26/10 (`stellantis/CADRAGE-stellantis-tle.md`)
**Modèle** : Sonnet (vues existantes, assemblage de 13.2 à 13.4)

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-13.5 |
| `id` | `stellantis-evaluation-rentree` |
| Titre / desc | « Stellantis Sochaux — évaluation de rentrée » / « Sans aide : recevoir un camion de pièces et écrire les réserves, classer les références en A, B et C au tableur, ranger les palettes reçues et expliquer un écart d'inventaire. » |
| Niveau(x) | `['tle']` |
| Compétence(s) | **C1.4** (réceptionner), **C1.5** (ranger selon la rotation), **C1.6** (stocks : ABC, écart d'inventaire) |
| Temps pédagogique | **évaluation** (après 13.2 à 13.4) |
| Notation | `copie: true`, jalons pondérés sur 20, **un jeu tiré par élève** (`DECISION-jeu-unique-evaluations.md`) ; `export const noter = (db) => moteur.noter(db);` ; coefficient 3 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise

Comme 13.2 à 13.4 : faits vérifiés repris tels quels, magasin des petites pièces, camions, références, prix et stocks
**construits**, documents reconstitués avec mention en pied.

## 3. Objectif

Vérifier, sans aide, que les gestes de réception, de rangement et d'inventaire de 1re sont **revenus**, et que la **méthode
ABC** (nouvelle) est acquise : faire le classement au tableur et s'en servir.

## 4. Déroulé (≈ 60 min ; voir §11)

**Vendredi 24 septembre 2027**, dernier jour de la première période de PFMP. Karim : « Aujourd'hui tu fais seul. »

1. **Avant de commencer**, notées (4 / 20) : 4 questions ★ ou clés de 13.2 à 13.4, tirées dans leur banque ; « Je ne sais
   pas » permis (0, pas de pénalité).
2. **Le camion** (vue `quai`, `froid: false`, comme 13.2) : 5 palettes ; **2 anomalies tirées** dans une banque de 5 (cartons
   écrasés ; palette manquante au regard du BL ; quantité différente sur une palette ; étiquette d'une autre référence ; film
   déchiré sans dommage, à accepter : le piège « tout refuser ») ; réserves précises, signature.
3. **Le classement ABC** (geste tableur, sur les **sorties**, comme 13.3) : 15 références, aucune étape donnée ; la fiche
   méthode n'est **pas** dans Documents (les seuils 80 % et 95 % sont rappelés dans la consigne : on évalue le geste, pas la
   mémoire d'un chiffre).
4. **Ranger** (plan d'entrepôt, rangement, critère rotation, bandes cachées) : les 3 palettes acceptées du camion, rangées
   selon **la classe que l'élève vient de calculer** pour leur référence (voir §7.2).
5. **Un écart** (vue `inventaire`, une ligne libre, comptage donné) : la cause est dans les mouvements ou un message ; décider.
6. Copie rendue.

## 4 bis. Questions au fil (notées, sans retour)

| Geste | Question | Pourquoi |
|---|---|---|
| BL signé | « Un dommage caché découvert lundi : que fais-tu, dans quel délai ? » (protestation motivée au transporteur, 3 jours ; texte L133-3 cliqué dans les documents) | **éco-droit appliqué**, reprise de 13.2 |
| Dépôt fait | « Tes A : combien de références, quelle part des sorties ? » (lu sur son fichier) | lire son classement |
| Écart décidé | « Pourquoi ne pas régulariser tout de suite ? » | méthode, reprise de 13.4 |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| — | Avant de commencer (4 questions) | questions | 4 |
| 1 | Réception : la bonne décision sur chaque palette | réception | 3 |
| 2 | Réserves précises et signature | réception | 2 |
| 3 | ABC : cumul juste pour chaque référence (donc liste triée) | ABC | 3 |
| 4 | ABC : classe juste, avec `SI` | ABC | 2 |
| 5 | Chaque palette rangée dans la zone de **sa** classe | ranger | 2 |
| 6 | L'écart traité selon sa cause | inventaire | 2 |
| 7 | Questions au fil | questions | 2 |

Garde d'inaction : tout refuser au quai fait tomber le jalon 1 (une palette au moins est conforme dans chaque jeu) ; sans dépôt,
jalons 3 et 4 à 0 ; écart non traité = faux.

## 6 bis. Tirage

Un jeu par élève (graine = identifiant, comme toutes les évaluations) : les 2 anomalies du camion (équité : toujours une
« visible » — écrasés ou film — et une « au BL » — manquant, quantité ou étiquette), les références du camion, les sorties des
15 références (contrôles d'équité de 13.3 : aucune égalité, seuils nets, et les 3 références du camion tombent dans **trois
classes différentes**), l'écart et sa cause. Ni bonus ni niveau en évaluation.

## 7. Demandes au moteur

À vérifier en écrivant :
1. Les quatre vues dans une même copie (`quai`, geste tableur, plan d'entrepôt, inventaire) : chacune existe et sait le mode
   évaluation ; leur enchaînement dans un `parcours` (comme IKEA 12.1) ou par écrans. Prendre ce que fait la séance la plus
   récente qui enchaîne deux vues en évaluation.
2. **Ranger selon la classe calculée par l'élève** : la classe de rotation d'une palette viendrait du fichier déposé
   (`resultatDepot`, valeurs lues). Si ce n'est pas faisable sans toucher au moteur : la fiche de la palette donne la classe
   **juste** après le dépôt (« le logiciel a recalculé ») et le jalon 5 porte sur le rangement seul. Réponse par défaut : ce
   repli ; le dire à Tristan.

## 8. Tests attendus

Bloc `outils/test/stellantis-13.5.mjs`. Cas : copie juste (20/20) ; tout refuser au quai ; réserve vague ; fichier non trié ;
palette A rangée au fond ; écart régularisé sans chercher ; « Je ne sais pas » aux questions ; même élève → même jeu, deux élèves
→ deux jeux ; équité sur 500 graines ; le corrigé par élève montre son jeu.

## 10. Critères de validation par Tristan

Passer l'évaluation comme un élève, en une heure ; lire la copie et le corrigé de cet élève dans le suivi.

## 11. Questions ouvertes (réponse par défaut entre parenthèses)

- [ ] **Durée** : quatre gestes en une heure. Si c'est trop long aux essais : retirer le rangement (évalué en 13.4 seulement)
  (d'abord essayer en une heure).
- [ ] Les seuils 80 % / 95 % rappelés dans la consigne de l'évaluation (oui).
- [ ] C1.3 (planifier les quais) n'est pas réévaluée ici : elle l'a été en 1re ; 13.2 n'est qu'un entraînement (oui).

## Compte rendu *(à remplir à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
