# Brief de séance — ENT-7.1 Decathlon, ton premier conteneur : choisir le transporteur (1re, guidage C2.6.1)

> **📋 Phrase à copier-coller dans ccode (quand Tristan aura tranché le §11) :**
>
> ```
> Lis docs/EN-COURS.md puis docs/briefs/ENT-7.1-decathlon-choisir-transporteur.md. Fais d'abord l'état des lieux du §7 en lecture seule (comparateur avec les blocs existants de la fiche, carte en document image, réponse automatique d'un prestataire) et dis-moi ce qui manque. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code. Ne construis pas avant que Tristan ait tranché les §4 bis, §4 ter et §11.
> ```

**Statut** : à valider par Tristan — construite le 13/10/2026 (`pret: true, ouverture: 'prof'`), voir le compte rendu en bas *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 13/10/2026
**Conversation d'origine** : Cowork (Opus). Fiches du projet : `claude/prepalog-decathlon-recherche.md` (faits, décisions 1 à 4),
`claude/prepalog-decathlon-cadrage.md` (décisions 5 à 15, poids validés §6.4), `claude/prepalog-decathlon-maquette.md` (décisions
16 à 21). Maquette cliquable : `G:\Mon Drive\Travail\Logistique\1L\Claude outputs\maquette-decathlon-7x.html` (antérieure aux
décisions 16 à 21 : noms de prestataires, CO₂ et option A/B y sont périmés, ce brief fait foi).
Séances liées : `ENT-7.2` (transmettre l'ordre), `ENT-7.3` (aléa), `ENT-7.4` (évaluation).
**Modèle** : **Opus** pour l'état des lieux du §7 et la carte ; **Sonnet** suffit pour la séance une fois le §7 tranché.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-7.1 *(provisoire : Decathlon revient en 2de et en Tle, renumérotation possible avant que les élèves jouent la série, cadrage §6.5)* |
| `id` (jamais modifié ensuite) | `decathlon-choix-transporteur` |
| Titre / desc | « Decathlon — ton premier conteneur » / « Alternant au service transport amont de l'entrepôt de Rouvignies : lire le cahier des charges d'un conteneur arrivé à Anvers, écarter les offres qui ne conviennent pas, comparer coût et CO₂, choisir le transporteur et justifier son choix. » |
| Rubrique | simulog, entreprise n° 7 Decathlon (première séance de 1re) |
| Niveau(x) | 1re |
| Compétence(s) | **C2.6.1** Choisir un transporteur correspondant au cahier des charges dans une liste référencée |
| Temps pédagogique | **guidage** (`temps: 'guidage'`) |
| Notation | jalons pondérés, note sur 20, coefficient 1 |
| Barème | `bareme: 20` (poids validés le 13/10, décision 14 ; part des questions au fil à trancher, §5) |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |
| Niveaux prévus | `niveauxPrevus: ['confirme']` (cas bonus, §6 bis) |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

- **Vérifié (web)** :
  - Decathlon, objectif public : **−20 % d'émissions absolues du transport en 2026 par rapport à 2021** ; leviers publiés : moins
    d'avion, rail et barge, mesure du CO₂, remplissage des camions ([engagements.decathlon.fr](https://engagements.decathlon.fr/decarboner-le-transport-de-marchandises),
    lu le 06/10/2026).
  - Entrepôt de **Rouvignies** (59, près de Valenciennes), **au bord de l'Escaut**, approvisionne les magasins d'Europe du Nord
    ([FashionNetwork, 2012](https://uk.fashionnetwork.com/news/Oxylane-readies-its-new-logistics-platform,518462.html)). Chiffres de 2012 :
    à dire comme tels.
  - Produits venus du **Vietnam** (textile, chaussures) : sources DHL (2019) et Maersk (2021), fiche recherche §1.
  - **Barge Anvers ↔ Valenciennes : Contargo, 8 allers-retours par semaine** ; terminal de **Bruay-sur-l'Escaut / Saint-Saulve**
    (communiqué Contargo du 04/02/2025, repris par [L'Observateur, 10/02/2025](https://www.lobservateur.fr/transport-fluvial-contargo-valenciennes-nord/)).
  - **Information GES obligatoire** : article **L. 1431-3 du Code des transports** — « toute personne qui commercialise ou organise une
    prestation de transport de personnes, de marchandises ou de déménagement » informe le bénéficiaire de la quantité de gaz à effet
    de serre émise ; CO₂ depuis le 1er octobre 2013, étendu aux autres gaz à effet de serre le 1er juin 2017 ; principes de calcul aux
    articles D. 1431-1 à D. 1431-23 ([ministère de la Transition écologique](https://www.ecologie.gouv.fr/politiques-publiques/information-ges-prestations-transport),
    lu le 13/10/2026). **Légifrance n'a pas pu être lu** (page refusée à l'outil) : texte exact de l'article à relire sur Légifrance
    avant de l'écrire dans la séance.
  - Facteur d'émission du **camion 44 t : 0,051 kg CO₂ par tonne-km** (ADEME Base Carbone, repris par la [Banque de France, méthodologie
    fret, 07/2026](https://www.banque-france.fr/system/files/2026-07/Methodologie_fret.pdf)).
- **Construit (dit comme tel en pied de chaque document)** : que Decathlon utilise ce service barge ; la liste référencée ; les noms
  des prestataires route et rail (aucun prestataire réel vérifié, décision 16) ; tous les prix, dates, horaires, distances arrondies,
  numéros de conteneur, scellés, références ; les facteurs d'émission de la barge et du rail (ordres de grandeur, §6) ; Claire Vasseur.
- **Contargo est nommé** (décision 16) : son devis porte « Contargo » et l'adresse fictive `booking@contargo.example` ; aucune personne
  de Contargo n'est nommée (« Service réservations ») ; pied : « Devis reconstitué — document pédagogique Prepalog. Prix, dates et CO₂
  construits ; Contargo assure réellement la ligne Anvers ↔ Valenciennes. »
- **Logo** : bandeau texte « DECATHLON » (comme la maquette) ; pas de logo image sans accord de Tristan.
- **Charte** : le bleu Decathlon reste au bandeau et au menu ; dans la zone de travail, l'accent passe à l'encre (règle des chartes
  colorées, appliquée par le moteur d'après la teinte : **à vérifier** que le moteur traite le bleu comme le rouge et le vert, sinon le
  dire — sur les cartes de transport, le bleu veut dire « le client et son emplacement »).

## 3. Objectif pédagogique

L'élève sait **choisir un transporteur dans une liste référencée à partir d'un cahier des charges** : relever le besoin (date limite au
quai, budget, critère environnemental), **écarter** ce qui ne convient pas (hors liste, hors délai), **comparer** coût et CO₂ de ce qui
reste, **décider et justifier** dans l'ordre « la date d'abord, puis le CO₂ » (décision 6) — la moins chère n'est pas la bonne réponse.
**Contre la copie (Tristan, 13/10/2026, décision 22)** : l'offre en retard est **tirée par élève** (§6 bis) ; selon le tirage,
la bonne réponse est **la barge ou le rail**. Deux voisins n'ont pas forcément la même réponse.
Premier temps de C2.6 en 1re ; la transmission (C2.6.2) vient en ENT-7.2, l'aléa en ENT-7.3, l'évaluation en ENT-7.4.
Aucune séance ne suppose un cours préalable (cadrage §6.4) : le vocabulaire est apporté par « Avant de commencer » et les documents.

## 4. Déroulé (≈ 45 min)

**Date dans la séance : lundi 25/01/2027 au matin.** *(À corriger : la maquette disait « disponible le 22/01 » et faisait partir la
barge le 22 au soir ; il faut que la séance se joue **avant** le départ des offres. Proposition : conteneur disponible au terminal
d'Anvers le **mardi 26/01**, séance le **lundi 25/01** — voir §6, dates recalées.)*
L'élève est **{prénom}, alternant(e) au service transport amont de l'entrepôt de Rouvignies**. Tutrice : **Claire Vasseur**, responsable
transport amont (fictive). Tutoiement entre collègues, vouvoiement avec les prestataires.

**Pastilles d'étape** (option `pastilles`, D-10) : ① Lire le besoin · ② Trier les offres · ③ Comparer · ④ Choisir. Une pastille
est « faite » quand la partie correspondante de la fiche est remplie (jamais « juste »).

**Menu** (réduit, progressif) : Avant de commencer · Messagerie · Carte des itinéraires · Comparateur d'offres (`menu: []` pour les
écrans de données : ni stock, ni commandes, ni réceptions).

### Étape 0 — Avant de commencer (≈ 5 min, non noté)

Voir §4 ter. Porte le **rappel** de Decathlon (décision 13).

### Étape 1 — Le message de Claire (≈ 3 min)

**Message d'accueil de Claire** (3 blocs, pièces jointes) :
« Bonjour {prénom}, / un conteneur de la collection printemps vient d'être dédouané à Anvers. Il doit être à notre quai avant la mise
en rayon. / Le cahier des charges, notre liste de prestataires référencés et les devis reçus sont joints. Regarde les trois
itinéraires sur la carte, remplis le comparateur et envoie-moi ton choix. Claire »
Pièces jointes : Cahier des charges · Liste référencée · un devis par offre (4 au socle, plus les offres bonus d'un confirmé) ·
Avis de mise à disposition. Consigne **neutre** : ne compte pas les devis (« les devis reçus »).

### Étape 2 — La carte des itinéraires (≈ 5 min, rien de noté)

Trois façons d'aller d'Anvers à Rouvignies, distinguées **par la forme** (lisible en noir et blanc) : route = trait plein ;
barge = tirets ; rail = trait fin à traverses ; camion final = pointillé. Seul l'entrepôt d'arrivée est en bleu ; rien n'est vert.
Encart « les derniers kilomètres » (terminal de Bruay-sur-l'Escaut, Valenciennes, Rouvignies). Un clic sur un itinéraire (ou dans
la liste à droite) ouvre sa fiche : trajet, distance, terminaux, offres reçues pour ce mode (« les prix, dates et CO₂ sont dans les
devis »). Rien n'est noté sur cet écran ; l'ouverture n'est pas un geste (règle du 03/10).

| Itinéraire | Distance (arrondie, construite) | Trajet |
|---|---|---|
| Route | 165 km | Anvers → Malines → Bruxelles → Mons (E19 puis A2) → Valenciennes → Rouvignies, porte à porte |
| Barge + camion | ≈ 215 km + 6 km | Escaut par Gand, Audenarde, Tournai, Condé → terminal de Bruay-sur-l'Escaut → camion 6 km |
| Rail + camion | ≈ 175 km + 48 km | Anvers → Gand → Courtrai → Lille → terminal rail-barge de Dourges → camion 48 km jusqu'à Rouvignies |

**Deux façons de faire la carte (à trancher, §11 n° 1)** : (A) **document image** (SVG dessiné par Cowork à partir de la maquette,
loupe plein écran ; existe depuis D-10) — la séance se construit tout de suite, sans chantier moteur, mais les itinéraires ne se
cliquent pas (fiche de chaque trajet en texte sous la carte) ; (B) **carte interactive** (extension de `core/types/carte.js` à
l'échelle régionale, itinéraires cliquables) : chantier moteur à part (§7), qui servira à 7.3 (écluse barrée), 7.4 (Dourges) et à la Tle.

### Étape 3 — Le comparateur d'offres (≈ 25 min, jalons 1 à 7)

Fiche « **Comparateur d'offres — conteneur {n°}** », **option B** partout (décision 17) : l'élève **reporte lui-même** l'arrivée, le
prix et le CO₂ depuis les devis. Documents à gauche (onglets, 3 au plus visibles à la fois) : Cahier des charges · Liste référencée ·
le devis ouvert (l'élève passe d'un devis à l'autre par « ‹ Précédent / Suivant › »). **Rien n'est jugé à l'écran** ; envoi refusé
tant qu'il manque une réponse ; fiche figée après l'envoi.

1. **Le besoin** (cadre) : « Arrivée au quai au plus tard le » [date] à [heure] · « Budget maximum (€ HT) » [nombre] · « Pour
   départager les offres qui tiennent la date » [liste : le prix le plus bas · le moins de CO₂ · l'arrivée la plus tôt].
2. **Les offres reçues** : pour chaque offre (ordre tiré), une ligne : « Dans la liste référencée ? » [oui/non] · « Arrivée au
   quai » [date + heure] · « Tient la date ? » [oui/non] · « Prix total » [nombre, €] · « CO₂ » [nombre, kg].
   Encadré (3 lignes) : « Une offre hors liste ne peut pas être commandée. / Une offre qui arrive après la limite est écartée. /
   Entre celles qui restent, applique le critère du cahier des charges. »
3. **Ma décision** : « Je retiens » [liste des offres] · « Ma justification » [choix parmi 3 phrases, ordre tiré] :
   - juste : « Les offres restantes tiennent toutes la date ; je retiens celle qui émet le moins de CO₂. »
   - pièges : « Je retiens l'offre la moins chère, pour respecter le budget. » · « Je retiens l'offre qui arrive le plus tôt, pour
     avoir de la marge. »
4. Envoi : « Envoyer mon choix à Claire ».

**Construction proposée avec les blocs existants** (à confirmer par l'état des lieux, §7 n° 2) : `cadre` + `date` + `heure` + `nombre`
+ `liste` pour le besoin ; **bloc `grille`** (D-10) pour le tableau des offres (une ligne par offre, `lignes(db)` d'après le tirage,
colonnes Arrivée / Prix / CO₂ en saisie, sans formule) ; bloc **`ouinon`** (`lignes` = les offres, `colonnes` = « Dans la liste ? »,
« Tient la date ? ») ; `liste` pour l'offre retenue ; `choix` pour la justification. Le tableau unique de la maquette (oui/non et
saisies sur la même ligne, ligne qui se grise quand elle est écartée) serait plus lisible : **demande facultative** au moteur (§7 n° 2),
à ne faire que si Tristan la juge nécessaire après avoir vu la version en blocs.

**Suite (déclencheur `apresFiche`, juste ou faux, neutre)** — Claire reprend ce que l'élève a écrit, sans corriger (règle du 10/10) :
« Merci {prénom}. Je note : {offre retenue}, {prix} €, {CO₂} kg. Je regarde et je te dis demain qui on commande. Claire »
(La commande elle-même est l'objet d'ENT-7.2.)

**Pour réfléchir** (bilan, réponse libre non notée, texte par `selon`) : « {offreRetard} arrivait trop tard. Si la mise en rayon était une
semaine plus tard, laquelle choisirais-tu, et pourquoi ? »

Mots cliquables (`lexique`) : conteneur, 40 pieds high cube (40' HC), scellé, terminal, barge, rupture de charge, cahier des charges,
prestataire référencé, devis, information CO₂, dédouané, mise à disposition.

### Ergonomie

- 1366 × 768 et 1280 × 720 : **aucun défilement de page** sur le comparateur, bouton d'envoi toujours visible ; si le tableau des
  offres ne tient pas avec 6 lignes (confirmé : socle 4 + 2 bonus), le tableau défile **dans son cadre**, pas la page.
- Agencement documents à gauche / fiche à droite, `largeurDocs` ≈ 0,9 (un devis se lit sans loupe), `serree: true`.
- Dates et heures : un calendrier et une heure (blocs `date` et `heure`), jamais un texte libre.
- Entrée n'envoie pas la fiche. Tab suit l'ordre de lecture.

## 4 bis. Questions au fil — PROPOSITIONS (règle du 10/10/2026, à trancher par Tristan)

Tristan en garde 2 à 4. Une seule à la fois. Les personnes : **Claire** (tutrice) ; éventuellement **Karim**, le chef de quai, à
renommer (§11 n° 6).

| # | Geste (écran, case) | Qui pose | Question proposée | Type | Notée / réflexion | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| 1 | Comparateur : saisie du CO₂ de la **route** (`fiche:cmp:offres` à la sortie de la case) | Claire | « Ce chiffre de {co2Route} kg, le transporteur était-il obligé de te le donner ? » — **juste** : « Oui : la loi l'oblige à informer son client du CO₂ de la prestation. » · pièges : « Non, c'est un geste commercial. » · « Oui, mais seulement pour un transport en avion. » · « Non, seulement à partir de 2030. » | fil | notée | tout de suite | **éco-droit appliqué au cas**, texte L. 1431-3 en document joint ; ancrée sur **son** chiffre ; ne souffle aucun jalon |
| 2 | Comparateur : réponse « Tient la date ? » de l'offre **en retard tirée** (`fiche:cmp:tri:<offre en retard>`, texte par `selon`) | Claire | « {offreRetard} arrive le {arriveeRetard}. Si le conteneur arrive après jeudi 14 h, qu'est-ce qui se passe pour les magasins ? » — **juste** : « Les produits du printemps manquent en rayon au lancement. » · pièges : « Rien, l'entrepôt le range plus tard. » · « Le transporteur paie le retard, donc ce n'est pas grave. » · « Le conteneur repart à Anvers. » | fil | notée | **au bilan** | donnerait d'avance le jalon « écarter l'offre hors délai » : corrigée au bilan |
| 3 | Comparateur : réponse « Dans la liste ? » de l'offre **hors liste** (`fiche:cmp:tri:<pièce tirée>`) | Claire | « {horsListe} propose {prixHorsListe} €, c'est {ecart} € de moins. Pourquoi Decathlon ne commande-t-il qu'aux prestataires de sa liste ? » — **juste** : « Il a vérifié leur contrat, leur assurance et leur sécurité. » · pièges : « Parce qu'ils sont toujours les moins chers. » · « Parce que la loi interdit les autres transporteurs. » · « Parce qu'ils sont tous français. » | fil | notée | **au bilan** | ancrée sur **sa** pièce tirée ; donnerait le jalon « écarter le hors-liste » : au bilan |
| 4 | Comparateur : saisie du CO₂ de la **barge** | Claire | « Ta barge émet {co2Barge} kg pour {kmBarge} km, la route {co2Route} kg pour 165 km. Pourquoi la barge émet-elle moins en faisant plus de kilomètres ? » — **juste** : « Une barge porte des dizaines de conteneurs : chacun émet moins par kilomètre. » · pièges : « La barge roule à l'électricité. » · « Les kilomètres sur l'eau ne comptent pas. » · « La barge va plus vite. » | fil | notée | au bilan | ancrée sur **ses** saisies ; souffle un peu la décision (le moins de CO₂) : au bilan par prudence |
| 5 | Envoi du comparateur (`fiche:cmp:envoyer`) — **point d'étape** avant la réponse de Claire | Claire | « Tu as retenu {offreRetenue}. Claire doit l'expliquer à son directeur, qui demande pourquoi on ne prend pas la moins chère. Que lui répond-elle ? » — **juste** : « La date passe d'abord ; parmi les offres qui la tiennent, le cahier des charges demande le moins de CO₂. » · pièges : « La moins chère n'est jamais fiable. » · « Le budget n'a pas d'importance chez Decathlon. » | transition | réflexion | au bilan | reprend la justification sans la noter deux fois |

Proposition Cowork : garder **1, 2 et 3** (notées, part 3 points), 4 en réserve, 5 en réflexion.

## 4 ter. Avant de commencer — banque (à valider par Tristan)

`ouverture.tirage: { rappel: 1, preparation: 2, droit: 2 }` (5 questions par élève, ≈ 5 min). Non notées, sans le dire. `cle: true`
(★) = à reprendre en évaluation ENT-7.4.

⚠ **Rappel de la 2de (décision 13)** : les élèves de 1re de 2026-2027 **n'ont pas joué Decathlon en 2de** (la série de 2de n'est pas
cadrée). Les questions de rappel sont donc écrites pour marcher **dans les deux cas** : le texte de gauche donne l'information
(« Decathlon, c'est… »), la question la fait lire. Les années suivantes, on pourra les rendre plus courtes.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| r1 | rappel | « À quoi sert l'entrepôt Decathlon de Rouvignies ? » | « Il approvisionne les magasins Decathlon d'Europe du Nord. » | « Il fabrique les vélos de la marque. » · « Il livre directement les clients qui commandent sur Internet. » | Fiche « Decathlon en bref » (Rouvignies : Nord, au bord de l'Escaut, près de Valenciennes ; magasins d'Europe du Nord ; chiffres 2012 datés) | |
| r2 | rappel | « D'où viennent les chaussures de randonnée de ton conteneur, et comment arrivent-elles en Europe ? » | « Du Vietnam, par porte-conteneurs jusqu'à un grand port européen. » | « De Chine, par avion jusqu'à Lille. » · « De France : elles sont fabriquées à Rouvignies. » | même fiche (Vietnam : sources DHL, Maersk) | |
| p1 | preparation | « Un conteneur “40 pieds high cube”, c'est… » | « une boîte de 12 m de long, plus haute qu'un conteneur standard » | « un camion de 40 tonnes » · « une barge de 40 conteneurs » | Avis de mise à disposition (la ligne « Type ») + mot cliquable | ★ |
| p2 | preparation | « Ton conteneur est “dédouané à Anvers”. Qu'est-ce que ça change pour la suite du trajet ? » | « Il circule librement jusqu'en France, sans nouveau passage en douane. » | « Il doit repasser la douane à la frontière française. » · « Il ne peut voyager qu'en Belgique. » | Cahier des charges (ligne « Situation ») | ★ |
| p3 | preparation | « L'offre “barge + camion” : pourquoi un camion ? » | « La barge s'arrête au terminal fluvial ; il faut finir les derniers kilomètres jusqu'au quai. » | « Le camion tire la barge. » · « Le camion transporte les papiers du conteneur. » | Carte des itinéraires (encart des derniers kilomètres) | |
| p4 | preparation | « Une liste de prestataires référencés, c'est… » | « la liste des transporteurs avec qui l'entreprise a le droit de travailler, après vérification » | « la liste des transporteurs les moins chers du moment » · « l'annuaire de tous les transporteurs de Belgique » | Liste référencée (son en-tête) | ★ |
| p5 | preparation | « Combien de fois le conteneur change-t-il de moyen de transport avec l'offre barge ? » | « Une fois : de la barge au camion, au terminal de Bruay. » | « Aucune. » · « Trois fois. » | Carte | |
| d1 | droit | « Sur les devis, où trouves-tu le CO₂ émis par chaque transport ? » | « Sur chaque devis : la ligne “Information CO₂ de la prestation”. » | « Nulle part : c'est à Decathlon de le calculer seul. » · « Sur l'avis de mise à disposition. » | Texte de l'art. L. 1431-3 + un devis | ★ |
| d2 | droit | « Contargo transporte le conteneur de Decathlon. Qui doit informer qui du CO₂ émis ? » | « Contargo informe Decathlon, son client. » | « Decathlon informe Contargo. » · « Le port d'Anvers informe les deux. » · « Personne : ce n'est pas obligatoire. » | Texte de l'art. L. 1431-3 | ★ |
| d3 | droit | « Decathlon vise −20 % d'émissions du transport. Est-ce une obligation de la loi ? » | « Non : c'est un engagement de l'entreprise ; la loi oblige seulement à informer du CO₂. » | « Oui : la loi impose −20 % à toutes les entreprises. » · « Oui, mais seulement aux transporteurs. » | Texte L. 1431-3 + extrait de la page « Décarboner le transport » de Decathlon | |
| d4 | droit | « Le devis dit “méthode réglementaire”. Qui fixe la façon de calculer ce CO₂ ? » | « Des articles du Code des transports (partie réglementaire). » | « Chaque transporteur, comme il veut. » · « Decathlon, dans son cahier des charges. » | Page du ministère (articles D. 1431-1 à D. 1431-23) | |

## 5. Jalons / notation (sur 20)

Rien de vrai avant l'envoi du comparateur ; **inaction = 0 / 20** (une fiche ne part pas incomplète).

**Poids validés par Tristan le 13/10/2026 (décision 14)** — Lire le besoin 4 · Trier la liste 7 (hors-liste 3, hors délai 4) ·
Comparer 5 · Décider 4 (choix 2, justification 2).

⚠ **À trancher (§11 n° 2)** : ces poids font 20 **sans** les questions au fil, alors que la règle du 07/10 leur donne 3 à 5 points sur
20. Deux options :
- **(a) Garder les poids validés** ; les questions au fil passent toutes en « réflexion » (non notées).
- **(b) Part des questions = 3** prise sur les jalons, proposition : Lire le besoin **3** (−1) · Trier 7 · Comparer **4** (−1) · Décider
  **3** (choix 2, justification **1**) · questions au fil **3** (n° 1, 2, 3 à 1 point chacune). Recommandée par Cowork : le tri reste
  le cœur, la lecture et la forme cèdent un point chacune.

| # | Groupe | Jalon | Poids (validé) | Ce qu'il lit | Piège qui le fait tomber |
|---|---|---|---|---|---|
| 1 | Lire le besoin | Date limite **et** heure justes | 2 | fiche `cmp`, `limite` | 27/01 ; 28/01 sans l'heure ; heure de disponibilité recopiée |
| 2 | Lire le besoin | Budget 900 **et** critère « le moins de CO₂ » | 2 | `budget`, `critere` | critère « prix » (la moins chère) |
| 3 | Trier la liste | Offre hors liste marquée « non », les 3 référencées « oui » | 3 | `tri.<offre>.liste` | hors-liste laissé « oui » parce que moins cher et moins émetteur |
| 4 | Trier la liste | **Offre en retard tirée** (rail ou barge) marquée « ne tient pas la date », les deux autres « tient » | 4 | `tri.<offre>.date` | offre en retard laissée « oui » (vendredi lu jeudi) ; une offre à l'heure marquée « non » |
| 5 | Comparer | Prix **et** CO₂ reportés justes pour les offres **restantes** (la route et celle des deux autres qui est à l'heure) | 5 | grille `offres` | inversion prix / CO₂ ; CO₂ d'un autre devis |
| 6 | Décider | Offre retenue = **la moins émettrice des offres référencées à l'heure** : la barge (tirage `rt-rail`) ou le rail (tirage `rt-barge`), **calculée** | 2 | `retenue` | la route (la moins chère des référencées) ; le hors-liste ; « la barge » soufflée par un voisin qui n'a pas le même tirage |
| 7 | Décider | Justification « date puis CO₂ » | 2 | `justif` | « la moins chère » ; « la plus tôt » |

Remarques :
- **Les dates d'arrivée reportées ne sont pas jugées** : une date mal lue se paie déjà au jalon 4 (une erreur ne se paie qu'une fois).
- Jalon 5 ne lit **que** les offres restantes au réel : un élève qui a laissé l'offre en retard ne perd pas le jalon 5 pour l'avoir
  mal reportée.
- Jalon 6 jugé **sur le réel** (c'est la décision qui part chez Claire), même si l'élève a mal trié : assumé, comme 6.9 et 6.10
  (§11 n° 3).
- Répartition interne des groupes (1 = 2 + 2, etc.) : proposition Cowork, le total par groupe est celui validé.
- Bandeau de fin : par groupe, jamais la case, jamais la réponse ; un groupe faux se corrige à l'écran `fiche:cmp`.

**Bonus du confirmé** (`bonus: true`, +0,5 par cas, plafond +2) : un jalon par offre bonus reçue (§6 bis), vrai si elle est écartée
pour la bonne raison (« non » dans la bonne colonne). `null` si l'élève n'a pas reçu le cas.

## 6. Contenu (données)

Fichiers : `contenus/decathlon.js` (univers : Claire, Rouvignies, Dourges, la liste référencée, les itinéraires, les facteurs
d'émission, le lexique — **partagé par 7.1 à 7.4, à lire, jamais à redéclarer**) ; `contenus/decathlon-ent71.js` (messages,
documents, fiche, jalons, `TIRAGE`, `SOLUTION`) ; `contenus/questions/ENT-7.1.js` ; `contenus/corriges/ENT-7.1.js`.
Valeurs **calculées par le code** (CO₂, chiffre de contrôle, attendus) ; dans les tests, écrites à la main.

### 6.1 La liste référencée (univers, construite)

| Prestataire | Mode | Ce qu'il assure | Adresse de commande |
|---|---|---|---|
| **Routiers du Hainaut** (fictif) | Route | Anvers → entrepôts du Nord, porte à porte | `affretement@routiers-hainaut.example` |
| **Contargo** (réel, données construites) | Barge + camion | Anvers → terminal de Bruay-sur-l'Escaut (et Dourges), camion final compris | `booking@contargo.example` |
| **Rail Flandres-Artois** (fictif ; « Rail Fret Benelux » renommé le 13/10/2026, trop proche de noms réels) | Rail + camion | Anvers → terminal de Dourges, camion final compris | `commandes@railfret-benelux.example` |

Pied : « Un prestataire absent de cette liste ne peut pas recevoir de commande, même moins cher. — Document reconstitué. Contargo
est un opérateur réel ; les autres prestataires sont fictifs. »

### 6.2 CO₂ : calculé, jamais écrit à la main

**Décision 21 (Tristan, 13/10/2026)** : en 7.3, le rail émet **plus que la barge et moins que la route**. **Méthode proposée par
Cowork pour la tenir dans toute la série (à valider, §11 n° 5)** :
`CO₂ (kg) = arrondi( Σ poids du conteneur (t) × distance du tronçon (km) × facteur du mode )`, facteurs (kg CO₂ par tonne-km) :
camion **0,051** (vérifié, ADEME) · barge **0,020** (construit) · rail **0,0165** (construit). Le camion final se compte au facteur
camion. Conséquence voulue et stable pour tout poids de 13,5 à 15,8 t : **vers Rouvignies, barge < rail < route** (le rail perd à cause
de ses 48 km de camion) ; **vers Dourges (7.4), rail < barge < route**. Cette méthode réalise la décision 21 **sans contredire 7.1** ; il change le CO₂ du rail de la maquette (61 kg → 78 kg).

### 6.3 La pièce fixe : le conteneur et ses trois offres référencées

| Donnée | Valeur de référence (élève « témoin » des tests) | Tirée ? |
|---|---|---|
| Conteneur | **PLGU 418207 5**, 40' HC (préfixe construit ; **vérifier qu'il n'est pas attribué au registre BIC**, sinon en choisir un autre ; chiffre de contrôle ISO 6346 **calculé**) | n° tiré dans une banque de 6 numéros, chiffre calculé |
| Scellé | DC 0 771 342 | tiré |
| Poids brut | 14 620 kg | tiré, 13 500 à 15 800 kg, pas de 10 |
| Contenu | collection printemps : textile et chaussures de running et de randonnée (Vietnam) | fixe |
| Disponible au terminal | **mardi 26/01/2027** | fixe |
| Limite au quai | **jeudi 28/01/2027 à 14 h** | fixe |
| Budget | 900 € HT, tout compris | fixe |
| Référence Decathlon | PO-ROU-2027-0381 | fixe |

| Offre | Arrivée au quai | Prix (référence) | Prix tiré | CO₂ (14,62 t) | Tient ? |
|---|---|---|---|---|---|
| Routiers du Hainaut (route) | mer. 27/01 · 11 h (enlèvement 7 h) | 690 € | 660 – 720 € | **123 kg** | oui |
| Contargo (barge + camion) | **tirage `rt-rail`** : mer. 27/01 · 16 h (barge mar. 26/01 au soir → Bruay mer. 27/01 matin → camion 6 km) ; **tirage `rt-barge`** : ven. 29/01 · 9 h (« barge du 26/01 complète, prochain départ jeu. 28/01 ») | 760 € (fret 470 + manutention 110 + camion 180) | 730 – 790 € | **67 kg** | `rt-rail` : oui → **bonne réponse** ; `rt-barge` : **non** |
| Rail Flandres-Artois (rail + camion) | **tirage `rt-rail`** : ven. 29/01 · 10 h (départ hebdomadaire jeu. 28/01 → Dourges ven. 29/01 → camion 48 km) ; **tirage `rt-barge`** : mer. 27/01 · 15 h (départ mar. 26/01 → Dourges mer. 27/01 → camion 48 km) | 800 € | 770 – 830 € | **78 kg** | `rt-rail` : **non** ; `rt-barge` : oui → **bonne réponse** |

*(Dates recalées sur la disponibilité du 26/01 : barge en ≈ 1 jour et demi d'Anvers à Bruay, construit. Si Tristan préfère des délais
de barge plus longs, avancer la disponibilité, jamais la limite.)*

### 6.4 Devis (documents, un par offre)

En-tête du prestataire, « DEVIS n° … pour Decathlon », lignes : Trajet · Mode · Déroulé · Arrivée au quai · Prix total HT · **ligne
« Information CO₂ de la prestation : {co2} kg de CO₂ »** (encadrée, comme la maquette) · pied « Devis reconstitué — document
pédagogique Prepalog ». Cahier des charges et avis de mise à disposition : ceux de la maquette, dates recalées, pied de reconstitution.

## 6 bis. Tirage et niveaux

- **Pièce fixe** : le conteneur et ses trois offres référencées (structure fixe ; valeurs tirées : n°, scellé, poids, prix dans les
  bornes du §6.3 ; CO₂ calculé sur le poids tiré).
- **Banque `retard`** (décision 22 : contre la copie ; une pièce au socle, `melange: { moyen: 1 }`) — quelle offre référencée
  arrive trop tard :
  - `rt-rail` : le rail arrive ven. 29/01 → bonne réponse **la barge** ;
  - `rt-barge` : la barge du 26/01 est complète, la suivante arrive ven. 29/01 ; le rail part mar. 26/01 et arrive mer. 27/01 · 15 h →
    bonne réponse **le rail** (78 kg < route 123 kg).
  Même difficulté : une offre en retard, puis deux offres à départager par le CO₂. La route est toujours à l'heure et toujours la moins
  chère des référencées (le piège « la moins chère » reste le même pour tous). **Toutes les valeurs attendues (offre en retard, offres
  restantes, bonne réponse) sont calculées d'après la pièce tirée**, jamais écrites en dur.
- **Banque `horsListe`** (une pièce au socle, `melange: { difficile: 1 }`) — toutes **moins chères que les trois référencées, à
  l'heure, et moins émettrices que la bonne réponse de l'élève** (sinon le critère CO₂ les écarterait sans lire la liste) :
  - `hl-eflux` « E-Flux Logistique », route en camion électrique, 590 €, CO₂ 18 kg, mer. 27/01 · 10 h ;
  - `hl-bateliers` « Bateliers du Nord », barge, 640 €, CO₂ = bonne réponse − 6 kg, mer. 27/01 · 17 h ;
  - `hl-railco` « RailCo Express », rail direct, 610 €, CO₂ = bonne réponse − 4 kg, mer. 27/01 · 15 h ;
  - `hl-eclair` « Fret Éclair », route, 540 €, CO₂ = route + 8 kg — **`facile`**, gardée pour une banque future, non tirée au socle.
  *(Noms fictifs : vérifier par recherche web qu'aucun n'est un transporteur réel avant de construire.)*
- **Banque `bonus`** (confirmé : `bonus: { confirme: { difficile: 2 } }`) :
  - `bo-heure` « Routiers du Hainaut — offre express » : **référencé**, arrive **jeu. 28/01 à 16 h** → ne tient pas (l'heure compte) ;
  - `bo-homonyme` « Routiers du Haynaut » (orthographe voisine, adresse différente) : **hors liste** ;
  - `bo-suivant` « {bonne réponse} — départ suivant » : référencé, arrive **lun. 01/02** → ne tient pas.
- **Contrôle d'équité** (`verifier`) : barge < rail < route en CO₂ ; exactement une offre référencée en retard, la route jamais ;
  hors-liste moins émetteur que la bonne réponse ; pièce hors liste moins chère que les trois référencées ; prix
  référencés ≤ budget − 50 ; aucune égalité de prix ni de CO₂ entre deux offres.
- **Consigne neutre** : « les devis reçus », jamais leur nombre.
- **Accompagné** : contenu standard (non conçu). Piste Cowork : sous chaque colonne du comparateur, une phrase d'aide (« Lis la ligne
  “Arrivée au quai” du devis »).
- Évaluation : sans objet (séance de guidage).

## 7. Demandes au moteur — état des lieux d'abord, en lecture seule

1. **Carte** (§4, étape 2) : option (A) document `image` + loupe (existe, D-10) → **rien à faire au moteur**, Cowork fournit
   `contenus/images/decathlon/carte-anvers-rouvignies.svg` (et la variante Dourges pour 7.4). Option (B) carte interactive régionale :
   **chantier moteur à part** (brief `MOTEUR-carte-regionale.md` à écrire par Cowork si Tristan choisit B) : générateur
   `outils/carte/construire.py` étendu (côtes, frontières, Escaut, canaux, grands axes, ≈ 120 × 130 km), itinéraires cliquables
   distingués par la forme, encart, marque d'aléa (7.3). Aucune requête hors du domaine ; mention « © contributeurs OpenStreetMap » si
   les tracés en viennent.
2. **Comparateur** : vérifier qu'une fiche peut porter, dans cet ordre et sans défilement à 1280 × 720, un `cadre` (date, heure,
   nombre, liste), un bloc `grille` à lignes tirées (`lignes(db)`, saisies sans formule, texte « 16 h » accepté ou `heure` séparée), un
   `ouinon` à lignes tirées et deux `liste`/`choix`. Si `ouinon` ne prend pas `lignes(db)`, **le dire** (c'est la seule pièce qui
   dépend du tirage). **Demande facultative** : un bloc « tableau d'offres » (oui/non et saisies sur une même ligne) — seulement si
   Tristan le demande après avoir vu la version en blocs.
3. **Gestes publiés** pour les questions au fil : `fiche:cmp:<bloc>:<ligne>` sur `ouinon` (existe) et la sortie d'une case de la
   grille (`fiche:cmp:offres` existe ; **par cellule** ? sinon la question n° 1 arrive à la première case remplie : le dire).
4. **Teinte bleue de la charte** dans la zone de travail (§2) : vérifier ce que fait le moteur.

## 7 bis. Séance déjà jouée ?

Non (séance nouvelle).

## 8. Tests attendus

Bloc `decathlon` (fichier `outils/test/decathlon.mjs`, une ligne dans `BLOCS` et dans `GROUPES` de `outils/test.mjs`, groupe le plus
léger ; **dire à Tristan que `outils/test.mjs` est touché**). Cas « ENT-7.1 » :
- **Données écrites à la main** : chiffre de contrôle de PLGU 418207 → 5 ; CO₂ à 14,62 t → route 123, barge 67, rail 78 ; vers Dourges
  à 13,95 t → route 107, barge 82, rail 49.
- **Deux élèves témoins**, un par pièce de la banque `retard` (`rt-rail` → barge ; `rt-barge` → rail), écrits à la main.
- **Parcours juste** de chaque témoin = 20 / 20 ; **le parcours juste de l'un, joué par l'autre, ne fait pas 20** (contre la copie) ; **inaction** = 0 ; fiche incomplète refusée (travail gardé).
- **Pièges** : critère « prix » → 2 faux ; hors-liste « oui » → 3 faux ; offre en retard « tient » → 4 faux ; CO₂ de la barge recopié
  sur la ligne route → 5 faux ; route retenue → 6 faux ; témoin `rt-barge` qui retient la barge → 6 faux ; justification « la moins chère » → 7 faux.
- **Une erreur ne se paie qu'une fois** : offre en retard mal reportée (prix faux) mais bien écartée → 5 vrai.
- **Répartition** : sur 200 graines, chaque pièce de `retard` tirée entre 40 % et 60 % des fois.
- **Tirage** : deux élèves → n° de conteneur et pièce hors liste différents ; contrôle d'équité sur 200 graines ; banques inscrites dans
  `BANQUES_FIGEES` ; confirmé → 2 offres de plus, bonus jugés ; standard → `null`.
- **Ouverture** : 5 questions tirées (1 + 2 + 2), banque ≥ double par rubrique.
- **Ergonomie** : 1366 × 768 et 1280 × 720, aucun défilement de page, bouton d'envoi visible, 6 lignes d'offres (confirmé).
- **Charte** : aucun aplat vert ni bleu dans la zone de travail.
- **Sabotages** : écrire « barge » en dur comme bonne réponse → le témoin `rt-barge` doit tomber ; juger le jalon 5 sur toutes les offres → le cas « erreur payée une fois » doit tomber ; message de Claire qui dit
  « juste » → test de neutralité ; CO₂ écrit en dur dans un devis → le test « poids tiré » doit tomber.

## 9. Supports

- Trame courte (Cowork, **après validation à l'écran**) : lexique ; le comparateur vierge ; encadré « date d'abord, CO₂ ensuite » ;
  ce qui est vérifié / construit ; l'article L. 1431-3.
- Corrigé `contenus/corriges/ENT-7.1.js` : `corrigeEleve(base)` (ses valeurs tirées, ses offres, l'attendu).
- Pour réfléchir (semaine) : « La loi oblige à **informer** du CO₂, pas à le réduire. Qui pousse alors Decathlon à choisir la barge ? »

## 10. Critères de validation par Tristan

À l'écran (1366 × 768, puis vidéoprojecteur, impression noir et blanc de la carte) : on distingue les trois itinéraires sans couleur ;
on trouve chaque chiffre dans un devis sans chercher ; le comparateur tient sans défiler ; un élève qui prend « la moins chère » le voit
au bilan sans qu'on lui donne la réponse ; 45 min tenues.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

1. [x] Carte : **(B) carte interactive** (Tristan, 13/10/2026). → chantier moteur `MOTEUR-carte-regionale.md` **avant** la séance.
2. [x] **(b)** part 3 : Lire le besoin 3 · Trier 7 · Comparer 4 · Décider 3 (choix 2, justification 1) · questions 3 (Tristan, 13/10/2026).
3. [x] Jalon 6 jugé sur le réel : oui.
4. [x] Dates recalées (disponible mar. 26/01, séance lun. 25/01, barge à quai mer. 27/01 16 h) ? (oui)
5. [x] Facteurs barge 0,020 et rail 0,0165 (construits) et CO₂ du rail porté à 78 kg en 7.1 (méthode du §6.2) ? (oui)
6. [ ] Chef de quai « **Karim** Benali » : France Boissons a déjà un Karim (tuteur de 2de). Le renommer pour éviter la confusion ?
   (oui, ex. « Mehdi Benali »)
7. [x] Questions au fil : **1, 2, 3** notées (1 point chacune) ; 4 en réserve ; 5 en réflexion (Tristan, 13/10/2026).
8. [x] Banque « Avant de commencer » : les 11 questions, tirage 1 + 2 + 2.
9. [x] Contre la copie : offre en retard tirée par élève, bonne réponse barge ou rail (Tristan, 13/10/2026, décision 22).
10. [ ] Préfixe PLGU : à vérifier au registre BIC avant construction (Cowork ou Claude Code par recherche web).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `contenus/decathlon.js` (univers des séances 7.x : identité, charte, Claire, liste référencée, facteurs et calcul du
  CO₂ sur les km de la carte, chiffre de contrôle ISO 6346, lexique, documents communs « Decathlon en bref », « Le droit (CO₂) », « Les itinéraires ») ;
  `contenus/decathlon-ent71-donnees.js` (données pures : cahier des charges, banques, tirage, jeu de l'élève, contrôle d'équité) ;
  `contenus/decathlon-ent71.js` (documents, fiche « Comparateur d'offres », messages de Claire, jalons, pastilles, carte, accueil) ;
  `contenus/questions/ENT-7.1.js` ; `contenus/corriges/ENT-7.1.js` (corrigé par élève) ; `activites/decathlon-choix-transporteur.js` ;
  `activites/index.js` (la séance, et l'entreprise n° 7 dans `ENTREPRISES`) ; `contenus/trames/logos/decathlon-texte.svg` (le nom en texte, pas le
  logo officiel) ; **moteur** : `core/types/fiche.js` et `styles/base.css` (option de fiche `defile`, choix de Tristan), `activites/FICHE-SEANCE.md` ;
  **tests** : `outils/test/decathlon.mjs` (nouveau bloc, 15 cas), `outils/test.mjs` (**touché** : `decathlon` dans `BLOCS` et dans le groupe 4),
  `outils/test/tirage-niveaux.mjs` (banques dans `BANQUES_FIGEES` ; **cas existant réécrit** : l'onglet « Niveaux » a une colonne Decathlon, et le
  nombre de cases se compte par colonne au lieu d'un 3 écrit en dur).
- **Écarts par rapport au brief** (et pourquoi) :
  - **Distances** : celles de la carte construite le 13/10 (route 168 km ; barge 194 + camion 13 ; rail 162 + camion 46), pas les provisoires du brief.
    CO₂ à 14,62 t : route **125**, barge **66**, rail **73** kg (le brief : 123 / 67 / 78) ; vers Dourges à 13,95 t : 109 / 76 / 39 (le brief : 107 / 82 / 49).
    L'ordre voulu tient (barge < rail < route vers Rouvignies ; rail < barge < route vers Dourges).
  - **Préfixe du conteneur : PRPU au lieu de PLGU.** PLGU est attribué au registre BIC (Gulbrandsen Companies, États-Unis) ; PRPU y est libre
    (« No code found », bic-code.org, 13/10/2026). Témoin : PRPU 418207 **2** (chiffre de contrôle calculé ; PLGU 418207 → 5 reste vrai et testé).
  - **Question au fil n° 1 (CO₂ obligatoire) : la bonne réponse change — À VALIDER.** L'article L1431-3 (version en vigueur depuis le 01/01/2025, lu
    sur Légifrance le 13/10/2026) a un 3e alinéa : pour un transport dont l'origine ou la destination est hors de France, l'obligation est renvoyée à
    plus tard ; la page du ministère dit que l'obligation vaut pour un départ et une arrivée en France. Anvers est en Belgique : « Oui, la loi
    l'oblige » serait faux pour ce trajet. Juste : « Ici, c'est notre cahier des charges qui l'exige : la loi ne vise pas encore un transport parti de
    l'étranger » (piège ajouté : « la loi l'impose même parti de Belgique »). Le cahier des charges exige le CO₂ sur chaque devis. **d2** reformulée
    sur un trajet Lille → Rouvignies. Le document « Le droit » cite les alinéas 1 à 3 mot pour mot (le 4e, l'amende, résumé).
  - **Pas de colonne « Arrivée au quai » dans le tableau ③** : jamais jugée (brief §5), elle demandait une saisie de date en texte libre (contraire à
    la règle d'ergonomie du brief) et de la hauteur ; l'élève lit l'arrivée dans le devis pour répondre « Tient la date ? ».
  - **Comparateur en blocs** : cadre ① (date, heure, budget, critère), tableau oui / non ② (deux colonnes), encadré, feuille ③ (prix, CO₂), cadre ④
    (offre, justification). Il ne tenait pas sur l'écran (≈ 1 460 px pour ≈ 610) : **petit chantier moteur décidé par Tristan**, option de fiche
    `defile: true` (la fiche défile dans sa colonne, les documents dans la leur, le bouton d'envoi reste visible ; page 710 px à 1280 × 720).
  - **Les documents** : un onglet par devis, « Devis A » à « Devis F » dans l'ordre de l'élève (le moteur n'a pas « ‹ Précédent / Suivant › » dans
    une fiche) ; huit onglets pour un confirmé, sur deux lignes.
  - **Offre bonus « express »** devenue « Routiers du Hainaut (2e devis) », enlèvement jeudi midi, arrivée jeudi 16 h : un express qui arrive après
    l'offre ordinaire n'était pas crédible. Le piège est le même (« jeudi », mais 16 h).
  - **Question n° 5 (le directeur)** : réflexion au fil à l'envoi, corrigée au bilan, et non un point d'étape (après l'envoi, rien à garder fermé).
  - **Compétence** : `C2.6` (la liste du site n'a pas les sous-niveaux C2.6.1).
  - **Avis de mise à disposition** : émis par « Port d'Anvers — terminal à conteneurs », sans nom d'exploitant (pas de faux document d'une entreprise réelle).
- **Décisions prises en route** : parcours strict et règle du premier bilan (`parcours`, `correction`), comme ENT-6.1 ; l'ordre des offres est tiré
  par élève (graine), les cas bonus en fin de tableau ; les questions n° 2 et 3 arrivent quand l'élève a répondu dans SA colonne pour SON offre
  (« tient la date ? » de l'offre en retard, « dans la liste ? » de l'offre hors liste) ; la n° 1 quand SA case CO₂ de la route est remplie (le geste de
  la feuille est publié pour toute case : la condition lit la case) ; Claire reprend l'offre retenue et les chiffres que l'élève a reportés pour elle.
- **Vérifié sur le web le 13/10/2026** : article L1431-3 (Légifrance, version 2025) ; préfixes PLGU (attribué) et PRPU (libre) au registre BIC ; bleu
  de la marque **#3643BA** (couleur « brand » du site decathlon.fr). Noms fictifs : « Routiers du Hainaut / Haynaut », « E-Flux Logistique »,
  « Bateliers du Nord », « RailCo Express » : rien trouvé ; **« Rail Fret Benelux »** : pas d'entreprise de ce nom, mais des noms proches existent
  (Crossrail Benelux Fret, Rail Cargo Carrier Benelux, liste belge des entreprises ferroviaires) : **renommé « Rail Flandres-Artois »** (Tristan,
  13/10/2026 ; rien trouvé sous ce nom) ; **« Fret Éclair »** : une entreprise de ce nom
  existerait dans l'Allier (annuaire tiers) — pièce gardée, non tirée.
- **Tests** : bloc `decathlon` 15/15 ; suite complète (voir le commit). Sabotages faits (chacun fait tomber le bon cas) : bonne réponse « barge » en
  dur (3 cas), jalon « comparer » sur toutes les offres (1), Claire qui dit « juste » (2), CO₂ écrit en dur dans un devis (1), fiche sans `defile`
  (2, les deux tailles d'écran), offre hors liste plus émettrice que la bonne réponse (le contrôle d'équité, 1).
- **Commits** : voir `git log` (séance, moteur, tests, ce compte rendu).
- **Reste ouvert** (à Tristan) :
  1. ~~Question n° 1~~ : validée par Tristan le 13/10/2026.
  2. **Charte** : le moteur ne neutralise que le rouge et le vert ; le bleu Decathlon reste dans la zone de travail (bouton « Envoyer », onglets,
     cases cochées : comme Picard). Sur la carte, seul l'entrepôt est bleu (#1f5fa8, fixe). **Gardé** (Tristan, 13/10/2026).
  3. Logo : le nom en texte bleu ; le logo officiel seulement avec ton accord.
  4. ~~« Rail Fret Benelux »~~ : renommé « Rail Flandres-Artois » (Tristan, 13/10/2026).
  5. Trame courte (Cowork, après validation à l'écran) ; §11 n° 6 (Karim → Mehdi) reste pour 7.2.
