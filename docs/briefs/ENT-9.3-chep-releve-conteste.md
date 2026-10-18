# Brief de séance — ENT-9.3 CHEP, le relevé contesté (1re, entraînement C2.5, erreur induite)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/COORDINATION-chep.md, docs/briefs/ENT-9.1-chep-compte-palettes.md (§6, compte rendu) puis docs/briefs/ENT-9.3-chep-releve-conteste.md. État des lieux du §7, durée, puis construis.
> ```

**Statut** : à implémenter
**Date du brief** : 17/10/2026
**Conversation d'origine** : Cowork (Opus), 17/10/2026, décisions déléguées par Tristan. Choix secondaires marqués **(Cowork)**.
**À lire avec `COORDINATION-chep.md` et ENT-9.1** (même cliente, mêmes fiches du portail).
**Modèle** : **Opus**. **Durée estimée** : ≈ 5 h. Aucune vue nouvelle : seulement des fiches, des documents tirés et une réponse par phrases.
**Place dans l'ordre** : après ENT-9.1. Elle peut se construire avant le chantier moteur, mais **elle se joue après ENT-9.2** (elle s'appuie
sur le contrôle d'un retour).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-9.3 |
| `id` | `chep-releve-conteste` |
| Titre / desc | « CHEP — le relevé contesté » / « Une cliente conteste son relevé de palettes : retrouver dans ses documents et dans les nôtres ce qui manque ou ce qui est faux (y compris une erreur de notre centre), dire qui corrige quoi, refaire le solde et lui répondre honnêtement. » |
| Rubrique | simulog, entreprise n° 9 CHEP |
| Niveau(x) | `['1re']` |
| Compétence(s) | `['C2.5']`, les quatre indicateurs (la ramasse en un seul geste) |
| Temps | `entrainement`, avec une **erreur induite** : le retour validé par Grégory sans compter les piles |
| Notation | jalons pondérés sur 20, coefficient 1 ; `bareme: 20` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |
| Niveaux prévus | `['confirme']` |
| Autres | `parcours`, `correction` ; `questions: 'ENT-9.3'` |

## 2. Vérifié / construit

Voir la **coordination §2**. Propre à cette séance :
- **Vérifié** : c'est **l'émetteur qui déclare** ses transferts (ADLC 2009, §29). Un transfert non déclaré fait **payer la location à
  l'expéditeur pour des palettes qu'il n'a plus**, et l'écart apparaît à l'inventaire. Les corrections se font **dans les 60 jours** qui
  suivent la facture, et au-delà avec l'accord écrit de l'autre partie (CHEP Australie, pratique à généraliser avec prudence). Le système
  repose sur la **bonne foi** des déclarations (ADLC 2009, §32).
- **Construit** : la contestation, l'inventaire d'Hélène, le rapport de la ligne de tri, l'erreur de Grégory, toutes les quantités.
  **L'erreur est celle d'un personnage fictif de CHEP**. Elle ne dit rien du vrai centre de Templemars : la séance le dit en pied du rapport de
  tri (« Situation construite »).

## 3. Objectif pédagogique

Reprendre **sans guidage pas à pas** ce qui a été vu en 9.1 et 9.2. L'élève **repère** dans des documents de deux sources (ceux de la cliente,
ceux de CHEP) ce qui explique un écart. Il **sait qui corrige quoi** (l'émetteur ses déclarations, CHEP ses crédits de retour), **met le compte
à jour** et **explique l'écart restant**. Il **répond honnêtement**, y compris quand l'erreur de CHEP est en faveur de la cliente.
**L'erreur induite** : au retour d'Endives du Ternois, Grégory a validé « 5 piles × 15 = 75 » sans compter ni regarder les pools. Le rapport
de la ligne de tri trouve **k palettes d'un autre pool** : le compte de la cliente a été **trop crédité**. L'élève doit le voir dans les
documents et le corriger, en sens inverse de ce que demande la cliente.

## 4. Déroulé (≈ 55 min)

**Date : lundi 25/01/2027, 8 h 30.** Moins guidé que 9.1 et 9.2 : **pas d'encadré** dans les fiches, **pas de `colonneAide`**, pas de barre
« Étape suivante » **(Cowork)** ; pastilles conservées.
**Pastilles** : ① Enquêter · ② Refaire le solde · ③ Répondre à la cliente.
**Menu** : Avant de commencer · Messagerie · Portail clients — Enquête · Portail clients — Relevé corrigé.

### Étape 0 — Avant de commencer (≈ 5 min, non noté) — §4 ter.

### Étape 1 — La contestation (≈ 3 min)

**Hélène Caron** (lundi 25/01, 8 h 05), pièces jointes = **son inventaire** du 25/01 et **ses documents** de la semaine du 18 au 22/01
(§6.2) :
« Bonjour, / votre relevé au vendredi 22/01 indique **{S_rel}** palettes CHEP sur notre compte. Notre inventaire de ce matin en compte **{S_parc}**
sur notre parc. Nous ne voulons pas payer la location de palettes que nous n'avons pas. Merci de corriger. / Hélène Caron »

**Sandrine** (8 h 20), pièces jointes = **notre relevé** de la semaine (mouvements enregistrés), le **bon de retour** RET-… du mardi 19/01
(avec la mention manuscrite de Grégory : « 5 piles × 15 = 75 — OK, G.V. ») et le **rapport de la ligne de tri** du mercredi 20/01 :
« Bonjour {prénom}, / Hélène conteste son relevé. Reprends tout, document par document, les siens et les nôtres. Dis-moi ce qu'il faut
corriger et qui doit le faire, refais son solde, et réponds-lui. / Sandrine »

### Étape 2 — L'enquête (fiche `enquete`, ≈ 25 min, jalons 1 à 5 et 8)

Documents à gauche (onglets, ordre tiré) : notre relevé · bon de retour · rapport de tri · ses bordereaux (3 ou 4) · son inventaire ·
conditions de location. À droite, **un `cadre` par document** de la semaine (bordereaux et bon de retour) :
- « Dans notre relevé, ce document est… » [liste] : *enregistré et juste* · *absent : transfert non déclaré* · *enregistré avec une quantité
  fausse* · *mal crédité au retour*.
- « Correction sur le solde » [liste : *aucune* · *ajouter* · *retirer*] + [nombre, `entier`, `min: 0`] palettes.
- « Qui fait la correction ? » [liste : *personne* · *Endives du Ternois (sur le portail)* · *CHEP (service clients)*].

Puis un cadre « **Son inventaire** » :
- « Après les corrections, il restera un écart avec l'inventaire d'Hélène. Il vient de… » [choix, ordre tiré] : ✓ « palettes Europe comptées
  comme des CHEP dans son inventaire » · « palettes CHEP perdues par le transporteur » · « une erreur de calcul dans notre relevé ».

Et un cadre « **La demande de Frais du Nord** » (P.S. d'Hélène : « Frais du Nord nous dit avoir {F} palettes CHEP vides de nos livraisons qui
encombrent son quai. ») :
- « Que proposes-tu à Yannick ? » [choix] : ✓ « Ajouter Frais du Nord à la prochaine tournée de ramasse : {F} palettes, c'est moins qu'un camion
  complet. » · « Envoyer tout de suite un camion complet. » · « Demander à Endives du Ternois d'aller les reprendre. »

Bouton : « Envoyer l'enquête à Sandrine ». `defile: true`. **Suite** (neutre) : Sandrine : « Merci. Refais son solde avec tes corrections. »

### Étape 3 — Le relevé corrigé (fiche `corrige`, grille, ≈ 10 min, jalons 6 et 7)

La grille lit la fiche `enquete` (comme ENT-9.1) :

| | A | B | C |
|---|---|---|---|
| 1 | Solde du relevé au 22/01 | {S_rel} *(grisé)* | |
| 2… | une ligne par correction **de l'élève** (« RET-… : ajouter 3 ») | **à ajouter (+)** saisie | **à retirer (−)** saisie |
| n | **Solde corrigé** | formule | |
| n+1 | Inventaire d'Hélène | {S_parc} *(grisé)* | |
| n+2 | **Écart restant** (inventaire − solde corrigé) | formule | |

Bouton : « Enregistrer le relevé corrigé ». **Suite** : Hélène relance (« Alors ? ») avec la **réponse par phrases** de l'étape 4.

### Étape 4 — Répondre à Hélène (réponse par phrases `reponse-helene-2`, ≈ 8 min, jalons 9 à 11)

| Ligne | Choix (ordre tiré) | Juste |
|---|---|---|
| salut | *(imposée)* « Bonjour Madame Caron, » | — |
| chep | « En reprenant votre retour du 19/01, nous avons vu que nous vous avions crédité 75 palettes au lieu de {75 − k} : nous corrigeons, et votre solde **augmente** de {k}. » · « Votre retour du 19/01 était juste. » · « Nous retirons {k} palettes de votre compte : elles ont été mal comptées. » | 1re |
| demande | `(db) => …` calculées sur **sa** pièce : A2 ✓ « Il vous reste à déclarer sur le portail le transfert du {date} vers {partenaire} ({T2} palettes). » ; A3 ✓ « Il vous reste à corriger sur le portail la quantité du transfert du {date} : {réel} palettes, et non {déclaré}. » ; pièges : l'action de l'autre pièce, et « Nous corrigeons nous-mêmes vos déclarations. » | la bonne pour sa pièce |
| inventaire | « L'écart restant vient de {e} palettes Europe comptées dans votre inventaire : elles ne sont pas sur votre compte CHEP. » · « L'écart restant, ce sont des palettes perdues : nous les retirons. » · « Il n'y a plus d'écart. » | 1re |
| fin | *(imposée)* « Je reste à votre disposition. Bien cordialement, {prénom} — CHEP France, Templemars » | — |

**Fin** : Hélène (neutre) : « Merci pour votre franchise. Je fais le nécessaire. » Bandeau de fin.
**Pour réfléchir** (bilan) : « L'erreur de Grégory était en faveur d'Hélène. Pourquoi faut-il quand même la corriger et la lui dire ? »

## 4 bis. Questions au fil — propositions et choix (Cowork, sur délégation)

| # | Geste | Qui pose | Question proposée | Type | Notée / réflexion | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| 1 | `enquete` : liste du **bon de retour** (`fiche:enquete:type-retour`) | Sandrine | « Grégory a écrit “5 piles × 15 = 75 — OK”. Qu'est-ce qui aurait évité l'erreur ? » — ✓ « Compter chaque pile et regarder le marquage des palettes, comme au quai mardi dernier. » · « Peser le camion à l'arrivée. » · « Recopier le bon de collecte, c'est plus sûr. » | fil | notée | **au bilan** | relie l'erreur induite à 9.2 ; souffle le jalon 1 : au bilan |
| 2 | `enquete` : « Qui fait la correction ? » du **document client tiré** | Sandrine | « Hélène voudrait que CHEP corrige elle-même son transfert. D'après les conditions qu'elle a signées, qui doit le faire ? » — ✓ « Endives du Ternois : l'émetteur déclare ses transferts, et le contrat s'impose aux deux parties. » · « CHEP, puisque c'est son relevé. » · « Le distributeur qui a reçu les palettes. » · « Personne : une erreur de moins de 30 palettes ne se corrige pas. » | fil | notée | **au bilan** | **éco-droit appliqué au cas** (art. 1103 et conditions, art. 3), sur **sa** pièce ; souffle le jalon 5 : au bilan |
| 3 | `corrige` : sortie de la case de l'**écart restant** | Sandrine | `selon` : « Il te reste {écart de l'élève} palettes d'écart avec l'inventaire d'Hélène. Que fais-tu avant de lui répondre ? » — ✓ « Je vérifie que ce que j'ai trouvé l'explique, avant de répondre. » · « Je retire ces palettes de son compte pour qu'elle soit contente. » · « Je ne dis rien : c'est son problème. » | fil | notée | tout de suite | ancrée sur **son** écart ; l'enquête est déjà envoyée, rien n'est soufflé |
| 4 | `enquete` : liste du **bordereau juste** | Sandrine | « Hélène découvre en avril une erreur de janvier. D'après les conditions (60 jours), peut-elle encore la corriger seule ? » — ✓ « Non : passé 60 jours, il faut l'accord écrit de CHEP. » · « Oui, à tout moment. » · « Non, c'est perdu. » | fil | notée | tout de suite | éco-droit (délai contractuel) ; **en réserve** |
| 5 | Envoi de la réponse (`messagerie:phrase:chep`) | Sandrine | « Pourquoi CHEP a-t-elle intérêt à dire à Hélène une erreur qui était en sa faveur ? » | fil | réflexion | au bilan | la confiance, quand le système repose sur la bonne foi des déclarations (ADLC) |

**Retenues (Cowork)** : **1, 2, 3** notées (`part: 3`) ; **5** en réflexion ; 4 en réserve.
Retours : n° 1 « Mardi, tu as vu qu'une palette LPR ne se voit qu'en regardant la pile de près. » ; n° 2 « Le contrat dit que c'est elle qui
déclare : si CHEP le faisait à sa place, personne ne pourrait plus se fier aux déclarations. » ; n° 3 « Répondre avec un écart inexpliqué,
c'est s'exposer à une deuxième réclamation. »

## 4 ter. Avant de commencer — banque (Cowork)

`ouverture.tirage: { preparation: 2, droit: 2 }`. Non notées. Documents : « CHEP en bref », « Le droit », « Conditions de location ».

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| p1 | preparation | « Qui déclare un transfert de palettes CHEP vers un distributeur ? » | « l'émetteur, qui a expédié la marchandise » | « le distributeur, qui la reçoit » · « CHEP, au retour des palettes » | Conditions, art. 3 | ★ |
| p2 | preparation | « Un transfert non déclaré… » | « laisse les palettes sur le compte de l'émetteur, qui continue à payer leur location » | « passe tout seul sur le compte du distributeur » · « est annulé au bout d'une semaine » | Conditions, art. 2 et 3 | ★ |
| p3 | preparation | « Le tri trouve des palettes LPR dans un retour déjà crédité. Le crédit était… » | « trop haut : on le corrige » | « juste : une palette est une palette » · « trop bas : on ajoute les LPR » | Règles de crédit | |
| p4 | preparation | « Le solde d'un compte CHEP, c'est… » | « le nombre de palettes dont le client paie la location » | « le nombre de palettes dans son entrepôt » · « le nombre de palettes réparées » | Lexique | ★ |
| d1 | droit | `variante` : « Endives du Ternois a déclaré {d} palettes au lieu de {r}. Le contrat dit que l'émetteur déclare. Qui doit corriger ? » | « Endives du Ternois : le contrat signé s'impose à elle » | « CHEP, propriétaire » · « Personne : l'erreur est petite » | Art. 1103 + conditions | ★ |
| d2 | droit | « Les conditions prévoient une correction dans les 60 jours après la facture. Une erreur vue après 90 jours… » | « ne se corrige plus sans l'accord écrit de l'autre partie » | « se corrige quand on veut » · « est corrigée d'office par CHEP » | Conditions, art. 6 | |
| d3 | droit | « Une palette CHEP disparaît chez Endives du Ternois, sans preuve de ce qui s'est passé. Qui en répond ? » | « Endives du Ternois, qui l'avait en location » | « CHEP » · « le dernier transporteur passé » | Art. 1732 | |
| d4 | droit | « Pour le règlement européen PPWR, un système de réemploi doit pouvoir… » | « suivre l'usage, le retour, la réparation et la remise en circulation de chaque emballage » | « fabriquer des palettes neuves chaque année » · « interdire les palettes en bois » | Résumé du PPWR | |

## 5. Jalons / notation (sur 20) — poids fixés par Cowork (délégation du 17/10/2026)

| # | Groupe | Jalon (`lib` neutre) | Poids | Ce qu'il lit | Piège |
|---|---|---|---|---|---|
| 1 | Repérer | Le retour mal crédité trouvé, avec la bonne quantité (k) | 2 | `enquete`, cadre du bon de retour : « mal crédité », *ajouter*, k | « enregistré et juste » (la mention « OK » de Grégory) ; *retirer* k |
| 2 | Repérer | Le document client tiré trouvé (type et quantité) | 2 | cadre du document tiré | A2 vu comme « quantité fausse » ; A3 corrigé de la quantité déclarée au lieu de l'écart |
| 3 | Repérer | Les documents justes laissés sans correction | 1 | les autres cadres | un bordereau juste « corrigé » |
| 4 | Repérer | L'écart de l'inventaire expliqué (palettes Europe) | 2 | cadre « Son inventaire » | « palettes perdues par le transporteur » |
| 5 | Mettre à jour | Qui corrige : CHEP pour le retour, la cliente pour son document | 2 | « Qui fait la correction ? » des deux cadres en anomalie | « CHEP » partout |
| 6 | Mettre à jour | Chaque correction dans la bonne colonne, d'après **son** enquête | 2 | `lireFeuille('corrige', …)` | ajout et retrait inversés |
| 7 | Mettre à jour | Solde corrigé et écart restant, par formule et justes d'après **ses** corrections | 2 | cases du solde et de l'écart | tapés à la main ; S_rel oublié |
| 8 | Organiser la ramasse | Frais du Nord ajouté à la tournée | 1 | cadre « Frais du Nord » | camion complet ; « à Endives de les reprendre » |
| 9 | Répondre | L'erreur de CHEP reconnue, dans le bon sens | 1 | `phrasesJustes(db, 'reponse-helene-2')`, ligne `chep` | « votre retour était juste » ; « nous retirons » |
| 10 | Répondre | Ce qu'Hélène doit faire elle-même | 1 | ligne `demande` | l'action de l'autre pièce ; « nous corrigeons nous-mêmes » |
| 11 | Répondre | L'écart restant expliqué | 1 | ligne `inventaire` | « palettes perdues » |
| — | Questions | n° 1, 2, 3 | 3 | moteur | |

Total : Repérer 7 · Mettre à jour 6 · Ramasse 1 · Répondre 3 · Questions 3 = **20**. Pas de jalon de forme (lignes de politesse imposées).
**Une erreur ne se paie qu'une fois** : 6 et 7 lisent **son** enquête. Les lignes 9 à 11 sont jugées sur le réel (c'est ce qui part chez la
cliente), comme en ENT-7.1 **(Cowork)**.

**Bonus du confirmé** (+0,5 par cas, plafond +2) : **les deux** anomalies client (A2 et A3) au lieu d'une ; la seconde est jugée en bonus
(type, quantité, qui corrige). Le socle et ses jalons ne changent pas.

## 6. Contenu (données)

Fichiers : `contenus/chep.js` (univers) ; `contenus/chep-ent93-donnees.js` ; `contenus/chep-ent93.js` ; `contenus/questions/ENT-9.3.js` ;
`contenus/corriges/ENT-9.3.js` ; `activites/chep-releve-conteste.js`.

### 6.1 Les anomalies

| Pièce | Où | Ce qui s'est passé | Valeurs tirées | Correction | Qui |
|---|---|---|---|---|---|
| **A1** (fixe, l'erreur induite) | bon de retour RET-… du mar. 19/01 + rapport de tri du mer. 20/01 | crédité **75** ; le tri trouve **75 − k CHEP** (dont 3 à réparer) **et k palettes LPR** | k de 2 à 4 | **ajouter k** au solde (le crédit était trop haut) | CHEP |
| **A2** (banque `client`) | bordereau du jeu. 21/01 → Frais du Nord | transfert de **T2** palettes CHEP **absent** du relevé | T2 de 22 à 26 | **retirer T2** | Endives du Ternois |
| **A3** (banque `client`) | bordereau du mer. 20/01 → Halles d'Artois | déclaré **d**, le bordereau dit **r = d + x** | d de 10 à 14, x de 12 à 16 | **retirer x** | Endives du Ternois |
| **A4** (fixe) | inventaire d'Hélène du 25/01 | **e palettes Europe** comptées avec les CHEP | e de 3 à 5 | aucune sur le compte : expliquer | personne |

Plus **deux bordereaux justes** (enregistrés et justes, quantités tirées de 18 à 26), pour que tout ne soit pas faux.

**Les soldes** (calculés par le code) :
- `S_rel` tiré de 240 à 300 (pas de 5) ;
- `S_corrige = S_rel + k − (A2 ? T2 : x)` ;
- `S_parc = S_corrige + e` ; **écart restant = e**.
Contrôle : `S_rel > S_parc` toujours (la cliente se plaint de payer trop) : `T2` ou `x` (au moins 12) dépasse toujours `k + e` (au plus 9).
**Témoins** (à la main) : ① A3 : S_rel 280, k 3, d 12, r 26 (x 14), e 4 → S_corrige **269**, S_parc **273** (Hélène voit 7 de trop) ;
② A2 : S_rel 260, k 4, T2 24, e 5 → S_corrige **240**, S_parc **245**.

### 6.2 Les documents
- **Notre relevé** (semaine du 18 au 22/01) : solde au 15/01 (calculé à rebours depuis S_rel ; la séance ne lit pas la base de 9.1)
  **(Cowork)**, une émission, les transferts **déclarés** (A3 avec d), le retour crédité 75, solde au 22/01 = S_rel.
- **Bon de retour** : « 5 piles de 15 — 75 palettes CHEP » et la mention « 5 piles × 15 = 75 — OK, G.V. » en écriture « manuscrite » (police
  du site, en italique, pas d'image).
- **Rapport de la ligne de tri** (mer. 20/01, lot RET-…) : « Palettes CHEP : {75 − k}, dont 3 à réparer · Palettes LPR écartées : {k} · Total
  passé en ligne : 75 ». Pied : « Situation construite ».
- **Bordereaux d'Hélène** (3, ou 4 pour un confirmé), cadre « Supports de charge » comme en 9.1.
- **Inventaire d'Hélène** : « Palettes sur le parc ce matin : {S_parc} (palettes bleues et palettes en bois brut, comptées ensemble) ». La
  phrase entre parenthèses est l'indice, discret.
- **Frais du Nord** : F tiré de 110 à 140.

## 6 bis. Tirage et niveaux
- **Pièce fixe** : A1, A4, deux bordereaux justes. **Banque `client`** : A2 ou A3 (`melange: { moyen: 1 }`, deux pièces de même difficulté).
- **Confirmé** : l'autre pièce de la banque en plus (bonus, voir §5).
- **Accompagné** (Cowork) : une ligne d'aide sous chaque cadre (« Compare la quantité du bordereau et celle du relevé ») ; sinon standard.
- Consigne neutre : « tes documents et les nôtres ».

## 7. Demandes au moteur — état des lieux d'abord, en lecture seule
**Aucune vue nouvelle.** Comme ENT-9.1 : cadres par `blocs(db)`, documents par `documents(db)`, grille qui lit une autre fiche, lignes de
phrases calculées (`choix: (db) => …`, `juste: (db) => …`). À vérifier : une **ligne imposée** de phrases ne s'écrit pas en italique ni en
couleur (le moteur la montre comme une ligne fixe) ; la mention « manuscrite » se rend en italique **dans le document**, pas comme une image.

## 7 bis. Séance déjà jouée ? Non.

## 8. Tests attendus
Bloc **`chep-93`**, lignes dans `BLOCS` et `GROUPES`.
- **À la main** : les deux témoins du §6.1 (269 / 273 et 240 / 245).
- Parcours juste = 20 / 20 pour chacun ; parcours de l'un joué par l'autre ≠ 20 ; inaction = 0.
- **Pièges** : retour laissé « juste » → 1 faux ; *retirer* k → 1 faux et la ligne `chep` du témoin fausse si l'élève choisit « nous retirons » ;
  CHEP partout → 5 faux ; « palettes perdues » → 4 et 11 faux ; camion complet → 8 faux.
- **Une erreur ne se paie qu'une fois** : k retiré au lieu d'ajouté (1 faux), puis relevé cohérent avec son enquête → 6 et 7 vrais.
- Contrôle d'équité sur 200 graines (S_rel > S_parc, aucune égalité entre deux quantités d'un même jeu) ; répartition A2 / A3 entre 40 et 60 %.
- Neutralité : la réponse d'Hélène ne dit ni juste ni faux.
- **Sabotages** : écrire 269 en dur → témoin ② tombe ; juger 7 sur le réel → « erreur payée une fois » tombe ; inventaire sans la phrase entre
  parenthèses → aucun test ne doit tomber (c'est un indice, pas une donnée) : **le dire** dans le compte rendu.

## 9. Supports
- Trame courte (après validation) : un tableau « document / dans le relevé ? / correction / qui » pour le brouillon.
- Corrigé `contenus/corriges/ENT-9.3.js` : ses pièces, ses valeurs, les attendus.

## 10. Critères de validation par Tristan
L'erreur de Grégory se trouve en lisant le rapport de tri, pas par un indice qui crie ; un élève qui « donne raison » à la cliente sur tout le
voit au bilan ; la réponse honnête (solde qui **augmente** de k) est comprise ; 55 min tenues.

## 11. Décisions prises par Cowork (à corriger à l'écran si besoin)
1. L'erreur induite est celle de **Grégory** (CHEP), découverte dans le rapport de tri, comme l'erreur de Lucas en ENT-8.9.
2. L'erreur de CHEP est **en faveur** de la cliente : la séance fait corriger aussi ce qui arrange le client (honnêteté, bonne foi).
3. La ramasse n'y est qu'un geste (la séance 9.2 l'a travaillée).
4. Pas de barre « Étape suivante » ni d'encadré (entraînement).
5. La séance ne lit pas la base de 9.1 (soldes tirés à part).
6. Poids du §5 ; questions 1, 2, 3.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
