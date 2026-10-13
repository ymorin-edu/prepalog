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
from geo import D, xy, lonlat

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


# ───────────────────────────────────────────────────── carte régionale : un graphe par mode, des passages
# Brief MOTEUR-carte-regionale (13/10/2026). Ce qui précède n'a pas bougé (Boost et la côte octet pour
# octet) ; ce qui suit sert la carte des itinéraires d'une région (Decathlon ENT-7.x) : la route et le camion
# final prennent le profil `porteur` ci-dessus, la barge et le rail ont leur propre réseau, et un itinéraire
# passe par des POINTS DE PASSAGE imposés par le contenu, pour coller au trajet voulu (Anvers → Malines →
# Bruxelles…) plutôt qu'au plus court chemin brut.

def reseau_lignes(garde, souder=0, osm=None):
    """Le graphe NON orienté des voies que `garde(tags)` accepte (rail, voies d'eau). `souder` (mètres) : relie
    les bouts de voie distants de moins de `souder` (une rivière OSM coupée à une écluse, deux tronçons qui se
    touchent sans partager de nœud)."""
    arcs, voies = {}, []
    def ajoute(a, b):
        if a == b: return
        L = math.dist(a, b)
        for u, v in ((a, b), (b, a)):
            d = arcs.setdefault(u, {})
            if v not in d or d[v] > L: d[v] = L
    for e in (D['osm'] if osm is None else osm):
        if 'g' not in e or not garde(e['tags']):
            continue
        ns = [tuple(round(v, 1) for v in xy(*p)) for p in e['g']]
        for a, b in zip(ns, ns[1:]):
            ajoute(a, b)
        voies.append((e['tags'].get('name'), ns))
    if souder:
        bouts = sorted({n for _, ns in voies for n in (ns[0], ns[-1])})
        for i, a in enumerate(bouts):
            for b in bouts[i + 1:]:
                if b[0] - a[0] > souder: break
                if a != b and math.dist(a, b) < souder:
                    ajoute(a, b)
    return arcs, voies

def candidats(arcs, voies, p, rayon):
    """Les accroches possibles d'un point de PASSAGE : une par voie à moins de `rayon` mètres (les 6 plus
    proches), ou la voie la plus proche s'il n'y en a aucune. Une autoroute a deux chaussées à sens unique :
    accrocher un passage à la plus proche seulement ferait parfois faire demi-tour au camion ; on laisse le
    calcul choisir la bonne."""
    P = Point(p['xy'])
    proches = []
    for i, (nom, ns) in enumerate(voies):
        d = min(LineString([a, b]).distance(P) for a, b in zip(ns, ns[1:]))
        if d <= rayon: proches.append((d, i))
    choisies = [voies[i] for _, i in sorted(proches)[:6]]
    out = []
    for v in (choisies or [None]):
        n, acc = accrocher(arcs, [v] if v else voies, p['xy'])
        if all(n != c[0] for c in out): out.append((n, acc))
    return out

def par_passages(arcs, voies, points, rayon=400):
    """Le plus court chemin qui passe, dans l'ordre, par chacun des `points` ([{xy, rue?}]). Rend
    { 'g': [(x, y)…], 'm': mètres sur le plan } ; le premier et le dernier point sont les extrémités (accrochés
    à leur voie la plus proche, ou à leur `rue`), les autres des passages (voir `candidats`)."""
    etapes = [[accrocher(arcs, voies, points[0]['xy'], points[0].get('rue'))]]
    etapes += [candidats(arcs, voies, p, rayon) for p in points[1:-1]]
    etapes += [[accrocher(arcs, voies, points[-1]['xy'], points[-1].get('rue'))]]
    # Programmation dynamique : pour chaque accroche d'une étape, le meilleur chemin depuis le départ.
    best = {etapes[0][0][0]: (etapes[0][0][1], [etapes[0][0][0]])}
    for i, suivantes in enumerate(etapes[1:], 1):
        nouv = {}
        for n0, (m0, ch0) in best.items():
            dist, prec = dijkstra(arcs, n0)
            for n1, acc1 in suivantes:
                if n1 not in dist: continue
                m = m0 + dist[n1]
                if n1 not in nouv or m < nouv[n1][0]:
                    bout = [n1]
                    while bout[-1] != n0:
                        bout.append(prec[bout[-1]])
                    nouv[n1] = (m, ch0 + bout[::-1][1:])
        if not nouv:
            raise SystemExit(f'pas de chemin jusqu’au point n° {i} ({lonlat(*points[i]["xy"])})')
        best = nouv
    (n, (m, ch)), = best.items()
    return {'g': [tuple(points[0]['xy'])] + ch + [tuple(points[-1]['xy'])], 'm': m + etapes[-1][0][1]}

def reseau_porteur_coeur(osm=None):
    """Le réseau du porteur, réduit aux voies d'où l'on va partout et d'où l'on revient (comme `itineraires`)."""
    arcs, voies = reseau('porteur', osm)
    C = coeur(arcs)
    return arcs, [(nom, ns) for nom, ns in voies if all(n in C for n in ns)]
