# Brief — retours du test en classe d'ENT-5.1 (Smoby), 07/10/2026

**Statut** : à faire. **Auteur** : Claude (conversation Cowork, 07/10/2026 après-midi). Décisions de Tristan prises le
même jour, point par point. Le diagnostic a été fait en lisant le code (`core/types/entreprise.js`, `core/types/fiche.js`,
`core/parcours.js`, `contenus/smoby-ent51.js`) : **rien n'a encore été essayé à l'écran**.

> **📋 Phrase à copier-coller dans Claude Code :**
>
> ```
> Lis docs/briefs/SMOBY-retours-classe-5.1.md et fais les lots A et A bis ensemble (correction après le bilan, une case = un jalon, poids, bandeau ✓/✗), en commençant par la page d'essai du bandeau, puis le lot B (trame : étape de connexion). Le lot C n'est pas à faire.
> ```

Modèle : **Sonnet** pour les lots A et B. **Opus** pour le lot C (vue nouvelle du moteur).

Ordre décidé par Tristan : **A, puis B, puis C.** A et B d'abord sur 5.1 et 5.2. On n'étend aux autres scénarios
qu'après validation à l'écran.

---

## Ce que Tristan a constaté en classe

1. Avec la trame, les élèves ne savent pas dans quel ordre se connecter : **Prepalog → Simulog → logo Smoby → ENT-5.1**.
2. Les élèves ont du mal à suivre en même temps la trame (papier) et l'exercice (écran). Décision : **mettre les questions
   dans les vues et réduire la trame**, et cela pour tous les scénarios (lot C).
3. **« La validation bloque à la fin. »** Le bilan demande à l'élève de corriger, mais il ne peut pas : Tristan a dû
   rouvrir la suite à la main pour tous les élèves.

### Diagnostic du point 3 (lu dans le code)

- Une fois envoyées, la fiche (`core/types/fiche.js`, `e.envoye`) et la réponse par phrases sont **figées**.
- Le bandeau de fin (`bandeauFin`, `core/types/entreprise.js` ~l. 627) dit « Tu as tout fait, mais il reste quelque chose
  à corriger… La séance suivante s'ouvrira quand tout sera juste ».
- Or rien n'est corrigeable, sauf « Réinitialiser », qui efface tout.
- La photo de fin (`db.points[id]`) n'est prise que si `ok === max`, et `verrou()` (`core/parcours.js`) l'exige.
  **Résultat : 5.2 reste fermée à tout élève qui a une seule étape fausse.**

---

## Lot A — corriger après le bilan (moteur, `core/`)

### Ce que veut Tristan (ses mots)

> « Les élèves font le parcours, avec les validations comme actuellement. À la fin, l'outil leur donne les choses justes et
> à corriger et conserve le résultat ; les blocages se retirent et l'élève peut corriger son travail. La correction permet
> d'améliorer la note. »

### Décisions

- **A1. Rien ne change jusqu'au premier bilan** : mêmes envois, mêmes confirmations, mêmes jalons.
- **A2. Le premier bilan est conservé.** Il existe déjà : `db.indicateurs[séance].premier[étape]`, posé une fois, qui survit
  à « Réinitialiser ».
- **A3. Les blocages se retirent.** Après le premier bilan, chaque envoi définitif qui porte une étape fausse peut être
  **rouvert par l'élève** pour être corrigé et renvoyé : fiche, réponse par phrases, et planning en 5.2. Le bandeau de fin
  propose un bouton « Corriger » qui mène à l'écran concerné (ou le bouton est sur l'écran lui-même, voir A7). Pas de
  limite au nombre de corrections.
- **A4. La note = moyenne du premier essai et de l'état actuel.**
  `score = (nombre d'étapes justes au premier bilan + nombre d'étapes justes maintenant) / 2`, sur `max`.
  Exemple : 6/9 au premier envoi, 9/9 après correction → 7,5/9. Avant toute correction, les deux termes sont égaux, donc
  la note ne change pas. Le Suivi doit pouvoir afficher un score non entier.
- **A5. La séance suivante s'ouvre dès le premier bilan**, c'est-à-dire quand toutes les étapes sont jugées (aucune
  « à faire »), justes ou fausses. Tristan n'a plus à débloquer à la main. Le déblocage manuel `_debloque-` reste.
- **A6. L'évaluation ne change pas** (`COPIE`) : pas de correction, pas de moyenne.

### Points techniques à trancher dans la session (et à dire à Tristan)

- **A7. Rouvrir un envoi.**
  - Fiche : vider `e.envoye` remet ses jalons « à faire » (« rien n'est vrai avant l'envoi »). Le bandeau disparaît
    pendant la correction et revient au renvoi.
  - Vérifier que le **déclencheur** `apresFiche` ne renvoie pas un **deuxième** message de Sophie, ou alors un message
    explicite (« Merci, j'ai bien ta fiche corrigée »).
  - Phrases : même question pour la réponse à Sophie (`phrasesJustes(...).envoye`).
  - Planning de 5.2 : même mécanisme.
  - **Décidé par Tristan (07/10)** : à chaque renvoi corrigé, Sophie (ou l'interlocuteur de la séance) répond par un
    **message explicite** du type « Merci, j'ai bien ta fiche corrigée ». Elle ne rejoue pas le premier message. Ce
    message ne donne jamais la réponse.
- **A8. Photo de fin et reprise.** La photo sert aussi de point de reprise pour Spartoo (base commune). Proposition : la
  prendre au premier bilan, puis la **remplacer** à chaque nouveau bilan complet, pour que la séance suivante parte du
  travail corrigé. Smoby (une base par séance) ne lit la photo que comme preuve. Vérifier `appliquerReprise` et
  `reinitialiser`.
- **A9. Le texte du bandeau** (au tu) :
  - « Séance validée » devient deux cas : « Tout est juste ✓ » et « Tu as fini : voici ce qui est juste et ce qui est à
    corriger. Tu peux corriger pour améliorer ta note, ou passer à la séance suivante. »
  - La liste des étapes justes et fausses montre toujours **le titre, jamais la réponse**.
  - « Relis ta trame » est à revoir avec le lot C.
- **A10. Portée — décidé par Tristan (07/10)** : la règle s'applique **partout**, à toute séance `parcours: true` hors
  évaluation, **Spartoo compris**. C'est une exception voulue à « Spartoo reste tel quel ». Pas de réglage par séance.
  Tester Spartoo dans son bloc : envoi avec une erreur, puis séance suivante ouverte, puis correction, puis moyenne.
- **A11. La règle du 02/10** (« la séance N+1 ne s'ouvre qu'une fois la séance N validée, tous les jalons au vert », en
  tête de `core/parcours.js`) est **remplacée** pour les séances concernées : mettre à jour ce commentaire, la fiche
  `activites/FICHE-SEANCE.md` et `docs/decisions.md`.
- **Règle de Tristan** : un élève qui a déjà fini une séance modifiée garde sa note. Les élèves qui ont fait la 5.1 le
  07/10 ont une note « ancienne règle ». Ne pas la recalculer à la baisse.

### Tests (bloc `smoby`, Spartoo selon A10)

- 5.1 envoyée avec une erreur :
  - la 5.2 s'ouvre ;
  - le bandeau nomme l'étape fausse ;
  - la fiche se rouvre ;
  - une fois corrigée et renvoyée, la note vaut (premier + actuel) / 2.
- Sabotages :
  - note = état actuel seul → le cas tombe ;
  - fiche non rouvrable → le cas tombe ;
  - verrou qui exige tout juste → le cas tombe.
- Évaluation : pas de bouton « Corriger », note inchangée.
- Suite entière avant le push (touche `core/`).

---

## Lot A bis — une case = un jalon, poids par bloc, bandeau ✓ / ✗ (décisions de Tristan, 07/10 à 17 h)

À faire **avec le lot A**, dans le même chantier moteur, sur 5.1 et 5.2 d'abord. Ensuite, c'est la règle générale :
on l'étend séance par séance après validation à l'écran, et toute séance nouvelle naît avec elle.

### A bis 1. Chaque case est jugée seule

Le but est une note plus juste. Pour la 5.1, on passe de 9 à 22 jalons :

- 15 cases du tableau de tri ;
- le candidat et le contrat de la fiche ;
- 5 phrases du message à Sophie : salutation, candidat, raison, contrat, fin.

La 5.2 suit la même règle : à proposer à Tristan avant d'écrire, avec la liste des cases.

### A bis 2. Poids par bloc

- Chaque bloc a une **part fixe de la note sur 20**, partagée entre ses cases.
- Ajouter ou retirer une case ne change pas l'équilibre de la note.
- Chaque jalon déclare un `poids`. La somme des poids d'une séance vaut 20 ; le moteur le vérifie et le dit au chargement
  si ce n'est pas le cas.
- Score = somme des poids des jalons justes ; `max` = 20.
- La moyenne du lot A (A4) devient : (points du premier bilan + points actuels) / 2.
- Le Suivi affiche un score décimal, arrondi à 0,5 ou à 0,1 : à demander à Tristan.

Barème validé par Tristan pour la 5.1 :

| Bloc | Points | Détail |
|---|---|---|
| Tableau de tri | 8 | 15 cases, 8/15 de point chacune |
| Décision | 7 | bon candidat 5, bon contrat 2 |
| Message à Sophie | 5 | raison 2, candidat 1, contrat 1, salutation 0,5, fin 0,5 |

Pour la 5.2 et les séances suivantes : **proposer le barème à Tristan** avant d'écrire. Il tranche.

### A bis 3. Bandeau de fin : même niveau de correction qu'avant, en ✓ / ✗

- La note compte case par case, mais le bandeau **ne descend pas à la case** : une case oui/non nommée fausse donne la
  réponse. Il garde le niveau d'avant.
- En 5.1, le bandeau a 9 lignes :
  - les 5 lignes du tableau de tri ;
  - le candidat ;
  - le contrat ;
  - « Message : la raison » ;
  - « Message : le ton et les informations », qui regroupe salutation, fin, candidat et contrat du message.
- Chaque jalon déclare donc un `groupe`, qui est le libellé affiché dans le bandeau. Un groupe est juste quand toutes
  ses cases le sont.
- **Afficher TOUS les groupes**, pas seulement les faux. Tristan a vu que le message actuel était parfois mal compris.
  - Juste : **✓ en vert** (coche et texte vert, sans aplat).
  - À corriger : **✗ en rouge** (texte rouge, sans aplat).
  - Charte : le vert plein ne dit que « juste », le faux reste du texte rouge.
- Ne pas afficher les points perdus par groupe : ils donneraient le nombre de cases fausses.
- Vérifier l'accessibilité : les couleurs ne suffisent pas, la coche et la croix portent le sens.
- Faire une **page d'essai cliquable** du bandeau, dans le dossier « Claude outputs », avant de l'écrire dans le moteur.
  C'est un changement d'interaction.

### Tests

- Une case fausse coûte exactement son poids (8/15 de point).
- Le mauvais candidat coûte 5 points.
- Le bandeau montre 9 lignes, la ligne fausse en ✗ et les autres en ✓.
- Sabotages :
  - poids ignorés (toutes les cases égales) → le cas tombe ;
  - bandeau case par case → le cas tombe ;
  - somme des poids ≠ 20 → le message du moteur apparaît.

### Effets sur la base de données (lus dans le code le 07/10, à vérifier dans la session)

- **Règles Firebase** : aucun changement. `firestore.rules` ne contrôle pas le type de `score` et de `max`, et un score
  décimal passe. Il n'y a rien à publier dans la console.
- **Travail de l'élève** (`prives/{uid}/jeux/{aid}`) : les cases de la fiche y sont déjà rangées une par une. Les
  nouveaux jalons se recalculent à partir de ce qui existe, sans migration.
- **⚠ Piège principal : le champ `meilleur`.**
  - Ce qu'affiche le Suivi, c'est `meilleur` (le plus haut score jamais écrit, `core/backend-firebase.js` l. 356),
    rapporté au `max` actuel.
  - Les élèves du 07/10 ont un `meilleur` sur 9. Dès qu'ils rouvrent la 5.1, le `max` devient 20 et `meilleur` reste
    le plus grand des deux nombres.
  - Exemple : un élève à 9/9 (20/20) qui ne refait rien de mieux s'afficherait 9/20.
  - À traiter : quand le `max` change, repartir du nouveau score (par exemple remettre `meilleur` à zéro si l'ancien
    `max` diffère), ou convertir l'ancien en proportion.
  - Règle de Tristan : l'élève garde sa note. Tester ce cas.
- **`meilleur` et la moyenne** : pendant une correction, la fiche rouverte repasse ses jalons « à faire », donc le score
  baisse un moment. `meilleur` garde le plus haut, et la note du Suivi ne baisse pas. Vérifier que c'est bien voulu.
- **Repérage** (`indicateurs.premier`) : il est rangé par identifiant de jalon. Les anciens identifiants
  (`ligne-laura`…) des élèves du 07/10 ne correspondent plus aux nouveaux. Leur « premier essai » serait reconstitué à
  la réouverture d'après l'état du moment. Le dire à Tristan.
- **Quota de lectures et d'écritures (Spark)** :
  - La note n'est réécrite que si le score ou le détail change. Chaque réécriture coûte 1 lecture et 1 écriture
    (`enregistrer`, `siChange`).
  - En 5.1, les jalons ne sont jugés qu'**à l'envoi**, et 22 jalons basculent en une seule écriture. Le découpage
    case par case ne coûte donc rien.
  - Chaque correction coûte environ 2 lectures et 3 écritures : à la réouverture, au renvoi, et pour le message de
    Sophie dans la base privée.
  - **Règle à respecter** : un jalon ne se juge jamais **pendant la frappe**, case par case. Sinon, chaque case
    remplie coûterait une lecture et une écriture.
  - Le verrou qui s'ouvre dès le premier bilan économise la lecture du drapeau `_debloque-`.
- **Mode démonstration** : les tests ne couvrent pas Firebase. Le piège de `meilleur` existe aussi dans
  `core/backend-demo.js` : le tester là.

---

## Lot B — trame 5.1 : étape de connexion (générateur Cowork, `outils/trame-smoby-recrutement.py`)

- Ajouter en tête une **étape 0 « Se connecter »** en 4 cases numérotées : **1 Prepalog** (adresse du site, identifiant) →
  **2 Simulog** → **3 le logo Smoby** → **4 ENT-5.1**. Si possible, une capture de chaque écran (captures locales, pas
  d'Internet).
- Régénérer le `.docx` et le `.pdf`, puis le corrigé de la trame (le nombre de questions ne change pas si l'étape 0 n'en a
  pas).
- La même étape 0 servira aux autres trames. En faire une fonction commune aux générateurs si c'est simple.
- Ce lot devient en partie caduc avec le lot C (trame réduite), mais **l'étape de connexion restera** : c'est elle qui
  reste sur papier.

---

## Lot C — questions au fil, dans les vues (chantier moteur, plus tard, **Opus**)

**Décision de Tristan** : les questions de la trame passent **à l'écran, au moment du geste**, dans une **vue nouvelle**.
Exemple : une question surgit quand l'élève ouvre un CV, ou après avoir rempli une ligne du tableau de tri. Elle ne vit
pas dans un questionnaire à part. La trame est réduite à : connexion, prise de notes, feuille de cours.

- Ce choix **remplace** celui du 06/10 au soir : trame longue de 8 pages, règle « trame courte » suspendue (brief
  `COWORK-trame-smoby-5.1.md` §1).
- Valable pour **tous les scénarios**, en commençant par 5.1 et 5.2.
- À faire **avant d'écrire du code** :
  - recherche (comment les serious games et les simulations métier posent leurs questions en cours d'action) ;
  - **maquette cliquable** pour Tristan ;
  - brief `MOTEUR-questions-au-fil.md` : déclencheurs (`core/declencheurs.js` existe), une question = un jalon ou non,
    poids dans la note, rendu dans le volet ou par-dessus la vue, ce que voit l'enseignant ;
  - durée annoncée.
- Un seul chantier moteur à la fois : **pas en même temps que le lot A**.
- Existant à regarder : le questionnaire à l'écran de Spartoo ENT-1.1 (fiche à `choix`, `fermetures`) et la vue
  « animation à questions » (`core/types/animation.js`).

---

## Compte rendu *(rempli par Claude Code)*

