# -*- coding: utf-8 -*-
"""Trames élève d'ENT-8.1 et ENT-8.2 Action (CAP OL) — Cowork, 15/10/2026.

Format COURT (règle de Tristan du 07/10/2026, depuis France Boissons) : pas de texte à trous, pas de corrigé de trame.
La trame sert de page de connexion, de brouillon pour l'étape difficile et de cours à garder (briefs ENT-8.1 et ENT-8.2, §9).
Mise en page en noir et gris (Tristan imprime en noir et blanc) ; seuls les logos portent la couleur.

  Le cours est une feuille à part (page impaire) : il se distribue À LA FIN de la séance (il donne des réponses).
  ENT-8.1 : p. 1 connexion + mission + déroulé · p. 3 cours (la chaîne, Action et Geodis, régions et départements + carte muette,
            ce que change ton travail, lexique).
  ENT-8.2 : p. 1 connexion + mission + déroulé · p. 2 brouillon (planigramme vierge, notes du compte rendu) · p. 3 cours (zones,
            équipe, trois documents, rendre compte, lexique).

Textes repris du code livré le 15/10/2026 au soir (`contenus/action.js` : LEXIQUE, EQUIPE, MENTION ; `contenus/action-ent81-donnees.js` :
CHAINE ; `contenus/action-ent82.js` : QUAIS, ECHELLE, VISITE, CHOIX_DOCS) : si le code change, recaler ici (constantes en tête).
Aucune valeur tirée (heure du camion, quai, n° de commande) n'est imprimée : elles varient par élève ou se lisent à l'écran.

Images (carte muette, schéma de la chaîne) : DESSINÉES par ce script avec matplotlib (aucun fichier binaire versionné en plus) ;
contours lus dans `contenus/france-contours.js` (IGN Admin Express, Licence Ouverte, mention imprimée sous la carte).

Lancer : python3 outils/trame-action.py
puis    soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/ENT-8.1-action-se-situer-trame-eleve.docx
        soffice --headless --convert-to pdf --outdir contenus/trames contenus/trames/ENT-8.2-action-prise-de-poste-trame-eleve.docx
(python-docx, matplotlib ; Pillow pour le logo.)
"""
import os, sys, json, re, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import trame_commun as T
from docx.shared import Cm, Pt
from docx.enum.text import WD_TAB_ALIGNMENT, WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

LOGO = os.path.join(T.RACINE, 'contenus', 'trames', 'logos', 'action.png')
CONTOURS = os.path.join(T.RACINE, 'contenus', 'france-contours.js')
TMP = tempfile.mkdtemp(prefix='trame-action-')

# ------------------------------------------------------------------ repris du code (15/10/2026)
MENTION = ("Réels : Action (magasins à petits prix), Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action), "
           "le port du Havre. Construits pour l’exercice : Samia, Kevin et Julie, le trajet du Havre à Ensuès puis au magasin de Nîmes, "
           "les documents.")
CHAINE = ['l’usine,\nen Asie', 'le bateau', 'le hub d’import\ndu Havre', 'l’entrepôt\nd’Ensuès-la-\nRedonne', 'le magasin\nAction de\nNîmes', 'le client']
ICI_DANS_CHAINE = 3
LEX = {   # contenus/action.js, LEXIQUE (et LEXIQUE_82 pour cariste, cheffe d'équipe)
    'chaîne logistique': 'Tout le chemin d’un produit, de l’usine jusqu’au client : transports, entrepôts, magasin.',
    'entrepôt': 'Grand bâtiment où l’on range les produits et où l’on prépare les commandes avant de les envoyer aux magasins.',
    'hub d’import': 'Grand site où arrivent les produits venus de l’étranger, avant d’être envoyés vers les entrepôts.',
    'prestataire': 'Entreprise qui fait un travail pour le compte d’une autre. Geodis est le prestataire d’Action : elle fait tourner l’entrepôt, les produits restent à Action.',
    'enseigne': 'Le nom sous lequel un commerce est connu. Tous les magasins Action ont la même enseigne.',
    'région': 'Grande partie de la France. Chaque région est découpée en départements.',
    'département': 'Partie d’une région, avec un numéro. Il contient des villes et des villages.',
    'tutrice / tuteur': 'Personne de l’entreprise qui t’accueille pendant ton stage, te donne les consignes et suit ton travail.',
    'quai': 'Endroit de l’entrepôt où les camions se garent pour être chargés ou déchargés.',
    'planigramme': 'Tableau qui montre quel camion arrive, à quelle heure et à quel quai.',
    'créneau': 'Heure et quai réservés pour un camion.',
    'zone litiges': 'Endroit où l’on met de côté la marchandise qui pose problème (abîmée, en trop, pas commandée).',
    'EPI': 'Équipement de protection individuelle : chaussures de sécurité, gilet haute visibilité, gants…',
    'WMS': 'Logiciel de l’entrepôt qui sait où est chaque produit et ce qu’il faut en faire.',
    'niveleur': 'Plaque au bord du quai qui fait le pont entre le quai et le camion, pour passer avec l’engin.',
    'transpalette': 'Petit engin à deux fourches qui sert à déplacer une palette au sol.',
    'rendre compte': 'Dire à son chef ce qu’on a fait ou vu.',
}
QUAIS = ['Quai 1', 'Quai 2', 'Quai 3', 'Quai 4']
DEBUT, FIN = 6 * 60, 12 * 60          # ECHELLE 06:00 → 12:00, une case = une demi-heure
ZONES = [  # VISITE, parcours (ordre du tour de Samia)
    ('1', 'Vestiaire et EPI', 'On s’équipe : chaussures de sécurité, gilet, gants. Personne n’entre sur le quai sans.'),
    ('2', 'Les quais', 'Les camions se mettent à quai. Le cariste les décharge au chariot.'),
    ('3', 'Zone de réception', 'Les palettes déchargées attendent. Le réceptionnaire vérifie le bon de livraison.'),
    ('4', 'Zone de contrôle', 'On compte les cartons et on regarde leur état avant de les ranger.'),
    ('5', 'Zone litiges', 'Ce qui pose problème (abîmé, en trop, pas commandé) est mis de côté, avec une étiquette.'),
    ('6', 'Bureau de la réception', 'La cheffe d’équipe organise et décide ; l’agent administratif tient le planigramme et le WMS.'),
]


# ------------------------------------------------------------------ petites briques de mise en page
def largeurs(t, cm):
    """Largeurs de colonnes lues aussi par LibreOffice (tblGrid + chaque cellule)."""
    t.autofit = False
    grid = t._tbl.tblGrid
    for i, g in enumerate(grid.findall(qn('w:gridCol'))):
        g.set(qn('w:w'), str(int(cm[i] * 567)))
    for row in t.rows:
        for i, w in enumerate(cm): row.cells[i].width = Cm(w)


def bordures(t, couleur='808080', taille=6):
    tblPr = t._tbl.tblPr
    b = OxmlElement('w:tblBorders')
    for cote in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        e = OxmlElement(f'w:{cote}'); e.set(qn('w:val'), 'single'); e.set(qn('w:sz'), str(taille)); e.set(qn('w:color'), couleur)
        b.append(e)
    tblPr.append(b)


def logos_et_titre(code, titre, sous):
    par = T.d.add_paragraph(); par.paragraph_format.space_after = Pt(2)
    par.paragraph_format.tab_stops.add_tab_stop(Cm(17.2), WD_TAB_ALIGNMENT.RIGHT)
    par.add_run().add_picture(T.LOGO_SIMULOG, height=Cm(1.3))
    par.add_run('\t')
    par.add_run().add_picture(LOGO, height=Cm(1.0))
    par = T.d.add_paragraph(); par.paragraph_format.space_before = Pt(6); par.paragraph_format.space_after = Pt(0)
    r = par.add_run(code + ' — '); r.bold = True; r.font.size = Pt(16); r.font.color.rgb = T.GRIS
    r = par.add_run(titre.replace(' ?', '\u00a0?')); r.bold = True; r.font.size = Pt(16); r.font.color.rgb = T.TITRE
    T.p(sous, taille=10.5, couleur=T.GRIS, apres=8)


def identite():
    t = T.d.add_table(rows=2, cols=4); t.style = 'Table Grid'
    for lib, li, co in [('Nom', 0, 0), ('Prénom', 0, 2), ('Classe', 1, 0), ('Date', 1, 2)]:
        c = t.rows[li].cells[co]; T.ombre(c, 'E8E8E8')
        q = c.paragraphs[0]; q.paragraph_format.space_after = Pt(0)
        r = q.add_run(lib); r.bold = True; r.font.size = Pt(10.5)
    for row in t.rows: row.height = Cm(0.85)
    T.d.add_paragraph().paragraph_format.space_after = Pt(0)


def connexion(code, nom_seance):
    T.soustitre('1. Je me connecte')
    T.consignes([
        'J’ouvre le site Prepalog (adresse donnée par mon professeur).',
        'J’écris mon matricule et mon mot de passe, puis je me connecte.',
        'Je clique la pastille « Simulog ».',
        'Je clique le logo d’Action.',
        f'J’ouvre la séance « {code} — {nom_seance} ».',
    ])
    t = T.d.add_table(rows=1, cols=2); t.style = 'Table Grid'
    for i, lib in enumerate(['Mon matricule :', 'Mon mot de passe : je le garde pour moi, je ne l’écris pas ici.']):
        c = t.rows[0].cells[i]
        q = c.paragraphs[0]; q.paragraph_format.space_after = Pt(0)
        r = q.add_run(lib); r.bold = i == 0; r.font.size = Pt(10.5)
        if i: r.font.color.rgb = T.GRIS
    t.rows[0].height = Cm(1.2)
    largeurs(t, [8.6, 8.6])
    T.d.add_paragraph().paragraph_format.space_after = Pt(2)


def deroule(etapes):
    T.soustitre('3. Ce que je vais faire, dans l’ordre')
    T.p('Je coche chaque étape quand elle est finie.', taille=10, couleur=T.GRIS, apres=4)
    t = T.d.add_table(rows=1, cols=3); t.style = 'Table Grid'
    for i, h in enumerate(['Fait', 'Étape', 'Où, à l’écran ?']):
        c = t.rows[0].cells[i]; T.ombre(c, 'E8E8E8')
        q = c.paragraphs[0]; q.paragraph_format.space_after = Pt(0)
        r = q.add_run(h); r.bold = True; r.font.size = Pt(10)
    for e, ou in etapes:
        row = t.add_row(); row.height = Cm(0.85)
        for i, txt in enumerate(['☐', e, ou]):
            q = row.cells[i].paragraphs[0]; q.paragraph_format.space_after = Pt(0)
            r = q.add_run(txt); r.font.size = Pt(14 if i == 0 else 10.5)
            if i == 0: q.alignment = WD_ALIGN_PARAGRAPH.CENTER
    largeurs(t, [1.3, 9.4, 6.5])
    T.d.add_paragraph().paragraph_format.space_after = Pt(2)


def puces(items):
    for it in items:
        q = T.d.add_paragraph(); q.paragraph_format.space_after = Pt(2)
        q.paragraph_format.left_indent = Cm(0.6); q.paragraph_format.first_line_indent = Cm(-0.4)
        q.add_run('\u2022  ' + it).font.size = Pt(10.5)


def page_cours(code, titre):
    # Le cours est une FEUILLE À PART (section « page impaire » : en recto-verso, il ne s'imprime jamais au dos de la page de
    # connexion ou du brouillon). Il donne des réponses de la séance (la chaîne, qui fait quoi, les documents) : il se distribue
    # à la fin de la séance, pas avant.
    from docx.enum.section import WD_SECTION
    s = T.d.add_section(WD_SECTION.ODD_PAGE)
    s.top_margin = Cm(1.2); s.bottom_margin = Cm(1.3); s.left_margin = s.right_margin = Cm(1.9)
    par = T.d.add_paragraph(); par.paragraph_format.space_after = Pt(0)
    r = par.add_run('COURS — DISTRIBUÉ À LA FIN DE LA SÉANCE — À GARDER DANS MON CLASSEUR'); r.bold = True; r.font.size = Pt(9.5); r.font.color.rgb = T.GRIS
    r.font.name = 'Consolas'
    par = T.d.add_paragraph(); par.paragraph_format.space_after = Pt(6)
    r = par.add_run(f'{code} — {titre}'); r.bold = True; r.font.size = Pt(15); r.font.color.rgb = T.TITRE


def lexique(mots, largeur_mot=3.6):
    T.soustitre('Les mots du métier')
    t = T.d.add_table(rows=0, cols=2); t.style = 'Table Grid'
    for m in mots:
        row = t.add_row()
        row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
        q = row.cells[0].paragraphs[0]; q.paragraph_format.space_after = Pt(0)
        r = q.add_run(m); r.bold = True; r.font.size = Pt(10)
        q = row.cells[1].paragraphs[0]; q.paragraph_format.space_after = Pt(0)
        q.add_run(LEX[m]).font.size = Pt(10)
    largeurs(t, [largeur_mot, 17.2 - largeur_mot])


def image(chemin, largeur, legende=None):
    par = T.d.add_paragraph(); par.alignment = WD_ALIGN_PARAGRAPH.CENTER; par.paragraph_format.space_after = Pt(0)
    par.add_run().add_picture(chemin, width=Cm(largeur))
    if legende:
        q = T.d.add_paragraph(); q.alignment = WD_ALIGN_PARAGRAPH.CENTER; q.paragraph_format.space_after = Pt(4)
        r = q.add_run(legende); r.font.size = Pt(8); r.font.color.rgb = T.GRIS


def finir(nom):
    sortie = os.path.join(T.RACINE, 'contenus', 'trames', nom + '.docx')
    for t in T.d.element.body.iter(qn('w:t')):
        if t.text and ('« ' in t.text or ' »' in t.text):
            t.text = t.text.replace('« ', '« ').replace(' »', ' »')
    # Propriétés fixes : le .docx ne change pas d'une génération à l'autre pour rien (alerte 11).
    cp = T.d.core_properties
    cp.author = 'Prepalog'; cp.last_modified_by = 'Prepalog'; cp.title = nom; cp.revision = 1
    import datetime
    cp.created = cp.modified = datetime.datetime(2026, 10, 15, 22, 0, 0)
    T.d.save(sortie)
    print('trame :', sortie)


# ------------------------------------------------------------------ images dessinées
def segments(d):
    """Le tracé « M x y l dx dy … z » (relatif, entier) → liste de polygones [(x, y), …]."""
    polys, cur, x, y = [], None, 0, 0
    for cmd, a, b in re.findall(r'([MlLz])\s*(-?\d*)\s*(-?\d*)', d):
        if cmd == 'M':
            x, y = int(a), int(b); cur = [(x, y)]; polys.append(cur)
        elif cmd == 'l':
            x += int(a); y += int(b); cur.append((x, y))
        elif cmd == 'L':
            x, y = int(a), int(b); cur.append((x, y))
        elif cmd == 'z' and cur:
            cur.append(cur[0])
    return polys


def carte_muette():
    s = open(CONTOURS, encoding='utf-8').read()
    i = s.index('export const FRANCE'); F = json.loads(s[s.index('{', i):s.rindex('}') + 1])
    fig, ax = plt.subplots(figsize=(5.2, 5.2 * F['h'] / F['w']), dpi=300)
    for dep in F['deps']:
        for poly in segments(dep['d']):
            xs, ys = zip(*poly); ax.plot(xs, ys, color='#9a9a9a', lw=0.35, solid_joinstyle='round')
    for reg in F['regions']:
        for poly in segments(reg['d']):
            xs, ys = zip(*poly); ax.plot(xs, ys, color='#111111', lw=1.1, solid_joinstyle='round')
    ax.set_xlim(-200, F['w'] + 200); ax.set_ylim(F['h'] + 200, -200)
    ax.set_aspect('equal'); ax.axis('off')
    sortie = os.path.join(TMP, 'carte-muette.png')
    fig.savefig(sortie, bbox_inches='tight', pad_inches=0.02, facecolor='white'); plt.close(fig)
    return sortie


def schema_chaine():
    fig, ax = plt.subplots(figsize=(7.0, 1.4), dpi=300)
    n, w, gap = len(CHAINE), 1.08, 0.24
    for k, txt in enumerate(CHAINE):
        x = k * (w + gap)
        ici = k == ICI_DANS_CHAINE
        ax.add_patch(FancyBboxPatch((x, 0.18), w, 0.82, boxstyle='round,pad=0.02,rounding_size=0.06',
                                    fc='#e6e6e6' if ici else 'white', ec='#111111', lw=2.2 if ici else 1.0))
        ax.text(x + w / 2, 0.59, txt, ha='center', va='center', fontsize=7.0, color='#111111',
                fontweight='bold' if ici else 'normal', linespacing=1.05)
        ax.text(x + w / 2, 1.1, str(k + 1), ha='center', va='bottom', fontsize=7, color='#555555', fontweight='bold')
        if k < n - 1:
            ax.annotate('', xy=(x + w + gap - 0.03, 0.59), xytext=(x + w + 0.03, 0.59),
                        arrowprops=dict(arrowstyle='-|>', color='#111111', lw=1.1, mutation_scale=9))
    xi = ICI_DANS_CHAINE * (w + gap) + w / 2
    ax.text(xi, 0.0, 'je suis en stage ici', ha='center', va='center', fontsize=7.2, style='italic', color='#111111')
    ax.set_xlim(-0.05, n * (w + gap) - gap + 0.05); ax.set_ylim(-0.12, 1.32); ax.axis('off')
    sortie = os.path.join(TMP, 'chaine.png')
    fig.savefig(sortie, bbox_inches='tight', pad_inches=0.02, facecolor='white'); plt.close(fig)
    return sortie


# ================================================================== ENT-8.1
def trame_81():
    T.nouveau()
    logos_et_titre('ENT-8.1', 'Action : d’où viennent les produits du magasin de Nîmes ?',
                   'Lundi 8 novembre, 8 h. Premier jour de stage chez Geodis, à l’entrepôt Action d’Ensuès-la-Redonne.')
    identite()
    connexion('ENT-8.1', 'Action — d’où viennent les produits du magasin de Nîmes ?')
    T.soustitre('2. Ma mission')
    T.encadre_liste('Aujourd’hui :', [
        'Je suis en stage (PFMP) chez Geodis, dans un entrepôt qui travaille pour Action.',
        'Samia, cheffe d’équipe, est ma tutrice. Elle m’envoie des messages : je les lis bien.',
        'Je comprends pour qui je travaille et d’où viennent les produits.',
        'Je réponds en cliquant. Je n’ai rien à écrire à l’écran.',
    ])
    deroule([
        ('Avant de commencer : quelques questions', 'Au début de la séance'),
        ('Qui est qui ? (Action, Geodis, le magasin…)', 'Messagerie, puis la fiche'),
        ('Placer les lieux sur la carte de France', 'Carte de France'),
        ('Remettre en ordre le chemin d’un produit', 'Fiche « La chaîne »'),
        ('Ce que mon travail change au magasin', 'Fiche « Ce que je change »'),
    ])
    T.encadre('Vrai ou construit ?', MENTION)

    # ---------------------------------------------------------- cours
    page_cours('ENT-8.1', 'D’où viennent les produits du magasin ?')
    T.soustitre('1. Le chemin d’un produit (la chaîne logistique)')
    image(schema_chaine(), 16.0)
    T.soustitre('2. Qui fait quoi ?')
    puces([
        'Action possède les magasins et choisit les produits. C’est une entreprise privée : elle vend pour gagner de l’argent.',
        'Geodis fait tourner l’entrepôt pour Action : il stocke et prépare les commandes des magasins. Action paie Geodis : '
        'Action est son client, Geodis est son prestataire.',
        'Les produits restent à Action. Moi, stagiaire chez Geodis, je prépare les produits d’Action.',
    ])
    T.soustitre('3. Ce que change mon travail')
    T.p('Une erreur à l’entrepôt se voit au magasin : un produit qui manque dans le rayon, qui arrive cassé ou en retard. '
        'Le premier à le voir, c’est le client.', taille=10.5, apres=4)

    T.soustitre('4. Régions et départements')
    # deux colonnes : la carte à gauche, le texte et le tableau à droite
    t = T.d.add_table(rows=1, cols=2); t.alignment = WD_TABLE_ALIGNMENT.CENTER
    largeurs(t, [8.2, 9.0])
    c0, c1 = t.rows[0].cells
    q = c0.paragraphs[0]; q.alignment = WD_ALIGN_PARAGRAPH.CENTER; q.paragraph_format.space_after = Pt(0)
    q.add_run().add_picture(carte_muette(), width=Cm(7.0))
    q = c0.add_paragraph(); q.alignment = WD_ALIGN_PARAGRAPH.CENTER; q.paragraph_format.space_after = Pt(0)
    r = q.add_run('Trait épais : régions. Trait fin : départements.\nContours : IGN Admin Express (Licence Ouverte)')
    r.font.size = Pt(7.5); r.font.color.rgb = T.GRIS
    for k, txt in enumerate([
        'La France (sans l’outre-mer) a 13 régions, découpées en 96 départements.',
        'Chaque département a un numéro : ce sont les 2 premiers chiffres du code postal (Lyon, 69003 : le Rhône, 69).',
        'À la fin de la séance, je reporte sur la carte les 3 lieux, avec leur lettre : P le port, E l’entrepôt, M le magasin. '
        'Puis je trace le trajet P → E → M.',
    ]):
        q = c1.paragraphs[0] if k == 0 else c1.add_paragraph()
        q.paragraph_format.space_after = Pt(5)
        q.paragraph_format.left_indent = Cm(0.4); q.paragraph_format.first_line_indent = Cm(-0.4)
        q.add_run('• ' + txt).font.size = Pt(10)
    q = c1.add_paragraph(); q.paragraph_format.space_after = Pt(2)
    r = q.add_run('Mes trois lieux (je complète à la fin, avec la carte de l’écran) :'); r.bold = True; r.font.size = Pt(10)
    tt = c1.add_table(rows=1, cols=3); tt.style = 'Table Grid'
    for i, h in enumerate(['Lieu', 'Département (n°)', 'Région']):
        cc = tt.rows[0].cells[i]; T.ombre(cc, 'E8E8E8')
        qq = cc.paragraphs[0]; qq.paragraph_format.space_after = Pt(0)
        rr = qq.add_run(h); rr.bold = True; rr.font.size = Pt(9)
    for lieu in ['P  Hub d’import, près du Havre', 'E  Entrepôt d’Ensuès-la-Redonne', 'M  Magasin Action de Nîmes']:
        row = tt.add_row(); row.height = Cm(1.0)
        qq = row.cells[0].paragraphs[0]; qq.paragraph_format.space_after = Pt(0)
        qq.add_run(lieu).font.size = Pt(9)
    largeurs(tt, [3.6, 2.6, 3.2])

    lexique(['chaîne logistique', 'hub d’import', 'entrepôt', 'prestataire'], largeur_mot=3.2)
    finir('ENT-8.1-action-se-situer-trame-eleve')


# ================================================================== ENT-8.2
def planigramme_vierge():
    n = (FIN - DEBUT) // 30
    t = T.d.add_table(rows=1, cols=n + 1); t.style = 'Table Grid'; t.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr = t.rows[0].cells
    T.ombre(hdr[0], 'E8E8E8')
    q = hdr[0].paragraphs[0]; q.paragraph_format.space_after = Pt(0)
    r = q.add_run('Quai'); r.bold = True; r.font.size = Pt(8.5)
    for k in range(n):
        m = DEBUT + 30 * k
        c = hdr[k + 1]; T.ombre(c, 'E8E8E8')
        q = c.paragraphs[0]; q.paragraph_format.space_after = Pt(0); q.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = q.add_run(f'{m // 60} h{m % 60:02d}' if m % 60 else f'{m // 60} h'); r.bold = True; r.font.size = Pt(8)
    for quai in QUAIS:
        row = t.add_row(); row.height = Cm(1.7)
        T.ombre(row.cells[0], 'F2F2F2')
        q = row.cells[0].paragraphs[0]; q.paragraph_format.space_after = Pt(0)
        r = q.add_run(quai); r.bold = True; r.font.size = Pt(9)
    largeurs(t, [1.7] + [1.29] * n)


def trame_82():
    T.nouveau()
    logos_et_titre('ENT-8.2', 'Action : ma prise de poste à la réception',
                   'Mardi 9 novembre, 6 h. Deuxième jour de stage chez Geodis, à l’entrepôt Action d’Ensuès-la-Redonne.')
    identite()
    connexion('ENT-8.2', 'Action — ma prise de poste à la réception')
    T.soustitre('2. Ma mission')
    T.encadre_liste('Aujourd’hui :', [
        'Je tiens le poste de réceptionnaire. Samia, ma tutrice, me donne d’abord les consignes.',
        'Un camion arrive du port du Havre : je prépare son arrivée.',
        'Kevin (cariste) et Julie (agent administratif) travaillent avec moi.',
        'Je réponds en cliquant. La page 2 me sert de brouillon.',
    ])
    deroule([
        ('Avant de commencer : quelques questions', 'Au début de la séance'),
        ('① Repérer mon poste : la visite de la réception', 'Visite de la réception'),
        ('② Qui fait quoi à la réception ?', 'Fiche « Qui fait quoi ? »'),
        ('③ Lire le planigramme, puis placer un camion', 'Fiche, puis planning des quais'),
        ('④ Les documents du camion, avant d’ouvrir le camion', 'Documents, puis deux fiches'),
        ('⑤ Rendre compte à Samia', 'Messagerie'),
    ])
    T.encadre('Vrai ou construit ?', 'Réels : Action, Geodis (qui fait tourner l’entrepôt d’Ensuès-la-Redonne pour Action), le hub '
              'd’import du Havre. Construits pour l’exercice : le plan de la réception, le planigramme et ses camions, les trois '
              'documents, Samia, Kevin et Julie. Les photos viennent d’autres entrepôts.')

    # ---------------------------------------------------------- brouillon
    par = T.d.add_paragraph(); par.paragraph_format.page_break_before = True; par.paragraph_format.space_after = Pt(0)
    r = par.add_run('BROUILLON'); r.bold = True; r.font.size = Pt(9.5); r.font.color.rgb = T.GRIS; r.font.name = 'Consolas'
    par = T.d.add_paragraph(); par.paragraph_format.space_after = Pt(4)
    r = par.add_run('Le planigramme de réception du mardi 9 novembre'); r.bold = True; r.font.size = Pt(15); r.font.color.rgb = T.TITRE
    T.consignes([
        'Julie m’envoie le planigramme. Je le recopie ici : pour chaque camion, j’écris son nom dans les cases de son quai, '
        'de son heure d’arrivée à son heure de départ.',
        'Une case = une demi-heure. Une case vide = le quai est libre.',
        'Ensuite, je m’en sers pour répondre aux questions et pour trouver un quai libre au nouveau camion.',
    ])
    planigramme_vierge()
    T.p('', apres=2)
    T.soustitre('Le nouveau camion : où le placer ?')
    T.faits(['Il dure combien de temps ? Entre quelles heures doit-il arriver ?',
             'Quels quais sont libres pendant ce temps-là ?'], hauteur=Cm(1.1))
    T.soustitre('Mes notes pour le compte rendu à Samia')
    T.p('Avant de répondre à Samia, je note ici ce que j’ai vu.', taille=10, couleur=T.GRIS, apres=4)
    T.faits(['Le quai prêt pour le camion du Havre :', 'L’heure où le camion du Havre est attendu :',
             'Ce qui manque avant d’ouvrir le camion :'], hauteur=Cm(1.0))

    # ---------------------------------------------------------- cours
    page_cours('ENT-8.2', 'Ma prise de poste à la réception')
    T.soustitre('1. Les zones de la réception, dans l’ordre du tour')
    t = T.d.add_table(rows=0, cols=3); t.style = 'Table Grid'
    for n, z, txt in ZONES:
        row = t.add_row(); row._tr.get_or_add_trPr().append(OxmlElement('w:cantSplit'))
        for i, (v, g) in enumerate([(n, True), (z, True), (txt, False)]):
            q = row.cells[i].paragraphs[0]; q.paragraph_format.space_after = Pt(0)
            rr = q.add_run(v); rr.bold = g; rr.font.size = Pt(9.5)
    largeurs(t, [0.8, 4.0, 12.4])

    T.soustitre('2. L’équipe de la réception')
    t = T.d.add_table(rows=1, cols=2); t.style = 'Table Grid'
    for i, h in enumerate(['Qui ?', 'Ce qu’il ou elle fait']):
        c = t.rows[0].cells[i]; T.ombre(c, 'E8E8E8')
        q = c.paragraphs[0]; q.paragraph_format.space_after = Pt(0)
        rr = q.add_run(h); rr.bold = True; rr.font.size = Pt(9.5)
    for qui, quoi in [
        ('La cheffe d’équipe (Samia)', 'Organise le travail de l’équipe. Décide en cas de problème (par exemple, refuser une palette abîmée).'),
        ('Le cariste (Kevin)', 'Conduit le chariot : décharge les camions, amène les palettes contrôlées jusqu’au stock.'),
        ('Le réceptionnaire (moi)', 'Vérifie le bon de livraison avec le chauffeur, compte les cartons et regarde leur état.'),
        ('L’agent administratif (Julie)', 'Tient le planigramme (les rendez-vous des camions) et saisit la réception dans le WMS.'),
    ]:
        row = t.add_row()
        for i, (v, g) in enumerate([(qui, True), (quoi, False)]):
            q = row.cells[i].paragraphs[0]; q.paragraph_format.space_after = Pt(0)
            rr = q.add_run(v); rr.bold = g; rr.font.size = Pt(9.5)
    largeurs(t, [4.8, 12.4])

    T.soustitre('3. Les trois documents du camion')
    puces([
        'Le bon de commande : ce que le client (Action) a commandé à son fournisseur.',
        'Le bon de livraison : ce que le fournisseur a vraiment envoyé dans le camion.',
        'La lettre de voiture : le document du transporteur (qui envoie, qui reçoit, quoi, quel camion).',
        'Je compare le bon de commande et le bon de livraison : ce qui manque ou ce qui est en trop se voit tout de suite.',
    ])

    T.soustitre('4. Rendre compte')
    T.p('Rendre compte, c’est dire à son chef ce qu’on a fait ou vu, même quand tout va bien. Un message court, une idée par '
        'ligne : je dis bonjour, je donne les faits (le quai, l’heure, ce qui manque), je termine poliment et je signe.',
        taille=10.5, apres=4)
    lexique(['quai', 'planigramme', 'créneau', 'zone litiges', 'EPI', 'WMS', 'niveleur', 'rendre compte'], largeur_mot=3.0)
    finir('ENT-8.2-action-prise-de-poste-trame-eleve')


if __name__ == '__main__':
    trame_81()
    trame_82()
