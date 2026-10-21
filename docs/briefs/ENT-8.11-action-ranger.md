# Brief de séance — ENT-8.11 Action — ranger à la bonne adresse (CAP OL, guidage CAP-C1.5)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/ENT-8.7-action-decharger.md (§0), docs/briefs/MOTEUR-palettier-adresse-donnee.md puis docs/briefs/ENT-8.11-action-ranger.md en entier. Les lots 1 et 2 du chantier moteur doivent être livrés. Fais l'état des lieux du §7, dis-moi ce qui contredit le brief, puis construis la séance. Annonce la durée avant de commencer.
> ```

**Statut** : à implémenter
**Date du brief** : 21/10/2026
**Conversation d'origine** : Cowork (Opus), cadrage de C1.5 chez Action, 21/10/2026, 16 h 14 → 17 h 00 : **13 décisions de Tristan** (fiche du
projet `claude/prepalog-action-cadrage-c1.5.md`). Ce qui n'a pas été tranché par Tristan est signalé « proposé par Cowork » et listé au §11.
**Modèle** : **Opus** (séance nouvelle).
**Place dans l'ordre** : après ENT-8.10. Attend les **lots 1 et 2** de `MOTEUR-palettier-adresse-donnee.md`.
**Durée estimée par Cowork** : ≈ 4 h. Ce qui prend le temps : le plan de l'allée et les palettes, l'étiquette d'adresse dessinée, la fiche, les
questions, les tests. Rien de nouveau au moteur hors du chantier ci-dessus.

---

## 0. Règles communes à ENT-8.11 → 8.14 (C1.5 chez Action)

- **§0 d'ENT-8.7** : public CAP (une consigne par écran, 3 lignes au plus, tout en cliquant) ; **Geodis à Ensuès-la-Redonne** ; **Samia** (cheffe
  d'équipe, tutrice), **Kevin** (cariste), **Julie** (agent administratif) — construits ; aucune année ; « Avant de commencer » ; jalons pondérés sur
  20 ; **questions au fil 4 points** ; `parcours`, `correction` ; jamais un élève bloqué ; ce qui est construit se dit dans la séance.
- **§0 bis d'ENT-8.3** : un écran par étape, consigne de Samia en haut, écran suivant ouvert à l'envoi du précédent, `bilanDetail: true`.
- **Décisions de Tristan (21/10/2026)** :
  1. Palettier en hauteur, préparation au sol : **niveau 1 (le sol) = picking**, niveaux 2 et plus = **réserve**. *(Le moteur appelle le sol N1 :
     tous les textes disent « niveau 1, au sol ».)*
  2. L'élève **range lui-même au niveau 1** ; au-dessus, il vérifie l'adresse et la plaque de charge, puis **passe la main à Kevin** ; il **scanne**
     dans les deux cas. *(Le CAP 2026 forme aux catégories R489 1A, 1B et 3 ; le rangement en grande hauteur se fait souvent au chariot à mât
     rétractable, catégorie 5 : c'est la raison, dite à l'élève par une question au fil.)*
  3. Inventaire tournant **au terminal, à l'aveugle, en cartons** ; écart → recomptage ; écart confirmé → **signalé à Samia** avec une cause
     possible ; l'élève ne corrige pas le stock (« participer à l'inventaire », C1.5.4).
  4. Erreur induite : Kevin pousse à poser « à côté » sans scanner (ENT-8.13).
  5. Évaluation : la matinée complète, dans le **site d'évaluation** de l'élève (ENT-8.14).
  6. Produits : **catégories réelles d'Action, produits sans marque**, lourds et légers mêlés ; aucune saison.
  7. Les séances C1.5 déjà ouvertes au CAP (5.5, 6.5, 6.6, 2.3, TAB-4, TAB-5) **restent telles quelles** (renforcement).
- **Dates (proposées par Cowork, §11)** : ENT-8.11 **mardi 2 mars, 13 h 30** ; ENT-8.12 **mercredi 3 mars, 6 h** ; ENT-8.13 **jeudi 4 mars, 20 h 30**
  puis **vendredi 5 mars, 6 h** ; ENT-8.14 **mardi 9 mars, 6 h** (sans année ; jours justes en 2027).
- **Interdits** : aucun visage de salarié ; aucune parole prêtée à un salarié réel ; produits sans marque ; la plaque de charge dit *que*, jamais
  *de combien* dans un message de correction.

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.11 (provisoire) |
| `id` (jamais modifié ensuite) | `action-ranger` |
| Titre / desc | « Action — ranger à la bonne adresse » / « Lire une adresse de rangement, ranger au sol les palettes du picking, vérifier la plaque de charge et confier la réserve au cariste, puis scanner pour que le système sache où est chaque palette. » |
| Rubrique | simulog, entreprise n° 8 Action |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competences: []`, `competencesCap: ['CAP-C1.5']` (« Mettre en stock les marchandises ou les produits ») ; sous-compétences : C1.5.1 repérer l'implantation · C1.5.2 stocker physiquement · C1.5.3 actualiser les informations. Ligne `'ENT-8.11': 'CAP-C1.5'` dans `ATTENDU_CAP` (`outils/test/socle.mjs`) : le dire (alerte 7). |
| Temps pédagogique | `temps: 'guidage'` (coefficient 1) |
| Notation | jalons pondérés, note sur 20, `parcours: true`, `correction: true`, `bilanDetail: true`, `precedente: 'action-palette-lucas'` (ENT-8.9, dernière séance du parcours ; les évaluations n'en ont pas) |
| Barème | `bareme: 20` |
| Niveaux d'élève | `niveauxPrevus: ['confirme', 'accompagne']` (§6 bis) |
| `questions` | `'ENT-8.11'` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** (Cowork, 15 et 21/10/2026) :
  - Entrepôt d'Action à **Ensuès-la-Redonne**, exploité par **Geodis**, Parc des Aiguilles ; **≈ 270 m de long** ; inauguré le 1/06/2023 ; plus de 280
    emplois annoncés ; magasins du Sud-Est ([communiqué d'Action, 2023](https://company.action.com/wp-content/uploads/2023/06/PressRelease_DC-Ensuess.pdf) ;
    [Gomet'](https://gomet.net/action-parc-aiguilles/)). **Surface : les sources varient** (44 000 m² Geodis 2022, 46 000 m² au sol Gomet', 55 000 m²
    Action 2023) → **ne pas donner de chiffre** dans la séance, ou « environ 50 000 m² ».
  - **Le matériel roulant, l'informatique et les méthodes appartiennent à Action ; Geodis fournit le personnel** ([Gomet'](https://gomet.net/action-parc-aiguilles/)) :
    question au fil `q-materiel`.
  - Action prévoit des **chariots et tracteurs électriques** sur le site ([charte du Parc des Aiguilles, Métropole Aix-Marseille, 2022](https://deliberations.ampmetropole.fr/documents/metropole/deliberations/2022/06/30/ANNEXE/25289_Parc%20des%20Aiguilles-Charte%20dEngagements%20Territoriaux-annexe.pdf)).
  - **Catégories de produits d'Action** (communiqué de 2020, 13 nommées sur 14 annoncées) : décoration, bricolage, jouets et loisirs, bureau et
    loisirs créatifs, multimédia, articles ménagers, jardin et extérieurs, entretien de la maison, épicerie et boissons, hygiène et beauté, animaux,
    sport, mode et linge de maison ; **6 000 références, 150 à 200 nouveautés par semaine** ([communiqué d'Action, 15/10/2020](https://www.action.com/globalassets/images/company-images/press-releases/cp-action--sainte-genevieve-des-bois_15102020.pdf)).
  - **Textes** (à recopier exactement depuis Légifrance à la construction, date en pied) : **C. trav. L4121-1** (l'employeur prend les mesures
    nécessaires pour assurer la sécurité et protéger la santé des travailleurs) et **L4122-1** (chaque travailleur prend soin de sa sécurité et de
    celle des autres, selon sa formation et les instructions de l'employeur ; cela ne retire rien à la responsabilité de l'employeur) — contenu relu
    sur [code.travail.gouv.fr](https://code.travail.gouv.fr/code-du-travail/l4122-1) le 21/10/2026.
  - Catégories R489 du CAP 2026 : 1A, 1B, 3 (référentiel, fiche `claude/referentiel-cap-ol.md`) ; **catégorie 5 = chariots à mât rétractable**
    (connu ; à citer sans plus de détail).
- **Non vérifié → construit, et dit dans la séance** : **tout le stockage d'Ensuès** (palettier, niveaux, adresses, plaques de charge), l'usage d'un
  terminal à scanner, la répartition des tâches opérateur / cariste, les produits (désignations génériques), les poids, le camion du jour.
- **Mention** (fin de séance et pied de l'étiquette dessinée) : « L'allée, les adresses et les plaques de charge sont construites pour l'exercice :
  Action et Geodis ne publient pas l'organisation de l'entrepôt d'Ensuès. »

## 3. Objectif pédagogique

À la fin, l'élève sait **lire une adresse de rangement** (allée, côté, travée, niveau, emplacement), **ranger au sol** à la bonne adresse, **lire une
plaque de charge** et refuser une adresse qui la dépasserait, **confier la réserve au cariste** sans monter lui-même, et **scanner** pour que le
système sache où est la palette. Guidage : Samia accompagne pas à pas. Prépare ENT-8.12 (compter là où l'on a rangé) et ENT-8.13.

## 4. Déroulé (≈ 45 min)

### Accueil (message de Samia, aussi en `sousTitre`)

« Bonjour {prénom} ! Cet après-midi, tu ranges le camion de ce matin. Le système donne une adresse à chaque palette. Au sol, tu ranges ; plus haut,
c'est Kevin. Et tu scannes toujours. Samia »

### Étape 0 — Avant de commencer (non notée, Samia) — §4 ter

### Étape 1 — Lire une adresse (fiche, document à gauche)

- À gauche : **l'étiquette d'un emplacement** dessinée (comme une lisse de rack : `B2-T03-N2-E1`, code-barres, une flèche vers le haut) et le
  **schéma d'une travée de face** (niveaux 1 à 4, emplacements 1 à 3, le sol marqué « niveau 1 »).
- Fiche « Lire une adresse » (`liste` × 3, adresse **tirée**, §6 bis) : « {B2} : c'est… » allée B, côté 2 / l'emplacement 2 / le niveau 2 ·
  « {T03} : c'est… » la 3e travée de l'allée / le niveau 3 / le quai 3 · « {N2} : c'est… » le 2e niveau, au-dessus du sol / le sol / le 2e
  emplacement. Envoi : « Envoyer à Samia » → « C'est ça. Maintenant, au rack ! »

### Étape 2 — Ranger (Plan d'entrepôt, palettier à adresse donnée : lots 1 et 2)

- Message de Samia (consigne) : « Prends une palette, va à son adresse. Niveau 1 : tu poses. Plus haut : tu vérifies la plaque, puis tu confies à
  Kevin. Et tu scannes. Samia »
- **5 palettes** en zone de réception (§6) : 2 pour le **sol** (picking), 2 pour la **réserve** (Kevin), 1 dont l'**adresse dépasserait la plaque
  de charge** (à signaler).
- Guidage : « Les règles ▾ » ouvertes (adresse, sol / réserve, plaque, scan), la plaque de charge et la charge déjà posée **visibles de près**
  (aide charge du moteur) ; après « Vérifier », le nom du critère seul (« ✗ adresse », « ✗ scan », « ✗ plaque de charge »).
- Signalement de la palette trop lourde : motif « charge dépassée » → Samia (`apresSignalement`) : « Bien vu. Le système te donne une autre adresse :
  {adresse 2}. » ; l'élève la range (ou la confie) et la scanne.

### Étape 3 — Demander à Kevin (Messagerie, réponse par phrases)

- Message de Samia (`apresGeste('entrepot:action-ranger:verifier')`) : « Écris à Kevin les palettes à monter. Samia »
- Phrases **calculées** sur les palettes que l'élève a **confiées** (§6.3) : salutation · la demande (palettes et adresses) · politesse · fin.
- Kevin répond (`apresMail`) : « OK, je monte ça tout de suite. Kevin » → les palettes passent de « À monter » à leur emplacement.

### Fin

- Samia : « Merci {prénom}. Demain matin, 6 h : inventaire tournant dans cette allée. Samia »
- Bilan, `bilanDetail` ; « Corriger » rouvre la fiche, le rangement et le message.

**Mots cliquables** : adresse, allée, travée, niveau, emplacement, picking, réserve, plaque de charge, scanner, cariste.

## 4 bis. Questions au fil — décidées par Tristan (21/10/2026 : « on garde tout »)

`contenus/questions/ENT-8.11.js`, `part: 4`, personnes : Samia, Kevin. Les énoncés sont ceux validés, **reformulés au « niveau 1, au sol »** (le
moteur) ; poids proposés par Cowork (somme 4).

| id | Geste | Qui pose | Question (juste en gras) | Type | Notée | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|---|
| `q-adresse` | première palette **posée** (`entrepot:<id>:poser`) | Samia | « L'étiquette dit {B1-T04-N3-E2}. Que veut dire le {3} ? » — **le niveau : le 3e en partant du sol** · la travée · l'emplacement · l'allée | fil | 0,75 | tout de suite | C1.5.1 ; adresse **tirée**, autre que celles de ses palettes (ne donne pas le jalon de la fiche, déjà envoyée) |
| `q-plaque` | palette **lourde posée ou confiée** | Samia | « Une plaque dit {800} kg par niveau. Le niveau porte déjà {300} kg. Une palette de {650} kg peut-elle y aller ? » — **non : ça dépasserait la plaque** · oui, il reste de la place · oui si on la pousse au fond | fil | 0,75 | **au bilan** (proche du jalon plaque) | C1.5.2 ; valeurs **tirées**, jamais celles de sa palette à signaler ; la question dit *que*, pas *de combien* |
| `q-kevin` | première palette **confiée** | Samia | « Pourquoi c'est Kevin qui monte la palette, et pas toi ? » — **monter en hauteur demande un autre chariot et une autorisation de conduite que je n'ai pas encore** · parce que je suis stagiaire et que je n'ai pas le droit de toucher aux palettes · parce que Kevin va plus vite | fil | 0,5 | tout de suite | C1.5.2, limite du poste (catégories R489) |
| `q-sans-scan` | premier **scan** réussi | Samia | « Imagine : tu poses une palette sans la scanner. Où le système croit-il qu'elle est ? » — **à l'adresse qu'il avait donnée, ou nulle part : il ne sait pas où elle est vraiment** · là où tu l'as posée · il le devine | fil | 0,75 | tout de suite | C1.5.3 ; prépare ENT-8.13 |
| `q-materiel` | **éco-droit** — message à Kevin **envoyé** | Samia | « Ici, le chariot et l'ordinateur appartiennent à Action, mais toi, tu travailles pour Geodis. Pourquoi ? » — **Action confie son entrepôt à Geodis, un prestataire : Geodis fournit l'équipe, Action le matériel** · Geodis loue ses salariés à Action · Action est le patron de Geodis | fil | 0,75 | tout de suite | C1.1 rappelé ; fait **vérifié** (Gomet') — document à gauche : « Action et Geodis à Ensuès » (2 lignes, source) |
| `q-securite` | **éco-droit** — fin du rangement (`verifier`) | Samia | « Une palette mal posée tombe d'un rack. Qui devait organiser la sécurité ? » — **l'employeur doit assurer la sécurité ; chacun doit aussi faire attention à la sienne et à celle des autres** · seulement le salarié qui a posé la palette · personne : c'est un accident | fil | 0,5 | tout de suite | Responsabilité ; texte joint « Le droit » : **L4121-1 et L4122-1** (exacts, Légifrance) |

- **Retours proposés** (la conséquence, pas la leçon) : `q-adresse` « Le 3e niveau en partant du sol : c'est Kevin qui y va. » · `q-plaque` « Au-delà
  de la plaque, le rack peut plier. On signale, on ne pose pas. » · `q-kevin` « En hauteur, c'est un autre chariot et une autre autorisation. Tu y
  viendras peut-être. » · `q-sans-scan` « Sans scan, le système se trompe, et demain un préparateur trouve un emplacement vide. » · `q-materiel`
  « C'est le travail d'un prestataire logistique. » · `q-securite` « L'employeur organise ; toi, tu fais attention. Les deux. »
- **Écartées** : aucune (Tristan a tout gardé). `q-plaque` corrigée **au bilan** : elle éclairerait le jalon plaque.

## 4 ter. Avant de commencer — notions validées par Tristan, banque complétée par Cowork

`ouverture`, Samia, tirage **3 préparation + 1 image**, non notées. Les quatre notions validées (★) ; les autres proposées par Cowork (à relire).

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| `k-adresse` | préparation | Une adresse de rangement dit… | où ranger la palette : allée, travée, niveau, emplacement | à quel magasin l'envoyer · le nom du produit | étiquette dessinée | ★ |
| `k-sol-reserve` | préparation | Au niveau 1, au sol, on met… | les palettes où l'on prépare les commandes (le picking) | les palettes vides · les palettes abîmées | travée de face | ★ |
| `k-plaque` | préparation | La plaque de charge d'un rack dit… | combien de kilos chaque niveau peut porter au plus | le nombre de palettes dans l'allée · la hauteur du plafond | plaque dessinée (chiffres tirés) | ★ |
| `k-scan` | préparation | Scanner l'emplacement après avoir rangé, ça sert à… | dire au système où est la palette | compter les cartons · imprimer une étiquette | — | ★ |
| `k-reserve` | préparation | Les niveaux au-dessus du sol servent… | de réserve : on y descend une palette quand le picking se vide | à ranger les palettes cassées · aux bureaux | — | |
| `k-cariste` | préparation | Le cariste, c'est… | la personne qui conduit le chariot élévateur | le chauffeur du camion · le chef d'équipe | — | |
| `k-poids` | préparation | Une palette de {n} cartons de {k} kg, plus {25} kg de palette, pèse… | {n × k + 25} kg | {n × k} · {n + k + 25} | — | |
| `img-plaque` | image | Ce panneau fixé au bout du rack, c'est… | la plaque de charge | un plan d'évacuation · une adresse | dessin (traits seulement, noir et blanc lisible) | ★ |
| `img-retractable` | image | Ce chariot, qui monte les palettes très haut, c'est… | un chariot à mât rétractable | un transpalette · un tracteur | dessin sans visage (kit iso) | |

## 5. Jalons / notation (sur 20) — poids validés par Tristan (21/10/2026, après correction des questions à 4)

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Lire l'adresse** (C1.5.1) | 3 lignes de la fiche, 1 chacune | **3** | fiche `adresse` | ligne jugée contre **l'adresse tirée** |
| **Ranger au niveau 1** (C1.5.2) | P1 et P2 posées au sol, à leur adresse, 2 chacune | **4** | `place-P1`, `place-P2` | non posée = faux |
| **Plaque de charge** (C1.5.2) | P5 signalée « charge dépassée », non posée ni confiée à son adresse d'origine 2 · aucune palette posée ou confiée au-delà d'une plaque 1 | **3** | `signale-P5`, critère `charge` | le second **seulement si toutes les palettes sont traitées** (sinon il récompense l'inaction) |
| **Passer la main à Kevin** (C1.5.2) | P3 et P4 confiées à leur adresse, 1 chacune | **2** | `place-P3`, `place-P4` (+ `pasPoseHaut`, garde) | une tentative de pose en hauteur n'enlève rien ici (refusée par la vue), elle est en trace |
| **Scanner** (C1.5.3) | P1 à P4 scannées à leur adresse, et P5 à sa nouvelle adresse, 0,6 chacune | **3** | `scan-P1` … `scan-P5` | non scannée = faux |
| **Les questions de Samia** | `q-adresse` 0,75 · `q-plaque` 0,75 · `q-kevin` 0,5 · `q-sans-scan` 0,75 · `q-materiel` 0,75 · `q-securite` 0,5 | **4** | moteur des questions | — |
| **Forme du message à Kevin** | salutation et politesse justes | **1** | phrases | ≤ 15 % (5 %) |
| **Total** | | **20** | | |

- La ligne « la demande » du message (palettes et adresses) **n'est pas notée à part** : elle est calculée sur ce que l'élève a confié (une erreur
  ne se paie qu'une fois).
- **Corriger** : `'fiche:adresse'`, `'entrepot:action-ranger'`, `'phrases:kevin'`.

## 6. Contenu (données)

`contenus/action-ent811.js` (+ `-donnees.js`), `contenus/questions/ENT-8.11.js`, `activites/action-ranger.js`, `contenus/corriges/ENT-8.11.js`.
Une base par séance ; rien n'est lu dans la base d'une autre séance.

### 6.1 L'allée (construite)

Une partie du palettier d'Ensuès : **allées A et B**, deux côtés chacune (`A1`, `A2`, `B1`, `B2`), **4 travées**, **4 niveaux** (N1 sol, N2 à N4
réserve), **3 emplacements** par niveau. **Plaques de charge** (charge max d'un niveau, construites) : N1 **3 000 kg** · N2 **1 500 kg** · N3
**1 200 kg** · N4 **1 000 kg**. Stock de départ : environ la moitié des emplacements occupés (produits du §6.2), de quoi rendre une adresse tirée
plausible ; zone de réception à droite, zone « À monter » au pied de l'allée, `QUAI 2` (celui d'ENT-8.7).

### 6.2 Les produits (catégories réelles, désignations génériques, colisage construit)

| Code | Désignation | Catégorie (vérifiée) | Carton | kg / carton | Classe |
|---|---|---|---|---|---|
| `LES` | Lessive liquide 3 L, carton de 4 | entretien de la maison | 4 × 3 L | 13 | lourd |
| `NET` | Nettoyant multi-usages 1 L, carton de 12 | entretien de la maison | 12 × 1 L | 13 | lourd |
| `CRO` | Croquettes pour chien 4 kg, carton de 3 | animaux | 3 × 4 kg | 12,5 | lourd |
| `CAH` | Cahiers grand format, carton de 20 | bureau et loisirs créatifs | 20 | 9 | normal |
| `BOU` | Bougies parfumées, carton de 12 | décoration | 12 | 3 | léger |
| `BOI` | Boîtes de rangement 10 L, carton de 6 | articles ménagers | 6 | 4 | léger, volumineux |
| `PEL` | Peluches, carton de 12 | jouets et loisirs | 12 | 3 | léger, volumineux |
| `SER` | Serviettes de bain, carton de 10 | mode et linge de maison | 10 | 6 | normal |

Palette : **25 kg** (support). Poids d'une palette = cartons × kg + 25, **calculé par le code**, jamais recopié.

### 6.3 Les 5 palettes (pièces tirées dans la banque, §6 bis)

| Rôle | Adresse donnée | Ce qui doit être vrai |
|---|---|---|
| P1 sol | `A?-T??-N1-E?` libre | posable au sol, charge du niveau 1 respectée |
| P2 sol | `B?-T??-N1-E?` libre | idem, autre allée |
| P3 réserve | N2 ou N3 libre | charge respectée → « Confier à Kevin » juste |
| P4 réserve | N2 à N4 libre | idem, légère |
| P5 à signaler | N3 ou N4 **libre**, mais la charge déjà posée + P5 **dépasse** la plaque | lourde (`LES`, `NET` ou `CRO`) ; nouvelle adresse donnée après signalement : N2 libre où elle tient |

- Le **contrôle d'équité** (calculé par un test) : P5 dépasse **toujours** ; P1 à P4 ne dépassent **jamais** ; l'adresse de P5 et sa nouvelle
  adresse sont libres ; aucune palette n'a la même adresse qu'une autre.

### 6.4 Les phrases du message à Kevin (calculées)

| Ligne | Juste | Pièges |
|---|---|---|
| salutation | « Bonjour Kevin, » | « Yo Kevin, » · « Kevin ! » |
| la demande | « peux-tu monter {P3} en {adresse} et {P4} en {adresse} ? » (sur **ce qu'il a confié**) | une autre palette · une autre adresse |
| politesse | « Merci ! » | « Vite. » · « Dépêche. » |
| fin | « {prénom} » | « Bisous » |

## 6 bis. Tirage et niveaux

- **Fiche « Lire une adresse »** : une adresse tirée parmi 8 (allée, côté, travée 01-04, niveau 2-4, emplacement 1-3), contrôle : niveau ≠ travée ≠
  emplacement (pas de confusion possible entre deux réponses justes).
- **Palettes** : banque de 8 produits (§6.2) ; P1, P2, P4 tirées parmi tous ; P5 parmi les lourds ; P3 parmi les normaux ou légers ; adresses tirées
  sous les contraintes du §6.3 ; 200 graines vérifiées (aucun secours, chaque produit sorti au moins 10 fois).
- **Confirmé** : une **6e palette** en bonus (réserve, à confier, jalons `place-P6` et `scan-P6` en `bonus: true`) ; consigne identique.
- **Accompagné** : « Les règles ▾ » restent ouvertes, et la **somme « charge déjà posée + ta palette »** s'affiche de près (le calcul fait) ;
  « Vérifier » dit l'adresse attendue pour la palette en main (et pas seulement le nom du critère).
- **Consigne neutre** : « Range les palettes de la réception » (ne dit pas combien, ni qu'une est à signaler).

## 7. Demandes au moteur

**Chantier `MOTEUR-palettier-adresse-donnee.md`, lots 1 et 2** (adresse donnée, niveaux du cariste, signaler, scan). À vérifier à l'état des lieux :
- `apresSignalement` qui donne une nouvelle adresse (guidage) ;
- la Messagerie qui calcule ses phrases sur **les palettes confiées** ;
- l'étiquette d'emplacement dessinée (document à gauche de la fiche) : un SVG de la séance suffit, sinon demande.

### 7 bis. Séance déjà jouée ? Non.

## 8. Tests attendus

Bloc `action-811` (lignes dans `BLOCS` et `GROUPES` : alerte 7).

- Parcours juste (deux témoins de graines différentes) : 20/20 ; inaction : 0/20 (le jalon « aucune palette au-delà d'une plaque » non compté).
- P5 posée à son adresse d'origine → refusée par la vue (hauteur) ; confiée à Kevin à son adresse d'origine → `signale-P5` ✗ et critère `charge` ✗.
- Signaler P3 « charge dépassée » (à tort) → ✗.
- Une palette rangée et non scannée → `scan-P…` ✗, le reste ✓.
- `q-plaque` corrigée au bilan ; somme des poids = 20 (cas) ; `part` 4.
- Confirmé : P6 présente, bandeau identique, note du socle inchangée sans elle ; accompagné : somme de charge visible.
- Sabotages : signalement jugé contre la bonne réponse au lieu de la vérité de l'emplacement → le cas « signaler à tort » tombe ; phrase « la
  demande » jugée contre P3 / P4 attendus au lieu de ce qu'il a confié → le cas « une erreur ne se paie qu'une fois » tombe.

## 9. Supports

Trame (Cowork, après validation à l'écran) : **cours** d'une demi-page, noir et blanc — « Lire une adresse » (schéma d'une travée), « Sol ou
réserve », « La plaque de charge », « Toujours scanner ». Corrigé : `contenus/corriges/ENT-8.11.js`.

## 10. Critères de validation par Tristan

- L'élève de CAP comprend d'un coup « l'adresse est sur la palette » ; il ne cherche pas où ranger.
- La plaque de charge se lit de près sans calculatrice (sauf la somme en accompagné).
- On ne peut pas monter soi-même ; « Confier à Kevin » est évident.
- 45 minutes suffisent.

## 11. Questions ouvertes et décisions de Cowork

1. **Proposé par Cowork** : les dates (mardi 2 mars, 13 h 30, pour 8.11 ; voir §0). À confirmer par Tristan d'après sa progression CAP.
2. **Proposé par Cowork** : la répartition des 4 points de questions (§4 bis) et des poids à l'intérieur des blocs validés (§5).
3. **Proposé par Cowork** : les entrées de la banque « Avant de commencer » sans ★ (§4 ter) ; les produits et colisages (§6.2) ; les plaques (§6.1).
4. Textes de Cowork (Samia, Kevin, questions, retours, phrases) : à relire à l'écran.

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
