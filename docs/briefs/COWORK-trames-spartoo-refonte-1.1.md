# Cowork → Claude Code : trames Spartoo après la refonte d'ENT-1.1 (06/10/2026, soir)

> Écrit par Cowork, d'après la section « Pour Cowork » de `ENT-1.1-spartoo-quai.md` (lue à l'écran par Claude Code).
> Cowork n'a pas de terminal : **à commiter par Claude Code**.
>
> **Trame d'ENT-1.1 RELUE ET VALIDÉE par Tristan le 06/10/2026 (soir)** (règle 6 : elle peut rester déclarée).
> **Trame d'ENT-1.2 validée par Tristan le 06/10 (soir)** : rappel console à l'étape 3, cases de réponse agrandies, étape 2
> sur deux pages (13 pages). **Trame d'ENT-1.3** : cases agrandies, définitions de l'étape 1 en blocs de réponse, bandeau de
> fin de séance cité à l'étape 7 (10 pages) — **validée par Tristan le 06/10 (soir)** ; son `.docx/.pdf` et `ENT-1.3.js` sont donc à commiter aussi,
> avec `outils/trame-spartoo-tracabilite.py`.

## Fichiers écrits dans le dépôt (garde sur la date de modification)

| Fichier | Ce qui change |
|---|---|
| `outils/trame-spartoo-reception.py` | Trame d'ENT-1.1 **refaite en entier** (8 étapes, voir plus bas) |
| `contenus/trames/ENT-1.1-spartoo-reception-trame-eleve.docx` / `.pdf` | Générés (18 pages dont la feuille à détacher) |
| `outils/trame-spartoo.py` | ENT-1.2, étape 3 : la console n'est plus expliquée, **simple rappel** + `.getprice` / `.getsupplier` |
| `contenus/trames/ENT-1.2-spartoo-preparation-trame-eleve.docx` / `.pdf` | Générés (12 pages) |
| `outils/corriges_data.py` | `ENT_1_1` réécrit ; `ENT_1_2` : stock 4 635, deux questions console passées en 1.1 ; `ENT_1_3` : 66 paires au lot |
| `contenus/corriges/ENT-1.1.js`, `ENT-1.2.js`, `ENT-1.3.js` | Régénérés par les trois générateurs |

La trame d'ENT-1.3 (`.docx` / `.pdf`) **ne change pas** : elle n'écrit aucune quantité. Seul son corrigé change.

## La trame d'ENT-1.1 (déroulé)

1. Découvrir Spartoo — 4 faits par recherche, puis **textes imprimés** (conditions de retour Spartoo : 30 jours, gratuit ;
   loi : art. L221-18, 14 jours), tableau « loi / Spartoo », QCM dont « Les 30 jours de Spartoo, c'est… » (retour E1).
2. Le BL et les réserves — **document dans la trame** (BL, réserve précise, « sous réserve de déballage » sans valeur,
   L133-3 cité) ; les questions se répondent dedans (retour E2).
3. Encart ⚠ « À partir d'ici, tu travailles dans Prepalog » + connexion pas à pas + questionnaire de la procédure (retour E3).
4. Recevoir le camion — relevé du BL au quai, conversion cartons × 6.
5. Compter la palette (4 faces, carton manquant n° 9, carton n° 6 abîmé face arrière), réserves, signature.
6. Retrouver sa réception par le n° de BL (sans nommer le piège), saisie en paires, confirmation.
7. **Découvrir la console** (`.help`, `.movements`, `.getstock`, `.getlot`) et vérifier — décision de Tristan :
   « on évite la répétition de l'explication console entre 1.1 et 1.2 ».
8. Réserves à Puma (« 6 paires » ou « 1 carton » acceptés), bandeau de fin de séance.

Retouches de Tristan pendant la relecture (06/10, soir) : cases de réponse plus grandes ; encart **PCB** (« par
combien ») et colonnes « Cartons annoncés par le fournisseur / Paires par carton (PCB) / Paires annoncées (cartons ×
PCB) » à l'étape 4 ; **règle des 3 tonnes** (contrat type général, art. 7.1 / 7.2, décret 2017-461) + question + QCM
à l'étape 4 ; réflexion de l'étape 4 = « le chauffeur pressé » ; **explication de la console reprise mot pour mot de
l'ancienne étape 3 d'ENT-1.2** (étape 7) ; encadré à l'étape 5 : le chef de quai ouvre le carton abîmé, chaussures
intactes (l'écran ne montre pas l'intérieur du carton).

Mesure du PDF (LibreOffice) : 18 pages, aucune page sous 55 %. Les étapes 2, 4, 5, 6, 7 tiennent sur deux pages équilibrées
(« saut_avant »), pour laisser de la place aux réponses.

## `outils/test-seances.mjs` : ce qui change pour lui (il lit les corrigés par début de question)

Cowork a vu le fichier en cours de modification (06/10, ~19 h) : à recaler **après** avoir intégré ces corrigés.

- **ENT-1.1** — questions disparues : « Dans quels deux cas », « Dans quel cas seulement », « À quoi sert le numéro de lot »
  (remplacées par le questionnaire à l'écran), « Sur quelle référence y a-t-il un écart », « Quelle référence est arrivée dans
  un carton endommagé », « Quel fournisseur .getlot », « Pourquoi la ligne « Sorties » ». Nouvelles, utilisables : « Quel numéro
  de carton manque » (n° 9), « Sur quelle face » (arrière), « Quel est le numéro de ta réception » (REC-04127), « Combien de
  paires, au total, sont entrées » (66), « Pourquoi n'y a-t-il encore aucune sortie » (note : « Aucune sortie : tout le lot est
  encore en stock. »), « Avec .getstock PM-SUE-MA-41 » (30), « Ta palette de chaussures pèse » (le transporteur),
  « Le chauffeur te dit » (réflexion), « Pourquoi la réception de Reebok » (genre question). Tableaux par étape : 4 → [Information, Lignes en cartons avec PCB],
  5 → [Comptage en cartons], 6 → [Saisie en paires], 7 → [3 commandes au choix de l'élève], 1 → [Loi / Spartoo].
  Attention : « Combien de paires, au total, » est le début de DEUX questions (étapes 6 et 7) : préciser « …sont entrées ».
- **ENT-1.2** — l'étape 3 n'a **plus de tableau** (`tableau(C12, 3, 0)` tombe) ni « Par quel caractère commence » : ils sont
  passés en ENT-1.1, étape 7. Stock total attendu : 4 635.
- **ENT-1.3** — mêmes questions, nombres recalculés : entrées 24 / 18 / 24 (66), reste 21 / 17 / 22 (60), `.getstock`
  38 / 29 / 39.

## À vérifier avant de pousser

- `node outils/test.mjs` : la trame déclarée existe toujours sous le même nom.
- Libellés repris du brief, **non vus par Cowork à l'écran** : « ⟲ Tourner / Tourner ⟳ », « Quai de réception » grisé et
  son message, « Le quai est ouvert : va recevoir le camion », « Réception validée », la fenêtre de confirmation.
- Stock total d'ENT-1.2 (4 635) et `.getstock` d'ENT-1.3 (38 / 29 / 39) : **calculés**, à constater à l'écran.
- Word peut paginer autrement que LibreOffice.

## Phrase pour Claude Code

« Lis `docs/briefs/COWORK-trames-spartoo-refonte-1.1.md` : les trames d'ENT-1.1, 1.2 et 1.3 sont validées. Recale `outils/test-seances.mjs`
sur les nouveaux corrigés, lance les tests, puis commite et pousse les fichiers listés avec la refonte d'ENT-1.1. »
