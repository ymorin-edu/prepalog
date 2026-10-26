# Brief de séance — ENT-13.3 Stellantis Sochaux, la méthode ABC au tableur (Tle, rentrée)

**Statut** : à construire
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé par Tristan le 26/10 (`stellantis/CADRAGE-stellantis-tle.md`)
**Modèle** : Sonnet (geste tableur existant)

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-13.3 |
| `id` | `stellantis-methode-abc` |
| Titre / desc | « Stellantis Sochaux — la méthode ABC au tableur » / « Exporter les sorties de la semaine du magasin des petites pièces, les classer en A, B et C dans le tableur avec des formules, puis décider où ranger chaque référence. » |
| Niveau(x) | `['tle']` |
| Compétence(s) | **C1.5** (ranger : choisir l'emplacement d'après la rotation), **C1.6** (gérer les stocks : méthodes de gestion) ; révision du geste tableur de 1re (D2) |
| Temps pédagogique | **guidage** (la méthode ABC est **nouvelle** en Terminale) |
| Notation | jalons pondérés, `bareme: 20` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** : le **transstockeur** de Sochaux (4 500 palettes, 4 allées) ne regroupe pas les références : **chacune est répartie
  sur les quatre allées**, pour qu'une panne d'allée n'arrête pas la ligne (Le Trois, 05/09/2022). La méthode ABC (≈ 20 % des
  références pour ≈ 80 % des sorties ; B ≈ 30 % pour 15 % ; C ≈ 50 % pour 5 %) : sources déjà relevées pour le plan d'entrepôt
  (rackdestockage.eu, mecalux.fr) ; une source récente à citer dans la fiche méthode reste à relever (cadrage §8).
- **Construit** : le **magasin des petites pièces** au bord du montage (on ne sait pas comment Sochaux range ses petites pièces :
  il est présenté comme un magasin d'usine « type », pas comme celui de Sochaux), ses 18 références (vraies **familles** de
  pièces d'une voiture : vis, agrafes, clips, joints, faisceaux, rétroviseurs, poignées, ampoules, caches…, sans référence
  constructeur), leurs emplacements et leurs sorties de la semaine. L'export est reconstitué (mention en pied).

## 3. Objectif pédagogique

L'élève **apprend la méthode ABC** et la **calcule lui-même** : en 2de et en 1re, la classe de rotation était écrite sur la
fiche du produit (plan d'entrepôt) ; en Terminale, il la trouve. Gestes : exporter, **trier** par sorties décroissantes, total
avec `SOMME`, part de chaque référence, **pourcentage cumulé**, classe avec `SI`, déposer ; puis **décider** : les A près de la
sortie et à hauteur d'homme, les C au fond et en hauteur. Il apprend aussi qu'ABC est une **règle**, pas une loi (le fait réel
du transstockeur).

## 4. Déroulé (≈ 55 min)

**Mercredi 15 septembre 2027, 13 h 30**, bureau du magasin des petites pièces. Karim : « Le magasin a été rangé il y a deux
ans. Depuis, la 5008 a changé de version et certaines pièces sortent beaucoup plus. On va refaire le classement ABC. »

1. **Avant de commencer** (non noté) : banque §4 ter.
2. **La méthode** (document « Fiche méthode ABC » dans Documents, et bandeau d'aide du tableur) : pourquoi classer, les **seuils
   de la séance** écrits noir sur blanc (A jusqu'à 80 % des sorties cumulées, B jusqu'à 95 %, C au-delà), un exemple à 6
   références entièrement calculé. La méthode se lit, elle ne se devine pas.
3. **Exporter** (écran « Extractions » du logiciel, geste tableur) : `stellantis-sorties-semaine37.xlsx`, feuille « Sorties »,
   colonnes **Référence | Désignation | Famille | Emplacement | Sorties** (en contenants, semaine 37), **18 lignes dans l'ordre
   des emplacements** (donc pas triées). Aucune salissure (la méthode est nouvelle : on ne mélange pas deux difficultés).
4. **Traiter, pas à pas** (guidage : Karim donne les étapes une à une dans la messagerie, chacune avec la fonction en français) :
   a. trier par **Sorties** décroissantes ; b. total sous la colonne, `=SOMME(E2:E19)` ; c. colonne **Part** : `=E2/E$20`, au
   format pourcentage ; d. colonne **Cumul** : `=F2`, puis `=G2+F3` recopiée vers le bas ; e. colonne **Classe** :
   `=SI(G2<=80%;"A";SI(G2<=95%;"B";"C"))` ; f. enregistrer.
5. **Déposer** (menu Fichiers) : le site dit ce qui est juste ou non par colonne (guidage : on peut corriger et redéposer).
6. **Lire et décider** (questions, sur **son** fichier) : combien de références en A, quelle part des sorties elles font ; où
   ranger les A (près de la sortie du magasin, entre la taille et l'épaule) et les C ; une référence C rangée aujourd'hui au
   meilleur emplacement : que faire.
7. Bilan, photo de fin.

**Repli si la salle n'a pas de tableur** : la `grille` intégrée, avec la liste **déjà triée** par le logiciel (l'élève perd le
geste « trier ») ; à déclarer comme variante, pas comme séance à part.

## 4 bis. Questions au fil — propositions

| Geste | Qui pose | Question proposée | Type | Notée / réflexion | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|
| Export ouvert | Karim | « Avant de calculer : à ton avis, combien de références sur 18 font l'essentiel des sorties ? » (environ 4 / environ 9 / toutes à peu près pareil) | fil | réflexion | — | l'élève parie, le tableur répondra |
| Dépôt juste | Karim | « Tes A, c'est combien de références sur 18, et combien des sorties ? » (lu dans son fichier : 4 et 78 %, valeurs tirées) | fil | notée | tout de suite | ancrée sur son fichier |
| Classe posée | Karim | « Pourquoi ranger les A près de la sortie ? » (on y va le plus souvent : moins de trajets / elles sont plus chères / elles sont plus lourdes) | fil | notée | tout de suite | le sens du classement |
| ★ Fin des décisions | Karim | « Au magasin, 6 références C n'ont pas bougé depuis des mois. Pour l'usine, ce stock qui dort, c'est… » (de l'argent immobilisé, de la place et du travail qu'elle paie sans rien vendre / une réserve gratuite / rien du tout) | point d'étape | notée | au bilan | **éco-droit** : le coût de possession du stock (gestion, programme de 1re), appliqué au cas |
| Après le bilan | Karim | « Au grand transstockeur, Stellantis fait l'inverse : chaque référence est répartie sur les 4 allées, pas regroupée près de la sortie. Pourquoi ? » (si une allée tombe en panne, les pièces restent accessibles : la ligne ne s'arrête pas / pour aller plus vite / pour remplir les trous) | fil | réflexion | — | fait réel : ABC est une règle, pas une loi |

## 4 ter. Avant de commencer (non noté)

| id | Rubrique | Question | Juste | Pièges | À gauche |
|---|---|---|---|---|---|
| rotation | stock | Une pièce « à forte rotation », c'est… | une pièce qui sort souvent | une pièce qui tourne sur la ligne ; une pièce lourde | — |
| pct | calcul | 300 sorties sur un total de 1 500, c'est… | 20 % | 30 % ; 5 % | — |
| cumul | calcul | 40 %, puis 25 %, puis 15 % : le cumul après la troisième ligne est… | 80 % | 15 % ; 40 % | — |
| somme | tableur | Pour additionner une colonne dans le tableur, j'utilise… | SOMME | SI ; MOYENNE | — |
| stock | éco-droit | Un stock qui ne sort pas coûte à l'entreprise… | la place, l'assurance, l'argent qu'il bloque | rien, puisqu'il est payé ; seulement s'il casse | — |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| 1 | Total des sorties avec `SOMME` | tableur | 2 |
| 2 | Part de chaque référence (formule) | tableur | 3 |
| 3 | Pourcentage cumulé juste pour chaque référence (donc liste bien triée) | tableur | 4 |
| 4 | Classe A, B ou C juste pour chaque référence, avec `SI` | tableur | 4 |
| 5 | Lire son classement (combien de A, quelle part des sorties) | décider | 2 |
| 6 | Décider où ranger (A, C, la référence mal placée) | décider | 2 |
| — | Questions au fil | questions | 3 |

Jalons 2 à 4 : proportion des références justes (comme ENT-2.2), formule exigée. Garde d'inaction : sans dépôt, les jalons 1 à
5 sont à 0 ; les questions du 6 sont posées sur le fichier déposé, pas avant.

## 6 bis. Tirage

Pièce fixe : les 18 références, leurs emplacements. Valeurs tirées : les sorties de chaque référence, sous **contrôle d'équité**
(sur 500 tirages, dans chaque jeu) : **aucune égalité** de sorties ; 4 références en A, 5 en B, 9 en C ; **dernier A ≤ 79 %,
premier B ≥ 81 %, dernier B ≤ 94 %, premier C ≥ 96 %** (aucun cas litigieux aux seuils). Exemple de jeu (sorties sur 10 000) :
A 3 200, 2 400, 1 500, 700 (cumul 78 %) ; B 500, 400, 300, 250, 150 (94 %) ; C 200, 110, 90, 70, 50, 30, 25, 15, 10.
Confirmé : 24 références au lieu de 18 (mêmes contrôles).

## 7. Demandes au moteur

Rien d'écrit dans `core/` a priori : le geste tableur (export, dépôt, contrôles `colonne` par `cle: ['Référence']`, noms de
fonctions) existe (ENT-2.2, 2.6). À vérifier en écrivant, et à remonter ici si la réponse est non :
1. Un contrôle `colonne` sait-il exiger une fonction **quelque part dans la feuille** (`fonctionsFeuille: ['SUM']`, déclaré pour
   le contrôle `table`) ? C'est ce qui contrôle le total, dont la place est libre.
2. **Part et cumul en pourcentage** : la valeur lue est la fraction (0,32) si l'élève met le format « % ». S'il écrit
   `=E2/E$20*100`, la valeur est 32. La consigne demande le format pourcentage ; le contrôle accepte-t-il les deux (attendu ou
   attendu × 100) ? Réponse par défaut : **n'accepter que la fraction**, et le message de dépôt le dit (« écris la part au
   format pourcentage, sans ×100 »).
3. Le cumul contrôlé par référence vérifie le tri sans contrôle à part : vrai seulement sans égalité (garanti par le tirage).

## 8. Tests attendus

Bloc `outils/test/stellantis-13.3.mjs`. Classeurs fabriqués par le test (SheetJS, comme ceux de Cdiscount) : fichier juste
(20/20) ; liste non triée (cumul faux, jalon 3 à 0, jalon 2 intact) ; classe écrite à la main sans `SI` (jalon 4 refusé) ;
total tapé en dur (jalon 1 refusé) ; part ×100 (selon la réponse au §7.2) ; équité des tirages (500 graines : seuils et
égalités) ; valeurs attendues du jeu exemple écrites à la main ; sabotage.

## 10. Critères de validation par Tristan

Exporter, faire le classement dans **Excel et dans LibreOffice** (les deux salles), déposer, se tromper exprès (oublier de trier)
et lire ce que dit le dépôt : les messages doivent dire quoi corriger sans donner la réponse.

## 11. Questions ouvertes (réponse par défaut entre parenthèses)

- [ ] Les seuils de la séance : 80 % et 95 % (oui ; d'autres seuils existent, la fiche le dit).
- [ ] Le graphique (histogramme et courbe des cumuls) : facultatif, non contrôlé (oui ; question au fil possible plus tard).
- [ ] Le magasin des petites pièces est construit et dit comme tel (oui).

## Compte rendu *(à remplir à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
