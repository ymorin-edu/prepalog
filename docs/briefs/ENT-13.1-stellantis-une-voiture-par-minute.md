# Brief de séance — ENT-13.1 Stellantis Sochaux, une voiture par minute (Tle, rentrée)

**Statut** : livré (27/10/2026, `pret: true, ouverture: 'prof'`) —  questions au fil, poids (« à valider » ci-dessous) et réponses par défaut du §11 **acceptés par Tristan le 26/10/2026** (« tout ok »)
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé par Tristan le 26/10 (`stellantis/CADRAGE-stellantis-tle.md`)
**Modèle** : Sonnet (vues existantes)

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-13.1 |
| `id` | `stellantis-une-voiture-par-minute` |
| Titre / desc | « Stellantis Sochaux — une voiture par minute » / « Stagiaire en PFMP dans l'équipe logistique de l'usine de Sochaux : situer l'usine et ses fournisseurs, suivre une pièce du camion jusqu'à la voiture, lire les chiffres d'une usine qui ne garde presque pas de stock. » |
| Niveau(x) | `['tle']` |
| Compétence(s) | **C1.1** (situer l'entreprise dans sa chaîne logistique), rappel de 1re ; amorce de C2.3 (sans la noter) |
| Temps pédagogique | guidage (**rappel** : C1.1 est apprise ; séance d'accueil de l'année) |
| Notation | jalons pondérés, `bareme: 20` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** (sources au §2 du cadrage) : usine Peugeot depuis 1912 ; en 2026, **3008 (≈ 70 %) et 5008 (≈ 30 %)** sur la même
  ligne ; **≈ 1 045 voitures par jour, une par minute** ; **250 camions par jour, 500 fournisseurs** ; stock sur place de
  **quelques heures à une journée et demie** ; **transstockeur** de 4 500 palettes, une palette sortie en ≈ 6 min ; **trois
  quarts des pièces** amenées au bord de ligne par des **robots autonomes** ; une pièce fait 150 à 200 m du camion à la ligne
  (1 km avant 2022) ; certaines pièces commandées **le matin même** à **SMRC, à Rougegoutte** (Territoire de Belfort),
  d'autres **15 semaines à l'avance** à Shanghai ; **une chaîne à l'arrêt immobilise ≈ 1 200 personnes** ; 70 % des voitures
  partent par la route, 30 % par le rail ; voitures garées en 2022 sur l'ancien aérodrome de **Lure-Malbouhans** (parkings
  saturés).
- **Non vérifié, donc pas dit** : ce que SMRC fabrique pour Sochaux (recherche du 26/10 sans résultat) : la séance dit « un
  équipementier voisin, SMRC, à Rougegoutte », sans nommer la pièce.
- **Construit** : Karim (chef d'équipe logistique, prénom seul), la date de la PFMP, la pièce suivie (un rétroviseur, famille
  générique), les questions de calcul.

## 3. Objectif pédagogique

Rentrée de Terminale : l'élève **reprend C1.1** (situer une entreprise, ses fournisseurs, ses flux) dans un milieu qu'il n'a
pas encore vu, **une usine**. Il découvre ce qui change par rapport aux entrepôts de 2de et de 1re : le client de la
logistique est **la ligne**, le stock ne couvre que quelques heures (flux tendu, juste-à-temps), et un manque arrête 1 200
personnes. C'est le décor des 11 séances suivantes.

## 4. Déroulé (≈ 50 min)

**Lundi 13 septembre 2027, 7 h 30**, premier jour de PFMP, bureau de la logistique du montage. Karim accueille.

1. **Avant de commencer** (non noté) : banque §4 ter.
2. **Où sommes-nous ?** (vue `localiser`, carte de France) : l'**usine de Sochaux** (Doubs), le **fournisseur voisin à
   Rougegoutte** (Territoire de Belfort) ; lieu **bonus** (confirmé) : **Lure-Malbouhans** (Haute-Saône), le parking des
   voitures en 2022. Fin : flux Rougegoutte → Sochaux, texte de fin sur Shanghai (15 semaines) contre Rougegoutte (le matin
   même).
3. **Le voyage d'une pièce** (vue `ordre`, un scénario de 8 étapes) : commandée au fournisseur → camion au quai à l'heure du
   rendez-vous → déchargée et contrôlée → rangée au transstockeur → sortie du transstockeur à la demande de la ligne → amenée
   par un robot autonome au bord de ligne → montée sur la voiture → voiture expédiée (route ou rail).
4. **Les chiffres de l'usine** (questions, fiche « Sochaux en chiffres » à gauche, avec ses sources) : une voiture par minute,
   combien par heure (60) ; sur 1 045 voitures, combien de 5008 environ (≈ 30 % : 300 à 320 acceptés) ; pourquoi si peu de
   stock (pas de place, surface divisée par deux en 2022 ; un stock coûte) ; ce qui se passe si une pièce manque (la ligne
   s'arrête, ≈ 1 200 personnes attendent).
5. **Usine ou entrepôt ?** (tableau `assoc` ou qcm) : pour chaque phrase, « plutôt l'usine de Sochaux » ou « plutôt un
   entrepôt de distribution comme Cdiscount » (le client est la ligne / un consommateur ; quelques heures de stock / des
   semaines ; la pièce part être montée / le colis part être livré…).
6. Bilan, photo de fin.

## 4 bis. Questions au fil — propositions

| Geste | Qui pose | Question proposée | Type | Notée / réflexion | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|
| Rougegoutte placé | Karim | « Rougegoutte est à une demi-heure de route. Pourquoi peut-on lui commander une pièce le matin pour l'après-midi, et pas à Shanghai ? » (la distance : quelques heures de route contre des semaines de bateau / Shanghai est fermé le matin / c'est moins cher) | fil | notée | tout de suite | ancrée sur sa carte |
| Étape « transstockeur » posée | Karim | « Le transstockeur sort une palette en 6 minutes. La ligne monte une voiture par minute. Combien de voitures passent pendant qu'une palette sort ? » (6) | fil | notée | tout de suite | relie le chiffre au geste |
| Ordre réussi | Karim | « Avant 2022, une pièce faisait 1 km dans l'usine. Aujourd'hui 150 à 200 m. Qu'est-ce que l'usine y gagne ? » (du temps, moins de manutention, moins de place / rien / plus de camions) | fil | notée | tout de suite | rappel de 1re (flux, manutention) |
| ★ Fin des chiffres | Karim | « Stellantis achète ses pièces à 500 fournisseurs au lieu de toutes les fabriquer. Ce choix s'appelle… » (**l'externalisation** : faire faire par un spécialiste / l'intégration / la délocalisation) — puis « Un avantage pour l'usine ? » (elle se concentre sur le montage) | point d'étape | notée | au bilan | **éco-droit** : externalisation et choix de production (programme d'économie-droit de 1re, module « l'entreprise »), appliqué au cas |
| Option (confirmé) | Karim | « En 2022, les voitures finies attendaient sur un ancien aérodrome. Quel maillon de la chaîne était bloqué ? » (l'expédition, l'aval / la réception / le montage) | fil | réflexion | — | lieu bonus |

## 4 ter. Avant de commencer (non noté)

| id | Rubrique | Question | Juste | Pièges | À gauche |
|---|---|---|---|---|---|
| amont | flux | L'amont d'une usine, ce sont… | ses fournisseurs | ses clients ; ses salariés | schéma maison d'une chaîne |
| stock | stock | Un stock sert à… | ne pas manquer entre deux livraisons | gagner de l'argent en attendant ; occuper la place | — |
| quai | réception | Un rendez-vous de quai, c'est… | le créneau donné à un camion pour décharger | l'heure de départ du chauffeur ; une réunion | — |
| tendu | flux | Travailler « à flux tendu », c'est… | recevoir juste ce qu'il faut, juste au moment où il le faut | stocker beaucoup pour ne jamais manquer ; travailler vite | — |
| externe | éco-droit | Une entreprise qui confie une partie de son travail à une autre… | externalise | intègre ; licencie | — |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| 1 | Les lieux de la carte, au premier essai (`etapesLocaliser`) | carte | 4 |
| 2 | Le voyage de la pièce dans l'ordre | flux | 5 |
| 3 | Les chiffres de l'usine (calculs et raisons) | chiffres | 5 |
| 4 | Usine ou entrepôt : les phrases bien rangées | usine | 3 |
| — | Questions au fil | questions | 3 |

Pas de forme à juger (aucun message écrit). Garde d'inaction : un ordre non touché n'est jamais juste (l'ordre de départ est
mélangé par le moteur) ; une question non répondue vaut 0.

## 6 bis. Tirage

Pièce fixe : la carte, les 8 étapes. Valeurs tirées : la part de 5008 (28 à 32 %) et le nombre de voitures du jour (1 030 à
1 070) pour la question 4 (la réponse se recalcule) ; l'ordre des phrases de l'étape 5. Confirmé : le lieu bonus et la
question sur l'aval.

## 7. Demandes au moteur

Aucune a priori : `localiser` (lieux, `bonus`, `flux`, `fin`), `ordre`, questions, `assoc`. À vérifier en écrivant : la vue
`localiser` vit dans `creerEntreprise` (option `localiser`), comme Action ENT-8.1 ; `ordre` y entre-t-il aussi, ou passe-t-il
par un `parcours` (comme IKEA 12.1) ? Prendre ce que fait la séance la plus récente.

## 8. Tests attendus

Bloc `outils/test/stellantis-13.1.mjs` (nouveau ; ligne dans `BLOCS` et `GROUPES` : alerte 7). Cas : parcours juste
(20/20) ; ordre faux (jalon 2 à 0, les autres intacts) ; part de 5008 recalculée sur deux graines ; lieu bonus absent pour un
élève standard ; question éco-droit ; sabotage (inverser deux étapes du contenu fait tomber un cas).

## 10. Critères de validation par Tristan

Poser les lieux, remettre le voyage de la pièce dans l'ordre, lire la fiche « Sochaux en chiffres » : dire si la séance donne
envie d'entrer dans l'usine pour la rentrée.

## 11. Questions ouvertes (réponse par défaut entre parenthèses)

- [ ] Garder Lure-Malbouhans en lieu bonus (fait de 2022, un peu ancien) (oui : il montre l'aval).
- [ ] Une photo de l'usine : aucune de libre de droits repérée ; dessin maison du trajet de la pièce (oui, dessin maison).
- [ ] Le logo Stellantis : à récupérer par script **avec ton accord** (alerte 10) (en attente).

## Compte rendu

- **Fichiers créés / modifiés** : `activites/stellantis-une-voiture-par-minute.js` ; `contenus/stellantis-ent131.js` (carte, documents, fiches, jalons, messages) et `stellantis-ent131-donnees.js` (voyage, chiffres, phrases, tirage par élève) ; `contenus/questions/ENT-13.1.js` ; `contenus/corriges/ENT-13.1.js` (corrigé par élève) ; `activites/index.js` et `catalogue.js` ; `outils/test.mjs` (ligne dans `BLOCS` et `GROUPES`, **touché, à dire à Tristan**) et `outils/test/stellantis-13.1.mjs`.
- **Écarts par rapport au brief** : (a) la carte se joue sur **deux lieux** (l'usine de Sochaux, l'équipementier voisin de Rougegoutte), la ville est sans note, comme ENT-12.1 ; lieu BONUS du confirmé : l'ancien aérodrome de Lure-Malbouhans (aucun point) ; (b) les positions sont **approchées** (centre de la commune, relevées de mémoire, contrôlées par la vue : chaque point tombe dans son département) : à vérifier à l'écran ; (c) « usine ou entrepôt » est une fiche à six listes (la vue d'association n'est pas déclarable dans l'environnement d'entreprise) ; (d) la question d'éco-droit sur l'externalisation est posée à l'envoi des chiffres, corrigée AU BILAN ; (e) la réflexion sur l'aval (voitures garées en 2022) est posée à **tous**, en fin de séance, texte autonome : le moteur pose en fin de séance toute question au fil restée en attente, une réflexion « confirmé seul » aurait donc été posée aussi au niveau standard ; (f) aucune photo ni dessin de l'usine ; (g) le logo Stellantis n'est pas récupéré (réseau du cloud) : nom en texte provisoire.
- **Décisions prises en route** : poids = carte 4 (région et département de chaque lieu) · voyage 5 (ordre exact) · chiffres 5 (voitures par heure 1, 5008 du jour 2, stock 1, manque 1) · usine ou entrepôt 3 (6 × 0,5) · questions notées 3 (4 × 0,75) = 20 ; la part de 5008 et les voitures du jour sont tirées par élève (calcul accepté à 3 % près, au moins 3 voitures) ; le départ du voyage est toujours à au moins 2 inversions de l'ordre juste.
- **Tests** : bloc `stellantis-13.1`, 20 cas verts (déclaration, tirage sur 300 graines, calcul des 5008, ouverture, Avant de commencer, inaction, parcours 20/20, pire cas 0/20, carte, lieu bonus, voyage, fiches fermées, chiffres, 5008 recalculé sur deux élèves, usine ou entrepôt, questions au fil, corrigé, aucune requête externe). Durée du bloc : ≈ 4 min.
- **Commits** : voir l'historique du 27/10/2026.
- **Reste ouvert** : essai à l'écran par Tristan (surtout la position des points sur la carte) ; logo officiel depuis son PC.
