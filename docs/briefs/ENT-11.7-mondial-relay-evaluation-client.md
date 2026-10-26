# Brief de séance — ENT-11.7 Mondial Relay, évaluation : la lampe d'Inès (2de, poste A — gestion, évaluation)

**Statut** : livré (26/10/2026, `pret: true, ouverture: 'prof'`, en ligne, cachée aux élèves) ; à essayer à l'écran par Tristan avant de l'ouvrir
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé
**Modèle** : Sonnet

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-11.7 |
| `id` | `mondial-relay-evaluation-client` |
| Titre / desc | « Mondial Relay — évaluation : la lampe d'Inès » / « Conseiller(ère) au service client : écouter une expéditrice dont le colis est arrivé cassé, appliquer les conditions de vente, ouvrir la réclamation et lui répondre par écrit. » |
| Niveau(x) | 2de |
| Compétence(s) | **AGO-1.1** (identifier la demande, apporter une réponse adaptée), **AGO-1.2** (appliquer les procédures internes, produire les documents de la relation client) ; D1 |
| Temps pédagogique | **évaluation** (AGO-1.1 / 1.2 : seul temps en 6.2, règle 15 respectée) |
| Notation | copie rendue, jalons pondérés sur 20, un jeu tiré par élève |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise

Vérifié (CGV Mondial Relay, offre Start, 07/01/2026) : pour un dommage visible, réclamation **dans les 72 h** ; au Point
Relais, le destinataire doit **refuser le colis** pour que la réclamation soit recevable ; indemnité de base **25 € au
plus par colis**, frais d'envoi non remboursés ; assurance en option jusqu'à 500 € ; réclamation par l'outil en ligne avec
le numéro de colis. Service client de plus de 350 conseillers au pic. **Construit** : Inès, sa lampe, les dates.

## 3. Objectif

Sans aide, l'élève écoute, trouve ce que veut la cliente, applique la règle écrite à son cas et lui répond poliment par
écrit, même quand la réponse ne lui plaît pas.

## 4. Déroulé (≈ 45 min)

1. **Avant de commencer**, notées (4 / 20) : clés de 6.2 (conditions de vente, réponse au client), tirées.
2. **L'appel d'Inès** (vue `dialogue`, écran Téléphone, comme Pelleau) : sa lampe vendue 60 € est arrivée cassée à
   Bar-sur-Seine ; l'acheteur a **refusé** le colis au Point Relais (ou l'a pris : tiré, voir §6 bis) ; elle est fâchée.
   L'élève choisit ses répliques : se présenter, demander le numéro de colis, reformuler, ne rien promettre de faux.
3. **Appliquer la règle** (documents joints : extrait des CGV art. 11 et 12 ; suivi du colis) : l'élève coche ce qui
   s'applique au cas tiré (réclamation recevable ou non, dans les délais ou non, montant : 25 € au plus sans assurance,
   la valeur déclarée si elle a pris l'assurance).
4. **Ouvrir la réclamation** (fiche à remplir : numéro de colis, date, nature du dommage, montant demandé).
5. **Le courriel de réponse** à Inès (phrases à choisir, comme 6.2) : décision, montant, délai, formule.
6. Copie rendue.

## 4 bis. Questions au fil — propositions (notées, sans retour)

| Geste | Question | Pourquoi |
|---|---|---|
| Numéro de colis demandé dans l'appel | « Pourquoi demander le numéro avant tout ? » (retrouver le suivi / faire patienter / remplir le temps) | méthode du service client |
| Règle cochée | « Inès a vendu sa lampe 60 €. Combien peut-elle recevoir ? » (cliquer la phrase de l'art. 12) | **éco-droit appliqué** : responsabilité limitée du transporteur, texte fourni |
| Courriel envoyé | « Inès n'est pas contente du montant. Que lui proposer pour son prochain envoi ? » (l'assurance en option / rien / de mieux emballer seulement) | conseil client |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| 1 | Appel : demande identifiée (numéro, ce qui s'est passé, ce qu'elle veut) | écoute | 3 |
| 2 | Règle appliquée au cas : recevable ou non, et pourquoi | procédure | 4 |
| 3 | Montant juste (25 € ou valeur assurée selon le cas tiré) | procédure | 3 |
| 4 | Réclamation ouverte : fiche juste | document | 3 |
| 5 | Courriel : décision, montant et délai justes | réponse | 2 |
| 6 | Ton de l'appel et du courriel (aucune réplique agressive ni familière) | forme | 1 |
| — | Avant de commencer | questions | 4 |

La forme pèse 1 sur 20 (règle des 15 % : le cœur est l'application de la règle).

## 6 bis. Tirage

Cas tiré par élève parmi 4 (contrainte d'équité : même nombre de décisions à prendre) : (a) colis refusé, dans les 72 h,
sans assurance → 25 € ; (b) colis refusé, assurance N2 → valeur déclarée ; (c) colis **retiré** puis réclamation → non
recevable ; (d) réclamation au 5e jour → hors délai. Prix de la lampe et dates tirés.

## 7. Demandes au moteur

Aucune a priori (`dialogue`, documents joints, fiche, phrases à choisir). Vérifier que `dialogue` accepte un script tiré
(4 variantes de cas).

## 11. Questions ouvertes

- [ ] Montants des niveaux d'assurance N1 à N5 : à relever sur le site Mondial Relay avant d'écrire le cas (b).
- [ ] La réclamation, côté particulier, se fait-elle bien comme dans l'offre Start (outil en ligne) ? À vérifier.

## Compte rendu *(rempli par Claude Code à la livraison, 26/10/2026)*

- **Fichiers créés / modifiés** : `activites/mondial-relay-evaluation-client.js`, `contenus/mondial-relay-ent117.js` (séance) et `contenus/mondial-relay-ent117-donnees.js` (données pures, chargeables sous Node : cas, tirage, répliques, phrases), `contenus/questions/ENT-11.7.js`, `contenus/corriges/ENT-11.7.js` (corrigé calculé depuis la graine de chaque élève), `outils/test/mr-11.7.mjs` (29 cas). Modifiés : `activites/index.js` (une ligne d'import, après `pelleau-evaluation-controle`), `activites/catalogue.js` (régénéré, 92 séances), `outils/test.mjs` (`'mr-11.7'` dans `BLOCS` et dans le groupe 6 de `GROUPES`). Rien dans `core/`, `styles/base.css` ni `contenus/mondial-relay.js`. Pas de ligne `ENTREPRISES` n° 11 ajoutée (à l'intégrateur).
- **Écarts par rapport au brief** (et pourquoi) :
  - Poids codés (16 + 4 d'ouverture = 20) : écoute 3 (numéro 1, situation 1, aucune promesse 1) ; règle 4 ; montant 3 ; dossier 3 (colis et date 1,5, dommage et suite 1,5) ; courriel 2 (décision 0,75, montant 0,75, rappel de la règle 0,5) ; ton 1. Le brief disait « décision, montant et délai » pour le courriel : le **délai de versement n'est pas écrit** (non vérifié), remplacé par le rappel de la règle (72 h, colis refusé au Point Relais).
  - Le **montant ne compte que si la conclusion est juste aussi** (un « 0 » deviné, cas c et d, ne rapporte rien : un jalon ne récompense pas l'inaction).
  - Les **questions au fil du §4 bis** sont posées en **réflexions non notées** (`reflexion: true`, trois : numéro d'abord, combien pour une lampe, prochain envoi) pour garder le total à 20 ; elles ne changent pas la note.
  - Fiche « dossier » remplie dans les quatre cas (suite acceptée ou refusée selon le cas).
  - Cas (b) : la **valeur déclarée est le prix de la lampe tiré** (construit, ≤ 500 €), annoncée comme telle dans le suivi ; **aucun montant de niveau d'assurance N1 à N5** n'est écrit nulle part.
  - Tirage : 4 cas à parts égales, prix parmi 8 valeurs, jour de livraison parmi 19 jours (mardi à samedi), retard 0 à 2 jours (a, b, c) ou 5 à 6 jours (d) ; même chaîne de 11 jalons pour tous.
- **Décisions prises en route** : voir `docs/decisions.md` (26/10/2026, ENT-11.7). Inès est fictive ; le suivi du colis porte la mention « suivi reconstitué pour l'exercice ».
- **Tests** : bloc `mr-11.7`, 29/29. Éprouvés dans les deux sens : un parcours juste par cas (A, B, C, D = 20/20 à la remise, égal à `noter(db)`) ; sabotages jalon par jalon (appel, ton, règle, montant, dossier, courriel) où seul le jalon visé tombe ; réponse familière ou agressive = seul le ton tombe (1 point sur 20) ; inaction = 0 ; copie rendue et verrouillée ; deux élèves, deux cas, même élève même cas ; 400 graines (les quatre cas sortent, 70 à 130 fois chacun) ; aucune requête externe. Aussi verts : `socle fb-6.2 dialogue` (145/145), `questions dependances copie visibilite` (204/205, la seule chute est la garde `docs/EN-COURS.md`, qui cite des fichiers des autres agents absents de ce worktree : propre à l'intégration), `node outils/catalogue.mjs --verifier`.
- **Commits** : voir la branche `worktree-agent-a7ccef91d2af57b66` (non poussée).
- **Reste ouvert** : à regarder à l'écran par Tristan (rien n'a été vu en capture, seulement piloté à la souris dans Playwright) : lisibilité de l'appel et du suivi, ton des répliques d'Inès, cohérence des quatre cas. Questions §11 : montants N1 à N5 non relevés (volontairement non écrits) ; procédure de réclamation côté particulier non vérifiée (la fiche reste générique).
