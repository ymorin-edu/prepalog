# MOTEUR — Le temps passé remonte toutes les 2 minutes (repérage enseignant)

Brief déposé par Cowork le 06/10/2026. **Modèle : Sonnet** (correctif moteur, pas une vue nouvelle).
**Durée estimée : 30 à 45 min**, surtout pour les tests.

**Statut** : livré — 06/10/2026

## Le défaut constaté en classe (06/10/2026, 1L, ENT 1.1)

Trois élèves ont travaillé la séance le matin. Dans « Repérage des élèves » (onglet Suivi de classe),
on lit **23 min**, **< 1 min** et **< 1 min**. C'est très en dessous du temps réel.

Cause (lue dans le code, vérifiée) :

- `core/types/entreprise.js` (≈ l. 542-558) : la minuterie ajoute bien le temps toutes les 5 s dans
  `db.indicateurs[SEANCE].temps`, mais **sans rien écrire**. Le commentaire le dit : le temps « part avec
  la prochaine sauvegarde de l'élève, et au bouton Quitter ».
- `remonterEtapes()` (≈ l. 604) n'écrit dans `travaux/…` que si le score ou le détail a changé,
  **temps exclu de la clé de comparaison** (`siChange`). Seul `remonterEtapes(true)` (sortie par
  « Quitter » ou Précédent) force l'écriture.
- Un élève qui ferme l'onglet, se déconnecte ou laisse le poste à la sonnerie : l'enseignant lit le temps
  **du dernier changement d'avancement**. Deux élèves n'ont rien changé après l'ouverture (0 mot, 0 aide,
  aucune étape jugée) → « < 1 min ».
- La sauvegarde privée (`ctx.jeu.sauver()`) suit le même rythme : le vrai temps de ce matin n'est pas
  récupérable.

## Décision de Tristan (06/10/2026)

**Option 1 retenue : envoyer le temps toutes les 2 minutes tant que l'élève travaille.** L'option 2
(afficher l'heure de dernière activité) n'est pas demandée.

## Ce qu'il faut faire

1. **Dans la minuterie de `entreprise.js`** : toutes les **120 s de temps compté** (onglet visible), si le
   temps a augmenté d'au moins 60 s depuis le dernier envoi, envoyer le temps. Mêmes gardes que la
   minuterie actuelle : jamais chez l'enseignant (`estProf`), jamais en évaluation (`COPIE` : rien ne
   remonte pendant le travail), jamais après une copie rendue, rien quand l'onglet est caché.
2. **Une écriture légère, qui ne touche ni au score ni aux tentatives.** `ecrireScore` incrémente
   `tentatives` à chaque appel : passer par lui gonflerait le compteur affiché dans le suivi (« (12) »
   au lieu de « (2) »). Proposition :
   - `ctx.enregistrerTemps(secondes)` dans `core/app.js`, à côté de `enregistrer` (mêmes gardes :
     élève, groupe actif, `meta.bareme`, pas de `meta.copie`) ;
   - `B.majTemps(gid, uid, aid, idSeance, secondes)` dans **les deux** backends :
     - Firebase : `updateDoc` du seul champ `detail.indicateurs.<idSeance>.temps` + `dateMaj`
       (utiliser `FieldPath`, les identifiants de séance contiennent des tirets). **Aucune règle à
       changer** : `firestore.rules` permet déjà à l'élève de modifier son propre document tant qu'il
       ne porte pas `rendu`. `updateDoc` échoue si le document n'existe pas : c'est voulu (voir 4) ;
     - démonstration : même effet sur `travaux/${gid}/${uid}/${aid}`, sans toucher l'index ni les
       tentatives.
3. **Sauver aussi le jeu privé au même moment** (`ctx.jeu.sauver()`). Sinon, à la réouverture, l'élève
   repart du temps de sa dernière sauvegarde privée (plus bas), et la prochaine écriture **ferait
   redescendre** le temps lu par l'enseignant. Au besoin, garder en plus le maximum des deux côté
   `majTemps`.
4. **Document absent** (élève qui n'a encore rien envoyé) : se rabattre une fois sur
   `remonterEtapes(true)`, qui le crée. Une tentative de plus dans ce seul cas, c'est acceptable.
5. Mettre à jour le commentaire de la minuterie (il dit aujourd'hui « aucune écriture de plus »).
   Ne **pas** rétablir l'écriture à la fermeture de l'onglet (`pagehide`) : elle a été retirée exprès
   (elle réécrivait la base juste après un effacement voulu).

Coût Firebase : environ 30 écritures par élève et par heure, soit ≈ 450 par heure pour une classe de 15
(plus les sauvegardes privées). On reste très loin de la limite gratuite (20 000 écritures par jour).

## Hors champ

- Les autres vues (quai, entrepôt…) gardent leur propre chrono ; on ne les touche pas.
- La sortie par « Quitter » reste comme elle est (`remonterEtapes(true)`).
- Aucun changement d'affichage dans `core/prof.js`.

## Tests à ajouter (`outils/test.mjs`, alerte n° 7 : ajouter, ne rien réécrire)

Avec une horloge simulée, en mode démonstration :

- séance ouverte, **aucun geste pendant 5 min** → le temps lu dans `travaux` est d'au moins 4 min, et
  `tentatives` n'a pas bougé ;
- onglet caché pendant ces 5 min → le temps n'avance pas, aucune écriture ;
- séance en évaluation (`copie`) → aucune écriture pendant le travail ;
- compte enseignant → aucune écriture ;
- réouverture après fermeture de l'onglet → le temps repart de la dernière valeur envoyée et ne
  redescend jamais.

Sabotages à éprouver : retirer l'envoi périodique ; passer l'envoi par `ecrireScore` (tentatives
gonflées) ; supprimer la sauvegarde du jeu privé (temps qui redescend à la réouverture).

## Pour Tristan, après le commit

**Essai sur un poste avant une séance** (alerte n° 6). Ouvrir une séance avec un compte élève, ne rien
toucher pendant 5 minutes, fermer l'onglet sans « Quitter », puis regarder le repérage côté enseignant :
il doit afficher environ 4 à 5 min.

## Compte rendu *(rempli par Claude Code à la livraison)*

*06/10/2026 — livré.*

- **Fichiers modifiés** : `core/types/entreprise.js` (minuterie : envoi toutes les 120 s de temps compté,
  sauvegarde du jeu privé au même moment, repli sur `remonterEtapes(true)` si le résultat n'existe pas ;
  commentaire réécrit), `core/app.js` (`ctx.enregistrerTemps`), `core/backend-demo.js` et
  `core/backend-firebase.js` (`majTemps`). Aucune règle Firebase touchée, rien dans `core/prof.js`.
- **Tests** : bloc nouveau `outils/test/temps.mjs` (9 cas), inscrit dans `BLOCS` et dans le groupe 1 de
  `GROUPES` (`outils/test.mjs` : deux lignes ajoutées, rien de réécrit). Les cas du brief y sont, l'évaluation
  et le compte enseignant sur banc d'essai (moteur seul). Sabotages éprouvés : sans envoi périodique (4 cas
  tombent), envoi par `ecrireScore` (2 cas : tentatives 0 → 4), sans sauvegarde du jeu privé (1 cas), sans
  garde « évaluation » (1 cas).
- **Écarts par rapport au brief** :
  - Le seuil est simplement « 120 s de temps compté depuis le dernier envoi » (la condition des 60 s s'y
    trouve incluse).
  - Côté Firebase, **pas de lecture avant l'envoi** pour garder le maximum : le jeu privé étant sauvé au
    même moment, le temps ne repart jamais plus bas (le test de réouverture le vérifie en démonstration,
    où `majTemps` garde en plus le maximum, sans coût).
  - Constaté en route : à l'ouverture, la séance remonte déjà sa note une fois (code d'avant), donc le
    résultat existe presque toujours ; le repli « document absent » reste comme filet. Cette écriture à
    l'ouverture compte une tentative à chaque réouverture : comportement inchangé.
- **Non vérifié** : le mode réel (Firebase) n'est pas couvert par la suite. `updateDoc` avec `FieldPath`
  et l'erreur `not-found` sont l'usage documenté du SDK, mais seul l'essai sur un poste le confirmera.
- **Pour Tristan** : l'essai décrit ci-dessus (5 min sans rien toucher, fermer l'onglet sans « Quitter »,
  regarder le repérage) avant la prochaine séance.
