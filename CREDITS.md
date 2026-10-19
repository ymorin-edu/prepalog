# Crédits

Ce fichier recense les données et les images venues de l'extérieur du dépôt : leur source, leur licence, la date
de récupération, le fichier qui en est tiré et la mention affichée à l'écran. Rien n'est chargé depuis ces sites
pendant l'usage : tout est servi par le dépôt.

## Données géographiques

| Données | Source | Licence | Récupéré le | Fichier produit | Mention affichée |
|---|---|---|---|---|---|
| Contours des régions et des départements de la France métropolitaine (tracés IGN Admin Express COG 2018, noms et codes INSEE) | [gregoiredavid/france-geojson](https://github.com/gregoiredavid/france-geojson) (Grégoire David), d'après l'IGN Admin Express | [Licence Ouverte Etalab](https://www.etalab.gouv.fr/licence-ouverte-open-licence/) | 15/10/2026 | `contenus/france-contours.js`, produit par `outils/carte/construire-france.py` (sources rangées dans `outils/carte/sources/france/`, non versionnées) | « Contours : IGN Admin Express (Licence Ouverte) » sous la carte |

## Images

Les photos de France Boissons (ENT-6.x) sont recensées, une par une, dans
[`contenus/images/france-boissons/CREDITS.md`](contenus/images/france-boissons/CREDITS.md).

Le logo d'Action (Wikimedia Commons, domaine public, mais marque) et les photos d'Action (ENT-8.x) sont recensés, un par un,
dans [`contenus/images/action/CREDITS.md`](contenus/images/action/CREDITS.md).

## Transports Pelleau

Logo récupéré par script (`outils/logo-pelleau.mjs`) le 19/10/2026, avec l'accord de l'enseignant (18/10/2026) pour un usage
pédagogique interne. Le site n'en offre pas de version SVG : le fichier est le PNG de l'en-tête, rangé tel quel.

Deux photos (ENT-10.1 : un camion de l'entreprise sur un quai de port, l'intérieur de son entrepôt de stockage) récupérées par script
(`outils/photos-pelleau.mjs`) le 19/10/2026, avec l'accord de l'enseignant. Ce sont les versions « 1536 px de large » que le site publie lui-même (aucune retouche de notre part).
Aucune ne montre une personne identifiable ni une plaque d'immatriculation lisible ; légende à l'écran : « Photo : Transports Pelleau ».

| Fichier | Auteur | Page source | Licence | Retouche | Dimensions | Taille | SHA-256 |
|---|---|---|---|---|---|---|---|
| `contenus/trames/logos/pelleau.png` | Transports Pelleau | [transports-pelleau.fr](https://www.transports-pelleau.fr/), fichier `wp-content/uploads/2024/08/Logo-TP-V2.png` | Logo de l'entreprise, utilisé avec l'accord de l'enseignant pour un usage pédagogique interne ; marque déposée (pas de licence libre) | aucune (octets identiques à ceux du site) | 1940 × 445 px, fond transparent | 28 130 octets | `17ed634d7f035189b0a7f8311fc7776a2961e484615d332e2d871e91c3af2780` |
| `contenus/images/pelleau/camion-pelleau-port.jpg` | Transports Pelleau | [transport-de-marchandises](https://www.transports-pelleau.fr/transport-de-marchandises/), image d'en-tête, fichier `wp-content/uploads/2026/01/Camion_Home-3-1536x863.jpg` | Photo de l'entreprise, utilisée avec l'accord de l'enseignant pour un usage pédagogique interne ; pas de licence libre | aucune (octets identiques à la version 1536 px publiée par le site) | 1536 × 863 px | 252 007 octets | `4f43a7a5e6d67a7ce5c3bf1c7f39b39edcd8b945388d387aa9f53d3934490d2e` |
| `contenus/images/pelleau/entrepot-racks.jpg` | Transports Pelleau | [stockage-de-marchandises](https://www.transports-pelleau.fr/stockage-de-marchandises/), image d'en-tête, fichier `wp-content/uploads/2026/07/P1435113-HDR-scaled-e1784800221280-1536x824.jpg` | Photo de l'entreprise, utilisée avec l'accord de l'enseignant pour un usage pédagogique interne ; pas de licence libre | aucune (octets identiques à la version 1536 px publiée par le site) | 1536 × 824 px | 358 918 octets | `61f1974120dd52811e591a7fc16f8dcf656d6946c4248059010e45515208918a` |
