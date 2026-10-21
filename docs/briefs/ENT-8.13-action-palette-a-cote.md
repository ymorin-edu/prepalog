# Brief de séance — ENT-8.13 Action — la palette d'à côté (CAP OL, entraînement CAP-C1.5, erreur induite)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/ENT-8.11-action-ranger.md (§0, §6), docs/briefs/MOTEUR-palettier-adresse-donnee.md (lots 3 et 5) puis docs/briefs/ENT-8.13-action-palette-a-cote.md en entier. Les lots 1, 2, 3 et 5 du chantier moteur doivent être livrés. Fais l'état des lieux du §7, dis-moi ce qui contredit le brief, puis construis la séance. Annonce la durée avant de commencer.
> ```

**Statut** : à implémenter
**Date du brief** : 21/10/2026
**Conversation d'origine** : Cowork (Opus), cadrage de C1.5 chez Action, 21/10/2026 (fiche `claude/prepalog-action-cadrage-c1.5.md`), décisions
4 et 4 bis de Tristan.
**Modèle** : **Opus** (séance nouvelle, deux chemins qui se rejoignent).
**Place dans l'ordre** : après ENT-8.12. Attend les **lots 1, 2, 3 et 5** de `MOTEUR-palettier-adresse-donnee.md`.
**Durée estimée par Cowork** : ≈ 4 h 30. Ce qui prend le temps : les deux chemins (sa palette ou celle de Kevin), le lendemain, les phrases calculées
selon le chemin, les tests des deux témoins.

---

## 0. Règles communes

**§0 d'ENT-8.11**. **Entraînement** : moins guidé (pas de « Les règles » ouvertes, pas d'aide de charge ; « Vérifier » dit le nom du critère seul).
**Deux temps** : **jeudi 4 mars, 20 h 30** (fin de poste) puis **vendredi 5 mars, 6 h** (dates proposées). Personnage nouveau, construit :
**Yanis, préparateur** (sans visage).

### Décisions de Tristan (21/10/2026)

- **4.** L'élève est poussé à l'erreur par la situation : fin de poste, Kevin : « l'adresse est prise, mets-la à côté, on verra demain. » S'il obéit
  sans scanner, le lendemain la préparation vocale envoie Yanis à une adresse vide ; l'élève remonte la piste, retrouve la palette, la remet en ordre
  au terminal et rend compte. **La note porte sur la remise en ordre, pas sur le piège.**
- **4 bis.** **Les deux chemins se rejoignent sur la même enquête.** Le bon geste : l'adresse est prise → **demander une adresse libre au terminal, y
  ranger, scanner** (laisser la palette dans l'allée n'est pas un bon geste : 0). L'élève qui a obéi enquête sur **sa** palette ; celui qui a bien
  fait enquête sur **celle de Kevin**, posée « à côté » le même soir. Le premier jalon est modeste ; l'essentiel va à l'enquête et à la remise en
  ordre, que tout le monde joue.

Écrans : **Avant de commencer → Fin de poste (palettier) → Le lendemain : la palette introuvable (palettier) → Rendre compte à Samia (phrases)** →
bilan.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.13 (provisoire) |
| `id` | `action-palette-a-cote` |
| Titre / desc | « Action — la palette d'à côté » / « Ranger en fin de poste quand l'adresse est prise, puis, le lendemain, retrouver une palette que le système croit ailleurs, la remettre en ordre au terminal et rendre compte. » |
| Rubrique | simulog, entreprise n° 8 Action |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competencesCap: ['CAP-C1.5']` (C1.5.1, C1.5.2, C1.5.3) ; ligne dans `ATTENDU_CAP` (alerte 7). |
| Temps pédagogique | `temps: 'entrainement'`, **erreur induite** |
| Notation | jalons pondérés sur 20, `parcours`, `correction`, `bilanDetail`, `precedente: 'action-inventaire-tournant'` |
| Barème | `bareme: 20` |
| Niveaux d'élève | `niveauxPrevus: ['confirme', 'accompagne']` |
| `questions` | `'ENT-8.13'` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

- **Vérifié** : §2 d'ENT-8.11 ; **préparation à la voix** chez Geodis / Action à Ensuès ([France Travail 191TDTN](https://candidat.francetravail.fr/offres/recherche/detail/191TDTN)) ;
  **C. trav. L4122-1** (le travailleur agit « conformément aux instructions qui lui sont données par l'employeur » ; à recopier exactement depuis
  Légifrance).
- **Construit, dit dans la séance** : Yanis, la fin de poste, l'adresse prise, le comportement de Kevin, la palette introuvable, l'heure.
  **Kevin n'est pas un salarié réel** : il est construit (aucune parole prêtée à un salarié réel identifié).
- **Ton** : Kevin n'est pas un « méchant » ; il est pressé. Le bilan ne le juge pas ; il dit la règle.

## 3. Objectif pédagogique

L'élève **range seul** en fin de poste et rencontre une **adresse prise** : il sait qu'on ne pose pas « à côté » sans le dire au système. Le
lendemain, il **comprend pourquoi** une palette manque (le système ne connaît que ce qu'on scanne), **la retrouve** en cherchant autour, la **transfère**
au terminal et **rend compte** des faits. Prépare l'évaluation ENT-8.14.

## 4. Déroulé (≈ 50 min)

### Accueil (Samia)

« Bonsoir {prénom} ! Dernière demi-heure : deux palettes à ranger, et tu pourras partir. Kevin est là pour la réserve. Samia »

### Étape 0 — Avant de commencer (non notée)

### Étape 1 — Fin de poste (palettier à adresse donnée, lots 1 à 3)

- **2 palettes** : **P1** (sol, adresse libre : non notée, échauffement — déjà notée en 8.11) ; **P3** (sol, **adresse donnée occupée** par une palette
  « à évacuer cette nuit », étiquette visible de près).
- Au premier « Occupé » sur P3, **Kevin passe** (message, déclencheur `entrepot:<id>:occupe:P3`) : « Elle est prise ? Mets-la à côté, on verra demain.
  Il est tard. Kevin » — **aucun choix dans le message** : c'est le geste dans le palettier qui compte (lot 3 : demander une adresse libre / poser à
  côté / laisser dans l'allée).
- **Le même soir, Kevin pose lui-même sa palette P9 « à côté », sans scanner** (déclaré par la séance, invisible pour l'élève : lot 5).
- « Valider mon rangement » → Samia : « Bonne soirée ! À demain 6 h. Samia » (aucun verdict ici : entraînement, l'élève découvre la suite le
  lendemain ; le bilan dit tout à la fin).

### Étape 2 — Le lendemain : la palette introuvable (palettier, lot 5)

- **6 h, message de Yanis** : « Bonjour ! Le terminal m'envoie en {adresse}, niveau 1. C'est vide. Je ne peux pas préparer le magasin de Marseille.
  Tu peux regarder ? Yanis » — l'adresse est celle que **le système croit** :
  - si l'élève a **posé P3 à côté sans scanner** (ou l'a laissée dans l'allée, et Kevin l'a posée à côté pendant la nuit) → l'adresse donnée de P3 ;
  - s'il a **demandé une adresse libre et scanné** → l'adresse donnée de **P9**, la palette de Kevin.
- Samia (consigne) : « Trouve la palette. Puis remets-la en ordre au terminal. Samia »
- L'élève **ouvre des emplacements** (chaque ouverture comptée) ; la palette cherchée est **à côté** : même travée ou travée voisine, niveau 1
  (tirée, §6 bis). Il voit son étiquette de près.
- **« Transférer »** : scanner la palette, puis l'adresse où elle doit aller — **son adresse donnée, libérée pendant la nuit** (la palette à évacuer
  est partie) ; le terminal confirme.

### Étape 3 — Rendre compte à Samia (Messagerie, phrases calculées sur son chemin)

- Samia (`apresGeste('entrepot:<id>:transfert')`) : « C'est réglé ? Raconte-moi, en trois phrases. Samia »
- Phrases (§6.2) : salutation · ce qui s'est passé · où était la palette · ce que j'ai fait · fin.
- Fin : Samia : « Merci. Une palette posée sans scan, c'est une palette perdue pour le système. On en reparle avec Kevin. Samia »

**Mots cliquables** : adresse donnée, adresse libre, scanner, transférer, emplacement, rupture.

## 4 bis. Questions au fil — décidées par Tristan (« on garde tout »)

`contenus/questions/ENT-8.13.js`, `part: 4`, Samia. Le bon geste face à Kevin **n'est pas une question** : c'est un jalon (lu dans le palettier). Les
questions qui éclaireraient l'enquête sont **corrigées au bilan**.

| id | Geste | Question (juste en gras) | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|
| `q-rupture` | message de Yanis **lu** (ouverture de l'étape 2) | « Si personne ne retrouve la palette, que se passe-t-il pour le magasin ? » — **le produit manque en rayon : des ventes perdues** · rien, le magasin a du stock pour un an · le magasin est fermé | fil | 0,75 | tout de suite | Conséquence d'une erreur de stock |
| `q-ou-chercher` | **première ouverture** d'emplacement | « Où chercher en premier ? » — **autour de l'adresse : les emplacements voisins, la même allée** · au hasard dans l'entrepôt · au quai | fil | 0,5 | **au bilan** (éclairerait l'enquête) | C1.5.1 |
| `q-systeme` | 3e ouverture | « Pourquoi le système ne retrouve-t-il pas la palette tout seul ? » — **il ne sait que ce qu'on a scanné** · il est en panne · Kevin l'a effacée | fil | 0,75 | tout de suite | C1.5.3 |
| `q-terminal` | **transfert** fait | « Qu'as-tu fait au terminal, et pourquoi ? » — **transféré la palette à sa bonne adresse et scanné : maintenant, le système sait où elle est** · rien : Yanis la trouvera · imprimé une nouvelle étiquette | fil | 0,75 | tout de suite | C1.5.3 (après le geste : ne donne rien d'avance) |
| `q-a-qui` | compte rendu **envoyé** | « À qui le dis-tu, et comment ? » — **à la cheffe d'équipe, en disant les faits** · à tout le monde, en nommant le coupable · à personne | fil | 0,5 | **au bilan** | C1.2.6 rappelé ; chemin « Kevin » : texte qui ajoute « sans accuser » |
| `q-collegue` | **éco-droit** — fin | « Kevin t'a dit de ranger sans scanner. Dois-tu faire tout ce qu'un collègue te demande ? » — **non : on suit les consignes de l'employeur, données par le chef ; une procédure ne se saute pas parce qu'un collègue le dit** · oui, il a plus d'ancienneté · oui, s'il est pressé | fil | 0,75 | tout de suite | Contrat de travail ; texte joint **L4122-1** (« conformément aux instructions… de l'employeur ») |

- Somme : 0,75 + 0,5 + 0,75 + 0,75 + 0,5 + 0,75 = **4**.
- **Retours proposés** : `q-rupture` « Une palette perdue dans l'entrepôt, c'est un rayon vide au magasin. » · `q-ou-chercher` « Une palette posée
  "à côté" est presque toujours… à côté. » · `q-systeme` « Le système croit ce qu'on lui dit : pas de scan, pas d'information. » · `q-terminal` « Le
  transfert remet le système d'accord avec le rack. » · `q-a-qui` « Les faits, à la cheffe. Chercher un coupable ne retrouve pas la palette. » ·
  `q-collegue` « Les consignes viennent de l'employeur. Un collègue pressé ne les change pas. »

## 4 ter. Avant de commencer — notions validées, banque complétée par Cowork

Tirage **3 préparation + 1 image**, non notées.

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `k-adresse-libre` | préparation | L'adresse donnée est prise. On… | demande une adresse libre au terminal, on range là et on scanne | pose à côté, on verra demain · laisse la palette dans l'allée | — | ★ |
| `k-transfert` | préparation | Transférer une palette, c'est… | la changer d'adresse **et** le dire au système en scannant | la charger dans un camion · changer son étiquette de produit | — | ★ |
| `k-rupture` | préparation | Une rupture en rayon, c'est… | un produit qui manque dans le magasin | une palette cassée · un rayon de rack qui plie | — | ★ |
| `k-rendre-compte` | préparation | Rendre compte, c'est… | dire à son chef ce qu'on a fait et ce qui s'est passé | écrire un roman · se plaindre d'un collègue | — | ★ |
| `k-allee` | préparation | Une palette dans l'allée de circulation, c'est… | un danger : les chariots passent | une place de rangement en plus · normal le soir | — | |
| `k-scan-rappel` | préparation | Sans scan, le système croit que la palette est… | là où il l'avait prévue | là où tu l'as posée · au quai | — | |
| `k-preparateur` | préparation | Le préparateur, c'est… | la personne qui prélève les produits pour les commandes des magasins | le chauffeur · le comptable | — | |
| `img-allee-encombree` | image | Sur ce dessin, qu'est-ce qui ne va pas ? | une palette laissée dans l'allée | rien · le rack est trop haut | dessin iso, sans visage | ★ |
| `img-emplacement-vide` | image | Cet emplacement est… | vide | plein · hors service | dessin (vue de près) | |

## 5. Jalons / notation (sur 20) — poids validés par Tristan (21/10/2026)

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Le bon geste face à Kevin** | P3 : adresse libre demandée, rangée, scannée | **3** | `adresseLibre-P3` (lot 3) | restée dans l'allée = **0** (« ne récompense pas l'inaction ») ; posée à côté sans scan = 0 |
| **Retrouver la palette** | retrouvée (ouverte) 3 · en 4 ouvertures au plus 1 | **4** | `retrouvee`, `trouveeVite` (lot 5) | `trouveeVite` seulement si retrouvée |
| **La remettre en ordre au terminal** | à son adresse donnée 2 · transfert scanné (le système la sait là) 3 | **5** | `transfert-place`, `transfert-scan` | jugés sur la palette de **son** chemin |
| **Rendre compte à Samia** | ce qui s'est passé 1 · où elle était 1 · ce que j'ai fait 1 | **3** | phrases calculées sur **son** chemin et **ses** gestes | une erreur ne se paie qu'une fois : « ce que j'ai fait » juste = ce qu'il a **vraiment** fait |
| **Les questions de Samia** | §4 bis | **4** | moteur des questions | — |
| **Forme** | salutation, fin, et pas d'accusation (chemin « Kevin ») | **1** | phrases | 5 % |
| **Total** | | **20** | | |

- **Un élève piégé peut avoir 17/20** (tout sauf le premier bloc) : c'est voulu (décision 4 bis).
- **Corriger** : `'phrases:samia'` seulement ; le palettier du soir et du lendemain est figé (`finFige`), comme le quai d'ENT-8.9.

## 6. Contenu (données)

`contenus/action-ent813.js` (+ `-donnees.js`), `contenus/questions/ENT-8.13.js`, `activites/action-palette-a-cote.js`,
`contenus/corriges/ENT-8.13.js`. Allée et produits importés d'ENT-8.11 ; stock du jour redéclaré.

### 6.1 Les palettes

| Palette | Adresse donnée | Ce qui doit être vrai |
|---|---|---|
| P1 | sol, libre | non notée |
| P3 | sol, **occupée** par une palette « à évacuer cette nuit » (`EVAC`) | une **adresse libre** au sol déclarée pour le terminal ; au moins **un emplacement libre voisin** (même travée ou voisine) où « poser à côté » est possible |
| P9 (Kevin) | sol, occupée elle aussi par une palette à évacuer | posée par Kevin à un emplacement voisin, **sans scan** ; même règle |
| Nuit | `EVAC` partent | les deux adresses données sont **libres** le lendemain |

- Produits : P3 et P9 d'un même rayon que le magasin de Yanis (tirés, §6.2 d'ENT-8.11) ; **Marseille** = magasin de la région marseillaise (Action
  livre la région marseillaise depuis Ensuès : **vérifié**, communiqué de 2023) — **aucun magasin nommé**, aucune adresse.

### 6.2 Les phrases du compte rendu (calculées sur son chemin)

| Ligne | Juste | Pièges |
|---|---|---|
| salutation | « Bonjour Samia, » | « Salut, » |
| ce qui s'est passé | *chemin « sa palette »* : « Hier soir, j'ai posé {P3} à côté de son adresse sans la scanner. » · *chemin « Kevin »* : « Une palette a été posée hier soir à côté de son adresse, sans scan. » | « C'est la faute de Kevin. » · « Je ne sais pas. » |
| où elle était | « Elle était en {emplacement trouvé}. » (calculée sur **ce qu'il a ouvert**) | une autre adresse |
| ce que j'ai fait | « Je l'ai transférée en {adresse} et scannée : le système est à jour. » (sur **son** transfert) | « Je l'ai laissée là. » · « J'ai prévenu Yanis. » |
| fin | « {prénom} » | « Bisous » |

- Chemin « Kevin » : « C'est la faute de Kevin. » est le piège qui coûte le point de **forme** (pas d'accusation) ; la ligne « ce qui s'est passé » est
  jugée à part.
- Élève qui n'a pas retrouvé la palette : les lignes « où » et « ce que j'ai fait » proposent « Je ne l'ai pas trouvée. » (juste pour lui : une erreur
  ne se paie qu'une fois).

## 6 bis. Tirage et niveaux

- Adresses données de P3 et P9, emplacement « à côté » (même travée ou voisine, ≤ 4 ouvertures depuis l'adresse vide en cherchant autour) : tirés ;
  200 graines.
- **Confirmé** : Yanis signale **une seconde adresse vide** un peu plus tard (une autre palette posée de travers la veille, déclarée par la séance) :
  jalons `bonus: true` « retrouvée » et « transférée » ; le socle et ses jalons ne changent pas.
- **Accompagné** : le message de Yanis dit aussi « elle doit être pas loin » ; l'étiquette du produit cherché (désignation) est rappelée dans la
  colonne de côté.
- **Consigne neutre** au soir : « Range les palettes. » (ne dit pas qu'une adresse est prise).

## 7. Demandes au moteur

**Chantier `MOTEUR-palettier-adresse-donnee.md`, lots 1, 2, 3 et 5** (adresse donnée, scan, adresse prise / adresse libre / poser à côté, le
lendemain et le transfert). À vérifier à l'état des lieux :
- le geste `entrepot:<id>:occupe:<P>` publié (déclencheur du message de Kevin) ;
- le lendemain qui repart de l'état du soir **de l'élève** + la palette de Kevin ; le choix de la palette cherchée selon `ouSystemeCroit` ;
- les phrases calculées sur le chemin.

### 7 bis. Séance déjà jouée ? Non.

## 8. Tests attendus

Bloc `action-813` (alerte 7).

- **Trois témoins** : (a) bon geste → enquête sur P9, 20/20 ; (b) posée à côté sans scan → enquête sur P3, **17/20** ; (c) laissée dans l'allée →
  enquête sur P3, 17/20 ; inaction totale → 0/20.
- Chemin (a) : « C'est la faute de Kevin. » → forme ✗, le reste ✓.
- Palette trouvée en 6 ouvertures → `retrouvee` ✓, `trouveeVite` ✗.
- Transfert à une autre adresse libre que son adresse donnée → `transfert-place` ✗, `transfert-scan` ✓ (le système sait où elle est).
- `q-ou-chercher` et `q-a-qui` au bilan ; somme 20 ; `part` 4.
- Sabotages : enquête toujours sur P3 → le témoin (a) tombe ; « ce que j'ai fait » jugé contre la bonne réponse → le cas « pas trouvée » tombe.

## 9. Supports

Trame (Cowork, après validation) : **cours** d'une demi-page, noir et blanc — « L'adresse est prise : que faire ? », « Le système ne sait que ce qu'on
scanne », « Transférer », « Rendre compte : les faits ». Corrigé : `contenus/corriges/ENT-8.13.js`.

## 10. Critères de validation par Tristan

- Le message de Kevin pousse sans être caricatural.
- Le lendemain, l'élève comprend tout de suite **quelle** palette manque, sans qu'on lui dise pourquoi.
- Les deux chemins font la même séance en durée.

## 11. Questions ouvertes et décisions de Cowork

1. **Proposé par Cowork** : P1 non notée (échauffement) ; « retrouver » découpé 3 + 1 ; « transfert » découpé 2 + 3 ; « rendre compte » 1 + 1 + 1.
2. **Proposé par Cowork** : l'élève qui laisse P3 dans l'allée → **Kevin la pose à côté pendant la nuit** (même enquête que s'il avait obéi).
3. **Proposé par Cowork** : Yanis, préparateur (construit) ; le magasin « de Marseille » sans nom.
4. Textes de Cowork : à relire à l'écran.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
