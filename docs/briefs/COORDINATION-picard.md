# Coordination des chantiers Picard (ENT-4.1 → 4.4) — 03/10/2026

Tableau de bord du scénario Picard (réception de surgelés, C1.4, 1re). **À lire avant de lancer un chantier Picard.**
Décidé par Tristan le 03/10/2026 : **Picard avance en parallèle de Boost**, mais **un seul chantier moteur à la fois**
dans tout le dépôt (`core/`, `styles/base.css`, `outils/test.mjs`) : voir `docs/EN-COURS.md` et
`docs/briefs/COORDINATION-boost.md`.

Matière première : `docs/briefs/picard/` (maquette jouable v8, photos, logo, couleurs, licences).
Conception : fiches du projet PREPALOG `claude/prepalog-picard-cadrage.md` et `claude/prepalog-picard-4-seances.md`.

## Les 4 séances (tranché par Tristan le 03/10)

| Code | Titre | Temps | Ce qui change | État |
|---|---|---|---|---|
| ENT-4.1 | Le premier camion | guidage | la maquette v8 : 1 camion, 5 palettes, un aléa par palette, toutes les aides | **livrée et validée par Tristan le 03/10** ; à ouvrir aux élèves dans Conduite de séance ; vue quai (P1) validée |
| ENT-4.2 | Deux camions, un seul quai | entraînement (C1.4 + **C1.3**) | choisir quel camion décharger d'abord (le froid de A faiblit : conséquence réelle + jalon avec phrase juste) ; 8 palettes dont 4 aléas (multi-références, chaude malgré le ticket, étiquette déchirée, manquant) ; un temps hors froid par camion ; seul le bilan reste comme aide | **livrée le 03/10, fermée aux élèves** (vue quai étendue : plusieurs camions, réchauffement, multi-références, étiquette par face) ; à essayer à l'écran |
| ENT-4.3 | La réception de nuit | erreur induite | deux temps comme ENT-3.3 : contrôler le travail figé du collègue (3 erreurs + 1 fausse piste, preuve dans les documents), diagnostic au chef de quai → corriger : bloquer, protestation au transporteur (messages à lignes) | **livrée le 03/10, fermée aux élèves** (vue quai « déjà réceptionné » : dossier figé, chambre froide, Bloquer, Messagerie ; page d'essai `outils/essai-ent43.html`) ; à essayer à l'écran |
| ENT-4.4 | Le rush du lundi | évaluation | **un jeu tiré par élève** (graine = identifiant, décision du 03/10 : `DECISION-jeu-unique-evaluations.md`), 6 palettes dont une à deux problèmes, aucune aide, copie rendue, note 15 + 5 rapidité | **brief prêt** (`ENT-4.4-picard-evaluation.md`) ; seuils réels après l'essai d'ENT-4.1 |

## Les chantiers et leur ordre

| # | Chantier | Brief | Taille | Modèle | Touche le moteur ? |
|---|---|---|---|---|---|
| P1 | **Vue « quai »** + page d'essai | `MOTEUR-vue-quai.md` | gros (≈ 7-8 h) | Opus | oui : `core/types/quai.js` (neuf), `core/types/entreprise.js` (câblage), styles, `outils/test.mjs` (ligne `BLOCS`) |
| P2 | **ENT-4.1** | `ENT-4.1-picard-premier-camion.md` | moyen (≈ 2-3 h) | Sonnet ou Opus | non (contenu + activité + une ligne `ENTREPRISES`) |
| P3 | **Tiers-temps par élève** | `MOTEUR-tiers-temps.md` | petit (1-2 h) | Sonnet | oui (fiche élève, peut-être règles Firebase) |
| P4 | **ENT-4.2** + extensions de la vue (plusieurs camions, réchauffement, multi-références, étiquette par face) | `ENT-4.2-picard-deux-camions.md` §7 | moyen à gros | Opus | oui |
| P5 | **ENT-4.3** + extensions (quai « déjà réceptionné » figé, contrôle en chambre froide, Bloquer, bouton Messagerie) | `ENT-4.3-picard-reception-de-nuit.md` §7 | moyen à gros | Opus | oui |
| P6 | **ENT-4.4** (un jeu tiré par élève, note avec rapidité) | `ENT-4.4-picard-evaluation.md` | moyen à gros | Sonnet | oui : tirage générique d'un jeu par élève (réutilisé par Cdiscount ENT-2.5) |

**Ordre** : P1 → validation à l'écran (page d'essai) → P2 → P4 → P5 → P3 → P6. **L'essai d'ENT-4.1 en classe ne bloque
rien** (décision de Tristan) : il se fait en parallèle ; ENT-4.4 est construite avec les seuils provisoires (12 / 16 min),
que Tristan ajuste ensuite (petit réglage, Sonnet), avant le jour de l'évaluation. Feuille de route de Tristan :
`docs/briefs/FEUILLE-DE-ROUTE-picard.md`.
**P1 ne démarre pas tant qu'un chantier Boost écrit dans `core/types/entreprise.js` ou `styles/base.css`** (au 03/10 au soir :
chantier F, `core/types/grille.js` et `styles/base.css` ; regarder `docs/EN-COURS.md`). Ce qui peut avancer en même temps : le contenu `contenus/picard*.js` (P2) une fois l'API
de P1 validée, les trames élève (Cowork).

## Phrases à copier-coller dans ccode

| Chantier | Phrase |
|---|---|
| P1 · vue quai | `Lis docs/briefs/COORDINATION-picard.md, docs/EN-COURS.md, puis le brief docs/briefs/MOTEUR-vue-quai.md et ouvre la maquette docs/briefs/picard/maquette-quai-picard.html. Annonce la durée avant de commencer, découpe en lots, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).` |
| P2 · ENT-4.1 | `Lis docs/briefs/COORDINATION-picard.md puis implémente le brief docs/briefs/ENT-4.1-picard-premier-camion.md (la vue quai doit être livrée). Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.` |
| P4 · ENT-4.2 | `Lis docs/briefs/COORDINATION-picard.md puis implémente le brief docs/briefs/ENT-4.2-picard-deux-camions.md (ENT-4.1 doit être livrée et validée). Annonce la durée, liste ce que la vue quai doit gagner (§7), puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).` |
| P5 · ENT-4.3 | `Lis docs/briefs/COORDINATION-picard.md, docs/briefs/ENT-3.3-deux-temps.md (le modèle des deux temps) puis implémente le brief docs/briefs/ENT-4.3-picard-reception-de-nuit.md. Annonce la durée, liste ce que la vue quai doit gagner (§7), fabrique une page d'essai puis enchaîne sur la séance sans attendre : les questions du brief sont déjà tranchées (§11).` |
| P6 · ENT-4.4 | `Lis docs/briefs/COORDINATION-picard.md puis implémente le brief docs/briefs/ENT-4.4-picard-evaluation.md avec les seuils de temps réel provisoires (12 et 16 min) : ils seront ajustés plus tard, garde-les dans un réglage facile à changer. Annonce la durée puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§10).` |
| P3 · tiers-temps | `Lis docs/EN-COURS.md puis implémente le brief docs/briefs/MOTEUR-tiers-temps.md. Annonce la durée, dis-moi si les règles Firebase doivent changer avant de coder.` |

## Règles posées par Tristan pour Picard (03/10/2026)

- Temps du quai simulé partout ; **temps hors froid d'un seul lot** (le transporteur décharge tout) ; repère 30 min pour
  un quai réfrigéré à +4 °C ; déchargement = 30 s + 1 min par palette (valeurs construites, **réutilisées pour la
  planification de quai**).
- **Température à cœur, trois zones** (03/10, après ENT-4.2) : ≤ −18 °C accepter ; entre −18 et −15 °C accepter avec
  réserves (température relevée) ; > −15 °C refuser. Règle du quai, construite sur les seuils vérifiés ; testée sur tous
  les contenus Picard.
- **Le froid d'abord, les papiers ensuite** : enseigné en guidage (chef de quai), jamais sanctionné en points.
- « Sous réserve de déballage » = case piège, jalon faux, aussi en évaluation.
- Évaluation : **le chrono mesure, il ne coupe pas** ; note = 15 pts de réception + 5 pts de rapidité (3 sur le temps
  hors froid, 2 sur le temps réel, seuils × 4/3 en tiers-temps), rapidité seulement si la réception est complète et en
  proportion des palettes justes ; seuils du temps réel calés sur les temps mesurés en ENT-4.1 ; tiers-temps par élève.
- Entrepôt réel nommé (Sainghin-en-Mélantois) ; quai, fournisseur, transporteur fictifs, annoncés comme tels.
- Logo réel **et** charte graphique Picard.
- **Plein écran** ; « Revoir le BL » partout ; **temps réel compté quel que soit l'écran** ; **mail d'accueil** du chef
  de quai dans chaque séance.
- Trames élève Word/PDF pour 4.1, 4.2, 4.3 (Cowork, après validation à l'écran) ; pas de trame pour 4.4.
- Compétences : C1.4 partout, **C1.3 en plus pour ENT-4.2**.
- Compte rendu au chef de quai : en ENT-4.3 (messagerie). Variantes (quai +15 °C, enregistreur en panne, chauffeur
  pressé) : en réserve.
