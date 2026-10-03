# Brief de séance — ENT-4.1 Picard, le premier camion (guidage)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-picard.md puis implémente le brief docs/briefs/ENT-4.1-picard-premier-camion.md (la vue quai doit être livrée). Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : à implémenter — **après** `MOTEUR-vue-quai.md` (dont c'est la séance pilote)
**Date du brief** : 03/10/2026
**Conversation d'origine** : Cowork (Opus) ; fiches projet `claude/prepalog-picard-cadrage.md`, `claude/prepalog-picard-4-seances.md` ; doc partagé « Picard — vue d'ensemble des 4 séances »

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-4.1 |
| `id` (jamais modifié ensuite) | `picard-ent41` |
| Titre / desc | « Picard — le premier camion » / « Réceptionner un camion de surgelés au quai 32 : lire le ticket de température, faire décharger, contrôler chaque palette, refuser ou émettre des réserves précises, rentrer le lot en chambre froide. » |
| Rubrique | logisim ; **ligne nouvelle dans `ENTREPRISES`** : `{ n: 4, nom: 'Picard', metier: 'Entrepôt de surgelés — Sainghin-en-Mélantois', logo: … }` |
| Entreprise | Picard (réelle, vérifiée : §2) |
| Niveau(x) | 1re (`niveaux: ['1re']`) |
| Compétence(s) | **C1.4** « Traiter les opérations de réception de produits selon les procédures » (référentiel 2025 ; vérifier que `core/competences.js` porte le même libellé) |
| Temps pédagogique | guidage |
| Notation | jalons + note sur 20 (pas de `notation`, comme Boost) |
| Barème | nombre de jalons (18 dans la maquette) |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié (web, 03/10/2026)** : Picard, plus de 1 200 magasins (recrutement.picard.fr) ; entrepôt de
  **Sainghin-en-Mélantois (59)** exploité par **GXO**, stockage −22 à −24,7 °C, 1 500 références, 70 000 palettes/an,
  « aucune marchandise ne peut rentrer sans contrôle de température », camions refusés si température non conforme
  (Voxlog, 2023) ; surgelés à **−18 °C en tout point**, tolérance brève **−15 °C** aux interfaces de chargement /
  déchargement, sans durée chiffrée (directive 89/108/CEE, arrêté du 21/12/2009 ; colddistribution.fr, L'Officiel des
  transporteurs) ; « **sous réserve de déballage** » sans valeur juridique (Transcourrier) ; confirmation des réserves
  au transporteur par lettre recommandée **dans les 3 jours** (art. L133-3 du Code de commerce, **version en vigueur depuis le 10/12/2009, lue sur Légifrance le 03/10/2026**).
- **Construit (annoncé comme tel à l'écran)** : quai 32 et son numéro, fournisseur « Surgelés du Littoral »,
  transporteur « Transports Givrex », chauffeur (silhouette), produits, colisages, lots, températures, durées
  (1 min par palette, 30 s d'ouverture), **repère hors froid de 30 min** pour un **quai réfrigéré à +4 °C** (aucun texte
  ne fixe de durée en minutes), coûts des gestes.
- **Logo** : `docs/briefs/picard/photos/logo-picard.svg` (officiel, accord de Tristan, empreinte dans
  `docs/briefs/picard/LISEZMOI.md`). **Charte** : accent `#0011AC`, logo `#000BF7`, fond glacier (même fichier).
- **Documents reconstitués** : BL, ticket, étiquettes portent « Document pédagogique, reconstitution, non contractuel ».
- **Pas de visage**, pas de salarié réel nommé, pas de parole prêtée à Picard.

## 3. Objectif pédagogique

À la fin, l'élève sait **réceptionner un lot de surgelés** : lire le ticket de l'enregistreur avant d'ouvrir, associer
à chaque aléa le geste qui le révèle (sonder → température, faire le tour → avarie, compter → manquant, lire
l'étiquette → produit différent), décider (accepter / réserves / refuser), **écrire une réserve précise**, et
appliquer la règle **« le froid d'abord, les papiers ensuite »**. Première séance de C1.4 (guidage) ; suivent ENT-4.2
(entraînement, deux camions), ENT-4.3 (erreur induite, enquête sur une réception de nuit), ENT-4.4 (évaluation).

## 4. Déroulé

**Exactement la maquette v8** (`docs/briefs/picard/maquette-quai-picard.html`) en mode guidage : 4 étapes, toutes les
aides, chef de quai, repère P1. Données : celles de la maquette (`PALETTES`, ticket, BL n° SL-26-1184).

| Palette | Produit (réf.) | BL | Réel | Aléa | Attendu |
|---|---|---|---|---|---|
| P1 | Haricots verts extra-fins 1 kg (HVE-1000) | 57 | 57 (4×3×5 − 3 en haut) | aucun (couche du dessus incomplète mais conforme) | Accepter |
| P2 | Croissants pur beurre (CRB-070) | 36 | 36 | 2 cartons écrasés, visibles de l'arrière seulement | Réserves — cartons endommagés (2) |
| P3 | Glaces vanille 1 L (GVA-1000) | 48 | 48 | −14,2 °C à cœur | Refuser — température (−14,2) |
| P4 | Filets de cabillaud 400 g (CAB-400) | 24 | 22 | 2 manquants dont un dans le coin du fond | Réserves — manquant (2) |
| P5 | Épinards hachés 450 g (EPH-450) | 30 | 30 | étiquette EPB-450 (épinards en branches) | Refuser — produit différent (EPB-450) |

Ticket : relevés toutes les 15 min, remontée −16,8 / −12,6 / −12,1 / −13,0 / −17,4 entre 03:45 et 04:45 → réponse
attendue « une remontée qui a duré : je la signale et je sonde chaque palette à cœur ».

## 5. Jalons / notation

Ceux de la vue (brief moteur §5) : ticket · 5 comptages · 5 décisions (sondée) · 4 réserves (P2, P3, P4, P5) · pas de
mention de déballage (réserves écrites) · signature · lot rentré = **18**. Bilan de guidage visible, avec la phrase sur
l'ordre froid/papiers et le « Bon à savoir » L133-3.

**Mesure du temps réel (décision de Tristan)** : en guidage, le temps réel passé est **mesuré, enregistré dans la
base et affiché au bilan, sans note** (« mesuré pour caler les seuils de l'évaluation »). Il doit être **lisible par
l'enseignant** (détail du suivi ou export) : c'est avec ces temps que Tristan fixera les seuils de rapidité d'ENT-4.4
(provisoirement 12 et 16 min).

## 6. Contenu

`contenus/picard.js` (univers commun aux 4 séances : identité, charte `THEME`, lieu, chambre froide, transporteurs) et
`contenus/picard-ent41.js` (le camion, les palettes, `ETAPES`, `ACCUEIL`). Photos et logo copiés depuis
`docs/briefs/picard/`.

## 7. Demandes au moteur

Toutes dans `MOTEUR-vue-quai.md`. Rien dans `core/` depuis ce chantier-ci.

## 8. Tests attendus

Bloc `outils/test/picard.mjs` : parcours juste (18/18), un sabotage par jalon, et la liste du brief moteur §9.

## 9. Supports

- Trame élève : **plus tard**, en Cowork (Word/PDF), une fois la séance validée à l'écran ; ne pas la déclarer avant.
- Corrigé `contenus/corriges/ENT-4.1.js` : oui (tableau des 5 palettes + les 4 réserves écrites attendues).

## 10. Critères de validation par Tristan

La séance se joue comme la maquette v8 en guidage, sous le logo Picard, dans le bloc « Picard » de l'accueil Logisim.

## 11. Questions ouvertes

- [x] Plein écran (`immersif: true`) — tranché le 03/10.
- [x] **Mail d'accueil court du chef de quai** (tranché le 03/10). **Texte validé par Tristan le 03/10/2026, à reprendre tel quel** :
  « Bonjour {prénom}, tu es au quai 32 ce matin. Premier camion à 6 h 00 : Surgelés du Littoral, 5 palettes, transporteur
  Transports Givrex. Lis bien le ticket de température avant de faire ouvrir. Règle de la maison : le froid d'abord, les
  papiers ensuite. Bon courage ! — Le chef de quai » (chef de quai = personnage fictif, sans nom de salarié réel).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** :
- **Écarts par rapport au brief** :
- **Décisions prises en route** :
- **Tests** :
- **Commits** :
- **Reste ouvert** :
