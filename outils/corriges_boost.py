# -*- coding: utf-8 -*-
"""Corrigés des trames élève Boost ENT-3.2 et ENT-3.3 (Cowork, 04/10/2026).

Même format que `corriges_data.py` (clé = début de la question, ou « T: » + en-têtes d'un tableau ; valeur =
rep / pistes / lignes / note). Chaque générateur inscrit son dictionnaire dans `corriges_data._DICOS`.

Les nombres sont RECALCULÉS le 04/10/2026 depuis le code livré, pas recopiés d'un brief :
`contenus/boost-ent32-carte.js` (clients, poids, trajets), `contenus/boost-ent32.js` (JOURNEE : départ 14 h 35,
train 16 h 15, 190 kg, 14 km/h, 5 min par arrêt), `contenus/boost-ent32-imprevu.js` (l'imprévu),
`contenus/boost-ent33.js` (la tournée d'Inès). Énumération des ordres, même règle que `meilleureTournee()`.
Si la journée change (outil de calage), ces nombres sont à refaire.
"""

# ------------------------------------------------------------------------------------------- ENT-3.2
# Huit commandes : Guiraud 18, Pellet 12, Ribot 34, Mazel 16 (nouveaux), Cave Teissier 52, Pâtisserie Arnaud 31
# (créneau avant 15 h 05), Papeterie Bonnet 29, Épicerie Roussel 38. Total 230 kg, charge 190 : 40 kg à écarter ;
# seule la Cave (52 kg) suffit seule. 264 ordres tiennent tout ; le plus court : 12,54 km, gare 16 h 04.
# Le plus court sans créneau (11,00 km) arrive à la Pâtisserie en dernier : il rate le créneau.
# Imprévu (14 h 00) : Ribot annule, la Pâtisserie n'a plus de créneau, l'Épicerie Roussel ferme avant 14 h 55, la
# Cave reste à quai. 120 ordres tiennent ; le plus court : 12,38 km, Roussel 14 h 55, gare 15 h 58 ; 144 kg chargés.
ENT_3_2 = {
 "T: Information | Ce que tu relèves": {"lignes": [
   ["Heure de départ de l'entrepôt", "14 h 35"],
   ["Heure de départ du train pour Paris", "16 h 15"],
   ["Charge maximale du vélo-cargo (kg)", "190"],
   ["Vitesse du vélo-cargo en ville (km/h)", "14"],
   ["Temps passé à chaque arrêt (min)", "5"],
   ["Nombre de commandes", "8"],
   ["Client qui a un créneau de livraison", "Pâtisserie Arnaud"],
   ["Heure limite de ce créneau", "15 h 05"],
 ], "note": "Valeurs de la journée d'ENT-3.2 (chantier D, lot 2). Le message dit aussi : un colis qui arrive après le train est livré un jour plus tard."},
 "M. Morin écrit que plusieurs ordres": {"pistes": [
   "Prendre le plus court : moins de kilomètres, moins de temps (c'est ce que dit M. Morin).",
   "D'abord tenir les contraintes (train, créneau), puis seulement chercher le plus court.",
   "Question de prévision : on y revient à l'étape 6 (le plus court ne tient pas forcément le créneau)."]},
 "T: Nouveau client | Rue (dans le message) | Quartier | Case": {"lignes": [
   ["Torréfaction Guiraud", "rue de l'Horloge", "Écusson", "D2"],
   ["Mercerie Pellet", "rue Régale", "Écusson", "D3"],
   ["Atelier Ribot", "rue Canteduc", "Jardins de la Fontaine", "C2"],
   ["Herboristerie Mazel", "corniche de l'Ermitage", "Jardins de la Fontaine", "B2"],
 ], "note": "Pièges de l'index : « Place de l'Horloge » à côté de la rue ; trois « Ermitage » (allée, corniche, impasse). Le suivi note seulement que le client est situé ; le nombre de clics sur une autre rue s'affiche à l'écran."},
 "Pour le client que tu as eu le plus de mal": {"pistes": [
   "Souvent l'Herboristerie Mazel (trois rues « de l'Ermitage ») ou la Torréfaction (rue et place de l'Horloge).",
   "Valoriser l'élève qui dit avoir comparé le nom en entier, ou ouvert le mauvais quartier d'abord."]},
 "Poids total des commandes": {"rep": "230 kg.", "note": "18 + 12 + 34 + 16 + 52 + 31 + 29 + 38. Formule : =SOMME(B2:B9)."},
 "Poids à laisser à quai, au moins": {"rep": "40 kg.", "note": "230 − 190. Formule : poids total − charge utile (=B10-F5)."},
 "Commande que tu laisses à quai": {"rep": "Cave Teissier.", "note": "C'est la seule commande qui pèse à elle seule au moins 40 kg. Le jalon « choix » exige le calcul juste ET la Cave à quai, seule."},
 "Poids de cette commande": {"rep": "52 kg."},
 "Pourquoi as-tu laissé CETTE commande": {"pistes": [
   "Il faut retirer au moins 40 kg : seule la Cave Teissier (52 kg) y suffit à elle seule.",
   "Laisser deux petites commandes ferait deux clients mécontents au lieu d'un.",
   "Valoriser l'élève qui part de son calcul (40 kg) plutôt que d'un essai à la jauge."]},
 "T: Essai | Ordre des arrêts (numéros ou noms) | Train tenu ? | Créneau tenu ?": {"lignes": [
   ["exemple", "Pâtisserie Arnaud > Papeterie Bonnet > Épicerie Roussel > Atelier Ribot > Herboristerie Mazel > Torréfaction Guiraud > Mercerie Pellet", "oui (16 h 04)", "oui (14 h 55)"],
 ], "note": "Réponse personnelle : les essais de l'élève. 264 ordres tiennent le train et le créneau. Un ordre qui passe à la Pâtisserie en dernier rate le créneau (15 h 05)."},
 "Qu'est-ce qui t'a fait changer d'ordre": {"pistes": [
   "Le créneau raté : il faut passer tôt à la Pâtisserie Arnaud.",
   "Le train manqué : un ordre qui fait des allers-retours entre les quartiers.",
   "Valoriser l'élève qui cite la jauge qu'il a vue passer au rouge."]},
 "T: Ce que tu calcules | Ma formule | Résultat affiché": {"lignes": [
   ["Poids chargé (kg)", "=B10-B13", "178"],
   ["Temps de route (min)", "=F13/F3*60", "53,7 (pour 12,54 km)"],
   ["Temps aux arrêts (min)", "=7*F4 (7 arrêts)", "35"],
   ["Heure d'arrivée à la gare", "=F2+F14+F15", "16 h 04 (pour 12,54 km)"],
   ["Heure d'arrivée chez le client à créneau", "=F2+F17/F3*60+F18*F4", "14 h 55 si la Pâtisserie est le 1er arrêt"],
 ], "note": "Les résultats dépendent de la tournée de l'élève ; ceux-ci sont ceux de la meilleure tournée. Poids laissé à quai (B13) : la cellule du poids de la Cave (=B6). Les formules se jugent sur ce que l'élève a tapé (une erreur de lecture ne se paie qu'une fois)."},
 "Ton poids chargé est-il sous la charge maximale": {"rep": "Oui : 178 kg pour 190 kg."},
 "Ton heure d'arrivée à la gare est-elle avant le train": {"rep": "Oui si la tournée tient (16 h 04 pour la meilleure, train à 16 h 15).", "note": "Variable selon la tournée."},
 "Ton heure d'arrivée chez le client à créneau": {"rep": "Oui si la tournée tient (avant 15 h 05).", "note": "Variable selon la tournée."},
 "Pour la formule qui t'a demandé le plus d'essais": {"pistes": [
   "Souvent l'heure chez le client à créneau (distance ÷ vitesse × 60 + arrêts servis avant × temps par arrêt).",
   "Ou le temps de route, oublié en heures sans le × 60.",
   "Valoriser l'élève qui dit ce qu'il a lu dans « ? Aide » ou dans le rouge."]},
 "T: Essai | Ordre des arrêts | Distance (km) | Tout tient ?": {"lignes": [
   ["meilleure", "Pâtisserie Arnaud > Papeterie Bonnet > Épicerie Roussel > Atelier Ribot > Herboristerie Mazel > Torréfaction Guiraud > Mercerie Pellet", "12,54", "oui"],
 ], "note": "Jalons : moins de 10 % de plus que 12,54 km (13,79 km au plus), puis moins de 5 % (13,17 km au plus). Le plus court sans créneau (11,00 km, Pâtisserie en dernier) rate le créneau. Le message de 14 h 00 arrive quand la tournée tient tout ET que la feuille est vérifiée juste."},
 "Quel principe t'a aidé à raccourcir": {"pistes": [
   "Servir les clients d'un même quartier à la suite, sans revenir en arrière.",
   "Passer d'abord par le client à créneau, puis faire une boucle qui finit près de la gare.",
   "Valoriser l'élève qui s'appuie sur la distance lue dans sa feuille."]},
 "Quelle commande est annulée": {"rep": "Celle de l'Atelier Ribot (34 kg)."},
 "Quel client a maintenant un créneau": {"rep": "L'Épicerie Roussel."},
 "Jusqu'à quelle heure": {"rep": "Avant 14 h 55."},
 "Quel client n'a plus de créneau": {"rep": "La Pâtisserie Arnaud."},
 "Qu'est-ce qui ne change pas": {"rep": "Le train de 16 h 15, la charge de 190 kg, le départ à 14 h 35 ; la Cave Teissier reste à quai.", "note": "Une seule contrainte citée suffit."},
 "Poids chargé de ta nouvelle tournée": {"rep": "144 kg.", "note": "230 − 34 (annulée) − 52 (Cave à quai). La ligne de la commande annulée garde sa place dans la feuille, à 0 kg."},
 "Heure d'arrivée chez le client à créneau": {"rep": "Avant 14 h 55 (14 h 55 pour la meilleure tournée : l'Épicerie Roussel en premier).", "note": "Variable selon la tournée."},
 "Heure d'arrivée à la gare": {"rep": "Avant 16 h 15 (15 h 58 pour la meilleure tournée).", "note": "Variable selon la tournée."},
 "Distance de ta nouvelle tournée": {"rep": "12,38 km pour la meilleure : Épicerie Roussel > Herboristerie Mazel > Torréfaction Guiraud > Mercerie Pellet > Papeterie Bonnet > Pâtisserie Arnaud.", "note": "Jalons de phase 2 : la tournée replanifiée tient tout (et a changé depuis le message), puis moins de 10 % de plus que 12,38 km (13,62 km au plus). Aucune tournée de la phase 1 ne tient plus."},
 "Qu'est-ce qui, dans le message, t'a obligé": {"pistes": [
   "Le créneau de l'Épicerie Roussel (avant 14 h 55) : il faut la servir en premier.",
   "La Pâtisserie n'a plus de créneau : elle peut passer plus tard.",
   "L'annulation de l'Atelier Ribot retire un arrêt et libère du poids, mais ne suffit pas à elle seule."]},
}

# ------------------------------------------------------------------------------------------- ENT-3.3
# La tournée d'Inès : Mercerie Pellet (12 kg) à quai ; ordre Herboristerie Mazel > Atelier Ribot > Épicerie Roussel
# > Torréfaction Guiraud > Papeterie Bonnet > Pâtisserie Arnaud > Cave Teissier ; 11,52 km. Poids chargé réel
# 218 kg (dépassée) ; sa feuille annonce 166 kg (=SOMME(B2:B7) oublie la Cave, 8e ligne B8). Pâtisserie à
# 15 h 40 (créneau 15 h 05 raté) ; gare à 15 h 59 (train 16 h 15 tenu : c'est le leurre). Réparation : Cave à
# quai, puis la meilleure tournée d'ENT-3.2 (12,54 km, gare 16 h 04, Pâtisserie 14 h 55).
ENT_3_3 = {
 "Quelle commande Inès a-t-elle laissée à quai": {"rep": "La Mercerie Pellet (12 kg)."},
 "Pourquoi l'a-t-elle choisie": {"rep": "C'est la plus petite commande : elle partira demain « sans gêner personne »."},
 "Comment a-t-elle choisi l'ordre": {"rep": "Elle a pris l'ordre le plus court sur la carte (« moins de kilomètres, donc forcément de la marge partout »)."},
 "Combien de kilos charge-t-elle, d'après sa feuille": {"rep": "166 kg.", "note": "Ce chiffre est faux : sa formule oublie la dernière ligne de la tournée (la Cave Teissier, 52 kg)."},
 "Que peux-tu modifier dans l'outil pour l'instant": {"rep": "Rien : la tournée et la feuille sont verrouillées jusqu'à ma réponse."},
 "Avant de contrôler, le raisonnement d'Inès": {"pistes": [
   "Réponse de prévision, toutes recevables. Beaucoup d'élèves le trouvent juste : c'est le piège.",
   "Un élève attentif se souvient d'ENT-3.2 : il fallait retirer au moins 40 kg, et le plus court ratait le créneau.",
   "On y revient à l'étape 5."]},
 "T: Arrêt n° | Commande chargée | Poids (kg)": {"lignes": [
   ["1", "Herboristerie Mazel", "16"], ["2", "Atelier Ribot", "34"], ["3", "Épicerie Roussel", "38"],
   ["4", "Torréfaction Guiraud", "18"], ["5", "Papeterie Bonnet", "29"], ["6", "Pâtisserie Arnaud", "31"],
   ["7", "Cave Teissier", "52"], ["", "Poids chargé (total)", "218"],
 ]},
 "Charge maximale du vélo-cargo": {"rep": "190 kg."},
 "Le poids chargé que tu as calculé est-il sous cette charge": {"rep": "Non : 218 kg, soit 28 kg de trop."},
 "Comment as-tu vérifié le poids chargé": {"pistes": [
   "En additionnant moi-même les poids lus dans le message, commande par commande.",
   "En comptant les arrêts sur la carte (7), pas les lignes de la feuille.",
   "Valoriser l'élève qui remarque l'écart avec les 166 kg annoncés."]},
 "T: Ce que la cellule calcule | Formule d'Inès | Juste ou fausse ?": {"lignes": [
   ["Poids chargé (kg)", "=SOMME(B2:B7)", "fausse : il manque B8 (la Cave Teissier) → =SOMME(B2:B8)"],
   ["Temps de route (min)", "=E9/E3*60", "juste"],
   ["Temps aux arrêts (min)", "=7*E4", "juste (7 arrêts)"],
   ["Arrivée à la gare", "=E2+E10+E11", "juste"],
   ["Arrivée chez le client à créneau", "=E2+E13/E3*60+E14*E4", "juste"],
 ], "note": "Une seule formule fausse. Le bouton « Vérifier » n'existe pas dans cette séance : l'erreur se trouve par le calcul de l'étape 2."},
 "Heure d'arrivée à la gare": {"rep": "15 h 59."},
 "Est-elle avant le train": {"rep": "Oui (train à 16 h 15) : le train est tenu.", "note": "C'est le leurre : l'élève ne doit pas accuser toutes les contraintes."},
 "Heure d'arrivée chez le client à créneau": {"rep": "15 h 40 (Pâtisserie Arnaud)."},
 "Est-elle avant la limite du créneau": {"rep": "Non : le créneau finit à 15 h 05. Il est raté de 35 minutes."},
 "Comment as-tu repéré une formule": {"pistes": [
   "Mon poids calculé à la main (218 kg) ne donnait pas les 166 kg de la feuille.",
   "En lisant la plage de SOMME : elle s'arrête à B7, la tournée va jusqu'à B8.",
   "Valoriser l'élève qui a comparé la formule à son titre."]},
 "Brouillon de ta réponse à Inès": {"modele": "Charge utile : dépassée\nPoids chargé : 218 kg\nTrain de 16 h 15 : attrapé\nArrivée à la gare : 15 h 59\nCréneau de la Pâtisserie Arnaud : raté\nArrivée à la Pâtisserie Arnaud : 15 h 40", "note": "Jalons : « contraintes » (les trois verdicts, leurre compris) et « preuves » (poids exact, heures à une minute près). Le meilleur des messages envoyés compte."},
 "Pour la contrainte où tu as le plus hésité": {"pistes": [
   "Souvent le train : il est tenu, alors que tout le reste va mal.",
   "Ou la charge, parce que la feuille d'Inès disait 166 kg.",
   "Valoriser l'élève qui s'appuie sur son propre calcul plutôt que sur la feuille d'Inès."]},
 "T: Essai | À quai | Poids chargé | Arrivée créneau | Arrivée gare | Distance": {"lignes": [
   ["meilleure", "Cave Teissier", "178 kg", "14 h 55", "16 h 04", "12,54 km"],
 ], "note": "Ordre de la meilleure tournée : Pâtisserie Arnaud > Papeterie Bonnet > Épicerie Roussel > Atelier Ribot > Herboristerie Mazel > Torréfaction Guiraud > Mercerie Pellet (celle d'ENT-3.2). Jalons de réparation : formule corrigée, Cave à quai et charge tenue, train, créneau, tournée à moins de 10 % (13,79 km au plus). Ils se lisent en continu, même sans « J'ai terminé »."},
 "Inès avait laissé à quai la plus petite commande": {"pistes": [
   "Il fallait retirer au moins 40 kg (230 − 190) : 12 kg ne suffisent pas.",
   "Seule la Cave Teissier (52 kg) ramène la charge sous 190 kg à elle seule.",
   "Valoriser l'élève qui cite ses chiffres."]},
 "Commande laissée à quai dans ta correction": {"rep": "La Cave Teissier."},
 "Distance de ta tournée corrigée": {"rep": "Variable : 12,54 km pour la meilleure tournée, 13,79 km au plus pour le jalon."},
 "Si tu donnais un conseil à Inès": {"pistes": [
   "Calculer ce qu'il faut retirer avant de choisir la commande à laisser à quai.",
   "Vérifier les contraintes (le créneau) avant de chercher le plus court.",
   "Relire la plage de ses formules SOMME.",
   "Toute réponse qui part d'une erreur réelle d'Inès."]},
}
# « Heure d'arrivée à la gare » sert deux fois (étapes 3 et 6) : la réponse de l'étape 6 est dans EXTRAS_3_3,
# que le générateur inscrit dans `corriges_data._EXTRAS` (lu avant le dictionnaire, par étape).
EXTRAS_3_3 = {
    (6, "Heure d'arrivée à la gare"): {"rep": "Variable : 16 h 04 pour la meilleure tournée ; avant 16 h 15 dans tous les cas."},
}
EXTRAS_3_2 = {}
