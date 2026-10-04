# -*- coding: utf-8 -*-
"""Trame élève Picard — séance ENT-4.1 « le premier camion » (guidage, C1.4).

Écrite le 03/10/2026 par Cowork, après la validation de la séance à l'écran par Tristan. Mêmes règles
que la trame d'ENT-3.1 (fiche `prepalog-trames-eleve`) ; fonctions communes dans `trame_commun.py`.

Les trois exigences :
  1. autonomie : chaque étape dit où cliquer (libellés relevés sur l'écran le 03/10/2026) et ce qu'on
     doit voir ; les mots du métier (enregistreur, consigne, sonder à cœur, couche) sont définis ;
  2. pas à pas : la trame ne dit jamais quelle palette pose problème ni lequel ; elle donne les gestes,
     l'élève trouve les aléas en les faisant ;
  3. une analyse réflexive par étape de travail, sur ce que l'élève vient de faire.

La règle du quai à trois zones (−18 / −15 °C, décision de Tristan du 03/10/2026) n'est écrite nulle
part à l'écran : la trame la donne, c'est une procédure, pas une réponse.
Le corrigé de la trame va dans `contenus/corriges/ENT-4.1-trame.js` (le corrigé `ENT-4.1.js`, calculé
depuis les palettes par Claude Code, n'est pas touché).
"""
import os
from docx.shared import Cm
import trame_commun as T

LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'picard.png')
PALETTES = ['P1', 'P2', 'P3', 'P4', 'P5']

T.nouveau()
T.entete(LOGO, "ENT-4.1 — Carnet de suivi : le premier camion", [
    ('Ce document est ta trame de travail :',
     "tu peux le suivre seul, étape par étape. Chaque étape dit où cliquer et ce que tu dois voir à l'écran."),
    ('Ce que ton enseignant voit dans son suivi :',
     "18 points, qui donnent une note sur 20 : le ticket de température, le comptage et la décision de chaque "
     "palette, tes réserves, la signature du chauffeur et le lot rentré en chambre froide. Le temps que tu passes "
     "est mesuré, mais il n'est pas noté. Tes réponses écrites ici servent à réfléchir."),
    ('Ce qui est vrai, ce qui est inventé :',
     "Picard, son logo, son entrepôt de Sainghin-en-Mélantois (près de Lille) et le contrôle de la température à "
     "chaque réception sont réels. Le quai 32, le fournisseur, le transporteur, les produits, les températures et "
     "les durées sont inventés pour l'exercice."),
], [
    ('Découvrir Picard', 'Sur Internet'),
    ('Ouvrir son environnement et lire le message', 'Dans Prepalog'),
    ('Lire les papiers avant d\'ouvrir', 'Dans Prepalog'),
    ('Compter chaque palette', 'Dans Prepalog'),
    ('Contrôler et décider', 'Dans Prepalog'),
    ('Le froid d\'abord, les papiers ensuite', 'Dans Prepalog'),
    ('Lire ton bilan', 'Dans Prepalog'),
])

# ==================================================================== étape 1
T.etape(1, "Découvrir Picard")
T.p("Ce matin, tu travailles au quai de réception d'un entrepôt Picard. Avant d'ouvrir le logiciel, découvre "
    "l'entreprise. Fais une recherche sur Internet.")
T.consignes([
    "Cherche « Picard histoire » et ouvre la page « L'histoire de Picard » du site picard.fr.",
    "Cherche ensuite « Picard entrepôt Sainghin GXO » et ouvre l'article de Voxlog (2023).",
    "Réponds aux questions ci-dessous avec ce que tu trouves.",
])
T.questions([("Que vend Picard ?", 2)])
T.faits([
    "En quelle année Picard ouvre-t-il son premier magasin de surgelés ?",
    "Combien de magasins Picard a-t-il environ en France ?",
    "Quelle entreprise fait tourner l'entrepôt de Sainghin-en-Mélantois ?",
])
T.questions([("D'après l'article, que fait l'entrepôt quand un camion arrive avec une température non conforme ?", 2)])
T.qcm([
    ("Un produit surgelé doit être conservé :",
     ["à −18 °C ou plus froid", "à 0 °C", "à +4 °C, comme au frigo"], 0),
])
T.reflechir([
    "D'après ce que tu as trouvé, qu'est-ce qui rend la réception d'un camion de surgelés plus délicate que celle "
    "d'un camion de chaussures ?",
])

# ==================================================================== étape 2
T.etape(2, "Ouvrir son environnement et lire le message")
T.p("Connecte-toi à Prepalog, ouvre la rubrique Simulog, puis l'activité « Picard — le premier camion ». Le "
    "logiciel s'ouvre aux couleurs de Picard. L'accueil te donne les cinq étapes de la séance.")
T.consignes([
    "Dans le menu de gauche, clique sur « Messagerie ».",
    "Ouvre le message du chef de quai : « Quai 32 : premier camion à 6 h 00 ».",
    "Relève les informations ci-dessous.",
])
T.tableau(['Information', 'Ce que tu relèves'], 0, [Cm(7.4), Cm(9.6)], hauteur=Cm(1.0),
          remplis=[["Heure d'arrivée du camion", ''],
                   ["Fournisseur (qui envoie la marchandise)", ''],
                   ["Transporteur (qui conduit le camion)", ''],
                   ["Nombre de palettes", ''],
                   ["La règle de la maison", '']])
T.encadre('Deux mots à connaître :',
          "le fournisseur vend la marchandise à Picard. Le transporteur la conduit jusqu'au quai. Ce ne sont pas "
          "les mêmes entreprises : en cas de problème pendant le trajet, c'est au transporteur qu'on s'adresse.")
T.reflechir([
    "Le chef de quai écrit : « le froid d'abord, les papiers ensuite ». Avant de commencer, qu'est-ce que tu "
    "crois que cela veut dire ?",
])

# ==================================================================== étape 3
T.etape(3, "Lire les papiers avant d'ouvrir")
T.p("Dans le menu de gauche, clique sur « Quai de réception ». Tu es à l'étape ① « Le camion arrive » : le "
    "camion est à quai, portes fermées. Le chauffeur te tend deux papiers : le bon de livraison (BL) et le ticket "
    "de l'enregistreur de température.")
T.encadre_liste('Trois mots à connaître :', [
    "enregistreur de température : un appareil du camion qui mesure la température de l'air dans la remorque, "
    "toutes les 15 minutes, et l'imprime sur un ticket ;",
    "consigne : la température que le camion doit tenir pendant le trajet ;",
    "horloge du quai : elle avance seulement quand tu fais un geste. Chaque geste coûte du temps (il est écrit "
    "sur le bouton).",
])
T.consignes([
    "Lis le bon de livraison : il dit ce que le fournisseur a envoyé.",
    "Clique sur « Lire le ticket » (2 min). Lis toutes les lignes, de haut en bas.",
    "Sous le ticket, choisis ce qu'il montre.",
    "Ne clique pas encore sur « Oui, vous pouvez ouvrir et décharger ».",
])
T.faits([
    "Numéro du bon de livraison",
    "Température de consigne écrite sur le ticket",
    "À quelle heure la température commence-t-elle à remonter ?",
    "Quelle est la température la plus haute du ticket ?",
    "À quelle heure revient-elle sous la consigne ?",
])
T.encadre_liste('Ce que tu dois voir :', [
    "l'horloge du quai a avancé de 2 minutes ;",
    "ta réponse reste cochée sous le ticket. Le logiciel ne te dit pas tout de suite si elle est juste : tu le "
    "verras dans ton bilan, à la fin.",
])
T.reflechir([
    "Pourquoi as-tu lu le ticket AVANT de faire ouvrir le camion, et pas après ?",
])

# ==================================================================== étape 4
T.etape(4, "Compter chaque palette")
T.p("Clique sur « Oui, vous pouvez ouvrir et décharger ». La porte se lève : regarde la jauge « Temps hors froid "
    "du lot », en haut. Elle démarre maintenant. Quand les palettes sont posées, clique sur « Contrôler les "
    "palettes → ».")
T.encadre('À savoir :',
          "le quai est réfrigéré (+4 °C), mais c'est bien plus chaud que le camion. Dès que la porte s'ouvre, tout "
          "le lot sort du froid. Le repère de l'exercice : moins de 30 minutes hors froid.")
T.p("Tu es à l'étape ③. Une palette est faite de couches de cartons posées les unes sur les autres. Pour la "
    "compter sans compter chaque carton :", apres=4)
T.consignes([
    "Clique sur l'onglet de la palette (P1, P2…).",
    "Clique sur « Faire le tour de la palette » pour voir ses quatre côtés.",
    "Compte les cartons d'une couche complète, puis le nombre de couches.",
    "Regarde bien la couche du dessus : compte les cartons qui manquent.",
    "Remplis les trois cases à l'écran, puis le total. Clique sur « Noter le comptage ».",
])
T.encadre_liste('Un exemple, avec d\'autres chiffres que les tiens :', [
    "une couche complète de 3 × 2 = 6 cartons, et 5 couches : 6 × 5 = 30 cartons ;",
    "s'il manque 2 cartons sur la couche du dessus : 30 − 2 = 28 cartons.",
])
T.tableau(['Palette', 'Cartons par couche', 'Couches', 'Manquants dessus', 'Total compté', 'BL'], 0,
          [Cm(1.8), Cm(3.4), Cm(2.4), Cm(3.4), Cm(3.0), Cm(3.0)], hauteur=Cm(1.0),
          remplis=[[x, '', '', '', '', ''] for x in PALETTES])
T.reflechir([
    "Pour la palette la plus difficile à compter, comment as-tu fait ?",
])

# ==================================================================== étape 5
T.etape(5, "Contrôler et décider")
T.p("Toujours à l'étape ③, palette par palette. Le comptage ne suffit pas : un carton peut être abîmé, chaud ou "
    "ne pas être le bon produit. Pour chaque palette :", apres=4)
T.consignes([
    "Fais le tour complet de la palette : regarde l'état des cartons sur chaque côté.",
    "Clique sur « Sonder à cœur » (1 min) et note la température.",
    "Clique sur l'étiquette d'un carton pour la lire de près. Compare la référence avec le BL.",
    "Choisis une décision et un motif dans les deux menus.",
    "Clique sur « Valider cette palette ».",
])
T.encadre('Sonder à cœur :',
          "planter une sonde au centre d'un carton. On lit la température du produit lui-même, pas celle de l'air.")
T.encadre_liste('Règle du quai pour la température à cœur (règle de l\'exercice) :', [
    "−18 °C ou plus froid : on accepte ;",
    "entre −18 °C et −15 °C : on accepte avec réserves, en écrivant la température relevée ;",
    "plus chaud que −15 °C : on refuse.",
])
T.tableau(['Palette', 'T° à cœur', 'Référence lue = BL ?', 'État des cartons', 'Décision — motif'], 0,
          [Cm(1.8), Cm(2.4), Cm(3.4), Cm(3.6), Cm(5.8)], hauteur=Cm(1.15),
          remplis=[[x, '', '', '', ''] for x in PALETTES])
T.saut_avant()
T.encadre_liste('Ce que tu dois voir :', [
    "l'onglet de la palette passe à « ✓ validée » ;",
    "le logiciel passe tout seul à la palette suivante ;",
    "le bouton « Valider cette palette » reste gris tant que le comptage, la décision et le motif ne sont pas faits.",
])
T.encadre_liste('Tu peux passer à l\'étape 6 quand :', [
    "les cinq onglets sont à « ✓ validée » ;",
    "ton tableau de la page précédente est rempli.",
])
T.reflechir([
    "Pour une palette que tu as refusée, qu'est-ce qui t'a décidé ?",
    "Quel geste t'a fait découvrir un problème que tu n'aurais pas vu sans lui ?",
])

# ==================================================================== étape 6
T.etape(6, "Le froid d'abord, les papiers ensuite")
T.p("En haut à droite, clique sur « Contrôles terminés → réserves et chambre froide », puis confirme. Tu es à "
    "l'étape ④. Il reste trois choses à faire : rentrer le lot, écrire les réserves, faire signer le chauffeur.")
T.encadre('Une réserve :',
          "c'est ce que tu écris sur le BL, devant le chauffeur, quand quelque chose ne va pas. Elle doit être "
          "précise : quelle palette, quoi, combien.")
T.consignes([
    "Lis la règle du quai affichée en haut de l'étape ④.",
    "Fais les trois gestes dans l'ordre que tu choisis : « Rentrer le lot accepté en chambre froide », remplir "
    "tes réserves puis « Écrire les réserves sur le BL », « Faire signer le chauffeur ».",
    "Note dans le tableau ce que tu as écrit dans chaque case de réserve.",
])
T.tableau(['Palette', 'Décision', 'Ce que tu as écrit (nombre, température ou référence)'], 0,
          [Cm(2.0), Cm(4.4), Cm(10.6)], hauteur=Cm(1.0),
          remplis=[['', '', ''] for _ in range(4)])
T.faits([
    "Temps hors froid du lot quand il entre en chambre froide",
    "Que deviennent les palettes refusées ?",
])
T.encadre_liste('Ce que tu dois voir :', [
    "la jauge « Temps hors froid du lot » s'arrête quand le lot entre en chambre froide ;",
    "tes réserves s'écrivent en toutes lettres sur le BL ;",
    "après la signature, ton bilan s'affiche en bas de l'écran.",
])
T.reflechir([
    "Qu'est-ce qui t'a fait perdre le plus de temps hors froid pendant ta réception ?",
])

# ==================================================================== étape 7
T.etape(7, "Lire ton bilan")
T.p("Le bilan compare, ligne par ligne, ce que tu as fait et ce qui était attendu. Chaque ligne finit par "
    "« ✓ juste » ou « ✗ à revoir ». Lis-le en entier, jusqu'au « Bon à savoir ».")
T.faits([
    "Combien de lignes sont marquées « ✗ à revoir » ?",
    "Temps réel passé (écrit sous le bilan)",
    "Dans combien de jours faut-il confirmer une réserve au transporteur ?",
    "Pour quelles palettes faudra-t-il envoyer cette lettre ?",
])
T.encadre('Le « Bon à savoir » :',
          "la réserve écrite sur le BL ne suffit pas toujours. Pour un carton abîmé ou manquant, il faut la "
          "confirmer au transporteur par lettre recommandée. C'est la loi (Code de commerce, article L133-3).")
T.reflechir([
    "Choisis une ligne « à revoir » de ton bilan (ou, si tout est juste, le geste qui t'a le plus aidé). "
    "Qu'aurais-tu fait autrement ?",
    "Les palettes refusées repartent dans le camion. Qui faut-il prévenir chez Picard ?",
])

NOTIONS = [["Un produit surgelé doit être conservé", "Chaîne du froid",
            "Un surgelé se conserve à −18 °C ou plus froid, en tout point du produit (directive 89/108/CEE). "
            "Une remontée brève jusqu'à −15 °C est tolérée au chargement et au déchargement."]]
T.finir('ENT-4.1', 'Picard — le premier camion', 'ENT-4.1-picard-premier-camion-trame-eleve', NOTIONS,
        os.path.basename(__file__))
