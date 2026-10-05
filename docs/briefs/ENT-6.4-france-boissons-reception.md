# Brief de séance — ENT-6.4 France Boissons, réception du camion de la brasserie (2de, poste C — cariste, entraînement)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/ENT-6.4-france-boissons-reception.md. Commence par l'état des lieux des trois demandes au moteur du §7 (lecture seule) et dis-moi lesquelles existent déjà. N'implémente la séance qu'une fois les demandes livrées. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 05/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiches projet `claude/prepalog-2de-s2-cadrage.md` (décisions 6, 12, 13) et
`claude/prepalog-2de-s2-deroule.md` (décisions 26 et 27). Modèle : **ENT-5.4 Smoby** (`docs/briefs/ENT-5.4-smoby-reception.md`).
Règles d'écriture 2de : `claude/prepalog-2de-eleve-debut-annee.md` (3 lignes par bloc, une consigne par écran).
**Modèle** : Opus pour la séance (pièges et jalons nouveaux) ; la vue « image à inspecter » est une vue nouvelle du moteur (Opus).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-6.4 |
| `id` (jamais modifié ensuite) | `france-boissons-reception` |
| Titre / desc | « France Boissons — le camion de la brasserie » / « Cariste au quai de la plateforme de Buchelay : repérer seul ce qui ne va pas avant de décharger, contrôler 4 palettes de fûts contre le bon de livraison, porter des réserves précises et mettre un fût qui fuit de côté. » |
| Rubrique | simulog, entreprise n° 6 France Boissons |
| Niveau(x) | 2de |
| Compétence(s) | **C1.2** (sécurité), **C1.4** (réception ; C1.4.2 litige) ; domaines D4, D5 |
| Temps pédagogique | **entraînement** (scénario S2) ; `coeur: true` |
| Notation | jalons + note sur 20 |
| Barème | 10 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** (sources dans `prepalog-2de-s2-cadrage.md`) : France Boissons, filiale de Heineken ; plateforme de **Buchelay (78)**,
  35 quais, portique à fûts ; brasserie Heineken de **Mons-en-Barœul** (nouvelle ligne de conditionnement de fûts) ; Affligem,
  Pelforth, Edelweiss et Heineken sont des marques de Heineken France ; Affligem Blonde et Pelforth Blonde existent en fût de 20 L.
  Sécurité au quai (comme ENT-5.4) : moteur coupé, clés remises, chauffeur hors de la zone, véhicule calé, niveleur posé,
  éclairage.
- **Construit (annoncé comme tel)** : le flux Mons → Buchelay, le quai 12, l'heure, le BL n° **MON-27-0617**, les défauts,
  la palette mal étiquetée, le fût qui fuit.
- **Règle de l'exercice (décision 52 de Tristan, 05/10/2026, remplace la 37)** : **1 palette = 8 fûts posés à plat en
  quinconce** (rangées de 3, 2 et 3, une seule couche) sur une **palette de rétention noire en plastique de 1,30 × 1,30 m**
  (caillebotis percé, bac, pieds) — **jamais de palette en bois** sur les illustrations.
  **Vérifié** : 8 fûts par palette mère (INRS, ci-dessous) ; la palette de rétention « 4 fûts de 200 L » du commerce mesure
  1,30 × 1,30 m ([Denios](https://www.denios.fr/bac-de-retention-classic-line-en-polyethylene-pe-pour-4-futs-caillebotis-pe-1300-x-1300-x-375-162289/162289)) ;
  un fût Euro de 20 ou 30 L fait **39,5 cm de diamètre** ([Thielmann](https://www.thielmann.com/en/stainless-steel-kegs/euro-keg)).
  **Construit, à dire dans la trame** : 8 fûts de bière sur une palette de rétention (usage non vérifié chez France Boissons ; la
  source ne dit ni la matière de la palette mère ni la disposition des fûts) ; la disposition à plat en quinconce (calcul :
  1,19 × 1,08 m). La même règle vaut en ENT-6.5 et 6.6.
- **Vérifié (05/10, INRS, [Travail et Sécurité n° 843, 13/12/2022](https://www.travail-et-securite.fr/ts/843/EI/une-logistique-qui-met-la-pression-sur-les-manutentions.html), plateforme France Boissons de Gennevilliers)** : les fûts arrivent des brasseurs « par lots de huit sur des palettes mères de 1,23 m par 1,12 m » ; ils sont repalettisés sur des palettes 1,20 × 0,80 de 6 fûts au plus pour les clients ; stockage de masse ; portique à fûts. Buchelay (site France Boissons) : 7 000 places palettes, 2 300 références, cales de roue et marquage au sol. Ces chiffres réels sont dits dans la trame ; la séance applique la règle de l'exercice (8 fûts par palette de rétention).
- **Image de la scène de sécurité : dessinée par Cowork** (aucune photo libre ne montre un vrai défaut de quai) —
  `docs/briefs/france-boissons/scene-quai-securite.svg`, validée par Tristan le 05/10 (v2). Légende à l'écran : « Dessin —
  scène construite, ce n'est pas la plateforme de Buchelay. » Aucun visage détaillé, aucune marque.
- **Photos** : `futs-vrac.jpg` (brief `IMAGES-france-boissons.md`) peut servir à l'arrivée du camion ; le décor du déchargement
  reste celui de la vue quai.

## 3. Objectif pédagogique

L'élève, en renfort au quai, sait **repérer seul ce qui empêche de décharger** (sans liste de points à cocher), **contrôler une
réception contre le BL** (compter, lire l'étiquette, faire le tour) et **écrire des réserves précises**, puis **mettre un produit
abîmé de côté** (zone litiges). C'est l'entraînement de C1.2 et C1.4 après le guidage d'ENT-5.4 (Smoby).
Fil rouge : ce camion apporte le **réassort d'Affligem** qui manquait à Malo en ENT-6.2… mais une palette n'est pas la bonne.

## 4. Déroulé (≈ 45 min)

**Date : mercredi 16 juin 2027, 14 h** (suit l'ordre de jeu). Le réassort d'Affligem arrive enfin… mais une palette n'est
pas la bonne : il manquera encore de l'Affligem pour la tournée du vendredi. Calendrier de S2 (décision de Tristan du 05/10/2026, « A : lundi → vendredi ») : 6.1 lun. 14 juin · 6.2 mar. 15 · 6.3 mar. 15 après-midi · 6.4 mer. 16, 14 h · 6.5 mer. 16, 16 h · 6.6 jeu. 17, 7 h · 6.7 jeu. 17 après-midi · 6.8 ven. 18, 6 h · 6.9 ven. 18, 6 h 30 · 6.10 ven. 18, 17 h. L'élève joue **son propre rôle** : « Tu es en renfort au quai de réception. »

1. **Message de Nadia, cheffe de quai** (3 blocs) : « Bonjour {prénom}, bienvenue au quai ! / Le camion de la brasserie de
   Mons arrive au quai 12 : 4 palettes de 8 fûts, dont l'Affligem qu'on attendait. / Avant de décharger, regarde bien la scène.
   Nadia »
2. **Avant de décharger — image à inspecter** (vue nouvelle, §7.3). La scène dessinée s'affiche avec une consigne d'une
   ligne : « Clique sur ce qui ne va pas, puis signale-le à Nadia. » **Aucune liste de points** (entraînement : l'élève y pense
   seul).

   | Zone | Situation | Attendu |
   |---|---|---|
   | Cabine (vitre ou fumée du pot) | **chauffeur au volant, moteur allumé** | défaut |
   | Niveleur | **relevé, pas posé sur la remorque** (fosse visible) | défaut |
   | Cale devant la roue | posée | conforme (piège) |
   | Lampe de quai | allumée, éclaire la remorque | conforme (piège) |
   | Butoir | en place | conforme (piège) |

   Un clic pose une marque numérotée, un second clic l'enlève. Deux boutons : « Signaler à Nadia » / « Commencer à
   décharger ». **Entraînement** : décharger sans avoir signalé les deux défauts n'est **pas arrêté** (contrairement au
   guidage d'ENT-5.4) ; le bilan dit seulement « La scène n'était pas sûre : regarde la cabine et l'arrière du camion. »
   (le critère, jamais la réponse sur l'image). Signalement juste → Nadia : « Bien vu. Je fais couper le moteur et
   descendre le chauffeur, et je pose le niveleur. Tu peux décharger. »
3. **Déchargement** : vue quai **sans froid**, l'élève décharge au chariot frontal (comme ENT-5.4). Pas de chrono.
4. **Contrôle des palettes**, aides de guidage **éteintes** (zone de calcul `{ forme: 'feuille' }` sans rappel, pas de
   détail du comptage, pas de chef de quai qui explique) ; fiche de contrôle comme Picard / Smoby.

   | Palette | Article au BL | Réel (étiquette) | Fûts (disposition) | BL | Réel | Aléa | Attendu |
   |---|---|---|---|---|---|---|---|
   | P1 | Heineken fût 30 L | Heineken fût 30 L | 3 + 2 + 3 | 8 | 8 | aucun | Accepter |
   | P2 | **Affligem Blonde fût 20 L** | **Pelforth Blonde fût 20 L** | 3 + 2 + 3 | 8 | 8 | **référence différente** (erreur du BL) | Réserves — produit différent (référence lue : Pelforth Blonde 20 L) |
   | P3 | Affligem Blonde fût 20 L | Affligem Blonde fût 20 L | 3 + 2 + 3 | 8 | 8 | **1 fût qui fuit**, visible **seulement de l'arrière** (coulure + flaque) | Réserves — fût endommagé (1) |
   | P4 | Edelweiss fût 20 L | Edelweiss fût 20 L | 3 + 2 + 3, **une place vide** | 7 | 7 | palette incomplète **mais conforme au BL** (piège de comptage) | Accepter |

   Toutes les palettes sont des **palettes de rétention noires** (règle de l'exercice, §2).

   Motifs proposés : conforme · **fût endommagé** (§7.1) · manquant · produit différent. Pas de température.
   Références construites (`HEI-30`, `AFF-20`, `PEL-20`, `EDW-20` par exemple) ; désignations réelles.
5. **Réserves sur le BL** (P2 : la référence lue ; P3 : 1 fût), **signature du chauffeur**, palettes rentrées en zone de
   réception (non noté, comme ENT-5.4).
6. **Message à Nadia par phrases à choisir** (déclencheur : BL signé), ordre des choix tiré par élève :

   | Ligne | Juste | Pièges |
   |---|---|---|
   | salutation | « Bonjour Nadia, » | « Salut ! » · « Coucou Nadia » |
   | reçu (imposée) | « J'ai reçu les 4 palettes de Mons. » | — |
   | réserves | « Réserves : la palette P2 est de la Pelforth Blonde au lieu de l'Affligem, et un fût d'Affligem fuit. » | « Tout est conforme. » · « Réserves : il manque 8 fûts d'Affligem. » · « Réserves : 2 fûts d'Affligem fuient. » |
   | fût qui fuit | « J'ai mis le fût qui fuit en zone litiges. » | « J'ai rangé le fût qui fuit en stock avec les autres. » · « J'ai rendu le fût qui fuit au chauffeur. » |
   | fin | « Cordialement, {prénom} » | « À plus ! » · « Bisous » |

7. **Réponse de Nadia** (`apresMail`, ne dit pas si c'était juste) : « Merci. Je préviens Inès que l'Affligem n'est toujours
   pas là. Tout à l'heure, on range les fûts. » Transition vers ENT-6.5.

Mots cliquables : fût, niveleur, cale, réserve, BL, zone litiges, produit différent, chariot frontal.

## 5. Jalons / notation (10)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1 | Chauffeur / moteur signalé **avant** de décharger | image à inspecter (§7.3) | faux si l'élève décharge d'abord ; la vitre et la fumée comptent pour le même défaut |
| 2 | Niveleur signalé **avant** de décharger | idem | idem |
| 3 | Aucun faux signalement (cale, lampe, butoir) | idem | **ne récompense pas l'inaction** : faux si aucun défaut n'est signalé |
| 4 | P1 comptée 8 et acceptée | vue quai | — |
| 5 | P2 : réserve « produit différent », référence lue = Pelforth | vue quai + fiche | P2 acceptée sans réserve = faux ; « Affligem » recopié du BL = faux |
| 6 | P3 : réserve « fût endommagé », 1 fût | vue quai | sans faire le tour, la fuite ne se voit pas |
| 7 | P4 comptée 7 et acceptée | vue quai | 8 (palette supposée pleine) = faux ; réserve « manquant » = faux |
| 8 | BL signé | vue quai | — |
| 9 | Phrase « réserves » juste | `phrasesJustes` | message non envoyé = faux |
| 10 | Phrase « zone litiges » juste | `phrasesJustes` | idem |

Comme ENT-5.4 : une palette = comptage **et** décision justes (un seul jalon). Valeurs attendues **calculées** depuis les
palettes (`couches − absents`, `bl − réel`, nombre de fûts abîmés, référence de l'étiquette) ; dans les tests, écrites à la main.
Salutation et fin non notées. Le dernier envoi du message compte.

## 6. Contenu

`contenus/france-boissons-ent64.js` (scène de sécurité et ses zones, quai, palettes, messages, phrases, étapes), univers dans
`contenus/france-boissons.js` (Nadia y est déjà). L'image : copier `docs/briefs/france-boissons/scene-quai-securite.svg` dans
`contenus/images/france-boissons/` (SVG en ligne ou fichier servi par le dépôt, au choix de Claude Code). Les zones cliquables
sont déclarées par le contenu en coordonnées de l'image (viewBox 1400 × 700) :

| Zone | Rectangle(s) `x, y, l, h` | Défaut |
|---|---|---|
| `cabine` | 96, 296, 126, 92 (vitre) **et** 150, 96, 120, 146 (fumée) | oui |
| `niveleur` | 1074, 466, 92, 96 | oui |
| `cale` | 814, 558, 48, 48 | non |
| `lampe` | 1098, 212, 90, 46 | non |
| `butoir` | 1058, 534, 28, 56 | non |

Maquette cliquable de référence (jetable, ne pas recopier le code) : `G:\Mon Drive\Travail\Logistique\1L\Claude outputs\maquette-6.4-securite-quai.html`.

## 7. Demandes au moteur

1. **Motifs du quai déclarables par la séance** : ajouter « fût endommagé » (une réserve chiffrée : « Nombre de fûts
   endommagés », la fiche de contrôle prend la même ligne) ; la séance déclare la liste des motifs proposés (ENT-6.4 : conforme,
   fût endommagé, manquant, produit différent). Sans changer Picard ni Smoby. *(Le compte rendu d'ENT-5.4 demandait déjà des
   libellés déclarables à l'étape ① : à grouper.)*
2. **Palette de fûts dans la vue quai** : dessiner des **cylindres** (fûts) au lieu de cartons quand le contenu le déclare
   (`forme: 'fut'`), **8 fûts à plat en quinconce (rangées de 3, 2 et 3) posés sur une palette de rétention noire de 1,30 × 1,30 m** (plastique, caillebotis, pas de bois) ; la coulure du fût abîmé visible **seulement depuis l'arrière** (comme le carton écrasé de Smoby) ; l'unité
   devient « fûts » partout (comptage, réserves, BL). Si c'est trop cher : cartons gardés, unité « fûts » seule, et le dire.
3. **Image à inspecter** (vue n° 6 de `prepalog-2de-hors-socle-et-vues.md`, ou mode « zones à trouver » du brief
   `MOTEUR-modes-visite.md` — **à trancher par Tristan à l'état des lieux**) : une image + des zones déclarées (défaut ou
   conforme, plusieurs rectangles possibles par zone) ; clic = marque numérotée, re-clic = l'enlève ; « Signaler » /
   « Continuer sans signaler » ; résultat lu par les jalons (`defautsSignales`, `fauxSignalements`, `avantDechargement`) ;
   en entraînement, pas d'arrêt et bilan qui nomme le critère ; en guidage (plus tard), possibilité d'arrêter comme ENT-5.4.
   Elle servira aussi à ENT-5.4 (« l'étape sécurité passera sur une image à inspecter », décision de Tristan du 04/10).

Ce que la séance réutilise tel quel : vue quai sans froid (lot 4 de MOTEUR-2de-S1), fiche de contrôle, zone de calcul, phrases à
choisir, mots cliquables.

## 8. Tests attendus

Bloc `france-boissons` : parcours juste 10/10 ; inaction 0/10 ; décharger sans signaler → jalons 1 et 2 faux ; cale signalée →
jalon 3 faux ; aucun signalement → jalon 3 faux aussi ; vitre seule ou fumée seule → jalon 1 juste ; P2 acceptée → jalon 5 faux ;
P2 avec « Affligem » en référence → jalon 5 faux ; P3 sans faire le tour (pas de réserve) → jalon 6 faux ; P4 comptée 8 → jalon 7
faux ; phrase « en stock avec les autres » → jalon 10 faux ; sabotage par jalon.

## 9. Supports

- Trame courte (contexte, lexique, tableau des palettes à remplir **sans** le défaut de sécurité) : Cowork, après validation à
  l'écran.
- Corrigé `contenus/corriges/ENT-6.4.js` : défauts attendus, tableau des palettes, réserves écrites, message ; calculé.
- **Questions « Pour réfléchir » de la trame** (décision de Tristan, 05/10/2026) : elles portent sur ce que l'élève vient de faire **et** le replacent dans la semaine de S2 (lundi 14 → vendredi 18 juin, fil rouge de la commande de Malo) : d'où vient ce qu'il a reçu, qui se servira de ce qu'il a produit, ce que son erreur aurait coûté plus loin. Pistes :
  - « Ta réserve sur P2 dit que ce n'est pas de l'Affligem : que risque-t-il de se passer vendredi si personne ne la lit ? »
  - « Tu as mis le fût qui fuit en zone litiges : que se serait-il passé au rangement, tout à l'heure, s'il était resté avec les autres ? »
  - « Tu as signalé le chauffeur et le niveleur avant de décharger : qu'est-ce qui aurait pu arriver pendant le déchargement ? »
  Règles inchangées (`claude/prepalog-trames-eleve.md`) : une question à la fois, sur le travail de l'élève, sans réponse unique.

## 10. Critères de validation par Tristan

La scène se lit sans aide (on voit le chauffeur et le niveleur relevé) ; on reconnaît le quai d'ENT-5.4, avec des fûts ; un élève
de 2de finit en 45 min ; le bilan ne donne jamais la réponse sur l'image.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [x] BL faux = erreur de référence (Tristan, 05/10).
- [x] Sécurité = image à inspecter, dessin v2 validé (Tristan, 05/10).
- [x] Palettes : 3 pièges + 1 conforme (Tristan, 05/10).
- [x] Fût qui fuit : réserve + zone litiges (Tristan, 05/10).
- [x] P2 : réserve « produit différent », palette gardée (Tristan, 05/10).
- [x] Date : **mercredi 16 juin 2027, 14 h** (calendrier « lundi → vendredi », Tristan, 05/10).
- [ ] Image à inspecter : vue n° 6 ou mode des modes visite (à l'état des lieux).
- [x] **Palettes mères de 8 fûts (1,23 m × 1,12 m)** : vérifié (Tristan, 05/10), dit dans la trame.
- [x] ~~4 fûts par palette de rétention (décision 37)~~ → **8 fûts à plat en quinconce sur palette de rétention noire de 1,30 × 1,30 m** (Tristan, 05/10, décision 52), en 6.4, 6.5 et 6.6.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
