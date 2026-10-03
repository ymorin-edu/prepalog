# Brief — trames élève Picard ENT-4.1, 4.2, 4.3 (déposées par Cowork le 03/10/2026)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/PICARD-trames-eleve.md : commite les fichiers de trame Picard déposés par Cowork (liste §2), sans rien déclarer. Ne touche à aucun autre fichier.
> ```

**Statut** : **livré** le 03/10/2026 — trames relues et validées par Tristan, déclarées ; compte rendu en fin de brief.

## 1. Ce que c'est

Les trois trames élève Word/PDF des séances Picard, sur le modèle d'ENT-3.1 (règles de la fiche
`prepalog-trames-eleve` : page 1 = en-tête + sommaire, une étape par page, une question = une zone, une analyse
réflexive par étape, noir et gris). Pas de trame pour ENT-4.4 (évaluation), décision de Tristan.

| Séance | Trame | Pages | Étapes |
|---|---|---|---|
| ENT-4.1 | `contenus/trames/ENT-4.1-picard-premier-camion-trame-eleve.{docx,pdf}` | 9 | 7 (dont étape 1 sur Internet : Picard, entrepôt GXO) |
| ENT-4.2 | `contenus/trames/ENT-4.2-picard-deux-camions-trame-eleve.{docx,pdf}` | 9 | 6 (étape 1 : le camion frigorifique) |
| ENT-4.3 | `contenus/trames/ENT-4.3-picard-reception-de-nuit-trame-eleve.{docx,pdf}` | 9 | 7 (étape 1 : l'article L133-3 recopié dans la trame, sans recherche) |

Libellés des boutons relevés sur l'écran réel (vue quai) le 03/10/2026 au soir.

## 2. Fichiers déposés (à commiter tels quels)

- `outils/trame_commun.py` (neuf) : les fonctions de mise en page d'ENT-3.1, mises en commun ;
- `outils/trame-picard-premier-camion.py`, `outils/trame-picard-deux-camions.py`, `outils/trame-picard-reception-de-nuit.py` (neufs) ;
- `outils/corriges_data.py` (modifié) : réponses `ENT_4_1`, `ENT_4_2`, `ENT_4_3` + paramètre `fichier=` de
  `ecrire_corrige` (sans effet sur les trames existantes : leurs corrigés régénérés sont identiques) ;
- `contenus/corriges/ENT-4.1-trame.js`, `ENT-4.2-trame.js`, `ENT-4.3-trame.js` (neufs, générés) : le corrigé
  **de la trame**. Le corrigé de la séance `ENT-4.x.js`, calculé depuis les palettes, **n'est pas touché** ;
- `contenus/trames/logos/picard.png` (neuf) : le logo SVG converti en PNG (Word n'insère pas le SVG) ;
- les 6 fichiers de trame ci-dessus.

Message de commit proposé : « Picard : trames élève ENT-4.1, 4.2, 4.3 et leurs corrigés (non déclarées) ».

## 3. Plus tard, quand Tristan aura relu une trame (pas avant)

1. Déclarer `trame: { pdf, docx }` dans `activites/picard-ent4x.js` (règle : déclarer = valider).
2. Montrer le corrigé de la trame dans l'onglet Corrigés : dans `contenus/corriges/ENT-4.x.js`, importer
   `CORRIGE` de `./ENT-4.x-trame.js` et ajouter ses `items` après ceux calculés (et remplacer la ligne
   `trame: '(pas encore de trame…)'` par le nom du fichier). Vérifier que l'onglet affiche les deux blocs.
3. Régénérer (si une trame change) : `python3 outils/trame-picard-<nom>.py` puis
   `soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/ENT-4.x-*.docx`.

## 4. Points à relire par Tristan

- La **règle du quai à trois zones** (−18 / −15 °C) n'est écrite nulle part à l'écran : les trames la donnent
  (encadré « règle de l'exercice »).
- ENT-4.1 : en guidage, le choix sous le ticket n'a pas de retour immédiat ; la trame le dit.
- ENT-4.2 : la trame ne dit pas quel camion passer en premier ; les tableaux des étapes 4 et 5 ne pré-impriment
  pas les palettes (elles dépendent du choix).
- ENT-4.3 : la trame annonce ce que le logiciel lit dans les deux messages (N1…N5, nombres et date en chiffres).

## 5. Tranché par Tristan le 03/10/2026 (après la remise)

- Règle des trois zones : **gardée dans les trames** (encadré « règle de l'exercice »), rien à l'écran.
- ENT-4.3, étape 1 : **l'article L133-3 est recopié en entier dans la trame** (trois alinéas, mot pour mot, version
  en vigueur depuis le 10/12/2009), avec les mots difficiles expliqués ; plus de recherche Internet à cette étape.
  Nouvelle fonction `encadre_texte()` dans `outils/trame_commun.py`.
- ENT-4.1 : lignes « détail » du bilan **gardées telles quelles** (la trame fait remplir les trois cases).

## Compte rendu *(rempli par Claude Code, 03/10/2026)*

- **Fichiers** : les 16 fichiers du §2 commités tels quels (« Picard : trames élève ENT-4.1, 4.2, 4.3 et leurs
  corrigés (déposés par Cowork) ») ; puis `activites/picard-ent41.js`, `picard-ent42.js`, `picard-ent43.js` (champ
  `trame: { pdf, docx }`, commentaire « Pas de trame » remplacé) et `contenus/corriges/ENT-4.1.js`, `4.2`, `4.3`
  (import du `CORRIGE` de `ENT-4.x-trame.js`, `trame:` = nom du fichier, items de la trame **après** ceux calculés).
- **Écart (et pourquoi)** : l'onglet Corrigés regroupe les items **par numéro d'étape** ; les étapes de la trame
  (1 « Découvrir Picard »…) ont les mêmes numéros que celles de l'écran (1 « Le camion arrive »…), donc elles se
  seraient mêlées. Les items de la trame reçoivent `etape: '<n> (trame)'` : l'onglet affiche deux blocs, d'abord
  « Étape 1 — Le camion arrive »…, puis « Étape 1 (trame) — Découvrir Picard »… Rien touché dans `core/`.
- **Vérifié** : ordre des blocs relu pour les trois corrigés (ENT-4.1 : 34 items, 4.2 : 35, 4.3 : 33) ; les cas
  « corrigé » existants du bloc `picard` lisent toujours les items calculés. Suite entière **481/481**. Pas
  d'essai à l'écran de l'onglet Corrigés lui-même.
- **Un push = en ligne** : les trames sont maintenant téléchargeables depuis le bandeau des trois séances.
- **Reste ouvert** : aucun. Régénérer une trame : §3 point 3.

