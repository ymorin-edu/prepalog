# Brief de séance — ENT-8.19 Action — évaluation : préparer une commande dans un autre site (CAP OL, évaluation CAP-C3.1 à C3.3)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/MOTEUR-preparation-vocale-cartons.md, docs/briefs/ENT-8.15-action-preparer.md (§0), docs/briefs/ENT-8.14-action-evaluation-stock.md (§0) puis docs/briefs/ENT-8.19-action-evaluation-preparation.md en entier. Les lots 0 à 5 du chantier E-8 doivent être livrés. Fais l'état des lieux du §7, dis-moi ce qui contredit le brief, puis construis la séance. Annonce la durée avant de commencer.
> ```

**Statut** : à implémenter (poids validés par Tristan le 25/10/2026)
**Date du brief** : 25/10/2026, projet PREPALOG. **Modèle** : Sonnet. **Durée estimée** : ≈ 3 h.
**Place dans l'ordre** : après ENT-8.18 (évaluation d'avril dans la progression). Attend les **lots 0 à 5** d'E-8 (le lot 5 : copie, un plan
par site).

---

## 0. Ce qui vaut pour cette séance

- **Tout le §0 d'ENT-8.14** : copie rendue (rien ne dit juste ou faux, aucun bilan, aucun « Corriger »), jeu neuf tiré par élève, sans aide (pas
  de mot cliquable, **pas de question au fil**), « Avant de commencer » **noté** (4 points, « Je ne sais pas », faux = − 1 ÷ nombre de mauvaises
  réponses, plancher 0), un écran par étape, ni bonus ni niveau, jamais un élève bloqué, une erreur ne se paie qu'une fois.
- **Même site d'évaluation qu'ENT-8.5 / 8.6 / 8.10 / 8.14** (`contenus/action-eval-sites.js`, lu par `siteDeBase`) : **Onnaing (GXO)** ou
  **Belleville-en-Beaujolais (Kuehne+Nagel)** ; tuteur **Karim** ou **Sandrine** ; cariste **Léo** ou **Hugo**. GXO à Onnaing fait la
  **préparation** (vérifié, communiqué de GXO, ENT-8.14 §2).
- **Un mardi, 6 h** ; « De retour chez {prestataire} à {site} pour une journée. »
- Les **magasins** viennent de la zone du site (construit) : proposé, pour Onnaing, des magasins Action du Nord (Valenciennes, Maubeuge, Douai) ;
  pour Belleville, de la région lyonnaise (Villefranche-sur-Saône, Mâcon, Lyon) — **à vérifier à la construction** (existence des magasins), sinon
  « un magasin de la région » sans nom.

Écrans : **Avant de commencer (noté) → Prendre mon poste (inspection) → Lire ma mission (fiche) → Préparer et monter (terminal, copie) → Rendre
ma copie.**

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-8.19 (provisoire) / `action-evaluation-preparation` |
| Titre / desc | « Action — évaluation : préparer une commande dans un autre site » / « Dans un entrepôt que tu ne connais pas : prendre ton poste, lire ta mission, suivre le terminal, signaler ce qui ne va pas, monter, filmer et étiqueter ta palette. » |
| Compétence(s) | `competencesCap: ['CAP-C3.1', 'CAP-C3.2', 'CAP-C3.3']` ; ligne dans `ATTENDU_CAP` (alerte 7) |
| Temps / notation | `temps: 'evaluation'`, `copie: true`, `export const noter = (db) => moteur.noter(db);` ; pas de `parcours` ; `bareme: 20` |
| `questions` | `'ENT-8.19'` (ouverture seulement) ; `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit
Vérifié : les sites et prestataires (ENT-8.14 §2). Construit, dit dans la mention : l'entrepôt de préparation de chaque site, la commande, les
codes, l'abîmé, l'emplacement vide, les magasins s'ils ne sont pas vérifiés.

## 3. Objectif
Vérifier, sans aide, que l'élève **prend son poste** et **lit sa mission** (C3.1), **déstocke** en signalant les anomalies (C3.2) et
**conditionne** sa palette (C3.3).

## 4. Déroulé (≈ 50 min)

- **Avant de commencer (noté, 4 questions)** : reprises des questions clés des séances de travail, tirées par élève : `q-circuit` (8.15) ;
  `q-abime` ou `q-vide` (8.16) ; `q-lourd` ou `q-film` (8.17) ; **éco-droit** `q-nuit` (8.15) ou `q-retour` (8.18).
- **Prendre mon poste** (vue Inspection, copie) : **1 défaut tiré** sur le transpalette ou le poste ; « Signaler à {Karim} » ; « C'est bon, je
  prends mon poste » fige, rien n'arrête l'élève.
- **Lire ma mission** (fiche × 2) : quel quai · avant quelle heure (écran d'accueil du terminal dessiné à gauche).
- **Préparer et monter** (E-8, copie) : **7 lignes, un magasin, une palette** : 5 normales, **1 carton abîmé**, **1 emplacement vide** (réserve
  descendue par {Léo}) ; l'ordre du circuit amène un fragile avant un lourd ; film, étiquettes ; « Valider ma préparation » fige, sans verdict.
- **Rendre ma copie** (bandeau).

## 5. Jalons / notation (sur 20) — poids validés par Tristan (25/10/2026, 14 h 26)

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Avant de commencer** | 4 questions, 1 chacune, règle du faux | **4** | moteur des questions | plancher 0 |
| **Prendre en charge** (C3.1) | défaut signalé 1,5 · aucun faux signalement 0,5 · mission : 2 lignes, 1 chacune | **4** | inspection, fiche `mission` | « aucun faux » seulement si l'inspection est figée |
| **Déstocker** (C3.2) | 5 lignes normales, 0,6 chacune · abîmé dit et remplacement pris 1,5 · vide dit et ligne reprise 1,5 | **6** | lignes, lot 3 | abîmé pris sans rien dire = faux |
| **Conditionner** (C3.3) | lourds en bas 1 · fragiles en haut 1 · poids et hauteur 1 · film 1 · étiquettes 2 | **6** | critères du lot 2 | jugés **sur ce qui est posé**, même si une ligne est fausse (décision de Tristan, 25/10 : une erreur ne se paie qu'une fois) ; rien à côté exigé ; palette vide = faux |
| **Total** | | **20** | | |

- **Deux témoins** (un par site) : 20/20 ; inaction : 0/20.

## 6. Contenu (données)
`contenus/action-ent819.js` (+ `-donnees.js` : un entrepôt de préparation par site, clés `onnaing`, `belleville`), `contenus/questions/ENT-8.19.js`,
`activites/action-evaluation-preparation.js`, `contenus/corriges/ENT-8.19.js`. Module des sites : **lu, jamais modifié**. Produits : ceux d'ENT-8.15
§6.2.

## 7. Demandes au moteur
E-8 lots 0 à 5 (copie avec terminal, un plan par site) ; vue Inspection en copie (existe, Pelleau 10.x : à vérifier).

## 8. Tests attendus
Bloc `action-819` (alerte 7). Deux témoins (un par site) 20/20 ; inaction 0/20 ; aucun verdict ni règle visibles avant la copie ; « Avant de
commencer » : « Je ne sais pas » et la règle du faux ; abîmé pris sans rien dire ; somme 20. Non-régression : 8.5, 8.6, 8.10, 8.14 intacts.

## 10. Critères de validation par Tristan
- Rien n'indique juste ou faux avant la copie ; le terminal parle quand même (il guide, il ne corrige pas).
- 50 minutes suffisent au rythme du CAP.

## 11. Questions ouvertes
1. **Tranché par Tristan (25/10)** : poids du §5. **Proposé** : reprise des questions dans « Avant de commencer » ; magasins des sites d'évaluation.
2. **Tranché par Tristan (25/10/2026, 14 h 26)** : en évaluation, le montage se juge **sur ce qui est posé**, même si une ligne est fausse
   (une erreur ne se paie qu'une fois) ; la règle « seulement si les lignes sont justes » reste pour le guidage et l'entraînement.
