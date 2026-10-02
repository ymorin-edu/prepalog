"""Les quartiers de la carte, calculés depuis les IRIS de l'INSEE.

OpenStreetMap n'a AUCUN contour de quartier pour Nîmes (seulement des points nommés) : on regroupe
des IRIS (IGN, Licence Ouverte). Un quartier = une liste d'IRIS, éventuellement coupée par une rue.
"""
from geo import *
from shapely.ops import linemerge, split

def quartiers():
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
    return {
      'ecusson':  {'nom': 'Écusson', 'iris': ['Arènes', 'Général Perrier', "Carré d'Art (à l'est du bd Victor-Hugo)"], 'g': ecusson},
      'fontaine': {'nom': 'Jardins de la Fontaine', 'iris': ['Jardins de la Fontaine'], 'g': fontaine},
    }
