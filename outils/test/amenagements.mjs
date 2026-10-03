// Suite de tests de Prepalog — bloc « amenagements » : niveau (standard / confirmé) et
// tiers-temps, réglés élève par élève par l'enseignant (brief `docs/briefs/MOTEUR-tiers-temps.md`,
// 03/10/2026). `node outils/test.mjs amenagements` ne lance que ce bloc.
//
// Ce que ces cas gardent :
//   - l'onglet « Comptes élèves » porte, pour chaque élève, un niveau (Standard par défaut) et
//     une case tiers-temps (décochée par défaut), enregistrés sans redessiner ;
//   - une séance ouverte par l'élève reçoit `ctx.aisance` et `ctx.tiersTemps` — les siens, pas
//     ceux d'un camarade — et les relit à l'ouverture (l'enseignant a pu cocher entre-temps) ;
//   - un élève ne peut pas changer ses propres réglages (en mode réel, les règles Firestore le
//     refusent : `outils/test-regles.mjs`) ;
//   - le tiers-temps ne sort pas de l'onglet : ni dans l'export de la liste, ni dans le suivi.
//
// Pour lire le contexte d'une séance, `core/app.js` est servi à CE navigateur de test avec une
// ligne de plus (une copie de `ctx.aisance` / `ctx.tiersTemps` dans `window`) ; rien n'est
// modifié dans le dépôt.

export default async function bloc({ v, nav }) {

const ctxA = await nav.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
let espion = false;
await ctxA.route('**/core/app.js*', async (route) => {
  const r = await route.fetch();
  const corps = await r.text();
  const ancre = "m.rendre(document.getElementById('hoteActivite'), ctx);";
  espion = corps.includes(ancre);
  await route.fulfill({ response: r, body: corps.replace(ancre,
    `window.__ctxSeance = { id: m.meta.id, aisance: ctx.aisance, tiersTemps: ctx.tiersTemps, profilTT: ctx.profil.tiersTemps };\n  ${ancre}`) });
});
const pg = await ctxA.newPage();
pg.setDefaultTimeout(6000);
const erreursA = [];
pg.on('pageerror', (e) => erreursA.push('PAGEERROR: ' + e.message));
pg.on('dialog', (d) => d.accept());
await pg.goto('http://127.0.0.1:8099/');
await pg.waitForSelector('#btnProf', { timeout: 8000 });

const SEANCE = 'quiz-flux';   // prête, sans niveau, sans ouverture par l'enseignant
const MAT = '4901', TEMOIN = '4902';

const versAccueil = async (p = pg) => {
  if (await p.$('#btnRetour')) await p.click('#btnRetour');
  if (await p.$('#btnAccueil')) await p.click('#btnAccueil');
};
const commeEleve = async (mat, code, p = pg) => {
  await versAccueil(p);
  if (await p.$('#btnDeco')) await p.click('#btnDeco');
  await p.waitForSelector('#mat');
  await p.fill('#mat', mat);
  await p.fill('#code', code);
  await p.click('#btnEleve');
  await p.waitForSelector('text=Bonjour');
};
const commeProf = async () => {
  await versAccueil();
  if (await pg.$('#btnDeco')) await pg.click('#btnDeco');
  await pg.waitForSelector('#btnProf');
  await pg.click('#btnProf');
  await pg.waitForSelector('#btnProfEspace');
};
const comptes = async () => {
  await versAccueil();
  await pg.click('#btnProfEspace');
  await pg.click('[data-ong="comptes"]');
  await pg.waitForSelector('#lot');
};
const uidDe = (mat) => pg.evaluate((m) => {
  const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
  return Object.keys(u).find((k) => u[k].matricule === m) || null;
}, mat);
// Ouvre la séance témoin comme le ferait l'élève, et rend ce qu'elle a reçu.
const ouvrirSeance = async (p = pg) => {
  await p.evaluate(() => { window.__ctxSeance = null; });
  await p.click('#btnAccueil').catch(() => {});
  await p.click('[data-rub="quiz"]');
  await p.click(`[data-act="${SEANCE}"]`);
  await p.waitForFunction(() => window.__ctxSeance);
  return p.evaluate(() => window.__ctxSeance);
};

await v('aménagements : l’onglet « Comptes élèves » montre le niveau (Standard) et le tiers-temps (décoché) par défaut', async () => {
  if (!espion) throw new Error('core/app.js n’a plus la ligne qui ouvre la séance : le relevé du contexte est à revoir');
  await pg.click('#btnProf');
  await pg.waitForSelector('#btnProfEspace');
  await pg.click('#btnProfEspace');
  await pg.waitForSelector('#gNom');
  await pg.fill('#gNom', 'AME 1');
  await pg.click('#btnCreerG');
  await pg.waitForSelector('text=AME 1');
  await pg.click('[data-ong="comptes"]');
  await pg.waitForSelector('#lot');
  await pg.fill('#lot', `AMENAGE ; Élève ; ${MAT} ; am01\nTEMOIN ; Élève ; ${TEMOIN} ; am02`);
  await pg.click('#btnLot');
  await pg.waitForSelector('[data-tiers]');
  const r = await pg.$$eval('[data-tiers]', (els) => els.map((c) => ({
    tt: c.checked, niv: document.querySelector(`[data-aisance="${c.dataset.tiers}"]`).value })));
  if (r.length !== 2 || r.some((x) => x.tt || x.niv !== 'standard')) throw new Error(JSON.stringify(r));
});

await v('aménagements : sans réglage, la séance reçoit niveau standard et pas de tiers-temps', async () => {
  await commeEleve(MAT, 'am01');
  const c = await ouvrirSeance();
  if (c.id !== SEANCE || c.aisance !== 'standard' || c.tiersTemps !== false) throw new Error(JSON.stringify(c));
});

await v('aménagements : l’enseignant coche le tiers-temps et passe l’élève en confirmé — enregistré, case en place', async () => {
  await commeProf();
  await comptes();
  const uid = await uidDe(MAT);
  await pg.check(`[data-tiers="${uid}"]`);
  await pg.selectOption(`[data-aisance="${uid}"]`, 'confirme');
  await pg.waitForFunction((u) => {
    const x = JSON.parse(localStorage.getItem('prepalog:users') || '{}')[u];
    return x && x.tiersTemps === true && x.aisance === 'confirme';
  }, uid);
  // Rien n'a redessiné l'onglet : la case cochée est toujours la même et toujours cochée.
  if (!(await pg.isChecked(`[data-tiers="${uid}"]`))) throw new Error('case décochée après enregistrement');
  // Relu depuis le stockage, l'onglet redit la même chose.
  await comptes();
  if (!(await pg.isChecked(`[data-tiers="${uid}"]`))) throw new Error('case décochée à la relecture');
  if ((await pg.$eval(`[data-aisance="${uid}"]`, (s) => s.value)) !== 'confirme') throw new Error('niveau perdu à la relecture');
});

await v('aménagements : case cochée → la séance reçoit tiersTemps === true et aisance « confirme »', async () => {
  await commeEleve(MAT, 'am01');
  const c = await ouvrirSeance();
  if (c.tiersTemps !== true || c.aisance !== 'confirme' || c.profilTT !== true) throw new Error(JSON.stringify(c));
});

await v('aménagements : le camarade non réglé reçoit toujours standard et false', async () => {
  await commeEleve(TEMOIN, 'am02');
  const c = await ouvrirSeance();
  if (c.tiersTemps !== false || c.aisance !== 'standard') throw new Error(JSON.stringify(c));
});

await v('aménagements : un élève ne peut pas changer ses propres réglages', async () => {
  await commeEleve(MAT, 'am01');
  const r = await pg.evaluate(async () => {
    const { B } = await import('/core/backend.js');
    const uid = B.profilCourant().uid;
    let refus = null;
    try { await B.majAmenagements(uid, { tiersTemps: false, aisance: 'standard' }); } catch (e) { refus = e.message; }
    const x = JSON.parse(localStorage.getItem('prepalog:users') || '{}')[uid];
    return { refus, tt: x.tiersTemps, niv: x.aisance, cases: document.querySelectorAll('[data-tiers], [data-aisance]').length };
  });
  if (!r.refus || r.tt !== true || r.niv !== 'confirme' || r.cases) throw new Error(JSON.stringify(r));
});

await v('aménagements : l’enseignant décoche pendant que l’élève est connecté — la séance suivante reçoit false', async () => {
  // L'élève reste connecté dans un second onglet ; l'enseignant décoche dans le premier.
  const pe = await ctxA.newPage();
  pe.on('pageerror', (e) => erreursA.push('PAGEERROR (élève) : ' + e.message));
  await pe.goto('http://127.0.0.1:8099/');
  await pe.waitForSelector('text=Bonjour');
  await commeProf();
  await comptes();
  const uid = await uidDe(MAT);
  await pg.uncheck(`[data-tiers="${uid}"]`);
  await pg.waitForFunction((u) => JSON.parse(localStorage.getItem('prepalog:users') || '{}')[u].tiersTemps === false, uid);
  const c = await ouvrirSeance(pe);
  await pe.close();
  if (c.tiersTemps !== false || c.profilTT !== false || c.aisance !== 'confirme') throw new Error(JSON.stringify(c));
});

await v('aménagements : le tiers-temps ne sort pas de l’onglet — ni dans l’export de la liste, ni dans le suivi de classe', async () => {
  const uid = await uidDe(MAT);
  await pg.check(`[data-tiers="${uid}"]`);
  await pg.waitForFunction((u) => JSON.parse(localStorage.getItem('prepalog:users') || '{}')[u].tiersTemps === true, uid);
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('#btnCsvEleves')]);
  const fs = await import('node:fs');
  const csv = fs.readFileSync(await dl.path(), 'utf8');
  if (!/AMENAGE/.test(csv)) throw new Error('export sans l’élève : ' + csv.slice(0, 120));
  if (/tiers|aisance|confirm/i.test(csv)) throw new Error('export bavard : ' + csv.split('\n')[0]);
  await pg.click('[data-ong="suivi"]');
  await pg.waitForTimeout(400);
  const t = await pg.$eval('#contenuProf', (e) => e.textContent);
  if (!/AMENAGE/.test(t)) throw new Error('suivi sans l’élève');
  if (/tiers/i.test(t)) throw new Error('le suivi de classe parle du tiers-temps');
});

await v('aménagements : aucune erreur JavaScript', async () => {
  if (erreursA.length) throw new Error(erreursA.slice(0, 3).join(' / '));
});

await ctxA.close();
}
