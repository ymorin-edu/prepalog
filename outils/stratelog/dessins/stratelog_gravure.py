# Stratelog — bâtiments en style « gravure colorée », deux niveaux de détail :
#   LV = 'full'  : fiche (grand format)
#   LV = 'light' : plateau (une case = 60 px)
# Vue cavalière, lumière en haut à gauche. 1 case = 100 unités.
import math, random
from shapely.geometry import Polygon, LineString, Point, box

LV = 'full'
INK = '#1A100A'
P = dict(
    plaster='#F3D9A0', plaster_s='#D7AE6C', timber='#5A3318', timber_l='#7E4C26',
    stone='#E6CF98', stone2='#D9BF85', stone3='#EBD9AC', stone_s='#B9945C', stone_d='#9C7A48',
    tile='#CF5A2C', tile2='#B9481F', tile_s='#8E2F12',
    thatch='#E8B043', thatch2='#D49A2E', thatch_s='#A8701A',
    slate='#6F8A9B', slate2='#5F7A8B', slate_s='#41596A',
    wood='#9A5E30', wood2='#B07040', wood_s='#6E3E1C', door='#7A4521', iron='#3A3A3A',
    earth='#E4BF7E', earth2='#D6AC66', cobble='#CFA968', grass='#9DB548', grass2='#8AA43C', grass_d='#5E7E22',
    leaf='#5C8A2E', leaf2='#4A7524', leaf_l='#86B04A', trunk='#5A3318',
    wheat='#E9BE4C', wheat2='#D9A836', wheat_d='#A87A1E',
    blue='#2F5FA8', red='#B8321F', ochre='#E2A52A', green='#4E8A3A', water='#3E6FB0',
    sack='#EED9A6', light='#FFF2CF', win='#24160D', fire='#F08A24',
)
R = random.Random(7)
def full(): return LV == 'full'
def f(v): return f'{v:.1f}'

# ---------------- traits ----------------
def wobble(ps, closed=True, amp=0.45, seg=3.5):
    pts = list(ps) + ([ps[0]] if closed else [])
    out = []
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        L = math.hypot(x1 - x0, y1 - y0); n = max(1, int(L / seg))
        nx, ny = (-(y1 - y0) / L, (x1 - x0) / L) if L else (0, 0)
        for i in range(n):
            t = i / n; a = R.uniform(-amp, amp) if i else 0
            out.append((x0 + (x1 - x0) * t + nx * a, y0 + (y1 - y0) * t + ny * a))
    out.append(pts[-1])
    return out
def path_d(ps, closed=False):
    return 'M' + ' '.join(f'{f(x)},{f(y)}' for x, y in ps) + (' Z' if closed else '')
def _c(col): return '' if col == INK else f' stroke="{col}"'
def outline(ps, w=2.2, closed=True, col=INK):
    return f'<path d="{path_d(wobble(ps, closed))}" stroke-width="{w}"{_c(col)}/>'
def fillp(ps, col):
    return f'<path d="{path_d(ps, True)}" fill="{col}" stroke="none"/>'
def stroke(a, b, w=1.0, col=INK, op=1, amp=0.3):
    L = math.dist(a, b)
    if L < 6 or amp == 0:
        ps = [a, b]
    else:
        m = lerp(a, b, .5); nx, ny = -(b[1] - a[1]) / L, (b[0] - a[0]) / L; k = R.uniform(-amp, amp)
        ps = [a, (m[0] + nx * k, m[1] + ny * k), b]
    o = '' if op >= 1 else f' opacity="{op:g}"'
    return f'<path d="{path_d(ps)}" stroke-width="{f(w)}"{_c(col)}{o}/>'
def curve(ps, w=1, col=INK, op=1, fill='none'):
    o = '' if op >= 1 else f' opacity="{op:g}"'
    fl = '' if fill == 'none' else f' fill="{fill}"'
    return f'<path d="{path_d(ps)}" stroke-width="{f(w)}"{_c(col)}{fl}{o}/>'
def lerp(a, b, t): return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
def add(a, b): return (a[0] + b[0], a[1] + b[1])
KX, KY = 0.5, -0.4
def dk(D): return (D * KX, D * KY)

def hatch(region, ang, step, w=0.8, op=0.85, keep=False, col=INK):
    """Hachures découpées dans region. En mode plateau, seules les hachures keep=True restent (plus espacées)."""
    if not full():
        if not keep: return []
        step *= 1.5; w *= 1.05
    poly_ = region if hasattr(region, 'area') else Polygon(region)
    if not poly_.is_valid: poly_ = poly_.buffer(0)
    if poly_.is_empty or poly_.area < 1: return []
    a = math.radians(ang); ux, uy = math.cos(a), math.sin(a); nx, ny = -uy, ux
    minx, miny, maxx, maxy = poly_.bounds; cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
    Rr = math.hypot(maxx - minx, maxy - miny) / 2 + 2
    out = []; k = -Rr
    while k < Rr:
        p0 = (cx + nx * k - ux * Rr, cy + ny * k - uy * Rr); p1 = (cx + nx * k + ux * Rr, cy + ny * k + uy * Rr)
        seg = poly_.intersection(LineString([p0, p1]))
        for g in getattr(seg, 'geoms', [seg]):
            if g.is_empty or g.geom_type != 'LineString' or g.length < 1.5: continue
            (x0, y0), (x1, y1) = g.coords[0], g.coords[-1]
            sh = R.uniform(0, .12)
            out.append(stroke((x0 + (x1 - x0) * sh, y0 + (y1 - y0) * sh), (x1, y1), w * R.uniform(.75, 1.2), col, op, .25))
        k += step * R.uniform(.85, 1.15)
    return out
def xhatch(region, keep=True, step=1.8):
    return hatch(region, 45, step, .7, .75, keep) + (hatch(region, -45, step * 1.35, .6, .6, False))
def band_hatch(ps, a, b, depth, ang, step=1.8, keep=True):
    """Ombre dégradée le long de l'arête a-b (ombre d'un avant-toit)."""
    base = Polygon(ps).buffer(0)
    L = math.dist(a, b); nx, ny = -(b[1] - a[1]) / L, (b[0] - a[0]) / L
    c = base.centroid
    if (c.x - a[0]) * nx + (c.y - a[1]) * ny < 0: nx, ny = -nx, -ny
    out = []
    for i, (d, st) in enumerate([(depth * .4, step * .75), (depth * .75, step * 1.1), (depth, step * 1.7)]):
        bnd = Polygon([a, b, (b[0] + nx * d, b[1] + ny * d), (a[0] + nx * d, a[1] + ny * d)]).intersection(base)
        out += hatch(bnd, ang + i * 4, st, .75, .85, keep and i < 2)
    return out
def face(ps, col, extras=(), w=2.2):
    s = [fillp(ps, col)]
    for e in extras: s += e
    s.append(outline(ps, w))
    return s
def clip_box(ps, x0, y0, x1, y1):
    return Polygon(ps).buffer(0).intersection(box(x0, y0, x1, y1))

# ---------------- sol ----------------
_rp = random.Random(99)
_DOTS = ''.join(f'<circle cx="{_rp.uniform(0, 40):.1f}" cy="{_rp.uniform(0, 40):.1f}" r="{_rp.uniform(.3, .55):.2f}" opacity="{_rp.uniform(.25, .55):.2f}"/>' for _ in range(16))
_DASH = ''.join(f'<path d="M{_rp.uniform(0, 36):.1f},{_rp.uniform(2, 38):.1f} h{_rp.uniform(2, 3.5):.1f}" stroke="#1A100A" stroke-width=".55" opacity=".4"/>' for _ in range(4))
def ground(W, H, col, seed=1, cobble_zone=None):
    pid = 'slg' + ('f' if full() else 'l')
    dots = _DOTS + (_DASH if full() else '')
    s = [f'<defs><pattern id="{pid}" width="40" height="40" patternUnits="userSpaceOnUse"><g fill="#1A100A" stroke="none">{dots}</g></pattern></defs>',
         f'<rect x="0" y="0" width="{W}" height="{H}" rx="7" fill="{col}" stroke="none"/>',
         f'<rect x="0" y="0" width="{W}" height="{H}" rx="7" fill="url(#{pid})" stroke="none"/>']
    if cobble_zone is not None and full():
        s += cobbles(cobble_zone, seed)
    return s
def cobbles(region, seed, density=1.0):
    rnd = random.Random(seed); s = []
    minx, miny, maxx, maxy = region.bounds; y = miny + 2
    while y < maxy:
        x = minx + rnd.uniform(0, 4)
        while x < maxx:
            rx, ry = rnd.uniform(1.3, 2.1), rnd.uniform(.9, 1.3)
            if region.contains(Point(x, y)) and rnd.random() < .55 * density:
                s.append(f'<ellipse cx="{f(x)}" cy="{f(y)}" rx="{f(rx)}" ry="{f(ry)}" fill="{rnd.choice([P["cobble"], P["earth2"]])}" stroke="{INK}" stroke-width=".55"/>')
            x += rnd.uniform(4.5, 7)
        y += rnd.uniform(3.5, 5)
    return s
def grass(cx, cy, n=5, k=1.0, col=None):
    col = col or P['grass_d']; s = []
    for i in range(n):
        a = -math.pi / 2 + (i - n / 2) * .28
        s.append(stroke((cx + (i - n / 2) * 1.1 * k, cy), (cx + (i - n / 2) * 1.1 * k + math.cos(a) * 5 * k, cy + math.sin(a) * 5 * k), .9, col, 1, .2))
    return s
def shadow(ps):
    return xhatch(ps, True, 1.7)

# ---------------- matières ----------------
def stones(x, y0, w, h, seed, region=None):
    rnd = random.Random(seed); s = []
    region = region if region is not None else box(x, y0 - h, x + w, y0)
    if not full():
        y = y0; row = 0
        while y > y0 - h + 2:
            rh = 6.5
            s.append(stroke((x + 1, y - rh), (x + w - 1, y - rh), .8, INK, .7, 0))
            xx = x + (6 if row % 2 else 1)
            while xx < x + w - 2:
                s.append(stroke((xx, y), (xx, y - rh), .7, INK, .6, 0)); xx += 12
            y -= rh; row += 1
        return s
    y = y0; row = 0
    while y > y0 - h + 1:
        rh = rnd.uniform(5.5, 7.5); xx = x - rnd.uniform(0, 6) if row % 2 else x
        while xx < x + w:
            sw = rnd.uniform(7, 13)
            r = box(xx + .7, y - rh + .7, xx + sw - .7, y - .7).intersection(region)
            if not r.is_empty and r.area > 4 and r.geom_type == 'Polygon':
                ps = list(r.exterior.coords)[:-1]
                s.append(fillp(ps, rnd.choice([P['stone'], P['stone2'], P['stone3']])))
                bx0, by0, bx1, by1 = r.bounds
                s += hatch(box(bx0 + (bx1 - bx0) * .45, by1 - 2.2, bx1, by1).intersection(r), 40, 1.6, .6, .7)
                s.append(f'<path d="{path_d(wobble(ps, True, .35, 2.5))}" fill="none" stroke="{INK}" stroke-width=".9" stroke-linejoin="round"/>')
                s.append(stroke((bx0 + 1, by0 + 1.2), (bx0 + (bx1 - bx0) * .5, by0 + 1.2), .7, P['light'], .8, 0))
            xx += sw
        y -= rh; row += 1
    return s
def beam(a, b, w=2.2):
    (x0, y0), (x1, y1) = a, b; L = math.hypot(x1 - x0, y1 - y0)
    nx, ny = -(y1 - y0) / L * w / 2, (x1 - x0) / L * w / 2
    ps = [(x0 + nx, y0 + ny), (x1 + nx, y1 + ny), (x1 - nx, y1 - ny), (x0 - nx, y0 - ny)]
    s = [fillp(ps, P['timber'])]
    if full(): s.append(stroke(lerp(ps[0], ps[3], .3), lerp(ps[1], ps[2], .3), .5, P['timber_l'], .9, 0))
    s.append(outline(ps, 1.0))
    return s
def roof_tex(E1, E2, R2, R1, mat, rows):
    """Texture d'un pan : E1-E2 = égout, R1-R2 = faîtage."""
    s = []
    if mat == 'thatch':
        for i in range(rows):
            t0, t1 = i / rows, min((i + 1.15) / rows, 1)
            a0, b0, a1, b1 = lerp(E1, R1, t0), lerp(E2, R2, t0), lerp(E1, R1, t1), lerp(E2, R2, t1)
            L = math.dist(a0, b0)
            n = int(L / (1.6 if full() else 4.5))
            for j in range(n):
                u = (j + R.uniform(0, .8)) / n
                p = lerp(a0, b0, u); q = lerp(p, lerp(a1, b1, u), R.uniform(.55, .95))
                col = R.choice([INK, INK, P['thatch_s'], P['thatch_s'], P['light']]) if full() else INK
                s.append(stroke(p, q, R.uniform(.45, .8), col, .75 if col == INK else .9, 0))
            wave = []
            m = int(L / 4) + 1
            for j in range(m + 1):
                p = lerp(a0, b0, j / m); wave.append((p[0], p[1] + (1.2 if j % 2 else -.3)))
            s.append(curve(wave, 1.1))
        return s
    for i in range(rows):
        t0, t1 = i / rows, (i + 1) / rows
        a0, b0, a1, b1 = lerp(E1, R1, t0), lerp(E2, R2, t0), lerp(E1, R1, t1), lerp(E2, R2, t1)
        L = math.dist(a0, b0)
        size = 6.5 if mat == 'tile' else 5.5
        n = max(3, int(L / size))
        if not full():
            s.append(stroke(a0, b0, .9, INK, .9, 0))
            for j in range(n):
                u = (j + (.5 if i % 2 else 0)) / n
                if u < 1: s.append(stroke(lerp(a0, b0, u), lerp(a1, b1, u), .6, INK, .6, 0))
            continue
        for j in range(n):
            u0, u1 = (j + (.5 if i % 2 else 0)) / n, min((j + 1 + (.5 if i % 2 else 0)) / n, 1)
            if u0 >= 1: continue
            p0, p1, q0, q1 = lerp(a0, b0, u0), lerp(a0, b0, u1), lerp(a1, b1, u0), lerp(a1, b1, u1)
            if mat == 'tile':
                s.append(fillp([p0, p1, q1, q0], R.choice([P['tile'], P['tile'], P['tile2']])))
                mid = lerp(p0, p1, .5)
                s.append(f'<path d="M{f(p0[0])},{f(p0[1])} Q{f(mid[0])},{f(mid[1] + 2.4)} {f(p1[0])},{f(p1[1])}" fill="none" stroke="{INK}" stroke-width=".9"/>')
                s.append(stroke(lerp(p0, p1, .78), lerp(q0, q1, .78), .7, INK, .8, 0))
                s.append(stroke(lerp(p0, p1, .88), lerp(q0, q1, .88), .6, INK, .7, 0))
                s.append(stroke(lerp(p0, p1, .2), lerp(q0, q1, .25), .6, P['light'], .55, 0))
            else:  # ardoise
                s.append(fillp([p0, p1, q1, q0], R.choice([P['slate'], P['slate'], P['slate2']])))
                s.append(stroke(p0, p1, .9, INK, 1, 0)); s.append(stroke(p1, lerp(p1, q1, .9), .7, INK, .9, 0))
                s.append(stroke(lerp(p0, p1, .7), lerp(lerp(p0, p1, .7), lerp(q0, q1, .7), .7), .5, INK, .6, 0))
                s.append(stroke(lerp(p0, p1, .15), lerp(p0, p1, .5), .6, P['light'], .5, 0))
    return s

# ---------------- maisons ----------------
def walls_side(x, yg, w, h, D, col):
    top = yg - h; d = dk(D)
    side = [(x + w, yg), add((x + w, yg), d), add((x + w, top), d), (x + w, top)]
    return side, face(side, col, [hatch(side, 30, 1.8, .7, .8, True), hatch(side, -60, 3.2, .5, .5)])

def house_gable(x, yg, w, h, D, rh, o, wall='plaster', roof='tile', timbers=True, door=True, win=True, seed=1, shadow_=True):
    """Maison à pignon en façade."""
    s = []; top = yg - h; d = dk(D)
    if shadow_: s += shadow([(x + w, yg + 1), (x + w + 10, yg + 2), add((x + w + 14, yg + 1), d), add((x + w, yg), d)])
    sidecol = P['stone_s'] if wall == 'stone' else (P['wood_s'] if wall == 'planks' else P['plaster_s'])
    side, ss = walls_side(x, yg, w, h, D, sidecol); s += ss
    if wall == 'plaster' and timbers:
        s += beam((x + w, yg - 1), add((x + w, yg - 1), d), 1.8) + beam((x + w, top + 1), add((x + w, top + 1), d), 1.8)
        s += beam(add((x + w, yg), dk(D / 2)), add((x + w, top), dk(D / 2)), 1.8)
    Fa = (x + w / 2, top - rh)
    L1, R1 = (x - o, top + o * rh / (w / 2)), (x + w + o, top + o * rh / (w / 2))
    left = [L1, Fa, add(Fa, d), add(L1, d)]; right = [Fa, R1, add(R1, d), add(Fa, d)]
    c1, c2 = P[roof], P[roof + '2'] if roof != 'thatch' else P['thatch2']
    s += face(left, c1, [roof_tex(L1, add(L1, d), add(Fa, d), Fa, roof, 6)])
    s += face(right, c2, [roof_tex(R1, add(R1, d), add(Fa, d), Fa, roof, 6), hatch(right, 20, 1.6, .6, .75, True)])
    front = [(x, yg), (x + w, yg), (x + w, top), Fa, (x, top)]
    fcol = P['stone'] if wall == 'stone' else (P['wood2'] if wall == 'planks' else P['plaster'])
    s.append(fillp(front, fcol))
    if wall == 'stone': s += stones(x, yg, w, h + rh, seed, Polygon(front))
    if wall == 'planks':
        for i in range(1, int((h + rh) / 4.5)):
            yy = yg - i * 4.5
            seg = Polygon(front).intersection(LineString([(x - 1, yy), (x + w + 1, yy)]))
            if not seg.is_empty and seg.geom_type == 'LineString':
                s.append(stroke(seg.coords[0], seg.coords[-1], .8, INK, .8, 0))
    s += band_hatch(front, (x, top), (x + w, top), 8, -25)
    s.append(outline(front, 2.3))
    if wall == 'plaster' and timbers:
        for xx in (x + 1.2, x + w / 2, x + w - 1.2): s += beam((xx, yg), (xx, top), 2.2)
        s += beam((x, top + h * .5), (x + w, top + h * .5), 2.1) + beam((x, top + 1.2), (x + w, top + 1.2), 2.1)
        if (seed % 2) == 0:
            s += beam((x + 2, top + h * .5), (x + w / 2 - 1, top + 3), 1.6) + beam((x + w / 2 + 1, top + 3), (x + w - 2, top + h * .5), 1.6)
        s += beam((x + w / 2, top), Fa, 2.1)
    # rives
    for a, b, col in ((L1, Fa, c1), (Fa, R1, c2)):
        rv = [a, b, add(b, (0, -3)), add(a, (-1.2 if a == L1 else 0, -2.8))]
        s += face(rv, col, [hatch(rv, 70, 1.3, .6, .8)], 1.5)
    if door:
        dx = x + w * .12; dw = min(11, w * .28); dh = min(16, h * .48)
        dr = [(dx, yg), (dx, yg - dh), (dx + dw, yg - dh), (dx + dw, yg)]
        s += face(dr, P['door'], [hatch(dr, 90, 2.4, .7, .9, True)], 1.4)
    if win:
        wx = x + w * .62; ww = min(10, w * .24)
        wn = [(wx, yg - h * .42), (wx + ww, yg - h * .42), (wx + ww, yg - h * .2), (wx, yg - h * .2)]
        s += face(wn, P['win'], [], 1.3)
        s += face([(x + w / 2 - 4, top - rh * .55), (x + w / 2 + 4, top - rh * .55), (x + w / 2 + 4, top - rh * .2), (x + w / 2 - 4, top - rh * .2)], P['win'], [], 1.2)
    return s

def house_long(x, yg, w, h, D, rh, o, wall='stone', roof='thatch', seed=1, timbers=False, shadow_=True, rows=6, openwall=False):
    """Bâtiment long, faîtage parallèle à la façade. Retourne (svg, géométrie utile)."""
    s = []; top = yg - h; d = dk(D); half = dk(D / 2); e = 3
    if shadow_: s += shadow([(x + 4, yg + 1), (x + w + 10, yg + 1), add((x + w + 18, yg + 2), d), add((x + 10, yg), d)])
    G1, G2 = (x + w, top), add((x + w, top), d); Ga = add(add((x + w, top), half), (0, -rh))
    side = [(x + w, yg), add((x + w, yg), d), G2, Ga, G1]
    scol = P['stone_s'] if wall == 'stone' else P['plaster_s']
    if not openwall:
        s += face(side, scol, [hatch(side, 30, 1.5, .7, .85, True), hatch(side, -55, 2.8, .5, .55)])
        if wall == 'stone':
            for k in range(1, int(h / 6.5) + 1):
                yy = yg - k * 6.5
                s.append(stroke((x + w + .5, yy), add((x + w - .5, yy), d), .8, INK, .8, 0))
    else:
        s += face([G1, Ga, G2], P['plaster_s'], [hatch([G1, Ga, G2], 30, 1.6, .7, .8, True)])
    front = [(x, yg), (x + w, yg), (x + w, top), (x, top)]
    if not openwall:
        s.append(fillp(front, P['stone'] if wall == 'stone' else P['plaster']))
        if wall == 'stone': s += stones(x, yg, w, h, seed)
        s += band_hatch(front, (x, top), (x + w, top), 8, -20)
        s.append(outline(front, 2.3))
        if timbers:
            n = max(2, int(w / 22))
            for i in range(n + 1): s += beam((x + 1 + (w - 2) * i / n, yg), (x + 1 + (w - 2) * i / n, top), 2.1)
            s += beam((x, top + h * .5), (x + w, top + h * .5), 2) + beam((x, top + 1.2), (x + w, top + 1.2), 2)
    E1, E2 = (x - o, top + e), (x + w + o, top + e)
    R1, R2 = add(add(E1, half), (0, -rh - e)), add(add(E2, half), (0, -rh - e))
    B2 = add(E2, d)
    rs = P[roof + '_s']
    edge = [R2, B2, add(B2, (-o, 4)), G2, Ga]
    s += face(edge, rs, [hatch(edge, 25, 1.4, .7, .9, True)], 1.8)
    roof_ = [E1, E2, R2, R1]
    s.append(fillp(roof_, P[roof]))
    s += roof_tex(E1, E2, R2, R1, roof, rows)
    s += hatch(Polygon([E1, E2, lerp(E2, R2, .3), lerp(E1, R1, .3)]), -15, 2.0, .6, .55)
    eave = [E1, E2, add(E2, (0, 3.5)), add(E1, (0, 3.5))]
    s += face(eave, rs, [hatch(eave, 80, 1.1, .7, .9, True)], 1.5)
    s.append(outline(roof_, 2.4))
    s.append(curve(wobble([R1, R2], False, .3), 3))
    return s, dict(top=top, E1=E1, E2=E2, R1=R1, R2=R2)

def door_arch(cx, yg, dw, dh, col=None):
    col = col or P['door']; r = dw / 2
    ps = [(cx - r, yg)] + [(cx - r * math.cos(t), yg - dh + r - r * math.sin(t)) for t in [i * math.pi / 10 for i in range(11)]] + [(cx + r, yg)]
    s = [fillp(ps, col)]
    if full():
        for i in range(1, 5):
            xx = cx - r + dw * i / 5
            s.append(stroke((xx, yg), (xx, yg - dh + 2 + abs(xx - cx) * .5), .8, INK, .9, 0))
    s += hatch(Polygon(ps).intersection(box(cx, yg - dh, cx + r, yg)), 75, 1.6, .6, .8, True)
    s.append(outline(ps, 1.6, False))
    return s
def window_arch(cx, cy, w, h):
    r = w / 2
    ps = [(cx - r, cy + h / 2)] + [(cx - r * math.cos(t), cy - h / 2 + r - r * math.sin(t)) for t in [i * math.pi / 8 for i in range(9)]] + [(cx + r, cy + h / 2)]
    return [fillp(ps, P['win']), outline(ps, 1.2)]

def sack(cx, cy, k=1.0):
    ps = [(cx - 5*k, cy + 4*k), (cx - 6*k, cy - 1*k), (cx - 3*k, cy - 5*k), (cx - 1.5*k, cy - 7.5*k), (cx + 1.5*k, cy - 7.5*k), (cx + 3*k, cy - 5*k), (cx + 6*k, cy - 1*k), (cx + 5*k, cy + 4*k)]
    s = [fillp(ps, P['sack'])] + hatch(Polygon(ps).intersection(box(cx + 1*k, cy - 8*k, cx + 7*k, cy + 5*k)), 60, 1.4, .55, .8)
    return s + [outline(ps, 1.2), stroke((cx - 2*k, cy - 5*k), (cx + 2*k, cy - 5*k), 1, INK, 1, 0)]
def barrel(cx, cy, k=1.0):
    w, h = 9*k, 12*k
    ps = [(cx - w/2, cy - h/2), (cx + w/2, cy - h/2), (cx + w/2 + 1*k, cy), (cx + w/2, cy + h/2), (cx - w/2, cy + h/2), (cx - w/2 - 1*k, cy)]
    s = [fillp(ps, P['wood'])] + hatch(Polygon(ps).intersection(box(cx + w*.1, cy - h, cx + w, cy + h)), 75, 1.3, .6, .85, True)
    for yy in (-h*.28, h*.28): s.append(stroke((cx - w/2 - .6*k, cy + yy), (cx + w/2 + .6*k, cy + yy), 1.3, P['iron'], 1, 0))
    return s + [outline(ps, 1.3), f'<ellipse cx="{f(cx)}" cy="{f(cy - h/2)}" rx="{f(w/2)}" ry="{f(1.8*k)}" fill="{P["wood_s"]}" stroke="{INK}" stroke-width="1.1"/>']
def tree(cx, cy, r, seed=0):
    rnd = random.Random(seed); s = []
    s += shadow([(cx, cy + r * .9), (cx + r * 1.4, cy + r * .9), (cx + r * 1.8, cy + r * .5), (cx + r * .4, cy + r * .5)])
    tr = [(cx - r * .14, cy + r * .95), (cx - r * .1, cy), (cx + r * .1, cy), (cx + r * .16, cy + r * .95)]
    s += face(tr, P['trunk'], [], 1.2)
    blobs = [(0, 0, 1)] + [(rnd.uniform(-.6, .6), rnd.uniform(-.55, .15), rnd.uniform(.5, .7)) for _ in range(5)]
    union = None
    for bx, by, br in blobs:
        c = Point(cx + bx * r, cy - r * .3 + by * r).buffer(r * br, 10)
        union = c if union is None else union.union(c)
    ps = list(union.exterior.coords)
    s.append(fillp(ps, P['leaf']))
    s += hatch(union.intersection(box(cx - r * .1, cy - r * 2, cx + r * 2, cy + r)), 35, 1.5, .7, .85, True)
    s += hatch(union.intersection(box(cx - r * 2, cy - r * .1, cx + r * 2, cy + r)), -30, 2.2, .6, .7)
    if full():
        for _ in range(int(r)):
            a = rnd.uniform(0, 6.28); rr = rnd.uniform(.2, .8) * r
            px, py = cx + math.cos(a) * rr * .8, cy - r * .4 + math.sin(a) * rr * .6
            s.append(f'<path d="M{f(px - 2)},{f(py)} q2,-2 4,0" fill="none" stroke="{INK}" stroke-width=".7"/>')
    s.append(f'<circle cx="{f(cx - r * .35)}" cy="{f(cy - r * .75)}" r="{f(r * .28)}" fill="{P["leaf_l"]}"/>')
    s.append(outline(ps, 1.8))
    return s
def log_end(cx, cy, r):
    s = [f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r)}" fill="#D9A666" stroke="{INK}" stroke-width="1.1"/>']
    if full(): s.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r * .55)}" fill="none" stroke="{P["wood_s"]}" stroke-width=".6"/>')
    s.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(r * .15)}" fill="{P["wood_s"]}"/>')
    return s
def flag(x, y, h, col):
    return [stroke((x, y), (x, y - h), 1.5, INK, 1, 0),
            f'<path d="M{f(x)},{f(y - h)} q6,-2 12,1.5 q-5,2 -1,5 q-5,-2 -11,0 Z" fill="{col}" stroke="{INK}" stroke-width="1"/>']

# =================== BÂTIMENTS ===================
def champ():
    W = H = 200; s = ground(W, H, P['grass'], 21)
    q = [(16, 184), (184, 184), (176, 20), (24, 20)]
    s.append(fillp(q, P['wheat']))
    rows = 16
    for i in range(rows):
        t0, t1 = i / rows, (i + 1) / rows
        a0, b0 = lerp(q[0], q[1], t0), lerp(q[3], q[2], t0)
        a1, b1 = lerp(q[0], q[1], t1), lerp(q[3], q[2], t1)
        rowp = [a0, a1, b1, b0]
        if i % 2: s.append(fillp(rowp, P['wheat2']))
        s.append(stroke(a0, b0, 1.1, P['wheat_d'], 1, .3))
        n = 18 if full() else 7
        for j in range(n):
            t = (j + .5) / n; p = lerp(lerp(a0, b0, t), lerp(a1, b1, t), .5)
            sc = .6 + .7 * (1 - t)
            s.append(curve([(p[0] - 1.8 * sc, p[1] - 2.6 * sc), p, (p[0] + 1.8 * sc, p[1] - 2.6 * sc)], .8, INK, .8))
            if full(): s.append(stroke(p, (p[0], p[1] - 4 * sc), .6, P['wheat_d'], 1, 0))
    s += hatch(Polygon([q[1], q[2], lerp(q[2], q[3], .25), lerp(q[1], q[0], .25)]), 60, 2.2, .6, .5, True)
    stubble = [(16, 184), (184, 184), (182, 152), (18, 152)]
    s.append(fillp(stubble, '#EFD58E'))
    s += hatch(stubble, 80, 2.4, .5, .5)
    s.append(outline(q, 2.2))
    for x in (40, 84, 128, 166):
        s += shadow([(x, 178), (x + 14, 178), (x + 17, 172), (x + 4, 172)])
        cone = [(x - 7, 178), (x - 2, 158), (x, 154), (x + 2, 158), (x + 7, 178)]
        s += face(cone, P['wheat_d'], [hatch(Polygon(cone).intersection(box(x, 150, x + 9, 180)), 70, 1.3, .6, .85, True)], 1.4)
        s.append(stroke((x - 5, 169), (x + 5, 169), 1.4, INK, 1, 0))
    # haie
    hedge = Polygon([(0, 0), (200, 0), (200, 200), (0, 200)]).difference(Polygon([(10, 10), (190, 10), (190, 190), (10, 190)]))
    for bx in range(6, 200, 9):
        for by in (6, 194):
            s.append(f'<circle cx="{bx}" cy="{by}" r="5.5" fill="{P["leaf"]}" stroke="{INK}" stroke-width="1"/>')
    for by in range(15, 190, 9):
        for bx in (6, 194):
            s.append(f'<circle cx="{bx}" cy="{by}" r="5.5" fill="{P["leaf"]}" stroke="{INK}" stroke-width="1"/>')
    return W, H, s

def bucheron():
    W = H = 100; s = ground(W, H, P['grass'], 22)
    s += tree(20, 26, 14, 1) + tree(82, 20, 11, 2)
    s += grass(10, 92) + grass(92, 70) + grass(50, 96, 4)
    s += house_gable(12, 82, 36, 22, 24, 15, 3, 'planks', 'thatch', False, True, False, 3)
    for row, (cy, n) in enumerate([(89, 4), (82, 3), (75, 2)]):
        for i in range(n): s += log_end(60 + i * 8.2 + row * 4.1, cy, 4.2)
    # billot à part, au-dessus du tas, hache plantée dans le bois
    s += shadow([(70, 64), (86, 64), (88, 60), (72, 60)])
    st = [(71, 63), (71, 55), (85, 55), (85, 63)]
    s += face(st, P['wood'], [hatch(st, 80, 1.4, .6, .8, True)], 1.2)
    s.append(f'<ellipse cx="78" cy="55" rx="7" ry="2.5" fill="#D9A666" stroke="{INK}" stroke-width="1.1"/>')
    s.append(f'<path d="M76 55.4c1-.6 3-.6 4 0" stroke="#A8743A" stroke-width=".6" fill="none"/>')
    s.append(stroke((79, 54), (89, 40), 3.2, P['trunk'], 1.3, 0))
    s += face([(73.5, 56), (75.5, 51), (83, 51.6), (83, 56.2)], '#9AA2AA', [], 1.2)
    s.append(f'<path d="M75.6 52.6h6.4" stroke="#DDE2E6" stroke-width=".8"/>')
    return W, H, s

def carriere():
    W = H = 100; s = ground(W, H, P['grass'], 23)
    sl = -0.07
    def band(y0, y1): return [(5, y0), (95, y0 + 90 * sl), (95, y1 + 90 * sl), (5, y1)]
    s.append(fillp([(0, 0), (100, 0), (100, 14), (0, 21)], P['grass2']))
    s += grass(14, 15, 5, .8) + grass(42, 13, 5, .8) + grass(72, 10, 5, .8)
    for y0, y1, seed in ((21, 42, 1), (50, 67, 2)):
        b = band(y0, y1)
        s.append(fillp(b, P['stone_s']))
        s += stones(0, 0, 0, 0, 0)[:0]
        reg = Polygon(b)
        s += stones(5, y1 + 3, 90, y1 - y0 + 9, seed, reg)
        s += hatch(reg, 30, 1.6, .6, .55, True)
        s.append(outline(b, 2.2))
    top1 = band(42, 50)
    s += face(top1, P['stone3'], [hatch(top1, 5, 2.4, .5, .5)], 1.6)
    floor = [(5, 67), (95, 67 + 90 * sl), (95, 96), (5, 96)]
    s += face(floor, '#E3D3AE', [], 1.4)
    s.append(fillp([(0, 21), (5, 21), (5, 97), (0, 97)], P['grass2'])); s.append(fillp([(95, 14), (100, 14), (100, 97), (95, 97)], P['grass2']))
    rnd = random.Random(5)
    for _ in range(14 if full() else 6):
        x, y = rnd.uniform(10, 90), rnd.uniform(72, 94)
        s.append(f'<ellipse cx="{f(x)}" cy="{f(y)}" rx="{f(rnd.uniform(1, 2))}" ry="{f(rnd.uniform(.8, 1.3))}" fill="{P["stone_d"]}" stroke="{INK}" stroke-width=".5"/>')
    def bloc(x, y, w, h, dd):
        top = [(x, y), (x + w, y), add((x + w, y), dk(dd)), add((x, y), dk(dd))]
        side = [(x + w, y), add((x + w, y), dk(dd)), add((x + w, y + h), dk(dd)), (x + w, y + h)]
        fr = [(x, y), (x + w, y), (x + w, y + h), (x, y + h)]
        return face(top, '#F3E7C8', [], 1.1) + face(side, P['stone_s'], [hatch(side, 30, 1.3, .6, .85, True)], 1.1) + face(fr, P['stone'], [hatch(fr, 70, 2.4, .5, .5)], 1.1)
    s += shadow([(12, 92), (48, 92), (52, 88), (16, 88)])
    s += bloc(12, 82, 16, 9, 9) + bloc(30, 83, 15, 8, 9) + bloc(19, 73, 14, 8, 8)
    s += [stroke((56, 94), (68, 52), 2.6, P['wood_s'], 1, 0), stroke((80, 94), (68, 52), 2.6, P['wood_s'], 1, 0), stroke((62, 92), (68, 52), 2, P['wood'], 1, 0)]
    s.append(stroke((68, 52), (68, 74), .9, INK, 1, 0)); s += bloc(63, 74, 10, 6, 5)
    s += [stroke((84, 94), (91, 81), 1.8, P['trunk'], 1, 0)]; s.append(curve([(87, 79), (92, 81), (95, 86)], 1.8, '#7E868E'))
    return W, H, s

def atelier():
    W = H = 100; s = ground(W, H, P['earth'], 24, Polygon([(2, 98), (98, 98), (98, 88), (2, 93)]))
    s += house_gable(6, 86, 44, 36, 24, 22, 3, 'plaster', 'tile', True, True, True, 2)
    s.append(stroke((51, 56), (59, 53), 1.6, P['iron'], 1, 0))
    s += face([(55, 55), (60, 54), (60, 62), (55, 63)], P['red'], [], 1.1)
    s += beam((66, 90), (66, 46), 2.4) + beam((94, 84), (94, 40), 2.4) + beam((64, 47), (96, 41), 2)
    for i, col in enumerate([P['blue'], P['red'], P['ochre']]):
        x0 = 68.5 + i * 8.6; y0 = 46.6 - i * 1.6
        cloth = [(x0, y0), (x0 + 7.5, y0 - 1.4), (x0 + 7.8, y0 + 24), (x0 + 5.5, y0 + 26.5), (x0 + 3.5, y0 + 25), (x0 + 1.2, y0 + 26.8), (x0 - .4, y0 + 25.5)]
        s += face(cloth, col, [hatch(Polygon(cloth).intersection(box(x0 + 4.5, y0 - 2, x0 + 9, y0 + 28)), 80, 1.3, .6, .8, True)], 1.2)
        if full(): s.append(stroke((x0 + 2.2, y0 + 1), (x0 + 2.8, y0 + 23), .8, P['light'], .6, 0))
    s += shadow([(52, 95), (66, 95), (70, 92), (56, 92)])
    vat = [(46, 82), (62, 82), (60.5, 95), (47.5, 95)]
    s += face(vat, P['wood'], [hatch(Polygon(vat).intersection(box(55, 80, 64, 96)), 80, 1.3, .6, .85, True)], 1.4)
    s += [stroke((46.6, 87), (61.4, 87), 1.4, P['iron'], 1, 0), stroke((47.2, 92), (60.8, 92), 1.4, P['iron'], 1, 0)]
    s.append(f'<ellipse cx="54" cy="82" rx="8" ry="2.6" fill="{P["water"]}" stroke="{INK}" stroke-width="1.3"/>')
    s += barrel(88, 90, .8)
    return W, H, s

def grenier():
    W, H = 200, 100; s = ground(W, H, P['earth'], 25, Polygon([(70, 98), (130, 98), (114, 86), (86, 86)]))
    x, yg, w, h = 16, 86, 140, 26
    hs, g = house_long(x, yg, w, h, 34, 30, 5, 'stone', 'thatch', 2); s += hs
    s += door_arch(x + w / 2, yg, 26, 22)
    for yy in (yg - 6, yg - 15):
        s += [stroke((x + w / 2 - 12, yy), (x + w / 2 - 2, yy), 1.5, P['iron'], 1, 0), stroke((x + w / 2 + 2, yy), (x + w / 2 + 12, yy), 1.5, P['iron'], 1, 0)]
    s.append(stroke((x + w / 2, yg), (x + w / 2, yg - 22), 1.3, INK, 1, 0))
    for xx in (x + 20, x + w - 24):
        s += face([(xx, yg - 19), (xx + 4, yg - 19), (xx + 4, yg - 9), (xx, yg - 9)], P['win'], [], 1.3)
    for (sx_, sy_, k) in ((22, 95, .72), (29, 96, .7), (25.5, 90, .68), (176, 95, .7), (183, 94.5, .66)): s += sack(sx_, sy_, k)
    for a, b in (((150, 97), (161, 54)), ((159, 97), (170, 54))): s += beam(a, b, 2)
    for t in (.12, .3, .48, .66, .84): s.append(stroke(lerp((150, 97), (161, 54), t), lerp((159, 97), (170, 54), t), 1.6, P['wood_s'], 1, 0))
    s += grass(4, 96) + grass(196, 92) + grass(140, 98, 4)
    return W, H, s

def halle():
    W, H = 200, 100; s = ground(W, H, P['earth'], 26, Polygon([(10, 99), (190, 99), (190, 90), (10, 90)]))
    x, yg, w, h, D = 16, 90, 140, 30, 34; d = dk(D)
    floor = [(x, yg), (x + w, yg), add((x + w, yg), d), add((x, yg), d)]
    s += face(floor, '#D7B680', [hatch(floor, 0, 3, .5, .5)], 1.2)
    for i in range(6):
        px = x + 6 + i * (w - 12) / 5 + D * KX; py = yg + D * KY
        s += face([(px - 2, py), (px - 2, py - h), (px + 2, py - h), (px + 2, py)], P['wood_s'], [], 1)
    s += xhatch([add((x, yg - h), d), add((x + w, yg - h), d), add((x + w, yg - h + 12), d), add((x, yg - h + 12), d)])
    for i, xx in enumerate((44, 82, 120)):
        tb = [(xx, yg - 16), (xx + 22, yg - 16), (xx + 22, yg - 12), (xx, yg - 12)]
        s += face(tb, P['wood2'], [], 1.1)
        s += [stroke((xx + 3, yg - 12), (xx + 3, yg - 2), 1.6, P['wood_s'], 1, 0), stroke((xx + 19, yg - 12), (xx + 19, yg - 2), 1.6, P['wood_s'], 1, 0)]
        cols = [P['red'], P['ochre'], P['green']]
        for k in range(3):
            s.append(f'<ellipse cx="{xx + 5 + k * 6}" cy="{yg - 17.5}" rx="2.8" ry="2" fill="{cols[(i + k) % 3]}" stroke="{INK}" stroke-width=".8"/>')
    s += barrel(32, 84, .9) + barrel(148, 84, .9)
    for i in range(6):
        px = x + 6 + i * (w - 12) / 5
        post = [(px - 2.6, yg), (px - 2.6, yg - h), (px + 2.6, yg - h), (px + 2.6, yg)]
        s += face(post, P['wood'], [hatch(Polygon(post).intersection(box(px, yg - h, px + 3, yg)), 80, 1.2, .6, .8, True)], 1.2)
        s += face([(px - 4.5, yg), (px - 4.5, yg - 3), (px + 4.5, yg - 3), (px + 4.5, yg)], P['stone'], [], 1)
        s.append(curve([(px - 7, yg - h + 1), (px, yg - h + 7), (px + 7, yg - h + 1)], 2, P['wood_s']))
    hs, g = house_long(x, yg, w, h, D, 28, 6, 'plaster', 'tile', 6, shadow_=False, openwall=True, rows=7); s += hs
    return W, H, s

def quartier():
    W, H = 200, 100; s = ground(W, H, P['earth'], 27, Polygon([(2, 99), (198, 99), (198, 92), (2, 92)]))
    specs = [(8, 34, 36, 'tile', 'plaster'), (52, 30, 42, 'slate', 'plaster'), (94, 36, 34, 'tile', 'plaster'), (138, 32, 38, 'thatch', 'plaster')]
    for i, (x, w, h, roof, wall) in enumerate(specs):
        s += house_gable(x, 90 - (i % 2) * 2, w, h, 20, 17, 2.5, wall, roof, True, True, True, i)
    return W, H, s

def guet():
    W = H = 100; s = ground(W, H, P['grass'], 28)
    s += grass(12, 92) + grass(88, 92) + grass(18, 70)
    cx, yg, r, h = 46, 90, 17, 42
    s += shadow([(cx, yg + 4), (cx + 34, yg + 2), (cx + 40, yg - 6), (cx + 10, yg - 4)])
    def arc(y, rr, n=24, a0=0, a1=math.pi):
        return [(cx + rr * math.cos(a0 + (a1 - a0) * i / n), y + rr * .35 * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]
    body = [(cx + r, yg - h)] + arc(yg, r)[::1] + [(cx - r, yg - h)]
    body = [(cx - r, yg - h), (cx - r, yg)] + arc(yg, r)[::-1][1:] + [(cx + r, yg - h)]
    s.append(fillp(body, P['stone']))
    # assises courbes + pierres
    for k in range(1, 7):
        y = yg - k * 6.6
        s.append(curve(arc(y, r)[::-1], .9, INK, .85))
        if full():
            rnd = random.Random(k)
            for j in range(5):
                a = rnd.uniform(.25, 2.9)
                px, py = cx - r * math.cos(a), y + r * .35 * math.sin(a)
                s.append(stroke((px, py), (px, py - 6.6), .7, INK, .7, 0))
    shade = Polygon(body).intersection(box(cx + r * .25, yg - h - 5, cx + r + 2, yg + 10))
    s += hatch(shade, 80, 1.6, .7, .85, True) + hatch(shade, 20, 2.6, .5, .5)
    s.append(outline(body, 2.3))
    s += door_arch(cx - 4, yg + 5, 10, 15)
    s += window_arch(cx + 1, yg - 27, 5, 9)
    y0 = yg - h
    crown = [(cx - r - 4, y0), (cx - r - 4, y0 - 8)] + [(cx + (r + 4) * math.cos(math.pi - math.pi * i / 20), y0 - 8 + (r + 4) * .35 * math.sin(math.pi * i / 20)) for i in range(21)] + [(cx + r + 4, y0)] + [(cx + (r + 4) * math.cos(math.pi * i / 20), y0 + (r + 4) * .35 * math.sin(math.pi * i / 20)) for i in range(21)]
    s += face(crown, P['stone'], [hatch(Polygon(crown).buffer(0).intersection(box(cx + 6, y0 - 20, cx + 30, y0 + 10)), 80, 1.5, .6, .8, True)], 2)
    for k in range(5):
        xx = cx - r - 2 + k * 9.5
        mer = [(xx, y0 - 8), (xx, y0 - 14), (xx + 5.5, y0 - 14), (xx + 5.5, y0 - 8)]
        s += face(mer, P['stone'] if k < 3 else P['stone_s'], [hatch(mer, 80, 1.4, .6, .8, k >= 3)], 1.2)
    cone = [(cx - r - 2, y0 - 9), (cx, y0 - 34), (cx + r + 2, y0 - 9)] + [(cx + (r + 2) * math.cos(math.pi * i / 20), y0 - 9 + (r + 2) * .35 * math.sin(math.pi * i / 20)) for i in range(21)]
    s.append(fillp(cone, P['slate']))
    for k in range(1, 6):
        t = k / 6; yy = y0 - 34 + (25) * t; rr = (r + 2) * t
        s.append(curve([(cx + rr * math.cos(math.pi * i / 16), yy + rr * .35 * math.sin(math.pi * i / 16)) for i in range(17)], .9, INK, .85))
    if full():
        for i in range(1, 12):
            a = math.pi * i / 12
            s.append(stroke((cx, y0 - 34), (cx + (r + 2) * math.cos(a), y0 - 9 + (r + 2) * .35 * math.sin(a)), .6, INK, .6, 0))
    s += hatch(Polygon(cone).buffer(0).intersection(box(cx + 2, y0 - 45, cx + 30, y0)), 70, 1.5, .7, .85, True)
    s.append(outline(cone, 2.2))
    s += flag(cx, y0 - 34, 9, P['red'])
    br = [(74, 86), (74, 77), (86, 77), (86, 86)]
    s += face(br, P['wood'], [hatch(br, 80, 1.3, .6, .8, True)], 1.2)
    s.append(f'<ellipse cx="80" cy="76" rx="6" ry="2" fill="{P["fire"]}" stroke="{INK}" stroke-width="1"/>')
    s.append(curve([(77, 75), (79, 70), (80, 73), (82, 68), (83, 75)], 1, P['red'], 1, P['ochre']))
    return W, H, s

def choeur():
    W, H = 200, 100; s = ground(W, H, P['grass'], 29)
    s += grass(10, 94) + grass(190, 92) + grass(184, 68)
    x, yg, w, h, D = 18, 88, 92, 34, 30
    hs, g = house_long(x, yg, w, h, D, 22, 4, 'stone', 'slate', 9, rows=5); s += hs
    for xx in (x + 22, x + 50, x + 76): s += window_arch(xx, yg - 18, 6, 14)
    bx = x + 12; top = yg - h
    bell = [(bx, top - 6), (bx + 18, top - 6), (bx + 18, top - 32), (bx + 9, top - 40), (bx, top - 32)]
    s += face(bell, P['stone'], [hatch(Polygon(bell).intersection(box(bx + 12, top - 45, bx + 20, top)), 80, 1.4, .6, .8, True)], 2)
    s += face([(bx + 5, top - 14), (bx + 5, top - 24), (bx + 9, top - 28), (bx + 13, top - 24), (bx + 13, top - 14)], P['win'], [], 1.2)
    s.append(f'<circle cx="{bx + 9}" cy="{top - 19}" r="2.8" fill="{P["ochre"]}" stroke="{INK}" stroke-width=".9"/>')
    s += [stroke((bx + 9, top - 40), (bx + 9, top - 51), 1.8, INK, 1, 0), stroke((bx + 5, top - 47), (bx + 13, top - 47), 1.8, INK, 1, 0)]
    return W, H, s

def nef():
    W, H = 200, 100; s = ground(W, H, P['grass'], 30)
    s += grass(190, 92) + grass(8, 96)
    x, yg, w, h, D = 40, 88, 140, 32, 30
    hs, g = house_long(x, yg, w, h, D, 22, 4, 'stone', 'slate', 10, rows=5); s += hs
    for xx in range(int(x + 16), int(x + w - 8), 30):
        s += window_arch(xx, yg - 17, 6, 14)
        cf = [(xx + 11, yg), (xx + 11, yg - h + 2), (xx + 15, yg - h + 4), (xx + 15, yg)]
        s += face(cf, P['stone_s'], [hatch(cf, 80, 1.3, .6, .8, True)], 1.2)
    fx, fw, fh, frh = 12, 36, 40, 26
    s += house_gable(fx, yg, fw, fh, 8, frh, 2, 'stone', 'slate', False, False, False, 11, False)
    s += door_arch(fx + fw / 2, yg, 14, 20)
    s.append(curve([(fx + fw / 2 - 10, yg)] + [(fx + fw / 2 - 10 * math.cos(math.pi * i / 12), yg - 13 - 10 * math.sin(math.pi * i / 12)) for i in range(13)] + [(fx + fw / 2 + 10, yg)], 1.6, P['stone_d']))
    s.append(f'<circle cx="{fx + fw / 2}" cy="{yg - fh + 2}" r="5" fill="{P["win"]}" stroke="{INK}" stroke-width="1.2"/>')
    s.append(f'<circle cx="{fx + fw / 2}" cy="{yg - fh + 2}" r="2" fill="{P["ochre"]}"/>')
    s += [stroke((fx + fw / 2, yg - fh - frh), (fx + fw / 2, yg - fh - frh - 10), 1.8, INK, 1, 0), stroke((fx + fw / 2 - 4, yg - fh - frh - 6), (fx + fw / 2 + 4, yg - fh - frh - 6), 1.8, INK, 1, 0)]
    return W, H, s

def chancellerie():
    W = H = 100; s = ground(W, H, P['earth'], 31, Polygon([(2, 98), (98, 98), (98, 90), (2, 92)]))
    x, yg, w, h, D = 12, 86, 44, 40, 26
    hs, g = house_long(x, yg, w, h, D, 18, 3, 'stone', 'slate', 12, rows=4); s += hs
    s += door_arch(x + 14, yg, 11, 17)
    s += window_arch(x + 32, yg - 26, 7, 10) + window_arch(x + 12, yg - 28, 6, 9)
    tx, tr = x + w + 10, 8
    tw = [(tx - tr, yg - 52), (tx - tr, yg - 4)] + [(tx - tr * math.cos(math.pi * i / 12), yg - 4 + tr * .4 * math.sin(math.pi * i / 12)) for i in range(13)] + [(tx + tr, yg - 52)]
    s += face(tw, P['stone'], [hatch(Polygon(tw).buffer(0).intersection(box(tx + 1, yg - 60, tx + 12, yg + 5)), 80, 1.4, .7, .85, True)] + [[curve([(tx - tr * math.cos(math.pi * i / 10), yg - 4 - k * 6.5 + tr * .4 * math.sin(math.pi * i / 10)) for i in range(11)], .8, INK, .8) for k in range(1, 7)]], 2)
    cone = [(tx - tr - 1, yg - 52), (tx, yg - 72), (tx + tr + 1, yg - 52)] + [(tx + (tr + 1) * math.cos(math.pi * i / 12), yg - 52 + (tr + 1) * .4 * math.sin(math.pi * i / 12)) for i in range(13)]
    s += face(cone, P['slate'], [hatch(Polygon(cone).buffer(0).intersection(box(tx + 1, yg - 75, tx + 12, yg - 45)), 70, 1.3, .7, .85, True)], 1.8)
    s += face([(tx - 1.5, yg - 34), (tx + 1.5, yg - 34), (tx + 1.5, yg - 27), (tx - 1.5, yg - 27)], P['win'], [], 1)
    s.append(stroke((x + 22, yg - 20), (x + 31, yg - 20), 1.6, P['timber'], 1, 0))
    sign = [(x + 22, yg - 19), (x + 31, yg - 19), (x + 31, yg - 9), (x + 26.5, yg - 11), (x + 22, yg - 9)]
    s += face(sign, '#F4E8C8', [], 1)
    s.append(f'<circle cx="{x + 26.5}" cy="{yg - 15}" r="2.8" fill="{P["red"]}" stroke="{INK}" stroke-width=".9"/>')
    s += barrel(86, 90, .7)
    return W, H, s

def bourg():
    W, H = 300, 200; s = ground(W, H, P['earth'], 32)
    s.append(fillp([(0, 130), (300, 130), (300, 143), (0, 143)], P['cobble'])); s.append(fillp([(143, 0), (157, 0), (157, 200), (143, 200)], P['cobble']))
    if full():
        s += cobbles(Polygon([(0, 130), (300, 130), (300, 143), (0, 143)]), 33) + cobbles(Polygon([(143, 0), (157, 0), (157, 200), (143, 200)]), 34)
    rows = [
        [(8, 64, 44, 26, 'tile', 'g'), (62, 62, 60, 24, 'thatch', 'l'), (172, 64, 40, 28, 'slate', 'g'), (222, 62, 62, 24, 'tile', 'l')],
        [(8, 124, 62, 26, 'tile', 'l'), (80, 124, 40, 30, 'thatch', 'g'), (172, 124, 44, 28, 'tile', 'g'), (226, 122, 58, 24, 'slate', 'l')],
        [(10, 194, 42, 28, 'slate', 'g'), (60, 194, 64, 24, 'tile', 'l'), (172, 194, 60, 26, 'thatch', 'l'), (242, 194, 40, 30, 'tile', 'g')],
    ]
    global LV
    keep_lv = LV; LV = 'light'
    i = 0
    for row in rows:
        for (x, yg, w, h, mat, kind) in row:
            wall = 'stone' if mat == 'slate' else 'plaster'
            if kind == 'g':
                s += house_gable(x, yg, w, h, 20, 16, 2.5, wall, mat, wall == 'plaster', True, True, i)
            else:
                hs, g = house_long(x, yg, w, h, 20, 15, 3, wall, mat, i, timbers=(wall == 'plaster'), rows=4); s += hs
                s += face([(x + 5, yg), (x + 5, yg - 12), (x + 13, yg - 12), (x + 13, yg)], P['door'], [], 1.2)
                s += face([(x + w - 14, yg - h + 6), (x + w - 7, yg - h + 6), (x + w - 7, yg - h + 12), (x + w - 14, yg - h + 12)], P['win'], [], 1.1)
            i += 1
    LV = keep_lv
    cx, cy = 150, 138
    s.append(f'<ellipse cx="{cx}" cy="{cy + 2}" rx="10" ry="4.5" fill="{P["stone_s"]}" stroke="{INK}" stroke-width="2"/>')
    s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="8" ry="3.2" fill="{P["water"]}" stroke="{INK}" stroke-width="1.2"/>')
    s += [stroke((cx - 8, cy), (cx - 8, cy - 15), 2, P['wood_s'], 1, 0), stroke((cx + 8, cy), (cx + 8, cy - 15), 2, P['wood_s'], 1, 0), stroke((cx - 10, cy - 14), (cx + 10, cy - 14), 2.2, P['wood_s'], 1, 0)]
    return W, H, s

KINDS = dict(champ=champ, bucheron=bucheron, carriere=carriere, atelier=atelier, grenier=grenier, halle=halle,
             quartier=quartier, guet=guet, choeur=choeur, nef=nef, chancellerie=chancellerie, bourg=bourg)

def render(kind, level):
    global LV, R
    LV = level; R = random.Random(sum(map(ord, kind)) + (0 if level == "full" else 500))
    W, H, s = KINDS[kind]()
    return W, H, '<g fill="none" stroke="#1A100A" stroke-linecap="round" stroke-linejoin="round">' + ''.join(s) + '</g>'
