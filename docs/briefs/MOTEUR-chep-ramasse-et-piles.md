# Brief de chantier moteur — CHEP : la tournée de ramasse (lot A) et les piles de palettes vides sur le quai iso (lot B)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/chantiers.md, docs/briefs/COORDINATION-chep.md, docs/briefs/MOTEUR-vue-tournee-camion.md (§6) puis docs/briefs/MOTEUR-chep-ramasse-et-piles.md. Fais l'état des lieux du lot A en lecture seule, annonce la durée, construis le lot A avec sa page d'essai, et envoie-moi une capture avant le lot B.
> ```

**Statut** : **lot A livré** (18/10/2026, à valider à l’écran) ; lot B à implémenter
**Date du brief** : 17/10/2026
**Conversation d'origine** : Cowork (Opus), cadrage de CHEP (décisions déléguées par Tristan, 17/10/2026). Séances servies : **ENT-9.2**
(les deux lots), **ENT-9.4** (les deux lots), puis d'autres (§1).
**Modèle** : **Opus** (vue du moteur). **Un seul chantier moteur à la fois dans tout le dépôt** : vérifier `docs/EN-COURS.md` (le 17/10 au
soir, une session travaille sur les contenus d'Action, hors moteur).
**Durée estimée** : **lot A ≈ 7 h**, **lot B ≈ 9 h**. Le temps part dans la carte (extraction, build, contrôle), le dessin des piles dans le
kit iso, les tests de non-régression (Boost, ENT-6.9, quais existants) et les pages d'essai.

## 1. Pourquoi, et pour combien de séances (règle du 03/10 : une vue se juge au nombre de séances qu'elle sert)

- **Lot A — la ramasse** : « Organisation de la ramasse des supports de charge » est un indicateur officiel de C2.5. Le lot 4 de
  `MOTEUR-vue-tournee-camion.md` (une charge qui monte et descend) était déjà prévu « pour plus tard dans l'année ». Le lot A **le
  construit**, avec un cas de plus (départ à vide, on ne fait que reprendre), et une **carte régionale du Nord** pour la tournée.
  Il sert à ENT-9.2 et 9.4, puis à France Boissons en 1re (pleins déposés, vides repris : c'est le cas d'origine du lot 4) et aux tournées
  de messagerie (Geodis, CAP-C3.5).
- **Lot B — les piles de palettes vides** : « Contrôle qualitatif et quantitatif des retours ». Le quai iso sait recevoir des cartons et des
  fûts, mais pas des **piles de palettes vides**. Le lot B ajoute `forme: 'pile'`, sur le modèle exact de `forme: 'fut'` (D-4).
  Il sert à ENT-9.2 et 9.4, puis aux retours de palettes vides des magasins (Action, CAP-C3.7) et à l'idée n° 3 de la réserve sécurité
  (palettes à écarter à la réception).
- **Tout est déclaratif** : une séance qui ne déclare rien ne change pas. Boost (ENT-3.1 à 3.4), ENT-6.9, Spartoo, Picard, Smoby, France
  Boissons et Action restent **octet pour octet** (tests existants verts **sans modification**).

## 2. LOT A — La tournée de ramasse

### 2.1 État des lieux d'abord (lecture seule, à dire à Tristan)
- `core/types/tournee.js` après D-9 (lots 1 à 3) : `mesures`, jauges, `bilanDe`, `quai` (« laisser à quai »), `calibrer.mjs`.
- La **carte** : `outils/carte/construire-region.py` (MOTEUR-carte-regionale, Decathlon) sait-il produire un **réseau routier porteur**
  (profil `porteur` du lot 3) sur une emprise régionale, utilisable par `tournee.js` (qui part aujourd'hui de cartes de ville ou de côte) ?
  Ou faut-il partir de `construire-cote.py` avec une nouvelle emprise ? **Dire ce qui est réutilisé et ce qui est neuf.**
- Le libellé du bouton « laisser à quai » peut-il se déclarer (« Reporter à vendredi ») ?

### 2.2 Ce que la séance déclare (proposition ; les noms exacts sont laissés à Claude Code)

```js
tournee: {
  id: 'chep-ramasse', libelle: 'Tournée de ramasse',
  vehicule: { nom: 'Semi-remorque Transports Lys-Escaut', profil: 'porteur' },
  horaire: { depart: '06:00', vitesse: 55, service: (arret) => 20 + arret.vides * 0.05 },   // min ; construit
  depot: 'templemars',                        // départ ET retour (point du plan)
  arrets: [{ id: 'douai', nom: 'Halles d\'Artois', ville: 'Douai', vides: 140, signale: 'lun. 18/01, 9 h 10',
             creneau: { apres: 6*60, avant: 10*60, libelle: 'enlèvement des vides de 6 h à 10 h' } }, …],
  mesures: [{ id: 'vides', libelle: 'Palettes vides à bord', unite: 'palettes', max: 390,
              depart: 0, reprend: 'vides' }],                 // départ à vide, on ne dépose rien
  quai: { libelle: 'Reporter à la tournée de vendredi' },     // un arrêt peut être laissé (1 au plus, ou libre)
  jaugesRepere: …, sansVerdict: …,                            // comme aujourd'hui (guidage / entraînement / évaluation)
}
```

1. **`depart: 0` et `reprend` sans `depose`** : la charge part de 0. Après l'arrêt i, elle vaut `charge + vides_i`. Le lot 4 prévu
   (`depart: 'somme'`, `depose`, `reprend`) est construit **dans la même écriture** : les deux cas sont le même calcul, et France Boissons
   en 1re prendra l'autre.
2. **Le pic compte** (ici, c'est la charge au dernier arrêt) : `bilan.pics.vides`, `bilan.depassements` si un point du parcours dépasse `max`.
3. **Jauge** « Palettes vides à bord » : profil en marches le long de la tournée (guidage), repère seul (entraînement), muette
   (évaluation). Elle dit **que** le camion est plein ou dépasse (« le camion ne peut pas tout prendre »), **jamais de combien** (règle du
   02/10).
4. **Arrêt reporté** (`quai`) : il ne compte ni dans la charge ni dans les km ; `bilan.reportes` = ses ids ; le libellé est déclaré.
5. **Dépôt aller et retour** : le km et le temps du retour au dépôt comptent (`tourneeKmRetour` du lot 2 existe).
6. **Feuille** (`grille.js`) : cellules `{ arret: i, champ: 'vides' }` et `{ arret: i, champ: 'charge' }` (charge après l'arrêt i), pour
   une séance qui fait recopier la charge. Si c'est déjà possible par `champ`, le dire.
7. `calibrer.mjs` : même formule que la vue (un seul calcul).
8. **Gestes publiés** (pour les questions au fil et les messages déclenchés) : la table des gestes de `FICHE-SEANCE.md` n'en cite aucun pour
   la tournée. Si elle n'en publie pas, ajouter `tournee:<id>:envoyer` (l'envoi, juste ou faux) et `tournee:<id>:reporter` (un arrêt
   reporté), et les inscrire dans la table.
9. **Ouverture conditionnelle** : une tournée qui ne paraît au menu qu'après l'envoi d'une fiche (`quand(db)`, comme une fiche ou une
   animation). Si `fermetures` suffit, le dire.

### 2.3 La carte de la ramasse (contenu de séance, construit par le générateur)
- **Emprise** : la métropole lilloise et le bassin minier jusqu'à Valenciennes, ≈ **50,75° N → 50,30° N, 2,85° E → 3,60° E**
  (≈ 55 × 50 km). À ajuster pour que les six points tiennent, avec une marge.
- **Points** (adresses à géocoder dans la Base adresse nationale ou OSM, zones d'activité réelles, **bâtiments non nommés**) :
  **CHEP Templemars** (dépôt, ZA de Templemars : adresse réelle à relever, le site est réel) ; plates-formes fictives placées dans des
  **zones d'activité réelles** : Lesquin (Frais du Nord), Douai (Halles d'Artois), Prouvy (Hainaut Primeurs), Roubaix (MarchéLys),
  Dourges (Distri Escaut). **Aucun nom d'entreprise réelle sur la carte.**
- **Fond** : autoroutes (A1, A21, A22, A23, A25, A27), grandes routes, villes repères (Lille, Roubaix, Lens, Douai, Valenciennes,
  Seclin), frontière belge en trait clair. Mention **« © contributeurs OpenStreetMap »**. Aucune requête hors du domaine. Le dessin
  passe en noir et blanc : autoroutes et routes se distinguent **par l'épaisseur**.
- **Couleurs** (charte des cartes de transport) : vert = l'ordre de la tournée ; bleu = les clients (distributeurs) et leur emplacement ;
  le dépôt CHEP en encre (pas le bleu de la marque, qui dirait « client »).
- Module généré `contenus/chep-carte.js`, JSON source `outils/carte/chep.json` (points, fourchettes de distances contrôlées au build),
  sorties brutes dans `outils/carte/sources/…` (**ignoré par git**).

### 2.4 Page d'essai et tests (lot A)
- Page `outils/essai-tournee-ramasse.html` : la tournée de la §6.3 d'ENT-9.2 (quatre sites, un de trop). Cas à cliquer : tout prendre → la
  jauge dit « le camion ne peut pas tout prendre » ; reporter le site qui a signalé le plus tard → ça tient ; mauvais ordre → un quai fermé.
- Bloc `tournee` (ou un bloc `ramasse` neuf) : départ 0 et reprise ; pic = dernier arrêt ; dépassement détecté sans dire de combien
  (sabotage : une jauge qui donne l'écart → le test tombe) ; arrêt reporté hors charge et hors km ; cas `depart: 'somme'` + `depose` +
  `reprend` (le lot 4 d'origine : un gros retour placé tôt dépasse, placé tard il tient) ; `calibrer.mjs` d'accord avec la vue.
- **Non-régression** : blocs `boost`, `carte`, `carte-region`, `fb-6.9` verts sans modification ; modules de Nîmes, de la côte et de
  Decathlon identiques.
- **Capture envoyée à Tristan** (clair, sombre, noir et blanc) **avant le lot B**.

## 3. LOT B — `forme: 'pile'` : une pile de palettes vides sur le quai iso

### 3.1 Le modèle : `forme: 'fut'` (FICHE-SEANCE, « Palette de fûts »)
Même logique : la séance **déclare ce qui est sur la pile**, le moteur **calcule** les comptes, dessine, et l'élève compte et décide à
l'étape ③. Le quai reste sans froid (`froid: false`), en iso (`rendu: 'iso'`), un seul camion, cariste au chariot frontal
(`dechargement.par: 'cariste'` : les piles de vides se déplacent aux fourches).

```js
{ id: 'P3', forme: 'pile', ref: 'CHEP-1210', nom: 'Palettes CHEP 1 200 × 1 000 vides', bl: 15,
  hauteur: 14,                         // palettes réellement sur la pile (bl − manquantes) ; défaut = bl
  intrus: { 6: 'lpr', 11: 'epal' },    // n° de la palette (1 = en bas) → pool étranger : 'lpr' | 'logipal' | 'epal'
  abimee: { 9: 'S' },                  // n° → face où se voit le dégât (planche cassée ou bloc arraché) : N, S, E, W
  attendu: 'reserves', motifAttendu: 'manquant', motif2Attendu: 'produit',
  etiq: { ref: 'BC-27-…', nom: 'BON DE COLLECTE — PILE 3', poids: '15 palettes annoncées' } }
```

- **Calculés, jamais déclarés** (comme le total des fûts) : `manquantes = bl − hauteur`, `intrus = nombre de clés d'intrus`,
  `abimees = nombre de clés d'abimee`, **`chep = hauteur − intrus`** (abîmées comprises), **`aCrediter = chep`**, `aReparer = abimees`.
  Exporter une fonction pure **`comptePile(palette)`** → `{ bl, hauteur, manquantes, intrus, parPool: { lpr, logipal, epal }, abimees,
  chep, aCrediter, aReparer }` : les séances l'utilisent pour leurs jalons et leurs fiches (règle 5 de la coordination §4).
- **Refusé au chargement** (`verifierQuai`) : un n° hors 1…hauteur, non entier ou en double ; une palette **à la fois intruse et abîmée** (une
  seule histoire par palette) ; un pool inconnu ; une face inconnue ; `hauteur > bl` ; une pile de plus de **18** palettes (le dessin ne
  serait plus lisible) ; `refs`, `etiqAvant`, `W`, `D`, `L` ; un quai sans `unite`.

### 3.2 Le dessin (kit iso, `core/iso.js`)
- **Une palette vide** : plateau à planches, **9 blocs** visibles en façade (palette à blocs, comme une CHEP), épaisseur ≈ 0,15 m. Une pile =
  les palettes empilées **sans écart**, avec leurs bords visibles (on doit pouvoir les compter de près).
- **Pools, par la couleur ET par le marquage** (lisible en noir et blanc, règle de la coordination §6) :
  - CHEP : bleu soutenu, « CHEP » au pochoir sur les blocs de façade ;
  - LPR : rouge, « LPR » sur les blocs ;
  - Logipal : brique (brun-rouge), « LOGIPAL » ;
  - EPAL : bois brut clair, marquage « EPAL » / « EUR » au feu sur les blocs.
  **Le vert n'est jamais utilisé.** Le rouge des palettes LPR est un **objet du décor** (comme la cale rouge du quai iso) et ne dit pas
  « faux ». Le noter dans `docs/decisions.md`.
- **Une palette abîmée** : une planche de façade cassée (une cassure en V, une planche décalée) ou un bloc arraché, **visible seulement de
  sa face et de la face voisine** (règle des fûts : deux rotations consécutives sur quatre). De loin, on ne la voit pas.
- **Manquantes** : la pile est simplement **moins haute** (rien n'est dessiné à la place). Sans compter, on ne le voit pas d'un coup d'œil
  (14 au lieu de 15).
- **Étape ③** : la pile en grand, quatre vues (« ⟲ Tourner / Tourner ⟳ »). **Chaque palette est cliquable** et le zoom dit « Palette 9 / 14 »
  (le dénominateur = la hauteur réelle, qu'on lit en cliquant la dernière). **Aucun texte ne nomme un pool ni un dégât** : l'élève le voit sur
  le dessin (et le marquage des blocs, lisible au zoom). Pas de `title`, pas de `data-*` qui donnerait la réponse (règle du quai iso).
- **Étapes ② et ④** : piles à l'échelle du décor.

### 3.3 Unité au féminin, motifs et réserves
- **Unité féminine** : `unite: { un: 'palette', des: 'palettes', feminin: true }`. Aujourd'hui le moteur accorde au masculin
  (« endommagés », « manquants ») sans le vérifier : avec `feminin`, **« abîmées »**, **« manquantes »** partout où l'unité entre (champs
  chiffrés, réserves, journal, aides, aria-labels). Sans `feminin`, rien ne change (tests des quais existants).
- **Motifs d'une pile** : `motifs: ['manquant', 'avarie', 'produit']` avec `libelles` :
  `avarie: { nom: 'Palettes abîmées', precision: 'à réparer' }`, `produit: { nom: 'Palettes d\'un autre pool' }` ; `deuxMotifs: true`
  (une pile peut avoir deux histoires).
- **Champ chiffré pour `produit`** quand la forme est `pile` : « Nombre de palettes d'un autre pool » (aujourd'hui seuls `avarie` et
  `manquant` sont chiffrés). La réserve s'écrit par exemple : « P3 : acceptée sous réserve — 1 palette manquante ; 2 palettes d'un autre
  pool. »
- **Décision juste** (calculée) : aucune histoire → « accepter » ; au moins une → « accepter sous réserve » avec les bons motifs et les bons
  nombres (les quantités justes se calculent par `comptePile`). **« Refuser » n'existe pas pour une pile** : on ne refuse pas des palettes
  vides qui appartiennent au pool. La déclaration le dit par `decisions: ['accepter', 'reserves']`, sinon refusée. Si la vue ne sait pas
  retirer « Refuser », l'ajouter.
- **Le document** : le quai parle d'un « bon de collecte », pas d'un « bon de livraison » (`document: { nom: 'bon de collecte', court: 'BC' }`,
  option du lot 1 du chantier « quai en deux séances », à vérifier).

### 3.4 Page d'essai et tests (lot B)
- Page `outils/essai-quai-inspection.html#piles` : un camion de **cinq piles** (une juste, une à 14, une avec une LPR, une avec deux abîmées
  dont une sur la face arrière, une avec une EPAL et une manquante), jouable de bout en bout.
- Bloc `quai-iso` : `comptePile` écrit à la main sur trois piles ; refus au chargement (n° en double, palette intruse et abîmée,
  `hauteur > bl`, 19 palettes, unité absente, « refuser » proposé) ; dégât visible de deux vues seulement (sabotage : visible de face → le test
  tombe) ; **aucun texte qui nomme le pool ou le dégât** dans le dessin (sabotage : un `title` → le test tombe) ; accords féminins
  (« 1 palette manquante », « 2 palettes abîmées ») ; réserve chiffrée « d'un autre pool » ; décision attendue calculée.
- **Non-régression** : tous les quais existants (cartons, fûts, Spartoo octet pour octet), ENT-6.4, ENT-8.7 à 8.10 verts sans modification.
- **Captures envoyées à Tristan** : une pile de près sous les quatre angles (clair, sombre, noir et blanc).

## 4. Ce que ce chantier n'écrit pas
- Aucune séance (ENT-9.2 et 9.4 ont leurs briefs) : le contenu de la tournée et des piles s'y déclare.
- Pas de « ligne de tri » automatisée (la vraie ligne de Templemars) : idée pour plus tard, si Tristan la veut.

## 5. Questions ouvertes (valeur par défaut de Cowork entre parenthèses)
1. [ ] Lot A : la vitesse moyenne du semi sur la carte (55 km/h, routes et autoroutes confondues, construit).
2. [ ] Lot B : la pile au-delà de 15 (refus à 18 : assez ?) (oui).
3. [ ] Lot B : faut-il une aide « détail du comptage » pour une pile en guidage (« compte les palettes une à une, en cliquant ») ? (oui, dans
   `aides.consignes`, propre aux piles).

---

## Compte rendu — lot A *(Claude Code, 18/10/2026 : session Fable, deux agents Sonnet — état des lieux, carte)*

- **Fichiers créés** : `outils/carte/construire-ramasse.py` (générateur hybride : emprise régionale de Decathlon, format de la carte de la
  côte, toutes les paires d’arrêts au profil porteur), `outils/carte/extraire-chep.mjs` (extraction Overpass propre, écrit
  `outils/carte/sources/chep/`, hors git), `outils/carte/chep.json` (points, zones de zoom, fourchettes par paire, calage de la journée
  d’essai), `contenus/chep-carte.js` (336 Ko, reproductible octet pour octet), `outils/essai-tournee-ramasse.html`, `outils/test/ramasse.mjs`.
  **Modifiés** : `core/types/tournee.js` (profil, quai, gestes, `quand`, `service.unite`, `termine.toast`), `core/types/entreprise.js` (gestes
  de la tournée connus, `api.signal`, `tourOuvert()`), `core/types/carte.js` (couche `frontiere`, `unite: 'zone'`), `styles/base.css` (profil
  en marches), `styles/carte.css` (frontière), `outils/carte/calibrer.mjs` (profil de charge, mode `ramasse`), **`outils/test.mjs`** (bloc
  `ramasse` dans `BLOCS` et au groupe 2 de `GROUPES`), `activites/FICHE-SEANCE.md` (ligne `tournee`, table des gestes).
- **État des lieux (§2.1, vérifié dans le code)** : `construire-region.py` ne produisait pas le format que lit la tournée (`trajets`, `clients`,
  `depart`…) et `construire-cote.py` avait l’emprise de la côte en dur : d’où le générateur neuf. Les routes secondaires n’étaient extraites
  qu’autour de Valenciennes et de Dourges : extraction propre (≈ 10 min, serveur Overpass souvent en 502, relances automatiques). Le libellé du
  bouton se déclare (`quai.libelle`). Les cellules `{ arret, champ }` du §2.2.6 n’ont rien demandé à `grille.js` : la feuille d’une séance lit
  `bilan.charges[id]`, `bilan.profils[id]` et `bilan.troncons` dans `grille.lignes(bilan)`, rang par rang, comme ENT-6.9.
- **Ce que la séance déclare (noms définitifs)** : `mesures: [{ id, libelle, unite, max, depart: 0 | 'somme', depose, reprend, libelleDepasse }]`
  (le pic tient lieu de cumul ; `bilan.profils`, `pics`, `charges`), `quai: { libelle, titre, reprendre, vide, max }` (`bilan.reportes`,
  `reportesTrop`), `id` (gestes), `quand(db)` (hors du menu tant que faux, l’enseignant la voit), `horaire.service: { base, parColis, champ, unite }`,
  `termine.toast` ; gestes `tournee:<id>:envoyer` et `tournee:<id>:reporter`. Détail en tête de `core/types/tournee.js` et dans FICHE-SEANCE.
- **Écarts par rapport au brief** (et pourquoi) : (a) `tournee:<id>:envoyer` part au report validé (juste ou faux, pas refusé) **ou** à
  « J’ai terminé » confirmé (c’est le bouton « Envoyer la tournée à Yannick » d’ENT-9.2 : `termine`, avec `toast`) : pas d’écran d’envoi nouveau ;
  (b) la jauge **parlante** montre les marches avec leurs valeurs (au survol, et le pic en tête) : c’est le guidage ; **muette**, rien de plus que
  le repère d’aujourd’hui ; la pastille et le refus du report ne disent **jamais de combien** (`libelleDepasse`), même parlants ; (c) `quai.max`
  refuse au report et à « J’ai terminé », pas au clic (l’élève essaie, l’écran le lui dit) ; (d) les km sont mesurés **sur la sphère** (comme
  Decathlon), pas sur le plan ; (e) les villes repères ne s’affichent qu’au zoom (CSS existant des repères) ; (f) le thème sombre ne change rien :
  CHEP est en `papier: true`, qui impose le clair — pas de capture sombre à juger ; (g) le quai n’est jamais borné au clic avec `departAQuai`
  (tout part à quai) : la borne ne se lit qu’au report.
- **La carte** (agent Sonnet, 18/10/2026) : dépôt **CHEP, route de Vendeville, Templemars** (centre vérifié, ouvert en 1984 ; **numéro de rue non
  trouvé**, point de la rue à la BAN) ; plates-formes fictives sur des rues réelles de zones d’activité (Lesquin rue Henri Ghesquière, Mélantois ;
  Douai rue Gustave Eiffel, Dorignies ; Prouvy avenue Marc Lefrancq ; Roubaix rue de Carihem — **zone à confirmer** ; Dourges rue du Delta,
  Delta 3), BAN relevée le 18/10/2026. Distances dépôt → Lesquin 10,0 · Douai 26,6 · Prouvy 48,1 · Roubaix 19,5 · Dourges 19,0 km (aller ;
  retour à 1-2 km près) ; fourchettes ±15 % par paire dans `chep.json`, contrôlées au build. Trois zones de zoom (Métropole lilloise, Douaisis
  et Lens, Valenciennois), cadre 11 × 11 cases de 5 km, frontière belge, canaux, rail, mention OSM + BAN, aucune URL dans le module.
  **« Distri Escaut » (vraie société) est encore le nom du point 5** : à renommer dans `chep.json`, puis rebâtir, avant ENT-9.2.
- **Calage de la journée d’essai** (`node outils/carte/calibrer.mjs contenus/chep-carte.js outils/carte/chep.json`, valeurs médianes du §6.3
  d’ENT-9.2) : tout prendre → 425 pour 390 ; sans Dourges → 355 ; 2 ordres sur 6 tiennent les créneaux ; meilleur Douai → Prouvy → Roubaix,
  131,4 km, retour 13 h 45, **244 min d’attente**. **À dire à Cowork avant ENT-9.2** : MarchéLys n’ouvre qu’à 13 h, le camion attend plus de
  3 h à Roubaix, et l’ordre le plus court tient tout (les horaires ne forcent rien sur ce jeu) : horaires du §6.3 à recaler.
- **Tests** : bloc `ramasse`, **13 cas** (profils écrits à la main : 0 → 140 → 260 → 355 → 425, sans D 355, sans A 285 ; lot 4 : 14 → 16 → 12 → 10
  et 14 → 10 → 8 → 10 ; écran : marches, pic, pastille, jamais de combien ; report, geste `reporter`, borne du quai, geste `envoyer` après un
  report jugé seulement ; jauge muette ; `quand` ; gestes connus, inconnus, absents sans quai ; carte : 42 trajets, boucle, frontière, repères,
  ordres de grandeur ; calage = vue sur km, arrivées, retour, profil). Sabotages éprouvés : pic = dernière valeur → le cas lot 4 tombe ;
  pastille « de combien » → le cas écran tombe. Non-régression : `transport`, `boost`, `carte`, `carte-region`, `fb-6.9`, `chep-91` : 240/240
  sans modification ; `geo.py` et `extraire-region.mjs` non touchés (modules de Nîmes, de la côte et de Decathlon intacts) ; suite entière :
  voir « Commits ».
- **Commits** : voir `git log` du 18/10/2026 (EN-COURS, lot A, compte rendu).
- **Reste ouvert** : le **lot B** (§3) n’est pas commencé ; validation à l’écran par Tristan (`outils/essai-tournee-ramasse.html`, captures
  envoyées) ; renommer Distri Escaut ; horaires d’ENT-9.2 §6.3 à recaler ; sur un autre poste, `node outils/carte/extraire-chep.mjs` avant de
  rebâtir la carte ; en vue d’ensemble, le nom « CHEP Templemars » touche presque le rond 1 (Lesquin, à 10 km) ; question §5.1 : vitesse 55 km/h
  gardée (à juger sur le calage).

## Compte rendu — lot B *(à remplir à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
