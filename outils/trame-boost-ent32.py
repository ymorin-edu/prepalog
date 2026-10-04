# -*- coding: utf-8 -*-
"""Trame élève Boost — séance ENT-3.2 « la tournée sous contrainte » (entraînement, C2.4).

Écrite le 04/10/2026 par Cowork, à la demande de Tristan (« créer les trames manquantes »), sur le modèle
d'ENT-3.1 et avec les fonctions de `trame_commun.py`. Règles : fiche `prepalog-trames-eleve`.

Les trois exigences :
  1. autonomie : chaque étape dit où cliquer et ce qu'on doit voir ; libellés repris du code
     (`core/types/carte.js`, `tournee.js`, `contenus/boost-ent32.js`), PAS ENCORE VUS À L'ÉCRAN par Cowork ;
  2. pas à pas : la trame ne dit ni la commande à laisser à quai, ni que le trajet le plus court rate le
     créneau, ni ce que contient le message de 14 h 00 (l'imprévu). Elle dit seulement qu'un message peut
     arriver, pour que l'élève seul sache quand passer à l'étape 7 ;
  3. une analyse réflexive par étape, sur ce que l'élève vient de faire.

Séance X.2 : pas d'étape de découverte de Boost (faite en ENT-3.1), la trame démarre sur l'outil.
Entraînement : moins de béquilles qu'en ENT-3.1 (pas d'exemples chiffrés de formules, l'aide est dans
« ? Aide » sous la barre de formule). Réponses : `corriges_boost.py` → `contenus/corriges/ENT-3.2.js`.
"""
import os
from docx.shared import Cm
import trame_commun as T
import corriges_data, corriges_boost

CODE = 'ENT-3.2'
corriges_data._DICOS[CODE] = [corriges_boost.ENT_3_2]
corriges_data._EXTRAS[CODE] = corriges_boost.EXTRAS_3_2
LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'boost.png')
NOUVEAUX = ['Torréfaction Guiraud', 'Mercerie Pellet', 'Atelier Ribot', 'Herboristerie Mazel']
ESSAIS = [['1', '', '', ''], ['2', '', '', ''], ['3', '', '', ''], ['4', '', '', '']]

T.nouveau()
T.entete(LOGO, "ENT-3.2 — Carnet de suivi : la tournée sous contrainte", [
    ('Ce document est ta trame de travail :',
     "tu peux le suivre seul, étape par étape. Chaque étape dit où travailler et ce que tu dois voir à l'écran."),
    ('Ce que ton enseignant voit dans son suivi :',
     "une note sur 20, lue sur ton travail à l'écran : les clients situés, la commande laissée à quai, la charge, "
     "le train, le créneau, les données et les formules de ta feuille, la longueur de ta tournée. Tes réponses "
     "écrites ici servent à réfléchir."),
    ('Ce qui est vrai, ce qui est inventé :',
     "Boost, le vélo-cargo et le train jusqu'à Paris sont réels. Les huit commerces, leurs colis, les poids, les "
     "horaires et les messages sont inventés pour l'exercice. Les rues sont de vraies rues de Nîmes."),
], [
    ('Ouvrir son environnement et lire le message', 'Dans Prepalog'),
    ('Situer les nouveaux clients', 'Dans Prepalog'),
    ('Décider ce qui part', 'Dans Prepalog'),
    ('Construire la tournée', 'Dans Prepalog'),
    ('Calculer les heures', 'Dans Prepalog'),
    ('Chercher le trajet le plus court', 'Dans Prepalog'),
    ('Quand la journée change', 'Dans Prepalog'),
])

# ==================================================================== étape 1
T.etape(1, "Ouvrir son environnement et lire le message")
T.p("Tu connais déjà Boost et son vélo-cargo (séance ENT-3.1). Aujourd'hui, une autre journée, avec une contrainte "
    "de plus. Connecte-toi à Prepalog, ouvre la rubrique Simulog, puis l'activité « Boost — la tournée sous "
    "contrainte » (ENT-3.2).")
T.consignes([
    "Dans le menu de gauche, clique sur « Messagerie ».",
    "Ouvre le message de M. Morin sur la tournée de cet après-midi. Lis-le en entier.",
    "Relève les informations ci-dessous.",
])
T.tableau(['Information', 'Ce que tu relèves'], 0, [Cm(8.4), Cm(8.6)], hauteur=Cm(0.95),
          remplis=[["Heure de départ de l'entrepôt", ''],
                   ["Heure de départ du train pour Paris", ''],
                   ["Charge maximale du vélo-cargo (kg)", ''],
                   ["Vitesse du vélo-cargo en ville (km/h)", ''],
                   ["Temps passé à chaque arrêt (min)", ''],
                   ["Nombre de commandes", ''],
                   ["Client qui a un créneau de livraison", ''],
                   ["Heure limite de ce créneau", '']])
T.encadre('Un mot à connaître :',
          "un créneau de livraison, c'est l'heure à laquelle un client peut recevoir sa commande. En dehors du "
          "créneau, la boutique est fermée et le colis revient.")
T.reflechir([
    "M. Morin écrit que plusieurs ordres tiennent les contraintes, mais qu'ils ne se valent pas. Avant de commencer, "
    "comment comptes-tu choisir entre eux ?",
])

# ==================================================================== étape 2
T.etape(2, "Situer les nouveaux clients")
T.p("Dans le menu de gauche, clique sur « Plan de Nîmes ». Les clients habituels sont déjà sur la carte. Les "
    "nouveaux clients ne donnent que leur adresse : à toi de les poser sur la bonne rue.")
T.consignes([
    "Dans « Index des rues », tape le nom de la rue du client. L'index te donne le quartier et la case.",
    "Clique sur la rue dans l'index : la carte ouvre ce quartier et écrit les noms de rues.",
    "Dans « Nouveaux clients à situer », clique sur « Situer sur la carte » à côté du client.",
    "Clique sur la rue, sur la carte (le trait blanc, pas les maisons).",
])
T.tableau(['Nouveau client', 'Rue (dans le message)', 'Quartier', 'Case'], 0,
          [Cm(4.8), Cm(6.0), Cm(4.0), Cm(2.2)], hauteur=Cm(1.0),
          remplis=[[n, '', '', ''] for n in NOUVEAUX])
T.encadre('Attention :',
          "plusieurs rues peuvent porter presque le même nom (une rue, une place, une allée…). Compare le nom en "
          "entier avec l'adresse du message.")
T.encadre_liste('Ce que tu dois voir :', [
    "si tu cliques une autre rue, une bulle te dit où tu es : cherche encore ;",
    "le client placé affiche « Situé », avec le nombre de clics sur une autre rue ;",
    "quand les quatre sont placés : « Les 8 clients sont sur la carte : la tournée peut commencer. »",
])
T.reflechir([
    "Pour le client que tu as eu le plus de mal à situer, qu'est-ce qui t'a trompé ?",
])

# ==================================================================== étape 3
T.etape(3, "Décider ce qui part")
T.p("Dans le menu de gauche, clique sur « Tournée de l'après-midi ». En haut, trois onglets : « Données et poids », "
    "« Tournée », « Heures ». Chacun porte une pastille « à faire » qui passe à « fait ». Commence par « Données et "
    "poids » : la feuille de calcul.")
T.consignes([
    "Clique une cellule, puis écris dans la barre au-dessus du tableau.",
    "À droite, tape les données du message (une heure s'écrit avec deux-points, par exemple 9:05).",
    "À gauche, tape le poids de chaque commande.",
    "Calcule le poids total avec SOMME, puis le poids qu'il faut au moins laisser à quai.",
    "Décide quelle commande reste à quai.",
])
T.encadre('À savoir :',
          "un calcul commence par « = ». Sous la barre, « ? Aide » donne une aide pour la cellule choisie. La "
          "jauge de charge te dira si la limite est dépassée, jamais de combien : le calcul, c'est la feuille.")
T.faits([
    "Poids total des commandes (kg)",
    "Poids à laisser à quai, au moins (kg)",
    "Commande que tu laisses à quai",
    "Poids de cette commande (kg)",
])
T.encadre_liste('Tu peux passer à l\'étape 4 quand :', [
    "l'onglet « Données et poids » affiche « ✓ fait » ;",
    "tu as choisi la commande qui reste à quai.",
])
T.reflechir([
    "Pourquoi as-tu laissé CETTE commande à quai plutôt qu'une autre ?",
])

# ==================================================================== étape 4
T.etape(4, "Construire la tournée")
T.p("Clique sur l'onglet « Tournée ». Clique l'entrepôt, puis tes clients dans l'ordre de passage, puis la gare. "
    "La commande que tu laisses à quai ne se clique pas.")
T.consignes([
    "Construis une première tournée, dans l'ordre qui te semble logique.",
    "Regarde les jauges : charge, départ du train, créneau.",
    "Si une contrainte n'est pas tenue, change l'ordre et réessaie. Note chaque essai.",
])
T.encadre_liste('Ce que tu dois voir :', [
    "un tracé qui suit les rues, et le numéro de passage de chaque client ;",
    "quand la tournée va de l'entrepôt à la gare, chaque jauge dit si sa contrainte est tenue ;",
    "elles ne disent jamais de combien : les heures se calculent à l'étape 5.",
])
T.tableau(['Essai', 'Ordre des arrêts (numéros ou noms)', 'Train tenu ?', 'Créneau tenu ?'], 0,
          [Cm(1.6), Cm(10.0), Cm(2.7), Cm(2.7)], hauteur=Cm(1.2), remplis=ESSAIS)
T.encadre_liste('Tu peux passer à l\'étape 5 quand :', [
    "ta tournée part de l'entrepôt et finit à la gare ;",
    "aucune jauge n'affiche « manqué », « raté » ou « dépassée ».",
])
T.reflechir([
    "Qu'est-ce qui t'a fait changer d'ordre entre ton premier essai et le dernier ?",
])

# ==================================================================== étape 5
T.etape(5, "Calculer les heures")
T.p("Clique sur l'onglet « Heures ». En bas de la feuille, « Après la tournée » : ce qui part, et les heures. La "
    "colonne « Arrêt n° » suit ta tournée : la commande sans numéro est restée à quai.")
T.consignes([
    "Poids laissé à quai : désigne la cellule du poids de la commande sans numéro d'arrêt.",
    "Poids chargé : poids total − poids laissé à quai.",
    "Temps de route, temps aux arrêts, puis heure d'arrivée à la gare.",
    "Heure d'arrivée chez le client à créneau.",
    "Clique sur « Vérifier mes formules ».",
])
T.tableau(['Ce que tu calcules', 'Ma formule', 'Résultat affiché'], 0, [Cm(6.0), Cm(6.8), Cm(4.2)],
          hauteur=Cm(1.1),
          remplis=[['Poids chargé (kg)', '', ''],
                   ['Temps de route (min)', '', ''],
                   ['Temps aux arrêts (min)', '', ''],
                   ["Heure d'arrivée à la gare", '', ''],
                   ["Heure d'arrivée chez le client à créneau", '', '']])
T.encadre_liste('Ce que tu dois voir :', [
    "après « Vérifier », les cellules justes passent au vert avec « ✓ » ;",
    "une cellule fausse s'écrit en rouge : corrige-la, puis vérifie à nouveau.",
])
T.faits([
    "Ton poids chargé est-il sous la charge maximale ?",
    "Ton heure d'arrivée à la gare est-elle avant le train ?",
    "Ton heure d'arrivée chez le client à créneau est-elle avant sa limite ?",
])
T.reflechir([
    "Pour la formule qui t'a demandé le plus d'essais, qu'as-tu corrigé ?",
])

# ==================================================================== étape 6
T.etape(6, "Chercher le trajet le plus court")
T.p("Ta tournée tient les contraintes. Mais moins le vélo-cargo roule, mieux c'est. Cherche s'il existe un ordre "
    "plus court qui tient toujours tout.")
T.consignes([
    "Dans l'onglet « Tournée », change l'ordre de tes arrêts.",
    "Dans l'onglet « Heures », lis la distance du parcours, et vérifie tes heures.",
    "Garde l'ordre le plus court qui tient le train ET le créneau. Clique sur « Vérifier mes formules ».",
])
T.tableau(['Essai', 'Ordre des arrêts', 'Distance (km)', 'Tout tient ?'], 0,
          [Cm(1.6), Cm(10.2), Cm(2.6), Cm(2.6)], hauteur=Cm(1.2), remplis=ESSAIS)
T.encadre('Pendant ce temps :',
          "un nouveau message peut arriver. Un bandeau « Nouveau message » s'affiche en haut de l'écran Tournée.")
T.encadre_liste('Tu peux passer à l\'étape 7 quand :', [
    "un nouveau message de M. Morin est arrivé.",
])
T.reflechir([
    "Quel principe t'a aidé à raccourcir ta tournée ?",
])

# ==================================================================== étape 7
T.etape(7, "Quand la journée change")
T.p("Ouvre le nouveau message de M. Morin dans la Messagerie. Lis-le en entier : il ne donne pas de tableau, à toi "
    "de trouver ce qui change.")
T.faits([
    "Quelle commande est annulée ?",
    "Quel client a maintenant un créneau ?",
    "Jusqu'à quelle heure ?",
    "Quel client n'a plus de créneau ?",
    "Qu'est-ce qui ne change pas ? (cite une contrainte)",
])
T.p("Retourne dans « Tournée de l'après-midi ». Ta tournée était faite pour la journée d'avant.", apres=4)
T.consignes([
    "Dans la feuille, retape la limite du créneau : sa ligne porte maintenant le nom du nouveau client.",
    "Vérifie si ta tournée tient encore. Sinon, replanifie-la.",
    "Refais tes heures, puis clique sur « Vérifier mes formules ».",
])
T.encadre_liste('Ce que tu dois voir :', [
    "la commande annulée est barrée : elle ne se charge plus ;",
    "les jauges ne disent plus si les contraintes tiennent : c'est ta feuille qui le montre.",
])
T.faits([
    "Poids chargé de ta nouvelle tournée (kg)",
    "Heure d'arrivée chez le client à créneau",
    "Heure d'arrivée à la gare",
    "Distance de ta nouvelle tournée (km)",
])
T.reflechir([
    "Qu'est-ce qui, dans le message, t'a obligé à changer l'ordre de ta tournée ?",
])

# Feuille à détacher (cours + activité à la maison), décision de Tristan du 04/10/2026 :
# contenu dans `feuilles_detachables.py`.
T.feuille_detachable('ENT-3.2')

T.finir(CODE, 'Boost — la tournée sous contrainte', 'ENT-3.2-boost-sous-contrainte-trame-eleve', [],
        os.path.basename(__file__), fichier=CODE)
