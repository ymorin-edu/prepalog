# Brief de chantier — MOTEUR : la fiche de contrôle du quai (Picard ENT-4.1 à 4.4)

**Statut** : à implémenter — **ergonomie arrêtée avec Tristan le 04/10/2026** sur la page d'essai
`docs/briefs/picard/essai-fiche-controle.html` (section 3 ci-dessous) : c'est la référence d'interaction
*(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Origine** : essai d'ENT-4.4 à l'écran par Tristan, 04/10/2026.
**Modèle** : Opus (vue du moteur, `core/types/quai.js`, qui sert les quatre séances Picard).

## 1. Le problème (constaté par Tristan)

À l'étape ④ « Réserves et chambre froide », le formulaire « Tes réserves » reprend la décision et le motif choisis
à l'étape ③ pour chaque palette (« P1 — Refuser · Cartons endommagés »), puis demande un **chiffre** que l'étape ③
n'a jamais fait noter (`CHAMP_RES` dans `quai.js`) :
- Température non conforme → « Température à cœur relevée (°C) » ;
- Produit différent → « Référence réellement livrée (lue sur l'étiquette) » ;
- Cartons endommagés → « Nombre de cartons endommagés » ;
- Manquant → « Nombre de cartons manquants ».

L'élève doit donc **retrouver de mémoire** ce qu'il a vu à l'étape d'avant. Seul contournement : recliquer sur
l'onglet ③, ce que rien n'indique, et qui n'a pas de sens une fois le lot rentré en chambre froide.

## 2. Décision de Tristan (04/10/2026) : option A, une fiche de contrôle

- À l'étape ③, **pendant le contrôle de chaque palette**, l'élève note ses constats sur une **fiche de contrôle** :
  ce qu'il a relevé (température à cœur, référence lue, cartons endommagés, cartons manquants…).
- À l'étape ④, **ses notes s'affichent** à côté du formulaire de réserves : il les reporte sur le bon de livraison.
- Les notes **ne sont pas corrigées** et ne sont pas des jalons : s'il a mal noté, il recopie son erreur, et c'est la
  réserve qui est jugée, comme aujourd'hui. On ne préremplit pas les réserves (le report est le geste).
- C'est le geste réel : le réceptionnaire note pendant le contrôle, puis reporte sur le BL.
- Écartées : B (lien « revoir la palette » à l'étape ④, peu réaliste), C (noter sur papier, demande une trame
  partout, ENT-4.4 n'en a pas).

## 3. Ergonomie arrêtée avec Tristan (04/10/2026, page d'essai)

Référence d'interaction : `docs/briefs/picard/essai-fiche-controle.html` (copie de la page d'essai ; le haut de la
page résume les choix). Ouvrir en double-clic. Ses palettes sont dessinées par `palette3d` copié de `quai.js` ;
le reste du code de la page est jetable (ne pas le recopier tel quel : l'écrire dans les conventions du moteur).
Charte respectée : pas de blanc pur, aucun aplat vert, champs sans aplat, messages « manquant » en ambre (`--terre`).

### Étape ③ — mise en page du poste
- **Colonne de gauche** : la palette 3D, **bloc moins haut** (dessin limité à ~250 px de haut, cadré serré),
  puis **juste en dessous la fiche de contrôle** de la palette ouverte. Colonne de droite : les outils et la
  validation. Deux colonnes de même largeur.
- La fiche a **le même habillage que les autres blocs du quai** (`.quai-doc` : `--fond`, `--filet`, champs
  ordinaires). Pas de papier ligné ni d'écriture manuscrite (essayé, refusé par Tristan).

### Étape ③ — la fiche
- **Toujours les quatre constats pour chaque palette** : Température à cœur (°C), Référence lue sur l'étiquette,
  Cartons endommagés (cartons), Cartons manquants (cartons). L'unité est écrite à côté de la case. Écartés :
  « seulement ceux du motif » (oblige à décider avant de noter, et un mauvais motif empêche de noter le bon
  constat) ; texte libre (trop dur pour un faible lecteur).
- **Rien de prérempli, rien de corrigé, aucun indice** : une palette conforme reste vide, c'est normal.
- **Noter ne coûte rien** en temps simulé.
- **Entrée** passe à la case suivante de la fiche ; focus conservé au redessin (clavier seulement).
- Les notes vivent dans l'état de la palette (`e.palettes[id].fiche = { temp, ref, endo, manq }`, cloisonné par
  séance comme tout l'état du quai) ; `normaliser()` complète les bases anciennes.

### Étape ③ — la sonde
- « Sonder à cœur » affiche un **thermomètre à sonde dessiné** (SVG, appareil générique, **sans marque**), planté
  dans un carton de la palette. L'afficheur part de la température du quai et **se stabilise en ~1,2 s**
  (« STAB… » clignote, puis « HOLD ») ; `prefers-reduced-motion` → valeur directe. Revenir sur une palette
  sondée réaffiche la valeur sans rejouer l'animation. Remplace le texte « −19,6 °C à cœur ».
- La température **se recopie à la main** sur la fiche (rien ne s'inscrit seul).

### Étape ③ — la validation (choix « décision en boutons »)
- **Comptage** : plus de bouton « Noter le comptage ». On tape le total puis Entrée (ou on quitte la case) : il est
  noté, avec le coût `compter` et la phrase « Comptage noté : 44 cartons (BL : 48). ». Palette multi-références
  (`p.refs`, absente de la page d'essai) : une case par référence, chacune notée par Entrée, même phrase
  qu'aujourd'hui ; garder le coût `compter` × nombre de références.
- **Décision en trois boutons** (Accepter / Accepter avec réserves / Refuser), état choisi = bordure et texte
  d'accent + « ● », jamais d'aplat.
- **Motif en étiquettes à cocher** (☐ / ☑), affichées **seulement** pour une réserve ou un refus ; libellé
  « Motif de la réserve | du refus · deux au plus ». **Deux au plus** quand la séance déclare `deuxMotifs`
  (ENT-4.4) : recliquer décoche ; un troisième clic est refusé avec « Deux motifs au plus : décoche-en un
  d'abord. » Sans `deuxMotifs`, une seule (le clic remplace). Remplace les menus `motif` / `motif2` (même état
  `motif`, `motif2`). Passer à « Accepter » efface les motifs.
- **« ✓ Valider P1 » toujours cliquable** : s'il manque quelque chose, le message s'écrit **sous la case
  concernée** (« Note le comptage. », « Choisis une décision. », « Donne le motif. ») et le focus y va. Les
  conditions de validation ne changent pas (comptage, décision, motif si réserve/refus) — la fiche n'en fait
  **pas** partie (non corrigée).
- **Valider reste sur la palette**, qui devient un **résumé** (« ✓ P1 validée : Accepter avec réserves —
  Manquant + Cartons endommagés », comptage) avec un bouton **« Modifier »**. Fin du dé-validage silencieux
  quand on touchait un menu.
- **En dessous, « Palette suivante : P2 → »** : la palette d'après dans l'ordre (validée ou non), **absent sur la
  dernière**. Idée proposée, non tranchée : sur la dernière, mettre à la place « Contrôles terminés → réserves ».
- « Contrôles terminés → réserves et chambre froide » passe en bouton plein quand tout est validé (déjà le cas).

### Étape ④
- **Colonne de gauche : la chambre froide (animation), puis juste en dessous la fiche entière** (toutes les
  palettes, y compris acceptées, en lecture seule, tableau Palette / Temp. à cœur / Réf. lue / Endommagés /
  Manquants). Colonne de droite : « Tes réserves », inchangé, où l'élève **reporte**. Écarté : la note sous
  chaque ligne de réserve (désigne la ligne à lire).
- Une palette à deux motifs a deux cases (`res`, `res2`), comme aujourd'hui.

### Nombres à virgule
Rien à changer : `nombre()` accepte déjà « −13,8 », « -13.8 », tiret long, espaces ; le BL écrit toujours
« −13,8 °C ». La fiche est du texte libre (non corrigée).

## 4. Ce que touche le chantier

`core/types/quai.js` et `styles/quai.css` (pas `base.css` a priori), les tests du bloc `picard` (ENT-4.1 à 4.4), les
trames Picard si elles parlent de l'étape ③ ou ④ (à signaler à Cowork). Un seul chantier à la fois dans le quai.

Vérifier aussi le mode « déjà réceptionné » d'ENT-4.3 (`vueControle`) : il partage `MOTIFS`, `DECISIONS`, les
menus ? Ne le changer que s'il affiche le même poste de contrôle (sinon le laisser tel quel et le dire).

**Tests à réécrire (le dire à Tristan)** : les cas du bloc `picard` qui choisissent `#qDecision` / `#qMotif` /
`#qMotif2` dans un menu, qui cliquent `[data-q="compter"]`, ou qui attendent que le bouton Valider soit grisé.
Nouveaux cas, éprouvés dans les deux sens : la fiche se remplit, survit au changement de palette et au
rechargement, réapparaît à ④ en lecture seule, n'est jamais préremplie ni corrigée (une note fausse ne change
aucun jalon) ; Entrée passe à la case suivante ; troisième motif refusé (ENT-4.4) ; Valider avec un manque
écrit le message sous la case et ne valide pas ; « Palette suivante » absent sur la dernière ; résumé +
« Modifier ». Durée estimée : ~2 h (la suite Picard et la suite entière, plusieurs passages).

## 5. En attendant

Essai d'ENT-4.4 (seuils de temps réel, provisoires à 12 / 16 min) **en pause**. Premier relevé de Tristan, en
expert : 7 min 44 de temps réel en arrivant à l'étape ④, 24 min hors froid. Un élève mettra sans doute 2 à 3 fois
plus : les seuils de 12 / 16 min paraissent trop courts. À reprendre une fois la fiche livrée.

## Compte rendu *(rempli par Claude Code)*
