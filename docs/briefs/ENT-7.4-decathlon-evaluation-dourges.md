# Brief de séance — ENT-7.4 Decathlon, évaluation : un conteneur pour Dourges (1re, évaluation C2.6.1 et C2.6.2)

> **📋 Phrase à copier-coller dans ccode (après 7.1 à 7.3, et le §11 tranché) :**
>
> ```
> Lis docs/EN-COURS.md puis docs/briefs/ENT-7.4-decathlon-evaluation-dourges.md. Fais d'abord l'état des lieux du §7 en lecture seule (évaluation sur les vues de 7.1 à 7.3, Dialogue à choix en mode évaluation, part de l'ouverture notée à 3) et dis-moi ce qui manque. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : livré (15/10/2026)
**Date du brief** : 13/10/2026
**Conversation d'origine** : Cowork (Opus) ; décisions 5, 10, 14, 15 (cadrage) et 16 à 21 (maquette). **À lire avec ENT-7.1 à 7.3.**
**Modèle** : Sonnet.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-7.4 *(provisoire)* |
| `id` | `decathlon-evaluation-dourges` |
| Titre / desc | « Decathlon — évaluation : un conteneur pour Dourges » / « Choisir le transporteur d'un conteneur entre Anvers et l'entrepôt continental de Dourges dans la liste référencée, puis transmettre l'ordre de transport et prévenir le quai. » |
| Rubrique | simulog, entreprise n° 7 Decathlon |
| Niveau(x) | 1re |
| Compétence(s) | **C2.6.1** et **C2.6.2** |
| Temps pédagogique | **évaluation** (`copie: true`, `export const noter = (db) => moteur.noter(db)`) |
| Notation | jalons pondérés, note sur 20, coefficient 3 |
| Barème | `bareme: 20` (poids validés, décision 14) |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |
| Niveaux | aucun (évaluation : socle tiré, ni bonus ni niveau) |

## 2. Vérifié / construit

Comme 7.1. En plus :
- **Vérifié** : **Dourges** (62), plateforme multimodale **Delta 3**, entrepôt continental Decathlon (chiffres de 2017 : 100 millions
  d'articles par an — [Stratégies Logistique, 2017](https://strategieslogistique.com/Decathlon-gagne-quatre-jours-sur,7404)) ; terminal
  rail-barge **LDCT** (7 voies de 750 m, quai de 500 m — [Contargo](https://www.contargo.net/en/about-us/latest-news/detail/contargo-is-now-also-in-dourges-north-france/)) ;
  **barge Anvers → Dourges : Contargo, 2 à 3 dessertes par semaine** (communiqué du 04/02/2025).
- **Construit** : que Decathlon utilise ces services, les offres, le quai de Dourges et son chef de quai (fictif), les dates.

## 3. Objectif

Vérifier **la méthode, pas une réponse apprise** (décision 10) : autre entrepôt, autre carte, autres offres. **Contre la copie
(décision 22)** : l'offre en retard est tirée par élève, la bonne réponse est **le rail ou la barge** selon le tirage. Moins guidé : aucun encadré, aucune phrase d'aide, pas de pastilles « fait » ? *(à trancher, §11 n° 3)*, pas de
question au fil ; « Avant de commencer » noté.

## 4. Déroulé (≈ 50 min, en classe, sous surveillance, jeu de données tiré par élève)

**Date dans la séance : lundi 01/03/2027.** L'élève est seul au service transport amont (Claire en déplacement).
**Menu** : Avant de commencer · Messagerie · Carte des itinéraires (variante Dourges) · Comparateur · Ordre de transport · Nouveau courriel
· Téléphone (après le premier courriel).

1. **Avant de commencer — noté** (§4 ter) : 3 questions clés tirées, sans aide, « Je ne sais pas » en dernier.
2. **Message de Claire** : « Bonjour {prénom}, / un conteneur arrive à Anvers pour l'entrepôt de Dourges. Je suis en déplacement toute la
   semaine : choisis le prestataire, passe la commande et préviens le quai. Tout est en pièce jointe. Claire » (Cahier des charges,
   liste référencée, 4 devis, avis de mise à disposition.)
3. **Carte** Anvers → Dourges (trois itinéraires, même dessin que 7.1).
4. **Comparateur** (fiche de 7.1, sans encadré) → envoi à Claire (réponse neutre : « Bien reçu, je te fais confiance pour la suite. »).
5. **Ordre de transport** (fiche de 7.2, sans encadré, instructions tirées) → **courriel** au prestataire choisi avec l'ordre en pièce
   jointe → confirmation automatique.
6. **Appel au quai de Dourges** : Dialogue à choix **en mode évaluation** (la première réponse compte, l'interlocuteur enchaîne sans
   corriger). Pas de planning.

| Chef de quai de Dourges (fictif) | Juste | Pièges |
|---|---|---|
| « Réception Dourges, j'écoute. » | « Bonjour, {prénom}, du transport amont. J'appelle pour annoncer un conteneur. » | « Salut, c'est pour un camion. » · « Vous avez de la place ? » |
| « Les références ? » | « Conteneur {n° de l'avis}, ordre de transport {OT}. » | « {n° à deux chiffres inversés} … » · « Des vélos. » |
| « Il arrive quand, et comment ? » | l'arrivée **de l'offre que l'élève a commandée** (ex. « Mardi 9 mars vers 15 h, par le train jusqu'au terminal de Dourges, puis 2 km de camion. ») | les arrivées des autres offres de **son** tirage |

*(Le choix « juste » de la 3e réplique est l'arrivée **de l'offre réellement commandée** par l'élève — une erreur de choix ne se paie
pas deux fois ; les pièges sont les arrivées des autres offres.)*

Fin : message neutre de Claire (« Merci, je regarde à mon retour. »). Copie rendue au dernier envoi (`copie`).

## 4 bis. Questions au fil

**Aucune** en évaluation (le moteur les rend « Merci, je note » ; rien à déclarer). Les questions clés sont à l'ouverture.

## 4 ter. Avant de commencer — notée (questions clés)

`ouverture.part: 3` *(validé 3 points, décision 14 — **le moteur prévoit `part: 4` en évaluation** : vérifier qu'il accepte 3, sinon
passer à 4 et retirer 1 point à « Transmettre » ; §11 n° 1)*. `ouverture.tirage: { preparation: 1, droit: 2 }` dans les questions ★ de
7.1 à 7.3, **réécrites pour Dourges** (variantes), sans aide ni mot cliquable, « Je ne sais pas » ajouté par le moteur ; juste +1, NSP 0,
fausse −1 ÷ (nombre de mauvaises réponses), plancher 0.

| id | Rubrique | Reprise de | Question (version Dourges) | Juste |
|---|---|---|---|---|
| k-p1 | preparation | 7.1 p1 | « Ton conteneur est un “40' HC”. C'est… » | « une boîte de 12 m de long, plus haute qu'un conteneur standard » |
| k-p2 | preparation | 7.1 p2 | « Ton conteneur est dédouané à Anvers. Pour aller à Dourges… » | « il circule librement, sans nouveau passage en douane » |
| k-p3 | preparation | 7.1 p4 | « Une liste de prestataires référencés, c'est… » | « la liste des transporteurs avec qui l'entreprise a le droit de travailler, après vérification » |
| k-p4 | preparation | 7.2 p1 | « Un ordre de transport, c'est… » | « le document par lequel le donneur d'ordre commande le transport et donne ses instructions » |
| k-p5 | preparation | 7.2 p3 | « Le scellé de ton conteneur sert à… » | « prouver qu'il n'a pas été ouvert depuis son chargement » |
| k-p6 | preparation | 7.3 p4 | « Une confirmation écrite d'un prestataire, c'est… » | « un message où il s'engage à faire le transport demandé » |
| k-d1 | droit | 7.1 d1-d2 | « Rail Fret Benelux transporte ton conteneur jusqu'à Dourges. Qui doit informer qui du CO₂ émis ? » | « Le prestataire informe Decathlon, son client. » |
| k-d2 | droit | 7.2 d1 | « Le prestataire dit n'avoir pas reçu ton ordre. Ton courriel peut-il servir de preuve ? » | « Oui, comme un écrit papier, si l'on sait qu'il vient de toi et qu'il n'a pas été modifié. » |
| k-d3 | droit | 7.3 d1 | « L'arrêt de l'Escaut avait été annoncé un mois avant ta commande. Le prestataire barge peut-il invoquer la force majeure ? » | « Non : l'événement pouvait être prévu. » |
| k-d4 | droit | 7.1 d3 | « Decathlon vise −20 % d'émissions du transport. C'est… » | « un engagement de l'entreprise ; la loi oblige seulement à informer du CO₂ » |

Pièges : ceux des questions d'origine, adaptés. Banque : 6 en préparation pour 1 tirée, 4 en droit pour 2 tirées (au moins le double).

## 5. Jalons / notation (sur 20)

**Poids validés (décision 14)** — Choisir **10** (besoin 2, tri 3, comparaison 3, décision justifiée 2) · Transmettre **7** (ordre 4,
courriel 2, quai 1) · Questions clés **3**. Pas de correction (`copie`) ; détail jalon par jalon dans le Suivi.

| # | Groupe | Jalon | Poids | Ce qu'il lit | Piège |
|---|---|---|---|---|---|
| 1 | Choisir | Besoin : date limite + heure, budget, critère CO₂ | 2 | `cmp` | critère « prix » |
| 2 | Choisir | Tri : hors-liste « non » (1,5) ; **offre en retard tirée** « ne tient pas » (1,5) | 3 | `cmp` | E-Flux ou autre hors-liste gardé ; offre en retard « tient » |
| 3 | Choisir | Comparaison : prix et CO₂ reportés justes pour les **deux offres restantes** de son tirage | 3 | grille | |
| 4 | Choisir | Décision : **la moins émettrice des référencées à l'heure, calculée** (rail ou barge) (1) et justification « date puis CO₂ » (1) | 2 | `retenue`, `justif` | la route (moins chère) ; la réponse du voisin ; l'habitude de 7.1 |
| 5 | Transmettre | Ordre : conteneur (n°, scellé, poids, type) 2 ; transporteur, enlèvement, livraison **Dourges Delta 3**, limite 1 ; instructions 1 | 4 | fiche `ot` | Rouvignies en livraison (habitude) |
| 6 | Transmettre | Courriel au **prestataire choisi par l'élève**, ordre en pièce jointe, vouvoiement | 2 | courriels | ordre au quai ; sans pièce jointe |
| 7 | Transmettre | Appel : références justes **et** arrivée de l'offre commandée, du premier coup | 1 | dialogue `quai` | |
| — | Questions clés | `ouverture.part` | 3 | ouverture | |

« Une erreur ne se paie qu'une fois » : le jalon 6 est jugé sur le prestataire **que l'élève a retenu** (pas sur le rail) ; le jalon 5
juge le transporteur de l'ordre = celui qu'il a retenu ; le jalon 7 juge l'arrivée de l'offre qu'il a commandée. Seul le jalon 4 dit si le
choix était le bon. *(À valider, §11 n° 2.)*

## 6. Contenu

`contenus/decathlon-ent74.js` ; `contenus/questions/ENT-7.4.js` ; corrigé `ENT-7.4.js` (`corrigeEleve` : son jeu tiré). Carte : variante
Dourges (`carte-anvers-dourges.svg` si option A de 7.1).

| Donnée | Référence (élève témoin) | Tirée |
|---|---|---|
| Conteneur | **PLGU 602215 8** (chiffre de contrôle calculé) | banque de 8, ≠ 7.1-7.3 |
| Contenu | vélos et accessoires | tiré parmi 3 (vélos ; tentes et sacs ; textile de ski) |
| Scellé / poids | DC 0 772 061 / 13 950 kg | tirés (13 500 à 15 800) |
| Disponible | lundi 01/03/2027 | fixe |
| Limite au quai | **mercredi 10/03/2027, 14 h** | fixe |
| Budget | 850 € | fixe |
| Livraison | Decathlon Dourges — Delta 3 | fixe |

| Offre | Itinéraire (construit) | Arrivée au quai | Prix réf. (tiré) | CO₂ à 13,95 t | Tient ? |
|---|---|---|---|---|---|
| Routiers du Hainaut (route) | 150 km, E17 (Gand, Courtrai, Lille) puis A1 | mar. 09/03 · 10 h | 640 € (610–670) | **107 kg** | oui |
| Contargo (barge) | Escaut puis canal Dunkerque-Escaut (≈ 290 km) + 2 km camion | **`rt4-barge`** : ven. 12/03 · 9 h (premier départ après la réouverture de l'Escaut) ; **`rt4-rail`** : mar. 09/03 · 9 h | 720 € (690–750) | **82 kg** | `rt4-barge` : **non** ; `rt4-rail` : oui → **bonne réponse** (82 < 107) |
| Rail Fret Benelux (rail) | ≈ 205 km par Bruxelles, Mons, Valenciennes, Douai + 2 km camion | **`rt4-barge`** : mar. 09/03 · 15 h ; **`rt4-rail`** : jeu. 11/03 · 10 h (« travaux sur la ligne, train du 08/03 supprimé ») | 690 € (660–720) | **49 kg** | `rt4-barge` : oui → **bonne réponse** ; `rt4-rail` : **non** |
| Hors liste (banque de 7.1, autre graine) | | mar. 09/03 | 495–590 € | < 49 kg | hors liste |

**Banque `retard`** (décision 22, `melange: { moyen: 1 }`) : `rt4-barge` (bonne réponse le rail) et `rt4-rail` (bonne réponse la barge) ;
la route toujours à l'heure et la moins chère des référencées. Valeurs attendues calculées d'après la pièce tirée.
Contrôle d'équité : rail < barge < route en CO₂ (vrai pour tout poids de 13,5 à 15,8 t, §6.2 de 7.1) ; exactement une offre référencée en
retard ; hors-liste moins cher que tous et moins émetteur que la bonne réponse ; barge après la limite ; prix ≤ budget − 50.

## 7. Demandes au moteur

1. **Dialogue à choix en mode évaluation** (prévu dans le chantier de 7.2, §7 n° 3) : première réponse rangée, pas de réaction
   corrective, l'interlocuteur enchaîne ; textes calculés sur la commande de l'élève.
2. **`ouverture.part: 3`** accepté en évaluation ? (le moteur parle de 4) ; reprise des questions ★ écrite dans le fichier de 7.4
   (le moteur ne la fait pas seul — FICHE-SEANCE).
3. Courriel, ordre, comparateur, carte : ceux de 7.1 à 7.3, rien de plus.

## 8. Tests attendus

Bloc `decathlon`, cas « ENT-7.4 » : **deux témoins** (`rt4-barge`, `rt4-rail`), parcours juste 20 / 20 chacun (ouverture 3 / 3), et le
parcours de l'un joué par l'autre < 20 ; répartition 40-60 % sur 200 graines ; inaction 0 ; témoin `rt4-barge` qui garde **la barge par habitude** → 2 et 4 faux,
5-6-7 vrais s'ils sont cohérents avec la barge ; sabotage « rail » écrit en dur → le témoin `rt4-rail` doit tomber ; route → 4 faux, 6 vrai si courriel à la route ; Rouvignies en livraison → 5 faux ;
ouverture : 3 justes = 3, 2 justes + 1 NSP = 2, 2 justes + 1 fausse = 2 − 0,5 = 1,5 (deux mauvaises réponses par question : −1 ÷ 2),
plancher 0 ; deux élèves → jeux différents ; aucune correction affichée ; `noter(db)` = la note du Suivi.

## 9. Supports

Pas de trame (évaluation). Corrigé par élève dans l'onglet Corrigés. Fiche enseignant d'une page : déroulé, durée, ce qui est évalué.

## 10. Critères de validation par Tristan

Le jeu change d'un élève à l'autre ; rien à l'écran ne dit juste ou faux ; un élève qui « refait 7.1 » (barge, Rouvignies) est pris par
le bilan ; 50 min tenues.

## 11. Questions ouvertes

1. [x] `ouverture.part` : **3** (Tristan, 15/10/2026) ; si le moteur le refuse, revenir voir Tristan (4 et Transmettre à 6).
2. [x] « Une erreur ne se paie qu'une fois » en évaluation (jalons 5 à 7 jugés sur l'offre choisie par l'élève) ? (oui, Tristan, 15/10/2026)
3. [x] Pastilles d'étape en évaluation (« fait », jamais « juste ») ? (oui : elles aident à ne rien oublier sans rien souffler) — oui (Tristan, 15/10/2026)
4. [x] Chef de quai de Dourges : un personnage distinct de celui de Rouvignies ? (oui, nom à choisir) — oui, un autre ; nom fictif à proposer (Tristan, 15/10/2026)
5. [x] Contre la copie : offre en retard tirée, bonne réponse rail ou barge (Tristan, 13/10/2026, décision 22).
6. [x] Durée 50 min ; pas de planning du quai en évaluation (le créneau a été évalué en formatif) ? (oui) — oui (Tristan, 15/10/2026)

---

## Compte rendu *(rempli par Claude Code à la livraison, 15/10/2026)*

- **Fichiers créés / modifiés** : `activites/decathlon-evaluation-dourges.js` ; `contenus/decathlon-ent74.js` (séance), `contenus/decathlon-ent74-donnees.js` (données pures, tirage, équité) ;
  `contenus/questions/ENT-7.4.js` ; `contenus/corriges/ENT-7.4.js` ; `outils/test/decathlon-74.mjs` (nouveau bloc, 10 cas) ; modifiés : `contenus/decathlon.js` (le chef de quai
  `yanis` dans `EQUIPE`), `activites/index.js` (une ligne), `outils/test.mjs` (le bloc dans `BLOCS` et dans `GROUPES`, groupe 1), `outils/test/tirage-niveaux.mjs`
  (les trois banques inscrites dans `BANQUES_FIGEES`). Aucun fichier du moteur (`core/`) ni `styles/` touché.
- **Écarts par rapport au brief** :
  1. **Rail** : le brief dit « Rail Fret Benelux » ; le code (7.1 à 7.3) a « Rail Flandres-Artois » : gardé, pour ne pas changer de prestataire d'une séance à l'autre.
  2. **Préfixe du conteneur** : le brief donne « PLGU 602215 8 » ; PLGU est attribué à une société réelle (vérifié le 13/10/2026) : `PRPU 602215 5` (chiffre de contrôle calculé, vérifié à la main).
  3. **CO₂** : calculé sur les kilomètres de la carte vers Dourges (route 153, barge 263 + 3, rail 162 + 3) : à 13,95 t, route 109, barge 76, rail 39 kg (le brief disait 107 / 82 / 49).
  4. **Prix** : route 610-650, rail 660-710, barge 720-750 (le brief : 610-670, 660-720, 690-750 ; ces plages se chevauchent et rendaient la route parfois pas la moins chère, ou deux prix égaux).
  5. **Question k-d1** (information CO₂) : le brief proposait « Le prestataire informe Decathlon » ; or le trajet part d'Anvers, et le 3e alinéa de L1431-3 renvoie à plus tard les transports qui partent de
     l'étranger (lu sur Légifrance le 13/10/2026). C'est la question d3 d'ENT-7.3, adaptée : « Pas encore : c'est le cahier des charges de Decathlon qui l'exige ».
  6. **Jalons** : le brief donne les poids par groupe ; répartis en 14 jalons (besoin 1 + 1, tri 1,5 + 1,5, comparaison 1,5 + 1,5, décision 1 + 1, ordre 2 + 1 + 1, courriel 1,5 + 0,5, appel 1) : aucun
     jalon à 0, la forme du courriel pèse 0,5 point. Somme 17 + 3 de questions = 20.
  7. **Compétences** : `competences: ['C2.6']` (C2.6.1 et C2.6.2 n'existent pas dans `core/competences.js`, comme 7.1 à 7.3). Pas de `parcours` ni `precedente` (comme Picard 4.4 et Cdiscount 2.5) :
     la séance s'ouvre quand l'enseignant la coche.
  8. **Aucun contact « leurre »** au téléphone (pas de messagerie de Claire ou de Contargo à appeler par erreur) ; pas de lexique (`lexique: {}`) : une évaluation n'a aucune aide.
  9. **Le droit reste lisible à gauche** pendant « Avant de commencer » (décision de Tristan, 15/10/2026, option B) : L1431-3, art. 1366 et art. 1218, les mêmes textes qu'en 7.3, sans mot cliquable ni aide par question ; le brief écartait toute aide. Les questions de préparation ont le cahier des charges.
- **Décisions prises en route** : le chef de quai de Dourges s'appelle **Yanis Haddad** (nom construit, proposé : à valider) ; l'« offre commandée » (celle dont le chef de quai donne l'arrivée) est le transporteur de
  l'ordre de l'élève, à défaut l'offre qu'il a retenue, à défaut la bonne réponse ; la hors liste retenue fait tomber le tri, la décision, le transporteur de l'ordre et le destinataire du courriel (5 points) mais pas l'appel.
  La banque d'offres en retard est tirée en premier, la hors liste en second : le contrôle d'équité refuse un jeu où deux offres arrivent à la même heure (E-Flux arrive à 11 h, pas à 9 h comme la barge).
- **Tests** : bloc `decathlon-74` (10 cas, 10 s) : données (200 élèves, 0 secours, 50 % de barge en retard, numéros ≠ 7.1 à 7.3, numéro « lu à l'envers » jamais valable) ; montage ; inaction 0 ; parcours juste 20 / 20 pour les
  deux témoins (`rt4-barge` → rail, `rt4-rail` → barge), joué à l'écran (souris, clavier, téléphone) ; l'habitude de la barge (17,5) ; chaque piège fait tomber son jalon seul ; la route retenue et commandée à l'écran ; « Avant de commencer »
  (3 / 2 / 1,5 / 0). Éprouvés par sabotage dans les deux sens (`commandee` toujours la bonne réponse ; décision toujours juste ; transporteur jugé sur la bonne réponse). Suite entière : 1 493 cas verts.
  **Touché** : `outils/test.mjs` (bloc ajouté) et `outils/test/tirage-niveaux.mjs` (banques inscrites) ; aucun cas existant réécrit.
- **Commits** : voir `git log` (« ENT-7.4 : … »).
- **Reste ouvert** : (1) Tristan l'essaie à l'écran puis l'ouvre à son groupe (`pret: true, ouverture: 'prof'`) ; (2) valider le nom Yanis Haddad ; (3) ~~relire sur Légifrance les art. 1218 et 1366~~ **fait le 15/10/2026** (art. 1366 et 1231-1 identiques ; art. 1218 corrigé : « par le débiteur » manquait, aussi en 7.3) :
  les questions k-d2 et k-d3 en dépendent ; (4) le code `ENT-7.4` est provisoire, comme 7.1 à 7.3 ; (5) pas de trame ni de fiche enseignant (brief §9 : fiche d'une page à faire par Cowork).
