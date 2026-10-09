# Brief de séance — ENT-6.7 France Boissons, préparation vocale de la commande de Malo (2de, poste C — préparateur, entraînement C2.1)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/EN-COURS.md puis docs/briefs/ENT-6.7-france-boissons-preparation.md et sa maquette docs/briefs/france-boissons/maquette-6.7-preparation-vocale.html. Commence par l'état des lieux des demandes au moteur du §7 (lecture seule) : dis-moi ce qui existe déjà (terminal vocal d'ENT-6.6, mode préparation d'ENT-5.6, film et étiquettes) et propose un découpage en lots. N'implémente la séance qu'une fois les demandes livrées. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 05/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiches projet `claude/prepalog-reprise-6.7.md` (décisions 42 à 52) et
`claude/prepalog-6.7-maquette.md` ; cadrage `claude/prepalog-2de-s2-cadrage.md` (décision 8). Modèle : **ENT-5.6 Smoby** (mode
préparation, guidage), ici au niveau **entraînement**. Règles d'écriture 2de : `claude/prepalog-2de-eleve-debut-annee.md` (3 lignes
par bloc, une consigne par écran).
**Modèle** : **Opus** (séance nouvelle et adaptations de vues du moteur). Sonnet suffit pour le compte rendu.

**Maquette de référence (validée par Tristan le 05/10/2026)** : `docs/briefs/france-boissons/maquette-6.7-preparation-vocale.html`
(page autonome, jouable hors ligne ; son code n'est pas à reprendre, son **comportement** l'est).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-6.7 |
| `id` (jamais modifié ensuite) | `france-boissons-preparation` |
| Titre / desc | « France Boissons — la commande de Malo à la voix » / « Préparateur à la plateforme de Buchelay : préparer à la voix la commande de La Cabane à Malo, signaler un fût abîmé avec le bon mot, monter deux palettes client, filmer et étiqueter. » |
| Rubrique | simulog, entreprise n° 6 France Boissons |
| Niveau(x) | 2de |
| Compétence(s) | **C2.1** (« Répondre à la demande des clients internes et/ou externes ») ; domaine D4 *(codes sans préfixe : à aligner sur le format du code — AGO- / OTM- / LOG- ailleurs dans S2 ; Claude Code vérifie)* |
| Temps pédagogique | **entraînement** de C2.1 (guidage en ENT-5.6 Smoby) : aides éteintes, pas de bon de préparation affiché, montage choisi par l'élève, bilan qui nomme seulement le critère |
| Notation | jalons + note sur 20 |
| Barème | 10 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié (05/10)** : France Boissons prépare **à la voix** (Vocollect, déployé à partir de 2014 ; toujours cité par le site de
  l'entreprise) — sources dans ENT-6.6 §2.
- **Vérifié (05/10), plateforme France Boissons de Gennevilliers** ([INRS, Travail et Sécurité n° 843, 13/12/2022](https://www.travail-et-securite.fr/ts/843/EI/une-logistique-qui-met-la-pression-sur-les-manutentions.html)) :
  **tiroirs coulissants aux emplacements de picking sous les racks** ; **portique à fûts** ; objectif « zéro fût manutentionné à la
  main » ; fûts arrivés « par lots de huit sur des palettes mères de 1,23 m par 1,12 m », puis repalettisés « sur des palettes de
  1,20 m par 0,80 m, qui ne supportent que **six fûts**, afin que les marchandises puissent être livrées chez les clients sans
  rencontrer de difficultés dans les couloirs ou les monte-charge ».
- **Vérifié (07/10)** : **transpalettes / « chariots » à ciseaux** à Buchelay (article d'inauguration, juin 2025, et texte à
  l'écran de la [vidéo « Présentation de la Plateforme de France Boissons à Buchelay », Grand Paris Seine & Oise, YouTube, 20/06/2025](https://www.youtube.com/watch?v=LRa0qgI7Weo), 0:56) ; la vidéo montre aussi le portique (structure fixe, manipulateur à air) et des fûts sur palettes au
  niveau du sol des racks. **Construit** : que la palette client soit préparée sur le transpalette à ciseaux au poste du portique
  (la vidéo ne montre pas les deux ensemble).
- **Vérifié (05/10), le dialogue vocal en général** ([INRS ED 135](https://www.inrs.fr/dms/inrs/CataloguePapier/ED/TI-ED-135/ed135.pdf),
  [SELF 2010, acte 53](https://www.ergonomie-self.org/wp-content/uploads/2019/06/acte-53-self-2010.pdf)) : emplacement annoncé →
  **code détrompeur** lu à voix haute (« inscrit généralement sur la lisse », souvent deux chiffres) → quantité annoncée →
  confirmation ; exceptions dites au casque (**manquant, abîmé, emplacement vide**) ; chaque étape **horodatée** (indicateurs de
  productivité). **Revers documentés** : lignes une par une → le préparateur **ne peut plus anticiper** ; ordre imposé ; perte
  d'autonomie, bruit, TMS. Chiffres des fournisseurs (précision ≈ 99,8 %, productivité + 20 à 40 %) : **à dire comme tels**.
- **Vérifié (05/10), géométrie** : fût Euro de **39,5 cm** de diamètre (20 et 30 L, fabricant Thielmann) ; 3 × 2 fûts = 1,185 ×
  0,79 m : **c'est pourquoi une palette 1,20 × 0,80 prend 6 fûts**. Plein ≈ 29 kg (20 L), ≈ 40 kg (30 L) : calcul (tare + bière).
- **Construit (annoncé comme tel)** : le plan de picking (1 allée, 2 côtés, 4 travées par côté), les emplacements et leurs codes,
  les quantités au picking, le fût cabossé, la règle de montage (une couche de fûts, jamais un fût sur un casier), la palette client
  en bois, le quai 14 et la zone de préparation, l'heure.
- **Règle de l'exercice (décision 52)** : le stock de réserve (au sol, zone de masse d'ENT-6.5) est sur palettes de rétention de **8 fûts** à plat ; la palette client
  en prend **6** (réel). Le passage de 8 à 6 est une petite découverte de la séance, dite dans la règle n° 1.
- **Dessins** : 3D isométrique comme ENT-6.5 / 6.6, **sans visage**. Légende : « Dessin — scène construite, ce n'est pas la
  plateforme de Buchelay. »

## 3. Objectif pédagogique

L'élève sait **préparer une commande guidée à la voix** : aller à l'emplacement annoncé, **prouver qu'il y est** (code détrompeur),
prélever la quantité annoncée, **signaler une anomalie avec le bon mot** (un fût cabossé est « abîmé », pas « manquant ») et laisser
le terminal lui donner le remplacement (FIFO : S18 d'abord, puis S24), **anticiper le montage** alors que les lignes arrivent une à
une dans l'ordre du parcours (les casiers d'eau arrivent en premier mais se posent à la fin), et monter **deux palettes client**
conformes (6 fûts au plus, jamais un fût sur un casier), filmées et étiquetées.
Fil rouge : c'est **la commande prise en ENT-6.2** (6 Heineken 30 L, 2 Affligem 20 L, 2 Pelforth Blonde 20 L, 3 casiers d'eau) ; elle
part demain dans la tournée de la côte (ENT-6.8 / 6.9). Le terminal est **celui d'ENT-6.6** (ce matin).
Ouverture santé et sécurité au travail : « Ce que le terminal sait de toi » et une question sur le travail à la voix (décision 46).

## 4. Déroulé (≈ 45 min)

**Date : jeudi 17 juin 2027, 14 h** (décision 50). L'élève joue **son propre rôle**, en renfort. Tutrice : **Nadia**, cheffe de quai.

1. **Message de Nadia** (3 blocs, texte proposé, à relire par Tristan) : « Re-bonjour {prénom} ! / Cet après-midi, la commande de
   Malo pour la tournée de la côte, demain 6 h. / Le terminal te donne les lignes une par une, dans l'ordre du parcours. Tu montes
   deux palettes client dans la zone de préparation, devant le quai 14. Nadia »

### Étape 0 — Le matériel du poste (≈ 3 min, non notée)

Même brique qu'ENT-6.5 / 6.6 (un écran, un dessin, 3 blocs, « Suivant ») :
« Les fûts du picking sont dans des **tiroirs coulissants**, sous les racks : on les tire vers soi au lieu de se pencher. / Le
**portique à fûts** est fixe, au-dessus de la zone de préparation : un **manipulateur à air** glisse sur ses rails, saisit le fût
et le soulève ; tu le guides avec la poignée. Un fût de 30 L pèse environ 40 kg : on ne le porte pas à la main. /
Une **palette client** mesure 1,20 × 0,80 m : elle passe dans les couloirs et les monte-charge des bars. On la prépare sur un
**transpalette à ciseaux**, qui la monte à hauteur de travail : on ne se penche pas pour poser les fûts. »
Dessins : **fournis par Cowork le 06/10** (`materiel-portique-futs.svg`, **refait le 07/10 d'après la vidéo de présentation de Buchelay** : portique fixe, rails,
manipulateur à air, palettes de fûts au sol, palette client sur transpalette électrique, préparateur avec casque ; le terminal
vocal, `materiel-terminal-vocal.svg`, déjà présenté en 6.6). Générés par `docs/briefs/france-boissons/materiel_fb.py`.

### Étape 1 — Préparer à la voix (≈ 25 min, jalons 1 à 5 et 10)

Vue **Plan d'entrepôt, mode préparation** (ENT-5.6) **rendu en 3D isométrique** (§7.2), avec le **terminal vocal** à droite (§7.1)
et, dessous, **les deux palettes client** (§7.3). Consigne d'une ligne : « Écoute (ou lis) le terminal, va à l'emplacement, réponds,
puis pose. » **Aucun bon de préparation affiché** (entraînement : on ne connaît que la ligne en cours).

**L'allée** (construit) : côté A au fond de l'image, côté B devant (ses étages et poteaux **en transparence** pour voir l'allée) ;
travée T01 près du quai, T04 au fond ; **N1 = picking** (tiroir coulissant) ; **N2-N3 sans fûts** : la réserve de fûts est au sol,
dans la zone de masse d'ENT-6.5 (décision de Tristan du 06/10/2026 ; la maquette, qui y dessine des palettes de rétention, reste la
référence pour tout le reste). **Réassort du matin** (une phrase à l'écran, dans l'accueil ou la vue) : « Ce matin, le picking a été
réapprovisionné depuis la zone de masse : le lot S18 de M05 est passé dans le tiroir A-T03. »
Au survol, le **volume de la travée** s'éclaire en vert translucide ; on clique la travée **ou** son adresse écrite au sol. Le
préparateur (silhouette sans visage) se place devant la travée cliquée.

| Emplacement | Contenu du tiroir (N1) | Code détrompeur |
|---|---|---|
| A-T01 | Eau minérale 1 L, 8 casiers | 36 |
| B-T01 | Limonade 1 L, 6 casiers (distracteur) | 58 |
| A-T02 | Pelforth Blonde 20 L, 5 fûts | 24 |
| B-T02 | Edelweiss 20 L, 4 fûts (distracteur) | 71 |
| A-T03 | Affligem Blonde 20 L **lot S18, 2 fûts dont 1 cabossé** (le plus en avant) | 49 |
| B-T03 | Affligem Blonde 20 L lot S24, 5 fûts | 83 |
| A-T04 | Heineken 30 L, 7 fûts | 17 |
| B-T04 | Heineken 20 L, **vide** (rupture d'ENT-6.2) | 62 |

**Vue de près** (clic sur une travée) : la travée seule, de face, étages du dessus en transparence ; le **tiroir et sa
marchandise côté allée** ; l'**étiquette d'emplacement sur la lisse basse** : adresse (`A-T03-N1`), désignation et lot, **code à 2
chiffres en gros**. **Le code ne se lit que dans la vue de près** (choix validé : il faut « aller » à l'emplacement). Le fût cabossé
se voit nettement (enfoncement sombre, sans étiquette). « ← Retour à l'allée ».

**Dialogue du terminal** (texte toujours affiché ; son selon le réglage de l'enseignant, comme ENT-6.6) :

| # | Le terminal dit | L'élève répond | Suite |
|---|---|---|---|
| 1 | « Côté A, travée 01, niveau 1. Code de contrôle ? » | 36 | « Eau minérale, casier de douze bouteilles. Prends 3. » → 3 → « Compris : 3. Pose tes casiers. » |
| 2 | « Côté A, travée 02… » | 24 | « Pelforth Blonde, vingt litres. Prends 2. » → 2 |
| 3 | « Côté A, travée 03… » | 49 | « Affligem Blonde, vingt litres, lot S18. Prends 2. » → **« Abîmé »** → « Abîmé : combien ? » → 1 → « Compris : 1 abîmé. Prends 1. » → 1 |
| 4 | *(ajoutée par le terminal après l'exception)* « Côté B, travée 03… » | 83 | « Affligem Blonde, vingt litres, lot S24. Prends 1. » → 1 |
| 5 | « Côté A, travée 04… » | 17 | « Heineken, trente litres. Prends 6. » → 6 |
| fin | « Commande terminée : La Cabane à Malo. Filme et étiquette tes palettes. » | | étape 2 |

Règles du terminal :
- **Code faux** : « Code faux. Vérifie l'emplacement. » ; redemande ; **trace** (non notée, comptée dans le bilan non noté).
- **Quantité** : moins que demandé **sans mot** → refusé (« Tu dois prendre 2. Si tu ne peux pas, dis Manquant, Abîmé ou
  Emplacement vide. ») ; plus que demandé → refusé (« Trop. Prends 2. ») ; la quantité exacte est acceptée **même si l'élève prend
  le fût cabossé** (c'est le piège : jalon 3 faux, ligne 4 jamais ajoutée).
- **Mots** : **Répète · Manquant · Abîmé · Emplacement vide** (décision 51). Manquant / Abîmé → « combien ? » (1 à la quantité
  demandée) → « Compris : n abîmé (manquant). Prends reste. » Emplacement vide → « Compris : emplacement vide. », la ligne passe à 0.
  **Toute exception** sur la ligne 3 ajoute la ligne de remplacement (B-T03, S24, quantité = celle signalée) ; « Manquant » ou
  « Emplacement vide » restent **faux au jalon 3** (le fût est là, il est inutilisable). Une exception sur une autre ligne : la ligne
  est faite incomplète, pas de remplacement.
- Pas de retour sur une ligne validée. Le fût abîmé **reste dans le tiroir** (décision 50 : aucun geste « zone litiges »).
- **Couleurs du terminal** (charte) : écran sombre neutre, phrases en gris clair, réponses de l'élève en ambre ; **les refus
  (code faux, trop, quantité manquante, chiffres seulement) en texte rouge sans aplat** ; **aucun vert** sur le terminal (ni texte, ni
  bouton « Valider », ni voyant) : le vert ne dit que « juste » (remarque de Tristan, 05/10).

**Montage, après chaque ligne** : « Où poses-tu les 2 fûts Pelforth Blonde 20 L ? » → **Palette 1 · Palette 2 · « À côté, je le
pose après »** (décision 47). **Une ligne = une seule destination** (choix validé). Le terminal donne la ligne suivante une fois
la marchandise posée.

### Étape 2 — Finir les palettes (≈ 10 min, jalons 6 à 10)

- Les objets « à côté » se posent maintenant : clic sur l'objet, puis sur une palette.
- **Règle de pose (construite)** : une palette client a **6 cases** (3 × 2, une par fût de 39,5 cm). Un objet va d'abord sur une
  **case vide**. S'il n'y en a plus : un **fût** va sur un **casier** s'il y en a un au sommet d'une case (c'est la faute que le
  critère 6 doit voir), sinon sur un fût (deuxième couche, critère 7) ; un **casier** va sur un fût s'il y en a un au sommet, sinon sur
  un casier. Entre plusieurs cases possibles, la plus basse. Rien n'est jamais refusé.
- **Film étirable** (tours) et **étiquettes d'expédition** (avant, arrière, gauche, droite, dessus) **pour chaque palette**, comme
  ENT-5.6. Étiquette (affichée) : « La Cabane à Malo — Villers-sur-Mer · Tournée de la côte · vendredi 18 juin ».
- « Vérifier ma préparation » (actif quand la commande est terminée et que rien n'est « à côté ») → **bilan d'entraînement** : une
  ligne par jalon, ✓ / ✗ et **le nom du critère seulement** ; les critères 6 à 10 affichés « non jugé » tant que les 5 lignes ne sont
  pas justes. On peut corriger film, étiquettes et objets posés puis revérifier ; les lignes du terminal ne se refont pas.
- **« Ce que le terminal sait de toi »** (non noté, décision 46) : lignes préparées, durée, codes faux, lignes par heure ; une phrase :
  « Chaque réponse au terminal est enregistrée avec son heure. C'est ainsi que l'entreprise mesure la productivité des préparateurs. »
- **Pour réfléchir** (à l'écran, réponse libre non notée) : « Le terminal t'a donné les lignes une par une. Qu'est-ce que tu y as
  gagné, et qu'est-ce que tu y as perdu, pour faire ta palette ? (L'INRS signale que les préparateurs guidés à la voix ne peuvent plus
  anticiper leur palette.) »
- **Fin** — message de Nadia (texte proposé), quand les 10 jalons sont justes : « Parfait, {prénom}. Les deux palettes partent demain
  6 h avec Lucas. Le fût cabossé, je le passe en casse : sinon, demain, le stock mentirait. Nadia » (lien avec ENT-6.6 : une casse non
  déclarée est un écart).

**Règles** (bouton « Les règles ▾ », 5 lignes) : 1. Palette client **1,20 × 0,80** : **6 fûts au plus**, une seule couche (sur une
palette de stock, il y en a 8 : ce n'est pas la même palette). 2. **Jamais un fût sur un casier** ; les casiers se posent sur les fûts
ou à une place libre. 3. Un fût abîmé ne part jamais chez le client : **signale-le au terminal avec le bon mot**. 4. Film : **3 à 5
tours**. 5. Étiquettes : **deux côtés opposés + le dessus**.

Mots cliquables : préparation vocale, terminal vocal, code détrompeur, emplacement, picking, réserve, tiroir coulissant, portique à
fûts, palette client, transpalette à ciseaux, FIFO, lot, film étirable, étiquette d'expédition.

## 5. Jalons / notation (10)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1 | Ligne 1 : **3 casiers d'eau**, sans exception | terminal | aucun |
| 2 | Ligne 2 : **2 Pelforth**, sans exception | idem | |
| 3 | Ligne 3 : exception **« Abîmé », 1**, puis **1 fût pris** (le fût cabossé n'est pas sur une palette) | idem | « Manquant » ou « Emplacement vide » = faux ; prendre 2 sans rien dire = faux |
| 4 | Ligne 4 : **1 Affligem S24** pris | idem | ligne absente (aucune exception en ligne 3) = faux |
| 5 | Ligne 5 : **6 Heineken 30 L**, sans exception | idem | |
| 6 | **Aucun fût posé sur un casier** | palettes | jugé seulement si 1 à 5 justes |
| 7 | **6 fûts au plus** sur chaque palette | idem | idem |
| 8 | **Film : 3 à 5 tours** sur chaque palette | idem | idem |
| 9 | **Étiquettes : 2 côtés opposés + dessus** sur chaque palette | idem | idem |
| 10 | **Deux palettes** utilisées, rien « à côté » | idem | idem |

**Aucun jalon par inaction** : une palette vide respecte « aucun fût sur un casier » et « 6 fûts au plus » → **les jalons 6 à 10 ne
comptent que si les jalons 1 à 5 sont justes** (décision 50, même règle qu'ENT-5.6). Code faux, durée et lignes par heure : **non
notés**. Attendu de référence (un montage juste parmi d'autres) : Palette 1 = 6 Heineken ; Palette 2 = 2 Pelforth + 2 Affligem, puis
les 3 casiers (2 aux cases libres, 1 sur un fût). Les jalons jugent les **règles**, pas cet attendu. Valeurs attendues **calculées**
depuis les données, jamais recopiées ; dans les tests, écrites à la main.

## 6. Contenu

`contenus/france-boissons-ent67.js` : écran matériel, plan de picking (8 emplacements, contenus, codes, fût abîmé), lignes du terminal
dans l'ordre du parcours, ligne de remplacement (déclenchée par une exception sur la ligne 3), palettes client, règles, étiquette,
messages, lexique. Univers dans `contenus/france-boissons.js` (Nadia, références, commande de Malo **reprise d'ENT-6.2** : ne pas la
redéclarer si elle peut être partagée). Dessins : `contenus/images/france-boissons/`.

## 7. Demandes au moteur

1. **Terminal vocal** (vue nouvelle d'ENT-6.6, §7.2 de son brief) — **ajouts pour la préparation** :
   - ligne de préparation = emplacement → code → « Prends n » → quantité confirmée ; refus « moins sans mot » et « plus » ;
   - **mots d'exception** déclarés par le contenu (Répète, Manquant, Abîmé, Emplacement vide) avec « combien ? » ;
   - **ligne de remplacement** déclarée par le contenu et insérée après la ligne qui l'a déclenchée ;
   - **pause « pose »** : la ligne suivante attend que la marchandise soit posée (§7.3) ;
   - **journal horodaté** (réponses, codes faux) → bilan « Ce que le terminal sait de toi » (non noté) ;
   - **couleurs** : neutre, refus en rouge texte, aucun vert (§4).
2. **Plan d'entrepôt, mode préparation (ENT-5.6) : rendu 3D isométrique d'une allée de picking** (même famille de dessin que le
   mode stockage de masse) : racks avec **tiroir coulissant en N1** (fûts debout ou casiers), N2-N3 sans fûts (réserve au sol, zone de masse) ;
   côté opposé en transparence ; survol = volume de la travée en vert translucide ; clic sur la travée ou l'adresse au sol ;
   **vue de près** avec étiquette de lisse (adresse, désignation, lot, **code**) ; **état « abîmé »** d'un fût déclaré par le contenu
   (dessin cabossé) ; emplacement vide ; silhouette du préparateur. **Sans** bon de préparation affiché ni parcours dessiné quand le
   terminal guide.
3. **Montage par cases choisi par l'élève** (nouveau, diffère d'ENT-5.6 où le montage suit l'ordre de prélèvement, vue de face) :
   **plusieurs palettes client** (ici 2, 1,20 × 0,80) de **6 cases**, règle de pose du §4 étape 2 ; destination
   par ligne Palette 1 / Palette 2 / « À côté » ; pose différée des objets « à côté » ; dessin 3D iso (fûts, casiers, 2e couche
   visible) ; état lu par les jalons (fût sur casier, nombre de fûts par palette).
4. **Film et étiquettes d'ENT-5.6 pour plusieurs palettes**, et contenu de l'étiquette déclaré par le contenu.
5. **Écran « matériel du poste »** : la brique d'ENT-6.5 / 6.6.

Ce que la séance réutilise tel quel : messages d'accueil et de fin, mots cliquables, encadrés, réglage du son par l'enseignant (6.6).
**Ordre** : terminal vocal (ENT-6.6) → ajouts préparation → rendu iso du mode préparation → montage par cases → séance. Un seul chantier
moteur à la fois.

## 8. Tests attendus

Bloc `france-boissons` (cas préfixés « ENT-6.7 ») : parcours juste → **10 / 10** et message de fin ; **inaction 0 / 10** ; codes
36 · 24 · 49 · 83 · 17 acceptés, code faux → redemandé, **aucun jalon perdu**, trace présente ; ligne 3 « 2 » sans mot → jalon 3 faux,
**pas de ligne 4**, jalon 4 faux, jalons 6-10 « non jugé » (3 / 10) ; ligne 3 « Manquant 1 » → ligne 4 ajoutée, jalon 3 faux ; ligne 3
« Emplacement vide » → ligne 4 de 2 fûts, jalon 3 faux ; « 1 » sans mot → refusé ; « 3 » → refusé ; casiers posés en premier sur une
palette puis 4 fûts sur la même → aucun fût sur casier (cases libres) ; 3 casiers d'abord + 6 Heineken sur la même → critère 6 faux (3 fûts sur les casiers) ; 8 fûts
sur une palette → critère 7 faux ; film 2 tours sur une palette → critère 8 faux ; étiquettes sur deux côtés voisins → critère 9 faux ;
tout sur une palette (autre vide) → critère 10 faux ; « Vérifier » inactif tant qu'un objet est « à côté » ; **le code n'est pas dans
le DOM de l'allée** (seulement dans la vue de près) ; son coupé par défaut ; aucune requête hors du domaine ; aucun aplat vert dans le
terminal ; sabotage par jalon.

## 9. Supports

- Trame courte (contexte ; lexique ; le dialogue vocal en 4 temps ; les règles de la palette client ; pourquoi 6 fûts : 3 × 39,5 cm ×
  2) : Cowork, **après validation à l'écran**. La trame dit **le réel** (préparation vocale et tiroirs coulissants vérifiés chez France
  Boissons ; 8 fûts par palette mère et 6 vers les clients vérifiés ; 8 fûts sur rétention = règle de l'exercice ; plan et codes
  construits ; chiffres des fournisseurs à présenter comme tels).
- Corrigé `contenus/corriges/ENT-6.7.js` : lignes, exception, montage de référence ; calculé.
- **Question « Pour réfléchir » de la trame** (règle 32, valeur par défaut) : « Tu as signalé un fût abîmé. Que se serait-il passé
  vendredi chez Malo si tu l'avais posé sur la palette ? »

## 10. Critères de validation par Tristan

À l'écran (1366 × 768) : la séance se joue comme la maquette ; le code ne se lit que de près ; le fût cabossé se voit sans aide ; le
terminal se comprend **sans son** et ne montre aucun vert ; « Abîmé 1 » fait apparaître la ligne S24 ; un élève qui pose les casiers en
premier sur une palette sans place libre voit le critère « aucun casier sous un fût » tomber ; la séance tient en 45 min.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [x] Date, plan (1 allée, 2 côtés, 8 travées), fût abîmé laissé en place, 10 jalons (Tristan, 05/10, décision 50 confirmée).
- [x] Maquette validée (Tristan, 05/10) avec ses trois choix : code lisible de près seulement ; une ligne = une destination ; ligne
  de remplacement aussi après « Manquant » / « Emplacement vide » (jalon 3 faux).
- [x] Terminal : aucun vert, refus en rouge texte (Tristan, 05/10).
- [ ] Textes de Nadia (accueil, fin) : proposés, à relire à l'écran.
- [ ] Palette client en **bois** (construit : la source ne dit pas la matière) ; zone de préparation devant le **quai 14** (construit).
- [x] Dessin du portique à fûts : fourni par Cowork le 06/10 (`materiel-portique-futs.svg`).
- [ ] Les objets posés sur une palette peuvent-ils être repris avant « Vérifier » ? (défaut : oui, « ↶ Reposer le dernier » par palette, comme ENT-5.6)

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
