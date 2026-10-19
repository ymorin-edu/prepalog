# Brief de séance — ENT-10.4 Transports Pelleau — évaluation : prendre son poste (CAP OL, évaluation CAP-C1.2)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, les briefs ENT-10.2 et ENT-10.3 (§4 à §6) puis docs/briefs/ENT-10.4-pelleau-evaluation-prise-de-poste.md en entier. Les poids du §5 sont validés par Tristan ; annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : livré (19/10/2026, à essayer à l’écran par Tristan) · **Date** : 18/10/2026 · Cowork, sur délégation · **Modèle** : Sonnet · **Durée estimée** : ≈ 4 h.

---

## 0. Règles communes

Feuille de route Pelleau. **Lundi 11 mai, 6 h** (le vendredi 8 mai est férié). **Évaluation** : `copie: true`, en classe sous surveillance, **sans
aide**, données tirées neuves ; rien ne dit juste ou faux avant la remise. Un seul jeu par élève.

Écrans : **Avant de commencer (notée) → Où est-ce ? → Mon poste → Yann → Le planning → Rendre compte** → remise de la copie.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.4 / `pelleau-evaluation-prise-de-poste` |
| Titre / desc | « Transports Pelleau — évaluation : prendre son poste » / « Repérer son poste, contrôler le poste et l'engin, refuser ce qui n'est pas sûr, lire le planning des quais et rendre compte, sans aide. » |
| Compétence | `competencesCap: ['CAP-C1.2']` (C1.1 n'a pas de note ici : voir §11) |
| Temps | `temps: 'evaluation'` (coefficient 3) |
| Notation | `bareme: 20`, `copie: true` (+ `copie: meta.copie` dans `creerEntreprise`, `export const noter`), `parcours`, `precedente: 'pelleau-on-commence-quand-meme'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

Comme ENT-10.2 et 10.3. Rien de nouveau.

## 3. Objectif

Évaluer C1.2 : repérer, contrôler (site **et** engin), refuser et proposer, lire le planning, rendre compte.

## 4. Déroulé (≈ 45 min)

### Étape 0 — Avant de commencer, **notée** (4 / 20)

`tirage: { preparation: 4 }`, questions `cle: true` d'ENT-10.1 à 10.3 (transporteur, entreposeur, ramasse, ambiant, epi, prise-poste,
planning-quais, consigner, img-tpe, img-racks), « Je ne sais pas » possible, faux = − 1 ÷ (nombre de mauvaises réponses), plancher 0.

### Étape 1 — Où est-ce ? (fiche `liste`, le plan de l'entrepôt à gauche)

La visite ne se joue pas en copie (moteur) : **fiche** de 3 lignes tirées parmi 6 (« Où attendent les palettes déchargées ? » → zone de réception ;
« Où met-on une palette abîmée ? » → zone litiges ; « Où recharge-t-on le transpalette ? » → local de charge ; « Où Maëlys tient-elle le planning ? » →
bureau ; « Où met-on ses EPI ? » → vestiaire ; « Où compte-t-on les colis ? » → zone de contrôle). Choix : les 7 lieux du plan (numéros).

### Étape 2 — Mon poste (Inspection, `copie`)

- Message d'Erwan : « Prends ton poste. Contrôle ton poste et le transpalette n° 1, et signale-moi ce qui ne va pas. Erwan »
- `pelleau-poste-104` : **2 défauts tirés** — 1 du site (extincteur quai A ou B, ou affichage) **et** 1 du transpalette n° 1 (parmi les 6 d'ENT-10.3) ;
  + 1 point en ordre. Pas d'arrêt, pas de réparation, réponse neutre « Noté. » ; l'élève peut essayer l'avertisseur.

### Étape 3 — Yann (Dialogue, mode évaluation)

Yann : « On a un camion dans dix minutes. Prends le n° 1, on verra ce soir. » — répliques calculées sur les deux défauts (1 juste : « Je prends le
n° 2 après l'avoir contrôlé, je mets le n° 1 de côté, et on travaille au quai où il y a un extincteur [ou : tu me montres le sens de circulation].
Je préviens Erwan. » ; 3 fausses). En évaluation, pas de réaction qui dit juste ou faux.
*(Le transpalette n° 2 est contrôlé en ordre en fond de scène : déclaré `ok` avec `essai: 'sonne'`, pour que la réplique juste existe.)*

### Étape 4 — Le planning (Planning, `copie`)

Grille **tirée** parmi 3 variantes construites (heures de Loïc et du transporteur décalées, quai fermé selon le défaut du site s'il s'agit d'un
extincteur), 2 lectures tirées + 1 carte à poser (client tiré : Ar Vag ou Agri-Kerlann), contrôle de grille au chargement (une seule bonne réponse,
une place juste au moins, **dans chaque variante**).

### Étape 5 — Rendre compte (phrases, `copie`) puis remise

5 lignes : salutation · mon engin (calculé) · le site (calculé) · l'heure du camion (lue dans **sa** grille) · fin. Puis « Rendre ma copie ».

## 4 bis. Questions au fil

Aucune (évaluation : l'ouverture notée tient la place).

## 5. Jalons / notation — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids |
|---|---|---|
| **Avant de commencer** | 4 questions, 1 chacune (règle des évaluations) | **4** |
| **Où est-ce ?** | 3 lignes, 2/3 chacune | **2** |
| **Mon poste** | défaut du site 2 · défaut de l'engin 2 · avertisseur essayé 0,5 · aucun faux 1,5 | **6** |
| **Ne pas céder** | bonne réplique | **2** |
| **Le planning** | 2 lectures 1 chacune · carte posée 1 | **3** |
| **Rendre compte** | engin 0,75 · site 0,75 · heure 0,5 · forme 1 | **3** |
| **Total** | | **20** |

Inaction : 0 (l'ouverture « Je ne sais pas » partout = 0, plancher). Pas de bonus, pas de niveau.

## 6. Contenu

`contenus/pelleau-ent104.js`, `activites/pelleau-evaluation-prise-de-poste.js`, `contenus/corriges/ENT-10.4.js` (par élève : ses défauts, sa grille,
ses justes). Pas de fichier de questions au fil (ouverture dans le contenu, comme ENT-8.10).

## 6 bis. Tirage

Socle tiré, ni bonus ni niveau. Défauts : site 1/3 chacun ; engin : uniforme sur 6. Grille : 3 variantes. **Équité** : les trois grilles ont le même
nombre de camions et la même difficulté de lecture (lectures de rang `facile` + `moyen`).

## 7. Demandes au moteur

Aucune. **À vérifier** : inspection en `copie` (vue nouvelle : prévu dans `MOTEUR-inspection-poste.md` §4) ; dialogue en mode évaluation (ENT-8.10).

## 8. Tests (bloc `pelleau`)

Parcours juste → 20/20 (3 grilles × 2 défauts d'exemple) ; inaction → 0 ; rien ne dit juste/faux avant la remise ; un défaut sur deux signalé → 2 / 6
au bloc ; ouverture : faux − 1/2 avec 3 choix, plancher 0 ; 300 graines : contrôles de grille verts, réplique juste toujours présente.

## 9. Supports

Pas de trame (évaluation) ; corrigé enseignant par élève.

## 10. Critères de validation

45 min suffisent ; l'élève ne voit jamais « juste » ; Tristan relit les 3 grilles.

## 11. Questions ouvertes

- [ ] **C1.1** : pas de note séparée chez Pelleau (évaluée chez Action, ENT-8.5 ; elle revient à chaque découverte). Ses questions clés d'ENT-10.1
  entrent dans l'ouverture, notée au titre de C1.2. (Défaut : ainsi ; autre choix : déclarer aussi `CAP-C1.1` si le moteur sait donner une note par
  compétence — point ouvert déjà noté pour ENT-8.10.)

---

## Compte rendu *(rempli par Claude Code à la livraison)*

**19/10/2026 — sous-agent Sonnet, chantier Pelleau.** Rien n'est commité par le sous-agent (le chef relit, commite et pousse).

- **Fichiers** : `activites/pelleau-evaluation-prise-de-poste.js` (`pret: true, ouverture: 'prof'`, `copie: true`, `export const noter`), `contenus/pelleau-ent104.js`
  (messages, documents, plan numéroté, fiches, planning, dialogue, jalons), `contenus/pelleau-ent104-donnees.js` (données pures : défauts tirés, inspection,
  dialogue, grille, lectures, tirage, phrases ; chargé aussi sous Node par le corrigé), `contenus/questions/ENT-10.4.js` (l'ouverture seule),
  `contenus/corriges/ENT-10.4.js` (par graine), `outils/test/pelleau-104.mjs` (25 cas). Lignes ajoutées : `activites/index.js` (sous ENT-10.3), `outils/test.mjs`
  (`BLOCS`, `GROUPES` 2), `outils/test/socle.mjs` (`'ENT-10.4': 'CAP-C1.2'`), `outils/test/tirage-niveaux.mjs` (`BANQUES_FIGEES` : la séance appelle `declarerTirage`).
- **Poids codés** (ceux du §5, tels quels) : Où est-ce ? 2 (3 lignes × 2/3) · Mon poste 6 (défaut du site 2 · défaut de l'engin 2 · avertisseur essayé 0,5 ·
  aucun faux 1,5) · Ne pas céder 2 (`refuser`) · Le planning 3 (2 lectures × 1, la carte 1) · Rendre compte 3 (engin 0,75 · site 0,75 · heure 0,5 · salutation 0,5 ·
  fin 0,5) · Avant de commencer 4 (`part: 4`) = 20. Inaction : 0/20 (testé, y compris un poste « pris » sans rien). Ni bonus ni niveau. Aucune question au fil.
- **Écarts avec le brief** :
  1. **Planning fixe, client non tiré** (décision 12 du chef ; `planning` est statique, `cartes.liste` ne dépend pas de la graine) : une seule grille (Loïc 7 h 15 – 8 h
     et la livraison pour Ar Vag 9 h 30 – 10 h 30 au quai A, un départ pour Rungis 10 h – 11 h au quai B), une seule carte, **Agri-Kerlann** (1 h, entre 10 h et
     12 h). Places justes : quai A à 10 h 30, 10 h 45, 11 h ; plus le quai B à 11 h quand c'est le plan qui manque. Le quai B sans extincteur est jugé par le jalon de
     la carte, pas par le moteur. Les trois variantes de grille du brief ne sont pas faites : « Tristan relit les 3 grilles » devient « Tristan relit la grille ».
  2. **Défaut du site : 2 variantes, pas 3** (extincteur du quai B ou plan de circulation, 55 / 45 % sur 300 graines). Le brief disait « extincteur quai A ou B, ou
     affichage » ; la scène du quai de la vue dessine toujours « QUAI B » (nom non déclarable) : un défaut « au quai A » contredirait la porte dessinée.
  3. **Le transpalette n° 2** est déclaré en ordre (point `tp2`, piège « ne signaler que ce qui ne va pas ») mais **sans essai** : un second essai ajouterait un jalon
     `essai-2` que le barème (« avertisseur essayé 0,5 ») ne prévoit pas. Un seul point en ordre, comme le brief ; l'autre objet du site n'est pas déclaré (donc pas
     cliquable). Signaler le n° 2 coûte les 1,5 de « aucun faux ».
  4. **Défaut de l'engin : 6, uniforme** (fourche, roue, batterie, arrêt d'urgence, fuite, avertisseur), tiré sur la graine ; ENT-10.3 n'étant pas écrite, la liste est
     celle de la vue. **L'avertisseur muet est invisible** : il ne se trouve qu'en essayant l'avertisseur ; un élève qui n'essaie pas perd `essai-1` ET le défaut de
     l'engin (2,5 sur 20) dans ce seul tirage (1 sur 6). Le brief le veut ainsi (« uniforme sur 6 ») ; à décider par Tristan s'il le trouve trop dur.
  5. **Ouverture** : le brief écrit `tirage: { preparation: 4 }` mais ses questions clés comptent deux images ; le tirage est `{ preparation: 3, image: 1 }`
     (7 notions, 2 images : `transporteur`, `entreposeur`, `ramasse`, `ambiant`, `epi`, `prise-poste`, `planning-quais` ; `img-racks`, `img-tpe`). `consigner` et `img-fourche`
     (ENT-10.3, non écrite) ne sont pas reprises ; les documents « à gauche » sont ceux de cette séance (rien n'est importé d'une autre).
  6. **« Les 7 lieux du plan »** : les lieux réellement déclarés par l'univers (`PLAN_ENTREPOT` / `LIEUX`) donnent **sept** ronds : vestiaire, local de charge, bureau transport,
     zone de réception, zone de contrôle, zone litiges, **les quais** (jamais demandé : 7e choix). Plan **dessiné** pour la séance (schéma sans un nom de lieu, chaque lieu
     se reconnaît à son contenu), **numéros tirés** par élève (permutation de 1 à 7) ; trois lignes tirées parmi six (un facile, un moyen, un difficile).
  7. **La bonne réplique de Yann dit le défaut du site** (« … on travaille au quai A, où il y a un extincteur » / « … tu me montres le sens de circulation »), comme le
     brief : un élève qui n'a pas trouvé le défaut du site le lit dans les réponses proposées (l'inspection est alors figée, mais les jalons suivants — carte, phrase « site » —
     en profitent). **Question au chef / à Tristan** : garder, ou dire seulement « je préviens Erwan par écrit ».
  8. Aucun jour de la semaine ; « Mon poste » : consigne en trois lignes ; aucune liste « Ma prise de poste », aucun « Le droit » (évaluation sans aide) ; réponse d'Erwan en
     copie : « C'est noté. » (texte de la vue, pas « Noté. »).
- **Tests** : `pelleau-104` 25/25 ; `socle dependances copie questions inspection pelleau-102 tirage-niveaux pelleau-104` **267/267** (la suite entière n'est pas relancée : le
  chef le fait). Valeurs attendues écrites à la main pour six graines (p104-a, f, z, b, e, s : un engin chacune). Sabotages joués puis remis (empreinte vérifiée ; ceux de
  la vue sont joués par interception du fichier dans le navigateur de test, `core/` n'a pas été touché) :

  | Sabotage | Cas tombés |
  |---|---|
  | jalon du compte rendu vrai sans envoi (inaction) | « Avant de commencer » (sans réponse = 0) et « inaction » |
  | `copie: false` dans l'activité | la séance refuse de se charger (le moteur exige la copie pour `temps: evaluation`) : 21 cas |
  | vue : arrêt aussi en copie | « défaut du site oublié → aucun arrêt », « un défaut sur deux signalé », « parcours faux (rien ne dit juste ou faux) » |
  | vue : réparation sous les yeux aussi en copie | « inspection en copie : rien ne se répare », « les six défauts de l'engin » |
  | vue : Erwan répond « Bien vu » en copie | « inspection en copie : C'est noté » |
  | bonne réplique de Yann inversée (la maladroite devient juste) | 11 cas (parcours justes, Yann, six engins, planning…) |
  | carte jugée sans la règle de l'extincteur du quai B | « le planning », « parcours faux » |
  | défaut de l'engin plus tiré (toujours la fourche) | 11 cas (300 graines, six engins, corrigé…) |
  | numéros du plan plus permutés | 10 cas (« Où est-ce ? », parcours, corrigé…) |

- **Écran (mesuré)** : à 1366 × 768 la vue de l'inspection tient (captures : accueil, plan « Où est-ce ? », inspection avec marques, Yann, remise). **Yann** : avec quatre
  réponses dont une de deux lignes, la dernière réponse sort de l'écran d'environ 130 px (défilement de page) ; l'ordre des réponses est tiré par élève, la bonne peut donc
  être la dernière. Trait de la vue Dialogue (non touchée) ; si Tristan le trouve gênant, raccourcir la réplique juste ou n'en proposer que trois.
- **À vérifier par Tristan à l'écran** : le plan numéroté et les ronds (lisible au vidéoprojecteur ? un lieu se reconnaît-il sans nom écrit ?) ; l'inspection en copie (marque
  au premier clic, « C'est noté. », rien ne se répare, pas d'arrêt, essai de l'avertisseur) ; Yann (ton pressé mais pas méchant, quatre réponses, la dernière hors écran) ;
  la grille du planning (la seule : Loïc, Ar Vag, Rungis) et la carte Agri-Kerlann ; le texte des phrases du compte rendu ; l'ouverture notée sans aide ; la remise
  (« Rendre ma copie », rien ne dit juste ou faux avant). Les écarts 1, 2, 4 et 7 sont à valider.
