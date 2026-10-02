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
