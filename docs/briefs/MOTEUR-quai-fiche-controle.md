# Brief de chantier — MOTEUR : la fiche de contrôle du quai (Picard ENT-4.1 à 4.4)

**Statut** : à implémenter — **ergonomie à travailler avec Tristan sur une page d'essai AVANT d'écrire dans le moteur**
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

## 3. Ergonomie : à décider AVEC Tristan sur une page d'essai cliquable

« On travaille la vue ensemble pour l'ergonomie » (Tristan). Fabriquer une page d'essai (dans
`G:\Mon Drive\Travail\Logistique\1L\Claude outputs\`), fidèle à l'écran du quai (étape ③ puis ④, une palette avec
avarie, une avec manquant, une avec température, une avec produit différent), avec des variantes à comparer, par
exemple :
- où vit la fiche à l'étape ③ : sous la décision et le motif de la palette en cours / un panneau « Ma fiche de
  contrôle » (toutes les palettes, une ligne chacune) toujours visible ;
- quels champs : tous les constats possibles pour chaque palette, ou seulement ceux du motif choisi (qui
  trahirait moins / plus ?) ;
- la sonde : la température mesurée se note-t-elle à la main (geste réel) ou s'inscrit-elle seule ?
- à l'étape ④ : la fiche à côté du formulaire (tableau) ou la note sous chaque ligne de réserve ;
- clavier : passage d'un champ à l'autre, focus conservé.

Points à respecter : charte (pas de blanc pur, le vert plein ne dit que « juste », un champ de saisie ne prend
jamais d'aplat) ; la fiche ne dit jamais si une note est juste ; rien ne doit être déductible (pas de valeur
attendue préremplie) ; temps simulé : noter ne coûte rien, ou un coût à décider avec Tristan.

## 4. Ce que touche le chantier

`core/types/quai.js` (et `styles/base.css` si besoin), les tests du bloc `picard` (ENT-4.1 à 4.4), les trames Picard
si elles parlent de l'étape ④ (à signaler à Cowork). Un seul chantier à la fois dans le quai.

## 5. En attendant

Essai d'ENT-4.4 (seuils de temps réel, provisoires à 12 / 16 min) **en pause**. Premier relevé de Tristan, en
expert : 7 min 44 de temps réel en arrivant à l'étape ④, 24 min hors froid. Un élève mettra sans doute 2 à 3 fois
plus : les seuils de 12 / 16 min paraissent trop courts. À reprendre une fois la fiche livrée.

## Compte rendu *(rempli par Claude Code)*
