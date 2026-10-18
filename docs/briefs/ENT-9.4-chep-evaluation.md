# Brief de séance — ENT-9.4 CHEP, évaluation : la semaine de Légumes de la Lys (1re, évaluation C2.5)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet), après ENT-9.1 à 9.3 :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/COORDINATION-chep.md, les comptes rendus d'ENT-9.1 à 9.3, puis docs/briefs/ENT-9.4-chep-evaluation.md. État des lieux du §7, durée, puis construis.
> ```

**Statut** : livré (19/10/2026)
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
- **Fixes** : bon d'émission du mar. 26/01 (E de 140 à 200, pas de 20) ; bordereau du mer. 27/01 → **Primeurs du Delta** (Dourges), T de 20 à 24
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
| Primeurs du Delta (Dourges) | 75 (70 à 80) | 7 h – 12 h |

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

## Compte rendu *(rempli par Claude Code à la livraison, 19/10/2026, session Fable ; séance construite par un sous-agent Opus)*

- **Fichiers créés** : `activites/chep-evaluation.js`, `contenus/chep-ent94-donnees.js` (tirage des trois parties, équité, jeu de l'élève, attendus),
  `contenus/chep-ent94.js` (documents nettoyés, fiches, quai, tournée, messages, jalons, accueil), `contenus/questions/ENT-9.4.js`,
  `contenus/corriges/ENT-9.4.js`, `outils/test/chep-94.mjs`. **Modifiés** : `contenus/chep-ent91-donnees.js` (`fabriqueReleve`), `contenus/chep-ent91.js`
  (`documentChep`, `ficheDeclChep`, `ficheReleveChep`), `contenus/chep-ent92-donnees.js` (`heureDite`/`libHoraire` à la demi-heure, `pointsCarte`,
  `tourneeChep`, `fabriqueRamasse`, `constatsDe`, `creditDe`), `contenus/chep-ent92.js` (`htmlBonCollecte`, `htmlAvis`, `quaiChep`, `ficheCreditChep`,
  `ficheBesoinChep`, exports `nb`, `DOC_REGLES`, `DOC_DESSIN_LPR`), `activites/index.js` (une ligne), **`outils/test.mjs`** (deux lignes ajoutées :
  `chep-94` dans `BLOCS` et au groupe 4 de `GROUPES`). Rien dans `core/`, `styles/`, `contenus/chep.js`, `outils/test/chep/commun.mjs` ni
  `outils/test/tirage-niveaux.mjs` (pas de `declarerTirage`).
- **Les fabriques** : 9.1 et 9.2 appellent les mêmes fabriques que 9.4 avec leurs valeurs. Vérifié deux fois : (1) comparaison objet par objet avec
  la version d'avant (fiches, blocs sur plusieurs bases, lignes du relevé, documents, quais des trois niveaux sur sept graines, tournée, jalons,
  crédit, ordres, équité) : aucune différence ; (2) blocs `chep-91` et `chep-92` verts **sans qu'aucun de leurs cas soit modifié**.
- **État des lieux du §7 (vérifié dans le code)** : 1. fabriques extraites (ci-dessus) ; le drapeau `evaluation` retire l'encadré « Pour déclarer »,
  l'aide de l'accompagné, la colonne « Aide », les notes sous les lignes et le « = » préécrit. 2. Quai en copie : `rendCopie: false`, la note reste
  celle des jalons (`AVEC_POIDS`), `noteQuai` tourne quand même sur les piles et range `detail.quai` (testé, y compris quai jamais ouvert : pas
  d'erreur) ; la tournée n'a ni note ni remise (« Envoyer » horodate et émet le geste) : rien à corriger. 3. « Rendre ma copie » n'a pas de
  condition déclarable : décision 1 ci-dessous. 4. `part: 4` avec un visuel : k-p5 porte `doc: 'dessin-lpr'` (le dessin d'ENT-9.2, exporté) : marche.
- **Témoins du §6 recalculés à la main** : 150 + 180 − 22 − 16 = **292** ✓ ; 15 + 15 + 15 + 13 = 58 reçues − 1 Logipal = **57 à créditer** ✓,
  réparation 1, manquantes 2 ✓ ; une tournée juste par pièce de `dernier` ✓ (Frais du Nord reporté : Halles d'Artois → Primeurs du Delta → Hainaut ;
  Halles reporté : Delta → Hainaut → Frais du Nord ; Hainaut reporté : Halles → Delta → Frais du Nord ; Delta reporté : Halles → Hainaut → Frais du Nord,
  le seul ordre qui tient). **Bornes du brief** : « sans le plus petit possible (70), au plus 365 » est un calcul faux (435 − 70) ; le bon : sans le
  site reporté, au plus 135 + 115 + 105 = **355** (Delta reporté), ≤ 390 : la conclusion tient.
- **⚠ Contrôle d'équité de la ramasse sur la vraie carte (décision 6)** : les deux critères durs passent pour les 81 combinaisons de vides (chaque
  pièce garde au moins un ordre qui tient ; le plus court rate dans deux pièces sur quatre : Frais du Nord reporté et Halles reporté). **Mais
  l'attente du camion n'est pas raisonnable** : Frais du Nord n'ouvre qu'à 13 h, et tous les autres quais ferment à 9 h 30, 12 h ou 13 h. Dès que
  Frais du Nord est dans la tournée (trois pièces sur quatre), le meilleur ordre juste fait attendre le camion **243 à 299 min** (4 h à 5 h, retour
  vers 13 h 36) ; seule la pièce « Frais du Nord reporté » attend 38 à 39 min (ENT-9.2 : 16 à 87 min). **Je n'ai rien recalé** : les horaires du
  brief sont codés tels quels (une ligne par site dans `SITES`, `contenus/chep-ent94-donnees.js`) ; si Tristan les change, le cas « la ramasse » du
  bloc et le jeu figé sont à réécrire (valeurs à la main). À trancher par Tristan.
- **Écarts par rapport au brief** (et pourquoi) :
  1. **« Rendre ma copie » toujours disponible** (décision du chef, précédents 8.5, 8.6, 8.10) : le message de Sandrine et l'accueil disent « Quand tes
     trois parties sont envoyées, clique sur « Rendre ma copie » » (brief §4.6 : remise « possible quand les trois parties sont envoyées »). À valider.
  2. **Pas de lexique** (décision du chef) : tous les documents repris passent par `sansLexique` (`[[mot]]` → mot) ; un cas le vérifie.
  3. **Compte LL-59-0882** (celui de `contenus/chep.js`) au lieu de LL-59-0233 (décision du chef).
  4. **Le compte de chaque pile en quatre jalons de 0,375** (`compte-P1` à `compte-P4`, 1,5 au total), comme 9.2 (0,4 × 5), au lieu d'un jalon tout
     ou rien de 1,5 : une pile mal comptée ne coûte pas les trois autres.
  5. **Jalon 2** juge aussi le partenaire du document partiel (le brief : « transfert, palettes CHEP seulement ») ; **jalon 9** juge aussi le hors
     pool (« à créditer, hors pool, réparation », tous d'après son contrôle) ; **jalon 10** juge la capacité **et** le site à camion complet (la
     capacité est dans la fiche, aucun jalon ne la lisait).
  6. **Fiche « besoin »** : une liste « Le site qui reçoit un camion complet à lui seul » (les cinq plates-formes + « Aucun : tous les sites en
     tournée ») au lieu de la question de 9.2 « Frais du Nord : complet / tournée / attendre » : sinon recopier 9.2 donnait la réponse. Le total et
     « Tout tient ? » de 9.2 sont retirés (non notés en 9.2, ils guidaient la méthode).
  7. **Ordre d'apparition** : relevé après les déclarations (il lit leurs lignes), crédit après la clôture du quai, **tournée après l'envoi du besoin**
     (ses quatre sites diraient lequel est au camion complet) ; le besoin est ouvert dès le départ.
  8. **Commande tirée de 200 à 260 (pas de 10)** au lieu de 200 fixe : E vaut 200 une fois sur quatre, « commande = émission » aurait retiré la pièce
     `nm-commande` du tirage. Équité : `nm-commande` 53 %, `pa-lpr` 53 % sur 300 graines.
  9. **Une pièce jointe de plus** au message de Sandrine : « La semi-remorque de collecte » (26 places, piles de 15, départ 6 h, 55 km/h, temps
     d'enlèvement : les données, sans 390 ni la règle de report, qui reste « la même que d'habitude »). Sans elle, la capacité ne se calcule pas.
  10. **Pas de `precedente`** : sans parcours le champ ne bloque rien, et le moteur s'en sert pour reprendre la photo de la séance précédente à une
      remise à zéro (`core/types/entreprise.js` vers la ligne 1974) ; ENT-8.10 n'en a pas non plus.
  11. **Le titre du relevé dit quoi produire** : « Une ligne par mouvement que tu as déclaré : chaque quantité dans sa colonne (0 dans l'autre), puis
      le solde au 29/01, calculé par une formule ». « Calculé par une formule » est visible (le piège « tapé à la main » reste noté, 2 points) : à
      trancher par Tristan.
  12. **k-d4** : le piège « Personne : l'erreur est petite » devient « Personne : il n'en manque presque pas » (variante : « {n} palettes, ce n'est
      presque rien ») ; les variantes tirent des nombres qui ne valent jamais une quantité de la séance (k-d3 : 3 à 6 manquantes sur 80 à 110 ;
      k-d4 : 30 à 36 déclarées au lieu de 40 à 52).
- **Décisions prises en route** : poste construit (Sandrine pose les questions d'« Avant de commencer » avant son congé) ; documents « Ton poste »
  et « La semi-remorque » construits ; numéros, dates (documents du 26 au 29/01, avis du vendredi 29/01 au lundi 01/02 à 7 h 45, MarchéLys signalé
  le 29/01 à 7 h 40), porteur de Halles d'Artois à 9 h, bon préparé le 29/01, lignes de légumes (poireaux, carottes) : construits ; ids `chep-retours-eval`
  (quai) et `chep-ramasse-eval` (tournée) ; accusés « Bien reçu. » de Grégory (crédit) et de Yannick (tournée), rien d'autre ; un second témoin
  (`@temoin2`, 294, 56 à créditer) pour le sabotage « 292 en dur ». **Poids codés (brief §5, tels quels sauf l'écart 4)** : compte 6 — documents
  fixes 1, partiel 1, sans mouvement 1, colonnes 1, solde par formule 2 ; retour 6 — compte de chaque pile 0,375 × 4, autres pools 1,5, abîmées 1,5,
  crédit 1,5 ; ramasse 4 — capacité et camion complet 1, site reporté 1, tient 1, horaires 1 ; questions 4. Total 20.
- **Tests** : bloc `chep-94`, **19 cas, ≈ 50 s**, 19/19 : registre et poids ; données des deux témoins à la main (292, 294 ; 57, 56) ; la ramasse
  (médianes) ordre juste / faux / plus court par pièce, attente relevée ; « diffère de 9.2 » ; ouverture (4 tirées 2 + 2, NSP en dernier, aucune
  aide, dessin de k-p5, 4 justes = 4, NSP = 0, tout faux = 0) ; parcours juste des deux témoins = 20 / 20 à la remise (= `noter`), aucun mot qui
  juge à aucun écran, la clôture du quai ne rend pas la copie, messages du 01/02/2027 neutres, copie figée après la remise ; voisin = 12,25 ;
  inaction 0, copie vide 0, NSP partout avec travail juste = 16 ; ramassage d'une copie incomplète (partie A seule = 10, figée) ; quai en copie noté
  (quai juste seul = 8,5, jamais ouvert = 4, tournée seule = 3) ; pièges un par un ; jauge muette, « Il manque » sans jugement, quai sans arrêt ;
  tirage 300 graines (0 secours, 0 écart, pièces 40–60 %, `dernier` 15–35 %, trois valeurs par site) ; jeu figé (`eleve-94-a` 296, `eleve-94-b` 304) ;
  corrigé par élève ; ergonomie 1366 × 768 (aucun défilement en largeur, bouton d'envoi visible) ; détail du Suivi. **Non-régression** :
  `node outils/test.mjs chep-94 chep-91 chep-92 chep-93 socle dependances spartoo tirage-niveaux ramasse questions quai-iso copie` : 434/435 ; le seul
  rouge (`quai-iso`, « Quai chariot », dessin du chariot au mur) passe rejoué seul (105/105) : rien de touché dans `core/`, sans lien. Suite
  entière non lancée (le chef la lance). **Sabotages (chaque fichier remis à l'identique, empreinte vérifiée)** :

  | Sabotage | Cas tombés |
  |---|---|
  | solde 292 écrit en dur | données (témoin 2), tirage, jeu figé, corrigé (15/19) |
  | jauge parlante en copie (`core/types/tournee.js`, le temps du test, remis par empreinte) | aucun verdict avant la remise (18/19) |
  | horaires de 9.2 recopiés dans `SITES` | données, la ramasse, diffère de 9.2, tirage, jeu figé, corrigé (13/19) |
  | `rendCopie: false` retiré du quai | registre, les deux parcours justes (« la clôture a rendu la copie »), voisin, inaction, pièges (13/19) |
  | crédit jugé sur le réel (et non sur son contrôle) | voisin, pièges (17/19) |
  | solde tapé à la main accepté | pièges (18/19) |
  | « la tournée tient » sans arrêt exigé | pièges (18/19) |
  | fiche des déclarations remise en guidage (`evaluation: false`) | registre (18/19) |

  Un sabotage n'a rien fait tomber : retirer seulement la ligne `estFormule` du jalon 5 (19/19) — elle double `juge === 'ok'`, qui exige déjà la
  formule (la case attend une formule) ; le vrai garde est éprouvé par « solde tapé à la main accepté ».
- **Captures** (1366 × 768, mode démonstration, élève, témoin 1) : avant de commencer, message de Sandrine, déclarations, relevé, quai (une pile),
  crédit, besoin, tournée, après la remise, Suivi enseignant (dossier de captures de la session ; à refaire : `CAPTURES_ENT94=<dossier> node
  outils/test.mjs chep-94`).
- **Commits** : voir `git log` (par le chef de chantier).
- **Reste ouvert** : (1) **l'attente du camion** (Frais du Nord à 13 h, ci-dessus) : à trancher par Tristan ; (2) **le Suivi d'une copie rendue
  n'affiche que la note** (« 20 sur 20 — copie rendue à … », `core/prof.js` vers la ligne 1076) : le détail jalon par jalon est rangé dans
  `detail` (avec les titres quand le repérage existe) mais aucun écran ne le montre pour une copie — critère §10 « le détail de la note se lit dans
  le Suivi » non tenu par le moteur ; demande au moteur à part ; (3) validation à l'écran par Tristan (poids, écarts 4 à 11, textes, durée 1 h 20) ;
  (4) la remise toujours possible (écart 1).
