# -*- coding: utf-8 -*-
"""Trame élève Cdiscount — séance ENT-2.3 « Inventaire tournant » (entraînement, C1.6).

Écrite le 04/10/2026 par Cowork (brief `docs/briefs/ENT-2.3-inventaire-recadre.md`, § 10 : trame nouvelle). Fonctions
communes : `trame_commun.py`. Libellés relevés en jouant la séance sur la page d'essai le 04/10/2026 (liste de trois
références, l'aléa qui ramène la quatrième, comptage, écarts, recomptage, décisions, taux, validation).

Entraînement : la trame guide moins qu'en ENT-2.1 (elle donne la méthode, pas les gestes un à un), mais l'élève doit
toujours pouvoir avancer seul. Elle ne dit ni les écarts, ni leurs causes, ni les décisions. Le mot « Absent »
n'est écrit nulle part (c'est l'enseignant qui le dit à l'élève qui a manqué ENT-2.2 : fiche d'intention).
Corrigé : `contenus/corriges/ENT-2.3.js` (réponses dans `corriges_cdiscount.py`).
"""
import os
from docx.shared import Cm
import trame_commun as T
import corriges_data, corriges_cdiscount

CODE = 'ENT-2.3'
corriges_data._DICOS[CODE] = [corriges_cdiscount.ENT_2_3]
LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'cdiscount.png')

T.nouveau()
T.entete(LOGO, "ENT-2.3 — Carnet de suivi : inventaire tournant", [
    ('Ce document est ta trame de travail :',
     "tu peux le suivre seul, étape par étape. Garde à côté de toi ta trame d'ENT-2.2 : tu as besoin de ta liste "
     "de références à recompter."),
    ('Ce que ton enseignant voit dans son suivi :',
     "cinq points : ton comptage, tes écarts, tes décisions (deux points) et ton taux d'écart. À la fin, le "
     "logiciel te montre ta correction détaillée."),
    ('Ce qui est vrai, ce qui est construit :',
     "Cdiscount, son entrepôt de Cestas et la méthode de l'inventaire tournant sont réels. Les quantités, les "
     "messages et les personnes de l'équipe sont construits pour l'exercice."),
], [
    ('L\'inventaire, à quoi ça sert ?', 'Sur Internet'),
    ('Redonner ta liste à Nadia', 'Dans Prepalog'),
    ('Lire le relevé et les messages', 'Dans Prepalog'),
    ('Reporter le comptage', 'Dans Prepalog'),
    ('Calculer les écarts', 'Dans Prepalog'),
    ('Chercher la cause et décider', 'Dans Prepalog'),
    ('Calculer le taux et valider', 'Dans Prepalog'),
])

# ==================================================================== étape 1
T.etape(1, "L'inventaire, à quoi ça sert ?")
T.p("Aujourd'hui, tu fais l'inventaire d'une partie de l'allée A. Avant d'ouvrir le logiciel, cherche ce que dit "
    "la loi et comment travaillent les entrepôts.")
T.consignes([
    "Cherche « inventaire tournant définition » et ouvre une page qui l'explique.",
    "Cherche « Code de commerce article L123-12 » (site Légifrance ou une page qui le cite).",
    "Réponds aux questions ci-dessous.",
])
T.questions([("Qu'est-ce qu'un inventaire tournant ?", 2)])
T.faits([
    "D'après l'article L123-12, tous les combien faut-il faire un inventaire, au moins ?",
])
T.qcm([
    ("La démarque inconnue, c'est :",
     ["une perte de stock dont on ne connaît pas la cause", "une casse constatée par écrit", "une baisse de prix"], 0),
])
T.reflechir([
    "D'après ce que tu as trouvé, pourquoi un entrepôt qui expédie tous les jours préfère-t-il l'inventaire "
    "tournant à un grand inventaire une fois par an ?",
])

# ==================================================================== étape 2
T.etape(2, "Redonner ta liste à Nadia")
T.p("Ouvre l'activité « Cdiscount — inventaire tournant ». Si tu cliques sur « Inventaire », l'écran est en "
    "attente : il lui faut d'abord ta liste.")
T.consignes([
    "Dans « Messagerie », ouvre « Inventaire de l'allée A : votre liste » et clique sur « Répondre ».",
    "La ligne « À recompter : » est déjà écrite. Complète-la avec ta liste d'ENT-2.2 (le cadre « Ma liste de "
    "références à recompter »), références séparées par des virgules. Envoie.",
])
T.encadre('Tu n\'as pas fait la séance ENT-2.2 ?',
          "Demande à ton enseignant ce que tu dois répondre à Nadia.")
T.encadre_liste('Ce que tu dois voir :', [
    "Nadia répond : « C'est noté : vous recomptez … » ;",
    "le relevé de l'équipe inventaire et un message de mission arrivent ;",
    "d'autres messages peuvent arriver : lis-les tous. Si un préparateur te demande de vérifier un rayon, cette "
    "référence s'ajoute à ton comptage.",
])
T.encadre('Attention :', "seule ta première liste reconnue compte. Relis-la avant d'envoyer.")
T.tableau(['Ce que tu relèves', 'Références'], 0, [Cm(7.0), Cm(10.0)], hauteur=Cm(1.1),
          remplis=[['Les références que Nadia confirme', ''],
                   ['Les références ajoutées par un message (s\'il y en a)', '']])
T.reflechir([
    "Un message t'a-t-il ajouté une référence ? Explique pourquoi elle manquait à ta liste, ou pourquoi ta liste "
    "était complète.",
])

# ==================================================================== étape 3
T.etape(3, "Lire le relevé et les messages")
T.p("Lis la mission de Nadia (« Inventaire de l'allée A : c'est pour vous »), puis le relevé de comptage. Lis "
    "ensuite tous les autres messages : ils te serviront à trouver la cause des écarts.")
T.encadre('Un mot de métier :',
          "un comptage à l'aveugle se fait sans voir le stock du système, pour ne pas être influencé. Le logiciel "
          "cache ce stock jusqu'à ce que tu valides ton comptage.")
T.faits([
    "Date du dernier inventaire de l'allée A",
    "Numéro de la campagne d'inventaire",
    "Que dit la note du relevé sur l'emplacement A-01-1 ?",
    "Que dit la note du relevé sur l'emplacement A-04-2 ?",
])
T.p("Les messages de l'équipe (sans compter ceux de Nadia et le relevé) :", taille=10.5, gras=True, avant=2, apres=4)
T.tableau(['De qui ?', 'Article(s) concerné(s)', 'Ce que dit le message, en quelques mots'], 6,
          [Cm(4.0), Cm(4.0), Cm(9.0)], hauteur=Cm(1.05))
T.reflechir([
    "Parmi ces messages, lequel te paraît le plus utile pour ton inventaire ? Explique.",
])

# ==================================================================== étape 4
T.etape(4, "Reporter le comptage")
T.consignes([
    "Clique sur « Inventaire » (sous « Articles »). Tu es à l'étape « 1. Saisir le comptage ».",
    "L'écran ne montre que tes références. Pour chacune, recopie dans « Compté » la quantité du relevé, au même "
    "emplacement.",
    "Vérifie chaque ligne, puis clique sur « Valider le comptage ».",
])
T.tableau(['Emplacement', 'Référence', 'Compté (relevé)'], 0, [Cm(4.0), Cm(7.0), Cm(6.0)], hauteur=Cm(0.85),
          remplis=[['', '', ''] for _ in range(9)])
T.encadre_liste('Ce que tu dois voir :', [
    "la colonne « Stock système » dit « caché » pendant que tu saisis ;",
    "après la validation, tu passes à « 2. Constater les écarts » et le stock du système apparaît ;",
    "le comptage est clos : pour vérifier une quantité, il faudra demander un recomptage.",
])
T.reflechir([
    "Pourquoi l'équipe compte-t-elle sans voir le stock du système ?",
])

# ==================================================================== étape 5
T.etape(5, "Calculer les écarts")
T.encadre_liste('Calculer un écart :', [
    "écart = compté − système ;",
    "un manque donne un écart négatif (on a moins que le système), un surplus un écart positif ;",
    "exemple, sur d'autres chiffres : système 50, compté 46, écart −4.",
])
T.consignes([
    "Recopie pour chaque ligne le stock système et le compté, puis calcule l'écart.",
    "Écris tes écarts dans la colonne « Écart » de l'écran, avec leur signe, puis clique sur « Traiter les "
    "écarts → ».",
])
T.tableau(['Référence', 'Système', 'Compté', 'Écart (compté − système)'], 0,
          [Cm(5.6), Cm(3.4), Cm(3.4), Cm(4.6)], hauteur=Cm(0.85),
          remplis=[['', '', '', ''] for _ in range(9)])
T.faits(["Combien de tes références ont un écart différent de 0 ?"])
T.reflechir([
    "Regarde tes écarts ensemble, pas un par un. Que remarques-tu ?",
])

# ==================================================================== étape 6
T.etape(6, "Chercher la cause et décider")
T.p("Avant de toucher au stock, cherche la cause de chaque écart. Un écart n'est pas toujours une perte.")
T.encadre_liste('Où chercher :', [
    "« voir les mouvements » sur la ligne : tout ce qui est entré et sorti depuis le dernier inventaire ;",
    "tes messages (étape 3) : un rangement douteux, une annulation, une remise en rayon ;",
    "les autres lignes : un écart sur un article peut en cacher un autre.",
])
T.encadre_liste('Les trois décisions de l\'écran :', [
    "« Régulariser le stock du système » : on corrige le chiffre du système, avec un motif. À faire seulement "
    "quand plus rien n'explique l'écart ;",
    "« Ne pas régulariser : remettre la marchandise en rayon » : la marchandise existe, elle est au mauvais "
    "endroit ;",
    "« Demander un recomptage » : on doute du comptage lui-même. Le nouveau chiffre s'affiche sous l'écart.",
])
T.tableau(['Référence', 'Écart', 'Cause trouvée (mouvement ou message)', 'Ma décision (et motif)'], 0,
          [Cm(3.6), Cm(1.8), Cm(6.6), Cm(5.0)], hauteur=Cm(1.25),
          remplis=[['', '', '', ''] for _ in range(6)])
T.saut_avant()
T.encadre('Attention :',
          "une régularisation change le stock pour de bon. Après « Valider l'inventaire → », relis l'encadré « Ce "
          "qui partira dans les Mouvements du Stock » avant de valider.")
T.reflechir([
    "Pour une référence que tu n'as pas régularisée, qu'est-ce qui t'a convaincu ?",
    "Pour la référence que tu as régularisée (s'il y en a une), comment as-tu su que plus rien n'expliquait "
    "l'écart ?",
])

# ==================================================================== étape 7
T.etape(7, "Calculer le taux et valider")
T.p("Le taux d'écart dit si l'inventaire est bon : plus il est petit, plus le stock du système est fiable.")
T.encadre_liste('Le taux d\'écart (règle de l\'écran) :', [
    "on additionne les écarts sans leur signe (−3 compte 3), avant traitement ;",
    "on divise par la somme des stocks système des lignes comptées, puis on multiplie par 100 ;",
    "on arrondit au dixième. Exemple, sur d'autres chiffres : écarts −4 et +1, stocks 50 et 30 : "
    "5 ÷ 80 × 100 = 6,25, soit 6,3 %.",
])
T.tableau(['Ce que je calcule', 'Mon calcul', 'Résultat'], 0, [Cm(7.2), Cm(6.0), Cm(3.8)], hauteur=Cm(1.05),
          remplis=[['Somme des écarts, sans leur signe', '', ''],
                   ['Somme des stocks système', '', ''],
                   ['Taux d\'écart (%), arrondi au dixième', '', '']])
T.consignes([
    "Écris ton taux dans « Taux d'écart (%) », relis tes décisions, puis clique sur « Valider définitivement "
    "l'inventaire ».",
    "Lis ta correction en entier : pour chaque référence, la colonne « Ce qu'il fallait voir ».",
])
T.faits([
    "Combien de décisions justes sur combien ?",
    "Ton taux d'écart est-il juste ?",
])
T.reflechir([
    "Lis « Ce qu'il fallait voir » pour une ligne de ta correction. Qu'as-tu appris que tu n'avais pas vu ?",
])

NOTIONS = [["La démarque inconnue, c'est", "Démarque inconnue",
            "La démarque inconnue est la différence entre le stock du système et le stock réel quand on n'en "
            "connaît pas la cause (vol, erreur non retrouvée, perte). La démarque connue a une cause identifiée "
            "(casse constatée, produit périmé)."]]
# Feuille à détacher (cours + activité à la maison), décision de Tristan du 04/10/2026 :
# contenu dans `feuilles_detachables.py`.
T.feuille_detachable('ENT-2.3')

T.finir(CODE, 'Cdiscount — inventaire tournant', 'ENT-2.3-cdiscount-inventaire-trame-eleve', NOTIONS,
        os.path.basename(__file__), fichier=CODE)
