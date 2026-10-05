# Brief de commit — fiche d'intention du scénario Smoby (Cowork, 04/10/2026)

> **📋 Phrase à copier-coller dans ccode (après le chantier en cours ENT-5.4) :**
>
> ```
> Lis docs/briefs/COWORK-intention-smoby.md et commite les fichiers qu'il liste (rien à construire, ne pas déclarer `intention`). Un seul commit, puis push.
> ```

**Statut** : à commiter — **ne pas déclarer** (Tristan ne l'a pas encore relue).
**Modèle** : Sonnet — **Durée** : 5 min. Ne touche ni au moteur ni aux fichiers du chantier ENT-5.4.

## Ce que Cowork a déposé (fichiers nouveaux)

| Fichier | Quoi |
|---|---|
| `outils/intention_commun.py` | Fonctions communes des fiches d'intention (Calibri, noir et gris, tableaux à largeur fixe, PDF par LibreOffice). Réutilisable pour Cdiscount, Picard, Boost. |
| `outils/intention-smoby.py` | Générateur de la fiche Smoby (`python outils/intention-smoby.py`). États par séance dans `ETATS` en tête. |
| `contenus/intentions/smoby-intention-pedagogique.docx` / `.pdf` | La fiche, 13 pages : partie A scénario (histoire, vérifié / construit, compétences, progression, gestes de l'enseignant, filet de sécurité), partie B une page par séance. |
| `contenus/trames/logos/smoby.png` | Le logo Smoby en PNG (tiré de `smoby.svg`, marges retirées) : python-docx ne lit pas le SVG. Sert aussi aux futures trames Smoby. |

## État de la fiche

- **ENT-5.1** : décrite d'après le code livré (`contenus/smoby-ent51.js`).
- **ENT-5.2 à 5.8** : marquées **PROVISOIRE**, écrites d'après les briefs. À chaque séance validée à l'écran, Cowork
  recale ses textes et régénère.
- Aucun secret (le scénario n'utilise aucun code d'accès).

## Ce qu'il ne faut PAS faire

- **Ne pas ajouter** `intention: { pdf, docx }` à la ligne Smoby de `ENTREPRISES` : déclarer, c'est valider (Tristan relit d'abord).

## Remarque relevée en passant (à corriger quand tu toucheras ce brief)

- `ENT-5.5-smoby-rangement.md` §1 indique **Rubrique : logisim** ; toutes les autres séances Smoby sont en **simulog**.
  Probablement une coquille : utiliser `simulog` à la construction d'ENT-5.5.
