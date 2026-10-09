# Dessins « matériel du poste » de France Boissons (ENT-6.6 et ENT-6.7), Cowork, 06/10/2026 ; portique corrigé le 07/10
# (Tristan : préparateur à côté des palettes, tenue orange et verte, palettes en ligne, poteau de devant retiré).
# Même style que materiel-chariot-frontal.svg et materiel-palette-retention.svg : projection iso 30°,
# constantes et teintes de core/iso.js (fûts, personne sans traits du visage), légendes orange.
# Lancer : python3 materiel_fb.py <dossier de sortie>  → materiel-terminal-vocal.svg, materiel-portique-futs.svg
import sys, os

C30, S30, K1, K2 = 0.866, 0.5, 1.2247, 0.7071
FOND, SOL, SOL_TRAIT = '#f4f0e8', '#e4dfd3', '#cfc8b8'
ORANGE, ENCRE, GRIS = '#d9480f', '#1a1915', '#555047'
DEFS = ('<defs><linearGradient id="isoMetal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8f979c"/>'
        '<stop offset=".35" stop-color="#e6e9eb"/><stop offset=".7" stop-color="#b3bac0"/><stop offset="1" stop-color="#7f878c"/>'
        '</linearGradient></defs>')


def f1(v):
    return f'{v:.1f}'


class Iso:
    def __init__(self, unite, origine):
        self.u, (self.ox, self.oy) = unite, origine

    def P(self, x, y, z):
        return (self.ox + (x - y) * C30 * self.u, self.oy + (x + y) * S30 * self.u - z * self.u)

    def pts(self, a):
        return ' '.join(f'{f1(px)},{f1(py)}' for px, py in (self.P(*p) for p in a))

    def face(self, a, fill, stroke='rgba(0,0,0,.25)', extra=''):
        return f'<polygon points="{self.pts(a)}" fill="{fill}" stroke="{stroke}" stroke-width="1"{extra}/>'

    def boite(self, x, y, z, w, d, h, c):
        return (self.face([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], c[1])
                + self.face([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], c[2])
                + self.face([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], c[0]))

    def ligne(self, a, stroke, w=1.5, extra=''):
        return f'<polyline points="{self.pts(a)}" fill="none" stroke="{stroke}" stroke-width="{w}"{extra}/>'

    # Un fût debout (métal, deux cercles de roulement, dessus clair avec la tête de soutirage).
    def fut(self, cx, cy, z, r=0.19, h=0.40):
        bx, by = self.P(cx, cy, z)
        tx, ty = self.P(cx, cy, z + h)
        rx, ry = r * self.u * K1, r * self.u * K2
        g = (f'<path d="M{f1(bx - rx)},{f1(by)} L{f1(tx - rx)},{f1(ty)} L{f1(tx + rx)},{f1(ty)} L{f1(bx + rx)},{f1(by)} '
             f'A{f1(rx)},{f1(ry)} 0 0 1 {f1(bx - rx)},{f1(by)} Z" fill="url(#isoMetal)" stroke="#6f777c" stroke-width=".8"/>')
        for fr in (0.22, 0.78):
            yy = by + (ty - by) * fr
            g += f'<path d="M{f1(bx - rx)},{f1(yy)} A{f1(rx)},{f1(ry)} 0 0 0 {f1(bx + rx)},{f1(yy)}" fill="none" stroke="#7d858a" stroke-width="1.8"/>'
        return g + (f'<ellipse cx="{f1(tx)}" cy="{f1(ty)}" rx="{f1(rx)}" ry="{f1(ry)}" fill="#eef0f1" stroke="#7d858a"/>'
                    f'<ellipse cx="{f1(tx)}" cy="{f1(ty)}" rx="{f1(rx * .32)}" ry="{f1(ry * .32)}" fill="#4a4f52"/>')

    # Palette bois (planches du dessus, 3 semelles) : x × y, hauteur 0,144.
    def palette(self, x, y, z, w, d, sens='x', noire=False):
        bois = ['#3d4245', '#2f3336', '#24282a'] if noire else ['#d6b27a', '#bf975d', '#a8824c']
        sem = ['#2a2d2f', '#1e2123', '#16191a'] if noire else ['#c9a46b', '#a8824c', '#946f3d']
        pied = ['#2a2d2f', '#1e2123', '#16191a'] if noire else ['#b48c55', '#9c7643', '#8a6738']
        trait = '#1b1e20' if noire else '#a8824c'
        g = ''
        for k in range(3):
            if sens == 'x':
                g += self.boite(x, y + k * (d - 0.1) / 2, z, w, 0.1, 0.022, sem)
            else:
                g += self.boite(x + k * (w - 0.1) / 2, y, z, 0.1, d, 0.022, sem)
        for k in range(3):
            if sens == 'x':
                g += self.boite(x + k * (w - 0.14) / 2, y, z + 0.022, 0.14, d, 0.078, pied)
            else:
                g += self.boite(x, y + k * (d - 0.14) / 2, z + 0.022, w, 0.14, 0.078, pied)
        g += self.boite(x, y, z + 0.1, w, d, 0.044, bois)
        n = 7
        for k in range(1, n):
            if sens == 'x':
                t = y + k * d / n
                g += self.ligne([[x, t, z + 0.144], [x + w, t, z + 0.144]], trait, 1.2)
            else:
                t = x + k * w / n
                g += self.ligne([[t, y, z + 0.144], [t, y + d, z + 0.144]], trait, 1.2)
        return g


# Une personne debout (1,75 m), SANS TRAITS DU VISAGE : la personne de core/iso.js, avec deux ajouts
# possibles : casque + micro (o['casque']) et terminal à la ceinture (o['terminal']).
def personne(I, x, y, o=None):
    o = o or {}
    fx, fy = I.P(x, y, 0)
    k = I.u * 1.75 / 100
    X = lambda v: f1(fx + v * k)
    Y = lambda v: f1(fy - v * k)
    n = lambda v: f'{v * k:.2f}'
    peau, peauOmbre, pant, pantOmbre = '#c99a76', '#b3876a', '#2e3b4c', '#253140'
    gil, gilOmbre, band, t = '#f0c419', '#d6ad10', '#e6e8e8', '#30363b'
    if o.get('tenue') == 'fb':   # tenue vue dans la vidéo de Buchelay : orange et verte, bandes réfléchissantes
        gil, gilOmbre, vert, vertOmbre = '#e8742a', '#c95f1c', '#2f7a4a', '#25633c'
    g = f'<ellipse cx="{f1(fx)}" cy="{f1(fy)}" rx="{n(13)}" ry="{n(5)}" fill="rgba(0,0,0,.2)"/>'
    g += f'<path d="M{X(-6.5)},{Y(1)} L{X(-7)},{Y(47)} L{X(-0.5)},{Y(47)} L{X(-1.5)},{Y(1)} Z" fill="{pantOmbre}"/>'
    g += f'<path d="M{X(1.5)},{Y(1)} L{X(0.5)},{Y(47)} L{X(7)},{Y(47)} L{X(6.5)},{Y(1)} Z" fill="{pant}"/>'
    g += f'<path d="M{X(-8.5)},{Y(0)} q0,{n(-4)} {n(3)},{n(-4)} h{n(4)} v{n(4)} Z" fill="{t}"/>'
    g += f'<path d="M{X(0.5)},{Y(0)} q0,{n(-4)} {n(3)},{n(-4)} h{n(4.5)} q{n(2)},0 {n(2)},{n(4)} Z" fill="{t}"/>'
    # bras gauche (côté ombre) : pendant, ou tendu vers o['mainG']
    if o.get('mainG'):
        mx, my = o['mainG']
        g += f'<path d="M{X(-9)},{Y(79)} L{f1(mx)},{f1(my)}" stroke="{gilOmbre}" stroke-width="{n(5.5)}" stroke-linecap="round"/>'
        g += f'<circle cx="{f1(mx)}" cy="{f1(my)}" r="{n(2.8)}" fill="{peauOmbre}"/>'
    else:
        g += f'<path d="M{X(-9)},{Y(78)} q{n(-3)},{n(12)} {n(-2.5)},{n(30)}" stroke="{gilOmbre}" stroke-width="{n(5.5)}" stroke-linecap="round" fill="none"/>'
        g += f'<circle cx="{X(-11)}" cy="{Y(46)}" r="{n(2.6)}" fill="{peauOmbre}"/>'
    # ceinture (visible sous le gilet)
    g += f'<path d="M{X(-9.6)},{Y(46)} L{X(9.6)},{Y(46)} L{X(9.6)},{Y(49.5)} L{X(-9.6)},{Y(49.5)} Z" fill="#1d1f20"/>'
    # gilet
    g += (f'<path d="M{X(-9.5)},{Y(50)} L{X(-10.5)},{Y(79)} Q{X(-9)},{Y(84)} {X(-3)},{Y(85)} L{X(3)},{Y(85)} '
          f'Q{X(9)},{Y(84)} {X(10.5)},{Y(79)} L{X(9.5)},{Y(50)} Z" fill="{gil}"/>')
    if o.get('tenue') == 'fb':   # bas de la veste vert
        g += f'<path d="M{X(-9.5)},{Y(50)} L{X(-9.8)},{Y(60)} L{X(9.8)},{Y(60)} L{X(9.5)},{Y(50)} Z" fill="{vert}"/>'
        g += f'<path d="M{X(1)},{Y(50)} L{X(1)},{Y(60)} L{X(9.8)},{Y(60)} L{X(9.5)},{Y(50)} Z" fill="{vertOmbre}"/>'
    g += f'<path d="M{X(1)},{Y(50)} L{X(1)},{Y(85)} L{X(3)},{Y(85)} Q{X(9)},{Y(84)} {X(10.5)},{Y(79)} L{X(9.5)},{Y(50)} Z" fill="{gilOmbre}" opacity=".55"/>'
    for v in (57, 66):
        g += f'<rect x="{X(-10.2)}" y="{Y(v + 2.6)}" width="{n(20.4)}" height="{n(2.6)}" fill="{band}"/>'
    g += f'<path d="M{X(-3)},{Y(85)} L{X(0)},{Y(77)} L{X(3)},{Y(85)} Z" fill="#3b4652"/>'
    # terminal à la ceinture, côté droit de l'image (hanche gauche de la personne)
    if o.get('terminal'):
        g += f'<rect x="{X(4.6)}" y="{Y(50.5)}" width="{n(2.4)}" height="{n(6)}" rx="{n(.5)}" fill="#3a3e41"/>'   # clip
        g += f'<rect x="{X(3.2)}" y="{Y(52.5)}" width="{n(5.4)}" height="{n(10)}" rx="{n(1.1)}" fill="#2b2f33" stroke="#151718" stroke-width="{n(.3)}"/>'
        g += f'<rect x="{X(3.8)}" y="{Y(51.4)}" width="{n(4.2)}" height="{n(2.5)}" rx="{n(.4)}" fill="#9cc4d6"/>'   # petit écran
        for i in range(3):
            g += f'<rect x="{X(3.95 + i * 1.4)}" y="{Y(47.6)}" width="{n(1.0)}" height="{n(1.0)}" rx="{n(.3)}" fill="#e5b800"/>'
        g += f'<rect x="{X(4.9)}" y="{Y(45.4)}" width="{n(2.0)}" height="{n(1.1)}" rx="{n(.3)}" fill="#6c7378"/>'
        g += f'<rect x="{X(5.3)}" y="{Y(54.2)}" width="{n(1.3)}" height="{n(1.7)}" fill="#151718"/>'   # prise du câble
    # bras droit
    if o.get('main'):
        mx, my = o['main']
        g += f'<path d="M{X(9)},{Y(79)} L{f1(mx)},{f1(my)}" stroke="{gil}" stroke-width="{n(5.5)}" stroke-linecap="round"/>'
        g += f'<circle cx="{f1(mx)}" cy="{f1(my)}" r="{n(2.8)}" fill="{peau}"/>'
    else:
        g += f'<path d="M{X(9)},{Y(78)} q{n(3)},{n(12)} {n(2.5)},{n(30)}" stroke="{gil}" stroke-width="{n(5.5)}" stroke-linecap="round" fill="none"/>'
        g += f'<circle cx="{X(11.5)}" cy="{Y(46)}" r="{n(2.6)}" fill="{peau}"/>'
    # cou, tête, cheveux
    g += f'<rect x="{X(-2.2)}" y="{Y(89)}" width="{n(4.4)}" height="{n(5)}" fill="{peauOmbre}"/>'
    g += f'<ellipse cx="{X(0)}" cy="{Y(93.5)}" rx="{n(5.3)}" ry="{n(6.4)}" fill="{peau}"/>'
    g += (f'<path d="M{X(-5.4)},{Y(94)} Q{X(-5.8)},{Y(101)} {X(0)},{Y(100.6)} Q{X(5.8)},{Y(101)} {X(5.4)},{Y(94)} '
          f'Q{X(3)},{Y(97.5)} {X(-5.4)},{Y(94)} Z" fill="#3a2a1f"/>')
    if o.get('casque'):
        g += f'<ellipse cx="{X(-5.5)}" cy="{Y(93)}" rx="{n(1.3)}" ry="{n(2.3)}" fill="#1d1f20"/>'      # oreillette cachée
        g += f'<path d="M{X(-5.9)},{Y(94.5)} Q{X(-6.6)},{Y(104.2)} {X(0)},{Y(103.6)} Q{X(6.6)},{Y(104.2)} {X(5.9)},{Y(94.5)}" fill="none" stroke="#2b2f33" stroke-width="{n(1.3)}" stroke-linecap="round"/>'
        g += f'<path d="M{X(6.4)},{Y(91.6)} Q{X(5.6)},{Y(87.4)} {X(2.2)},{Y(87.8)}" fill="none" stroke="#2b2f33" stroke-width="{n(.7)}" stroke-linecap="round"/>'  # perche
        g += f'<ellipse cx="{X(1.9)}" cy="{Y(87.8)}" rx="{n(1.1)}" ry="{n(.9)}" fill="#111"/>'     # micro
        g += f'<ellipse cx="{X(5.8)}" cy="{Y(93)}" rx="{n(2.1)}" ry="{n(2.9)}" fill="#2b2f33" stroke="#151718" stroke-width="{n(.3)}"/>'  # oreillette
        g += f'<ellipse cx="{X(5.5)}" cy="{Y(93)}" rx="{n(1)}" ry="{n(1.6)}" fill="#3e4447"/>'
    if o.get('cable'):
        g += (f'<path d="M{X(6.6)},{Y(90.6)} C{X(8.6)},{Y(84)} {X(8.2)},{Y(74)} {X(7.4)},{Y(66)} S{X(6.2)},{Y(60)} {X(5.95)},{Y(54.2)}" '
              f'fill="none" stroke="#1d1f20" stroke-width="{n(.45)}"/>')
    return g


def legende(ax, ay, lx, ly, titre, sous, cote='start'):
    dx = 6 if cote == 'start' else -6
    return (f'<line x1="{f1(ax)}" y1="{f1(ay)}" x2="{lx}" y2="{ly}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'
            f'<line x1="{f1(ax)}" y1="{f1(ay)}" x2="{lx}" y2="{ly}" stroke="{ORANGE}" stroke-width="2"/>'
            f'<circle cx="{f1(ax)}" cy="{f1(ay)}" r="6" fill="{ORANGE}" stroke="#fff" stroke-width="2.5"/>'
            f'<text x="{lx + dx}" y="{ly + 5}" text-anchor="{cote}" font-size="17" font-weight="800" fill="{ENCRE}">{titre}</text>'
            f'<text x="{lx + dx}" y="{ly + 25}" text-anchor="{cote}" font-size="15" font-weight="500" fill="{GRIS}">{sous}</text>')


def svg(ident, label, vb, corps, pied, piedxy):
    x, y, w, h = vb
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="{ident}" '
            f'font-family="Inter, system-ui, \'Segoe UI\', sans-serif" role="img" aria-label="{label}" '
            f'viewBox="{x} {y} {w} {h}" width="{w}" height="{h}"><title>{label}</title>{DEFS}'
            f'<rect x="{x}" y="{y}" width="100%" height="100%" fill="{FOND}"/>{corps}'
            f'<text class="pied" font-size="13" fill="{GRIS}" x="{piedxy[0]}" y="{piedxy[1]}">{pied}</text></svg>\n')


# ------------------------------------------------------------------ 1. le terminal vocal (ENT-6.6, 6.7)
def terminal_vocal():
    I = Iso(285, (650, 505))
    g = I.face([[-4.5, -2.5, 0], [3.5, -2.5, 0], [3.5, 3.5, 0], [-4.5, 3.5, 0]], SOL, SOL_TRAIT)
    # palette client de 6 fûts derrière, à droite (le contexte du poste)
    px, py = -2.3, 0.0
    g += I.palette(px, py, 0, 1.2, 0.8)
    for (a, b) in sorted([(0.2, 0.2), (0.6, 0.2), (1.0, 0.2), (0.2, 0.6), (0.6, 0.6), (1.0, 0.6)], key=lambda p: p[0] + p[1]):
        g += I.fut(px + a, py + b, 0.144)
    pers = personne(I, 0, 0.9, {'casque': True, 'terminal': True, 'cable': True})
    g += f'<g id="pers">{pers}</g>'
    fx, fy = I.P(0, 0.9, 0)
    k = I.u * 1.75 / 100
    pt = lambda vx, vy: (fx + vx * k, fy - vy * k)
    # loupes : la tête (casque, micro) et la ceinture (terminal)
    loupes = [((2.0, 0), (3.0, 91), (870, 175), 118, 2.7),
              ((0, 0), (5.6, 50), (870, 470), 118, 2.7)]
    for i, (_, (vx, vy), (cx, cy), r, z) in enumerate(loupes):
        sx, sy = pt(vx, vy)
        g += f'<clipPath id="loupe{i}"><circle cx="{cx}" cy="{cy}" r="{r}"/></clipPath>'
        g += (f'<line x1="{f1(sx)}" y1="{f1(sy)}" x2="{f1(cx - r * .97)}" y2="{f1(cy + (sy - cy) * .25)}" stroke="#8a8478" stroke-width="1.5" stroke-dasharray="5 4"/>'
              f'<circle cx="{f1(sx)}" cy="{f1(sy)}" r="{f1(r / z)}" fill="none" stroke="#8a8478" stroke-width="1.5" stroke-dasharray="5 4"/>')
        g += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{FOND}"/>'
        g += (f'<g clip-path="url(#loupe{i})"><rect x="{cx - r}" y="{cy - r}" width="{2 * r}" height="{2 * r}" fill="#ece6da"/>'
              f'<use xlink:href="#pers" href="#pers" transform="translate({f1(cx - sx * z)},{f1(cy - sy * z)}) scale({z})"/></g>')
        g += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="#8a8478" stroke-width="2.5"/>'
    # repères dans les loupes (coordonnées loupe = c + (point - s) × z)
    def dansLoupe(i, vx, vy):
        (_, (svx, svy), (cx, cy), r, z) = loupes[i]
        sx, sy = pt(svx, svy)
        px_, py_ = pt(vx, vy)
        return cx + (px_ - sx) * z, cy + (py_ - sy) * z
    a = dansLoupe(0, 5.8, 93)
    g += legende(*a, 1020, 120, 'Le casque', 'le terminal te parle')
    a = dansLoupe(0, 1.9, 87.8)
    g += legende(*a, 1020, 225, 'Le micro', 'tu réponds à voix haute')
    a = dansLoupe(1, 5.9, 51.5)
    g += legende(*a, 1020, 455, 'Le terminal', 'accroché à la ceinture')
    # mains libres
    hx, hy = pt(-11, 46)
    g += legende(hx, hy, 300, 560, 'Les mains libres', 'pour prendre les fûts', 'end')
    hx2, hy2 = pt(11.5, 46)
    g += (f'<line x1="{f1(hx2)}" y1="{f1(hy2)}" x2="300" y2="560" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'
          f'<line x1="{f1(hx2)}" y1="{f1(hy2)}" x2="300" y2="560" stroke="{ORANGE}" stroke-width="2"/>'
          f'<circle cx="{f1(hx2)}" cy="{f1(hy2)}" r="6" fill="{ORANGE}" stroke="#fff" stroke-width="2.5"/>')
    lab = 'Préparateur portant un terminal vocal à la ceinture, relié à un casque avec micro ; ses deux mains sont libres'
    return svg('terminal-vocal', lab, (-130, 10, 1400, 760), g,
               'Dessin — matériel générique, sans marque : ce n\'est pas le modèle utilisé chez France Boissons.', (-110, 752))


# ------------------------------------------------------------------ 2. le portique à fûts (ENT-6.7)
# D'après la vidéo de présentation de Buchelay (France Boissons, YouTube, vue le 07/10 par Tristan) : un PORTIQUE FIXE jaune
# (poteaux au sol, poutres en haut) au-dessus de la zone de préparation ; sous les poutres, des rails gris ; un MANIPULATEUR
# À AIR (tube vertical, tuyau spiralé, poignée) glisse sur les rails et lève le fût. Palettes de fûts posées au sol ;
# palette client sur un transpalette électrique ; préparateur avec casque.
def portique():
    I = Iso(128, (640, 260))
    g = I.face([[-1.2, -1.0, 0], [5.5, -1.0, 0], [5.5, 5.4, 0], [-1.2, 5.4, 0]], SOL, SOL_TRAIT)
    jaune = ['#f2cb2b', '#e5b800', '#c79f00']
    gris = ['#b9c0c4', '#9aa2a7', '#838b90']
    metal = ['#4a4f52', '#33373a', '#2a2e30']
    orange = ['#ef7d22', '#d9681a', '#b85512']
    XA, XB, YA, YB, H = 0.0, 4.3, 0.0, 4.5, 3.0
    # poteaux du fond, poutre du fond
    for (x, y) in ((XA, YA), (XB, YA), (XA, YB)):
        g += I.boite(x - 0.09, y - 0.09, 0, 0.18, 0.18, H, jaune)
    g += I.boite(XA - 0.09, YA - 0.09, H, XB - XA + 0.18, 0.18, 0.22, jaune)
    g += I.boite(XA - 0.09, YA - 0.09, H, 0.18, YB - YA + 0.18, 0.22, jaune)
    # palettes de fûts en plastique noir posées au sol, EN LIGNE sous le portique (vu dans la vidéo) : 8 places en 3-2-3.
    # On prélève sur celle du fond (1 fût déjà pris) ; les deux autres attendent, pleines.
    P8 = [(0.22, 0.2), (0.62, 0.2), (1.02, 0.2), (0.42, 0.56), (0.82, 0.56), (0.22, 0.92), (0.62, 0.92), (1.02, 0.92)]
    sx, sy = 0.25, 0.3
    pris = (1.02, 0.92)
    for yy in (0.3, 1.6, 2.9):  # du fond vers l'avant
        g += I.palette(sx, yy, 0, 1.23, 1.12, 'y', noire=True)
        if yy == sy:
            cx_, cy_ = I.P(sx + pris[0], sy + pris[1], 0.145)
            g += f'<ellipse cx="{f1(cx_)}" cy="{f1(cy_)}" rx="{f1(.19 * I.u * K1)}" ry="{f1(.19 * I.u * K2)}" fill="none" stroke="#7a5a2c" stroke-width="1.5" stroke-dasharray="5 4"/>'
        for (a_, b_) in sorted([p for p in P8 if not (yy == sy and p == pris)], key=lambda p: p[0] + p[1]):
            g += I.fut(sx + a_, yy + b_, 0.144)
    # palette client 1,20 × 0,80 sur un transpalette électrique : 3 fûts posés, 3 places libres
    px, py = 2.45, 1.55
    g += I.palette(px, py, 0.06, 1.2, 0.8)
    P6 = [(0.2, 0.2), (0.6, 0.2), (1.0, 0.2), (0.2, 0.6), (0.6, 0.6), (1.0, 0.6)]
    poses = [(0.6, 0.2), (1.0, 0.2), (1.0, 0.6)]
    for (a_, b_) in [p for p in P6 if p not in poses]:
        cx_, cy_ = I.P(px + a_, py + b_, 0.205)
        g += f'<ellipse cx="{f1(cx_)}" cy="{f1(cy_)}" rx="{f1(.19 * I.u * K1)}" ry="{f1(.19 * I.u * K2)}" fill="none" stroke="#7a5a2c" stroke-width="1.5" stroke-dasharray="5 4"/>'
    # trajet du fût
    hx, hy, zf = 2.0, 1.45, 0.55
    p0, p2 = I.P(sx + pris[0], sy + pris[1], 0.7), I.P(px + 0.2, py + 0.6, 0.75)
    g += (f'<path d="M{f1(p0[0])},{f1(p0[1])} Q{f1((p0[0] + p2[0]) / 2)},{f1(min(p0[1], p2[1]) - 90)} {f1(p2[0])},{f1(p2[1])}" fill="none" '
          f'stroke="{ORANGE}" stroke-width="3" stroke-dasharray="9 6"/>')
    g += f'<path d="M{f1(p2[0] - 14)},{f1(p2[1] - 10)} L{f1(p2[0])},{f1(p2[1])} L{f1(p2[0] - 2)},{f1(p2[1] - 18)}" fill="none" stroke="{ORANGE}" stroke-width="3" stroke-linejoin="round"/>'
    for (a_, b_) in sorted(poses, key=lambda p: p[0] + p[1]):
        g += I.fut(px + a_, py + b_, 0.204)
    # transpalette électrique (tête de conduite et timon), côté x > palette
    g += I.boite(px + 1.2, py + 0.08, 0.03, 0.38, 0.64, 0.6, orange)
    g += I.boite(px + 1.24, py + 0.14, 0.63, 0.3, 0.52, 0.04, metal)
    g += I.ligne([[px + 1.45, py + 0.4, 0.67], [px + 1.75, py + 0.4, 1.1]], '#1d1f20', 4)
    g += I.ligne([[px + 1.75, py + 0.25, 1.1], [px + 1.75, py + 0.55, 1.1]], '#1d1f20', 4)
    # rails sous les poutres (le long de y) et pont (le long de x) qui porte le manipulateur
    zr = H - 0.12
    for x in (0.6, 3.7):
        g += I.boite(x - 0.05, YA, zr, 0.1, YB - YA, 0.1, gris)
    g += I.boite(0.55, hy - 0.06, zr - 0.12, 3.2, 0.12, 0.12, gris)
    # manipulateur à air : chariot, tube vertical, tuyau spiralé, poignée, tête de prise, fût levé
    g += I.boite(hx - 0.1, hy - 0.1, zr - 0.24, 0.2, 0.2, 0.12, metal)
    zt = zf + 0.4   # haut du fût levé
    tx0, ty0 = I.P(hx, hy, zr - 0.24)
    tx1, ty1 = I.P(hx, hy, zt + 0.42)
    g += f'<rect x="{f1(tx0 - 6)}" y="{f1(ty0)}" width="12" height="{f1(ty1 - ty0)}" fill="#aab1b5" stroke="#6f777c"/>'
    # spirale : un tuyau jaune enroulé à côté du tube
    cx0 = tx0 + 16
    d = f'M{f1(tx0)},{f1(ty0 + 4)} '
    n_, y_, pas = 0, ty0 + 10, 9
    while y_ < ty1 - 4:
        d += f'Q{f1(cx0 + 12)},{f1(y_)} {f1(cx0)},{f1(y_ + pas / 2)} Q{f1(cx0 - 12)},{f1(y_ + pas)} {f1(cx0)},{f1(y_ + pas)} '
        y_ += pas
    g += f'<path d="{d}" fill="none" stroke="#d6ad10" stroke-width="2.2"/>'
    g += f'<path d="M{f1(cx0)},{f1(y_)} Q{f1(cx0)},{f1(ty1 + 8)} {f1(tx1 + 6)},{f1(ty1 + 10)}" fill="none" stroke="#d6ad10" stroke-width="2.2"/>'
    g += I.boite(hx - 0.2, hy - 0.05, zt + 0.28, 0.4, 0.1, 0.14, metal)              # poignée (bloc de commande)
    g += I.ligne([[hx - 0.3, hy, zt + 0.35], [hx + 0.3, hy, zt + 0.35]], '#1d1f20', 5)
    g += I.boite(hx - 0.05, hy - 0.05, zt + 0.08, 0.1, 0.1, 0.2, metal)
    g += I.fut(hx, hy, zf)
    hx0, hy0 = I.P(hx, hy, zt + 0.04)
    g += f'<ellipse cx="{f1(hx0)}" cy="{f1(hy0)}" rx="{f1(.17 * I.u * K1)}" ry="{f1(.17 * I.u * K2)}" fill="#3a3e41" stroke="#1d1f20"/>'
    # poteaux et poutres de devant (après tout ce qui est dessous)
    # préparateur dans l'allée, à côté des palettes (jamais devant) : casque, tenue orange et verte, main gauche sur la poignée
    perx, pery = 2.62, 1.0
    mx, my = I.P(hx + 0.3, hy, zt + 0.35)
    g += personne(I, perx, pery, {'mainG': (mx, my), 'casque': True, 'tenue': 'fb'})
    # les deux poutres de devant en transparence ; le poteau de devant n'est pas dessiné (il barrait toute la scène, Tristan 07/10)
    g += '<g opacity=".14">' + I.boite(XB - 0.09, YA - 0.09, H, 0.18, YB - YA + 0.18, 0.22, jaune)
    g += I.boite(XA - 0.09, YB - 0.09, H, XB - XA + 0.18, 0.18, 0.22, jaune) + '</g>'
    # légendes
    LG, LD = 30, 1200
    g += legende(*I.P(XA, YB, 1.6), LG, 330, 'Le portique', 'fixe, au-dessus de la zone de préparation', 'end')
    g += legende(*I.P(0.6, 0.9, zr), LG, 120, 'Les rails', 'le manipulateur glisse dessus', 'end')
    g += legende(tx1 + 6, (ty0 + ty1) / 2, LD, 40, 'Le manipulateur à air', 'il saisit le fût et le soulève', 'start')
    g += legende(*I.P(hx + 0.2, hy, zt + 0.35), LD, 200, 'La poignée', 'on guide le fût, on ne le porte pas', 'start')
    g += legende(*I.P(sx + 0.62, 2.9 + 1.12, 0.07), LG, 560, 'Les palettes de fûts', 'posées au sol, en lignes, sous le portique', 'end')
    g += legende(*I.P(px + 0.6, py + 0.8, 0.12), LD, 560, 'La palette client', '1,20 × 0,80 m, 6 fûts au plus', 'start')
    lab = ('Portique à fûts : sous un portique fixe, un préparateur guide un manipulateur à air qui lève un fût d\'une des palettes '
           'posées au sol en ligne vers une palette client de 1,20 × 0,80 m portée par un transpalette électrique')
    return svg('portique-futs', lab, (-330, -200, 1900, 1080), g,
               'Dessin simplifié d\'après une vidéo de présentation de la plateforme France Boissons de Buchelay.', (-310, 865))


if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else '.'
    for nom, f in (('materiel-terminal-vocal.svg', terminal_vocal), ('materiel-portique-futs.svg', portique)):
        open(os.path.join(out, nom), 'w', encoding='utf-8', newline='\n').write(f())
        print('écrit', nom)
