# Brief de séance — ENT-10.7 Transports Pelleau — la feuille de ramasse se trompe (CAP OL, entraînement CAP-C1.3, erreur induite)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, docs/briefs/ENT-10.6-pelleau-ramasse-du-mercredi.md puis docs/briefs/ENT-10.7-pelleau-feuille-de-ramasse.md en entier. Les poids du §5 sont validés par Tristan ; annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : à implémenter · **Date** : 18/10/2026 · Cowork, sur délégation · **Modèle** : Sonnet · **Durée estimée** : ≈ 4 h.

---

## 0. Règles communes

Feuille de route Pelleau ; **lundi 18 mai, 7 h 30** (après le pont de l'Ascension). **L'erreur induite** : Loïc, pressé, a rempli sa feuille de ramasse trop vite : **une palette
y est notée chez le mauvais client**. Il dit : « Pose comme c'est écrit sur la feuille, j'ai tout noté. » L'étiquette de la palette, elle, dit vrai.
L'élève doit **suivre l'étiquette**, voir que l'écart avec les annonces vient d'une **erreur d'écriture** (un client +1, l'autre −1) et le dire.

Écrans : **Avant de commencer → Préparer → Loïc (dialogue) → Le quai A → Rapprocher → La feuille corrigée → Rendre compte** → bilan.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.7 / `pelleau-feuille-de-ramasse` |
| Titre / desc | « Transports Pelleau — la feuille de ramasse se trompe » / « Trier les palettes d'après leur étiquette même quand la feuille dit autre chose, trouver l'erreur d'écriture et la faire corriger. » |
| Compétence / temps | `CAP-C1.3` (C1.3.4 surtout), `temps: 'entrainement'` (erreur induite) |
| Notation | `bareme: 20`, `parcours`, `correction`, `bilanDetail`, `precedente: 'pelleau-ramasse-du-mercredi'` ; `niveauxPrevus: ['confirme']` ; `questions: 'ENT-10.7'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

Comme ENT-10.5. L'erreur de Loïc est construite.

## 3. Objectif

Savoir **quel document croire** à la réception : l'étiquette de la palette et ce qu'on voit, avant une feuille écrite à la main ; ne pas « faire coller »
les chiffres ; faire corriger le document.

## 4. Déroulé (≈ 45 min)

- **Étape 1 — Préparer** (comme ENT-10.6, 2 lignes) : les valeurs viennent de la **feuille** (fausse) et des **annonces** (justes) : l'élève voit déjà
  que la feuille et les annonces ne disent pas la même chose (Ar Vag : feuille 3, annonce 2 ; Agri-Kerlann : feuille 1, annonce 2). La fiche demande
  seulement le total (4) et le nombre de clients (2) : rien n'est faux à ce stade.
- **Étape 2 — Loïc** (`pelleau-loic-107`, 2 tours) : 1) feuille ; 2) Loïc : « Pose comme c'est écrit sur la feuille, j'ai tout noté, on gagne du
  temps. » — **« Je regarde quand même chaque étiquette avant de poser. »** · « D'accord, je suis la feuille. » · « Alors je ne regarde rien. »
- **Étape 3 — Le quai A** (`pelleau-quai-107`) : inspection 1 défaut tiré (comme ENT-10.6) ; dépose par client, 4 palettes, **2 + 2 en vrai** ; la palette
  **mal notée** (tirée parmi les 4) a pour étiquette son vrai client ; la légende de la pause dit l'étiquette (moteur). Le jalon de cette palette est
  son premier clic **dans la zone de son vrai client** (poids plus fort, §5).
- **Étape 4 — Rapprocher** : reçues **comptées dans la zone** (2 et 2) contre les annonces (2 et 2) → **conforme** pour les deux ; et une ligne de plus :
  « La feuille de ramasse est-elle juste ? » — **Non : la palette P{n} est notée chez Ar Vag, son étiquette dit Agri-Kerlann** (choix calculés : la
  bonne palette et la bonne correction, deux pièges : une autre palette ; « oui, elle est juste »).
- **Étape 5 — La feuille corrigée** (fiche `liste`, 1 ligne) : « Qui corrige la feuille ? » — **Loïc, qui l'a écrite, avec Maëlys** · moi, je raye et
  je réécris seul · personne, c'est trop tard.
- **Étape 6 — Rendre compte à Maëlys** (phrases) : reçu (« 4 palettes, 2 par client, conformes aux annonces ») · l'erreur (calculée) · fin.
- **Fin** : Maëlys : « Merci, je vois ça avec Loïc. » ; `finFige` (dialogue, quai).

## 4 bis. Questions au fil — choix de Cowork : A, B, C

| id | Geste | Qui | Question (juste en gras) | Notée | Corrigée |
|---|---|---|---|---|---|
| `croire-quoi` (A) | `dialogue:pelleau-loic-107:fin` | Erwan | « La feuille et l'étiquette ne disent pas la même chose. Tu crois… » — **l'étiquette, posée sur la palette par le client** (`etiquette`) · la feuille, c'est Loïc qui l'a écrite (`feuille`) · ce qui t'arrange (`arrange`) | **1,5** | **au bilan** (donnerait la dépose) |
| `si-on-suit` (B) | `fiche:rapprocher:envoyer` | Erwan | « Si on avait suivi la feuille, que se passerait-il le jour où Ar Vag reprend ses palettes ? » — **on lui rendrait une palette d'Agri-Kerlann** (`erreur`) · rien (`rien`) · Ar Vag paierait moins (`paie`) | **1,5** | tout de suite (éco-droit appliqué : C. civ. 1932) |
| `qui-corrige` (C) | `fiche:corriger` | Maëlys | « Pourquoi ne pas raturer seul la feuille ? » — **elle est signée : on corrige avec celui qui l'a écrite, pour qu'elle reste une preuve** (`preuve`) · pour aller plus vite (`vite`) · ça ne change rien (`rien`) | **1** | tout de suite |

## 4 ter. Avant de commencer

Banque d'ENT-10.5, `tirage: { preparation: 3, image: 1 }`.

## 5. Jalons — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids |
|---|---|---|
| **Préparer** | 2 lignes | **1** |
| **Accueillir Loïc** | réplique 1 (feuille) 0,5 · réplique 2 (« je regarde l'étiquette ») 1,5 | **2** |
| **Avant de décharger** | défaut 2 · aucun faux 1 | **3** |
| **Trier par client** | la palette mal notée 2 · les 3 autres 0,5 chacune | **3,5** |
| **Rapprocher** | 2 × (reçues 0,5 + résultat 0,5) · « la feuille est-elle juste ? » 2 | **4** |
| **Faire corriger** | qui corrige 1 | **1** |
| **Rendre compte** | l'erreur 1 · forme 0,5 | **1,5** |
| **Questions** | A 1,5 · B 1,5 · C 1 | **4** |
| **Total** | | **20** |

## 6 / 6 bis. Contenu et tirage

`contenus/pelleau-ent107.js` etc. Tirés : la palette mal notée (P1 à P4, uniforme), le sens de l'erreur (Ar Vag ↔ Agri-Kerlann), le défaut du quai,
l'ordre dans le camion. **Contrôle** : la feuille fausse donne toujours +1 / −1 ; les annonces restent conformes au vrai ; 3 cases par client pour
2 palettes chacun (3 + 3 + 2 pièges = 8 : il reste toujours une case libre de chaque client, la dernière palette ne se pose pas par élimination). Confirmé : aucun bonus ;
document « Règles du quai » non joint.

## 7. Demandes au moteur

Aucune. **À vérifier** : la légende de la pause dit l'étiquette (option du `MOTEUR-depose-par-client.md` §3) et **jamais** la feuille.

## 8. Tests

300 graines : la palette mal notée varie ; parcours juste → 20/20 ; « je suis la feuille » + dépose selon la feuille → blocs 2 et 4 ✗, la palette mal
notée ✗ seule ; « la feuille est juste » → ✗ ; inaction → 0 ; A au bilan.

## 9 à 11

Trame : feuille de ramasse imprimée (la fausse) pour la correction en classe. Critère : la contradiction feuille / étiquette se voit sans aide.
Question ouverte : faut-il que Loïc s'excuse au message de fin ? (Défaut : non, Maëlys gère.)

---

## Compte rendu *(rempli par Claude Code à la livraison)*
