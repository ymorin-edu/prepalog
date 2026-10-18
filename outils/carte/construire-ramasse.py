"""Construit `contenus/chep-carte.js` : la carte réelle de la métropole lilloise et du bassin minier pour la
TOURNÉE DE RAMASSE de palettes vides (CHEP, ENT-9.2 et ENT-9.4), au même format que la côte normande
(`construire-cote.py`) : lisible tel quel par la vue Tournée du moteur (`core/types/tournee.js` via `carte.js`).

Usage : `py outils/carte/construire-ramasse.py [outils/carte/chep.json]` (shapely requis). Données :
  - `node outils/carte/extraire-region.mjs`  → `outils/carte/sources/region/` (autoroutes, routes principales,
    frontières, eau, voies ferrées, villes) : DÉJÀ extraites pour Decathlon, réutilisées telles quelles ;
  - `node outils/carte/extraire-chep.mjs`    → `outils/carte/sources/chep/` (routes secondaires et tertiaires de
    l'emprise, petites rues autour des six points) : propre à cette carte.
Les deux dossiers sont ignorés par git. Rejoué sur les mêmes extractions, le script redonne le même fichier,
octet pour octet (alerte 11). Aucun réseau n'est nécessaire pour le build.

Ce qui change par rapport à la côte (construire-cote.py) et à la région (construire-region.py) :
  - l'emprise : ≈ 55 × 50 km (déclarée dans le JSON), quadrillage de 5 km, projection de la région (origine
    2,70° E, 51,45° N) ; les KILOMÈTRES se mesurent sur la sphère (`km_geo`), la projection plate ne sert qu'au dessin ;
  - pas de communes : des ZONES de zoom rectangulaires déclarées dans le JSON (métropole lilloise, Douaisis et Lens,
    Valenciennois), converties en « quartiers » pour le moteur ;
  - le fond : autoroutes (`maj`), routes principales (`sec`), routes secondaires (`min`), eau, voies ferrées
    principales, frontière belge (`frontiere`), villes repères (`reperes`) ; rien de plus (ni bâti, ni noms de rues) ;
  - un seul point d'ENTRÉE : le centre de service CHEP de Templemars, départ et arrivée (`boucle`) ;
  - profil PORTEUR des itinéraires (`itineraires.py`), tous les trajets entre le centre et les cinq plates-formes ;
  - des CONTRÔLES qui arrêtent le build : chaque point à moins de 1 500 m de son réseau, chaque distance dans la
    fourchette `km` du JSON.

Tout est CALCULÉ depuis les données ouvertes, rien n'est recopié ni tracé à la main :
  - routes, eau, voies ferrées, frontière, villes : © contributeurs OpenStreetMap (ODbL) ;
  - position du centre et des plates-formes : Base Adresse Nationale (Licence Ouverte), relevée le 18/10/2026
    (coordonnées déclarées dans le JSON avec leur source).
"""
import json, math, os, sys, time
os.environ['CARTE_EMPRISE'] = 'region'        # AVANT d'importer geo : projection et données de la région
from geo import *
from shapely.geometry import box
from shapely.ops import linemerge

T0 = time.time()
SEANCE_F = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, 'chep.json')
SEANCE = json.load(open(SEANCE_F, encoding='utf-8'))

# --------------------------------------------------------------------- les données
LON_O, LAT_N = SEANCE['emprise']['lonlat'][0]
LON_E, LAT_S = SEANCE['emprise']['lonlat'][1]
# Filtre large autour de l'emprise : le réseau du camion garde de la marge au-delà du cadre (une route qui sort du
# cadre et y revient ne doit pas être coupée).
BB = (LON_O - 0.12, LAT_S - 0.10, LON_E + 0.12, LAT_N + 0.10)
def dans(e):
    return 'g' in e and any(BB[0] <= lo <= BB[2] and BB[1] <= la <= BB[3] for lo, la in e['g'][::max(1, len(e['g']) // 6)] + [e['g'][-1]])

def charge_chep(nom):
    """Les extractions de `extraire-chep.mjs`, au format de `geo._region` (une voie = { tags, g })."""
    f = os.path.join(SOURCES, 'chep', nom)
    if not os.path.exists(f):
        raise SystemExit(f'données absentes : {f} — lancer `node outils/carte/extraire-chep.mjs`')
    out = []
    for e in json.load(open(f, encoding='utf-8'))['elements']:
        if e['type'] == 'way' and 'geometry' in e:
            out.append(dict(id=e['id'], type='way', tags=e.get('tags', {}), src='routes', g=[[p['lon'], p['lat']] for p in e['geometry']]))
    return out

ROUTES = {}
for e in D['osm']:
    if e['src'] == 'routes' and dans(e):
        ROUTES[e['id']] = e
for e in charge_chep('routes.json'):
    ROUTES[e['id']] = e
ROUTES = [ROUTES[k] for k in sorted(ROUTES)]
print(f'routes retenues : {len(ROUTES)} voies')

# --------------------------------------------------------------------- le centre de service et les clients
DEPOT = dict(SEANCE['depot']); DEPOT['xy'] = xy(*DEPOT['lonlat'])
CLIENTS = [dict(c) for c in SEANCE['clients']]
for c in CLIENTS:
    c['xy'] = xy(*c['lonlat'])

def lignes_de(nom, p, rayon=1500):
    """La rue `nom` autour du point `p` : ses voies à moins de `rayon` mètres, fusionnées."""
    P = Point(p)
    ls = []
    for e in ROUTES:
        if e['tags'].get('name') == nom and e['tags'].get('area') != 'yes':
            l = LineString([xy(*q) for q in e['g']])
            if l.distance(P) < rayon:
                ls.append(l)
    return linemerge(ls) if ls else None

for c in CLIENTS + [DEPOT]:
    c['rueG'] = lignes_de(c['rue'], c['xy'])
    assert c['rueG'] is not None, (c['nom'], c['rue'], 'rue absente de l’extraction')
    d = c['rueG'].distance(Point(c['xy']))
    assert d < 80, (c['nom'], 'à', round(d), 'm de sa rue')
    # La Base Adresse Nationale donne, pour une rue sans numéro, un point au milieu de la rue, à quelques dizaines de
    # mètres de son tracé OSM : le point est ramené sur le tracé (le plus proche).
    q = c['rueG'].interpolate(c['rueG'].project(Point(c['xy'])))
    c['xy'] = (q.x, q.y)
    print(f"  {c['nom']} : {c['adresse']}, {c['cp']} {c['ville']} — ramené de {d:.0f} m sur sa rue ({c['xy'][0]:.0f}, {c['xy'][1]:.0f})")

# --------------------------------------------------------------------- le cadre et le quadrillage
PAS = SEANCE['emprise']['pas']
MARGE_P = SEANCE['emprise']['marge']
COLS_TOUTES = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
x0, y0 = xy(LON_O, LAT_N); x1, y1 = xy(LON_E, LAT_S)
besoin = [c['xy'] for c in CLIENTS] + [DEPOT['xy']]
xmin = min(x0, min(p[0] for p in besoin) - MARGE_P); xmax = max(x1, max(p[0] for p in besoin) + MARGE_P)
ymin = min(y0, min(p[1] for p in besoin) - MARGE_P); ymax = max(y1, max(p[1] for p in besoin) + MARGE_P)
NC = math.ceil((xmax - xmin) / PAS); NL = math.ceil((ymax - ymin) / PAS)
COLS = COLS_TOUTES[:NC]

def marge(p, ox, oy):
    dx = (p[0] - ox) % PAS; dy = (p[1] - oy) % PAS
    return min(dx, PAS - dx, dy, PAS - dy)

# L'origine qui éloigne le plus chaque point d'une ligne du quadrillage (un rond doit tenir dans sa case, alerte 15).
meilleur = None
for ox in range(int(xmax - NC * PAS), int(xmin) + 1, 50):
    for oy in range(int(ymax - NL * PAS), int(ymin) + 1, 50):
        m = min(marge(p, ox, oy) for p in besoin)
        if meilleur is None or m > meilleur[0]:
            meilleur = (m, ox, oy)
MARGE, OX, OY = meilleur
FW, FH = NC * PAS, NL * PAS
print(f'quadrillage : {NC} × {NL} cases de {PAS // 1000} km, origine ({OX}, {OY}), marge mini {MARGE:.0f} m')
FRAME = box(OX, OY, OX + FW, OY + FH)
F = FRAME.buffer(300, join_style=2)

def case_de(p):
    return f'{COLS[int((p[0] - OX) // PAS)]}{int((p[1] - OY) // PAS) + 1}'
def cases_de(geom):
    return sorted(f'{COLS[i]}{j + 1}' for i in range(NC) for j in range(NL)
                  if geom.intersects(box(OX + i * PAS, OY + j * PAS, OX + (i + 1) * PAS, OY + (j + 1) * PAS)))

# --------------------------------------------------------------------- les zones de zoom (les « quartiers »)
ZONES = {}
for k, z in SEANCE['zones'].items():
    (lo1, la1), (lo2, la2) = z['lonlat']
    xa, ya = xy(lo1, la1); xb, yb = xy(lo2, la2)
    g = box(min(xa, xb), min(ya, yb), max(xa, xb), max(ya, yb)).intersection(FRAME)
    assert not g.is_empty, f'zone hors du cadre : {k}'
    ZONES[k] = dict(nom=z['nom'], g=g)
def zone_de(p):
    return next((k for k, z in ZONES.items() if z['g'].contains(Point(p))), None)
for c in CLIENTS + [DEPOT]:
    c['zone'] = zone_de(c['xy'])
    assert c['zone'], (c['nom'], 'hors de toute zone de zoom')
    print(f"  {c['nom']} : zone « {ZONES[c['zone']]['nom']} », case {case_de(c['xy'])}")
zs = list(ZONES.values())
for i, a in enumerate(zs):
    for b in zs[i + 1:]:
        assert a['g'].intersection(b['g']).area < 1e6, f"zones qui se recouvrent : {a['nom']} / {b['nom']}"

# --------------------------------------------------------------------- les couches du fond
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

def fusion(lignes):
    """Les lignes fusionnées bout à bout : moins de « M » dans le chemin, donc un module plus léger."""
    lignes = [l for l in lignes if not l.is_empty]
    return linemerge(unary_union(lignes)) if lignes else LineString()

def ligne(e):
    return LineString([xy(*p) for p in e['g']])
def poly_de(e):
    from shapely.ops import polygonize
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

CLASSES = {
    'maj': ('motorway', 'motorway_link'),
    'sec': ('trunk', 'trunk_link', 'primary', 'primary_link'),
    'min': ('secondary', 'secondary_link'),
}
cls_de = {v: k for k, vs in CLASSES.items() for v in vs}
routes = {k: [] for k in CLASSES}
for e in ROUTES:
    t = e['tags']
    if t.get('highway') in cls_de and t.get('area') != 'yes':
        l = ligne(e).intersection(F)
        if not l.is_empty:
            routes[cls_de[t['highway']]].append(l)

OSM = D['osm']
eau = []
for e in OSM:
    if e['src'] == 'eau' and e['tags'].get('natural') == 'water':
        p = poly_de(e)
        if p and not p.is_empty and p.area > SEANCE.get('eauAireMin', 150000) and p.intersects(F):
            eau.append(p.intersection(F))
eau_l = [ligne(e).intersection(F) for e in OSM if e['src'] == 'eau' and 'g' in e
         and e['tags'].get('waterway') in ('river', 'canal') and e['tags'].get('name')]
frontieres = [ligne(e) for e in OSM if e['src'] == 'frontieres' and e['type'] == 'way' and 'g' in e
              and e['tags'].get('maritime') != 'yes' and e['tags'].get('boundary') == 'administrative']
FRONT = unary_union(frontieres).intersection(F) if frontieres else LineString()
rail = [ligne(e).intersection(F) for e in OSM if e['src'] == 'rail' and 'g' in e and e['tags'].get('railway') == 'rail'
        and e['tags'].get('usage') == 'main' and e['tags'].get('service') is None
        and e['tags'].get('highspeed') != 'yes']

COUCHES = dict(
    maj=chemin([fusion(routes['maj'])], tol=15),
    sec=chemin([fusion(routes['sec'])], tol=20),
    min=chemin([fusion(routes['min'])], tol=30),
    ped='', svc='', pie='', bati='', vert='', cimetiere='',
    rail=chemin([fusion(rail)], tol=30),
    eau=chemin([unary_union(eau).simplify(30)] if eau else [], ferme=True, tol=0),
    eauL=chemin([fusion(eau_l)], tol=30),
    frontiere=chemin([linemerge(FRONT) if FRONT.geom_type == 'MultiLineString' else FRONT], tol=40),
)
print('poids des couches (ko) :', {k: round(len(v) / 1000, 1) for k, v in COUCHES.items() if v})

# --------------------------------------------------------------------- les villes repères
VILLES = []
for v in SEANCE['reperes']:
    cands = [e for e in OSM if e['src'] == 'villes' and 'p' in e
             and v.get('osm', v['nom']) in (e['tags'].get('name:fr'), e['tags'].get('name'))]
    assert cands, f'ville absente de l’extraction : {v["nom"]}'
    e = min(cands, key=lambda e: e['id'])
    p = xy(*e['p'])
    assert FRAME.contains(Point(p)), f'{v["nom"]} hors du cadre'
    VILLES.append(dict(nom=v['nom'], xy=p, osm=f"node {e['id']}"))

# --------------------------------------------------------------------- les itinéraires (profil porteur)
from itineraires import itineraires
POINTS_TOURNEE = [dict(id='depart', xy=DEPOT['xy'], rue=DEPOT['rue']), dict(id='arrivee', xy=DEPOT['xy'], rue=DEPOT['rue'])] + \
    [dict(id=c['id'], xy=c['xy'], rue=c['rue']) for c in CLIENTS]
print('itinéraires…')
ITIN = itineraires(POINTS_TOURNEE, SEANCE.get('profil', 'porteur'), osm=ROUTES)
TRAJETS, LOIN = {}, []
for k, v in sorted(ITIN.items()):
    g = v['g']
    km = km_geo(g) / 1000
    # Accès : du point à sa rue (premier segment), de la rue au point (dernier). Un accès long dit que le point est
    # loin du réseau extrait : on étend les boîtes d'extraction, on ne déplace pas le point.
    acces = max(math.dist(g[0], g[1]), math.dist(g[-2], g[-1]))
    assert acces < 1500, f'{k} : accès de {acces:.0f} m — point loin de son réseau (étendre extraire-chep.mjs)'
    if acces > 500:
        LOIN.append((k, round(acces)))
    assert all(FRAME.buffer(300).contains(Point(p)) for p in g), f'{k} : tracé hors du cadre'
    TRAJETS[k] = dict(m=round(km * 1000), d=chemin([LineString(g)], tol=15), km=km)
for k, (lo, hi) in SEANCE.get('km', {}).items():
    assert k in TRAJETS, f'trajet inconnu dans les fourchettes : {k}'
    assert lo <= TRAJETS[k]['km'] <= hi, f'{k} : {TRAJETS[k]["km"]:.1f} km hors de la fourchette {lo}–{hi}'
ids = ['depart'] + [c['id'] for c in CLIENTS]
print('distances (km) par les routes, du point de la ligne au point de la colonne :')
print('            ' + ''.join(f'{i[:9]:>10}' for i in ids))
for a in ids:
    print(f'  {a[:9]:<10}' + ''.join(f'{TRAJETS[f"{a}|{b}"]["km"]:>10.1f}' if a != b else f'{"–":>10}' for b in ids))
print('accès > 500 m :', LOIN or 'aucun')
for t in TRAJETS.values():
    del t['km']
print('itinéraires :', len(TRAJETS), 'trajets,', sum(len(t['d']) for t in TRAJETS.values()) // 1000, 'ko')

# --------------------------------------------------------------------- les vues de zoom et les noms de zones
CARTE_W, CARTE_H = 860, 640
POLICE = 12
VUES = {}
for k, z in ZONES.items():
    b = z['g'].bounds
    m = 300
    xa, ya, xb, yb = b[0] - m, b[1] - m, b[2] + m, b[3] + m
    VUES[k] = dict(vb=[xa, ya, xb - xa, yb - ya], k=max((xb - xa) / CARTE_W, (yb - ya) / CARTE_H))

# Le nom d'une zone cherche sa place dans son rectangle (comme le nom d'une commune sur la côte) : il ne touche ni
# un point, ni un nom de ville, ni un autre nom de zone ; on ne déplace jamais un point.
K_ENS = max((FW + 400) / 860, (FH + 420) / 520)      # m par pixel en vue d'ensemble
FQ = 14 * K_ENS
largeur = lambda t, fpx: len(t) * 0.62 * fpx * K_ENS
obstacles = [Point(*c['xy']).buffer(20 * K_ENS) for c in CLIENTS + [DEPOT]]
obstacles += [box(v['xy'][0] - largeur(v['nom'], 12.5) / 2, v['xy'][1] - 12 * K_ENS, v['xy'][0] + largeur(v['nom'], 12.5) / 2, v['xy'][1] + 4 * K_ENS) for v in VILLES]
# Le nom du centre de service s'écrit à droite de son point.
ex, ey = DEPOT['xy']
obstacles.append(box(ex + 14 * K_ENS, ey - 9 * K_ENS, ex + 16 * K_ENS + largeur(DEPOT['nom'], 12.5), ey + 6 * K_ENS))
POS_Q, poses = {}, []
for k in sorted(ZONES, key=lambda k: ZONES[k]['g'].area):
    g = ZONES[k]['g']; w = largeur(ZONES[k]['nom'], 14); h = FQ
    xa, ya, xb, yb = g.bounds
    best = None
    for xx in range(int(xa + w / 2), int(xb - w / 2), 100):
        for yy in range(int(ya + h), int(yb), 100):
            b = box(xx - w / 2, yy - 0.8 * h, xx + w / 2, yy + 0.25 * h)
            if not FRAME.contains(b) or not g.contains(b) or any(b.intersects(o) for o in obstacles + poses):
                continue
            # Plutôt en haut du rectangle, à gauche : un coin libre.
            score = (round((yy - ya) / 3000), xx - xa)
            if best is None or score < best[0]:
                best = (score, xx, yy, b)
    assert best, f'aucune place pour le nom de la zone {ZONES[k]["nom"]}'
    POS_Q[k] = (best[1], best[2]); poses.append(best[3].buffer(4 * K_ENS))
    print(f"nom de la zone {ZONES[k]['nom']} : ({best[1]}, {best[2]})")

# --------------------------------------------------------------------- le paquet de données
def reperes_de():
    out = []
    for v in VILLES:
        out.append(dict(n=v['nom'], x=round(v['xy'][0]), y=round(v['xy'][1])))
    return out

DATA = dict(
    frame=[OX, OY, FW, FH], pas=PAS, cols=COLS, nl=NL, marge=round(MARGE),
    unite='zone', boucle=True,
    attrib='© contributeurs OpenStreetMap · adresses : Base Adresse Nationale',
    couches=COUCHES,
    quartiers={k: dict(nom=z['nom'], iris=[], d=chemin([z['g']], ferme=True, tol=0),
                       lx=POS_Q[k][0], ly=POS_Q[k][1],
                       vb=[round(v, 1) for v in VUES[k]['vb']], fs=round(POLICE * VUES[k]['k'], 2)) for k, z in ZONES.items()},
    etiquettes={k: [] for k in ZONES}, reperes=reperes_de(), rues={}, index=[],
    trajets=TRAJETS,
    depart=dict(nom=DEPOT['nom'], x=round(DEPOT['xy'][0]), y=round(DEPOT['xy'][1])),
    arrivee=dict(nom=DEPOT['nom'], x=round(DEPOT['xy'][0]), y=round(DEPOT['xy'][1])),
    clients=[dict(id=c['id'], numero=c['numero'], nom=c['nom'], adresse=f"{c['adresse']}, {c['cp']} {c['ville']}", rue=c['rue'],
                  nouveau=False, quartier=c['zone'], case=case_de(c['xy']), cases=cases_de(c['rueG']),
                  x=round(c['xy'][0], 1), y=round(c['xy'][1], 1),
                  rueD=chemin([c['rueG']], tol=0)) for c in CLIENTS],
)
DEPOT_DIR = os.path.normpath(os.path.join(ICI, '..', '..'))
sortie = os.path.join(DEPOT_DIR, *SEANCE['sortie'].split('/'))
TETE = """// GÉNÉRÉ par outils/carte/construire-ramasse.py — ne pas modifier à la main : relancer le script.
//
// """ + SEANCE['titre'] + """
// Tout est calculé depuis des données ouvertes, rien n'est recopié ni dessiné à la main :
//   - autoroutes, routes principales et secondaires, eau, voies ferrées, frontière, villes : © contributeurs
//     OpenStreetMap (ODbL) ;
//   - position du centre de service et des plates-formes : Base Adresse Nationale (Licence Ouverte) ;
//   - itinéraires : plus court chemin d'un porteur par les routes OSM (`outils/carte/itineraires.py`), kilomètres
//     mesurés sur la sphère.
// Coordonnées en mètres, projection locale (origine 2,70° E, 51,45° N ; y vers le sud).
//
// Séance : outils/carte/""" + os.path.basename(SEANCE_F) + """ — `clients` : """ + SEANCE['description'] + """
"""
with open(sortie, 'w', encoding='utf-8', newline='\n') as f:
    f.write(TETE + 'export const CARTE = ' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('module :', os.path.relpath(sortie, DEPOT_DIR), len(open(sortie, encoding='utf-8').read()) // 1000, 'ko', f'— {time.time() - T0:.0f} s')
