"""Itinéraires par les rues, pour la vue Tournée sur la carte réelle — à vélo-cargo ou en porteur.

Décision de Tristan (02/10/2026) : les kilomètres de la tournée se calculent **par les rues**,
et le tracé **suit les rues**. On calcule donc, une fois pour toutes au build, le plus court
chemin sur le réseau OpenStreetMap entre chaque paire de points de la séance (entrepôt, clients,
gare), dans les deux sens. Le navigateur n'a plus qu'à lire la table : aucune recherche
d'itinéraire à l'écran, et le même chiffre pour tous les élèves.

Le PROFIL du véhicule se déclare dans le JSON de la séance (`"profil": "porteur"`) ; par défaut
`"velo"`, et le profil vélo calcule exactement ce qu'il calculait avant (Boost octet pour octet).

Le réseau d'un vélo-cargo, et pourquoi :
  - routes principales à résidentielles, rues piétonnes, pistes cyclables : oui ;
  - autoroutes et voies express (`motorway`, `trunk`) : non, interdites aux vélos ;
  - escaliers et trottoirs (`steps`, `footway`) : non, un vélo-cargo n'y passe pas ;
  - voies de service (`service`) : non. L'extraction n'a pas gardé les tags d'accès, et ce sont
    surtout des parkings et des allées privées : ils fabriqueraient des raccourcis qui n'existent
    pas pour un livreur.
Les sens uniques : l'extraction n'a pas gardé `oneway:bicycle`. On applique donc la règle du
Code de la route (art. R. 110-2) : dans les zones 30 et les zones de rencontre, les rues sont à
double sens pour les cyclistes. Le sens unique est respecté sur les grands axes (`maj`, `sec`),
où il n'y a pas de double sens cyclable par défaut, et ignoré dans les petites rues.

Le réseau d'un porteur (camion de livraison, 16 t ; chantier D-9, lot 3, 12/10/2026) :
  - autoroutes, voies express, routes principales à résidentielles, zones de rencontre : oui ;
  - rues piétonnes, pistes cyclables, trottoirs, escaliers, voies de service : non ;
  - **sens uniques respectés partout** ; une autoroute (et sa bretelle) et un rond-point sont à sens
    unique même sans le tag `oneway`, comme le veut la convention OpenStreetMap ;
  - une voie interdite aux poids lourds (`hgv=no`), aux véhicules à moteur (`motor_vehicle=no`,
    `access=no|private`) ou limitée en poids sous celui du porteur (`maxweight`) est exclue.
    LIMITE CONNUE : l'extraction de Nîmes n'a gardé ni ces tags ni `junction` ; ces règles ne jouent
    qu'avec une extraction qui les garde (à prévoir pour la carte de la côte, ENT-6.9).
Un client dans une rue que le profil n'emprunte pas (une rue piétonne) est accroché à la voie
permise la plus proche : le camion s'arrête au bout de la rue, la livraison finit à pied.
"""
import heapq, math, re
from shapely.geometry import LineString, Point
from geo import D, xy

# Profil vélo : la classe de chaque voie permise. Seules `maj` et `sec` respectent le sens unique.
PERMIS = {
    'primary': 'maj', 'primary_link': 'maj', 'secondary': 'sec', 'secondary_link': 'sec',
    'tertiary': 'sec', 'tertiary_link': 'sec', 'unclassified': 'min', 'residential': 'min',
    'living_street': 'min', 'pedestrian': 'ped', 'cycleway': 'pie',
}

# Profil porteur : les voies permises. Le sens unique est respecté sur toutes.
PORTEUR = {
    'motorway', 'motorway_link', 'trunk', 'trunk_link', 'primary', 'primary_link',
    'secondary', 'secondary_link', 'tertiary', 'tertiary_link', 'unclassified', 'residential',
    'living_street',
}
POIDS_PORTEUR = 16      # t : une voie limitée en dessous (`maxweight`) est exclue
PROFILS = ('velo', 'porteur')

def _tonnes(v):
    """`maxweight` en tonnes (« 3.5 », « 7 t », « 12000 kg »), ou None si illisible."""
    m = re.match(r'\s*([\d.,]+)\s*(t|kg)?\s*$', str(v or ''))
    if not m: return None
    n = float(m.group(1).replace(',', '.'))
    return n / 1000 if m.group(2) == 'kg' else n

def _sens_porteur(t):
    """'yes', '-1' ou None (double sens) pour un porteur : le tag d'abord, puis la convention."""
    o = t.get('oneway')
    if o in ('yes', '1', 'true'): return 'yes'
    if o == '-1': return '-1'
    if o == 'no': return None
    if t.get('highway') in ('motorway', 'motorway_link') or t.get('junction') in ('roundabout', 'circular'):
        return 'yes'
    return None

def _interdit_porteur(t):
    if t.get('hgv') == 'no' or t.get('motor_vehicle') == 'no' or t.get('access') in ('no', 'private'):
        return True
    w = _tonnes(t.get('maxweight'))
    return w is not None and w < POIDS_PORTEUR

def reseau(profil='velo', osm=None):
    """Le graphe orienté : nœud = coordonnée arrondie au mètre près ; arcs avec leur longueur.
    `osm` : les éléments à lire (par défaut ceux de la séance) — l'essai des profils en passe d'autres."""
    if profil not in PROFILS:
        raise SystemExit(f'profil inconnu : {profil} (attendu : {", ".join(PROFILS)})')
    arcs = {}            # n -> {m: longueur}
    voies = []           # (nom, [n…]) pour l'accrochage des points
    def ajoute(a, b):
        if a == b: return
        L = math.dist(a, b)
        d = arcs.setdefault(a, {})
        if b not in d or d[b] > L: d[b] = L
        arcs.setdefault(b, {})
    for e in (D['osm'] if osm is None else osm):
        t = e['tags']
        if 'g' not in e or t.get('area') == 'yes':
            continue
        if profil == 'velo':
            cl = PERMIS.get(t.get('highway'))
            if not cl:
                continue
            sens = t.get('oneway') if cl in ('maj', 'sec') else None
        else:
            if t.get('highway') not in PORTEUR or _interdit_porteur(t):
                continue
            sens = _sens_porteur(t)
        ns = [tuple(round(v, 1) for v in xy(*p)) for p in e['g']]
        if sens == '-1':
            ns = ns[::-1]
        for a, b in zip(ns, ns[1:]):
            ajoute(a, b)
            if sens not in ('yes', '-1'):
                ajoute(b, a)
        voies.append((t.get('name'), ns))
    return arcs, voies

def accrocher(arcs, voies, p, rue=None):
    """Pose le point sur le réseau : projection sur la voie la plus proche (de SA rue si on la
    connaît — un client du 8 rue de la Madeleine part de la rue de la Madeleine, pas de la rue
    voisine qui passe derrière sa façade). Ajoute un nœud au pied de la projection, relié aux deux
    bouts du segment selon les sens permis, et rend ce nœud et la longueur de l'accès.
    Si SA rue n'est pas dans le réseau du profil (une rue piétonne pour un porteur), le point
    s'accroche à la voie permise la plus proche."""
    P = Point(p)
    def chercher(rue):
        best = None
        for nom, ns in voies:
            if rue and nom != rue:
                continue
            for a, b in zip(ns, ns[1:]):
                s = LineString([a, b])
                d = s.distance(P)
                if best is None or d < best[0]:
                    best = (d, a, b, s)
        return best
    best = chercher(rue)
    if best is None and rue:
        best = chercher(None)
        if best is not None:
            print(f'  {rue} : hors du réseau du profil, accroché à la voie permise la plus proche ({best[0]:.0f} m)')
    if best is None:
        raise SystemExit(f'aucune voie permise pour accrocher {p} ({rue})')
    d, a, b, s = best
    q = s.interpolate(s.project(P))
    n = (round(q.x, 1), round(q.y, 1))
    arcs.setdefault(n, {})
    if b in arcs.get(a, {}):
        arcs[a][n] = math.dist(a, n); arcs[n][b] = math.dist(n, b)
    if a in arcs.get(b, {}):
        arcs[b][n] = math.dist(b, n); arcs[n][a] = math.dist(n, a)
    return n, d

def dijkstra(arcs, src):
    dist, prec, tas = {src: 0.0}, {}, [(0.0, src)]
    while tas:
        d, u = heapq.heappop(tas)
        if d > dist[u]: continue
        for v, L in arcs[u].items():
            nd = d + L
            if nd < dist.get(v, 1e18):
                dist[v] = nd; prec[v] = u; heapq.heappush(tas, (nd, v))
    return dist, prec

def coeur(arcs):
    """Les nœuds du plus grand ensemble où l'on peut aller de partout à partout (composante
    fortement connexe, algorithme de Kosaraju sans récursion)."""
    ordre, vu = [], set()
    for s in arcs:
        if s in vu: continue
        vu.add(s); pile = [(s, iter(arcs[s]))]
        while pile:
            u, it = pile[-1]
            v = next(it, None)
            if v is None:
                ordre.append(u); pile.pop()
            elif v not in vu:
                vu.add(v); pile.append((v, iter(arcs[v])))
    inv = {u: [] for u in arcs}
    for u, d in arcs.items():
        for v in d: inv[v].append(u)
    meilleur, vu = set(), set()
    for s in reversed(ordre):
        if s in vu: continue
        comp, pile = {s}, [s]; vu.add(s)
        while pile:
            for v in inv[pile.pop()]:
                if v not in vu:
                    vu.add(v); comp.add(v); pile.append(v)
        if len(comp) > len(meilleur): meilleur = comp
    return meilleur

def itineraires(points, profil='velo', osm=None):
    """`points` : [{id, xy, rue?}]. Rend { 'a|b': {'m': mètres, 'g': [(x, y)…]} } pour toute paire
    ordonnée, accès compris (du point à la rue, et de la rue au point d'arrivée)."""
    arcs, voies = reseau(profil, osm)
    if profil == 'porteur':
        # Sens uniques partout : une impasse à sens unique (ou une voie coupée au bord de l'extraction)
        # piégerait le camion. On n'accroche les points qu'aux voies d'où l'on va partout et d'où l'on
        # revient. Le vélo garde l'accrochage d'avant (Boost octet pour octet).
        C = coeur(arcs)
        voies = [(nom, ns) for nom, ns in voies if all(n in C for n in ns)]
    noeuds = {}
    for p in points:
        noeuds[p['id']] = accrocher(arcs, voies, p['xy'], p.get('rue'))
    out = {}
    for p in points:
        n0, acc0 = noeuds[p['id']]
        dist, prec = dijkstra(arcs, n0)
        for q in points:
            if q['id'] == p['id']: continue
            n1, acc1 = noeuds[q['id']]
            if n1 not in dist:
                raise SystemExit(f"pas d'itinéraire de {p['id']} à {q['id']}")
            chemin = [n1]
            while chemin[-1] != n0:
                chemin.append(prec[chemin[-1]])
            chemin = [tuple(p['xy'])] + chemin[::-1] + [tuple(q['xy'])]
            out[f"{p['id']}|{q['id']}"] = {'m': dist[n1] + acc0 + acc1, 'g': chemin}
    return out
