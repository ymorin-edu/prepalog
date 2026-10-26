// Suite de tests de Prepalog — les aides COMMUNES des blocs Mondial Relay (`mr-11.4` …). Créé le 26/10/2026 avec ENT-11.4, sur le modèle de
// `outils/test/france-boissons/commun.mjs`. Sous-dossier exprès : le lanceur refuse tout `.mjs` posé directement dans `outils/test/` qui ne serait pas
// dans `BLOCS`, mais il ne regarde pas les dossiers.
//
// `ouvrirMR({ nav, BASE })` ouvre un contexte (1366 × 900) et une page, relève les erreurs JavaScript, et rend les aides qui ferment sur cette page.

export const proche = (a, b, quoi) => { if (Math.abs(a - b) > 1e-3) throw new Error(`${quoi} : ${a} au lieu de ${b}`); };

export async function ouvrirMR({ nav, BASE }) {
  const ctx = await nav.newContext({ viewport: { width: 1366, height: 900 } });
  const erreurs = [];
  const hotes = new Set();
  const pg = await ctx.newPage();
  pg.setDefaultTimeout(6000);
  pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  pg.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotes.add(h); } catch (e) {} });
  pg.on('dialog', (d) => d.accept());
  await pg.goto(BASE);
  await pg.waitForSelector('#btnProf', { timeout: 8000 });
  await pg.emulateMedia({ reducedMotion: 'reduce' });
  const Z = '#fTest';
  const pause = (ms = 80) => pg.waitForTimeout(ms);
  const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__f.db)));
  const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
  const aller = async (vue) => { await pg.evaluate(({ Z, vue }) => document.querySelector(`${Z} .ent-nav[data-vue="${vue}"]`).click(), { Z, vue }); await pause(); };
  const texte = () => pg.evaluate((Z) => document.querySelector(Z).innerText, Z);
  const entrants = async () => (await base()).mails.filter((m) => m.folder === 'in');
  const horodate = (ts) => { const d = new Date(ts); return [d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours(), d.getMinutes()]; };
  return { ctx, pg, erreurs, hotes, Z, pause, base, present, aller, texte, entrants, horodate, proche, fermer: () => ctx.close() };
}
