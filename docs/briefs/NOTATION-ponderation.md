# Brief — Notation pondérée sur 20 dans toutes les séances d'entreprise (règle générale)

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/NOTATION-ponderation.md. Fais le lot 1 (ENT-6.2) en entier, puis arrête-toi et dis-moi où on en est. Annonce la durée avant de commencer.
> ```

**Statut** : à implémenter *(à implémenter → en cours → à valider par Tristan → livré | abandonné)*
**Date du brief** : 10/10/2026
**Conversation d'origine** : Claude (session cloud, sans accès Git) ; décisions de Tristan du 10/10/2026, 9 h 15.
**Modèle** : Sonnet (correctifs, contenus, tests). Rien de nouveau dans le moteur, sauf si le point 0.3 l'exige.

## 0. La règle (décision de Tristan, 10/10/2026)

**Toute séance d'entreprise (ENT-x.y) est notée par jalons pondérés, total 20** : `bareme: 20`, un `poids` sur chaque
jalon du socle, les jalons regroupés par bloc (`groupe`), comme ENT-5.1 et ENT-6.1. Plus de « un jalon = un point », plus de
`notation: 'avancement'`. Origine : la décision du 07/10/2026 (retours de classe sur ENT-5.1, « poids par bloc ») était prévue
« d'abord 5.1/5.2, puis générale », mais n'avait été écrite que pour Smoby ; les briefs 6.2 à 6.10 (écrits le 05/10) sont
restés à un point par jalon.

0.1. **Comment répartir** : le poids va au cœur de la compétence travaillée (le piège de la séance, la décision métier) ; la
forme (ton, politesse, présentation) ne dépasse pas ~15 % ; aucun jalon à 0. **Les poids de chaque séance sont validés par
Tristan avant d'être codés** : présenter un tableau (bloc, jalons, points) et attendre son accord.

0.2. **Hors règle** : quiz (QUI), tableur (TAB), DEC-1, SCE (ancien, ne pas enrichir), ACT-1. Jalons bonus du confirmé
inchangés (D-C, lot 3 : +0,5, plafond +2, hors pondération).

0.3. **Les élèves qui ont fini une séance gardent leur note** (règle de Tristan). **À vérifier avant tout lot qui touche une
séance déjà jouée** : la note du Suivi est-elle rangée une fois (`bilan1`, `meilleur`) ou recalculée à chaque lecture avec
les poids du moment ? Si elle est recalculée, changer les poids changerait les notes déjà acquises : s'arrêter, le dire à
Tristan, et proposer le correctif moteur (figer la note acquise) **avant** de repondérer. Ne concerne pas ENT-6.2 (encore
fermée aux élèves).

0.4. **À écrire dans `CLAUDE.md`** (section « Activités ») en une ligne, et dans `activites/FICHE-SEANCE.md` (ligne
`notation` / `bareme`) : la règle 0 et 0.1. Ligne dans `docs/decisions.md`.

## Lot 1 — ENT-6.2 (France Boissons, la commande de La Cabane à Malo) — à faire maintenant

Séance livrée le 10/10 en `pret: true, ouverture: 'prof'`, **jamais ouverte aux élèves** : aucune note à protéger.
Fichiers : `contenus/france-boissons-ent62.js`, `activites/france-boissons-commande.js`, `outils/test/france-boissons.mjs`,
`contenus/corriges/ENT-6.2.js` si besoin, brief `ENT-6.2-france-boissons-commande.md` (compte rendu, § « Barème »).

### 1.1 Pondération (validée par Tristan le 10/10/2026)

| Bloc (ligne du bandeau) | Jalons | Points |
|---|---|---|
| Le bon de commande : les fûts (piège en chaîne) | `heineken30` 1 · `affligem` 2 · `remplacement` 3 | 6 |
| Le bon de commande : le jour de livraison | `jour` | 2 |
| Le bon de commande : l'eau et les vides | `eau-vides` | 2 |
| La réponse à Malo : la rupture | `msg-rupture` | 4 |
| La réponse à Malo : la livraison | `msg-livraison` | 3 |
| La réponse à Malo : le ton | `msg-ton` | 3 |
| **Total** | | **20** |

`bareme: 20` dans l'activité. Les tests qui lisent « 8/8 », « 7/8 », « 5/8 », « 7,5/8 » sont à réécrire en points
(**réécriture de cas existants : le dire à Tristan**) ; valeurs écrites à la main, par exemple : piège Affligem 4 → 18/20 ;
réponse jamais envoyée → 10/20 ; « Corriger » après le piège Affligem → moyenne (18 + 20) / 2 = 19/20.

### 1.2 La réponse de Malo reprend ce que l'élève lui a écrit (décision de Tristan)

Constat de Tristan à l'écran : il a coché **samedi** dans le bon, Malo a répondu « Ok pour la Pelforth, **à vendredi** ! ».
Le déclencheur `reponse-malo` envoie un texte fixe : Malo contredit l'élève et lui souffle la bonne réponse.

À la place, Malo s'appuie sur **le dernier envoi** de la réponse par phrases (lignes `rupture` et `livraison`), sans jamais
dire si c'est juste — c'est le bandeau de fin qui corrige :

| Phrase choisie (ligne) | Début de la réponse de Malo |
|---|---|
| rupture : Pelforth à la place | « Ok pour la Pelforth, … » |
| rupture : Edelweiss à la place | « Ok pour l'Edelweiss, … » |
| rupture : « je retire la ligne » | « Dommage pour l'Affligem, … » |
| rupture : « je vous livre bien 4 fûts d'Affligem » | « Super pour les 4 Affligem, … » |
| livraison : vendredi / samedi / lundi | « … à vendredi ! » / « … à samedi ! » / « … à lundi ! » |

Textes construits depuis les données (comme le reste du fichier), jamais recopiés. La suite du scénario (ENT-6.7 et après)
repart toujours sur la commande juste : rien d'autre ne change. L'accusé de « Corriger » (« Bien reçu, merci ! ») reste tel quel.
Tests : un cas par variante, plus le sabotage (texte fixe remis → au moins un cas tombe).

### 1.3 Les mails portent la date du scénario

Constat : le mail de Malo affiche « 10/10/2026 08:43 » (`ts: Date.now()`). Il faut le **mardi 15 juin 2027** : Malo à
**9 h 32** (comme la copie à gauche du bon), Inès vers 9 h 35–9 h 40, puis les messages suivants quelques minutes après
chaque envoi de l'élève, dans l'ordre où ils arrivent. **Avant de changer** : vérifier que la Messagerie, les déclencheurs,
la pastille « nouveau » et le temps passé ne dépendent pas de `Date.now()` (sinon : demande au moteur, ne pas bricoler).
Regarder si **ENT-6.1** a le même défaut (lundi 14 juin 2027) et le corriger de la même façon. Toutes les séances France
Boissons suivront cette règle (à rappeler dans `docs/decisions.md`).

### 1.4 Livraison du lot 1

Bloc `france-boissons`, puis suite complète ; commit(s) par nom, push. Compte rendu ici (§ Compte rendu) et dans le brief
ENT-6.2. Dire à Tristan : séance à réessayer à l'écran (samedi coché → Malo dit « à samedi » ; note sur 20 dans le Suivi).

## Lot 2 — briefs ENT-6.3 à 6.10 (avant leur construction)

Pour Cowork : remplacer la ligne « Barème » de chaque brief par un tableau de poids sur 20 (règle 0.1), validé par Tristan.
Claude Code ne construit aucune de ces séances tant que son tableau n'est pas validé. Barèmes actuels (un point par jalon) :
6.3 = 16, 6.4 = 10, 6.5 = 10, 6.6 = 10, 6.7 = 10, 6.8 = 13, 6.9 = 12, 6.10 = 12.

## Lot 3 — séances construites à un point par jalon

Picard **ENT-4.2**, **ENT-4.3** ; Smoby **ENT-5.5**, **ENT-5.6** ; Cdiscount **ENT-2.5** (évaluation). Pour chacune :
point 0.3 d'abord, puis tableau de poids proposé à Tristan, puis code et tests.

## Lot 4 — séances en `notation: 'avancement'`

Spartoo **ENT-1.1** ; Cdiscount **ENT-2.1, 2.2, 2.3, 2.4, 2.6** ; Boost **ENT-3.1** (ouverte aux élèves). Passage à une
vraie note pondérée sur 20 (décision de Tristan du 10/10/2026). Point 0.3 obligatoire. Spartoo **ENT-1.2 et ENT-1.3 sont
gelées** (bugs seulement) : leur pondération se fera **dans leur refonte**, pas avant.

## Déjà conformes (rien à faire)

Spartoo 1.1 a déjà des `poids` mais reste en `avancement` (lot 4) ; conformes : Boost 3.2, 3.3 · Picard 4.1, 4.4 ·
Smoby 5.1, 5.2, 5.3, 5.4, 5.7, 5.8 · France Boissons 6.1 (relevé du 10/10/2026 sur `main`, à revérifier).

---

## Compte rendu *(rempli par Claude Code, lot par lot)*

-
- **Lot 1 (ENT-6.2), 10/10/2026** : fait. (1.1) `bareme: 20` et `poids` sur les 8 jalons (tableau validé du brief), corrigé mis à jour, cas de test réécrits en points (réécriture de cas existants du bloc `france-boissons`) + un cas Heineken 30 L ; éprouvé par deux sabotages. (1.2) et (1.3) étaient déjà livrés dans le commit `0408272` (Malo reprend la réponse de l'élève, mails datés du scénario, ENT-6.1 corrigée aussi). (0.4) règle écrite dans `CLAUDE.md`, `activites/FICHE-SEANCE.md`, `docs/decisions.md`. Point 0.3 sans objet (ENT-6.2 jamais ouverte aux élèves). Lots 2 à 4 : à faire.
