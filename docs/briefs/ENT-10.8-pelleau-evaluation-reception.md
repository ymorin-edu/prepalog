# Brief de séance — ENT-10.8 Transports Pelleau — évaluation : recevoir le camion de ramasse (CAP OL, évaluation CAP-C1.3)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, les briefs ENT-10.5 à ENT-10.7 puis docs/briefs/ENT-10.8-pelleau-evaluation-reception.md en entier. Les poids du §5 sont validés par Tristan ; annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : à implémenter · **Date** : 18/10/2026 · Cowork, sur délégation · **Modèle** : Sonnet · **Durée estimée** : ≈ 4 h.

---

## 0. Règles communes

Feuille de route Pelleau ; **mardi 19 mai, 7 h**. `copie: true`, sans aide, sous surveillance, un jeu tiré par élève ; rien ne dit juste ou faux avant
la remise ; le quai se joue avec `rendCopie: false` (la copie se rend après le compte rendu).

Écrans : **Avant de commencer (notée) → Le planning et la préparation → Loïc (dialogue, mode évaluation) → Le quai A → Rapprocher → Rendre compte**
→ remise.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.8 / `pelleau-evaluation-reception` |
| Titre / desc | « Transports Pelleau — évaluation : recevoir le camion de ramasse » / « Recevoir seul un camion de ramasse : préparer, accueillir, vérifier le quai, trier par client, rapprocher des annonces et rendre compte, sans aide. » |
| Compétence / temps | `CAP-C1.3`, `temps: 'evaluation'` |
| Notation | `bareme: 20`, `copie: true`, `noter`, `parcours`, `precedente: 'pelleau-feuille-de-ramasse'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 4. Déroulé (≈ 45 min)

- **Ouverture notée** (4 / 20) : `tirage: { preparation: 3, image: 1 }` parmi les questions `cle` d'ENT-10.5 à 10.7 (annonce, feuille de ramasse,
  étiquette de palette ; img-porteur-quai), « Je ne sais pas », faux = − 1 ÷ (mauvaises réponses), plancher 0.
- **Étape 1** : document « Planning des quais du mardi 19 mai » (grille tirée parmi 2) + feuille de ramasse + annonces ; fiche « Préparer » 3 lignes :
  heure du camion de Loïc · quai · nombre de palettes par client (un client tiré).
- **Étape 2** : dialogue `pelleau-loic-108` en mode évaluation (2 tours : feuille ; moteur, cale, local).
- **Étape 3** : quai `pelleau-quai-108`, `copie` : 1 défaut tiré (4 objets) + 1 point en ordre ; dépose par client (premier clic pose) ; 4 palettes,
  répartition tirée (2 + 2 ou 3 + 1).
- **Étape 4** : « Rapprocher » : écart tiré (`aucun` / `moins` / `plus` / **`feuille`** : l'erreur d'écriture d'ENT-10.7), au plus un.
- **Étape 5** : phrases (reçu, écart calculé, fin) → « Rendre ma copie ».

## 5. Jalons — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids |
|---|---|---|
| **Avant de commencer** | 4 questions | **4** |
| **Préparer** | 3 lignes, 2/3 chacune | **2** |
| **Accueillir** | 2 répliques, 1 chacune | **2** |
| **Avant de décharger** | défaut 2 · aucun faux 1 | **3** |
| **Trier par client** | 4 palettes, 1 chacune | **4** |
| **Rapprocher** | 2 clients × 1,5 (reçues 0,75 + résultat 0,75 ; pour `feuille` : la palette et la correction) | **3** |
| **Rendre compte** | contenu 1,5 · forme 0,5 | **2** |
| **Total** | | **20** |

Pas de questions au fil (évaluation). Inaction : 0.

## 6 bis. Tirage

Socle tiré, ni bonus ni niveau. Écart : quart chacun sur 300 graines. Équité : chaque copie a exactement 1 défaut, 4 palettes, au plus 1 écart.

## 7. Demandes au moteur

Aucune. **À vérifier** : `depose` en copie avec `client` (prévu au `MOTEUR-depose-par-client.md`) ; `rendCopie: false`.

## 8. Tests (bloc `pelleau-recep`)

Parcours juste sur 4 graines (un par écart) → 20/20 ; inaction → 0 ; rien ne dit juste / faux avant la remise ; ouverture : plancher 0 ; premier clic
faux en dépose → jalon ✗, palette dessinée là à ④ (ici : pas d'étape ④, `arret` : dessinée là en fin de déchargement).

## 9 à 11

Pas de trame ; corrigé enseignant par élève. Critère : 45 min. Question ouverte : aucune.

---

## Compte rendu *(rempli par Claude Code à la livraison)*
