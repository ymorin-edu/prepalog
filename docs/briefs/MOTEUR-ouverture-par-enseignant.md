# Brief moteur — ouvrir une séance aux élèves depuis « Conduite de séance », sans commit

**Statut** : **à valider par Tristan** (livré le 03/10/2026) *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 03/10/2026
**Modèle conseillé** : Sonnet (pas une vue nouvelle du moteur). **Durée annoncée** : environ 30 à 45 minutes, dont l'essentiel est la réécriture du bloc de test `visibilite` et la suite entière.
**Origine** : Tristan, 03/10/2026 — « on perd trop de temps avec ces ouvertures / fermetures ». Option 2 choisie parmi trois.

## 1. Le problème

Pour qu'une séance soit visible des élèves, il faut aujourd'hui passer `pret: true` **dans le code**, ce qui demande un commit, les tests, un push — et un aller-retour avec Claude Code à chaque fois. Le 03/10, trois séances (ENT-2.1, ENT-2.3, ENT-3.2) validées à l'écran par Tristan attendent cette étape.

## 2. Ce qui existe déjà (lu dans le code le 03/10 — à reconfirmer)

- `core/niveaux.js` : `activiteVisible(meta, groupe)` rend `false` si `!meta.pret` ; sinon `groupe.ouverts[meta.id]` (`true` forcé ouvert, `false` fermé) ; sinon le niveau décide. `raisonCachee()` donne le motif (« en préparation », « fermée pour ce groupe », « hors niveau du groupe »).
- `core/prof.js` : l'onglet **« Conduite de séance »** a déjà une case à cocher par séance et par groupe (`data-ouvre`, ligne ~980 : `B.majGroupe(g.id, { ouverts })`). **Cette ouverture-là ne demande aucun commit.**
- L'enseignant voit toutes les tuiles, y compris `pret: false`, avec l'étiquette « Cachée aux élèves : en préparation ».
- `outils/test/visibilite.mjs` suppose qu'**au moins une séance est `pret: false`** dans le registre et **échoue** sinon (« ce bloc ne prouve rien »). Ouvrir les trois séances en les passant `pret: true` casserait donc ce test.

## 3. Ce qu'on veut

Une séance peut se déclarer **« ouverte par l'enseignant »** : elle est **fermée aux élèves de tout groupe tant que l'enseignant ne l'a pas cochée** dans « Conduite de séance » pour ce groupe, et ouverte dès qu'il la coche. Plus aucun commit pour ouvrir.

Proposition de forme (à confirmer par Claude Code s'il voit plus simple) :

- Nouveau champ de `meta` : `ouverture: 'prof'` (absent = comportement actuel, **inchangé** pour toutes les séances existantes).
- `activiteVisible` : si `meta.ouverture === 'prof'`, absence de `ouverts[id]` ⇒ **fermée** (au lieu de « le niveau décide ») ; `ouverts[id] === true` ⇒ ouverte, même hors niveau ; `false` ⇒ fermée. `pret` reste vrai pour ces séances (elles sont construites, pas « en préparation »).
- `raisonCachee` : nouveau motif, par exemple **« pas encore ouverte à ce groupe »**, distinct de « en préparation ».
- « Conduite de séance » : la case de ces séances apparaît **décochée par défaut** ; l'étiquette de la tuile enseignant dit ce que voient les élèves. Rien d'autre à changer dans l'interface si la case existe déjà pour toute séance.
- Sans groupe (enseignant sans groupe actif) : tout reste visible.
- Une séance déjà ouverte (ENT-1.x, 2.2, 3.1, 3.3…) n'est **pas touchée**.

## 4. Séances à convertir dans la foulée

`ENT-2.1` (`activites/cdiscount-mouvements.js`), `ENT-2.3` (`activites/cdiscount-regularise.js`), `ENT-3.2` (`activites/boost-ent32.js`) : passer `pret: true` **et** déclarer `ouverture: 'prof'`. Elles restent donc invisibles aux élèves **jusqu'à ce que Tristan les coche** pour son groupe. Les séances à venir (ENT-3.4, 2.4) naissent directement ainsi.

## 5. Tests (blocs concernés : `visibilite`, `socle` si la liste des séances Logisim y est)

- **Le test `visibilite` est à réécrire : le dire explicitement à Tristan** (alerte n° 7). Il ne doit plus dépendre de l'existence d'une séance `pret: false` ; il doit prouver (a) une séance `ouverture: 'prof'` est invisible à l'élève tant qu'elle n'est pas cochée, (b) visible après la coche, (c) invisible de nouveau après décochage, (d) une séance sans `ouverture` se comporte comme avant, (e) l'enseignant voit toujours la tuile avec le bon motif. Garder un cas `pret: false` s'il en existe encore, mais **ne jamais exiger sa présence**.
- Éprouver chaque cas dans les deux sens (un sabotage qui ne fait rien tomber est un test mal écrit).
- Lancer le bloc, puis la suite entière avant le push.

## 6. Sécurité et données

- Aucun changement de `firestore.rules` ni de `database.rules.json` attendu : `ouverts` est déjà écrit par l'enseignant sur le groupe. **À vérifier** : un élève ne peut pas écrire `ouverts` (sinon il pourrait s'ouvrir une séance fermée). S'il fallait toucher aux règles, le dire (alerte n° 1 : publication dans la console Firebase par Tristan).
- La visibilité est un **choix d'affichage côté site**, pas une barrière de sécurité : un élève qui connaît l'adresse d'une activité fermée peut-il l'ouvrir ? À constater, et à dire à Tristan si oui (cela vaut déjà pour `pret: false` aujourd'hui).

## 7. Critères de validation par Tristan

1. Il se connecte comme enseignant, ouvre « Conduite de séance », voit ENT-2.1, ENT-2.3 et ENT-3.2 **décochées** pour son groupe.
2. Il se connecte comme élève du groupe : il ne voit **pas** ces trois séances.
3. Il coche ENT-2.1 pour le groupe : l'élève la voit **sans que personne n'ait rien commité**.
4. Il la décoche : elle disparaît.

## 8. Questions ouvertes

- [x] *(oui : une case par activité du registre, Logisim compris ; seule une séance `pret: false` a sa case grisée)* La case « Conduite de séance » existe-t-elle pour **toutes** les séances, y compris Logisim ? (à confirmer en lisant `core/prof.js` autour des lignes 900-990)
- [x] *(non construit)* Faut-il une ouverture « pour tous mes groupes d'un coup » ? **Non demandé** : à ne pas construire sans le lui demander.
- [x] *(non par le site : pas d'adresse par activité, on n'entre que par les tuiles ; seul un bricolage dans la console du navigateur le permettrait, comme déjà pour `pret: false`. Un élève ne peut pas écrire `ouverts` : `firestore.rules` réserve la mise à jour d'un groupe à ses enseignants, aucune règle touchée)* Un élève peut-il atteindre une activité fermée par son adresse ? (voir §6)

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `core/niveaux.js` (`ouvertureParProf`, règle dans `activiteVisible`, motif
  « pas encore ouverte à ce groupe » dans `raisonCachee`) ; `core/prof.js` (étiquette « à ouvrir : cochez-la » et une
  phrase d'explication dans « Conduite de séance ») ; `outils/test/visibilite.mjs` (**réécrit**) ;
  `activites/FICHE-SEANCE.md` (champ `ouverture` et règle des séances nouvelles).
- **Écarts par rapport au brief** : §4 non appliqué. ENT-2.1, ENT-2.3 et ENT-3.2 avaient été ouvertes (`pret: true`) une heure
  plus tôt ; Tristan a demandé de ne les convertir en `ouverture: 'prof'` que s'il le confirme. Elles restent ouvertes.
- **Décisions prises en route** : la coche de l'enseignant ouvre une séance « à ouvrir » même hors du niveau du groupe ; une
  séance `pret: false` reste fermée quoi qu'on coche ; aucune règle Firebase touchée. Une séance nouvelle est livrée avec
  `pret: true, ouverture: 'prof'` (fiche des séances) : Tristan l'essaie puis la coche lui-même.
- **Tests** : bloc `visibilite` réécrit (9 cas, au lieu de 6). Il n'exige plus de séance `pret: false` dans le registre : dans
  le navigateur de test seulement, ENT-2.1 est servie `pret: false` et ENT-2.3 `ouverture: 'prof'` (vrai fichier, un drapeau
  réécrit, rien dans le dépôt). Il prouve : la règle (12 situations), les étiquettes chez l'enseignant, la case décochée
  par défaut, l'élève qui ne voit pas → coche → voit → décoche → ne voit plus. Trois sabotages éprouvés (règle retirée,
  coche ignorée, étiquette retirée) : chacun fait tomber au moins un cas. Suite entière 365/365.
- **Commits** : « Ouverture des séances par l'enseignant, sans commit (ouverture: 'prof') ».
- **Reste ouvert** : validation par Tristan (critères du §7, à faire sur une séance « à ouvrir » : aujourd'hui aucune, puisque
  les trois restent ouvertes) ; s'il le confirme, convertir ENT-2.1, ENT-2.3 et ENT-3.2. `CLAUDE.md` dit encore « séance en
  cours d'écriture : `pret: false` » : à ajuster si Tristan adopte la règle de la fiche.
