// Fabrique `activites/catalogue.js` : le CATALOGUE des séances (chantier 23, « accueil léger »).
//
//   node outils/catalogue.mjs              recalcule le catalogue et réécrit activites/catalogue.js
//   node outils/catalogue.mjs --verifier   ne réécrit rien : compare, et sort en erreur si le fichier est périmé
//
// Pourquoi un script : l'accueil ne doit plus charger le code de chacune des séances (contenus, vues) pour lire leur
// `meta`. Il lit ce catalogue. Mais une `meta` n'est pas un littéral : 68 séances la fabriquent (`seanceEntreprise`),
// plusieurs en déduisent le `bareme` du contenu. Le seul moyen de la calculer comme le site est donc de faire
// tourner le site : le script démarre un petit serveur local en mode démonstration, ouvre Chromium (Playwright),
// appelle le VRAI `chargerActivites()` et écrit ce que les modules ont répondu.
//
// À relancer après toute séance ajoutée, retirée, ou dont la `meta` (ou un contenu dont dépend un `bareme` déduit)
// change. La suite de tests (bloc « dependances ») recalcule le texte attendu et le compare au fichier, à l'octet.
//
// Ce fichier est aussi un module : `formaterCatalogue`, `diagnostiquer` et `RELEVE_PAGE` sont exportés pour la
// suite de tests, et rien ne s'exécute quand on l'importe.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const FICHIER_CATALOGUE = path.join(ROOT, 'activites', 'catalogue.js');
const COMMANDE = '`node outils/catalogue.mjs`';

const ENTETE = '// Généré par `node outils/catalogue.mjs`. Ne pas modifier à la main : relancer le script après toute séance ajoutée, retirée ou dont la `meta` change.\n'
  + '// Lu par `catalogue()` (activites/index.js) : une entrée par séance, dans l\'ordre de `chargerActivites()`.\n';

// ----------------------------------------------------------------------------- mise en forme

// Copie dont les clés d'objet sont rangées (récursivement) : la sortie ne dépend pas de l'ordre où une `meta` écrit
// ses clés. L'ordre des tableaux, lui, est celui de la séance.
const trier = (x) => {
  if (Array.isArray(x)) return x.map(trier);
  if (x && typeof x === 'object') return Object.fromEntries(Object.keys(x).sort().map((k) => [k, trier(x[k])]));
  return x;
};

// entrées → texte de `activites/catalogue.js`. Une ligne par séance, LF, saut de ligne final.
export function formaterCatalogue(entrees) {
  const lignes = entrees.map((e) => '  ' + JSON.stringify({ fichier: e.fichier, exports: [...e.exports].sort(), meta: trier(e.meta) }) + ',');
  return ENTETE + 'export const CATALOGUE = [\n' + lignes.map((l) => l + '\n').join('') + '];\n';
}

// Les entrées lues dans un texte de catalogue (une par ligne `  {…},`). Une ligne qui n'est ni une entrée ni
// l'en-tête ni la structure du tableau rend `illisible` (numéro de ligne).
function lireEntrees(texte) {
  const entrees = [];
  let illisible = null;
  texte.split('\n').forEach((l, i) => {
    if (!l.startsWith('  {')) return;
    try { entrees.push(JSON.parse(l.replace(/^\s+/, '').replace(/,$/, ''))); }
    catch (e) { illisible = illisible || i + 1; }
  });
  return { entrees, illisible };
}

const court = (x) => { const s = JSON.stringify(x); return s === undefined ? 'absent' : s.length > 90 ? s.slice(0, 87) + '…' : s; };

// Texte attendu (calculé) et texte réel (sur le disque) → null s'ils sont identiques, sinon une phrase qui nomme la
// PREMIÈRE différence : la séance, et la clé de sa `meta` si c'est une `meta`.
export function diagnostiquer(attendu, reel) {
  if (attendu === reel) return null;
  const suite = ` — lancer ${COMMANDE}.`;
  if (reel.includes('\r')) return 'activites/catalogue.js contient des fins de ligne CRLF (LF attendu)' + suite;
  const A = lireEntrees(attendu).entrees;
  const R = lireEntrees(reel);
  if (R.illisible) return `activites/catalogue.js : la ligne ${R.illisible} n'est pas une entrée lisible` + suite;
  const idDe = (e) => e.meta && e.meta.id ? e.meta.id : e.fichier;
  const fichiersA = A.map((e) => e.fichier);
  const fichiersR = R.entrees.map((e) => e.fichier);
  const absente = A.find((e) => !fichiersR.includes(e.fichier));
  if (absente) return `séance ${idDe(absente)} (${absente.fichier}) : dans les séances mais absente du catalogue` + suite;
  const enTrop = R.entrees.find((e) => !fichiersA.includes(e.fichier));
  if (enTrop) return `séance ${idDe(enTrop)} (${enTrop.fichier}) : au catalogue mais plus dans les séances` + suite;
  for (let i = 0; i < A.length; i++) {
    const a = A[i];
    const r = R.entrees[i];
    if (!r) break;
    if (a.fichier !== r.fichier) return `ordre différent à la position ${i + 1} : le catalogue a ${r.fichier}, les séances ont ${a.fichier}` + suite;
    if (JSON.stringify(a) === JSON.stringify(r)) continue;
    if (JSON.stringify(a.exports) !== JSON.stringify(r.exports)) {
      return `séance ${idDe(a)} (${a.fichier}) : exports différents (catalogue ${court(r.exports)}, séance ${court(a.exports)})` + suite;
    }
    const cles = [...new Set([...Object.keys(a.meta), ...Object.keys(r.meta)])].sort();
    const cle = cles.find((k) => JSON.stringify(a.meta[k]) !== JSON.stringify(r.meta[k]));
    if (cle) return `séance ${idDe(a)} (${a.fichier}) : la clé « ${cle} » de sa meta a changé (catalogue ${court(r.meta[cle])}, séance ${court(a.meta[cle])})` + suite;
    return `séance ${idDe(a)} (${a.fichier}) : entrée différente` + suite;
  }
  if (R.entrees.length > A.length) return `le catalogue a ${R.entrees.length - A.length} entrée(s) en trop` + suite;
  return 'activites/catalogue.js : l\'en-tête ou la structure du fichier diffère du texte attendu' + suite;
}

// ----------------------------------------------------------------------------- le relevé, dans la page

// Fonction passée telle quelle à `page.evaluate` (elle doit rester autonome) : charge le registre, relève les entrées
// (`releverCatalogue`, activites/index.js), les rend en JSON, et signale ce qui ne se sérialiserait pas fidèlement.
export const RELEVE_PAGE = async () => {
  const I = await import('/activites/index.js');
  const entrees = await I.releverCatalogue();
  const echecs = I.activitesEnEchec();
  const problemes = [];
  const verifier = (x, chemin, id) => {
    const t = typeof x;
    if (x === undefined || t === 'function' || t === 'symbol' || t === 'bigint' || (t === 'number' && !Number.isFinite(x))) {
      problemes.push(`${id} : ${chemin} (${x === undefined ? 'undefined' : t})`);
    } else if (Array.isArray(x)) {
      x.forEach((y, i) => verifier(y, `${chemin}[${i}]`, id));
    } else if (x && t === 'object') {
      const proto = Object.getPrototypeOf(x);
      if (proto !== Object.prototype && proto !== null) problemes.push(`${id} : ${chemin} (${(x.constructor && x.constructor.name) || 'objet particulier'})`);
      else for (const k of Object.keys(x)) verifier(x[k], `${chemin}.${k}`, id);
    }
  };
  entrees.forEach((e) => verifier(e.meta, 'meta', e.meta.id));
  return { entrees: JSON.parse(JSON.stringify(entrees)), echecs, problemes };
};

// ----------------------------------------------------------------------------- le script

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };

// Même principe que le serveur de `outils/test/commun.mjs` (qui démarre dès qu'on l'importe, donc inutilisable ici) :
// le dépôt est servi tel quel, SAUF prepalog-config.json (404 exprès) pour que le site reste en mode démonstration.
function servir() {
  const srv = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/') p = '/index.html';
    if (p === '/prepalog-config.json') { res.writeHead(404); return res.end('404'); }
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(fs.readFileSync(f));
  });
  return new Promise((resolve, reject) => {
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

async function relever() {
  const { chromium } = await import('playwright');
  const { srv, port } = await servir();
  let nav = null;
  try {
    nav = await chromium.launch();
    const page = await nav.newPage();
    page.setDefaultTimeout(60000);
    await page.goto(`http://127.0.0.1:${port}/`);
    await page.waitForSelector('#btnProf');
    return await page.evaluate(RELEVE_PAGE);
  } finally {
    if (nav) await nav.close();
    await new Promise((r) => srv.close(r));
  }
}

async function principal() {
  const args = process.argv.slice(2);
  const verifier = args.includes('--verifier');
  const inconnus = args.filter((a) => a !== '--verifier');
  if (inconnus.length) { console.error(`Option inconnue : ${inconnus.join(' ')}. Usage : node outils/catalogue.mjs [--verifier]`); process.exit(2); }
  const t0 = Date.now();
  const { entrees, echecs, problemes } = await relever();
  if (echecs.length) {
    console.error('Le catalogue n\'est pas écrit : des séances refusent de se charger.');
    echecs.forEach((e) => console.error(`  ${e.fichier} : ${e.erreur}`));
    process.exit(1);
  }
  if (problemes.length) {
    console.error('Le catalogue n\'est pas écrit : des meta ne se sérialisent pas en JSON (fonction, undefined, nombre non fini, objet particulier).');
    problemes.forEach((p) => console.error('  ' + p));
    process.exit(1);
  }
  const texte = formaterCatalogue(entrees);
  const duree = ((Date.now() - t0) / 1000).toFixed(1);
  if (verifier) {
    const reel = fs.existsSync(FICHIER_CATALOGUE) ? fs.readFileSync(FICHIER_CATALOGUE, 'utf8') : null;
    const diagnostic = reel === null ? `activites/catalogue.js n'existe pas — lancer ${COMMANDE}.` : diagnostiquer(texte, reel);
    if (diagnostic) { console.error('Catalogue périmé : ' + diagnostic); process.exit(1); }
    console.log(`Catalogue à jour : ${entrees.length} séances (${duree} s).`);
    return;
  }
  fs.writeFileSync(FICHIER_CATALOGUE, texte);
  console.log(`activites/catalogue.js écrit : ${entrees.length} séances, ${(Buffer.byteLength(texte) / 1024).toFixed(1)} Ko (${duree} s).`);
}

// Le script ne s'exécute que lancé directement, pas quand la suite de tests l'importe.
const reel = (p) => { try { return fs.realpathSync.native(p).toLowerCase(); } catch (e) { return String(p).toLowerCase(); } };
if (process.argv[1] && reel(process.argv[1]) === reel(fileURLToPath(import.meta.url))) {
  principal().catch((e) => { console.error(e && e.stack || e); process.exit(1); });
}
