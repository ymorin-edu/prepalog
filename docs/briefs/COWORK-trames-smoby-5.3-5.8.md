# Brief — trames élève ENT-5.3 à ENT-5.8 Smoby, BROUILLONS (déposées par Cowork le 06/10/2026 au soir)

> **📋 Phrase à copier-coller dans ccode (seulement quand Tristan le dit) :**
>
> ```
> Lis docs/briefs/COWORK-trames-smoby-5.3-5.8.md : commite les fichiers des six trames Smoby déposés par Cowork (liste §2), sans rien déclarer. Ne touche à aucun autre fichier.
> ```

**Statut** : déposé, **non commité, non déclaré** (règle 6 : une trame se déclare quand Tristan l'a relue).

## 1. Ce que c'est

Les trames élève d'ENT-5.3 à ENT-5.8 au **format long** (décision de Tristan du 06/10 au soir, comme 5.1 et 5.2) :
chacune **6 étapes, une par page, + la feuille de cours à détacher** (8 pages). Écrites **avant** la validation à
l'écran, à la demande de Tristan (« toute la suite 5.3 → 5.8 »), d'après le code des séances (et, pour 5.3, d'après
l'écran tel qu'il sera **après le lot A** de `SMOBY-retours-5.3.md`). Voix du site au **tu** ; extérieurs au **vous**
(règle A5 du même brief).

| Séance | Étapes de la trame | Ce qui est calculé et vérifié par le générateur |
|---|---|---|
| 5.3 visite | Bruno et vue du ciel · parcours d'une palette · mots du rack · travée · adresse · fin de visite (sécurité) | Photos de l'écran imprimées **en gris**, lettrées / numérotées en mémoire (aucune image nouvelle) ; adresses de l'exercice lues dans le stock (`smoby-entrepot.js`) |
| 5.4 réception | message · sécurité avant de décharger · décharger et compter · faire le tour et décider · réserves et signature · compte rendu | cartons réels, manques, décisions depuis les palettes |
| 5.5 rangement | messages · fiche des palettes · ranger (+ calcul de charge d'un niveau) · entrée en stock · écran Stock (+ calcul) · réponse à K+N | **bonnes adresses recalculées avec les six règles = celles du brief ENT-5.5 §4** ; pièges vérifiés ; 360 → 394 porteurs |
| 5.6 préparation | message · bon et parcours · rupture · monter la palette · poids et hauteur (calcul) · filmer, étiqueter, vérifier | 331 kg et 1,74 m recalculés ; rupture et palettes de réserve possibles lues dans le stock |
| 5.7 enlèvements | messages · enlèvements (dernier départ) · chauffeurs et règles (reprise + 11 h) · planning · panne · ce qu'on retient | **les deux solutions `SOLUTION` rejugées avec les neuf règles** ; enlèvement touché par la panne |
| 5.8 lettre de voiture | message · trois documents (+ poids brut) · **contrat de transport à trois parties** (art. L132-8 C. com.), rôles à déduire, puis lettre de voiture · accident (calcul) · client · Smoby et fin de la série | 6 091 kg (32 × 180 + 331) ; 11 h 00 |

## 2. Fichiers déposés (tous neufs)

- `outils/trame-smoby-visite.py`, `trame-smoby-reception.py`, `trame-smoby-rangement.py`, `trame-smoby-preparation.py`,
  `trame-smoby-enlevements.py`, `trame-smoby-lettre-voiture.py` : les générateurs. Chacun inscrit ses réponses dans
  `corriges_data._DICOS` (5.7 aussi dans `_EXTRAS`, deux tableaux de mêmes en-têtes) : `outils/corriges_data.py` et
  `outils/trame_commun.py` **non modifiés**.
- `contenus/trames/ENT-5.3-smoby-visite-trame-eleve.{docx,pdf}`, `ENT-5.4-smoby-reception-…`, `ENT-5.5-smoby-rangement-…`,
  `ENT-5.6-smoby-preparation-…`, `ENT-5.7-smoby-enlevements-…`, `ENT-5.8-smoby-lettre-voiture-…` (8 pages chacune).
- `contenus/corriges/ENT-5.3-trame.js` (39 questions), `ENT-5.4-trame.js` (37), `ENT-5.5-trame.js` (32),
  `ENT-5.6-trame.js` (36), `ENT-5.7-trame.js` (39), `ENT-5.8-trame.js` (35). Les corrigés calculés `ENT-5.x.js`
  **ne sont pas touchés**.

Empreintes vérifiées après écriture (les 24 fichiers relus sur le poste : identiques).
Message de commit proposé : « Smoby : trames élève ENT-5.3 à 5.8 et leur corrigé (brouillons, non déclarées) ».

## 3. À revoir après l'essai à l'écran

**Mise à jour du 06/10, plus tard dans la soirée** (essais à l'écran de Tristan, commit « Briefs : essais à l'écran
validés… ») : ENT-5.4, ENT-5.5, la visite (moteur), le plan d'entrepôt (rangement et préparation) et le quai 2de sont
validés à l'écran. **ENT-5.8 : décision de Tristan appliquée** (brief ENT-5.8, « Pour Cowork ») : l'étape 3 explique le
contrat de transport tripartite (citation de l'art. L132-8 du Code de commerce, les trois rôles) **sans dire qui est qui** ;
l'élève le déduit dans un tableau « Rôle / Qui, dans cette commande ? / Comment le sais-tu ? ». Les QCM qui nommaient
l'expéditeur (étapes 2, 3, 6) sont neutralisés ou retirés ; le calcul du poids passe à l'étape 2. Les quatre fichiers
d'ENT-5.8 de la liste §2 sont remplacés (35 questions au corrigé).
 (marqué « À REVOIR » dans chaque générateur)

- **5.3** : écrite d'après le lot A (points 7 « Travée » et 8 « Croisillons » déplacés, définitions sans couleur) : si
  Claude Code s'écarte du brief, recaler `MOTS` dans le générateur. La photo du ciel est lettrée A-F dans un autre ordre
  que les numéros de l'écran (exprès).
- **5.4, 5.5, 5.6, 5.8** : libellés des boutons repris du code (« Faire le tour de la palette », « Descente de la
  réserve », « Vérifier ma préparation », « Écrire les réserves sur le BL »…), pas vus à l'écran.
- **5.7** : le message de l'atelier passe au tu avec le lot A5 bis ; la trame ne le cite pas.
- **Durée** : six étapes par trame. Version courte possible pour chacune : retirer l'étape « calcul » (5.5 étape 5,
  5.6 étape 5) ou l'exercice d'adresses (5.3 étape 5).

## 4. Plus tard, séance par séance, quand Tristan aura relu la trame (pas avant)

1. Retirer `sansTrame` (5.3) et déclarer `trame: { pdf, docx }` dans `activites/smoby-<nom>.js`.
2. Pour les séances qui ont un corrigé calculé (`ENT-5.4.js` à `ENT-5.8.js`) : importer `CORRIGE` de
   `./ENT-5.x-trame.js` et ajouter ses `items` après ceux calculés, étapes marquées « (trame) » (comme 5.2 et Picard).
   **5.3** n'a pas de corrigé calculé : déclarer `corrige: './contenus/corriges/ENT-5.3-trame.js'`.
3. Régénérer : `python3 outils/trame-smoby-<nom>.py` puis
   `soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/<fichier>.docx`.
   (Le générateur de 5.3 lit les photos de `contenus/smoby/visite/` et a besoin de Pillow et de la police DejaVu Sans.)

## 5. Vérifié / construit

- Vérifié : plateforme de Moirans-en-Montagne ; circulation piétons / engins séparée (INRS ED 6350) ; plaque de charge
  des racks (INRS ED 771) ; points de sécurité au quai ; réserve précise, « sous réserve de déballage » sans valeur ;
  3 jours pour confirmer une réserve au transporteur (C. com. art. L133-3, note enseignant 5.4) ; CACES R489 cat. 5 ;
  règlement (CE) n° 561/2006 (4 h 30 / 45 min, 9 h, 11 h) ; permis C / CE ; mentions de la lettre de voiture
  (arrêté du 9 novembre 1999).
- Construit (comme les séances) : Bruno, le plan, le stock, les commandes, les chauffeurs, les clients, l'accident.

## Compte rendu *(rempli par Claude Code)*

- Fichiers commités (06/10/2026, commit 72f11ec, poussé) : les 24 fichiers de la liste §2, et eux seuls — 6 générateurs
  `outils/trame-smoby-*.py`, 12 trames `contenus/trames/ENT-5.3` à `5.8` (docx + pdf), 6 corrigés
  `contenus/corriges/ENT-5.3-trame.js` à `ENT-5.8-trame.js`. Contrôles avant commit : aucune adresse internet, fins de
  ligne LF, chaque corrigé s'importe (39, 37, 32, 36, 39, 35 questions, comme annoncé). Suite non lancée : aucun fichier
  servi au site n'a changé.
- Écarts : aucun. Rien de déclaré (`sansTrame` de 5.3 toujours en place, aucun `trame:` ni import de corrigé) : c'est
  l'étape §4, après relecture des trames par Tristan.
