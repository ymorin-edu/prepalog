# Brief de séance — ENT-2.5 Cdiscount « Le compte à rebours » (évaluation, un jeu par élève)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-cdiscount.md, docs/briefs/DECISION-jeu-unique-evaluations.md, le compte rendu de docs/briefs/ENT-4.4-picard-evaluation.md (API du tirage) et celui de docs/briefs/MOTEUR-geste-tableur.md (API du dépôt), puis implémente le brief docs/briefs/ENT-2.5-compte-a-rebours.md. Annonce la durée, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
> ```

**Statut** : livré (04/10/2026), fermé aux élèves (`ouverture: 'prof'`) : Tristan l'ouvre le jour de l'évaluation.
**Date du brief** : 03/10/2026
**Modèle** : Sonnet — **Durée estimée par Cowork** : 3 à 4 h (règles du tirage et test sur graines compris).
**Touche le moteur** : non, si le tirage de P6, le geste tableur (C5) et le périmètre d'inventaire (C4) sont livrés.
**Conception** : `claude/prepalog-cdiscount-serie-decisions.md` (décisions 12, 14) ;
`claude/prepalog-regle-evaluation-jeu-unique.md`.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-2.5 / **`cdiscount-compte-a-rebours`** (nouveau) |
| Titre | « Cdiscount — le compte à rebours » |
| desc | « Seul, sur une allée neuve : exporter, analyser, choisir quoi compter, compter, décider, rendre compte. Tu rends ta copie. » |
| Niveau / compétences | 1re / **C1.6** (et C3.2 si déclarée en ENT-2.2) |
| Temps | **évaluation** (coefficient 3) |
| Notation | **copie rendue** (`meta.copie: true`, `copie: meta.copie` dans `creerEntreprise`, `export const noter`) ; note = somme des poids des jalons réussis, sur 20 (voir le compte rendu), figée à la remise |
| Base | propre, **pas** de `reinitialisable`, **un jeu tiré par élève** (graine = identifiant) |
| Durée | une séance d'environ **2 h** ; pas de chrono noté |
| Livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

Vérifié : comme ENT-2.1. **Construit** : l'allée C (sport et loisirs, articles du catalogue Cdiscount de la séance :
GOU-ISO-75, COR-SAU, TAP-YOG, BAL-FOOT, LAM-FRO, ELA-FIT-3), tous les chiffres tirés, les personnages.

## 3. Objectif

L'élève mène **seul la boucle complète** sur des données neuves : **exporter** les lignes de préparation, **analyser**
dans le tableur (Écart, SI, NB.SI), **choisir** quoi faire recompter, **compter** (inventaire tournant de sa liste),
**décider** pour chaque écart, **rendre compte** à Nadia. Aucune notion nouvelle : tout a été vu en ENT-2.1 à 2.4. Aucun
retour à l'écran.

## 4. Déroulé

1. Ouverture : Bienvenue (garde) + **mission** courte, sans conseil : « Le Black Friday approche : l'allée C doit être
   juste. Exportez les lignes de préparation, analysez les constats des préparateurs, envoyez-moi votre liste
   (« À recompter : »), faites l'inventaire de cette liste, puis rendez-moi compte (« Régularisé : », « Valeur
   régularisée : »). Quand tout est fait, rendez votre copie. » Messages d'enquête à l'ouverture (§ 6).
2. **Export** (écran Commandes) → `cdiscount-preparations-allee-C.xlsx`, ~40 lignes, propre ; feuille « Synthèse » :
   en-têtes seuls.
3. **Dépôt** (menu Fichiers) : **un seul dépôt, aucun retour** (« Fichier reçu. ») ; un fichier refusé pour son format ne
   compte pas.
4. **Liste** : message à Nadia `À recompter : …` → relevé de toute l'allée ; **oubli = aléa** comme en ENT-2.3 (un
   préparateur signale la référence oubliée, elle entre dans le périmètre) : l'oubli ne se paie qu'au jalon de la liste.
5. **Inventaire** sur le périmètre : aveugle, écarts et taux par l'élève, motif obligatoire, **`correction: 'aucune'`**,
   KPI d'accueil `['mail']`.
6. **Compte rendu** à Nadia : deux lignes à amorce (§ 7).
7. **« Rendre ma copie »** ; l'enseignant ramasse en fin d'heure, peut rouvrir.

## 5. Un jeu tiré par élève (décision de Tristan, 03/10/2026)

Graine = **identifiant de l'élève** (stable : autre poste, rechargement, réouverture). Mécanisme générique livré par
Picard P6 : **lire son API dans le compte rendu d'ENT-4.4** ; le déclarer pour cette séance.

**Structure commune = contrainte d'équité** (toujours respectée) : 6 références (l'allée C), **3 écarts, un de chaque
sorte**, 3 références sans écart :

| Sorte | Histoire | Décision attendue |
|---|---|---|
| **Remettre en rayon** | après une commande annulée en cours de préparation, les articles réintégrés ont été posés dans un autre bac de l'allée (message de la préparatrice) | ne pas régulariser, remettre en rayon |
| **Régulariser** | manque sans cause : aucun mouvement, aucun message, relevé « recompté deux fois, bacs voisins vérifiés » | régulariser, motif « Démarque inconnue » |
| **Recompter** | le surplus de la dernière réception a été monté en réserve, au niveau au-dessus de l'emplacement (message du cariste) ; le relevé n'a compté que l'emplacement de prélèvement | demander un recomptage (le recompte redonne le système) |

**Tirés** : quelle référence porte quelle sorte ; les stocks de départ (dans [mini, maxi] du catalogue) ; les écarts
(rayon : 2 à 4 ; régulariser : 1 à 3 ; recompter : 3 à 6, en manque) ; les commandes (≈ 40 lignes de préparation,
**au moins 2 constats** par référence à écart, **aucun** sur les trois autres, constats commencés après l'événement qui
crée l'écart) ; les dates et numéros de documents. **Contraintes vérifiées** : stocks jamais négatifs ; taux d'écart du
périmètre exact entre 2 % et 8 % ; une casse déclarée et un retour client (mouvements normaux, sans écart) sur des
références sans écart, pour le volume.

**Jalons et note calculés sur le jeu de l'élève**, jamais écrits en dur. **Corrigé par élève** : l'enseignant voit le jeu
reçu, l'attendu et la réponse (dans le `detail` du suivi ou une vue « corrigé de cet élève », selon ce que P6 a livré).

## 6. Messages

| Arrivée | De | Contenu |
|---|---|---|
| ouverture | Nadia | mission (§ 4) |
| ouverture | Lucie Barrère, préparatrice | annulation de la commande CMD-… : « j'ai réintégré <n> <article> ; le bac était plein, je les ai posés sur l'étagère d'en face, je ne sais plus où » (référence et quantité tirées) |
| ouverture | Kevin Larrieu, cariste | « Réception REC-… : le surplus de <article> ne tenait pas dans l'emplacement, je l'ai monté en réserve, juste au-dessus » (quantité non écrite) |
| ouverture | Service retours ; Kevin Larrieu | un retour client et un constat de casse **normaux** (références sans écart) |
| liste reconnue | Nadia | « C'est noté : vous recomptez … » puis le **relevé** (toute l'allée) |
| oubli d'une référence à écart | Yanis Cazenave, préparateur | « Rayon à vérifier : <réf> » (textes d'ENT-2.3, sans quantité) |
| rien de reconnu | Nadia | rappel unique (comme ENT-2.3) |

Aucun message ne réagit au juste ou au faux.

## 7. Jalons (11, note = réussis / 11 × 20)

| # | Jalon | Lit |
|---|---|---|
| 1 | Écart calculé en formule | contrôle colonne « Écart » (dépôt unique) |
| 2 | Références en écart isolées avec SI | contrôle colonne « Réf. en écart », `IF` |
| 3 | Constats comptés par référence avec NB.SI | contrôle table « Synthèse », `COUNTIF` |
| 4 | Bonne liste à recompter | exactement les références à constats **selon la synthèse déposée** (sans dépôt : les 3 vraies), sans intrus |
| 5 | Comptage reporté sans erreur | `bilanInventaire`, sur le périmètre |
| 6 | Écarts calculés | idem |
| 7 | Remise en rayon décidée | la référence « rayon » |
| 8 | Régularisation avec le bon motif | la référence « régulariser », « Démarque inconnue » |
| 9 | Recomptage demandé | la référence « recompter » |
| 10 | Taux d'écart calculé | `bilanInventaire` |
| 11 | Compte rendu juste | message à Nadia : `Régularisé :` cite la référence régularisée **par l'élève** (erreur payée une fois au jalon 8) ; `Valeur régularisée :` dernier nombre = |écart| × coût de cette référence (tolérance 0,01 €) |

Jalons figés à la remise ; aucun verdict avant ; rien n'est acquis sans action (`attente`).

## 8. Tests (`outils/test/cdiscount.mjs`)

- **Tirage (obligatoire)** : quelques centaines de graines → chaque jeu respecte la structure (3 sortes sur 3 références
  distinctes, 3 sans écart, plages, ≥ 2 constats par écart, 0 sur les autres, stocks ≥ 0, taux entre 2 et 8 %) ; même
  élève → même jeu ; deux élèves → deux jeux différents ;
- parcours juste complet sur une graine fixée (valeurs écrites à la main **pour cette graine**) → 20/20 ;
- une décision fausse → 20 × 10/11 ; liste avec oubli → jalon 4 ko, aléa reçu, jalons 5-10 encore possibles ;
- dépôt : second dépôt refusé ; aucun retour affiché ; ramassage = même note que la remise ;
- **sabotages** : un jeu avec deux références de la même sorte (le test du tirage doit échouer) ; correction affichée
  (doit échouer) ; jalon 11 jugé sur la référence attendue plutôt que sur celle de l'élève (doit échouer).

## 9. Supports

**Pas de trame** (décision de la série : trames 2.1 à 2.4 et 2.6). La fiche d'intention Cdiscount décrira l'épreuve et
le corrigé par élève. `contenus/corriges/ENT-2.5.js` : la règle et la structure commune (pas de valeurs).

## 10. Critères de validation par Tristan

Passer l'évaluation en élève **avec deux identifiants différents** : deux allées différentes, même difficulté ; aucun
retour à l'écran ; la copie rendue apparaît dans le suivi avec le corrigé de cet élève.

## Niveau de l'élève : standard / confirmé

> **Décision de Tristan (03/10/2026)** : à partir de la série Cdiscount, chaque élève a un niveau **standard** (par
> défaut) ou **confirmé**, réglé par l'enseignant sur la fiche de l'élève (chantier « tiers-temps et niveau élève » :
> nom exact du réglage dans le compte rendu de `MOTEUR-tiers-temps.md`). Un confirmé a **plus d'opérations** à traiter
> — même travail, mêmes aides, mêmes pièges —, en **guidage et en entraînement** ; **l'évaluation est la même pour
> tous** ; **l'élève ne voit jamais son niveau** (aucune étiquette, aucun message qui le trahit). La séance lit le
> niveau dans sa base (`db.niveau`, posé à l'ouverture : `MOTEUR-statut-annulee.md`, partie 2) : il est **figé à la
> première ouverture** ; un changement de niveau ensuite ne touche pas une séance déjà commencée.

**Ce que ça change ici (détails tranchés par Cowork)** :

- **Évaluation : même structure et même volume pour tous**, quel que soit le niveau (décision de Tristan). Le tirage
  d'un jeu par élève **ne lit pas** le niveau. Test : deux élèves de niveaux différents, même graine → même jeu.

## 11. Questions — toutes tranchées

> **Réponses données d'avance par Tristan (03/10/2026, Cowork)** : ne pas s'arrêter ; appliquer ces choix et **lister au
> compte rendu** tout ce que tu as choisi seul.

Décisions de fond : ~2 h ; allée neuve et plus petite, 6 références, export ~40 lignes, 3 écarts (un de chaque sorte) ;
boucle complète ; une copie (dépôt + inventaire) ; un jeu par élève (graine = identifiant) ; pas de trame.

### Détails tranchés par Cowork (à corriger à l'écran par Tristan)

- [x] `id` `cdiscount-compte-a-rebours` ; contenu `contenus/cdiscount-compte-a-rebours.js`.
- [x] **Allée C** (les 6 articles C-01-1 à C-03-2 du catalogue, jamais utilisés par la série).
- [x] Les **trois histoires** du § 5 (réintégration posée ailleurs ; démarque inconnue ; surplus monté en réserve).
- [x] Plages tirées : écarts 2-4 / 1-3 / 3-6 ; ≈ 40 lignes (36 à 44) ; ≥ 2 constats par écart ; taux 2-8 %.
- [x] **Liste et aléa** repris d'ENT-2.3 (même extraction, mêmes textes d'aléa) ; pas de cas « Absent ».
- [x] **Compte rendu** : deux lignes, « Régularisé : » et « Valeur régularisée : ».
- [x] 11 jalons, note proportionnelle ; pas de chrono ni de point de rapidité.
- [x] Personnages : Nadia Ferrand, Kevin Larrieu (existants) ; Lucie Barrère (préparatrice), Yanis Cazenave (préparateur,
  comme ENT-2.3) — inventés, `.example`.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `activites/cdiscount-compte-a-rebours.js`, `contenus/cdiscount-compte-a-rebours.js`,
  `contenus/corriges/ENT-2.5.js` (neufs), une ligne dans `activites/index.js`, `outils/essai-cdiscount.html` (ENT-2.5 dans la
  liste, la copie reste dans la page), `outils/test/cdiscount.mjs` (8 cas), `outils/test/socle.mjs` (ENT-2.5 dans la liste).
  **Moteur** (commit à part) : `core/types/entreprise.js` — `inventaire` peut être une **fonction de la graine** (comme le
  quai de Picard), la graine est posée aussi pour un inventaire tiré ou `tirage: true`, et la note garde `detail.graine`.
- **Déclaration du tirage** (`DECL_TIRAGE`, `core/tirage.js`, 40 essais) : 6 références de l'allée C ; sortes tirées
  (`h.prendre`) ; stocks de départ dans la moitié haute de [mini, maxi] du catalogue ; écarts rayon 2-4, régulariser 1-3,
  recompter 3-6 ; une réception J-9 (24-36 unités) pour les références « rayon » et « régulariser », une réception J-8 à J-6
  (36-48) pour « recompter » (le surplus monté en réserve) ; annulation J-7 à J-5 (réintégration 2 h après), démarque J-8 à
  J-6 ; préparations : 2-3 avant et 3-4 après l'événement pour une référence à écart, 7-9 pour les autres, jamais le jour de
  l'événement ; un retour et une casse sur deux références sans écart ; numéros tirés (CMD-7342xx, REI-26-00xx,
  REC-26-05xx, RET-26-01xx, DEM-26-00xx). **Contraintes** (`verifier`) : 3 sortes sur 3 références distinctes, 3 sans écart,
  plages, ≥ 2 constats par écart et 0 ailleurs, stocks jamais négatifs (système et rayon), 36 à 44 lignes, taux du
  périmètre exact entre 2 et 8 %, retour et casse hors écarts. Secours : le premier jeu conforme d'une graine fixe.
  Sur 500 graines : 384 conformes du premier coup, **aucun secours**, au plus 4 retirages.
- **Écarts par rapport au brief** :
  - Compétence : C1.6 seule (C3.2 = traçabilité).
  - Les réceptions ajoutées (J-9 et le surplus) ne sont pas dans le brief : sans elles, les stocks de l'allée C (maxi
    20 à 35) donnaient presque toujours un taux au-dessus de 8 %. Le stock de départ est posé par le volet (la base de départ
    ne connaît pas la graine).
  - Le compte rendu s'écrit en répondant à l'accusé de Nadia (« Votre liste à recompter »), dont l'amorce porte les deux
    lignes « Régularisé : » et « Valeur régularisée : ».
- **Décisions prises en route** :
  - Jalons 5 et 6 : `attente` tant que le comptage n'est pas validé ou complet, `ko` après validation s'ils sont faux ;
    7 à 10 : jugés à la validation de l'inventaire. Jalon 11 : la ligne qui **commence** par « Régularisé » (sans quoi
    « Valeur régularisée » se lit à sa place) doit citer exactement les références que l'élève a **régularisées à l'écran**,
    et la valeur = Σ |ajustement| × coût (tolérance 0,01 €) ; s'il n'a rien régularisé, « aucune » et 0 € sont justes.
  - L'aléa d'une référence oubliée : « Il manque des … en C-0x-x par rapport au système » (sans quantité), par Yanis Cazenave.
  - Relevé : « Comptage aux emplacements de prélèvement » ; remarque « recompté deux fois, bacs voisins vérifiés » sur
    l'emplacement de la référence à régulariser.
  - Corrigé par élève (onglet Corrigés, choisir l'élève) : son allée (constats, système, relevé, écart, décision attendue),
    la liste juste, le taux, le compte rendu juste, puis ses jalons et sa note ; avant ouverture, l'allée qu'il recevra.
- **Tests** (8 cas) : **300 graines** — toutes conformes, zéro secours, ≥ 290 jeux différents ; même graine → même jeu ;
  standard et confirmé → même allée ; le jeu de « eleve-test » écrit à la main (LAM-FRO rayon −3, COR-SAU régulariser −1,
  ELA-FIT-3 recompter −4 ; stocks 23 / 53 / 6 / 9 / 49 / 57 ; 38 lignes ; taux 5,0 % ; valeur 3,20 €) ; parcours juste 11/11,
  une décision fausse 10/11 ; liste avec oubli → jalon 4 ko, aléa reçu, inventaire jouable ; synthèse fausse + liste qui la
  suit → 3 ko, 4 ok ; compte rendu jugé sur la régularisation de l'élève ; corrigé par élève ; à l'écran : graine posée,
  export, « Fichier reçu. » et plus de second dépôt, inventaire de 3 lignes sans aucune correction, copie rendue 11/11,
  ramassage = même note. Sabotages éprouvés : deux références de la même sorte → 8 cas tombent ; correction affichée → le
  cas d'écran tombe ; jalon 11 jugé sur la référence attendue → 2 cas tombent. Suite entière 545/545.
- **Commits** : « Moteur : inventaire tiré par élève… » puis « ENT-2.5 évaluation : le compte à rebours… (C8) ».
- **Reste ouvert** : la fiche d'intention Cdiscount (Cowork) doit décrire l'épreuve et dire où lire le corrigé par élève ;
  **Tristan passe l'évaluation avec deux identifiants** (deux allées, même difficulté) avant de l'ouvrir ; ne plus toucher au
  tirage une fois l'évaluation ouverte.

- **Notation pondérée sur 20 (10/10/2026, lot 3 de `NOTATION-ponderation.md`)** : la note n'est plus « réussis / 11 × 20 » mais la somme des poids des jalons justes, sur 20 (`bareme: 20`). Le code compte **12 jalons** (le jalon `export` est arrivé avec l'écran Extractions, commit d31cbc8) et non 11. Tableau `BAREME` de `contenus/cdiscount-compte-a-rebours.js` : tableur 4,5 (export 1, écart 1, SI 1, synthèse 1,5), liste 3, comptage 3 (comptage 2, écarts 1), décisions 7 (rayon 2, régularisation 2,5, recomptage 2,5), taux 1, compte rendu 1,5. Poids validés par Tristan. Le corrigé par élève affiche la note pondérée.
