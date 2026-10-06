# -*- coding: utf-8 -*-
"""Trame élève d'ENT-5.7 Smoby / Kuehne+Nagel, « les enlèvements de Noël » (Cowork, 06/10/2026 au soir) — BROUILLON.

Format LONG (6 étapes + feuille de cours à détacher), comme ENT-5.1 à 5.6 (décision de Tristan du 06/10/2026).
Écrite AVANT la validation à l'écran, à la demande de Tristan (« toute la suite 5.3 → 5.8 ») : libellés repris de
`contenus/smoby-ent57.js` sans avoir joué la séance — « À REVOIR APRÈS L'ESSAI À L'ÉCRAN ». Le message de l'atelier
passe au tu avec le lot A5 bis de `SMOBY-retours-5.3.md` (« Reprends le planning… renvoie-le-moi ») : la trame ne le
cite pas mot pour mot.

Vérifié (contenus/smoby.js, bloc Kuehne+Nagel) : l'agence Route de Kuehne+Nagel à Besançon (École-Valentin) ; les
temps de conduite et de repos du règlement (CE) n° 561/2006 (4 h 30 puis 45 min de pause, 9 h par jour, 11 h de
repos journalier) ; la semi-remorque demande le permis CE.
Construit (comme dans la séance) : le contrat Smoby ↔ K+N, les chauffeurs, les camions, les trajets, les clients.

Chauffeurs, camions, enlèvements et les deux solutions (`SOLUTION` du contenu) RECOPIÉS de `contenus/smoby.js` et
`contenus/smoby-ent57.js` (relus le 06/10/2026). Les deux solutions sont REJUGÉES ici avec les neuf règles de la
séance (le script s'arrête si l'une est fausse), et les heures de reprise sont calculées.

Lancer : python3 outils/trame-smoby-enlevements.py
puis    soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/ENT-5.7-smoby-enlevements-trame-eleve.docx
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trame_commun as T
import corriges_data
from docx.shared import Cm

LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'smoby.png')

# ==================================================================== données (recopiées de contenus/smoby.js)
def mn(h):
    a, b = h.split(':'); return int(a) * 60 + int(b)


def hm(m):
    return f'{m // 60:02d}:{m % 60:02d}'


def duree(m):
    return f'{m // 60} h {m % 60:02d}'


CHAUFFEURS = {'sofiane': ('Sofiane', 'CE', '20:00'), 'julie': ('Julie', 'CE', '17:00'),
              'marc': ('Marc', 'C', '18:00'), 'nadia': ('Nadia', 'CE', '23:00')}
CAMIONS = {'s1': ('Semi n° 1', 'semi'), 's2': ('Semi n° 2', 'semi'), 'p3': ('Porteur n° 3', 'porteur')}
# id : (vers, type, palettes, minutes de conduite, prêt dès, livré avant)
ENL = {'E1': ('Lyon — Jouets du Rhône', 'semi', 33, 240, '06:00', '12:00'),
       'E2': ('Dijon — Maxi Jouets', 'semi', 26, 210, '08:00', '14:00'),
       'E3': ('Besançon — magasin Ludik', 'porteur', 12, 150, '07:00', '12:00'),
       'E4': ('Mâcon — Centrale du Jouet', 'semi', 30, 180, '11:00', '17:00'),
       'E5': ('Besançon — magasin Ludik (2e livraison)', 'porteur', 8, 120, '12:00', '17:00')}
PAUSE = 45
# Les deux solutions de contenus/smoby-ent57.js (`s` = quart d'heure depuis 05:00).
SOLUTION = {
    'v1': {'E1': ('sofiane', 8, 's1'), 'E3': ('marc', 8, 'p3'), 'E2': ('julie', 12, 's2'), 'pause-1': ('julie', 26, None),
           'pause-2': ('sofiane', 24, None), 'E4': ('sofiane', 27, 's1'), 'E5': ('julie', 29, 'p3')},
    'v2': {'E1': ('julie', 4, 's1'), 'E3': ('marc', 8, 'p3'), 'pause-1': ('julie', 20, None),
           'E2': ('sofiane', 20, 's1'), 'E4': ('julie', 28, 's2'), 'pause-2': ('sofiane', 34, None),
           'E5': ('sofiane', 37, 'p3')}}
ATELIER = {'v1': {}, 'v2': {'s2': mn('12:00')}}
REPRISE = {c: hm(mn(f) + 11 * 60 - 24 * 60) if mn(f) + 11 * 60 >= 24 * 60 else '— (dès 05:00)'
           for c, (_, _, f) in CHAUFFEURS.items()}


def blocs(v):
    out = []
    for i, (r, s, k) in SOLUTION[v].items():
        d = 5 * 60 + s * 15
        out.append((r, i, d, d + (PAUSE if i.startswith('pause') else ENL[i][3]), k))
    return sorted(out, key=lambda b: (b[0], b[2]))


def fautes(v):
    """Les neuf règles de la séance (chauffeurUnique, permis, camionUnique, typeCamion, atelier, fenetre, repos,
    pause, jour), avec ses simplifications : seule une carte Pause interrompt la conduite."""
    B, f = blocs(v), []
    for c in CHAUFFEURS:
        L = [b for b in B if b[0] == c]
        for a, b in zip(L, L[1:]):
            if b[2] < a[3]: f.append(f'{c} : deux choses en même temps')
        trajets = [b for b in L if not b[1].startswith('pause')]
        if trajets and trajets[0][2] < mn(CHAUFFEURS[c][2]) + 11 * 60 - 24 * 60: f.append(f'{c} : repos')
        cumul = 0
        for b in L:
            cumul = 0 if b[1].startswith('pause') else cumul + (b[3] - b[2])
            if cumul > 270: f.append(f'{c} : 4 h 30 sans pause')
        if sum(b[3] - b[2] for b in trajets) > 540: f.append(f'{c} : plus de 9 h')
        for b in trajets:
            if ENL[b[1]][1] == 'semi' and CHAUFFEURS[c][1] != 'CE': f.append(f'{c} : permis')
    for k in CAMIONS:
        L = sorted([b for b in B if b[4] == k], key=lambda b: b[2])
        for a, b in zip(L, L[1:]):
            if b[2] < a[3]: f.append(f'{k} : deux trajets')
        for b in L:
            if CAMIONS[k][1] != ENL[b[1]][1]: f.append(f'{b[1]} : type de camion')
            if k in ATELIER[v] and b[2] < ATELIER[v][k]: f.append(f'{b[1]} : atelier')
    for b in B:
        if not b[1].startswith('pause'):
            if b[2] < mn(ENL[b[1]][4]) or b[3] > mn(ENL[b[1]][5]): f.append(f'{b[1]} : fenêtre')
    if {b[1] for b in B if not b[1].startswith('pause')} != set(ENL): f.append('enlèvement oublié')
    return f


assert not fautes('v1') and not fautes('v2'), (fautes('v1'), fautes('v2'))
# La panne : au 1er envoi (solution du corrigé), quel enlèvement roule sur le Semi n° 2 avant 12:00 ?
ATELIER['v1b'] = {'s2': mn('12:00')}; SOLUTION['v1b'] = SOLUTION['v1']
TOUCHES = sorted({b[1] for b in blocs('v1') if b[4] == 's2' and b[2] < mn('12:00')})
assert TOUCHES == ['E2'], TOUCHES
DERNIER = {e: hm(mn(x[5]) - x[3]) for e, x in ENL.items()}     # dernier départ possible


def conduite(v, c):
    return sum(b[3] - b[2] for b in blocs(v) if b[0] == c and not b[1].startswith('pause'))


def ligne_chauffeur(v, c):
    L = [b for b in blocs(v) if b[0] == c]
    if not L: return [CHAUFFEURS[c][0], 'aucun trajet', '—', '—', '0 h 00']
    tr = [b for b in L if not b[1].startswith('pause')]
    return [CHAUFFEURS[c][0], ', '.join(f'{b[1]} ({hm(b[2])}-{hm(b[3])})' for b in tr),
            ', '.join(dict.fromkeys(CAMIONS[b[4]][0] for b in tr)),
            ', '.join(f'{hm(b[2])}-{hm(b[3])}' for b in L if b[1].startswith('pause')) or 'non', duree(conduite(v, c))]


# ==================================================================== la trame
T.nouveau()
T.entete(LOGO, 'ENT-5.7 — Carnet de suivi : les enlèvements de Noël', [
    ('Ce document est ta trame de travail :', "tu peux le suivre seul, étape par étape. Tu changes de côté : tu es "
     "agent d'exploitation chez Kuehne+Nagel, le transporteur, à l'agence de Besançon. Demain, jeudi 10 décembre, "
     "la commande de Noël de Smoby part en 5 enlèvements : tu planifies les chauffeurs et les camions."),
    ('Ce que ton enseignant voit dans son suivi :', "dix points : cinq pour ton premier planning, cinq pour le "
     "planning repris après la panne (chaque enlèvement planifié, chauffeurs, camions, horaires, temps de conduite et "
     "repos). Tes réponses écrites ici servent à réfléchir."),
    ('Ce qui est vrai, ce qui est inventé :', "Smoby, Kuehne+Nagel et son agence de Besançon, et les règles des temps "
     "de conduite sont réels. Le contrat entre les deux, les chauffeurs, les camions, les clients et les horaires sont "
     "inventés pour l'exercice.")],
    [('Les messages du jour', 'Prepalog : Messagerie'),
     ('Lire les enlèvements', 'Prepalog : Planning des chauffeurs'),
     ('Les chauffeurs et les règles', 'Prepalog : Planning des chauffeurs'),
     ('Construire et envoyer le planning', 'Prepalog : Planning des chauffeurs'),
     ('La panne : reprendre le planning', 'Prepalog : Messagerie et Planning'),
     ('Ce que tu retiens', 'Ce carnet')], nom_logo='SMOBY')

# ==================================================================== étape 1
T.etape(1, 'Les messages du jour')
T.consignes(["Ouvre la Messagerie. Lis le message de Bruno (Smoby), puis celui de ton responsable.",
             "Clique sur les mots soulignés si tu ne les connais pas.",
             "Réponds aux questions."])
T.faits(['Pour quelle entreprise travailles-tu aujourd’hui ?', 'Combien d’enlèvements faut-il planifier ? Quel jour ?',
         'Qu’est-ce qu’un enlèvement ?', 'Que doit avoir chaque enlèvement ?',
         'Que fais-tu quand ton planning est prêt ?'], hauteur=Cm(0.95))
T.qcm([("Bruno écrit « Bonjour l'exploitation ! … sur votre planning ». Il dit « votre » parce que…",
        ['il est fâché', 'il écrit à tout un service', 'il ne connaît pas l’agent'], 1)])
T.reflechir(["Hier, tu étais cariste chez Smoby ; aujourd'hui, tu es chez le transporteur. Qu'est-ce qui change "
             "dans ce que tu dois surveiller ?"])

# ==================================================================== étape 2   (À REVOIR APRÈS L'ESSAI À L'ÉCRAN)
T.etape(2, 'Lire les enlèvements')
T.consignes(["Ouvre le menu « Planning des chauffeurs ». Lis les 5 cartes « Enlèvements du jour ».",
             "Recopie chaque carte dans le tableau.",
             "Calcule le dernier départ possible : l'heure limite de livraison moins le temps de conduite."])
T.tableau(['Enl.', 'Destination', 'Camion', 'Conduite', 'Prêt dès', 'Livré avant', 'Dernier départ'], 0,
          [Cm(1.3), Cm(4.4), Cm(2.0), Cm(2.0), Cm(2.0), Cm(2.4), Cm(2.9)], hauteur=Cm(0.95),
          remplis=[[e] for e in ENL])
T.faits(['Quels enlèvements demandent une semi-remorque ?', 'Lequel peut partir le plus tôt ? Lequel le plus tard ?'],
        hauteur=Cm(0.95))
T.qcm([("E3 se fait en porteur. Le porteur, c'est…",
        ['un camion d’un seul tenant, conduit avec le permis C', 'une remorque sans moteur', 'un chauffeur'], 0)])
T.reflechir(["Pourquoi un enlèvement a-t-il une heure « prêt dès » ET une heure « livré avant » ?"])

# ==================================================================== étape 3
T.etape(3, 'Les chauffeurs et les règles')
T.encadre_liste('Les règles de conduite (règlement européen, simplifié pour la séance)', [
    'Au plus 4 h 30 de conduite d’affilée, puis une pause de 45 min (pose une carte Pause).',
    'Au plus 9 h de conduite dans la journée.',
    'Au moins 11 h de repos entre la fin de service d’hier et le premier départ d’aujourd’hui.',
    'Une semi-remorque se conduit avec le permis CE ; un porteur avec le permis C (le CE le permet aussi).'])
T.p("Lis la colonne de gauche du planning : le permis et la fin de service d'hier de chaque chauffeur.", apres=4)
T.tableau(['Chauffeur', 'Permis', 'Fin de service hier', 'Départ possible dès (+ 11 h)', 'Semi-remorque ? (oui / non)'],
          0, [Cm(2.6), Cm(1.8), Cm(3.4), Cm(5.0), Cm(4.2)], hauteur=Cm(0.95),
          remplis=[[n] for n, _, _ in CHAUFFEURS.values()])
T.faits(['Sofiane fait E1 (4 h) puis E4 (3 h). Combien d’heures conduit-il ? Faut-il une pause entre les deux ?',
         'Nadia peut-elle faire E1 ? Pourquoi ?'], hauteur=Cm(1.05))
T.qcm([("Marc n'a que le permis C. Il peut conduire…", ['une semi-remorque', 'un porteur', 'les deux'], 1)])
T.reflechir(["Pourquoi la loi limite-t-elle le temps de conduite des chauffeurs routiers ?"])

# ==================================================================== étape 4   (À REVOIR APRÈS L'ESSAI À L'ÉCRAN)
T.etape(4, 'Construire et envoyer le planning')
T.consignes(["Pose chaque enlèvement sur la ligne d'un chauffeur, à l'heure du départ, puis choisis son camion.",
             "Pose une pause là où il en faut. Regarde le compteur de conduite de chaque ligne.",
             "Quand plus aucun problème n'est signalé, envoie le planning. Note-le ici avant."])
T.tableau(['Chauffeur', 'Enlèvements (heures)', 'Camion(s)', 'Pause', 'Conduite du jour'], 0,
          [Cm(2.2), Cm(6.2), Cm(3.4), Cm(2.6), Cm(2.6)], hauteur=Cm(1.15),
          remplis=[[n] for n, _, _ in CHAUFFEURS.values()])
T.faits(['Qui prend les deux enlèvements en porteur ? Peuvent-ils partir avec le même camion ?',
         'Le Porteur n° 3 fait E3 puis E5 : à quelle condition ?'], hauteur=Cm(1.0))
T.qcm([("Deux enlèvements sont sur la ligne du même chauffeur et se chevauchent d'un quart d'heure. C'est…",
        ['possible s’il roule vite', 'impossible : un chauffeur fait un trajet à la fois', 'permis le jeudi'], 1)])
T.reflechir(["Nadia n'a aucun enlèvement dans ton planning (ou peu). Est-ce un problème ? Pourquoi ?"])

# ==================================================================== étape 5
T.etape(5, 'La panne : reprendre le planning')
T.consignes(["Lis le message de l'atelier Kuehne+Nagel.",
             "Repère sur ton planning ce qui ne tient plus, puis reprends-le.",
             "Renvoie le planning. Note ici ce qui a changé."])
T.faits(['Quel camion est en panne ? Jusqu’à quelle heure ?',
         'Dans ton premier planning, quel enlèvement utilisait ce camion avant cette heure ?',
         'Qu’as-tu changé pour que tout tienne ?', 'Que te répond ton responsable ?'], hauteur=Cm(1.0))
T.tableau(['Chauffeur', 'Enlèvements (heures)', 'Camion(s)', 'Pause', 'Conduite du jour'], 0,
          [Cm(2.2), Cm(6.2), Cm(3.4), Cm(2.6), Cm(2.6)], hauteur=Cm(1.05),
          remplis=[[n] for n, _, _ in CHAUFFEURS.values()])
T.reflechir(["Pourquoi vaut-il mieux tout reprendre calmement que déplacer seulement l'enlèvement touché ?"])

# ==================================================================== étape 6
T.etape(6, 'Ce que tu retiens')
T.qcm([("Un chauffeur a conduit 4 h 30 d'affilée. Il doit…",
        ['continuer jusqu’à la livraison', 'faire une pause de 45 min', 'changer de camion'], 1),
       ("Au plus, dans une journée, un chauffeur conduit…", ['6 h', '9 h', '12 h'], 1),
       ("Un chauffeur a fini à 23 h hier. Il peut repartir au plus tôt à…", ['7 h', '10 h', '11 h'], 1)])
T.faits(['Que te confie ton responsable pour demain matin ?'], hauteur=Cm(0.9))
T.reflechir(["Qu'est-ce qui a été le plus difficile dans ce planning : les permis, les horaires, les pauses ou le "
             "repos ? Pourquoi ?",
             "Si un camion de la commande de Noël arrivait en retard chez le client, qui serait gêné, et comment ?"])

# ==================================================================== feuille à détacher (cours)
ESSENTIEL = [('Un chauffeur conduit au plus 4 h 30 d’affilée, puis fait une {} de 45 min.', 'pause'),
             ('Il conduit au plus 9 h dans la {}.', 'journée'),
             ('Entre deux journées, il a au moins 11 h de {}.', 'repos'),
             ('Une semi-remorque demande le permis {} ; un porteur, le permis C.', 'CE')]
LEXIQUE = [('enlèvement', 'Passage du transporteur chez l’{} pour charger la marchandise.', 'expéditeur'),
           ('exploitation', 'Service du transporteur qui {} les chauffeurs et les camions.', 'planifie'),
           ('semi-remorque', 'Ensemble d’un {} et d’une grande remorque.', 'tracteur'),
           ('fenêtre', 'Plage d’heures entre le moment où la marchandise est {} et l’heure limite.', 'prête')]
T.feuille_cours('ENT-5.7', 'Planifier les chauffeurs et les camions',
                'OTM — C2.2 exécuter la demande (planifier), C3.2 temps de conduite (notion)',
                [ph.format(T.TROU) for ph, _ in ESSENTIEL],
                [m for _, m in ESSENTIEL] + [m for _, _, m in LEXIQUE],
                [(mot, df.format(T.TROU)) for mot, df, _ in LEXIQUE])

# ==================================================================== corrigé de la trame
SEMIS = [e for e, x in ENL.items() if x[1] == 'semi']
TOT = min(ENL, key=lambda e: mn(ENL[e][4])); TARD = max(ENL, key=lambda e: mn(DERNIER[e]))
ENT_5_7 = {
 "Pour quelle entreprise travailles-tu": {"rep": "Kuehne+Nagel, le transporteur (agence de Besançon), au service exploitation."},
 "Combien d’enlèvements faut-il planifier": {"rep": "5, le jeudi 10 décembre."},
 "Qu’est-ce qu’un enlèvement": {"rep": "Le passage du transporteur chez l'expéditeur (Smoby) pour charger la marchandise et l'emmener chez le client."},
 "Que doit avoir chaque enlèvement": {"rep": "Un chauffeur et un camion."},
 "Que fais-tu quand ton planning est prêt": {"rep": "Je l'envoie à mon responsable, depuis l'écran du planning."},
 "Hier, tu étais cariste": {"pistes": [
   "Chez Smoby : la marchandise (compter, ranger, préparer).",
   "Chez le transporteur : les personnes et les camions (permis, horaires, repos, pannes).",
   "Mais c'est la même commande : le client attend ses jouets à l'heure."]},
 "T: Enl. | Destination": {"lignes": [[e, x[0], 'semi' if x[1] == 'semi' else 'porteur', duree(x[3]), x[4], x[5], DERNIER[e]]
     for e, x in ENL.items()],
   "note": "Dernier départ = livré avant − conduite. Le trajet doit tenir entre « prêt dès » et « livré avant » (la bande ambrée à l'écran)."},
 "Quels enlèvements demandent une semi": {"rep": ', '.join(SEMIS) + '.'},
 "Lequel peut partir le plus tôt": {"rep": f"Le plus tôt : {TOT} (dès {ENL[TOT][4]}). Le plus tard : {TARD} (départ jusqu'à {DERNIER[TARD]})."},
 "Pourquoi un enlèvement a-t-il une heure": {"pistes": [
   "« Prêt dès » : avant, la marchandise n'est pas chargée, le camion attendrait.",
   "« Livré avant » : le client a ses horaires (magasin, quai de réception).",
   "Le trajet doit tenir entre les deux : c'est la fenêtre."]},
 "T: Chauffeur | Permis | Fin de service": {"lignes": [[n, p, f, REPRISE[c], 'oui' if p == 'CE' else 'non']
     for c, (n, p, f) in CHAUFFEURS.items()],
   "note": "Fin d'hier + 11 h. Julie (17:00) et Marc (18:00) sont libres dès 05:00, le début du planning."},
 "Sofiane fait E1 (4 h) puis E4": {"rep": "7 h de conduite (moins de 9 h). Oui : 4 h + 3 h d'affilée dépassent 4 h 30, il faut une pause de 45 min entre les deux."},
 "Nadia peut-elle faire E1": {"rep": f"Non : elle ne peut pas partir avant {REPRISE['nadia']} (fin hier 23:00 + 11 h). E1 doit partir au plus tard à {DERNIER['E1']}."},
 "Pourquoi la loi limite-t-elle": {"pistes": [
   "La fatigue au volant cause des accidents graves ; un poids lourd fait de gros dégâts.",
   "Les pauses et le repos protègent le chauffeur et les autres usagers.",
   "La règle est la même pour tous les transporteurs : pas de concurrence sur la fatigue."],
   "note": "Règlement (CE) n° 561/2006 ; vérifié au chronotachygraphe. La séance simplifie (la pause ne compte que si une carte est posée ; tout le trajet compte comme de la conduite)."},
 "T: Chauffeur | Enlèvements (heures) | Camion(s) | Pause | Conduite du jour": None,
 "Qui prend les deux enlèvements en porteur": {"rep": "Une solution : Marc fait E3, Julie fait E5. Oui, le même Porteur n° 3, puisque les deux trajets ne se chevauchent pas.",
   "note": "Marc (permis C) ne peut prendre que des porteurs. D'autres solutions sont justes : le moteur juge les règles."},
 "Le Porteur n° 3 fait E3 puis E5": {"rep": f"Que E3 soit fini (au plus tard {ENL['E3'][5]}) avant le départ d'E5 (pas avant {ENL['E5'][4]}) : un camion fait un trajet à la fois."},
 "Nadia n'a aucun enlèvement": {"pistes": [
   "Non : il n'y a que 5 enlèvements et 3 camions ; tous les chauffeurs ne sont pas nécessaires.",
   "Elle reste disponible en renfort (en cas de retard ou de panne), à partir de 10:00.",
   "Un planning juste respecte les règles ; il n'oblige pas à occuper tout le monde."]},
 "Quel camion est en panne": {"rep": "Le Semi n° 2, à l'atelier jusqu'à 12:00 (problème de freins)."},
 "Dans ton premier planning, quel enlèvement": {"rep": "Avec la solution du corrigé : " + ', '.join(TOUCHES) + " (sur le Semi n° 2 à partir de 08:00).",
   "note": "Réponse propre à chaque élève : c'est son premier planning."},
 "Qu’as-tu changé pour que tout tienne": {"rep": "Une solution : Julie part à 06:00 avec E1 sur le Semi n° 1, Sofiane prend E2 à 10:00 sur le même Semi n° 1 ; le Semi n° 2 fait E4 à partir de 12:00 avec Julie.",
   "note": "Autres solutions possibles. E4 (prêt dès 11:00) est le seul semi qui peut attendre midi."},
 "Que te répond ton responsable": {"rep": "Que c'est noté, et qu'il lui confie demain matin la lettre de voiture d'E1 (ENT-5.8)."},
 "Pourquoi vaut-il mieux tout reprendre": {"pistes": [
   "Déplacer un enlèvement en décale un autre : pauses, camions et repos changent aussi.",
   "Relire tout le planning évite une nouvelle erreur (deux trajets sur le même camion).",
   "Ici, le seul semi libre le matin doit faire deux trajets : il faut revoir qui fait quoi."]},
 "Que te confie ton responsable pour demain": {"rep": "La lettre de voiture de l'enlèvement E1."},
 "Qu'est-ce qui a été le plus difficile": {"pistes": ["Réponse personnelle : nommer la règle et dire où elle a coincé."]},
 "Si un camion de la commande de Noël arrivait en retard": {"pistes": [
   "Le client (magasin) : rayons vides avant Noël, ventes perdues, personnel qui attend au quai.",
   "Smoby : client mécontent, image abîmée, pénalités possibles.",
   "Le transporteur : réclamation, contrat en danger."]},
}
del ENT_5_7["T: Chauffeur | Enlèvements (heures) | Camion(s) | Pause | Conduite du jour"]
corriges_data._DICOS['ENT-5.7'] = [ENT_5_7]
# Les deux tableaux de planning ont les mêmes en-têtes : réponses par étape (_EXTRAS).
corriges_data._EXTRAS['ENT-5.7'] = {
    (4, 'T: Chauffeur | Enlèvements (heures)'): {"lignes": [ligne_chauffeur('v1', c) for c in CHAUFFEURS],
        "note": "Une solution juste (celle du corrigé de la séance, rejugée par le générateur). D'autres sont justes : jalons 1 à 5."},
    (5, 'T: Chauffeur | Enlèvements (heures)'): {"lignes": [ligne_chauffeur('v2', c) for c in CHAUFFEURS],
        "note": "Une solution juste après la panne (Semi n° 2 à l'atelier jusqu'à 12:00) : jalons 6 à 10."},
}
for ph, mot in ESSENTIEL:
    ENT_5_7[ph.split('{}')[0].strip()] = {"rep": mot + '.'}
ENT_5_7['T: Mot | Définition (complète avec la banque de mots)'] = {
    "lignes": [[mot, m] for mot, _, m in LEXIQUE], "note": "Un mot de la banque par trou."}

NOTIONS = [
    ["Bruno écrit « Bonjour l'exploitation", "Communication écrite", "À un service (plusieurs personnes), on écrit au vous pluriel."],
    ["E3 se fait en porteur", "Véhicules", "Le porteur est un camion d'un seul tenant (permis C) ; la semi-remorque, un tracteur et une remorque (permis CE)."],
    ["Marc n'a que le permis C", "Véhicules", "Le permis C permet de conduire un porteur, pas une semi-remorque (permis CE)."],
    ["Deux enlèvements sont sur la ligne", "Planifier", "Un chauffeur, comme un camion, ne fait qu'un trajet à la fois."],
    ["Un chauffeur a conduit 4 h 30", "Temps de conduite", "Après 4 h 30 de conduite, une pause de 45 min (règlement CE 561/2006)."],
    ["Au plus, dans une journée", "Temps de conduite", "La conduite journalière est limitée à 9 h (règlement CE 561/2006, avec des exceptions non vues ici)."],
    ["Un chauffeur a fini à 23 h", "Temps de repos", "Au moins 11 h de repos journalier : 23 h + 11 h = 10 h le lendemain."],
]
T.finir('ENT-5.7', 'Kuehne+Nagel — les enlèvements de Noël', 'ENT-5.7-smoby-enlevements-trame-eleve', NOTIONS,
        os.path.basename(__file__))
