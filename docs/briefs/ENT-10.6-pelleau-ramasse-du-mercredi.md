# Brief de séance — ENT-10.6 Transports Pelleau — la ramasse du mercredi (CAP OL, entraînement CAP-C1.3)

> **📋 Phrase à copier-coller dans Claude Code (Sonnet) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/FEUILLE-DE-ROUTE-pelleau.md, docs/briefs/ENT-10.5-pelleau-camion-de-ramasse.md puis docs/briefs/ENT-10.6-pelleau-ramasse-du-mercredi.md en entier. Les poids du §5 sont validés par Tristan ; annonce la durée et dis-moi si un point contredit le code.
> ```

**Statut** : livré (19/10/2026, non commité : le chef commite) · **Date** : 18/10/2026 · Cowork, sur délégation · **Modèle** : Sonnet · **Durée estimée** : ≈ 3 h (même structure
qu'ENT-10.5, tirage en plus).

---

## 0. Règles communes

Feuille de route Pelleau ; **mercredi 13 mai, 7 h 30**. Même déroulé qu'ENT-10.5, **seul** : aides éteintes chez le confirmé, Loïc moins bavard (il ne
dit plus de quel client est la palette du fond), et **tout est tiré** : la répartition des palettes, le défaut du quai, l'écart avec les annonces.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` / `id` | ENT-10.6 / `pelleau-ramasse-du-mercredi` |
| Titre / desc | « Transports Pelleau — la ramasse du mercredi » / « Recevoir seul le camion de ramasse : préparer, accueillir, vérifier le quai, trier les palettes par client et les rapprocher des annonces. » |
| Compétence / temps | `CAP-C1.3`, `temps: 'entrainement'` |
| Notation | `bareme: 20`, `parcours`, `correction`, `bilanDetail`, `precedente: 'pelleau-camion-de-ramasse'` ; `niveauxPrevus: ['confirme']` ; `questions: 'ENT-10.6'` |
| `pret` | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

Comme ENT-10.5. Tirages construits.

## 3. Objectif

Refaire ENT-10.5 sans guidage, sur un camion tiré : l'élève doit **lui-même** demander la feuille, faire couper le moteur, signaler le défaut du
quai, lire **chaque** étiquette et trouver l'écart.

## 4. Déroulé (≈ 40 min)

Comme ENT-10.5, avec ces différences :
- **Étape 1** : « Préparer » a 3 lignes (palettes · clients · « Combien de palettes Ar Vag ? »), valeurs lues dans **ses** documents.
- **Étape 2** : dialogue `pelleau-loic-106`, 2 tours (feuille de ramasse ; moteur, cale, local) ; le 3e tour d'ENT-10.5 disparaît.
- **Étape 3** : quai `pelleau-quai-106`, **1 défaut tiré** parmi `cabine` (`conduite` : Loïc au volant, moteur allumé), `cale` (`absente`), `niveleur`
  (`releve`), `lampe` (`eteinte`) ; 1 point en ordre (un autre objet). Dépose par client : **4 palettes, répartition tirée** (2 + 2 ou 3 + 1 ; ordre
  dans le camion tiré : les palettes d'un même client ne sont pas forcément à la suite), **8 cases** (allée, AV1 à AV3, AK1 à AK3, devant le quai B).
- **Étape 4** : écart tiré par client, au plus un écart par camion (§6 bis).
- **Étape 5** : phrases calculées (reçu, écart ou « tout est conforme »).

## 4 bis. Questions au fil — choix de Cowork : A, B, C

| id | Geste | Qui | Question (juste en gras) | Notée | Corrigée |
|---|---|---|---|---|---|
| `pourquoi-cale` (A) | `scene:pelleau-quai-106:signaler` (1er envoi) | Yann | « Pourquoi le camion doit-il être calé et le moteur coupé avant qu'on entre dedans ? » — **pour qu'il ne bouge pas pendant que le chariot est dedans** (`bouge`) · pour économiser le gasoil (`gasoil`) · pour que Loïc se repose (`repos`) | **1,5** | au bilan |
| `ecart-qui-dit` (B) | `fiche:rapprocher` 1re ligne | Erwan | `selon` son écart : « Agri-Kerlann a annoncé 3 palettes, on en reçoit 2. Que fais-tu ? » — **je le note et je le dis à Maëlys tout de suite** (`signaler`) · je mets une palette d'Ar Vag avec Agri-Kerlann (`completer`) · rien, ça arrivera (`rien`) | **1** | tout de suite |
| `rendre-meme-2` (C) | `quai:pelleau-quai-106:dechargement` | Erwan | « Ar Vag demande demain une de ses palettes. Peut-on lui donner une palette d'Agri-Kerlann du même poids ? » — **non : on lui rend la sienne, celle qu'il nous a confiée** (`non`) · oui, si le poids est le même (`poids`) · oui, s'il ne voit pas la différence (`voit`) | **1,5** | tout de suite (éco-droit appliqué, C. civ. 1932) |

Total 4. Retours : A « Un camion qui bouge pendant que le chariot est dedans, c'est l'accident. » · B « Dis-le tout de suite : Maëlys prévient le
client et prévoit la prochaine ramasse. » · C « Non : on rend la chose même qu'on a reçue. »

## 4 ter. Avant de commencer

Banque d'ENT-10.5 (mêmes ids), `tirage: { preparation: 3, image: 1 }`, non notées.

## 5. Jalons — **poids proposés par Cowork, validés par Tristan le 18/10/2026 à 22 h 03**

| Bloc | Cases | Poids |
|---|---|---|
| **Préparer** | 3 lignes, 2/3 chacune | **2** |
| **Accueillir Loïc** | 2 répliques, 1 chacune | **2** |
| **Avant de décharger** | défaut tiré signalé 2,5 · aucun faux 1 | **3,5** |
| **Trier par client** | 4 palettes, 1 chacune | **4** |
| **Rapprocher** | 2 clients × (reçues 0,75 + résultat 0,75) | **3** |
| **Rendre compte** | contenu 1 · forme 0,5 | **1,5** |
| **Questions** | A 1,5 · B 1 · C 1,5 | **4** |
| **Total** | | **20** |

## 6. Contenu

`contenus/pelleau-ent106.js` (quai fonction de la graine), questions, activité, corrigé (sa répartition, son défaut, son écart).

## 6 bis. Tirage et niveaux

- `repartition` : `2+2` (moyen) ou `3+1` (facile pour le tri, plus dur pour le comptage) ; client majoritaire tiré.
- `ordre` : permutation tirée des 4 palettes dans le camion ; **jamais** les deux clients rangés en blocs dans le même sens qu'ENT-10.5.
- `defaut` : uniforme sur 4 ; `pointOk` : un autre des 4.
- `ecart` (sur 300 graines ≈ un tiers chacun) : `aucun` · `moins` (un client a annoncé une palette de plus, la feuille le dit) · `plus` (une palette
  arrive alors que le client en a annoncé une de moins : la feuille et l'étiquette disent ce client, l'annonce est en retard ; résultat attendu :
  « il y en a trop »). Contrôle : au plus un écart, cases suffisantes par client (3 + 1 → 3 cases du client majoritaire).
- Confirmé : document « Règles du quai » **non joint** ; ligne bonus « Combien de sacs Agri-Kerlann ? » (lu sur la feuille). Accompagné : standard.

## 7. Demandes au moteur

Aucune. **À vérifier** : quai fonction de la graine avec `depose` par client (le contrôle `verifierDepose` sur **chaque** graine du test, comme
`controlerLocaliser`).

## 8. Tests (bloc `pelleau-recep`)

300 graines : répartition et écart équilibrés, cases suffisantes, aucun écart double ; parcours juste sur 3 graines (aucun / moins / plus) → 20/20 ;
inaction → 0 ; Loïc au volant non signalé → ✗ sans arrêt de la séance (entraînement : `arret: false`) ; phrases calculées sur **son** écart.

## 9 à 11

Trame : tableau de rapprochement vierge. Critère : jouable en 40 min. Question ouverte : `arret: false` en entraînement (défaut : oui, comme
ENT-10.3 ; la note le dit).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

**19/10/2026, phase 3 du chantier Pelleau (Sonnet, sous-agent du chef ; non commité, le chef commite).** Fichiers : `activites/pelleau-ramasse-du-mercredi.js`,
`contenus/pelleau-ent106.js`, `contenus/pelleau-ent106-donnees.js` (données pures et tirage, chargées aussi sous Node par le corrigé), `contenus/questions/ENT-10.6.js`,
`contenus/corriges/ENT-10.6.js`, `outils/test/pelleau-106.mjs` (20 cas) ; lignes AJOUTÉES dans `activites/index.js`, `outils/test.mjs` (`BLOCS`, `GROUPES` groupe 3),
`outils/test/socle.mjs` (`ATTENDU_CAP`) ; `outils/test/pelleau/commun.mjs` : option `parBase` de `aidesQuai` (quai tiré par élève), par ajout. Pas de `declarerTirage`
(le tirage est par graine, comme ENT-8.7 : `quai: quaiDe`) : rien dans `BANQUES_FIGEES` ni dans `tirage-niveaux.mjs` (colonne 10 déjà là).

**Le tirage** (`jeuDe(graine)`, `tirerJeu`, jeu de secours jamais donné sur 300 graines) : répartition 2+2 ou 3+1 (client majoritaire tiré), ordre de sortie tiré (jamais
les blocs « Ar Vag d'abord » d'ENT-10.5), un défaut parmi cabine · cale · niveleur · lampe et UN autre point en ordre, écart aucun / moins / plus (au plus un ; « plus »
seulement sur un client qui a au moins 2 palettes, pour qu'aucune annonce ne tombe à 0). Mesuré sur 300 graines : 2+2 165 / 3+1 135 ; écart 91 / 101 / 108 ; défauts 63 à 81.
Le quai a 8 cases (3 par client) ; `verifierQuai` passe sur 300 graines × 3 niveaux.

**Poids codés (brief §5, tels quels).** Préparer 3 × 2/3 · Accueillir Loïc 1 × 2 · défaut tiré signalé 2,5, aucun faux 1 · Trier par client 1 × 4 · Rapprocher 0,75 × 4 ·
Rendre compte : écart (contenu) 1, salutation 0,25, fin 0,25 (forme 0,5) · questions A 1,5, B 1, C 1,5 (`part: 4`). Total 20 (2/3 × 3 = 2 exactement à l'arrondi près).
Confirmé : « Combien de sacs Agri-Kerlann ? » en bonus caché (lu sur la feuille), « Règles du quai » non jointes, aides du quai éteintes ; accompagné = standard.

**Écarts avec le brief (décisions prises en route).**
1. Bloc `pelleau-106` (un bloc par séance, COORDINATION §2 n° 21), pas `pelleau-recep`. Aucun jour de la semaine dans un document (« 13 mai », décision 9).
2. Question B `ecart-qui-dit` : énoncé calculé sur l'écart de l'élève (`selon`). Pour « aucun écart », le brief ne dit rien : posée en « Tout correspond aux annonces.
   Imagine qu'il manque une palette d'un client. » (**choix de Claude Code, à relire**). Pour « il y en a trop », les pièges sont écrits par moi (« Je mets la palette en trop avec
   celles d'un autre client », « Rien, l'annonce sera mise à jour »). C ne cite plus « Le droit » (le document n'est pas sous les yeux sur le quai).
3. Entraînement : `securite.arret: false` (le brief §8 et §11 : Yann n'arrête pas l'élève qui dit « C'est bon » sans rien signaler, le jalon est ✗). Une question A (au 1er
   signalement) qui ne part jamais faute de signalement arrive au rattrapage, en fin de séance.
4. « Règles du quai » non jointes au confirmé : ni au message de Maëlys ni à la fiche ; elles restent dans « Avant de commencer » (la banque d'ENT-10.5, mêmes ids, les cite
   pour `cale` et `gerber`). Dire si Tristan veut les retirer aussi de l'ouverture.
5. Loïc « au volant, moteur allumé » peut s'afficher alors que l'élève vient de lui dire de couper le moteur (le défaut est tiré, comme chez Action ENT-8.7) ; à voir à l'écran.
6. J'ai repris les trois champs que la session moteur vient d'ajouter dans `core/types/quai.js` (non commités au moment d'écrire : `document.article: 'la'`,
   `camions[].tutoiement`, `prenomChauffeur`) pour que la légende dise « Loïc te remet la feuille de ramasse » et le bouton « Oui, tu peux décharger » : **ENT-10.6 ne se charge
   pas sans ce commit moteur** (le cas de légende le garde).
7. « Aucun écart » : la phrase juste est « Tout est conforme aux annonces. » ; les 3 mauvaises sont des écarts qui n'existent pas.

**À vérifier à l'écran par Tristan.** La lisibilité des 8 cases (« AR VAG 1 à 3 », « AGRI 1 à 3 ») à 1366 × 768 et au vidéoprojecteur ; que les deux zones se distinguent sans
couleur ; le tirage vécu (se faire ouvrir la séance par 3 ou 4 comptes de test) ; la question B pour chaque écart ; les textes construits (réactions de Loïc, pièges des
phrases) ; que Loïc moins bavard ne paraisse pas sec ; le confirmé (consigne courte, quatre lignes).
