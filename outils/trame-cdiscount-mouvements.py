# -*- coding: utf-8 -*-
"""Trame élève Cdiscount — séance ENT-2.1 « Le stock raconte » (C1.6, guidage, 1L).

Mêmes règles de mise en page que les trames Spartoo et Boost (fiches `prepalog-trames-eleve` et
`prepalog-trame-ent31`) : en-tête sur la première page seule, sommaire en page 1, une étape par
page, de la place pour écrire, jamais de coupure juste après une consigne, on commence hors de
l'outil, un bloc « Pour réfléchir » à chaque étape, tout jalon contrôlé automatiquement est annoncé
à l'élève AVANT qu'il rédige.

Ce que cette trame fait, et ne fait pas :
  - elle suit la marche à suivre de l'accueil (`ACCUEIL` de contenus/cdiscount-mouvements.js) et le
    message de Nadia Ferrand ; elle ne donne JAMAIS les réponses (stock, numéros de documents,
    quantités, résultat du calcul) : l'élève les trouve dans le logiciel ;
  - elle fait remplir une FICHE DE STOCK papier de l'article avant le calcul à l'envers (date,
    document, entrée, sortie, stock après) : la fiche a deux contrôles intégrés qui disent à
    l'élève s'il a réussi, alors que le site ne lui dit rien pendant l'exercice ;
  - elle dit aux élèves ce qui est vérifié (Cdiscount, Cestas, C-Logistics, le logo) et ce qui est
    construit (le reste) : encadré de l'étape 1.

Les intitulés des six lignes de réponse sont ceux de `LIGNES_REPONSE` (ce que lisent les jalons).
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
LOGO = os.path.join(RACINE, 'contenus', 'trames', 'logos', 'cdiscount.png')
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




# ==================================================================== la fiche de stock
# Les six intitulés de la réponse à Nadia Ferrand, tels que le message les écrit : ce sont ceux que
# lisent les jalons (contenus/cdiscount-mouvements.js, LIGNES_REPONSE). Les intitulés sont donnés :
# jamais les réponses.
INTITULES = ['Stock actuel :', 'Réception :', 'Commandes :', 'Retour :', 'Casse :', 'Stock au dernier inventaire :']

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
    r = par.add_run('CDISCOUNT'); r.bold = True; r.font.size = Pt(15); r.font.color.rgb = TITRE

par = d.add_paragraph(); par.paragraph_format.space_after = Pt(0)
r = par.add_run("ENT-2.1 — Carnet de suivi : le stock raconte")
r.bold = True; r.font.size = Pt(18); r.font.color.rgb = TITRE

d.add_paragraph().paragraph_format.space_after = Pt(6)

t = d.add_table(rows=3, cols=4); t.style = 'Table Grid'
for lib, li, co in [('Nom', 0, 0), ('Prénom', 0, 2), ('Classe', 1, 0), ('Date', 1, 2), ('Matricule Prepalog', 2, 0)]:
    c = t.rows[li].cells[co]; ombre(c, 'E8E8E8')
    par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(0)
    r = par.add_run(lib); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
t.rows[2].cells[1].merge(t.rows[2].cells[3])
for row in t.rows: row.height = Cm(1.1)
d.add_paragraph().paragraph_format.space_after = Pt(4)

encadre('Ce document est ta trame de travail :',
        "tu peux le suivre seul, étape par étape. Chaque étape dit où cliquer et ce que tu dois voir à l'écran. "
        "Les réponses à Nadia Ferrand, ta cheffe d'équipe, ne sont jamais données ici : tu les trouves dans le logiciel.")
encadre('Ce que ton enseignant voit dans son suivi :',
        "cinq points, lus dans ta réponse écrite à Nadia (étape 7) : le stock actuel, la réception, les commandes, "
        "les autres documents et le stock du dernier inventaire. Le logiciel ne te dit pas, pendant l'exercice, si "
        "c'est juste : ce sont les deux vérifications de la fiche de stock (étapes 4 et 6) qui te permettent de te "
        "contrôler. Tes réponses écrites dans cette trame ne sont pas notées par le logiciel : elles servent à "
        "réfléchir.")

soustitre("Le déroulé de ta séance")
p("Chaque étape commence sur une nouvelle page. Passe à la suivante quand tu as répondu à toutes les questions "
  "de celle-ci.", taille=10, apres=4)
tableau(['N°', 'Étape', 'Où travailles-tu ?'], 0, [Cm(1.4), Cm(11.0), Cm(4.6)], hauteur=Cm(0.9),
        remplis=[['1', 'Découvrir Cdiscount', 'Sur Internet'],
        ['2', 'Ouvrir son environnement et lire le message de Nadia', 'Dans Prepalog'],
        ['3', 'Relever le stock actuel', 'Dans Prepalog'],
        ['4', 'Lister les mouvements et remplir la fiche de stock', 'Dans Prepalog, puis sur ta fiche'],
        ['5', 'Relier chaque mouvement à son document', 'Dans Prepalog'],
        ['6', "Refaire le calcul à l'envers", 'Sur ta fiche'],
        ['7', 'Répondre à Nadia Ferrand', 'Dans Prepalog']])

# ==================================================================== étape 1
etape(1, "Découvrir Cdiscount")
p("Avant d'ouvrir le logiciel, il faut savoir pour qui tu travailles. Cdiscount existe vraiment. Cette séance se "
  "passe dans son entrepôt de Cestas, en Gironde. Fais d'abord une recherche sur Internet.")
consignes([
    "Cherche « Cdiscount entreprise » et ouvre une page qui présente la société (par exemple Wikipédia).",
    "Cherche ensuite « Cdiscount entrepôt Cestas ».",
    "Réponds aux questions ci-dessous avec ce que tu trouves.",
])
faits(["En quelle année Cdiscount a-t-elle été créée ?",
       "Dans quelle ville a-t-elle été fondée ?",
       "Dans quel département se trouve son entrepôt de Cestas ?",
       "Quel est le nom de sa filiale logistique ?"])
qcm([
 ("Cdiscount vend ses produits, mais aussi ceux de vendeurs indépendants sur son site. Comment appelle-t-on ce fonctionnement ?",
  ["une place de marché", "une franchise", "un grossiste"], 0),
])
encadre('Ce qui est vrai, ce qui est construit :',
        "Cdiscount, son entrepôt de Cestas, sa filiale logistique, son logo et ses couleurs sont réels. Tout le reste "
        "est construit pour l'exercice : les articles et leurs marques (elles n'existent pas), les fournisseurs, les "
        "clients, les numéros de documents, les quantités et les personnes de l'équipe. Le vrai entrepôt de Cestas "
        "est beaucoup plus grand : tu n'en vois qu'un rayon de petits articles.", espace=False)
reflechir([
    "Pour un site de vente en ligne, pourquoi est-il important que le stock affiché soit le stock réel ?",
])

# ==================================================================== étape 2
etape(2, "Ouvrir son environnement et lire le message de Nadia")
p("Connecte-toi à Prepalog, ouvre la rubrique Logisim, puis l'activité « Cdiscount — le stock raconte ». Le logiciel "
  "s'ouvre aux couleurs de Cdiscount : un bandeau bleu en haut, un menu à gauche. Clique sur « Messagerie » : "
  "plusieurs messages t'attendent.")
consignes([
    "Ouvre d'abord « Bienvenue à l'entrepôt de Cestas » : Nadia Ferrand, ta cheffe d'équipe, te présente le travail.",
    "Ouvre ensuite « Écouteurs ECO-BT-01 : racontez-moi la semaine ». Lis-le en entier, jusqu'au bout. Ne réponds "
    "pas tout de suite : tu enverras ton stock actuel à la fin de l'étape 3, et ta réponse complète à l'étape 7.",
    "Relève les informations ci-dessous.",
])
encadre('Un mot de métier :',
        "un inventaire, c'est compter à la main ce qu'il y a vraiment dans les rayons, puis comparer avec le chiffre "
        "de l'ordinateur.")
tableau(['Information', 'Ce que tu relèves'], 5, [Cm(8.6), Cm(8.4)], hauteur=Cm(1.0),
        remplis=[["Qui t'écrit, et quel est son poste ?", ''],
                 ["Selon le message de bienvenue, le stock affiché dans le système doit être égal à quoi ?", ''],
                 ["De quel article parle Nadia (nom et référence) ?", ''],
                 ["À quelle date a eu lieu le dernier inventaire ?", ''],
                 ["Combien de lignes doit contenir ta réponse ?", '']])
reflechir([
    "Nadia veut comprendre comment le stock est arrivé là, pas seulement connaître son chiffre. Pourquoi, à ton avis ?",
])

# ==================================================================== étape 3
etape(3, "Relever le stock actuel")
p("Tu vas relever le stock d'écouteurs qu'affiche le système aujourd'hui. Il y a deux façons de le faire : "
  "essaie les deux.")
consignes([
    "Façon 1, par l'écran : clique sur « Stock » dans le menu de gauche (sous « Articles »). Si l'écran dit « Accès "
    "verrouillé », demande le code à ton enseignant, tape-le puis clique sur « Déverrouiller ».",
    "Dans l'onglet « Niveaux de stock », cherche ton article avec le champ « Recherche » et lis sa quantité en stock.",
    "Façon 2, par la console : clique sur « Console » (sous « Outils »). Tape d'abord .help pour voir les "
    "commandes. Puis tape .getstock, un espace, et la référence de l'article.",
])
tableau(['Où as-tu lu le stock ?', 'Stock actuel de l\'article'], 0, [Cm(8.6), Cm(8.4)], hauteur=Cm(1.0),
        remplis=[['Écran « Stock »', ''], ['Console', '']])
encadre('Ce que tu dois voir :',
        "sur l'écran Stock, des cases de chiffres en haut, puis la liste des références ; dans la console, une réponse "
        "avec la référence et la quantité. Les deux nombres doivent être identiques. Sinon, vérifie que tu as bien "
        "écrit la référence.")
# Option B (03/10/2026) : le premier compte rendu fait arriver la suite. On ne dit PAS quels documents
# arrivent (règle de la page 1 : « les autres documents »).
p("Nadia attend ce premier chiffre avant la suite : envoie-le-lui maintenant.")
consignes([
    "Dans « Messagerie », ouvre le message de Nadia et clique sur « Répondre ».",
    "Complète seulement la première ligne (« Stock actuel : ») avec le nombre que tu as relevé, puis clique sur "
    "« Envoyer ».",
])
encadre('Ce que tu dois voir :',
        "en bas de l'écran, « Réponse envoyée. Nouveau message » ; à côté de « Messagerie », le nombre de messages "
        "non lus augmente. Ces nouveaux messages te serviront à l'étape 5.")
reflechir([
    "Quelle façon de lire le stock te paraît la plus sûre ? Explique ton choix.",
    "Ce nombre dit-il à lui seul comment le stock est arrivé là ? Explique.",
])

# ==================================================================== étape 4
etape(4, "Lister les mouvements et remplir la fiche de stock")
p("Un mouvement de stock, c'est chaque fois que des articles entrent dans l'entrepôt ou en sortent. Le système les "
  "garde tous. Tu vas recopier ceux de ton article sur une fiche de stock, comme on le faisait sur papier avant "
  "l'ordinateur.")
encadre('Un mot de métier :',
        "une fiche de stock suit UN seul article. Une ligne par mouvement : la date, le document qui l'a provoqué, "
        "ce qui est entré, ce qui est sorti, et ce qu'il reste après.")
consignes([
    "Clique sur « Stock », puis sur l'onglet « Mouvements ».",
    "Cette liste mélange plusieurs articles : repère les lignes de ton article (colonne « Réf. »). Dans la console, "
    ".movements suivi de la référence n'affiche que lui.",
    "Lis les colonnes : Date, Type, Qté (un + entre, un − sort), Stock après, Origine (le code du document).",
    "Recopie les mouvements de ton article sur la fiche, du plus ancien (en haut) au plus récent. À l'écran, ils "
    "ne sont pas dans cet ordre : regarde la date et l'heure.",
    "Une entrée va dans la colonne « Entrée », une sortie dans la colonne « Sortie » : écris le nombre sans le signe.",
    "Laisse vide la case « Stock après » de la ligne « Inventaire » : tu la rempliras à l'étape 6.",
])
p("Fiche de stock de l'article (référence) : …………………………………………", taille=10.5, gras=True, avant=6, apres=4)
tableau(['Date', 'Document (Origine)', 'Entrée', 'Sortie', 'Stock après'], 0,
        [Cm(3.7), Cm(5.1), Cm(2.2), Cm(2.2), Cm(3.8)], hauteur=Cm(0.95),
        remplis=[['Il y a 7 jours', 'Inventaire', '', '', 'à compléter à l\'étape 6']] + [['', '', '', '', ''] for _ in range(10)])
p("Tu n'auras peut-être pas besoin de toutes les lignes.", taille=9.5, apres=4)
saut_avant()
encadre('Ce que tu dois voir :',
        "pour chaque ligne sauf la première, le « Stock après » est égal au « Stock après » de la ligne du dessus, "
        "plus l'entrée ou moins la sortie. La dernière ligne de ta fiche affiche le même nombre que le stock actuel "
        "de l'étape 3. Si ce n'est pas le cas, tu as sauté un mouvement, ou les lignes ne sont pas dans le bon ordre.")
reflechir([
    "Regarde la colonne « Type » de ta fiche : que remarques-tu ?",
    "Pourquoi, à ton avis, le système garde-t-il le « Stock après » à chaque ligne, et pas seulement le stock du jour ?",
])

# ==================================================================== étape 5
etape(5, "Relier chaque mouvement à son document")
p("Un mouvement de stock doit toujours avoir un document : sans lui, personne ne peut dire pourquoi le stock a "
  "bougé. La colonne « Origine » de ta fiche te donne le code de ce document. À toi de retrouver chacun d'eux.")
encadre('Des mots de métier :',
        "une réception est une livraison d'un fournisseur ; elle arrive avec un bon de livraison. Un bon de "
        "préparation dit au préparateur quels articles sortir du rayon pour une commande client. Un retour client, "
        "c'est un article que le client renvoie. La casse, c'est un article abîmé qu'on ne peut plus vendre.")
encadre('Nadia le précise dans son message :',
        "un bon de préparation BP-… porte les mêmes chiffres que sa commande CMD-… : pour retrouver la commande, "
        "cherche dans « Commandes » celle qui a les mêmes chiffres que le bon.")
consignes([
    "Les documents se trouvent à trois endroits : les menus « Réceptions » et « Commandes », et la « Messagerie ». "
    "Pour chaque type de mouvement, décide où chercher et complète le premier tableau.",
    "Dans « Réceptions » et « Commandes », le bouton « Ouvrir » ouvre le document. Ouvre-les un par un, "
    "et complète les tableaux suivants.",
])
tableau(['Type de mouvement', 'Où je retrouve le document'], 0, [Cm(8.6), Cm(8.4)], hauteur=Cm(0.9),
        remplis=[['Entrée : réception', ''], ['Sortie : préparation', ''],
                 ['Entrée : retour client', ''], ['Sortie : casse', '']])
p("Dans « Réceptions », ouvre chaque réception de la liste :", taille=10.5, gras=True, avant=4, apres=4)
tableau(['N° de réception', 'Fournisseur', 'Écouteurs dans la livraison ?', 'Quantité d\'écouteurs'], 4,
        [Cm(3.8), Cm(4.4), Cm(5.0), Cm(3.8)], hauteur=Cm(1.0))
saut_avant()
p("Dans « Commandes », ouvre chaque commande de la liste (tu n'auras peut-être pas besoin de toutes les lignes) :",
  taille=10.5, gras=True, avant=0, apres=4)
tableau(['N° de commande', 'Client', 'Écouteurs dans la commande ?', 'Quantité d\'écouteurs'], 8,
        [Cm(3.8), Cm(4.4), Cm(5.0), Cm(3.8)], hauteur=Cm(0.85))
p("Dans la « Messagerie », les services ont écrit à Nadia au sujet de deux mouvements de ta fiche :",
  taille=10.5, gras=True, avant=0, apres=4)
tableau(['Document reçu (n°)', 'De qui ?', 'Que s\'est-il passé ?', 'Entrée ou sortie ?'], 3,
        [Cm(3.8), Cm(4.0), Cm(6.4), Cm(2.8)], hauteur=Cm(1.0))
reflechir([
    "Parmi les mouvements de ta fiche, lesquels ne sont ni un achat ni une vente ? Explique pourquoi le stock a bougé quand même.",
    "Dans une vraie entreprise, que risque-t-on si un mouvement de stock n'a aucun document ?",
])

# ==================================================================== étape 6
etape(6, "Refaire le calcul à l'envers")
p("Tu connais le stock d'aujourd'hui et tout ce qui a bougé depuis l'inventaire. Tu peux donc retrouver le stock du "
  "jour de l'inventaire en remontant le temps : ce qui est entré depuis, on le retire ; ce qui est sorti depuis, "
  "on le remet.")
encadre('Pourquoi ça marche :',
        "à l'endroit, le stock d'aujourd'hui est égal au stock de l'inventaire, plus les entrées, moins les sorties. "
        "À l'envers, on fait l'opération contraire.")
consignes([
    "Additionne la colonne « Entrée » de ta fiche, puis la colonne « Sortie ».",
    "Recopie le stock actuel relevé à l'étape 3.",
    "Calcule le stock du dernier inventaire. Écris ton calcul, pas seulement le résultat.",
    "Vérifie à l'endroit : stock de l'inventaire + entrées − sorties doit redonner le stock actuel.",
    "Recopie ton résultat dans la ligne « Inventaire » de ta fiche (case « Stock après »). Vérifie la ligne du "
    "dessous : stock de l'inventaire + entrée − sortie doit redonner son « Stock après ».",
])
tableau(['Ce que je calcule', 'Mon calcul', 'Résultat'], 0, [Cm(7.2), Cm(6.0), Cm(3.8)], hauteur=Cm(1.15),
        remplis=[['Total des entrées (colonne « Entrée »)', '', ''],
                 ['Total des sorties (colonne « Sortie »)', '', ''],
                 ['Stock actuel (étape 3)', '', ''],
                 ["Stock du dernier inventaire, calculé à l'envers", '', ''],
                 ["Vérification à l'endroit : inventaire + entrées − sorties", '', '']])
encadre('Ce que tu dois voir :',
        "la vérification à l'endroit redonne exactement le stock actuel. Si les deux nombres sont différents, ne "
        "cherche pas à arranger le résultat : reprends ta fiche. Vérifie d'abord les totaux, puis l'ordre des "
        "lignes, puis les mouvements oubliés.")
saut_avant()
reflechir([
    "Si ta vérification n'était pas tombée juste, par où aurais-tu commencé à chercher l'erreur ?",
    "Au prochain inventaire, le comptage donne 2 articles de moins que le stock du système. Que ferais-tu en premier ?",
])

# ==================================================================== étape 7
etape(7, "Répondre à Nadia Ferrand")
p("Tu as tout ce qu'il faut. Il reste à envoyer à Nadia la réponse complète : six lignes, une information par "
  "ligne.")
encadre("À lire AVANT d'écrire :",
        "le suivi lit tes lignes. Les six intitulés sont déjà écrits dans le champ de réponse : ne les modifie pas, "
        "écris ta réponse à la suite, sur la même ligne. Écris les nombres en "
        "chiffres (« 15 » et non « quinze »). Sur la ligne du stock actuel, un seul nombre. Sur la ligne du calcul, "
        "écris ton calcul, avec le résultat tout à la fin de la ligne. Sur la ligne des commandes, cite seulement "
        "celles qui ont des écouteurs. Pour un document, recopie son code en entier (par exemple « CMD-123456 »).")
consignes([
    "Prépare d'abord tes six lignes dans le tableau ci-dessous.",
    "Dans « Messagerie », ouvre « Écouteurs ECO-BT-01 : racontez-moi la semaine » et clique sur « Répondre ».",
    "Les six intitulés de Nadia sont déjà écrits dans le champ. Complète chaque ligne avec ta réponse, à la suite de "
    "l'intitulé, sans rien effacer. Relis, puis clique sur « Envoyer ».",
])
tableau(['Ligne de Nadia', "Ce que j'écris sur cette ligne"], 0, [Cm(5.2), Cm(11.8)], hauteur=Cm(1.1),
        remplis=[[i_, ''] for i_ in INTITULES])
reflechir([
    "Le stock du système n'est pas un comptage. Qu'est-ce qui pourrait faire que le stock réel du rayon soit différent du chiffre de l'écran ?",
    "Relis ta réponse comme si tu étais Nadia : peut-elle comprendre comment tu as trouvé chaque nombre ? Explique.",
])

SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      '..', 'contenus', 'trames', 'ENT-2.1-cdiscount-mouvements-trame-eleve.docx')
# ------------------------------------------------------------------ corrigé pour l'espace enseignant
NOTIONS = [["Cdiscount vend ses produits", "Place de marché (commerce en ligne)",
            "Une place de marché est un site où des vendeurs indépendants vendent leurs produits à côté de ceux du site : "
            "Cdiscount vend les siens et héberge aussi ceux d'autres vendeurs."]]
CODE_SEANCE, TITRE_SEANCE, FICHIER_TRAME = 'ENT-2.1', 'Cdiscount — le stock raconte', 'ENT-2.1-cdiscount-mouvements-trame-eleve'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import corriges_data
# Le dictionnaire ENT_2_1 vit dans corriges_data.py ; son inscription dans l'assemblage se fait ici, pour
# ne rien toucher d'autre dans ce fichier partagé.
corriges_data._DICOS[CODE_SEANCE] = [corriges_data.ENT_2_1]
corriges_data.ecrire_corrige(CODE_SEANCE, TITRE_SEANCE, FICHIER_TRAME, ITEMS, CLES, NOTIONS,
               os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'contenus', 'corriges'), os.path.basename(__file__))
d.save(SORTIE)
print('logo :', 'repris' if os.path.exists(LOGO) else 'absent — emplacement réservé')
