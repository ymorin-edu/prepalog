# Brief de chantier — MOTEUR : la vue « Planning » (cartes à poser sur une grille créneaux × ressources)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/EN-COURS.md, puis le brief docs/briefs/MOTEUR-vue-planning.md et ouvre la maquette docs/briefs/planning/maquette-planning.html. Annonce la durée avant de commencer, découpe en lots (§9), puis enchaîne sans attendre : les questions du §12 ont toutes une valeur par défaut, applique-la et note au compte rendu ce que tu as choisi.
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 04/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiches projet `claude/prepalog-planning-cadrage.md` (20 décisions, maquette v8),
`claude/prepalog-2de-s1-cadrage.md` (S1 Smoby → Kuehne+Nagel), `claude/prepalog-2de-hors-socle-et-vues.md` (vue n° 1 de la 2de)
**Modèle** : **Opus** (vue nouvelle du moteur).
**Durée estimée par Cowork** : **8 à 12 h** en lots livrables (§9). Ce qui prend le temps : les règles déclarées (§5), les
trois cas à faire tourner dans la page d'essai, et le bloc de tests (inaction, sabotages, solutions écrites à la main).
**Quand** : maintenant — la refonte Cdiscount est livrée (C0 à C9, 04/10), le moteur est libre. **Avant les séances de S1**
(A2 et B1 déclarent cette vue ; S1 se construit avec elle, sans version de repli en tableau).

## 1. Pourquoi une vue nouvelle

La règle du 03/10/2026 (`docs/decisions.md`) autorise une vue nouvelle quand elle ouvre un angle neuf. Planifier — poser des
camions sur des quais, des absences sur des jours, des enlèvements sur des chauffeurs — ne tient dans aucune vue existante :
il faut **déplacer des cartes sur une grille**, voir les conflits, puis **replanifier après un aléa**. Une seule vue sert
les trois spécialités de la 2de (LOG C1.3, OTM C2.2 / C3.2, AGOrA 3.2), puis le bac (C1.3, C3.4) et le CAP. Elle servira au
moins 6 séances de 2de (A2 et B1 de chacun des scénarios S1, S2, S3) et la planification de quai en 1re.

## 2. La référence : la maquette v8

`docs/briefs/planning/maquette-planning.html` (double-clic, aucun fichier annexe). **Elle fait foi pour l'interaction, pas pour
le code** : un seul fichier, état global, trois jeux de règles écrits à la main. Reprendre le comportement, pas le code.
Données en tête du script (`QUAI`, `PERSO`, `CHAUF`), règles dans `analyseQuai`, `analysePerso`, `analyseChauf`.
L'en-tête de la maquette (choix du cas et du temps) n'existe que pour l'essai : c'est la future page d'essai (§8).

Jouée par Tristan de la v1 à la v8, **validée le 04/10/2026** (« ok c'est bon ») ; vérifiée au navigateur automatique en v8
(glisser-déposer, bulle, Déplacer, clavier, parcours juste, inaction 0 / 10, aucune requête externe). Recontrôlée par Cowork
le 04/10 (navigateur sans écran) : 3 cas × 3 temps sans erreur, aucune requête. **Le rendu reste à rejuger en situation, dans
les séances** (Tristan : *« il faudra voir dans les scénarios comment ça rend »*) : tout ce qui est réglage d'affichage doit
venir du contenu, pas être figé dans le moteur.

## 3. Ce que fait la vue

**Une entrée du menu de l'environnement d'entreprise** (comme le quai et l'inventaire), libellé donné par le contenu
(« Planning des quais », « Planning des chauffeurs »…). L'écran a deux colonnes :

- **à gauche**, le panneau consigne : titre, date, liste d'informations (ressources, horaires, règles), et les **aides** :
  toutes en guidage, la seule aide « règles » en entraînement et en évaluation ; au-dessus, en phase 2, le **message de
  l'aléa** (« Message reçu — <de> », bordure ambrée) ;
- **à droite**, de haut en bas : le **bloc de cartes** → le **planning** (grille) → la ou les **grilles en lecture seule** →
  le panneau **« Votre planning »** (problèmes signalés, boutons).

### 3.1 Les cartes

Chaque carte est un objet à planifier (un camion, une demande d'absence, un enlèvement, une pause) avec toutes ses
informations sur plusieurs lignes et un **état** en bas : « À placer » / « Posé : <ressource>, <début>–<fin> » + liens
**Retirer** et, s'il y a une ressource à choisir, **Choisir le … / Changer le …**. Une carte posée reste dans le bloc
(fond transparent) : l'élève garde toutes les informations sous les yeux. Une carte glissée de la grille vers le bloc est
retirée du planning.

### 3.2 La grille

Lignes = ressources ; colonnes = créneaux, **deux échelles** : **quarts d'heure sur une journée** (cas quai 06:00–14:00, cas
chauffeurs 05:00–19:00) ou **jours sur 1 à 4 semaines** (cas personnel, lundi–vendredi, trait épais entre deux semaines).
Une carte posée devient un **bloc** qui couvre sa durée. Deux blocs qui se chevauchent sur une ligne passent sur deux
« couloirs » (le second plus bas et moins haut) : on voit le conflit au lieu d'un bloc caché.

**Geste : glisser-déposer ET clic-clic** (décision 3), même geste aux deux échelles :
- glisser une carte sur une case → posée à cet endroit ; glisser un bloc déjà posé → déplacé, **en gardant l'endroit où on
  l'a saisi** (un bloc pris par son milieu ne saute pas) ;
- cliquer la carte (contour épais), puis cliquer la case ;
- **clavier** : Entrée prend une carte (ou ouvre la bulle d'un bloc), Espace prend un bloc posé, flèches gauche / droite
  = un créneau, haut / bas = ligne voisine, Suppr retire, Échap lâche ou ferme ; flèche bas sur une carte non posée la pose
  sur la première ligne, au début de sa fenêtre. **Le focus est conservé à chaque redessin, au clavier seulement.**
- Un bloc ne sort jamais de la grille (calé au bord).

### 3.3 La bulle : choisir la seconde ressource (décisions 18 et 19)

Quand la carte demande **deux ressources** (camion → quai **et** cariste ; enlèvement → chauffeur **et** camion), la première
est la **ligne** où on la pose ; la seconde se choisit dans une **bulle** qui s'ouvre **juste sous le bloc** dès qu'il est
posé : « Qui charge le camion A ? » / « Quel camion pour E3 ? » + la nature et l'horaire du bloc, **un gros bouton par
ressource (toutes proposées, même celles qui ne conviennent pas)**, et les liens **Déplacer** / **Retirer** / **Fermer**.
- Tant qu'aucune n'est choisie, le bloc et la carte affichent « **cariste ?** » / « **camion ?** » en ambre.
- Un clic sur le bloc (ou sur « Choisir le … » dans la carte) rouvre la bulle ; Entrée au clavier aussi ; Échap la ferme et
  rend le focus au bloc.
- **Déplacer** prend le bloc ; le clic suivant sur une case le pose. Déplacer un bloc garde sa seconde ressource ;
  **le retirer la lui retire**.
- La bulle ne doit jamais être coupée : la grille se donne de la place en bas quand elle est ouverte, la bulle reste dans
  la zone visible (calée à gauche si le bloc est en fin de journée).
- ⚠ **Charte** : dans la maquette, le bouton déjà choisi est en **aplat vert**. Interdit (le vert plein ne dit que
  « juste ») : marquer le choix par la forme (bordure épaisse + coche, `aria-pressed`), sans aplat.

Cas personnel : **pas de bulle**. La carte porte sa personne (`qui`) : où qu'on la lâche, elle se pose **sur la ligne de
cette personne**, au jour visé. Une absence **ne passe pas le week-end** : elle est ramenée dans la semaine de son premier
jour. La carte d'un congé posé ailleurs qu'à sa date demandée affiche « **(décalé)** » et garde la date demandée.

### 3.4 Les grilles en lecture seule

Sous le planning, une grille qui **se remplit toute seule** à partir de la seconde ressource : « **Journée des caristes** »
(chaque bloc : camion + quai) ou « **Utilisation des camions** » (chaque bloc : enlèvement + chauffeur). Elle montre les
indisponibilités en hachures (cariste pas encore arrivé ou déjà parti ; camion à l'atelier). Elle sert à voir le double emploi.
Cas personnel : à la place, des **lignes de compteurs** sous la grille : « Présents », « Besoin », « Caristes CACES »
(le compteur fautif passe en texte rouge quand le signalement est en direct). **Présent = tout jour sans absence** ; avant
son arrivée, une personne est « pas là » (hachures).

### 3.5 Le signalement selon le temps pédagogique (décision 4)

| | Guidage | Entraînement | Évaluation |
|---|---|---|---|
| Problèmes listés sous le planning | **en direct**, à chaque geste | sur « **Vérifier mon planning** » (liste effacée au geste suivant) | **jamais** (« Évaluation : le site ne signale rien. Relisez les règles vous-même. ») |
| Blocs fautifs (bordure rouge en tirets, texte rouge, **sans aplat**) | en direct | non | non |
| Bande ambrée de la fenêtre de la carte prise + sa phrase (décision 10) | oui | non | non |
| Toutes les aides du panneau consigne | oui | règles seules | règles seules |
| Détail du calcul de durée sur la carte (« 10 min + 33 × 2 min → 1 h 30 ») | oui | résultat seul | résultat seul |
| Cas chauffeurs : heure de reprise calculée + repos hachuré + « conduite X / 9 h » par ligne | oui | non (« fin de service hier » seulement) | non |
| Envoi avec des problèmes | demande « Il reste des problèmes. **Envoyer quand même** » | envoi direct | envoi direct |

**On dit *que* une règle n'est pas respectée, jamais *de combien*** (`CLAUDE.md`) : « pas assez de monde présent »,
« conduit plus de 4 h 30 sans pause », jamais « il manque 1 personne » ni « dépassé de 20 min ». Un test le vérifie (§10).

### 3.6 Envoi, aléa, deuxième envoi (décision 5)

1. « **Envoyer le planning au chef** » : la version 1 est **figée** dans l'état (`v1`). Juste ou faux, l'aléa arrive.
2. **L'aléa** arrive par la **messagerie existante** (déclencheur, §4.3) et s'affiche aussi en tête du panneau consigne.
   Les données changent (camion en retard, nouvelle carte d'absence et intérimaire en plus, camion à l'atelier) ; **le
   planning de l'élève est conservé tel quel** et ne tient plus. Titre du panneau : « Planning à reprendre ».
3. « **Envoyer le planning corrigé** » (en évaluation : « … **et rendre ma copie** ») : la version 2 est figée (`v2`), la vue
   passe au **bilan**.
4. **Bilan** (guidage et entraînement) : tableau des jalons « 1er envoi » / « Après l'aléa » avec ✓ / ✗, et
   « **Recommencer** » (deux clics, comme le quai). **Évaluation** : « Copie rendue. Le résultat sera donné par votre
   enseignant » ; le détail jalon par jalon va dans `detail`, lu par l'enseignant.
5. Prévenir le chef ou le client après avoir replanifié se fait par la **messagerie existante** (jalon `apresMail` de la
   séance) — pas dans la vue.

Une séance **sans aléa** : un seul envoi, puis bilan.
**Réinitialiser le planning** (décision 14) : confirmation sur la page (« Tout effacer ? Oui, réinitialiser / Non ») ; vide le
planning **en cours**, jamais la version déjà envoyée.

## 4. API de contenu (proposée par Cowork : l'adapter si le code l'impose, et le noter au compte rendu)

Sur le modèle de `quai` et `inventaire` : la vue n'existe que si la séance déclare `planning` dans `creerEntreprise`.
Son état vit dans `db.plannings[<planning.id>]` (**cloisonné par séance** ; nom de la clé à confirmer par Claude Code).
Heures écrites `'HH:MM'` et durées en **minutes** dans le contenu : le moteur les convertit en créneaux (durée **arrondie au
créneau supérieur**). Rien de « Smoby » ni de « K+N » dans `core/`.

### 4.1 Forme générale (cas quai complet)

```js
planning: {
  id: 'smoby-quais',                       // clé de l'état dans db.plannings
  libelle: 'Planning des quais',           // entrée de menu
  titre: "Quais d'expédition — plateforme Smoby, Moirans-en-Montagne",
  date: 'Jeudi 10 décembre',
  infos: (ctx) => [ '3 quais ; le quai 3 n\'a pas de niveleur (porteurs seulement)', … ],  // liste du panneau consigne
  echelle: { type: 'heures', debut: '06:00', fin: '14:00', pas: 15 },
       //  ou { type: 'jours', jours: ['lun 7', …, 'ven 18'], semaine: 5 }
  lignes: { titre: 'Planning des quais', liste: [
    { id: 'Q1', nom: 'Quai 1', semi: true },
    { id: 'Q3', nom: 'Quai 3', semi: false, note: 'sans niveleur : porteurs seulement' } ] },
  affectation: {                           // facultatif : la seconde ressource, choisie dans la bulle
    question: 'Qui charge le camion {carte} ?', manque: 'cariste ?', lien: 'le cariste',
    liste: [ { id: 'lea', nom: 'Léa', caces: true, de: '06:00', a: '13:00' }, … ],
    lecture: { titre: 'Journée des caristes', legende: '…', bloc: (carte, place) => `${carte.id} ${quai}` },
  },
  cartes: {
    titre: 'Camions du jour',
    liste: [ { id: 'A', titre: 'A — Kuehne+Nagel', famille: 'semi', pal: 33, des: '06:00', avant: '08:30',
               details: ['Semi-remorque · 33 palettes'] }, … ],
    duree: (c) => 10 + 2 * c.pal,                  // minutes ; ou `c.duree` sur chaque carte
    detailDuree: (c) => `10 min + ${c.pal} × 2 min`,  // guidage seulement
    // cas personnel : ligne: (c) => c.qui, semaineEntiere: true, demandee: (c) => c.date, impose: (c) => c.impose
    // cas chauffeurs : pauses: { nombre: 4, duree: 45, libelle: 'Pause 45 min' }
  },
  familles: { semi: { teinte: 'a', legende: 'semi-remorque' }, porteur: { teinte: 'b', legende: 'porteur' } },
  regles: [ … ],                           // §5
  jalons: [ … ],                           // §6
  aides: {                                 // guidage ; entraînement / évaluation : { consignes: { regles } }
    consignes: { regles: '…', caristes: '…', attente: '…' },
    fenetre: true, detailDuree: true, reprise: true, compteurConduite: true,
  },
  alea: {                                  // facultatif
    de: 'Rhône Fret (fictif) — exploitation', texte: '…',
    cartes: { D: { des: '09:00' } },       // champs modifiés d'une carte (la carte affiche « (nouvelle heure) »)
    // ajoutCartes: [ { …, nouveau: true } ], ajoutLignes: [ … ], ressources: { s2: { dispo: '12:00' } }
  },
  note: { sur: 20 },                       // évaluation : jalons réussis / jalons × 20 (§7)
}
```

`etapes: etapesPlanning(PLANNING)` (exporté par `core/types/planning.js`, comme `etapesQuai`) : un jalon de la vue = une étape
du suivi. Le libellé du menu, les textes, les couleurs viennent du contenu et du `THEME` de l'entreprise.

### 4.2 Les trois cas de la maquette, en contenu

| | Quai | Personnel | Chauffeurs |
|---|---|---|---|
| Échelle | heures, 06:00–14:00, ¼ h | jours, 2 semaines lun–ven | heures, 05:00–19:00, ¼ h |
| Lignes | 3 quais | 6 salariés (+ Noa à l'aléa) | 4 chauffeurs (permis, fin de service hier) |
| Seconde ressource (bulle) | 3 caristes (horaires, CACES) | — (ligne imposée par la carte) | 3 camions (type ; Semi n° 2 à l'atelier à l'aléa) |
| Lecture seule | Journée des caristes | compteurs Présents / Besoin / Caristes CACES | Utilisation des camions |
| Cartes | 6 camions | 5 demandes (+ arrêt maladie à l'aléa) | 5 enlèvements + 4 cartes Pause |
| Durée | 10 min + 2 min / palette, au ¼ h sup. | nombre de jours | durée de conduite du trajet ; pause 45 min |

Données exactes : en tête du script de la maquette. **Elles iront dans un contenu d'essai** (§8), pas dans `core/` ; les
séances A2 et B1 de S1 écriront les leurs.

### 4.3 L'aléa par les déclencheurs existants

Ajouter une condition **`apresPlanning(id, version = 1)`** à `core/declencheurs.js` (vraie dès que la version 1 est
envoyée) et un champ **`phasePlanning: 2`** au déclencheur, traité dans `declencher()` comme `phaseQuai` / `phaseTournee`
(`core/types/entreprise.js`). La séance écrit :

```js
volet.declencheurs: [{ id: 'alea', quand: apresPlanning('smoby-quais'),
                       semer: (prenom) => ({ mails: [{ from: …, subject: …, text: … }] }), phasePlanning: 2 }]
```

Envoyer son planning est un **geste métier** (comme envoyer un mail), pas un clic de menu : compatible avec la règle « aucun
clic de menu, aucune ouverture d'écran, aucune minuterie ne déclenche ». La condition ne regarde pas si la version 1 est
juste (sinon elle la révélerait). La vue montre le message en tête du panneau consigne et applique `alea` aux données.

## 5. Les règles : déclarées par le contenu, types fournis par le moteur

Le moteur fournit des **types de règles réutilisables** ; chaque séance déclare les siennes. Chaque règle a un `id`, un
`type`, ses paramètres et un `message` (texte ou fonction) — avec un message par défaut qui respecte « *que*, pas *de
combien* ». Une règle renvoie la liste des problèmes (phrase + cartes fautives, sur la ligne et / ou sur la seconde ressource).

| Type | Paramètres | Ce qui est vérifié | Cas |
|---|---|---|---|
| `unAlaFois` | `sur: 'ligne' \| 'affectation'` | deux blocs qui se recouvrent sur la même ressource (une pause compte sur sa ligne) | quai (quai, cariste), chauffeurs (chauffeur, camion), personnel (absences qui se chevauchent) |
| `compatible` | `sur`, `si: (carte) => bool`, `exige: (ressource, carte) => bool` | ressource qui ne convient pas à la carte | semi → quai avec niveleur ; semi → cariste CACES ; semi → permis CE ; camion du type de l'enlèvement |
| `disponible` | `sur`, horaires `de` / `a`, `dispo` (atelier), `arrivee` (jours) | bloc hors des heures ou jours où la ressource est là | cariste, camion à l'atelier, intérimaire pas encore arrivé |
| `fenetre` | — (`des`, `avant` de la carte) | début avant `des` ou fin après `avant` | quai (arrivée / départ), chauffeurs (prêt dès / livré avant) |
| `attenteMax` | `minutes` | début − arrivée > X | quai, critère métier (30 min) |
| `dateImposee` | — (`impose`, `date` de la carte) | absence imposée posée ailleurs qu'à sa date | personnel |
| `effectif` | `besoin: [par colonne]` | présents < besoin | personnel |
| `auMoinsUn` | `filtre: (ressource) => bool`, `libelle` | aucun présent qui vérifie le filtre | personnel (un CACES par jour) |
| `cumulSansPause` | `max` (min) | cumul de durée des blocs d'une ligne > max **sans carte Pause entre deux** | chauffeurs (4 h 30) |
| `plafond` | `max` (min) | somme des durées d'une ligne > max | chauffeurs (9 h) |
| `reposDepuisVeille` | `repos` (min), champ `finHier` de la ligne | premier départ avant fin d'hier + repos | chauffeurs (11 h) |
| `sansNecessite` | — | carte non imposée posée ailleurs que sa date demandée **alors que sa date demandée respectait toutes les autres règles** ; jugé **seulement quand tout est posé** | personnel, critère métier |
| `critere` | `verifier: (etat) => problèmes` | dernier recours, critère métier propre à une séance | — |

« Chaque carte posée et (s'il y a lieu) affectée » n'est pas une règle : c'est la condition `tous` des jalons (§6).
Simplifications assumées du cas chauffeurs (non contestées à la validation, à reconfirmer en situation) : **une pause ne
compte que si une carte Pause est posée** (« la pause se planifie ») ; le trajet compte en entier comme de la conduite ;
pas de critère métier pour l'instant.

## 6. Jalons (lus dans `db.plannings[id]` par `etapesPlanning`)

Le contenu déclare ses jalons, **5 par version** dans les trois cas de la maquette, donc **10** avec l'aléa :

```js
jalons: [
  { id: 'tous',  lib: 'Chaque camion a un quai et un cariste', regles: [] },
  { id: 'quais', lib: 'Quais : un camion à la fois, sur un quai qui lui convient', regles: ['quaiUnique', 'niveleur'] },
  { id: 'caristes', lib: 'Caristes : un camion à la fois, pendant leurs horaires, avec le CACES pour les semi-remorques', regles: [...] },
  { id: 'fenetre', lib: "Chaque chargement commence après l'arrivée du camion et finit avant son départ", regles: ['fenetre'] },
  { id: 'attente', lib: "Critère métier : aucun chauffeur n'attend plus de 30 min", regles: ['attente', 'fenetre'] },
]
```

Un jalon est vrai **si et seulement si** toutes les cartes sont posées (et affectées) **et** aucune de ses règles n'a de
problème. Il est lu **sur la version figée** : `v1` pour « 1er envoi », `v2` pour « Après l'aléa ». Rien n'est vrai avant
l'envoi. Pièges (`CLAUDE.md`) : **aucun jalon vrai par inaction** (envoyer deux fois à vide = 0 / 10, déjà vrai dans la
maquette) ; un critère métier inclut les règles sans lesquelles il serait trivial (l'attente avec la fenêtre ; « pas de congé
décalé sans nécessité » avec dates imposées, effectif et CACES).

## 7. Évaluation : la copie rendue existante, telle quelle

`meta.copie: true`, `copie: meta.copie` dans `creerEntreprise`, `export const noter = (db) => moteur.noter(db)` : rien de
nouveau dans la copie rendue. Le deuxième envoi rend la copie (comme « Clore la réception et rendre ma copie » au quai).
**Note provisoire** : jalons réussis / jalons × 20 (`note: { sur: 20 }`), détail jalon par jalon dans `detail.planning`
(version, jalon, ✓ / ✗). Le ramassage d'une copie non rendue note ce qui a été envoyé (une version 1 seule = jalons de la
version 2 faux).

**Ranger sans afficher** (pour les futurs indicateurs de repérage, chantier à part) : nombre de clics sur « Vérifier mon
planning », heure du premier geste et de chaque envoi. Aucun écran ne les montre dans ce chantier.

## 8. Fichiers attendus (indicatif)

- `core/types/planning.js` (vue, règles, jalons, `etapesPlanning` ; contrat `nav` / `html` / `brancher` / `etatNeuf` comme
  `quai.js` et `inventaire.js`) ; câblage minimal dans `core/types/entreprise.js` (`U.planning`, entrée de menu, vue,
  `phasePlanning` dans `declencher()`) ; `apresPlanning` dans `core/declencheurs.js`.
- `styles/planning.css` (chargé par `index.html`, comme `styles/quai.css`). Teintes des familles : **translucides** (jaune
  pour la famille `a`, violet pour `b`, hachures pour les pauses et les indisponibilités, comme la maquette) ; toute
  variable nouvelle déclarée **trois fois** (`:root`, thème sombre, `prefers-color-scheme`). Jamais de vert plein hors
  « juste », ni de bleu (réservé au client sur les vues de transport). Contrastes du texte sur les teintes ≥ 4,5 : à mesurer.
- `contenus/planning-essai.js` : les trois cas de la maquette (données Smoby / K+N, « (fictif) » partout où la maquette le
  met), pour la page d'essai et les tests. Les séances écriront leurs propres contenus.
- Page d'essai `outils/essai-planning.html` (+ `.js`) : choix du cas, du temps, élève / enseignant, comme l'en-tête de la
  maquette, pour que Tristan clique sans passer par une séance.
- `outils/test/planning.mjs` + **une ligne dans `BLOCS`** de `outils/test.mjs` (**le dire à Tristan**, alerte 7).
- `activites/FICHE-SEANCE.md` : une section « vue Planning » (API, règles, jalons, aléa) ; `docs/decisions.md` : une ligne.

## 9. Lots proposés (chacun commité ; pousser quand la suite est verte)

1. **Le cœur** (3-4 h) : grille aux deux échelles, cartes, pose par glisser-déposer / clic-clic / clavier, bulle, lecture
   seule, état `db.plannings`, entrée de menu ; page d'essai avec le cas **quai**.
2. **Règles et temps** (2-3 h) : types de règles du §5 utiles au quai, signalement selon le temps (§3.5), « Vérifier »,
   envoi, `apresPlanning` + `phasePlanning`, bilan, réinitialiser, jalons et `etapesPlanning`.
3. **Cas personnel** (1-2 h) : ligne imposée, semaine entière, « (décalé) », compteurs, `effectif`, `auMoinsUn`,
   `dateImposee`, `sansNecessite`, aléa avec nouvelle carte et nouvelle ligne.
4. **Cas chauffeurs + évaluation** (2 h) : cartes Pause, `cumulSansPause`, `plafond`, `reposDepuisVeille`, indisponibilité
   d'une seconde ressource, aides de guidage (reprise, hachures, compteur de conduite) ; copie rendue et note.
5. **Tests, fiche, compte rendu** (le reste) : bloc `planning`, suite entière, `FICHE-SEANCE.md`, compte rendu ci-dessous.

## 10. Tests attendus (bloc `planning`)

- **Parcours justes** (10 / 10) dans les trois cas, avec les solutions ci-dessous **réécrites à la main** dans le test.
  Elles ont été trouvées par Cowork le 04/10 par recherche exhaustive **sur les règles de la maquette** : les recontrôler
  contre le moteur avant de les figer.
  - **Quai, 1er envoi** : A Quai 1 06:00 Léa · B Quai 2 06:30 Mathis · C Quai 1 07:30 Léa · D Quai 2 08:00 Karim ·
    E Quai 1 09:00 Léa · F Quai 1 10:00 Léa. **Après l'aléa** (D arrive à 09:00) : la même, sauf D Quai 1 09:00 Léa,
    E Quai 2 09:00 Karim, F Quai 1 10:15 Léa. Le 1er envoi ne tient plus après l'aléa (jalons fenêtre et attente faux).
  - **Personnel, 1er envoi** : formation de Mathis mar 8–mer 9, visite d'Inès jeu 10, congé de Chloé lun 14–mar 15, congé
    de Karim lun 7 (décalé), congé de Léa mer 16–ven 18. **Après l'aléa** : la même, sauf Chloé jeu 17–ven 18 (décalé) et
    l'arrêt d'Inès lun 14–mer 16. Recherche exhaustive : **8 solutions avant l'aléa, aucune ne survit à l'aléa, 5 après**
    (la fiche de cadrage disait 9 après : chiffre à recompter par le test, sans enjeu).
  - **Chauffeurs, 1er envoi** : E1 Sofiane 07:00 Semi n° 1 · E3 Marc 07:00 Porteur n° 3 · E2 Julie 08:00 Semi n° 2 · Pause
    Julie 11:30 · Pause Sofiane 11:00 · E4 Sofiane 11:45 Semi n° 1 · E5 Julie 12:15 Porteur n° 3. **Après l'aléa** (Semi n° 2
    à l'atelier jusqu'à 12:00) : E1 Julie 06:00 Semi n° 1 · E3 Marc 07:00 Porteur n° 3 · Pause Julie 10:00 · E2 Sofiane 10:00
    Semi n° 1 · E4 Julie 12:00 Semi n° 2 · Pause Sofiane 13:30 · E5 Sofiane 14:15 Porteur n° 3. Le 1er envoi ne tient plus
    (jalon camions faux).
- **Inaction** : envoyer deux fois sans rien poser → 0 / 10, dans les trois cas.
- **Chaque piège de la maquette signalé** : A avec Karim et C avec Mathis (quai) ; semi sur le quai 3 ; Karim et Léa le
  mer 16 ; congé décalé sans nécessité ; permis C sur une semi ; mauvais type de camion ; double emploi d'un chauffeur et
  d'un camion ; repos de Nadia ; 4 h 30 sans pause ; plus de 9 h.
- **« *Que*, pas *de combien* »** : aucun message de problème ne contient le nombre manquant ni le dépassement (relire tous
  les messages produits par les sabotages : pas de « manque 1 », « de 20 min », etc.).
- **Signalement par temps** : guidage en direct ; entraînement rien avant « Vérifier », liste effacée au geste suivant ;
  évaluation jamais, puis copie rendue au 2e envoi et note (valeurs écrites à la main : 10 / 10 → 20 ; 7 / 10 → 14).
- **Aléa** : arrive après le 1er envoi juste **et** après un 1er envoi faux ; une seule fois (rechargement) ; le planning de
  l'élève est conservé ; nouvelle carte et nouvelle ligne présentes.
- **Bulle** : s'ouvre à la pose, se rouvre au clic, Déplacer garde l'affectation, Retirer la retire, Échap rend le focus.
- **Clavier** : un parcours complet sans souris dans un cas au moins.
- **Réinitialiser** : vide le planning en cours, **et la version envoyée reste** (nommer ce qui reste).
- **État** retrouvé après rechargement ; deux séances avec deux plannings ne se mélangent pas (cloisonnement).
- **Sabotages** : chaque jalon doit tomber quand on casse sa règle ; une règle désactivée doit faire échouer son test.
- Piloter l'écran au moins une fois (souris sur `boundingBox()` après `scrollIntoViewIfNeeded()`) pour le glisser-déposer.

## 11. Critères de validation par Tristan

La page d'essai se joue **comme la maquette v8** (mêmes cas, mêmes textes, mêmes gestes), dans l'habillage Prepalog, sur
l'ordinateur de classe et au vidéoprojecteur (56 colonnes d'un quart d'heure dans le cas chauffeurs : défilement horizontal
dans la zone de la grille, jamais de la page) ; la bulle se trouve sans chercher ; rien ne part sur Internet.

## 12. Questions ouvertes (chacune a une valeur par défaut : l'appliquer et le dire au compte rendu)

- [ ] **Note d'évaluation** : jalons seuls (jalons réussis / 10 × 20) ou un bonus comme au quai ? *Défaut : jalons seuls*,
  réglable par `note`.
- [ ] **Compteurs « Présents » en évaluation** (cas personnel) : visibles comme dans la maquette (c'est l'outil du métier) ?
  *Défaut : oui*, réglable par le contenu.
- [ ] **Simplifications du cas chauffeurs** (§5) : *défaut : gardées* ; à rejuger dans B1.
- [ ] **Aléa déclenché par l'envoi du planning** (§4.3) : *défaut : oui* (geste métier, comme un mail).
- [ ] **Marquage cœur / complément des séances** (venu des fiches 2de) : **hors de ce chantier**. ⚠ Le nom `meta.parcours`
  proposé dans les fiches **est déjà pris** (parcours strict, `FICHE-SEANCE.md`) : le nom se choisira dans son propre chantier.
- Hors de ce chantier, demandés par S1, **un chantier moteur chacun, après celui-ci** : mots cliquables avec définition ;
  message par phrases à choisir dans la messagerie ; indicateurs de repérage pour l'enseignant. En attendant, la vue
  Planning s'appuie sur la messagerie actuelle (réponse préremplie, `apresMail`).
- Porte ouverte, **à ne pas construire** : la **frise du chauffeur** (OTM C3.2) comme futur mode de la vue ; plusieurs
  plannings dans une même séance ; le rapprochement avec les temps de déchargement de la vue quai.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** : bloc / suite entière, nombre de cas, sabotages éprouvés
- **Commits** : *(hash + message)*
- **Reste ouvert** :
