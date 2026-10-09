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
`seanceEntreprise`) est dans **`OPTIONS`**, dans `core/types/entreprise-options.js` : 44 options, une ligne chacune. Le tableau
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
| `fermetures` | objet | `{ écran: { ouvertSi(db), message } }` : l'entrée du menu reste visible, grisée avec le message, tant que `ouvertSi(db)` est faux (élève seulement). | `activites/spartoo-reception.js` |
| `stockOuvert` | booléen | L'écran Stock s'ouvre sans le code de l'enseignant (Smoby). Sans l'option, il reste verrouillé (Spartoo : il pousse vers la console `.getstock`). | `activites/smoby-visite.js` |
| `receptionLitige` | booléen | Ajoute « En litige (zone litiges) » aux décisions du bon de réception ; la ligne n'entre pas en stock. | `activites/smoby-rangement.js` |
| `couleurs` | objet | `{ code: [nom, teinte] }` : noms et teintes des couleurs des variantes (pastilles du catalogue, colonne Couleur). Sans table, pas de pastille. **Facultative**, exportée par l'univers. | `contenus/spartoo.js` |
| `livraisons` | objet | `{ code: [libellé, prix du port] }` : modes de livraison des commandes (`ship`). Code inconnu : le code tel quel, port de 0. **Facultative**, exportée par l'univers. | `contenus/spartoo.js`, `contenus/cdiscount.js` |
| `lexique` | objet | Mots cliquables `{ MOT: définition }` : `[[MOT]]` ou `[[mot|affiché]]` dans les textes du contenu. | `activites/smoby-visite.js` |
| `transportSection` | texte | Nom du groupe de menu qui porte plan et tournée (« Transport » par défaut). | `activites/boost-ent32.js` |
| `transportId` | texte | Clé de `db.transport` partagée entre deux séances (sinon l'`id` de la séance). | `activites/boost-ent32.js` |
| `plan` | objet | Plan schématique, ou carte réelle avec `plan.carte`. | `activites/boost-ent32.js` |
| `tournee` | objet | La tournée à construire sur le plan. | `activites/boost-ent32.js` |
| `quai` | objet ou fonction | Quai de réception (voir « Vue quai ») ; une **fonction de la graine** = un quai tiré par élève. | `activites/picard-ent42.js` ; tiré : `activites/picard-ent44.js` |
| `planning` | objet | Planning : cartes sur une grille (voir « Vue Planning »). | `activites/smoby-arrivee.js` |
| `entrepot` | objet | Plan d'entrepôt : rangement, préparation, visite (voir « Vue Plan d'entrepôt »). | `activites/smoby-rangement.js` |
| `inventaire` | objet ou fonction | Inventaire ; une **fonction de la graine** = un inventaire tiré par élève. | `activites/cdiscount-inventaire.js` ; tiré : `activites/cdiscount-compte-a-rebours.js` |
| `tableur` | objet | Geste tableur : extractions, exporter, déposer (voir « Geste tableur »). | `activites/cdiscount-chiffres.js` |
| `documents` | tableau | Documents joints lus sans saisie `[{ id, titre, court, html }]` ; un mail les joint par `pieces`. | `activites/smoby-recrutement.js` |
| `documentsStyle` | texte | Mise en page CSS des documents joints (règles imbriquées sous `.ent-doc`). | `activites/smoby-recrutement.js` |
| `fiche` | objet | Une fiche à remplir. | `activites/smoby-arrivee.js` |
| `fiches` | tableau | Plusieurs fiches à remplir (la première garde l'écran `fiche`, les autres `fiche:<id>`). | `activites/smoby-lettre-voiture.js` |
| `animation` | objet | Une animation à questions. | essais seulement (aucune séance ne la passe encore) |
| `animations` | tableau | Plusieurs animations (rare). | essais seulement |
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
libelle, titre, sousTitre, documents: [ids], bouton, blocs: […], envoi: { bouton, a, suite } } })` ajoute une
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
`cadre`) ; tests : bloc `france-boissons`.
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
(`FICHE_QUI`, `DOC_ORGANIGRAMME_ELEVE`, jalons du courrier) ; tests : bloc `france-boissons`.

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
dans l'onglet « Niveaux » ; voir « Tirage mémorisé et banques » plus bas).

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
ticket, ni sonde, ni temps hors froid, fiche de contrôle à trois cases), `motifs: ['avarie', 'manquant']` (motifs proposés),
`zone: { nom }` (étape ④), `dechargement: { par: 'cariste', nom }` (chariot élévateur) et `securite: { scene, points: [{ id,
lib, ok }], signaler: { bouton, reponse }, arret, photo, alt }` (étape ⓪ « Avant de décharger », jalons `securiteSignalee` et
`securiteConstat` en tête). Un seul camion. **Décor fixe** (04/10/2026, ENT-5.4) : `photos.decor: 'fixe'` pour une photo
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

**Second motif** (quai, ENT-4.4) : `deuxMotifs: true` dans la déclaration propose un second menu « motif » sur
CHAQUE palette (pour ne pas désigner celle qui a deux problèmes) ; la palette déclare `motif2Attendu`. Décision juste
= mêmes motifs (dans n'importe quel ordre) ; réserve juste = une valeur juste pour chacun (« deux constats, deux
quantités »).

**Les autres clés de `creerEntreprise`** (`exercice`, `trame`, `sansTrame`, `THEME`, `reponsesFournisseur`, `transportId`…) sont dans la table « Les options de `creerEntreprise` » plus haut.

`creerEntreprise` est dans `core/types/entreprise.js`. Les autres moteurs sont dans
`core/types/` (`qcm`, `ordre`, `assoc`, `numerique`, `tableur`, `tableau`, `tournee`, …).

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
| `domaines` | `['D2', 'D4']` | Domaines D1 à D5 de la 2de. **Déclaré, pas encore lu** : en attente de l'écran cœur / complément (décision 14 de la finalité). Gardé exprès (décision de Tristan, 09/10/2026). |
| `coeur` | `true` / `false` | `true` : séance du **cœur** (parcours minimal qui couvre les compétences du niveau) ; `false` : **complément**. Absent = pas encore rangée. **Déclaré, pas encore lu** : en attente de l'écran cœur / complément (décision 14 de la finalité) ; gardé exprès sur les huit séances qui le portent (décision de Tristan, option A, 09/10/2026). Le nom `parcours`, proposé dans les fiches, est déjà pris (parcours strict, plus bas). |
| `temps` | `'guidage'` / `'entrainement'` / `'erreur'` / `'evaluation'` | Fixe le coefficient (1, 1, 1, 3 par défaut). |
| `bareme` | nombre | **Sa présence = la séance apparaît dans le suivi de classe.** Pour entrer dans le tableau par compétence il faut en plus `competences` et un `temps` valide. |
| `notation` | `'prof'` / `'avancement'` | Absent = score calculé par le moteur, ramené sur 20. `'prof'` : saisie à la main. `'avancement'` : jalons (ramenés sur 20 seulement dans le tableau par compétence). |
| `copie` | `true` | Évaluation en « copie rendue » : rien ne remonte pendant le travail, une seule remise, note figée. Demande aussi `copie: meta.copie` dans `creerEntreprise` et l'export `noter`. |

### Jalons pondérés et groupés (07/10/2026)

Un jalon (`etapes`) peut déclarer, en plus de `id`, `titre` et `verifier(db)` :

- `poids` : sa part de la note sur 20. La somme des poids d'une séance **vaut 20** : le moteur le vérifie à l'ouverture et
  refuse de la monter sinon (« La somme des poids des jalons vaut … au lieu de 20 »). Sans `poids`, chaque jalon vaut 1
  (le score est le nombre de jalons réussis, `bareme` = leur nombre). Avec des poids : `bareme: 20`. Un bloc a une part
  **fixe** de la note, partagée entre ses cases : ajouter une case ne change pas l'équilibre.
- `groupe` : la ligne du bandeau de fin (séance `correction`, ou visite notée au premier essai). Un groupe est juste quand toutes ses cases le sont. Le
  bandeau ne descend jamais à la case (une case oui/non nommée fausse donnerait la réponse) et n'affiche jamais de points.
- `ecran` : où l'élève corrige, `'fiche:<id de la fiche>'`, `'phrases:<id du message par phrases>'`, `'planning:<id du
  planning>'` ou `'transfert:<clé du message>'` (un message à transférer, voir plus haut) ; ou une fonction `(db) => …` qui rend
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
  lignes: { titre, legende?, liste: [{ id, nom, note?, de?, a?, dispo?, arrivee?, finHier?, …champs du contenu }] },
  affectation: { question: 'Qui charge le camion {carte} ?', manque: 'cariste ?', lien: 'le cariste',   // facultatif
                 liste: [{ id, nom, de?, a?, dispo?, … }], nonAffectees?: (cartes) => texte,
                 lecture: { titre, legende, bloc: (carte, ligne) => texte } },   // grille en lecture seule
  cartes: { titre, legende?, aPlacer?, liste: [{ id, titre, court?, famille, des?, avant?, date?, … }],
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
| `cumulSansPause` | `max` (min) | cumul d'une ligne > max **sans carte Pause entre deux** | `(ligne, o)` |
| `plafond` | `max` (min) | somme des durées d'une ligne > max | `(ligne, o)` |
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
les temps (en rouge en guidage seulement).

**Aléa** : `alea: { de, texte, cartes: { D: { des: '09:00' } }, ajoutCartes, ajoutLignes, ressources: { s2: { dispo:
'12:00' } } }`. Il arrive par la messagerie : `volet.declencheurs: [{ id: 'alea', quand: apresPlanning('smoby-quais'),
semer: (prenom) => ({ mails: [...] }), phasePlanning: 2 }]` (`apresPlanning` dans `core/declencheurs.js`, vrai dès le
1er envoi, juste ou faux). Le message s'affiche aussi en tête du panneau ; le planning de l'élève est gardé tel quel.
Sans aléa : un seul envoi, puis le bilan. « Réinitialiser le planning » vide le planning **en cours**, jamais une
version envoyée.

**Évaluation** : `meta.copie: true`, `copie: meta.copie`, `export const noter = (db) => moteur.noter(db)` ; le dernier
envoi rend la copie. Note = jalons réussis / jalons × `note.sur` (20 par défaut), détail jalon par jalon, clics sur
« Vérifier », heure du premier geste et des envois dans `detail.planning` (rangés, montrés nulle part).

## Vue « Plan d'entrepôt » (ranger des palettes, préparer une commande) — `core/types/entrepot.js`

Depuis le 04/10/2026 (brief `docs/briefs/MOTEUR-vue-plan-entrepot.md`, maquette v2 de `docs/briefs/plan-entrepot/`).
Trois modes sont écrits : **`rangement`** (lots 1 et 2), **`preparation`** (lot 4) et **`visite`** (second chantier), plus bas ; une séance qui déclare
`comptage` ne se charge pas tant que le lot 3 n'est pas fait. En rangement, l'élève prend une palette (carte du bandeau ou zone de réception du
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
  évaluation (`copie: true`) = rien de signalé, « Rendre mon travail » en deux clics, note jalons × 20.
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
| `associer` | `parcours` (id de l'étape parcours : ses numéros, ses ancres), `photos: [{ id, image, n, jalon? }]` (dans l'ordre montré), `consigne`, `consigneFini`, `juste` (`{n}`, `{titre}`), `faux` (`{n}`) — plan à gauche (numéros seuls), une photo à droite ; juste = photo suivante | toutes associées | une par photo |
| `delimiter` | `image`, `coins: { hg, hd, bg, bd }`, `tolerance`, `noms?`, `messages: { juste, faux ({coins}) }`, `correction: { legendes: [{ texte, x, y, rot?, plein? }] }`, `jalon?`, `puis?: { type: 'zones', x: [x0, x1], marge, cibles: [{ nom, y0, y1, x? }], pieges: [{ y0, y1, x?, message }], horsEtendue, horsCible, dejaTrouve, juste ({nom}), jalon? }` | coins justes (et toutes les cibles) | coins ; cibles |
| `adresse` | `code`, `sens` (4), `choix` (ordre des listes), `consigne`, `rappel`, `encadre`, `consigneTravee` / `consigneEmplacement` (`{code}`), `trouve` (`{adresse} {produit} {kg}`, lus dans le stock), `jalons?: { decomposer, retrouver }` | décomposée et retrouvée | décomposer ; retrouver |
| `fin` | `texte`, `consigne`, `image?`, `grandTitre?` | d'emblée | — |

- **Ancres du parcours** (jamais de pixels) : `quai:<nom du quai>`, `zone:reception`, `zone:litiges`, `zone:bureau`,
  `allee:principale`, `allee:<id>`. La trace se calcule (on descend à l'allée principale, on la longe, on remonte).
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

### Le kit de dessin isométrique — `core/iso.js`

**Jamais de code de dessin dans `contenus/`.** Le kit contient : projection (`projection()`, unité = une place de
palette), `face`, `boite`, cadrage automatique sur le décor ; décor (sol, mur, allée, couloir de masse et ses places,
panneau, flèches et textes au sol, repères de profondeur) ; charge `retention` (palette de rétention noire, 0 à 4
fûts, étiquette de lot, texte au sol, pastille « ! ») ; acteur `chariotFrontal` (gestes `poser`, `reprendre`,
cariste en silhouette sans visage). Il est conçu pour servir aussi au futur mode « stockage de masse » du Plan
d'entrepôt (ENT-6.5 §7.1).

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
  `reflexion: true` → non notée, « Ce qu'en pense … » ; en évaluation (`copie`) → « Merci, je note » pour toutes.
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
  | quai `<id>` | `quai:<id>:decharger`, `quai:<id>:valider` (une palette), `quai:<id>:cloturer` |
  | plan d'entrepôt `<id>` | `entrepot:<id>:poser` (poser une palette), `entrepot:<id>:verifier` |
  | animation `<id>` | `animation:<id>:<question>` (la première réponse) |
  | messagerie (toutes les séances) | `messagerie:transfert` (transférer un message, n'importe lequel ; chantier D-1) |

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
- Quai : `rendu: 'iso'` (quai sans froid, un camion ; voir l'en-tête de `core/types/quai.js`), et sur le camion `commande`, `lot`,
  `expedie` (date ou jours par rapport à aujourd'hui) pour l'en-tête du BL ; `parCarton` sur les `refs`.
- Fiche : un bloc `choix` peut porter `colonne: true` (réponses longues l'une sous l'autre). Tout envoi définitif (fiche, phrases,
  planning, bon de réception) passe par une confirmation dans la page : un test qui clique « Envoyer » doit ensuite cliquer
  `[data-confirme-oui]`.
