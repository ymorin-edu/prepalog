# Brief de séance — ENT-10.10 Transports Pelleau — le contrôle, seul (CAP OL, entraînement CAP-C1.4)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, docs/briefs/ENT-10.9-pelleau-controler.md puis docs/briefs/ENT-10.10-pelleau-controle-seul.md en entier. Les poids du §5 sont validés par Tristan ; annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : livré (20/10/2026, `pret: true, ouverture: 'prof'`) · **Date** : 18/10/2026 · Cowork, sur délégation · **Modèle** : Sonnet · **Durée estimée** : ≈ 3 h.

---

## 0. Règles communes

Feuille de route Pelleau ; **jeudi 21 mai, 8 h**. Même séance qu'ENT-10.9, **seul** : Erwan est au bureau, aides de comptage éteintes chez le
confirmé et le standard (« Accompagné » : rappel « Fais le tour de la palette » si la vue lit le niveau, sinon standard), anomalies tirées **avec un
niveau de plus** : `produit` (l'étiquette ne dit pas l'article de la feuille : la palette d'Agri-Kerlann est notée « terreau » et l'étiquette dit
« engrais »).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.10 / `pelleau-controle-seul` |
| Titre / desc | « Transports Pelleau — le contrôle, seul » / « Contrôler seul les palettes de la ramasse, écrire les réserves, les faire signer et rendre compte. » |
| Compétence / temps | `CAP-C1.4`, `temps: 'entrainement'` |
| Notation | `bareme: 20`, `parcours`, `correction`, `bilanDetail`, `precedente: 'pelleau-controler'` ; `niveauxPrevus: ['confirme']` ; `questions: 'ENT-10.10'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 4. Déroulé (≈ 40 min)

Comme ENT-10.9 (quai `pelleau-quai-110`, `commence: 'controle'`, feuille de ramasse, signature de Loïc, phrases à Erwan). Motifs `['avarie',
'manquant', 'produit']`, `libelles.produit` : `{ nom: 'Article différent' }`.

## 4 bis. Questions au fil — choix de Cowork : Q1, Q2, Q3

| id | Geste | Qui | Question (juste en gras) | Notée | Corrigée |
|---|---|---|---|---|---|
| `reserve-precise` (Q1) | `quai:pelleau-quai-110:cloturer` | Erwan | « Quelle réserve vaut quelque chose ? » — **« P2 : 2 sacs percés »** · « Marchandise en mauvais état » · « Sous réserve de déballage » | **1,5** | tout de suite (le quai est clos) |
| `article-different` (Q2) | `quai:pelleau-quai-110:valider` (1re palette) | Erwan | « L'étiquette dit « engrais », la feuille dit « terreau ». Tu fais quoi ? » — **je l'écris en réserve : article différent, et on prévient le client** (`reserve`) · je change l'étiquette (`etiquette`) · rien, c'est du jardin pareil (`rien`) | **1,5** | **au bilan** (proche d'un jalon chez les élèves qui ont tiré `produit`) |
| `rendre-meme-3` (Q3) | `messagerie:phrase:fin` | Erwan | « Pourquoi le client doit-il savoir qu'un sac était percé **à l'arrivée** ? » — **pour qu'on ne nous reproche pas, au départ, un sac abîmé dans nos racks** (`preuve`) · pour qu'il nous paie plus (`payer`) · ça ne le regarde pas (`regarde`) | **1** | tout de suite (C. civ. 1932) |

## 4 ter. Avant de commencer

Banque d'ENT-10.9 (mêmes ids), plus `article` (« Un article différent, c'est… » **un produit qui n'est pas celui du document**) et `img-etiquette`.

## 5. Jalons — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

Comme ENT-10.9 : contrôler 8 · réserves et signature 5 · rendre compte 3 · questions 4 = 20.

## 6 bis. Tirage

2 palettes à problème, **une de chaque client** : 1 `facile` + 1 parmi `moyen` (`cache`, `manquant`) ou `difficile` (`produit`, sur Agri-Kerlann seulement),
le difficile une fois sur trois ; 1 piège `couche-normale`. Ordre des palettes dans les cases : celui de la ramasse tirée. Confirmé : pas de bonus
(même camion), aides éteintes.

## 7. Demandes au moteur

Aucune. **À vérifier** : `produit` sur une palette de sacs (l'étiquette lue à ③ dit l'article).

## 8. Tests (bloc `pelleau-ctrl`)

300 graines : deux clients différents, au moins une avarie, `produit` ≈ un tiers ; parcours juste sur 3 graines → 20/20 ; inaction → 0 ; réserve « produit »
avec la mauvaise référence → réserve ✗.

## 9 à 11

Pas de nouvelle trame (celle d'ENT-10.9). Critère : 40 min. Question ouverte : aucune.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

**Livré le 20/10/2026** (sous-agent Sonnet, chantier Pelleau ; rien commité par le sous-agent). Fichiers : `activites/pelleau-controle-seul.js`,
`contenus/pelleau-ent110.js`, `contenus/pelleau-ent110-donnees.js`, `contenus/questions/ENT-10.10.js`, `contenus/corriges/ENT-10.10.js`,
`outils/test/pelleau-110.mjs` (19 cas, 224 cas verts avec `socle dependances tirage-niveaux questions pelleau-109`) ; lignes ajoutées dans `activites/index.js`,
`outils/test.mjs` (`BLOCS`, `GROUPES` groupe 2), `outils/test/socle.mjs` (`ATTENDU_CAP`). Aucun `declarerTirage` (jeu recalculé de la graine, comme ENT-10.9) :
rien dans `BANQUES_FIGEES`, `tirage-niveaux.mjs` non touché. Rien dans `core/`, `styles/`, `contenus/pelleau.js`, `outils/test/pelleau/commun.mjs`.

**Poids codés** (« comme ENT-10.9 », validés par Tristan) : palettes 2,5 (facile) · 2,5 (moyen **ou difficile** : le rôle « moyen » du code) · 1,5 (piège) · 1,5 (conforme)
= 8 ; réserves 1,5 × 2 · déballage 1 · signature 1 = 5 ; compte rendu : réserves 1 · zone litiges 1 · forme 1 (une case : salutation ET fin) = 3 ; questions
(`part: 4`) : Q1 `reserve-precise` 1,5 (tout de suite) · Q2 `article-different` 1,5 (au bilan) · Q3 `rendre-meme-3` 1 (tout de suite). Total 20 ; inaction 0 (testé).

**Tirage** : la ramasse a **un ordre tiré** (les 6 façons de ranger 2 Ar Vag et 2 Agri-Kerlann dans P1 à P4 ; lecture de « ordre des palettes dans les cases : celui de la
ramasse tirée »), 1 facile (`ecrase-face` chez Ar Vag, `perce-face` chez Agri-Kerlann) + 1 moyen de **l'autre client** parmi `cache`, `manquant` et, **seulement
sur Agri-Kerlann**, `produit` (l'étiquette des sacs dit l'engrais `AK-40210`, la feuille dit le terreau `AK-31205`), 1 piège `couche-normale`, 1 conforme. Le
difficile sort 2 fois sur 3 quand l'autre client est Agri-Kerlann, donc **un tirage sur trois en tout** (91 graines sur 300 mesurées). Quantités d'ENT-10.9
(2 devant, 1 derrière, 2 manquants, moitié de la couche du dessus). 300 graines : zéro secours, chaque anomalie tombe sur chaque client possible.

**Écarts avec le brief** : bloc `pelleau-110` (un bloc par séance, décision 21 du chef) au lieu de `pelleau-ctrl` ; `niveauxPrevus: ['confirme', 'accompagne']` (l'accompagné
a un rappel : `aides: { consignes: true }`, qui dit « Fais le tour de la palette si besoin », le comptage reste un brouillon libre ; standard et confirmé : `aides: {}`,
donc aussi plus de chef de quai qui commente « sous réserve de déballage » : Erwan est au bureau) ; Q2 sans le produit (décision 12 du chef) : « Sur un colis, l'étiquette
ne dit pas le même article que la feuille de ramasse. Tu fais quoi ? », troisième choix « Rien, c'est pareil pour le client » (le brief disait « du jardin pareil », qui
nommait Agri-Kerlann) ; Q1 est **calculée** (`selon`) : la bonne réponse nomme SA palette facile (« P3 : 2 sacs percés » ou « P1 : 2 cartons écrasés », le brief ne donnait que
l'exemple P2) ; Q3 dit « un colis » et non « un sac » (tous les élèves n'ont pas un sac percé) ; « Avant de commencer » : la banque d'ENT-10.9 est **recopiée** (une séance
n'importe pas le fichier d'une autre), ids identiques, plus `article` et `img-etiquette` (dessin d'une ligne de feuille et d'une étiquette d'**Ar Vag**, biscuits au beurre /
au chocolat : jamais tiré en « article différent », la notion ne souffle rien) ; l'engrais (`AK-40210`, « Engrais granulé, sacs de 25 kg », même couple que la planche
d'essai du quai) est défini dans `pelleau-ent110-donnees.js`, pas dans l'univers (autre séance en cours dans `contenus/pelleau.js`) ; la palette « article différent » part
**entière** en zone litiges dans la phrase du compte rendu (« … et la palette P4 en zone litiges », construit : on décide avec le client) et la ligne des réserves dit « P4,
article différent (AK-40210) » (construit) ; le message d'Erwan dit qu'il est au bureau (construit, d'après §0). **Pas de demande au moteur** : `produit` sur une palette de
sacs fonctionne tel quel (le zoom lit l'étiquette, la fiche de contrôle a sa case « Référence lue sur l'étiquette », la réserve demande la référence). Non fait : la réplique de
Loïc à la signature reste celle du moteur.

**À vérifier à l'écran par Tristan** : à ③, l'étiquette zoomée d'un sac de la palette « article différent » (engrais) se lit bien et n'est pas écrasée par les autres textes ;
le message et la consigne d'Erwan (« je suis au bureau : tu contrôles seul ») ; les trois questions (Q1 nomme bien sa palette, Q2 générique) ; le nouveau dessin de l'étiquette
d'« Avant de commencer » ; la phrase « la palette P4 en zone litiges » ; les définitions du lexique (`article différent`).
