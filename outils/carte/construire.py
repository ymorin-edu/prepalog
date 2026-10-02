"""Construit `contenus/boost-carte.js` : la carte réelle de Nîmes de la vue `core/types/carte.js`.

Usage : `python outils/carte/construire.py` (shapely requis ; sources : voir `geo.py`). Rejoué à
l'identique, il doit redonner le même fichier, octet pour octet — c'est ainsi qu'on sait que la
carte du dépôt vient bien des données, et pas d'une retouche à la main.

Repris le 02/10/2026 de la page d'essai validée par Tristan (`essai-plan-osm.html`, même calcul,
même résultat), pour la vue du moteur. Le calcul n'a pas changé ; seule la sortie change : un
module JS au lieu d'une page.

Tout est CALCULÉ depuis les données ouvertes, rien n'est recopié ni tracé à la main :
  - rues, voie ferrée, parcs, bâtiments : OpenStreetMap (ODbL), via Overpass ;
  - contours des quartiers : IRIS de l'INSEE (IGN, Licence Ouverte), regroupés ;
  - position des clients : Base Adresse Nationale (Licence Ouverte).
"""
import json, math, os, re, sys
from geo import *
from quartiers import quartiers
from shapely.ops import linemerge, substring
from shapely.geometry import box

Q = quartiers()
for k, q in Q.items():
    q['g'] = q['g'].simplify(2)

# --------------------------------------------------------------------- les clients de l'essai
# Commerces INVENTÉS, adresses RÉELLES (numéro compris), géocodées par la BAN le 02/10/2026.
# `place` : le client est-il DÉJÀ dans le fichier clients (habituel, posé sur la carte) ou
# NOUVEAU (l'élève le situe) ? Décision du 02/10 : seuls les nouveaux sont à repérer, pour que le
# temps de la séance aille à la tournée.
CLIENTS = [
    dict(id='c1', nom='Fromagerie Aubanel', adresse='8 rue de la Madeleine', rue='Rue de la Madeleine',
         lonlat=(4.359002, 43.838176), quartier='ecusson', kg=22, colis=3, nouveau=True),
    dict(id='c2', nom='Librairie Coste', adresse="21 rue de l'Aspic", rue="Rue de l'Aspic",
         lonlat=(4.35981, 43.836325), quartier='ecusson', kg=35, colis=4, nouveau=True),
    dict(id='c3', nom='Cave Fabre', adresse='10 rue Rousselier', rue='Rue Rousselier',
         lonlat=(4.338023, 43.838349), quartier='fontaine', kg=41, colis=5, nouveau=True),
    dict(id='c4', nom='Atelier Vidal', adresse='15 rue de Combret', rue='Rue de Combret',
         lonlat=(4.345752, 43.839495), quartier='fontaine', kg=18, colis=2, nouveau=False),
    dict(id='c5', nom='Boulangerie Roux', adresse='40 avenue du Maréchal Juin', rue='Avenue du Maréchal Juin',
         lonlat=(4.352897, 43.826111), quartier=None, kg=27, colis=3, nouveau=False, cp='30900'),
    dict(id='c6', nom='Fleuriste Bastide', adresse='12 rue Pierre Semard', rue='Rue Pierre Semard',
         lonlat=(4.365242, 43.839154), quartier=None, kg=14, colis=2, nouveau=False),
    dict(id='c7', nom='Quincaillerie Sabatier', adresse='30 avenue Jean-Jaurès', rue='Avenue Jean Jaurès',
         lonlat=(4.350326, 43.835791), quartier=None, kg=46, colis=6, nouveau=False, cp='30900'),
]
NOUVEAUX = [c for c in CLIENTS if c['nouveau']]
DEPART = dict(nom='Entrepôt Boost', adresse='31 avenue Joliot-Curie', lonlat=(4.32309, 43.81278))
GARE_LL = next(e['c'] for e in D['osm'] if e['tags'].get('railway') == 'station'
               and e['tags'].get('name') == 'Nîmes Centre')
ARRIVEE = dict(nom='Gare de Nîmes-Centre', lonlat=tuple(GARE_LL))

def lignes_de(nom):
    ls = [LineString([xy(*p) for p in e['g']]) for e in D['osm']
          if e['tags'].get('name') == nom and 'highway' in e['tags'] and 'g' in e]
    return linemerge(ls) if ls else None

for c in CLIENTS:
    c['xy'] = xy(*c['lonlat'])
    c['rueG'] = lignes_de(c['rue'])
    assert c['rueG'] is not None, c['rue']
    d = c['rueG'].distance(Point(c['xy']))
    assert d < 45, (c['nom'], d)                       # le point BAN est bien sur sa rue
    if c['quartier']:
        assert Q[c['quartier']]['g'].contains(Point(c['xy'])), c['nom']
DEPART['xy'] = xy(*DEPART['lonlat']); ARRIVEE['xy'] = xy(*ARRIVEE['lonlat'])

# --------------------------------------------------------------------- le quadrillage
# Cases de 1 km : « une case = un kilomètre » donne aussi un ordre de grandeur des distances.
# Le client réel ne bouge pas : c'est le quadrillage qu'on cale (alerte n° 34). Critères, dans
# l'ordre : 1) la rue de chaque client tient dans UNE case ; 2) chaque point (clients, entrepôt,
# gare) est le plus loin possible d'une ligne.
PAS, NC, NL = 1000, 5, 5
COLS = 'ABCDE'
besoin = [c['xy'] for c in CLIENTS] + [DEPART['xy'], ARRIVEE['xy']]
emprise = unary_union([q['g'] for q in Q.values()]).bounds
xmin = min(min(p[0] for p in besoin), emprise[0]) - 250
xmax = max(max(p[0] for p in besoin), emprise[2]) + 250
ymin = min(min(p[1] for p in besoin), emprise[1]) - 250
ymax = max(max(p[1] for p in besoin), emprise[3]) + 250

def cases_de(geom, ox, oy):
    out = set()
    for i in range(NC):
        for j in range(NL):
            if geom.intersects(box(ox + i*PAS, oy + j*PAS, ox + (i+1)*PAS, oy + (j+1)*PAS)):
                out.add(f'{COLS[i]}{j+1}')
    return out

def marge(p, ox, oy):
    dx = (p[0] - ox) % PAS; dy = (p[1] - oy) % PAS
    return min(dx, PAS - dx, dy, PAS - dy)

meilleur = None
for ox in range(int(xmax - NC*PAS) + 1, int(xmin), 10):
    for oy in range(int(ymax - NL*PAS) + 1, int(ymin), 10):
        m = min(marge(p, ox, oy) for p in besoin)
        if meilleur and m < meilleur[0][1] - 1e-9 and meilleur[0][0] == 0:
            continue
        coupees = sum(len(cases_de(c['rueG'], ox, oy)) > 1 for c in NOUVEAUX)
        cle = (coupees, -m)
        if meilleur is None or cle < (meilleur[0][0], -meilleur[0][1]):
            meilleur = ((coupees, m), ox, oy)
(coupees, MARGE), OX, OY = meilleur
print(f'quadrillage : origine ({OX}, {OY}), rues coupées {coupees}, marge mini {MARGE:.0f} m')
for c in CLIENTS:
    c['cases'] = sorted(cases_de(c['rueG'], OX, OY))
    c['case'] = cases_de(Point(c['xy']), OX, OY).pop()
    print(' ', c['nom'], c['case'], c['cases'], f"{marge(c['xy'], OX, OY):.0f} m")
FRAME = box(OX, OY, OX + NC*PAS, OY + NL*PAS)
F = FRAME.buffer(60, join_style=2)

# --------------------------------------------------------------------- les couches du fond
def chemin(geoms, ferme=False, tol=1.0):
    """Une seule chaîne de chemin SVG, coordonnées relatives entières (fichier léger)."""
    out = []
    for g in geoms:
        if g.is_empty:
            continue
        parts = getattr(g, 'geoms', [g])
        for p in parts:
            if p.geom_type == 'Polygon':
                rings = [p.exterior] + list(p.interiors)
            elif p.geom_type == 'LineString':
                rings = [p]
            else:
                continue
            for r in rings:
                r = r.simplify(tol) if tol else r
                cs = [(round(x), round(y)) for x, y in r.coords]
                cs = [c for i, c in enumerate(cs) if i == 0 or c != cs[i-1]]
                if len(cs) < 2:
                    continue
                s = f'M{cs[0][0]} {cs[0][1]}'
                px, py = cs[0]
                for x, y in cs[1:]:
                    s += f'l{x-px} {y-py}'; px, py = x, y
                out.append(s + ('z' if ferme else ''))
    return ''.join(out)

CLASSES = {
    'maj': ('motorway', 'trunk', 'primary', 'motorway_link', 'trunk_link', 'primary_link'),
    'sec': ('secondary', 'tertiary', 'secondary_link', 'tertiary_link'),
    'min': ('unclassified', 'residential', 'living_street'),
    'ped': ('pedestrian',),
    'svc': ('service',),
    'pie': ('footway', 'steps', 'cycleway'),
}
cls_de = {v: k for k, vs in CLASSES.items() for v in vs}
routes = {k: [] for k in CLASSES}
rail, vert, eau, cimetiere, eau_l = [], [], [], [], []
batis = []
monuments = []

def poly_de(e):
    try:
        if 'g' in e and len(e['g']) >= 4 and e['g'][0] == e['g'][-1]:
            return Polygon([xy(*p) for p in e['g']]).buffer(0)
        if 'm' in e:
            outers = [LineString([xy(*p) for p in m['g']]) for m in e['m'] if m['r'] != 'inner']
            from shapely.ops import polygonize
            return unary_union(list(polygonize(unary_union(outers))))
    except Exception:
        return None

ZONES = unary_union([q['g'] for q in Q.values()]).buffer(320)
for e in D['osm']:
    t = e['tags']
    if 'highway' in t and 'g' in e and t['highway'] in cls_de:
        if t.get('area') == 'yes':
            continue
        g = LineString([xy(*p) for p in e['g']]).intersection(F)
        routes[cls_de[t['highway']]].append(g)
    elif t.get('railway') == 'rail' and 'g' in e:
        if t.get('service') in ('yard', 'siding', 'spur'):
            continue
        rail.append(LineString([xy(*p) for p in e['g']]).intersection(F))
    elif t.get('leisure') in ('park', 'garden') or t.get('landuse') in ('grass', 'forest'):
        p = poly_de(e)
        if p and not p.is_empty: vert.append(p.intersection(F))
    elif t.get('landuse') == 'cemetery':
        p = poly_de(e)
        if p and not p.is_empty: cimetiere.append(p.intersection(F))
    elif t.get('natural') == 'water':
        p = poly_de(e)
        if p and not p.is_empty: eau.append(p.intersection(F))
    elif 'waterway' in t and 'g' in e and t['waterway'] in ('canal', 'river', 'stream'):
        eau_l.append(LineString([xy(*p) for p in e['g']]).intersection(F))
    elif 'building' in t and 'g' in e:
        p = poly_de(e)
        if p and not p.is_empty and p.intersects(ZONES): batis.append(p)
    if t.get('historic') in ('monument', 'archaeological_site', 'castle', 'tower', 'ruins') or t.get('tourism') == 'attraction':
        if 'name' in t:
            p = poly_de(e)
            if p and not p.is_empty and p.area > 300:
                monuments.append((t['name'], p))

# Bâtiments à l'ouest de 4,340° E : la BD TOPO de l'IGN (Overpass ne répondait plus). Déjà
# projetés dans le navigateur avec la même projection que geo.py, en entiers relatifs.
extra = os.path.join(SOURCES, 'prepalog-batiments-ign.txt')
if os.path.exists(extra):
    for enc in open(extra).read().split('|'):
        pts = []; x = y = 0
        for i, c in enumerate(enc.split(';')):
            a, b = map(int, c.split(','))
            x, y = (a, b) if i == 0 else (x + a, y + b)
            pts.append((x, y))
        p = Polygon(pts).buffer(0)
        if not p.is_empty and p.intersects(ZONES): batis.append(p)
else:
    sys.exit('bâtiments de l’ouest absents : ' + extra)

COUCHES = {k: chemin(v, tol=1.5) for k, v in routes.items()}
COUCHES['rail'] = chemin(rail, tol=2)
COUCHES['vert'] = chemin(vert, ferme=True, tol=2)
COUCHES['cimetiere'] = chemin(cimetiere, ferme=True, tol=2)
COUCHES['eau'] = chemin(eau, ferme=True, tol=1.5)
COUCHES['eauL'] = chemin(eau_l, tol=1.5)
COUCHES['bati'] = chemin([b.simplify(0.8) for b in batis], ferme=True, tol=0)
print('poids des couches (ko) :', {k: len(v)//1000 for k, v in COUCHES.items()})

# --------------------------------------------------------------------- les vues de zoom
CARTE_W, CARTE_H = 860, 640          # taille nominale de la carte à l'écran (px)
POLICE = 12                          # px à l'écran
VUES = {}
for k, q in Q.items():
    b = q['g'].bounds
    m = 90
    x0, y0, x1, y1 = b[0]-m, b[1]-m, b[2]+m, b[3]+m
    kpx = max((x1-x0)/CARTE_W, (y1-y0)/CARTE_H)          # mètres par pixel
    VUES[k] = dict(vb=[x0, y0, x1-x0, y1-y0], k=kpx)

# --------------------------------------------------------------------- les noms de rues
# Une étiquette par rue et par vue, posée le long de la rue (textPath), dans le sens de la
# lecture, seulement si la rue est assez longue pour la porter, et sans chevaucher une autre.
noms = {}
for e in D['osm']:
    t = e['tags']
    if 'highway' in t and 'name' in t and 'g' in e and t['highway'] in cls_de:
        noms.setdefault(t['name'], []).append((cls_de[t['highway']], LineString([xy(*p) for p in e['g']])))
RANG = {'maj': 0, 'sec': 1, 'min': 2, 'ped': 2, 'svc': 4, 'pie': 3}

def lisible(ls):
    c = list(ls.coords)
    return ls if c[-1][0] >= c[0][0] else LineString(c[::-1])

ETIQ = {}
RUES_CLIENTS = {c['rue'] for c in NOUVEAUX}
# Largeur RÉELLE de chaque nom, mesurée dans un navigateur (mesure.py), police 100. Le 02/10, une
# estimation au nombre de lettres ET un chemin d'étiquette trop court ont laissé « ous » à la place
# de « Rue Rousselier » : le navigateur coupe un texte plus long que son chemin, aux deux bouts.
LARGEURS = json.load(open(os.path.join(ICI, 'largeurs.json'), encoding='utf-8'))
MARGE_TEXTE = 1.15        # Segoe UI (Windows) n'a pas exactement les largeurs de la police de mesure

def longueur_texte(nom, rang, fs):
    w = LARGEURS[nom][1 if rang <= 1 else 0] / 100
    return w * fs * MARGE_TEXTE + 0.8 * fs

def ligne_droite(centre, angle, L):
    dx, dy = math.cos(angle) * L / 2, math.sin(angle) * L / 2
    return LineString([(centre.x - dx, centre.y - dy), (centre.x + dx, centre.y + dy)])

def direction(p):
    """Direction générale d'une rue : sa corde, ou son plus long segment si elle fait un U."""
    c = list(p.coords)
    if Point(c[0]).distance(Point(c[-1])) >= 0.35 * p.length:
        a, b = c[0], c[-1]
    else:
        a, b = max(zip(c, c[1:]), key=lambda s: math.dist(*s))
    return math.atan2(b[1] - a[1], b[0] - a[0])

for k, v in VUES.items():
    x0, y0, w, h = v['vb']
    fs = POLICE * v['k']
    zone = box(x0, y0, x0+w, y0+h).buffer(-fs*1.2)
    dedans = Q[k]['g']
    cands = []
    for nom, segs in noms.items():
        rang = min(RANG[c] for c, _ in segs)
        g = linemerge([s for _, s in segs]).intersection(zone)
        if g.is_empty: continue
        pieces = [p for p in getattr(g, 'geoms', [g]) if p.geom_type == 'LineString']
        if not pieces: continue
        p = max(pieces, key=lambda p: p.length)
        client = nom in RUES_CLIENTS
        interieur = p.intersection(dedans).length > 0.5 * p.length
        cands.append((0 if client else 1, 0 if interieur else 1, rang, -p.length, nom, p, client))
    cands.sort(key=lambda c: c[:4])
    poses, out = [], []
    for _, _, rang, _, nom, p, client in cands:
        L = longueur_texte(nom, rang, fs)
        sub = None
        if p.length >= L:
            # le tronçon le plus droit de longueur L : le nom suit la rue
            best = None
            n = max(1, int((p.length - L) / (fs * 2)) + 1)
            for i in range(n + 1):
                a = (p.length - L) * i / max(n, 1)
                t = substring(p, a, a + L)
                if t.length == 0: continue
                corde = Point(t.coords[0]).distance(Point(t.coords[-1]))
                score = corde / t.length - 0.15 * abs(a + L/2 - p.length/2) / p.length
                if best is None or score > best[0]:
                    best = (score, t)
            if best and best[0] >= 0.80:
                sub = best[1].simplify(fs * 0.25)
                if sub.length < L * 0.98:        # la simplification raccourcit : on rallonge
                    sub = prolonger(sub, (L - sub.length) / 2)
        if sub is None:
            droite = Point(p.coords[0]).distance(Point(p.coords[-1])) >= 0.9 * p.length
            if not (client or (droite and p.length >= 0.6 * L)):
                continue
            # Rue courte ou tordue : un nom en ligne DROITE, de la bonne longueur, centré sur le
            # milieu de la rue et dans sa direction générale. Une rue de client n'est jamais sautée.
            sub = ligne_droite(p.interpolate(0.5, normalized=True), direction(p), L)
        sub = lisible(sub)
        assert sub.length >= L * 0.97, (nom, sub.length, L)
        emp = sub.buffer(fs * 0.75, cap_style=2)
        if any(emp.intersects(o) for o in poses):
            assert not client, f'le nom de la {nom} chevauche une autre étiquette'
            continue
        poses.append(emp)
        cs = [(round(x, 1), round(y, 1)) for x, y in sub.coords]
        out.append(dict(n=nom, d='M' + ' L'.join(f'{x} {y}' for x, y in cs), r=rang, L=round(L, 1)))
    ETIQ[k] = out
    print(f'étiquettes {k} : {len(out)} rues nommées (police {fs:.1f} m)')
for c in NOUVEAUX:
    assert any(e['n'] == c['rue'] for e in ETIQ[c['quartier']]), f"{c['rue']} sans nom dans le zoom {c['quartier']}"

# Les repères (monuments, jardins) : un nom posé au centre, dans les vues de zoom.
REPERES = []
vus = set()
for nom, p in sorted(monuments, key=lambda m: -m[1].area):
    if nom in vus: continue
    c = p.representative_point()
    if any(Q[k]['g'].buffer(150).contains(c) for k in Q):
        REPERES.append(dict(n=nom, x=round(c.x), y=round(c.y))); vus.add(nom)
for e in D['osm']:
    t = e['tags']
    if t.get('leisure') == 'park' and t.get('name') and t['name'] not in vus:
        p = poly_de(e)
        if p and not p.is_empty and p.area > 5000 and any(Q[k]['g'].contains(p.representative_point()) for k in Q):
            c = p.representative_point(); REPERES.append(dict(n=t['name'], x=round(c.x), y=round(c.y))); vus.add(t['name'])
print('repères :', [r['n'] for r in REPERES])

# --------------------------------------------------------------------- les rues cliquables et l'index
# Toutes les rues nommées des vues de zoom : c'est sur elles qu'on reconnaît la rue cliquée
# (« vous avez cliqué sur la rue Nationale »). L'index, lui, liste les rues QUI TRAVERSENT un
# quartier, avec le ou les quartiers et la ou les cases : comme l'index d'un plan papier. Il liste
# toutes les rues, pas seulement celles des clients, donc il ne souffle rien.
ZOOMS = unary_union([box(v['vb'][0], v['vb'][1], v['vb'][0] + v['vb'][2], v['vb'][1] + v['vb'][3]) for v in VUES.values()])
RUES = {}
INDEX = []
TYPES = r"^(rue|avenue|boulevard|place|chemin|impasse|allée|quai|square|montée|corniche|route|passage|esplanade|cours|plan|traverse|carriera|petite rue|grand'rue)\s+"
ARTICLES = r"^(de la|de l'|de l’|du|des|d'|d’|de|la|le|les|l')\s*"
def cle_index(nom):
    reste = re.sub(TYPES, '', nom, flags=re.I)
    if reste == nom:      # Grand'Rue, Résidence…
        return nom, nom
    principal = re.sub(ARTICLES, '', reste, flags=re.I) or reste
    return principal, principal
import unicodedata
def tri(t):
    return unicodedata.normalize('NFD', t).encode('ascii', 'ignore').decode().lower()
for nom, segs in noms.items():
    g = linemerge([sg for _, sg in segs])
    z = g.intersection(ZOOMS)
    if z.is_empty or z.length < 15:
        continue
    RUES[nom] = chemin([z], tol=1)
    qk = [k for k, q in Q.items() if g.intersection(q['g']).length >= 25]
    if qk:
        dedans = unary_union([g.intersection(Q[k]['g']) for k in qk])
        principal, _ = cle_index(nom)
        INDEX.append(dict(n=nom, p=principal, q=qk, c=sorted(cases_de(dedans, OX, OY))))
INDEX.sort(key=lambda e: tri(e['p']))
print('rues cliquables :', len(RUES), '| index :', len(INDEX), 'rues')
for c in NOUVEAUX:
    assert c['rue'] in RUES and any(e['n'] == c['rue'] for e in INDEX), c['rue']

# --------------------------------------------------------------------- le paquet de données
def ring(g):
    return chemin([g], ferme=True, tol=0)

DATA = dict(
    frame=[OX, OY, NC*PAS, NL*PAS], pas=PAS, cols=COLS, nl=NL, marge=round(MARGE),
    couches=COUCHES,
    quartiers={k: dict(nom=q['nom'], iris=q['iris'], d=ring(q['g']),
                       lx=round(q['g'].representative_point().x), ly=round(q['g'].representative_point().y),
                       vb=[round(v, 1) for v in VUES[k]['vb']], fs=round(POLICE * VUES[k]['k'], 2)) for k, q in Q.items()},
    etiquettes=ETIQ, reperes=REPERES, rues=RUES, index=INDEX,
    depart=dict(nom=DEPART['nom'], x=round(DEPART['xy'][0]), y=round(DEPART['xy'][1])),
    arrivee=dict(nom=ARRIVEE['nom'], x=round(ARRIVEE['xy'][0]), y=round(ARRIVEE['xy'][1])),
    clients=[dict(id=c['id'], nom=c['nom'], adresse=c['adresse'] + ', ' + c.get('cp', '30000') + ' Nîmes', rue=c['rue'], nouveau=c['nouveau'],
                  quartier=c['quartier'], case=c['case'], cases=c['cases'], kg=c['kg'], colis=c['colis'],
                  x=round(c['xy'][0], 1), y=round(c['xy'][1], 1),
                  rueD=chemin([c['rueG']], tol=0)) for c in CLIENTS],
)
DEPOT = os.path.normpath(os.path.join(ICI, '..', '..'))
sortie = os.path.join(DEPOT, 'contenus', 'boost-carte.js')
TETE = """// GÉNÉRÉ par outils/carte/construire.py — ne pas modifier à la main : relancer le script.
//
// La carte réelle de Nîmes, pour la vue `core/types/carte.js` (ENT-3.2 et suivantes).
// Tout est calculé depuis des données ouvertes, rien n'est recopié ni dessiné à la main :
//   - rues, voie ferrée, parcs, bâti : © contributeurs OpenStreetMap (ODbL) ;
//   - bâti à l'ouest de 4,340° E : IGN BD TOPO (Licence Ouverte) ;
//   - contours des quartiers : IRIS © IGN-INSEE (Licence Ouverte), regroupés ;
//   - position des clients : Base Adresse Nationale (Licence Ouverte).
// Coordonnées en mètres, projection locale (origine 4,312° E, 43,856° N ; y vers le sud).
//
// `clients` : les sept clients de la page d'essai du 02/10/2026 (commerces inventés, adresses
// réelles). Ils servent à la vue tant qu'ENT-3.2 n'a pas les siens (étape 2).
"""
with open(sortie, 'w', encoding='utf-8', newline='\n') as f:
    f.write(TETE + 'export const CARTE = ' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('module :', os.path.relpath(sortie, DEPOT), len(open(sortie, encoding='utf-8').read()) // 1000, 'ko')
