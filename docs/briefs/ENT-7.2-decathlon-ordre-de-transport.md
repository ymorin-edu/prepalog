# Brief de séance — ENT-7.2 Decathlon, passer la commande : ordre de transport, courriel, appel au quai (1re, guidage C2.6.2)

> **📋 Phrase à copier-coller dans ccode (quand le chantier « Dialogue à choix » est livré et le §11 tranché) :**
>
> ```
> Lis docs/EN-COURS.md puis docs/briefs/ENT-7.2-decathlon-ordre-de-transport.md. Fais d'abord l'état des lieux du §7 en lecture seule (fiche « enregistrée » devenue pièce jointe, écran Nouveau courriel avec carnet et réponses automatiques, planning à créneaux déjà pris, vue Dialogue à choix) et dis-moi ce qui manque. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code. Ne construis pas avant que Tristan ait tranché les §4 bis, §4 ter et §11.
> ```

**Statut** : livré
**Date du brief** : 13/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiches `claude/prepalog-decathlon-cadrage.md` (décisions 5 à 15, poids §6.4) et
`claude/prepalog-decathlon-maquette.md` (décisions 16 à 21). **À lire avec `ENT-7.1-decathlon-choisir-transporteur.md`** : univers,
liste référencée, calcul du CO₂, mentions de reconstitution, vérifié / construit (§2 et §6 de 7.1) ne sont pas répétés ici.
**Modèle** : **Opus** pour la vue Dialogue à choix (chantier moteur à part, §7) ; **Sonnet** pour la séance ensuite.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-7.2 *(provisoire, comme 7.1)* |
| `id` | `decathlon-ordre-transport` |
| Titre / desc | « Decathlon — passer la commande » / « Alternant au service transport amont de Rouvignies : remplir l'ordre de transport d'un conteneur à partir de l'avis de mise à disposition, l'envoyer par courriel au prestataire retenu, puis appeler le quai pour réserver le créneau d'arrivée. » |
| Rubrique | simulog, entreprise n° 7 Decathlon |
| Niveau(x) | 1re |
| Compétence(s) | **C2.6.2** Échanger les informations, documents et instructions par le moyen de communication adapté |
| Temps pédagogique | **guidage** |
| Notation | jalons pondérés, note sur 20, coefficient 1 |
| Barème | `bareme: 20` (poids validés le 13/10, décision 14 ; part des questions à trancher, §5) |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |
| Niveaux prévus | `niveauxPrevus: ['confirme']` |

## 2. Vérifié / construit

Comme 7.1 §2. En plus :
- **Vérifié** : la **pesée du conteneur (poids brut vérifié, « VGM »)** est obligatoire avant le chargement sur un navire depuis le
  1er juillet 2016 (convention SOLAS, règle VI/2 amendée), responsabilité du chargeur — **à relire sur une source officielle (OMI ou
  ministère de la Mer) avant d'écrire la question p5** ; le **chiffre de contrôle** du numéro de conteneur suit la norme ISO 6346.
- **Construit** : le format de l'ordre de transport (inspiré des ordres de transport usuels, sans modèle d'entreprise réelle), les
  numéros (OT, scellé, référence), le planning du quai de Rouvignies, le chef de quai, les réponses de Contargo (« Service
  réservations », aucune personne nommée).
- Documents reconstitués : pied « Document reconstitué — document pédagogique Prepalog ».

## 3. Objectif pédagogique

L'élève sait **transmettre une commande de transport par le bon canal** : l'**écrit** pour ce qui engage (ordre de transport en pièce
jointe d'un courriel au prestataire, recopié **au caractère près** depuis l'avis du terminal), l'**oral** pour s'organiser (appel au
chef de quai pour le créneau), avec le ton qui convient à chacun (vous au prestataire, tu poli au collègue). Décision 8.
Prérequis : 7.1 (le choix). Suite : 7.3 (tout refaire sous contrainte quand la barge tombe).

## 4. Déroulé (≈ 45 min)

**Date dans la séance : mercredi 27/01/2027.** Nouveau conteneur de la collection printemps, **même trajet que 7.1** ; le choix est
déjà fait : la barge. *(Pas le conteneur de 7.1 : chaque séance a sa base et son tirage, cadrage « une base par séance ».)*

**Pastilles** : ① Ordre de transport · ② Courriel au prestataire · ③ Appel au quai · ④ Créneau.
**Menu progressif** : Avant de commencer · Messagerie · Ordre de transport · Nouveau courriel ; **Téléphone** apparaît après le premier
courriel envoyé (juste ou faux) ; **Planning du quai** après l'appel.

### Étape 1 — Le message de Claire (≈ 2 min)

« Bonjour {prénom}, / on a retenu **la barge de Contargo** pour les conteneurs de la collection printemps. Un nouveau vient d'être mis
à disposition à Anvers. / À toi de passer la commande : remplis l'ordre de transport, envoie-le à Contargo par courriel, puis appelle le
quai pour le créneau. Claire »
Pièces jointes : Avis de mise à disposition · Cahier des charges · Devis Contargo · Liste référencée.

### Étape 2 — L'ordre de transport (≈ 15 min, jalons 1 à 7)

Fiche « **Ordre de transport {OT}** » (fiche à remplir existante, agencement documents à gauche : Avis · Cahier des charges · Devis
retenu). En tête : « Donneur d'ordre : Decathlon, entrepôt de Rouvignies — service transport amont. » Bouton : **« Enregistrer l'ordre
de transport »** (et non « envoyer à… » : l'ordre part ensuite en pièce jointe, demande n° 1 du §7).

| Cadre | Case | Bloc | Attendu |
|---|---|---|---|
| Prestataire | Transporteur | liste (les 3 référencés) | Contargo |
| Le conteneur | N° de conteneur | texte (police à chasse fixe) | n° de l'avis, **au caractère près**, espaces ignorés, chiffre de contrôle compris |
| | Type | liste (20' · 40' · 40' HC) | 40' HC |
| | N° de scellé | texte | celui de l'avis, espaces ignorés |
| | Poids brut (kg) | nombre | celui de l'avis (« 14 620 », « 14620 ») |
| Enlèvement et livraison | Lieu d'enlèvement | liste (Terminal à conteneurs, port d'Anvers · Terminal de Bruay-sur-l'Escaut · Entrepôt de Rouvignies) | Terminal à conteneurs, port d'Anvers |
| | Disponible à partir du | date | jeudi 28/01/2027 |
| | Référence Decathlon | texte | celle de l'avis |
| | Lieu de livraison | liste (Decathlon Rouvignies — quai de réception conteneurs · Decathlon Dourges — Delta 3 · Terminal de Bruay-sur-l'Escaut) | Rouvignies |
| | Arrivée au quai au plus tard le … à … | date + heure | mardi 02/02/2027, 14:00 |
| Instructions | 5 cases à cocher, ordre tiré | cases | les 3 justes, aucune des 2 fausses |

Instructions : ✓ « Livraison sur rendez-vous : prendre le créneau auprès du quai de réception. » · ✓ « Ne pas briser le scellé : il est
ouvert au quai, à réception. » · ✓ « Ramener le conteneur vide au terminal après déchargement. » · ✗ « Conteneur frigorifique :
maintenir à −18 °C. » · ✗ « Marchandises dangereuses : transport ADR. »
Encadré (3 lignes) : « Recopie les numéros **depuis l'avis**, caractère par caractère. / Le dernier chiffre du n° de conteneur est un
**chiffre de contrôle**. / N'ajoute que les instructions qui concernent **ce** conteneur. »
Rien n'est jugé à l'écran ; enregistrement refusé tant qu'une case manque ; fiche figée ensuite ; elle devient la pièce jointe
`{OT}.pdf` proposée dans « Nouveau courriel ».

### Étape 3 — Le courriel au prestataire (≈ 8 min, jalons 8 et 9)

Écran **« Nouveau courriel »** (à étendre, §7 n° 2) : **À** (carnet déclaré par la séance : Routiers du Hainaut, Contargo, Rail Fret
Benelux, Quai de réception Rouvignies, Claire Vasseur) · **Objet** · **Pièces jointes** (l'ordre enregistré, et les documents de la
séance : cahier des charges, avis) · **Message** (texte libre, décision 18). « Envoyer ». Plusieurs envois possibles ; liste
« Envoyés » sous le formulaire.
**Réponses automatiques** (le personnage reprend ce que l'élève a écrit, sans corriger) :
- à un **prestataire référencé**, **avec** l'ordre en pièce jointe : « Bonjour, nous avons bien reçu votre ordre de transport {OT} pour
  le conteneur **{n° écrit dans l'ordre de l'élève}**. Enlèvement confirmé : départ de la barge jeudi 28/01 au soir, arrivée au terminal
  de Bruay vendredi 29/01, livraison à votre quai **lundi 01/02 vers 9 h**. Service réservations, {prestataire} » (pour un prestataire
  autre que Contargo, ses propres horaires construits : la route « mardi 02/02 vers 8 h », le rail « mercredi 03/02 vers 10 h ») ;
- **sans** pièce jointe : « Bonjour, nous ne pouvons pas enregistrer votre demande sans l'ordre de transport. Merci de nous le
  transmettre en pièce jointe. » ;
- au quai ou à Claire : pas de réponse automatique (Claire répond à la fin, §étape 5).

### Étape 4 — L'appel au quai (≈ 6 min, jalon 10)

Écran **« Téléphone »** : vue **Dialogue à choix** (nouvelle, §7 n° 3). Contact « Quai de réception — Rouvignies, poste 214 ». Le chef de
quai (fictif, nom à choisir §11 n° 4, ici **Mehdi Benali**) : collègue → **tu poli** ; les pièges sont familiers ou imprécis.
Une réponse maladroite fait réagir l'interlocuteur et repropose l'étape (jamais bloquant) ; les reprises sont comptées.

| Réplique du chef de quai | Juste | Pièges → sa réaction |
|---|---|---|
| « Quai de réception de Rouvignies, Mehdi, j'écoute. » | « Bonjour, c'est {prénom}, du transport amont. Je t'appelle pour réserver un créneau pour un conteneur. » | « Salut, c'est pour un camion. » → « Euh… bonjour. C'est qui, et c'est pour quoi exactement ? » · « Tu as de la place lundi ? » → « De la place pour quoi ? Tu es qui ? » |
| « D'accord. Tu as les références ? » | « Oui : conteneur **{n° de l'avis}**, ordre de transport {OT}. » | « {n° avec deux chiffres inversés, tiré} » → « Je ne le trouve pas, ce numéro. Relis-le sur ton avis. » · « C'est la collection printemps. » → « J'en reçois dix par semaine, de la collection printemps. Il me faut le numéro du conteneur. » |
| « Il arrive quand, et comment ? » | « Lundi 1er février vers 9 h, en camion depuis le terminal de Bruay. » | « Par bateau, directement au quai. » → « Un bateau ne vient pas à mon quai ! Le dernier bout, c'est en camion, non ? Et quel jour ? » · « Jeudi. » → « Jeudi, c'est le départ d'Anvers. Moi, je veux le jour où il arrive ici. » |
| « OK. Je t'ouvre le planning du quai de lundi : pose ton conteneur sur un créneau libre et envoie-le-moi. » | « D'accord, je le fais tout de suite. Merci ! » | « C'est bon, salut ! » → « … Bon. Tu me l'envoies, le planning ? » |

Les choix « juste » de la 2e et 3e réplique sont **calculés** sur la pièce de l'élève (son n°, son arrivée), jamais sur ce qu'il a écrit
dans l'ordre (le chef de quai lit l'avis du terminal). Ordre des réponses tiré par élève.

### Étape 5 — Le créneau (≈ 6 min, jalon 11)

**Planning du quai, lundi 01/02** (vue Planning existante, décision 19) : lignes **Quai 5, Quai 6, Quai 7** ; échelle 07:00 → 13:00, pas
30 min ; **créneaux déjà pris** (autres conteneurs, non déplaçables, §7 n° 4) : Quai 5 07:30–10:30 ; Quai 6 08:00–09:30 et 11:00–12:30 ;
Quai 7 09:00–12:00. **Carte de l'élève** : « Conteneur {n°} — déchargement 1 h 30 », arrivée du camion **09:00**.
Règles : `unAlaFois` (ligne), `fenetre` (pas avant l'arrivée), `attenteMax` 60 min. Bonne réponse unique : **Quai 6 à 09:30** (Quai 5 à
10:30 = 1 h 30 d'attente ; Quai 7 à 12:00 = 3 h). Guidage : problèmes en direct (règles du moteur, qui disent **que**, jamais **de
combien**). Envoi : « Envoyer au chef de quai ».
**Suite** (`apresPlanning`, neutre) — chef de quai : « C'est noté : {quai}, lundi 01/02 à {heure}. Merci ! Mehdi » ; puis **Claire** :
« Merci {prénom}. Commande passée, créneau réservé : je regarde tout ça. Claire »

**Pour réfléchir** (bilan, libre, non noté) : « Tu as écrit au prestataire et téléphoné au quai. Qu'est-ce qui se passerait si tu avais
seulement téléphoné à Contargo ? »

Mots cliquables : ordre de transport, donneur d'ordre, scellé, chiffre de contrôle, poids brut vérifié, enlèvement, mise à disposition,
créneau, rendez-vous au quai, pièce jointe.

### Ergonomie

1366 × 768 et 1280 × 720 sans défilement de page sur chaque écran ; l'ordre de transport tient en deux colonnes (`cadre` + `grille: true`,
`serree`) ; le n° de conteneur s'affiche en police à chasse fixe (on compte les caractères) ; Entrée n'envoie rien ; le corps du courriel
garde ce qui est tapé si l'élève change d'écran (brouillon).

## 4 bis. Questions au fil — PROPOSITIONS

| # | Geste | Qui pose | Question proposée | Type | Notée / réflexion | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| 1 | Ordre : saisie du n° de conteneur (`fiche:ot:cont`) | Claire | « À quoi sert le dernier chiffre du numéro de conteneur que tu viens de taper ? » — **juste** : « C'est un chiffre de contrôle : il fait repérer une erreur de saisie. » · « C'est le nombre de conteneurs du lot. » · « C'est le numéro du quai d'arrivée. » · « Il ne sert à rien, on peut l'oublier. » | fil | notée | tout de suite | ne donne pas la valeur à recopier ; montre pourquoi le caractère près compte |
| 2 | Ordre : case « Ne pas briser le scellé » (`fiche:ot:inst`) | Claire | **Éco-droit** : « Le conteneur arrive : scellé intact, mais trois cartons écrasés. Que doit faire Decathlon pour garder un recours contre le transporteur ? » — **juste** : « Lui notifier une protestation motivée dans les 3 jours qui suivent la réception. » · « Rien : le scellé intact prouve que tout va bien. » · « Attendre la fin du mois et le dire à la facture. » · « Prévenir la douane d'Anvers. » | fil | notée | tout de suite | **appliquée au cas** ; texte : Code de commerce art. **L. 133-3** (à relire sur Légifrance ; vérifier qu'il s'applique au transport fini par camion) |
| 3 | Premier courriel envoyé (geste à créer : `courriel:envoyer`, §7 n° 2) | Claire | « Tu as envoyé l'ordre par écrit, et tu vas appeler le quai. Pourquoi pas tout par téléphone ? » — **juste** : « L'écrit garde la trace de ce qui engage : conteneur, dates, instructions. » · « Le téléphone coûte plus cher. » · « Le prestataire ne répond jamais au téléphone. » · « C'est pareil, c'est une habitude. » | fil | notée | tout de suite | cœur de C2.6.2 (le moyen adapté) ; ne donne aucun jalon (le courriel est parti) |
| 4 | Planning : carte posée (`planning:quai:poser`) | chef de quai | « Pourquoi Decathlon impose-t-il un rendez-vous au quai ? » — **juste** : « Pour décharger chaque camion sans attente et sans bloquer les autres quais. » · « Pour facturer le transporteur. » · « Parce que le quai ferme à midi. » | fil | notée | **au bilan** | souffle la règle d'attente : au bilan |
| 5 | Fin de l'appel (geste à créer : `dialogue:quai:fin`) | chef de quai | « Tu m'as donné le numéro du conteneur. Pourquoi pas seulement “la collection printemps” ? » | fil | réflexion | au bilan | ancrée sur son appel |

Proposition Cowork : **1, 2, 3** notées (part 3 points) ; 4 en réserve ; 5 en réflexion.

## 4 ter. Avant de commencer — banque

`ouverture.tirage: { preparation: 2, droit: 2 }`. ★ = à reprendre en ENT-7.4.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| p1 | preparation | « Un ordre de transport, c'est… » | « le document par lequel le donneur d'ordre commande le transport et donne ses instructions » | « la facture du transporteur » · « le reçu signé à l'arrivée » | Mot cliquable + modèle vierge d'ordre | ★ |
| p2 | preparation | « Dans ce transport, qui est le donneur d'ordre ? » | « Decathlon » | « Contargo » · « Le terminal d'Anvers » | Cahier des charges | ★ |
| p3 | preparation | « À quoi sert le scellé d'un conteneur ? » | « À prouver qu'il n'a pas été ouvert depuis son chargement. » | « À le fermer à clé pendant le voyage. » · « À indiquer son poids. » | Avis de mise à disposition | ★ |
| p4 | preparation | « Où trouves-tu le numéro de scellé de ton conteneur ? » | « Sur l'avis de mise à disposition du terminal. » | « Sur le devis de Contargo. » · « Sur le cahier des charges. » | Avis | |
| p5 | preparation | « Sur l'avis, le poids est “brut vérifié”. Que veut dire “brut” ? » | « Marchandise, emballages et conteneur compris. » | « La marchandise seule. » · « Le conteneur vide. » | Avis | |
| d1 | droit | « Contargo dit n'avoir jamais reçu ta commande. Ton courriel avec l'ordre en pièce jointe peut-il servir de preuve ? » | « Oui : un écrit électronique vaut un écrit papier, si l'on sait qu'il vient de toi et qu'il n'a pas été modifié. » | « Non : seul un papier signé compte. » · « Oui, mais seulement s'il est imprimé. » | Code civil art. **1366** (à relire sur Légifrance) | ★ |
| d2 | droit | « Pourquoi l'avis parle-t-il de poids “vérifié” ? » | « Une règle internationale oblige à peser le conteneur avant de le charger sur un navire. » | « C'est Decathlon qui le pèse à Rouvignies. » · « C'est facultatif, pour information. » | SOLAS, règle VI/2 (source à relire, §2) | |
| d3 | droit | « Les devis de 7.1 donnaient le CO₂. Cette information, Contargo devait-il la donner ? » | « Oui : la loi oblige le prestataire à informer son client du CO₂ de la prestation. » | « Non, c'est un geste commercial. » · « Seulement si Decathlon le demande. » | Code des transports art. L. 1431-3 | ★ |
| d4 | droit | « Trois cartons arrivent écrasés, scellé intact. Combien de temps Decathlon a-t-il pour protester auprès du transporteur ? » | « 3 jours après la réception, sans compter les jours fériés. » | « 1 an. » · « Aucun délai. » | Code de commerce art. L. 133-3 *(si la question au fil n° 2 est gardée, remplacer d4 par une autre question)* | |

## 5. Jalons / notation (sur 20)

Rien de vrai avant l'enregistrement de l'ordre, l'envoi du courriel, la fin de l'appel ou l'envoi du planning ; **inaction = 0**.

**Poids validés (décision 14)** — Ordre de transport **12** (identification du conteneur 6 ; enlèvement / livraison 4 ; instructions 2) ·
Courriel **5** (bon destinataire + pièce jointe 3 ; objet et corps clairs 2 = forme) · Appel au quai **3**.

⚠ **À trancher (§11 n° 1)** — comme 7.1 : (a) poids validés, questions en réflexion ; (b) part 3, proposition : Ordre **10**
(identification 6 · enlèvement / livraison **3** · instructions **1**) · Courriel **4** (destinataire + PJ 3 · forme **1**) · Appel 3 ·
questions 3. *(Le cœur — recopier juste et envoyer au bon — garde ses points ; ce qui cède : une case de lieu, une case d'instruction,
la forme.)*

| # | Groupe | Jalon | Poids (validé) | Ce qu'il lit | Piège |
|---|---|---|---|---|---|
| 1 | Ordre de transport | N° de conteneur au caractère près (espaces ignorés, majuscules indifférentes) | 3 | fiche `ot` | chiffre de contrôle oublié ; deux chiffres inversés ; O pour 0 |
| 2 | Ordre de transport | Scellé exact | 1,5 | `scelle` | |
| 3 | Ordre de transport | Poids **et** type 40' HC | 1,5 | `poids`, `type` | 40' au lieu de 40' HC ; poids net |
| 4 | Ordre de transport | Transporteur Contargo **et** lieu d'enlèvement Anvers | 2 | `presta`, `enl` | Bruay en enlèvement |
| 5 | Ordre de transport | Livraison Rouvignies **et** limite 02/02 14:00 | 2 | `liv`, `limd`, `limh` | Dourges ; date de disponibilité en limite |
| 6 | Ordre de transport | Instructions : les 3 justes, aucune fausse | 2 | `inst` | ADR ou froid coché |
| 7 | — | *(jalon de passage, `compte: false`)* ordre enregistré | — | | |
| 8 | Courriel | Envoyé à **Contargo** avec l'**ordre en pièce jointe** | 3 | courriels envoyés (§7 n° 2) | ordre envoyé au quai ou à Claire ; pas de pièce jointe ; autre prestataire |
| 9 | Courriel | Forme : objet qui nomme le conteneur ou l'ordre (n° sans espaces, ou « ordre de transport ») ; corps avec formule d'appel, signature, **vouvoiement** | 2 | même courriel | objet vide ; « Salut » ; tutoiement ; pas de signature |
| 10 | Appel au quai | Appel fini avec **au plus 2 reprises** | 1,5 | état du dialogue | |
| 11 | Appel au quai | Créneau : posé sans chevauchement, après l'arrivée, attente ≤ 60 min (Quai 6, 09:30) | 1,5 | planning envoyé (`etapesPlanning`) | Quai 5 à 10:30 ; avant 09:00 |

Remarques : jalon 9 jugé sur **le courriel qui porte l'ordre à Contargo** (le premier, s'il y en a plusieurs) ; s'il n'y en a pas, sur le
dernier courriel à un prestataire. Repères du jalon 9 (mots-clés, sans majuscules ni accents) : formule `bonjour|madame|monsieur` ;
signature = prénom de l'élève **ou** « Decathlon » dans les 3 dernières lignes ; tutoiement = `\btu\b|\bte\b|\bton\b|\bta\b|salut|stp`.
La répartition 1,5 + 1,5 de l'appel est une proposition (le total 3 est validé). Le n° de conteneur faux dans l'ordre se paie au jalon 1
seulement (la réponse de Contargo le reprend tel quel ; le chef de quai lit l'avis).

**Bonus du confirmé** : une 6e instruction tirée dans la banque `bonus` (« Conteneur à haut risque de vol : prévoir un parking
surveillé si le camion stationne » — juste pour un conteneur de chaussures ? **à trancher**, sinon une instruction fausse de plus : « Hayon
élévateur obligatoire »), +0,5 si bien traitée ; et un 2e créneau pris de plus dans le planning. Proposition à valider (§11 n° 5).

## 6. Contenu

`contenus/decathlon-ent72.js` (messages, documents, fiche `ot`, carnet, réponses, dialogue `quai`, planning, jalons, `TIRAGE`,
`SOLUTION`) ; univers `contenus/decathlon.js` (7.1) ; `contenus/questions/ENT-7.2.js` ; corrigé `contenus/corriges/ENT-7.2.js`.

| Donnée | Valeur de référence (élève témoin) | Tirée |
|---|---|---|
| Conteneur | **PLGU 418270 6** (chiffre de contrôle calculé) | n° dans une banque de 6, ≠ celle de 7.1 |
| Scellé | DC 0 771 409 | tiré |
| Poids brut | 14 980 kg | 13 500 à 15 800 kg |
| Disponible | jeudi 28/01/2027 | fixe |
| Limite au quai | mardi 02/02/2027, 14 h | fixe |
| Référence Decathlon | PO-ROU-2027-0412 | tirée (4 chiffres) |
| N° d'ordre | OT-2027-0142 | fixe |
| Arrivée prévue (Contargo) | lundi 01/02, 09:00, camion depuis Bruay | fixe |

Le **n° « piège »** de la réplique 2 (deux chiffres voisins inversés) est calculé sur le n° tiré et doit avoir un chiffre de contrôle
**faux** (sinon on choisit une autre paire).

## 6 bis. Tirage et niveaux

- Pièce fixe : le conteneur (valeurs tirées), l'ordre, le planning.
- Banque `instructions` : les 2 instructions fausses tirées parmi 4 (froid, ADR, « hayon élévateur obligatoire », « livraison
  en zone sous douane ») — `melange: { moyen: 2 }`.
- Bonus confirmé : voir §5.
- Contrôle d'équité : n° piège à chiffre de contrôle faux ; aucun créneau libre autre que Quai 6 entre 09:00 et 10:00.
- Consigne neutre ; accompagné : contenu standard.

## 7. Demandes au moteur — état des lieux d'abord

1. **Fiche « enregistrée » → pièce jointe** : une fiche dont l'envoi n'a pas de destinataire (`envoi: { enregistrer: true, nomPiece:
   'OT-2027-0142.pdf' }` ou équivalent) devient une pièce jointe proposable dans un courriel ; à l'ouverture de la pièce jointe, la fiche
   s'affiche figée comme un document. **Petit**.
2. **Écran « Nouveau courriel » étendu** (l'écran « Nouveau message » existe, réponses automatiques des fournisseurs via
   `reponsesFournisseur`) : **carnet déclaré par la séance** (`carnet: [{ id, nom, mail, role }]`), **pièces jointes** à l'envoi (fiches
   enregistrées, documents de la séance), **réponses automatiques par destinataire** lisant les pièces jointes et l'ordre de l'élève, le
   **geste** `courriel:envoyer` (et `courriel:envoyer:<id du destinataire>`) pour les questions au fil et les déclencheurs, et une
   lecture pour les jalons (`courrielsEnvoyes(db)` → `[{ a, objet, corps, pieces, at }]`). Brouillon gardé entre deux écrans.
   **Moyen**. Sert aussi à 7.3 et 7.4.
3. **Vue « Dialogue à choix »** (nouvelle — décision 8, listée pour la 2de dans `prepalog-2de-hors-socle-et-vues.md`) : un appel
   téléphonique habillé (contacts, bouton « Appeler », bulles), des répliques, 2 à 4 réponses par réplique (ordre tiré), une réponse
   maladroite fait **réagir** l'interlocuteur et repropose l'étape, **compteur de reprises**, textes calculables sur la base de l'élève
   (`(db) => …`, comme les fiches), **mode évaluation** (pas de réaction corrective, la première réponse compte, l'interlocuteur
   enchaîne de façon neutre — pour 7.4), geste `dialogue:<id>:fin`, état `db.dialogues[<id>]` cloisonné par séance, jalon helper.
   Réutilise les personnes des questions au fil. **Chantier moteur à part, Opus**, pensé pour servir ailleurs (chauffeur à l'accueil,
   client mécontent, fournisseur en retard). Brief moteur `MOTEUR-vue-dialogue.md` à écrire par Cowork.
4. **Planning à créneaux déjà pris** : vérifier que la vue Planning sait montrer des cartes **déjà posées et non déplaçables** (autres
   conteneurs) qui comptent dans `unAlaFois` ; sinon, la proposer (ou utiliser `dispo` des lignes si cela suffit à dire « occupé »).
   Vérifier aussi qu'un planning peut n'apparaître au menu qu'**après** un geste (`quand`).
5. **Téléphone au menu après le premier courriel** (`quand`, comme une fiche).

## 7 bis. Séance déjà jouée ?

Non.

## 8. Tests attendus

Bloc `decathlon` (même fichier que 7.1), cas « ENT-7.2 » :
- **À la main** : PLGU 418270 → 6 ; n° piège PLGU 418720 → chiffre de contrôle 4 (≠ 6) : le choix piège affiche « PLGU 418720 6 ».
- Parcours juste 20 / 20 ; inaction 0 ; ordre incomplet refusé.
- **Pièges** : chiffre de contrôle oublié → 1 faux ; 40' → 3 ; Bruay en enlèvement → 4 ; ADR coché → 6 ; ordre envoyé au quai → 8 ;
  courriel sans pièce jointe → 8 faux **et** réponse « merci de nous transmettre l'ordre » ; « Salut » → 9 ; 3 reprises → 10 ; Quai 5 à
  10:30 → 11.
- **Une erreur ne se paie qu'une fois** : n° faux dans l'ordre, courriel juste → 8 vrai ; réponse de Contargo cite le n° **de l'élève**.
- **Neutralité** : aucune réponse automatique ni message de Claire ne dit « juste », « erreur », « correct ».
- Ergonomie 1366 × 768 / 1280 × 720 sur les quatre écrans ; menu progressif (Téléphone, Planning).
- **Sabotages** : juger le jalon 8 sur le dernier courriel au lieu de celui qui porte l'ordre → un cas doit tomber ; réponse de Contargo
  qui cite le n° de l'avis → le cas « erreur payée une fois » doit tomber.

## 9. Supports

Trame courte (Cowork, après validation à l'écran) : l'ordre de transport vierge ; « écrit / oral : qui, quoi, pourquoi » ; L. 133-3 et
art. 1366 ; vérifié / construit. Corrigé `ENT-7.2.js` (ses valeurs tirées).

## 10. Critères de validation par Tristan

On recopie l'avis dans l'ordre sans chercher ; l'ordre tient sans défiler ; le courriel ressemble à un vrai client de messagerie ; l'appel
se lit comme une conversation (pas comme un QCM) ; le planning montre clairement les créneaux pris ; 45 min tenues — **risque** : quatre
écrans en une séance ; si l'essai déborde, le créneau (étape 5) passe en début de 7.3.

## 11. Questions ouvertes

1. [x] Part des questions au fil : (a) ou (b) (§5) ? **(b)**
2. [x] Répartition interne de l'appel (dialogue 1,5 + créneau 1,5) ? **Oui.**
3. [x] Repères du jalon 9 (objet, formule, signature, vouvoiement) ? **Oui.**
4. [x] Nom du chef de quai : **Mehdi Benali** (14/10).
5. [x] Bonus du confirmé : **les deux** — 6e instruction **fausse** « Hayon élévateur obligatoire » (+0,5 si non cochée) et un
   2e créneau pris de plus au planning (14/10).
6. [x] Question au fil n° 2 : **remplacée** (14/10). L. 133-3 vise le transport intérieur ; à l'international par route, c'est la CMR
   (art. 30 : réserves dès la livraison pour un dommage apparent) ; la barge relève de la CMNI : délai incertain pour ce trajet en deux
   morceaux. Nouvelle question, juste sous tous les régimes : « Le conteneur arrive : scellé intact, mais trois cartons écrasés. Que
   fais-tu pour que Decathlon garde un recours contre le transporteur ? » — **juste** : « J'écris des réserves précises sur le document
   de livraison, à la réception, avant que le chauffeur reparte. » · « Rien : le scellé intact prouve que tout va bien. » · « Je le
   signale à la fin du mois, sur la facture. » · « Je préviens la douane d'Anvers. »
7. [x] Le chantier « Dialogue à choix » : **livré** le 14/10 (lots 1 à 3).
8. [x] **Mauvais numéro** : un contact à messagerie appelé avant le quai **compte comme une reprise** au jalon 10 (aucun poids changé,
   14/10).

**Autres décisions du 14/10 (Tristan)** : questions au fil 1, 2, 3 notées (1 point chacune), 4 en réserve, 5 en réflexion ; banque
« Avant de commencer » : d1, d2, **d3 corrigée** (juste : « Non, la loi ne l'impose pas encore pour un transport parti de l'étranger :
c'est le cahier des charges de Decathlon qui l'exige », comme 7.1), **d4 retirée** (doublon de la question au fil n° 2) ; compétence
**C2.6** (comme 7.1) ; **version complète** (les quatre écrans, créneau compris). Reprises de 7.1 : préfixe de conteneur **PRPU**
(PLGU est attribué au registre BIC ; chiffre de contrôle recalculé), **Rail Flandres-Artois** au lieu de « Rail Fret Benelux ».

---

## Compte rendu *(rempli par Claude Code à la livraison, 14/10/2026)*

- **Fichiers créés / modifiés** : `activites/decathlon-ordre-transport.js` (la séance, `pret: true, ouverture: 'prof'`) ; `contenus/decathlon-ent72.js` (documents, ordre, carnet et
  réponses, téléphone, planning, messages, jalons, pastilles, accueil) ; `contenus/decathlon-ent72-donnees.js` (données pures : tirage, numéro piège, attendus) ;
  `contenus/questions/ENT-7.2.js` ; `contenus/corriges/ENT-7.2.js` ; `activites/index.js` (une ligne) ; `contenus/decathlon.js` (**univers commun** : Mehdi Benali ajouté à `EQUIPE`) ;
  `activites/FICHE-SEANCE.md` (deux pièges) ; **tests** : `outils/test/decathlon.mjs` (17 cas « ENT-7.2 » ajoutés, aucun cas existant réécrit) et
  `outils/test/tirage-niveaux.mjs` (**touché** : une entrée dans `BANQUES_FIGEES`, comme 7.1). Rien dans `core/` ni `styles/`. Pas de trame (Cowork).
- **Écarts par rapport au brief** :
  - **Banque « Avant de commencer »** : le moteur exige au moins le double de ce qu'on tire par rubrique ; d1, d2, d3 ne font que 3 en droit pour en tirer 2. **J'ai ajouté une 4e question de droit, `d5`**
    (« Qui doit faire vérifier le poids d'un conteneur avant son chargement ? » : le chargeur, d'après le document sur la pesée) : **à valider par Tristan**. d4 retirée comme décidé.
  - **Instructions fausses** : banque de 4 pièces, 2 tirées parmi froid, ADR, « zone sous douane » ; **le hayon est le bonus du confirmé** (jamais tiré au socle). Au jalon 6, le hayon coché ne coûte que le bonus.
  - **Créneau pris « de plus »** : un planning est une déclaration fixe (pas de fonction de la base) : je ne peux pas le réserver au confirmé. Le bloc de plus (Quai 7, 07:00–08:30) est donc **pour tous** ; il ne change pas la bonne réponse (testé avec et sans).
  - **Planning** : la carte s'appelle « Ton conteneur » (pas de numéro : titre fixe) ; le bouton dit « Envoyer le planning au chef » ; pas de bande ambrée ni de légende de carte, pour tenir à 1280 × 720 (706 px au lieu de 842).
  - **N° de conteneur** : la police à chasse fixe est dans l'avis (le document), pas dans la case de saisie (le moteur n'a pas l'option). **« Référence Decathlon » et « Disponible à partir du »** : cases présentes, non jugées (le brief ne les met dans aucun jalon).
  - **Parcours** : `parcours` + `precedente: 7.1` + `suiteAuBilan` (pas de `correction` : l'ordre est figé à l'enregistrement, le courriel n'a pas d'envoi final) ; ordre en deux colonnes qui défilent dans leur colonne (`defile`), la page ne bouge pas.
  - **Appel** : deux contacts à messagerie vocale (Claire Vasseur ; Contargo — réservations, aucune personne nommée) ; chaque contact différent appelé avant le quai = une reprise.
  - **Jalon 9** : jugé sur le premier courriel qui porte l'ordre à Contargo ; à défaut, le dernier courriel à un prestataire ; à défaut, le dernier courriel (pour qu'une erreur ne se paie qu'une fois). Prénom de l'élève lu sur le premier message reçu. L'objet accepte aussi « OT-2027-0142 ».
  - **Questions** : ajout de « seulement téléphoné à Contargo ? » (Pour réfléchir du §4) en plus de la n° 5 (`numero-quai`, réflexion libre, au bilan) ; n° 4 en réserve (`actif: false`). Lexique 7.2 dans la séance (pas dans l'univers).
- **Décisions prises en route** : voir `docs/decisions.md` (14/10, ENT-7.2). Un piège de moteur trouvé : `note: { sur: 20 }` dans un `planning` remplace toute la note de la séance (consigné dans `FICHE-SEANCE.md`).
- **Tests** : bloc `decathlon` 32/32 (17 cas ENT-7.2, ~40 s) ; suite entière 1446/1447 puis vert après l'entrée de `BANQUES_FIGEES` (331 s). 19 sabotages, **chacun fait tomber au moins un cas** : jalon 8 jugé sur le dernier courriel (2) ; réponse de Contargo qui cite le n° de l'avis (1) ;
  jalon 9 jugé sur le dernier courriel (1, après ajout d'un cas qui ne tombait pas) ; chaque jalon 1 à 6, 8, 9, 10, 11 affaibli (1 à 3 cas) ; bonus toujours juste (1) ; Claire qui dit « correct » (1) ; piège de l'appel = vrai numéro (2) ; numéro de l'avis remplacé par celui de l'ordre dans l'appel (1) ; créneau pris retiré (3).
- **Vérifié** : chiffres de contrôle à la main (3 et 1) ; Code civil art. 1366 (lu sur un site tiers, Légifrance n'a pas répondu) ; VGM (coordinateur). **Construit** : tout le reste, dit en pied de chaque document.
- **Commits** : voir `git log` (séance en brouillon, puis livraison).
- **Reste ouvert** : (1) ~~valider `d5`~~ validée par Tristan le 14/10/2026 ; (2) relire l'art. 1366 sur Légifrance ; (3) le planning ne peut pas porter le n° de l'élève ni un bonus propre au confirmé : demande au moteur si Tristan y tient (7.3, 7.4) ; (4) trame courte (Cowork) ;
  (5) l'ordre (douze cases, six instructions) défile dans sa colonne à 1366 × 768 : à regarder à l'écran.
