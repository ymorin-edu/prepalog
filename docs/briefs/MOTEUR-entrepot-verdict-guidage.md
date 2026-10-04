# Brief moteur — Plan d'entrepôt : « Vérifier mon rangement » ne donne plus la réponse en guidage

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/MOTEUR-entrepot-verdict-guidage.md et applique-le (attends que le chantier « Plan d'entrepôt, lot 4 » soit effacé de docs/EN-COURS.md). Annonce la durée avant de commencer.
> ```

**Statut** : livré (04/10/2026)
**Date du brief** : 04/10/2026
**Conversation d'origine** : Cowork (essai d'ENT-5.5 par Tristan)
**Modèle** : Sonnet (correctif de quelques lignes dans une vue existante, pas une vue nouvelle).

## 1. Le constat (Tristan, à l'écran, ENT-5.5)

En **guidage**, on pose les 4 palettes n'importe où, on clique **« Vérifier mon rangement »**, et chaque carte affiche
l'explication complète de la faute, qui dit **où aller** : « type de produit : la gamme Cuisines se range en B2 »,
« rotation lente : T03-T04 », « parcours : produit lourd en début de parcours (allée A) »… Avec « Vérifier » illimité et
les jalons jugés sur le rangement final, l'élève obtient 9 / 9 sans rien décider. Le guidage est trop fort.

Code concerné (lu le 04/10) : `core/types/entrepot.js`, fonction `verdict()` du bandeau : en guidage, elle affiche
`✗ <nom du critère> : <texte de la faute>` pour toutes les fautes ; en entraînement, `✗ critère : <nom>` seulement.

## 2. Décisions de Tristan (04/10)

1. **En guidage, le verdict de « Vérifier mon rangement » devient le même qu'en entraînement** : `✓ bien rangée` ou
   `✗ critère : rotation` (le **nom** du ou des critères faux, sans le texte qui dit où aller). L'élève relit les règles
   et la consigne de la palette pour trouver.
2. **La note ne change pas** : jalons jugés sur le rangement final (formatif). Le nombre de vérifications reste une
   information pour l'enseignant (`verifs`, déjà lu dans le suivi).
3. Tout le reste du guidage est **gardé tel quel** : consigne de la palette en main (colonne de gauche), bandes de
   rotation, parcours dessiné, « Les règles ▾ », aide « charge déjà posée », refus immédiat d'un emplacement occupé.
4. Évaluation : inchangée.

## 3. Ce qu'il faut faire

- `verdict()` : traiter le guidage comme l'entraînement (une ligne : `if (R.entr || R.g)`), en mode **rangement**.
- Les textes de faute (`CRITERES[...].juger`) restent écrits : ils servent ailleurs (page d'essai, tests, côté
  enseignant). Ne pas les supprimer.
- `activites/FICHE-SEANCE.md` / commentaire d'en-tête d'`entrepot.js` (« guidage = consigne… erreurs expliquées critère
  par critère ») : corriger la phrase.
- Le compte rendu d'ENT-5.5 (§4, « erreurs expliquées critère par critère ») : ajouter une ligne qui renvoie ici.

## 4. Tests

- **Réécrire un cas existant** (à dire à Tristan) : `outils/test/entrepot.mjs`, cas « charge totale dépasserait… »
  (vers la ligne 252) : en guidage, attendre `✗ critère : poids` pour P1, `✗ critère : litige` pour P3,
  `✗ critère : état` pour P4.
- **Ajouter** : en guidage, après « Vérifier », aucun verdict ne contient un nom de côté (`A1`, `B2`…), de travée
  (`T0`) ni d'allée — éprouvé dans les deux sens (remettre l'ancien texte doit faire tomber le test).
- Bloc `smoby` : relancer ; corriger tout cas ENT-5.5 qui lisait le texte long.

## 5. Questions ouvertes (valeur par défaut)

- [ ] **Mode préparation (ENT-5.6)** : son bilan « expliqué en guidage » a-t-il le même défaut ? Par défaut : **ne pas y
  toucher** dans ce chantier ; le regarder et le signaler à Tristan dans le compte rendu.
- [ ] La **consigne de la palette en main** (colonne de gauche) dit déjà « côté B2 », « T02 »… : c'est le guidage voulu
  par le brief d'ENT-5.5, gardé. À revoir seulement si Tristan le demande après un nouvel essai.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers modifiés** : `core/types/entrepot.js` (`verdict()` : une seule ligne pour guidage et entraînement, plus le
  commentaire d'en-tête) ; `activites/FICHE-SEANCE.md` (phrase « Temps » du mode rangement) ; `outils/test/entrepot.mjs` ;
  renvoi ajouté dans le compte rendu d'ENT-5.5 ; une ligne dans `docs/decisions.md`. Les textes de faute
  (`CRITERES[...].juger`) restent écrits : la vue ne les montre plus à l'élève, `fautes()` les calcule toujours.
- **Écarts** : aucun. Au lieu d'écrire `if (R.entr || R.g)`, la ligne du texte long est supprimée : après l'évaluation
  (traitée plus haut), il ne reste que guidage et entraînement, qui ont maintenant le même verdict.
- **Tests** : cas « charge totale dépasserait… » **réécrit** (attend exactement `✗ critère : poids` / `litige` / `état`).
  Cas **ajouté** : en guidage, 4 palettes mal rangées (rotation, type, litige, hors service), « Vérifier » → chaque verdict
  commence par `✗ critère :` et ne contient ni côté (`A1`), ni travée (`T0…`), ni niveau, ni « allée ». Éprouvé dans les
  deux sens : l'ancien texte remis fait tomber les deux cas ; le texte long collé derrière « critère : » fait tomber le
  cas ajouté sur la recherche d'adresse. Bloc `smoby` : aucun cas ENT-5.5 ne lisait le texte long. Suite entière : 693/693.
- **Question ouverte 1 (mode préparation, ENT-5.6) : regardé, pas touché.** Son bilan en guidage explique chaque faute
  (« 2 prélevés sur 6 — picking en rupture : il fallait demander la descente de la réserve », « les lourds se prélèvent en
  premier… ») et « Reprendre la préparation » permet de rejouer. Le défaut est **plus faible** qu'au rangement : le texte
  rappelle une règle, il ne donne pas d'adresse ; et le guidage de la préparation mène déjà l'élève pas à pas (bon trié
  dans l'ordre, « cliquez la travée … »). À trancher par Tristan après son essai d'ENT-5.6.
- **Question ouverte 2 (consigne de la palette en main)** : gardée telle quelle, comme prévu.
