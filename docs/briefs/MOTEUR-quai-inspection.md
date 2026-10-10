# Chantier moteur D-4 — Vue quai : inspection de sécurité sur le quai iso, motifs déclarables, palette de fûts

**Statut** : en cours *(état des lieux fait le 10/10/2026 ; cadrage à écrire par Opus ; construction par étapes Sonnet)*
**Pour** : ENT-6.4 France Boissons (`docs/briefs/ENT-6.4-france-boissons-reception.md` §7) ; servira ensuite à ENT-5.4 et ENT-1.1
quand elles passeront sur le quai iso (hors chantier).
**Coordination** : Fable (conversation du 10/10/2026). Règles : `docs/chantiers.md` (ligne D-4), `docs/audit-architecture.md`,
un seul chantier à la fois dans `core/types/quai.js` et `core/iso.js`.

## 1. État des lieux (lecture seule, 10/10/2026, deux balayages Sonnet relus par Fable)

Tout est VÉRIFIÉ (lu dans le code) sauf mention SUPPOSÉ. `q.js` = `core/types/quai.js` (2 504 l.), `iso.js` = `core/iso.js` (574 l.).

### 1.1 Étape sécurité actuelle (lot 5 du 04/10, « ⓪ Avant de décharger »)

- Champs lus : `securite.points[{id, lib, ok}]` (q.js:205, liste non vide sinon pas d'étape), `scene` (1344), `signaler.{bouton, reponse,
  rien, vide}` (1349, 2219-2223), `arret` (1347), `commencer` (1350), `photo` + `alt` (1343). Point faux = `ok: false`.
- Placement : **avant** l'arrivée. `etat.etape` démarre à 0 si `securite` (265) ; le stepper ajoute « ⓪ Avant de décharger » en tête
  (`ETAPE_SECU` 148, 2172-2173) ; l'écran ① ne s'affiche qu'après `securite.fait` (2169). Sur ⓪ : photo + tableau OK / Pas OK
  (1335-1354), aucune scène d'arrivée.
- Fermeture des étapes : `ferme = (n >= 1 && !secuFaite(e)) || (n > 1 && !ouvert)` (2185) ; `aller()` refuse n ≥ 1 sans sécurité faite
  (1916), `decharger()` aussi (1927) ; bouton « décharger » désactivé (1329, 1374).
- État : `db.quais[id].securite = { rep: {}, signaux: [{ points, apresArret }], arrete, fait, chef }` (`securiteNeuve`, 272).
  `commencer` : en guidage, point faux non signalé → `arrete = true` + bandeau (2227-2233) ; en évaluation rien n'arrête ; sinon
  `fait = true`, `etape = 1` (2234).
- Jalons : `securiteSignalee` (seulement s'il existe un point faux, 438-445) et `securiteConstat` (449), par `jalonsSecurite` (433),
  insérés avant les tickets (376).
- Commentaire prévoyant l'image à inspecter : q.js:97 (« la même étape pourra se jouer sur une image à inspecter »).
- Rendu iso + `securite` : permis par la garde (701 ne refuse que froid / multi-camions / mode contrôle) ; **aucun contenu ne combine
  les deux aujourd'hui**.
- Smoby ENT-5.4 : `contenus/smoby-ent54.js:49-65` (`SECURITE = { scene, points: [cale (ok:false), moteur, chauffeur, niveleur, plancher,
  epi], signaler, arret, photo, alt }`, branché l. 91 ; jalons `securite-signalee` / `securite-constat` 230-247 ; libellés avec
  marqueurs `[[mot|libellé]]`).

### 1.2 Motifs de réserve (demande §7.1)

- Liste **codée en dur** : `MOTIFS = { aucun, temperature, avarie: 'Cartons endommagés', manquant, produit }` (q.js:126-129), importée par
  `smoby-ent54.js:17`. La séance ne peut que **filtrer** (`motifs: [ids]`, q.js:204 ; clé inconnue ignorée sans erreur ; `temperature`
  retiré si `froid: false`), jamais ajouter ni renommer.
- Le motif chiffré **existe déjà** : `avarie` demande « Nombre de cartons endommagés » (`CHAMP_RES` 306, attendu `p.avaries`), `manquant`
  « Nombre de cartons manquants » (307) ; lignes de fiche `CONSTATS` `endo` / `manq` (141-142), fiche par référence en iso (1517-1527).
  Texte de la réserve codé en dur : `texteLigne` 312-331.
- Usage : Picard = tous les motifs (SUPPOSÉ pour 4.1 à 4.3), `deuxMotifs: true` en 4.4 (`picard-ent44.js:174`) ; Smoby
  `['avarie', 'manquant']` (`smoby-ent54.js:77`) ; Spartoo idem + `deuxMotifs` (`spartoo-reception.js:78-79`).
- **Le brief §7.1 se trompe** : « fût endommagé » n'est pas un motif nouveau mais le **libellé** d'un motif existant. Le manque est un
  mécanisme de libellés (motif, champ chiffré, ligne de fiche, texte de réserve) déclarables par la séance.
- Le compte rendu d'ENT-5.4 (`ENT-5.4-smoby-reception.md:169-172`) visait d'autres libellés : bouton « Oui, vous pouvez ouvrir et
  décharger » (q.js:1329, 1418), « portes fermées » (1312, 1408, 1016), « Je recharge les palettes refusées » (1771). Sujet voisin mais
  distinct ; la variante iso a déjà son bouton « Oui, vous pouvez décharger » (1374).

### 1.3 Palette de fûts et unité (demande §7.2)

- Aucun champ `forme` sur les palettes (`forme` n'existe que dans `calcul.forme`, 222, 1602). Palette = `{ id, ref, nom, bl, etiq, W, D, L,
  manque[], avarie{}, attendu, motifAttendu, refs?, etiqAvant? }` (`smoby-ent54.js:26-43`).
- Unité « cartons » **codée en dur, ~70 occurrences** : `CONSTATS.unite` (141-142), `CHAMP_RES` (306-308), `texteLigne` (314-329), colonne
  « Cartons » du BL (1282), comptage (1637-1653), `texteCompte` (1501), journal (2358, 2362), jalon « N cartons » (399), aide
  (1634-1640). Aucune option `unite`.
- Le kit dessine déjà des **fûts debout** sur palette de rétention pour les plans d'entrepôt (iso.js:199-229, `fut`, `retention`,
  4 fûts max, `PLACES_FUTS`), pas pour le quai ; côté quai `palIso` ne fabrique que des cartons (q.js:905-914). Les 8 fûts à plat en
  quinconce sont à créer.
- « Avarie visible seulement de l'arrière » : déclarée par `avarie: { '2,0,1': [0, -1] }` (`smoby-ent54.js:38`) ; rendu 3D `palette3d`
  (q.js:555-621, avarie 611-617) ; rendu iso `palIso` (`abime: DIR_FACE(av)`) puis `enfoncement` (iso.js:530-533, `data-iso-avarie`),
  visible selon `faceVisible(r, face)` (iso.js:500) ; texte q.js:980-987.
- Nombre attendu : `reel = W*D*L − manque.length` (185) ; multi-références `couches.length*W*D − manques` (191) ; `manquants = bl − reel`
  (199) ; `avaries` = nombre de clés d'`avarie` (198-199) ; jalon de comptage 394-399 (`compteJuste` 347).

### 1.4 État du quai, recommencer, corriger

- Chemin `db.quais[quai.id]` (q.js:28, 355 ; `entreprise.js:1817-1821`). `recommencer` (API `entreprise.js:1834-1839`) remplace par
  `etatNeuf()` (garde `tiersTemps`) ; `securiteNeuve` est dans `etatNeuf` (266) : l'inspection repartira à zéro avec le quai.
  Bouton absent en évaluation (1874-1875) ; `recommencer: false` le retire (Smoby).
- « Corriger » après le bilan (`entreprise.js:1162-1200`) ne connaît que `fiche`, `planning`, `phrases`, `transfert` ; aucun jalon de
  quai ne porte d'`ecran` (`etapesQuai`, q.js:485-494) : **il ne rouvre jamais le quai, rien à coder** pour le §7.3b.

### 1.5 Rendu iso dans quai.js

- Imports (q.js:118-120) : `projection, facadeQuai, X_PORTE_FACADE, camionPorteur, personne, HAUT_PERSONNE, bulle, horlogeQuai, solQuai,
  niveleur, remorqueInterieur, murQuai, ouvertureQuai, transpaletteManuel, paletteCartons, dimsPalette, faceVisible, facesExterieures`.
  Reconnu par `Q.rendu === 'iso'` (207, `ISO` 699).
- **Deux scènes, deux projections, deux viewBox** :
  - arrivée (« dehors ») : `sceneArrivee(t)` (887-897), `projection({ unite: 54, origine: [330, 150] })`, `<svg data-q-arrivee
    viewBox="70 -30 800 520">` (1363) ; façade + `camionPorteur` qui recule sur `D_ARRIVEE = 5200` ms (886, courbe 889-890, `yr` de 8,5
    à 0,35) ; à la fin `personne(I, 5.05, 3.2)` + `bulle` (892-894) ; rejouée en rAF par `animerArrivee` (1381-1400) ; état d'écran
    `ui.arrivee / rejeu1 / anim1` (717) non persisté ; « ⏩ Passer l'animation » (`passer1`, 1366, 2254) ; puis `data-q-apres-arrivee`
    (1359-1378).
  - intérieur (« dedans ») : `imageIso` (920-949), `I2 = projection({ unite: 60, origine: [470, 235] })` (918), `<svg data-q-scene2
    viewBox="290 0 640 480">` (1052) ; porte levée par `murQuai(I2, ouv, nom)`, `ouv = min(1, t / T_PORTE)`, `T_PORTE = 1800` ms
    (744, linéaire) ; déchargement 6 000 ms par palette, pas de 6 800 ms.
  - **La porte de la façade (`facadeQuai`) est fixe** (iso.js:392-394) : seul `murQuai`, qui vit dans la vue « dedans », se lève. Le
    brief §7.3b suppose que « Ouvrir la porte de quai » s'anime depuis « dehors » : à trancher au cadrage (hypothèse de Fable : le
    bouton **bascule** sur la vue dedans et y joue la levée de porte, aucun dessin nouveau).
- Aucun gestionnaire de clic ni de survol sur `data-q-arrivee` ni `data-q-scene2` ; seul un clic délégué sur `[data-q-palette]`
  (2443-2459, `data-q-etiq`, `data-q-carton`). Conversion pixels → `viewBox` : rien ici, mais le patron existe (`createSVGPoint` +
  `getScreenCTM().inverse()` : `core/types/carte.js:498-499`, `core/types/entrepot-visite.js:721`). Les SVG iso n'ont pas de
  `preserveAspectRatio`.
- La scène est **rendue en chaînes SVG et réinjectée par `innerHTML` à chaque image** (q.js:1123, 1394) : les nœuds sont recréés, donc
  tout gestionnaire doit être délégué sur le `<svg>` ou un parent stable, et la couche des marques doit vivre **hors** du `<g>`
  redessiné.

### 1.6 Kit iso.js

- Projection `projection({ unite = 82, origine = [560, 150] })` (29-39) → `{ unite, P, pts, face, boite }` ; `P(x, y, z) =
  [OX + (x − y)·0,866·u, OY + (x + y)·0,5·u − z·u]` (31). Pas de z-buffer : l'ordre de dessin fait la profondeur. Entrées en mètres pour
  les objets de quai (303).
- Objets de quai : `roue` (288), `boiteY` (310), `personne` (319, sans visage), `HAUT_PERSONNE` (350), `bulle` (367), `horlogeQuai` (377),
  `facadeQuai(I, portes)` (384 : 3 portes, butoirs, « Accueil chauffeurs » 402-404), `X_PORTE_FACADE` (408), `camionPorteur(I, x, yr)`
  (412 ; roues arrière `yr + .56` et `yr + 1.06`, 417 ; cabine vitres sombres 422-423), `OUVERTURE_QUAI` / `ouvertureQuai` (430-432),
  `solQuai` (435), `niveleur(I, 'dedans' | 'dehors')` (446-453, **un seul état : posé**), `remorqueInterieur` (455), `murQuai(I, ouv,
  nom)` (464-473), `transpaletteManuel` (483), `PAL_EUR`, `faceVisible`, `facesExterieures`, `dimsPalette` (494-508), `paletteCartons`
  (542).
- Butoirs : 2 par porte à la façade (395) + 2 sur la bande béton (401), noirs, sans état. **Visibilité camion à quai SUPPOSÉE
  douteuse** : le camion s'arrête à `yr = 0,35` et est dessiné après la façade ; ses boîtes (x 3,7-4,7) recouvrent les butoirs bas et
  sans doute une partie des hauts. À vérifier à l'écran (page d'essai).
- **N'existent pas** : cale de roue, lampe de quai, personne dans la cabine, fumée, niveleur relevé.
- **Pas de boîte englobante projetée** d'un objet : `bornesDecor` (186) ne couvre que la scène animation ; `animation.js:268` utilise
  `getBBox()`. À créer : une fonction pure (ex. `boiteEcran(I, boite3D, marge)`) qui projette les 8 coins d'une boîte monde, chaque
  objet exposant ses boîtes monde ; testable hors navigateur.
- Attributs : `id` seulement sur le dégradé `isoMetal` (42) et le clipPath `quaiIsoOuv` (q.js:961) ; `data-iso-bulle` (372),
  `data-iso-horloge` (379), `data-iso-zone` (438), `data-iso-porte` (470), `data-iso-avarie` (533) ; cartons `class="quai-etiq-clic"
  data-q-etiq data-k data-q-carton` via le callback `attrs` (iso.js:541, 570 ; q.js:970). Aucun `title` ni `tabindex` dans le kit
  (SUPPOSÉ absent aussi dans q.js).
- Couleurs : **aucune variable CSS**, hex fixes (« une photo », iso.js:16-18) ; fond `#e4dfd3` de `.quai-iso` dans les deux thèmes
  (`styles/quai.css:238-241`). Vert dans le décor : panneaux de porte `#1f5f3a` (149, 396, 475), flèche « ENTRÉE » `#107c41` (156-159),
  horloge `#7CFC9A` (379) ; rouge : flèche « SORTIE » `#9d2727` (157), transpalette `#d93a2b` (486) — exception « signalisation, pas un
  verdict » (16-18). La cale rouge à bras entre dans cette exception ; les marques de l'élève, elles, ne doivent être ni vertes ni rouges.
- Qui utilise le kit : `rendu: 'iso'` seulement dans `contenus/spartoo-reception.js:72` (ENT-1.1) ; `core/types/animation.js:53`
  (scène chariot, `contenus/animation-essai.js`). Ni `entrepot.js` ni `plan.js`.

### 1.7 « Moins d'animations »

- Aucune préférence élève. Seule la media query système : `reduit = () => matchMedia('(prefers-reduced-motion: reduce)').matches`
  (q.js:678 ; usages 1218, 1358, 1580, 2267, 2277, 2310 ; `animation.js:226`). La fumée animée consultera `reduit()`.

### 1.8 Tests existants

- Pas de fichier `outils/test/quai*.mjs` : le quai est testé dans `picard.mjs`, `smoby.mjs`, `spartoo.mjs`. `france-boissons.mjs`
  n'a **aucun** cas de quai.
- Sécurité ⓪ : `smoby.mjs:1784-1804` (aides `allerQuai`, `etatQ`, `jalonsQ`, `secu`), cas 1806-1861 (ouverture sur ⓪, arrêt du chef,
  constat figé, point juste signalé, évaluation sans arrêt) ; ENT-5.4 : 2051-2241 (`securite54` 1995, `decharger54` 2010 ; 2164 arrêt
  cale fausse, 2181 texte de l'arrêt, 2210 « Corriger » ne rouvre que le compte rendu).
- Clic sur scène iso : `spartoo.mjs:367-422` (dispatch d'un `MouseEvent` sur `[data-q-carton]`, attentes sur `[data-q-arrivee]`,
  `[data-q-apres-arrivee]`, `[data-iso-bulle]`, `[data-iso-avarie]`, `[data-q="passer1"]`, `[data-q-etatcf]`). Aucun clic par
  coordonnées. Mouvement réduit : `picard.mjs:439-440` (`contexte({ reducedMotion: 'reduce' })`), `smoby.mjs:1925`.
- Kit : `animation.mjs:71` (contraste des teintes), 89 (roues rondes), 106 (palette de cartons, absent, enfoncement selon la vue).

### 1.9 Points où le brief ENT-6.4 §7 est inexact

1. §7.1 : le motif chiffré existe (`avarie`) ; il manque des **libellés déclarables**, pas un motif.
2. §7.1 : les libellés du compte rendu d'ENT-5.4 (bouton, « portes fermées », « je recharge ») sont un sujet voisin, à grouper ou non.
3. §7.3b « Corriger ne rouvre pas l'inspection » : déjà vrai par construction.
4. §7.3b : « dehors » et « dedans » sont deux projections et deux `viewBox` distincts (deux systèmes de coordonnées de clic) ; la porte
   de la façade ne se lève pas (voir 1.5).
5. §7.3b « moins d'animations » : réglage système seulement.
6. §7.2 : fûts debout déjà dans le kit (entrepôt), rien côté quai ; l'unité « fûts partout » touche ~70 endroits.
7. §8 : tous les tests de quai de 6.4 sont à créer (modèles : `smoby.mjs:1806-1861`, `spartoo.mjs:367`).

### 1.10 Risques pour Spartoo ENT-1.1 (seule séance en `rendu: 'iso'`)

1. Toucher `facadeQuai`, `camionPorteur`, `niveleur`, `murQuai` change son dessin : paramètres d'état avec **valeurs par défaut
   identiques à aujourd'hui** ; cale et lampe dessinées **sur demande seulement** (défaut du brief §11).
2. La scène est redessinée par `innerHTML` à chaque image : couche de clic et marques hors du `<g>` redessiné.
3. `spartoo.mjs:367-422` clique avec `page.click` : un calque transparent posé sur la scène pourrait intercepter ses clics.

## 2. Cadrage (Opus, à écrire)

*(découpage en étapes, API de contenu définitive, ordre, « fini quand » de chaque étape, estimation)*

## 3. Compte rendu *(rempli étape par étape)*

-
