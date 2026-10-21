# Brief de séance — ENT-8.12 Action — l'inventaire tournant du matin (CAP OL, guidage CAP-C1.5)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/ENT-8.11-action-ranger.md (§0, §6), docs/briefs/MOTEUR-palettier-adresse-donnee.md (lot 4) puis docs/briefs/ENT-8.12-action-inventaire-tournant.md en entier. Le lot 4 du chantier moteur doit être livré. Fais l'état des lieux du §7, dis-moi ce qui contredit le brief, puis construis la séance. Annonce la durée avant de commencer.
> ```

**Statut** : à implémenter
**Date du brief** : 21/10/2026 ; **corrigé le 21/10/2026 au soir** d'après l'état des lieux du chantier moteur E-7 et les
décisions de Tristan (§11 n° 4).
**Conversation d'origine** : Cowork (Opus), cadrage de C1.5 chez Action, 21/10/2026 (fiche `claude/prepalog-action-cadrage-c1.5.md`).
**Modèle** : **Opus** (séance nouvelle).
**Place dans l'ordre** : après ENT-8.11. Attend les **lots 0, 1, 2 et 4** de `MOTEUR-palettier-adresse-donnee.md` (chantier E-7).
**Durée estimée par Cowork** : ≈ 3 h 30. Ce qui prend le temps : les palettes à compter (dessin, couches, écarts tirés), la fiche de signalement
calculée, les tests de l'aveugle.

---

## 0. Règles communes

**§0 d'ENT-8.11** (tout : CAP, Ensuès, Samia / Kevin / Julie, décisions de Tristan du 21/10, **décisions sur le moteur du 21/10 au soir** — charte
bleue, « Terminal » sans voix, on scanne l'emplacement avant de compter —, interdits). **Sans date** (décision de Tristan) : **le lendemain d'ENT-8.11, 6 h**, **dans la même allée**. Rien n'est lu dans la base d'ENT-8.11 : l'allée est redéclarée (même plan, stock du jour).

Écrans : **Avant de commencer → Compter (palettier, terminal) → Signaler à Samia (fiche) → Rendre compte (phrases)** → bilan.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.12 (provisoire) |
| `id` | `action-inventaire-tournant` |
| Titre / desc | « Action — l'inventaire tournant du matin » / « Compter des palettes à l'aveugle au terminal, recompter quand le nombre ne colle pas, puis signaler les écarts à la cheffe d'équipe avec une cause possible, sans corriger le stock soi-même. » |
| Rubrique | simulog, entreprise n° 8 Action |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competencesCap: ['CAP-C1.5']` ; sous-compétences C1.5.4 participer aux activités liées à l'inventaire · C1.5.3 actualiser les informations. Ligne `'ENT-8.12': 'CAP-C1.5'` dans `ATTENDU_CAP` (alerte 7). |
| Temps pédagogique | `temps: 'guidage'` |
| Notation | jalons pondérés sur 20, `parcours`, `correction`, `bilanDetail`, `precedente: 'action-ranger'` |
| Barème | `bareme: 20` |
| Niveaux d'élève | `niveauxPrevus: ['confirme', 'accompagne']` |
| `questions` | `'ENT-8.12'` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

- **Vérifié** : tout le §2 d'ENT-8.11 ; **Geodis recrutait des « inventoristes » pour Ensuès** à l'ouverture
  ([Voxlog, 15/09/2022](https://www.voxlog.fr/actualite/6626/geodis-gerera-la-logistique-daction-en-region-paca) ;
  [Supply Chain Magazine](https://www.supplychainmagazine.fr/nl/2022/3617/le-5eme-site-daction-en-france-sera-opere-par-geodis-705553.php)) ;
  **150 à 200 nouveautés par semaine** chez Action (communiqué de 2020, ENT-8.11 §2) ; **Geodis propose un robot d'inventaire, le Countbot** (mât
  stabilisé par un drone, lecture des codes-barres des palettes en hauteur, « 1 palette par seconde » annoncé)
  ([brochure Geodis](https://geodis.com/sites/default/files/2022-05/GEODIS_Countbot%20_Digital_Brochure_FR.pdf)) — **rien ne dit qu'il sert à
  Ensuès** : la question le présente comme « ce que propose Geodis ».
- **Inventaire tournant en général** (vérifié le 05/10 pour ENT-6.6, sources dans son brief §2) : on compte une partie des références à la fois,
  souvent le matin avant les flux ; causes d'écart classiques : rangement au mauvais endroit, casse non déclarée, erreur de réception.
- **Construit, dit dans la séance** : comment Geodis fait ses inventaires à Ensuès (rien de publié), le terminal, les adresses comptées, les stocks
  du système, les écarts et leurs causes.

## 3. Objectif pédagogique

L'élève **participe** à un inventaire tournant : il **scanne** l'adresse, **compte à l'aveugle** les cartons d'une palette (couches × cartons par
couche + la couche du dessus), **recompte** quand le terminal dit que ça ne colle pas, et **signale** un écart confirmé à Samia avec une **cause
possible** — sans corriger le stock lui-même. Prépare ENT-8.13 (la cause « palette rangée ailleurs »).

## 4. Déroulé (≈ 45 min)

### Accueil (Samia)

« Bonjour {prénom} ! Ce matin, avant les préparateurs, on compte 6 adresses de ton allée. Tu ne verras pas ce que dit le système : tu comptes ce que
tu vois. Samia »

### Étape 0 — Avant de commencer (non notée)

### Étape 1 — Compter (palettier, lot 4 : terminal à scanner, à l'aveugle)

- Le terminal affiche la **liste des 6 adresses** dans l'ordre de l'allée. Pour chacune : aller à l'adresse (aucune surbrillance), **scanner**,
  voir la palette dessinée, **taper le nombre de cartons**.
- Guidage : l'encadré « **Compter une palette** » ouvert (« une couche = cartons en largeur × en profondeur ; × les couches pleines ; + la couche du
  dessus ») ; le terminal rappelle « Scanne d'abord l'adresse » si l'élève tape avant.
- Compte différent du système → « Quantité différente. Recompter ou confirmer ? » (sans dire combien ni dans quel sens). « Confirmer » garde le
  compte.
- « Terminer le comptage » (actif quand les 6 sont comptées).

### Étape 2 — Signaler à Samia (fiche, documents à gauche)

- Message de Samia (`apresGeste('entrepot:<id>:fin')`) : « Pour chaque écart, dis-moi ce que tu fais, et ce qui a pu se passer. Samia »
- À gauche : **les adresses où l'élève a confirmé un compte différent du système** (`ecartsConfirmes`) : adresse, produit, **son** compte, et
  **maintenant seulement** le nombre du système.
- Fiche « Mes écarts » : **une ligne par écart confirmé** (calculée sur **ses** comptes), deux listes :
  1. « Que fais-tu ? » — **je le signale à Samia** · je corrige le stock moi-même · je ne dis rien, c'est peut-être une erreur du système.
  2. « Ce qui a pu se passer » — choix **selon le sens de son écart** : *il manque des cartons* → **des cartons abîmés retirés sans être déclarés**
     · **la palette a été mise à une autre adresse en partie** · on a livré trop au magasin · il a plu dans l'entrepôt ; *il y a des cartons en trop*
     → **des cartons d'une autre palette du même produit posés dessus** · **une réception mal saisie** · le magasin a rendu des cartons vendus · le
     système a doublé. Deux réponses justes possibles par sens (§5 : une suffit).
- Un écart **réel** que l'élève n'a pas trouvé (il a confirmé le bon nombre du système… ou s'est trompé de compte) n'apparaît pas : il a déjà
  perdu le jalon de comptage (une erreur ne se paie qu'une fois).
- Envoi : « Envoyer à Samia ».

### Étape 3 — Rendre compte (Messagerie, phrases)

- Samia (`apresFiche('ecarts')`) : « Merci. Un mot pour finir : combien d'adresses comptées, combien d'écarts ? Samia »
- Phrases calculées sur **ses** comptes (§6.3). Samia : « Merci {prénom}. Je fais vérifier. Samia »

**Mots cliquables** : inventaire tournant, à l'aveugle, écart, recompter, couche, carton, inventoriste.

## 4 bis. Questions au fil — décidées par Tristan (« on garde tout »)

`contenus/questions/ENT-8.12.js`, `part: 4`, Samia. **Comptage en cartons** (décision de Tristan, 21/10) : la question `q-colisage` reste un calcul
d'**articles**, présenté comme un exemple (un magasin qui demande combien d'articles). Les deux questions qui touchaient des jalons (`q-que-faire`,
`q-cause`) sont **placées après le geste et corrigées au bilan**, ou portent sur **un autre cas** que le sien.

| id | Geste | Question (juste en gras) | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|
| `q-pourquoi` | premier **scan** | « À Ensuès, Geodis recrute des inventoristes, et Action reçoit 150 à 200 nouveaux produits par semaine. Pourquoi compter un peu chaque jour ? » — **pour que le stock du système reste juste sans arrêter l'entrepôt** · parce que la loi l'oblige chaque matin · pour occuper l'équipe avant les camions | fil | 0,5 | tout de suite | C1.5.4 ; faits **vérifiés** |
| `q-aveugle` | premier **compte** tapé | « Le terminal ne t'a pas montré le nombre du système. Pourquoi ? » — **pour que je compte ce que je vois, sans être influencé** · parce qu'il est en panne · pour aller plus vite | fil | 0,5 | tout de suite | C1.5.4 |
| `q-colisage` | 3e adresse comptée | « Un magasin demande combien d'articles il reste : {6} cartons de {24} et un carton ouvert de {9}. » — **{153}** · {39} · {144} · {6 × 24 × 9} | fil | 0,75 | tout de suite | Calcul du colisage ; valeurs **tirées** ; dit « exemple » |
| `q-que-faire` | fiche **envoyée** | « Le système dit {160}, tu as compté {153} deux fois. Que fais-tu ? » — **je le signale à la cheffe d'équipe** · je corrige le stock du système · je recompte jusqu'à trouver {160} | fil | 0,75 | **au bilan** | C1.5.4 « participer » ; valeurs tirées, **pas** son écart |
| `q-cause` | fiche **envoyée** | « Sur une autre adresse, il y a {2} cartons de trop. Qu'est-ce qui a pu se passer ? » — **des cartons d'une autre palette du même produit posés là** · des cartons volés · le carton s'est multiplié | fil | 0,75 | **au bilan** | C1.5.3 ; un autre cas que le sien, sens tiré ; prépare ENT-8.13 |
| `q-argent` | **éco-droit** — message à Samia **envoyé** | « Pour Action, un écart de stock, c'est quoi ? » — **de l'argent : des produits payés qu'on ne peut plus vendre, ou qu'on croit avoir** · rien, c'est juste un chiffre · une amende | fil | 0,75 | tout de suite | Le stock vaut de l'argent |
| `q-robot` | **innovation** (C3.6 en fil rouge) — fin | « Geodis propose un robot qui compte les palettes en hauteur. Qu'est-ce que ça change pour l'inventoriste ? » — « Moins de comptages en hauteur, plus de vérifications des écarts » · « Plus besoin de personne » · « Rien » · « Je ne sais pas » | fil | **réflexion** | tout de suite | Culture (non notée, règle du modèle) ; **dit « ce que propose Geodis », pas ce qui se fait à Ensuès** |

- Somme notée : 0,5 + 0,5 + 0,75 + 0,75 + 0,75 + 0,75 = **4**.
- **Retours proposés** : `q-pourquoi` « Un peu chaque jour : le stock reste juste et l'entrepôt continue de tourner. » · `q-aveugle` « Si tu vois le
  chiffre, tu risques de le trouver même s'il est faux. » · `q-colisage` « 6 × 24 = 144, plus 9 : 153 articles. » · `q-que-faire` « Tu comptes, tu
  signales ; c'est la cheffe qui décide de corriger. » · `q-cause` « Des cartons en trop viennent souvent d'une palette voisine. » · `q-argent` « Un
  carton perdu, c'est un carton payé et jamais vendu. » · `q-robot` « Le robot compte ; quelqu'un doit encore chercher pourquoi ça ne colle pas. »

## 4 ter. Avant de commencer — notions validées, banque complétée par Cowork

Tirage **3 préparation + 1 image**, non notées.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `k-tournant` | préparation | Un inventaire tournant, c'est… | compter une partie du stock à la fois, souvent | compter tout le stock une fois par an · faire tourner les palettes | — | ★ |
| `k-annuel` | préparation | L'inventaire annuel, c'est… | compter tout le stock, une fois par an | compter une allée chaque matin · compter les camions | — | |
| `k-aveugle` | préparation | Compter à l'aveugle, c'est… | compter sans voir le nombre du système | compter les yeux fermés · compter dans le noir | — | ★ |
| `k-ecart` | préparation | Un écart, c'est… | la différence entre ce qu'on compte et ce que dit le système | une palette mal filmée · un retard de camion | — | ★ |
| `k-recompte` | préparation | Quand le compte ne colle pas, on… | recompte, puis on signale si ça ne colle toujours pas | corrige le système tout de suite · jette la palette | — | ★ |
| `k-couche` | préparation | Une palette de {c} couches pleines de {k} cartons a… | {c × k} cartons | {c + k} · {c × k + k} | dessin (cartons en perspective) | ★ |
| `k-par-carton` | préparation | « Carton de 12 » sur l'étiquette veut dire… | 12 articles dans le carton | 12 kg · 12 cartons sur la palette | étiquette de carton dessinée | ★ |
| `k-inventoriste` | préparation | L'inventoriste, c'est… | la personne qui compte le stock | le chauffeur · le comptable du magasin | — | |
| `img-couche-dessus` | image | Sur cette palette, la couche du dessus est… | incomplète : il manque des cartons | pleine · vide | dessin | ★ |
| `img-etiquette-lisse` | image | Cette étiquette sur la poutre du rack donne… | l'adresse de l'emplacement | le prix du produit · le nom du cariste | dessin (ENT-8.11) | |

## 5. Jalons / notation (sur 20) — poids validés par Tristan (21/10/2026)

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Scanner avant de compter** | aucun compte tapé sans scan de la bonne adresse | **2** | `scanAvant` (lot 4) | **faux si rien n'est compté** (inaction) |
| **Comptages justes** | les 6 adresses, **par rang** dans la liste (`compte-1` … `compte-6`), **5/6 de point chacune** (option (a) de Tristan, 21/10) | **5** | `compte-1` … `compte-6` | dernier compte confirmé = réel ; les ids ne dépendent jamais de l'adresse tirée (la liste des jalons d'une séance est fixe) |
| **Recompter quand ça ne colle pas** | les **2 adresses à écart réel**, 1,5 chacune | **3** | `recompte-manque`, `recompte-surplus` (ids fixes **par rôle** : §11 n° 1) | **règle unique (décision de Tristan, 21/10 au soir), jamais « à faire » après le comptage** : adresse non comptée → faux ; recomptage proposé et fait → juste ; proposé, confirmé sans recompter → faux ; rien proposé (premier compte = système) → juste (l'erreur se paie au jalon `compte-`) |
| **Signaler sans corriger soi-même** | « je le signale à Samia » sur chaque ligne de **sa** fiche, 1,5 × 2 | **3** | fiche `ecarts`, ligne 1 | jugé sur **ses** écarts confirmés ; une fiche sans ligne (aucun écart confirmé) → faux (il n'a rien trouvé) |
| **Une cause possible** | ligne 2 juste (l'une des deux réponses justes du sens), 1 × 2 | **2** | fiche `ecarts`, ligne 2 | idem |
| **Les questions de Samia** | `q-pourquoi` 0,5 · `q-aveugle` 0,5 · `q-colisage` 0,75 · `q-que-faire` 0,75 · `q-cause` 0,75 · `q-argent` 0,75 | **4** | moteur des questions | `q-robot` non notée |
| **Forme du compte rendu** | salutation et fin justes | **1** | phrases | 5 % |
| **Total** | | **20** | | |

- Les lignes « adresses comptées » et « écarts » du compte rendu sont **calculées sur ses comptes** et non notées à part (une erreur ne se paie
  qu'une fois).
- **Corriger** : `'fiche:ecarts'`, `'phrases:samia'` ; **pas le comptage** (figé à « Terminer », comme le terminal d'ENT-6.6).

## 6. Contenu (données)

`contenus/action-ent812.js` (+ `-donnees.js`), `contenus/questions/ENT-8.12.js`, `activites/action-inventaire-tournant.js`,
`contenus/corriges/ENT-8.12.js`. L'allée et les produits **importés** d'ENT-8.11 (`contenus/action-ent811-donnees.js`), stock du jour redéclaré.

### 6.1 Les 6 adresses à compter (tirées, §6 bis)

| Rôle | Nombre | Format | Ce qui doit être vrai |
|---|---|---|---|
| conformes | 4 | couches pleines + couche du dessus incomplète | réel = système |
| **manque** | 1 | couche du dessus avec {2 à 4} cartons de moins que le système | réel < système |
| **surplus** | 1 | {1 à 3} cartons **posés sur** la couche du dessus | réel > système |

- Toutes au **niveau 1 ou 2** (lisibles de près) ; 3 à 5 couches ; couches de 2 × 3, 3 × 3, 2 × 4 cartons ; produits du §6.2 d'ENT-8.11.
- **Le nombre du système n'est jamais dans le DOM avant la fiche** (testé).

### 6.2 Les phrases du compte rendu (calculées)

| Ligne | Juste | Pièges |
|---|---|---|
| salutation | « Bonjour Samia, » | « Salut, » · « Hé Samia ! » |
| bilan | « 6 adresses comptées, {n} écart(s) signalé(s) dans la fiche. » (n = **ses** écarts confirmés) | un autre nombre · « Tout est bon. » quand n > 0 |
| fin | « {prénom} » | « À plus » · « Bisous » |

## 6 bis. Tirage et niveaux

- 6 adresses tirées parmi une banque de **12** (rôles du §6.1 respectés) ; écarts tirés (manque 2-4, surplus 1-3) ; 200 graines (chaque rôle
  à des adresses variées ; aucun secours).
- **Confirmé** : une **7e adresse** en bonus, avec un **second manque** (jalons `compte-7` et `recompte-bonus` en `bonus: true`) ; consigne identique.
- **Accompagné** : l'encadré « Compter une palette » montre, **pour la palette ouverte**, le nombre de cartons par couche (« 3 × 3 = 9 par couche »)
  — pas le total.
- **Consigne neutre** : « Compte les adresses de la liste » (ne dit pas qu'il y a des écarts).

## 7. Demandes au moteur

**Chantier `MOTEUR-palettier-adresse-donnee.md`, lot 4** (comptage en palettier, terminal à scanner, à l'aveugle, recomptage, `ecartsConfirmes`). À
vérifier à l'état des lieux : la **fiche calculée** (une ligne par écart confirmé, choix de la ligne 2 selon le sens) est faisable avec la vue Fiche
existante (`liste` par ligne, contenu calculé à l'ouverture) ; sinon, demande au lot 4.

### 7 bis. Séance déjà jouée ? Non.

## 8. Tests attendus

Bloc `action-812` (alerte 7).

- Parcours juste (deux témoins) : 20/20 ; inaction : 0/20.
- **Aveugle** : le nombre du système d'aucune adresse n'est dans la page avant l'ouverture de la fiche.
- Un compte faux confirmé sur une adresse conforme → `compte-` ✗ ; elle apparaît dans la fiche (écart confirmé), sa ligne « je le signale » reste
  ✓ (une erreur ne se paie qu'une fois), sa cause est jugée **selon le sens de son écart**.
- Écart réel trouvé du premier coup puis « Confirmer » sans recompter → `recompte-<rôle>` ✗ (le terminal l'a proposé) ; trouvé, « Recompter », même
  nombre, « Confirmer » → ✓ ; adresse à écart non comptée → ✗ ; aucun jalon ne reste « à faire » après « Terminer le comptage ».
- « Je corrige le stock moi-même » → ✗ sur cette ligne.
- `q-que-faire` et `q-cause` au bilan ; somme 20 ; `part` 4.
- Sabotages : fiche jugée contre les écarts **réels** au lieu de **ses** écarts confirmés → le cas « une erreur ne se paie qu'une fois » tombe ;
  système affiché dans la fiche de comptage → le cas « aveugle » tombe.

## 9. Supports

Trame (Cowork, après validation) : **cours** d'une demi-page, noir et blanc — « Compter une palette » (dessin : couches, couche du dessus), « À
l'aveugle », « Écart : recompter, puis signaler ». Corrigé : `contenus/corriges/ENT-8.12.js`.

## 10. Critères de validation par Tristan

- Les cartons se comptent sur le dessin sans hésiter (couche du dessus nette) ; le carton en trop se voit.
- « Recompter ou confirmer ? » ne trahit rien.
- La fiche ne montre que **ses** écarts.

## 11. Questions ouvertes et décisions de Cowork

1. **Règle du recompte : tranchée par Tristan (21/10 au soir)**, celle de l'état des lieux §C (voir §5) ; poids **non rééquilibrés** (limite connue :
   sur une adresse à écart, l'élève qui compte faux en tombant pile sur le système gagne `recompte` mais perd `compte`). **Ids** : les comptes vont
   **par rang** (`compte-1` … `compte-6`) ; le recompte, lui, ne porte de poids que sur les **deux adresses à écart**, dont le rang est tiré : Cowork
   les nomme **par rôle** (`recompte-manque`, `recompte-surplus`, liste fixe, comme le proposait l'état des lieux §A). Le moteur peut aussi rendre
   `recompte-1` … `recompte-6` sans poids : la séance n'en pèse que les deux rôles. À confirmer à la construction.
2. **Tranché par Tristan (21/10, 18 h 08) : option (a)**, 6 comptages à **5/6 de point** chacun (somme 5, poids validés gardés). Si le moteur
   refuse ces décimales (somme contrôlée à 20), le dire à Tristan avant de changer quoi que ce soit.
3. Textes de Cowork (Samia, questions, retours, fiche, phrases) : à relire à l'écran.
4. **Corrections du 21/10/2026 au soir** (état des lieux E-7) : ids des jalons par rang (ou par rôle pour le recompte), règle unique du recompte,
   lots 0, 1, 2, 4 ; « Terminal » sans voix ; charte bleue.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
