# -*- coding: utf-8 -*-
"""Trame élève d'ENT-5.2 Smoby, « l'arrivée de Yanis » (Cowork, 06/10/2026 au soir) — BROUILLON.

Format LONG (7 étapes + feuille de cours à détacher), comme ENT-5.1 (décision de Tristan du 06/10/2026 au soir).
Écrite AVANT le test en classe du 07/10, à la demande de Tristan (« 5.2 go ») : la séance n'est pas encore validée à
l'écran. Les passages marqués « À REVOIR APRÈS LE TEST » dépendent du planning (affichage, libellés, confirmation
avant envoi du lot C) et sont à relire quand le retour de classe sera fait.

Vérifié (web et brief ENT-5.2 §2) : l'employeur ne demande que ce qui a un lien direct et nécessaire avec le poste
(Code du travail, art. L1221-6) ; le numéro de sécurité sociale sert à la déclaration préalable à l'embauche (DPAE),
faite à l'Urssaf avant l'arrivée du salarié ; l'autorisation de conduite est délivrée par l'employeur après la
formation (CACES), l'avis du médecin du travail et la connaissance des lieux (art. R4323-56) ; les EPI sont fournis
gratuitement par l'employeur (art. R4323-95) ; l'intérimaire est salarié de l'agence d'intérim.
Construit (comme dans la séance) : Sophie, l'équipe, les besoins par jour, les absences, l'imprévu.
Données du planning relues dans `contenus/smoby-ent52.js` le 06/10/2026 et recopiées ci-dessous (DONNEES) : le
tableau des présents et les réponses du corrigé sont CALCULÉS depuis elles, et la solution `SOLUTION` du contenu est
rejugée ici (le script s'arrête si elle ne respecte pas les règles).

Lancer : python3 outils/trame-smoby-arrivee.py
puis    soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/ENT-5.2-smoby-arrivee-trame-eleve.docx
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trame_commun as T
import corriges_data
from docx.shared import Cm

LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'smoby.png')

# ==================================================================== données (relues dans contenus/smoby-ent52.js)
JOURS = ['lun 7', 'mar 8', 'mer 9', 'jeu 10', 'ven 11', 'lun 14', 'mar 15', 'mer 16', 'jeu 17', 'ven 18']
NOMS_JOURS = ['lundi 7', 'mardi 8', 'mercredi 9', 'jeudi 10', 'vendredi 11',
              'lundi 14', 'mardi 15', 'mercredi 16', 'jeudi 17', 'vendredi 18']
BESOIN = [4, 4, 4, 5, 5, 5, 5, 5, 5, 4]
# id : (nom, CACES, premier jour présent)
EQUIPE = {'karim': ('Karim', True, 0), 'lea': ('Léa', True, 0), 'mathis': ('Mathis', False, 0),
          'ines': ('Inès', False, 0), 'chloe': ('Chloé', False, 0), 'yanis': ('Yanis', True, 2)}
NOA = {'noa': ('Noa', False, 6)}
# id : (qui, libellé, nombre de jours, jour demandé, imposée)
CARTES = {'form-mathis': ('mathis', 'Formation CACES', 2, 1, True),
          'visite-ines': ('ines', 'Visite médicale', 1, 3, True),
          'cp-chloe': ('chloe', 'Congé payé', 2, 5, False),
          'cp-karim': ('karim', 'Congé payé', 1, 7, False),
          'cp-lea': ('lea', 'Congé payé', 3, 7, False)}
ARRET = {'am-ines': ('ines', 'Arrêt maladie', 3, 5, True)}
SOLUTION = {'v1': {'form-mathis': 1, 'visite-ines': 3, 'cp-chloe': 5, 'cp-karim': 0, 'cp-lea': 7},
            'v2': {'form-mathis': 1, 'visite-ines': 3, 'cp-chloe': 8, 'cp-karim': 0, 'cp-lea': 7, 'am-ines': 5}}


def absents(place, cartes, j):
    return [cartes[c][0] for c, t in place.items() if t <= j < t + cartes[c][2]]


def presents(place, cartes, equipe, j):
    abs_ = absents(place, cartes, j)
    return [k for k, (_, _, arr) in equipe.items() if arr <= j and k not in abs_]


def defauts(place, cartes, equipe):
    """Les jours qui manquent de monde ou de cariste CACES (règles `effectif` et `caces` du contenu), plus les
    chevauchements et les absences hors présence (règles `chevauche` et `arrivee`), plus une carte à cheval sur deux
    semaines (`semaineEntiere`)."""
    pb = []
    for c, t in place.items():
        qui, _, n, dem, imp = cartes[c]
        if t // 5 != (t + n - 1) // 5: pb.append(f'{c} à cheval')
        if imp and t != dem: pb.append(f'{c} pas à sa date')
        if t < equipe[qui][2]: pb.append(f'{c} avant l’arrivée')
    for j in range(len(JOURS)):
        qui = absents(place, cartes, j)
        if len(qui) != len(set(qui)): pb.append(f'{JOURS[j]} chevauche')
        pr = presents(place, cartes, equipe, j)
        if len(pr) < BESOIN[j]: pb.append(f'{JOURS[j]} effectif')
        if not any(equipe[k][1] for k in pr): pb.append(f'{JOURS[j]} caces')
    return pb


def options(place, cartes, equipe, carte):
    """Les débuts possibles d'une carte, les autres restant en place : ce qui laisse le planning sans défaut."""
    n = cartes[carte][2]
    return [t for t in range(len(JOURS) - n + 1) if not defauts(dict(place, **{carte: t}), cartes, equipe)]


DEMANDE = {c: v[3] for c, v in CARTES.items()}
C2, E2 = dict(CARTES, **ARRET), dict(EQUIPE, **NOA)
assert not defauts(SOLUTION['v1'], CARTES, EQUIPE), defauts(SOLUTION['v1'], CARTES, EQUIPE)
assert not defauts(SOLUTION['v2'], C2, E2), defauts(SOLUTION['v2'], C2, E2)
assert defauts(DEMANDE, CARTES, EQUIPE) == ['mer 16 effectif'], defauts(DEMANDE, CARTES, EQUIPE)

# le tableau « si on accorde tout à la date demandée » (étape 4), calculé
TAB4 = []
for j in range(len(JOURS)):
    abs_ = [EQUIPE[k][0] for k in absents(DEMANDE, CARTES, j)]
    if j < EQUIPE['yanis'][2]: abs_.append('(Yanis pas arrivé)')
    pr = presents(DEMANDE, CARTES, EQUIPE, j)
    TAB4.append([NOMS_JOURS[j], str(BESOIN[j]), ', '.join(abs_) or 'personne', str(len(pr)),
                 'oui' if len(pr) >= BESOIN[j] else 'NON'])
# où décaler Karim, ou Léa (les autres à la date demandée)
OPT_KARIM = [JOURS[t] for t in options(DEMANDE, CARTES, EQUIPE, 'cp-karim') if t != 7]
OPT_LEA = [JOURS[t] for t in options(DEMANDE, CARTES, EQUIPE, 'cp-lea')]
assert not OPT_LEA and OPT_KARIM, (OPT_LEA, OPT_KARIM)   # la question de l'étape 4 repose là-dessus
# après l'imprévu : en partant de la solution v1, avec l'arrêt d'Inès et Noa
V1_ARRET = dict(SOLUTION['v1'], **{'am-ines': 5})
MANQUE_V2 = defauts(V1_ARRET, C2, E2)
assert MANQUE_V2 == ['lun 14 effectif'], MANQUE_V2
OPT_CHLOE = [JOURS[t] for t in options(V1_ARRET, C2, E2, 'cp-chloe')]
# Le lundi 14 manque quelle que soit la place du congé de Karim ou de Léa hors du lundi 14 : on le vérifie.
for ck in options(DEMANDE, CARTES, EQUIPE, 'cp-karim'):
    if ck == 7: continue
    p = dict(DEMANDE, **{'cp-karim': ck, 'am-ines': 5})
    if ck != 5: assert 'lun 14 effectif' in defauts(p, C2, E2)

# ==================================================================== la trame
T.nouveau()
T.entete(LOGO, 'ENT-5.2 — Carnet de suivi : l’arrivée de Yanis', [
    ('Ce document est ta trame de travail :', "tu peux le suivre seul, étape par étape. Tu es toujours en renfort au "
     "service RH de Smoby. Yanis, le cariste que tu as choisi, arrive bientôt : tu prépares son arrivée, puis le "
     "planning de toute l'équipe pour les deux semaines avant Noël."),
    ('Ce que ton enseignant voit dans son suivi :', "quatorze points : les pièces demandées à Yanis (2), son premier "
     "jour dans l'ordre (1), ton planning au premier envoi (5), ton planning après l'imprévu (5) et ton message à "
     "Sophie (1). Tes réponses écrites ici servent à réfléchir."),
    ('Ce qui est vrai, ce qui est inventé :', "Smoby, sa plateforme de Moirans-en-Montagne (Jura), les règles sur "
     "l'embauche et l'autorisation de conduite sont réels. Sophie, Yanis, l'équipe, les absences et le planning sont "
     "inventés pour l'exercice.")],
    [('Lire le message de Sophie', 'Prepalog : Messagerie'),
     ('Les pièces à demander à Yanis', 'Prepalog : fiche d’arrivée'),
     ('Le premier jour de Yanis', 'Prepalog : fiche d’arrivée'),
     ('Le planning : compter avant de poser', 'Ce carnet et Planning des présences'),
     ('Poser les absences et envoyer', 'Prepalog : Planning des présences'),
     ("L'imprévu : Inès est malade", 'Prepalog : Planning des présences'),
     ('Faire le point avec Sophie', 'Prepalog : Messagerie')], nom_logo='SMOBY')

# ==================================================================== étape 1
T.etape(1, 'Lire le message de Sophie')
T.consignes(["Ouvre la Messagerie et lis le message de Sophie.",
             "Clique sur les mots soulignés si tu ne les connais pas.",
             "Réponds aux questions : tout se trouve dans le message."])
T.faits(['Qui arrive chez Smoby ?', 'Quel jour arrive-t-il ?', 'Avec quel contrat ?',
         'Quelles sont les deux choses à faire aujourd’hui ?'], hauteur=Cm(1.1))
T.encadre('Rappel de la séance ENT-5.1 :', "Yanis a été choisi parce qu'il a le CACES 3 encore valable, qu'il est "
          "libre le 9 décembre et qu'il accepte un CDD. Son contrat va du 9 décembre au 8 janvier.")
T.qcm([("Le contrat de Yanis s'arrête après Noël, et Smoby embauche des caristes chaque hiver. C'est…",
        ['un CDI', 'un CDD saisonnier', 'un contrat de vente'], 1)])
T.reflechir(["Yanis ne connaît encore personne chez Smoby. Pourquoi faut-il préparer son arrivée à l'avance, "
             "au lieu d'attendre qu'il soit là ?"])

# ==================================================================== étape 2
T.etape(2, 'Les pièces à demander à Yanis')
T.encadre('La règle (Code du travail) :', "l'employeur ne demande à un nouveau salarié que ce qui a un lien direct "
          "et nécessaire avec le poste. Le reste ne le regarde pas.")
T.consignes(["Ouvre la fiche d'arrivée (bouton sous le message de Sophie).",
             "Pour chaque pièce, décide au crayon : à demander, oui ou non ? Écris pourquoi en quelques mots.",
             "Coche ensuite à l'écran les pièces à demander. N'envoie pas encore la fiche : il reste l'étape 3."])
PIECES = ['Pièce d’identité', 'Numéro de sécurité sociale (carte Vitale)', 'Relevé de notes du collège', 'RIB',
          'Groupe sanguin', 'Copie des CACES 3 et 5', 'Extrait de casier judiciaire', 'Autorisation parentale']
T.tableau(['Pièce', 'À demander ? (oui / non)', 'Pourquoi ?'], 0, [Cm(5.6), Cm(3.4), Cm(8.0)], hauteur=Cm(1.05),
          remplis=[[x] for x in PIECES])
T.faits(['Combien de pièces faut-il demander ?', 'À quoi sert le RIB ?'], hauteur=Cm(0.9))
T.qcm([("Avant l'arrivée de Yanis, Smoby doit déclarer son embauche. Elle le fait auprès…",
        ['de la mairie', 'de l’Urssaf', 'du médecin du travail'], 1)])
T.reflechir(["Pourquoi l'employeur n'a-t-il pas le droit de demander le groupe sanguin ou les notes du collège ?"])

# ==================================================================== étape 3
T.etape(3, 'Le premier jour de Yanis')
T.encadre('Le CACES ne suffit pas :', "pour conduire un chariot chez Smoby, Yanis a besoin d'une autorisation de "
          "conduite, signée par l'employeur. Elle se donne après trois choses : le CACES, l'avis du médecin du "
          "travail et la connaissance des lieux.")
T.p("Dans la fiche d'arrivée, les cinq étapes du premier jour sont dans le désordre. Numérote-les ici de 1 (la "
    "première) à 5 (la dernière), puis remets-les dans l'ordre à l'écran avec les flèches.", apres=4)
DEPART = ['Remise de l’autorisation de conduite signée par Smoby', 'Premier déchargement au quai',
          'Remise des EPI (chaussures de sécurité, gilet haute visibilité, gants)',
          'Accueil par Sophie et signature du contrat', 'Visite de sécurité de la plateforme avec le chef de quai']
T.tableau(['Étape (dans l’ordre de l’écran)', 'Rang (1 à 5)'], 0, [Cm(13.6), Cm(3.4)], hauteur=Cm(0.95),
          remplis=[[x] for x in DEPART])
T.faits(['Que veut dire EPI ?', 'Qui signe l’autorisation de conduite de Yanis ?'], hauteur=Cm(0.9))
T.qcm([("Yanis a son CACES 3. Peut-il conduire un chariot chez Smoby dès qu'il arrive ?",
        ['oui, le CACES suffit', 'non, il lui faut d’abord l’autorisation de conduite de Smoby',
         'non, il doit repasser son CACES'], 1),
       ("Les chaussures de sécurité de Yanis sont payées par…", ['Yanis', 'Smoby', 'Sophie'], 1)])
T.consignes(["Relis toute ta fiche : les pièces cochées et l'ordre du premier jour.",
             "Envoie la fiche à Sophie. Rien n'est corrigé avant la fin de la séance : vérifie bien avant."])
T.reflechir(["Pourquoi la visite de sécurité de la plateforme vient-elle avant le premier déchargement ?"])

# ==================================================================== étape 4   (À REVOIR APRÈS LE TEST : libellés
# du planning, confirmation avant envoi du lot C, « Envoyer le planning »)
T.etape(4, 'Le planning : compter avant de poser')
T.p("Sophie te demande le planning de l'équipe pour les semaines du 7 et du 14 décembre. Ouvre le menu "
    "« Planning des présences » et regarde-le sans rien poser.", apres=4)
T.encadre_liste('Les règles du planning', [
    'Chaque jour, il faut assez de monde : c’est la ligne « Besoin ».',
    'Chaque jour, il faut au moins un cariste qui a le CACES (pour charger les camions).',
    'Une absence imposée (formation, visite médicale) se pose à sa date : elle ne bouge pas.',
    'Un congé demandé s’accorde à la date voulue… sauf s’il manque alors du monde : on le décale.'])
T.faits(['Combien de personnes compte l’équipe ? Écris leurs prénoms.', 'Quels salariés ont le CACES ?'],
        hauteur=Cm(0.9))
T.p("Avant de poser les cartes : si on accordait toutes les absences aux dates demandées, combien de personnes "
    "seraient présentes chaque jour ? Remplis le tableau au crayon (les absences sont sur les cartes "
    "« Demandes d'absence »).", apres=4)
T.tableau(['Jour', 'Besoin', 'Absents ce jour-là', 'Présents', 'Assez ? (oui / non)'], 0,
          [Cm(2.8), Cm(1.8), Cm(7.0), Cm(2.0), Cm(3.4)], hauteur=Cm(0.7), remplis=[[x] for x in NOMS_JOURS])
T.faits(['Quel jour manque-t-il du monde ?', 'Quels deux congés tombent ce jour-là ?'], hauteur=Cm(0.9))
T.etape(5, 'Poser les absences et envoyer')
T.consignes(["Pose les cartes sur le planning, chacune sur la ligne de la bonne personne.",
             "Décale un seul congé pour que le jour trouvé à l'étape 4 ait assez de monde.",
             "Vérifie les compteurs de chaque jour : présents, besoin, caristes CACES.",
             "Envoie le planning."])
T.qcm([("Mathis part en formation CACES le mardi 8 et le mercredi 9. Peut-on déplacer cette formation ?",
        ['oui, s’il manque du monde', 'non : la date est imposée par l’organisme de formation', 'oui, à la demande de Mathis'], 1)])
T.reflechir(["Léa a demandé 3 jours de congé le 5 novembre, Karim 1 jour le 20 novembre. Essaie de décaler l'un, "
             "puis l'autre : lequel trouve une place ? Pourquoi ?"])

# ==================================================================== étape 6   (À REVOIR APRÈS LE TEST)
T.etape(6, "L'imprévu : Inès est malade")
T.consignes(["Lis le message du responsable de la plateforme dans la Messagerie.",
             "Regarde la nouvelle carte et la nouvelle ligne du planning.",
             "Réponds aux questions, puis reprends le planning et renvoie-le."])
T.faits(['Du combien au combien Inès est-elle en arrêt maladie ?', 'Qui arrive pour aider, et à partir de quel jour ?',
         'Noa peut-il conduire un chariot ? Pourquoi ?',
         'Avec l’arrêt d’Inès, quel jour manque-t-il maintenant du monde ?',
         'Quel congé décales-tu, et à quelles dates ?'], hauteur=Cm(1.0))
T.qcm([("Inès est en arrêt maladie. Sur le planning, cette absence…",
        ['se décale s’il manque du monde', 'ne bouge pas : c’est une absence imposée', 'doit être refusée'], 1),
       ("Noa est intérimaire. Son employeur est…", ['Smoby', 'l’agence d’intérim', 'Sophie'], 1)])
T.reflechir(["Chloé avait demandé son congé dès le 2 novembre. Comment lui expliquer, poliment, qu'il est "
             "décalé ?"])

# ==================================================================== étape 7
T.etape(7, 'Faire le point avec Sophie')
T.consignes(["Sophie te demande de faire le point : ouvre son message et clique sur « Répondre ».",
             "Choisis une phrase par ligne. Ton constat doit dire ce que ton planning respecte vraiment.",
             "Relis tout ton message avant de l'envoyer."])
T.faits(['Par quelle formule commences-tu ton message ?', 'Quel constat choisis-tu ?',
         'Comment termines-tu ton message ?'], hauteur=Cm(1.1))
T.qcm([("Ton planning a assez de monde chaque jour. La phrase « J'ai annulé tous les congés. » est…",
        ['juste', 'fausse : les congés sont accordés quand c’est possible', 'plus polie'], 1)])
T.reflechir(["Pourquoi ton constat doit-il parler du cariste CACES, et pas seulement du nombre de personnes ?"])

# ==================================================================== feuille à détacher (cours)
ESSENTIEL = [("L'employeur ne demande au salarié que les pièces qui ont un {} avec le poste.", 'lien direct'),
             ("Pour conduire un chariot, il faut le CACES et une {} signée par l'employeur.", 'autorisation de conduite'),
             ('Une absence {} (formation, visite médicale, arrêt maladie) ne se déplace pas.', 'imposée'),
             ("Un congé demandé s'accorde à la date voulue, sauf si l'{} du jour devient trop faible.", 'effectif')]
LEXIQUE = [('EPI', 'Équipements de protection {} : chaussures de sécurité, gilet, gants. Fournis par l’employeur.',
            'individuelle'),
           ('DPAE', "Déclaration de l'embauche, faite à l'{} avant l'arrivée du salarié.", 'Urssaf'),
           ('intérimaire', "Salarié d'une {} d'intérim, envoyé dans une entreprise pour une mission.", 'agence'),
           ('arrêt maladie', 'Absence décidée par un {} : le salarié ne peut pas travailler.', 'médecin')]
T.feuille_cours('ENT-5.2', "Accueillir un salarié et planifier l'équipe",
                "AGOrA — procédure d'entrée (AGO-3.1), présences et congés (AGO-3.2)",
                [ph.format(T.TROU) for ph, _ in ESSENTIEL],
                [m for _, m in ESSENTIEL] + [m for _, _, m in LEXIQUE],
                [(mot, df.format(T.TROU)) for mot, df, _ in LEXIQUE])

# ==================================================================== corrigé de la trame
PIECES_REP = [['Pièce d’identité', 'oui', 'Pour vérifier qui il est et établir le contrat.'],
              ['Numéro de sécurité sociale (carte Vitale)', 'oui', 'Obligatoire pour déclarer l’embauche.'],
              ['Relevé de notes du collège', 'non', 'Aucun lien avec le poste.'],
              ['RIB', 'oui', 'Pour verser son salaire.'],
              ['Groupe sanguin', 'non', 'Donnée de santé : l’employeur n’a pas à la demander.'],
              ['Copie des CACES 3 et 5', 'oui', 'Le poste demande de conduire des chariots.'],
              ['Extrait de casier judiciaire', 'non', 'Réservé à certains métiers (sécurité, petite enfance).'],
              ['Autorisation parentale', 'non', 'Yanis est majeur.']]
assert [r[0] for r in PIECES_REP] == PIECES
ORDRE_JUSTE = ['Accueil par Sophie et signature du contrat',
               'Remise des EPI (chaussures de sécurité, gilet haute visibilité, gants)',
               'Visite de sécurité de la plateforme avec le chef de quai',
               'Remise de l’autorisation de conduite signée par Smoby', 'Premier déchargement au quai']
assert sorted(ORDRE_JUSTE) == sorted(DEPART)
mer16 = NOMS_JOURS[7]

ENT_5_2 = {
 "Qui arrive chez Smoby": {"rep": "Yanis Morel, le cariste recruté en ENT-5.1."},
 "Quel jour arrive-t-il": {"rep": "Le mercredi 9 décembre (2026)."},
 "Avec quel contrat": {"rep": "Un CDD saisonnier."},
 "Quelles sont les deux choses à faire": {"rep": "Préparer l'arrivée de Yanis (fiche d'arrivée), puis faire le planning de l'équipe pour les deux semaines du pic."},
 "Yanis ne connaît encore personne": {"pistes": [
   "Il faut que ses papiers, son contrat et ses EPI soient prêts le jour J : sinon il attend sans travailler.",
   "On ne peut pas le laisser conduire sans autorisation : il faut prévoir la visite et l'autorisation.",
   "Un nouveau bien accueilli se sent attendu, comprend vite les règles et reste plus volontiers.",
   "En plein pic de Noël, l'équipe n'a pas le temps d'improviser."]},
 "T: Pièce | À demander ?": {"lignes": PIECES_REP,
   "note": "Règle : lien direct et nécessaire avec le poste (Code du travail, art. L1221-6). Même tableau que le bilan de la séance (jalons 1 et 2). Accepter toute explication équivalente."},
 "Combien de pièces faut-il demander": {"rep": "4 : pièce d'identité, numéro de sécurité sociale, RIB, copie des CACES."},
 "À quoi sert le RIB": {"rep": "À verser le salaire de Yanis sur son compte."},
 "Pourquoi l'employeur n'a-t-il pas le droit": {"pistes": [
   "Ces informations n'ont aucun lien avec le travail de cariste.",
   "Le groupe sanguin est une donnée de santé : elle reste privée (seul le médecin du travail juge l'aptitude).",
   "Elles pourraient servir à écarter quelqu'un injustement (discrimination).",
   "La vie privée du salarié est protégée : l'employeur ne demande que le nécessaire."]},
 "T: Étape (dans l’ordre de l’écran) | Rang": {"lignes": [[e, str(ORDRE_JUSTE.index(e) + 1)] for e in DEPART],
   "note": "Ordre juste : " + ' → '.join(f'{k + 1}. {e}' for k, e in enumerate(ORDRE_JUSTE)) + ". Jalon 3. Erreur la plus fréquente attendue : l'autorisation de conduite avant la visite (le bilan le dit)."},
 "Que veut dire EPI": {"rep": "Équipements de protection individuelle (ici : chaussures de sécurité, gilet haute visibilité, gants)."},
 "Qui signe l’autorisation de conduite": {"rep": "L'employeur : Smoby.", "note": "Art. R4323-56 du Code du travail : après la formation (CACES), l'avis du médecin du travail et la connaissance des lieux."},
 "Pourquoi la visite de sécurité": {"pistes": [
   "Yanis doit connaître les lieux (allées, quais, zones piétons, sorties de secours) avant de conduire.",
   "La connaissance des lieux est une des conditions de l'autorisation de conduite : elle vient donc avant.",
   "Décharger sans connaître les règles du site, c'est risquer un accident (piéton, chute de charge)."]},
 "Combien de personnes compte l’équipe": {"rep": "6 : Karim, Léa, Mathis, Inès, Chloé et Yanis (Yanis à partir du mercredi 9)."},
 "Quels salariés ont le CACES": {"rep": "Karim, Léa et Yanis."},
 "T: Jour | Besoin | Absents": {"lignes": TAB4,
   "note": "Calculé depuis les données de la séance : toutes les absences à la date demandée. Seul le " + mer16 + " manque de monde (Karim et Léa en congé le même jour). Le planning à l'écran le signale aussi en direct."},
 "Quel jour manque-t-il du monde ?": {"rep": f"Le {mer16} : 4 présents pour un besoin de 5."},
 "Quels deux congés tombent ce jour-là": {"rep": "Celui de Karim (1 jour) et celui de Léa (du mer 16 au ven 18)."},
 "Léa a demandé 3 jours de congé": {"pistes": [
   "Seul le congé de Karim trouve une place : un jour, c'est facile à placer (" + ', '.join(OPT_KARIM) + ").",
   "Les 3 jours de Léa ne tiennent nulle part" + (" ailleurs" if not OPT_LEA else "") + " : chaque fois, un autre jour manque de monde (formation de Mathis, visite d'Inès, congé de Chloé, Yanis pas encore arrivé).",
   "En plus, Léa a demandé la première : garder son congé est aussi plus juste.",
   "Dans tous les cas : on prévient Karim et on lui propose la nouvelle date."],
   "note": "Calculé : dates où chaque congé peut aller, les autres absences restant à leur date (Léa : " + (', '.join(OPT_LEA) or 'aucune') + "). Le jalon « congés » est faux si un congé est décalé sans nécessité."},
 "Du combien au combien Inès": {"rep": "Du lundi 14 au mercredi 16 décembre (3 jours)."},
 "Qui arrive pour aider": {"rep": "Noa, un intérimaire, à partir du mardi 15."},
 "Noa peut-il conduire un chariot": {"rep": "Non : il n'a pas le CACES (et n'aurait pas non plus d'autorisation de conduite de Smoby). Il compte dans l'effectif, pas comme cariste."},
 "Avec l’arrêt d’Inès, quel jour": {"rep": "Le lundi 14 : Inès et Chloé sont absentes, Noa n'est pas encore arrivé ; 4 présents pour un besoin de 5.",
   "note": "Vrai quel que soit le congé décalé à l'étape 5 (vérifié par le script), sauf si l'élève a mis Karim le lun 14."},
 "Quel congé décales-tu, et à quelles dates": {"rep": "Celui de Chloé (2 jours), par exemple au jeudi 17 et vendredi 18.",
   "note": "En partant de la solution du corrigé (Karim décalé), Chloé peut commencer : " + ', '.join(OPT_CHLOE) + ". D'autres plannings justes existent : le moteur juge les règles."},
 "Chloé avait demandé son congé dès le 2 novembre": {"pistes": [
   "Lui parler tôt, en face, sans attendre la veille.",
   "Expliquer la raison (Inès est en arrêt, il manquerait du monde le lundi 14) sans parler de la santé d'Inès plus que nécessaire.",
   "Lui proposer une autre date et la remercier.",
   "Le congé n'est pas supprimé : il est déplacé."],
   "note": "Pour l'enseignant : en droit, l'employeur ne peut modifier les dates de congé moins d'un mois avant le départ, sauf circonstances exceptionnelles (Code du travail, art. L3141-16). Ici, la situation est simplifiée."},
 "Par quelle formule commences-tu": {"rep": "« Bonjour Sophie, »"},
 "Quel constat choisis-tu": {"rep": "« Chaque jour a assez de monde et au moins un cariste CACES. »", "note": "Précédé de la phrase imposée « J'ai repris le planning après l'arrêt d'Inès. »"},
 "Comment termines-tu ton message": {"rep": "« Peux-tu valider ? Merci, bonne journée. »", "note": "Phrase du lot A (décision 4a de Tristan : le tu poli)."},
 "Pourquoi ton constat doit-il parler du cariste": {"pistes": [
   "Sans cariste CACES, personne ne peut charger les camions : avoir assez de monde ne suffit pas.",
   "Noa compte dans l'effectif, mais il ne peut pas conduire.",
   "Sophie doit pouvoir vérifier les deux règles du planning en lisant une seule phrase."]},
}
for ph, mot in ESSENTIEL:
    ENT_5_2[ph.split('{}')[0].strip()] = {"rep": mot + '.'}
ENT_5_2['T: Mot | Définition (complète avec la banque de mots)'] = {
    "lignes": [[mot, m] for mot, _, m in LEXIQUE], "note": "Un mot de la banque par trou."}
corriges_data._DICOS['ENT-5.2'] = [ENT_5_2]

NOTIONS = [
    ["Le contrat de Yanis s'arrête", "Types de contrats (M5)", "Un besoin qui revient chaque année à la même période appelle un CDD saisonnier."],
    ["Avant l'arrivée de Yanis", "Formalités d'embauche (M5)", "La déclaration préalable à l'embauche (DPAE) se fait auprès de l'Urssaf, avant l'arrivée du salarié."],
    ["Yanis a son CACES 3", "Sécurité au travail", "Le CACES prouve la formation ; l'employeur délivre ensuite l'autorisation de conduite (art. R4323-56)."],
    ["Les chaussures de sécurité", "Sécurité au travail", "Les EPI sont fournis gratuitement par l'employeur (art. R4323-95)."],
    ["Mathis part en formation", "Planifier les présences", "Une absence imposée (formation, visite, arrêt) se pose à sa date : on organise le reste autour."],
    ["Inès est en arrêt maladie", "Planifier les présences", "Une absence imposée (formation, visite, arrêt) se pose à sa date ; seul un congé demandé peut se décaler."],
    ["Noa est intérimaire", "Types de contrats (M5)", "L'intérimaire signe un contrat de mission avec l'agence d'intérim, son employeur, qui le met à disposition de l'entreprise."],
    ["Ton planning a assez de monde", "Planifier les présences", "Un congé s'accorde quand c'est possible : on ne l'annule pas sans nécessité."],
]
T.finir('ENT-5.2', 'Smoby — l’arrivée de Yanis', 'ENT-5.2-smoby-arrivee-trame-eleve', NOTIONS,
        os.path.basename(__file__))
