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
À l'étape ③, chaque palette se valide (« Valider cette palette » : une coche sur l'onglet, rien de figé ; seulement le
comptage noté — chaque référence —, la décision choisie et un motif pour des réserves ou un refus, sinon une phrase dit ce
qui manque) ; le bouton « Contrôles terminés → réserves » est en haut à droite et demande toujours une confirmation (03/10/2026).
**Quai « déjà réceptionné »** (03/10/2026, ENT-4.3, exemple : `contenus/picard-ent43.js`) : `mode: 'controle'`, un seul
camion, et `dossier: { receptionnaire, heure, reserves: [lignes du BL], fiche: [{ id, compte, temp, decision, remarque }], mot,
rappelProtestation }` (le travail du collègue, lu dans le contenu : jamais modifiable). Pas d'étapes ni d'horloge : onglets
« dossier » / « en chambre froide » (tour, sonde = `temp` d'aujourd'hui, étiquette, comptage de l'élève). Temps 2 ouvert par un
message déclenché portant `phaseQuai: 2` : « Bloquer — qualité » / « Débloquer », puis « J'ai terminé » (deux clics, définitif)
et bilan. Palette à bloquer : `bloquer: true`. Jalons des messages : `jalonsDossier: { avant(db, e), apres(db, e) }` (lignes
`{ id, lib, fait, attendu, ok }`), placés avant et après ceux du blocage. Un bouton « Messagerie » mène aux messages, un lien y
ramène au quai.

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
changerait) : un test « jeu figé » le rappelle. Pour une autre vue (inventaire de Cdiscount ENT-2.5), il restera à
faire accepter une fonction de la graine à cette vue dans `entreprise.js`, sur le modèle de `QUAI_TIRE`.

**Second motif** (quai, ENT-4.4) : `deuxMotifs: true` dans la déclaration propose un second menu « motif » sur
CHAQUE palette (pour ne pas désigner celle qui a deux problèmes) ; la palette déclare `motif2Attendu`. Décision juste
= mêmes motifs (dans n'importe quel ordre) ; réserve juste = une valeur juste pour chacun (« deux constats, deux
quantités »).

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
| `aisance` | `'standard'` ou `'confirme'`, réglé élève par élève par l'enseignant (onglet « Comptes élèves »). **Le moteur ne grossit rien** : seule une séance qui le prévoit dans son contenu en tient compte (règle de Tristan : jeu de données +30 % en guidage/entraînement, +50 % en bonus). Le contenu en plus **s'ajoute** au jeu standard sans rien changer à ses exercices ni à ce qu'attendent ses jalons. Toujours `'standard'` pour l'enseignant. Ne pas confondre avec `niveauGroupe` (la classe). |
| `tiersTemps` | Booléen, réglé par l'enseignant. Une épreuve chronométrée multiplie ses **seuils** de temps par 4/3 (le chrono mesure, il ne coupe pas) et l'affiche à l'élève. Donnée de santé indirecte : ne l'afficher qu'à l'élève lui-même, jamais dans une vue projetable, ne pas l'exporter. Première utilisatrice : la vue quai. |
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
