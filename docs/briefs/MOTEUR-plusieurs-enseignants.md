# Brief de chantier moteur — MOTEUR-plusieurs-enseignants : un collègue sans risque pour ta classe (chantier 11, audit C7)

**Statut** : livré (11a et 11b le 09/10/2026) ; **reste à publier les règles dans les consoles Firestore et Realtime Database** *(à valider → en cours → livré)*
**Date** : 08/10/2026 — cadrage Opus (lecture seule), d'après le dépôt au commit `a3961c5`.
**Modèle** : **Sonnet** pour les deux lots (11a puis 11b).
**Fichiers** : `core/backend-firebase.js`, `core/backend-demo.js`, `core/prof.js` ; lot 11b : `firestore.rules`
(+ en option `database.rules.json`), `outils/test-regles.mjs` ; tests : `outils/test/groupes.mjs`. Rien dans `core/types/`.

**En une phrase pour Tristan** : un collègue pourra créer son « 1L1 » à lui, être ajouté à ton groupe depuis le site
avec son adresse, et ne verra jamais tes élèves « sans groupe » ; **tes groupes et tes élèves actuels ne bougent pas**.

Légende : **VÉRIFIÉ** = lu dans le code, ligne citée ; **SUPPOSÉ** = déduit sans l'avoir lu ni exécuté.

## 1. État des lieux : ce qui suppose un seul enseignant (VÉRIFIÉ)

**Deux enseignants créent « 1L1 » : que se passe-t-il ?** Toi d'abord : `groupes/1l1` est créé. Le collègue ensuite :
`creerGroupe` calcule le même identifiant `1l1` (`backend-firebase.js:150`) et **lit** ce groupe avant d'écrire (`:152`).
La règle de lecture (`firestore.rules:91-95`) refuse : le groupe existe, il n'est pas dans `profs`, et `1l1` n'est pas dans
son profil. Le SDK lève une erreur `permission-denied` (« Missing or insufficient permissions. »), que `prof.js:425`
affiche telle quelle (`toast(e.message)`). **Refus brut en anglais, rien n'est écrit, aucun écrasement** : même si la
lecture passait, `setDoc` sur un groupe existant est une mise à jour, refusée par `profDuGroupe` (`firestore.rules:97`).
La base temps réel n'est pas atteinte. **En démo, le message est « Un groupe porte déjà ce nom. »**
(`backend-demo.js:140`) : la suite ne voit pas ce que verrait le collègue. (Lu, pas encore exécuté à l'émulateur.)

| Point | Où | Ce qui se passe aujourd'hui |
|---|---|---|
| Identifiant de groupe | `backend-firebase.js:150`, `backend-demo.js:139` | slug du nom (« 1 LOG A » → `1-log-a`), espace commun à tous |
| Enseignants d'un groupe | `backend-firebase.js:154`, `:161` | `profs: [créateur]` et `acces/{gid}/profs/{créateur}` ; **aucun code** n'ajoute ni ne retire un collègue |
| Élèves sans groupe | `backend-firebase.js:282-288`, `prof.js:76-80`, `659-736` | requête sur **tous** les élèves (`role == 'eleve'`) : chaque enseignant voit, rattache et **supprime** les orphelins de tous |
| Auteur d'un élève | `backend-firebase.js:319` | `creePar: <uid de l'enseignant>` écrit **depuis le premier commit** (`54b7e14`, ligne 158) ; **jamais écrit en démo** (`backend-demo.js:220`) |
| Matricule | `config.js:32` | identifiant de connexion = `matricule@prepalog.local`, commun à tout le site ; deux enseignants qui donnent « 1001 » : le second reçoit `auth/email-already-in-use` brut (`backend-firebase.js:325`), la démo dit « matricule déjà utilisé » (`backend-demo.js:218`) |
| Groupe d'un élève | `app.js:197` | `groupes[0]`, sans choix. **Aucun écran ne fabrique un élève à deux groupes** : `rattacherEleve` ne sert qu'aux orphelins (`prof.js:707`) ; seul la console le fait |
| Groupe actif de l'enseignant | `app.js:635-638`, `prof.js:36` | groupe mémorisé ou premier de la liste : marche déjà à plusieurs |
| Ouverture des séances | `prof.js:1563-1566` | réécrit **toute** la table `ouverts` depuis la copie en mémoire : deux co-enseignants ouverts en même temps s'écrasent (le dernier gagne) |
| Amorçage d'un collègue | `backend-firebase.js:97-102`, `firestore.rules:56-59`, `database.rules.json:118-121` | à la main : profil `users/{uid}` (console Firestore) **et** `profsGlobaux/{uid}` (console RTDB). Procédure dans la fiche Cowork `prepalog-firebase.md` (absente du dépôt) |

**Ce que les règles protègent déjà entre enseignants (VÉRIFIÉ, règles + `test-regles.mjs`)** :
- le **profil d'un collègue** : ni modifié ni supprimé (`firestore.rules:72-80` ; tests l. 192-195) ;
- le **groupe d'un collègue** : ni lu, ni modifié, ni supprimé (`:91-98` ; tests l. 247, 252) ;
- les **travaux** des élèves d'un collègue : ni lus ni écrits (`:103`, `:123` ; tests l. 272, 344) ;
- les **bases partagées** (`jeux/{gid}`) : réservées aux inscrits de `acces/{gid}` (`database.rules.json:66-67`) ;
- les **classements** : un enseignant n'efface que la ligne d'un élève de son groupe (`:103` ; tests 15 ter).

**Ce qu'elles ne protègent pas (VÉRIFIÉ)** :
- tout enseignant **lit tous les profils d'élèves**, codes compris (`firestore.rules:43` ; test l. 214 : `prof3` lit `e1`,
  qui n'est pas à lui). Assumé dans le code (`backend-firebase.js:316-317`). **Écart** : `chantiers.md` §1 promettait
  « limiter un enseignant aux profils des élèves de ses groupes » ; 7a86d42 ne l'a pas fait ;
- tout enseignant **modifie** (groupes compris) et **supprime** le profil de n'importe quel élève (`:75`, `:80` ; test l. 189 :
  `prof1` ajoute un groupe à `e3`, élève de `prof2`) ;
- tout enseignant lit et efface la base privée de n'importe quel élève (`:141`, `:145`) ;
- un enseignant de `profsGlobaux` réécrit le miroir `acces/{gid}` de **n'importe quel** groupe, donc peut s'y inscrire
  (`database.rules.json:58`) ;
- un co-enseignant (inscrit dans `profs`) peut retirer le créateur de `profs` et **supprimer le groupe** (`firestore.rules:97-98`).

Écarts de l'audit C7 : `config.js:90` et `app.js:192` sont aujourd'hui `config.js:32` et `app.js:197`.

## 2. Les décisions à prendre

Critère n° 1 partout : **tes groupes et élèves actuels marchent sans migration**.

### D1. Identifiant d'un nouveau groupe

| | A. Préfixe systématique (`ab12cd-1l1`) | B. Espace commun, refus lisible | C. Le nom d'abord, suffixe seulement s'il est pris |
|---|---|---|---|
| Principe | tout nouveau groupe = 6 premiers caractères de l'uid + slug | on garde `1l1` ; si refusé : « Ce nom est déjà pris par un collègue, choisissez-en un autre » | on essaie `1l1` ; si la lecture est **refusée** (groupe d'un collègue), on crée `1l1-ab12cd` (uid court du créateur) ; s'il est **à moi**, « Vous avez déjà un groupe de ce nom » |
| Code | `creerGroupe` (2 backends) | `prof.js` (message) + démo qui imite le refus | `creerGroupe` (2 backends, ≈ 15 lignes), démo qui imite |
| Règles | aucune publication | aucune | aucune (création permise : `firestore.rules:96` ; miroir : `profsGlobaux`) |
| Données existantes | inchangées | inchangées | inchangées |
| Tests existants | **≈ 20 identifiants écrits en dur** à réécrire (`socle.mjs:904, 932, 1072`, `groupes.mjs:128-367`, `demi-groupes.mjs:33`) : alerte « cas réécrit » | aucun | **aucun** (les tests créent des noms neufs) |
| À l'écran | rien (le nom affiché reste « 1L1 ») | le collègue doit inventer « 1L1 Dupont » | rien : les deux s'appellent « 1L1 » |
| Risque | churn des tests | nom imposé au second | un refus pour une autre cause serait pris pour « nom pris » (sans dégât : groupe suffixé) |

Dans les trois cas : **borner le slug à 30 caractères** (le `gid` d'une ligne de classement est validé `< 60`,
`database.rules.json:106` ; un nom long dépasse déjà aujourd'hui, SUPPOSÉ jamais arrivé).

### D2. Ajouter un co-enseignant à un groupe

| | A. Depuis le site, par son adresse | B. Depuis la console seulement | C. Les deux |
|---|---|---|---|
| Principe | panneau « Enseignants du groupe » : champ adresse → `profs` + `acces/{gid}/profs/{uid}` ; « Retirer » ; « Quitter ce groupe » pour le co-enseignant | ajouter l'uid dans `groupes/{gid}.profs` (console Firestore), puis bouton « Reconstruire l'accès » (recopie `profs` dans le miroir, `backend-firebase.js:172-191`) | A, et B documentée comme secours |
| Code | `ajouterCollegue`, `retirerCollegue` (2 backends) + panneau dans `prof.js` ; à la connexion, l'enseignant **écrit son adresse** dans son propre profil (permis : `firestore.rules:75`) | aucun | A |
| Règles | **aucune publication** : le responsable met à jour son groupe (`:97`) et son miroir (`database.rules.json:58`, il est dans `acces/{gid}/profs`) ; chercher un profil par adresse est permis (`firestore.rules:43`) | aucune | aucune |
| Données | inchangées ; un profil enseignant sans champ `email` n'est trouvable qu'après sa prochaine connexion (SUPPOSÉ : ton profil et la procédure Cowork n'écrivent peut-être pas `email`) | inchangées | inchangées |
| À l'écran | « Aucun enseignant avec cette adresse : il doit s'être connecté une fois après avoir été autorisé » | rien | A |
| Risque | faible ; il faut décider **qui** ajoute (voir recommandation : le responsable seul) | erreur de saisie d'uid dans la console | — |

**« Responsable » d'un groupe** = `profs[0]` : le créateur, toujours premier (`backend-firebase.js:154`, et un ajout se
place à la fin). Tes groupes actuels n'ont que toi dans `profs` (SUPPOSÉ : aucun retouché à la console). Pas de champ nouveau.

### D3. Élèves sans groupe

| | A. Filtrés par auteur | B. Visibles de tous, actions réservées | C. Réservés à `profsGlobaux` |
|---|---|---|---|
| Principe | je vois les orphelins **que j'ai créés** (`creePar == moi`) **et ceux sans auteur** (créés à la console), étiquetés « créé hors du site » | tous visibles, boutons « Rattacher / Supprimer » seulement sur les miens | seuls les administrateurs voient l'onglet |
| Code | filtre dans `prof.js` (un seul endroit pour les deux backends) ; démo : écrire `creePar` (`backend-demo.js:220`) | `prof.js` | `prof.js` + lecture de `profsGlobaux` |
| Règles | aucune pour l'écran ; la lecture reste ouverte à tout enseignant (§1) | aucune | aucune |
| Données | tes élèves portent `creePar` depuis le premier commit : **rien à migrer** (SUPPOSÉ pour un élève créé à la main dans la console : sans auteur, donc visible de tous, comme aujourd'hui) | inchangées | inchangées |
| Écran | le collègue ne voit aucun de tes orphelins | il voit tes noms et codes | un collègue simple ne voit pas les siens |
| Fini quand | **tenu** | « ne voit pas les orphelins de l'autre » **non tenu** | casse le filet de sécurité du collègue |

### D4. Élève à deux groupes (`groupes[0]`) — proposition : **ne rien construire dans le chantier 11**
Aucun écran ne fabrique un élève à deux groupes (§1). Un élève suivi par deux enseignants = **un groupe à deux
enseignants** (D2), pas deux groupes. Le sélecteur prévu par `chantiers.md` §11 reste en réserve ; Tristan tranche.

### D5. Procédure d'amorçage d'un collègue (à écrire en une page dans le lot 11a, `docs/` ou `README.md`)
1. Le collègue ouvre le site, « Connexion enseignant » avec son compte Google : refus « pas encore autorisé »
   (`backend-firebase.js:101`), mais son compte apparaît dans Authentication (SUPPOSÉ : comportement normal de Google).
2. Toi : console → **Authentication** → copier son **UID**.
3. **Firestore** → `users` → document dont l'identifiant est l'UID : `role` = `prof`, `nom`, `prenom`, `email` (minuscules),
   `groupes` = tableau vide.
4. **Seulement s'il doit créer ses propres groupes** : **Realtime Database** → `profsGlobaux` → clé = UID, valeur `true`.
   Un collègue qui n'est que **co-enseignant** de tes groupes n'en a pas besoin : c'est toi qui écris son accès (D2-A).
5. Il se reconnecte. S'il a créé un groupe avant l'étape 4, ce groupe existe sans accès temps réel : après l'étape 4,
   bouton « Reconstruire l'accès » (`prof.js:432-442`).

## 3. Recommandation

1. **D1 = C** (le nom d'abord, suffixe de l'enseignant si un collègue l'a pris) : zéro migration, zéro règle, zéro test réécrit.
2. **D2 = A** (depuis le site, par adresse), **le responsable seul ajoute et retire** ; le co-enseignant peut « Quitter ».
   B reste la voie de secours (console + « Reconstruire l'accès »).
3. **D3 = A** (filtre par auteur, orphelins sans auteur visibles de tous). **D4** : pas de sélecteur.
4. Un principe pour toutes les suppressions : **on ne supprime que ce qu'on a créé, ou ce dont on est responsable ;
   sinon on détache** (le détaché réapparaît chez son auteur dans « sans groupe » : réversible).
   Concrètement : un élève qui a un groupe qui n'est pas à moi, ou créé par un autre dans un groupe dont je ne suis pas
   responsable → bouton « Retirer du groupe » au lieu de « Supprimer » ; « Supprimer le groupe » réservé au responsable.
5. **Lot 11a (sans publication)** : D1-C, D2-A, D3-A, le principe 4 dans `prof.js` **et** en garde dans `supprimerEleve` /
   `supprimerGroupe` des deux backends (refus lisible avant la première écriture), ouverture des séances en champ pointé
   (`ouverts.<id>`, démo comprise) contre l'écrasement entre co-enseignants, messages lisibles (`permission-denied`,
   `auth/email-already-in-use`), étiquette « groupe de <responsable> » dans la liste, la procédure D5, les tests.
6. **Lot 11b (publication)** : la même chose écrite dans `firestore.rules` comme ceinture : suppression d'un profil
   d'élève réservée à son auteur (ou sans auteur) ou au responsable de son groupe ; suppression d'un groupe réservée au
   responsable ; en option, `acces/{gid}` créé par `profsGlobaux` mais réécrit seulement par ses inscrits.
   **11b ne fait que restreindre** : le code de 11a ne tente déjà plus rien de ce qu'il interdit, donc tant que la console
   n'est pas publiée **rien ne casse**, et après publication un refus imprévu est dit (« refusé par les règles : … »).
7. Hors chantier, assumé : la **lecture** de tous les profils par tout enseignant (fermer `list` sans usine à gaz est
   impossible, SUPPOSÉ) ; l'équipe est de confiance, l'écran protège de l'erreur, les règles de la manœuvre.

Extrait de règle pour 11b (Firestore, profil élève ; `responsable(gid)` = `exists` + `get(...).data.get('profs', [''])[0] == moi()`) :
```
allow delete: if estProf() && resource.data.get('role', '') == 'eleve'
  && (resource.data.get('creePar', moi()) in [moi(), null]
      || (resource.data.get('groupes', []).size() > 0 && responsable(resource.data.groupes[0])));
```

## 4. « Fini quand », traduit en cas de test

**`outils/test-regles.mjs` (émulateur)** — semer `creePar` sur un élève, `acces/g1/profs` avec un non-global.
- *Lot 11a, ce que les règles actuelles permettent déjà (attente « autorisé », discriminant)* : le responsable ajoute un
  collègue à `profs` ; le responsable non global inscrit un collègue dans `acces/{gid}/profs` ; le co-enseignant ajouté
  liste le groupe (`array-contains`), lit les travaux, lit le jeu ; un enseignant écrit son `email` dans son profil ;
  un enseignant cherche un profil par adresse ; un enseignant crée `1l1-<suffixe>` quand `1l1` est à un autre.
- *Lot 11a, refus (attente « refusé »)* : un enseignant lit le groupe `1l1` d'un collègue (c'est le signal « nom pris ») ;
  le co-enseignant **retiré** ne lit plus le jeu ni les travaux.
- *Lot 11b* : le co-enseignant ne supprime pas l'élève créé par le responsable ; l'auteur le supprime ; le responsable
  supprime l'élève créé par le co-enseignant ; un élève sans `creePar` reste supprimable (le cas `e9`, l. 199, reste vert) ;
  le co-enseignant ne supprime pas le groupe, le responsable oui ; (option) un global ne réécrit pas `acces/g2` qui
  n'est pas à lui, mais crée toujours un miroir neuf (tests 13 et 15 quater inchangés). Régression volontaire écrite en
  fin de fichier pour chacun.

**`outils/test/groupes.mjs` (démo)** — deux enseignants en démo, **c'est possible** : l'écran de connexion de démo a un
champ adresse (`app.js:156-157`, `185`) et `connexionProf(email)` crée un second enseignant (`backend-demo.js:96-108`).
- A crée « ZZ 1L1 » ; déconnexion ; B (`collegue@prepalog.local`) crée « ZZ 1L1 » : « Groupe créé », identifiant différent,
  B ne voit que le sien ; A recrée « ZZ 1L1 » : « Vous avez déjà un groupe de ce nom ».
- Orphelins : un de A, un de B, un sans auteur ; B voit le sien et celui sans auteur, **pas** celui de A (nommer ce qui reste).
- A ajoute B par adresse ; B voit le groupe, ses élèves, le Suivi ; B n'a pas « Supprimer le groupe » ; sur un élève
  créé par A, B a « Retirer du groupe » ; adresse inconnue → message lisible ; A retire B → le groupe disparaît chez B.
- Deux ouvertures de séance par A et B sur des copies anciennes : les deux restent ouvertes.
- Chaque cas éprouvé dans les deux sens (sabotage du filtre, du suffixe, de la garde). **Se reconnecter en
  `prof.demo@prepalog.local` à la fin** : le champ adresse reprend cette valeur à chaque affichage (`app.js:157`), mais un bloc suivant qui ne se reconnecte pas hériterait de B (SUPPOSÉ, à vérifier).

**Ce que la démo doit imiter** : le « nom pris par un autre » (suffixe), `creePar` à la création, les gardes de
suppression (même message que le réel), l'ajout par adresse, la mise à jour en champ pointé dans `majGroupe`
(aujourd'hui `{ ...g, ...patch }` ne comprend pas `ouverts.x`, `backend-demo.js:148`).

## 5. Pièges

- **`get()` sur absent** : `responsable()` passe par `exists()` puis `.get('profs', [''])` ; `groupes[0]` seulement après
  `size() > 0` ; un `[0]` sur une liste vide fait échouer l'évaluation = refus (acceptable ici, à savoir).
- **Ordre de `supprimerGroupe`** (`backend-firebase.js:254-259`) : élèves → `jeux/{gid}` → `acces/{gid}` → groupe, intangible.
  La garde « responsable seul » se fait **avant** la première suppression d'élève : un refus au milieu laisserait un groupe
  à moitié vidé.
- **`supprimerEleve` est en six étapes non atomiques** : si la règle 11b refuse le profil à la fin, travaux, base privée
  et classements sont déjà partis. D'où la garde **en tête**, dans le code, dès 11a. Et `:402` efface
  `acces/{gid}/eleves/{uid}` pour **tous** les groupes du profil sans `catch` : chez un collègue, un refus arrête tout
  en plein milieu — la garde « groupe pas à moi → détacher » l'évite.
- **Miroir `acces/{gid}`** : ajouter ou retirer un co-enseignant = **deux écritures** (Firestore puis miroir). Si la
  seconde échoue, le dire et proposer « Reconstruire l'accès », qui recopie `profs` (mais **n'efface pas** un co-enseignant
  retiré : `reconstruireAcces` n'écrit que des `true`, `:180`). Retirer = effacer `acces/{gid}/profs/{uid}` explicitement.
- **`profsGlobaux`** : un collègue global peut aujourd'hui s'inscrire au miroir de ton groupe (§1). L'option de 11b le ferme ;
  sans elle, c'est la confiance. Un co-enseignant seul n'a pas besoin d'y être (D5).
- **Élève de deux groupes de deux enseignants** (console seulement) : ses travaux sont rangés par groupe, il travaille
  dans `groupes[0]` (`app.js:197`) : l'autre enseignant ne voit rien au Suivi. Ne jamais le supprimer depuis un seul des
  deux : détacher.
- **Scores et classements d'un élève partagé** : un groupe à deux enseignants = un seul dossier de travaux, les deux
  voient les mêmes notes ; coefficients et ouvertures sont ceux du groupe (pas « les miens »). Le classement des quiz est
  par élève, commun à tous (`database.rules.json:98-115`) : rien à faire.
- **Retirer un co-enseignant** (« détacher ») = l'enlever de `profs` et du miroir. **Restent** : les élèves qu'il a créés
  dans le groupe (toujours dans la classe ; le responsable peut les supprimer, règle 11b) et ses écritures dans les bases
  partagées (`_par`). Rien ne part de ses autres groupes.
- **Le responsable qui part** : `profs[0]` ne se transmet pas dans ce chantier ; un groupe sans responsable se règle à la
  console (remettre un uid en tête de `profs`). À dire dans la procédure.
- **Deux groupes du même nom** chez un co-enseignant (son « 1L1 » et le tien) : d'où l'étiquette « groupe de Morin ».

## 6. Durée

| Lot | Durée | Ce qui la prend |
|---|---|---|
| 11a | ≈ 4 h | écriture ≈ 1 h 30 (deux backends + panneau) ; cas Playwright à deux enseignants et sabotages ≈ 1 h ; suite entière deux fois ≈ 30 min ; procédure D5 ≈ 20 min |
| 11b | ≈ 2 h + publication | règles ≈ 20 min ; cas d'émulateur et régressions volontaires ≈ 1 h ; `tester-regles.bat` et suite ≈ 30 min ; puis **Tristan publie la console Firestore** (et RTDB si l'option est prise) |

Version courte si le temps manque : **11a sans l'ouverture en champ pointé ni l'étiquette** (≈ 3 h) ; c'est D3 et la garde
de suppression qui protègent ta classe, à garder en priorité.

## 8. Compte rendu

### Lot 11a (09/10/2026, Claude Code sous Fable, sur délégation de Tristan)

**Décisions retenues** : celles de la recommandation du §3, sans changement (D1 = C, D2 = A, D3 = A, D4 = rien, principe 4, garde en tête du code).

**Commits** : `076ec30` (code), `8ad642a` (tests), puis le commit de documentation. Aucune règle touchée, rien à publier.

**Ce qui est construit** : `core/collegues.js` (nouveau : gardes de suppression d'un élève et d'un groupe, suffixe `uidCourt`, `idGroupe` borné à 30 signes, `lisible`) ; les deux backends (`creerGroupe` avec suffixe, `majGroupe` en champ pointé, `nomsProfs`, `ajouterCollegue`, `retirerCollegue` qui sert aussi à quitter, `detacherEleve`, gardes en tête de `supprimerEleve` / `supprimerGroupe`, `creePar` et `email` écrits) ; `prof.js` (panneau « Enseignants de … », « Quitter », « groupe de … », « Retirer du groupe », orphelins filtrés avec l'étiquette « créé hors du site », ouverture en champ pointé, messages `lisible`) ; `app.js` (le groupe actif d'un enseignant retiré tombe).

**Cas ajoutés** : 10 cas Playwright en fin de `outils/test/groupes.mjs` (39 a à j), 18 cas d'émulateur en fin de `outils/test-regles.mjs` (section « lot 11a »). Aucun cas existant réécrit, ni `test.mjs` ni `commun.mjs` touchés.

**Écarts au cadrage** :
- Un fichier nouveau, `core/collegues.js`, alors que le cadrage ne citait que `backend-*.js` et `prof.js` : la garde est écrite une fois, donc la suite (qui ne joue que la démonstration) éprouve le code du mode réel.
- La démo n'arrête pas un enseignant **absent** de `profs` qui supprime un groupe (un cas existant, 38 bis, crée un groupe au nom d'un `profUid` fictif puis le supprime en tant que prof démo) ; le mode réel le refuse (garde, puis règles). Un co-enseignant, lui, est refusé dans les deux.
- `groupe()` du backend réel rend `null` (au lieu de lever `permission-denied`) pour un groupe dont on a été retiré ; `supprimerGroupe` relit le groupe sans cette tolérance.
- « Comme la classe » (retour au réglage de la classe d'un demi-groupe) réécrit encore `ouvertsDemi` entier : seule la case d'ouverture est en champ pointé.
- `email` est écrit dès le chargement du profil d'un enseignant (pas seulement à la connexion) : Tristan devient trouvable sans se reconnecter.
- Commits regroupés en trois (code, tests, documentation) : le code des trois sous-sujets s'entremêle dans `prof.js` et les deux backends.

**Non vérifié** : le mode réel lui-même (pas de test du chemin Firebase dans le navigateur ; les règles qu'il rencontre le sont à l'émulateur, la logique de garde l'est en démonstration, car partagée). Le comportement du SDK servi par `vendor/` avec `FieldPath` à plusieurs segments n'est pas joué : `majTemps` l'utilise déjà, et l'émulateur a validé le champ pointé en chaîne (`ouverts.quiz-flux`) avec le SDK de test.

**Pour le lot 11b** : écrire dans `firestore.rules` la suppression d'un profil d'élève réservée à son auteur (`creePar`) ou sans auteur, ou au responsable de son groupe (extrait du §3) ; la suppression d'un groupe réservée au responsable ; en option, `acces/{gid}` créé par `profsGlobaux` mais réécrit seulement par ses inscrits. Les cas du §4 marqués « lot 11b » sont à écrire avec leur régression volontaire. Le code de 11a ne tente déjà plus rien de ce que 11b interdit.

### Lot 11b (09/10/2026, Claude Code sous Fable, sur délégation de Tristan)

**Commits** : `8ba2042` (correction du 11a), `794682c` (ses deux cas Playwright), `af1d707` (`firestore.rules`), `6191913` (`database.rules.json`), `df28f48` (19 cas d'émulateur), `0e17ef3` (message de « Reconstruire l'accès »), puis le commit de documentation.

**À PUBLIER (action de Tristan)** : la console **Firestore** (coller le fichier `firestore.rules` entier) et la console **Realtime Database** (coller `database.rules.json` **sans** le bloc `_commentaire`). Tant que ce n'est pas fait, rien ne casse : le code du lot 11a ne tente déjà plus rien de ce que les règles interdisent.

**Construit** : (1) `firestore.rules` : `allow delete` d'un profil d'élève = auteur (`creePar`), ou sans auteur, ou responsable du premier groupe ; `allow delete` d'un groupe = `profs[0]` seul. (2) Option RTDB **prise** : `acces/$gid` `.write` = (global ET nœud absent) OU inscrit ; les cas 13 et 15 quater existants restent verts. (3) **Correction du 11a** : `etatGroupe(gid)` (`mien`, `autre`, `absent`) dans les deux backends ; `gardeSuppressionEleve` reçoit `etrangers` (les groupes cités par le profil qui existent chez un collègue) ; la démo nomme comme le réel un groupe disparu dans ce qui reste ; `prof.js` demande l'état des groupes étrangers avant d'afficher « Supprimer » ou « Retirer du groupe ». (4) Le message de « Reconstruire l'accès » dit désormais que, pour un co-enseignant, c'est le responsable qui reconstruit.

**Suite Playwright entière : 910/910** (avant le push). **Cas** : 19 cas d'émulateur en fin de `outils/test-regles.mjs` (145 → 164, tous verts) ; 3 cas Playwright en fin de `outils/test/groupes.mjs` (39 k, 39 l, ménage 39 m). **Régressions volontaires jouées** (procédure 6 à 8 en fin de `test-regles.mjs`) : sans la branche « responsable » 163/164 ; `creePar` remplacé par `true` 157/164 ; sans la branche `creePar` 158/164 (tombe aussi le cas existant « un enseignant supprime le profil d'un élève », e9) ; suppression de groupe rendue à `profDuGroupe` 161/164 ; à `false` 162/164 (tombe aussi le cas existant « un enseignant supprime son groupe ») ; RTDB ancienne règle 163/164 ; RTDB sans la branche globale 161/164 (tombent aussi les cas 13 et 15 quater). Côté Playwright : l'ancienne garde fait tomber 39 k, une garde qui ne bloque jamais fait tomber 39 l, `etatGroupe` rendant toujours `absent` fait tomber les deux.

**Écarts au cadrage** :
- Le point 0 (correction du 11a) n'était pas dans le cadrage : la garde du 11a avait perdu la décision du chantier 6 (un groupe disparu n'arrête plus la suppression). Corrigée, avec deux cas.
- Un élève **sans auteur** reste supprimable par **tout** enseignant, y compris un enseignant étranger (comportement d'avant, demandé par le cadrage pour `e9`) : c'est volontairement le seul trou, il concerne les élèves créés à la console. Le test joue un co-enseignant ; pour l'étranger c'est la règle qui le dit, non jouée à part.
- Si le **premier groupe** d'un élève a disparu, seul son auteur le supprime (la règle n'a plus de responsable à trouver) ; la garde du code dit la même chose.
- Un co-enseignant **global** dont l'inscription au miroir RTDB a échoué ne peut plus reconstruire l'accès lui-même (conséquence de l'option RTDB) : le responsable le fait ; le message de refus l'explique.
- **Aucun ancien cas ne tombe** et aucun n'a été réécrit : les cas existants qui touchent aux règles nouvelles (e9, 13, 15 quater, « un enseignant supprime son groupe ») restent verts.

**Non vérifié** : le mode réel dans le navigateur (le chemin Firebase n'est joué que par l'émulateur et les règles ; la logique de garde, partagée, l'est en démonstration). Le comportement des règles publiées dans la vraie console n'est évidemment pas joué avant publication.
