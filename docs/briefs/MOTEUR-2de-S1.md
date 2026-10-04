# Brief de chantier — MOTEUR : ce que la 2de et le scénario Smoby (S1) demandent au moteur

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-smoby.md, docs/EN-COURS.md, puis le brief docs/briefs/MOTEUR-2de-S1.md. Commence par le lot 0 (état des lieux, lecture seule) et donne-moi le compte rendu avant d'écrire. Annonce la durée de chaque lot.
> ```

**Statut** : en cours — lot 0 rendu, lots 1 et 2 livrés le 04/10/2026 *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 04/10/2026
**Conversation d'origine** : Cowork (Opus), cadrage de S1 ; fiches projet `claude/prepalog-2de-s1-cadrage.md`,
`claude/prepalog-2de-eleve-debut-annee.md`, `claude/prepalog-2de-socle-transversal.md`
**Modèle** : Opus pour les lots 4 et 5 (changements de vue) ; Sonnet suffit pour les lots 1, 2, 3, 6.
**Durée estimée par Cowork** : 8 à 11 h en tout, en 7 lots livrables séparément. **Un chantier moteur à la fois** : il
passe **après** la vue Planning (en cours, `MOTEUR-vue-planning.md`). Le Plan d'entrepôt (séance C2) aura son propre brief
après sa maquette.

## 0. Pourquoi ce brief

Le scénario S1 de la 2de GATL (Smoby → Kuehne+Nagel, 6 séances d'1 h, guidage) est cadré. Il réutilise surtout ce qui
existe (environnement d'entreprise, messagerie, quai, Planning), mais il lui manque des **briques communes** que toute la
2de réutilisera (S2 France Boissons, S3 Mondial Relay) et qui servent aussi en 1re. Les séances (briefs `ENT-5.x`) ne
touchent pas `core/` : tout ce dont elles ont besoin est ici.

Public (fiche `prepalog-2de-eleve-debut-annee.md`) : élèves de **début de 2de**, qui lisent mais décrochent vite, à l'aise
de façon très inégale à l'ordinateur. Règles d'écriture : 3 lignes au plus par bloc, une consigne par écran, informations
utiles en gras ou en tableau, geste nouveau montré une fois.

## Lot 0 — État des lieux (lecture seule, ~30 min, compte rendu à Tristan avant d'écrire)

Pour chaque lot ci-dessous, dire en français courant **ce qui existe déjà**, ce qui manque, et si la proposition du brief
contredit le code. En particulier :
- messagerie : la réponse est-elle seulement un texte libre avec `amorce` (relevé par Cowork : `#repT` + `sel.amorce`,
  `envoyerReponse()` dans `entreprise.js`) ? Les déclencheurs `apresMail` lisent-ils le texte ?
- ce qui est **déjà enregistré** par élève et par séance : temps, ouvertures d'aides (`aides: 'bouton'`), essais (dépôt
  tableur `essais`), amorces passées ;
- la vue quai : ce qui dépend du froid (relevé par Cowork : `lieu.refrigere` existe mais le ticket, la sonde, le temps hors
  froid et la note de rapidité sont toujours actifs ; animation `transpalette()` + chauffeur) ;
- l'écran Réceptions : peut-on saisir une quantité reçue différente du BL ? existe-t-il un statut « en litige » (ou
  `bloquer` du quai ENT-4.3, `annulee` des commandes) réutilisable ?
- `core/competences.js` : seuls les codes Logistique C1.1 à C3.4 existent.

## Lot 1 — Référentiels de la 2de : OTM, AGOrA, domaines D1 à D5, note par spécialité (~1 h 30)

Décision du 03/10 (`docs/decisions.md`) : la 2de pioche dans trois référentiels. Codes : Logistique inchangés (`C1.4`),
**`OTM-C2.1`**, **`AGO-2.1`**. Libellés : fiches projet `referentiel-bac-otm.md` et `referentiel-bac-agora.md` (Cowork
les recopiera dans le dépôt si Claude Code ne les a pas : le demander à Tristan).
- `core/competences.js` : ajouter les compétences OTM et AGOrA **utilisées par S1** au minimum : `OTM-C2.1` (constituer le
  dossier transport), `OTM-C2.2` (réserver et planifier l'opération), `OTM-C2.3` (suivre l'opération, rendre compte),
  `OTM-C3.2` (temps de conduite, notion), `AGO-3.1` (suivi de carrière : procédures d'entrée et de sortie), `AGO-3.2`
  (suivi organisationnel : planifier présences et congés). Libellés exacts : fiches référentiel ; **à vérifier au mot près**
  (lecture automatique de l'arrêté).
- Spécialité d'une compétence = son préfixe (`OTM-` → transport, `AGO-` → gestion, sans préfixe → logistique).
- Suivi de classe : pour un groupe de niveau `2de`, une **moyenne par spécialité** (LOG / OTM / AGO) à côté de la moyenne
  par compétence (accord de principe de Tristan, 03/10). Même règle de calcul que les compétences (coefficients par temps).
- Domaines D1 à D5 : facultatif dans ce lot (champ `meta.domaines: ['D2']`, lu nulle part pour l'instant) — **ne pas
  construire d'écran**.
- `meta.parcours: 'coeur' | 'complement'` (décision 14 de la finalité) : **déjà demandé ailleurs ?** Si le nom est déjà
  fixé (brief Planning, question ouverte), le reprendre ; toutes les séances de S1 sont `'coeur'`.

## Lot 2 — Message par phrases à choisir (~1 h 30)

Besoin (décision 19 de S1) : en début de 2de, l'élève **construit** son message en choisissant une phrase par ligne dans une
liste, au lieu de rédiger. Sert dans les 6 séances de S1 (et S2, S3).

Proposition d'API (dans le mail semé par le volet, ou dans un « Nouveau message » déclaré) :
```js
{ from: 'Sophie Martin', subject: 'Le cariste pour le pic de Noël', text: '…',
  phrases: {                                  // présent = le bouton « Répondre » ouvre la réponse à composer
    lignes: [
      { id: 'salut', choix: ['Bonjour Sophie,', 'Salut !', 'Coucou Sophie'], juste: 0 },
      { id: 'qui',   choix: (db) => [...], juste: (db) => … },   // valeurs calculées possibles
      …
    ],
    melanger: true,                           // ordre des choix tiré par élève (graine), pas d'ordre « bon en premier »
  } }
```
- À l'écran : une liste déroulante (ou des boutons) **par ligne**, l'aperçu du message se compose en dessous, « Envoyer ».
- Le message envoyé est rangé comme un texte ordinaire (dossier Envoyés) **et** garde les choix (`mail.phrases: { salut: 0,
  … }`) pour les jalons : `phrasesJustes(db, idMessage)` → `{ envoye, justes: [ids], faux: [ids] }`.
- Guidage : pas de correction ligne à ligne avant l'envoi (cohérent avec le reste de S1 : correction à la fin) ; le bilan
  dit quelles lignes étaient fausses.
- `apresMail` doit continuer de marcher (déclencheur après l'envoi, juste ou faux).
- Aucun jalon vrai par inaction : un message non envoyé = toutes les lignes fausses.

## Lot 3 — Mots cliquables (~1 h)

Besoin (décision 20) : un mot métier souligné dans un texte du contenu ; un clic (ou Entrée) affiche sa définition en
**une phrase**, dans une petite bulle, sans quitter l'écran.
- Déclaration : un `lexique` dans `creerEntreprise` (`{ CACES: 'Certificat qui prouve qu\'on sait conduire un type
  d\'engin ; une catégorie par sorte de chariot ; valable 5 ans.', … }`) et, dans les textes, une marque légère
  (proposition : `[[CACES]]`) transformée par le moteur. Mot absent du lexique = texte normal (pas d'erreur).
- Accessible : bouton réel, focus clavier, Échap ferme.
- **Chaque ouverture est comptée** (par mot, par séance) pour les indicateurs du lot 6.

## Lot 4 — Vue quai : mode « sans froid » et « cariste au chariot » (Opus, ~2 h)

Besoin : séance C1 (`ENT-5.3`), réception de jouets venant de l'usine Smoby d'Arinthod. Réutiliser la vue quai de Picard
**en version simple**.
- `lieu.refrigere: false` (ou un champ `froid: false`, au choix de Claude Code) **éteint** : le ticket de l'enregistreur et son
  QCM, la sonde à cœur, le temps hors froid (jauge, horloge, chambre froide), la note de rapidité, les motifs de température.
  L'étape ④ devient « Rentrer en zone de réception » (ou équivalent déclaré par le contenu) au lieu de la chambre froide.
- **Animation `dechargement: { par: 'cariste' }`** : un **chariot élévateur frontal** conduit par une silhouette **sans
  visage** sort les palettes (au lieu du chauffeur au transpalette). Légendes au même modèle (« Yanis sort la palette P2 au
  chariot »). `prefers-reduced-motion` respecté.
- Tout le reste inchangé : tour de la palette, comptage par couches, étiquette, décision + motif (motifs utiles ici :
  conforme, **carton écrasé**, **manquant**), réserves précises, signature, aides de guidage (règle des couches, détail du
  comptage, repère, chef de quai).
- Rien de « Smoby » dans `core/`. Tests : le bloc `picard` doit rester vert ; un cas « sans froid » dans le bloc de la
  séance.

## Lot 5 — Étape « sécurité avant déchargement » (Opus, ~1 h 30)

Besoin : C1 commence par **constater une situation** avant d'entrer dans la remorque. Proposition : une **étape 0 de la
vue quai** (« Avant de décharger »), déclarée par le contenu :
```js
securite: {
  scene: "Le semi d'Arinthod est à quai, quai 2, 07:10. Le chauffeur a coupé le moteur …",   // 3 lignes au plus
  points: [ { id: 'cale', lib: 'Camion calé', ok: false }, { id: 'moteur', lib: 'Moteur coupé, clés remises', ok: true }, … ],
  signaler: { bouton: 'Signaler au chef de quai', reponse: 'Bien vu, je fais poser la cale. Tu peux décharger.' },
}
```
- Pour chaque point : « OK » / « Pas OK ». Deux boutons : « Signaler au chef de quai » et « Commencer à décharger ».
- **Décharger alors qu'un point est « pas OK » sans l'avoir signalé** : en guidage, le chef de quai arrête l'élève (comme le
  « froid d'abord » de Picard) ; l'élève peut corriger. Le jalon reste faux s'il n'a pas signalé avant.
- Jalons fournis : `securiteSignalee` (le point faux signalé avant de décharger), `securiteConstat` (aucun « OK » sur un point
  faux, aucun « pas OK » sur un point juste — faux si rien n'est coché).
- Plus tard (décision de Tristan) : la même étape se jouera sur une **image à inspecter** (vue n° 6) ; garder la déclaration
  `points` indépendante de l'affichage.
- Alternative acceptable si le code l'impose : un écran de l'environnement avant l'entrée « Quai » ; le dire au compte rendu.

## Lot 6 — Indicateurs de repérage pour l'enseignant (~1 h 30)

Besoin (décision 5 de S1) : S1 sert à **repérer les élèves « confirmés »**. L'enseignant seul voit, pour chaque élève et
chaque séance : **temps passé**, **aides ouvertes** (mots cliquables, boutons d'aide, amorces suivies ou passées),
**jalons réussis du premier coup** (au premier envoi / premier dépôt / première validation). L'élève ne voit rien.
- Lecture seule, dans le suivi de classe (une colonne ou un détail dépliable par séance) ; **pas d'export** dans ce lot.
- Le **temps réel de guidage** du quai (`detail.quai.reel`, enregistré mais jamais montré : compte rendu ENT-4.1) rentre ici.
- Pas de « recommandation » calculée : Tristan règle lui-même standard / confirmé (règle ferme).

## Lot 7 — Entreprise n° 5 Smoby dans `activites/index.js` (~15 min, peut aller avec la première séance)

Ligne `ENTREPRISES` : `{ n: 5, nom: 'Smoby', metier: 'Jouets — plateforme de Moirans-en-Montagne (Jura)', logo: … }`.
**Logo : à récupérer avec l'accord de Tristan** (comme Cdiscount et Picard) ; tant qu'il n'est pas là, pas de logo.
Kuehne+Nagel apparaît dans les séances B (agence Route de Besançon), sous le même numéro 5 (un scénario = une entreprise).

## 8. Tests attendus

Un bloc `smoby` (nouveau, une ligne dans `BLOCS` — **le dire à Tristan**, alerte 7) pour les lots 2, 3, 5, 6 ; le lot 4
ajoute ses cas au bloc `picard` (non-régression) et au bloc `smoby` (sans froid). Chaque jalon éprouvé dans les deux sens
(sabotage), aucun jalon vrai par inaction, ordre des phrases tiré par élève stable d'une ouverture à l'autre.

## 9. Critères de validation par Tristan

Une page d'essai (`outils/essai-2de.html`) où il peut : composer un message par phrases ; cliquer un mot ; jouer l'étape
sécurité puis un quai sans froid avec un chariot ; voir les indicateurs d'un élève fictif. Au vidéoprojecteur et sur le poste
du lycée.

## 10. Questions ouvertes (valeur par défaut entre parenthèses : l'appliquer et le dire au compte rendu)

- [ ] Marque des mots cliquables dans les textes (`[[mot]]`).
- [ ] Phrases : liste déroulante ou boutons (liste déroulante, plus compacte).
- [ ] Logo Smoby : accord de Tristan à demander (pas de logo en attendant).
- [ ] Moyenne par spécialité affichée pour les groupes de 2de seulement (oui).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

### Lot 0 — état des lieux (04/10/2026, rendu à Tristan en conversation)

- Messagerie : réponse = texte libre (`#repT`, `amorce`) ; « Nouveau message » n'écrit qu'aux fournisseurs ; `apresMail` lit le
  texte envoyé (destinataire, ligne, nombre) → un message par phrases rangé comme un mail envoyé ordinaire garde les déclencheurs.
- Déjà enregistré : temps réel au quai seulement (`detail.quai.reel`) ; aides **non comptées** (les « ? » du tableur restent en
  mémoire de la page) ; essais : dépôt tableur et carte (`premierCoup`) ; rien pour les mails, le quai, les amorces.
- Quai : `lieu.refrigere` ne change qu'une étiquette ; ticket, sonde, hors froid, chambre froide, rapidité toujours actifs ; une
  décision n'est juste **que si la palette a été sondée** (à lever en mode sans froid). Motifs « Cartons endommagés » et
  « Manquant » existent.
- Réceptions : quantité comptée libre, décision accepté / sous réserve / refusé ; pas de statut « en litige » (blocage qualité au
  quai ENT-4.3 et à l'écran stock).
- `meta.parcours` déjà pris (parcours strict).

### Lot 1 — livré le 04/10/2026

- **Fichiers créés / modifiés** : `core/competences.js` (11 codes OTM, 9 AGOrA, `SPECIALITES`, `specialite()`,
  `seancesParSpecialite()`), `core/prof.js` (tableau « Moyennes par spécialité », `#tabSpe`, groupes de 2de),
  `activites/FICHE-SEANCE.md` (`competences`, `domaines`, `coeur`), `outils/test/socle.mjs` (3 cas **ajoutés**, aucun réécrit),
  `docs/fiches/referentiel-bac-otm.md` et `-agora.md` (déposées par Tristan, avec une note de vérification en tête).
- **Écarts par rapport au brief** : tous les codes OTM et AGOrA ajoutés, pas seulement les 6 de S1 (S2, S3 et la 1re en
  auront besoin ; libellés vérifiés une fois pour toutes). Libellés officiels, pas les résumés du brief (OTM-C2.2 = « Exécuter la
  demande du client/donneur d'ordre », OTM-C2.3 = « Suivre l'opération de transport et communiquer avec les interlocuteurs »).
  Cœur / complément : `meta.coeur: true | false` (le nom `parcours` est pris).
- **Décisions prises en route** : une séance compte une fois par spécialité ; tableau par spécialité séparé (le tableau par
  compétence et son export ne bougent pas) ; pas d'export CSV par spécialité ; apostrophes droites, comme les libellés existants.
- **Tests** : bloc `socle` 53 / 53 ; trois sabotages (séance comptée deux fois, tableau pour un groupe de 1re, domaine `D7`,
  préfixe ignoré) font chacun tomber leur cas ; suite entière 572 / 572.
- **Commits** : voir `git log` (« 2de : compétences OTM et AGOrA… »).
- **Reste ouvert** : lots 2 à 7, page d'essai `outils/essai-2de.html`.

### Lot 2 — livré le 04/10/2026

- **Fichiers créés / modifiés** : `core/phrases.js` (nouveau : `preparerPhrases`, `texteCompose`, `phrasesJustes`),
  `core/types/entreprise.js` (formulaire de réponse par phrases, envoi), `styles/base.css` (6 règles `.ent-phr-*`, aucune
  variable nouvelle), `outils/essai-2de.html` + `outils/essai-2de.js` (page d'essai, univers « réponse à Sophie » d'ENT-5.1),
  `outils/test/smoby.mjs` (nouveau bloc, 10 cas), `outils/test.mjs` (**une ligne : `smoby` ajouté à `BLOCS`**),
  `activites/FICHE-SEANCE.md`.
- **API** : `phrases: { id, lignes: [{ id, choix, juste } | { id, texte }], melanger }` sur un mail semé (volet ou
  déclencheur). `choix` / `juste` peuvent être des fonctions de la base, calculées **une fois** à l'entrée du mail dans la base
  (une base ne garde pas de fonction). `juste` = rang dans l'ordre déclaré. Ordre affiché tiré sur la graine de l'élève
  (`graine|id|ligne`) et rangé avec le mail (`ordre`), donc stable. Mail envoyé : `kind: 'text'`, texte des lignes, et
  `phrases: { id, choix: { ligne: rang déclaré } }`. Jalon : `phrasesJustes(db, id)` → `{ envoye, justes, faux, envois,
  premierCoup }`, lu sur le **dernier** envoi.
- **Écarts par rapport au brief** : seulement en **réponse** à un mail reçu (pas de « Nouveau message » déclaré par phrases :
  aucune séance de S1 n'en a besoin si le destinataire écrit d'abord ; à demander si besoin). Lignes imposées (`texte`)
  ajoutées : les briefs ENT-5.2 à 5.6 en ont (« J'ai reçu les 4 palettes d'Arinthod. »). L'envoi exige un choix à chaque ligne
  (un message incomplet ne part pas, l'élève garde ses choix).
- **Questions ouvertes appliquées par défaut** : liste déroulante (plus compacte). Une phrase longue est coupée dans la liste
  fermée sur un écran étroit ; l'aperçu, lui, la montre en entier.
- **Tests** : bloc `smoby` 10 / 10 (liste par ligne sans jugement avant l'envoi, aperçu sans redessin et focus gardé, message
  incomplet refusé, inaction = tout faux, message juste / une ligne fausse / correction au 2e envoi, `apresMail` juste ou faux et
  une seule fois, ordre stable à la réouverture et différent entre élèves, ligne imposée et valeurs calculées). Six sabotages
  (tout jugé juste, pas de mélange, choix non gardés, redessin à chaque choix, envoi incomplet accepté, `juste` calculé ignoré)
  font chacun tomber au moins un cas. Suite entière 582 / 582.
- **Reste ouvert** : lots 3 à 7.
