# Brief de séance — ENT-8.5 Action, évaluation : se situer dans un nouveau site (CAP OL, évaluation CAP-C1.1)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md puis docs/briefs/ENT-8.5-action-evaluation-se-situer.md et docs/briefs/ENT-8.6-action-evaluation-prise-de-poste.md en entier. Commence par la demande au moteur du §7 d'ENT-8.5 (vue Localiser en évaluation, lieux selon le tirage, même site dans les deux séances), puis ENT-8.5, puis ENT-8.6. Annonce la durée avant de commencer et dis-moi si un point des briefs contredit le code.
> ```

**Statut** : livré (16/10/2026, `pret: true, ouverture: 'prof'` ; à essayer à l’écran par Tristan)
**Date du brief** : 16/10/2026
**Conversation d'origine** : Cowork (Opus), 16/10/2026 au soir. **Tristan a délégué les décisions** (« fais le cadrage de la 8.5, prends les
décisions ») : toutes les décisions de ce brief sont de Cowork, listées au §11 pour que Tristan puisse en revenir. Fiche du projet :
`claude/prepalog-action-evaluation-c1.md`.
**Modèle** : **Opus** (la demande au moteur touche une vue ; séance nouvelle).
**Place dans l'ordre** : après ENT-8.1 à 8.4 (livrées). **ENT-8.6** (`docs/briefs/ENT-8.6-action-evaluation-prise-de-poste.md`) est sa jumelle,
même fiction, même site tiré.
**Durée estimée par Cowork** : demande au moteur ≈ 2 h (tests compris) ; ENT-8.5 ≈ 3 h (peu de contenu neuf : banques reprises d'ENT-8.1 et
8.3, deux sites à déclarer, tests d'équité).

---

## 0. Décision de forme : **deux évaluations, une par compétence**

Le cadrage du 15/10 prévoyait « l'évaluation C1.1 + C1.2 en janvier ». Elle devient **deux séances courtes**, jouées l'une après l'autre dans
le même créneau (≈ 30 + 35 min) ou à une semaine d'écart :

- **ENT-8.5 = évaluation CAP-C1.1** (se situer) ; **ENT-8.6 = évaluation CAP-C1.2** (prendre un poste).
- Raisons : la note du site porte sur **une** compétence (finalité, décision 2) et chaque compétence garde ses trois temps (guidage 8.1/8.2,
  entraînement 8.3/8.4, évaluation 8.5/8.6) ; une séance de 30 min tient mieux pour des CAP qui se perdent dans une séance longue (retours du
  16/10) ; un élève absent rattrape une seule partie.

## 0 bis. Règles de l'évaluation (CAP, communes à 8.5 et 8.6)

1. **Copie rendue** (`copie: true`, `copie: meta.copie`, `export const noter = (db) => moteur.noter(db)`) : rien ne remonte pendant le travail,
   une seule remise, note figée ; **aucun bilan, aucun « Corriger »**, rien à l'écran ne dit juste ou faux.
2. **Jeu neuf, tiré par élève** : un **site nouveau** tiré parmi deux (§2) — autre entrepôt, autre prestataire, autre magasin, autre tuteur ;
   à l'intérieur, les pièces tirées dans les banques. Deux voisins n'ont presque jamais le même jeu.
3. **Le même site dans 8.5 et 8.6** pour un même élève (la fiction continue le lendemain) : §7, point 3.
4. **Sans aide** : pas de mot cliquable (`lexique: {}`), pas d'indice, pas de question au fil. Les **pastilles d'étape « fait »** restent
   (jamais « juste » ; décision de Tristan pour ENT-7.4, reprise ici : elles aident à ne rien oublier sans rien souffler).
5. **« Avant de commencer » noté** (4 points) : les questions clés (★) des séances de travail, réécrites pour le site de l'élève, sans aide,
   « Je ne sais pas » ajouté par le moteur ; juste + 1, « Je ne sais pas » 0, fausse − 1 ÷ (nombre de mauvaises réponses), plancher 0.
6. **Un écran par étape** (§0 bis d'ENT-8.3) : document à gauche, consigne en haut de l'écran, écran suivant ouvert à l'envoi du précédent,
   barre « Étape suivante ».
7. **Ni bonus ni niveau** : socle tiré pour tous ; un élève « accompagné » joue la carte au niveau **standard** (le tiers-temps reste
   possible : `MOTEUR-tiers-temps`).
8. **Jamais un élève bloqué** : la carte continue à se jouer jusqu'au bon clic (la note porte sur le premier essai) ; tout écran peut être
   envoyé incomplet ; « Rendre ma copie » est toujours possible.
9. **Fiction** : **troisième stage**, dans un site qu'il ne connaît pas ; « lundi 11 janvier, 8 h » (8.5), « mardi 12 janvier, 6 h » (8.6),
   sans année. Le tuteur est nouveau (construit, un par site).
10. **Une erreur ne se paie qu'une fois** (règle de Tristan pour ENT-7.4, reprise) : quand un écran dépend d'un choix précédent de l'élève, il
    est jugé sur **ce que l'élève a fait** (ENT-8.6, compte rendu).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.5 (provisoire) |
| `id` (jamais modifié ensuite) | `action-evaluation-se-situer` |
| Titre / desc | « Action — évaluation : se situer dans un nouveau site » / « Situer un nouvel entrepôt, son magasin et le port, dire qui fait quoi, remettre dans l'ordre le chemin d'un produit et dire ce que change le travail de l'opérateur. » |
| Rubrique | simulog, entreprise n° 8 Action |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competences: []`, `competencesCap: ['CAP-C1.1']` (C1.1.1 à C1.1.4) ; ligne `'ENT-8.5': 'CAP-C1.1'` dans `ATTENDU_CAP` (**le dire à Tristan** : CAP-C1.1 comptera 6 séances, un cas du bloc `socle` est à recaler) |
| Temps pédagogique | `temps: 'evaluation'` (coefficient 3), `copie: true` |
| Notation | jalons pondérés, note sur 20, `bareme: 20` ; **pas** de `parcours` ni de `precedente` (comme ENT-7.4 : la séance s'ouvre quand l'enseignant la coche) |
| `questions` | `'ENT-8.5'` (ouverture seulement) |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : les deux sites tirés, vérifié et construit

| Pièce `site` | Entrepôt (vérifié) | Prestataire (vérifié) | Magasin (vérifié) | Tuteur (construit) |
|---|---|---|---|---|
| `onnaing` | **Onnaing (59, Hauts-de-France)**, le plus récent centre d'Action en France | **GXO** | **Action La Sentinelle** (59), zone du Vignoble, rue des Vignes, près de Valenciennes | **Karim, chef d'équipe réception** |
| `belleville` | **Belleville-en-Beaujolais (69, Auvergne-Rhône-Alpes)**, 60 000 m², livre le Sud-Est | **Kuehne+Nagel** | **Action Villefranche-sur-Saône** (69) | **Sandrine, cheffe d'équipe réception** |

- **Sources** : Onnaing, GXO : [GXO, 15/10/2026](https://www.globenewswire.com/news-release/2026/10/15/3381579/0/en/gxo-and-action-expand-partnership-in-france.html) ·
  Belleville, Kuehne+Nagel : [communiqué du 06/09/2023](https://www.faq-logistique.com/CP20230906-Kuehne+Nagel-Action-Prolongent-Collaboration-France.htm) ·
  La Sentinelle : [L'Observateur, 24/10/2025](https://www.lobservateur.fr/magasin-action-la-sentinelle-valenciennes/) (ouverture le 8/11/2025) ·
  Villefranche-sur-Saône : offre France Travail d'Action pour ce magasin ([n° 192BMMP](https://candidat.francetravail.fr/offres/recherche/detail/192BMMP),
  actualisée le 06/05/2025 ; **adresse non donnée** : point au centre de la commune). Hub d'import du Havre : comme ENT-8.1.
- **Construit (dit dans la séance)** : que **ce** site livre **ce** magasin ; le trajet Le Havre → entrepôt → magasin ; les tuteurs ; les
  situations ; les documents.
- Positions des points : OSM (La Sentinelle : la zone du Vignoble si un objet OSM la situe, sinon le centre de la commune ; Villefranche,
  Belleville, Onnaing : comme ENT-8.3), dites dans `MENTION`.
- Le magasin et l'entrepôt sont **dans le même département** pour les deux sites : c'est vrai sur le terrain (un entrepôt livre aussi ses
  voisins) ; la carte reste notée sur les trois lieux.

## 3. Objectif

Vérifier que l'élève **sait se situer seul dans un site qu'il n'a jamais vu** : placer l'entrepôt, le magasin et le port ; dire le rôle des
acteurs (Action, le prestataire, le magasin, le fournisseur, son lycée, son tuteur…) ; remettre dans l'ordre le chemin d'un produit et y
placer son poste ; relier un geste de l'opérateur à ce qui arrive au magasin. **La méthode, pas une réponse apprise** : autre site, autre
prestataire, autre magasin qu'en 8.1 et 8.3.

## 4. Déroulé (≈ 30 min, en classe, sous surveillance)

Écrans : **Avant de commencer (noté) → Carte de France → Qui est qui ? → La chaîne → Ce que je change → Rendre ma copie.**

### Accueil (message du tuteur, proposé)

« Bonjour {prénom}, bienvenue chez {prestataire} à {site} ! Je suis {tuteur}, {chef d'équipe / cheffe d'équipe} à la réception, ton tuteur
pour ce stage. Ici aussi, on travaille pour Action. Aujourd'hui, montre-moi que tu sais où tu es. {tuteur} »

### Étape 0 — Avant de commencer (noté, 4 points) — §4 ter

### Étape 1 — Carte de France (vue « Localiser », mode évaluation, §7)

- 3 lieux du site tiré, dans l'ordre : **l'entrepôt** → **le magasin** → **le port du Havre**. Région → département (notés, premier essai) →
  ville (non notée). Niveau standard pour tous.
- Consigne : « Retrouve où tu es, où va la marchandise et d'où elle arrive. »
- `fin` : le trajet fléché, « (Le trajet du Havre à {site}, puis au magasin de {ville}, est imaginé pour l'exercice.) » — **aucun mot qui dise
  juste ou faux**.

### Étape 2 — Qui est qui ? (une fiche)

- `liste` × 4 : **Action (fixe)** + 3 acteurs tirés (§6 bis) ; à chaque ligne, les 8 rôles (ordre fixe). Pas de document à gauche (en 8.3, le
  document donnait les exploitants ; ici, le prestataire est nommé par le tuteur et la question porte sur les **rôles**).
- Envoi : « Envoyer la fiche à {tuteur} » → accusé neutre (« Merci, c'est noté. »).

### Étape 3 — La chaîne (une fiche)

- Fiche `ordre` (comme ENT-8.1) : les 6 étapes du chemin d'un produit **pour son site** (§6.1), **départ mélangé par élève, jamais dans l'ordre
  juste** ; puis `liste` « Toi, tu travailles ici : … ».

### Étape 4 — Ce que je change (une fiche)

- 3 situations tirées (facile, moyenne, difficile), une `liste` chacune : « Au magasin de {ville}… » (4 choix).
- Envoi → message neutre du tuteur (« Merci {prénom}. Demain, 6 h, à la réception. ») ; « **Rendre ma copie** » (le dernier envoi rend la copie
  si c'est le comportement du moteur ; sinon le bouton du moteur).

## 4 bis. Questions au fil

**Aucune** (évaluation). Les questions clés sont à l'ouverture.

## 4 ter. Avant de commencer — noté (questions clés)

`ouverture: { part: 4, tirage: { preparation: 3, image: 1 } }`, personne : le tuteur du site. Reprises des ★ d'ENT-8.1 et ENT-8.3 et d'autres
questions de préparation, **réécrites pour le site** ; pièges des questions d'origine. Banque : 8 ≥ 2 × 3 ; 4 ≥ 2 × 1.

| id | Rubrique | Reprise de | Question (version du site) | Juste | Pièges |
|---|---|---|---|---|---|
| `k-vend` | preparation | 8.1 `action-vend` | Que vend surtout Action ? | des produits non alimentaires à petit prix | des voitures · des repas · des médicaments |
| `k-entrepot` | preparation | 8.1 `entrepot-sert` | L'entrepôt de {site} sert à… | stocker les produits puis préparer les commandes des magasins | vendre aux clients · fabriquer les produits |
| `k-chaine` | preparation | 8.1 `chaine` | Le chemin d'un produit, de l'usine jusqu'au client, s'appelle… | la chaîne logistique | le rayon · la caisse |
| `k-regions` | preparation | 8.1 `regions` | La France est découpée en régions, et chaque région en… | départements | villes seulement · pays |
| `k-memes` | preparation | 8.1 `action-memes` | Un produit vu dans un magasin Action à Lille, je le trouve aussi à {ville} ? | oui, ce sont les mêmes produits partout | non, chaque magasin choisit · seulement à Paris |
| `k-ouverture` | preparation | 8.3 `ouverture` | Avant qu'un nouveau magasin Action ouvre, il faut… | le remplir avec des produits livrés par l'entrepôt | attendre les clients · fabriquer les produits |
| `k-port` | preparation | 8.1 `port-sert` | Un port comme Le Havre sert à… | décharger les bateaux venus de loin | stocker l'essence · vendre les produits |
| `k-tuteur` | preparation | 8.3 `tuteur` | {tuteur}, ton tuteur de stage, c'est… | la personne de l'entreprise qui te guide | ton professeur · le directeur d'Action |
| `k-img-semi` | image | 8.1 `img-semi` | photo `semi` : « Ce véhicule sert à… » | transporter les palettes de l'entrepôt aux magasins | ranger les palettes · décharger les bateaux |
| `k-img-palette` | image | 8.1 `img-palette` | photo `palette` : « Pourquoi ces cartons sont-ils filmés ? » | pour qu'ils ne tombent pas pendant le transport | pour les décorer · pour les peser |
| `k-img-rack` | image | 8.1 `img-rack` | photo `entrepot` : « Ces grandes étagères s'appellent… » | des racks (palettiers) | des quais · des rayons de magasin |
| `k-img-planchers` | image | 8.3 P | dessin de la remorque : « Deux planchers, ça sert à… » | mettre plus de palettes par camion, donc faire moins de trajets | la rendre plus solide · séparer deux magasins |

- **Écartées** (elles donneraient une ligne de « Qui est qui ? ») : « {prestataire} est un prestataire logistique », « pour {prestataire}, Action
  est un client » (question A), « Action peut changer de prestataire » (question L), le code postal (69 = le département de Belleville). Le
  tuteur n'est donc **pas** un acteur tiré de « Qui est qui ? » (`k-tuteur` donne son rôle). Vérifier en construisant qu'aucune autre question
  ne donne une case ; `k-img-palette` touche une situation (`s-film`) sans en dire la conséquence au magasin :
  si `s-film` est tirée chez l'élève, exclure `k-img-palette` de son tirage (`verifier`).

## 5. Jalons / notation (sur 20) — **poids décidés par Cowork** (délégation du 16/10, §11)

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Avant de commencer** | 4 questions | **4** (`part: 4`) | ouverture | — |
| **La carte de France** | région et département × 3 lieux, 0,75 chacun | **4,5** | `etapesLocaliser` (premier essai) | l'étape ville ne compte pas |
| **Qui est qui ?** | 4 rôles, 1 chacun | **4** | fiche `qui` | la banque garantit 4 rôles justes **différents** (sinon un rôle partout rapporte) ; « Action » fixe |
| **La chaîne** | les 3 premières dans l'ordre 1,25 ; les 3 dernières dans l'ordre 1,25 ; sa place 1 | **3,5** | fiche `chaine` | « les 3 premières » = positions 1 à 3 tiennent exactement les étapes 1, 2, 3 dans l'ordre (idem 4 à 6) ; départ jamais juste, donc rien pour l'inaction |
| **Ce que je change** | facile 1 ; moyenne 1,5 ; difficile 1,5 | **4** | fiche `change` | « Rien ne change » partout = 0 |
| **Total** | | **20** | | |

- Pourquoi ce partage : chaque sous-compétence pèse : C1.1.3 se situer (carte 4,5 + chaîne 3,5 = 8), C1.1.1 / C1.1.2 types d'organisation et
  environnement (rôles 4 + questions clés 4), C1.1.4 contribution de l'opérateur (4). Aucune forme à noter (pas de message à écrire).
- La chaîne est **partagée en deux moitiés** (au lieu du tout-ou-rien d'ENT-8.1, 2,5 sur l'ordre entier) : en évaluation, une seule inversion
  ne doit pas coûter tout le bloc.
- Fiche envoyée incomplète : les lignes vides sont fausses ; non envoyée à la remise : faux.

## 6. Contenu (données)

- `contenus/action-ent85-donnees.js` (sites, banques, tirage, équité) et `contenus/action-ent85.js` ; **les deux sites et leurs tuteurs dans
  un module partagé avec ENT-8.6** (par exemple `contenus/action-eval-sites.js`) ; `contenus/questions/ENT-8.5.js` ;
  `activites/action-evaluation-se-situer.js` ; `contenus/corriges/ENT-8.5.js` (`corrigeEleve` : son site, ses acteurs, ses situations, les
  réponses).
- `contenus/action.js` : ajouter les lieux `LIEU_BELLEVILLE`, `LIEU_VILLEFRANCHE`, `LIEU_LA_SENTINELLE` (Onnaing existe : `LIEU_ONNAING`) **sans
  toucher** aux lieux d'ENT-8.1 et 8.3. Villes « autres » de l'étape ville : centres de communes voisines (OSM).

### 6.1 La chaîne du site (6 étapes)

1 Une usine en Asie fabrique le produit · 2 Un porte-conteneurs le transporte · 3 Le port du Havre le reçoit · 4 L'entrepôt {prestataire} de
{site} le stocke et le prépare · 5 Le magasin Action de {ville} le vend · 6 Le client l'achète. « Toi, tu travailles ici » : la 4.

## 6 bis. Tirage

### Banque `site` (pièce de tout le jeu) — `onnaing`, `belleville` (§2), une tirée par élève, même pièce dans ENT-8.6 (§7, point 3)

Équité : les deux sites ont la même structure (3 lieux, 6 étapes, mêmes banques) ; seule change la carte. Contrôle : répartition 40-60 % sur 200
graines.

### Banque `acteurs` — « Qui est qui ? »

| id | Acteur | Rôle juste | Difficulté |
|---|---|---|---|
| `action` (fixe) | Action | possède les produits et choisit qui les stocke | — |
| `prestataire` | {prestataire} | stocke et prépare les commandes pour Action | facile |
| `magasin` | Le magasin Action de {ville} | vend les produits aux clients | facile |
| `client` | Le client du magasin | achète les produits au magasin | moyen |
| `lycee` | Ton lycée | t'envoie en stage et suit ta formation | moyen |
| `fournisseur` | Un fournisseur | fabrique les produits qu'Action achète | difficile |
| `transporteur` | Le transporteur | emmène les palettes de l'entrepôt au magasin | difficile |

- 8 rôles offerts à chaque ligne : les 7 rôles justes ci-dessus + « te guide pendant ton stage » (piège). Socle : Action + `{ facile: 1, moyen: 1, difficile: 1 }`. Ordre des lignes
  mélangé ; `titreBilan` (corrigé et Suivi) : le nom de l'acteur.

### Banque `situations` — « Ce que je change »

Les 8 situations d'ENT-8.3 (§6 bis de son brief) et celles d'ENT-8.1, **réécrites pour le magasin de l'élève** (« au magasin de {ville} »), avec
leurs difficultés. Socle `{ facile: 1, moyen: 1, difficile: 1 }`. Choix : le juste, ses 2 pièges, « Rien ne change au magasin ». Un élève peut
retrouver une situation déjà vue en 8.1 ou 8.3 : accepté (la conséquence se raisonne, elle ne s'apprend pas par cœur) ; `s-etiquette` dit
« Nîmes » en 8.3 : ici, l'étiquette fausse porte **un autre magasin du réseau** que le sien (Nîmes pour Belleville, Roques pour Onnaing).

### Le reste

Chaîne : pièce fixe par site, départ mélangé par élève (jamais juste). Ouverture : tirage du §4 ter. **Ni bonus ni niveau.**

## 7. Demande au moteur (un chantier, **avant** ENT-8.5)

1. **Vue Localiser en évaluation** (§11 n° 1 du brief `MOTEUR-vue-localiser.md`, tranché ici) : la vue **accepte** une séance `copie` ; elle y
   force le niveau **standard** (quel que soit `db.aisance`), ignore les lieux `bonus`, garde le geste « on recommence jusqu'à trouver » **et
   l'aide après 2 erreurs** (sinon un élève resterait bloqué ; la note porte sur le premier essai, l'aide ne rapporte rien), ne publie rien au
   Suivi avant la remise, et ne montre ni « Corriger » ni phrase « juste ». Le repérage (erreurs par lieu) reste pour l'enseignant après la
   remise.
2. **Lieux selon le tirage** : `localiser.lieux` (et `flux`) acceptent une fonction `(db) => …` (le site tiré de l'élève), comme
   `fiche.blocs`. **Repli** si c'est plus coûteux : deux vues Localiser déclarées, une par site, l'autre fermée (`fermetures`) — le dire.
3. **Même site dans ENT-8.5 et ENT-8.6** : la pièce `site` est tirée avec une graine **qui ne dépend que de l'élève** (pas de la séance), dans
   le module partagé. Si le tirage du moteur ne le permet pas, le contenu calcule la pièce depuis l'identifiant de l'élève (fonction pure,
   même résultat dans les deux séances) ; jamais de base partagée (`jeuId`) entre les deux.
4. Tests du chantier (bloc `localiser`) : séance `copie` acceptée ; un élève « confirmé » n'a pas de lieu bonus ; un « accompagné » voit le
   niveau standard ; 2 erreurs → l'aide s'affiche et la région reste fausse au premier essai ; ENT-8.1 et 8.3 **inchangées** (blocs `action-81`,
   `action-83` verts).

### 7 bis. Séance déjà jouée ?

Non : séance nouvelle. Le chantier moteur ne change rien aux séances de travail (vérifié par leurs blocs).

## 8. Tests attendus

Bloc nouveau `outils/test/action-85.mjs` (une ligne dans `BLOCS` et `GROUPES` : **le dire à Tristan**). Graines choisies, valeurs à la main.

- **Deux témoins** (un par site) : parcours juste 20/20 ; le parcours de l'un joué par l'autre (carte, rôles) < 20.
- Répartition des sites 40-60 % sur 200 graines ; **même site** que dans ENT-8.6 pour 50 élèves.
- Inaction : 0 (ouverture sans réponse = 0 ; chaîne non envoyée = 0).
- Ouverture : 4 justes = 4 ; 3 justes + 1 « Je ne sais pas » = 3 ; 3 justes + 1 fausse = 3 − 1 ÷ (nombre de pièges) ; plancher 0.
- Carte : une erreur de région au premier essai → 0,75 perdu, l'élève finit ; aucune phrase « juste » ni « faux » à l'écran.
- Chaîne : une inversion entre 5 et 6 → 1,25 perdu seulement ; départ laissé tel quel → 0 sur l'ordre.
- Qui est qui : un même rôle partout → 1/4 au plus.
- Aucune correction affichée ; `noter(db)` = la note du Suivi après remise ; rien n'est remonté avant.
- Sabotages : le niveau de l'élève lu au lieu du standard → le cas « accompagné » tombe ; site tiré avec la graine de la séance → le cas « même
  site » tombe.

## 9. Supports

Pas de trame (évaluation). **Fiche enseignant** d'une page pour les deux évaluations (Cowork, après validation à l'écran) : déroulé, durées,
ce qui est évalué par sous-compétence, les deux sites. Corrigé par élève dans l'onglet Corrigés.

## 10. Critères de validation par Tristan

- Deux élèves voisins n'ont pas la même carte (un site chacun, une fois sur deux).
- Rien à l'écran ne dit juste ou faux ; aucun mot cliquable.
- Un élève CAP la finit en 30 minutes ; il ne change d'écran qu'entre deux étapes.

## 11. Décisions prises par Cowork (délégation de Tristan, 16/10/2026) — à revoir s'il le souhaite

1. Deux évaluations (8.5 = C1.1, 8.6 = C1.2) au lieu d'une (§0).
2. Deux sites tirés par élève : Onnaing / GXO / La Sentinelle et Belleville / Kuehne+Nagel / Villefranche-sur-Saône ; même site dans 8.5 et 8.6.
3. Fiction : troisième stage, 11 et 12 janvier, tuteurs Karim et Sandrine (construits).
4. « Avant de commencer » noté à 4 points, tirage 3 + 1, reprises des questions de préparation ; A, L et « prestataire » écartées (elles donneraient « Qui est qui ? »).
5. Carte en évaluation : niveau standard pour tous, aide après 2 erreurs gardée, note au premier essai.
6. Poids du §5 (carte 4,5 · rôles 4 · chaîne 3,5 en deux moitiés + sa place · situations 4 · ouverture 4).
7. Pas de document « réseau » à gauche de « Qui est qui ? » (il donnerait les réponses).
8. Pastilles « fait » gardées ; pas de `parcours` (ouverture par l'enseignant).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
  - créés : `contenus/action-eval-sites.js` (module PARTAGÉ avec ENT-8.6 : les deux sites, `siteDe(uid)`, `uidDeBase`, `siteDeBase`,
    `remplir`), `contenus/action-ent85-donnees.js`, `contenus/action-ent85.js`, `contenus/questions/ENT-8.5.js`, `contenus/corriges/ENT-8.5.js`,
    `activites/action-evaluation-se-situer.js`, `outils/test/action-85.mjs` (bloc nouveau, 17 cas) ;
  - modifiés (ajouts seulement) : `contenus/action.js` (`LIEU_BELLEVILLE`, `LIEU_VILLEFRANCHE`, `LIEU_LA_SENTINELLE` ; rien d’autre ne bouge),
    `activites/index.js` (une ligne), `outils/test.mjs` (`action-85` dans `BLOCS` et dans le groupe 4 de `GROUPES`, celui qui a le moins de
    blocs), `outils/test/socle.mjs` (ligne `'ENT-8.5': 'CAP-C1.1'` dans `ATTENDU_CAP` ; **cas CAP-C1.1 recalé : 6 séances, « 1/6 » et
    « 1 sur 6 »**), `outils/test/tirage-niveaux.mjs` (banques d’ENT-8.5 dans `BANQUES_FIGEES`). Rien dans `core/` ni `styles/`.
  - Séance livrée en `pret: true, ouverture: 'prof'`, `copie: true`, `noter`, sans `parcours` ni `precedente`, `code: 'ENT-8.5'` (après ENT-8.4).
- **Écarts par rapport au brief** (et pourquoi) :
  1. **Questions d’ouverture « réécrites pour le site »** : impossible sans le moteur (une question d’ouverture n’a que `variante`, qui reçoit
     un tirage au hasard, pas la base de l’élève ; `selon` y est refusé ; `de` est une personne fixe). Énoncés neutres : « L’entrepôt où tu
     fais ce stage sert à… », « … dans le magasin que ton entrepôt livre ? », « Ton tuteur de stage, c’est… » ; la personne s’appelle
     « Ton tuteur ». Le site de l’élève est écrit dans le document de gauche « Ton stage » (calculé sur sa base : prestataire, site,
     département, tuteur, sans aucun rôle). → demande au moteur ci-dessous.
  2. **`k-img-palette` mise de côté** (`actif: false`, toujours déclarée) : le brief voulait l’exclure du tirage d’un élève qui a `s-film`,
     or le tirage d’ouverture ne voit pas celui de la séance. Banque d’images : 3 actives (≥ 2 × 1).
  3. **Barre « Étape suivante »** : le moteur ne la montre jamais en évaluation (`copie`). L’élève avance par le message du tuteur (carte
     « Nouveau message » → « Ouvrir la fiche »), le menu (ordonné par `suite`, fiches grisées « Après … ») et les pastilles « fait ».
     « Qui est qui ? » n’apparaît au menu qu’après un redessin (limite connue, ENT-8.3) : le message y mène.
  4. **Textes fixes du moteur** (sous-titre et bouton d’une fiche, bandeau) : ils ne connaissent pas le site → « Envoyer la fiche à ton
     tuteur », bandeau « Un nouvel entrepôt d’Action ». Le site, le magasin et le prestataire sont dans les blocs, les messages, la carte.
  5. **Situations reprises d’ENT-8.1** (`s-retard`, `s-camion`, `s-scan`) : mises au format d’ENT-8.3 (juste + 2 pièges + « Rien ne change au
     magasin ») ; second piège = leur « Rien : … » d’ENT-8.1 (clés renommées `attend`, `memes`, `labas`). `s-chute` et `s-abime` d’ENT-8.1 ne
     sont pas reprises (doublons de `s-film` et `s-reserve`). Banque : 3 faciles, 5 moyennes, 3 difficiles.
  6. **Position de Villefranche-sur-Saône** : le brief disait « centre de la commune » faute d’adresse ; OpenStreetMap a un magasin « Action »
     dans la commune (chemin 136805547, Port de Beauregard) : il est pris (RELEVÉ ; que ce soit le magasin de l’offre France Travail est
     SUPPOSÉ, seul Action de la commune dans OSM le 16/10/2026). La Sentinelle : la ZAC du Vignoble (chemin OSM 1370095358), APPROCHÉE.
- **Décisions prises en route** :
  - Site = `siteDe(uid)` (hachage de « uid|action-evaluation-site », sans id de séance) ; l’uid est relu dans la base par `uidDeBase(db,
    idSeance)` = la graine du tirage de la séance sans son « |<séance> » (le moteur ne pose pas `db.tirage` quand une séance déclare un
    `TIRAGE`). Base vide : Onnaing. Répartition : 100 Onnaing sur 200 graines.
  - Paires de situations jamais tirées ensemble (elles se soufflent) : `s-etiquette` + `s-camion`, `s-ordre` + `s-retard`.
  - Départ de la chaîne : re-tiré tant qu’une MOITIÉ est juste (pas seulement l’ordre entier) : envoyer sans toucher = 0 sur l’ordre.
  - Les 8 rôles dans un ordre fixe (vend, guide, possède, forme, fabrique, emmène, stocke, achète) ; le `role` des lieux de la carte est neutre
    (« L’entrepôt où tu fais ton stage. ») : l’ancien « X y stocke et prépare… » aurait donné la ligne du prestataire.
  - Titres des jalons de carte sans nom de site (« La carte : L’entrepôt — la région, du premier coup »), le Suivi est le même pour les deux.
  - « ton tuteur » / « ta tutrice » selon le site ; « l’entrepôt d’Onnaing » (élision, `{de-site}`).
  - Toutes les fiches partent incomplètes (`envoi.incomplet`) : une ligne vide est fausse.
- **Textes à relire à l’écran** (construits par Claude Code, pas par Cowork) : les messages d’étape du tuteur (« Merci, c’est noté.
  Maintenant, dis-moi le rôle de chaque acteur. », « … remets dans l’ordre le chemin d’un produit, et dis-moi où tu travailles. », « …
  Dernière chose : ce que tu fais ici se voit au magasin de {ville}… ») ; sous-titres des fiches ; consigne de l’ordre ; titre et texte de fin
  de carte (« Le chemin des produits vers {ville} » + phrase sur les points approchés) ; les indices de la carte (Onnaing « Tout près de
  Valenciennes, à l’est, vers la Belgique. », La Sentinelle « Tout près de Valenciennes, à l’ouest de la ville. », Belleville « Au nord du
  département, près de la Saône, entre Lyon et Mâcon. », Villefranche « Au nord de Lyon, au bord de la Saône. ») ; le document « Ton stage » ;
  la `situation` d’ouverture ; les retours des questions (jamais montrés en évaluation) ; l’accueil et `MENTION`. Textes de Cowork repris
  tels quels : accueil du tuteur, message de fin, rôles, chaîne, situations, questions (sauf l’écart n° 1).
- **Points d’attention pour Tristan** : `k-entrepot` (« stocker puis préparer les commandes ») ressemble au rôle du prestataire, et
  `k-img-semi` (« transporter les palettes de l’entrepôt aux magasins ») au rôle du transporteur : gardées (choix de Cowork ; la réponse
  n’est jamais corrigée à l’écran), à trancher.
- **Tests** : bloc `action-85`, 17 cas, vert (≈ 3 min 30). Valeurs écrites à la main pour deux témoins (a85-a Onnaing, a85-b Belleville) :
  20/20 à l’écran et à la remise (= `noter(db)`), rien remonté avant ; l’un joué par l’autre 13/20 ; inaction 0 ; ouverture 4 / 3 / 2,5 / 0 / 0 ;
  carte une erreur → − 0,75, aide après deux erreurs, aucun mot qui juge ; chaîne inversion 5-6 → − 1,25, départ tel quel → − 2,5, non envoyée
  → 0 ; un même rôle partout ≤ 1/4 ; « Rien ne change » partout → 0 ; équité 300 graines ; même site qu’ENT-8.6 pour 50 élèves ; contrôle de la
  carte des deux sites ; 1366 × 768 ; corrigé. **Éprouvés dans les deux sens** (sabotages posés puis retirés, `core/` revenu à l’identique) :
  niveau de l’élève lu au lieu du standard en évaluation → le cas « accompagné ou confirmé » tombe ; site tiré avec la graine de la séance →
  le cas « même site » tombe ; règle des moitiés retirée → le cas d’équité tombe ; jalon « fin » qui lit le début → le cas de la chaîne tombe.
  Blocs voisins : voir le compte rendu du chef de chantier.
- **Commits** : aucun (le chef de chantier commite par nom).
- **Reste ouvert** :
  - **Demande au moteur** (un chantier à part) : écrire le site de l’élève dans une question d’ouverture (`variante(hasard, db)` ou `selon`
    accepté à l’ouverture) et dans le nom de la personne / la `situation` ; laisser une séance exclure une question d’ouverture selon son
    tirage (`k-img-palette` / `s-film`) ; une barre « Étape suivante » en évaluation (sans rien juger) ; `sousTitre` et `envoi.bouton` d’une
    fiche en fonction de la base.
  - ENT-8.6 réutilise `contenus/action-eval-sites.js` : `siteDeBase(db, 'action-evaluation-prise-de-poste')`, `SITES[x].tuteur`
    (prénom, fonction, mot, mail), `prestataire`, `site`, `deSite`, `ville`, `magasin`, `autreMagasin`, `remplir`.
  - Fiche enseignant (Cowork) après validation à l’écran.
