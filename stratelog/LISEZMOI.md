# Stratelog

Troisième collection à côté de Simulog : des jeux de stratégie logistique joués par la classe, une ville par groupe,
l'enseignant en Seigneur. Épisode 1 : **« Avant l'Hiver »** (Moyen Âge, 2de, décembre 2026).

Depuis le 24/11/2026, Avant l'Hiver est **dans le site** : séance `STR-1` (`activites/stratelog-avant-l-hiver.js`),
pastille « Stratelog » de l'accueil. Encore en brouillon (`pret: false`) : visible de l'enseignant seul.

## Ce qu'il contient

| Fichier | Rôle |
|---|---|
| `avant-l-hiver/regles.js` | Les règles en calcul pur : état d'une ville, registre attendu et corrigé, validation avant dépôt, résolution d'un tour, score, note. Ni écran ni base. |
| `avant-l-hiver/regles.test.mjs` | Ses tests, valeurs calculées à la main d'après la fiche. |
| `avant-l-hiver/equilibre.mjs` | Contrôle d'équilibre : rejoue la stratégie « ville honnête » du simulateur v15. |
| `avant-l-hiver/partie.js` | La partie de classe : qui écrit quoi dans la base (en-tête du fichier), présents, lots de rôles, brouillon de la ville, gestes du Seigneur. Calcul pur. |
| `avant-l-hiver/partie.test.mjs` | Ses tests (lignes, rôles, équipes de départ, présence). |
| `avant-l-hiver/ecrans.js` | Les écrans en HTML (élève, Seigneur, tableau projeté), repris de la page d'essai validée (v22). |
| `avant-l-hiver/jeu.js` | Le poste : écoute la base, écrit la ligne de l'élève ou l'état du Seigneur (photo avant chaque geste), calculatrice. |
| `avant-l-hiver/dessins.js`, `blasons.js`, `textes.js` | Paysans, plateau, logos ; les 22 figures et 8 couleurs ; les textes d'aide. |
| `avant-l-hiver/symboles.js` | GÉNÉRÉ par `python outils/stratelog/symboles.py` (dessins gravure d'octobre, `shapely` requis). Ne pas modifier à la main. |

La partie vit dans la base de classe `jeux/{groupe}/stratelog-avant-l-hiver` (une par classe, demi-groupes compris).
**Aucune règle Firebase nouvelle** : l'élève n'écrit que sa ligne, à la clé de son uid. Habillage : `styles/stratelog.css`
(tout sous `.strat`) et trois polices dans `styles/polices/` (UnifrakturMaguntia, Alegreya SC, Alegreya italique, OFL).

Source de la règle : fiche `stratelog-ep1-allege.md` (partie 1) et simulateur `stratelog-sim-v15.py`, dans les
fichiers du projet Claude (`/mnt/project-files/knowledge/claude/`). Le cadrage du parcours (rôles, absents,
villes, blasons, tableau projeté) est dans `/mnt/project-files/stratelog/CADRAGE-parcours-avant-l-hiver.md`.

## Tests

Stratelog a sa suite, à part de celle de Prepalog et Simulog (25/11/2026) : `node outils/test-stratelog.mjs` lance les deux étapes ci-dessous. La grande suite ne joue plus Stratelog.

À part de la suite Simulog (aucun navigateur, moins d'une seconde) :

```
node --test stratelog/avant-l-hiver/*.test.mjs
node outils/test.mjs stratelog                      # une partie jouée à 5 onglets (enseignant + 4 élèves)
node stratelog/avant-l-hiver/equilibre.mjs        # 1 000 parties à 3, 4 et 5 villes
```

Le contrôle d'équilibre donne **165 points, famine 7 %** pour la ville honnête (v15 : 165, 6 %). Une partie
tracée tour par tour donne exactement les mêmes chiffres que le simulateur Python. La note moyenne diffère
(17,9 contre 17,2) parce que les égalités ne se départagent pas de la même façon (voir CHOIX 2).

## Choix faits là où la fiche ne dit rien

Validés par Tristan le 21/11 : 2 (égalité), 7 (équipes au déchargement), 9 (équipes placées d’office).

1. **Reste d'un achat** : ce qui ne tient pas dans les charrettes écrites arrive au tour suivant ; son
   transport (2 deniers par charrette) se paie à ce moment-là.
2. **Égalité de score** : les villes à égalité prennent la même note de classement, celle de la meilleure place
   (le simulateur faisait la moyenne des places).
3. **Tour d'essai** : joué comme un été.
4. **Case « place à la halle »** : demandée seulement si un achat, une vente ou un chantier touche le bois, la
   pierre ou le drap.
5. **Case « réserve »** : demandée dès qu'il y a un achat (cocher à tort ou oublier de cocher = case fausse).
6. **Coût et quantité reçue attendus** : calculés avec le bon nombre de charrettes ; la caisse attendue, elle, avec
   les charrettes réellement écrites (c'est ce qui sort vraiment).
7. **« Équipes au déchargement »** (citée dans la fiche) : pas notée, parce que c'est une décision et non un
   calcul ; l'écran montre ce qui reste au quai.
8. **Route coupée** : ne retient que le bois et la pierre achetés ce tour (le simulateur retenait tout le quai).
9. **Ville sans dépôt** (rare : le Seigneur peut forcer le rendu, qui dépose ce qui est rempli) : aucun achat,
   chantier ni bonus, mais ses équipes sont placées d'office (champs, quai, atelier, carrière, bûcheron) pour ne pas
   ajouter une famine à la sanction (décision de Tristan du 21/11 : « rien ne produit » faisait double sanction).
10. **Larcin (ex-« coup de main ») contre une ville en sommeil** : il échoue, les 20 deniers sont perdus, sans perte de réputation.
11. **Livraison avec écart** : touche le premier achat de bois ou de pierre d'au moins 10 unités du tour fixé ;
    le manquant (un quart arrondi à 5, au moins 5) est retiré de la dernière charrette.
