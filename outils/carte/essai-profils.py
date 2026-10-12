"""Essai des profils d'itinéraires (chantier D-9, lot 3, 12/10/2026) — à relancer après tout
changement de `itineraires.py`.

    python outils/carte/essai-profils.py

Hors de la suite Playwright : il lui faut Python, shapely et les données brutes de Nîmes
(`outils/carte/sources/`, ignorées par git, voir `geo.py`). Sort en erreur (code 1) si un cas tombe.

1. Des réseaux FABRIQUÉS, deux chemins de A à B — un raccourci direct et un détour résidentiel :
   le raccourci est une rue piétonne, un sens unique, une autoroute, une voie interdite aux poids
   lourds… On vérifie quel chemin prend chaque profil, dans chaque sens.
2. Le VRAI réseau de Nîmes, points d'ENT-3.2, profil porteur : aucun pas d'itinéraire ne passe par
   une rue piétonne, une piste cyclable, un trottoir, des escaliers ou une voie de service, et aucun
   ne remonte un sens unique.
La règle « le profil vélo ne change pas » se vérifie à part : régénérer les cartes de Boost
(`construire.py` sur essai.json, boost-ent31.json, boost-ent32.json) ne doit rien changer dans `contenus/`.
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from geo import D, xy
from itineraires import itineraires, reseau

pb = []
A, B, C = (4.330, 43.840), (4.340, 43.840), (4.335, 43.846)
def voie(tags, *pts):
    return {'tags': tags, 'g': [list(p) for p in pts]}
DETOUR = voie({'highway': 'residential', 'name': 'Détour'}, A, C, B)

def trajet(osm, profil, de, vers):
    """'direct' ou 'detour' (ou 'aucun') selon le chemin pris de `de` à `vers`."""
    pts = [dict(id='A', xy=xy(*A)), dict(id='B', xy=xy(*B))]
    try:
        r = itineraires(pts, profil, osm)
    except SystemExit:
        return 'aucun'
    g = r[f'{de}|{vers}']['g']
    cy = xy(*C)[1]
    return 'detour' if any(abs(p[1] - cy) < 1 for p in g) else 'direct'

CAS = [
    # (libellé, tags du raccourci, attendu vélo A→B, vélo B→A, porteur A→B, porteur B→A)
    ('rue piétonne', {'highway': 'pedestrian'}, 'direct', 'direct', 'detour', 'detour'),
    ('piste cyclable', {'highway': 'cycleway'}, 'direct', 'direct', 'detour', 'detour'),
    ('voie de service', {'highway': 'service'}, 'detour', 'detour', 'detour', 'detour'),
    ('rue résidentielle à sens unique A→B', {'highway': 'residential', 'oneway': 'yes'}, 'direct', 'direct', 'direct', 'detour'),
    ('grand axe à sens unique A→B', {'highway': 'primary', 'oneway': 'yes'}, 'direct', 'detour', 'direct', 'detour'),
    ('sens unique inversé (-1)', {'highway': 'primary', 'oneway': '-1'}, 'detour', 'direct', 'detour', 'direct'),
    ('autoroute sans tag oneway', {'highway': 'motorway'}, 'detour', 'detour', 'direct', 'detour'),
    ('rond-point sans tag oneway', {'highway': 'primary', 'junction': 'roundabout'}, 'direct', 'direct', 'direct', 'detour'),
    ('interdit aux poids lourds', {'highway': 'primary', 'hgv': 'no'}, 'direct', 'direct', 'detour', 'detour'),
    ('limité à 3,5 t', {'highway': 'primary', 'maxweight': '3.5'}, 'direct', 'direct', 'detour', 'detour'),
    ('limité à 19 t', {'highway': 'primary', 'maxweight': '19'}, 'direct', 'direct', 'direct', 'direct'),
    ('accès privé', {'highway': 'residential', 'access': 'private'}, 'direct', 'direct', 'detour', 'detour'),
]
for lib, tags, *att in CAS:
    osm = [voie(tags, A, B), DETOUR]
    obt = [trajet(osm, 'velo', 'A', 'B'), trajet(osm, 'velo', 'B', 'A'),
           trajet(osm, 'porteur', 'A', 'B'), trajet(osm, 'porteur', 'B', 'A')]
    ok = obt == att
    print(f"{'ok ' if ok else 'FAUX'} {lib:38} vélo {obt[0]}/{obt[1]}, porteur {obt[2]}/{obt[3]}")
    if not ok: pb.append(f'{lib} : attendu {att}, obtenu {obt}')

# Un client dans une rue piétonne : le porteur l'accroche à la voie permise la plus proche.
osm = [voie({'highway': 'pedestrian', 'name': 'Rue des Bains'}, A, B), DETOUR]
try:
    itineraires([dict(id='A', xy=xy(*A), rue='Rue des Bains'), dict(id='B', xy=xy(*B), rue='Rue des Bains')], 'porteur', osm)
    print('ok  client rue piétonne : accroché à la voie permise la plus proche')
except SystemExit as e:
    pb.append(f'client rue piétonne non accroché : {e}')

# ---------------------------------------------------------------- le vrai réseau de Nîmes
INTERDITS = {'pedestrian', 'cycleway', 'footway', 'steps', 'service'}
arcsP, _ = reseau('porteur')
def pas_de(e):
    ns = [tuple(round(v, 1) for v in xy(*p)) for p in e['g']]
    return set(zip(ns, ns[1:])) | set(zip(ns[1:], ns))
interdits = set()
for e in D['osm']:
    if e['tags'].get('highway') in INTERDITS and 'g' in e:
        interdits |= pas_de(e)
SEANCE = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'boost-ent32.json'), encoding='utf-8'))
pts = [dict(id=c['id'], xy=xy(*c['lonlat']), rue=c['rue']) for c in SEANCE['clients']]
R = itineraires(pts, 'porteur')
V = itineraires(pts, 'velo')
mauvais, contresens, differents = [], [], 0
for k, r in R.items():
    g = r['g'][1:-1]                         # sans les deux accès (du point à la voie)
    for a, b in zip(g, g[1:]):
        # Un nœud d'accrochage (pied d'un point sur sa voie) n'est pas dans le réseau : on le saute.
        if a not in arcsP or b not in arcsP or b in arcsP[a]:
            continue
        # Un pas entre deux nœuds du réseau qui n'est pas un arc permis : voie interdite, ou contresens.
        (mauvais if (a, b) in interdits else contresens).append(k)
    if round(r['m']) != round(V[k]['m']):
        differents += 1
print(f"Nîmes, porteur : {len(R)} trajets, {differents} diffèrent du vélo ; "
      f"{len(set(mauvais))} par une voie interdite, {len(set(contresens))} à contresens")
if mauvais: pb.append(f'porteur par une voie interdite : {sorted(set(mauvais))[:5]}')
if contresens: pb.append(f'porteur à contresens : {sorted(set(contresens))[:5]}')
if not differents: pb.append('le porteur fait exactement les mêmes trajets que le vélo : le profil ne change rien')

if pb:
    print('\nESSAI FAUX :\n  - ' + '\n  - '.join(pb)); sys.exit(1)
print('\nprofils justes.')
