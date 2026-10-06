# Brief de chantier — MOTEUR : la vue « animation à questions » et le kit de dessin isométrique

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/EN-COURS.md, puis le brief docs/briefs/MOTEUR-vue-animation.md et ouvre la maquette docs/briefs/france-boissons/animation-6.5-couloir-2temps.html. Fais d'abord l'état des lieux (lecture seule) : ce qui existe déjà dans core/ pour la projection isométrique, les écrans de séance et les jalons, et si un point du brief contredit le code. Annonce la durée, découpe en lots (§9), puis enchaîne : les questions du §12 ont toutes une valeur par défaut, applique-la et note au compte rendu ce que tu as choisi.
> ```

**Statut** : livré — validé à l'écran par Tristan le 06/10/2026 (page d'essai)

> **⚠ Correctif demandé par Tristan (05/10/2026, soir, décision 52)** : la palette de rétention porte désormais **8 fûts posés à
> plat en quinconce** (rangées de 3, 2 et 3, une seule couche) et mesure **1,30 × 1,30 m** (format du commerce). À changer dans le
> kit iso : **8 fûts par défaut** (et moins), rayon du fût ≈ 0,152 de la largeur de la palette (39,5 cm pour 1,30 m), entraxe
> 0,304 dans une rangée, 0,263 entre rangées ; les fûts manquants d'une palette incomplète sont **ceux de devant** (on les voit).
> Hauteur d'un fût abaissée (0,36 au lieu de 0,46 dans la maquette) pour garder les proportions. Maquette de référence mise à jour :
> `docs/briefs/france-boissons/animation-6.5-couloir-2temps.html` (constantes `KR`, `KH`, `QUINC`). Briefs 6.4, 6.5, 6.6 recalculés.
**Date du brief** : 05/10/2026
**Conversation d'origine** : Cowork (Opus), « tour des scénarios : où une animation 3D iso aiderait-elle ? » (05/10/2026, soir).
**Modèle** : **Opus** (vue nouvelle du moteur).
**Dépend de** : rien. **Un seul chantier moteur à la fois** (`docs/EN-COURS.md`) : celui-ci passe **avant** le mode
« stockage de masse » du Plan d'entrepôt (ENT-6.5 §7.1), parce qu'il crée le kit de dessin iso que ce mode réutilisera.
**Durée estimée par Cowork** : **5 à 7 h** en trois lots livrables (§9). Ce qui prend le temps : extraire proprement le kit de
dessin de la maquette (sans son état global), le lecteur de script (pause, revoir, vitesse, mouvement réduit), et les tests de
la première réponse gardée (sabotages). L'écriture du contenu 6.5 est courte.
**Débloque** : **ENT-6.5** (étape 1, « Comprendre le FIFO »). Plus tard, au fil des séances (§10 bis) : sécurité au quai
(ENT-5.4, 6.4, 4.1), adresse d'un emplacement (ENT-5.5), palette mixte (ENT-5.6), découverte du matériel (Prepalog), zones de
l'entrepôt (QUI-6), chemin de préparation (ENT-1.2, 6.7).

## 1. Pourquoi ce chantier

Tour des scénarios du 05/10 (Cowork, avec Tristan) : une animation aide quand ce qu'il faut comprendre est **un mouvement
physique dont la conséquence se voit**, et que la salle 112 ne peut pas le montrer (danger au quai, palette qui s'affaisse,
palette bloquée au fond d'un couloir). L'animation FIFO d'ENT-6.5 a été jugée **« parfait »** par Tristan. Au moins six autres
séances en tireraient profit.

**Décisions de Tristan (05/10/2026)** :

1. **Une vue du moteur**, pas une page par séance.
2. **« Kit iso qui grandit »** : le moteur fournit le **lecteur** (arrêt, questions, revoir, première réponse gardée, « À
   retenir ») **et un kit de dessin isométrique**, d'abord limité aux objets d'ENT-6.5. **La séance décrit sa scène en
   données** (décor, objets, places, étapes du script, bulles, questions). Chaque nouvelle animation qui a besoin d'un objet
   absent (camion, transpalette, rack…) l'**ajoute au kit**, dans `core/`, par une demande au moteur de son brief. **Jamais de
   code de dessin dans `contenus/`.**
3. **Où l'élève la trouve** : dans une séance Simulog, **un écran à part du menu** (comme la fiche ou le planning), utilisable
   par n'importe quelle entreprise ; **le même lecteur sert aussi une activité Prepalog sans scénario** (découverte du
   matériel, zones de l'entrepôt) — lot 3.
4. Ce n'est **pas** un retour sur la décision « pas de 3D » du 02/10 : elle écartait **WebGL** (postes anciens). Ici, tout est
   du **SVG en 2D dessiné en perspective isométrique** : aucune bibliothèque, aucune caméra, rien dans `vendor/`.

**Principe pédagogique à tenir (alerte 23 du projet)** : une animation vient **avant** la décision, jamais **pendant**. Une
aide posée dans l'écran de travail est prise par réflexe. Le moteur n'a rien à interdire ici : c'est la séance qui place
l'écran d'animation **avant** l'écran de travail dans son déroulé.

## 2. La référence : la maquette d'ENT-6.5

`docs/briefs/france-boissons/animation-6.5-couloir-2temps.html` (21 488 octets, SHA-256
`257f482f80afc0caa6d0196abf79168e4b4edf87c2574e20ccf26ada2090c5a1`, un seul fichier, aucune requête, double-clic).
**Elle fait foi pour le rendu et l'interaction, pas pour le code** (état global, couleurs en dur, scénario écrit en dur dans
deux fonctions `partie1` / `partie2`, réponses gardées en mémoire seulement). Le contenu d'ENT-6.5 la **reproduit telle
quelle** à travers la vue : c'est le premier critère de validation (§13).

Ce qu'on y trouve et que le moteur doit savoir faire :

- **Projection** : `P(x, y, z)` (isométrique 30°, unité = une place de palette), `face`, `boite` (trois faces visibles),
  cadrage automatique du `viewBox` sur le décor.
- **Objets** : fût (cylindre métal, cerclages, bonde), **palette de rétention noire** (pieds, caillebotis, nervures) portant
  **8 fûts à plat en quinconce** (~~4 fûts~~, décision 52), **étiquette de lot** au sommet (couleur par lot), étiquette au sol (« posée en 1re »), **pastille « ! »**
  d'alerte, **chariot élévateur frontal** (fourches, mât, tablier, caisse orange, contrepoids, cariste en silhouette **sans
  visage**, protège-conducteur), charge portée par les fourches.
- **Décor** : sol, mur du fond, **couloirs de stockage de masse** (places en pointillé), **panneau de couloir** sur le mur
  (M01, M02), **flèches au sol** verte « ENTRÉE » / rouge « SORTIE », mots au sol (« fond / milieu / devant »,
  « ALLÉE — le chariot entre et sort par ici »).
- **Gestes du chariot** : **poser** une palette à une place (entre par l'allée, avance, descend les fourches, ressort) et
  **reprendre** une palette (entre, lève, ressort avec la charge, la palette disparaît).
- **Bulles fléchées** (rouge = problème, vert = bonne façon, encre = neutre), posées par rapport à un **point de la scène**,
  qui apparaissent en fondu et s'effacent par leur nom.
- **Légende numérotée** au-dessus de la scène (pastille du numéro + phrase) et **points de progression** (un par légende).
- **Commandes** : ▶ Lire, ⏸ Pause, ⟲ Revoir la partie ; « Partie 1 sur 2 — l'erreur ».
- **Questions** : panneau par-dessus le bas de la scène, 4 choix (A-D) en deux colonnes, « Valider ma réponse » (inactif sans
  choix), « ⟲ Revoir l'animation » **avant** de répondre, après validation : bonne réponse marquée, réponse fausse marquée,
  « Oui. / Non. » + explication, bouton de suite (« ▶ Voir la bonne façon »). Après la dernière : « À retenir » dans la légende.
- **Vitesse** : `VITESSE = 0.8` (Tristan, 05/10) ; `prefers-reduced-motion` : déplacements instantanés.

## 3. L'écran

### 3.1 Dans une séance Simulog

- **Une entrée du menu** (libellé du contenu, ex. « Comprendre le FIFO »), rangée dans le groupe **Mon poste** ; une tuile
  d'accueil si la séance en déclare une. Plusieurs animations dans une séance : une entrée chacune (rare ; à permettre).
- De haut en bas : la **légende** (numéro + phrase), la **scène** (à la plus grande taille qui tient **sans défilement** à
  1366 × 768 et 1280 × 720, proportions gardées), les **commandes** et la **progression**. Le panneau de question se pose
  **par-dessus le bas de la scène**, comme dans la maquette.
- Le bandeau de l'entreprise et le menu restent ceux de la séance (rien de nouveau).

### 3.2 Le déroulé, élève

1. L'écran s'ouvre sur la **partie 1**, qui démarre seule (comme la maquette) ; **⏸ Pause** et **⟲ Revoir la partie** à tout
   moment.
2. À l'**arrêt** déclaré, la **question** s'ouvre. L'élève peut **revoir la partie** avant de répondre (le panneau se ferme,
   la partie rejoue, la question revient).
3. **Valider** : la **première réponse** est rangée dans sa base (§5), le panneau montre la correction et l'explication, puis
   le bouton de suite lance la partie suivante.
4. Après la dernière question : « **À retenir** » (texte du contenu) dans la légende, et un bouton « ⟲ Tout revoir ».
5. **Revenir plus tard** sur l'écran : l'élève retrouve l'animation au début ; les questions déjà répondues montrent sa
   **première réponse** et la correction (il peut rejouer, répondre de nouveau pour lui-même ; **rien ne change dans sa base**).
6. **Pas de saut en avant** : une partie s'ouvre seulement quand la question de la précédente a été validée une fois.

### 3.3 Enseignant et page d'essai

L'enseignant **navigue librement** (une liste « Partie 1 · Question 1 · Partie 2 · Question 2 » cliquable) et voit la bonne
réponse **marquée** dès l'ouverture de la question (comme le reste du site : l'outil est formatif). Même règle que la
visite (`MOTEUR-modes-visite.md` §3.2).

### 3.4 Hors Simulog (lot 3)

Une activité Prepalog sans scénario (rubrique au choix du contenu, ex. `DEC`, `QUI`) appelle le même lecteur :
`rendre(hote, ctx)` → `creerAnimation(ANIMATION).rendre(hote, ctx)`. Pas de bandeau d'entreprise ni de menu. **Note** :
une question = un point, ramené sur 20 comme les autres activités à score automatique (`bareme` = nombre de questions).

## 4. Ce que la séance déclare

Rien d'une entreprise dans `core/`. Les noms de champs ci-dessous sont **indicatifs** : Claude Code les ajuste à l'état des
lieux et met la version définitive dans `activites/FICHE-SEANCE.md`.

```js
animation: {                                   // dans creerEntreprise ; ou passé à creerAnimation (lot 3)
  id: 'fb-fifo',                               // clé de l'état dans la base de l'élève, jamais modifiée
  libelle: 'Comprendre le FIFO',               // entrée du menu
  vitesse: 0.8,                                // facultatif, 1 par défaut
  alt: 'Animation : un chariot range et reprend des palettes de fûts dans deux couloirs de stockage de masse',
  scene: {
    decor: [                                   // objets fixes, dessinés une fois
      { type: 'sol', de: [-0.6, -0.5], a: [3.6, 4.95] },
      { type: 'mur', y: -0.5, de: -0.6, a: 3.6, hauteur: 1.1 },
      { type: 'couloirMasse', id: 'M01', x: 0,   profondeur: 3, panneau: 'M01', fleches: true },
      { type: 'couloirMasse', id: 'M02', x: 1.7, profondeur: 3, panneau: 'M02', fleches: true },
      { type: 'texteSol', texte: 'ALLÉE — le chariot entre et sort par ici', en: [1.9, 4.6], rotation: 30 },
      …
    ],
    lots: { S20: { couleur: 'jaune' }, S24: { couleur: 'bleu' } },   // teintes du kit, pas de code couleur libre (§7)
    acteurs: { chariot: { type: 'chariotFrontal' } },
  },
  parties: [
    {
      titre: 'Partie 1 sur 2 — l’erreur',
      depart: { palettes: [] },                // état de départ de la partie (palettes déjà en place, places nommées)
      pas: [
        { legende: 'Le chariot entre <u>par l’allée</u>. Il range le lot <b>S20</b> en commençant <b>par le fond</b>.' },
        { attendre: 1200 },
        { nouvelle: 'a', charge: 'futs4', lot: 'S20' },
        { geste: 'poser', acteur: 'chariot', objet: 'a', place: 'M01.fond' },
        { etiquette: 'a', texte: 'posée en 1re' },
        { bulle: 'fond', lignes: ['Au fond d’abord :', 'sinon on ne pourrait', 'plus y aller ensuite'],
          vers: 'M01.fond', decalage: [-330, -150], ton: 'neutre' },
        { attendre: 1800 }, { effacer: ['fond'] },
        …
        { geste: 'reprendre', acteur: 'chariot', objet: 'n' },
        { alerte: ['a', 'b'] },
        { legende: 'Le lot <b>S20, le plus ancien</b>, reste au fond. <b>Arrête-toi et réfléchis.</b>' },
        { attendre: 1200 },
      ],
      question: {
        id: 'q1', titre: 'Question 1 — à toi de réfléchir',
        enonce: 'Pourquoi le lot S20, le plus ancien, ne sort-il pas ?',
        choix: ['Le lot S20 est trop lourd pour le chariot.',
                'Le chariot entre par l’allée : il ne peut prendre que la palette de devant.',
                'Le cariste a oublié le lot S20.', 'Les fûts du lot S20 sont abîmés.'],
        juste: 1,                              // rang dans l'ordre DÉCLARÉ
        explication: 'Le chariot n’entre que par l’allée. …',
        suite: '▶ Voir la bonne façon',
      },
    },
    { titre: 'Partie 2 sur 2 — la bonne façon', depart: { palettes: [ … ] }, pas: [ … ], question: { id: 'q2', … } },
  ],
  aRetenir: 'Le chariot entre par l’allée : la <b>dernière palette posée sort en premier</b>. Donc <b>un seul lot par couloir</b>.',
}
```

Règles du format :

- **Places nommées, pas de coordonnées dans le script** : un couloir de masse déclare ses places (`M01.fond`, `M01.milieu`,
  `M01.devant`, ou `M01.1` à `M01.n` à partir du fond) ; un geste vise une **place**. Les coordonnées n'apparaissent que dans
  le **décor** (et dans `vers`/`decalage` d'une bulle, qui peut aussi viser une place ou un objet). Même principe que le
  parcours de la visite (« ancres, pas de pixels »).
- **Pas du script** (fermés, connus du moteur) : `legende`, `attendre` (ms, divisé par la vitesse), `nouvelle` (crée une
  charge invisible), `placer` (sans mouvement), `geste` (`poser`, `reprendre` pour le chariot frontal ; d'autres gestes
  arriveront avec d'autres acteurs), `etiquette` (texte au sol près d'un objet, ton facultatif), `alerte` / `finAlerte`
  (pastille « ! »), `bulle`, `effacer`. **Un pas inconnu, un objet ou une place qui n'existe pas empêche la séance de se
  charger** avec un message clair (comme un nom de menu inconnu), au lieu d'une animation qui s'arrête au milieu en classe.
- **La légende numérotée** se numérote toute seule (1, 2, 3… sur toutes les parties) ; le nombre de points de progression
  est calculé.
- **Une partie sans `question`** est permise (la suivante s'enchaîne par un bouton « Suite ▶ ») ; une animation sans aucune
  question aussi (écran de découverte non noté).

## 5. L'état dans la base de l'élève (cloisonné par séance)

`db.animations[<animation.id>] = { reponses: { q1: { premiere: 1, juste: true, quand }, q2: … }, ordres: { q1: [2,0,3,1], … },
partie: 1 }`

- **`premiere`** = rang **dans l'ordre déclaré** du premier choix validé ; **écrit une seule fois**, jamais réécrit (ni par une
  seconde réponse, ni par « Tout revoir »). C'est ce que lisent les jalons (décision de Tristan, 05/10 : « les deux questions
  comptent, sur la 1re réponse »).
- **`ordres`** = ordre d'affichage des choix, **tiré par élève à la première ouverture de la question et rangé** (le même à
  chaque retour et après rechargement). La bonne réponse ne doit pas être toujours à la même place.
- **`partie`** = la plus loin atteinte (pour le « pas de saut en avant »).
- Deux séances qui déclarent chacune une animation n'ont **rien en commun** (clé = `id` de l'animation, dans la base de la
  séance).

## 6. Jalons

Une aide fournie par le moteur, du type `reponseAnimation(db, 'fb-fifo', 'q1')` → `{ repondu, premiereJuste }`, et un
raccourci `etapesAnimation(ANIMATION)` qui rend **un jalon par question** (« Question 1 de l'animation : première réponse
juste »), à composer avec les étapes propres de la séance (comme `etapesEntrepot`).

- **Ne pas accuser avant que l'élève ait commencé** : question pas encore répondue = jalon **non franchi**, affiché comme
  « à faire », jamais comme une erreur.
- **Ne pas récompenser l'inaction** : jamais répondu = faux au bilan.
- Une seconde réponse juste après une première fausse **ne franchit pas** le jalon.

## 7. Charte

- **L'interface** (légende, commandes, panneau de question, bulles) prend les **variables** de `styles/base.css` (`--panneau`,
  `--encre`, `--ardoise`, rouge du faux…), donc suit le thème clair et sombre. Aucune couleur en dur dans l'interface.
  Boutons de choix : **pas d'aplat vert** (le vert plein ne dit que « juste ») ; bonne réponse = bordure et texte verts,
  réponse fausse = bordure et texte rouges, comme la maquette.
- **La scène** est une **image** : sol, métal, palettes noires, chariot orange gardent leurs teintes, dans un cadre qui a son
  propre fond clair, en clair comme en sombre (comme une photo ; ce n'est pas un « aplat sur un écran d'entreprise »).
- **La signalétique de la scène** (panneaux de couloir verts, flèche verte ENTRÉE, flèche rouge SORTIE) garde les couleurs
  validées par Tristan sur la maquette (« parfait », 05/10). C'est de la signalisation au sol dessinée, pas un verdict de
  l'interface. **Exception à noter dans `docs/decisions.md`** (voir §12, question 1).
- **Couleurs de lot** : une **petite palette du kit** (jaune, bleu, gris « vides », ambre…), choisie par nom dans le contenu,
  contrastes du texte de l'étiquette vérifiés (≥ 4,5).
- **Cariste en silhouette, sans visage** (règle du projet : pas de visage de salarié).
- Contrastes WCAG ≥ 4,5 pour tout texte, bulles comprises.

## 8. Accessibilité et robustesse

- `prefers-reduced-motion` : déplacements instantanés, mais **les attentes et les bulles restent** (sinon la partie défile
  en une seconde et l'élève ne lit rien).
- La légende est annoncée (`aria-live="polite"`) ; la scène a son `alt` (texte du contenu) ; choix au clavier (Tab, Entrée),
  focus conservé quand l'interface se redessine (au clavier seulement).
- **Quitter l'écran pendant une partie** (clic sur une autre entrée du menu) arrête proprement l'animation (pas de boucle
  `requestAnimationFrame` qui continue dans le vide ; le « jeton » de la maquette est la bonne idée).
- **Performance** : le décor est dessiné une fois ; seule la couche des objets mobiles se redessine. Viser une animation
  fluide sur un **poste ancien** (le vrai risque du chantier, §13).

## 9. Fichiers attendus (indicatif) et lots

| Lot | Contenu | Livrable essayable |
|---|---|---|
| **1. Kit iso** | `core/iso.js` (ou `core/types/iso/`) : projection, `face`, `boite`, tri de profondeur, cadrage auto ; objets d'ENT-6.5 : sol, mur, couloir de masse et ses places, panneau, flèches et textes au sol, fût, palette de rétention 4 fûts (et moins), étiquette de lot, pastille « ! », chariot frontal (fourches à hauteur variable, charge portée). **Le mode « stockage de masse » d'ENT-6.5 §7.1 réutilisera ce kit** : le concevoir pour deux usages. | page d'essai qui dessine le décor 6.5 en clair et sombre |
| **2. Lecteur** | `core/types/animation.js` : lecture du script, pause, revoir, vitesse, mouvement réduit, bulles, légende, progression, questions (ordre tiré et rangé, première réponse gardée), « À retenir », navigation enseignant, écran de menu dans `creerEntreprise`, `reponseAnimation` / `etapesAnimation`, vérification du contenu au chargement. Contenu d'essai `contenus/animation-essai.js` = **la maquette 6.5 reproduite**. Page `outils/essai-animation.html`. | la maquette rejouée par la vue, à comparer côte à côte |
| **3. Hors Simulog** | `creerAnimation` pour une activité Prepalog, score = premières réponses justes. Aucune activité livrée : seulement la page d'essai. | page d'essai sans bandeau d'entreprise |

Documentation : section « Vue animation à questions » dans `activites/FICHE-SEANCE.md` (champs définitifs, pas du script,
objets du kit, comment demander un objet nouveau).

## 10. Tests attendus (bloc nouveau `animation`, une ligne dans `BLOCS`)

Ceux qui valent leur prix sont ceux de la **base** (première réponse, ordre, cloisonnement) : un défaut là fausse une note
sans que personne ne le voie. Le **rendu** se juge à l'écran (Tristan et le pilotage de l'écran), pas par un test.

- **Première réponse gardée** : faux puis juste → jalon non franchi ; juste puis faux → franchi. *Sabotage* : garder la
  dernière réponse → le test tombe.
- **Ordre des choix** : tiré par élève, identique après rechargement ; `juste` est lu dans l'ordre **déclaré**. *Sabotage* :
  comparer au rang affiché → le test tombe (avec un ordre tiré qui n'est pas l'identité, écrit à la main dans le test).
- **Pas d'accusation avant de commencer** : séance neuve → jalons « à faire », pas « faux ». **Inaction** : rien répondu au
  bilan → faux.
- **Pas de saut en avant** (élève) ; navigation libre (enseignant).
- **Contenu fautif refusé au chargement** : pas inconnu, place inexistante, objet non créé, `juste` hors des choix.
- **Cloisonnement** : deux séances avec une animation d'`id` différent, réponses indépendantes.
- **Mouvement réduit** : avec `reducedMotion: 'reduce'`, la partie 1 atteint sa question (et les bulles apparaissent).
- **Quitter l'écran** pendant une partie : aucune erreur de console, plus aucun redessin ensuite.
- Le test existant « aucune adresse extérieure » couvre déjà le reste.

## 10 bis. Les animations suivantes (pour mémoire, rien à faire dans ce chantier)

Repérées le 05/10 ; chacune arrivera par **son** brief de séance, avec en §7 « objets à ajouter au kit » :

| Séance(s) | Animation | Objets nouveaux pour le kit |
|---|---|---|
| ENT-5.4, 6.4, 4.1 | sécurité au quai : camion sans cale qui avance, niveleur qui tombe ; puis la bonne façon | quai, porte, niveleur, camion (semi, porteur), cale, feu |
| ENT-5.5 | l'adresse `A1-T03-N2-E1` décodée pas à pas | rack (travées, niveaux, lisses), étiquettes d'adresse |
| ENT-5.6 | palette mixte : le lourd sur le léger, la palette qui s'affaisse | cartons de tailles et masses variées, palette bois |
| Prepalog (découverte) | transpalette, gerbeur, chariot frontal : jusqu'où chacun monte | transpalette, gerbeur |
| QUI-6, DEC-1 | les zones de l'entrepôt qui s'allument dans l'ordre du flux | zones au sol nommées |
| ENT-1.2, 6.7 | deux chemins de préparation et leurs mètres | préparateur (silhouette), compteur |

## 11. Décisions à reporter dans `docs/decisions.md` (Tristan, 05/10/2026)

- Vue « animation à questions » : vue du moteur ; **kit iso qui grandit** ; la séance décrit sa scène en données ; jamais de
  dessin dans `contenus/`.
- Écran à part dans une séance Simulog **et** lecteur réutilisable par une activité Prepalog.
- Les questions comptent sur la **première réponse** (déjà décidé pour ENT-6.5).
- Pas de WebGL : SVG en perspective isométrique.

## 12. Questions ouvertes (chacune a une valeur par défaut : l'appliquer et le dire au compte rendu)

1. **Signalétique verte de la scène** (panneaux, flèche ENTRÉE) face à la règle « le vert plein ne dit que juste ». *Défaut* :
   on la garde dans la scène (validée par Tristan sur la maquette), jamais dans l'interface ; noter l'exception.
2. **Revenir sur l'écran après la fin** : *défaut* : animation au début, questions déjà répondues montrées avec la première
   réponse et la correction.
3. **Verrou** « l'écran de travail ne s'ouvre qu'après l'animation » : *défaut* : **non** (les jalons suffisent, et un verrou
   bloque un élève qui revient d'absence). La séance place l'animation en premier dans son déroulé.
4. **Lot 3 noté ou non** : *défaut* : une question = un point, ramené sur 20 ; une animation sans question n'a pas de `bareme`.
5. **Partie 1 qui démarre seule** à l'ouverture : *défaut* : oui (comme la maquette) ; avec mouvement réduit aussi.

## 13. Critères de validation par Tristan

- **Côte à côte** avec la maquette (page d'essai) : même scène, mêmes bulles, même rythme à 0,8 ; « c'est la même ».
- Jouer en élève : répondre faux à la question 1, puis juste → le jalon 1 reste non franchi ; recharger → mêmes places des
  choix ; « Revoir l'animation » avant de répondre ; Pause ; Tout revoir.
- 1366 × 768 et 1280 × 720 : **aucun défilement** ; clair et sombre lisibles.
- **Sur un poste du lycée** : l'animation est fluide. *À faire dès maintenant, sans attendre le chantier* : ouvrir la
  maquette `animation-6.5-couloir-2temps.html` sur un poste de la salle 112. Si elle saccade, le dire avant que Claude Code
  commence (on simplifierait le dessin : moins de faces, pas de dégradé métal).

---

## Compte rendu *(rempli par Claude Code à la livraison, 05/10/2026)*

- **Fichiers créés** : `core/iso.js` (kit de dessin), `core/types/animation.js` (lecteur, vérification du contenu, état,
  `reponseAnimation`, `etapesAnimation`, `creerAnimation`), `styles/animation.css`, `contenus/animation-essai.js` (la
  maquette reproduite), `outils/essai-animation.html` + `.js` (page d'essai : Simulog ou hors Simulog, élève ou
  enseignant, vitesse, « garder mes réponses », lien vers la maquette), `outils/test/animation.mjs` (bloc `animation`).
  **Modifiés** : `core/types/entreprise.js` (écran `animation:<id>` dans « Mon poste », état `db.animations[<id>]`,
  tuile d'accueil `kpis: ['animation']`), `index.html` (une feuille de style), `outils/test.mjs` (**une ligne dans
  `BLOCS`**), `activites/FICHE-SEANCE.md` (section « Vue animation à questions » et « kit de dessin isométrique »).
- **Vérifié à l'écran** : le décor dessiné par la vue est **identique octet pour octet** à celui de la maquette (avant
  la retouche de contraste ci-dessous), et la scène à l'arrêt de la question 1 aussi ; cadre (`viewBox`) identique à
  1 px près (police). Clair et sombre : la scène garde son fond clair, l'interface suit le thème. Fluidité sur un poste
  du lycée : **non vérifiable d'ici** (critère §13, à essayer en salle 112).
- **Écarts par rapport au brief** (et pourquoi) :
  - Noms de champs définitifs (dans `FICHE-SEANCE.md`) : `allee` (sol de l'allée), `reperesProfondeur` (« fond /
    milieu / devant »), `texteSol` avec `style: 'allee'` ; une charge s'écrit `{ nouvelle: 'a', lot, futs? }` (la
    palette de rétention est la seule charge du kit, 4 fûts par défaut) au lieu de `charge: 'futs4'`. Une bulle vise
    une place ou un objet avec `hauteur` (ou un point `[x, y, z]`).
  - **Texte vert au sol plus sombre** (#0b6634) que la flèche verte (#107c41 inchangée) : #107c41 ne fait que 4,0 de
    contraste sur le sol (règle ≥ 4,5, §7). Seuls le mot ENTRÉE et l'étiquette « lot S24 seul ici » changent, à peine.
  - **Bonne réponse en `--vert`**, faux en `--rouge` : dans le moteur `--ardoise` est l'accent de l'entreprise
    (remplacé par l'encre sous une charte rouge ou verte), il ne peut pas dire « juste ».
  - **Tuile d'accueil** : l'accueil n'a pas de tuiles, seulement des compteurs ; une séance ajoute `'animation'` à
    `accueil.kpis` pour en avoir une.
  - **L'élève voit aussi la navigation** : « Partie 1 · Partie 2 🔒 » ; la partie 2 s'ouvre quand la question 1 est
    validée une fois (pas de saut en avant), ce qui permet à un élève qui revient de reprendre là où il en était.
  - « **Répondre de nouveau** » : un bouton après la correction (sa base ne change pas, le panneau le lui dit).
  - Pas de « page côte à côte » dans un `iframe` (interdit par les règles techniques) : la page d'essai ouvre la
    maquette dans un autre onglet.
- **Décisions prises en route** (valeurs par défaut du §12 appliquées, ligne dans `docs/decisions.md`) : (1) signalétique
  verte gardée dans la scène, jamais dans l'interface (exception notée) ; (2) retour sur l'écran = animation au début,
  première réponse et correction montrées ; (3) pas de verrou de l'écran de travail ; (4) hors Simulog, une question =
  un point ; (5) la partie 1 démarre seule, mouvement réduit compris.
- **Tests** : bloc `animation`, 13 cas (contrastes du kit ; contenu fautif refusé ×7 ; séance neuve « à faire » et 0 au
  bilan ; faux puis juste = non franchi ; juste puis faux = franchi, partie 2, « À retenir », « Tout revoir » ; ordre
  écrit à la main [2, 0, 3, 1] lu dans l'ordre déclaré ; ordre rangé et identique au retour ; enseignant ; cloisonnement ;
  hors Simulog ; quitter l'écran ; 1366 × 768 et 1280 × 720 sans défilement ; mouvement réduit). **Sabotages éprouvés**
  (chacun fait tomber au moins un cas) : garder la dernière réponse ; ranger le rang affiché ; accuser avant de commencer ;
  boucle qui continue après la sortie ; partie 2 ouverte d'emblée ; état non cloisonné ; enseignant qui écrit ; attentes
  supprimées en mouvement réduit (ce dernier passait au départ : le test a été renforcé, il mesure la durée).
  Suite entière : 767 / 767.
- **Commits** : `d047960` ENT-6.5 : l'animation à questions passe par un brief moteur à part (Cowork) · `71f9d01` Moteur : vue animation à questions et kit de dessin isométrique. Suite entière : **767 / 767** avant le push.
- **Reste ouvert** :
  - **Tristan** : comparer à l'écran avec la maquette (`outils/essai-animation.html`, lien « Ouvrir la maquette ») ; jouer
    en élève (faux puis juste, recharger avec « Garder mes réponses ») ; **ouvrir la maquette sur un poste de la salle 112**.
  - ENT-6.5 : déclarer son `animation` (reprendre `contenus/animation-essai.js`) et `etapesAnimation` dans ses étapes.
  - Le mode « stockage de masse » du Plan d'entrepôt (ENT-6.5 §7.1) peut maintenant réutiliser `core/iso.js`.
