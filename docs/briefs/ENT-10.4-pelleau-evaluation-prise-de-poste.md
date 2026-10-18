# Brief de séance — ENT-10.4 Transports Pelleau — évaluation : prendre son poste (CAP OL, évaluation CAP-C1.2)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, les briefs ENT-10.2 et ENT-10.3 (§4 à §6) puis docs/briefs/ENT-10.4-pelleau-evaluation-prise-de-poste.md en entier. Les poids du §5 sont validés par Tristan ; annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : à implémenter · **Date** : 18/10/2026 · Cowork, sur délégation · **Modèle** : Sonnet · **Durée estimée** : ≈ 4 h.

---

## 0. Règles communes

Feuille de route Pelleau. **Lundi 11 mai, 6 h** (le vendredi 8 mai est férié). **Évaluation** : `copie: true`, en classe sous surveillance, **sans
aide**, données tirées neuves ; rien ne dit juste ou faux avant la remise. Un seul jeu par élève.

Écrans : **Avant de commencer (notée) → Où est-ce ? → Mon poste → Yann → Le planning → Rendre compte** → remise de la copie.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.4 / `pelleau-evaluation-prise-de-poste` |
| Titre / desc | « Transports Pelleau — évaluation : prendre son poste » / « Repérer son poste, contrôler le poste et l'engin, refuser ce qui n'est pas sûr, lire le planning des quais et rendre compte, sans aide. » |
| Compétence | `competencesCap: ['CAP-C1.2']` (C1.1 n'a pas de note ici : voir §11) |
| Temps | `temps: 'evaluation'` (coefficient 3) |
| Notation | `bareme: 20`, `copie: true` (+ `copie: meta.copie` dans `creerEntreprise`, `export const noter`), `parcours`, `precedente: 'pelleau-on-commence-quand-meme'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

Comme ENT-10.2 et 10.3. Rien de nouveau.

## 3. Objectif

Évaluer C1.2 : repérer, contrôler (site **et** engin), refuser et proposer, lire le planning, rendre compte.

## 4. Déroulé (≈ 45 min)

### Étape 0 — Avant de commencer, **notée** (4 / 20)

`tirage: { preparation: 4 }`, questions `cle: true` d'ENT-10.1 à 10.3 (transporteur, entreposeur, ramasse, ambiant, epi, prise-poste,
planning-quais, consigner, img-tpe, img-racks), « Je ne sais pas » possible, faux = − 1 ÷ (nombre de mauvaises réponses), plancher 0.

### Étape 1 — Où est-ce ? (fiche `liste`, le plan de l'entrepôt à gauche)

La visite ne se joue pas en copie (moteur) : **fiche** de 3 lignes tirées parmi 6 (« Où attendent les palettes déchargées ? » → zone de réception ;
« Où met-on une palette abîmée ? » → zone litiges ; « Où recharge-t-on le transpalette ? » → local de charge ; « Où Maëlys tient-elle le planning ? » →
bureau ; « Où met-on ses EPI ? » → vestiaire ; « Où compte-t-on les colis ? » → zone de contrôle). Choix : les 7 lieux du plan (numéros).

### Étape 2 — Mon poste (Inspection, `copie`)

- Message d'Erwan : « Prends ton poste. Contrôle ton poste et le transpalette n° 1, et signale-moi ce qui ne va pas. Erwan »
- `pelleau-poste-104` : **2 défauts tirés** — 1 du site (extincteur quai A ou B, ou affichage) **et** 1 du transpalette n° 1 (parmi les 6 d'ENT-10.3) ;
  + 1 point en ordre. Pas d'arrêt, pas de réparation, réponse neutre « Noté. » ; l'élève peut essayer l'avertisseur.

### Étape 3 — Yann (Dialogue, mode évaluation)

Yann : « On a un camion dans dix minutes. Prends le n° 1, on verra ce soir. » — répliques calculées sur les deux défauts (1 juste : « Je prends le
n° 2 après l'avoir contrôlé, je mets le n° 1 de côté, et on travaille au quai où il y a un extincteur [ou : tu me montres le sens de circulation].
Je préviens Erwan. » ; 3 fausses). En évaluation, pas de réaction qui dit juste ou faux.
*(Le transpalette n° 2 est contrôlé en ordre en fond de scène : déclaré `ok` avec `essai: 'sonne'`, pour que la réplique juste existe.)*

### Étape 4 — Le planning (Planning, `copie`)

Grille **tirée** parmi 3 variantes construites (heures de Loïc et du transporteur décalées, quai fermé selon le défaut du site s'il s'agit d'un
extincteur), 2 lectures tirées + 1 carte à poser (client tiré : Ar Vag ou Agri-Kerlann), contrôle de grille au chargement (une seule bonne réponse,
une place juste au moins, **dans chaque variante**).

### Étape 5 — Rendre compte (phrases, `copie`) puis remise

5 lignes : salutation · mon engin (calculé) · le site (calculé) · l'heure du camion (lue dans **sa** grille) · fin. Puis « Rendre ma copie ».

## 4 bis. Questions au fil

Aucune (évaluation : l'ouverture notée tient la place).

## 5. Jalons / notation — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids |
|---|---|---|
| **Avant de commencer** | 4 questions, 1 chacune (règle des évaluations) | **4** |
| **Où est-ce ?** | 3 lignes, 2/3 chacune | **2** |
| **Mon poste** | défaut du site 2 · défaut de l'engin 2 · avertisseur essayé 0,5 · aucun faux 1,5 | **6** |
| **Ne pas céder** | bonne réplique | **2** |
| **Le planning** | 2 lectures 1 chacune · carte posée 1 | **3** |
| **Rendre compte** | engin 0,75 · site 0,75 · heure 0,5 · forme 1 | **3** |
| **Total** | | **20** |

Inaction : 0 (l'ouverture « Je ne sais pas » partout = 0, plancher). Pas de bonus, pas de niveau.

## 6. Contenu

`contenus/pelleau-ent104.js`, `activites/pelleau-evaluation-prise-de-poste.js`, `contenus/corriges/ENT-10.4.js` (par élève : ses défauts, sa grille,
ses justes). Pas de fichier de questions au fil (ouverture dans le contenu, comme ENT-8.10).

## 6 bis. Tirage

Socle tiré, ni bonus ni niveau. Défauts : site 1/3 chacun ; engin : uniforme sur 6. Grille : 3 variantes. **Équité** : les trois grilles ont le même
nombre de camions et la même difficulté de lecture (lectures de rang `facile` + `moyen`).

## 7. Demandes au moteur

Aucune. **À vérifier** : inspection en `copie` (vue nouvelle : prévu dans `MOTEUR-inspection-poste.md` §4) ; dialogue en mode évaluation (ENT-8.10).

## 8. Tests (bloc `pelleau`)

Parcours juste → 20/20 (3 grilles × 2 défauts d'exemple) ; inaction → 0 ; rien ne dit juste/faux avant la remise ; un défaut sur deux signalé → 2 / 6
au bloc ; ouverture : faux − 1/2 avec 3 choix, plancher 0 ; 300 graines : contrôles de grille verts, réplique juste toujours présente.

## 9. Supports

Pas de trame (évaluation) ; corrigé enseignant par élève.

## 10. Critères de validation

45 min suffisent ; l'élève ne voit jamais « juste » ; Tristan relit les 3 grilles.

## 11. Questions ouvertes

- [ ] **C1.1** : pas de note séparée chez Pelleau (évaluée chez Action, ENT-8.5 ; elle revient à chaque découverte). Ses questions clés d'ENT-10.1
  entrent dans l'ouverture, notée au titre de C1.2. (Défaut : ainsi ; autre choix : déclarer aussi `CAP-C1.1` si le moteur sait donner une note par
  compétence — point ouvert déjà noté pour ENT-8.10.)

---

## Compte rendu *(rempli par Claude Code à la livraison)*
