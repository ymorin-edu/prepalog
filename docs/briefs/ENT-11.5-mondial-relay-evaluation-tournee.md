# Brief de séance — ENT-11.5 Mondial Relay, évaluation : la tournée Sud et le colis bloqué (2de, poste B — transport, évaluation)

**Statut** : à implémenter (aucune vue nouvelle)
**Date du brief** : 26/10/2026 — Claude, d'après le cadrage validé
**Modèle** : Sonnet

## 1. Identité

| Champ | Valeur |
|---|---|
| `code` | ENT-11.5 |
| `id` | `mondial-relay-evaluation-tournee` |
| Titre / desc | « Mondial Relay — évaluation : la tournée Sud » / « Agent d'exploitation à Buchères : ordonner la tournée des Points Relais du sud de l'Aube selon leurs heures d'ouverture, puis suivre un colis bloqué et prévenir les bonnes personnes. » |
| Niveau(x) | 2de |
| Compétence(s) | **OTM-C1.3** (itinéraire), **OTM-C2.3** (suivre l'opération, rendre compte), **OTM-C2.1** (documents) ; D2, D1 |
| Temps pédagogique | **évaluation** (C1.3 : 6.9 ; C2.3 : 5.8, 6.10 ; C2.1 : 5.8) |
| Notation | copie rendue, jalons pondérés sur 20, un jeu tiré par élève |
| `pret` à la livraison | `pret: true, ouverture: 'prof'` |

## 2. L'entreprise

Vérifié : livraison des Points Relais pendant leurs heures d'ouverture, du mardi au samedi ; colis gardé 5 jours ;
états de suivi « Pris en charge », « Au Point Relais® », « Réexpédié au chargeur » ; communes et codes postaux réels.
**Construit** : les commerces et leurs horaires, la carte (capture OSM locale de l'Aube, « © contributeurs
OpenStreetMap »), les temps de trajet, le colis bloqué.

## 4. Déroulé (≈ 45 min)

1. **Avant de commencer**, notées (4 / 20) : clés de 6.9 et 6.10, tirées.
2. **La tournée T3 Sud** (vue `tournee`, comme 6.9) : départ de Buchères, 5 Points Relais (Saint-Julien-les-Villas,
   Bréviandes, Bar-sur-Seine, Chaource, Les Riceys), chacun avec ses heures d'ouverture (une boulangerie ferme
   à 12 h 30, un tabac n'ouvre qu'à 10 h, un café fermé le samedi après-midi…). L'élève ordonne, envoie, reporte heures
   et conduite.
3. **Le colis bloqué** (messagerie + documents) : un colis est resté « Pris en charge » depuis 4 jours ; l'élève lit le
   suivi (document joint), trouve la cause (écarté au tri pour carton ouvert, parti en expertise — lien avec 11.2), et
   prévient par courriel (phrases à choisir) **le Point Relais** et **l'expéditeur** ; un piège : prévenir le
   destinataire directement n'est pas le rôle de l'agence (à vérifier, voir §11).
4. Copie rendue.

## 4 bis. Questions au fil — propositions (notées, sans retour)

| Geste | Question | Pourquoi |
|---|---|---|
| Tournée envoyée | « Pourquoi Chaource passe-t-il avant Les Riceys dans **ta** tournée ? » (cliquer l'horaire qui l'impose) | ancrée sur sa tournée |
| Cause du blocage trouvée | « Combien de jours le Point Relais gardera-t-il ce colis quand il arrivera ? » (5 / 14 / 30) | règle des 5 jours |
| **Éco-droit**, courriel envoyé | « L'expéditeur demande une indemnité pour le retard. Que disent les conditions de vente ? » (texte : CGV art. 12, fourni) | contrat appliqué au cas |

## 5. Jalons — poids proposés (à valider)

| # | Jalon | Groupe | Poids |
|---|---|---|---|
| 1 | Tous les Points Relais livrés pendant leurs heures d'ouverture | tournée | 5 |
| 2 | Conduite dans la règle, retour à Buchères avant l'heure fixée | tournée | 2 |
| 3 | Heures reportées justes sur **sa** tournée | tournée | 2 |
| 4 | Cause du blocage trouvée dans le suivi | suivi | 3 |
| 5 | Les bonnes personnes prévenues, rien de faux annoncé | rendre compte | 3 |
| 6 | Ton du courriel (formule, politesse) | forme | 1 |
| — | Avant de commencer | questions | 4 |

## 6 bis. Tirage

Horaires des commerces tirés dans une banque (contrainte : une seule famille d'ordres justes, au moins un ordre « naturel »
du nord au sud qui échoue) ; colis bloqué tiré parmi 3 causes (carton ouvert, étiquette illisible, adresse de Point
Relais fermé).

## 7. Demandes au moteur

Carte de l'Aube pour la vue `tournee` (capture OSM locale, outil `outils/carte/` comme la côte normande de 6.9). Une
ligne de données et une capture, pas de code, si l'outil la fabrique.

## 11. Questions ouvertes

- [ ] Qui prévient le destinataire en cas de retard chez Mondial Relay (l'expéditeur, ou Mondial Relay par SMS) ? À
  vérifier avant d'écrire les phrases du courriel.
- [ ] Horaires des Points Relais : construits (pas les vrais commerces).
