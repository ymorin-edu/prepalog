# Chantier moteur D-4 — Vue quai : inspection de sécurité sur le quai iso, motifs déclarables, palette de fûts

**Statut** : en cours *(état des lieux et cadrage faits le 10/10/2026 ; construction par étapes Sonnet, voir 2.4 et le compte rendu 3)*
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

## 2. Cadrage (Opus, 10/10/2026)

Règle de tout le chantier : **sans les champs nouveaux, aucune séance existante ne change** (Picard, Smoby ENT-5.4 en liste,
Spartoo ENT-1.1 en iso). Ce que ce cadrage décide seul est marqué « décidé » ; ce qui est SUPPOSÉ est rappelé au 2.6.

### 2.1 API de contenu définitive

**Validation.** Une fonction pure exportée `verifierQuai(Q)` (dans `quai.js`) rend la liste des écarts en clair ; `creerQuai`
l'appelle à la garde de la l. 701 et lève une erreur qui les nomme (même chemin que le refus iso actuel). Pas dans `reglages`
(appelée par chaque lecture de jalon). Les tests l'appellent directement.

**a) `securite.mode: 'scene'`** (absent : la liste de l'étape ⓪, **sans aucun changement**).

| Champ | Type | Défaut | Refusé au chargement si |
|---|---|---|---|
| `mode` | `'scene'` | absent = liste | autre valeur ; `'scene'` sans `rendu: 'iso'` (« l'inspection sur la scène demande `rendu: 'iso'` ») |
| `points[]` | liste non vide | — | vide ; `id` vide ou en double ; `id` = `aucun-faux` |
| `points[].objet` | `cabine` · `cale` · `butoirs` · `niveleur` · `lampe` | — | autre ; deux points sur le même objet |
| `points[].etat` | cabine `conduite`/`vide` · cale `posee`/`absente` · butoirs `enPlace`/`absents` · niveleur `pose`/`releve` · lampe `allumee`/`eteinte` | — | état inconnu pour cet objet |
| `points[].vue` | `dehors` · `dedans` | celle de l'objet (cabine, cale, butoirs : dehors ; niveleur, lampe : dedans) | différente de celle de l'objet (champ facultatif, gardé pour la lisibilité) |
| `points[].ok` | booléen | — | absent ; **incohérent avec l'état** (`ok: true` sur un état dangereux, `ok: false` sur l'état sûr) |
| `points[].lib` | texte | — | absent (sert au bilan et au corrigé, **jamais affiché pendant l'inspection**) |
| `points[].repare` | texte | « Bien vu, je m'en occupe. » | — (lu seulement si `ok: false`) |
| `signaler.qui` | texte | « le chef de quai » | — |
| `signaler.bouton` | texte | `Signaler à ${qui}` | — |
| `signaler.rien` / `fin` / `vide` | texte | « Là, je ne vois rien qui cloche. » / « Tu me dis quand on peut décharger. » / « Qu'est-ce qui ne va pas ? Clique d'abord sur ce que tu veux me signaler. » | — |
| `consigne` | texte | « Clique sur ce qui ne va pas, puis signale-le. » | — |
| `commencer` | texte | « C'est bon, on peut décharger » | — |
| `arret` | `false` · `true` · texte | `true` (comme le lot 5 : arrêt hors évaluation, texte par défaut) | — ; **en mode liste, `arret: false` est refusé** (voir 2.6, contradiction 1) |
| `bilan` | texte | absent = rien | — |
| `photo`, `alt`, `scene`, `signaler.reponse` | — | ignorés en mode scène | `photo` déclarée en mode scène (rien à montrer) |

Objet non déclaré : `cabine`, `butoirs`, `niveleur` se dessinent dans leur état d'aujourd'hui (`vide`, `enPlace`, `pose`) ;
`cale` et `lampe` **ne se dessinent pas** (défaut du brief §11, retenu : ENT-1.1 ne change pas d'un pixel).

**b) Unité et libellés des motifs** (demande §7.1, regroupée avec l'unité de §7.2 : c'est la même source de texte).

| Champ | Type | Défaut | Refusé si |
|---|---|---|---|
| `unite` | `'fûts'` (pluriel en *-s*, singulier = sans le *s*) ou `{ un, des }` | `{ un: 'carton', des: 'cartons' }` | texte sans *s* final ; objet sans `un` ou `des` |
| `motifs` | liste d'ids (filtre, **inchangé**) | tous | id inconnu (aujourd'hui ignoré : on le refuse désormais, décidé ; aucune séance n'en a) |
| `libelles.avarie.nom` / `.manquant.nom` / `.produit.nom` | texte | `${Des} endommagés` (= « Cartons endommagés »), `Manquant`, `Produit différent de la commande` | clé hors `avarie`, `manquant`, `produit` |
| `libelles.avarie.precision` | texte | `écrasé(s)` accordé (= la réserve d'aujourd'hui) | — |

Tirés de l'unité, non déclarables (une seule source) : champ chiffré « Nombre de fûts endommagés / manquants », lignes de
fiche « Fûts endommagés / manquants », colonne du BL, comptage, journal, jalon « N fûts », aides, zoom (« Fût 3 / 8 »).
L'unité doit être **masculine** (accords « endommagés », « manquants ») : écrit dans la fiche, non vérifiable. `MOTIFS` reste
exporté tel quel (corrigés existants) ; nouveaux exports `libellesMotifs(Q)` et `libMotifs(L, Q?)` (second paramètre facultatif).
ENT-6.4 déclarera : `unite: 'fûts', motifs: ['avarie', 'manquant', 'produit'], libelles: { avarie: { nom: 'Fût endommagé',
precision: 'fuite' } }` → réserve « P3 AFF-20 : acceptée sous réserve — 1 fût endommagé (fuite). ».

**c) Palette de fûts** : `forme: 'fut'` **sur la palette** (absent = cartons). Huit places en quinconce 3-2-3, numérotées
comme les cartons : rangée du fond 1-2-3, milieu 4-5, avant 6-7-8, de gauche à droite. `manque: [5]` (numéros),
`avarie: { 2: 'N' }` (numéro → face qui fuit, `N` = arrière). Total 8 ; `reel = 8 − manque.length` ; `avaries` = nombre de clés
(calculés dans `reglages`, jamais déclarés). Refusé : `W`, `D`, `L`, `refs` ou `etiqAvant` avec `forme: 'fut'` ; numéro hors 1-8
ou en double ; face de fuite **intérieure** (cachée par les autres fûts) ; `aides.regleCouches` ou `aides.detailComptage` vrais.
Une palette de fûts prend toujours le **brouillon** de calcul (les lignes de la feuille parlent de couches, comme pour une
palette multi-références) : décidé, à dire au compte rendu d'ENT-6.4 (son brief §4.4 dit `feuille`).

### 2.2 Le mode scène, comportement

- **Déroulé.** `etape` démarre à 1, pas d'étape ⓪ ; le stepper reste ① à ④ ; ② à ④ fermés tant que `securite.fait` est faux
  (seuil de `ferme` et d'`aller()` à n ≥ 2 au lieu de n ≥ 1 ; `decharger()` garde `secuFaite`). L'animation d'arrivée est celle
  d'aujourd'hui (5,2 s, « Passer ») ; au bout, en mode scène, ni bulle ni BL : la consigne, la scène figée, l'inspection.
- **Deux vues, deux systèmes de coordonnées** (ceux d'aujourd'hui, donc le même dessin) : `dehors` = `projection({ unite: 54,
  origine: [330, 150] })`, `viewBox="70 -30 800 520"` ; `dedans` = `I2`, `viewBox="290 0 640 480"`, porte levée, remorque et
  palettes par l'ouverture, personne dans la scène. Un seul `<svg data-q-inspection data-vue="…">` à la fois :
  `<g data-g="iso">` (le décor, seul réécrit par une boucle d'animation) puis `<g data-q-marques>` (hors du décor).
- **Porte (hypothèse de Fable confirmée).** « Ouvrir la porte de quai » bascule sur `dedans` et y joue la levée existante de
  `murQuai` (1,8 s ; aucune avec `reduit()`). Argument : camion à quai (`yr = 0,35`), la caisse masque la porte de la façade ;
  une porte qui se lèverait dehors ne se verrait pas. Deux précisions : l'ouverture est **rangée** (`securite.ouverte`, un
  rechargement montre la porte levée, sans rejouer) ; l'étape ② démarre **porte déjà levée** (pas de seconde levée). Ensuite
  « Voir dedans → » / « ← Revoir dehors ». Ouvrir ne coûte pas de minute et ne fige rien. Clics ignorés pendant la levée.
- **Clic → viewBox** : `createSVGPoint` + `getScreenCTM().inverse()` (patron `core/types/carte.js:498`), écouteur posé sur le
  `<svg>` à chaque `brancher`. Point touché = le **premier point déclaré** de cette vue dont la zone contient le clic, sinon
  `null` (à côté). Zone = `boiteEcran(I, boites, 12)` (2.3) calculée sur l'**état dessiné à cet instant** (cabine réparée :
  plus de fumée, donc plus de zone de fumée ; cale absente : la zone reste l'emplacement devant la roue).
- **Marques** (état rangé) : `{ n, vue, x, y, point, envoi }`, `n` = compteur jamais réutilisé, `x`, `y` arrondis au dixième,
  `envoi` = numéro du signal ou `null`. Clic sur une marque non envoyée : elle part. Marque envoyée : grisée, **inerte**
  (décidé : pas retirable, un clic dessus ne pose rien). Dessin : rond r 12, fond `rgba(255,255,255,.88)`, contour d'encre
  `#1a1915` épais, numéro en encre ; envoyée : contour `#6b6b6b` en tirets, opacité .55. Ni vert ni rouge ; teintes fixes
  comme le reste de la scène (fond fixe `#e4dfd3` dans les deux thèmes, `styles/quai.css:238`), contraste ≥ 4,5 testé.
- **Rien ne trahit les zones** : aucun `title`, `tabindex`, `role` ni attribut `data-*` nommant un objet dans la scène
  d'inspection ; `cursor: crosshair` posé sur `[data-q-inspection]` et hérité partout ; aucune surbrillance. Les tests et la
  page d'essai lisent les zones par la fonction exportée, jamais dans le DOM. Clavier : non (brief §7.3c, au compte rendu).
- **« Signaler à {qui} »** : sans marque non envoyée → `vide`, rien n'est rangé. Sinon un signal `{ points: [ids touchés,
  sans doublon], rien: n marques à côté, marques: [n], apresArret }` est rangé, les marques reçoivent `envoi`. Réponse
  (`securite.chef`) : les `repare` des défauts touchés **pas encore réparés**, dans l'ordre de déclaration ; puis `rien` une
  seule fois s'il y a une marque à côté, sur un point `ok: true`, ou sur un défaut déjà réparé (décidé : ce dernier cas n'est
  **pas** un faux signalement au jalon) ; puis `fin`. Affichée sous la scène, `role="status"`, « Nadia : « … » ».
- **Réparation calculée, jamais rangée** : `etatsScene(S, sec)` (pure, exportée) rend l'état de chaque objet = état déclaré,
  ou état sûr si le point est dans un signal, ou si `fait`. `cabine` réparée : plus de silhouette ni de fumée, le chauffeur
  debout près de l'accueil chauffeurs ; `niveleur` réparé : posé.
- **« C'est bon, on peut décharger »** : confirmation en deux clics (`secondClic`, comme « Contrôles terminés »), décidé.
  Un défaut jamais signalé, `arret` ≠ `false` et hors évaluation : arrêt (`arrete = true`, texte `arret` ou celui du lot 5,
  sans nommer le point), on continue d'inspecter, les signaux suivants portent `apresArret: true`. Sinon : `fait = true`,
  marques non envoyées abandonnées, toutes les marques cachées, défauts restants à l'état sûr **sans aucun texte** ; puis la
  suite iso d'aujourd'hui : chauffeur debout + bulle (`paroleArrivee`, position telle que la bulle tienne dans le viewBox),
  BL, « Oui, vous pouvez décharger ». Ensuite ② et ④ dessinent niveleur posé et lampe dans son état déclaré.
- **Jalons en mode scène** (les jalons `securiteSignalee` / `securiteConstat` ne sont pas produits) : un jalon
  `securite-<id>` par point `ok: false` (juste = l'id est dans un signal `apresArret: false`), puis `securite-aucun-faux`
  (juste = au moins un signal **et** aucun signal avec un point `ok: true` ni `rien > 0`). `lib` **neutre** (« Danger n° 1
  signalé avant de décharger », « Aucun faux signalement ») ; `attendu` nomme le défaut par son `lib` (vu seulement au
  bilan, défaut du brief §11). `bilan` s'affiche au bilan du quai si un jalon `securite-<id>` est faux.
- **État** : `securite = { mode: 'scene', marques: [], compteur: 0, signaux: [], ouverte: false, arrete: false, fait: false,
  chef: '' }` (`securiteNeuve` selon le mode ; `normaliser` complète une base ancienne). `recommencer` repart de `etatNeuf` :
  rien à coder. « Corriger » ne rouvre pas le quai (1.4) : rien à coder.
- **Mouvement réduit** : pas de manœuvre ni de levée animées ; la fumée reste **dessinée, immobile** (sinon l'indice
  disparaît) : animation CSS dans `styles/quai.css`, coupée par `@media (prefers-reduced-motion: reduce)`, sans boucle rAF.
- **Spartoo `spartoo.mjs:367-422`** : rien à craindre, aucun calque ni écouteur n'existe sans `mode: 'scene'`, et
  l'inspection est un autre `<svg>` que `data-q-arrivee` / `data-q-scene2`.

### 2.3 Le kit (`core/iso.js`)

Chaque objet expose ses **boîtes monde** (`[x0, y0, z0, x1, y1, z1]`, en mètres) **calculées par les mêmes constantes que
son dessin**, et `boiteEcran(I, boites, marge)` (pure : projette les 8 coins de chaque boîte, rend `{ x, y, w, h }` en unités
du viewBox, marge comprise) sert à toutes les zones. Paramètres **ajoutés en dernier, défaut = dessin d'aujourd'hui** :

- `camionPorteur(I, x, yr, o = {})` : `o.cabine: 'vide'` (défaut, inchangé) | `'conduite'` (silhouette tête-épaules **sans
  visage** derrière le pare-brise et la vitre latérale, gilet jaune comme `personne`) ; `o.fumee` (vrai avec `conduite`) :
  pot vertical à l'arrière droit de la cabine, trois bouffées grises translucides de classe `iso-fumee` ; `o.cale:
  'posee'` (cale **rouge à bras** devant la roue arrière côté élève, `x + .82`, signalisation et non verdict, exception
  « signalisation » du kit) | `'absente'` | absent (rien). Exporte `boitesCamion(x, yr, o)` → `{ cabine, fumee, cale }`.
- `facadeQuai(I, portes, o = {})` : `o.butoirs: { porte: 1, etat: 'absents' }` retire les 4 butoirs de cette porte (défaut :
  tous présents). `boitesButoirs(porte)`. **Visibilité** (calcul du 10/10, SUPPOSÉ jusqu'à l'écran) : camion à quai, la paire
  droite (x 4,59-4,75) dépasse de la caisse, la paire gauche est presque cachée (le butoir haut affleure au-dessus du toit).
  Si Tristan ne les voit pas assez : épaissir la paire droite, **sans déplacer le camion**.
- `niveleur(I, part, etat = 'pose')` : `'releve'` = plaque dressée contre le seuil, lèvre en l'air, **vide sombre** entre le
  seuil et le plancher de la remorque (partie `dedans` = le vide, partie `dehors` = la plaque). `boitesNiveleur(etat)`.
- `lampeQuai(I, etat)` (nouveau) → `{ cone, tete }` : tête et bras articulé fixés au mur à droite de l'ouverture, `cone`
  (allumée seulement, blanc pâle translucide) à dessiner **dans** le clip de l'ouverture, `tete` après `murQuai`.
  `boitesLampe()` = tête + bras (le cône n'est pas dans la zone : il recouvre la remorque, cliquer dedans = à côté).
- **Option de mise au point** `o.essai` : entoure chaque objet d'un `<g data-essai-objet="…">` ; **seule la page d'essai et les
  tests** la passent (le quai jamais) : c'est elle qui permet de vérifier qu'un objet est visible là où est sa zone.
- **Fûts** : `paletteFuts(I, pal, ox, oy, r, o)` (mêmes options que `paletteCartons` : `yMin`/`yMax`, `attrs`, `sel`,
  `lisible`, `dents`, plus `cote` = côté du bac en unités du monde, 1,30 par défaut). Bac de rétention noir (pieds, bac,
  caillebotis : `retention` agrandi), 8 fûts **debout** (`fut` existant, mis à l'échelle), une seule couche, quinconce 3-2-3 ;
  place vide = rien ; collerette étiquetée (réf.) ; fuite = coulure sombre sur la face déclarée + flaque dans le bac derrière
  ce fût, dessinées seulement si `faceVisible(r, face)` (même règle que `enfoncement`). Modèle validé :
  `docs/briefs/france-boissons/materiel-palette-retention.svg`. `dessinerCharge` (4 fûts, animation) n'est pas touché ;
  ENT-6.5 (D-5) reprendra `paletteFuts`.
- **Quai à plusieurs palettes** (jamais joué : Spartoo n'en a qu'une). Remorque de 3,3 m, ouverture de 1,2 m (décor stylisé) :
  aux étapes ② et ④ la palette de fûts se dessine avec `cote: 0.95` (à l'échelle du décor), en grand à ③ avec 1,30 ; les
  palettes au fond sont coupées au mur du fond (`yMin: -3.6`, sans effet sur la palette de Spartoo) ; zone de réception et
  places d'arrivée calculées pour N palettes (N = 1 : valeurs d'aujourd'hui). Décidé, jugé sur la page d'essai.
- **Unité « fûts partout » : coût.** 51 mentions de « carton » dans `quai.js` (≈ 70 textes avec la colonne du BL et les
  pluriels) : une constante `R.u = { un, des }` posée par `reglages`, lue partout. ≈ 3 h, mécanique, protégée par les suites
  Picard, Smoby et Spartoo (textes vérifiés) et un test « unité par défaut = textes d'aujourd'hui ». **Avis : le faire.** Le
  repli du brief (cartons dessinés, unité seule) montrerait une palette en bois chargée de cartons appelés « fûts » :
  contraire à la décision 52 (« jamais de palette en bois ») ; il n'économise que le dessin (≈ 4 h), pas l'unité.

### 2.4 Étapes (Sonnet), dans l'ordre

Pour toutes : suite complète `node outils/test-parallele.mjs` verte avant chaque push ; chaque test éprouvé dans les deux sens
(un sabotage nommé le fait tomber) ; un commit par étape ; ligne d'état dans `docs/chantiers.md` (D-4) et compte rendu au §3.
**Tests du moteur dans un nouveau bloc `outils/test/quai-iso.mjs`** (décidé) : un bloc d'entreprise ne doit pas porter un
mode générique, Smoby est déjà le bloc le plus long (il fixe la durée en parallèle), et un bloc à part tourne en même temps
que les autres. L'inscrire dans `BLOCS` et dans le groupe le plus court de `GROUPES` (`outils/test.mjs`) : **à signaler à
Tristan**. Il monte la déclaration d'essai `outils/essai-quai-inspection.js` dans `creerEntreprise`, comme
`outils/test/animation.mjs:31-51`. Les cas propres à la séance (jalons pondérés, parcours 10/10) restent dans
`france-boissons.mjs`, avec la séance. Aucun cas existant réécrit ; `commun.mjs` non touché. L'inscription de `docs/EN-COURS.md`
est à compléter avec `outils/test.mjs`, `outils/essai-quai-inspection.*`, `outils/test/fichiers/` et `activites/FICHE-SEANCE.md`.

| # | Étape | Fichiers | Construit | Tests (sabotage qui doit faire tomber) | Fini quand (Tristan, à l'écran) | Durée |
|---|---|---|---|---|---|---|
| 0 | Référence Spartoo | `outils/test/quai-iso.mjs`, `outils/test/fichiers/quai-iso-reference.json`, `outils/test.mjs` | **Avant toute retouche du kit** : capture des sorties du kit (façade, camion à 3 reculs, niveleur, mur à 3 ouvertures, sol, palette à 4 rotations) et du SVG des écrans ①②③④ d'ENT-1.1, groupes `data-iso-bulle` retirés (leur largeur dépend de la police) | égalité octet pour octet (un 0,01 changé dans `camionPorteur` → tombe) | rien à voir : la référence est commitée | 1 h |
| 1 | Kit sécurité + page d'essai | `core/iso.js`, `styles/quai.css`, `outils/essai-quai-inspection.html` et `.js` | objets et états du 2.3, boîtes, `boiteEcran`, fumée CSS ; page : les deux vues, un sélecteur d'état par objet, case « montrer les zones » (page seulement) | référence de l'étape 0 intacte ; `boiteEcran` sur valeurs écrites à la main ; chaque zone contient la `getBBox()` de son objet (`o.essai`) et le centre de la zone touche l'objet (`elementFromPoint`) ; zones d'une vue disjointes ; cale et lampe absentes par défaut ; fumée immobile en mouvement réduit mais présente | chaque objet se reconnaît seul dans chaque état ; on voit le chauffeur au volant et la fumée ; les butoirs se voient camion à quai ; le vide du niveleur relevé se voit | 4 à 5 h |
| 2 | Mode scène sur la page d'essai | `core/types/quai.js`, `styles/quai.css`, page d'essai | 2.1 a et 2.2 entiers ; la page joue la scène d'ENT-6.4 (Nadia, défauts, pièges) dans le vrai moteur | `verifierQuai` (chaque refus) ; clic au centre de chaque zone à la souris (`boundingBox()`, deux vues) → bon point ; clic sur le mur → `null` ; niveleur seulement dedans ; marque retirée avant envoi ne compte pas, envoyée compte ; silhouette seule ou fumée seule ; deux envois ; réparation visible (plus de fumée) ; réparé re-signalé ≠ faux ; `arret` false / vrai / évaluation ; décharger sans signaler → ② montre niveleur posé, sans texte ; inaction → jalons faux ; aucun `title`/`tabindex`, curseur identique partout ; `recommencer` ; mouvement réduit ; Smoby (liste) et référence Spartoo inchangés | Tristan clique toute l'inspection : marques, réponses de Nadia, scène qui se répare, porte qui se lève, rien ne trahit au survol | 6 à 8 h |
| 3 | Palette de fûts | `core/iso.js`, `core/types/quai.js`, page d'essai | `paletteFuts`, `forme: 'fut'` (2.1 c), ③ fût cliquable (étiquette), ② et ④ à N palettes | total, réel, avaries calculés (P4 = 7, P3 = 1 avarie : valeurs à la main) ; fuite visible à la rotation 2 seulement ; place vide ; refus de forme ; référence Spartoo intacte | 4 palettes de fûts reconnaissables à ②③④, la fuite ne se voit que de l'arrière, P4 a un trou | 4 à 5 h |
| 4 | Unité et libellés | `core/types/quai.js`, page d'essai | 2.1 b ; `R.u` partout ; `libellesMotifs`, `libMotifs(L, Q)` | textes d'aujourd'hui inchangés sans `unite` (fiche, BL, réserves, jalons de Smoby relus) ; avec `fûts` : « Nombre de fûts endommagés », réserve « 1 fût endommagé (fuite) », BL « Fûts » ; aucun « carton » à l'écran d'un quai en fûts (balayage du texte de chaque étape) | le quai d'essai parle de fûts partout | 3 à 4 h |
| 5 | Chariot frontal en iso *(si Tristan le veut, point 1 du 2.5)* | `core/iso.js`, `core/types/quai.js` | avec `dechargement.par: 'cariste'` et `rendu: 'iso'`, `dessinerChariotFrontal` (échelle du quai) sort les palettes à la place du chauffeur au transpalette | Spartoo (chauffeur) intact ; le chariot entre par l'ouverture, coupé au mur | le déchargement d'essai se fait au chariot | 3 à 4 h |
| 6 | Fiche et livraison | `activites/FICHE-SEANCE.md`, `docs/chantiers.md`, `docs/decisions.md`, §3 ci-dessous | paragraphe « Inspection sur la scène », unité, libellés, fûts | — | D-4 livré : la séance peut s'écrire | 1 h |

### 2.5 Points à trancher par Tristan

1. **Déchargement au chariot frontal sur le quai iso** (brief ENT-6.4 §4.3, absent du §7 et du moteur : en iso, le chauffeur
   tire la palette au transpalette, quel que soit `dechargement.par`). **(a, recommandé)** étape 5 (+3 à 4 h) : c'est le
   chariot qui entre dans la remorque, et c'est pour lui qu'on cale le camion et qu'on pose le niveleur, la scène de sécurité
   prend son sens. (b) garder le transpalette (0 h), retirer « chariot frontal » des mots cliquables de 6.4.
2. **Unité « fûts » partout** (étape 4, ≈ 3 h). **(a, recommandé)** oui, avec la palette de fûts dessinée (2.3).
   (b) repli du brief : cartons dessinés, unité seule (économise ≈ 4 h de dessin, contredit la décision 52).
3. Aucun troisième : le reste est décidé ci-dessus avec le défaut « rien ne change aux séances existantes », et se juge sur la
   page d'essai (taille des palettes à ②④, place du chauffeur près de l'accueil, teinte des marques).

### 2.6 Estimation, contradictions, SUPPOSÉ

**Estimation** : 19 à 24 h de sous-agent sans l'étape 5, 22 à 28 h avec (≈ 2,5 à 3,5 jours au rythme des validations) ; la
suite complète (≈ 4 min 30) à chaque push. Version courte possible : étapes 0, 1, 2 (l'inspection seule, ≈ 12 h), fûts et
unité ensuite.

**Ce que ce cadrage contredit** :
1. `arret` est **un texte** dans le lot 5 (q.js:1347, message de l'arrêt) et l'arrêt dépend de l'évaluation, pas de lui :
   `arret: false` n'a de sens qu'en mode scène ; en liste il serait silencieusement ignoré, donc refusé.
2. Brief §7.2 : « 8 fûts à plat » = **une seule couche, fûts debout** (le brief §2 le calcule : 1,19 × 1,08 m = trois cercles
   de 39,5 cm en quinconce vus de dessus) ; pas de fût couché à dessiner.
3. Brief §4.4 : `calcul: { forme: 'feuille' }` ne convient pas aux fûts (lignes « couches ») : brouillon imposé.
4. Brief §7.3b : une palette de rétention de 1,30 m ne passe pas l'ouverture stylisée de 1,2 m, et le quai iso n'a jamais
   déchargé plus d'une palette : à l'échelle du décor aux étapes ② et ④ (2.3).
5. Brief §5 : un `lib` de jalon qui nomme le défaut pourrait se lire avant la fin si les titres d'étape sont visibles de
   l'élève pendant la séance : `lib` neutre, défaut nommé dans `attendu` ; **la séance devra aussi garder des titres
   d'étape neutres** (ENT-5.4 a « La cale signalée avant de décharger » : à vérifier à l'étape 2, hors chantier sinon).
6. Hypothèse de Fable sur la porte : confirmée, avec l'ouverture rangée et l'étape ② qui démarre porte levée.

**SUPPOSÉ** (à vérifier à l'écran ou en route) : visibilité des butoirs (calcul, pas d'écran) ; marge de 12 unités du viewBox
= 12 px seulement à pleine largeur (plus petite sur un écran étroit : à regarder en 375 px) ; la police ne change que les
bulles (exclues de la référence) ; un titre d'étape de séance est lisible par l'élève pendant la séance (point 5).
VÉRIFIÉ : le refus nouveau d'un id inconnu dans `motifs` ne touche personne (seuls Smoby et Spartoo filtrent, avec
`['avarie', 'manquant']`).

## 3. Compte rendu *(rempli étape par étape)*

-
