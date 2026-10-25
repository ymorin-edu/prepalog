# Brief de séance — ENT-8.17 Action — monter et conditionner sa palette (CAP OL, guidage CAP-C3.3)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/MOTEUR-preparation-vocale-cartons.md, docs/briefs/ENT-8.15-action-preparer.md (§0) puis docs/briefs/ENT-8.17-action-conditionner.md en entier. Les lots 0 à 3 du chantier E-8 doivent être livrés. Fais l'état des lieux du §7, dis-moi ce qui contredit le brief, puis construis la séance. Annonce la durée avant de commencer.
> ```

**Statut** : à implémenter (poids validés par Tristan le 25/10/2026)
**Date du brief** : 25/10/2026, projet PREPALOG. **Modèle** : Sonnet. **Durée estimée** : ≈ 3 h.
**Place dans l'ordre** : après ENT-8.16. Attend les **lots 0 à 3** d'E-8 (le lot 2 porte « Où poses-tu ? » et l'ordre de pose).

---

## 0. Ce qui vaut pour cette séance

- **§0 d'ENT-8.15**. **Un jeudi, 6 h.** Même entrepôt de préparation.
- Le **montage** se juge sur **l'ordre de pose** (E-8 lot 2) : le terminal impose l'ordre de **prélèvement** (le circuit), l'élève choisit
  l'ordre de **pose** (« Palette » ou « À côté, je les pose après »). Jamais rien de refusé au montage ; on dit **que**, jamais **de combien**.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-8.17 (provisoire) / `action-conditionner` |
| Titre / desc | « Action — monter et conditionner sa palette » / « Les cartons arrivent dans l'ordre du circuit, pas dans celui de la palette : poser à côté pour mettre les lourds en bas et les fragiles en haut, tenir le poids et la hauteur, filmer, étiqueter pour le magasin. » |
| Compétence(s) | `competencesCap: ['CAP-C3.3']` ; ligne dans `ATTENDU_CAP` (alerte 7) |
| Temps / notation | `temps: 'guidage'` ; `parcours`, `correction`, `bilanDetail` ; `precedente: 'action-destocker'` ; `bareme: 20` |
| Niveaux | `niveauxPrevus: ['confirme', 'accompagne']` ; `questions: 'ENT-8.17'` ; `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit
Vérifié : le préparateur d'Ensuès fait le **filmage** (offre 191TDTN). Construit : les limites de poids et de hauteur, le nombre de tours de film,
la place des étiquettes, la commande.

## 3. Objectif pédagogique
À la fin, l'élève sait **lire les pictogrammes** d'un carton, **monter une palette stable** (lourds en bas, fragiles en haut), **respecter le
poids et la hauteur** de la palette, la **filmer** et l'**étiqueter** pour son magasin.

## 4. Déroulé (≈ 45 min)

### Accueil (Samia)
« Bonjour {prénom} ! Le terminal te donne les cartons dans l'ordre de l'allée. Toi, tu montes la palette dans le bon ordre. Si un carton
arrive trop tôt, pose-le à côté. Samia »

### Étape 0 — Avant de commencer (non notée) — §4 ter

### Étape 1 — Lire un carton (fiche, document à gauche)
- À gauche : **trois cartons dessinés** avec leurs pictogrammes (verre fragile, flèches « haut », poids écrit) — noir et blanc lisible.
- Fiche « Lire un carton » (`liste` × 3, cartons tirés) : « Ce carton… » est fragile / est lourd / doit rester debout. Envoi → Samia :
  « Bien. Maintenant, à toi de monter. »

### Étape 2 — Préparer et monter (Plan d'entrepôt, mode `preparation`, terminal vocal, pose « Palette · À côté »)
- **6 lignes, une palette, un magasin** : 2 lourds, 2 normaux, 2 fragiles ; **l'ordre du circuit amène un fragile avant un lourd** (contrôle
  d'équité) : il faut poser « à côté ». Aucune anomalie (vue en 8.16).
- La palette se monte **à gauche** (écran partagé), dans l'ordre de pose ; « ↶ Reposer le dernier » après le terminal.
- **Film** (3 à 5 tours) et **étiquettes** (deux faces opposées + le dessus, au nom du magasin) : gestes de Smoby / 6.7.
- « Vérifier ma préparation » : verdict par critère (le nom seul : « ✗ lourds en bas », « ✗ hauteur »). Les critères de montage ne sont jugés
  **que si les lignes sont justes et que rien ne reste à côté** (règle du moteur).
- Guidage : « Les règles ▾ » ouvertes (lourds en bas, fragiles en haut, {600} kg et {1,60} m au plus, 3 à 5 tours, 3 étiquettes) ; de près,
  la palette affiche son **poids** et sa **hauteur** en direct.

### Fin
Samia : « Belle palette. Demain, deux magasins à la fois. Samia » ; bilan ; « Corriger » rouvre la fiche et la préparation.

**Mots cliquables** : pictogramme, fragile, calage, stabilité, filmer, filmeuse, étiquette, colis, palette.

## 4 bis. Questions au fil — proposées (somme 4)

| id | Geste | Question (juste en gras) | Poids | Corrigée |
|---|---|---|---|---|
| `q-lourd` | premier lourd posé | « Pourquoi les lourds en bas ? » — **la palette tient mieux et rien n'écrase les cartons du dessous** · ils se voient mieux · c'est plus rapide | 1 | au bilan (proche du jalon) |
| `q-a-cote` | première pose « À côté » (ou 3e ligne si jamais) | « À quoi sert de poser un carton à côté ? » — **à le mettre sur la palette au bon moment, plus tard** · à le laisser au magasin · à le renvoyer | 0,75 | tout de suite |
| `q-film` | film posé | « Le film, ça sert à… » — **tenir les cartons ensemble pendant le transport** · cacher les produits · protéger de la pluie au magasin | 0,75 | tout de suite |
| `q-tours` | **écogeste / éco-droit** — étiquettes posées | « Pourquoi pas 15 tours de film, pour être sûr ? » — **c'est du plastique gaspillé : il devient un déchet au magasin** · ça coûte du temps seulement · ça abîme la palette | 0,75 | tout de suite (C3.7 en rappel) |
| `q-etiquette` | fiche envoyée | « Pourquoi une étiquette sur deux côtés et sur le dessus ? » — **pour la lire de partout sur le quai et dans le camion** · c'est plus joli · le magasin en garde une | 0,75 | tout de suite |

Retours : `q-lourd` « Un fragile sous un lourd, c'est de la casse au magasin. » · `q-a-cote` « Le terminal décide de l'ordre de l'allée, toi
de l'ordre de la palette. » · `q-film` « Sans film, la palette s'effondre au premier virage. » · `q-tours` « Assez pour tenir, pas plus. » ·
`q-etiquette` « Une palette qu'on ne lit pas part au mauvais magasin. »

## 4 ter. Avant de commencer — banque proposée (non notée)

| id | Question | Juste | Pièges |
|---|---|---|---|
| `k-lourds` | Sur une palette, les cartons lourds vont… | en bas | en haut · au milieu |
| `k-fragile` | Un carton de verres va… | en haut | en bas · à côté de la palette, sur le quai |
| `k-film` | On filme une palette… | quand elle est finie, avant le quai | avant de la remplir · au magasin |
| `k-poids` | Une palette trop lourde… | ne doit pas partir : on la refait | part quand même · on la coupe en deux au magasin |
| `img-fragile` | Ce pictogramme (un verre) veut dire… | fragile | boisson · recyclable |

## 5. Jalons / notation (sur 20) — poids validés par Tristan (25/10/2026, 14 h 26)

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Lire un carton** | 3 lignes de la fiche, 1 chacune | **3** | fiche `cartons` | jugée contre les cartons tirés |
| **Les lignes** (prérequis) | 6 lignes justes, 0,5 chacune | **3** | `ligne-…` | — |
| **Calage : lourds en bas** | critère `lourds` | **2** | ordre de pose | jugé seulement si lignes justes et rien à côté |
| **Calage : fragiles en haut** | critère `fragiles` | **2** | ordre de pose | idem |
| **Poids et hauteur** | `poids` 1 · `hauteur` 1 | **2** | palette | idem |
| **Emballer** | film 3 à 5 tours | **2** | `film` | idem |
| **Étiqueter** | étiquettes justes (2 faces opposées + dessus, magasin) | **2** | `etiquettes` | idem |
| **Les questions de Samia** | §4 bis | **4** | moteur des questions | — |
| **Total** | | **20** | | |

- Inaction : 0/20 (une palette vide ne respecte rien).

## 6. Contenu (données)
`contenus/action-ent817.js`, `contenus/questions/ENT-8.17.js`, `activites/action-conditionner.js`, `contenus/corriges/ENT-8.17.js`.
Limites proposées (E-8 §3) : **600 kg**, **1,60 m**, support 25 kg / 0,15 m ; film 3 à 5 tours ; étiquettes au nom du magasin. Commande : 6
lignes, la bonne palette tient **toujours** dans les limites (contrôle), et poser tout dans l'ordre du terminal casse **toujours** au moins une
règle de calage (contrôle : la séance a un sens).

## 6 bis. Tirage et niveaux
- Tirés : magasin, lignes, ordre du circuit (sous la contrainte ci-dessus), cartons de la fiche.
- **Confirmé** : un 7e carton **volumineux et léger** (`PEL` ou `BOI`) qui fait dépasser la hauteur s'il est mal placé (bonus).
- **Accompagné** : pendant la pose, une ligne sous la question « Où poses-tu ? » : la classe du carton (« lourd », « fragile ») ; règles ouvertes.

## 7. Demandes au moteur
E-8 lots 0 à 3 (lot 2 surtout). Les trois cartons dessinés de la fiche : un SVG de la séance suffit, sinon demande.

## 8. Tests attendus
Bloc `action-817` (alerte 7). Parcours juste (deux graines) 20/20 ; inaction 0/20 ; tout posé dans l'ordre du terminal → au moins un critère de
calage faux ; un carton resté à côté → critères de montage non jugés ; film 2 tours ; étiquettes sur une seule face ; confirmé (7e carton) ;
accompagné ; somme 20 ; `part` 4. Sabotage : critères lus sur l'ordre de prélèvement au lieu de l'ordre de pose → le cas « à côté » tombe.

## 10. Critères de validation par Tristan
- « À côté, je les pose après » se comprend tout de suite ; la palette se voit monter.
- Le poids et la hauteur se lisent sans calcul.
- 45 minutes suffisent.

## 11. Questions ouvertes
1. **Tranché par Tristan (25/10)** : poids du §5. **Proposé** : questions, retours, banque ; limites de poids et de hauteur ; fiche « Lire un carton ».
