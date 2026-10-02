# Brief de séance — ENT-3.3 Boost « La tournée à corriger »

**Statut** : en cours — chantier moteur (§7) livré le 02/10/2026, séance à construire *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
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

- [ ] **1. Même journée qu'ENT-3.2 ou nouvelle ?** *Recommandation : même carte et mêmes clients* (carte déjà vérifiée et calibrée ; pas de nouveau géocodage ;
      l'attention va au diagnostic). Risque : un élève qui se souvient de la solution d'ENT-3.2 répare sans diagnostiquer — d'où D1/D2 notés. À trancher par Tristan.
- [ ] **2. Une ou deux contraintes violées ?** *Recommandation : deux sur trois, la troisième en leurre.* À confirmer.
- [ ] **3. « Recommencer la tournée » : remet-il la tournée du collègue (recommandé) ou une tournée vide ?**
- [ ] **4. « Diagnostic noté à part » : jusqu'où ?** Deux groupes de jalons étiquetés dans le suivi (si faisable sans toucher à `core/prof.js`) ou seulement des jalons distincts ?
- [ ] **5. Barème** : 6 jalons ? Les 4 de réparation à poids égal ?
- [ ] **6. Prénom et rôle du collègue** (réels du métier, prénom inventé) — proposition de Claude Code à valider.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** : bloc / suite entière, nombre de cas, sabotages éprouvés
- **Commits** : *(hash + message)*
- **Reste ouvert** :
