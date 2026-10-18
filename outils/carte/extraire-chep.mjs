// Extraction OpenStreetMap complémentaire pour la carte de la RAMASSE (CHEP, ENT-9.2 et 9.4 ; 18/10/2026).
//
// Usage : node outils/carte/extraire-chep.mjs [--refaire]
// Écrit `outils/carte/sources/chep/*.json` (ignorés par git : données brutes, elles ne servent qu'à reconstruire
// la carte avec `construire-ramasse.py`).
//
// POURQUOI UN FICHIER À PART : `extraire-region.mjs` ne garde que les grandes routes (motorway → primary) sur toute
// la région et les petites routes seulement autour de Valenciennes et de Dourges. La carte de la ramasse a besoin
// des routes secondaires et tertiaires de la métropole lilloise et du bassin minier, et des petites rues autour des
// six points de la tournée (le dépôt et les cinq plates-formes) pour que le camion aille jusqu'à leur porte.
// Ce fichier-ci ne touche donc ni `sources/region/` ni `extraire-region.mjs` : la carte de Decathlon reste
// octet pour octet.
// Données : © contributeurs OpenStreetMap (ODbL).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'sources', 'chep');
fs.mkdirSync(SORTIE, { recursive: true });

// L'emprise de la tournée (sud, ouest, nord, est), avec de la marge sur la carte (≈ 50,30–50,75 N ; 2,85–3,60 E).
const [S, W, N, E] = [50.26, 2.80, 50.80, 3.66];
// Les six points (lon, lat) : les petites rues ne sont prises qu'autour d'eux (rayon en mètres).
const POINTS = JSON.parse(fs.readFileSync(path.join(ICI, 'chep.json'), 'utf8'));
const LIEUX = [POINTS.depot, ...POINTS.clients].map((p) => p.lonlat);
const RAYON = 3500;

const SERVEURS = [process.env.OVERPASS, 'https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter'].filter(Boolean);

const REQUETES = {};
// Routes secondaires et tertiaires de toute l'emprise, en tuiles 3 × 2 (une seule requête serait trop lourde).
const nx = 3, ny = 2;
for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
  const b = [S + (N - S) * j / ny, W + (E - W) * i / nx, S + (N - S) * (j + 1) / ny, W + (E - W) * (i + 1) / nx]
    .map((v) => v.toFixed(4)).join(',');
  REQUETES[`secondaires-${i}${j}`] = `[out:json][timeout:240];
    way["highway"~"^(secondary|secondary_link|tertiary|tertiary_link)$"](${b});
    out geom tags;`;
}
// Les petites rues autour de chaque point.
LIEUX.forEach(([lon, lat], k) => {
  REQUETES[`local-${k}`] = `[out:json][timeout:180];
    way["highway"~"^(unclassified|residential|living_street)$"](around:${RAYON},${lat},${lon});
    out geom tags;`;
});

async function demander(q) {
  for (let essai = 1; essai <= 8; essai++) {
    const serveur = SERVEURS[(essai - 1) % SERVEURS.length];
    try {
      const r = await fetch(serveur, {
        method: 'POST',
        headers: { 'User-Agent': 'prepalog-carte/1.0 (pedagogie)', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(q),
      });
      const t = await r.text();
      if (r.ok && t.trim().startsWith('{') && !t.includes('"remark": "runtime error')) return t;
      console.log('  essai', essai, 'refusé (', r.status, ')', serveur);
    } catch (e) {
      console.log('  essai', essai, 'erreur', e.message, serveur);
    }
    await new Promise((ok) => setTimeout(ok, 15000));
  }
  return null;
}

for (const [nom, q] of Object.entries(REQUETES)) {
  const f = path.join(SORTIE, nom + '.json');
  if (fs.existsSync(f) && !process.argv.includes('--refaire')) { console.log(nom, ': déjà là'); continue; }
  const t = await demander(q);
  if (!t) { console.log(nom, ': abandonné — relancer'); process.exit(1); }
  fs.writeFileSync(f, t);
  console.log(nom, ':', JSON.parse(t).elements.length, 'éléments,', (t.length / 1e6).toFixed(1), 'Mo');
}

// Tout dans un seul fichier, fusionné par identifiant et trié : le build est reproductible quel que soit l'ordre des réponses.
const vus = new Map();
for (const nom of Object.keys(REQUETES)) {
  for (const e of JSON.parse(fs.readFileSync(path.join(SORTIE, nom + '.json'), 'utf8')).elements) vus.set(e.id, e);
}
fs.writeFileSync(path.join(SORTIE, 'routes.json'), JSON.stringify({ elements: [...vus.values()].sort((a, b) => a.id - b.id) }));
console.log('routes :', vus.size, 'voies fusionnées');
