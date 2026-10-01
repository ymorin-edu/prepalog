# -*- coding: utf-8 -*-
"""Trame élève Spartoo — générateur.

Règles de mise en page, arrêtées le 30/09/2026 (fiche `logisim`) :
  1. le logo de l'entreprise en en-tête ;
  2. de la place pour écrire — l'élève répond au stylo ou au clavier ;
  3. un saut de page entre les étapes, sauf quand deux étapes tiennent sur la même page.
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
# En-tête : une ligne de rappel avec le logo poussé à droite par une tabulation, puis le
# titre sur toute la largeur. Un tableau à deux colonnes marchait mal — LibreOffice
# n'honorait pas les largeurs et le titre se coupait en deux.
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
    # Pas de logo fourni : on met le nom en attendant, plutôt que d'inventer une marque.
    r = par.add_run('SPARTOO'); r.bold = True; r.font.size = Pt(15); r.font.color.rgb = TITRE

par = d.add_paragraph(); par.paragraph_format.space_after = Pt(0)
r = par.add_run("Carnet de suivi — Étapes de la prise en main")
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
        "il se complète étape par étape, au fil de la séance. Garde-le sous les yeux pendant que tu travailles, "
        "et note ce que tu trouves à chaque étape. Ton enseignant peut voir, dans son suivi de classe, si le "
        "travail demandé à chaque étape est fait correctement — pense donc à bien suivre les consignes "
        "(par exemple : écrire clairement un nombre dans un message si on te le demande).")

# ==================================================================== étape 1
etape(1, "Découvrir l'entreprise Spartoo", saut=False)
p("Spartoo, l'entreprise dont Prepalog reprend le nom et l'activité, existe réellement : c'est un vrai site "
  "marchand français de vente de chaussures en ligne. Avant même d'ouvrir l'outil, fais une recherche sur "
  "Internet pour découvrir qui elle est.")
consignes([
 "Ouvre un moteur de recherche et tape « Spartoo entreprise ».",
 "Regarde en particulier sa fiche Wikipédia ou un article de presse économique.",
 "Réponds aux questions ci-dessous avec ce que tu trouves.",
])
questions([
 "En quelle année Spartoo a-t-elle été créée ?",
 "Dans quelle ville se trouve son siège social ?",
 "Quel est le nom de son fondateur ?",
], lignes=1)
questions([
 "Quelle est son activité principale (que vend-elle, et à qui) ?",
 "Dans combien de pays environ le site est-il présent ?",
], lignes=2)

# ==================================================================== étape 2
etape(2, "Ouvrir ton environnement de travail")
p("Maintenant que tu sais ce qu'est Spartoo, tu vas ouvrir l'environnement qui en reprend l'activité.")
encadre('Attention :', "dans l'outil, tu retrouveras le nom Spartoo mais avec des données fictives (produits, "
        "stocks, clients, fournisseurs) : c'est un entraînement, pas le vrai site.")
consignes([
 "Ouvre un navigateur internet (Chrome, Edge…).",
 "Va sur Prepalog et saisis ton matricule et ton code (ceux que ton enseignant t'a donnés, "
 "le même matricule que celui noté en première page).",
 "Clique sur « Entrer ».",
 "Sur la page d'accueil, clique sur la pastille « Logisim », puis choisis l'entreprise « Spartoo ».",
])
encadre('Garde bien ton matricule :', "c'est lui qui permet à ton enseignant de retrouver ton travail. "
        "Ta base est personnelle : ce que tu fais n'apparaît pas chez tes camarades, et inversement.")
p("Observe l'écran d'accueil avant d'aller plus loin :", taille=10.5, gras=True, avant=8)
questions([
 "Combien de messages non lus t'attendent en arrivant ?",
 "Combien de paires y a-t-il en stock au total ?",
 "Combien de références sont en rupture ?",
], lignes=1)

# ==================================================================== étape 3
etape(3, "Repérer les fournisseurs et les clients")
p("Va dans la rubrique Clients / Fournisseurs. Elle contient deux onglets.")
soustitre('Les fournisseurs')
p("Ouvre l'onglet Fournisseurs. Ce sont les marques de chaussures qui livrent Spartoo (des vraies marques, "
  "mais avec des coordonnées fictives).", taille=10.5)
questions(["Combien de fournisseurs sont référencés ?"], lignes=1)
questions([
 "Cite 3 marques fournisseurs et leur code (ex. F001) :",
 "Pour un de ces fournisseurs, quel est son délai de livraison et son minimum de commande ?",
], lignes=2)
soustitre('Les clients')
p("Ouvre l'onglet Clients.", taille=10.5)
questions([
 "Les clients de Spartoo sont-ils des entreprises ou des particuliers ? Justifie.",
 "Cite 2 clients avec leur code, leur nom et leur ville :",
], lignes=2)

# ==================================================================== étape 4
etape(4, "Comprendre la console et la commande .help")
p("La console permet d'interroger et de modifier la base avec des commandes qui commencent toujours par un "
  "point. Les références ne sont pas sensibles à la casse (majuscules/minuscules).")
consignes([
 "Va dans Console.",
 "Tape .help et appuie sur Entrée : la liste complète des commandes disponibles s'affiche.",
 "Observe bien la colonne de gauche (le nom exact de chaque commande) et la colonne de droite "
 "(ce qu'elle fait).",
])
questions(["Par quel caractère commence toujours une commande ?"], lignes=1)
p("Cite 3 commandes de la liste (par exemple .getstock) et explique en une phrase ce que fait chacune :",
  taille=10.5, gras=True, avant=6)
tableau(['Commande', "Ce qu'elle fait"], 3, [Cm(4.6), Cm(12.4)], hauteur=Cm(1.2))
p("Teste maintenant deux commandes sur la référence PM-SUE (le modèle Puma Suede Classic XXI) :",
  taille=10.5, gras=True, avant=6)
questions([
 ".getprice PM-SUE  →  quel est le prix de vente TTC ? et le prix d'achat HT ?",
 ".getsupplier Puma  →  quel est le délai de livraison de ce fournisseur ?",
], lignes=1)
encadre('Rassure-toi :', "si tu tapes une commande qui n'existe pas, ou si tu oublies le point, la console "
        "t'explique l'erreur et te propose de taper .help. N'hésite pas à essayer, tu ne peux rien casser !")

# ==================================================================== étape 5
etape(5, "Répondre à une question client sur le stock")
p("Léa Dubois, une cliente, a envoyé un message dans la messagerie de Spartoo. Ouvre-le dans la rubrique "
  "Messagerie, puis mène l'enquête toi-même pour pouvoir lui répondre.")
questions([
 "Quel est l'objet du message de Léa Dubois ?",
 "Que demande-t-elle exactement ?",
], lignes=2)
questions([
 "Quelle marque, quel modèle, quelle couleur et quelle pointure ?",
 "Quelle est la référence article complète correspondante ?",
 "Quelle commande de la console permet de connaître son stock ?",
 "Combien de paires sont disponibles ?",
], lignes=1)

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
p("Rédige d'abord ton brouillon ici, puis recopie-le dans la messagerie :", taille=10.5, gras=True, avant=6)
questions(["Brouillon de ta réponse à Léa Dubois :"], lignes=7)
questions(["Pourquoi ces attentes sont-elles importantes dans une entreprise ?"], lignes=2)
encadre('Attention :', "écris bien le nombre en chiffres dans ta réponse à Léa Dubois (par exemple « il nous "
        "reste 3 paires »). C'est ce nombre que ton enseignant retrouvera dans son suivi pour vérifier ton travail.")

# ==================================================================== étape 6
etape(6, "Traiter la commande CMD-048213")
p("Une nouvelle commande web vient d'arriver. Tu vas la traiter de bout en bout, comme dans un vrai entrepôt : "
  "l'enregistrer, contrôler le stock, préparer les articles, puis valider la sortie de stock.")
consignes([
 "Va dans Messagerie et ouvre le message « Nouvelle commande web n° CMD-048213 ».",
 "Clique sur « Enregistrer la commande », puis ouvre-la dans la rubrique Commandes.",
 "Pour chaque ligne, trouve toi-même dans la console les commandes qui donnent le stock réel et "
 "l'emplacement d'une référence (aide-toi de .help si besoin), puis remplis le stock trouvé, "
 "l'emplacement, la quantité à préparer et le statut. Il n'y a pas de bouton pour vérifier chaque "
 "ligne : c'est à toi d'être rigoureux.",
 "Une fois toutes les lignes remplies, édite le bon de préparation puis clique sur « Valider la préparation ».",
])
p("Recopie ici ce que tu as trouvé pour chaque ligne, avant de valider :", taille=10.5, gras=True, avant=6)
tableau(['Référence', 'Stock trouvé', 'Emplacement', 'À préparer', 'Statut'], 3,
        [Cm(4.6), Cm(2.6), Cm(3.2), Cm(2.6), Cm(4.0)], hauteur=Cm(1.2))
questions([
 "Combien de références (lignes) différentes compte cette commande ?",
], lignes=1)
questions([
 "Pour quelle ligne la quantité à préparer est-elle inférieure à la quantité commandée ? Pourquoi ?",
 "Que veut dire le statut « Rupture » pour une ligne ?",
], lignes=2)
coupe()
questions([
 "Que dois-tu faire lorsque tu es en rupture sur une ligne ?",
 "Qu'appelle-t-on un « reliquat » sur un bon de préparation ?",
 "Que se passe-t-il exactement dans le stock quand tu valides la préparation ?",
], lignes=2)
encadre('Une fois validé :', "ton enseignant voit automatiquement, dans son suivi de classe, que la commande a "
        "bien été traitée (et si elle est complète ou avec un reliquat).")

# ==================================================================== étape 7
etape(7, "Réapprovisionner un fournisseur")
p("La référence PM-SUE-NR-40 est en rupture depuis la commande précédente. Tu vas commander de nouvelles "
  "paires au fournisseur, en respectant deux règles : ne pas dépasser le stock maximum de chaque référence, "
  "et atteindre le minimum de commande imposé par le fournisseur.")
consignes([
 "Trouve, pour la référence PM-SUE-NR-40, le stock actuel, le seuil et le stock maximum "
 "(fiche produit ou console).",
 "Calcule la quantité à commander pour amener cette référence à son stock maximum.",
 "Va dans Clients / Fournisseurs, ouvre la fiche du fournisseur de cette référence et note son "
 "minimum de commande.",
 "Si la quantité calculée à l'étape 2 est inférieure à ce minimum, trouve une autre référence du même "
 "fournisseur qui a besoin d'être réapprovisionnée (regarde son stock par rapport à son seuil) et "
 "calcule, de la même façon, la quantité pour l'amener à son propre stock maximum.",
 "Dans Messagerie, clique sur « Nouveau message », choisis ce fournisseur comme destinataire, et écris "
 "un message précisant chaque référence et la quantité correspondante.",
 "Envoie le message : l'outil te répond automatiquement pour te dire si le minimum de commande est atteint.",
])
p("Note ici ton calcul :", taille=10.5, gras=True, avant=6)
tableau(['Référence', 'Stock actuel', 'Seuil', 'Stock maximum', 'Quantité à commander'], 3,
        [Cm(4.6), Cm(2.8), Cm(2.0), Cm(3.2), Cm(4.4)], hauteur=Cm(1.2))
questions([
 "Qu'est-ce que le « seuil » d'une référence ?",
 "Quelle est la différence entre le seuil et le stock maximum ?",
], lignes=2)
coupe()
questions([
 "Pourquoi une entreprise se fixe-t-elle un stock maximum, et pas seulement un seuil d'alerte ?",
 "Pourquoi un fournisseur impose-t-il un minimum de commande ?",
 "As-tu dû ajouter une deuxième référence pour atteindre ce minimum ? Laquelle, et pourquoi ?",
 "Dans la liste des destinataires, comment as-tu reconnu le bon fournisseur ?",
], lignes=2)
encadre("Si le minimum n'est pas atteint :", "le fournisseur te le dit dans sa réponse. Retourne dans "
        "Messagerie, clique sur « Nouveau message » et renvoie une commande complétée : ton enseignant verra "
        "dans son suivi si l'une de tes tentatives est correcte.")

SORTIE = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      '..', 'contenus', 'trames', 'spartoo-trame-eleve.docx')
d.save(SORTIE)
print('logo :', 'repris' if os.path.exists(LOGO) else 'absent — emplacement réservé')
