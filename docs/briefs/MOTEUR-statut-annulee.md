# Brief de chantier — MOTEUR : statut « Annulée » des commandes (Cdiscount C1)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis implémente le brief docs/briefs/MOTEUR-statut-annulee.md. Annonce la durée avant de commencer, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§6).
> ```

**Statut** : à implémenter
**Date du brief** : 03/10/2026
**Modèle** : Sonnet — **Durée estimée par Cowork** : 20 à 30 min, tests compris.
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

---

## Compte rendu *(rempli par Claude Code)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
