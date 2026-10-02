"""Itinéraires à vélo-cargo par les rues, pour la vue Tournée sur la carte réelle.

Décision de Tristan (02/10/2026) : les kilomètres de la tournée se calculent **par les rues**,
et le tracé **suit les rues**. On calcule donc, une fois pour toutes au build, le plus court
chemin sur le réseau OpenStreetMap entre chaque paire de points de la séance (entrepôt, clients,
gare), dans les deux sens. Le navigateur n'a plus qu'à lire la table : aucune recherche
d'itinéraire à l'écran, et le même chiffre pour tous les élèves.

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
"""
import heapq, math
from shapely.geometry import LineString, Point
from geo import D, xy

PERMIS = {
    'primary': 'maj', 'primary_link': 'maj', 'secondary': 'sec', 'secondary_link': 'sec',
    'tertiary': 'sec', 'tertiary_link': 'sec', 'unclassified': 'min', 'residential': 'min',
    'living_street': 'min', 'pedestrian': 'ped', 'cycleway': 'pie',
}

def reseau():
    """Le graphe orienté : nœud = coordonnée arrondie au mètre près ; arcs avec leur longueur."""
    arcs = {}            # n -> {m: longueur}
    voies = []           # (nom, [n…]) pour l'accrochage des points
    def ajoute(a, b):
        if a == b: return
        L = math.dist(a, b)
        d = arcs.setdefault(a, {})
        if b not in d or d[b] > L: d[b] = L
        arcs.setdefault(b, {})
    for e in D['osm']:
        t = e['tags']
        cl = PERMIS.get(t.get('highway'))
        if not cl or 'g' not in e or t.get('area') == 'yes':
            continue
        ns = [tuple(round(v, 1) for v in xy(*p)) for p in e['g']]
        sens = t.get('oneway') if cl in ('maj', 'sec') else None
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
    bouts du segment selon les sens permis, et rend ce nœud et la longueur de l'accès."""
    P = Point(p)
    best = None
    for nom, ns in voies:
        if rue and nom != rue:
            continue
        for a, b in zip(ns, ns[1:]):
            s = LineString([a, b])
            d = s.distance(P)
            if best is None or d < best[0]:
                best = (d, a, b, s)
    if best is None:
        raise SystemExit(f'aucune voie cyclable pour accrocher {p} ({rue})')
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

def itineraires(points):
    """`points` : [{id, xy, rue?}]. Rend { 'a|b': {'m': mètres, 'g': [(x, y)…]} } pour toute paire
    ordonnée, accès compris (du point à la rue, et de la rue au point d'arrivée)."""
    arcs, voies = reseau()
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
