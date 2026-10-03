# Brief de chantier — MOTEUR : statut « Annulée » des commandes + niveau de l'élève dans la séance (Cdiscount C1)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis implémente le brief docs/briefs/MOTEUR-statut-annulee.md. Annonce la durée avant de commencer, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§6).
> ```

**Statut** : à implémenter
**Date du brief** : 03/10/2026
**Modèle** : Sonnet — **Durée estimée par Cowork** : 40 min à 1 h, tests compris (statut « Annulée » 20-30 min ; niveau
dans la séance 20-30 min, ou rien si le chantier tiers-temps l'a déjà fait).
**Prérequis** : chantier « tiers-temps et niveau élève » livré (`MOTEUR-tiers-temps.md`, Picard P3).
**Touche le moteur** : oui (`core/types/entreprise.js`) → s'inscrire dans `docs/EN-COURS.md` avant de commencer.
**Conception** : fiches du projet `claude/prepalog-ent21-cadrage-detaille.md` (décision 2, § 4) et
`claude/prepalog-cdiscount-serie-decisions.md`.

## 1. Décision de Tristan (03/10/2026)

ENT-2.1 recadrée part d'une **commande annulée** (le site affichait les écouteurs, le rayon était vide). Tristan a
choisi **un vrai statut « Annulée »** plutôt qu'un faux « Préparée (reliquat) ». Il resservira : ENT-2.3 (commande
annulée en cours de préparation), ENT-2.5, Picard, toute séance future.

## 2. Ce qui existe

`statutCommande(o)` (`core/types/entreprise.js`, vers la ligne 404) ne connaît que **À préparer / En cours /
Préparée / Préparée (reliquat)**. L'accueil compte les « commandes à préparer » avec ce statut (lignes ~449 et ~681).

## 3. À construire

Une commande semée par un volet peut porter :

```js
annulee: { motif: 'Rupture : emplacement vide à la préparation', at: <timestamp> }
```

| Règle | Détail |
|---|---|
| Affichage | statut **« Annulée »**, pastille `crit` (liste des commandes, fiche de la commande, partout où `statutCommande` sert) ; le motif et la date se lisent sur la fiche (« Annulée le … — motif ») |
| Non préparable | pas de bouton « Préparer », aucune saisie possible, même si la commande n'a pas de `prep` |
| Non comptée | absente des « commandes à préparer » de l'accueil (les deux compteurs) |
| Bon de préparation figé lisible | si la commande porte un `prep`, il reste consultable en lecture seule (ex. ENT-2.1 : stock trouvé 0, statut de ligne « Rupture ») |
| Priorité | `annulee` l'emporte sur tous les autres statuts (une commande annulée en cours de préparation, déjà sortie puis réintégrée, s'affiche « Annulée ») |
| Cloisonnement | c'est une donnée semée par le volet, dans la base de la séance : rien de global |
| Console | si une commande de console liste les commandes (`.orders` ou équivalent), elle affiche aussi « Annulée » |

Une commande sans `annulee` se comporte exactement comme avant (aucune séance existante ne change).

## 4. Tests

Bloc qui couvre `entreprise.js` (le trouver dans `outils/test.mjs`, ligne `BLOCS` ; sinon `outils/test/commun.mjs`) :

- commande avec `annulee` sans `prep` → statut « Annulée » / `crit`, non comptée à l'accueil, pas de bouton Préparer ;
- commande avec `annulee` **et** `prep.validated` → « Annulée » (priorité) ;
- commande sans `annulee` → statuts inchangés (les quatre cas d'aujourd'hui) ;
- **sabotage** : retirer la priorité → le cas « annulée + préparée » doit échouer.

Suite entière verte avant commit.

## 5. Ce que ça ne fait pas

Pas de geste « Annuler une commande » pour l'élève (aucune séance ne le demande). Pas de mouvement de stock
automatique à l'annulation : c'est le volet qui sème les mouvements (ou leur absence) qu'il veut.

## Partie 2 — le niveau de l'élève transmis à la séance (décision de Tristan, 03/10/2026)

**Décision** : à partir de la série Cdiscount, chaque élève a un niveau **standard** (par défaut) ou **confirmé**, réglé
par l'enseignant sur sa fiche (construit dans le chantier tiers-temps : **lire son compte rendu** pour le nom exact du
champ et de ce que reçoit `rendre(hote, ctx)`). Un confirmé a **plus d'opérations** en guidage et en entraînement ;
l'évaluation est la même pour tous ; **l'élève ne voit jamais son niveau**.

**Le manque probable** : le contenu d'une séance d'entreprise ne voit pas `ctx` — `baseDeDepart()`, `volet.semer(prenom,
db)`, les déclencheurs, les jalons (`verifier(db)`) et les exports ne reçoivent que la base. **À construire dans
`core/types/entreprise.js`** (si le chantier tiers-temps ne l'a pas déjà fait — le vérifier d'abord) :

- à la **création de la base** d'une séance, `db.niveau = 'standard' | 'confirme'` recopié depuis le réglage de l'élève
  (absent ou inconnu → `'standard'`) ; l'enseignant qui ouvre une séance → `'standard'` ;
- **figé** : une base qui a déjà un `db.niveau` le garde (un changement de niveau ne touche pas une séance commencée ;
  il vaut pour les séances suivantes ; ENT-2.1, réinitialisable, le relit à la remise à zéro) ;
- **jamais affiché** à l'élève (ni bandeau, ni accueil, ni console) ; visible de l'enseignant seulement là où il voit
  déjà le tiers-temps (et dans le `detail` du suivi : « niveau : confirmé ») ;
- une séance qui n'utilise pas `db.niveau` ne change en rien.

**Tests** (même bloc) : élève réglé confirmé → `db.niveau === 'confirme'` à la première ouverture ; réglage changé
ensuite → la base garde l'ancienne valeur ; élève non réglé → `'standard'` ; le mot « confirmé » n'apparaît nulle part
dans l'écran de l'élève ; **sabotage** : relire le réglage à chaque ouverture (le cas « figé » doit échouer).

Une ligne dans `activites/FICHE-SEANCE.md` (`db.niveau`, comment une séance déclare son volume par niveau) et une au
journal `docs/decisions.md`.

## 6. Questions — toutes tranchées

> **Réponses données d'avance (03/10/2026, Cowork)** : ne pas s'arrêter ; appliquer ces choix et **lister au compte
> rendu** ce que tu as choisi seul.

### Détails tranchés par Cowork (à corriger à l'écran par Tristan)

- [x] Nom du champ : `annulee: { motif, at }` (forme proposée au cadrage, gardée).
- [x] Libellé exact : « Annulée » ; sur la fiche : « Annulée le JJ/MM à HH:MM — <motif> ».
- [x] Couleur : pastille `crit` (rouge), comme une rupture.
- [x] Le bon de préparation figé reste lisible : oui, en lecture seule, sans bouton.
- [x] Une ligne au journal `docs/decisions.md` et une ligne dans `activites/FICHE-SEANCE.md` (le champ `annulee` d'une
  commande semée).
- [x] Niveau : valeurs `'standard'` / `'confirme'` (sans accent dans le code), rangé dans `db.niveau`, figé à la première
  ouverture ; si le chantier tiers-temps a choisi d'autres noms, **garder les siens** et le dire au compte rendu.

---

## Compte rendu *(rempli par Claude Code)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
