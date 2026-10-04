# Brief de chantier — MOTEUR : l'élève choisit ce qu'il exporte (export filtré, 4 niveaux d'indication)

**Statut** : à valider par Tristan (livré le 04/10/2026) *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Origine** : retours de Tristan du 04/10/2026 sur le geste tableur (`MOTEUR-geste-tableur.md`, fin du brief).
**Page d'essai** : `G:\Mon Drive\Travail\Logistique\1L\Claude outputs\essai-export-niveaux.html` (04/10/2026).
**Modèle** : Sonnet (retouche du moteur, pas de vue nouvelle).

## 1. Le problème

L'export déclaré par la séance part tel quel (« Exporter les lignes de préparation ») : l'élève n'a rien à choisir.
Or le geste réel, c'est **choisir dans le logiciel ce qu'on sort** avant de le travailler dans le tableur.

## 2. Décisions de Tristan (04/10/2026, après la page d'essai)

1. **Les critères sont au-dessus du tableau, à l'écran** (pas dans une fenêtre) : le tableau se filtre sous les yeux de
   l'élève, et **« Exporter » sort ce qu'on voit**. Le nombre de lignes affichées est visible.
2. **Pas de choix des colonnes** : on exporte toutes les colonnes du tableau. Le jalon « bon export » ne juge que les
   **lignes** (type, période, zone…).
3. **Quatre niveaux d'indication**, déclarés par la séance (pas déduits du niveau 2de / 1re) :
   | Niveau | Pour | Critères à l'ouverture | Ce que l'élève a pour choisir |
   |---|---|---|---|
   | 1 | guidage, 2de | **déjà réglés** | la trame explique pourquoi ces critères |
   | 2 | guidage 1re, premier entraînement | par défaut du logiciel | la consigne donne les critères en clair |
   | 3 | entraînement | par défaut | une demande métier seule |
   | 4 | évaluation | par défaut | comme 3, aucun retour sur l'export |
4. **Une erreur ne se paie qu'une fois** : un jalon « bon export » à part ; les formules sont contrôlées contre **le
   fichier que l'élève a réellement exporté**. Mauvais filtre + formules justes = seul le jalon d'export est perdu.
5. **Le menu « Fichiers » ne sert plus qu'au dépôt.** Le bouton d'export est neutre : « Exporter ».
6. **Retour au dépôt sur l'export**, selon le niveau : 1 = dit quel critère changer ; 2 = dit ce qui cloche (« n lignes ne
   sont pas des ajustements », « il manque n ajustements du mois ») ; 3 = « ne correspond pas à la demande, relisez-la » ;
   4 = « Fichier reçu. ».
7. **Rappel tableur** (bandeau d'aide) : parler du **format texte** et de la **cellule A1**, **avec les guillemets** :
   critère texte entre guillemets (`=NB.SI(B:B;"Cassé")`), cellule sans guillemets (`=NB.SI(B:B;A1)` ; `"A1"` chercherait
   le texte A1), un nombre au format texte (calé à gauche) n'est pas compté comme un nombre.

## 3. Conséquence sur les trames (dit à Tristan le 04/10)

Les exports diffèrent déjà d'un élève à l'autre (confirmé : plus de lignes ; ce que l'élève a fait dans le logiciel).
**Une trame n'écrit jamais un nombre attendu** : elle fait vérifier (« uniquement des Ajustement inventaire, tous de ce
mois-ci ») ou pose une question qui se lit dans **son** fichier. Le corrigé par élève (onglet Corrigés) donne son bon
export. Claude Code relit les trames d'ENT-2.2, 2.4, 2.5, 2.6 et signale tout nombre en dur (reprise par Cowork).

## 4. Questions — tranchées (04/10/2026)

- Niveaux : **ENT-2.2 → 1, ENT-2.4 → 2, ENT-2.6 → 3, ENT-2.5 → 4.** Les quatre séances passent à l'export filtré.
- Où vit le tableau filtré : **un écran « Extractions » à part** dans le menu (comme le module « Éditions » d'un
  logiciel d'entrepôt), pas sur l'écran métier (Stock montrerait deux listes de mouvements presque pareilles).

## Compte rendu *(rempli par Claude Code)*

**Moteur** (`core/types/export-tableur.js`, `core/types/entreprise.js`, `styles/base.css`) :
- écran **Extractions** (menu Outils, avant Fichiers) : la liste, ses critères au-dessus du tableau, « n lignes »,
  « Exporter » (toutes les colonnes de la 1re feuille ; salissures dans le fichier, pas à l'écran). Les critères
  sont rangés dans la base de l'élève (`db.tableur.criteres[id]`), le focus revient sur le champ changé ;
- plus aucun bouton d'export sur les écrans métier ni dans **Fichiers** (dépôt seul ; il renvoie à Extractions) ;
- déclaration : `liste`, `autres(db)` (lignes à écarter), `aujourdhui(db)`, `filtres` (`colonne` ou `valeur(l)`,
  ou `periode: 'Date'` ; `juste`, `defaut`, `tous`), `indications` 1 à 4. Périodes : aujourd'hui, 7 jours, 30 jours,
  tout l'historique, personnalisée (du / au, préremplie sur le mois en cours). **Sans critère, `construireExport`
  rend la demande exactement** (l'ancien export) : les tests purs d'avant n'ont pas bougé ;
- on juge **les lignes**, pas le menu : une période personnalisée qui donne les mêmes lignes est juste ;
- dépôt contrôlé contre **chacun des exports différents de l'élève** (les 8 derniers), le meilleur est gardé ;
  `controles(db, propres)` ; le dépôt garde `exporte: { juste, criteres, comparaison }` ; à égalité de résultats,
  le meilleur dépôt est celui dont l'export est juste ;
- `statutExport(db, idExport, idDepot)` pour le jalon « bon export » : **en attente tant que rien n'est déposé**
  (l'élève n'a aucun retour sur son export avant le dépôt, même en guidage), puis juste / faux ;
- retour sur l'export au dépôt (`retourExportHtml`), au-dessus du retour des formules, selon le niveau ; rien en
  évaluation. Niveau 2, après l'essai de Tristan (04/10) : les lignes manquantes disent aussi quel critère vérifier,
  sans la valeur (« Il manque 16 lignes demandées : vérifiez « Période ». ») ;
- **Rappel tableur** : le moteur ajoute à toute aide déclarée le rappel des guillemets (`=NB.SI(G:G;"Casse")`), de la
  cellule sans guillemets (`=NB.SI(G:G;A1)`, `"A1"` chercherait le texte A1) et du nombre au format texte. ENT-2.5
  (évaluation) n'a pas d'aide : rien ne change pour elle.

**Séances** (toutes restent fermées, `ouverture: 'prof'`) :

| Séance | Niveau | Liste | Demande | Lignes à écarter | Jalons |
|---|---|---|---|---|---|
| ENT-2.2 | 1 | Lignes de préparation | allée A, 30 jours (déjà réglés) | allées B et C dans le mois (12), allée A avant (8) | 5 (« export » jugé au dépôt) |
| ENT-2.4 | 2 | Mouvements de stock | Ajustement inventaire, toutes allées, 30 jours (dans le mail de Nadia) | réceptions et préparations de la base, 6 mouvements d'autres allées, 7 ajustements du mois précédent | **9** (+ « export ») |
| ENT-2.6 | 3 | Lignes de préparation | toutes allées (A, B), 30 jours (« les lignes de préparation du mois ») | allées A et B avant le mois (14) | **5** (+ « export ») |
| ENT-2.5 | 4 | Lignes de préparation | allée C, 30 jours (« de l'allée C sur le mois ») | allées A et B dans le mois (14), allée C avant (8) | **12** (+ « export »), note sur 12 |

- ENT-2.4 : colonnes `Date | Type | N° mouvement | Référence | Désignation | Allée | Quantité | Motif | Document |
  Saisi par` (avant : pas de « Type », « N° ajustement ») ; feuille **Mouvements** (avant « Ajustements », qui
  donnait la réponse) ; fichier `cdiscount-mouvements-de-stock.xlsx`.
- ENT-2.2, 2.5, 2.6 : fichier `cdiscount-lignes-de-preparation.xlsx` (le nom ne dit plus l'allée).
- Lignes à écarter fabriquées par `preparationsAEcarter` (`contenus/cdiscount.js`, graine fixe, sans écart),
  numéros de bon hors de ceux des séances.
- Missions et accueils réécrits : « Extractions » au lieu de « Commandes » / « Stock » ; ENT-2.2 dit que les
  critères sont réglés ; ENT-2.4 donne les trois critères ; ENT-2.5 précise « de l'allée C sur le mois ».

**Tests** : bloc `tableur-export` (+3 cas : critères et comparaison, retour par niveau, dépôt contre l'export de
l'élève) et bloc `cdiscount` (+1 cas : les quatre séances, standard et confirmé — bons critères = ancien fichier,
aucune ligne à écarter ne passe, niveau déclaré). **Cas existants réécrits** : les cinq tests d'écran (ENT-2.2,
2.4, 2.5, 2.6 et l'écran générique) passent par Extractions ; ENT-2.4 (colonnes, feuille Mouvements, mission,
9 jalons) ; ENT-2.5 (12 jalons) ; aides `exporterC`, `exporter5`, `deposer6` (export enregistré comme à l'écran).
Éprouvés dans l'autre sens : un ajustement « du mois précédent » daté de J-20 fait tomber 2 cas ; un dépôt contrôlé
contre la demande au lieu de l'export de l'élève en fait tomber 1.

**À faire par Cowork** : les **trames d'ENT-2.2, 2.4 et 2.6 sont fausses** sur l'export (« Commandes » / « Stock,
onglet Mouvements », « Exporter les lignes de préparation » / « Exporter les ajustements du mois », « le bouton est
aussi dans Fichiers », onglet « Ajustements ») : à refaire avec l'écran Extractions, les critères selon le niveau,
**sans nombre de lignes attendu**. Aucune ne contenait de nombre en dur (vérifié). Leurs corrigés aussi.
