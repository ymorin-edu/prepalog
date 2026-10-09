# Brief de séance — ENT-1.2 Spartoo préparation : le poste de préparation RFID

> Écrit par Cowork (conception), lu et complété par Claude Code (construction).
> **Ne rien inventer** : ce qui n'est pas décidé va dans « Questions ouvertes ».

**Statut** : à implémenter — **vue nouvelle : maquette jouable d'abord, validée par Tristan, puis chantier moteur**
**Date du brief** : 09/10/2026
**Conversation d'origine** : Cowork, « ENT-1.2 et ENT-1.3, refonte sur le modèle du brief ENT-1.1 » (09/10/2026)
**Brief jumeau** : `docs/briefs/ENT-1.3-spartoo-isoler-le-lot.md` (le fil conducteur 1.1 → 1.2 → 1.3 passe par les deux).
**Modèle** : le brief `ENT-1.1-spartoo-quai.md` (même entreprise, même base, même démarche : remplacer des écrans de
lecture par un geste du métier).

**Décisions de Tristan (09/10/2026)** :
1. Refonte de 1.2 par une **vue nouvelle « poste de préparation RFID »** (option la plus proche de Toolog, chantier
   moteur assumé), plutôt que le picking sur le plan d'entrepôt existant ou une refonte légère.
2. **Fil conducteur** : la préparation de 1.2 fait sortir des paires **du lot LOT-PM-2609 reçu en 1.1**, et l'élève
   retrouve en 1.3 **les commandes qu'il a lui-même préparées** (plus de commandes de collègue semées, sauf filet §6.6).

**Ordre proposé** (un chantier moteur à la fois) : (1) **maquette jouable** du poste (Cowork, `docs/briefs/spartoo/
maquette-poste-rfid-1.2.html`), validée par Tristan ; (2) objets du kit iso (§7.2) ; (3) vue `poste` (§7.1) ;
(4) contenu ENT-1.2 (§6) et bases déjà commencées (§7 bis) ; (5) ENT-1.3 (brief jumeau). Validation en local avant push.

> ⚠ **ENT-1.2 est une séance OUVERTE aux élèves** (`pret: true`, parcours strict, ancienne règle d'ouverture) et le site
> publié est en **mode réel**. Construire en `pret: true` mais sans pousser tant que Tristan n'a pas validé en local
> (`lancer.bat`), comme pour 1.1. Les élèves qui ont **fini** l'ancienne 1.2 gardent leur note (§7 bis).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-1.2 (inchangé) |
| `id` | `spartoo` (**jamais modifié**) |
| Titre / desc | « Spartoo — préparation » (inchangé) ; desc : « Préparer une vague de commandes web au poste RFID : prélever, contrôler au tunnel, emballer, étiqueter et réapprovisionner. » |
| Rubrique | simulog |
| Entreprise | Spartoo (réelle) — entrepôt de sa filiale Toolog, Saint-Quentin-Fallavier (38) |
| Niveau(x) | inchangé |
| Compétence(s) | C2.2 (inchangé) |
| Temps pédagogique | guidage |
| Notation | avancement, **une note par case, jalons pondérés par blocs** (règles du 07/10), questions au fil |
| Barème | §5 (somme des poids = 20) |
| `pret` à la livraison | reste `true` (séance en service) ; ne pousser qu'après validation de Tristan en local |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

- **Vérifié (web, 09/10/2026)** :
  - Toolog, filiale logistique de Spartoo, Saint-Quentin-Fallavier : **une puce RFID sur chaque produit**, qui le suit
    tout au long de son parcours ; passage par un **tunnel RFID où les produits sont affectés à des bacs** ; **à chaque
    point de contrôle, la puce vérifie que le produit correspond au bon client et part dans le bon carton** ; une
    erreur pour 50 000 à 100 000 commandes avec la RFID, contre une pour 10 000 avec une étiquette classique ; puce
    ≈ 9 centimes ; 12 M€ investis dans le site et la RFID ; ≈ 400 000 références en massifs sur cinq étages,
    **rangées par catégorie et non par marque**, chaque produit avec un emplacement enregistré dans le système ;
    départs tard le soir vers les points relais (Colissimo, Mondial Relay, Relais Colis) —
    [FashionNetwork](https://fr.fashionnetwork.com/news/Spartoo-immersion-dans-son-entrepot-de-saint-quentin-fallavier-en-plein-rush-des-soldes,1598503.html).
  - 100 % RFID, une centaine de préparateurs, 35 km de rails de stockage, livraison le lendemain pour une commande
    passée avant 13 h — [Magtoo](https://www.magtoo.fr/toolog-lentrepot-de-spartoo-pilote-par-des-puces-rfid/) ;
    [supply-chain.net](https://supply-chain.net/lentrepot-de-spartoo-sadapte-a-ses-salaries/) (100 % RFID, engins
    électriques, conditionnement en partie par un ESAT).
- **Non trouvé** (donc **construit**, le dire dans l'avertissement) : la méthode de prélèvement (par commande, par
  vague), la forme du chariot et des bacs, l'écran du terminal, les tailles de cartons, l'étiquette transporteur. Les
  rails de stockage existent mais ne sont pas décrits : on ne les dessine pas comme un fait.
- **Construit** : les emplacements, la vague, les numéros de bacs, les clients et commandes (déjà dans `contenus/spartoo.js`),
  les modes de livraison du moteur (`COL` Colissimo Domicile, `REL` Point Relais, `CHR` Chronopost Express — Chronopost
  n'est **pas** cité par les sources : le garder comme mode « express » construit, ou le retirer, voir §11).
- **Documents reconstitués** : étiquette transporteur et bon de préparation portent la mention de pied
  « Document pédagogique — reconstitution, non contractuel ». Pas de logo de transporteur sur l'étiquette (nom en texte).
- **Personnages** : silhouettes iso sans visage (comme 1.1) ; aucune parole prêtée à un salarié réel.

## 3. Objectif pédagogique

Préparer des commandes de clients particuliers **par le geste** : aller à l'emplacement, prendre la bonne boîte (bonne
référence, bonne pointure), **constater sur place** une rupture ou un manque, laisser le tunnel RFID contrôler le bac,
choisir le carton, coller la bonne étiquette transporteur, puis **réapprovisionner** ce qui manque (seuil, maximum,
minimum de commande). L'élève comprend **pourquoi Toolog a mis une puce sur chaque boîte** : le contrôle se fait au
geste, plus à la relecture.

Avant (constat) : accueil, fournisseurs, clients et console lus sans geste ; bon de préparation rempli en recopiant le
catalogue (stock, emplacement, statut) ; la rupture se lisait dans un tableau, jamais sur une étagère.

Fil conducteur : la vague contient deux commandes de chaussures **du lot LOT-PM-2609** que l'élève a reçu en 1.1 ;
en 1.3, c'est **sa** préparation qu'il remontera.

## 4. Déroulé

| Étape | Écran | Ce que fait l'élève |
|---|---|---|
| 1 | Messagerie | Lit les **consignes du poste** (M. Morin, tutoie, 5 règles au plus) et la question de Léa Dubois ; répond au **questionnaire du poste** (fiche, comme 1.1) ; le poste est **fermé** tant que le questionnaire n'est pas envoyé (`fermetures`, même faux) |
| 2 | Messagerie | Répond à Léa Dubois : stock de Stan Smith blanches T.44 (`.getstock`, déjà appris en 1.1) — **inchangé** |
| 3 | **Poste ①** la vague | Le terminal affiche la vague **V-1027** : 3 commandes web, 3 bacs numérotés sur le chariot (un bac = une commande). L'élève lit les lignes (réf., pointure, quantité, **adresse**) |
| 4 | **Poste ②** prélever | Pour chaque ligne : choisir l'**allée/massif** (rangés **par catégorie** : Lifestyle, Running, Skate…), ouvrir l'emplacement (vue de face : boîtes avec étiquette lisible au zoom), **prendre** le nombre de boîtes, les **poser dans le bon bac**. Emplacement vide ou insuffisant : « Signaler : rupture » / « Signaler : manque (n trouvée·s) » |
| 5 | **Poste ③** tunnel RFID | Pousser le chariot dans le tunnel : chaque bac est lu ; **bac conforme** ✓, sinon ✗ « la puce lue ne correspond pas à la commande du bac 2 » (dit **que**, jamais **quoi**) → l'élève reprend le bac, corrige, repasse |
| 6 | **Poste ④** emballer, étiqueter | Pour chaque bac conforme : choisir le **carton** (S, M, L selon le nombre de boîtes), imprimer et coller l'**étiquette du mode de livraison de la commande** (domicile, point relais, express), poser le colis dans la **cage de départ** du transporteur. « Valider le colis » = sortie de stock et bon de préparation |
| 7 | Messagerie | Réapprovisionner Puma (PM-SUE-NR-40 en rupture : `max − stock`, minimum de commande de 20) — **jalon actuel** |

- **Plus d'écran Bon de préparation à remplir à la main** : le poste écrit `o.prep` (§7.1, même structure qu'aujourd'hui)
  à partir des gestes ; l'écran Commandes reste **en lecture** (statut de chaque commande, reliquat).
- Écrans du menu : Accueil · Messagerie · *Questionnaire du poste* · **Poste de préparation** · Commandes · Stock ·
  Catalogue · Fournisseurs · Console. **Clients** : retiré (il ne servait qu'à une lecture) — à confirmer (§11).
- **Durée visée** : ≈ 1 h 30 en classe, comme 1.1.

## 4 bis. Questions au fil

Posées par **Nadia, cheffe d'équipe préparation** (personnage construit, collègue : tutoie). Part des questions :
**3 points sur 20**. Déclencheurs = gestes publiés par la vue nouvelle (§7.1, `signaux`).

| id | Geste | Énoncé (à l'élève) | Choix (juste en gras) | Notée | Retour de Nadia |
|---|---|---|---|---|---|
| `rupture` | `poste:spartoo-prep:signaler` (premier signalement, rupture ou manque) | « Tu viens de signaler **PM-SUE-NR-40** : 0 paire à l'emplacement, Chloé Michel en a commandé 1. Pour sa commande, que se passe-t-il ? » *(référence et cliente lues dans le geste de l'élève)* | **la ligne part plus tard (reliquat) et on la prévient** · on met une autre pointure dans le bac · on annule toute sa commande | oui, tout de suite | « Une autre pointure, c'est un retour assuré. Le reste de sa commande part ce soir, la ligne manquante suit. » |
| `puce` | `poste:spartoo-prep:tunnel` (premier passage) | « Le tunnel vient de lire ton chariot. D'après ce qu'il t'a affiché, qu'a-t-il comparé ? » | **la puce de chaque boîte et la commande du bac** · le poids de chaque bac · le code-barres du carton | oui | « Une puce par boîte : chez nous, une erreur pour 50 000 commandes au moins. Avec une étiquette classique, c'était une pour 10 000. » |
| `relais` | `poste:spartoo-prep:etiqueter` sur la commande en point relais | « Tu as étiqueté **CMD-048307** en point relais. Où Clara Bernard récupère-t-elle son colis ? » | **dans un commerce du réseau, près de chez elle** · chez elle, remis en main propre · à l'entrepôt de Saint-Quentin-Fallavier | oui | « Le point relais coûte moins cher au client, et le colis part dans la même navette du soir. » |
| `vague` | point d'étape après le dernier « Valider le colis », garde fermé `repondre:reappro` (le mail à Puma) | « Pourquoi prépare-t-on plusieurs commandes en une seule tournée de chariot ? » | — | **non** (`reflexion: true`) | « Moins de pas dans les allées : c'est du temps gagné sur chaque commande. » |

Éco-droit appliqué au cas (question `rupture`) : le texte de référence est fourni dans la séance en document joint
(« Le vendeur informe le consommateur… » — **article à choisir et vérifier sur Légifrance par Cowork avant la
construction** : piste art. L216-1 du Code de la consommation, délai de livraison ; non vérifié aujourd'hui, Légifrance
en 403 depuis le conteneur). Si le texte n'est pas sûr à la construction, la question reste notée **sans** document
joint (elle porte sur le métier, pas sur l'article).

## 5. Jalons / notation (une note par case, pondérée par bloc ; total 20)

| Bloc | Poids | Cases (une par…) | Ce qu'elles lisent | Piège à éviter |
|---|---|---|---|---|
| A. Consignes du poste | 2 | question du questionnaire (5) | `ficheEnvoyee(db, 'poste')` | attente avant l'envoi |
| B. Prélèvement | 5 | **ligne de la vague** (7, §6.2) : bonne réf. et pointure, bonne quantité, bon bac ; ligne en rupture / manque **signalée** (et pas remplie avec autre chose) | état de la vue, **au premier passage au tunnel** (figé, règle du premier essai) | ne pas accuser avant le premier passage ; une ligne jamais touchée = fausse au bilan, pas avant ; une ligne en rupture non signalée **ne doit pas** être « juste » parce que son bac est vide (inaction) |
| C. Contrôle au tunnel | 2 | **bac** (3) : conforme au premier passage | `tunnel[0]` | le second passage corrige, il ne rattrape pas la case |
| D. Colis | 4 | **commande** (3) × 2 : carton adapté ; étiquette = mode de livraison de la commande et cage juste | `colis[cmd]` | une commande sans colis = attente tant que la vague n'est pas finie |
| E. Client | 2 | réponse à Léa : stock réel en chiffres | jalon `lea` actuel | inchangé |
| F. Réapprovisionnement | 2 | mail à Puma | jalon `reappro` actuel | inchangé (calcule sur le stock **après** la vague) |
| Questions au fil | 3 | `rupture`, `puce`, `relais` | moteur des questions | — |

Fin de séance : **bandeau de fin par blocs** (✓ / ✗, titres sans la réponse), `suiteAuBilan: true` (ENT-1.3 s'ouvre quand
tout est jugé, justes ou faux), **« Corriger »** après le bilan (règle du 07/10 : note = moyenne du premier bilan et du
corrigé ; le premier bilan est figé). Cela règle l'écart noté le 07/10 dans `docs/decisions.md` (« Spartoo juge en
continu, le premier bilan n'existe pas ») : avec la vue nouvelle, chaque case se fige à son premier essai.

Titres lus par l'élève (sans trahir la réponse) : « Consignes du poste : questionnaire » · « Ligne n de la vague
prélevée » · « Bac n contrôlé au tunnel » · « Colis de CMD-… » · « Réponse à Léa Dubois » · « Réapprovisionnement
envoyé à Puma ».

## 6. Contenu (données)

Fichiers : `contenus/spartoo.js` (univers ; `VOLET` et `ETAPES` de la séance y vivent aujourd'hui) — **proposé** : sortir
la séance dans `contenus/spartoo-preparation.js` (comme réception et traçabilité) et `contenus/questions/ENT-1.2.js`.
Les attendus sont **calculés** depuis le stock de l'élève et les commandes, jamais recopiés.

### 6.1 Les emplacements (adresses construites, rangement **par catégorie**)

Adresse à 4 segments lisible : `<massif>-<allée>-<colonne>-<niveau>` (ex. `LS-04-12-3` : massif Lifestyle, allée 04,
colonne 12, niveau 3). **À trancher avec le moteur** : le catalogue a déjà une adresse par variante (`v.loc`, forme
`B-01-1`) ; si on garde celle-là, le poste la lit telle quelle (rien à inventer). Proposé : **garder `v.loc`** et ne dessiner
que les emplacements de la vague et leurs voisins. Les voisins d'un emplacement sont **d'autres marques de la même
catégorie** (rangement par catégorie : une Stan Smith à côté d'une Suede), avec au moins un **leurre de pointure**
(la même référence en T.40 à côté de la T.41).

### 6.2 La vague V-1027 (3 commandes, 3 bacs)

| Bac | Commande | Client | Livraison | Lignes | Ce qui se passe |
|---|---|---|---|---|---|
| 1 | CMD-048213 | C0007 (existant) | `COL` domicile | NK-AM270-NR-42 × 1 ; AD-STS-BL-41 × 2 ; PM-SUE-NR-40 × 1 | complet ; **manque** (1 trouvée sur 2) ; **rupture** (emplacement vide) → reliquat |
| 2 | CMD-048307 | C0019 Clara Bernard | `REL` point relais | PM-SUE-MA-41 × 1 ; PM-RSX-BL-42 × 2 | **lot LOT-PM-2609** (1.1) |
| 3 | CMD-048312 | C0026 Noah Fournier | `CHR` express | PM-SUE-MA-41 × 2 | **lot LOT-PM-2609** ; leurre de pointure (T.40 à côté) |

7 lignes, 10 paires commandées, 8 préparées (si tout est juste). Les commandes 048307 et 048312 **existaient déjà en
1.3** (commandes de collègue) : elles passent en 1.2, l'élève les prépare lui-même. Les quantités sont **plafonnées
à l'ouverture** par ce que le lot contient réellement (un élève qui a validé le piège de 1.1 n'a pas forcément ces
paires : même règle que l'actuel `VOLET` de 1.3).

**Valeurs prévues (à recalculer par le code, à constater à l'écran)** : stock après la vague — NK-AM270-NR-42 7,
AD-STS-BL-41 0, PM-SUE-NR-40 0, PM-SUE-MA-41 −3, PM-RSX-BL-42 −2 sur le lot. Lot LOT-PM-2609 après 1.2 : entrées 66,
sorties 5 (MA-41 : 3, RSX-BL-42 : 2), reste 61.

### 6.3 Faire sortir le lot (fil conducteur) — le stock plus ancien

Le moteur sort le stock **au plus ancien lot** (`core/types/entreprise-commandes.js`, l. 245). Or PM-SUE-MA-41 et
PM-RSX-BL-42 ont un stock plus ancien que le lot (d'après le corrigé de 1.3 : 12 et 17 paires). Sans rien faire, la vague
viderait l'ancien stock et **le lot ne bougerait pas** : 1.3 n'aurait rien à remonter.

**Proposé** (aucune remise à zéro, vaut pour les bases neuves **et** déjà commencées) : le volet de 1.2 sème, **avant**
la vague, les **commandes de la nuit** déjà préparées par l'équipe de nuit (« Toolog travaille six jours sur sept ;
l'équipe de nuit a vidé l'ancien stock de deux références ») : des sorties sans lot, datées **avant** la réception de
l'élève, qui consomment exactement l'ancien stock de PM-SUE-MA-41 et PM-RSX-BL-42 (calculé : stock − ce qui reste du lot).
PM-SUE-RG-39 **garde** son ancien stock (17) : c'est le piège « même référence, autre lot » de 1.3.
**À vérifier par Claude Code avant d'écrire** : comment le moteur date et ordonne l'ancien stock (`qty0`, sans mouvement
d'entrée) dans la sortie « au plus ancien lot » ; si l'ancien stock n'a pas de lot, l'écrire sous un lot d'origine
construit (`LOT-PM-2588`, visible en 1.3).

Écarté : fixer `qty0` à 0 dans le catalogue (ne vaut que pour les bases neuves ; les bases déjà commencées garderaient
l'ancien stock) ; relever `versionBase` (remet tout le monde à zéro : **interdit**, priorité absolue du 07/10).

### 6.4 Les messages

- **Consignes du poste** (M. Morin, **tu**) — remplace « Bienvenue » comme message de départ de 1.2 (la bienvenue reste
  en 1.1) ; 5 règles : (1) un bac = une commande, on ne mélange pas ; (2) on vérifie **référence et pointure** sur
  l'étiquette avant de prendre ; (3) emplacement vide ou incomplet : on **signale**, on ne remplace jamais par une
  autre pointure ; (4) le tunnel contrôle chaque bac : un bac refusé, on le reprend ; (5) le carton et l'étiquette
  suivent le mode de livraison choisi par le client. Bouton « Répondre au questionnaire ».
- **Question de Léa Dubois** et **« Nouvelle commande web »** : gardées ; la seconde annonce **la vague** (« 3 commandes
  web à préparer avant le départ des navettes ») au lieu d'une seule commande.
- **Avertissement** (pied du poste) : « Réels : Spartoo, son entrepôt Toolog de Saint-Quentin-Fallavier, le contrôle RFID
  de chaque boîte au tunnel. Construits pour l'exercice : les emplacements, la vague, le chariot, les cartons, les
  clients et l'étiquette. »

### 6.5 Le questionnaire du poste (fiche, blocs `choix`, aucun code moteur)

| # | Question | Juste | Leurres |
|---|---|---|---|
| 1 | Deux commandes, un seul bac : | non, un bac par commande | oui s'il reste de la place · oui si c'est le même client |
| 2 | Avant de prendre une boîte, tu vérifies : | la référence et la pointure | la couleur de la boîte · le prix |
| 3 | La pointure commandée manque, la suivante est là : | tu signales le manque | tu prends la suivante · tu laisses la ligne sans rien dire |
| 4 | Le tunnel refuse un bac : | tu le reprends et tu cherches l'erreur | tu le forces · tu l'envoies quand même |
| 5 | Le carton et l'étiquette dépendent : | du mode de livraison et du nombre de boîtes | de la marque · de la couleur |

Le poste ouvre à l'envoi, **même faux** (on ne bloque pas un élève sur une lecture).

### 6.6 Le volet et ce que reçoit 1.3

Nouveau `VOLET` **`preparation-2`** : messages (§6.4), commandes de la vague, sorties de la nuit (§6.3). Ce que 1.3
lit ensuite : les sorties du lot **faites par l'élève** (moves `Sortie : préparation`, `ref: BP-…`, `lot`). Filet : si
l'élève arrive en 1.3 sans aucune sortie du lot (vague non validée), 1.3 sème la préparation de ces deux commandes par
un collègue (comme aujourd'hui). Voir le brief jumeau.

## 6 bis. Tirage et niveaux

**Non tirée** : règle du 08/10 (« anciens scénarios retravaillés seulement si ça fait ses preuves »). La vue est pensée
pour accepter plus tard une vague tirée dans une banque de commandes (la vague est une donnée, pas du code).

## 7. Demandes au moteur

1. **Vue nouvelle `poste`** — « poste de préparation de commandes à l'unité » (`core/types/poste.js`, `styles/poste.css`),
   déclarée par `creerEntreprise({ …, poste: P })`, entrée de menu « Poste de préparation » ; pensée pour **plusieurs
   séances** (Spartoo 1.2 ; plus tard une évaluation, un e-commerçant de France Boissons ou de la 2de). Comportement de
   la maquette validée (§10). Quatre temps : ① la vague (terminal, chariot à n bacs) ; ② prélever (choix du massif, vue de
   face de l'emplacement, boîtes cliquables avec étiquette lisible au zoom, « prendre n », bac de destination, signaler
   rupture / manque ; « ↶ Reposer ») ; ③ tunnel (lecture bac par bac, ✓ / ✗ qui dit **que** sans dire quoi, reprendre un
   bac) ; ④ colis (carton S/M/L, étiquette du mode de livraison, cage du transporteur, « Valider le colis »).
   - « Valider le colis » **écrit la préparation dans la structure actuelle** (`o.prep = { rows: { sku: { seen, loc, qty,
     status } }, doc, validated, complete, at }`) et fait la sortie de stock par le chemin actuel (au plus ancien lot) :
     les jalons `commande` d'aujourd'hui, `.getlot`, l'écran Commandes et 1.3 continuent de marcher.
   - **État cloisonné** : `db.postes[<id>]` = `{ bacs, signalements, tunnel: [passages], colis, premier }` ; premier essai
     figé par case (lignes au premier passage au tunnel).
   - **Gestes publiés** (`signaux`) : `poste:<id>:prendre`, `poste:<id>:signaler`, `poste:<id>:tunnel`,
     `poste:<id>:etiqueter`, `poste:<id>:valider`.
   - **Trois temps** : guidage = aide « reste à prélever » et le ✗ du tunnel par bac ; entraînement = ✗ du tunnel
     global (« un bac au moins ») ; évaluation (`copie: true`) = le tunnel lit sans rien signaler.
   - Fonctions pour les jalons et les tests : `lignesPoste(db, P)`, `colisPoste(db, P)`, `attendusPoste(P, db)` (calculés).
   - **Contrôlé au chargement** : une ligne en rupture déclarée a bien un stock nul ; chaque adresse existe ; chaque
     commande a un mode de livraison connu ; deux bacs pour une commande refusés.
   - Charte : vert plein = « juste » seulement ; charte rouge de Spartoo **jamais** dans la zone de travail (le moteur
     remplace déjà l'accent par l'encre).
2. **Objets à ajouter au kit iso** (`core/iso.js`) : chariot de préparation à 3 bacs (roues rondes, §7.9 du brief 1.1) ;
   bac numéroté ; boîte à chaussures (étiquette : marque, modèle, réf., pointure, lot) ; massif de rayonnage (vue de
   face, niveaux, emplacements adressés) ; tunnel RFID (portique, voyant ✓ / ✗) ; carton S/M/L ; cage de départ avec
   panneau du mode de livraison ; préparateur debout (le `personne()` de 1.1, sans visage). Mouvement réduit respecté.
3. **Écran Commandes en lecture** pour une séance qui a un poste : le bouton « Préparer » ouvre le poste au lieu du bon
   à remplir (option `preparation: 'poste'`). Les autres entreprises gardent le bon à remplir.
4. **`fermetures`** déjà livré (1.1) : le poste fermé tant que le questionnaire n'est pas envoyé.

### 7 bis. Séance déjà jouée par des élèves

- **Ont fini l'ancienne 1.2** (3 jalons jugés) : **gardent leur note**, leur travail et 1.3 ouverte (règle du 06/10). Leur
  base ne reçoit pas le nouveau volet : `preparation-1` déjà semé ⇒ on ne sème pas `preparation-2`. 1.3 les reçoit avec
  le filet (§6.6).
- **En cours sur l'ancienne 1.2** (volet `preparation-1` semé, CMD-048213 non validée) : **proposé** — ils passent à la
  nouvelle à leur prochaine ouverture : `preparation-2` semé, l'ancienne commande seule remplacée par la vague, la
  réponse à Léa gardée (même jalon). Rien d'autre n'est effacé, aucune remise à zéro de la base. **Décision de
  Tristan** (§11).
- Tests : un cas par situation (élève neuf, fini, en cours), chacun saboté.

## 8. Tests attendus

Nouveau bloc ou bloc `spartoo` (`outils/test/spartoo.mjs`) ; un bloc `poste` pour la vue seule (page d'essai
`outils/essai-poste.html`, données d'essai `contenus/poste-essai.js`) :
- vague juste de bout en bout → toutes les cases ✓, `.getlot LOT-PM-2609` : 5 sorties (MA-41 : 3, RSX-BL-42 : 2), BP-048307
  et BP-048312 ; CMD-048213 en reliquat (2 lignes) ;
- mauvaise pointure dans un bac → tunnel ✗ au premier passage, case B et C fausses, corrigeable ensuite ;
- rupture non signalée (bac laissé vide) → case B fausse ; **sabotage** : jalon qui accepte un bac vide → le test tombe ;
- étiquette « domicile » sur la commande en point relais → case D fausse ;
- les sorties de la nuit (§6.3) n'apparaissent pas sous le lot ; le lot sort bien (sabotage : sans elles, la vague
  sortirait l'ancien stock → le test tombe) ;
- 1.3 reçoit les commandes de l'élève (pas de commandes semées) ;
- les trois situations du §7 bis.

## 9. Supports pour les élèves

- Trame : **réduite** (règle du 07/10 : brouillon des étapes compliquées + cours, plus de corrigé de trame) ; Cowork la
  réécrit **après validation à l'écran** : brouillon du calcul de réapprovisionnement (seuil, maximum, minimum de
  commande) ; une page de cours « Préparer une commande web » (vague, bac, contrôle RFID, reliquat, modes de livraison).
  Les étapes 1-3 actuelles (indicateurs, fournisseurs/clients, console) **disparaissent** de la trame.
- Corrigé calculé de la séance : à recalculer (`contenus/corriges/ENT-1.2.js`).

## 10. Critères de validation par Tristan

D'abord **la maquette** (page jouable, Cowork) : lire la vague, prendre une boîte, se tromper de pointure, voir le
tunnel refuser, corriger, emballer, étiqueter. Puis, en local : jouer 1.2 avec un élève qui a fait 1.1 ; voir la rupture
sur une étagère vide ; finir la vague ; `.getlot LOT-PM-2609` montre **ses** deux commandes ; 1.3 s'ouvre.

## 11. Questions ouvertes

- [ ] Élèves **en cours** sur l'ancienne 1.2 : passent-ils à la nouvelle (proposé) ou finissent-ils l'ancienne ?
- [ ] Mode `CHR` « Chronopost Express » : garder (mode express construit) ou le remplacer par Mondial Relay / Relais Colis
  (cités par la source) ?
- [ ] Écran **Clients** : le retirer du menu de 1.2 ?
- [ ] Adresses : garder `v.loc` du catalogue (proposé) ou passer à une adresse à 4 segments par massif ?
- [ ] Le texte de loi joint à la question `rupture` (à vérifier sur Légifrance par Cowork).
- [ ] Nadia, cheffe d'équipe : nom et rôle à confirmer.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
