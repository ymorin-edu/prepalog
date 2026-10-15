"""Construit les contours France (régions, départements) projetés pour la maquette « Localiser ».
Source : gregoiredavid/france-geojson (IGN Admin Express COG 2018, Licence Ouverte)."""
import json, math, sys
from shapely.geometry import shape, mapping, Point
from shapely.ops import polylabel, unary_union
from shapely.geometry import Polygon, MultiPolygon

D = sys.argv[1]
LAT0 = 46.5
K = math.cos(math.radians(LAT0))
LON_MIN, LAT_MAX = -5.3, 51.2
S = 1000 / ((9.7 - LON_MIN) * K)  # largeur 1000 unités

def proj(lon, lat):
    return ((lon - LON_MIN) * K * S, (LAT_MAX - lat) * S)

def projgeom(g):
    def ring(c):
        return [proj(x, y) for x, y in c]
    if g.geom_type == 'Polygon':
        return Polygon(ring(g.exterior.coords), [ring(i.coords) for i in g.interiors])
    return MultiPolygon([projgeom(p) for p in g.geoms])

def path(g, tol):
    g = g.simplify(tol, preserve_topology=True)
    polys = [g] if g.geom_type == 'Polygon' else list(g.geoms)
    out = []
    for p in polys:
        if p.area < 4:  # petites îles
            continue
        pts = list(p.exterior.coords)[:-1]
        out.append('M' + 'L'.join(f'{x:.1f},{y:.1f}' for x, y in pts) + 'Z')
    return ''.join(out)

def lab(g):
    big = g if g.geom_type == 'Polygon' else max(g.geoms, key=lambda p: p.area)
    p = polylabel(big, 0.5)
    return [round(p.x, 1), round(p.y, 1)]

reg = json.load(open(f'{D}/regions-version-simplifiee.geojson'))
dep = json.load(open(f'{D}/departements-version-simplifiee.geojson'))
R = []
rg = {}
for f in reg['features']:
    g = projgeom(shape(f['geometry']))
    rg[f['properties']['code']] = g
    R.append({'code': f['properties']['code'], 'nom': f['properties']['nom'], 'd': path(g, 1.2),
              'bbox': [round(v, 1) for v in g.bounds], 'lab': lab(g)})
DP = []
for f in dep['features']:
    g = projgeom(shape(f['geometry']))
    c = g.representative_point()
    region = max(rg, key=lambda k: rg[k].intersection(g.buffer(0)).area)
    DP.append({'code': f['properties']['code'], 'nom': f['properties']['nom'], 'region': region,
               'd': path(g, 0.6), 'bbox': [round(v, 1) for v in g.bounds], 'lab': lab(g)})
H = round(max(r['bbox'][3] for r in R) + 10)
print(json.dumps({'w': 1000, 'h': H, 'proj': {'lonMin': LON_MIN, 'latMax': LAT_MAX, 'k': K, 's': S},
                  'regions': R, 'deps': DP}, ensure_ascii=False, separators=(',', ':')))
