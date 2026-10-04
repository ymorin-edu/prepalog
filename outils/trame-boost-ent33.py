# -*- coding: utf-8 -*-
"""Trame élève Boost — séance ENT-3.3 « la tournée à corriger » (erreur induite, C2.4).

Écrite le 04/10/2026 par Cowork, à la demande de Tristan (« créer les trames manquantes »), sur le modèle
d'ENT-3.1 et avec les fonctions de `trame_commun.py`. Règles : fiche `prepalog-trames-eleve`.

Les trois exigences :
  1. autonomie : chaque étape dit où travailler et ce qu'on doit voir ; libellés repris du code
     (`contenus/boost-ent33.js`, `core/types/tournee.js`, `grille.js`), PAS ENCORE VUS À L'ÉCRAN par Cowork ;
  2. pas à pas : la trame ne dit ni quelles contraintes Inès viole, ni que sa feuille contient une formule
     fausse, ni laquelle. Elle fait recalculer le poids chargé À LA MAIN avant de lire la feuille : c'est ce
     calcul qui fait trouver l'erreur ;
  3. une analyse réflexive par étape, sur ce que l'élève vient de faire.

Séance X.3 : pas d'étape de découverte (faite en ENT-3.1). Réponses : `corriges_boost.py` →
`contenus/corriges/ENT-3.3.js`.
"""
import os
from docx.shared import Cm
import trame_commun as T
import corriges_data, corriges_boost

CODE = 'ENT-3.3'
corriges_data._DICOS[CODE] = [corriges_boost.ENT_3_3]
corriges_data._EXTRAS[CODE] = corriges_boost.EXTRAS_3_3
LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'boost.png')

T.nouveau()
T.entete(LOGO, "ENT-3.3 — Carnet de suivi : la tournée à corriger", [
    ('Ce document est ta trame de travail :',
     "tu peux le suivre seul, étape par étape. Chaque étape dit où travailler et ce que tu dois voir à l'écran."),
    ('Ce que ton enseignant voit dans son suivi :',
     "sept points, qui donnent une note sur 20 : ton diagnostic dans ta réponse à Inès (chaque contrainte, et les "
     "chiffres qui le prouvent), puis ta correction (la feuille, la charge, le train, le créneau, la longueur de "
     "la tournée). Tes réponses écrites ici servent à réfléchir."),
    ('Ce qui est vrai, ce qui est inventé :',
     "Boost, le vélo-cargo et le train jusqu'à Paris sont réels. Inès, les huit commerces, les poids, les horaires "
     "et les messages sont inventés pour l'exercice. Les rues sont de vraies rues de Nîmes."),
], [
    ('Lire le message d\'Inès', 'Dans Prepalog'),
    ('Contrôler sa tournée', 'Dans Prepalog'),
    ('Contrôler sa feuille de calcul', 'Dans Prepalog'),
    ('Répondre à Inès', 'Dans Prepalog'),
    ('Corriger la tournée et la feuille', 'Dans Prepalog'),
    ('Terminer', 'Dans Prepalog'),
])

# ==================================================================== étape 1
T.etape(1, "Lire le message d'Inès")
T.p("Même journée que la séance ENT-3.2, mêmes huit commandes. Mais cette fois, la tournée est déjà faite, par "
    "Inès, une collègue livreuse. Ton travail : la relire avant le départ. Connecte-toi à Prepalog, ouvre la "
    "rubrique Simulog, puis l'activité « Boost — la tournée à corriger » (ENT-3.3).")
T.consignes([
    "Dans le menu de gauche, clique sur « Messagerie ».",
    "Ouvre le message d'Inès. Lis-le en entier, jusqu'aux six lignes qu'elle attend en réponse.",
    "Relève les informations ci-dessous.",
])
T.faits([
    "Quelle commande Inès a-t-elle laissée à quai ?",
    "Pourquoi l'a-t-elle choisie ?",
    "Comment a-t-elle choisi l'ordre des arrêts ?",
    "Combien de kilos charge-t-elle, d'après sa feuille ?",
    "Que peux-tu modifier dans l'outil pour l'instant ?",
])
T.encadre('Relire à deux :',
          "dans beaucoup d'entreprises, un collègue relit une préparation avant le départ. Relire, ce n'est pas "
          "refaire : on contrôle chaque chiffre, puis on dit ce qui va et ce qui ne va pas.")
T.reflechir([
    "Avant de contrôler, le raisonnement d'Inès te paraît-il juste ? Explique ce que tu en penses.",
])

# ==================================================================== étape 2
T.etape(2, "Contrôler sa tournée")
T.p("Dans le menu de gauche, clique sur « Tournée de l'après-midi ». La tournée d'Inès est sur la carte. Elle est "
    "figée : tu la lis, tu ne la modifies pas. Les jauges ne disent pas si les contraintes tiennent.")
T.consignes([
    "Relève l'ordre des arrêts d'Inès, de l'entrepôt à la gare.",
    "Reprends le poids de chaque commande chargée dans son message (« LES COMMANDES »).",
    "Calcule toi-même, à la main ou à la calculatrice, le poids chargé.",
])
T.tableau(['Arrêt n°', 'Commande chargée', 'Poids (kg)'], 0, [Cm(2.0), Cm(11.0), Cm(4.0)], hauteur=Cm(0.85),
          remplis=[[str(i), '', ''] for i in range(1, 8)] + [['', 'Poids chargé (total)', '']])
T.faits([
    "Charge maximale du vélo-cargo (kg)",
    "Le poids chargé que tu as calculé est-il sous cette charge ?",
])
T.reflechir([
    "Comment as-tu vérifié le poids chargé sans te fier à ce qu'Inès annonce ?",
])

# ==================================================================== étape 3
T.etape(3, "Contrôler sa feuille de calcul")
T.p("Sous la carte, la feuille de calcul d'Inès. Elle est figée aussi. Clique une cellule : ce qu'elle contient "
    "(une formule ou une valeur tapée) s'affiche dans la barre au-dessus du tableau.")
T.consignes([
    "Pour chaque ligne du tableau ci-dessous, clique la cellule et recopie la formule d'Inès.",
    "Demande-toi si elle calcule bien ce que dit son titre. Compare avec ton calcul de l'étape 2.",
    "Lis les deux heures d'arrivée, et compare-les à leur limite.",
])
T.tableau(['Ce que la cellule calcule', 'Formule d\'Inès', 'Juste ou fausse ?'], 0, [Cm(6.0), Cm(7.0), Cm(4.0)],
          hauteur=Cm(1.05),
          remplis=[['Poids chargé (kg)', '', ''],
                   ['Temps de route (min)', '', ''],
                   ['Temps aux arrêts (min)', '', ''],
                   ['Arrivée à la gare', '', ''],
                   ['Arrivée chez le client à créneau', '', '']])
T.faits([
    "Heure d'arrivée à la gare",
    "Est-elle avant le train ?",
    "Heure d'arrivée chez le client à créneau",
    "Est-elle avant la limite du créneau ?",
])
T.reflechir([
    "Comment as-tu repéré une formule qui ne calcule pas ce qu'elle annonce ?",
])

# ==================================================================== étape 4
T.etape(4, "Répondre à Inès")
T.p("Tu as tout contrôlé. Réponds à Inès : dans la Messagerie, ouvre son message et clique sur « Répondre ».")
T.encadre_liste('À lire AVANT d\'écrire : le suivi lit tes lignes.', [
    "recopie les six lignes de son message, avec leurs intitulés, sans les changer ;",
    "complète chacune à la suite, sur la même ligne ;",
    "pour une contrainte, écris l'un des deux mots qu'Inès propose entre parenthèses ;",
    "écris le poids en chiffres (par exemple « 120 kg ») et une heure comme « 9 h 05 ».",
])
T.questions([("Brouillon de ta réponse à Inès :", 7)])
T.encadre_liste('Ce que tu dois voir :', [
    "Inès te répond dans la Messagerie ;",
    "sa tournée et sa feuille sont déverrouillées pour toi.",
])
T.reflechir([
    "Pour la contrainte où tu as le plus hésité, qu'est-ce qui t'a décidé ?",
])

# ==================================================================== étape 5
T.etape(5, "Corriger la tournée et la feuille")
T.p("Retourne dans « Tournée de l'après-midi ». Tout est débloqué : tu peux changer la tournée et la feuille. "
    "Corrige tout ce que tu as trouvé à l'étape 3 et à l'étape 4.")
T.consignes([
    "Dans la feuille, clique la cellule fausse et corrige sa formule dans la barre.",
    "Sur la carte, change la commande laissée à quai si elle ne va pas, puis l'ordre des arrêts.",
    "Après chaque changement, relis le poids chargé et les deux heures d'arrivée dans la feuille.",
    "Cherche l'ordre le plus court qui tient tout.",
])
T.encadre('Si tu t\'es perdu :',
          "« Retrouver la tournée d'Inès » remet sa tournée de départ, et « ↺ » à côté d'une cellule remet ce "
          "qu'Inès avait écrit. Tes autres formules sont gardées.")
T.tableau(['Essai', 'À quai', 'Poids chargé', 'Arrivée créneau', 'Arrivée gare', 'Distance'], 0,
          [Cm(1.5), Cm(4.0), Cm(2.8), Cm(3.0), Cm(2.9), Cm(2.8)], hauteur=Cm(1.0),
          remplis=[['1', '', '', '', '', ''], ['2', '', '', '', '', ''], ['3', '', '', '', '', '']])
T.encadre_liste('Tu peux passer à l\'étape 6 quand, d\'après ta feuille :', [
    "le poids chargé est sous la charge maximale ;",
    "l'arrivée chez le client à créneau est avant sa limite, et l'arrivée à la gare avant le train.",
])
T.reflechir([
    "Inès avait laissé à quai la plus petite commande. Comment tes calculs t'ont-ils montré que ce choix ne "
    "suffisait pas ?",
])

# ==================================================================== étape 6
T.etape(6, "Terminer")
T.p("Quand ta correction est finie, clique sur « J'ai terminé » en bas de la page, puis clique à nouveau pour "
    "confirmer. C'est définitif : ta correction est enregistrée telle quelle.")
T.faits([
    "Commande laissée à quai dans ta correction",
    "Distance de ta tournée corrigée (km)",
    "Heure d'arrivée à la gare",
])
T.encadre_liste('Ce que tu dois voir :', [
    "« Correction terminée à … » : l'heure de ta fin ;",
    "la tournée et la feuille ne se modifient plus.",
])
T.reflechir([
    "Si tu donnais un conseil à Inès pour sa prochaine tournée, lequel serait le plus utile ?",
])

# Feuille à détacher (cours + activité à la maison), décision de Tristan du 04/10/2026 :
# contenu dans `feuilles_detachables.py`.
T.feuille_detachable('ENT-3.3')

T.finir(CODE, 'Boost — la tournée à corriger', 'ENT-3.3-boost-a-corriger-trame-eleve', [],
        os.path.basename(__file__), fichier=CODE)
