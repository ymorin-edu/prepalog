# -*- coding: utf-8 -*-
"""Trame élève Spartoo — séance « traçabilité ».

Mêmes règles de mise en page que les deux autres trames (fiche `prepalog-trames-eleve`) :
en-tête sur la première page seule, de la place pour écrire, un saut de page entre les
étapes, jamais de coupure juste après une consigne, on commence hors de l'outil, et tout
jalon contrôlé automatiquement est annoncé à l'élève.
"""
import os
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
LOGO_PREPALOG = os.path.join(RACINE, 'styles', 'logo.png')

d = Document()
st = d.styles['Normal']
st.font.name = 'Calibri'; st.font.size = Pt(11); st.font.color.rgb = ENCRE
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Calibri')
st.paragraph_format.space_after = Pt(6); st.paragraph_format.line_spacing = 1.08
for s in d.sections:
    s.top_margin = Cm(1.2); s.bottom_margin = Cm(1.3)
    s.left_margin = s.right_margin = Cm(1.9)

def colle_au_suivant():
    """Empêche une coupure de page juste après la dernière ligne écrite.

    Une consigne ou une phrase d'introduction ne doit jamais finir une page alors que
    le tableau qu'elle annonce commence la suivante : l'élève lit « Rédige ton brouillon
    ici » et n'a rien sous les yeux. On marque donc le dernier paragraphe — et l'espaceur
    vide qui le précède éventuellement — pour qu'ils descendent avec le tableau.
    """
    pars = d.paragraphs
    if not pars:
        return
    pars[-1].paragraph_format.keep_with_next = True
    if not pars[-1].text.strip() and len(pars) > 1:
        pars[-2].paragraph_format.keep_with_next = True

def ombre(cell, hexa):
    sh = OxmlElement('w:shd'); sh.set(qn('w:fill'), hexa); cell._tc.get_or_add_tcPr().append(sh)

def p(texte='', taille=11, gras=False, couleur=None, avant=0, apres=6):
    par = d.add_paragraph(); par.paragraph_format.space_before = Pt(avant); par.paragraph_format.space_after = Pt(apres)
    r = par.add_run(texte); r.bold = gras; r.font.size = Pt(taille); r.font.color.rgb = couleur or ENCRE
    return par

def etape(num, titre, saut=True):
    """`saut=False` quand l'étape est assez courte pour tenir avec la précédente."""
    par = d.add_paragraph()
    if saut:
        par.add_run().add_break(WD_BREAK.PAGE)
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
    par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(0)
    r = par.add_run(titre + ' '); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
    r2 = par.add_run(texte); r2.font.size = Pt(10)
    d.add_paragraph().paragraph_format.space_after = Pt(2)

def questions(liste, lignes=2):
    colle_au_suivant()
    """Une question par bloc, avec `lignes` lignes vides pour la réponse."""
    t = d.add_table(rows=0, cols=1); t.style = 'Table Grid'
    for q in liste:
        row = t.add_row(); c = row.cells[0]; ombre(c, 'FAFAFA')
        par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(4)
        r = par.add_run(q); r.font.size = Pt(10.5); r.bold = True
        for _ in range(lignes):
            rep = c.add_paragraph()
            rep.paragraph_format.space_before = Pt(0); rep.paragraph_format.space_after = Pt(4)
            rep.add_run('').font.size = Pt(11)
        row.height = Cm(0.8 + 0.72 * lignes)
    vide = d.add_paragraph(); vide.paragraph_format.space_after = Pt(0)
    vide.add_run('').font.size = Pt(5)

def tableau(entetes, nlignes, largeurs=None, hauteur=Cm(1.15)):
    colle_au_suivant()
    t = d.add_table(rows=1, cols=len(entetes)); t.style = 'Table Grid'
    for i, h in enumerate(entetes):
        c = t.rows[0].cells[i]; ombre(c, 'E8E8E8')
        par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(0)
        r = par.add_run(h); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
    for _ in range(nlignes):
        t.add_row().height = hauteur
    if largeurs:
        for row in t.rows:
            for i, w in enumerate(largeurs): row.cells[i].width = w
    d.add_paragraph().paragraph_format.space_after = Pt(2)


# ==================================================================== en-tête
from docx.enum.text import WD_TAB_ALIGNMENT
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
    r = par.add_run('SPARTOO'); r.bold = True; r.font.size = Pt(15); r.font.color.rgb = TITRE

par = d.add_paragraph(); par.paragraph_format.space_after = Pt(0)
r = par.add_run("Carnet de suivi — Remonter la trace d'un lot")
r.bold = True; r.font.size = Pt(18); r.font.color.rgb = TITRE

d.add_paragraph().paragraph_format.space_after = Pt(6)

t = d.add_table(rows=3, cols=4); t.style = 'Table Grid'
for lib, li, co in [('Nom',0,0), ('Prénom',0,2), ('Classe',1,0), ('Date',1,2), ('Matricule Prepalog',2,0)]:
    c = t.rows[li].cells[co]; ombre(c, 'E8E8E8')
    par = c.paragraphs[0]; par.paragraph_format.space_after = Pt(0)
    r = par.add_run(lib); r.bold = True; r.font.size = Pt(10); r.font.color.rgb = TITRE
for row in t.rows: row.height = Cm(0.82)
d.add_paragraph().paragraph_format.space_after = Pt(4)

encadre('Ce document est ta trame de travail :',
        "il se complète étape par étape, au fil de la séance. Aujourd'hui, le fournisseur signale un défaut de "
        "fabrication sur un lot que tu as reçu. Tu dois retrouver où sont parties les paires de ce lot, bloquer "
        "celles qui restent, et rendre compte par écrit. Ton enseignant voit dans son suivi de classe si le "
        "travail est fait correctement.")

# ==================================================================== étape 1
etape(1, "Comprendre la traçabilité", saut=False)
p("Avant d'ouvrir le logiciel, il faut savoir de quoi on parle. Quand un industriel découvre un défaut, il ne "
  "rappelle pas toute sa production : il rappelle un lot. Fais une recherche sur Internet pour comprendre "
  "comment c'est possible.")
consignes([
 "Cherche « traçabilité logistique définition » puis « numéro de lot à quoi ça sert ».",
 "Cherche ensuite un exemple réel de rappel de produit (le site RappelConso en présente beaucoup).",
 "Réponds aux questions ci-dessous avec ce que tu trouves.",
])
questions([
 "Qu'est-ce qu'un numéro de lot, et qui l'attribue ?",
 "Que veut dire « tracer » un produit en logistique ?",
], lignes=2)
questions([
 "Dans un rappel de produit que tu as trouvé, quelles informations l'entreprise donne-t-elle au client ?",
], lignes=2)
questions([
 "Une entreprise qui ne sait pas dans quel lot était un article : que doit-elle faire en cas de défaut ? Pourquoi "
 "cela lui coûte-t-il beaucoup plus cher ?",
], lignes=2)

# ==================================================================== étape 2
etape(2, "Lire l'alerte du fournisseur et la consigne")
p("Connecte-toi à Prepalog, ouvre la rubrique Logisim puis l'activité « Spartoo — traçabilité ». Va dans "
  "Messagerie : deux messages t'attendent. Lis-les tous les deux avant de toucher à quoi que ce soit.")
consignes([
 "Ouvre le message de Puma : « URGENT — rappel qualité sur le lot… ».",
 "Ouvre ensuite le message de M. Morin : c'est lui qui dit ce que tu dois faire, et dans quel ordre.",
])
p("Relève les informations de l'alerte :", taille=10.5, gras=True, avant=6)
tableau(['Information', 'Ce que tu relèves'], 4, [Cm(6.4), Cm(10.6)], hauteur=Cm(1.0))
p("Dans la colonne de gauche, écris : numéro du lot en cause — nature du défaut — ce que Puma demande — "
  "qui a envoyé l'alerte.", taille=9.5, apres=8)
questions([
 "Le défaut est-il visible à l'œil nu ? Quelle conséquence cela a-t-il pour le contrôle en entrepôt ?",
 "Puma écrit que les paires de la même référence venues d'autres livraisons ne sont pas en cause. Explique "
 "pourquoi, avec tes mots.",
], lignes=2)

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
tableau(['Information', 'Ce que tu relèves'], 5, [Cm(6.4), Cm(10.6)], hauteur=Cm(1.0))
p("Dans la colonne de gauche, écris : numéro de lot — fournisseur — date d'entrée en stock — numéro de "
  "réception — nombre total de paires entrées.", taille=9.5, apres=8)
p("Recopie maintenant le détail des entrées :", taille=10.5, gras=True, avant=6)
tableau(['Référence article', 'Article', 'Quantité entrée'], 3, [Cm(5.4), Cm(7.6), Cm(4.0)], hauteur=Cm(1.15))
encadre('Attention à la date :', "tu devras la recopier dans ton compte rendu de l'étape 7, écrite au format "
        "jj/mm/aaaa, par exemple 14/03/2026. Note-la dès maintenant, telle qu'elle s'affiche.")

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
questions([
 "Combien de clients différents ont reçu des paires de ce lot ?",
 "Sans le numéro de lot, aurait-on pu savoir lesquels ? Explique ce qu'on aurait été obligé de faire.",
], lignes=2)

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
questions([
 "Compare le stock total d'une de ces références (.getstock suivi de la référence) avec ce qu'il reste du lot. "
 "Pourquoi les deux nombres sont-ils différents ?",
], lignes=2)
questions([
 "Que se passerait-il si tu bloquais le stock total de la référence au lieu du reste du lot ?",
], lignes=2)

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
consignes([
 "Quand tout est bloqué, retourne dans la Console et tape à nouveau .getlot suivi du numéro de lot.",
])
questions([
 "Que vaut maintenant le « Reste en stock » du lot ?",
 "Quel type de mouvement apparaît dans le tableau des sorties, à côté des ventes ?",
], lignes=1)
questions([
 "À quoi sert le motif, plusieurs mois plus tard, quand quelqu'un relit l'historique des mouvements ?",
], lignes=2)

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
questions(["Brouillon de ton compte rendu à M. Morin :"], lignes=8)
questions([
 "Pourquoi le compte rendu doit-il donner les numéros de commande, et pas seulement les noms des clients ?",
 "Que devra faire Spartoo si un client rapporte une paire du lot ? Cite deux actions.",
], lignes=2)

SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      '..', 'contenus', 'trames', 'spartoo-tracabilite-trame-eleve.docx')
d.save(SORTIE)
print('logo :', 'repris' if os.path.exists(LOGO) else 'absent — emplacement réservé')
