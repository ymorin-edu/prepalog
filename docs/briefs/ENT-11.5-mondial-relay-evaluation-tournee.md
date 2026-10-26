# Brief de séance — ENT-11.5 Mondial Relay, évaluation : la tournée Sud et le colis bloqué (2de, poste B — transport, évaluation)

**Statut** : livré (26/10/2026, `pret: true, ouverture: 'prof'`, en ligne, cachée aux élèves) ; à essayer à l'écran par Tristan avant de l'ouvrir
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

---

## Compte rendu *(rempli par Claude Code, 26/10/2026)*

- **Fichiers créés** : `activites/mondial-relay-evaluation-tournee.js` (id `mondial-relay-evaluation-tournee`, code `ENT-11.5`), `contenus/mondial-relay-ent115.js` (séance : documents, plan, courriels par phrases, jalons), `contenus/mondial-relay-ent115-donnees.js` (tirage, calcul d'une journée, données pures), `contenus/questions/ENT-11.5.js`, `contenus/corriges/ENT-11.5.js` (corrigé par élève, calculé depuis sa graine), `outils/test/mr-11.5.mjs`.
  **Modifiés** : `activites/index.js` (une ligne, après `pelleau-evaluation-controle.js`), `activites/catalogue.js` (régénéré), `outils/test.mjs` (`mr-11.5` dans `BLOCS` et dans le groupe 6), `outils/test/socle.mjs` (un cas réécrit, voir « Reste ouvert »), `docs/decisions.md`.
- **Poids codés** (16 + 4 = 20) : relais 5, règles 2, heures 2, cause 3, prévenir 3, ton 1 ; « Avant de commencer » 4 (`part: 4`, 4 questions tirées : 2 de préparation, 2 de droit ; juste +1, « Je ne sais pas » 0, fausse −1 ÷ nombre de mauvaises, plancher 0). Questions clés reprises de 6.9 et 6.10 : minutes à 40 km/h, solde de colis, « une indemnité, c'est… », SMS au volant, scanner (L1222-4), réemploi.
- **Vérifié / construit** : réels : Mondial Relay et son hub de Buchères, les communes, les conditions de vente (art. 10 à 12), le suivi d'un colis, le règlement 561/2006. **Construits** : les cinq commerces et leurs horaires (annoncés comme tels dans le « Bon à savoir »), la vitesse (40 km/h) et les 10 min par arrêt, le colis, Samia, le gérant, l'expéditrice, tous les courriels. Aucune recherche web nouvelle dans cette livraison.
- **Écarts par rapport au brief** :
  1. **Carte de l'Aube non fabriquée** : le téléchargement OSM est refusé (403 du proxy de la session) ; pas de contournement. **C'est un plan schématique** (positions approchées des communes, échelle 13 px par km, majorée de 1,3 pour la route) qui sert de plan à la vue Tournée, et le document « Les distances » donne la matrice des km. La demande « carte de l'Aube » reste donc ouverte (§7 ci-dessous).
  2. **Pas de questions au fil** : le §4 bis les propose mais le barème du §5 ne leur donne aucun poids ; seule l'ouverture est notée. À reprendre si Tristan veut la 4e ligne de poids.
  3. Le brief demande « au moins un ordre naturel nord → sud qui échoue » : le tirage garantit mieux (l'ordre naturel n'est **jamais** juste, une seule famille d'ordres justes, marge ≥ 10 min, zéro secours sur 400 graines).
  4. Le carton ouvert n'est pas « expertisé » : il est « mis de côté à l'agence » (on ne sait pas ce que Mondial Relay en fait).
  5. Indemnité : les conditions de vente reprises ne parlent pas du **retard** ; la ligne dit « si le colis était perdu ou abîmé » (25 € au plus, frais d'envoi non remboursés), au lieu de « l'indemnité pour le retard » de la question au fil du brief.
  6. La pause de 45 min n'est pas « jamais due » : certains ordres en zigzag dépassent 4 h 30 de conduite, le jalon « règles » a un vrai contenu (cas testé : bs>sj>br>ch>ri sur el-2, 271 min).
  7. La cause « Point Relais fermé » est présentée comme « fermé jeudi, revenu à l'agence » (le brief disait « adresse de Point Relais fermé »).
  8. Aucun parcours, pas de ligne `ENTREPRISES` n° 11 ajoutée dans `activites/index.js` (voir « Reste ouvert »).
- **Décisions prises en route** : voir `docs/decisions.md` (ligne du 26/10/2026). La séance est jugée « une erreur ne se paie qu'une fois » : les heures reportées sont jugées sur SA tournée, la suite du colis et le délai/l'indemnité sur la cause qu'il a CHOISIE dans le même courriel. Un jalon sans travail est « en attente », jamais juste (inaction = 0). Aucun verdict à l'écran avant la remise (jauges muettes de la vue Tournée en copie).
- **Question ouverte du §11 non tranchée** : « qui prévient le destinataire en cas de retard ? ». Les courriels font prévenir le Point Relais et l'expéditrice et **ne disent rien du destinataire** ; à trancher avant d'ajouter une phrase là-dessus.
- **Tests** : bloc `mr-11.5`, 21 cas verts (≈ 110 s) : meta et poids ; jeux figés de 3 élèves écrits à la main ; parité du calcul de la journée et du bilan du moteur sur 6 ordres ; tirage sur 400 graines ; ouverture (4 justes = 4, « Je ne sais pas » = 0, tout faux = 0) ; parcours juste = 20/20 sur 4 jeux (dont les deux ordres justes d'el-2) ; sabotages éprouvés dans les deux sens, un jalon à la fois (naturel, retard, créneau raté, chaque case des heures et ses tolérances, tournée incomplète, cause fausse, un seul courriel, suite incohérente, délai faux, indemnité fausse, ton) ; copie d'un voisin = 8 ; inaction = 0 ; copie rendue et figée, une seule remise ; aucun verdict, aucune requête externe, aucune erreur de page ; corrigé ; Suivi. Aussi verts : `socle` (76), `fb-6.9`, `fb-6.10`, `transport` ; `node outils/catalogue.mjs --verifier` à jour (92 séances). **Suite entière non lancée** (consigne : blocs listés seulement).
- **Commits** : voir `git log` de la branche `worktree-agent-ad22da182ed554379` (rien poussé).
- **Reste ouvert** :
  - **À vérifier à l'écran par Tristan** (non vu à l'œil dans cette livraison, seulement piloté par les tests) : le rendu du plan schématique (lisibilité des étiquettes, cercles de clic), la présentation des cinq documents (poste, tournée T3, distances, suivi, conditions de vente), les listes de phrases mélangées, l'aperçu du courriel, le bouton « Rendre ma copie ».
  - **Entreprise n° 11 à déclarer** : pas de ligne `ENTREPRISES` dans `activites/index.js` pour Mondial Relay (sans elle la séance irait sous « Autres ») ; à faire à l'intégration des sept séances.
  - **`outils/test/socle.mjs` : un cas existant réécrit** (alerte 7) : « la moyenne par spécialité, pour un groupe de 2de seulement » attendait OTM-C2.1 dans l'avis « à prévoir en 2de » ; ENT-11.5 évalue OTM-C2.1 en 2de, donc elle en sort et le cas attend maintenant OTM-C2.2 (et son libellé). Si une autre séance ENT-11.x évalue aussi OTM-C2.2, ce cas sera à ajuster encore.
  - Texte « km/h en ville » de la jauge de conduite en dur dans le moteur (`core/types/tournee.js`) : affiché même sur route ; demande moteur si gênant (petit : texte configurable).
  - Demande moteur : carte de l'Aube (capture OSM locale via `outils/carte/`, une ligne de données et une capture) pour remplacer le plan schématique.
