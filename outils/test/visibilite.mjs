// Suite de tests de Prepalog — bloc « visibilite » : l'enseignant voit TOUTES les activités
// (02/10/2026, demande de Tristan : « possible que les enseignants voient tout ? »), les élèves
// seulement celles qui leur sont ouvertes. `node outils/test.mjs visibilite` ne lance que ce bloc.
//
// RÉÉCRIT le 03/10/2026 (brief `docs/briefs/MOTEUR-ouverture-par-enseignant.md`) : le bloc
// n'exige plus qu'une séance du registre soit en préparation. Il éprouve trois états, posés
// dans CE navigateur de test seulement (le vrai fichier de la séance est servi, un seul drapeau
// est réécrit au passage, rien n'est modifié dans le dépôt) :
//   - ENT-2.1 (`cdiscount-mouvements`) servie avec `pret: false` : « en préparation » ;
//   - ENT-2.4 (`cdiscount-regularise`) servie avec `ouverture: 'prof'` : fermée aux élèves tant
//     que l'enseignant ne l'a pas cochée dans « Conduite de séance » ;
//   - une séance Cdiscount prête, sans `ouverture` : comportement d'avant (le niveau décide).
// Ce que ces cas gardent :
//   - l'enseignant voit toutes les tuiles, avec ce que voient les élèves ;
//   - la case d'une séance en préparation est grisée (constaté par Tristan le 02/10 sur ENT-2.2) ;
//   - une séance « ouverture par l'enseignant » est décochée par défaut, invisible à l'élève,
//     visible dès qu'elle est cochée, invisible de nouveau une fois décochée — sans commit ;
//   - une séance fermée garde sa tuile chez l'enseignant (« fermée pour ce groupe »).

export default async function bloc({ v, nav, BASE }) {

const ctxV = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const pg = await ctxV.newPage();
pg.setDefaultTimeout(6000);
const erreursV = [];
// Les deux séances dont on réécrit un drapeau, et ce qu'on y met.
const PREPA = 'cdiscount-mouvements';
const A_OUVRIR = 'cdiscount-regularise';
const forcees = {};
const forcer = (id, remplacer) => ctxV.route(`**/activites/${id}.js*`, async (route) => {
  const r = await route.fetch();
  const corps = await r.text();
  forcees[id] = /pret:\s*true,/.test(corps);
  await route.fulfill({ response: r, body: corps.replace(/pret:\s*true,/, remplacer) });
});
await forcer(PREPA, 'pret: false,');
await forcer(A_OUVRIR, "pret: true, ouverture: 'prof',");
// Depuis la renumérotation (03/10/2026), toutes les séances Cdiscount sont livrées fermées : on
// sert l'inventaire SANS son `ouverture` pour garder un cas « prête, le niveau décide ».
const SANS_OUVERTURE = 'cdiscount-inventaire';
await ctxV.route(`**/activites/${SANS_OUVERTURE}.js*`, async (route) => {
  const r = await route.fetch();
  await route.fulfill({ response: r, body: (await r.text()).replace(/\n\s*ouverture:\s*'prof',/, '') });
});
pg.on('pageerror', (e) => erreursV.push('PAGEERROR: ' + e.message));
pg.on('dialog', (d) => d.accept());
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

const metas = await pg.evaluate(async () => (await (await import('/activites/index.js')).chargerActivites())
  .map((m) => ({ id: m.meta.id, code: m.meta.code, pret: !!m.meta.pret, ouverture: m.meta.ouverture || null,
    rubrique: m.meta.rubrique })));
const prepa = metas.find((m) => m.id === PREPA);
const aOuvrir = metas.find((m) => m.id === A_OUVRIR);
// Simulog est rangé par entreprise (02/10/2026) : le premier nombre du code dit l'entreprise.
const entDe = (m) => (m && m.rubrique === 'simulog' ? String(((m.code || '').match(/-(\d+)/) || [])[1]) : null);
// Une séance prête de la même entreprise, sans `ouverture`, qu'on fermera pour le groupe.
const prete = metas.find((m) => m.pret && !m.ouverture && m.rubrique === 'simulog' && entDe(m) === entDe(prepa)
  && m.id !== PREPA && m.id !== A_OUVRIR);

const tuiles = () => pg.$$eval('.module-tile', (els) => els.map((e) => ({
  id: e.dataset.act, cachee: e.querySelector('[data-cachee]')?.dataset.cachee || null })));
// Retour à l'accueil d'où que l'on soit : la liste d'une entreprise ne mène qu'aux logos.
const versAccueil = async () => {
  if (await pg.$('#btnSimulog')) await pg.click('#btnSimulog');
  if (await pg.$('#btnAccueil')) await pg.click('#btnAccueil');
};
const ouvrirRubrique = async (rub, ent) => {
  if (await pg.$('#btnAccueil')) await pg.click('#btnAccueil');
  await pg.waitForSelector(`[data-rub="${rub}"]`);
  await pg.click(`[data-rub="${rub}"]`);
  if (ent) await pg.click(`[data-ent="${ent}"]`);   // Simulog : le logo de l'entreprise
  await pg.waitForSelector('.module-tile, .ent-bandeau');
};
const commeEleve = async () => {
  await versAccueil();
  await pg.click('#btnDeco');
  await pg.waitForSelector('#mat');
  await pg.fill('#mat', '3901');
  await pg.fill('#code', 'vv01');
  await pg.click('#btnEleve');
  await pg.waitForSelector('text=Bonjour Élève');
};
const commeProf = async () => {
  await versAccueil();
  await pg.click('#btnDeco');
  await pg.waitForSelector('#btnProf');
  await pg.click('#btnProf');
  await pg.waitForSelector('#btnProfEspace');
};
// Les tuiles Cdiscount que voit l'ÉLÈVE (aucune si l'entreprise n'a plus de séance ouverte).
const tuilesEleve = async () => {
  if (await pg.$('#btnAccueil')) await pg.click('#btnAccueil');
  const rubs = await pg.evaluate(() => [...document.querySelectorAll('[data-rub]')].map((b) => b.dataset.rub));
  if (!rubs.includes('simulog')) return [];
  await pg.click('[data-rub="simulog"]');
  await pg.waitForTimeout(300);
  const ent = entDe(prepa);
  if (!(await pg.$(`[data-ent="${ent}"]`))) return [];
  await pg.click(`[data-ent="${ent}"]`);
  await pg.waitForTimeout(300);
  return tuiles();
};
const conduite = async () => {
  await versAccueil();
  await pg.click('#btnProfEspace');
  await pg.click('[data-ong="seance"]');
  await pg.waitForSelector(`[data-ouvre="${A_OUVRIR}"]`);
};
const cocher = async (id, oui) => {
  if (oui) await pg.check(`[data-ouvre="${id}"]`); else await pg.uncheck(`[data-ouvre="${id}"]`);
  await pg.waitForFunction(([x, o]) => document.querySelector(`[data-ouvre="${x}"]`).checked === o, [id, oui]);
  await pg.waitForTimeout(200);
};

await v('visibilité : les trois états à éprouver sont posés (en préparation, à ouvrir, prête)', async () => {
  if (!forcees[PREPA] || !prepa || prepa.pret) throw new Error('ENT-2.1 n’a pas été mise « en préparation » : ' + JSON.stringify(prepa));
  if (!forcees[A_OUVRIR] || !aOuvrir || !aOuvrir.pret || aOuvrir.ouverture !== 'prof') throw new Error('ENT-2.4 n’est pas « à ouvrir » : ' + JSON.stringify(aOuvrir));
  if (!prete) throw new Error('aucune autre séance Cdiscount prête');
});

await v('visibilité : la règle — « à ouvrir » fermée sans coche, ouverte cochée (même hors niveau), fermée décochée ; sans le champ, rien ne change', async () => {
  const r = await pg.evaluate(async () => {
    const { activiteVisible: vis, raisonCachee: rai } = await import('/core/niveaux.js');
    const p = { id: 'x', pret: true, ouverture: 'prof', niveaux: ['1re'] };
    const n = { id: 'x', pret: true, niveaux: ['1re'] };
    const g = (ouverts, niveau = '1re') => ({ niveau, ouverts });
    return [
      vis(p, g({})), rai(p, g({})),
      vis(p, g({ x: true })), vis(p, g({ x: true }, 'tle')), rai(p, g({ x: true })),
      vis(p, g({ x: false })), rai(p, g({ x: false })),
      vis(p, null),
      vis(n, g({})), vis(n, g({}, 'tle')), rai(n, g({}, 'tle')),
      vis({ id: 'x', pret: false, ouverture: 'prof' }, g({ x: true })),
    ];
  });
  const attendu = [false, 'pas encore ouverte à ce groupe', true, true, null, false, 'fermée pour ce groupe', true,
    true, false, 'hors niveau du groupe', false];
  if (JSON.stringify(r) !== JSON.stringify(attendu)) throw new Error(JSON.stringify(r));
});

await v('visibilité : l’enseignant voit les trois séances, chacune avec ce que voient ses élèves', async () => {
  await pg.click('#btnProf');
  await pg.waitForSelector('#btnProfEspace');
  await pg.click('#btnProfEspace');
  await pg.waitForSelector('#gNom');
  await pg.fill('#gNom', 'VIS 1');
  await pg.click('#btnCreerG');
  await pg.waitForSelector('text=VIS 1');
  await pg.click('[data-ong="comptes"]');
  await pg.waitForSelector('#lot');
  await pg.fill('#lot', 'VUE ; Élève ; 3901 ; vv01');
  await pg.click('#btnLot');
  await pg.waitForTimeout(400);
  await pg.click('#btnRetour');
  await ouvrirRubrique(prepa.rubrique, entDe(prepa));
  const t = await tuiles();
  const de = (id) => t.find((y) => y.id === id);
  if (!de(PREPA) || de(PREPA).cachee !== 'en préparation') throw new Error('ENT-2.1 : ' + JSON.stringify(de(PREPA)));
  if (!de(A_OUVRIR) || de(A_OUVRIR).cachee !== 'pas encore ouverte à ce groupe') throw new Error('ENT-2.4 : ' + JSON.stringify(de(A_OUVRIR)));
  if (!de(prete.id) || de(prete.id).cachee) throw new Error(`${prete.code} : ` + JSON.stringify(de(prete.id)));
});

await v('visibilité : conduite de séance — « en préparation » grisée, « à ouvrir » décochée et cochable, la prête cochée', async () => {
  await conduite();
  const c = (id) => pg.$eval(`[data-ouvre="${id}"]`, (e) => ({ dis: e.disabled, coche: e.checked,
    etiq: e.closest('label').textContent.replace(/\s+/g, ' ') }));
  const p = await c(PREPA), a = await c(A_OUVRIR), r = await c(prete.id);
  if (!p.dis || p.coche || !/en préparation/.test(p.etiq)) throw new Error('ENT-2.1 : ' + JSON.stringify(p));
  if (a.dis || a.coche || !/à ouvrir/.test(a.etiq)) throw new Error('ENT-2.4 : ' + JSON.stringify(a));
  if (r.dis || !r.coche || /à ouvrir/.test(r.etiq)) throw new Error(`${prete.code} : ` + JSON.stringify(r));
  // On ferme la séance prête pour ce groupe : elle doit rester visible chez l'enseignant.
  await cocher(prete.id, false);
});

await v('visibilité : une séance fermée garde sa tuile chez l’enseignant, « fermée pour ce groupe »', async () => {
  await pg.click('#btnRetour');
  await ouvrirRubrique(prepa.rubrique, entDe(prepa));
  const p = (await tuiles()).find((y) => y.id === prete.id);
  if (!p || p.cachee !== 'fermée pour ce groupe') throw new Error(JSON.stringify(p));
});

await v('visibilité : l’élève ne voit ni la séance en préparation, ni celle « à ouvrir », ni la séance fermée', async () => {
  await commeEleve();
  const t = await tuilesEleve();
  const vues = t.filter((y) => [PREPA, A_OUVRIR, prete.id].includes(y.id)).map((y) => y.id);
  if (vues.length) throw new Error('visible à l’élève : ' + vues.join(', '));
  if (t.some((y) => y.cachee)) throw new Error('étiquette d’enseignant chez l’élève');
});

await v('visibilité : l’enseignant coche la séance « à ouvrir » — l’élève la voit, sans rien commiter', async () => {
  await commeProf();
  await conduite();
  await cocher(A_OUVRIR, true);
  await commeEleve();
  const t = await tuilesEleve();
  if (!t.some((y) => y.id === A_OUVRIR)) throw new Error('ENT-2.4 cochée mais invisible : ' + t.map((y) => y.id).join(', '));
  if (t.some((y) => y.id === PREPA)) throw new Error('la séance en préparation est apparue');
});

await v('visibilité : l’enseignant la décoche — elle disparaît pour l’élève, et reste « fermée » chez lui', async () => {
  await commeProf();
  await conduite();
  await cocher(A_OUVRIR, false);
  const a = await pg.$eval(`[data-ouvre="${A_OUVRIR}"]`, (e) => e.closest('label').textContent.replace(/\s+/g, ' '));
  if (!/fermée/.test(a)) throw new Error('étiquette après décochage : ' + a);
  await commeEleve();
  const t = await tuilesEleve();
  if (t.some((y) => y.id === A_OUVRIR)) throw new Error('ENT-2.4 décochée mais encore visible');
});

await v('visibilité : aucune erreur JavaScript', async () => {
  if (erreursV.length) throw new Error(erreursV.slice(0, 3).join(' / '));
});

await ctxV.close();
}
