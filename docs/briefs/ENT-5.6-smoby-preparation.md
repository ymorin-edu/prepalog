# Brief de séance — ENT-5.6 Smoby, préparer la palette mixte de la commande de Noël (2de, poste C — cariste, guidage)

> **Nouvelle séance (Tristan, 04/10/2026 au soir)** : elle s'insère **après le rangement (ENT-5.5) et avant les séances K+N**,
> qui deviennent ENT-5.7 (enlèvements) et ENT-5.8 (lettre de voiture). Cowork a déposé les briefs renumérotés
> (`ENT-5.7-smoby-enlevements.md`, `ENT-5.8-smoby-lettre-voiture.md`) ; **Claude Code supprime les deux anciens fichiers**
> (`ENT-5.6-smoby-enlevements.md`, `ENT-5.7-smoby-lettre-voiture.md`, `git rm`). Tant que ce n'est pas fait, il existe deux
> fichiers `ENT-5.6-*` : **celui-ci est le bon ENT-5.6**.

> **📋 Phrase à copier-coller dans ccode :**
>
> ```
> Lis docs/briefs/COORDINATION-smoby.md puis implémente le brief docs/briefs/ENT-5.6-smoby-preparation.md (il faut que la vue « Plan d'entrepôt » et son mode préparation soient livrés — MOTEUR-vue-plan-entrepot.md, lot 4 —, ainsi que le lot 7 de MOTEUR-2de-S1). Annonce la durée avant de commencer et dis-moi si un point du brief contredit le code.
> ```

**Statut** : **livré** (05/10/2026), validé à l'écran par Tristan le 06/10/2026 (tracé du parcours qui avance avec la préparation, ajouté ce jour) (`pret: true, ouverture: 'prof'`)
**Date du brief** : 04/10/2026 (soir)
**Conversation d'origine** : Cowork (Opus) ; décisions de Tristan du 04/10 au soir (questions posées une à une) ; maquette
`docs/briefs/plan-entrepot/maquette-plan-entrepot-v2.html`, **cas ③ Préparation**, et ses données figées
`docs/briefs/plan-entrepot/donnees-maquette.json` (`preparation`).
**Modèle** : **Sonnet** suffit une fois la vue livrée (la séance déclare surtout les données de la maquette).

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-5.6 |
| `id` | `smoby-preparation` |
| Titre / desc | « Smoby — la palette de la commande de Noël » / « Cariste à la plateforme Smoby : préparer la palette mixte qui complète l'enlèvement E1 de la commande de Noël — prélever au picking, réapprovisionner depuis la réserve, monter une palette stable, filmer et étiqueter. » |
| Rubrique | simulog, entreprise n° 5 Smoby |
| Niveau(x) | 2de |
| Compétence(s) | **C2.1** seule (« Répondre à la demande des clients internes et/ou externes ») ; domaine D4 — décision de Tristan, 04/10 |
| Temps pédagogique | guidage ; `coeur: true` |
| Notation | jalons + note sur 20 |
| Barème | **9** |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** : plateforme de stockage logistique de **Smoby à Moirans-en-Montagne** (`COORDINATION-smoby.md`) ; gammes
  réelles des produits (maisons, établis, cuisines, porteurs, trotteurs, tricycles).
- **Construit** : le plan, le stock, le picking et la réserve, la commande **BP-1210-JDR** pour **Jouets du Rhône (fictif)**,
  Corbas ; références, poids et cartons des produits ; Bruno ; les règles de montage (classes lourd / normal / fragile,
  « jamais une classe plus lourde sur une plus fragile », recalées sur des sources le 04/10 : voir
  `MOTEUR-vue-plan-entrepot.md` §6.2) ; la hauteur et le poids maximaux du transporteur.
- **Flux construit et annoncé** : l'enlèvement E1 par Kuehne+Nagel (33 palettes : **32 palettes complètes déjà prêtes + la
  palette mixte de Yanis**).

## 3. Objectif pédagogique

L'élève sait **préparer une commande au colis complet** : lire un bon de préparation, prélever chaque ligne à son adresse
dans l'ordre du parcours, **réapprovisionner** un emplacement de picking en rupture depuis la réserve, **monter une palette
stable** (lourds en bas, fragiles en haut, poids et hauteur du transporteur), la filmer et l'étiqueter. Suit le rangement
(ENT-5.5 : l'adresse et le plan sont connus) ; précède ENT-5.7 (K+N planifie l'enlèvement de la commande prête). Prépare
C2.2 (optimiser le parcours), travaillée plus tard (évaluation du mode, 1re).

## 4. Déroulé

**Mercredi 9 décembre 2026, vers 17 h 30**, après le rangement. Vue Plan d'entrepôt, **mode préparation, temps « guidage »**
(`MOTEUR-vue-plan-entrepot.md` §5.3 et §8), une entrée de menu « Préparer la commande ».

Accueil — message de **Bruno, chef de quai** (texte proposé, à relire par Tristan) : « Dernière mission de la journée,
Yanis : la palette de complément de la commande de Noël pour Jouets du Rhône. Les 32 palettes complètes sont prêtes ; il
manque celle-ci, avec six produits différents. Elle part **demain à 6 h** avec les autres, enlèvement E1 par
Kuehne+Nagel, quai n° 1. Suis le parcours, prélève au picking, et monte-la proprement : lourds en bas, fragiles en haut. »

1. **Le bon de préparation** (cartes du bandeau, **dans l'ordre du serpentin**) : n°, adresse, désignation, étiquettes
   LOURD / FRAGILE, commandé, prélevé. Le **parcours en serpentin** est imposé, dessiné, avec les **numéros des lignes sur
   les travées** ; « N1 = picking · N2-N3 = réserve » dans la colonne de côté ; compteur de mètres.
2. **Prélever** chaque ligne au niveau N1 (fiche de prélèvement, aide « reste à prélever »). Prélever en réserve (N2-N3) :
   refusé (« palette de réserve : on prélève au niveau N1 »).
3. **La rupture** (ligne 5, Trotteur : **2 cartons au picking, 6 commandés, minimum 6**) : « ↻ Descente de la réserve »,
   puis clic sur la bonne palette de réserve **au-dessus** (même référence) ; Yanis, cariste CACES 5, la descend. Piège :
   la palette juste au-dessus en `B1-T01-N2-E1` est un **Porteur** (refusé). Aide de guidage : la rupture expliquée sur la
   fiche.
4. **La palette de commande** se monte dans l'ordre du prélèvement (vue de face, couches, trait « 1,80 m max ») ;
   « ↶ Reposer le dernier » pour corriger.
5. **Terminer la préparation** → **film étirable** (1 à 6 tours) et **étiquettes d'expédition** (avant, arrière, gauche, droite,
   dessus) → « Vérifier ma préparation » → bilan de guidage, **ligne par ligne et règle par règle, expliqué** ; « Reprendre
   la préparation » pour corriger.
6. **Fin** — message fixe de Bruno (texte proposé) : « Parfait. Je la mets en zone d'expédition avec les 32 autres. Demain
   6 h, Kuehne+Nagel charge le tout. Bonne soirée, Yanis. » **Aucun message à rédiger** (décision de Tristan : l'heure est
   pleine).

## 5. Jalons / notation (9)

| # | Jalon | Ce qu'il lit | Piège à éviter |
|---|---|---|---|
| 1 | Lignes prélevées justes | les 6 lignes en quantité juste, aucune ligne hors commande | rien prélevé = faux |
| 2 | Réapprovisionnement depuis la bonne référence | la ligne en rupture réapprovisionnée par une palette Trotteur de réserve | rupture non traitée = faux |
| 3 | Lourds en bas | aucun carton lourd prélevé après un non-lourd | **jugé seulement si le jalon 1 est vrai** |
| 4 | Fragiles en haut | rien prélevé après un fragile | idem |
| 5 | Poids | palette (support compris) ≤ 800 kg | idem |
| 6 | Hauteur | support + couches ≤ 1,80 m | idem |
| 7 | Film | 3 à 5 tours | idem |
| 8 | Étiquettes | exactement 2 côtés opposés + dessus | idem |
| 9 | Parcours | mètres ≤ meilleur tour en serpentin (47 m, **sans marge**) | **seulement si le jalon 1 est vrai** (écart à la garde du brief moteur, voir §7) |

Une palette vide ou incomplète respecte « lourds en bas », « fragiles en haut », poids et hauteur, et un tour d'une seule
ligne fait peu de mètres : **les jalons 3 à 9 ne comptent que si toutes les lignes sont justes** (aucun jalon par inaction).
Indicateurs de repérage (lot 6, livré) : premier coup, temps, essais de prélèvement en réserve, nombre de tours.

## 6. Contenu

`contenus/smoby-ent56-preparation.js` : déclaration `entrepot` en **mode préparation**. **Plan, stock, produits, cartons,
picking : ceux de `donnees-maquette.json`** (source commune Smoby si ENT-5.5 en a créé une ; état cloisonné). Valeurs
**recalculées par le moteur**, jamais recopiées ; **dans les tests, écrites à la main** (ci-dessous).

- **Commande** : `BP-1210-JDR`, client **Jouets du Rhône (fictif)**, Corbas ; enlèvement **E1**, **Kuehne+Nagel**, **jeudi
  10 décembre, 6 h 00**, quai n° 1 (⚠ la maquette affiche « 14 h » : **corrigé**, décision de Tristan). Transporteur : hauteur
  max **1,80 m**, poids max **800 kg** ; support 0,15 m, 25 kg.
- **Lignes, dans l'ordre du serpentin** (guidage : liste triée) : ① `A1-T01-N1-E1` Maison Neo Jura Lodge × 2 (lourd) ·
  ② `A1-T02-N1-E1` Établi Black+Decker × 6 · ③ `B1-T02-N1-E3` Tricycle Be Fun × 4 · ④ `B1-T01-N1-E2` Porteur Little Smoby × 6
  · ⑤ `B1-T01-N1-E1` Trotteur Cotoons × 6 (**rupture** : 2 au picking, min 6 ; réserve juste en `B1-T01-N2-E2` ou
  `B1-T01-N3-E1/E2/E3`) · ⑥ `B2-T01-N1-E1` Cuisine Tefal × 8 (fragile, en dernier).
- **Attendus de la maquette** (à recontrôler contre le moteur) : serpentin dans l'ordre **47 m** ; palette conforme 6/6 ;
  **331 kg** (100 + 48 + 48 + 30 + 36 + 44 de cartons + 25 de support) ; **1,74 m** (0,15 + 0,45 + 0,25 + 0,25 + 0,22 + 0,22 + 0,20).
- **Lexique** (mots cliquables, lot 3 livré) : picking, réserve, réapprovisionnement, bon de préparation, palette mixte,
  film étirable, étiquette d'expédition, serpentin.
- **Personnage** : Bruno, chef de quai · « mercredi 9 décembre, 17 h 30 ».

## 7. Demandes au moteur

Tout est dans **`MOTEUR-vue-plan-entrepot.md`** (mode préparation, lot 4). Un seul point à signaler au chantier :

- **Garde du jalon `parcours`** : le brief moteur propose « au moins une ligne prélevée ». Ici, **seulement si toutes les
  lignes sont justes** (sinon un tour d'une ligne récompense un travail inachevé). Le moteur doit permettre à la séance de
  déclarer cette condition (comme pour les critères de la palette).
- `MOTEUR-2de-S1` : lots 1, 3, 6 livrés ; **lot 7** (Smoby n° 5 dans `activites/index.js`) à faire avec la première séance
  Smoby.

## 8. Tests attendus

Bloc `smoby` (la séance ; les mécaniques sont testées dans le bloc `entrepot`) : parcours juste dans l'ordre → **9 / 9**,
47 m, 331 kg, 1,74 m ; **inaction 0 / 9** ; **palette vide terminée → 0 / 9** ; une seule ligne prélevée puis « Terminer » →
jalon 9 **faux** ; Cuisine prise avant Porteur et Trotteur → « fragiles en haut » faux, mètres inchangés ; prélever en
réserve → refusé ; réappro par le Porteur `B1-T01-N2-E1` → refusé ; réappro avec un picking au-dessus du minimum → refusé ;
film 2 tours → jalon 7 faux ; étiquettes sur deux côtés voisins → jalon 8 faux ; heure d'enlèvement affichée « jeudi 10
décembre, 6 h 00 ».

## 9. Supports

Trame courte (le bon de préparation, l'ordre du parcours, les règles de la palette, une question sur la rupture) : Cowork,
**après validation à l'écran**.

## 10. Critères de validation par Tristan

À l'écran (1366 × 768) : la préparation se joue comme le cas ③ de la maquette v2 en guidage ; la rupture se règle par la
descente de la réserve ; le bilan explique chaque ligne et chaque règle ; la commande part bien jeudi à 6 h avec E1.

## 11. Questions ouvertes (valeur par défaut)

- [x] Place dans S1 : **après le rangement, avant K+N** (Tristan, 04/10 soir).
- [x] Ce qu'on prépare : **la palette mixte d'E1** (32 complètes + 1 mixte = 33 palettes) (Tristan).
- [x] Moment : **mercredi 9/12 vers 17 h 30**, départ jeudi 6 h (Tristan).
- [x] Poids d'E1 recalculé : **6 091 kg** (Tristan) — reporté dans `ENT-5.8-smoby-lettre-voiture.md`.
- [x] Rupture et réappro gardés (Tristan) ; **C2.1 seule** ; **9 jalons groupés** ; **pas de compte rendu** à Bruno.
- [ ] Textes de Bruno (accueil, fin) : proposés par Cowork, à relire à l'écran.
- [ ] Quai de l'enlèvement E1 : **quai n° 1** (construit ; la maquette affiche « QUAI 1 · E1 »).

---

## Compte rendu *(rempli par Claude Code à la livraison)*

- **Fichiers créés / modifiés** : `activites/smoby-preparation.js` (nouveau), `contenus/smoby-ent56.js` (nouveau : vue,
  règles, messages, lexique, accueil, jalons), `contenus/corriges/ENT-5.6.js` (nouveau, calculé),
  `contenus/smoby-entrepot.js` (la commande E1 et le picking y passent, source commune), `contenus/entrepot-essai.js` (les
  reprend de là au lieu de les déclarer), `activites/index.js` (une ligne), `outils/test/smoby.mjs` (6 cas ENT-5.6),
  `outils/test/socle.mjs` (liste des séances Simulog allongée d'ENT-5.6).
- **Écarts par rapport au brief** : le contenu s'appelle `contenus/smoby-ent56.js` (comme `smoby-ent51/54/55.js`) et non
  `smoby-ent56-preparation.js`. Le cas « palette vide terminée » ne se joue pas à l'écran (le bouton « Terminer » est
  inactif sur une palette vide) : le test pose l'état à la main. Les refus (réserve, réappro par le Porteur, picking
  au-dessus du minimum) ne sont pas re-testés dans le bloc `smoby` : ils le sont dans le bloc `entrepot`, sur les mêmes
  données (même commande, même stock).
- **Décisions prises en route** : le message de fin de Bruno arrive quand la préparation est **terminée, vérifiée et juste
  sur les jalons 1 à 8** (lignes et palette) ; le parcours n'y entre pas, un détour ne se rattrapant pas en reprenant la
  préparation. Accueil en quatre étapes (lire, prélever, rupture, terminer) ; aucun KPI autre que la messagerie.
- **Tests** : bloc `smoby` (déclaration et registre ; attendus 47 m / 331 kg / 1,74 m et réserve du Trotteur, corrigé ;
  ouverture : message de Bruno, 0 / 9, menu, heure jeudi 6 h 00, bon trié, mots cliquables ; parcours juste à l'écran →
  9 / 9 remonté au suivi + message de fin ; palette vide et une seule ligne → 0 / 9 ; pièges Cuisine avant Porteur et
  Trotteur, film 2 tours, étiquettes voisines → un jalon faux chacun, 47 m inchangés, pas de message de fin). Suite entière.
- **Commits** : voir `git log` (« ENT-5.6 : … »).
- **Reste ouvert** : textes de Bruno (accueil, fin) à relire à l'écran ; quai n° 1 (construit) ; trame courte (Cowork,
  après validation à l'écran) ; fiche d'intention à recaler (ENT-5.6 n'y est plus provisoire).

- **Notation pondérée sur 20 (10/10/2026, lot 3 de `NOTATION-ponderation.md`)** : `bareme: 20` (le barème « 9 » ci-dessus est remplacé), tableau `BAREME` de `contenus/smoby-ent56.js` : lignes prélevées 4, réapprovisionnement 3, lourds 2, fragiles 2, poids 2, hauteur 1,5, film 1, étiquettes 1,5, parcours 3. Poids validés par Tristan. Cas de test réécrits : déclaration, parcours juste 20/20, trois pièges avec leurs points perdus.
