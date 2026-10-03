# -*- coding: utf-8 -*-
"""Trame élève Boost — séance ENT-3.1 « la tournée du vélo-cargo ».

Mêmes règles de mise en page que les trames Spartoo (fiche `prepalog-trames-eleve`) : en-tête
sur la première page seule, de la place pour écrire, un saut de page entre les étapes, jamais
de coupure juste après une consigne, on commence hors de l'outil, tout jalon contrôlé
automatiquement est annoncé à l'élève.

Première trame écrite sous les TROIS EXIGENCES du 02/10/2026 :
  1. avancer en autonomie : chaque étape dit où cliquer et ce qu'on doit voir ;
  2. découvrir le scénario pas à pas : la trame n'annonce ni la masse totale, ni le client à
     laisser à quai, ni le kilométrage — l'élève bute dessus ;
  3. au moins une analyse réflexive par étape de travail, posée sur ce que l'élève vient de
     produire, deux lignes pour répondre, sans bonne réponse unique.

Rien de ce qui est dans le site n'est recopié ici sauf ce que l'élève doit pouvoir lire sur
papier (la fiche de tournée : noms et rues des sept clients).
"""
import os, sys
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_BREAK, WD_TAB_ALIGNMENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# Noir et gris, comme les trames Spartoo (décision du 01/10/2026) : la trame s'imprime souvent
# en noir et blanc. Seuls les logos portent de la couleur.
ENCRE = RGBColor(0x1a, 0x1a, 0x1a)
TITRE = RGBColor(0x11, 0x11, 0x11)
GRIS  = RGBColor(0x59, 0x59, 0x59)

RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
LOGO = os.path.join(RACINE, 'contenus', 'trames', 'logos', 'boost.png')
LOGO_PREPALOG = os.path.join(RACINE, 'styles', 'logo.png')

d = Document()
st = d.styles['Normal']
st.font.name = 'Calibri'; st.font.size = Pt(11); st.font.color.rgb = ENCRE
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Calibri')
st.paragraph_format.space_after = Pt(6); st.paragraph_format.line_spacing = 1.08
for s in d.sections:
    s.top_margin = Cm(1.2); s.bottom_margin = Cm(1.3)
    s.left_margin = s.right_margin = Cm(1.9)


_SAUT = [False]


def saut_avant():
    """Le prochain bloc commence une nouvelle page (page_break_before sur son premier paragraphe :
    jamais un paragraphe de saut, qui laissait une page blanche quand la page était pleine)."""
    _SAUT[0] = True


def _consomme():
    v = _SAUT[0]; _SAUT[0] = False
    return v


def colle_au_suivant():
    pars = d.paragraphs
    if not pars or _SAUT[0]:   # un saut de page est demandé : rien ne doit descendre avec le bloc
        return
    pars[-1].paragraph_format.keep_with_next = True
    if not pars[-1].text.strip() and len(pars) > 1:
        pars[-2].paragraph_format.keep_with_next = True


def ombre(cell, hexa):
    sh = OxmlElement('w:shd'); sh.set(qn('w:fill'), hexa); cell._tc.get_or_add_tcPr().append(sh)


DERNIER_P = ['']

def p(texte='', taille=11, gras=False, couleur=None, avant=0, apres=6):
    DERNIER_P[0] = texte
    par = d.add_paragraph(); par.paragraph_format.space_before = Pt(avant); par.paragraph_format.space_after = Pt(apres)
    if _consomme(): par.paragraph_format.page_break_before = True
    r = par.add_run(texte); r.bold = gras; r.font.size = Pt(taille); r.font.color.rgb = couleur or ENCRE
    return par


ETAPE_NUM, ETAPE_TITRE = 0, ''

def etape(num, titre, saut=True):
    global ETAPE_NUM, ETAPE_TITRE
    ETAPE_NUM, ETAPE_TITRE = num, titre
    par = d.add_paragraph()
    if saut:
        # page_break_before et non un saut dans un paragraphe : si la page précédente est pleine,
        # le saut tombait sur la page suivante et laissait une page blanche.
        par.paragraph_format.page_break_before = True
        par.paragraph_format.space_before = Pt(0)
    else:
        par.paragraph_format.space_before = Pt(18)
    par.paragraph_format.space_after = Pt(0)
    r = par.add_run(f'ÉTAPE {num}'); r.bold = True; r.font.size = Pt(9.5); r.font.color.rgb = GRIS; r.font.name = 'Consolas'
    par2 = d.add_paragraph(); par2.paragraph_format.space_before = Pt(2); par2.paragraph_format.space_after = Pt(8)
    r2 = par2.add_run(titre); r2.bold = True; r2.font.size = Pt(15); r2.font.color.rgb = TITRE
    par.paragraph_format.keep_with_next = True
    par2.paragraph_format.keep_with_next = True


def coupe():
    par = d.add_paragraph(); par.paragraph_format.space_after = Pt(0)
    par.add_run().add_break(WD_BREAK.PAGE)


def soustitre(t):
    par = d.add_paragraph(); par.paragraph_format.space_before = Pt(12); par.paragraph_format.space_after = Pt(4)
    r = par.add_run(t); r.bold = True; r.font.size = Pt(11.5); r.font.color.rgb = TITRE
    par.paragraph_format.keep_with_next = True


def consignes(items):
    for i, it in enumerate(items, 1):
        par = d.add_paragraph()
        par.paragraph_format.space_after = Pt(4)
        par.paragraph_format.left_indent = Cm(0.8)
        par.paragraph_format.first_line_indent = Cm(-0.8)
        r = par.add_run(f'{i}.  '); r.bold = True; r.font.size = Pt(11); r.font.color.rgb = TITRE
        par.add_run(it).font.size = Pt(11)
        if i < len(items):
            par.paragraph_format.keep_with_next = True


def encadre(titre, texte, espace=True):
    colle_au_suivant()
    t = d.add_table(rows=1, cols=1); t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.LEFT
    c = t.rows[0].cells[0]; ombre(c, 'F2F2F2')
    par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(0)
    if _consomme(): par.paragraph_format.page_break_before = True
    r = par.add_run(titre + ' '); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
    r2 = par.add_run(texte); r2.font.size = Pt(10)
    if espace:
        d.add_paragraph().paragraph_format.space_after = Pt(2)


def questions(liste, lignes=2):
    """Une question, UNE zone de réponse, puis la suivante (Tristan, 02/10/2026) : pas de double
    question. Un élément est un texte, ou (texte, nombre de lignes) pour adapter la zone."""
    colle_au_suivant()
    t = d.add_table(rows=0, cols=1); t.style = 'Table Grid'
    saut = _consomme()
    for q in liste:
        q, n = q if isinstance(q, tuple) else (q, lignes)
        _note('reflexion' if lignes == 4 and not isinstance(q, tuple) and _REFL[0] else ('brouillon' if n >= 6 else 'question'), q, lignes=n)
        row = t.add_row(); c = row.cells[0]; ombre(c, 'FAFAFA')
        trPr = row._tr.get_or_add_trPr(); cs = OxmlElement('w:cantSplit'); trPr.append(cs)
        par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(4)
        if saut: par.paragraph_format.page_break_before = True; saut = False
        r = par.add_run(q); r.font.size = Pt(10.5); r.bold = True
        for _ in range(n):
            rep = c.add_paragraph()
            rep.paragraph_format.space_before = Pt(0); rep.paragraph_format.space_after = Pt(4)
            rep.add_run('').font.size = Pt(11)
        row.height = Cm(0.9 + 0.85 * n)
    vide = d.add_paragraph(); vide.paragraph_format.space_after = Pt(0)
    vide.add_run('').font.size = Pt(5)
    vide.paragraph_format.line_spacing = Pt(3)


def faits(liste, hauteur=Cm(0.9)):
    """Questions de fait à une ligne : un tableau « question / ta réponse », une ligne par question
    (une question, une zone), bien plus compact que des blocs séparés — pour tenir une étape sur
    une seule page (Tristan, 02/10/2026)."""
    colle_au_suivant()
    t = d.add_table(rows=1, cols=2); t.style = 'Table Grid'
    for i, h in enumerate(['Question', 'Ta réponse']):
        c = t.rows[0].cells[i]; ombre(c, 'E8E8E8')
        par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(0)
        par.paragraph_format.keep_with_next = True
        r = par.add_run(h); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
    for q in liste:
        q = q[0] if isinstance(q, tuple) else q
        _note('fait', q)
        row = t.add_row(); row.height = hauteur
        row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
        par = row.cells[0].paragraphs[0]; par.paragraph_format.space_after = Pt(0)
        par.add_run(q).font.size = Pt(10)
    for row in t.rows:
        row.cells[0].width = Cm(10.4); row.cells[1].width = Cm(6.6)
    t.autofit = False
    t.columns[0].width = Cm(10.4); t.columns[1].width = Cm(6.6)
    vide = d.add_paragraph(); vide.paragraph_format.space_after = Pt(0)
    vide.add_run('').font.size = Pt(5); vide.paragraph_format.line_spacing = Pt(3)


_REFL = [False]
ITEMS = []   # toutes les questions de la trame, dans l'ordre : sert au corrigé complet

def _note(genre, texte, **extra):
    ITEMS.append(dict(etape=ETAPE_NUM, etapeTitre=ETAPE_TITRE, genre=genre, texte=texte, **extra))

CLES = []   # corrigé : une entrée par QCM, écrit dans contenus/corriges/ à la fin du script

def qcm(liste):
    """QCM pour la partie éco-droit (Tristan, 02/10/2026 : « trop dur » en réponse libre).
    Trois choix, une seule bonne réponse, à cocher. Chaque élément : (question, [choix], index de la bonne).
    Les choix courts tiennent sur une ligne ; sinon un choix par ligne. Une question, une zone."""
    colle_au_suivant()
    t = d.add_table(rows=0, cols=1); t.style = 'Table Grid'
    saut = _consomme()
    for q, choix, bon in liste:
        _note('qcm', q, choix=list(choix), bonne=bon)
        CLES.append(dict(etape=ETAPE_NUM, etapeTitre=ETAPE_TITRE, question=q, choix=list(choix), bonne=bon))
        row = t.add_row(); c = row.cells[0]; ombre(c, 'FAFAFA')
        row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
        par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(3)
        par.paragraph_format.keep_with_next = True
        if saut: par.paragraph_format.page_break_before = True; saut = False
        r = par.add_run('QCM  '); r.bold = True; r.font.size = Pt(9); r.font.color.rgb = GRIS
        r = par.add_run(q); r.bold = True; r.font.size = Pt(10.5)
        court = sum(len(x) for x in choix) < 84
        lignes = ['\u2610  ' + ('      \u2610  '.join(choix))] if court else ['\u2610  ' + x for x in choix]
        for i, ligne in enumerate(lignes):
            o = c.add_paragraph(); o.paragraph_format.space_before = Pt(0)
            o.paragraph_format.space_after = Pt(2 if i < len(lignes) - 1 else 4)
            if i < len(lignes) - 1: o.paragraph_format.keep_with_next = True
            o.paragraph_format.left_indent = Cm(0.4)
            o.add_run(ligne).font.size = Pt(10.5)
    vide = d.add_paragraph(); vide.paragraph_format.space_after = Pt(0)
    vide.add_run('').font.size = Pt(5); vide.paragraph_format.line_spacing = Pt(3)


def reflechir(liste):
    """Analyse réflexive (règle n° 8) : un bandeau qui dit qu'il n'y a pas une seule bonne
    réponse, puis les questions, deux lignes chacune."""
    par = d.add_paragraph(); par.paragraph_format.space_before = Pt(8); par.paragraph_format.space_after = Pt(4)
    if _consomme(): par.paragraph_format.page_break_before = True
    r = par.add_run('Pour réfléchir'); r.bold = True; r.font.size = Pt(11.5); r.font.color.rgb = TITRE
    r = par.add_run("   Il n'y a pas une seule bonne réponse : explique la tienne, avec tes mots.")
    r.font.size = Pt(9.5); r.font.color.rgb = GRIS
    par.paragraph_format.keep_with_next = True
    # Quatre lignes : une analyse réflexive appelle des réponses longues (Tristan, 02/10/2026).
    _REFL[0] = True
    questions(liste, 4)
    _REFL[0] = False


def tableau(entetes, nlignes, largeurs=None, hauteur=Cm(1.15), remplis=None):
    """`remplis` : liste de listes, une par ligne, pour pré-imprimer des cellules ('' = à compléter)."""
    colle_au_suivant()
    if ETAPE_NUM:
        _note('tableau', ' | '.join(entetes), lignes=(len(remplis) if remplis else nlignes), contexte=DERNIER_P[0], lignes_imprimees=[r[0] for r in remplis] if remplis else None)
    t = d.add_table(rows=1, cols=len(entetes)); t.style = 'Table Grid'
    for i, h in enumerate(entetes):
        c = t.rows[0].cells[i]; ombre(c, 'E8E8E8')
        par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(0)
        r = par.add_run(h); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
        par.paragraph_format.keep_with_next = True   # l'en-tête ne reste jamais seul en bas de page
    n = len(remplis) if remplis else nlignes
    for k in range(n):
        row = t.add_row(); row.height = hauteur
        if remplis:
            for i, txt in enumerate(remplis[k]):
                if txt:
                    par = row.cells[i].paragraphs[0]; par.paragraph_format.space_after = Pt(0)
                    par.add_run(txt).font.size = Pt(10)
    if largeurs:
        t.autofit = False
        for i, w in enumerate(largeurs): t.columns[i].width = w
        for row in t.rows:
            for i, w in enumerate(largeurs): row.cells[i].width = w
    d.add_paragraph().paragraph_format.space_after = Pt(2)


# La fiche de tournée, telle que le responsable la donne par message : nom et RUE de chaque
# client (jamais le quartier, jamais la case — c'est ce que l'élève doit trouver). Les masses
# y figurent aussi dans le message, mais la trame ne les recopie pas : l'élève les lit à
# l'écran quand il en a besoin (étape 7).
CLIENTS = [
    ('Le Comptoir des Halles', 'rue du Général Perrier'),
    ('Épicerie Verdier', 'rue de Combret'),
    ('La Pointe Sud', "rue de l'Hostellerie"),
    ('Maison Lauze', 'rue de Mascard'),
    ('Studio Garance', 'rue Edmond Rostand'),
    ('Atelier Mazet', 'rue Graverol'),
    ('Caveau Pélissier', 'rue Roger Sabatier'),
]

# ==================================================================== en-tête
par = d.add_paragraph(); par.paragraph_format.space_after = Pt(2)
par.paragraph_format.tab_stops.add_tab_stop(Cm(17.0), WD_TAB_ALIGNMENT.RIGHT)
if os.path.exists(LOGO_PREPALOG):
    par.add_run().add_picture(LOGO_PREPALOG, height=Cm(1.15))
r = par.add_run('  Logisim')
r.bold = True; r.font.size = Pt(20); r.font.color.rgb = TITRE
par.add_run('\t')
if os.path.exists(LOGO):
    par.add_run().add_picture(LOGO, height=Cm(1.5))
else:
    r = par.add_run('BOOST'); r.bold = True; r.font.size = Pt(15); r.font.color.rgb = TITRE

par = d.add_paragraph(); par.paragraph_format.space_after = Pt(0)
r = par.add_run("ENT-3.1 — Carnet de suivi : la tournée du vélo-cargo")
r.bold = True; r.font.size = Pt(18); r.font.color.rgb = TITRE

d.add_paragraph().paragraph_format.space_after = Pt(6)

t = d.add_table(rows=3, cols=4); t.style = 'Table Grid'
for lib, li, co in [('Nom', 0, 0), ('Prénom', 0, 2), ('Classe', 1, 0), ('Date', 1, 2), ('Matricule Prepalog', 2, 0)]:
    c = t.rows[li].cells[co]; ombre(c, 'E8E8E8')
    par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(0)
    r = par.add_run(lib); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
# Matricule : une seule case de réponse, sur toute la largeur restante. Avant, la ligne gardait
# deux cases vides à droite, qui ne servaient à rien et laissaient croire qu'il fallait les remplir.
t.rows[2].cells[1].merge(t.rows[2].cells[3])
for row in t.rows: row.height = Cm(1.1)
d.add_paragraph().paragraph_format.space_after = Pt(4)

encadre('Ce document est ta trame de travail :',
        "tu peux le suivre seul, étape par étape. Chaque étape dit où cliquer et ce que tu dois voir à l'écran.")
encadre('Ce que ton enseignant voit dans son suivi :',
        "six points, qui donnent une note sur 20 : clients bien situés (case ET quartier), commandes chargées et "
        "laissées à quai, charge du vélo-cargo, arrivée avant le train, deux résultats reportés, formules. Tes "
        "réponses écrites ici ne sont pas notées par le logiciel : elles servent à réfléchir.")

# ==================================================================== étape 1
soustitre("Le déroulé de ta séance")
p("Chaque étape commence sur une nouvelle page. Passe à la suivante quand tu as répondu à toutes les questions "
  "de celle-ci.", taille=10, apres=4)
tableau(['N°', 'Étape', 'Où travailles-tu ?'], 0, [Cm(1.4), Cm(11.0), Cm(4.6)], hauteur=Cm(0.9),
        remplis=[['1', 'Découvrir Boost', 'Sur Internet'],
        ['2', 'Ouvrir son environnement et lire la consigne', 'Dans Prepalog'],
        ['3', 'Situer les sept clients sur le plan', 'Dans Prepalog'],
        ['4', 'Charger le vélo-cargo', 'Dans Prepalog'],
        ['5', 'Ordonner les arrêts', 'Dans Prepalog'],
        ['6', 'Calculer dans la feuille de calcul', 'Dans Prepalog'],
        ['7', 'Reporter tes résultats', 'Dans Prepalog']])

etape(1, "Découvrir Boost")
p("Avant d'ouvrir le logiciel, il faut savoir pour qui tu travailles. Boost existe vraiment, à Nîmes. Cet "
  "après-midi, tu prends la tournée de son vélo-cargo. Fais d'abord une recherche sur Internet.")
consignes([
    "Cherche « Boost logistique e-commerce Nîmes » et ouvre son site.",
    "Cherche ensuite « WePost vélo-cargo Nîmes » pour comprendre comment ses colis voyagent.",
    "Réponds aux questions ci-dessous avec ce que tu trouves.",
])
questions([
 ('Que fait Boost pour ses clients ?', 2),
])
faits(["Qu'est-ce qu'un « logisticien e-commerce » ?"])
qcm([
 ("Pourquoi une marque comme Marou confie-t-elle l'envoi de ses colis à Boost ? (c'est l'externalisation)",
  ["parce que la loi l'y oblige", "pour se concentrer sur son métier pendant que Boost s'occupe de la logistique", "parce que Boost fabrique ses produits"], 1),
])
questions([
 ("Boost est une « entreprise d'insertion ». Qu'est-ce que cela veut dire ?", 2),
 ("Cite un avantage d'envoyer les colis en vélo-cargo puis en train, plutôt qu'en camion.", 2),
 ('Cite une limite de ce mode de transport.', 2),
])
encadre('Ce qui est vrai, ce qui est inventé :',
        "Boost, son adresse, ses clients de marque (Marou, Molleni, Jacker), le vélo-cargo et le train sont réels. "
        "Les sept commerces à livrer, leurs colis, les poids, les horaires et la charge du vélo sont inventés pour "
        "l'exercice. Les rues, elles, sont de vraies rues de Nîmes.", espace=False)

# ==================================================================== étape 2
etape(2, "Ouvrir son environnement et lire la consigne")
p("Connecte-toi à Prepalog, ouvre la rubrique Logisim, puis l'activité « Boost — la tournée du vélo-cargo ». "
  "Le logiciel s'ouvre aux couleurs de Boost. Tu dois voir, à gauche, un menu avec « Messagerie ». Clique dessus : "
  "un message t'attend. Lis-le en entier avant de toucher à autre chose.")
consignes([
    "Ouvre le message de M. Morin, responsable d'exploitation : « Tournée vélo-cargo du jour ».",
    "Repère la liste des sept commandes : tu en auras besoin pendant toute la séance.",
    "Relève dans son message les informations ci-dessous.",
])
tableau(['Information', 'Ce que tu relèves'], 6, [Cm(7.4), Cm(9.6)], hauteur=Cm(1.0),
        remplis=[["Heure de départ de l'entrepôt", ''],
                 ["Heure de départ du train pour Paris", ''],
                 ["Charge maximale du vélo-cargo (kg)", ''],
                 ["Vitesse du vélo-cargo en ville (km/h)", ''],
                 ["Temps passé à chaque arrêt (min)", ''],
                 ["Où doit arriver le vélo-cargo ?", '']])
p("Dans la liste des commandes, une ligne donne : le nom du commerce, sa rue, le nombre de colis et le poids. "
  "Les clients ne donnent que le nom de leur rue : pas de quartier, pas de case.", taille=9.5, apres=8)
reflechir([
    "M. Morin demande de situer les clients sur un plan AVANT de construire la tournée. Pourquoi, à ton avis ?",
    "Un colis qui rate le train est livré un jour plus tard. Quelle conséquence cela a-t-il pour le client ?",
])

# ==================================================================== étape 3
etape(3, "Situer les sept clients sur le plan")
p("Dans le menu de gauche, clique sur « Plan de Nîmes ». Tu vois la vraie carte de la ville, avec un quadrillage : "
  "des colonnes A à E et des lignes 1 à 5 (une case fait 1 km de côté). Une case s'écrit lettre puis chiffre, par "
  "exemple C2. Les sept quartiers sont dessinés avec leur nom, et les sept clients sont des points numérotés : "
  "le numéro est celui de la fiche de M. Morin. Leurs noms ne sont pas encore écrits sur la carte.")
consignes([
    "Sous la carte, le tableau a une ligne par client, avec le numéro et la rue. Clique sur une ligne : son point "
    "s'entoure sur la carte (et l'inverse marche aussi : clique sur un point).",
    "Lis la case du point : la lettre de la colonne, puis le chiffre de la ligne.",
    "Lis le nom du quartier dessiné autour du point. Pour vérifier la rue, clique sur le quartier : la carte "
    "zoome et écrit les noms de rues.",
    "Écris ta réponse dans le tableau ci-dessous, puis dans la ligne du logiciel : la case à taper, le quartier à "
    "choisir dans le menu déroulant.",
])
tableau(['N°', 'Rue', 'Quartier', 'Case'], 0, [Cm(1.4), Cm(6.2), Cm(5.8), Cm(3.6)], hauteur=Cm(1.0),
        remplis=[[str(i), r_, '', ''] for i, (n, r_) in enumerate(CLIENTS, 1)])
encadre('Deux conseils :',
        "le menu des quartiers propose douze noms pour sept clients : cinq ne sont à personne, donc tu ne peux pas "
        "finir par élimination. Si tu hésites entre deux cases, choisis celle où se trouve le centre du point : le "
        "logiciel accepte une seule case fausse.")
saut_avant()
p("Clique maintenant sur « Valider le repérage ».")
encadre('Ce que tu dois voir :',
        "un champ qui devient rouge quand la case ou le quartier est faux ; le message « Repérage validé » quand tout "
        "est bon ; les sept noms de clients qui s'écrivent dans le tableau ; et une nouvelle entrée dans le menu de "
        "gauche, « Tournée du 14 avril ». Le logiciel accepte une erreur, mais le point du suivi n'est donné que si "
        "les sept clients sont justes. Après trois essais ratés, un bouton « Je ne trouve pas, continuer quand même » "
        "apparaît : tu peux avancer, mais ton suivi le montre. Le « Mode hors connexion » (en haut) remplit les "
        "quartiers à ta place, sans les cases ; son usage est lui aussi noté dans le suivi.")
reflechir([
    "Pour le client le plus difficile à situer, comment as-tu trouvé la case et le quartier ?",
    "Un livreur se trompe de quartier. Quelles conséquences cela a-t-il pour Boost ?",
])

# ==================================================================== étape 4
etape(4, "Charger le vélo-cargo")
p("Clique sur « Tournée du 14 avril ». Tu vois la carte avec tes sept clients, et une jauge « Charge du "
  "vélo-cargo ». Le vélo-cargo part VIDE : c'est toi qui le charges.")
consignes([
    "Clique sur un client, sur la carte : sa commande est chargée dans le vélo-cargo. Un deuxième clic la retire.",
    "Regarde la jauge « Charge du vélo-cargo » après chaque clic.",
    "Essaie de charger les sept commandes. Observe ce qui se passe sur la jauge.",
    "Décide ce que le vélo-cargo emporte. Une commande retirée apparaît dans « Commandes restées à quai ».",
])
encadre('Ce que tu dois voir :',
        "la jauge monte à chaque commande chargée, et elle te prévient quand la limite est franchie. Elle ne te dit "
        "pas de combien : c'est à toi de le trouver, à l'étape 6.")
p("Note ta décision :", taille=10.5, gras=True, avant=6)
tableau(['Client', 'Chargé ou à quai ?', 'Ce qui m\'a fait choisir'], 0, [Cm(5.0), Cm(3.6), Cm(8.4)], hauteur=Cm(0.8),
        remplis=[[n, '', ''] for n, _ in CLIENTS])
reflechir([
    "Qu'as-tu vu à l'écran qui t'a fait comprendre que tu ne pouvais pas tout emporter ?",
    "Pourquoi as-tu laissé CE client à quai plutôt qu'un autre ? (M. Morin précise que ce qui reste à quai partira "
    "demain.)",
])

# ==================================================================== étape 5
etape(5, "Ordonner les arrêts")
p("Le vélo-cargo ne prend pas n'importe quel chemin : l'ordre de passage change les kilomètres, donc le temps. "
  "Il doit arriver à la gare avant le train.")
consignes([
    "Sur la carte, le départ (l'entrepôt) et l'arrivée (la gare) se cliquent comme les clients : ils font partie "
    "de ta tournée.",
    "Clique les clients dans l'ordre où tu veux y passer. L'ordre de tes clics est l'ordre de la tournée.",
    "Pour insérer un client au milieu, utilise les flèches ↑ et ↓ du récapitulatif.",
    "Regarde le tracé vert sur la carte et la jauge d'horaire (« départ du train »).",
])
encadre('Ce que tu dois voir :',
        "un tracé qui suit ton ordre, et une jauge qui dit si le train est tenu. Elle ne dit pas de combien de minutes "
        "tu as manqué ou gagné. Chaque fois que tu changes ta tournée, les kilomètres changent.")
p("Note tes essais :", taille=10.5, gras=True, avant=6)
tableau(['Essai', "Ordre des arrêts (numéros ou noms)", 'Train tenu ?'], 4, [Cm(1.8), Cm(11.6), Cm(3.6)],
        hauteur=Cm(1.25), remplis=[['1', '', ''], ['2', '', ''], ['3', '', ''], ['4', '', '']])
reflechir([
    "Qu'est-ce qui rendait ton premier ordre plus long ou plus court que les suivants ?",
    "Quel principe as-tu trouvé pour choisir l'ordre des arrêts ?",
])

# ==================================================================== étape 6
etape(6, "Calculer dans la feuille de calcul")
p("Sous la carte, la feuille de calcul est faite avec TA tournée : les lignes sont tes arrêts, dans ton ordre. "
  "Les cases colorées sont à remplir avec une formule, c'est-à-dire un calcul qui commence par « = ». Le résultat "
  "s'affiche à droite de la case. À droite de la feuille, les contraintes : la charge maximale et l'heure du "
  "train.")
encadre('Les couleurs :',
        "jaune = une étape du calcul. Violet = un résultat à comparer à une contrainte. Si tu changes ta tournée, "
        "les données changent et tes formules se recalculent seules ; mais les « juste » disparaissent, et il faut "
        "cliquer à nouveau sur « Vérifier mes formules ».")
consignes([
    "Poids total chargé : écris une formule avec SOMME qui additionne les poids de tes arrêts. Au lieu de taper les "
    "adresses, clique sur la première cellule des poids puis fais glisser la souris jusqu'à la dernière (ou "
    "Maj + clic).",
    "Étape 1 : distance ÷ vitesse. Le résultat est un temps en heures.",
    "Étape 2 : convertis ces heures en minutes (1 heure = 60 minutes).",
    "Étape 3 : temps aux arrêts = nombre d'arrêts × temps par arrêt.",
    "Heure de départ : tape simplement 14:00 (pas de formule).",
    "Heure d'arrivée : heure de départ + temps de route (min) + temps aux arrêts (min).",
    "Clique sur « Vérifier mes formules ».",
])
encadre('À savoir :',
        "le logiciel compte les heures en minutes depuis minuit : 14 h 00, c'est 14 × 60 = 840 minutes. C'est ce qui "
        "te permet d'ajouter une heure et des minutes. Ne tape pas « 14 » tout seul : écris 14:00 ou 14h00. Un "
        "exemple pour comprendre l'étape 1 : 6 km à 12 km/h, c'est 6 ÷ 12 = 0,5 h.")
p("Note les formules que tu as écrites :", taille=10.5, gras=True)
tableau(['Ce qu\'on calcule', 'Cellule', 'Ma formule', 'Résultat affiché'], 0,
        [Cm(5.0), Cm(2.0), Cm(5.6), Cm(4.4)], hauteur=Cm(1.2),
        remplis=[['Poids total chargé (kg)', '', '', ''],
                 ['Étape 1 · temps de route (h)', '', '', ''],
                 ['Étape 2 · temps de route (min)', '', '', ''],
                 ['Étape 3 · temps aux arrêts (min)', '', '', ''],
                 ["Heure d'arrivée à la gare", '', '', '']])
saut_avant()
encadre('Ce que tu dois voir :',
        "après « Vérifier », les cellules justes passent au vert avec « juste ». Si toutes tes formules sont justes "
        "mais qu'une contrainte est franchie, la contrainte passe en rouge et le logiciel écrit : « Le calcul est "
        "bon : c'est la tournée qu'il faut revoir. » Il ne te dit pas de combien : tu le lis toi-même en comparant "
        "tes résultats aux contraintes.")
soustitre('Compare tes résultats aux contraintes')
faits(['Ton poids total est-il au-dessus ou en dessous de la charge maximale ?', "Ton heure d'arrivée est-elle avant ou après l'heure du train ?"])
reflechir([
    "Si une contrainte est franchie alors que tes formules sont justes, que dois-tu changer : les formules ou "
    "la tournée ? Explique.",
    "Si le vélo-cargo roulait à 15 km/h, qu'est-ce qui changerait dans ta feuille ?",
])

# ==================================================================== étape 7
etape(7, "Reporter tes résultats")
p("Dernière étape : en bas de la page « Tournée du 14 avril », deux cases à remplir. Elles portent sur ta "
  "DÉCISION, pas sur la feuille : aucune jauge ne te donne ces nombres.")
consignes([
    "Additionne le poids des sept commandes de la fiche de M. Morin (même celles que tu as laissées à quai).",
    "Cherche ensuite de combien ce total dépasse la charge maximale du vélo-cargo.",
    "Écris les deux résultats ci-dessous, puis dans les deux cases de la page.",
    "Clique sur « Valider mes résultats ».",
])
tableau(['Client', 'Poids (kg)'], 0, [Cm(10.0), Cm(7.0)], hauteur=Cm(0.8),
        remplis=[[n, ''] for n, _ in CLIENTS])
tableau(['Résultat', 'Mon calcul', 'Ma réponse (kg)'], 0, [Cm(7.0), Cm(6.0), Cm(4.0)], hauteur=Cm(1.2),
        remplis=[['Masse totale des sept commandes', '', ''],
                 ["Masse qui ne peut pas partir aujourd'hui", '', '']])
encadre('Ce que tu dois voir :',
        "chaque case dit seulement si ta réponse est juste, pas la bonne valeur. Le logiciel refuse de valider tant "
        "que ta tournée ne tient pas : il faut que la charge soit respectée, que le train soit tenu et que le départ "
        "et l'arrivée soient posés. Si on te refuse, retourne à la carte : c'est la tournée qui est à revoir, pas "
        "tes cases.")
saut_avant()
reflechir([
    "Dans une vraie entreprise, qui prévient le client dont la commande reste à quai ?",
    "Que lui dit-on ?",
    "Si le vélo-cargo pouvait porter 250 kg, qu'est-ce que cela changerait à ta tournée ?",
])

SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      '..', 'contenus', 'trames', 'ENT-3.1-boost-tournee-trame-eleve.docx')
# ------------------------------------------------------------------ corrigé pour l'espace enseignant
# Le corrigé des QCM est écrit à côté de la trame, jamais dedans : l'espace enseignant du site
# l'affiche (onglet « Corrigés », champ `corrige` du `meta` de l'activité).
NOTIONS = [["Pourquoi une marque comme Marou", "Module 3 — externalisation", "Une marque externalise la logistique pour se concentrer sur son métier (créer et vendre) ; c'est le cœur de métier de Boost."]]
CODE_SEANCE, TITRE_SEANCE, FICHIER_TRAME = 'ENT-3.1', 'Boost — la tournée du vélo-cargo', 'ENT-3.1-boost-tournee-trame-eleve'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from corriges_data import ecrire_corrige
ecrire_corrige(CODE_SEANCE, TITRE_SEANCE, FICHIER_TRAME, ITEMS, CLES, NOTIONS,
               os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'contenus', 'corriges'), os.path.basename(__file__))
d.save(SORTIE)
print('logo :', 'repris' if os.path.exists(LOGO) else 'absent — emplacement réservé')
