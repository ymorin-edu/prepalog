# Brief moteur — L'écran « Avant de commencer » (page d'accueil de chaque séance : questions, documents, images)

> **📋 Phrase à copier-coller dans ccode (après validation de la page d'essai par Tristan) :**
>
> ```
> Lis docs/briefs/MOTEUR-avant-de-commencer.md. Construis l'écran « Avant de commencer » dans le moteur des questions, puis branche-le sur ENT-6.2. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : en cours — lot 1 livré le 10/10/2026, lots 2 et 3 à faire *(à valider → à implémenter → en cours → livré | abandonné)*
**Date du brief** : 10/10/2026
**Conversation d'origine** : Claude (session cloud), décisions de Tristan du 10/10/2026, 10 h.
**Modèle** : Sonnet (on prolonge l'écran de questions existant, `core/types/questions.js`, sans vue nouvelle).
**Page d'essai** : `G:\Mon Drive\Travail\Logistique\1L\Claude outputs\essai-avant-de-commencer-ENT-6.2.html` (maquette
cliquable, hors dépôt).

## 1. La décision (Tristan, 10/10/2026)

Pour France Boissons, la trame papier est réduite (règle du 07/10/2026) : **chaque séance commence par des questions, à
l'écran, avec les documents et les aides nécessaires**. Ce que la trame faisait en tête (contexte, lexique, lecture des
documents) passe dans un écran d'ouverture. Ces questions **ne comptent pas dans la note, et l'élève ne doit pas le savoir** :
aucun texte à l'écran ne le dit (ni la tutrice, ni une note, ni le bandeau de fin) ; elles se présentent comme les autres
questions (« Une seule réponse compte : la première. »). Elles couvrent **aussi l'économie-droit** : au moins une question
fait appliquer une règle de droit au cas de la séance, avec le texte fourni dans les documents (règle de Tristan du
08/10/2026 sur les QCM éco-droit). Les questions se suivent **dans un seul bloc, sans faire défiler la page** (décisions de
Tristan, 10/10/2026, après la première page d'essai).

### 1 bis. La règle générale (Tristan, 10/10/2026, 10 h 20)

- **Toute séance de scénario créée à partir de maintenant commence par cet écran**, France Boissons compris (ENT-6.1 à
  6.10) et tous les scénarios suivants (Decathlon…). **Pas pour le moment** pour les anciens scénarios (Spartoo,
  Cdiscount, Boost, Picard, Smoby) : Tristan fera sans doute les changements plus tard ; le moteur doit le permettre sans
  rien casser (une séance sans `ouverture` s'ouvre comme aujourd'hui).
- **Ce que l'écran contient** :
  1. des questions qui **préparent la compréhension de l'exercice qui suit** (lire la demande, les mots du métier, où
     chercher l'information) — sans jamais résoudre le piège de la séance ;
  2. **2 ou 3 questions d'économie-droit** appliquées au cas de la séance, avec le texte (loi, arrêté, contrat, conditions)
     dans le bloc de gauche ;
  3. pour les séances **orientées logistique qui font découvrir un matériel nouveau** (fût, casier, palette, transpalette,
     terminal vocal, quai…) : **découverte par l'image**, image(s) dans le bloc de gauche, question dans le bloc de droite.
- **Pour le moment ces questions ne comptent pas dans la note** (et l'élève ne le sait pas). Tristan reviendra peut-être
  sur cette décision : **passer à « noté » doit être un seul réglage** (par exemple `ouverture.part: 2` dans le fichier de
  questions de la séance), sans rien réécrire d'autre ; le moteur sait déjà ajouter un jalon par question notée.
- **Le bloc de gauche suit la question** : chaque question déclare ce qu'il montre (`doc`), un document ou un
  **visuel** (`{ type: 'images', images: [{ src, alt, legende, credit }] }`) ; l'élève garde les onglets pour regarder les
  autres. Images : dans `contenus/images/<entreprise>/`, avec leur ligne dans `CREDITS.md` (empreinte, auteur, licence)
  et le crédit affiché sous l'image ; aucune image d'un autre domaine (règle du dépôt).
- **L'écran d'accueil actuel** (`ACCUEIL` : étapes de la séance, « Bon à savoir ») : regarder comment il s'enchaîne avec
  « Avant de commencer » et **proposer à Tristan, captures à l'appui**, s'il faut les fondre ou les garder l'un après
  l'autre, avant d'écrire.

## 2. Ce qui contredit le moteur actuel (à lever explicitement)

- `MOTEUR-questions-au-fil.md` : « Rien n'arrive à l'ouverture » et « jamais l'ouverture d'un écran ou d'un document »
  (règle du 03/10). Cette règle vaut toujours pour les questions **au fil** ; l'écran « Avant de commencer » est une
  **exception déclarée** (un seul écran, en tête, connu dès l'accueil), pas une question qui surgit.
- Le point d'étape (`etapes`) exige `apres(db)` = un envoi du parcours. Il faut une étape **d'ouverture** sans condition.
- L'écran du point d'étape n'affiche ni documents ni aide : à ajouter.
- Une question notée (`juste`) ajoute un jalon ; une question `reflexion` n'a pas de bonne réponse. Ici : **une bonne
  réponse, corrigée à l'écran (✓ / ✗ + retour), mais sans jalon** → champ nouveau `notee: false`.

## 3. Ce qu'il faut construire (voir la page d'essai)

1. **Déclaration**, dans `contenus/questions/<code>.js` (le fichier de questions de la séance) :
   ```js
   ouverture: { id: 'avant-de-commencer', de: 'ines', titre: 'Avant de commencer',
     situation: 'Bonjour ! Malo … lis ses documents à gauche et réponds à mes questions. Ça ne compte pas dans ta note.',
     documents: ['commande-malo', 'fiche-client', 'stock', 'conditions'],   // ids de OPTIONS.documents
     encadre: { titre: 'Prendre une commande', texte: '…' },                  // facultatif
     continuer: 'lire mes messages', questions: ['qui-est-malo', 'les-vides', 'ou-regarder'] },
   ```
   et dans `liste`, des questions `type: 'ouverture'` avec `juste`, `retour`, `notee: false`, et une **`aide`** (texte
   court avec `[[mots]]` cliquables) + **`doc`** (id du document que le bouton « Voir le document » de l'aide affiche).
2. **Écran** : entrée de menu « Avant de commencer » en tête de « Mon poste », écran ouvert à l'arrivée dans la séance.
   À gauche, les documents en onglets (les mêmes qu'à gauche de la fiche, avec leur pied « reconstitution » ; un texte
   de loi réel porte « Texte de loi (réel) — source : Légifrance »). À droite, **un bloc qui montre une seule question à la
   fois** : en tête, une pastille par question (numéro, puis ✓ une fois répondue ; cliquable pour y aller) et « n sur N
   répondues » ; la question (« Question 2 sur 4 », choix dans un ordre tiré par élève, « Aide » repliée avec « Voir le
   document », « Répondre ») ; en bas, « ← Précédente » / « Suivante → », et sur la dernière, « Continuer : … → » quand
   tout est répondu. **Tout tient sans défiler à 1366 × 768** (écran courant en salle), aide ouverte et retour affiché :
   vérifié sur la page d'essai, à garder par un test. Pas d'encadré dans le bloc (il reste sur la fiche de la séance).
3. **Fermeture** : tant que l'élève n'a pas répondu à toutes les questions, les autres entrées du menu (Messagerie, Bon de
   commande…) sont fermées (cadenas). Une réponse fausse ne bloque jamais. Après « Continuer », l'écran reste dans le menu
   (relire ses réponses et les retours), les messages d'accueil arrivent comme aujourd'hui.
4. **Rien dans la note, rien qui le dise** : pas de jalon, pas de ligne dans le bandeau de fin, aucune mention « ne compte
   pas » à l'écran de l'élève (le mot `reflexion` ou « Pour réfléchir » ne s'affiche pas non plus). Les réponses restent rangées comme les
   autres (`db.questions[<séance>]`, `premiere`, `duree`, sorties de page) et visibles par l'enseignant dans « Conduite de
   séance » (réponses de la classe), comme les questions au fil.
5. **Élève déjà en cours** (le cas ne se pose pas pour ENT-6.2, fermée aux élèves) : si la séance a déjà commencé (un
   envoi dans la base), l'écran d'ouverture **n'est pas imposé** ; il reste dans le menu, sans cadenas sur le reste.
   Priorité absolue : jamais un élève bloqué.
6. **Contrôle au chargement** (comme le reste de `compilerQuestions`) : document inconnu, question d'ouverture notée,
   ouverture sans question → la séance refuse de s'ouvrir avec un message qui nomme la faute (tombe dans les tests).

## 3 bis. En séance d'évaluation (décision de Tristan, 10/10/2026, 10 h 35)

Les séances d'évaluation (`temps: 'evaluation'`, `copie: true`) ont aussi leur écran « Avant de commencer », avec ces
différences (bascule « Voir en mode évaluation » sur la page d'essai) :

- **Les questions les plus importantes des séances de travail de la compétence sont reprises** (guidage, entraînement) :
  le brief de l'évaluation les nomme (par leur `id` dans les fichiers de questions des séances d'avant), et elles
  s'appliquent **au cas de l'évaluation** (jeu de données neuf, règle du dépôt : on reprend la question, pas ses chiffres).
  Proposition pour l'écriture : chaque question de travail peut porter `cle: true` (« à reprendre en évaluation ») ; le
  brief de l'évaluation choisit parmi elles.
- **Elles sont notées.** La part sur 20 est déclarée dans le fichier de questions de l'évaluation (`ouverture.part`,
  **4 points sur 20**, validé par Tristan le 10/10/2026) ; le reste vient des jalons.
- **Aucune aide** : pas de bloc « Aide », pas de bouton « Voir le document », pas de mots cliquables, pas d'encadré.
  Les documents du cas restent à gauche (le texte de droit compris : on applique une règle, on ne la récite pas — règle du
  08/10/2026 ; validé par Tristan le 10/10/2026).
- **Un choix « Je ne sais pas »** est ajouté à chaque question, toujours en dernier (jamais mélangé).
- **Une réponse fausse retire des points**, pour décourager les réponses au hasard. Barème (validé par Tristan le 10/10/2026), par question de
  poids 1 : juste = +1 ; « Je ne sais pas » = 0 ; fausse = − 1 ÷ (nombre de mauvaises réponses). Avec 3 choix (1 juste,
  2 faux), une fausse vaut − 0,5 : répondre au hasard rapporte 0 en moyenne, autant que « Je ne sais pas ». La part des
  questions ne descend **jamais sous 0** (elle ne mord pas sur les points du travail).
- **L'élève est prévenu**, en une phrase de la tutrice : « Une réponse fausse retire des points. Si tu ne sais pas,
  choisis « Je ne sais pas » : tu ne perds rien. » (c'est ce qui rend la règle utile ; à l'inverse des séances de travail
  où rien n'est dit sur la note).
- **Pas de correction pendant l'évaluation** : après « Répondre », seulement « Réponse enregistrée. » (ni ✓ / ✗, ni
  retour) ; la correction vient avec le bilan, comme pour le reste de la copie. Pas de « Corriger » (évaluation).
- Le bandeau de fin et le Suivi montrent la part des questions sur une ligne (« Les questions : x / 4 »), avec le
  détail juste / « Je ne sais pas » / faux pour l'enseignant.
- Tests : juste partout = part pleine ; « Je ne sais pas » partout = 0 ; faux partout = 0 (plancher), pas moins ; un
  faux + un juste sur deux questions = 0,5 / 2 de la part ; aucune aide, aucun mot cliquable, « Je ne sais pas » en
  dernier ; pas de verdict avant le bilan.

## 3 ter. Chaque élève a ses propres questions (décision de Tristan, 10/10/2026, 10 h 36)

But : éviter que les élèves se passent les réponses. Vaut pour l'écran « Avant de commencer » de **toutes** les séances
nouvelles, et **d'abord pour les évaluations**.

- **Réutiliser le tirage qui existe** (`core/tirage.js` : `declarerTirage`, graine par élève posée par `poserGraine`,
  `hasard(graine)`), pas un mécanisme parallèle. Même élève = mêmes questions à chaque rechargement et sur tous les postes ;
  deux élèves voisins = questions différentes.
- **Une banque par séance**, rangée par **rubrique** (`preparation`, `droit`, `image`…) ; la séance dit combien elle en
  tire par rubrique (ex. 2 de préparation, 2 de droit, 1 d'image). Chaque rubrique contient **au moins le double** de ce
  qu'on tire, sinon le contrôle au chargement refuse la séance.
- **Questions à valeurs tirées** quand c'est possible : une même question avec des nombres différents par élève, la
  bonne réponse et les pièges **calculés** (ex. consigne : n fûts × 40 € + m casiers × 4 €, avec n et m tirés ; pièges =
  fûts seuls, casiers oubliés, 0 €). Les valeurs ne recopient jamais celles d'un jalon de la séance (ex. pas les 9 fûts
  et 5 casiers de Malo).
- **Ordre des questions et ordre des choix** tirés par élève (« Je ne sais pas » reste toujours en dernier).
- **En évaluation** : les questions reprises des séances de travail (`cle: true`) sont tirées dans le même esprit ; une
  question reprise s'écrit sur le cas de l'évaluation avec des valeurs tirées.
- **Équité** : toutes les questions d'une même rubrique ont le même poids et une difficulté comparable ; ce que l'élève a
  tiré est rangé dans sa base (comme les autres tirages) et **lisible par l'enseignant** (Conduite de séance, corrigé
  par élève).
- Tests : deux élèves de graines différentes n'ont pas les mêmes questions (au moins une différente) ; un même élève
  retrouve les siennes après rechargement ; une banque trop petite est refusée ; valeurs tirées → bonne réponse juste
  pour 50 graines au hasard (écrites dans le test, pas recalculées par le code testé).

Pour ENT-6.2, la banque est à compléter par Cowork (ou par Tristan) avant la construction : les 5 questions de la page
d'essai en sont la première moitié.

## 4. ENT-6.2 : le contenu (premier jet, validé à l'essai par Tristan)

Tutrice : Inès. Documents : message de Malo, fiche client, stock, conditions de vente, **« Le droit »** (Code civil,
article 1113, extrait réel : « Le contrat est formé par la rencontre d'une offre et d'une acceptation par lesquelles les
parties manifestent leur volonté de s'engager. » — article issu de l'ordonnance du 10 février 2016 ; formule retrouvée par recherche web le 10/10/2026 (Légifrance
JORFSCTA000032004942, Lefebvre Dalloz) : **relire une fois la phrase entière sur Légifrance avant de livrer**).
Les questions **préparent la lecture sans résoudre le piège en chaîne** (ni le minimum, ni le jour, ni le remplacement).
Les deux questions de droit : le contrat de vente (offre = commande de Malo, acceptation = la réponse de l'élève) et la
consigne (montants fixés par arrêté, calculés sur un autre client que Malo pour ne pas donner ses vides : jalon 5).

| id | Énoncé | Juste | Pièges | Aide → document |
|---|---|---|---|---|
| `qui-est-malo` | Qui est Malo pour France Boissons ? | un client (bar, CHR) | fournisseur · collègue | fiche client, mot CHR |
| `les-vides` | Malo écrit « reprends mes vides ». De quoi parle-t-il ? | ses fûts et casiers consignés, rendus vides | bouteilles à jeter · commande à annuler | **images** : `futs-mur.jpg`, `casier-vides.jpg` (déjà dans le dépôt, crédits en place), mots vides / consigne |
| `ou-regarder` | Pour savoir ce qu'on peut livrer à Malo, où regardes-tu ? | le stock et les conditions de vente | le message de Malo · la fiche client seule | stock |
| `consigne-rendue` (éco-droit) | Un bar rend au chauffeur 2 fûts vides et 3 casiers vides. Combien de consigne France Boissons lui rend-il ? | 92 € (2 × 40 € + 3 × 4 €) | 80 € (fûts seuls) · 0 € (jamais rendue) | conditions de vente |
| `vente-conclue` (éco-droit) | Malo a envoyé sa commande. D'après l'article 1113 du Code civil, la vente est-elle déjà conclue ? | non : il faut que France Boissons accepte sa commande | oui, dès l'envoi de la commande · non, seulement quand Malo aura payé | Le droit |

Retours d'Inès : voir la page d'essai (mot pour mot). Le message d'accueil d'Inès (mail) est raccourci en conséquence
(il ne redit pas ce que l'écran d'ouverture a dit).

## 5. Tests attendus

Bloc `questions` (moteur) : ouverture déclarée → écran à l'arrivée, menu fermé, ouvert après les réponses ; réponse fausse
→ ✗ + retour, « Continuer » possible ; une seule question visible à la fois, navigation par pastilles et Précédente /
Suivante ; page sans défilement à 1366 × 768 ; aucune ligne de note, aucun jalon (note de la séance inchangée), aucun
texte « ne compte pas » / « Pour réfléchir » à l'écran de l'élève ; élève déjà en
cours → pas de cadenas ; déclarations fautives refusées. Bloc `france-boissons` : ENT-6.2 ouvre sur « Avant de
commencer », parcours juste toujours au maximum. Sabotages dans les deux sens. Réécrire un cas existant : le dire à Tristan.

## 6. Pour la suite (S2)

Chaque séance France Boissons 6.1 et 6.3 à 6.10 déclare son écran « Avant de commencer » dans son brief (Cowork) :
questions de préparation, **2 ou 3 questions d'économie-droit** appliquées au cas, documents (dont le texte de droit),
**images** pour les séances qui font découvrir un matériel (6.4 réception, 6.5 rangement, 6.7 préparation vocale…), aide.
À ajouter au modèle de brief (`docs/briefs/MODELE.md`) : une section « Avant de commencer ». Même chose pour tout
scénario nouveau. ENT-6.1 : à décider avec Tristan (elle a déjà sa propre ouverture par l'organigramme).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

### Lot 1 — livré le 10/10/2026 (écran d'ouverture + ENT-6.2)

**Décision de Tristan (10/10/2026) : accueil actuel et « Avant de commencer » restent séparés, les questions d'abord, puis
l'Accueil** (variante A de la page d'essai `essai-avant-de-commencer-et-accueil-ENT-6.2.html`). Raison : les étapes de l'accueil
disent déjà « stock, minimum, jour de tournée » et souffleraient la réponse à « Où regardes-tu ? ».

- **Moteur** (`core/types/questions.js`, `core/types/entreprise.js`, `styles/questions.css`) : `ouverture` + questions
  `type: 'ouverture'` ; contrôle au chargement (document inconnu, question non citée, ouverture sans question, question
  d'ouverture notée ou à `reflexion`, image d'un autre domaine, crédit manquant, document hors écran) ; entrée « Avant de
  commencer » en tête du menu ; menu fermé tant que tout n'est pas répondu ; « Continuer » → Accueil ; élève déjà en cours,
  enseignant, copie rendue : jamais bloqués ; aide repliée qui reste ouverte ; sorties de page comptées comme pour les autres questions.
- **Pas de jalon, pas de ligne au bandeau** : `notees` exclut les questions d'ouverture.
- **ENT-6.2** : 5 questions (`qui-est-malo`, `les-vides`, `ou-regarder`, `vente-conclue`, `consigne-rendue`), 6 onglets dont
  « Photos » (`futs-mur.jpg`, `casier-vides.jpg`, crédits déjà en place) ; pied de « Le droit » = « Texte de loi (réel) — source :
  Légifrance » (il disait « reconstitution », faux pour un texte réel) ; mail d'accueil d'Inès raccourci (« Prends la commande de Malo : … »).
- **Tests** : `questions` (+8 cas, 97/97), `france-boissons` (+1 cas, 51/51). Sabotés dans les deux sens (menu non fermé, séance
  commencée ignorée, enseignant bloqué, question d'ouverture notée) : chaque sabotage fait tomber son cas. Cas existants modifiés :
  voir `docs/decisions.md` (ligne du 10/10/2026, « Avant de commencer »).
- **Vérifié** : page à 1366 × 768 (le bas du bloc ≤ 768 px, aide ouverte et retour affiché), aucune requête hors du domaine.
- **Supposé / à faire** : la phrase de l'article 1113 n'a **pas** pu être relue sur Légifrance (accès refusé) ; elle est reprise de
  l'écriture précédente (deux alinéas, conforme à ma connaissance du texte) : à relire par Tristan ou Cowork. Lots 2 (évaluation
  notée sur 4) et 3 (tirage par élève, banque de 10 questions pour ENT-6.2 à écrire par Cowork) : **non faits**.
