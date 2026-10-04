# -*- coding: utf-8 -*-
"""Trame élève Picard — séance ENT-4.2 « deux camions, un seul quai » (entraînement, C1.4 + C1.3).

Écrite le 03/10/2026 par Cowork, après la livraison de la séance. Mêmes règles que les autres trames
(fiche `prepalog-trames-eleve`) ; fonctions communes dans `trame_commun.py`.

Pas à pas : la trame ne dit pas quel camion décharger d'abord, ni que le froid du camion de glaces
faiblit, ni quelles palettes posent problème. Elle fait lire les deux tickets, demande un choix et sa
raison, puis fait réceptionner un camion après l'autre. L'élève peut avoir choisi l'un ou l'autre
camion en premier : les tableaux des étapes 4 et 5 ne pré-impriment donc pas les palettes.
Entraînement = pas d'aide à l'écran, seul le bilan final dit juste / faux : la trame rappelle les gestes
et la règle du quai, c'est tout.
Le corrigé de la trame va dans `contenus/corriges/ENT-4.2-trame.js`.
"""
import os
from docx.shared import Cm
import trame_commun as T

LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'picard.png')

T.nouveau()
T.entete(LOGO, "ENT-4.2 — Carnet de suivi : deux camions, un seul quai", [
    ('Ce document est ta trame de travail :',
     "tu peux le suivre seul, étape par étape. Aujourd'hui, le logiciel ne t'aide pas pendant le travail : "
     "il ne te dit si c'est juste qu'à la fin, dans ton bilan."),
    ('Ce que ton enseignant voit dans son suivi :',
     "30 points, qui donnent une note sur 20 : ton choix de l'ordre des camions et sa raison, les deux tickets, "
     "le comptage et la décision de chaque palette, tes réserves, les deux signatures et les deux lots rentrés "
     "en chambre froide. Tes réponses écrites ici servent à réfléchir."),
    ('Ce qui est vrai, ce qui est inventé :',
     "Picard, son entrepôt de Sainghin-en-Mélantois et le contrôle de la température à chaque réception sont "
     "réels. Le quai 32, les deux fournisseurs, les deux transporteurs, les produits, les températures et les "
     "durées sont inventés pour l'exercice."),
], [
    ('Comprendre le camion frigorifique', 'Sur Internet'),
    ('Ouvrir son environnement et lire le message', 'Dans Prepalog'),
    ('Lire les deux tickets et choisir l\'ordre', 'Dans Prepalog'),
    ('Réceptionner le premier camion', 'Dans Prepalog'),
    ('Réceptionner le second camion', 'Dans Prepalog'),
    ('Lire ton bilan', 'Dans Prepalog'),
])

# ==================================================================== étape 1
T.etape(1, "Comprendre le camion frigorifique")
T.p("Ce matin, deux camions frigorifiques attendent au quai 32. Avant d'ouvrir le logiciel, comprends comment "
    "un camion garde le froid. Fais une recherche sur Internet.")
T.consignes([
    "Cherche « groupe froid camion frigorifique ».",
    "Cherche ensuite « enregistreur de température transport surgelés ».",
    "Réponds aux questions ci-dessous avec ce que tu trouves.",
])
T.questions([
    ("À quoi sert le groupe froid d'un camion frigorifique ?", 2),
    ("Que mesure l'enregistreur de température d'un camion ?", 2),
])
T.qcm([
    ("Le groupe froid d'un camion tombe en panne pendant le trajet. Sur le ticket de l'enregistreur, on voit :",
     ["la température qui monte", "la température qui descend", "rien de spécial"], 0),
])
T.faits([
    "Que veut dire « sonder à cœur » ?",
])
T.reflechir([
    "Un camion arrive avec un ticket parfait. Pourquoi faut-il quand même sonder ses palettes ?",
])

# ==================================================================== étape 2
T.etape(2, "Ouvrir son environnement et lire le message")
T.p("Connecte-toi à Prepalog, ouvre la rubrique Simulog, puis l'activité « Picard — deux camions, un seul "
    "quai ». Dans le menu de gauche, clique sur « Messagerie » et ouvre le message du chef de quai : « Quai 32 : "
    "deux camions ce matin ».")
T.tableau(['Information', 'Premier camion arrivé', 'Second camion arrivé'], 0, [Cm(5.6), Cm(5.7), Cm(5.7)],
          hauteur=Cm(1.0),
          remplis=[["Heure d'arrivée", '', ''],
                   ["Fournisseur", '', ''],
                   ["Transporteur", '', ''],
                   ["Nombre de palettes", '', ''],
                   ["Ce qu'il transporte", '', '']])
T.faits([
    "Combien de quais as-tu pour décharger ?",
    "Que dois-tu lire avant de décider de l'ordre ?",
])
T.encadre('Organiser la réception :',
          "avec un seul quai, on ne décharge qu'un camion à la fois. L'autre attend porte fermée. Le chef de quai "
          "te laisse décider lequel passe en premier : c'est à toi d'organiser la réception.")
T.reflechir([
    "Avant d'avoir vu les tickets, quel camion aurais-tu fait décharger en premier ? Explique ton idée.",
])

# ==================================================================== étape 3
T.etape(3, "Lire les deux tickets et choisir l'ordre")
T.p("Dans le menu de gauche, clique sur « Quai de réception ». Tu es à l'étape ① « Les camions arrivent ». Les "
    "deux camions sont présentés l'un sous l'autre, chacun avec son bon de livraison et son ticket.")
T.consignes([
    "Clique sur « Lire le ticket du camion … » pour le premier camion (2 min), puis pour le second.",
    "Lis chaque ticket en entier, surtout la dernière heure avant l'arrivée.",
    "Sous chaque ticket, choisis ce qu'il montre.",
    "Note ci-dessous les dernières températures de chaque ticket.",
])
T.tableau(['Heure', 'Camion Glaces Néviane', 'Camion Légumes d\'Orvalle'], 0, [Cm(3.0), Cm(7.0), Cm(7.0)],
          hauteur=Cm(0.85),
          remplis=[['05:00', '', ''], ['05:30', '', ''], ['05:45', '', ''], ['06:00', '', ''],
                   ['Ce que montre le ticket', '', '']])
T.saut_avant()   # coupure choisie : lire les tickets / choisir l'ordre
T.p("Quand les deux tickets sont lus, une question apparaît : « Quel camion faites-vous décharger en premier ? ». "
    "Choisis un camion, puis la phrase qui explique ton choix.", apres=4)
T.faits([
    "Le camion que tu fais décharger en premier",
    "La raison que tu as choisie",
])
T.encadre_liste('Ce que tu dois voir :', [
    "l'horloge du quai a avancé de 4 minutes (deux tickets) ;",
    "un bouton « Oui, vous pouvez ouvrir et décharger » au nom du camion choisi ;",
    "aucune note : ton choix sera jugé dans le bilan.",
])
T.reflechir([
    "Qu'est-ce qui, sur les tickets, t'a fait choisir ton premier camion ?",
    "Compare avec ta réponse de l'étape 2. As-tu changé d'avis ? Explique.",
])

# ==================================================================== étape 4
T.etape(4, "Réceptionner le premier camion")
T.p("Clique sur « Oui, vous pouvez ouvrir et décharger ». Le temps hors froid de CE lot démarre ; l'autre camion "
    "attend porte fermée. Quand les palettes sont posées, clique sur « Contrôler les palettes → ».")
T.encadre_liste('Les gestes, pour chaque palette (pas d\'aide aujourd\'hui) :', [
    "fais le tour complet : chaque côté peut montrer quelque chose ;",
    "sonde à cœur ;",
    "lis l'étiquette et compare-la au BL. Si une étiquette est illisible, cherche-en une autre ;",
    "compte. Si le BL a deux lignes pour la même palette, compte chaque référence à part ;",
    "décide (décision + motif), puis « Valider cette palette ».",
])
T.encadre_liste('Règle du quai pour la température à cœur (règle de l\'exercice) :', [
    "−18 °C ou plus froid : on accepte ;",
    "entre −18 °C et −15 °C : on accepte avec réserves, en écrivant la température relevée ;",
    "plus chaud que −15 °C : on refuse.",
])
T.tableau(['Palette', 'Cartons comptés', 'BL', 'T° à cœur', 'Étiquette = BL ?', 'Décision — motif'], 0,
          [Cm(1.8), Cm(2.6), Cm(1.6), Cm(2.2), Cm(2.8), Cm(6.0)], hauteur=Cm(1.05),
          remplis=[['', '', '', '', '', ''] for _ in range(5)])
T.saut_avant()
T.p("Clique sur « Contrôles terminés → réserves et chambre froide », puis confirme. À l'étape ④ :", apres=4)
T.consignes([
    "Rentre le lot accepté en chambre froide.",
    "Remplis tes réserves, puis « Écrire les réserves sur le BL ».",
    "Clique sur « Faire signer le chauffeur ». Le camion repart.",
])
T.faits([
    "Temps hors froid de ce lot quand il entre en chambre froide",
    "Combien de lignes as-tu écrites sur le BL ?",
])
T.encadre_liste('Tu peux passer à l\'étape 5 quand :', [
    "le chauffeur a signé et son camion est « reparti » ;",
    "le message « Le camion … repart, le quai est libre » s'affiche.",
])
T.reflechir([
    "Quelle palette de ce camion t'a demandé le plus de réflexion pour décider ? Explique.",
])

# ==================================================================== étape 5
T.etape(5, "Réceptionner le second camion")
T.p("Clique sur « Faire mettre à quai le camion … et décharger ». La manœuvre prend 3 minutes, puis le "
    "déchargement commence. Mêmes gestes qu'à l'étape 4, palette par palette.")
T.tableau(['Palette', 'Cartons comptés', 'BL', 'T° à cœur', 'Étiquette = BL ?', 'Décision — motif'], 0,
          [Cm(1.8), Cm(2.6), Cm(1.6), Cm(2.2), Cm(2.8), Cm(6.0)], hauteur=Cm(1.05),
          remplis=[['', '', '', '', '', ''] for _ in range(5)])
T.p("Puis, à l'étape ④ : rentre le lot, écris tes réserves, fais signer le chauffeur.", apres=4)
T.faits([
    "Temps hors froid de ce second lot",
    "Que deviennent les palettes que tu as refusées ?",
])
T.encadre_liste('Ce que tu dois voir :', [
    "une jauge de temps hors froid par camion : chacune démarre à l'ouverture de SON camion ;",
    "après la seconde signature, ton bilan s'affiche en bas de l'écran.",
])
T.reflechir([
    "Ce camion a attendu porte fermée pendant toute ta première réception. Qu'est-ce que cette attente a changé "
    "pour lui ?",
])

# ==================================================================== étape 6
T.etape(6, "Lire ton bilan")
T.p("Le bilan compare, ligne par ligne, ce que tu as fait et ce qui était attendu. Chaque ligne finit par "
    "« ✓ juste » ou « ✗ à revoir ». Lis-le en entier.")
T.faits([
    "La ligne « Ordre de déchargement et justification » : juste ou à revoir ?",
    "Combien de lignes sont marquées « ✗ à revoir » ?",
    "Température à cœur des glaces quand tu les as sondées",
])
T.reflechir([
    "Si tu avais choisi l'autre camion en premier, qu'est-ce qui aurait changé pour les glaces ?",
    "Choisis une ligne « à revoir » de ton bilan (ou, si tout est juste, ta décision la plus difficile). "
    "Qu'aurais-tu fait autrement ?",
    "Dans une vraie entreprise, qui faut-il prévenir quand un camion arrive avec un groupe froid qui faiblit ?",
])

NOTIONS = [["Le groupe froid d'un camion tombe en panne", "Chaîne du froid — transport",
            "Sans groupe froid, rien ne retient la chaleur : la température de l'air de la remorque monte, et le "
            "ticket de l'enregistreur le montre (c'est à ça qu'il sert)."]]
T.finir('ENT-4.2', 'Picard — deux camions, un seul quai', 'ENT-4.2-picard-deux-camions-trame-eleve', NOTIONS,
        os.path.basename(__file__))
