# Renumérotation du scénario S2 France Boissons (05/10/2026, décision de Tristan)

Le scénario commence maintenant par l'organigramme en **ENT-6.1** (« on peut tout décaler pour commencer à 6.1, ça me
semble mieux pour la suite »). Rien n'est encore construit : seuls les codes et les noms de briefs changent ; les `id`
prévus restent les mêmes.

| Avant | Après | Séance | `id` |
|---|---|---|---|
| ENT-6.0 | **ENT-6.1** | Bienvenue à Buchelay (organigramme) | `france-boissons-organigramme` |
| ENT-6.1 | **ENT-6.2** | La commande de La Cabane à Malo | `france-boissons-commande` |
| ENT-6.2 | **ENT-6.3** | Les congés d'été et l'annonce du saisonnier | `france-boissons-conges` |
| ENT-6.3 | **ENT-6.4** | Réception brasserie (fût qui fuit, BL faux) | à venir |
| ENT-6.4 | **ENT-6.5** | Rangement des fûts | à venir |
| ENT-6.5 | **ENT-6.6** | Inventaire tournant | à venir |
| ENT-6.6 | **ENT-6.7** | Préparation vocale | à venir |
| ENT-6.7 | **ENT-6.8** | Chauffeurs, camions, tournée sous-traitée (Planning) | à venir |
| ENT-6.8 | **ENT-6.9** | Ordonner la tournée de la côte (Tournée) | à venir |
| ENT-6.9 | **ENT-6.10** | Bon de livraison et de reprise, consignes | à venir |

ENT-6.10 se range bien après ENT-6.9 (tri segment par segment).

## Pour Claude Code

Les trois briefs ont été **réécrits sous leur nouveau nom** (`ENT-6.1-france-boissons-organigramme.md`,
`ENT-6.2-france-boissons-commande.md`, `ENT-6.3-france-boissons-conges.md`). Les anciens fichiers
(`ENT-6.0-france-boissons-organigramme.md`, `ENT-6.1-france-boissons-commande.md`, `ENT-6.2-france-boissons-conges.md`)
ne contiennent plus qu'un renvoi : **les supprimer par `git rm`** au premier commit. `IMAGES-france-boissons.md` est à jour.
