# Fiche d'une séance (activité)

À lire avant d'écrire ou de modifier une activité. Tout ce qui suit est relevé dans le code
au 08/10/2026 ; en cas d'écart, c'est le code qui a raison, et cette fiche est à corriger.

Une séance, c'est **un fichier** `activites/<id>.js` et **une ligne** dans `activites/index.js`.
L'accueil, les droits, la sauvegarde des scores, le suivi de classe et le tableau par compétence
suivent tout seuls.

## Ce que le fichier doit exporter

### Une séance d'entreprise : la fabrique `seanceEntreprise` (chantier 8, 08/10/2026)

C'est **la forme à utiliser** pour toute séance d'entreprise (Simulog). La fabrique est dans
`core/types/seance-entreprise.js` ; elle déduit tout ce qui était recopié d'un fichier à l'autre, et le fichier
de séance tient en une vingtaine de lignes. Modèle (`activites/picard-ent42.js`, sans son en-tête) :

```js
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import * as PICARD from '../contenus/picard.js';            // l'univers de l'entreprise (commun à ses séances)
import * as SEANCE from '../contenus/picard-ent42.js';      // le contenu de CETTE séance (ETAPES, ACCUEIL, VOLET…)
const s = seanceEntreprise(PICARD, SEANCE, {
  id: 'picard-ent42', code: 'ENT-4.2', titre: '…', desc: '…', niveaux: ['1re'],
  competences: ['C1.4', 'C1.3'], temps: 'entrainement', trame: 'picard-deux-camions', pret: true, ouverture: 'prof',
}, { menu: [], CATALOGUE: PICARD.catalogue(SEANCE.PRODUITS_ENT42), exercice: '…', quai: SEANCE.QUAI_ENT42 });
export const meta = s.meta;
export const rendre = s.rendre;
// export const noter = s.noter;   // seulement pour une évaluation (`copie: true`)
```

Les trois arguments : l'**univers** (ce que toutes les séances de l'entreprise partagent), le **contenu de la
séance**, le **`meta`** (la déclaration, voir plus bas) ; puis les **options** de `creerEntreprise` propres à la séance.

**Ce qui est déduit** (une valeur écrite dans `meta` l'emporte toujours) :

| Où | Déduit | De quoi |
|---|---|---|
| `meta` | `rubrique: 'simulog'`, `immersif: true`, `portee: 'eleve'`, `tables: {}` | valeurs fixes |
| `meta` | `bareme` | nombre de jalons, `SEANCE.ETAPES.length` (écrire `bareme: 20` pour une séance à jalons pondérés) |
| `meta` | `corrige` | `./contenus/corriges/<code>.js` ; `corrige: false` = pas de corrigé (ENT-5.3), la clé disparaît |
| moteur | `ENTREPRISE`, `VOCAB`, `CATALOGUE`, `SUPPLIERS`, `SUP_BY_ID`, `CUSTOMERS`, `CM`, `baseDeDepart`, `THEME` | l'univers (les neuf sont exigées) |
| moteur | `couleurs`, `livraisons` (facultatives) | l'univers, puis le contenu de la séance, puis les options ; absentes, elles ne font rien refuser |
| moteur | `etapes`, `accueil`, `volet`, `tirage` | `SEANCE.ETAPES` (exigée), `SEANCE.ACCUEIL`, `SEANCE.VOLET`, `SEANCE.TIRAGE` (tirage mémorisé, 09/10/2026) |
| moteur | `copie` | `meta.copie` |
| moteur | `trame: { pdf, docx }` (liens du bandeau) | `./contenus/trames/<code>-<nom>-trame-eleve.pdf` / `.docx`, où `<nom>` est écrit **une fois** dans `meta.trame` (`trame: 'picard-deux-camions'`) : il ne se déduit pas de l'`id`. Sans `meta.trame`, pas de trame. `meta.trame` n'est pas dans le `meta` rendu. |

**Remplacer une valeur** — du plus faible au plus fort : **l'univers** < **le contenu de la séance** (une clé de même
nom exportée par `contenus/<séance>.js`, par exemple un `CATALOGUE` ou une `baseDeDepart` propre à la séance :
Cdiscount) < **les options** (Picard fabrique son `CATALOGUE` par `PICARD.catalogue(SEANCE.PRODUITS_ENT42)` ; Smoby
ENT-5.7 réécrit `ENTREPRISE` et `VOCAB` pour l'agence Kuehne+Nagel). Tout le reste (`menu`, `quai`, `plan`, `tournee`,
`planning`, `entrepot`, `fiche`, `lexique`, `finFige`, `stockOuvert`, `exercice`, `transportSection`, `transportId`,
`sansTrame`, `receptionLitige`, `tableur`, `inventaire`…) se range dans les options et part tel quel au moteur ; la
liste complète est la table « Les options de `creerEntreprise` » plus bas. Une trame déjà au format `{ pdf, docx }` se passe aussi dans
les options (elle remplace la trame déduite).

**Deux clés d'univers sont facultatives** (lot 9b, 08/10/2026) : `couleurs` (noms et teintes des couleurs des variantes d'un
catalogue) et `livraisons` (modes de livraison des commandes et prix du port). Le moteur n'importe plus aucun fichier de
`contenus/` : c'est l'univers qui les exporte (`contenus/spartoo.js` : les deux ; `contenus/cdiscount.js` : `livraisons`), la
fabrique les prend dans l'ordre habituel (univers, contenu de la séance, options) et ne refuse rien si elles manquent. Un univers
dont les commandes portent un code `ship` doit exporter `livraisons` ; sans la table, la commande s'affiche avec le code lui-même
comme libellé et un port de 0.

**Ce que la fabrique refuse** (la séance ne se charge pas, le message est en français et nomme la séance) : un `meta`
sans `id` ou sans `code`, un contenu de séance sans `ETAPES`, une clé d'univers absente de l'univers, du contenu et des
options, une `meta.trame` qui n'est pas un nom, `correction: true` sans aucun jalon à `ecran`. Le moteur ajoute les siens (clé d'option inconnue, mauvais type, `id` de vue manquant ou en double : voir la table des options ci-dessous), et la fabrique y met le nom de la séance. Le code de la fabrique est aussi décrit dans son en-tête.

**Exports du fichier** (la forme migrée n'en a que deux ou trois) :

| Export | Obligatoire | Rôle |
|---|---|---|
| `meta` | oui | La déclaration (voir plus bas). `s.meta`. |
| `rendre(hote, ctx)` | oui | Dessine la séance dans `hote` (un élément du DOM). `s.rendre`. |
| `noter(db)` | pour une évaluation (`copie: true`) | Calcule le score à partir de la base de l'élève. `s.noter`. |
| `graines` | non | Contenu de départ que l'enseignant peut installer (bouton « semer »). |

### Les options de `creerEntreprise` — la table qui fait foi (chantier 9, lot 9a, 08/10/2026)

Tout ce qu'une séance peut passer à `creerEntreprise` (directement, ou dans le quatrième argument de
`seanceEntreprise`) est dans **`OPTIONS`**, dans `core/types/entreprise-options.js` : 49 options (15/10/2026), une ligne chacune. Le tableau
ci-dessous la reprend ; si les deux se contredisent, c'est `OPTIONS` qui a raison. **Une option absente de `OPTIONS` fait
refuser la séance** : le message (en français) nomme la clé, propose la bonne casse s'il s'agit d'une faute de majuscule, et
liste les clés connues ; avec la fabrique il nomme aussi la séance. Un type qui n'est pas celui du tableau est refusé de la même
façon (`null` et `undefined` valent « absent »). Deux fiches (ou deux animations) de même `id`, ou une vue (quai, planning,
plan d'entrepôt, fiche, animation) sans `id` texte non vide, sont refusées aussi : l'état de l'élève est rangé sous cet `id`
(`db.fiches[id]`…). Un test relit le code du moteur : une option lue et absente de `OPTIONS` (ou l'inverse) fait échouer la suite.
**Ajouter une option au moteur = une ligne dans `OPTIONS` (`core/types/entreprise-options.js`) + une ligne ici.**

| Option | Type | Rôle | Séance modèle |
|---|---|---|---|
| `ENTREPRISE`, `VOCAB`, `CATALOGUE`, `SUPPLIERS`, `SUP_BY_ID`, `CUSTOMERS`, `CM`, `baseDeDepart`, `THEME` | objets (`SUPPLIERS`, `CUSTOMERS` : tableaux ; `baseDeDepart` : fonction) | L'univers de l'entreprise : identité, mots, articles, tiers, base de l'élève, charte. Tirées de l'univers par la fabrique (les neuf sont exigées) ; une séance peut en remplacer une (ci-dessus). | `activites/picard-ent42.js` (`CATALOGUE`) |
| `etapes` | tableau | Les jalons ; le score est le nombre de jalons réussis. Lu de `SEANCE.ETAPES` par la fabrique. | toutes |
| `accueil` | objet | La marche à suivre de l'écran d'accueil. Lue de `SEANCE.ACCUEIL`. | toutes |
| `volet` | objet | Messages et livraisons semés dans la base de l'élève, déclencheurs (voir plus bas). Lu de `SEANCE.VOLET`. | `activites/cdiscount-chiffres.js` |
| `exercice` | texte | La ligne de consigne sous « Bonjour {prénom} » (sinon `ENTREPRISE.exercice`). | `activites/picard-ent42.js` |
| `trame` | objet `{ pdf, docx }` | Liens de trame et de corrigé du bandeau. Déduite par la fabrique de `meta.trame` ; une trame passée ici la remplace. | `activites/picard-ent42.js` |
| `sansTrame` | texte | Phrase du bandeau quand tout se fait à l'écran ; sans effet si `trame` est là. | `activites/smoby-visite.js` |
| `copie` | booléen | Évaluation : copie rendue une seule fois, note figée (voir `noter`). Déduite de `meta.copie`. | `activites/picard-ent44.js` |
| `menu` | tableau | Les écrans de **données** gardés au menu, parmi `commandes`, `receptions`, `stock`, `catalogue`, `blocage`, `clients`, `fournisseurs`, `console` (un nom inconnu refuse la séance). Sans `menu`, tous restent. | `activites/picard-ent42.js` (`menu: []`) |
| `fermetures` | objet | `{ écran: { ouvertSi(db, séance), message } }` : l'entrée du menu reste visible, grisée avec le message, tant que `ouvertSi` est faux (élève seulement). `ouvertSi` reçoit aussi l'id de la séance (depuis le 14/10/2026 : `dialogueFini(id)`). | `activites/spartoo-reception.js` |
| `stockOuvert` | booléen | L'écran Stock s'ouvre sans le code de l'enseignant (Smoby). Sans l'option, il reste verrouillé (Spartoo : il pousse vers la console `.getstock`). | `activites/smoby-visite.js` |
| `receptionLitige` | booléen | Ajoute « En litige (zone litiges) » aux décisions du bon de réception ; la ligne n'entre pas en stock. | `activites/smoby-rangement.js` |
| `couleurs` | objet | `{ code: [nom, teinte] }` : noms et teintes des couleurs des variantes (pastilles du catalogue, colonne Couleur). Sans table, pas de pastille. **Facultative**, exportée par l'univers. | `contenus/spartoo.js` |
| `livraisons` | objet | `{ code: [libellé, prix du port] }` : modes de livraison des commandes (`ship`). Code inconnu : le code tel quel, port de 0. **Facultative**, exportée par l'univers. | `contenus/spartoo.js`, `contenus/cdiscount.js` |
| `lexique` | objet | Mots cliquables `{ MOT: définition }` : `[[MOT]]` ou `[[mot|affiché]]` dans les textes du contenu. | `activites/smoby-visite.js` |
| `transportSection` | texte | Nom du groupe de menu qui porte plan et tournée (« Transport » par défaut). | `activites/boost-ent32.js` |
| `transportId` | texte | Clé de `db.transport` partagée entre deux séances (sinon l'`id` de la séance). | `activites/boost-ent32.js` |
| `plan` | objet | Plan schématique, ou carte réelle avec `plan.carte`. | `activites/boost-ent32.js` |
| `carteItineraires` | objet | Carte des itinéraires d'un point A à un point B par plusieurs modes (route, barge, rail), sur une carte réelle ; consultée, jamais notée. Voir « Vue « Carte des itinéraires » » plus bas. | (Decathlon ENT-7.x, à venir) |
| `tournee` | objet | La tournée à construire sur le plan (options dans l'en-tête de `core/types/tournee.js`). Depuis le 18/10/2026 (MOTEUR-chep lot A) : une mesure en **profil** (`depart: 0 \| 'somme'`, `depose`, `reprend`, `libelleDepasse` : la charge monte et descend, le **pic** compte, jauge en marches ; le bilan donne `profils`, `pics`, `charges`), `quai: { libelle, titre, reprendre, vide, max }`, `id` (sert aux gestes), `quand(db)` (hors du menu tant que faux), `horaire.libelleRate` (18/10/2026 : « quai fermé à l’arrivée » à la place de « Créneau raté (de N min) », pastille et refus du report, jamais « de combien »). Depuis le 18/10/2026 (MOTEUR-tournee-points-par-eleve) : `points` accepte une fonction `(db) => […]` pour une séance tirée par élève — **les ids sont fixes** (ceux de la base vide, donc du plan), **les valeurs sont par élève** (`vides`, `kg`, `creneau`…) ; le contenu passe alors la base à son bilan, `VUE.bilan(etat, db)` (voir « Fonction de la base de l'élève »). | `activites/boost-ent32.js` ; profil : `outils/essai-tournee-ramasse.html` (CHEP ENT-9.2, à venir) |
| `quai` | objet ou fonction | Quai de réception (voir « Vue quai ») ; une **fonction de la graine** = un quai tiré par élève. | `activites/picard-ent42.js` ; tiré : `activites/picard-ent44.js` |
| `planning` | objet | Planning : cartes sur une grille (voir « Vue Planning »). | `activites/smoby-arrivee.js` |
| `entrepot` | objet | Plan d'entrepôt : rangement, préparation, visite, stockage de masse (et comptage), allée de picking (voir « Vue Plan d'entrepôt »). | `activites/smoby-rangement.js` |
| `inventaire` | objet ou fonction | Inventaire ; une **fonction de la graine** = un inventaire tiré par élève. | `activites/cdiscount-inventaire.js` ; tiré : `activites/cdiscount-compte-a-rebours.js` |
| `tableur` | objet | Geste tableur : extractions, exporter, déposer (voir « Geste tableur »). | `activites/cdiscount-chiffres.js` |
| `documents` | tableau | Documents joints lus sans saisie `[{ id, titre, court, html }]` ; un mail les joint par `pieces`. | `activites/smoby-recrutement.js` |
| `documentsStyle` | texte | Mise en page CSS des documents joints (règles imbriquées sous `.ent-doc`). | `activites/smoby-recrutement.js` |
| `fiche` | objet | Une fiche à remplir. | `activites/smoby-arrivee.js` |
| `fiches` | tableau | Plusieurs fiches à remplir (la première garde l'écran `fiche`, les autres `fiche:<id>`). | `activites/smoby-lettre-voiture.js` |
| `pastilles` | tableau | Pastilles d'étape de la séance, `[{ libelle, fait(db) }]`, une bande sur tous les écrans (D-10). | `activites/france-boissons-retour.js` |
| `suite` | tableau | L'ordre des écrans de travail, `[{ vue, libelle, fait(db, séance), mail? }]` (CAP, ENT-8.1 et 8.2, 16/10/2026) : une barre **« Étape suivante : <libelle> — Y aller → »** sur tous les écrans sauf celui de l'étape (vers le point d'étape quand il garde l'écran fermé, vers la Messagerie quand l'écran n'est pas encore ouvert et qu'un message n'est pas lu), et le groupe « Mon poste » du menu dans cet ordre. `vue` : 'fiche', 'fiche:<id>', 'planning', 'entrepot', 'localiser', 'mail' (avec `mail` : l'id de la réponse par phrases). Rien quand le bandeau de fin est là. | `contenus/action-ent82.js` |
| `animation` | objet | Une animation à questions (et ses écrans de présentation, D-5). | essais seulement (aucune séance ne la passe encore) |
| `animations` | tableau | Plusieurs animations (rare). | essais seulement |
| `telephone` | objet | Écran « Téléphone » : appels où l'élève choisit ses répliques, contacts sans dialogue (voir « Vue « Dialogue à choix » »). | essai (`contenus/dialogue-essai.js`) ; Decathlon ENT-7.2 (`contenus/decathlon-ent72.js`), 7.3 et 7.4 à venir |
| `localiser` | objet | Carte de France : l'élève situe chaque lieu en trois clics guidés (région → département → ville), trajet de la marchandise à la fin (voir « Vue « Localiser » »). | essai (`contenus/localiser-essai.js`) ; Action ENT-8.1 à venir |
| `courriel` | objet | Écran « Nouveau courriel » de la messagerie : carnet (liste du champ À), pièces jointes, réponse automatique, brouillon (voir « Nouveau courriel et fiche enregistrée »). Sans elle, « Nouveau message » (fournisseurs) ne change pas. | essai (`contenus/courriel-essai.js`) ; Decathlon ENT-7.2 (`contenus/decathlon-ent72.js`) |
| `questions` | objet | Questions au fil et points d'étape (voir « Questions au fil »). | essais seulement (aucune séance ne la passe encore) |
| `equipe` | objet | Personnes citées par les questions, en plus de `questions.personnes` ; destinataires d'un message à transférer (`transfert.a`). | essai des questions (`contenus/questions-essai.js`) |
| `tirage` | (sans contrôle de type) | **Tirage mémorisé** : la déclaration `declarerTirage({ banques, … })`, que la fabrique prend dans `SEANCE.TIRAGE` (voir « Tirage mémorisé et banques »). Ou vrai (forme d'avant) = jeu tiré par élève même sans quai ni inventaire tiré : la graine est posée et inscrite dans le détail de la note. | `contenus/tirage-essai.js` (essai seulement) |
| `seanceFinie` | fonction | `(db) → booléen` : la séance est finie sans jalon faux (ENT-5.6 : préparation terminée et vérifiée). | `activites/smoby-preparation.js` |
| `finFige` | texte | Phrase du bandeau de fin quand une case fausse ne se rouvre plus (ENT-5.4 : le BL est signé). | `activites/smoby-reception.js` |
| `reponsesFournisseur` | tableau de fonctions | `(corps, fournisseur, db, prénom) → réponse` ; la première qui rend quelque chose remplace la réponse automatique du fournisseur. | `activites/spartoo.js` |

La table ne contient pas `correction`, `suiteAuBilan`, `parcours`… : ce sont des champs du **`meta`** (tableau « Base de
l'élève, parcours, affichage » plus bas), lus par le moteur à l'ouverture dans `ctx.meta`, pas des options.

### Forme longue : `creerEntreprise` directe, toujours valide

Les anciens fichiers (et ceux qui ne sont ni d'une entreprise Simulog, ni faits pour `creerEntreprise`) écrivent tout
à la main : `meta` complet (`rubrique`, `immersif`, `portee`, `tables`, `bareme`, `corrige`…), puis les options.
La fabrique n'impose rien au moteur, les deux formes se valent à l'exécution :

```js
const moteur = creerEntreprise({ ENTREPRISE, VOCAB, CATALOGUE, …, etapes, accueil, volet });
export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
export const noter = (db) => moteur.noter(db);   // évaluation seulement
```

Une séance qui n'est pas une séance d'entreprise (quiz, tableur, magasin…) exporte `meta` et `rendre` à la main.

Un `volet` sème ses messages à l'ouverture (`semer`). Il peut aussi déclarer des messages qui
arrivent **plus tard**, une seule fois, quand le travail de l'élève rend une condition vraie :
`declencheurs: [{ id, quand(db), semer(prenom, db), phaseTournee }]` (modèle : l'imprévu
d'ENT-3.2). `phaseTournee` fait passer la tournée à une phase déclarée dans `tournee.phases`
(client annulé, créneau déplacé, écran sans verdict) : voir l'en-tête de `core/types/tournee.js`.
Les conditions toutes faites sont dans `core/declencheurs.js` : `quand: apresMail({ a: CHEFFE.mail,
ligne: 'Stock actuel :', nombre: true })` (l'élève a envoyé un compte rendu à cette adresse, **juste ou
faux** — modèle : ENT-2.1), `quand: apresJalon(ETAPES, 'id')` (réservé à une étape dont l'élève voit
lui-même qu'elle est finie), `tous(…)` pour combiner. Jamais de clic de menu, d'écran ouvert ni de
minuterie. Si l'élève a pu recevoir ces messages autrement (séance déjà ouverte), `semer` vérifie
par l'objet qu'ils ne sont pas déjà là.
Un message déclenché (ou l'accusé d'un envoi corrigé, `volet.corrections`) s'annonce par une **carte qui
reste** en haut à droite, sur tous les écrans, jusqu'à ce que l'élève l'ouvre ou la ferme (×) ; réduite à une
ligne au bout de 8 s, trois au plus. La séance n'a rien à déclarer : c'est le moteur (lot 1 de
`MOTEUR-questions-au-fil`, 08/10/2026). La bulle ne dit plus que la confirmation d'un envoi.

**Réponse par phrases à choisir** (2de, 04/10/2026, `core/phrases.js`, lot 2 de `MOTEUR-2de-S1`) : un
mail semé (volet ou déclencheur) peut porter `phrases: { id: 'reponse-sophie', lignes: [{ id: 'salut',
choix: ['Bonjour Sophie,', 'Salut !'], juste: 0 }, { id: 'recu', texte: 'Ligne imposée.' }, …], melanger:
true }`. « Répondre » ouvre alors une liste déroulante par ligne (ordre tiré par élève, rangé avec le
mail) et l'aperçu ; « Envoyer » exige un choix à chaque ligne et range un mail envoyé ordinaire
(`apresMail` marche, juste ou faux). `choix` et `juste` peuvent être des fonctions `(db) => …`,
calculées une fois quand le mail entre dans la base ; `juste` = rang dans l'ordre **déclaré**. Pas de
correction avant l'envoi. Jalon : `phrasesJustes(db, 'reponse-sophie')` → `{ envoye, justes, faux,
envois, premierCoup }`, lu sur le **dernier** envoi ; rien d'envoyé = toutes les lignes fausses. Une
ligne `texte` n'est jamais jugée. Seulement en **réponse** à un mail reçu (pas de « Nouveau message »
par phrases : faire écrire d'abord le destinataire). Essai : `outils/essai-2de.html`.

**Deux règles pour les messages d'une séance** (décision de Tristan, 10/10/2026, prise sur ENT-6.2 et valable pour toutes
les séances France Boissons à venir, ENT-6.3 → 6.10) :
- **Un personnage qui répond à l'élève reprend ce que l'élève lui a écrit, sans corriger.** Le message déclenché après une
  réponse par phrases se construit sur les choix du **dernier** envoi (« Ok pour la Pelforth, à samedi ! » si l'élève a promis
  samedi), jamais sur la réponse juste : sinon il contredit l'élève et lui souffle la solution. Il ne dit ni « juste » ni
  « faux » ; c'est le bilan qui corrige, et la séance suivante repart sur les données justes. Modèle : `texteReponseMalo`
  et les tableaux `CHOIX_RUPTURE` / `CHOIX_LIVRAISON` de `contenus/france-boissons-ent62.js` (chaque phrase porte ce que le
  personnage en reprend).
- **Les messages portent la date du scénario, jamais la date réelle** (`ts: Date.now()` affichait « 10/10/2026 » dans une
  séance qui se passe le 15 juin 2027). Chez France Boissons : `heureScenario(iso, hhmm, { db, volet, decalage })` de
  `contenus/france-boissons.js`, pour le semis (heures fixes) comme pour les messages déclenchés et les accusés (heure
  d'ouverture + temps réellement passé depuis l'ouverture + quelques minutes). La Messagerie trie chaque dossier par `ts` :
  garder les heures croissantes dans l'ordre d'arrivée. Limite connue : les messages **envoyés** par l'élève restent datés
  par le moteur à la date réelle (une horloge de séance lue par la Messagerie serait une demande au moteur).

**Transférer un message** (chantier D-1, 09/10/2026, `core/types/transfert.js` ; première séance : ENT-6.1 France
Boissons) : l'élève tient un accueil ou une boîte partagée et transmet chaque message à la bonne personne. Un mail
semé ou déclenché porte une **`cle`** et `transfert: { a: ['helene', 'ines', 'karim', …] }` (ids de l'équipe, dans
l'ordre où la liste s'affiche) ; la séance passe `equipe: EQUIPE` à `creerEntreprise` (`{ ines: { nom: 'Inès Moreau',
role: 'assistante RH', appel?: 'Inès' } }` ; les personnes des questions comptent aussi). Sous le message : « Transférer
à… » → la liste (nom et fonction, sans aplat) → confirmation dans la page (« Transférer le message de <expéditeur> à
<Prénom> ? ») → le message porte « Transféré à Nadia, 8 h 42 », et « ↪ À transférer » / « ↪ Transféré » dans la liste des
messages. **Une fois** : le bouton disparaît au transfert, sauf « Corriger ». Un destinataire inconnu ou une `cle` oubliée
est signalé (console, donc la suite de tests) et le message arrive sans bouton.
- État, cloisonné par séance : `db.transferts[<séance>][<clé>] = { a, at, premier, n, rouvert? }` — `a` / `at` : le
  **dernier** destinataire et son heure ; `premier` : le destinataire du premier transfert, écrit une fois ; `n` : le
  nombre de transferts ; `rouvert` : posé par « Corriger », retiré au transfert suivant. Rien pour l'enseignant (il voit
  le bouton, la liste, la confirmation et la mention, rien n'est rangé), rien après la remise d'une copie.
- Jalon : `import { transfertDe } from '../core/types/transfert.js'` ; `transfertDe(db, 'msg-malo', '<id de la séance>')`
  → `{ fait, a, at, premier, n, rouvert }` (**l'id de la séance est obligatoire** : sans lui, le jalon plante). « À faire »
  tant que `!fait` ; le jalon juge **`a`** (le dernier) : le premier bilan est figé par le moteur (`bilan1`), et avant lui
  chaque message n'a qu'un transfert. Un jalon qui jugerait `premier` ne verrait jamais la correction.
- Condition : `quand: apresTransfert('msg-malo')` (`core/declencheurs.js`), vraie au transfert, **juste ou faux** ;
  `apresTransfert()` sans clé : au premier message transféré, quel qu'il soit. Geste `messagerie:transfert` (table des
  gestes ci-dessous), pour une question au fil « au premier transfert ».
- Accusé de réception du destinataire choisi (« Bien reçu, merci. ») : un déclencheur `apresTransfert(<clé>)` dont
  `semer(prenom, db)` lit `transfertDe(db, <clé>, <séance>).a`, et pour un transfert corrigé `volet.corrections[<clé>]
  (prenom, n, db)` (n = 2 au premier transfert corrigé). Jamais « ce n'est pas pour moi ».
- Corriger : le jalon déclare `ecran: 'transfert:<clé>'`. « Corriger » rouvre les messages dont le jalon est faux (le
  premier transfert reste rangé, le jalon reste faux jusqu'au nouveau transfert) et ouvre le premier ; un message juste ne
  se rouvre pas. Un nouveau transfert compte une correction (`n − 1`).
- Gel d'une question au fil : le bouton est grisé, le message se lit.
- Modèle : le message de la brasserie de `contenus/questions-essai.js` (`ETAPE_TRANSFERT`, accusé, `corrections`) ;
  essai : `outils/essai-questions.html`, tests : bloc `questions`.

**Décision « En litige » à la réception** (04/10/2026, ENT-5.5) : `creerEntreprise({ …, receptionLitige: true })`
ajoute « En litige (zone litiges) » aux décisions du bon de réception (écran Réceptions) ; la ligne n'entre pas en
stock, comme une ligne refusée. Sans l'option, les trois décisions habituelles (les séances existantes ne bougent pas).

**Le menu de gauche** (05/10/2026) : `creerEntreprise({ …, menu: ['receptions', 'stock', 'console'] })` choisit les
écrans de **données** affichés parmi `commandes`, `receptions`, `stock`, `catalogue`, `blocage`, `clients`,
`fournisseurs`, `console` (un nom inconnu empêche la séance de se charger). Accueil et Messagerie sont toujours là ;
les écrans propres à la séance (fiche, quai, planning, plan d'entrepôt, plan, tournée, inventaire, extractions,
fichiers) apparaissent dès qu'elle les déclare. Le menu se range en groupes : **Mon poste** (« Transport », ou `transportSection`,
quand il ne contient que le plan et la tournée), **Données**, **Tiers**, **Outils** ; un groupe vide disparaît. Un écran hors du menu
ne s'ouvre pas non plus par une tuile de l'accueil. Sans `menu`, tous les écrans de données restent. Règle de
Tristan : **au moindre doute, l'écran reste**. Les 24 séances d'entreprise le déclarent.

**Stock sans code** : `stockOuvert: true` ouvre l'écran Stock à l'élève sans le code de l'enseignant (Smoby). Sans
l'option, le Stock reste verrouillé (Spartoo : il pousse vers la console `.getstock`).

**Mots cliquables** (2de, 04/10/2026, `core/lexique.js`, lot 3) : `creerEntreprise({ …, lexique: { CACES:
'Une phrase.', … } })`, puis dans n'importe quel texte du contenu (mail, accueil, quai…) `[[CACES]]` ou
`[[cale|calé]]` (mot du lexique | ce qui s'affiche). Le mot devient un bouton souligné ; clic ou Entrée
ouvre la définition dans une bulle, Échap / clic ailleurs / clic sur la bulle la ferment. Recherche sans
majuscules ni accents ; un mot absent du lexique s'affiche en texte normal ; dans un bouton, un lien ou une
liste, le mot reste du texte. Rien n'est transformé sans `lexique`. Chaque ouverture est comptée chez
l'élève (`db.indicateurs[idSeance].mots`), pas chez l'enseignant.

**Documents joints** (04/10/2026, `core/types/documents.js`, brief `MOTEUR-documents-formulaire`, lot 1) :
`creerEntreprise({ …, documents: [{ id, titre, court, html }], documentsStyle: '<css>' })`, et un mail semé
porte `pieces: ['poste', 'yanis', …]`. Sous le texte du mail, une pièce jointe par id (`court`, « · ouvert »
une fois lue) ; un clic ouvre le document dans le lecteur du mail (« ← Retour au message », `titre`,
« ‹ Précédent / Suivant › » entre les pièces du même mail). Le moteur fournit la **feuille de papier**
(`.ent-doc` : fond papier, couleurs du thème clair, 560 px) quel que soit le thème ; `documentsStyle` ne
donne que la mise en page, chaque règle étant imbriquée sous `.ent-doc` (ne touche rien d'autre, retirée à
la sortie). **Piège** : les classes du site (`.pied`, `.note`, `.panneau`, `.btn`…) s'appliquent aussi dans
un document — préférer des noms propres, ou remettre à zéro ce qu'on emprunte (`.pied{margin:0}`). La
mention en pied (« CV fictif — document pédagogique Prepalog ») est écrite par le contenu. Mots cliquables :
seulement ceux que le document marque `[[…]]`. Ouvertures comptées dans `db.indicateurs[idSeance].docs`.
Exemple : `outils/essai-2de-documents.js`.

**Fiche à remplir** (04/10/2026, `core/types/fiche.js`, même brief, lot 2) : `creerEntreprise({ …, fiche: { id,
libelle, titre, sousTitre, documents: [ids], bouton, blocs: […], envoi: { bouton, a, suite } } })` (`envoi: { enregistrer: true, nomPiece }` : fiche enregistrée et jointe à un courriel, voir « Nouveau courriel et fiche enregistrée ») ajoute une
entrée de menu (`libelle`) ; un mail semé portant `ouvreFiche: '<fiche.id>'` montre le bouton `bouton`. Avec
`documents`, ils sont à gauche en onglets (restent à l'écran), la fiche à droite ; l'un sous l'autre si la place
manque. Blocs : `ouinon` (`lignes`, `colonnes`, `entete`), `liste` (`choix: [{ v, lib }]`, `vide`), `choix`
(boutons radio, `choix: ['CDD', 'CDI']`), `encadre` (`titre`, `texte`) ; `manque` = ce que dit « Il manque : … »
pour une liste ou un choix vide. **Rien n'est jugé ni corrigé à l'écran**, même en guidage : c'est le bilan qui
le dit. Envoi refusé tant qu'il manque une réponse (travail gardé) ; envoyée, la fiche est figée. État :
`db.fiches[id] = { valeurs, envoye: { at } }`. Jalon : `ficheEnvoyee(db, id)` → `{ envoye, valeurs, at }`
(`valeurs.tri.yanis.caces === true`, `valeurs.contrat === 'CDD'`) ; l'étape rend `'attente'` tant que la fiche
n'est pas envoyée. Déclencheur : `apresFiche(id)` (vrai à l'envoi, juste ou faux). Exemple : `FICHE` dans
`outils/essai-2de.js`.
Lot 4 (05/10/2026, ENT-5.2) : `cases` (`choix: [{ v, lib }]`, cocher plusieurs ; `valeurs.pieces = ['identite',
'rib']` dans l'ordre déclaré, `[]` si rien : **aucune case cochée n'est pas un manque**, au jalon « rien de trop »
d'exiger au moins une case) et `ordre` (`choix` dans l'ordre **de départ**, mélangé par le contenu, jamais juste ;
flèches ↑ ↓ par ligne, sans redessin ; `valeurs.jour` = toutes les valeurs dans l'ordre de l'élève, l'ordre de départ
si l'élève n'a rien bougé).
Lot 4 suite (05/10/2026, ENT-5.8) : saisies `texte` (`valeur` + `fige: true` = case préremplie non modifiable), `nombre`
(`unite`), `heure` (HH:MM) et `date` (calendrier, rangée `'AAAA-MM-JJ'`), rangées **telles que tapées** à chaque touche,
sans redessin ; les jalons les lisent avec `lireNombre` (« 6 091 », « 2,5 ») et `lireHeure` (« 11:00 », « 11h00 », « 11 h »)
de `core/types/fiche.js`. Une saisie vide « manque » ; envoyée vide, elle vaut `null`. Entrée dans une case n'envoie jamais.
`cadre` (`titre`, `blocs`, `large`) encadre des blocs comme les cases numérotées d'un document ; `grille: true` les pose sur
deux colonnes ; `entete` (HTML) et `pied` (mention de reconstitution) sur la fiche. `envoi: { incomplet: true }` laisse
partir la fiche avec des cases vides (à un jalon de dire « incomplète »). **Plusieurs fiches** : `fiches: [F1, F2]`, une
entrée de menu chacune (la 1re garde l'écran `fiche`, les autres `fiche:<id>`) ; une fiche qui porte `quand(db)` (ex.
`apresFiche('lettre')`) n'apparaît, au menu comme au bouton de son mail (`ouvreFiche`), qu'une fois la condition vraie.
Exemple : `contenus/smoby-ent58.js` (lettre de voiture, suivi du retard).

**Case « nombre » bornée** (chantier D-2, 09/10/2026, brief ENT-6.2 §7) : `{ type: 'nombre', id, lib, unite: 'fûts', min: 0,
entier: true, manque: 'les fûts' }`. `unite` s'affiche **après** la case ; la case n'a aucun aplat. `entier: true` refuse une
virgule, `min` refuse tout nombre plus petit, et un texte qui n'est pas un nombre est refusé dès que l'un des deux est déclaré
(**sans `min` ni `entier`, rien n'est vérifié** : c'est le cas d'ENT-5.8, où un jalon juge « 6 091 kg »). Le refus a lieu **à
l'envoi**, jamais pendant la frappe (rien n'est jugé à l'écran), et dit pourquoi sous le bouton, après les « Il manque » : «
À corriger : Heineken fût 30 L : un nombre entier est attendu (sans virgule). » ; la fiche reste ouverte, le travail gardé.
Une case vide n'est pas un refus : elle « manque » (ou part vide avec `envoi.incomplet`). `refus: '…'` (facultatif) remplace
le texte du moteur. **Lecture par un jalon** : la valeur est rangée **telle que tapée, en texte** (`'6'`, `'2,0'`, `null` si
vide) dans `ficheEnvoyee(db, '<fiche.id>').valeurs['<bloc.id>']` (`db.fiches[<fiche.id>].valeurs[<bloc.id>]`) ; la convertir par
`lireNombre` (`'6'` → `6`, `'6 091'` → `6091`, `'2,5'` → `2.5`, rien d'exploitable → `NaN`) : `lireNombre(f.valeurs.heineken30) === 6`.
`lireNombre` est exporté par `core/types/fiche.js`, mais ce module tire `core/ui.js` : un fichier de `contenus/` qui veut
rester sans cette dépendance recopie les 4 lignes de `lireNombre` (comme `contenus/smoby-ent58.js`) et un test vérifie que les
deux lisent pareil. **Pas de bloc `lignes`** (libellé + case + liste sur une ligne) : une suite de blocs `nombre` et `liste`,
éventuellement dans un `cadre`, suffit pour un bon de commande (décision D-2). Exemple : le bon de commande d'ENT-6.2
(`FICHE` dans `contenus/france-boissons-ent62.js` : six cases `nombre` entières et positives, une `liste`, un `choix`, dans des
`cadre`) ; tests : bloc `fb-6.2`.
**Limite connue** (ENT-6.2, 10/10/2026) : le bouton « Répondre » d'un mail par phrases est là dès l'arrivée du mail ; rien ne le
ferme tant qu'une condition est fausse (sauf un point d'étape, `ferme: 'repondre:<clé>'`). Une séance qui veut « le bon d'abord,
la réponse ensuite » fait attendre la **suite** (la réponse du client : `tous(apresFiche(…), …)`), pas le bouton.

**Fonction de la base de l'élève** (chantier D-1 bis, 09/10/2026, brief ENT-6.1 §7.3) : pour une séance TIRÉE par élève (ses
cases, ses lignes, son courrier : `TIRAGE.piecesTirees`), quatre champs acceptent une fonction `(db) => …` au lieu d'une valeur
fixe — `fiche.blocs` (rend le tableau des blocs), `fiche.documents` (rend le tableau des ids), `documents[].html` (rend le texte
HTML) et `ecran` d'un jalon (rend `'fiche:<id>'`, `'transfert:<clé>'`… ou `null`). Le moteur range le tirage à l'ouverture,
**avant** le premier dessin, et appelle ces fonctions **à chaque dessin** (et à l'envoi d'une fiche, au bilan pour `ecran`) : après
« Réinitialiser », les écrans suivent le nouveau tirage sans rouvrir la séance. **Piège** : la fonction est réévaluée à chaque
dessin, jamais mémorisée : elle ne doit **rien écrire** (ni dans la base, ni ailleurs) et doit rester rapide. Contrôle au
chargement : chacune est appelée une fois sur une base **vide** (`{}`) ; si elle plante ou rend un mauvais type, la séance ne se
charge pas (le message nomme la fiche, le document ou le jalon) — une fonction doit donc marcher sans tirage (rendre une fiche
vide, par exemple). Au dessin, une fonction qui plante est signalée (console, comme un jalon) et la fiche ou le document affiche
un avis d'erreur ; une fiche qui ne se dessine pas ne part pas. Les gestes publiés par une fiche à `blocs(db)` sont ceux du dessin
sur base vide, plus `fiche:<id>:envoyer`. Valeurs fixes : rien ne change. Exemple : `contenus/france-boissons-ent61.js`
(`FICHE_QUI`, `DOC_ORGANIGRAMME_ELEVE`, jalons du courrier) ; tests : bloc `fb-6.1`.

**`tournee.points` aussi** (chantier MOTEUR-tournee-points-par-eleve, 18/10/2026, demande n° 6 du brief ENT-9.2) : une tournée
n'est plus forcément une liste fixe. `points: (db) => POINTS_PLAN.map((p) => ({ ...p, vides: videsDe(db, p.id) }))` donne à chaque
élève **ses** quantités (créneaux, zone… aussi), avec une règle propre : **mêmes sites pour tous, valeurs tirées**. La fonction rend
exactement les ids de la base vide (ceux du plan quand il y a une carte : la carte se dessine depuis `plan.clients`, ses marqueurs
ne changent pas) ; des sites différents par élève, ce serait une carte par élève (autre chantier). Relue à chaque dessin de la
tournée et par le bilan : **un contenu tiré passe la base à son bilan**, `VUE.bilan(etat, db)` dans ses jalons `verifier(db)` ;
`VUE.bilan(etat)` sans base calcule sur la base vide (les contenus qui ne tirent rien ne changent pas). Même piège que plus haut :
jamais mémorisée, rien écrit. Contrôle au chargement : appelée une fois sur `{}` ; si elle plante, ne rend pas un tableau ou rend un
point sans `id`, la séance ne se charge pas (« tournée « <id> » : « points(db) » ne marche pas sur une base vide : … ») ; les
contrôles d'`etatInitial` et des `phases` se font sur cette liste. Au dessin, une fonction qui plante, ou qui rend d'autres sites
que sur la base vide, est signalée (console, une fois) et la tournée affiche un avis d'erreur à sa place (`[data-tournee-erreur]`) :
rien ne se branche, rien n'est écrit ; au bilan, la même faute est signalée et le bilan se calcule sur la base vide (aucun jalon ne
plante). Une liste fixe : rien ne change. **Attention aux caches du contenu** : une séance qui fige ses quantités ailleurs (corrigé,
liste `SITES`, mémo d'équité) ne profite de rien tant qu'elle ne les tire pas
aussi (ENT-9.2 les a tirées le 18/10/2026 : voir `contenus/chep-ent92-donnees.js`). Tests : bloc `ramasse` (« points par élève »).

**Feuille de calcul dans une fiche, dessin en document, pastilles d'étape** (chantier D-10, 13/10/2026, brief ENT-6.10 §7) :
- Bloc **`grille`** : `{ type: 'grille', id: 'compte', feuille: { colonnes: ['A', 'B', 'C'], decimales: 2, colonneAide: 'Aide',
  donneesGrisees: true, largeurs: { A: '27%', B: '23%', C: '23%', aide: 'auto' } }, lignes: [ … ] | (db) => [ … ] }`. Les lignes et
  les cellules sont celles de `creerGrille` (`core/types/grille.js` : `saisie`, `formule`, `attendu` nombre ou `(lire) => …`, `note`,
  `tolerance` nombre ou `'1 %'`, `placeholder`). `lignes(db)` est rappelée à chaque dessin : c'est ainsi qu'une case (son attendu, son
  aide) lit **une autre fiche** de la séance (ENT-6.10 : la ligne 4 rappelle les comptes envoyés à la fiche ①). Rien n'est jugé avant
  l'envoi (`verifier: false` par défaut) ; « Il manque » nomme les cases vides ; envoyée, la feuille se relit sans verdict ; Entrée
  passe à la case suivante ; une formule se construit en cliquant les cases (pointage de `grille.js`, curseur « copie », case qui
  clignote). Jalons : `lireFeuille(ficheId, bloc, db)` (`core/types/fiche.js`) → `{ juge: { B5: 'ok' | 'pasFormule' | 'valeur' | … },
  valeur(ref), brut(ref) }`. Geste : `fiche:<id>:<bloc>` à la sortie d'une case remplie.
- Fiche : `largeurDocs` (part de la largeur prise par les documents, la fiche valant 1 ; 1.85 pour un dessin à compter, 0.75 pour une
  feuille) et `serree: true` (blocs rapprochés, pour tenir à 1280 × 720).
- Fiche : `defile: true` (13/10/2026, ENT-7.1) : la fiche **défile dans sa colonne**, la page non ; les documents défilent dans la leur et
  le bouton d'envoi (avec « Il manque ») reste en bas, toujours visible. Pour une fiche qui ne tient pas à 1280 × 720 même `serree` (le
  comparateur d'offres d'ENT-7.1 : cinq blocs, jusqu'à six offres). La hauteur est mesurée au dessin et quand la fenêtre change de taille ;
  colonnes l'une sous l'autre (place trop étroite) : rien n'est borné. Sans l'option, rien ne change. Exemple : `contenus/decathlon-ent71.js`.
- Document **dessin** : `{ id, titre, court, image: { src: './contenus/…svg', alt, mention } }` (avec ou sans `html` dessous). Pleine
  largeur de la colonne ; un clic ou « Agrandir » ouvre la **loupe** plein écran (Échap, « Fermer » ou le fond la referment, le focus
  revient). `alt` obligatoire, et il ne doit pas donner la réponse (pas de nombre à compter) ; `src` local obligatoire.
- **`pastilles`** (option de `creerEntreprise`) : `[{ libelle, fait: (db) => booléen }]`, une bande d'une ligne au-dessus de l'écran
  de travail, sur tous les écrans ; « fait » ou « à faire », jamais « juste ». Redessinée à chaque écran et après chaque envoi.
- **Animation à son tour** : `animation.quand(db)` la garde hors du menu tant que c'est faux (comme une fiche) ; `menuApres: true` la liste
  APRÈS les fiches (une animation de fin de séance).
- **Scène « trajet »** de l'animation (lot 2) : une carte schématique au lieu d'un entrepôt. `scene: { trajet: { sol?, route: [[x, y], …]
  (segments selon x ou y), lieux: [{ id, type: 'plateforme' | 'bar' | 'brasserie' | 'lavage', x, y, nom }], arrets: { id: [x, y] } (sur la
  route) }, acteurs: { camion: { type: 'porteur' } } }` ; chaque partie place le camion (`depart: { camion: { a: '<arrêt>', charge } }`) ;
  pas `{ rouler: 'camion', vers: '<arrêt>', ms? }` et `{ charger: 'camion', charge: 'pleins' | 'vides' | null }` (on voit le chargement par
  le rideau entrouvert) ; `bulle.vers` vise un arrêt ou un lieu ; les pas d'entrepôt (`geste`, `nouvelle`…) y sont refusés. Le camion est
  dessiné par-dessus le décor : la route passe DEVANT les bâtiments. Objets du kit (`core/iso.js`) : `porteurRideaux` (4 sens), `futVide`,
  `batiment`, `route`, `nomLieu`. Page d'essai : `outils/essai-boucle-vides.html`.
Exemple : `contenus/france-boissons-ent610.js` ; tests : bloc `fb-6.10`.

**Menu de gauche rétractable** (04/10/2026, même brief, lot 3) : dans toutes les entreprises, sans rien
déclarer. Un bouton en tête du menu le replie en une bande étroite (« » » pour le rouvrir) ; le choix est
rangé dans la base de l'élève (`db.menuReplie`), gardé d'un écran à l'autre, à la séance suivante et à
« Réinitialiser ». « Agrandir le planning » cache le menu entier, puis le rend dans cet état.

**Repérage pour l'enseignant** (04/10/2026, lot 6) : tout environnement d'entreprise range, chez l'élève,
`db.indicateurs[idSeance] = { temps, mots, aides, premier }` (temps en secondes, onglet visible seulement ;
mots cliquables et « Rappel tableur » ouverts ; premier jugement de chaque étape, `'ok'` ou `'ko'`). Il
remonte dans le détail du score et s'affiche dans le **Suivi de classe**, encadré « Repérage des élèves »
(enseignant seul, sans export ni recommandation). Il survit à « Réinitialiser ». **Règle pour une séance** :
une étape rend `'attente'` tant que l'élève n'a rien tenté (premier envoi, premier dépôt, première
validation), sinon le « premier coup » la compte comme ratée. Les « ? » de la feuille (`grille.js`) et les
amorces ne sont pas comptés (aucune séance de S1 ne s'en sert) : demande au moteur si besoin.
Un `verifier(db)` qui **lève une exception** (clé renommée, donnée absente, coquille du contenu) prend l'état
`'erreur'` (ni `'ok'`, ni `'ko'`, ni `'attente'`) : 0 point, jamais compté faux ni « premier coup », compté comme
jugé pour la fin de séance, `console.error` (séance, jalon, message) et `db.indicateurs[idSeance].erreurs =
{ [idJalon]: message }`, que le Suivi de classe montre en « ⚠ jalon en erreur : <id> » (chantier 5, 08/10/2026).

**Commande annulée** (03/10/2026, brief `MOTEUR-statut-annulee`) : une commande semée peut porter
`annulee: { motif: 'Rupture : emplacement vide à la préparation', at: <timestamp> }`. Elle s'affiche
« Annulée » (pastille rouge) partout, **avant tout autre statut** (même préparée ou commencée), ne se
prépare plus (aucune saisie, aucun bouton) et ne compte plus dans les « commandes à préparer ». Sa fiche
dit « Annulée le JJ/MM à HH:MM — motif ». Si elle porte un `prep` (une ligne de `rows` par ligne
commandée), le contrôle et le bon restent lisibles en lecture seule. Le moteur ne fait aucun mouvement de
stock à l'annulation : c'est le volet qui sème ceux qu'il veut.

**Niveau de l'élève dans la séance** (03/10/2026 ; **par scénario** depuis le 09/10/2026, chantier D-C lot 1) :
`db.aisance` vaut `'standard'`, `'confirme'` ou `'accompagne'`, recopié de `ctx.aisance` (le niveau de l'élève **dans
l'entreprise de la séance**, réglé par l'enseignant dans l'onglet « Niveaux » : `profil.niveaux['6']` pour ENT-6.x) à la
création de la base puis **figé** (un réglage changé ensuite vaut pour les séances suivantes ; la remise à zéro le relit ;
l'enseignant a toujours `'standard'`). `baseDeDepart(prenom, { aisance })` le reçoit en second argument ; `semer(prenom,
db)`, les déclencheurs et `verifier(db)` le lisent dans la base. Une séance qui prévoit un volume confirmé **ajoute** ses
opérations quand `db.aisance === 'confirme'`, sans changer celles du jeu standard ni ce qu'attendent ses jalons (une
évaluation ne le lit pas). « Accompagné » : contenu à concevoir ; en testant `=== 'confirme'`, la séance lui donne le
contenu standard. **Jamais affiché à l'élève** ; le détail de la note porte `niveau: 'confirmé'` (ou `'accompagné'`).
Une séance qui prévoit un contenu par niveau le déclare : `meta.niveauxPrevus: ['confirme']` (colonne de son entreprise
dans l'onglet « Niveaux » ; voir « Tirage mémorisé et banques » plus bas). Pour le lire proprement : `niveauEleve(db, { copie })`
(`core/tirage.js`) rend `'standard'` quand le niveau manque, est inconnu, ou en évaluation. Depuis le lot 4 (17/10/2026), **deux vues le
reçoivent elles-mêmes** : le quai tiré (`quai: (graine, { niveau }) => …`, voir « Le quai reçoit le niveau de l'élève » plus bas) et le
Dialogue (`niveaux` sur un choix ou une réplique, voir « Vue Dialogue à choix »).

**Vue « quai de réception »** (03/10/2026, pilote Picard ENT-4.x) : la séance déclare `quai: { id, lieu,
seuilHorsFroid, dechargement, couts, aides, photos, camions: [{ …, palettes }] }` (exemple complet :
`contenus/picard-ent41.js`, brief `docs/briefs/MOTEUR-vue-quai.md` §4) et `etapes: etapesQuai(QUAI)` (importé de
`core/types/quai.js`) : un jalon de la vue = une étape du suivi. L'état vit dans `db.quais[<quai.id>]`. Guidage :
`aides: { regleCouches, detailComptage, repere, chefDeQuai, consignes }` ; évaluation : `aides: {}`, `quai.note` (seuils,
présence = note sur 20 : 15 de réception + 5 de rapidité), `copie: true` et `export const noter = (db) => moteur.noter(db)`.
Le temps réel passé est compté par l'environnement dès l'ouverture, quel que soit l'écran.
**Plusieurs camions** (03/10/2026, ENT-4.2, exemple : `contenus/picard-ent42.js`) : `camions` en compte plusieurs, chacun
avec `lettre` (identifiants seulement : à l'écran, le camion porte le nom de son `fournisseur`, ou `nom`), `arrivee`, `parole`, `ticket`, `qcmTicket: { choix, attendu }` et, s'il faiblit, `rechauffeEnAttente` (°C par
minute du quai porte fermée). Le quai déclare alors `debut` (heure de prise de poste), `ordre: { question, premier,
juste, phrases: [{ v, lib }] }` (choix de l'ordre + justification, ouvert une fois tous les tickets lus), `manoeuvre`
(min, mise à quai du camion suivant, 3 par défaut) et `seuilRefus` (−15 °C par défaut : au-delà, la décision attendue
d'une palette réchauffée devient « refuser — température »). Une palette peut porter `refs: [{ ref, nom, bl, couches,
teinte, etiq }]` (plusieurs références, un comptage par référence) ou `etiqAvant: 'dechiree'` (la vraie étiquette, `etiq`,
se lit sur la face arrière ; le refus « produit » n'est juste qu'une fois l'arrière lu).
À l'étape ③ (poste refait le 04/10/2026, brief `docs/briefs/MOTEUR-quai-fiche-controle.md`) : à gauche la palette et,
dessous, la **fiche de contrôle** (quatre constats notés par l'élève, `palettes[id].fiche = { temp, ref, endo, manq }` :
rien de prérempli, rien de corrigé, aucun coût, aucun jalon ; relue en entier à l'étape ④ à côté des réserves) ; à droite
la sonde (thermomètre dessiné), l'étiquette, le total noté par Entrée, la décision en trois boutons et les motifs à cocher
(un seul, ou **deux au plus** si le quai déclare `deuxMotifs`). « Valider » reste cliquable : il faut le comptage (chaque
référence), la décision et un motif pour des réserves ou un refus, sinon le manque s'écrit sous la case ; une palette
validée devient un résumé (« Modifier » la rouvre), « Palette suivante » en dessous. Le bouton « Contrôles terminés →
réserves » est en haut à droite et demande toujours une confirmation (03/10/2026).
Depuis la maquette du 04/10/2026 (`docs/briefs/picard/maquette-quai-calcul.html`), la palette reste à l'écran à gauche
et la colonne de droite suit l'ordre ① Compter → ② Sonder et lire l'étiquette → ③ fiche → ④ Décider. La séance déclare
sa **zone de calcul** par `calcul: { forme: 'feuille' | 'brouillon', rappel }` (feuille = lignes nommées, formule en B4,
`rappel` = le geste pas à pas ; brouillon = 2 × 5 cases libres ; absente = pas de zone). Cases cliquables pendant une
formule ; jamais notée ; le résultat n'est pas recopié dans « Total ». Palette multi-références : toujours le brouillon.
**Quai « déjà réceptionné »** (03/10/2026, ENT-4.3, exemple : `contenus/picard-ent43.js`) : `mode: 'controle'`, un seul
camion, et `dossier: { receptionnaire, heure, reserves: [lignes du BL], fiche: [{ id, compte, temp, decision, remarque }], mot,
rappelProtestation }` (le travail du collègue, lu dans le contenu : jamais modifiable). Pas d'étapes ni d'horloge : onglets
« dossier » / « en chambre froide » (tour, sonde = `temp` d'aujourd'hui, étiquette, comptage de l'élève). Temps 2 ouvert par un
message déclenché portant `phaseQuai: 2` : « Bloquer — qualité » / « Débloquer », puis « J'ai terminé » (deux clics, définitif)
et bilan. Palette à bloquer : `bloquer: true`. Jalons des messages : `jalonsDossier: { avant(db, e), apres(db, e) }` (lignes
`{ id, lib, fait, attendu, ok }`), placés avant et après ceux du blocage. Un bouton « Messagerie » mène aux messages, un lien y
ramène au quai.
**Quai sans froid** (04/10/2026, `MOTEUR-2de-S1` lots 4-5, exemple : `contenus/smoby-ent54.js`) : `froid: false` (ni
ticket, ni sonde, ni temps hors froid, fiche de contrôle à trois cases), `motifs: ['avarie', 'manquant']` (motifs proposés ; un id inconnu est refusé depuis D-4),
`zone: { nom }` (étape ④), `dechargement: { par: 'cariste', nom }` (chariot élévateur ; sur le quai iso, un chariot frontal dessiné : voir « Le quai iso »)
et `securite: { scene, points: [{ id, lib, ok }], signaler: { bouton, reponse }, arret, commencer, photo, alt }` (la liste OK / Pas OK : étape ⓪
« Avant de décharger », jalons `securiteSignalee` et `securiteConstat` en tête ; `arret` y est un texte, jamais `false`). Sur le quai
iso, l'inspection peut se jouer sur la scène (`securite.mode: 'scene'`), les palettes peuvent être des fûts (`forme: 'fut'`) et
l'unité se déclare (`unite`) : tout est dans « Le quai iso : inspection sur la scène, fûts, unité, cariste » plus bas. Un seul camion. **Décor fixe** (04/10/2026, ENT-5.4) : `photos.decor: 'fixe'` pour une photo
prise porte ouverte : `porte` = l'ouverture de la remorque, `cadre` descend sous la photo (dalle dessinée), `places` dans
cette dalle, `horloge: [x, y]`. Les jalons de la vue se regroupent au besoin dans les `etapes` de la séance (ENT-5.4 : comptage
et décision d'une palette en un seul jalon, en lisant `jalonsQuai(db, QUAI).L`).

**Un jeu tiré par élève** (évaluation, 03/10/2026, chantier P6, pilote ENT-4.4 ; décision
`docs/briefs/DECISION-jeu-unique-evaluations.md`). Le tirage est générique, dans `core/tirage.js` :
`hasard(graine)` (générateur reproductible : `entier`, `choisir`, `prendre`, `melanger`, `dixieme`), `tirerJeu(decl,
graine)` avec `decl = { tirer(h, graine) → jeu, verifier(jeu) → [écarts en clair], secours, essais? }` (retire tant
que le jeu n'est pas conforme, rend `secours` après `essais` échecs : aucun jeu hors règle n'atteint un élève),
`graineDeBase(db)` et `poserGraine(db, uid)` (la graine = `ctx.profil.uid`, rangée une fois pour toutes dans
`db.tirage.graine`). Côté quai, la séance passe `quai: quaiDe` — une **fonction** `(graine) => déclaration du quai`
— et `etapes: etapesQuaiTire(quaiDe, graineDeBase)` (étape n° k = k-ième jalon du jeu de la base lue, ids `j1…jN` :
le tirage doit garder la même structure à tous). L'environnement pose la graine à l'ouverture et note chaque base
sur SON quai (`noter`, ramassage compris) ; `detail.quai.graine` et `detail.quai.jeu` (jalon par jalon) vont dans la
copie. Corrigé : le fichier de corrigé exporte `corrigeEleve(base, uid)` → `{ texte, items }` ; l'onglet Corrigés
propose alors de choisir un élève du groupe actif. Test obligatoire : des centaines de graines, zéro secours.
⚠ Ne pas toucher à la réserve ni au tirage entre l'ouverture d'une évaluation et le ramassage (le camion des élèves
changerait) : un test « jeu figé » le rappelle. L'inventaire (ENT-2.5) accepte lui aussi une fonction de la graine
(voir « Inventaire tiré par élève » plus bas).

**Le quai reçoit le niveau de l'élève** (lot 4 « contenus selon le niveau », 17/10/2026, briefs ENT-8.7 §7.4 et ENT-8.8 §6 bis ; choix de
Tristan : option 3). Quand `quai` est une fonction, le moteur l'appelle **`quai(graine, { niveau, copie })`** : `niveau` = `niveauEleve(db)`
(`core/tirage.js` : `db.aisance` ramené à `'standard'` s'il manque, **toujours `'standard'` en évaluation et pour l'enseignant**), `copie` = la
séance est une copie. Un quai est gardé **par graine et par niveau** ; une fonction qui ne lit que la graine (ENT-4.4, 8.7 à 8.10 aujourd'hui)
**ne change pas**. Tout ce qui est dans la déclaration devient donc réglable par niveau : `aides` (comptage éteint chez le confirmé, allumé
chez l'accompagné), `securite.consigne` (un rappel « Fais le tour » chez l'accompagné), les `points` de la scène (un défaut de plus chez le
confirmé), les palettes… **Au chargement**, le moteur construit les trois variantes de la graine de référence (hors copie) : une déclaration
fautive à un niveau est refusée tout de suite, message « quai du niveau « confirme » : … ». Le détail de la note porte `detail.quai.niveau`
quand il n'est pas le standard. La séance qui lit son quai elle-même (jalons `jalonsQuai(db, quaiDeBase(db))`) passe le niveau à sa fonction :
`quaiDe(graineDeBase(db), { niveau: niveauEleve(db) })` — et **garde son propre cache par graine ET par niveau** s'il en a un.
`etapesQuaiTire(quaiDe, graineDeBase, niveauDe)` prend un troisième argument facultatif, `(db) => niveau` ; absent, le standard pour tous.
Règles : un contenu confirmé **ajoute** (jamais un socle différent) ; un chiffre caché ne doit pas se déduire ; une séance qui s'en sert déclare
`meta.niveauxPrevus`. Tests : bloc `quai-iso` (cas « Quai niveau : … »).

**Second motif** (quai, ENT-4.4) : `deuxMotifs: true` dans la déclaration propose un second menu « motif » sur
CHAQUE palette (pour ne pas désigner celle qui a deux problèmes) ; la palette déclare `motif2Attendu`. Décision juste
= mêmes motifs (dans n'importe quel ordre) ; réserve juste = une valeur juste pour chacun (« deux constats, deux
quantités »).

**Les autres clés de `creerEntreprise`** (`exercice`, `trame`, `sansTrame`, `THEME`, `reponsesFournisseur`, `transportId`…) sont dans la table « Les options de `creerEntreprise` » plus haut.

`creerEntreprise` est dans `core/types/entreprise.js`. Les autres moteurs sont dans
`core/types/` (`qcm`, `ordre`, `assoc`, `numerique`, `tableur`, `tableau`, `tournee`, …).

### Le quai iso : inspection sur la scène, fûts, unité, cariste (chantier D-4, 10/10/2026)

Cadrage et construction étape par étape : `docs/briefs/MOTEUR-quai-inspection.md` (§2 puis §3). Page d'essai où l'on clique
tout : `outils/essai-quai-inspection.html` (la partie 2 joue le quai d'ENT-6.4 dans le vrai moteur). **Tout est facultatif** :
sans les champs ci-dessous, Picard, Smoby et Spartoo ne changent pas (une référence octet pour octet de la séance Spartoo
le garde, bloc de tests `quai-iso`). Sauf `unite`, `libelles` et `motifs` (tous les quais), tout demande `rendu: 'iso'`, donc
un quai sans froid (`froid: false`) et un seul camion : sinon la séance refuse de s'ouvrir.

**Le contenu est contrôlé au chargement** par `verifierQuai(Q)` (exportée, pure : la liste des écarts en clair, vide si tout
va bien). `creerQuai` lève une erreur qui les nomme tous ; la séance est alors écartée du registre (voir « Pièges »). Chaque
refus cité plus bas vient de là.

#### Inspection sur la scène : `securite.mode: 'scene'`

Sans `mode`, c'est l'étape ⓪ en liste OK / Pas OK, **inchangée** (photo, `points: [{ id, lib, ok }]`, `signaler: { bouton,
reponse }`, `arret` en texte). Avec `mode: 'scene'`, l'élève inspecte le quai **sur le dessin** avant de décharger.

| Champ de `securite` | Contenu | Défaut | Refusé si |
|---|---|---|---|
| `mode` | `'scene'` | absent = la liste | autre valeur ; `'scene'` sans `rendu: 'iso'` |
| `points[]` | les objets à inspecter (voir plus bas) | — | liste vide ; `id` vide, en double, ou `aucun-faux` (réservé) ; deux points sur le même objet |
| `points[].objet` | `cabine`, `cale`, `butoirs`, `niveleur`, `lampe` | — | autre |
| `points[].etat` | l'état dessiné au départ (selon l'objet) | — | état inconnu pour cet objet |
| `points[].ok` | `true` si cet état est sûr (un piège), `false` si c'est un défaut | — | absent ; **incohérent** (`ok: true` sur un état dangereux, `ok: false` sur l'état sûr) |
| `points[].lib` | texte pour le bilan et le corrigé | — | absent. **Jamais affiché pendant l'inspection** |
| `points[].repare` | ce que dit le collègue quand ce défaut est signalé | « Bien vu, je m’en occupe. » | — |
| `points[].vue` | `'dehors'` ou `'dedans'` | celle de l'objet | différente de celle de l'objet (champ de lisibilité seulement) |
| `consigne` | la phrase au-dessus de la scène | « Clique sur ce qui ne va pas, puis signale-le. » | — |
| `signaler.qui` | qui reçoit le signalement | « le chef de quai » | — |
| `signaler.bouton` | texte du bouton | `Signaler à ${qui}` (« Signaler à Nadia », « au chef de quai ») | — |
| `signaler.rien` / `fin` / `vide` | réponses du collègue : marque à côté ou point en ordre / toujours en fin de réponse / rien à envoyer | « Là, je ne vois rien qui cloche. » / « Tu me dis quand on peut décharger. » / « Qu’est-ce qui ne va pas ? Clique d’abord sur ce que tu veux me signaler. » | — |
| `commencer` | texte du bouton qui fige l'inspection (suivi de « → ») | « C’est bon, on peut décharger » | — |
| `arret` | `true`, `false` ou le texte de l'arrêt | `true` | pas un booléen ni un texte ; **`false` en mode liste** (il n'y règle rien) |
| `bilan` | phrase au bilan du quai si un jalon `securite-<id>` est faux | rien | — |
| `photo`, `alt`, `scene`, `signaler.reponse` | — | ignorés | `photo` déclarée en mode scène |

**Les cinq objets et leurs états.** Un objet non déclaré garde le dessin d'avant le chantier ; la cale et la lampe n'existent
à l'écran que si un point les déclare.

| Objet | Vue | États (le sûr en premier) | Non déclaré |
|---|---|---|---|
| `cabine` | dehors | `vide` / `conduite` (chauffeur au volant, silhouette sans visage derrière le pare-brise, moteur qui tourne : une fumée grise) | camion vide |
| `cale` | dehors | `posee` (cale rouge devant la roue arrière, pente sous le pneu) / `absente` (rien de dessiné) | **pas dessinée** |
| `butoirs` | dehors | `enPlace` / `absents` (retirés à cette porte) | présents. Déclarés, la paire côté droit est épaissie pour qu'on la voie camion à quai |
| `niveleur` | dedans | `pose` / `releve` (plaque dressée, vide sombre entre le quai et la remorque) | posé |
| `lampe` | dedans | `allumee` (tête, halo, faisceau dans la remorque) / `eteinte` | **pas dessinée** |

**Ce que fait l'écran.**
- **Déroulé.** Pas d'étape ⓪ : l'élève commence à ①. L'animation d'arrivée du camion (5,2 s, « Passer l'animation ») se
  termine par la scène **figée**, la consigne, les boutons : ni bulle du chauffeur ni bon de livraison. ② à ④ restent
  fermées tant que « C'est bon » n'a pas été validé. Le BL et « Oui, vous pouvez décharger » viennent **après**.
- **Deux vues**, comme l'ancienne animation d'ENT-1.1 : « dehors » (façade, camion, cabine, cale, butoirs) et « dedans »
  (quai, remorque, niveleur, lampe, une personne debout qui n'est pas un objet : la cliquer = tomber à côté). « Ouvrir la
  porte de quai » bascule sur « dedans » et joue la levée de la porte (1,8 s ; la scène ne répond pas pendant ce temps) ;
  l'ouverture est rangée (un rechargement montre la porte levée) ; ensuite « Voir dedans → » / « ← Revoir dehors ».
  Ouvrir ne coûte pas de minute et ne fige rien.
- **Marques.** Un clic pose un rond numéroté (encre, jamais vert ni rouge). Un clic sur une marque **pas encore envoyée**
  la retire. Le moteur sait quel objet est touché (le premier point déclaré de cette vue dont la zone contient le clic ;
  sinon « à côté »). **Rien dans le dessin ne nomme un objet** (ni `title`, ni `tabindex`, ni `role`, ni `data-*` : un test
  le garde), curseur en croix partout, aucune surbrillance au survol : n'en ajouter aucun.
- **Signaler.** Sans marque à envoyer : la réponse `vide`, rien n'est rangé. Sinon les marques partent en **un signal** et le
  collègue répond : les `repare` des défauts touchés **pas encore réparés** (dans l'ordre de déclaration), puis `rien` une
  seule fois s'il y a une marque à côté, un point en ordre ou un défaut déjà réparé, puis `fin`. La scène **se répare
  sous les yeux de l'élève** (cabine : plus de silhouette ni de fumée et le chauffeur descend près de l'accueil ;
  niveleur posé ; cale posée…). Une marque envoyée est grisée en tirets et **inerte** : elle masque ce qu'elle recouvre
  (pour re-signaler le même objet, cliquer ailleurs dans sa zone).
- **« C'est bon, on peut décharger »** : confirmation **en deux clics** (« On décharge, c'est définitif : cliquez pour
  confirmer », avec « Annuler »). Si un défaut n'a jamais été signalé et que `arret` n'est pas `false`, **hors
  évaluation** : le collègue arrête l'élève (texte `arret`, ou « Stop ! … Regarde encore la scène et signale ce qui ne va
  pas. »), **sans nommer le point** ; l'élève continue d'inspecter et ses signaux suivants comptent « après l'arrêt »
  (jalon faux). En évaluation (`copie`), rien n'arrête jamais. Sinon l'inspection est **figée** : marques non envoyées
  abandonnées, marques cachées, défauts restants remis à l'état sûr **sans un mot** (l'inaction ne se voit qu'au jalon), puis
  la suite habituelle (chauffeur debout et sa bulle, BL, « Oui, vous pouvez décharger »). ② et ④ dessinent le niveleur posé
  et la lampe dans son état sûr.
- **Jalons** (les deux jalons de la liste ne sont pas produits en mode scène). Un par défaut : `securite-<id>`, « Danger n° 1
  signalé avant de décharger » (juste = le point est dans un signal envoyé **avant** l'arrêt) ; puis `securite-aucun-faux`
  (juste = au moins un signal, aucun sur un point en ordre, aucune marque à côté). `lib` **neutres** (ils peuvent se lire
  pendant la séance) ; le défaut est nommé dans `attendu`, lu au bilan. Re-signaler un défaut déjà réparé n'est **pas** un
  faux signalement. Aucun n'est vrai par inaction. Les titres d'étape de la séance (`etapes[].titre`) ne s'affichent que dans le bilan du quai (après « Clore »)
  et au bandeau de fin, mais **la séance les garde neutres** quand même (pas « La cale signalée avant de décharger »),
  pour ne rien souffler si leur affichage change. La séance donne leurs poids à ces jalons comme aux autres (`etapes`).
- **Gestes publiés** (pour les questions au fil et les messages déclenchés) : `scene:<id>:signaler` (à chaque envoi réel de
  marques) et `scene:<id>:decharger` (au figeage réel : **pas** quand le collègue arrête l'élève). Absents en mode liste.
- **Remise à zéro** : « Recommencer la réception » (guidage et entraînement ; absent en évaluation et avec `recommencer:
  false`) repart d'une inspection vierge. « Corriger » après le bilan ne rouvre jamais le quai.
- **État rangé** : `db.quais[<id>].securite = { mode: 'scene', marques, compteur, signaux, ouverte, arrete, fait, chef }`. L'état
  des objets n'est **jamais** rangé : il se calcule (`etatsScene`) depuis les signaux et le figeage. Une base écrite avant le
  mode scène est complétée sans rien effacer.
- **Mouvement réduit** (réglage du système) : pas de levée de porte animée ni de recul du camion, l'arrivée s'affiche
  d'emblée ; la fumée reste **dessinée, immobile** (sinon l'indice disparaîtrait).
- **Clavier : non pris en charge.** L'inspection se joue à la souris ou au doigt (arbitrage du brief ENT-6.4 §7.3) : la
  séance doit le dire dans son compte rendu. À 375 px de large le dessin est réduit (les marques font alors ~9 px) : à
  regarder à l'écran avant d'ouvrir à des élèves sur téléphone.

#### Palette de fûts : `forme: 'fut'`

Sur une **palette** du camion (absent = cartons), avec `rendu: 'iso'`. Un bac de rétention **noir** (jamais de bois) porte
**huit fûts debout** en quinconce 3-2-3, numérotés du fond vers l'avant, de gauche à droite : 1-2-3 (rangée du fond), 4-5,
6-7-8 (devant).

```js
{ id: 'P3', forme: 'fut', ref: 'AFF-20', nom: 'Affligem Blonde fût 20 L', bl: 8, manque: [], avarie: { 2: 'N' },
  attendu: 'reserves', motifAttendu: 'avarie', etiq: { ref: 'AFF-20', nom: 'AFFLIGEM BLONDE FÛT 20 L', poids: 'fût de 20 L', lot: '…' } },
{ id: 'P4', forme: 'fut', ref: 'EDW-20', nom: 'Edelweiss fût 20 L', bl: 7, manque: [7], attendu: 'accepter', motifAttendu: 'aucun', etiq: { … } },
```

- `manque: [7]` : **numéros** des places vides (rien n'y est dessiné : le trou se voit). `avarie: { 2: 'N' }` : le fût n° 2
  fuit sur sa face `N` (coulure sombre sur le fût et flaque ambre dans le bac devant lui, dessinées seulement quand la
  palette est tournée du bon côté). Faces extérieures de chaque place : 1 `N` `W` · 2 `N` · 3 `N` `E` · 4 `W` · 5 `E` ·
  6 `S` `W` · 7 `S` · 8 `S` `E`.
- **Calculés, jamais déclarés** : le total (toujours 8), le réel (`8 − manque.length`), le nombre d'avaries (nombre de clés
  d'`avarie`), les manquants (`bl − réel`). Une dimension déclarée n'aurait aucun sens.
- **Refusé** : `W`, `D`, `L`, `refs` ou `etiqAvant` sur une palette de fûts ; un numéro de `manque` ou d'`avarie` hors 1-8,
  non entier ou en double ; une face autre que `N`, `S`, `E`, `W` ; une face **intérieure** (cachée par les autres fûts) ; un fût absent
  qui fuit ; une `forme` autre que `'fut'` ; `rendu` autre que `'iso'` ; `aides.regleCouches` ou `aides.detailComptage`
  (parlent de couches) ; **un quai sans `unite`** (voir plus bas : « une palette de fûts demande `unite` (par exemple `'fûts'`) »).
- **Brouillon de calcul imposé** : une palette de fûts prend toujours le brouillon (2 × 5 cases libres), même si la séance
  déclare `calcul: { forme: 'feuille' }` (les lignes de la feuille parlent de couches).
- **À l'écran.** ② et ④ : les palettes sont dessinées à l'échelle du décor. ③ : la palette en grand, quatre vues
  (« ⟲ Tourner / Tourner ⟳ »), **chaque fût cliquable** (sa collerette porte l'étiquette de la référence, lisible en grand ; zoom « Fût 3 / 8 »).
  **La fuite d'une face se voit à deux rotations consécutives** (la face de devant, puis le côté), jamais aux deux autres :
  la fuite sur la face `N` se voit de l'arrière et du côté droit, pas de l'avant ni du côté gauche. « Visible d'une seule
  vue » n'est pas réalisable avec cette règle de visibilité.
- Consigne d'aide (`aides.consignes`) propre aux fûts : « Compte les fûts de la palette, place par place. Regarde bien s'il
  manque une place dans le bac. Fais le tour de la palette si besoin. »

#### Pile de palettes vides : `forme: 'pile'` (MOTEUR-chep, lot B, 18/10/2026)

Cadrage : `docs/briefs/MOTEUR-chep-ramasse-et-piles.md` §3 (compte rendu du lot B en bas). Sur le modèle exact de `forme: 'fut'` : la
séance **déclare ce qui est sur la pile**, le moteur **calcule** les comptes, dessine, et l'élève compte et décide à l'étape ③. Quai iso
(`rendu: 'iso'`, `froid: false`, un camion), cariste au chariot frontal conseillé. Page d'essai : `outils/essai-quai-inspection.html#piles`
(partie 5, cinq piles, jouable de bout en bout ; un tableau y montre ce que la vue calcule). Tests : bloc `quai-iso`, cas « Quai piles ».

```js
{ id: 'P3', forme: 'pile', ref: 'CHEP-1210', nom: 'Palettes CHEP 1 200 × 1 000 vides', bl: 15,
  hauteur: 14,                          // palettes réellement sur la pile (défaut = bl) : 15 − 14 = 1 manquante
  intrus: { 6: 'lpr', 11: 'epal' },     // n° de la palette (1 = en bas) → autre pool : 'lpr' | 'logipal' | 'epal'
  abimee: { 9: 'S' },                   // n° → face où se voit le dégât : N, S, E, W
  etiq: { ref: 'BC-27-0119-P3', nom: 'BON DE COLLECTE — PILE 3', poids: '15 palettes annoncées' } }
```

- **Calculés, jamais déclarés** : `comptePile(palette)` (exportée de `core/types/quai.js`, pure) rend `{ bl, hauteur, manquantes, intrus,
  parPool: { lpr, logipal, epal }, abimees, chep, aCrediter, aReparer }` — `manquantes = bl − hauteur`, `chep = hauteur − intrus` (abîmées
  comprises : CHEP les répare), `aCrediter = chep`, `aReparer = abimees`. Une séance s'en sert pour ses jalons et ses fiches (règle 5 de la
  coordination CHEP). Le comptage attendu à l'étape ③ est la **hauteur**.
- **La décision juste se calcule** (`decisionPile(palette)` → `{ attendu, motifs }`) : aucune histoire → « accepter » ; sinon « accepter
  avec réserves » avec un motif par histoire, dans l'ordre `manquant`, `avarie` (abîmées), `produit` (d'un autre pool). Ne pas écrire
  `attendu` ni les motifs : écrits, ils doivent être ceux-là (sinon refus). Deux histoires demandent `deuxMotifs: true` ; trois sont refusées.
- **Le quai qui porte une pile déclare** : `unite: { un: 'palette', des: 'palettes', feminin: true }`, `decisions: ['accepter', 'reserves']`
  (**pas de « Refuser »** : on ne refuse pas des palettes vides qui appartiennent au pool), des `motifs` qui contiennent ceux que demandent
  ses piles, et de préférence `libelles: { avarie: { nom: 'Palettes abîmées', precision: 'à réparer', adjectif: 'abîmé' }, manquant: { nom:
  'Palettes manquantes' }, produit: { nom: 'Palettes d’un autre pool' } }` et `document: { nom: 'Bon de collecte', court: 'BC' }`.
- **Le motif `produit` se chiffre** pour une pile : « Nombre de palettes d'un autre pool » (un nombre, jugé contre `intrus`) ; la réserve
  écrit « 2 palettes d’un autre pool ». Exemple de ligne : « P5 CHEP-1210 : acceptée sous réserve — manque 1 palette (BC 15, reçu 14) ;
  1 palette d’un autre pool. » La fiche de contrôle a une 5e case, « Palettes d’un autre pool » (jamais corrigée, comme les autres).
- **Refusé au chargement** (`verifierQuai`) : un n° hors de 1…hauteur, non entier (ou écrit « 06 ») ; une palette à la fois intruse et
  abîmée (une seule histoire par palette) ; un pool inconnu (« chep » compris) ; une face inconnue ; `hauteur > bl` ; `hauteur` < 1 ; une
  pile de plus de **18** palettes (le dessin ne serait plus lisible) ; `refs`, `etiqAvant`, `W`, `D`, `L`, `manque`, `avarie` (dire
  `hauteur` et `abimee`) ; une clé inconnue ; un quai sans `unite` ; sans `decisions` ou avec « refuser » ; les aides de couches.
- **Le dessin** (`palettePile`, `core/iso.js`) : palette à blocs 1 200 × 1 000 (9 blocs, 3 en façade, 15 cm), empilées sans écart,
  numérotées du bas. Pools par la **couleur et le marquage** (lisible en noir et blanc) : CHEP bleu, « CHEP » sur les blocs ; LPR rouge,
  « LPR » ; Logipal brique, « LOGI » et « PAL » sur les blocs de gauche et de droite ; Europe bois brut, « EPAL » et « EUR », et plus étroite (1 200 × 800,
  centrée : elle fait un retrait). Le marquage est **tracé** (aucun `<text>`). Le rouge des LPR est un objet du décor, il ne dit pas
  « faux ». Aucun vert. Une palette abîmée : planche cassée en V qui pend (n° impair) ou bloc du milieu arraché (n° pair), **visible
  seulement quand sa face est tournée vers nous** (deux rotations consécutives sur quatre, comme la fuite d'un fût : face S aux vues 0
  et 3, E 0 et 1, N 1 et 2, W 2 et 3). Il manque des palettes : la pile est simplement moins haute.
- **À l'écran.** ② et ④ : les piles à 0,7 de leur taille (aplat et ouvertures, sans marquage ni dégât : de loin on ne les voit pas), les
  légendes disent « pile » (« Le cariste sort la pile P4 au chariot », « Les 5 piles sont en zone de réception ») quand toutes les palettes
  du quai sont des piles. ③ (« ③ Compter les piles ») : la pile en grand (l'échelle suit la plus haute pile du quai, pour que 14 et 15 se
  comparent), quatre vues, **chaque palette cliquable** ; le zoom dit « Palette 9 » (le numéro seul : la hauteur se lit en cliquant la palette du haut, choix de Tristan du 18/10/2026), montre la
  palette **de près** entre ses voisines (marquage lisible, dégât visible si sa face est tournée vers nous) et l'étiquette de la pile.
  **Aucun texte, titre ni attribut ne nomme un pool ou un dégât** (le dégât n'est pas balisé à l'écran ; un test le garde) : n'en ajouter
  aucun. Brouillon de calcul imposé (comme les fûts). Consigne d'aide (`aides.consignes`) propre aux piles : « Compte les palettes de la pile
  une à une, en cliquant dessus : chacune s’affiche de près, avec son numéro. Fais le tour de la pile : regarde le marquage et l’état de
  chaque palette. »

#### Unité et libellés des motifs : `unite`, `libelles`, `motifs` (tous les quais)

| Champ | Contenu | Défaut | Refusé si |
|---|---|---|---|
| `unite` | `'fûts'` (pluriel en -s, le singulier s'en déduit) ou `{ un: 'cheval', des: 'chevaux' }` ; au féminin : `{ un: 'palette', des: 'palettes', feminin: true }` (MOTEUR-chep lot B) | `{ un: 'carton', des: 'cartons' }` | texte vide ou sans « s » final ; objet sans `un` ou sans `des` ; `feminin` qui n'est pas un booléen |
| `motifs` | liste d'ids proposés : `avarie`, `manquant`, `produit`, `temperature` (sans froid, jamais « température ») | tous | **id inconnu** (avant D-4, ignoré en silence) ; pas une liste |
| `libelles.avarie.nom` | nom du motif | « Cartons endommagés » (l'unité y entre) | texte vide |
| `libelles.avarie.precision` | ce qui suit « endommagé(s) » dans la réserve | « écrasé(s) » accordé | texte vide |
| `libelles.avarie.adjectif` | l'adjectif de l'avarie, au masculin singulier (« abîmé ») : le moteur l'accorde (« 2 palettes abîmées ») partout où « endommagé » entrait (MOTEUR-chep lot B) | « endommagé » | texte vide |
| `decisions` | les décisions proposées à l'étape ③ : une partie de `accepter`, `reserves`, `refuser` (MOTEUR-chep lot B) | les trois | valeur inconnue, en double, liste vide, sans « accepter » ; un `attendu` de palette absent de la liste ; **obligatoire, sans « refuser »**, sur un quai qui porte une pile |
| `libelles.manquant.nom`, `libelles.produit.nom` | noms de ces motifs | « Manquant », « Produit différent de la commande » | texte vide ; toute autre clé |

L'unité est lue **partout** dans le texte du quai (champs chiffrés « Nombre de fûts endommagés / manquants », fiche de
contrôle, colonne du BL « Fûts » et « Par fût », comptage, réserves, journal, jalon « 7 fûts », aides, zoom « Fût 3 / 8 »,
aria-labels) : une seule source, **ne jamais l'écrire en dur dans un contenu**. Masculine par défaut ; **féminine** avec `feminin: true`
(MOTEUR-chep lot B, 18/10/2026) : « endommagées », « manquantes », « comptées », « concernées », « une palette », « cette palette » partout
où l'unité entre. Sans `unite`, les textes sont ceux d'avant le chantier, caractère pour
caractère. Exemple : `unite: 'fûts'` et `libelles: { avarie: { nom: 'Fût endommagé', precision: 'fuite' } }` donnent la
réserve « P3 AFF-20 : acceptée sous réserve — 1 fût endommagé (fuite). ». `MOTIFS` reste exporté tel quel ; un corrigé qui
écrit les motifs d'un quai à libellés déclarés appelle `libMotifs(L, Q)` (`libellesMotifs(Q)` rend la table).

#### Déchargement au chariot frontal : `dechargement.par: 'cariste'` en iso

Sur le quai iso, un **chariot frontal** conduit par un cariste sans visage (gilet jaune, de dos) décharge à la place du
chauffeur au transpalette : il entre par l'ouverture, prend la palette de tête sur ses fourches, la pose à sa place d'arrivée,
revient à vide. Il est dessiné à l'échelle du quai (0,85 de celui de la scène animation). Les palettes sortent dans l'**ordre
inverse du chargement** (P4, P3, P2, P1 pour quatre) : le chariot ne se retourne pas et son corps est derrière sa charge, il
faut remplir la rangée proche du mur avant celle du fond ; les places d'arrivée sont celles du chauffeur, et la légende, le
journal et les pastilles suivent l'ordre de sortie. Légende « {nom} sort la palette P4 au chariot (1 sur 4) » (sans `nom`
dans `dechargement` : « Le cariste »). Le chauffeur du camion reste debout près de l'accueil. Durée : 32 s pour quatre
palettes (« Passer l'animation » existe) ; en mouvement réduit, l'état final tout de suite. Sans `par: 'cariste'` : le
chauffeur au transpalette, comme Spartoo (inchangé). Joué et testé avec cinq palettes de fûts (lot 1 du chantier « quai en deux séances », 17/10/2026, cas « cinq palettes » du bloc `quai-iso`) ; au-delà, le plan n'a pas été éprouvé. Avec `depose` (voir « La dépose dirigée par l'élève »), ce déroulé est remplacé à l'étape ② : le cariste attend l'élève à la sortie du camion.

#### Un quai en deux séances : `arret`, `commence`, `document` (lot 1 du chantier « quai en deux séances », 17/10/2026)

Cadrage : `docs/briefs/ENT-8.7-action-decharger.md` §7.1 (une réception CAP se joue en deux séances : décharger, puis contrôler). **Trois
options facultatives de la déclaration du quai ; sans elles, rien ne change d'un octet** (Picard, Smoby, Spartoo et France Boissons
l'ont vérifié). Page d'essai où l'on clique les deux premières : `outils/essai-quai-inspection.html`, partie 3. Tests : bloc `quai-iso`,
cas « Quai arrêt », « Quai commence », « Quai deux séances », « Quai document ».

| Option | Valeur | Ce qu'elle fait |
|---|---|---|
| `arret` | `'dechargement'` ou `{ etape: 'dechargement', texte: '…' }` | Le quai **s'arrête** quand la dernière palette est posée. Pas d'étapes ③ ④ : ni dans le stepper, ni atteignables, ni à l'écran. Une fois la dernière palette posée, un **bandeau de fin** (`texte` ; défaut « Les palettes sont en zone de réception. ») remplace « Compter la palette » ; aucun bouton Valider, Clore, Recommencer. L'image reste celle de la fin : palettes en zone de réception, camion à quai porte ouverte, chauffeur debout. La légende ne parle plus de signature, ni la consigne (`aides.consignes`) de compter. L'état est **figé** (`fini: true`, comme après « Clore » : le chrono réel s'arrête), le drapeau `dechargeFini` est rangé, et le geste `quai:<id>:dechargement` part **une fois**, quel que soit le chemin (fin de l'animation, « Passer l'animation », mouvement réduit, page rechargée en plein déchargement). Jalons : ceux des étapes jouées (ordre, sécurité, ticket), **pas** de comptage, décision, réserve, déballage, signature, rentrée. |
| `commence` | `'controle'` | La vue **s'ouvre à ③**, déchargement déjà fait : palettes en zone de réception (image de ④), BL en main, chauffeur debout (il part à la signature, comme d'habitude). L'état est construit par `etatNeuf` : ni ligne de journal, ni minute (l'horloge du quai affiche `debut` s'il est déclaré, sinon l'arrivée du camion — **`debut`** est l'heure de début du quai, d'où le nom `commence`). Ni ⓪ ① ② (stepper ③ ④). Jalons : **ni** `ordre`, `securite-*`, `ticket` ; le reste (comptage, décision, réserves, déballage, signature, rentrée), Clore et le bilan sont inchangés. « Recommencer la réception » (sauf `recommencer: false`) revient à ③. |
| `document` | texte, par exemple `'Bon de livraison — lettre de voiture'`, ou `{ nom: 'Bon de collecte', court: 'BC' }` (MOTEUR-chep lot B, 18/10/2026) | Le nom du document de transport dans les titres : « 📄 *document* n° BL… » aux étapes ① (quai iso ou non) et ④. Sans `document`, « Bon de livraison ». Le rappel de ③ dit « Revoir le document » quand un nom est déclaré (« Revoir le bon de livraison » sinon). **Le texte seul ne change pas** les abréviations « BL » des consignes, du journal et des jalons, ni la réplique par défaut du chauffeur. **La forme `{ nom, court }`** remplace en plus « BL » par `court` partout où l'élève le lit (réserve « (BC 15, reçu 14) », comptage, consignes, titre et bouton de l'étape ④, journal, signature, jalons) et nomme le document dans la réplique par défaut du chauffeur et la légende d'arrivée (« te remet le bon de collecte »). Refusé : `nom` ou `court` vide, autre clé. Le quai « déjà réceptionné » (`mode: 'controle'`) ne le lit pas. |
| `rendCopie` | `false` (seule valeur) | (17/10/2026, ENT-8.10, à l'image du Planning) **En copie**, la clôture du quai ne rend pas la copie : le bouton s'appelle « Clore la réception » (deux clics, « Clore définitivement ? Cliquez pour confirmer »), `api.rendreCopie()` n'est pas appelé, et d'autres écrans peuvent suivre le quai (un compte rendu par phrases après la signature) ; la copie se rend par un autre écran. Sans l'option : « Clore la réception et rendre ma copie », qui rend la copie. Hors copie, sans effet. Toute autre valeur (`true`, `'oui'`) est refusée par `verifierQuai`. |

**Contrôle au chargement** (`verifierQuai`, erreur en clair, la séance ne s'ouvre pas) : valeur inconnue de `arret` / `commence`, texte de
`arret` vide ou clé inconnue, `document` vide ; `arret` avec `commence` ; l'une ou l'autre avec `mode: 'controle'` ; l'une ou l'autre avec
plusieurs camions (le suivant ne se met à quai qu'une fois le BL du précédent signé : sans signature, il ne viendrait jamais) ;
`commence` avec `securite` (l'inspection se joue avant le déchargement) ou avec le froid (`froid: false` obligatoire : un lot déjà déchargé
n'a pas de temps hors froid à mesurer). `arret` avec une inspection ou avec le froid est permis.

**Le geste et le déclencheur.** `quai:<id>:dechargement` n'est publié (`signaux`) **que si `arret` est déclaré** : la liste des gestes
des autres séances ne change pas, et `apresGeste('quai:<id>:dechargement')` dans une séance sans `arret` empêche la séance de s'ouvrir
(geste inconnu), comme pour tout nom inconnu. Le déclencheur **`quaiDecharge('<id>')`** (`core/declencheurs.js`, sur le modèle de
`dialogueFini`) est vrai dès que `db.quais[<id>].dechargeFini` est posé. Il sert aux `fermetures`, aux `quand` des messages et des
questions, et se combine avec `tous(…)`. Deux réserves : l'état du quai vit sous `db.quais[<id du quai>]` — **pas cloisonné par séance**
comme `db.dialogues` —, donc **deux séances ne doivent pas déclarer le même `id` de quai** (ENT-8.7 et ENT-8.8 : deux ids) ; et
`entreprise.js` ne contrôle pas encore la liste `.quais` du déclencheur (une faute de frappe sur l'id ne fait jamais arriver le message,
sans erreur).

```js
// ENT-8.7 — décharger (le quai s'arrête quand la 5e palette est posée)
quai: { id: 'action-decharger', rendu: 'iso', froid: false, dechargement: { par: 'cariste', nom: 'Kevin' },
  securite: { mode: 'scene', /* … */ },
  arret: { etape: 'dechargement', texte: 'Les 5 palettes sont en zone de réception. Le contrôle, c’est la prochaine fois.' },
  camions: [ /* CAMION_HAVRE */ ] },
// → message suivant : quand: quaiDecharge('action-decharger')  (ou apresGeste('quai:action-decharger:dechargement'))

// ENT-8.8 — contrôler (la vue s'ouvre à ③, les 5 palettes sont déjà au sol)
quai: { id: 'action-controler', rendu: 'iso', froid: false, dechargement: { par: 'cariste', nom: 'Kevin' }, debut: '07:10',
  commence: 'controle', document: 'Bon de livraison — lettre de voiture', recommencer: false,
  camions: [ /* CAMION_HAVRE, le même */ ] },
```

#### La dépose dirigée par l'élève : `depose` (lot 2 du chantier E-5, 17/10/2026, étape A)

Cadrage et décisions : `docs/briefs/MOTEUR-depose-dirigee.md` (§2), brief `docs/briefs/ENT-8.7-action-decharger.md` §7.2. Code : section « la dépose
dirigée par l'élève » de `core/types/quai.js` (`verifierDepose`, `normaliserCases`, `choisirCase`, `jalonsDepose`, `geometrieDepose`). **Option
facultative : sans `depose`, rien ne change** (le dessin, les gestes, les jalons et la liste `signaux` des autres quais sont ceux d'avant).
Avec `depose`, le cariste ne dépose plus seul : à l'étape ②, il **attend à la sortie du camion** avec chaque palette et c'est l'**élève qui
clique la case** où il la pose. Page d'essai où l'on clique tout (guidage, évaluation, cartons ou fûts, mouvement réduit simulé, avec ou sans
`arret`, tableau de ce que la vue sait) : `outils/essai-quai-inspection.html#depose` (partie 4). Tests : bloc `quai-iso` (étape C du chantier, en cours
d'écriture quand cette fiche a été rédigée : à compléter avec les noms de cas).

**La déclaration.** `depose: { passage?, grise?, cases: [{ id, sol?, legende?, nom?, reaction?, juste?, peinte? }] }`. Les cases sont sur **une
ligne** devant le mur, de part et d'autre du passage de la porte ; l'ordre de `cases` est l'ordre de gauche à droite à l'écran.

| Clé | Valeur | Défaut | Refusé si |
|---|---|---|---|
| `cases` | liste de cases, **8 au plus** | — | absente, vide ou pas une liste ; plus de 8 (« plan non éprouvé au-delà ») ; moins de cases **justes** que de palettes du camion (« il faut au moins une case juste par palette » : une case occupée ne se propose plus, pas de gerbage à la réception) |
| `passage` | nombre de cases **à gauche** de la porte (entier de 0 au nombre de cases) | la moitié, arrondie vers le bas | pas un entier, négatif ou plus grand que le nombre de cases |
| `grise` | `'garde'` : une case piège essayée reste grisée **jusqu'à la fin**, pour toutes les palettes ; `'palette'` : grisée pour la palette en cours seulement | `'garde'` | autre valeur |
| autre clé de `depose` (la maquette avait `consigne`) | — | — | **toute clé inconnue** est refusée, `consigne` comprise |

| Clé d'une case | Valeur | Défaut | Refusé si |
|---|---|---|---|
| `id` | texte court, écrit dans le DOM (`data-c`), le journal (« P4 posée en **R2** ») et les jalons : **neutre**, ne dit pas le verdict | — | vide, ou en double |
| `sol` | `'pieton'` (l'allée piétonne) ou `'autre-quai'` (devant le quai voisin) : **un piège**. Absent = une case de la zone de réception | absent | autre valeur |
| `legende` | « Quai 3 » : le nom de la porte voisine et de sa zone | — | **obligatoire** avec `sol: 'autre-quai'` ; vide |
| `juste` | `true` / `false` | **déduit de `sol`** : sans `sol` vrai, avec `sol` faux | pas un booléen ; `juste: true` avec un `sol` (incohérent : la case se dessine comme un piège) ; `juste: false` **sans `sol`** et sans `reaction` |
| `nom` | ce que lit le clavier / le lecteur d'écran (`aria-label`) : **un nom de lieu, jamais le verdict** | « Case R1 » ; « Case *id*, allée piétonne » (`pieton`) ; « Case *id*, devant le *légende en minuscule* » (`autre-quai`) | vide |
| `reaction` | ce que dit le cariste (bulle) quand l'élève choisit cette case en guidage | `sol: 'pieton'` : « Là, c’est l’allée piétonne : je ne pose pas ici. » ; `sol: 'autre-quai'` : « Ça, c’est la zone du *quai 3*. » ; sinon vide | vide ; absente sur une case `juste: false` sans `sol` |
| `peinte` | `false` : ni contour ni nom au sol, la case ne s'éclaire que **pendant le choix** (variante retenue pour les pièges) | `true` | pas un booléen ; **`peinte: false` sans `sol`** (une case juste est toujours peinte) |
| autre clé de case | — | — | clé inconnue |

**Avec quoi `depose` se combine** (`verifierQuai`, erreur en clair, la séance ne s'ouvre pas). Il **exige** `rendu: 'iso'`, `dechargement: { par:
'cariste' }`, **`froid: false` écrit** (absent = froid, refusé comme pour tout le rendu iso) et **un seul camion** ; il refuse `mode: 'controle'` (quai déjà
réceptionné : pas de déchargement). Une case `autre-quai` ne peut pas **toucher le passage** (les cases `passage - 1` et `passage` : la porte du quai
voisin tomberait sur elle). Les palettes comptées pour les « cases justes » sont celles du premier camion. **Compatible** avec `securite` (l'inspection
se joue avant, ENT-8.7), avec `arret: 'dechargement'` (ENT-8.7) et avec `commence: 'controle'` (ENT-8.8 peut montrer le même quai, voir plus bas).
`heurtsPose` (chariot ou charge qui traverse une autre palette) n'est **pas** dans `verifierQuai` : un test unitaire vérifie que la variante A
n'a aucun heurt (contrôlé le 17/10/2026 en appelant `heurtsPose` sur les 6 cases de la variante A : aucun).

**L'exemple complet : la variante A retenue par Tristan le 17/10/2026** (6 cases : l'allée piétonne, R1 à R4, devant le quai 3 ; pièges non
peints ; `passage: 3` : trois cases à gauche de la porte, trois à droite).

```js
// ENT-8.7 — décharger : l'élève dirige le cariste, le quai s'arrête à la dernière palette posée
quai: { id: 'action-decharger', rendu: 'iso', froid: false, dechargement: { par: 'cariste', nom: 'Kevin' },
  securite: { mode: 'scene', /* … */ },
  depose: { passage: 3, cases: [
    { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne' },
    { id: 'R1' }, { id: 'R2' }, { id: 'R3' }, { id: 'R4' },
    { id: 'quai3-1', sol: 'autre-quai', legende: 'Quai 3', peinte: false, nom: 'Devant le quai 3' } ] },
  arret: { etape: 'dechargement', texte: 'Les 4 palettes sont en zone de réception. Le contrôle, c’est la prochaine fois.' },
  camions: [ /* quatre palettes ou plus, mais jamais plus que de cases justes (ici 4) */ ] }
```

Les cases complétées par défaut : `allee-1` (piège, réaction « Là, c’est l’allée piétonne… »), `R1` à `R4` (justes, « Case R1 »…), `quai3-1`
(piège, réaction « Ça, c’est la zone du quai 3. »). Le sol de la zone de réception est élargi aux cases, son nom est posé à la première case
juste ; l'allée piétonne est une bande hachurée avec sa porte piétonne dans le mur ; la porte fermée du quai voisin porte sa légende. Le chauffeur
du camion n'est **pas** dessiné à ② (un personnage près d'un piège attirerait l'œil) : à ④ il est debout à droite de la dernière case.

**Ce que voit l'élève.** À ②, après « Décharger » : la porte s'ouvre et Kevin attend à la sortie du camion, palette sur les fourches ; la
légende dit « Kevin attend avec la palette P4 (*nom*, 1 sur 4). Où la pose-t-il ? », la bulle de Kevin dit « Dis-moi où je pose chaque palette. Pas de
gerbage à la réception. » (guidage **et** copie, avant la première palette seulement) et **les cases libres s'éclairent** : un clic, ou Tab puis
Entrée / Espace. Les palettes sortent dans l'ordre **inverse** du chargement (P4, P3, P2, P1). ③ reste fermée (bouton du stepper grisé) tant que la
dernière palette n'est pas posée. **Guidage** : une case piège fait réagir Kevin (sa `reaction` en bulle), la case **se grise** (hachures, plus
cliquable, plus au clavier) jusqu'à la fin et l'élève rechoisit ; une case juste est posée. **Évaluation** (`copie`) : le **premier clic pose**, même
sur un piège, sans bulle de réaction ni case grisée (la palette reste là où l'élève l'a mise, y compris à ④). Une case où une palette est posée
disparaît de la couche cliquable. Après un clic ou une pose, le focus (conservé au clavier par le mécanisme habituel) passe à la case proposée
suivante, sinon à la première. Une région `aria-live="polite"` écrit ce que dit Kevin (la bulle dessinée est cachée aux lecteurs
d'écran).

- **Le DOM ne dit jamais le verdict.** Une case proposée est `<g class="quai-case" data-q="depose" data-c="<id>" role="button" tabindex="0"
  aria-label="<nom>">` : l'`id` et le `nom` sont tout ce qu'elle dit, **jamais** « juste » ni « piège ». Une case grisée (`.quai-case-grisee`,
  `data-case-grisee`) est `aria-hidden`, sans rôle ni tabindex ; une case occupée est absente. D'où : choisir des `id` neutres (`R1`, pas `ok-1`),
  un `nom` qui décrit le lieu.
- **Le journal.** Chaque pose écrit une ligne « 07:32 — P4 posée en R2 (+1 min) » (l'`id` de la case, et `dechargement.parPalette` minutes, 1 par
  défaut). **Un refus n'est pas journalisé** (le journal se lit à ③ : un refus n'est pas une faute à afficher). L'ouverture de la porte écrit
  « porte du quai ouverte, début du déchargement » (`dechargement.ouverture`, 0,5 minute par défaut).
- **Après le dernier dépôt.** Kevin revient à vide au point d'attente, fourches baissées ; les palettes sont dans leurs cases (celles de l'état) ; ③
  s'ouvre (« Compter la palette → »), ou, avec `arret`, le bandeau de fin. Le compteur dit « Palettes en *nom de la zone, en minuscule* : 3 / 4 » (`zone.nom`).
- **Page rechargée** : la vue se recalcule de la base (palettes posées dans leurs cases, Kevin à la sortie du camion avec la palette en attente,
  tout de suite en phase de choix) ; le rattrapage habituel de « tout est déchargé » ne s'applique pas sous `depose` : l'état de la dépose fait foi.
- **Animation par geste** (pas de plan précalculé comme pour le quai sans `depose`). La porte se lève (sauf si l'inspection l'a déjà
  ouverte), Kevin entre chercher la palette, ressort et attend (pause « choix ») ; après le clic, il la pose dans la case choisie puis
  cherche la suivante, et ainsi de suite. Pendant un geste : aucune case cliquable, pas de bulle, clavier sans effet ; le conteneur de la
  scène porte `data-q-phase="attente|geste|choix|fin"` et, pendant un geste, `data-q-geste="porte|chercher|poser"`. « Passer l'animation »
  (`data-q="passer"`) va **jusqu'à la pause suivante**, pas plus loin ; « Revoir le déchargement » n'existe pas sous `depose`. La base est
  écrite **au clic** (pose, journal, minutes) : une page rechargée en plein geste ou en pause revient en pause, palettes posées dans leurs
  cases (`[data-iso-posee][data-iso-case]`) et la palette en attente sur les fourches, rien ne se rejoue. En mouvement réduit
  (`prefers-reduced-motion`), aucune animation : les états finaux, avec la même base à l'arrivée. L'heure affichée rattrape la base quand la
  chose arrive à l'écran ; la pause n'est pas comptée dans le temps du quai.

**L'état rangé.** `db.quais[<id>].depose = { <palette>: { premier, essais, pose } }`, ex. `{ P4: { premier: 'allee-1', essais: ['allee-1',
'R1'], pose: 'R1' }, P3: { premier: 'R2', essais: ['R2'], pose: 'R2' } }` : `premier` = la case du **premier** clic (c'est elle que lisent les
jalons), `essais` = toutes les cases cliquées dans l'ordre, `pose` = la case où la palette est posée (`null` tant qu'elle attend). Une palette
sans clic **n'a pas d'entrée** ; les cases grisées et occupées se **recalculent** de cet état, rien d'autre n'est rangé (ni la phase, ni la
position du chariot). Une base ancienne est complétée sans rien effacer (`depose` créé vide, une entrée mal formée remise en forme). Comme
tout l'état du quai, il vit sous `db.quais[<id du quai>]` et **n'est pas cloisonné par séance** : deux séances ne déclarent pas le même `id` de quai.

**Les gestes** (`signaux`, pour les questions au fil et les messages déclenchés). `quai:<id>:depose` est publié **une fois, à la première palette
posée** (quand exactement une palette est posée ; pas aux refus), et **n'existe que si le quai déclare `depose`** (même sous `commence`, où il
n'est jamais publié). `quai:<id>:dechargement` (lot 1, avec `arret`) part quand la **dernière** palette est posée, par le même mécanisme qu'avant
(`dechargeFini` rangé : une fois, même page rechargée). Un « Recommencer la réception » vide l'état de la dépose : le geste `depose` repartirait à
la première pose suivante (non essayé).

```js
// Dans les `declencheurs` de la séance : un message dès que l'élève a posé sa première palette, un autre quand le quai est fini
{ id: 'kevin-1ere-palette', quand: apresGeste('quai:action-decharger:depose'), semer: (prenom, db) => ({ mails: [ /* … */ ] }) },
{ id: 'kevin-fin', quand: apresGeste('quai:action-decharger:dechargement'), semer: /* … */ },   // ou : quand: quaiDecharge('action-decharger')
// Une question au fil (§4 bis du brief), par exemple « pourquoi pas de gerbage à la réception ? », posée une fois la première palette posée :
//   quand: apresGeste('quai:action-decharger:depose')
```

**Les jalons** (`jalonsQuai`, groupés par `etapesQuai`). Un par palette du camion : `depose-P1`, `depose-P2`… (dans l'ordre du **contenu**, pas de sortie),
libellé neutre « Dépose de la palette P4 ». `ok` = **tout est posé ET le premier clic de cette palette était juste** : tant que la dernière
palette n'est pas posée, ils sont tous faux (rien posé = tous faux : le jalon ne récompense pas l'inaction), et ils existent dès une base vide
(`jalonsQuai({}, Q)`, `ok: false`). Le `lib` ne dit pas la bonne case ; `attendu` la dit, lu au bilan : « une case de la zone de réception (R1,
R2, R3, R4) » ; `fait` dit « premier choix : *nom de la case* » (suivi de « (posée ensuite en R2) » si l'élève a rechoisi) ou « pas posée ».
Ils comptent dans le total du quai. Ils sont **absents** sous `commence` (la dépose n'y est pas jouée). `etapesQuai` leur donne
`groupe: 'Diriger le déchargement'` : **une seule ligne** au bandeau de fin (jamais « P3 ✗ » : la case nommée fausse donnerait la réponse). Le
barème de la séance (`ponderer`, `contenus/ponderation.js`) doit **nommer chacun de ces ids** (sinon la séance refuse de se charger) ; si une
entrée du barème donne un bloc (`[poids, 'Bloc']`), ce bloc **remplace** le groupe ; avec `[poids]` seul, le groupe `Diriger le déchargement`
est gardé (lu dans `ponderer` : `{ ...e, groupe du barème s'il y en a un, poids }`).

**Sous `commence: 'controle'` avec `depose`** (ENT-8.8) : la dépose n'est pas jouée, la vue s'ouvre à ③. Les palettes sont **dessinées dans les
cases justes**, dans l'ordre du contenu (P1 dans la première case juste, P2 dans la suivante…), et le sol, l'allée et le quai voisin sont dessinés
comme à ②. Aucun jalon `depose-*`, aucune couche de cases, aucun geste. De même à ④ : les palettes sont dans leurs cases **réelles** (celles
de l'état), les éventuelles autres dans les cases justes libres.

##### La dépose par client (chantier Transports Pelleau, lot D, 19/10/2026)

Cadrage : `docs/briefs/MOTEUR-depose-par-client.md`, `docs/briefs/COORDINATION-pelleau.md` §2 point 7. Le camion rapporte les palettes de **plusieurs
clients**, mélangées ; chaque palette va dans la **zone de son client**, qu'on lit sur son étiquette. **Option facultative : un quai dont aucune case ne
déclare `client` reste exactement celui d'avant** (dessin, textes, jalons, état). Page d'essai : `outils/essai-quai-inspection.html#depose-client`
(partie 4 bis : deux clients, six cases, guidage ou évaluation, bilan de fin détaillé). Tests : bloc `quai-iso`, cas « Dépose par client : … ».

```js
depose: { passage: 3, cases: [
  { id: 'allee-1', sol: 'pieton', peinte: false, nom: 'Allée piétonne' },
  { id: 'AV1', client: 'ar-vag' }, { id: 'AV2', client: 'ar-vag' },
  { id: 'AK1', client: 'agri-kerlann' }, { id: 'AK2', client: 'agri-kerlann' },
  { id: 'quaiB-1', sol: 'autre-quai', legende: 'Quai B', peinte: false } ],
  clients: { 'ar-vag': { nom: 'Biscuiterie Ar Vag', court: 'AR VAG' }, 'agri-kerlann': { nom: 'Agri-Kerlann', court: 'AGRI-KERLANN' } },
  reactionClient: 'Ça, c’est la zone {client}. Regarde l’étiquette.' },   // facultatif
camions: [{ palettes: [ { id: 'P1', client: 'agri-kerlann', /* … */ }, { id: 'P2', client: 'ar-vag' }, … ] }]
```

| Clé | Valeur | Refusé si |
|---|---|---|
| `client` d'une case | l'id d'un client de `depose.clients` : la case n'est juste **que pour les palettes de ce client** (toujours peinte, nom au sol `court` + numéro dans ce client : « AR VAG 1 », « AR VAG 2 » ; nom au clavier par défaut « Case AR VAG 1 ») | avec `sol` ; avec `juste` ; vide ; inconnu de `depose.clients` ; `peinte: false` |
| `client` d'une palette (premier camion) | l'id de son client : **obligatoire pour toutes** dès qu'une case déclare `client` ; l'étiquette de la palette à ③ dit alors « Expéditeur : *nom* » à la place du fournisseur du camion | absent ; inconnu de `depose.clients` |
| `depose.clients` | `{ id: { nom, court } }` : `nom` (bulle, légende, bilan, étiquette), `court` (écrit au sol, en capitales). Un client sans case ni palette est permis (la liste commune de l'univers) | absent ou vide ; `nom` ou `court` vide ; autre clé ; **déclaré sans aucune case de client** (clé inconnue) |
| `depose.reactionClient` | ce que dit le cariste devant la case d'un autre client, `{client}` = le nom de ce client. Défaut : « Ça, c'est la zone d'*Agri-Kerlann*. Regarde l'étiquette. » (« de » devant une consonne : « la zone de Biscuiterie Ar Vag »). La `reaction` d'une case de client, si elle est écrite, passe avant | vide ; déclaré sans case de client |
| `depose.grise` | **`'palette'` imposé** sous une dépose par client (écrit ou non) : une case refusée pour P4 reste juste pour la palette suivante de l'autre client ; un piège `sol` aussi n'est grisé que pour la palette qui l'a essayé | `'garde'` |
| autres contrôles | pour chaque client, **au moins autant de cases que de palettes** de ce client ; 8 cases au plus (inchangé) ; **une case sans `client` ni `sol`** (case ambiguë : pour qui est-elle juste ?) | — |

**Ce que voit l'élève.** La légende de la pause cite **ce que dit l'étiquette**, jamais la zone : « Yann attend avec la palette P4 — étiquette : « Expéditeur :
Biscuiterie Ar Vag » (1 sur 4). Où la pose-t-il ? » (c'est le geste à apprendre : lire l'étiquette). **Guidage** : la case d'un autre client fait réagir
le cariste (`reactionClient`, dans la bulle et la région `aria-live`), se grise **pour cette palette seulement**, l'élève rechoisit ; les pièges `sol`
réagissent comme avant. **Évaluation** (`copie`) : le premier clic pose, même chez l'autre client, sans réaction. À ③ et à ④, chaque palette est dans sa
case réelle ; sous `commence: 'controle'`, chaque palette est dans la **première case libre de son client** (dans l'ordre du contenu). Le nom au sol se
coupe en une à trois lignes pour tenir dans la case : un `court` à mots courts (sept signes au plus par mot) reste lisible à 1366 × 768.

**Jalons et bilan.** `depose-P1`… inchangés dans leur forme et leur groupe (`Diriger le déchargement`, renommable par le barème) ; `ok` = tout posé **et**
premier clic dans une case **de son client** ; `attendu` « une case de la zone Biscuiterie Ar Vag (AV1, AV2) » ; `fait` « premier choix : Case AGRI-KERLANN 1
(posée ensuite en AV1) ». Chaque ligne de `jalonsQuai` porte en plus `bilan` (« P3, Agri-Kerlann : posée en AK1 » ; « P4, Biscuiterie Ar Vag : d'abord en
AK1, posée ensuite en AV1 » ; « … : pas posée ») et `etapesQuai` donne aux jalons `depose-*` un **`titreBilan`** qui le lit : avec `meta.bilanDetail`, le
bloc faux du bandeau de fin descend à **une ligne par palette** (au bilan seulement, jamais pendant la dépose). Une séance qui écrit ses propres jalons
à partir des lignes du quai (comme ENT-8.10) reprend `titreBilan: (db) => ligneQuai(db, 'depose-P3').bilan`.

#### Plusieurs palettes sur le quai iso

Avant ce chantier, le quai iso déchargeait une palette (Spartoo). Il en décharge maintenant plusieurs (joué et testé avec les
quatre palettes de fûts d'ENT-6.4). La remorque dessinée fait 3,3 m et l'ouverture 1,2 m (décor stylisé) : aux étapes ② et ④
les palettes de fûts sont dessinées à l'échelle du décor, en grand à ③ ; celles du fond sont coupées au mur ; la zone de
réception, les places d'arrivée et le cadre (agrandi à partir de trois palettes) sont calculés pour N palettes ; une file
d'attente avance d'un cran dans la remorque. Avec **une** seule palette, les valeurs sont celles d'avant (Spartoo).

#### Exemple (le quai d'ENT-6.4, forme réelle des champs)

```js
quai: {
  id: 'ent64', rendu: 'iso', froid: false, lieu: { nom: 'Quai 12', temp: 15, refrigere: false },
  unite: 'fûts', motifs: ['avarie', 'manquant', 'produit'],
  libelles: { avarie: { nom: 'Fût endommagé', precision: 'fuite' } },
  dechargement: { par: 'cariste' },
  securite: {
    mode: 'scene', arret: false,
    consigne: 'Clique sur ce qui ne va pas, puis signale-le à Nadia.',
    points: [
      { id: 'cabine', objet: 'cabine', etat: 'conduite', ok: false, lib: 'Chauffeur au volant, moteur allumé',
        repare: 'Bien vu : je fais couper le moteur, le chauffeur me donne les clés et descend.' },
      { id: 'niveleur', objet: 'niveleur', etat: 'releve', ok: false, lib: 'Niveleur relevé', repare: 'Bien vu : je pose le niveleur.' },
      { id: 'cale', objet: 'cale', etat: 'posee', ok: true, lib: 'Cale de roue' },       // un piège : en ordre
      { id: 'butoirs', objet: 'butoirs', etat: 'enPlace', ok: true, lib: 'Butoirs de quai' },
      { id: 'lampe', objet: 'lampe', etat: 'allumee', ok: true, lib: 'Lampe de quai' },
    ],
    signaler: { qui: 'Nadia' },
    bilan: 'La scène n’était pas sûre : avant d’entrer dans un camion, il doit être immobilisé et le passage vers la remorque doit être sûr.',
  },
  camions: [{ transporteur: '…', fournisseur: '…', bl: '…', arrivee: '07:30', palettes: [ /* P1 à P4, forme: 'fut' */ ] }],
}
```

Les jalons se lisent par `etapesQuai(QUAI)` comme pour tout quai : les poids se donnent dans les `etapes` de la séance.

## `meta` : les champs

### Identité (toujours)

| Champ | Contenu | À savoir |
|---|---|---|
| `id` | `'boost-ent32'` | Clé technique. **Jamais modifiée** : elle est écrite dans les chemins Firebase. |
| `code` | `'ENT-3.2'` | Ce que lit l'élève **et** ce qui décide du rang d'affichage. Forme `LETTRES-n` ou `LETTRES-n.n`. Un code mal formé garde sa place mais ne se trie plus. |
| `titre`, `desc` | texte | Affichés sur la tuile et en tête de la séance. |
| `rubrique` | `'simulog'` | Doit exister dans `RUBRIQUES` (`activites/index.js`). Rubriques : `logistique`, `scenario`, `quiz`, `tableur`, `simulog`, `magasin`. Simulog est rangé par entreprise : le **premier nombre du `code`** (`ENT-3.2` → 3) choisit le logo sous lequel la séance apparaît, d'après la table `ENTREPRISES` du même fichier. Entreprise nouvelle = une ligne dans `ENTREPRISES` (numéro, nom, métier, logo dans `contenus/trames/logos/`) ; sans cette ligne, la séance reste visible sous « Autres séances ». La ligne peut porter `intention: { pdf, docx }` (fichiers dans `contenus/intentions/`) : la **fiche d'intention** du scénario, une pour toutes ses séances, montrée à l'**enseignant seul** (onglet Corrigés, en tête de l'entreprise, et bandeau de la séance). Déclarer, c'est valider : pas de champ tant que Tristan n'a pas relu la fiche. |
| `portee` | `'eleve'` / `'groupe'` | À qui appartient la base : `'eleve'` = base privée de chaque élève ; `'groupe'` = base partagée par la classe (ou par le demi-groupe), qu'un groupe actif doit avoir ouverte. Les portées équipe et commune ont été retirées le 09/10/2026 (chantier 16) : aucune séance, aucun écran ne les utilisait ; une autre valeur est refusée à l'ouverture de la base (`Portée inconnue`). |
| `pret` | `true` / `false` | `false` : cachée aux élèves, visible de l'enseignant (étiquette « en préparation »). On passe à `true` quand Tristan a validé à l'écran. |
| `ouverture` | `'prof'` (ou absent) | `'prof'` : séance prête mais **fermée aux élèves tant que l'enseignant ne l'a pas cochée** pour son groupe dans « Conduite de séance » (ouvrir ne demande plus de commit). Absent : le niveau du groupe décide, comme avant. **Règle depuis le 03/10/2026 (brief `MOTEUR-ouverture-par-enseignant`) : une séance nouvelle (ENT-3.4, ENT-2.5…) est livrée avec `pret: true, ouverture: 'prof'` ; Tristan l'essaie, puis la coche lui-même pour son groupe.** Règle adoptée par Tristan (aussi dans `CLAUDE.md`). `pret: false` reste possible pour un brouillon qu'il ne faut pas pouvoir ouvrir. |

Familles de code : `DEC` découverte, `ACT` outil métier, `ENT` entreprise (`ENT-1.2` = entreprise 1,
séance 2), `TAB` tableur, `REF` exercices par compétence, `SCE` scénario ancien, `QUI` quiz,
`MES` messagerie. Changer un `code` déplace la séance partout, sans perdre de score.

### Niveaux et notes

| Champ | Contenu | À savoir |
|---|---|---|
| `niveaux` | `['2de','1re']` | Absent = tous les niveaux. L'enseignant peut forcer l'ouverture ou la fermeture par groupe. |
| `niveauxPrevus` | `['confirme']` (plus tard `['confirme', 'accompagne']`) | Niveaux **d'élève** (pas de classe) pour lesquels la séance prévoit un contenu (chantier D-C, 09/10/2026). Fait apparaître son entreprise en colonne dans l'onglet « Niveaux » de l'enseignant (Cdiscount y est toujours). Une séance qui déclare des cas bonus (`tirage.banques.*.bonus.confirme`) doit déclarer `'confirme'` : la fabrique la refuse sinon. Guidage et entraînement seulement : l'évaluation est la même pour tous. |
| `competences` | `['C2.4']`, `['C1.4', 'OTM-C2.1']` | Codes de la liste de `core/competences.js` : Logistique 2025 sans préfixe (C1.1 à C3.4), transport `OTM-C1.1` à `OTM-C3.4`, gestion `AGO-1.1` à `AGO-3.3` (activités AGOrA). Un code absent de la liste donne un libellé vide à l'écran ; c'est le test du socle qui le signale. Toute séance Simulog les déclare. Le préfixe donne la **spécialité** : pour un groupe de 2de, l'onglet « Compétences » ajoute une moyenne par spécialité (une séance y compte une fois). |
| `competencesCap` | `['CAP-C1.3', 'CAP-C1.4']` | Compétences du **CAP Opérateur logistique** (référentiel 2026 : `CAP-C1.1` à `CAP-C1.5`, `CAP-C3.1` à `CAP-C3.7` ; le bloc 2, conduite d'engins, est hors Prepalog), déclarées **en plus** de `competences` (brief `MOTEUR-cap-ol`, choix de Tristan du 15/10/2026). Un groupe de niveau `cap` les lit **à la place** de `competences` : son onglet « Compétences » et son export sortent des colonnes CAP-C…, et une séance sans ce champ n'entre dans aucune moyenne CAP (elle reste dans le suivi par séance). Les autres groupes ne le lisent jamais : aucune moyenne Bac Pro ne bouge. Le socle refuse un code `CAP-` dans `competences`, autre chose qu'un code `CAP-` ici, et tient la liste des séances qui le déclarent (tableau §3 du brief, validé par Tristan). |
| `domaines` | `['D2', 'D4']` | Domaines D1 à D5 de la 2de. **Déclaré, pas encore lu** : en attente de l'écran cœur / complément (décision 14 de la finalité). Gardé exprès (décision de Tristan, 09/10/2026). |
| `coeur` | `true` / `false` | `true` : séance du **cœur** (parcours minimal qui couvre les compétences du niveau) ; `false` : **complément**. Absent = pas encore rangée. **Déclaré, pas encore lu** : en attente de l'écran cœur / complément (décision 14 de la finalité) ; gardé exprès sur les huit séances qui le portent (décision de Tristan, option A, 09/10/2026). Le nom `parcours`, proposé dans les fiches, est déjà pris (parcours strict, plus bas). |
| `temps` | `'guidage'` / `'entrainement'` / `'erreur'` / `'evaluation'` | Fixe le coefficient (1, 1, 1, 3 par défaut). |
| `bareme` | nombre | **Sa présence = la séance apparaît dans le suivi de classe.** Pour entrer dans le tableau par compétence il faut en plus `competences` et un `temps` valide. |
| `notation` | `'prof'` / `'avancement'` | Absent = score calculé par le moteur, ramené sur 20. `'prof'` : saisie à la main. `'avancement'` : jalons (ramenés sur 20 seulement dans le tableau par compétence). **Règle du 10/10/2026 : une séance d'entreprise (ENT-x.y) n'est plus en `'avancement'` ni à « un jalon = un point » ; elle déclare `bareme: 20` et un `poids` par jalon du socle (somme 20), les jalons regroupés par `groupe`.** Le poids va au cœur de la compétence (le piège, la décision métier), la forme (ton, politesse, présentation) ne dépasse pas ~15 %, aucun jalon à 0 ; **les poids sont validés par Tristan avant d'être codés** (tableau bloc / jalons / points). Hors règle : QUI, TAB, DEC-1, SCE, ACT-1. Brief : `docs/briefs/NOTATION-ponderation.md`. |
| `copie` | `true` | Évaluation en « copie rendue » : rien ne remonte pendant le travail, une seule remise, note figée. Demande aussi `copie: meta.copie` dans `creerEntreprise` et l'export `noter`. |

### Jalons pondérés et groupés (07/10/2026)

Un jalon (`etapes`) peut déclarer, en plus de `id`, `titre` et `verifier(db)` :

- `poids` : sa part de la note sur 20. La somme des poids d'une séance **vaut 20** : le moteur le vérifie à l'ouverture et
  refuse de la monter sinon (« La somme des poids des jalons vaut … au lieu de 20 »). Sans `poids`, chaque jalon vaut 1
  (le score est le nombre de jalons réussis, `bareme` = leur nombre). Avec des poids : `bareme: 20`. Un bloc a une part
  **fixe** de la note, partagée entre ses cases : ajouter une case ne change pas l'équilibre.
- `groupe` : la ligne du bandeau de fin (séance `correction`, ou visite notée au premier essai). Un groupe est juste quand toutes ses cases le sont. Le
  bandeau ne descend jamais à la case (une case oui/non nommée fausse donnerait la réponse) et n'affiche jamais de points.
- `ecran` : où l'élève corrige, `'fiche:<id de la fiche>'` (`'fiche'` seul vaut la première fiche de la séance, depuis le 18/10/2026 ; préférer l'identifiant), `'phrases:<id du message par phrases>'`, `'planning:<id du
  planning>'`, `'transfert:<clé du message>'` (un message à transférer, voir plus haut) ou `'dialogue:<id du dialogue>'` (un appel : « Rappeler », voir « Vue « Dialogue à choix » ») ; ou une fonction `(db) => …` qui rend
  l'un de ces textes pour l'élève (son message tiré : « Fonction de la base de l'élève », plus haut). Le bouton « Corriger » n'apparaît que s'il y a un `ecran` à rouvrir parmi les jalons faux. Un planning se rouvre
  à la première version fausse, avec le planning envoyé : si c'est la 1re, la version d'après l'aléa est mise de côté et revient
  au renvoi (deux envois = **une** correction, compteur `finis` de l'état du planning).
  Un jalon faux **sans** `ecran` ne se rouvre pas (ENT-5.4 : BL signé, camion reparti). La séance peut le dire au bandeau
  par `finFige: '<une phrase>'` dans `creerEntreprise` ; s'il n'y a rien à rouvrir, le bandeau ne parle plus de corriger.
- `bonus: true` (chantier D-C, lot 3, 09/10/2026) : un **cas bonus du confirmé**, **sans `poids` ni `groupe`** (la
  fabrique et le moteur le refusent sinon) ; la séance doit avoir des jalons du socle pondérés (somme 20). Il ne compte ni
  dans la somme des poids, ni au bandeau, ni dans « fini » ; il n'est jugé que chez un élève dont `db.aisance === 'confirme'`,
  jamais en évaluation, et son `verifier` rend **`null`** quand l'élève n'a pas reçu le cas (la séance les fabrique d'après
  `TIRAGE.piecesBonus(db, …)`, un jalon par rang). Chaque cas juste ajoute `BONUS.parCas` (0,5) point à la note du socle, au
  plus `BONUS.plafond` (2) par séance, note plafonnée à 20 (`core/notes.js`, le seul réglage) ; un cas faux ne retire rien.
  Séance `correction` : bonus du premier bilan (`indicateurs[séance].bonus1`), à la 1re correction le plus haut de `bonus1` et
  de la moyenne avec le bonus de ce moment (`bonus2`), puis figé. Le détail porte `bonus: { justes, total, points, etats }`.
  **Caché à l'élève** : rien au bandeau, aucune ligne, aucun mot « bonus » ; l'enseignant le lit dans l'infobulle du Suivi
  (« dont bonus +1 (2 cas sur 2) ») et dans l'onglet Corrigés. Le `bareme` déduit par la fabrique ne compte pas ces jalons.
- **Note d'une séance pondérée en copie** (14/10/2026 pour le planning et l'entrepôt, 17/10/2026 pour le quai) : la note reste celle
  des jalons pondérés et des questions d'ouverture ; la note du quai, du planning ou de l'entrepôt (qui existe toujours en copie) ne la
  remplace jamais. Son détail reste rangé (`detail.quai`, `detail.planning`, `detail.entrepot`) pour l'enseignant. Sans poids, la note
  de la vue reste la note de la séance.
- `compte: false` : un jalon de passage (ENT-5.4 : la signature du BL), sans poids ni ligne au bandeau. Il doit quand même
  être jugé pour que la séance soit finie.

Jalons du planning (`etapesPlanning`, 07/10/2026) : « à faire » tant que leur version n'est pas envoyée, puis justes **ou faux**
(avant, un jalon raté restait « à faire » pour toujours). Ils se pondèrent et se groupent comme les autres :
`etapesPlanning(P).map((e) => Object.assign(e, { poids, groupe, ecran: 'planning:<id>' }))`.

Planning (ENT-5.7, 07/10/2026) : un jalon de la déclaration du planning peut porter `versions: [2]` (jugé seulement
après l'aléa : une règle toujours vraie avant serait un point gratuit), et la déclaration `repriseIdentique: 'faux'`
rend fausse la version d'après l'aléa renvoyée **sans changement**, sauf si elle respecte déjà l'aléa.

Compteur de corrections lisible par le Suivi : `detail.indicateurs[<id de la séance>].corrections`, avec `bilan1` (état des
jalons au premier bilan) et `bilan2` (état à la 1re correction).

Un jalon ne se juge jamais **pendant la frappe** : chaque réécriture de la note coûte une lecture et une écriture
(quota Spark). Les jalons d'une fiche ou d'un message basculent à l'envoi, d'un seul coup.

`volet.corrections: { '<id de la fiche, du message par phrases ou clé du message transféré>': (prenom, n, db) => ({ mails: [...] }) }` : le message que reçoit
l'élève à chaque envoi **corrigé** (deuxième envoi et suivants), sans rejouer le premier message ni dire si c'est juste.

### Base de l'élève, parcours, affichage

| Champ | Contenu | À savoir |
|---|---|---|
| `jeuId` | `'boost'` | Plusieurs séances travaillent dans **la même base**. Les scores restent par séance. Sans `jeuId`, la base porte l'`id`. |
| `tables` | `{}` ou `{ resultats: {} }` | Tables de la base. Vides pour une séance d'entreprise, qui range tout dans sa base. Une table d'une base de **groupe** peut déclarer `ecriture: 'tous'` (le stock du magasin) : le bouton « Semer » de l'enseignant écrit alors `meta/ouvert/{table} = 'tous'` dans la base (`core/store.js`, `semer`), ce que la règle de la Realtime Database exige pour qu'un élève du groupe modifie la ligne d'un autre (chantier 16, 09/10/2026). **Limite connue** : l'écran `core/types/tableau.js` ne lit pas `ecriture` (`peutModifier` : l'élève ne voit « Modifier » que sur les lignes qui portent son `_par` : ses propres lignes en réel, aucune en démo, qui n'écrit pas `_par`), donc l'ouverture n'a d'effet visible que si cet écran la lit un jour. Une table jamais semée garde la règle par défaut (chacun modifie ses lignes). |
| `reinitialisable` | `false` | Bouton « Réinitialiser » d'une séance d'entreprise. Mettre `false` quand la base est partagée avec d'autres séances (X.2, X.3…). |
| `parcours` | `true` | La séance fait partie d'un parcours strict. |
| `precedente` | `'<id>'` | Avec `parcours` : la séance qui doit être validée avant. Absent sur la première. Sa validation range une **photo** du travail, qui sert de point de reprise. |
| `versionBase` | `2` | Avec `parcours` (06/10/2026, refonte d'ENT-1.1) : numéro de version de la base partagée. Une base d'une version antérieure **repart de zéro** à sa prochaine ouverture, une seule fois (photos, scores du parcours et déblocages effacés, `core/app.js`) ; d'ici là, les séances suivantes sont fermées. Le monter = remettre à zéro tous les élèves du parcours : le dire à Tristan. Une séance de parcours affiche aussi le **bandeau de fin de séance** à l'élève (étapes fausses nommées par leur titre). |
| `correction` | `true` | Avec `parcours` (07/10/2026, lots A et A bis de SMOBY-retours-classe-5.1 ; ENT-5.1 d'abord) : règle du **premier bilan**. La séance suivante s'ouvre dès que tous les jalons sont jugés (photo de fin rangée au premier bilan complet, remplacée à chaque nouveau bilan complet qui change), l'élève peut **corriger** (bouton « Corriger » du bandeau : une fiche est rouverte, une réponse par phrases se renvoie), la note du suivi reste l'état actuel tant qu'il n'y a pas eu de correction ; dès la **première correction**, c'est la **moyenne** du premier bilan (`bilan1`) et de l'état à cette première correction (`bilan2`), puis elle ne bouge plus (les deux sont rangés dans `db.indicateurs[séance]`), le bandeau de fin liste **tous les groupes en ✓ / ✗**. Suppose que les jalons restent « à faire » jusqu'à l'envoi : **ne pas l'activer sur une séance qui juge en continu** (Spartoo, Boost : un jalon y passe « ko » en cours de route, le premier bilan serait faussé) ; **le code ne sait pas le vérifier** (aucun marqueur ne distingue les deux sortes de séance). La fabrique refuse seulement `correction: true` quand **aucun jalon ne déclare d'`ecran`** (fiche, phrases, planning : ce que « Corriger » rouvre) : c'est le cas de Spartoo et de Boost, pas des cinq séances Smoby qui ont le drapeau ; une séance qui mêle jalons à `ecran` et jugement continu passerait (voir le lot 9a de `docs/chantiers.md`). Sans le drapeau, tout reste comme avant. Jamais en évaluation (`copie`). |
| `bilanDetail` | `true` | Avec `correction` (ENT-8.1 et 8.2, CAP, 16/10/2026, choix de Tristan) : sous chaque bloc ✗ du bandeau de fin, **une ligne par case** ✓ / ✗ (titre du jalon, jamais la réponse) et, sur chaque ligne fausse qui se rouvre, un bouton **« Corriger dans « <écran> » »** qui ouvre CET écran (les autres écrans faux sont rouverts aussi). Après « Corriger », la liste **« À corriger »** (`db.aCorriger[séance]`) reste en haut de l'écran : chaque écran rouvert, coché quand il est renvoyé ; le bilan revient quand tout est jugé. Un jalon peut déclarer **`titreBilan`** (texte ou `(db) => texte`) : le titre de sa ligne dans le détail — **obligatoire quand l'ordre des lignes de la fiche est tiré** (ENT-8.1 : le nom de l'acteur, « la situation n° k ») ; sinon deux cases au même titre sont numérotées dans l'ordre des jalons. |
| `suiteAuBilan` | `true` | Avec `parcours` (07/10/2026, lot 0 de SMOBY-notation-5.3-5.8 : aucun élève bloqué en fin de séance) : la séance suivante s'ouvre dès que **tous les jalons sont jugés**, justes ou faux (photo de fin rangée comme pour `correction`), sans bouton « Corriger » ni note moyennée. Le bandeau de fin reste l'ancien, sa dernière phrase dit que la suite est ouverte. `correction: true` l'implique. Une séance dont les jalons ne sont jamais « faux » déclare en plus `seanceFinie: (db) => bool` dans `creerEntreprise` (ENT-5.6 : préparation terminée et vérifiée). |
| `immersif` | `true` | Prend toute la page, sans bandeau Prepalog : la séance dessine son propre en-tête et sa sortie (`ctx.quitter()`). **C'est une option d'affichage, rien d'autre** (chantier 10, 09/10/2026) : une séance d'entreprise se reconnaît à `rubrique: 'simulog'` (posée par la fabrique), jamais à `immersif` ni à son code `ENT-`. Le Suivi de classe, le repérage, la remise à zéro, la version de base, la reprise et les parcours demandent `estSimulog(meta)` (`activites/index.js`) ; un cas de `outils/test/dependances.mjs` garantit que rubrique, code `ENT-` et `immersif` vont ensemble, et qu'aucun fichier de `core/` ne filtre plus sur l'un des deux derniers. |
| `corrige` | `'./contenus/corriges/ENT-3.1.js'` | Fichier de corrigé montré dans l'onglet « Corrigés » de l'enseignant. L'élève ne le voit pas, mais le fichier est public (voir CLAUDE.md). |
| `volume` | `VOLUME` | Volume déclaré de la séance (séances Cdiscount). **Aucun écran du site ne le lit** : seuls les tests de `outils/test/cdiscount.mjs` le relisent (ils comparent ce que la séance déclare au volume réel de sa base). Gardé pour cette raison (chantier 16, 09/10/2026). |

## Ce que reçoit `rendre(hote, ctx)`

| `ctx.` | Rôle |
|---|---|
| `profil`, `groupe`, `groupeNom`, `niveauGroupe`, `codeStock` | Qui travaille, dans quelle classe. |
| `aisance` | `'standard'`, `'confirme'` ou `'accompagne'` : le niveau de l'élève **dans le scénario de la séance** (premier nombre du `code`), réglé élève par élève et entreprise par entreprise par l'enseignant (onglet « Niveaux », 09/10/2026). Hors séance d'entreprise : `'standard'`. **Le moteur ne grossit rien** : seule une séance qui le prévoit dans son contenu en tient compte (règle de Tristan : jeu de données +30 % en guidage/entraînement, +50 % en bonus). Le contenu en plus **s'ajoute** au jeu standard sans rien changer à ses exercices ni à ce qu'attendent ses jalons. Toujours `'standard'` pour l'enseignant. Ne pas confondre avec `niveauGroupe` (la classe). |
| `tiersTemps` | Booléen, réglé par l'enseignant. Une épreuve chronométrée multiplie ses **seuils** de temps par 4/3 (le chrono mesure, il ne coupe pas) et l'affiche à l'élève. Donnée de santé indirecte : ne l'afficher qu'à l'élève lui-même, jamais dans une vue projetable, ne pas l'exporter. Première utilisatrice : la vue quai. |
| `meta` | Le `meta` de la séance. |
| `intention`, `suivante` | La fiche d'intention de l'entreprise (`{ pdf, docx }` ou null, montrée à l'enseignant seul) et la séance suivante du parcours (`{ code, titre }` ou null). |
| `jeu` | La base ouverte : `etat()`, `sauver()`, `semer()`, `vider()`… |
| `enregistrer({score, max, detail}, { siChange, cle })` | Remonte le score au suivi. Sans effet pour l'enseignant, sans groupe, sans `bareme`, ou en `copie`. `siChange: true` : pas de réécriture si la note n'a pas changé depuis la dernière envoyée (quota Spark) ; `cle` : ce qui est comparé. Une note posée par l'enseignant (« mettre 0 ») n'est plus réécrite par l'élève, qui lit un message (08/10/2026). |
| `enregistrerTemps(secondes)` | Le temps passé seul (`detail.indicateurs[id].temps`), sans score ni tentative ; utilisé par la vue entreprise toutes les 2 min. Mêmes gardes ; rend `false` si le résultat n'existe pas encore. |
| `rendreCopie({score, max, detail})` | Remise d'une évaluation (`copie: true` seulement). Une seule fois. |
| `lireScore()` | Le travail déjà enregistré, utile pour une séance notée à la main. |
| `quitter()`, `deconnexion()` | Sortie d'une séance immersive. |
| `surSortie(fn)` | Déclare le nettoyage à faire en quittant l'activité (minuteries, dernière sauvegarde). Le site l'appelle une fois, quelle que soit la sortie : bouton du site, `quitter()`, **flèche « Précédent » du navigateur**, déconnexion. Chaque écran du site est une étape de l'historique (04/10/2026) ; les écrans internes d'une séance n'en sont pas. |

## Geste tableur (Exporter, traiter, Déposer) — `core/types/export-tableur.js`

Depuis le 04/10/2026 (chantier C5, brief `docs/briefs/MOTEUR-geste-tableur.md`). Une séance d'entreprise
déclare `tableur` dans `creerEntreprise` ; sans lui, rien ne change.

```js
tableur: {
  aide: 'SI(test ; si vrai ; si faux) — NB.SI(plage ; critère)',  // « Rappel tableur » du bandeau, jamais dans l'écran
                                                     // (le moteur y ajoute le rappel guillemets / A1 / format texte)
  exports: [{
    id: 'preparations', liste: 'Lignes de préparation', fichier: 'x.xlsx',   // `liste` : son nom dans Extractions
    feuilles: [{ nom: 'Préparations', colonnes: [...], lignes: (db) => [[ts, 'BP-…', …]],  // PURE : LA DEMANDE
                 types: { Date: 'date' },              // 'date' | 'dateHeure' : la valeur est un horodatage
                 aveugle: ['Stock logiciel'] },        // retirée tant qu'un comptage à l'aveugle n'est pas validé
               { nom: 'Synthèse', colonnes: ['Référence', 'Nb constats'], lignes: (db) => [['CAB-USBC-1M', null]] }],
    salissures: { vides: 4, doublons: 3, datesTexte: 5 },   // 1re feuille ; graine = élève + séance
    // L'élève choisit ce qu'il exporte (04/10/2026, brief `docs/briefs/MOTEUR-export-filtre.md`) :
    autres: (db) => [[…], …],                         // lignes À ÉCARTER, même format ; aucune ne passe la demande
    aujourdhui: (db) => db.created,                    // le jour de la séance (pour les périodes)
    filtres: [{ id: 'allee', libelle: 'Allée', valeur: (l) => l.Emplacement[0], tous: 'Toutes', juste: 'A' },
              { id: 'type', libelle: 'Type de mouvement', colonne: 'Type', juste: 'Ajustement inventaire' },
              { id: 'periode', libelle: 'Période', periode: 'Date', juste: '30j', defaut: '7j' }],
    indications: 1,                                    // 1 à 4, voir ci-dessous
  }],
  depot: { id: 'analyse', export: 'preparations', libelle: 'Déposer mon fichier',
           retour: 'guidage' | 'entrainement' | 'evaluation',   // défaut : déduit de meta.temps
           controles: (db, propres) => [ … ] },         // `propres` : les lignes de l'export DE L'ÉLÈVE
}
```

**Où l'élève exporte** : l'écran **Extractions** (menu Outils) — la liste, ses critères AU-DESSUS du tableau, le
nombre de lignes, « Exporter » qui sort ce qu'on voit (toutes les colonnes). **Fichiers** ne sert plus qu'au dépôt.
Aucun bouton d'export sur les écrans métier. Périodes : aujourd'hui, 7 jours, 30 jours, tout, personnalisée
(du / au) ; un filtre sans `periode` propose « Tous » + les valeurs rencontrées.

**Niveaux d'indication** (décision de Tristan, 04/10/2026) — déclarés par la séance, jamais déduits du niveau 2de / 1re :

| `indications` | Pour | Critères à l'ouverture | Retour sur l'export, au dépôt |
|---|---|---|---|
| 1 | guidage, 2de | ceux de la demande, déjà réglés | dit quel critère choisir |
| 2 | guidage 1re, premier entraînement | ceux du logiciel (`defaut`, sinon « Tous » / 7 jours) | dit ce qui cloche (lignes en trop par critère, lignes manquantes) |
| 3 | entraînement | idem | « ne correspond pas à la demande, relisez-la » |
| 4 | évaluation | idem | aucun |

**Une erreur ne se paie qu'une fois** : le dépôt est contrôlé contre l'export que l'élève a RÉELLEMENT fait (celui
de ses exports qui donne le plus de résultats justes) ; `controles(db, propres)` calcule ses `attendu` sur
`propres` (défaut : la demande). Le bon choix des lignes est un jalon à part :
`statutExport(db, idExport, idDepot)` (`attente` tant que rien n'est déposé, puis `ok` / `ko`). Sans critère,
`construireExport` rend la demande exactement : un test vérifie, séance par séance, que les bons critères
redonnent ce fichier et qu'aucune ligne de `autres` ne passe la demande. Une trame n'écrit jamais un nombre de
lignes attendu (les exports diffèrent d'un élève à l'autre).

Contrôles (`controles(db, propres)`, calculés sur la base, jamais en dur) — l'élève trie, filtre, insère des colonnes :

| `type` | Déclaration | Vérifie |
|---|---|---|
| `colonne` | `{ id, libelle, feuille, titre: 'Écart', cle: ['N° bon', 'Référence'], attendu: (ligne) => …, filtre?, formule: true, fonctions: ['IF'], tolerance? }` | colonne trouvée par son titre en ligne 1 (casse, accents, espaces ignorés) ; chaque ligne de l'export retrouvée par sa clé ; `ligne` = l'export propre en objet `{ colonne: valeur }` |
| `table` | `{ id, feuille, cle: 'Référence', colonne: 'Nb constats', attendu: { clé: valeur }, fonctions: ['COUNTIF'] }` | une valeur par clé |
| `lignes` | `{ id, feuille, attendu: 143 }` | lignes non vides, aucun doublon exact restant |
| `cellule` / liste | `{ cellule: 'E8', attendu, fonctions? }`, `{ plage, lignes }` | ceux de `classeur.js`, plus les noms de fonctions |

Fonctions : noms ANGLAIS de SheetJS (`IF`, `COUNTIF`, `VLOOKUP`…), nom entier (`IF` ≠ `COUNTIF`), affichés
en français à l'élève. Tolérance par défaut 1e-6 (`tolerance: null` = exacte). Une formule exigée (`formule`
ou `fonctions`) l'est même pour un résultat vide. Résultat : `{ id, libelle, ok, justes, total, remarques }`.

Retour au dépôt : guidage = détaillé, case par case, redépôt illimité ; entraînement = « n résultats justes
sur m » ; évaluation = « Fichier reçu. », un seul dépôt (un fichier refusé n'en est pas un). Formats :
.xlsx, .xlsm, .ods ; .csv refusé (« Ce format perd les formules… »). Le fichier n'est jamais stocké.

Pour les jalons : `resultatDepot(db, 'analyse')` → `{ depose, essais, at, controles: { [id]: résultat } }`
(le MEILLEUR dépôt ; en évaluation, l'unique) ; `exportFait(db, 'preparations')`. Une évaluation
(`copie: true`) : `noter(db)` lit `resultatDepot` ; après « Rendre ma copie », le dépôt est verrouillé.

Page d'essai : `outils/essai-tableur.html` ; tests : bloc `tableur-export` (fichiers témoins Excel et
LibreOffice dans `outils/test/fichiers/`).

## Tirage mémorisé et banques — `core/tirage.js` (chantier D-C, 09/10/2026)

Pour qu'un élève ne recopie pas son voisin, une séance de guidage ou d'entraînement (ou une évaluation nouvelle) donne à
chacun **une pièce fixe** (le fil conducteur, la même pour tous, même résultat attendu) et **des pièces tirées** dans une
**banque**, selon un **mélange de difficultés fixe** (la note reste juste d'un élève à l'autre). Un élève **confirmé**
reçoit en plus des **cas bonus**. Le tirage est **rangé** dans la base à la première ouverture et **n'est jamais refait** :
recharger, changer de poste, enrichir la banque, changer le mélange ne change rien pour un élève qui a déjà ouvert la séance.
Brief : `docs/briefs/MOTEUR-tirage-et-niveaux.md` ; séance d'essai : `contenus/tirage-essai.js` ; tests : bloc `tirage-niveaux`.

Dans le **contenu** de la séance (la fabrique le passe au moteur, option `tirage`) :

```js
import { declarerTirage } from '../core/tirage.js';
export const TIRAGE = declarerTirage({
  banques: {
    cv: {
      pieces: [                                       // JAMAIS de pièce supprimée ni renumérotée (test « banque stable »)
        { id: 'cv-yanis', titre: '…', attendu: 'retenir' },             // la pièce fixe (sans difficulté)
        { id: 'cv-07', difficulte: 'facile', … },                       // 'facile' | 'moyen' | 'difficile'
        { id: 'cv-12', difficulte: 'difficile', retiree: true, … },     // retirée : plus tirée, gardée pour qui l'a reçue
      ],
      fixes: ['cv-yanis'],                             // donnée(s) à tous
      melange: { facile: 1, moyen: 2, difficile: 1 },  // le socle
      bonus: { confirme: { moyen: 1, difficile: 1 } }, // cas en plus du confirmé (absent = pas de bonus)
      ordre: 'melange',                                // 'melange' (ordre tiré, pièce fixe à une place tirée) ou 'fixe'
    },
  },
  valeurs: (h) => ({ quantite: h.entier(6, 12), prix: h.dixieme(1.5, 3) }),   // facultatif, tiré puis rangé
  verifier: (jeu) => [],     // écarts d'équité en clair sur { pieces: { cv: [pièces] }, bonus, valeurs } ; [] = conforme
});
```

Les jalons lisent **`TIRAGE.piecesTirees(db, 'cv')`** (le socle, dans l'ordre de l'élève), **`TIRAGE.piecesBonus(db, 'cv')`**
(vide chez un standard, un accompagné, et en évaluation) et **`TIRAGE.valeursTirees(db)`**. Le moteur :
- graine = identifiant de l'élève + `|` + id de la séance (deux séances d'un même scénario ne tirent pas pareil) ;
- tire à la première ouverture, **après** avoir figé `db.aisance` et **avant** le volet, re-tire si `verifier` rend des écarts
  (`#1`, `#2`…, 40 essais), sinon donne le **secours** (premières pièces de chaque difficulté, dans l'ordre de la banque) :
  jamais d'élève sans jeu. Rangé dans `db.tirages[<id séance>] = { graine, pieces, bonus?, difficultes, valeurs?, essai,
  secours, at }` ; les valeurs sont tirées à part (un confirmé a les mêmes valeurs qu'un standard ; son socle n'est le même
  que pour la **première** banque : les cas bonus d'une banque consomment le générateur avant le socle de la suivante,
  constaté sur ENT-6.1 le 09/10/2026 — sans effet sur la note, le socle d'un confirmé reste conforme et équitable) ;
- une pièce rangée **introuvable** dans la banque : remplacée par une pièce de même difficulté (`remplacees`), la séance continue ;
- **bonus** seulement si `db.aisance === 'confirme'`, jamais en évaluation (`copie`) ; « Réinitialiser » efface le tirage avec
  le reste et le refait aussitôt (même graine, donc mêmes pièces si la banque n'a pas changé).

La fabrique **refuse** une déclaration fautive (id en double, pièce fixe absente, difficulté inconnue, plus de pièces
demandées que la banque n'en a, socle et bonus compris) et une séance qui tire des cas bonus sans
`meta.niveauxPrevus: ['confirme']`. **Une banque nouvelle s'inscrit dans `BANQUES_FIGEES`** (`outils/test/tirage-niveaux.mjs`),
sinon la suite tombe ; un id qui disparaît la fait tomber aussi (marquer `retiree: true`).

**Consigne neutre** (le niveau est caché à l'élève) : la consigne ne compte pas les pièces (« trie les CV reçus », pas
« trie les 5 CV ») et ne numérote rien qui trahirait 7 pièces au lieu de 5. C'est à la séance de l'écrire ainsi.

**Corrigé** : le fichier de corrigé exporte `corrigeEleve(base)` et peut renvoyer
`corrigeDuTirage(TIRAGE, base, { attendu: (piece, valeurs) => '…', titre, texte })` : l'onglet Corrigés propose de choisir
un élève et montre ses valeurs, ses pièces avec ce qu'attend la fiche, et ses cas bonus marqués « bonus ». Un fichier qui
n'exporte que `corrigeEleve` (sans `CORRIGE` fixe) est accepté.

Les évaluations ENT-4.4 et ENT-2.5 (`quai` / `inventaire` fonctions de la graine, `tirerJeu`) gardent leur mécanisme : ne pas
les migrer.

## Inventaire tiré par élève (évaluation)

Depuis le 04/10/2026 (Cdiscount ENT-2.5), `inventaire` peut être une **fonction de la graine** :
`inventaire: (graine) => déclaration`, comme le quai de Picard ENT-4.4. Le moteur pose la graine (`db.tirage`, l'identifiant
de l'élève) à la première ouverture, AVANT le volet — qui la lit (`graineDeBase(db)`) pour semer le jeu de l'élève. Une
séance qui ne tire que ses données (sans quai ni inventaire tirés) déclare `tirage: true`. La note garde `detail.graine`.
Le stock de départ d'un jeu tiré se pose dans `semer` (la base de départ ne connaît pas la graine). Voir
`contenus/cdiscount-compte-a-rebours.js` et son corrigé par élève `contenus/corriges/ENT-2.5.js`.

## Vue « Carte des itinéraires » (d'un point A à un point B par plusieurs modes) — `core/types/carte-itineraires.js`

Écrite le 13/10/2026 (brief `docs/briefs/MOTEUR-carte-regionale.md`, lot 2) pour Decathlon ENT-7.1 à 7.4, et pour toute carte
« d'un port à un entrepôt par la route, la barge ou le rail ». L'élève **regarde** les itinéraires, en clique un pour lire sa fiche
(trajet, distance par tronçon, terminaux, ruptures de charge, offres reçues) et zoome sur les derniers kilomètres. **Rien n'y est
noté, rien n'y est un geste de travail** ; l'itinéraire choisi est un état d'affichage, jamais rangé dans la base.

```js
carteItineraires: {
  carte: CARTE,                        // import { CARTE } from '../contenus/decathlon-carte.js' (généré)
  destination: 'rouvignies',           // une clé de CARTE.itineraires ('rouvignies' ou 'dourges')
  libelle: 'Carte des itinéraires',    // entrée de menu (défaut)
  titre, consigne,                     // en-tête de la vue (facultatifs)
  alt: "Carte d'Anvers à Rouvignies : trois itinéraires, route, barge et rail",   // texte alternatif, SANS chiffre
  offres: (mode, db) => ['Contargo'],  // noms des prestataires qui ont fait une offre pour ce mode (facultatif)
  quadrillage: false,                  // vrai : quadrillage et repères en bordure (absent par défaut)
  marques: [{                          // marques d'aléa (facultatives)
    id: 'kain', lonlat: [3.3714, 50.6284],           // way OSM 152861639 « Écluse de Kain »
    titre: 'Écluse de Kain fermée', texte: 'Arrêt de navigation du 02/02 au 05/03',
    coupe: 'barge',                    // le type de tronçon arrêté là : estompé APRÈS la marque, camion final compris
    quand: (db) => …,                  // visible seulement quand c'est vrai (après le déclencheur de l'aléa)
    legende: 'Navigation arrêtée',     // libellé de la légende (défaut : le titre)
  }],
}
```

- **La carte se fabrique au build**, jamais à la main : `node outils/carte/extraire-region.mjs` (extraction OpenStreetMap filtrée,
  dans `outils/carte/sources/region/`, ignoré par git), puis `py outils/carte/construire-region.py outils/carte/<séance>.json`. Le
  JSON déclare les lieux (avec l'objet OSM cité), les villes repères, les itinéraires (types de tronçons `route`, `barge`, `rail`,
  `camion`, points de passage, fourchettes de km), les vues « derniers kilomètres » et l'ordre du CO₂ à tenir : le build s'arrête si
  un tracé sort de sa fourchette ou si l'ordre ne tient pas. Il est reproductible octet pour octet. Format : `outils/carte/decathlon.json`.
- **Les distances viennent du module** (`CARTE.itineraires[dest][mode].km` et `.segments[i].km`) : une séance calcule son CO₂ ou
  ses délais **sur ces valeurs**, jamais sur des nombres recopiés.
- **Les traits** (variante C, choisie par Tristan le 13/10) : route = trait plein encre ; barge = tirets violets ; rail = trait ambre à
  traverses ; camion = pointillé encre. Ni vert ni rouge ; seul l'entrepôt d'arrivée est bleu. La carte est un plan papier : mêmes
  couleurs en thème clair et sombre ; la charte de l'entreprise reste au bandeau.
- **Repérage** (enseignant) : chaque itinéraire ouvert est compté dans `db.indicateurs[idSéance].carte[mode]`, comme les documents ;
  rien n'est compté chez l'enseignant ni dans une copie rendue.
- **Écran** : 1366 × 768 et 1280 × 720 sans défilement de la vue ; la légende est dans la carte ; la colonne fait 300 px.
- **Marques d'aléa** (lot 3) : dessinées **sans couleur** (rond blanc, croix à l'encre, cartouche), jamais en ambre (le rail) ni en
  rouge (« faux »). Le titre s'ajoute au texte alternatif : il ne doit **pas contenir de chiffre**. La fiche de l'itinéraire coupé
  annonce l'arrêt. Une marque mal déclarée (sans `lonlat`, hors de la carte, `coupe` inconnu) empêche la séance de se charger.
  La vue se redessine à chaque entrée de menu : une marque déclenchée apparaît à la prochaine ouverture de la carte.
- **Au zoom des derniers kilomètres**, les noms des lieux prennent des places calculées pour cette échelle (`CARTE.nomsZoom`).

## Vue « Localiser » (situer les lieux sur la carte de France) — `core/types/localiser.js`

Écrite le 15/10/2026 (brief `docs/briefs/MOTEUR-vue-localiser.md`, lots 2 et 3) pour Action ENT-8.1, puis toute entreprise (règle CAP
de Tristan : à chaque découverte d'entreprise, l'élève situe les lieux). Contours : `contenus/france-contours.js` (IGN Admin Express,
Licence Ouverte), que **la séance passe** (`contours: FRANCE`) : le moteur n'importe rien de `contenus/`. Exemple copiable :

```js
import { FRANCE } from '../contenus/france-contours.js';
import { etapesLocaliser } from '../core/types/localiser.js';
import { apresGeste, localiserFini } from '../core/declencheurs.js';

export const LOCALISER = {
  id: 'action-carte', libelle: 'Carte de France', titre: 'Où sont les lieux ?', contours: FRANCE,
  lieux: [
    { id: 'magasin', lettre: 'M', type: 'magasin', nom: 'Action Nîmes Cap Costières', role: 'Le magasin que ton entrepôt livre.',
      ville: 'Nîmes', dep: '30', region: '76', lonlat: [4.36, 43.837], osm: 'way …',
      autres: [{ ville: 'Alès', lonlat: [4.082, 44.125] }, { ville: 'Uzès', lonlat: [4.419, 44.012] }, { ville: 'Beaucaire', lonlat: [4.644, 43.808] }],
      reperes: [{ ville: 'Montpellier', lonlat: [3.877, 43.611] }], indice: 'Au sud du département…', etiq: 'g' },
    // … ; un lieu `bonus: true` (sans indice) : confirmé seulement, meta `niveauxPrevus: ['confirme']`
  ],
  flux: ['port', 'entrepot', 'magasin'],
  reseau: { libelle: 'autres entrepôts Action', sites: [{ ville: 'Moissy-Cramayel', lonlat: [2.593, 48.626] }] },
  fin: { titre: 'Le chemin de la marchandise', texte: '… (Le trajet est imaginé pour l’exercice.)' },
};
// Jalons : deux par lieu du socle (région, département), au premier essai. La séance pose poids et groupe.
export const ETAPES = etapesLocaliser(LOCALISER, 'action-se-situer').map((j) => (j.bonus ? j : Object.assign(j, { poids: 2, groupe: 'La carte' })));
// Dans creerEntreprise (ou les options de seanceEntreprise) : localiser: LOCALISER, finFige: '…'
// Une question après le département de l'entrepôt : quand: apresGeste('localiser:entrepot:departement')
// Un écran ouvert après la carte : fermetures: { fiche: { ouvertSi: localiserFini('action-carte'), message: '…' } }
```

- **Un lieu** : `id` (unique dans la séance, différent de l'id de la vue), `lettre` (pastille), `type` (`magasin` = bleu, le client ;
  `entrepot` = terre ; `port` = encre ; `usine`, `site` = encre douce), `nom`, `role`, `ville`, `dep` et `region` (codes INSEE, France
  métropolitaine), `lonlat` ([longitude, latitude], relevée dans OSM, `osm` = l'objet cité), `autres` (**exactement 3** villes réelles du
  même département), `reperes` (facultatif ; standard et confirmé ; peuvent être hors du département), `indice` (standard ; exigé hors
  bonus), `etiq` (place du nom à la fin : `h`, `b`, `g`, `d`), `bonus`. `lieux`, `flux` et `fin` peuvent être des fonctions `(db) => …`
  (le site tiré de l'élève : la graine est `graineDeBase(db)` de `core/tirage.js`, soit l'identifiant de l'élève) ; **seule la base vide
  est contrôlée** au chargement, mêmes ids pour tous : une séance à plusieurs sites appelle `controlerLocaliser` sur chacun dans son bloc
  de tests.
- **Contrôles au chargement** (la séance ne s'ouvre pas, le message nomme le lieu) : id en double (entre lieux ou avec la vue), type
  inconnu, texte vide, département absent des contours (outre-mer) ou hors de sa région, point (lieu ou `autres`) hors de son
  département (tracé détaillé, tolérance 300 m pour le bord de mer), `autres` ≠ 3, deux points du même lieu à moins de **8 km**, `flux` qui
  cite un lieu inconnu ou bonus, `localiserFini` sur une carte absente, `flux(db)` ou `fin(db)` qui plante sur une base vide, lieu bonus
  sans `meta.niveauxPrevus: ['confirme']` (pas exigé en évaluation : le lieu bonus y est ignoré).
- **Niveaux** (`db.aisance`) : accompagné = noms des régions, nom et numéro des départements, noms sur les 4 points, département dans la
  fiche ; standard = noms des régions, numéros, repères (carrés gris), indice ; confirmé = aucun nom ni numéro, repères, pas d'indice, la
  ville seule dans la fiche, plus le lieu bonus (« Lieu 1 sur 4 », jamais le mot « bonus »). Lecteur d'écran : le nom seulement si le
  niveau l'affiche (« Région 4 », « Département 76 », « Point 2 »).
- **Le geste** : une erreur → trait rouge 0,7 s et « Ce n'est pas la bonne région. Essaie encore. » ; à la 2e erreur de l'étape, la bonne
  zone (ou le bon point) entourée en pointillés terre, « Regarde la zone entourée. » ; jamais le nom de la réponse. Juste → « Bien vu ! »,
  zone en vert pâle, zoom animé (650 ms) sur l'étape suivante. Les 4 points sont dans un ordre stable par élève (graine).
- **Notation** : `etapesLocaliser(L, séance)` rend `localiser:<lieu>:region` et `localiser:<lieu>:departement`, `attente` tant que l'étape
  n'est pas trouvée, puis `ok` (du premier coup) ou `ko`. **Aucun `ecran`** (la carte ne se rejoue pas : dire pourquoi par `finFige`).
  La ville n'a pas de jalon et n'est pas au bilan. Un lieu bonus rend deux jalons `bonus: true` (`null` chez un élève qui ne l'a pas).
- **Gestes** (une fois, à la fin de l'étape, après l'animation) : `localiser:<lieu>:region|departement|ville`, et `localiser:<vue>:fin`
  (« Voir le bilan »). **Déclencheur** : `localiserFini('<vue>')` (fermetures, messages, questions).
- **État** : `db.localiser[<séance>][<vue>] = { courant: { lieu, etape }, lieux: { <lieu>: { region: { premier, essais, at }, … } }, fini }` ;
  l'étape en cours se déduit de l'état (reprise exacte après rechargement). Erreurs par lieu et par étape (ville comprise) :
  `db.indicateurs[<séance>].localiser` (repérage, sans effet sur la note). « Réinitialiser » efface la carte, pas le repérage.
- **Fin** : bilan lieu × (Région, Département) ✓ / ✗ « du premier coup », « Du premier coup : x sur 6 », texte `fin` ; sur la carte, les
  lieux à leur couleur, le réseau en ronds creux (un site déjà posé comme lieu n'est pas redessiné) et le trajet du `flux` : **fléché sur
  la France entière**, ou **encart zoomé** si les lieux du flux tiennent dans un quart de la largeur et un quart de la hauteur de la France.
- **Enseignant** : joue librement sur une copie en mémoire (rien n'est écrit), choisit le lieu et le niveau affiché. **Gel** : pendant une
  question au fil, clics et touches ne font rien. **Écran** : 1366 × 768 et 1280 × 720 sans défilement (la carte prend la hauteur qui
  reste). Corrigé : `corrigeLocaliser(L, db)` rend, par lieu, la région, le département et la ville attendus (`db` : la base de l'élève
  quand `lieux` est une fonction ; sans elle, la base vide).
- **Évaluation** (`copie: true` de la séance, accepté depuis le 16/10/2026, §7 du brief ENT-8.5) : le moteur passe `copie` à la vue, qui
  joue au **niveau standard pour tous** (quel que soit `db.aisance` ; l'enseignant aussi, sans liste des niveaux) et **ignore les lieux
  bonus**. On recommence toujours jusqu'à trouver, l'aide (zone ou point entouré) vient après deux erreurs ; la note porte sur le premier
  essai, l'aide ne rapporte rien. **Rien ne dit juste ou faux** : une erreur → « Essaie une autre région. » (puis « Regarde la zone
  entourée. »), sans trait rouge ; le bon clic → trait d'encre (`retenu`), pas de vert ni de « Bien vu ! » ; la ville trouvée → « Nîmes est
  placée sur la carte. » ; dernier lieu → bouton « Terminer la carte » ; la fin → « Carte terminée », « Tous les lieux sont placés sur la
  carte. », le texte `fin` et le trajet, **sans tableau du premier coup**. Rien au Suivi avant la remise (le moteur, comme pour toute vue) ;
  le repérage (`db.indicateurs[<séance>].localiser`) reste pour l'enseignant. Jalons : **`etapesLocaliser(L, séance, { copie: true })`**
  (aucun jalon de lieu bonus ; sans lieu bonus déclaré, l'option ne change rien). Les ✓ / ✗ par lieu se lisent dans le détail de la note
  après la remise.

## Vue « Dialogue à choix » (l'écran Téléphone) — `core/types/dialogue.js`

Écrite le 14/10/2026 (brief `docs/briefs/MOTEUR-vue-dialogue.md`, lots 1 et 2) pour Decathlon ENT-7.2 à 7.4, puis la 2de et le CAP.
L'élève **téléphone** : l'interlocuteur parle (une bulle), l'élève choisit sa réponse parmi 2 à 4 répliques. Une réponse maladroite
fait **réagir le personnage** (il ne corrige pas, il réagit), la même réplique revient et la réponse maladroite se grise : personne n'est
bloqué. Rien ne dit « juste » ou « faux » pendant l'appel ; le ✓ / ✗ arrive au bandeau de fin. Le format complet de la déclaration
est en tête de `core/types/dialogue.js` ; un exemple qui tourne : `contenus/dialogue-essai.js`.

```js
import { dialogueFini } from '../core/declencheurs.js';
import { jalonDialogue, reprises, premiereReponse, leurresAppeles, dialogueDe } from '../core/types/dialogue.js';

telephone: {
  libelle: 'Téléphone',                       // entrée du menu « Mon poste » (défaut)
  quand: (db, seance) => …,                   // facultatif : l'entrée n'apparaît qu'une fois vrai (l'enseignant la voit toujours)
  situation: 'Appelle le quai pour réserver le créneau.',   // ce que montre l'écran avant tout appel
  dialogues: [{ id: 'quai', de: 'nadia',      // `de` : une personne de `equipe` (ou de `questions.personnes`)
    contact: { nom: 'Quai de réception', detail: 'poste 214' },
    repliques: [{ id: 'accueil', dit: 'Quai de réception, Nadia, j’écoute.', choix: [
      { v: 'presente', juste: true, lib: 'Bonjour, c’est {prenom}…' },
      { v: 'salut', lib: 'Salut, c’est pour un camion.', reaction: 'Euh… bonjour. C’est qui ?' },
      { v: 'sec', lib: 'Ouais.', reaction: '… Bon.', accepte: true } ],     // réagit ET passe à la suite (compte une reprise)
      selon: (db) => ({ libs: { presente: '…' } }) }],                       // textes calculés UNE FOIS, à l'arrivée de la réplique
    fin: 'Bonne journée !' }],
  leurres: [{ id: 'thomas', nom: 'Thomas Leroy', detail: '…', message: 'Vous êtes sur la messagerie de…' }],   // contacts sans dialogue
},
etapes: [jalonDialogue({ seance: META.id, dialogue: 'quai', id: 'appel', titre: '…', groupe: 'Appel au quai', poids: 4,
  juge: (appel, db) => reprises(appel) <= 2 })],
fermetures: { planning: { ouvertSi: dialogueFini('quai'), message: 'Appelle d’abord le quai.' } },
```

- **État** : `db.dialogues[<séance>][<dialogue>] = { appels: [{ debut, fin?, ordres, textes, pas: [{ r, v, at }], reprises }], rappel? }`,
  et `db.dialogues[<séance>]['@leurres'] = [{ id, at }]` (contacts sans dialogue appelés). Rangé à chaque réplique dite : changer
  d'écran, recharger ou changer de poste retrouve l'appel à la même réplique (mêmes textes, même ordre, mêmes grisés) ; le menu
  porte « en cours ». Un seul appel à la fois. **« Réinitialiser » garde les appels** (comme les réponses aux questions au fil).
- **La réponse rangée est la clé `v`**, jamais son rang : reformuler, réordonner, ajouter un choix ne change rien pour qui a joué.
  L'`id` d'un dialogue et d'une réplique ne change jamais. L'ordre des réponses est tiré par élève (graine + dialogue + réplique +
  numéro de l'appel) et rangé.
- **Les jalons** lisent le **dernier appel terminé** (`jalonDialogue`, ou `appelRetenuDe(db, séance, id)` à la main) : rien n'est vrai
  avant le raccrochage, un appel laissé en route reste « à faire ». Lectures : `reprises(appel)` (réponses maladroites, `accepte`
  compris), `premiereReponse(appel, réplique)` (la clé du premier choix dit à cette réplique), `leurresAppeles(etat, { avant: 'quai' })`
  (contacts sans dialogue appelés avant le bon numéro ; `etat` = `db.dialogues[séance]`).
- **Contrôlé à l'ouverture** (message qui nomme le dialogue et la réplique) : ids, `de` connu, 2 à 4 choix, clés uniques, exactement
  un `juste`, une `reaction` à chaque choix non juste (guidage ; facultative en évaluation ou sur un choix qui porte `vers`), `selon`
  essayé sur une base vide ; `vers` qui vise une réplique inconnue, et **toute branche finit** (depuis chaque réplique atteignable, les
  bonnes réponses mènent au bout) ; un jalon ou une condition `dialogueFini` qui cite un dialogue absent ; un geste `dialogue:…` inconnu.
- **Correction** (`meta.correction`) : le jalon déclare `ecran: 'dialogue:<id>'` (`jalonDialogue` le pose). « Corriger » ouvre le
  Téléphone sur ce contact avec **« Rappeler »** ; un nouvel appel repart de zéro (ordre retiré, textes recalculés), le premier reste
  rangé. Un appel de plus = une correction (note moyennée par le moteur). Sans correction, un appel terminé se relit, il ne se refait pas.
- **Questions au fil** : aucune ne s'ouvre pendant un appel ; celle dont le geste arrive pendant l'appel s'ouvre au raccrochage.
- **Enseignant** : il joue l'appel sans rien écrire ; la réponse attendue est marquée. Le Repérage (suivi de classe) a une colonne
  « Appels » : appels terminés, reprises, et au survol ce que l'élève a dit (réplique : clé) appel par appel.
- **Écran** : 1366 × 768 et 1280 × 720 sans défilement pendant l'appel ; le fil défile dans sa zone. Aucun aplat vert, aucun rouge
  pendant l'appel ; interlocuteur et élève se distinguent par la place et la forme de la bulle (lisible en noir et blanc).
- **Évaluation** (`copie`, ou `mode: 'evaluation'` sur un dialogue) : aucune réaction, aucun grisé, chaque réponse fait avancer et la
  première compte ; `neutre` par choix (facultatif, ne dit jamais si c'est juste). Un seul appel, pas de « Rappeler », rien au suivi
  pendant le travail. Après la remise de la copie, rien ne s'écrit ; « Relire l'appel » reste cliquable (`data-libre`).
- **Embranchements** : `vers: '<réplique>'` sur un choix. Un choix juste part vers sa réplique ; un choix maladroit qui porte `vers`
  fait aussi avancer (« Ce n'est pas de notre faute » → « le client s'énerve »), compte une reprise, et sa `reaction` est facultative.
  La bonne réponse de la réplique d'avant doit souvent sauter la branche (`vers` vers la réplique qui suit la branche).
- **Face à face** (`telephone: { face: true }`, 17/10/2026, lot 3 du chantier « quai en deux séances », ENT-8.7) : le même dialogue se
  joue **sans un mot de téléphone**. **Ce qui change, et seulement cela** : les textes du moteur à l'écran, rangés dans une seule table
  (`LIBELLES` en tête de `core/types/dialogue.js`, un jeu « telephone », un jeu « face »).

  | Téléphone (par défaut) | Face à face |
  |---|---|
  | « 📞 Appeler » | « Aller le voir » |
  | « Raccrocher » | « Terminer » |
  | « 📞 Rappeler » (après « Corriger ») | « Revenir le voir » |
  | « Reprendre l'appel » | « Reprendre » |
  | « Relire l'appel » | « Relire » |
  | état d'un contact « Appel en cours » / « Appel terminé » | « En face à face » / « Terminé » |
  | statut en haut « En communication » / « Appel terminé à 10:42 » | « En face à face » / « Terminé à 10:42 » |
  | liste vide « Aucun numéro à appeler pour l'instant. » | « Personne à voir pour l'instant. » |
  | phrase par défaut (sans `situation`) « Choisis un numéro à appeler. » | « Choisis qui aller voir. » |
  | titre de la liste « Contacts » | « Personnes » |
  | `aria-label` « Appel : <contact> » | « Entretien : <contact> » |

  **Ce qui ne change pas** : l'état (`db.dialogues`, `appels`), les jalons (`jalonDialogue`, `premiereReponse`, `reprises`), `ecran:
  'dialogue:<id>'`, le déclencheur `dialogueFini`, **les noms des gestes** (`dialogue:<id>:appeler`, `dialogue:<id>:<réplique>`,
  `dialogue:<id>:fin`, gardés pour ne rien casser), le mélange des choix, les réactions, `accepte`, `vers`, `{prenom}`, le guidage et
  l'évaluation, le rappel de la correction. Sans `face` (ou `face: false`), **rien ne change** (Decathlon ENT-7.2 à 7.4).
  **Refusé à l'ouverture** : `face: true` avec des `leurres` non vides (« face à face : pas de leurres (messagerie vocale) » : une
  messagerie vocale et « Ça sonne… » n'ont pas de sens en face à face ; `leurres: []` passe) ; `face` qui n'est pas un booléen.
  **Pas de pictogramme de téléphone** nulle part : l'entrée du menu n'en porte pas (elle affiche seulement `telephone.libelle`, à régler :
  `libelle: 'Au quai'`). **Ce que la séance écrit elle-même** (`libelle`, `situation`, `contact.nom` et `detail`, bulles, réponses) n'est pas
  traité : n'y mettre ni « poste », ni « numéro », ni « appeler ». Le Repérage de l'enseignant (colonne « Appels », « N appels · reprises »)
  garde ses mots d'aujourd'hui (voir `core/prof.js`, hors de cette vue). Exemple (ENT-8.7, le chauffeur arrive au quai) :

  ```js
  telephone: {
    face: true,
    libelle: 'Au quai',                                   // entrée du menu (défaut « Téléphone »)
    situation: 'Un chauffeur attend à l’accueil du quai : va l’accueillir.',   // facultatif ; défaut « Choisis qui aller voir. »
    dialogues: [{ id: 'chauffeur', de: 'marc',
      contact: { nom: 'Marc — chauffeur', detail: 'camion du Havre' },
      repliques: [ /* mêmes répliques, choix, réactions que pour un appel */ ] }],
  },
  ```
  Le bouton de la liste dit « Aller le voir » ; l'élève répond, puis « Terminer ». Page d'essai : `outils/essai-dialogue.html`, réglage
  « Cas : face à face ». Tests : bloc `dialogue` (cas « Face à face : … »).
- **Contenu selon le niveau de l'élève** (lot 4, 17/10/2026, briefs ENT-8.7 §7.4 et ENT-8.8 §6 bis ; choix de Tristan : option 3). Le niveau
  est `niveauEleve(db)` (`core/tirage.js` : `db.aisance`, **toujours `'standard'` en évaluation et pour l'enseignant**). Deux réglages facultatifs,
  sans effet quand ils sont absents :
  - sur un **choix**, `niveaux: ['standard', 'confirme']` : le choix n'est **montré** qu'à ces niveaux (l'accompagné voit 2 réponses au lieu de 3 :
    les autres portent `niveaux`) ;
  - sur une **réplique**, `niveaux: ['confirme']` : la réplique n'est **jouée** qu'à ces niveaux (une question de plus au confirmé) ; aux autres,
    l'appel passe à la réplique suivante comme si elle n'existait pas.

  Le niveau d'un appel est **rangé à son début** (`appel.niveau`) : un réglage changé ensuite ne touche pas un appel commencé ; un appel d'avant
  le lot 4 (sans `niveau`) se joue au standard. Les gestes portent toutes les répliques, jouées ou non ; `premiereReponse(appel, 'hayon')` rend
  `null` chez qui ne l'a pas jouée (un jalon qui la lit doit le prévoir : jalon bonus, ou `niveauxPrevus`). **Contrôle au chargement, pour chaque
  niveau** dès qu'un `niveaux` est déclaré : 2 à 4 choix montrés et la bonne réponse présente à chaque réplique jouée, chaque `vers` vise une
  réplique jouée à ce niveau, toute branche finit ; les messages disent le niveau (« il faut 2 à 4 choix au niveau « accompagne » (1 montré) »,
  « la bonne réponse manque au niveau « standard » »). Sans `niveaux`, les messages d'aujourd'hui. `repliquesPour(D, niveau)` (exportée) rend
  les répliques jouées à un niveau avec leurs choix montrés. Règles : la consigne reste **neutre** (le niveau est caché à l'élève) ; un choix en
  moins chez l'accompagné retire une maladresse, jamais la bonne réponse. Tests : bloc `dialogue` (cas « Niveaux (lot 4) : … »).

## Nouveau courriel et fiche enregistrée — `core/types/courriel.js`, `core/types/fiche.js` (14/10/2026)

Écrits le 14/10/2026 (brief `docs/briefs/MOTEUR-courriel-planning.md`, lot 2 ; page d'essai validée par Tristan : `outils/essai-courriel.html`)
pour Decathlon ENT-7.2 (l'élève remplit un ordre de transport, l'**enregistre**, puis l'envoie **par courriel** en pièce jointe).
Un exemple qui tourne : `contenus/courriel-essai.js` (montée par le bloc de tests `courriel`).

```js
import { courrielsEnvoyes } from '../core/types/courriel.js';

documents: [{ id: 'cdc', titre: 'Cahier des charges', court: 'Cahier des charges', html: '…' }],
fiche: { id: 'ordre', libelle: 'Ordre de transport', blocs: [ … ],
  envoi: { bouton: 'Enregistrer l’ordre de transport', enregistrer: true,       // fiche ENREGISTRÉE (et non envoyée à quelqu'un)
           nomPiece: 'OT-2027-0142.pdf' /* ou (db) => 'OT-' + … + '.pdf' */,   // le nom du fichier : obligatoire avec `enregistrer`
           suite: 'Envoie-le maintenant par courriel.' } },
courriel: {
  carnet: [{ id: 'contargo', nom: 'Contargo', mail: 'reservations@contargo.exemple', role: 'prestataire' }, …],   // la liste du champ À, dans cet ordre
  pieces: ['cdc'],                       // facultatif : documents de la séance joignables (en plus des fiches enregistrées)
  objet: '',                             // facultatif : objet prérempli (vide par défaut)
  reponse: (c, db, prenom) => null | { de: 'contargo', texte: '…', objet?: '…', pieces?: ['avis'] } | [ … ],   // facultatif
},
etapes: [{ id: 'envoi', titre: '…', poids: 5,
  verifier: (db) => { const L = courrielsEnvoyes(db, META.id).filter((c) => c.a === 'contargo'); return { status: !L.length ? 'attente' : L.some((c) => c.pieces.includes('fiche:ordre')) ? 'ok' : 'ko' }; } }],
```

- **L'écran** : avec `courriel`, le bouton « Nouveau message » de la messagerie devient « Nouveau courriel » : À (liste déroulante du carnet),
  Objet, Message, Pièces jointes (bouton « Joindre un fichier », étiquettes avec une croix), « Envoyer » (`btn btn-p`). Envoi refusé sans
  destinataire (la raison sous le bouton, le travail est gardé) ; objet vide ou message vide : confirmation **dans la page** (jamais
  `window.confirm`) ; Entrée n'envoie rien. Les courriels envoyés sont dans « Envoyés » avec leurs pièces ; un objet vide s'y lit « (sans objet) ».
  **Rien n'est jugé à l'écran** : aucun texte du moteur ne dit « juste », « faux », « correct » ou « erreur ».
- **Réponse automatique** (`reponse`) : `c = { a (id du carnet), objet, corps, pieces: [ids], at }` ; `null` = pas de réponse (un contact
  sans réponse, comme le quai ou la responsable, est un contact pour lequel la fonction rend `null`). `de` : un id du carnet (nom et adresse
  repris) ou un nom libre ; objet par défaut « RE : <objet envoyé> ». Elle arrive **aussitôt** en boîte de réception (même mécanisme que les
  réponses des fournisseurs : heure de l'envoi + 1 s), jamais après la remise d'une copie. Une réponse qui plante est signalée (console), l'envoi
  reste fait. Elle peut porter des `pieces` (un document de la séance ou `fiche:<id>`).
- **Brouillon** : À, objet, message et pièces sont gardés quand l'élève change d'écran, revient ou recharge ; vidés à l'envoi. Rangés dans la
  base de l'élève, **cloisonnés par séance** : `db.courriels[<séance>] = { brouillon: { a, objet, corps, pieces }, envoyes: [{ a, objet, corps, pieces, at }] }`.
  L'enseignant écrit sur une copie en mémoire : rien n'est rangé. Copie rendue : rien ne s'envoie, ne se range ni ne se joint.
- **Gestes** (questions au fil `quand: apresGeste(…)`, déclencheurs de messages) : `courriel:envoyer` à chaque envoi et
  `courriel:envoyer:<id du carnet>`. Un autre geste `courriel:…` empêche la séance de s'ouvrir (comme les autres gestes), et un geste
  `courriel:…` cité dans une séance **sans** l'option aussi. Après l'envoi, `declencher()` comme partout.
- **Lecture pour les jalons** : `courrielsEnvoyes(db, idSeance?)` → `[{ a, objet, corps, pieces, at }]` dans l'ordre d'envoi (sans `idSeance` :
  toutes les séances de la base, par date). Le moteur ne juge rien : le jalon lit ce que l'élève a écrit et joint. Ne pas récompenser l'inaction :
  « à faire » tant qu'aucun courriel n'est parti (voir l'exemple).
- **Fiche enregistrée** (`envoi.enregistrer: true`, `envoi.nomPiece`) : la fiche ne part pas vers quelqu'un, elle est enregistrée et figée.
  Textes : bouton = `envoi.bouton` ; confirmation « Tu enregistres l'ordre de transport ? Tu ne pourras plus le modifier. » (le texte du bouton
  sans « Enregistrer » ; `envoi.confirmation` le remplace) avec « Oui, enregistrer » ; bandeau « Enregistré le … » ; bulle « Fiche enregistrée. ».
  Le geste (`fiche:<id>:envoyer`), `apresFiche(id)` et `ficheEnvoyee(db, id)` restent ceux de l'envoi : rien ne change pour les jalons. Sans
  `enregistrer`, une fiche se comporte exactement comme avant. Contrôlé à l'ouverture : `enregistrer` sans `nomPiece` (ou `nomPiece` sans
  `enregistrer`, ou une fonction qui plante sur une base vide ou rend un texte vide) empêche la séance de se charger.
- **La pièce `fiche:<id de la fiche>`** : tant que la fiche n'est pas enregistrée, elle n'est pas proposée dans « Joindre un fichier » ; ensuite
  elle l'est sous le nom `nomPiece`. Dans un courriel envoyé ou reçu (`pieces: ['fiche:ordre']`), l'ouvrir montre la fiche **figée comme un
  document** (feuille de papier, lecture seule, « Enregistré le … »), avec « ← Retour au message ». Elle n'est pas un document de la séance :
  elle n'entre ni dans `documents`, ni dans le comptage du repérage de l'enseignant. Un nom de fichier fonction de la base est lu à chaque dessin.
- **Contrôlé à l'ouverture** (message qui nomme le contact) : `carnet` non vide, `id` unique et sans espace ni « : » (il sert de geste), `nom`
  et `mail` présents, `pieces` = documents déclarés par `documents`, `reponse` fonction, clés inconnues refusées (`reponces`) ; l'option
  `courriel` est dans la table des options.
- **Écran** : 1366 × 768 et 1280 × 720 sans défilement de page, pièces jointes comprises ; variables du thème seulement (styles `.ent-courriel*` de `base.css`).

## Vue « Planning » (cartes sur une grille) — `core/types/planning.js`

Depuis le 04/10/2026 (brief `docs/briefs/MOTEUR-vue-planning.md`, maquette v8). Planifier : poser des cartes
(camions, absences, enlèvements, pauses) sur une grille **lignes = ressources × colonnes = créneaux**, voir les
conflits, replanifier après un aléa. La séance déclare `planning` dans `creerEntreprise` et `etapes:
etapesPlanning(PLANNING)` (importé de `core/types/planning.js`) ; une entrée de menu s'ajoute (libellé `libelle`).
L'état vit dans `db.plannings[<planning.id>]` (cloisonné par séance). Exemples complets, les trois cas de la
maquette : `contenus/planning-essai.js` ; page d'essai `outils/essai-planning.html` ; tests : bloc `planning`.

```js
planning: {
  id: 'smoby-quais', libelle: 'Planning des quais', titre, date,
  infos: (o) => [html…],         // o = { guidage, phase, lignes, ressources, reprise(l) } — panneau consigne
  echelle: { type: 'heures', debut: '06:00', fin: '14:00', pas: 15 }      // ou { type: 'jours', jours: [...], semaine: 5 }
  lignes: { titre, legende?, liste: [{ id, nom, note?, de?, a?, dispo?, arrivee?, finHier?, porteAffectation?, …champs du contenu }] },
  affectation: { question: 'Qui charge le camion {carte} ?', manque: 'cariste ?', lien: 'le cariste',   // facultatif
                 liste: [{ id, nom, de?, a?, dispo?, … }], nonAffectees?: (cartes) => texte, porte?: 'son camion',
                 lecture: { titre, legende, bloc: (carte, ligne) => texte } },   // grille en lecture seule
  cartes: { titre, legende?, aPlacer?, liste: [{ id, titre, court?, famille, des?, avant?, date?, conduite?, … }],
            details: (c, o) => [html…], duree: (c) => minutes (jours en échelle « jours »),
            libDuree?: 'Chargement', detailDuree?: (c) => '10 min + 33 × 2 min',     // détail : guidage seulement
            ligne?: (c) => c.qui, semaineEntiere?: true, impose?: …,                   // cas « personnel »
            pauses?: { nombre: 4, duree: 45, libelle: 'Pause 45 min' }, nonPosees?: (cartes) => texte },
  familles: { semi: { couleur: '#f0be00', nom: 'jaune', legende: 'semi-remorque' }, porteur: { couleur: '#8b5cf6', … } },
  compteurs: [{ lib: 'Présents', valeur: 'presents' | 'besoin' | 'filtre', regle: 'effectif' }],  // lignes sous la grille
  regles: [ … ], jalons: [ … ], aides: { … }, alea: { … }, note: { sur: 20 },
}
```

Heures en `'HH:MM'`, durées en **minutes** (en jours pour l'échelle « jours ») : le moteur les met en créneaux, durée
**arrondie au créneau supérieur**. Une carte reçue par les fonctions du contenu garde tous ses champs ; le moteur y
ajoute `_des`, `_avant`, `_L` (créneaux), `_dem` (jour demandé), `modifie` (champs changés par l'aléa, pour écrire
« (nouvelle heure) »), `nouveau`, `pause`.

**Conduite et service** (D-8, ENT-6.8) : une carte qui déclare `conduite` (minutes) est jugée sur elle par `cumulSansPause`,
`plafond` et le compteur de conduite du guidage, tandis que le bloc garde sa durée (le service : une tournée de 8 h 30 dont
4 h 30 de conduite). Sans `conduite`, c'est la durée du bloc qui compte.

**Ligne qui porte sa seconde ressource** (`porteAffectation: true` sur une ligne, D-8 : un transporteur vient avec son
camion) : une carte posée sur cette ligne n'ouvre pas de bulle, compte comme affectée (jalons, « sans camion »), est
ignorée des règles `sur: 'affectation'` et n'apparaît pas dans la grille en lecture seule. Une affectation choisie avant
de déplacer la carte sur cette ligne tombe. La carte et le bloc écrivent `affectation.porte` (ex. « son camion ») à la
place de la ressource. Le contenu lit la ligne d'une carte dans `db.plannings[id].v1/v2.place[carte].r`.

**Couleurs** (libres par séance, décision de Tristan du 04/10/2026, sans lien avec la charte de l'entreprise) : chaque
famille déclare `couleur: '#rrggbb'` (le trait ; le fond est la même couleur translucide), `nom` (écrit dans la légende,
facultatif) et `legende`. `teinte: 'a'` / `'b'` reste un raccourci pour le jaune / violet. Le moteur **refuse** une
couleur verte, bleue ou rouge (elles ont déjà un sens), deux familles trop proches, ou une couleur sous laquelle un texte
de la carte descend sous 4,5 de contraste en thème clair ou sombre : la séance ne se charge pas, avec la raison en clair.
Acceptées au 04/10 : jaune `#f0be00`, violet `#8b5cf6`, orange `#f08c00`, rose `#e64980`, sable `#c8a46e`, gris `#868e96`.
Pour en essayer une : les sélecteurs de couleur de `outils/essai-planning.html`.

**« Agrandir le planning »** : un bouton en tête de la vue replie le menu de l'environnement et le panneau des consignes
(« Voir les consignes » les rouvre ; le message de l'aléa reste visible). Le choix est rangé dans l'état (`agrandi`) et
retrouvé à la séance suivante ; les autres écrans gardent leur menu. Rien à déclarer.

**Créneaux déjà pris** (`occupe`, lot 3 du moteur ENT-7.2, 14/10/2026) : une ligne déclare ce qui l'occupe déjà (autres
conteneurs, autres équipes) ; l'élève cherche un créneau libre. Facultatif, **échelle « heures » seulement**.

```js
lignes: { titre: 'Quais de réception', liste: [
  { id: 'Q6', nom: 'Quai 6', occupe: [{ de: '08:00', a: '09:30', titre: 'Conteneur MSKU 441' },
                                       { de: '11:00', a: '12:30', titre: 'Conteneur CMAU 902' }] },
] },
regles: [{ id: 'quai', type: 'unAlaFois', sur: 'ligne' }],   // OBLIGATOIRE si `occupe` est déclaré : c'est elle qui juge
```

Le bloc est dessiné en **gris pointillé** (légende ajoutée toute seule), avec son `titre` ; aucun geste dessus (pas déplaçable,
pas de focus ; un clic ou un dépôt à cet endroit atteint la case dessous, où l'on peut poser une carte). Un lecteur d'écran lit
« Quai 6, déjà pris, 08:00–09:30 : Conteneur MSKU 441 ». Une carte qui le recouvre, ne serait-ce que d'un créneau, est un
problème de `unAlaFois` : « Quai 6 est déjà pris à ce moment-là. » (que, jamais de combien ; `messagePris` de la règle, texte
ou `(carte, ligne, bloc, o) => texte`, le remplace). Juste après (09:30) ou juste avant (11:00) : aucun problème. Jamais rangé
dans la base de l'élève. Heure qui ne tombe pas sur un créneau : arrondie vers l'extérieur. Refusés au chargement, avec le
planning, la ligne et le bloc nommés : `de` ≥ `a`, heure mal écrite, hors de l'échelle, `titre` vide, échelle « jours », ou
aucune règle `unAlaFois` sur la ligne.

**`depart: { ligne: '<id de ligne>', de: 'HH:MM' }`** (clé facultative d'une carte de `cartes.liste`, ENT-8.4) : la carte est **déjà posée**
à cette place à l'ouverture (dessinée sur la grille, comptée comme posée) ; l'élève la déplace comme toute carte posée. Les règles la jugent
comme les autres : laissée sur un créneau `occupe`, elle donne un jalon faux. « Réinitialiser » et « Recommencer » la ramènent à sa place de
départ ; « Corriger » repart de la pose envoyée, comme avant. Refusés au chargement, avec le planning et la carte nommés : ligne inconnue,
heure mal écrite, hors de l'échelle ou qui ne tombe pas sur un créneau, carte qui ne tient pas dans l'échelle, ligne différente de la ligne
imposée de la carte, `depart` sur une carte (ou une modification) de l'aléa. Pas d'affectation au départ (seconde ressource à choisir).

**`quand(db, idSeance)`** (même lot) : fonction facultative posée sur `planning`. Tant qu'elle rend faux, le Planning n'est pas au
menu de l'élève (l'enseignant le voit toujours) ; elle plante = fermé + signalé dans la console. Exemple : le planning du quai
n'arrive qu'après l'appel au chef de quai : `quand: dialogueFini('appel-quai')` (`core/declencheurs.js`).

**Règles** : `{ id, type, …, message }`. Le message est une fonction (ou un texte) ; celui par défaut dit **que** la
règle n'est pas respectée, jamais **de combien** — les vôtres aussi (un test relit tous les messages).

| `type` | Paramètres | Vérifie | `message(…)` |
|---|---|---|---|
| `unAlaFois` | `sur: 'ligne' \| 'affectation'` | deux blocs qui se recouvrent sur la même ressource (une pause compte sur sa ligne) | `(a, b, ressource, o)` |
| `compatible` | `sur`, `si: (carte) => bool`, `exige: (ressource, carte) => bool` | ressource qui ne convient pas | `(carte, ressource, o)` |
| `disponible` | `sur` ; la ressource porte `de`/`a`, `dispo`, `arrivee` | bloc hors de la présence de la ressource | `(carte, ressource, o)` |
| `fenetre` | — (`des`, `avant` de la carte) | début avant `des`, fin après `avant` | `{ debut(c), fin(c) }` |
| `attenteMax` | `minutes` | attente entre `des` et le début > `minutes` | `(carte, o)` |
| `dateImposee` | — (`impose`, `date` de la carte) | carte imposée posée ailleurs qu'à sa date | `(carte, o)` |
| `effectif` | `besoin: [par colonne]` | présents < besoin (présent = colonne sans carte, après l'arrivée) | `(jour, t)` |
| `auMoinsUn` | `filtre: (ligne) => bool`, `libelle` | aucun présent qui vérifie le filtre | `(jour, t)` |
| `cumulSansPause` | `max` (min) | cumul d'une ligne (sa `conduite` pour une carte qui la déclare) > max **sans carte Pause entre deux** | `(ligne, o)` |
| `plafond` | `max` (min) | somme des durées (ou des `conduite`) d'une ligne > max | `(ligne, o)` |
| `reposDepuisVeille` | `repos` (min) ; la ligne porte `finHier` | premier départ avant fin d'hier + repos | `(ligne, o)` |
| `sansNecessite` | `avec: [ids de règles]` | carte non imposée décalée alors que sa date demandée respectait les règles `avec` ; jugé quand tout est posé | `(carte, o)` |
| `critere` | `verifier({ D, I, place, o }) => [{ texte, cartes }]` | dernier recours | — |

`marque: 'ligne' | 'affectation' | 'tous'` règle où le bloc fautif se montre (grille seule, ou aussi la grille en
lecture seule et le nom de la seconde ressource). Un type inconnu ou un jalon qui cite une règle absente arrête la
séance avec la raison en clair.

**Jalons** : `[{ id, lib, regles: [ids] }]`, lus sur les versions **envoyées** (`v1` « 1er envoi », `v2` « Après
l'aléa » : 5 + 5 = 10 étapes du suivi). Un jalon est vrai si toutes les cartes sont posées (et affectées) **et**
qu'aucune de ses règles n'a de problème. Rien n'est vrai avant l'envoi ; envoyer à vide = 0. Un critère métier cite
aussi les règles sans lesquelles il serait trivial (l'attente avec la fenêtre).

**Temps** (lu dans `meta.temps` ; `copie` impose l'évaluation ; `erreur` = entraînement) : guidage = problèmes en
direct, blocs fautifs, toutes les `aides.consignes`, bande ambrée (`aides.fenetre: { invite, carte(c) }`), détail de
durée (`aides.detailDuree`), reprise et repos hachuré (`aides.reprise`), compteur de conduite
(`aides.compteurConduite`), envoi avec problèmes à confirmer ; entraînement = « Vérifier mon planning » (liste effacée
au geste suivant), aide `regles` seule ; évaluation = rien, aide `regles` seule. Les compteurs restent visibles à tous
les temps (en rouge en guidage seulement). **`aides.verifier: false`** (chantier D-3, 10/10/2026, ENT-6.3 et 6.8) : en
entraînement, ni le bouton « Vérifier mon planning » ni son invite (remplacée par « Relis les règles, puis envoie ton
planning… ») ; un seul bouton, l'envoi, avec sa confirmation dans la page. Sans l'option, rien ne change.

**Aléa** : `alea: { de, texte, cartes: { D: { des: '09:00' } }, ajoutCartes, ajoutLignes, ressources: { s2: { dispo:
'12:00' } } }`. Il arrive par la messagerie : `volet.declencheurs: [{ id: 'alea', quand: apresPlanning('smoby-quais'),
semer: (prenom) => ({ mails: [...] }), phasePlanning: 2 }]` (`apresPlanning` dans `core/declencheurs.js`, vrai dès le
1er envoi, juste ou faux). Le message s'affiche aussi en tête du panneau ; le planning de l'élève est gardé tel quel.
**`alea.retraits: { lignes: [ids], cartes: [ids] }`** (chantier D-3, 10/10/2026, ENT-6.3 : un chauffeur quitte l'entreprise) :
après l'aléa, ces lignes et ces cartes disparaissent (bac, grille, compteurs, lecture). Une carte retirée que l'élève avait
posée reste dans son planning mais la lecture l'ignore : elle ne compte ni comme posée ni comme « pas encore posée » (le
planning d'après l'aléa est complet sans elle). Un id inconnu, ou une carte gardée dont la ligne imposée est retirée,
arrête la séance au chargement (raison en clair). Ne pas déclarer de règle `disponible` pour simuler un départ.
Sans aléa : un seul envoi, puis le bilan. « Réinitialiser le planning » vide le planning **en cours**, jamais une
version envoyée.

**Évaluation** : `meta.copie: true`, `copie: meta.copie`, `export const noter = (db) => moteur.noter(db)` ; le dernier
envoi rend la copie, **sauf si le planning déclare `rendCopie: false`** (ENT-8.6, 16/10/2026 : d'autres écrans suivent le planning dans
l'évaluation) : l'envoi fige alors la version (écran « Planning envoyé », bouton « Envoyer le planning au chef », sans « et rendre ma
copie ») et l'élève rend sa copie par le bouton « Rendre ma copie » du bandeau. Toute autre valeur que `false` est refusée au
chargement ; sans l'option, rien ne change (bloc `planning`). Note = jalons réussis / jalons × `note.sur` (20 par défaut), **seulement si aucun jalon de la séance
n'a de `poids`** (page d'essai, évaluation d'un planning seul) ; dans une séance à jalons pondérés, la note reste celle des
jalons et des questions (14/10/2026). Détail jalon par jalon, clics sur
« Vérifier », heure du premier geste et des envois dans `detail.planning` (rangés, montrés nulle part).

## Vue « Plan d'entrepôt » (ranger des palettes, préparer une commande) — `core/types/entrepot.js`

Depuis le 04/10/2026 (brief `docs/briefs/MOTEUR-vue-plan-entrepot.md`, maquette v2 de `docs/briefs/plan-entrepot/`).
Cinq modes sont écrits : **`rangement`** (lots 1 et 2), **`preparation`** (lot 4), **`visite`** (second chantier), **`masse`**
(chantier D-5, avec son sous-mode comptage du chantier D-6) et **`picking`** (chantier D-7), plus bas ; le mode `comptage` du plan à
racks (lot 3 du brief) n'est pas écrit : une séance qui le déclare ne se charge pas. En rangement, l'élève prend une palette (carte du bandeau ou zone de réception du
plan), choisit une **travée** sur le plan vu de dessus (elle s'ouvre en grand, vue de face), puis un **emplacement**.
L'adresse s'écrit `A1-T03-N2-E1` (allée A côté 1, travée 03, niveau 2 — niveau 1 = sol —, emplacement 1). Emplacement
occupé : refusé tout de suite. **Aucune règle « lourd en bas » dans un rack** : seule la charge totale du niveau compte.

La séance déclare `entrepot` dans `creerEntreprise` et `etapes: etapesEntrepot(ENTREPOT)` (importé de
`core/types/entrepot.js` ; un jalon = une palette bien rangée, à composer avec les étapes propres de la séance) ;
une entrée de menu s'ajoute (libellé `libelle`). L'état vit dans `db.entrepots[<entrepot.id>]` (cloisonné par séance) :
`{ place: { P1: 'A1-T01-N1-E3', P3: 'L1' }, verifie, verifs, premierGeste, aideCharge }`. Exemple complet :
`contenus/entrepot-essai.js` ; page d'essai `outils/essai-entrepot.html` ; tests : bloc `entrepot`.

```js
entrepot: {
  id: 'smoby-rangement', libelle: 'Plan de l’entrepôt', mode: 'rangement',
  personnage: { nom: 'Bruno', role: 'chef de quai', date: 'mer. 9 déc., 17 h', texte: { guidage, entrainement, evaluation } },
  plan: {
    allees: [{ id: 'A', cotes: ['A1', 'A2'] }, { id: 'B', cotes: ['B1', 'B2'] }],   // de gauche à droite, 1 ou 2 côtés
    cotes: { A1: { gammes: ['MAT'], charge: { 1: 3000, 2: 1200, 3: 1200 }, note? }, … },  // charge max d'UN niveau
    travees: 4, niveaux: 3, emplacements: 3,                // T01 en bas, près de l'allée principale
    horsService: ['A1-T02-N2-E2', …],
    zones: { litiges: ['L1', 'L2'], bureau: 'chef de quai', quais: ['QUAI 1', …] },
    parcours: { debut: 'A', fin: 'B' },                     // dessiné (guidage, entraînement) et critère « parcours »
    rotation: { A: { lib: 'rapide', travees: [1], niveaux: [1, 2], texte: 'T01, niveau N1 ou N2' }, … },
  },
  gammes: { MAT: 'Maisons et ateliers', … },
  produits: { MAI: { nom, ref, gamme: 'MAT', court? }, … },  // court : le mot montré sur la vue de face
  stock: { 'A1-T01-N1-E1': { produit: 'MAI', kg: 420 }, … }, // FIGÉ, aucun tirage
  palettes: [{ id: 'P1', nom?, produit: 'MAI', kg: 420, rotation: 'A', contrainte: 'lourd' | 'fragile',
               reception: '1 carton écrasé', litige: true }, …],
  criteres: [{ type: 'etat' }, { type: 'litige' }, { type: 'gamme' }, { type: 'parcours' }, { type: 'rotation' },
             { type: 'niveauInterdit', si: 'fragile', niveaux: [3] }, { type: 'charge' }],   // nom?, message? pour remplacer
  regles: { titre?, lignes: [html…], encadre?: html },       // « Les règles ▾ » (guidage, entraînement)
  jalons?: [{ id, lib, palette: 'P1' }],                     // défaut : un jalon par palette
  note?: { sur: 20 },                                        // évaluation : jalons réussis / jalons × 20
}
```

- **Les bonnes réponses sont calculées par le moteur** (`bonnesReponses(ENTREPOT)`) : tous les emplacements libres du
  stock de départ sans faute. L'enseignant les voit dans la colonne de côté ; les tests les écrivent **à la main**.
- **Les critères** disent *que*, jamais *de combien* (« la charge totale du niveau dépasse son maximum »). Le critère
  `parcours` n'est jugé que si le type de produit est juste. Un message remplacé par la séance doit tenir la même règle.
- **Temps** : guidage = consigne de la palette en main (colonne de côté), bandes de rotation, parcours dessiné, après
  « Vérifier mon rangement », le **nom** du critère seul (`✗ critère : rotation`, jamais où aller) ; entraînement = parcours seul, nom du critère seul ;
  évaluation (`copie: true`) = rien de signalé, « Rendre mon travail » en deux clics, note jalons × 20 (sauf séance à jalons
  pondérés : la note reste celle des jalons, comme pour le planning).
- La vue tient dans l'écran à 1366 × 768 (le plan prend la hauteur qui reste sous le bandeau). Les textes peuvent porter
  des `[[mots cliquables]]`, sauf dans les cartes de palettes (ce sont des boutons).

### Mode `preparation` : préparer une commande au colis complet (lot 4, 04/10/2026)

**N1 = picking, N2 et au-dessus = réserve.** L'élève lit le bon (une carte par ligne dans le bandeau), ouvre la travée,
clique l'emplacement de picking : la **fiche de prélèvement** s'ouvre (cartons restants, minimum, poids du carton, cartons
dessinés), il saisit le nombre de cartons. Cliquer une palette de réserve : refusé (gardé pour le repérage, `essaisReserve`).
Picking **sous son minimum** : « ↻ Descente de la réserve », puis clic sur une palette de réserve de la même référence
(autre référence, N1, vide : refusé) ; le cariste la descend, l'emplacement de réserve se libère. La **palette de commande**
se monte dans l'ordre du prélèvement (zone d'expédition du plan, ou bouton « Palette de commande (n) ») ; deux prélèvements
de suite à la même adresse font **une seule couche**. « ↶ Reposer le dernier » ; « Terminer la préparation » → film (1 à 6
tours) et étiquettes (5 faces) → « Vérifier ma préparation » (bilan) / « Reprendre la préparation ».

Ce que la séance ajoute à la déclaration (exemple complet : `PREPARATION` dans `contenus/entrepot-essai.js`) :

```js
entrepot: {
  id: 'smoby-preparation', libelle: 'Préparer la commande', mode: 'preparation',
  personnage, gammes, stock,                                  // comme en rangement
  plan: { …, metres: { travee: 3, entreAllees: 9.4, avant: 0.9, arriere: 1.2, quai: 5.2 } },   // en mètres (§5.4 du brief)
  produits: { MAI: { nom, ref, gamme, couches: [2, 2, 2], classe: 'lourd' | 'fragile', carton: { kg: 50, parCouche: 2, h: 0.45 } }, … },
  commande: { num, client, enlevement, transporteur, heure: 'jeudi 10 décembre, 6 h 00', quai: 'QUAI 1', etiquette?: 'JDR · E1',
              hMax: 1.8, kgMax: 800, support: { h: 0.15, kg: 25 },
              lignes: [{ a: 'A1-T01-N1-E1', produit: 'MAI', q: 2 }, …],    // dans l'ordre du serpentin
              desordre: [4, 5, 3, 0, 2, 1] },                             // l'ordre remis en entraînement et en évaluation
  picking: { 'B1-T01-N1-E1': { q: 2, min: 6 }, … },          // les autres N1 : palette pleine, min = max(2, plein / 4)
  regles: { titre?, entete?, lignes, encadre? },
  jalons?: [{ type: 'lignesJustes' }, { type: 'reappro' }, { type: 'lourds' }, { type: 'fragiles' }, { type: 'poids' },
            { type: 'hauteur' }, { type: 'film' }, { type: 'etiquettes' }, { type: 'parcours', garde?: 'lignesJustes' }],
}
```

- **Classes des cartons** : `lourd` > normal > `fragile` ; « jamais une classe plus lourde sur une plus fragile », jugé en deux
  critères (`lourds` : aucun lourd prélevé après un non-lourd ; `fragiles` : rien après un fragile).
- **Jalons** : les six critères de la palette ne comptent **que si toutes les lignes sont justes** (une palette vide respecte
  « lourds en bas »). `parcours` = mètres ≤ meilleur tour, sans marge ; garde par défaut « au moins une ligne prélevée »,
  `garde: 'lignesJustes'` pour ne le compter que sur une commande complète. `reappro` : chaque ligne en rupture a eu sa
  descente de réserve (le moteur refuse une autre référence). Défaut : les 9 jalons, sans `reappro` s'il n'y a pas de rupture.
- **Les mètres** : points de prélèvement au milieu de l'allée, devant la travée ; tour = quai → points → quai. Serpentin
  (sens unique, revenir en arrière = un tour de plus) ou retour (on ressort de chaque allée par le bas). Le moteur vérifie
  la déclaration (une ligne en rupture doit être sous son minimum et avoir une réserve de la même référence, sinon la
  séance ne se charge pas).
- **Temps** : guidage = bon trié dans l'ordre du serpentin, numéros des lignes sur le plan, parcours dessiné, aide sur la
  fiche (reste à prélever, rupture expliquée), bilan ligne par ligne et règle par règle expliqué ; entraînement = bon dans
  le désordre, parcours dessiné, bilan = nom du critère ; évaluation = bon dans le désordre, **l'élève choisit serpentin ou
  retour** (verrouillé au premier prélèvement), rien de dessiné ni de signalé, « Rendre mon travail », et le jalon
  `parcours` se compare au **meilleur des deux** parcours (comme la maquette).
- Le compteur de mètres (colonne de côté) et le poids / la hauteur de la palette sont des **informations**, montrées dans
  les trois temps ; les messages de faute disent *que* (« la palette dépasse le poids maximum du transporteur (800 kg) »).
- `attendusPreparation(ENTREPOT)` (meilleurs tours, palette juste) : côté enseignant et pour les tests (valeurs à la main).

### Mode `visite` : faire visiter une plateforme (second chantier, 05/10/2026) — `core/types/entrepot-visite.js`

Brief `docs/briefs/MOTEUR-modes-visite.md`, maquette de la visite v2 (`docs/briefs/smoby/visite/`). Le moteur fournit des
**briques** ; la séance déclare ses étapes, ses photos, ses coordonnées et ses textes (rien d'une entreprise dans le moteur).
Une **file d'étapes** en haut (l'élève revient sur une étape faite, **ne saute pas en avant** ; l'enseignant navigue
librement), un **bandeau** (message du personnage avec l'heure de l'étape, consigne numérotée, « Suivant → » actif seulement
quand l'étape est finie), la **colonne de côté** et la **vue en grand** (photo ou plan, à la plus grande taille qui tient
sans défilement). Une photo du parcours, ou la travée de l'adresse, s'ouvre en onglet dans la page (« ← Retour au plan »,
Échap). Pas d'évaluation (une visite est un guidage : `copie: true` ne se charge pas).

```js
entrepot: {
  id: 'smoby-visite', libelle: 'Visite de la plateforme', mode: 'visite',
  plan, gammes, produits, stock,                      // ceux du rangement : le plan se dessine, la travée de l'adresse aussi
  zones: { reception: { note: 'vide à 8 h' }, passagePietons: { devant: 'reception' } },   // décor (facultatif)
  personnage: { nom: 'Bruno', role: 'chef de quai', date: 'mercredi 9 décembre' },
  images: { ciel: { src: './contenus/…jpg', repere: [1600, 1066], alt, mention: 'Photo d’un autre entrepôt : …' }, … },
  etapes: [{ id, type, titre, heure: '8:05', texte (message du personnage), aide, consigne, … }, …],
  fin?: { heure, texte, consigne, image?, grandTitre? },
  premierEssai?: true,                                // la note au premier essai (voir plus bas)
}
```

Le **repère** d'une image est celui des coordonnées ; il a la proportion du fichier (≤ 1 %, vérifié par un test et à
l'affichage). Les photos sont **dans le dépôt** (`contenus/<entreprise>/…`), jamais dans `docs/`. Les types d'étape :

| `type` | Ce que la séance déclare | Finie quand | Jalons |
|---|---|---|---|
| `accueil` | `image`, `surTitre`, `grandTitre`, `intro`, `programme: [html]`, `encadre` | d'emblée | — |
| `photoPoints` | `image`, `effet: 'zoom'` (drone) ou `'bulle'` (étiquette), `rayon`, `points: [{ n, x, y, mot, def, zoom?: { cx, cy, s }, cx?, cy? }]`, `consigne` (`{n}`), `consigneTous`, `consigneFini`, `puis?` (des questions sur la même photo, lancées **par leur bouton** `bouton`, jamais automatiquement) | tous les points ouverts (et les questions de `puis`) | ceux de `puis` |
| `photoQuestions` | `image`, `questions: [{ id, q? \| mot?, zones: [[x0, y0, x1, y1]…], aide?, jalon? }]`, `consigne` (`{q}`, `{mot}`), `juste`, `faux` (`{aide}`, `{mot}`), `encadre` | toutes réussies | un par question |
| `parcours` | `etapes: [{ n, ancre, decalage?, titre, images: [clé…], dir (°, 0 = est, 90 = sud), cone, texte }]`, `debut`, `ordreMsg` (`{n}`), `ordre: false` pour libérer l'ordre | toutes ouvertes | — |
| `associer` | `parcours` (id de l'étape parcours : ses numéros, ses ancres), `photos: [{ id, image, n, jalon? }]` (dans l'ordre montré), `consigne`, `consigneFini`, `juste` (`{n}`, `{titre}`), `faux` (`{n}`) — plan à gauche (numéros seuls), une photo à droite ; juste = photo suivante ; `deuxBlocs: true` (ENT-8.2, CAP, 16/10/2026) : pas de colonne « Les photos », la photo à gauche avec la réponse dessous, le plan à droite, plus large | toutes associées | une par photo |
| `delimiter` | `image`, `coins: { hg, hd, bg, bd }`, `tolerance`, `noms?`, `messages: { juste, faux ({coins}) }`, `correction: { legendes: [{ texte, x, y, rot?, plein? }] }`, `jalon?`, `puis?: { type: 'zones', x: [x0, x1], marge, cibles: [{ nom, y0, y1, x? }], pieges: [{ y0, y1, x?, message }], horsEtendue, horsCible, dejaTrouve, juste ({nom}), jalon? }` | coins justes (et toutes les cibles) | coins ; cibles |
| `adresse` | `code`, `sens` (4), `choix` (ordre des listes), `consigne`, `rappel`, `encadre`, `consigneTravee` / `consigneEmplacement` (`{code}`), `trouve` (`{adresse} {produit} {kg}`, lus dans le stock), `jalons?: { decomposer, retrouver }` | décomposée et retrouvée | décomposer ; retrouver |
| `fin` | `texte`, `consigne`, `image?`, `grandTitre?` | d'emblée | — |

- **Ancres du parcours** (jamais de pixels) : `quai:<nom du quai>`, `zone:reception`, `zone:litiges`, `zone:bureau`,
  `zone:vestiaire`, `zone:controle`, `allee:principale`, `allee:<id>`. La trace se calcule (on descend à l'allée principale, on la longe,
  on remonte). Une zone n'est une ancre que si le plan la déclare dans `zones` (`litiges: ['L1', …]`, `bureau: 'chef de quai'`, et depuis le
  15/10/2026 `vestiaire` et `controle` : `true`, un texte (la note) ou `{ nom?, note? }` ; noms par défaut « Vestiaire » et « Zone de contrôle »,
  dessinés sous le bureau, 4 travées au moins pour les quatre zones) ; une ancre inconnue empêche la visite de se charger. Une visite se
  charge **sans** `stock`, `produits` ni `gammes` (pas d'étape `adresse`).
- **Geste de fin** (15/10/2026) : la visite publie `entrepot:<id>:visite:fin` une fois, quand l'élève atteint l'étape `fin` (jamais pour
  l'enseignant ni après la remise). Usage : `quand: apresGeste('entrepot:action-reception:visite:fin')` dans `volet.declencheurs`, ou dans
  une question au fil. Le rangement garde ses gestes `entrepot:<id>:poser` et `:verifier`.
- **Jalons** : chacun rend `'attente'` tant que l'élève n'a rien tenté, puis `'ok'` / `'ko'` (`etapesEntrepot` le passe au
  suivi : le repérage en tire « du premier coup »). **Un clic faux ne fait pas perdre le jalon** : l'élève recommence.
  L'adresse se décompose en **une seule** validation (la correction reste affichée). Un re-clic sur une cible déjà trouvée
  n'est pas compté faux. La découverte (points, parcours) ne donne pas de jalon : l'inaction fait 0.
- **`premierEssai: true`** (07/10/2026, lot 3 de SMOBY-notation-5.3-5.8 ; ENT-5.3) : l'élève recommence toujours jusqu'à
  trouver, mais chaque case est notée à son **premier essai**, figé. Une case reste « à faire » tant que l'élève ne l'a pas
  finie, puis rend juste (du premier coup) ou faux (après une erreur) : la séance est finie à la fin de la visite. Les cases
  s'affinent : la travée a **un jalon par coin** (`<id>-hg`, `-hd`, `-bg`, `-bd`, jugés à la 1re vérification), les cibles sont
  justes si toutes trouvées **sans clic faux**, l'adresse a **un jalon par partie** (`<id>-partie1` à `4`) et l'emplacement
  est juste s'il est trouvé en `clicsMax` clics au plus (sur l'étape `adresse`, 1 par défaut). Le moteur des entreprises
  en tire tout seul : la suite s'ouvre à la fin (comme `suiteAuBilan`), bandeau de fin par blocs (`groupe` des jalons) en
  ✓ « du premier coup » / ✗ « après une erreur », **sans** « Corriger ». Poids et `groupe` se posent sur les jalons rendus
  par `etapesEntrepot` (exemple : `contenus/smoby-ent53.js`).
- **Rien d'attendu n'est montré** avant la réponse : zones, coins, bandes, emplacement cherché (marqué en vert une fois trouvé).
- **Couleurs** : `--pe-visite` (violet, trace, étapes, cônes) ; sur les photos, repères fixes quel que soit le thème (`--pv-*`).
- L'état : `db.entrepots[<id>]` = `{ courante, atteinte, x: { <id d'étape>: … } }`. Exemple complet : `contenus/smoby-ent53.js`
  (aussi le cas « visite » de la page d'essai, **sans** `premierEssai` : la page et le bloc `entrepot` gardent le mode
  d'origine) ; tests : bloc `entrepot` (fin du fichier), et bloc `smoby` pour le premier essai.

### Mode `masse` : ranger en stockage de masse, en 3D (chantier D-5, 11/10/2026) — `core/types/entrepot-masse.js`

Des palettes posées **au sol et gerbées**, dans des **couloirs** qu'un chariot frontal remplit et vide **par l'allée**
(ENT-6.5 §7.1 ; maquette validée `docs/briefs/france-boissons/maquette-6.5-stockage-masse.html`). Rien du plan à racks n'y
sert. Le dessin est celui du kit iso (`core/iso.js`), le même que l'animation du FIFO : panneaux des couloirs au mur du fond,
flèches ENTRÉE / SORTIE au sol, palettes de rétention à 8 fûts. Format complet en tête du fichier ; exemple :
`contenus/entrepot-masse-essai.js` (les données d'ENT-6.5) ; page d'essai `outils/essai-entrepot.html`, cas « Stockage de
masse » ; tests : bloc `entrepot` (« Masse : … »).

```js
entrepot: {
  id: 'fb-masse', libelle: 'Zone de masse', mode: 'masse',
  personnage: { nom, role, date, texte: { guidage, entrainement, evaluation } },
  consigne: 'Prends une palette (clique sa carte), puis clique un couloir sur le plan.',
  plan: { couloirs: [{ id: 'M01', places: 4 }, …, { id: 'M08', places: 4, reserve: 'vides' }],
          reception: 'Zone de réception', litiges: { titre: 'Zone litiges', futs: 1 }, quais: ['QUAI 10', …] },
  references: { HEI30: { nom: 'Heineken fût 30 L', court: 'Heineken 30 L', format: '30 L' }, VIDES: { nom, court: 'VIDES', vides: true } },
  hauteurs: { '30 L': 2, '20 L': 3 }, portee: 4,
  lots: { S20: { couleur: 'jaune' }, S24: { couleur: 'bleu' } },
  stock: { M01: [[{ ref: 'HEI30', lot: 'S20' }, { ref: 'HEI30', lot: 'S20' }]] },   // piles du FOND vers l'avant, du bas vers le haut
  palettes: [{ id: 'P1', ref: 'HEI30', lot: 'S24', futs: 8, kg: 350, reception: 'conforme' }, …],
  criteres: [{ type: 'zoneReservee', nom: 'couloir VIDES' }, { type: 'uneReference' }, { type: 'unSeulLot' },
             { type: 'hauteurGerbage' }, { type: 'parLeFond' }],
  regles: { lignes: [ … ] }, note: { sur: 20 },
}
```

- **Une place** se dit « couloir M02, position 1, niveau 1 » : **position 1 = le fond** (contre le mur), la dernière = devant
  (côté allée) ; niveau 1 = au sol. Le niveau n'est pas rangé : il se déduit de l'**ordre de pose**.
- **Gestes** : prendre une palette (sa carte, ou la palette en zone de réception), cliquer un couloir sur le plan (il s'ouvre
  en grand, en 3D), cliquer une **boîte verte** (les seules places possibles) ; « ← Retour au plan » ou Échap. **Le moteur
  empêche** ce que le chariot ne peut pas faire : poser derrière une pile, poser sur une pile déjà à `portee` niveaux,
  reprendre une palette qui n'est pas au sommet ou devant laquelle il y a une pile (« Impossible de la reprendre : une autre
  palette la bloque. »). **Tout le reste est accepté**, et jugé à la validation.
- **« Valider mon rangement »** (actif quand tout est posé, avec confirmation) **fige** le rangement. Rien n'est jugé avant.
  Après (guidage, entraînement) : dans chaque carte, « ✓ bien rangée » ou « ✗ critère : … » (le **nom** seulement, jamais la
  place). Évaluation : « Rendre mon travail » rend la copie, aucun bilan, pas de « Les règles ».
- **Critères** (les cinq types ; la séance choisit et peut renommer par `nom`), jugés contre **ce qui était dans le couloir
  quand l'élève a posé la palette** (stock de départ et ses palettes posées avant elle : c'est le geste qui casse la règle
  qui est faux) : `zoneReservee` (couloir réservé aux vides : il passe en premier et arrête les autres), `uneReference`,
  `unSeulLot`, `hauteurGerbage` (par `format`), `parLeFond` (une position derrière est vide).
- **Jalons** : un par palette par défaut (`palette-P1`…), « à faire » avant la validation, puis juste ou faux (`etat: 'ko'`) ;
  `etapesEntrepot(P)` les rend, la séance y pose ses poids. **Pour une fiche qui suit** (ENT-6.5, jalons 7 à 10) :
  `placeMasse(db, P, 'P1')` → `{ couloir, position, niveau }` (ou `null`), la place où l'élève l'a **lui-même** posée
  (pas de double peine) ; `fautesMasse(P, etat, 'P1')` → les noms des critères faux ; `bonnesReponses(P)` → toutes les
  bonnes places sur le stock de départ (enseignant, tests ; jamais montrées à l'élève).
- **Attention, ce que le moteur accepte** : une palette posée seule dans un couloir **vide** respecte toutes les règles. En
  ENT-6.5, P2 et P4 sont donc justes aussi en M02 ou M06 (il ne reste alors qu'un couloir vide pour P1 et P3), comme le dit
  la remarque du brief ; la colonne « Bonne(s) place(s) » du brief ne les cite pas.
- **Dessin** : vue d'ensemble (couloirs de gauche à droite, réception et litiges à droite, allée et quais devant), étiquette
  du lot au sommet de chaque pile (« lot S20 », « P1 · S24 » pour une palette de l'élève, cerclée de vert ; « VIDES » en gris),
  écartées vers le haut avec un trait quand deux se recouvriraient ; palettes qui apparaissent au chargement, palette posée qui
  **tombe** (rien de tout cela en mouvement réduit). Tient en 1366 × 768 et 1280 × 720 sans défiler (testé).
- **État** : `db.entrepots[<id>]` = `{ pos: { P1: { c: 'M02', p: 1 } }, ordre: ['P1', …], valide, at, premierGeste, verifs }`.
  Gestes publiés : `entrepot:<id>:poser`, `entrepot:<id>:verifier` (la validation).

### Mode `picking` : l'allée de picking en 3D, guidée par le terminal vocal (chantier D-7, lots 3 et 4, 12/10/2026) — `core/types/entrepot-picking.js`

Une **allée de picking** (deux côtés, A au fond, B devant en transparence, T01 près de la zone de préparation et du quai),
des **tiroirs coulissants** en N1, N2-N3 vides, et le **terminal vocal** à droite qui donne les lignes une à une (ENT-6.7 §7.2 ;
maquette validée `docs/briefs/france-boissons/maquette-6.7-preparation-vocale.html`). Mode à part plutôt qu'option du mode
préparation (décision de Tristan, 12/10/2026). Dessins du kit iso (lot 2), terminal de préparation (lot 1). Format complet en
tête du fichier ; exemple : `contenus/entrepot-picking-essai.js` (les données d'ENT-6.7) ; page d'essai
`outils/essai-entrepot.html`, cas « Allée de picking » (avec les palettes : `PICKING_PALETTES`) ; tests : bloc `entrepot`
(« Picking : … », « Montage : … »).

```js
entrepot: {
  id: 'fb-picking', libelle: 'Allée de picking', mode: 'picking',
  personnage: { nom, role, date, texte: { guidage, entrainement } },
  consigne: 'Écoute (ou lis) le terminal, va à l’emplacement, réponds.', annonce: 'Ce matin, le picking a été réapprovisionné …',
  plan: { travees: 4, zone: 'Zone de préparation', quai: 'QUAI 14' },
  references: { AFF20: { nom: 'Affligem Blonde 20 L', court: 'Affligem', voix: 'Affligem Blonde, vingt litres', type: 'fut', litres: 20, bande: 'cuivre' },
                EAU1L: { nom: 'Eau minérale 1 L', voix: 'Eau minérale, casier de douze bouteilles', type: 'casier', capsule: 'bleu' }, … },
  emplacements: { 'A-T03': { ref: 'AFF20', lot: 'S18', n: 2, abimes: 1, code: '49' }, 'B-T04': { ref: 'HEI20', n: 0, code: '62' }, … },
  terminal: { titre: 'Préparation', lignes: [{ emplacement: 'A-T01', prends: 3 },
    { emplacement: 'A-T03', prends: 2, attendu: { mot: 'abime', n: 1 }, remplacement: { emplacement: 'B-T03' } }, …],
    fin: 'Commande terminée : …', phraseBilan: 'Chaque réponse au terminal est enregistrée …' },
  regles: { lignes: [ … ] },
  montage: { palettes: 2, etiquette: 'La Cabane à Malo — Villers-sur-Mer · …', reflexion: 'Le terminal t’a donné …' },  // lot 4, facultatif
}
```
- **Jamais `note` dans une séance** (piège trouvé à la construction d'ENT-6.7, 12/10/2026) : déclarée, `note` fait noter TOUTE la
  séance par la vue seule (jalons de la vue ÷ leur nombre × 20, sans les poids ni les questions), comme une évaluation. Le contenu
  d'essai (`contenus/entrepot-picking-essai.js`) la porte pour sa page d'essai seulement. Même règle pour les autres modes.

- **Tous** les emplacements des deux côtés se déclarent (`A-T01` à `B-T0n`) ; `n: 0` = tiroir vide ; `abimes` : les fûts
  cabossés, les plus en avant. Teintes par **nom** (celles du kit). Une déclaration fausse ne se charge pas (message clair).
- **Gestes** : survol d'une travée (ou de son adresse au sol) = son volume en vert translucide ; clic = le préparateur y va et
  la **vue de près** s'ouvre (tiroir, marchandise, **étiquette de lisse** : adresse, désignation, lot, **code en gros**) ;
  « ← Retour à l'allée » ou Échap. **Le code ne se lit que de près** (testé : ni dans l'allée, ni dans un texte d'aide).
- **Le terminal** dit « Côté A, travée 03, niveau 1. Code de contrôle ? » puis « <voix>, lot S18. Prends 2. » ; mots par
  défaut Manquant, Abîmé, Emplacement vide ; toute exception sur une ligne qui déclare `remplacement` ajoute cette ligne.
  À la fin : « Ce que le terminal sait de toi » (non noté) et la `phraseBilan`.
- **Jalons** (brief ENT-6.7 §5, 1 à 5) : un par ligne, plus un pour le remplacement d'une ligne qui a un `attendu`. Jugés à la
  fin du terminal seulement (avant : « à faire » ; l'inaction ne rapporte rien). Sans `attendu` : la quantité prise sans
  exception ; avec : ce mot et cette quantité, puis le reste ; remplacement : présent et `attendu.n` pris. Noms par défaut
  « Ligne n : <court> » (jamais la réponse), ou `jalon: '…'` sur la ligne. Codes faux : trace, jamais notés.
- **Le montage** (chantier D-7, lot 4, 12/10/2026), si `montage` est déclaré : après chaque quantité acceptée, le terminal
  dit « Pose tes fûts. » et attend ; sous lui, « Où poses-tu les 2 fûts Pelforth Blonde 20 L ? » → Palette 1 · Palette 2 ·
  « À côté, je le pose après » (une ligne = une destination). Commande terminée : les objets « à côté » se posent (clic sur
  l'objet, puis sur une palette), film (tours) et étiquettes (5 côtés) **par palette**, « ↶ Reposer le dernier » (décision de
  Tristan du 12/10), puis « Vérifier ma préparation » (inactif tant que quelque chose est à côté) → le bilan, et « Pour
  réfléchir » si `reflexion` est déclaré. Une ligne ne déclare jamais `pose` (refusée) : c'est le montage qui la donne.
  **Règle de pose** (construite, brief) : 6 cases par palette ; première case vide ; sinon un fût va sur un casier (la faute à
  voir), un casier sur un fût ; à défaut sur le même type ; la case la plus basse. Le tiroir donne ses fûts de devant d'abord :
  un fût cabossé pris sans rien dire part sur la palette (il se voit) ; signalé « Abîmé », il reste au tiroir.
  **Jalons 6 à 10**, à la suite des lignes : aucun fût sur un casier ; `futsMax` (6) fûts au plus par palette ; film (`film`,
  3 à 5 tours) et étiquettes (deux côtés opposés + dessus) sur chaque palette **utilisée** ; toutes les palettes utilisées.
  Jugés à « Vérifier » seulement (un changement efface la vérification), et **faux, affichés « non jugé »**, tant qu'une ligne
  est fausse ou qu'un objet reste à côté (aucun jalon par inaction). Noms : ceux de la maquette, ou `montage.jalons`.
- **Exemple livré** : ENT-6.7 (`contenus/france-boissons-ent67-donnees.js`, jalons rangés bloc par bloc dans
  `contenus/france-boissons-ent67.js`). Sans « Corriger » (les lignes ne se refont pas) : `suiteAuBilan: true` dans le `meta`, sinon
  l'élève qui a raté une ligne attend pour toujours la séance suivante. Les gestes `ligne:<…>` et `verifier` portent des questions au fil.
- **Brancher la séance** (comme ENT-6.6 avec la masse) : `entrepot: ENTREPOT` dans les options, et les jalons de la vue
  repris avec leurs poids : `etapesEntrepot(ENTREPOT).map((e) => ({ ...e, groupe: …, poids: POIDS[e.id] }))`. Les `id` sont
  stables : `ligne-<id>` par ligne (l'`id` de la ligne, sinon son emplacement : `ligne-A-T01`), `ligne-<id du remplacement>`
  pour la ligne de remplacement attendue (`ligne-B-T03`), puis `montage-casier`, `montage-futs`, `montage-film`,
  `montage-etiquettes`, `montage-palettes`. `bonnesReponses(ENTREPOT)` (de `entrepot.js`) donne ce que le terminal attend ligne à ligne
  (corrigé, tests ; jamais montré à l'élève). Note : `noteEntrepot` met dans `detail` les jalons (`pris`, `exception`), les
  codes faux, les emplacements vus, l'heure du premier geste et, avec un montage, les objets par palette, ceux restés à côté et
  le nombre de « Vérifier ». Le son du terminal se règle par groupe dans « Conduite de séance » (voir « Le terminal vocal »).
- **Pas encore** : l'évaluation (`copie` : la vue refuse de s'ouvrir, « le mode picking n'a pas encore d'évaluation »).
- **État** : `db.entrepots[<id>]` = `{ terminal, vus: { 'A-T03': date }, premierGeste }`, plus avec un montage
  `{ palettes: [[{ ref, emp, ligne, abime? }], …] (ordre de pose), cote, film: ['4', …], etiq: [{ avant: true, … }, …], verifie,
  verifs, reflexion }`. Gestes publiés : `entrepot:<id>:ouvrir:<emplacement>`, `entrepot:<id>:ligne:<ligne>` (une ligne finie,
  donc posée), `entrepot:<id>:fin`, et `entrepot:<id>:verifier`.

### Le terminal vocal (chantiers D-6 et D-7) — `core/types/terminal.js`

Un boîtier sombre qui **dit une phrase à la fois** et attend une réponse tapée (« Valider », « Répète »). Il n'est pas une
vue qu'une séance déclare : ce sont les modes `masse` avec `comptage` (inventaire d'ENT-6.6) et `picking` (préparation
d'ENT-6.7) qui l'ouvrent et lui **rédigent ses lignes** depuis le plan. Format complet en tête du fichier ; page d'essai
`outils/essai-terminal.html` (les lignes d'ENT-6.7, bouton « J'ai posé » à la place de l'allée) ; tests : bloc `entrepot`.

- **Le dialogue d'une ligne** : « <lieu> Code de contrôle ? » → le code lu sur place (faux : « Code faux. … », redemandé,
  compté, jamais noté) → la question → un nombre → « Compris : n. » → la ligne suivante. Ordre imposé, pas de retour sur une
  ligne validée ; une case vide ne fait rien (0 est une réponse). Le terminal **ne juge rien** : il range les réponses, les
  jalons de la vue les comparent au vrai.
- **En préparation** (`prends` sur la ligne) : la quantité doit être **exactement** ce qui reste (moins → « Tu dois prendre
  n. Si tu ne peux pas, dis … », plus → « Trop. Prends n. », refusés en rouge) ; un **mot d'exception** par ligne, pendant la
  question (Manquant et Abîmé demandent « combien ? », Emplacement vide signale toute la ligne) ; toute exception sur une
  ligne qui a un remplacement **ajoute** cette ligne juste après ; `pose` : le terminal attend que la marchandise soit
  posée avant la ligne suivante. Le terminal accepte la bonne quantité quoi que l'élève ait pris : il ne voit pas le fût
  cabossé (c'est le piège d'ENT-6.7).
- **« Ce que le terminal sait de toi »** à la fin (non noté) : lignes, durée, codes faux, lignes par heure (« — » sous une
  minute), puis la phrase de la séance (`phraseBilan`).
- **Couleurs** : neutres ; un refus est en texte rouge ; aucun vert.
- **Le son** : coupé par défaut ; l'enseignant l'active **par groupe** dans « Conduite de séance » (case « Son activé pour le
  groupe ») ; l'élève peut le couper pour lui, jamais l'activer. Voix de synthèse **installées sur le poste** (français
  seulement, aucune requête réseau) ; sans voix française, le terminal reste muet et le texte suffit (il est toujours
  affiché). À essayer avec un casque avant la séance.

## Vue « animation à questions » (scène isométrique, arrêt, question) — `core/types/animation.js`

Depuis le 05/10/2026 (brief `docs/briefs/MOTEUR-vue-animation.md`, maquette d'ENT-6.5). Montrer **un geste
du métier dont la conséquence se voit** (une palette coincée au fond d'un couloir…), **s'arrêter**, poser une
question à choix, corriger, enchaîner. L'animation vient **avant** la décision : la séance place cet écran
**avant** l'écran de travail dans son déroulé (le moteur ne verrouille rien). Exemple complet : la maquette
reproduite, `contenus/animation-essai.js` ; page d'essai `outils/essai-animation.html` (Simulog ou hors Simulog,
élève ou enseignant) ; tests : bloc `animation`.

**Dans une séance Simulog** : `animation: A` (ou `animations: [A, B]`, rare) dans `creerEntreprise`, et
`etapes: [...etapesAnimation(A), ...]` (importé de `core/types/animation.js`). Une entrée « Mon poste » s'ajoute
(libellé `libelle`) ; une tuile d'accueil si la séance la demande (`accueil: { kpis: ['animation', 'mail'] }`).
**Hors Simulog** (activité Prepalog sans scénario) : `const anim = creerAnimation(A);`
`export const rendre = (h, c) => anim.rendre(h, c); export const noter = (db) => anim.noter(db);`, avec
`meta.bareme` = nombre de questions (une question = un point, ramené sur 20). Sans question : pas de `bareme`.

```js
{
  id: 'fb-fifo',                 // clé de l'état dans la base de l'élève, JAMAIS modifiée
  libelle: 'Comprendre le FIFO', // entrée du menu
  vitesse: 0.8,                  // facultatif (1) : attentes et déplacements divisés par elle
  alt: 'Animation : …',          // texte de remplacement de la scène
  scene: {
    decor: [                     // dessiné une fois, dans l'ordre déclaré (coordonnées : ici seulement)
      { type: 'sol', de: [x, y], a: [x, y] },
      { type: 'mur', y, de, a, hauteur },                    // y = face avant du mur
      { type: 'allee', de: [x, y], a: [x, y] },              // le sol plus clair de l'allée
      { type: 'couloirMasse', id: 'M01', x, y?: 0, profondeur: 3, panneau?: 'M01', fleches?: true },
      { type: 'reperesProfondeur', couloir: 'M02' },         // « fond / milieu / devant » au sol, à droite
      { type: 'texteSol', texte, en: [x, y], style?: 'allee', rotation? },
    ],
    lots: { S20: { couleur: 'jaune' } },   // couleurs du kit : jaune, bleu, gris, ambre, violet
    acteurs: { chariot: { type: 'chariotFrontal' } },
  },
  parties: [{
    titre: 'Partie 1 sur 2 — l’erreur',
    depart: { palettes: [{ id: 'a', lot: 'S20', place: 'M01.fond', futs?: 4, etiquette?, ton? }] },
    pas: [ … ],                  // voir ci-dessous
    question: { id: 'q1', titre, enonce, choix: [...], juste: 1, explication, suite?: '▶ Voir la bonne façon' },
  }],                            // une partie sans question : un bouton « Suite ▶ » ; la dernière : « Tout revoir »
  aRetenir: 'HTML court (<b>, <u>)',
}
```

- **Places nommées** : un couloir de masse de profondeur n a les places `M01.1` (fond) à `M01.n` (devant), et pour
  n = 3 `M01.fond`, `M01.milieu`, `M01.devant` (n = 2 : `fond`, `devant`). Un geste vise une **place**, jamais des
  coordonnées.
- **Pas** (fermés) : `{ legende: 'html' }` (numérotée toute seule sur toutes les parties ; les points de progression
  sont comptés), `{ attendre: ms }`, `{ nouvelle: 'a', lot, futs? }` (charge invisible), `{ placer: 'a', place }`,
  `{ geste: 'poser' | 'reprendre', acteur: 'chariot', objet: 'a', place }`, `{ etiquette: 'a', texte, ton? }`
  (`neutre`, `ok`, `alerte`), `{ alerte: ['a'] }` / `{ finAlerte: [...] }` (pastille « ! »),
  `{ bulle: 'nom', lignes: [...], vers: place | objet | [x, y, z], hauteur?, decalage: [dx, dy], ton?, fleche?: false }`,
  `{ effacer: ['nom'] }`.
- **Contrôlé au chargement** (la séance ne s'ouvre pas, message clair) : pas inconnu, type de décor ou d'acteur
  inconnu, place inexistante ou déjà prise, objet pas encore créé, charge reprise qui n'est posée nulle part, bulle
  effacée qui n'existe pas, lot sans couleur du kit, `juste` hors des choix, question en double.
- **État** : `db.animations[<id>]` = `{ reponses: { q1: { premiere, juste, quand } }, ordres: { q1: [2,0,3,1] },
  partie }`. `premiere` = rang **dans l'ordre déclaré** du premier choix validé, écrit une fois (« Répondre de
  nouveau » et « Tout revoir » n'y touchent pas) ; `ordres` = ordre d'affichage tiré par élève (graine = son
  identifiant) et rangé ; `partie` = la plus loin qu'il peut ouvrir (0 = la première ; pas de saut en avant).
- **Jalons** : `etapesAnimation(A)` = un jalon par question (« Question 1 de l'animation : première réponse
  juste ») ; non répondue = « à faire », jamais une erreur ; au bilan, non répondue = non franchie.
  `reponseAnimation(db, A, 'q1')` → `{ repondu, premiereJuste }` pour composer un jalon propre.
- **Enseignant** : navigue librement (Partie 1 · Question 1 · …), voit la bonne réponse marquée, rien n'est écrit.
- **Mouvement réduit** : déplacements instantanés, les attentes et les bulles restent. Quitter l'écran arrête tout.
- **Charte** : l'interface (légende, commandes, question, bulles) ne prend que les variables du thème ; la scène est
  une image (fond clair en sombre aussi). Signalétique au sol (panneaux verts, flèches ENTRÉE / SORTIE) : exception
  notée dans `docs/decisions.md`.

### Écrans de présentation : le matériel du poste, un mot expliqué (chantier D-5, 11/10/2026)

`ecrans: [{ titre, image?: { src, alt, mention? }, blocs: ['html', …] }]` dans la déclaration d'une animation : avant la
partie 1, des écrans **non notés** — un dessin à gauche, **trois blocs au plus** (règle d'écriture de 2de), « ◀ Précédent » /
« Suivant ▶ » ; le dernier dit « Voir l'animation ▶ ». Une animation **sans `parties` ni `scene`** n'est faite que d'écrans :
c'est un écran du menu (« Le matériel »), sans jalon. `ecransVus` est rangé quand l'élève a vu le dernier : il revient
ensuite droit à l'animation, et le lien `libelleEcrans` (« Revoir le mot FIFO ») y ramène. L'image vient du site
(`./contenus/…`) : une adresse d'un autre domaine, un écran sans `titre`, plus de trois blocs ou une image sans `alt`
empêchent la séance de se charger. Exemple : `ECRANS_MATERIEL` et `ECRAN_FIFO` de `contenus/animation-essai.js` (textes du
brief ENT-6.5 §4) ; page d'essai `outils/essai-animation.html`, « avec les écrans du matériel et du mot FIFO ».

### Le kit de dessin isométrique — `core/iso.js`

**Jamais de code de dessin dans `contenus/`.** Le kit contient : projection (`projection()`, unité = une place de
palette), `face`, `boite`, cadrage automatique sur le décor ; décor (sol, mur, allée, couloir de masse et ses places,
panneau, flèches et textes au sol, repères de profondeur ; `zone` au sol et `quai` depuis D-5) ; charge `retention`
(palette de rétention noire, **8 fûts en quinconce** depuis le 11/10/2026 — décision 52 —, `futs` de 0 à 8, étiquette de lot ou
`texte`, texte au sol, pastille « ! », `fuite`) ; palettes **gerbées** (`z` en multiples de `HAUT_NIVEAU`) ; acteur
`chariotFrontal` (gestes `poser`, `reprendre`, cariste en silhouette sans visage). Il sert aussi au mode « stockage de
masse » du Plan d'entrepôt (ci-dessus). `core/iso.js` porte aussi les objets du **quai iso** (façade, camion porteur, cabine, cale, butoirs,
niveleur, lampe, bac de rétention à huit fûts, `boiteEcran` pour les zones de clic) : ils sont décrits dans « Le quai iso » ;
`dessinerChariotFrontal` y sert aussi, à l'échelle du quai (options `chargeSvg`, `coupe`, `gilet`).
Depuis le chantier D-7 (lot 2, 12/10/2026), la section « l'allée de picking » (unité : le mètre) : `futDebout` (20 L ou
30 L, 39,5 cm de diamètre, bande de marque, `abime` = cabossé, marqué `data-iso-avarie`), `casier` (12 bouteilles d'un
litre, plein ou `vide`), `traveePicking` (tiroir coulissant en N1, N2-N3 vides, côté A ou B, `voile`, et l'**étiquette de
lisse** avec le code, dessinée seulement si la vue la demande), `volumeTravee` (la zone de survol et de clic),
`paletteClient` (1,20 × 0,80, 6 cases, piles, `film` en tours, `etiquettes` par côté, `attrsCase`) ; `personne` prend
`casque` et `terminal`. Teintes **par nom** (`TEINTES_FUT` : or, bleu, rouge, cuivre, gris ; `TEINTES_CAPSULE` : bleu,
jaune, rouge, gris), **sans vert** ; un nom inconnu est refusé. Page d'essai `outils/essai-kit-iso.html` ; tests : bloc
`animation`.

**Un objet qui manque** (camion, transpalette, rack, quai…) : l'écrire dans la section 7 du brief de la séance
(« objets à ajouter au kit » : ce qu'on doit voir, les gestes, une image de référence) ; un chantier moteur l'ajoute à
`core/iso.js` (type dans `TYPES_DECOR`, `TYPES_CHARGE` ou `TYPES_ACTEUR`, gestes dans `GESTES`), avec ses textes
contrôlés (contraste ≥ 4,5, test du bloc `animation`).

## Questions au fil et points d'étape — `core/types/questions.js` (08/10/2026)

Les questions de la trame passent **à l'écran, au moment du geste**, posées par un collègue (décisions de Tristan du
07/10/2026, brief `docs/briefs/MOTEUR-questions-au-fil.md`). La séance les déclare dans **un fichier à part**,
`contenus/questions/<séance>.js` (format en tête de `core/types/questions.js` ; modèle : `contenus/questions/ESSAI.js`),
et les branche en une ligne : `creerEntreprise({ …, questions: QUESTIONS })` (avec `equipe: EQUIPE` si les personnes
viennent de l'univers). Le moteur ajoute **lui-même** un jalon par question notée (`question:<id>`, groupe = son
`groupe`, poids = `part × poids / somme des poids`) : la séance ne les recopie pas dans `etapes`, mais la somme des
poids de ses jalons + `part` doit valoir 20 (contrôlé à l'ouverture).

- **Au fil** (`type: 'fil'`, `quand(db)`) : un panneau s'ouvre à droite au geste ; l'élève peut regarder (menu, stock,
  messages, documents), pas toucher à son travail tant qu'il n'a pas répondu (gel, par le moteur, toutes vues
  comprises). Une seule à la fois. **Rattrapage** : si le geste n'a jamais lieu, elle arrive par `rattrapage(db)` ou,
  au plus tard, quand tous les autres jalons sont jugés.
- **Transition** (`type: 'transition'`) : citée par un **point d'étape** (`etapes: [{ id, de, apres(db), ferme,
  titre, situation, continuer, questions: [1 à 3 ids] }]`), un écran qui arrive après un envoi et garde fermé
  `ferme` (`'ecran:<écran>'`, ou `'repondre:<clé>'` : le bouton « Répondre » du mail qui porte `cle: '<clé>'`) jusqu'aux
  réponses, justes ou fausses.
- **Retour** : notée → ✓ / ✗ et le `retour` du collègue tout de suite ; `apres: 'bilan'` → « Merci, je note », le ✓ / ✗
  au bandeau de fin et le `retour` avec lui (pour une question posée avant un envoi qu'elle corrigerait d'avance) ;
  `reflexion: true` → non notée, « Ce qu'en pense … » (avec `apres: 'bilan'` en plus, 10/10/2026 : « Merci, je note » à l'écran, et ce que
  pense le collègue arrive avec le bandeau de fin, « pour réfléchir » ; pour une réflexion dont le retour soufflerait un jalon) ; en évaluation (`copie`) → « Merci, je note » pour toutes.
- **Texte calculé sur le travail de l'élève** (12/10/2026, pour ENT-6.8) : une question au fil ou de transition peut porter
  `selon: (db) => ({ enonce, libs?: { <clé>: texte }, retour? })` (« Ton planning fait partir Sébastien à 09:00… »). Calculé **une fois, à
  l'arrivée** de la question, et rangé avec elle (`texte`) : il ne bouge plus si l'élève change son travail ensuite (panneau, point
  d'étape, retour au bilan). Mêmes clés et même `juste` pour tous : seule la bonne réponse **calculée** doit porter la clé `juste`.
  `enonce` et `choix` restent déclarés : c'est ce que voient l'enseignant et « Conduite de séance ». Contrôlé au chargement sur une
  **base vide** (ne pas planter, rendre un `enonce`, pas deux choix identiques) ; refusé sur une question d'ouverture (elle a `variante`).
  Un `selon` qui plante sur le travail d'un élève laisse le texte déclaré (signalé en console).
- La **première réponse** compte, rangée en **clé** (`v`) dans `db.questions[<séance>]`. « Corriger » ne rouvre jamais
  une question ; « Réinitialiser » n'efface pas les réponses. Les sorties de page pendant une question sont comptées
  et montrées à l'enseignant (Repérage), sans effet sur la note.
- Déclencheurs : **un geste de travail** (envoyer, choisir, saisir, poser), juste ou faux ; jamais l'ouverture d'un
  écran ou d'un document, jamais un clic de menu, jamais une minuterie (règle du 03/10, Q4).
- **Les gestes des vues** (lot 3, 08/10/2026) : `quand: apresGeste('<nom>')` (`core/declencheurs.js`), pour une question
  **comme pour un message déclenché**. Le geste est rangé une fois, avec son heure, dans `db.gestes[<séance>]` ; juste ou
  faux, peu importe. Les noms, publiés par chaque vue (`signaux`) :

  | Vue | Gestes |
  |---|---|
  | fiche `<id>` | `fiche:<id>:<bloc>` (choisir, cocher, remettre en ordre ; une saisie à la sortie de la case), `fiche:<id>:<bloc>:<ligne>` (classer une ligne d'un tableau oui / non), `fiche:<id>:envoyer` |
  | planning `<id>` | `planning:<id>:poser` (poser, déplacer, retirer une carte), `planning:<id>:envoyer` |
  | tournée (`tournee.id`, défaut `tournee`) | `tournee:<id>:envoyer` (le report validé — juste ou faux, pas refusé —, « J'ai terminé » confirmé, ou « Enregistrer » en copie), `tournee:<id>:reporter` (un arrêt laissé à quai ; publié seulement si le quai existe, pas avec `quai: false`) ; MOTEUR-chep lot A, 18/10/2026 |
  | quai `<id>` | `quai:<id>:decharger`, `quai:<id>:valider` (une palette), `quai:<id>:cloturer` ; si le quai déclare `arret: 'dechargement'` (17/10/2026), en plus `quai:<id>:dechargement` (la dernière palette est posée, **une fois**, quel que soit le chemin) ; s'il déclare `depose` (17/10/2026, « La dépose dirigée par l'élève »), en plus `quai:<id>:depose` (la première palette posée par l'élève, **une fois**) ; en inspection sur la scène (`securite.mode: 'scene'`, D-4) en plus `scene:<id>:signaler` (chaque envoi de marques), `scene:<id>:decharger` (le figeage « C'est bon », pas l'arrêt par le collègue) |
  | plan d'entrepôt `<id>` | `entrepot:<id>:poser` (poser une palette), `entrepot:<id>:verifier` |
  | animation `<id>` | `animation:<id>:<question>` (la première réponse) |
  | téléphone, dialogue `<id>` | `dialogue:<id>:appeler` (le premier appel), `dialogue:<id>:<réplique>` (la première réponse à cette réplique, juste ou non, au premier appel), `dialogue:<id>:fin` (raccroché un appel fini) ; contact sans dialogue `<id>` : `dialogue:<id>:appeler` (chaque appel) |
  | messagerie (toutes les séances) | `messagerie:transfert` (transférer un message, n'importe lequel ; chantier D-1) ; `messagerie:transfert:<clé du message>` (transférer CE message, 10/10/2026, publié **en plus** du précédent) |
  | messagerie, réponse par phrases | `messagerie:phrase:<ligne>` (le premier choix d'une phrase sur cette ligne, juste ou faux ; ENT-6.2, 10/10/2026) ; la ligne doit exister dans un mail semé par le volet **ou par un déclencheur** (chantier D-3, 10/10/2026 : chaque `declencheurs[].semer` est essayé une fois sur une base vide au chargement ; un déclencheur qui ne se sème pas sans base ne publie rien), sinon la séance ne s'ouvre pas ; une ligne imposée (`texte`) n'est pas un geste |

  `messagerie:transfert:<clé>` : la clé est connue si le message est semé par le volet avec un `transfert`, ou si le volet la déclare dans
  **`volet.transferables: ['msg-malo', …]`** (messages qui arrivent plus tard, par un déclencheur) ; une autre clé empêche la séance de s'ouvrir.
  Un nom qu'aucune vue de la séance ne publie (faute de frappe, vue absente) **empêche la séance de s'ouvrir**, avec la
  liste des gestes connus. `tous(…)` garde les gestes de ses conditions. Une vue nouvelle **naît avec ses gestes**
  (`api.signal('<vue>:<id>:<geste>')` juste avant sa sauvegarde, et la liste `signaux` dans ce qu'elle rend).
- Tout est contrôlé au chargement (id ou clé en double, `juste` inconnu, `de` inconnu, question de transition non
  citée, 2 à 4 choix, `part` manquante…) : la séance ne s'ouvre pas et le message nomme la question. Le bloc de
  tests `questions` charge **tous** les fichiers `contenus/questions/*.js`.
- **Dans le `meta` de la séance : `questions: 'ENT-6.2'`** (le nom du fichier dans `contenus/questions/`, sans `.js`) :
  c'est ce qui donne les textes des questions aux **réponses de la classe** (« Conduite de séance », lot 4) ; sans lui,
  l'enseignant n'y voit que les identifiants.
- Essai : `outils/essai-questions.html` (élève, enseignant, évaluation).

### L'écran « Avant de commencer » (10/10/2026, brief `docs/briefs/MOTEUR-avant-de-commencer.md`, lot 1)

Toute séance de scénario nouvelle commence par cet écran (pas les anciennes : une séance sans `ouverture` s'ouvre comme avant).
Dans le fichier de questions : un bloc `ouverture` et des questions `type: 'ouverture'` (voir l'en-tête de `core/types/questions.js`).
- `ouverture: { id, de, titre, situation, continuer, documents: [...], questions: [...] }` ; `documents` mêle des ids de
  `documents` de la séance et des **visuels** `{ id, court, titre, type: 'images', images: [{ src, alt, legende, credit }] }`
  (images du dépôt, jamais d'un autre domaine, crédit affiché sous l'image, ligne dans `CREDITS.md`).
- Question d'ouverture : `{ id, type: 'ouverture', de, doc, enonce, choix, juste, retour, aide? }`. `doc` = ce que le bloc de gauche
  montre ; `aide` (facultative) se replie, ses `[[mots]]` sont cliquables, « Voir le document » ramène à `doc`.
- **Elle ne compte pas dans la note** (ni `groupe`, ni `poids`, ni jalon ; le moteur le refuse) et rien à l'écran ne le dit.
  Corrigée à l'écran (✓ / ✗ + retour), réponse rangée comme les autres (`db.questions[séance][id]`, plus `@ouverture` = heure d'arrivée).
- Imposée à l'élève (menu fermé, cadenas) tant qu'il n'a pas répondu à tout ; **jamais** à l'enseignant, après la remise, ni à un
  élève dont la séance a déjà commencé (fiche envoyée ou message envoyé). « Continuer » mène à l'Accueil, qui reste tel quel.
- **La calculette du site** (10/10/2026) : `ouverture.calculette: true` (booléen, refusé sinon) la monte sur l'écran quand il est affiché (élève et
  enseignant), le bouton à l'encre (jamais l'accent de la charte) ; elle est démontée dès qu'on en sort. Absente tant que le contenu ne la déclare pas.
  À déclarer quand une question à valeurs tirées demande un calcul (France Boissons ENT-6.1, 6.2…). En évaluation (`part`), même règle.
- **Évaluation** (lot 2) : `ouverture.part: 4` (⇔ séance `copie: true`) rend l'écran noté ; aucune `aide` ni `[[mot]]` ; « Je ne sais pas »
  ajouté en dernier ; juste +1, NSP 0, fausse −1 ÷ mauvaises réponses, plancher 0 ; « Réponse enregistrée. » sans correction.
- **Tirage par élève** (lot 3) : `ouverture.tirage: { preparation: 2, droit: 2 }` ; les questions citées sont la **banque**, chacune porte
  `rubrique` ; chaque rubrique en compte **au moins le double** de ce qu'on tire (sinon la séance est refusée). Le tirage (ids dans
  un ordre tiré) est rangé à la première ouverture dans `db.questions[séance]['@tirage']` et jamais refait ; l'enseignant le lit dans
  `detail.ouverture.tirees` ; sans tirage rangé (enseignant), toute la banque est montrée. Une question peut porter
  `variante: (hasard) => ({ enonce, libs: { <clé de choix>: texte }, retour? })` : mêmes clés et même `juste` pour tous, seuls
  les textes changent (bonne réponse et pièges **calculés** dans la fonction, jamais ceux d'un jalon de la séance).
  Reprise des questions `cle: true` des séances de travail en évaluation : pas faite (à écrire dans le fichier de l'évaluation).

### Modifier les questions d'une séance (une demande de Tristan = ce fichier seul, en Sonnet)

| Ce que Tristan veut faire | Ce qu'il faut changer dans `contenus/questions/<séance>.js` | Ce qui arrive aux élèves |
|---|---|---|
| Reformuler une question ou un choix | le texte (`enonce`, `lib`, `retour`) | rien : la réponse rangée est la clé `v` |
| Changer l'ordre des choix | l'ordre dans `choix` | rien (l'ordre affiché est de toute façon tiré par élève, sauf `melanger: false`) |
| Ajouter un choix | une ligne `{ v, lib }` (2 à 4 choix) | rien |
| Changer la bonne réponse | `juste` (une clé) | ceux qui ont fini gardent leur note ; ceux en cours sont jugés sur la nouvelle |
| Ajouter une question notée | un bloc dans `liste` (citée par un point d'étape si c'est une transition), un `id` NEUF | la `part` se partage : la note reste sur 20 ; un élève en cours la reçoit (geste à venir, ou rattrapage) |
| Retirer une question | supprimer son bloc (et sa citation) | sa réponse reste rangée, plus lue ; la `part` se répartit sur les autres |
| Mettre de côté sans effacer | `actif: false` | comme retirer, le texte reste pour plus tard |
| Changer le poids des questions | `part` (et les `poids` des jalons de la séance : total 20) | contrôlé à l'ouverture |
| Une question compte double | `poids: 2` sur elle | dans la `part` |
| Passer de « au fil » à « transition » | `type` (+ la citer dans un point d'étape, retirer `quand`) | sa réponse rangée est gardée |

**L'`id` d'une question ne change jamais** (c'est sa clé dans la base). **Pas de numéro** dans les textes (« Question 1
sur 2 » est calculé). Après toute modification : `node outils/test.mjs questions`.

### Écrire les questions (règles du brief, §7)

- **2 à 4 questions par séance** ; une question porte sur ce que l'élève **vient de faire** ; une seule à la fois ;
  2 à 4 choix, **au moins 3** pour une question notée (pas réussie au hasard une fois sur deux) ; le retour **montre la
  conséquence** dans l'entreprise (« une erreur sur ton bon, c'est une erreur dans le camion »), sans faire la leçon.
- **Contre le copier-coller vers un autre onglet** (Tristan, 08/10/2026) : (1) une question **ancrée sur le travail de
  l'élève** (« pourquoi as-tu refusé **ta** palette P3 ? »), de préférence sur une pièce tirée ; (2) répondre **en
  montrant** plutôt qu'en tapant (le texte libre seulement pour la réflexion non notée) ; (3) une question d'éco-droit
  **s'applique au cas de l'élève**, le texte de référence fourni dans la séance (source vérifiée, Légifrance), les choix
  tous exacts en général, un seul s'appliquant au cas. Une question de culture pure reste non notée.

## Écrire les textes : tu ou vous (règle de Tristan, 06/10/2026)

- **La voix du site** (consignes, aides, légendes, invites, messages juste / faux, détails des jalons, accueil) :
  **tu**. Impératif sans *s* aux verbes en -er : « clique », « glisse », « pose », « reprends », « renvoie-le-moi ».
- **Les collègues de l'élève** le tutoient ; l'élève leur répond au **tu poli**.
- **Les personnes extérieures** (chauffeur d'un autre transporteur, client, l'entreprise vue par son
  transporteur) : **vous**, dans les deux sens. Un message adressé à **un service** reste au vous (pluriel).
- Les **phrases pièges** gardent leur registre familier (fausses par le ton).
- Lexique et glossaire : tournure **neutre** ; `meta.desc` : à l'**infinitif**.
- L'**espace enseignant** reste au vous ; les trames élève suivent les mêmes règles que l'écran.

## Pièges

- **`note: { sur: 20 }` d'un `planning` ou d'un `entrepot`** (piège trouvé en ENT-7.2, **corrigé le 14/10/2026**) : dans une séance dont un jalon déclare un `poids`, cette note (déclarée, ou implicite en `copie`) **ne remplace plus** celle des jalons et des questions ; son détail reste rangé (`detail.planning`, `detail.entrepot`). Elle ne sert qu'aux séances sans poids (pages d'essai, évaluation d'un planning seul). Inutile donc de la déclarer dans une séance ENT. Un cas du bloc `planning` le retient (inaction = 5 sur 20 avec un jalon hors planning de 5 points, et non 0).
- **Un `planning` est une déclaration fixe** : ses cartes, ses lignes et ses créneaux pris (`occupe`) ne se calculent pas sur la base de l'élève (pas de « fonction de la base »). Pour une séance tirée par élève, le titre d'une carte ne peut pas porter le numéro de l'élève (ENT-7.2 : « Ton conteneur »), et un cas « bonus du confirmé » ne peut pas changer le planning. Le bouton d'envoi dit toujours « Envoyer le planning au chef ».
- **Un module `core/types/entreprise-*.js` n'importe jamais `entreprise.js`** (import circulaire : `entreprise.js` les importe). Il
  reçoit ce dont il a besoin par son nom (jamais `ctx` ni `U` ; un écran de données reçoit en plus la base `db` et l'état d'écran `E` de l'élève, et ne touche que ses clés) ; `entreprise.js` ré-exporte ce que d'autres fichiers
  lui importaient (`OPTIONS`, `eur`, `fdate`, `fdt`, `norm`, `normLoc`). Chantier 9, lot 9c, 08/10/2026 : le plan et les
  autres modules sont dans `docs/briefs/MOTEUR-entreprise-decoupage.md`.
- **Où est quoi dans `core/types/entreprise-*.js`** (lot 9c livré le 09/10/2026 ; `entreprise.js` garde les options lues, la note, le menu et
  le bandeau, `aller` / `dessinerVue`, les cartes des messages, les questions au fil, la copie rendue et l'accueil). Écrans de données, un
  fichier chacun : `-messagerie` (boîte, mail ouvert, pièces jointes, nouveau message, réponses libre et par phrases), `-console` (les 19
  commandes), `-commandes` (liste, fiche, bon de préparation), `-receptions` (liste, fiche, bon de livraison), `-stock`, `-catalogue`
  (avec la fiche produit), `-tiers` (clients, fournisseurs), `-blocage`. Le reste : `-base` (stock, mouvements, lots), `-options` (la table
  `OPTIONS`), `-theme` (charte), `-outils` (formats, aides « articles »), `-fin` (bandeau de fin). Un besoin de la France Boissons sur un de
  ces écrans (par exemple « Transférer à… » dans la messagerie) se fait dans son fichier, en chantier moteur à part.
- Une séance en cours d'écriture reste en `pret: false` et peut être commitée à tout moment.
  Elle compte quand même dans le tableau des compétences.
- Une séance X.2 qui partage la base d'une X.1 met `reinitialisable: false` et **cloisonne**
  par séance tout état nouveau qu'elle range dans la base de l'élève.
- Un score est enregistré **par séance** (`id`), jamais par `jeuId`.
- Ne pas copier Spartoo (`ENT-1.x`, point de comparaison) ni le module SCE (ancien) : le
  modèle est Boost (`ENT-3.x`).
- Ce que le jalon dit doit être vérifié **avant** que l'élève commence, et ne doit pas
  récompenser l'inaction. Un chiffre caché à l'élève ne doit pas être déductible ailleurs.
- **Une séance qui refuse de se charger** (erreur de syntaxe, option inconnue, `id` de vue en double…) est **écartée du registre** :
  les élèves ne voient rien (ni carte ni message), l'enseignant lit un avis rouge en haut de l'accueil (fichier + message du
  moteur), et `console.error` le répète. Le reste du site marche (chantier 9a bis, 08/10/2026).
- **La suite de tests tombe** dans ce cas (`activitesEnEchec()` doit être vide) : un brouillon `pret: false` commité avec une
  faute n'abîme pas le site, mais il ne passe pas inaperçu. Les scores déjà enregistrés sur la séance écartée restent
  en base, ignorés du suivi (rien à cliquer) ; supprimer un élève efface quand même ses classements dans cette séance.
- Pour la voir : mettre une faute (`menuu:` pour `menu:`) dans un fichier de séance en local, sans commit, ouvrir le site
  en enseignant, puis annuler la faute.
- Avant d'ajouter la séance : `node outils/test.mjs`, et un bloc de test dans `outils/test/`
  pour une entreprise nouvelle (une ligne dans `BLOCS` de `outils/test.mjs`).

### Réglages ajoutés le 06/10/2026 (refonte d'ENT-1.1), à passer à `creerEntreprise`

- `fermetures: { <écran>: { ouvertSi: (db) => booléen, message } }` : l'entrée du menu reste grisée avec le message tant que la
  condition est fausse, pour l'élève seulement (ENT-1.1 : le quai, tant que le questionnaire n'est pas envoyé).
- Une réception semée peut porter `annoncee: true` (visible, non saisissable), `colisVisibles: false` (pas de tableau des colis),
  `colisLibelle` (colonne « Colis » de la liste) et `consigneQuai` (l'encadré qui remplace le tableau).
- Quai : `rendu: 'iso'` (quai sans froid, un camion ; voir l'en-tête de `core/types/quai.js` et « Le quai iso » plus haut : inspection sur
  la scène, palettes de fûts, plusieurs palettes, cariste, `arret` / `commence` / `document`, dépose dirigée `depose`), et sur le camion `commande`, `lot`, `expedie` (date ou jours par rapport à
  aujourd'hui) pour l'en-tête du BL ; `parCarton` sur les `refs` (la colonne s'intitule « Par » suivi de l'unité du quai).
- Fiche : un bloc `choix` peut porter `colonne: true` (réponses longues l'une sous l'autre). Tout envoi définitif (fiche, phrases,
  planning, bon de réception) passe par une confirmation dans la page : un test qui clique « Envoyer » doit ensuite cliquer
  `[data-confirme-oui]`.
