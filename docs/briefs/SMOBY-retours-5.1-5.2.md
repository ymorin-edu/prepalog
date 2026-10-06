# Brief — retours du parcours élève ENT-5.1 et ENT-5.2 (Smoby)

**Statut** : lots A et B livrés (06/10/2026) ; lot C à faire après le test en salle.
**Auteur** : Cowork, 06/10/2026 au soir. **Décisions de Tristan** prises point par point le même soir.
**Source** : parcours joué en mode démo sur `main` (750bc64), fenêtre 1366 × 657, compte prof → groupe 2de →
2 élèves → séances cochées → jeu élève (erreurs plausibles puis juste), Suivi, Repérage, « Élève bloqué ».
Compte rendu complet : projet Cowork `claude/prepalog-parcours-eleve-5.1-5.2.md`.

**Contexte** : Tristan teste 5.1 et 5.2 **en classe le 07/10**. Le site publié est en mode réel.
**Rien ne doit casser avant le cours** : le lot A (données des séances) peut partir ce soir si la suite est verte ;
les lots B et C (moteur, `core/`) attendent le retour de Tristan sur le test en salle, **un chantier moteur à la fois**.
Pendant le test, Tristan coche 5.2 **à la main**, une fois la classe passée sur 5.1.

Règle de Tristan à respecter : une séance déjà finie par des élèves et modifiée → ils gardent leur note
(aucun élève n'a encore joué 5.1 / 5.2 au 06/10 au soir).

---

## Lot A — données des séances (pas de `core/`)

### A1. Tu poli (décision 4a)
Sophie tutoie l'élève ; la règle enseignée devient : **on garde le tu, mais on reste poli**. La faute est le ton, pas le tu.
- `contenus/smoby-ent51.js`, `PHRASES.lignes` id `fin` :
  `['Peux-tu valider ? Merci, bonne journée.', 'Merci de valider vite', 'Bisous']`, `juste: 0`.
- `contenus/smoby-ent52.js`, `PHRASES.lignes` id `fin` :
  `['Peux-tu valider ? Merci, bonne journée.', 'Tu valides vite stp', 'Bisous']`, `juste: 0`.
- Les détails des jalons « ton » (5.1) et « message » (5.2) restent justes (« on écrit à une collègue, au travail »).
- Corrigés calculés : rien à recopier. Vérifier que `outils/test/smoby.mjs` ne lit pas ces phrases (il utilise
  l'essai `outils/essai-2de.js`, phrases écrites à la main : ne pas les changer).

### A2. Raisons au neutre (décision 8)
`contenus/smoby-ent51.js`, `PHRASES.lignes` id `raison` :
`['car ce candidat a le CACES 3 valide, est disponible le 9 décembre et accepte un CDD.', 'car ce candidat habite le plus près.', 'car ce candidat a le CACES.']`, `juste: 0`.

### A3. Libellé du jalon congés (décision 3)
`contenus/smoby-ent52.js`, `PLANNING.jalons` id `conges` : même règle, nouveau libellé
**« Critère métier : congés accordés si possible, décalés seulement si l'équipe manque »**.
Raison : envoyé avec un jour en sous-effectif sans rien décaler, le bilan disait ✗ « aucun congé décalé sans
nécessité » alors qu'aucun congé n'était décalé. Les titres des étapes `v1-conges` / `v2-conges` suivent
(`etapesPlanning`) : vérifier à l'écran et dans le corrigé.

### A4. « formation caces » (décision 8)
`contenus/smoby-ent52.js`, `cartes.nonPosees` : ne plus passer `a.lib` en minuscules d'un bloc (garder « CACES »).
Ex. : mettre en minuscule la seule première lettre.

Suite entière, puis essai à l'écran de 5.1 et 5.2 (une erreur, puis juste). Commit par nom de fichier.

---

## Lot B — verrou de parcours Smoby (décision 1)

**Constat** : 5.2 s'ouvre sans 5.1, et son titre « l'arrivée de Yanis » donne la réponse de 5.1.
**Décision** : verrou comme Spartoo : 5.2 grisée « Termine d'abord ENT-5.1 » tant que 5.1 n'est pas validée
(tous les jalons au vert) ; déblocage par l'enseignant comme aujourd'hui. À étendre à toute la série 5.1 → 5.8
(chaque séance : `precedente` = la précédente), à faire dans le même lot.

**Piège** : les séances Smoby ont **une base par séance** (pas de `jeuId`), Spartoo une base commune. Aujourd'hui :
- la photo de fin (`db.points[id]`, `core/types/entreprise.js` ~l. 623) n'est prise que si `meta.parcours` ;
- `verrou()` (`core/parcours.js`) cherche `points[precedente]` **dans la base de la séance à ouvrir**
  (`m.jeuId || m.id`) → pour 5.2 il chercherait dans la base de 5.2 : **verrou fermé pour toujours**.

À faire :
1. `meta.parcours: true` sur les 8 séances Smoby, `precedente` sur 5.2 à 5.8.
2. `verrou()` : lire la photo dans la base **de la séance précédente** (`prec.jeuId || prec.id`) quand elle
   diffère de celle de la séance. Spartoo inchangé.
3. Vérifier que `seancesDuParcours` / `seancesDepuis` (groupés par `jeuId || id`) et la reprise « Élève bloqué »
   (`core/app.js` ~l. 408) restent justes avec des bases séparées : « Remettre au début de 5.2 » doit repartir de
   la base de départ de 5.2 (pas de restauration de la photo de 5.1 dans la base de 5.2) et effacer les scores de
   5.2 **et des suivantes** de la série. Testé le 06/10 sans parcours : « Remettre au début ENT-5.2 » marche.
4. Tests : 5.2 fermée sans photo de 5.1 ; ouverte avec ; ouverte par `_debloque-` ; Spartoo inchangé.

Signaler dans le compte rendu : touche `core/parcours.js` (règle « une séance n'écrit rien dans `core/` »).

---

## Lot C — moteur, après le test en salle (un chantier à la fois, dans l'ordre que Tristan choisira)

- **C1. Bandeau élève de fin de séance (décision 2)** : la décision 6 de Spartoo s'applique aussi à Smoby. Aujourd'hui
  l'élève ne sait pas qu'il a des jalons faux (Sophie répond pareil, juste ou faux) ; seul le planning de 5.2 montre un
  bilan. Bandeau qui **nomme le jalon faux, jamais la réponse** ; « Séance validée ✓ ». Avec le verrou, l'élève à 7/9
  sait pourquoi 5.2 reste grisée et peut Réinitialiser 5.1.
- **C2. Confirmation avant tout envoi définitif (décision 6)** : fiche, message par phrases, planning.
  Oui / Non dans la page (pas de `confirm()`), ex. « Tu envoies ta fiche à Sophie ? Tu ne pourras plus la modifier. »
- **C3. Tout au tu côté élève (décision 4b)** : textes du moteur vus par l'élève au « vous » → « tu »
  (« Choisissez une phrase à chaque ligne », « Glissez une carte… cliquez-la », « Cliquez une demande… »,
  « Effacer votre travail et repartir d'une base neuve ? », « Votre planning », « Votre planning a été envoyé »,
  messagerie, etc.). Espace enseignant inchangé. Relever la liste par `grep` avant.
- **C4. Suivi enseignant (décision 7)** : plus de « (N) tentatives » pour les séances d'entreprise (5.1 affichait
  « 20/20 (24) », chaque sauvegarde comptée ; la légende dit déjà le contraire) ; le Repérage écrit les **titres** des
  jalons ratés au lieu des identifiants (`ligne-laura`, `raison`, `pas-de-trop`). Va avec l'infobulle du Suivi (décision
  7 de Spartoo, maquette faite).
- **C5. « Répondre » seulement quand une réponse est attendue (décision 8)** : sous le 1er message de Sophie (5.1 et
  5.2), le bouton ouvre une réponse libre qui ne compte pas. Ne l'afficher que sur un message qui porte `phrases`
  (ou une option du message).
- **C6. Logo Smoby (décision 8)** : minuscule sur la tuile Simulog et dans le bandeau rouge ; l'agrandir à la taille de
  Spartoo / Boost.
- **C7. « Base de Inaya » (décision 8)** : message « Base de X remise au début… » (`core/prof.js`) → élision
  (« d'Inaya »).

## Laissé de côté (décision 5)
Planning de 5.2 trop haut à 1366 × 768, même agrandi (compteurs Présents / Besoin / CACES hors écran) :
**Tristan verra au test en salle**.

## Trames
Pas de trame 5.1 / 5.2 (« Tout à l'écran ») : Cowork les écrit après la validation à l'écran (briefs §9).

---

## Compte rendu — lots A et B *(Claude Code, 06/10/2026 au soir)*

- **Fichiers modifiés** : lot A : `contenus/smoby-ent51.js`, `contenus/smoby-ent52.js`, `outils/test/smoby.mjs` (phrases
  justes des cas 5.1 / 5.2 recopiées à la main). Lot B : `core/parcours.js`, `core/app.js`, les 8 `activites/smoby-*.js`,
  `outils/test/smoby.mjs` (3 cas nouveaux).
- **Touche `core/`** (`core/parcours.js`, `core/app.js`) : la règle « une séance n'écrit rien dans `core/` » est levée
  pour ce lot, comme le brief le prévoyait.
- **Lot A** : fait tel quel. Le test Smoby lisait bien les phrases de 5.1 / 5.2 (réponse juste, sabotage « raison ») :
  elles y sont recopiées à la main ; celles de la page d'essai `outils/essai-2de.js` n'ont pas bougé.
- **Lot B, ce qui a changé dans le moteur** :
  - un parcours = les séances qui partagent la base (Spartoo) **ou** que relie la chaîne des `precedente` (Smoby,
    une base par séance) : `seancesDuParcours` le calcule. Sans cela, chaque séance Smoby était un parcours à elle
    seule : « Remettre au début de 5.2 » n'aurait effacé que 5.2, et le bandeau n'aurait pas nommé la séance suivante ;
  - `verrou()` lit la photo de fin dans la base **de la séance précédente** quand elle n'est pas commune ;
  - la reprise « Élève bloqué » passe dans `appliquerReprise` (`core/parcours.js`, testable) : base par séance,
    « Remettre au début de 5.2 » remet 5.2 **et les suivantes** à leur base de départ (jamais la photo de 5.1), à leur
    prochaine ouverture, et ne touche pas la base de 5.1. Spartoo : comportement inchangé.
- **Effet à savoir** : avec `parcours: true`, Smoby reçoit aussi le **bandeau de fin de séance** et le « validée ✓ »
  sur la tuile (le moteur commun du 06/10 : C1 est donc en place pour Smoby).
- **Tests** : bloc smoby 166/166 ; suite entière 805/805. Sabotages éprouvés : verrou qui lit la base de la séance à
  ouvrir → le cas verrou tombe ; reprise qui touche les séances d'avant → le cas reprise tombe ; parcours non chaîné →
  les cas parcours et reprise tombent. Essai à l'écran (élève de 2de en démo) : 5.2 grisée « Termine d'abord ENT-5.1. »,
  puis ouverte et 5.1 « validée ✓ » une fois la photo posée.
- **Poussé le soir du 06/10, à la demande de Tristan**, avant le test en classe du 07/10 (le brief prévoyait d'attendre).
- **Reste ouvert** :
  - la tuile grisée de 5.2 montre toujours son titre et sa description (« l'arrivée de Yanis ») : un élève qui n'a
    pas fini 5.1 lit la réponse si 5.2 est cochée pour le groupe. Changer le titre ? (à trancher par Tristan) ;
  - la confirmation de « Remettre au début » (`core/prof.js`) dit « il repart de ce qu'il avait à la fin de la séance
    précédente » : faux pour Smoby (base de départ). Fichier inscrit par le chantier ENT-1.1 : pas touché ;
  - le bandeau de fin dit « Relis ta trame à ces étapes » : 5.2 n'a pas encore de trame ;
  - `outils/intention-smoby.py` (Cowork) cite encore « car il habite le plus près » : à recaler par Cowork.

