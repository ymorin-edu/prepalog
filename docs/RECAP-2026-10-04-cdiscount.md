# Récapitulatif de la nuit du 04/10/2026 — refonte Cdiscount (C3 à C9)

Pour Tristan, à lire ce matin. Tout est **commité et poussé** sur `main`, la suite de tests est **verte (545/545)**.
**Toutes les séances Cdiscount sont fermées aux élèves** (`ouverture: 'prof'`) : rien n'a changé pour eux.

## Ce qu'il te reste à faire (dans cet ordre)

1. **Essayer à l'écran**, en enseignant, chaque séance (page d'essai : `outils/essai-cdiscount.html`, et
   `outils/essai-tableur.html` pour le geste tableur seul). Les points à regarder sont plus bas, séance par séance.
2. **Le geste tableur sous Excel ET sous LibreOffice** : exporter, écrire les formules, déposer. C'est le seul point que les
   tests ne peuvent pas prouver : ils fabriquent les classeurs eux-mêmes. ⚠ Le fichier témoin « Excel » de l'essai du 03/10
   n'a probablement **jamais été réenregistré par Excel** (même contenu que le fichier « à ouvrir dans Excel ») : un vrai
   dépôt depuis Excel reste à faire.
3. **L'évaluation ENT-2.5 avec deux identifiants d'élève** : deux allées différentes, même difficulté, aucun retour à
   l'écran, la copie rendue dans le suivi, et le corrigé de chaque élève dans l'onglet Corrigés.
4. Ouvrir toi-même les séances à ton groupe (« Conduite de séance ») quand tu les as validées. **ENT-2.3 et ENT-2.4 étaient
   ouvertes aux élèves avant la renumérotation** : elles sont fermées depuis (décision du brief C3).
5. **Cowork** : trames élève de 2.1 (à refaire), 2.2, 2.3, 2.4, 2.6 ; corrigés ; fiche d'intention Cdiscount (elle doit dire
   que c'est **toi** qui dis « Absent » à un élève en ENT-2.3, et où lire le corrigé par élève d'ENT-2.5) ; une ligne dans la
   fiche du format d'inventaire (le « périmètre »).

## « Jusqu'à C12 »

Il n'existe pas de C10, C11 ni C12 dans le dépôt : la série Cdiscount s'arrête à C9 (ordre C1 → C9, puis C8). **Toute la
série est faite.** Si tu pensais à autre chose (la vue Planning, prévue « après Cdiscount » ?), dis-le-moi : c'est un
autre chantier, à cadrer d'abord.

## Ce qui a été fait

| Chantier | Séance | Ce que ça donne | Commit |
|---|---|---|---|
| C3 | renumérotation | inventaire → **ENT-2.3**, régularisé → **ENT-2.4** (ids inchangés, aucun score perdu) | « Cdiscount renuméroté… » |
| C4 lot 0 | moteur | l'écran Inventaire ne montre que le **périmètre** choisi par la séance | « Écran Inventaire : périmètre… » |
| C4 | **ENT-2.3** | l'élève redonne sa liste à Nadia, ne compte qu'elle ; un oubli revient par un aléa ; « Absent » → liste d'un collègue | « ENT-2.3 recadrée… » |
| C5 | moteur | le **geste tableur** : « Exporter » (vrai .xlsx), menu « Fichiers », dépôt contrôlé, retour selon le temps | « Geste tableur… » |
| C6 | **ENT-2.2** (nouvelle) | exporter les constats, Écart / SI / NB.SI, écrire la liste à recompter | « ENT-2.2… » |
| C7 | **ENT-2.4** | commence par l'export des ajustements (SI, NB.SI) ; vendeur de la place de marché (fictif) | « ENT-2.4 recadrée… » |
| C9 | **ENT-2.6** (bonus, nouvelle) | export sale à nettoyer, NB.SI.ENS, RECHERCHEV, cinq références par la valeur | « ENT-2.6 bonus… » |
| C8 | **ENT-2.5** (évaluation, nouvelle) | boucle complète sur l'allée C, **une allée tirée par élève**, copie rendue | « ENT-2.5 évaluation… » |

Ordre dans Logisim, sous le logo Cdiscount : ENT-2.1, 2.2, 2.3, 2.4, 2.5, 2.6.

## Décisions que j'ai prises seul (à corriger à l'écran si besoin)

Le détail est dans la section « Compte rendu » de chaque brief (`docs/briefs/`) et dans `docs/decisions.md`. Les plus
importantes :

- **Compétence C1.6 seule partout.** Les briefs proposaient d'ajouter C3.2 : dans le code, C3.2 est « traçabilité », pas
  « tableur ». Y ranger des séances de tableur aurait faussé cette note.
- **Le geste tableur** : le « bandeau d'aide » n'existait pas ; c'est un bouton **« Rappel tableur »** dans le bandeau de
  l'entreprise, qui déplie une ligne sous lui (hors de l'écran de travail). Un fichier texte renommé en .xlsx est refusé
  (« Ce fichier n'est pas un classeur. »). Tolérance sur les valeurs : 1 millionième.
- **Plus d'étiquette « Tout à l'écran »** sur les séances qui passent par le tableur (2.2, 2.4).
- **ENT-2.3** : la liste reconnaît toute l'allée A (12 références, pas 8) ; le taux se calcule sur la liste de l'élève
  (6,9 % pour la bonne liste ; l'ancien 3,7 % sur toute l'allée est désormais faux). Les constats sur les bons sont 10
  (CHG 3, CAB 3, BAT 2, COQ 2).
- **ENT-2.2** : deux jours avant ENT-2.3 ; 30 lignes (45 en confirmé), **8 constats** (CHG 3, CAB 2, COQ 2, BAT 1) ; la
  liste est jugée sur la synthèse **déposée** par l'élève. Préparateurs nommés (inventés) : Yanis Cazenave, Inès Lagarde,
  Sofiane Brettes.
- **ENT-2.4** : 20 ajustements (30 en confirmé), un seul sans document (les mixeurs, AJ-26-0217) ; le vendeur Julien Mounet
  (Bassin Cuisine) est annoncé fictif en pied de message. Cohérence à relire : avant la livraison il y avait 6 mixeurs en
  stock propre ; les 5 vendus sortent de ceux-là ; les 12 du vendeur deviennent 8 après l'ajustement.
- **ENT-2.6** : données fabriquées par un générateur à graine fixe (151 lignes propres, 158 brutes) ; top 5 par valeur :
  ECO, CHG, CLA, BOU, MIX ; par fréquence : PIL, CAB, SUP, CHG, CLA ; BAT-10K n'entre dans les cinq que si l'on oublie la
  date du dernier inventaire.
- **ENT-2.5** : j'ai ajouté des réceptions au tirage (sans elles, le taux d'écart dépassait presque toujours 8 %). Le compte
  rendu se juge sur ce que l'élève a **réellement** régularisé à l'écran. 300 élèves tirés dans les tests : aucun jeu de
  secours.

## Ce que j'ai touché dans le moteur (règle « un chantier moteur à la fois » : j'étais seul inscrit)

- `core/types/inventaire.js` : le périmètre (`perimetre`, `attentePerimetre`).
- `core/types/export-tableur.js` (**neuf**) : le geste tableur ; `core/types/classeur.js` (**neuf**) : les fonctions sans
  écran de `tableur.js` déplacées là, **sans changement** (les séries TAB restent vertes).
- `core/types/entreprise.js` : branchement du périmètre, du geste, de l'inventaire tiré par élève.
- `styles/base.css` : 5 règles pour le geste (aucune variable de couleur modifiée).
- **`outils/test.mjs` : une ligne** (le bloc `tableur-export` dans `BLOCS`). `outils/test/commun.mjs` non touché.
- **Cas de tests existants réécrits** (je te le dis, comme convenu) : `visibilite` (l'inventaire est servi sans son
  « ouverture » pour garder un cas « prête »), `socle` (le cas de la carte Cdiscount ouvre d'abord une séance ; la liste
  Logisim gagne ENT-2.2, 2.5, 2.6), `cdiscount` (la partie ENT-2.3 réécrite ; ENT-2.4 : les anciens cas portent sur les six
  jalons d'enquête, 6 messages au lieu de 5).
- **Aucune règle Firebase modifiée.** Rien de nouveau ne part ailleurs que dans la base de l'élève (le résultat du contrôle,
  jamais le fichier).

## Ce qui n'est pas vérifié

- Le mode réel (Firebase) : la suite ne le couvre pas. Les dépôts rangent quelques objets de plus dans la base de l'élève
  (`db.tableur`) : taille modeste.
- Un vrai classeur Excel (voir plus haut) et LibreOffice déposés à la main.
- Le rendu sur un petit écran de la page « Fichiers ».
- Une base d'essai d'ENT-2.3 ouverte **avant** cette nuit (en enseignant) garde l'ancien contenu et son écran Inventaire
  attend une liste : « Recommencer » sur la page d'essai, ou une base neuve, règle la question. Aucun élève concerné.

## Pour reprendre dans une nouvelle conversation

Tout est dans le dépôt : ce fichier, `docs/decisions.md`, les comptes rendus des briefs, `docs/briefs/COORDINATION-cdiscount.md`.
C'est le bon moment pour repartir de zéro.
