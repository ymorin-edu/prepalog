# Brief de séance — ENT-12.2 IKEA, la demande de Mme Benali (2de, poste B — transport, guidage)

**Statut** : à implémenter (aucune vue nouvelle, une vérification au moteur §7)
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé par Tristan le 26/10
**Modèle** : Sonnet

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-12.2 |
| `id` | `ikea-demande-cliente` |
| Titre / desc | « IKEA — la demande de Mme Benali » / « Agent(e) du service livraison au centre de Gennevilliers : appeler une cliente pour préparer sa livraison, puis choisir le bon mode de livraison pour chaque article et dire ce qu'elle paiera. » |
| Niveau(x) | `['2de']` |
| Compétence(s) | **OTM-C1.1** (prendre en compte la demande du client), **OTM-C1.2** (choisir les modalités de l'opération de transport) ; D1 |
| Temps pédagogique | guidage (premier temps de travail ; évaluation en 12.7) |
| Notation | jalons pondérés, `bareme: 20` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** (page « Livraison » d'IKEA, relevée le 26/10/2026 ; CGV du 10/08/2026) :
  - Point Relais : 7 € (2 € membre IKEA Family), article de moins de 19 kg et 115 cm au plus par côté, commande de moins de 20 kg ;
  - colis à domicile : 14 € (9 €), moins de 60 kg, sous 3 jours ouvrables ;
  - **devant chez vous** (au pied de l'immeuble, le client monte lui-même) : 60 € jusqu'à 500 €, 80 € de 500 à 1 000 € ; réservé
    aux commandes de moins de 1 000 € (art. 4.1.2.1) ;
  - **dans la pièce de votre choix** : 80 € jusqu'à 500 €, 100 € jusqu'à 1 000 €, 150 € jusqu'à 2 500 €… (non-membre) ;
  - **livraison fluviale** déclenchée d'office pour Paris intra-muros (sauf plans de travail de plus de 3 m) ;
  - IKEA s'engage sur **la date et le créneau choisis** (art. 4.1.2) ; produit qui ne passe pas (escalier, ascenseur) : reprise ou
    livraison par la fenêtre **aux frais du client** ;
  - **reprise de l'ancien meuble** sans frais : même nature, volumineux (largeur + longueur + hauteur > 2 m), démonté, à la
    livraison, pas en express (art. 14.2.2).
- **Construit** : Mme Benali, son adresse, ses articles (poids, cartons, prix plausibles), le prénom de la responsable (Claire),
  le fait que le service livraison du CDC rappelle la cliente (pratique plausible, **non vérifiée**).
- Prix **figés à la date du 26/10/2026** dans le contenu ; le document joint le dit.

## 3. Objectif pédagogique

L'élève sait **recueillir une demande de livraison** (accès, étage, ascenseur, créneau, reprise) sans rien oublier ni promettre
de faux, puis **choisir un mode de transport** en appliquant des règles écrites (poids, dimensions, montant, adresse) et en dire
le prix. Suite de 12.1 (les deux chemins) ; prépare 12.3 (tenir le créneau) et l'évaluation 12.7.

## 4. Déroulé (≈ 50 min)

**Mardi 9 mars 2027, 9 h**, service livraison du CDC de Gennevilliers.

1. **Avant de commencer** (non noté) : banque §4 ter.
2. **L'appel** (vue `dialogue`, écran Téléphone, mode guidage : une réplique maladroite fait réagir Mme Benali, l'élève
   recommence) : se présenter ; vérifier le numéro de commande ; demander l'étage, l'ascenseur, la largeur de l'escalier ; le
   créneau ; proposer la reprise de l'ancien canapé et en vérifier les conditions (démonté, plus de 2 m en tout). Piège : elle
   demande « vous me le montez, hein ? » alors que le mode choisi en ligne est « devant chez vous ».
3. **La fiche « mode de livraison »** (fiche à remplir) : une ligne par article (lampe, armoire en 3 colis, canapé en 2 colis) :
   mode choisi (liste), poids, raison (liste) ; puis le prix total de la livraison, membre ou non.
4. **Le message à Mme Benali** (phrases à choisir) : date, créneau, mode, prix, reprise, rappel « prévenir 72 h avant si absente ».
5. Bilan.

## 4 bis. Questions au fil — propositions

| Geste | Qui pose | Question proposée | Type | Notée / réflexion | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|
| Étage demandé dans l'appel | Claire | « Pourquoi l'étage compte-t-il pour le transport ? » (deux livreurs et du temps en plus / le prix du meuble / rien) | fil | notée | tout de suite | sens de la question posée |
| Mode de l'armoire choisi | Claire | « Ton armoire pèse X kg (tirés). Pourquoi pas le Point Relais ? » (plus de 19 kg par article / trop chère / trop loin) | fil | notée | au bilan | ancrée sur la pièce, éclairerait le jalon d'avant sinon |
| ★ Reprise de l'ancien canapé | Claire | « Mme Benali veut aussi faire reprendre une vieille chaise. IKEA doit-il la reprendre ? » (non : une chaise n'est pas un canapé, et il ne reprend qu'un meuble pour un meuble vendu, texte cliqué / oui, tout / oui si elle paie) | point d'étape | notée | tout de suite | **éco-droit appliqué** : L541-10-8 et CGV 14.2.2 |
| Prix calculé | Claire | « Mme Benali devient membre IKEA Family. Combien économise-t-elle sur sa livraison ? » | fil | notée | au bilan | calcul simple sur la grille |
| Message envoyé | Claire | « Elle est absente le jour J. Jusqu'à quand peut-elle prévenir ? » (72 h avant / la veille / le jour même) | fil | réflexion | — | CGV 4.1.2.3 |

## 4 ter. Avant de commencer (non noté ; ★ = reprise en 12.7)

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| reformuler | préparation | Au téléphone, reformuler la demande du client sert à… | vérifier qu'on a bien compris | gagner du temps ; le faire attendre | — | ★ |
| acces | préparation | Pour livrer une armoire au 4e, il faut savoir… | s'il y a un ascenseur et si l'escalier est assez large | la couleur de la porte ; l'âge du client | — | ★ |
| poids | préparation | Une commande de 3 colis de 40, 38 et 34 kg pèse… | 112 kg (valeurs tirées) | 40 kg ; 3 kg | — | ★ |
| creneau | préparation | Un créneau de livraison, c'est… | une plage horaire où le client attend le livreur | le prix ; le nom du livreur | — | |
| promesse | éco-droit | IKEA s'est engagé sur la date et le créneau. Le livreur arrive 3 h plus tard sans prévenir : IKEA… | n'a pas tenu son engagement (art. 4.1.2) | n'a rien promis ; peut venir quand il veut | extrait des CGV | ★ |
| fenetre | éco-droit | L'armoire ne passe pas dans l'escalier. Qui paie la livraison par la fenêtre ? | la cliente (art. 4.1.2) | IKEA ; le livreur | extrait des CGV | |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| 1 | Appel : étage, ascenseur et escalier demandés | écoute | 3 |
| 2 | Appel : créneau fixé et reprise proposée avec ses conditions | écoute | 2 |
| 3 | Appel : rien de faux promis (pas « on vous le monte » en « devant chez vous ») | écoute | 2 |
| 4 | Mode juste par article (un jalon par article) | mode | 6 |
| 5 | Prix juste | mode | 2 |
| 6 | Message : date, créneau, mode, prix justes | message | 1 |
| 7 | Ton de l'appel et du message | forme | 1 |
| — | Questions au fil | questions | 3 |

Forme : 1 sur 20 (règle des 15 %). Le jalon 3 n'accuse que si l'élève a choisi la réplique fausse (pas d'inaction récompensée :
un appel non terminé rend les jalons 1 à 3 faux).

## 6 bis. Tirage

Pièce fixe : Mme Benali. Valeurs tirées : poids des colis de l'armoire (35 à 45 kg chacun), prix des articles (le total change de
tranche de prix d'un élève à l'autre, contrôle d'équité : toujours une tranche juste et une voisine plausible), membre ou non.
Confirmé (bonus caché) : 2 commandes de plus parmi 4 (un client à Nanterre hors fluvial ; un plan de travail de 3,20 m exclu de
la péniche ; une commande de 1 200 € qui ne peut pas être « devant chez vous » ; un matelas seul en colis à domicile).

## 7. Demandes au moteur

À vérifier en écrivant (pas de demande a priori) : la **fiche à remplir** (`MOTEUR-documents-formulaire.md`, lot 2) accepte-t-elle
une ligne par article avec deux listes et une case ? Sinon, une fiche par article. Le `dialogue` en guidage existe (Pelleau, 8.x).

## 8. Tests attendus

Bloc `outils/test/ikea-12.2.mjs`. Cas : parcours juste (20/20) ; « on vous le monte » choisi = jalon 3 faux seulement ; armoire en
Point Relais = jalon 4 faux pour l'armoire seulement ; prix d'une mauvaise tranche ; appel abandonné ; sabotage de la règle des
19 kg dans le contenu qui doit faire tomber un cas.

## 10. Critères de validation par Tristan

Jouer l'appel (y compris les répliques maladroites et ce que répond Mme Benali), remplir la fiche, envoyer le message.

## 11. Questions ouvertes (réponse par défaut entre parenthèses)

- [ ] Montrer à l'élève les deux prix (membre et non-membre) ou un seul ? (les deux : c'est le réel, et la question au fil s'en sert)
- [ ] Tarif « dans la pièce » : appliqué au montant des seuls articles livrés ainsi, ou à toute la commande ? La page ne le dit pas
  (au montant de toute la commande hors lampe, simplification dite dans le document joint).
