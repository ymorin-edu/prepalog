// Extraction OpenStreetMap d'une RÉGION (Anvers → Valenciennes → Dourges) pour la carte des itinéraires
// (brief MOTEUR-carte-regionale, 13/10/2026 ; Decathlon ENT-7.1 à 7.4).
//
// Usage : node outils/carte/extraire-region.mjs [--refaire]
// Écrit `outils/carte/sources/region/*.json` (ignorés par git : données brutes, elles ne servent qu'à
// reconstruire la carte avec `construire-region.py`).
//
// Même squelette que `extraire-cote.mjs`, mais des requêtes FILTRÉES : à l'échelle d'une région, on ne
// garde que ce qui se dessine ou se parcourt — trait de côte, frontières, voies d'eau nommées, voies ferrées
// principales, grandes routes (avec leurs tags d'accès pour le profil porteur), villes. Les petites routes ne
// sont prises qu'autour des lieux de la séance (le dernier kilomètre du camion), dans les boîtes `LOCAL`.
// Données : © contributeurs OpenStreetMap (ODbL).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const SORTIE = path.join(ICI, 'sources', 'region');
fs.mkdirSync(SORTIE, { recursive: true });

// Emprise (sud, ouest, nord, est) : d'Anvers à Dourges et Rouvignies, avec de la marge pour que les
// réseaux ne soient pas coupés au ras des points.
const BBOX = '50.20,2.70,51.45,4.65';
// Les derniers kilomètres : toutes les routes carrossables autour des terminaux et des entrepôts.
const LOCAL = {
  valenciennes: '50.30,3.40,50.42,3.60',   // Bruay-sur-l'Escaut, Saint-Saulve, Rouvignies
  dourges: '50.40,2.94,50.46,3.03',        // terminal LDCT, Delta 3
  anvers: '51.20,4.15,51.36,4.45',         // les terminaux à conteneurs du port
};
// Serveur saturé (refus 504 en série, 13/10/2026) : `OVERPASS=<adresse d'un autre serveur Overpass>` en choisit un autre.
const SERVEUR = process.env.OVERPASS || 'https://overpass-api.de/api/interpreter';

const REQUETES = {
  cote: `[out:json][timeout:180];
    way["natural"="coastline"](${BBOX});
    out geom;`,
  frontieres: `[out:json][timeout:300];
    relation["boundary"="administrative"]["admin_level"="2"](${BBOX});
    way(r)(${BBOX});
    out geom tags;`,
  eau: `[out:json][timeout:300];
    ( way["waterway"~"^(river|canal)$"]["name"](${BBOX});
      way["natural"="water"]["water"~"^(river|canal|harbour|basin|lake|reservoir|lock)$"](${BBOX});
      relation["natural"="water"]["water"~"^(river|canal|harbour|basin|lake|reservoir)$"](${BBOX}); );
    out geom;`,
  rail: `[out:json][timeout:300];
    way["railway"="rail"][!"service"](${BBOX});
    out geom tags;`,
  villes: `[out:json][timeout:120];
    node["place"~"^(city|town)$"](${BBOX});
    out;`,
  lieux: `[out:json][timeout:180];
    ( nwr["name"~"Decathlon|Contargo|Container|Delta 3|LDCT|terminal|Terminal|Gateway|MPET|Europa",i](${LOCAL.valenciennes});
      nwr["name"~"Decathlon|Contargo|Container|Delta 3|LDCT|terminal|Terminal|Gateway|MPET|Europa",i](${LOCAL.dourges});
      nwr["name"~"Container|Terminal|Gateway|MPET|Europa|PSA|DP World",i](${LOCAL.anvers});
      nwr["operator"~"Decathlon|Contargo",i](${LOCAL.valenciennes});
      nwr["operator"~"Decathlon|Contargo",i](${LOCAL.dourges}); );
    out center tags;`,
};
// Les embranchements ferroviaires (`service=spur`) autour des terminaux : c'est par eux qu'un train y entre.
REQUETES['rail-local'] = `[out:json][timeout:180];
  ( ${Object.values(LOCAL).map((b) => `way["railway"="rail"]["service"="spur"](${b});`).join(' ')} );
  out geom tags;`;
for (const [k, b] of Object.entries(LOCAL)) {
  REQUETES[`local-${k}`] = `[out:json][timeout:180];
    way["highway"~"^(secondary|secondary_link|tertiary|tertiary_link|unclassified|residential|living_street|service)$"](${b});
    out geom tags;`;
}

// Les grandes routes, en tuiles 3 × 3 (une seule requête dépasse ce que le serveur accepte).
const [S, W, N, E] = BBOX.split(',').map(Number);
const n = 3;
const LONS = [...Array(n + 1)].map((_, i) => W + (E - W) * i / n), LATS = [...Array(n + 1)].map((_, j) => S + (N - S) * j / n);
for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
  const b = [LATS[j], LONS[i], LATS[j + 1], LONS[i + 1]].map((v) => v.toFixed(4)).join(',');
  REQUETES[`routes-${i}${j}`] = `[out:json][timeout:240];
    way["highway"~"^(motorway|motorway_link|trunk|trunk_link|primary|primary_link)$"](${b});
    out geom tags;`;
}

for (const [nom, q] of Object.entries(REQUETES)) {
  const f = path.join(SORTIE, nom + '.json');
  if (fs.existsSync(f) && !process.argv.includes('--refaire')) { console.log(nom, ': déjà là'); continue; }
  for (let essai = 1; essai <= 5; essai++) {
    const r = await fetch(SERVEUR, {
      method: 'POST',
      headers: { 'User-Agent': 'prepalog-carte/1.0 (pedagogie)', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'data=' + encodeURIComponent(q),
    });
    const t = await r.text();
    if (r.ok && t.trim().startsWith('{') && !t.includes('"remark": "runtime error')) {
      fs.writeFileSync(f, t);
      console.log(nom, ':', JSON.parse(t).elements.length, 'éléments,', (t.length / 1e6).toFixed(1), 'Mo');
      break;
    }
    console.log(nom, ': essai', essai, 'refusé (', r.status, ')');
    await new Promise((ok) => setTimeout(ok, 30000));
  }
}

// Toutes les routes (grandes + locales) dans un seul fichier, fusionnées par identifiant et triées : le build
// est reproductible quel que soit l'ordre des réponses du serveur.
const vus = new Map();
for (const nom of Object.keys(REQUETES).filter((x) => x.startsWith('routes-') || x.startsWith('local-'))) {
  const f = path.join(SORTIE, nom + '.json');
  if (!fs.existsSync(f)) { console.log('tuile manquante :', nom, '— relancer'); process.exit(1); }
  for (const e of JSON.parse(fs.readFileSync(f, 'utf8')).elements) vus.set(e.id, e);
}
fs.writeFileSync(path.join(SORTIE, 'routes.json'), JSON.stringify({ elements: [...vus.values()].sort((a, b) => a.id - b.id) }));
console.log('routes :', vus.size, 'voies fusionnées');
