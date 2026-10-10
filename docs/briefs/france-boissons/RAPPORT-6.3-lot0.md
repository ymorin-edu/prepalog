# ENT-6.3 — rapport du lot 0 (lecture seule, 10/10/2026)

Rien n'a été écrit dans le dépôt. Numéros de ligne relevés le 10/10 vers 15 h (`core/types/entreprise.js` bouge : l'autre agent y écrit).
`planning.js` = `core/types/planning.js`. Calage : `calage-6.3.mjs` (même dossier ; `node calage-6.3.mjs C:/chemin/prepalog` ajoute la contre-épreuve avec le vrai moteur).

## 0. Résultat du calage (VÉRIFIÉ : énumération complète, puis contre-épreuve avec le vrai `planning.js` importé dans Node)
- 1er envoi : 331 776 façons de poser les cartes, 16 206 respectent effectif + côte + Julien. **Exactement 1** solution avec « nombre minimal de congés décalés » + « priorité à la plus ancienne » : **Lucas S1-S2**, tout le reste à sa date (= le brief).
- Après l'imprévu : 36 864 façons, 1 818 valides. **Exactement 1** : **Lucas S8-S9** (= le brief). Sans la 9e colonne : 0 solution à un seul décalage avec la priorité, donc la semaine du 30 août est indispensable.
- **MAIS** : la règle `sansNecessite` du moteur, seule, **ne rend pas la solution unique** : 1 706 plans passent au 1er envoi (275 après l'imprévu), dont 1 296 avec **6 congés décalés** (chacun « bloqué » par les autres). Seule la lecture « nombre minimal de congés décalés » donne l'unicité. Vérifié contre le vrai moteur sur les 16 206 plans valides : identique à ma règle pour 16 206.
- Sans la priorité (lecture D) : 4 solutions (Lucas S1-S2, ou Amandine seule en S1, S4 ou S9 ; après l'imprévu Amandine S4, S8, S9). Le piège du brief §8 « Amandine décalée au lieu de Lucas » existe donc bien (3 plans), fait tomber la seule priorité, pas « sans nécessité ».
- La solution du 1er envoi renvoyée telle quelle après l'imprévu : effectif FAUX (S1 à 5 présents au lieu de 6). Sans `repriseIdentique`, elle garde 3 jalons sur 4 gratuits ; avec, 0 (vérifié au vrai moteur).
- **La règle « un chauffeur de la côte chaque semaine » ne discrimine jamais** : 0 plan respectant l'effectif la viole (il faudrait 3 absents la même semaine, le besoin en autorise 1 ou 2). Jalon gratuit dès que l'effectif tient.
- Tout à sa date demandée (aucune réflexion) : effectif FAUX, côte ok, Julien ok, priorité et « sans nécessité » ok **par vacuité** (rien de décalé) : 3 jalons sur 5 gratuits si le contenu ne les relie pas à l'effectif.

## a) §7 du brief
VÉRIFIÉ (code lu et exécuté dans Node) :
- **Échelle `jours` en semaines : oui.** Libellés libres (`planning.js:66-83`), durée en colonnes arrondie (`:75`), `semaine` facultatif (sans lui, pas de trait épais, `:79`), `largeur` 60 / `col1` 130 par défaut (`:81`). La carte est bornée à la grille (`poser`, `:571-584`) : une carte de 2 semaines lâchée en S9 revient en S8-S9. En-têtes en `white-space:nowrap` (`styles/planning.css:75`) : libellés courts (« S9 · 30 août ») et `largeur` ≈ 96 ; « (après le pic) » va dans `lignes.legende`.
- **Besoin 0 : oui.** `effectif` lit `besoin[t] || 0` (`:273`), le compteur « Besoin » affiche 0 (`:748`).
- **Retirer une ligne et sa carte par `alea` : NON.** `alea` sait modifier des cartes (`cartes`), en ajouter (`ajoutCartes`), ajouter des lignes (`ajoutLignes`), modifier une ressource (`ressources`) (`:139-148`) ; rien ne retire (aucun `retire`/`sansObjet` dans le fichier).
- **Repli sans moteur : fonctionne mais bancal.** `alea.ressources.kevin = { dispo: 9 }` (≥ nombre de colonnes) le rend « pas là » partout (`:112-116`, `:722`) ; sa carte reste posée en S8 dans le planning de l'élève, donc jalons ok (exécuté : ok/ok/ok/ok). Mais la carte reste visible dans le bac et sur la grille, et **si l'élève la retire** (bouton « Retirer »), `tous` tombe (`:408`) et les 5 jalons deviennent faux (exécuté : KO partout). **Demande au moteur recommandée (petite)** : `alea.retraits: { lignes: [ids], cartes: [ids] }` filtré dans `donnees()` (`:143-147`) ; la lecture ignore déjà une entrée de `place` sans carte (`posees` parcourt `D.toutes`, `:164-173`).
- **Ligne du saisonnier : oui.** `ajoutLignes: [{ id, nom, dispo: 1, a: 7 }]` = S2 à S8 (`ressource`, `:108-116`) ; ne pas déclarer de règle `disponible` (la carte de Kevin restée posée la ferait tomber).
- **« Priorité à la plus ancienne » : à écrire, en `critere` (`:334-336`), dans le contenu, sans toucher au moteur.** Lecture P1 du script : un congé décalé X ne doit pas avoir, sur ses semaines demandées, un congé PLUS RÉCENT resté à sa date (`demande` portée par la carte). Elle donne l'unicité (§0).
- **« Décaler le moins » : `sansNecessite` ne suffit pas (§0).** Écrire un 2e `critere` « nombre de congés décalés = minimum » : le minimum se calcule à l'ouverture en essayant 0, 1, 2 cartes déplacées (≈ 50 plans pour k = 1), jamais en dur ; `D.lignes` (`_debut`, `_fin`) et `D.cartes` sont fournis à `verifier` (`:335`). Minimum ⇒ `sansNecessite` (une carte rendue à sa date donnerait moins de décalés), donc ce critère le remplace.
- **Planning renvoyé sans changement = faux : oui, pas par `versions`** (qui limite un jalon à une version, `:31`, `:439`) mais par **`repriseIdentique: 'faux'`** (`:33`, `:436-438`, déjà utilisé par `contenus/smoby-ent57.js:108`). Pour le 1er envoi, « rien posé = tout faux » est natif (`tous`, `:408`).
- **Un seul bouton « Envoyer le planning » avec confirmation : confirmation oui, suppression de « Vérifier » NON.** La confirmation dans la page existe (`:811`, `:975-978`, tutoyée). Mais `meta.temps` `'erreur'` ou `'entrainement'` donne `entrainement` (`entreprise.js:1839-1841`) et ce temps affiche toujours « Vérifier mon planning » (`planning.js:806`) et l'invite « Cliquez sur “Vérifier…” » (`:796`). Seul `evaluation` n'a pas le bouton (et impose « rendre ma copie », `:802`). **Demande au moteur (petite, partagée avec 6.8, Q6)** : `aides.verifier: false` (cache le bouton `:806`, remplace l'invite `:796`). Aide `regles` seule en entraînement : oui (`:640`).
- « Corriger » rouvre la 1re version fausse (`rouvrir`, `:867-878`) : livré, convient à Q6. Heure des messages : `heureScenario` (`contenus/france-boissons.js:85`).

## b) Écarts brief (05/10) / règles postérieures
1. **Barème 16, 16 jalons** (brief §1, §5) → `bareme: 20`, 27 cases = 27 jalons (planning 10, annonce 12, message 5), `poids` + `groupe` + `ecran` sur chacun ; questions notées : `part: 3` prise sur les jalons (le moteur ajoute `question:<id>`, somme contrôlée à l'ouverture). Bandeau : 6 lignes de jalons + 2 questions = 8 (SUPPOSÉ : lecture du « bandeau de 8 lignes » de la refonte).
2. **« Vérifier mon planning »** (brief §1) → supprimé (Q6) : demande au moteur ci-dessus ; `temps: 'entrainement'` dans `meta` (comme `france-boissons-commande.js`), pas `'erreur'`.
3. **Message à Lucas au vous** (brief §4.4) → au **tu** : « Ton congé du 12 au 23 juillet ne peut pas être accordé. », « …Amandine l'avait demandée avant toi. », « Karim te propose du 23 août au 3 septembre. », « Je reste à ta disposition. Cordialement, {prénom}… ». Pièges familiers inchangés (« Salut Lucas ! », « Bisous »). Signature « pour Inès » : à confirmer avec Tristan (en 6.2 : « administration des ventes »).
4. **La phrase « proposition » est seule à porter une date** (refonte) → dater **tous** les choix des lignes décision/raison/proposition (ex. « du 30 août au 10 septembre », « du 2 au 13 août »). Option : `choix`/`juste` calculés à partir du planning v2 de l'élève (`phrases.js:34-36`), pour juger la cohérence message/planning sans double peine.
5. **Une seule validation + garde « identique = faux »** : voir a) (`repriseIdentique`). Brief §5 « envoyer à vide = 0 » : natif.
6. **« Non envoyé = faux »** (jalons 11, 15, 16) → « à faire » jusqu'à l'envoi (refonte §0 règle 4) : natif pour planning, fiche et phrases (modèle `france-boissons-ent62.js:363-373`).
7. **Lucas répond, déçu, l'élève choisit sa réponse (Q9)** : absent du brief. Un 2e message par phrases, **non noté** (aucun jalon), déclenché par `phrasesJustes(db, MSG).envoye` ; Lucas reprend ce que l'élève a écrit **sans corriger** (règle du 10/10, tableaux d'« échos » comme `CHOIX_RUPTURE`, `france-boissons-ent62.js:~268`). Ids de lignes distincts de ceux du message 1 (les gestes `messagerie:phrase:<ligne>` ne sont pas par message).
8. **Parcours / correction** : ajouter `parcours: true`, `precedente: 'france-boissons-commande'`, `correction: true`, `questions: 'ENT-6.3'`, `temps`, `competences: ['AGO-3.2', 'AGO-3.1']` (codes présents, `core/competences.js:84-85`), `domaines: ['D2', 'D3']` (le brief les met dans la compétence). `desc` : déjà à l'infinitif, rien à changer.
9. **Listes de la fiche annonce** (brief §4.5) : le juste est toujours **en tête** et les 4 « oui » avant les 4 « non » ; `fiche.js` n'ordonne que dans l'ordre déclaré (pas de mélange) → écrire l'ordre à la main, juste réparti, lignes oui/non entrelacées.
10. **Trame** (brief §9) : plus de « Pour réfléchir » ni de corrigé de trame (refonte §0 règle 1, Q4) ; remplacés par les questions à l'écran ; corrigé enseignant `contenus/corriges/ENT-6.3.js` gardé. Pas de `trame:` (`sansTrame`).
11. **§4 bis / §4 ter** du brief « à proposer » : tranchés par Tristan le 10/10 (tout gardé) ; l'agent n'a rien à reproposer.
12. **Pire cas** (refonte §0 règle 3) absent du §8 : ajouter le test « tout faux (questions comprises) → la séance suivante s'ouvre sans l'enseignant » (modèle : `outils/test/france-boissons.mjs:183`). §8 « calage » : importer la logique du script (Node) dans le bloc, attendus écrits à la main.
13. **Les 5 jalons du planning ne doivent pas être gratuits** : relier « priorité » et « décalés au minimum » à `effectif` dans leurs listes de règles (schéma de `smoby-ent52.js:173`) ; et le jalon « côte » est gratuit (§0) : poids faible, ou le garder comme repère affiché plutôt que jalon (décision à prendre).

## c) Questions à l'écran
Gestes réels (publiés par les vues) :
1. `planning:fb-conges:poser` : **existe** (`planning.js:586-593`, `:849`) ; se déclenche aussi sur « Retirer » et « Réinitialiser ».
2. `planning:fb-conges:envoyer` (point d'étape, `ferme: 'ecran:planning'`, `entreprise.js:454`) : **existe** (`:596`). Une question de transition peut être `reflexion` (`questions.js:~92`) : la « démission » devient une réflexion non notée, `retour` obligatoire.
3. `messagerie:phrase:raison` : **⚙ n'existe pas pour ce message.** Le contrôle ne connaît que les lignes des mails **semés** par le volet (`entreprise.js:246-250`) ; le message à Lucas arrive par un **déclencheur** (après la 2e version) : la séance refuserait de s'ouvrir. **Demande au moteur (petite)** : lire aussi `declencheurs[].semer('Élève', {mails: []})` (3 lignes + 1 test) ; sinon, accrocher la question à `planning:fb-conges:envoyer` (2e envoi).
4. et 5. `fiche:annonce:envoyer` : **existe** (`fiche.js:438`). Deux questions au même geste : le moteur les enchaîne (`entreprise.js:729-745`, lu, non essayé).
Banque d'ouverture (8 questions, tirage 2 + 2, rubriques `preparation` et `droit`, 4 chacune = le double exigé, `questions.js:185-195`) :
- **Existent** : l'annuaire (`france-boissons.js:276`, Karim « décide de leurs congés », Inès « congés une fois décidés »).
- **À créer** : `cartes` (les 7 demandes, sans Kevin à retirer), `regle` (règle de la plateforme : « demande la plus ancienne garde sa date, on décale le moins possible »), `fiche-de-poste`, `droit` (L3141-3, L3141-17, L1242-10 + L1242-2 3° et L1132-1 pour les questions au fil 4-5), éventuellement le message de Karim sur le besoin.
- Piège : les poids du tirage et `variante(hasard)` : clé de bonne réponse identique pour tous (`FICHE-SEANCE.md:1067-1090`). `essai-cdd` : « un jour par semaine » : jour calendaire ou ouvré ? SUPPOSÉ à vérifier sur Légifrance avant livraison.

## d) Alerte D3141-6 (« un mois avant le départ »)
Chiffres du script : 1er envoi, premier départ **20 jours** après le 15 juin (Lucas S1) ; **version finale : 34 jours** (Amandine S3) et Lucas à 69 jours ; congé d'origine de Lucas : 27 jours.
- **Avancer la scène en mai** : la demande de Kevin est du 28 mai et toute la S2 est datée 14-18 juin → casse le calage. À écarter.
- **Dire que ce planning est un brouillon pour Karim** : seul le planning validé est communiqué aux chauffeurs ; la version finale respecte le mois. Une phrase dans le message d'Inès.
- **Laisser tel quel** : exercice ; le seul départ sous un mois est dans le brouillon.
**Recommandation : la 2e, en une phrase** (« Karim validera, puis je préviendrai les chauffeurs »), plus une ligne dans le corrigé enseignant : elle ne change ni dates ni données.

## e) Poids sur 20 — PROPOSITION À VALIDER PAR TRISTAN (rien n'est codé)
Total jalons 17 + questions notées 3 (L1242-2 : 1,5 ; L1132-1 : 1,5 ; la « démission », la 1re et la 3e restent des réflexions non notées).
| Groupe (ligne du bandeau) | Jalons | Points |
|---|---|---|
| Planning, 1er envoi (4,5) | effectif 1 · côte 0,5 · Julien 0,5 · priorité 1,5 · décalés au minimum 1 | 4,5 |
| Planning, après l'imprévu (5,5) | effectif 1,5 · côte 0,5 · Julien 0,5 · priorité 1,5 · décalés au minimum 1,5 | 5,5 |
| Annonce : le poste (1,5) | intitulé 0,5 · contrat 0,5 · dates 0,25 · rattaché 0,25 | 1,5 |
| Annonce : ce qu'on écrit / n'écrit pas (3) | 4 mentions utiles à 0,25 · 4 mentions interdites à 0,5 | 3 |
| Message à Lucas : le fond (1,5) | décision 0,5 · raison 0,5 · proposition 0,5 | 1,5 |
| Message à Lucas : le ton (1) | salutation 0,5 · fin 0,5 | 1 |
| Questions (3) | 2 notées à 1,5 | 3 |
Cœur (planning + interdites + raison) ≈ 60 % ; forme (ton) 1 point = 5 % (< 15 %) ; aucun jalon à 0. Quarts de point sur l'annonce (12 cases : impossible autrement avec aucun jalon à 0). Le brief de la refonte donnait 5 · 6 · 5,5 · 3,5 ; les 3 points de questions sont pris : 0,5 + 0,5 sur le planning, 1 sur l'annonce, 1 sur le message.

## f) Ce que l'agent constructeur crée / demande
Créer : `activites/france-boissons-conges.js` (`id: 'france-boissons-conges'`, `code: 'ENT-6.3'`, modèle `france-boissons-commande.js`), `contenus/france-boissons-ent63.js` (PLANNING `id: 'fb-conges'`, FICHE `id: 'annonce'`, PHRASES `message-lucas` et `reponse-lucas`, DOCUMENTS, VOLET, ETAPES, ACCUEIL, LEXIQUE congé / effectif / CDD saisonnier / VL / permis B / discrimination / rattaché / priorité, OPTIONS), `contenus/questions/ENT-6.3.js` (`id` = id de la séance, `part: 3`, `ouverture` avec `tirage`, 8 questions d'ouverture, 5 au fil), `contenus/corriges/ENT-6.3.js` (calculé), la ligne `() => import('./france-boissons-conges.js')` dans `activites/index.js:65`, un bloc de cas dans `outils/test/france-boissons.mjs` (à dire à Tristan : réécrit un fichier de test ; `outils/test.mjs` ne bouge pas, le bloc existe), brief (compte rendu), `docs/decisions.md`, `docs/chantiers.md` (D-3), `docs/EN-COURS.md`. Pas de `jeuId`, pas de `reinitialisable`. Le texte de la `FICHE-SEANCE.md` (« questions : essais seulement », tableau des options) est périmé depuis 6.2.
Demander au moteur (3, à faire AVANT la séance, un chantier à la fois) : **(1)** `alea.retraits` (ligne + carte) ; **(2)** `aides.verifier: false` pour le Planning (6.8 aussi) ; **(3)** gestes `messagerie:phrase:*` des mails déclenchés. Rien d'autre : critères, `repriseIdentique`, fiche `liste`/`choix`/`ouinon`/`encadre`, phrases, déclencheurs, `fermetures` existent. Ordre des écrans proposé : planning, message à Lucas, réponse de Lucas, annonce (fiche fermée jusqu'à l'envoi du message, `fermetures`), réponse de Karim.

## SUPPOSÉ (non vérifié)
Rendu à l'écran du planning en 9 semaines (largeur, vidéoprojecteur) ; la lecture « 8 lignes » du bandeau ; la signature « pour Inès » ; « jour » de L1242-10 ; l'ordre des écrans et le moment du message de Karim sur le besoin ; l'enchaînement de deux questions au même geste (lu, non joué) ; le texte des lois de la banque (non relu sur Légifrance) ; que Tristan retienne « nombre minimal de décalés » comme sens de « on décale le moins possible ».
