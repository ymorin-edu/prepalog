# Visite de la plateforme (ENT-5.3) — fichiers de référence

Déposés par Cowork le 04/10/2026 ; **mis à jour le 04/10 au soir** (maquette v2 validée par Tristan, photos du parcours et
de la travée). **La maquette fait foi pour l'interaction, pas pour le code.** Ce dossier n'est **pas servi aux élèves** :
Claude Code copie les photos dans le dossier d'images des contenus (empreintes à revérifier) ; rien sur le site ne pointe
vers `docs/`. Briefs : `../../ENT-5.3-smoby-visite.md` (la séance) et `../../MOTEUR-modes-visite.md` (le moteur).

Empreintes **relues sur le disque après dépôt** (04/10/2026, soir), identiques à celles de `Claude outputs`.

## La maquette

| Fichier | Quoi | Octets | SHA-256 |
|---|---|---|---|
| `maquette-visite-2de-v2.html` | **Maquette v2, validée par Tristan le 04/10 au soir** : 8 étapes (accueil, vue du ciel + 3 questions, parcours sur le plan v2, mots du rack, quiz, **la travée** (4 coins puis 3 lisses), adresse **décomposer puis retrouver**, bilan). Un seul fichier, photos incluses, aucune requête, double-clic. La barre des étapes y est cliquable dans le désordre (outil d'essai seulement). Données en tête du script. Copie de `G:\Mon Drive\Travail\Logistique\1L\Claude outputs\maquette-visite-2de-v2.html`. | 2 907 810 | `5f14957593397257eb01a1e31c5bac03e912839929015bbebba60b55930fa7b7` |
| `maquette-visite-2de.html` | **v1, DÉPASSÉE** (ancien plan, adresse `A-03-2-1`, 7 écrans, 8 jalons). **À supprimer** (`git rm`) par Claude Code au commit de ces briefs. | 1 071 173 | — |

## Les photos

Licences **Pexels** ou **Unsplash** (usage libre, sans attribution obligatoire ; on crédite quand même). **Aucune n'est la
plateforme Smoby** (le dire sous chaque photo). **Aucun visage reconnaissable.** Les retouches sont de Cowork (flou ou
effacement de marques, recadrage, réduction) et ont été vérifiées à l'œil en zoomant.

| Fichier | Étape | Quoi | Source / licence | Octets | SHA-256 |
|---|---|---|---|---|---|
| `ciel-pexels-2804929.jpg` | accueil, vue du ciel | Centre logistique vu par drone (Pologne), 1600 × 1066 | Marcin Jozwiak, Pexels n° 2804929 | 284 611 | `73e54ba49eedb3ac2d3ea05a95a559122b2142cf3aadbb8d5c09dbafa324c006` |
| `../quai-interieur.jpg` | parcours ① le quai | Quai vu de l'intérieur, porte ouverte, niveleur, chariot dans la remorque, 1280 × 854. **Marques effacées par Cowork.** Même photo que le déchargement d'ENT-5.4. | Pexels n° 1267327 | 196 780 | `9f0b3657c044b4bf78bd5096b9ad939aebf5083ece0e1b74e0b0e1eeb724a9f5` |
| `visite-reception-pexels-4481326.jpg` | parcours ② zone de réception | Hall avec palettes filmées au sol, 1280 × 854 | Tiger Lily, Pexels n° 4481326 | 204 888 | `3d5d9de7f3f4dd73e2b2a463cd2634ae19f8b5be8c7d103fa6eedddfd8dec86e` |
| `visite-allee-principale-pexels-36398150.jpg` | parcours ③ allée principale | Large allée, marquage au sol, chariot au loin, 1280 × 853. **Logo du chariot (CAT) flouté par Cowork.** | Willians Huerta, Pexels n° 36398150 | 301 748 | `f142e3542f6f5e9111c7b83f2517184862e2a2449ed2b0ea89da42e01e0b0251` |
| `allee-pexels-5775099.jpg` | parcours ④ allée A, mots du rack | Allée de racks (échelles bleues, lisses orange, étiquettes d'adresse), réduite à 1600 × 900. Coordonnées des mots dans un repère **1400 × 788** (même proportion). | Handi Boyz LLC, Pexels n° 5775099 | 292 642 | `eedb5592ad6c52d84847609acb8c7a8a9608ea8811366337f2171bb69603536f` |
| `visite-litiges-unsplash-mFUIel9hWos.jpg` | parcours ⑤ zone litiges (photo) | Coin isolé : palettes filmées, cartons et sacs mis à part, 900 × 922. **Recadrée par Cowork** (partie gauche retirée : marques « Bonneval », « Seez », « Merci Walter »), **« Merci Walter » effacé sur les sacs**, étiquette murale et petits logos floutés. | Duc LE, Unsplash `mFUIel9hWos`, licence Unsplash | 164 257 | `5e37e8aa6fd4ed308cc196fc493866ce8f4e9c5ac827227f5d45bb043d2d3657` |
| `visite-litiges-dessin.jpg` | parcours ⑤ zone litiges (dessin) | Ce qu'on doit voir dans une zone litiges : marquage rouge hachuré au sol, panneau « ZONE LITIGES — Ne pas stocker · Ne pas expédier », emplacements L1 / L2, palettes « BLOQUÉ » (1 carton écrasé, 2 cartons manquants), 1280 × 854 | **dessiné par Cowork** | 86 212 | `ff1b5b09fca3f36cd75ed9522ef3239c44b5246b2de900cb055980489afc53bf` |
| `visite-bureau-pexels-7658310.jpg` | parcours ⑥ bureau du chef de quai | Bureau d'atelier (classeur, papiers, écrans), personne, 1280 × 854 | Pavel Danilyuk, Pexels n° 7658310 | 196 775 | `9f1ad9fc2253fe1a9ed11655080fce9fe085f14d9561fc0f7410ae7f8f067b0b` |
| `rack-pexels-4483609.jpg` | quiz | Racks à palettes et allée, 1280 × 1920 | Pexels n° 4483609 | 449 663 | `f3b418ce02f97fee84d6b5d90b8ab2421ed4c88392e3ed4418c5bbbf34ad14d3` |
| `visite-travee-pexels-29454378.jpg` | la travée | Racks orange vus de face, une seule travée complète au milieu, 1100 × 1246. **Recadrée par Cowork** (sol gardé, haut de la photo coupé), **marques floutées** (LG, Liebherr, Zephyr, Amana sur les cartons). | Pexels n° 29454378 | 339 675 | `596ac47438cc48b5d935e0bc07c60e2e2a3247cc2301f64370b1730cd7b3da7e` |

Les photos intégrées à la maquette v2 sont **les mêmes fichiers** pour le parcours et la travée (empreintes identiques) ;
pour la vue du ciel, l'allée et le quiz, la maquette embarque des **copies réduites** (même proportion, mêmes coordonnées
une fois le repère déclaré) : le site sert les fichiers ci-dessus.

Écartées : la photo de quai Pexels 16924265 (v1) ; pour les litiges, Pexels 36504458 (cartons écrasés), 7362844, 12161445,
Unsplash `aq4854r8UQY`. Aucune banque libre n'a de vraie « zone litiges » d'entrepôt (recherches du 04/10) : d'où le dessin.
