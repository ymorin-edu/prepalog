# Brief de séance — ENT-13.4 Stellantis Sochaux, ranger et compter selon ABC (Tle, rentrée)

**Statut** : à construire
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé par Tristan le 26/10 (`stellantis/CADRAGE-stellantis-tle.md`)
**Modèle** : Sonnet (vues existantes)

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-13.4 |
| `id` | `stellantis-ranger-compter-abc` |
| Titre / desc | « Stellantis Sochaux — ranger et compter selon ABC » / « Ranger les palettes reçues selon leur classe de rotation, refaire seul le classement ABC sur la valeur, puis compter les références A et expliquer les écarts. » |
| Niveau(x) | `['tle']` |
| Compétence(s) | **C1.5** (ranger selon la rotation), **C1.6** (inventaire tournant, écarts) ; méthode ABC |
| Temps pédagogique | **entraînement** (ABC vue en guidage en 13.3 ; rangement et inventaire : révision de 1re) |
| Notation | jalons pondérés, `bareme: 20` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** : comme 13.3 (stock de quelques heures, transstockeur, répartition des références sur les 4 allées).
- **Construit** : le magasin des petites pièces (même plan qu'en 13.3), les palettes reçues, les prix unitaires, les sorties
  de la semaine 38, le stock du logiciel, les écarts et leurs causes. Documents reconstitués (mention en pied).

## 3. Objectif pédagogique

Trois gestes enchaînés, **sans aide pas à pas** :
1. **Ranger selon la rotation** (révision de 1re, avec le critère qu'il a calculé en 13.3) : A près de la sortie, à hauteur
   d'homme ; C au fond et en hauteur ; plus les contraintes déjà connues (lourd en bas).
2. **Classer sur la valeur** (le second usage d'ABC, option 3 du cadrage) : valeur = sorties × prix unitaire. L'élève découvre
   qu'**une vis sort beaucoup mais vaut peu** (C en valeur) et qu'**un rétroviseur sort moins mais vaut cher** (A en valeur) :
   on ne classe pas pour la même raison.
3. **Compter les A** (inventaire tournant) : « les A se comptent souvent, les C rarement » ; compter à l'aveugle, constater les
   écarts, chercher la cause, décider.

## 4. Déroulé (≈ 60 min ; voir §11 si c'est trop long)

**Jeudi 16 septembre 2027, 6 h**, magasin des petites pièces. Karim : « Trois palettes sont arrivées cette nuit. Ensuite, la
comptabilité veut savoir quelles pièces on compte chaque semaine. »

1. **Avant de commencer** (non noté) : banque §4 ter.
2. **Ranger** (plan d'entrepôt, mode rangement, critère **rotation** déjà déclaré ; bandes de rotation **cachées**,
   entraînement) : 4 palettes reçues, la fiche de chaque produit donne la classe calculée par le logiciel la veille (A, B ou
   C) ; une palette lourde (contrainte « lourd »). Correction au bilan.
3. **Classer sur la valeur** (geste tableur) : export `stellantis-sorties-semaine38.xlsx`, colonnes **Référence | Désignation
   | Famille | Sorties | Prix unitaire** (18 lignes, dans l'ordre des références) ; l'élève ajoute **Valeur** (`=D2*E2`),
   trie sur la valeur, total `SOMME`, part, cumul, classe `SI` ; dépose. Pas d'étapes données une à une : la fiche méthode de
   13.3 reste dans Documents.
4. **Choisir ce qu'on compte cette semaine** (question à choix multiples sur **son** classement) : les références A en valeur.
5. **Compter les A** (plan d'entrepôt, terminal de comptage, `comptagesTerminal` comme France Boissons ENT-6.6 ; puis vue
   `inventaire` en `source: 'comptages'`) : 4 lignes à compter à l'aveugle, 2 écarts ; les causes arrivent dans la messagerie
   et les mouvements (une sortie vers la ligne non saisie la nuit ; un carton rangé à l'emplacement voisin) ; décider
   (régulariser avec un motif, ou remettre en place).
6. Bilan, photo de fin.

## 4 bis. Questions au fil — propositions

| Geste | Qui pose | Question proposée | Type | Notée / réflexion | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|
| Palette A rangée | Karim | « Les clips sortent 900 fois par semaine, les caches 40 fois. Laquelle met-on près de la sortie, et pourquoi ? » (les clips : on y va le plus souvent, on fait moins de trajets / les caches : ils sont plus légers / peu importe) | fil | notée | tout de suite | rangement selon la rotation |
| Dépôt juste | Karim | « Les vis : A en sorties mardi, et C en valeur aujourd'hui. Pourquoi ? » (elles sortent beaucoup mais coûtent très peu / le tableur s'est trompé / on en a moins) | fil | notée | tout de suite | le cœur de la séance : deux classements, deux usages |
| Écart trouvé | Karim | « Il manque 2 bacs de rétroviseurs. On régularise tout de suite ? » (non : chercher d'abord la cause dans les mouvements et les messages / oui, c'est de la casse / oui, c'est plus rapide) | fil | notée | tout de suite | révision de 1re (Cdiscount) |
| ★ Inventaire validé | Karim | « La comptabilité dit qu'on doit compter tout le stock au moins une fois par an. Compter un peu chaque semaine, c'est permis ? » (oui, si chaque référence est comptée au moins une fois dans l'année / non, il faut tout fermer un jour / non, la loi interdit l'inventaire tournant) | point d'étape | notée | au bilan | **éco-droit** : obligation d'inventaire annuel du commerçant, Code de commerce **art. L123-12** ; l'inventaire tournant admis s'il couvre tout le stock dans l'exercice (**règle comptable à vérifier mot à mot** avant d'écrire la question : PCG, inventaire permanent) |

## 4 ter. Avant de commencer (non noté)

| id | Rubrique | Question | Juste | Pièges | À gauche |
|---|---|---|---|---|---|
| valeur | calcul | 120 pièces à 3,50 € : la valeur est… | 420 € | 123,50 € ; 34,29 € | — |
| aveugle | inventaire | Compter « à l'aveugle », c'est… | compter sans voir le stock du logiciel | compter sans lumière ; compter à deux | — |
| ecart | inventaire | Le logiciel dit 40, on compte 37 : l'écart est… | −3 | +3 ; 77 | — |
| tournant | inventaire | Un inventaire tournant, c'est… | compter une partie du stock à chaque fois, tout dans l'année | tout compter le même jour ; compter en tournant dans les allées | — |
| annuel | éco-droit | Une entreprise doit compter son stock… | au moins une fois tous les 12 mois | jamais, le logiciel suffit ; chaque jour | extrait du Code de commerce |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| 1 | Chaque palette dans la zone de sa classe de rotation | ranger | 3 |
| 2 | La palette lourde en bas | ranger | 1 |
| 3 | Valeur de chaque référence (formule) | tableur | 2 |
| 4 | Classement ABC sur la valeur juste (cumul et classe, `SI`) | tableur | 4 |
| 5 | Les bonnes références choisies pour le comptage | compter | 2 |
| 6 | Comptage juste (quantités saisies) | compter | 2 |
| 7 | Chaque écart traité selon sa cause | compter | 3 |
| — | Questions au fil | questions | 3 |

Garde d'inaction : sans dépôt, jalons 3 et 4 à 0 ; une palette non rangée n'est pas « dans sa zone » ; un écart non traité est
faux ; régulariser **tous** les écarts sans chercher ne donne pas le jalon 7 (un écart a pour cause un carton mal rangé : on le
remet en place).

## 6 bis. Tirage

Pièce fixe : le plan du magasin, les 18 références. Valeurs tirées : sorties et prix (contrôle d'équité comme en 13.3 : aucune
égalité de valeur, seuils nets ; **et** au moins deux références qui changent de classe entre sorties et valeur, dont une A en
sorties devenue C en valeur) ; les quantités comptées et les écarts (toujours deux causes différentes). Confirmé : une
cinquième palette (contrainte « fragile ») et un troisième écart sans cause trouvable (démarque inconnue).

## 7. Demandes au moteur

Aucune a priori, à vérifier en écrivant :
1. Une séance qui enchaîne plan d'entrepôt (rangement **puis** comptage au terminal), geste tableur et inventaire dans le même
   `creerEntreprise` : ENT-6.6 enchaîne terminal et inventaire ; le rangement dans la même séance que le terminal est-il permis
   (deux usages du plan) ? Sinon : le rangement passe en premier « écran » de la séance et le comptage en second, ou demande au
   moteur.
2. La question « quelles références compter » se pose **sur son fichier déposé** : si l'élève a un classement faux, les lignes
   à compter restent celles du **bon** classement (contenu fixe) et la question est notée seule ; le dire à l'écran (« voici
   les références que Karim a retenues »).

## 8. Tests attendus

Bloc `outils/test/stellantis-13.4.mjs`. Cas : parcours juste (20/20) ; palette A au fond (jalon 1 faux) ; classement sur les
sorties au lieu de la valeur (jalon 4 faux) ; tout régulariser sans chercher (jalon 7 faux) ; comptage faux d'une ligne ;
équité des tirages (changement de classe garanti) ; sabotage.

## 10. Critères de validation par Tristan

Ranger, classer, compter : dire si les trois gestes tiennent dans **une heure** de Terminale, et si la question « vis A en
sorties, C en valeur » fait comprendre les deux usages.

## 11. Questions ouvertes (réponse par défaut entre parenthèses)

- [ ] Si la séance dépasse une heure aux essais : couper le rangement (il reste en 13.5) (non, d'abord essayer).
- [ ] La classe de rotation des palettes est donnée par le logiciel (calculée « la veille ») et non reprise du fichier de 13.3 :
  les bases sont cloisonnées par séance (oui).
- [ ] L'inventaire tournant et la règle comptable : question notée seulement après relecture du texte (oui).

## Compte rendu *(à remplir à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
