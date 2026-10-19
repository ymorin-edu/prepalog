# Brief de séance — ENT-10.1 Transports Pelleau — de Plabennec à l'entrepôt neuf (CAP OL, guidage CAP-C1.1)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md puis docs/briefs/ENT-10.1-pelleau-se-situer.md en entier. ENT-10.1 crée l'univers commun contenus/pelleau.js et l'entreprise n° 10. Fais valider les poids du §5 par Tristan avant de les coder, demande-lui l'accord pour le logo (§2), annonce la durée et dis-moi si un point du brief contredit le code.
> ```

**Statut** : livré (19/10/2026, `pret: true, ouverture: 'prof'` ; à essayer à l’écran par Tristan)
**Date du brief** : 18/10/2026
**Conversation d'origine** : Cowork (Opus), 18/10/2026 au soir : cadrage de Pelleau (5 décisions de Tristan, fiche du projet
`claude/prepalog-cap-pelleau-cadrage.md`), puis briefs **sur délégation** (« construis les briefs en prenant les décisions »). Toutes les décisions
de ce brief sont **de Cowork** sauf mention ; à relire à l'écran par Tristan.
**Modèle** : **Opus** (première séance d'une entreprise nouvelle).
**Place dans l'ordre** : première de Pelleau ; aucune vue nouvelle (la vue « Localiser » existe). ENT-10.2 suit.
**Durée estimée par Cowork** : ≈ 5 h (univers commun, entreprise n° 10, carte, trois fiches et leurs banques, questions, tests). Ce qui prend le
temps : l'univers commun et les tests du tirage.

---

## 0. Règles communes à Pelleau

Les 12 règles de `docs/briefs/FEUILLE-DE-ROUTE-pelleau.md` (public CAP, entrepôt neuf de mai, Erwan / Yann / Loïc / Maëlys construits, clients
fictifs, dates sans année, notation, tirage, cloisonnement, univers commun). Pour cette séance : **lundi 4 mai, 8 h**, premier jour de PFMP de
l'élève ; il découvre l'entreprise avant de visiter l'entrepôt (ENT-10.2, le lendemain).

Écrans : **Avant de commencer → Qui est qui ? → La carte → L'histoire de Pelleau → Ce que fait Pelleau → Ce que je change** → bilan.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-10.1 |
| `id` (jamais modifié ensuite) | `pelleau-se-situer` |
| Titre / desc | « Transports Pelleau — de Plabennec à l'entrepôt neuf » / « Situer l'entreprise sur la carte, reconnaître ses métiers et son histoire, savoir qui fait quoi et ce que change le travail du magasinier. » |
| Rubrique | simulog, **entreprise n° 10 Transports Pelleau** (ligne `ENTREPRISES` à créer : numéro 10, nom « Transports Pelleau », métier « transporteur devenu entreposeur — entrepôt neuf de Gouesnou ») |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competencesCap: ['CAP-C1.1']` ; sous-compétences : C1.1.1 types d'organisation · C1.1.2 environnement économique · C1.1.3 se situer dans l'organisation · C1.1.4 contribution de l'opérateur. `competences` (Bac Pro) : comme ENT-8.1. Ligne `'ENT-10.1': 'CAP-C1.1'` dans `ATTENDU_CAP` (alerte 7). |
| Temps pédagogique | `temps: 'guidage'` |
| Notation | jalons pondérés, `bareme: 20`, `parcours: true`, `correction: true`, `bilanDetail: true`, première séance du parcours Pelleau |
| Niveaux d'élève | `niveauxPrevus: ['confirme', 'accompagne']` (la carte lit le niveau ; les fiches : contenu standard) |
| `questions` | `'ENT-10.1'` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` (alerte 8 : rang ENT-10.1, après CHEP) |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

- **Vérifié** (site Pelleau et presse, consultés le 18/10/2026, sources dans la feuille de route) :
  - créée en **1930 à Plabennec** par Gabriel Pelleau (bétail, matériaux de construction) ; **1945** primeurs ; **1960** transmise à ses trois fils
    (primeurs de Saint-Pol-de-Léon et du port de Brest) ; **1989** début du travail avec **Germicopa** (plants de pommes de terre) ; **1993**
    rattachée à la holding **Sofipel** (groupe né de Pelleau, aujourd'hui surtout automobile, 15 enseignes) ; **1998** véhicules accidentés ;
    **2013** véhicules neufs et d'occasion ; **2020** flotte de porte-voitures doublée ; **2026** nouveau bâtiment et activité de **stockage** ;
  - **26 salariés**, **20 véhicules** suivis dont **10 porte-voitures**, **24 000 véhicules transportés en 2025**, démarche **Objectif CO₂** ;
  - livraisons **chaque jour du Finistère vers la région parisienne** (MIN de Rungis, plateformes de la grande distribution, sites industriels),
    **ramasses quotidiennes** chez les producteurs locaux ;
  - entrepôt : racks, **environ 1 000 palettes**, **ambiant seulement** ; réception, préparation, expédition ; en service **début mai 2026** ;
  - adresse : ZAC de Kergaradec, **29850 Gouesnou**.
- **Construit (à dire dans la séance, texte de fin de la carte et pied du document)** : Erwan, Yann, Loïc, Maëlys et leurs fonctions ; les clients
  qui stockent (fictifs) ; **le passage des ramasses par l'entrepôt** ; la mise en forme du document « Pelleau en bref ».
- **Distance** : Brest – Rungis ≈ **580 km** par la route (Kelbillet ; **recouper par Mappy** avant d'écrire ; dire « près de 600 km »).
- **À ne pas écrire** : la surface (1 000 ou 1 600 m² selon la source) ; les logos de l'accueil du site comme clients ; le nom du dirigeant.
- **Logo** : aucun logo sous licence libre trouvé ; **accord de Tristan le 18/10/2026 à 22 h 03** pour le récupérer sur le site officiel
  (transports-pelleau.fr ; script, alerte 10 : lire, écrire, relire, redécoder, empreinte ; ligne dans `CREDITS.md` ; supports : bandeau, trame).
  Charte : relever les couleurs du logo ; règle des chartes rouges ou vertes ; accent distinct du vert « juste » et du bleu « client ».
- **Photos** : libres (Pexels / Unsplash), ni Pelleau ni visages, mention « Photo d'un autre site » ; camion porteur, racks, transpalette.
- **Documents reconstitués** : pied « Document pédagogique — reconstitution, non contractuel. Les clients cités sont des entreprises fictives. »

## 3. Objectif pédagogique

À la fin, l'élève sait **situer** l'entrepôt et ses destinations sur la carte, dire ce qu'est Pelleau (**un transporteur qui devient aussi
entreposeur**, une entreprise familiale d'un groupe), remettre dans l'ordre **trois ou quatre étapes** de son histoire, dire **qui fait quoi**, et
ce que **son** travail change. Premier temps de C1.1 chez Pelleau, la veille de la prise de poste (ENT-10.2). Ses questions clés (★) reviennent dans
l'ouverture notée d'ENT-10.4 (sans note séparée de C1.1 : elle est évaluée chez Action, ENT-8.5).

## 4. Déroulé (≈ 45 min) — lundi 4 mai

### Étape 0 — Avant de commencer (non notée, Erwan) — §4 ter

### Étape 1 — Qui est qui ? (Messagerie + fiche)

- **Message d'Erwan** (8 h) : « Bonjour {prénom}, bienvenue chez Pelleau ! Je suis Erwan, je dirige l'entrepôt et je suis ton tuteur. L'entrepôt
  ouvre cette semaine : tu fais partie des premiers. Commence par l'équipe. Erwan » — pièce jointe : document **« L'équipe de l'entrepôt »** (4 cartes :
  prénom, métier, une phrase ; pas de visage, un pictogramme par métier).
- **Fiche « Qui est qui ? »** (`liste` × 3 tirées, + 1 bonus confirmé, §6 bis) : une tâche par ligne, 4 choix fixes : **Erwan, responsable** · **Yann,
  magasinier-cariste** · **Loïc, conducteur** · **Maëlys, agent d'exploitation**.

### Étape 2 — La carte (vue « Localiser », `premierEssai` de la vue)

- **Message d'Erwan** (`apresFiche('qui-est-qui')`) : « Pelleau est né à Plabennec, l'entrepôt est à Gouesnou, et les camions roulent jusqu'à Rungis.
  Place ces lieux sur la carte. Erwan »
- Déclaration §6.1 : 3 lieux du socle + 1 bonus (confirmé) ; flux entrepôt → Rungis ; réseau : aucun. Texte de fin : « Chaque jour, des camions
  Pelleau partent du Finistère vers la région parisienne : près de 600 km. Les prénoms et les clients de l'entrepôt sont imaginés pour l'exercice. »
- Question A au geste `localiser:rungis:departement` (§4 bis).

### Étape 3 — L'histoire de Pelleau (fiche `ordre`, lot 4 : flèches ↑ ↓)

- **Message d'Erwan** (`localiserFini('pelleau-carte')`) : « Pelleau a presque cent ans. Lis le document et remets ces étapes dans l'ordre. Erwan »
  — pièce jointe : **« Pelleau en bref »** (frise : 1930, 1945, 1989, 1993, 2013, 2026, une phrase chacune ; faits du §2).
- **Fiche « Dans l'ordre »** : 4 étapes **tirées** parmi 6 (§6 bis), ordre de départ déclaré par le contenu (jamais trié), l'élève les range de la
  plus ancienne à la plus récente.

### Étape 4 — Ce que fait Pelleau (fiche `liste`)

- **Message d'Erwan** (`apresFiche('histoire')`) : « Pelleau transporte, et maintenant stocke. Pour chaque travail, dis de quel métier il est. Erwan »
- **Fiche « Ce que fait Pelleau »** : 3 lignes tirées (+ 1 bonus), choix fixes : **transporter des marchandises** · **transporter des véhicules** ·
  **stocker des marchandises** (§6 bis, banque `metiers`).
- Question B au geste `fiche:metiers:envoyer`.

### Étape 5 — Ce que je change (fiche `liste`)

- **Message d'Erwan** (`apresFiche('metiers')`) : « Demain, tu travailles à l'entrepôt. Pour chaque situation, dis ce qui se passe si tu fais bien ton
  travail. Erwan » — **fiche** 2 situations tirées (+ 1 bonus), 3 choix chacune (une juste, calculée par la banque `situations`).
- Question C (réflexion) à l'envoi.

### Fin

- **Erwan** (`apresFiche('changer')`) : « Merci {prénom}. Demain 7 h, je te fais visiter l'entrepôt. Prends tes chaussures de sécurité. Erwan »
- Premier bilan, `bilanDetail` ; « Corriger » rouvre les fiches fausses, **pas la carte** (`finFige` : « La carte se joue au premier essai : elle ne
  se rejoue pas. »).

**Mots cliquables** : transporteur, entreposeur, prestataire logistique, ramasse, MIN (marché d'intérêt national), grande distribution, holding,
stock ambiant, rack, magasinier.

## 4 bis. Questions au fil — **choix de Cowork : A, B, C, D** (délégation du 18/10/2026)

Fichier `contenus/questions/ENT-10.1.js`, `part: 4`, personne : Erwan (`equipe`). Ligne du bandeau : « Les questions d'Erwan ».

| id | Geste | Qui pose | Question (juste en gras) | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| `rungis` (A) | `localiser:rungis:departement` | Erwan | « Rungis est à près de 600 km. Un camion parti de Gouesnou à 22 h arrive vers… » — **6 h du matin, le lendemain** (`6h`) · 22 h 30 le même soir (`22h30`) · midi, deux jours plus tard (`midi`) | fil | **1** | tout de suite | C1.1.2 : la place de Pelleau dans la chaîne (le Finistère livre Paris de nuit) ; ancrée sur la carte |
| `pourquoi-stocker` (B) | `fiche:metiers:envoyer` | Erwan | « Pourquoi un transporteur se met-il aussi à stocker ? » — **pour garder ses clients : il transporte et il garde leur marchandise** (`garder`) · pour vendre des biscuits (`vendre`) · parce que la loi l'oblige (`loi`) | fil | **1,5** | tout de suite | C1.1.1 et petit cas C3.6 (fait économique) appliqué à Pelleau |
| `qui-paie-garde` (D) | `fiche:changer` 1re ligne choisie | Erwan | « La Biscuiterie Ar Vag laisse ses palettes chez nous et paie pour ça. Si une palette est abîmée dans **nos** racks, qui doit en répondre ? » — **Pelleau, qui la garde** (`pelleau`) · la Biscuiterie (`client`) · personne (`personne`) · Loïc, le conducteur (`loic`) | fil | **1,5** | **au bilan** (proche du jalon « ce que je change ») | **éco-droit appliqué au cas** : C. civ. 1927, 1928 (dépôt payé : soins « avec plus de rigueur ») et 1932, texte fourni (« Le droit ») |
| `fierte` (C) | envoi de « Ce que je change » | Erwan | « Dans un entrepôt qui ouvre, qu'est-ce qui compte le plus pour toi ? » — « Apprendre les bons gestes dès le début » · « Que les clients aient confiance » · « Travailler en sécurité » · « Je n'y avais pas pensé » | fil | réflexion | tout de suite | C1.1.4 ; ne touche aucun jalon |

**Écartées** : « Combien de salariés chez Pelleau ? » (culture pure) · « Qu'est-ce que l'Objectif CO₂ ? » (sans lien avec un geste de la séance ;
gardée pour une séance de C3.7).

- **Retours** : A : « Vers 6 h : on roule de nuit pour que les primeurs soient à Rungis au matin. » · B : « Un client qui nous confie son transport peut
  aussi nous confier son stock : on travaille plus pour lui, et il reste chez nous. » · D : « Pelleau : quand on garde la marchandise d'un client, on doit
  en prendre soin et la lui rendre telle qu'on l'a reçue. C'est pour ça qu'on contrôle tout à l'arrivée. » · C (« Ce qu'en pense Erwan ») : « Les trois.
  Les habitudes du premier mois restent. »
- Poids : A 1 · B 1,5 · D 1,5 (C non notée) → 4.
- **Document « Le droit »** : C. civ. 1927, 1928, 1932 (texte exact recopié sur Légifrance, date de consultation), joint au message de l'étape 5.
  Repère vérifié le 18/10 (Criminocorpus) : 1927 « Le dépositaire doit apporter dans la garde de la chose déposée les mêmes soins qu'il apporte dans
  la garde des choses qui lui appartiennent. » ; 1932 « Le dépositaire doit rendre identiquement la chose même qu'il a reçue. »

## 4 ter. Avant de commencer — choix de Cowork

Bloc `ouverture` (Erwan), `tirage: { preparation: 3, image: 1 }`, non notées. `cle: true` = reprise dans l'ouverture notée d'ENT-10.4.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `transporteur` | préparation | Un transporteur… | déplace la marchandise d'un lieu à un autre | fabrique la marchandise · vend en magasin | — | ★ |
| `entreposeur` | préparation | Un entreposeur… | garde la marchandise de ses clients dans son entrepôt | la transporte jusqu'au client · la fabrique | — | ★ |
| `ramasse` | préparation | Une ramasse, c'est… | une tournée pour aller chercher la marchandise chez les expéditeurs | une livraison au magasin · un inventaire | — | ★ |
| `tuteur` | préparation | Pendant ton stage, ton tuteur… | t'accueille, te donne les consignes et suit ton travail | te paie · fait ton travail à ta place | — | |
| `ambiant` | préparation | Un stockage « ambiant », c'est… | sans froid : à la température de l'entrepôt | au congélateur · dehors, sur le parking | — | ★ |
| `rack` | préparation | Un rack, c'est… | un rayonnage où l'on range les palettes en hauteur | un camion · un document du chauffeur | photo libre de racks | |
| `img-porteur` | image | Ce camion est… | un porteur : la caisse et la cabine sont d'un seul bloc | une semi-remorque · un porte-voitures | photo libre | |
| `img-porte-voitures` | image | Ce camion transporte… | des voitures | des palettes · du lait | photo libre | |
| `img-racks` | image | Ici, on… | stocke des palettes en hauteur | gare les camions · charge les batteries | photo libre | ★ |

**Écartées** : `holding` et `germicopa` (elles donneraient des étapes de la frise : 1993 et 1989).

## 5. Jalons / notation (sur 20) — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Qui est qui ?** | 3 tâches tirées, 1 chacune | **3** | fiche `qui-est-qui` | la banque garantit 3 personnes différentes (sinon « tout à Erwan » rapporte) |
| **La carte** | 3 lieux × (région, département), 1 chacun, premier essai | **6** | `etapesLocaliser` | aucun `ecran` |
| **L'histoire de Pelleau** | ordre juste des 4 étapes : 1 par étape à sa place (paires consécutives justes, voir §6 bis) | **3** | fiche `histoire` | ordre de départ jamais trié (sinon l'inaction rapporte) : le contrôle au chargement refuse un départ déjà juste |
| **Ce que fait Pelleau** | 3 lignes, 2/3 chacune | **2** | fiche `metiers` | 3 métiers différents dans le socle |
| **Ce que je change** | 2 situations, 1 chacune | **2** | fiche `changer` | — |
| **Les questions d'Erwan** | A 1 · B 1,5 · D 1,5 | **4** (`part: 4`) | moteur des questions | — |
| **Total** | | **20** | | |

- Anti-inaction : rien fait = 0/20 (l'ordre de départ ne doit valoir aucun point : le contrôle d'équité le vérifie sur 300 graines).
- Confirmé : 1 tâche, 1 métier, 1 situation et le lieu bonus en jalons `bonus: true`.

## 6. Contenu (données)

- **`contenus/pelleau.js`** (univers commun, **créé ici**) : `ENTREPRISE` (nom, métier, charte), `PERSONNES` (Erwan, Yann, Loïc, Maëlys : prénom,
  métier, phrase, pictogramme), `CLIENTS` (`ar-vag`, `agri-kerlann`, `kerveguen` : nom, ville **fictive ou générique** (« près de Landerneau »), produit,
  conditionnement, mention fictive), `PLAN_ENTREPOT` (pour ENT-10.2 : quais A et B, zones, deux allées de racks, local de charge), `DOC_DROIT_DEPOT`
  (1927, 1928, 1932), gabarits de documents (pied commun).
- **`contenus/pelleau-ent101.js`** : messages, fiches, carte, banques, jalons, ouverture ; **`contenus/questions/ENT-10.1.js`** ;
  **`activites/pelleau-se-situer.js`** ; **`contenus/corriges/ENT-10.1.js`** (par élève : ses tâches, ses étapes et leur ordre, ses métiers, ses
  situations).

### 6.1 Les lieux de la carte (positions **à relever dans OpenStreetMap**, objet cité)

| id | lettre | type | nom | rôle | ville / dép. / région | autres (3, ≥ 8 km) | indice |
|---|---|---|---|---|---|---|---|
| `entrepot` | E | entrepot | Entrepôt Transports Pelleau | « L'entrepôt neuf où tu travailles. » | Gouesnou (ZAC de Kergaradec) / 29 / 53 | Quimper, Morlaix, Carhaix-Plouguer | « Tout au bout de la Bretagne, au nord de Brest. » |
| `berceau` | P | site | Plabennec, là où tout a commencé | « Gabriel Pelleau y crée l'entreprise en 1930. » | Plabennec / 29 / 53 | Quimper, Morlaix, Concarneau | « Le même département que l'entrepôt. » |
| `rungis` | R | magasin | Marché de Rungis (MIN) | « Le grand marché où les camions livrent les primeurs. » | Rungis / 94 / 11 | Créteil, Vincennes, Champigny-sur-Marne | « Au sud de Paris. » |
| `saint-pol` (bonus) | S | site | Saint-Pol-de-Léon | « Les primeurs de 1960 partaient d'ici. » | Saint-Pol-de-Léon / 29 / 53 | Quimper, Brest, Châteaulin | — |

- `flux: ['entrepot', 'rungis']`. Repères (standard, confirmé) : Brest (29), Paris (75).
- **Contrôle** : chaque point à plus de 8 km des 3 autres de son lieu (Brest est à moins de 8 km de Gouesnou : **jamais** dans les `autres`
  d'`entrepot`). Si une position ne passe pas le contrôle, changer la ville d'`autres` et le dire.

## 6 bis. Tirage et niveaux

### Banque `taches` — « Qui est qui ? »

| id | Tâche | Qui | Difficulté |
|---|---|---|---|
| `t-tournee` | Faire la tournée de ramasse chez les producteurs. | Loïc | facile |
| `t-chariot` | Ranger une palette en haut du rack au chariot. | Yann | facile |
| `t-tuteur` | Te donner les consignes et suivre ton stage. | Erwan | facile |
| `t-planning` | Organiser l'heure de retour des camions. | Maëlys | moyen |
| `t-saisie` | Saisir dans l'ordinateur ce que l'entrepôt a reçu. | Maëlys | moyen |
| `t-decider` | Décider ce qu'on fait d'une palette abîmée. | Erwan | difficile |
| `t-ouvrir` | Préparer les engins avant l'arrivée du camion. | Yann | moyen |

Socle `{ facile: 1, moyen: 1, difficile: 1 }`, bonus `{ moyen: 1 }` ; `verifier` : 3 personnes différentes. (Répartition construite.)

### Banque `etapes` — « Dans l'ordre »

`e1930` création à Plabennec (bétail, matériaux) · `e1945` premiers primeurs · `e1989` plants de pommes de terre pour Germicopa · `e1993` groupe
Sofipel · `e2013` voitures neuves et d'occasion · `e2026` l'entrepôt et le stockage. **Tirage** : 4 étapes dont **toujours `e2026`** et au moins une
d'avant 1960 ; ordre de départ **mélangé et jamais déjà juste** (re-tirage sinon). Jalons : 1 par étape à son rang (poids 0,75 chacune).

### Banque `metiers` — « Ce que fait Pelleau »

| id | Travail | Métier | Difficulté |
|---|---|---|---|
| `m-rungis` | Livrer des primeurs à Rungis. | transporter des marchandises | facile |
| `m-concession` | Amener une voiture neuve à une concession. | transporter des véhicules | facile |
| `m-racks` | Garder 20 palettes de biscuits d'un client. | stocker des marchandises | facile |
| `m-plants` | Livrer des plants de pommes de terre, entre 4 et 8 °C. | transporter des marchandises | moyen |
| `m-accidente` | Amener une voiture accidentée au garage. | transporter des véhicules | moyen |
| `m-preparer` | Préparer la commande d'un client à partir de son stock. | stocker des marchandises | difficile |

Socle : 3 lignes, **3 métiers différents** ; bonus `{ difficile: 1 }` ou `moyen`.

### Banque `situations` — « Ce que je change »

| id | Situation | Juste | Pièges |
|---|---|---|---|
| `s-compter` | Tu comptes bien les cartons d'une palette qui arrive. | Le client sait exactement ce qu'il a en stock. | Le camion roule plus vite. · Rien ne change. |
| `s-adresse` | Tu ranges la palette à la bonne place du rack. | On la retrouve tout de suite le jour où le client la demande. | Le client paie moins. · Le rack est plus solide. |
| `s-signaler` | Tu signales un carton abîmé dès l'arrivée. | Pelleau peut prouver que le carton est arrivé abîmé. | Le carton se répare. · Loïc a une prime. |
| `s-engin` | Tu vérifies ton transpalette avant de t'en servir. | Personne ne se blesse avec un engin en panne. | Le transpalette va plus vite. · Le stock augmente. |

Socle : 2 tirées ; bonus : 1. Ordre des choix mélangé par élève.

**Accompagné** : carte au niveau accompagné (vue) ; fiches : contenu standard. **Consignes neutres** : aucune ne donne le nombre de lignes.

## 7. Demandes au moteur

Aucune. **À vérifier à l'état des lieux** : la fiche `ordre` (lot 4) avec départ tiré par élève (le départ « déclaré par le contenu » peut-il être une
fonction de la graine ?) — sinon départ fixe pour tous, **jamais juste**, et le dire.

### 7 bis. Séance déjà jouée par des élèves ?

Non.

## 8. Tests attendus

Bloc **`pelleau`** (nouveau : `outils/test/pelleau.mjs`, lignes `BLOCS` et `GROUPES`, alerte 7). Graines fixées, valeurs écrites à la main.

- Parcours juste → 20/20, bandeau 6 lignes ✓ ; inaction → 0/20 ; pire cas → premier bilan, `finFige`, « Corriger » rouvre les fiches, pas la carte.
- Carte : contrôles de `controlerLocaliser` verts ; Brest absent des `autres` de l'entrepôt.
- Histoire : 300 graines → `e2026` toujours là, départ jamais juste, inaction 0 ; une étape inversée → seuls ses jalons ✗.
- Qui est qui : 300 graines → 3 personnes ; Métiers : 3 métiers différents.
- Questions : D au bilan, A et B tout de suite, C non notée ; somme des poids 20 ; « Le droit » joint.
- Confirmé : bonus présents, bandeau identique, mot « bonus » absent. Écrans 1366 × 768.
- Sabotages : garde « départ jamais juste » retirée → un cas tombe ; garde « 3 personnes » retirée → le cas des 300 graines tombe.

## 9. Supports pour les élèves

- **Trame** (Cowork, après validation à l'écran) : page de connexion, brouillon de la frise, demi-page de cours (transporteur, entreposeur,
  prestataire, ramasse), noir et blanc.
- Corrigé : `contenus/corriges/ENT-10.1.js`.

## 10. Critères de validation par Tristan

- Le document « Pelleau en bref » se lit au vidéoprojecteur ; la carte se joue sans aide ; la mention « imaginé pour l'exercice » se voit.
- Aucun texte à taper ; 45 minutes suffisent.

## 11. Questions ouvertes (défaut entre parenthèses)

- [x] **Logo** : accordé par Tristan (18/10/2026, 22 h 03).
- [ ] Textes construits par Cowork, à relire à l'écran (messages, banques, retours).
- [ ] Question D (dépôt, Code civil) : notion juridique en CAP sans cours d'économie-droit (règle du 15/10 : « seulement si l'exercice en a besoin »).
  Ici elle prépare tout le contrôle de réception (ENT-10.5 à 10.12). (Défaut : gardée, au bilan.)

---

## Compte rendu *(rempli par Claude Code à la livraison)*

*(19/10/2026, lot C du chantier Pelleau, sous-agent Opus ; rien commité par le sous-agent : le chef relit et commite.)*

- **Fichiers créés** : `contenus/pelleau.js` (univers 10.x : identité, charte, `MENTION`, `heureScenario` (mai 2026), `LIEUX` du site, `PLAN_ENTREPOT`,
  `EQUIPE`, `mailDe`, `CLIENTS` au format de `MOTEUR-depose-par-client.md` §2, `PALETTE_AR_VAG` / `PALETTE_AGRI` / `PALETTE_KERVEGUEN`, `PHOTOS`,
  `LEXIQUE`, les cinq clés exigées, `STYLE_DOCUMENTS`, `PIED` (texte imposé), `pied`, `entete`, pictogrammes, `DOC_EQUIPE`, `DOC_PELLEAU`,
  `DOC_DROIT_DEPOT`, `DOC_DROIT_JEUNES`), `contenus/pelleau-ent101-donnees.js` (données pures : lieux de la carte, banques, tirage, équité — fichier
  en plus de la liste : le corrigé est chargé sous Node et ne peut pas importer le moteur, comme Action), `contenus/pelleau-ent101.js`,
  `activites/pelleau-se-situer.js`, `contenus/questions/ENT-10.1.js`, `contenus/corriges/ENT-10.1.js`, `outils/test/pelleau-101.mjs` (16 cas),
  `outils/test/pelleau/commun.mjs`. **Lignes ajoutées** : `activites/index.js` (commentaire, import, ligne `ENTREPRISES` n° 10, logo **PNG**),
  `outils/test.mjs` (`BLOCS`, `GROUPES` groupe 2), `outils/test/socle.mjs` (`ATTENDU_CAP`), `outils/test/tirage-niveaux.mjs` (`BANQUES_FIGEES`, et
  colonne « 10 / Transports Pelleau » des niveaux, deux listes allongées).
- **Poids codés** (ceux du §5) : Qui est qui ? 3 × 1 · carte 6 × 1 (région, département) · histoire 4 × 0,75 · ce que fait Pelleau 3 × 2/3 ·
  ce que je change 2 × 1 · questions `part: 4` (A 1, B 1,5, D 1,5 ; C réflexion). 18 jalons, 16 points + 4 = 20. Confirmé : 5 cas bonus cachés
  (Saint-Pol région et département, une tâche, un travail, une situation).
- **Écarts avec le brief** : (1) histoire notée **une étape à son rang** (§6 bis) et non « paires consécutives » (§5 se contredit) ; le départ ne
  place **aucune** étape à son rang (sinon envoyer sans rien toucher rapportait des points) ; le départ est tiré par élève (`blocs(db)` le permet,
  question du §7 : oui). (2) Rungis : Créteil (7,3 km du MIN) et Champigny (6,4 km de Vincennes) ne tiennent pas les 8 km → **Le Plessis-Trévise
  et Mandres-les-Roses** ; repère de Saint-Pol = Morlaix (Brest est un de ses « autres »). (3) **Photos** : pas de porteur ni de porte-voitures au
  dépôt (télécharger demande l'accord) : `img-semi` et `img-chariot` (photos d'Action) remplacent `img-porteur` et `img-porte-voitures`, ids gardés
  libres. (4) Situations sans difficulté dans le brief : toutes `facile` (socle 2, bonus 1). Travaux : socle 2 faciles + 1 moyen, bonus le difficile.
  (5) 200 essais de tirage (trois règles à tenir à la fois : 40 essais laissaient ~6 % d'élèves au jeu de secours). (6) Messages datés de **mai
  2026** (l'ouverture réelle), sans jour de la semaine. (7) `competences: []` (comme ENT-8.1), `reinitialisable: true` (règle des X.1).
- **Vérifié** : textes du Code civil 1927, 1928, 1932 et du Code du travail D4153-27, R4153-40, R4153-51 relus sur Légifrance le 19/10/2026
  (identifiants dans `contenus/pelleau.js`) ; positions OSM (Nominatim, 19/10/2026) ; couleur du logo #242d5b (pixels du PNG), contraste 11,63 sur le
  papier. **Approché** : l'entrepôt n'est pas dans OSM (point = lieu-dit Kergaradec), Plabennec et Saint-Pol = centres de commune. **Construit** : tout
  ce que dit `MENTION` ; distance « près de 600 km » non recoupée par Mappy.
- **Tests** : `pelleau-101` 16/16 (+ requêtes externes) ; `dependances`, `tirage-niveaux`, `questions` verts ; **`socle` : 1 cas tombe**
  (`socle.mjs:818`, « CAP-C1.1 : 10/20 (1/6) » attendu, 1/7 lu : ENT-10.1 est la septième séance CAP-C1.1). Recalage à faire par le chef (cas
  existant, interdit au lot) : `(1/6)` → `(1/7)` ligne 818 et `1 sur 6` → `1 sur 7` ligne 826, comme ENT-8.3 et 8.5 l'ont fait.
- **Sabotages joués** (et remis, fichiers comparés octet pour octet) : jalon « vrai par inaction » → cas inaction (7/20) et questions tombent ;
  `apres: 'bilan'` de D retiré → cas questions ; un « lundi » dans le message d'accueil → cas ouverture et parcours juste ; `finFige` retiré → pire
  cas ; jalon d'histoire toujours vrai → cas histoire, bilan détaillé, pire cas ; garde « départ sans étape à sa place » retirée → cas équité
  (et 4 autres, les graines changent) ; garde « 3 personnes » retirée → cas équité (et 2 autres). `pret: false` → cas déclaration.
- **À vérifier à l'écran par Tristan** : le bleu nuit du bandeau à côté du bleu « client » de Rungis sur la carte ; sur la carte de fin, Gouesnou
  et Plabennec (8 km) se recouvrent à l'échelle de la France (le point de l'entrepôt est sous celui de Plabennec ; la légende dit « magasin » pour le
  MIN, type du brief) ; les textes de Cowork (messages, banques, retours) ; « Pelleau en bref » au vidéoprojecteur ; le document « Le droit » (long
  pour un CAP : 1928 entier) ; la question D gardée (§11) ; les deux photos de remplacement.
