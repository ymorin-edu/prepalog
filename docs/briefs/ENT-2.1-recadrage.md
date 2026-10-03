# Brief de séance — ENT-2.1 Cdiscount « Le stock raconte » (recadrage)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-cdiscount.md puis implémente le brief docs/briefs/ENT-2.1-recadrage.md (le statut « Annulée » doit être livré : MOTEUR-statut-annulee.md). Annonce la durée, dis-moi si un point du brief contredit le code, puis enchaîne sans attendre : les questions du brief sont déjà tranchées (§11).
> ```

**Statut** : à implémenter — **après** `MOTEUR-statut-annulee.md` (C1).
**Date du brief** : 03/10/2026
**Modèle** : Sonnet — **Durée estimée par Cowork** : 1 h 30 à 2 h 30 (données refaites, jalon 6, réécriture des cas de
test et des sabotages).
**Conception** : fiche du projet `claude/prepalog-ent21-cadrage-detaille.md` (**cadrage validé par Tristan le
03/10/2026**, six décisions) — ce brief en est la traduction ; en cas de doute, la fiche fait foi pour le fond.
Fil rouge de la série : `claude/prepalog-cdiscount-recadrage.md`.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-2.1 / `cdiscount-mouvements` (**id inchangé**) |
| Titre | « Cdiscount — le stock raconte » (inchangé) |
| desc | « Une cliente n'a pas reçu ses écouteurs : remonter les mouvements de stock jusqu'à l'erreur. » |
| Rubrique | logisim |
| Niveau | 1re |
| Compétence | C1.6 (C1.6.1 flux d'information ; prépare C1.6.2 inventaire) |
| Temps | **guidage** |
| Notation | `avancement`, **6 jalons** (5 aujourd'hui) |
| Volume | 5 références, 12 documents, ~20 mouvements (`VOLUME` à mettre à jour) |
| `reinitialisable` | `true` (inchangé : séance X.1) |
| Pendant le chantier | **`ouverture: 'prof'`** (demandé dans `docs/decisions.md`) ; `pret: true` gardé |

## 2. Vérifié / construit

**Vérifié (03/10/2026)**, sources dans `claude/prepalog-cdiscount-recadrage.md` : Cestas (Gironde) traite les articles de
moins de 30 kg ; 110 000 m² ; filiale logistique C-Logistics ; à Noël 2017, 300 000 colis par jour, effectif triplé depuis
mi-novembre, site à pleine capacité depuis le Black Friday (**chiffres de 2017, à présenter comme anciens**) ; Black
Friday 2026 = vendredi 27 novembre.

**Construit** : le lien « stock du logiciel = disponibilité affichée sur le site » (logique générale du commerce en
ligne, pas un fait publié par Cdiscount), la cliente, sa commande, sa réclamation, les quantités, les mouvements,
l'équipe (Nadia Ferrand, Kevin Larrieu, service retours). **Aucun chiffre vérifié n'est écrit dans la séance** (ils
vont dans la trame).

## 3. Objectif

Aujourd'hui l'élève reconstitue la semaine d'un article sans savoir pourquoi. Demain il part d'une **commande
annulée** — le site affichait les écouteurs en stock, le préparateur a trouvé le rayon vide — et remonte les
mouvements **jusqu'au document qui cloche** : un constat de casse de **2** boîtiers, saisi **−1**. Le savoir-faire ne
change pas (lire Stock et Mouvements, relier chaque mouvement à son document, recalculer à l'envers) ; il gagne une
raison et une dernière étape : **comparer chaque document à son mouvement**. Prépare ENT-2.2 (« la prochaine fois, on
regarde toute l'allée »).

## 4. L'histoire et les chiffres (article cible ECO-BT-01, A-02-1, mini 8)

Inventaire il y a 7 jours : **4** (stock bas → réception du lendemain).

| Quand | Document | Mouvement système | Stock système | Stock réel = « Stock trouvé » du BP |
|---|---|---|---|---|
| J-7 | Inventaire | — | 4 | 4 |
| J-6 | CMD-731402 (BP) | −2 | 2 | trouvé 4 → reste 2 |
| J-5 | REC-26-0415 | +10 | 12 | 12 |
| J-4 | CMD-731488 | −1 | 11 | trouvé 12 → 11 |
| J-4 | RET-26-0091 (retour de CMD-731402, neuf, remis en rayon) | +1 | 12 | 12 |
| J-3 | **DEM-26-0027 — le constat dit 2 boîtiers écrasés** | **−1** | 11 | **10** |
| J-3 | CMD-731530 | −3 | 8 | **trouvé 10** (système 11) → 7 |
| J-2 | CMD-731561 | −3 | 5 | trouvé 7 (système 8) → 4 |
| J-1 | CMD-731578 | −2 | 3 | trouvé 4 (système 5) → 2 |
| J-1 | CMD-731590 | −2 | **1** | trouvé 2 (système 3) → **0** |
| ce matin | **CMD-731602** (la cliente) : 1 paire, rayon vide → **`annulee`** | **aucun** | 1 | trouvé **0** |

Contrôles : 4 − 2 + 10 − 1 + 1 − 1 − 3 − 3 − 2 − 2 = **1** ; avec −2 pour la casse = **0**. Calcul à l'envers attendu :
1 − 11 (entrées : 10 + 1) + 14 (sorties : 13 préparées + 1 casse saisie) = **4**.

**« Stock trouvé » sur le stock réel (décision 3)** : le volet calcule `prep.rows[sku].seen` sur un **stock réel
parallèle** (le stock système où la casse compte pour `CASSE.constatee = 2`), pas sur le stock système comme aujourd'hui.
Valeurs recalculées par le code, jamais recopiées.

**CMD-731602** : semée avec `annulee: { motif, at }` (C1), une seule ligne (ECO × 1), **aucun mouvement** ; son BP figé
reste lisible (stock trouvé 0, statut de ligne « Rupture »).

**Distracteurs gardés** : les quatre autres références de l'allée bougent aussi (réception REC-26-0412 sans écouteurs,
deux commandes sans écouteurs) ; pour elles, réel = système.

**Deux pièges voulus** : (1) la commande de la cliente n'a fait bouger aucun stock — la citer parmi les commandes
« parties avec des écouteurs », c'est ne pas avoir lu les mouvements ; (2) le retour client est juste — fausse piste
naturelle, l'élève doit vérifier, pas soupçonner.

## 5. Messages

| Arrivée | De | Contenu |
|---|---|---|
| ouverture | Nadia | Bienvenue (inchangé) |
| ouverture | Nadia | **Mission recadrée, réclamation incluse** (décision 5) : commande CMD-731602 annulée ce matin, le site affichait ECO-BT-01 en stock, le préparateur a trouvé A-02-1 vide ; extrait de la réclamation ; « le système dit encore qu'il en reste un » ; « avant le Black Friday » (décision 6, sans délai chiffré) ; « je veux savoir où le système s'est trompé » ; les quatre tâches d'aujourd'hui + une cinquième : « comparez chaque document à son mouvement » ; deux temps conservés (option B) ; amorce à **7** lignes |
| après le 1er envoi « Stock actuel : … » (juste ou faux) | Service retours | RET-26-0091 (inchangé : neuf, remis en stock) |
| idem | Kevin Larrieu | **Constat DEM-26-0027 : « Quantité : 2 »**, « un carton est tombé du chariot en A-02, deux boîtiers écrasés, invendables », **« Saisi sur le terminal »** (décision 4) |
| après l'envoi de la réponse complète (ligne « Ce qui cloche » remplie, juste ou fausse) | Nadia | **Neutre** (alerte 28) : « Merci, je relis. Une erreur sur un article, il y en a peut-être d'autres : la prochaine fois, on regarde toute l'allée. » Aucun jalon n'en dépend |

## 6. La réponse à Nadia : 7 lignes (`LIGNES_REPONSE`)

```
Stock actuel :
Réception :
Commandes :
Retour :
Casse :
Stock au dernier inventaire :
Ce qui cloche :
```

## 7. Jalons (tous calculés depuis la base de l'élève, rien en dur)

| # | Jalon | Lit | Piège |
|---|---|---|---|
| 1 | Stock actuel relevé | dernier nombre de la ligne = `stock[ECO]` (1) | inchangé |
| 2 | Réception retrouvée | REC-26-0415 et 10, sans REC-26-0412 | inchangé |
| 3 | Commandes citées, et seulement elles | les 6 CMD avec mouvement ECO | **CMD-731602 citée = ko**, avec un **détail exprès** : « commande annulée : elle n'a fait bouger aucun stock ». La règle actuelle (intrus = commande de `orders` hors liste) la compte déjà comme intrus : vérifier, puis ajouter le détail |
| 4 | Retour et casse identifiés | inchangé | |
| 5 | Stock d'inventaire recalculé | dernier nombre = stock − somme des deltas (4) | inchangé |
| 6 | **Erreur trouvée** | ligne « Ce qui cloche » : cite **DEM-26-0027**, son **dernier nombre = 1** (constatée − saisie ; la constatée vient de `CASSE.constatee`, la saisie des mouvements), **ne cite aucun autre document** | ne doit pas valider « RET-26-0091 » (fausse piste) ; `attente` tant qu'aucune réponse |

## 8. Ce que ça touche dans le dépôt

| Fichier | Changement |
|---|---|
| `contenus/cdiscount-mouvements.js` | `INVENTAIRE[ECO]` 24 → 4 ; REC-26-0415 12 → 10 ; commandes refaites (§ 4) ; `CASSE.constatee = 2` ; « Stock trouvé » sur le stock réel ; CMD-731602 `annulee` ; mission (avec réclamation), constat (« Quantité : 2 », « Saisi sur le terminal »), message de clôture ; `LIGNES_REPONSE` (7) ; jalon 6 ; `VOLUME` ; en-tête |
| `activites/cdiscount-mouvements.js` | `desc`, commentaire d'en-tête (corriger « trame PAS déclarée » si besoin, voir § 9) ; `ouverture: 'prof'` |
| `outils/test/cdiscount.mjs` | **cas ENT-2.1 réécrits** (alerte n° 7 : le dire) — valeurs écrites à la main : 1, 4, 10, écart 1, « Stock trouvé » 10 / 7 / 4 / 2 / 0 ; sabotages : jalon 6 sans comparer, CMD-731602 citée, RET cité comme cause |
| **À ne pas casser** | `cdiscount-inventaire.js` importe `TYPES` d'ici ; `cdiscount-regularise.js` importe `ligne`, `nombres` : **exports gardés**. L'autre allée (ENT-2.3) a sa propre casse DEM-26-0031 : pas de collision |

**Élèves ayant déjà commencé** : aucun (décision du 03/10) → pas de garde de compatibilité ; la garde « Bienvenue déjà
reçue » existante reste. Page d'essai : `outils/essai-cdiscount.html`.

## 9. Supports

- Trame élève et corrigé : **régénérés par Cowork après validation à l'écran** (`outils/trame-cdiscount-mouvements.py`,
  `corriges_data.py` → `ENT_2_1`, `contenus/trames/ENT-2.1-*`, `contenus/corriges/ENT-2.1.js`). Claude Code **ne les
  touche pas** ; le corrigé actuel devient faux après ce chantier : le dire au compte rendu.
- Écart signalé par Cowork (alerte 26) : la fiche `prepalog-ou-on-en-est.md` dit la trame d'ENT-2.1 « déclarée » ; le
  code lu le 03/10 n'a pas de champ `trame:`. Sans conséquence (la trame va être refaite), rien à faire ici.

## 10. Critères de validation par Tristan

Jouer la séance en élève : (1) la mission parle de la cliente ; (2) CMD-731602 s'affiche « Annulée » ; (3) la colonne
« Stock trouvé » des bons décroche du système à partir de CMD-731530 ; (4) le constat de Kevin dit 2 et « saisi sur le
terminal » ; (5) une réponse complète juste donne 6/6 ; citer CMD-731602 fait tomber le jalon 3 avec le détail ; écrire
« RET-26-0091 » dans « Ce qui cloche » ne valide pas le jalon 6.

## 11. Questions — toutes tranchées

> **Réponses données d'avance par Tristan (03/10/2026, Cowork)** : ne pas s'arrêter ; appliquer ces choix et **lister au
> compte rendu** tout ce que tu as choisi seul (noms, textes, chiffres) pour que Tristan le corrige à l'écran.

Décisions de fond : les six de la fiche de cadrage (cause = casse 2 saisie −1 ; vrai statut « Annulée » ; « Stock trouvé »
= stock réel ; « Saisi sur le terminal » ; réclamation dans la mission ; « avant le Black Friday » sans délai).

### Détails tranchés par Cowork (à corriger à l'écran par Tristan)

- [x] **La cliente** : client **C0019** de `CUSTOMERS` (déjà le destinataire de CMD-731602 aujourd'hui) ; le nom affiché
  est celui que génère `cdiscount.js` (« Mme <nom> »), jamais recopié à la main.
- [x] **Sa réclamation** (extrait cité dans la mission, entre guillemets) : « J'ai commandé des écouteurs affichés en
  stock sur le site, et ce matin on m'annonce que ma commande est annulée. C'était pour un cadeau. Ce n'est pas
  sérieux. »
- [x] **Motif d'annulation** de CMD-731602 : « Rupture : emplacement A-02-1 vide à la préparation ».
- [x] **Les commandes refaites** : les six commandes ECO du § 4 (CMD-731402, 731488, 731530, 731561, 731578, 731590) ;
  CMD-731530 garde ses lignes CAB et COQ ; **deux commandes sans écouteurs** : CMD-731455 (CAB × 3, CHG × 1, inchangée)
  et une nouvelle **CMD-731545** (BAT × 1, COQ × 2, J-3) ; les clients des commandes nouvelles sont pris dans
  `CUSTOMERS` (C0001 à C0020), au choix de Claude Code.
- [x] **Jalon 6, lecture de l'écart** : le **dernier nombre de la ligne** doit valoir 1 (même convention que les lignes
  1 et 5 : « résultat à la fin de la ligne ») ; la ligne peut contenir d'autres nombres (2, 1) avant.
- [x] **Consigne de Nadia pour la 7e ligne** : « Ce qui cloche : (le document dont la quantité ne correspond pas à son
  mouvement, et l'écart à la fin de la ligne) ».
- [x] **Cinquième tâche de la mission** : « 5. Comparez chaque document à son mouvement : la quantité écrite sur le
  document est-elle celle qui est entrée ou sortie du stock ? »
- [x] **Heures** : celles de la table du § 4 ; à l'intérieur d'une journée, Claude Code place les heures (le constat
  DEM-26-0027 avant CMD-731530 le même jour).
- [x] **Volume déclaré** : `{ references: 5, documents: 12, mouvements: <compté par le code> }`.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** : bloc / suite entière, nombre de cas, sabotages éprouvés
- **Commits** :
- **Reste ouvert** :
