# Brief de séance — ENT-2.2 Cdiscount « Ce que disent les chiffres » (nouvelle, geste tableur guidé)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-cdiscount.md, le compte rendu de docs/briefs/MOTEUR-geste-tableur.md (API livrée), puis implémente le brief docs/briefs/ENT-2.2-ce-que-disent-les-chiffres.md. Annonce la durée, dis-moi si un point du brief contredit l'API livrée, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
> ```

**Statut** : à implémenter — **après** le geste tableur (C5) et ENT-2.3 recadrée (C4, dont elle importe les données).
**Date du brief** : 03/10/2026
**Modèle** : **Opus** (première séance sur le geste tableur) — **Durée estimée par Cowork** : 3 à 4 h.
**Touche le moteur** : non (contenu, activité, tests). Si l'API du geste manque de quelque chose : **le lister et
s'arrêter sur ce point** (une séance n'écrit pas dans `core/`).
**Conception** : `claude/prepalog-cdiscount-serie-decisions.md` (décisions 3 à 6), `claude/prepalog-geste-export-tableur.md`.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-2.2 / **`cdiscount-chiffres`** (nouveau, jamais modifié ensuite) |
| Titre | « Cdiscount — ce que disent les chiffres » |
| desc | « Exporter les constats des préparateurs, les analyser dans le tableur et choisir les références à recompter. » |
| Rubrique / niveau | logisim / 1re |
| Compétences | **C1.6** (C1.6.1 flux d'information, C1.6.2 préparer l'inventaire) ; **C3.2** si le code des compétences le porte (savoirs « tableur professionnel ») — sinon C1.6 seule, le dire |
| Temps | **guidage** (du geste tableur) |
| Notation | `avancement`, 5 jalons |
| Fichiers | `activites/cdiscount-chiffres.js`, `contenus/cdiscount-chiffres.js`, une ligne dans `activites/index.js` |
| `portee` / base | `'eleve'`, base propre (pas de `jeuId`), **pas** de `reinitialisable` (réservé aux X.1) |
| Livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

Vérifié : comme ENT-2.1 (fiche de recadrage). **Construit** : l'export, les constats, les préparateurs. Le geste
« exporter, retravailler dans un tableur, décider » est réel (référentiel 2025 : « maniement d'un tableur professionnel,
d'un WMS » dans les savoirs de C1.4-C1.6, C2.1, C3.2) : la trame peut le dire.

## 3. Objectif

À la fin d'ENT-2.1, Nadia a dit : « une erreur sur un article, il y en a peut-être d'autres : la prochaine fois, on
regarde toute l'allée ». Le stock affiché **est** la somme des mouvements : chercher un écart par calcul ne donnerait
rien (faille du recadrage corrigée, décision 3). Le signal, ce sont **les écarts relevés par les préparateurs** : chaque
ligne de bon de préparation porte le stock du logiciel et le « stock trouvé » au rayon (continuité de la décision 3
d'ENT-2.1). L'élève exporte ces lignes, calcule l'écart, isole les références en écart (**SI**), compte les constats par
référence (**NB.SI**), puis **choisit les références à recompter** et les écrit à Nadia. ENT-2.3 recomptera sa liste.

## 4. Déroulé

1. Ouverture : Bienvenue (garde existante) + **mission de Nadia** (§ 5).
2. Écran **Commandes** : bouton **« Exporter les lignes de préparation »** → `cdiscount-preparations-allee-A.xlsx`.
3. Dans le tableur (hors ligne) : colonne **K « Écart »** `= Stock trouvé − Stock logiciel` ; colonne **L « Réf. en
   écart »** `=SI(K2<>0;D2;"")` ; feuille **« Synthèse »** (amorce dans l'export) : `=NB.SI(Préparations!L:L;A2)` par
   référence.
4. Menu **Fichiers** → « Déposer mon fichier » : **retour détaillé case par case, redépôt illimité** (guidage).
5. **Décision** : message à Nadia, amorce `À recompter : `, les références à constats d'écart.
6. Nadia accuse réception, neutre, et annonce le recomptage (passerelle vers ENT-2.3).

**Encart SI / NB.SI** : dans la trame (syntaxe, exemple sur d'autres données, erreur fréquente) ; **rappel court dans le
bandeau d'aide** (`tableur.aide`), jamais dans l'écran de travail (décision 5). NB.SI.ENS n'apparaît pas (réservé au
bonus, décision 6).

## 5. Messages

| Arrivée | De | Contenu |
|---|---|---|
| ouverture | Nadia | Bienvenue (garde existante) |
| ouverture | Nadia | **Mission** : « Après l'histoire des écouteurs, je veux savoir si d'autres références de l'allée A ont un stock faux. Les préparateurs notent sur chaque bon le stock qu'ils trouvent au rayon : quand il ne correspond pas au logiciel, c'est un signal. 1. Dans Commandes, exportez les lignes de préparation depuis le dernier inventaire. 2. Dans le tableur, ajoutez la colonne « Écart » (stock trouvé moins stock logiciel), puis la colonne « Réf. en écart » qui recopie la référence seulement quand l'écart n'est pas nul (fonction SI). 3. Dans la feuille Synthèse, comptez les constats par référence (fonction NB.SI). 4. Déposez votre fichier (menu Fichiers). 5. Écrivez-moi les références à faire recompter, sur une ligne qui commence par « À recompter : ». On ne recompte pas tout : seulement ce que les chiffres désignent. » (amorce `À recompter : `) |
| après un message « À recompter : » (juste ou faux) | Nadia | « Merci, c'est noté. Je demande à l'équipe inventaire de passer dans l'allée A : vous ferez le recomptage. » Aucun jalon n'en dépend |

## 6. Données (`contenus/cdiscount-chiffres.js`)

**Même allée A qu'ENT-2.3, deux jours avant le comptage** : les données de commandes, réceptions, réintégration, démarque
et « stock trouvé » sont **importées de `contenus/cdiscount-inventaire.js`** (constantes exportées en C4), jamais
recopiées. Fenêtre de la séance = jour d'ENT-2.3 moins 2.

- **Export** : lignes des bons de préparation de l'allée A **depuis le début du mois** : les 9 commandes de la fenêtre
  d'ENT-2.3 (≈ 18 lignes, dont 8 constats) + **≈ 12 lignes plus anciennes** (≈ 10 commandes entre J-20 et l'inventaire
  précédent, plus une réception si nécessaire pour garder les stocks positifs), toutes sans écart → **environ 30
  lignes**. Stock logiciel et stock trouvé calculés par le code.
- **Constats d'écart** sur **CHG-20W (−3), BAT-10K (−2), COQ-UNI-01 (−2), CAB-USBC-1M (+3 : stock trouvé > logiciel)**
  → **4 références sur 8** ; rien sur les 4 autres. Ordre de grandeur attendu (à vérifier par le code) : CHG 3 constats,
  CAB 2, COQ 2, BAT 1.
- **Colonnes de l'export** (feuille « Préparations ») : Date | N° bon | Commande | Référence | Désignation | Emplacement |
  Qté préparée | Stock logiciel | Stock trouvé | Préparateur. Export **propre** (aucune salissure).
- **Feuille « Synthèse »** d'amorce : colonne A « Référence » (les 8, ordre des emplacements), colonne B « Nb constats »
  vide.
- CMD-732153 (annulée, statut C1) a sa ligne de BP dans l'export (préparée avant l'annulation), écart 0.

## 7. Contrôles du dépôt et jalons

Contrôles déclarés (`depot.controles(db)`, valeurs calculées sur l'export de l'élève) :

| Contrôle | Type | Attendu | Fonctions |
|---|---|---|---|
| Colonne « Écart » | colonne, clé N° bon + Référence | trouvé − logiciel | formule exigée (aucune fonction imposée) |
| Colonne « Réf. en écart » | colonne, même clé | la référence si écart ≠ 0, vide sinon | `IF` |
| Synthèse « Nb constats » | table, clé Référence | nombre de constats par référence | `COUNTIF` |

| # | Jalon | Lit | Piège |
|---|---|---|---|
| 1 | Export fait | `db.tableur.exports.preparations` | — |
| 2 | Écart calculé en formule | contrôle « Écart » juste (meilleur dépôt) | un nombre tapé ne valide pas |
| 3 | Références en écart isolées avec SI | contrôle « Réf. en écart » juste, `IF` présent | |
| 4 | Constats comptés par référence avec NB.SI | contrôle Synthèse juste, `COUNTIF` présent | |
| 5 | **Bonne liste à recompter** | message à Nadia, ligne « À recompter : » : **exactement** les références dont la synthèse **déposée par l'élève** compte au moins un constat (sans dépôt : les 4 vraies), **sans intrus** | une erreur de synthèse ne se paie qu'une fois (règle du 03/10) ; `attente` tant qu'aucun message ; envoyer l'amorce vide ne valide rien |

Extraction des références : même fonction qu'ENT-2.3 (casse, espaces, tirets ignorés) — **la mettre en commun**.

## 8. Tests (`outils/test/cdiscount.mjs`)

Valeurs écrites à la main : nombre de lignes de l'export ; les 8 constats (N° bon, référence, écart) ; la synthèse
attendue ; un classeur fabriqué dans le test avec les bonnes formules (`IF`, `COUNTIF`) → jalons 2-4 ok ; liste exacte →
jalon 5 ok ; liste sans BAT → ko ; liste avec ECO en plus → ko ; synthèse déposée fausse (BAT à 0) + liste sans BAT → jalon
4 ko **et** jalon 5 ok. **Sabotages** : valeurs tapées sans formule (jalon 2 doit échouer) ; colonne L avec `COUNTIF` au
lieu de `IF` (jalon 3 doit échouer) ; « stock trouvé » calculé sur le système (aucun constat : le test des 8 constats doit
échouer). Cohérence : les commandes et constats de la fenêtre sont **les mêmes** qu'en ENT-2.3 (le test le vérifie).

## 9. Supports

- Trame élève Word/PDF (Cowork, après validation à l'écran) avec l'encart SI / NB.SI et le cadre **« Ma liste de
  références à recompter »** (que l'élève garde pour ENT-2.3) ; corrigé (Cowork).
- Jusque-là, pas de `trame:` déclarée.

## 10. Critères de validation par Tristan

Exporter, ouvrir le fichier **sous Excel puis sous LibreOffice**, écrire les formules, déposer : le retour guidé nomme les
cases fausses ; quatre références ressortent ; la liste juste valide 5/5 ; une valeur tapée est signalée.

## Niveau de l'élève : standard / confirmé

> **Décision de Tristan (03/10/2026)** : à partir de la série Cdiscount, chaque élève a un niveau **standard** (par
> défaut) ou **confirmé**, réglé par l'enseignant sur la fiche de l'élève (chantier « tiers-temps et niveau élève » :
> nom exact du réglage dans le compte rendu de `MOTEUR-tiers-temps.md`). Un confirmé a **plus d'opérations** à traiter
> — même travail, mêmes aides, mêmes pièges —, en **guidage et en entraînement** ; **l'évaluation est la même pour
> tous** ; **l'élève ne voit jamais son niveau** (aucune étiquette, aucun message qui le trahit). La séance lit le
> niveau dans sa base (`db.niveau`, posé à l'ouverture : `MOTEUR-statut-annulee.md`, partie 2) : il est **figé à la
> première ouverture** ; un changement de niveau ensuite ne touche pas une séance déjà commencée.

**Ce que ça change ici (détails tranchés par Cowork)** :

- **Base identique pour les deux niveaux** : le catalogue couvre **toute l'allée A, A-01-1 à A-06-2 (12 références)** ;
  les quatre références A-05 / A-06 (CAS-FIL-01, SUP-VOIT, CLA-SF-01, HUB-USB-4) ont leurs commandes, **sans aucun
  écart**.
- **Standard** : l'export porte les emplacements **A-01 à A-04** (≈ 30 lignes, 8 références) — inchangé.
  **Confirmé** : l'export porte **toute l'allée A** (≈ 45 lignes, 12 références) ; la feuille « Synthèse » a 12 lignes.
  Les constats restent sur les 4 mêmes références : **la bonne liste est la même** pour les deux niveaux.
- Contrôles et jalons calculés sur l'export de l'élève (rien en dur) ; mission identique (« exportez les lignes de
  préparation de l'allée » : le contenu du fichier dépend du niveau, pas le texte).
- Tests : export et synthèse attendus **par niveau** ; **sabotage** : export du confirmé limité à A-04 (doit échouer).

## 11. Questions — toutes tranchées

> **Réponses données d'avance par Tristan (03/10/2026, Cowork)** : ne pas s'arrêter ; appliquer ces choix et **lister au
> compte rendu** tout ce que tu as choisi seul.

Décisions de fond : signal = constats des préparateurs ; même allée A qu'ENT-2.3, quelques jours avant ; CHG, BAT, COQ,
CAB ; formules Écart / SI / NB.SI ; contrôle des noms de fonctions et des valeurs ; encart dans la trame, rappel dans le
bandeau d'aide ; NB.SI.ENS réservé au bonus.

### Détails tranchés par Cowork (à corriger à l'écran par Tristan)

- [x] `id` : `cdiscount-chiffres` ; fichier contenu `contenus/cdiscount-chiffres.js`.
- [x] **Deux jours** entre ENT-2.2 et ENT-2.3 ; export « depuis le début du mois » (≈ 20 jours), **≈ 30 lignes**.
- [x] **Données importées d'ENT-2.3** (une seule source) ; lignes anciennes ajoutées sans écart.
- [x] Nom du fichier exporté : `cdiscount-preparations-allee-A.xlsx` ; feuilles « Préparations » et « Synthèse ».
- [x] Colonnes de l'export : celles du § 6 ; titres que l'élève ajoute : « Écart » et « Réf. en écart » (pas dans
  l'export : la mission les donne).
- [x] Feuille « Synthèse » d'amorce présente (guidage).
- [x] Libellé du bouton : « Exporter les lignes de préparation » (écran Commandes).
- [x] Textes de Nadia : ceux du § 5. Rappel du bandeau d'aide : « SI(test ; si vrai ; si faux) — NB.SI(plage ; ce qu'on
  compte). Une formule commence par = . »
- [x] Jalon 5 jugé sur la synthèse **déposée** quand il y en a une.
- [x] C3.2 en plus de C1.6 seulement si `core/competences.js` le permet sans autre changement.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** (nombre exact de lignes, constats par référence, noms des préparateurs) :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
