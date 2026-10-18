# Brief de séance — ENT-9.4 CHEP, évaluation : la semaine de Légumes de la Lys (1re, évaluation C2.5)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet), après ENT-9.1 à 9.3 :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/COORDINATION-chep.md, les comptes rendus d'ENT-9.1 à 9.3, puis docs/briefs/ENT-9.4-chep-evaluation.md. État des lieux du §7, durée, puis construis.
> ```

**Statut** : à implémenter
**Date du brief** : 17/10/2026
**Conversation d'origine** : Cowork (Opus), 17/10/2026, décisions déléguées par Tristan. Choix secondaires marqués **(Cowork)**.
**À lire avec `COORDINATION-chep.md` et ENT-9.1 à 9.3** : l'évaluation reprend leurs écrans **sans aide**, sur un client neuf et un jeu tiré.
**Modèle** : **Sonnet** (tout existe à ce stade). **Durée estimée** : ≈ 4 h.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-9.4 |
| `id` | `chep-evaluation` |
| Titre / desc | « CHEP — évaluation : la semaine de Légumes de la Lys » / « Seul au service clients de Templemars : préparer les déclarations d'un client et son solde, contrôler un retour de palettes vides et le créditer, organiser la ramasse du lendemain. » |
| Rubrique | simulog, entreprise n° 9 CHEP |
| Niveau(x) | `['1re']` |
| Compétence(s) | `['C2.5']`, les quatre indicateurs |
| Temps | `evaluation` (`copie: true`, `export const noter = (db) => moteur.noter(db)`) |
| Notation | jalons pondérés sur 20, **coefficient 3** ; `bareme: 20` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |
| Niveaux | aucun (évaluation : socle tiré, ni bonus ni niveau) |
| Autres | pas de `correction` ; `questions: 'ENT-9.4'` (ouverture notée seulement) |

## 2. Vérifié / construit
Comme la série (coordination §2). Client neuf, **construit** : **Légumes de la Lys** (Estaires, 59), **M. Thomas Deroo**, responsable
expéditions (vouvoiement). Distributeurs et transporteur : ceux de la série. Horaires et quantités **changés** par rapport à 9.2.

## 3. Objectif
Vérifier **la méthode, pas une réponse apprise** : un autre client, un autre retour, une autre ramasse, tout tiré par élève (deux voisins n'ont
ni les mêmes documents, ni les mêmes piles, ni le même site à reporter). **Rien n'est signalé à l'écran** : pas d'encadré, pas d'aide de
comptage, jauge muette, aucun bilan avant la remise.

## 4. Déroulé (≈ 1 h 20, en classe, sous surveillance)

**Date : lundi 01/02/2027.** L'élève est seul : Sandrine est en congé, Grégory au tri, Yannick en rendez-vous. **Menu** : Avant de commencer ·
Messagerie · Déclarations · Relevé du compte · Quai des retours · Crédit du retour · Ramasse du jeudi · Tournée de ramasse.
**Pas de pastilles ni de barre « Étape suivante »** **(Cowork)** : l'élève s'organise seul. Un message de Sandrine, lu en premier, donne les trois
tâches dans l'ordre.

1. **Avant de commencer — noté** (§4 ter) : 4 questions tirées, sans aide, « Je ne sais pas » en dernier.
2. **Message de Sandrine** (lundi, 7 h 50) : « Bonjour {prénom}, / je suis en congé aujourd'hui. Trois choses : 1. M. Deroo (Légumes de la Lys)
   nous envoie sa semaine : prépare ses déclarations et son solde au vendredi 29/01. 2. Le porteur de Halles d'Artois arrive à 9 h : contrôle-le
   et prépare le crédit. 3. Prépare la ramasse de jeudi avec les avis joints (même règle que d'habitude). / Sandrine ». Pièces jointes : le
   message de M. Deroo et ses documents, les avis de vides, les conditions de location, les règles de crédit.
3. **Partie A — Déclarations et relevé** : les fiches `decl` et `releve` d'ENT-9.1, **sans encadré ni `colonneAide`**, sur 4 documents (§6.1).
   **Pas de réponse au client** (la communication a été évaluée en formatif) **(Cowork)**.
4. **Partie B — Le retour de Halles d'Artois** : le quai iso d'ENT-9.2 avec **4 piles**, en copie (aucun arrêt, aucun verdict, pas de
   « Recommencer »), puis la fiche `credit` d'ENT-9.2 sans le choix 5 (le sort des palettes d'un autre pool, déjà évalué par l'ouverture).
5. **Partie C — La ramasse de jeudi** : la fiche `besoin` d'ENT-9.2 (capacité, le site à camion complet), puis la tournée (4 sites, un de trop),
   **jauge muette** (`sansVerdict`), « Envoyer la tournée » en deux clics.
6. **Remise** : « Rendre ma copie », possible quand les trois parties sont envoyées (et toujours possible à la fin de l'heure par l'enseignant,
   ramassage habituel). Les messages de fin sont neutres (« Bien reçu. »).

## 4 bis. Questions au fil
**Aucune** en évaluation : rien à déclarer.

## 4 ter. Avant de commencer — notée (questions clés)

`ouverture.part: 4`, `ouverture.tirage: { preparation: 2, droit: 2 }`, dans les questions ★ d'ENT-9.1 à 9.3, **réécrites pour Légumes de la Lys**
(variantes), sans aide ni mot cliquable ; juste +1, NSP 0, fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.

| id | Rubrique | Reprise de | Question (version 9.4) | Juste |
|---|---|---|---|---|
| k-p1 | preparation | 9.1 p1 | « CHEP, c'est… » | « un loueur de palettes qui les récupère, les répare et les remet en circulation » |
| k-p2 | preparation | 9.1 p3 | « Légumes de la Lys reçoit des palettes de CHEP et y charge ses légumes. C'est… » | « un émetteur » |
| k-p3 | preparation | 9.1 p5 | « Une palette en bois brut marquée EPAL, dans un compte CHEP… » | « ne se déclare pas : elle n'est pas dans le pool » |
| k-p4 | preparation | 9.2 p3 | « Une palette CHEP abîmée, au retour… » | « est créditée et part en réparation » |
| k-p5 | preparation | 9.2 i1 | (dessin : palette rouge LPR) « Dans un retour CHEP, cette palette… » | « est mise de côté : c'est une palette d'un autre pool » |
| k-p6 | preparation | 9.3 p2 | « Un transfert non déclaré… » | « laisse les palettes sur le compte de l'émetteur, qui continue à payer » |
| k-d1 | droit | 9.1 d2 | « Un cariste de Légumes de la Lys casse {n} palettes CHEP. Qui en répond devant CHEP ? » | « Légumes de la Lys, qui les avait en location » |
| k-d2 | droit | 9.1 d3 | « M. Deroo a oublié de déclarer un transfert. Le contrat dit que la location court jusqu'à la déclaration. Doit-il payer ces jours ? » | « Oui : le contrat signé s'impose aux deux parties » |
| k-d3 | droit | 9.2 d2 | « Halles d'Artois rend {k} palettes de moins que ce qu'elle avait. Qui en répond ? » | « Halles d'Artois, qui les avait en location, sauf preuve qu'elle n'y est pour rien » |
| k-d4 | droit | 9.3 d1 | « M. Deroo a déclaré {d} palettes au lieu de {r}. Qui doit corriger ? » | « Légumes de la Lys : l'émetteur déclare ses transferts » |

Pièges : ceux des questions d'origine. Banque : 6 en préparation pour 2 tirées, 4 en droit pour 2 tirées.

## 5. Jalons / notation (sur 20) — poids fixés par Cowork (délégation du 17/10/2026)

| # | Groupe | Jalon | Poids | Ce qu'il lit | Piège |
|---|---|---|---|---|---|
| 1 | Repérer et tenir le compte | Les deux documents fixes : type, partenaire, quantité | 1 | `decl` | émission prise pour un retour |
| 2 | Repérer et tenir le compte | Le document partiel : transfert, palettes CHEP seulement | 1 | `decl` | le total du camion |
| 3 | Repérer et tenir le compte | Le document sans mouvement reconnu | 1 | `decl` | palettes Europe ou commande déclarées |
| 4 | Repérer et tenir le compte | Les quantités dans la bonne colonne, d'après **ses** déclarations | 1 | `releve` | |
| 5 | Repérer et tenir le compte | Le solde, par formule, juste d'après **ses** déclarations | 2 | `releve` | tapé à la main |
| 6 | Contrôler le retour | Le compte de chaque pile | 1,5 | quai | 15 recopié |
| 7 | Contrôler le retour | Les palettes d'un autre pool repérées, et rien de faux ailleurs | 1,5 | quai | |
| 8 | Contrôler le retour | Les palettes abîmées repérées, et rien de faux ailleurs | 1,5 | quai | dégât de l'arrière |
| 9 | Contrôler le retour | Le crédit et la réparation, d'après **son** contrôle | 1,5 | `credit` | les annoncées créditées |
| 10 | Organiser la ramasse | Le site à camion complet | 1 | `besoin` | dans la tournée |
| 11 | Organiser la ramasse | Le site reporté = le dernier signalé (pièce tirée) | 1 | tournée, `reportes` | |
| 12 | Organiser la ramasse | La tournée tient dans le camion | 1 | tournée, `depassements` | |
| 13 | Organiser la ramasse | Les horaires respectés | 1 | tournée, `creneaux` | |
| — | Questions clés | `ouverture.part` | 4 | ouverture | |

Total : Compte 6 · Retour 6 · Ramasse 4 · Questions clés 4 = **20**. Pas de jalon de forme. Aucun jalon à 0.
**Une erreur ne se paie qu'une fois** (4, 5, 9, 12, 13 lisent le travail de l'élève). Détail jalon par jalon dans le Suivi ; aucune correction
(`copie`).
**À vérifier** (§7 n° 2) : le correctif « quai en copie dans une séance pondérée » (`AVEC_POIDS`, `rendCopie: false`, ENT-8.10) s'applique ici, et
la **tournée en copie** dans une séance pondérée ne prend pas non plus la note à elle seule.

## 6. Contenu (données)

Fichiers : `contenus/chep-ent94-donnees.js`, `contenus/chep-ent94.js`, `contenus/questions/ENT-9.4.js`, `contenus/corriges/ENT-9.4.js`,
`activites/chep-evaluation.js`. **Réutiliser** les fabriques des fiches de 9.1 et 9.2 (passer le jeu et un drapeau « évaluation »), ne pas les
recopier.

### 6.1 Partie A — compte LL-59-0233 (construit), semaine du 25 au 29/01
- Solde au 25/01 : S0 tiré de 120 à 180 (pas de 5).
- **Fixes** : bon d'émission du mar. 26/01 (E de 140 à 200, pas de 20) ; bordereau du mer. 27/01 → **Distri Escaut** (Dourges), T de 20 à 24
  palettes CHEP.
- **Banque `partiel`** : `pa-europe` → Hainaut Primeurs (N de 18 à 22, dont 2 à 5 Europe) ; `pa-lpr` → MarchéLys (mêmes bornes, LPR).
- **Banque `nonMouvement`** : `nm-europe` → Frais du Nord, 16 à 20 palettes Europe ; `nm-commande` → commande de 200 palettes à livrer le
  mar. 02/02.
- `solde = S0 + E − T − C`. **Témoin** (à la main) : S0 150, E 180, T 22, `pa-lpr` 20 dont 16 CHEP, `nm-commande` → **292**.

### 6.2 Partie B — le retour de Halles d'Artois (Douai)
Bon de collecte : **60** palettes CHEP, 4 piles de 15. Histoires (ordre tiré) : `juste`, `manque` (m 1 à 2), `intrus` (i 1 à 2, pool tiré, jamais
en haut ni en bas), `abimees` (a 1 à 2, au moins une visible seulement de l'arrière). **Témoin** : P1 `intrus` {8: 'logipal'} ; P2 `juste` ; P3
`abimees` {5: 'W'} ; P4 `manque` hauteur 13 → reçues 58, autre pool 1, **à créditer 57**, réparation 1, manquantes 2.

### 6.3 Partie C — la ramasse du jeudi 04/02
| Site | Vides | Enlèvement (construit) |
|---|---|---|
| **MarchéLys** (Roubaix) | 390 à 400 (camion complet) | 6 h – 14 h |
| Frais du Nord (Lesquin) | 130 (125 à 135) | 13 h – 17 h |
| Halles d'Artois (Douai) | 110 (105 à 115) | 6 h – 9 h 30 |
| Hainaut Primeurs (Prouvy) | 100 (95 à 105) | 9 h – 13 h |
| Distri Escaut (Dourges) | 75 (70 à 80) | 7 h – 12 h |

Bornes vérifiées à la main : total des quatre de 395 à 435 (> 390) ; sans le plus petit possible (70), au plus 365 (≤ 390).
**Banque `dernier`** (4 pièces) et **contrôle d'équité** comme ENT-9.2 §6.3 : pour chaque pièce, un ordre au moins tient les horaires ; l'ordre
« au plus court » échoue dans au moins deux pièces sur quatre. **Les horaires et le site à camion complet diffèrent d'ENT-9.2** : un élève qui
recopie sa tournée de 9.2 se trompe.

## 6 bis. Tirage
Socle tiré par élève (graine), sans niveau ni bonus. Contrôle d'équité sur 300 graines, **zéro secours**. ⚠ Ne pas toucher aux banques entre
l'ouverture de l'évaluation et le ramassage (test « jeu figé »).

## 7. Demandes au moteur — état des lieux d'abord
1. Les fiches de 9.1 et 9.2 réutilisables avec un drapeau « évaluation » (sans encadré ni aide).
2. **Quai et tournée en copie dans une séance pondérée** : la note reste celle des jalons de la séance (correctif d859c66 pour le quai ; à
   vérifier pour la tournée). Sinon, petit correctif moteur à part, à dire avant.
3. « Rendre ma copie » quand trois vues différentes ont été envoyées (fiche, quai clos, tournée) : la condition de remise se déclare-t-elle ?
4. `ouverture.part: 4` avec un visuel (k-p5) dans la banque.

## 7 bis. Séance déjà jouée ? Non.

## 8. Tests attendus
Bloc **`chep-94`**, lignes dans `BLOCS` et `GROUPES`.
- **À la main** : témoins du §6 (292 ; 57 à créditer ; une tournée juste par pièce de `dernier`).
- Parcours juste = 20 / 20 (ouverture comprise) ; parcours d'un témoin joué sur un autre ≠ 20 ; inaction = 0 ; NSP partout = 16 / 20 au plus
  pour un travail juste ; faux partout à l'ouverture → plancher 0 sur les 4.
- Aucun verdict à l'écran avant la remise (quai sans arrêt, jauge muette, fiches sans « Il manque » qui juge) ; copie figée après remise ;
  ramassage par l'enseignant d'une copie incomplète.
- La note de la séance est celle des jalons (pas celle du quai ni de la tournée seule).
- **Sabotages** : 292 en dur → second témoin ; jauge parlante en copie → test « muette » ; horaires de 9.2 recopiés → contrôle « diffère de 9.2 ».

## 9. Supports
Aucune trame (évaluation). Corrigé `contenus/corriges/ENT-9.4.js` : `corrigeEleve(base, uid)` (ses documents, ses piles, sa pièce `dernier`,
une tournée juste) — lisible par l'enseignant seul dans l'onglet Corrigés (règle : l'outil est formatif, l'évaluation se passe en classe sous
surveillance, sur un jeu neuf).

## 10. Critères de validation par Tristan
Tient en 1 h 20 au poste du lycée ; rien ne dit « juste » ou « faux » avant la remise ; deux voisins n'ont ni les mêmes nombres ni le même site
reporté ; le détail de la note se lit dans le Suivi.

## 11. Décisions prises par Cowork (à corriger à l'écran si besoin)
1. Pas de réponse au client ni de question au fil en évaluation.
2. Trois parties dans une seule séance (≈ 1 h 20) ; si c'est trop long, enlever la partie A (déjà vue deux fois) et monter la ramasse à 6 points.
3. Poids du §5.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
