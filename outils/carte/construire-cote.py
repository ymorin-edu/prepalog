"""Construit `contenus/fb-ent69-carte.js` : la carte réelle de la côte normande (Honfleur → Houlgate) pour
la vue Tournée d'ENT-6.9 (France Boissons), au même format que les cartes de Nîmes (`construire.py`).

Usage : `py outils/carte/construire-cote.py [outils/carte/fb-ent69.json]` (shapely requis ; données :
`node outils/carte/extraire-cote.mjs`, rangées dans `outils/carte/sources/cote/`, ignorées par git). Rejoué
à l'identique sur les mêmes extractions, il doit redonner le même fichier, octet pour octet.

Ce qui change par rapport à Nîmes (chantier D-9, lot 3, partie B ; 12/10/2026) :
  - l'emprise : ≈ 25 × 15 km au lieu de 5 × 5 km. Quadrillage de 5 km, pas de bâti (illisible à cette
    échelle et trop lourd), pas de noms de rues (les points sont visibles et nommés : on ne repère rien) ;
  - des COMMUNES au lieu des quartiers IRIS : leurs contours OSM (`admin_level=8`) ;
  - la MER : tout ce qui, dans le cadre, n'est dans aucune commune (une commune littorale s'arrête au
    rivage) ; l'estuaire de la Seine, au nord de Honfleur, en fait partie ;
  - un seul point d'ENTRÉE, qui est à la fois le départ et l'arrivée (`boucle`) : la sortie de l'autoroute
    à Touques. L'autoroute, elle, est hors carte (approche du lot 2, dans le contenu de la séance) ;
  - le profil PORTEUR des itinéraires (`itineraires.py`), sur une extraction qui garde les tags d'accès.

Tout est CALCULÉ depuis les données ouvertes, rien n'est recopié ni tracé à la main :
  - rues, eau, bois, voie ferrée, contours des communes : © contributeurs OpenStreetMap (ODbL) ;
  - position des clients : Base Adresse Nationale (Licence Ouverte), ou milieu du tracé OSM de la rue.
"""
import json, math, os, sys
os.environ['CARTE_EMPRISE'] = 'cote'          # AVANT d'importer geo : projection et données de la côte
from geo import *
from shapely.geometry import box
from shapely.ops import linemerge, polygonize

SEANCE_F = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, 'fb-ent69.json')
SEANCE = json.load(open(SEANCE_F, encoding='utf-8'))

# --------------------------------------------------------------------- les communes
def poly_relation(e):
    outers = [LineString([xy(*p) for p in m['g']]) for m in e['m'] if m['r'] != 'inner' and len(m['g']) > 1]
    inners = [LineString([xy(*p) for p in m['g']]) for m in e['m'] if m['r'] == 'inner' and len(m['g']) > 1]
    g = unary_union(list(polygonize(unary_union(outers))))
    if inners:
        g = g.difference(unary_union(list(polygonize(unary_union(inners)))))
    return g.buffer(0)

COMMUNES = {}
for e in D['osm']:
    t = e['tags']
    if e['type'] == 'relation' and t.get('boundary') == 'administrative' and t.get('admin_level') == '8':
        g = poly_relation(e)
        if not g.is_empty:
            COMMUNES[t['name']] = g
for k, nom in SEANCE['communes'].items():
    assert nom in COMMUNES, f'commune absente de l’extraction : {nom}'
Q = {k: dict(nom=nom, g=COMMUNES[nom]) for k, nom in SEANCE['communes'].items()}
def commune_de(p):
    return next((n for n, g in COMMUNES.items() if g.contains(Point(p))), None)

# --------------------------------------------------------------------- les clients et l'entrée
def lignes_de(nom, dans=None):
    ls = [LineString([xy(*p) for p in e['g']]) for e in D['osm']
          if e['tags'].get('name') == nom and 'highway' in e['tags'] and 'g' in e]
    if not ls:
        return None
    g = linemerge(ls)
    if dans is not None:
        g = g.intersection(dans)
    return None if g.is_empty else g

CLIENTS = [dict(c) for c in SEANCE['clients']]
for c in CLIENTS:
    cg = Q[c['commune']]['g']
    c['rueG'] = lignes_de(c['rue'], cg)
    assert c['rueG'] is not None, (c['nom'], c['rue'], 'pas dans sa commune')
    if c['lonlat']:
        c['xy'] = xy(*c['lonlat'])
    else:
        # Rue sans numéro à la BAN : le point au milieu du plus long morceau de la rue dans sa commune.
        p = max(getattr(c['rueG'], 'geoms', [c['rueG']]), key=lambda l: l.length)
        m = p.interpolate(0.5, normalized=True)
        c['xy'] = (m.x, m.y)
        c['lonlat'] = [round(v, 6) for v in lonlat(m.x, m.y)]
    d = c['rueG'].distance(Point(c['xy']))
    assert d < 45, (c['nom'], 'à', round(d), 'm de sa rue')
    assert cg.contains(Point(c['xy'])), (c['nom'], 'hors de sa commune')
    print(f"  {c['id']} {c['nom']} : {c['adresse']}, {Q[c['commune']]['nom']} — à {d:.0f} m de la rue")
ENTREE = dict(SEANCE['entree'])
ENTREE['xy'] = xy(*ENTREE['lonlat'])
print('  entrée :', ENTREE['nom'], '— commune OSM :', commune_de(ENTREE['xy']))

# --------------------------------------------------------------------- le cadre et le quadrillage
# Cases de 5 km. Le cadre couvre les points avec 1,5 km de marge ; on cherche l'origine qui éloigne le plus
# chaque point d'une ligne (un rond doit tenir dans sa case, alerte 15).
PAS = 5000
COLS_TOUTES = 'ABCDEFGH'
besoin = [c['xy'] for c in CLIENTS] + [ENTREE['xy']]
xmin = min(p[0] for p in besoin) - 1500; xmax = max(p[0] for p in besoin) + 1500
ymin = min(p[1] for p in besoin) - 1500; ymax = max(p[1] for p in besoin) + 1500
# Le nom de l'entrée s'écrit à DROITE de son point (`carte.js`) : le cadre doit le contenir, sinon le bord le coupe
# (« Sortie de l'autoroute (Tou… », premier essai du 12/10). Largeur estimée à l'échelle d'une vue d'ensemble de
# ~30 m par pixel (12,5 px par lettre au plus, avec la marge de 16 px).
xmax = max(xmax, ENTREE['xy'][0] + (16 + len(ENTREE['nom']) * 0.62 * 12.5 + 12) * 30)
NC = math.ceil((xmax - xmin) / PAS); NL = math.ceil((ymax - ymin) / PAS)
COLS = COLS_TOUTES[:NC]

def marge(p, ox, oy):
    dx = (p[0] - ox) % PAS; dy = (p[1] - oy) % PAS
    return min(dx, PAS - dx, dy, PAS - dy)

meilleur = None
for ox in range(int(xmax - NC * PAS), int(xmin) + 1, 25):
    for oy in range(int(ymax - NL * PAS), int(ymin) + 1, 25):
        m = min(marge(p, ox, oy) for p in besoin)
        if meilleur is None or m > meilleur[0]:
            meilleur = (m, ox, oy)
MARGE, OX, OY = meilleur
print(f'quadrillage : {NC} × {NL} cases de {PAS // 1000} km, origine ({OX}, {OY}), marge mini {MARGE:.0f} m')
FRAME = box(OX, OY, OX + NC * PAS, OY + NL * PAS)
F = FRAME.buffer(150, join_style=2)

def case_de(p):
    i = int((p[0] - OX) // PAS); j = int((p[1] - OY) // PAS)
    return f'{COLS[i]}{j + 1}'
def cases_de(geom):
    return sorted(f'{COLS[i]}{j + 1}' for i in range(NC) for j in range(NL)
                  if geom.intersects(box(OX + i * PAS, OY + j * PAS, OX + (i + 1) * PAS, OY + (j + 1) * PAS)))

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

CLASSES = {
    'maj': ('motorway', 'trunk', 'primary', 'motorway_link', 'trunk_link', 'primary_link'),
    'sec': ('secondary', 'tertiary', 'secondary_link', 'tertiary_link'),
    'min': ('unclassified', 'residential', 'living_street'),
    'ped': ('pedestrian',),
}
cls_de = {v: k for k, vs in CLASSES.items() for v in vs}
routes = {k: [] for k in CLASSES}
rail, vert, eau, cimetiere, eau_l = [], [], [], [], []

def poly_de(e):
    try:
        if 'g' in e and len(e['g']) >= 4 and e['g'][0] == e['g'][-1]:
            return Polygon([xy(*p) for p in e['g']]).buffer(0)
        if 'm' in e:
            return poly_relation(e)
    except Exception:
        return None

for e in D['osm']:
    t = e['tags']
    if 'highway' in t and 'g' in e and t['highway'] in cls_de:
        if t.get('area') == 'yes':
            continue
        routes[cls_de[t['highway']]].append(LineString([xy(*p) for p in e['g']]).intersection(F))
    elif t.get('railway') == 'rail' and 'g' in e:
        if t.get('service') in ('yard', 'siding', 'spur'):
            continue
        rail.append(LineString([xy(*p) for p in e['g']]).intersection(F))
    elif t.get('natural') in ('wood',) or t.get('landuse') == 'forest' or t.get('leisure') in ('park', 'golf_course'):
        p = poly_de(e)
        if p and not p.is_empty and p.area > 20000: vert.append(p.intersection(F))
    elif t.get('landuse') == 'cemetery':
        p = poly_de(e)
        if p and not p.is_empty: cimetiere.append(p.intersection(F))
    elif t.get('natural') == 'water':
        p = poly_de(e)
        if p and not p.is_empty and p.area > 5000: eau.append(p.intersection(F))
    elif t.get('waterway') in ('river', 'canal') and 'g' in e:
        eau_l.append(LineString([xy(*p) for p in e['g']]).intersection(F))

# La mer : le cadre moins toutes les communes. Un liseré de 30 m comble les jointures entre communes.
TERRE = unary_union(list(COMMUNES.values())).buffer(30).buffer(-30)
MER = F.difference(TERRE)
MER = unary_union([p for p in getattr(MER, 'geoms', [MER]) if p.area > 200000])
print(f'mer : {MER.area / 1e6:.0f} km² dans le cadre')
for c in CLIENTS + [ENTREE]:
    assert not MER.contains(Point(c['xy'])), (c.get('nom'), 'en mer')

COUCHES = {k: chemin(v, tol=3 if k == 'min' else 4) for k, v in routes.items()}
COUCHES['svc'] = ''; COUCHES['pie'] = ''; COUCHES['bati'] = ''
COUCHES['rail'] = chemin(rail, tol=4)
COUCHES['vert'] = chemin([v.simplify(8) for v in vert], ferme=True, tol=0)
COUCHES['cimetiere'] = chemin(cimetiere, ferme=True, tol=3)
COUCHES['eau'] = chemin([MER.simplify(6)] + [p.simplify(4) for p in eau], ferme=True, tol=0)
COUCHES['eauL'] = chemin(eau_l, tol=4)
print('poids des couches (ko) :', {k: len(v) // 1000 for k, v in COUCHES.items()})

# --------------------------------------------------------------------- les vues de zoom (une par commune)
CARTE_W, CARTE_H = 860, 640
POLICE = 12
VUES = {}
for k, q in Q.items():
    b = q['g'].intersection(FRAME).bounds
    m = 300
    x0, y0, x1, y1 = b[0] - m, b[1] - m, b[2] + m, b[3] + m
    VUES[k] = dict(vb=[x0, y0, x1 - x0, y1 - y0], k=max((x1 - x0) / CARTE_W, (y1 - y0) / CARTE_H))

# --------------------------------------------------------------------- les itinéraires (profil porteur)
from itineraires import itineraires
# L'entrée s'accroche à SA route : au bout de l'A132, la voie la plus proche est la chaussée qui repart vers l'A13
# (sens unique) ; le camion devrait aller faire demi-tour à Pont-l'Évêque (15 km de trop jusqu'à Deauville).
POINTS_TOURNEE = [dict(id='depart', xy=ENTREE['xy'], rue=ENTREE.get('rue')),
                  dict(id='arrivee', xy=ENTREE['xy'], rue=ENTREE.get('rue'))] + \
    [dict(id=c['id'], xy=c['xy'], rue=c['rue']) for c in CLIENTS]
ITIN = itineraires(POINTS_TOURNEE, SEANCE.get('profil', 'porteur'))
TRAJETS = {k: dict(m=round(v['m']), d=chemin([LineString(v['g'])], tol=4)) for k, v in sorted(ITIN.items())}
print('itinéraires :', len(TRAJETS), 'trajets,', sum(len(t['d']) for t in TRAJETS.values()) // 1000, 'ko')
for c in CLIENTS:
    print(f"  entrée → {c['id']} : {TRAJETS['depart|' + c['id']]['m'] / 1000:.1f} km")

# --------------------------------------------------------------------- le nom des communes
# Même règle que les quartiers d'ENT-3.1 (« eviter ») : le nom cherche sa place, on ne déplace jamais un point.
# Il ne touche ni un point, ni le nom de l'entrée, ni un autre nom, et pose au moins 15 % de lui-même chez
# lui (une commune littorale est étroite : à cette échelle, « Trouville-sur-Mer » est plus large qu'elle).
FW, FH = NC * PAS, NL * PAS
K_ENS = max((FW + 400) / 860, (FH + 420) / 520)      # m par pixel en vue d'ensemble (cadre de ~520 px de haut)
FQ = 14 * K_ENS
largeur = lambda t, fpx: len(t) * 0.62 * fpx * K_ENS
obstacles = [Point(*c['xy']).buffer(20 * K_ENS) for c in CLIENTS + [ENTREE]]
ex, ey = ENTREE['xy']
obstacles.append(box(ex + 14 * K_ENS, ey - 9 * K_ENS, ex + 16 * K_ENS + largeur(ENTREE['nom'], 12.5), ey + 6 * K_ENS))
POS_Q, poses = {}, []
for k in sorted(Q, key=lambda k: Q[k]['g'].intersection(FRAME).area):
    g = Q[k]['g'].intersection(FRAME); w = largeur(Q[k]['nom'], 14); h = FQ
    rp = g.representative_point()
    best = None
    x0, y0, x1, y1 = g.buffer(1500).bounds
    for xx in range(int(x0), int(x1), 50):
        for yy in range(int(y0), int(y1), 50):
            b = box(xx - w / 2, yy - 0.8 * h, xx + w / 2, yy + 0.25 * h)
            if not FRAME.contains(b) or any(b.intersects(o) for o in obstacles + poses):
                continue
            dedans = b.intersection(g).area / b.area
            if dedans < 0.15:
                continue
            autre = max((b.intersection(Q[o]['g']).area / b.area for o in Q if o != k), default=0)
            if autre > 0.15:
                continue
            score = (round(autre, 2), -round(dedans, 1), Point(xx, yy).distance(rp))
            if best is None or score < best[0]:
                best = (score, xx, yy, b)
    assert best, f'aucune place pour le nom de {Q[k]["nom"]}'
    POS_Q[k] = (best[1], best[2]); poses.append(best[3].buffer(4 * K_ENS))
    print(f"nom de {Q[k]['nom']} : ({best[1]}, {best[2]}), {round(100 * best[3].intersection(g).area / best[3].area)} % chez elle")

# --------------------------------------------------------------------- le paquet de données
DATA = dict(
    frame=[OX, OY, FW, FH], pas=PAS, cols=COLS, nl=NL, marge=round(MARGE),
    unite='commune', boucle=True,
    attrib='© contributeurs OpenStreetMap · adresses : Base Adresse Nationale',
    couches=COUCHES,
    quartiers={k: dict(nom=q['nom'], iris=[], d=chemin([q['g'].intersection(F).simplify(10)], ferme=True, tol=0),
                       lx=POS_Q[k][0], ly=POS_Q[k][1],
                       vb=[round(v, 1) for v in VUES[k]['vb']], fs=round(POLICE * VUES[k]['k'], 2)) for k, q in Q.items()},
    etiquettes={k: [] for k in Q}, reperes=[], rues={}, index=[],
    trajets=TRAJETS,
    depart=dict(nom=ENTREE['nom'], x=round(ENTREE['xy'][0]), y=round(ENTREE['xy'][1])),
    arrivee=dict(nom=ENTREE['nom'], x=round(ENTREE['xy'][0]), y=round(ENTREE['xy'][1])),
    clients=[dict(id=c['id'], nom=c['nom'], adresse=f"{c['adresse']}, {c['cp']} {c['ville']}", rue=c['rue'], nouveau=False,
                  quartier=c['commune'], case=case_de(c['xy']), cases=cases_de(c['rueG']),
                  x=round(c['xy'][0], 1), y=round(c['xy'][1], 1),
                  rueD=chemin([c['rueG']], tol=0)) for c in CLIENTS],
)
DEPOT = os.path.normpath(os.path.join(ICI, '..', '..'))
sortie = os.path.join(DEPOT, *SEANCE['sortie'].split('/'))
TETE = """// GÉNÉRÉ par outils/carte/construire-cote.py — ne pas modifier à la main : relancer le script.
//
// La carte réelle de la côte normande (Honfleur → Houlgate), pour la vue Tournée d'ENT-6.9 (France Boissons).
// Tout est calculé depuis des données ouvertes, rien n'est recopié ni dessiné à la main :
//   - rues, eau, bois, voie ferrée, contours des communes : © contributeurs OpenStreetMap (ODbL) ;
//   - la mer : ce qui, dans le cadre, n'est dans aucune commune ;
//   - position des clients : Base Adresse Nationale (Licence Ouverte), ou milieu du tracé OSM de la rue ;
//   - itinéraires : plus court chemin d'un porteur par les routes OSM (`outils/carte/itineraires.py`).
// Coordonnées en mètres, projection locale (origine 0,13° O, 49,45° N ; y vers le sud).
//
// Séance : outils/carte/""" + os.path.basename(SEANCE_F) + """ — `clients` : """ + SEANCE['description'] + """
"""
with open(sortie, 'w', encoding='utf-8', newline='\n') as f:
    f.write(TETE + 'export const CARTE = ' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('module :', os.path.relpath(sortie, DEPOT), len(open(sortie, encoding='utf-8').read()) // 1000, 'ko')
