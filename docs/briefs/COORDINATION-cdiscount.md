# Coordination de la refonte Cdiscount (ENT-2.1 → 2.6) — 03/10/2026

Tableau de bord de la série Cdiscount recadrée (« Fiabiliser le stock avant le Black Friday », C1.6, 1re). **À lire avant
de lancer un chantier Cdiscount.** Cadrage terminé le 03/10/2026 : **toutes les questions de fond sont tranchées par
Tristan** ; Cowork a tranché les détails et les a listés dans chaque brief (« Détails tranchés par Cowork ») : Claude
Code enchaîne sans attendre et liste au compte rendu ce qu'il a choisi seul.

Conception (projet PREPALOG) : `claude/prepalog-cdiscount-serie-decisions.md` (décisions de la série),
`claude/prepalog-cdiscount-recadrage.md` (fil rouge), `claude/prepalog-ent21-cadrage-detaille.md`,
`claude/prepalog-geste-export-tableur.md`, `claude/prepalog-regle-evaluation-jeu-unique.md`,
`claude/prepalog-fiche-intention-pedagogique.md`. Décision générale déposée : `docs/briefs/DECISION-jeu-unique-evaluations.md`.

## Quand (décision 7 de Tristan)

**Pas de date à tenir.** *« On prépare quand le moteur est libre, on finit Picard puis on attaque la refonte de
Cdiscount. »* → **fin de la chaîne Picard (jusqu'à P6), puis toute la refonte Cdiscount, dans l'ordre ci-dessous.**
**La vue Planning** (prévue « après Picard ») **passe après Cdiscount.**
Règle de tout le dépôt : **un seul chantier moteur à la fois** (`core/`, `styles/base.css`, `outils/test.mjs`) — voir
`docs/EN-COURS.md`, `docs/briefs/COORDINATION-boost.md`, `docs/briefs/COORDINATION-picard.md`.

## La série recadrée

| Code | `id` | Titre | Temps | Ce que fait l'élève | Reprise de | État |
|---|---|---|---|---|---|---|
| ENT-2.1 | `cdiscount-mouvements` | Le stock raconte | guidage | une commande annulée (rayon vide, site « en stock ») : remonter les mouvements jusqu'au constat de casse saisi −1 au lieu de −2 | ENT-2.1 actuelle | **brief prêt** (`ENT-2.1-recadrage.md`) |
| ENT-2.2 | `cdiscount-chiffres` | Ce que disent les chiffres | guidage du geste tableur | exporter les constats des préparateurs, Écart / SI / NB.SI, choisir les références à recompter | **nouvelle** | **brief prêt** (`ENT-2.2-ce-que-disent-les-chiffres.md`) |
| ENT-2.3 | `cdiscount-inventaire` | Inventaire tournant | entraînement | redonner sa liste, recompter sa liste (le relevé couvre l'allée), oubli = aléa, « Absent » | ENT-2.2 actuelle | **livrée 04/10** (fermée) |
| ENT-2.4 | `cdiscount-regularise` | Régularisé à l'aveugle | erreur induite + entraînement du geste | exporter les ajustements, SI / NB.SI, enquêter ; vendeur de la place de marché | ENT-2.3 actuelle | **brief prêt** (`ENT-2.4-regularise-export.md`) |
| ENT-2.5 | `cdiscount-compte-a-rebours` | Le compte à rebours | **évaluation** (coef. 3) | boucle complète sur l'allée C, **un jeu par élève**, copie rendue | ancien brief ENT-2.4 (**abandonné**) | **brief prêt** (`ENT-2.5-compte-a-rebours.md`) |
| ENT-2.6 | `cdiscount-priorites` | Cinq recomptages, pas un de plus | **bonus** (entraînement, coef. 1) | export sale sur deux allées, NB.SI.ENS + RECHERCHEV, priorisation par la valeur | **nouvelle** | **brief prêt** (`ENT-2.6-bonus.md`) |

Le geste tableur reçoit ses trois temps : **guidé** (2.2), **entraîné** (2.4, 2.6), **évalué** (2.5). C1.6 garde les siens.
**Aucun élève n'a travaillé sur la série** : renumérotation libre, pas de garde de compatibilité ; toutes les séances
restent **fermées aux élèves** (`ouverture: 'prof'`) jusqu'à ce que Tristan les ouvre.

## Les chantiers et leur ordre

| # | Chantier | Brief | Taille | Modèle | Touche le moteur ? |
|---|---|---|---|---|---|
| C0 | Bouton « Fiche d'intention » (tous scénarios) | `MOTEUR-fiche-intention.md` | petit (30-45 min) | Sonnet | **oui** : `core/prof.js`, `activites/index.js` |
| C1 | Statut « Annulée » des commandes **+ niveau de l'élève dans la séance** (`db.niveau`) | `MOTEUR-statut-annulee.md` | petit (40 min-1 h) | Sonnet | **oui** : `core/types/entreprise.js` |
| C2 | ENT-2.1 recadrée | `ENT-2.1-recadrage.md` | moyen (1 h 30-2 h 30) | Sonnet | non |
| C3 | Renumérotation (inventaire → 2.3, régularisé → 2.4) | `CDISCOUNT-renumerotation.md` | petit (30-45 min) | Sonnet | non |
| C4 | ENT-2.3 recadrée + **lot 0 : périmètre de l'écran Inventaire** | `ENT-2.3-inventaire-recadre.md` | moyen (2-3 h) | Sonnet | **oui pour le lot 0** : `core/types/inventaire.js` |
| C5 | **Geste tableur** (Exporter, Déposer, contrôles, retours) — **livré 04/10** | `MOTEUR-geste-tableur.md` | **gros (6-8 h)** | **Opus** | **oui** : `core/types/export-tableur.js` (neuf), `entreprise.js`, `tableur.js`, styles, `test.mjs` |
| C6 | ENT-2.2 « Ce que disent les chiffres » | `ENT-2.2-ce-que-disent-les-chiffres.md` | moyen (3-4 h) | **Opus** | non |
| C7 | ENT-2.4 régularisé + export + vendeur | `ENT-2.4-regularise-export.md` | moyen (2-3 h) | Sonnet | non |
| C9 | ENT-2.6 bonus | `ENT-2.6-bonus.md` | moyen (2-3 h) | Sonnet | non |
| C8 | ENT-2.5 évaluation (un jeu par élève) | `ENT-2.5-compte-a-rebours.md` | moyen (3-4 h) | Sonnet | non (réutilise le tirage de Picard P6) |

**Ordre** : C1 → C2 → C3 → C4 → C5 → C6 → C7 → C9 → C8. **C0 n'importe quand** (avant la première fiche d'intention).
C1 suppose le chantier « tiers-temps et niveau élève » livré (Picard P3, en cours le 03/10). C8 en dernier : il lui faut le tirage générique livré par Picard P6, le geste tableur (C5) et le périmètre d'inventaire
(C4). Feuille de route de Tristan : `docs/briefs/FEUILLE-DE-ROUTE-cdiscount.md`.

**Dépendances de données** : ENT-2.2 **importe** les commandes, constats et stock réel d'ENT-2.3 (même allée A, deux jours
avant) → C4 avant C6 ; ENT-2.5 reprend l'extraction de liste et les aléas d'ENT-2.3.

## Phrases à copier-coller dans ccode

| Chantier | Phrase |
|---|---|
| C0 · fiche d'intention | `Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis implémente le brief docs/briefs/MOTEUR-fiche-intention.md. Annonce la durée avant de commencer, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§7).` |
| C1 · statut Annulée | `Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis implémente le brief docs/briefs/MOTEUR-statut-annulee.md. Annonce la durée avant de commencer, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§6).` |
| C2 · ENT-2.1 | `Lis docs/briefs/COORDINATION-cdiscount.md puis implémente le brief docs/briefs/ENT-2.1-recadrage.md (le statut « Annulée » doit être livré : MOTEUR-statut-annulee.md). Annonce la durée, dis-moi si un point du brief contredit le code, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).` |
| C3 · renumérotation | `Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis applique le brief docs/briefs/CDISCOUNT-renumerotation.md. Annonce la durée, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§6).` |
| C4 · ENT-2.3 | `Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis implémente le brief docs/briefs/ENT-2.3-inventaire-recadre.md : d'abord le lot moteur du §7 (écran Inventaire, commité à part), puis la séance. Annonce la durée, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).` |
| C5 · geste tableur | `Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis le brief docs/briefs/MOTEUR-geste-tableur.md. Annonce la durée avant de commencer, découpe en lots, fabrique la page d'essai, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§12).` |
| C6 · ENT-2.2 | `Lis docs/briefs/COORDINATION-cdiscount.md, le compte rendu de docs/briefs/MOTEUR-geste-tableur.md (API livrée), puis implémente le brief docs/briefs/ENT-2.2-ce-que-disent-les-chiffres.md. Annonce la durée, dis-moi si un point du brief contredit l'API livrée, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).` |
| C7 · ENT-2.4 | `Lis docs/briefs/COORDINATION-cdiscount.md, le compte rendu de docs/briefs/MOTEUR-geste-tableur.md (API livrée), puis implémente le brief docs/briefs/ENT-2.4-regularise-export.md. Annonce la durée, dis-moi si un point du brief contredit le code, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).` |
| C9 · ENT-2.6 | `Lis docs/briefs/COORDINATION-cdiscount.md, le compte rendu de docs/briefs/MOTEUR-geste-tableur.md (API livrée), puis implémente le brief docs/briefs/ENT-2.6-bonus.md. Annonce la durée, dis-moi si l'API du dépôt ne sait pas contrôler un point du §7, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).` |
| C8 · ENT-2.5 | `Lis docs/briefs/COORDINATION-cdiscount.md, docs/briefs/DECISION-jeu-unique-evaluations.md, le compte rendu de docs/briefs/ENT-4.4-picard-evaluation.md (API du tirage) et celui de docs/briefs/MOTEUR-geste-tableur.md (API du dépôt), puis implémente le brief docs/briefs/ENT-2.5-compte-a-rebours.md. Annonce la durée, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).` |

## Règles posées par Tristan pour la série (03/10/2026)

- **Fil rouge** : pour un e-commerçant, **le stock du logiciel est le stock affiché sur le site** (construit, à dire
  comme tel) ; un écart = un article vendu qui n'existe pas. Date fictive : début novembre, **avant le Black Friday**
  (27/11/2026), **sans délai chiffré**.
- **Faits vérifiés** (Cestas < 30 kg, 110 000 m², C-Logistics ; Noël 2017 **daté** ; fulfillment pour les vendeurs de la
  place de marché) : dans les trames, jamais inventés ; vendeur et boutique **fictifs, annoncés comme tels**.
- **Une erreur ne se paie qu'une fois** : une liste fausse en 2.2 se paie en 2.2 ; en 2.3 la référence oubliée revient
  par un aléa ; un jalon de décision est jugé sur les chiffres **déposés par l'élève**.
- **Geste tableur** : Excel **et** LibreOffice ; export .xlsx ; dépôt .xlsx / .ods (.csv refusé) ; fonctions anciennes
  seulement ; contrôle sur les **noms de fonctions** et les **valeurs avec tolérance** ; **retour selon le temps** :
  guidage détaillé (redépôt illimité), entraînement « n sur m » (redépôt possible), évaluation un dépôt sans retour ;
  fichier jamais stocké. **SI et NB.SI** en 2.2 et 2.4 ; **NB.SI.ENS et RECHERCHEV au bonus**.
- **Encart de rappel** des fonctions dans la trame ; rappel court dans le **bandeau d'aide**, jamais dans l'écran de travail.
- **Niveau standard / confirmé** (décision du 03/10, **à partir de cette série**) : réglé par l'enseignant sur la fiche
  de l'élève (chantier tiers-temps, Picard P3) ; un confirmé a **plus d'opérations** — même travail, mêmes aides, mêmes
  pièges — **en guidage et en entraînement** (2.1, 2.2, 2.3, 2.4, 2.6) ; **évaluation identique pour tous** (2.5) ;
  **l'élève ne voit jamais son niveau** ; niveau figé à la première ouverture d'une séance. Chaque brief a sa section
  « Niveau de l'élève : standard / confirmé ».
- **Évaluation** : un jeu tiré par élève (graine = identifiant), copie rendue, pas de trame, corrigé par élève.
- **« Absent »** (ENT-2.3) : **dit par l'enseignant**, jamais écrit dans un message.
- **Trames élève** Word/PDF pour 2.1, 2.2, 2.3, 2.4, 2.6 (pas 2.5) et **une fiche d'intention** pour toute la série :
  Cowork, **après validation à l'écran** ; la fiche est déclarée dans `ENTREPRISES` (C0) une fois relue.
- Une séance n'écrit rien dans `core/` : un besoin moteur se liste (§ 7 des briefs) et passe par un chantier déclaré dans
  `docs/EN-COURS.md`.
