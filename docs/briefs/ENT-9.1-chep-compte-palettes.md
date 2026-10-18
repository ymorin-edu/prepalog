# Brief de séance — ENT-9.1 CHEP, le compte palettes des Endives du Ternois (1re, guidage C2.5)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/COORDINATION-chep.md puis docs/briefs/ENT-9.1-chep-compte-palettes.md en entier. Fais l'état des lieux du §7 en lecture seule, dis-moi ce qui contredit le brief, annonce la durée, puis construis la séance (univers contenus/chep.js compris).
> ```

**Statut** : à implémenter
**Date du brief** : 17/10/2026
**Conversation d'origine** : Cowork (Opus), 17/10/2026. **Décisions déléguées par Tristan** (seul le nombre de séances, 4, est de lui) :
tout ce qui suit a été tranché par Cowork, et les choix secondaires sont marqués **(Cowork)**. **À lire avec `COORDINATION-chep.md`**,
qui fait foi pour l'univers, le vocabulaire et les règles de calcul.
**Modèle** : **Opus** (séance nouvelle, univers nouveau). **Durée estimée** : ≈ 5 h. Le temps part dans l'univers, les documents tirés,
les deux fiches liées et les tests. Aucune vue nouvelle.
**Place dans l'ordre** : la première de la série. Elle peut se construire **tout de suite**, avant le chantier moteur.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-9.1 |
| `id` (jamais modifié ensuite) | `chep-compte-palettes` |
| Titre / desc | « CHEP — le compte palettes » / « Alternant au service relation clients du centre CHEP de Templemars : repérer les mouvements de palettes bleues dans les documents d'un client, préparer ses déclarations, calculer le solde de son compte et lui expliquer ce qu'il paie. » |
| Rubrique | simulog, **entreprise n° 9 CHEP** (une ligne dans `ENTREPRISES`, voir la coordination §6) |
| Niveau(x) | `niveaux: ['1re']` |
| Compétence(s) | `competences: ['C2.5']`, indicateurs « repérage des informations relatives au suivi » et « mise à jour de la base de données » |
| Temps pédagogique | `temps: 'guidage'` |
| Notation | jalons pondérés, note sur 20, coefficient 1 |
| Barème | `bareme: 20` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |
| Niveaux prévus | `niveauxPrevus: ['confirme']` |
| Autres | `parcours`, `correction` comme ENT-7.1 ; `questions: 'ENT-9.1'` ; `trame: 'chep-compte-palettes'` seulement quand la trame existe |

## 2. L'entreprise : ce qui est vérifié et ce qui est construit

Voir la **coordination §2**. Propre à cette séance :
- **Vérifié** : le principe du compte (l'émetteur reçoit les palettes ; la location court jusqu'au transfert, que l'**émetteur** déclare ; les
  palettes Europe s'échangent hors pool). Sources : Autorité de la concurrence 2009, §10, §29, §32. Les Hauts-de-France sont le principal
  bassin de l'endive, en campagne d'octobre à avril (DRAAF).
- **Construit** : Endives du Ternois, Hélène Caron, les plates-formes, les numéros de documents et de compte, les quantités, le prix de location
  (0,04 € HT par palette et par jour), le **portail clients** (son nom et sa présentation). Je n'ai pas vérifié l'interface réelle de CHEP :
  la fiche ne copie rien d'un vrai écran. Même chose pour le délai de déclaration du contrat (« au plus tard le jour ouvré suivant
  l'expédition », construit).
- **Documents reconstitués** : pied « Document reconstitué — document pédagogique Prepalog. CHEP est réel ; Endives du Ternois, ses clients et
  ces chiffres sont construits. »
- **Logo** : bandeau texte « CHEP » (pas de logo image sans accord).

## 3. Objectif pédagogique

L'élève sait **lire les documents d'une semaine d'expéditions** (bon d'émission, bordereaux de livraison, bon de retour, commande) et y
**repérer ce qui est un mouvement de palettes CHEP** : son type, son partenaire, le nombre de palettes **CHEP** (ni les palettes Europe, ni
celles d'un autre pool). Il sait aussi **tenir le compte** : entrées, sorties, solde calculé par une formule. Enfin, il sait **dire au client
ce que ce solde veut dire**, c'est-à-dire les palettes dont il paie la location chaque jour.
Premier temps de C2.5 ; ENT-9.2 porte la ramasse et le contrôle des retours, ENT-9.3 reprend tout avec une erreur induite.
Aucun cours préalable n'est supposé : « Avant de commencer » et les documents apportent le vocabulaire.

## 4. Déroulé (≈ 50 min)

**Date dans la séance : lundi 18/01/2027, 8 h 30.** L'élève : {prénom}, alternant(e) au service relation clients et flux du centre CHEP de
Templemars. Tutrice : **Sandrine Delattre** (tutoiement). Cliente : **Hélène Caron**, responsable logistique d'Endives du Ternois (vouvoiement).

**Pastilles d'étape** (option `pastilles`) : ① Lire les documents · ② Préparer les déclarations · ③ Tenir le compte · ④ Répondre à la
cliente. Une pastille est « faite », jamais « juste ».

**Barre « Étape suivante »** (option `suite`, comme ENT-8.2) : Messagerie → Préparer les déclarations → Relevé du compte → répondre à Hélène.
**(Cowork)** : la 1re a déjà connu des parcours sans barre (Decathlon). Elle sert ici parce que la séance enchaîne deux fiches et une
réponse.

**Menu** : Avant de commencer · Messagerie · Portail clients — Déclarations · Portail clients — Relevé du compte (`menu: []`).

### Étape 0 — Avant de commencer (≈ 5 min, non noté)

Voir §4 ter.

### Étape 1 — Deux messages (≈ 5 min)

1. **Hélène Caron → service clients** (lundi 18/01, 8 h 02), pièces jointes = **les documents de la semaine du 11 au 15/01** (§6.2, ordre tiré),
   plus le **dernier relevé** (solde au 11/01) :
   « Bonjour, / nous travaillons avec CHEP depuis le début de la campagne d'endives et je ne suis pas encore à l'aise avec les déclarations.
   Vous trouverez les documents de la semaine dernière. Pouvez-vous me préparer les déclarations à valider sur le portail, et me dire où en
   est notre compte ? / Bien cordialement, / Hélène Caron — Responsable logistique, Endives du Ternois »
2. **Sandrine → {prénom}** (8 h 20), avec pour pièce jointe l'**extrait des conditions de location** (§6.3) :
   « Bonjour {prénom}, / tu prends le message d'Hélène Caron ? C'est une nouvelle cliente. Pour chaque document, dis si c'est un mouvement de
   palettes CHEP, avec qui, et combien de palettes **CHEP**. Prépare ses déclarations sur le portail (c'est elle qui les validera), puis fais
   son relevé au vendredi 15 et réponds-lui. / Sandrine »

Consigne **neutre** : « les documents de la semaine », jamais leur nombre.

### Étape 2 — Préparer les déclarations (fiche `decl`, ≈ 15 min, jalons 1 à 5)

Fiche « **Portail clients CHEP — déclarations à valider — compte ET-62-0417** ». À gauche, les documents en onglets, de « Document A » à
« Document F » dans l'ordre tiré de l'élève (`documents: (db) => …`). À droite, **un `cadre` par document** :
- « Mouvement de palettes CHEP » [liste] : *Émission reçue de CHEP* · *Transfert vers un distributeur* · *Retour au centre de service* ·
  *Aucun mouvement CHEP* ;
- « Partenaire » [liste] : CHEP Templemars · Frais du Nord (Lesquin) · Halles d'Artois (Douai) · Hainaut Primeurs (Prouvy) · MarchéLys
  (Roubaix) · Aucun ;
- « Palettes CHEP » [nombre, `entier: true`, `min: 0`, unité « palettes »].

Encadré en tête (guidage, 3 lignes) : « Seules les palettes CHEP se déclarent. / Une palette Europe ou d'un autre pool ne passe pas sur le
compte. / Une commande ou un document daté après le 15/01 n'est pas encore un mouvement. »
Rien n'est jugé à l'écran. L'envoi est refusé tant qu'il manque une réponse (« Aucun » et 0 sont des réponses). Une fois envoyée, la fiche
est figée. Bouton : « Préparer les déclarations pour Hélène ». `defile: true`, `serree: true`, `largeurDocs` ≈ 0,9.

**Suite** (`apresFiche('decl')`, juste ou faux, neutre) : Sandrine : « Bien. Fais maintenant son relevé au vendredi 15/01 : c'est là qu'on
voit où en est son compte. »

### Étape 3 — Le relevé du compte (fiche `releve`, bloc `grille`, ≈ 12 min, jalons 6 à 8)

Fiche « **Relevé du compte ET-62-0417 — semaine du 11 au 15/01/2027** ». La grille **lit la fiche `decl`** (`lignes(db)`, comme ENT-6.10) :

| | A | B | C | D |
|---|---|---|---|---|
| 1 | | **Entrées (+)** | **Sorties (−)** | **Solde** |
| 2 | Solde au lundi 11/01 | | | {S0} *(grisé)* |
| 3… | une ligne par document que **l'élève** a déclaré comme mouvement : « Doc. B — Transfert — Frais du Nord — 26 » *(texte grisé)* | saisie | saisie | |
| n | **Solde au vendredi 15/01** | | | **formule** |

- L'élève met chaque quantité dans **la bonne colonne** (émission → entrées ; transfert et retour → sorties), puis écrit la formule du solde
  (=D2+SOMME(B3:B…)−SOMME(C3:C…), ou toute formule équivalente qui lit les cases).
- `colonneAide` (guidage) : « Une émission fait entrer des palettes sur le compte ; un transfert ou un retour les fait sortir. »
- Une ligne que l'élève a classée « Aucun mouvement » n'apparaît pas. **Une erreur ne se paie qu'une fois** : la grille juge les colonnes et
  le calcul **sur ses propres déclarations**.
- Bouton : « Enregistrer le relevé ». **Suite** (`apresFiche('releve')`) : Hélène renvoie un message court (« Merci, j'attends vos
  explications. »), qui porte la **réponse par phrases** de l'étape 4.

### Étape 4 — Répondre à Hélène (réponse par phrases `reponse-helene`, ≈ 5 min, jalons 9 à 11)

| Ligne | Choix (ordre tiré) | Juste |
|---|---|---|
| salut | *(imposée)* « Bonjour Madame Caron, » | — |
| decl | *(imposée)* « Les déclarations de la semaine sont prêtes sur le portail : il vous reste à les valider. » | — |
| solde | *(imposée, calculée)* « Au vendredi 15/01, votre compte compte **{solde de l'élève}** palettes CHEP. » | — (reprend son relevé, sans corriger) |
| paie | « Vous payez la location de ces palettes pour chaque jour où elles restent sur votre compte. » · « Vous ne payez que les palettes que vous perdez. » · « La location s'arrête dès que le camion quitte votre quai, même sans déclaration. » | 1re |
| conseil | « Déclarez chaque transfert dès le départ du camion, avec le nombre de palettes CHEP du bordereau. » · « Déclarez aussi vos palettes Europe : elles comptent sur votre compte. » · « Inutile de déclarer : CHEP compte les palettes à leur retour. » | 1re |
| fin | « Je reste à votre disposition. Bien cordialement, {prénom} — CHEP France, Templemars » · « À plus, {prénom} » · « Bisous, {prénom} » | 1re |

**Fin** : Hélène (déclencheur après l'envoi) : « Merci, je valide tout ça ce matin. » Sandrine : « Merci {prénom}, c'est envoyé. » Puis le bandeau
de fin (premier bilan), et la correction est possible (fiches rouvertes par « Corriger » sur les jalons faux, comme ENT-7.1).

**Pour réfléchir** (au bilan, texte libre non noté) : « Hélène a déclaré son transfert du mercredi avec cinq jours de retard. Combien de jours de
location a-t-elle payés pour rien, et combien cela fait-il pour {n} palettes à 0,04 € par jour ? »

Mots cliquables (`lexique`) : ceux de la coordination §3.

### Ergonomie
- 1366 × 768 et 1280 × 720 : aucun défilement de page (`defile: true` sur `decl`), bouton d'envoi toujours visible.
- Un bordereau se lit sans loupe ; la ligne « Supports de charge » est dans un **cadre** du document (repérable, jamais surlignée).
- Entrée n'envoie pas la fiche.

## 4 bis. Questions au fil — propositions et choix (Cowork, sur délégation)

| # | Geste (écran, case) | Qui pose | Question proposée | Type | Notée / réflexion | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| 1 | `decl` : liste « Mouvement » du **document partiel tiré** (`fiche:decl:type-<doc>`) | Sandrine | `selon` : « Le bordereau pour {partenaire} porte {total} palettes. Combien vont sur le compte CHEP d'Hélène ? » — ✓ « {nChep} : seulement les palettes CHEP. » · « {total} : tout ce qui est dans le camion. » · « {autres} : les palettes Europe (ou rouges). » | fil | notée | **au bilan** | ancrée sur **sa** pièce tirée ; donnerait le jalon 2 : au bilan |
| 2 | `decl` : case « Palettes CHEP » du **retour** (`fiche:decl:qte-<doc retour>`) | Sandrine | « Hélène écrit : “4 palettes ont disparu de notre parc, c'est sûrement le transporteur.” D'après l'article 1732 du Code civil, qui répond de ces palettes devant CHEP ? » — ✓ « Endives du Ternois, sauf si elle prouve que la perte n'est pas de sa faute. » · « CHEP, puisqu'elle en est propriétaire. » · « Le transporteur, dans tous les cas. » · « Personne : une palette vide ne vaut rien. » | fil | notée | tout de suite | **éco-droit appliqué au cas**, texte de l'art. 1732 en document joint ; ne souffle aucun jalon |
| 3 | `releve` : sortie de la case du **solde** (`fiche:releve:compte`) | Sandrine | `selon` : « Ton solde passe de {S0} à {soldeEleve}. Pour Endives du Ternois, ce chiffre, c'est… » — ✓ « le nombre de palettes CHEP dont elle paie la location chaque jour » · « le nombre de palettes rangées dans son entrepôt ce matin » · « le nombre de palettes qu'elle a perdues » | fil | notée | **au bilan** | ancrée sur **son** solde ; souffle la ligne « paie » de la réponse : au bilan |
| 4 | `decl` : liste « Mouvement » de l'**émission** | Sandrine | « Depuis le 12/08/2026, un règlement européen pousse au réemploi des palettes. Le pool CHEP en est-il un exemple ? » — ✓ « Oui : chaque palette est contrôlée, réparée et suivie avant de resservir. » · « Non : une palette louée n'est pas réemployée. » · « Oui, et ce règlement oblige tout le monde à louer chez CHEP. » | fil | notée | tout de suite | éco-droit (PPWR), **en réserve** (culture plus qu'application) |
| 5 | Envoi de la réponse à Hélène (`messagerie:phrase:conseil`) | Sandrine | « Pourquoi CHEP ne déclare-t-elle pas elle-même les transferts de ses clients ? » | fil | réflexion | au bilan | fait réfléchir à la bonne foi des déclarations (palettes non numérotées, source ADLC) |

**Retenues (Cowork)** : **1, 2, 3** notées (1 point chacune, `part: 3`) ; **5** en réflexion ; 4 en réserve (`actif: false`).
Retours (la conséquence, pas la leçon) : n° 1 « Les 4 palettes Europe repartent en échange : sur le compte, elles fausseraient le solde. » ;
n° 2 « C'est elle qui a les palettes en location : à elle de se retourner vers le transporteur si c'est lui. » ; n° 3 « Ce solde, elle le paie
tous les jours : c'est pour ça que chaque transfert compte. »

## 4 ter. Avant de commencer — banque (Cowork)

`ouverture.tirage: { preparation: 2, droit: 2 }` (4 questions, ≈ 5 min). Non notées, sans que l'élève le sache. `cle: true` (★) = reprises en
ENT-9.4. Documents à gauche : « CHEP en bref » (faits vérifiés et datés de la coordination §2), « Le droit » (art. 1709, 1732, 1103 du Code
civil ; résumé du PPWR, source et date), « Conditions de location (extrait reconstitué) ».

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| p1 | preparation | « CHEP, c'est… » | « un loueur de palettes qui les récupère, les répare et les remet en circulation » | « un fabricant qui vend des palettes neuves » · « un transporteur de marchandises » | CHEP en bref | ★ |
| p2 | preparation | « Une palette bleue posée chez Endives du Ternois appartient à… » | « CHEP » | « Endives du Ternois, puisqu'elle l'a reçue » · « la plate-forme qui recevra les endives » | Conditions de location, art. 1 | |
| p3 | preparation | « Dans le pool CHEP, un “émetteur”, c'est… » | « l'entreprise qui reçoit des palettes de CHEP et y charge sa marchandise » | « la plate-forme qui reçoit la marchandise » · « le centre de service qui répare les palettes » | CHEP en bref | ★ |
| p4 | preparation | « À quoi sert le centre de Templemars ? » | « à trier, contrôler, réparer et stocker les palettes avant de les réémettre » | « à fabriquer des palettes neuves » · « à vendre des endives » | CHEP en bref (chiffres 2017 datés) | |
| p5 | preparation | « Une palette en bois brut marquée EPAL, chez CHEP… » | « n'est pas dans le pool : elle ne se déclare pas sur un compte CHEP » | « se déclare comme une palette bleue » · « est repeinte en bleu et devient CHEP » | Lexique « palette Europe » | ★ |
| d1 | droit | « Endives du Ternois paie CHEP pour se servir de ses palettes. En droit, ce contrat est… » | « un louage de choses (une location) » | « une vente » · « un prêt gratuit » | Art. 1709 | |
| d2 | droit | `variante` : « Un cariste d'Endives du Ternois casse {n} palettes CHEP en les chargeant. Qui en répond devant CHEP ? » | « Endives du Ternois : la perte arrive pendant qu'elle a les palettes, par sa faute » | « CHEP, propriétaire des palettes » · « Personne : c'est un accident » | Art. 1732 | ★ |
| d3 | droit | « Le contrat dit : “la location court jusqu'à la déclaration du transfert”. Hélène a oublié de déclarer. Doit-elle payer ces jours ? » | « Oui : le contrat signé s'impose aux deux parties » | « Non : un oubli n'engage à rien » · « Non : la loi interdit de faire payer une location » | Art. 1103 + conditions, art. 3 | ★ |
| d4 | droit | « Depuis août 2026, le règlement européen sur les emballages (PPWR) pousse au réemploi des palettes. Le pool CHEP… » | « est un système de réemploi : chaque palette est contrôlée, réparée et suivie avant de resservir » | « est interdit par ce règlement » · « devient obligatoire pour toutes les entreprises » | Résumé du PPWR (source trans.info, 07/10/2026) | |

## 5. Jalons / notation (sur 20) — poids fixés par Cowork (délégation du 17/10/2026)

Aucun jalon n'est vrai avant l'envoi de sa fiche. **Inaction = 0 / 20** : une fiche ne part pas incomplète, et une réponse non envoyée fait
toutes ses lignes fausses.

| # | Groupe | Jalon (`lib` neutre) | Poids | Ce qu'il lit | Piège qui le fait tomber |
|---|---|---|---|---|---|
| 1 | Repérer | Types des mouvements de l'émission, du transfert simple et du retour | 2 | `decl`, `type-<doc>` des 3 documents fixes | émission classée « retour » (le camion vient de Templemars) ; retour classé « transfert » |
| 2 | Repérer | Le document partiel : « Transfert » **et** seulement les palettes CHEP | 2 | `type-` et `qte-` du document de la banque `partiel` | {total} déclaré au lieu de {nChep} |
| 3 | Repérer | Le document sans mouvement : « Aucun mouvement CHEP » | 2 | `type-` du document de la banque `nonMouvement` | palettes Europe déclarées ; commande du 19/01 déclarée comme émission |
| 4 | Repérer | Partenaires des mouvements | 1 | `part-<doc>` des mouvements réels | Frais du Nord pour un transfert à Halles d'Artois ; « Aucun » pour l'émission |
| 5 | Repérer | Quantités de l'émission, du transfert simple et du retour | 1 | `qte-` des 3 documents fixes | total du camion recopié ; quantité de la commande |
| 6 | Mettre à jour | Chaque quantité dans la bonne colonne, sur **ses** lignes | 3 | `lireFeuille('releve', 'compte', db)`, colonnes B/C de ses lignes | transfert en entrées ; retour en entrées |
| 7 | Mettre à jour | Solde calculé par une formule | 1 | `juge` de la case du solde ≠ `pasFormule` | solde tapé à la main |
| 8 | Mettre à jour | Solde juste d'après ses déclarations | 2 | valeur de la case = S0 + Σ entrées − Σ sorties de **ses** lignes | oubli d'une ligne dans la formule ; S0 oublié |
| 9 | Informer la cliente | Ce qu'elle paie | 1 | `phrasesJustes(db, 'reponse-helene')`, ligne `paie` | « seulement les palettes perdues » |
| 10 | Informer la cliente | Le conseil de déclaration | 1 | ligne `conseil` | « déclarez aussi les Europe » |
| 11 | Informer la cliente | Formule de fin (forme) | 1 | ligne `fin` | « À plus » |
| — | Questions au fil | n° 1, 2, 3 | 3 | moteur (`part: 3`) | |

Total : Repérer 8 · Mettre à jour 6 · Informer 3 · Questions 3 = **20**. Forme : 1 / 20 (5 %). Aucun jalon à 0.
**Une erreur ne se paie qu'une fois** : un type faux coûte au jalon 1, 2 ou 3, pas à nouveau au 6 ou au 8 (qui lisent **ses** lignes). Le solde
réel n'est jamais rejugé.
Bandeau de fin : par groupe, jamais la case ni la réponse ; un groupe faux se corrige à l'écran `fiche:decl` ou `fiche:releve`.

**Bonus du confirmé** (`bonus: true`, +0,5 par cas, plafond +2) : un jalon par document bonus reçu (§6 bis), juste s'il est classé « Aucun
mouvement CHEP ». `null` si l'élève n'a pas reçu le cas.

## 6. Contenu (données)

Fichiers : `contenus/chep.js` (**l'univers, partagé par 9.1 à 9.4** : identité, charte, personnes, clients, distributeurs, lexique, conditions
de location, documents « CHEP en bref » et « Le droit », gabarits HTML des documents, fonction `solde`) ; `contenus/chep-ent91-donnees.js`
(données pures : banques, tirage, contrôle d'équité, valeurs attendues calculées) ; `contenus/chep-ent91.js` (messages, fiches, phrases,
jalons, pastilles, accueil) ; `contenus/questions/ENT-9.1.js` ; `contenus/corriges/ENT-9.1.js` (`corrigeEleve(base)`) ;
`activites/chep-compte-palettes.js`.

### 6.1 Le compte
Compte **ET-62-0417** (construit). Solde au lundi 11/01/2027 : **S0** tiré de 150 à 210, par pas de 5. Pour l'élève témoin des tests : 180.

### 6.2 Les documents de la semaine

**Pièce fixe** (la même structure pour tous, valeurs tirées) :

| Doc. | Date | Document | Contenu | Attendu |
|---|---|---|---|---|
| F1 | mar. 12/01 | **Bon d'émission** EM-27-…, CHEP Templemars → Endives du Ternois | « Palettes CHEP 1 200 × 1 000 livrées : **E** » (E tiré 160 à 240, pas de 20 ; témoin 200) | Émission · CHEP Templemars · E |
| F2 | mer. 13/01 | **Bordereau de livraison** BL-ET-…, Endives du Ternois → **Frais du Nord** (Lesquin), endives en colis de 5 kg | cadre « Supports de charge » : « **T** palettes CHEP 1 200 × 1 000 » (T tiré 22 à 26 ; témoin 26) | Transfert · Frais du Nord · T |
| F3 | ven. 15/01 | **Bon de retour** RET-…, Endives du Ternois → centre de Templemars | « Palettes CHEP rendues (surplus) : **R** » (R tiré 20 à 40, pas de 2 ; témoin 30) | Retour · CHEP Templemars · R |

**Banque `partiel`** (une pièce au socle, `melange: { moyen: 1 }`) : un bordereau qui mêle les palettes CHEP à d'autres.
- `pa-europe` : jeu. 14/01, → **Halles d'Artois** (Douai) : « **N** palettes, dont **C** palettes CHEP et **N − C** palettes Europe (échange) »
  (N tiré 20 à 24, Europe 2 à 6 ; témoin 22 = 18 + 4) → Transfert · Halles d'Artois · C.
- `pa-lpr` : ven. 15/01, → **MarchéLys** (Roubaix) : « **N** palettes, dont **C** palettes CHEP et **N − C** palettes rouges LPR » (mêmes bornes)
  → Transfert · MarchéLys · C.

**Banque `nonMouvement`** (une pièce au socle, `melange: { moyen: 1 }`) :
- `nm-europe` : jeu. 14/01, bordereau → **Hainaut Primeurs** (Prouvy) : « **20** palettes Europe (échange une pour une) », aucune CHEP (18 à 22) →
  Aucun mouvement CHEP.
- `nm-commande` : ven. 15/01, **commande de palettes** CMD-… à CHEP : « 240 palettes à livrer le mardi 19/01 » (200 à 260) → Aucun mouvement
  CHEP (la livraison viendra après le relevé).

**Banque `bonus`** (confirmé : `bonus: { confirme: { difficile: 2 } }`) :
- `bo-doublon` : la **copie** du bordereau F2, envoyée deux fois par Hélène (même numéro, mention « Duplicata ») → Aucun mouvement CHEP.
- `bo-lundi` : bordereau du **lun. 18/01** → Frais du Nord, 24 palettes CHEP → Aucun mouvement CHEP **cette semaine** (après le 15/01).

**Valeurs attendues** (calculées par le code) : `solde = S0 + E − T − C − R`. Témoin (`pa-europe`, `nm-europe`) : 180 + 200 − 26 − 18 − 30 = **306**.
**Contrôle d'équité** (`verifier`) : solde ≥ 150 ; C ≠ N ; aucune quantité égale à une autre du même jeu (sinon un piège se confond avec la
bonne réponse) ; le document `nonMouvement` ne porte jamais « CHEP » dans son cadre « Supports » ; l'ordre des onglets est tiré, les
documents fixes ne sont jamais tous les trois en tête.

### 6.3 Conditions de location (extrait reconstitué, document joint)
1. Les palettes restent la propriété de CHEP. 2. La location est due pour chaque palette inscrite au compte du client, chaque jour (0,04 € HT
par palette et par jour). 3. L'émetteur déclare chaque transfert sur le portail au plus tard le jour ouvré suivant l'expédition. 4. Un
transfert ne se déclare que vers un distributeur sous contrat CHEP. 5. Seules les palettes CHEP se déclarent. 6. Une erreur de déclaration se
corrige dans les 60 jours qui suivent la facture. Pied : « Extrait reconstitué à partir du fonctionnement public du pool (Autorité de la
concurrence, 2009 ; CHEP) — document pédagogique, non contractuel. »

## 6 bis. Tirage et niveaux

- **Pièce fixe** : F1, F2, F3 (structure fixe, quantités tirées). **Banques** `partiel` et `nonMouvement` : une pièce chacune, même difficulté
  dans chaque banque (deux voisins n'ont pas les mêmes documents ni les mêmes nombres). Consigne neutre.
- **Confirmé** : deux documents de plus (`bo-doublon`, `bo-lundi`) à la fin de la liste des onglets ; jalons bonus ; le socle et ses jalons ne
  changent pas.
- **Accompagné** (Cowork, à construire si le moteur le permet par `blocs(db)` qui lit `niveauEleve`) : sous chaque cadre, une phrase « Regarde
  le cadre “Supports de charge” : combien de palettes CHEP ? » ; dans le relevé, une aide par ligne (« Transfert → colonne Sorties »). Sinon,
  contenu standard.
- **Questions** : la n° 1 et la n° 3 portent sur **sa** pièce et **son** solde (`selon`).

## 7. Demandes au moteur — état des lieux d'abord, en lecture seule

**Aucune vue nouvelle n'est demandée.** À vérifier, et à dire si quelque chose manque :
1. Une fiche dont les **cadres** viennent de `blocs(db)` (un cadre par document tiré, 5 à 7 cadres) et dont les **documents** viennent de
   `documents(db)` (D-1 bis). Les gestes publiés par une fiche à `blocs(db)` sont ceux du dessin **sur base vide** : les questions n° 1 et 2,
   qui visent le bloc d'un document **tiré**, ont-elles leur geste ? Sinon, publier un id de bloc **stable par rôle** (`type-partiel`,
   `qte-retour`…) plutôt que par document.
2. Le bloc `grille` dont les **lignes** dépendent d'une autre fiche (de 3 à 7 lignes selon ce que l'élève a déclaré) : la formule du solde reste
   à une adresse que l'élève connaît (dernière ligne). La juger « par la valeur et la présence d'une formule », pas par une adresse fixe.
3. Réponse par phrases avec une **ligne imposée calculée** (`texte: (db) => …` sur une ligne `texte`) : si `texte` n'accepte pas de
   fonction, l'écrire dans le corps du message d'Hélène (« Merci de me dire où en est le compte ») et mettre le solde dans une ligne à choix
   unique… **le dire** avant de choisir.
4. L'aide « accompagné » dans `blocs(db)` (lecture de `niveauEleve(db)`).

## 7 bis. Séance déjà jouée ?

Non (séance nouvelle).

## 8. Tests attendus

Bloc **`chep-91`** (`outils/test/chep-91.mjs`), aides communes `outils/test/chep/commun.mjs` ; une ligne dans `BLOCS` et dans `GROUPES`
(groupe le plus léger) ; **dire à Tristan que `outils/test.mjs` est touché**.
- **Valeurs écrites à la main** : témoin S0 = 180, E = 200, T = 26, `pa-europe` 22 = 18 + 4, R = 30 → solde **306** ; un second témoin (`pa-lpr`,
  `nm-commande`), lui aussi écrit à la main.
- **Parcours juste** de chaque témoin = 20 / 20 (questions comprises) ; **le parcours juste de l'un, joué par l'autre, ne fait pas 20**.
- **Inaction** = 0 ; fiche incomplète refusée, travail gardé.
- **Pièges** : total du camion déclaré pour le partiel → jalon 2 faux ; palettes Europe déclarées en transfert → 3 faux ; commande déclarée en
  émission → 3 faux ; transfert en colonne entrées → 6 faux ; solde tapé à la main → 7 faux (8 reste juste si la valeur est bonne) ; ligne
  « paie » fausse → 9 faux.
- **Une erreur ne se paie qu'une fois** : partiel déclaré à {total}, puis relevé juste sur ses lignes → 6 et 8 vrais.
- **Tirage** : répartition des pièces de chaque banque entre 40 et 60 % sur 200 graines ; contrôle d'équité sur 200 graines, aucun secours ;
  banques dans `BANQUES_FIGEES` ; confirmé → 2 documents de plus et bonus jugés ; standard → `null`.
- **Neutralité** : aucun message d'Hélène ni de Sandrine ne dit « juste » ou « faux », et la ligne `solde` reprend le solde **de l'élève**.
- **Ouverture** : 4 questions tirées (2 + 2), banque ≥ double par rubrique.
- **Ergonomie** : 1366 × 768 et 1280 × 720, aucun défilement de page, bouton d'envoi visible, 7 cadres (confirmé).
- **Sabotages** : écrire 306 en dur → le second témoin tombe ; juger le jalon 8 sur le solde réel → le cas « erreur payée une fois » tombe ;
  réponse d'Hélène qui reprend le solde juste → test de neutralité ; un document `nonMouvement` qui porte « CHEP » → contrôle d'équité.

## 9. Supports

- Trame courte (Cowork, **après validation à l'écran**) : lexique ; un relevé vierge (entrées, sorties, solde) pour le brouillon ; l'encadré « seules
  les palettes CHEP se déclarent » ; ce qui est vérifié / construit.
- Corrigé `contenus/corriges/ENT-9.1.js` : `corrigeEleve(base)` (ses documents, ses quantités tirées, l'attendu, son solde).

## 10. Critères de validation par Tristan

À l'écran (1366 × 768, puis vidéoprojecteur) : dans chaque document, on trouve en un coup d'œil le nombre de palettes CHEP ; un élève qui déclare
tout le camion le voit au bilan sans qu'on lui donne la réponse ; le relevé se remplit sans défiler ; Hélène ne corrige jamais l'élève ; on tient
en 50 min.

## 11. Décisions prises par Cowork (à corriger à l'écran si besoin)

1. Endives du Ternois (endives, janvier) plutôt qu'un autre produit : la campagne de l'endive tombe en P2 et ce sont des fruits et légumes, le
   secteur de CHEP.
2. Le portail est une **fiche** du site (pas une copie de l'interface réelle, que je n'ai pas vue).
3. Prix de location 0,04 € et délai de déclaration : **construits** (dits comme tels en pied).
4. Barre « Étape suivante » en 1re (habituellement CAP) : gardée parce que la séance enchaîne deux fiches et une réponse.
5. Poids du §5 et questions 1, 2, 3 retenues.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** : bloc / suite entière, nombre de cas, sabotages éprouvés
- **Commits** :
- **Reste ouvert** :
