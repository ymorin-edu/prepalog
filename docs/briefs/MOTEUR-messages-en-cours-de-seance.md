# Brief de chantier — MOTEUR : messages qui arrivent en cours de séance (option B)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/EN-COURS.md puis implémente le brief docs/briefs/MOTEUR-messages-en-cours-de-seance.md. Annonce la durée avant de commencer, vérifie les points du §7 dans le code et dis-moi s'il y a un écart avec le brief avant de coder.
> ```

**Statut** : à valider par Tristan *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 03/10/2026
**Conversation d'origine** : Cowork, « cadrer l'option B » (Opus), fiche projet `claude/prepalog-reprise-option-b.md`
**Séance pilote** : ENT-2.1 `cdiscount-mouvements`, **aujourd'hui `pret: true` (ouverte aux élèves)** : voir §6.4 sur les élèves qui ont déjà commencé.
**Durée estimée** : environ 1 h (moteur petit + séance + trame + suite entière).

## 1. Pourquoi

Aujourd'hui, les mails d'une séance arrivent tous à l'ouverture (`volet.semer`). Tristan veut qu'un message puisse
arriver **pendant** le travail, « comme au travail, un collègue écrit pendant que tu travailles ». La mécanique existe
depuis ENT-3.2 (`volet.declencheurs`, `core/types/entreprise.js` ~l. 205-237) : arrivée **une seule fois**, marque dans
`db.volets['<volet>#<id>']`, vérifiée à chaque sauvegarde et à l'ouverture, toast « Nouveau message » visible sur tous les
écrans, badge de la messagerie. Ce chantier en fait **un outil réutilisable par toutes les séances**, sur deux gestes métier.

## 2. Décisions de Tristan (03/10/2026)

1. **Un système hybride, réutilisable** : une séance déclare ce qui déclenche la suite, au choix :
   - **« après le jalon X »** : l'élève a terminé une étape de son travail ;
   - **« après un mail envoyé à Y »** : l'élève rend compte à quelqu'un, comme au travail.
2. **Le déclencheur doit être proche d'une expérience métier.** **Aucun clic de menu ni ouverture d'écran ne déclenche
   quoi que ce soit** (crainte de Tristan : un élève qui clique partout au début ferait arriver le message). On **écarte**
   donc les déclencheurs « écran ouvert » et « au bout de N minutes ».
3. **La trace ne compte pas dans le suivi** : le déclencheur n'est ni un jalon ni un point du barème.
4. **ENT-2.1 est la séance pilote** : le retour client et le constat de casse arrivent **après un premier compte rendu à Nadia**.
5. Règle générale ajoutée le même jour (voir `docs/decisions.md`) : *l'objectif de l'outil est de proposer des expériences
   ludiques et innovantes ; si une compétence peut être abordée sous un nouvel angle grâce à de nouvelles vues, on prend
   le temps de les insérer dans le moteur.*

## 3. Ce qu'il faut construire côté moteur (petit)

Deux **fabriques de conditions**, pures et testables, utilisables dans `volet.declencheurs[].quand` :

```js
// De préférence dans un fichier neuf : core/declencheurs.js (entreprise.js inchangé si possible).
apresJalon(etapes, id)             // (db) => l'étape `id` de `etapes` renvoie { status: 'ok' }
apresMail({ a, ligne, nombre })    // (db) => un mail ENVOYÉ (folder 'out') à l'adresse `a` existe,
                                   //   et, si `ligne` est donnée, il contient une ligne qui porte cet intitulé
                                   //   (même lecture que `ligne()` d'ENT-2.1 : sans accents ni majuscules) ;
                                   //   si `nombre: true`, cette ligne contient au moins un nombre
                                   //   (une fois retirés références et dates, comme `nombres()` d'ENT-2.1).
tous(...conditions)                // (db) => toutes vraies (pour combiner, ex. jalon + mail)
```

Règles :

- **`apresMail` se déclenche à l'envoi, que le contenu soit juste ou faux.** Ne **jamais** conditionner l'arrivée à une
  réponse juste dans un mail : l'arrivée révélerait la bonne réponse (alerte n° 28) et un élève qui se trompe resterait
  bloqué. `nombre: true` sert seulement à écarter un envoi vide (le clic « Envoyer » sur l'amorce telle quelle).
- **`apresJalon` réservé aux étapes dont l'élève voit lui-même qu'elles sont finies** (ex. ENT-3.2 : feuille vérifiée).
  Le dire en commentaire de la fabrique.
- Ce que fait déjà `declencheurs` **ne change pas** : une seule fois, marque dans `db.volets`, condition qui plante =
  fausse, toast, `declenche` sur le mail. ENT-3.2 n'est **pas** réécrite avec les fabriques (hors périmètre).
- `ligne()` et `nombres()` sont aujourd'hui dans `contenus/cdiscount-mouvements.js` : si les fabriques en ont besoin, les
  **déplacer** dans le fichier commun et les **réimporter** dans ENT-2.1 (pas de copie).
- Une ligne dans `activites/FICHE-SEANCE.md` (à côté de celle sur `declencheurs`) : comment écrire
  `quand: apresMail({...})` ou `quand: apresJalon(ETAPES, 'id')`.

## 4. Séance pilote ENT-2.1 : déroulé modifié

| Étape trame | Avant (option A) | Après |
|---|---|---|
| 2. Messagerie | 4 mails : Bienvenue, consigne de Nadia, retour client, casse (badge « 4 ») | **2 mails** : Bienvenue, consigne de Nadia (badge « 2 ») |
| 3. Stock actuel | relevé | relevé **puis envoyé à Nadia** : « Stock actuel : … » (premier compte rendu) |
| 3 → 4 | — | **à l'envoi**, le retour client (service retours) et le constat de casse (quai) arrivent, toast « Nouveau message » |
| 4 à 7 | inchangées | inchangées (les deux mails sont là avant l'étape 5, qui en a besoin) |

- **Condition** : `apresMail({ a: EQUIPE.cheffe.mail, ligne: LIGNES_REPONSE[0], nombre: true })`.
- **Consigne de Nadia** (`mailMission`) à reformuler, ton métier : avant de creuser, elle demande **d'abord le stock actuel**
  (« envoyez-moi d'abord votre stock actuel, une ligne : Stock actuel : … ; je vous fais suivre ensuite ce que le service
  retours et le quai m'ont transmis »), puis la réponse complète en six lignes comme aujourd'hui. **Texte à faire relire à
  Tristan** (proposer 2 formulations).
- Les deux mails gardent **leur texte et leurs expéditeurs** ; leur `ts` = **l'heure d'arrivée** (`Date.now()` au
  déclenchement), plus `now − 2 h / − 1 h`. Les **mouvements de stock gardent leurs dates** (inchangé).
- **Jalons : aucun changement.** Le jalon `actuel` lit déjà le meilleur de **toutes** les réponses à Nadia : le premier
  compte rendu compte donc s'il est juste. Les autres jalons ignorent un compte rendu partiel (ils prennent le meilleur essai).
- **Amorce** : le champ « Répondre » s'ouvre avec les six intitulés. Pour le premier compte rendu, l'élève remplit la
  première ligne et envoie. Accepté tel quel (pas de deuxième amorce) ; voir la question ouverte 1.
- `ACCUEIL.etapes` : ajouter « Envoyer le stock actuel à Nadia » entre « Trouver le stock actuel » et « Lister les mouvements ».

## 5. Trame élève ENT-2.1

`outils/trame-cdiscount-mouvements.py` : à l'étape 2, ne plus annoncer quatre mails. À la fin de l'étape 3, ajouter
une consigne : « Envoie ton stock actuel à Nadia (Répondre, complète la première ligne, Envoyer). Attends sa suite. »
Ne **pas** dire que ce sont un retour et une casse qui arrivent (règle de la page 1 : « les autres documents »).
Régénérer `.docx` et `.pdf` et le corrigé (`contenus/corriges/ENT-2.1.js`) si une question change. La trame reste **non
déclarée** (`trame:` absent).

## 6. Contraintes et pièges

1. **Ne pas récompenser l'inaction** (alerte n° 18) : sans envoi, rien n'arrive ; aucun jalon ne dépend de l'arrivée.
2. **Ne rien révéler** (alerte n° 28) : arrivée à l'envoi, juste ou faux ; aucun texte du type « bonne réponse, voici la suite ».
3. **Cloisonnement** (alerte n° 16) : la marque vit dans `db.volets` de la base de la séance (base propre à ENT-2.1) ; rien
   de partagé avec ENT-2.2 ou 2.3.
4. **Élèves qui ont déjà commencé ENT-2.1** (séance ouverte depuis le 03/10) : ils ont déjà les deux mails, semés à
   l'ouverture. Le déclencheur **ne doit pas les reposer** : `semer` du déclencheur vérifie par l'objet du mail
   (comme `aDejaBienvenue`) et ne renvoie rien s'ils sont là. Le volet `mouvements-1` ne se rejoue pas : ne pas changer son `id`.
5. **Réinitialisation** (`reinitialisable: true`) : après « repartir de zéro », la base repart sans marque : le déclencheur
   se rejoue normalement au premier envoi.
6. **Copie rendue** : plus rien ne s'écrit dans la base ; un envoi impossible ne déclenche rien (vérifier).
7. **Un seul chantier moteur à la fois** : s'inscrire dans `docs/EN-COURS.md` ; si `core/types/entreprise.js` est inscrit
   par une autre session, **s'arrêter et le dire à Tristan**.

## 7. À vérifier dans le code avant de coder (lu par Cowork le 03/10, à reconfirmer)

- `volet.declencheurs` et `declencher()` : `core/types/entreprise.js` ~l. 205-237 ; `declencher()` appelé à chaque `sauver()`
  et à l'ouverture ; envoi d'un mail = `sauver()` (~l. 775, 801).
- Le toast `toast('Nouveau message : …')` s'affiche **quelle que soit la vue** (pas seulement la tournée) ; le badge
  de la messagerie compte les non-lus (~l. 412, 641). Si ce n'est pas le cas en dehors de la tournée : le dire.
- `mailMission` porte `amorce` ; `reponses(db)` filtre `folder === 'out'` et `toMail` = mail de la cheffe.

## 8. Tests attendus

- **Fabriques** (bloc `socle` ou un bloc moteur existant, au choix de Claude Code ; le dire) : `apresMail` vrai après un
  envoi à la bonne adresse, faux pour une autre adresse, faux pour un brouillon / un mail reçu, faux si la ligne est vide
  avec `nombre: true`, vrai si le nombre est **faux** ; `apresJalon` vrai seulement sur `ok` ; `tous`.
- **Bloc `cdiscount`, cas préfixés « ENT-2.1 »** (valeurs écrites à la main) : à l'ouverture, **2 mails** (pas de retour ni
  de casse) ; ouvrir des écrans, lire les mails, ouvrir Mouvements, taper `.movements` : **rien n'arrive** ; envoi de l'amorce
  vide : rien ; envoi « Stock actuel : 5 » (faux) : les deux mails arrivent, **une seule fois** ; un second envoi : rien de
  plus ; remontage et reconnexion : pas de doublon ; **base d'un élève qui a déjà les deux mails** : aucun doublon ; jalon
  `actuel` ko sur 5, ok sur 27 (ou la valeur recalculée, écrite à la main dans le test) ; les 5 jalons inchangés sur la
  réponse complète.
- **Sabotages** : déclencheur qui exige une réponse juste ; mails remis dans `semer` ; déclencheur sans garde anti-doublon ;
  `nombre: true` retiré (l'amorce vide déclenche).
- **Alerte 7** : les cas ENT-2.1 qui comptent 4 mails à l'ouverture seront **réécrits** : le dire explicitement à Tristan.
- `visibilite.mjs` récemment réécrit : ne pas le casser. Dire si `outils/test.mjs` ou `commun.mjs` est touché.
- **Suite entière** avant commit.

## 9. Supports

Trame régénérée (§5), toujours non déclarée. Corrigé à régénérer si une question change. Pas de diaporama.

## 10. Critères de validation par Tristan

Jouer ENT-2.1 avec un compte élève neuf :
1. à l'ouverture, **2 mails** seulement ; cliquer partout (menus, Stock, Mouvements, console) ne fait **rien** arriver ;
2. répondre à Nadia avec seulement « Stock actuel : … » (même faux) : le toast « Nouveau message » apparaît et les mails du
   retour et de la casse arrivent, à l'heure réelle ;
3. renvoyer un message : rien de plus n'arrive ;
4. la réponse complète en six lignes donne les mêmes jalons qu'avant ;
5. avec un compte élève qui avait déjà commencé : pas de mails en double.

**Statut de la séance** : ENT-2.1 est `pret: true` et ouverte. **Demander à Tristan** avant de pousser s'il faut la repasser
en `pret: false, ouverture: 'prof'` le temps de la valider (règle du 03/10 : une séance livrée naît fermée ; ici elle existe déjà).

## 11. Questions ouvertes

- [ ] **Amorce du premier compte rendu** : l'élève voit six intitulés et n'en remplit qu'un. Suffisant, ou faut-il que la
  première réponse s'ouvre avec la seule ligne « Stock actuel : » (petite option moteur : amorce selon le nombre de réponses déjà envoyées) ?
  Recommandation : garder tel quel pour ce chantier.
- [ ] **Texte de la consigne de Nadia** : 2 formulations à proposer à Tristan (§4).
- [ ] **Mail de Nadia en réponse au compte rendu** (« Merci, je vous fais suivre… ») : en plus des deux documents, ou rien ?
  Recommandation : rien (les collègues écrivent eux-mêmes, c'est plus réaliste et ça ne commente pas la réponse).
- [ ] **ENT-2.1 fermée pendant la validation ?** (§10).

## 12. Fichiers touchés

| Partie | Fichiers | Nature |
|---|---|---|
| Fabriques `apresJalon`, `apresMail`, `tous` (+ `ligne`, `nombres` déplacées) | `core/declencheurs.js` (neuf) ; `core/types/entreprise.js` **seulement si nécessaire** | **moteur (petit)** |
| Fiche | `activites/FICHE-SEANCE.md` | doc |
| Séance pilote | `contenus/cdiscount-mouvements.js` (volet, consigne, accueil) | contenu |
| Trame | `outils/trame-cdiscount-mouvements.py`, `contenus/trames/ENT-2.1-…docx/.pdf`, `contenus/corriges/ENT-2.1.js` | supports |
| Tests | `outils/test/cdiscount.mjs`, bloc des fabriques | tests |

- **Ne pas lancer en même temps** qu'un autre chantier inscrit sur `core/types/entreprise.js` ou `outils/test/cdiscount.mjs`.
- **Peut se faire en même temps que** : la relecture des textes de la consigne par Tristan.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `core/declencheurs.js` (neuf : `apresJalon`, `apresMail`, `tous`, et `ligne`,
  `nombres`, `nrm` déplacées d'ENT-2.1) ; `core/types/entreprise.js` (bulle à l'envoi, voir écarts) ;
  `contenus/cdiscount-mouvements.js` (volet : 2 mails à l'ouverture, déclencheur `documents`, consigne B, étape
  d'accueil ajoutée ; `ligne`/`nombres` réexportées pour ENT-2.3) ; `activites/cdiscount-mouvements.js` (commentaire) ;
  `activites/FICHE-SEANCE.md` ; `outils/trame-cdiscount-mouvements.py`, trame `.docx`/`.pdf`, `contenus/corriges/ENT-2.1.js` ;
  `outils/test/cdiscount.mjs`.
- **Écarts par rapport au brief** (et pourquoi) :
  1. **`entreprise.js` touché (3 lignes utiles)** : le site n'a qu'une bulle ; « Réponse envoyée. » écrasait aussitôt
     « Nouveau message : … ». Désormais `declencher(avant)` : un envoi qui fait arriver un message affiche « Réponse
     envoyée. Nouveau message : Service retours » (idem « Message envoyé. » vers un fournisseur). Validé par Tristan.
     Le bandeau « Nouveau message » en tête d'écran reste propre à la tournée ; ailleurs : bulle + pastille.
  2. **Consigne de Nadia** : « je vous les ai fait suivre » devenait faux ; remplacé par « ils vous écriront dans la
     messagerie », et la formulation B (« On procède en deux temps ») choisie par Tristan, sans « je vous fais suivre »
     (les mails viennent du service retours et du quai, pas d'elle).
  3. **Trame, étape 2** : « tu répondras à l'étape 7 » corrigé aussi (le brief ne citait que l'étape 3). Fin de l'étape 3 :
     consignes d'envoi + « Ce que tu dois voir » (bulle, pastille, « ces nouveaux messages te serviront à l'étape 5 »),
     sans dire ce qu'ils contiennent. 11 pages, une étape par page (vérifié dans le PDF).
  4. `apresJalon(etapes, id, U)` : troisième argument facultatif (l'univers), car `verifier(db, U)` en a parfois besoin.
  5. Tests des fabriques dans le bloc **`cdiscount`** (pas `socle`).
  6. PDF produit par **Word** (pas de LibreOffice sur ce poste) au lieu de LibreOffice : rendu très proche, à regarder.
- **Décisions prises en route** : Tristan (03/10) : consigne B ; bulle « les deux » ; **ENT-2.1 laissée ouverte** pendant la
  validation ; **aucune réponse de Nadia** au premier compte rendu ; amorce inchangée (question 1 : recommandation suivie).
  Mails déclenchés datés `Date.now() + 1 s / + 2 s` (après la réponse de l'élève, casse au-dessus du retour comme avant).
- **Tests** : bloc `cdiscount` 47/47, suite entière **368/368**. 3 cas nouveaux (fabriques ; déclencheur en Node ; vrai moteur :
  clics partout, `.movements`, amorce vide, « Stock actuel : 5 », second envoi, remontage, base ancienne, bulle, pastille).
  **Cas réécrits (alerte 7)** : « la séance s'ouvre… » (2 mails au lieu de 4), « Répondre à Nadia s'ouvre avec les six
  intitulés… » (l'autre mail testé est la Bienvenue, le retour n'étant plus là), « chaque mouvement a son document » (compte
  aussi les mails du déclencheur). `outils/test.mjs` et `commun.mjs` non touchés. **Sabotages éprouvés (6, tous tombent)** :
  déclencheur qui exige 27 ; mails remis dans `semer` ; garde anti-doublon retirée ; `nombre: true` retiré ; bulle non
  corrigée ; `apresMail` qui compte les mails reçus.
- **Commits** : voir `git log` (« Messages en cours de séance : … »).
- **Reste ouvert** : validation à l'écran par Tristan (§10). Jouée par Claude Code sur la page d'essai : 2 mails à
  l'ouverture, bulle « Réponse envoyée. Nouveau message : Service retours », casse et retour en tête de boîte.
