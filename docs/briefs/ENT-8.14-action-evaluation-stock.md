# Brief de séance — ENT-8.14 Action — évaluation : mettre en stock dans un autre site (CAP OL, évaluation CAP-C1.5)

> **📋 Phrase à copier-coller dans Claude Code (Opus) :**
>
> ```
> Lis CLAUDE.md, docs/EN-COURS.md, docs/briefs/ENT-8.5-action-evaluation-se-situer.md (§0 bis, §2), docs/briefs/ENT-8.10-action-evaluation-reception.md (§0, §4 ter), docs/briefs/ENT-8.11-action-ranger.md (§0, §6), docs/briefs/MOTEUR-palettier-adresse-donnee.md (lot 6) puis docs/briefs/ENT-8.14-action-evaluation-stock.md en entier. Tout le chantier moteur doit être livré. Fais l'état des lieux du §7, dis-moi ce qui contredit le brief, puis construis la séance. Annonce la durée avant de commencer.
> ```

**Statut** : à implémenter
**Date du brief** : 21/10/2026
**Conversation d'origine** : Cowork (Opus), cadrage de C1.5 chez Action, 21/10/2026 (fiche `claude/prepalog-action-cadrage-c1.5.md`), décisions
5, 11, 12 et 13 de Tristan.
**Modèle** : **Opus** (séance nouvelle, évaluation).
**Place dans l'ordre** : après ENT-8.13. Attend **tout** le chantier `MOTEUR-palettier-adresse-donnee.md` (lot 6 compris).
**Durée estimée par Cowork** : ≈ 4 h. Ce qui prend le temps : deux plans de site, le jeu neuf tiré par élève, la copie faite de trois écrans, les
deux témoins.

---

## 0. Ce qui vaut pour cette séance

- **Tout le §0 bis d'ENT-8.5** : copie rendue (rien ne dit juste ou faux, aucun bilan, aucun « Corriger »), **jeu neuf tiré par élève**, **sans
  aide** (pas de mot cliquable, **pas de question au fil**), « Avant de commencer » **noté** (4 points, « Je ne sais pas », faux = − 1 ÷ nombre de
  mauvaises réponses, plancher 0), un écran par étape, ni bonus ni niveau, jamais un élève bloqué, une erreur ne se paie qu'une fois.
- **Même site qu'ENT-8.5 / 8.6 / 8.10** (module des sites, `contenus/action-eval-sites.js`) : **Onnaing (GXO)** ou **Belleville-en-Beaujolais
  (Kuehne+Nagel)** ; tuteur **Karim** ou **Sandrine** ; cariste **Léo** ou **Hugo** (construits) — décision 12 de Tristan.
- **Date : mardi 9 mars, 6 h** (proposée), sans année : « De retour chez {prestataire} à {site} pour une journée. »
- **Décision 5 de Tristan** : une matinée en trois temps courts — ranger 4 à 5 palettes (dont une au-delà de la plaque, et **une adresse prise sans
  personne pour pousser**), puis compter 4 à 5 adresses dont une à écart confirmé, signalé avec une cause. ≈ 50 min, au rythme du CAP.
- **Décision 11 + correction du 21/10** : les trois questions (adresse, colisage, éco-droit) passent dans « Avant de commencer » **noté** (4 points),
  comme en ENT-8.10.
- **Comptage en cartons** (décision du 21/10) : la question de colisage compte des cartons.

Écrans : **Avant de commencer (noté) → Ranger (palettier) → Compter (palettier, terminal) → Signaler l'écart (fiche) → Rendre ma copie.**

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-8.14 (provisoire) |
| `id` | `action-evaluation-stock` |
| Titre / desc | « Action — évaluation : mettre en stock dans un autre site » / « Dans un entrepôt que tu ne connais pas : ranger des palettes à leur adresse, voir une plaque de charge dépassée, traiter une adresse prise, scanner, compter des adresses et signaler un écart. » |
| Rubrique | simulog, entreprise n° 8 Action |
| Niveau(x) | `niveaux: ['cap']` |
| Compétence(s) | `competencesCap: ['CAP-C1.5']` (C1.5.1 à C1.5.4) ; ligne dans `ATTENDU_CAP` (alerte 7). |
| Temps pédagogique | `temps: 'evaluation'` (coefficient 3), `copie: true`, `export const noter = (db) => moteur.noter(db);` |
| Notation | jalons pondérés sur 20 ; pas de `parcours` (évaluation) |
| Barème | `bareme: 20` |
| `questions` | `'ENT-8.14'` (ouverture seulement) |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. Vérifié / construit

- **Vérifié** : les sites et prestataires (ENT-8.5 §2 : [GXO, 15/10/2026](https://www.globenewswire.com/news-release/2026/10/15/3381579/0/en/gxo-and-action-expand-partnership-in-france.html) ;
  [Kuehne+Nagel, 06/09/2023](https://www.faq-logistique.com/CP20230906-Kuehne+Nagel-Action-Prolongent-Collaboration-France.htm)) ; GXO à Onnaing fait
  **réception, stockage, préparation, expédition, retours** (communiqué de GXO). Faits et textes d'ENT-8.11 à 8.13 (§2) pour l'ouverture.
- **Construit, dit dans `MENTION`** : le palettier de chaque site (allées, travées, niveaux, plaques), les adresses, le terminal, les palettes, les
  stocks et l'écart, le tuteur et le cariste.

## 3. Objectif

Vérifier que l'élève **met en stock seul** dans un site qu'il ne connaît pas : il **repère** les adresses sur un plan nouveau (C1.5.1), **range au
sol** et **confie** la réserve sans monter, **voit** qu'une adresse dépasserait la plaque (C1.5.2), traite une **adresse prise** sans aide, **scanne**
(C1.5.3), **compte** à l'aveugle et **signale** un écart avec une cause (C1.5.4).

## 4. Déroulé (≈ 50 min)

### Accueil (tuteur du site)

« Bonjour {prénom}, content de te revoir chez {prestataire} ! Ce matin : la réception d'hier à ranger, puis quelques adresses à compter. Tu connais le
travail. {tuteur} »

### Étape 0 — Avant de commencer (notée, 4 points) — §4 ter

### Étape 1 — Ranger (palettier à adresse donnée, en copie, `rendCopie: false`)

- **Le plan du site** (§6.1) : autre nombre d'allées, de travées, de niveaux ; autres plaques de charge.
- **5 palettes** : P1 et P2 au sol ; P3 en réserve (« Confier à {cariste} ») ; **P4** dont l'adresse **dépasserait la plaque** ; **P5** dont l'adresse
  est **prise** (aucun message du cariste : l'élève décide seul).
- Signaler P4 : la vue publie le signalement, **aucune nouvelle adresse** (évaluation : « C'est noté. ») ; P4 reste en réception.
- « Valider mon rangement » (avec confirmation) → écran suivant. Aucun verdict.

### Étape 2 — Compter (palettier, terminal à scanner, à l'aveugle)

- Message du tuteur : « Merci. Maintenant, compte ces 4 adresses. {tuteur} »
- 4 adresses : 3 conformes, **1 écart** (manque ou surplus, tiré) ; le terminal propose « Recompter ou confirmer ? » quand le compte diffère (§11 n° 1).
- « Terminer le comptage ».

### Étape 3 — Signaler l'écart (fiche)

- À gauche : **ses** écarts confirmés (adresse, produit, son compte, le système).
- Fiche « Mes écarts » (lignes calculées sur **ses** écarts, comme ENT-8.12) : « Que fais-tu ? » et « Ce qui a pu se passer » (choix selon le sens).
- « Envoyer à {tuteur} » → « Merci, c'est noté. » → **« Rendre ma copie »** (deux clics).

## 4 ter. Avant de commencer — noté (4 points), sans aide

`ouverture: { part: 4, tirage: { preparation: 2, ecodroit: 1, image: 1 } }` *(si le moteur n'a pas de rubrique `ecodroit` distincte : `preparation: 3`
avec une banque d'éco-droit tirée à part, à l'état des lieux)*. Personne : le tuteur. Reprises des ★ d'ENT-8.11 à 8.13, **valeurs tirées** et
**réponses réécrites** (aucune phrase juste identique à celle des séances de travail : la mémoire seule ne suffit pas).

| id | Rubrique | Question | Juste | Pièges | Reprise de |
|---|---|---|---|---|---|
| `e-adresse` | preparation | « {C2-T02-N4-E1} : que veut dire le {4} ? » | le niveau (le 4e en partant du sol) | la travée · l'emplacement · l'allée | `q-adresse`, `k-adresse` |
| `e-adresse-b` | preparation | « {A1-T03-N1-E2} : à quelle hauteur ? » | au sol | au 3e niveau · en haut du rack | `k-sol-reserve` |
| `e-couches` | preparation | « {4} couches pleines de {6} cartons, et {3} cartons sur le dessus : combien de cartons ? » | {27} | {24} · {13} · {30} | `k-couche`, `q-colisage` (en cartons) |
| `e-couches-b` | preparation | « {3} couches pleines de {9} cartons, la couche du dessus en a {5} : combien ? » | {32} | {27} · {36} · {17} | idem |
| `e-plaque` | preparation | « Plaque : {1 200} kg par niveau. Déjà {700} kg. Palette de {600} kg : on la pose ? » | non : ça dépasserait la plaque | oui · oui si on la pousse au fond | `q-plaque` |
| `e-materiel` | ecodroit | « Ici, le matériel appartient à Action, l'équipe à {prestataire}. Pourquoi ? » | Action confie l'entrepôt à un prestataire, qui fournit l'équipe | {prestataire} loue ses salariés · Action est le patron de {prestataire} | `q-materiel` |
| `e-argent` | ecodroit | « Un écart de stock, pour Action, c'est… » | de l'argent : des produits payés qu'on ne peut plus vendre | rien, un chiffre · une amende | `q-argent` |
| `e-consignes` | ecodroit | « Un collègue te demande de ne pas scanner. Tu… » | suis la consigne de l'employeur : je scanne | obéis, il est pressé · ne fais rien | `q-collegue` |
| `e-img-plaque` | image | Ce panneau au bout du rack, c'est… | la plaque de charge | un plan d'évacuation · une adresse | `img-plaque` |
| `e-img-allee` | image | Qu'est-ce qui ne va pas ? | une palette laissée dans l'allée | rien · le rack est trop haut | `img-allee-encombree` |

- **Écartées** : `k-adresse-libre` (donnerait le bon geste de P5) ; `k-scan` (donnerait le bloc scan).

## 5. Jalons / notation (sur 20) — poids validés par Tristan (21/10/2026, après correction)

| Bloc | Cases | Poids | Ce qu'il lit | Piège à éviter |
|---|---|---|---|---|
| **Avant de commencer** | 4 questions, 1 chacune, règle du faux | **4** | moteur des questions | plancher 0 |
| **Repérer les adresses du site** (C1.5.1) | P1, P2, P3 posées ou confiées **à leur adresse**, 1 chacune | **3** | `place-P1` … `place-P3` | non posée = faux |
| **Ranger et voir la plaque** (C1.5.2) | aucune tentative de pose au-dessus du sol 1 · P4 signalée « charge dépassée », non posée ni confiée là 3 | **4** | `pasPoseHaut`, `signale-P4` | `pasPoseHaut` **seulement si toutes les palettes sont traitées** ; signaler à tort = faux |
| **Adresse prise** (C1.5.2) | P5 : adresse libre demandée, rangée, scannée | **2** | `adresseLibre-P5` | restée dans l'allée ou posée à côté = 0 |
| **Scanner** (C1.5.3) | P1, P2, P3, P5 scannées à leur adresse finale, 0,75 chacune | **3** | `scan-P…` | P5 : scannée à **son adresse libre** ; non scannée = faux |
| **Comptages justes** (C1.5.4) | 4 adresses, 0,5 chacune | **2** | `compte-<adresse>` | rien compté = faux |
| **Écart signalé, avec une cause** (C1.5.4) | « je le signale » 1 · cause possible 1 | **2** | fiche `ecarts` | jugé sur **ses** écarts ; aucun écart confirmé = faux (il n'a rien trouvé) |
| **Total** | | **20** | | |

- Par sous-compétence (pour Tristan) : C1.5.1 = 3 ; C1.5.2 = 6 ; C1.5.3 = 3 ; C1.5.4 = 4 ; ouverture 4.
- **Deux témoins** (un par site) : 20/20 ; inaction : 0/20.

## 6. Contenu (données)

`contenus/action-ent814.js` (+ `-donnees.js`), `contenus/questions/ENT-8.14.js`, `activites/action-evaluation-stock.js`,
`contenus/corriges/ENT-8.14.js`. **Module des sites** : ajouter à chaque site (sans toucher à ce qu'il a déjà) **son palettier** — ou le déclarer dans
`action-ent814-donnees.js` par clé de site si l'état des lieux le préfère (ne pas casser ENT-8.5, 8.6, 8.10).

### 6.1 Les palettiers des sites (construits)

| Site | Allées | Travées | Niveaux | Plaques (N1 / N2 / N3 / N4…) |
|---|---|---|---|---|
| Onnaing | A, B, C (côtés 1 et 2) | 4 | 4 | 3 000 / 1 400 / 1 200 / 1 000 kg |
| Belleville | A, B (côtés 1 et 2) | 4 | 5 | 3 000 / 1 500 / 1 300 / 1 100 / 900 kg |

Produits : ceux du §6.2 d'ENT-8.11 (désignations génériques). Contrôles d'équité : comme ENT-8.11 §6.3 et ENT-8.13 §6.1 (P4 dépasse toujours ; P5 a
une adresse libre déclarée ; aucune autre ne dépasse).

## 6 bis. Tirage

Socle tiré par élève (site, adresses, produits, l'écart et son sens) ; ni bonus ni niveau. Deux voisins n'ont presque jamais le même jeu (200
graines : site, adresse de P4, sens de l'écart variés).

## 7. Demandes au moteur

**Chantier `MOTEUR-palettier-adresse-donnee.md`, lot 6** (copie, `rendCopie: false`, un plan par site). À vérifier : une rubrique `ecodroit` dans
l'ouverture ; la fiche calculée sur les écarts confirmés ; le signalement en copie sans nouvelle adresse.

### 7 bis. Séance déjà jouée ? Non.

## 8. Tests attendus

Bloc `action-814` (alerte 7). Deux témoins (Onnaing, Belleville) 20/20 à la remise, égal à `noter(db)` ; inaction 0 ; **aucun verdict dans le DOM**
avant la remise ; le nombre du système absent avant la fiche ; P5 posée à côté sans scan → `adresseLibre` ✗ et `scan-P5` ✗ ; P4 confiée là → ✗ ;
signaler P1 à tort → `signale` ✗ ailleurs inchangé ; somme 20. Sabotages : fiche jugée sur les écarts réels → le cas « une erreur ne se paie qu'une
fois » tombe ; même plan pour les deux sites → le test des deux plans tombe.

## 9. Supports

Pas de trame. Fiche enseignant d'une page (Cowork, après livraison) : ce que mesure chaque bloc, les deux sites, comment lire la note par
sous-compétence.

## 10. Critères de validation par Tristan

- Un élève qui a fait 8.11 à 8.13 s'y retrouve sans aide sur un plan inconnu.
- 50 minutes suffisent (sinon : 4 palettes au lieu de 5, en retirant P2 ; dire quel jalon perd du poids).

## 11. Questions ouvertes et décisions de Cowork

1. **Proposé par Cowork** : en évaluation, le terminal **propose toujours** « Recompter ou confirmer ? » (c'est l'outil, pas une aide) ; aucun jalon de
   recomptage. Autre option : `recompte: 'jamais'` (l'élève doit penser seul à recompter). À trancher par Tristan.
2. **Proposé par Cowork** : les deux palettiers (§6.1), la date, les poids à l'intérieur des blocs.
3. **Proposé par Cowork** : les questions d'ouverture réécrites (§4 ter).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** (et pourquoi) :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
