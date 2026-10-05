# Brief de séance — ENT-6.6 France Boissons, inventaire tournant à la voix (2de, poste C — préparateur, guidage C1.6)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/EN-COURS.md puis docs/briefs/ENT-6.6-france-boissons-inventaire.md. Commence par l'état des lieux des demandes au moteur du §7 (lecture seule) : dis-moi ce qui existe déjà (mode stockage de masse, écran Inventaire, fiche à remplir) et propose un découpage en lots. N'implémente la séance qu'une fois les demandes livrées. Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 05/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiches projet `claude/prepalog-2de-s2-deroule.md` (décisions 38 à 41) et
`claude/prepalog-2de-s2-cadrage.md` (décision 7). Modèles : **ENT-6.5** (vue 3D du stockage de masse, même plan) et **ENT-2.2 / 2.3
Cdiscount** (écran Inventaire, décisions par ligne), au niveau **guidage** (2de, premier temps de C1.6).
Règles d'écriture 2de : `claude/prepalog-2de-eleve-debut-annee.md` (3 lignes par bloc, une consigne par écran).
**Modèle** : Opus (séance nouvelle, une vue nouvelle du moteur : le terminal vocal). Sonnet suffit pour la fiche de compte rendu.

**Maquettes de référence** : `docs/briefs/france-boissons/maquette-6.5-stockage-masse.html` (plan, couloir ouvert, palettes de
rétention). Pas de maquette du terminal vocal à ce jour (question ouverte §11).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-6.6 |
| `id` (jamais modifié ensuite) | `france-boissons-inventaire` |
| Titre / desc | « France Boissons — inventaire tournant » / « Préparateur à la plateforme de Buchelay : compter les fûts à l'aveugle avec le terminal vocal, trouver les écarts et leur cause, décider, puis rendre compte à la cheffe de quai. » |
| Rubrique | simulog, entreprise n° 6 France Boissons |
| Niveau(x) | 2de |
| Compétence(s) | **C1.6** (suivre les stocks, inventaire ; analyser et corriger les écarts) ; domaines D2 (préparer l'inventaire), D3 (supports consignés : suivre les retours), D5 (analyser et corriger les écarts de stock) |
| Temps pédagogique | **guidage** de C1.6 (premier et seul temps en 2de : « découvert », repris en 1re avec Cdiscount — règle 15 du cadrage) |
| Notation | jalons + note sur 20 |
| Barème | 10 |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié (05/10)** : France Boissons utilise un WMS (Manhattan Associates) et la **préparation à la voix** (Vocollect), déployés à
  partir de 2014 ([FAQ Logistique, 18/02/2014](https://www.faq-logistique.com/CP20140218-Manhattan-Associates-France-Boissons-WMS.htm)) ;
  préparation vocale toujours citée par le site de l'entreprise ([france-boissons.fr](https://www.france-boissons.fr/nos-expertises/une-logistique-performante-au-service-du-client/)).
- **Non trouvé** : comment France Boissons fait ses inventaires (à la voix, au terminal, sur papier). **L'inventaire guidé par le
  terminal vocal est donc construit** et l'écran le dit (« Dans cet exercice, le terminal vocal sert aussi à compter »). Le **code
  de contrôle** lu à l'emplacement est le principe général du guidage vocal (prouver qu'on est au bon endroit), non vérifié chez
  France Boissons.
- **Vérifié (05/10), inventaire tournant en général** : on compte une partie des références à la fois, souvent le matin avant les
  flux ; classement A / B / C (A comptées chaque mois, B chaque trimestre, C une fois par an) ; **taux de fiabilité = lignes exactes ÷
  lignes contrôlées × 100** ; causes d'écart classiques : rangement au mauvais endroit, casse non déclarée, lot inversé, retours mal
  saisis ([Generix](https://www.generixgroup.com/fr/blog/calcul-inventaire-tournant-abc-fiabilite-stock),
  [Supply Chain Insiders](https://www.supply-chain-insiders.com/inventaire-tournant-fiabiliser-les-stocks-sans-bloquer-les-operations),
  [Orisha](https://distribution.orisha.com/blog/logistique/negoce-boisson-inventaire-tournant/)).
- **Vérifié (05/10), consigne** : **arrêté du 6 février 2026** (JO du 26/02/2026), en vigueur le **1er janvier 2027** : **40 € par fût
  de 20 à 50 L**, 4 € par casier, palette 13,50 € ([FNB](https://www.fnb-info.fr/actualites/economie/consignation-des-emballages-dans-le-secteur-des-boissons-%C2%A0-%C2%A0),
  [L'Officiel des métiers](https://www.lofficieldesmetiers.fr/consigne-des-emballages-ce-qui-va-changer-a-partir-du-1er-janvier-2027/) ;
  texte de l'arrêté non relu, Légifrance bloqué). Décision 38 : montants valables pour toute la S2.
- **Vérifié (05/10), réemploi** : environ **3 millions de fûts** en France, **53,5 utilisations en moyenne sur 15 ans** ; le
  distributeur reprend les vides dans les mêmes camions ([Conseil national de l'emballage](https://conseil-emballage.org/wp-content/uploads/2016/04/Emballages-et-Consigne_Fr.pdf),
  **chiffres de 2014** : à dire comme tels).
- **Construit (annoncé comme tel)** : le plan (celui d'ENT-6.5), les codes de contrôle, le stock théorique, les trois écarts et leurs
  causes, l'heure, les couloirs à compter.
- **Dessins** : 3D isométrique comme ENT-6.5, **sans visage**. Légende : « Dessin — scène construite, ce n'est pas la plateforme de
  Buchelay. »

## 3. Objectif pédagogique

L'élève découvre **l'inventaire tournant** : on compte **à l'aveugle** une partie du stock, on compare au stock du logiciel, et **un
écart n'est pas une erreur de calcul à effacer mais un signal** dont on cherche la cause avant de décider : remettre une palette à sa
place (pas de régularisation), régulariser une casse avec son motif, ou signaler des vides manquants (de l'argent et des emballages
réemployables perdus). Il termine par un indicateur simple, le **taux de fiabilité**.
Fil rouge : on compte **ce qui part vendredi** (les fûts de Malo, ENT-6.2) et **les vides** (repris vendredi chez Malo, ENT-6.10) ;
l'élève découvre le **terminal vocal** qu'il utilisera cet après-midi pour préparer la commande de Malo (ENT-6.7).

## 4. Déroulé (≈ 50 min)

**Date : jeudi 17 juin 2027, 7 h** (calendrier de S2, décision 31). L'élève joue **son propre rôle**, en renfort.

1. **Message de Nadia, cheffe de quai** (3 blocs) : « Bonjour {prénom} ! / Avant le week-end de la Fête, on compte ce qui part
   demain chez nos clients, et les vides. / Prends le terminal vocal : il te dit où aller. Ne regarde pas le stock du logiciel, compte
   ce que tu vois. Nadia »

### Étape 0 — Le matériel du poste (≈ 3 min, non notée)

Un écran, un dessin 3D iso, 3 blocs, « Suivant » (même brique qu'ENT-6.5, étape 0) :
« Le **terminal vocal** se porte à la ceinture, avec un **casque** et un **micro**. / Il te dit où aller et ce qu'il faut faire ; tu
réponds à voix haute. Tes mains et tes yeux restent libres. / Ici, tu tapes tes réponses au clavier. Dans cet exercice, le terminal
sert aussi à compter. »
Dessin : **à fournir par Cowork** en SVG (`docs/briefs/france-boissons/materiel-terminal-vocal.svg`).

### Étape 1 — Compter avec le terminal vocal (≈ 20 min, 5 jalons)

Vue **Plan d'entrepôt, mode stockage de masse** (ENT-6.5), **sous-mode comptage** (§7.1), avec le **terminal vocal** à côté (§7.2).
Consigne d'une ligne : « Écoute (ou lis) le terminal, va au couloir, compte, réponds. »

**Dialogue du terminal, pour chaque ligne de la liste** (texte toujours affiché ; son selon le réglage de l'enseignant, §7.2) :
1. « Couloir M04. Code de contrôle ? » → l'élève lit le **code à 2 chiffres** écrit sur le **panneau du couloir** (mur du fond) et le
   tape. Code faux : « Code faux. Vérifie le couloir. » (le terminal redemande ; **trace** visible de l'enseignant, **non notée**).
2. « Pelforth Blonde 20 litres. Lot S19. Combien de fûts ? » → l'élève ouvre le couloir en 3D, compte, tape un **nombre**.
3. « Compris : 4. » puis la ligne suivante. Bouton « Répète » (redit la dernière phrase). Pas de retour sur une ligne validée.

- **À l'aveugle** : la quantité du logiciel n'apparaît **nulle part** (ni dans le terminal, ni sur les étiquettes, ni dans un KPI
  d'accueil — voir la fuite d'ENT-2.2 : `kpis: ['mail']`).
- **Compter une pile** : encadré « Compter les fûts » (3 lignes) : « Une palette pleine = 4 fûts. / Compte les palettes de chaque
  pile, puis regarde s'il manque des fûts sur une palette. / Ne compte que la référence demandée. »
- **Palettes incomplètes** : toujours **au sommet** d'une pile (on ne gerbe pas sur une palette incomplète) ; les places vides se
  voient sur le dessin.
- **Zone litiges** : visible et cliquable sur le plan ; elle montre **deux** fûts sur leur palette de rétention : l'Affligem qui fuit
  (étiquette « Réception 16/06 — fuit », connu depuis ENT-6.4) et **un fût Heineken 30 L percé** (étiquette « Percé par une fourche —
  16/06, 19 h »). C'est l'indice de l'écart M01.
- **Hors liste** : tout couloir s'ouvre ; compter un couloir hors liste n'est pas possible depuis le terminal (il impose l'ordre de sa
  liste) — rien à tracer.

**Liste du terminal (7 lignes, dans cet ordre) et stock** (construit ; position 1 = fond ; une palette pleine = 4 fûts) :

| # | Couloir · code | Référence, lot | Ce qu'on voit (réel) | Théorique (logiciel) | Réel | Cause (construite) |
|---|---|---|---|---|---|---|
| 1 | M01 · 47 | Heineken 30 L, S20 | pile 1 : 4 + 4 ; pile 2 : 4 + **3** (une place vide au sommet) | 16 | **15** | fût percé hier 19 h, posé en zone litiges, **casse non saisie** |
| 2 | M02 · 82 | Heineken 30 L, S24 | pos. 1 : Heineken S24 (4) **et, posée dessus, une palette Pelforth S19 (4)** | 4 | **4** | conforme… **mais** la Pelforth posée dessus ne se compte pas ici |
| 3 | M03 · 15 | Pelforth 20 L, S24 | pile 1 : 4 + 4 + 4 ; pile 2 : 4 + 4 | 20 | 20 | conforme |
| 4 | M04 · 63 | Pelforth 20 L, S19 | pos. 1 : une seule palette (4) | 8 | **4** | la 2e palette a été **remise au mauvais couloir** hier soir (en M02, ligne 2) |
| 5 | M05 · 29 | Affligem 20 L, S18 | pos. 1 : une palette de 2 | 2 | 2 | conforme |
| 6 | M06 · 54 | Affligem 20 L, S24 | pos. 1 : une palette de 3 | 3 | 3 | conforme (le 4e fût est en litiges depuis ENT-6.4) |
| 7 | M08 · 91 | **Fûts vides** (retours clients) | pile 1 : 4 + 4 + 3 ; pile 2 : 4 + 2 ; pile 3 : 2 | 22 | **19** | **3 vides manquants** (cause inconnue à ce stade : reprise mal comptée ?) |

Stock du soir d'ENT-6.5 avec les palettes rangées à leur **bonne place** (chaque séance repart d'un dossier propre) : P1 en M02, P2 sur
la pile de 1 de M03, P3 en M06, P4 en M07. M07 (Edelweiss, 27) **n'est pas compté** (pas dans la commande de vendredi). **Écarts
réels : M01 −1 · M04 −4 · M08 −3 ; conformes : M02, M03, M05, M06.**

### Étape 2 — Écarts et décisions (≈ 15 min, 3 jalons)

**Écran Inventaire** existant (celui de Cdiscount ENT-2.2 / 2.3, `claude/prepalog-inventaire-format.md`), alimenté par les comptages
du terminal (§7.3) : comptage **non modifiable** ; le théorique apparaît **seulement maintenant** ; **colonne écart à remplir par
l'élève** (écart = compté − théorique, mode `ecarts: 'eleve'`) ; puis une **décision par ligne en écart** :

| Ligne | Décision attendue | Pièges |
|---|---|---|
| M01 −1 | **Régulariser −1, motif « Casse »** (indice : la zone litiges) | « Remettre en place » ; régulariser sans motif |
| M04 −4 | **Ne pas régulariser : remettre la palette en M04** (`'rayon'`, libellé « Remettre en place ») — elle est en M02 | régulariser −4 (le stock deviendrait faux de 4 quand on retrouvera la palette) |
| M08 −3 | **Régulariser −3, motif « Vides manquants »** et le signaler (étape 3) | ne rien faire |

Encadré « Avant de corriger » (3 lignes) : « Un écart, c'est un signal. / Cherche d'abord **pourquoi** : une palette ailleurs ? un fût
cassé ? / On ne corrige le stock que si les fûts ont vraiment disparu. »

### Étape 3 — Les vides, la fiabilité, le compte rendu (≈ 10 min, 2 jalons)

1. **Encadré « Pourquoi on compte les vides »** (RSE, décision 40) : « Un fût vide n'est pas un déchet : il retourne à la brasserie,
   il est lavé et rempli de nouveau, une cinquantaine de fois en 15 ans. C'est du **réemploi**. / Chaque fût vide vaut aussi
   **40 € de consigne**. Un vide perdu, c'est de l'argent perdu et un fût à refabriquer. »
2. **Fiche « Compte rendu d'inventaire — jeudi 17 juin »** (fiche à remplir existante, cases « nombre ») :
   - Écart sur les vides : [nombre] fûts × 40 € = [nombre] € ;
   - Taux de fiabilité : [nombre] lignes justes ÷ 7 lignes comptées × 100 = [nombre] % (arrondi à l'unité). Encadré (3 lignes) :
     « Une ligne est juste quand le compté = le théorique. / Taux = lignes justes ÷ lignes comptées × 100. / Plus il est proche de
     100 %, plus on peut croire le logiciel. »
   - Envoi : « Envoyer à Nadia ». Rien n'est jugé avant l'envoi ; fiche figée ensuite.
3. **Réponse de Nadia** (ne dit pas si c'était juste) : « Merci {prénom}. Je préviens Karim pour les vides : on vérifiera les bons de
   reprise de la semaine. Cet après-midi, tu prépares la commande de Malo avec le même terminal. Nadia » Transition vers ENT-6.7.

Mots cliquables : inventaire, inventaire tournant, compter à l'aveugle, stock théorique, écart, régulariser, motif, zone litiges,
fût vide, consigne, réemploi, taux de fiabilité, terminal vocal, code de contrôle.

## 5. Jalons / notation (10)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1 | M01 compté **15** | terminal (§7.2) | 16 (palette du dessus supposée pleine) ; 17 (fût des litiges ajouté) |
| 2 | M02 compté **4** | idem | 8 (la Pelforth posée dessus comptée comme de la Heineken) |
| 3 | M04 compté **4** | idem | 8 (stock supposé) |
| 4 | M08 compté **19** | idem | 22, 24 (palettes supposées pleines) |
| 5 | M03 **20**, M05 **2**, M06 **3** tous justes | idem | un seul faux = faux |
| 6 | Les 7 écarts calculés justes (**écart = compté de l'élève − théorique**) | écran Inventaire | écarts non saisis = faux |
| 7 | M04 : **remettre en place**, pas de régularisation | idem | décision absente = faux |
| 8 | M01 : **régulariser −1, motif Casse** | idem | autre motif = faux |
| 9 | Vides : **écart des vides de l'élève × 40 €** (attendu 120 € avec un comptage juste) | fiche envoyée | fiche non envoyée = faux |
| 10 | Taux de fiabilité : **lignes justes de l'élève ÷ 7 × 100**, arrondi à l'unité (attendu **57 %** avec un comptage juste) | idem | idem |

**Pas de double peine** : les jalons 6, 9 et 10 se calculent sur **les comptages de l'élève**, pas sur la bonne réponse (même règle
qu'ENT-6.5, jalons 7 à 10). La décision sur les vides (régulariser, motif « Vides manquants ») est **attendue mais non notée à part**
(la valeur en euros la porte). Le code de contrôle n'est **pas noté** (trace seulement). **Le jalon 5 ne récompense pas l'inaction** :
lignes non comptées = faux. Valeurs attendues **calculées** depuis les données, jamais recopiées ; dans les tests, écrites à la main.

## 6. Contenu

`contenus/france-boissons-ent66.js` (écran matériel, liste du terminal et codes de contrôle, plan et stock du jeudi 7 h, zone litiges
et étiquettes, inventaire, fiche de compte rendu, messages) ; univers dans `contenus/france-boissons.js` (Nadia, références). Plan de
masse **repris d'ENT-6.5** (ne pas le redéclarer s'il peut être partagé dans `france-boissons.js`). Dessin : `contenus/images/france-boissons/`.

## 7. Demandes au moteur

1. **Plan d'entrepôt, mode stockage de masse : sous-mode « comptage »** (prolonge le mode masse d'ENT-6.5 et reprend les règles du
   lot 3 « comptage » de `MOTEUR-vue-plan-entrepot.md` : à l'aveugle, sans surbrillance) :
   - couloir ouvert en 3D **sans palette en main** : on regarde, on ne déplace rien ; **palettes incomplètes dessinées** (places vides
     visibles au sommet d'une pile) ; **référence et lot sur l'étiquette au sommet de chaque palette** (jamais une quantité) ;
   - **panneau de couloir avec son code de contrôle** (2 chiffres, déclaré par le contenu) ;
   - **zone litiges cliquable** avec les étiquettes déclarées ;
   - une palette d'une autre référence posée sur une pile (ligne 2) : dessin de **deux étiquettes différentes** dans la même pile.
2. **Terminal vocal** (vue nouvelle, **commune avec ENT-6.7** préparation vocale ; à construire une fois) :
   - panneau à côté de la vue (ou en bas), qui **dit** une phrase à la fois : annonce, demande de **code de contrôle** (refus si faux,
     trace), question, **réponse au clavier** (nombre ou code), « Compris : n », « Répète » ; liste **déclarée par le contenu** et
     ordre imposé ; état lu par les jalons (comptage par ligne) ;
   - **texte toujours affiché** ;
   - **son : réglage de l'enseignant seulement** (décision 41 de Tristan : « le réglage son doit venir de moi, sinon les élèves vont
     tous avoir le son sans casque ») — par groupe, dans « Conduite de séance », **coupé par défaut**. Son activé : l'élève peut
     **couper** pour lui, jamais activer. Voix : **synthèse vocale du navigateur avec les seules voix installées sur le poste**
     (`speechSynthesis`, voix `localService === true`, langue `fr`) — aucune requête réseau (règle du dépôt) ; pas de voix locale
     française → texte seul, sans message d'erreur à l'élève ;
   - en 6.7, la même vue servira à la préparation (lignes une à une, code de contrôle, quantité prélevée).
3. **Comptages → écran Inventaire** : l'écran Inventaire reçoit les comptages du terminal (saisie non modifiable), théorique affiché
   après le comptage, écarts saisis par l'élève, décisions `regul` / `rayon` (libellé « Remettre en place » ici) ; vérifier à l'état
   des lieux si le mode `physique` ou `releve` s'y prête, sinon ajouter une source « comptages d'une autre vue ».
4. **Fiche à remplir** : cases « nombre » (demandées en ENT-6.2) ; jalons qui **calculent l'attendu depuis l'état de l'élève**
   (écart des vides compté par l'élève × 40 ; lignes justes de l'élève ÷ 7).
5. **Écran « matériel du poste »** : la même brique qu'ENT-6.5 (étape 0).

Ce que la séance réutilise tel quel : messages d'accueil et `apresFiche`, documents joints, mots cliquables, encadrés.
**Ordre** : mode masse (ENT-6.5) → sous-mode comptage → terminal vocal → séance. Un seul chantier moteur à la fois.

## 8. Tests attendus

Bloc `france-boissons` : parcours juste 10/10 (comptages 15 · 4 · 20 · 4 · 2 · 3 · 19 ; écarts −1 · 0 · 0 · −4 · 0 · 0 · −3 ; M01
régul −1 Casse ; M04 remettre en place ; vides régul −3 ; fiche 120 € et 57 %) ; inaction 0/10 ; M01 compté 16 → jalon 1 faux,
**jalon 6 juste si l'écart saisi est 0**, jalon 10 juste si l'élève écrit 71 % (5 ÷ 7) ; M02 compté 8 → jalon 2 faux ; M08 compté 22 →
jalon 4 faux, jalon 9 juste si l'élève écrit 0 € ; M04 régularisé −4 → jalon 7 faux ; M01 « remettre en place » → jalon 8 faux ;
code de contrôle faux → redemandé, **aucun jalon perdu**, trace présente ; **aucune quantité théorique dans le DOM avant la fin du
comptage** (test de fuite, KPI compris) ; son coupé par défaut ; groupe « son activé » → l'élève voit « Couper le son » mais aucun
bouton pour l'activer s'il est coupé par l'enseignant ; aucune requête hors du domaine (voix locale) ; fiche non envoyée → jalons 9
et 10 faux ; sabotage par jalon.

## 9. Supports

- Trame courte (contexte ; lexique : inventaire tournant, à l'aveugle, écart, régulariser, consigne, réemploi ; tableau de comptage à
  compléter sur papier ; calcul du taux) : Cowork, **après validation à l'écran**. La trame dit **le réel** (préparation vocale
  vérifiée chez France Boissons, inventaire à la voix construit ; 4 fûts par palette = règle de l'exercice ; montant de consigne de
  l'arrêté de 2026 ; chiffres de réemploi de 2014).
- **Question d'éco-droit (RSE, module 3, non notée)** dans la trame, décision 40 : « Pourquoi France Boissons a-t-elle intérêt à
  récupérer tous ses fûts vides ? Donne une raison économique et une raison environnementale. »
- Corrigé `contenus/corriges/ENT-6.6.js` : comptages, écarts, décisions, fiche ; calculé.
- **Question « Pour réfléchir »** (règle 32 ; une seule, valeur par défaut) : « Le fût percé n'avait pas été saisi : combien de fûts
  de Heineken le logiciel promettait-il pour vendredi, et qui s'en serait aperçu en premier ? »

## 10. Critères de validation par Tristan

Un élève de 2de compte une pile sans aide en 3D (palette du dessus incomplète comprise) ; rien ne laisse voir le stock du logiciel
avant la fin du comptage ; le terminal se comprend **sans son** ; le son ne démarre jamais sans le réglage de l'enseignant ; l'écart de
M04 se résout en trouvant la palette en M02, pas en corrigeant le stock ; la séance tient en 50 min.

## 11. Questions ouvertes (valeur par défaut entre parenthèses)

- [x] Montants de consigne 2027 : 40 € le fût, 4 € le casier (Tristan, 05/10, décision 38).
- [x] Comptage dans la 3D puis écran Inventaire ; terminal vocal dès 6.6 ; code de contrôle ; vides comptés à part avec leur valeur ;
  périmètre = fûts de Malo + vides ; 3 écarts, 3 causes ; taux de fiabilité (Tristan, 05/10, décision 39).
- [x] RSE : fil léger sur 6.6, 6.8, 6.10, questions d'éco-droit non notées (Tristan, 05/10, décision 40).
- [x] Son : deux modes, réglé par l'enseignant seul, coupé par défaut (Tristan, 05/10, décision 41).
- [ ] Maquette cliquable du terminal vocal avant le brief moteur (défaut : oui, Cowork la fabrique avec l'écran 6.7).
- [ ] Vides : « recompter » avant de régulariser (défaut : non, une seule décision « régulariser, Vides manquants » en 2de).
- [ ] Codes de contrôle à 2 chiffres (défaut : oui, valeurs construites ci-dessus).
- [ ] Question « Pour réfléchir » (défaut : celle du §9).
- [ ] Dessin du terminal vocal (défaut : Cowork le fournit avant l'implémentation de la séance).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
