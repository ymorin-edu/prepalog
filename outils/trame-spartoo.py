# -*- coding: utf-8 -*-
"""Trame élève Spartoo — générateur.

Règles de mise en page, arrêtées le 30/09/2026 (fiche `logisim`) :
  1. le logo de l'entreprise en en-tête ;
  2. de la place pour écrire — l'élève répond au stylo ou au clavier ;
  3. un saut de page entre les étapes, sauf quand deux étapes tiennent sur la même page.
"""
import os, sys
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_BREAK
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# Trame en noir et gris, décidé le 01/10/2026 : la trame s'imprime souvent en noir et
# blanc, où une couleur d'accent ressort en gris sale. Seul le logo Prepalog apporte le vert
# de la charte (il est repris de `styles/logo.png`, passé au vert le même jour).
# Les noms TITRE et GRIS ont été abandonnés : garder « ardoise » pour du noir aurait
# trompé la prochaine lecture. Dans `styles/base.css`, à l'inverse, `--ardoise` a été
# conservé — la variable y est sémantique et touche 41 endroits.
ENCRE = RGBColor(0x1a, 0x1a, 0x1a)   # texte courant
TITRE = RGBColor(0x11, 0x11, 0x11)   # titres, en-têtes de tableau, numéros de consigne
GRIS  = RGBColor(0x59, 0x59, 0x59)   # le code « ÉTAPE n »

# Logo de l'entreprise, versionné avec la trame. Déposer le fichier de la prochaine
# entreprise à côté et changer cette ligne : le reste suit.
RACINE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
LOGO = os.path.join(RACINE, 'contenus', 'trames', 'logos', 'spartoo.jpg')
LOGO_SIMULOG = os.path.join(RACINE, 'contenus', 'trames', 'logos', 'simulog.png')

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
    """Empêche une coupure de page juste après la dernière ligne écrite.

    Une consigne ou une phrase d'introduction ne doit jamais finir une page alors que
    le tableau qu'elle annonce commence la suivante : l'élève lit « Rédige ton brouillon
    ici » et n'a rien sous les yeux. On marque donc le dernier paragraphe — et l'espaceur
    vide qui le précède éventuellement — pour qu'ils descendent avec le tableau.
    """
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
    """`saut=False` quand l'étape est assez courte pour tenir avec la précédente."""
    par = d.add_paragraph()
    if saut:
        # page_break_before et non un saut dans le paragraphe : si la page précédente est pleine,
        # le saut tombait sur la page suivante et laissait une page blanche (02/10/2026).
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
    """Coupe une étape trop longue en deux pages équilibrées, plutôt que de laisser
    déborder deux lignes sur une page vide."""
    par = d.add_paragraph(); par.paragraph_format.space_after = Pt(0)
    par.add_run().add_break(WD_BREAK.PAGE)

def soustitre(t):
    par = d.add_paragraph(); par.paragraph_format.space_before = Pt(12); par.paragraph_format.space_after = Pt(4)
    r = par.add_run(t); r.bold = True; r.font.size = Pt(11.5); r.font.color.rgb = TITRE
    par.paragraph_format.keep_with_next = True

def consignes(items):
    # Numérotation à la main : le style Word « List Number » poursuit son compteur d'un bloc
    # à l'autre, et les consignes de l'étape suivante repartaient à 5.
    for i, it in enumerate(items, 1):
        par = d.add_paragraph()
        par.paragraph_format.space_after = Pt(4)
        par.paragraph_format.left_indent = Cm(0.8)
        par.paragraph_format.first_line_indent = Cm(-0.8)
        r = par.add_run(f'{i}.  '); r.bold = True; r.font.size = Pt(11); r.font.color.rgb = TITRE
        par.add_run(it).font.size = Pt(11)
        if i < len(items):
            par.paragraph_format.keep_with_next = True

def encadre(titre, texte):
    colle_au_suivant()
    t = d.add_table(rows=1, cols=1); t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.LEFT
    c = t.rows[0].cells[0]; ombre(c, 'F2F2F2')
    t.rows[0]._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
    par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(0)
    if _consomme(): par.paragraph_format.page_break_before = True
    r = par.add_run(titre + ' '); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
    r2 = par.add_run(texte); r2.font.size = Pt(10)
    d.add_paragraph().paragraph_format.space_after = Pt(2)


def encadre_liste(titre, items):
    """Encadré gris en liste à puces (règle du 03/10/2026 : une idée par ligne). Ajouté le 04/10/2026."""
    colle_au_suivant()
    t = d.add_table(rows=1, cols=1); t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.LEFT
    row = t.rows[0]; row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
    c = row.cells[0]; ombre(c, 'F2F2F2')
    par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(2); par.paragraph_format.keep_with_next = True
    if _consomme(): par.paragraph_format.page_break_before = True
    r = par.add_run(titre); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
    for i, it in enumerate(items):
        o = c.add_paragraph(); o.paragraph_format.space_before = Pt(0)
        o.paragraph_format.space_after = Pt(2 if i < len(items) - 1 else 0)
        o.paragraph_format.left_indent = Cm(0.7); o.paragraph_format.first_line_indent = Cm(-0.4)
        if i < len(items) - 1: o.paragraph_format.keep_with_next = True
        o.add_run('\u2022  ' + it).font.size = Pt(10)
    d.add_paragraph().paragraph_format.space_after = Pt(2)

def questions(liste, lignes=2):
    """Une question, UNE zone de réponse, puis la suivante (Tristan, 02/10/2026) : pas de double
    question. Un élément est un texte, ou (texte, nombre de lignes) pour adapter la zone :
    1 ligne pour un fait, 2 pour une explication courte, 4 pour une analyse réflexive."""
    colle_au_suivant()
    t = d.add_table(rows=0, cols=1); t.style = 'Table Grid'
    saut = _consomme()
    for q in liste:
        q, n = q if isinstance(q, tuple) else (q, lignes)
        _note('reflexion' if lignes == 4 and not isinstance(q, tuple) and _REFL[0] else ('brouillon' if n >= 6 else 'question'), q, lignes=n)
        row = t.add_row(); c = row.cells[0]; ombre(c, 'FAFAFA')
        trPr = row._tr.get_or_add_trPr(); trPr.append(OxmlElement('w:cantSplit'))
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
    """Analyse réflexive (règle n° 8 des trames) : pas de bonne réponse unique, quatre lignes."""
    par = d.add_paragraph(); par.paragraph_format.space_before = Pt(8); par.paragraph_format.space_after = Pt(4)
    if _consomme(): par.paragraph_format.page_break_before = True
    r = par.add_run('Pour réfléchir'); r.bold = True; r.font.size = Pt(11.5); r.font.color.rgb = TITRE
    r = par.add_run("   Il n'y a pas une seule bonne réponse : explique la tienne, avec tes mots.")
    r.font.size = Pt(9.5); r.font.color.rgb = GRIS
    par.paragraph_format.keep_with_next = True
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

# ==================================================================== en-tête
# En-tête : une ligne de rappel avec le logo poussé à droite par une tabulation, puis le
# titre sur toute la largeur. Un tableau à deux colonnes marchait mal — LibreOffice
# n'honorait pas les largeurs et le titre se coupait en deux.
from docx.enum.text import WD_TAB_ALIGNMENT
par = d.add_paragraph(); par.paragraph_format.space_after = Pt(2)
par.paragraph_format.tab_stops.add_tab_stop(Cm(17.0), WD_TAB_ALIGNMENT.RIGHT)
if os.path.exists(LOGO_SIMULOG):
    par.add_run().add_picture(LOGO_SIMULOG, height=Cm(1.3))
else:
    r = par.add_run('Simulog'); r.bold = True; r.font.size = Pt(20); r.font.color.rgb = TITRE
par.add_run('\t')
if os.path.exists(LOGO):
    par.add_run().add_picture(LOGO, height=Cm(1.5))
else:
    # Pas de logo fourni : on met le nom en attendant, plutôt que d'inventer une marque.
    r = par.add_run('SPARTOO'); r.bold = True; r.font.size = Pt(15); r.font.color.rgb = TITRE

par = d.add_paragraph(); par.paragraph_format.space_after = Pt(0)
r = par.add_run("ENT-1.2 — Carnet de suivi : préparer une commande")
r.bold = True; r.font.size = Pt(18); r.font.color.rgb = TITRE

d.add_paragraph().paragraph_format.space_after = Pt(6)

t = d.add_table(rows=3, cols=4); t.style = 'Table Grid'
for lib, li, co in [('Nom',0,0), ('Prénom',0,2), ('Classe',1,0), ('Date',1,2), ('Matricule Prepalog',2,0)]:
    c = t.rows[li].cells[co]; ombre(c, 'E8E8E8')
    par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(0)
    r = par.add_run(lib); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
# Matricule : une seule case de réponse sur la largeur restante (02/10/2026). Avant, la ligne
# gardait deux cases vides à droite. Lignes à 1,1 cm : de la place pour écrire à la main.
t.rows[2].cells[1].merge(t.rows[2].cells[3])
for row in t.rows: row.height = Cm(1.0)
d.add_paragraph().paragraph_format.space_after = Pt(4)

# Page 1 uniformisée avec les autres entreprises (reprise du 04/10/2026).
encadre('Ce document est ta trame de travail :',
        "tu peux le suivre seul, étape par étape. Chaque étape dit où cliquer et ce que tu dois voir à l'écran.")
encadre('Ce que ton enseignant voit dans son suivi :',
        "trois points : ta réponse à Léa Dubois (le stock écrit en chiffres), la commande CMD-048213 préparée et "
        "validée, et ta commande de réapprovisionnement à Puma. Tes réponses écrites ici servent à réfléchir.")
encadre('Ce qui est vrai, ce qui est inventé :',
        "Spartoo et les marques de chaussures sont réels. Les produits, les stocks, les clients, les coordonnées "
        "des fournisseurs et les messages sont inventés pour l'exercice.")

# ==================================================================== étape 0
soustitre("Le déroulé de ta séance")
p("Chaque étape commence sur une nouvelle page. Passe à la suivante quand tu as répondu à toutes les questions "
  "de celle-ci.", taille=10, apres=4)
tableau(['N°', 'Étape', 'Où travailles-tu ?'], 0, [Cm(1.4), Cm(11.0), Cm(4.6)], hauteur=Cm(0.9),
        remplis=[['1', 'Ouvrir ton environnement de travail', 'Dans Prepalog'],
        ['2', 'Repérer les fournisseurs et les clients', 'Dans Prepalog'],
        ['3', 'Comprendre la console et la commande .help', 'Dans Prepalog'],
        ['4', 'Répondre à une question client sur le stock', 'Dans Prepalog'],
        ['5', 'Traiter la commande CMD-048213', 'Dans Prepalog'],
        ['6', 'Réapprovisionner un fournisseur', 'Dans Prepalog']])

# ==================================================================== étape 1
etape(1, "Ouvrir ton environnement de travail")
p("Tu connais déjà Spartoo grâce à la séance de réception. Aujourd'hui, tu ouvres l'environnement de travail de l'entreprise pour préparer des commandes.")
consignes([
 "Ouvre un navigateur internet (Chrome, Edge…).",
 "Va sur Prepalog et saisis ton matricule et ton code (ceux que ton enseignant t'a donnés, "
 "le même matricule que celui noté en première page).",
 "Clique sur « Entrer ».",
 "Sur la page d'accueil, clique sur la pastille « Simulog ».",
 "Ouvre l'activité « Spartoo — préparation ». Vérifie que le bandeau en haut affiche « ENT-1.2 ».",
])
encadre('Garde bien ton matricule :', "c'est lui qui permet à ton enseignant de retrouver ton travail. "
        "Ta base est personnelle : ce que tu fais n'apparaît pas chez tes camarades, et inversement.")
p("Observe l'écran d'accueil avant d'aller plus loin :", taille=10.5, gras=True, avant=8)
encadre_liste('Ce que tu dois voir :', [
 "à gauche, le menu de l'entreprise : Messagerie, Commandes, Stock, Fournisseurs, Clients, Console… ;",
 "sur l'accueil, quatre chiffres : messages non lus, commandes à préparer, paires en stock, références en rupture.",
])
faits(["Combien de messages non lus t'attendent en arrivant ?", 'Combien de paires y a-t-il en stock au total ?', 'Combien de références sont en rupture ?'])
reflechir([
 'Parmi ces trois chiffres, lequel un responsable de stock doit-il regarder en premier le matin ?',
])

# ==================================================================== étape 2
etape(2, "Repérer les fournisseurs et les clients")
p("Dans le menu de gauche, ouvre l'écran Fournisseurs : ce sont les marques de chaussures qui livrent Spartoo.")
faits(['Combien de fournisseurs sont référencés ?'])
tableau(['Code (par exemple F001)', 'Trois marques fournisseurs'], 3, [Cm(4.0), Cm(13.0)], hauteur=Cm(0.8))
faits(['Choisis un de ces fournisseurs : quel est son délai de livraison ?', 'Quel est son minimum de commande ?'])
p("Ouvre maintenant l'écran Clients.", avant=6, apres=4)
faits(['Les clients de Spartoo sont-ils des entreprises ou des particuliers ?'])
tableau(['Code', 'Deux clients : nom', 'Ville'], 2, [Cm(3.0), Cm(8.0), Cm(6.0)], hauteur=Cm(0.8))
qcm([
 ("Entre un fournisseur et Spartoo, qu'est-ce qui circule ?",
  ["de l'argent seulement", "des marchandises seulement", "des marchandises dans un sens, de l'argent dans l'autre"], 2),
])
reflechir([
 "Qu'as-tu observé dans l'écran Clients qui te permet de dire s'il s'agit d'entreprises ou de particuliers ?",
])

# ==================================================================== étape 3
etape(3, "Comprendre la console et la commande .help")
p("La console permet d'interroger et de modifier la base avec des commandes qui commencent toujours par un "
  "point. Tu peux écrire les références en majuscules ou en minuscules : la console comprend les deux.")
consignes([
 "Va dans Console.",
 "Tape .help et appuie sur Entrée : la liste complète des commandes disponibles s'affiche.",
 "Observe bien la colonne de gauche (le nom exact de chaque commande) et la colonne de droite "
 "(ce qu'elle fait).",
])
encadre('Rassure-toi :', "si tu tapes une commande qui n'existe pas, ou si tu oublies le point, la console "
        "t'explique l'erreur et te propose de taper .help. N'hésite pas à essayer, tu ne peux rien casser !")
faits(['Par quel caractère commence toujours une commande ?'])
p("Cite 3 commandes de la liste (par exemple .getstock) et explique en une phrase ce que fait chacune :",
  taille=10.5, gras=True, avant=6)
tableau(['Commande', "Ce qu'elle fait"], 3, [Cm(4.6), Cm(12.4)], hauteur=Cm(1.2))
p("Teste maintenant deux commandes sur la référence PM-SUE (le modèle Puma Suede Classic XXI) :",
  taille=10.5, gras=True, avant=6)
faits(['Avec .getprice PM-SUE, quel est le prix de vente TTC ?', "Avec .getprice PM-SUE, quel est le prix d'achat HT ?", 'Avec .getsupplier Puma, quel est le délai de livraison de ce fournisseur ?'])
reflechir([
 "Parmi les commandes que tu viens d'essayer, laquelle serait la plus utile à un responsable de stock au quotidien ?",
])

# ==================================================================== étape 4
etape(4, "Répondre à une question client sur le stock")
p("Léa Dubois, une cliente, a envoyé un message dans la messagerie de Spartoo. Ouvre-le dans la rubrique "
  "Messagerie, puis mène l'enquête toi-même pour pouvoir lui répondre.")
faits(["Quel est l'objet du message de Léa Dubois ?"])
questions([
 ('Que demande-t-elle exactement ?', 2),
])
p("Note ce que tu as trouvé sur l'article demandé :", taille=10.5, gras=True, avant=6)
tableau(['Marque', 'Modèle', 'Couleur', 'Pointure'], 1, [Cm(4.2), Cm(5.4), Cm(4.2), Cm(3.2)], hauteur=Cm(1.2))
faits(['Quelle est la référence article complète correspondante ?', 'Quelle commande de la console permet de connaître son stock ?', 'Combien de paires sont disponibles ?'])

soustitre('Tu dois maintenant répondre au message')
p("Avant de rédiger ta réponse, prends connaissance de ce qu'attend un message professionnel :", taille=10.5)
t = d.add_table(rows=1, cols=2); t.style = 'Table Grid'
for i, h in enumerate(['Attente', 'Exemple concret']):
    c = t.rows[0].cells[i]; ombre(c, 'E8E8E8')
    r = c.paragraphs[0].add_run(h); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
for a, b in [
  ('Politesse', "Une formule au début (« Bonjour Madame ») et à la fin (« Cordialement »)."),
  ('Structure claire', "On comprend en une lecture ce que le client doit retenir."),
  ('Information écrite noir sur blanc', "L'information demandée est donnée clairement, en chiffres."),
  ('Signature', "Ton prénom, et éventuellement le nom du service."),
  ('Orthographe soignée', "Des phrases complètes, pas d'abréviations de SMS."),
]:
    row = t.add_row()
    r = row.cells[0].paragraphs[0].add_run(a); r.bold = True; r.font.size = Pt(10)
    r2 = row.cells[1].paragraphs[0].add_run(b); r2.font.size = Pt(10)
    row.cells[0].width = Cm(5.2); row.cells[1].width = Cm(11.8)
d.add_paragraph().paragraph_format.space_after = Pt(2)
saut_avant()
encadre('Attention :', "écris bien le nombre en chiffres dans ta réponse à Léa Dubois (par exemple « il nous "
        "reste 3 paires »). C'est ce nombre que ton enseignant retrouvera dans son suivi pour vérifier ton travail.")
p("Rédige d'abord ton brouillon ici, puis recopie-le dans la messagerie :", taille=10.5, gras=True, avant=6)
questions([
 ('Brouillon de ta réponse à Léa Dubois :', 7),
])
qcm([
 ("Léa Dubois est une cliente. S'il n'y a plus de stock, que doit faire le vendeur ?",
  ["lui dire que le produit n'est pas disponible", "lui envoyer un autre produit sans la prévenir", "ne pas lui répondre"], 0),
])
reflechir([
 "Si le stock avait été de zéro paire, qu'aurais-tu répondu à Léa Dubois ?",
])
encadre_liste('Tu peux passer à l\'étape 5 quand :', [
 "ta réponse à Léa Dubois est envoyée, avec le nombre de paires écrit en chiffres.",
])

# ==================================================================== étape 5
etape(5, "Traiter la commande CMD-048213")
p("Une nouvelle commande web vient d'arriver. Tu vas la traiter de bout en bout, comme dans un vrai entrepôt : "
  "l'enregistrer, contrôler le stock, préparer les articles, puis valider la sortie de stock.")
consignes([
 "Va dans Messagerie et ouvre le message « Nouvelle commande web n° CMD-048213 ».",
 "Clique sur « Enregistrer la commande », puis ouvre-la dans la rubrique Commandes.",
 "Pour chaque ligne, trouve dans la console le stock réel et l'emplacement de la référence (aide-toi de .help).",
 "Remplis le stock trouvé, l'emplacement, la quantité à préparer et le statut. Aucun bouton ne vérifie une "
 "ligne : relis-toi.",
 "Clique sur « Éditer le bon de préparation », puis sur « Valider la préparation (sortie de stock) ».",
])
p("Recopie ici ce que tu as trouvé pour chaque ligne, avant de valider :", taille=10.5, gras=True, avant=6)
tableau(['Référence', 'Stock trouvé', 'Emplacement', 'À préparer', 'Statut'], 3,
        [Cm(4.6), Cm(2.6), Cm(3.2), Cm(2.6), Cm(4.0)], hauteur=Cm(1.2))
faits(['Combien de références (lignes) différentes compte cette commande ?', 'Pour quelle ligne la quantité à préparer est-elle inférieure à la quantité commandée ?'])
questions([
 ('Que veut dire le statut « Rupture » pour une ligne ?', 2),
])
saut_avant()
questions([
 ('Que dois-tu faire lorsque tu es en rupture sur une ligne ?', 2),
 ("Qu'appelle-t-on un « reliquat » sur un bon de préparation ?", 2),
 ('Que se passe-t-il exactement dans le stock quand tu valides la préparation ?', 2),
])
qcm([
 ("Une ligne de la commande part en reliquat. Que doit faire le vendeur ?",
  ["le prévenir que la ligne arrive plus tard", "ne rien dire", "annuler toute la commande"], 0),
])
encadre_liste('Ce que tu dois voir :', [
 "le bon de préparation range les articles par emplacement ;",
 "après la validation, la commande n'est plus comptée dans « commandes à préparer », sur l'accueil.",
])
reflechir([
 'Que dirais-tu à un client dont une ligne de commande part en reliquat ?',
])
encadre('Une fois validé :', "ton enseignant voit automatiquement, dans son suivi de classe, que la commande a "
        "bien été traitée (et si elle est complète ou avec un reliquat).")

# ==================================================================== étape 6
etape(6, "Réapprovisionner un fournisseur")
p("La référence PM-SUE-NR-40 est en rupture depuis la commande précédente. Tu vas commander de nouvelles "
  "paires au fournisseur, en respectant deux règles : ne pas dépasser le stock maximum de chaque référence, "
  "et atteindre le minimum de commande imposé par le fournisseur.")
consignes([
 "Trouve, pour la référence PM-SUE-NR-40, le stock actuel, le seuil et le stock maximum "
 "(fiche produit ou console).",
 "Calcule la quantité à commander pour amener cette référence à son stock maximum.",
 "Va dans l'écran Fournisseurs, repère le fournisseur de cette référence et note son "
 "minimum de commande.",
 "Si la quantité du point 2 est inférieure à ce minimum, cherche une autre référence du même fournisseur "
 "dont le stock est sous son seuil.",
 "Calcule, de la même façon, la quantité qui l'amène à son stock maximum.",
 "Dans Messagerie, clique sur « Nouveau message », choisis ce fournisseur comme destinataire, et écris "
 "un message précisant chaque référence et la quantité correspondante.",
 "Envoie le message : l'outil te répond automatiquement pour te dire si le minimum de commande est atteint.",
])
p("Note ici ton calcul :", taille=10.5, gras=True, avant=6)
tableau(['Référence', 'Stock actuel', 'Seuil', 'Stock maximum', 'Quantité à commander'], 3,
        [Cm(4.6), Cm(2.8), Cm(2.0), Cm(3.2), Cm(4.4)], hauteur=Cm(1.2))
saut_avant()   # coupure choisie : le calcul / les questions (reprise du 04/10/2026)
questions([
 ("Qu'est-ce que le « seuil » d'une référence ?", 2),
 ('Quelle est la différence entre le seuil et le stock maximum ?', 2),
])
questions([
 ('Dans la liste des destinataires, comment as-tu reconnu le bon fournisseur ?', 2),
])
faits(['As-tu dû ajouter une deuxième référence pour atteindre le minimum de commande ?'])
qcm([
 ("Le minimum de commande est une clause du contrat avec le fournisseur. Une clause, c'est quoi ?",
  ["une règle écrite dans le contrat", "un type de camion", "une réduction de prix"], 0),
])
reflechir([
 'Si tu as ajouté une référence, quel critère as-tu utilisé pour la choisir ?',
])
encadre("Si le minimum n'est pas atteint :", "le fournisseur te le dit dans sa réponse. Retourne dans "
        "Messagerie, clique sur « Nouveau message » et renvoie une commande complétée : ton enseignant verra "
        "dans son suivi si l'une de tes tentatives est correcte.")

# Feuille à détacher (cours + activité à la maison), décision de Tristan du 04/10/2026. Ce générateur n'utilise
# pas trame_commun : on lui prête le document en cours, puis on reprend les questions de la feuille pour le corrigé.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trame_commun as TC
TC.d = d; TC.ETAPE_NUM = ETAPE_NUM; TC.ITEMS.clear()
TC.feuille_detachable('ENT-1.2')
ITEMS.extend(TC.ITEMS)

SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      '..', 'contenus', 'trames', 'ENT-1.2-spartoo-preparation-trame-eleve.docx')
# ------------------------------------------------------------------ corrigé pour l'espace enseignant
# Le corrigé des QCM est écrit à côté de la trame, jamais dedans : l'espace enseignant du site
# l'affiche (onglet « Corrigés », champ `corrige` du `meta` de l'activité).
NOTIONS = [["Entre un fournisseur", "Module 1 — échanges entre agents économiques, circuit économique", "Les marchandises vont du fournisseur vers l'entreprise, l'argent (paiement) circule en sens inverse."], ["Léa Dubois", "Module 2 — consommateur, obligation d'information", "Le vendeur doit informer honnêtement le consommateur, notamment de l'indisponibilité d'un produit."], ["Une ligne de la commande", "Module 2 — obligation d'information du vendeur", "En cas de livraison partielle (reliquat), le vendeur prévient le client et lui indique quand le reste arrivera."], ["Le minimum de commande", "Module 1 — contrat (parties, objet, clauses)", "Une clause est une règle écrite dans le contrat ; le minimum de commande en est une."]]
CODE_SEANCE, TITRE_SEANCE, FICHIER_TRAME = 'ENT-1.2', 'Spartoo — préparer une commande', 'ENT-1.2-spartoo-preparation-trame-eleve'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from corriges_data import ecrire_corrige
ecrire_corrige(CODE_SEANCE, TITRE_SEANCE, FICHIER_TRAME, ITEMS, CLES, NOTIONS,
               os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'contenus', 'corriges'), os.path.basename(__file__))
d.save(SORTIE)
print('logo :', 'repris' if os.path.exists(LOGO) else 'absent — emplacement réservé')
