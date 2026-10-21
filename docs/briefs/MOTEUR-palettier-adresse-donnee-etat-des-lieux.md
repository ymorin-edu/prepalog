# État des lieux — chantier moteur « palettier à adresse donnée » (ENT-8.11 à 8.14, Action)

> **Note de rangement (Claude Code, 21/10/2026).** État des lieux en **lecture seule** fait par un sous-agent Opus à la demande du brief
> `MOTEUR-palettier-adresse-donnee.md` (§3), relu par la session chef de chantier (Fable), qui a **revérifié dans le code six affirmations
> clés** (charte d'Action bleue `#195799`, limite à 4 niveaux `entrepot.js:193`, un seul `entrepot` par séance `entreprise.js:223`, « TERMINAL
> VOCAL » en dur `terminal.js:279`, poids de chaque palette affiché dans la travée `entrepot.js:1025`, tailles des fichiers) : toutes exactes.
> Les numéros de ligne valent au commit 2fd4f48. **Rien n'a été écrit dans le code** ; aucune décision n'est prise : la liste des 14 décisions
> en fin de document attend Tristan (une à la fois).

> **Mise à jour du 21/10/2026 au soir.** Les 14 décisions de la fin du document sont **prises** par Tristan, une à une : **chantier complet, lot 0
> compris**, options recommandées retenues partout (ligne du 21/10 dans `docs/decisions.md`, chantier **E-7** dans `docs/chantiers.md`).
>
> **À porter dans les briefs par Cowork (décision 13) — liste à coller :**
> 1. ENT-8.11 à 8.14, brief moteur §6 : la charte d'Action est **bleue** (`#195799`, `contenus/action.js`), pas rouge ; la règle des chartes rouges ou
>    vertes ne joue pas, le vert plein reste réservé à « juste ».
> 2. ENT-8.11 §4 étape 3 : **Kevin écrit en premier** (un mot du genre « Tu as des palettes pour moi ? ») pour que l'élève lui réponde par phrases :
>    la Messagerie ne sait répondre par phrases qu'à un message reçu.
> 3. ENT-8.12 §5 et ENT-8.14 §5 : les points de comptage se nomment **par rang** (`compte-1` … `compte-6`, `recompte-1` …), pas par adresse tirée (la
>    liste des jalons d'une séance est fixe).
> 4. ENT-8.13 §4 bis : `q-rupture` s'accroche à un **geste** (première ouverture d'emplacement, par exemple), pas à la lecture du message de Yanis.
> 5. ENT-8.13 §6.1 et §11 n° 2 : la palette laissée dans l'allée et **posée par Kevin pendant la nuit** est à déclarer dans les données du lot 5, pas
>    seulement dans le texte.
>
> Et à reporter là où les briefs disent autre chose : ENT-8.11 §4 (nouvelle adresse donnée par le terminal, Samia commente) et §5 (« Corriger » sans
> le rangement) ; ENT-8.12 §11 n° 1 (règle unique du recompte) ; ENT-8.14 §6.1 (Belleville à 4 niveaux) ; ENT-8.11 §4 étape 3 (Kevin monte les
> palettes après sa réponse).


Lecture seule, 21/10/2026. Rien n'a été écrit dans le dépôt, la suite n'a pas été lancée.
Étiquettes : **VÉRIFIÉ** (lu dans le code ou la fiche, avec fichier:ligne) ou **SUPPOSÉ** (déduit, pas essayé à l'écran).
`docs/EN-COURS.md` est vide (aucune autre session) ; dépôt propre au départ.

---

## Trois découvertes à lire en premier

1. **Le plan d'entrepôt ne se tire pas par élève** (VÉRIFIÉ). L'option `entrepot` n'accepte qu'un objet (`core/types/entreprise-options.js:54`),
   créé une seule fois pour toute la séance (`core/types/entreprise.js:223`). Le quai, l'inventaire et l'inspection, eux, peuvent être une
   **fonction de la graine et du niveau** (`entreprise.js:200-214`, `:262-275`). Or les quatre séances tirent leurs palettes, adresses,
   écarts (§6 bis de chacune), ENT-8.11 à 8.13 ajoutent une palette ou une adresse « bonus » au confirmé, et ENT-8.14 change de plan selon le
   site. **Sans ce préalable, aucune des quatre séances ne peut se construire comme le brief le dit.** Le brief moteur n'en parle pas. Je
   propose un **lot 0** (petit, sur le modèle du quai).
2. **La charte d'Action n'est pas rouge** (VÉRIFIÉ) : l'accent est le **bleu** `#195799` (`contenus/action.js:29-53`), gardé tel quel dans la
   zone de travail. Le §6 du brief moteur (« Charte d'Action (rouge) ») se trompe ; ça ne change rien au travail, mais à corriger dans le brief.
3. **Les ids de jalons par adresse ne tiennent pas** (VÉRIFIÉ). Les jalons d'une séance sont une liste **fixe** déclarée au chargement
   (`etapes`, `entreprise-options.js:31`), avec leurs poids. Si les adresses à compter sont tirées (ENT-8.12 §6 bis), `compte-<adresse>` et
   `recompte-<adresse>` changeraient d'un élève à l'autre. Il faut des ids **par rang ou par rôle** : `compte-1` … `compte-6`,
   `recompte-manque`, `recompte-surplus` (le titre affiché au bilan se calcule avec `titreBilan`, déjà prévu : `activites/FICHE-SEANCE.md:1090`).

---

## A. Lot par lot : ce qui existe, ce qui manque, ce qui contredit

### Lot 1 — Ranger à l'adresse donnée, passer la main au cariste

**Existe, réutilisable**
- Le plan vu de dessus, la travée de face, l'adresse `A1-T03-N2-E1` avec N1 = sol (`core/types/entrepot.js:98-102`), l'emplacement occupé
  refusé (`entrepot.js:723-726`), le stock de départ, les plaques par niveau (`plan.cotes[x].charge`, contrôlées `entrepot.js:200-203`).
- Le calcul de la **charge réelle d'un niveau** (`chargeNiveau`, `entrepot.js:250-254`) et le critère `charge` « dire que » avec « au sol pas de
  limite » (`entrepot.js:165-169`) : c'est exactement la « vérité de l'emplacement » contre laquelle juger un signalement « charge dépassée ».
  Les autres motifs ont aussi leur vérité dans le code : « occupé » = stock ou palette de l'élève (`occupant`, `entrepot.js:243`),
  « emplacement abîmé » = `horsService` (`entrepot.js:213`).
- Le **capteur de charge** dessiné sur la travée (`entrepot.js:993-1012`) et la plaque « max … / niveau » (`entrepot.js:1047`).
- Une **vue de près** d'un emplacement existe déjà en préparation (fiche de prélèvement à côté de la travée, mise en page `pe-partage`,
  `entrepot.js:1475-1480`) : le même cadre peut porter « Poser ici / Confier à Kevin / Signaler ».
- Le geste publié `entrepot:<id>:poser` et `:verifier` (`entrepot.js:1497`) ; le contrôle qui refuse un `apresGeste` sur un nom qu'aucune vue
  ne publie (`entreprise.js:322`, `core/declencheurs.js:120-125`).
- Un mode dans son propre fichier qui **emprunte** le plan et la travée de face : c'est déjà fait pour la visite
  (`entrepot.js:1491-1494`, `creerVisite(P, M, { G, ui, Y0, TH, htmlPlan, htmlFace, … })`).

**Manque**
- Tout le geste « adresse donnée » : étiquette « Adresse : … » sur la carte, niveaux du cariste, vue de près, « Confier à Kevin », zone
  « À monter » dessinée au pied de l'allée (le plan ne connaît que litiges, bureau, réception, vestiaire et contrôle : `entrepot.js:655-664`),
  « Signaler » avec motifs, refus « Au-dessus du sol, c'est Kevin… », jalons `place-`, `signale-`, `pasPoseHaut`.
- Un **« Valider mon rangement » qui fige** (avec confirmation). Le rangement d'aujourd'hui n'a que « Vérifier » (illimité, `entrepot.js:1598`) ;
  le mode `masse` a déjà un « Valider » qui fige (`activites/FICHE-SEANCE.md`, mode masse : « Valider mon rangement … fige le rangement »).
  ENT-8.13 (le soir, avant le lendemain) et ENT-8.14 (copie) en ont besoin : je le mets au lot 1, pas au lot 6.
- Des jalons qui rendent bien `attente` / `ok` / `ko`. Ceux du rangement d'aujourd'hui ne rendent **jamais** `ko` : une palette mal rangée
  reste « à faire » (`entrepot.js:541-544` et `:551-559`). Dans une séance `correction` (ENT-8.11), un jalon « à faire » pour toujours
  empêche le bilan d'arriver (`entreprise.js:1272`) : l'élève resterait bloqué. ENT-5.5 contourne en écrivant ses propres jalons
  (`contenus/smoby-ent55.js:230-238`). Les nouveaux jalons doivent passer à `ok`/`ko` à la validation.
- **Lot 1 bis (Kevin qui monte quand on lui écrit)** : la vue ne reçoit pas la base de l'élève, seulement son propre état
  (`entreprise.js:2233-2247`, `apiEntrepot` sans `db`). Pour « les palettes passent de À monter à leur emplacement quand le message est
  envoyé », il faut soit une ligne dans `apiEntrepot` (donner la base en lecture) et une condition déclarée (`cariste.monteSi: apresMail(…)`),
  soit monter à la validation. Petit, mais c'est `entreprise.js`.

**Contredit le code ou une règle**
- **Les textes du rangement sont au « vous »** (« Prenez une palette », « votre palette », « Si vous posez » : `entrepot.js:757`, `:841`,
  `:1026`, `:1077`). La règle du 06/10 dit « tu » (`activites/FICHE-SEANCE.md:2358-2363`). ENT-5.5 date d'avant : je ne propose pas de
  toucher ses textes, mais tout ce qui est nouveau doit être au « tu ».
- **Le capteur de charge donne déjà la somme** « posé + palette en main », dans les trois temps, et passe au rouge « SURCHARGE » en guidage et
  en entraînement (`entrepot.js:996-1011`). Or ENT-8.11 §6 bis réserve « la somme faite » à l'**accompagné** ; ENT-8.13 §0 veut un
  entraînement « sans aide de charge » ; en ENT-8.14, le capteur (gardé en évaluation par décision du 05/10, `entrepot.js:25-27`) rendrait
  le signalement de P4 presque gratuit. Il faut une option qui règle ce que montre le capteur (rien / déjà posé seul / la somme).
- **`pasPoseHaut` serait un point gratuit** si cliquer un niveau haut ouvre directement « Confier / Signaler » sans bouton « Poser ici » : il
  n'y aurait jamais de « tentative de pose ». Pour que le jalon mesure quelque chose, la vue de près doit offrir **les mêmes boutons à tous les
  niveaux** (Poser ici · Confier à Kevin · Signaler), « Poser ici » au-dessus du sol étant refusé et compté.
- **« Signaler à tort »** : le brief moteur dit « signaler à tort est faux », les séances le testent (ENT-8.11 §8 « Signaler P3… → ✗ »,
  ENT-8.14 §8 « signaler P1 à tort → signale ✗ »), mais aucun jalon `signale-P3` ou `signale-P1` n'est au barème (§5 de chaque séance).
  Il faut dire **où** l'erreur coûte (voir « Décisions », n° 6).
- **« Corriger » vers le rangement** (ENT-8.11 §5 : `'entrepot:action-ranger'`) n'existe pas : les écrans qu'on peut rouvrir sont fiche,
  phrases, planning, transfert, dialogue (`entreprise.js:1274-1314`). Soit on l'ajoute (entreprise.js, ≈ 1 h), soit le rangement se fige à
  « Valider » comme le terminal d'ENT-8.12 (`finFige`).
- **Le message à Kevin par phrases** : la réponse par phrases n'existe **qu'en réponse à un message reçu** (`activites/FICHE-SEANCE.md:176-178`,
  `core/types/entreprise-messagerie.js:216-236`). ENT-8.11 §4 étape 3 fait écrire Samia (« Écris à Kevin… ») : pour que l'élève écrive à
  Kevin, c'est **Kevin qui doit écrire d'abord** (« Tu as des palettes pour moi ? »). Simple affaire de contenu, à corriger dans le brief.
- Les choix des phrases calculés sur « ce qu'il a confié » : **possible** (VÉRIFIÉ, `core/phrases.js:9-13` et `:27-41` : `choix` et `juste`
  fonctions de la base), mais calculés **une seule fois**, à l'arrivée du message. Si l'élève reprend ses palettes après, le message ne suit pas.

### Lot 2 — Scanner pour confirmer

**Existe** : le boîtier du terminal (`core/types/terminal.js`), son journal, ses refus en texte rouge sans vert (`styles/entrepot.css:422`),
le son coupé par défaut et réglé par l'enseignant (`terminal.js:212-229`, « sans son » affiché sinon, `:280-282`). Le principe « on ne lit le
code que de près » existe en picking (FICHE, mode picking : « Le code ne se lit que de près (testé) »).

**Manque** : l'état `scan`, le geste de scan (clic sur l'étiquette de l'emplacement dans la vue de près, puis sur celle de la palette), le
message « Ce n'est pas l'adresse de cette palette. » (trace), `ouSystemeCroit(db, P, 'P1')`, les jalons `scan-<P>`. Le terminal ne sait faire
qu'une **suite de lignes dans un ordre imposé** (`terminal.js:15-18`, `:111-116`) : ça va pour compter une liste (lot 4), pas pour des scans
dans le désordre au fil du rangement. Il faut un petit **mode « scanner »** du même boîtier : pas de champ à taper, le journal, la phrase en
cours (« Scanne l'emplacement. »), alimenté par la vue.

**Contredit** : l'en-tête « TERMINAL VOCAL » et l'étiquette d'accessibilité « Terminal vocal » sont écrits en dur (`terminal.js:279-280`) ;
il faut un nom réglable (« TERMINAL »). Le terminal n'accepte que des chiffres (`terminal.js:137`) : sans importance si le scan est un clic.

### Lot 3 — Adresse prise, adresse libre, poser sans scanner

**Existe** : le refus « Emplacement déjà occupé. La palette reste en main. » (`entrepot.js:724-726`) ; le mécanisme de message déclenché par
un geste (`apresGeste`, `core/declencheurs.js:120-125`) : la déclaration `pousse` du brief **n'est pas nécessaire**, la séance déclare son
message de Kevin dans `volet.declencheurs` dès que la vue publie `entrepot:<id>:occupe:P3`.
**Manque** : publier ce geste (et l'inscrire dans `signaux`, une entrée par palette, comme le stockage de masse liste `ouvrir:<couloir>` :
`core/types/entrepot-masse.js:629`), « Demander une adresse libre » au terminal (`adresseLibre` déclarée), le refus de scan tant qu'aucune
adresse libre n'est demandée, le jalon `adresseLibre-<P>`, « Valider » possible avec une palette restée dans l'allée.
**Contredit** : rien.

### Lot 4 — Compter au terminal, à l'aveugle, en cartons

**Existe, réutilisable**
- **Le dessin des cartons en perspective** : `pile([W, D, L], ecart)` dessine les couches pleines, les cartons manquants sur la couche du
  dessus, les cartons en trop posés dessus (`entrepot.js:1229-1256`). C'est la règle du lot 3 d'origine. Il est **enfermé** dans la vue de
  préparation : à sortir (déplacement simple, à faire sans changer le dessin, ENT-5.6 doit rester identique).
- Le terminal du comptage d'ENT-6.6 : une ligne = un lieu, « Code de contrôle ? » puis « Combien ? », « Compris : n. », ordre imposé, codes
  faux en trace (`terminal.js:15-18`, `:130-165`) ; `comptagesTerminal`, `comptageFini` (`entrepot.js:628-629`).
- La fiche « Mes écarts » : la vue Fiche accepte des **blocs et des documents fonctions de la base** (`core/types/fiche.js:111-120`), une
  fiche qui n'apparaît qu'après une condition (`quand(db)`, `fiche.js:100-102`) : une ligne par écart confirmé, et des choix différents selon
  le sens de l'écart, **c'est faisable sans rien ajouter à la vue Fiche** (VÉRIFIÉ sur la fiche ; SUPPOSÉ pour le rendu exact).

**Manque** : le scan à la place du code (le terminal attend un clic de la vue, comme il attend déjà la pose : `poseTerminal`,
`terminal.js:209-213`) ; « Quantité différente. Recompter ou confirmer ? » (une phase nouvelle, avec le nombre du système **dans la ligne en
mémoire, jamais dans la page**) ; l'option `recompte: 'ecart' | 'jamais'` ; `ecartsConfirmes(db, P)` ; les jalons ; le dessin calculé depuis
`reel` et le format ; le cas « liste visible » (le terminal ne montre que la phrase en cours et les 5 dernières, `terminal.js:271`).

**Contredit / risque de fuite (important)** : la travée de face écrit, sur **chaque** emplacement occupé, le produit **et son poids**
(`entrepot.js:1025`), et le capteur additionne les kilos par niveau (`entrepot.js:999-1000`). En comptage, un poids qui correspond au stock
du système laisse **déduire** le nombre de cartons (poids ÷ kg par carton) : c'est le cas que CLAUDE.md interdit (« un chiffre caché ne doit
pas être déductible ailleurs »). En comptage, la travée ne doit montrer ni poids ni capteur. Le test « le nombre du système n'est nulle part
dans la page » ne suffit pas : il faut aussi tester l'absence des poids.

### Lot 5 — « Le lendemain » : retrouver et transférer

**Existe** : la marque « trouvé » en vert pâle (elle dit « juste », c'est permis) de la visite (`entrepot.js:1029-1032`) ; le décompte des
emplacements vus du picking (`vus`, FICHE mode picking) comme modèle des « ouvertures comptées ».
**Manque** : tout le reste (phases, état de départ qui « ment », palette de Kevin, ouvertures, transfert, jalons, gestes `trouvee` et
`transfert`).
**Contredit** :
- La travée de face **affiche le nom du produit** de chaque palette (`entrepot.js:1025`, `:1037`) : chercher « en ouvrant des emplacements »
  n'a pas de sens si tout se lit d'un coup d'œil. Au lendemain, la travée ne doit montrer que des palettes, l'étiquette ne se lisant que de près.
- **La palette laissée dans l'allée** : ENT-8.13 §11 n° 2 veut que Kevin la pose « à côté » pendant la nuit (même enquête). Le lot 5 du brief
  moteur ne le prévoit pas : il faut une déclaration (où Kevin pose ce qui reste dans l'allée).
- **L'emplacement « à côté » de P9** doit être distinct de tout emplacement où l'élève peut poser P3 : je propose que P9 soit **déjà posée
  dès le soir** (l'élève voit un emplacement occupé, rien de plus), le système la croyant à son adresse donnée.
- La question au fil `q-rupture` d'ENT-8.13 se déclenche sur « message de Yanis **lu** » : aucun geste n'existe pour la lecture d'un message
  (recherche dans `core/` sans résultat, SUPPOSÉ exhaustif), et la règle de Tristan exclut l'ouverture d'un écran comme déclencheur
  (`core/declencheurs.js:22-24`). À rebrancher sur la première ouverture d'emplacement du lendemain, ou sur le passage au lendemain.

### Lot 6 — Évaluation en copie, un plan par site

**Existe** : la copie du rangement (rien de signalé, « Rendre mon travail » en deux clics : `entrepot.js:798-804`, `:1599-1601`) ; la note
d'une séance pondérée en copie qui reste celle des jalons (`activites/FICHE-SEANCE.md:1055-1058`, `entreprise.js:526-529`) ; `rendCopie: false`
existe pour le **planning** et le **quai** (`core/types/planning.js:504`, `:754` ; `core/types/quai.js:120`, `:4401`) ; le module des sites
`siteDe(uid)` / `siteDeBase(db, idSeance)` (`contenus/action-eval-sites.js:56-73`), pur, sans effet de bord.
**Manque** : `rendCopie: false` pour l'entrepôt (le bouton appelle toujours `api.rendreCopie()`, `entrepot.js:1601`) ; deux phases dans la
même vue (ranger, puis compter) ; le plan par site — qui suppose le **lot 0** (entrepôt tiré par élève).
**Contredit** :
- **Belleville à 5 niveaux** (ENT-8.14 §6.1) : le moteur refuse au-delà de 4 niveaux (`entrepot.js:193`). Lever la limite est possible mais la
  travée de face grandit de 130 unités par niveau (`entrepot.js:997-998`) : à 1366 × 768, les étiquettes et la plaque deviendraient petites
  (SUPPOSÉ, à mesurer). Plus simple : 4 niveaux aux deux sites, autres plaques et une allée de plus à Onnaing.
- Onnaing à 3 allées de 2 côtés : le plan s'élargit (≈ 1 054 unités de large au lieu de ≈ 800, calcul sur `entrepot.js:640-664`) ; il est
  dessiné à la hauteur disponible, donc il devrait tenir (SUPPOSÉ, à mesurer à 1366 × 768).

---

## B. Les trois questions du §3

**1. Le terminal peut-il servir sans voix, comme terminal à scanner ?** Oui, avec trois retouches (VÉRIFIÉ sur `terminal.js`) : le son est
déjà coupé par défaut et le texte suffit (`terminal.js:212-229`) ; il faut un **nom réglable** au lieu de « TERMINAL VOCAL » écrit en dur
(`:279-280`) ; et un **scan donné par la vue** à la place du « Code de contrôle ? » tapé (le terminal sait déjà attendre un signal de la vue :
la pose, `:209-213`). Pour le comptage (lot 4), son déroulé ligne à ligne convient tel quel. Pour le rangement (lot 2), où l'on scanne dans le
désordre, il faut un petit mode « journal » du même boîtier (sans champ). Le picking et le comptage d'ENT-6.6 ne changent pas si l'option est
absente.

**2. Le mode `rangement` peut-il recevoir une adresse imposée sans casser ENT-5.5 ?** Techniquement oui (une option absente = le comportement
d'aujourd'hui, et les tests d'ENT-5.5 ne lisent pas ce qui serait ajouté). **Mais je recommande un mode à part, `palettier`, dans son propre
fichier** `core/types/entrepot-palettier.js`, qui emprunte le plan, la travée de face et le calcul de charge comme le fait déjà la visite
(`entrepot.js:1491-1494`). Pourquoi : presque tout diffère (aucun critère, vue de près, cariste, scan, validation qui fige, jalons
`ok`/`ko`, textes au « tu », capteur réglé autrement, travée sans noms au lendemain, comptage) ; en options, le code d'ENT-5.5 serait truffé de
« si » et chaque retouche ferait courir un risque à Smoby. Le seul endroit partagé à toucher : la travée de face (`htmlFace`) doit accepter
deux ou trois réglages (cacher noms et poids, cacher le capteur, poser les étiquettes) — chacun absent = dessin d'aujourd'hui.

**3. Un ou plusieurs `entrepot` par séance ?** Aujourd'hui : **un seul** (VÉRIFIÉ, `entreprise.js:223`, une seule entrée de menu `:1686`, un seul
état `:2233-2236`), même si le contrôle des identifiants prévoit déjà une famille « plans d'entrepôt » (`entreprise.js:311`). Le pluriel
existe pour les fiches et les animations (`entreprise.js:247`) mais l'ajouter à l'entrepôt touche ≈ 14 endroits d'`entreprise.js`.
**Je recommande un seul entrepôt avec des phases** : `phases: ['soir', 'lendemain']` pour ENT-8.13 et `['rangement', 'comptage']` pour
ENT-8.14. Le lendemain doit lire l'état du soir (mêmes palettes, même stock) : dans une seule vue, c'est un seul état, sans qu'une vue lise
l'état d'une autre. La barre « Étape suivante » accepte deux étapes sur le même écran (elle prend la première non faite,
`entreprise.js:1366-1371` ; SUPPOSÉ sans défaut à l'écran).

---

## C. Les points « à vérifier » des §7 et §11 des séances

| Point | Réponse |
|---|---|
| `apresSignalement` (nouvelle adresse en guidage, ENT-8.11) | **N'existe pas** (aucune trace dans `core/`). Le message de Samia peut arriver par `apresGeste('entrepot:<id>:signaler:P5')` une fois le geste publié ; mais **la nouvelle adresse doit être changée par la vue**, pas par un message. Je propose : chaque palette peut déclarer `nouvelleAdresse` ; le **terminal** (le système) la donne après un signalement, et Samia ne fait que commenter. Attention à la règle « ne jamais conditionner l'arrivée d'un message à une réponse juste » (`core/declencheurs.js:66-67`) : un « Bien vu » de Samia à chaque signalement, même à tort, serait faux. |
| Messagerie qui calcule ses phrases sur les palettes confiées | **Oui** : l'état de la vue est dans la base de l'élève (`db.entrepots[<id>]`, `entrepot.js:530`) et les phrases acceptent des fonctions de la base (`core/phrases.js:27-41`). Il faut exporter une petite fonction lisible (`palettesConfiees(db, P)`, comme `placeMasse` : `entrepot.js:630`). Deux limites : calcul fait **une fois**, à l'arrivée du message ; et c'est **Kevin qui doit écrire en premier** (phrases seulement en réponse). |
| Geste `entrepot:<id>:occupe:<P>` comme déclencheur | **Le mécanisme existe** (`apresGeste`), le geste **non** : à publier et à inscrire dans `signaux` (sinon la séance refuse de s'ouvrir, `entreprise.js:322`). |
| `ouSystemeCroit` pour choisir la palette cherchée | **N'existe pas** ; facile une fois l'état `scan` posé (lot 2). Le message de Yanis peut le lire : `semer(prenom, db)` reçoit la base (`activites/FICHE-SEANCE.md`, volet et déclencheurs). |
| Fiche dont les lignes sont calculées sur les écarts confirmés, choix selon le sens | **Déjà possible** avec la vue Fiche (`blocs` fonction de la base, `fiche.js:111-120` ; `quand(db)`, `fiche.js:100-102`). Deux précautions : la fonction est appelée une fois sur une base vide au chargement (elle ne doit pas planter) ; les gestes `fiche:<id>:<bloc>` publiés sont ceux de la base vide (une question au fil sur une ligne calculée ne marcherait pas). |
| Rubrique `ecodroit` dans le tirage de l'ouverture | **Oui** : les rubriques sont libres, n'importe quel nom (`core/types/questions.js:204-228`). Condition : la banque en compte au moins le double de ce qu'on tire. ENT-8.14 tire `preparation: 2, ecodroit: 1, image: 1` sur 5 / 3 / 2 questions : ça passe. ENT-8.11 et 8.12 (3 préparation + 1 image sur 7 / 2 et 8 / 2) : ça passe aussi. |
| `rendCopie: false` et `finFige` avec la vue entrepôt | `finFige` : **oui**, c'est une phrase de la séance, valable pour tout jalon sans `ecran` (`activites/FICHE-SEANCE.md:1043-1044`). `rendCopie: false` : **non**, à ajouter à l'entrepôt sur le modèle du planning (`planning.js:504`, `:754`). |
| Signalement en copie sans nouvelle adresse | Rien ne s'y oppose : la vue publie, ne juge rien à l'écran, dit « C'est noté. » ; la palette reste en réception. Le jalon est jugé à la remise. À écrire. |
| Module des sites étendu d'un palettier sans casser ENT-8.5 / 8.6 / 8.10 | **Je recommande de ne pas toucher `action-eval-sites.js`** : déclarer les deux palettiers dans `contenus/action-ent814-donnees.js`, rangés par clé de site (`onnaing`, `belleville`), et lire le site avec `siteDeBase(db, id)` comme le fait ENT-8.10 (`contenus/action-ent810-donnees.js:25`). Le module reste lu, jamais modifié ; ses tests (`outils/test/action-85.mjs:258`, `action-810.mjs:262`) restent intacts. |
| Contradiction `recompte` (ENT-8.12 §11 n° 1) | Voir la règle proposée juste en dessous. |

**Règle unique proposée pour `recompte`.** Un jalon par adresse de la liste (par rang), qui ne reste **jamais** « à faire » après le comptage,
parce qu'un « à faire » éternel bloque le bilan d'une séance `correction` (`entreprise.js:1272`) :
- adresse **non comptée** à « Terminer le comptage » → **faux** ;
- le terminal a proposé de recompter (premier compte ≠ système) → **juste** si l'élève a choisi « Recompter » au moins une fois, **faux** sinon ;
- le terminal n'a rien proposé (premier compte = système) → **juste** (rien à recompter ; une erreur de comptage se paie au jalon `compte-`).
La séance ne met de poids que sur les adresses qui l'intéressent (les deux écarts réels en ENT-8.12, aucune en ENT-8.14).
**Limite à connaître** : sur une adresse à écart réel, l'élève qui a compté faux en tombant pile sur le nombre du système gagne le jalon
`recompte` (1,5 point) alors qu'il perd `compte` (1 point) ; l'élève qui a compté juste sans recompter n'a que 1 point. Ce n'est pas
exploitable (le comptage est à l'aveugle), mais c'est un peu injuste : si Tristan veut l'éviter, on peut équilibrer les poids (`compte` 1,5,
`recompte` 1 sur ces deux adresses).

---

## D. Les deux questions ouvertes du §10

**Un ou deux scans ?** Je recommande **deux scans, toujours dans le même ordre : la palette d'abord, l'emplacement ensuite** (en rangement, le
premier scan se fait en prenant la palette à la réception, le second dans la vue de près ; en transfert, pareil). C'est le geste réel d'un
terminal de mise en stock, ça ne coûte qu'un clic de plus, et le même ordre partout évite qu'un élève de CAP doive retenir deux façons de faire.

**Terminal vocal sans voix ou douchette dessinée ?** Je recommande **le même boîtier** (renommé « Terminal », sans voix), et le scan par **un
clic sur l'étiquette** dans la vue de près. Un seul objet que l'élève connaît déjà en ENT-8.12 et 8.14 ; une douchette serait un dessin de
plus à tenir lisible à 1366 × 768 sans rien apprendre de plus. À montrer sur la page d'essai, les deux variantes côte à côte.

---

## E. Découpage recommandé

Le découpage du brief tient **à quatre changements près** : (1) un **lot 0** préalable (entrepôt tiré par élève), sans lequel rien ne se
construit ; (2) « Valider qui fige » et `rendCopie` montent au lot 1 (ENT-8.13 en a besoin dès le soir) ; (3) le palettier est **un mode à part**,
dans son fichier ; (4) ENT-8.14 se fait par **phases** dans un seul entrepôt, comme ENT-8.13.

| Ordre | Lot | Dépend de | Durée (tests compris) | Ce qui prend le temps | Modèle |
|---|---|---|---|---|---|
| 1 | **0 — Entrepôt tiré par élève** (fonction de la graine et du niveau, modèle du quai ; base lisible par la vue) | — | 2 h – 2 h 30 | la suite entière (ENT-5.5, 5.6, 6.5-6.7 doivent rester verts), un cas « deux graines, deux plans » | Sonnet |
| 2 | **1 — Ranger à l'adresse donnée** (mode `palettier`, vue de près, cariste, « À monter », signaler, Valider qui fige, jalons, textes au « tu », réglage du capteur, page d'essai) | 0 | 5 – 6 h | la vue de près et ses trois boutons, les jalons éprouvés dans les deux sens, la page d'essai | **Opus** |
| 3 | **2 — Scanner** (mode « scanner » du terminal, nom réglable, `scan`, `ouSystemeCroit`, jalons) | 1 | 2 h 30 – 3 h | la page d'essai à deux variantes (D1, D2) à montrer à Tristan **avant** de figer | Sonnet |
| 4 | **4 — Compter à l'aveugle** (dessin des cartons sorti et réutilisé, scan, recomptage, `ecartsConfirmes`, jalons par rang, travée sans poids) | 0, 2 | 4 – 5 h | le test « rien du système dans la page, ni poids ni capteur », le dessin à compter sans hésiter | **Opus** |
| 5 | **3 — Adresse prise** (geste `occupe`, adresse libre, scan refusé, palette dans l'allée) | 1, 2 | 1 h 30 – 2 h | les trois chemins éprouvés | Sonnet |
| 6 | **5 — Le lendemain** (phases, état qui « ment », palette de Kevin, nuit, ouvertures, transfert) | 1, 2, 3 | 4 – 5 h | l'état de départ calculé depuis le soir de l'élève, les deux chemins | **Opus** |
| 7 | **6 — Évaluation** (copie, phases ranger → compter, aucun verdict dans la page, plans des deux sites) | tous | 2 h – 3 h (+ 1 h si 5 niveaux) | « aucun verdict dans le DOM », deux sites à 1366 × 768 | Sonnet |

**Total honnête : ≈ 22 à 26 h**, soit nettement plus que les 12-14 h de Cowork (qui n'avait pas vu le lot 0, les jalons à refaire `ok`/`ko`,
ni la fuite par les poids). Ce qui prend le temps n'est presque jamais l'écriture : ce sont les cas éprouvés dans les deux sens, les pages d'essai,
et la suite entière relancée à chaque lot (≈ 4 min 30 en parallèle, plusieurs fois).

**Version courte : lots 0, 1, 2 et 4, ≈ 14 à 16 h** → ENT-8.11 et ENT-8.12 se construisent. Elle laisse de côté : l'adresse prise et
l'adresse libre, le lendemain et le transfert (ENT-8.13 entière), la copie à phases et les plans par site (ENT-8.14 entière). Rien de ce qui
est fait n'est à refaire ensuite.

**Tests** : `outils/test/entrepot.mjs` fait déjà **2 886 lignes** ; je propose un **bloc nouveau** `outils/test/palettier.mjs`, ce qui veut dire
une ligne dans `BLOCS` et dans `GROUPES` de `outils/test.mjs` (**alerte 7** : à dire à Tristan). Aucun cas existant n'a besoin d'être réécrit.

---

## F. Risques pour l'existant

- **ENT-5.5 (rangement Smoby)** : aucun risque si le palettier est un mode à part ; le seul point partagé est la travée de face, à n'enrichir
  que de réglages absents par défaut. Les jalons propres d'ENT-5.5 (`contenus/smoby-ent55.js:220-238`) ne bougent pas.
- **ENT-5.6 (préparation)** : le seul risque est de **sortir le dessin des cartons** de la vue (`entrepot.js:1229-1256`) ; à faire sans changer
  une ligne du dessin (ses tests de préparation le vérifient).
- **ENT-6.5 / 6.6 / 6.7 (masse, comptage, picking)** : ils utilisent le terminal ; le nom réglable, le mode « scanner », le scan et le
  recomptage doivent être **absents par défaut** (même texte, même boîtier). Le bloc `entrepot` les couvre (sections à partir de
  `outils/test/entrepot.mjs:1290`).
- **Lot 0 dans `entreprise.js`** (2 506 lignes, fichier sensible : `docs/EN-COURS.md` rappelle « un seul chantier à la fois ») : toucher
  ≈ 14 endroits `VENT`, sur un modèle déjà écrit trois fois. Suite entière obligatoire.
- **Collisions d'ids de jalons** : aucune avec les ids existants des vues (`palette-P1`, `ligne-…`, `montage-…`, types de préparation :
  `entrepot.js:274`, `entrepot-picking.js:193-201`, `entrepot-masse.js:177`). `compte-M01` existe dans le contenu d'essai de la masse
  (`contenus/entrepot-masse-essai.js:118`), autre mode, autre séance : pas de conflit, et le préfixe `compte-` y a déjà le même sens. Le vrai
  problème est l'id **par adresse tirée** (voir plus haut) : passer aux rangs.
- **Charte** : Action est **bleue** (pas rouge) ; le vert plein reste réservé à « juste » (`styles/entrepot.css:9`, `:388`, `:422`). « À monter »
  et palettes confiées : trait ou bordure. Rien à craindre de plus.
- **Taille des fichiers** (lignes au 21/10) : `core/types/entrepot.js` **1 605**, `entrepot-visite.js` 878, `entrepot-masse.js` 752,
  `entrepot-picking.js` 632, `terminal.js` 351, `styles/entrepot.css` 460, `outils/test/entrepot.mjs` **2 886**, `core/types/entreprise.js`
  2 506. Tout mettre dans `entrepot.js` le mènerait vers **≈ 3 000 lignes** (SUPPOSÉ : +1 200 à 1 500) : d'où le fichier à part
  `entrepot-palettier.js`. `terminal.js` passerait à ≈ 500 lignes : raisonnable. Le bloc de tests à part évite que `entrepot.mjs` passe 3 000.
- **Feuille de route** : ce chantier n'a **pas de ligne** dans `docs/chantiers.md` (à ajouter au démarrage). Au passage, D-6 y est encore
  « en cours » alors que ses quatre lots sont livrés (`docs/chantiers.md:58`) : à remettre d'aplomb (doc seule).

---

## Décisions à prendre par Tristan avant d'écrire

1. **Lot 0 d'abord** : faire tirer le plan d'entrepôt par élève (comme le quai) — recommandé ; sinon, les quatre séances perdent leur tirage.
2. **Un mode à part `palettier`** plutôt qu'une option du rangement de Smoby — recommandé (ENT-5.5 ne court aucun risque).
3. **Phases dans un seul entrepôt** pour ENT-8.13 (soir / lendemain) et ENT-8.14 (ranger / compter) — recommandé ; autre option : plusieurs
   entrepôts par séance (plus de travail dans `entreprise.js`).
4. **Deux scans, palette puis emplacement**, partout dans le même ordre — recommandé ; autre option : l'emplacement seul. À trancher sur la page d'essai.
5. **Le même boîtier, renommé « Terminal », sans voix**, le scan par un clic sur l'étiquette — recommandé ; autre option : une douchette dessinée.
6. **Où coûte un signalement à tort** : la palette signalée à tort perd son jalon `place-` (recommandé) ; ou un jalon de garde « aucun
   signalement à tort » ; ou rien (trace seulement).
7. **La nouvelle adresse après un signalement juste est donnée par le terminal** (le système), Samia ne fait que commenter — recommandé ;
   autre option : par le message de Samia (risque de dire « bien vu » à un signalement faux).
8. **Le capteur de charge** : guidage et accompagné = la somme ; standard = « déjà posé » seul ; entraînement et évaluation = la plaque seule,
   sans capteur — recommandé ; à confirmer séance par séance.
9. **« Corriger » le rangement** : non, le rangement se fige à « Valider » (`finFige`) — recommandé ; autre option : ajouter l'écran
   « entrepôt » aux écrans qu'on rouvre (≈ 1 h dans `entreprise.js`).
10. **Règle `recompte`** : celle de la section C (jamais « à faire » après le comptage) — recommandée ; dire si les poids `compte` /
    `recompte` des deux écarts réels sont à équilibrer.
11. **Belleville à 4 niveaux** (autres plaques, autre nombre d'allées) — recommandé ; autre option : lever la limite à 5 et mesurer à l'écran (+ 1 h).
12. **Kevin monte les palettes** à la validation du rangement (rien à ajouter) — recommandé pour la version courte ; ou quand le message de
    l'élève est envoyé (une ligne dans `entreprise.js` pour que la vue lise la base).
13. **Corrections aux briefs** (Cowork) : charte d'Action bleue ; Kevin écrit en premier pour que l'élève lui réponde par phrases ;
    ids de jalons par rang ; `q-rupture` d'ENT-8.13 rebranchée sur un geste ; la palette laissée dans l'allée posée par Kevin pendant la nuit
    déclarée dans le lot 5.
14. **Version courte ou complète** : version courte (lots 0, 1, 2, 4 ; ≈ 14-16 h) pour ENT-8.11 et 8.12 d'abord — recommandé ; la suite
    ensuite, sans rien refaire.

---

## Résumé en dix lignes

1. Le palettier peut se construire, mais il manque un préalable que le brief ne voit pas : le plan d'entrepôt ne se tire pas par élève (lot 0, ≈ 2 h 30).
2. Je recommande un mode à part, `palettier`, dans son fichier : ENT-5.5 Smoby ne court alors aucun risque.
3. Le terminal d'ENT-6.6/6.7 sert sans voix, à trois retouches près (nom réglable, scan par clic, petit mode « journal » pour le rangement).
4. Un seul entrepôt par séance aujourd'hui : je propose des phases (soir/lendemain, ranger/compter) plutôt que plusieurs entrepôts.
5. Le dessin des cartons à compter existe déjà (préparation) : à sortir et réutiliser tel quel.
6. Fuite à l'aveugle : la travée affiche le poids de chaque palette, d'où l'on déduit le nombre de cartons ; à couper en comptage.
7. Les jalons doivent être nommés par rang (`compte-1`), pas par adresse tirée, et ne jamais rester « à faire » (sinon bilan bloqué).
8. La fiche des écarts, la rubrique `ecodroit`, les phrases calculées et `finFige` marchent déjà ; `rendCopie: false` est à ajouter à l'entrepôt.
9. Contradictions : charte d'Action bleue (pas rouge), Belleville à 5 niveaux (moteur limité à 4), Kevin doit écrire d'abord, capteur trop bavard.
10. Durée honnête ≈ 22-26 h (Opus pour les lots 1, 4, 5) ; version courte ≈ 14-16 h pour ENT-8.11 et 8.12 ; 14 décisions à prendre avant d'écrire.
