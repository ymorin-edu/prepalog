# Images du scénario S2 France Boissons (ENT-6.x) — à récupérer

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/IMAGES-france-boissons.md : récupère les 11 images dans le dépôt, fais les retouches demandées, vérifie chaque fichier par empreinte, et montre-moi le résultat avant de commiter.
> ```

**Statut** : à faire — choix de Tristan le 05/10/2026 (Cowork).
**Pourquoi des photos libres** : les photos de France Boissons appartiennent à France Boissons. Le dépôt est public et
GitHub Pages sert chaque fichier à n'importe qui, sans compte : mettre une image dans le dépôt, c'est la publier. Une
demande d'autorisation part chez France Boissons (mail de Tristan). En attendant, ces photos libres. Si France Boissons
accepte, on remplacera les camions et la vue d'entrepôt.

## Règles (rappel de CLAUDE.md)

- Récupération **par script** (télécharger, écrire, relire, recalculer l'empreinte), jamais de base64 recopié à la main
  (alerte 10). Le site ne doit jamais aller chercher l'image sur Unsplash ou Pexels pendant la séance.
- Dossier proposé : `contenus/images/france-boissons/` ; largeur **1200 px** au plus, JPEG qualité 80 environ (le site doit
  rester léger).
- **Crédit** pour chaque image, dans un fichier `contenus/images/france-boissons/CREDITS.md` et en pied de l'image à
  l'écran : « Photo : <auteur>, Unsplash » (ou Pexels). Les deux licences permettent l'usage libre, gratuit et sans
  autorisation ; le crédit n'est pas obligatoire, mais on le met.
- **Aucun visage reconnaissable**, aucune marque concurrente lisible (à vérifier sur l'image finale, pas seulement sur la
  vignette).
- Le générateur de retouches est un script **reproductible** dans `outils/` (alerte 11), qui part du fichier téléchargé.

## Les 11 images

| Nom de fichier proposé | Source (page) | Auteur | Licence | Usage prévu | Retouche |
|---|---|---|---|---|---|
| `futs-vrac.jpg` | [Unsplash 2Gx8qmygwqg](https://unsplash.com/fr/photos/un-tas-de-futs-metalliques-empiles-les-uns-sur-les-autres-2Gx8qmygwqg) | Belinda Fewings | Unsplash | 6.4 réception, 6.5 rangement | aucune |
| `futs-mur.jpg` | [Unsplash UuyY2Ep3z4I](https://unsplash.com/fr/photos/barils-bleus-et-blancs-a-cote-dun-mur-de-briques-brunes-UuyY2Ep3z4I) | Marco Zuppone | Unsplash | 6.10 vides repris | recadrer au-dessus des herbes du sol (proposé) |
| `casier-vides.jpg` | [Unsplash OYvf8JthYe8](https://unsplash.com/fr/photos/une-boite-rouge-remplie-de-bouteilles-de-biere-a-cote-dun-mur-blanc-OYvf8JthYe8) | Jennifer Chen | Unsplash | 6.10 casiers vides | **effacer « Super Bock » et « Sagres »** (casier du bas et pile du haut) ; ou recadrer sur le casier du bas et y effacer la marque |
| `tireuse.jpg` | [Unsplash p_Z7UOqYrlA](https://unsplash.com/fr/photos/quelquun-verse-de-la-biere-a-partir-dun-robinet-p_Z7UOqYrlA) | Travis Fish | Unsplash | 6.2 le bar de Malo | aucune (mains seules) |
| `bar-plage.jpg` | [Unsplash JVfHTJwawA8](https://unsplash.com/fr/photos/maison-en-bois-bleu-et-blanc-sous-les-nuages-blancs-pendant-la-journee-JVfHTJwawA8) | Ferran Feixas | Unsplash | 6.2 décor de La Cabane à Malo (générique : la photo est prise à Lanzarote) | **effacer l'enseigne « SHOP »** |
| `entrepot-allee.jpg` | [Unsplash GK8x_XCcDZg](https://unsplash.com/fr/photos/grande-warhause-GK8x_XCcDZg) | Ruchindra Gunasekara | Unsplash | 6.6 inventaire | aucune |
| `entrepot-racks.jpg` | [Unsplash OnbSOhz0oig](https://unsplash.com/fr/photos/un-grand-entrepot-rempli-de-palettes-OnbSOhz0oig) | AFINIS Group | Unsplash | 6.5 rangement | aucune |
| `chariot-boissons.jpg` | [Unsplash F2C_mSrb6iM](https://unsplash.com/fr/photos/un-chariot-elevateur-traversant-un-entrepot-rempli-de-palettes-F2C_mSrb6iM) | Bernd Dittrich | Unsplash | 6.7 préparation (entrepôt de boissons) | **flouter le cariste** |
| `entrepot-cartons.jpg` | [Unsplash h3pVxOIpnzk](https://unsplash.com/fr/photos/un-grand-entrepot-rempli-de-nombreuses-etageres-h3pVxOIpnzk) | Lance Chang | Unsplash | 6.6 inventaire | **effacer le panneau du fond** (magasin IKEA de Pékin) |
| `camion-route.jpg` | [Pexels 11262203](https://www.pexels.com/fr-fr/photo/route-voiture-mouvement-bouger-11262203/) | Markus Winkler | Pexels | 6.8 / 6.9 le camion en tournée | aucune (déjà flou de mouvement, sans logo) |
| `camion-port.jpg` | [Pexels 16718733](https://www.pexels.com/fr-fr/photo/pecher-mer-bateaux-construction-16718733/) | YunGuk Jo | Pexels | 6.9 / 6.10 livraison sur la côte | vérifier qu'aucune inscription en coréen ne se lit ; sinon flouter |

Les retouches marquées « proposé » viennent de Cowork. Tristan a annoncé « des retouches sur certaines » sans dire
lesquelles : **lui montrer chaque image retouchée avant de commiter.**

Écartées par Tristan ou Cowork : les camions Unsplash ZNTWG2QnBeU (mini-camion japonais, plaque américaine) et
Y0HxVe7D23w (Japon, chauffeur visible), remplacés par les deux photos Pexels ; Pexels 12625350 (livraison Coca-Cola).

## Compte rendu *(rempli par Claude Code)*

- Fichiers, empreintes, taille :
- Retouches faites et validées par Tristan :
