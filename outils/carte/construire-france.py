r"""Construit le module des CONTOURS DE LA FRANCE MÉTROPOLITAINE (13 régions, 96 départements) pour la vue
« Localiser » (brief MOTEUR-vue-localiser, lot 1) : `contenus/france-contours.js`.

Usage : `py outils/carte/construire-france.py` (shapely 2.1 et numpy requis ; GEOS >= 3.12 pour
`coverage_simplify`). Rejoué à l'identique sur les mêmes sources, il redonne le même fichier, octet pour octet
(alerte 11) : aucun horodatage, tout est trié par code, les empreintes SHA-256 des sources sont écrites en tête
du module.

Sources (récupérées le 15/10/2026, rangées dans `outils/carte/sources/france/`, ignoré par git) :
    curl -L -o outils/carte/sources/france/regions.geojson \
        https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions.geojson
    curl -L -o outils/carte/sources/france/departements.geojson \
        https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements.geojson
  Dépôt : https://github.com/gregoiredavid/france-geojson (Grégoire David). Données : IGN Admin Express COG
  (édition 2018 pour les tracés, INSEE millésime 2018 pour les noms et codes), sous Licence Ouverte Etalab.
  ATTENTION : ces deux fichiers ne sont PAS les tracés bruts de l'IGN. Le dépôt les a déjà simplifiés
  (mapshaper, Visvalingam pondéré à 25 %, coordonnées à 5 décimales, soit ~1 m) ; la version brute (143 Mo,
  toutes mailles confondues) n'est pas téléchargée ici. Le fichier « version-simplifiee » du même dépôt (5 %)
  est plus grossier encore : on ne l'utilise pas.

Ce que fait le script :
  - projection équirectangulaire à 46,5° N, la même que la maquette validée (docs/briefs/action/
    maquette-localiser-build_geo.py) : la France métropolitaine tient sur une largeur de 1000 « unités de
    base » ; ici les coordonnées sont des ENTIERS sur une grille UNITE fois plus fine (voir `proj`) ;
  - frontières SANS JOUR : les départements forment une couverture polygonale (`shapely.coverage_is_valid`
    vérifié à l'entrée, après simplification et après arrondi) ; la simplification se fait sur la TOPOLOGIE
    partagée (`shapely.coverage_simplify`, GEOS), pas polygone par polygone. Deux niveaux : SIMPLE (vue France
    et vue région) et FIN (zoom d'un département) ;
  - une RÉGION est l'UNION de ses départements simplifiés (rattachement par le fichier des régions) : la
    frontière extérieure d'une région est donc celle de ses départements, au point près, et aucun jour
    n'est possible entre une région et ses départements ;
  - les petites îles sous un seuil d'aire sont retirées (SEUIL_ILE_*), sauf les petits polygones qui touchent un
    autre département (exclaves de la source : les retirer percerait un trou dans le voisin) ;
  - CONTRÔLES (le build s'arrête si faux) : 13 régions, 96 départements, chaque département dans une région
    existante, codes uniques, aucun tracé vide, tout polygone valide, couverture valide à chaque niveau,
    région = union exacte de ses départements.
"""
import hashlib, json, math, os, re, sys
import numpy as np
import shapely
from shapely.geometry import shape, Polygon, MultiPolygon
from shapely.ops import polygonize, polylabel, unary_union

ICI = os.path.dirname(os.path.abspath(__file__))
DEPOT = os.path.normpath(os.path.join(ICI, '..', '..'))
SOURCES = os.path.join(ICI, 'sources', 'france')
SORTIE = os.path.join(DEPOT, 'contenus', 'france-contours.js')

# --------------------------------------------------------------------- les réglages
LAT0 = 46.5                      # latitude de projection (échelle des longitudes)
LON_MIN, LAT_MAX, LON_MAX = -5.3, 51.2, 9.7
LARGEUR_BASE = 1000              # la France métropolitaine sur 1000 unités de base (comme la maquette)
UNITE = 20                       # grille : 1 unité de base = 20 unités de grille (1 unité de grille ~ 58 m)
TOL_SIMPLE = 0.8                 # unités de base ; vue France et vue région (~ 0,9 km)
TOL_FIN = 0.2                    # unités de base ; zoom département (~ 230 m)
SEUIL_ILE_SIMPLE = 4.0           # unités de base² (~ 5 km²) : comme la maquette
SEUIL_ILE_FIN = 1.0              # unités de base² (~ 1,3 km²)
SEUIL_TROU = 2.0                 # unités de base² : sous cette aire, une face sans département n'est pas un trou mais un fragment
GAP_FENTE = 1.0                  # unités de grille : largeur sous laquelle un vide entre voisins est une fente
MARGE_BAS = 10                   # unités de base sous la Corse
ATTRIB = 'Contours : IGN Admin Express (Licence Ouverte)'

REGIONS_ATTENDUES = ['11', '24', '27', '28', '32', '44', '52', '53', '75', '76', '84', '93', '94']
NB_DEPS = 96

K = math.cos(math.radians(LAT0))
S_BASE = LARGEUR_BASE / ((LON_MAX - LON_MIN) * K)        # unités de base par degré de latitude
S = S_BASE * UNITE                                        # unités de grille par degré de latitude


def sha(chemin):
    with open(chemin, 'rb') as f:
        return hashlib.sha256(f.read()).hexdigest()


def charger(nom):
    chemin = os.path.join(SOURCES, nom)
    if not os.path.exists(chemin):
        raise SystemExit(f'source absente : {chemin} (voir les commandes curl en tête de ce script)')
    with open(chemin, encoding='utf-8') as f:
        return json.load(f), sha(chemin)


def projeter(g):
    """Longitude-latitude -> unités de BASE (flottants)."""
    return shapely.transform(g, lambda a: np.column_stack(((a[:, 0] - LON_MIN) * K * S_BASE, (LAT_MAX - a[:, 1]) * S_BASE)))


def polys(g):
    return [g] if g.geom_type == 'Polygon' else list(g.geoms)


def regrouper(lst):
    return lst[0] if len(lst) == 1 else MultiPolygon(lst)


def sans_petites_iles(g, seuil, autres, ou):
    """Retire les polygones d'aire < seuil, SAUF ceux qui touchent un autre département (enclave ou exclave de la
    source : l'enlever percerait un trou dans le voisin). Rend (géométrie, nombre retiré, nombre gardé au contact)."""
    gardes, retires, contact = [], 0, 0
    for p in polys(g):
        if p.area >= seuil:
            gardes.append(p)
        elif any(p.distance(a) < 1e-9 for a in autres):
            gardes.append(p)
            contact += 1
        else:
            retires += 1
    if not gardes:
        raise SystemExit(f'{ou} : plus aucun polygone après le seuil des îles')
    return regrouper(gardes), retires, contact


def trous_de(geoms):
    """Aires (en unités de grille², arrondies) des TROUS d'une couverture : zones fermées par des frontières et
    qu'aucun département ne recouvre (l'étang de Berre, par exemple)."""
    faces = list(polygonize(unary_union([g.boundary for g in geoms])))
    arbre = shapely.STRtree(geoms)
    return sorted(round(f.area) for f in faces if f.area >= SEUIL_TROU * UNITE * UNITE
                  and not any(geoms[int(i)].contains(f.representative_point()) for i in arbre.query(f)))


def arrondir_couverture(simp):
    """Unités de base -> entiers de grille, pour TOUTE la couverture à la fois. Arrondir chaque polygone à part
    peut croiser deux bords très proches (fente, chevauchement, auto-intersection) : on arrondit donc le
    LINÉAIRE de toutes les frontières ensemble (noeudage avec arrondi, GEOS), puis on refait les faces
    (`polygonize`) et on rend à chaque département les faces qui recouvrent le sien. La couverture est valide
    par construction et chaque sommet est un entier. Les trous de la couverture (étang de Berre) restent des
    trous ; il n'en apparaît aucun autre."""
    gros = [shapely.transform(g, lambda a: a * UNITE) for g in simp]
    lignes = unary_union([g.boundary for g in gros])
    arrondi = unary_union(shapely.set_precision(lignes, 1.0))
    faces = list(polygonize(arrondi))
    arbre = shapely.STRtree(gros)
    par_dep = [[] for _ in gros]
    trous = []
    for f in faces:
        best, best_a = None, 0.0
        for i in arbre.query(f):
            a = f.intersection(gros[int(i)]).area
            if a > best_a:
                best, best_a = int(i), a
        if best is not None and best_a >= 0.5 * f.area:
            par_dep[best].append(f)
        elif f.area >= SEUIL_TROU * UNITE * UNITE:
            trous.append(round(f.area))
        else:       # un fragment minuscule créé par l'arrondi (< SEUIL_TROU) : il revient au département le plus proche
            j = int(arbre.nearest(f.representative_point()))
            par_dep[j].append(f)
    avant = trous_de(gros)
    if len(trous) != len(avant) or any(abs(x - y) > 0.05 * y + 20 for x, y in zip(sorted(trous), avant)):
        raise SystemExit(f'les trous de la couverture ont changé à l’arrondi : avant {avant}, après {sorted(trous)}')
    out = []
    for c, fs in zip(codes, par_dep):
        if not fs:
            raise SystemExit(f'{c} : aucune face après arrondi')
        out.append(shapely.normalize(shapely.remove_repeated_points(unary_union(fs), 0)))
    ref = sum(g.area for g in gros)
    if abs(sum(g.area for g in out) - ref) > 0.002 * ref:
        raise SystemExit('l’aire totale a changé de plus de 0,2 % à l’arrondi')
    print(f'    trous de la couverture (unités de grille²) : {sorted(trous)}')
    return out


def nb_sommets(g):
    return sum(len(p.exterior.coords) - 1 + sum(len(i.coords) - 1 for i in p.interiors) for p in polys(g))


def chemin(g):
    """Chemin SVG en coordonnées relatives entières (le format de `construire-region.py`, relu par `segments()`
    de core/types/carte.js) : « M x y l dx dy … z », un sous-chemin par anneau. Tracé normalisé (point de départ
    et sens canoniques) pour que le fichier ne dépende pas de l'ordre interne de GEOS."""
    out = []
    for p in polys(shapely.normalize(g)):
        for r in [p.exterior] + list(p.interiors):
            cs = [(int(x), int(y)) for x, y in r.coords][:-1]
            if len(cs) < 3:
                continue
            s = f'M{cs[0][0]} {cs[0][1]}'
            px, py = cs[0]
            for x, y in cs[1:]:
                s += f'l{x - px} {y - py}'
                px, py = x, y
            out.append(s + 'z')
    res = ''.join(out)
    if not res:
        raise SystemExit('tracé vide')
    return res


def etiquette(g):
    """Point d'étiquette : centre du plus grand polygone (pôle d'inaccessibilité, comme la maquette), en entiers."""
    gros = max(polys(g), key=lambda p: (p.area, p.bounds))
    p = polylabel(gros, 10)
    return [int(round(p.x)), int(round(p.y))]


def cadre(g):
    return [int(v) for v in g.bounds]


# --------------------------------------------------------------------- lecture des sources
reg_json, sha_reg = charger('regions.geojson')
dep_json, sha_dep = charger('departements.geojson')

REG_SRC = {f['properties']['code']: (f['properties']['nom'], shape(f['geometry'])) for f in reg_json['features']}
if sorted(REG_SRC) != REGIONS_ATTENDUES:
    raise SystemExit(f'régions inattendues : {sorted(REG_SRC)}')
deps_f = sorted(dep_json['features'], key=lambda f: f['properties']['code'])
codes = [f['properties']['code'] for f in deps_f]
if len(set(codes)) != len(codes):
    raise SystemExit('codes de départements en double')
if len(codes) != NB_DEPS:
    raise SystemExit(f'{len(codes)} départements au lieu de {NB_DEPS}')
NOMS_DEP = {f['properties']['code']: f['properties']['nom'] for f in deps_f}
BRUT = [projeter(shape(f['geometry'])) for f in deps_f]
if not all(g.is_valid for g in BRUT):
    raise SystemExit('un département de la source est invalide')
if not shapely.coverage_is_valid(BRUT):
    raise SystemExit('les départements de la source ne forment pas une couverture valide')

# Rattachement département -> région : la région du fichier des régions qui contient son point intérieur ;
# contre-épreuve : celle qui recouvre le plus de surface. Les deux doivent s'accorder.
REG_PROJ = {c: projeter(g) for c, (n, g) in REG_SRC.items()}
REGION_DE = {}
for code, g in zip(codes, BRUT):
    pt = g.representative_point()
    par_point = [c for c, rg in REG_PROJ.items() if rg.contains(pt)]
    par_aire = max(REG_PROJ, key=lambda c: (REG_PROJ[c].intersection(g).area, c))
    if len(par_point) != 1 or par_point[0] != par_aire:
        raise SystemExit(f'département {code} : région ambiguë (point {par_point}, aire {par_aire})')
    REGION_DE[code] = par_point[0]
if set(REGION_DE.values()) != set(REGIONS_ATTENDUES):
    raise SystemExit('une région n’a aucun département')

# --------------------------------------------------------------------- simplification de la topologie
def niveau(tol, seuil_ile, etiq):
    """Couverture simplifiée (frontières communes préservées), petites îles retirées, arrondie à la grille.
    Rend la liste des géométries en entiers de grille, dans l'ordre de `codes`."""
    simp = list(shapely.coverage_simplify(BRUT, tol))
    sortie, retirees, contact = [], 0, 0
    for i, g in enumerate(simp):
        autres = [simp[j] for j in range(len(simp)) if j != i and simp[j].bounds[0] <= g.bounds[2] and simp[j].bounds[2] >= g.bounds[0]
                  and simp[j].bounds[1] <= g.bounds[3] and simp[j].bounds[3] >= g.bounds[1]]
        g2, n, c = sans_petites_iles(g, seuil_ile, autres, f'{etiq} {codes[i]}')
        retirees += n
        contact += c
        sortie.append(g2)
    ent = arrondir_couverture(sortie)
    for c, g in zip(codes, ent):
        if not g.is_valid:
            raise SystemExit(f'{etiq} {c} : tracé invalide après arrondi ({shapely.is_valid_reason(g)})')
    if not shapely.coverage_is_valid(ent):
        raise SystemExit(f'{etiq} : la couverture n’est plus valide après arrondi (fente ou chevauchement)')
    # Fentes étroites : deux frontières voisines séparées de moins de GAP_FENTE unité de grille (~ 58 m), ce que
    # l'arrondi pourrait créer. Plus large, ce seraient de vraies passes de la source (estuaires de Bretagne, baie
    # de Somme : la source en a à 0,15 unité de base) et le contrôle crierait à tort.
    fentes = [codes[i] for i, e in enumerate(shapely.coverage_invalid_edges(ent, gap_width=GAP_FENTE)) if e is not None and not e.is_empty]
    if fentes:
        raise SystemExit(f'{etiq} : fentes étroites entre départements voisins (< {GAP_FENTE} unités de grille) : {fentes}')
    return ent, retirees, contact


SIMPLE, ILES_S, CONTACT_S = niveau(TOL_SIMPLE, SEUIL_ILE_SIMPLE, 'simple')
FIN, ILES_F, CONTACT_F = niveau(TOL_FIN, SEUIL_ILE_FIN, 'fin')

# --------------------------------------------------------------------- les régions = unions de départements
REGION_G = {}
for rc in REGIONS_ATTENDUES:
    membres = [g for c, g in zip(codes, SIMPLE) if REGION_DE[c] == rc]
    u = shapely.normalize(unary_union(membres))
    if u.is_empty or not u.is_valid:
        raise SystemExit(f'région {rc} : union vide ou invalide')
    pts = [xy for p in polys(u) for r in [p.exterior] + list(p.interiors) for xy in r.coords]
    if any(x != int(x) or y != int(y) for x, y in pts):
        raise SystemExit(f'région {rc} : l’union a créé des sommets hors grille (frontières mal jointes)')
    # région = union EXACTE de ses départements : même aire
    if abs(u.area - sum(g.area for g in membres)) > 1e-6:
        raise SystemExit(f'région {rc} : aire de l’union différente de la somme des départements')
    REGION_G[rc] = u
    # contre-épreuve avec la région de la source (même emplacement, aire proche à quelques % près)
    ref = REG_PROJ[rc].area * UNITE * UNITE
    if abs(u.area - ref) / ref > 0.03:
        raise SystemExit(f'région {rc} : aire {u.area:.0f} trop éloignée de celle de la source {ref:.0f}')

# --------------------------------------------------------------------- voisins (départements qui se touchent)
VOISINS = {c: [] for c in codes}
for i, a in enumerate(FIN):
    for j in range(i + 1, len(FIN)):
        b = FIN[j]
        if a.bounds[0] <= b.bounds[2] and b.bounds[0] <= a.bounds[2] and a.bounds[1] <= b.bounds[3] and b.bounds[1] <= a.bounds[3]:
            if a.intersection(b).length > 0:
                VOISINS[codes[i]].append(codes[j])
                VOISINS[codes[j]].append(codes[i])
VOISINS = {c: sorted(v) for c, v in VOISINS.items()}

# --------------------------------------------------------------------- le paquet de données
tout_y = max(g.bounds[3] for g in SIMPLE)
H = int(tout_y + MARGE_BAS * UNITE)
DATA = dict(
    attrib=ATTRIB,
    unite=UNITE,
    w=LARGEUR_BASE * UNITE, h=H,
    # Projection : x = (lon - lonMin) * k * s ; y = (latMax - lat) * s ; en unités de grille, comme les tracés.
    proj=dict(lonMin=LON_MIN, latMax=LAT_MAX, k=K, s=S),
    regions=[dict(code=rc, nom=REG_SRC[rc][0], d=chemin(REGION_G[rc]), cadre=cadre(REGION_G[rc]), lab=etiquette(REGION_G[rc]))
             for rc in REGIONS_ATTENDUES],
    deps=[dict(code=c, nom=NOMS_DEP[c], region=REGION_DE[c], d=chemin(s), fin=chemin(f), cadre=cadre(f), lab=etiquette(s),
               voisins=VOISINS[c])
          for c, s, f in zip(codes, SIMPLE, FIN)],
)

# contrôles finaux sur ce qui sera écrit
assert len(DATA['regions']) == 13 and len(DATA['deps']) == 96
assert len({r['code'] for r in DATA['regions']}) == 13 and len({d['code'] for d in DATA['deps']}) == 96
assert all(d['region'] in {r['code'] for r in DATA['regions']} for d in DATA['deps'])
assert all(r['d'] and d_ for r in DATA['regions'] for d_ in [r['d']])
assert all(d['d'] and d['fin'] for d in DATA['deps'])

TETE = f"""// GÉNÉRÉ par outils/carte/construire-france.py — ne pas modifier à la main : relancer le script.
//
// Contours de la France MÉTROPOLITAINE : 13 régions, 96 départements (Corse 2A/2B comprise ; outre-mer exclu).
// Source : IGN Admin Express COG (édition 2018 des tracés, millésime 2018 des noms et codes INSEE), repris par
// gregoiredavid/france-geojson (déjà simplifié par ce dépôt, Visvalingam 25 %), Licence Ouverte Etalab.
// Récupéré le 15/10/2026. Empreintes SHA-256 des sources : regions.geojson {sha_reg[:16]}…, departements.geojson {sha_dep[:16]}….
// Mention à afficher sous la carte : « {ATTRIB} » (dans `attrib`).
//
// Forme : `FRANCE = {{ attrib, unite, w, h, proj, regions, deps }}`.
//   - COORDONNÉES : entiers sur une grille de `unite` ({UNITE}) unités par « unité de base » (la France sur 1000
//     unités de base de large, soit w = {LARGEUR_BASE * UNITE} unités de grille ; h = hauteur). Les tracés, les
//     cadres et les points d'étiquette sont dans ces unités : viewBox de la France entière = [0, 0, w, h].
//   - PROJECTION (équirectangulaire à {LAT0}° N) : pour poser un lieu par sa longitude et sa latitude,
//         x = (lon - proj.lonMin) * proj.k * proj.s     y = (proj.latMax - lat) * proj.s      (unités de grille).
//   - `regions[]` : {{ code, nom, d, cadre, lab }}. `d` = tracé SVG (« M x y l dx dy … z », relatif, entier,
//     le format relu par `segments()` de core/types/carte.js) ; c'est l'UNION des départements simplifiés de la
//     région. `cadre` = [xmin, ymin, xmax, ymax] ; `lab` = [x, y], point d'étiquette (centre du plus grand polygone).
//   - `deps[]` : {{ code, nom, region, d, fin, cadre, lab, voisins }}. `d` = tracé SIMPLIFIÉ (tolérance
//     {TOL_SIMPLE} unité de base, îles de moins de {SEUIL_ILE_SIMPLE} unités² retirées), pour la vue France et la vue région.
//     `fin` = tracé DÉTAILLÉ (tolérance {TOL_FIN}, îles de moins de {SEUIL_ILE_FIN} unité² retirées), pour le zoom
//     d'un département. `cadre` est celui du tracé détaillé. `voisins` = codes des départements qui le touchent.
//   - Frontières SANS JOUR : la simplification porte sur la topologie partagée (couverture polygonale) ; deux
//     départements voisins ont la même frontière, au sommet près, à chaque niveau. Ne mélanger `d` et `fin` que
//     pour des départements éloignés l'un de l'autre.
//   - Départements et régions sont triés par code. Ne rien en déduire sur le rang d'affichage.
"""


def ecrire():
    with open(SORTIE, 'w', encoding='utf-8', newline='\n') as f:
        f.write(TETE + 'export const FRANCE = ' + json.dumps(DATA, ensure_ascii=False, separators=(',', ':')) + ';\n')


ecrire()
with open(SORTIE, 'rb') as f:
    octets = f.read()
import gzip
print('régions :', len(DATA['regions']), '— départements :', len(DATA['deps']))
print('sommets : simple', sum(nb_sommets(g) for g in SIMPLE), '| fin', sum(nb_sommets(g) for g in FIN),
      '| régions', sum(nb_sommets(g) for g in REGION_G.values()))
print('petites îles retirées : simple', ILES_S, '| fin', ILES_F, '— petits polygones gardés car au contact d’un voisin : simple', CONTACT_S, '| fin', CONTACT_F)
print('poids :',
      'régions', sum(len(r['d']) for r in DATA['regions']) // 1000, 'ko |',
      'départements simplifiés', sum(len(d['d']) for d in DATA['deps']) // 1000, 'ko |',
      'départements détaillés', sum(len(d['fin']) for d in DATA['deps']) // 1000, 'ko')
print('module :', os.path.relpath(SORTIE, DEPOT), len(octets) // 1000, 'ko (', len(octets), 'octets ), gzip', len(gzip.compress(octets, 9)) // 1000, 'ko')
print('SHA-256 du module :', hashlib.sha256(octets).hexdigest())
