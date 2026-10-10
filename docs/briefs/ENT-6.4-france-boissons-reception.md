# Brief de séance — ENT-6.4 France Boissons, réception du camion de la brasserie (2de, poste C — cariste, entraînement)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> implémente le brief ENT-6.4 : lis docs/briefs/ENT-6.4-france-boissons-reception.md. Commence par l'état des lieux des trois demandes au moteur du §7 (lecture seule) et dis-moi lesquelles existent déjà. Puis le chantier quai (D-4), page d'essai d'abord ; la séance seulement une fois les demandes livrées. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```
>
> **Réécriture du 10/10/2026 (Cowork)** : la sécurité ne se joue plus sur une image dessinée à part mais **sur le quai iso
> lui-même** (décision Q3 du 07/10, `FRANCE-BOISSONS-refonte.md`). Changent : §2 (image), §4 étape 2, §5 (colonne « ce
> qu'il lit »), §6 (plus de rectangles en pixels), **§7.3 réécrit en entier**, §8, §10, §11. Choix de Tristan du 10/10 :
> deux vues (dehors, puis dedans porte ouverte) ; un clic à côté de tout objet = faux signalement ; un défaut oublié est
> remis en ordre sans un mot au déchargement.

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 05/10/2026 ; §7.3 réécrit le 10/10/2026 ; §4 bis, 4 ter, 5 tranchés le 10/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiches projet `claude/prepalog-2de-s2-cadrage.md` (décisions 6, 12, 13) et
`claude/prepalog-2de-s2-deroule.md` (décisions 26 et 27). Modèle : **ENT-5.4 Smoby** (`docs/briefs/ENT-5.4-smoby-reception.md`).
Règles d'écriture 2de : `claude/prepalog-2de-eleve-debut-annee.md` (3 lignes par bloc, une consigne par écran).
**Modèle** : Opus pour le chantier quai (D-4 : fûts, motifs, **inspection sur le quai iso**, vue nouvelle du moteur) ;
Sonnet suffit ensuite pour déclarer la séance si le chantier est livré et testé.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-6.4 |
| `id` (jamais modifié ensuite) | `france-boissons-reception` |
| Titre / desc | « France Boissons — le camion de la brasserie » / « Cariste au quai de la plateforme de Buchelay : repérer seul ce qui ne va pas avant de décharger, contrôler 4 palettes de fûts contre le bon de livraison, porter des réserves précises et mettre un fût qui fuit de côté. » |
| Rubrique | simulog, entreprise n° 6 France Boissons |
| Niveau(x) | 2de |
| Compétence(s) | **C1.2** (sécurité), **C1.4** (réception ; C1.4.2 litige) ; domaines D4, D5 *(codes sans préfixe : à aligner sur le format du code — AGO- / OTM- / LOG- ailleurs dans S2 ; Claude Code vérifie)* |
| Temps pédagogique | **entraînement** (scénario S2) ; `coeur: true` |
| Notation | jalons pondérés, note sur 20 (`bareme: 20`, un `poids` par jalon, part des questions notées 3 à 5 points) |
| Barème | **20** — tableau de poids validé par Tristan avant d'être codé (règle du 10/10/2026, `NOTATION-ponderation.md`) ; la règle « un point par jalon » du brief d'origine est **retirée** (Tristan, 10/10/2026) |
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
- **Vérifié (05/10, INRS, [Travail et Sécurité n° 843, 13/12/2022](https://www.travail-et-securite.fr/ts/843/EI/une-logistique-qui-met-la-pression-sur-les-manutentions.html), plateforme France Boissons de Gennevilliers)** : les fûts arrivent des brasseurs « par lots de huit sur des palettes mères de 1,23 m par 1,12 m » ; ils sont repalettisés sur des palettes 1,20 × 0,80 de 6 fûts au plus pour les clients ; stockage de masse ; portique à fûts. Buchelay (site France Boissons) : 7 000 places palettes, 2 300 références, cales de roue et marquage au sol.
- **Vérifié (07/10)** dans la [vidéo « Présentation de la Plateforme de France Boissons à Buchelay », Grand Paris Seine & Oise, YouTube, 20/06/2025](https://www.youtube.com/watch?v=LRa0qgI7Weo) : slogan **« Objectif prioritaire : 0 accident »** ; gros plan d'une **cale de roue** rouge à bras
  devant la roue d'un camion à quai ; barrières de protection jaunes et allée piétonne marquée en jaune. Les élèves l'ont vue en 6.1. Ces chiffres réels sont dits dans la trame ; la séance applique la règle de l'exercice (8 fûts par palette de rétention).
- **Scène de sécurité : le quai iso de la vue quai** (décision Q3 de Tristan, 07/10). Le dessin à part
  `docs/briefs/france-boissons/scene-quai-securite.svg` et sa maquette sont **abandonnés** (ne pas les copier dans
  `contenus/`). Légende à l'écran, inchangée dans l'esprit : « Dessin — scène construite, ce n'est pas la plateforme de
  Buchelay. » Personnes sans visage (kit iso), aucune marque sur le camion.
- **Photos** : `futs-vrac.jpg` (brief `IMAGES-france-boissons.md`) peut servir à l'arrivée du camion ; le décor du déchargement
  reste celui de la vue quai.

## 3. Objectif pédagogique

L'élève, en renfort au quai, sait **repérer seul ce qui empêche de décharger** (sans liste de points à cocher), **contrôler une
réception contre le BL** (compter, lire l'étiquette, faire le tour) et **écrire des réserves précises**, puis **mettre un produit
abîmé de côté** (zone litiges). C'est l'entraînement de C1.2 et C1.4 après le guidage d'ENT-5.4 (Smoby).
Fil rouge : ce camion apporte le **réassort d'Affligem** qui manquait à Malo en ENT-6.2… mais une palette n'est pas la bonne.

## 4. Déroulé (≈ 45 min)

**Date : mercredi 16 juin 2027, 14 h** (suit l'ordre de jeu). Le réassort d'Affligem arrive enfin… mais une palette n'est
pas la bonne : il manque une palette d'Affligem sur deux (P2 est de la Pelforth). La commande de Malo n'en dépend plus : elle a été confirmée mardi avec 2 Affligem et 2 Pelforth. Calendrier de S2 (décision de Tristan du 05/10/2026, « A : lundi → vendredi ») : 6.1 lun. 14 juin · 6.2 mar. 15 · 6.3 mar. 15 après-midi · 6.4 mer. 16, 14 h · 6.5 mer. 16, 16 h · 6.6 jeu. 17, 7 h · 6.7 jeu. 17 après-midi · 6.8 ven. 18, 5 h · 6.9 ven. 18, 6 h 30 · 6.10 ven. 18, 17 h. L'élève joue **son propre rôle** : « Tu es en renfort au quai de réception. »

1. **Message de Nadia, cheffe de quai** (3 blocs) : « Bonjour {prénom}, bienvenue au quai ! Ici, l'objectif, c'est **zéro accident**. / Le camion de la brasserie de
   Mons arrive au quai 12 : 4 palettes de fûts, dont l'Affligem qu'on attendait. / Avant de décharger, regarde bien la scène.
   Nadia »
2. **Le camion arrive, puis l'inspection sur le quai iso** (§7.3). Le camion recule à la porte 12 (animation de l'étape ①
   du quai iso, comme Spartoo) ; **le chauffeur reste dans sa cabine** et le pot fume. La scène s'arrête, avec une consigne
   d'une ligne : « Clique sur ce qui ne va pas, puis signale-le à Nadia. » **Aucune liste de points** (entraînement : l'élève
   y pense seul). L'inspection a **deux vues**, le même quai, le même camion :
   - **Dehors** (la cour) : cabine, cale, butoirs. Bouton « Ouvrir la porte de quai » (ouvrir n'est pas décharger).
   - **Dedans** (porte levée, la remorque vue par l'ouverture) : niveleur, lampe. Bouton « ← Revoir dehors » ; on passe
     librement d'une vue à l'autre, les marques de chaque vue restent.

   | Point (`id`) | Vue | Situation | Attendu |
   |---|---|---|---|
   | `cabine` (silhouette au volant **ou** fumée du pot) | dehors | **chauffeur au volant, moteur allumé** | défaut |
   | `niveleur` | dedans | **relevé, pas posé sur la remorque** (le vide entre quai et remorque se voit) | défaut |
   | `cale` (devant la roue arrière) | dehors | posée | conforme (piège) |
   | `butoirs` | dehors | en place | conforme (piège) |
   | `lampe` (lampe de quai à bras) | dedans | allumée, éclaire la remorque | conforme (piège) |

   Un clic pose une marque numérotée, un second clic sur la marque l'enlève. Un clic **à côté de tout objet** (mur, sol, ciel)
   pose aussi une marque : elle vaut **faux signalement** (choix de Tristan, 10/10). Deux boutons, sous les deux vues :
   « Signaler à Nadia » / « C'est bon, on peut décharger ». On peut signaler plusieurs fois avant de décharger.

   **Réponses de Nadia**, composées point par point (jamais un mot sur ce qui n'a pas été signalé) :
   - `cabine` signalée : « Bien vu : je fais couper le moteur, le chauffeur me donne les clés et descend. » → **la scène
     change** : la fumée s'arrête, le chauffeur descend et se tient près de l'accueil chauffeurs.
   - `niveleur` signalé : « Bien vu : je pose le niveleur. » → dans la vue dedans, le niveleur s'abaisse sur la remorque.
   - une marque sur un point conforme ou à côté : « Là, je ne vois rien qui cloche. » (une seule fois par envoi).
   - fin de chaque réponse : « Tu me dis quand on peut décharger. »
   *(La phrase « chez nous, pas de camion à quai sans cale » du brief du 05/10 disparaît de la réponse : dans un signalement
   partiel, elle disait que la cale était un piège. Elle peut devenir une question d'ouverture, §4 ter.)*

   **« C'est bon, on peut décharger »** fige l'inspection (plus de marque, plus de signalement). **Entraînement** : rien
   n'arrête l'élève, même s'il reste un défaut ; un défaut oublié est **remis en ordre sans un mot** (choix de Tristan,
   10/10) : à l'étape suivante le moteur est coupé, le chauffeur est descendu, le niveleur est posé, aucune légende ne le
   dit. Le chauffeur (au vous) remet alors le BL : « Bonjour. Livraison de la brasserie de Mons : voici le bon de
   livraison. » Puis « Oui, vous pouvez décharger », comme le quai iso de Spartoo.
   Au bilan, si un défaut manque : « La scène n'était pas sûre : avant d'entrer dans un camion, il doit être immobilisé et
   le passage vers la remorque doit être sûr. » (le critère, jamais l'endroit sur la scène ; texte à valider, §11).
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

7. **Réponse de Nadia** (`apresMail`, ne dit pas si c'était juste) : « Merci. Je préviens Inès : il manque une palette
   d'Affligem sur deux. Tout à l'heure, on range les fûts. » Transition vers ENT-6.5.

Mots cliquables : fût, niveleur, cale, réserve, BL, zone litiges, produit différent, chariot frontal.

## 4 bis. Questions au fil — tranché par Tristan le 10/10/2026

Choix de Tristan (10/10/2026, après-midi), d'après `docs/briefs/ENT-6.4-propositions-questions-poids.md` §1 (qui corrige
les questions de Cowork, `france-boissons/PROPOSITIONS-questions-au-fil.md`, écrites avant la réécriture du §7.3).
**Cinq questions**, toutes posées par Nadia, énoncé fixe (pas de valeur tirée). Les numéros se suivent dans l'ordre du
travail ; entre parenthèses, le numéro de la proposition de Cowork. La ligne « Comment as-tu cherché » des propositions
n'est **pas** retenue. Une seule question par geste ; aucune ne nomme la cabine, la cale, le niveleur, ni ne dit quelle
palette est fausse.

| Geste (écran, case) | Qui pose | Question proposée | Type (fil / point d'étape) | Notée / réflexion | Corrigée tout de suite / au bilan | Pourquoi ici |
|---|---|---|---|---|---|---|
| **1.** Clic « C'est bon, on peut décharger » (⚙ `scene:<id>:decharger`, à publier par la scène, §7.3) | Nadia | « Tu me dis qu'on peut décharger. Avant d'entrer dans une remorque avec le chariot, qu'est-ce qui doit être vrai ? » — **Le camion ne peut plus bouger et le passage vers la remorque est sûr** · Le chauffeur nous dit que tout va bien · Le quai est propre et rangé · On a du retard, il faut aller vite | fil | **notée 1,5** (C1.2), groupe sécurité | **au bilan** | L'inspection est figée, mais un défaut oublié est réparé sans un mot : la question ne nomme ni cabine, ni cale, ni niveleur. Remplace la n° 1 de Cowork (« chauffeur au volant, moteur allumé » nommait le défaut). Sa phrase de bilan est celle du §6 / §11 |
| **2.** Premier déchargement au chariot frontal (`quai:<id>:decharger`) *(n° 5 de Cowork)* | Nadia | « Tu conduis le chariot frontal. Qu'est-ce qui te donne le droit de le conduire ici ? » — **Une formation (comme le CACES) et l'autorisation de conduite donnée par France Boissons** · Le permis B · Rien : tout salarié peut le conduire · L'accord du chauffeur | fil | **notée 1** (C1.2), groupe sécurité | tout de suite | **Éco-droit appliqué** : Code du travail R4323-56, sur le geste que fait l'élève. Ne touche aucun jalon. Le texte utile (2 lignes) est cité dans l'énoncé (la vue quai n'a pas de volet « à gauche » pour une question au fil) ; **à relire sur Légifrance avant livraison**. Sortie de la banque d'ouverture (`autorisation-conduite`) pour ne pas la poser deux fois |
| **3.** Première palette validée (`quai:<id>:valider`, sans dire laquelle) *(n° 4 de Cowork, corrigée)* | Nadia | « Tu viens de valider une palette. Pour l'accepter, tu compares ce que tu as compté à… » — **Ce qu'annonce le BL** · Une palette pleine, 8 fûts · Ce que dit le chauffeur · La palette d'à côté | fil | **réflexion** | **au bilan** | Le retour soufflerait le piège de P4 (7 sur le BL) avant qu'elle soit comptée ; la question reste générale. Remplace « qu'as-tu regardé ? » de Cowork, dont le retour (« tout le tour ») soufflait P3 |
| **4.** BL signé (`quai:<id>:cloturer`) : point d'étape, il garde fermé « Répondre » à Nadia *(n° 2 de Cowork)* | Nadia | « Tu as signé le BL. Si on découvre demain, sous un film, un dommage que personne n'avait vu, combien de temps a-t-on pour protester auprès du transporteur ? » — **3 jours, jours fériés non compris, par lettre recommandée, en expliquant pourquoi** · 1 mois, par un simple mail · Le jour même seulement · Plus du tout | point d'étape | **notée 1,5** (C1.4.2), groupe réserves et BL | tout de suite | **Éco-droit appliqué** : Code de commerce L133-3 al. 1 (texte repris d'ENT-4.1 et 4.3, relu sur Légifrance le 03/10/2026, version en vigueur depuis le 10/12/2009), cité dans l'énoncé. Ne dit pas quelles réserves étaient justes (jalons 5, 6, 9). Sortie de la banque d'ouverture (`protestation`) |
| **5.** Phrase « fût qui fuit » du message à Nadia (`messagerie:phrase:fut-fuit`, premier choix) *(n° 3 de Cowork)* | Nadia (pas Thomas, qui n'est pas encore là) | « Pourquoi ne met-on pas un fût abîmé en stock avec les autres ? » — Il est abîmé : on le met à part, le temps de régler avec la brasserie et le transporteur · Il prendrait trop de place · Il peut encore être livré à un client · Il faut le rendre au chauffeur tout de suite | fil | **réflexion** | **au bilan** | Le retour donnerait la phrase juste (jalon 10) avant l'envoi |

**Retours de Nadia** (la conséquence, pas la leçon) :
1. Au bilan, **une ligne** (elle ne répète pas la phrase de bilan du §6) : « Camion immobile, passage sûr : on vérifie les deux avant d'entrer, jamais pendant. »
2. « Le CACES prouve la formation ; l'autorisation, c'est l'employeur qui la donne. »
3. Au bilan : « Ce qu'on accepte, c'est ce que le BL annonce, pas ce qu'on suppose d'avance. »
4. « Sans protestation dans les 3 jours, le transporteur n'a plus à répondre ; une réserve écrite sur le BL règle tout de suite. »
5. Au bilan : « Un fût abîmé n'est pas du stock : on le met à part le temps de régler. »

**Questions notées : 4 points** (1 : 1,5 · 2 : 1 · 4 : 1,5) ; les questions 3 et 5 sont pour réfléchir (aucun point).
Les poids sont au §5. Une question au fil corrigée « au bilan » ne dit rien tant que l'élève n'a pas fini ; les énoncés
de 2 et de 4 citent le texte de loi dans l'énoncé ; **L133-3** est déjà relu, **R4323-56 est à relire sur Légifrance
avant livraison** (comme pour toute la série).

### 4 ter. Avant de commencer — tranché par Tristan le 10/10/2026

Banque de l'écran d'ouverture (`docs/briefs/MOTEUR-avant-de-commencer.md`, `MODELE.md` §4 ter). Tutrice : Nadia. Banque de
Cowork (`france-boissons/BANQUE-avant-de-commencer.md` §ENT-6.4) **gardée**, moins `protestation` et `autorisation-conduite`
(posées au fil et notées : questions 4 et 2 ci-dessus), avec le retour de `protocole` réécrit, plus deux questions de droit
nouvelles (`transporteur-garant`, `reserve-motivee`). **Pas** d'ajout en préparation (`huit-futs`, `zone-litiges`,
`bl-signature` écartées : elles frôlent les pièges de P4, du jalon 10 et du BL signé).
**Tirage** `{ preparation: 2, droit: 2, image: 1 }` = 5 questions par élève, `calculette: true`, **non notées** (l'élève ne
le sait pas) ; chaque rubrique a au moins le double de ce qu'on tire (4 · 4 · 2). ★ = `cle: true`.
**Documents à gauche** : le BL MON-27-0617, l'annuaire, « Photos et dessins », « Le droit ». Pas le dessin de la scène du
quai (c'est l'exercice), pas d'onglet « Mots du quai » (plus aucune question ne le demande).

| id | Rubrique | Question | Juste | Pièges | À gauche (document ou image) | ★ éval |
|---|---|---|---|---|---|---|
| `bl-cest-quoi` | préparation | Le BL que te donne le chauffeur, c'est… | Le bon de livraison : la liste de ce que le camion doit livrer | La facture à payer au chauffeur · Le bon de commande de Malo | BL | ★ |
| `reserve-cest-quoi` | préparation | Écrire une **réserve** sur le BL, c'est… | Écrire précisément ce qui ne va pas, avant de signer | Refuser tout le camion · Signer sans rien dire et prévenir plus tard | BL | ★ |
| `reassort` | préparation | Ce camion apporte du réassort d'Affligem. Pourquoi l'attendait-on ? | Mardi, il n'en restait que 2 fûts pour la commande de Malo | Malo a annulé sa commande · C'est pour un inventaire | BL | |
| `qui-organise-quai` | préparation | Qui organise le quai et les réceptions des brasseries ? | Nadia, cheffe d'équipe quai et préparation | Karim · Thomas · Inès | annuaire | |
| `transporteur-garant` | droit | Une palette de **casiers d'eau** tombe du camion pendant le trajet et des bouteilles se cassent. D'après l'article L133-1, qui est garant des dommages pendant le transport ? | Le transporteur (le « voiturier »), sauf force majeure ou vice propre de la marchandise | France Boissons, qui a signé le BL · La brasserie, qui a chargé le camion | Le droit : C. com. L133-1 *(à relire sur Légifrance avant livraison)* | ★ |
| `reserve-motivee` | droit | Le chauffeur te dit : « Écris plutôt “sous réserve de déballage”, c'est plus rapide. » D'après l'article L133-3, est-ce que cela suffit pour garder un recours ? | Non : la loi demande une protestation **motivée**, qui dit ce qui ne va pas | Oui, toute réserve suffit · Oui, si le chauffeur est d'accord | Le droit : C. com. L133-3 | ★ |
| `protocole` | droit | Un transporteur vient décharger à Buchelay. Quel document **écrit** encadre la sécurité de ce déchargement ? | Le protocole de sécurité | Le bon de livraison · Le permis du chauffeur | Le droit : C. trav. R4515-4 | ★ |
| `droit-retrait` | droit | Une lisse de rack est pliée et une palette penche au-dessus de l'allée. Que peux-tu faire ? | Alerter tout de suite mon responsable et me retirer de ce danger | Continuer : ce n'est pas mon rôle · Redresser la lisse moi-même | Le droit : C. trav. L4131-1 | ★ |
| `fut-cest-quoi` | image | Sur cette photo, que sont ces objets en métal ? | Des fûts : ils contiennent la bière pression et reviennent vides | Des bouteilles de gaz · Des poubelles | `futs-vrac.jpg` (déjà dans `contenus/images/france-boissons/`, crédit en place : « Photo : Belinda Fewings, Unsplash ») | |
| `chariot-frontal` | image | Sur ce dessin, le **chariot frontal** sert à… | Soulever et déplacer les palettes, et les poser l'une sur l'autre (« gerber ») | Livrer les fûts chez les clients · Laver les fûts | `materiel-chariot-frontal.svg` (dessin de Cowork, **sans défaut** ; à copier dans `contenus/images/france-boissons/` avec sa ligne de crédit « Dessin — document pédagogique ») | |

**Retours de Nadia** (affichés après la réponse ; la conséquence, pas la leçon) :
- `bl-cest-quoi` : « On compare ce qui arrive au BL, avant de signer. »
- `reserve-cest-quoi` : « Une réserve précise (quoi, combien) protège la plateforme. »
- `reassort` : « Le fil de la semaine : ce que tu reçois aujourd'hui, d'autres le livreront. »
- `qui-organise-quai` : reprise d'ENT-6.1.
- `transporteur-garant` : « Le transporteur répond de la marchandise du départ à l'arrivée ; c'est à lui qu'on s'adresse en cas de casse. »
- `reserve-motivee` : « Une réserve sans motif ne protège de rien : on écrit ce qui ne va pas, et combien. »
- `protocole` (réécrit) : « Le protocole dit qui fait quoi quand un camion est déchargé : il est écrit à l'avance. »
- `droit-retrait` : « Alerter, c'est un devoir ; se retirer d'un danger grave et imminent, c'est un droit. »
- `fut-cest-quoi` : « Un fût plein de 30 L pèse environ 40 kg : on ne le porte pas, on le déplace au chariot. »
- `chariot-frontal` : « Fourches baissées pour rouler, jamais personne sous une charge levée. »

**À ne jamais utiliser** pour l'image : `materiel-palette-retention.svg` (il montre un fût qui fuit, donc le défaut de P3) et
`chariot-boissons.jpg` (c'est un chariot à mât rétractable, pas un frontal). **Textes de loi** : L133-3 (relu sur Légifrance
le 03/10/2026) ; R4515-4 et L4131-1 (relus par Cowork le 10/10 sur code.travail.gouv.fr) ; **L133-1 à relire sur Légifrance
avant livraison**. Le moteur affiche « Texte de loi (réel) — source : Légifrance » en pied. Valeurs tirées : aucune. Écartées : tout ce qui décrit une scène de quai sûre ou dit où est un défaut,
« faut-il faire le tour de la palette ? » (P3), « une palette incomplète est-elle fausse ? » (P4), « où va un fût qui
fuit ? » (jalon 10).

## 5. Jalons / notation (10 jalons, poids sur 20 : jalons 16 + questions 4, tranchés par Tristan le 10/10/2026)

| # | Jalon | Poids | Groupe | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|---|
| 1 | Chauffeur / moteur signalé **avant** de décharger | **2** | sécurité | inspection sur le quai iso (§7.3) : `securite.signaux` | faux si l'élève décharge d'abord ; la silhouette et la fumée comptent pour le même point ; signalé dans n'importe quel envoi avant « on peut décharger » |
| 2 | Niveleur signalé **avant** de décharger | **2** | sécurité | idem | idem ; une marque enlevée avant l'envoi ne compte pas |
| 3 | Aucun faux signalement (cale, butoirs, lampe, **clic à côté**) | **1,5** | sécurité | idem | **ne récompense pas l'inaction** : faux si aucun signalement n'a été envoyé ; une marque fausse enlevée **avant** l'envoi ne compte pas, une marque fausse envoyée compte même si elle est enlevée ensuite |
| 4 | P1 comptée 8 et acceptée | **1** | contrôle des palettes | vue quai | — |
| 5 | P2 : réserve « produit différent », référence lue = Pelforth | **2,5** | réserves et BL | vue quai + fiche | P2 acceptée sans réserve = faux ; « Affligem » recopié du BL = faux |
| 6 | P3 : réserve « fût endommagé », 1 fût | **2,5** | réserves et BL | vue quai | sans faire le tour, la fuite ne se voit pas |
| 7 | P4 comptée 7 et acceptée | **1,5** | contrôle des palettes | vue quai | 8 (palette supposée pleine) = faux ; réserve « manquant » = faux |
| 8 | BL signé | **1** | réserves et BL | vue quai | — |
| 9 | Phrase « réserves » juste | **1** | message | `phrasesJustes` | message non envoyé = faux |
| 10 | Phrase « zone litiges » juste | **1** | message | `phrasesJustes` | idem |
| | **Total des jalons** | **16** | | | |
| | Questions notées (§4 bis) : n° 1 (1,5, sécurité) · n° 2 (1, sécurité) · n° 4 (1,5, réserves et BL) ; les n° 3 et 5 sont pour réfléchir | **4** | une ligne au bilan chacune | | |
| | **Total** | **20** | | | |

**Sous-totaux par groupe** (jalons + questions) : sécurité 8 (5,5 + 2,5) · contrôle des palettes 2,5 · réserves et BL
7,5 (6 + 1,5) · message 2 = **20**. **Par compétence** : **C1.2 = 8** (jalons 1 à 3 + questions 1 et 2) ; **C1.4 = 12**
(jalons 4 à 10 = 10,5, plus la question 4 = 1,5). Vérification : jalons 2 + 2 + 1,5 + 1 + 2,5 + 2,5 + 1,5 + 1 + 1 + 1 =
**16** ; 16 + 1,5 + 1 + 1,5 = **20**. La forme (salutation et fin du message, non notées) pèse 0 %. Le code : `bareme: 20`,
un `poids` et un `groupe` par jalon, `part` = 4 dans le fichier de questions ; chaque question notée porte son `groupe`
(une ligne au bilan) ; les valeurs de test sont écrites à la main (parcours juste 20/20, inaction 0/20).

Comme ENT-5.4 : une palette = comptage **et** décision justes (un seul jalon). Valeurs attendues **calculées** depuis les
palettes (`couches − absents`, `bl − réel`, nombre de fûts abîmés, référence de l'étiquette) ; dans les tests, écrites à la main.
Salutation et fin non notées. Le dernier envoi du message compte.

## 6. Contenu

`contenus/france-boissons-ent64.js` (quai iso, inspection, palettes, messages, phrases, étapes), univers dans
`contenus/france-boissons.js` (Nadia y est déjà). **Aucune image, aucune coordonnée en pixels** : la séance déclare les
points à inspecter par objet du kit et par état (§7.3) ; le moteur dessine et sait où l'on clique. Forme indicative :

```js
quai: {
  rendu: 'iso', lieu: { nom: 'Quai 12', ... },
  securite: {
    mode: 'scene',                       // nouveau : l'inspection se joue sur le quai iso (sinon : la liste OK / Pas OK)
    arret: false,                        // entraînement : rien n'arrête l'élève (guidage, plus tard : true)
    consigne: 'Clique sur ce qui ne va pas, puis signale-le à Nadia.',
    points: [
      { id: 'cabine',   objet: 'cabine',   etat: 'conduite', vue: 'dehors', ok: false, lib: 'Chauffeur au volant, moteur allumé',
        repare: 'Bien vu : je fais couper le moteur, le chauffeur me donne les clés et descend.' },
      { id: 'niveleur', objet: 'niveleur', etat: 'releve',   vue: 'dedans', ok: false, lib: 'Niveleur relevé',
        repare: 'Bien vu : je pose le niveleur.' },
      { id: 'cale',     objet: 'cale',     etat: 'posee',    vue: 'dehors', ok: true,  lib: 'Cale de roue' },
      { id: 'butoirs',  objet: 'butoirs',  etat: 'enPlace',  vue: 'dehors', ok: true,  lib: 'Butoirs de quai' },
      { id: 'lampe',    objet: 'lampe',    etat: 'allumee',  vue: 'dedans', ok: true,  lib: 'Lampe de quai' },
    ],
    signaler: { qui: 'Nadia', rien: 'Là, je ne vois rien qui cloche.', fin: 'Tu me dis quand on peut décharger.' },
    bilan: 'La scène n’était pas sûre : avant d’entrer dans un camion, il doit être immobilisé et le passage vers la remorque doit être sûr.',
  },
}
```

Les `lib` ne s'affichent **jamais pendant l'inspection** (ni au survol, ni en titre) : ils servent au bilan de l'enseignant
et au corrigé.

## 7. Demandes au moteur

1. **Motifs du quai déclarables par la séance** : ajouter « fût endommagé » (une réserve chiffrée : « Nombre de fûts
   endommagés », la fiche de contrôle prend la même ligne) ; la séance déclare la liste des motifs proposés (ENT-6.4 : conforme,
   fût endommagé, manquant, produit différent). Sans changer Picard ni Smoby. *(Le compte rendu d'ENT-5.4 demandait déjà des
   libellés déclarables à l'étape ① : à grouper.)*
2. **Palette de fûts dans la vue quai** : dessiner des **cylindres** (fûts) au lieu de cartons quand le contenu le déclare
   (`forme: 'fut'`), **8 fûts à plat en quinconce (rangées de 3, 2 et 3) posés sur une palette de rétention noire de 1,30 × 1,30 m** (plastique, caillebotis, pas de bois) ; la coulure du fût abîmé visible **seulement depuis l'arrière** (comme le carton écrasé de Smoby) ; l'unité
   devient « fûts » partout (comptage, réserves, BL). Si c'est trop cher : cartons gardés, unité « fûts » seule, et le dire.
3. **Inspection de sécurité sur le quai iso** *(réécrit le 10/10/2026 ; remplace l'« image à inspecter », abandonnée le
   07/10, Q3 de `FRANCE-BOISSONS-refonte.md`)*. L'élève inspecte **le quai où il va décharger** : même façade, même camion,
   même dessin (kit `core/iso.js`). Une vue pensée pour servir aussi à ENT-5.4 et ENT-1.1 quand elles passeront sur le
   quai iso (pas dans ce chantier : elles ne changent pas).

   **3a. Ce que le moteur sait déjà faire (lu dans le code le 10/10, à confirmer à l'état des lieux).** L'étape ⓪
   « Avant de décharger » existe (`securite: { points: [{ id, lib, ok }], signaler, arret, commencer, photo }`, lot 5 du
   04/10) mais en **liste OK / Pas OK**, placée **avant** l'arrivée du camion ; le commentaire de `quai.js` prévoit déjà que
   « la même étape pourra se jouer sur une image à inspecter ». Le rendu iso (`rendu: 'iso'`) dessine la façade (avec les
   **butoirs**), le camion porteur qui recule, le chauffeur debout et sa bulle, la porte sectionnelle, le niveleur **posé**
   et l'intérieur de la remorque par l'ouverture. Le kit n'a **ni cale de roue, ni lampe de quai, ni personne dans la
   cabine, ni fumée, ni niveleur relevé**.

   **3b. Ce qu'il faut ajouter.**
   - **Un mode `securite.mode: 'scene'`**, accepté seulement avec `rendu: 'iso'` (sinon refus au chargement, message
     clair). Sans `mode`, l'étape ⓪ en liste reste **exactement** comme aujourd'hui (Smoby ENT-5.4 ne bouge pas).
   - **Place dans le déroulé** : en mode scène, l'inspection vient **après** l'animation d'arrivée et **avant** le BL. Le
     stepper : ① Le camion arrive · ② Déchargement · ③ … (pas d'étape ⓪ séparée : l'inspection fait partie de ①). Les
     étapes ② à ④ restent fermées tant que l'inspection n'est pas figée.
   - **Deux vues** : `dehors` (la scène d'arrivée figée, projection de `sceneArrivee`) et `dedans` (la scène ② avant
     déchargement : porte levée, remorque par l'ouverture, aucune palette sortie). Bouton « Ouvrir la porte de quai » (une
     fois ; la porte se lève en 1,8 s comme aujourd'hui), puis bascule libre « Voir dedans » / « ← Revoir dehors ». Ouvrir
     la porte ne fige rien et ne compte pas comme décharger.
   - **Objets et états, dans le kit** (règle du « kit qui grandit » : rien n'est dessiné dans `contenus/`) :

     | `objet` | Vue | États | Dessin attendu |
     |---|---|---|---|
     | `cabine` | dehors | `conduite` · `vide` | `conduite` : silhouette **sans visage** derrière le pare-brise, petites bouffées grises au pot d'échappement (animées, coupées si l'élève a demandé moins d'animations) ; `vide` : cabine vide, pas de fumée, chauffeur debout dehors (comme aujourd'hui) |
     | `cale` | dehors | `posee` · `absente` | cale de roue **rouge à bras** devant une roue arrière, côté élève (d'après la vidéo de Buchelay vue en 6.1) |
     | `butoirs` | dehors | `enPlace` · `absents` | les butoirs noirs de `facadeQuai` ; **vérifier qu'ils restent visibles** le camion à quai (sinon les décaler ou agrandir, sans déplacer le camion) |
     | `niveleur` | dedans | `pose` · `releve` | `pose` : celui d'aujourd'hui ; `releve` : la plaque dressée contre le quai, **le vide** entre le seuil et le plancher de la remorque visible par l'ouverture |
     | `lampe` | dedans | `allumee` · `eteinte` | lampe de quai à bras articulé fixée au mur à côté de l'ouverture, `allumee` : un cône de lumière pâle dans la remorque |

     Les états non déclarés par la séance prennent la valeur sûre (`vide`, `posee`, `enPlace`, `pose`, `allumee`) : un
     quai iso sans `securite` (Spartoo) se dessine **comme aujourd'hui**, cale et lampe en plus seulement si une
     séance les déclare (à trancher à l'état des lieux : les ajouter partout ou seulement sur demande ; défaut : sur
     demande, pour ne rien changer à ENT-1.1).
   - **Où l'on clique** : le moteur calcule, pour chaque point déclaré, sa **zone de clic** depuis l'objet dessiné
     (boîte englobante projetée + marge d'au moins 12 px) ; `cabine` = cabine **et** fumée. Le contenu ne donne jamais de
     coordonnées. Les zones sont **invisibles** : pas de changement de curseur, pas de surbrillance, pas de `title`, pas de
     `tabindex` sur les objets (sinon le survol ou la touche Tab donnent la réponse). Le curseur est une croix sur toute
     la scène.
   - **Marques** : un clic n'importe où dans la scène pose une marque numérotée (1, 2, 3… dans l'ordre des clics, toutes vues
     confondues) ; un clic sur une marque l'enlève (les suivantes ne sont pas renumérotées). La marque retient sa vue, sa
     position (coordonnées du `viewBox`) et le point touché (le premier dont la zone la contient, ou `null` = à côté). Teinte
     de la marque : **ni vert ni rouge** (encre, contour épais, numéro dans un rond) : ce n'est pas un verdict.
   - **Signaler** : « Signaler à Nadia » envoie les marques en place. Sans marque : « Qu'est-ce qui ne va pas ? Clique
     d'abord sur ce que tu veux me signaler. » (rien n'est rangé). Sinon un signal est rangé
     (`{ points: [ids touchés], rien: n marques à côté, apresArret }`), Nadia répond point par point (`repare` de chaque
     défaut touché, puis `rien` une seule fois s'il y a au moins une marque fausse ou à côté, puis `fin`), et **chaque défaut
     touché est réparé dans la scène** (son état passe à l'état sûr). Les marques envoyées restent affichées, grisées.
   - **« C'est bon, on peut décharger »** fige l'inspection (`securite.fait`). Si `arret: true` (guidage, plus tard) et
     qu'un défaut n'a pas été signalé : Nadia arrête l'élève sans dire lequel (comme le lot 5). Si `arret: false`
     (ENT-6.4) ou en évaluation : rien ne l'arrête ; **les défauts restants passent à l'état sûr sans aucun texte**. Puis
     le chauffeur (descendu) parle et remet le BL ; la suite du quai iso est inchangée.
   - **Ce que lisent les jalons** (calculé, jamais rangé tout fait) : pour chaque point `ok: false`, « signalé avant de
     décharger » = présent dans au moins un signal envoyé avant `fait` ; « aucun faux signalement » = au moins un signal
     envoyé **et** aucun signal ne contient de point `ok: true` ni de marque à côté. Les jalons de la liste
     (`securiteSignalee`, `securiteConstat`) ne sont pas produits en mode scène.
   - **Gestes publiés** *(demande ajoutée le 10/10/2026, questions au fil du §4 bis)* : la scène publie
     `scene:<id>:signaler` (à chaque envoi de « Signaler à Nadia ») et `scene:<id>:decharger` (au clic « C'est bon, on
     peut décharger »), et ils entrent dans la liste `signaux` de la vue ; la question n° 1 du §4 bis se pose sur
     `scene:<id>:decharger` (après le figeage de l'inspection, elle ne change aucun jalon). Le geste ne dit rien des
     marques ni des points touchés.
   - **Ce qui ne se rouvre jamais** : « Corriger » après le bilan ne rouvre pas l'inspection (le camion est reparti) ;
     `recommencer` remet l'inspection à zéro comme le reste du quai.
   - **Cloisonnement** : l'état de l'inspection vit dans l'état du quai de la séance (`db.quais[id].securite`), rien de
     partagé.
   - **Page d'essai d'abord** (règle Q2 du 07/10 : chaque vue finie et testée avant la séance) : une page où Tristan
     **clique** la scène de 6.4 (les deux vues, les marques, les réponses de Nadia, la scène qui se répare), avec un
     sélecteur des états de chaque objet pour juger chaque dessin seul. Il la valide avant que la séance soit écrite.

   **3c. Hors de ce chantier.** ENT-5.4 (photo, liste OK / Pas OK) et ENT-1.1 ne changent pas ; leur passage à
   l'inspection sur le quai iso fera l'objet de leur propre brief. Le clavier : l'inspection se fait à la souris ou au
   doigt (une navigation au clavier sur les objets donnerait la réponse) ; à signaler dans le compte rendu, à reprendre
   si un élève en a besoin (aménagement).

Ce que la séance réutilise tel quel : vue quai sans froid (lot 4 de MOTEUR-2de-S1), fiche de contrôle, zone de calcul, phrases à
choisir, mots cliquables.

## 8. Tests attendus

Bloc `france-boissons` : parcours juste 10/10 ; inaction 0/10 ; décharger sans signaler → jalons 1 et 2 faux **et** la scène
de l'étape suivante montre moteur coupé et niveleur posé, sans texte ; cale signalée → jalon 3 faux ; **clic sur le mur signalé
→ jalon 3 faux** ; marque fausse posée puis enlevée **avant** l'envoi → jalon 3 juste ; aucun signalement → jalon 3 faux aussi ;
silhouette seule ou fumée seule → jalon 1 juste ; cabine puis niveleur en **deux envois** → jalons 1 et 2 justes ; niveleur
cliquable seulement dans la vue dedans ; signalement juste → la scène se répare (fumée absente, chauffeur dehors) ;
**rien ne trahit les zones** : aucun objet n'a de `title`, de `tabindex` ni de curseur propre ; chaque point se touche en
cliquant au centre de sa zone à la souris (`boundingBox()`), deux vues ; Smoby ENT-5.4 (liste) inchangé ; P2 acceptée → jalon 5 faux ;
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

Sur la page d'essai, puis dans la séance : la scène se lit sans aide (on voit le chauffeur au volant et la fumée dehors, le
niveleur relevé dedans) ; on reconnaît le quai iso de Spartoo, avec des fûts ; la cale, les butoirs et la lampe se voient
aussi (sinon le piège ne vaut rien) ; le survol ne trahit rien ; un élève de 2de finit en 45 min ; rien ne dit où était le
défaut pendant l'inspection.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [x] BL faux = erreur de référence (Tristan, 05/10).
- [x] Sécurité = image à inspecter, dessin v2 validé (Tristan, 05/10).
- [x] Palettes : 3 pièges + 1 conforme (Tristan, 05/10).
- [x] Fût qui fuit : réserve + zone litiges (Tristan, 05/10).
- [x] P2 : réserve « produit différent », palette gardée (Tristan, 05/10).
- [x] Date : **mercredi 16 juin 2027, 14 h** (calendrier « lundi → vendredi », Tristan, 05/10).
- [x] ~~Image à inspecter : vue n° 6 ou mode des modes visite~~ → **inspection sur le quai iso** (Tristan, 07/10, Q3) ;
  dessin `scene-quai-securite.svg` abandonné.
- [x] Deux vues, dehors puis dedans porte ouverte (Tristan, 10/10).
- [x] Clic à côté de tout objet = faux signalement (Tristan, 10/10).
- [x] Défaut oublié en entraînement : remis en ordre sans un mot au déchargement (Tristan, 10/10).
- [x] Phrase du bilan : « La scène n'était pas sûre : avant d'entrer dans un camion, il doit être immobilisé et le passage
  vers la remorque doit être sûr. » (remplace « regarde la cabine et l'arrière du camion », qui nommait presque les zones).
  Acceptée telle quelle ; elle sert au bilan quand un défaut manque ; le retour de la question n° 1 du §4 bis, au bilan
  aussi, est plus court et ne la répète pas (Tristan, 10/10/2026, après-midi).
- [x] Au bilan de l'élève, les lignes des jalons 1 et 2 nomment-elles le défaut (« Chauffeur au volant, moteur allumé ») ?
  **Oui**, l'inspection est figée et ne se refait pas ; ce qui ne se dit jamais, c'est l'endroit pendant l'inspection
  (Tristan, 10/10/2026, après-midi).
- [x] Cale et lampe : dessinées sur tous les quais iso, ou seulement quand une séance les déclare ? **Seulement quand une
  séance les déclare**, ENT-1.1 ne change pas (Tristan, 10/10/2026, après-midi).
- [x] « Zéro accident » dans le message de Nadia et la cale rappelée dans sa réponse, d'après la vidéo de Buchelay (Tristan, 07/10). La scène dessinée ne change pas.
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
