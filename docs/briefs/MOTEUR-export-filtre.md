# Brief de chantier — MOTEUR : l'élève choisit ce qu'il exporte (export filtré, 4 niveaux d'indication)

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
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

## 4. Questions ouvertes

- Quelles séances passent à l'export filtré, et à quel niveau chacune (ENT-2.2 guidage, 2.4 entraînement, 2.5
  évaluation, 2.6 bonus) ?

## Compte rendu *(rempli par Claude Code)*
