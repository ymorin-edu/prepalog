# -*- coding: utf-8 -*-
"""Trame élève d'ENT-5.6 Smoby, « la palette de la commande de Noël » (Cowork, 06/10/2026 au soir) — BROUILLON.

Format LONG (6 étapes + feuille de cours à détacher), comme ENT-5.1 à 5.5 (décision de Tristan du 06/10/2026).
Écrite AVANT la validation à l'écran, à la demande de Tristan (« toute la suite 5.3 → 5.8 ») : libellés repris de
`contenus/smoby-ent56.js` et du brief ENT-5.6 §4 (« Descente de la réserve », « Vérifier ma préparation ») sans avoir
joué la séance — « À REVOIR APRÈS L'ESSAI À L'ÉCRAN ».

Vérifié (brief ENT-5.6 §2) : la plateforme de Smoby à Moirans-en-Montagne, les gammes des produits.
Construit (comme dans la séance) : le plan, le picking, la commande BP-1210-JDR pour Jouets du Rhône (fictif),
poids et cartons, règles de montage, 800 kg et 1,80 m du transporteur, l'enlèvement E1.

Produits, commande et picking LUS dans `contenus/smoby-entrepot.js` ; le poids (331 kg) et la hauteur (1,74 m) de la
palette sont RECALCULÉS ici et comparés au corrigé de la séance (brief §5). Les mètres du serpentin (47 m) sont ceux
du moteur (`attendusPreparation`), repris du brief : non recalculés.

Lancer : python3 outils/trame-smoby-preparation.py
puis    soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/ENT-5.6-smoby-preparation-trame-eleve.docx
"""
import math, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trame_commun as T
import corriges_data
from docx.shared import Cm

LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'smoby.png')

# ==================================================================== données (lues dans contenus/smoby-entrepot.js)
with open(os.path.join(T.RACINE, 'contenus', 'smoby-entrepot.js'), encoding='utf-8') as f:
    _SRC = f.read()
PROD = {}
for k, nom, classe, kg, pc, h in re.findall(
        r"^\s+([A-Z]{3}): \{ nom: '([^']+)'.*?(?:classe: '(\w+)', )?carton: \{ kg: ([\d.]+), parCouche: (\d+), h: ([\d.]+) \}",
        _SRC, re.M):
    PROD[k] = dict(nom=nom, classe=classe, kg=float(kg), parCouche=int(pc), h=float(h))
assert len(PROD) == 8 and PROD['MAI']['classe'] == 'lourd' and PROD['CUI']['classe'] == 'fragile', PROD
LIGNES = [(a, p, int(q)) for a, p, q in re.findall(r"\{ a: '([AB]\d-T0\d-N1-E\d)', produit: '([A-Z]{3})', q: (\d+) \}", _SRC)]
PICKING = {a: (int(q), int(m)) for a, q, m in re.findall(r"'([AB]\d-T0\d-N1-E\d)': \{ q: (\d+), min: (\d+) \}", _SRC)}
STOCK = {a: p for a, p in re.findall(r"'([AB][12]-T0\d-N\d-E\d)': S\('([A-Z]{3})'", _SRC)}
assert len(LIGNES) == 6 and len(PICKING) == 6, (LIGNES, PICKING)
SUPPORT = (25, 0.15)          # COMMANDE.support : palette vide (kg, m)
KG_MAX, H_MAX = 800, 1.8

POIDS = [q * PROD[p]['kg'] for _, p, q in LIGNES]
COUCHES = [math.ceil(q / PROD[p]['parCouche']) for _, p, q in LIGNES]
HAUTS = [c * PROD[p]['h'] for c, (_, p, _) in zip(COUCHES, LIGNES)]
POIDS_TOTAL = sum(POIDS) + SUPPORT[0]
HAUT_TOTALE = round(sum(HAUTS) + SUPPORT[1], 2)
assert (POIDS_TOTAL, HAUT_TOTALE) == (331, 1.74), (POIDS_TOTAL, HAUT_TOTALE)    # corrigé de la séance
# la rupture : le picking sous la quantité commandée
RUPT = [(i, a, p, q) for i, (a, p, q) in enumerate(LIGNES) if PICKING[a][0] < q]
assert len(RUPT) == 1, RUPT
R_I, R_A, R_P, R_Q = RUPT[0]
R_STOCK, R_MIN = PICKING[R_A]
RESERVE_OK = [a for a, p in STOCK.items() if a[:6] == R_A[:6] and '-N1-' not in a and p == R_P]
PIEGE = R_A[:6] + '-N2-E1'
assert STOCK[PIEGE] != R_P and RESERVE_OK, (STOCK[PIEGE], RESERVE_OK)
# l'ordre du bon = lourds d'abord, fragiles à la fin (ce qui fait une palette juste)
CLASSES = [PROD[p]['classe'] for _, p, _ in LIGNES]
assert CLASSES[0] == 'lourd' and CLASSES[-1] == 'fragile' and CLASSES.count('lourd') == 1, CLASSES
METRES = 47      # serpentin, moteur (brief §5, jalon 9)


def v(x):
    return (f'{x:.2f}'.rstrip('0').rstrip('.') if isinstance(x, float) else str(x)).replace('.', ',')


# ==================================================================== la trame
T.nouveau()
T.entete(LOGO, 'ENT-5.6 — Carnet de suivi : la palette de la commande de Noël', [
    ('Ce document est ta trame de travail :', "tu peux le suivre seul, étape par étape. Tu es Yanis, cariste chez "
     "Smoby. Dernière mission de ta première journée : préparer la palette qui complète la commande de Noël d'un "
     "client. Elle part demain à 6 h."),
    ('Ce que ton enseignant voit dans son suivi :', "neuf points : les 6 lignes prélevées justes (1), la rupture "
     "traitée (1), ta palette (lourds en bas, fragiles en haut, poids, hauteur : 4), le film (1), les étiquettes (1) "
     "et ton parcours (1). Tes réponses écrites ici servent à réfléchir."),
    ('Ce qui est vrai, ce qui est inventé :', "Smoby, sa plateforme de Moirans-en-Montagne et ses jouets sont réels. "
     "Le client Jouets du Rhône, la commande, le stock, les poids et les règles de montage sont inventés pour "
     "l'exercice.")],
    [('Le message de Bruno', 'Prepalog : Messagerie'),
     ('Le bon de préparation et le parcours', 'Prepalog : Préparer la commande'),
     ('Prélever et traiter la rupture', 'Prepalog : Préparer la commande'),
     ('Monter la palette', 'Prepalog : Préparer la commande'),
     ('Contrôler le poids et la hauteur', 'Ce carnet'),
     ('Filmer, étiqueter, vérifier', 'Prepalog : Préparer la commande')], nom_logo='SMOBY')

# ==================================================================== étape 1
T.etape(1, 'Le message de Bruno')
T.consignes(["Ouvre la Messagerie et lis le message de Bruno.",
             "Clique sur les mots soulignés si tu ne les connais pas.",
             "Réponds aux questions : tout se trouve dans le message."])
T.faits(['Pour quel client est la palette ?', 'Quand part-elle, et à quel quai ?', 'Quel transporteur l’emporte ?',
         'Combien de produits différents porte-t-elle ?', 'Combien de palettes de cette commande sont déjà prêtes ?'],
        hauteur=Cm(0.95))
T.qcm([("Une palette « mixte », c'est une palette…",
        ['d’un seul produit', 'qui porte plusieurs produits différents d’une même commande',
         'à moitié vide'], 1)])
T.reflechir(["Bruno dit : « lourds en bas, fragiles en haut ». Que se passerait-il pendant le transport si on "
             "faisait l'inverse ?"])

# ==================================================================== étape 2   (À REVOIR APRÈS L'ESSAI À L'ÉCRAN)
T.etape(2, 'Le bon de préparation et le parcours')
T.consignes(["Ouvre le menu « Préparer la commande ». Lis « Les règles ».",
             "Regarde le bon de préparation : ses lignes sont dans l'ordre du parcours.",
             "Recopie-le ici : le produit, son étiquette (LOURD, FRAGILE ou rien) et la quantité."])
T.encadre_liste('Les règles de la préparation', [
    'Parcours en serpentin, à sens unique : on monte l’allée A, on redescend l’allée B.',
    'On prélève au picking (niveau N1) ; N2 et N3, c’est la réserve.',
    'Picking sous son minimum : on fait descendre une palette de réserve de la même référence.',
    'Palette : lourds en bas, fragiles en haut ; 800 kg et 1,80 m au plus.',
    'Avant l’enlèvement : film 3 à 5 tours ; étiquette sur 2 côtés opposés et sur le dessus.'])
T.tableau(['Ligne', 'Adresse', 'Produit', 'LOURD / FRAGILE / —', 'Quantité'], 0,
          [Cm(1.4), Cm(3.4), Cm(6.0), Cm(3.6), Cm(2.6)], hauteur=Cm(0.85),
          remplis=[[str(i + 1), a] for i, (a, _, _) in enumerate(LIGNES)])
T.qcm([("Pour préparer une commande, on prélève les cartons…",
        ['au picking, au niveau N1', 'en réserve, aux niveaux N2 et N3', 'où on veut'], 0)])
T.reflechir(["Pourquoi les allées sont-elles à sens unique pendant la préparation ?"])

# ==================================================================== étape 3   (À REVOIR APRÈS L'ESSAI À L'ÉCRAN)
T.etape(3, 'Prélever et traiter la rupture')
T.consignes(["Prélève chaque ligne au picking, dans l'ordre du bon.",
             "Une ligne n'a pas assez de cartons au picking : c'est une rupture. Clique « Descente de la réserve ».",
             "Choisis la palette de réserve à descendre : au-dessus, et de la MÊME référence."])
T.faits(['Quelle ligne est en rupture ? Quel produit ?', 'Combien de cartons au picking ? Combien commandés ?',
         'Quel est le minimum de ce picking ?', 'Quelle palette as-tu fait descendre (adresse) ?',
         f'Pourquoi pas la palette {PIEGE}, juste au-dessus ?'], hauteur=Cm(0.95))
T.encadre('Le réapprovisionnement :', "quand un picking passe sous son minimum, on le remplit avec une palette de la "
          "réserve. Pour descendre une palette du niveau N2 ou N3, il faut le chariot rétractable : CACES 5. Yanis l'a.")
T.qcm([("Un picking a moins de cartons que son minimum. Tu…",
        ['prends les cartons dans la réserve, à la main', 'fais descendre une palette de réserve de la même référence',
         'envoies la commande incomplète'], 1)])
T.reflechir(["Pourquoi ne monte-t-on pas chercher les cartons à la main dans la réserve, en hauteur ?"])

# ==================================================================== étape 4
T.etape(4, 'Monter la palette')
T.consignes(["Chaque carton prélevé se pose sur la palette, dans l'ordre du prélèvement.",
             "Regarde la palette se monter, couche après couche. « Reposer le dernier » annule une erreur.",
             "Quand les 6 lignes sont prélevées, termine la préparation (mais ne vérifie pas encore)."])
T.p("Dessine ta palette vue de face : une case par produit, de bas en haut, avec son nom. Marque L (lourd) et F "
    "(fragile).", apres=4)
T.tableau(['Couche (de haut en bas)', 'Produit', 'L / F / —'], 0, [Cm(4.2), Cm(9.8), Cm(3.0)], hauteur=Cm(0.85),
          remplis=[[f'{6 - i}' + (' (en haut)' if i == 0 else ' (en bas)' if i == 5 else '')] for i in range(6)])
T.qcm([("Le bon est trié dans l'ordre du serpentin. Le produit lourd est sur la ligne…",
        ['1 : on le prend en premier, il fait la base', '6 : on le prend en dernier', 'n’importe laquelle'], 0)])
T.reflechir(["Le plan d'implantation met les produits lourds au début du parcours (allée A) et les fragiles à la "
             "fin (allée B). En quoi ce choix, fait en ENT-5.5, aide-t-il aujourd'hui ?"])

# ==================================================================== étape 5
T.etape(5, 'Contrôler le poids et la hauteur')
T.p("Le transporteur n'accepte pas une palette de plus de 800 kg ni de plus de 1,80 m. Calcule avant de vérifier à "
    "l'écran. La palette vide pèse 25 kg et fait 0,15 m de haut.", apres=4)
T.tableau(['Produit', 'Cartons', 'kg par carton', 'Poids (kg)', 'Couches', 'Hauteur d’une couche', 'Hauteur (m)'], 0,
          [Cm(4.2), Cm(1.6), Cm(2.0), Cm(2.0), Cm(1.8), Cm(2.6), Cm(2.4)], hauteur=Cm(0.8),
          remplis=[[PROD[p]['nom'], str(q), v(PROD[p]['kg']), '', str(c), v(PROD[p]['h']) + ' m', '']
                   for (_, p, q), c in zip(LIGNES, COUCHES)] + [['Palette vide', '', '', '25', '', '', '0,15'],
                                                                ['TOTAL', '', '', '', '', '', '']])
T.faits(['Ta palette respecte-t-elle les 800 kg ?', 'Respecte-t-elle les 1,80 m ? Avec quelle marge ?'],
        hauteur=Cm(0.9))
T.reflechir(["Pourquoi le transporteur fixe-t-il une hauteur maximale, alors que la remorque est plus haute ?"])

# ==================================================================== étape 6   (À REVOIR APRÈS L'ESSAI À L'ÉCRAN)
T.etape(6, 'Filmer, étiqueter, vérifier')
T.consignes(["Filme la palette : choisis le nombre de tours.",
             "Colle les étiquettes d'expédition : choisis les côtés.",
             "Clique « Vérifier ma préparation » et lis le bilan, ligne par ligne. Corrige si besoin."])
T.faits(['Combien de tours de film as-tu mis ?', 'Où as-tu collé les étiquettes ?',
         'Combien de mètres as-tu parcourus ?', 'Que fait Bruno de ta palette ?'], hauteur=Cm(0.95))
T.qcm([("On colle l'étiquette sur deux côtés OPPOSÉS pour…",
        ['faire joli', 'qu’on la lise de chaque côté du camion', 'économiser du film'], 1),
       ("Trop peu de tours de film, et…", ['la palette se défait pendant le transport', 'elle est plus légère',
                                          'elle passe mieux sous la porte'], 0)])
T.reflechir(["Demain à 6 h, le chauffeur de Kuehne+Nagel charge 33 palettes. À quoi lui sert ton étiquette ?"])

# ==================================================================== feuille à détacher (cours)
ESSENTIEL = [('On prélève au {}, au niveau N1 ; les niveaux du dessus sont la réserve.', 'picking'),
             ('Un picking sous son minimum se remplit par un {} depuis la réserve.', 'réapprovisionnement'),
             ('Sur une palette mixte : lourds en {}, fragiles en haut.', 'bas'),
             ('Avant l’enlèvement, la palette est filmée et {} sur deux côtés opposés et le dessus.', 'étiquetée')]
LEXIQUE = [('bon de préparation', 'Liste des produits d’une {} à prélever, avec adresse et quantité.', 'commande'),
           ('serpentin', 'Parcours qui monte une allée et redescend la {}, sans revenir en arrière.', 'suivante'),
           ('rupture', 'Il n’y a plus assez de {} au picking pour servir la commande.', 'cartons'),
           ('film étirable', 'Film plastique enroulé autour de la palette pour {} les cartons.', 'tenir')]
T.feuille_cours('ENT-5.6', 'Préparer une commande',
                'Logistique — C2.1 répondre à la demande des clients (initiation)',
                [ph.format(T.TROU) for ph, _ in ESSENTIEL],
                [m for _, m in ESSENTIEL] + [m for _, _, m in LEXIQUE],
                [(mot, df.format(T.TROU)) for mot, df, _ in LEXIQUE])

# ==================================================================== corrigé de la trame
LF = {'lourd': 'LOURD', 'fragile': 'FRAGILE', '': '—'}
ENT_5_6 = {
 "Pour quel client est la palette": {"rep": "Jouets du Rhône (client fictif, à Corbas)."},
 "Quand part-elle, et à quel quai": {"rep": "Demain (jeudi 10 décembre) à 6 h, quai n° 1."},
 "Quel transporteur l’emporte": {"rep": "Kuehne+Nagel (enlèvement E1)."},
 "Combien de produits différents": {"rep": "Six."},
 "Combien de palettes de cette commande": {"rep": "32 palettes complètes ; celle-ci est la 33e."},
 "Bruno dit : « lourds en bas": {"pistes": [
   "Les cartons lourds écraseraient les fragiles (les cuisines Tefal).",
   "Une palette lourde en haut bascule plus facilement dans les virages ou au freinage.",
   "Le client recevrait des jouets abîmés : réclamation, retour, image de Smoby."]},
 "T: Ligne | Adresse | Produit": {"lignes": [[str(i + 1), a, PROD[p]['nom'], LF[PROD[p]['classe']], str(q)]
     for i, (a, p, q) in enumerate(LIGNES)],
   "note": "Bon BP-1210-JDR, dans l'ordre du serpentin (allée A en montant, allée B en descendant). Jalon 1 : les six lignes en quantité juste."},
 "Pourquoi les allées sont-elles à sens unique": {"pistes": [
   "Les chariots ne se croisent pas : moins de risques d'accident.",
   "Tout le monde suit le même chemin : pas d'aller-retour inutile.",
   "Le parcours est le plus court quand on suit l'ordre du bon."]},
 "Quelle ligne est en rupture": {"rep": f"La ligne {R_I + 1} : {PROD[R_P]['nom']}."},
 "Combien de cartons au picking": {"rep": f"{R_STOCK} au picking pour {R_Q} commandés."},
 "Quel est le minimum de ce picking": {"rep": f"{R_MIN} cartons."},
 "Quelle palette as-tu fait descendre": {"rep": ' ou '.join(sorted(RESERVE_OK)) + f" (une palette {PROD[R_P]['nom']} au-dessus du picking).",
   "note": "Jalon 2. Refusés à l'écran : une autre référence, un picking au-dessus de son minimum, un emplacement N1."},
 f"Pourquoi pas la palette {PIEGE}": {"rep": f"C'est une palette {PROD[STOCK[PIEGE]]['nom']}, pas {PROD[R_P]['nom']} : on réapprovisionne avec la même référence."},
 "Pourquoi ne monte-t-on pas chercher": {"pistes": [
   "Monter en hauteur à la main, c'est risquer une chute : interdit.",
   "La réserve, c'est une palette entière : on la descend au chariot (CACES 5), puis on prélève au sol.",
   "Le picking est fait pour ça : tout ce qu'on prend à la main est à hauteur d'homme."]},
 "T: Couche (de haut en bas)": {"lignes": [[str(6 - i), PROD[LIGNES[5 - i][1]]['nom'], {'lourd': 'L', 'fragile': 'F', '': '—'}[PROD[LIGNES[5 - i][1]]['classe']]]
     for i in range(6)],
   "note": "Une couche par produit (chaque ligne tient sur une couche de la palette). Jalons 3 et 4 : rien de lourd après un non-lourd, rien après un fragile."},
 "Pourquoi le transporteur": None,
 "Le plan d'implantation met les produits lourds": {"pistes": [
   "En suivant le parcours, on prend forcément le lourd d'abord et le fragile en dernier.",
   "Le bon de préparation est déjà dans le bon ordre : pas besoin de réfléchir à chaque carton.",
   "Le rangement d'hier prépare la préparation d'aujourd'hui."]},
 "T: Produit | Cartons | kg par carton": {"lignes": [[PROD[p]['nom'], str(q), v(PROD[p]['kg']), v(w), str(c), v(PROD[p]['h']) + ' m', v(round(hh, 2))]
     for (_, p, q), w, c, hh in zip(LIGNES, POIDS, COUCHES, HAUTS)] + [['Palette vide', '', '', '25', '', '', '0,15'],
     ['TOTAL', '', '', v(POIDS_TOTAL), '', '', v(HAUT_TOTALE)]],
   "note": f"Poids = cartons × kg par carton. Couches = cartons ÷ cartons par couche (ici 1 chaque fois). Total : {v(POIDS_TOTAL)} kg et {v(HAUT_TOTALE)} m, comme le corrigé de la séance (jalons 5 et 6)."},
 "Ta palette respecte-t-elle les 800 kg": {"rep": f"Oui : {v(POIDS_TOTAL)} kg ≤ 800 kg."},
 "Respecte-t-elle les 1,80 m": {"rep": f"Oui : {v(HAUT_TOTALE)} m ≤ 1,80 m, il reste {v(round(H_MAX - HAUT_TOTALE, 2))} m (6 cm)."},
 "Pourquoi le transporteur fixe-t-il une hauteur": {"pistes": [
   "Une palette trop haute est instable : elle bascule au freinage.",
   "Les palettes doivent passer sous la porte du quai et du client, et se manier au transpalette.",
   "Le transporteur prévoit la place de chaque palette dans la remorque."]},
 "Combien de tours de film": {"rep": "Entre 3 et 5 tours.", "note": "Jalon 7."},
 "Où as-tu collé les étiquettes": {"rep": "Sur deux côtés opposés (avant et arrière, ou gauche et droite) et sur le dessus.", "note": "Jalon 8 : exactement 2 côtés opposés + dessus."},
 "Combien de mètres as-tu parcourus": {"rep": f"{METRES} m si le bon est suivi dans l'ordre du serpentin.", "note": f"Jalon 9 : ≤ {METRES} m, seulement si les 6 lignes sont justes (mètres calculés par le moteur)."},
 "Que fait Bruno de ta palette": {"rep": "Il la met en zone d'expédition avec les 32 autres ; Kuehne+Nagel charge le tout demain à 6 h."},
 "Demain à 6 h, le chauffeur": {"pistes": [
   "Savoir à quel client va la palette et par quel enlèvement (JDR · E1).",
   "Ne pas la confondre avec une palette d'un autre client.",
   "La lire sans la déplacer, quel que soit le côté où il se trouve."]},
}
del ENT_5_6["Pourquoi le transporteur"]
for ph, mot in ESSENTIEL:
    ENT_5_6[ph.split('{}')[0].strip()] = {"rep": mot + '.'}
ENT_5_6['T: Mot | Définition (complète avec la banque de mots)'] = {
    "lignes": [[mot, m] for mot, _, m in LEXIQUE], "note": "Un mot de la banque par trou."}
corriges_data._DICOS['ENT-5.6'] = [ENT_5_6]

NOTIONS = [
    ["Une palette « mixte »", "Préparation de commandes", "Une palette mixte porte plusieurs références d'une même commande."],
    ["Pour préparer une commande", "Préparation de commandes", "On prélève au picking (N1), à hauteur d'homme ; la réserve sert à le remplir."],
    ["Un picking a moins de cartons", "Réapprovisionnement", "Sous le minimum, on descend une palette de réserve de la même référence."],
    ["Le bon est trié", "Préparation de commandes", "Le bon trié dans l'ordre du parcours fait prendre le lourd en premier : il fait la base."],
    ["On colle l'étiquette", "Expédition", "L'étiquette d'expédition doit se lire de chaque côté : deux côtés opposés et le dessus."],
    ["Trop peu de tours de film", "Expédition", "Le film (3 à 5 tours ici) tient les cartons pendant le transport."],
]
T.finir('ENT-5.6', 'Smoby — la palette de la commande de Noël', 'ENT-5.6-smoby-preparation-trame-eleve', NOTIONS,
        os.path.basename(__file__))
