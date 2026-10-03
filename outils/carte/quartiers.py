"""Les quartiers de la carte, calculés depuis les IRIS de l'INSEE.

OpenStreetMap n'a AUCUN contour de quartier pour Nîmes (seulement des points nommés) : on regroupe
des IRIS (IGN, Licence Ouverte). Un quartier = une liste d'IRIS, éventuellement coupée par une rue.
"""
from geo import *
from shapely.ops import linemerge, split

def union_iris(noms):
    return unary_union([IRIS[n] for n in noms]).buffer(1).buffer(-1)

def quartiers(jeu='ent32'):
    # Écusson : Arènes + Général Perrier + Carré d'Art, coupés au boulevard Victor-Hugo.
    # L'IRIS « Carré d'Art » déborde à l'ouest du boulevard jusqu'au quai de la Fontaine,
    # alors que l'Écusson, pour un Nîmois, s'arrête aux boulevards (Victor-Hugo puis Alphonse-Daudet).
    union = unary_union([IRIS[n] for n in ('Arènes', 'Général Perrier', "Carré d'Art")]).buffer(1).buffer(-1)
    vh = linemerge([LineString([xy(*p) for p in e['g']]) for e in D['osm']
                    if e['tags'].get('name') in ('Boulevard Victor Hugo', 'Boulevard Alphonse Daudet') and 'highway' in e['tags']])
    if vh.geom_type == 'MultiLineString':
        vh = max(vh.geoms, key=lambda g: g.length)
    morceaux = split(union, prolonger(vh))
    ref = Point(xy(4.35812, 43.83877))      # rue du Général Perrier
    ecusson = [g for g in morceaux.geoms if g.contains(ref)][0]
    fontaine = IRIS['Jardins de la Fontaine'].buffer(1).buffer(-1)
    Q = {
      'ecusson':  {'nom': 'Écusson', 'iris': ['Arènes', 'Général Perrier', "Carré d'Art (à l'est du bd Victor-Hugo)"], 'g': ecusson},
      'fontaine': {'nom': 'Jardins de la Fontaine', 'iris': ['Jardins de la Fontaine'], 'g': fontaine},
    }
    if jeu == 'ent32':
        return Q
    # ENT-3.1 (décisions de Tristan du 03/10/2026) : sept quartiers, tous des IRIS ou des
    # regroupements d'IRIS qui tiennent dans la carte de 5 × 5 km.
    #   - Courbessac (6 à 8 km au nord-est) sortait de la carte : remplacé par Croix de Fer ;
    #   - Grézan n'a pas d'IRIS à son nom : remplacé par Gambetta ;
    #   - Costières = Marronniers + Capouchiné + Maréchal Juin, d'après la liste du conseil de
    #     quartier (nimes.fr : « Les Marronniers, Juin-Capouchiné ») ; Haute Magaille, qui en est
    #     aussi, sort de la carte à l'est. La Ville Active reste son propre contour, au sud.
    assert jeu == 'ent31', jeu
    for k, nom, iris in (
        ('stcesaire', 'Saint-Césaire', ['Saint-Césaire']),
        ('villeactive', 'Ville Active', ['Ville Active']),
        ('costieres', 'Costières', ['Marronniers', 'Capouchiné', 'Maréchal Juin']),
        ('croixdefer', 'Croix de Fer', ['Croix de Fer']),
        ('gambetta', 'Gambetta', ['Gambetta']),
    ):
        Q[k] = {'nom': nom, 'iris': iris, 'g': union_iris(iris)}
    return Q
