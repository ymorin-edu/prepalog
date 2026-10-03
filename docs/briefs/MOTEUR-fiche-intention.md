# Brief de chantier — MOTEUR : bouton « Fiche d'intention » (Cdiscount C0, tous les scénarios)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis implémente le brief docs/briefs/MOTEUR-fiche-intention.md. Annonce la durée avant de commencer, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§7).
> ```

**Statut** : à implémenter
**Date du brief** : 03/10/2026
**Modèle** : Sonnet — **Durée estimée par Cowork** : 30 à 45 min.
**Touche le moteur** : oui (`core/prof.js`, `activites/index.js`, peut-être `core/types/entreprise.js`) → s'inscrire
dans `docs/EN-COURS.md`. **Peut passer n'importe quand** dans la série (petit, utile dès la première fiche).
**Conception** : fiches du projet `claude/prepalog-fiche-intention-pedagogique.md` et
`claude/prepalog-cdiscount-serie-decisions.md` (décision 17).

## 1. Décision de Tristan (03/10/2026, décision 17)

Chaque scénario Logisim a **une fiche d'intention pédagogique** (compétences, savoirs, parcours élève séance par
séance, ce que l'enseignant doit dire ou savoir, pièges voulus, filet de sécurité). **Word + PDF générés par Cowork**
(générateur reproductible, comme les trames), **rangés dans le dépôt**, ouverts par un **bouton « Fiche d'intention »
sur chaque séance du scénario, visible de l'enseignant seul, à côté du corrigé**. Pour tous les scénarios ; la
première sera Cdiscount (une seule fiche pour ENT-2.1 à 2.6).

## 2. Ce qui existe

- L'onglet **« Corrigés »** de l'espace enseignant (`core/prof.js`) est rangé par entreprise puis par séance : un
  sommaire avec logo, un bouton par séance (décision du 03/10/2026, `docs/decisions.md`).
- La table `ENTREPRISES` de `activites/index.js` déclare, par numéro d'entreprise : nom, métier, logo.
- Le bandeau d'une séance d'entreprise porte déjà les liens de trame (`trame: { pdf, docx }`, « déclarer c'est
  valider ») ou la mention `sansTrame`.

## 3. À construire

**Déclaration : une fois par scénario**, dans la ligne de l'entreprise (table `ENTREPRISES`) :

```js
intention: { pdf: './contenus/intentions/cdiscount-intention-pedagogique.pdf',
             docx: './contenus/intentions/cdiscount-intention-pedagogique.docx' }
```

Toutes les séances de cette entreprise en héritent : pas de champ à recopier dans chaque `meta`.
**Déclarer, c'est valider** (même règle que les trames) : tant que Tristan n'a pas relu la fiche, la ligne n'a pas
de champ `intention` et aucun bouton n'apparaît.

**Deux endroits où le bouton apparaît, pour l'enseignant seulement :**

1. **Onglet « Corrigés »** : à côté du bouton de chaque séance de l'entreprise (ou en tête de l'entreprise, au choix
   de Claude Code, l'important étant qu'on le trouve depuis chaque séance) : « Fiche d'intention (PDF) » et « (Word) ».
2. **Bandeau de la séance** quand c'est l'enseignant qui l'ouvre (`ctx.profil` enseignant) : à côté des liens de
   trame, « Fiche d'intention ». Jamais pour un élève, jamais dans une vue projetable de classe.

Le dossier `contenus/intentions/` est créé vide avec un `LISEZMOI.md` d'une ligne (« fiches d'intention générées par
Cowork ; déclarées dans `ENTREPRISES` après relecture de Tristan »).

## 4. Point d'attention : le fichier est public

Comme les corrigés (voir `CLAUDE.md`), un fichier du dépôt est lisible par qui connaît l'adresse. **La fiche ne doit
contenir aucun secret** : elle dit « le code d'accès au Stock que vous avez défini dans votre espace », jamais une
valeur. Le dire dans le `LISEZMOI.md` du dossier (Cowork en tiendra compte au moment d'écrire la fiche).

## 5. Tests

`outils/test/socle.mjs` (le cas « onglet Corrigés » existe) :

- entreprise avec `intention` → le bouton apparaît dans l'onglet Corrigés pour chacune de ses séances ;
- entreprise sans `intention` → aucun bouton ;
- séance ouverte par un élève → aucun lien « Fiche d'intention » dans le bandeau ; par l'enseignant → présent ;
- **sabotage** : afficher le lien sans tester le profil → le cas élève doit échouer.

## 6. Documentation

Une ligne dans `activites/FICHE-SEANCE.md` (le champ `intention` de `ENTREPRISES`), une ligne au journal
`docs/decisions.md`.

## 7. Questions — toutes tranchées

> **Réponses données d'avance (03/10/2026, Cowork)** : ne pas s'arrêter ; appliquer ces choix et **lister au compte
> rendu** ce que tu as choisi seul.

### Détails tranchés par Cowork (à corriger à l'écran par Tristan)

- [x] Déclaration au niveau de l'**entreprise** (table `ENTREPRISES`), pas dans chaque `meta` : une fiche par scénario.
- [x] Nom du champ : `intention: { pdf, docx }`.
- [x] Dossier : `contenus/intentions/`, fichiers `<entreprise>-intention-pedagogique.pdf/.docx`.
- [x] Libellé du bouton : « Fiche d'intention » (PDF et Word, comme les trames).
- [x] Deux emplacements : onglet Corrigés **et** bandeau de séance côté enseignant.
- [x] Placement exact dans l'onglet Corrigés : choisi par Claude Code, jugé à l'écran par Tristan.
- [x] Aucune fiche n'est déclarée dans ce chantier (Cowork la fabrique après validation des séances Cdiscount).

---

## Compte rendu *(rempli par Claude Code)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
