// Extraction OpenStreetMap de la côte normande (Honfleur → Houlgate) pour ENT-6.9.
//
// Usage : node outils/carte/extraire-cote.mjs
// Écrit `outils/carte/sources/cote/{routes,communes,decor}.json` (ignorés par git : données brutes,
// elles ne servent qu'à reconstruire la carte avec `construire-cote.py`).
//
// Contrairement à l'extraction de Nîmes, on GARDE tous les tags des voies : `hgv`, `maxweight`,
// `access`, `motor_vehicle`, `junction`, `oneway` servent au profil porteur (`itineraires.py`).
// Données : © contributeurs OpenStreetMap (ODbL).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'sources', 'cote');
fs.mkdirSync(SORTIE, { recursive: true });

// Emprise : de Houlgate (ouest) à Honfleur (est), de l'estuaire (nord) à l'arrière-pays (sud).
const BBOX = '49.265,-0.13,49.45,0.30';
const SERVEUR = 'https://overpass-api.de/api/interpreter';

const REQUETES = {
  communes: `[out:json][timeout:180];
    relation["boundary"="administrative"]["admin_level"="8"](${BBOX});
    out geom;`,
  decor: `[out:json][timeout:180];
    ( way["natural"~"^(water|wood|beach|sand)$"](${BBOX});
      relation["natural"~"^(water|wood)$"](${BBOX});
      way["waterway"~"^(river|canal|stream)$"](${BBOX});
      way["landuse"~"^(forest|grass|meadow|cemetery)$"](${BBOX});
      way["leisure"~"^(park|golf_course)$"](${BBOX});
      way["railway"="rail"](${BBOX});
      way["natural"="coastline"](${BBOX}); );
    out geom;`,
};

// Les routes, en six tuiles (une seule requête dépasse ce que le serveur accepte), fusionnées par identifiant.
const [S, W, N, E] = BBOX.split(',').map(Number);
const LONS = [W, (2 * W + E) / 3, (W + 2 * E) / 3, E], LATS = [S, (S + N) / 2, N];
for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
  const b = [LATS[j], LONS[i], LATS[j + 1], LONS[i + 1]].map((v) => v.toFixed(4)).join(',');
  REQUETES[`routes-${i}${j}`] = `[out:json][timeout:180];
    way["highway"](${b});
    out geom tags;`;
}

for (const [nom, q] of Object.entries(REQUETES)) {
  const f = path.join(SORTIE, nom + '.json');
  if (fs.existsSync(f) && !process.argv.includes('--refaire')) { console.log(nom, ': déjà là'); continue; }
  for (let essai = 1; essai <= 4; essai++) {
    const r = await fetch(SERVEUR, {
      method: 'POST',
      headers: { 'User-Agent': 'prepalog-carte/1.0 (pedagogie)', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(q),
    });
    const t = await r.text();
    if (r.ok && t.trim().startsWith('{')) {
      fs.writeFileSync(f, t);
      console.log(nom, ':', JSON.parse(t).elements.length, 'éléments,', Math.round(t.length / 1e6), 'Mo');
      break;
    }
    console.log(nom, ': essai', essai, 'refusé (', r.status, ')');
    await new Promise((ok) => setTimeout(ok, 20000));
  }
}

const vus = new Map();
for (const nom of Object.keys(REQUETES).filter((n) => n.startsWith('routes-'))) {
  const f = path.join(SORTIE, nom + '.json');
  if (!fs.existsSync(f)) { console.log('tuile manquante :', nom, '— relancer'); process.exit(1); }
  for (const e of JSON.parse(fs.readFileSync(f, 'utf8')).elements) vus.set(e.id, e);
}
fs.writeFileSync(path.join(SORTIE, 'routes.json'), JSON.stringify({ elements: [...vus.values()].sort((a, b) => a.id - b.id) }));
console.log('routes :', vus.size, 'voies fusionnées');
