# Fiche d'une séance (activité)

À lire avant d'écrire ou de modifier une activité. Tout ce qui suit est relevé dans le code
au 02/10/2026 ; en cas d'écart, c'est le code qui a raison, et cette fiche est à corriger.

Une séance, c'est **un fichier** `activites/<id>.js` et **une ligne** dans `activites/index.js`.
L'accueil, les droits, la sauvegarde des scores, le suivi de classe et le tableau par compétence
suivent tout seuls.

## Ce que le fichier doit exporter

| Export | Obligatoire | Rôle |
|---|---|---|
| `meta` | oui | La déclaration (voir plus bas). |
| `rendre(hote, ctx)` | oui | Dessine la séance dans `hote` (un élément du DOM). |
| `noter(db)` | pour une évaluation (`copie: true`) | Calcule le score à partir de la base de l'élève. |
| `graines` | non | Contenu de départ que l'enseignant peut installer (bouton « semer »). |

Pour une séance d'entreprise, `rendre` ne fait que passer la main au moteur :

```js
const moteur = creerEntreprise({ ENTREPRISE, VOCAB, CATALOGUE, …, etapes, accueil, volet });
export function rendre(hote, ctx) { moteur.rendre(hote, ctx); }
```

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

`creerEntreprise` est dans `core/types/entreprise.js`. Les autres moteurs sont dans
`core/types/` (`qcm`, `ordre`, `assoc`, `numerique`, `tableur`, `tableau`, `tournee`, …).

## `meta` : les champs

### Identité (toujours)

| Champ | Contenu | À savoir |
|---|---|---|
| `id` | `'boost-ent32'` | Clé technique. **Jamais modifiée** : elle est écrite dans les chemins Firebase. |
| `code` | `'ENT-3.2'` | Ce que lit l'élève **et** ce qui décide du rang d'affichage. Forme `LETTRES-n` ou `LETTRES-n.n`. Un code mal formé garde sa place mais ne se trie plus. |
| `titre`, `desc` | texte | Affichés sur la tuile et en tête de la séance. |
| `rubrique` | `'logisim'` | Doit exister dans `RUBRIQUES` (`activites/index.js`). Rubriques : `logistique`, `scenario`, `quiz`, `tableur`, `logisim`, `magasin`. Logisim est rangé par entreprise : le **premier nombre du `code`** (`ENT-3.2` → 3) choisit le logo sous lequel la séance apparaît, d'après la table `ENTREPRISES` du même fichier. Entreprise nouvelle = une ligne dans `ENTREPRISES` (numéro, nom, métier, logo dans `contenus/trames/logos/`) ; sans cette ligne, la séance reste visible sous « Autres séances ». |
| `portee` | `'eleve'` / `'equipe'` / `'groupe'` / `'commun'` | À qui appartient la base. Si ce n'est pas `'eleve'`, un groupe doit être activé par l'enseignant. |
| `pret` | `true` / `false` | `false` : cachée aux élèves, visible de l'enseignant (étiquette « en préparation »). On passe à `true` quand Tristan a validé à l'écran. |
| `ouverture` | `'prof'` (ou absent) | `'prof'` : séance prête mais **fermée aux élèves tant que l'enseignant ne l'a pas cochée** pour son groupe dans « Conduite de séance » (ouvrir ne demande plus de commit). Absent : le niveau du groupe décide, comme avant. **Règle depuis le 03/10/2026 (brief `MOTEUR-ouverture-par-enseignant`) : une séance nouvelle (ENT-3.4, ENT-2.4…) est livrée avec `pret: true, ouverture: 'prof'` ; Tristan l'essaie, puis la coche lui-même pour son groupe.** Règle adoptée par Tristan (aussi dans `CLAUDE.md`). `pret: false` reste possible pour un brouillon qu'il ne faut pas pouvoir ouvrir. |

Familles de code : `DEC` découverte, `ACT` outil métier, `ENT` entreprise (`ENT-1.2` = entreprise 1,
séance 2), `TAB` tableur, `REF` exercices par compétence, `SCE` scénario ancien, `QUI` quiz,
`MES` messagerie. Changer un `code` déplace la séance partout, sans perdre de score.

### Niveaux et notes

| Champ | Contenu | À savoir |
|---|---|---|
| `niveaux` | `['2de','1re']` | Absent = tous les niveaux. L'enseignant peut forcer l'ouverture ou la fermeture par groupe. |
| `competences` | `['C2.4']` | Codes du référentiel 2025 (C1.1 à C3.4, liste dans `core/competences.js`). Toute séance Logisim les déclare. |
| `temps` | `'guidage'` / `'entrainement'` / `'erreur'` / `'evaluation'` | Fixe le coefficient (1, 1, 1, 3 par défaut). |
| `bareme` | nombre | **Sa présence = la séance apparaît dans le suivi de classe.** Pour entrer dans le tableau par compétence il faut en plus `competences` et un `temps` valide. |
| `notation` | `'prof'` / `'avancement'` | Absent = score calculé par le moteur, ramené sur 20. `'prof'` : saisie à la main. `'avancement'` : jalons (ramenés sur 20 seulement dans le tableau par compétence). |
| `copie` | `true` | Évaluation en « copie rendue » : rien ne remonte pendant le travail, une seule remise, note figée. Demande aussi `copie: meta.copie` dans `creerEntreprise` et l'export `noter`. |

### Base de l'élève, parcours, affichage

| Champ | Contenu | À savoir |
|---|---|---|
| `jeuId` | `'boost'` | Plusieurs séances travaillent dans **la même base**. Les scores restent par séance. Sans `jeuId`, la base porte l'`id`. |
| `tables` | `{}` ou `{ resultats: {} }` | Tables de la base. Vides pour une séance d'entreprise, qui range tout dans sa base. |
| `reinitialisable` | `false` | Bouton « Réinitialiser » d'une séance d'entreprise. Mettre `false` quand la base est partagée avec d'autres séances (X.2, X.3…). |
| `parcours` | `true` | La séance fait partie d'un parcours strict. |
| `precedente` | `'<id>'` | Avec `parcours` : la séance qui doit être validée avant. Absent sur la première. Sa validation range une **photo** du travail, qui sert de point de reprise. |
| `immersif` | `true` | Prend toute la page, sans bandeau Prepalog : la séance dessine son propre en-tête et sa sortie (`ctx.quitter()`). Compte aussi pour le parcours et la reprise par l'enseignant. |
| `corrige` | `'./contenus/corriges/ENT-3.1.js'` | Fichier de corrigé montré dans l'onglet « Corrigés » de l'enseignant. L'élève ne le voit pas, mais le fichier est public (voir CLAUDE.md). |
| `volume` | `VOLUME` | Volume déclaré de la séance (séances Cdiscount). **Aucun code du site ne le lit aujourd'hui** : c'est une information portée pour la suite. |

## Ce que reçoit `rendre(hote, ctx)`

| `ctx.` | Rôle |
|---|---|
| `profil`, `groupe`, `groupeNom`, `niveauGroupe`, `codeStock` | Qui travaille, dans quelle classe. |
| `meta` | Le `meta` de la séance. |
| `jeu` | La base ouverte : `etat()`, `sauver()`, `semer()`, `vider()`… |
| `enregistrer({score, max, detail})` | Remonte le score au suivi. Sans effet pour l'enseignant, sans groupe, sans `bareme`, ou en `copie`. |
| `rendreCopie({score, max, detail})` | Remise d'une évaluation (`copie: true` seulement). Une seule fois. |
| `lireScore()` | Le travail déjà enregistré, utile pour une séance notée à la main. |
| `quitter()`, `deconnexion()` | Sortie d'une séance immersive. |

## Pièges

- Une séance en cours d'écriture reste en `pret: false` et peut être commitée à tout moment.
  Elle compte quand même dans le tableau des compétences.
- Une séance X.2 qui partage la base d'une X.1 met `reinitialisable: false` et **cloisonne**
  par séance tout état nouveau qu'elle range dans la base de l'élève.
- Un score est enregistré **par séance** (`id`), jamais par `jeuId`.
- Ne pas copier Spartoo (`ENT-1.x`, point de comparaison) ni le module SCE (ancien) : le
  modèle est Boost (`ENT-3.x`).
- Ce que le jalon dit doit être vérifié **avant** que l'élève commence, et ne doit pas
  récompenser l'inaction. Un chiffre caché à l'élève ne doit pas être déductible ailleurs.
- Avant d'ajouter la séance : `node outils/test.mjs`, et un bloc de test dans `outils/test/`
  pour une entreprise nouvelle (une ligne dans `BLOCS` de `outils/test.mjs`).
