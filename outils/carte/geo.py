"""Outils communs aux scripts de la carte : projection locale en mètres, chargement des données.

Les données brutes ne sont PAS dans le dépôt (5 Mo, et elles ne servent qu'à reconstruire) :
elles vivent dans le Drive de Tristan, `Travail/Logistique/1L/Claude outputs/essai-plan-osm-sources/`
(`donnees.json`, `prepalog-batiments-ign.txt`). Les copier dans `outils/carte/sources/` (ignoré par
git) ou désigner le dossier par la variable d'environnement CARTE_SOURCES.
"""
import json, math, os
from shapely.geometry import shape, Polygon, MultiPolygon, LineString, Point
from shapely.ops import unary_union, transform

ICI = os.path.dirname(os.path.abspath(__file__))
SOURCES = os.environ.get('CARTE_SOURCES') or os.path.join(ICI, 'sources')

# L'EMPRISE : Nîmes par défaut (Boost, inchangé octet pour octet) ; `CARTE_EMPRISE=cote` pour la côte
# normande d'ENT-6.9 (`construire-cote.py` la règle lui-même). Chaque emprise a sa projection : à 49° N,
# un degré de longitude fait 72 km, contre 80 km à 44° N — garder celle de Nîmes fausserait les km de 10 %.
EMPRISE = os.environ.get('CARTE_EMPRISE', 'nimes')

def _cote():
    """Les extractions Overpass de la côte (`extraire-cote.mjs`), remises au format de `donnees.json` :
    une voie = { tags, g: [[lon, lat]…] } ; une relation = { tags, m: [{ r, g }…] }."""
    osm = []
    for nom in ('routes', 'decor', 'communes'):
        for e in json.load(open(os.path.join(SOURCES, 'cote', nom + '.json'), encoding='utf-8'))['elements']:
            x = dict(id=e['id'], type=e['type'], tags=e.get('tags', {}))
            if e['type'] == 'way' and 'geometry' in e:
                x['g'] = [[p['lon'], p['lat']] for p in e['geometry']]
            elif e['type'] == 'relation':
                x['m'] = [dict(r=m.get('role', ''), g=[[p['lon'], p['lat']] for p in m['geometry']])
                          for m in e.get('members', []) if m['type'] == 'way' and 'geometry' in m]
            osm.append(x)
    return dict(osm=osm, iris=[])

if EMPRISE == 'cote':
    D = _cote()
    # Origine : le coin nord-ouest de l'extraction (49,45° N ; 0,13° O). Longueur d'un degré à 49,36° N
    # (latitude moyenne de la côte), formules de l'ellipsoïde GRS 80 au premier ordre.
    LON0, LAT0 = -0.13, 49.45
    _PHI = math.radians(49.36)
    KX = 111412.84 * math.cos(_PHI) - 93.5 * math.cos(3 * _PHI)
    KY = 111132.92 - 559.82 * math.cos(2 * _PHI) + 1.175 * math.cos(4 * _PHI)
else:
    D = json.load(open(os.path.join(SOURCES, 'donnees.json'), encoding='utf-8'))
    # Origine de la projection : le coin nord-ouest de l'emprise d'ensemble.
    LON0, LAT0 = 4.312, 43.856
    KX = math.cos(math.radians(43.835)) * 111320.0   # m par degré de longitude
    KY = 110950.0                                      # m par degré de latitude (≈ à 44° N)

def xy(lon, lat):
    return ((lon - LON0) * KX, (LAT0 - lat) * KY)

def lonlat(x, y):
    return (LON0 + x / KX, LAT0 - y / KY)

def proj(geom):
    return transform(lambda lon, lat, z=None: xy(lon, lat), geom)

IRIS = {f['nom']: proj(shape(f['geom'])) for f in D['iris']}

def prolonger(l, d=400):
    """Prolonge une ligne de `d` mètres à ses deux bouts, dans le prolongement de ses segments."""
    c = list(l.coords)
    def ext(a, b):
        dx, dy = b[0]-a[0], b[1]-a[1]; n = math.hypot(dx, dy)
        return (b[0] + dx/n*d, b[1] + dy/n*d)
    return LineString([ext(c[1], c[0])] + c + [ext(c[-2], c[-1])])
