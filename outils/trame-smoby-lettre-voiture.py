# -*- coding: utf-8 -*-
"""Trame élève d'ENT-5.8 Smoby / Kuehne+Nagel, « la lettre de voiture et le retard » (Cowork, 06/10/2026 au soir)
— BROUILLON.

Format LONG (6 étapes + feuille de cours à détacher), comme ENT-5.1 à 5.7 (décision de Tristan du 06/10/2026).
Écrite AVANT la validation à l'écran, à la demande de Tristan (« toute la suite 5.3 → 5.8 ») : libellés repris de
`contenus/smoby-ent58.js` sans avoir joué la séance — « À REVOIR APRÈS L'ESSAI À L'ÉCRAN ».

Vérifié (brief ENT-5.8 §2) : le contrat de transport à trois parties (Code de commerce, art. L132-8) ; Kuehne+Nagel et son agence Route de Besançon ; les mentions de la lettre de voiture
nationale (arrêté du 9 novembre 1999 : expéditeur, transporteur, destinataire, lieux et dates de prise en charge et de
livraison, nature, quantité et poids ; signatures).
Construit (comme dans la séance) : le contrat Smoby ↔ K+N, Jouets du Rhône (fictif, Corbas), Julie, l'accident.

Données recopiées de `contenus/smoby-ent58.js` et `contenus/smoby.js` (relus le 06/10/2026) ; le poids de la palette
mixte est RECALCULÉ depuis la commande de `contenus/smoby-entrepot.js` (comme le contenu), et l'heure d'arrivée
depuis le départ, la conduite et le retard. Le script s'arrête si l'une diffère de la séance.

Lancer : python3 outils/trame-smoby-lettre-voiture.py
puis    soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/ENT-5.8-smoby-lettre-voiture-trame-eleve.docx
"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trame_commun as T
import corriges_data
from docx.shared import Cm

LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'smoby.png')

# ==================================================================== données
with open(os.path.join(T.RACINE, 'contenus', 'smoby-entrepot.js'), encoding='utf-8') as f:
    _SRC = f.read()
KG = {k: float(x) for k, x in re.findall(r"^\s+([A-Z]{3}): \{ nom: .*?carton: \{ kg: ([\d.]+),", _SRC, re.M)}
LIGNES = [(p, int(q)) for p, q in re.findall(r"\{ a: '[AB]\d-T0\d-N1-E\d', produit: '([A-Z]{3})', q: (\d+) \}", _SRC)]
KG_MIXTE = round(25 + sum(q * KG[p] for p, q in LIGNES))
PALETTES, KG_COMPLETE = 33, 180                    # E1 (contenus/smoby.js) ; palette complète (smoby-ent58.js)
POIDS = (PALETTES - 1) * KG_COMPLETE + KG_MIXTE
assert (KG_MIXTE, POIDS) == (331, 6091), (KG_MIXTE, POIDS)
DEPART, CONDUITE, RETARD, LIMITE = 6 * 60, 240, 60, 12 * 60   # Julie, Semi n° 1 (SOLUTION.v2 d'ENT-5.7)
PREVUE, ARRIVEE = DEPART + CONDUITE, DEPART + CONDUITE + RETARD
assert (PREVUE, ARRIVEE) == (600, 660)


def hm(m):
    return f'{m // 60} h {m % 60:02d}'


# ==================================================================== la trame
T.nouveau()
T.entete(LOGO, 'ENT-5.8 — Carnet de suivi : la lettre de voiture et le retard', [
    ('Ce document est ta trame de travail :', "tu peux le suivre seul, étape par étape. Tu es toujours agent "
     "d'exploitation chez Kuehne+Nagel, à Besançon. Ce jeudi 10 décembre au matin, Julie part chercher l'enlèvement "
     "E1 chez Smoby : tu prépares sa lettre de voiture, puis tu gères un imprévu sur la route."),
    ('Ce que ton enseignant voit dans son suivi :', "huit points : la lettre de voiture (expéditeur et destinataire, "
     "transport, lieux et dates, marchandise, lettre complète : 5), la nouvelle heure d'arrivée (1), ton message au "
     "client (1) et ton message à Smoby (1). Tes réponses écrites ici servent à réfléchir."),
    ('Ce qui est vrai, ce qui est inventé :', "Smoby, Kuehne+Nagel et les mentions de la lettre de voiture sont réels. "
     "Le client Jouets du Rhône, Julie, les documents et l'accident sont inventés pour l'exercice. Les documents sont "
     "des reconstitutions.")],
    [('Le message de ton responsable', 'Prepalog : Messagerie'),
     ('Lire les trois documents', 'Prepalog : pièces jointes'),
     ('Remplir la lettre de voiture', 'Prepalog : Lettre de voiture'),
     ('L’accident : la nouvelle heure', 'Prepalog : Suivi de l’enlèvement E1'),
     ('Prévenir le client', 'Prepalog : Messagerie'),
     ('Prévenir Smoby, et la fin de l’histoire', 'Prepalog : Messagerie')], nom_logo='SMOBY')

# ==================================================================== étape 1
T.etape(1, 'Le message de ton responsable')
T.consignes(["Ouvre la Messagerie et lis le message de ton responsable.",
             "Clique sur les mots soulignés si tu ne les connais pas.",
             "Réponds aux questions."])
T.faits(['Quel chauffeur part ce matin, et à quelle heure ?', 'Pour quel enlèvement ? Combien de palettes ?',
         'Quels sont les trois documents joints ?', 'Si quelque chose arrive sur la route, qui préviens-tu ?'],
        hauteur=Cm(1.0))
T.qcm([("La lettre de voiture, c'est…",
        ['une lettre de remerciement au chauffeur', 'le document de transport qui accompagne la marchandise',
         'la facture du transport'], 1)])
T.reflechir(["Pourquoi un camion doit-il rouler avec un document qui dit qui envoie, qui transporte et qui reçoit ?"])

# ==================================================================== étape 2   (À REVOIR APRÈS L'ESSAI À L'ÉCRAN)
T.etape(2, 'Lire les trois documents')
T.consignes(["Ouvre les trois pièces jointes : l'ordre d'enlèvement, la fiche client, le planning.",
             "Pour chaque information, trouve le document qui la donne, puis recopie-la."])
INFOS = ['Qui envoie la marchandise (expéditeur)', 'Où se fait le chargement', 'Qui reçoit (destinataire), et où',
         'Le chauffeur et le camion d’E1', 'Le jour du transport', 'La nature de la marchandise',
         'Le nombre de palettes', 'Le poids brut total', 'L’heure limite de livraison', 'Le quai du client']
T.tableau(['Information', 'Document', 'Ce que tu trouves'], 0, [Cm(6.0), Cm(3.6), Cm(7.4)], hauteur=Cm(0.9),
          remplis=[[x] for x in INFOS])
T.faits([f'Vérifie le poids brut : {PALETTES - 1} palettes complètes de {KG_COMPLETE} kg + la palette mixte de '
         f'{KG_MIXTE} kg (ENT-5.6) = ?'], hauteur=Cm(0.95))
T.qcm([("L'ordre d'enlèvement est écrit par…", ['Smoby', 'Jouets du Rhône', 'Julie'], 0)])
T.reflechir(["Pourquoi l'information est-elle répartie entre trois documents, et pas sur un seul ?"])

# ==================================================================== étape 3   (À REVOIR APRÈS L'ESSAI À L'ÉCRAN)
T.etape(3, 'Remplir la lettre de voiture')
T.encadre_texte('Le contrat de transport : trois parties', [
    "« La lettre de voiture forme un contrat entre l'expéditeur, le voiturier et le destinataire. »"],
    'Code de commerce, article L132-8 (début). Le voiturier, c’est le transporteur.')
T.encadre_liste('Trois parties, trois rôles :', [
    'l’expéditeur remet la marchandise : le camion la charge chez lui ;',
    'le transporteur la déplace, avec ses chauffeurs et ses camions ;',
    'le destinataire la reçoit : le camion la livre chez lui.'],
    intro='la lettre de voiture les nomme toutes les trois, avec les lieux et dates de chargement et de livraison, '
          'la nature, la quantité et le poids de la marchandise (arrêté du 9 novembre 1999).')
T.p("Avant d'ouvrir la lettre : dans cette commande, qui joue chaque rôle ? Déduis-le des documents.", apres=4)
T.tableau(['Rôle', 'Qui, dans cette commande ?', 'Comment le sais-tu ?'], 0, [Cm(3.4), Cm(5.8), Cm(7.8)],
          hauteur=Cm(0.8), remplis=[['Expéditeur'], ['Transporteur'], ['Destinataire']])
T.consignes(["Ouvre la lettre de voiture. Remplis chaque case à partir des documents (pas de mémoire).",
             "Recopie ici ce que tu choisis, case par case.",
             "Relis tout : une case vide ou fausse, et la lettre part quand même. Puis envoie-la à Julie."])
CASES = ['1. Expéditeur : nom et adresse', '2. Destinataire : nom et adresse', '3. Transporteur, chauffeur, véhicule',
         '4. Chargement : lieu et date', '5. Livraison : lieu et date', '6. Marchandise : nature, palettes, poids']
T.tableau(['Case', 'Ce que tu as choisi ou écrit'], 0, [Cm(5.6), Cm(11.4)], hauteur=Cm(0.85),
          remplis=[[x] for x in CASES])
T.reflechir(["Si l'expéditeur et le destinataire étaient inversés sur la lettre, que pourrait-il arriver ?"])

# ==================================================================== étape 4
T.etape(4, 'L’accident : la nouvelle heure')
T.consignes(["Lis le message de Julie.", "Ouvre le suivi de l'enlèvement E1. Calcule ici d'abord.",
             "Écris l'heure d'arrivée, réponds oui ou non, puis envoie à ton responsable."])
T.encadre('Pour calculer :', "pars de l'heure d'arrivée prévue au planning et ajoute le retard. Le temps où Julie "
          "est arrêtée, moteur coupé, ne compte pas comme de la conduite.")
T.tableau(['Calcul', 'Ta réponse'], 0, [Cm(11.0), Cm(6.0)], hauteur=Cm(0.9),
          remplis=[['Heure de départ de Julie (planning)'], ['Temps de conduite jusqu’à Corbas (E1)'],
                   ['Heure d’arrivée prévue'], ['Retard annoncé par Julie'], ['Nouvelle heure d’arrivée'],
                   ['Heure limite de livraison (fiche client)'], ['Encore avant l’heure limite ? (oui / non)']])
T.faits(['À quelle heure, et où, l’accident a-t-il lieu ?'], hauteur=Cm(0.9))
T.qcm([("Julie est arrêtée, moteur coupé. Dans la séance, ce temps…",
        ['compte comme de la conduite', 'ne compte pas comme de la conduite', 'annule la livraison'], 1)])
T.reflechir(["Le retard tient encore dans l'heure limite. Pourquoi prévenir quand même le client ?"])

# ==================================================================== étape 5
T.etape(5, 'Prévenir le client')
T.encadre('Qui dit « vous » :', "le client est une autre entreprise : tu lui écris au « vous », au nom de "
          "Kuehne+Nagel, avec une formule de politesse. Ton message dit la cause, la nouvelle heure, et ce dont tu as "
          "besoin.")
T.consignes(["Lis le message du service réception de Jouets du Rhône.",
             "Clique sur « Répondre » et choisis une phrase par ligne.",
             "Relis : chaque phrase doit être vraie (heure, cause, quai). Puis envoie."])
T.faits(['Quelle formule choisis-tu pour commencer ?', 'Quelle cause et quel retard annonces-tu ?',
         'À quelle heure le camion arrivera-t-il ?', 'Quel quai demandes-tu ?', 'Comment termines-tu ?'],
        hauteur=Cm(0.95))
T.qcm([("La phrase « Il arrivera vers 12 h 30, avant votre heure limite. » est…",
        ['juste', 'fausse : 12 h 30, c’est après 12 h 00', 'plus rassurante, donc meilleure'], 1)])
T.reflechir(["Pourquoi demander au client de confirmer que le quai 4 sera libre ?"])

# ==================================================================== étape 6
T.etape(6, 'Prévenir Smoby, et la fin de l’histoire')
T.consignes(["Bruno (Smoby) demande si tout va bien : clique sur « Répondre ».",
             "Choisis une phrase par ligne, relis, envoie.", "Lis le dernier message de ton responsable."])
T.faits(['Quelle livraison est en retard, et pourquoi ?', 'Faut-il demander à Smoby de prévenir le client ? Pourquoi ?',
         'Que dit ton responsable pour finir ?'], hauteur=Cm(1.0))
T.qcm([("On prévient aussi l'expéditeur du retard, parce que…",
        ['c’est son client qui attend sa marchandise', 'il doit envoyer un autre camion', 'il paie l’amende'], 0)])
T.reflechir(["De la fiche de poste (ENT-5.1) à la lettre de voiture (ENT-5.8), tu as suivi la commande de Noël. "
             "Quel métier as-tu préféré : RH, cariste ou exploitation transport ? Pourquoi ?",
             "Cite un moment de la série où une erreur aurait gêné toute la suite."])

# ==================================================================== feuille à détacher (cours)
ESSENTIEL = [('La lettre de voiture accompagne la {} pendant le transport.', 'marchandise'),
             ('L’expéditeur {} la marchandise ; le destinataire la reçoit.', 'envoie'),
             ('Le {} la transporte avec ses chauffeurs et ses camions.', 'transporteur'),
             ('Un retard se signale au client dès qu’il est {}.', 'connu')]
LEXIQUE = [('poids brut', 'Poids de la marchandise avec ses emballages et ses {}.', 'palettes'),
           ('ordre d’enlèvement', 'Demande écrite de l’expéditeur : venir chercher la marchandise tel {}, à telle adresse.', 'jour'),
           ('palette Europe', 'Palette de bois de 80 cm × {} cm.', '120'),
           ('destinataire', 'L’entreprise qui {} la marchandise.', 'reçoit')]
T.feuille_cours('ENT-5.8', 'Le dossier transport et le suivi',
                'OTM — C2.1 constituer le dossier transport, C2.3 suivre l’opération, communiquer',
                [ph.format(T.TROU) for ph, _ in ESSENTIEL],
                [m for _, m in ESSENTIEL] + [m for _, _, m in LEXIQUE],
                [(mot, df.format(T.TROU)) for mot, df, _ in LEXIQUE])

# ==================================================================== corrigé de la trame
SOURCES = [['Smoby Toys — plateforme logistique', 'Ordre d’enlèvement'],
           ['Moirans-en-Montagne (39260)', 'Ordre d’enlèvement'],
           ['Jouets du Rhône (fictif) — entrepôt, Corbas (69960)', 'Fiche client'],
           ['Julie, Semi n° 1', 'Planning'], ['Jeudi 10 décembre 2026', 'Ordre d’enlèvement (et planning)'],
           ['Jouets (maisons de jardin, cuisines, porteurs)', 'Ordre d’enlèvement'],
           [str(PALETTES) + ' palettes Europe', 'Ordre d’enlèvement'], [f'{POIDS:,} kg'.replace(',', ' '), 'Ordre d’enlèvement'],
           ['Avant 12 h 00', 'Fiche client'], ['Quai 4', 'Fiche client']]
ENT_5_8 = {
 "Quel chauffeur part ce matin": {"rep": "Julie, à 6 h 00."},
 "Pour quel enlèvement ? Combien de palettes": {"rep": f"L'enlèvement E1 (commande de Noël pour Lyon), {PALETTES} palettes."},
 "Quels sont les trois documents joints": {"rep": "L'ordre d'enlèvement (Smoby), la fiche client (Jouets du Rhône) et le planning des chauffeurs."},
 "Si quelque chose arrive sur la route": {"rep": "Le client (Jouets du Rhône) et Smoby."},
 "Pourquoi un camion doit-il rouler avec un document": {"pistes": [
   "En cas de contrôle routier, le chauffeur prouve ce qu'il transporte et pour qui.",
   "À la livraison, le destinataire vérifie et signe : la lettre prouve que la marchandise est arrivée (ou note les réserves).",
   "En cas de dommage ou de litige, on sait qui est responsable de quoi."]},
 "T: Information | Document": {"lignes": [[i] + list(reversed(s)) for i, s in zip(INFOS, SOURCES)],
   "note": "Colonnes : information, document, ce qu'on y trouve. Le planning est celui d'ENT-5.7 après la panne (Julie, Semi n° 1, départ 6 h)."},
 "Vérifie le poids brut": {"rep": f"{PALETTES - 1} × {KG_COMPLETE} = {(PALETTES - 1) * KG_COMPLETE} ; + {KG_MIXTE} = {POIDS} kg, comme sur l'ordre d'enlèvement."},
 "Pourquoi l'information est-elle répartie": {"pistes": [
   "Chacun écrit ce qu'il sait : Smoby sa marchandise, le client ses horaires, l'exploitation ses chauffeurs.",
   "L'agent d'exploitation rassemble tout : c'est son métier.",
   "Une information recopiée d'un seul document garde sa source : on sait où vérifier."]},
 "T: Rôle | Qui, dans cette commande": {"lignes": [
     ['Expéditeur', 'Smoby (plateforme de Moirans-en-Montagne)', 'L’ordre d’enlèvement vient de Smoby ; le camion charge à Moirans.'],
     ['Transporteur', 'Kuehne+Nagel (agence de Besançon)', 'C’est l’entreprise de Julie et du Semi n° 1 ; elle reçoit l’ordre d’enlèvement.'],
     ['Destinataire', 'Jouets du Rhône (Corbas)', 'La fiche client : livrer à Corbas, quai 4, avant 12 h.']],
   "note": "Décision de Tristan (06/10, après l'essai à l'écran) : la trame explique les trois rôles sans dire qui est qui ; l'élève le déduit (piège de l'écran : expéditeur et destinataire inversés, Smoby comme transporteur)."},
 "T: Case | Ce que tu as choisi": {"lignes": [
     [CASES[0], 'Smoby Toys — plateforme logistique ; Moirans-en-Montagne (39260)'],
     [CASES[1], 'Jouets du Rhône (fictif) — entrepôt ; Corbas (69960)'],
     [CASES[2], 'Kuehne+Nagel — agence Route de Besançon ; Julie ; Semi n° 1'],
     [CASES[3], 'Moirans-en-Montagne (39260) ; 10/12/2026'], [CASES[4], 'Corbas (69960) ; 10/12/2026'],
     [CASES[5], f"Jouets (maisons de jardin, cuisines, porteurs) ; {PALETTES} palettes ; {POIDS} kg"]],
   "note": "La lettre est établie le 10/12/2026. Jalons 1 à 5 (le 5 : aucune case vide). Pièges : expéditeur et destinataire inversés ; Smoby comme transporteur ; Moirans comme lieu de livraison ; École-Valentin (l'agence) comme lieu."},
 "Si l'expéditeur et le destinataire étaient inversés": {"pistes": [
   "Le chauffeur pourrait livrer au mauvais endroit, ou ne pas savoir où charger.",
   "En cas de problème, on ne saurait plus qui doit payer ou recevoir.",
   "La lettre ne prouverait plus rien : elle serait fausse."]},
 "T: Calcul | Ta réponse": {"lignes": [['Départ', hm(DEPART)], ['Conduite', hm(CONDUITE)], ['Arrivée prévue', hm(PREVUE)],
     ['Retard', hm(RETARD)], ['Nouvelle arrivée', hm(ARRIVEE)], ['Heure limite', hm(LIMITE)], ['Avant ?', 'oui']],
   "note": "Jalon 6 : 11 h 00 et « Oui ». Simplification assumée par la séance : le temps arrêté, moteur coupé, ne compte pas comme de la conduite."},
 "À quelle heure, et où, l’accident": {"rep": "À 8 h 30, sur l'autoroute A40 (fermée)."},
 "Le retard tient encore dans l'heure limite": {"pistes": [
   "Le client organise sa réception (personnel, quai) : il doit savoir quand le camion arrive.",
   "Un retard peut encore s'allonger : le client doit être averti tôt.",
   "Prévenir, c'est garder la confiance du client (et la consigne de la fiche client le demande)."]},
 "Quelle formule choisis-tu pour commencer": {"rep": "« Bonjour, »"},
 "Quelle cause et quel retard": {"rep": "« Notre camion a 1 h de retard à cause d'un accident sur l'A40. »"},
 "À quelle heure le camion arrivera-t-il": {"rep": "« Il arrivera vers 11 h 00, avant votre heure limite. »"},
 "Quel quai demandes-tu": {"rep": "« Pouvez-vous nous confirmer que le quai 4 sera libre ? »"},
 "Comment termines-tu": {"rep": "« Cordialement, l'exploitation Kuehne+Nagel Besançon »", "note": "Jalon 7 : toutes les lignes justes."},
 "Pourquoi demander au client de confirmer": {"pistes": [
   "Le camion arrive plus tard que prévu : un autre camion a peut-être pris le quai 4.",
   "Julie ne doit pas attendre en arrivant : elle a ses temps de conduite à respecter.",
   "Le quai 4 est celui de la fiche client (pas le quai 1)."]},
 "Quelle livraison est en retard, et pourquoi": {"rep": "« La livraison E1 pour Jouets du Rhône aura 1 h de retard (accident). »"},
 "Faut-il demander à Smoby de prévenir le client": {"rep": "Non : « Le client est prévenu. » C'est le transporteur qui l'a fait (étape 5).", "note": "Jalon 8 : toutes les lignes justes (« Bonjour Bruno, » … « Cordialement, »)."},
 "Que dit ton responsable pour finir": {"rep": "Que c'est noté : la commande de Noël est sur la route, fin de la mission."},
 "De la fiche de poste (ENT-5.1)": {"pistes": ["Réponse personnelle : un métier nommé et une raison (une tâche aimée, une difficulté)."]},
 "Cite un moment de la série": {"pistes": [
   "Un congé mal posé (ENT-5.2) : pas assez de caristes au pic.",
   "Un camion non calé (ENT-5.4) : accident au quai.",
   "34 porteurs saisis 36 (ENT-5.5) : commande incomplète.",
   "Une palette mal montée (ENT-5.6) : jouets écrasés.",
   "Un chauffeur sans repos (ENT-5.7) : danger sur la route.",
   "Une lettre fausse (ENT-5.8) : livraison au mauvais endroit."]},
}
for ph, mot in ESSENTIEL:
    ENT_5_8[ph.split('{}')[0].strip()] = {"rep": mot + '.'}
ENT_5_8['T: Mot | Définition (complète avec la banque de mots)'] = {
    "lignes": [[mot, m] for mot, _, m in LEXIQUE], "note": "Un mot de la banque par trou."}
corriges_data._DICOS['ENT-5.8'] = [ENT_5_8]

NOTIONS = [
    ["La lettre de voiture, c'est", "Documents de transport", "La lettre de voiture accompagne la marchandise : expéditeur, transporteur, destinataire, lieux, dates, marchandise (arrêté du 9 novembre 1999)."],
    ["L'ordre d'enlèvement est écrit", "Documents de transport", "L'ordre d'enlèvement est la demande de l'expéditeur au transporteur."],
    ["Julie est arrêtée, moteur coupé", "Suivi du transport", "Simplification de la séance : seul le temps au volant compte comme conduite."],
    ["La phrase « Il arrivera vers 12 h 30", "Communication écrite", "Un message au client ne contient que des informations vraies et vérifiées."],
    ["On prévient aussi l'expéditeur", "Suivi du transport", "L'expéditeur est prévenu d'un retard : c'est sa marchandise et son client."],
]
T.finir('ENT-5.8', 'Kuehne+Nagel — la lettre de voiture et le retard', 'ENT-5.8-smoby-lettre-voiture-trame-eleve',
        NOTIONS, os.path.basename(__file__))
