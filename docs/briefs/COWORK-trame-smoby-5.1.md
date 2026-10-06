# Brief — trame élève ENT-5.1 Smoby (déposée par Cowork le 06/10/2026 au soir)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COWORK-trame-smoby-5.1.md : commite les fichiers de la trame ENT-5.1 déposés par Cowork (liste §2), sans rien déclarer. Ne touche à aucun autre fichier.
> ```

**Statut** : **livré** le 06/10/2026 (relue et validée par Tristan, trame déclarée).

## 1. Ce que c'est

Trame élève d'ENT-5.1 au **format long** (6 étapes + feuille de cours à détacher, 8 pages), sur le modèle des trames
Picard / Spartoo. **Décision de Tristan du 06/10/2026 au soir** : entre deux propositions (courte de 2 pages, longue
de 8 pages), il a choisi la longue, et **la règle « trame courte de 1-2 pages » des briefs Smoby (§9) et de la fiche
« élève de 2de » est suspendue pour le moment**. Les briefs ENT-5.x §9 disent encore « trame courte » : à lire comme
« trame au format long ».

Étapes : 1 Découvrir Smoby (Internet + 3 QCM M1 agents économiques) · 2 Message de Sophie et fiche de poste · 3 Le
CACES a une date de fin (tableau de validité) · 4 Trier les cinq candidats (tableau papier, puis l'écran) · 5 CDD ou
CDI ? (3 QCM M5 contrat de travail, intérim) · 6 Répondre à Sophie (« tu poli »). Feuille à détacher : recto cours
seulement (`feuille_cours`, pas d'entrée dans `feuilles_detachables.py`).

## 2. Fichiers déposés (neufs, à commiter tels quels)

- `outils/trame-smoby-recrutement.py` : le générateur. Il **inscrit lui-même** ses réponses dans `corriges_data._DICOS`
  (comme Cdiscount) : `outils/corriges_data.py` **n'est pas modifié** ;
- `contenus/trames/ENT-5.1-smoby-recrutement-trame-eleve.docx` et `.pdf` ;
- `contenus/corriges/ENT-5.1-trame.js` (généré : 41 questions). Le corrigé calculé de la séance `ENT-5.1.js`
  **n'est pas touché** ;
- `contenus/trames/logos/smoby.png` : `smoby.svg` converti en PNG (cairosvg, hauteur 1 200 px, rognée aux bords)
  car Word n'insère pas le SVG.

Message de commit proposé : « Smoby : trame élève ENT-5.1 et son corrigé (non déclarée) ».

## 3. Plus tard, quand Tristan aura relu la trame (pas avant)

1. Retirer `sansTrame` et déclarer `trame: { pdf, docx }` dans `activites/smoby-recrutement.js`.
2. Dans `contenus/corriges/ENT-5.1.js`, importer `CORRIGE` de `./ENT-5.1-trame.js` et ajouter ses `items` après ceux
   calculés (comme Picard).
3. Régénérer : `python3 outils/trame-smoby-recrutement.py` puis
   `soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/ENT-5.1-smoby-recrutement-trame-eleve.docx`.

## 4. Points à relire par Tristan

- **Étape 6 et sa question QCM** donnent la formule « Peux-tu valider ? Merci, bonne journée. », celle du **lot A** de
  `SMOBY-retours-5.1-5.2.md`. Tant que le lot A n'est pas en ligne, l'écran propose encore « Pouvez-vous valider ?
  Cordialement, » : **ne pas distribuer la trame avant le lot A**.
- Questions d'économie-droit : M1 (agents économiques) et M5 (contrat de travail, CDD / CDI / intérim). Elles supposent
  que les notions sont vues ou découvertes avec la trame (encadrés de rappel aux étapes 1 et 5).
- Vérifié : groupe Simba Dickie (allemand), 4 sites du Jura, entrepôt de 30 000 m², 350 salariés, 45 % à l'export,
  25 à 60 personnes à la logistique selon la saison. **Non demandés** : l'année de création (1924 ou 1926 selon les
  sources) et l'année du rachat (sources en désaccord).
- Pages à moitié vides (une étape par page) : normal pour ce format. Pagination faite avec LibreOffice ; l'ouvrir dans
  Word avant d'imprimer.

## Compte rendu *(rempli par Claude Code)*

- 06/10/2026 : Tristan a relu et validé la trame. Fichiers de Cowork commités tels quels (§2), puis trame déclarée (§3) :
  `trame: { pdf, docx }` à la place de `sansTrame` dans `activites/smoby-recrutement.js` ; corrigé de la trame (41 questions,
  étapes marquées « (trame) ») ajouté après les 3 calculés dans `contenus/corriges/ENT-5.1.js`, comme ENT-5.2.
- Pas de régénération (§3, point 3) : les fichiers déposés sont ceux que Tristan a relus.
- Lot A de `SMOBY-retours-5.1-5.2.md` vérifié en ligne : l'écran propose bien « Peux-tu valider ? Merci, bonne journée. » (§4).
- Test : `outils/test/smoby.mjs`, cas « ENT-5.1 : les attendus calculés… » vérifie 3 + 41 items (éprouvé : sans le corrigé de
  la trame, il tombe).
