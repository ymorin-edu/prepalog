"""Mesure la largeur réelle de chaque nom de rue dans un navigateur (police 100, deux graisses)."""
import json
from playwright.sync_api import sync_playwright
from geo import D, ICI
import os
noms = sorted({e['tags']['name'] for e in D['osm'] if 'highway' in e['tags'] and 'name' in e['tags']})
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.set_content('<svg xmlns="http://www.w3.org/2000/svg"><text id="t" font-family="system-ui,Segoe UI,sans-serif" font-size="100"></text></svg>')
    L = pg.evaluate('''(noms) => { const t = document.getElementById('t'); const o = {};
      for (const n of noms) { t.textContent = n; t.setAttribute('font-weight', 400); const a = t.getComputedTextLength();
        t.setAttribute('font-weight', 650); o[n] = [a, t.getComputedTextLength()]; } return o; }''', noms)
    b.close()
json.dump(L, open(os.path.join(ICI, 'largeurs.json'), 'w'), ensure_ascii=False)
print(len(L), 'noms ; Rue Rousselier =', [round(v) for v in L['Rue Rousselier']], '; estimation ancienne =', round((14*0.56)*100))
