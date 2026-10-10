# Brief de séance — ENT-2.3 Cdiscount « Inventaire tournant » (recadrage)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-cdiscount.md, docs/EN-COURS.md, puis implémente le brief docs/briefs/ENT-2.3-inventaire-recadre.md : d'abord le lot moteur du §7 (écran Inventaire, commité à part), puis la séance. Annonce la durée, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
> ```

**Statut** : livré (04/10/2026), fermé aux élèves (`ouverture: 'prof'`).
**Date du brief** : 03/10/2026
**Modèle** : Sonnet — **Durée estimée par Cowork** : 2 à 3 h (lot moteur 45 min à 1 h, séance et tests 1 h 30 à 2 h).
**Touche le moteur** : **oui pour le lot 0** (`core/types/inventaire.js`, `outils/test/inventaire.mjs`) → s'inscrire
dans `docs/EN-COURS.md` comme chantier moteur, commiter ce lot à part, puis la séance.
**Conception** : `claude/prepalog-cdiscount-serie-decisions.md` (décisions 1, 2, 8) ; fil rouge
`claude/prepalog-cdiscount-recadrage.md` ; format de l'inventaire `claude/prepalog-inventaire-format.md`.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-2.3 / `cdiscount-inventaire` (**id inchangé** ; code déjà changé en C3) |
| Titre | « Cdiscount — inventaire tournant » (inchangé) |
| desc | « Recompter les références qu'on a choisies, calculer les écarts, retrouver leur cause, décider et valider l'inventaire. » |
| Niveau / compétence | 1re / C1.6 (C1.6.2 inventaire) |
| Temps | entraînement (inchangé) |
| Notation | `avancement`, **5 jalons inchangés** |
| Volume | 8 références dans l'allée, 16 documents, 27 mouvements (inchangé) ; l'élève ne saisit que sa liste |
| Ouverture | `pret: true, ouverture: 'prof'` (posé en C3) |

## 2. Vérifié / construit

Inchangé (en-tête de `contenus/cdiscount.js` et de `contenus/cdiscount-inventaire.js`). Nouveau, **construit** : le
collègue qui a préparé la liste de l'élève absent, le préparateur qui signale un rayon douteux.

## 3. Objectif

En ENT-2.2, l'élève a analysé dans le tableur les constats d'écart des préparateurs et **choisi les références à
recompter** (message « À recompter : … » à Nadia). En ENT-2.3 il **recompte sa liste** : il reporte le relevé pour ces
références seulement, calcule les écarts, en cherche la cause (pièges validés : la paire de cartons qui s'annule, les
batteries rangées ailleurs après une préparation annulée, la ligne témoin de démarque inconnue), décide et calcule le
taux d'écart. **Le relevé couvre toute l'allée**, l'élève n'en saisit qu'une partie. Une référence douteuse **oubliée**
en ENT-2.2 **revient comme un aléa** : il la traite quand même, et son oubli ne se paie qu'une fois (dans ENT-2.2).

## 4. Déroulé

1. **Ouverture** : Bienvenue (garde existante) + message de Nadia : « Rappelez-moi les références que vous avez
   retenues » ; réponse à **amorce `À recompter : `**. Les messages d'enquête d'aujourd'hui arrivent aussi à l'ouverture
   (Kevin : doute sur la palette Kabeo ; Inès : annulation de CMD-732153 ; retour RET-26-0107 ; casse DEM-26-0031).
2. **L'élève répond** `À recompter : …`. Le site **extrait les références connues de l'allée A** (§ 11 : fautes
   ignorées) ; la **première réponse reconnue fixe la liste** (les suivantes ne changent rien).
   - Au moins une référence reconnue → Nadia accuse réception, neutre (« C'est noté : vous recomptez … ») ; puis le
     **relevé de comptage** (toute l'allée, `kind: 'releve'`) et la **mission** (reprise de l'actuelle, réécrite pour
     « les références de votre liste ») ; puis, **pour chaque référence à écart absente de la liste**, l'**aléa** d'un
     préparateur (§ 5) : la référence s'ajoute à ce qu'il doit compter.
   - Réponse **« Absent »** (le mot, seul, sans référence) → le site envoie **la liste préparée par un collègue** (la
     bonne : CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01), puis le relevé et la mission. **« Absent » n'est écrit dans
     aucun message : c'est Tristan qui le dit à l'élève** (fiche d'intention).
   - Ni référence ni « Absent » → un seul rappel de Nadia (« Je n'ai reconnu aucune référence de l'allée A… ») ; rien
     d'autre n'arrive tant qu'une réponse reconnue n'est pas envoyée.
3. **Écran Inventaire** (réglages du 02/10 inchangés : aveugle, écarts et taux par l'élève, correction détaillée, motif
   obligatoire) **sur le périmètre de l'élève** = sa liste + les références revenues par aléa (intrus compris : une
   référence sans écart se compte, écart 0, aucune décision). Tant que la liste n'est pas reçue : l'écran dit « En
   attente de votre liste : répondez à Nadia Ferrand (Messagerie) ».
4. Validation définitive ; correction détaillée.

## 5. Les messages nouveaux

| Arrivée | De | Contenu |
|---|---|---|
| ouverture | Nadia | « Bonjour <prénom>, avant que l'équipe ne vous envoie son relevé, rappelez-moi les références de l'allée A que vous avez retenues après l'analyse des constats. Répondez en commençant par « À recompter : », les références séparées par des virgules. » (amorce `À recompter : `) |
| liste reconnue | Nadia | « C'est noté : vous recomptez <références reconnues, dans l'ordre des emplacements>. L'équipe inventaire vous envoie son relevé de l'allée. » (ne dit jamais si la liste est bonne) |
| « Absent » | Nadia | « Pas de souci. Voici la liste préparée par Mathis Darrigade, de l'équipe stock : À recompter : CAB-USBC-1M, CHG-20W, BAT-10K, COQ-UNI-01. Le relevé arrive. » |
| rien de reconnu (une fois) | Nadia | « Je n'ai reconnu aucune référence de l'allée A dans votre message. Renvoyez-moi la liste, références écrites comme sur l'écran Stock. » |
| après la liste, pour chaque référence à écart oubliée | Yanis Cazenave, préparateur | CHG-20W : « En préparant ce matin, j'ai trouvé moins de chargeurs CHG-20W en A-01-2 que ce que le système affiche. Quelqu'un peut recompter ? » — CAB-USBC-1M : « Le bac A-01-1 des câbles déborde : il y a plus de boîtes que ce que le système affiche. » — BAT-10K : « Il manque des batteries BAT-10K en A-03-1 par rapport au système. » — COQ-UNI-01 : « Il manque des coques COQ-UNI-01 en A-04-2 par rapport au système. » Objet : « Rayon à vérifier : <réf> » |

## 6. Données (`contenus/cdiscount-inventaire.js`)

**Base = l'ancienne ENT-2.2, pièges compris** (validée le 03/10) : allée A, 8 références, relevé et explications
inchangés (CHG −3 / CAB +3 dans le bac des câbles ; BAT −2 après la préparation annulée ; COQ −2 témoin), taux calculé par
l'élève sur **son** périmètre (recalculé par `bilanInventaire`).

Deux changements de cohérence avec ENT-2.2 (qui exporte les mêmes bons de préparation) :

1. **« Stock trouvé » des bons de préparation = stock réel au rayon** (comme ENT-2.1, décision 3) : CHG −3 et CAB +3 après
   REC-26-0431, BAT −2 après REI-26-0012, COQ −2 après la démarque (placée entre l'inventaire précédent et CMD-732126).
   Calculé par le code sur un stock réel parallèle. Le comptage reste à l'aveugle : le stock **système** reste caché.
2. **CMD-732153** semée avec `annulee: { motif: 'Annulée par le client pendant la préparation', at }` (statut C1) ; ses
   mouvements (sortie puis REI-26-0012) inchangés.

Constantes à exporter pour ENT-2.2 (qui les importe) : `REFS_A_ECART = [CAB, CHG, BAT, COQ]`, les commandes, la date de la
démarque COQ, les fonctions de calcul du stock réel. **Une seule source** pour les deux séances.

## 7. Demande au moteur — lot 0, commité à part (`core/types/inventaire.js`)

Aujourd'hui `bilanInventaire` exige une saisie sur **toutes** les lignes (`saisieOk` faux si une ligne est vide).
Ajout : la déclaration `inventaire` peut porter

```js
perimetre(db) { return ['CAB-USBC-1M', 'CHG-20W'] /* ou null tant que rien n'est choisi */ }
```

- `perimetre` absent → comportement actuel, aucune séance existante ne change.
- `null` → l'écran affiche un message d'attente fourni par la séance (`attentePerimetre: '…'`) et ne crée pas d'état.
- tableau → l'écran, `etatNeuf` (photo du système), `bilanInventaire` (saisie, écarts, décisions, taux) et le récapitulatif
  ne voient **que ces lignes**, dans l'ordre des emplacements ; le relevé de la messagerie reste complet.
- Si le périmètre s'agrandit après le début (robustesse ; le scénario ne le fait pas), les lignes nouvelles s'ajoutent à
  l'état avec leur photo du moment.
- Tests dans `outils/test/inventaire.mjs` : sans `perimetre` → inchangé ; périmètre de 3 lignes → `saisieOk` avec 3
  saisies ; taux calculé sur 3 lignes ; **sabotage** : ignorer le périmètre → le cas « 3 saisies suffisent » échoue.

Une ligne dans `claude/prepalog-inventaire-format.md` est à ajouter par Cowork ensuite : **le dire au compte rendu**.

## 8. Jalons

Les 5 d'aujourd'hui (comptage, écarts, rangements, témoin, taux), **lus sur le périmètre**. Les quatre références à écart
y sont toujours (liste ou aléa) : `REFS_RANGEMENT` et `REF_TEMOIN` ne changent pas. Aucun jalon sur la liste elle-même
(elle est jugée en ENT-2.2). Rien ne doit récompenser l'inaction : périmètre `null` → tous `na` ou `attente`.

## 9. Tests (`outils/test/cdiscount.mjs`)

Valeurs écrites à la main :
- liste exacte (4 références) → 4 lignes à saisir, aucun aléa, 5/5 avec les bonnes décisions ;
- liste sans CAB → aléa CAB reçu, CAB dans le périmètre, 5/5 possible ;
- liste avec un intrus (ECO-BT-01) → 5 lignes, écart 0 pour ECO, taux recalculé (valeur à la main) ;
- « Absent » → liste du collègue, 4 lignes ;
- fautes : « chg20w, Cab-Usbc-1m ; bat 10k » → 3 références reconnues ;
- rien de reconnu → un seul rappel, pas de relevé ; une seconde réponse reconnue débloque ;
- deux réponses reconnues → la première fixe la liste ;
- « Stock trouvé » des BP : CHG et CAB décrochés de 3 après REC-26-0431 (valeurs à la main) ;
- CMD-732153 s'affiche « Annulée » ;
- **sabotages** : extraction sensible à la casse ; « Absent » écrit dans un message ; jalons lus sur l'allée entière.

## 10. Supports et validation

- Trame élève : **oui, nouvelle** (Cowork, après validation à l'écran) ; jusque-là `sansTrame` gardé. Pas de corrigé
  fixe (l'écran donne la correction détaillée ; la fiche d'intention dira les quatre écarts).
- **Tristan valide** en jouant trois fois : liste exacte ; liste sans CAB (l'aléa arrive, la paire se résout) ;
  « Absent ».

## Niveau de l'élève : standard / confirmé

> **Décision de Tristan (03/10/2026)** : à partir de la série Cdiscount, chaque élève a un niveau **standard** (par
> défaut) ou **confirmé**, réglé par l'enseignant sur la fiche de l'élève (chantier « tiers-temps et niveau élève » :
> nom exact du réglage dans le compte rendu de `MOTEUR-tiers-temps.md`). Un confirmé a **plus d'opérations** à traiter
> — même travail, mêmes aides, mêmes pièges —, en **guidage et en entraînement** ; **l'évaluation est la même pour
> tous** ; **l'élève ne voit jamais son niveau** (aucune étiquette, aucun message qui le trahit). La séance lit le
> niveau dans sa base (`db.niveau`, posé à l'ouverture : `MOTEUR-statut-annulee.md`, partie 2) : il est **figé à la
> première ouverture** ; un changement de niveau ensuite ne touche pas une séance déjà commencée.

**Ce que ça change ici (détails tranchés par Cowork)** :

- **Catalogue étendu à toute l'allée A (12 références)** pour les deux niveaux, comme ENT-2.2 : les quatre références
  A-05 / A-06 ont leurs mouvements de la période et **aucun écart** ; le relevé de comptage couvre les 12 emplacements.
  Les pièges et le taux des 8 premières lignes ne changent pas.
- **Standard** : périmètre = sa liste + aléas (inchangé).
  **Confirmé** : périmètre = sa liste + aléas **+ A-05 et A-06** : dans son accusé de réception, Nadia ajoute « Tant que
  l'équipe passe, recomptez aussi A-05 et A-06 : leur comptage tournant tombe cette semaine. » → 4 lignes de plus à
  reporter, écarts nuls, taux calculé sur son périmètre (`bilanInventaire` le fait seul).
- Jalons inchangés. Tests : périmètre et taux attendus **par niveau** ; **sabotage** : phrase de Nadia envoyée à un
  standard (doit échouer).
- Cohérence avec ENT-2.2 : les commandes A-05 / A-06 de la fenêtre sont **les mêmes** dans les deux séances (une seule
  source, ce fichier).

## 11. Questions — toutes tranchées

> **Réponses données d'avance par Tristan (03/10/2026, Cowork)** : ne pas s'arrêter ; appliquer ces choix et **lister au
> compte rendu** tout ce que tu as choisi seul.

Décisions de fond : l'élève redonne lui-même sa liste ; « Absent » dit par l'enseignant, jamais écrit ; oubli = aléa ;
données de l'ancienne ENT-2.2, pièges compris ; écarts et taux calculés par l'élève.

### Détails tranchés par Cowork (à corriger à l'écran par Tristan)

- [x] **Extraction** : sur la ligne « À recompter : » (sinon tout le message), on ignore casse, espaces, tirets et
  ponctuation ; un mot qui ne correspond à aucune des 8 références est ignoré sans message.
- [x] **« Absent »** : reconnu si la ligne ne contient aucune référence et contient le mot « absent » (casse et accents
  ignorés).
- [x] **La liste est calculée depuis la messagerie** (fonction pure de `db.mails`), pas rangée dans un état à part :
  rien à cloisonner de plus que la base de la séance.
- [x] **Moment de l'aléa** : en même temps que le relevé (quelques minutes plus tard dans l'horodatage), pas après la
  saisie — évite de rouvrir un comptage commencé.
- [x] **Noms construits** : Mathis Darrigade (équipe stock, auteur de la liste du collègue) ; Yanis Cazenave
  (préparateur, auteur des aléas) ; adresses en `.example`.
- [x] **Textes** des messages : ceux du § 5.
- [x] **Cohérence avec ENT-2.2** : « Stock trouvé » des BP sur le stock réel ; constantes partagées exportées par ce
  fichier.
- [x] **Lot moteur** mené dans la même conversation mais inscrit et commité à part (une séance n'écrit pas dans `core/`
  sans chantier déclaré).
- [x] Mission (texte actuel de `mailMission`) : « huit emplacements » → « les références de votre liste » ; le reste
  inchangé.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : lot 0 — `core/types/inventaire.js`, `core/types/entreprise.js` (branchement : l'écran
  reçoit la base, attend tant que le périmètre est `null`, complète la photo si le périmètre grandit),
  `outils/test/inventaire.mjs` (4 cas). Séance — `contenus/cdiscount-inventaire.js` (réécrit), `activites/cdiscount-inventaire.js`
  (desc, en-tête), `outils/test/cdiscount.mjs` (partie ENT-2.3 réécrite : 27 cas).
- **API du périmètre livrée** (pour la fiche du format — **à reporter par Cowork dans `prepalog-inventaire-format.md`**) :
  `perimetre(db)` dans la déclaration `inventaire` → tableau de références (gardé dans l'ordre des emplacements) ou `null` ;
  `attentePerimetre: '…'` = le message de l'écran tant que c'est `null`. Exports de `core/types/inventaire.js` :
  `lignesInventaire(INV, db, VM)` (les lignes du périmètre, ou toutes), `etatNeuf(INV, stockDe, lignes?)`.
  `bilanInventaire(db, …)` lit le périmètre sur la base qu'on lui passe (la base de l'élève, pas un état seul).
  Sans `perimetre` : rien ne change. Le relevé de la messagerie reste complet.
- **Exports pour ENT-2.2** (`contenus/cdiscount-inventaire.js`) : `REFS_A_ECART`, `REFS_CONFIRME`, `COMMANDES`, `RECEPTIONS`,
  `RETOUR`, `CASSE`, `REINTEGRATION`, `ANNULATION`, `DEMARQUE`, `INVENTAIRE_PRECEDENT`, `ecartsReelsApres(m)`, et surtout
  `periode(now, depart)` qui rend réceptions, commandes, mouvements et **`preparations`** (une ligne par ligne de bon :
  `ts, bon, commande, sku, qty, logiciel, trouve`).
- **Écarts par rapport au brief** :
  - Les références reconnues dans la liste sont celles de **toute l'allée A (12)**, pas « les 8 » du § 11 : le catalogue
    est étendu à 12 par la section niveau, et un élève qui cite A-05 recompte A-05 (écart 0, intrus).
  - Volume : 12 références, 21 documents, 36 mouvements (et non « 8, 16, 27 inchangé ») : conséquence des 5 commandes
    A-05 / A-06 demandées par la section niveau.
  - **Constats d'écart sur les bons : 10** (CHG 3, CAB 3, BAT 2, COQ 2), pas « ≈ 8, CAB 2 » comme l'estimait le brief
    ENT-2.2 : c'est ce que donnent les commandes existantes. La bonne liste ne change pas.
  - Le taux attendu se calcule sur le périmètre : 6,9 % pour la bonne liste (10 ÷ 145), 6,0 % avec un intrus ECO
    (10 ÷ 167), 4,9 % pour un confirmé (10 ÷ 204). L'ancien 3,7 % (allée entière) est désormais **faux**.
- **Décisions prises en route** :
  - Rappel « rien reconnu » : déclencheur à part (`rappel`), une seule fois ; il porte aussi l'amorce « À recompter : ».
  - L'accusé de Nadia a pour objet « Votre liste à recompter » ; pour « Absent », c'est le même message (texte du § 5) ;
    un **confirmé « Absent »** reçoit aussi la phrase A-05 / A-06.
  - Aléas datés de 3 min puis + 1 min chacun après l'accusé (le relevé et la mission à + 1 à 3 s).
  - Une référence prime sur le mot « absent » dans la même réponse.
  - Le volet garde son identifiant `inventaire-1` : une base d'essai ouverte **avant** ce recadrage (enseignant) garde
    l'ancien contenu ; son écran Inventaire attendra une liste. Aucun élève n'est concerné (séance fermée).
  - CMD-732153 : annulée 30 min avant la réintégration ; son bon reste « préparé », figé.
  - 5 commandes A-05 / A-06 : CMD-732109, 732132, 732174, 732202, 732233 (clients C0003, 5, 7, 10, 12).
  - Le « Stock trouvé » d'une ligne est `max(0, stock réel)` avant la sortie.
- **Tests** : bloc `inventaire` 37/37 (dont 4 nouveaux ; sabotage « le périmètre est ignoré » → 4 cas tombent) ; bloc
  `cdiscount` 63/63 (partie ENT-2.3 réécrite, valeurs à la main : stock système des 12 références, 11 « stock trouvé »
  bon par bon, taux par liste et par niveau) ; sabotages éprouvés : extraction sensible à la casse, « absent » écrit dans
  un message, jalons lus sur l'allée entière, phrase du confirmé envoyée à un standard → chacun fait tomber ses cas.
  Suite entière : 497/497.
- **Commits** : « Écran Inventaire : périmètre réglable par la séance… (lot 0 de C4) » puis « ENT-2.3 recadrée… (C4) ».
- **Reste ouvert** : trame élève (Cowork, après validation à l'écran) ; ligne de la fiche du format d'inventaire
  (Cowork) ; validation par Tristan en jouant trois fois (liste exacte ; sans CAB ; « Absent » — c'est **lui** qui dit
  « Absent » à l'élève, à écrire dans la fiche d'intention).

- **Notation pondérée sur 20 (10/10/2026, lot 4 de `docs/briefs/NOTATION-ponderation.md`)** : comptage 4, écarts 3, rangements 6, témoin 4,5, taux 2,5. Poids validés par Tristan ; tableau `BAREME` du fichier de contenu, `bareme: 20` dans l'activité, plus de `notation: 'avancement'`. Les anciennes lignes du Suivi gardent leur proportion (`meilleurScore`).
