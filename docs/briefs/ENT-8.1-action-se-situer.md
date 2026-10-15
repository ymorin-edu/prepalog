# Brief de séance — ENT-8.1 Action — d'où viennent les produits du magasin de Nîmes ? (CAP OL, guidage CAP-C1.1)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md puis docs/briefs/ENT-8.1-action-se-situer.md en entier. Vérifie d'abord que la vue « Localiser » (docs/briefs/MOTEUR-vue-localiser.md) est livrée. ENT-8.1 crée l'univers commun contenus/action.js et l'entreprise n° 8 : récupère le logo d'Action par script (alerte 10) et lis sa licence avant de l'ajouter. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : livré (15/10/2026, `pret: true, ouverture: 'prof'` : Tristan l'essaie à l'écran et l'ouvre lui-même à son groupe)
**Date du brief** : 15/10/2026
**Conversation d'origine** : Cowork (Opus), cadrage d'Action du 15/10/2026 — fiches du projet `claude/prepalog-action-cadrage.md` et
`claude/prepalog-action-deroule-8.1-8.2.md` (décisions de Tristan de 19 h 09 à 19 h 20).
**Modèle** : **Opus** (séance nouvelle de bout en bout, première séance d'une entreprise nouvelle).
**Place dans l'ordre** : après `MOTEUR-vue-localiser.md` (la vue doit exister). ENT-8.2 suit.
**Durée estimée par Cowork** : ≈ 5 à 6 h (univers commun, logo, trois fiches et leurs banques, la carte, questions et ouverture, photos
libres, tests du pire cas et du tirage). Rien n'a été essayé dans le site, hors la maquette de la carte.
**Calendrier de Tristan** (repère, pas une contrainte de conception, décision 8) : guidages C1.1 (cette séance) et C1.2 (ENT-8.2) **avant la
PFMP du 23/11/2026**.

---

## 0. Règles communes à Action (CAP OL)

1. **Public CAP** : **une consigne par écran, 3 lignes au plus**, découverte par l'image, **réponses en cliquant** (aucune saisie de texte).
   Un collègue est au **tu**, une personne extérieure au **vous**. `desc` à l'infinitif.
2. **Statut de l'élève dans la fiction** : **stagiaire en PFMP chez Geodis**, sur le site d'Ensuès-la-Redonne qui travaille pour Action
   (décision 12). Sa tutrice : **Samia, cheffe d'équipe réception** ; collègues **Kevin** (cariste) et **Julie** (agent administratif) :
   prénoms **construits**.
3. **Aucune année dans la fiction** : ENT-8.1 = « lundi 8 novembre, 8 h » ; ENT-8.2 = « mardi 9 novembre, 6 h ».
4. **« Avant de commencer » en CAP** (règle de Tristan, 15/10) : les CAP n'ont **pas de cours d'économie-droit** → les questions d'ouverture
   portent sur les **notions utiles au scénario** ; une notion juridique ou économique n'y entre que si l'exercice en a besoin.
5. **Notation** : jalons pondérés sur 20, questions au fil **4 points**, `parcours: true`, `correction: true`, bandeau ✓ / ✗ par bloc sans
   jamais donner la réponse ; « Corriger » rouvre les fiches fausses, jamais une question ni la carte (premier essai).
6. **Jamais un élève bloqué** : ENT-8.2 s'ouvre au premier bilan, justes ou faux. Anti-inaction : rien fait = 0.
7. **Tirage et niveaux** : pièce fixe + banque, niveaux standard / confirmé (bonus caché) / **Accompagné** (prévu pour la carte seulement ;
   les fiches gardent le contenu standard).
8. **Ce qui est construit se dit dans la séance** (texte de fin de la carte, pied des documents) : les personnages et leurs prénoms, le trajet
   Le Havre → Ensuès → Nîmes, le fait qu'Ensuès livre ce magasin, les documents.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.1 (première séance d'Action) |
| `id` (jamais modifié ensuite) | `action-se-situer` |
| Titre / desc | « Action — d'où viennent les produits du magasin de Nîmes ? » / « Situer l'entrepôt, le magasin et le port sur la carte de France, reconnaître qui fait quoi dans la chaîne d'Action et ce que change le travail de l'opérateur. » |
| Rubrique | simulog, **entreprise n° 8 Action** (ligne `ENTREPRISES` à créer : numéro 8, nom « Action », métier « commerce à petits prix — entrepôt Geodis d'Ensuès-la-Redonne », logo dans `contenus/trames/logos/`) |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competencesCap: ['CAP-C1.1']` (« Se situer dans un environnement professionnel spécifique ») ; sous-compétences visées : C1.1.1 types d'organisation · C1.1.2 environnement économique · C1.1.3 se situer dans l'organisation et la supply chain · C1.1.4 contribution de l'opérateur. `competences` (Bac Pro) : voir §11 n° 1. **Une ligne à ajouter** à la liste des séances CAP du socle (`outils/test/socle.mjs`, règle de `MOTEUR-cap-ol.md`) : le dire. |
| Temps pédagogique | `temps: 'guidage'` (coefficient 1) |
| Notation | jalons pondérés, note sur 20, `parcours: true`, `correction: true`, première séance du parcours (pas de `precedente`) |
| Barème | `bareme: 20` |
| Niveaux d'élève | `niveauxPrevus: ['confirme', 'accompagne']` (si le moteur refuse encore `'accompagne'`, le dire : voir §7.2) |
| `questions` | `'ENT-8.1'` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

- **Vérifié** (Cowork, sources dans la fiche du projet `claude/prepalog-action-recherche.md`, et le 15/10/2026 au soir) :
  - Action, enseigne néerlandaise de magasins à petits prix fondée en 1993, siège à Zwaagdijk-Oost, **détenue en majorité par le fonds 3i**
    (65,4 % en mars 2026, [Wikipédia](https://en.wikipedia.org/wiki/Action_(store))) ; ≈ 6 000 produits, **les mêmes dans tous les magasins**.
  - L'**entrepôt Action d'Ensuès-la-Redonne** (Bouches-du-Rhône) est exploité par **Geodis** (55 000 m², il livre les magasins du Sud-Est).
    Geodis est une **filiale de la SNCF** ([Le Journal des entreprises](https://www.lejournaldesentreprises.com/article/filiale-de-la-sncf-geodis-annonce-avoir-finalise-lacquisition-des-transports-normands-malherbe-2140134)).
  - **Hub d'import d'Action à Gonfreville-l'Orcher** (port du Havre, Seine-Maritime) : réel, **titre d'une actualité d'Action seulement** (le
    corps de la page n'a pas pu être lu). Rien ne relie Action au port de Marseille-Fos.
  - Les **6 entrepôts Action en France** : Ensuès-la-Redonne, Moissy-Cramayel, Labastide-Saint-Pierre, Belleville-en-Beaujolais,
    Verrières-en-Anjou, Onnaing (maquette de la carte, cadrage).
  - Magasins de Nîmes en 2022 : Cap Costières, Marché Gare, 7 Collines (presse locale). **Magasin client = Action Nîmes Cap Costières**
    (place André Bazile, 30900 Nîmes).
  - Métiers recrutés à Ensuès (opérateurs, caristes, inventoristes, chefs d'équipe, contrôleurs, agents administratifs).
- **Construit (à dire dans la séance)** : Samia, Kevin, Julie et leurs fonctions ; **le trajet Le Havre → Ensuès → Nîmes** ; **le fait
  qu'Ensuès livre le magasin de Cap Costières** ; le document « Action et Geodis en bref » (mise en forme, choix des faits) ; les situations de
  « Ce que je change ».
- **Logo d'Action** : **accord de Tristan** (bandeau, trame). À **récupérer par Claude Code, par script** (alerte 10 : lire, écrire, relire et
  redécoder, empreinte), depuis Wikimedia Commons : `https://upload.wikimedia.org/wikipedia/commons/d/d0/Action_(store)_logo.svg` (page
  « File:Action (store) logo.svg » ; autre version : `…/4/45/Action_Nederland_Logo_2020.svg`). **Lire la licence sur la page avant de
  l'ajouter** (Cowork n'a pas pu l'ouvrir le 15/10) ; ligne dans `CREDITS.md`. **Charte** : relever la couleur du logo ; si elle est rouge ou
  verte, règle des chartes rouges ou vertes (le moteur remplace l'accent par l'encre dans la zone de travail) ; vérifier que l'accent ne se
  confond ni avec le vert « juste » ni avec le **bleu « client »** de la carte.
- **Photos** : **libres** (Pexels / Unsplash), **aucune d'Action ni de Geodis, aucun visage**, mention sous chaque photo (« Photo d'un autre
  entrepôt »…), ligne dans `CREDITS.md`, récupérées par script (alerte 10), rangées dans `contenus/action/`.
- **Documents reconstitués** : pied « Document pédagogique — reconstitution, non contractuel ».

## 3. Objectif pédagogique

À la fin, l'élève sait dire **pour qui il travaille** (Geodis, prestataire, pour Action, son client), **où se trouvent** le port, l'entrepôt et
le magasin sur la carte de France, **remettre en ordre le chemin d'un produit** de l'usine au client et **s'y placer**, et dire **ce que son
travail change au magasin**. C'est le premier temps (guidage) de CAP-C1.1 ; ENT-8.2 (le lendemain) fait le guidage de CAP-C1.2 (prendre un
poste). L'entraînement et l'évaluation de C1.1 et C1.2 viendront après la PFMP (séances à écrire, décision 6).

## 4. Déroulé (≈ 45 min)

**Date du scénario : lundi 8 novembre, 8 h** (premier jour de PFMP chez Geodis à Ensuès-la-Redonne).

### Étape 0 — Avant de commencer (non notée, Samia) — voir §4 ter

### Étape 1 — « Qui est qui ? »

- **Message de Samia** (3 blocs, texte proposé) : « Bonjour {prénom}, bienvenue chez Geodis à Ensuès ! Je suis Samia, cheffe d'équipe à la
  réception, et ta tutrice pendant ton stage. / Ici, on travaille pour Action. Lis le document « Action et Geodis en bref ». / Puis
  complète la fiche « Qui est qui ? » et renvoie-la-moi. Samia »
- **Document joint « Action et Geodis en bref »** (6 lignes, une image par bloc : le logo d'Action, une photo libre d'entrepôt, une photo
  libre de rayon de magasin sans enseigne lisible). Texte proposé, à relire à l'écran :
  1. Action est une entreprise de magasins à petits prix. Elle vend des produits pour la maison, la déco, le bricolage, l'hygiène…
  2. Il y a des magasins Action dans toute la France. On y trouve les mêmes produits partout.
  3. Les produits sont fabriqués par des fournisseurs, souvent en Asie.
  4. Pour remplir ses magasins, Action a des entrepôts. L'entrepôt d'Ensuès-la-Redonne, près de Marseille, livre les magasins du Sud-Est.
  5. Ce n'est pas Action qui fait tourner cet entrepôt : c'est **Geodis**, une entreprise de logistique. Les produits restent à Action.
  6. Geodis appartient au groupe SNCF. Action appartient surtout à un fonds d'investissement.
  - Pied : « Document pédagogique — reconstitution d'après des informations publiques, non contractuel. »
- **Fiche « Qui est qui ? »** (`liste` × 4 tirées, §6 bis) : « Pour chaque acteur, choisis ce qu'il fait. » Chaque ligne offre **les
  7 rôles** (ordre mélangé par élève) :

  | Rôle (choix de la liste) | Acteur qui le tient |
  |---|---|
  | stocke et prépare les commandes des magasins | Geodis |
  | possède les magasins et choisit les produits à vendre | Action |
  | vend les produits aux clients | le magasin Action de Nîmes |
  | fabrique les produits | un fournisseur |
  | achète les produits au magasin | le client du magasin |
  | t'envoie en stage et suit ta formation | ton lycée |
  | amène les marchandises en camion | le transporteur |

- Envoi : « Envoyer la fiche à Samia » (confirmation dans la page). Rien n'est jugé avant l'envoi ; fiche figée ensuite.
- **Point d'étape** (`apresFiche('qui')`, question A, §4 bis), qui **ferme la carte** (`ferme: 'ecran:localiser'` ou l'équivalent de la vue)
  jusqu'à la réponse, juste ou fausse.

### Étape 2 — La carte de France (vue « Localiser »)

- **Message de Samia** (après le point d'étape) : « Maintenant, regarde où se trouvent les lieux de la chaîne. Ouvre la carte de France et
  place chaque lieu. Samia »
- **Vue « Localiser »** (`localiser`, id `action-carte`, libellé « Carte de France ») : **3 lieux** du socle, dans cet ordre, plus **1 lieu
  bonus** chez un confirmé (§6). Région → département → ville (non notée) ; fin : **trajet fléché sur la France entière** (Le Havre →
  Ensuès → Nîmes) et les **5 autres entrepôts Action** en ronds creux.
- **Texte de fin** (panneau, proposé) : « Les produits arrivent d'Asie par bateau au Havre, puis l'entrepôt d'Ensuès prépare les commandes
  des magasins du Sud-Est. Les points gris sont les autres entrepôts Action en France. (Le trajet du Havre à Ensuès, puis à ce magasin de
  Nîmes, est imaginé pour l'exercice.) »
- Question au fil C (§4 bis) au geste `localiser:magasin:departement`.
- **Fermeture** : la fiche « La chaîne » n'arrive qu'au bilan de la carte (`localiserFini('action-carte')`).

### Étape 3 — La chaîne

- **Message de Samia** (`localiserFini('action-carte')`) : « Tu as vu les lieux. Maintenant, remets le chemin des produits dans l'ordre, et
  dis-moi où tu travailles. Samia »
- **Fiche « La chaîne »** :
  - `ordre` (6 étiquettes, ordre de départ **mélangé par élève**, jamais juste au départ) : « Remets le chemin d'un produit dans l'ordre, du
    début à la fin. » Ordre juste : **l'usine, en Asie → le bateau → le hub d'import du Havre → l'entrepôt d'Ensuès-la-Redonne → le magasin
    Action de Nîmes → le client**. (Étiquette « le bateau » plutôt que « le porte-conteneurs » : voir §11 n° 2.)
  - `liste` « Toi, tu travailles ici : » — les 6 mêmes étiquettes ; juste : l'entrepôt d'Ensuès-la-Redonne.
- Question au fil D (§4 bis) au geste `fiche:chaine:ordre` (le premier déplacement d'une étiquette), corrigée **au bilan**.

### Étape 4 — Ce que je change

- **Message de Samia** (`apresFiche('chaine')`) : « Dernière chose. Ton travail compte pour le magasin. Pour chaque situation, choisis ce
  qui arrive au magasin de Nîmes. Samia »
- **Fiche « Ce que je change »** (`liste` × 3 tirées, + 1 bonus chez un confirmé, §6 bis) : chaque ligne, une situation, ses 3 choix (ordre
  mélangé). Consigne neutre, sans nombre.
- Question au fil E (§4 bis) au geste `fiche:change:envoyer`.

### Fin

- **Samia** (`apresFiche('change')`) : « Merci pour ce premier jour ! Demain, tu prends ton poste à la réception à 6 h : on attend le camion
  du Havre. Samia » (amorce d'ENT-8.2, sans heure d'arrivée du camion : elle se lit sur le planigramme d'ENT-8.2).
- Premier bilan → bandeau ✓ / ✗ par bloc (§5) ; « Corriger » rouvre les fiches fausses (pas la carte) ; `finFige` : « La carte se joue au
  premier essai : elle ne se rejoue pas. » ; ENT-8.2 s'ouvre.

**Mots cliquables** (`lexique`) : entrepôt, prestataire, hub d'import, chaîne logistique, région, département, filmer, enseigne. **Pas
« conteneur »** (réponse de la question D).

## 4 bis. Questions au fil — **tranché par Tristan le 15/10/2026 à 19 h 13 : A, C, D, E** (B écartée ; F passe dans ENT-8.2)

Fichier `contenus/questions/ENT-8.1.js`, `part: 4`, `personnes` : Samia (`equipe: EQUIPE` de l'univers). Tout dans une ligne du bandeau :
« Les questions de Samia ».

| id | Geste | Qui pose | Question | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| `lien-action-geodis` (A) | envoi de la fiche « Qui est qui ? » (point d'étape, ferme la carte) | Samia | « L'entrepôt est rempli de produits Action, mais c'est Geodis qui le fait tourner. Qu'est-ce qui lie Action et Geodis ? » — **un contrat : Action paie Geodis pour stocker et préparer ses commandes** (`contrat`) · Geodis appartient à Action (`appartient`) · Action est un client du magasin de Nîmes (`client-magasin`) · aucun lien, chacun travaille de son côté (`aucun`) | transition | **1,5** | tout de suite | éco-droit appliqué (prestation logistique, client / prestataire) ; prépare la chaîne |
| `pourquoi-marseille` (C) | `localiser:magasin:departement` (fin de l'étape département du magasin) | Samia | « Pourquoi Action a-t-il un entrepôt près de Marseille, plutôt qu'un seul entrepôt à côté de Paris ? » — « Les camions font moins de kilomètres pour livrer les magasins du Sud-Est » · « Les magasins sont livrés plus vite » · « Moins de kilomètres, c'est moins de CO₂ » · « Je n'y avais pas pensé » | fil | **réflexion** | tout de suite | C1.1.2 / C1.1.3 ; ne donne aucun département du magasin (déjà trouvé) — voir §11 n° 3 pour le confirmé |
| `voyage-bateau` (D) | `fiche:chaine:ordre` (premier déplacement) | Samia | « Les produits arrivent d'Asie au Havre. Dans quoi voyagent-ils sur le bateau ? » — **des conteneurs** (`conteneurs`) · des camions (`camions`) · des rolls (`rolls`) · des palettes posées seules sur le pont (`palettes`) | fil | **1,5** | **au bilan** | vocabulaire de l'import ; corrigée au bilan pour ne pas souffler l'ordre (la fiche proposait une image du conteneur à gauche : seulement si le panneau des questions sait en montrer une, sinon rien) |
| `qui-remarque` (E) | `fiche:change:envoyer` | Samia | `selon` : « À cause de ton erreur (« {la 1re situation tirée de l'élève} »), le magasin de Nîmes a un problème. Qui le voit en premier ? » — **le personnel du magasin, en ouvrant les colis ou en remplissant le rayon** (`magasin`) · Geodis, le soir même (`geodis`) · le fournisseur, en Asie (`fournisseur`) | fil | **1** | tout de suite | C1.1.4 ancrée sur **sa** situation tirée |

- **Retours proposés** (la conséquence, pas la leçon) : A : « C'est ça : Geodis est un prestataire. Action le paie pour faire tourner
  l'entrepôt ; si le travail est mal fait, Action peut changer de prestataire. » · C (« Ce qu'en pense Samia ») : « Les trois sont vrais :
  un entrepôt près des magasins, c'est moins de route, des livraisons plus rapides et moins de CO₂. » · D : « Des conteneurs : de grandes
  boîtes en métal, toutes de la même taille, qu'on passe du bateau au camion sans ouvrir. » · E : « C'est le magasin qui le voit : un rayon
  vide ou un produit cassé, et c'est un client qui repart sans rien. »
- Poids dans la `part` : A 1,5 · D 1,5 · E 1 (C non notée) → 4.
- E : la première situation tirée de l'élève est lue dans son tirage (`selon`, calculé à l'arrivée) ; contrôle sur base vide (texte déclaré).

## 4 ter. Avant de commencer — **validé par Tristan le 15/10/2026 à 19 h 14**

Bloc `ouverture` de `contenus/questions/ENT-8.1.js` (Samia), **tirage 3 notions + 1 image** : `tirage: { preparation: 3, image: 1 }`
(banques : 7 notions ≥ 2 × 3 et 3 images ≥ 2 × 1, conforme à la règle du double). Non notées, rien
à l'écran ne le dit. Documents à gauche : « Action et Geodis en bref » et les visuels (photos libres, crédit sous l'image). Textes proposés
(ids et idées validés par Tristan ; formulations de Cowork, à relire à l'écran) :

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `action-vend` | préparation | Que vend surtout Action ? | des produits pour la maison, la déco, le bricolage, l'hygiène, à petit prix | des voitures · des repas au restaurant · des médicaments sur ordonnance | « Action et Geodis en bref » | ★ |
| `action-memes` | préparation | Un produit vu dans un magasin Action à Lille, je le trouve aussi à Nîmes ? | oui : ce sont les mêmes produits dans tous les magasins | non : chaque magasin choisit ses produits · seulement dans les magasins de Paris | idem | |
| `entrepot-sert` | préparation | Un entrepôt sert à… | stocker les produits, puis préparer les commandes des magasins | vendre les produits aux clients · fabriquer les produits | photo libre d'entrepôt | ★ |
| `port-sert` | préparation | Un port comme Le Havre sert à… | décharger et charger les bateaux venus de loin | stocker l'essence des voitures · vendre des produits aux clients | « Action et Geodis en bref » (pas de photo de porte-conteneurs : elle donnerait D) | |
| `chaine` | préparation | La chaîne logistique, c'est… | le chemin d'un produit, de l'usine jusqu'au client | la file d'attente aux caisses du magasin · la liste des salariés d'un entrepôt | — | ★ |
| `regions` | préparation | La France est découpée en régions. Chaque région est découpée en… | départements | pays · continents | — (exemple hors scénario possible : la Bretagne et le Finistère) | ★ |
| `code-postal` | préparation | `variante` : « Un lycée a pour adresse {code} {ville}. Dans quel département est-il ? » | le {2 premiers chiffres} ({nom}) | deux pièges calculés (ex. les 2 derniers chiffres ; le 1er chiffre seul) | — | |
| `img-semi` | image | Comment s'appelle ce véhicule ? | une semi-remorque | une camionnette · un tracteur agricole | photo libre | |
| `img-palette` | image | Qu'est-ce que c'est ? | une palette filmée | un roll · un carton seul | photo libre | |
| `img-rack` | image | Comment s'appellent ces meubles de stockage ? | des racks à palettes | des étagères de magasin · des quais | photo libre | |

- `code-postal` : villes **hors scénario** tirées (par exemple Lyon 69003, Lille 59000, Rennes 35000, Bordeaux 33000, Strasbourg 67000 ;
  jamais 30, 13, 76 ni 82). Mêmes clés et même `juste` pour tous, textes calculés dans `variante`.
- **Écartées** (Tristan) : conteneur (donnerait D), « Action client de Geodis » (donnerait A), convention de stage (inutile à l'exercice).
- Retours courts, sans leçon (proposés par Claude Code à la construction, sur le modèle d'ENT-6.1).

## 5. Jalons / notation (sur 20) — **poids validés par Tristan le 15/10/2026 à 19 h 18 (option B)**

| Bloc (ligne du bandeau) | Cases (un jalon chacune) | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Qui est qui ?** | 4 acteurs tirés, 1 chacun | **4** | `ficheEnvoyee(db,'qui').valeurs[<ligne>]` contre le rôle de l'acteur tiré | « à faire » jusqu'à l'envoi ; ranger par rang de ligne, jamais par id d'acteur visible dans la page (qui donnerait la réponse, comme les cases d'ENT-6.1) |
| **La carte de France** | région et département × 3 lieux, 0,75 chacun | **4,5** | `etapesLocaliser(…)` : premier essai | aucun `ecran` (ne se rouvre pas) ; la ville n'est pas un jalon |
| **La chaîne** | l'ordre 2,5 ; « Toi, tu travailles ici » 1,5 | **4** | `valeurs.ordre` (les 6 dans l'ordre exact) ; `valeurs.place === 'ensues'` | l'ordre de départ n'est jamais juste (sinon envoyer sans rien toucher rapporte 2,5) |
| **Ce que je change** | 3 situations tirées : facile 1, moyenne 1,25, difficile 1,25 | **3,5** | `valeurs[<ligne>]` contre la conséquence attendue | « à faire » jusqu'à l'envoi |
| **Les questions de Samia** | A 1,5 · D 1,5 · E 1 | **4** (`part: 4`) | moteur des questions | — |
| **Total** | | **20** | | |

- **Corriger** : `ecran: 'fiche:qui'`, `'fiche:chaine'`, `'fiche:change'` ; accusé de réception de Samia à chaque renvoi (`volet.corrections`,
  « Merci, j'ai ta nouvelle fiche. »), jamais « juste » ni « faux ».
- **Confirmé** : le lieu bonus (2 jalons `bonus: true`) et la situation bonus (1 jalon `bonus: true`), sans poids ni groupe ; bandeau
  identique à celui d'un standard.
- **Anti-inaction** : rien fait = 0/20.

## 6. Contenu (données)

- **`contenus/action.js`** — univers commun aux séances Action, **créé par ENT-8.1** : identité, `THEME` d'après la charte (§2), `EQUIPE`
  (Samia, Kevin, Julie ; tu), lieux réels (§6.1), lexique, document « Action et Geodis en bref », logo.
- **`contenus/action-ent81.js`** : messages, fiches « Qui est qui ? », « La chaîne », « Ce que je change », banques et tirage, déclaration
  `localiser`, jalons, accueil.
- **`contenus/questions/ENT-8.1.js`** : ouverture et questions A, C, D, E.
- **`activites/action-se-situer.js`** ; **`contenus/corriges/ENT-8.1.js`** (par élève : ses acteurs, ses situations et leurs réponses, la
  carte lieu par lieu avec région, département et ville, cas bonus marqués « bonus »).
- Photos libres dans `contenus/action/`.
- Valeurs attendues **recalculées par le code** à partir des banques ; dans les tests, écrites à la main.

### 6.1 Les lieux de la carte (déclaration `localiser`) — positions **à relever dans OpenStreetMap** (objet cité)

| id | lettre / type | Nom | Rôle (panneau, proposé) | Ville · dép. · région (codes INSEE) | 3 autres villes du département | Repères | Indice (standard) |
|---|---|---|---|---|---|---|---|
| `magasin` | M · magasin (bleu) | Action Nîmes Cap Costières | Le magasin que ton entrepôt livre. | Nîmes · 30 Gard · 76 Occitanie | Alès, Uzès, Beaucaire | Montpellier, Avignon | Au sud du département, entre Montpellier et Avignon. |
| `entrepot` | E · entrepôt (terre) | Entrepôt Action d'Ensuès-la-Redonne | Geodis y stocke et prépare les commandes des magasins Action du Sud-Est. | Ensuès-la-Redonne · 13 Bouches-du-Rhône · 93 Provence-Alpes-Côte d'Azur | Aix-en-Provence, Arles, Salon-de-Provence | Marseille | Au bord de la mer, juste à l'ouest de Marseille. |
| `port` | P · port (encre) | Hub d'import d'Action, port du Havre | Les produits venus d'Asie arrivent ici par bateau. | Gonfreville-l'Orcher · 76 Seine-Maritime · 28 Normandie | Rouen, Dieppe, Fécamp | Le Havre | Juste à l'est du Havre, au bord de l'estuaire de la Seine. |
| `labastide` (**bonus**, confirmé) | E · entrepôt (terre) | Entrepôt Action de Labastide-Saint-Pierre | Un autre entrepôt Action : il livre d'autres magasins. | Labastide-Saint-Pierre · 82 Tarn-et-Garonne · 76 Occitanie | Moissac, Caussade, Beaumont-de-Lomagne | Montauban, Toulouse | (pas d'indice : confirmé) |

- `flux: ['port', 'entrepot', 'magasin']` ; `reseau` : **autres entrepôts Action** — Moissy-Cramayel, Labastide-Saint-Pierre,
  Belleville-en-Beaujolais, Verrières-en-Anjou, Onnaing (Labastide est posée comme lieu chez un confirmé : la vue ne la dessine pas deux fois).
- **Le Havre** n'est **pas** parmi les « autres » du port (à 10 km de Gonfreville, les points se toucheraient) : c'est un repère.
- Les « autres » choisies doivent être **des communes réelles du bon département**, à plus de la distance minimale du bon point (contrôle de la
  vue) : à vérifier dans OSM, remplacer une ville trop proche si besoin et le dire.
- Pas de rôle « Ton lieu de stage » pour l'entrepôt (il donnerait le jalon « Toi, tu travailles ici »).

## 6 bis. Tirage et niveaux (règle du 08/10/2026)

Graine par séance, tirage **rangé** à la première ouverture. Ids stables, jamais supprimés (`retiree: true` pour mettre de côté).

### Banque `acteurs` — fiche « Qui est qui ? »

| id | Acteur (ligne de la fiche) | Rôle attendu | Difficulté |
|---|---|---|---|
| `geodis` | Geodis | stocke et prépare les commandes des magasins | **fixe** |
| `lycee` | ton lycée | t'envoie en stage et suit ta formation | facile |
| `client` | le client du magasin | achète les produits au magasin | facile |
| `fournisseur` | un fournisseur | fabrique les produits | facile |
| `magasin` | le magasin Action de Nîmes | vend les produits aux clients | moyen |
| `transporteur` | le transporteur | amène les marchandises en camion | moyen |
| `action` | Action | possède les magasins et choisit les produits à vendre | difficile (se confond avec le magasin) |

- Socle : fixe + `{ facile: 1, moyen: 1, difficile: 1 }` → 4 lignes. Pas de bonus (décision : le confirmé reçoit un lieu et une situation).
  `ordre: 'melange'`. Les 7 rôles sont offerts à chaque ligne, quel que soit le tirage.
- Le 7e acteur (« le transporteur ») et l'acteur « Action » distinct du magasin sont des **propositions de Cowork** (la fiche des déroulés
  en donnait 6 avec « … ») : §11 n° 4.

### Banque `situations` — fiche « Ce que je change »

| id | Situation | Ce qui arrive au magasin de Nîmes (juste en gras) | Difficulté |
|---|---|---|---|
| `s-cartons` | Tu prépares 10 cartons de bougies au lieu de 12. | **Il manque des bougies dans le rayon** · Le magasin a des bougies en trop · Rien : personne ne le voit | facile |
| `s-chute` | Un colis mal filmé tombe dans le camion. | **Des produits arrivent cassés au magasin** · Le camion arrive plus vite · Rien ne change pour le magasin | facile |
| `s-etiquette` | Tu colles sur une palette l'étiquette d'un autre magasin. | **La palette part dans un autre magasin : elle manque à Nîmes** · Le magasin de Nîmes la reçoit deux fois · Rien : le chauffeur corrige | facile |
| `s-emplacement` | Tu ranges une palette au mauvais emplacement. | **Le préparateur ne la trouve pas : le produit manque dans la commande du magasin** · Le magasin reçoit le produit deux fois · Rien : l'ordinateur la retrouve tout seul | moyen |
| `s-retard` | Tu finis ta préparation avec une heure de retard. | **Le camion part en retard : le magasin est livré plus tard** · Le magasin est livré plus tôt · Rien : le camion attend toujours | moyen |
| `s-camion` | Tu charges la palette de Nîmes dans le camion d'un autre magasin. | **Nîmes ne la reçoit pas, l'autre magasin l'a en trop** · Les deux magasins la reçoivent · Rien : les deux magasins vendent les mêmes produits | moyen |
| `s-scan` | Tu oublies de scanner un carton, mais tu le mets bien sur la palette. | **Le magasin reçoit un carton que sa liste ne prévoit pas : son stock est faux** · Le carton n'arrive pas au magasin · Rien : le carton est bien là | difficile |
| `s-abime` | Tu vois un carton abîmé et tu le prépares sans rien dire. | **Le magasin reçoit un produit qu'il ne pourra pas vendre** · Le magasin le vend moins cher, c'est mieux · Rien : le client ne regarde pas | difficile |

- Socle : `{ facile: 1, moyen: 1, difficile: 1 }` → 3 lignes (poids 1 / 1,25 / 1,25 par difficulté). Bonus confirmé : `{ moyen: 1 }`.
  `ordre: 'melange'`. Textes **construits par Cowork**, à relire à l'écran (§11 n° 4).

### La carte

- 3 lieux du socle **pour tous** (pièces fixes, même ordre). Confirmé : le lieu bonus `labastide` en 4e. Accompagné / standard / confirmé :
  affichage de la vue (§2.5 du brief moteur).

### Le reste

- **Valeurs tirées** : `code-postal` (ouverture) seulement.
- **Ordre de départ de la chaîne** : mélangé par élève, jamais l'ordre juste (re-tirage sinon).
- **Accompagné** : carte au niveau Accompagné ; fiches = contenu standard.
- **Consignes neutres** : aucune ne donne le nombre de lignes ni de lieux (« Pour chaque acteur… », « place chaque lieu »).

## 7. Demandes au moteur

### 7.1 La vue « Localiser » — chantier `docs/briefs/MOTEUR-vue-localiser.md`, à livrer **avant** cette séance

Gestes `localiser:<lieu>:region` / `:departement` / `:ville`, `localiser:<vue>:fin`, déclencheur `localiserFini`, jalons
`etapesLocaliser`, lieu bonus.

### 7.2 À vérifier à l'état des lieux (pas de chantier, le dire à Tristan si ça bloque)

- `niveauxPrevus: ['confirme', 'accompagne']` accepté (sinon `['confirme']` et le dire : la colonne « Niveaux » de l'enseignant doit
  permettre de régler Accompagné pour Action).
- Séance `correction: true` où les jalons de la carte n'ont pas d'`ecran` : « Corriger » reste offert pour les fiches fausses, `finFige` dit
  pourquoi la carte ne se rouvre pas.
- Une fiche `ordre` dont l'ordre de départ est une fonction de la base (D-1 bis : `blocs: (db) => …`).

### 7 bis. Séance déjà jouée par des élèves ?

Non : séance nouvelle.

## 8. Tests attendus

Bloc **nouveau** `action` (`outils/test/action.mjs`, une ligne dans `BLOCS` et `GROUPES` de `outils/test.mjs` : **alerte 7, le dire**).
Graines choisies dans le test, valeurs attendues écrites à la main.

- **Parcours juste** (standard) : 20/20, bandeau 5 lignes ✓ ; ENT-8.2 ouverte (dès qu'elle existe ; d'ici là, séance finie).
- **Inaction** → 0/20, rien de jugé « juste ».
- **Pire cas** : tout faux (carte comprise, questions comprises) → premier bilan, séance suivante ouverte sans l'enseignant.
- « Qui est qui ? » : Action répondu « vend les produits aux clients » → bloc 1 ✗ ; « Corriger » le rouvre, pas la carte.
- Carte : une erreur à la région du port → bloc 2 ✗, le reste ✓ ; erreurs à la ville seulement → bloc 2 ✓.
- La chaîne : fiche envoyée sans toucher l'ordre → ordre ✗ (l'ordre de départ n'est jamais juste) ; sur 300 graines, jamais d'ordre de départ
  juste.
- **Point d'étape** : la carte reste fermée avant la réponse ; réponse fausse → la carte s'ouvre quand même.
- **Questions** : C au geste `localiser:magasin:departement`, une fois, non notée ; D notée au bilan (« Merci, je note ») ; E affiche **la
  situation de l'élève** ; `part` 4, somme des poids 20.
- **Tirage** : mêmes acteurs, situations et ordre après rechargement ; 300 graines → mélanges respectés, Geodis toujours présent, zéro secours.
- **Confirmé** : 4 lieux, 4 situations, bandeau identique ligne pour ligne à celui d'un standard, mot « bonus » absent côté élève ; cas bonus
  faux → note du socle inchangée. **Accompagné** : carte avec les noms, fiches identiques au standard.
- **Ouverture** : 3 notions + 1 image tirées, `code-postal` jamais 30, 13, 76 ni 82 (300 graines), 20/20 quelles que soient les réponses.
- **Socle CAP** : ENT-8.1 dans la liste des séances CAP (`outils/test/socle.mjs`) ; `competencesCap` lu par un groupe CAP.
- Sabotage par bloc (chaque jalon inversé fait tomber un cas) ; ordre de départ laissé juste → le cas des 300 graines tombe.

## 9. Supports pour les élèves

- **Trame** (Cowork, après validation à l'écran) : page de connexion (Prepalog → Simulog → logo Action → ENT-8.1) ; **cours** d'une
  demi-page : la chaîne d'un produit (6 cases), régions et départements (carte muette **en noir et blanc**, contours IGN), lexique. Pas de
  corrigé de trame.
- **Corrigé enseignant** : `contenus/corriges/ENT-8.1.js` (§6).

## 10. Critères de validation par Tristan

- La carte se joue sans aide à l'oral pour un élève de CAP, en ≈ 10 minutes pour les 3 lieux.
- Le trajet Le Havre → Ensuès → Nîmes se lit sur la France entière, avec les noms ; la séance dit qu'il est construit.
- Chaque écran a une consigne de 3 lignes au plus ; aucun texte à taper.
- Deux voisins n'ont pas les mêmes acteurs ni les mêmes situations.
- 45 minutes suffisent.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

1. [ ] `competences` (Bac Pro) d'une séance réservée au CAP : vide, ou `['C1.1']` pour une reprise possible en Bac Pro ? (Défaut :
   `['C1.1']` si le socle exige une liste non vide, sinon `[]` ; le dire à Tristan.)
2. [ ] Étiquette de l'ordre « le bateau » au lieu de « le porte-conteneurs » : le mot « conteneurs » donnerait la réponse de la question D.
   (Défaut : « le bateau ».)
3. [ ] Question C : chez un **confirmé**, « près de Marseille » dit d'avance où chercher l'entrepôt (2e lieu), puisque son panneau ne donne
   que la ville. (Défaut : geste `localiser:magasin:departement` comme décidé ; autre possibilité : `localiser:entrepot:departement`.)
4. [ ] Textes construits par Cowork, à relire à l'écran : le document « Action et Geodis en bref », les 7 acteurs et leurs rôles (dont le
   transporteur et la distinction Action / magasin), les 8 situations, les formulations de l'ouverture, les messages de Samia.
5. [ ] « Toi, tu travailles ici » est presque donné par la situation (premier jour à Ensuès) : gardé comme décidé (1,5 point), c'est un
   guidage. (Défaut : gardé.)

---

## Compte rendu *(rempli par Claude Code à la livraison)*

*Rempli le 15/10/2026 par le sous-agent Opus de la phase 3 (chantier Action, `docs/briefs/COORDINATION-action.md`). L'univers
(`contenus/action.js`), la vue « Localiser » et l'entreprise n° 8 existaient déjà (phases 1 et 2).*

- **Fichiers créés / modifiés** :
  - `contenus/action-ent81.js` (nouveau) : la carte (`LOCALISER`), les trois fiches, les jalons, les messages de Samia, l'accueil, les options.
  - `contenus/action-ent81-donnees.js` (nouveau, **hors de la liste prévue**, voir les écarts) : les banques `acteurs` et `situations`, les
    7 rôles, les 6 étiquettes de la chaîne, le tirage (`TIRAGE`, ordre de départ de la chaîne compris) et les lectures pures de la base.
  - `contenus/questions/ENT-8.1.js` (nouveau) : « Avant de commencer » (10 questions, 3 + 1 tirées) et A, C, D, E.
  - `contenus/corriges/ENT-8.1.js` (nouveau) : corrigé commun et corrigé par élève (acteurs, carte lieu par lieu avec région,
    département et ville, ordre de départ, situations, question E ; Labastide et la situation en plus marquées « bonus »).
  - `activites/action-se-situer.js` : le squelette d'ENT-8.2 remplacé par la séance.
  - `outils/test/action-81.mjs` (nouveau bloc) et `outils/test.mjs` (**alerte 7** : deux lignes, `'action-81'` dans `BLOCS` et dans le
    groupe 1 de `GROUPES`).
  - `contenus/action.js` **non modifié** (les `etiq` proposés tiennent à l'écran : Nîmes au-dessus, Ensuès en dessous, Gonfreville à gauche).
  - `activites/index.js` et `outils/test/socle.mjs` (`'ENT-8.1': 'CAP-C1.1'`) : déjà faits par le chantier ENT-8.2, vérifiés, non touchés.
- **Écarts par rapport au brief** (et pourquoi) :
  1. **Bloc de tests `action-81`** et non des cas dans `action` (le bloc `action` est celui d'ENT-8.2 ; un bloc par séance, comme
     `decathlon-74`).
  2. **Un fichier de données pures en plus** (`contenus/action-ent81-donnees.js`) : la question E lit la 1re situation tirée ; si les
     questions importaient le contenu (qui les importe), l'import circulaire ferait planter le bloc `questions`, qui charge les fichiers de
     questions seuls. Même découpage que Decathlon (`decathlon-ent72-donnees.js`). **Conséquence** : `outils/test/tirage-niveaux.mjs` doit
     inscrire la banque dans `BANQUES_FIGEES` (fichier que ce chantier ne touche pas) :
     `'contenus/action-ent81-donnees.js': { acteurs: ['geodis', 'lycee', 'client', 'fournisseur', 'magasin', 'transporteur', 'action'], situations: ['s-cartons', 's-chute', 's-etiquette', 's-emplacement', 's-retard', 's-camion', 's-scan', 's-abime'] }`.
  3. **Question C au geste `localiser:entrepot:departement`** (décision n° 3 du chef de chantier, au lieu du magasin).
  4. **Texte de fin de la carte** : « Les ronds creux sont les autres entrepôts Action » (la vue les dessine en ronds creux, pas en
     « points gris »). Message de Samia de l'étape 2 complété d'une phrase (« sa région, puis son département, puis sa ville ») ; message 1 :
     « ta [[tutrice]] » cliquable.
  5. **`code-postal`** : cinq villes dont les deux pièges calculés tombent sur de vrais départements (jamais 30, 13, 76, 82) — Paris 75015,
     Lyon 69003, Dunkerque 59140, Amiens 80090, Metz 57070. Rennes, Bordeaux, Strasbourg et Lille (exemples du brief) sont écartées : leurs
     codes finissent par « 00 », le piège « deux derniers chiffres » n'y existe pas. Les pièges s'affichent comme le juste, avec le nom
     (« le 03 (Allier) », « le 06 (Alpes-Maritimes) »).
  6. **`finFige`** : la phrase générale du chef de chantier (« La carte et les questions de Samia se jouent au premier essai : elles ne se
     rejouent pas. »).
- **Décisions prises en route** :
  1. La carte est fermée **jusqu'à l'envoi de « Qui est qui ? »** (`fermetures`, message « Après la fiche « Qui est qui ? » »), puis le
     point d'étape la garde fermée jusqu'à la réponse (`ferme: 'ecran:localiser'`) ; « Continuer » l'ouvre. Une fiche rouverte par
     « Corriger » ne referme ni la carte ni la fiche suivante (condition : la fiche a été envoyée **une fois**, `envois`).
  2. « La chaîne » et « Ce que je change » n'apparaissent au menu qu'à leur tour (`quand` de la fiche : carte finie ; chaîne envoyée).
  3. L'ordre de départ de la chaîne est une **valeur tirée et rangée** (`TIRAGE.valeurs`), re-tirée par `verifier` si elle tombe juste ;
     « Toi, tu travailles ici » offre les 6 étiquettes **dans ce même ordre de départ** (jamais l'ordre juste : il ne souffle rien).
  4. Les 7 rôles de « Qui est qui ? » : un ordre tiré par élève, **le même à chaque ligne** (plus simple à lire en CAP) ; les clés des rôles
     ne nomment pas l'acteur. Les jalons lisent les lignes par **rang**, jamais par un id visible dans la page.
  5. « Ce que je change » : la situation en plus du confirmé est la **4e ligne** ; les 3 conséquences mélangées par élève et par ligne.
  6. Jalons de « Ce que je change » rangés **par difficulté** (facile 1, moyenne 1,25, difficile 1,25), quelle que soit la ligne tirée.
  7. **Contournement d'un défaut du moteur** (`sansNull`, commenté dans `contenus/action-ent81.js`) : le rattrapage des questions au fil
     (`jalonJuge`, `core/types/entreprise.js` l. 803) lit `.status` de tous les jalons, bonus compris, et écrit une erreur en console sur le
     `null` d'un cas bonus non reçu — chez **chaque élève standard dès la fin de la carte**. Les jalons bonus d'ENT-8.1 rendent donc « juste »
     au lieu de `null` chez un élève qui n'est pas confirmé (le moteur ne les appelle nulle part ailleurs pour lui). **Correctif moteur
     d'une ligne à faire** (`if (r == null) return true`), puis retirer le contournement. Les autres séances à cas bonus peuvent la
     rencontrer dès qu'une question au fil attend son rattrapage quand les jalons bonus sont atteints (NON vérifié).
  8. Ouverture : trois visuels séparés (« Sur la route », « Dans l'entrepôt », « Une allée »), crédit sous chaque photo ; `entrepot-sert`
     montre la photo des racks. Retours d'ouverture écrits par Claude Code (courts, sans leçon).
- **Tests** : bloc `action-81`, **15 cas** (+ le cas global du lanceur), vert en ≈ 2 min 30 à 1366 × 768, souris sur `boundingBox()`.
  Graines `a81-juste`, `a81-faux`, `a81-acc`, `a81-rien`, `a81-conf`, valeurs écrites à la main.
  **Sabotages éprouvés (8, chacun fait tomber au moins un cas, fichiers remis ensuite)** : jalons « Qui est qui ? » inversés (7 cas
  tombent), jalons de la carte inversés (7), ordre de la chaîne inversé (7), « où tu travailles » inversé (7), « Ce que je change » inversé
  (7), cas bonus toujours juste (1 : le confirmé), ordre de départ laissé juste et règle retirée (4, dont l'équité sur 300 graines), carte
  ouverte dès le départ (1).
  **Non-régression** (`socle dependances localiser questions tirage-niveaux`) : 202 / 205 ; les 3 cas tombés attendent une mise à jour de
  fichiers de test que ce chantier ne touche pas : (a) `outils/test/socle.mjs` l. 814 : `'10/20 (1/3)'` → `'10/20 (1/4)'` (ENT-8.1 déclare
  aussi CAP-C1.1, avec DEC-1, QUI-6 et ENT-6.1 ; commentaire l. 813 à suivre) ; (b) `outils/test/tirage-niveaux.mjs` l. 140-142 : colonnes
  `['2', '4', '6', '7', '8']` et en-têtes `[…, 'Decathlon', 'Action']` (ENT-8.1 déclare `niveauxPrevus`) ; (c) `BANQUES_FIGEES` (écart
  n° 2), avec aussi `contenus/action-ent82.js` (banques d'ENT-8.2). Captures (document, « Qui est qui ? », carte à l'étape département, fin de la carte, « La chaîne »,
  « Ce que je change », bandeau de fin) prises par le bloc avec `CAPTURES_ENT81=<dossier>`.
- **Commits** : aucun (le chef de chantier relit et commite).
- **Reste ouvert** :
  1. **Textes à relire à l'écran par Tristan** (construits par Cowork ou par Claude Code) : le document « Action et Geodis en bref » ; les
     7 acteurs et leurs rôles (le transporteur, la distinction Action / magasin) ; les 8 situations et leurs 3 conséquences ; les 6
     étiquettes de la chaîne ; les 10 questions d'ouverture et leurs retours ; A, C, D, E et leurs retours ; les 5 messages de Samia ;
     le texte de fin de la carte ; l'accueil.
  2. **À regarder à l'écran (moteur, pas la séance)** : au niveau standard, le panneau de la carte écrit « Ensuès-la-Redonne,
     Bouches-du-Rhône (13) » **avant** l'étape « département » : le jalon revient à lire le numéro sur la carte (c'est le choix de la vue,
     §2.5 du brief moteur ; seul le confirmé n'a que la ville). Après la réponse au point d'étape, l'entrée « Carte de France » du menu reste
     grisée jusqu'à « Continuer » ou à un autre clic de menu ; après « Voir le bilan » de la carte, « La chaîne » n'apparaît au menu qu'à la
     navigation suivante (la carte « Nouveau message » de Samia y mène, avec le bouton « Ouvrir la fiche »).
  3. Les trois mises à jour de tests de la non-régression (a, b, c ci-dessus) : sans elles, `socle` et `tirage-niveaux` tombent.
  4. Le correctif moteur de `jalonJuge` (décision n° 7).
  5. Trame et cours d'une demi-page (Cowork, après validation à l'écran).
