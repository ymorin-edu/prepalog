# -*- coding: utf-8 -*-
"""Trame élève d'ENT-5.5 Smoby, « ranger et saisir l'entrée » (Cowork, 06/10/2026 au soir) — BROUILLON.

Format LONG (6 étapes + feuille de cours à détacher), comme ENT-5.1 à 5.4 (décision de Tristan du 06/10/2026).
Écrite AVANT la validation à l'écran, à la demande de Tristan (« toute la suite 5.3 → 5.8 ») : les passages marqués
« À REVOIR APRÈS L'ESSAI À L'ÉCRAN » reprennent les libellés de `contenus/smoby-ent55.js` sans avoir joué la séance.

Vérifié (brief ENT-5.5 §2) : la plateforme de stockage de Smoby à Moirans-en-Montagne ; le CACES R489 catégorie 5
pour le chariot à mât rétractable ; la plaque de charge des racks (INRS ED 771).
Construit (comme dans la séance) : le plan, le stock, les poids, les rotations, le lot, le flux vers Kuehne+Nagel.

Le plan, le stock et les règles sont LUS dans `contenus/smoby-entrepot.js` ; les palettes et leur fiche (poids,
rotation, contrainte) recopiées de `contenus/smoby-ent55.js` (relu le 06/10/2026). Les bonnes adresses sont
RECALCULÉES ici avec les six règles de la séance et comparées à celles du brief §4 (le script s'arrête si elles
diffèrent) ; la charge d'un niveau et le stock de porteurs aussi.

Lancer : python3 outils/trame-smoby-rangement.py
puis    soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/ENT-5.5-smoby-rangement-trame-eleve.docx
"""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trame_commun as T
import corriges_data
from docx.shared import Cm

LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'smoby.png')

# ==================================================================== la plateforme (lue dans contenus/smoby-entrepot.js)
with open(os.path.join(T.RACINE, 'contenus', 'smoby-entrepot.js'), encoding='utf-8') as f:
    _SRC = f.read()
STOCK = {a: (p, int(kg)) for a, p, kg in re.findall(r"'([AB][12]-T0\d-N\d-E\d)': S\('([A-Z]{3})', (\d+)\)", _SRC)}
assert len(STOCK) == 99, len(STOCK)
COUCHES = {k: eval(c.replace('[', '(').replace(']', ')')) for k, c in
           re.findall(r"^\s+([A-Z]{3}): \{ nom: '[^']+', ref: '[^']+', gamme: '[A-Z]+', couches: (\[[\d, ]+\])", _SRC, re.M)}
PAR_PALETTE = {k: c[0] * c[1] * c[2] for k, c in COUCHES.items()}
HORS_SERVICE = re.search(r"horsService: \[([^\]]+)\]", _SRC).group(1).replace("'", '').replace(' ', '').split(',')
# côtés : gammes et plaques (relus dans PLAN.cotes)
COTES = {c: ([g.strip(" '") for g in gam.split(',')], int(n1), int(n2), int(n3)) for c, gam, n1, n2, n3 in re.findall(
    r"(\w\d): \{ gammes: \[([^\]]+)\], charge: \{ 1: (\d+), 2: (\d+), 3: (\d+) \}", _SRC)}
assert set(COTES) == {'A1', 'A2', 'B1', 'B2'} and HORS_SERVICE[0] == 'A1-T02-N2-E2', (COTES, HORS_SERVICE)
ROTATION = {'A': ([1], [1, 2]), 'B': ([2], [1, 2, 3]), 'C': ([3, 4], [1, 2, 3])}

# ==================================================================== les palettes (recopiées de contenus/smoby-ent55.js)
# id : (désignation, produit, gamme, cartons au BL, cartons reçus, poids, rotation, contrainte, en litige)
PALETTES = {'P1': ('Maison Neo Jura Lodge', 'MAI', 'MAT', 8, 8, 420, 'A', 'lourd', False),
            'P2': ('Cuisine Tefal', 'CUI', 'CUI', 45, 45, 270, 'B', 'fragile', False),
            'P3': ('Établi Black+Decker', 'ETA', 'MAT', 36, 36, 290, 'B', 'lourd', True),
            'P4': ('Porteur Little Smoby', 'POR', 'VEH', 36, 34, 180, 'C', '', False)}
REF = {'MAI': 'SMB-NJL', 'CUI': 'SMB-CTF', 'ETA': 'SMB-EBD', 'POR': 'SMB-PLS'}
GAMMES = {'MAT': 'Maisons et ateliers', 'CUI': 'Cuisines', 'VEH': 'Véhicules', 'PLA': 'Plein air'}


def charge(cote, t, n):
    return sum(kg for a, (_, kg) in STOCK.items() if a.startswith(f'{cote}-T0{t}-N{n}-'))


def fautes(pid, a):
    """Les règles fausses si on pose la palette `pid` à l'adresse `a` (les six règles de la séance)."""
    nom, prod, gam, bl, rec, kg, rot, contr, lit = PALETTES[pid]
    m = re.fullmatch(r'([AB][12])-T0(\d)-N(\d)-E(\d)', a)
    cote, t, n, e = m.group(1), int(m.group(2)), int(m.group(3)), int(m.group(4))
    f = []
    if lit: f.append('litige')
    if gam not in COTES[cote][0]: f.append('type de produit')
    if contr == 'lourd' and cote[0] != 'A': f.append('parcours')
    if contr == 'fragile' and cote[0] != 'B': f.append('parcours')
    if contr == 'fragile' and n == 3: f.append('fragile en N3')
    tr, nv = ROTATION[rot]
    if t not in tr or n not in nv: f.append('rotation')
    if charge(cote, t, n) + kg > COTES[cote][n]: f.append('poids')
    if a in STOCK: f.append('occupé')
    if a in HORS_SERVICE: f.append('hors service')
    return f


TOUTES = [f'{c}-T0{t}-N{n}-E{e}' for c in COTES for t in range(1, 5) for n in (1, 2, 3) for e in (1, 2, 3)]
BONNES = {p: [a for a in TOUTES if not fautes(p, a)] for p in PALETTES}
BONNES['P3'] = ['L1', 'L2']
assert BONNES == {'P1': ['A1-T01-N1-E3'], 'P2': ['B2-T02-N1-E2', 'B2-T02-N1-E3'], 'P3': ['L1', 'L2'],
                  'P4': ['B1-T03-N3-E1', 'B1-T04-N1-E2', 'B1-T04-N3-E2']}, BONNES     # brief ENT-5.5 §4
# les pièges du brief : un seul critère faux chacun (vérifié)
PIEGES = {'A1-T01-N2-E3': ('P1', ['poids']), 'B2-T02-N3-E2': ('P2', ['fragile en N3']),
          'B2-T01-N1-E3': ('P1', ['parcours']), 'B1-T04-N2-E3': ('P4', ['hors service'])}
for a, (p, f) in PIEGES.items():
    assert fautes(p, a) == f, (a, fautes(p, a))
# l'exercice de charge de l'étape 3 : A1-T01-N2 (P1 n'y tient pas), B1-T03-N3 (P4 y tient)
CH_A1 = charge('A1', 1, 2); CH_B1 = charge('B1', 3, 3)
assert CH_A1 + 420 > COTES['A1'][2] and CH_B1 + 180 <= COTES['B1'][3], (CH_A1, CH_B1)
# le stock de porteurs (écran Stock) : palettes de porteurs déjà rangées × cartons par palette, + reçus
POR_AVANT = sum(1 for p, _ in STOCK.values() if p == 'POR') * PAR_PALETTE['POR']
POR_APRES = POR_AVANT + PALETTES['P4'][4]
assert (POR_AVANT, POR_APRES) == (360, 394), (POR_AVANT, POR_APRES)
LOT = 'ARI-26-49'

# ==================================================================== la trame
T.nouveau()
T.entete(LOGO, 'ENT-5.5 — Carnet de suivi : ranger et saisir l’entrée', [
    ('Ce document est ta trame de travail :', "tu peux le suivre seul, étape par étape. Tu es Yanis, cariste chez "
     "Smoby. Les 4 palettes reçues d'Arinthod attendent en zone de réception : tu les ranges dans le rack, puis tu "
     "saisis leur entrée en stock. La commande de Noël part demain."),
    ('Ce que ton enseignant voit dans son suivi :', "neuf points : chaque palette bien rangée (4), l'entrée en stock "
     "(3), ta lecture de l'écran Stock (1) et ta réponse à Kuehne+Nagel (1). Tes réponses écrites ici servent à "
     "réfléchir."),
    ('Ce qui est vrai, ce qui est inventé :', "Smoby, sa plateforme de Moirans-en-Montagne, ses gammes de jouets et "
     "le CACES 5 sont réels. Le plan, le stock, les poids, les règles de rangement et les messages sont inventés "
     "pour l'exercice.")],
    [('Les messages de Bruno', 'Prepalog : Messagerie'),
     ('Lire la fiche de chaque palette', 'Prepalog : Plan de l’entrepôt'),
     ('Ranger les 4 palettes', 'Prepalog : Plan de l’entrepôt'),
     ('Saisir l’entrée en stock', 'Prepalog : Réceptions'),
     ('Vérifier l’écran Stock', 'Prepalog : Stock et Messagerie'),
     ('Répondre à Kuehne+Nagel', 'Prepalog : Messagerie')], nom_logo='SMOBY')

# ==================================================================== étape 1
T.etape(1, 'Les messages de Bruno')
T.consignes(["Ouvre la Messagerie et lis les deux messages de Bruno.",
             "Clique sur les mots soulignés si tu ne les connais pas.",
             "Réponds aux questions : tout se trouve dans les messages."])
T.faits(['Combien de palettes faut-il ranger ?', 'Où va l’établi Black+Decker ? Pourquoi ?',
         'Dans quel menu saisit-on l’entrée en stock ?', 'Quelles quantités faut-il saisir : celles du BL ou les '
         'autres ?', 'Quand part la commande de Noël ?'], hauteur=Cm(0.95))
T.qcm([("Une palette « en litige »…",
        ['part tout de suite chez le client', 'attend à part la réponse du fournisseur', 'est jetée'], 1)])
T.reflechir(["La commande de Noël part demain matin. Pourquoi tout doit-il être rangé ET saisi ce soir ?"])

# ==================================================================== étape 2   (À REVOIR APRÈS L'ESSAI À L'ÉCRAN)
T.etape(2, 'Lire la fiche de chaque palette')
T.consignes(["Ouvre le menu « Plan de l’entrepôt », puis « Les règles ». Lis-les toutes.",
             "Prends une palette : sa fiche s'affiche (poids, rotation, contrainte).",
             "Remplis le tableau pour les 4 palettes, avant de ranger."])
T.encadre_liste('Les règles de l’entrepôt', [
    'Type de produit : le côté de sa gamme (A1 maisons et ateliers, A2 plein air, B1 véhicules, B2 cuisines).',
    'Parcours : un produit lourd dans l’allée A (début du parcours), un produit fragile dans l’allée B (fin).',
    'Produit fragile : jamais au niveau N3.',
    'Rotation : A rapide → T01, niveau N1 ou N2 · B moyenne → T02 · C lente → T03 ou T04.',
    'Poids : la charge totale du niveau ne dépasse pas la plaque jaune.',
    'Un emplacement libre et en service ; une palette en litige va en zone litiges.'])
T.tableau(['Palette', 'Produit', 'Poids', 'Rotation', 'Contrainte', 'Côté', 'Travée(s) possible(s)'], 0,
          [Cm(1.5), Cm(4.0), Cm(1.7), Cm(1.8), Cm(2.4), Cm(1.6), Cm(4.0)], hauteur=Cm(1.0),
          remplis=[[k, v[0]] for k, v in PALETTES.items()])
T.qcm([("La cuisine Tefal est fragile. Tu ne la poses jamais…", ['au niveau N1', 'au niveau N3', 'dans l’allée B'], 1)])
T.reflechir(["Pourquoi range-t-on les produits à rotation rapide (A) dans la travée T01, la plus proche des quais ?"])

# ==================================================================== étape 3
T.etape(3, 'Ranger les 4 palettes')
T.consignes(["Pour chaque palette : clique la bonne travée sur le plan, puis l'emplacement dans la travée vue de face.",
             "Lis l'adresse qui se construit, et vérifie la plaque de charge avant de poser.",
             "Note ici l'adresse où tu as posé chaque palette."])
T.encadre('La plaque de charge :', "au bout de chaque rack, une plaque jaune dit le poids maximal qu'on peut poser "
          "sur un niveau. On additionne le poids des palettes déjà posées sur ce niveau, plus celle qu'on veut poser.")
T.tableau(['Palette', 'Adresse où tu l’as posée', 'Deux règles que respecte cet emplacement'], 0,
          [Cm(1.6), Cm(5.0), Cm(10.4)], hauteur=Cm(1.05), remplis=[[k] for k in PALETTES])
T.p("Calcule. Plaque du côté A1 : 1 200 kg aux niveaux N2 et N3. Plaque du côté B1 : 1 000 kg.", apres=4)
T.tableau(['Niveau', 'Déjà posé', 'Palette à poser', 'Total', 'Plaque', 'Possible ? (oui / non)'], 0,
          [Cm(3.4), Cm(2.4), Cm(3.2), Cm(2.2), Cm(2.0), Cm(3.8)], hauteur=Cm(0.85),
          remplis=[['A1-T01-N2', f'{CH_A1} kg', 'P1 : 420 kg'], ['B1-T03-N3', f'{CH_B1} kg', 'P4 : 180 kg']])
T.reflechir(["La maison Neo Jura Lodge (lourde) ne va pas dans l'allée B, même s'il y a de la place. Pourquoi ? "
             "Pense à la préparation de commande de demain."])

# ==================================================================== étape 4   (À REVOIR APRÈS L'ESSAI À L'ÉCRAN)
T.etape(4, 'Saisir l’entrée en stock')
T.consignes(["Ouvre le menu « Réceptions » et la réception " + 'REC-1209-ARI' + " (BL ARI-26-1209).",
             "Pour chaque ligne, saisis la quantité RÉELLEMENT reçue et la décision.",
             "L'établi est en litige : il n'entre pas en stock disponible. Vérifie tout, puis valide."])
T.tableau(['Palette', 'Référence', 'Annoncé (BL)', 'Réellement reçu', 'Décision'], 0,
          [Cm(1.6), Cm(2.8), Cm(2.6), Cm(3.0), Cm(7.0)], hauteur=Cm(1.0),
          remplis=[[k, REF[v[1]]] for k, v in PALETTES.items()])
T.faits(['Quel est le numéro de lot écrit sur le BL ?'], hauteur=Cm(0.8))
T.qcm([("P4 : le BL annonce 36 cartons, tu en as compté 34. Tu saisis…", ['36', '34', '0'], 1)])
T.reflechir(["Si tu saisissais 36 porteurs au lieu de 34, que se passerait-il demain, à la préparation de commande ?"])

# ==================================================================== étape 5
T.etape(5, 'Vérifier l’écran Stock')
T.consignes(["Bruno te demande combien de cartons de porteurs Little Smoby il y a maintenant.",
             "Ouvre le menu « Stock » et lis la ligne des porteurs.",
             "Réponds à Bruno : « Répondre », puis choisis la bonne phrase."])
T.p("Avant de lire l'écran, calcule ce que tu devrais y trouver.", apres=4)
T.tableau(['Calcul', 'Ta réponse'], 0, [Cm(11.0), Cm(6.0)], hauteur=Cm(0.9),
          remplis=[['Palettes de porteurs déjà en stock sur le plan (compte-les sur le côté B1)'],
                   ['Cartons par palette de porteurs (3 × 3 × 4)'], ['Cartons de porteurs avant ta saisie'],
                   ['Cartons de porteurs reçus aujourd’hui (P4)'], ['Cartons de porteurs après ta saisie']])
T.faits(['L’écran Stock donne-t-il le même nombre que ton calcul ?'], hauteur=Cm(0.8))
T.qcm([("L'écran Stock affiche encore " + str(POR_AVANT) + " cartons de porteurs. Le plus probable :",
        ['l’entrée en stock n’est pas validée', 'les porteurs sont partis', 'le BL est faux'], 0)])
T.reflechir(["Pourquoi vérifier l'écran Stock après une saisie, au lieu de faire confiance à ce qu'on a tapé ?"])

# ==================================================================== étape 6
T.etape(6, 'Répondre à Kuehne+Nagel')
T.encadre('Kuehne+Nagel :', "un transporteur. Son agence de Besançon emportera la commande de Noël. Pour Smoby, c'est "
          "un partenaire extérieur : on lui écrit au « vous », avec une formule de politesse.")
T.consignes(["Lis le message de l'exploitation Kuehne+Nagel.",
             "Clique sur « Répondre » et choisis une phrase par ligne.",
             "Relis tout ton message avant de l'envoyer."])
T.faits(['Que demande Kuehne+Nagel ?', 'Par quelle formule commences-tu ?',
         'Quel jour la commande de Noël pourra-t-elle partir ?', 'Comment termines-tu ton message ?'],
        hauteur=Cm(0.95))
T.qcm([("Pour répondre à un transporteur, « Salut ! » est…",
        ['parfait, c’est plus sympa', 'trop familier : on écrit « Bonjour, »', 'obligatoire'], 1)])
T.reflechir(["Bruno, tu le tutoies ; à Kuehne+Nagel, tu écris « Bonjour, … Cordialement ». Pourquoi cette "
             "différence ?"])

# ==================================================================== feuille à détacher (cours)
ESSENTIEL = [("Chaque produit a son côté de rack : c'est le plan d'{}.", 'implantation'),
             ('Un produit à rotation rapide se range près des {}.', 'quais'),
             ("Le poids posé sur un niveau ne dépasse jamais ce qu'indique la {} de charge.", 'plaque'),
             ('On saisit en stock les quantités {} reçues, pas celles du BL.', 'réellement')]
LEXIQUE = [('litige', 'Désaccord avec le {} sur une marchandise abîmée ou manquante.', 'fournisseur'),
           ('rotation', 'Vitesse à laquelle un produit {} du stock.', 'sort'),
           ('entrée en stock', 'Saisie qui ajoute au {} les quantités reçues.', 'stock'),
           ('chariot rétractable', 'Chariot dont le {} avance et recule pour ranger en hauteur (CACES 5).', 'mât')]
T.feuille_cours('ENT-5.5', 'Ranger en respectant les règles, saisir l’entrée',
                'Logistique — C1.5 mettre en stock, C1.6 suivi des stocks (initiation)',
                [ph.format(T.TROU) for ph, _ in ESSENTIEL],
                [m for _, m in ESSENTIEL] + [m for _, _, m in LEXIQUE],
                [(mot, df.format(T.TROU)) for mot, df, _ in LEXIQUE])

# ==================================================================== corrigé de la trame
def travees(rot):
    tr, nv = ROTATION[rot]
    return ' ou '.join(f'T0{t}' for t in tr) + (' (N1 ou N2)' if nv == [1, 2] else '')


COTE = {'P1': 'A1', 'P2': 'B2', 'P3': '— (litiges)', 'P4': 'B1'}
REGLES_OK = {'P1': 'Côté de sa gamme (A1), lourd dans l’allée A, rotation A en T01 N1, 1 250 kg ≤ 3 000 kg au sol.',
             'P2': 'Côté des cuisines (B2), fragile dans l’allée B et pas en N3, rotation B en T02, emplacement libre.',
             'P3': 'En litige : zone litiges, pas dans le rack.',
             'P4': 'Côté des véhicules (B1), rotation C en T03 ou T04, plaque respectée, emplacement en service.'}
assert charge('A1', 1, 1) + 420 == 1250
ENT_5_5 = {
 "Combien de palettes faut-il ranger": {"rep": "4 : celles reçues d'Arinthod en ENT-5.4."},
 "Où va l’établi Black+Decker": {"rep": "En zone litiges : un carton est écrasé, il attend la réponse de l'usine."},
 "Dans quel menu saisit-on": {"rep": "Le menu Réceptions."},
 "Quelles quantités faut-il saisir": {"rep": "Les quantités RÉELLEMENT reçues, pas celles du BL."},
 "Quand part la commande de Noël": {"rep": "Demain matin, jeudi 10 décembre."},
 "La commande de Noël part demain matin": {"pistes": [
   "Demain, on prépare la commande en allant chercher les cartons à leur adresse : une palette pas rangée est introuvable.",
   "Si l'entrée n'est pas saisie, le stock affiché est faux : on croit manquer de produits (ou en avoir trop).",
   "Le transporteur attend une réponse ce soir pour confirmer le départ à son client."]},
 "T: Palette | Produit | Poids": {"lignes": [[k, v[0], f'{v[5]} kg', v[6], (v[7] or '—') + (', en litige' if v[8] else ''),
     COTE[k], ('zone litiges (L1 ou L2)' if v[8] else travees(v[6]))] for k, v in PALETTES.items()],
   "note": "Recopié de la fiche de chaque palette à l'écran. P3 : lourd et rotation B, mais en litige → zone litiges."},
 "Pourquoi range-t-on les produits à rotation rapide": {"pistes": [
   "Ils sortent le plus souvent : les ranger près des quais fait gagner du chemin à chaque préparation.",
   "Moins de trajets, moins de temps, moins de risques dans les allées.",
   "En N1 ou N2, on les prend sans monter haut : plus rapide et plus sûr."]},
 "T: Palette | Adresse où tu l’as posée": {"lignes": [[k, ' ou '.join(BONNES[k]), REGLES_OK[k]] for k in PALETTES],
   "note": "Bonnes adresses recalculées sur le stock de départ (identiques au corrigé de la séance). Pièges : P1 en A1-T01-N2-E3 (poids), P1 en B2-T01-N1-E3 (parcours), P2 en B2-T02-N3-E2 (fragile en N3), P4 en B1-T04-N2-E3 (hors service)."},
 "T: Niveau | Déjà posé": {"lignes": [
     ['A1-T01-N2', f'{CH_A1} kg', 'P1 : 420 kg', f'{CH_A1 + 420} kg', f"{COTES['A1'][2]} kg", 'non : trop lourd'],
     ['B1-T03-N3', f'{CH_B1} kg', 'P4 : 180 kg', f'{CH_B1 + 180} kg', f"{COTES['B1'][3]} kg", 'oui']],
   "note": "Lu dans le stock de départ de la plateforme : A1-T01-N2 = 430 + 410 kg ; B1-T03-N3 = 190 + 140 kg."},
 "La maison Neo Jura Lodge (lourde)": {"pistes": [
   "Le parcours de préparation commence par l'allée A : on prend d'abord les produits lourds.",
   "Le lourd fait la base de la palette préparée ; le fragile, pris en dernier (allée B), va dessus.",
   "Si le lourd était au bout du parcours, on le poserait sur les cuisines : elles seraient écrasées."]},
 "T: Palette | Référence | Annoncé": {"lignes": [[k, REF[v[1]], str(v[3]), str(v[4]),
     'En litige : n’entre pas en stock disponible' if v[8] else ('Accepté sous réserve' if v[4] < v[3] else 'Accepté')]
     for k, v in PALETTES.items()],
   "note": "Jalons 5 à 7. P4 : 34 (accepté, avec ou sans réserve : les deux sont justes à l'écran). P3 « En litige », vrai seulement si la réception est validée."},
 "Quel est le numéro de lot": {"rep": LOT, "note": "Non noté à l'écran."},
 "Si tu saisissais 36 porteurs": {"pistes": [
   "Le stock affiché compterait 2 cartons qui n'existent pas.",
   "Le préparateur irait chercher des cartons absents : la commande partirait incomplète, ou en retard.",
   "À l'inventaire, il faudrait chercher l'écart."]},
 "T: Calcul | Ta réponse": {"lignes": [
     ['Palettes de porteurs déjà en stock', str(POR_AVANT // PAR_PALETTE['POR'])], ['Cartons par palette', str(PAR_PALETTE['POR'])],
     ['Avant ta saisie', str(POR_AVANT)], ['Reçus (P4)', str(PALETTES['P4'][4])], ['Après ta saisie', str(POR_APRES)]],
   "note": f"Jalon 8 : « Il y a maintenant {POR_APRES} cartons de porteurs Little Smoby en stock. » Pièges : {POR_AVANT + 36} (le BL) et {POR_AVANT} (entrée pas validée). Compter les palettes sur le plan est long : accepter que l'élève lise directement l'écran Stock avant de calculer."},
 "L’écran Stock donne-t-il": {"rep": f"Oui : {POR_APRES} cartons, si l'entrée est validée."},
 "Pourquoi vérifier l'écran Stock": {"pistes": [
   "Une faute de frappe ou une saisie non validée se voit tout de suite.",
   "Le stock est ce que tout le monde regarde : s'il est faux, tout le monde se trompe.",
   "C'est ce qu'on va dire au transporteur : il faut en être sûr."]},
 "Que demande Kuehne+Nagel": {"rep": "Si la marchandise d'Arinthod est arrivée et rangée, et quand la commande de Noël pourra partir."},
 "Par quelle formule commences-tu": {"rep": "« Bonjour, »"},
 "Quel jour la commande de Noël": {"rep": "« La commande de Noël pourra partir jeudi 10 décembre. »", "note": "Piège : vendredi 11. Nous sommes mercredi 9 décembre."},
 "Comment termines-tu ton message": {"rep": "« Cordialement, Yanis — Smoby Moirans »", "note": "Jalon 9 : toutes les lignes justes (avec « La marchandise d'Arinthod est en stock. »)."},
 "Bruno, tu le tutoies": {"pistes": [
   "Bruno est un collègue de Smoby : on le tutoie, poliment.",
   "Kuehne+Nagel est une autre entreprise, un partenaire : on le vouvoie, comme un client.",
   "On écrit au nom de Smoby : le message donne une image de l'entreprise."]},
}
for ph, mot in ESSENTIEL:
    ENT_5_5[ph.split('{}')[0].strip()] = {"rep": mot + '.'}
ENT_5_5['T: Mot | Définition (complète avec la banque de mots)'] = {
    "lignes": [[mot, m] for mot, _, m in LEXIQUE], "note": "Un mot de la banque par trou."}
corriges_data._DICOS['ENT-5.5'] = [ENT_5_5]

NOTIONS = [
    ["Une palette « en litige »", "Réception et litiges", "Une marchandise en litige est isolée (zone litiges) en attendant la réponse du fournisseur : elle n'entre pas en stock disponible."],
    ["La cuisine Tefal est fragile", "Règles de stockage", "Un produit fragile ne va pas en hauteur (règle de la plateforme : jamais en N3)."],
    ["P4 : le BL annonce 36", "Entrée en stock", "On saisit la quantité réellement reçue : le stock informatique doit égaler le stock physique."],
    ["L'écran Stock affiche encore", "Entrée en stock", "Une saisie non validée ne modifie pas le stock."],
    ["Pour répondre à un transporteur", "Communication écrite", "À un partenaire extérieur, on écrit au vous avec une formule de politesse."],
]
T.finir('ENT-5.5', 'Smoby — ranger et saisir l’entrée', 'ENT-5.5-smoby-rangement-trame-eleve', NOTIONS,
        os.path.basename(__file__))
