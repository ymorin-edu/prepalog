# Brief de réglage — Cdiscount : renumérotation des séances (C3)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis applique le brief docs/briefs/CDISCOUNT-renumerotation.md. Annonce la durée, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§6).
> ```

**Statut** : à implémenter — après ENT-2.1 recadrée (C2).
**Date du brief** : 03/10/2026
**Modèle** : Sonnet — **Durée estimée par Cowork** : 30 à 45 min (codes, textes, tests, documentation).
**Touche le moteur** : non (activités, contenus, tests, docs).

## 1. Décision de Tristan (03/10/2026)

La série recadrée insère une séance nouvelle en ENT-2.2 (« Ce que disent les chiffres ») et décale les suivantes.
**Aucun élève n'a travaillé sur la série et aucun n'y travaillera avant la fin du chantier** : on renumérote librement,
**les `id` ne changent pas** (ils sont écrits dans les chemins Firebase), aucune note n'est en jeu.

| `id` (inchangé) | Code aujourd'hui | Code après | Titre |
|---|---|---|---|
| `cdiscount-mouvements` | ENT-2.1 | ENT-2.1 | Le stock raconte |
| *(nouvelle, C6)* | — | **ENT-2.2** | Ce que disent les chiffres |
| `cdiscount-inventaire` | ENT-2.2 | **ENT-2.3** | Inventaire tournant |
| `cdiscount-regularise` | ENT-2.3 | **ENT-2.4** | Régularisé à l'aveugle |
| *(nouvelle, C8)* | — | ENT-2.5 | Le compte à rebours (évaluation) |
| *(nouvelle, C9)* | — | ENT-2.6 | Bonus |

Entre ce chantier et C6, le code ENT-2.2 reste libre : c'est attendu.

## 2. À faire

1. `activites/cdiscount-inventaire.js` : `code: 'ENT-2.3'` ; `activites/cdiscount-regularise.js` : `code: 'ENT-2.4'`.
2. **Les deux passent en `ouverture: 'prof'`** (`pret: true` gardé) pendant le chantier — demandé dans
   `docs/decisions.md` ; ENT-2.1 l'a déjà reçu en C2.
3. **Alerte « code changé »** (`CLAUDE.md`) : chercher partout l'ancien code et le texte qui le cite —
   commentaires d'en-tête des activités et des contenus (« ENT-2.2 — Cdiscount, séance … »), chaînes `EXERCICE`
   (« Exercice 2 : … » → « Exercice 3 : … » ; « Exercice 3 : … » → « Exercice 4 : … »), messages qui citent une séance
   par son numéro, `outils/test/cdiscount.mjs` et tout autre bloc qui teste un code (`visibilite`, `transport`…),
   pages d'essai (`outils/essai-inventaire.*`), `README.md`, `docs/LISEZMOI.md`, `activites/FICHE-SEANCE.md`
   (exemples « ENT-2.4 »). **Les briefs et le journal ne se réécrivent pas** (historique) : on ajoute, on ne corrige pas.
4. Corrigés et trames : aucun fichier `ENT-2.2*` ni `ENT-2.3*` n'existe dans `contenus/corriges/` ni
   `contenus/trames/` (vérifié le 03/10) ; vérifier quand même au moment du chantier.
5. Une ligne au journal `docs/decisions.md` : « 03/10/2026 · Tristan · Cdiscount renuméroté : inventaire → ENT-2.3,
   régularisé → ENT-2.4 (ids inchangés) ; ENT-2.2, 2.5, 2.6 à venir. Brief `CDISCOUNT-renumerotation.md`. »
6. L'ancien brief `docs/briefs/ENT-2.4-cdiscount-evaluation-inventaire.md` est **déjà marqué « abandonné »** par
   Cowork (03/10/2026) : ne pas y toucher.

## 3. Tests

Suite entière verte. Ajouter (ou vérifier qu'existe) un cas qui relit les codes des séances Cdiscount et refuse un
doublon de `code` dans `activites/index.js`. **Sabotage** : donner le même code à deux séances → le cas échoue.

## 4. Critères de validation par Tristan

Dans la pastille Logisim, sous le logo Cdiscount : ENT-2.1, ENT-2.3, ENT-2.4 dans cet ordre, toutes trois marquées
fermées aux élèves ; aucune séance ne s'appelle encore ENT-2.2.

## 5. Ce que ça ne fait pas

Ne change ni données, ni jalons, ni écrans : ENT-2.3 et ENT-2.4 sont recadrées plus tard (C4, C7).

## 6. Questions — toutes tranchées

> **Réponses données d'avance (03/10/2026, Cowork)** : ne pas s'arrêter ; appliquer ces choix et **lister au compte
> rendu** ce que tu as choisi seul.

### Détails tranchés par Cowork (à corriger à l'écran par Tristan)

- [x] Titres inchangés (« Cdiscount — inventaire tournant », « Cdiscount — régularisé à l'aveugle ») : ils seront
  revus avec leur recadrage.
- [x] `EXERCICE` renumérotés : « Exercice 3 : faire l'inventaire d'une allée », « Exercice 4 : contrôler les ajustements
  de la semaine ».
- [x] Les deux séances fermées (`ouverture: 'prof'`) dès ce réglage, pas seulement à leur recadrage.

---

## Compte rendu *(rempli par Claude Code)*

- **Fichiers modifiés** :
- **Occurrences de l'ancien code laissées volontairement** (et pourquoi) :
- **Tests** :
- **Commits** :
