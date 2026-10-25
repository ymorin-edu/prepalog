# Brief de séance — ENT-8.15 Action — prendre en charge une préparation (CAP OL, guidage CAP-C3.1)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/MOTEUR-preparation-vocale-cartons.md puis docs/briefs/ENT-8.15-action-preparer.md en entier. Les lots 0, 1 et 2 du chantier E-8 doivent être livrés. Fais l'état des lieux du §7, dis-moi ce qui contredit le brief, puis construis la séance. Annonce la durée avant de commencer.
> ```

**Statut** : à implémenter (poids validés par Tristan le 25/10/2026) *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 25/10/2026, projet PREPALOG (cadrage de C3.1 à C3.3 chez Action, demande de Tristan : « tu vas cadrer 8.15 à 8.19, tu me
poses que les questions importantes »).
**Modèle** : **Opus** (séance nouvelle). **Durée estimée** : ≈ 4 h, après les lots 0 à 2 d'E-8. Ce qui prend le temps : la scène d'inspection
déclarée pour Action, la mission, les questions, les tests.
**Place dans l'ordre** : après ENT-8.14. Attend les **lots 0, 1 et 2** de `MOTEUR-preparation-vocale-cartons.md` (E-8) et la vue **Inspection du
poste** (livrée le 19/10, G-5, utilisée par Pelleau).

Ce qui n'a pas été tranché par Tristan est marqué **« proposé »** et repris au §11 : à relire, surtout à l'écran.

---

## 0. Règles communes à ENT-8.15 → 8.19 (C3.1 à C3.3 chez Action)

- **§0 d'ENT-8.11** reste vrai : public CAP (une consigne par écran, 3 lignes au plus, tout en cliquant) ; **Geodis à Ensuès-la-Redonne** ;
  **Samia** (cheffe d'équipe, tutrice), **Kevin** (cariste), **Julie** (agent administratif), **Yanis** (préparateur, ENT-8.13) — construits ;
  « Avant de commencer » ; jalons pondérés sur 20 ; **questions au fil 4 points** ; `parcours`, `correction` ; jamais un élève bloqué ; ce qui
  est construit se dit dans la séance ; **charte bleue** (`#195799`), **vert plein réservé à « juste »** ; aucun visage de salarié, aucune
  parole prêtée à un salarié réel, produits sans marque.
- **Sans date** : le jour et l'heure seulement. 8.15 **un lundi, 6 h** ; 8.16 **le lendemain, 6 h** ; 8.17 **un jeudi, 6 h** ; 8.18 **un
  vendredi, 6 h** ; 8.19 (évaluation) **un mardi, 6 h**. *(Proposé : l'équipe commence à 5 h, l'élève stagiaire à 6 h, voir `q-nuit`.)*
- **La vue** : préparation dans le **mode `preparation` du Plan d'entrepôt** (Smoby, ENT-5.6), **guidée par le terminal vocal** (France
  Boissons, ENT-6.7), avec la pose **« Palette · À côté »** : chantier **E-8**. *(Choisi par Tristan le 25/10/2026, 14 h 25.)*
- **Vérifié** (offre France Travail 191TDTN, client « GEODIS/ACTION », actualisée le 29/04/2025) : à Ensuès, le préparateur travaille **à la
  voix**, avec un **scanner**, fait le **filmage** et la **mise à quai**, **CACES 1** exigé. Le reste est construit.
- **Ce que le référentiel attend** (CAP 2026, fiche `referentiel-cap-ol.md`) :
  **C3.1** prendre en charge la préparation (collectif de travail, documents, **circuit de prélèvement**, matériel, EPI) ·
  **C3.2** déstocker (adressage, prélèvement, contrôles, signaler une anomalie, actualiser) ·
  **C3.3** conditionner (grouper par client, contenant et calage, emballer, étiqueter).
- **Les magasins** (réels, Action dans le Sud-Est, tirés par élève) : Marseille Centre Bourse, Marseille Grand Littoral, Marseille Le Merlan,
  Marseille La Valentine, Marseille Saint-Loup, Marseille avenue de Lombard, Châteauneuf-les-Martigues, **Nîmes toujours dans le lot**
  (décision de Tristan du 18/10). *Que ces magasins soient livrés depuis Ensuès est **construit** (plausible, non publié) : le dire dans la
  mention.* Les adresses des magasins ne sont pas écrites.
- **Les produits** : ceux d'ENT-8.11 §6.2 (lus, jamais modifiés), plus **trois fragiles** proposés (§6.2), catégories réelles d'Action.
- **Support** : la **palette** (les rolls ne sont pas vérifiés à Ensuès : on n'en parle pas).
- **Mention** (fin de séance) : « L'entrepôt, les adresses, les commandes et les codes de contrôle sont construits pour l'exercice. Action et
  Geodis ne publient pas l'organisation de l'entrepôt d'Ensuès ni la liste des magasins qu'il livre. »

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.15 (provisoire) |
| `id` | `action-preparer` |
| Titre / desc | « Action — prendre en charge une préparation » / « Prendre son poste de préparateur : vérifier son transpalette, lire sa mission, suivre le terminal vocal dans le circuit de prélèvement, puis dire à Samia que la commande est prête. » |
| Rubrique | simulog, entreprise n° 8 Action |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competencesCap: ['CAP-C3.1']` ; ligne `'ENT-8.15': 'CAP-C3.1'` dans `ATTENDU_CAP` (`outils/test/socle.mjs`) : le dire (alerte 7) |
| Temps pédagogique | `temps: 'guidage'` |
| Notation | jalons pondérés, `parcours: true`, `correction: true`, `bilanDetail: true`, `precedente: 'action-palette-a-cote'` (ENT-8.13, dernière séance du parcours C1.5 ; à vérifier dans le registre) |
| Barème | `bareme: 20` |
| Niveaux d'élève | `niveauxPrevus: ['confirme', 'accompagne']` |
| `questions` | `'ENT-8.15'` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

- **Vérifié** : voir §0 (offre 191TDTN) ; catégories R489 du CAP 2026 : **1A** (transpalettes à conducteur porté et préparateurs de commandes au
  sol), 1B, 3 ; « CACES 1 » de l'offre = l'ancienne catégorie R389 qui correspond. *(À dire simplement : « le permis du transpalette ».)*
- **Texte** (à recopier exactement depuis Légifrance à la construction, date en pied) : **C. trav. L3163-1 et L3163-2** (travail de nuit des
  jeunes travailleurs de moins de 18 ans : interdit, sauf dérogations ; pour les 16-18 ans, la nuit va de 22 h à 6 h). *Non relu ce jour : la
  construction le vérifie et corrige la question si besoin.*
- **Construit** : la scène du poste, les défauts, la mission, la commande, l'heure du camion, le quai, le circuit.

## 3. Objectif pédagogique

À la fin, l'élève sait **prendre son poste** de préparateur (vérifier son transpalette, ses EPI), **lire sa mission** (magasin, nombre de
lignes et de cartons, quai, heure du camion), **suivre le terminal** dans le circuit de prélèvement (aller à l'adresse, dire le code de
contrôle, prendre la quantité, poser) et **rendre compte**. Aucune anomalie dans cette commande : elles arrivent en 8.16.

## 4. Déroulé (≈ 45 min)

### Accueil (Samia, aussi en `sousTitre`)
« Bonjour {prénom} ! Aujourd'hui, tu passes à la préparation. Tu suis la voix du terminal, adresse après adresse. D'abord, ton
transpalette. Samia »

### Étape 0 — Avant de commencer (non notée, Samia) — §4 ter

### Étape 1 — Prendre mon poste (vue Inspection, scène « Le poste »)
- Scène existante (local de charge + quai vu de l'intérieur) ; **un transpalette électrique** ; **2 défauts tirés** parmi : fourche tordue,
  roue abîmée, câble de charge abîmé, avertisseur muet (bouton « Essayer l'avertisseur »), extincteur absent, plan de circulation absent.
- « Signaler à Samia » ; Samia répond « C'est noté, prends le transpalette 2. » (même texte quel que soit le signalement) ; « C'est bon, je
  prends mon poste » fige. En guidage, un défaut jamais signalé arrête l'élève (comportement de la vue), sans le nommer.

### Étape 2 — Lire ma mission (fiche, document à gauche)
- À gauche : **l'écran d'accueil du terminal**, dessiné : « Mission 4127 · Magasin : {Marseille La Valentine} · 5 lignes · {23} cartons · Quai
  {4} · Départ du camion : {8 h 15} ». Valeurs tirées.
- Fiche « Ma mission » (`liste` × 4) : pour quel magasin · combien de cartons · sur quel quai · avant quelle heure. Envoi : « Envoyer à Samia »
  → « C'est ça. Casque sur les oreilles : c'est parti. »

### Étape 3 — Préparer (Plan d'entrepôt, mode `preparation`, terminal vocal : lots 0, 1, 2)
- **5 lignes**, aucune exception, **un seul magasin, une seule palette**. L'ordre du terminal suit le **circuit** (serpentin) ; il est déjà
  favorable au montage (lourds d'abord) : la pose « À côté » existe mais n'est pas utile ici.
- Consigne de Samia : « Le terminal te dit une adresse. Tu y vas, tu lis le code sur la lisse, tu le tapes. Il te dit combien prendre. Samia »
- **Critères jugés** : `lignesJustes` seulement (film et étiquettes : 8.17 ; à la fin, « Yanis filme et étiquette ta palette », texte, pas de
  geste). « Vérifier ma préparation » (guidage) donne le verdict par ligne.

### Étape 4 — Rendre compte (Messagerie, réponse par phrases)
- Samia écrit en premier, à « Vérifier » : « Alors, {prénom}, ta commande ? Samia » ; réponse par phrases : salutation · « la commande de
  {magasin} est prête, quai {n} » (calculée sur **la mission**) · politesse · fin.

### Fin
- Samia : « Merci. Demain, la commande sera plus longue, et tout ne sera pas en place. Samia »
- Bilan détaillé ; « Corriger » rouvre la fiche, la préparation et le message (pas l'inspection, figée).

**Mots cliquables** : préparateur, mission, ligne, circuit de prélèvement, code de contrôle, lisse, EPI, transpalette électrique, quai.

## 4 bis. Questions au fil — proposées (somme 4)

| id | Geste | Qui | Question (juste en gras) | Poids | Corrigée |
|---|---|---|---|---|---|
| `q-caces` | inspection figée | Samia | « Pour conduire ce transpalette, il te faut… » — **une formation et une autorisation de conduite de mon employeur (le CACES aide à l'obtenir)** · rien, c'est un petit engin · le permis B | 0,75 | tout de suite |
| `q-epi` | mission envoyée | Samia | « Pourquoi des chaussures de sécurité pour préparer ? » — **un carton ou le transpalette peut m'écraser le pied** · c'est l'uniforme d'Action · pour marcher plus vite | 0,5 | tout de suite |
| `q-circuit` | 3e ligne prise | Samia | « Pourquoi le terminal te fait passer dans cet ordre ? » — **c'est le chemin le plus court : on ne revient jamais en arrière** · c'est l'ordre alphabétique des produits · au hasard | 1 | au bilan (proche du jalon) |
| `q-code` | premier code juste | Samia | « Le code de contrôle, ça sert à… » — **prouver au système que je suis devant le bon emplacement** · compter les cartons · ouvrir le carton | 0,75 | tout de suite |
| `q-nuit` | **éco-droit** — message à Samia envoyé | Samia | « L'équipe commence à 5 h. Toi, tu as 16 ans et tu commences à 6 h. Pourquoi ? » — **la loi interdit le travail de nuit aux moins de 18 ans** · c'est plus pratique pour le bus · les stagiaires dorment plus | 1 | tout de suite ; texte joint « Le droit » : L3163-1, L3163-2 |

Retours (la conséquence) : `q-caces` « Sans autorisation, pas de conduite, même pour un transpalette. » · `q-epi` « Un pied écrasé, c'est des
semaines d'arrêt. » · `q-circuit` « Moins de pas, moins de fatigue, le camion part à l'heure. » · `q-code` « Un mauvais code, c'est un mauvais
produit chez le magasin. » · `q-nuit` « Tu es protégé par la loi. À 18 ans, tu pourras commencer à 5 h. »

## 4 ter. Avant de commencer — banque proposée (non notée, tirage 3 + 1 image)

| id | Question | Juste | Pièges |
|---|---|---|---|
| `k-preparer` | Préparer une commande, c'est… | prendre dans le stock ce qu'un magasin a commandé | ranger les palettes qui arrivent · charger le camion |
| `k-ligne` | Une ligne de commande dit… | un produit, son adresse, combien en prendre | le prix du produit · le nom du chauffeur |
| `k-picking` | On prend les cartons… | au niveau 1, au sol (le picking) | tout en haut du rack · dans le camion |
| `k-quai` | Une commande prête va… | sur le quai de son camion | en réserve · au bureau |
| `img-transpalette` | Cet engin, c'est… | un transpalette électrique | un chariot élévateur · un gerbeur (dessin du kit iso) |

## 5. Jalons / notation (sur 20) — poids validés par Tristan (25/10/2026, 14 h 26)

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Prendre mon poste** (matériel, EPI) | 2 défauts signalés, 2 chacun · aucun faux signalement 1 | **5** | `securite-<id>`, `securite-aucun-faux` | « aucun faux » seulement si l'inspection est figée |
| **Lire ma mission** (documents) | 4 lignes de la fiche, 1 chacune | **4** | fiche `mission` | jugée contre la mission **tirée** |
| **Suivre le circuit** (prélèvement) | 5 lignes justes, 1 chacune | **5** | `ligne-1` … `ligne-5` | une ligne non faite = faux ; codes faux comptés, non notés |
| **Les questions de Samia** | §4 bis | **4** | moteur des questions | — |
| **Rendre compte** (collectif de travail) | salutation et politesse 1 · le message (magasin, quai) 1 | **2** | phrases | ≤ 15 % ; la ligne « commande prête » jugée contre **la mission** |
| **Total** | | **20** | | |

- Inaction : 0/20 (« aucun faux » non compté tant que l'inspection n'est pas figée).

## 6. Contenu (données)

`contenus/action-ent815.js`, `contenus/questions/ENT-8.15.js`, `activites/action-preparer.js`, `contenus/corriges/ENT-8.15.js`. L'entrepôt de
préparation : `contenus/action-prepa-donnees.js` (E-8 lot 0, partagé par 8.15 à 8.18).

### 6.1 L'entrepôt de préparation (construit, E-8 lot 0)
Proposé : **4 allées (A1, A2, B1, B2), 6 travées, 4 niveaux, 3 emplacements**, N1 = picking, N2 à N4 = réserve. Chaque emplacement de picking a
un **code de contrôle** de 2 chiffres (tiré par élève, jamais deux fois le même dans l'allée).

### 6.2 Les produits
Les 8 d'ENT-8.11 (`LES`, `NET`, `CRO`, `CAH`, `BOU`, `BOI`, `PEL`, `SER`), plus, proposés, **trois fragiles** :

| Code | Désignation | Catégorie (vérifiée) | kg / carton | Classe |
|---|---|---|---|---|
| `VER` | Verres à eau, carton de 12 | articles ménagers | 4 | fragile |
| `VAS` | Vases en verre, carton de 6 | décoration | 5 | fragile |
| `ASS` | Assiettes en céramique, carton de 12 | articles ménagers | 8 | fragile |

### 6.3 La commande de 8.15
5 lignes, 3 à 6 cartons par ligne, 18 à 26 cartons ; au moins un lourd et un léger ; **aucun fragile** (8.17) ; l'ordre du circuit met les
lourds d'abord (contrôle d'équité, calculé par un test).

## 6 bis. Tirage et niveaux

- Tirés par élève : les 2 défauts, la mission (magasin, n°, quai 1 à 6, heure 7 h 30 à 9 h 00 par quart d'heure), les 5 lignes, les codes.
- **Confirmé** : une **6e ligne** en bonus (`bonus: true`), consigne identique.
- **Accompagné** : « Les règles ▾ » ouvertes ; sur le plan, l'**allée de la ligne en cours** est entourée.

## 7. Demandes au moteur

- E-8 lots 0, 1, 2 ; **pouvoir ne juger qu'une partie des critères** (`lignesJustes` seul) : à vérifier à l'état des lieux (JALONS_PREP), le dire
  avant de contourner.
- Vue Inspection : déclarer une scène pour Action (aucun changement de vue attendu).
- Messagerie : Samia écrit en premier à `apresGeste('entrepot:action-preparer:verifier')`.

### 7 bis. Séance déjà jouée ? Non.

## 8. Tests attendus

Bloc `action-815` (lignes dans `BLOCS` et `GROUPES` : alerte 7). Parcours juste (deux graines) : 20/20 ; inaction : 0/20 ; un défaut non
signalé ; un faux signalement ; un code faux puis juste (aucun point perdu) ; une ligne avec une mauvaise quantité ; la phrase « commande prête »
jugée sur la mission ; confirmé (6e ligne, note du socle inchangée) ; accompagné (allée entourée) ; somme des poids = 20 ; `part` 4. Sabotage :
juger la fiche contre une mission fixe au lieu de la mission tirée → le cas « deux graines » tombe.

## 9. Supports
Cours d'une demi-page (après validation à l'écran) : « Prendre mon poste », « Lire ma mission », « Le circuit de prélèvement », « Le code de
contrôle ».

## 10. Critères de validation par Tristan
- L'élève comprend tout de suite qu'il suit **la voix** et qu'il n'a pas de bon papier.
- Le code de contrôle se trouve sans aide sur la lisse.
- 45 minutes suffisent.

## 11. Questions ouvertes
1. **Tranché par Tristan (25/10)** : poids du §5. **Proposé** : questions au fil, retours et banque « Avant de commencer » ; produits fragiles ; heures.
2. **Proposé** : le stagiaire commence à 6 h (`q-nuit`) ; texte de loi à relire sur Légifrance à la construction.
3. **Tranché par Tristan (25/10, 14 h 25)** : la vue est la préparation Smoby guidée par le terminal vocal (E-8).
