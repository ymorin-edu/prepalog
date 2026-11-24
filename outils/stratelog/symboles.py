"""Stratelog, Avant l'Hiver : fabrique stratelog/avant-l-hiver/symboles.js (dessins gravure des bâtiments et du décor).

Lancer depuis la racine du dépôt :  python outils/stratelog/symboles.py
Demande la bibliothèque shapely (pip install shapely). Le tirage est réglé (graines fixes) : deux lancers donnent
le même fichier, octet pour octet. Les dessins sont ceux validés par Tristan sur la page d'essai (24/11/2026).
"""
import os, sys
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ICI, 'dessins'))
import stratelog_gravure as G, stratelog_decor as DEC

# Le décor d'abord : il règle lui-même le niveau de détail et la graine du module de gravure (`G.LV`, `G.R`) à son
# import ; les bâtiments, dessinés ensuite, les changent.
dec = DEC.decor().replace('IM Fell English SC, serif', 'Alegreya SC, Georgia, serif').replace('IM Fell English, serif', 'Alegreya SC, Georgia, serif')
sym = ['<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>']
for k in G.KINDS:
    W, H, s = G.render(k, 'light')
    sym.append(f'<symbol id="d-{k}" viewBox="0 0 {W} {H}">{s}</symbol>')
sym.append(f'<symbol id="d-decor" viewBox="0 0 1200 800">{dec}</symbol></defs></svg>')
svg = ''.join(sym)
assert '`' not in svg and '${' not in svg
sortie = os.path.join(ICI, '..', '..', 'stratelog', 'avant-l-hiver', 'symboles.js')
with open(sortie, 'w', encoding='utf-8', newline='\n') as f:
    f.write('// FICHIER GÉNÉRÉ par outils/stratelog/symboles.py : ne pas modifier à la main.\n'
            '// Dessins gravure des bâtiments (<symbol id="d-champ">…) et du décor du plateau, posés une fois dans la page.\n'
            f'export const SYMBOLES = `{svg}`;\n')
print(len(svg), 'caractères ->', os.path.normpath(sortie))
