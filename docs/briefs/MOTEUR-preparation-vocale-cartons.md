# Brief moteur — Préparation de commandes guidée à la voix, en cartons (chantier E-8, pour ENT-8.15 à 8.19 Action)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/MOTEUR-preparation-vocale-cartons.md en entier, puis les têtes de core/types/entrepot.js (mode préparation), core/types/entrepot-picking.js (montage) et core/types/terminal.js. Fais l'état des lieux du §4 en lecture seule : dis-moi ce qui existe, ce qui contredit le brief, et propose un découpage en lots avec une durée par lot. N'écris rien avant ma réponse.
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 25/10/2026, écrit dans le projet PREPALOG (cadrage de C3.1 à C3.3 chez Action).
**Décision de Tristan** : la préparation d'Ensuès se joue dans **le mode `preparation` du Plan d'entrepôt (celui de Smoby, ENT-5.6), guidé par le
terminal vocal (celui de France Boissons, ENT-6.7)**. *(Option recommandée, posée à Tristan le 25/10/2026 ; voir §8 si sa réponse diffère.)*
**Modèle** : **Opus** pour les lots 1, 2 et 4 (comportement nouveau d'une vue) ; Sonnet pour les lots 0, 3, 5 et 6.
**Durée estimée** : **≈ 18 à 22 h** (lot 0 ≈ 2 h · lot 1 ≈ 4-5 h · lot 2 ≈ 3-4 h · lot 3 ≈ 2-3 h · lot 4 ≈ 3-4 h · lot 5 ≈ 2-3 h · lot 6 ≈ 1 h).
**Version courte** : lots 0 → 3 (≈ 11-14 h) suffisent pour construire **ENT-8.15, 8.16 et 8.17** ; les lots 4 et 5 servent à **8.18 et 8.19**.
**Ordre** : 0 → 1 → 2 → 3 → (séances 8.15 à 8.17) → 4 → 5 → 6 → (séances 8.18 et 8.19).

---

## 1. Pourquoi ce chantier

Le poste réel à Ensuès est **vérifié** : préparation **à la voix**, **scanner**, **filmage**, **mise à quai**, **CACES 1** exigé (offre
France Travail 191TDTN, client « GEODIS/ACTION », actualisée le 29/04/2025). Le moteur a deux morceaux qui ne se parlent pas :

| Ce qui existe | Où | Ce qu'il sait faire | Ce qui manque pour Action |
|---|---|---|---|
| Mode `preparation` (ENT-5.6 Smoby) | `core/types/entrepot.js` | plan vu de dessus, travée de face, N1 = picking et au-dessus = réserve, prélèvement au carton, descente de réserve, palette de commande montée sous les yeux, critères lourds en bas / fragiles en haut / poids / hauteur, film, étiquettes, parcours, évaluation (« rien avant la copie ») | il est guidé par un **bon papier** affiché : pas de voix, pas de code de contrôle, pas d'exception dite ; l'ordre de montage **est** l'ordre de prélèvement |
| Mode `picking` + terminal vocal (ENT-6.7 FB) | `core/types/entrepot-picking.js`, `core/types/terminal.js` | lignes annoncées, code de contrôle lu sur la lisse de près, quantité, mots **Manquant / Abîmé / Emplacement vide**, ligne de remplacement, **« Où poses-tu ? Palette 1 · Palette 2 · À côté »**, « Reposer le dernier » | allée 3D faite pour **fûts et casiers** (6 cases), pas de cartons, pas de critères lourds/fragiles/poids/hauteur, **pas d'évaluation** (`opts.copie` refusé) |

On **branche le terminal sur le mode `preparation`** et on y **porte le montage « où poses-tu ? »** du picking. Rien de Smoby ni de France
Boissons ne change (blocs `smoby`, `entrepot`, `fb-6.7`, `terminal` verts **sans modification**).

## 2. Ce que fait l'élève (vu de l'écran)

1. Le **Terminal** (le boîtier du terminal vocal, titre « Préparation ») dit : « Allée B1, travée 03, niveau 1, emplacement 2. Code de contrôle ? ».
2. L'élève va sur le plan, ouvre la travée (vue de face, comme Smoby), **clique l'emplacement** : la vue de près montre le carton, l'**étiquette de
   lisse avec son code de contrôle** (deux chiffres) et, s'il y en a, un **carton abîmé** dessiné devant.
3. Il tape le code → « Lessive liquide 3 L. Prends 4. » → il tape 4 (ou un mot : « Abîmé : combien ? », « Manquant », « Emplacement vide »).
4. « **Où poses-tu les 4 cartons ?** » → **Palette** (ou, en lot 4, l'une des deux palettes nommées par magasin) · **À côté, je les pose après**.
   La palette de commande, **à gauche** (écran partagé de Smoby), se monte dans **l'ordre de pose**, pas de prélèvement.
5. Le terminal fini : les cartons « à côté » se posent (clic carton puis palette) ; « ↶ Reposer le dernier » ; **film**, **étiquettes** ;
   « Vérifier ma préparation » (guidage, entraînement) ou rien (évaluation, copie).

## 3. Règles à juger (construites, dites dans les séances)

- **Une ligne = une référence, une adresse, une quantité en cartons.** Le terminal impose l'ordre (celui du **circuit de prélèvement**, en serpentin) :
  plus de jalon « parcours le plus court » quand le terminal guide (c'est le système qui choisit le chemin).
- **Lourds en bas, légers et fragiles en haut** : jugés sur **l'ordre de pose** (la pile se recalcule depuis l'ordre de pose, jamais rangée).
  Classes : `lourd` (> 10 kg le carton), `normal`, `fragile` (verre, céramique, décoration fragile). Comme Smoby : on dit **que**, jamais **de combien**.
- **Poids et hauteur de la palette** : `kgMax`, `hMax` de la commande (proposé : 600 kg, 1,60 m, support 25 kg, 0,15 m) — comme Smoby.
- **Film** : 3 à 5 tours (comme 6.7) ; **étiquettes** : deux faces opposées + le dessus (comme 6.7), texte = le magasin.
- **Exceptions** : un carton abîmé se **voit** de près, il n'est écrit nulle part ; « Abîmé : 1 » le laisse au picking ; pris sans rien dire, il
  part sur la palette **abîmé** (dessiné). « Emplacement vide » → le terminal propose la **descente de réserve** (le geste de Smoby, confié au
  cariste Kevin) puis redit la ligne.
- **Jamais rien de refusé au montage** (6.7, décision 50) ; **aucun jalon par inaction** : une palette vide ne respecte rien.

## 4. Les lots

### Lot 0 — L'entrepôt de préparation tiré par élève (Sonnet, ≈ 2 h)
Le mode `preparation` reçoit, comme le palettier depuis E-7 lot 0, **une fonction `(graine, { niveau, copie })`** qui rend la déclaration de
l'élève (commande, picking, abîmés, emplacements vides tirés). Contrôle « mêmes jalons pour toutes les graines » (comme `etapesPalettier`).
**Le plan d'Ensuès est celui d'ENT-8.11** (`contenus/action-ent811-donnees.js` : allées A et B, 4 travées, 4 niveaux, 3 emplacements) **agrandi**
pour la préparation : proposé **4 allées (A1, A2, B1, B2), 6 travées, 4 niveaux, 3 emplacements**, N1 = picking. Les données vivent dans un
fichier neuf `contenus/action-prepa-donnees.js` (le module d'ENT-8.11 est **lu, jamais modifié**). Tests : 300 graines, jeux valides.

### Lot 1 — Le terminal guide la préparation (Opus, ≈ 4-5 h)
- Option `terminal: { titre: 'Préparation', voix: true }` dans une déclaration `mode: 'preparation'` : le **bon de préparation n'est plus affiché**
  (ni en guidage ni ailleurs) ; les lignes du terminal sont **calculées** depuis `commande.lignes` (lieu = l'adresse dite en clair, `code` = celui
  de l'emplacement, `question` = « <voix>. Prends <q>. », `prends`).
- Le **code de contrôle** est écrit **seulement** sur l'étiquette de lisse de la **vue de près** (comme 6.7), jamais sur le plan ni dans un texte.
- Une quantité acceptée **prélève** (la fiche de prélèvement de Smoby disparaît quand le terminal guide) ; le terminal attend la pose (`pose`).
- Le son : celui d'ENT-6.6 (réglage enseignant, coupé par défaut), voix « fr » du poste seulement, aucune requête réseau.
- Jalons : un par ligne (quantité juste, aucune exception attendue), comme 6.7 ; **codes faux comptés** dans « Ce que le terminal sait de toi »,
  non notés.

### Lot 2 — « Où poses-tu ? », la palette montée dans l'ordre de pose (Opus, ≈ 3-4 h)
- Porter de `entrepot-picking.js` : la question de pose (**Palette · À côté, je les pose après**), la zone « à côté », la pose différée (clic
  carton puis palette), **« ↶ Reposer le dernier »** (le terminal fini). Une ligne = une destination.
- La palette de commande (à gauche, écran partagé) se dessine **dans l'ordre de pose** ; les critères `lourds`, `fragiles`, `poids`, `hauteur`
  lisent cet ordre. `film`, `etiquettes` inchangés (jugés à « Vérifier », seulement si les lignes sont justes et que rien n'est « à côté »).
- Page d'essai : cas « Préparation vocale, cartons » dans `outils/essai-entrepot.html` — **à faire juger par Tristan avant le lot 3.**

### Lot 3 — Exceptions et descente de réserve (Sonnet, ≈ 2-3 h)
- `abimes: n` sur un emplacement de picking : les **cartons abîmés devant**, dessinés (coin enfoncé, ruban déchiré : traits, lisible en noir et
  blanc) ; donnés d'abord ; « Abîmé : n » les laisse ; la ligne de remplacement (`remplacement`) va à une autre adresse du même produit.
- `vide: true` : tiroir vide de près → « Emplacement vide » attendu → le terminal dit « Réserve demandée au cariste. » et Kevin descend la palette de
  réserve (geste et dessin de Smoby, `vides`) → la ligne est redite. Ne pas dire le mot = la ligne n'est pas faisable : le terminal refuse la
  quantité (« Tu dois prendre n. Si tu ne peux pas, dis… ») — jamais bloquant, les mots sont toujours proposés.
- Jalons : ligne à exception juste (le bon mot, la bonne quantité, le reste pris), ligne de remplacement prise, réserve demandée.

### Lot 4 — Deux commandes, deux palettes (Opus, ≈ 3-4 h) — pour ENT-8.18
- `commandes: [ { magasin, etiquette, lignes }, { … } ]` : le terminal **nomme le magasin à chaque ligne** (« Pour Marseille La Valentine.
  Allée A2… ») ; la pose propose **Palette La Valentine · Palette Saint-Loup · À côté**.
- **Contrôle avant film** : bouton « Contrôler mes palettes » qui ouvre, pour chaque palette, la **liste de colisage** (ce que le système a
  enregistré pour ce magasin) à côté du **dessin** de la palette ; l'élève peut **déplacer un carton** d'une palette à l'autre (clic carton, clic
  palette ; « Reposer le dernier » ne sert plus après le terminal). Le système ne dit pas où est l'erreur.
- Jalons : chaque palette ne porte que ses lignes (une par palette) ; les critères de montage par palette.
- **L'erreur induite** est dans les **données** de la séance (une ligne dont le magasin change sans pause, décrite dans ENT-8.18) : le moteur ne
  piège rien de lui-même.

### Lot 5 — Évaluation, un plan par site (Sonnet, ≈ 2-3 h) — pour ENT-8.19
- `opts.copie` accepté avec `terminal` : aucun verdict, aucune règle dépliée, « Vérifier » remplacé par « Valider ma préparation » qui **fige**
  sans rendre (la copie se rend par le bandeau, comme le palettier `rendCopie: false`).
- **Un plan par site** (Onnaing, Belleville) : la déclaration est choisie par `siteDeBase` (module `contenus/action-eval-sites.js`, **lu**).

### Lot 6 — Fiche et page d'essai (Sonnet, ≈ 1 h)
`activites/FICHE-SEANCE.md` (le mode préparation guidé, la pose, deux commandes, l'évaluation) ; quatre cas sur `outils/essai-entrepot.html`.

## 5. Tests

Bloc **nouveau** `outils/test/preparation-vocale.mjs` (alerte 7 : ligne dans `BLOCS` de `outils/test.mjs`, à dire) : une ligne juste, un code faux
puis juste, une quantité trop grande refusée, « Abîmé » juste et la ligne de remplacement, « Emplacement vide » et la réserve, la pose « à côté »
puis posée, « Reposer le dernier », lourds en bas jugé sur l'ordre de pose, poids et hauteur, film et étiquettes, une palette vide ne gagne rien,
deux commandes et un carton déplacé au contrôle, la copie figée sans verdict, 300 graines. Non-régression **sans modification** : `smoby`,
`entrepot`, `fb-6.7`, `terminal`, `palettier`, `action-811` à `action-814`. Chaque cas éprouvé dans les deux sens (sabotage).

## 6. Charte et accessibilité

Charte d'Action **bleue** (`#195799`) : le **vert plein reste réservé à « juste »** ; le carton abîmé et la zone « à côté » en traits, lisibles
en noir et blanc ; à **1366 × 768 et 1280 × 720**, l'écran partagé (palette à gauche, travée ou vue de près à droite) et le terminal tiennent sans
défilement de page (mesurer, comme pour 10.4). Mouvement réduit respecté (règle du 22/10).

## 7. Ce qui ne bouge pas

ENT-5.6 Smoby, ENT-6.7 France Boissons, le palettier (E-7) et les séances 8.11 à 8.14. Le module des sites d'évaluation est **lu**, jamais modifié.

## 8. Si Tristan choisit une autre option

- **« Préparation Smoby, bon papier »** : ce brief est sans objet ; les séances déclarent le mode `preparation` tel quel (bon affiché) et seul le lot
  0 (tirage par élève) reste utile, plus le lot 5 (un plan par site).
- **« Allée 3D de France Boissons »** : réécrire ce brief autour de `entrepot-picking.js` (cartons, critères de palette, évaluation).
