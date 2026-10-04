# Brief moteur — Plan d'entrepôt, mode préparation : la palette à gauche, la travée à droite

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/MOTEUR-entrepot-preparation-ecran-partage.md et applique-le (attends que le chantier « verdict du guidage » soit effacé de docs/EN-COURS.md). Annonce la durée avant de commencer.
> ```

**Statut** : à implémenter — **après** le chantier « Plan d'entrepôt : verdict du guidage » (une autre conversation
écrit dans `core/types/entrepot.js` le 04/10 au soir).
**Date du brief** : 04/10/2026 (demande de Tristan après l'essai du lot 4)
**Modèle** : Sonnet (agencement d'une vue existante).

## 1. La demande (Tristan, 04/10)

> « Pour la vue préparation, quand je clique sur la travée il faut que la vue se coupe en deux, la palette est toujours
> affichée côté gauche. La vue travée puis la vue prélèvement visible sur la droite. »

Aujourd'hui (lot 4, commit 374eacf) : le grand espace montre **une seule chose à la fois** — la travée vue de face, **ou**
la fiche de prélèvement, **ou** la palette de commande (bouton « Palette de commande (n) »).

## 2. Ce qu'il faut faire

En mode **préparation** seulement (le rangement ne change pas) :

- Dès qu'une travée est ouverte, le grand espace se **coupe en deux** :
  - **à gauche, toujours** : la palette de commande (dessin, poids, hauteur), qui se monte sous les yeux de l'élève à
    chaque prélèvement ;
  - **à droite** : la **travée vue de face**, puis, après le clic sur un emplacement, la **fiche de prélèvement** à la
    place de la travée (« ← Retour à la travée » la rend).
- Le bouton « Palette de commande (n) » de l'en-tête devient inutile pendant qu'une travée est ouverte : le retirer
  (garder l'accès depuis la zone d'expédition du plan).
- Une fois la préparation terminée (film, étiquettes, bilan), l'écran reste celui d'aujourd'hui (palette + finition).

## 3. À vérifier / points d'attention

- Tenir à **1366 × 768** avec le menu ouvert : la travée (3 emplacements de large) et la fiche (saisie + cartons
  dessinés) doivent rester lisibles sur la moitié droite ; proposer la répartition (par exemple 40 / 60) et, si c'est
  serré, la montrer à Tristan **sur une page d'essai cliquable** avant de figer.
- Les emplacements ne doivent pas bouger sous la souris (hauteur de l'en-tête et du message fixes, comme aujourd'hui).
- Tests du bloc `entrepot` : ajouter un cas « travée ouverte → palette visible à gauche et travée à droite ; fiche à
  droite, palette toujours à gauche ; la palette grandit après Prélever » ; relancer les cas de préparation existants
  (ils cliquent `[data-pe="voir"]` : à adapter, et **le dire à Tristan**).

---

## Compte rendu *(rempli par Claude Code à la livraison)*
