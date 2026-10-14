# Brief moteur — Vue « Dialogue à choix » (l'écran Téléphone) — pour Decathlon ENT-7.2 à 7.4, puis la 2de et le CAP

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/audit-architecture.md puis docs/briefs/MOTEUR-vue-dialogue.md. Fais d'abord l'état des lieux du §8 en lecture seule (questions.js, phrases.js, animation.js, entreprise.js, entreprise-options.js, declencheurs.js) et dis-moi ce que tu réutilises et ce qui est neuf. Annonce la durée avant de commencer. Commence par le lot 1 : la page d'essai cliquable avec l'appel au quai d'ENT-7.2, et attends que je l'aie essayée avant de brancher la vue dans le moteur.
> ```

**Statut** : livré (lots 1, 2 et 3, 14/10/2026)
**Date du brief** : 14/10/2026
**Conversation d'origine** : Cowork (Opus). Demande de Claude Code du 14/10 au matin : « l'appel au chef de quai a besoin d'un nouvel
écran Dialogue à choix ; le brief ENT-7.2 dit que Cowork doit d'abord écrire `MOTEUR-vue-dialogue.md` ». Décision 8 de Tristan
(06/10/2026, fiche `prepalog-decathlon-cadrage.md`) : C2.6.2 se travaille par **courriel + appel** — l'écrit pour ce qui engage, l'oral
pour s'organiser. La vue figurait déjà dans la liste des vues de la 2de (`prepalog-2de-hors-socle-et-vues.md`, vue n° 5 : « accueillir
un chauffeur, répondre à un client mécontent »).
**Modèle** : **Opus** (vue nouvelle du moteur). **Un seul chantier moteur à la fois** : s'inscrire dans `docs/EN-COURS.md`.
**Durée estimée** (à confirmer après l'état des lieux) : **≈ 3 h 30 à 5 h** en trois lots. Ce qui prend le temps : la page d'essai et
ses allers-retours avec Tristan, la suite de tests (un bloc neuf + les blocs voisins à garder verts). L'écriture de la vue elle-même est
la plus petite partie. **Version courte** : lots 1 et 2 suffisent à ENT-7.2 et 7.3 ; le lot 3 (évaluation, branches) peut attendre
ENT-7.4.

## 1. Ce que l'élève fait sur cet écran

Il **téléphone** à quelqu'un de l'entreprise ou d'une entreprise partenaire. L'interlocuteur parle (une bulle) ; l'élève choisit **ce qu'il
répond** parmi 2 à 4 répliques. Une réponse maladroite (trop familière, imprécise, fausse) fait **réagir l'interlocuteur comme le ferait une
vraie personne** (« Euh… bonjour. C'est qui, et c'est pour quoi exactement ? »), et l'élève répond à nouveau. Quand il a fini, il raccroche.

Ce qui est travaillé, c'est **la communication orale professionnelle** : se présenter, dire l'objet de l'appel, donner les bonnes
références, être précis sur une date et un moyen, conclure, avec le ton qui convient (tu poli à un collègue, vous à un client ou à un
prestataire). Ce n'est pas un QCM habillé : **l'appel doit se lire comme une conversation** (critère de validation de Tristan, brief 7.2 §10).

Premiers usages :

| Séance | Appel | Ce qui est particulier |
|---|---|---|
| ENT-7.2 (guidage) | au chef de quai de Rouvignies, pour le créneau | 4 répliques ; les textes justes sont **calculés** sur le conteneur de l'élève ; le planning du quai s'ouvre **après** l'appel |
| ENT-7.3 (aléa) | au même chef de quai, pour déplacer le créneau (`quai2`) | un 2e dialogue dans la même séance, sans planning ; une réplique « acceptée mais sèche » (elle fait avancer, mais compte comme une maladresse) |
| ENT-7.4 (évaluation) | au chef de quai de Dourges | **mode évaluation** : pas de réaction corrective, la première réponse compte ; le texte juste dépend de **l'offre que l'élève a commandée** |
| Plus tard (2de, CAP, autres séances) | accueillir un chauffeur, client mécontent, fournisseur en retard | parfois un **embranchement** (la suite dépend de la réponse) |

## 2. Les décisions qui encadrent le chantier

Règles de Tristan qui s'appliquent ici (CLAUDE.md, mémoire du projet) :

- **Jamais un élève bloqué** (« ce qu'il faut absolument éviter », 07/10/2026). En guidage, une réponse maladroite ne peut pas être choisie
  deux fois (elle se grise) : l'élève arrive toujours au bout. Quitter l'écran au milieu d'un appel ne perd rien (§4.6).
- **On dit QUE, jamais DE COMBIEN, et rien ne dit « juste » ou « faux » pendant l'appel.** L'interlocuteur réagit en personnage, il ne
  corrige pas (« Je ne le trouve pas, ce numéro. Relis-le sur ton avis. », pas « Mauvais numéro »). Le ✓ / ✗ n'arrive qu'au bandeau de
  fin, par groupe de jalons.
- **Les questions faciles à ajouter, modifier, retirer** (règle du 07/10/2026, valable pour les questions au fil) : ici aussi. La réponse
  rangée est la **clé** du choix (`v`), jamais son rang ; reformuler une réplique, changer l'ordre, en ajouter une ne change rien pour les
  élèves qui ont déjà joué. L'`id` d'un dialogue et d'une réplique ne change jamais.
- **Chaque élève a son ordre des réponses** (règle du 10/10/2026 contre les échanges d'information) : ordre tiré par élève, rangé, le même
  à chaque retour et sur tous les postes.
- **Correction après le premier bilan** (règle du 07/10/2026, séances de parcours) : l'élève peut **rappeler** ; le premier appel reste
  rangé ; la note moyennée est celle du moteur (`meta.correction`).
- **Textes calculés sur le travail de l'élève, figés à l'arrivée** (comme `selon` des questions au fil, 12/10/2026) : le numéro du conteneur,
  l'heure d'arrivée de son offre. Calculés **une fois**, quand la réplique arrive, et rangés : ils ne bougent plus.
- **Aucune minuterie ne déclenche quoi que ce soit** (décision de Tristan, `declencheurs.js`). Le petit délai avant la réponse de
  l'interlocuteur (§4.4) est un effet d'affichage, rien de plus : il ne compte pas, ne juge pas, ne fait rien arriver.
- **Une vue nouvelle n'existe que si le contenu la déclare** (alerte 13). Sans `telephone` dans `creerEntreprise`, rien ne change nulle part.
- **Tutoiement de l'élève par le site** (consignes, aides) ; dans le dialogue, le ton est celui **des personnages** (le chef de quai tutoie
  l'alternant, un client vouvoie) : c'est du contenu, la vue n'en sait rien.

Charte (CLAUDE.md, « Charte visuelle ») : **aucun aplat vert** (le vert plein ne dit que « juste »), aucune couleur fixe, variables sémantiques
seulement ; la maladresse ne se montre **pas en rouge** pendant l'appel (c'est la réaction du personnage qui la dit). Lisible en noir et blanc
(Tristan imprime en N&B ; un journal d'appel peut finir sur une trame) : interlocuteur et élève se distinguent par **la place** (gauche / droite)
et **la forme** de la bulle, pas par la couleur. Aucune image de personne, aucun visage (règle des entreprises réelles) : une **pastille avec
l'initiale** au plus.

## 3. Ce qu'on voit à l'écran

### 3.1 L'écran « Téléphone » (au repos)

Entrée de menu **« Téléphone »** dans « Mon poste » (libellé déclarable). Deux zones, sans défilement de page à 1366 × 768 et 1280 × 720 :

- **À gauche, les contacts** : une ligne par dialogue que la séance a ouvert (nom, détail : « Quai de réception — Rouvignies · poste 214 »),
  un bouton **« Appeler »**. Un contact dont l'appel est fini porte « Appel terminé » (et **« Rappeler »** seulement si la correction le
  permet, §4.7). Un contact pas encore ouvert n'apparaît pas (sa condition `quand(db)`, §5).
- **À droite, le journal** : le dernier appel lu comme une conversation (ce qui a été dit, dans l'ordre), ou, avant tout appel, une phrase
  de situation déclarée par la séance (« Appelle le quai pour réserver le créneau du conteneur. »).

### 3.2 Pendant l'appel

- **En-tête d'appel** : pastille à l'initiale, nom, rôle (« Mehdi, chef de quai »), mention « En communication ». **Pas de chronomètre**
  (il ferait croire que le temps est jugé).
- **Fil de la conversation** : bulles de l'interlocuteur à gauche, bulles de l'élève à droite, la plus récente en bas ; le fil défile
  **dans sa zone** (jamais la page), il se cale tout seul sur la dernière bulle.
- **Sous le fil, « Ta réponse »** : 2 à 4 boutons, un par réplique, ordre tiré. Une réplique déjà essayée et refusée est **grisée et barrée
  d'un trait** (« déjà dit »), non cliquable. Pas de bouton « Envoyer » : cliquer une réplique la dit.
- Quand la dernière réplique est dite, le bouton **« Raccrocher »** remplace les réponses (pas de raccrochage automatique : l'élève lit la
  dernière phrase de l'interlocuteur). Raccrocher ramène à l'écran au repos, journal ouvert.
- **Bouton « Raccrocher » pendant l'appel : non** (par défaut, §10 n° 2). Un élève qui change d'écran retrouve l'appel où il l'a laissé.

### 3.3 Ce que voit l'enseignant

Il navigue librement et **peut jouer l'appel sans que rien soit écrit** (comme les autres vues). Les réponses justes sont marquées pour lui
(comme l'animation). Dans le **Suivi**, l'infobulle du jalon donne une phrase de détail (« 2 reprises : références, arrivée ») ; le journal
complet de chaque appel de l'élève se lit dans sa base (fiche élève), premier appel compris.

## 4. Le comportement

### 4.1 Trois sortes de réponses

| Sorte | Déclaration | En guidage / entraînement | En évaluation |
|---|---|---|---|
| **juste** | `juste: true` | la réplique est dite, l'interlocuteur passe à la réplique suivante | idem |
| **maladroite** (reprise) | `reaction: '…'` | dite, puis l'interlocuteur **réagit** (bulle `reaction`) et **repose la même étape** ; la réplique se grise ; **compte 1 reprise** | dite, l'interlocuteur **enchaîne** sans corriger (§4.5) ; rangée comme première réponse |
| **acceptée mais maladroite** | `reaction: '…', accepte: true` | dite, l'interlocuteur réagit **et passe quand même** à la suite (ENT-7.3 : « Non. Salut. » → ton sec, l'appel se termine) ; **compte 1 reprise** | comme une maladroite |

Une réplique a **exactement un** choix juste (contrôlé). Un embranchement (§4.3, lot 3) peut en avoir un par branche.

### 4.2 Les reprises

- Une **reprise** = une réponse maladroite (acceptée ou non) dans un appel. Le compteur appartient à l'appel ; il est rangé avec lui.
- Le jalon de la séance lit le compteur (ENT-7.2 jalon 10 : « appel fini avec au plus 2 reprises ») ou la **première réponse** à une
  réplique (ENT-7.3 jalon 6 : la bonne nouvelle arrivée choisie ; ENT-7.4 jalon 7 : références et arrivée du premier coup). Les deux
  lectures sont fournies par le moteur (§6).
- **Jamais deux fois la même maladresse** : grisée après usage, elle ne peut pas recompter. Avec 4 réponses, une étape coûte au plus
  3 reprises, puis la juste reste seule : personne n'est bloqué.

### 4.3 Embranchements (lot 3, facultatif pour Decathlon)

Un choix peut porter `vers: '<id de réplique>'` : l'appel saute à cette réplique au lieu de la suivante (client mécontent : « Je comprends,
je regarde tout de suite » → la réplique « solution » ; « Ce n'est pas de notre faute » → la réplique « le client s'énerve »). Le moteur
contrôle à l'ouverture que chaque `vers` existe et que **toute** branche finit (pas de boucle sans issue). Sans `vers`, l'appel est linéaire
(tous les usages Decathlon).

### 4.4 Le rythme (effet d'affichage seulement)

La réponse de l'interlocuteur s'affiche après **≈ 0,7 s** avec trois points « … » (« il réfléchit ») ; les boutons sont inactifs pendant ce
temps (un double-clic ne dit pas deux répliques). **`prefers-reduced-motion`** : tout de suite, sans points (comme l'animation). Rien n'est
compté sur ce délai. Les tests passent `vitesse` (ou équivalent) pour ne pas attendre.

### 4.5 Le mode évaluation

Pris **automatiquement** quand la séance est une évaluation (`copie: true`, comme les autres vues), forçable par `mode` (§5).
- Aucune réaction corrective, aucun grisé : la première réponse cliquée est **la** réponse de la réplique, rangée.
- L'interlocuteur **enchaîne de façon neutre** : il dit la réplique suivante, précédée, si la séance le déclare, d'une phrase neutre propre au
  choix (`neutre: 'D'accord.'`) ; sinon rien. Il ne dit jamais rien qui révèle si c'était juste.
- Un seul appel ; pas de « Rappeler » ; après la remise de la copie, le journal se lit, rien ne s'écrit.

### 4.6 Quitter, revenir, recharger

- L'appel en cours est rangé **à chaque réplique dite** : changer d'écran, recharger la page, changer de poste → on retrouve l'appel à la
  même réplique, mêmes textes, même ordre des réponses. L'entrée de menu porte une marque « appel en cours ».
- Les **messages déclenchés** qui arrivent pendant un appel s'affichent comme d'habitude (carte de notification) sans couper l'appel.
- Les **questions au fil ne s'ouvrent pas pendant un appel** : leur panneau gèle l'écran de travail, ce qui couperait la conversation. Une
  question dont la condition devient vraie pendant l'appel attend que l'élève raccroche, puis arrive. (À faire dans `arriverQuestions` ou
  par un « verrou » que la vue publie : à choisir par Claude Code après l'état des lieux.)

### 4.7 La correction après le premier bilan

Séance avec `meta.correction` (ENT-7.2, 7.3) : quand le bandeau de fin liste le jalon d'un appel en ✗, **« Corriger »** rouvre l'écran
Téléphone sur ce contact avec un bouton **« Rappeler »**. Un nouvel appel commence de zéro (reprises à 0, ordre des réponses **retiré** pour
cet appel, textes recalculés à l'arrivée de chaque réplique) ; **le premier appel reste rangé** et lisible. Les jalons lisent **le dernier appel
terminé** ; le moteur fait la moyenne premier bilan / état actuel comme pour les fiches. Nouveau genre d'écran à rouvrir dans `corriger()` :
`'dialogue:<id>'` (à côté de `fiche:`, `planning:`, `phrases:`, `transfert:`). Un appel juste ne se rouvre pas.

### 4.8 Les gestes publiés

Pour les questions au fil, les déclencheurs (`apresGeste`) et les fermetures :

| Geste | Quand |
|---|---|
| `dialogue:<id>:appeler` | l'élève lance le premier appel |
| `dialogue:<id>:<réplique>` | l'élève a répondu (juste ou non) à cette réplique — **la première fois** seulement |
| `dialogue:<id>:fin` | l'élève a raccroché un appel fini (juste ou non) |

Ils entrent dans `signaux` de la vue : un geste cité par une question et inconnu empêche la séance de s'ouvrir (contrôle existant). Comme
tous les gestes, **ni l'ouverture de l'écran ni un clic sur un contact** ne sont des gestes de travail (règle du 03/10) — seuls « Appeler »
et les réponses le sont.

### 4.9 Enchaîner sur un autre écran (le planning du quai d'ENT-7.2)

La vue ne connaît pas le planning. La séance enchaîne avec ce qui existe : `fermetures: { planning: { ouvertSi: dialogueFini('quai'),
message: 'Appelle d'abord le quai.' } }`, ou un `quand` d'entrée de menu si l'état des lieux de 7.2 en ajoute un au planning (brief 7.2 §7
n° 4). Le moteur fournit la condition `dialogueFini(id)` (§6), sur le modèle d'`apresFiche`, dans `core/declencheurs.js`. La dernière réplique
du chef de quai (« Je t'ouvre le planning du quai de lundi… ») est du contenu.

## 5. Ce que la séance déclare

Une option de `creerEntreprise` (une ligne dans `OPTIONS` de `entreprise-options.js`, une ligne dans la table de `FICHE-SEANCE.md`). Nom
proposé : **`telephone`** (l'écran) qui porte **`dialogues`** (une liste) ; Claude Code peut proposer mieux. Exemple écrit pour ENT-7.2 :

```js
telephone: {
  libelle: 'Téléphone',                      // entrée du menu (défaut : « Téléphone »)
  quand: apresMail({ a: CONTARGO }),         // facultatif : l'entrée n'apparaît qu'une fois vrai (brief 7.2 : après le 1er courriel)
  situation: 'Appelle le quai de réception pour réserver le créneau du conteneur.',   // avant tout appel
  dialogues: [{
    id: 'quai',                              // clé de l'état, JAMAIS modifiée
    de: 'mehdi',                             // une personne de `equipe` / `questions.personnes` (nom, rôle, appel)
    contact: { nom: 'Quai de réception — Rouvignies', detail: 'poste 214' },
    quand: (db) => true,                     // facultatif : le contact n'apparaît qu'une fois vrai
    groupe: 'Appel au quai',                 // ligne du bandeau de fin (comme les jalons)
    repliques: [
      { id: 'accueil', dit: 'Quai de réception de Rouvignies, Mehdi, j’écoute.',
        choix: [
          { v: 'presente', juste: true,
            lib: 'Bonjour, c’est {prenom}, du transport amont. Je t’appelle pour réserver un créneau pour un conteneur.' },
          { v: 'camion', lib: 'Salut, c’est pour un camion.',
            reaction: 'Euh… bonjour. C’est qui, et c’est pour quoi exactement ?' },
          { v: 'place', lib: 'Tu as de la place lundi ?', reaction: 'De la place pour quoi ? Tu es qui ?' },
        ] },
      { id: 'refs', dit: 'D’accord. Tu as les références ?',
        choix: [
          { v: 'juste', juste: true, lib: 'Oui : conteneur …, ordre de transport …' },
          { v: 'inverse', lib: '…', reaction: 'Je ne le trouve pas, ce numéro. Relis-le sur ton avis.' },
          { v: 'collection', lib: 'C’est la collection printemps.',
            reaction: 'J’en reçois dix par semaine, de la collection printemps. Il me faut le numéro du conteneur.' },
        ],
        // Texte calculé sur la base de l'élève, UNE FOIS à l'arrivée de la réplique, puis rangé (comme `selon` des questions au fil).
        // Mêmes clés `v` pour tous ; ce que la séance déclare plus haut reste ce que voit l'enseignant hors contexte.
        selon: (db) => ({ libs: {
          juste: `Oui : conteneur ${noConteneur(db)}, ordre de transport ${OT}.`,
          inverse: `Oui : conteneur ${noPiege(db)}, ordre de transport ${OT}.` } }) },
      { id: 'arrivee', dit: 'Il arrive quand, et comment ?', choix: [ /* … */ ] },
      { id: 'cloture', dit: 'OK. Je t’ouvre le planning du quai de lundi : pose ton conteneur sur un créneau libre et envoie-le-moi.',
        choix: [
          { v: 'merci', juste: true, lib: 'D’accord, je le fais tout de suite. Merci !' },
          { v: 'salut', lib: 'C’est bon, salut !', reaction: '… Bon. Tu me l’envoies, le planning ?' },
        ] },
    ],
    fin: null,                               // facultatif : dernière bulle de l'interlocuteur après la dernière réponse (« Bonne journée ! »)
  }],
},
```

Règles de la déclaration, **contrôlées à l'ouverture de la séance** (message en français qui nomme le dialogue et la réplique ; la suite de
tests charge toutes les séances, une faute tombe là, jamais en classe) :

- `id` de dialogue et de réplique : `^[a-z0-9][a-z0-9-]*$`, uniques ; `de` : une personne connue (`equipe` ou `questions.personnes`) ;
- chaque réplique : `dit` (texte ou fonction de la base), 2 à 4 `choix`, clés `v` uniques, **exactement un** `juste: true` (sauf branches,
  lot 3), chaque choix non juste a une `reaction` (sauf en `mode: 'evaluation'`, où elle est facultative) ;
- `selon(db)` : essayée sur une base vide au chargement, elle ne doit pas planter et ne rend que des clés `v` existantes ;
- `{prenom}` (et seulement lui) est remplacé par le prénom de l'élève dans `dit`, `lib`, `reaction`, `neutre` ;
- champs facultatifs d'un choix : `accepte: true`, `neutre: '…'` (évaluation), `vers: '<réplique>'` (lot 3) ; d'une réplique :
  `melanger: false` (ordre déclaré), `actif: false` (mise de côté sans la supprimer) ; du dialogue : `mode: 'guidage' | 'evaluation'`
  (défaut : évaluation si `copie`, guidage sinon), `fin` ;
- plusieurs dialogues dans une séance (ENT-7.3 : `quai` puis `quai2`), chacun son état.

## 6. L'état, et ce que le moteur fournit aux jalons

**État** (cloisonné par séance, comme les gestes) : `db.dialogues[<séance>][<dialogue>]` =

```js
{ appels: [                                   // le premier = le premier essai ; la correction en ajoute un
    { debut, fin?,                            // heures ; `fin` absent = appel en cours
      ordres: { refs: ['collection', 'juste', 'inverse'] },   // ordre affiché, tiré à l'arrivée de la réplique
      textes: { refs: { dit, libs } },        // textes calculés et figés à l'arrivée (selon)
      pas: [{ r: 'accueil', v: 'camion', at }, { r: 'accueil', v: 'presente', at }, …],   // tout ce que l'élève a dit, dans l'ordre
      reprises: 1 } ] }
```

Graine de l'ordre : celle de l'élève (`graineDeBase`), plus le dialogue, la réplique et le **numéro de l'appel** (un nouvel appel, un nouvel
ordre). Rien n'est écrit pour l'enseignant ni après la remise de la copie. « Réinitialiser » (outil de l'enseignant) suit la règle des
questions au fil — **à vérifier dans `entreprise.js`** et à dire dans le compte rendu.

**Lectures fournies** (dans le module de la vue ; noms laissés à Claude Code, exportées pour les fichiers de séance et les corrigés) :

| Lecture | Rend | Pour |
|---|---|---|
| `dialogueFini(id)` (dans `declencheurs.js`) | condition `(db, seance) → booléen` : un appel de ce dialogue est terminé | `fermetures`, `quand`, déclencheurs |
| `appelRetenu(db, seance, id)` | le **dernier appel terminé** (ou `null`) | jalons |
| `reprises(appel)` | nombre de reprises de cet appel | ENT-7.2 jalon 10 |
| `premiereReponse(appel, replique)` | la clé `v` du premier choix dit à cette réplique | ENT-7.3 jalon 6, ENT-7.4 jalon 7 |
| `jalonDialogue({ id, … })` (facultatif) | un `verifier(db)` prêt à poser dans `etapes`, avec `ecran: 'dialogue:<id>'` et une phrase de détail pour le Suivi | toutes |

Règle des jalons (alerte « ne récompense pas l'inaction ») : **rien de vrai avant un appel terminé** ; un appel commencé et abandonné
reste « à faire ». Un jalon qui lit un dialogue absent de la séance plante à l'ouverture (contrôle des identifiants, comme les fiches).

## 7. Lots

1. **Lot 1 — La page d'essai cliquable** (règle de CLAUDE.md : un changement d'interaction se valide en cliquant, pas sur une capture).
   `outils/essai-dialogue.html`, qui **importe le vrai module de la vue** (`core/types/dialogue.js` ou nom proche) avec l'appel au quai
   d'ENT-7.2 écrit en dur (élève témoin : conteneur PLGU 418270 6, OT-2027-0142, n° piège PLGU 418720 6) et un **bouton de mode**
   (guidage / évaluation). Thème clair et sombre, 1366 × 768. **Tristan l'essaie et tranche le §10 avant le lot 2.** Page d'essai, pas du
   moteur : rien dans `core/types/entreprise.js` à ce stade.
2. **Lot 2 — La vue dans le moteur** : option `telephone` (`OPTIONS`, `FICHE-SEANCE.md`), entrée de menu et `quand`, état et
   reprise après rechargement, gestes et contrôle des gestes, questions au fil retenues pendant l'appel, lectures du §6, `dialogueFini`,
   genre `dialogue:<id>` dans `corriger()`, journal dans la fiche élève côté enseignant. Branchée sur une **séance d'essai**
   (`contenus/dialogue-essai.js`, comme `planning-essai.js`) — **pas sur ENT-7.2**, qui se construira ensuite avec son brief.
3. **Lot 3 — Évaluation et branches** : `mode: 'evaluation'` (§4.5), `neutre`, la copie ; `vers` et le contrôle « toute branche finit ».
   Nécessaire pour ENT-7.4 ; les branches pour la 2de (rien de Decathlon n'en dépend : peut glisser à plus tard si le temps manque, le dire).

## 8. État des lieux demandé (lecture seule, avant d'écrire)

- `core/types/questions.js` : personnes (`appel`, rôle), tirage de l'ordre (`hasard`), `selon` figé à l'arrivée, gel de l'écran pendant une
  question, `arriverQuestions` — **ce qui se réutilise tel quel** (personnes, tirage, `selon`) et comment retenir une question pendant un appel.
- `core/phrases.js` : le message par phrases à choisir (choix calculés une fois, ordre tiré et rangé) — même idée, autre support ; partager
  ce qui peut l'être sans toucher au comportement des séances de 2de.
- `core/types/animation.js` : bulles, `prefers-reduced-motion`, `premiere` écrite une fois — rien à réutiliser directement ? le dire.
- `core/types/entreprise.js` : où se branche une vue de menu (modèle le plus récent : `carteItineraires`, 13/10), `signaux`, `fermetures`,
  `corriger()`, `noteDuSuivi`, l'outil « Réinitialiser » ; `entreprise-options.js` ; `declencheurs.js` (`apresFiche` comme modèle).
- **`core/types/entreprise.js` est dans la liste « un seul chantier à la fois »** (EN-COURS) : vérifier qu'aucune autre session n'y travaille
  (le chantier « courriel étendu » d'ENT-7.2 y touchera aussi : **les deux ne se font pas en même temps**).
- Dire ce qui est neuf, ce qui est réutilisé, et si un point du brief contredit le code.

## 9. Tests attendus

Bloc **`dialogue`** (nouveau fichier `outils/test/dialogue.mjs`, une ligne dans `BLOCS` et dans `GROUPES` de `outils/test.mjs` (groupe le plus
léger) — **`outils/test.mjs` touché : le dire à Tristan**). Sur la séance d'essai :

- **Déclaration refusée**, avec un message qui nomme la faute : deux `juste`, aucun `juste`, clé `v` en double, maladroite sans `reaction` en
  guidage, `de` inconnu, `selon` qui plante sur une base vide, `selon` qui rend une clé inconnue, `vers` inconnu (lot 3), branche sans fin
  (lot 3), option `telephone` mal tapée (contrôle existant des options).
- **Parcours juste** : 0 reprise ; gestes `appeler`, `<réplique>`, `fin` rangés une fois ; `dialogueFini` vrai seulement après « Raccrocher ».
- **Maladresse** : la réaction s'affiche, **la même réplique** est reposée, le choix maladroit est grisé et ne se clique plus, 1 reprise ;
  `accepte` : réaction **et** réplique suivante, 1 reprise.
- **Jamais bloqué** : réplique à 4 choix, 3 maladresses de suite → la juste reste seule et fait avancer.
- **Textes figés** : le texte calculé par `selon` ne change plus si la base change après l'arrivée de la réplique ; `{prenom}` remplacé.
- **Ordre tiré** : le même après rechargement ; deux élèves → ordres différents sur au moins une réplique (sur 50 graines) ; un 2e appel →
  ordre retiré.
- **Quitter au milieu** : changer d'écran, recharger → même réplique, mêmes textes, même ordre, mêmes grisés ; marque « appel en cours » au menu.
- **Questions au fil** : une question dont le geste est `dialogue:quai:refs` n'ouvre son panneau **qu'après** « Raccrocher ».
- **Correction** : séance d'essai avec `correction` : jalon ✗ → « Corriger » → « Rappeler » ; le premier appel est **encore** rangé (un test de
  suppression nomme ce qui reste), le jalon lit le dernier appel, la note est moyennée.
- **Évaluation** (lot 3) : aucune réaction, aucun grisé, la première réponse est rangée et ne se change pas, l'appel enchaîne ; aucune
  correction affichée ; rien ne s'écrit après la remise.
- **Neutralité** : pendant l'appel, aucun texte du moteur ne contient « juste », « faux », « correct », « erreur » ; **aucun aplat vert** ni texte
  rouge dans la zone d'appel.
- **Ergonomie** : 1366 × 768 et 1280 × 720, appel de 6 répliques avec réactions : aucun défilement de page, le fil défile dans sa zone et montre
  la dernière bulle ; au clavier, Tab parcourt les réponses, Entrée / Espace dit la réplique, le focus revient sur la première réponse après
  le redessin (au clavier seulement) ; double-clic rapide → une seule réplique dite.
- **Enseignant** : peut jouer l'appel, rien n'est écrit dans la base de l'élève ni dans la sienne ; la juste est marquée pour lui.
- **Non-régression** : séances sans `telephone` inchangées (blocs voisins verts : `questions`, `fb-6.x`, `smoby`, `carte-region`).
- **Sabotages** (éprouver chaque test dans les deux sens) : jalon qui lit le **premier** appel au lieu du dernier → le cas « correction » doit
  tomber ; grisé retiré → le cas « jamais deux fois » doit tomber ; réaction affichée en évaluation → le cas « évaluation » doit tomber ;
  `selon` recalculé à chaque dessin → le cas « textes figés » doit tomber.

## 10. Questions ouvertes (valeur par défaut entre parenthèses) — à trancher sur la page d'essai

1. [ ] Une réponse maladroite déjà dite : **grisée et barrée** dans la liste, ou **retirée** de la liste ? (grisée : l'élève voit ce qu'il a
   déjà essayé ; retirée : plus léger à l'œil, mais on oublie ce qu'on a dit)
2. [ ] « Raccrocher » **pendant** l'appel (abandon, l'appel reprend de zéro au rappel) ? (non : un élève qui change d'écran retrouve l'appel où
   il était ; un raccrochage en cours d'appel compliquerait le compte des reprises)
3. [ ] Le **petit délai** avec « … » avant la réponse de l'interlocuteur : le garder (≈ 0,7 s) ou réponse immédiate ? (le garder : la
   conversation se lit mieux, c'est le critère « pas un QCM »)
4. [ ] Le journal de l'appel visible par l'élève **après** l'appel (relire ce qu'il a dit) ? (oui)
5. [ ] Contacts « leurres » : la séance peut-elle lister des contacts **sans dialogue** (Claire, Contargo…) qui répondent « messagerie vocale,
   rappelle plus tard » et dont l'appel est compté pour l'enseignant (choisir **qui** appeler fait partie de C2.6.2) ? (pas pour Decathlon ;
   à garder comme idée pour une séance future — rien à construire maintenant)
6. [ ] En évaluation, la phrase neutre entre deux répliques : déclarée par choix (`neutre`) ou **une seule phrase commune** (« D'accord. ») ?
   (par choix, facultative : rien si absente)
7. [ ] Nom de l'option et de l'écran : `telephone` / « Téléphone » ? (oui ; la vue s'appelle « dialogue » dans le code pour servir aussi à un
   échange en face à face, ex. chauffeur à l'accueil — l'habillage « appel » pourrait alors devenir une option `habillage: 'appel' | 'face'`,
   **pas maintenant**)

## 11. Ce que ce chantier ne fait pas

- Pas d'audio, pas de voix de synthèse, pas de saisie libre de l'élève (le texte libre, c'est le courriel, décision 18).
- Pas d'écran Courriel (chantier à part, brief 7.2 §7 n° 2), pas de planning à créneaux pris (7.2 §7 n° 4).
- Pas de contenu Decathlon dans le moteur : l'appel au quai n'existe que dans la page d'essai (lot 1) et, plus tard, dans
  `contenus/decathlon-ent72.js`.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

**Lot 1 livré le 14/10/2026** (lots 2 et 3 à faire) :
- **Fichiers créés / modifiés** : `core/types/dialogue.js` (la vue : contrôle, déroulé, lectures `appelRetenu`, `reprises`, `premiereReponse`,
  `leurresAppeles`), `styles/dialogue.css` (chargée par `index.html`, sans effet tant qu'aucune séance ne déclare `telephone`),
  `outils/essai-dialogue.html` (appel au quai d'ENT-7.2 en dur, réglages mode / rôle / prénom / « Rappeler » / thème, bouton « Ce que lit la note »).
- **Écarts par rapport au brief** : la position dans l'appel n'est pas rangée, elle se **déduit des `pas`** (plus solide au rechargement) ;
  le mode évaluation et `vers` (lot 3) sont déjà dans la vue (le contrôle « toute branche finit » ne suit que le chemin des bonnes réponses).
- **Décisions prises en route** : §10 tranché par Tristan (voir `docs/decisions.md`, 14/10) ; **contacts sans dialogue faits** (`leurres`,
  messagerie vocale), un mauvais numéro avant le bon **coûte des points** (combien : question 8 du brief ENT-7.2) ; contacts classés par
  ordre alphabétique ; un seul appel à la fois.
- **Tests** : vérifiés à l'écran (1366 × 768, 1280 × 720, clair et sombre, élève / enseignant, guidage / évaluation, clavier, double-clic) ;
  suite entière verte (1377). Le bloc `dialogue` (§9) s'écrit au lot 2.
- **Commits** : `ab93273` (lot 1), `7feac96` (contacts à messagerie vocale).
- **Reste ouvert** (à la fin du lot 1) : lot 2, lot 3.

**Lot 2 livré le 14/10/2026** (lot 3 à faire) :
- **Fichiers créés / modifiés** : `core/types/entreprise.js` (option `telephone` : entrée « Mon poste » avec `quand` et la marque
  « en cours », écran `telephone`, état `db.dialogues[<séance>]`, gestes de la vue dans les gestes connus, questions au fil retenues
  pendant un appel, genre `dialogue:<id>` dans `corriger()` et dans le compte des corrections, contrôle des dialogues cités,
  « Réinitialiser »), `core/types/entreprise-options.js` (ligne `telephone`), `core/types/dialogue.js` (lectures sur la base
  `dialogueDe`, `appelRetenuDe`, le jalon tout prêt `jalonDialogue`, `journalCourt` pour l'enseignant, `ouvrir`, `enCours`,
  `apresFin`), `core/declencheurs.js` (`dialogueFini(id)`), `core/prof.js` (colonne « Appels » du Repérage),
  `contenus/dialogue-essai.js` (séance d'essai, contenu construit, sans Decathlon), `outils/test/dialogue.mjs` (bloc neuf, 20 cas),
  `outils/test.mjs` (**touché** : une ligne dans `BLOCS`, une dans le groupe 4 de `GROUPES`), `activites/FICHE-SEANCE.md`.
- **Écarts par rapport au brief** :
  - les questions au fil sont retenues **dans `arriverQuestions`** (pas de verrou publié par la vue) ; le rattrapage du moteur aussi ;
  - `fermetures.ouvertSi` reçoit désormais **(db, séance)** (avant : db seul), pour que `dialogueFini` lise l'état cloisonné ; sans effet
    sur les séances existantes (elles ignorent le 2e argument) ; les `quand` du Téléphone reçoivent aussi la séance ;
  - le **journal pour l'enseignant** n'est pas une « fiche élève » (elle n'existe pas) : c'est une colonne « Appels » du Repérage (nombre
    d'appels, reprises ; au survol, appel par appel, les clés dites, ex. `accueil:salut accueil:presente`, et les autres numéros appelés).
    Il ne remonte qu'au raccrochage (aucune écriture de note à chaque réplique) ;
  - l'infobulle « 2 reprises : références, arrivée » sur le jalon du Suivi n'est pas faite : le Repérage donne la même chose ;
  - les gestes `dialogue:<id>:<réplique>` ne sont publiés qu'au **premier appel** (comportement du lot 1 : un rappel ne refait pas
    arriver une question).
- **Décisions prises en route** (une ligne dans `docs/decisions.md`) : « Réinitialiser » **garde les appels** (règle des questions au fil) ;
  « Rappeler » n'est offert qu'après « Corriger » (rangé, retrouvé au rechargement) ; pendant le rappel, le jalon reste celui du dernier
  appel terminé (le bandeau reste affiché, ✗).
- **Tests** : bloc `dialogue` 20/20 ; suite entière 1396/1396 (en parallèle). **Éprouvés dans l'autre sens** : jalon qui lit le premier
  appel → « correction » tombe ; grisé retiré → « maladresse » et « jamais bloqué » tombent ; texte recalculé au dessin → « textes figés »
  tombe ; questions non retenues → « questions au fil » tombe ; « Rappeler » toujours permis → « correction » tombe ; fermeture sans la
  séance → « parcours juste » tombe. Vu à l'écran (1366 × 768) dans le moteur. Non couvert : le mode évaluation dans le moteur (lot 3),
  la colonne « Appels » du suivi (seul `journalCourt` est testé).
- **À savoir pour ENT-7.2** : après l'appel, le bandeau de fin s'ajoute au-dessus et la page défile (pas pendant l'appel). Une séance qui
  a des pastilles d'étape ou un bandeau de questions pendant l'appel devra vérifier la hauteur (`--dlg-reserve` dans `styles/dialogue.css`).
- **Reste ouvert** (à la fin du lot 2) : lot 3.

**Lot 3 livré le 14/10/2026** :
- **Fichiers modifiés** : `core/types/dialogue.js` (mode évaluation pris de la copie dès le contrôle, `neutre` contrôlé, embranchements,
  contrôle « toute branche finit », « Relire l'appel » après la remise), `core/types/entreprise.js` (une ligne : la copie passée à la vue),
  `outils/test/dialogue.mjs` (4 cas de plus : 24), `activites/FICHE-SEANCE.md`.
- **Écarts par rapport au brief** :
  - un choix **maladroit qui porte `vers` fait avancer** (sinon l'exemple du brief, « Ce n'est pas de notre faute » → « le client s'énerve »,
    était impossible en guidage) ; il compte une reprise ; sa `reaction` devient facultative (la réplique visée parle) ;
  - **une seule bonne réponse par réplique** reste la règle (le brief parlait d'« un juste par branche » : c'est le cas, chaque réplique
    d'une branche a le sien) ;
  - « toute branche finit » = depuis **chaque réplique qu'on peut atteindre** (par n'importe quelle réponse), les bonnes réponses mènent au
    bout sans tourner en rond. Une boucle qui a une sortie par la bonne réponse est permise ;
  - en évaluation, un appel commencé mais pas raccroché au moment de la remise ne rapporte rien (règle « rien de vrai avant le raccrochage »,
    comme en guidage). À dire aux élèves d'ENT-7.4 : raccrocher avant de rendre.
- **Tests** : bloc `dialogue` 24/24 ; suite entière 1400/1400. Éprouvés dans l'autre sens : réaction affichée en évaluation → « évaluation »
  et « copie rendue » tombent ; contrôle depuis le début seulement → « contrôle des embranchements » tombe ; maladresse à `vers` qui n'avance
  pas → « embranchement » tombe ; « Relire » sans `data-libre` → « copie rendue » tombe ; copie non passée à la vue → « contrôle » tombe.
  La page d'essai du lot 1 marche toujours (vérifiée en évaluation). Non éprouvé : la garde de « Raccrocher » après la remise (le bouton
  n'est plus affiché, la garde est une deuxième sécurité).
- **Reste ouvert** : rien pour le moteur. ENT-7.2 à 7.4 se construisent avec leurs briefs ; l'habillage « face à face » (§10 n° 7) viendra
  avec la séance qui le demandera.
