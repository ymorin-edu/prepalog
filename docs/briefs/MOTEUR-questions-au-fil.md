# Brief de chantier — MOTEUR : questions au fil et notification de message

> **📋 Phrase à copier-coller dans Claude Code :**
>
> ```
> Lis docs/EN-COURS.md puis docs/briefs/MOTEUR-questions-au-fil.md en entier (les décisions du §4.0 et du §11 d'abord). Fais le lot 1 (notification qui reste), puis le lot 2 (point d'étape et questions au fil). Annonce la durée avant de commencer, et dis-moi si un point du brief contredit le code.
> ```
>
> Puis, dans une autre conversation : `… fais le lot 3 (signaux de geste)`, puis `… fais le lot 4 (réponses de la classe)`.

**Statut** : **livré, vue validée par Tristan le 09/10/2026** (page d'essai `outils/essai-questions.html`) ; lots 1 à 4 livrés le 08/10/2026 (lot 4 : à revoir avec une vraie séance à questions, ENT-6.1). Questions du §11 tranchées le 07/10 au soir. Révisé le 07/10 à 21 h 45 (deux sortes de questions, plus de « Plus tard », travail gelé, souplesse). Révisé le 08/10 à 8 h (sorties de page, §4.8 bis ; trois règles d’écriture contre le copier-coller, dont les questions d’éco-droit, §7).
**Date du brief** : 07/10/2026 (soir).
**Auteur** : Claude (conversation Cowork, Opus), d'après la lecture du code de `main` au commit `d024f17`, du brief
`FRANCE-BOISSONS-refonte.md` (décisions du 07/10, 21 h) et du lot C de `SMOBY-retours-classe-5.1.md`.
**Page d'essai cliquable** : `G:\Mon Drive\Travail\Logistique\1L\Claude outputs\essai-questions-au-fil.html`
(copie dans `docs/briefs/questions-au-fil/`). **Version 2** : elle rejoue une ENT-6.2 simplifiée avec une question au
fil (le travail se gèle), un point d'étape entre le bon et la réponse à Malo, et une question de réflexion ; des réglages
en haut font basculer les choix encore ouverts du §11.
**Modèles** : **Opus** pour les lots 1 à 3 (vue nouvelle du moteur, `core/types/entreprise.js`). **Sonnet** pour le lot 4.
**Rien n'a été essayé dans le site** : tout ce qui suit vient du code et de la page d'essai.

---

## 0. Ce que Tristan a décidé (rappel)

1. **07/10, après le test en classe d'ENT-5.1** : les élèves ont du mal à suivre en même temps la trame papier et
   l'écran. Les questions de la trame passent **à l'écran, au moment du geste**, dans une **vue nouvelle**. Valable pour
   **tous les scénarios** (lot C de `SMOBY-retours-classe-5.1.md`). Exemple donné par Tristan : une question surgit
   quand l'élève ouvre un CV, ou après avoir rempli une ligne du tableau de tri.
2. **07/10, 21 h (France Boissons et la suite)** : la trame ne sert plus que de brouillon pour les étapes compliquées
   et de cours pour réviser ; **plus de textes à trous, plus de corrigé de trame** ; le corrigé passe à l'écran.
3. **07/10, 21 h 05** : ce chantier passe **en premier**, avant « jugé au premier essai » (lot 3 de
   `SMOBY-notation-5.3-5.8.md`) et avant les séances FB.
4. Règles qui s'appliquent ici :
   - **jamais un élève bloqué** en fin de séance (règle absolue du 07/10) ;
   - un déclencheur ne dépend **jamais d'une réponse juste** et **rien ne se déclenche au hasard d'un clic de menu**
     (décision du 03/10, `MOTEUR-messages-en-cours-de-seance.md` §2) ;
   - **premier bilan** et « Corriger » (séances `correction: true`) ;
   - le site **tutoie** l'élève ; un collègue le tutoie, une personne extérieure le vouvoie ;
   - **un jalon ne se juge jamais pendant la frappe** (quota Firebase).

---

## 1. Ce que dit la recherche (résumé, sources en fin de brief)

| Constat | Ce qu'on en tire pour Prepalog |
|---|---|
| Des **questions glissées au fil** d'un cours en ligne divisent par deux environ les moments où l'esprit décroche, triplent la prise de notes et améliorent le test final (Szpunar, Khan et Schacter, Harvard, 2013). | Poser **peu** de questions, mais **pendant** le travail, pas à la fin. C'est exactement le problème vu en classe avec la trame. |
| Dans un jeu éducatif, **choisir une raison dans une liste** améliore nettement le transfert ; **écrire** sa raison n'apporte rien et casse le rythme du jeu (Johnson et Mayer, 2010 : effet fort en choix, nul en écriture). | Les questions de réflexion se font **en choix** par défaut. Le texte libre reste possible, rare. |
| Ajouter des questions à un jeu **aide ou gêne** selon la question : les meilleures font le lien entre ce que l'élève fait et le vocabulaire du métier, les trop simples ou trop abstraites ne servent à rien (O'Neil, Mayer et coll., 2014). | Une question porte sur **ce que l'élève vient de faire** (« ton bon de commande »), jamais sur une généralité. C'est déjà la règle des trames (fiche « trames élève » : « pourquoi as-tu… », une question à la fois). |
| En formation par scénario, la question vient d'**un personnage de l'histoire** et demande **quoi faire ou quoi dire**, pas quelle étiquette coller ; la meilleure correction **montre la conséquence** plutôt que de faire la leçon (Cathy Moore). | La question est posée **par un collègue** (Karim, Inès, Sophie…), comme un message qui arrive. Son retour dit ce qui se passe dans l'entrepôt (« une erreur sur ton bon, c'est une erreur dans le camion »). |
| Le **suivi discret** (« stealth assessment », Shute) : on juge l'élève sur ce qu'il fait dans le jeu, sans le sortir du jeu. | Une question au fil reste **dans l'écran de l'entreprise** : pas de questionnaire à part, pas de changement de page. |
| Accessibilité : une bulle qui **disparaît toute seule** au bout de quelques secondes est un défaut connu (WCAG 2.2.1, « temps réglable ») ; une notification ne prend pas le focus d'elle-même ; un bouton à l'intérieur doit être atteignable au clavier (A. Roselli, S. O'Hara). | La notification d'un message ou d'une question **reste** jusqu'à ce que l'élève l'ouvre ou la ferme. C'est le lot 1. |

---

## 2. Ce qui existe déjà dans le moteur (lu le 07/10)

- **Messages qui arrivent en cours de séance** : `volet.declencheurs` (`core/types/entreprise.js` ~l. 395-433), vérifiés
  à chaque `sauver()` et à l'ouverture ; une seule fois (marque `db.volets['<volet>#<id>']`).
  Conditions toutes faites dans `core/declencheurs.js` : `apresJalon`, `apresMail`, `apresPlanning`, `apresFiche`, `tous`.
- **Annonce d'un message** : une seule bulle pour tout le site (`toast()`, `core/ui.js`), **2,6 s** puis elle
  disparaît ; une pastille sur « Messagerie ». Seule la **tournée** affiche un vrai bandeau « Nouveau message » qui
  reste (`tour-notif`, `core/types/tournee.js` ~l. 836).
- **Questions à choix qui gardent la première réponse** : la vue animation (`core/types/animation.js` :
  `premiere` écrit une fois, ordre des choix tiré par élève et rangé, enseignant qui voit la bonne réponse sans rien
  écrire, `etapesAnimation(A)` = un jalon par question). **C'est le modèle à reprendre** pour l'état et les jalons.
- **Questionnaire à l'écran de Spartoo ENT-1.1** : une fiche à `choix` + `fermetures`. Il reste un écran à part : ce
  n'est pas une question « au fil ».
- **Jalons pondérés et groupés** (`poids`, `groupe`, `ecran`), **premier bilan**, bandeau ✓ / ✗, « Corriger »
  (`activites/FICHE-SEANCE.md`, « Jalons pondérés et groupés »).
- **Repérage** : `db.indicateurs[séance]` (temps, aides, `premier`), survit à « Réinitialiser » ; `detail.titres`
  remonte au Suivi.

---

## 3. Lot 1 — la notification qui reste (moteur, Opus, ≈ 2 h avec les tests)

### Ce que voit l'élève (page d'essai, réglage 1, choix A)

- Quand un message déclenché arrive, une **carte** apparaît **en haut à droite**, sur **tous les écrans** :
  « ✉ Nouveau message — **Inès** · Bon de commande reçu — [Lire le message] [×] ».
- Elle **reste** : au bout de 8 secondes, elle se **réduit à une ligne** (« ✉ Inès · Bon de commande reçu ») pour
  moins cacher l'écran, toujours cliquable. Elle part quand l'élève ouvre le message (par la carte ou par la
  messagerie) ou la ferme (×).
- **Trois cartes au plus** ; au-delà, une ligne « … et 2 autres : voir Messagerie ».
- La pastille de « Messagerie » ne change pas.
- La bulle reste pour les **confirmations** (« Fiche envoyée. », « Réponse envoyée. ») : elles n'ont pas besoin de
  rester. La règle du 03/10 « Réponse envoyée. Nouveau message : … » dans une seule bulle n'a plus lieu d'être : la
  confirmation va dans la bulle, l'arrivée dans une carte.

### Ce qu'il faut construire

1. Une **pile de cartes** propre au moteur des entreprises (un élément `role="status"` présent dès l'ouverture, qui ne
   prend jamais le focus tout seul), alimentée par `declencher()` à la place de
   `toast('Nouveau message : …')` (~l. 431) et des deux autres appels du même genre (~l. 2189, 2208).
2. **Ce qui est affiché vient de la base** : une carte = un mail déclenché (`m.declenche`) **non lu** et non fermé.
   La fermeture est un choix d'affichage (comme `E`, hors de la base) : à la réouverture de la séance, les messages
   non lus réapparaissent en cartes réduites. Rien de plus n'est écrit en base (quota).
3. **La tournée** : son bandeau « Nouveau message » est **retiré**, la carte le remplace (un seul mécanisme, Q2).
4. Charte : bord gauche **ambre** (`--terre`), jamais vert (le vert plein ne dit que « juste ») ; fond `--panneau` ;
   ombre ; les trois thèmes ; mouvement réduit = pas d'animation d'entrée. Charte d'entreprise rouge ou verte :
   la carte est dans la zone de travail, elle prend l'encre (`ent-travail-neutre`).
5. Les mêmes cartes servent au lot 2 (« ? Question — **Karim** · Une question pour toi — [Répondre] »).

### Tests (bloc `cdiscount` pour ENT-2.1, bloc `boost` pour ENT-3.2)

- ENT-2.1 : envoi « Stock actuel : 5 » → **deux cartes** (service retours, quai), toujours là après 10 s (horloge
  simulée `page.clock`), réduites ; clic sur une carte → le message s'ouvre, la carte part ; l'autre reste.
- ENT-3.2 : la carte remplace le bandeau de la tournée ; l'imprévu arrive une seule fois.
- Remontage de la séance : un message non lu revient en carte réduite ; un message lu ne revient pas.
- **Cas réécrits (alerte 7)** : les 9 endroits des blocs `boost` et `cdiscount` qui lisent « Nouveau message » ou
  `tour-notif` (à relire un par un ; le dire à Tristan).
- Sabotages : carte qui disparaît au bout de 2,6 s ; carte pour un message déjà lu ; carte qui prend le focus.

---

## 4. Lot 2 — les questions : point d'étape et au fil (moteur, Opus, ≈ 6 à 7 h avec les tests)

### 4.0 Décisions de Tristan (07/10/2026, 21 h 34 et 21 h 36)

1. **Deux sortes de questions**, qu'une même séance peut mélanger (chaque question dit la sienne) :
   - **transition** : sur un **écran intermédiaire** (« point d'étape ») entre deux écrans de travail ; les questions
     **préparent l'écran suivant** ;
   - **au fil** : la question arrive **pendant la manipulation**, au moment du geste.
2. **Pas de « Répondre plus tard »** : une question ne reste jamais en suspens tout l'exercice.
3. **Pendant une question au fil, l'élève regarde mais ne touche pas** : le panneau reste ouvert et le suit d'un écran à
   l'autre ; il peut consulter le stock, les documents, les messages et son propre travail pour répondre ; tout geste
   de travail (saisir, envoyer, valider, poser) est **gelé** jusqu'à sa réponse.
4. **« À l'usage, je vais ajouter, modifier, retirer des questions » : le code doit être souple** (§4.6). Ajouter,
   reformuler, remettre dans un autre ordre ou retirer une question = modifier **un seul fichier de données**, sans
   toucher au moteur ni à la séance, et sans abîmer le travail ou la note d'un élève.

### 4.1 Question de transition : l'écran « point d'étape » (page d'essai : après l'envoi du bon)

1. Un geste de travail est fini (le bon est envoyé, juste ou faux).
2. Une carte annonce « ? Point d'étape — **Inès** · Point d'étape avant de répondre à Malo — [Y aller] » ; une entrée
   « Point d'étape » apparaît dans le menu, et le bouton de l'écran qu'on vient de finir devient « Continuer : point
   d'étape avec Inès → ».
3. L'écran : une phrase de situation du collègue (« J'ai bien ton bon. Avant que tu répondes à Malo, deux questions… »),
   puis **1 à 3 questions** les unes sous les autres (« Question 1 sur 2 »), chacune avec son bouton « Répondre » et son
   retour (§4.3).
4. **L'écran suivant reste fermé** tant que les questions n'ont pas de réponse : « Répondre à Malo » affiche
   « 🔒 Fais d'abord le point d'étape avec Inès. [Y aller] ». Le moteur sait déjà griser un écran (`fermetures`,
   ENT-1.1) ; ici, il faut aussi pouvoir fermer **un geste** dans un écran (le bouton « Répondre » d'un mail), d'où
   une petite extension de `fermetures` (§4.5).
5. « Continuer : répondre à Malo → » s'active dès que toutes les questions ont **une réponse, juste ou fausse**.
   **Une réponse fausse ne bloque jamais** : l'élève voit la correction et continue.

### 4.2 Question au fil : pendant la manipulation (page d'essai : au premier choix de « Remplacement »)

1. L'élève fait un geste (il choisit un remplacement, **quel qu'il soit**).
2. Le **panneau s'ouvre tout de suite** à droite (pas de carte : il faut répondre maintenant) : « Karim te pose une
   question », la question à la 1re personne, 2 à 4 choix, [Répondre] et « Une seule réponse compte : la première. »
3. En haut de l'écran : « **Karim te pose une question** (à droite). Tu peux regarder le stock, les messages et ton
   travail ; tu reprends ton travail dès que tu as répondu. » Les champs et les boutons de travail sont **grisés**.
4. Le menu reste utilisable : l'élève peut ouvrir Stock, Messagerie, un document ; **le panneau le suit**.
5. Après la réponse : retour (§4.3), puis « **Reprendre mon travail** » ferme le panneau et dégèle l'écran.
6. Le panneau ne se ferme pas autrement (pas de ×, pas d'Échap, pas de « Plus tard »).

### 4.3 Le retour après la réponse

- **Question notée, proposé (A)** : ✓ « C'est ça. » (texte vert) ou ✗ « Pas tout à fait. » (texte rouge), puis la parole du
  collègue qui explique. La note porte sur la **première réponse**, figée ; pas de « Répondre de nouveau ».
- **B, question par question** (`apres: 'bilan'`) : « Merci, je note. On en reparle à la fin de la séance. » ; le ✓ / ✗ et
  l'explication n'apparaissent qu'au bilan. **Pour toute question au fil posée avant un envoi qu'elle pourrait
  corriger d'avance** (sinon l'explication donne la réponse que l'élève va saisir). Le moteur ne peut pas le deviner :
  c'est le brief de séance qui le dit.
- **Question pour réfléchir** (non notée) : « Pour réfléchir : il n'y a pas une seule bonne réponse, choisis la
  tienne. », des raisons à choisir, puis « Ce qu'en pense Karim : … ». Jamais ✓ ni ✗. Texte libre possible question par question (`libre: true`, Q5), en exception.
- **Évaluation (`copie`)** : « Merci, je note » pour toutes ; elles comptent dans la copie (Q6).
- **« Corriger »** ne rouvre jamais une question ; le bandeau de fin le dit. **« Réinitialiser »** n'efface pas les
  réponses (sinon on effacerait une mauvaise première réponse).

### 4.4 Ce que voit l'enseignant

- Il voit les questions comme l'élève, la **bonne réponse marquée** (trait vert pointillé, « bonne réponse »), il n'est
  jamais gelé, et **rien n'est écrit** pour lui (comme l'animation).
- Les premières réponses remontent avec la note ; la vue par classe est le lot 4.

### 4.5 Ce que la séance déclare

Les questions d'une séance vivent dans **un fichier de données à part**, `contenus/questions/ENT-6.2.js` (§4.6) :

```js
// contenus/questions/ENT-6.2.js — les questions de la séance. Modifier ce fichier suffit (voir activites/FICHE-SEANCE.md).
export const QUESTIONS = {
  part: 4,                         // points de la note sur 20 réservés aux questions notées (§4.6)
  etapes: [                        // les écrans « point d'étape »
    { id: 'avant-malo', de: 'Ines', apres: apresFiche('bon-commande'), ferme: 'repondre:malo',
      situation: 'J\'ai bien ton bon, merci. Avant que tu répondes à Malo, deux questions…',
      questions: ['qui-utilise-le-bon', 'ce-que-malo-attend'] },
  ],
  liste: [
    { id: 'ou-verifier', type: 'fil', de: 'Karim', quand: apresGeste('fiche:bon-commande:remplace'),
      enonce: 'Je te vois choisir un remplacement pour Malo. Où vérifies-tu ce qu\'on peut vraiment lui livrer ?',
      choix: [{ v: 'stock', lib: 'Dans le stock de Buchelay' }, { v: 'mail', lib: 'Dans le mail de Malo' },
              { v: 'fiche', lib: 'Sur la fiche client' }, { v: 'malo', lib: 'Je demande à Malo ce qu\'il préfère' }],
      juste: 'stock', apres: 'bilan',            // posée avant l'envoi : correction au bilan seulement
      retour: 'Le client dit ce qu\'il veut ; le stock dit ce qu\'on a…',
      groupe: 'Question de Karim : où vérifier' },
    { id: 'qui-utilise-le-bon', type: 'transition', de: 'Ines', enonce: '…', choix: [ … ], juste: 'prepa',
      retour: '…', groupe: 'Point d\'étape : qui utilise ton bon' },
    { id: 'vides-manquants', type: 'fil', de: 'Karim', quand: apresMail({ a: MALO.mail }),
      reflexion: true, enonce: '…', choix: [ … ], retour: 'Ce qu\'en pense Karim : …' },
  ],
};
```

- `de` renvoie à une personne de la séance (`EQUIPE`) : nom, fonction, tu ou vous.
- **Chaque choix a une clé courte `v`** : c'est elle qui est rangée dans la base de l'élève, jamais un rang. On peut
  donc reformuler un choix, en changer l'ordre ou en ajouter un sans fausser les réponses déjà données (§4.6).
- L'ordre d'affichage des choix est tiré par élève et rangé (comme l'animation), sauf `melanger: false`.
- `ferme` : ce que le point d'étape garde fermé jusqu'à ses réponses, au choix un écran du menu (`'ecran:planning'`,
  comme `fermetures`) ou un geste nommé (`'repondre:malo'` : le bouton « Répondre » d'un mail). Petite extension de
  `fermetures`, dans le même esprit.
- La séance branche le tout en une ligne : `creerEntreprise({ …, questions: QUESTIONS })`. **Les jalons des questions
  notées sont ajoutés par le moteur lui-même** (la séance n'a pas à les recopier dans `etapes`).

**Contrôlé au chargement** (la séance ne s'ouvre pas, message clair qui nomme la question) : `id` en double ; clé `v`
en double ; `juste` qui n'est pas une clé des choix ; question de réflexion avec un `juste` ; question au fil sans
`quand` ; question de transition qu'aucun point d'étape ne cite ; point d'étape qui cite une question inconnue ; moins
de 2 ou plus de 4 choix ; `de` inconnu ; `part` absente alors qu'il y a des questions notées. La somme « jalons de la
séance + `part` » doit valoir 20 (le contrôle existe déjà).

### 4.6 La souplesse : ajouter, modifier, retirer une question (décision 4)

| Ce que Tristan veut faire | Ce qu'il faut changer | Ce qui arrive aux élèves |
|---|---|---|
| **Reformuler** une question ou un choix | le texte dans `contenus/questions/ENT-x.y.js` | rien : la réponse rangée est la clé `v`, pas le texte |
| **Changer l'ordre** des choix | l'ordre dans le fichier | rien (même raison) |
| **Ajouter un choix** | une ligne `{ v, lib }` | rien |
| **Changer la bonne réponse** (`juste`) | une clé | les élèves **qui ont fini gardent leur note** (`meilleur`, déjà en place) ; ceux en cours sont jugés sur la nouvelle |
| **Ajouter une question** notée | un bloc dans `liste` (et la citer dans un point d'étape si c'est une transition) | **la note ne change pas d'équilibre** : la `part` des questions est partagée entre elles. Un élève en cours la reçoit si son geste n'a pas encore eu lieu, sinon par le rattrapage (§4.7) ; un élève qui a fini garde sa note |
| **Retirer** une question | supprimer son bloc | sa réponse reste rangée mais n'est plus lue ; la `part` se répartit entre les autres |
| **Mettre de côté** sans effacer | `actif: false` | comme retirer, mais le texte reste dans le fichier pour plus tard |
| **Changer le poids** des questions dans la note | `part` (et le poids des autres blocs de la séance) | la somme vaut 20, contrôlée au chargement |
| Donner plus de poids à **une** question | `poids: 2` sur elle (1 par défaut) : elle compte double **dans** la `part` | idem |
| **Passer** une question de « au fil » à « transition » | `type` (et la citer dans un point d'étape) | sa réponse déjà rangée est gardée |

Règles qui rendent cela sûr :
- l'**`id` d'une question ne change jamais** (comme l'`id` d'une séance) : c'est sa clé dans la base ; pour une question
  vraiment nouvelle, un nouvel `id` ;
- **pas de numéro** dans les textes affichés à l'élève (« Question 1 sur 2 » est calculé) ;
- un **test générique** charge **tous** les fichiers `contenus/questions/*.js` et vérifie les contrôles du §4.5 : une
  faute de frappe tombe dans la suite, jamais en classe ;
- `activites/FICHE-SEANCE.md` reçoit une section « Modifier les questions d'une séance » qui reprend ce tableau, pour que
  la demande « retire la question 2 de 6.4 » se fasse en Sonnet, en quelques minutes ;
- les **séances déjà jouées** suivent la règle du 06/10 : ceux qui ont fini gardent leur note.

### 4.7 Quand une question arrive, et le rattrapage

Même machine que les messages déclenchés : la condition `quand(db)` (au fil) ou `apres(db)` (point d'étape) est
vérifiée à chaque `sauver()` et à l'ouverture ; **une seule fois** (marque rangée avec l'état).

- **Juste ou faux, peu importe** : jamais une condition qui lit le contenu d'une réponse.
- **Pas avant le piège** : une question ne doit pas éclairer d'avance un geste à venir, ou alors `apres: 'bilan'`.
- **Jamais l'ouverture d'un écran ou d'un document** (règle du 03/10, confirmée pour les questions : Q4). Exemple du
  CV : la question vient quand l'élève le classe dans le tableau de tri, pas quand il l'ouvre.
- **Une à la fois** : si une question au fil arrive pendant qu'une autre attend, elle passe après.
- **Rattrapage, pour qu'aucun élève ne reste bloqué** : si le geste d'une question au fil n'a jamais eu lieu (l'élève a
  envoyé son bon sans toucher au remplacement), la question arrive **au geste suivant qui clôt l'écran** (l'envoi), et
  au plus tard quand tous les autres jalons sont jugés. Un point d'étape arrive toujours, puisque son déclencheur est
  un envoi du parcours. Une question ne peut donc jamais empêcher le premier bilan.
- **Le gel ne bloque jamais la fin** : il ne dure que le temps de répondre, et répondre est toujours possible.

### 4.8 L'état dans la base de l'élève, la note, le Suivi

- `db.questions[<id de la séance>][<id de la question>] = { arrivee, premiere: 'stock', duree, libre? }`, **cloisonné par
  séance** ; `premiere` = **clé** du premier choix, écrite une fois ; `duree` = secondes entre l'arrivée et la réponse.
- **Écritures** : une à l'arrivée, une à la réponse ; 2 à 6 questions par séance : 4 à 12 écritures de plus par élève.
  Rien pendant que l'élève hésite.
- Jalons ajoutés par le moteur : un par question notée active, poids = `part × poids / somme des poids`, groupe = son
  `groupe` ; « à faire » tant qu'elle n'a pas de réponse ; jamais d'`ecran` (« Corriger » ne la rouvre pas).
- `detail.indicateurs[séance].questions` remonte avec la note : aucun champ Firebase nouveau, **aucune règle à
  publier**.

### 4.8 bis Les sorties de page pendant une question (décision de Tristan, 08/10/2026)

Constat de Tristan (08/10) : les élèves copient la question et la collent dans un nouvel onglet (moteur de recherche,
IA). On ne peut pas l'empêcher tout à fait (le téléphone reste possible) : on le rend **visible à l'enseignant**.
Les deux autres parades retenues sont des règles d'écriture (§7) ; le blocage du copier-coller n'est **pas** retenu.

- **Ce qui compte comme une sortie** : tant qu'une question (de transition ou au fil) est ouverte et sans réponse,
  l'onglet passe en arrière-plan (`visibilitychange` → `hidden`), ou la fenêtre perd le focus **plus de 3 secondes**
  (`blur` puis `focus` : le seuil évite de compter un clic dans la barre d'adresse). Une sortie = un aller-retour.
- **Rangé avec la question** : `sorties` (nombre) et `horsPage` (secondes cumulées) dans
  `db.questions[<séance>][<question>]`, écrits **avec la réponse** : aucune écriture de plus. Une sortie après la réponse
  ne compte pas.
- **Ce que voit l'élève** : au retour, une ligne dans le panneau de la question, en texte (pas d'aplat, pas de rouge) :
  « Tu as quitté la page pendant la question : ton enseignant le verra. » Rien d'autre : pas de blocage, pas de
  minuteur, **aucun effet sur la note**.
- **Ce que voit l'enseignant** : dans le Repérage et l'infobulle du Suivi, une ligne par séance quand il y a eu au moins
  une sortie : « a quitté la page pendant 2 questions (3 fois, 1 min 40) », et, dans le détail, les questions concernées.
  Remonte avec `detail.indicateurs[séance].questions` (rien de neuf côté Firebase, **aucune règle à publier**).
  Rien pour l'enseignant connecté lui-même. Jamais dans une vue projetable sous forme de classement.
- **À dire aux élèves** (Tristan, en classe) : le site note les sorties de page pendant une question. Donnée limitée
  au strict nécessaire (un compteur et une durée, pas l'adresse visitée : le site ne peut pas la connaître).
- **Tests** (dans le bloc `questions`) : question ouverte, onglet caché puis montré → `sorties: 1` rangé avec la réponse
  et ligne visible pour l'élève ; perte de focus de 1 s → rien ; sortie après la réponse → rien ; note identique avec et
  sans sortie ; la ligne apparaît côté enseignant et pas chez un camarade. Éprouvé dans les deux sens.
- Durée : **≈ 1 h 30** de plus au lot 2, tests compris.

### 4.9 Le rendu, en bref

- Panneau à droite, 380 px, sous le bandeau, **non modal** (`role="dialog"`, `aria-modal="false"`) puisque le menu
  reste utilisable ; l'écran de travail se pousse à gauche pour ne pas être caché ; plein écran en bas sous 900 px.
- Gel : les champs et boutons de travail de l'écran courant sont désactivés et le bandeau du haut dit pourquoi. **Chaque
  vue doit savoir se geler** : le moteur lui passe `gele: true` (fiche, phrases, planning, quai, plan d'entrepôt,
  tournée, animation…) ; une vue nouvelle naît avec. À faire vue par vue, d'abord celles dont une séance a besoin.
- Point d'étape : un écran du menu « Mon poste », comme l'animation.
- Choix = cartes cliquables, jamais d'aplat vert ; choix pris entouré à l'encre ; ✓ vert / ✗ rouge **en texte**.
- Fichier neuf proposé : `core/types/questions.js` (panneau, point d'étape, état, jalons, contrôle au chargement),
  branché dans `entreprise.js` par quelques lignes (menu, `declencher`, gel, bandeau de fin).

### 4.10 Tests (bloc nouveau `questions`, rangé dans un groupe de `outils/test.mjs` : alerte 7, le dire)

Séance d'essai `contenus/questions-essai.js` + `contenus/questions/ESSAI.js` + page `outils/essai-questions.html`.
Valeurs attendues écrites à la main.

- Rien n'arrive à l'ouverture ni en cliquant tous les menus.
- **Au fil** : le geste (choix **faux**) ouvre le panneau, une seule fois ; l'écran est gelé (champs désactivés, envoi
  refusé) ; Stock et Messagerie s'ouvrent, le panneau les suit ; après la réponse, tout se dégèle.
- **Point d'étape** : après l'envoi (faux), la carte et l'entrée de menu arrivent ; « Répondre » au mail est fermé ;
  deux réponses fausses → « Continuer » s'active quand même.
- Première réponse fausse → ✗, jalon faux, pas de seconde réponse ; « Réinitialiser » ne change rien.
- `apres: 'bilan'` → aucun ✓ / ✗ avant le bilan.
- **Souplesse** : reformuler un choix et changer l'ordre dans le fichier → une réponse rangée avant reste jugée pareil ;
  ajouter une question → somme toujours 20, élève en cours qui la reçoit ; retirer une question → la note se recalcule
  sur les autres, sans erreur ; `actif: false` → la question n'arrive plus.
- **Pire cas** : tout faux, questions comprises → la séance suivante s'ouvre sans l'enseignant.
- **Rattrapage** : envoyer le bon sans toucher au remplacement → la question au fil arrive à l'envoi.
- Contrôle au chargement : `juste` inconnu, clé en double → la séance ne s'ouvre pas, message clair ; **test générique**
  sur tous les fichiers `contenus/questions/*.js`.
- Enseignant : bonne réponse marquée, jamais gelé, base inchangée.
- Sabotages à éprouver : réponse rangée en rang au lieu de clé (le test « changer l'ordre » doit tomber) ; note sur la
  dernière réponse ; gel retiré ; rattrapage retiré (le pire cas doit tomber) ; arrivée conditionnée à une réponse juste ;
  « Corriger » qui rouvre une question.
- Suite entière avant le push.

---

## 5. Lot 3 — les signaux de geste (moteur, Opus, ≈ 2 à 3 h)

Les séances FB posent leurs questions sur des gestes **dans les vues** : « Commencer à décharger » (quai, 6.4),
« Valider mon rangement » (plan d'entrepôt, 6.5), la ligne 2 du terminal (6.7), le premier fût posé (6.7), l'arrivée
de la panne (planning, 6.8)… Aujourd'hui, une condition ne lit que la base. Proposition :

- une fonction `signal('quai:decharger')` donnée aux vues (dans l'`api` qu'elles reçoivent déjà : `sauver`, `toast`,
  `db`…) : elle range `db.gestes[séance][nom] = heure` **une fois**, puis `sauver()` ;
- une condition `apresGeste('quai:decharger')` dans `core/declencheurs.js` ;
- chaque vue **publie la liste de ses signaux** en tête de son fichier ; un nom inconnu dans une séance = la séance
  ne se charge pas ;
- même chose pour le **gel** (`gele: true`) : chaque vue branchée sait désactiver ses gestes de travail ;
- ce lot ne branche que les vues **qui existent** et dont une séance a besoin tout de suite (fiche, phrases,
  planning, quai, animation) ; une vue nouvelle (terminal vocal, stockage de masse, tournée en camion) **naît avec ses
  signaux**, dans son propre chantier.

Les mêmes signaux servent aussi aux **messages** déclenchés (6.8 : la panne arrive après la pose de la première carte),
toujours sous la règle du 03/10 : un geste de travail, jamais un clic de menu.

---

## 6. Lot 4 — les réponses de la classe (Sonnet, ≈ 3 h, peut attendre)

Pour lancer la discussion en classe (« 14 d'entre vous ont répondu A, 6 ont répondu B : pourquoi ? »), l'enseignant voit,
**par question**, combien d'élèves ont choisi chaque réponse (questions notées et de réflexion), et la liste des réponses
libres. Où : dans **« Conduite de séance »** (Q7), pendant la séance. Lecture seule, depuis ce qui
remonte déjà avec la note (aucune écriture nouvelle).

---

## 7. Ce que deviennent les trames et les briefs de séance

- La trame garde : la page de connexion, le brouillon des étapes compliquées, le cours. Ses questions passent dans
  `questions` (décision du 07/10).
- Chaque brief de séance FB (réécriture prévue par `FRANCE-BOISSONS-refonte.md`) aura une section **« Questions au
  fil »** : pour chaque question, le geste qui la déclenche, notée ou non (poids, groupe), qui la pose, le retour du
  collègue. La colonne « Questions qui passent à l'écran » du tableau de la refonte en est le point de départ.
- Une règle de rédaction à recopier dans `activites/FICHE-SEANCE.md` : **2 à 4 questions par séance** ; une question
  porte sur ce que l'élève **vient de faire** ; une seule question à la fois ; 2 à 4 choix ; le retour **montre la
  conséquence** dans l'entreprise ; une question notée ne doit pas pouvoir se réussir au hasard une fois sur deux
  (au moins 3 choix).
- **Trois règles contre le copier-coller vers un autre onglet** (Tristan, 08/10) :
  1. **Une question ancrée sur le travail de l'élève**, qu'aucun moteur de recherche ni IA ne peut résoudre sans son
     écran : « pourquoi as-tu refusé **ta** palette P3 ? », pas « pourquoi refuse-t-on une palette abîmée ? ». Avec le
     tirage (`MOTEUR-tirage-et-niveaux.md`), la question porte de préférence sur une **pièce tirée** de l'élève.
  2. **Répondre en montrant plutôt qu'en tapant** : cliquer la ligne du document, le mot, la zone, choisir une phrase.
     Réponse libre seulement pour la réflexion non notée.
  3. **Les questions d'éco-droit s'appliquent au cas de l'élève** (Tristan, 08/10 : il tient aux QCM qui font le lien
     avec l'éco-droit, mais une définition se trouve en dix secondes sur Internet). La question ne demande pas la règle,
     elle demande de l'**appliquer** à la situation de l'élève (dates, durées, contrat, de préférence **tirés**) ;
     **le texte est fourni dans la séance** (extrait du Code du travail, du contrat, du règlement, en document joint,
     source et date en pied), et la justification peut se demander en **cliquant la phrase** du texte qui fonde la
     réponse ; les choix sont des règles **toutes exactes en général**, une seule s'appliquant au cas. Une question de
     culture pure (qui se cherche forcément en ligne) reste **non notée** et sert la discussion en classe (lot 4).
     Exemples à prévoir dans FB : congés de Lucas (6.3), discrimination à l'embauche dans l'annonce (6.3), consigne des
     emballages (6.2, 6.10). Les textes cités sont **vérifiés** (source officielle, Légifrance), jamais reconstitués.
- `MODELE.md` : ajouter la section « Questions au fil » (§4 bis), avec ces deux règles.

---

## 8. Séances déjà jouées par des élèves (règle de Tristan du 06/10)

Ce chantier ne touche **aucune séance existante** tant qu'aucune ne déclare `questions`. Le lot 1 change seulement la
façon dont un message s'annonce (ENT-2.1, ENT-3.2, ENT-5.2, ENT-5.7, ENT-5.8 : leurs messages déclenchés gardent leur
texte et leur moment). Aucune note ne change. Si une séance déjà jouée reçoit plus tard des questions notées, son barème
change : brief à part, avec la règle « ceux qui ont fini gardent leur note » (`meilleur` déjà converti en proportion).

## 9. Ordre et durées

| Lot | Contenu | Modèle | Durée (tests compris) |
|---|---|---|---|
| 1 | notification qui reste | Opus | ≈ 2 h |
| 2 | questions de transition et au fil, souplesse, page d'essai, sorties de page (§4.8 bis) | Opus | ≈ 7 h 30 à 8 h 30 |
| 3 | signaux de geste | Opus | ≈ 2 à 3 h |
| 4 | réponses de la classe | Sonnet | ≈ 3 h |
| **Total** | | | **≈ 2 jours** (un peu plus que le tableau de la refonte FB, à cause des deux sortes de questions et du gel) |

Ce qui prend le temps : la suite de tests (≈ 5 min par passage, plusieurs passages) et les sabotages, pas l'écriture.
**Version courte** si Tristan veut voir tôt : lots 1 et 2 seulement, avec `apresFiche` / `apresMail` /
`apresPlanning` (qui existent) et le gel de la seule fiche à remplir, sans signaux de geste (≈ 1 journée).

Un seul chantier moteur à la fois : **attendre** que « Smoby notation, lots 0 et 1 » soit effacé de
`docs/EN-COURS.md` (il touche peut-être `core/types/entreprise.js`).

## 10. Critères de validation par Tristan

Sur la page d'essai du moteur (`outils/essai-questions.html`), avec un compte élève neuf :

1. cliquer partout au début : **rien** n'arrive ;
2. faire le geste (même faux) : le panneau s'ouvre, le travail est grisé ; ouvrir le stock : le panneau suit ; répondre :
   tout se dégèle ;
3. envoyer la fiche (même fausse) : le point d'étape arrive, l'écran suivant est fermé ; deux réponses fausses : on
   continue quand même ;
4. une réponse fausse : ✗ et l'explication du collègue, impossible de répondre de nouveau ;
5. finir tout faux : la séance suivante s'ouvre ;
6. modifier une question dans `contenus/questions/ESSAI.js` (texte, ordre des choix), recharger : rien ne casse, la
   réponse déjà donnée est gardée ;
7. en enseignant : bonne réponse marquée, rien n'est enregistré ;
8. ENT-2.1 : les deux messages arrivent en cartes qui restent.
9. question ouverte, passer dans un autre onglet puis revenir : la ligne « Tu as quitté la page… » apparaît ; en
   enseignant, le Repérage le montre ; la note ne change pas.

## 11. Questions à trancher par Tristan (la page d'essai v2 montre chaque choix)

- [x] **Comment s'ouvre une question au fil** : panneau à droite, qui reste ouvert ; l'élève regarde, il ne touche pas ;
  **pas de « Plus tard »** (Tristan, 07/10, 21 h 34).
- [x] **Deux sortes de questions**, transition (point d'étape) et au fil, que la séance choisit question par question
  (Tristan, 07/10, 21 h 34).
- [x] **Souplesse** : ajouter, modifier, retirer une question = un seul fichier de données (Tristan, 07/10, 21 h 36).
- [x] **Q2. Notification d'un message** : **carte qui reste**, réduite à une ligne au bout de 8 s, sur tous les écrans ;
  elle **remplace aussi le bandeau de la tournée** (tests `boost` / `cdiscount` à réécrire, alerte 7).
- [x] **Q3. Retour d'une question notée** : ✓ / ✗ et explication **tout de suite** par défaut ; le brief de séance peut,
  question par question, choisir « Merci, je note » avec la correction au bilan (`apres: 'bilan'`).
- [x] **Q4. Ouvrir un document ne déclenche rien** : la **règle du 03/10 vaut aussi pour les questions**. Seul un geste de
  travail (saisir, choisir, envoyer, valider, poser) déclenche une question ; jamais un clic de menu, l'ouverture d'un
  écran ou d'un document, ni une minuterie. Pour l'exemple du CV : la question vient quand l'élève le **classe** dans le
  tableau de tri. Pas de condition `apresDocument`.
- [x] **Q5. Réflexion** : **choisir une raison** par défaut ; écrire une ou deux phrases permis question par question
  (`libre: true`), en exception.
- [x] **Q6. Évaluation** : questions **permises**, le collègue répond seulement « Merci, je note » ; elles comptent dans la
  copie ; aucune correction avant la remise.
- [x] **Q7. Réponses de la classe (lot 4)** : dans **« Conduite de séance »**, pendant la séance.
- [x] **Q8. Pilote** : la **page d'essai du moteur**, puis **ENT-6.1** ; aucune séance déjà jouée n'est touchée.
- [x] **Q9. Part des questions** : **3 à 5 points sur 20**, fixée dans chaque brief de séance.

Toutes les questions sont tranchées (Tristan, 07/10/2026, 21 h 44 à 21 h 55 ; reportées dans le fichier à 23 h 40, la
première écriture n'étant pas arrivée sur le disque).

---

## Sources (consultées le 07/10/2026)

- Szpunar, Khan, Schacter (2013), *Interpolated memory tests reduce mind wandering and improve learning of online
  lectures*, PNAS — résumé : [ScienceDaily](https://www.sciencedaily.com/releases/2013/04/130404122240.htm),
  [Harvard](https://psychology.fas.harvard.edu/publications/interpolated-memory-tests-reduce-mind-wandering-and-improve-learning-online).
- Johnson, Mayer (2010), *Applying the self-explanation principle to multimedia learning in a computer-based game-like
  environment*, Computers in Human Behavior 26 — [notice](https://www.datalearner.com/academic/journal-papers/0747-5632/volumes-and-issues/121/paper-detail/33903).
- O'Neil, Chung, Kerr, Vendlinski, Buschang, Mayer (2014), *Adding self-explanation prompts to an educational computer
  game*, Computers in Human Behavior 30 — [CRESST](https://cresst.org/publication/adding-self-explanation-prompts-to-an-educational-computer-game/).
- Cathy Moore, écrire des questions de scénario — [blog](https://blog.cathy-moore.com/?p=1466).
- V. Shute, *Stealth assessment* — [introduction](https://myweb.fsu.edu/vshute/pdf/SA_Primer.pdf).
- A. Roselli, *Defining “Toast” Messages* — [article](https://adrianroselli.com/2020/01/defining-toast-messages.html) ;
  S. O'Hara, *A toast to a11y toasts* — [article](https://scottohara.me/blog/2019/07/08/a-toast-to-a11y-toasts.html).

Ce qui est **vérifié** : le code lu (commit `d024f17`), le comportement de la page d'essai (jouée dans un navigateur
automatique, 1366 × 768, deux thèmes, vue enseignant, aucune erreur, aucune requête réseau). Ce qui est **supposé** :
les durées, et le fait que les vues existantes acceptent un `signal` sans difficulté (non essayé).

---

## Compte rendu *(rempli par Claude Code à la livraison de chaque lot)*

### Lot 1 — notification qui reste (livré le 08/10/2026, Claude Code, Opus)

- **Fait** : pile de cartes dans `core/types/entreprise.js` (« Les cartes des messages »), un seul élément
  `role="status"` créé à l'ouverture et reposé à chaque dessin ; carte = message `declenche`, non lu, non fermé ;
  réduite à une ligne au bout de 8 s ; trois au plus puis « … et n autres : voir Messagerie » ; fermeture et
  réduction hors de la base (rien de plus n'est écrit). À la réouverture, un non-lu revient en carte réduite.
  Le focus n'est jamais pris ; au clavier, il reste sur le même bouton quand la carte se réduit.
- **Place** : sous le bandeau de l'entreprise, puis collée au haut de l'écran quand on fait défiler (ancre
  `position: sticky` de hauteur nulle) : en `position: fixed` tout en haut, elle aurait caché « Quitter ».
- **Bulle** : elle ne dit plus que la confirmation (« Réponse envoyée. », « Fiche envoyée. », « Message
  envoyé. ») ; `declencher()` ne prend plus d'argument. L'accusé d'un envoi corrigé (`volet.corrections`) passe
  aussi en carte : ses messages portent `declenche: 'correction:<id>'`.
- **Tournée** : bandeau `tour-notif` retiré (`core/types/tournee.js` et sa règle CSS), la carte le remplace.
- **Charte** : bord ambre, fond `--panneau`, ombre ; charte rouge ou verte → bouton à l'encre (vérifié sur
  Smoby) ; mouvement réduit = pas d'animation. Aucune variable de couleur nouvelle.
- **Tests (alerte 7, cas réécrits)** : `cdiscount` — le cas ENT-2.1 « cliquer partout… » (la bulle dit
  « Réponse envoyée. », deux cartes pleines à l'envoi, réduites au remontage, aucune pour une base ancienne) ; cas
  nouveau à horloge simulée (toujours là après 10 s et réduites, jamais le focus, `role="status"`, ouverte par la
  carte → lue et partie, l'autre reste, × → partie mais non lue, revient au remontage). `boost` — trois endroits
  qui lisaient `tour-notif` (le cas « Nouveau message en tête de la tournée » est réécrit : carte sur la tournée,
  plus de bandeau, ouverte par la carte, un seul imprévu). Le brief annonçait 9 endroits : il n'y en avait que 4
  (3 dans `boost`, 1 dans `cdiscount`).
- **Sabotages** (chacun fait tomber le cas nouveau) : carte qui part au bout de 2,6 s ; carte pour un message lu ;
  carte qui prend le focus.
- **Corrigé après la suite entière** : les cartes posées par-dessus le travail cachaient « Agrandir le planning »
  (4 cas `planning` / `smoby` tombés). Elles **prennent maintenant leur place** au-dessus du travail (qui descend
  d'autant) et restent collées en haut de l'écran quand on fait défiler. Suite : 844 / 844.

### Lot 2 — points d'étape et questions au fil (livré le 08/10/2026, Claude Code, Opus)

- **Fichiers** : `core/types/questions.js` (format, contrôle au chargement, jalons, rendu), branché dans
  `core/types/entreprise.js` (arrivée avec les messages déclenchés, panneau, gel, écran du point d'étape, fermeture,
  sorties de page) ; `styles/questions.css` (chargé par `index.html`) ; `core/prof.js` (Repérage : colonne « Sorties de
  page pendant une question », infobulle du Suivi) ; séance d'essai `contenus/questions-essai.js` +
  `contenus/questions/ESSAI.js` ; page `outils/essai-questions.html` (élève / enseignant / évaluation ; la base est
  gardée au rechargement, pour le critère 6) ; bloc de tests `questions` (alerte 7 : **`outils/test.mjs` touché** pour
  l'inscrire, prérequis `socle`, groupe 2 de GitHub).
- **Écarts au brief, décidés en route** (lignes dans `docs/decisions.md`) :
  - le **gel est générique** (un écouteur du moteur en phase de capture, comme le verrou de la copie rendue, plus les
    champs et boutons de l'écran désactivés) au lieu de `gele: true` passé vue par vue : toutes les vues, d'aujourd'hui
    et de demain, sont gelées sans rien savoir. Restent libres : menu, sortie, cartes, panneau, et ce qui sert à
    consulter (messages, pièces jointes, documents, onglets, filtres du stock) ;
  - « **Continuer : point d'étape avec Inès →** » est un **bandeau du moteur** sur tous les écrans (tant que le point
    d'étape attend), pas le bouton propre à chaque vue (§4.1.2) ;
  - l'**ordre des choix** est tiré par élève mais **pas rangé** en base (recalculé de la graine : aucune écriture) ;
  - l'**explication d'une question `apres: 'bilan'`** vient avec le bandeau de fin (le brief ne disait pas où) ;
  - deux questions au fil prêtes au même moment : celle **dont le geste a eu lieu passe d'abord**, le rattrapage
    du moteur ensuite ;
  - la fermeture (`ferme`) vaut **de l'arrivée du point d'étape à ses réponses**, pas avant ; `'repondre:<clé>'` vise le
    mail qui porte `cle: '<clé>'` (ou l'id de ses phrases) ; `groupe` est **obligatoire** pour une question notée ;
  - les sorties de page sont gardées à l'écran jusqu'à la réponse : un rechargement avant la réponse les perd.
- **Pas fait dans ce lot** : les signaux de geste (`apresGeste`, lot 3) — la question au fil de l'essai lit la base
  (« un remplacement est choisi », jamais lequel) ; la vue par classe (lot 4).
- **Tests** (`node outils/test.mjs questions`, 13 cas, valeurs écrites à la main) : rien à l'ouverture ; au fil (choix
  faux → panneau une fois, gel, envoi forcé refusé, Stock et Messagerie avec le panneau, « Merci, je note » avant le
  bilan, dégel) ; point d'étape (carte, menu, bandeau, « Répondre » fermé, ✗ ✗, pas de seconde réponse, « Continuer »
  → Malo) ; « Réinitialiser » ; la note (4/3) ; souplesse (reformulé et réordonné, ajoutée, retirée, de côté) ; pire
  cas avec rattrapage (la suite s'ouvre, explication au bilan) ; contrôle au chargement + tous les fichiers ;
  enseignant ; évaluation ; sorties de page ; Repérage enseignant.
- **Sabotages** (chacun fait tomber au moins un cas) : réponse rangée en rang au lieu de clé ; dernière réponse au
  lieu de la première ; gel retiré ; rattrapage retiré ; point d'étape conditionné à un bon juste. **Non éprouvé** :
  « Corriger » qui rouvrirait une question (le moteur n'a aucun chemin pour le faire : les jalons des questions n'ont
  pas d'`ecran`).
- **Vérifié à l'écran** (page d'essai, 1366 × 768, thèmes clair et sombre) : parcours élève complet, vue enseignant.
  **Non vérifié** : l'affichage sous 900 px (panneau en bas de l'écran).

### Lot 3 — signaux de geste (livré le 08/10/2026, Claude Code, Opus)

- **Fait** : `apresGeste(nom)` dans `core/declencheurs.js` ; une condition reçoit maintenant `(db, séance)` (les gestes
  sont cloisonnés par séance : `db.gestes[<séance>][<nom>]` = heure, écrit une fois, rien pour l'enseignant ni après la
  remise). Chaque vue appelle `api.signal(…)` juste avant sa sauvegarde et publie `signaux` : fiche (bloc, ligne d'un
  tableau oui / non, envoi ; une saisie à la sortie de la case), planning (poser, envoyer), quai (décharger, valider
  une palette, clôturer), plan d'entrepôt (poser, vérifier), animation (première réponse à une question). Un
  `apresGeste` inconnu des vues de la séance empêche la séance de s'ouvrir (questions, points d'étape **et messages
  déclenchés**). La page d'essai passe sur `apresGeste('fiche:bon:remplacement')`. Table des gestes :
  `activites/FICHE-SEANCE.md`.
- **Pas fait, et pourquoi** : les **phrases à choisir** n'ont pas de geste (l'envoi est déjà un mail : `apresMail`
  suffit ; un geste « choisir une phrase » viendra si une séance en a besoin) ; le **gel vue par vue** (`gele: true`)
  n'est pas utile : le gel du lot 2 est générique. Les gestes du plan d'entrepôt en mode **préparation** et
  **visite** ne sont pas branchés (aucune séance FB ne les demande) ; les vues nouvelles (terminal vocal, stockage de
  masse, tournée en camion) naîtront avec les leurs.
- **Tests** : bloc `questions` (geste rangé et cloisonné, geste d'une autre séance sans effet, geste rangé qui fait
  arriver la question à l'ouverture, saisie : rien pendant la frappe, la question à la sortie de la case, rien chez
  l'enseignant, la liste des gestes de chaque vue) ; bloc `planning` (poser une carte fait arriver un message une
  fois, « envoyer » rangé, rien chez l'enseignant, un nom inconnu refuse la séance) ; bloc `animation` (le geste de la
  question, rangé à la première réponse). **Non éprouvé par un test qui joue la vue** : les gestes du quai et du plan
  d'entrepôt (leur liste est contrôlée, leur émission ne l'est pas).

À la livraison du lot 2 : recopier les décisions du §4.0 et du §11 dans `docs/decisions.md` (une ligne chacune, datée
du 07/10/2026, « Tristan »).

### Lot 4 — réponses de la classe (livré le 08/10/2026, Claude Code, Opus)

- **Fait** : dans « Conduite de séance » (`core/prof.js`, `remplirReponsesClasse`), une section « Réponses de la classe aux
  questions », une partie par séance où des élèves ont répondu : par question, le **nombre d'élèves par réponse** (la
  première, celle qui compte), la bonne réponse dite en texte, et les **réponses écrites, sans les noms** (la section se
  projette). Bouton « Actualiser ». Sous un demi-groupe, ses élèves seuls. Lecture seule depuis ce qui remonte déjà avec
  la note : aucune écriture, aucune règle Firebase.
- **Ajouté au format** : `meta.questions: 'ENT-6.2'` (nom du fichier de questions) donne les textes ; sans lui, les
  identifiants des questions et des choix.
- **Test** (bloc `questions`) : trois élèves, deux réponses « stock » et une « mail », deux réponses écrites → 2 / 1, les
  deux textes, aucun nom. Sabotages : un mauvais compte, un nom affiché → le cas tombe.
- **Non vérifié à l'écran** : il faudra une séance qui déclare des questions et des élèves qui y ont répondu (ENT-6.1,
  pilote prévu par Q8). Pas de barre ni de couleur par réponse (pas de classement, pas de vert « juste ») : à dire si
  Tristan en veut.
