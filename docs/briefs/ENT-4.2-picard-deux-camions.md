# Brief de séance — ENT-4.2 Picard, deux camions et un seul quai (entraînement)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-picard.md puis implémente le brief docs/briefs/ENT-4.2-picard-deux-camions.md (ENT-4.1 doit être livrée et validée). Annonce la durée, liste ce que la vue quai doit gagner (§7), puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
> ```

**Statut** : à implémenter — **après** ENT-4.1 validée à l'écran
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

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
