# Brief de séance — ENT-10.12 Transports Pelleau — évaluation : contrôler la réception (CAP OL, évaluation CAP-C1.4)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, les briefs ENT-10.9 à ENT-10.11 puis docs/briefs/ENT-10.12-pelleau-evaluation-controle.md en entier. Les poids du §5 sont validés par Tristan ; annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : livré (20/10/2026, `pret: true, ouverture: 'prof'`) · **Date** : 18/10/2026 · Cowork, sur délégation · **Modèle** : Sonnet · **Durée estimée** : ≈ 4 h.

---

## 0. Règles communes

Feuille de route Pelleau ; **mardi 26 mai, 8 h** (le lundi 25 mai est férié). `copie: true`, sans aide, un jeu tiré par élève, rien ne dit juste ou
faux avant la remise ; `rendCopie: false` (la copie se rend après le compte rendu). Dernière séance de Pelleau.

Écrans : **Avant de commencer (notée) → Le quai A : contrôler, réserves, signature → Rendre compte à Erwan** → remise.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.12 / `pelleau-evaluation-controle` |
| Titre / desc | « Transports Pelleau — évaluation : contrôler la réception » / « Contrôler seul les palettes de la ramasse, décider pour chacune, écrire les réserves, les faire signer et rendre compte, sans aide. » |
| Compétence / temps | `CAP-C1.4`, `temps: 'evaluation'` |
| Notation | `bareme: 20`, `copie: true`, `noter`, `parcours`, `precedente: 'pelleau-palette-froide'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 4. Déroulé (≈ 45 min)

- **Ouverture notée** (4 / 20) : `tirage: { preparation: 3, image: 1 }` parmi les `cle` d'ENT-10.9 à 10.11 (reserve, avarie, couches avec valeurs
  tirées, depot, ambiant ; img-sac), règle des évaluations.
- **Quai** `pelleau-quai-112`, `commence: 'controle'`, feuille de ramasse, motifs `['avarie', 'manquant', 'produit']` (+ refus si l'ENT-10.11 l'a
  trouvé), 4 palettes (2 Ar Vag, 2 Agri-Kerlann, ou 1 de Kervéguen à la place d'une : voir §6 bis), **2 anomalies tirées** + 1 piège de comptage.
- **Phrases** à Erwan (calculées : réserves, zone litiges, et la palette non stockée s'il y en a une) → « Rendre ma copie ».

## 5. Jalons — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids |
|---|---|---|
| **Avant de commencer** | 4 questions | **4** |
| **Contrôler les palettes** | 2 sans problème 1,5 chacune · 2 à problème 2,5 chacune | **8** |
| **Réserves et signature** | réserves justes 1,5 × 2 · pas de déballage 0,5 · signature 0,5 | **4** |
| **Rendre compte** | contenu 3 · forme 1 | **4** |
| **Total** | | **20** |

## 6 bis. Tirage et équité

- Socle : 1 anomalie `facile` (`ecrase-face` / `perce-face`) + 1 `moyen` parmi `cache`, `manquant`, **`froid`** (la palette de Kervéguen remplace alors
  une palette sans problème du même rang) ; 1 piège `couche-normale` ; deux clients différents pour les deux anomalies (Kervéguen compte comme un
  client).
- **Équité** : chaque copie a exactement 2 palettes à problème et 1 piège ; `froid` un tiers des copies environ. Pas de bonus ni de niveau.

## 7. Demandes au moteur

Aucune (ce qu'ENT-10.11 a établi sur « Refuser » s'applique ici).

## 8. Tests (bloc `pelleau-ctrl`)

Parcours juste sur 3 graines (avec `cache`, `manquant`, `froid`) → 20/20 ; inaction → 0 ; rien ne dit juste / faux avant la remise ; 300 graines :
équité vérifiée ; ouverture : plancher 0.

## 9 à 11

Pas de trame ; corrigé enseignant par élève. Critère : 45 min. Question ouverte : aucune.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

**Livré le 20/10/2026** (sous-agent Sonnet, chantier Pelleau ; rien commité par le sous-agent). Fichiers : `activites/pelleau-evaluation-controle.js`, `contenus/pelleau-ent112.js`,
`contenus/pelleau-ent112-donnees.js`, `contenus/questions/ENT-10.12.js`, `contenus/corriges/ENT-10.12.js`, `outils/test/pelleau-112.mjs` (21 cas) ; lignes ajoutées dans `activites/index.js`
(sous ENT-10.11), `outils/test.mjs` (`BLOCS`, `GROUPES` groupe 4), `outils/test/socle.mjs` (`ATTENDU_CAP`). Aucun `declarerTirage` (jeu recalculé de la graine, comme ENT-10.9 à 10.11) :
rien dans `BANQUES_FIGEES`, `tirage-niveaux.mjs` inchangé. **Aucune demande au moteur** ; rien écrit dans `core/` ni `styles/`.

**Poids codés** (ceux du §5, tels quels) : palettes sans problème 1,5 × 2 · palettes à problème 2,5 × 2 (comptage ET décision) · réserves justes 1,5 × 2 · pas de déballage 0,5 · signature 0,5 ·
compte rendu : contenu 3 (UNE case : réserves ET zone litiges ET, s'il y en a une, la palette non stockée), forme 1 (UNE case : salutation ET fin) · ouverture 4 (`part: 4`). Total 16 + 4 = 20 ;
inaction 0 (testé : rien de vrai avant la signature ni l'envoi).

**Tirage** (par graine, 300 graines vérifiées) : chaque copie a exactement 2 palettes à problème (une `facile` : 2 cartons écrasés chez Ar Vag ou 2 sacs percés chez Agri-Kerlann ; une `moyen` :
colis caché derrière, 2 manquants, ou — une copie sur trois, 109 sur 300 — la palette de la Ferme de Kervéguen à REFUSER), 1 piège de comptage, 1 palette conforme ; les deux palettes à problème
sont de deux clients différents (Kervéguen compte comme un client) ; le rang de Kervéguen couvre P1 à P4. Ouverture : 4 questions tirées sur 9 (3 sur 7 + 1 image sur 2), sans aide.

**Écarts avec le brief** : (1) **ni `parcours` ni `precedente`** (consigne du chef, et le brief §1 les citait) : l'évaluation s'ouvre quand l'enseignant la coche, comme ENT-10.8 ; (2) le brief dit que la palette
de Kervéguen « remplace une palette sans problème du même rang » : je l'ai lue ainsi — elle prend le rang d'une des quatre palettes de la ramasse de base (2 Ar Vag + 2 Agri-Kerlann) ET c'est elle la palette
« moyenne » à problème ; la facile, le piège et la conforme sont les trois autres (**à confirmer par Tristan**) ; (3) pas de dialogue avec Loïc ni de fiche « que devient la palette ? » (le brief §0 ne les met pas) :
Loïc n'apparaît qu'à la signature, au quai ; (4) banque de l'ouverture : `conservation` et `img-thermometre` (★ d'ENT-10.11) **écartées** (elles diraient la décision), `manquant`, `zone-litiges` et
`img-carton-ecrase` (non ★) ajoutées pour atteindre le double exigé par le moteur (6 + 2) ; « Pelleau en bref » est recopié sans ses mots cliquables (`pelleau-112`, une évaluation n'en a aucun) ;
(5) le menu des motifs dit « Ne se stocke pas ici » (comme ENT-10.11, il ne dit rien du froid) et la zone « KERVÉGUEN » est dessinée au sol dans TOUTES les copies (vide quand la copie n'a pas de palette de
Kervéguen), pour que le quai ne dise rien du tirage ; (6) le premier message d'Erwan, le compte rendu demandé et le message de fin sont les mêmes pour tous (aucun ne parle des palettes ni du froid) ;
la ligne « palette non stockée » du compte rendu n'existe que dans les copies qui ont une palette de Kervéguen (brief §4 : « s'il y en a une »), elle arrive après la clôture du quai.

**Demande au chef / au moteur** : la ligne de la feuille de ramasse pour un refus « produit » (écrite par le quai) reste à corriger par le chantier moteur en cours ; les tests de cette séance n'affirment que
le mot « REFUSÉE » et le motif choisi. L'étiquette d'un sac affiche « Colis 5 / 32 » (alerte c d'ENT-10.11) : un élève peut y lire le total, ce qui ne dit pas le froid. « Ce que tu vois de ce colis depuis ici : intact »
reste affiché au zoom, en copie comme en guidage (moteur).

**Sabotages joués puis remis** (bloc `pelleau-112`, 21 cas ; tout est remis, le bloc repasse à 21 / 21 et `socle dependances copie questions pelleau-111 pelleau-112` à 226 / 226) :

| Sabotage | Cas tombés |
|---|---|
| Signature et « pas de déballage » vrais par inaction | « Avant de commencer » (la note monte de 1), « inaction » |
| `rendCopie` retiré : le quai rend la copie seul | la déclaration, les 4 parcours justes, « en copie rien ne réagit », les 4 cas de fautes, « pire cas », « socle » (12 cas) |
| `copie: true` retiré (réactions, verdicts, arrêts du guidage) | 14 cas dont la déclaration, « en copie rien ne réagit », « inaction », « Avant de commencer » |
| « du froid » ajouté à la consigne d'Erwan, puis au motif « Ne se stocke pas ici » | « que, jamais de combien » et jamais « froid » avant l'étiquette (seul, deux fois) |
| Tirage sans froid | 13 cas (jeux témoins, 300 graines, tirage stable, compte rendu calculé, parcours froid, corrigé…) |
| Palette de Kervéguen attendue « accepter » | 8 cas (jeux témoins, parcours froid ×2, « en copie rien ne réagit », accepter/refuser, déballage, pire cas) |
| Poids de `palette-piege` à 2 | 14 cas (déclaration, ouverture, inaction, parcours, fautes…) |

**À vérifier à l'écran par Tristan** : les textes de l'écran « Avant de commencer » écrits par Claude Code (les 9 questions, leurs choix), les trois messages d'Erwan, les phrases du compte rendu (réserves, zone litiges,
palette non stockée) ; que la zone « KERVÉGUEN » vide au sol (copies sans froid) ne gêne pas ; la lecture de la ligne « Conservation » au vidéoprojecteur ; la lecture (2) ci-dessus du « remplace une palette sans problème
du même rang » ; que l'élève qui accepte la palette froide n'est jamais arrêté ni repris (rien ne dit « faux » avant la remise).
