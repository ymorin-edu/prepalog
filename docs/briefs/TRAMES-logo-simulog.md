# Brief — Logo Simulog en tête des 14 trames élève

- **Statut** : livré (Claude Code, 04/10/2026)
- **Rédigé par** : Cowork, 04/10/2026
- **Modèle conseillé** : Sonnet
- **Durée estimée** : ~15 min (5 fichiers à modifier, 14 générateurs à relancer, conversion PDF)
- **À lancer après** le brief `COWORK-reprise-trames.md` (relu, commité, poussé, ligne Cowork
  effacée de `docs/EN-COURS.md`) : il touche les mêmes fichiers.

## 1. Ce que veut Tristan

Décision du 04/10/2026, proposition **A** : en page 1 de chaque trame, l'ancien logo rond Prepalog
(`styles/logo.png`, 1,15 cm) **et** le mot « Simulog » tapé à côté sont remplacés par **le logo
Simulog en une seule image** (écran + carton en vert `#107c41`, face du carton vert clair, « Simu »
noir, « log » vert), hauteur **1,3 cm**. Le logo de l'entreprise à droite ne change pas.

Essai fait par Cowork sur ENT-4.1 : la page 1 tient toujours sur une page.
Aperçus : `Claude outputs\trame-simulog-A-couleur.pdf` et `trame-simulog-3-propositions.png`.

Exception assumée à la règle « la trame est en noir et gris » : comme l'ancien logo Prepalog, ce
logo porte du vert ; il reste dans la bande des logos de la page 1.

## 2. Le fichier fourni

`docs/briefs/logo/simulog-trame.png` → à copier dans `contenus/trames/logos/simulog.png`.
PNG 1400 × 352, fond transparent, rendu depuis le SVG du logo (texte en tracés).
Empreinte SHA-256 : `7ff7ccbaf7c54c438ddd482daea82f83d0dfc6efb2350f01076600b597d7adf0` — vérifier
après copie.

## 3. Ce qu'il faut changer

Le même bloc d'en-tête est écrit à **cinq** endroits :

- `outils/trame_commun.py`, fonction `entete()` (sert aux 10 générateurs qui font `import trame_commun`
  pour leur en-tête : Cdiscount ×5, Picard ×3, Boost ENT-3.2 et 3.3) ;
- `outils/trame-boost-tournee.py`, `outils/trame-spartoo.py`, `outils/trame-spartoo-reception.py`,
  `outils/trame-spartoo-tracabilite.py` (en-tête écrit en dur).

Dans chacun, remplacer :

```python
if os.path.exists(LOGO_PREPALOG):
    par.add_run().add_picture(LOGO_PREPALOG, height=Cm(1.15))
r = par.add_run('  Simulog')
r.bold = True; r.font.size = Pt(20); r.font.color.rgb = TITRE
```

par :

```python
if os.path.exists(LOGO_SIMULOG):
    par.add_run().add_picture(LOGO_SIMULOG, height=Cm(1.3))
else:
    r = par.add_run('Simulog'); r.bold = True; r.font.size = Pt(20); r.font.color.rgb = TITRE
```

avec `LOGO_SIMULOG = os.path.join(RACINE, 'contenus', 'trames', 'logos', 'simulog.png')` à côté de
`LOGO_PREPALOG` (et retirer `LOGO_PREPALOG` là où il ne sert plus : grep). Le tabulateur et le logo de
l'entreprise qui suivent ne bougent pas.

## 4. Régénérer

1. Relancer les 14 générateurs `outils/trame-*.py`. Ils réécrivent aussi les corrigés
   `contenus/corriges/*.js` : **ceux-ci doivent sortir identiques** (`git diff contenus/corriges`
   vide). Sinon, s'arrêter et le dire à Tristan.
2. PDF **avec l'option qui garde les pages blanches** (sans elle, la feuille à détacher tombe au dos
   d'une étape) :

   ```
   soffice --headless --convert-to 'pdf:writer_pdf_Export:{"IsSkipEmptyPages":{"type":"boolean","value":"false"},"ExportBlankPages":{"type":"boolean","value":"true"}}' --outdir contenus/trames contenus/trames/*.docx
   ```

## 5. Vérifier

- **Même nombre de pages** qu'avant pour chacun des 14 PDF (relever avant, comparer après).
- Page 1 : le logo Simulog à gauche, le logo de l'entreprise à droite, sur la même ligne ; plus de
  rond Prepalog ni de « Simulog » tapé.
- Aucun « Logisim » réapparu.
- Suite entière (`node outils/test.mjs`), en particulier « toute trame déclarée existe ».

## 6. Commit

Par nom de fichier : le PNG, les 5 `.py`, les 28 `.docx`/`.pdf`. Message suggéré :
« Trames élève : logo Simulog en tête de la page 1 ». Pousser.

## 7. Compte rendu (à remplir par Claude Code)

Claude Code, 04/10/2026.

- **Fait comme écrit** : logo copié dans `contenus/trames/logos/simulog.png`, empreinte SHA-256 vérifiée
  après copie (identique) ; les cinq en-têtes remplacés, `LOGO_PREPALOG` retiré partout (plus aucune
  occurrence dans `outils/`) ; 14 générateurs relancés ; **corrigés identiques** (`git diff contenus/corriges`
  vide) ; PDF refaits avec l'option qui garde les pages blanches.
- **Vérifié** : même nombre de pages avant/après pour les 14 PDF (10 à 14) ; plus aucun « Logisim » ni
  « Simulog » tapé ; deux images en page 1 ; « L'essentiel » (feuille à détacher) sur une page impaire et
  sur les deux dernières pages des 14 PDF ; page 1 d'ENT-4.1 et d'ENT-1.1 regardée en image : logo Simulog
  à gauche, logo de l'entreprise à droite, même ligne.
- LibreOffice n'était pas installé sur le PC de Tristan : installé (winget, avec son accord) pour ce brief.
