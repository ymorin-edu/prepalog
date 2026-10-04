# -*- coding: utf-8 -*-
"""Les fonctions communes des trames élève écrites après le 03/10/2026 (Picard ENT-4.1, 4.2, 4.3).

Reprises telles quelles du générateur d'ENT-3.1 (`trame-boost-tournee.py`, le modèle validé par
Tristan), pour ne pas les recopier dans chaque générateur. Les règles de mise en page et de
rédaction sont dans la fiche `prepalog-trames-eleve` du projet : une étape par page, page 1 =
en-tête + sommaire, une question = une zone, au moins une analyse réflexive par étape de travail,
noir et gris (seuls les logos portent la couleur).

Usage, dans un générateur :
    import trame_commun as T
    T.nouveau()
    T.entete(logo, 'ENT-4.1 — Carnet de suivi : …', [encadrés], sommaire)
    T.etape(1, '…') ; T.p(…) ; T.questions(…) ; T.reflechir(…) …
    T.finir(code, titre, nom_fichier, notions, script)
"""
import os, sys
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_BREAK, WD_TAB_ALIGNMENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

ENCRE = RGBColor(0x1a, 0x1a, 0x1a)
TITRE = RGBColor(0x11, 0x11, 0x11)
GRIS  = RGBColor(0x59, 0x59, 0x59)

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.join(ICI, '..')
LOGO_PREPALOG = os.path.join(RACINE, 'styles', 'logo.png')

d = None


def nouveau():
    """Un document neuf, aux réglages des trames (Calibri 11, marges d'ENT-3.1)."""
    global d
    d = Document()
    st = d.styles['Normal']
    st.font.name = 'Calibri'; st.font.size = Pt(11); st.font.color.rgb = ENCRE
    st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Calibri')
    st.paragraph_format.space_after = Pt(6); st.paragraph_format.line_spacing = 1.08
    for s in d.sections:
        s.top_margin = Cm(1.2); s.bottom_margin = Cm(1.3)
        s.left_margin = s.right_margin = Cm(1.9)
    ITEMS.clear(); CLES.clear()
    return d


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


def encadre_liste(titre, items, intro='', espace=True):
    """Encadré gris dont le contenu est une liste à puces (une idée par ligne : plus lisible pour
    un élève qui lit difficilement, Tristan 03/10/2026). `intro` : phrase facultative avant la liste."""
    colle_au_suivant()
    t = d.add_table(rows=1, cols=1); t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.LEFT
    row = t.rows[0]; row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
    c = row.cells[0]; ombre(c, 'F2F2F2')
    par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(2)
    par.paragraph_format.keep_with_next = True
    if _consomme(): par.paragraph_format.page_break_before = True
    r = par.add_run(titre + (' ' if intro else '')); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
    if intro:
        par.add_run(intro).font.size = Pt(10)
    for i, it in enumerate(items):
        o = c.add_paragraph(); o.paragraph_format.space_before = Pt(0)
        o.paragraph_format.space_after = Pt(2 if i < len(items) - 1 else 0)
        o.paragraph_format.left_indent = Cm(0.7); o.paragraph_format.first_line_indent = Cm(-0.4)
        if i < len(items) - 1: o.paragraph_format.keep_with_next = True
        o.add_run('\u2022  ' + it).font.size = Pt(10)
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




def entete(logo, titre, encadres, sommaire, nom_logo='LOGO'):
    """Page 1 : logos, titre du carnet, bloc nom/prénom/classe/date/matricule, encadrés, sommaire."""
    global ETAPE_NUM
    ETAPE_NUM = 0
    par = d.add_paragraph(); par.paragraph_format.space_after = Pt(2)
    par.paragraph_format.tab_stops.add_tab_stop(Cm(17.0), WD_TAB_ALIGNMENT.RIGHT)
    if os.path.exists(LOGO_PREPALOG):
        par.add_run().add_picture(LOGO_PREPALOG, height=Cm(1.15))
    r = par.add_run('  Logisim'); r.bold = True; r.font.size = Pt(20); r.font.color.rgb = TITRE
    par.add_run('\t')
    if os.path.exists(logo):
        par.add_run().add_picture(logo, height=Cm(1.5))
    else:
        r = par.add_run(nom_logo); r.bold = True; r.font.size = Pt(15); r.font.color.rgb = TITRE
    par = d.add_paragraph(); par.paragraph_format.space_after = Pt(0)
    r = par.add_run(titre); r.bold = True; r.font.size = Pt(18); r.font.color.rgb = TITRE
    d.add_paragraph().paragraph_format.space_after = Pt(6)
    t = d.add_table(rows=3, cols=4); t.style = 'Table Grid'
    for lib, li, co in [('Nom', 0, 0), ('Prénom', 0, 2), ('Classe', 1, 0), ('Date', 1, 2), ('Matricule Prepalog', 2, 0)]:
        c = t.rows[li].cells[co]; ombre(c, 'E8E8E8')
        q = c.paragraphs[0]; q.paragraph_format.space_after = Pt(0)
        r = q.add_run(lib); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
    t.rows[2].cells[1].merge(t.rows[2].cells[3])
    for row in t.rows: row.height = Cm(1.1)
    d.add_paragraph().paragraph_format.space_after = Pt(4)
    for e in encadres:
        if isinstance(e[1], list):
            encadre_liste(e[0], e[1])
        else:
            encadre(e[0], e[1])
    soustitre("Le déroulé de ta séance")
    p("Chaque étape commence sur une nouvelle page. Passe à la suivante quand tu as répondu à toutes les "
      "questions de celle-ci.", taille=10, apres=4)
    tableau(['N°', 'Étape', 'Où travailles-tu ?'], 0, [Cm(1.4), Cm(11.0), Cm(4.6)], hauteur=Cm(0.9),
            remplis=[[str(i), e, o] for i, (e, o) in enumerate(sommaire, 1)])


def finir(code, titre, nom_fichier, notions, script, fichier=None):
    """Écrit le .docx dans contenus/trames/ et le corrigé de la trame dans
    contenus/corriges/<code>-trame.js (le corrigé <code>.js de la séance, calculé par Claude Code
    depuis les données du quai, n'est pas touché). `fichier` : un autre nom (Cdiscount : <code>, quand la séance
    n'a pas de corrigé calculé)."""
    sys.path.insert(0, ICI)
    from corriges_data import ecrire_corrige
    ecrire_corrige(code, titre, nom_fichier, ITEMS, CLES, notions,
                   os.path.join(RACINE, 'contenus', 'corriges'), script, fichier=fichier or (code + '-trame'))
    sortie = os.path.join(RACINE, 'contenus', 'trames', nom_fichier + '.docx')
    # Espaces insécables dans les guillemets (« Mouvements ») : un guillemet ne reste jamais seul en début de
    # ligne (04/10/2026, trames Cdiscount).
    for t in d.element.body.iter(qn('w:t')):
        if t.text and ('« ' in t.text or ' »' in t.text):
            t.text = t.text.replace('« ', '«\u00a0').replace(' »', '\u00a0»')
    d.save(sortie)
    print('trame :', sortie)


def encadre_texte(titre, paragraphes, source=''):
    """Encadré gris qui cite un texte mot pour mot (un article de loi) : un titre, puis les
    paragraphes du texte, en retrait, sans puces ; `source` en petit à la fin. Ne se coupe pas."""
    colle_au_suivant()
    t = d.add_table(rows=1, cols=1); t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.LEFT
    row = t.rows[0]; row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
    c = row.cells[0]; ombre(c, 'F2F2F2')
    par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(4); par.paragraph_format.keep_with_next = True
    if _consomme(): par.paragraph_format.page_break_before = True
    r = par.add_run(titre); r.bold = True; r.font.size = Pt(10.5); r.font.color.rgb = TITRE
    for i, tx in enumerate(paragraphes):
        o = c.add_paragraph(); o.paragraph_format.left_indent = Cm(0.4)
        o.paragraph_format.space_after = Pt(4); o.paragraph_format.keep_with_next = True
        o.add_run(tx).font.size = Pt(10.5)
    if source:
        o = c.add_paragraph(); o.paragraph_format.space_after = Pt(0)
        r = o.add_run(source); r.font.size = Pt(8.5); r.font.color.rgb = GRIS
    d.add_paragraph().paragraph_format.space_after = Pt(2)
