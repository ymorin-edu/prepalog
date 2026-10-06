# -*- coding: utf-8 -*-
"""Trame élève Spartoo — séance « réception » (ENT-1.1). Refaite le 06/10/2026 avec la refonte de la séance
(quai en 2D iso, questionnaire de la procédure, dix réceptions, saisie en paires) et les retours de classe E1-E3.

Mêmes règles de mise en page que la trame de préparation (fiche `prepalog-trames-eleve`) :
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
# Refonte du 06/10/2026 (brief docs/briefs/ENT-1.1-spartoo-quai.md) : le quai en 2D iso, le questionnaire de la
# procédure, dix réceptions dont un piège, la saisie en paires (cartons × 6), et les retours de classe de Tristan
# (E1 : extrait des conditions de retour et de la loi imprimé ; E2 : document « le BL et les réserves » ; E3 :
# passage Internet → Prepalog signalé ; console découverte ICI, la trame d'ENT-1.2 n'en fait plus qu'un rappel).
# Tout ce qui est décrit de l'écran vient de la section « Pour Cowork » du brief, lue à l'écran par Claude Code.
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
r = par.add_run("ENT-1.1 — Carnet de suivi : réceptionner une livraison")
r.bold = True; r.font.size = Pt(18); r.font.color.rgb = TITRE

d.add_paragraph().paragraph_format.space_after = Pt(6)

t = d.add_table(rows=3, cols=4); t.style = 'Table Grid'
for lib, li, co in [('Nom',0,0), ('Prénom',0,2), ('Classe',1,0), ('Date',1,2), ('Matricule Prepalog',2,0)]:
    c = t.rows[li].cells[co]; ombre(c, 'E8E8E8')
    par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(0)
    r = par.add_run(lib); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
t.rows[2].cells[1].merge(t.rows[2].cells[3])
for row in t.rows: row.height = Cm(1.0)
d.add_paragraph().paragraph_format.space_after = Pt(4)

encadre('Ce document est ta trame de travail :',
        "tu peux le suivre seul, étape par étape. Aujourd'hui, tu es au quai de réception de Spartoo : un camion "
        "arrive, et c'est toi qui contrôles la livraison, du quai jusqu'à l'entrée en stock. Le logiciel ne compte "
        "rien à ta place : ce que tu saisis entre vraiment dans le stock.")
encadre('Ce que ton enseignant voit dans son suivi :',
        "huit points : ton questionnaire sur la procédure, ton comptage de la palette, ta décision, tes réserves "
        "écrites sur le bon de livraison, la signature du chauffeur, ton bon de réception, l'entrée en stock avec le "
        "bon lot, et ton message de réserves à Puma. Tes réponses écrites ici servent à réfléchir.")
encadre('Ce qui est vrai, ce qui est inventé :',
        "Spartoo, son entrepôt Toolog de Saint-Quentin-Fallavier (Isère), la marque Puma et le transporteur Geodis "
        "sont réels. Le quai 7, l'horaire, le chauffeur, les numéros, les quantités, les défauts et M. Morin sont "
        "inventés pour l'exercice.")

soustitre("Le déroulé de ta séance")
p("Chaque étape commence sur une nouvelle page. Passe à la suivante quand tu as répondu à toutes les questions "
  "de celle-ci.", taille=10, apres=4)
tableau(['N°', 'Étape', 'Où travailles-tu ?'], 0, [Cm(1.4), Cm(11.0), Cm(4.6)], hauteur=Cm(0.85),
        remplis=[['1', "Découvrir l'entreprise Spartoo", 'Internet et ce carnet'],
        ['2', 'Comprendre le bon de livraison et les réserves', 'Dans ce carnet'],
        ['3', 'Lire la procédure et répondre au questionnaire', 'Dans Prepalog'],
        ['4', 'Recevoir le camion', 'Prepalog : Quai'],
        ['5', 'Compter la palette et faire signer le chauffeur', 'Prepalog : Quai'],
        ['6', 'Retrouver ta réception et la saisir en paires', 'Prepalog : Réceptions'],
        ['7', 'Découvrir la console et vérifier ta réception', 'Prepalog : Console'],
        ['8', 'Signaler les réserves à Puma', 'Prepalog : Messagerie']])

# ==================================================================== étape 1
etape(1, "Découvrir l'entreprise Spartoo")
p("Avant d'ouvrir le logiciel, il faut savoir pour qui tu travailles. Spartoo existe réellement : c'est un site "
  "français de vente de chaussures en ligne. Fais une courte recherche sur Internet pour la découvrir.")
consignes([
 "Ouvre un moteur de recherche et tape « Spartoo entreprise ».",
 "Regarde sa fiche Wikipédia ou un article de presse économique.",
 "Réponds aux quatre questions ci-dessous.",
])
faits(['En quelle année Spartoo a-t-elle été créée ?', 'Dans quelle ville se trouve son siège social ?', 'Que vend Spartoo ?',
       "Spartoo fabrique-t-elle elle-même les chaussures qu'elle vend ? (oui / non)"])
p("Pas besoin de chercher la suite : lis les deux textes ci-dessous.", taille=10.5, gras=True, avant=6)
encadre_liste("Ce que Spartoo annonce à ses clients (résumé de ses conditions de retour, octobre 2026)", [
 "Tu as 30 jours après avoir reçu ta commande pour nous renvoyer un article.",
 "Le retour est gratuit.",
 "L'article doit être neuf, non porté à l'extérieur, dans sa boîte d'origine.",
 "Tu es remboursé sur le moyen de paiement que tu as utilisé.",
])
encadre_liste("Ce que dit la loi (Code de la consommation, article L221-18, extrait simplifié)", [
 "« Le consommateur dispose d'un délai de quatorze jours pour exercer son droit de rétractation d'un contrat "
 "conclu à distance […] sans avoir à motiver sa décision. »",
 "Se rétracter = changer d'avis et annuler son achat. Cette règle s'impose à TOUS les vendeurs en ligne.",
])
p("Compare les deux textes :", taille=10.5, gras=True, avant=4)
tableau(['Question', 'Ce que la loi impose', "Ce que Spartoo choisit d'offrir"], 0, [Cm(5.0), Cm(6.0), Cm(6.0)],
        hauteur=Cm(1.5), remplis=[['Combien de jours pour renvoyer un article ?', '', ''],
                                  ['Est-ce obligatoire ou est-ce un choix ?', '', ''],
                                  ['Qui doit le respecter ?', '', '']])
qcm([
 ("Quand un client commande sur le site, quel contrat est conclu entre lui et Spartoo ?",
  ['un contrat de travail', 'un contrat de vente', 'un contrat de location'], 1),
 ("Quel organisme protège les données personnelles des clients ?",
  ['la CNIL', 'la Banque de France', 'La Poste'], 0),
 ("D'après la loi, combien de jours un client a-t-il pour changer d'avis après un achat sur Internet ?",
  ['2 jours', '14 jours', '30 jours'], 1),
 ("Les 30 jours de Spartoo, c'est…",
  ['une obligation de la loi', 'un service pour attirer et garder les clients', 'une erreur du site'], 1),
 ("Pourquoi la loi protège-t-elle davantage celui qui achète sur Internet ?",
  ["les produits y sont plus chers", "il ne peut pas toucher ni essayer le produit avant d'acheter", "les magasins n'ont pas le droit de vendre en ligne"], 1),
])
questions([
 ("Pourquoi Spartoo donne-t-il à ses clients plus de temps que la loi ne l'oblige ?", 3),
])
reflechir([
 "30 jours pour renvoyer, et gratuitement : qu'est-ce que cela demande en plus à l'entrepôt de Spartoo ?",
])

# ==================================================================== étape 2
etape(2, "Comprendre le bon de livraison et les réserves")
p("Quand un camion se présente à l'entrepôt, le réceptionnaire ne se contente pas de signer : il contrôle. "
  "Lis le document ci-dessous, puis réponds aux questions : toutes les réponses sont dedans.")
encadre_liste("Document — Le bon de livraison et les réserves", [
 "Le bon de livraison (BL) est rédigé par l'expéditeur, c'est-à-dire le fournisseur. Il accompagne la "
 "marchandise et dit ce qui a été envoyé (références, quantités). Il ne prouve pas ce qui est arrivé.",
 "À l'arrivée, le destinataire signe le BL que lui tend le chauffeur. Signer sans rien écrire, c'est dire : "
 "« tout est arrivé, en bon état ».",
 "Émettre des réserves, c'est écrire sur le BL, AVANT de signer, ce qui ne va pas : ce qui manque, ce qui est "
 "abîmé. Les réserves gardent la preuve du problème.",
 "Une réserve doit être précise : quoi, combien, quel dommage. Exemple : « manque 2 cartons réf. AB-12 ; "
 "1 carton écrasé réf. CD-34 ».",
 "« Sous réserve de déballage » ne veut rien dire de précis : les juges considèrent que cette formule n'a "
 "aucune valeur.",
 "Code de commerce, article L133-3 : « La réception des objets transportés éteint toute action contre le "
 "voiturier pour avarie ou perte partielle si dans les trois jours, non compris les jours fériés, qui suivent "
 "celui de cette réception, le destinataire n'a pas notifié au voiturier, par acte extrajudiciaire ou par "
 "lettre recommandée, sa protestation motivée. »  (Le voiturier = le transporteur.)",
])
questions([
 ("Qu'est-ce qu'un bon de livraison ?", 3),
 ('Qui rédige le bon de livraison ?', 1),
])
saut_avant()   # étape longue : deux pages équilibrées plutôt qu'une réflexion seule en haut de page
questions([
 ("Que veut dire « émettre des réserves » à la réception d'une marchandise ?", 3),
])
questions([('De combien de jours dispose-t-on pour confirmer ses réserves au transporteur ?', 1)])
encadre('Deux destinataires :', "les réserves s'écrivent sur le BL du transporteur, qui a apporté la marchandise. "
        "On prévient aussi le fournisseur : c'est lui qui doit livrer ce qui a été commandé. Tu feras les deux "
        "aujourd'hui (étapes 5 et 8).")
qcm([
 ("Laquelle de ces réserves est valable ?",
  ["« sous réserve de déballage »", "« manque 1 carton réf. AB-12 »", "« livraison abîmée »"], 1),
 ("Spartoo signe un bon de livraison sans réserve, alors qu'il manque des paires. Que se passe-t-il ?",
  ["le fournisseur rembourse les paires manquantes", "le fournisseur peut dire que la livraison était complète", "le bon de livraison n'a aucune valeur"], 1),
])
reflechir([
 'À ton avis, que risque une entreprise qui signe un bon de livraison sans avoir compté ?',
])

# ==================================================================== étape 3
etape(3, "Lire la procédure et répondre au questionnaire")
encadre("⚠  À partir d'ici, tu travailles dans Prepalog.",
        "Ferme ta recherche Internet. Tout le reste de la séance se passe dans le logiciel de l'entreprise, "
        "et tu continues de répondre dans ce carnet.")
consignes([
 "Ouvre Prepalog et saisis ton matricule et ton code (le matricule noté en première page), puis « Entrer ».",
 "Clique sur la pastille « Simulog », puis ouvre l'activité « Spartoo — réception ». Le bandeau en haut "
 "affiche « ENT-1.1 ».",
 "Va dans Messagerie. Ouvre d'abord « Bienvenue chez Spartoo », puis « Procédure de réception : à lire avant le "
 "quai » : M. Morin, ton responsable, y donne cinq règles.",
 "Lis aussi l'« Avis d'expédition » de Puma : il annonce le camion qui arrive aujourd'hui.",
 "Dans le message de M. Morin, clique sur « Répondre au questionnaire ». La procédure reste affichée à côté : "
 "réponds aux 5 questions, puis clique sur « Envoyer à M. Morin ».",
])
encadre_liste('Ce que tu dois voir :', [
 "dans le menu de gauche, « Quai de réception » est grisé : « Réponds d'abord au questionnaire de la "
 "procédure (Messagerie) » ;",
 "après l'envoi : « Le quai est ouvert : va recevoir le camion ». Le quai s'ouvre même si tu t'es trompé, "
 "mais ton enseignant voit tes réponses : relis bien la procédure avant d'envoyer.",
])
p("D'après l'avis d'expédition de Puma :", taille=10.5, gras=True, avant=6)
faits(['Quel transporteur apporte la livraison ?', 'Combien de palettes sont annoncées ?',
       'Sous quel délai Puma veut-il recevoir les réserves ?'])
qcm([
 ("Dans le contrat de vente entre Spartoo et son fournisseur, quelle est l'obligation du fournisseur ?",
  ['payer les factures de Spartoo', 'compter les colis à la place de Spartoo', 'livrer les marchandises commandées'], 2),
])
reflechir([
 'Quelle règle de M. Morin te paraît la plus difficile à appliquer sur un quai ?',
])

# ==================================================================== étape 4
etape(4, "Recevoir le camion")
p("Ouvre « Quai de réception ». Le camion de Geodis recule à la porte 7 de l'entrepôt Toolog. Le chauffeur te "
  "parle et te remet le bon de livraison, affiché à droite. Ne signe rien pour l'instant.")
encadre_liste('Ce que tu dois voir :', [
 "le camion à quai, le chauffeur et sa bulle : « Voilà le bon de livraison : vous me signez quand c'est bon ? » ;",
 "à droite, le bon de livraison de Puma France : une palette mixte, trois références, en cartons.",
])
p("Relève les informations du bon de livraison :", taille=10.5, gras=True, avant=6)
tableau(['Information', 'Ce que tu relèves'], 0, [Cm(6.4), Cm(10.6)], hauteur=Cm(0.95),
        remplis=[['Numéro du bon de livraison', ''], ['Numéro de commande', ''], ["Date d'expédition", ''],
                 ['Transporteur', ''], ['Numéro de lot', ''], ['Nombre de cartons annoncés', '']])
encadre_liste('Le PCB, « par combien » :', [
 "le PCB est le nombre d'unités que contient un colis : ici, le nombre de paires dans un carton ;",
 "il est écrit sur le BL et sur l'étiquette de chaque carton (« 6 paires par carton ») ;",
 "le fournisseur annonce des cartons, le stock se compte en paires : paires = cartons × PCB.",
])
p("Recopie les lignes du BL, puis calcule les paires :", taille=10.5, gras=True, avant=6)
tableau(['Référence article', 'Cartons annoncés par le fournisseur', 'Paires par carton (PCB)',
         'Paires annoncées (cartons × PCB)'], 3,
        [Cm(4.4), Cm(4.2), Cm(4.0), Cm(4.4)], hauteur=Cm(1.15))
saut_avant()
encadre('Le numéro de lot :', "note-le très soigneusement, avec ses tirets et sans espace. Tu devras le "
        "recopier à l'identique dans le logiciel, puis dans ton message au fournisseur.")
consignes([
 "Clique sur « Oui, vous pouvez décharger ».",
 "Regarde le déchargement jusqu'au bout : la palette sort du camion et arrive dans la zone de réception.",
])
faits(['Qui sort la palette du camion ?'])
# Règle des 3 tonnes : contrat type général, art. 7.1 et 7.2 (décret 2017-461), vérifiée le 06/10/2026.
encadre_liste('La règle des 3 tonnes (contrat type général du transport routier, article 7) :', [
 "envoi de moins de 3 tonnes : le transporteur charge, cale, arrime et décharge, sous sa responsabilité ;",
 "envoi de 3 tonnes ou plus : l'expéditeur charge, et le destinataire décharge, chacun sous sa responsabilité.",
])
questions([
 ("Ta palette de chaussures pèse une centaine de kilos. Qui doit la décharger, d'après cette règle ? Explique.", 2),
])
qcm([
 ("Un camion livre à Spartoo 8 tonnes de cartons en une seule fois. Qui doit les décharger ?",
  ['le chauffeur du transporteur', 'Spartoo, le destinataire', 'Puma, l\'expéditeur'], 1),
])
reflechir([
 "Le chauffeur te dit : « Signez vite, j'ai six livraisons après vous. » Que lui réponds-tu, et pourquoi ?",
])

# ==================================================================== étape 5
etape(5, "Compter la palette et faire signer le chauffeur")
p("La palette est devant toi, en grand. Le BL annonce ce que Puma a voulu envoyer ; toi, tu comptes ce qui est "
  "vraiment là. Un carton peut manquer au fond, un autre être abîmé sur une face que tu ne vois pas : fais le tour.")
consignes([
 "Utilise « ⟲ Tourner » et « Tourner ⟳ » pour voir les quatre faces de la palette.",
 "Clique sur un carton pour lire son étiquette : référence, taille, paires par carton, numéro du carton (« 5 / 12 »).",
 "Compte les cartons référence par référence (une couche = une référence), et repère ceux qui sont abîmés.",
 "Note ton comptage ci-dessous AVANT de remplir la fiche de contrôle à l'écran.",
])
tableau(['Référence article', 'Cartons au BL', 'Cartons comptés', 'Écart', 'N° du carton abîmé'], 3,
        [Cm(4.6), Cm(2.8), Cm(3.0), Cm(2.6), Cm(4.0)], hauteur=Cm(1.05))
faits(['Quel numéro de carton manque ? (aide-toi des numéros « x / 12 »)', 'Sur quelle face as-tu vu le carton abîmé ?'])
encadre('Et ce qu\'il y a dans le carton abîmé ?', "quand tu repères un carton abîmé, le chef de quai l'ouvre "
        "devant le chauffeur : ici, les boîtes et les chaussures sont intactes, elles peuvent être vendues. "
        "Applique la procédure de M. Morin pour choisir ta décision.")
saut_avant()
p("À l'écran, maintenant : la fiche de contrôle, les réserves, la signature.", taille=10.5, gras=True)
consignes([
 "Remplis la fiche de contrôle à l'écran (référence lue, endommagés, manquants), puis choisis la décision et "
 "le ou les motifs.",
 "Écris les réserves sur le BL : nombre de cartons endommagés, nombre de cartons manquants. Ne coche "
 "pas « Sous réserve de déballage ».",
 "Fais signer le chauffeur.",
])
encadre_liste('Ce que tu dois voir :', [
 "sur le BL, ta ligne de réserves ajoutée avant les signatures ;",
 "la signature du chauffeur, et la palette posée en zone de réception.",
])
p("L'écran écrit le nombre de cartons, pas les références. Écris ici la réserve complète, comme sur un vrai BL :",
  taille=10.5, gras=True, avant=4)
questions([("Ta réserve, avec la référence de chaque carton :", 2)])
qcm([
 ("Le fournisseur livre moins de paires que prévu. Qu'est-ce qui n'est pas respecté ?",
  ["la quantité commandée", "le prix des chaussures", "la couleur des cartons"], 0),
])
reflechir([
 'Un carton endommagé veut-il forcément dire que la marchandise est abîmée ?',
])

# ==================================================================== étape 6
etape(6, "Retrouver ta réception et la saisir en paires")
p("La palette est contrôlée : il faut maintenant la faire entrer dans le stock. Ouvre « Réceptions » : la liste "
  "montre toutes les réceptions de l'entrepôt, pas seulement la tienne. Tu retrouves la tienne par son numéro de BL.")
consignes([
 "Cherche ton numéro de BL dans la liste. Plusieurs réceptions se ressemblent : compare le numéro chiffre par chiffre.",
 "Ouvre ta réception.",
])
faits(['Quel est le numéro de ta réception (REC-…) ?'])
questions([("Pourquoi la réception de Reebok n'a-t-elle pas de bouton pour l'ouvrir ?", 2)])
encadre('Cartons ou paires ?', "au quai, tu as compté des cartons. Sur le bon de réception, on écrit des paires : "
        "nombre de cartons × PCB (6 paires par carton).")
p("Prépare ta saisie : convertis ton comptage de l'étape 5 en paires.", taille=10.5, gras=True, avant=6)
tableau(['Référence article', 'Paires annoncées', 'Paires comptées', 'État des colis', 'Décision'], 3,
        [Cm(4.4), Cm(2.6), Cm(2.6), Cm(3.6), Cm(3.8)], hauteur=Cm(1.1))
saut_avant()
p("Saisis maintenant ton bon de réception à l'écran :", taille=10.5, gras=True)
consignes([
 "Recopie le numéro de lot du BL dans le champ prévu, à l'identique.",
 "Pour chaque référence : paires annoncées, paires comptées, état des colis, décision.",
 "Applique la règle de M. Morin : il manque quelque chose ou un carton est endommagé → accepté sous réserve.",
 "Clique sur « Valider la réception (entrée en stock) ». Une fenêtre rappelle le numéro de réception et le "
 "numéro de BL : vérifie-les avant de confirmer. Après, tu ne peux plus rien modifier.",
])
encadre_liste('Ce que tu dois voir :', [
 "plus de liste des colis : « Les cartons ont été comptés au quai : reprends ta fiche de contrôle » ;",
 "le bouton de validation reste gris tant que le lot et toutes les lignes ne sont pas remplis ;",
 "après confirmation : « Réception validée », et le bon ne se modifie plus.",
])
faits(['Combien de paires, au total, vont entrer en stock ?'])
reflechir([
 "Pour la ligne où il manque un carton, pourquoi as-tu choisi ta décision plutôt qu'une autre ?",
])

# ==================================================================== étape 7
etape(7, "Découvrir la console et vérifier ta réception")
p("Un professionnel ne s'arrête pas à « Réception validée » : il vérifie que sa saisie a produit ce qu'il "
  "attendait. Pour cela, Spartoo a une console. Tu t'en serviras dans toutes les séances Spartoo.")
# Explication de la console reprise à l'identique de l'ancienne étape 3 d'ENT-1.2 (demande de Tristan, 06/10/2026 :
# « l'explication console d'origine était plus complète »). ENT-1.2 n'en garde qu'un rappel.
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
saut_avant()
p("Vérifie maintenant ta réception avec trois commandes :", taille=10.5, gras=True)
consignes([
 "Tape .movements : les derniers mouvements de stock.",
 "Tape .getstock PM-SUE-MA-41 : le stock de cette référence.",
 "Tape .getlot suivi de ton numéro de lot : tout ce qui concerne ce lot.",
])
encadre_liste('Ce que tu dois voir dans .getlot :', [
 "les entrées du lot, une ligne par référence, avec ton numéro de réception ;",
 "« Aucune sortie : tout le lot est encore en stock. »",
])
faits(['Combien de paires, au total, sont entrées avec ce lot ?', 'Quel type de mouvement apparaît dans .movements pour ces entrées ?',
       'Avec .getstock PM-SUE-MA-41, combien de paires sont en stock ?'])
questions([
 ("Pourquoi n'y a-t-il encore aucune sortie dans .getlot ?", 2),
])
reflechir([
 'En quoi le numéro de lot sera-t-il utile si, dans un mois, le fournisseur signale un défaut de fabrication ?',
])

# ==================================================================== étape 8
etape(8, "Signaler les réserves à Puma")
p("Au quai, tu as écrit tes réserves pour le transporteur. Il reste à prévenir le fournisseur, le jour même : "
  "sans message écrit, Puma ne remplacera pas le carton manquant et ne remboursera pas le carton abîmé.")
consignes([
 "Va dans Messagerie, puis clique sur « Nouveau message ».",
 "Choisis Puma comme destinataire.",
 "Écris un message qui rappelle le numéro de lot, dit ce qui manque et signale le carton endommagé.",
 "Envoie-le.",
])
encadre('Attention, à lire avant de rédiger :', "ton message doit contenir le numéro de lot écrit en entier "
        "(tirets compris), les deux références concernées, et ce qui manque écrit en chiffres : en paires "
        "(« il manque 6 paires ») ou en cartons (« il manque 1 carton »).")
p("Rédige d'abord ton brouillon ici, puis recopie-le dans la messagerie :", taille=10.5, gras=True, avant=6)
questions([
 ('Brouillon de ton message à Puma :', 7),
])
saut_avant()
questions([
 ('Quelles informations un fournisseur a-t-il besoin de recevoir pour traiter une réserve ?', 2),
])
qcm([
 ("Si le fournisseur ne répond pas, Spartoo peut demander des dommages-intérêts. Que sont des dommages-intérêts ?",
  ["une réduction offerte aux clients fidèles", "un impôt payé à l'État", "une somme d'argent versée pour réparer le dommage subi"], 2),
])
encadre_liste('Tu as terminé la séance quand :', [
 "ton message à Puma est envoyé ;",
 "un bandeau s'affiche en haut de l'écran : « Séance validée ✓ », ou bien le titre de ce qui reste à corriger "
 "(dans ce cas, appelle ton professeur) ;",
 "toutes les questions de ce carnet ont une réponse.",
])
reflechir([
 "Qu'aurait-il fallu faire, en plus, si les chaussures du carton endommagé avaient été inutilisables ?",
])

# Feuille à détacher (cours + activité à la maison), décision de Tristan du 04/10/2026. Ce générateur n'utilise
# pas trame_commun : on lui prête le document en cours, puis on reprend les questions de la feuille pour le corrigé.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trame_commun as TC
TC.d = d; TC.ETAPE_NUM = ETAPE_NUM; TC.ITEMS.clear()
TC.feuille_detachable('ENT-1.1')
ITEMS.extend(TC.ITEMS)

SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      '..', 'contenus', 'trames', 'ENT-1.1-spartoo-reception-trame-eleve.docx')
# ------------------------------------------------------------------ corrigé pour l'espace enseignant
NOTIONS = [
 ["Quand un client commande", "Module 1 et 2 — contrat de vente", "Le client et Spartoo concluent un contrat de vente : Spartoo s'engage à livrer, le client à payer."],
 ["Quel organisme protège", "Module 2 — protection des données personnelles, CNIL", "La CNIL (Commission nationale de l'informatique et des libertés) veille à la protection des données personnelles."],
 ["D'après la loi, combien de jours", "Module 2 — protection du consommateur", "Délai légal de rétractation de 14 jours pour un achat à distance (Code de la consommation, art. L221-18). Les 30 jours de Spartoo vont au-delà."],
 ["Les 30 jours de Spartoo", "Module 2 — relation client, protection du consommateur", "La loi fixe un minimum (14 jours) pour tous ; Spartoo offre plus par choix commercial : rassurer, fidéliser, se démarquer des concurrents."],
 ["Pourquoi la loi protège", "Module 2 — asymétrie d'information", "À distance, le consommateur ne voit ni ne touche le produit : il est moins bien informé que le vendeur, la loi compense."],
 ["Laquelle de ces réserves", "Module 1 — contrat, preuve, responsabilité contractuelle", "Une réserve doit être précise (quoi, combien, quel dommage) ; « sous réserve de déballage » ou « livraison abîmée » ne prouvent rien."],
 ["Spartoo signe un bon", "Module 1 — contrat, responsabilité contractuelle", "Un bon de livraison signé sans réserve est en général considéré comme la preuve d'une livraison conforme : se plaindre ensuite devient difficile."],
 ["Dans le contrat de vente entre", "Module 1 — droits et obligations", "L'obligation principale du vendeur est de livrer ce qui a été commandé ; celle de l'acheteur est de payer."],
 ["Un camion livre à Spartoo 8 tonnes", "Module 1 — contrat (contrat de transport, obligations des parties)", "Contrat type général du transport routier, art. 7.2 : pour un envoi de 3 tonnes ou plus, le déchargement est fait par le destinataire, sous sa responsabilité (art. 7.1 : moins de 3 tonnes, c'est le transporteur)."],
 ["Le fournisseur livre moins", "Module 1 — inexécution du contrat", "Livrer moins que la quantité commandée est une inexécution du contrat (point de départ de la responsabilité contractuelle)."],
 ["Si le fournisseur ne répond pas", "Module 1 — responsabilité civile contractuelle, dommages-intérêts", "Les dommages-intérêts sont une somme d'argent qui répare le dommage causé par l'inexécution du contrat."],
]
CODE_SEANCE, TITRE_SEANCE, FICHIER_TRAME = 'ENT-1.1', 'Spartoo — réceptionner une livraison', 'ENT-1.1-spartoo-reception-trame-eleve'
from corriges_data import ecrire_corrige
ecrire_corrige(CODE_SEANCE, TITRE_SEANCE, FICHIER_TRAME, ITEMS, CLES, NOTIONS,
               os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'contenus', 'corriges'), os.path.basename(__file__))
d.save(SORTIE)
print('logo :', 'repris' if os.path.exists(LOGO) else 'absent — emplacement réservé')
