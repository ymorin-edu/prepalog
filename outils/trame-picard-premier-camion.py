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
    ('Contrôler la première palette, P1', 'Dans Prepalog'),
    ('Contrôler les palettes P2 à P5', 'Dans Prepalog'),
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
# Réécrite le 04/10/2026 (Cowork) pour le nouveau poste du quai : fiche de contrôle, zone de calcul, décision en
# boutons, ordre ① Compter → ② Sonder et lire l'étiquette → ③ Ma fiche de contrôle → ④ Décider (brief
# MOTEUR-quai-fiche-controle.md). Choix de Tristan : la trame suit l'écran, P1 guidée bloc par bloc, puis P2 à P5.
# Libellés repris de core/types/quai.js, pas encore vus à l'écran par Cowork.
T.etape(4, "Contrôler la première palette, P1")
T.p("Clique sur « Oui, vous pouvez ouvrir et décharger ». La porte se lève : la jauge « Temps hors froid du lot », "
    "en haut, démarre maintenant. Quand les palettes sont posées, clique sur « Contrôler les palettes → ».")
T.encadre('À savoir :',
          "le quai est réfrigéré (+4 °C), mais c'est bien plus chaud que le camion. Dès que la porte s'ouvre, tout "
          "le lot sort du froid. Le repère de l'exercice : moins de 30 minutes hors froid.")
T.p("Tu es à l'étape ③. À gauche, la palette. À droite, quatre blocs numérotés : fais-les dans l'ordre, de haut "
    "en bas.", apres=4)
T.consignes([
    "Clique sur l'onglet P1, puis sur « Faire le tour de la palette » pour voir ses quatre côtés.",
    "Bloc ① Compter : dans la zone de calcul, remplis B1, B2 et B3. En B4, écris la formule (le rappel te montre comment).",
    "Écris toi-même le résultat dans la case « Total », puis appuie sur Entrée.",
    "Bloc ② : clique sur « Sonder à cœur ». Puis clique sur l'étiquette d'un carton, sur la palette.",
    "Bloc ③ « Ma fiche de contrôle » : note ce que tu as relevé. Une case sans problème reste vide.",
    "Bloc ④ Décider : clique sur une décision. Pour une réserve ou un refus, coche le motif. Puis « ✓ Valider P1 ».",
])
T.encadre_liste('Trois mots à connaître :', [
    "une couche : un étage de cartons sur la palette ;",
    "sonder à cœur : planter une sonde au centre d'un carton. On lit la température du produit, pas celle de l'air ;",
    "la fiche de contrôle : tes notes. Personne ne les corrige, mais tu les reporteras sur le bon de livraison.",
])
T.encadre_liste('Règle du quai pour la température à cœur (règle de l\'exercice) :', [
    "−18 °C ou plus froid : on accepte ;",
    "entre −18 °C et −15 °C : on accepte avec réserves, en écrivant la température relevée ;",
    "plus chaud que −15 °C : on refuse.",
])
T.encadre_liste('Ce que tu dois voir :', [
    "après Entrée dans « Total » : « Comptage noté : … cartons (BL : …) » ;",
    "le thermomètre cherche sa valeur, puis affiche la température à cœur ;",
    "si tu valides trop tôt, un message sous la case te dit ce qui manque ;",
    "une fois validée, un résumé « ✓ P1 validée » et un bouton « Modifier ».",
])
T.encadre_liste('Tu peux passer à l\'étape 5 quand :', [
    "l'onglet P1 affiche « ✓ validée ».",
])
T.reflechir([
    "Sur P1, la couche du dessus n'est pas complète. Comment as-tu su s'il manquait des cartons ou non ?",
])

# ==================================================================== étape 5
T.etape(5, "Contrôler les palettes P2 à P5")
T.p("Clique sur « Palette suivante : P2 → ». Refais les quatre blocs, dans le même ordre, pour chaque palette. "
    "Le comptage ne suffit pas : un carton peut être abîmé, trop chaud ou ne pas être le bon produit. Remplis le "
    "tableau au fur et à mesure (recopie aussi P1).", apres=4)
T.encadre_liste('Pour chaque palette, n\'oublie aucun geste :', [
    "fais le tour complet : chaque côté peut montrer quelque chose ;",
    "sonde à cœur ;",
    "lis l'étiquette et compare-la au BL (« Revoir le bon de livraison », au-dessus de la palette) ;",
    "note tes constats sur ta fiche de contrôle.",
])
T.tableau(['Palette', 'Total compté', 'BL', 'T° à cœur', 'Référence lue = BL ?', 'Endommagés', 'Décision — motif'], 0,
          [Cm(1.6), Cm(1.9), Cm(1.4), Cm(2.0), Cm(2.6), Cm(2.6), Cm(4.9)], hauteur=Cm(1.0),
          remplis=[[x, '', '', '', '', '', ''] for x in PALETTES])
T.encadre_liste('Tu peux passer à l\'étape 6 quand :', [
    "les cinq onglets sont à « ✓ validée » (sous P5, « Palette suivante » est remplacé par « Contrôles terminés ») ;",
    "ton tableau est rempli.",
])
T.reflechir([
    "Pour une palette que tu as refusée, qu'est-ce qui t'a décidé ?",
    "Quel geste t'a fait découvrir un problème que tu n'aurais pas vu sans lui ?",
])

# ==================================================================== étape 6
T.etape(6, "Le froid d'abord, les papiers ensuite")
T.p("Clique sur « Contrôles terminés → réserves et chambre froide », puis confirme. Tu es à l'étape ④. Il reste "
    "trois choses à faire : rentrer le lot, écrire les réserves, faire signer le chauffeur.")
T.encadre('Une réserve :',
          "c'est ce que tu écris sur le BL, devant le chauffeur, quand quelque chose ne va pas. Elle doit être "
          "précise : quelle palette, quoi, combien.")
T.consignes([
    "Lis la règle du quai affichée en haut de l'étape ④.",
    "À gauche, sous la chambre froide, relis ta fiche de contrôle : c'est elle que tu reportes dans tes réserves.",
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
# Feuille à détacher (cours + activité à la maison), décision de Tristan du 04/10/2026 :
# contenu dans `feuilles_detachables.py`.
T.feuille_detachable('ENT-4.1')

T.finir('ENT-4.1', 'Picard — le premier camion', 'ENT-4.1-picard-premier-camion-trame-eleve', NOTIONS,
        os.path.basename(__file__))
