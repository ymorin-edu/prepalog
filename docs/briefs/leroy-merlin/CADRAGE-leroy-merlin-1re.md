# Leroy Merlin — la plateforme nationale de Réau (1re Bac Pro) : cadrage et compte rendu

**Statut : livré le 27/10/2026** (fil cloud « prochains blocs »). Construit par Claude seul, sans brief Cowork, sur le choix de Tristan du 27/10/2026
(« Les quatre, dans l'ordre » : Leroy Merlin 1re en deuxième) et sa délégation du 26/10/2026 (poids des jalons et questions au fil décidés par Claude).
Aucune vue nouvelle : la fabrique « en fiches » d'Amazon (`contenus/fabrique-fiches.js`), documents joints, carte de France (vue « Localiser »),
réponse par phrases, questions au fil. Les huit séances sont livrées `pret: true, ouverture: 'prof'` : à essayer à l'écran, puis à ouvrir au groupe
dans « Conduite de séance ».

## 1. La situation

L'élève arrive à la **plateforme logistique nationale de Réau** (Seine-et-Marne). Deux tuteurs construits, qui le tutoient : **Samir**, animateur
sécurité (séances 1 à 4, C1.2), et **Nadia**, service clients logistique (séances 5 à 8, C2.1). Deux collègues construits : **Kevin** (préparateur, son
relevé des risques est l'erreur induite de 20.3) et **Jordan** (service clients, ses promesses de dates sont l'erreur induite de 20.7).

## 2. Vérifié / construit

- **Vérifié (recherche web du 27/10/2026)** : Réau, inaugurée en 2019, 72 000 m² ; plateforme nationale depuis 2021 (EcommerceMag, 01/04/2021) ;
  36 000 m² automatisés, 27 chariots automatiques, 3 600 mouvements de palettes par jour, 4 000 références, livraisons vers 140 magasins et les clients
  du site, objectif « zéro accident du travail » (Stratégies Logistique, 07/10/2022) ; trois sites nationaux (Dourges, Valence, Réau) ; colis de moins
  de 30 kg livrés à J+1, encombrants à J+3 (Stratégies Logistique, 11/08/2022). Droit (résumé) : principes généraux de prévention (L4121-2),
  protocole de sécurité au chargement et au déchargement (R4515-4 et suivants), port de charges (R4541-9), repos du dimanche (L3132-3).
  Formules des taux de fréquence et de gravité : celles de l'Assurance maladie et de l'INRS.
- **Construit** (dit en pied de chaque document) : les situations de travail et leurs mesures, le relevé de Kevin, les accidents et les heures
  travaillées, l'ordre détaillé du protocole au quai (le protocole écrit est une obligation réelle), les commandes, les produits et leurs poids, les
  clients et les magasins demandeurs, les jours de livraison (du lundi au samedi), le taux de service de la semaine, les prénoms. « M. Rivière, maçon »
  est un particulier construit (pas d'entreprise inventée). Positions de la carte : centre des communes, approchées.
- **Logo** : le logo officiel (SVG Wikimedia Commons, `contenus/trames/logos/SOURCES-logos-19-21.txt`). **Charte** : le vert du logo (`#7bb51c`),
  gardé au bandeau ; le moteur le remplace par l'encre dans la zone de travail (règle des chartes vertes).

## 3. Les séances

| Code | Temps | Compétence | Ce que l'élève fait |
|---|---|---|---|
| ENT-20.1 « les risques de la plateforme » | guidage (réinitialisable) | C1.2 | le risque de six situations, Réau, Dourges, Valence sur la carte, les EPI, la meilleure mesure de trois situations |
| ENT-20.2 « le protocole au quai » | entraînement | C1.2 | le protocole au quai dans l'ordre, quatre situations (risque et mesure), le niveau de trois mesures, TF et TG de l'année, la première cause |
| ENT-20.3 « la fiche de Kevin » | erreur induite | C1.2 | vérifier les cinq lignes du relevé de Kevin (trois fausses), le corriger, trouver la cause (il pense d'abord à l'EPI) |
| ENT-20.4 « évaluation : la sécurité » | évaluation (copie, jeu tiré) | C1.2 | quatre situations, le protocole, les deux taux ; trois jeux |
| ENT-20.5 « le service clients » | guidage | C2.1 | client interne ou externe (quatre demandes), le poids et la date de trois commandes |
| ENT-20.6 « le samedi du service clients » | entraînement | C2.1 | cinq demandes, quatre commandes (dimanche sauté, 350 kg, 29,6 kg), le taux de service |
| ENT-20.7 « les réponses de Jordan » | erreur induite | C2.1 | vérifier cinq dates promises (trois fausses), les corriger, cocher les deux causes |
| ENT-20.8 « évaluation : le service clients » | évaluation (copie, jeu tiré) | C2.1 | trois demandes, trois commandes, le taux de service ; trois jeux |

Chaîne du parcours : 20.1 → 20.2 → 20.3 → 20.5 → 20.6 → 20.7 ; les évaluations sont hors chaîne (ouvertes par l'enseignant).

## 4. La notation (poids décidés par Claude, délégation du 26/10/2026)

Chaque séance : jalons + questions = 20. Guidage, entraînement, erreur induite : questions au fil notées 4 (dont une d'éco-droit), une réflexion non
notée, « Avant de commencer » non noté. Évaluations : « Avant de commencer » noté 3 (trois questions tirées, sans aide), une réflexion non notée.
Le détail des poids est en tête de chaque fichier `contenus/leroy-merlin-ent20x.js`. La forme (salutation, fin) ne compte pas ; le compte rendu pèse
de 1,5 à 4,5 points selon la séance.

## 5. À savoir

- Les jeux des évaluations dépendent de la graine de l'élève et de `contenus/leroy-merlin-donnees.js` : ne rien y changer pendant qu'une classe joue.
- Un taux est accepté au centième près (TG 0,225 et 0,23 sont justes) ; le taux de service au dixième.
- Tests : bloc `outils/test/leroy-merlin.mjs` (15 cas, valeurs écrites à la main, sabotages éprouvés).
