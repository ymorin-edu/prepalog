import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };

const srv = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    res.writeHead(404); return res.end('404');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise((r) => srv.listen(8099, r));

const nav = await chromium.launch();
const ctx = await nav.newContext();
const page = await ctx.newPage();
page.setDefaultTimeout(5000);
const erreurs = [];
page.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') erreurs.push('CONSOLE: ' + m.text()); });
// Aucune requête externe ne doit être nécessaire en mode démo.
await page.route('https://fonts.googleapis.com/**', (r) => r.abort());
await page.route('https://fonts.gstatic.com/**', (r) => r.abort());

const ok = [];
const ko = [];
const v = async (nom, fn) => {
  try { await fn(); ok.push(nom); } catch (e) { ko.push(`${nom} → ${e.message.split('\n')[0]}`); }
};

await page.goto('http://127.0.0.1:8099/');
await page.waitForSelector('#btnProf', { timeout: 8000 });

// ---------- 1. connexion enseignant
await v('connexion enseignant', async () => {
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace', { timeout: 6000 });
});

// ---------- 2. création d'un groupe
await v('création de groupe', async () => {
  await page.click('#btnProfEspace');
  await page.waitForSelector('#gNom');
  await page.fill('#gNom', '1 LOG A');
  await page.click('#btnCreerG');
  await page.waitForSelector('text=1 LOG A', { timeout: 6000 });
});

// ---------- 3. création de comptes en lot
await v('création de comptes en lot', async () => {
  await page.click('[data-ong="comptes"]');
  await page.waitForSelector('#lot');
  await page.fill('#lot', 'DUPONT ; Léa ; 2601 ; aaa1\nMARTIN ; Noé ; 2602 ; bbb2');
  await page.click('#btnLot');
  await page.waitForSelector('text=2 comptes créés', { timeout: 6000 });
});

// ---------- 4. semer la base partagée
await v('semis de la base partagée', async () => {
  await page.click('[data-ong="seance"]');
  await page.waitForSelector('[data-semer="op1"]');
  page.once('dialog', (d) => d.accept());
  await page.click('[data-semer="op1"]');
  await page.waitForTimeout(600);
});

// ---------- 5. l'enseignant voit la base semée
await v('lecture de la base partagée (enseignant)', async () => {
  await page.click('#btnRetour');
  await page.waitForSelector('[data-act="op1"]');
  await page.click('[data-act="op1"]');
  await page.waitForSelector('text=REF-0101', { timeout: 6000 });
});

// ---------- 6. déconnexion puis connexion élève
await v('connexion élève', async () => {
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#mat', { timeout: 6000 });
  await page.fill('#mat', '2601');
  await page.fill('#code', 'aaa1');
  await page.click('#btnEleve');
  await page.waitForSelector('text=Bonjour Léa', { timeout: 6000 });
});

// ---------- 7. l'élève voit la base commune de la classe
await v('base commune visible par l\'élève', async () => {
  await page.click('[data-act="op1"]');
  await page.waitForSelector('text=REF-0102', { timeout: 6000 });
});

// ---------- 8. l'élève ajoute une ligne partagée
await v('ajout d\'une ligne dans la base partagée', async () => {
  await page.click('[data-onglet="emplacements"]');
  await page.waitForSelector('#ch_code');
  await page.fill('#ch_code', 'C-09-4');
  await page.click('#btnAjouter');
  await page.waitForSelector('text=C-09-4', { timeout: 6000 });
});

// ---------- 9. QCM autocorrigé
await v('QCM autocorrigé et enregistrement du score', async () => {
  await page.click('#btnRetour');
  await page.waitForSelector('[data-act="ent1"]');
  await page.click('[data-act="ent1"]');
  await page.waitForSelector('#btnValider', { timeout: 6000 });
  // On coche la première proposition de chaque question, au hasard.
  const qs = await page.$$('.question');
  for (const q of qs) {
    const c = await q.$('input');
    if (c) await c.check();
  }
  await page.click('#btnValider');
  await page.waitForSelector('#bilan .avis', { timeout: 6000 });
});

// ---------- 10. le corrigé n'est pas en clair dans la page
await v('corrigé non lisible en clair', async () => {
  const src = await page.content();
  if (src.includes('Une commande réelle du client') === false) throw new Error('énoncé absent, test invalide');
  const mod = await page.evaluate(async () => {
    const m = await import('/activites/ent1-flux.js');
    return JSON.stringify(m);
  });
  if (/justes["']?\s*:\s*\[\s*["']Une commande/.test(mod)) throw new Error('réponse en clair dans le module');
});

// ---------- 11. le suivi de classe remonte le score
await v('suivi de classe côté enseignant', async () => {
  await page.click('#btnRetour');
  await page.click('#btnDeco');
  await page.waitForSelector('#btnProf');
  await page.click('#btnProf');
  await page.waitForSelector('#btnProfEspace');
  await page.click('#btnProfEspace');
  await page.click('[data-ong="suivi"]');
  await page.waitForSelector('text=ENT-1', { timeout: 6000 });
  const t = await page.textContent('#contenuProf');
  if (!/DUPONT/.test(t)) throw new Error('élève absent du suivi');
  if (!/\/\s*6/.test(t)) throw new Error('score absent du suivi');
});

console.log('\n=== RÉUSSIS ===');
ok.forEach((o) => console.log('  ✓ ' + o));
if (ko.length) { console.log('\n=== ÉCHECS ==='); ko.forEach((k) => console.log('  ✗ ' + k)); }
if (erreurs.length) { console.log('\n=== ERREURS JS ==='); [...new Set(erreurs)].slice(0, 12).forEach((e) => console.log('  ! ' + e)); }
console.log(`\n${ok.length}/${ok.length + ko.length} tests réussis.`);

await nav.close();
srv.close();
process.exit(ko.length || erreurs.length ? 1 : 0);
