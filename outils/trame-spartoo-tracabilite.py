# -*- coding: utf-8 -*-
"""Trame élève Spartoo — séance « traçabilité ».

Mêmes règles de mise en page que les deux autres trames (fiche `prepalog-trames-eleve`) :
en-tête sur la première page seule, de la place pour écrire, un saut de page entre les
étapes, jamais de coupure juste après une consigne, on commence hors de l'outil, et tout
jalon contrôlé automatiquement est annoncé à l'élève.
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


def faits(liste, hauteur=Cm(1.3)):
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
        row.cells[0].width = Cm(7.4); row.cells[1].width = Cm(9.6)
    t.autofit = False
    t.columns[0].width = Cm(7.4); t.columns[1].width = Cm(9.6)
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
    r = par.add_run('SPARTOO'); r.bold = True; r.font.size = Pt(15); r.font.color.rgb = TITRE

par = d.add_paragraph(); par.paragraph_format.space_after = Pt(0)
r = par.add_run("ENT-1.3 — Carnet de suivi : remonter la trace d'un lot")
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
for row in t.rows: row.height = Cm(0.9)
d.add_paragraph().paragraph_format.space_after = Pt(4)

# Page 1 uniformisée avec les autres entreprises (reprise du 04/10/2026).
encadre('Ce document est ta trame de travail :',
        "tu peux le suivre seul, étape par étape. Aujourd'hui, le fournisseur signale un défaut de fabrication sur "
        "un lot que tu as reçu : retrouve où sont parties ses paires, bloque celles qui restent, et rends compte "
        "par écrit.")
encadre('Ce que ton enseignant voit dans son suivi :',
        "trois points : ton compte rendu donne le lot, sa date d'entrée et son fournisseur ; il cite toutes les "
        "commandes parties avec des paires du lot ; le reste du lot est bloqué, référence par référence. Tes "
        "réponses écrites ici servent à réfléchir.")
encadre('Ce qui est vrai, ce qui est inventé :',
        "Spartoo, Puma et les rappels de produits (le site RappelConso existe vraiment) sont réels. Le défaut, le "
        "lot, les quantités, les clients et les messages sont inventés pour l'exercice.")

# ==================================================================== étape 1
soustitre("Le déroulé de ta séance")
p("Chaque étape commence sur une nouvelle page. Passe à la suivante quand tu as répondu à toutes les questions "
  "de celle-ci.", taille=10, apres=4)
tableau(['N°', 'Étape', 'Où travailles-tu ?'], 0, [Cm(1.4), Cm(11.0), Cm(4.6)], hauteur=Cm(0.9),
        remplis=[['1', 'Comprendre la traçabilité', 'Sur Internet'],
        ['2', "Lire l'alerte du fournisseur et la consigne", 'Dans Prepalog'],
        ['3', "Remonter l'amont : d'où vient ce lot ?", 'Dans Prepalog'],
        ['4', "Remonter l'aval : où sont parties les paires ?", 'Dans Prepalog'],
        ['5', 'Compter ce qui reste, référence par référence', 'Dans Prepalog'],
        ['6', 'Bloquer le stock restant', 'Dans Prepalog'],
        ['7', 'Rendre compte à M. Morin', 'Dans Prepalog']])

etape(1, "Comprendre la traçabilité")
p("Avant d'ouvrir le logiciel, il faut savoir de quoi on parle. Quand un industriel découvre un défaut, il ne "
  "rappelle pas toute sa production : il rappelle un lot. Fais une recherche sur Internet pour comprendre "
  "comment c'est possible.")
consignes([
 "Cherche « traçabilité logistique définition » puis « numéro de lot à quoi ça sert ».",
 "Cherche ensuite un exemple réel de rappel de produit (le site RappelConso en présente beaucoup).",
 "Réponds aux questions ci-dessous avec ce que tu trouves.",
])
questions([("Qu'est-ce qu'un numéro de lot ?", 2), ('Qui attribue le numéro de lot ?', 1)])
questions([
 ('Que veut dire « tracer » un produit en logistique ?', 2),
])
questions([
 ("Dans un rappel de produit que tu as trouvé, quelles informations l'entreprise donne-t-elle au client ?", 2),
])
reflechir([
 'Si une entreprise ne sait pas dans quel lot était un article, que doit-elle faire en cas de défaut ?',
])

# ==================================================================== étape 2
etape(2, "Lire l'alerte du fournisseur et la consigne")
p("Connecte-toi à Prepalog, ouvre la rubrique Simulog puis l'activité « Spartoo — traçabilité ». Va dans "
  "Messagerie : deux messages t'attendent. Lis-les tous les deux avant de toucher à quoi que ce soit.")
consignes([
 "Ouvre le message de Puma : « URGENT — rappel qualité sur le lot… ».",
 "Ouvre ensuite le message de M. Morin : c'est lui qui dit ce que tu dois faire, et dans quel ordre.",
])
p("Relève les informations de l'alerte :", taille=10.5, gras=True, avant=6)
tableau(['Information', 'Ce que tu relèves'], 0, [Cm(6.4), Cm(10.6)], hauteur=Cm(1.0),
        remplis=[['Numéro du lot en cause', ''], ['Nature du défaut', ''], ['Ce que Puma demande', ''],
                 ["Qui a envoyé l'alerte", '']])
faits(["Le défaut est-il visible à l'œil nu ?"])
questions([
 ('Quelle conséquence cela a-t-il pour le contrôle en entrepôt ?', 2),
])
reflechir([
 "Puma écrit que les paires de la même référence venues d'autres livraisons ne sont pas en cause. Pourquoi, avec tes mots ?",
])

# ==================================================================== étape 3
etape(3, "Remonter l'amont : d'où vient ce lot ?")
p("Va dans la Console. Une seule commande fait tout le travail : .getlot suivi du numéro de lot. Tape-la, puis "
  "lis le tableau du haut, celui qui s'appelle « Entrées ».")
consignes([
 "Tape .getlot suivi du numéro de lot relevé à l'étape 2 (avec ses tirets, sans espace).",
 "Lis le résumé en haut : fournisseur, date d'entrée, numéro de réception, quantités.",
 "Lis le tableau « Entrées » : il donne les références concernées, une ligne par référence.",
])
p("Remplis la fiche d'identité du lot :", taille=10.5, gras=True, avant=6)
encadre('Ce que tu dois voir :', "un résumé du lot (Entrées, Sorties, Reste en stock), puis deux tableaux, "
        "« Entrées » et « Sorties ».")
tableau(['Information', 'Ce que tu relèves'], 0, [Cm(6.4), Cm(10.6)], hauteur=Cm(0.85),
        remplis=[['Numéro de lot', ''], ['Fournisseur', ''], ["Date d'entrée en stock", ''],
                 ['Numéro de réception', ''], ['Nombre total de paires entrées', '']])
p("Recopie maintenant le détail des entrées :", taille=10.5, gras=True, avant=6)
tableau(['Référence article', 'Article', 'Quantité entrée'], 3, [Cm(5.4), Cm(7.6), Cm(4.0)], hauteur=Cm(1.15))
encadre('Attention à la date :', "tu devras la recopier dans ton compte rendu de l'étape 7, écrite au format "
        "jj/mm/aaaa, par exemple 14/03/2026. Note-la dès maintenant, telle qu'elle s'affiche.")
reflechir([
 'Pourquoi est-il important de savoir par quelle réception ce lot est entré en stock ?',
])

# ==================================================================== étape 4
etape(4, "Remonter l'aval : où sont parties les paires ?")
p("Dans le même résultat de .getlot, descends jusqu'au tableau « Sorties ». Chaque ligne est une paire de ce lot "
  "qui a quitté l'entrepôt : le logiciel te donne le bon de préparation, la commande, et le client livré. C'est "
  "exactement ce que Puma demande.")
consignes([
 "Relis le tableau « Sorties » ligne par ligne.",
 "Note, pour chaque ligne, la référence, la quantité, le numéro de commande et le nom du client.",
 "Vérifie le total : entrées moins sorties doit donner le « Reste en stock » affiché en haut.",
])
p("Relève les sorties du lot :", taille=10.5, gras=True, avant=6)
tableau(['Référence article', 'Qté', 'Bon de préparation', 'N° de commande', 'Client livré'], 5,
        [Cm(4.2), Cm(1.6), Cm(3.6), Cm(3.4), Cm(4.2)], hauteur=Cm(1.15))
faits(['Combien de clients différents ont reçu des paires de ce lot ?'])
qcm([
 ("Ces clients sont des consommateurs. Si un produit peut être dangereux, que doit faire le vendeur ?",
  ["attendre que les clients se plaignent", "les informer rapidement", "ne rien dire pour ne pas perdre de ventes"], 1),
])
reflechir([
 "Sans le numéro de lot, qu'aurait-on été obligé de faire pour savoir quels clients avaient reçu ces paires ?",
])

# ==================================================================== étape 5
etape(5, "Compter ce qui reste, référence par référence")
p("Les paires déjà livrées, Puma s'en occupe. Celles qui sont encore dans l'entrepôt, c'est ton problème : il "
  "faut les sortir du stock avant qu'un collègue ne les expédie. Mais attention — le logiciel ne te dira pas "
  "combien il en reste. C'est à toi de le calculer, référence par référence.")
consignes([
 "Reprends tes tableaux des étapes 3 et 4.",
 "Pour chaque référence : quantité entrée avec ce lot, moins quantité déjà sortie.",
 "Le total de ta colonne « reste à bloquer » doit être égal au « Reste en stock » affiché par .getlot.",
])
p("Fais ton calcul ici, avant de toucher au stock :", taille=10.5, gras=True, avant=6)
tableau(['Référence article', 'Entré avec ce lot', 'Déjà sorti', 'Reste à bloquer'], 4,
        [Cm(5.4), Cm(3.9), Cm(3.4), Cm(4.3)], hauteur=Cm(1.2))
faits(["Avec .getstock suivi d'une de ces références, quel est le stock total de cette référence ?", 'Combien reste-t-il de paires de ce lot pour cette même référence ?'])
questions([
 ('Pourquoi ces deux nombres sont-ils différents ?', 2),
])
encadre_liste('Tu peux passer à l\'étape 6 quand :', [
 "le total de ta colonne « Reste à bloquer » est égal au « Reste en stock » affiché par .getlot.",
])
reflechir([
 'Que se passerait-il si tu bloquais le stock total de la référence au lieu du reste du lot ?',
])

# ==================================================================== étape 6
etape(6, "Bloquer le stock restant")
p("Va dans le menu « Blocage qualité ». Cet écran sort du stock les paires d'un lot précis, et de ce lot "
  "seulement : les paires de la même référence arrivées par une autre livraison restent vendables. Tu vas le "
  "remplir une fois par référence.")
consignes([
 "Renseigne le numéro de lot, la référence complète, la quantité à bloquer et un motif.",
 "Comme motif, écris : blocage qualité, défaut fabricant.",
 "Clique sur le bouton, puis recommence avec la référence suivante.",
 "Chaque blocage enregistré apparaît dans le tableau du bas : vérifies-y ton travail.",
])
encadre('Si le logiciel refuse :', "c'est que la quantité demandée dépasse ce qu'il reste de ce lot, ou que le "
        "numéro de lot ou la référence sont mal recopiés. Reprends ton calcul de l'étape 5 et le tableau des "
        "entrées de l'étape 3 : le message ne te donnera pas la réponse.")
p("Quand tout est bloqué, retourne dans la Console et tape à nouveau .getlot suivi du numéro de lot.", apres=4)
encadre_liste('Tu peux passer à l\'étape 7 quand :', [
 "le « Reste en stock » du lot est à 0 ;",
 "chaque référence du lot a sa ligne dans le tableau du bas de « Blocage qualité ».",
])
faits(['Quel type de mouvement apparaît dans le tableau des sorties, à côté des ventes ?'])
reflechir([
 "À quoi sert le motif, plusieurs mois plus tard, quand quelqu'un relit l'historique des mouvements ?",
])

# ==================================================================== étape 7
etape(7, "Rendre compte à M. Morin")
p("Il reste le plus important : écrire. Un blocage que personne n'a annoncé ne sert à rien, et c'est ton compte "
  "rendu que Puma va lire pour contacter les clients. Tu réponds directement au message de M. Morin.")
consignes([
 "Retourne dans Messagerie et ouvre le message de M. Morin.",
 "Clique sur « Répondre ».",
 "Recopie ton brouillon, puis envoie.",
])
encadre('Attention, à lire avant de rédiger :', "ton compte rendu doit contenir le numéro de lot écrit en entier "
        "(tirets compris), la date d'entrée en stock au format jj/mm/aaaa, le nom du fournisseur, et le numéro de "
        "chaque commande concernée sous la forme CMD-000000. C'est ce que ton enseignant retrouvera dans son suivi.")
p("Rédige d'abord ton brouillon ici, puis recopie-le dans la messagerie :", taille=10.5, gras=True, avant=6)
questions([
 ('Brouillon de ton compte rendu à M. Morin :', 8),
])
encadre_liste('Tu as terminé la séance quand :', [
 "ton compte rendu est envoyé, en réponse au message de M. Morin ;",
 "un bandeau s'affiche en haut de l'écran : « Séance validée ✓ », ou bien le titre de ce qui reste à corriger "
 "(dans ce cas, appelle ton professeur) ;",
 "toutes les questions de ce carnet ont une réponse.",
])
reflechir([
 'Quelle première action Spartoo devra-t-elle mener si un client rapporte une paire du lot ?',
])

# Feuille à détacher (cours + activité à la maison), décision de Tristan du 04/10/2026. Ce générateur n'utilise
# pas trame_commun : on lui prête le document en cours, puis on reprend les questions de la feuille pour le corrigé.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trame_commun as TC
TC.d = d; TC.ETAPE_NUM = ETAPE_NUM; TC.ITEMS.clear()
TC.feuille_detachable('ENT-1.3')
ITEMS.extend(TC.ITEMS)

SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      '..', 'contenus', 'trames', 'ENT-1.3-spartoo-tracabilite-trame-eleve.docx')
# ------------------------------------------------------------------ corrigé pour l'espace enseignant
# Le corrigé des QCM est écrit à côté de la trame, jamais dedans : l'espace enseignant du site
# l'affiche (onglet « Corrigés », champ `corrige` du `meta` de l'activité).
NOTIONS = [["Ces clients sont des consommateurs", "Module 2 — consommateur, obligation d'information", "Pour un produit potentiellement dangereux, le vendeur doit informer rapidement les clients concernés (la traçabilité sert à les retrouver)."]]
CODE_SEANCE, TITRE_SEANCE, FICHIER_TRAME = 'ENT-1.3', "Spartoo — remonter la trace d'un lot", 'ENT-1.3-spartoo-tracabilite-trame-eleve'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from corriges_data import ecrire_corrige
ecrire_corrige(CODE_SEANCE, TITRE_SEANCE, FICHIER_TRAME, ITEMS, CLES, NOTIONS,
               os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'contenus', 'corriges'), os.path.basename(__file__))
d.save(SORTIE)
print('logo :', 'repris' if os.path.exists(LOGO) else 'absent — emplacement réservé')
