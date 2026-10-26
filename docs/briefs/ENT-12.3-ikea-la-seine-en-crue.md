# Brief de séance — ENT-12.3 IKEA, la Seine est en crue (2de, poste B — transport, entraînement)

**Statut** : à implémenter (aucune vue nouvelle, une vérification au moteur §7)
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé par Tristan le 26/10
**Modèle** : Sonnet

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-12.3 |
| `id` | `ikea-seine-en-crue` |
| Titre / desc | « IKEA — la Seine est en crue » / « La péniche ne peut plus passer dans Paris : replanifier les livraisons du jour en camion, tenir les créneaux promis aux clients, prévenir ceux qu'on ne pourra pas livrer et répondre à une cliente qui veut annuler. » |
| Niveau(x) | `['2de']` |
| Compétence(s) | **OTM-C3.1** (contrôler les engagements contractuels avec le client), **OTM-C1.2** (choisir les modalités) ; D2 |
| Temps pédagogique | entraînement (après 12.2 ; évaluation en 12.7) |
| Notation | jalons pondérés, `bareme: 20` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

- **Vérifié** : la chaîne Gennevilliers → péniche → Bercy → utilitaires électriques (IKEA, HAROPA, déc. 2022 ; 35 caisses mobiles,
  455 commandes par jour visés) ; **à 4,30 m à l'échelle du pont d'Austerlitz, la navigation est interdite entre le pont de
  Grenelle et l'entrée du bassin de l'Arsenal** (document HAROPA « Navigation : règles incontournables », non daté, vers
  2024-2025, règles en révision) : la péniche de Gennevilliers à Bercy traverse ce tronçon ; crues réelles de juin 2016 et
  janvier 2018 ; IKEA s'engage sur la date et le créneau (CGV art. 4.1.2) et prévient le client « dans les plus brefs délais »
  en cas de circonstances exceptionnelles, puis convient d'une nouvelle date (art. 4.4) ; le client peut résilier si le vendeur
  ne livre pas dans un délai supplémentaire raisonnable qu'il lui a accordé (Code de la consommation, **art. L216-6**).
- **Construit** : la cote du jour (4,45 m), les 10 commandes du jour, leurs créneaux, les 3 camions disponibles à Gennevilliers
  et leur capacité, les temps de trajet, les clients (noms fictifs), la cliente qui veut annuler.

## 3. Objectif pédagogique

L'élève sait **remplacer un mode de transport qui tombe** par un autre, vérifier pour chaque client si **l'engagement pris**
(date et créneau) peut être tenu, **prévenir** ceux qu'on ne pourra pas livrer à l'heure, et **appliquer la règle** quand un
client veut annuler. Entraînement de 12.2 (mode) ; prépare 12.7.

## 4. Déroulé (≈ 50 min)

**Jeudi 11 mars 2027, 6 h 30.** Message de Claire : « La Seine est à 4,45 m à Austerlitz, la péniche ne part pas. »

1. **Avant de commencer** (non noté) : banque §4 ter.
2. **Le planning du jour** (vue `planning`, échelle heures 8 h - 20 h, lignes = 3 camions, cartes = 10 commandes avec leur
   créneau promis en fenêtre) : avant l'aléa, la grille montre la péniche ; l'aléa la retire. L'élève pose les commandes sur les
   camions : un camion ne fait qu'une livraison à la fois, trajet compris ; poids total du camion ; les créneaux promis.
   Construit pour que **deux commandes ne puissent pas tenir** (contrôle d'équité : jamais zéro, jamais toutes).
3. **Prévenir** (messagerie, phrases à choisir) : un message aux deux clients qu'on ne livre pas à l'heure (nouvelle date
   proposée), **et seulement à eux**.
4. **Mme Roux veut annuler** (courriel reçu) : l'élève choisit la réponse conforme à l'art. L216-6 (document joint) : elle peut
   annuler si IKEA ne livre pas dans le nouveau délai qu'elle fixe ; pas tout de suite, sauf date essentielle.
5. Bilan.

## 4 bis. Questions au fil — propositions

| Geste | Qui pose | Question proposée | Type | Notée / réflexion | Corrigée | Pourquoi ici |
|---|---|---|---|---|---|---|
| Aléa lu (premier geste après) | Claire | « Pourquoi la péniche ne peut-elle pas passer quand l'eau monte ? » (les ponts trop bas, le courant / la pluie / le brouillard) | fil | réflexion | — | comprendre l'aléa |
| Commande posée hors de son créneau | Claire | « M. Diallo attendait entre 14 h et 16 h. Tu le livres à 17 h. Qu'est-ce qu'IKEA ne tient pas ? » (son engagement de créneau / son prix / rien) | fil | notée | tout de suite | ancrée sur le geste faux de l'élève (s'il n'arrive pas, elle tombe au bilan sur sa grille) |
| Planning envoyé | Claire | « Ce matin, combien de km de camion en plus à cause de la crue ? » (calcul à partir de ses trajets) | fil | notée | au bilan | ancrée sur son planning |
| ★ Réponse à Mme Roux | Claire | « Mme Roux peut-elle annuler tout de suite ? » (non, elle doit d'abord laisser un délai raisonnable, sauf si la date était essentielle, texte cliqué / oui / jamais) | point d'étape | notée | au bilan | **éco-droit appliqué** : L216-6 ; corrigée au bilan pour ne pas donner le jalon 5 |
| Fin | Claire | « Pourquoi IKEA garde-t-il des camions même avec la péniche ? » | point d'étape | réflexion | — | un mode de secours |

## 4 ter. Avant de commencer (non noté ; ★ = reprise en 12.7)

| id | Rubrique | Question | Juste | Pièges | À gauche | ★ |
|---|---|---|---|---|---|---|
| engagement | préparation | Le client a choisi un créneau de 14 h à 16 h. L'engagement est tenu si le livreur arrive… | entre 14 h et 16 h | avant 18 h ; le lendemain | — | ★ |
| prevenir | préparation | Le livreur sera en retard. Il faut… | prévenir le client avant et proposer une autre heure | ne rien dire ; livrer quand même | — | ★ |
| secours | préparation | La péniche ne passe pas. On peut encore livrer… | en camion depuis l'entrepôt | par avion ; on ne livre pas | — | |
| duree | préparation | Un camion part à 9 h, roule 45 min, livre en 30 min. Il est libre à… | 10 h 15 (valeurs tirées) | 9 h 45 ; 10 h | — | ★ |
| annuler | éco-droit | Le vendeur ne livre pas à la date promise. Le client peut annuler… | après lui avoir laissé un délai raisonnable (art. L216-6) | tout de suite, toujours ; jamais | extrait du Code de la consommation | ★ |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| 1 | Toutes les commandes posées, aucun camion à deux endroits à la fois | planning | 3 |
| 2 | Créneaux tenus pour toutes les commandes qui pouvaient l'être | engagement | 5 |
| 3 | Charge des camions respectée | planning | 2 |
| 4 | Les deux clients non tenus prévenus, et eux seuls, avec une nouvelle date | engagement | 4 |
| 5 | Réponse à Mme Roux conforme à la règle | engagement | 2 |
| — | Questions au fil | questions | 4 |

Pas de jalon de forme (phrases à choisir). Garde d'inaction : planning non envoyé = jalons 1 à 3 faux ; aucun message = jalon 4
faux (le message « à tous » est faux aussi).

## 6 bis. Tirage

Fixe : la crue, Mme Roux. Tirés : créneaux et adresses des 10 commandes dans une banque de 16 (équité : toujours exactement
deux commandes impossibles à tenir, vérifié par le code sur 500 tirages en test). Confirmé : une 11e commande (bonus).
Entraînement : `aides.verifier: false` (un seul bouton : envoyer), la fenêtre du créneau s'affiche (aide `fenetre`).

## 7. Demandes au moteur

À vérifier : le `planning` sait-il juger « la carte est posée dans sa fenêtre » (règle sur la fenêtre, pas seulement l'aide
d'affichage) et « deux cartes impossibles » ? Sinon, demande au moteur à écrire ici avant de construire.

## 8. Tests attendus

Bloc `outils/test/ikea-12.3.mjs`. Cas : planning juste ; une commande hors créneau = jalon 2 faux seulement ; message envoyé à
tous = jalon 4 faux ; réponse « oui, tout de suite » = jalon 5 faux ; contrôle d'équité sur 500 tirages ; sabotage.

## 10. Critères de validation par Tristan

Voir l'aléa arriver, replanifier à la souris, prévenir les bons clients, répondre à Mme Roux.

## 11. Questions ouvertes (réponse par défaut entre parenthèses)

- [ ] Les camions de secours sont-ils électriques ? (non dit : « camion », sans plus)
- [ ] Cote inventée du jour : 4,45 m, juste au-dessus du seuil vérifié de 4,30 m (oui, dite construite).
