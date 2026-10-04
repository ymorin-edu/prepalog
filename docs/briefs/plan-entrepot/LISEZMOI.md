# Plan d'entrepôt — fichiers de référence pour Claude Code (déposés par Cowork le 04/10/2026)

Ce dossier n'est **pas servi aux élèves** : c'est la matière première du brief `docs/briefs/MOTEUR-vue-plan-entrepot.md`.
Rien sur le site ne doit pointer vers `docs/`.

| Fichier | Quoi | Octets | SHA-256 |
|---|---|---|---|
| `maquette-plan-entrepot-v2.html` | Maquette jouable, **validée par Tristan le 04/10/2026** : la référence d'interaction de la vue (trois modes : rangement, comptage à une liste, préparation de commande ; trois temps). Un seul fichier, aucune requête externe, s'ouvre en double-clic. L'en-tête (onglets ①②③, Guidage / Entraînement / Évaluation, Recommencer) n'existe que pour l'essai. Copie de `G:\Mon Drive\Travail\Logistique\1L\Claude outputs\maquette-plan-entrepot-v2.html`. | 102 425 | `057d21057fb352443bd726b1078bc69fd612ce5411939bdc00fb5f318ca1447f` |
| `donnees-maquette.json` | Les données de la maquette, **figées** : plan Smoby (côtés, gammes, charges, hors service, rotation, parcours), produits, cartons, **stock de départ complet (99 emplacements)**, palettes et **bonnes réponses** du rangement, liste et écarts de l'inventaire, commande, picking, meilleurs tours, géométrie de la maquette (pixels). Extrait de la maquette par Cowork (navigateur sans écran). | 12 818 | `0d9e2011676de34438c178a52d9801ff7496b083796d91f4aab4dbec058cd789` |

**La maquette fait foi pour l'interaction, pas pour le code** (état global, un fichier, géométrie en pixels). Le stock y est
tiré par un générateur à graine fixe : **ne pas reproduire le générateur**, reprendre `donnees-maquette.json`.

Contrôlé par Cowork le 04/10/2026 (navigateur sans écran, 1366 × 768 et 1920 × 1080, clair et sombre, vrais clics) : les
3 modes × 3 temps sans erreur, aucune requête hors du fichier, fins de ligne LF. Rangement : bonnes réponses P1 1, P2 2,
P3 2, P4 3 ; inventaire 8/8 ; préparation 47 m (serpentin), 40 m (retour), 141 m (désordre en serpentin), palette 331 kg,
1,74 m.

⚠ Le pont de fichiers de Cowork a déjà ajouté un bloc de provenance à des fichiers déposés (voir `../smoby/LISEZMOI.md`) :
**vérifier les deux empreintes** avant usage.
