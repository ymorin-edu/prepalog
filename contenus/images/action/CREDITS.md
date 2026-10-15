# Crédits des images du scénario Action (ENT-8.x)

Le logo d'Action et neuf photos libres de droits, récupérés par script le 15/10/2026. Aucune photo n'est d'Action ni de
Geodis ; aucune ne montre un visage.

- **Licence des photos** : [Pexels](https://www.pexels.com/license/) autorise un usage libre et gratuit, sans autorisation
  préalable ; le crédit n'est pas obligatoire, mais on le met.
- **Fabrication** : chaque fichier a été téléchargé par script (`curl`) depuis le serveur d'images de Pexels
  (`images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&cs=tinysrgb&w=<largeur>`, 1200 px de large), puis
  relu : type réel du fichier vérifié (JPEG complet, début et fin), dimensions lues dans l'en-tête, SHA-256 calculé sur le
  fichier du dépôt. Les empreintes ci-dessous sont celles du fichier **tel qu'il est dans le dépôt** (après retouche).
- **Mention à afficher à l'écran**, en pied de l'image : la colonne « Mention ». Elle est reprise dans `contenus/action.js`
  (table `PHOTOS`).
- Le site ne va jamais chercher ces images chez Pexels ou Wikimedia : elles sont servies par le dépôt.

## Le logo d'Action

| Fichier | Auteur | Page source | Licence (texte de la page) | Retouche | Dimensions | Taille | SHA-256 |
|---|---|---|---|---|---|---|---|
| `../../trames/logos/action.svg` (ex-`logo-action.svg`) | Action (fichier converti d'un EPS du site Brands of the World, mis en ligne par QYYZ sur Wikimedia Commons, 19-29/06/2018) | [File:Action (store) logo.svg](https://commons.wikimedia.org/wiki/File:Action_(store)_logo.svg), fichier [`…/commons/d/d0/Action_(store)_logo.svg`](https://upload.wikimedia.org/wikipedia/commons/d/d0/Action_(store)_logo.svg) | Domaine public, modèle `PD-textlogo` : « This logo image consists only of simple geometric shapes or text » ; la page ajoute que l'image « may still be subject to other restrictions » et porte la mention **Trademarked** (« may be protected as a trademark in some jurisdictions »). | aucune : copie octet pour octet | viewBox 710 x 139 (SVG) | 8 102 o | `86a0811d92c6600356a78992d0208d83c25ebf5cbc7bc3386f5d5f69b1b7fc82` |
| `../../trames/logos/action.png` (ex-`logo-action.png`) | idem | idem | idem | rendu du SVG ci-dessus par Chromium (Playwright), fond transparent, 2 x la hauteur du viewBox ; pour les trames Word/PDF, comme `contenus/trames/logos/*.png` | 1420 x 278 | 37 268 o | `23b9e8b154f2fe4862a5e2196f64da7b001f4c980f7160b40118fa29589c4a9d` |

- **Ce que la licence autorise et n'autorise pas** : le droit d'auteur ne s'y oppose pas (logo de formes simples et de texte), mais
  c'est une **marque** : on l'emploie pour dire de quelle entreprise on parle (accord de Tristan, brief ENT-8.1 §2), jamais pour
  laisser croire qu'Action a produit le document. Les documents qui le portent ont leur pied « Document pédagogique —
  reconstitution d'après des informations publiques, non contractuel. ».
- Couleurs du fichier : bleu `#195799` (six tracés : les lettres) et cyan `#00bbf1` (trois tracés : les trois barres obliques).
- Le SVG porte un `DOCTYPE` et des espaces de noms (`http://www.w3.org/…`, `http://www.serif.com/`) : ce sont des identifiants
  de format, pas des requêtes ; le navigateur n'appelle rien en affichant l'image.

## Les photos

Retouches faites par script (flou local de 7 à 12 px sur les zones citées) pour effacer une marque lisible ; les photos « réduite
seulement » n'ont subi que le changement de taille du serveur de Pexels.

| Fichier | Auteur | Page source | Licence | Mention | Retouche faite | Dimensions | Taille | SHA-256 |
|---|---|---|---|---|---|---|---|---|
| `entrepot-racks.jpg` | Tiger Lily | [Pexels 4483610](https://www.pexels.com/photo/4483610/) | Pexels | Photo d'un autre entrepôt — Tiger Lily / Pexels | réduite seulement | 1200 x 800 | 221 386 o | `b021832f821b1f0b25246839e32c587dccb4dee07ed53b8f1f012c55a6957ab5` |
| `rayon-magasin.jpg` | quang vinh | [Pexels 20665616](https://www.pexels.com/photo/20665616/) | Pexels | Photo d'un autre magasin — quang vinh / Pexels | réduite seulement | 1200 x 800 | 156 764 o | `2cf0057beb25a5435b2840a7f24251bbf45472eee9e437d234f8bb9a44a86379` |
| `semi-remorque.jpg` | Quintin Gellar | [Pexels 6563903](https://www.pexels.com/photo/6563903/) | Pexels | Photo d'un autre camion — Quintin Gellar / Pexels | réduite seulement | 1200 x 737 | 161 578 o | `b2ac467202c6f0358994ee3e710ded7d3af643d9568bac7a0e3eb6a580ab3138` |
| `palette-filmee.jpg` | cottonbro studio | [Pexels 5532843](https://www.pexels.com/photo/5532843/) | Pexels | Photo d'un autre entrepôt — cottonbro studio / Pexels | réduite seulement | 1200 x 800 | 182 149 o | `0e4fb51a09a77ac3e88ec3e37f6fe597f8c59dbbdc8bcb69458b10f858d9ee0e` |
| `quai-camion.jpg` | ELEVATE | [Pexels 1267325](https://www.pexels.com/photo/1267325/) | Pexels | Photo d'un autre quai — ELEVATE / Pexels | lettrages « CASCADE » (trois remorques) et petits logos « Utility » floutés (huit zones). Original non retouché : SHA-256 `28504c3aa9fa46f53a92d7384373327810096161ab0e711d70c71829d476eb50` | 1200 x 801 | 108 865 o | `a0388a768d5b0d21237ea83f680dac9a92f279dc333286f1087c9c42a31e3db4` |
| `transpalette-manuel.jpg` | Caleb Oquendo | [Pexels 34585139](https://www.pexels.com/photo/34585139/) | Pexels | Photo d'un autre entrepôt — Caleb Oquendo / Pexels | inscription « SUNBELT RENTALS » du timon, étiquette « Clayton » et petite étiquette du timon floutées. Original non retouché : SHA-256 `ea373acd0f3397252f83f292776dbadad329b9c1dc61adb431e9f3fea2b49b62` | 1200 x 1800 | 216 839 o | `fcb381cdb07e0b7ccf29e3566c3573ae8aed44f628cffb454ef682bd7db36e23` |
| `gilets-epi.jpg` | Carsten Ruthemann | [Pexels 34442873](https://www.pexels.com/photo/34442873/) | Pexels | Photo d'un autre site — Carsten Ruthemann / Pexels | réduite seulement | 1200 x 800 | 142 300 o | `22d3040f1a9649b4a646361376d8e8e913e682ff1f556abe387a58c645529d3c` |
| `zone-colis.jpg` | Freek Wolsink | [Pexels 34221998](https://www.pexels.com/photo/34221998/) | Pexels | Photo d'un autre entrepôt — Freek Wolsink / Pexels | deux affichettes du fond (texte néerlandais, petit logo) floutées. Original non retouché : SHA-256 `d06ac65bdcb3786a08b561d84e548cc4399efff20490ce87683a185e3fec7e04` | 1200 x 800 | 166 167 o | `d323b9145f3fd95a79ec6ac6dbb8e19ce78e643704e29d4e4631b2f85b7026ec` |
| `vestiaire.jpg` | ubeyde oral | [Pexels 3907399](https://www.pexels.com/photo/3907399/) | Pexels | Photo d'un autre vestiaire — ubeyde oral / Pexels | réduite seulement | 1200 x 807 | 136 627 o | `998198dc5444cbf091b5c20952cbb767ec216ebac0ca196463dbe97a525ec04d` |

Total des photos : 1 492 675 octets (environ 1,4 Mo).

## À savoir avant d'afficher

- **`transpalette-manuel.jpg` est un transpalette MANUEL (à timon), pas un transpalette électrique.** Pexels n'a pas fourni de
  transpalette électrique sans personne ni marque (recherches « electric pallet jack/truck », « pallet stacker », « battery »).
  La question `img-transpalette` d'ENT-8.2 (« un transpalette électrique ») ne peut donc pas s'appuyer sur cette photo telle
  quelle : soit la réponse devient « un transpalette » (manuel ou électrique), soit on cherche une autre photo, soit un dessin.
- `palette-filmee.jpg` : **un mur de canettes vides filmées** (vue de face, sans palette visible), pas une palette de cartons ;
  elle montre bien le film étirable. Aucune marque lisible sur les canettes.
- `rayon-magasin.jpg` : les étiquettes de prix sont **en vietnamien et en dongs** (« KHÁN MẶT », « 49.000 »), aucune enseigne.
  Un rayon de serviettes, pas un magasin discount français : décor générique, à ne jamais présenter comme un magasin Action.
- `semi-remorque.jpg` : **camion américain** (route du Nevada), loin et petit ; aucun texte lisible. Pas un tracteur européen.
- `quai-camion.jpg` : trois remorques américaines à quai, sans cabine ; les lettrages ont été floutés (traces de flou visibles
  de près) ; reste un « 2 » de numéro de quai et de petites plaques illisibles.
- `entrepot-racks.jpg` : cartons et seaux portent des étiquettes de produits trop petites pour être lues ; aucune marque
  identifiable.
- `gilets-epi.jpg` : gilets orange et casques bleus accrochés (vestiaire de chantier sombre) ; la marque minuscule sur les
  casques n'est pas lisible.
- `zone-colis.jpg` : cartons filmés sur palettes (décor néerlandais), un ruban orange au sol ; une silhouette minuscule tout au
  fond (près de l'affichette de droite), sans visage reconnaissable.
- `vestiaire.jpg` : vestiaire d'un site de sport (casiers orange), sans personne.
- Le pays n'est pas la France sur plusieurs photos : décor générique seulement.
