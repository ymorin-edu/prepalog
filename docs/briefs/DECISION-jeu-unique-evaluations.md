# Décision de Tristan — un jeu de données par élève dans toutes les évaluations (03/10/2026)

> Déposé par Cowork le 03/10/2026 (cadrage de la refonte Cdiscount). **À appliquer par Claude Code**, voir « Ce
> que Claude Code doit faire » en bas. Cowork n'a **pas** modifié les briefs Picard : une session Claude Code
> (ENT-4.2) était inscrite dans `docs/EN-COURS.md` avec « briefs Picard » au moment du dépôt.

## La règle

*« Un jeu par élève, cette règle vaut pour toutes les évaluations si c'est applicable. »* (Tristan, 03/10/2026)

Toute séance d'**évaluation** (temps `evaluation`, copie rendue) tire **un jeu de données propre à chaque élève**,
quand le contenu s'y prête. Deux voisins ne peuvent plus copier que la méthode, qui est ce qu'on évalue.

**Elle remplace, pour Picard ENT-4.4, les « deux jeux alternés un élève sur deux »** (brief
`ENT-4.4-picard-evaluation.md` §5 et §10, `COORDINATION-picard.md` lignes ENT-4.4 et P6). Décidé par Tristan le
03/10/2026 : **adapter le brief ENT-4.4 avant le chantier P6** ; le mécanisme sera construit pour Picard, puis
réutilisé par Cdiscount ENT-2.5 (refonte Cdiscount, après la chaîne Picard).

## Le principe (à construire une fois, à réutiliser)

1. **Graine = identifiant de l'élève**, stable : même jeu sur un autre poste, après rechargement, après
   réouverture de la copie par l'enseignant. Pas de `reinitialisable` en évaluation (règle existante).
2. La séance déclare une **réserve** (produits, quantités, aléas possibles) et des **contraintes d'équité** ;
   le tirage les respecte toujours.
3. **Jalons et note calculés sur le jeu de l'élève**, jamais écrits en dur.
4. **Test obligatoire** : tirer quelques centaines de graines et vérifier que chaque jeu respecte les
   contraintes (aucun tirage hors règle ne doit atteindre un élève) ; et deux élèves différents → deux jeux
   différents ; même élève → même jeu.
5. **Corrigé** : plus de corrigé fixe par jeu ; l'enseignant voit, **par élève**, le jeu reçu, l'attendu et la
   réponse (dans le `detail` du suivi, ou une vue « corrigé de cet élève » si le corrigé actuel ne sait pas le
   faire — à dire dans le compte rendu).
6. Le mécanisme de tirage est **générique** (pas propre au quai) : Cdiscount ENT-2.5 s'en servira pour tirer
   6 références, des quantités et l'attribution des pièges d'inventaire.

## Pour Picard ENT-4.4 : ce qui change, ce qui reste

**Change** : §5 « Deux jeux alternés » → **un jeu tiré par élève**. La **structure commune reste la contrainte
d'équité** : 6 palettes, avec exactement les six aléas du tableau §5 (manquant + écrasés sur la même palette ;
température non conforme ; produit différent ; écrasés seuls ; couche incomplète conforme au BL ; conforme), et
un ticket avec une remontée à signaler. **Tirés** : les produits et colisages (dans une réserve de produits
Picard plausibles), l'ordre des palettes (quelle position porte quel aléa), les valeurs (quantités, températures
dans les zones de la règle du quai −18 / −15 °C, manquants), le moment de la remontée du ticket.
§10 « alternance dans l'ordre alphabétique » : **supprimée**. §9 corrigé « pour les deux jeux » → corrigé par élève
(point 5 ci-dessus). §8 tests : ajouter ceux du point 4.

**Reste** : tout le reste du brief (note 15 + 5, seuils provisoires 12 / 16 min, tiers-temps, aucune aide, copie
rendue, pas de trame). **Les seuils de rapidité sont communs à tous** (ils ne dépendent pas du jeu).

**Coût estimé** : ≈ 2 à 3 h de plus que deux jeux fixes (règles du tirage + test sur graines), payées une fois.

## Ce que Claude Code doit faire

1. **Quand aucune session n'écrit dans les briefs Picard** (lire `docs/EN-COURS.md`) : reporter cette décision dans
   `docs/briefs/ENT-4.4-picard-evaluation.md` (§5, §7, §8, §9, §10) et dans `docs/briefs/COORDINATION-picard.md`
   (lignes ENT-4.4 et P6 : « un jeu tiré par élève » au lieu de « 2 jeux alternés » ; P6 passe de « moyen » à
   « moyen à gros »).
2. Ajouter une ligne à `docs/decisions.md` : « 03/10/2026 — Évaluations : un jeu de données tiré par élève
   (graine = identifiant), quand c'est applicable ; remplace les deux jeux alternés de Picard ENT-4.4.
   Détail : `docs/briefs/DECISION-jeu-unique-evaluations.md`. »
3. Commiter ce fichier et ces modifications ensemble (« Évaluations : un jeu de données par élève »), puis
   pousser (documentation seule).
4. Au moment de **P6** : construire le tirage générique avec ENT-4.4, et le décrire dans le compte rendu du brief
   (API, où vit le code, comment une autre séance le déclare) pour que Cdiscount ENT-2.5 le réutilise.
