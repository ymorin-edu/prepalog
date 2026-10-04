# Brief de séance — ENT-2.4 Cdiscount « Évaluation de l'inventaire »

**Statut** : **abandonné** (03/10/2026, refonte de la série Cdiscount) — remplacé par `docs/briefs/ENT-2.5-compte-a-rebours.md` (évaluation « Le compte à rebours », un jeu par élève). Voir `docs/briefs/COORDINATION-cdiscount.md`. Ne pas implémenter.
**Date du brief** : 02/10/2026
**Ordre de travail conseillé** : **3/3** — après ENT-3.3 et ENT-3.4 (pas d'urgence : elle sert **après la PFMP**, reprise le 4/01). Tout en `pret: false`.
**Conversation d'origine** : « Prepalog — chantier D » (cadrage : `prepalog-c16-cadrage-1L`, `prepalog-chantier-d-etat`, `prepalog-inventaire-format`, `prepalog-ent22-inventaire-tournant`)

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-2.4 |
| `id` (jamais modifié ensuite) | à choisir en suivant les `id` voisins (`cdiscount-mouvements`, `cdiscount-inventaire`, `cdiscount-regularise`…) — **le noter dans le compte rendu** |
| Titre / desc | « Cdiscount — l'inventaire de la semaine » (titre à affiner) / un inventaire neuf, seul, sans correction : tu rends ta copie |
| Rubrique | simulog |
| Entreprise | Cdiscount (validé, vérifié) — `contenus/cdiscount.js` |
| Niveau(x) | 1re Bac Pro Logistique |
| Compétence(s) | C1.6 Gérer le suivi des stocks (C1.6.1 flux d'information, C1.6.2 inventaire) |
| Temps pédagogique | **évaluation** (coefficient 3) |
| Notation | **copie rendue** (`meta.copie: true` + `copie: meta.copie` dans `creerEntreprise`) ; `noter` exporté |
| Barème | jalons réussis / jalons à la remise, figé |
| Base | **une base par séance** (pas de `jeuId` partagé) ; `reinitialisable` **absent** (réservé aux séances X.1 par un test) |
| `pret` à la livraison | **false** |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

- **Vérifié** : Cdiscount, entrepôts de Cestas (petits colis) et de Saint-Mard (électroménager, meubles) — fiche `prepalog-carte-couverture`. **Les chiffres du Journal du Net sont anciens
  (à dater et rafraîchir) : n'en écrire aucun dans la séance** sans nouvelle vérification.
- **Construit** : catalogue (24 articles, 8 fournisseurs, 8 marques **inventés**), clients et téléphones fictifs (`.example`, 05 36 49 xx xx), mouvements, relevé, messages — déjà dit en tête de `contenus/cdiscount.js`.
- **Logo** : déjà en place (PNG recoloré `#3732ff`, accord de Tristan) ; support autorisé : bandeau, trames. **Pas** sur des faux documents commerciaux.
- **Documents reconstitués** : « Document pédagogique — reconstitution, non contractuel ».

## 3. Objectif pédagogique

L'élève mène **seul** un inventaire tournant de bout en bout : recopier le relevé, **calculer** les écarts (valeur incluse), **enquêter** dans les mouvements et la messagerie,
**décider** pour chaque écart (régulariser avec le bon motif / remettre en rayon / recompter), **calculer le taux d'écart**. Aucune notion nouvelle : les pièges sont ceux
d'ENT-2.1 à 2.3. Pas de correction à l'écran.

## 4. Déroulé

1. **Mail de mission** + relevé de comptage par la messagerie (`kind: 'releve'`, **source `'releve'`**), jeu de données **neuf**.
2. **Écran Inventaire** (`core/types/inventaire.js`) : `aveugle: true`, `ecarts: 'eleve'`, **`correction: 'aucune'`**, `motifObligatoire: true` ; l'élève lit **Mouvements** et messagerie pour comprendre chaque écart.
   KPI d'accueil : **`kpis: ['mail']`** (le KPI « stock » fuit pendant le comptage à l'aveugle — contournement déjà utilisé en ENT-2.2).
3. **Validation définitive** de l'inventaire (étape 4 de l'écran), puis **« Rendre ma copie »**. *(Les deux gestes sont distincts : voir §7 et question n° 2.)*
4. **Copie rendue** : écran sans note ; enseignant : ramasser / rouvrir.

## 5. Jalons / notation

Format de données et `bilanInventaire(db, INVENTAIRE, CATALOGUE)` : `claude/prepalog-inventaire-format.md` (§3). Proposition — **6 jalons**, à confirmer (question n° 3) :

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1 | `saisie` : relevé recopié sans faute | `b.saisieOk` | |
| 2 | `ecarts` : écarts (quantité **et** valeur) calculés justes | `b.ecartsOk`, `lignes[].valeur` | évaluation (`correction: 'aucune'`) : les écarts faux sont **gardés tels quels**, pas refusés |
| 3 | `rayon` : décisions « remettre en rayon » justes (retour resté en zone retours, article mal rangé) | `lignes[].action` vs attendu | ne pas juger avant la validation ; **ne rien décider ne rapporte rien** |
| 4 | `regul` : régularisations justes **avec le bon motif** (casse non saisie…) | `lignes[].action`, `.motif` | motif faux = ko ; réflexe « tout régulariser » = ko |
| 5 | `recompte` : l'écart d'erreur de comptage traité par **recomptage** | `lignes[].action` / `recomptes` | |
| 6 | `taux` : taux d'écart juste (en quantité, avant traitement, tolérance ± 0,1 point) | `b.tauxOk` | |

Un jalon faux ne fait tomber que lui. Barème : jalons réussis / jalons, à la remise.

## 6. Contenu (données)

Fichiers à créer : `contenus/cdiscount-evaluation.js`, `activites/cdiscount-evaluation.js` (noms indicatifs : **suivre la convention des fichiers voisins**),
`export const noter = (db) => moteur.noter(db);`, une ligne dans `activites/index.js`, bloc de test dans `outils/test/cdiscount.mjs`, ligne de la liste Simulog de `outils/test/socle.mjs`,
une option dans `outils/essai-cdiscount.html`.

Scénario à construire (**propositions**, Claude Code vérifie la cohérence puis fait relire par Tristan) :

- **autre zone que l'allée A (ENT-2.2) et l'allée B (ENT-2.3)** ; **8 à 10 références** tirées du catalogue de 24 (vérifier lesquelles ne servent pas déjà) ;
  volume standard (le niveau d'aisance n'existe pas encore : ne rien déclarer en plus) ;
- **les pièges vus en 2.1 à 2.3, chacun une fois, sans notion nouvelle** : un retour saisi mais resté en zone retours (→ rayon) ; une casse non saisie (→ régulariser, « Casse ») ;
  une erreur de comptage (→ recompter, `recompte` ≠ `compte`) ; un article rangé au mauvais emplacement (paire +n / −n) ; **une ligne témoin** de démarque inconnue (→ régulariser) comme en ENT-2.2 ;
  les autres références sans écart (pour qu'**accuser tout** ne rapporte pas) ;
- **le taux d'écart attendu est recalculé par le code**, jamais recopié (dans un test : écrit à la main) ;
- messagerie : relevé + indices **ordinaires** (`text`) ; **jamais de message qui donne la décision** (pas de correction en évaluation) ;
- **jamais de données réelles de Cdiscount** : tout est reconstitué, et dit.

## 7. Demandes au moteur (si le moteur ne sait pas faire)

**À vérifier AVANT d'écrire la séance** (lire `core/types/inventaire.js`, `core/types/entreprise.js`, `core/copie.js`, `core/app.js`) : le mode « copie rendue » (chantier A) a été livré pour la **tournée**
et la **feuille de calcul**. **Fonctionne-t-il avec l'écran Inventaire ?** Points à contrôler :

1. en copie, le moteur sait-il lire `bilanInventaire` pour noter à la remise (`noter(db)`) ?
2. le geste « Valider définitivement » de l'inventaire et « Rendre ma copie » : l'élève peut-il rendre sans valider (décisions jamais posées → jalons ko) ? Est-ce acceptable ou faut-il un avertissement ?
3. `correction: 'aucune'` + copie : aucune fuite (message de refus, bilan, console `.getstock` après validation)…
4. après remise, l'écran Inventaire est-il figé (plus de saisie) ?

**Si l'un de ces points manque** : **ne pas toucher à `core/`** dans la séance ; l'inscrire ici et dans `docs/decisions.md`, et un chantier moteur dédié s'en charge **avant** la séance.

## 8. Tests attendus

Bloc `cdiscount` (`outils/test/cdiscount.mjs`), cas préfixés **« ENT-2.4 »** (le bloc est à 43 cas avec 2.2 et 2.3).

- données : chaque `ref` existe au catalogue ; relevé cohérent avec les mouvements semés ; taux attendu recalculé = taux écrit à la main ;
- comptage à l'aveugle : stock invisible **jusqu'à la validation** (écran Stock et console), l'enseignant voit tout ;
- copie vide = 0 jalon ; copie parfaite = tous ; ne rien décider = 0 pour `rayon` / `regul` / `recompte` ;
- **réflexe « tout régulariser » = jalons rayon et recompte ko** ; motif faux = `regul` ko ; écarts faux gardés tels quels, `ecarts` ko ;
- remise **une seule** ; note figée ; **ramasser / rouvrir** sur cette séance (réutiliser le helper du test du suivi d'ENT-3.4 s'il existe déjà) ;
- aucune erreur console, aucune requête extérieure ; `test-seances.mjs` vert ; suite entière.

**Sabotages à éprouver** : stock visible pendant le comptage ; écarts faux refusés (alors qu'ils doivent être gardés) ; décision jugée avant validation ; taux recopié au lieu de recalculé ;
2ᵉ remise acceptée ; jalon `regul` qui accepte n'importe quel motif ; correction affichée en copie.

## 9. Supports pour les élèves

- Trame élève : **non** (à l'écran) ; Corrigé enseignant (`contenus/corriges/ENT-2.4.js`) : à écrire après validation, modèle `prepalog-trame-ent21.md` ; Diaporama : non.

## 10. Critères de validation par Tristan

`http://localhost:8000/outils/essai-cdiscount.html` (Ctrl + Maj + R, code **STOCK24**), choisir ENT-2.4 : (1) le **stock système est invisible** pendant le comptage ; (2) **aucune correction** n'apparaît
nulle part ; (3) les pièges sont **ceux déjà vus**, sans notion neuve ; (4) « tout régulariser » **perd des points** ; (5) rendre la copie : une fois, note figée, plus de note affichée ; (6) côté prof :
ramasser et rouvrir marchent ; (7) aucune erreur dans la console.

## 11. Questions ouvertes

- [ ] **1. Quelle zone / quelles références** pour la journée neuve ? *(Claude Code propose 2 jeux de références, Tristan choisit.)*
- [ ] **2. Rendre sans valider l'inventaire** : refuser (message « validez d'abord ») ou laisser rendre une copie qui aura 0 aux décisions ? *Recommandation : laisser rendre, avec un avertissement clair avant la remise.*
- [ ] **3. 6 jalons ?** Fusionner ou séparer `rayon` / `regul` / `recompte` ? Le **calcul de la valeur** des écarts (en €) est-il un jalon à part ?
- [ ] **4. Taux d'écart** : en quantité (format actuel) — faut-il aussi en valeur ? *Par défaut : quantité seulement.*
- [ ] **5. Chiffres Cdiscount à rafraîchir** (volume d'entrepôt, camions) : on n'en écrit **aucun** dans la séance, sauf accord de Tristan après nouvelle vérification.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** : bloc / suite entière, nombre de cas, sabotages éprouvés
- **Commits** : *(hash + message)*
- **Reste ouvert** :
