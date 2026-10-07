# France Boissons ENT-6.1 → 6.10 : ce qui change avec les nouvelles vues et les règles du 07/10

**Statut** : **tableau validé par Tristan (07/10/2026, 23 h 35)** : Q1 à Q9 tranchées (voir §3). Prochaine étape : réécriture
des 10 briefs, puis chantiers moteur dans l'ordre de Q2.
**Date** : 07/10/2026, soir. **Auteur** : Claude (conversation Cowork), d'après une lecture des briefs FB, de
`activites/FICHE-SEANCE.md`, de `docs/decisions.md` et des briefs Smoby du 07/10.
Rien n'a été essayé à l'écran et aucune séance FB n'est construite : tout ce qui suit vient de la lecture des fichiers.

---

## 0. Règles communes aux 10 séances (à écrire en tête de chaque brief)

1. **La trame (décision de Tristan, 07/10 à 21 h, valable à partir de FB)**
   - Elle sert seulement de **brouillon pour les étapes compliquées** (calculs, comptages, planning) et de **cours pour
     réviser** (lexique, règles, le réel face à l'exercice).
   - **Pas de corrigé de trame. Pas de textes à trous.** Les questions qui vivaient dans la trame passent **à l'écran, au
     moment du geste** (« questions au fil »).
   - Sur papier, il reste une page de connexion (Prepalog → Simulog → logo France Boissons → ENT-6.x), une page de brouillon
     et une page de cours.
2. **Notation nouvelle** (comme Smoby)
   - `parcours` de 6.1 à 6.10 ;
   - `correction: true` ;
   - une case = un jalon ;
   - poids par bloc, `bareme: 20` ;
   - un bandeau ✓/✗ par bloc, sans jamais donner la réponse ;
   - « Corriger » rouvre les fiches, les messages et les plannings, jamais un geste irréversible (BL signé, comptage
     vocal, tournée partie). Quand il y a un geste irréversible, le bandeau le dit.
3. **Règle absolue** : jamais un élève bloqué en fin de séance. La suivante s'ouvre au premier bilan, justes ou faux.
   Chaque brief prévoit le **test du pire cas** (tout faux, puis la séance suivante s'ouvre sans l'enseignant).
   - Aucune garde du type « jugé seulement si les lignes 1 à 5 sont justes » quand ces lignes ne se refont pas.
   - **Anti-inaction** dans chaque séance : rien fait = 0, et un planning renvoyé sans changement = faux.
4. **Un jalon reste « à faire » jusqu'à l'envoi.** Aujourd'hui, plusieurs briefs disent « fiche non envoyée = faux » :
   c'est à corriger partout.
5. **Repris tel quel, à citer partout** :
   - confirmation dans la page avant tout envoi définitif ;
   - `fermetures` (un écran grisé tant qu'une condition n'est pas remplie) ;
   - accusé de réception d'un collègue à chaque envoi corrigé, jamais « juste » ni « faux » ;
   - titres des jalons au Repérage.
6. **Petites erreurs à corriger dans tous les briefs** :
   - « barème 8 / 10 / 16 » devient 20 ;
   - « le dernier envoi compte » devient la règle du premier bilan ;
   - codes de compétence : logistique sans préfixe, `OTM-`, `AGO-` (« LOG-C2.5 » en 6.10 n'existe pas) ;
   - les « D2, D4… » vont dans `domaines` ;
   - `desc` à l'infinitif ;
   - un collègue est au tu, une personne extérieure au vous.

---

## 1. Séance par séance

Légende du volume de réécriture du brief : ● faible · ●● moyen · ●●● fort.

| Séance | Questions qui passent à l'écran (geste qui les déclenche) | Quai iso | Notation sur 20 (blocs) · « Corriger » | Vues : livré / reste à faire | Idées en plus (propositions) | Incohérences relevées | Brief |
|---|---|---|---|---|---|---|---|
| **6.1** Organigramme | 4 questions de la vidéo, à l'ouverture, non notées, avec « Passer » · « À qui t'adresser… ? » après le bloc correspondant | — | Organigramme 6 · le chef de Lucas 3 · hiérarchique / fonctionnel 5 · à qui s'adresser 6 (11 cases) · rouvre la fiche, Inès accuse réception | Livré : fiche, mots cliquables, documents · Reste : le bouton « Passer » (en attendant, repli du §7) | Des messages arrivent en cours de séance, l'élève choisit à qui les transférer · L'annuaire rempli ici devient un document joint de toute la S2 | `temps: découverte` n'est pas une valeur du moteur (à trancher, voir Q5) · fichier `ent60` au lieu de `ent61` · « Karim valide le congé de Lucas », alors que 6.3 le refuse · Lucas doit poser ses congés « avant le 15 juin », mais les a demandés le 5 mai | ●● |
| **6.2** Commande de Malo | « Qui va travailler à partir de ton bon ? » après l'envoi du bon · « 9 vides : et si le chiffre est faux ? » après la réponse à Malo · **aucune question avant l'envoi** (elle dévoilerait le piège) | — | Demande 2 · rupture et remplacement 6 · jour 2,5 · vides 2 · réponse (informations) 5 · réponse (ton) 2,5 (14 cases) · rouvre le bon et la réponse | **Case `nombre` livrée** (§7 réglé) · `cadre` suffit, pas besoin de `lignes` | Malo relance : « livre-moi avant 10 h » (prépare la tournée de 6.9) | **La réponse de Malo donne la solution** (« Ok pour la Pelforth ») : avec « Corriger », l'élève la lit avant de corriger, il faut une réponse neutre · le jalon 5 mélange les vides et l'eau | ●● |
| **6.3** Congés et annonce | 2 questions de réflexion, après le 1er envoi et après l'annonce, non notées · le cours sur la discrimination reste dans la trame | — | Planning avant l'imprévu 5 · planning après l'imprévu 6 · annonce 5,5 · message à Lucas 3,5 (27 cases, bandeau de 8 lignes) · rouvre le planning (livré), l'annonce et le message | Planning corrigeable livré · À vérifier : colonnes en semaines, ligne de Kevin retirée par l'aléa, déclencheur après la 2e version | Lucas répond, déçu, et l'élève choisit sa réponse (non noté) | **Message à Lucas au vous** alors que c'est un collègue · la phrase « proposition » est la seule datée, donc elle donne la réponse · garde « planning identique = faux » à ajouter · « Vérifier » illimité (voir Q6) | ●●● |
| **6.4** Réception de la brasserie | « Pourquoi jamais moteur allumé ou niveleur relevé ? » au clic « Commencer à décharger » · réserve P2 et fût en zone litiges : **après** le message à Nadia | **Oui.** La palette qui tourne rend la coulure visible seulement de l'arrière (même mécanique que le carton enfoncé de Spartoo) ; le niveleur, la porte et la personne existent déjà · Il manque : 8 fûts sur rétention (le kit en porte 4), 4 palettes au lieu d'une, l'étape sécurité jamais essayée avec le rendu iso, une réserve qui nomme la référence | Sécurité 5 · contrôle des palettes 8 (comptage et décision séparés) · réserves sur le BL 3 · message à Nadia 4 (17 cases ; la signature n'est pas notée) · rouvre le message seul, et le bandeau dit « le camion est reparti » | Livrés : quai iso, étape sécurité, fiche par référence, `fermetures` · Restent : motifs déclarables, fûts dans le quai iso, image à inspecter (ou zones posées sur la scène iso : voir Q3) | Un geste « sortir le fût en zone litiges » · L'allée piétonne et les barrières de la vidéo de Buchelay, comme pièges conformes · Le chauffeur parle, au vous | Le bilan « regarde la cabine et l'arrière » nomme presque les zones · la réserve P2 demande plus que ce que le quai sait écrire | ●●● |
| **6.5** Rangement en masse | « Quel lot sort en premier ? » **après** « Valider mon rangement » · les écrans « matériel du poste » deviennent des parties d'animation sans question | Kit iso de l'animation repris · le mode stockage de masse = **première vue iso du Plan d'entrepôt** | Animation FIFO 4 · rangement 8 (P1 à P4) · entrée en stock 8 (19 cases ; le stock d'après est calculé sur la saisie de l'élève, sans double peine) · Corriger : la fiche se rouvre ou reste figée (Q7) | Livrés : animation, case `nombre` · Restent : **mode stockage de masse** (le plus gros), 8 fûts et piles dans le kit | Après la validation, Nadia demande « 2 Affligem : clique la palette qui sort » ; si le rangement bloque le lot, l'élève le voit · Le code à 2 chiffres sur les panneaux dès 6.5 | Le stock d'après est figé alors que le couloir est jugé sur le travail de l'élève : deux règles dans un même brief · pas de confirmation avant « Valider » | ●● |
| **6.6** Inventaire à la voix | Question des vides après M08 · le fût percé **après** la décision sur M01 · « Pourquoi compter ces couloirs ce matin ? » après la ligne 1 · toutes non notées, par le lot C (le terminal ne pose que les questions du métier) | Kit iso : couloir, panneau, rétention (4 fûts) | Comptage 11 · écarts 1 · décisions 4,5 · compte rendu 3,5 (13 cases) · rouvre la fiche seule, le comptage ne se refait pas · **⚠ tout à 0 rapporte 7/20, réciter le stock de 6.5 rapporte 8/20** (voir Q8) | Livrés : case `nombre`, écran Inventaire · Restent : sous-mode comptage, **terminal vocal**, source « comptages » pour l'écran Inventaire | Courte animation : le cariste remet la Pelforth de M02 en M04 | « × 40 € » sans signe clair · « ce matin » en 6.7 : préciser **après** l'inventaire de 7 h | ●● |
| **6.7** Préparation vocale | Dialogue en 4 temps après la ligne 2 · « pourquoi 6 fûts » au premier fût posé · FIFO après la ligne 4 · poids des 6 Heineken après la ligne 5 · toutes non notées | Personne et transpalette du quai iso à passer dans le kit · Il manque : rack à tiroir, casier, fût cabossé, palette à 6 cases | Lignes du terminal 8 · montage 7 · film et étiquettes 5 (12 cases) · rouvre les palettes (« premier essai »), jamais le terminal | Rien du §7 n'est livré · le mode préparation 2D de 5.6 est réutilisable | — | **⚠ Blocage** : les critères 6 à 10 restent « non jugés » si une ligne est fausse, et les lignes ne se refont pas · le message de fin « Parfait » n'arrive que si tout est juste · le survol en **aplat vert** est contraire à la charte | ●●● |
| **6.8** Planning du vendredi | « Qui reprend les vides si la côte part au transporteur ? » à l'arrivée de la panne (notée) · « Pourquoi pas l'électrique sur la côte ? » à la pose de la carte (notée) · la lettre de voiture après la fiche (non notée) | — | Planning du matin 7 · après la panne 8 · documents à bord 4 · questions 1 · rouvre le planning et la fiche (garde « planning identique = faux ») | Livré : planning corrigeable · Restent : `conduite` par carte, ligne qui porte son camion · le « jalon d'une seule version » n'est plus nécessaire avec les poids | Appel au loueur en phrases à choisir, au vous | **« Vendredi 18 juin, veille de la Fête de la musique »** : la fête tombe le lundi 21/06/2027 · la phrase de fin de Karim diffère entre 6.8 et 6.9 | ●● |
| **6.9** Tournée de la côte | Manutention et pause, à l'ouverture de la feuille de route (notée) · 3 questions à la réponse de Lucas (non notées) | Une ligne : le porteur du kit en décor | Tournée 6 · feuille de route 9 · SMS 4 · question 1 · **la tournée juge aujourd'hui en continu** : il faut qu'elle soit jugée à l'envoi (demande moteur), puis la tournée ne se corrige plus (« Lucas roule »), seuls la feuille et le SMS se rouvrent | Les lots 1 à 3 de la tournée en camion restent à faire · menus calculés des phrases : livrés | Message « bouchon sur l'A13 : +20 min » après l'envoi | Le chauffeur et l'heure de départ ne sont pas sûrs après 6.8 : Karim doit les fixer · le SMS est signé « Karim » · la brasserie est en zone piétonne · l'heure réelle manque dans le menu | ●● |
| **6.10** Retour des vides | « Le fût refusé, où va-t-il ? » au comptage du fût plein (notée) · « D'où venait le 9 du ticket ? » et « fût ou bouteille recyclée ? », non notées | **Oui, proposé** : la palette iso qui tourne, en document à côté de la fiche de contrôle. Les fûts se cachent, il faut tourner la palette pour compter, ce qui est plus fort que l'image fixe. Arrivée du camion en courte scène non notée | Contrôle 5 · compte de consignes 5 · messages 5 · boucle des vides 5 · rouvre les fiches, les grilles et les messages, pas l'animation | Livrés : porteur du kit, `fermetures` · Restent : grille dans une fiche + formule en cliquant (sert aussi à 6.9), loupe, fût vide, casier, bâtiments | Le tri des vides par brasserie (glisser chaque fût) | Le jalon 2 réunit deux comptes · « le ticket a recopié ta saisie de mardi » est faux pour qui s'était trompé en 6.2 · deux fûts cabossés en deux séances | ●●● |

Tous les barèmes ci-dessus sont des **propositions** des relectures. Chacun sera revu avec toi, bloc par bloc, au moment
de réécrire le brief concerné.

---

## 2. Le moteur : ce qui manque pour FB

Les briefs FB demandent beaucoup de vues nouvelles. Les estimations des relectures, en ordre de grandeur, tests compris :

| Chantier | Pour | Durée |
|---|---|---|
| **Questions au fil (lot C)** : maquette, puis moteur | toutes les séances, Smoby aussi | 1,5 à 2 jours |
| Moteur « jugé au premier essai » (déjà prévu en lot 3 de SMOBY-notation) | 6.5, 6.7 | partagé avec Smoby |
| Planning : `conduite` par carte, ligne qui porte son camion | 6.8 | ½ jour |
| Quai iso pour les fûts : 4 palettes, coulure, motifs, unité | 6.4 | 5 à 7 h |
| Image à inspecter, ou zones sur la scène iso | 6.4 (et 5.4) | 4 à 6 h |
| Kit iso : 8 fûts en quinconce, piles, casier, fût vide | 6.4 à 6.10 | 2 à 3 h |
| **Plan d'entrepôt, mode stockage de masse** (rendu iso) | 6.5, 6.6 | 12 à 16 h |
| Sous-mode comptage | 6.6 | ≈ 5 h |
| **Terminal vocal**, puis ses ajouts pour la préparation | 6.6, 6.7 | ≈ 11 h |
| Allée de picking (rendu iso), montage par cases, film et étiquettes sur plusieurs palettes | 6.7 | ≈ 18 h |
| Tournée en camion (lots 1 à 3) + tournée jugée à l'envoi | 6.9 | ≈ 3,5 jours |
| Grille dans une fiche + formule en cliquant | 6.9, 6.10 | ≈ 1 jour |
| Palette iso qui tourne, en document | 6.10 | ≈ 1 jour |

**Total : de l'ordre de 15 à 20 jours de chantiers moteur**, l'un après l'autre.

Une version plus légère avait été proposée (**non retenue**, Q1) pour 6.6 et 6.7 (≈ 15 h au lieu de 35 à 40 h) :
- le terminal vocal en texte seul d'abord, le son dans un second temps ;
- chaque couloir à compter en 6.6 devient une scène fixe de la vue animation (le kit est déjà livré) ;
- en 6.7, le plan 2D de 5.6 est gardé, avec un montage sur une grille de 3 × 2 cases.

---

## 3. Décisions à prendre (une par une)

- **Q1. Ambition du moteur — TRANCHÉE (Tristan, 07/10, 21 h 04) : on construit les vues comme les briefs les
  décrivent** (stockage de masse et comptage, terminal vocal avec réglage du son par l'enseignant, allée de picking et
  montage par cases, tournée en camion, grille dans une fiche, palette qui tourne). La version allégée n'est pas retenue.
  Style de dessin : celui du quai de Spartoo et des animations (le mot « 3D » des briefs désigne ce même rendu).
- **Q2. Ordre — TRANCHÉE (Tristan, 07/10, 21 h 05) : « on construit quelque chose de propre ».** Pas de séance
  avancée pour passer vite en classe. D'abord les chantiers moteur communs (questions au fil, puis « jugé au premier
  essai » de Smoby), puis les séances **dans l'ordre 6.1 → 6.10**, chacune précédée de ses vues, un chantier moteur à la
  fois, chaque vue finie et testée avant la séance qui s'en sert.
- **Q3. 6.4, sécurité — TRANCHÉE (Tristan, 07/10, 21 h 06) : zones à cliquer directement sur le quai iso de
  Spartoo.** L'élève inspecte le même quai que celui où il décharge (même camion, même dessin). La vue sert aussi à
  ENT-5.4 et à Spartoo ENT-1.1. Le dessin validé le 06/10 (`scene-quai-securite.svg`, `maquette-6.4-securite-quai.html`)
  est abandonné ; la vue « Image à inspecter » à part n'est pas construite.
- **Q4. Corrigés — TRANCHÉE (Tristan, 07/10, 21 h 07) : pas de corrigé de trame pour FB ; le corrigé passe à
  l'écran.** On garde le corrigé de l'onglet « Corrigés » de l'enseignant (`contenus/corriges/ENT-6.x.js` : réponse
  attendue de chaque case, pièges, ce que juge chaque ligne du bandeau) ; aucun générateur de corrigé de trame.
- **Q5. 6.1 — TRANCHÉE (Tristan, 07/10, 21 h 08) : `temps: 'guidage'`** (coefficient 1, notée sur 20, compte dans
  la compétence).
- **Q6. 6.3 — TRANCHÉE (Tristan, 07/10, 21 h 09) : plus de bouton « Vérifier mon planning ».** Un seul bouton de
  validation (« Envoyer le planning », avec la confirmation dans la page) ; le bilan ✓/✗ arrive après l'envoi ;
  « Corriger » rouvre la première version fausse (règle du premier bilan). À appliquer de même à 6.8 (planning).
- **Q7. 6.5 — TRANCHÉE (Tristan, 07/10, 21 h 10) : « Corriger » rouvre la fiche d'entrée en stock.** Le rangement
  des palettes ne se refait pas (le bandeau le dit) ; la régularisation est travaillée en 6.6.
- **Q8. 6.6 — TRANCHÉE (Tristan, 07/10, 21 h 11) : une garde.** Les blocs « écarts » et « compte rendu » ne
  rapportent des points que si au moins 2 des 4 couloirs pièges (M01, M02, M04, M08) sont comptés juste. Test : tout à 0
  et stock de 6.5 recopié ≈ 3/20 ; double peine acceptée pour un élève qui compte mal.
- **Q9. Idées en plus — TRANCHÉE (Tristan, 07/10, 23 h 35)**, séance par séance :
  - **6.1** : prises toutes les deux. Des messages arrivent en cours de séance et l'élève choisit à qui les transférer ;
    l'annuaire rempli en 6.1 devient un document joint de toute la S2.
  - **6.2** : prise. Malo relance : « livre-moi avant 10 h » (prépare 6.9).
  - **6.3** : prise. Lucas répond, déçu, et l'élève choisit sa réponse (non notée).
  - **6.4** : prises : le geste « sortir le fût en zone litiges » et le chauffeur qui parle (au vous). **Écartée** : l'allée
    piétonne et les barrières comme pièges conformes.
  - **6.5** : prise : le code à 2 chiffres sur les panneaux dès 6.5. **Écartée** : « 2 Affligem : clique la palette qui sort ».
  - **6.6** : prise. Une courte animation montre le cariste qui remet la Pelforth de M02 en M04.
  - **6.7** : aucune idée proposée.
  - **6.8** : prise. Appel au loueur en phrases à choisir, au vous.
  - **6.9** : prise. Message « bouchon sur l'A13 : +20 min » après l'envoi.
  - **6.10** : prise. Tri des vides par brasserie (l'élève glisse chaque fût).
  Les idées prises s'ajoutent aux briefs à la réécriture. Leur coût moteur (messages en cours de séance, glisser-déposer,
  animation) est à chiffrer avec la vue concernée.
- **Q10. 6.8, Fête de la musique — TRANCHÉE (Tristan, 07/10, 23 h 36)** : le 21/06/2027 est un lundi. On garde le
  vendredi 18 juin et l'on écrit **« avant le week-end de la Fête de la musique »**.
- Les autres incohérences de la colonne « Incohérences relevées » sont corrigées à la réécriture de chaque brief et
  montrées à Tristan avec le brief (la réponse de Malo devient neutre, en 6.1 Karim ne valide plus le congé que 6.3 refuse,
  le message à Lucas passe au tu, etc.).
