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

**Commande annulée** (03/10/2026, brief `MOTEUR-statut-annulee`) : une commande semée peut porter
`annulee: { motif: 'Rupture : emplacement vide à la préparation', at: <timestamp> }`. Elle s'affiche
« Annulée » (pastille rouge) partout, **avant tout autre statut** (même préparée ou commencée), ne se
prépare plus (aucune saisie, aucun bouton) et ne compte plus dans les « commandes à préparer ». Sa fiche
dit « Annulée le JJ/MM à HH:MM — motif ». Si elle porte un `prep` (une ligne de `rows` par ligne
commandée), le contrôle et le bon restent lisibles en lecture seule. Le moteur ne fait aucun mouvement de
stock à l'annulation : c'est le volet qui sème ceux qu'il veut.

**Niveau de l'élève dans la séance** (03/10/2026) : `db.aisance` vaut `'standard'` ou `'confirme'`,
recopié de `ctx.aisance` à la création de la base puis **figé** (un réglage changé ensuite vaut pour les
séances suivantes ; la remise à zéro le relit ; l'enseignant a toujours `'standard'`). `baseDeDepart(prenom,
{ aisance })` le reçoit en second argument ; `semer(prenom, db)`, les déclencheurs et `verifier(db)` le
lisent dans la base. Une séance qui prévoit un volume confirmé **ajoute** ses opérations quand
`db.aisance === 'confirme'`, sans changer celles du jeu standard ni ce qu'attendent ses jalons (une
évaluation ne le lit pas). **Jamais affiché à l'élève** ; le détail de la note porte `niveau: 'confirmé'`.

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
| `rubrique` | `'simulog'` | Doit exister dans `RUBRIQUES` (`activites/index.js`). Rubriques : `logistique`, `scenario`, `quiz`, `tableur`, `simulog`, `magasin`. Simulog est rangé par entreprise : le **premier nombre du `code`** (`ENT-3.2` → 3) choisit le logo sous lequel la séance apparaît, d'après la table `ENTREPRISES` du même fichier. Entreprise nouvelle = une ligne dans `ENTREPRISES` (numéro, nom, métier, logo dans `contenus/trames/logos/`) ; sans cette ligne, la séance reste visible sous « Autres séances ». La ligne peut porter `intention: { pdf, docx }` (fichiers dans `contenus/intentions/`) : la **fiche d'intention** du scénario, une pour toutes ses séances, montrée à l'**enseignant seul** (onglet Corrigés, en tête de l'entreprise, et bandeau de la séance). Déclarer, c'est valider : pas de champ tant que Tristan n'a pas relu la fiche. |
| `portee` | `'eleve'` / `'equipe'` / `'groupe'` / `'commun'` | À qui appartient la base. Si ce n'est pas `'eleve'`, un groupe doit être activé par l'enseignant. |
| `pret` | `true` / `false` | `false` : cachée aux élèves, visible de l'enseignant (étiquette « en préparation »). On passe à `true` quand Tristan a validé à l'écran. |
| `ouverture` | `'prof'` (ou absent) | `'prof'` : séance prête mais **fermée aux élèves tant que l'enseignant ne l'a pas cochée** pour son groupe dans « Conduite de séance » (ouvrir ne demande plus de commit). Absent : le niveau du groupe décide, comme avant. **Règle depuis le 03/10/2026 (brief `MOTEUR-ouverture-par-enseignant`) : une séance nouvelle (ENT-3.4, ENT-2.5…) est livrée avec `pret: true, ouverture: 'prof'` ; Tristan l'essaie, puis la coche lui-même pour son groupe.** Règle adoptée par Tristan (aussi dans `CLAUDE.md`). `pret: false` reste possible pour un brouillon qu'il ne faut pas pouvoir ouvrir. |

Familles de code : `DEC` découverte, `ACT` outil métier, `ENT` entreprise (`ENT-1.2` = entreprise 1,
séance 2), `TAB` tableur, `REF` exercices par compétence, `SCE` scénario ancien, `QUI` quiz,
`MES` messagerie. Changer un `code` déplace la séance partout, sans perdre de score.

### Niveaux et notes

| Champ | Contenu | À savoir |
|---|---|---|
| `niveaux` | `['2de','1re']` | Absent = tous les niveaux. L'enseignant peut forcer l'ouverture ou la fermeture par groupe. |
| `competences` | `['C2.4']`, `['C1.4', 'OTM-C2.1']` | Codes de la liste de `core/competences.js` : Logistique 2025 sans préfixe (C1.1 à C3.4), transport `OTM-C1.1` à `OTM-C3.4`, gestion `AGO-1.1` à `AGO-3.3` (activités AGOrA). Un code absent de la liste fait tomber la suite. Toute séance Simulog les déclare. Le préfixe donne la **spécialité** : pour un groupe de 2de, l'onglet « Compétences » ajoute une moyenne par spécialité (une séance y compte une fois). |
| `domaines` | `['D2', 'D4']` | Domaines D1 à D5 de la 2de. **Lu nulle part pour l'instant** (déclaré pour plus tard, aucun écran). |
| `coeur` | `true` / `false` | `true` : séance du **cœur** (parcours minimal qui couvre les compétences du niveau) ; `false` : **complément**. Absent = pas encore rangée. **Lu nulle part pour l'instant.** Le nom `parcours`, proposé dans les fiches, est déjà pris (parcours strict, plus bas). |
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
