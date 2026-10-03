# Brief de séance — ENT-4.4 Picard, le rush du lundi (évaluation)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-picard.md puis implémente le brief docs/briefs/ENT-4.4-picard-evaluation.md avec les seuils de temps réel provisoires (12 et 16 min) : ils seront ajustés plus tard, garde-les dans un réglage facile à changer. Annonce la durée puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§10).
> ```

**Statut** : à implémenter — **après** ENT-4.1 et `MOTEUR-tiers-temps`. **L'essai en classe ne bloque pas** (décision de
Tristan, 03/10) : construire avec les seuils provisoires (12 / 16 min), rangés dans un réglage du contenu facile à
changer ; Tristan les ajustera après l'essai, avant le jour de l'évaluation.
**Date du brief** : 03/10/2026

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-4.4 / `picard-ent44` |
| Titre | « Picard — le rush du lundi » |
| Niveau | 1re |
| Compétence | **C1.4** |
| Temps pédagogique | évaluation (coefficient 3) |
| Notation | **copie rendue** (`meta.copie: true`, `copie: meta.copie`, `noter`) |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

Comme ENT-4.1. **Construit** : nouveau fournisseur fictif (pâtisseries, plats cuisinés), transporteur fictif, les deux
jeux de données.

## 3. Objectif

L'élève réceptionne seul un camion complet, sans aide, sur des données neuves : tous les gestes d'ENT-4.1, plus **une
palette qui porte deux problèmes à la fois**. L'évaluation porte sur **ce qui a été vu en guidage** (décision de
Tristan : pas de piège « ticket propre » ni de multi-références ici).

## 4. Déroulé

Mail d'accueil court (sans conseil) ; déroulé d'ENT-4.1 (4 étapes) ; **aucune aide** (pas de chef de quai, pas de repère
P1, pas de règle des couches, total seul) ; « Revoir le BL » gardé ; **chrono qui mesure** (affiché « Temps passé »,
horloge murale) ; « Rendre ma copie » ; aucun verdict à l'écran ; en fin d'heure l'enseignant ramasse.

## 5. Un jeu tiré par élève (décision de Tristan, 03/10/2026 — remplace les deux jeux alternés)

> Décision générale : `docs/briefs/DECISION-jeu-unique-evaluations.md` (« un jeu par élève, cette règle vaut pour toutes les évaluations si c'est
> applicable »). Elle remplace les **deux jeux alternés un élève sur deux** prévus jusque-là.

**Chaque élève reçoit un camion tiré pour lui**, graine = **identifiant de l'élève** (stable : même jeu sur un autre
poste, après rechargement, après réouverture de la copie par l'enseignant ; pas de `reinitialisable`). Un absent passe
plus tard sur son propre jeu. La **structure commune est la contrainte d'équité** que le tirage respecte toujours :
6 palettes, avec exactement les six aléas ci-dessous :

| # | Aléa | Attendu |
|---|---|---|
| 1 | **manquant + cartons écrasés** sur la même palette | Réserves — deux constats, deux quantités |
| 2 | température non conforme à cœur | Refuser — température |
| 3 | produit différent (étiquette) | Refuser — produit différent |
| 4 | cartons écrasés seuls (visibles d'un côté) | Réserves — avarie |
| 5 | couche du dessus incomplète, **conforme au BL** | Accepter |
| 6 | conforme | Accepter |

Ticket : une remontée à signaler (comme ENT-4.1).
**Tirés** pour chaque élève : les produits et colisages (dans une réserve de produits Picard plausibles), l'ordre des
palettes (quelle position porte quel aléa), les valeurs (quantités, températures dans les zones de la règle du quai
−18 / −15 °C, manquants), le moment de la remontée du ticket. **Jalons et note calculés sur le jeu de l'élève**, jamais
écrits en dur. Les seuils de rapidité sont **communs à tous** (ils ne dépendent pas du jeu).

> **Règle du quai pour la température à cœur (décision de Tristan, 03/10/2026, après ENT-4.2)** — vaut pour toutes
> les séances Picard. **−18 °C ou plus froid : accepter. Entre −18 et −15 °C : accepter avec réserves — température,
> en écrivant la valeur relevée. Au-dessus de −15 °C : refuser — température.** Vérifié : −18 °C exigé, tolérance
> brève −15 °C au déchargement ; les trois zones sont une règle du quai, construite (à annoncer comme telle). La vue
> l'applique d'elle-même pour un camion qui se réchauffe (`seuilReserve`, `seuilRefus`) ; pour les autres palettes, le
> contenu déclare `attendu` / `motifAttendu` conformes : un test du bloc `picard` relit chaque `contenus/picard-ent4*.js`
> et refuse une palette hors de la règle.

## 6. Note (décision de Tristan, 03/10/2026)

**15 points de réception** (jalons réussis / jalons × 15) + **5 points de rapidité** :
- **3 sur le temps hors froid** : ≤ 20 min → 3, ≤ 25 → 2, ≤ 30 → 1 ;
- **2 sur le temps réel** : seuils **fixés par Tristan d'après les temps mesurés en ENT-4.1** (provisoirement 12 / 16
  min → 2 / 1), **× 4/3 en tiers-temps** (`ctx.tiersTemps`) ;
- **seulement si la réception est complète** (tout décidé, lot rentré, BL signé), **en proportion des palettes
  justes**.
Le temps réel court de l'ouverture de la séance à la remise, quel que soit l'écran, et survit à un rechargement.
Le détail (réception, hors froid, réel, rapidité retenue) va dans `detail`, lisible par l'enseignant.

## 7. Demandes au moteur

Aucune nouvelle sur la vue quai si elle (avec note de rapidité) et le tiers-temps sont livrés. **Nouveau : le tirage
d'un jeu par élève**, à construire **générique** (pas propre au quai) : graine = identifiant de l'élève, une réserve et
des contraintes d'équité déclarées par la séance. Cdiscount ENT-2.5 le réutilisera (6 références, quantités, pièges
d'inventaire) : décrire au compte rendu l'API, où vit le code et comment une autre séance le déclare (`docs/briefs/DECISION-jeu-unique-evaluations.md`).

## 8. Tests

Note (valeurs écrites à la main) : parcours juste rapide → 20 ; une palette fausse → rapidité × 5/6 ; BL non signé → 0
point de rapidité ; tiers-temps → seuils × 4/3 ; ramassage = même note que la remise ; chaque élève garde son jeu après
rechargement ; deux élèves voisins ont deux jeux différents ; aucun verdict visible avant la remise.
**Tirage** (obligatoire) : tirer quelques centaines de graines et vérifier que chaque jeu respecte les contraintes
d'équité (les six aléas, les zones de température, la remontée du ticket) — aucun tirage hors règle ne doit atteindre un
élève ; deux élèves différents → deux jeux différents ; même élève → même jeu.

## 9. Supports

Pas de trame (décision de Tristan : l'écran suffit). **Plus de corrigé fixe par jeu** : l'enseignant voit, **par élève**,
le jeu reçu, l'attendu et la réponse (dans le `detail` du suivi, ou une vue « corrigé de cet élève » si le corrigé actuel
ne sait pas le faire — le dire au compte rendu). `contenus/corriges/ENT-4.4.js` décrit la règle et la structure commune.

## 10. Questions ouvertes

- [ ] Seuils de temps réel (après l'essai d'ENT-4.1 en classe).
> **Réponses données d'avance par Tristan (03/10/2026, Cowork)** : ne pas s'arrêter pour les questions ci-dessous ; appliquer ces choix, et **lister au compte rendu** tout ce que tu as choisi seul (noms, textes, chiffres) pour que Tristan le corrige à l'écran.

- [x] **Noms fictifs, réserve de produits et plages de valeurs du tirage** (tranché le 03/10/2026) : **choisis par
  Claude Code** sur la grille du §5 (noms vérifiés par recherche web), listés au compte rendu ; Tristan les vérifie en
  passant l'évaluation.
- [x] **Mail d'accueil** : écrit par Claude Code, court, **sans conseil**.
- [x] ~~Attribution du jeu : alternance dans l'ordre alphabétique du groupe~~ — **supprimée le 03/10/2026** : un jeu
  tiré par élève, graine = identifiant (`docs/briefs/DECISION-jeu-unique-evaluations.md`).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
