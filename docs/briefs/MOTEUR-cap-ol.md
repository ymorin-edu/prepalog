# Brief moteur — CAP OL : compétences du CAP 2026 et séances partagées (chantier 12)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet) :**
>
> ```
> Lis docs/EN-COURS.md puis docs/briefs/MOTEUR-cap-ol.md. Fais d'abord l'état des lieux du §4 en lecture seule et propose-moi comment une séance déclare ses compétences CAP (§4.2) avant d'écrire. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : livré (15/10/2026)
**Date du brief** : 15/10/2026
**Conversation d'origine** : Cowork (Opus), « on attaque quoi après Decathlon ? » (15/10/2026)
**Modèle** : **Sonnet** (pas de vue nouvelle).
**Chantier** : n° 12 de `docs/chantiers.md` (C8 de l'audit).
**Fiche du référentiel** : projet Cowork `claude/referentiel-cap-ol.md` (relevé du 02/10, vérifié le 15/10).

## 1. Le besoin

Tristan a une classe de CAP Opérateur logistique (2e année). Le niveau `cap` existe déjà dans
`core/niveaux.js`, mais **aucune compétence CAP n'existe** dans `core/competences.js` : le tableau de
compétences d'un groupe CAP reste vide, et la plupart des séances récentes sont réservées à un autre
niveau (`niveaux: ['2de']` pour Smoby et France Boissons, `['1re']` pour Picard), donc invisibles au CAP.

Décision du 02/10 (inchangée) : **le site se construit sur le référentiel CAP de 2026** (arrêté du
13 février 2026, JO du 13/03/2026), pas sur celui de 2015.

**Fini quand** : un groupe CAP voit les séances du §3 à son accueil (une fois ouvertes par Tristan), et
son tableau de compétences affiche des moyennes **CAP-C…** avec leurs libellés officiels.

## 2. Décisions de Tristan (15/10/2026)

1. **Codes préfixés `CAP-`**, au niveau de la **compétence** (pas des sous-compétences), comme `OTM-` et
   `AGO-` : 12 compétences, blocs 1 et 3. Le bloc 2 (conduite d'engins) reste hors Prepalog.
2. **Une séance existante peut déclarer AUSSI des compétences CAP**, en plus de ses compétences Bac Pro.
   Chez un élève de CAP, sa note va aux compétences CAP ; chez un Bac Pro, aux compétences Bac Pro. Les
   séances ne sont pas réécrites.
3. **TAB-4 reste ouvert à tous les niveaux** (pas de `niveaux: ['cap']`) : il peut servir de rattrapage
   en Bac Pro. Il déclare seulement ses compétences CAP en plus.
4. **Le tableau du §3 est validé tel quel.**

## 3. Les séances ouvertes au CAP et leurs compétences CAP (validé le 15/10)

| Code | Fichier (à vérifier) | Compétences CAP |
|---|---|---|
| DEC-1 | `chaine-logistique.js` | CAP-C1.1 |
| QUI-6 | `zones-entrepot.js` | CAP-C1.1 |
| ENT-6.1 | `france-boissons-organigramme.js` | CAP-C1.1, CAP-C1.2 |
| ENT-5.3 | `smoby-visite.js` | CAP-C1.2 |
| ENT-1.1 | `spartoo-reception.js` | CAP-C1.3, CAP-C1.4 |
| ENT-5.4 | `smoby-reception.js` | CAP-C1.3, CAP-C1.4 |
| ENT-6.4 | `france-boissons-reception.js` | CAP-C1.3, CAP-C1.4 |
| ENT-4.1, 4.2, 4.3 | `picard-ent41/42/43.js` | CAP-C1.3, CAP-C1.4 |
| ENT-5.5 | `smoby-rangement.js` | CAP-C1.5 |
| ENT-6.5 | `france-boissons-rangement.js` | CAP-C1.5 |
| ENT-6.6 | `france-boissons-inventaire.js` | CAP-C1.5 |
| ENT-2.3 | `cdiscount-inventaire.js` | CAP-C1.5 |
| TAB-4 | `journee-entrepot.js` | CAP-C1.4, CAP-C1.5 |
| TAB-5 | `inventaire-tableur.js` | CAP-C1.5 |
| ENT-5.6 | `smoby-preparation.js` | CAP-C3.1, CAP-C3.4 |
| ENT-6.7 | `france-boissons-preparation.js` | CAP-C3.1, CAP-C3.2, CAP-C3.4 |
| ENT-1.3 | `spartoo-tracabilite.js` | CAP-C3.4 |
| ENT-5.8 | `smoby-lettre-voiture.js` | CAP-C3.5 |
| ENT-6.10 | `france-boissons-retour.js` | CAP-C3.7 |

- Les séances qui déclarent `niveaux` reçoivent **`'cap'` en plus** (sinon le CAP ne les voit pas). Celles
  sans `niveaux` sont déjà ouvertes à tous.
- **Ne rien changer d'autre** dans ces séances : `temps`, `competences` Bac Pro, jalons, poids, textes.
  Une séance déjà jouée garde les notes de ses élèves (règle du 06/10).
- **ENT-1.3 est gelée (refonte Spartoo à venir)** : ajouter ses compétences CAP et le niveau seulement si
  c'est une ligne de `meta` ; si ça demande plus, le dire et la laisser de côté.
- Hors liste, volontairement : le reste de Cdiscount (suivi de stock par les chiffres), Boost et ENT-6.9
  (organiser une tournée), Decathlon, les séances AGOrA de la 2de (5.1, 5.2, 6.2, 6.3), ENT-6.8, SCE-5,
  et les évaluations ENT-4.4 et ENT-2.5 (écrites pour le Bac Pro). **Aucune évaluation CAP pour
  l'instant** : tout ce qui précède compte au coefficient 1.
- **Picard (1re)** : Tristan l'essaiera d'abord avec ses CAP (lecture exigeante). Rien à faire de plus ici.

## 4. Ce que Claude Code fait

### 4.1 Les libellés (`core/competences.js`)

Ajouter les 12 codes à `COMPETENCES`, et `CAP: 'CAP Opérateur logistique'` à `SPECIALITES` (le préfixe
`CAP-` doit être lu par `specialite()`). Libellés vérifiés le 15/10/2026 sur le JO du 13/03/2026 (copie de
l'académie de Lyon) pour le bloc 1, et sur la fiche ONISEP du 16/03/2026 pour le bloc 3 :

```
'CAP-C1.1': 'Se situer dans un environnement professionnel spécifique',
'CAP-C1.2': 'Prendre un poste en autonomie',
'CAP-C1.3': 'Prendre en charge les opérations de réception',
'CAP-C1.4': "Contrôler les quantités et l'état de la livraison",
'CAP-C1.5': 'Mettre en stock les marchandises ou les produits',
'CAP-C3.1': 'Prendre en charge la préparation de commandes',
'CAP-C3.2': 'Déstocker les marchandises et/ou produits',
'CAP-C3.3': 'Conditionner les marchandises et/ou produits',
'CAP-C3.4': "Réaliser et transférer l'unité de charge",
'CAP-C3.5': 'Expédier les unités de charge',
'CAP-C3.6': "Identifier les conséquences d'un fait ou d'une donnée économique sur l'activité logistique et la supply chain ou chaîne logistique",
'CAP-C3.7': 'Appliquer les écogestes professionnels',
```

Commentaire en tête du bloc : source, date, « bloc 2 hors Prepalog », et le piège des codes (C1.2 = sécurité
au Bac Pro, prendre un poste au CAP : c'est pourquoi le préfixe est obligatoire).

### 4.2 Une séance déclare ses compétences CAP — **à proposer à Tristan avant d'écrire**

Le besoin : la même séance range sa note dans `C1.4` pour un groupe Bac Pro et dans `CAP-C1.4` pour un
groupe CAP. Claude Code fait l'état des lieux de qui lit `meta.competences` (tableau, export élève ×
compétence, contrôles, tests) et **propose une forme en une ou deux options**, en français courant
(exemple d'option : un champ à part `competencesCap: ['CAP-C1.4']`, lu à la place de `competences`
quand le groupe est de niveau `cap`). Tristan tranche.

Comportement attendu, quelle que soit la forme :
- groupe `cap` : la séance compte **seulement** pour ses compétences CAP ; une séance sans compétence CAP
  n'entre dans aucune moyenne CAP (elle reste dans le suivi par séance) ;
- autre groupe : rien ne change (aucune moyenne Bac Pro ne bouge) ;
- l'export élève × compétence d'un groupe CAP sort les colonnes CAP-C… ;
- `FICHE-SEANCE.md` documente le champ.

### 4.3 Les séances

Appliquer le tableau du §3 (niveau `'cap'` ajouté là où `niveaux` existe, compétences CAP déclarées).

### 4.4 Tests

Dans le bloc qui teste les compétences (à trouver) : un groupe CAP voit ses moyennes CAP-C… avec libellé ;
le même travail dans un groupe 1re reste en C1.4 ; une séance sans compétence CAP n'apparaît pas au tableau
CAP. Éprouver dans les deux sens. Si `outils/test.mjs` ou `commun.mjs` est touché, le dire.

## 5. Questions ouvertes

1. La forme du §4.2 (à trancher par Tristan après l'état des lieux).
2. Les sous-compétences du bloc 3 (C3.x.y) n'ont pas été trouvées en ligne : sans objet tant qu'on reste
   au niveau des compétences (décision 1).

## 6. Alertes

- **8** : pas d'activité ajoutée ni de `code` changé.
- **Séances ouvertes aux élèves** (Spartoo, Boost…) : le site est en mode réel, un push est en ligne tout de
  suite. Ici, seules des lignes de `meta` changent ; vérifier qu'aucune note Bac Pro ne bouge.
- Aucune règle Firebase ne devrait changer. Si c'était le cas : le dire, et rappeler la publication en console.

## 7. Compte rendu (à remplir par Claude Code à la livraison)

Livré le 15/10/2026 (Claude Code, Fable ; l'état des lieux du §4 a été présenté à Tristan avant d'écrire, il a
tranché l'option B).

- **Fichiers créés / modifiés** : `core/competences.js` (12 libellés `CAP-`, commentaire de source, deux
  fonctions : `competencesPour(meta, niveau)` et `metasPourNiveau(metas, niveau)`) ; `core/prof.js` (l'onglet
  « Compétences » passe les métas par `metasPourNiveau` avant le tableau, l'export et les spécialités) ;
  `activites/FICHE-SEANCE.md` (ligne `competencesCap`) ; les 21 séances du §3 (une ligne `competencesCap`
  chacune, `'cap'` ajouté aux 14 `niveaux` déclarés) ; `outils/test/socle.mjs`.
- **La forme retenue (§4.2, option B)** : un champ à part, `competencesCap: ['CAP-C1.3', 'CAP-C1.4']`, déclaré
  **en plus** de `competences`. Un groupe de niveau `cap` le lit **à la place** de `competences` ; tout autre
  niveau ne le lit jamais (les métas lui sont rendues telles quelles, sans copie). Une séance sans ce champ
  n'entre dans aucune moyenne CAP. Option A écartée : mélanger les codes dans `competences` aurait modifié la
  liste Bac Pro de 21 séances et la table `ATTENDU` du socle.
- **Écarts par rapport au brief** (et pourquoi) :
  - **`SPECIALITES` n'a pas reçu `CAP`** (§4.1). L'ajouter aurait fait apparaître une quatrième colonne vide
    dans « Moyennes par spécialité » des groupes de 2de et cassé deux assertions du socle. La spécialité
    reste une notion de 2de ; `specialite('CAP-…')` rend `'LOG'`, sans effet puisqu'un groupe CAP n'a pas de
    tableau par spécialité. Accord de Tristan le 15/10.
  - **Cas existants réécrits** : le compteur de libellés du socle passe de 36 à 48 (+ « CAP : 12 codes ») ; et
    douze cas « déclaration » de séances (Picard 4.1 à 4.3, Smoby 5.3 à 5.6 et 5.8, France Boissons 6.4 à 6.7)
    figeaient la liste `niveaux` : ils attendent maintenant `['2de', 'cap']` ou `['1re', 'cap']`, rien d'autre
    n'y change. `outils/test.mjs` et `commun.mjs` ne sont pas touchés.
- **Décisions prises en route** : le contrôle des déclarations du socle tient désormais la **liste des 21 séances
  CAP** (tableau §3, écrit à la main) : une séance qui déclare `competencesCap` hors de cette liste, un code
  `CAP-` dans `competences`, autre chose qu'un code `CAP-` dans `competencesCap`, ou `competencesCap` avec des
  `niveaux` sans `'cap'`, fait tomber la suite. Ajouter une séance CAP = une ligne dans cette table.
- **Tests** : bloc `socle` 68/68 ; deux cas neufs (à l'unité : `competencesPour`, `metasPourNiveau`, même note
  12/20 en CAP-C1.4 et en C1.4 ; à l'écran : le groupe passe en CAP, dix colonnes CAP-C… dans l'ordre du
  référentiel, libellé en infobulle, 10/20 (1/3) en CAP-C1.1, SCE-1 et C1.6 absents du tableau CAP, pas de
  tableau par spécialité, export CSV avec les colonnes CAP et aucune colonne Bac Pro, puis le groupe repasse
  en 1re : plus aucune colonne CAP et la même note en C1.1). **Sabotages éprouvés** : moteur qui ignore le
  niveau (écran et unité tombent), `'cap'` retiré d'une séance (contrôle des déclarations tombe), code
  étranger dans `competencesCap` (idem). Le premier sabotage a révélé un défaut du contrôle (liste d'erreurs
  lue avant d'exister), corrigé. Suite complète en parallèle : 1470/1471, le seul cas tombé (bloc `quai-iso`, dessin du chariot, sans lien) est vert rejoué seul, 62/62 : cas trop pressé en parallèle.
- **Commits** : `f4f63dd` (moteur, fiche, tests), `250c6bb` (les 21 séances), `24e2062` (correction du socle),
  puis la documentation.
- **Reste ouvert** : Tristan ouvre les séances à son groupe CAP dans « Conduite de séance » (elles restent
  fermées : rien n'est visible des élèves tant qu'il ne coche pas). Les deux points du chantier 12 hors de ce
  brief (niveau d'un groupe à choisir, avis « OTM / AGOrA de 2de sans évaluation ») ont été livrés le même jour :
  `docs/chantiers.md` §12. Aucune évaluation CAP (tout au coefficient 1), aucune règle Firebase touchée.

