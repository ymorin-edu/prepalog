# -*- coding: utf-8 -*-
"""Trame élève Cdiscount — séance ENT-2.1 « Le stock raconte » (guidage, C1.6).

Réécrite le 04/10/2026 par Cowork après le recadrage de la séance (brief `docs/briefs/ENT-2.1-recadrage.md`,
cadrage `prepalog-ent21-cadrage-detaille` du projet) : la commande annulée de la cliente, le constat de casse
de 2 boîtiers saisi −1, la 7e ligne « Ce qui cloche ». Fonctions communes : `trame_commun.py`.
Libellés relevés en jouant la séance sur la page d'essai (`outils/essai-cdiscount.html`), le 04/10/2026.

Les trois exigences :
  1. autonomie : chaque étape dit où cliquer et ce qu'on doit voir ; les mots du métier sont définis ;
  2. pas à pas : la trame ne cite ni le document en cause, ni le stock, ni les numéros à trouver (seule la
     commande de la cliente, qui est l'énoncé) ; la comparaison document / mouvement vient à l'étape 6 ;
  3. une analyse réflexive par étape, sur ce que l'élève vient de faire.

Le corrigé va dans `contenus/corriges/ENT-2.1.js` (déjà déclaré dans `activites/cdiscount-mouvements.js`).
Ses réponses sont dans `corriges_cdiscount.py`.
"""
import os
from docx.shared import Cm
from docx.enum.table import WD_ROW_HEIGHT_RULE
import trame_commun as T
import corriges_data, corriges_cdiscount

CODE = 'ENT-2.1'
corriges_data._DICOS[CODE] = [corriges_cdiscount.ENT_2_1]
LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'cdiscount.png')
LIGNES = ['Stock actuel :', 'Réception :', 'Commandes :', 'Retour :', 'Casse :',
          'Stock au dernier inventaire :', 'Ce qui cloche :']

T.nouveau()
T.entete(LOGO, "ENT-2.1 — Carnet de suivi : le stock raconte", [
    ('Ce document est ta trame de travail :',
     "tu peux le suivre seul, étape par étape. Chaque étape dit où cliquer et ce que tu dois voir à l'écran."),
    ('Ce que ton enseignant voit dans son suivi :',
     "six points, lus dans la réponse que tu envoies à ta cheffe d'équipe. Le logiciel ne te dit pas pendant la "
     "séance si tes réponses sont justes. Tes réponses écrites ici servent à réfléchir et à préparer ce message."),
    ('Ce qui est vrai, ce qui est construit :',
     "Cdiscount, son entrepôt de Cestas, sa filiale logistique, son logo et ses couleurs sont réels. Le reste est "
     "construit pour l'exercice : la cliente et sa commande, les articles et leurs marques, les fournisseurs, les "
     "numéros de documents, les quantités et les personnes de l'équipe. Le vrai entrepôt est bien plus grand : tu "
     "n'en vois qu'un rayon de petits articles."),
], [
    ('Découvrir Cdiscount', 'Sur Internet'),
    ('Lire la messagerie : le problème de ce matin', 'Dans Prepalog'),
    ('Relever le stock actuel et l\'envoyer', 'Dans Prepalog'),
    ('Lister les mouvements sur une fiche de stock', 'Dans Prepalog'),
    ('Relier chaque mouvement à son document', 'Dans Prepalog'),
    ('Comparer chaque document à son mouvement', 'Dans Prepalog'),
    ('Refaire le calcul à l\'envers', 'Dans Prepalog'),
    ('Répondre à Nadia Ferrand', 'Dans Prepalog'),
])

# ==================================================================== étape 1
T.etape(1, "Découvrir Cdiscount")
T.p("Cette séance se passe dans l'entrepôt de Cdiscount à Cestas, près de Bordeaux. Avant d'ouvrir le logiciel, "
    "découvre l'entreprise. Fais une recherche sur Internet.")
T.consignes([
    "Cherche « Cdiscount » et ouvre une page qui présente l'entreprise (par exemple Wikipédia).",
    "Cherche ensuite « C-Logistics Cdiscount Cestas » et ouvre un article qui parle de ses entrepôts.",
    "Réponds aux questions ci-dessous avec ce que tu trouves.",
])
T.faits([
    "En quelle année Cdiscount a-t-elle été créée ?",
    "Dans quelle ville a-t-elle été fondée ?",
    "Quel est le nom de sa filiale logistique ?",
    "Quels produits l'entrepôt de Cestas traite-t-il (quel poids) ?",
])
T.qcm([
    ("Cdiscount vend ses produits, mais aussi ceux de vendeurs indépendants sur son site. Comment appelle-t-on ce "
     "fonctionnement ?", ["une place de marché", "une franchise", "un grossiste"], 0),
])
T.encadre('Un mot à connaître :',
          "le Black Friday est une journée de grosses promotions, fin novembre. Pour un site de vente en ligne et "
          "ses entrepôts, c'est le début de la période la plus chargée de l'année, jusqu'à Noël.")
T.reflechir([
    "D'après ce que tu as trouvé, pourquoi une erreur de stock coûte-t-elle plus cher à Cdiscount en novembre "
    "qu'en mars ?",
])

# ==================================================================== étape 2
T.etape(2, "Lire la messagerie : le problème de ce matin")
T.p("Connecte-toi à Prepalog, ouvre la rubrique Simulog, puis l'activité « Cdiscount — le stock raconte ». Le "
    "logiciel s'ouvre aux couleurs de Cdiscount, avec un menu à gauche. L'accueil liste le travail de la séance, "
    "dans l'ordre.")
T.consignes([
    "Dans le menu de gauche, clique sur « Messagerie ».",
    "Ouvre d'abord « Bienvenue à l'entrepôt de Cestas ».",
    "Ouvre ensuite le message de Nadia Ferrand sur les écouteurs. Lis-le en entier, jusqu'à la signature.",
    "Ne réponds pas encore : tu enverras ton premier chiffre à l'étape 3.",
])
T.tableau(['Information', 'Ce que tu relèves'], 0, [Cm(8.6), Cm(8.4)], hauteur=Cm(1.0),
          remplis=[["Qui t'écrit, et quel est son poste ?", ''],
                   ["Quelle commande a été annulée ce matin (numéro) ?", ''],
                   ["Référence de l'article commandé", ''],
                   ["Ce que le préparateur a trouvé à l'emplacement", ''],
                   ["Combien d'articles le système dit-il qu'il en reste ?", ''],
                   ["Date du dernier inventaire de l'allée", ''],
                   ["Combien de lignes doit contenir ta réponse complète ?", '']])
T.encadre_liste('Deux mots de métier :', [
    "un inventaire : compter à la main ce qu'il y a vraiment dans les rayons, puis comparer avec le chiffre "
    "de l'ordinateur ;",
    "le stock du système : le chiffre de l'ordinateur. C'est lui que le site affiche aux clients.",
])
T.reflechir([
    "Le système dit qu'il reste des écouteurs, le rayon est vide. D'après toi, avant de chercher, qu'est-ce qui "
    "a pu se passer ?",
])

# ==================================================================== étape 3
T.etape(3, "Relever le stock actuel et l'envoyer")
T.p("Tu vas relever le stock d'écouteurs que le système affiche aujourd'hui. Il y a deux façons de le faire : "
    "essaie les deux.")
T.consignes([
    "Façon 1, par l'écran : dans le menu, clique sur « Stock » (sous « Articles »). L'écran dit « Accès "
    "verrouillé » : demande le code à ton enseignant, tape-le dans « Code d'accès », puis clique sur "
    "« Déverrouiller ».",
    "Dans l'onglet « Niveaux de stock », trouve la ligne de l'article et lis la colonne « Stock ».",
    "Façon 2, par la console : clique sur « Console » (sous « Outils »). Tape .help puis Entrée pour voir les "
    "commandes. Tape ensuite .getstock, un espace, la référence de l'article, puis Entrée.",
])
T.tableau(['Où as-tu lu le stock ?', 'Stock actuel de l\'article'], 0, [Cm(8.6), Cm(8.4)], hauteur=Cm(1.0),
          remplis=[['Écran « Stock »', ''], ['Console', '']])
T.encadre_liste('Ce que tu dois voir :', [
    "sur l'écran Stock : des cases de chiffres en haut, puis une ligne par référence ;",
    "dans la console : une fiche avec la référence, l'article, le stock, l'emplacement ;",
    "le même nombre aux deux endroits. Sinon, vérifie la référence que tu as tapée.",
])
T.p("Nadia attend ce premier chiffre avant la suite : envoie-le-lui maintenant.", gras=True, avant=4)
T.consignes([
    "Dans « Messagerie », ouvre le message de Nadia sur les écouteurs et clique sur « Répondre ».",
    "Les sept intitulés sont déjà écrits. Complète seulement la première ligne (« Stock actuel : ») avec ton "
    "nombre, en chiffres. Clique sur « Envoyer ».",
])
T.encadre_liste('Ce que tu dois voir :', [
    "en bas de l'écran : « Réponse envoyée. Nouveau message » ;",
    "de nouveaux messages arrivent dans « Réception ». Ils te serviront à l'étape 5.",
])
T.reflechir([
    "Ce nombre te dit-il comment le stock est arrivé là ? Explique ta réponse.",
])

# ==================================================================== étape 4
T.etape(4, "Lister les mouvements sur une fiche de stock")
T.p("Un mouvement de stock, c'est chaque fois que des articles entrent ou sortent. Le système les garde tous. "
    "Tu vas recopier ceux de l'article sur une fiche de stock.")
T.encadre('Un mot de métier :',
          "une fiche de stock suit UN seul article : une ligne par mouvement, avec la date, le document, l'entrée, "
          "la sortie et le stock après.", espace=False)
T.consignes([
    "Clique sur « Stock », puis sur l'onglet « Mouvements ». La liste mélange plusieurs articles : regarde la "
    "colonne « Réf. ». Dans la console, .movements suivi de la référence n'affiche que ton article.",
    "À l'écran, le plus récent est en haut. Sur ta fiche, écris du plus ancien (en haut) au plus récent.",
    "Une entrée va dans la colonne « Entrée », une sortie dans « Sortie » : écris le nombre sans le signe. La "
    "colonne « Origine » de l'écran donne le document.",
    "Laisse vide le « Stock après » de la ligne « Inventaire » : tu le trouveras à l'étape 7. Tu n'auras "
    "peut-être pas besoin de toutes les lignes.",
])
T.tableau(['Date', 'Document (Origine)', 'Entrée', 'Sortie', 'Stock après'], 0,
          [Cm(3.7), Cm(5.1), Cm(2.2), Cm(2.2), Cm(3.8)], hauteur=Cm(0.68),
          remplis=[['Dernier inventaire', 'Inventaire', '', '', 'à trouver à l\'étape 7']]
          + [['', '', '', '', ''] for _ in range(12)])
for _r in T.d.tables[-1].rows:   # hauteur exacte : la fiche (13 lignes) et sa question tiennent sur une page
    _r.height_rule = WD_ROW_HEIGHT_RULE.EXACTLY
T.encadre_liste('Ce que tu dois voir :', [
    "sur chaque ligne, le « Stock après » = celui de la ligne du dessus + l'entrée − la sortie ;",
    "la dernière ligne de ta fiche donne le stock actuel de l'étape 3.",
], intro="Sinon, tu as sauté un mouvement, ou tes lignes ne sont pas dans l'ordre.")
T.reflechir([
    "Regarde la colonne « Type » de l'écran pour les lignes de ta fiche. Que remarques-tu ?",
])

# ==================================================================== étape 5
T.etape(5, "Relier chaque mouvement à son document")
T.p("Un mouvement de stock doit toujours avoir un document : sans lui, personne ne peut dire pourquoi le stock a "
    "bougé. La colonne « Document » de ta fiche te donne son code. Retrouve chacun de ces documents.")
T.encadre_liste('Des mots de métier :', [
    "une réception : une livraison d'un fournisseur, avec son bon de livraison ;",
    "un bon de préparation (BP-…) : la liste des articles à sortir du rayon pour une commande client. Il porte "
    "les mêmes chiffres que sa commande (CMD-…) ;",
    "un retour client : un article que le client renvoie ;",
    "la casse : un article abîmé qu'on ne peut plus vendre.",
])
T.consignes([
    "Complète d'abord le premier tableau : pour chaque type de mouvement, où chercher le document ? Les "
    "documents sont dans les menus « Réceptions » et « Commandes », et dans la « Messagerie ».",
    "Dans « Réceptions » puis « Commandes », clique sur « Ouvrir » au bout d'une ligne pour lire le document.",
])
T.tableau(['Type de mouvement', 'Où je retrouve le document'], 0, [Cm(8.6), Cm(8.4)], hauteur=Cm(0.85),
          remplis=[['Entrée : réception', ''], ['Sortie : préparation', ''],
                   ['Entrée : retour client', ''], ['Sortie : casse', '']])
T.p("Dans « Réceptions », ouvre chaque réception de la liste :", taille=10.5, gras=True, avant=2, apres=4)
T.tableau(['N° de réception', 'Fournisseur', 'Écouteurs dans la livraison ?', 'Quantité d\'écouteurs'], 4,
          [Cm(3.8), Cm(4.4), Cm(5.0), Cm(3.8)], hauteur=Cm(0.9))
T.saut_avant()
T.p("Dans « Commandes », ouvre la commande de chaque bon de préparation de ta fiche :", taille=10.5, gras=True,
    apres=4)
T.tableau(['Bon de ta fiche (BP-…)', 'Commande (CMD-…)', 'Client', 'Écouteurs commandés'], 9,
          [Cm(4.0), Cm(4.2), Cm(4.8), Cm(4.0)], hauteur=Cm(0.8))
T.faits([
    "Dans la liste « Commandes », quel est le statut de la commande de la cliente ?",
])
T.questions([("Cette commande a-t-elle fait bouger le stock d'écouteurs ? Justifie avec ce que tu as vu à l'écran.", 2)])
T.p("Dans la « Messagerie », deux services t'ont écrit au sujet de deux mouvements de ta fiche :", taille=10.5,
    gras=True, avant=2, apres=4)
T.tableau(['Document (n°)', 'De qui ?', 'Que s\'est-il passé ?', 'Entrée ou sortie ?'], 3,
          [Cm(3.6), Cm(3.8), Cm(6.8), Cm(2.8)], hauteur=Cm(0.95))
T.reflechir([
    "Parmi les mouvements de ta fiche, lesquels ne sont ni un achat ni une vente ? Explique pourquoi le stock a "
    "bougé quand même.",
])

# ==================================================================== étape 6
T.etape(6, "Comparer chaque document à son mouvement")
T.p("Le système ne sait que ce qu'on lui a saisi. Un document dit ce qui s'est passé dans l'entrepôt ; le "
    "mouvement dit ce qui a été saisi. Les deux doivent dire la même quantité.")
T.consignes([
    "Pour chaque ligne de ta fiche, relis le document que tu as retrouvé à l'étape 5.",
    "Note la quantité écrite sur le document (reçue, préparée, retournée ou constatée), puis la quantité du "
    "mouvement (ta fiche).",
    "Écris « oui » si les deux quantités sont les mêmes, « non » sinon.",
])
T.tableau(['Document', 'Quantité écrite sur le document', 'Quantité du mouvement', 'Pareil ?'], 12,
          [Cm(4.4), Cm(5.4), Cm(4.4), Cm(2.8)], hauteur=Cm(0.8))
T.faits([
    "Quel document ne dit pas la même chose que son mouvement ?",
    "Écart entre le document et le mouvement (en nombre d'écouteurs)",
])
T.saut_avant()
T.encadre('Une seconde preuve :',
          "un bon de préparation affiche, dans la colonne « Stock trouvé », ce que le préparateur a vu dans le rayon "
          "juste avant de prendre les articles. Compare-le au stock du système juste avant la sortie (le « Stock "
          "après » de la ligne du dessus, sur ta fiche).")
T.tableau(['Commande', 'Stock trouvé (bon de préparation)', 'Stock du système juste avant', 'Pareil ?'], 9,
          [Cm(4.2), Cm(5.2), Cm(4.8), Cm(2.8)], hauteur=Cm(0.8))
T.questions([("À partir de quelle commande le « Stock trouvé » ne suit-il plus le stock du système ? Quel "
              "mouvement a eu lieu juste avant ?", 2)])
T.reflechir([
    "Comment as-tu su quel document était faux ?",
])

# ==================================================================== étape 7
T.etape(7, "Refaire le calcul à l'envers")
T.p("Tu connais le stock d'aujourd'hui et tout ce qui a bougé depuis l'inventaire. Tu peux retrouver le stock du "
    "jour de l'inventaire en remontant le temps : ce qui est entré depuis, on le retire ; ce qui est sorti depuis, "
    "on le remet.")
T.encadre('Pourquoi ça marche :',
          "à l'endroit, stock d'aujourd'hui = stock de l'inventaire + entrées − sorties. À l'envers, on fait "
          "l'opération contraire. On calcule avec les mouvements du système, tels qu'ils ont été saisis.")
T.consignes([
    "Additionne la colonne « Entrée » de ta fiche, puis la colonne « Sortie ».",
    "Calcule le stock du dernier inventaire. Écris ton calcul, pas seulement le résultat.",
    "Vérifie à l'endroit : inventaire + entrées − sorties doit redonner le stock actuel.",
    "Recopie ton résultat dans la ligne « Inventaire » de ta fiche (étape 4).",
])
T.tableau(['Ce que je calcule', 'Mon calcul', 'Résultat'], 0, [Cm(7.2), Cm(6.0), Cm(3.8)], hauteur=Cm(1.1),
          remplis=[['Total des entrées (colonne « Entrée »)', '', ''],
                   ['Total des sorties (colonne « Sortie »)', '', ''],
                   ['Stock actuel (étape 3)', '', ''],
                   ["Stock du dernier inventaire, calculé à l'envers", '', ''],
                   ["Vérification à l'endroit : inventaire + entrées − sorties", '', '']])
T.encadre('Ce que tu dois voir :',
          "la vérification à l'endroit redonne exactement le stock actuel. Sinon, n'arrange pas le résultat : "
          "reprends tes totaux, puis l'ordre des lignes de ta fiche, puis cherche un mouvement oublié.")
T.reflechir([
    "Si le système avait enregistré la quantité écrite sur le document de l'étape 6, qu'est-ce que ça aurait "
    "changé pour la cliente ?",
])

# ==================================================================== étape 8
T.etape(8, "Répondre à Nadia Ferrand")
T.p("Tu as tout ce qu'il faut. Envoie à Nadia la réponse complète : sept lignes, une information par ligne.")
T.encadre_liste("À lire AVANT d'écrire : le suivi lit tes lignes.", [
    "ne modifie pas les intitulés déjà écrits : écris ta réponse à la suite, sur la même ligne ;",
    "écris les nombres en chiffres (« 15 » et non « quinze ») ;",
    "pour un document, recopie son code en entier (par exemple « CMD-123456 ») ;",
    "« Commandes » : seulement les commandes qui ont fait sortir des écouteurs du stock ;",
    "« Stock au dernier inventaire » : ton calcul, avec le résultat tout à la fin de la ligne ;",
    "« Ce qui cloche » : le seul document en cause, et l'écart tout à la fin de la ligne.",
])
T.consignes([
    "Prépare tes sept lignes dans le tableau ci-dessous.",
    "Dans « Messagerie », ouvre le message de Nadia sur les écouteurs et clique sur « Répondre ».",
    "Complète chaque ligne à la suite de l'intitulé, sans rien effacer. Relis, puis clique sur « Envoyer ».",
])
T.tableau(['Ligne de Nadia', "Ce que j'écris sur cette ligne"], 0, [Cm(5.2), Cm(11.8)], hauteur=Cm(1.05),
          remplis=[[x, ''] for x in LIGNES])
T.encadre('Ce que tu dois voir :',
          "un nouveau message de Nadia arrive dans « Réception ». Il ne dit pas si tes réponses sont justes : "
          "c'est ton enseignant qui le voit.")
T.reflechir([
    "Si tu étais à la place de Nadia, que ferais-tu maintenant pour que le système dise de nouveau la vérité ?",
])

NOTIONS = [["Cdiscount vend ses produits", "Place de marché (commerce en ligne)",
            "Une place de marché est un site où des vendeurs indépendants vendent leurs produits à côté de ceux du "
            "site. Cdiscount a ouvert la sienne en 2010 (« C le marché »)."]]
T.finir(CODE, 'Cdiscount — le stock raconte', 'ENT-2.1-cdiscount-mouvements-trame-eleve', NOTIONS,
        os.path.basename(__file__), fichier=CODE)
