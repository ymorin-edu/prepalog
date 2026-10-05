# Brief de séance — ENT-6.5 France Boissons, ranger les fûts en stockage de masse (2de, poste C — cariste, entraînement)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/ENT-6.5-france-boissons-rangement.md. Commence par l'état des lieux des demandes au moteur du §7 (lecture seule) : dis-moi ce qui existe déjà dans la vue Plan d'entrepôt et dans la fiche à remplir, et propose un découpage en lots. N'implémente la séance qu'une fois les demandes livrées. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 05/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiches projet `claude/prepalog-2de-s2-deroule.md` (décisions 31 à 37),
`claude/prepalog-reprise-6.5.md` et `claude/prepalog-materiel-decouverte.md`. Modèle : **ENT-5.5 Smoby**
(`docs/briefs/ENT-5.5-smoby-rangement.md`), rangement puis entrée en stock.
Règles d'écriture 2de : `claude/prepalog-2de-eleve-debut-annee.md` (3 lignes par bloc, une consigne par écran).
**Modèle** : Opus (séance nouvelle, deux vues nouvelles du moteur). Sonnet suffit pour la fiche d'entrée en stock.

**Maquettes de référence** (jetables, ne pas recopier le code ; à copier dans `docs/briefs/france-boissons/`) :
- `G:\Mon Drive\Travail\Logistique\1L\Claude outputs\animation-6.5-couloir-2temps.html` — l'animation en deux temps, **validée
  « parfait »** par Tristan ;
- `G:\Mon Drive\Travail\Logistique\1L\Claude outputs\maquette-6.5-stockage-masse.html` — la vue entrepôt en 3D isométrique, **validée**
  (« beaucoup mieux en 3D iso ») ; panneaux de couloir, flèches ENTRÉE / SORTIE et règle « un seul lot par couloir » ajoutés le 05/10.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-6.5 |
| `id` (jamais modifié ensuite) | `france-boissons-rangement` |
| Titre / desc | « France Boissons — ranger les fûts » / « Cariste à la plateforme de Buchelay : comprendre le FIFO, ranger les palettes de fûts reçues en stockage de masse sans bloquer un lot plus ancien, puis saisir l'entrée en stock. » |
| Rubrique | simulog, entreprise n° 6 France Boissons |
| Niveau(x) | 2de |
| Compétence(s) | **C1.5** (ranger, stocker) et **C1.6.1** (mettre à jour les stocks) ; domaines D4, D5 |
| Temps pédagogique | **entraînement** (scénario S2) ; **découverte** du stockage de masse et du FIFO (étapes 0 et 1 guidées, étapes 2 et 3 en entraînement) |
| Notation | jalons + note sur 20 |
| Barème | 10 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié (05/10, INRS, [Travail et Sécurité n° 843, 13/12/2022](https://www.travail-et-securite.fr/ts/843/EI/une-logistique-qui-met-la-pression-sur-les-manutentions.html), plateforme France Boissons de Gennevilliers)** :
  les fûts sont stockés **en masse** (au sol, palettes gerbées, sans rack) ; ils arrivent des brasseurs « par lots de huit sur des
  palettes mères de 1,23 m par 1,12 m » et repartent vers les clients sur des palettes 1,20 × 0,80 de 6 fûts au plus ; portique à
  fûts. Le nombre de niveaux de gerbage **n'est pas donné** par la source.
- **Vérifié (05/10)** : le **chariot élévateur frontal en porte-à-faux** jusqu'à 6 t relève du **CACES R489 catégorie 3**
  ([caces.fr](https://www.caces.fr/guides/caces-r489-categorie-3.html), [Formalogistics](https://formalogistics.com/machines/caces-r489-chariot-categorie-3/)).
  Pour le conduire, l'employeur délivre une **autorisation de conduite** (le CACES est la formation reconnue pour l'obtenir).
- **Règle de l'exercice (décision 52 de Tristan, 05/10/2026, remplace la 37)** : **1 palette = 8 fûts posés à plat en
  quinconce** (rangées de 3, 2 et 3, une seule couche) sur une **palette de rétention noire en plastique de 1,30 × 1,30 m**
  (caillebotis percé, bac, pieds) — **jamais de palette en bois** sur les illustrations. Même règle qu'en ENT-6.4 (sources et
  part construite au §2 d'ENT-6.4 : palette de rétention 1,30 × 1,30 du commerce, fût Euro de 39,5 cm). Le réel (8 fûts par palette
  mère, puis 6 au plus vers les clients) est dit dans la trame. La palette de rétention est un **choix pédagogique** (contenir une fuite, sol glissant) : les
  fournisseurs la présentent surtout pour les produits dangereux ; ce n'est **pas** une pratique vérifiée chez France Boissons, et
  l'écran le dit.
- **Construit (annoncé comme tel)** : le plan de la zone de masse (8 couloirs M01-M08 de 4 places), les lots (semaines S18 à S24),
  les hauteurs de gerbage (30 L → 2 palettes, 20 L → 3), le stock de départ, l'heure.
- **Dessins** : tout est dessiné en **3D isométrique** (style des deux maquettes) ; chariot frontal en silhouette, **sans visage**.
  Légende : « Dessin — scène construite, ce n'est pas la plateforme de Buchelay. »

## 3. Objectif pédagogique

L'élève **découvre le stockage de masse** et comprend **pourquoi on ne pose jamais un lot devant ou sur un lot plus ancien** :
le chariot entre par l'allée, la dernière palette posée sort la première ; pour respecter le **FIFO** (premier entré, premier
sorti) **de l'entrepôt**, on met **un seul lot par couloir**. Il range ensuite seul les 4 palettes reçues en ENT-6.4, puis **met le
stock à jour** (stock avant + entrée = stock après) sans recopier le BL.
Fil rouge : ce sont les palettes de Mons reçues à 14 h (6.4) ; le stock qu'il saisit sera compté demain matin (6.6) et servira à
préparer la commande de Malo jeudi (6.7).

**Point de vigilance (décision 35)** : éviter le contresens « FIFO = premier posé dans le couloir, premier sorti ». Dans un couloir,
c'est l'inverse (dernier posé, premier sorti) ; c'est justement pour cela qu'on ne mélange pas les lots. Toutes les formulations
de la séance le disent ainsi.

## 4. Déroulé (≈ 50 min)

**Date : mercredi 16 juin 2027, 16 h** (calendrier de S2, décision 31 : 6.1 lun. 14 juin · 6.2 mar. 15 · 6.3 mar. 15 après-midi ·
6.4 mer. 16, 14 h · **6.5 mer. 16, 16 h** · 6.6 jeu. 17, 7 h · 6.7 jeu. 17 après-midi · 6.8 ven. 18, 6 h · 6.9 ven. 18, 6 h 30 ·
6.10 ven. 18, 17 h). L'élève joue **son propre rôle** : « Tu es en renfort au quai, avec Nadia. »

1. **Message de Nadia, cheffe de quai** (3 blocs) : « Re-bonjour {prénom} ! / Les palettes de Mons sont en zone de réception. Le fût
   qui fuit reste en zone litiges. / Avant de ranger, regarde comment on travaille ici : on ne range pas les fûts dans des racks.
   Nadia »

### Étape 0 — Le matériel du poste (≈ 3 min, non notée)

Deux écrans, un dessin 3D iso chacun, 3 lignes au plus par bloc, bouton « Suivant » (décision de Tristan du 05/10 : courte étape
au début, avant l'animation).

| Écran | Dessin | Texte |
|---|---|---|
| Le chariot frontal | chariot frontal portant une palette de rétention de 8 fûts, fourches levées sur une pile | « Le chariot frontal porte la palette devant lui, sur ses fourches. Il peut la lever pour **gerber** : poser une palette sur une autre. / Pour le conduire, il faut une **autorisation de conduite** de l'employeur, après une formation comme le **CACES R489 catégorie 3**. / Sécurité : on roule **fourches baissées**, et on ne passe jamais sous une charge levée. » |
| La palette de rétention | palette de rétention noire vue de 3/4, 8 fûts dessus en quinconce, un fût qui goutte dans le bac | « Ici, chaque palette de fûts est posée sur une **palette de rétention** : un bac en plastique couvert d'une grille. / Si un fût fuit, la bière coule dans le bac, pas sur le sol : personne ne glisse. / Dans les entrepôts, on s'en sert surtout pour les produits dangereux. Ici, c'est un choix de l'exercice. » |

Dessins : **à fournir par Cowork** en SVG (`docs/briefs/france-boissons/materiel-chariot-frontal.svg`,
`materiel-palette-retention.svg`), tirés du code de dessin des deux maquettes (même chariot, même palette).

### Étape 1 — Comprendre le FIFO (≈ 10 min, 2 jalons)

1. **Le mot expliqué** (un écran, 3 blocs) : « **FIFO** veut dire *First In, First Out* : **premier entré, premier sorti**. / On fait
   sortir d'abord le **lot** le plus ancien (un lot = les fûts fabriqués la même semaine : S20 est plus ancien que S24). / Regarde
   ce qui se passe quand on range mal. »
2. **L'animation en deux temps** (vue nouvelle §7.2, maquette `animation-6.5-couloir-2temps.html`, à reproduire **telle quelle**) :
   3D iso, couloirs M01 / M02 de 3 places, panneaux au mur du fond, flèches au sol ENTRÉE (verte) / SORTIE (rouge), chariot frontal,
   palettes de rétention de 8 fûts, étiquettes de lot (S20 jaune, S24 bleu), « posée en 1re / 2e / 3e » au sol, bulles fléchées
   (rouge = problème, vert = bonne façon), **sans son**, vitesse 0,8 (réglable dans le contenu), tient dans 1280 × 720.
   - **Partie 1, l'erreur (≈ 35 s)** : ① le chariot range le lot S20 par le fond de M01 ; ② il pose le lot S24 devant, même couloir ;
     ③ une commande arrive : il sort le S24, seul accessible ; ④ le S20 reste bloqué (« ! ») → **arrêt** : « Arrête-toi et
     réfléchis. »
   - **Question 1** : « Pourquoi le lot S20, le plus ancien, ne sort-il pas ? » — juste : « Le chariot entre par l'allée : il ne peut
     prendre que la palette de devant. » ; pièges : « Le lot S20 est trop lourd pour le chariot. » · « Le cariste a oublié le lot
     S20. » · « Les fûts du lot S20 sont abîmés. » Bouton « Revoir l'animation » avant de répondre. Après « Valider » : la bonne
     réponse est montrée avec l'explication (« Le chariot n'entre que par l'allée. La dernière palette posée devant sort donc la
     première, et le S20 reste coincé au fond tant qu'on pose du neuf devant lui. »), puis « ▶ Voir la bonne façon ».
   - **Partie 2, la bonne façon** : ⑤ le S24 va au fond de M02 ; ⑥ on sort d'abord le S20 de M01, rien n'est bloqué.
   - **Question 2 (transfert)** : « Demain, un lot S26 de Heineken arrive. M01 contient du S20, M02 du S24, M03 est vide. Où poses-tu
     le lot S26 ? » — juste : « En M03, au fond. » ; pièges : « En M02, devant le lot S24. » · « En M01, devant le lot S20. » ·
     « En M02, sur le lot S24. »
   - Puis **« À retenir »** : « Le chariot entre par l'allée : la **dernière palette posée sort en premier**. Donc **un seul lot par
     couloir**. »
   - **La première réponse** à chaque question est gardée et notée (jalons 1 et 2) ; place de la bonne réponse **tirée par élève**.

### Étape 2 — Ranger dans la zone de masse (≈ 20 min, 4 jalons)

Vue **Plan d'entrepôt, mode nouveau « stockage de masse »** (§7.1), maquette `maquette-6.5-stockage-masse.html`. Consigne d'une
ligne : « Prends une palette (clique sa carte), puis clique un couloir sur le plan. »

- **Vue d'ensemble 3D iso** : 8 couloirs M01-M08 de **4 places** (position 1 = fond, 4 = devant, côté allée), **panneau vert du
  couloir sur le mur du fond** (cliquable), **flèches au sol verte (entrée, vers le fond) et rouge (sortie, vers l'allée)** devant
  chaque couloir (mots « ENTRÉE / SORTIE » sous le premier couloir), piles jusqu'à 3, **étiquette du lot au sommet de chaque pile**
  (S18-S20 ambre / jaune, S24 bleu, VIDES gris ; palette de l'élève cerclée de vert), places vides en pointillé, allée « le chariot
  entre par ici », quais 10 à 14, zone de réception (P1-P4 cliquables), **zone litiges** avec le fût qui fuit sur sa palette de
  rétention. Au chargement, les palettes apparaissent l'une après l'autre.
- **Couloir ouvert en 3D** (clic sur un couloir) : mur du fond avec le panneau, allée avec les deux flèches et « ALLÉE : le chariot
  entre et sort par ici », positions 1 (fond) à 4 (devant) écrites au sol, **places possibles en boîtes vertes en pointillé**
  (« P1 ici · niv. n »), « inaccessible (une pile devant) » en rouge pour les places derrière une pile ; la palette posée **tombe**
  à sa place (rebond court ; `prefers-reduced-motion` respecté) ; « ← Retour au plan ».
- **Ce que le moteur empêche** (geste physique impossible, pas une règle) : poser derrière une pile (le chariot ne passe pas), poser
  sur une pile de 4 (hors de portée). Tout le reste est **accepté** et jugé à la validation.
- **Reprendre une palette** : possible si elle est au sommet et que rien n'est devant elle ; sinon « Impossible de la reprendre : une
  autre palette la bloque. »
- **Les règles** (bouton « Les règles ▾ ») :
  1. Un couloir = **une seule référence**.
  2. **Un seul lot par couloir** : le chariot entre par l'allée et reprend la palette de devant ; on ne pose donc jamais un lot devant
     ni sur un lot plus ancien (c'est ce qui permet de respecter le FIFO).
  3. **Hauteur de gerbage** : fûts 30 L → 2 palettes au plus ; fûts 20 L → 3 au plus.
  4. On remplit un couloir **par le fond**.
  5. Le couloir **VIDES** ne reçoit que les fûts vides rendus par les clients.
- **Validation** : « Valider mon rangement » (actif quand les 4 palettes sont posées) **fige** le rangement. Bilan d'entraînement :
  pour chaque palette ✓ ou « ✗ critère : … » (**le nom du critère seulement**, jamais la bonne place).

**Stock de départ (construit ; position 1 = fond)** :

| Couloir | Contenu | Rôle |
|---|---|---|
| M01 | Heineken 30 L, lot **S20** : pile de 2 (pos. 1) = 16 fûts | piège lot pour P1 |
| M02 | vide | place de P1 (ou P3) |
| M03 | Pelforth Blonde 20 L, lot **S24** : pile de 2 (pos. 1) = 16 fûts | place de P2 |
| M04 | Pelforth Blonde 20 L, lot **S19** : 1 palette (pos. 1) = 8 fûts | piège lot pour P2 |
| M05 | Affligem Blonde 20 L, lot **S18** : 1 palette de **2 fûts** (pos. 1) | piège lot pour P3 (rupture de 6.2) |
| M06 | vide | place de P3 (ou P1) |
| M07 | Edelweiss 20 L, lot **S24** : pile de 3 (pos. 1) = 24 fûts | place de P4 |
| M08 | **VIDES** (retours clients) : pile de 2 (8 + 8, pos. 1) + 1 palette de 6 (pos. 2) = 22 fûts | piège |

Ce stock est **celui de l'extrait de stock d'ENT-6.2** (aligné le 05/10 : Heineken 30 L 16, Affligem 2, Pelforth 24, Edelweiss 24).

**Palettes reçues** (reprises d'ENT-6.4 ; toutes du **lot S24** ; poids construits) :

| Palette | Référence | Fûts | Poids | Réception (6.4) | Bonne(s) place(s) | Pièges (un critère faux chacun) |
|---|---|---|---|---|---|---|
| P1 | Heineken fût 30 L | 8 | 350 kg | conforme | **M02 ou M06, position 1, niv. 1** | M01 devant le S20 (lot) ; sur la pile de 2 de M01 (lot et hauteur 30 L) ; M02 position 4 (par le fond) |
| P2 | Pelforth Blonde fût 20 L | 8 | 260 kg | réserve « produit différent » : c'est de la Pelforth | **M03 sur la pile de 2 (pos. 1, niv. 3)** ou **M03 pos. 2, niv. 1** | M04 (lot S19) ; M05 (référence) |
| P3 | Affligem Blonde fût 20 L | **7** | 230 kg | le 8e fuit, il est en zone litiges | **M02 ou M06, position 1, niv. 1** (le couloir resté libre) | M05 devant ou sur le S18 (lot) |
| P4 | Edelweiss fût 20 L | **7** | 230 kg | conforme (une place vide, comme 6.4) | **M07 pos. 2, niv. 1** | sur la pile de 3 de M07 (hauteur) ; M08 (VIDES) |

Poids **calculés** : fût plein ≈ 40 kg (30 L) et ≈ 29 kg (20 L) (tare du fabricant Thielmann + bière), palette de rétention
≈ 30 kg (**construit**), arrondis à la dizaine.

Bonnes réponses **calculées par le moteur** à partir des critères et du stock de départ (les recontrôler au bloc de tests).
**Remarque de Cowork (à voir à l'essai)** : un élève qui ouvre un couloir vide pour P2 ou P4 respecte les règles, mais il ne
reste alors qu'un couloir vide pour P1 et P3 ; il peut reprendre une palette avant de valider. Aucune règle de plus (défaut).

### Étape 3 — Entrée en stock (≈ 10 min, 4 jalons)

**Fiche à remplir** (existante, avec la case « nombre » demandée en ENT-6.2 ; documents à gauche) — décision de Tristan du 05/10 :
une seule fiche avec l'emplacement, **pas de message séparé** (6.4 en avait déjà un).

- **Document à gauche : « État du stock — mercredi 16 juin, 16 h »** (avant l'entrée) : Heineken fût 30 L **16** · Affligem Blonde
  fût 20 L **2** · Pelforth Blonde fût 20 L **24** · Edelweiss fût 20 L **24**. (Le BL MON-27-0617 d'ENT-6.4 est aussi joint, avec
  ses réserves : c'est le piège de P2.)
- **Fiche « Entrée en stock »**, une ligne par palette (P1 à P4, dans l'ordre) :
  - Référence : [liste : Heineken fût 30 L / Affligem Blonde fût 20 L / Pelforth Blonde fût 20 L / Edelweiss fût 20 L]
  - Lot : [liste : S18 / S19 / S20 / S24] (non noté)
  - Fûts entrés : [nombre] fûts
  - Couloir : [liste : M01 … M08]
  - Stock avant : [nombre] · Stock après : [nombre]
  - Encadré « Mettre le stock à jour » (3 lignes) : « 1. Ce qui est vraiment entré (pas ce que dit le BL). 2. Le stock d'avant, sur
    l'état du stock. 3. Stock après = stock avant + entrée. »
- Envoi : « Enregistrer l'entrée en stock ». Rien n'est jugé avant l'envoi ; fiche figée ensuite.

| Palette | Référence attendue | Entrée | Stock avant → après | Couloir |
|---|---|---|---|---|
| P1 | Heineken fût 30 L | 8 | 16 → **24** | celui où l'élève a rangé P1 |
| P2 | **Pelforth** Blonde fût 20 L (pas Affligem) | 8 | 24 → **32** | idem P2 |
| P3 | Affligem Blonde fût 20 L | **7** (le 8e est en litiges) | 2 → **9** | idem P3 |
| P4 | Edelweiss fût 20 L | **7** | 24 → **31** | idem P4 |

Une ligne de stock **par référence** ; P1 à P4 portent chacune une référence différente, donc pas de cumul dans cette séance.

2. **Réponse de Nadia** (après l'envoi, ne dit pas si c'était juste) : « Merci {prénom}, c'est rangé. Demain 7 h, on compte le stock
   avant le week-end de la Fête. Nadia » Transition vers ENT-6.6.

Mots cliquables : FIFO, lot, stockage de masse, couloir, gerber, hauteur de gerbage, palette de rétention, chariot frontal, zone
litiges, entrée en stock.

## 5. Jalons / notation (10, validés par Tristan le 05/10)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1 | Question 1 de l'animation : **première** réponse juste | vue animation (§7.2) | question non répondue = faux ; une 2e réponse ne compte pas |
| 2 | Question 2 : **première** réponse juste (M03, au fond) | idem | idem |
| 3 | P1 rangée juste | mode masse (§7.1), état validé | non posée ou rangement non validé = faux |
| 4 | P2 rangée juste | idem | idem |
| 5 | P3 rangée juste | idem | idem |
| 6 | P4 rangée juste | idem | idem |
| 7 | Ligne P1 juste : Heineken 30 L, 8, stock après 24, **couloir = celui où l'élève a posé P1** | fiche envoyée | fiche non envoyée = faux |
| 8 | Ligne P2 juste : **Pelforth**, 8, stock après 32, couloir de P2 | idem | « Affligem » recopié du BL = faux |
| 9 | Ligne P3 juste : Affligem, **7**, stock après **9**, couloir de P3 | idem | 8 fûts (le fût qui fuit compté) = faux ; 10 = faux |
| 10 | Ligne P4 juste : Edelweiss, **7**, stock après **31**, couloir de P4 | idem | 8 (palette supposée pleine) = faux |

« Rangée juste » = aucun critère faux parmi : une seule référence, un seul lot, hauteur de gerbage, par le fond, couloir VIDES.
**Une erreur de rangement n'est pas comptée deux fois** (décision de Tristan) : le couloir de la fiche est comparé à l'endroit où
l'élève a **lui-même** posé la palette, pas à la bonne réponse. Stock avant non noté à part (il est contenu dans le stock après).
Valeurs attendues **calculées** depuis les données (stock de départ, palettes, positions), jamais recopiées ; dans les tests, écrites
à la main.

## 6. Contenu

`contenus/france-boissons-ent65.js` (écrans matériel, texte FIFO, script de l'animation et ses deux questions, plan de masse et
stock de départ, palettes, règles, fiche d'entrée en stock, messages) ; univers dans `contenus/france-boissons.js` (Nadia, références
et désignations d'ENT-6.4). Dessins : `contenus/images/france-boissons/` (SVG des écrans matériel, §4 étape 0).

## 7. Demandes au moteur

1. **Plan d'entrepôt, mode « stockage de masse »** (nouveau ; à ajouter à `MOTEUR-vue-plan-entrepot.md` ou en brief moteur à part,
   au choix de Claude Code après l'état des lieux). Rien de « France Boissons » dans `core/` : la séance déclare son plan.
   - **Dessin en 3D isométrique** (vue d'ensemble + couloir ouvert), comme la maquette : sol, allée, quais, mur du fond avec
     **panneaux de couloir**, **flèches ENTRÉE / SORTIE au sol**, zones déclarées (réception, litiges, VIDES), piles, étiquettes de
     lot au sommet, apparition des palettes, palette qui tombe, `prefers-reduced-motion`.
   - **Briques déclarées** : couloirs (`id`, profondeur, zone), stock de départ par position et par niveau, palettes (`ref`, `lot`,
     `futs`, `poids`), formats et hauteur maximale par format, **forme de la charge** (`fut` : 8 fûts à plat en quinconce 3 + 2 + 3, ou moins, sur
     **palette de rétention noire de 1,30 × 1,30 m**), couleurs de lot.
   - **Gestes** : prendre / poser (places accessibles seulement), reprendre si accessible, valider (fige l'état).
   - **Critères types** fournis par le moteur, choisis par la séance : `uneReference`, `unSeulLot`, `hauteurGerbage`, `parLeFond`,
     `zoneReservee` (VIDES) ; bilan d'entraînement qui **nomme le critère**.
   - **Jalon** `palette(id)` lu dans l'état validé, et **position de chaque palette** exposée à la fiche (jalons 7 à 10).
   - Ergonomie : écran 1366 × 768 sans défilement (message de Nadia et boutons sur une ligne, cartes P1-P4 compactes à gauche, 3D
     cadrée automatiquement).
2. **Vue « animation à questions »** — **brief à part : `docs/briefs/MOTEUR-vue-animation.md`** (décidé le 05/10 : vue du moteur, kit iso qui grandit, à construire **avant** le mode masse) : une animation **scénarisée par le
   contenu** (étapes, positions, bulles, légende numérotée), **arrêt** à un point déclaré, **question à choix** (place des choix tirée
   par élève), « Revoir l'animation », **première réponse gardée** et lue par les jalons, explication après validation, enchaînement
   partie 2 → question 2 → « À retenir ». Vitesse réglable dans le contenu (0,8 par défaut). Sans son. Référence :
   `animation-6.5-couloir-2temps.html`. Elle resservira (inventaire, préparation, 1re).
3. **Écrans « matériel du poste »** : image + 3 blocs + « Suivant », non notés. Vérifier à l'état des lieux si un écran existant
   (documents joints, étape d'accueil avec image) suffit ; sinon brique minimale.
4. **Fiche à remplir** : case « nombre » (demandée en ENT-6.2, lot 4 de `MOTEUR-documents-formulaire.md`) et, si elle existe, la
   brique `lignes` (une ligne = plusieurs cases) ; une **liste dont les choix viennent de l'état d'une autre vue** n'est pas
   nécessaire (liste fixe M01-M08), mais le jalon doit pouvoir **comparer** le couloir saisi à la position lue dans le Plan
   d'entrepôt.

Ce que la séance réutilise tel quel : messages d'accueil et `apresFiche`, documents joints, mots cliquables, bouton « Les règles ».

## 8. Tests attendus

Bloc `france-boissons` : parcours juste 10/10 (P1 M02 pos. 1, P2 M03 sur la pile de 2, P3 M06 pos. 1, P4 M07 pos. 2 ; fiche juste ;
Q1 et Q2 justes du premier coup) ; **variante juste** (P1 M06, P3 M02 ; P2 M03 pos. 2 niv. 1) → 10/10 ; inaction 0/10 ;
Q1 fausse puis juste → jalon 1 faux ; P1 en M01 devant le S20 → jalon 3 faux (critère « un seul lot par couloir ») ; P1 sur la pile
de 2 de M01 → lot et hauteur ; P1 en M02 pos. 4 → « par le fond » ; P2 en M04 → jalon 4 faux ; P3 en M05 → jalon 5 faux ; P4 sur une pile de 3 →
jalon 6 faux ; P4 en M08 → jalon 6 faux ; poser derrière une pile → refusé (geste impossible) ; reprendre une palette bloquée →
refusé ; ligne P2 en Affligem → jalon 8 faux ; ligne P3 à 8 → jalon 9 faux ; stock après Affligem 10 → jalon 9 faux ; P1 rangée en
M01 (faux) **et** fiche « M01 » → jalon 3 faux, **jalon 7 juste** (pas de double peine) ; fiche non envoyée → jalons 7 à 10 faux ;
sabotage par jalon.

## 9. Supports

- Trame courte (contexte, lexique : FIFO, lot, gerber ; plan de la zone de masse à compléter sur papier ; tableau d'entrée en stock) :
  Cowork, **après validation à l'écran**. La trame dit **le réel** : palettes mères de 8 fûts, 6 au plus vers les clients, stockage de
  masse vérifié chez France Boissons (INRS) ; 8 fûts à plat sur palette de rétention = règle de l'exercice (ce n'est pas la palette
  mère réelle).
- Corrigé `contenus/corriges/ENT-6.5.js` : réponses des deux questions, places justes (toutes), fiche attendue ; calculé.
- **Question « Pour réfléchir » de la trame** (règle 32 ; **une seule gardée** par Tristan le 05/10) :
  - « Jeudi, tu prépares les 2 Affligem de Malo : quel lot sortiras-tu en premier, et dans quel couloir ? »
  (Lien FIFO → ENT-6.7 : le lot S18 de M05 sort avant le S24 rangé aujourd'hui.) Règles inchangées
  (`claude/prepalog-trames-eleve.md`) : une question à la fois, sur le travail de l'élève, sans réponse unique.

## 10. Critères de validation par Tristan

L'animation fait comprendre seule pourquoi on ne pose pas un lot devant un autre ; aucune phrase ne laisse croire « premier posé =
premier sorti » dans un couloir ; on retrouve les panneaux et les flèches de l'animation dans la vue entrepôt ; la 3D se lit sans
aide sur un écran de lycée ; un élève de 2de finit en 50 min ; le bilan ne donne jamais la bonne place.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [x] Stockage de masse plutôt que racks (Tristan, 05/10, décision 33).
- [x] Étapes : comprendre le FIFO + animation, puis vue entrepôt (Tristan, décision 35) ; matériel du poste au début (05/10).
- [x] Animation en deux temps, « parfait » (Tristan, 05/10) ; vue entrepôt 3D iso validée (décision 36).
- [x] ~~4 fûts par palette de rétention (décision 37)~~ → **8 fûts à plat en quinconce sur palette de rétention noire de 1,30 × 1,30 m** (Tristan, 05/10, décision 52).
- [x] Panneaux de couloir et flèches ENTRÉE / SORTIE dans la vue entrepôt (05/10).
- [x] Règle « un seul lot par couloir » au lieu de « premier entré, premier sorti » (Tristan, 05/10).
- [x] Les deux questions de l'animation comptent, première réponse (Tristan, 05/10).
- [x] Couloirs de 4 places (Tristan, 05/10).
- [x] Après le rangement : fiche d'entrée en stock avec couloir et calcul du stock, pas de message (Tristan, 05/10).
- [x] Stock de 6.2 aligné sur le plan (Tristan, 05/10).
- [x] 10 jalons ; une seule question « Pour réfléchir » (Tristan, 05/10).
- [ ] Mode masse dans la vue Plan d'entrepôt ou vue à part (défaut : mode de la vue existante).
- [x] Animation à questions : **vue à part, réutilisable** (Tristan, 05/10) → brief moteur `docs/briefs/MOTEUR-vue-animation.md` (kit iso qui grandit ; à construire avant le mode masse, qui réutilisera le kit).
- [ ] Dessins des écrans matériel (défaut : Cowork les fournit avant l'implémentation de la séance).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
