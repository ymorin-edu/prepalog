// Suite de tests de Prepalog — le COMMUN : serveur de test, navigateur, page partagée, `v()`,
// relevés d'erreurs et d'hôtes extérieurs. Importé une fois par le lanceur `outils/test.mjs`,
// qui passe ces objets à chaque bloc. Découpé de `outils/test.mjs` le 02/10/2026 (chantier C).

import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

// `.pathname` d'une URL de fichier n'est PAS un chemin : sous Windows il rend
// « /C:/Users/… », avec une barre oblique de tête. `path.join` en faisait
// « \C:\Users\… », donc `fs.existsSync` était faux pour TOUS les fichiers : le serveur de
// test répondait 404 à tout, la page restait blanche, et la suite mourait sur le premier
// sélecteur attendu — une erreur qui ne désigne en rien sa cause. `fileURLToPath` rend le
// chemin natif de la plateforme, et c'est aussi ce qui permet de retrouver `node_modules`
// une quarantaine de lignes plus bas.
// Depuis le découpage (02/10/2026), ce fichier est dans `outils/test/` : la racine est DEUX
// crans au-dessus, d'où « ../.. ». Constaté le 01/10/2026, au premier lancement de la
// suite sous Windows : elle n'avait jamais tourné que sous Linux.
const ROOT = fileURLToPath(new URL('../..', import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };

// `prepalog-config.json` est versionné depuis le 30/09/2026 : sur le disque, il existe.
// Le servir ferait démarrer l'application en mode réel, où la suite entière n'a plus de
// sens — elle ne teste que le mode démonstration, et 39 tests sur 46 tombaient. Le serveur
// de test le refuse donc systématiquement : la suite est mode-démo par construction, quel
// que soit le contenu du dépôt, et c'est ce 404 délibéré que le test « un seul 404 »
// attend. Les tests du chemin Firebase, eux, se donnent leur propre configuration d'essai.
const SANS_CONFIG = '/prepalog-config.json';

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  if (p === SANS_CONFIG) { res.writeHead(404); return res.end('404'); }
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404); return res.end('404');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
// Le port se règle par `PORT_TESTS` (8099 par défaut) : sur GitHub, trois groupes de blocs tournent
// en même temps sur des machines séparées (lot 1 de MOTEUR-tests-rapides, 06/10/2026), et deux
// suites lancées côte à côte sur un même poste ne se disputent pas le même port. Les blocs ne
// connaissent que `BASE`, l'adresse du site de test.
const PORT_DEMANDE = Number(process.env.PORT_TESTS || 8099);
// Port déjà pris (deux suites lancées en même temps, ou un serveur local : arrivé les 08 et
// 09/10/2026) : on prend le suivant libre, 8100, 8101… (50 essais), au lieu de mourir sur une pile
// `EADDRINUSE`. On écoute sur 127.0.0.1 exprès : c'est l'adresse de `BASE`, et sous Windows un
// serveur « sur toutes les adresses » peut coexister avec un autre sur 127.0.0.1 en même port,
// ce qui ferait parler la suite au serveur de quelqu'un d'autre. Les blocs ne lisent que `BASE`.
const ecouter = (port) => new Promise((resolve, reject) => {
  srv.once('error', reject);
  srv.listen(port, '127.0.0.1', () => { srv.off('error', reject); resolve(port); });
});
let PORT = PORT_DEMANDE;
try {
  for (let essai = 0; ; essai++) {
    PORT = PORT_DEMANDE + essai;
    try { await ecouter(PORT); break; }
    catch (e) {
      if (e.code !== 'EADDRINUSE' || essai >= 50) throw e;
    }
  }
} catch (e) {
  console.error(`Le serveur de test ne démarre pas (port ${PORT}) : ${e.message}`);
  process.exit(2);
}
if (PORT !== PORT_DEMANDE) console.log(`Port ${PORT_DEMANDE} occupé : la suite tourne sur ${PORT}`);
const BASE = `http://127.0.0.1:${PORT}/`;

const nav = await chromium.launch();
// Relevés faits sur TOUS les onglets de TOUS les contextes (et pas seulement la page partagée) :
// dix-neuf blocs ouvrent leurs propres contextes par `nav.newContext()`, et une image venue d'un
// CDN chargée dans l'un d'eux serait passée inaperçue. `nav.newContext` est donc enveloppé : chaque
// page de chaque contexte alimente `introuvables` (réponses 404) et `hotesExternes` (requêtes hors
// du site de test). Les erreurs JavaScript (`erreurs`), elles, restent celles de la page partagée :
// les blocs ont leurs propres écouteurs et leurs cas « aucune erreur ».
const introuvables = new Set();
const hotesExternes = new Set();
const surveiller = (p) => {
  p.on('response', (r) => { if (r.status() === 404) introuvables.add(new URL(r.url()).pathname); });
  p.on('request', (r) => {
    try {
      const h = new URL(r.url()).hostname;
      if (h && !['127.0.0.1', 'localhost'].includes(h)) hotesExternes.add(h);
    } catch (e) {}
  });
};
const newContextOrigine = nav.newContext.bind(nav);
nav.newContext = async (...args) => {
  const c = await newContextOrigine(...args);
  c.on('page', surveiller);
  return c;
};
const ctx = await nav.newContext();
const page = await ctx.newPage();
page.setDefaultTimeout(5000);
const erreurs = [];
// Un 404 est attendu, et un seul : prepalog-config.json, refusé par le serveur de test
// ci-dessus, c'est lui qui déclenche le mode démonstration. Chromium le journalise en
// erreur de console à chaque
// chargement ; le compter ferait échouer la suite en permanence, et masquerait les vraies.
// On l'écarte donc du relevé, mais on note toutes les URL introuvables : un test dédié
// vérifie qu'il n'y en a pas d'autre, si bien que rien n'est perdu.
page.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  if (/Failed to load resource.*\b404\b/.test(m.text())) return;
  erreurs.push('CONSOLE: ' + m.text());
});
// Aucune requête externe ne doit être nécessaire en mode démo.
// Aucune route à intercepter : le site ne sort plus du dépôt. Toute requête externe
// observée pendant la suite est une régression, et le dernier test la signale.

// SheetJS est servi par le dépôt lui-même (vendor/), plus par un CDN : rien à intercepter.
// Le module npm reste utile aux tests, mais seulement pour FABRIQUER un classeur rempli.
let baseXlsx = null;
for (const base of [process.env.NODE_PATH, `${process.env.HOME}/.npm-global/lib/node_modules`,
  '/home/claude/.npm-global/lib/node_modules', path.join(ROOT, 'node_modules'),
  '/usr/lib/node_modules', '/usr/local/lib/node_modules']) {
  if (!base) continue;
  if (base && fs.existsSync(path.join(base, 'xlsx', 'xlsx.mjs'))) { baseXlsx = path.join(base, 'xlsx'); break; }
}

// Toute requête sortante est notée : le dépôt ne doit dépendre d'aucun hébergeur extérieur.

const ok = [];
const ko = [];
const v = async (nom, fn) => {
  try { await fn(); ok.push(nom); } catch (e) { ko.push(`${nom} → ${e.message.split('\n')[0]}`); }
};

await page.goto(BASE);
await page.waitForSelector('#btnProf', { timeout: 8000 });

export { ROOT, BASE, SANS_CONFIG, srv, nav, ctx, page, erreurs, introuvables, baseXlsx, hotesExternes, ok, ko, v };
