# Brief — reprise des trames élève et feuilles à détacher (Cowork, 04/10/2026)

**Statut** : livré (relu, déclaré, commité et poussé par Claude Code le 04/10/2026)
**Modèle** : Sonnet (relecture, deux déclarations, suite, commit)
**Décision de Tristan** : toutes les trames sont **considérées comme validées** ; il les fait jouer par les élèves
et fera les retours. Ne pas attendre de relecture de sa part pour déclarer ENT-3.2 et ENT-3.3.

## 1. Ce que Cowork a fait

1. **Audit des 12 trames** puis corrections :
   - **Picard ENT-4.1 et 4.2** réécrites pour le nouveau poste du quai (fiche de contrôle, zone de calcul, ordre
     ① Compter → ② Sonder et lire l'étiquette → ③ Ma fiche de contrôle → ④ Décider, « ✓ Valider P1 »,
     « Palette suivante »). ENT-4.1 suit l'écran : étape 4 = P1 guidée bloc par bloc, étape 5 = P2 à P5.
   - **Cdiscount** : encadré « Ce que tu dois voir » d'ENT-2.1 étape 4 remis dans l'ordre ; doubles questions
     d'ENT-2.1 étape 6 et d'ENT-2.2 étape 3 séparées ; question à réponse unique d'ENT-2.6 étape 4 sortie du
     « Pour réfléchir ». **Bug corrigé** : la fiche de stock d'ENT-2.1 (étape 4) n'avait aucun titre de colonne
     visible (hauteur « exacte » appliquée à la ligne d'en-tête) ; lignes passées de 0,68 à 0,62 cm.
   - **Spartoo ENT-1.1, 1.2, 1.3** uniformisées : page 1 à trois encadrés (trame / ce que voit l'enseignant / vrai
     et inventé), « Ce que tu dois voir » et « Tu peux passer à l'étape N quand », tableaux préremplis, réflexions
     générales ou à réponse unique retirées, numérotation d'ENT-1.3 étape 6 et renvoi « étape 1 » d'ENT-1.2
     étape 6 corrigés, encadré d'ENT-1.1 étape 3 qui donnait la réponse retiré.
2. **Trames nouvelles : Boost ENT-3.2 et ENT-3.3** (`outils/trame-boost-ent32.py`, `outils/trame-boost-ent33.py`,
   réponses dans `outils/corriges_boost.py`, corrigés `contenus/corriges/ENT-3.2.js` et `ENT-3.3.js`).
   Pas de trame pour les évaluations ENT-2.5 et ENT-4.4 (décision antérieure).
3. **Feuille à détacher à la fin de chaque trame** (décision de Tristan) : cours au recto (« L'essentiel » à trous,
   lexique à compléter, banque de mots), activité « À la maison » au verso. Lexique commun et contenus :
   `outils/feuilles_detachables.py` ; rendu : `trame_commun.feuille_detachable(code)`. Les réponses entrent
   d'elles-mêmes dans les corrigés. La feuille commence **toujours sur une page de droite**.
4. **PDF des 14 trames regénérés** (ils disaient encore « Logisim »), avec l'option qui garde la page blanche :

   ```
   soffice --headless --convert-to 'pdf:writer_pdf_Export:{"IsSkipEmptyPages":{"type":"boolean","value":"false"},"ExportBlankPages":{"type":"boolean","value":"true"}}' --outdir contenus/trames contenus/trames/*.docx
   ```
   **Sans cette option, LibreOffice saute la page blanche** et la feuille à détacher tombe au dos d'une étape.

Vérifié par Cowork : chaque générateur tourne ; corrigés complets (aucune question sans réponse) ; une étape par
page, aucune page sous 35 % hors coupures choisies ; feuille sur page impaire et sur deux pages exactement dans
les 14 PDF ; aucun pixel coloré hors des logos ; plus aucun « Logisim » ; calculs des activités vérifiés par
`feuilles_detachables.verifier()`. **Non vérifié** : les libellés d'écran cités (repris du code, pas vus à l'écran).

## 2. Ce que Claude Code doit faire

1. Lire `git status` : les fichiers de Cowork sont listés en §3. **Ne commiter que ceux-là, par leur nom.**
2. **Déclarer les trames d'ENT-3.2 et ENT-3.3**, comme ENT-3.1 (`activites/boost-tournee.js`) :
   - `activites/boost-ent32.js` : `corrige: './contenus/corriges/ENT-3.2.js'` dans `meta`, et
     `trame: { pdf: './contenus/trames/ENT-3.2-boost-sous-contrainte-trame-eleve.pdf', docx: '…docx' }` passé à
     `creerEntreprise` (pas dans `meta` : un test le refuse) ;
   - `activites/boost-ent33.js` : idem avec `ENT-3.3.js` et `ENT-3.3-boost-a-corriger-trame-eleve.{pdf,docx}`.
   - Retirer de leurs en-têtes la phrase « Pas de trame élève ».
3. Vérifier que les corrigés **Picard `ENT-4.x-trame.js`** (qui ont maintenant des étapes « Cours à détacher » et
   « À la maison ») s'affichent bien à côté du corrigé calculé.
4. Lancer la suite entière (`node outils/test.mjs`), en particulier « toute trame déclarée existe ».
5. Commiter (message suggéré : « Trames élève : reprise de l'audit, ENT-3.2 et 3.3, feuilles à détacher, PDF
   regénérés »), pousser, **effacer la ligne Cowork de `docs/EN-COURS.md`**.

## 3. Fichiers écrits par Cowork

- `outils/` : `trame_commun.py`, `corriges_data.py`, `corriges_cdiscount.py`, `corriges_boost.py` (nouveau),
  `feuilles_detachables.py` (nouveau), `trame-boost-ent32.py` et `trame-boost-ent33.py` (nouveaux),
  `trame-boost-tournee.py`, `trame-cdiscount-{mouvements,chiffres,inventaire,regularise,priorites}.py`,
  `trame-picard-{premier-camion,deux-camions,reception-de-nuit}.py`, `trame-spartoo{,-reception,-tracabilite}.py`.
- `contenus/trames/` : les 14 `ENT-x.y-…-trame-eleve.docx` et `.pdf` (dont 4 fichiers nouveaux pour ENT-3.2, 3.3).
- `contenus/corriges/` : `ENT-1.1`, `1.2`, `1.3`, `2.1`, `2.2`, `2.3`, `2.4`, `2.6`, `3.1`, `3.2` (nouveau),
  `3.3` (nouveau) `.js`, `ENT-4.1-trame.js`, `ENT-4.2-trame.js`, `ENT-4.3-trame.js`.
- `docs/` : `decisions.md` (une ligne), `EN-COURS.md` (ligne Cowork), ce brief.

**À savoir** : pendant le travail de Cowork, des opérations git de Claude Code ont changé la date de fichiers de
Cowork (contenu identique, fins de ligne CRLF). Merci de ne jamais `git add -A` ni `commit -a` pendant qu'une
ligne Cowork est inscrite dans `EN-COURS.md`.

## Compte rendu *(rempli par Claude Code)*

Claude Code, 04/10/2026.

- **Relu** : générateurs et corrigés d'ENT-3.2 et 3.3. Les données de ces deux séances sont fixes
  (aucun tirage) : les nombres des corrigés concordent avec ceux écrits à la main dans le test Boost
  (218 kg, 15 h 40, 15 h 59 ; 166 kg sur la feuille d'Inès ; charge 190 kg, départ 14 h 35). Plus aucun
  « Logisim » dans les générateurs ni les corrigés.
- **Déclaré** : `corrige` dans `meta` et `trame: { pdf, docx }` passé à `creerEntreprise` dans
  `activites/boost-ent32.js` et `boost-ent33.js` ; phrase « Pas de trame élève » retirée des en-têtes.
- **Vérifié à l'écran** (onglet « Corrigés » de l'espace enseignant, mode démonstration) : ENT-3.2 et
  ENT-3.3 apparaissent sous Boost et s'affichent ; pour ENT-4.1, 4.2, 4.3, les étapes « Cours à détacher »
  et « À la maison » de la trame s'affichent après le corrigé calculé, marquées « (trame) ».
- **Deux défauts corrigés dans les générateurs** (la suite les a trouvés : « tout corrigé de trame
  déclaré existe… » échouait) :
  1. le brouillon de réponse à Inès (ENT-3.3) rangeait son message modèle sous `rep` au lieu de
     `modele` (`outils/corriges_boost.py`) : l'onglet « Corrigés » n'affichait rien ;
  2. les tableaux **donnés** des activités « À la maison » (rien à compléter) entraient dans le corrigé
     comme des tableaux vides (ENT-2.4, 3.1, 3.2, 3.3) : `outils/corriges_data.py` les écarte désormais.
  Seuls les quatre corrigés `.js` concernés ont été regénérés ; les Word et PDF de Cowork sont commités
  tels quels (le texte des trames ne change pas).
- **Suite** : entière avant correctif 629/630 ; après correctif, blocs `spartoo socle cdiscount picard`
  254/254 (les seuls qui lisent les corrigés).
- **Non vérifié** : la mise en page des PDF (reprise telle que Cowork l'a vérifiée) ; les libellés
  d'écran cités dans les trames.
- La ligne `docs/decisions.md` annoncée en §3 n'était pas dans le dépôt : ajoutée par Claude Code.
- Fichiers de Cowork commités par leur nom ; `.claude/`, `docs/briefs/NAVIGATION-precedent.md` et le
  brief du logo laissés hors de ce commit.
