# Brief de séance — ENT-12.7 IKEA, évaluation transport : la livraison de ta cliente (2de, poste B — transport, évaluation)

**Statut** : à implémenter (aucune vue nouvelle ; dépend des vérifications de 12.2 et 12.3)
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé par Tristan le 26/10
**Modèle** : Sonnet

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-12.7 |
| `id` | `ikea-evaluation-transport` |
| Titre / desc | « IKEA — évaluation : la livraison de ta cliente » / « Sans aide : appeler une cliente, choisir le mode de livraison de chaque article et son prix, puis tenir les créneaux de la journée quand un imprévu tombe. » |
| Niveau(x) | `['2de']` |
| Compétence(s) | **OTM-C1.1**, **OTM-C1.2**, **OTM-C3.1** ; D1, D2 |
| Temps pédagogique | **évaluation** (règle 15 : C1.1 et C1.2 travaillées en 12.2 et 12.3, C3.1 en 12.3) |
| Notation | `copie: true`, jalons pondérés sur 20, un jeu tiré par élève ; `export const noter = (db) => moteur.noter(db);` |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise : vérifié / construit

Mêmes faits vérifiés que 12.2 (modes, prix figés au 26/10/2026, CGV) et 12.3 (crue, art. L216-6). **Construit** : les 4
clientes de la banque, leurs commandes, l'imprévu tiré, les camions.

## 3. Objectif

Sans aide, l'élève recueille une demande de livraison complète, choisit le mode juste pour chaque article et en dit le prix,
puis tient les engagements de la journée après un imprévu et prévient qui il faut.

## 4. Déroulé (≈ 50 min)

1. **Avant de commencer**, notées (4 / 20) : questions ★ de 12.2 et 12.3, tirées, sans aide, « Je ne sais pas » permis, faux =
   − 1 ÷ (nombre de mauvaises réponses), plancher à 0.
2. **L'appel** (vue `dialogue`, mode évaluation : la première réponse est la réponse, aucune réaction corrective) : une cliente
   tirée (banque de 4 : Paris 15e 3e étage avec ascenseur ; Colombes, hors fluvial ; Paris 18e, 5e sans ascenseur, canapé qui ne
   passe pas l'escalier ; Paris 12e, commande de plus de 1 000 €).
3. **La fiche « mode de livraison »** : mode et raison par article, prix.
4. **La journée** (vue `planning`, comme 12.3, sans « Vérifier ») : l'imprévu tiré (crue ; ou un camion en panne ; ou un
   chauffeur absent), les créneaux à tenir, puis les messages aux clients non tenus (phrases à choisir).
5. Copie rendue.

## 4 bis. Questions au fil (notées, sans retour)

| Geste | Question | Pourquoi |
|---|---|---|
| Mode choisi pour l'article le plus lourd | « Pourquoi ce mode pour ton [article tiré] ? » (raison juste parmi 3) | reprise de 12.2, ancrée sur la pièce |
| ★ Planning envoyé | « Ta cliente veut annuler parce que tu la livres demain au lieu d'aujourd'hui. Le peut-elle tout de suite ? » (texte L216-6 cliqué) | **éco-droit appliqué**, reprise de 12.3 |
| Messages envoyés | « Pourquoi ne pas prévenir tous les clients du jour ? » (inquiéter pour rien / ça coûte / c'est interdit) | engagement client |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| 1 | Appel : accès (étage, ascenseur, escalier) et créneau recueillis | demande | 3 |
| 2 | Appel : rien de faux promis | demande | 1 |
| 3 | Mode juste par article | mode | 4 |
| 4 | Prix juste | mode | 2 |
| 5 | Créneaux tenus pour tout ce qui pouvait l'être | engagement | 3 |
| 6 | Clients non tenus prévenus, et eux seuls | engagement | 2 |
| 7 | Questions au fil | questions | 1 |
| — | Avant de commencer | questions | 4 |

Pas de jalon de forme (répliques et phrases à choisir). Gardes d'inaction de 12.2 et 12.3 reprises.

## 6 bis. Tirage

Un jeu par élève (règle du 03/10) : cliente (4), valeurs de la commande, imprévu (3), créneaux de la journée (banque de 16 de
12.3). Équité : même nombre d'articles (3), même nombre de commandes impossibles à tenir (2). Ni bonus ni niveau.

## 7. Demandes au moteur

Aucune de plus que 12.2 et 12.3 ; vérifier que le `dialogue` accepte un script tiré (4 clientes) — même point qu'ENT-11.7.

## 8. Tests attendus

Bloc `outils/test/ikea-12.7.mjs`. Cas : copie juste (20/20 hors questions) ; chaque cliente de la banque jouée une fois ;
équité sur 500 tirages ; copie vide ; « Je ne sais pas » ; sabotage.

## 11. Questions ouvertes (réponse par défaut entre parenthèses)

- [ ] Garder l'appel en évaluation (le plus long à construire) ou le remplacer par un courriel de la cliente à lire ? (le garder :
  OTM-C1.1 se juge sur l'écoute)
