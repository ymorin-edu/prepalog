# -*- coding: utf-8 -*-
"""Trame élève Spartoo — séance « réception ».

Mêmes règles de mise en page que la trame de préparation (fiche `prepalog-trames-eleve`) :
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
r = par.add_run("Carnet de suivi — Réceptionner une livraison")
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
        "il se complète étape par étape, au fil de la séance. Aujourd'hui, tu es au quai de réception de "
        "Spartoo : une livraison arrive, et c'est toi qui la contrôles. Le logiciel ne compte rien à ta place "
        "et ne corrige aucune erreur — ce que tu saisis entre vraiment dans le stock. Ton enseignant voit dans "
        "son suivi de classe si le travail est fait correctement.")

# ==================================================================== étape 1
etape(1, "Comprendre le contrôle à réception", saut=False)
p("Avant d'ouvrir le logiciel, il faut savoir ce qu'on va faire. Quand un camion se présente à l'entrepôt, le "
  "réceptionnaire ne se contente pas de signer : il contrôle. Fais une recherche sur Internet pour comprendre "
  "pourquoi.")
consignes([
 "Cherche « bon de livraison définition » puis « réserves à la livraison ».",
 "Regarde en particulier ce que dit le Code de commerce sur le délai pour émettre des réserves.",
 "Réponds aux questions ci-dessous avec ce que tu trouves.",
])
questions([
 "Qu'est-ce qu'un bon de livraison, et qui le rédige ?",
 "Que veut dire « émettre des réserves » à la réception d'une marchandise ?",
], lignes=2)
questions([
 "De combien de jours dispose-t-on, en général, pour confirmer ses réserves au transporteur ?",
], lignes=1)
questions([
 "À ton avis, que risque une entreprise qui signe un bon de livraison sans avoir compté ?",
], lignes=2)

# ==================================================================== étape 2
etape(2, "Lire la procédure de l'entreprise")
p("Connecte-toi à Prepalog, ouvre la rubrique Logisim puis l'activité « Spartoo — réception ». Tu arrives "
  "dans le logiciel de l'entreprise. Va dans Messagerie : M. Morin, ton responsable, t'a écrit.")
consignes([
 "Ouvre le message « Procédure de réception : à lire avant de décharger ».",
 "Lis-le en entier : les cinq règles qu'il donne sont celles que tu vas appliquer aujourd'hui.",
])
questions([
 "Pourquoi ne faut-il jamais signer un bon de livraison avant d'avoir compté ?",
 "Dans quels deux cas une ligne doit-elle être « acceptée sous réserve » ?",
 "Dans quel cas seulement peut-on refuser une ligne ?",
], lignes=2)
questions([
 "À quoi sert le numéro de lot, d'après M. Morin ?",
], lignes=2)
encadre('Retiens bien la règle :', "dès qu'il y a un écart de quantité OU un carton endommagé, la ligne est "
        "« acceptée sous réserve ». On l'entre quand même en stock, et on prévient le fournisseur le jour même.")

# ==================================================================== étape 3
etape(3, "Lire le bon de livraison")
p("Toujours dans la Messagerie, ouvre le message de Puma France : « Bon de livraison BL-77421 ». Le document "
  "est affiché sous le message. C'est ce que le fournisseur annonce avoir expédié — pas forcément ce qui est "
  "arrivé.")
p("Relève les informations du document :", taille=10.5, gras=True, avant=6)
tableau(['Information', 'Ce que tu relèves'], 5, [Cm(6.4), Cm(10.6)], hauteur=Cm(1.0))
p("Dans la colonne de gauche, écris : numéro du bon de livraison — date d'expédition — transporteur — "
  "numéro de lot — nombre total de paires annoncées.", taille=9.5, apres=8)
p("Recopie maintenant les lignes annoncées :", taille=10.5, gras=True, avant=6)
tableau(['Référence article', 'Article', 'Quantité annoncée'], 3, [Cm(5.4), Cm(7.6), Cm(4.0)], hauteur=Cm(1.15))
encadre('Le numéro de lot :', "note-le très soigneusement, avec ses tirets et sans espace. Tu devras le "
        "recopier à l'identique dans le logiciel, puis dans ton message au fournisseur.")

# ==================================================================== étape 4
etape(4, "Compter les colis sur le quai")
p("Le camion est déchargé. Va dans le menu Réceptions, ouvre la réception REC-04127 : tu vois la liste des "
  "colis réellement déposés, avec leur contenu et l'état du carton. Plusieurs colis peuvent contenir la même "
  "référence : c'est à toi de les additionner.")
consignes([
 "Repère, pour chaque référence, tous les colis qui la contiennent.",
 "Additionne les quantités pour obtenir la quantité réellement reçue.",
 "Note si l'un des cartons est endommagé.",
 "Compare avec la quantité annoncée sur le bon de livraison (étape 3).",
])
p("Fais ton comptage ici, avant de saisir quoi que ce soit dans le logiciel :", taille=10.5, gras=True, avant=6)
tableau(['Référence article', 'Colis concernés', 'Quantité comptée', 'Quantité annoncée', 'Écart'], 3,
        [Cm(4.4), Cm(3.4), Cm(3.0), Cm(3.0), Cm(3.2)], hauteur=Cm(1.2))
questions([
 "Sur quelle référence y a-t-il un écart, et de combien de paires ?",
 "Quelle référence est arrivée dans un carton endommagé ?",
], lignes=2)
questions([
 "Un carton endommagé veut-il forcément dire que la marchandise est abîmée ? Justifie.",
 "Pourquoi faut-il compter colis par colis, et pas se fier au total du bon de livraison ?",
], lignes=2)

# ==================================================================== étape 5
etape(5, "Remplir le bon de réception")
p("Tu vas maintenant saisir ton contrôle dans le logiciel, sur le bon de réception. Attention : le logiciel "
  "enregistre ce que tu écris, sans le corriger. Une quantité mal recopiée, et c'est ton stock qui sera faux.")
consignes([
 "Recopie le numéro de lot du bon de livraison dans le champ prévu, à l'identique.",
 "Pour chaque référence : la quantité annoncée (bon de livraison), la quantité comptée (ton comptage de "
 "l'étape 4), l'état des colis, puis ta décision.",
 "Applique la règle de M. Morin : écart de quantité ou carton endommagé → accepté sous réserve.",
 "Vérifie ta saisie ligne par ligne avant de valider : après validation, tu ne peux plus la modifier.",
])
p("Recopie ici ce que tu as saisi :", taille=10.5, gras=True, avant=6)
tableau(['Référence article', 'Annoncé', 'Compté', 'État des colis', 'Décision'], 3,
        [Cm(4.4), Cm(2.2), Cm(2.2), Cm(4.0), Cm(4.2)], hauteur=Cm(1.2))
questions([
 "Pourquoi accepte-t-on quand même une ligne à laquelle il manque des paires, au lieu de tout refuser ?",
 "Que se passerait-il, pour l'inventaire, si tu saisissais la quantité annoncée au lieu de la quantité comptée ?",
], lignes=2)

# ==================================================================== étape 6
etape(6, "Valider et vérifier dans la base")
p("Clique sur « Valider la réception ». Les quantités acceptées entrent en stock, avec leur numéro de lot. "
  "Un professionnel ne s'arrête pas là : il vérifie que sa saisie a bien produit ce qu'il attendait.")
consignes([
 "Va dans la Console.",
 "Tape .movements pour voir les derniers mouvements de stock.",
 "Tape .getstock suivi d'une des références réceptionnées.",
 "Tape .getlot suivi du numéro de lot : tu vois tout ce qui concerne ce lot.",
])
questions([
 "Combien de paires, au total, sont entrées en stock avec ce lot ?",
 "Quel type de mouvement apparaît dans .movements pour ces entrées ?",
 "Quel fournisseur .getlot associe-t-il à ce lot ?",
], lignes=1)
questions([
 "Pour l'instant, la ligne « Sorties » de .getlot est vide. Explique pourquoi.",
 "En quoi le numéro de lot sera-t-il utile si, dans un mois, le fournisseur signale un défaut de fabrication ?",
], lignes=2)
encadre('Ce que tu viens de faire :', "tu as créé toi-même les entrées de stock de ton entrepôt. Lors des "
        "prochaines séances, tu prépareras des commandes avec ces paires, puis tu devras retrouver d'où elles "
        "viennent. Tout part de la saisie que tu viens de faire.")

# ==================================================================== étape 7
etape(7, "Signaler les réserves au fournisseur")
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
questions(["Brouillon de ton message à Puma :"], lignes=7)
questions([
 "Pourquoi faut-il écrire au fournisseur le jour même, et pas la semaine suivante ?",
 "Quelles informations un fournisseur a-t-il besoin de recevoir pour traiter une réserve ?",
 "Qu'aurait-il fallu faire, en plus, si la marchandise du carton endommagé avait été inutilisable ?",
], lignes=2)

SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      '..', 'contenus', 'trames', 'spartoo-reception-trame-eleve.docx')
d.save(SORTIE)
print('logo :', 'repris' if os.path.exists(LOGO) else 'absent — emplacement réservé')
