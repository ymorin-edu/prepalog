# Brief de chantier — ENT-3.3 en deux temps : contrôler (figé), puis corriger

> **📋 Phrase à copier-coller dans ccode (nouvelle conversation, Opus) :**
>
> ```
> Lis docs/briefs/COORDINATION-boost.md puis implémente le brief ENT-3.3-deux-temps. Annonce la durée avant de commencer. Fabrique-moi d'abord la page d'essai cliquable (§8) et attends ma validation avant de toucher à la séance. Dis-moi quels tests tu réécris.
> ```

**Statut** : livré (03/10/2026)
**Date du brief** : 03/10/2026 (cadrage écrit par Claude Code à la demande de Tristan, après essai d'ENT-3.3 à l'écran)
**Chantier** : E du plan Boost (voir `COORDINATION-boost.md`). **Chantier moteur** : un seul à la fois.
**Modèle** : Opus (vue du moteur modifiée : `core/types/tournee.js`, `core/types/grille.js`).

## 1. Pourquoi

Tristan, le 03/10/2026, en essayant ENT-3.3 après le chantier D :

> *« Je n'aime pas la vue tournée de l'après-midi, je la trouve totalement surchargée. »*
> *« Pour moi il faudrait 2 étapes, 2 vues : 1, on a le travail d'Inès figé, il faut chercher l'erreur ; 2, on a une vue
> qui n'est plus figée et on corrige l'erreur et on valide. Ici la vue donne trop d'information, on ne sait plus où regarder. »*

Mesure à l'écran (1366 × 768) : la vue fait ~2 900 px de haut, presque quatre écrans : les 3 étapes + le rappel (~180 px),
la carte + le récapitulatif des arrêts avec ↑ ↓ « retirer » (~800 px), la feuille de 38 lignes + 4 cartes de contraintes
bavardes (~1 830 px).

## 2. Décisions de Tristan (03/10/2026)

| # | Question | Décision |
|---|---|---|
| 1 | Qu'est-ce qui fait passer du temps 1 au temps 2 ? | **L'envoi de la réponse à Inès** (1a). Inès répond « Merci, corrige directement dans l'outil » et la vue se débloque. Le diagnostic est écrit avant toute retouche. |
| 2 | Que voit-on de la feuille au temps 1 ? | **Ses formules ET leurs résultats**, en lecture seule (2a) : l'élève doit lire `=SOMME(B22:B27)` pour trouver l'erreur. |
| 3 | « Valider » au temps 2 ? | **Un bouton « J'ai terminé »** (3a) qui fige la correction et la remonte au suivi, **sans dire juste ou faux**. |
| 4 | Et ENT-3.2 ? | **3.3 d'abord** ; on verra ensuite s'il faut alléger 3.2 (4). |

## 3. Le parcours visé

**Temps 1 — « Contrôler » (le travail d'Inès, figé)**
- La carte montre la tournée d'Inès, **non cliquable**. Pas de récapitulatif des arrêts avec ses boutons ; au plus la liste
  des arrêts en lecture (à trancher sur la page d'essai, §9).
- La feuille d'Inès en **lecture seule** : données, formules et résultats visibles, rien de modifiable, pas de « ↺ ».
- Les contraintes réduites à **trois étiquettes** (190 kg · train 16 h 15 · Pâtisserie avant 15 h 05), sans les phrases.
- **Une seule consigne** : chercher ce qui ne va pas, puis répondre à Inès (Messagerie, six lignes, inchangées).
- Rien ne se juge à l'écran (comme aujourd'hui : `sansVerdict`).

**Passage** : quand un message part vers Inès (juste ou faux : on ne révèle rien — règle de l'option B, alerte 28), un message
d'Inès arrive (« Merci, corrige directement dans l'outil ») et la vue passe au temps 2. Une seule fois, marqué dans la base.

**Temps 2 — « Corriger »**
- La feuille se modifie (« ↺ » remet ce qu'Inès avait écrit), la tournée se reconstruit à la carte (geste d'ENT-3.2).
- Toujours sans verdict à l'écran.
- Un bouton **« J'ai terminé »** fige la correction (la vue repasse en lecture seule) et la remonte au suivi.

## 4. Ce qui existe déjà dans le moteur (à réutiliser, pas à refaire)

- **Messages déclenchés** : `volet.declencheurs` (`core/types/entreprise.js`), avec `apresMail({ a: INES.mail })` de
  `core/declencheurs.js` (pilote ENT-2.1). Un déclencheur peut porter `phaseTournee: 2` : c'est ainsi que l'imprévu d'ENT-3.2
  fait passer la tournée en phase 2 (`passerPhase` dans `tournee.js`).
- **Phases de la tournée** : `phases: { 2: { … } }` (`tournee.js`). Piste naturelle : le temps 1 = phase 1 avec une option
  « figée », le temps 2 = phase 2 sans elle. À confirmer en lisant le code.
- **Feuille** : `verifier: false`, `prerempli`, `libelleOrigine` (« ↺ »), `aides: 'bouton'` (chantier D, lots 1 et 2).
- **Tournée d'un collègue** : `etatInitial` + `amorcer`, `sansVerdict`, pastilles (`pastilles`, `rappel`).

## 5. Demandes au moteur (le cœur du chantier)

Toutes **déclaratives** : ENT-3.1 et ENT-3.2 ne bougent pas et restent vertes sans modification.

1. **Tournée figée** (option de phase, ex. `fige: true`) : carte non cliquable, pas de boutons ↑ ↓ « retirer », « charger »,
   « Recommencer », bouts non cliquables ; un clic forcé ne change rien à l'état.
2. **Feuille en lecture seule** (option de feuille ou de phase) : champs non modifiables (formule et résultat lisibles, au clavier
   aussi), pas de « ↺ », pas de pointage de cellule.
3. **Contraintes en étiquettes** (option) : les jauges réduites à leur limite, sans phrases ni pastilles — au moins au temps 1.
4. **« J'ai terminé »** : un bouton déclaré qui horodate dans l'état de la tournée (ex. `termine: ts`), refige la vue, et que les
   jalons peuvent lire. Sans verdict. À trancher : peut-on rouvrir après ? (§9)
5. Une consigne et des pastilles **par phase** (la consigne par phase existe déjà : `phases[n].consigne`).

## 6. Jalons (ENT-3.3 en a 7 depuis le chantier D, lot 2)

Les sept restent ; à revoir à la lumière des deux temps :
- **Diagnostic** (`contraintes`, `preuves`) : inchangés ; la réponse part au temps 1 par construction.
- **Réparation** (`formule`, `charge`, `horaire`, `creneau`, `trajet`) : lus sur l'état **au moment de « J'ai terminé »**, ou en
  continu comme aujourd'hui ? (§9). Ne jamais récompenser l'inaction (la tournée et la formule d'Inès laissées telles quelles ne
  valent rien — déjà gardé par les tests).
- Faut-il un jalon « a répondu avant de corriger » ? Probablement inutile, le temps 1 l'impose.

## 7. Contenu touché

`contenus/boost-ent33.js` (phases, déclencheur, message d'Inès, consignes, pastilles réduites à deux temps), éventuellement
`activites/boost-ent33.js`. La feuille d'Inès (`feuille({ ines: true })` dans `contenus/boost-ent32.js`) est déjà prête.

## 8. Page d'essai (avant de toucher à la séance)

Règle de Tristan : un changement d'interaction se juge **en cliquant**. Fournir `outils/essai-ent33.html` (ou un mode de
`essai-feuille.html`), décor Boost, journée d'ENT-3.3 réelle : temps 1 figé, une réponse à Inès qui débloque, temps 2, « J'ai
terminé ». Lancer : `lancer.bat` puis l'adresse à donner. **Tristan valide avant d'écrire la séance.**

## 9. Questions encore ouvertes (à poser par Claude Code au moment voulu)

- [x] Temps 1 : la liste des arrêts reste sous la carte, en lecture, sans bouton.
- [x] Les trois étiquettes suffisent, aux DEUX temps (pas de colonne de jauges au temps 2 non plus).
- [x] « J'ai terminé » est définitif (deux clics).
- [x] Jalons de réparation lus en continu.
- [x] Message d'Inès validé tel que proposé (il ne dit pas « corrige »).
- [ ] Ensuite : alléger ENT-3.2 de la même façon (onglets « Carte » / « Feuille » ?) — décision 4, plus tard.

## 10. Mise en ligne

ENT-3.3 est `pret: true` (ouverte) et **personne ne l'a commencée** au 03/10. Travailler **sans pousser** jusqu'à la validation de
la page d'essai ; dire à Tristan avant le push ce qui change. Tests d'ENT-3.3 réécrits : **alerte 7, le dire**.

---

## Compte rendu *(rempli par Claude Code à la livraison)*
- **Fichiers créés / modifiés** : `core/types/tournee.js` (options par phase `fige`, `recapitulatif`, `etiquettes`,
  `consigneFeuille`, `noteFige`, `pastilles`/`rappel`, `raz`, `termine`), `core/types/grille.js` (lecture seule ;
  affichage `tableur` avec barre de formule), `core/types/carte.js` (texte d'aide de la carte figée), `styles/base.css`
  (étiquettes, lecture seule, barre de formule, « J'ai terminé » — variables du thème seulement), `contenus/boost-ent33.js`
  (feuille en colonnes, deux phases, déclencheur, mail, accueil), `activites/boost-ent33.js` (en-tête), `outils/essai-ent33.html`
  (page d'essai : la vraie séance), `outils/test/boost.mjs`.
- **Écarts par rapport au brief** : la feuille d'Inès a été REFAITE en plus (demande de Tristan sur la page d'essai :
  « trop grande, pas ergonomique », « plus de colonnes ») : 15 lignes × 5 colonnes au lieu de 38 lignes — la tournée et le
  poids chargé à gauche (poids des arrêts remplis tout seuls, ligne « À quai » remplie toute seule), les données et le calcul
  des heures à droite, plus de bloc « Commandes du jour » ni de « poids total / poids à laisser à quai ». Elle s'affiche
  « comme un tableur » : le résultat dans la cellule, le contenu dans une barre de formule au-dessus (clic, flèches, Entrée,
  pointage de plage depuis la barre). Vue à 1366 × 768 : ~2 900 px → ~1 650 px.
- **Décisions prises en route** : voir `docs/decisions.md` (03/10/2026, chantier E). Les jalons ne changent pas de sens
  (la formule fausse est maintenant en B11). Personne n'avait commencé ENT-3.3 : aucune reprise de données.
  À savoir : l'enseignant n'a PAS de bouton pour rouvrir « J'ai terminé » à un élève (« Réinitialiser » vide une base de
  groupe, rien de plus fin) — dit à tort dans une question à Tristan, corrigé ici.
- **Tests** : réécrits (alerte 7) — le cas « ENT-3.3 n'a ni phase ni message déclenché » (devenu « les deux temps n'annulent
  rien ») ; les 12 cas de la consigne en trois étapes et des pastilles, remplacés par 13 cas des deux temps (vue, temps 1 figé
  et geste forcé, feuille en colonnes et barre, déblocage par un message faux et une seule fois, barre modifiable sans
  redessin et « ↺ », pointage de plage à la souris, carte et « Retrouver la tournée d'Inès », « J'ai terminé » définitif sans
  toucher aux jalons, options absentes de 3.1 / 3.2, mail, accueil) ; adresses B30 → B11 dans les cas « diagnostic » et
  « formule » ; une ligne de nettoyage rendue robuste. Éprouvés dans les deux sens (vue non figée, rouvrir permis, affichage
  classique, déblocage qui exigerait un chiffre : chaque sabotage fait tomber des cas). Suite complète 382/382.
- **Commits** : voir l'historique (« ENT-3.3 en deux temps… »).
- **Reste ouvert** : ENT-3.1 et ENT-3.2 passent à la feuille en colonnes « comme un tableur » (décidé par Tristan le
  03/10, chantier suivant, chacune avec sa page d'essai) ; en ENT-3.2, les poids sont TAPÉS depuis le mail (décision du
  lot 2) : à reposer à Tristan pour la mise en colonnes. Le mode lecture seule de la feuille « classique » (sans
  `affichage: 'tableur'`) n'est gardé par aucun test : aucune séance ne s'en sert.
