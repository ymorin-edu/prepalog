# Brief de séance — ENT-4.2 Picard, deux camions et un seul quai (entraînement)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-picard.md puis implémente le brief docs/briefs/ENT-4.2-picard-deux-camions.md (ENT-4.1 doit être livrée et validée). Annonce la durée, liste ce que la vue quai doit gagner (§7), puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
> ```

**Statut** : livré le 03/10/2026, **fermé aux élèves** (`pret: true, ouverture: 'prof'`) : Tristan l'essaie puis l'ouvre dans « Conduite de séance »
**Date du brief** : 03/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiche projet `claude/prepalog-picard-4-seances.md`

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-4.2 / `picard-ent42` |
| Titre | « Picard — deux camions, un seul quai » |
| Niveau | 1re |
| Compétence(s) | **C1.4** + **C1.3** (« Préparer l'action de réception » ; sous-compétence C1.3.2 « Adapter l'organisation de l'activité de réception selon les aléas et incidents ») — décision de Tristan, 03/10 |
| Temps pédagogique | entraînement |
| Notation | jalons + note sur 20 ; bilan juste/faux visible à la fin |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

Comme ENT-4.1 (même entrepôt, même quai 32, mêmes règles). **Construit** : les deux fournisseurs et transporteurs
(fictifs, noms à choisir sans ressemblance avec des entreprises réelles), produits, températures, **vitesse de
réchauffement du camion A** (groupe froid défaillant).

## 3. Objectif pédagogique

Réinvestir les gestes d'ENT-4.1 **sans aides**, et **organiser la réception selon un aléa** : lire deux tickets, décider
quel camion décharger en premier, et le justifier. Nouveaux pièges : un ticket parfait ne dispense pas de sonder ; une
palette porte deux références ; une étiquette déchirée oblige à lire une autre face.

## 4. Déroulé

1. **Mail d'accueil** du chef de quai (deux camions annoncés, rappel « le froid d'abord »). Texte à faire relire.
2. **6 h 00 : camion A** (glaces, 3 palettes). **6 h 10 : camion B** (légumes, 5 palettes). L'élève lit **les deux
   tickets** (chacun coûte du temps du quai) :
   - ticket A : **groupe froid qui faiblit**, remontée lente et continue depuis une heure (−19,5, −19, −18,5, −18…) ;
   - ticket B : parfait.
3. **Choix de l'ordre** : « Quel camion faites-vous décharger en premier ? » + **une phrase de justification parmi 4**
   (une seule juste) :
   - « Le camion A est arrivé le premier » ;
   - « Le camion B a plus de palettes » ;
   - **« Le ticket de A montre que son froid faiblit : ses glaces se réchauffent s'il attend »** (juste) ;
   - « Les glaces sont plus chères ».
4. **Conséquence réelle** : le camion qui attend reste porte fermée. B attend sans dommage ; **A continue de se
   réchauffer** tant qu'il n'est pas ouvert et déchargé (vitesse construite, ex. +0,25 °C par minute de temps du quai).
   Si l'élève décharge B d'abord (≈ 5 min 30 de déchargement + contrôles + rentrée), les glaces de A passent
   au-dessus de −15 °C à cœur : la bonne décision devient « Refuser — température ». **Le jalon de décision lit la
   température réelle au moment de la sonde**, pas une valeur figée.
5. Déchargement animé, contrôle, chambre froide, réserves, signature : **pour chaque camion** (deux BL, deux
   signatures). **Un temps hors froid par camion** (deux jauges) : chaque lot démarre à l'ouverture de SON camion et
   s'arrête quand IL entre en chambre froide ; l'élève peut rentrer A avant de faire décharger B.
6. **Bilan** juste/faux à la fin (entraînement = formatif), temps réel mesuré affiché (non noté).

## 5. Palettes proposées (4 aléas sur 8, décision de Tristan)

| Palette | Produit (proposition) | Aléa | Attendu (si A déchargé en premier) |
|---|---|---|---|
| A1 | Glace vanille 2,5 L | aucun | Accepter |
| A2 | **Multi-références** : sorbet citron + sorbet framboise (2 lignes du BL) | compter chaque référence | Accepter (si les deux comptes = BL) |
| A3 | Bâtonnets chocolat | aucun | Accepter |
| B1 | Petits pois | aucun | Accepter |
| B2 | Poêlée de légumes | **chaude malgré un ticket parfait** (ex. −14,8 °C à cœur) | Refuser — température |
| B3 | Brocolis | **étiquette avant déchirée** ; la face arrière révèle une autre référence | Refuser — produit différent |
| B4 | Haricots beurre | **1 carton manquant** (rappel d'ENT-4.1) | Réserves — manquant (1) |
| B5 | Carottes en rondelles | aucun | Accepter |

Si B est déchargé en premier : A1, A2, A3 deviennent « Refuser — température » (valeurs relevées à la sonde).

## 6. Aides (décision de Tristan : seul le bilan reste)

**Retirées** : chef de quai, repère P1, règle des couches, détail du comptage (total seul). **Gardé** : le bilan
juste/faux en fin de séance. « Revoir le BL » reste (règle générale).

## 7. Ce que la vue quai doit gagner (chantier P4 de la coordination)

- **Plusieurs camions** dans `quai.camions`, avec heure d'arrivée, et un **choix de l'ordre** (+ justification) avant
  le premier déchargement ; le second attend « porte fermée ».
- **Réchauffement d'un camion qui attend** : paramètre par camion (`rechauffeEnAttente: 0.25` °C/min, construit), qui
  modifie la température à cœur de ses palettes selon le temps du quai écoulé avant son ouverture.
- **Palette multi-références** : plusieurs lignes du BL, un comptage par référence, une étiquette par référence.
- **Étiquette par face** (avant déchirée, arrière lisible).
- **n palettes** à l'étape 2 (8 ici) et **un temps hors froid par camion**.

## 8. Jalons (à préciser par Claude Code)

Ordre des camions **et** phrase juste (1) · tickets lus (2) · comptages (8, dont A2 sur ses deux références) ·
décisions + motifs, palette sondée (8, lus sur la température réelle) · réserves précises (B4, + celles qu'impose la
situation) · pas de « sous réserve de déballage » · 2 signatures · 2 lots rentrés. Aucun jalon vrai par inaction.

## 9. Tests

Ordre juste → glaces conformes ; ordre inverse → glaces à refuser (température calculée) ; phrase fausse + bon ordre
→ jalon faux ; multi-références comptées ensemble → faux ; B2 non sondée → décision fausse ; B3 sans lire la face
arrière → produit non vu ; deux jauges indépendantes.

## 10. Supports

Trame élève Word/PDF (Cowork, après validation à l'écran) ; corrigé `contenus/corriges/ENT-4.2.js`.

## 11. Questions ouvertes

> **Réponses données d'avance par Tristan (03/10/2026, Cowork)** : ne pas s'arrêter pour les questions ci-dessous ; appliquer ces choix, et **lister au compte rendu** tout ce que tu as choisi seul (noms, textes, chiffres) pour que Tristan le corrige à l'écran.

- [x] **Réchauffement de A** (tranché le 03/10/2026) : glaces à **−18,5 °C à cœur** à l'arrivée, **+0,25 °C par minute**
  d'attente porte fermée → au-dessus de −15 °C après **14 min** : décharger B d'abord mène **toujours** au refus des
  glaces. Pour que ce soit cohérent, le **ticket de A montre une remontée qui s'accélère** sur la dernière heure (et non
  une pente douce), valeurs à construire par Claude Code.
- [x] **Noms fictifs** des deux fournisseurs et transporteurs : **choisis par Claude Code**, vérifiés par recherche web
  (aucune ressemblance avec une entreprise réelle), listés au compte rendu.
- [x] **Mail d'accueil** : **écrit par Claude Code** sur le modèle d'ENT-4.1 (deux camions annoncés, rappel « le froid
  d'abord »). Tristan le lit en jouant la séance.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `core/types/quai.js` (plusieurs camions, réchauffement, multi-références, étiquette
  par face, une jauge par lot) ; `contenus/picard-ent42.js` (neuf) ; `activites/picard-ent42.js` (neuf) ;
  `activites/index.js` (une ligne) ; `contenus/corriges/ENT-4.2.js` (neuf, calculé) ; `activites/FICHE-SEANCE.md` ;
  `outils/test/picard.mjs` (11 cas ENT-4.2) ; `outils/test/socle.mjs` (liste Simulog allongée de ENT-4.2, seule
  modification d'un cas existant). `outils/test.mjs` n'est pas touché. ENT-4.1 : aucun changement de comportement
  (35 cas inchangés et verts), sauf l'accord « 1 carton » au singulier dans une réserve (ENT-4.1 n'a que des 2).
- **Écarts par rapport au brief** :
  - « Décharger B d'abord mène **toujours** au refus » n'était pas vrai tel quel : au plus vite, B d'abord ouvre A après
    5 min 30 + 2 min de papiers (−16,6 °C). Pour le tenir, deux règles : le choix de l'ordre ne s'ouvre **qu'une fois les
    deux tickets lus** (4 min, c'est le déroulé §4.2) et la mise à quai du second camion coûte une **manœuvre de 3 min**
    (construit). Chemin B le plus court : 4 + 5,5 + 1 + 1 + 3 = 14 min 30 → −14,9 °C, à refuser ; un test le garde.
  - Le second camion ne se met à quai **qu'une fois le premier reparti (BL signé)** : un seul quai. Le lot du premier
    peut rester sur le quai (sa jauge continue) : l'élève peut le rentrer avant ou après.
  - En bon ordre, les glaces sont sondées à **−17,5 °C**. Tranché par Tristan le 03/10 (après la livraison) : règle à
    trois zones, donc A1, A2, A3 = **accepter avec réserves — température (−17,5)** au lieu de « accepter » (§5) : trois
    lignes sur le BL du camion A (« acceptée sous réserve — température à cœur −17,5 °C (−18 °C exigé) »).
  - Pas de `reinitialisable` (réservé aux X.1, test du dépôt) ; « Recommencer la réception » du bilan reste (il ne
    remet à zéro que le quai d'ENT-4.2).
- **Décisions prises en route (choisies seul, à corriger à l'écran)** :
  - Noms fictifs, sans résultat à la recherche web le 03/10/2026 : **Glaces Néviane** + **Transports Hivernel** (camion A),
    **Légumes d'Orvalle** + **Transports Calvenor** (camion B). Écartés : « Brumel » (trop proche de Transports Brunel,
    vrai transporteur frigorifique du Nord), « Valmonde » (ancienne maison d'édition).
  - Prise de poste à **06:10**, les deux camions déjà là ; le réchauffement de A compte depuis 06:10.
  - Ticket A : stable vers −21 °C puis 04:45 −20,6 · 05:00 −20,3 · 05:15 −19,9 · 05:30 −19,3 · 05:45 −18,5 · 06:00
    −17,4 (remontée qui s'accélère). Ticket B : stable. Quatrième réponse au ticket : « La température remonte encore à
    l'arrivée, de plus en plus vite : le groupe froid faiblit » (juste pour A) ; « Rien à signaler » juste pour B.
  - Palettes : A1 glace vanille 2,5 L (36), A2 sorbet citron 3 couches (18) + framboise 1 couche (6), bandes jaune et
    rose sur les cartons, A3 bâtonnets chocolat (48) ; B1 petits pois (60), B2 poêlée campagnarde −14,8 °C (36),
    B3 brocolis BRO-1000, étiquette arrière CFL-1000 chou-fleur (30), B4 haricots beurre 31 pour 32, B5 carottes (45).
    Toutes les glaces à −18,5 °C (avec −18,6, l'arrondi au dixième rendait −15,0 : acceptable par erreur).
  - Compter une palette multi-références coûte 1 min par référence.
  - Le refus « produit différent » de B3 n'est juste que si l'étiquette arrière a été lue (la seule preuve) ; règle
    limitée aux étiquettes déchirées pour ne rien changer à ENT-4.1.
  - 30 jalons : ordre + phrase (1), tickets (2), comptages (8), décisions (8), réserves (6 : les trois palettes de A, qui
    peuvent devenir à refuser, et B2, B3, B4 ; pour A en bon ordre, « aucune ligne » est juste une fois le BL écrit),
    pas de mention de déballage sur les deux BL (1), signatures (2), lots rentrés (2).
  - Mail d'accueil écrit (« Quai 32 : deux camions ce matin ») : à relire.
- **Tests** : bloc `picard` 46/46 (11 cas ENT-4.2, éprouvés par 4 sabotages : sans réchauffement, sans preuve de
  l'étiquette arrière, sans manœuvre, comptage multi-références ignoré) ; suite entière verte avant le push.
- **Commits** : voir `git log` (« ENT-4.2 Picard … »).
- **Après le premier essai de Tristan (03/10)** : camions nommés par leur fournisseur à l'écran (« camion Glaces
  Néviane », phrases d'ordre et mail compris ; « A » et « B » ne restent que dans les identifiants, palettes A1… B5) ;
  « Valider cette palette » à l'étape ③ (une coche, rien de figé, passe à la palette suivante non validée ; il faut une
  décision) ; « Contrôles terminés → réserves » en haut à droite avec confirmation qui compte les palettes non
  validées (vaut aussi pour ENT-4.1, même écran) ; « Revoir le bon de livraison » agrandi.
- **Reste ouvert** : trame élève (Cowork, après validation à l'écran) ; la teinte des bandes (jaune / rose) et la petite
  taille des étiquettes déchirées sur la palette 3D sont à juger à l'écran.
