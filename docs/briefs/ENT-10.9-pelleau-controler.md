# Brief de séance — ENT-10.9 Transports Pelleau — contrôler les palettes des clients (CAP OL, guidage CAP-C1.4)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, docs/briefs/ENT-8.8-action-controler.md (le modèle du contrôle) puis docs/briefs/ENT-10.9-pelleau-controler.md en entier. Les poids du §5 sont validés par Tristan ; fais l'état des lieux du §7, annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : à implémenter · **Date** : 18/10/2026 · Cowork, sur délégation · **Modèle** : **Opus** · **Durée estimée** : ≈ 4 h (anomalies tirées et
leur équité, phrases calculées, tests).

---

## 0. Règles communes

Feuille de route Pelleau ; **mercredi 20 mai, 8 h**. Les 4 palettes de la ramasse du matin sont déjà **triées par client** en zone de réception
(`commence: 'controle'`) ; Loïc attend au local. **Ce qui est propre à Pelleau** : le conducteur est un collègue, et la marchandise ne part pas en
magasin : **Pelleau la garde pour son client**. Les réserves s'écrivent quand même, sur la **feuille de ramasse**, et Loïc les signe : le client doit
savoir dans quel état sa marchandise est entrée, et Pelleau doit pouvoir le prouver (C. civ. 1932). Ce que fait déjà ENT-8.8 (Action) : comptage
par couches, avaries, réserves précises, signature ; ENT-10.9 le reprend **en guidage**, avec des **sacs** (Agri-Kerlann) en plus des cartons.

Écrans : **Avant de commencer → Le quai A : contrôler, écrire les réserves, faire signer → Rendre compte à Erwan** → bilan.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.9 / `pelleau-controler` |
| Titre / desc | « Transports Pelleau — contrôler les palettes des clients » / « Compter les colis de chaque palette, repérer ce qui est abîmé ou manque, écrire des réserves précises sur la feuille de ramasse, les faire signer et rendre compte. » |
| Compétence | `competencesCap: ['CAP-C1.4']` ; C1.4.1 anomalies et avaries · C1.4.2 documents · C1.4.3 rendre compte |
| Temps | `temps: 'guidage'` |
| Notation | `bareme: 20`, `parcours`, `correction`, `bilanDetail`, `precedente: 'pelleau-evaluation-reception'` ; `niveauxPrevus: ['confirme']` ; `questions: 'ENT-10.9'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

- **Vérifié** : C. civ. 1927, 1928, 1932 (dépôt ; textes d'ENT-10.1) ; entrepôt ambiant (site Pelleau).
- **Construit** : les palettes, les anomalies tirées, la feuille de ramasse, la saisie par Maëlys.
- **Repère, pas un texte à fournir** : le délai de 3 jours du C. com. L133-3 vaut contre un **transporteur** ; ici le transporteur est Pelleau lui-même :
  la question n'est pas posée (elle l'est chez Action, ENT-8.8).

## 3. Objectif

Contrôler une palette contre la feuille de ramasse (compter par couches, faire le tour, lire l'étiquette), **décider** (accepter / accepter avec
réserves), écrire une **réserve précise**, la **faire signer**, **rendre compte**. Premier temps de C1.4 chez Pelleau ; 10.10 entraîne, 10.11 piège
(le froid), 10.12 évalue.

## 4. Déroulé (≈ 45 min)

### Étape 0 — Avant de commencer (Erwan) — §4 ter

### Étape 1 — Le quai A (quai iso, `commence: 'controle'`, `document: { nom: 'Feuille de ramasse', court: 'FR' }`, `recommencer: false`)

- **Message d'Erwan** : « Les 4 palettes de ce matin sont triées. Pour chacune : compte, fais le tour, lis l'étiquette, puis décide. Un problème ? Une
  réserve précise sur la feuille de ramasse, et Loïc la signe. Erwan » — joint : « Le droit » (C. civ. 1927, 1932).
- Palettes (§6.1) : **P1, P2 Ar Vag** (cartons, 5 couches × 8) ; **P3, P4 Agri-Kerlann** (sacs, 4 couches × 10) ; dessinées dans les cases de leur client
  (option dépose par client sous `commence`). `unite: { un: 'colis', des: 'colis' }`, motifs `['avarie', 'manquant']`, `libelles.avarie` :
  `{ nom: 'Colis abîmé', precision: 'écrasé ou percé' }`.
- **Aides de guidage allumées** (règle des couches, détail du comptage) chez le standard.
- Étape ④ : réserves (une ligne par palette à problème), pas de « sous réserve de déballage » (jalon `deballage`), signature de Loïc (« Je signe sous
  tes réserves. »).

### Étape 2 — Rendre compte à Erwan (phrases, semées après la signature)

« Loïc est reparti. Ton compte rendu : ce que tu as contrôlé, tes réserves, ce que tu as mis de côté. Erwan » — 5 lignes **calculées** sur le tirage
(§6.3) : salutation · contrôlé (imposée) · réserves · zone litiges · fin.

### Fin

Erwan : « Merci. Maëlys saisit l'entrée en stock avec tes réserves et prévient les clients. Erwan ». `finFige` : « Loïc a signé : le contrôle ne se
refait pas. » ; « Corriger » rouvre les phrases.

**Mots cliquables** : réserve, avarie, manquant, couche, feuille de ramasse, zone litiges, dépôt, « sous réserve de déballage ».

## 4 bis. Questions au fil — choix de Cowork : Q1, Q2, Q3, Q4

| id | Geste | Qui | Question (juste en gras) | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|
| `collegue-reserves` (Q1) | `quai:pelleau-quai-109:valider` (1re palette) | Erwan | « Loïc est de la maison. Pourquoi écrire quand même des réserves ? » — **on garde la marchandise du client : il doit savoir dans quel état elle est entrée, et on doit pouvoir le prouver** (`prouver`) · pour embêter Loïc (`embeter`) · ce n'est pas utile entre collègues (`inutile`) · pour que Loïc paie (`payer`) | **1,5** | **au bilan** (dirait d'avance d'écrire des réserves) | **éco-droit appliqué au cas** (C. civ. 1927, 1932) |
| `sac-perce` (Q2) | `quai:pelleau-quai-109:valider` sur une palette Agri-Kerlann | Yann | « Un sac de terreau percé, on le met où ? » — **en zone litiges, avec une étiquette** (`litiges`) · au rack avec les autres (`rack`) · à la poubelle tout de suite (`poubelle`) | **1** | tout de suite | C1.4.1, ancrée sur une palette de **sa** séance |
| `qui-saisit` (Q3) | `messagerie:phrase:fin` | Erwan | « Ton contrôle, qui le saisit dans l'ordinateur ? » — **Maëlys** (`maelys`) · toi (`toi`) · Loïc (`loic`) · le client (`client`) | **1,5** | tout de suite | C1.4.3, lien avec « Qui est qui » d'ENT-10.1 |
| `stock-juste` (Q4) | envoi des phrases | Erwan | « Pourquoi le stock de l'ordinateur doit-il dire exactement ce qu'il y a ? » — « Pour rendre au client ce qu'il a confié » · « Pour préparer ses commandes sans surprise » · « Pour facturer juste » · « Je ne sais pas » | réflexion | tout de suite | — |

Écartées : « Une couche de 8 cartons… combien ? » (donnerait le comptage) ; « Faut-il écrire « sous réserve de déballage » ? » (donnerait le jalon).
Retours : Q1 « Parce qu'on répond de ce qu'on garde. Écrit et signé, c'est une preuve. » · Q2 « En zone litiges, étiqueté : on décide avec le client. » ·
Q3 « Maëlys : elle saisit ce que tu as reçu, réserves comprises. » · Q4 « Les trois. »

## 4 ter. Avant de commencer

`tirage: { preparation: 3, image: 1 }`, non notées.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `reserve` | préparation | Une réserve, c'est… | une remarque écrite sur le document, qui dit ce qui ne va pas | une palette de secours · un carton en stock | — | ★ |
| `avarie` | préparation | Une avarie, c'est… | une marchandise abîmée | une marchandise en retard · une erreur de prix | — | ★ |
| `manquant` | préparation | Un manquant, c'est… | un colis prévu sur le document mais qui n'est pas là | un colis abîmé · un colis en trop | — | |
| `couches` | préparation | Une palette **pleine** de {c} couches de {k} colis contient… | {c × k} | {c + k} · {c × k − k} | dessin d'une palette | ★ |
| `depot` | préparation | Quand Pelleau garde la marchandise d'un client, il doit… | la lui rendre telle qu'il l'a reçue | la revendre · la mélanger avec d'autres | « Le droit » | ★ |
| `zone-litiges` | préparation | La zone litiges sert à… | mettre de côté ce qui pose problème | jeter les cartons vides · ranger les EPI | plan | |
| `img-sac` | image | Ce sac est… | percé : le terreau s'en échappe | neuf · fermé | photo libre | ★ |
| `img-carton-ecrase` | image | Ce carton est… | écrasé : ce qu'il y a dedans est peut-être abîmé | neuf · vide | photo libre ou rendu iso | |

`couches` : {c} et {k} tirés (c de 3 à 6, k de 4 à 10), jamais ceux d'une palette de la séance.

## 5. Jalons — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids |
|---|---|---|
| **Contrôler les palettes** | 2 palettes sans problème (dont le piège) : comptage et décision, 1,5 chacune · 2 à problème : comptage et décision, 2,5 chacune | **8** |
| **Réserves et signature** | réserve juste 1,5 × 2 · pas de « sous réserve de déballage » 1 · signature 1 | **5** |
| **Rendre compte** | réserves 1 · zone litiges 1 · forme 1 | **3** |
| **Questions** | Q1 1,5 · Q2 1 · Q3 1,5 | **4** |
| **Total** | | **20** |

`deballage` vrai seulement une fois les réserves écrites. Inaction : 0/20.

## 6. Contenu

`contenus/pelleau-ent109.js` (quai fonction de la graine), questions, `activites/pelleau-controler.js`, corrigé (ses palettes à problème, le réel, les
réserves, les phrases).

### 6.1 Anomalies (banque, comme ENT-8.8 §6.2, adaptée aux sacs)

| id | Ce que voit l'élève | Décision | Réserve attendue | Difficulté |
|---|---|---|---|---|
| `ecrase-face` (cartons) / `perce-face` (sacs) | 2 colis abîmés face avant | réserves — avarie | « {n} colis abîmés » | facile |
| `cache` | 1 colis abîmé visible en faisant le tour | réserves — avarie | « 1 colis abîmé » | moyen |
| `manquant` | couche du dessus incomplète, la feuille dit la palette pleine | réserves — manquant | « {n} colis manquants » | moyen |
| `couche-normale` | couche incomplète, **la feuille dit le même nombre** | accepter | — | piège |

### 6.3 Phrases

Comme ENT-8.8 §6.3, avec : « Réserves signées par Loïc : P1, 2 cartons abîmés ; P4, 2 sacs manquants. » (calculé) · « J'ai mis les {n} colis abîmés de P1 en
zone litiges. » · salutation « Bonjour Erwan, » · fin « Je reste au quai. {prénom} ».

## 6 bis. Tirage

2 palettes à problème : 1 facile (`ecrase-face` sur Ar Vag ou `perce-face` sur Agri-Kerlann) + 1 moyen (`cache` ou `manquant`), **une de chaque
client** ; 1 piège `couche-normale` sur une autre ; au moins une avarie (garanti). Confirmé : aides de comptage éteintes, pas de bonus. Accompagné : standard.

## 7. Demandes au moteur

Aucune. **À vérifier** : `commence: 'controle'` avec `depose` par client (palettes dans les cases de leur client) ; unité « colis » avec sacs et
cartons sur le même quai (dessin des sacs : **objet à ajouter au kit** si la palette de sacs n'existe pas — sinon cartons pour les deux clients et
« sacs » seulement dans le texte : le dire à Tristan avant).

## 8. Tests (bloc `pelleau-ctrl`, nouveau, alerte 7)

Comme ENT-8.8 §8 (parcours juste, inaction 0, piège de comptage, colis caché, déballage, phrases calculées sur 300 graines, Q1 au bilan), plus : les
deux palettes à problème sont de **deux clients différents** (300 graines).

## 9 à 11

Trame : brouillon de comptage par palette, noir et blanc. Critère : sacs et cartons se distinguent au vidéoprojecteur. Question ouverte : le dessin des
sacs (§7).

---

## Compte rendu *(rempli par Claude Code à la livraison)*
