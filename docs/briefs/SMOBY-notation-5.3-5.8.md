# Brief — nouvelle notation pour le reste de Smoby (ENT-5.3 à ENT-5.8)

**Statut** : à implémenter. Toutes les propositions ont été **validées par Tristan le 07/10/2026 à 20 h** (§9), avec
une règle absolue ajoutée (§0). Rien n'est encore écrit dans le code.
**Date du brief** : 07/10/2026 (soir).
**Auteur** : Claude (conversation Cowork), d'après la lecture du code de `main` au commit `e266075`.
**Rien n'a été essayé à l'écran** : tout ce qui suit vient du code, des briefs et des tests.

> **📋 Phrase à copier-coller dans Claude Code :**
>
> ```
> Lis docs/briefs/SMOBY-notation-5.3-5.8.md en entier (la règle absolue du §0 d'abord) et fais le lot 0 (aucun élève bloqué en fin de séance, de 5.3 à 5.8), puis le lot 1 (ENT-5.7 et ENT-5.8). Annonce la durée avant de commencer.
> ```
>
> Puis, dans une autre conversation : `… fais le lot 2 (ENT-5.4)`, puis `… fais le lot 3 (moteur : jugé au premier essai, puis 5.3, 5.5, 5.6)`.

Modèles : **Sonnet** pour les lots 0, 1 et 2 (contenu, avec une petite retouche de la vue quai au lot 2). **Opus** pour le
lot 3 (il change la façon de juger dans deux vues du moteur : visite et plan d'entrepôt).

---

## 0. Règle absolue de Tristan (07/10/2026, 20 h)

> « Ce qu'il faut absolument éviter, c'est un élève bloqué à la fin et que je doive reset toute son avancée. »

Elle passe avant le barème, avant la finesse de la note, dans les quatre lots :

1. **Un élève qui a fini une séance ouvre toujours la suivante**, quels que soient ses résultats. « Fini » veut dire
   que tous les jalons sont jugés ; en 5.6, tant que les jalons ne sont jamais « faux » (avant le lot 3), c'est
   « Terminer ».
2. **Aucun changement de ce brief n'efface le travail d'un élève.**
   - Ne **jamais** se servir de `versionBase` (core/app.js : il vide la base et efface les scores de tout le
     parcours, comme pour la refonte de Spartoo 1.1).
   - Un élève en cours de séance au moment du push retrouve son travail ; ses jalons se recalculent sur ce qui existe.
   - Un élève qui a fini garde sa note (`meilleur` converti en proportion, déjà en place).
3. **Tester le pire cas dans chaque séance** : premier envoi avec tout faux (ou le geste irréversible raté),
   puis vérifier que la séance suivante s'ouvre, sans déblocage de l'enseignant.
4. Si un cas de blocage reste possible quelque part, **le dire à Tristan dans le compte rendu**, avec le geste qui
   le débloque.

**Pour Tristan, en attendant** : si un élève est bloqué, utiliser **« Ouvrir sans validation »** dans le Suivi
(il ouvre la séance suivante sans rien effacer ; en Smoby, chaque séance part de sa propre base). **Ne pas utiliser
« Remettre au début »** : il efface la séance choisie **et toutes les suivantes**.

## Lot 0 — aucun élève bloqué en fin de séance (Sonnet, ≈ 1 h 30, à faire en premier)

- Donner à 5.3 à 5.8 la règle du **premier bilan** pour l'ouverture de la suite : la photo de fin se range dès que
  tous les jalons sont jugés, justes ou faux. Le moteur le sait déjà faire pour `correction: true`.
  - 5.4, 5.7 et 5.8 : leurs jalons restent « à faire » jusqu'à un envoi : le premier bilan y a du sens tout de suite.
  - 5.3 et 5.5 : la fin de la séance rend tous les jalons jugés ; la suite s'ouvre à ce moment-là.
  - 5.6 : ses jalons ne sont jamais « faux » : en attendant le lot 3, la suite s'ouvre à « Terminer ».
- Si le plus simple est de séparer, dans le moteur, « la suite s'ouvre au premier bilan » de « l'élève peut
  corriger », le faire (petit drapeau à part) et le dire : les séances du lot 3 n'auront le bouton « Corriger »
  qu'après le moteur.
- Le bandeau de fin ne doit plus dire « La séance suivante s'ouvrira quand tout sera juste » dans ces séances.
- Tests : pour chaque séance, le pire cas du §0, point 3. Sabotage : remettre l'exigence « tout juste » fait tomber
  le cas.
- Pousser dès que c'est vert, avant les autres lots.

---

## 1. D'où on part

La règle a été décidée par Tristan le 07/10 et appliquée à ENT-5.1 et ENT-5.2 (brief `SMOBY-retours-classe-5.1.md`,
lots A et A bis) :

- chaque case est jugée seule, et chaque bloc a une part fixe de la note sur 20 ;
- le bandeau de fin garde le niveau de correction d'avant et affiche toutes les lignes, en ✓ vert ou ✗ rouge ;
- après le premier bilan, l'élève peut **corriger**, et la séance suivante s'ouvre ;
- la note vaut le premier bilan ; à la 1re correction, elle devient la moyenne du premier bilan et de l'état à ce
  moment-là, puis ne bouge plus.

Pour 5.2 et la suite, la règle dit : **proposer le barème à Tristan avant d'écrire**. C'est l'objet de ce brief.

### Ce que la lecture du code a montré : deux familles de séances

Le drapeau `correction: true` ne marche que si les jalons restent « à faire » jusqu'à un envoi. Ensuite, ils sont justes
ou faux. Il ne marche pas sur une séance où l'élève **recommence jusqu'à trouver** : à la fin, tout y est juste, et le
« premier bilan » ne mesure rien.

| Séance | Comment elle juge aujourd'hui | Ce qu'il faut pour la nouvelle notation |
|---|---|---|
| **5.7** enlèvements (planning) | à l'envoi de chaque version | **contenu seul** : le moteur sait déjà rouvrir le planning (chantier de la 5.2) |
| **5.8** lettre de voiture (fiches, phrases) | à l'envoi | **contenu seul** : fiches et phrases se rouvrent déjà |
| **5.4** réception (quai) | figé à l'écriture des réserves, puis à la signature | contenu, plus une **petite retouche de la vue quai** pour séparer comptage et décision |
| **5.3** visite | l'élève recommence jusqu'à juste ; « Suivant » l'exige | **moteur** : noter au **premier essai** |
| **5.5** rangement (plan d'entrepôt) | rangement jugé en continu, « Vérifier » illimité | **moteur** : rangement jugé au premier essai |
| **5.6** préparation (plan d'entrepôt) | jugé en continu, jamais « faux » | **moteur** : jugé à la vérification, et « Corriger » qui rouvre la préparation |

### ⚠ Un défaut actuel à connaître avant la prochaine séance en classe

Le parcours est strict : sans le drapeau `correction`, la séance suivante ne s'ouvre que si **tous** les jalons sont
justes. Or plusieurs gestes de 5.3 à 5.5 sont **irréversibles** :

- en 5.3, la décomposition de l'adresse se valide une seule fois ;
- en 5.4, le BL est signé et le camion repart ;
- en 5.5, la réception est validée et le stock est écrit.

**Un élève qui s'y trompe reste bloqué** : 5.4, 5.5 ou 5.6 ne s'ouvre pas. C'est le même défaut que celui de 5.1 en
classe, et seul le déblocage à la main de l'enseignant le contourne (dans « Suivi »). **Le lot 0 le règle pour toutes
les séances d'un coup, avant le reste.**

---

## 2. Lot 1 — ENT-5.8 lettre de voiture (contenu seul, Sonnet)

Aujourd'hui, la séance a 8 jalons sur 20 : parties, transport, lieux, marchandise, lettre complète, heure, message au
client et message à Smoby. Tout se juge à l'envoi.

### Les cases (26)

- les **15 champs** de la lettre ;
- **2 cases** dans la fiche Suivi : l'heure (11:00), et « Oui » ;
- les **5 lignes** du message au client : salutation, cause, heure, quai, fin ;
- les **4 lignes** du message à Smoby : salutation, retard, client, fin.

Le jalon « lettre complète » disparaît : une case vide est déjà fausse, il ferait doublon.

### Barème proposé

| Bloc | Points | Détail |
|---|---|---|
| Lettre : les parties | 3 | 4 champs à 0,75 (expéditeur nom et lieu, destinataire nom et lieu) |
| Lettre : le transport | 2,25 | 3 champs à 0,75 (transporteur, chauffeur, véhicule) |
| Lettre : lieux et dates | 2,5 | 5 champs à 0,5 (les trois dates sont la même : qui en trouve une les a toutes, d'où le poids faible) |
| Lettre : la marchandise | 3,25 | nature 0,75, nombre de palettes 1, poids 1,5 (le poids est le calcul de la séance) |
| Suivi de l'enlèvement | 2 | heure 1,5, « Oui » 0,5 (une chance sur deux au hasard, d'où le poids faible) |
| Message au client | 4 | cause 1, heure 1, quai 1, salutation 0,5, fin 0,5 |
| Message à Smoby | 3 | retard 1, client 1, salutation 0,5, fin 0,5 |
| **Total** | **20** | 26 jalons |

### Bandeau (9 lignes)

1. Lettre : les parties
2. Lettre : le transport
3. Lettre : lieux et dates
4. Lettre : la marchandise
5. Le suivi de l'enlèvement
6. Message au client : les informations
7. Message au client : le ton
8. Message à Smoby : les informations
9. Message à Smoby : le ton

### « Corriger »

Il rouvre la lettre, la fiche Suivi et les deux messages, avec les écrans qui existent déjà.

- **Point à trancher (Q6)** : la fiche Suivi n'apparaît dans le menu qu'une fois la lettre envoyée. Si on rouvre la
  lettre, **le Suivi disparaît du menu** jusqu'au renvoi.
  - Proposition : une fois apparu, le Suivi reste dans le menu.
  - À vérifier dans `core/declencheurs.js`, sans rien changer pour les autres séances.
- L'interlocuteur accuse réception à chaque renvoi corrigé : « j'ai bien reçu ta lettre corrigée ». Le message de Julie
  n'est pas rejoué.

---

## 3. Lot 1 (suite) — ENT-5.7 enlèvements (contenu seul, Sonnet)

Aujourd'hui, la séance a 10 jalons : 5 thèmes × 2 versions, avant et après la panne. Le chantier planning de la 5.2 a
déjà rendu le planning corrigeable : « Corriger » rouvre la première version fausse, la panne n'est pas rejouée, et le
compteur de corrections existe.

### Les cases : une règle = une case, dans chaque version (17)

- 8 règles avant la panne : un seul chauffeur à la fois, permis, un seul camion à la fois, type de camion, fenêtre
  d'enlèvement, repos, pause, 9 h de conduite ;
- les mêmes 8 règles après la panne, plus **l'atelier** (le Semi n° 2 en panne).

L'atelier n'est pas jugé avant la panne : il y est toujours juste, ce serait un point gratuit.

Comme aujourd'hui, si un enlèvement n'est pas posé ou pas affecté, **toutes** les règles de la version sont fausses.

### Barème proposé

| Bloc | Points | Détail |
|---|---|---|
| Planning avant la panne | 9 | chauffeur unique 1, permis 1,5, camion unique 1, type de camion 1,5, fenêtre 1, repos 1, pause 1, 9 h 1 |
| Planning après la panne | 11 | les mêmes 9 points + **atelier 2** (c'est le cœur de la replanification) |
| **Total** | **20** | 17 jalons |

### Bandeau (8 lignes)

Pour chaque version (« avant la panne », puis « après la panne »), 4 lignes :

1. les chauffeurs ;
2. les camions (l'atelier entre dans cette ligne après la panne) ;
3. les horaires d'enlèvement ;
4. la conduite et le repos.

### ⚠ Inaction (Q4)

Après la panne, l'élève repart de son planning d'avant. **Le renvoyer sans rien changer rapporte aujourd'hui 4 jalons
sur 5** : seule la ligne « camions » tombe.

- Proposition, comme pour l'ordre de départ en 5.2 : une version d'après la panne **identique** à celle d'avant
  donne toutes ses cases fausses.
- **À vérifier aussi en 5.2** (même structure, déjà livrée) : un planning renvoyé tel quel après l'arrêt d'Inès
  rapporte-t-il des points ? Si oui, appliquer la même garde. Règle de Tristan : les élèves qui ont fini la 5.2
  gardent leur note.

### Accusé de réception

Le volet doit déclarer `corrections['kn-chauffeurs']` (le message de l'interlocuteur de Kuehne+Nagel). Sans cela,
aucun accusé ne part : c'est ce qui manque aujourd'hui, à comparer avec `contenus/smoby-ent52.js`.

---

## 4. Lot 2 — ENT-5.4 réception au quai (Sonnet ; retouche de `core/types/quai.js`)

Aujourd'hui, la séance a 10 jalons :

- sécurité signalée, constat de sécurité ;
- 4 palettes (comptage, décision et motif ensemble) ;
- 2 réserves (P3 et P4) ;
- signature, compte rendu à Bruno.

Le premier bilan tomberait à l'envoi du compte rendu. À ce moment-là, tout le reste est figé (réserves écrites, BL
signé) : le drapeau `correction` est donc possible.

### Les cases (15)

- la cale signalée avant de décharger ;
- le constat de sécurité, **gardé en une seule case**. Jugé point par point, « tout OK » donnerait 5 cases sur 6 sans
  rien regarder ;
- 4 comptages et 4 décisions avec leur motif, **séparés**. C'est la retouche de la vue quai : aujourd'hui, la vue les
  juge ensemble ;
- 2 réserves écrites sur le BL (P3, P4) ;
- 3 lignes du compte rendu : salutation, réserves, fin.

La **signature sort de la note** : elle est juste dès qu'elle est obtenue, même avec un BL vide. C'est une étape du
parcours, pas une compétence. Elle reste un jalon `compte: false` (Q3).

### Barème proposé

| Bloc | Points | Détail |
|---|---|---|
| Sécurité | 4 | cale signalée avant de décharger 3, constat sans erreur 1 |
| Contrôle des palettes | 8 | 4 décisions avec motif à 1,25 ; 4 comptages à 0,75. Le comptage pèse peu : recopier le BL donne P1, P2 et P3, seul P4 est un vrai piège |
| Réserves sur le BL | 4 | P3 2, P4 2 |
| Compte rendu à Bruno | 4 | réserves 3, salutation 0,5, fin 0,5 |
| **Total** | **20** | 15 jalons notés + la signature, non notée |

### Bandeau (10 lignes)

1. Sécurité : la cale signalée
2. Sécurité : le constat
3. Palette P1
4. Palette P2
5. Palette P3
6. Palette P4
7. Réserve de la palette P3
8. Réserve de la palette P4
9. Compte rendu : les réserves
10. Compte rendu : le ton

### « Corriger » (Q2)

**Seul le compte rendu à Bruno se rouvre.** Le BL est signé et le camion est parti, ce qui est vrai dans le métier :
une réserve s'écrit **avant** la signature. Le quai garde donc les erreurs du premier bilan, et la correction ne peut
améliorer que le message.

- Le bandeau le dit : « Le camion est reparti : le BL ne se corrige plus. Tu peux corriger ton compte rendu. »
- « Recommencer la réception » existe déjà : il remet le quai à neuf. Avec le drapeau, vérifier qu'il **ne touche pas
  au premier bilan**, qui est rangé une fois pour toutes.

---

## 5. Lot 3 — moteur « jugé au premier essai » (Opus), puis 5.3, 5.5 et 5.6

Dans ces trois séances, l'élève recommence jusqu'à trouver. Noter l'état final revient à donner presque 20/20 à tout
le monde. **Proposition (Q1)** : chaque case est jugée **à son premier essai**, et ce jugement est figé.

- Le moteur garde déjà le premier essai de chaque jalon (`db.indicateurs[séance].premier`, visible au Repérage) : on le
  fait entrer dans la note.
- La séance suivante s'ouvre **quand la séance est finie**, même si une case a été ratée au premier essai.
- Il n'y a **pas de bouton « Corriger »** quand il n'y a rien à corriger (5.3 : tout est trouvé à la fin).
- Le bandeau garde ✓ / ✗ : ✓ = « du premier coup », ✗ = « trouvé après une erreur » (5.3) ou « à corriger » (5.5,
  5.6).

C'est un **changement de la décision du 04/10** sur 5.5 (brief `MOTEUR-entrepot-verdict-guidage.md`, décision 2 : « la
note ne change pas : jalons jugés sur le rangement final ») : à confirmer par Tristan.

### 5.1 ENT-5.3 visite

Aujourd'hui, la séance a 17 jalons. « Suivant » exige que tout soit juste, donc tout élève qui finit a 16 ou 17 sur 17.

**Les cases (23)** :

- vue du ciel : 3 questions ;
- « Où est-ce ? » : 6 photos ;
- éléments du rack : 4 ;
- travée : 4 coins et les lisses ;
- adresse : 4 parties à décomposer, et l'emplacement à retrouver.

Les 6 points du ciel, les 6 étapes du parcours et les 8 mots restent des passages obligés, **non notés** : on ne peut
pas s'y tromper.

| Bloc | Points | Détail (au premier essai) |
|---|---|---|
| Vue du ciel | 3 | 3 questions à 1 |
| Où est-ce ? | 4 | 6 photos à 2/3 |
| Les éléments du rack | 3 | 4 éléments à 0,75 (l'échelle se trouve au hasard une fois sur trois) |
| La travée | 4 | 4 coins à 0,5 ; les 3 lisses sans clic faux 2 |
| L'adresse : décomposer | 4 | 4 parties à 1 (une seule validation, déjà la règle) |
| L'adresse : retrouver | 2 | trouvé en **3 clics au plus** (proposition : au premier clic, c'est une chance sur 144, trop dur en guidage) |
| **Total** | **20** | 23 jalons |

Bandeau : 6 lignes, une par bloc.

### 5.2 ENT-5.5 rangement

Aujourd'hui, la séance a 9 jalons :

- 4 palettes rangées ;
- 3 lignes de saisie ;
- le stock lu ;
- le message à Kuehne+Nagel.

**Les cases (16)** :

- les 4 palettes rangées, chacune jugée au **premier « Vérifier mon rangement »** où elle est posée ;
- dans la saisie de réception :
  - les comptages de P1, P2 et P4 ;
  - les décisions de P1, P2 et P4 ;
  - le litige de P3 ;
- le stock lu (1 phrase) ;
- les 4 lignes du message à Kuehne+Nagel.

| Bloc | Points | Détail |
|---|---|---|
| Rangement | 8 | 4 palettes à 2 |
| Saisie de la réception | 6 | litige de P3 1,5 ; 3 comptages à 0,75 ; 3 décisions à 0,75 (« accepte » et « réserve » sont justes toutes les deux, d'où le poids faible) |
| Le stock lu | 2 | |
| Message à Kuehne+Nagel | 4 | stock 1,5, départ 1,5, salutation 0,5, fin 0,5 |
| **Total** | **20** | 16 jalons |

**Bandeau (7 lignes)** :

1. Palette P1
2. Palette P2
3. Palette P3
4. Palette P4
5. La saisie de la réception
6. Le stock
7. Le message à Kuehne+Nagel

**« Corriger »** rouvre les deux messages. Le rangement reste corrigeable à l'écran comme aujourd'hui, mais sa note
est celle du premier essai. La saisie, une fois validée, ne se rouvre pas : le stock est écrit.

**⚠ Double peine (Q7).** Une erreur de comptage sur P4 (36 au lieu de 34) fait afficher 396 à l'écran Stock, et 396
est justement la phrase piège du stock lu : une seule erreur coûte donc deux cases.

- Proposition : juger le stock lu **contre ce que l'écran affiche à l'élève**, comme `exigeConforme` au transport.
- Autre possibilité : garder tel quel. Un agent qui lit l'écran sans recompter recopie l'erreur, c'est aussi le
  métier.

### 5.3 ENT-5.6 préparation

Aujourd'hui, la séance a 9 jalons, jugés en continu et jamais « faux ». Le moteur doit :

- juger la préparation à « Vérifier » ou « Terminer » (à faire avant, juste ou faux après) ;
- savoir rouvrir l'écran du plan d'entrepôt par « Corriger ». Le bouton « Reprendre la préparation » existe déjà.

La séance peut alors prendre le drapeau `correction`, comme 5.1 et 5.2.

**Les cases (15)** :

- les 6 lignes de la commande ;
- aucun article hors commande ;
- la descente de réserve (Trotteur) ;
- lourds en bas, fragiles en haut, poids, hauteur, film, étiquettes ;
- le parcours (47 m au plus).

| Bloc | Points | Détail |
|---|---|---|
| Les lignes de la commande | 7 | 6 lignes à 1, aucun article hors commande 1 |
| La descente de réserve | 2 | |
| La palette | 8 | lourds en bas 2, fragiles en haut 2, hauteur 1, poids 0,5 (toujours juste quand les lignes le sont), film 1, étiquettes 1,5 |
| Le parcours | 3 | |
| **Total** | **20** | 15 jalons |

**Bandeau (6 lignes)** :

1. Les lignes de la commande
2. La descente de réserve
3. L'ordre de dépose (lourds, fragiles)
4. Le poids et la hauteur
5. Le film et les étiquettes
6. Le parcours

**Garde (Q5).** Décision de Tristan du 04/10 : la palette et le parcours ne comptent que si **toutes** les lignes sont
justes. Avec ce barème, une seule ligne fausse fait perdre 1 + 11 = 12 points (8/20 au mieux).

- Proposition : la garde vaut pour ce qui dépend du contenu de la palette (lourds, fragiles, poids, hauteur,
  parcours).
- Le film et les étiquettes sont jugés dans tous les cas. Avec une ligne fausse, l'élève aurait alors 10,5/20 au
  mieux.

---

## 6. Ce qui vaut pour les trois lots

- **Poids** : la somme des poids vaut 20 dans chaque séance (le moteur le vérifie). `bareme: 20`.
- **Compétences, temps, codes** : inchangés.
- **Inaction** : chaque séance garde un test « rien fait = 0 ». Les gardes déjà en place restent :
  - en 5.5, le litige non validé reste « à faire » ;
  - en 5.8, les listes démarrent sur « Choisir… ».
- **Champ `meilleur`** : il est déjà converti en proportion quand le `max` change. Un élève qui a fini une de ces
  séances garde sa note (règle de Tristan). Le tester dans chaque séance qui change de `max`.
- **Firebase** : aucune règle ne change, il n'y a rien à publier dans la console.
- **Corrigés à l'écran et trames** :
  - `contenus/corriges/ENT-5.x.js` : réécrire seulement les notes qui citent les anciens numéros de jalons.
  - Les **trames** (Cowork) citent peut-être « 17 jalons », « 9 étapes »… Cowork les relit après chaque lot.
- **Tests** : chaque lot **réécrit** les cas « déclaration » et « parcours juste » de ses séances dans
  `outils/test/smoby.mjs`, puisque le barème change. Le dire à Tristan (alerte 7). Sabotages à éprouver :
  - poids ignorés ;
  - bandeau case par case ;
  - garde d'inaction retirée ;
  - pour le lot 3, note prise sur l'état final au lieu du premier essai.

## 7. Durées annoncées

Ce qui prend le temps, c'est la suite de tests (≈ 5 min par passage, plusieurs passages) et les sabotages, pas
l'écriture.

| Lot | Contenu | Durée |
|---|---|---|
| 0 | plus aucun élève bloqué, de 5.3 à 5.8 | ≈ 1 h 30 |
| 1 | 5.8 puis 5.7 | ≈ 3 h |
| 2 | 5.4, avec la retouche du quai | ≈ 2 h 30 |
| 3 | moteur « premier essai » (visite et entrepôt), puis 5.3, 5.5, 5.6 | ≈ 7 à 9 h, en deux conversations (moteur et 5.3, puis 5.5 et 5.6) |

La « version courte » proposée d'abord est devenue le **lot 0** (§0) : il passe en premier.

## 8. Ordre conseillé

0. **Lot 0** : plus aucun élève bloqué (§0), poussé seul.
1. **Lot 1** : 5.8 et 5.7, le moins risqué, contenu seul.
2. **Lot 2** : 5.4.
3. **Lot 3** : le moteur, puis 5.3, 5.5 et 5.6.

Un seul chantier moteur à la fois : le lot 3 attend que le chantier « Suivi de classe » soit effacé de
`docs/EN-COURS.md`.

## 9. Réponses de Tristan (07/10/2026, 20 h) : toutes les propositions sont prises

- [x] **Q1** — 5.3, 5.5 (rangement) et 5.6 : notés **au premier essai**. Remplace la décision 2 du 04/10
  (`MOTEUR-entrepot-verdict-guidage.md`) pour la note du rangement de 5.5.
- [x] **Q2** — 5.4 et 5.5 : « Corriger » ne rouvre **que les messages** (BL signé, réception validée : on n'y revient pas).
- [x] **Q3** — 5.4 : la signature du BL **sort de la note** (étape du parcours, jalon non compté).
- [x] **Q4** — 5.7 : un planning d'après la panne **renvoyé sans changement = toutes ses cases fausses**. Même garde
  en 5.2 **si** elle a le défaut (à vérifier d'abord ; les élèves qui ont fini 5.2 gardent leur note).
- [x] **Q5** — 5.6 : la garde « toutes les lignes justes » ne vaut que pour lourds, fragiles, poids, hauteur et
  parcours ; **film et étiquettes jugés dans tous les cas**.
- [x] **Q6** — 5.8 : le Suivi **reste dans le menu** quand la lettre est rouverte.
- [x] **Q7** — 5.5 : le stock lu est jugé **contre ce que l'écran affiche à l'élève** (pas de double peine).
- [x] **Q8** — Barèmes des §2 à §5 : **validés tels quels**.
- [x] **Règle absolue** : aucun élève bloqué en fin de séance, aucun reset de son avancée (§0, lot 0 en premier).

---

## Compte rendu *(rempli par Claude Code à la livraison de chaque lot)*

### Lot 0 — livré le 07/10/2026 (Claude Code)

- **Moteur** (`core/types/entreprise.js`) : nouveau réglage `meta.suiteAuBilan: true`, séparé de `correction`.
  La photo de fin de séance (celle qui ouvre la suivante) est rangée dès que tous les jalons sont jugés, justes ou
  faux. Il n'y a ni bouton « Corriger » ni note moyennée, et le bandeau d'origine reste. Sa dernière phrase devient
  « La séance suivante, …, est ouverte » au lieu de « s'ouvrira quand tout sera juste ». `correction: true`
  l'implique. Une séance dont les jalons ne sont jamais « faux » déclare `seanceFinie(db)` dans `creerEntreprise`.
- **Séances** : 5.3 à 5.8 déclarent `suiteAuBilan: true`. En 5.6, la séance est finie quand la préparation est
  **terminée puis vérifiée** (« Vérifier ma préparation »), juste ou non : film et étiquettes se posent après
  « Terminer », d'où la vérification. « Reprendre la préparation » ne referme pas la suite.
- **Rien n'est effacé** : pas de `versionBase`, aucun barème changé dans ce lot. Un élève déjà bloqué voit la suite
  s'ouvrir à sa prochaine action dans la séance, dès que tous ses jalons sont jugés.
- **Tests** (`outils/test/smoby.mjs`, 7 cas ajoutés, aucun cas existant réécrit) : le pire cas de chaque séance, à
  l'écran. 5.3 : adresse décomposée fausse. 5.4 : rien signalé, constat faux, tout accepté sans réserve, compte
  rendu faux. 5.5 : rangement, saisie, stock et message faux. 5.6 : une ligne, mauvais film, une étiquette.
  5.7 : rien posé, deux envois. 5.8 : lettre vide, suivi et messages faux. Chaque cas vérifie que la photo est
  rangée et que le bandeau ne dit plus « quand tout sera juste ». Sabotages éprouvés : retirer `suiteAuBilan`
  (5.3, 5.6) et remettre l'ancienne phrase font tomber les cas.
- **Blocages encore possibles** : en 5.5, une palette jamais posée reste « à faire » (l'élève peut toujours la
  poser, le plan est corrigeable sans limite). En 5.6, l'élève doit cliquer « Vérifier ma préparation ». Aucun
  autre geste irréversible ne retient la suite.
