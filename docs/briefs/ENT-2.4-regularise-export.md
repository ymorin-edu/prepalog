# Brief de séance — ENT-2.4 Cdiscount « Régularisé à l'aveugle » (recadrage : export des ajustements, vendeur de la place de marché)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-cdiscount.md, le compte rendu de docs/briefs/MOTEUR-geste-tableur.md (API livrée), puis implémente le brief docs/briefs/ENT-2.4-regularise-export.md. Annonce la durée, dis-moi si un point du brief contredit le code, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
> ```

**Statut** : livré (04/10/2026), fermé aux élèves (`ouverture: 'prof'`).
**Date du brief** : 03/10/2026
**Modèle** : Sonnet — **Durée estimée par Cowork** : 2 à 3 h.
**Touche le moteur** : non.
**Conception** : `claude/prepalog-cdiscount-serie-decisions.md` (décisions 10, 11, 13) ; en-tête de
`contenus/cdiscount-regularise.js` (le scénario validé le 03/10).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-2.4 / `cdiscount-regularise` (**id inchangé** ; code changé en C3) |
| Titre | « Cdiscount — régularisé à l'aveugle » (inchangé) |
| desc | « Exporter les ajustements du mois, repérer celui qui n'a pas de justificatif, remonter à la réception et dire quoi faire. » |
| Niveau / compétences | 1re / C1.6 (et C3.2 si ENT-2.2 l'a déclarée) |
| Temps | **erreur induite** (`erreur`) — et **entraînement du geste tableur** (retour « n sur m ») |
| Notation | `avancement`, **8 jalons** (6 aujourd'hui) |
| Ouverture | `pret: true, ouverture: 'prof'` (posé en C3) |

## 2. Vérifié / construit

**Vérifié (03/10)** : Cdiscount stocke pour des vendeurs de sa place de marché (stockage, emballage, expédition,
retours), qui **suivent leur niveau de stock dans leur espace** ([page Fulfillment de Cdiscount Marketplace](https://marketplace.cdiscount.com/service/octopia-fulfillment/)).
**Construit** : tout le reste, **dont le vendeur, fictif, et sa boutique, inventée — à annoncer comme tels** dans la trame
et dans le message (« vendeur de la place de marché », sans marque réelle).

## 3. Objectif

Inchangé sur le fond : un magasinier de nuit a passé « −4 mixeurs, Démarque inconnue » sans enquêter ; la vraie cause est
la réception REC-26-0447 (bon de livraison 12, colis 4 + 4) ; le grille-pain « Casse » est **justifié** (fausse piste).
Nouveau : l'élève **commence par le tableur** — il exporte les **ajustements du mois**, repère avec **SI** ceux qui n'ont
pas de justificatif, compte les ajustements **par motif** avec **NB.SI** — puis enquête dans le logiciel. Et un **second
plaignant**, le vendeur, pointe la même réception défaillante.

## 4. Déroulé

1. Ouverture : Bienvenue (garde) ; **mission de Nadia** (actuelle, complétée § 5) ; **message du vendeur**, transféré par
   Nadia.
2. Écran **Stock, onglet Mouvements** : bouton **« Exporter les ajustements du mois »** →
   `cdiscount-ajustements-du-mois.xlsx` (~20 lignes, tout l'entrepôt).
3. Tableur : colonne **J « À vérifier »** `=SI(H2="";"À VÉRIFIER";"")` ; feuille **« Synthèse »** : par motif,
   `=NB.SI(Ajustements!G:G;A2)`.
4. Menu Fichiers → dépôt : **retour d'entraînement** (« n résultats justes sur m »), redépôt possible.
5. Enquête dans le logiciel (Mouvements, Réceptions : BL contre colis, Catalogue), comme aujourd'hui.
6. Réponse à Nadia : **les 8 lignes d'aujourd'hui** (`LIGNES_REPONSE` inchangé).

RECHERCHEV n'apparaît pas (réservée au bonus, décision 11).

## 5. Messages

| Arrivée | De | Contenu |
|---|---|---|
| ouverture | Nadia | Mission actuelle, **précédée** de : « Ce mois-ci, la démarque inconnue me paraît élevée, et un vendeur de la place de marché se plaint (je vous transfère son message). Commencez par le tableur : dans Stock, onglet Mouvements, exportez les ajustements du mois. Ajoutez une colonne « À vérifier » qui affiche À VÉRIFIER quand un ajustement n'a pas de document justificatif (fonction SI), et, dans la feuille Synthèse, comptez les ajustements par motif (fonction NB.SI). Déposez votre fichier (menu Fichiers). Ensuite seulement, enquêtez. » Puis la suite actuelle (8 lignes) |
| ouverture | Nadia (transfert) | **Vendeur** : « TR : Stock affiché — Bassin Cuisine ». Texte du vendeur : « Bonjour, je vends sur votre place de marché des mixeurs plongeants Gardéo, stockés chez vous à Cestas. Gardéo vous en a livré 12 pour mon compte le <date de REC-26-0447>. Depuis le <date de l'ajustement>, mon espace vendeur n'en affiche plus que 8. Je n'en ai vendu aucun depuis. Le stock affiché dans mon espace ne correspond pas à ce que je vous ai envoyé. Où sont passés mes 4 mixeurs ? — Julien Mounet, Bassin Cuisine (vendeur de la place de marché) » |

## 6. Données (`contenus/cdiscount-regularise.js`)

**Scénario gardé** (allée B, REC-26-0447, MIX −4 « Démarque inconnue » orphelin, GRP −1 « Casse » justifié par
DEM-26-0036, délai de réclamation de 8 jours, valeur du manque 4 × 12,60 € = 50,40 €). Deux ajouts :

1. **Les mixeurs de REC-26-0447 sont ceux du vendeur** (Gardéo les a livrés à Cestas pour son compte) : seul l'en-tête du
   fichier et le message changent ; la réception, le catalogue, la valeur au prix d'achat et la suite à donner
   (« réclamer auprès du fournisseur ») restent justes — le vendeur, lui, est à prévenir (la trame le fera réfléchir ; pas
   de jalon).
2. **L'export des ajustements du mois** (feuille « Ajustements ») : ~20 lignes, **tout l'entrepôt** (allées A, B, C).
   Colonnes : Date | N° ajustement | Référence | Désignation | Allée | Quantité | Motif | Document | Saisi par.
   - les 2 ajustements de la base (MIX, GRP) viennent **de la base de l'élève** ;
   - les ~18 autres viennent d'une constante de la séance `AJUSTEMENTS_AUTRES` (historique du mois, références du
     catalogue complet de `cdiscount.js`), **tous avec un document** (DEM-… pour une casse, REC-… pour une erreur de
     réception, FR-… « fiche de recomptage » pour une démarque inconnue, BP-… pour une erreur de prélèvement) ;
   - **une seule ligne sans document : MIX −4** ; répartition des motifs : Casse 7, Erreur de prélèvement 5, Erreur de
     réception 3, Démarque inconnue 5 (dont MIX). Valeurs comptées par le code.
   - Feuille « Synthèse » d'amorce : seulement les en-têtes « Motif » | « Nombre » (l'élève écrit les motifs :
     entraînement).

## 7. Contrôles et jalons

| Contrôle | Type | Attendu | Fonctions |
|---|---|---|---|
| Colonne « À vérifier » | colonne, clé N° ajustement | « À VÉRIFIER » si Document vide, vide sinon | `IF` |
| Synthèse « Nombre » | table, clé Motif (pliage) | nombre d'ajustements par motif | `COUNTIF` |

| # | Jalon | Lit |
|---|---|---|
| 1 | **Ajustements sans justificatif repérés avec SI** | contrôle « À vérifier » juste (meilleur dépôt) |
| 2 | **Ajustements comptés par motif avec NB.SI** | contrôle Synthèse juste |
| 3 à 8 | les six d'aujourd'hui (ajustements, réception, quantités, valeur, motif, suite) | inchangés |

Les jalons 3 à 8 ne dépendent pas du dépôt (un élève qui rate le tableur peut réussir l'enquête). Rien n'est acquis sans
action.

## 8. Tests (`outils/test/cdiscount.mjs`)

Valeurs à la main : 20 lignes ; une seule sans document (le N° de MIX) ; comptes par motif 7 / 5 / 3 / 5 ; classeur juste
fabriqué dans le test → jalons 1-2 ok ; les cas actuels des jalons 3-8 gardés. **Sabotages** : « À VÉRIFIER » tapé à la
main sans formule (jalon 1 doit échouer) ; un document ajouté à MIX dans les données (le test « une seule sans document »
doit échouer) ; RECHERCHEV exigée (ne doit exister nulle part dans cette séance).

## 9. Supports

Trame élève Word/PDF (Cowork, après validation à l'écran) : encart SI / NB.SI (rappel d'ENT-2.2), encadré « vérifié /
construit » (vendeur fictif), « Pour réfléchir » : que répondre au vendeur ? Corrigé (Cowork).

## 10. Critères de validation par Tristan

Exporter, traiter sous Excel ou LibreOffice, déposer : le retour dit « n résultats justes sur m » sans détail ; une seule
ligne « À VÉRIFIER » (les mixeurs) ; le message du vendeur se lit comme un vrai client ; la réponse juste donne 8/8.

## Niveau de l'élève : standard / confirmé

> **Décision de Tristan (03/10/2026)** : à partir de la série Cdiscount, chaque élève a un niveau **standard** (par
> défaut) ou **confirmé**, réglé par l'enseignant sur la fiche de l'élève (chantier « tiers-temps et niveau élève » :
> nom exact du réglage dans le compte rendu de `MOTEUR-tiers-temps.md`). Un confirmé a **plus d'opérations** à traiter
> — même travail, mêmes aides, mêmes pièges —, en **guidage et en entraînement** ; **l'évaluation est la même pour
> tous** ; **l'élève ne voit jamais son niveau** (aucune étiquette, aucun message qui le trahit). La séance lit le
> niveau dans sa base (`db.niveau`, posé à l'ouverture : `MOTEUR-statut-annulee.md`, partie 2) : il est **figé à la
> première ouverture** ; un changement de niveau ensuite ne touche pas une séance déjà commencée.

**Ce que ça change ici (détails tranchés par Cowork)** :

- **Standard** : export de **20** ajustements (inchangé). **Confirmé** : **30** ajustements (10 lignes de plus dans
  `AJUSTEMENTS_AUTRES`, toutes **avec document**) ; toujours **une seule ligne sans document (MIX)** ; répartition
  confirmé : Casse 10, Erreur de prélèvement 8, Erreur de réception 5, Démarque inconnue 7 (dont MIX). Valeurs
  recalculées par le code.
- L'enquête dans le logiciel (allée B, REC-26-0447, vendeur) est **la même** pour les deux niveaux ; jalons 3 à 8
  inchangés.
- Tests : comptes par motif **par niveau** ; « une seule ligne sans document » vérifié pour les deux niveaux.

## 11. Questions — toutes tranchées

> **Réponses données d'avance par Tristan (03/10/2026, Cowork)** : ne pas s'arrêter ; appliquer ces choix et **lister au
> compte rendu** tout ce que tu as choisi seul.

Décisions de fond : contenu de l'ancienne ENT-2.3 gardé ; export des ajustements (~20 lignes) ; SI et NB.SI seulement ;
RECHERCHEV au bonus ; vendeur de la place de marché, fictif, second plaignant qui pointe la même réception.

### Détails tranchés par Cowork (à corriger à l'écran par Tristan)

- [x] **Vendeur** : Julien Mounet, boutique « Bassin Cuisine » (inventés, adresse `.example`), annoncés comme fictifs.
- [x] **Lien avec la réception** : les 12 mixeurs de REC-26-0447 ont été livrés par Gardéo **pour le compte du vendeur** ;
  aucune donnée de réception ni jalon ne change.
- [x] **Export sur tout l'entrepôt** (~20 lignes) : 2 lignes de la base + ~18 d'une constante `AJUSTEMENTS_AUTRES` ; une
  seule ligne sans document (MIX).
- [x] Répartition des motifs : Casse 7, Erreur de prélèvement 5, Erreur de réception 3, Démarque inconnue 5.
- [x] Préfixes de documents : DEM-, REC-, FR- (fiche de recomptage), BP-.
- [x] Fichier `cdiscount-ajustements-du-mois.xlsx`, feuilles « Ajustements » et « Synthèse » (en-têtes seuls).
- [x] Bouton sur **Stock, onglet Mouvements** : « Exporter les ajustements du mois ».
- [x] Le vendeur arrive **à l'ouverture**, transféré par Nadia (pas de déclencheur).
- [x] Jalons tableur placés en tête (1-2), les six d'aujourd'hui ensuite.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `contenus/cdiscount-regularise.js` (export, `AJUSTEMENTS_AUTRES`, vendeur, 2 jalons
  tableur en tête), `activites/cdiscount-regularise.js` (desc, `tableur`), `outils/test/cdiscount.mjs`.
- **Écarts par rapport au brief** :
  - Compétence : C1.6 seule (ENT-2.2 n'a pas déclaré C3.2, qui est la traçabilité).
  - Le bouton « Exporter les ajustements du mois » est dans l'**en-tête de l'écran Stock** (visible quel que soit
    l'onglet) : le moteur pose les exports par écran, pas par onglet. La mission dit « Stock, onglet Mouvements » : ça
    reste juste (on y est).
  - **Aucune étiquette « Tout à l'écran »** : la séance se fait en partie dans le tableur (retirée aussi d'ENT-2.2).
- **Décisions prises en route** :
  - `AJUSTEMENTS_AUTRES` : 28 lignes AJ-26-0190 à AJ-26-0220 (18 pour tous, 10 de plus pour un confirmé), J-24 à J-1,
    allées A, B et C ; celles de l'allée B datent d'avant le dernier inventaire (la base de l'élève commence là, rien ne
    contredit les mouvements). Documents DEM-26-0008… (aucun numéro déjà pris par une autre séance), FR-26-0014…,
    REC-26-0402…, BP-731811… ; saisis par Kevin Larrieu (casse), Sofiane Brettes (prélèvement), Nadia Ferrand
    (réception), Samir Benkhelifa (démarque).
  - Les deux ajustements de la base : MIX = **AJ-26-0217** (sans document), GRP = **AJ-26-0219** (DEM-26-0036). Un
    ajustement passé par l'élève lui-même à la console entre dans l'export, sans document (« À VÉRIFIER »).
  - Comptes obtenus : 20 lignes, Casse 7, Erreur de prélèvement 5, Erreur de réception 3, Démarque inconnue 5 ;
    confirmé 30 lignes, 10 / 8 / 5 / 7 — exactement ceux du brief.
  - Contrôles : « À vérifier » (clé N° ajustement, `IF` exigé, « À VÉRIFIER » lu sans casse ni accents) et Synthèse
    (clé Motif, `COUNTIF`) ; feuille Synthèse d'amorce : en-têtes seuls. Retour « entraînement ».
  - Le vendeur arrive à l'ouverture, transféré par Nadia ; il cite la date de REC-26-0447 et celle de l'ajustement ;
    pied « (Vendeur et boutique fictifs, inventés pour l'exercice.) » ; adresse `j.mounet@bassin-cuisine.example`.
    Cohérence des chiffres : avant la livraison, 6 mixeurs (stock propre) ; les 5 vendus ensuite sortent de ce stock-là ;
    les 12 du vendeur deviennent 8 après l'ajustement (13 − 4 = 9 au total, dont 8 à lui) — à relire par Tristan.
- **Tests** : 5 cas nouveaux (20 / 30 lignes, une seule sans document, comptes par motif à la main ; classeur juste →
  jalons 1-2 ok ; « À VÉRIFIER » tapé → ko ; synthèse fausse → ko ; enquête juste sans tableur → six jalons ok ; vendeur ;
  RECHERCHEV nulle part ; à l'écran : export depuis Stock, retour « 4 résultats justes sur 24 » sans détail).
  **Cas existants réécrits** : ils portent désormais sur les six jalons d'enquête (`statuts6`), 6 messages au lieu de 5,
  score maximal 8 au lieu de 6. Sabotage « un document donné aux mixeurs » → 2 cas tombent. Suite entière 529/529.
- **Commits** : « ENT-2.4 recadrée : export des ajustements, SI, NB.SI et le vendeur de la place de marché (C7) ».
- **Reste ouvert** : trame (encart SI / NB.SI, encadré vérifié / construit, « que répondre au vendeur ? ») et corrigé
  (Cowork, après validation à l'écran).
