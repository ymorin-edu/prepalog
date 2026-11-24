# Décor du plateau Stratelog (12 x 8 cases, 100 unités par case), style gravure.
import math, random, sys
sys.path.insert(0, '.')
import stratelog_gravure as G
from shapely.geometry import Polygon, box, Point

G.LV = 'full'; G.R = random.Random(2024)
P, INK = G.P, G.INK
W, H, C = 1200, 800, 100

def decor():
    s = []
    rnd = random.Random(77)
    dots = ''.join(f'<circle cx="{rnd.uniform(0, 80):.1f}" cy="{rnd.uniform(0, 80):.1f}" r="{rnd.uniform(.5, 1):.1f}" opacity="{rnd.uniform(.25, .5):.2f}"/>' for _ in range(14))
    dashes = ''.join(f'<path d="M{x:.0f},{y:.0f} h{rnd.uniform(3, 6):.1f}" stroke="#1A100A" stroke-width=".8" opacity=".35"/>' for x, y in [(rnd.uniform(0, 74), rnd.uniform(2, 78)) for _ in range(3)])
    s.append(f'<defs><pattern id="slsol" width="80" height="80" patternUnits="userSpaceOnUse"><g fill="#1A100A" stroke="none">{dots}</g>{dashes}</pattern></defs>')
    s.append(f'<rect x="0" y="0" width="{W}" height="{H}" fill="#E8CD92" stroke="none"/>')
    s.append(f'<rect x="0" y="0" width="{W}" height="{H}" fill="url(#slsol)" stroke="none"/>')
    # prairie des champs (rangées 4 à 7) et marges herbeuses
    meadow = [(0, 400), (1110, 400), (1110, 800), (0, 800)]
    s.append(G.fillp(meadow, P['grass']))
    s.append(f'<rect x="0" y="400" width="1110" height="400" fill="url(#slsol)" stroke="none" opacity=".6"/>')
    s += G.hatch(Polygon(meadow), 8, 9, .5, .35)
    for _ in range(70):
        x, y = G.R.uniform(10, 1090), G.R.uniform(410, 790)
        s += G.grass(x, y, 4, 1.1)
    side = [(100, 0), (190, 0), (190, 400), (100, 400)]
    s.append(G.fillp(side, P['grass2'])); s.append(G.fillp([(1010, 0), (1100, 0), (1100, 400), (1010, 400)], P['grass2']))
    # forêt (colonne 0, rangées 0 à 4)
    forest = [(0, 0), (112, 0), (104, 120), (118, 260), (106, 380), (114, 500), (0, 505)]
    s += G.face(forest, '#4F7A27', [G.hatch(forest, 35, 3.2, .6, .5, True)], 2.4)
    for (cx, cy, r, sd) in ((50, 150, 30, 1), (52, 352, 30, 2), (104, 58, 16, 3), (106, 250, 15, 4), (104, 450, 15, 5), (150, 120, 18, 6), (152, 320, 16, 7)):
        s += G.tree(cx, cy, r, sd)
    # colline et carrière (colonne 11, rangées 0 à 2)
    hill = [(1090, 0), (1200, 0), (1200, 305), (1150, 300), (1100, 290), (1092, 200), (1098, 100)]
    s += G.face(hill, P['stone_s'], [G.hatch(hill, 60, 2.4, .6, .55, True)], 2.4)
    for k in range(4):
        y = 40 + k * 70
        s.append(G.curve([(1095, y + 10), (1130, y), (1170, y + 6), (1200, y - 2)], 1.2, INK, .8))
    for (x, y) in ((1120, 150), (1170, 160), (1150, 140)):
        rock = [(x - 12, y + 8), (x - 8, y - 6), (x + 4, y - 10), (x + 13, y), (x + 10, y + 9)]
        s += G.face(rock, P['stone'], [G.hatch(Polygon(rock).intersection(box(x, y - 12, x + 14, y + 10)), 70, 1.6, .6, .8, True)], 1.6)
    # rivière (colonne 11, rangées 3 à 7)
    pts = [(1200, 300), (1168, 360), (1150, 430), (1178, 520), (1160, 610), (1138, 700), (1150, 800)]
    left = [(x - 30, y) for x, y in pts]; right = [(x + 30, y) for x, y in pts]
    water = left + right[::-1]
    s.append(G.fillp(water, P['water']))
    s += G.hatch(Polygon(water).buffer(0), 0, 4, .7, .55, True, '#1F3E70')
    for (x, y) in pts[1:-1]:
        for dx in (-14, 8):
            s.append(G.curve([(x + dx - 6, y + 10), (x + dx - 2, y + 7), (x + dx + 2, y + 10), (x + dx + 6, y + 7)], 1.1, P['light'], .85))
    s.append(G.curve(G.wobble(left, False), 2.4)); s.append(G.curve(G.wobble(right, False), 2.4))
    # chemins : de la forêt au pont, et de la porte vers les champs
    road = [(100, 400), (560, 404), (1100, 398), (1200, 396)]
    s.append(G.curve(road, 30, '#C9A464')); s.append(G.curve(road, 24, '#E2C487'))
    vroad = [(550, 300), (552, 560), (548, 800)]
    s.append(G.curve(vroad, 30, '#C9A464')); s.append(G.curve(vroad, 24, '#E2C487'))
    s += G.cobbles(Polygon([(500, 300), (600, 300), (600, 800), (500, 800)]).intersection(Polygon([(538, 300), (564, 300), (564, 800), (536, 800)])), 81, .6)
    for i in range(0, 1100, 40):
        s.append(G.stroke((100 + i, 390 + G.R.uniform(-1, 1)), (112 + i, 390), .7, INK, .5, 0))
    # pont
    bridge = [(1105, 384), (1205, 380), (1205, 412), (1105, 416)]
    s += G.face(bridge, P['wood'], [G.hatch(bridge, 88, 4, .9, .8, True)], 2)
    # enceinte (colonnes 2 à 9, rangées 0 à 3)
    s.append(G.fillp([(196, 6), (1004, 6), (1004, 394), (196, 394)], '#EBD7A7'))
    s += G.hatch(Polygon([(196, 6), (1004, 6), (1004, 394), (196, 394)]), -10, 12, .4, .25)
    # place du marché (5,1)-(6,2) et rue (5,3)
    place = [(500, 100), (700, 100), (700, 300), (500, 300)]
    s.append(G.fillp(place, '#D9BE88')); s += G.cobbles(Polygon(place), 82, 1.4)
    rue = [(500, 300), (600, 300), (600, 392), (500, 392)]
    s.append(G.fillp(rue, '#D9BE88')); s += G.cobbles(Polygon(rue), 83, 1.4)
    cx, cy = 600, 200
    s.append(f'<ellipse cx="{cx}" cy="{cy + 6}" rx="26" ry="11" fill="{P["stone_s"]}" stroke="{INK}" stroke-width="2.4"/>')
    s.append(f'<ellipse cx="{cx}" cy="{cy}" rx="20" ry="8" fill="{P["water"]}" stroke="{INK}" stroke-width="1.6"/>')
    s += [G.stroke((cx - 20, cy), (cx - 20, cy - 36), 3.6, P['wood_s'], 1, 0), G.stroke((cx + 20, cy), (cx + 20, cy - 36), 3.6, P['wood_s'], 1, 0),
          G.stroke((cx - 25, cy - 34), (cx + 25, cy - 34), 4, P['wood_s'], 1, 0)]
    s.append(f'<path d="M{cx - 30},{cy - 34} L{cx},{cy - 52} L{cx + 30},{cy - 34} Z" fill="{P["tile"]}" stroke="{INK}" stroke-width="2"/>')
    # palissade : pieux
    per = [(196, 6), (1004, 6), (1004, 394), (600, 394), (500, 394), (196, 394)]
    def stakes(a, b, gate=None):
        out = []; L = math.dist(a, b); n = int(L / 9)
        for i in range(n + 1):
            p = G.lerp(a, b, i / n)
            if gate and gate[0] < p[0] < gate[1] and abs(p[1] - 394) < 2: continue
            hz = abs(a[1] - b[1]) < 1
            if hz:
                out.append(f'<path d="M{G.f(p[0] - 3.5)},{G.f(p[1] + 5)} V{G.f(p[1] - 4)} L{G.f(p[0])},{G.f(p[1] - 8)} L{G.f(p[0] + 3.5)},{G.f(p[1] - 4)} V{G.f(p[1] + 5)} Z" fill="{P["wood"] if i % 3 else P["wood2"]}" stroke-width="1.1"/>')
            else:
                out.append(f'<path d="M{G.f(p[0] - 5)},{G.f(p[1] - 3.5)} H{G.f(p[0] + 4)} L{G.f(p[0] + 8)},{G.f(p[1])} L{G.f(p[0] + 4)},{G.f(p[1] + 3.5)} H{G.f(p[0] - 5)} Z" fill="{P["wood"] if i % 3 else P["wood2"]}" stroke-width="1.1"/>')
        return out
    s += stakes((196, 6), (1004, 6)) + stakes((196, 6), (196, 394)) + stakes((1004, 6), (1004, 394)) + stakes((196, 394), (1004, 394), (492, 608))
    for gx in (488, 600):
        tw = [(gx, 404), (gx, 368), (gx + 12, 368), (gx + 12, 404)]
        s += G.face(tw, P['wood'], [G.hatch(tw, 85, 2, .7, .8, True)], 1.8)
        s.append(f'<path d="M{gx - 3},{368} L{gx + 6},{354} L{gx + 15},{368} Z" fill="{P["tile"]}" stroke-width="1.6"/>')
    # rose des vents (colonne 0, rangées 5 à 7)
    cx, cy = 52, 690
    s.append(f'<circle cx="{cx}" cy="{cy}" r="38" fill="#F3E2B8" stroke-width="2.2"/>')
    s.append(f'<circle cx="{cx}" cy="{cy}" r="31" stroke-width="1"/>')
    s.append(f'<path d="M{cx},{cy - 34} L{cx + 7},{cy} L{cx},{cy + 34} L{cx - 7},{cy} Z" fill="{P["red"]}" stroke-width="1.4"/>')
    s.append(f'<path d="M{cx - 34},{cy} L{cx},{cy - 7} L{cx + 34},{cy} L{cx},{cy + 7} Z" fill="{P["timber"]}" stroke-width="1.4"/>')
    s.append(f'<text x="{cx}" y="{cy - 42}" text-anchor="middle" font-family="IM Fell English SC, serif" font-size="20" fill="{INK}" stroke="none">N</text>')
    # cartouches
    def label(x, y, txt, rot=0, size=22):
        t = f' transform="rotate({rot} {x} {y})"' if rot else ''
        return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="IM Fell English, serif" font-style="italic" font-size="{size}" fill="{INK}" stroke="#F3E2B8" stroke-width="4" paint-order="stroke"{t}>{txt}</text>'
    s.append(label(50, 560, 'les Champs', -90))
    s.append(label(1050, 560, 'la Rivière', -90))
    s.append(label(600, 128, 'Place du marché', 0, 18))
    s.append(label(150, 30, 'la Forêt', 0, 20))
    s.append(label(1050, 30, 'la Colline', 0, 20))
    return '<g fill="none" stroke="#1A100A" stroke-linecap="round" stroke-linejoin="round">' + ''.join(s) + '</g>'

if __name__ == '__main__':
    body = decor()
    print(len(body))
    open('decor_body.svg', 'w').write(body)
