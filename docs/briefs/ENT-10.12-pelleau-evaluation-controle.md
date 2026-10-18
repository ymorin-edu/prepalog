# Brief de séance — ENT-10.12 Transports Pelleau — évaluation : contrôler la réception (CAP OL, évaluation CAP-C1.4)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, les briefs ENT-10.9 à ENT-10.11 puis docs/briefs/ENT-10.12-pelleau-evaluation-controle.md en entier. Les poids du §5 sont validés par Tristan ; annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : à implémenter · **Date** : 18/10/2026 · Cowork, sur délégation · **Modèle** : Sonnet · **Durée estimée** : ≈ 4 h.

---

## 0. Règles communes

Feuille de route Pelleau ; **mardi 26 mai, 8 h** (le lundi 25 mai est férié). `copie: true`, sans aide, un jeu tiré par élève, rien ne dit juste ou
faux avant la remise ; `rendCopie: false` (la copie se rend après le compte rendu). Dernière séance de Pelleau.

Écrans : **Avant de commencer (notée) → Le quai A : contrôler, réserves, signature → Rendre compte à Erwan** → remise.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.12 / `pelleau-evaluation-controle` |
| Titre / desc | « Transports Pelleau — évaluation : contrôler la réception » / « Contrôler seul les palettes de la ramasse, décider pour chacune, écrire les réserves, les faire signer et rendre compte, sans aide. » |
| Compétence / temps | `CAP-C1.4`, `temps: 'evaluation'` |
| Notation | `bareme: 20`, `copie: true`, `noter`, `parcours`, `precedente: 'pelleau-palette-froide'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 4. Déroulé (≈ 45 min)

- **Ouverture notée** (4 / 20) : `tirage: { preparation: 3, image: 1 }` parmi les `cle` d'ENT-10.9 à 10.11 (reserve, avarie, couches avec valeurs
  tirées, depot, ambiant ; img-sac), règle des évaluations.
- **Quai** `pelleau-quai-112`, `commence: 'controle'`, feuille de ramasse, motifs `['avarie', 'manquant', 'produit']` (+ refus si l'ENT-10.11 l'a
  trouvé), 4 palettes (2 Ar Vag, 2 Agri-Kerlann, ou 1 de Kervéguen à la place d'une : voir §6 bis), **2 anomalies tirées** + 1 piège de comptage.
- **Phrases** à Erwan (calculées : réserves, zone litiges, et la palette non stockée s'il y en a une) → « Rendre ma copie ».

## 5. Jalons — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids |
|---|---|---|
| **Avant de commencer** | 4 questions | **4** |
| **Contrôler les palettes** | 2 sans problème 1,5 chacune · 2 à problème 2,5 chacune | **8** |
| **Réserves et signature** | réserves justes 1,5 × 2 · pas de déballage 0,5 · signature 0,5 | **4** |
| **Rendre compte** | contenu 3 · forme 1 | **4** |
| **Total** | | **20** |

## 6 bis. Tirage et équité

- Socle : 1 anomalie `facile` (`ecrase-face` / `perce-face`) + 1 `moyen` parmi `cache`, `manquant`, **`froid`** (la palette de Kervéguen remplace alors
  une palette sans problème du même rang) ; 1 piège `couche-normale` ; deux clients différents pour les deux anomalies (Kervéguen compte comme un
  client).
- **Équité** : chaque copie a exactement 2 palettes à problème et 1 piège ; `froid` un tiers des copies environ. Pas de bonus ni de niveau.

## 7. Demandes au moteur

Aucune (ce qu'ENT-10.11 a établi sur « Refuser » s'applique ici).

## 8. Tests (bloc `pelleau-ctrl`)

Parcours juste sur 3 graines (avec `cache`, `manquant`, `froid`) → 20/20 ; inaction → 0 ; rien ne dit juste / faux avant la remise ; 300 graines :
équité vérifiée ; ouverture : plancher 0.

## 9 à 11

Pas de trame ; corrigé enseignant par élève. Critère : 45 min. Question ouverte : aucune.

---

## Compte rendu *(rempli par Claude Code à la livraison)*
