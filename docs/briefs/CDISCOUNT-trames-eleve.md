# Brief — trames élève Cdiscount ENT-2.1, 2.2, 2.3, 2.4, 2.6 (déposées par Cowork le 04/10/2026)

> **📋 Phrase à copier-coller dans ccode (Sonnet) :**
>
> ```
> Lis docs/briefs/CDISCOUNT-trames-eleve.md : commite les fichiers de trame Cdiscount déposés par Cowork (liste §2), sans rien déclarer, puis fais le petit correctif moteur du §4 (apostrophes dans les titres de colonnes), commité à part, avec son test. Ne touche à aucun autre fichier.
> ```

**Statut** : à commiter. Trames **non relues** par Tristan, **non déclarées**.

## 1. Ce que c'est

Les trames élève Word/PDF de la série Cdiscount refondue (étape 13 de `FEUILLE-DE-ROUTE-cdiscount.md`, plus la
trame d'ENT-2.1 à refaire et celle d'ENT-2.3 de l'étape 7), sur le modèle Picard (fiche `prepalog-trames-eleve` :
page 1 = en-tête + sommaire, une étape par page, une question = une zone, une analyse réflexive par étape, noir et
gris). Pas de trame pour ENT-2.5 (évaluation), décision de la série.

| Séance | Trame | Pages | Étapes | Étape 1 (hors de l'outil) |
|---|---|---|---|---|
| ENT-2.1 | `contenus/trames/ENT-2.1-cdiscount-mouvements-trame-eleve.{docx,pdf}` (**remplace** l'ancienne) | 11 | 8 | Cdiscount (1998, Bordeaux, C-Logistics, Cestas < 30 kg), Black Friday |
| ENT-2.2 | `contenus/trames/ENT-2.2-cdiscount-chiffres-trame-eleve.{docx,pdf}` | 9 | 8 | le WMS, la date du Black Friday 2026 |
| ENT-2.3 | `contenus/trames/ENT-2.3-cdiscount-inventaire-trame-eleve.{docx,pdf}` | 9 | 7 | l'inventaire tournant, Code de commerce art. L123-12 |
| ENT-2.4 | `contenus/trames/ENT-2.4-cdiscount-regularise-trame-eleve.{docx,pdf}` | 9 | 8 | Octopia Fulfillment (Cdiscount stocke pour des vendeurs) |
| ENT-2.6 | `contenus/trames/ENT-2.6-cdiscount-priorites-trame-eleve.{docx,pdf}` | 8 | 7 | la fiche d'aide RECHERCHEV (support Microsoft) |

Libellés relevés en **jouant chaque séance** sur `outils/essai-cdiscount.html` (copie du dépôt au commit du
04/10/2026 7 h 56) : exports téléchargés, classeurs travaillés puis **recalculés par LibreOffice** et déposés,
messages envoyés. Résultats : ENT-2.1 6/6, ENT-2.2 5/5 (« 68 résultats justes sur 68 »), ENT-2.3 5/5 (« 4 décisions
justes sur 4 », taux 6,9 %), ENT-2.4 8/8 (« 24 sur 24 »), ENT-2.6 4/4 (« 37 sur 37 »). **Niveau confirmé non joué**
(la page d'essai ne le règle pas) : ses valeurs, tirées du code, sont dans les notes des corrigés.

## 2. Fichiers déposés (à commiter tels quels)

- `outils/corriges_cdiscount.py` (neuf) : les réponses des cinq trames (`ENT_2_1` … `ENT_2_6`). Chaque générateur les
  inscrit dans `corriges_data._DICOS` (et `_EXTRAS` pour ENT-2.2) avant d'écrire son corrigé ;
- `outils/corriges_data.py` (modifié) : **retrait de l'ancien `ENT_2_1`** (faux depuis le recadrage), remplacé par un
  commentaire qui renvoie à `corriges_cdiscount.py`. Rien d'autre ;
- `outils/trame_commun.py` (modifié) : `finir(…, fichier=None)` (nom du corrigé ; par défaut `<code>-trame`, inchangé
  pour Picard) ; espaces insécables dans les guillemets (« Mouvements ») à l'écriture du .docx ;
- `outils/trame-cdiscount-mouvements.py` (réécrit), `outils/trame-cdiscount-chiffres.py`,
  `outils/trame-cdiscount-inventaire.py`, `outils/trame-cdiscount-regularise.py`, `outils/trame-cdiscount-priorites.py`
  (neufs) ;
- `contenus/corriges/ENT-2.1.js` (régénéré : déjà déclaré dans `activites/cdiscount-mouvements.js`, il était faux) ;
  `ENT-2.2.js`, `ENT-2.3.js`, `ENT-2.4.js`, `ENT-2.6.js` (neufs). Ces séances n'ont pas de corrigé calculé : le corrigé
  de la trame prend le nom `ENT-2.x.js` (pas `-trame`) ;
- les 10 fichiers de trame du tableau ci-dessus.

Message de commit proposé : « Cdiscount : trames élève ENT-2.1 (refaite), 2.2, 2.3, 2.4, 2.6 et leurs corrigés (non
déclarées) ».

## 3. Plus tard, quand Tristan aura relu une trame (pas avant)

1. Déclarer `trame: { pdf, docx }` dans `activites/cdiscount-<id>.js` (déclarer = valider). Pour ENT-2.3 : retirer
   `sansTrame: "Tout à l'écran"` et le commentaire « Pas de trame papier ».
2. Déclarer `corrige: './contenus/corriges/ENT-2.x.js'` pour 2.2, 2.3, 2.4, 2.6 (ENT-2.1 l'a déjà).
3. Régénérer une trame : `python3 outils/trame-cdiscount-<nom>.py` puis
   `soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/ENT-2.x-*.docx`.

## 4. Correctif moteur à faire tout de suite (petit, Sonnet, 15-20 min) — `core/types/classeur.js`

**Constat (essai du 04/10/2026, ENT-2.6)** : la Synthèse attend la colonne « Valeur de l’écart » (apostrophe
typographique ’, dans `contenus/cdiscount-priorites.js`). Un classeur dont le titre est tapé avec l'apostrophe du
clavier (') : **« 19 résultats justes sur 37 »**, toute la colonne comptée fausse, jalon 3 ✗. Le même classeur avec ’ :
37 sur 37. Excel ne remplace pas ' par ’ dans une cellule : **un élève sous Excel ne peut pas réussir**, et le retour
d'entraînement ne lui dit pas pourquoi.

**Correctif** : dans `pliage()` (`core/types/classeur.js`), plier aussi les apostrophes et guillemets simples
(`’ ‘ ʼ ´ \``) vers `'`, avant la mise en minuscules. Tous les titres et clés passent par `pliage` : rien d'autre à
changer. **Test** (bloc `tableur-export`) : le contrôle « Valeur de l’écart » trouve une colonne titrée
« Valeur de l'écart » ; sabotage : sans le pliage, le cas tombe. Suite entière avant le push (touche `core/`).

## 5. Écarts relevés en jouant (texte des séances, pas des trames) — à trancher par Tristan

- **ENT-2.4, mission de Nadia** : « le motif … d'après la liste de l'écran Inventaire » — **cette séance n'a pas
  d'écran Inventaire**. La trame renvoie à la colonne « Motif » de l'export. Proposition : remplacer par « d'après la
  colonne Motif de l'export ».
- **ENT-2.4, message du vendeur** : « Depuis le 1 octobre » → « le 1er octobre » (date écrite par le code).
- **Réceptions (moteur, toutes séances)** : « Le bon de livraison est dans votre messagerie » — faux dans les séances
  Cdiscount (aucun BL en messagerie ; l'annoncé est dans le bon de réception). Déjà vrai avant la série ; à signaler.
- **ENT-2.3** : l'étiquette « Tout à l'écran » reste dans le bandeau tant que la trame n'est pas déclarée (§3).

## 6. Points à relire par Tristan

- **Textes de mes questions et des « Pour réfléchir »** : non relus.
- **ENT-2.1** : 8 étapes (la comparaison document / mouvement est la nouvelle étape 6, avec la colonne « Stock
  trouvé » comme seconde preuve). La trame ne cite ni DEM-26-0027, ni REC-26-0415, ni aucun nombre à trouver ; elle
  cite CMD-731602 (c'est l'énoncé) et fait constater son statut « Annulée ».
- **ENT-2.2** : encarts « écrire une formule », SI, NB.SI avec exemples sur d'autres données ; le cadre « Ma liste de
  références à recompter » (à garder pour ENT-2.3). Séparateur « ; » (tableur en français).
- **ENT-2.3** : le mot « Absent » n'est écrit nulle part ; la trame dit « Tu n'as pas fait ENT-2.2 ? Demande à ton
  enseignant ce que tu dois répondre à Nadia. » Elle annonce qu'un préparateur peut ajouter une référence au comptage
  (sans dire laquelle).
- **ENT-2.4** : le retour du dépôt est d'entraînement (sans détail) ; la trame le dit et donne trois vérifications.
  « Pour réfléchir » final : que répondre au vendeur ?
- **ENT-2.6** : la date d'exemple des encarts est le 15/01/2026 (jamais celle de la séance) ; la page « nettoyer un
  export » propose de trier pour repérer vides et doublons, et de retaper une date calée à gauche.
- **Excel et LibreOffice** : les classeurs déposés pendant mes essais ont été recalculés par **LibreOffice** ; un dépôt
  depuis **Excel** reste à faire (déjà demandé dans le RECAP du 04/10).
- **Pagination** : contrôlée sous LibreOffice (aucune page blanche, une étape par page sauf coupures choisies : 2.1
  étapes 5 et 6, 2.3 étape 6) ; ouvrir le .docx dans Word pour vérifier.

## Compte rendu *(rempli par Claude Code)*
