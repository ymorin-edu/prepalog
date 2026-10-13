"""Construit le module d'une CARTE RÉGIONALE des itinéraires (route, barge, rail) : d'un port à un ou deux
entrepôts, par plusieurs modes — pour Decathlon ENT-7.1 à 7.4 (`contenus/decathlon-carte.js`), et toute carte
« d'un point A à un point B par plusieurs modes » qui viendra (brief MOTEUR-carte-regionale, 13/10/2026).

Usage : `py outils/carte/construire-region.py [outils/carte/decathlon.json]` (shapely requis ; données :
`node outils/carte/extraire-region.mjs`, rangées dans `outils/carte/sources/region/`, ignorées par git). Rejoué
à l'identique sur les mêmes extractions, il redonne le même fichier, octet pour octet (alerte 11).

Ce qui change par rapport à la ville (`construire.py`) et à la côte (`construire-cote.py`) :
  - l'échelle : ≈ 130 × 130 km, quadrillage de 10 km. Ni rues, ni bâti, ni communes : le fond, ce sont la
    mer, l'eau, les frontières, les autoroutes, les grandes voies ferrées et les villes repères ;
  - la mer se tire du trait de côte OSM (`natural=coastline`), coupé par le cadre ; les faces qui contiennent
    un point de mer déclaré par le JSON sont la mer ;
  - les ITINÉRAIRES sont calculés, pas dessinés : route et camion sur les routes OSM (profil porteur), barge sur
    les voies d'eau, rail sur les voies ferrées hors voies de service, chacun par les POINTS DE PASSAGE que le
    JSON impose (`itineraires.py`, `par_passages`) ;
  - les KILOMÈTRES se mesurent sur la sphère (`geo.km_geo`) : la projection plate, juste pour dessiner, se
    tromperait d'environ 1 % aux bords d'une région de cette taille ;
  - des CONTRÔLES arrêtent le build : tracé continu, dans le cadre, distance dans la fourchette du JSON, et
    l'ORDRE DU CO₂ voulu par la séance (brief 7.1 §6.2) tenu pour chaque poids déclaré. Si l'ordre ne tient
    pas, on le dit à Tristan : on ajuste les facteurs construits, jamais les distances.

Tout est calculé depuis OpenStreetMap (© contributeurs OpenStreetMap, ODbL) ; rien n'est recopié ni tracé à la
main. Les noms français des villes viennent de `name:fr` quand OSM l'a.
"""
import json, math, os, re, sys
os.environ['CARTE_EMPRISE'] = 'region'        # AVANT d'importer geo : projection et données de la région
from geo import *
from shapely.geometry import box
from shapely.ops import linemerge, polygonize
from itineraires import reseau_porteur_coeur, reseau_lignes, par_passages

SEANCE_F = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, 'decathlon.json')
SEANCE = json.load(open(SEANCE_F, encoding='utf-8'))
OSM = D['osm']

# --------------------------------------------------------------------- les lieux
LIEUX = {l['id']: dict(l, xy=xy(*l['lonlat'])) for l in SEANCE['lieux']}
for l in LIEUX.values():
    print(f"  lieu {l['id']} : {l['nom']} ({l['lonlat'][1]:.5f} N, {l['lonlat'][0]:.5f} E) — OSM : {l.get('osm', '?')}")

# --------------------------------------------------------------------- les réseaux (un par mode)
NAV = re.compile(SEANCE['voiesNavigables'], re.I)
def garde_eau(t):
    return t.get('waterway') in ('river', 'canal') and bool(NAV.search(t.get('name', '') or ''))
def garde_rail(t):
    # Un train de conteneurs ne roule ni sur une ligne à grande vitesse (essai du 13/10 : le rail arrivait à Dourges
    # par la LGV Nord), ni sur une ligne touristique ou militaire. Les embranchements (`service=spur`) restent : c'est
    # par eux qu'on entre dans un terminal (la « voie-mère » de Dourges) ; pas les faisceaux de gare ni les garages.
    return (t.get('railway') == 'rail' and t.get('service') in (None, 'spur')
            and t.get('usage') not in ('tourism', 'military') and t.get('highspeed') != 'yes')
print('réseaux…')
RESEAUX = {}
def reseau_de(type_):
    if type_ not in RESEAUX:
        if type_ in ('route', 'camion'):
            RESEAUX[type_] = RESEAUX.get('route') or RESEAUX.get('camion') or reseau_porteur_coeur(OSM)
        elif type_ == 'barge':
            RESEAUX[type_] = reseau_lignes(garde_eau, souder=SEANCE.get('souderEau', 80), osm=OSM)
        elif type_ == 'rail':
            RESEAUX[type_] = reseau_lignes(garde_rail, souder=SEANCE.get('souderRail', 15), osm=OSM)
        else:
            raise SystemExit(f'type de tronçon inconnu : {type_}')
        print(f'  {type_} : {len(RESEAUX[type_][0])} nœuds')
    return RESEAUX[type_]

# --------------------------------------------------------------------- les itinéraires
ITIN = {}
for dest, modes in SEANCE['itineraires'].items():
    ITIN[dest] = {}
    for mode, it in modes.items():
        segs = []
        for s in it['segments']:
            pts = [dict(xy=LIEUX[s['de']]['xy'])] + [dict(xy=xy(*p)) for p in s.get('passages', [])] \
                + [dict(xy=LIEUX[s['a']]['xy'])]
            arcs, voies = reseau_de(s['type'])
            r = par_passages(arcs, voies, pts)
            g = r['g']
            # Continu par construction entre deux nœuds du réseau (une longue ligne droite d'autoroute peut n'avoir
            # aucun nœud sur 3 km) ; ce qui peut « sauter », ce sont les accès : du lieu à sa voie, au départ et à
            # l'arrivée. Un accès long dit qu'un lieu est mal placé ou que son réseau manque là.
            acces = max(math.dist(g[0], g[1]), math.dist(g[-2], g[-1]))
            assert acces < s.get('accesMax', SEANCE.get('accesMax', 1500)), f'{dest}/{mode}/{s["type"]} : accès de {acces:.0f} m (départ {math.dist(g[0], g[1]):.0f} m, arrivée {math.dist(g[-2], g[-1]):.0f} m : lieu loin de son réseau)'
            km = km_geo(g) / 1000
            lo, hi = s['km']
            assert lo <= km <= hi, f'{dest}/{mode}/{s["type"]} : {km:.1f} km hors de la fourchette {lo}–{hi}'
            segs.append(dict(type=s['type'], de=s['de'], a=s['a'], g=g, km=km))
            print(f'  {dest} / {mode} / {s["type"]} {s["de"]} → {s["a"]} : {km:.1f} km (plan : {r["m"] / 1000:.1f})')
        ITIN[dest][mode] = dict(it, segs=segs)

# --------------------------------------------------------------------- le contrôle du CO₂
CO2 = SEANCE['co2']
def co2(segs, t):
    return round(sum(t * round(s['km']) * CO2['facteurs'][s['type']] for s in segs))
for dest, ordre in CO2['ordre'].items():
    for t in CO2['poids']:
        v = [co2(ITIN[dest][m]['segs'], t) for m in ordre]
        print(f'  CO₂ vers {dest} à {t} t : ' + ' < '.join(f'{m} {x} kg' for m, x in zip(ordre, v)))
        if not all(a < b for a, b in zip(v, v[1:])):
            raise SystemExit(f'ORDRE DU CO₂ NON TENU vers {dest} à {t} t ({dict(zip(ordre, v))}) : '
                             'le dire à Tristan (on ajuste les facteurs construits, jamais les distances)')

# --------------------------------------------------------------------- les villes repères
VILLES = []
for v in SEANCE['villes']:
    cands = [e for e in OSM if e['src'] == 'villes' and 'p' in e
             and v.get('osm', v['nom']) in (e['tags'].get('name:fr'), e['tags'].get('name'))]
    assert cands, f'ville absente de l’extraction : {v["nom"]}'
    e = min(cands, key=lambda e: e['id'])
    VILLES.append(dict(nom=v['nom'], xy=xy(*e['p']), osm=f"node {e['id']}"))

# --------------------------------------------------------------------- le cadre et le quadrillage
PAS = SEANCE.get('pas', 10000)
MARGE_C = SEANCE.get('marge', 5000)
besoin = [l['xy'] for l in LIEUX.values()]
tout = besoin + [v['xy'] for v in VILLES] + [p for d in ITIN.values() for it in d.values() for s in it['segs'] for p in s['g']]
xmin = min(p[0] for p in tout) - MARGE_C; xmax = max(p[0] for p in tout) + MARGE_C
ymin = min(p[1] for p in tout) - MARGE_C; ymax = max(p[1] for p in tout) + MARGE_C
NC = math.ceil((xmax - xmin) / PAS); NL = math.ceil((ymax - ymin) / PAS)
COLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[:NC]
def marge(p, ox, oy):
    dx = (p[0] - ox) % PAS; dy = (p[1] - oy) % PAS
    return min(dx, PAS - dx, dy, PAS - dy)
meilleur = None
for ox in range(int(xmax - NC * PAS), int(xmin) + 1, 100):
    for oy in range(int(ymax - NL * PAS), int(ymin) + 1, 100):
        m = min(marge(p, ox, oy) for p in besoin)
        if meilleur is None or m > meilleur[0]:
            meilleur = (m, ox, oy)
MARGE, OX, OY = meilleur
FW, FH = NC * PAS, NL * PAS
print(f'quadrillage : {NC} × {NL} cases de {PAS // 1000} km, origine ({OX}, {OY}), marge mini {MARGE:.0f} m')
FRAME = box(OX, OY, OX + FW, OY + FH)
F = FRAME.buffer(500, join_style=2)
for d in ITIN.values():
    for it in d.values():
        for s in it['segs']:
            assert all(FRAME.contains(Point(p)) for p in s['g']), 'tracé hors du cadre'
def case_de(p):
    return f'{COLS[int((p[0] - OX) // PAS)]}{int((p[1] - OY) // PAS) + 1}'

# --------------------------------------------------------------------- le fond
def chemin(geoms, ferme=False, tol=1.0):
    """Une seule chaîne de chemin SVG, coordonnées relatives entières (même format que `construire.py`)."""
    out = []
    for g in geoms:
        if g.is_empty:
            continue
        for p in getattr(g, 'geoms', [g]):
            if p.geom_type == 'Polygon':
                rings = [p.exterior] + list(p.interiors)
            elif p.geom_type == 'LineString':
                rings = [p]
            elif p.geom_type in ('MultiLineString', 'GeometryCollection', 'MultiPolygon'):
                out.append(chemin([p], ferme, tol)); continue
            else:
                continue
            for r in rings:
                r = r.simplify(tol) if tol else r
                cs = [(round(x), round(y)) for x, y in r.coords]
                cs = [c for i, c in enumerate(cs) if i == 0 or c != cs[i - 1]]
                if len(cs) < 2:
                    continue
                s = f'M{cs[0][0]} {cs[0][1]}'
                px, py = cs[0]
                for x, y in cs[1:]:
                    s += f'l{x - px} {y - py}'; px, py = x, y
                out.append(s + ('z' if ferme else ''))
    return ''.join(out)

def ligne(e):
    return LineString([xy(*p) for p in e['g']])
def poly_de(e):
    try:
        if 'g' in e and len(e['g']) >= 4 and e['g'][0] == e['g'][-1]:
            return Polygon([xy(*p) for p in e['g']]).buffer(0)
        if 'm' in e:
            outers = [LineString([xy(*p) for p in m['g']]) for m in e['m'] if m['r'] != 'inner' and len(m['g']) > 1]
            inners = [LineString([xy(*p) for p in m['g']]) for m in e['m'] if m['r'] == 'inner' and len(m['g']) > 1]
            g = unary_union(list(polygonize(unary_union(outers))))
            if inners:
                g = g.difference(unary_union(list(polygonize(unary_union(inners)))))
            return g.buffer(0)
    except Exception:
        return None

# La mer : les faces que le trait de côte découpe dans le cadre et qui sont du côté MER du trait. Par convention
# OSM, un trait de côte laisse la terre à sa gauche et l'eau à sa droite : on pose des graines à 30 m de part et
# d'autre des segments du trait (calculé en longitude-latitude, nord en haut). Une face est la mer si elle a plus
# de graines « eau » que de graines « terre » (un quai découpé peut en égarer quelques-unes), ou si elle contient
# un point de mer du JSON — l'estuaire de l'Escaut compris, même coupé du large par le cadre.
cote = [ligne(e).intersection(F) for e in OSM if e['src'] == 'cote' and 'g' in e]
faces = list(polygonize(unary_union([c for c in cote if not c.is_empty] + [F.exterior])))
graines = [Point(xy(*p)) for p in SEANCE['mer']]
eau_d, terre_g = [], []
for e in OSM:
    if e['src'] != 'cote' or 'g' not in e:
        continue
    for (lo1, la1), (lo2, la2) in list(zip(e['g'], e['g'][1:]))[::5]:
        x1, y1 = xy(lo1, la1); x2, y2 = xy(lo2, la2)
        L = math.hypot(x2 - x1, y2 - y1)
        if L < 80:
            continue
        # À droite du sens de marche, nord en haut ; en coordonnées projetées (y vers le sud), c'est (-dy, dx).
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        nx, ny = -(y2 - y1) / L * 30, (x2 - x1) / L * 30
        eau_d.append(Point(mx + nx, my + ny)); terre_g.append(Point(mx - nx, my - ny))
def est_mer(f):
    if any(f.contains(g) for g in graines):
        return True
    return sum(f.contains(g) for g in eau_d) > sum(f.contains(g) for g in terre_g)
MER = unary_union([f for f in faces if est_mer(f)] or [Polygon()])
print(f'mer : {MER.area / 1e6:.0f} km² dans le cadre ({len(faces)} faces)')
for l in LIEUX.values():
    assert not MER.contains(Point(l['xy'])), (l['nom'], 'en mer')

eau = []
for e in OSM:
    if e['src'] == 'eau' and e['tags'].get('natural') == 'water':
        p = poly_de(e)
        if p and not p.is_empty and p.area > SEANCE.get('eauAireMin', 300000):
            eau.append(p.intersection(F))
eau_l = [ligne(e).intersection(F) for e in OSM if e['src'] == 'eau' and 'g' in e and garde_eau(e['tags'])]
EAU = unary_union([MER] + eau)
frontieres = [ligne(e) for e in OSM if e['src'] == 'frontieres' and e['type'] == 'way' and 'g' in e
              and e['tags'].get('maritime') != 'yes' and e['tags'].get('boundary') == 'administrative']
FRONT = unary_union(frontieres).intersection(F).difference(MER.buffer(-50))
autoroutes = [ligne(e).intersection(F) for e in OSM if e['src'] == 'routes' and e['tags'].get('highway') == 'motorway' and 'g' in e]
rail = [ligne(e).intersection(F) for e in OSM if e['src'] == 'rail' and 'g' in e and garde_rail(e['tags'])
        and e['tags'].get('usage') == 'main']

COUCHES = dict(
    eau=chemin([EAU.simplify(40)], ferme=True, tol=0),
    eauL=chemin([linemerge(unary_union(eau_l))] if eau_l else [], tol=40),
    frontieres=chemin([linemerge(FRONT) if FRONT.geom_type == 'MultiLineString' else FRONT], tol=60),
    autoroutes=chemin([linemerge(unary_union(autoroutes))], tol=50),
    rail=chemin([linemerge(unary_union(rail))], tol=60),
)
print('poids des couches (ko) :', {k: len(v) // 1000 for k, v in COUCHES.items()})

# --------------------------------------------------------------------- les noms (villes, lieux, pays)
# Placés à l'échelle de la vue d'ensemble (≈ 860 × 520 px) : un nom ne couvre aucun point, aucun autre nom ;
# on ne déplace jamais un point. Quatre places essayées autour du point, dans l'ordre : droite, gauche,
# dessus, dessous.
K_ENS = max((FW + 400) / 860, (FH + 420) / 520)
def largeur(t, fpx): return len(t) * 0.6 * fpx * K_ENS
POINTS_LIEUX = [Point(*l['xy']).buffer(13 * K_ENS) for l in LIEUX.values()]
POINTS_VILLES = [Point(*v['xy']).buffer(4 * K_ENS) for v in VILLES]
# Les tracés des itinéraires, épaissis de la moitié du trait le plus large (les traverses du rail, 8 px) et du halo :
# un nom ne s'y pose pas (essai de Tristan du 13/10 : « Gand », « Lille », « Courtrai » étaient effacés). Le point
# d'une ville peut être SOUS un tracé (Gand, sur la voie ferrée) : on ne déplace jamais un point, c'est le nom qui
# cherche sa place à côté.
TRACES = [LineString(s['g']).simplify(40).buffer(7 * K_ENS) for d in ITIN.values() for it in d.values() for s in it['segs']]
def placer(nom, p, fpx, r, obstacles, poses, traces=()):
    """La place d'un nom autour de son point : huit directions (droite, gauche, dessus, dessous, puis les diagonales),
    à trois distances. Un nom ne couvre aucun point (sauf le sien), aucun nom déjà posé, aucun tracé ; s'il n'y a
    vraiment aucune place hors des tracés, il en prend une sur un tracé et le build le dit."""
    w, h = largeur(nom, fpx), fpx * K_ENS
    x, y = p
    dirs = [(1, 0), (-1, 0), (0, -1), (0, 1), (1, -1), (-1, -1), (1, 1), (-1, 1)]
    essais = []
    for rr in (r, r + 5 * K_ENS, r + 11 * K_ENS):
        for ux, uy in dirs:
            ax, ay = x + ux * rr * (0.75 if uy else 1), y + uy * rr * (0.75 if ux else 1)
            x0 = ax if ux > 0 else (ax - w if ux < 0 else ax - w / 2)
            y0 = ay - 0.65 * h if uy == 0 else (ay - h if uy < 0 else ay)
            ancre = 'start' if ux > 0 else ('end' if ux < 0 else 'middle')
            essais.append((ancre, ax if ux else x, y0 + 0.75 * h, box(x0, y0, x0 + w, y0 + h)))
        # Près du bord du cadre : dessus ou dessous, calé à gauche sur le point.
        for uy in (-1, 1):
            y0 = y - rr - h if uy < 0 else y + rr
            essais.append(('start', x - 0.4 * r, y0 + 0.75 * h, box(x - 0.4 * r, y0, x - 0.4 * r + w, y0 + h)))
    P = Point(p)
    for gene in (list(traces), []):
        for ancre, lx, ly, b in essais:
            if FRAME.contains(b) and not any(b.intersects(o) for o in obstacles + poses if not o.contains(P)) \
                    and not any(b.intersects(t) for t in gene):
                if traces and not gene:
                    print(f'  ATTENTION : le nom « {nom} » n’a de place que sur un tracé')
                poses.append(b.buffer(2 * K_ENS))
                # Le nom est rangé en PIXELS d'écran par rapport à son point (comme le nom d'un marqueur dans
                # carte.js) : au zoom, il reste collé à son point au lieu de rester à sa place de vue d'ensemble.
                return dict(dx=round((lx - x) / K_ENS, 1), dy=round((ly - y) / K_ENS, 1), ancre=ancre)
    raise SystemExit(f'aucune place pour le nom « {nom} »')
# Les villes d'abord (elles n'ont que leur point à éviter et des places plus étroites), puis les noms des lieux,
# par destination : la carte de Rouvignies ne montre pas l'entrepôt de Dourges, et inversement.
poses_villes = []
NOMS_VILLES = [placer(v['nom'], v['xy'], 12, 6 * K_ENS, POINTS_LIEUX + POINTS_VILLES, poses_villes, TRACES) for v in VILLES]
NOMS_LIEUX, poses = {}, list(poses_villes)
for dest, d in ITIN.items():
    ids = sorted({x for it in d.values() for s in it['segs'] for x in (s['de'], s['a'])}, key=list(LIEUX).index)
    p_dest = list(poses_villes)
    NOMS_LIEUX[dest] = {k: placer(LIEUX[k]['court'], LIEUX[k]['xy'], 12.5, 16 * K_ENS,
                                  [Point(*LIEUX[i]['xy']).buffer(13 * K_ENS) for i in ids] + POINTS_VILLES, p_dest, TRACES) for k in ids}
    poses += p_dest[len(poses_villes):]
obstacles = POINTS_LIEUX + POINTS_VILLES
PAYS = []
for p in SEANCE['pays']:
    # Le nom d'un pays cherche sa place autour du point déclaré (au plus 15 km), sans couvrir ni point ni nom.
    x0, y0 = xy(*p['lonlat']); w = largeur(p['nom'], 13); h = 13 * K_ENS
    pas = sorted(((dx, dy) for dx in range(-15000, 15001, 1000) for dy in range(-15000, 15001, 1000)),
                 key=lambda d: (math.hypot(*d), d))
    for dx, dy in pas:
        x, y = x0 + dx, y0 + dy
        b = box(x - w / 2, y - h, x + w / 2, y)
        if FRAME.contains(b) and not any(b.intersects(o) for o in obstacles + poses):
            break
    else:
        raise SystemExit(f'aucune place pour le nom {p["nom"]}')
    poses.append(b); PAYS.append(dict(nom=p['nom'], x=round(x), y=round(y)))

# --------------------------------------------------------------------- les vues « derniers kilomètres »
VUES = {}
for dest, ids in SEANCE.get('derniersKm', {}).items():
    ps = [LIEUX[i]['xy'] for i in ids]
    m = SEANCE.get('derniersKmMarge', 4000)
    x0, y0 = min(p[0] for p in ps) - m, min(p[1] for p in ps) - m
    x1, y1 = max(p[0] for p in ps) + m, max(p[1] for p in ps) + m
    VUES[dest] = [round(x0), round(y0), round(x1 - x0), round(y1 - y0)]

# --------------------------------------------------------------------- le paquet de données
def tol_de(t): return 25 if t == 'camion' else 40
DATA = dict(
    frame=[OX, OY, FW, FH], pas=PAS, cols=COLS, nl=NL, marge=round(MARGE),
    attrib='© contributeurs OpenStreetMap',
    couches=COUCHES,
    pays=PAYS,
    villes=[dict(nom=v['nom'], x=round(v['xy'][0]), y=round(v['xy'][1]), **n) for v, n in zip(VILLES, NOMS_VILLES)],
    lieux={k: dict(nom=l['nom'], court=l['court'], type=l['type'], x=round(l['xy'][0]), y=round(l['xy'][1]),
                   case=case_de(l['xy']), osm=l.get('osm', '')) for k, l in LIEUX.items()},
    noms=NOMS_LIEUX,
    vues=VUES,
    itineraires={dest: {mode: dict(
        mode=mode, nom=it['nom'], texte=it['texte'],
        km=round(sum(round(s['km']) for s in it['segs'])),
        segments=[dict(type=s['type'], de=s['de'], a=s['a'], km=round(s['km']),
                       d=chemin([LineString(s['g'])], tol=tol_de(s['type']))) for s in it['segs']],
        terminaux=[s['a'] for s in it['segs'][:-1]],
        ruptures=len(it['segs']) - 1,
    ) for mode, it in d.items()} for dest, d in ITIN.items()},
)
DEPOT = os.path.normpath(os.path.join(ICI, '..', '..'))
sortie = os.path.join(DEPOT, *SEANCE['sortie'].split('/'))
TETE = """// GÉNÉRÉ par outils/carte/construire-region.py — ne pas modifier à la main : relancer le script.
//
// """ + SEANCE['titre'] + """
// Tout est calculé depuis OpenStreetMap (© contributeurs OpenStreetMap, ODbL), rien n'est recopié ni dessiné
// à la main : mer (trait de côte), eau, frontières, autoroutes, voies ferrées, villes ; itinéraires = plus
// court chemin par les points de passage du JSON, sur les routes (profil porteur), les voies d'eau, les voies
// ferrées (`outils/carte/itineraires.py`) ; kilomètres mesurés sur la sphère.
// Coordonnées en mètres, projection locale (origine 2,70° E, 51,45° N ; y vers le sud).
//
// Séance : outils/carte/""" + os.path.basename(SEANCE_F) + """ — """ + SEANCE['description'] + """
"""
with open(sortie, 'w', encoding='utf-8', newline='\n') as f:
    f.write(TETE + 'export const CARTE = ' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('module :', os.path.relpath(sortie, DEPOT), len(open(sortie, encoding='utf-8').read()) // 1000, 'ko')
