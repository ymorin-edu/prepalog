# Brief de chantier — MOTEUR : la vue « quai de réception » (pilote : Picard ENT-4.1)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-picard.md, docs/EN-COURS.md, puis le brief docs/briefs/MOTEUR-vue-quai.md et ouvre la maquette docs/briefs/picard/maquette-quai-picard.html. Annonce la durée avant de commencer, découpe en lots, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 03/10/2026
**Conversation d'origine** : Cowork (Opus), « maquette du quai Picard » ; fiches projet `claude/prepalog-picard-cadrage.md`, `claude/prepalog-picard-4-seances.md`
**Modèle** : **Opus** (vue nouvelle du moteur).
**Durée estimée par Cowork** : 9 à 11 h en tout (vue + ENT-4.1 + tests), à découper en lots livrables.

## 1. Pourquoi une vue nouvelle

Règle du 03/10/2026 (`docs/decisions.md`) : *si une compétence peut être abordée sous un nouvel angle grâce à de
nouvelles vues, on prend le temps de les insérer dans le moteur.* La réception avec aléas (C1.4) ne tient dans aucune
vue existante : il faut **voir** le camion, **compter** une palette en 3D, **sonder**, **lire une étiquette**, et le
faire **sous contrainte de temps hors froid**. La vue servira **4 séances Picard** (ENT-4.1 à 4.4, tranché par Tristan)
et pourra resservir à toute réception (autre entreprise, quai non réfrigéré, produits frais).

## 2. La référence : la maquette v8

`docs/briefs/picard/maquette-quai-picard.html` (ouvrir depuis son dossier : elle charge `photos/`). **Elle fait foi
pour l'interaction** ; elle a été jouée par Tristan et vérifiée par navigateur automatique (maquette **v8** ; parcours juste 18 jalons, 20/20 en évaluation). Son code est jetable (un seul fichier, état global) : **reprendre le comportement,
pas le code tel quel**. Les paramètres sont regroupés en tête de son script : `QUAI`, `SEUIL`, `DECHARGEMENT`,
`COUTS`, `PALETTES`.

## 3. Ce que fait la vue (4 écrans, un par étape)

Bandeau d'étapes ① Le camion arrive · ② Déchargement · ③ Contrôle des palettes · ④ Réserves et chambre froide
(②③④ inaccessibles tant que le camion n'est pas déchargé). Deux horloges en haut : **temps du quai** (simulé, chaque
geste coûte des minutes) et **temps hors froid du lot** (jauge vers un repère) ; en évaluation, une troisième : le
**chrono réel**.

1. **Le camion arrive** : photo en bandeau + légende horodatée ; le chauffeur (**silhouette sans visage**) tend le BL
   et le **ticket imprimé de l'enregistreur** ; « Lire le ticket » (coûte du temps du quai, **pas** de temps hors froid :
   portes fermées) + QCM sur ce que montre le ticket ; bouton « Oui, vous pouvez ouvrir et décharger » qui affiche la
   **durée de déchargement** (formule `ouverture + n × parPalette`).
2. **Déchargement animé** (SVG posé sur la photo, coordonnées de la photo) : la porte sectionnelle se lève, intérieur de
   remorque dessiné, brume froide qui coule au sol, le chauffeur sort les palettes une à une au transpalette en
   perspective et les pose de part et d'autre de l'allée. **Le temps hors froid démarre à l'ouverture.** Afficheur mural
   de la température du quai ; **horloge murale** (heure du quai en guidage, temps restant en évaluation, rouge sous 1 min).
   Boutons Passer / Revoir (sans coût) / Contrôler les palettes. `prefers-reduced-motion` → fin directe.
   ⚠ La maquette n'a que **5 emplacements** au sol : **à généraliser** (n palettes, 4.2 en aura 8 sur deux camions).
3. **Contrôle** : un onglet par palette (état « sondée, comptée, décidée »), « Revoir le BL » ; palette en **projection
   isométrique** (cartons kraft W × D × L, couche du dessus incomplète, cartons absents, cartons écrasés visibles d'un
   seul côté) ; **Faire le tour** (4 vues) ; **Sonder à cœur** ; **étiquette cliquable** sur la face → zoom lisible
   (réf., désignation, contenu, lot, DDM, code-barres) ; comptage (guidage : détail par couche + total ; sinon total
   seul) ; décision (Accepter / Accepter avec réserves / Refuser) + motif. Repère « P1… » sur le carton le plus haut à
   gauche en vue de face, qui suit le carton quand on tourne (guidage seulement). Règle des couches écrite en guidage seulement.
4. **Chambre froide, réserves, signature** : « Rentrer le lot accepté » (coût, puis **le temps hors froid s'arrête**),
   scène dessinée (chambre froide à −23 °C, rideau à lanières ; refusées laissées au quai) ; **réserves** : pour chaque
   palette refusée ou sous réserve, la **donnée qui rend la réserve précise** selon le motif choisi (température relevée,
   référence lue, nombre de cartons écrasés / manquants) ; lignes écrites « à la main » sur l'exemplaire du BL ; case
   piège **« Sous réserve de déballage »** ; **Faire signer le chauffeur** ; « Clore la réception » (lot rentré + signé).

Comportements **en guidage seulement** : le **chef de quai** arrête l'élève qui écrit ses réserves avant d'avoir rentré
le lot (« le froid d'abord, les papiers ensuite » ; deux boutons, il peut passer outre) ; le chef explique que « sous
réserve de déballage » ne protège de rien ; le chauffeur refuse de signer une réserve vide ; aides écrites ; repère P1.
**Ordre froid/papiers : jamais sanctionné en points** (décision de Tristan), seulement enseigné.

## 4. API de contenu (validée d'avance par Tristan le 03/10/2026 : l'adapter seulement si le code l'impose, et le noter au compte rendu)

Sur le modèle de `inventaire` / `tournee` : la vue n'existe que si la séance déclare `quai`, son état vit dans la base
de l'élève sous `db.quais[<id>]` (**cloisonné par séance**).

```js
quai: {
  id: 'picard-ent41',                       // clé de l'état dans db.quais
  lieu: { nom: 'Quai 32', temp: 4, refrigere: true, chambre: { nom: 'Chambre froide n° 2', temp: -23 } },
  seuilHorsFroid: 30,                       // min, repère (construit)
  dechargement: { ouverture: 0.5, parPalette: 1 },   // min (construit) — partagé avec la planification de quai
  couts: { ticket: 2, sonder: 1, tourner: 0.5, etiquette: 0.5, compter: 1, rentrer: 3, ligne: 1, signer: 1 },
  aides: { regleCouches: true, detailComptage: true, repere: true, chefDeQuai: true },  // guidage
  photos: { arrivee: './contenus/picard/quai-remorques.jpg', quai: './contenus/picard/quai-interieur.jpg',
            porte: { x0: 455, x1: 786, y0: 352, y1: 585 } },    // coordonnées dans la photo 1280 × 853
  camions: [{
    transporteur: 'Transports Givrex', fournisseur: 'Surgelés du Littoral', bl: 'SL-26-1184', arrivee: '06:00',
    ticket: { consigne: -20, releves: [[ '00:15', -21.1 ], …] },   // ou une fonction qui les génère
    qcmTicket: { attendu: 'long', choix: [...] },
    palettes: [ { id: 'P1', ref, nom, bl: 57, etiq: { ref, nom, poids, lot, ddm }, W: 4, D: 3, L: 5,
                  manque: ['0,0,4', …], avarie: { '1,0,2': [0,-1] }, temp: -21.5,
                  attendu: 'accepter', motifAttendu: 'aucun' }, … ],
  }],
}
```

- `camions` est une **liste** dès maintenant, même si ENT-4.1 n'en a qu'un : ENT-4.2 en aura deux (§7).
- Les valeurs attendues (cartons réels, quantités des réserves) sont **calculées** depuis la palette (`W×D×L − manque`,
  `bl − réel`, nombre d'avaries), jamais recopiées ; dans les tests, écrites à la main.
- Rien de « Picard » dans `core/` : nom du lieu, photos, couleurs viennent du contenu et du `THEME` de l'entreprise.

## 5. Jalons (lus dans `db.quais[id]` par les `etapes` de la séance)

Liste de la maquette (fonction `jalons()`), **18** pour ENT-4.1 (guidage comme évaluation) :
ticket (remontée qui a duré) · par palette : comptage = réel · par palette : décision + motif justes **et palette
sondée** · par réserve attendue : ligne écrite juste · mention de déballage **non ajoutée, réserves écrites** · signature ·
lot rentré. En évaluation, la rapidité s'ajoute hors jalons (§6).
Les lignes « détail du comptage » de guidage s'affichent au bilan mais **ne comptent pas**.
Pièges (`CLAUDE.md`) : aucun jalon ne doit être vrai par inaction (d'où « réserves écrites » et « lot rentré » dans les
conditions) ; un chiffre caché ne doit pas être déductible ailleurs (la jauge dit *que* le repère est dépassé, en
évaluation pas de verdict).

## 6. Évaluation : copie rendue + chrono qui MESURE (décision de Tristan, 03/10/2026, révisée)

- Réutiliser la **copie rendue** existante **telle quelle** (`meta.copie`, `copie: meta.copie`, `noter`, « Rendre ma
  copie », ramasser / rouvrir) : pas de verdict à l'écran, verrou après la remise. **Aucun changement à la copie
  rendue** : la première idée (« à 00:00 la copie part mais l'élève peut finir ») est **abandonnée**.
- **Le chrono réel ne coupe plus rien : il mesure** le temps passé (affiché « Temps passé » en haut et sur l'horloge
  murale du quai). L'élève finit toujours sa réception et rend sa copie ; en fin d'heure l'enseignant ramasse celles qui
  restent (existe déjà).
- **Note d'évaluation sur 20** = **15 points de réception** (jalons réussis / jalons × 15) + **5 points de rapidité** :
  - **3 points sur le temps hors froid** (simulé) : ≤ 20 min → 3, ≤ 25 → 2, ≤ 30 → 1, au-delà → 0 ;
  - **2 points sur le temps réel** : ≤ 12 min → 2, ≤ 16 → 1, au-delà → 0 ; **seuils × 4/3 en tiers-temps**
    (`ctx.tiersTemps`, brief `MOTEUR-tiers-temps.md`) ;
  - **seulement si la réception est complète** (toutes les palettes décidées, lot rentré, BL signé), **et en
    proportion des palettes justes** (décision + motif justes, palette sondée) : pas de prime au « vite et faux ».
  - Le jalon « hors froid ≤ repère » disparaît (remplacé par les 3 points).
- Seuils et poids sont des **réglages du contenu** (maquette : objet `NOTE`), pas du moteur. **Les seuils du temps réel
  (12 / 16 min) sont provisoires** : ils seront calés sur les temps mesurés en classe pendant ENT-4.1.
- `noter(db)` doit donc lire, en plus des jalons, `froid` et le **temps réel passé** rangés dans `db.quais[id]` (le
  chrono s'enregistre dans la base, il survit à un rechargement ; il ne tourne que quand la vue quai est affichée,
  à décider), et `tiersTemps`. Le **ramassage** utilise le même `noter` : le temps réel retenu est celui enregistré.
- Le détail de la note (réception, hors froid, réel, rapidité retenue) va dans `detail`, lisible par l'enseignant.
- Maquette v8 : tableau « Côté enseignant » du bilan d'évaluation = la forme attendue de ce détail.

## 7. Ce que les séances suivantes demanderont (ne pas construire maintenant, ne pas fermer la porte)

- **ENT-4.2** : deux camions sur un quai, l'élève choisit lequel décharger d'abord (l'autre attend porte fermée, au
  froid) ; palette **multi-références** (deux lignes du BL sur une palette) ; étiquette illisible (lire une autre face) ;
  n palettes à l'étape 2.
- **ENT-4.3** : quai **« déjà réceptionné »** (palettes en chambre froide, BL déjà signé par un collègue, sa fiche de
  comptage) ; re-sonder en chambre froide ; **bloquer** une palette ; protestation au transporteur et compte rendu au
  chef de quai par la **messagerie existante** (`apresMail`).
- **ENT-4.4** : évaluation sur données neuves (6 palettes, aléas combinés : une palette avec deux problèmes).

## 8. Fichiers attendus (indicatif)

- `core/types/quai.js` (vue, contrat `nav` / `html` / `brancher` / `etatNeuf` comme `inventaire.js`) ; câblage minimal
  dans `core/types/entreprise.js` (`const VQUAI = U.quai ? creerQuai(U.quai) : null`, item de menu, vue) ;
  styles dans `styles/base.css` (**trois blocs de variables ensemble**) ou un fichier `styles/quai.css`.
- Photos et logo copiés de `docs/briefs/picard/` vers `contenus/picard/` (+ ligne de licence Pexels), logo vers
  `contenus/trames/logos/` pour la table `ENTREPRISES`.
- Bloc de tests `outils/test/picard.mjs` + **une ligne dans `BLOCS`** de `outils/test.mjs` (**le dire à Tristan**, alerte 7).
- Page d'essai `outils/essai-quai.html` (comme `essai-carte.html`) pour que Tristan clique sans passer par une séance.

## 9. Tests attendus (bloc `picard`)

Parcours juste guidage et évaluation (nombre de jalons) ; chaque aléa : sans sonder → décision P3 fausse, sans faire le
tour → avarie P2 invisible, comptage P1 (couche incomplète mais conforme) et P4 (manquant dans le coin du fond),
étiquette P5 ; réserve vide refusée par le chauffeur (guidage) ; chef de quai dans les deux réponses ; case déballage
cochée → jalon faux ; temps hors froid arrêté à l'entrée en chambre froide ; note d'évaluation (valeurs écrites à la
main) : parcours juste en 10 min réelles → 20/20 ; 13 min 20 → 19 ; 13 min 20 en tiers-temps → 20 ; une palette
fausse → rapidité × 4/5 ; BL non signé → 0 point de rapidité ; temps réel enregistré qui survit à un rechargement ; `prefers-reduced-motion` ; état retrouvé après fermeture d'onglet. **Sabotages** : chaque jalon
doit tomber quand on casse sa donnée.

## 10. Critères de validation par Tristan

La page d'essai se joue **comme la maquette v8** (même déroulé, mêmes durées, mêmes textes), dans l'habillage
Prepalog + charte Picard, sur l'ordinateur de classe et au vidéoprojecteur ; n palettes à l'étape 2 ; rien ne part
sur Internet (photos et logo servis par le dépôt).

## 11. Questions ouvertes

- [x] ~~Copie rendue mais l'élève peut finir~~ → **abandonné** : le chrono mesure, il ne coupe pas (§6).
Tranché par Tristan le 03/10/2026 :
- [x] **Plein écran** (séance `immersif: true`, comme la maquette). Pour ENT-4.3, un bouton « Messagerie » ouvre
  l'environnement de l'entreprise et ramène au quai.
- [x] **Le temps réel compte toujours**, quel que soit l'écran, de l'ouverture de la séance à la remise de la copie ;
  il s'arrête seulement quand la séance est fermée et reprend à la réouverture.
- [x] **« Revoir le BL » partout**, évaluation comprise (le réceptionnaire a le BL en main).
- [x] **Mail d'accueil du chef de quai** au début de chaque séance (texte dans chaque brief de séance).
- [x] **API de contenu (§4) validée d'avance** (03/10/2026) : ne pas attendre l'accord de Tristan pour écrire la vue.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
