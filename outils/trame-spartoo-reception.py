# -*- coding: utf-8 -*-
"""Trame élève Spartoo — séance « réception ».

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
# Matricule : une seule case de réponse sur la largeur restante (02/10/2026). Avant, la ligne
# gardait deux cases vides à droite. Lignes à 1,1 cm : de la place pour écrire à la main.
t.rows[2].cells[1].merge(t.rows[2].cells[3])
for row in t.rows: row.height = Cm(1.0)
d.add_paragraph().paragraph_format.space_after = Pt(4)

# Page 1 uniformisée avec les autres entreprises (reprise du 04/10/2026).
encadre('Ce document est ta trame de travail :',
        "tu peux le suivre seul, étape par étape. Aujourd'hui, tu es au quai de réception de Spartoo : une "
        "livraison arrive, et c'est toi qui la contrôles. Le logiciel ne compte rien à ta place et ne corrige "
        "aucune erreur : ce que tu saisis entre vraiment dans le stock.")
encadre('Ce que ton enseignant voit dans son suivi :',
        "trois points : ton contrôle à réception (numéro de lot, quantités, état et décision de chaque ligne), "
        "l'entrée en stock avec le bon lot, et ton message de réserves à Puma. Tes réponses écrites ici servent à "
        "réfléchir.")
encadre('Ce qui est vrai, ce qui est inventé :',
        "Spartoo, son métier (la vente de chaussures en ligne) et la marque Puma sont réels. Le bon de livraison, "
        "les quantités, les numéros, les coordonnées de Puma et M. Morin sont inventés pour l'exercice.")

# ==================================================================== étape 2
soustitre("Le déroulé de ta séance")
p("Chaque étape commence sur une nouvelle page. Passe à la suivante quand tu as répondu à toutes les questions "
  "de celle-ci.", taille=10, apres=4)
tableau(['N°', 'Étape', 'Où travailles-tu ?'], 0, [Cm(1.4), Cm(11.0), Cm(4.6)], hauteur=Cm(0.9),
        remplis=[['1', "Découvrir l'entreprise Spartoo", 'Sur Internet'],
        ['2', 'Comprendre le contrôle à réception', 'Sur Internet'],
        ['3', "Lire la procédure de l'entreprise", 'Dans Prepalog'],
        ['4', 'Lire le bon de livraison', 'Dans Prepalog'],
        ['5', 'Compter les colis sur le quai', 'Dans Prepalog'],
        ['6', 'Remplir le bon de réception', 'Dans Prepalog'],
        ['7', 'Valider et vérifier dans la base', 'Dans Prepalog'],
        ['8', 'Signaler les réserves au fournisseur', 'Dans Prepalog']])

etape(1, "Découvrir l'entreprise Spartoo")
p("Avant d'ouvrir le logiciel, il faut savoir pour qui tu travailles. Spartoo existe réellement : c'est un vrai site "
  "marchand français de vente de chaussures en ligne. Fais une recherche sur Internet pour découvrir qui elle est.")
consignes([
 "Ouvre un moteur de recherche et tape « Spartoo entreprise ».",
 "Regarde sa fiche Wikipédia ou un article de presse économique, puis la page « Politique de confidentialité » ou « CGV » de son site.",
 "Réponds aux questions ci-dessous avec ce que tu trouves.",
])
faits(['En quelle année Spartoo a-t-elle été créée ?', 'Dans quelle ville se trouve son siège social ?', 'Que vend Spartoo ?', "Spartoo fabrique-t-elle elle-même les chaussures qu'elle vend ? (oui / non)"], hauteur=Cm(0.85))
qcm([
 ("Quand un client commande sur le site, quel contrat est conclu entre lui et Spartoo ?",
  ['un contrat de travail', 'un contrat de vente', 'un contrat de location'], 1),
 ("Quel organisme protège les données personnelles des clients ?",
  ['la CNIL', 'la Banque de France', 'La Poste'], 0),
 ("Après un achat sur Internet, combien de jours le client a-t-il pour changer d'avis ?",
  ['2 jours', '14 jours', '60 jours'], 1),
 ("Pourquoi la loi protège-t-elle davantage celui qui achète sur Internet ?",
  ["les produits y sont plus chers", "il ne peut pas toucher ni essayer le produit avant d'acheter", "les magasins n'ont pas le droit de vendre en ligne"], 1),
])
reflechir([
 "Pour une entreprise qui vend en ligne, pourquoi l'entrepôt et la logistique sont-ils aussi importants que le site Internet ?",
])

# ==================================================================== étape 2
etape(2, "Comprendre le contrôle à réception")
p("Avant d'ouvrir le logiciel, il faut savoir ce qu'on va faire. Quand un camion se présente à l'entrepôt, le "
  "réceptionnaire ne se contente pas de signer : il contrôle. Fais une recherche sur Internet pour comprendre "
  "pourquoi.")
consignes([
 "Cherche « bon de livraison définition » puis « réserves à la livraison ».",
 "Regarde en particulier ce que dit le Code de commerce sur le délai pour émettre des réserves.",
 "Réponds aux questions ci-dessous avec ce que tu trouves.",
])
faits(["Qu'est-ce qu'un bon de livraison ?", 'Qui rédige le bon de livraison ?'])
questions([
 ("Que veut dire « émettre des réserves » à la réception d'une marchandise ?", 2),
])
faits(['De combien de jours dispose-t-on, en général, pour confirmer ses réserves au transporteur ?'])
encadre('Deux destinataires :', "les réserves se confirment au transporteur, qui a apporté la marchandise. On "
        "prévient aussi le fournisseur : c'est lui qui doit livrer ce qui a été commandé.")
qcm([
 ("Spartoo signe un bon de livraison sans réserve, alors qu'il manque des paires. Que se passe-t-il ?",
  ["le fournisseur rembourse les paires manquantes", "le fournisseur peut dire que la livraison était complète", "le bon de livraison n'a aucune valeur"], 1),
])
reflechir([
 'À ton avis, que risque une entreprise qui signe un bon de livraison sans avoir compté ?',
])

# ==================================================================== étape 3
etape(3, "Lire la procédure de l'entreprise")
p("Connecte-toi à Prepalog, ouvre la rubrique Simulog puis l'activité « Spartoo — réception ». Tu arrives "
  "dans le logiciel de l'entreprise. Va dans Messagerie : M. Morin, ton responsable, t'a écrit.")
consignes([
 "Ouvre d'abord le message « Bienvenue chez Spartoo : votre mission » : c'est ton premier message dans l'entreprise, il présente ton travail.",
 "Ouvre ensuite le message « Procédure de réception : à lire avant de décharger ».",
 "Lis-le en entier : les cinq règles qu'il donne sont celles que tu vas appliquer aujourd'hui.",
])
questions([
 ('Dans quels deux cas une ligne doit-elle être « acceptée sous réserve » ?', 2),
 ('Dans quel cas seulement peut-on refuser une ligne ?', 2),
 ("À quoi sert le numéro de lot, d'après M. Morin ?", 2),
])
qcm([
 ("Dans le contrat de vente entre Spartoo et son fournisseur, quelle est l'obligation du fournisseur ?",
  ['payer les factures de Spartoo', 'compter les colis à la place de Spartoo', 'livrer les marchandises commandées'], 2),
])
reflechir([
 'Quelle règle de M. Morin te paraît la plus difficile à appliquer sur un quai ?',
])

# ==================================================================== étape 4
etape(4, "Lire le bon de livraison")
p("Toujours dans la Messagerie, ouvre le message de Puma France : « Bon de livraison BL-77421 ». Le document "
  "est affiché sous le message. C'est ce que le fournisseur annonce avoir expédié — pas forcément ce qui est "
  "arrivé.")
p("Relève les informations du document :", taille=10.5, gras=True, avant=6)
tableau(['Information', 'Ce que tu relèves'], 0, [Cm(6.4), Cm(10.6)], hauteur=Cm(1.0),
        remplis=[['Numéro du bon de livraison', ''], ["Date d'expédition", ''], ['Transporteur', ''],
                 ['Numéro de lot', ''], ['Nombre total de paires annoncées', '']])
p("Recopie maintenant les lignes annoncées :", taille=10.5, gras=True, avant=6)
tableau(['Référence article', 'Article', 'Quantité annoncée'], 3, [Cm(5.4), Cm(7.6), Cm(4.0)], hauteur=Cm(1.15))
encadre('Le numéro de lot :', "note-le très soigneusement, avec ses tirets et sans espace. Tu devras le "
        "recopier à l'identique dans le logiciel, puis dans ton message au fournisseur.")
reflechir([
 "Qu'est-ce qui pourrait arriver si tu te trompais d'un seul caractère dans le numéro de lot ?",
])

# ==================================================================== étape 5
etape(5, "Compter les colis sur le quai")
p("Le camion est déchargé. Va dans le menu Réceptions, ouvre la réception REC-04127 : tu vois la liste des "
  "colis réellement déposés, avec leur contenu et l'état du carton. Plusieurs colis peuvent contenir la même "
  "référence : c'est à toi de les additionner.")
consignes([
 "Repère, pour chaque référence, tous les colis qui la contiennent.",
 "Additionne les quantités pour obtenir la quantité réellement reçue.",
 "Note si l'un des cartons est endommagé.",
 "Compare avec la quantité annoncée sur le bon de livraison (étape 4).",
])
p("Fais ton comptage ici, avant de saisir quoi que ce soit dans le logiciel :", taille=10.5, gras=True, avant=6)
tableau(['Référence article', 'Colis concernés', 'Quantité comptée', 'Quantité annoncée', 'Écart'], 3,
        [Cm(4.4), Cm(3.4), Cm(3.0), Cm(3.0), Cm(3.2)], hauteur=Cm(1.2))
encadre_liste('Ce que tu dois voir :', [
 "en haut, le fournisseur, le transporteur et le bon de livraison de la réception ;",
 "le tableau « Colis reçus sur le quai » : une ligne par colis, avec son contenu et l'état du carton ;",
 "plus bas, le « Bon de réception », encore vide : tu le rempliras à l'étape 6.",
])
faits(['Sur quelle référence y a-t-il un écart ?', 'De combien de paires est cet écart ?', 'Quelle référence est arrivée dans un carton endommagé ?'])
qcm([
 ("Le fournisseur livre moins de paires que prévu. Qu'est-ce qui n'est pas respecté ?",
  ["la quantité commandée", "le prix des chaussures", "la couleur des cartons"], 0),
])
reflechir([
 'Un carton endommagé veut-il forcément dire que la marchandise est abîmée ?',
])

# ==================================================================== étape 6
etape(6, "Remplir le bon de réception")
p("Tu vas maintenant saisir ton contrôle dans le logiciel, sur le bon de réception. Attention : le logiciel "
  "enregistre ce que tu écris, sans le corriger. Une quantité mal recopiée, et c'est ton stock qui sera faux.")
consignes([
 "Recopie le numéro de lot du bon de livraison dans le champ prévu, à l'identique.",
 "Pour chaque référence : la quantité annoncée (bon de livraison), la quantité comptée (ton comptage de "
 "l'étape 5), l'état des colis, puis ta décision.",
 "Applique la règle de M. Morin : écart de quantité ou carton endommagé → accepté sous réserve.",
 "Vérifie ta saisie ligne par ligne avant de valider : après validation, tu ne peux plus la modifier.",
])
encadre_liste('Ce que tu dois voir :', [
 "le bouton « Valider la réception (entrée en stock) » reste gris tant que le numéro de lot et toutes les lignes ne sont pas remplis ;",
 "quand tout est rempli, il devient cliquable. Ne clique pas encore : recopie d'abord ta saisie ci-dessous.",
])
p("Recopie ici ce que tu as saisi :", taille=10.5, gras=True, avant=6)
tableau(['Référence article', 'Annoncé', 'Compté', 'État des colis', 'Décision'], 3,
        [Cm(4.4), Cm(2.2), Cm(2.2), Cm(4.0), Cm(4.2)], hauteur=Cm(1.2))
reflechir([
 "Pour la ligne où il manque des paires, pourquoi as-tu choisi ta décision plutôt qu'une autre ?",
])

# ==================================================================== étape 7
etape(7, "Valider et vérifier dans la base")
p("Clique sur « Valider la réception (entrée en stock) ». Les quantités acceptées entrent en stock, avec leur numéro de lot. "
  "Un professionnel ne s'arrête pas là : il vérifie que sa saisie a bien produit ce qu'il attendait.")
consignes([
 "Va dans la Console.",
 "Tape .movements pour voir les derniers mouvements de stock.",
 "Tape .getstock suivi d'une des références réceptionnées.",
 "Tape .getlot suivi du numéro de lot : tu vois tout ce qui concerne ce lot.",
])
encadre_liste('Ce que tu dois voir :', [
 "après le clic, le message « Réception validée : … entrées en stock » ;",
 "le bon de réception ne se modifie plus ;",
 "dans la Console, tes entrées, avec le numéro de lot que tu as saisi.",
])
faits(['Combien de paires, au total, sont entrées en stock avec ce lot ?', 'Quel type de mouvement apparaît dans .movements pour ces entrées ?', 'Quel fournisseur .getlot associe-t-il à ce lot ?'])
questions([
 ("Pourquoi la ligne « Sorties » de .getlot est-elle vide pour l'instant ?", 2),
])
reflechir([
 'En quoi le numéro de lot sera-t-il utile si, dans un mois, le fournisseur signale un défaut de fabrication ?',
])
encadre('Ce que tu viens de faire :', "tu as créé toi-même les entrées de stock de ton entrepôt. Lors des "
        "prochaines séances, tu prépareras des commandes avec ces paires, puis tu devras retrouver d'où elles "
        "viennent. Tout part de la saisie que tu viens de faire.")

# ==================================================================== étape 8
etape(8, "Signaler les réserves au fournisseur")
p("Il reste le plus important : prévenir Puma. Sans message écrit, les paires manquantes sont perdues pour "
  "l'entreprise, et le carton endommagé ne sera jamais remboursé.")
consignes([
 "Va dans Messagerie, puis clique sur « Nouveau message ».",
 "Choisis Puma comme destinataire.",
 "Écris un message qui rappelle le numéro de lot, indique ce qui manque et signale le carton endommagé.",
 "Envoie-le.",
])
encadre('Attention, à lire avant de rédiger :', "ton message doit contenir le numéro de lot écrit en entier "
        "(tirets compris), les deux références concernées, et la quantité manquante écrite en chiffres "
        "(par exemple « il manque 2 paires »). C'est ce que ton enseignant retrouvera dans son suivi.")
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
 "toutes les questions de ce carnet ont une réponse.",
])
reflechir([
 "Qu'aurait-il fallu faire, en plus, si la marchandise du carton endommagé avait été inutilisable ?",
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
# Le corrigé des QCM est écrit à côté de la trame, jamais dedans : l'espace enseignant du site
# l'affiche (onglet « Corrigés », champ `corrige` du `meta` de l'activité).
NOTIONS = [["Quand un client commande", "Module 1 et 2 — contrat de vente", "Le client et Spartoo concluent un contrat de vente : Spartoo s'engage à livrer, le client à payer."], ["Quel organisme protège", "Module 2 — protection des données personnelles, CNIL", "La CNIL (Commission nationale de l'informatique et des libertés) veille à la protection des données personnelles."], ["Après un achat sur Internet", "Module 2 — protection du consommateur", "Délai légal de rétractation de 14 jours pour un achat à distance (Code de la consommation)."], ["Pourquoi la loi protège", "Module 2 — asymétrie d'information", "À distance, le consommateur ne voit ni ne touche le produit : il est moins bien informé que le vendeur, la loi compense."], ["Spartoo signe un bon", "Module 1 — contrat, responsabilité contractuelle", "Un bon de livraison signé sans réserve est en général considéré comme la preuve d'une livraison conforme : se plaindre ensuite devient difficile."], ["Dans le contrat de vente entre", "Module 1 — droits et obligations", "L'obligation principale du vendeur est de livrer ce qui a été commandé ; celle de l'acheteur est de payer."], ["Le fournisseur livre moins", "Module 1 — inexécution du contrat", "Livrer moins que la quantité commandée est une inexécution du contrat (point de départ de la responsabilité contractuelle)."], ["Si le fournisseur ne répond pas", "Module 1 — responsabilité civile contractuelle, dommages-intérêts", "Les dommages-intérêts sont une somme d'argent qui répare le dommage causé par l'inexécution du contrat."]]
CODE_SEANCE, TITRE_SEANCE, FICHIER_TRAME = 'ENT-1.1', 'Spartoo — réceptionner une livraison', 'ENT-1.1-spartoo-reception-trame-eleve'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from corriges_data import ecrire_corrige
ecrire_corrige(CODE_SEANCE, TITRE_SEANCE, FICHIER_TRAME, ITEMS, CLES, NOTIONS,
               os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'contenus', 'corriges'), os.path.basename(__file__))
d.save(SORTIE)
print('logo :', 'repris' if os.path.exists(LOGO) else 'absent — emplacement réservé')
