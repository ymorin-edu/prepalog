# Chantier moteur E-5, lot 2 — la dépose dirigée par l'élève dans `core/types/quai.js`

Feuille de coordination écrite par Fable le 17/10/2026 (chef de chantier), d'après le brief `ENT-8.7-action-decharger.md` §7.2,
les choix de Tristan du 17/10 (`docs/decisions.md`), la maquette `outils/essai-depose.{html,js,css}` (commit 27efd36) et deux états
des lieux (moteur et maquette). Chaque étape est construite par un sous-agent qui lit **ce fichier en entier** avant d'écrire.
Fiche de passage détaillée de la maquette (code des fonctions pures et de la géométrie, à reprendre tel quel) :
`C:\Users\trist\AppData\Roaming\Claude\side-session-notes\local_04fef145-c630-494f-943a-e22e13a9cda8\fiche-maquette-depose.md`.

## 1. Ce qu'on construit

Quand un quai déclare `depose`, Kevin (le cariste au chariot frontal) sort chaque palette du camion et **attend à la sortie du camion**,
palette sur les fourches ; les cases libres s'éclairent ; l'élève clique une case. En guidage, une case piège fait réagir Kevin (bulle),
la case se grise **jusqu'à la fin**, l'élève rechoisit ; une case juste → Kevin pose et repart chercher la suivante. En évaluation
(`copie`), **le premier clic pose**, sans réaction ni grisage. Les jalons lisent le **premier** clic de chaque palette.

Choix de Tristan (17/10, à l'écran) : variante A (6 cases : allée piétonne, R1 à R4, devant le quai 3), cases sur **une ligne** de
part et d'autre du passage de la porte, **pièges non peints** (seules R1 à R4 sont marquées au sol ; l'allée et le quai 3 ne
s'éclairent que pendant le choix), case piège grisée gardée jusqu'à la fin, Kevin attend à la sortie du camion.

## 2. Décisions fixées pour ce chantier (à reporter dans `decisions.md` à la livraison)

1. **Déclaration** : `depose: { passage?, grise?, cases: [{ id, sol?, legende?, nom?, reaction?, juste?, peinte? }] }` ;
   `verifierDepose` de la maquette repris tel quel **sans la clé `consigne`** (clé inconnue = refus). Contrôles ajoutés dans
   `verifierQuai` : `depose` exige `rendu: 'iso'` et `dechargement.par: 'cariste'`, **au moins autant de cases justes que de
   palettes**, 8 cases au plus, incompatible avec `froid` et avec plusieurs camions (comme le reste de l'iso). `depose` **est
   compatible** avec `securite` (ENT-8.7 inspecte avant), avec `arret: 'dechargement'` (ENT-8.7) et avec `commence: 'controle'`
   (ENT-8.8 peut montrer le même quai : la dépose n'y est pas jouée).
2. **Géométrie** : `geometrieDepose` de la maquette (une ligne de cases, `passage` cases à gauche de la porte) **remplace
   `placesIso` / `zoneIso` seulement quand `depose` est déclaré**. Point d'attente unique : la sortie du camion (`ycSortie`) ;
   l'option « allée » de la maquette n'est pas reprise. La case d'une palette posée vient de l'état ; une palette **sans** pose
   (sous `commence`) prend les cases justes dans l'ordre du contenu (P1 → première case juste…).
3. **État** : `db.quais[<id>].depose = { [palette]: { premier, essais, pose } }` (format de la maquette ; une palette sans clic
   n'a pas d'entrée ; grisées et occupées se recalculent). Rien d'autre n'est rangé pour la dépose (ni phase d'animation, ni
   position du chariot). `normaliser` complète une base ancienne (`e.depose = e.depose || {}`).
4. **Geste** : `quai:<id>:depose`, publié **une fois, à la première palette posée**, déclaré dans `signaux` seulement quand
   `depose` existe. Le geste de fin `quai:<id>:dechargement` (lot 1, avec `arret`) part quand la **dernière** palette est posée.
5. **Journal** : une ligne par pose, `avancer(e, <minutes par palette>, 'P4 posée en R2')` ; les refus ne sont **pas** journalisés
   (le journal est lisible par l'élève à ③ ; le refus n'est pas une faute à afficher). `k.evts` continue d'être incrémenté à
   chaque pose pour que l'existant (`evts > PAL.length`, bandeau de fin, `arret`) reste vrai.
6. **Animation par geste** (pas de plan précalculé) : trajets `trajetChercher` / `trajetPoser` de la maquette. Séquence : clic
   « Décharger » (ou fin de l'inspection) → arrivée du camion comme aujourd'hui → `chercher(P4)` → **pause « choix »** → clic juste
   → `poser(P4, case)` puis `chercher(P3)` enchaînés → pause → … → dernière pose → retour du chariot à la gare → fin de ② comme
   aujourd'hui (légende, bouton vers ③ ; ou bandeau `arret`). « Passer l'animation » va **jusqu'à la pause suivante**. Mouvement
   réduit = états finaux (aucune boucle). **Page rechargée** : la vue se recalcule depuis la base : palettes posées dans leurs
   cases, Kevin à la sortie du camion avec la palette en attente sur les fourches, phase « choix » tout de suite (on ne rejoue
   pas la sortie du camion). Le rattrapage de `html()` (`evenements(e, fin(N))` quand `k.decharge && k.evts <= PAL.length`) ne
   s'applique **pas** sous `depose` : l'état de la dépose fait foi.
7. **Rendu** de ② pendant la dépose : fonction d'un `vis = { pos: [cx, yc, lev], portee, posees, camion, retard }` (maquette) ; les
   pauses se dessinent depuis `visDe(e)` (pur, calculé de la base), les gestes interpolent `vis` entre deux pauses. ④ (`ecran4`) et
   `commence: 'controle'` dessinent les palettes **dans leurs cases réelles**.
8. **Décor** : sol élargi à `geo.sol`, étiquette de zone à la première case juste, allée piétonne (bande hachurée, porte piétonne,
   pictos), porte du quai voisin dans le mur avec sa légende, cases peintes (contour fin + nom au sol), cases non peintes
   invisibles hors choix. Réutiliser les primitives de `core/iso.js` ; si `solQuai` ne sait pas élargir ou déplacer l'étiquette,
   **ajouter une option** à `solQuai` (ajout rétro-compatible, les appels existants ne changent pas) plutôt que recopier la dalle.
9. **Couche des cases (DOM)** : `<g class="quai-case" data-q="depose" data-c="<id>" role="button" tabindex="0" aria-label="<nom>">`
   avec `.quai-case-zone`, `.quai-case-halo`, `.quai-case-trait` ; case grisée `.quai-case-grisee` (hachures), `aria-hidden`, sans
   rôle ni tabindex ; case occupée : absente de la couche. **Aucun attribut ne dit le verdict.** Clic via `on('depose', …)` ;
   Entrée et Espace via `keydown` ; le focus est conservé par le mécanisme existant (`ui.focus` + `retrouverFocus`, clavier
   seulement) : après un refus, le focus va à la case proposée suivante. Styles dans `styles/quai.css` (reprendre `.dep-case*`
   de la maquette en les renommant `quai-case*`), teintes fixes encre/papier, **jamais de vert**, halo coupé par
   `prefers-reduced-motion`.
10. **Bulle de Kevin** : primitive `bulle` de `core/iso.js` à la tête du cariste, remontée pour **ne jamais couvrir une case à
    choisir** (logique de `bulleKevin`) ; le texte est aussi écrit dans un élément HTML `aria-live="polite"` (la bulle SVG n'est pas
    lue). Consigne de la première pause, en guidage **et** en copie : `PREMIERE_BULLE` (« Dis-moi où je pose chaque palette. Pas de
    gerbage à la réception. »). Réactions : `reaction` de la case, sinon `reactionDefaut` (allée, quai voisin).
11. **Jalons** : `jalonsDepose(etat, cases, palettes)` de la maquette, appelés dans `jalonsQuai` après les jalons de ② et avant le
    `return` d'`arret` ; ids `depose-P1`…, `ok` = tout posé **et** premier clic juste ; présents dès `jalonsQuai({}, Q)` avec
    `ok: false` ; absents sous `commence`. `etapesQuai` leur donne `groupe: 'Diriger le déchargement'` (vérifier que `ponderer` le
    laisse passer jusqu'au bandeau de fin ; sinon le dire, ne pas contourner). Le jalon ne récompense pas l'inaction (rien posé =
    tous faux) et son `lib` ne dit pas la bonne case (`attendu` la dit, lue au bilan).
12. **Mode copie** (`EVAL`) : `choisirCase(…, { copie: true })` : premier clic pose, aucune bulle de réaction, aucune case grisée.
13. **`heurtsPose`** : pas dans `verifierQuai` ; un cas de test unitaire vérifie que la variante A n'a aucun heurt.
14. Rien ne change pour un quai sans `depose` : blocs `smoby`, `fb-6.4`, `picard`, `spartoo`, `quai-iso` existants verts, octet pour
    octet pour les captures des autres quais si un test les compare.

## 3. Découpage (un seul écrivain dans `quai.js` à la fois)

| Étape | Qui | Contenu | Fini quand |
|---|---|---|---|
| A | Opus | Déclaration + `verifierQuai` ; fonctions pures (état, choix, jalons) ; `geometrieDepose` ; décor et couche des cases ; `visDe(e)` et rendu des pauses (② sans animation, ④, `commence`) ; clic / clavier / focus ; état, journal, geste, jalons, `etapesQuai`, mode copie ; `styles/quai.css` ; **partie 4** de `outils/essai-quai-inspection.html` (ancre `#depose`, réglages guidage / évaluation, mouvement réduit simulé, tableau « ce que la vue sait » : état `depose`, gestes, jalons). Dans cette étape, un clic juste **saute** à l'état final de la pose (comme le mouvement réduit) : l'animation vient à l'étape B. | Page d'essai jouable au clic et au clavier en mouvement réduit ; bloc `quai-iso` existant vert ; `node outils/test.mjs quai-iso smoby fb-6.4` vert |
| B | Opus | Animation par geste (`trajetChercher` / `trajetPoser`, boucle rAF, marques `leve` / `pose`, retard de la file), pauses « choix », « Passer l'animation » jusqu'à la pause suivante, rechargement en pause, mouvement réduit = états finaux ; bulle de Kevin pendant l'animation et à la pause | Page d'essai : la séquence complète se joue ; `quai-iso smoby fb-6.4` verts |
| C | Sonnet | Tests du bloc `quai-iso` (après B) : refus de `verifierQuai` (tableau), géométrie sans heurt, parcours juste (4 poses, jalons 4/4, geste `depose`, `dechargement` avec `arret`), inaction (0 jalon, rien posé), P3 sur l'allée (seule P3 ✗, Kevin réagit, case grisée gardée, P3 finit posée), évaluation (premier clic pose sans réaction, jalon ✗), clavier (Tab, Entrée, focus conservé après refus), rechargement en pause, mouvement réduit, « Passer l'animation », `commence` avec `depose` (palettes dans les cases justes, pas de jalon dépose), DOM des cases sans verdict ; **chaque cas éprouvé par sabotage dans les deux sens** | `node outils/test.mjs quai-iso` vert, sabotages consignés |
| D | Sonnet | `activites/FICHE-SEANCE.md` (déclaration `depose`, état, geste, jalons, mode copie, décor), en parallèle de C | Fiche relue contre le code |
| E | Fable | Suite entière `node outils/test-parallele.mjs`, relecture des diffs, commits par nom, push, lignes dans `chantiers.md` (E-5 : lot 2 livré) et `decisions.md`, EN-COURS effacé | Tout poussé, adresse de la page d'essai donnée à Tristan |

## 4. Règles pour les sous-agents

- Lire `CLAUDE.md` en entier, ce fichier, la fiche de passage de la maquette, puis **les lignes citées** de `quai.js` (ne pas relire
  les 3 270 lignes d'un bloc : `verifierQuai` 535, `verifierDeuxSeances` 509, `planChariot` 378, `placesIso` 1384, `imageIsoChariot`
  1453, `scene2` 1591, `animer` 1670, `ecran4` 2503, `html` 2917, `brancher` 2905, `sig` 3011, bloc `ARRET` 2964, `jalonsQuai` 743,
  `etapesQuai` 906, `signaux` 2896 ; les numéros bougent avec les éditions : chercher par nom).
- Écrire dans un fichier par script Node posé dans le brouillon ou avec l'outil Edit : **jamais** de heredoc ni de `node -e` en
  ligne (apostrophes et accents graves cassés sur ce poste). `python` n'est pas dans le PATH.
- Aucune adresse externe, LF, pas d'aplat vert hors « juste », un champ ou une case ne prend jamais d'aplat.
- **Ne pas commiter** (Fable commite par nom). Ne jamais toucher `outils/test.mjs`, `outils/test/commun.mjs`, ni réécrire un cas
  existant sans le dire dans le compte rendu. Ne jamais ajouter ni modifier les fichiers de Cowork (`docs/briefs/ENT-*`,
  `FEUILLE-DE-ROUTE*`, `.svg` A-SUPPRIMER) : ils sont modifiés et non commités, ce n'est pas notre chantier.
- Serveur de test : `PORT_TESTS` propre à l'étape (A : 8107, B : 8108, C : 8109) ; arrêter un processus **par PID** seulement.
- Compte rendu ≤ 20 lignes : fichiers touchés, ce qui est **VÉRIFIÉ** (à l'écran ou par un test lancé) et ce qui est **SUPPOSÉ**,
  écarts à cette feuille, questions ouvertes. Une capture d'écran de la page d'essai (Playwright, 1366 × 768) dans le brouillon,
  chemin donné.

## 5. Retours d'écran de Tristan (à remplir)

—
