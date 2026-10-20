# Brief de séance — ENT-10.11 Transports Pelleau — la palette qui craint la chaleur (CAP OL, entraînement CAP-C1.4, erreur induite)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet ; Opus si l'état des lieux du §7 montre que le refus n'existe pas en iso) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, docs/briefs/ENT-10.9-pelleau-controler.md puis docs/briefs/ENT-10.11-pelleau-palette-froide.md en entier. Fais d'abord l'état des lieux du §7 (poids du §5 validés par Tristan), annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : livré (20/10/2026, `pret: true, ouverture: 'prof'`) · **Date** : 18/10/2026 · Cowork, sur délégation · **Modèle** : Sonnet · **Durée estimée** : ≈ 4 h.

---

## 0. Règles communes

Feuille de route Pelleau ; **vendredi 22 mai, 8 h**. **Le piège du froid** (fiche de cadrage du 18/10) : dans la ramasse, une palette de la **Ferme de
Kervéguen** (fictive) : des **plants de pommes de terre**, étiquette « Conserver entre 4 et 8 °C — craint le gel ». **L'entrepôt est ambiant
seulement** (réel : site Pelleau, « exception faite des produits nécessitant un stockage réfrigéré ») et les plants se transportent entre 4 et 8 °C
(réel : site Pelleau). **L'erreur induite** : Loïc dit « Kervéguen veut qu'on la garde deux jours, mets-la au rack, c'est pas grave. »

Écrans : **Avant de commencer → Loïc (dialogue) → Le quai A : contrôler les 4 palettes → Que devient la palette de Kervéguen ? → Rendre compte à
Erwan** → bilan.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.11 / `pelleau-palette-froide` |
| Titre / desc | « Transports Pelleau — la palette qui craint la chaleur » / « Lire les conditions de conservation sur l'étiquette, refuser de stocker ce que l'entrepôt ne sait pas garder, contrôler les autres palettes et rendre compte. » |
| Compétence / temps | `CAP-C1.4`, `temps: 'entrainement'` (erreur induite) |
| Notation | `bareme: 20`, `parcours`, `correction`, `bilanDetail`, `precedente: 'pelleau-controle-seul'` ; `niveauxPrevus: ['confirme']` ; `questions: 'ENT-10.11'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

- **Vérifié** (site Pelleau, 18/10/2026) : stockage **ambiant**, produits réfrigérés exclus ; plants de pommes de terre **entre 4 et 8 °C, jamais au
  gel** ; transport en **température dirigée** proposé par Pelleau. C. civ. 1927, **1928** (soins « avec plus de rigueur » quand le dépositaire est
  payé) — textes d'ENT-10.1.
- **Construit** : la Ferme de Kervéguen (fictive) et sa demande, ce qu'on fait de la palette (elle repart avec Loïc dans un camion à température
  dirigée vers son client ; Maëlys prévient la ferme).

## 3. Objectif

Lire **les conditions de conservation** sur l'étiquette, savoir que **l'entrepôt ne garde que ce qu'il sait garder**, refuser la mise en stock **même
si un collègue dit que ce n'est pas grave**, et dire quoi faire à la place. Les 3 autres palettes : contrôle habituel (entraînement d'ENT-10.10).

## 4. Déroulé (≈ 45 min)

### Étape 1 — Loïc (Dialogue `pelleau-loic-111`, `face: true`)

Loïc : « Salut ! Dans la ramasse, il y a une palette de Kervéguen. Ils veulent qu'on la garde deux jours. Mets-la au rack, c'est pas grave. » —
**« Je lis d'abord l'étiquette, et je demande à Erwan avant de la ranger. »** · « D'accord, je la mets au rack. » · « Je la mets dehors, il fait frais. » ·
« Je ne la regarde pas, ce n'est pas mon client. » — Loïc : « Comme tu veux. » (pas de leçon).

### Étape 2 — Le quai A (`pelleau-quai-111`, `commence: 'controle'`)

- 4 palettes : la palette de Kervéguen (rang tiré, client `kerveguen`, **une case** pour ce client) + 3 palettes Ar Vag / Agri-Kerlann avec **1 anomalie
  tirée** (banque d'ENT-10.10, sans `produit`) et 1 piège `couche-normale` possible.
- Palette de Kervéguen : comptage conforme ; **décision attendue : refuser la mise en stock** (motif `produit`, libellé « Ne se stocke pas ici :
  demande du froid ») — **si la vue iso n'offre pas « Refuser »** (§7), décision « accepter avec réserves », motif `produit`, et la fiche de l'étape 3
  porte le refus (le dire à Tristan).
- Réserves sur la feuille de ramasse, signature de Loïc.

### Étape 3 — Que devient la palette de Kervéguen ? (fiche `cases`, `quand` : quai clos)

« Coche ce qu'on fait de la palette. » Justes : **elle repart avec Loïc dans le camion à température dirigée** · **Maëlys prévient la Ferme de
Kervéguen** ; pièges : on la range au rack du fond, le plus frais · on la laisse sur le quai jusqu'à lundi · on la met dehors.

### Étape 4 — Rendre compte à Erwan (phrases)

salutation · contrôlé (imposée) · Kervéguen (« Je n'ai pas stocké la palette de Kervéguen : des plants à garder entre 4 et 8 °C. ») · réserves (calculé) · fin.

### Fin

Erwan : « Merci {prénom}. Bien vu : chez nous, pas de froid, on ne garde pas. Loïc la reprend. Erwan » — **toujours ce message** (sauf si la palette a
été stockée : « Merci. On en reparle lundi. Erwan » — sans dire « faux »). `finFige`.

## 4 bis. Questions au fil — choix de Cowork : Q1, Q2, Q3, Q4

| id | Geste | Qui | Question (juste en gras) | Notée | Corrigée | Pourquoi |
|---|---|---|---|---|---|---|
| `qui-repond-plants` (Q1) | `fiche:kerveguen` 1re case cochée | Erwan | « Si on avait rangé les plants au rack à 20 °C et qu'ils avaient germé, qui en aurait répondu ? » — **Pelleau, qui les gardait et était payé pour ça** (`pelleau`) · la ferme (`ferme`) · Loïc (`loic`) · personne (`personne`) | **1,5** | tout de suite | **éco-droit appliqué** (C. civ. 1927, 1928) |
| `lire-etiquette` (Q2) | `dialogue:pelleau-loic-111:fin` | Erwan | « Où vois-tu à quelle température garder un produit ? » — **sur son étiquette** (`etiquette`) · sur la facture (`facture`) · dans la cabine du camion (`cabine`) | **1** | **au bilan** (donnerait la décision) | C1.4.1 |
| `chaine-froid` (Q3) | `quai:pelleau-quai-111:cloturer` | Erwan | « Pourquoi ne pas la laisser sur le quai jusqu'à lundi ? » — **le quai n'est pas froid : les plants s'abîmeraient** (`chaud`) · elle gênerait le passage (`passage`) · Kervéguen la reprendra lui-même (`reprendre`) | **1,5** | tout de suite | C1.4.1 |
| `dire-non-2` (Q4) | envoi des phrases | Erwan | « Loïc disait « c'est pas grave ». Qu'est-ce qui t'a aidé à décider ? » — « L'étiquette » · « La règle de l'entrepôt : pas de froid ici » · « Demander à Erwan » · « Rien, j'ai hésité » | réflexion | tout de suite | — |

## 4 ter. Avant de commencer

Banque d'ENT-10.9, plus `ambiant` (d'ENT-10.1, ★), `conservation` (« « Conserver entre 4 et 8 °C » veut dire… » **le produit doit rester au frais, sans
geler** · il peut aller au congélateur · il se garde n'importe où) — **non tirée chez le confirmé** (elle aiderait trop) — et `img-thermometre`.
Écartée : `entrepot-froid` (« Notre entrepôt a-t-il du froid ? » donnerait la décision).

## 5. Jalons — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids |
|---|---|---|
| **Ne pas céder** | bonne réplique au premier choix | **2** |
| **La palette de Kervéguen** | décision (refus, ou réserve « produit » si pas de refus) 3 · « que devient-elle ? » (2 justes, rien de trop) 2 | **5** |
| **Contrôler les autres palettes** | 3 palettes : comptage et décision, 1 chacune ; la palette à problème 1 de plus | **4** |
| **Réserves et signature** | réserve juste 1 · pas de déballage 0,5 · signature 0,5 | **2** |
| **Rendre compte** | Kervéguen 1 · réserves 1 · forme 1 | **3** |
| **Questions** | Q1 1,5 · Q2 1 · Q3 1,5 | **4** |
| **Total** | | **20** |

Inaction : 0.

## 6 bis. Tirage

Rang de la palette de Kervéguen (P1 à P4), anomalie des autres palettes (1 parmi `ecrase-face`, `perce-face`, `cache`, `manquant`), piège de comptage
une fois sur deux. Confirmé : `conservation` non tirée, aides éteintes, pas de bonus.

## 7. Demandes au moteur (état des lieux d'abord)

- **« Refuser »** en quai iso sous `commence: 'controle'` : existe-t-il (décisions du quai) ? Sinon, repli décrit au §4 ; **ne pas** écrire de demande
  au moteur sans l'accord de Tristan (c'est une option de vue).
- Étiquette « Conserver entre 4 et 8 °C — craint le gel » lisible à ③ (texte d'étiquette d'une palette) ; une palette d'un 3e client dessinée sous
  `commence` (une case `kerveguen`).
- Pas de `froid: true` (il est incompatible avec l'iso) : l'entrepôt **n'est pas** froid, c'est tout le sujet.

## 8. Tests (bloc `pelleau-ctrl`)

Parcours juste → 20/20 ; palette stockée (acceptée) → bloc 2 ✗ et message de fin neutre ; « on la range au fond » coché → ✗ ; « D'accord, je la mets au
rack » → bloc 1 ✗, l'élève finit ; 300 graines : rang de Kervéguen uniforme ; Q2 au bilan.

## 9 à 11

Trame : étiquette de la palette imprimée (noir et blanc, lisible). Critère : la mention de température se lit au vidéoprojecteur. Question ouverte :
le repli si « Refuser » n'existe pas (§7).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

**Livré le 20/10/2026** (sous-agent Sonnet, chantier Pelleau ; rien commité par le sous-agent). Fichiers : `activites/pelleau-palette-froide.js`, `contenus/pelleau-ent111.js`,
`contenus/pelleau-ent111-donnees.js`, `contenus/questions/ENT-10.11.js`, `contenus/corriges/ENT-10.11.js`, `outils/test/pelleau-111.mjs` (24 cas) ; lignes ajoutées dans
`activites/index.js` (sous ENT-10.10), `outils/test.mjs` (`BLOCS`, `GROUPES` groupe 3), `outils/test/socle.mjs` (`ATTENDU_CAP`). Aucun `declarerTirage` (jeu recalculé de la
graine, comme ENT-10.9) : rien dans `BANQUES_FIGEES`, `tirage-niveaux.mjs` inchangé. **Le §7 est sans objet** : « Refuser » existe à ③ en quai iso sous `commence: 'controle'` ;
aucune demande au moteur n'a été écrite dans le code.

**Poids codés** (ceux du §5, tels quels) : ne pas céder 2 · Kervéguen : décision 3, « que devient-elle ? » 2 · autres palettes : à problème 2 (1 + 1), chacune des deux
autres 1 · réserves 1 · pas de déballage 0,5 · signature 0,5 · compte rendu : Kervéguen 1, réserves 1, forme 1 (UNE case : salutation ET fin) · questions Q1 1,5 · Q2 1 (au bilan)
· Q3 1,5 (`part: 4`). Total 20 ; inaction 0 (testé).

**Tirage** : le rang de la palette de Kervéguen (P1 à P4, 32 sacs, étiquette « Conservation : entre 4 et 8 °C — craint le gel ») ; trois palettes habituelles (Ar Vag, Agri-Kerlann,
Ar Vag) aux rangs restants ; UNE palette à problème parmi elles (`ecrase-face` / `perce-face` selon le client, `cache`, `manquant`) ; un piège `couche-normale` une fois sur deux.
300 graines : zéro secours, chaque rang entre 62 et 86, chaque anomalie tombe. La banque d'ENT-10.10 n'existait pas encore : le tirage est celui d'ENT-10.9 recomposé (rien
n'est importé d'une autre séance). Quantités reprises d'ENT-10.9 (construit).

**Écarts avec le brief** : (1) le motif du refus s'appelle « Ne se stocke pas ici » et non « Ne se stocke pas ici : demande du froid » : ce menu est le même pour les quatre palettes et
se lit avant l'étiquette, « demande du froid » aurait dit le piège (règle « que, jamais de combien ») ; (2) Q3 dit « deux jours » et non « jusqu'à lundi », et le message neutre d'Erwan
« On en reparle. » (décision n° 9 : jamais le jour de la semaine) ; (3) la fiche s'appelle `kerveguen-111` (ids suffixés) ; (4) « réserve juste 1 » = UNE case qui demande la réserve de la
palette à problème ET la ligne de refus de la palette de Kervéguen (le brief ne dit pas laquelle) ; (5) les trois mauvaises réponses à Loïc portent `accepte: true` : il dit « Comme tu veux. »
et l'entretien continue (l'élève qui cède arrive au quai avec son erreur) ; (6) niveaux : standard et accompagné = aides de guidage d'ENT-10.9 allumées, confirmé = aides de comptage
éteintes (le brief le dit seulement du confirmé) ; (7) Erwan dit « Bien vu : chez nous, pas de froid, on ne garde pas. Loïc la reprend. » dès que la palette est refusée (quel que soit
le reste), sinon « Merci. On en reparle. » ; (8) fiche : « (avec du froid) » ajouté derrière « température dirigée » (les mots du brief, expliqués) ; (9) le bloc de test porte un filtre
`SEUL_111="un morceau de titre|un autre"` pour rejouer quelques cas en travaillant (sans effet sans la variable).

**À décider par le chef / Tristan (demandes au moteur, non faites)** : (a) la ligne de la feuille de ramasse pour un refus « produit » est écrite par le quai : « P1 KG-10633 : palette
REFUSÉE — produit livré KG-10633 au lieu de KG-10633 commandé. 32 colis repris par le chauffeur. » : le début est faux pour un refus « ne se stocke pas ici » (même référence des deux côtés) ;
(b) le tirage de l'écran « Avant de commencer » ne connaît pas le niveau : la notion `conservation` reste dans la banque pour tous (le brief la veut absente chez le confirmé) ;
(c) l'étiquette d'un carton ou d'un sac ne dit jamais un total (« 1 sac ») : un élève peut lire « Colis 5 / 32 » sur le sac de Kervéguen, ce qui est juste (32 sacs).

**À vérifier à l'écran par Tristan** : les sacs de Kervéguen se distinguent des cartons d'Ar Vag à ③ ; la ligne « Conservation » se lit au vidéoprojecteur ; la phrase de réserve du refus (a) ;
les textes de l'écran « Avant de commencer » écrits par Claude Code (thermomètre, `conservation`, `aide`, `retour`), les définitions du lexique et les retours de Q1 à Q3 ; la
réplique « Je la mets dehors, il fait frais » (brief) dit un peu le piège : c'est un choix du brief, laissé tel quel ; le choix des mots « température dirigée (avec du froid) ».
