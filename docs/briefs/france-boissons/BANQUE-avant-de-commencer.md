# France Boissons — banque « Avant de commencer » des séances ENT-6.1 à 6.10 (propositions à trancher)

**Statut** : propositions de Cowork du 10/10/2026, **tranchées par Tristan le 10/10/2026 : toute la banque est gardée** (toutes
les lignes, tirage 2 + 2 (+ 1 image) partout). Décision du même jour : **la calculette du site** (`core/calculette.js`) s'affiche sur
l'écran « Avant de commencer » (les questions à valeurs tirées demandent un calcul). Construction en cours (Claude Code, 6.1 → 6.10).
**Règles appliquées** : `docs/briefs/MOTEUR-avant-de-commencer.md` (§1 bis, 3 bis, 3 ter) et `MODELE.md` §4 ter.
**Ce que Claude Code fait après ton choix** : il recopie la banque retenue dans le §4 ter du brief de chaque séance, puis l'écrit
dans `contenus/questions/<code>.js` (`type: 'ouverture'`, `rubrique`, `notee: false`, `aide`, `doc`, `retour`, `cle`).

## 0. Ce qui vaut pour toutes les séances

- **Tirage proposé** (le même partout, pour que les élèves s'y retrouvent) : **2 de préparation + 2 d'économie-droit**, plus **1
  d'image** dans les séances qui font découvrir un matériel (6.2, 6.4, 6.5, 6.6, 6.7). Soit 4 ou 5 questions par élève (≈ 5 min).
  Chaque rubrique contient **le double** de ce qu'on tire (4 / 4 / 2), comme le moteur l'exige.
- **Tuteur qui pose** : celui de la séance (Inès 6.1-6.3, Nadia 6.4-6.7, Karim 6.8-6.10).
- **Valeurs tirées** (`{n}` dans le tableau) : la bonne réponse et les pièges sont **calculés** ; les valeurs ne reprennent jamais celles
  d'un jalon de la séance (la colonne « Valeurs » dit ce qui est exclu). Contrainte du moteur : la **clé** de la bonne réponse est la
  même pour tous (seuls les nombres changent), c'est pourquoi chaque question tirée garde un seul « sens » de réponse.
- **★ = à reprendre en évaluation** (`cle: true`), sur le cas de l'évaluation, sans aide.
- **Onglet « Le droit »** de chaque séance : les textes cités par ses questions, avec le pied « Texte de loi (réel) — source :
  Légifrance ». Les phrases ci-dessous ont été relues le 10/10/2026 sur code.travail.gouv.fr (Code du travail), EUR-Lex (règlement
  561/2006) et des reprises fidèles (Code de commerce, Code de la route, CGCT) ; Légifrance refuse nos accès : **Claude Code relit
  chaque phrase entière sur Légifrance avant de livrer** (comme pour l'article 1113).
- **Colonne « Risque »** : quand une question frôle un jalon de la séance, je le dis ; c'est à toi de dire si elle prépare ou si elle
  souffle. Les questions qui donneraient la réponse d'un piège ont été écartées (liste en fin de chaque séance).

---

## ENT-6.1 — Bienvenue à Buchelay (Inès)

**Documents à gauche** : l'organigramme **de l'élève** (avec ses cases vides), l'annuaire (les six fiches), « Le droit ».
**À noter** : le brief dit « pas de question d'éco-droit dans cette séance » (08/10) ; ta règle du 10/10 en demande 2 ou 3 à
l'ouverture. Je suis la règle du 10/10.

| id | Rub. | Question | Juste | Pièges | À gauche | ★ | Retour d'Inès | Risque |
|---|---|---|---|---|---|---|---|---|
| `fb-plateforme` | prép. | Que fait la plateforme de Buchelay ? | Elle stocke des boissons et les livre aux cafés, hôtels et restaurants | Elle fabrique la bière · Elle vend des boissons aux particuliers, en magasin | annuaire (fiche d'Hélène) | ★ | France Boissons ne brasse pas : elle distribue. La bière arrive des brasseries, repart chez les clients. | — |
| `organigramme-sert` | prép. | À quoi sert un organigramme ? | À montrer qui dirige qui, et qui fait quoi dans l'entreprise | À donner les horaires de chacun · À lister les clients de la plateforme | organigramme | | Il montre les services et les chefs : c'est lui qui te dira à qui transmettre un message. | — |
| `trait-plein` | prép. | Sur l'organigramme, que veut dire un **trait plein** entre deux cases ? | Un lien hiérarchique : l'un est le chef de l'autre | Les deux travaillent dans le même bureau · Les deux ne se parlent jamais | organigramme (légende) | | Trait plein : le chef. Pointillés : un service qui aide, sans être le chef. | la légende est déjà sur le document : préparation pure |
| `rendre-compte` | prép. | Dans une fiche, « Thomas **rend compte** à Hélène » veut dire… | Hélène est sa cheffe : il lui dit ce qu'il a fait et ce qui se passe | Thomas fait les comptes d'Hélène · Hélène doit expliquer son travail à Thomas | annuaire | | Rendre compte, c'est informer son chef. | — |
| `ri-obligatoire` | droit | Une plateforme logistique emploie **{n} salariés** depuis plus d'un an. Doit-elle avoir un règlement intérieur ? | Oui : il est obligatoire à partir de 50 salariés | Non, seulement à partir de 200 salariés · Non, c'est toujours facultatif | Le droit : C. trav. **L1311-2** | | Le règlement intérieur fixe les règles de sécurité et de discipline. Buchelay, avec ses 80 salariés, en a un. | Valeurs : n de 55 à 150 (pas 80) |
| `cse-obligatoire` | droit | Une entreprise de transport emploie **{n} salariés** depuis plus d'un an. Doit-elle avoir un CSE (comité social et économique) ? | Oui : à partir de 11 salariés pendant 12 mois de suite | Non, seulement à partir de 50 salariés · Non, seulement si les salariés le demandent | Le droit : C. trav. **L2311-2** | | Le CSE représente les salariés auprès de la direction. | Valeurs : n de 12 à 45 |
| `malo-chef` | droit | Malo, client, demande à Lucas de livrer plus tôt et de ranger les fûts dans sa cave. Malo est-il le chef de Lucas ? | Non : c'est son employeur, France Boissons, qui lui donne des ordres, les contrôle et peut le sanctionner | Oui : Malo paie les boissons, donc il commande · Oui, tant que Lucas est chez lui | Le droit : Cour de cassation, 13 nov. 1996 (définition du lien de subordination) | ★ | Le lien de subordination n'existe qu'avec l'employeur. Malo peut demander ; c'est Karim qui décide. | — |
| `zero-accident` | droit | « Objectif prioritaire : zéro accident. » D'après l'article L4121-1, qui doit prendre les mesures pour la sécurité des salariés ? | L'employeur, France Boissons | Chaque salarié, seul · L'inspection du travail | Le droit : C. trav. **L4121-1** | ★ | L'employeur doit prévenir les risques, informer, former, organiser. Les salariés aussi ont un devoir : on le verra au quai. | — |

Écartées : toute question sur une case de l'organigramme ou un destinataire (ce sont les jalons).

**Textes de « Le droit »** : L1311-2 (al. 1 : « … est obligatoire dans les entreprises ou établissements employant au moins
cinquante salariés ») · L2311-2 (« Un comité social et économique est mis en place dans les entreprises d'au moins onze salariés. Sa
mise en place n'est obligatoire que si l'effectif d'au moins onze salariés est atteint pendant douze mois consécutifs. ») ·
Cass. soc. 13/11/1996, n° 94-13.187 (« Le lien de subordination est caractérisé par l'exécution d'un travail sous l'autorité d'un
employeur qui a le pouvoir de donner des ordres et des directives, d'en contrôler l'exécution et de sanctionner les manquements de son
subordonné ») · L4121-1 (al. 1 et les trois tirets).

---

## ENT-6.2 — La commande de La Cabane à Malo (Inès) — **5 questions déjà construites, 5 à ajouter**

**À noter** : le brief 6.2 (§4 ter) dit « banque de 14 questions validée », mais il n'en existe que 5 (`contenus/questions/ENT-6.2.js`)
et le compte rendu du lot 3 dit « banque à écrire ». Je garde les 5 (en gras dans la colonne id) et j'en ajoute 5.

| id | Rub. | Question | Juste | Pièges | À gauche | ★ | Retour d'Inès | Risque |
|---|---|---|---|---|---|---|---|---|
| **`qui-est-malo`** | prép. | *(existante)* | | | fiche client | ★ | | — |
| **`ou-regarder`** | prép. | *(existante)* | | | stock | | | — |
| `format-fut` | prép. | Dans le stock, que veut dire « Heineken **fût 30 L** » ? | Un fût qui contient 30 litres de bière | 30 fûts de Heineken en stock · Un casier de 30 bouteilles | stock | | Une même bière existe en plusieurs formats : 20 L et 30 L, ce n'est pas le même article. | prépare la lecture du stock (Heineken 20 L à 0), sans dire quoi en faire |
| `bon-sert` | prép. | À quoi sert le bon de commande que tu vas remplir ? | À dire ce qu'on va livrer au client : on prépare, on livre et on facture avec | À recopier le mail de Malo · À faire signer Malo | fiche client | | Le préparateur, le chauffeur et Inès travailleront avec ton bon. | **frôle** le piège « on ne promet pas ce qu'on n'a pas » : à garder ou non |
| **`les-vides`** | image | *(existante, photos futs-mur et casier-vides)* | | | photos | | | — |
| `tireuse` | image | Au bar de Malo, la bière pression sort de la tireuse. Qu'y a-t-il au bout du tuyau, sous le comptoir ? | Un fût | Un casier de bouteilles · Une bouteille de 1 L | photo `tireuse.jpg` (déjà dans le dépôt, crédit Travis Fish) | | C'est pour ça que Malo commande des fûts : un fût vide, c'est un fût qu'on lui reprend. | — |
| **`vente-conclue`** | droit | *(existante, C. civ. 1113)* | | | Le droit | ★ | | — |
| **`consigne-rendue`** | droit | *(existante)* — **proposé : la passer en valeurs tirées** : « Un bar rend **{f}** fûts vides et **{c}** casiers vides… » | {f}×40 + {c}×4 € | {f}×40 € (fûts seuls) · 0 € | conditions | | (inchangé, montants recalculés) | Valeurs : f de 1 à 6, c de 1 à 8 ; jamais f = 9 et c = 5 (les vides de Malo, jalon 5) |
| `offre-ines` | droit | Inès écrit à un hôtel qui n'a rien commandé : « Nous pouvons vous livrer 4 fûts mardi. » D'après l'article 1113, qu'est-ce que ce message ? | Une offre : la vente sera conclue si l'hôtel l'accepte | Une acceptation : la vente est conclue · Rien du tout, un message n'engage pas | Le droit : C. civ. **1113** | | Offre + acceptation = contrat. Ce que tu écris à un client peut engager France Boissons. | **frôle** la question au fil notée `jour-engage` (même article) : elle prépare sans donner sa réponse ; à toi de voir |
| `cgv-communiquer` | droit | Un nouveau bar de Honfleur demande nos conditions de vente avant de commander. France Boissons doit-il les lui donner ? | Oui : la loi oblige à les communiquer à un acheteur professionnel qui les demande | Non, elles sont secrètes · Seulement après sa première commande | Le droit : C. com. **L441-1** | | Les conditions de vente (prix, consignes, délais) sont les mêmes règles pour tous les clients CHR. | — |

Écartées : le minimum de 10 fûts, le jour de tournée, le remplacement, le tutoiement (déjà dit par le retour de `qui-est-malo`).

**Textes** : C. civ. 1113 (déjà là) · C. com. L441-1, I (« Toute personne exerçant des activités de production, de distribution ou de
services qui établit des conditions générales de vente est tenue de les communiquer à tout acheteur qui en fait la demande pour une
activité professionnelle. »).

---

## ENT-6.3 — Les congés d'été (Inès)

**Documents à gauche** : les cartes de congés (comme dans la séance), « Le droit ».

| id | Rub. | Question | Juste | Pièges | À gauche | ★ | Retour d'Inès | Risque |
|---|---|---|---|---|---|---|---|---|
| `qui-decide-conges-2` | prép. | Qui **décide** des congés des chauffeurs ? | Karim, leur responsable ; Inès les enregistre | Inès · Hélène · Chaque chauffeur pour lui-même | annuaire | ★ | Karim décide (lien hiérarchique) ; moi, je mets en forme et j'informe (lien fonctionnel). | reprise d'ENT-6.1 (point d'étape) : voulu |
| `besoin-semaine` | prép. | Dans le planning, le « besoin » d'une semaine, c'est… | Le nombre de chauffeurs qui doivent être **au travail** cette semaine | Le nombre de chauffeurs en congé · Le nombre de tournées | cartes | | Si trop de chauffeurs partent la même semaine, il manque du monde pour les tournées. | — |
| `demande-ancienne` | prép. | Deux préparateurs veulent la même semaine. **{A}** a demandé le **{d1}**, **{B}** le **{d2}**. D'après la règle de la plateforme, qui garde sa date ? | {celui qui a demandé le premier} | {l'autre} · On tire au sort | règle de la plateforme (consignes) | | La demande la plus ancienne garde sa date ; on décale l'autre, le moins possible. | Valeurs : prénoms hors de l'équipe de Karim, dates de mars à mai. Applique la règle donnée, ne dit pas qui décaler dans le planning |
| `annonce-sert` | prép. | À quoi sert une annonce d'emploi ? | À faire connaître le poste pour recevoir des candidatures | À signer le contrat · À fixer le salaire de chaque candidat | fiche de poste | | L'annonce attire les candidats ; Karim choisira, Hélène validera. | — |
| `conges-acquis` | droit | Un chauffeur travaille depuis **{m} mois** chez France Boissons. Combien de jours de congé a-t-il acquis ? | {m × 2,5} jours ouvrables | {m × 2} jours · {m} jours | Le droit : C. trav. **L3141-3** | ★ | 2,5 jours ouvrables par mois travaillé, soit 30 jours (5 semaines) pour une année. | Valeurs : m de 2 à 10, pair (résultat entier) |
| `plafond-30` | droit | Un chauffeur a travaillé **{m} mois** sur la période. Combien de jours de congé peut-il exiger au plus ? | 30 jours ouvrables | {m × 2,5} jours · 24 jours | Le droit : **L3141-3** | | 2,5 jours par mois, mais jamais plus de 30 jours ouvrables. | Valeurs : m de 13 à 16 |
| `bloc-24-jours` | droit | Un chauffeur demande **5 semaines d'affilée** en août. Karim doit-il les accorder d'un seul bloc ? | Non : un congé pris en une seule fois ne dépasse pas 24 jours ouvrables (4 semaines), sauf cas prévus par la loi | Oui : il a 30 jours, il les prend comme il veut · Non : un congé d'été ne dépasse jamais 1 semaine | Le droit : **L3141-17** | | 24 jours ouvrables au plus d'un coup ; la loi prévoit des exceptions (éloignement, enfant ou proche à charge). | — |
| `essai-cdd` | droit | Un préparateur saisonnier est embauché en CDD de **{w} semaines**. Sa période d'essai peut durer au plus… | {w} jours | 1 mois · Il n'y a pas de période d'essai en CDD | Le droit : **L1242-10** | | Un jour par semaine de contrat, et pas plus de 2 semaines pour un contrat de 6 mois ou moins. | Valeurs : w ∈ {3, 4, 5, 8, 9, 10, 12} (jamais 6 ou 7 : la durée du CDD de l'annonce) |

Écartées : toutes les mentions de l'annonce (jalons 13-14), le type de contrat et les dates du CDD (jalon 11).
**En réserve, à ne pas prendre sans décision** : l'article **D3141-6** (« L'ordre des départs en congé est communiqué, par tout
moyen, à chaque salarié un mois avant son départ. ») — voir l'alerte n° 1 en fin de fichier.

**Textes** : L3141-3 (« Le salarié a droit à un congé de deux jours et demi ouvrables par mois de travail effectif chez le même
employeur. La durée totale du congé exigible ne peut excéder trente jours ouvrables. ») · L3141-17 (al. 1 : « La durée des congés
pouvant être pris en une seule fois ne peut excéder vingt-quatre jours ouvrables. » + la dérogation de l'al. 2) · L1242-10 (al. 2).

---

## ENT-6.4 — Le camion de la brasserie (Nadia)

**Documents à gauche** : le BL MON-27-0617 (celui de la séance), « Photos et dessins », « Le droit ». **Pas** le dessin de la scène
du quai (c'est l'exercice).

| id | Rub. | Question | Juste | Pièges | À gauche | ★ | Retour de Nadia | Risque |
|---|---|---|---|---|---|---|---|---|
| `bl-cest-quoi` | prép. | Le BL que te donne le chauffeur, c'est… | Le bon de livraison : la liste de ce que le camion doit livrer | La facture à payer au chauffeur · Le bon de commande de Malo | BL | ★ | On compare ce qui arrive au BL, avant de signer. | — |
| `reserve-cest-quoi` | prép. | Écrire une **réserve** sur le BL, c'est… | Écrire précisément ce qui ne va pas, avant de signer | Refuser tout le camion · Signer sans rien dire et prévenir plus tard | BL | ★ | Une réserve précise (quoi, combien) protège la plateforme. | dit le geste, pas où sont les défauts |
| `reassort` | prép. | Ce camion apporte du réassort d'Affligem. Pourquoi l'attendait-on ? | Mardi, il n'en restait que 2 fûts pour la commande de Malo | Malo a annulé sa commande · Pour un inventaire | BL | | Le fil de la semaine : ce que tu reçois aujourd'hui, d'autres le livreront. | — |
| `qui-organise-quai` | prép. | Qui organise le quai et les réceptions des brasseries ? | Nadia, cheffe d'équipe quai et préparation | Karim · Thomas · Inès | annuaire | | reprise d'ENT-6.1 | — |
| `fut-cest-quoi` | image | Sur cette photo, que sont ces objets en métal ? | Des fûts : ils contiennent la bière pression, et ils reviennent vides | Des bouteilles de gaz · Des poubelles | `futs-vrac.jpg` (dans le dépôt) | | Un fût plein de 30 L pèse environ 40 kg : on ne le porte pas, on le déplace au chariot. | — |
| `chariot-frontal` | image | Le **chariot frontal** sert à… | Soulever et déplacer les palettes, et les poser l'une sur l'autre | Livrer les fûts chez les clients · Laver les fûts | `materiel-chariot-frontal.svg` (dessin Cowork, voir alerte n° 3) | | Fourches baissées pour rouler, jamais personne sous une charge levée. | — |
| `protestation` | droit | Un BL a été signé **sans réserve**. Le lendemain, on trouve un fût abîmé sur une palette. Que faut-il faire pour garder un recours contre le transporteur ? | Lui envoyer une protestation motivée, par lettre recommandée, dans les 3 jours | Rien, il est trop tard · Le dire au chauffeur la prochaine fois qu'il passe | Le droit : C. com. **L133-3** | ★ | Sans réserve, il reste 3 jours et une lettre recommandée. Avec une réserve, c'est réglé à la réception. | prépare l'importance des réserves, sans dire lesquelles |
| `protocole` | droit | Un transporteur vient décharger à Buchelay. Quel document **écrit** encadre la sécurité de ce déchargement ? | Le protocole de sécurité | Le bon de livraison · Le permis du chauffeur | Le droit : C. trav. **R4515-4** | ★ | Le protocole dit qui fait quoi au quai : où se met le chauffeur, comment le camion est immobilisé. | **frôle** la scène à inspecter (chauffeur, cale) : la question ne dit pas ce que contient le protocole ; à toi de voir |
| `autorisation-conduite` | droit | Un nouveau cariste a son CACES R489 catégorie 3. Peut-il conduire le chariot frontal dès son arrivée ? | Non : il lui faut aussi une autorisation de conduite délivrée par l'employeur | Oui, le CACES suffit · Oui, s'il a le permis B | Le droit : C. trav. **R4323-56** | ★ | Le CACES prouve la formation ; l'autorisation, c'est l'employeur qui la donne (avec l'avis du médecin du travail). | — |
| `droit-retrait` | droit | Une lisse de rack est pliée et une palette penche au-dessus de l'allée. Que peux-tu faire ? | Alerter tout de suite mon responsable, et me retirer de ce danger | Continuer : ce n'est pas mon rôle · Redresser la lisse moi-même | Le droit : C. trav. **L4131-1** | ★ | Alerter, c'est un devoir ; se retirer d'un danger grave et imminent, c'est un droit. | — |

Écartées : « faut-il faire le tour de la palette ? » (piège P3), « une palette incomplète est-elle fausse ? » (piège P4), « où va un fût
qui fuit ? » (phrase notée du message à Nadia), tout ce qui décrit une scène de quai sûre (piège de l'image).

**Textes** : L133-3, al. 1 · R4515-4 (« Les opérations de chargement ou de déchargement font l'objet d'un document écrit, dit
« protocole de sécurité », remplaçant le plan de prévention. ») · R4323-56 (version en vigueur le 1/10/2025, décret 2025-355 :
autorisation de conduite + certificat médical) · L4131-1, al. 1 et 2.

---

## ENT-6.5 — Ranger les fûts (Nadia)

**Documents à gauche** : « Photos et dessins », « Le droit ». Pas l'état du stock (il sert à l'étape 3). **Aucune question sur le FIFO** : les deux questions de l'animation sont notées (jalons 1 et 2).

| id | Rub. | Question | Juste | Pièges | À gauche | ★ | Retour de Nadia | Risque |
|---|---|---|---|---|---|---|---|---|
| `masse-cest-quoi` | prép. | En **stockage de masse**, les palettes pleines sont… | Posées au sol, les unes sur les autres, sans racks | Rangées dans des racks à plusieurs étages · Laissées dans le camion | photo `entrepot-racks.jpg` (pour comparer) | | Pas de rack pour les fûts pleins : on pose au sol et on gerbe. | — |
| `gerber` | prép. | **Gerber** une palette, c'est… | La poser sur une autre palette | La filmer · La peser | dessin du chariot | | On ne gerbe pas sans limite : la hauteur dépend du poids. | — |
| `lot-ancien` | prép. | Deux lots de la même bière : **S{a}** et **S{b}**. Lequel est le plus ancien ? | S{le plus petit} | S{le plus grand} · Ils ont le même âge | — | | Le numéro, c'est la semaine de fabrication : plus il est petit, plus le lot est ancien. | Valeurs : a, b de 10 à 30, jamais 18, 19, 20, 24. Prépare le mot, pas le rangement |
| `stock-apres` | prép. | Il y avait **{s}** fûts en stock ; il en entre **{e}**. Combien y en a-t-il après ? | {s + e} | {s − e} · {e} | — | | Stock après = stock avant + ce qui est vraiment entré. | Valeurs : s de 10 à 40, e de 3 à 9 ; jamais les couples de la séance (16+8, 24+8, 2+7, 24+7). **Frôle** l'étape 3 (même calcul) |
| `palette-retention` | image | Pourquoi les fûts sont-ils posés sur cette palette noire, avec une grille ? | Si un fût fuit, la bière coule dans le bac et pas sur le sol | Pour garder les fûts au frais · Pour pouvoir les empiler plus haut | `materiel-palette-retention.svg` | | Un sol mouillé, c'est une chute. Ici, c'est un choix de l'exercice. | — |
| `racks-ou-sol` | image | Sur cette photo, les palettes sont dans des racks. À Buchelay, où sont les palettes de fûts **pleins** ? | Au sol, en stockage de masse | Dans des racks, comme sur la photo · Dehors, devant les quais | `entrepot-racks.jpg` | | Les racks servent ailleurs ; les fûts pleins sont au sol. | doublon de sens avec `masse-cest-quoi` : n'en garder qu'une si tu préfères |
| `ddm-biere` | droit | Une bière à 5 % d'alcool porte une date « à consommer de préférence avant ». Pourquoi fait-on partir d'abord le lot le plus ancien ? | Pour qu'il parte chez le client avant cette date | La loi interdit de garder une bière plus d'un mois · Les vieux fûts sont plus légers | Le droit : règlement (UE) **1169/2011** (date de durabilité minimale ; dispense pour les boissons de 10 % ou plus) | | La bière garde son goût jusqu'à cette date : on fait partir l'ancien d'abord. | donne la **raison** du FIFO, pas le geste (dernier posé, premier sorti) : à toi de voir |
| `manutention-meca` | droit | Une palette de 8 fûts de 30 L pèse environ 350 kg. Comment l'employeur doit-il la faire déplacer ? | Avec un équipement mécanique : la loi demande d'éviter de porter les charges à la main | À deux salariés, à la main · Fût par fût, à la main | Le droit : C. trav. **R4541-3** | ★ | D'où le chariot frontal, et plus tard le portique à fûts. | — |
| `securite-collegue` | droit | Un collègue passe sous une palette levée par le chariot. Est-ce ton affaire ? | Oui : chaque salarié veille à sa sécurité et à celle des autres | Non, c'est le rôle du chef · Non, s'il n'est pas de mon équipe | Le droit : C. trav. **L4122-1** | ★ | Tu le préviens, tu préviens Nadia. La sécurité, c'est aussi celle des autres. | — |
| `sol-glissant` | droit | Une fuite de bière rend le sol glissant. Qui doit prévoir les moyens pour éviter les chutes ? | L'employeur : c'est son obligation de sécurité | Le client qui a commandé la bière · Personne : c'est un accident | Le droit : **L4121-1** | | La palette de rétention, le nettoyage, le marquage au sol : ce sont des mesures de prévention. | — |

Écartées : toute question sur un couloir, un lot devant un autre, la hauteur de gerbage (règles et jalons) ; « ce qui est vraiment
entré » face au BL (piège de P2 et P3).

**Textes** : règlement 1169/2011, art. 2, § 2, r) (définition de la date de durabilité minimale — **à relire**) et annexe X, 1, d)
(« boissons titrant 10 % ou plus en volume d'alcool » : dispensées) · R4541-3 · L4122-1, al. 1.

---

## ENT-6.6 — Inventaire tournant à la voix (Nadia)

**Documents à gauche** : « Photos et dessins » (terminal vocal), « Le droit ». **Jamais** le stock théorique (à l'aveugle).

| id | Rub. | Question | Juste | Pièges | À gauche | ★ | Retour de Nadia | Risque |
|---|---|---|---|---|---|---|---|---|
| `aveugle` | prép. | Compter **à l'aveugle**, c'est… | Compter ce qu'on voit, sans regarder le chiffre du logiciel | Compter les yeux fermés · Recopier le stock du logiciel | — | ★ | Si tu connais le chiffre, tu risques de le « voir ». | — |
| `tournant` | prép. | Un **inventaire tournant**, c'est… | Compter une partie du stock à la fois, souvent le matin avant les flux | Compter tout l'entrepôt une fois par an · Compter seulement les vides | — | | Ce matin : ce qui part demain, et les vides. | — |
| `ecart-calcul` | prép. | Le logiciel dit **{t}** fûts ; tu en comptes **{c}**. Quel est l'écart ? | {c − t} (négatif : il en manque) | +{t − c} · {c} | — | | Écart = compté − théorique. Ensuite, on cherche pourquoi. | Valeurs : t de 10 à 30, c = t − k avec k ∈ {2, 4, 5} (jamais 1, 3, 8 : les écarts de la séance). **Frôle** l'étape 2 |
| `taux-fiabilite` | prép. | Sur **{n}** lignes comptées, **{j}** sont justes. Quel est le taux de fiabilité ? | {j ÷ n × 100} % | {(n − j) ÷ n × 100} % · {j} % | — | | Plus il est proche de 100 %, plus on peut croire le logiciel. | Valeurs : (n = 10, j de 6 à 9) ou (n = 20, j de 15 à 19) ; jamais 4 sur 7. **Frôle** le jalon 10 (même calcul) |
| `terminal-mains` | image | Le terminal vocal se porte à la ceinture, avec un casque et un micro. Qu'est-ce que ça change ? | Les mains et les yeux restent libres pour le travail | Il faut regarder un écran tout le temps · On n'a plus besoin de compter | `materiel-terminal-vocal.svg` | | Il te dit où aller ; tu réponds. Ici, tu tapes tes réponses au clavier. | — |
| `code-controle` | image | Avant de compter, le terminal demande le **code de contrôle** du couloir. À quoi sert-il ? | À prouver qu'on est devant le bon couloir | À donner le nombre de fûts · À démarrer le chariot | même dessin | | Un code faux, et le terminal te renvoie vérifier le couloir. | — |
| `inventaire-annuel` | droit | Le dernier inventaire complet de la plateforme a eu lieu le **{date}**. D'après le Code de commerce, au plus tard quand doit avoir lieu le suivant ? | Le {date + 12 mois} | Le {date + 24 mois} · Jamais : ce n'est pas obligatoire | Le droit : C. com. **L123-12** | ★ | Une entreprise contrôle son stock au moins une fois tous les 12 mois : l'inventaire tournant aide à le tenir juste toute l'année. | Valeurs : dates de 2026 |
| `vides-manquants-euros` | droit | Il manque **{k}** fûts vides au compte. Combien de consigne est perdue ? | {k × 40} € | {k × 4} € · 40 € | Le droit : arrêté du 6 février 2026 (montants dans les conditions de vente) | | Un vide perdu, c'est 40 € et un fût à refabriquer. | Valeurs : k de 2 à 9, jamais 3 (l'écart de la séance) |
| `reemploi` | droit | Un fût vide est lavé à la brasserie, puis rempli de nouveau. Pour la loi, c'est… | Du réemploi : le fût n'est pas un déchet, il resert au même usage | Du recyclage · Un déchet | Le droit : C. env. **L541-1-1** | ★ | Un fût sert une cinquantaine de fois en 15 ans. | — |
| `terminal-informe` | droit | Le terminal enregistre chaque comptage avec ton nom et l'heure. Que dit la loi ? | Le salarié doit en avoir été informé **avant** | L'entreprise n'a rien à dire · C'est interdit | Le droit : C. trav. **L1222-4** | ★ | Toute information sur toi collectée par un appareil : tu dois le savoir avant. | — |

Écartées : la cause d'un écart (palette ailleurs, casse non saisie) et la décision « régulariser ou remettre en place » (jalons).

**Textes** : L123-12, al. 2 (« Elle doit contrôler par inventaire, au moins une fois tous les douze mois, l'existence et la valeur des
éléments actifs et passifs du patrimoine de l'entreprise. ») · L541-1-1 (définitions « réemploi » et « recyclage ») · L1222-4
(« Aucune information concernant personnellement un salarié ne peut être collectée par un dispositif qui n'a pas été porté
préalablement à sa connaissance. »).

---

## ENT-6.7 — Préparation vocale de la commande de Malo (Nadia)

**Documents à gauche** : « Photos et dessins » (portique, transpalette à ciseaux), « Le droit ». **Aucun bon de préparation** (la
séance n'en montre pas).

| id | Rub. | Question | Juste | Pièges | À gauche | ★ | Retour de Nadia | Risque |
|---|---|---|---|---|---|---|---|---|
| `quelle-commande` | prép. | Quelle commande prépares-tu cet après-midi ? | Celle de La Cabane à Malo, prise mardi, qui part demain | Une commande de la brasserie · Les vides de Malo | — | | Ta commande de mardi devient une palette, puis un camion. | — |
| `detrompeur` | prép. | Le **code détrompeur** d'un emplacement sert à… | Prouver au terminal que tu es au bon emplacement | Compter les fûts · Ouvrir le tiroir | — | ★ | Comme ce matin pour l'inventaire. | reprise de 6.6 : voulu |
| `picking` | prép. | Le **picking**, c'est… | L'emplacement où le préparateur prend les produits, à portée de main | La réserve au sol, en zone de masse · Le quai de chargement | — | | Ici, ce sont des tiroirs coulissants sous les racks. | — |
| `palette-client` | prép. | Pourquoi la palette client (1,20 × 0,80 m) est-elle plus petite qu'une palette de stock ? | Pour passer dans les couloirs et les monte-charge des bars | Pour coûter moins cher · Parce que la bière est plus légère | — | | Elle prend moins de fûts : c'est vérifié chez France Boissons. | ne dit pas le nombre ; la règle n° 1 de la séance le dit déjà |
| `portique` | image | Le **portique à fûts** sert à… | Soulever et déplacer le fût sans le porter à la main | Laver les fûts · Compter les fûts | `materiel-portique-futs.svg` | ★ | Un fût de 30 L pèse environ 40 kg : on ne le porte pas. | — |
| `ciseaux` | image | La palette client est posée sur un **transpalette à ciseaux**. Pourquoi ? | Il monte la palette à hauteur de travail : on ne se penche pas | Il filme la palette · Il pèse la palette | même dessin | | Moins de dos courbé, moins de TMS. | — |
| `charges-55` | droit | Un préparateur devrait porter à la main, toute la journée, des charges de **{kg} kg**. Que dit la loi ? | Seulement si le médecin du travail l'a reconnu apte, et jamais plus de 105 kg | C'est toujours permis · C'est permis sans limite si le salarié est d'accord | Le droit : C. trav. **R4541-9** | | Au-delà de 55 kg, il faut l'aptitude du médecin. Pour les femmes, la limite est 25 kg. | Valeurs : kg de 60 à 90 |
| `portique-loi` | droit | Pourquoi France Boissons a-t-il installé un portique à fûts ? D'après l'article R4541-3… | L'employeur doit utiliser des moyens mécaniques pour éviter de porter les charges à la main | Seulement pour aller plus vite · Parce que les clients le demandent | Le droit : **R4541-3** | ★ | Le portique, c'est l'obligation de la loi transformée en matériel. | même article qu'en 6.5, autre cas : voulu |
| `evaluation-informe` | droit | Le terminal calcule tes lignes par heure, et l'entreprise s'en sert pour évaluer les préparateurs. Que dit la loi ? | Le salarié est informé avant de cette méthode, et les résultats restent confidentiels | L'entreprise peut le faire sans rien dire · Les résultats sont affichés au quai pour tous | Le droit : C. trav. **L1222-3** | ★ | Mesurer, oui ; en cachette, non. | rejoint « Ce que le terminal sait de toi » (fin de séance) |
| `surveillance-proportion` | droit | Le terminal pourrait enregistrer tout ce que dit le préparateur, même ses conversations. Est-ce permis ? | Non : une surveillance doit être justifiée par la tâche et proportionnée au but | Oui : tout ce qui se passe au travail appartient à l'employeur · Oui, s'il l'éteint le soir | Le droit : C. trav. **L1121-1** | | Le terminal sert à préparer, pas à écouter. | — |

Écartées : « abîmé ou manquant ? » (jalon 3), l'ordre de pose (casiers d'eau en dernier), « 6 fûts au plus », « jamais un fût sur un
casier » (jalons 6-7), et tout ce qui dirait « les lignes arrivent une par une » (la découverte de la séance).

**Textes** : R4541-9, al. 1 et 2 (55 kg / aptitude / 105 kg ; femmes 25 kg) · R4541-3 · L1222-3, al. 1 et 2 · L1121-1.

---

## ENT-6.8 — Chauffeurs et camions du vendredi (Karim)

**Documents à gauche** : « Le droit » (et l'annuaire). Pas les cartes des tournées (elles sont dans la vue).

| id | Rub. | Question | Juste | Pièges | À gauche | ★ | Retour de Karim | Risque |
|---|---|---|---|---|---|---|---|---|
| `tournees-haute-saison` | prép. | En haute saison, combien de tournées partent chaque jour de Buchelay ? (vidéo de lundi) | 30 | 18 · 150 | — | | Ce matin, j'en confie 5 à toi. | reprise d'ENT-6.1 |
| `qui-decide-camions` | prép. | Qui décide des tournées et des camions des chauffeurs ? | Karim, responsable d'exploitation | Nadia · Inès · Chaque chauffeur | annuaire | ★ | reprise d'ENT-6.1 | — |
| `bulle-camion` | prép. | Dans le planning de ce matin, une ligne est un chauffeur. Que représente la bulle posée sur sa tournée ? | Le camion qu'il conduit | Sa pause · Le client | — | | Un chauffeur, un camion, une tournée. | lecture de la vue, rien de plus |
| `sous-traiter` | prép. | **Sous-traiter** une tournée, c'est… | La confier à un transporteur, qui vient avec son chauffeur et son camion | Louer un camion sans chauffeur · L'annuler | — | | Louer ou sous-traiter : ce n'est pas la même chose. | **frôle** l'étape 2 (choix) et la fiche « documents à bord » : définit le mot, ne dit ni quand le faire ni quel papier |
| `repos-11h` | droit | Un chauffeur a fini son service hier à **{h}**. Avec 11 h de repos, à quelle heure peut-il reprendre au plus tôt ? | {h + 11 h} | {h + 9 h} · {h + 8 h} | Le droit : règlement (CE) **561/2006**, art. 8 | ★ | Le repos se compte depuis la fin du service, pas depuis minuit. | Valeurs : h de 18:15 à 21:45, jamais 17:00, 19:30, 22:00 (les chauffeurs de la séance). **C'est le calcul du jalon 5 avec d'autres heures** : à toi de dire si ça prépare ou si ça souffle |
| `conduite-9h` | droit | Un chauffeur conduit **{a}** le matin et **{b}** l'après-midi, avec sa pause entre les deux. Respecte-t-il la durée de conduite de la journée ? | Non : 9 h de conduite au plus par jour (10 h deux fois par semaine au plus) | Oui : la pause remet le compteur à zéro · Oui, tant qu'il ne conduit pas la nuit | Le droit : **561/2006**, art. 6 | | La pause coupe la conduite, elle ne remet pas la journée à zéro. | Valeurs : a de 4 h à 4 h 30, b de 6 h 15 à 6 h 30 (total toujours au-dessus de 10 h, pour qu'il n'y ait pas de cas « 10 h, deux fois par semaine ») |
| `pause-15-30` | droit | Pendant ses 4 h 30 de conduite, un chauffeur fait une pause de 15 min, puis une de 30 min. Est-ce permis ? | Oui : la pause de 45 min peut se faire en 15 min puis 30 min | Non, 45 min d'un seul bloc · Non, deux pauses de 10 min suffisent | Le droit : **561/2006**, art. 7 | | Dans cet ordre-là : 15 min d'abord, 30 min ensuite. | — |
| `affectation-sexe` | droit | Karim refuse de mettre une chauffeuse sur la tournée de la côte « parce que c'est une femme ». Est-ce permis ? | Non : c'est une discrimination en raison du sexe, interdite aussi pour l'affectation | Oui : c'est Karim qui décide des tournées · Oui, si la tournée est longue | Le droit : C. trav. **L1132-1** | ★ | Karim décide, mais sur des raisons de travail : permis, camion, repos. | — |

Écartées : le départ au plus tard de Rouen, l'autonomie des électriques face aux km, « louer ou sous-traiter ? », lettre de voiture
et contrat de location (jalons).

**Textes** : règlement (CE) n° 561/2006, art. 6 § 1 (« La durée de conduite journalière ne dépasse pas neuf heures. » + 10 h deux fois
par semaine), art. 7 (45 min après 4 h 30 ; « Cette pause peut être remplacée par une pause d'au moins quinze minutes suivie d'une
pause d'au moins trente minutes… »), art. 8 (repos journalier) · L1132-1 (critère « sexe », mesure « affectation »).

---

## ENT-6.9 — La tournée de la côte (Karim)

**Documents à gauche** : « Le droit ». La carte et les fiches des clients sont dans la vue.

| id | Rub. | Question | Juste | Pièges | À gauche | ★ | Retour de Karim | Risque |
|---|---|---|---|---|---|---|---|---|
| `minutes-90` | prép. | À 90 km/h, combien de minutes faut-il pour faire **{km}** km ? | {km ÷ 90 × 60} min | {km ÷ 90} min · {km × 90 ÷ 60} min | — | ★ | Temps (min) = km ÷ vitesse × 60. Tu le referas dans ta feuille. | Valeurs : km ∈ {45, 60, 75, 105, 135} (jamais les km d'autoroute de la séance). **Frôle** le bloc B (même calcul) |
| `pas-avant` | prép. | Un client ouvre à **{o}**. Le camion arrive à **{a}**. Que se passe-t-il ? | Il attend jusqu'à {o}, puis livre : il repartira plus tard | Il livre tout de suite · Il passe chez le client suivant et ne revient pas | — | | Arriver trop tôt, c'est du temps perdu. | Valeurs : o de 8:30 à 9:30, a 15 à 40 min avant ; jamais 10:00 (Malo) |
| `feuille-route` | prép. | Une **feuille de route**, c'est… | L'ordre des arrêts, avec les heures d'arrivée et de départ du chauffeur | La facture du client · La liste des fûts à charger | — | | C'est ce que Lucas suivra. | — |
| `jour-de-marche` | prép. | Vendredi, c'est jour de marché à Deauville. Pourquoi est-ce important pour livrer un café de la place ? | La place est prise par le marché : après une certaine heure, le camion ne passe plus | Les clients boivent plus le vendredi · Rien, le camion passe partout | — | | Un horaire de client, ça se respecte. | **frôle** l'ordre des arrêts (Deauville tôt) ; l'horaire est déjà sur la fiche du client. À toi de voir |
| `sms-au-volant` | droit | Tu envoies la tournée à Lucas, qui roule sur l'A13. Peut-il lire ton SMS en conduisant, téléphone en main ? | Non : c'est interdit ; il le lira à l'arrêt | Oui, sur autoroute c'est permis · Oui, si c'est pour le travail | Le droit : C. route **R412-6-1** | ★ | Amende et 3 points en moins sur le permis : il lira à Touques, à l'arrêt. | — |
| `vitesse-porteur` | droit | Sur autoroute, à quelle vitesse au plus roule le porteur de 16 t de Lucas ? | 90 km/h | 110 km/h · 130 km/h | Le droit : C. route **R413-8** | | C'est le 90 km/h de ta feuille de calcul. | donnée déjà écrite dans la feuille : sans risque |
| `dechargement-pause` | droit | Chez chaque client, Lucas décharge pendant 15 min. Est-ce une **pause**, au sens du règlement européen ? | Non : une pause, c'est un temps où il ne conduit pas et ne fait aucun autre travail | Oui, il ne conduit pas · Oui, si l'arrêt dure plus de 10 min | Le droit : **561/2006**, art. 4 d | | Décharger, c'est travailler. | **frôle** la case « pause nécessaire ? » : dit ce qui n'est pas une pause, ne dit pas si la conduite dépasse 4 h 30 |
| `rue-pietonne` | droit | Qui peut interdire aux camions, à certaines heures, la rue piétonne de Trouville ? | Le maire, par un arrêté | Le client de la rue · France Boissons | Le droit : CGCT **L2213-2** | | D'où les horaires de livraison des rues piétonnes. | — |

Écartées : « l'autoroute compte-t-elle dans les 4 h 30 ? » (piège de la conduite totale), tout ordre d'arrêts.

**Textes** : R412-6-1, al. 1 (« L'usage d'un téléphone tenu en main par le conducteur d'un véhicule en circulation est interdit. ») et
sanctions · R413-8 (90 km/h sur autoroute) · 561/2006, art. 4 d (« pause : toute période pendant laquelle un conducteur n'a pas le
droit de conduire ou d'effectuer d'autres tâches… ») · L2213-2, 1°.

---

## ENT-6.10 — Le retour de Lucas (Karim)

**Documents à gauche** : les conditions de vente, « Le droit ». **Pas** le dessin du quai ni le ticket (ce sont l'exercice).

| id | Rub. | Question | Juste | Pièges | À gauche | ★ | Retour de Karim | Risque |
|---|---|---|---|---|---|---|---|---|
| `avoir` | prép. | Un **avoir**, c'est… | Une somme que l'entreprise doit au client, déduite de sa prochaine facture | Une facture en plus · Une amende | conditions | ★ | Quand un client rend plus de vides qu'il n'a reçu de pleins, on lui doit de l'argent. | — |
| `solde-chez-client` | prép. | Un restaurant avait **{a}** fûts chez lui. On lui en livre **{l}** pleins et on reprend **{r}** vides. Combien de fûts a-t-il maintenant ? | {a + l − r} | {a + l + r} · {a − l + r} | conditions | ★ | Avant + livré − repris. | Valeurs : a de 3 à 8, l de 2 à 6, r de 1 à a ; jamais 9 / 9 / 8 (Malo). **C'est la ligne 5 de la grille** avec d'autres nombres |
| `ticket-terminal` | prép. | Le ticket de livraison et de reprise est imprimé par… | Le terminal du chauffeur, chez le client | La brasserie · Inès, le lendemain | — | | Il est rempli sur place, et signé par le client. | — |
| `qui-facture` | prép. | Qui édite la facture des clients ? | Inès, au service des ventes | Karim · Lucas · Le client | annuaire | | reprise d'ENT-6.1 : c'est à elle qu'on envoie le compte. | — |
| `consigne-nette` | droit | Un restaurant reçoit **{p}** fûts pleins et rend **{v}** fûts vides. Combien de consigne de fûts lui facture-t-on en plus ? | {(p − v) × 40} € | {p × 40} € · {(p + v) × 40} € | Le droit : arrêté du 6 février 2026 ; conditions | | On facture la consigne des pleins, on rend celle des vides. | Valeurs : p de 3 à 8, v de 1 à p − 1 ; jamais 9 et 8 |
| `reemploi-recyclage` | droit | Une bouteille jetée au verre devient du verre neuf. Un fût vide est lavé, puis rempli. Lequel est du **réemploi** ? | Le fût | La bouteille · Les deux | Le droit : C. env. **L541-1-1** | ★ | Réemploi : le même objet resert. Recyclage : on refait de la matière. | prépare l'étape 4 (verre jeté), sans ses calculs |
| `contrat-vides` | droit | Les conditions de vente acceptées par Malo disent : « vides repris par le chauffeur à la livraison ». Un chauffeur pourrait-il refuser de les reprendre ? | Non : le contrat s'impose aux deux parties, France Boissons doit les reprendre | Oui, s'il manque de place · Oui, au choix du chauffeur | Le droit : C. civ. **1103** | | Ce qu'on a promis par contrat, on le tient. | — |
| `terminal-chauffeur` | droit | Le terminal de Lucas enregistre l'heure de chaque livraison. Lucas doit-il le savoir ? | Oui : il doit en avoir été informé avant | Non, c'est le terminal de l'entreprise · Non, seulement s'il le demande | Le droit : C. trav. **L1222-4** | ★ | Même règle que pour le terminal vocal de jeudi. | reprise de 6.6, autre cas |

Écartées : « faut-il croire un ticket signé ? », « un fût plein refusé est-il un vide ? » (encadré et jalons 1-3), « qui paie le fût
cabossé ? » (phrase notée à Malo), « pourquoi reprendre les vides dans le même camion ? » et « que coûte un fût perdu ? » (questions
notées de l'animation).

**Textes** : arrêté du 6 février 2026 (déjà cité dans S2 ; **texte jamais relu**, Légifrance bloqué) · L541-1-1 · C. civ. 1103 (« Les
contrats légalement formés tiennent lieu de loi à ceux qui les ont faits. » — **à relire**) · L1222-4.

---

## Alertes pour Tristan (à lire avant de trancher)

1. **ENT-6.3 et le Code du travail (D3141-6)** : « L'ordre des départs en congé est communiqué […] à chaque salarié **un mois avant
   son départ**. » Or la séance fait le planning le **15 juin** pour des congés qui partent dès le **5 juillet** (Lucas en S1-S2 au
   1er envoi) : moins d'un mois. Ce n'est pas une question de la banque (je l'ai mise en réserve), mais un élève curieux ou un collègue
   d'éco-droit peut le relever. Trois issues : avancer la scène (planning fait en mai), dire dans la séance que les dates étaient
   communiquées plus tôt et qu'on ne fait que les confirmer, ou laisser tel quel (exercice). À trancher.
2. **ENT-6.1** : le brief dit « pas d'éco-droit dans cette séance » ; ta règle du 10/10 en demande 2 ou 3 à l'ouverture. J'ai suivi le
   10/10. La séance est **déjà construite et livrée** : ajouter l'écran d'ouverture ne change rien aux notes (questions non notées), et
   le moteur ne l'impose pas à un élève qui a déjà commencé.
3. **Dessins dans le dépôt** : les questions d'image de 6.4, 6.5, 6.6 et 6.7 utilisent les dessins de Cowork
   (`docs/briefs/france-boissons/materiel-*.svg`). Pour l'écran d'ouverture, le moteur veut l'image dans `contenus/images/<entreprise>/`
   avec sa ligne dans `CREDITS.md` : Claude Code les y copie (ou les reprend des étapes 0, si elles sont construites avant), crédit
   « Dessin — document pédagogique ».
4. **ENT-6.2** : le brief dit « banque de 14 questions validée », il n'en existe que 5. Ce fichier propose la banque complète (10).
5. **Textes de loi** : relus ce jour sur code.travail.gouv.fr, EUR-Lex et des reprises fidèles ; **Légifrance reste à relire** par
   Claude Code avant livraison (phrase entière, version en vigueur), en particulier : règlement 1169/2011 art. 2 (DDM), C. civ. 1103,
   arrêté du 6 février 2026, R4323-56 (modifié par le décret 2025-355, en vigueur depuis le 1/10/2025).
6. **Les questions qui « frôlent » un jalon** (colonne Risque) : ce sont surtout les calculs avec d'autres nombres (`stock-apres`,
   `ecart-calcul`, `taux-fiabilite`, `repos-11h`, `minutes-90`, `solde-chez-client`). Même logique que `consigne-rendue` d'ENT-6.2,
   que tu as validée. Si tu trouves qu'elles soufflent, je les remplace par des questions de vocabulaire.

## Sources vérifiées le 10/10/2026

- Code du travail (code.travail.gouv.fr) : [L1311-2](https://code.travail.gouv.fr/code-du-travail/l1311-2),
  [L2311-2](https://code.travail.gouv.fr/code-du-travail/l2311-2), [L3141-3](https://code.travail.gouv.fr/code-du-travail/l3141-3),
  [L3141-17](https://code.travail.gouv.fr/code-du-travail/l3141-17), [L1242-10](https://code.travail.gouv.fr/code-du-travail/l1242-10),
  [D3141-6](https://code.travail.gouv.fr/code-du-travail/d3141-6), [R4515-4](https://code.travail.gouv.fr/code-du-travail/r4515-4),
  [R4323-56](https://code.travail.gouv.fr/code-du-travail/r4323-56), [L4131-1](https://code.travail.gouv.fr/code-du-travail/l4131-1),
  [L4122-1](https://code.travail.gouv.fr/code-du-travail/l4122-1), [L4121-1](https://code.travail.gouv.fr/code-du-travail/l4121-1),
  [R4541-3](https://code.travail.gouv.fr/code-du-travail/r4541-3), [R4541-9](https://code.travail.gouv.fr/code-du-travail/r4541-9),
  [L1222-3](https://code.travail.gouv.fr/code-du-travail/l1222-3), [L1222-4](https://code.travail.gouv.fr/code-du-travail/l1222-4),
  [L1121-1](https://code.travail.gouv.fr/code-du-travail/l1121-1), [L1132-1](https://code.travail.gouv.fr/code-du-travail/l1132-1).
- Lien de subordination, Cass. soc. 13/11/1996 : [Legalstart](https://www.legalstart.fr/fiches-pratiques/recruter-salaries/lien-subordination/).
- Code de commerce : [L133-3](https://www.baumann-avocats.com/CCOM/article-l133-3-du-code-de-commerce.php),
  [L123-12](https://www.baumann-avocats.com/CCOM/article-l123-12-du-code-de-commerce.php),
  [L441-1](https://www.legalplace.fr/guides/cgv-entre-professionnels/).
- Code de l'environnement L541-1-1 : [Marques de France](https://www.marques-de-france.fr/cest-quoi-la-difference-entre-upcycling-reemploi-reutilisation-recyclage/).
- Code de la route : [R412-6-1](https://content.preventionbtp.fr/pdf/droit_de_la_prevention/article-r412-6-1-du-code-de-la-route-conduite-des-vehicules.pdf),
  [R413-8](https://content.preventionbtp.fr/pdf/droit_de_la_prevention/article-r413-8-du-code-de-la-route.pdf).
- CGCT L2213-2 : [The Trade Hub](https://www.thetradehub.eu/es/reglementation/france/codes-nationaux/cgct-art-l2213-2).
- Règlement (CE) 561/2006, art. 4, 6, 7, 8 : [EUR-Lex](https://eur-lex.europa.eu/legal-content/FR/TXT/HTML/?uri=CELEX:32006R0561).
- Règlement (UE) 1169/2011, dispense de DDM des boissons ≥ 10 % : [Weblex](https://www.weblex.fr/sites/default/files/images/docs/Rglementation%20des%20denres%20alimentaires-%20Annexe%20date%20de%20durabilit%20minimale-v2.pdf).
