# Brief de séance — ENT-3.3 Boost « La tournée à corriger »

**Statut** : à valider par Tristan — chantier moteur (§7) et séance livrés le 02/10/2026, séance en `pret: false` *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 02/10/2026
**Ordre de travail conseillé** : **1/3** — puis ENT-3.4, puis ENT-2.4. Tout en `pret: false`, commits fréquents.
**Conversation d'origine** : « Prepalog — chantier A » (cadrage : `docs/fiches/` + fiches du projet `prepalog-boost-cadrage-ent32-34`, `prepalog-reprise-ent32`, `prepalog-ent32-livree`)

> **Deux chantiers distincts, dans cet ordre** : (1) la **demande moteur** du §7 (petite, `core/types/tournee.js`),
> commitée et testée seule ; (2) la **séance** (contenu seulement). Ne pas mélanger les deux dans un même commit.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-3.3 |
| `id` (jamais modifié ensuite) | à choisir en suivant les `id` voisins d'`activites/index.js` (ex. `boost-diagnostic`) — **le noter dans le compte rendu** |
| Titre / desc | « Boost — la tournée à corriger » / la tournée d'un collègue ne tient pas : dis laquelle des contraintes est violée et pourquoi, puis répare-la |
| Rubrique | logisim |
| Entreprise | Boost (Nîmes), vélo-cargo — déjà dans `contenus/boost.js` |
| Niveau(x) | 1re Bac Pro Logistique |
| Compétence(s) | C2.4 Organiser une tournée de livraison |
| Temps pédagogique | **erreur induite** (`temps: 'erreur'`, comme ENT-2.3) |
| Notation | jalons + note sur 20 (pas de `notation`, pas de `copie`) |
| Barème | **proposition : 6 jalons** (2 de diagnostic, 4 de réparation) — voir §5 ; à confirmer |
| `transportId` | **nouveau et propre : `'boost-ent33'`** (deux séances qui partagent la clé partagent l'état) |
| `pret` à la livraison | **false** (Tristan valide à l'écran, puis `pret: true`) |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

Boost est déjà documentée en tête de `contenus/boost.js` (vérifié / construit) : **ne rien ajouter de non vérifié**. Le collègue
de la séance, ses messages et ses chiffres sont **construits** : le dire dans l'en-tête du contenu, et pas de document qui imite un
document commercial réel (mention « Document pédagogique — reconstitution, non contractuel » si besoin). Logo : `contenus/trames/logos/boost.png`
(déjà là).

## 3. Objectif pédagogique

À la fin, l'élève sait **contrôler une tournée qu'il n'a pas construite** : calculer le poids chargé, l'heure d'arrivée à la gare
et chez le client à créneau, dire **laquelle** des trois contraintes (surcharge / train manqué / créneau raté) est violée **et
chiffrer pourquoi**, puis réparer. C'est la séance « erreur induite » de C2.4 : l'erreur du collègue est **plausible** (il a fait
« au plus court »), pas grossière.

Pourquoi ici : ENT-3.1 (guidage) et ENT-3.2 (entraînement, la tournée sous contrainte) ont installé les trois contraintes ; ENT-3.4 sera
l'évaluation. Doctrine : l'erreur n'est pas sanctionnée, elle **se voit par ses effets** (`docs/fiches/prepalog-finalite.md`, temps B) —
mais ici on demande de la **diagnostiquer**.

## 4. Déroulé

1. **Accueil + mail** : le collègue (prénom inventé, rôle réel du métier) annonce sa tournée du jour et son raisonnement — **le raisonnement
   induit l'erreur** (ex. « j'ai pris l'ordre le plus court, j'ai gagné du temps »). Le mail **ne donne ni le total des poids, ni
   l'heure d'arrivée** (l'élève les calcule, comme en ENT-3.2).
2. **La carte et la tournée sont déjà remplies** : tous les points déjà posés (**pas de repérage**), l'ordre de passage et le chargement
   du collègue **pré-remplis** (demande moteur §7), départ posé.
3. **Feuille de calcul** (même vue qu'ENT-3.2) : somme des poids chargés, charge utile, heure d'arrivée à la gare, heure d'arrivée chez le
   client à créneau — l'élève **calcule**, les jauges de la tournée restent **muettes** (limite seulement, pas de total ni d'heure ni
   de retard chiffré) et **pas de pastille « tenu / raté »** : sinon le diagnostic se lit à l'écran au lieu de se calculer.
4. **Diagnostic** : l'élève **répond au collègue par message à lignes à intitulé** (même mécanique qu'ENT-2.3, **rien dans le moteur** :
   lire `contenus/cdiscount-regularise.js` et `activites/cdiscount-regularise.js`). Lignes proposées : contrainte(s) violée(s)
   (liste fermée : surcharge / train manqué / créneau raté) ; preuve chiffrée pour chacune (poids chargé vs charge utile ; heure d'arrivée vs
   heure limite). Une contrainte **tenue** ne doit pas être accusée (leurre).
5. **Réparation** : l'élève corrige la tournée sur la carte (retire un client, change l'ordre). Le bouton « Recommencer la tournée » existe
   déjà — voir question ouverte n° 3 sur ce qu'il remet.

Vues utilisées : carte + tournée (`core/types/carte.js`, `tournee.js`), feuille de calcul (`grille.js`), messagerie. Même carte et même
journée qu'ENT-3.2 (question ouverte n° 1).

## 5. Jalons / notation

Barème proposé : **6 jalons**. « Diagnostic noté à part » (décision de Tristan, 02/10) = les jalons D1-D2 sont **étiquetés à part** de R1-R4 dans
le suivi si le moteur le permet ; sinon ils sont simplement distincts (question ouverte n° 4).

| # | Jalon | Ce qu'il lit dans la base de l'élève | Piège à éviter |
|---|---|---|---|
| D1 | **Quelle contrainte** : l'ensemble des contraintes accusées = l'ensemble des contraintes réellement violées | la réponse au message (lignes à intitulé) ; les contraintes violées sont **recalculées** depuis la tournée du collègue (`bilan`), jamais recopiées | n'accuse pas avant que l'élève ait répondu ; accuser en plus la contrainte tenue = ko (sinon « tout cocher » gagne) |
| D2 | **Pourquoi** : chiffres justes (poids chargé, heure d'arrivée) | les valeurs écrites dans la réponse / la feuille, comparées au recalcul | tolérance d'écriture (« 14 h 45 », « 14:45 », « 885 ») ; rien en dur |
| R1 | Réparation : charge ≤ charge utile **avec le bon client à quai** | `VTOUR.bilan` | **ne pas récompenser l'inaction** : la tournée du collègue laissée telle quelle = ko (test) |
| R2 | Réparation : train pris | `bilan` (arrivée gare ≤ départ du train) | exige le départ posé |
| R3 | Réparation : créneau tenu | `bilan.creneauRate` | exige le départ posé (sans lui l'heure est trop tôt) |
| R4 | Réparation : trajet ≤ 10 % de la meilleure tournée qui tient tout | optimum **recalculé** (même énumération qu'ENT-3.2, `optimum()`), jamais recopié | tournée qui ne tient pas tout = ko |

Un jalon faux ne fait tomber que lui. Si le diagnostic est faux mais la réparation juste (ou l'inverse), les jalons le disent séparément.

## 6. Contenu (données)

Fichiers à créer : `contenus/boost-ent33.js` (la séance) et `activites/boost-ent33.js` (`meta`), **calqués sur** `contenus/boost-ent32.js` /
`activites/boost-ent32.js`. **Pas de nouvelle carte** si la journée d'ENT-3.2 est reprise : importer `contenus/boost-ent32-carte.js`
(vérifier qu'une séance peut importer la carte d'une autre sans effet de bord ; sinon la partager proprement).

**La tournée du collègue** — **ne pas figer à la main : l'énumérer.** Contraintes de la journée d'ENT-3.2 (départ 14 h 10, train 16 h 10, 180 kg,
12 km/h, 6 min/arrêt, créneau de la Pâtisserie Arnaud avant 14 h 45 ; 230 kg au total ; seule la Cave Teissier (52 kg) suffit à passer
sous 180 kg) :

- exigence : la tournée du collègue viole **exactement deux contraintes sur trois**, la troisième est **tenue** (leurre qui teste que
  l'élève n'accuse pas à tort) ;
- elle doit **découler d'un raisonnement plausible** écrit dans son mail (« au plus court », « j'ai tout pris pour ne pas refaire le trajet »…) ;
- **repère déjà calculé** : l'ordre le plus court qui écarte la Cave Teissier (c4 c3 c8 c1 c2 c7 c6, 11,00 km, gare 15 h 47) **tient le train mais rate
  le créneau** — c'est l'erreur « au plus court » ; la variante « tout charger » ajoute la surcharge (230 kg > 180). **À recalculer** par le code, pas à recopier ;
- **avant de coder**, Claude Code présente à Tristan **2 ou 3 tournées candidates chiffrées** (contraintes violées, km, heures) et lui laisse choisir.

## 7. Demandes au moteur (si le moteur ne sait pas faire)

**Demande n° 1 — état initial d'une tournée** (dans `core/types/tournee.js`, + `carte.js` pour les points déjà posés) : une séance doit pouvoir déclarer
un **état de départ** de la tournée : points déjà posés (tous), **ordre de passage**, **qui est à quai**, départ posé. Exigences, **non négociables** :

1. **joué une seule fois** (comme `volet.semer`), marqué dans la base de l'élève : **ne jamais réécraser le travail de l'élève** à
   l'ouverture suivante, au remontage ni au redessin (c'est le piège le plus probable : un test le garde, sabotage à l'appui) ;
2. **jamais destructif** : l'élève peut tout modifier et retrouve l'état du collègue par « Recommencer la tournée » (question ouverte n° 3) ;
3. la tournée pré-remplie se **compte comme les autres** pour le bilan (arrivées, créneaux, charge) : même code que les clics ;
4. en dehors de cette séance, rien ne change (ENT-3.1, ENT-3.2 et la page d'essai ne bougent pas).

**Demande n° 2 (si absente)** : une façon de **ne pas afficher** les pastilles « limite respectée / horaire tenu / créneau tenu » (elles disent le diagnostic).
Vérifier d'abord si un réglage existe (ENT-3.4 en aura besoin aussi : en copie rendue, la tournée est « sans verdict »). Réutiliser ce réglage plutôt qu'en créer un.

Inscrire ces demandes au tableau (`docs/decisions.md`), un seul chantier moteur à la fois.

## 8. Tests attendus

Bloc `boost` (`outils/test/boost.mjs`), cas préfixés **« ENT-3.3 »**. Moteur : un cas d'état initial par exigence ci-dessus.

- état initial posé à l'ouverture ; **survit au redessin, au remontage et à la reconnexion sans écraser une modification de l'élève** ;
- les contraintes violées par la tournée du collègue sont **exactement celles du brief** (recalculées par le code, et **écrites à la main** dans le test) ;
- D1 : réponse juste = ok ; accuser aussi la contrainte tenue = ko ; **aucune réponse = ko** ;
- D2 : chiffres justes sous plusieurs écritures ; chiffres faux = ko ;
- R1-R4 : **tournée du collègue laissée intacte = tous ko** ; bonne réparation = tous ok ; réparation qui tient tout mais à plus de 10 % = R4 ko seul ;
- jauges muettes **sans fuite** (ni à l'écran, ni dans un message de refus) ;
- `test-seances.mjs` vert ; liste Logisim de `outils/test/socle.mjs` **allongée de ENT-3.3** (accord de Tristan déjà donné pour cette ligne).

**Sabotages à éprouver** (script qui remplace une chaîne, lance le bloc, restaure) : état initial réécrasé à la réouverture ; jauge parlante ; pastille
visible ; D1 qui accepte « tout cocher » ; R1 qui accepte la tournée du collègue ; optimum recopié au lieu de recalculé ; créneau jugé sans le départ.

## 9. Supports pour les élèves

- Trame élève : **non** pour l'instant (déclarer `trame:` = valider ; après validation de Tristan, modèle `prepalog-trame-ent21.md`).
- Corrigé : **non** pour l'instant (à écrire après validation).
- Diaporama / fiche enseignant : non.

## 10. Critères de validation par Tristan

Dans le site en local (`lancer.bat`) ou `http://localhost:8000/outils/essai-carte.html` : (1) à l'ouverture la tournée du collègue est **déjà là**, et je peux la
modifier sans qu'elle revienne seule ; (2) **rien à l'écran ne me dit quelle contrainte est violée** : je dois calculer ; (3) laisser la tournée telle quelle ne me
donne **aucun** jalon de réparation ; (4) accuser la mauvaise contrainte me coûte le jalon D1 ; (5) l'erreur du collègue **a l'air plausible** (je me serais fait avoir) ;
(6) aucune erreur dans la console.

## 11. Questions ouvertes

- [x] **1. Même journée qu'ENT-3.2 ou nouvelle ?** *Recommandation : même carte et mêmes clients* (carte déjà vérifiée et calibrée ; pas de nouveau géocodage ;
      l'attention va au diagnostic). Risque : un élève qui se souvient de la solution d'ENT-3.2 répare sans diagnostiquer — d'où D1/D2 notés. À trancher par Tristan.
- [x] **2. Une ou deux contraintes violées ?** *Recommandation : deux sur trois, la troisième en leurre.* À confirmer.
- [x] **3. « Recommencer la tournée » : remet-il la tournée du collègue (recommandé) ou une tournée vide ?**
- [x] **4. « Diagnostic noté à part » : jusqu'où ?** Deux groupes de jalons étiquetés dans le suivi (si faisable sans toucher à `core/prof.js`) ou seulement des jalons distincts ?
- [x] **5. Barème** : 6 jalons ? Les 4 de réparation à poids égal ?
- [x] **6. Prénom et rôle du collègue** (réels du métier, prénom inventé) — **Inès, livreuse vélo-cargo** (choix de Tristan, 02/10).

---

## Compte rendu *(rempli par Claude Code le 02/10/2026)*

- **Fichiers créés / modifiés** :
  - `contenus/boost-ent33.js` (créé) : la séance — tournée d'Inès, message, lecture de la réponse, 6 jalons ;
  - `activites/boost-ent33.js` (créé) : `meta`, **`id: 'boost-ent33'`**, `code: 'ENT-3.3'`, `temps: 'erreur'`, `pret: false` ;
  - `activites/index.js` : une ligne (après ENT-3.2) ;
  - `outils/test/boost.mjs` : 16 cas « ENT-3.3 » ajoutés à la fin du bloc (aucun cas existant réécrit) ;
  - `outils/test/socle.mjs` : liste Logisim allongée de ENT-3.3 (accord déjà donné) **et** une entrée
    `'ENT-3.3': ['C2.4', 'erreur']` dans la liste des compétences déclarées (allongement seulement).
  - Chantier moteur (commit précédent `560e6f8`) : `core/types/tournee.js`, `core/types/entreprise.js`.
- **Écarts par rapport au brief** (et pourquoi) :
  - **Réponse à Inès : une ligne par contrainte** au lieu d'une liste fermée (choix de Tristan, 02/10) :
    `Charge utile : (respectée ou dépassée)`, `Train de 16 h 10 : (attrapé ou manqué)`,
    `Créneau de la Pâtisserie Arnaud : (tenu ou raté)`, puis `Poids chargé :`, `Arrivée à la Pâtisserie Arnaud :`,
    `Arrivée à la gare :`. L'élève se prononce aussi sur le leurre ; « tout cocher » n'existe plus, accuser le train = D1 ko.
  - **D2 demande trois chiffres** (poids chargé, arrivée chez le client à créneau, arrivée à la gare), y compris celui
    du leurre : le train « tenu » se prouve aussi. Tolérance : poids exact, heures à ±1 min (« 15 h 27 », « 15h27 »,
    « 15:27 », « 927 » acceptés).
  - **Pas de menu « Plan de Nîmes »** : tous les clients sont déjà sur la carte, la tournée porte le plan elle-même.
  - **Pas de `niveaux: ['1re']`** : ENT-3.1 et ENT-3.2 n'en déclarent pas ; restreindre la seule ENT-3.3 aurait fermé la
    suite du parcours à une classe qui a fait les deux premières. **Confirmé par Tristan (02/10) : pas de niveau.**
  - **Base partagée `jeuId: 'boost'`** comme ENT-3.2 (le modèle), alors que `CLAUDE.md` dit « une base par séance » :
    la tournée est cloisonnée par `transportId: 'boost-ent33'`, le message par le volet `boost-ent33`.
  - Sans réponse envoyée, D1/D2 sont « en attente » (convention d'ENT-2.3), jamais « ok ».
- **Décisions prises en route** :
  - Même journée qu'ENT-3.2 : la carte, les clients, la feuille de calcul et la meilleure tournée (`optimum()`)
    sont **importés** de `contenus/boost-ent32.js`, rien n'est recopié.
  - Diagnostic attendu **recalculé** depuis la tournée d'Inès par le bilan du moteur : 218 kg pour 180 (surcharge),
    Pâtisserie Arnaud ≈ 15 h 27 pour 14 h 45 (créneau raté), gare ≈ 15 h 50 pour 16 h 10 (train tenu, leurre).
  - Le mail d'Inès porte la fiche des huit commandes et les contraintes, mais **ni le total, ni le poids chargé,
    ni aucune heure d'arrivée** (gardé par un test). Son raisonnement : « une commande à quai — la plus petite » et
    « le plus court donne de la marge partout ».
  - Jalons : D1 `contraintes`, D2 `preuves`, R1 `charge` (bonne commande à quai **et** ≤ 180 kg), R2 `horaire`,
    R3 `creneau`, R4 `trajet` (≤ 10 % de la meilleure). Titres préfixés « Diagnostic · » / « Réparation · » : c'est
    l'étiquetage, sans toucher à `core/prof.js`. La tournée d'Inès intacte vaut 0 jalon de réparation (surchargée,
    et un garde explicite « encore celle d'Inès » en double sécurité).
- **Tests** : bloc `boost` 79/79 ; suite entière **327/327** ; `test-seances.mjs` vert. **Sabotages éprouvés (7, tous font
  tomber au moins un cas)** : état initial reposé à chaque ouverture ; `sansVerdict` retiré (jauges parlantes, pastilles) ;
  D1 qui accepte « tout accuser » ; D2 qui tolère 50 kg ; R1 qui accepte la tournée d'Inès ; optimum recopié (faux) au
  lieu de recalculé ; créneau jugé sans le départ. Le garde « tournée encore celle d'Inès » seul ne fait rien tomber :
  il double la règle de surcharge, c'est voulu.
- **Commits** : voir `git log` — « ENT-3.3 : la tournée à corriger… » puis « Journal : ENT-3.3… ».
- **Reste ouvert** :
  - **Validation à l'écran par Tristan** (critères du §10), puis `pret: true`.
  - Trame élève et corrigé : après validation.

