# Chantier moteur — la dépose dirigée « par client » (option de `depose`, pour ENT-10.5 à 10.8)

**Statut** : à implémenter
**Date** : 18/10/2026 (Cowork)
**Décision de Tristan** (18/10/2026, 21 h 50) : « Étendre la dépose » — chaque case porte le nom d'un client ; le cariste réagit si la palette
n'est pas posée chez le bon client. Le reste (forme de la déclaration, textes) : **Cowork**, à relire.
**Modèle** : Opus (vue du moteur, `core/types/quai.js`). **Durée estimée** : ≈ 3 h tests compris (option rétro-compatible d'une vue livrée le
17/10, chantier E-5 lot 2 : `docs/briefs/MOTEUR-depose-dirigee.md`, FICHE-SEANCE « La dépose dirigée par l'élève »).
**Un seul écrivain dans `quai.js`** : s'inscrire dans `docs/EN-COURS.md`.

## 1. Le besoin

Chez Pelleau, le camion de ramasse rapporte les palettes de **deux ou trois clients**, mélangées. À la sortie du camion, l'élève doit poser
chaque palette **dans la zone de son client** (lue sur l'étiquette de la palette). Aujourd'hui une case est juste **pour toutes les palettes**
(`juste` booléen, ou déduit de `sol`).

## 2. Déclaration proposée

```js
depose: { passage: 3, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne' },
  { id: 'AV1', client: 'ar-vag' }, { id: 'AV2', client: 'ar-vag' },
  { id: 'AK1', client: 'agri-kerlann' }, { id: 'AK2', client: 'agri-kerlann' },
  { id: 'quaiB-1', sol: 'autre-quai', legende: 'Quai B', peinte: false } ],
  clients: { 'ar-vag': { nom: 'Biscuiterie Ar Vag', court: 'AR VAG' }, 'agri-kerlann': { nom: 'Agri-Kerlann', court: 'AGRI-KERLANN' } } },
camions: [{ palettes: [ { id: 'P1', client: 'ar-vag', /* … */ }, { id: 'P2', client: 'agri-kerlann' }, … ] }]
```

- **`client` sur une case** : la case est juste **pour les palettes de ce client seulement**. Interdit avec `sol` et avec `juste` (incohérent).
- **`client` sur une palette** : obligatoire pour **toutes** les palettes dès qu'une case déclare `client` ; inconnu de `depose.clients` = refus.
- **`depose.clients`** : nom long (bulle, bilan) et `court` (écrit **au sol** dans la case, en capitales, comme « R1 »). Une case de client est
  toujours peinte ; son nom au sol est `court` + numéro (« AR VAG 1 »).
- **Contrôle au chargement** (`verifierDepose`) : pour chaque client, **au moins autant de cases que de palettes de ce client** (sinon une palette
  n'aurait pas de case juste libre) ; 8 cases au plus (inchangé) ; une case sans `client` ni `sol` dans une dépose par client = refus (case
  ambiguë).

## 3. Ce que voit l'élève

- À la pause « choix », la légende dit en plus **ce que dit l'étiquette** : « Yann attend avec la palette P4 — étiquette : *Expéditeur :
  Biscuiterie Ar Vag* (1 sur 4). Où la pose-t-il ? ». C'est le geste à apprendre (lire l'étiquette) : la légende ne dit **jamais** « zone Ar Vag ».
- **Guidage** : une case d'un autre client fait réagir le cariste (`reactionClient`, défaut : « Ça, c'est la zone d'{autre client}. Regarde
  l'étiquette. »), la case se grise **pour cette palette seulement** (`grise: 'palette'` imposé sous une dépose par client : la case reste juste
  pour la palette suivante de l'autre client) ; pièges `sol` inchangés.
- **Copie** : premier clic pose, sans réaction (inchangé).
- À ③ et ④ : les palettes dans leurs cases réelles ; sous `commence: 'controle'`, chaque palette dans la **première case libre de son client**.

## 4. Jalons et bilan

- `depose-P1`… inchangés dans leur forme ; `ok` = tout posé **et** premier clic dans une case **de son client**.
- `attendu` : « une case de la zone Biscuiterie Ar Vag (AV1, AV2) » ; `fait` : « premier choix : *nom de la case* ».
- Groupe par défaut : `Diriger le déchargement` (inchangé) ; la séance peut le renommer par son barème (« Trier par client »).
- **Bilan détaillé** : une ligne par palette, au bilan seulement (« P3, Agri-Kerlann : posée en AK1 ✓ »).

## 5. Ce qui ne change pas

Un quai sans `client` sur ses cases : **octet pour octet** comme avant (blocs `quai-iso`, `action` verts). `grise: 'garde'` reste le défaut hors
dépose par client.

## 6. Tests attendus (bloc `quai-iso`)

- Refus : case avec `client` et `sol` ; palette sans `client` ; client inconnu ; 3 palettes Ar Vag pour 2 cases Ar Vag.
- Guidage : P4 (Ar Vag) cliquée en AK1 → réaction, AK1 grisée pour P4 seulement, puis P3 (Agri-Kerlann) peut aller en AK1.
- Jalons : tout juste au premier clic → tous vrais ; inaction → tous faux ; une erreur rectifiée → ce jalon faux, les autres vrais.
- Copie : premier clic pose dans la zone d'un autre client → jalon faux, palette dessinée là à ④.
- Légende : contient l'expéditeur de l'étiquette, ne contient jamais « zone » + nom du client.
- Sabotage : `client` de la case ignoré (toute case juste) → au moins deux cas tombent.

## Compte rendu *(rempli par Claude Code à la livraison)*
