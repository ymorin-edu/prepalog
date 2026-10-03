// Suite de tests de Prepalog — bloc « visibilite » : l'enseignant voit TOUTES les activités
// (02/10/2026, demande de Tristan : « possible que les enseignants voient tout ? »), les élèves
// seulement celles qui leur sont ouvertes. `node outils/test.mjs visibilite` ne lance que ce bloc.
//
// Ce que ces cas gardent :
//   - une séance en préparation (`pret: false`) a sa tuile chez l'enseignant, avec « Cachée aux
//     élèves : en préparation », et reste invisible aux élèves ;
//   - une séance fermée pour le groupe garde sa tuile chez l'enseignant (« fermée pour ce groupe ») ;
//   - dans la conduite de séance, la case d'une séance en préparation est grisée : avant, elle se
//     laissait cocher, se redécochait, et un second clic enregistrait « fermée » sans le montrer
//     (constaté par Tristan le 02/10 sur ENT-2.2).
// Il travaille sur les vraies métas du registre : la séance « en préparation » est cherchée parmi
// celles qui ont `pret: false` au moment du test (aucune → le cas le dit, il ne passe pas à vide).
//
// Depuis le 03/10/2026, plus aucune séance du registre n'est en préparation (ENT-2.1, ENT-2.3 et
// ENT-3.2 ouvertes). Pour que le bloc garde de quoi éprouver, le navigateur de test reçoit ENT-2.3
// (`cdiscount-regularise.js`) avec `pret: false` : le fichier servi est le vrai, seul ce drapeau
// est réécrit, et dans ce contexte de test seulement. Rien n'est modifié dans le dépôt.

export default async function bloc({ v, nav }) {

const ctxV = await nav.newContext({ viewport: { width: 1280, height: 900 } });
const pg = await ctxV.newPage();
pg.setDefaultTimeout(6000);
const erreursV = [];
let prepaForcee = false;
await ctxV.route('**/activites/cdiscount-regularise.js*', async (route) => {
  const r = await route.fetch();
  const corps = await r.text();
  prepaForcee = /pret:\s*true,/.test(corps);
  await route.fulfill({ response: r, body: corps.replace(/pret:\s*true,/, 'pret: false,') });
});
pg.on('pageerror', (e) => erreursV.push('PAGEERROR: ' + e.message));
pg.on('dialog', (d) => d.accept());
await pg.goto('http://127.0.0.1:8099/');
await pg.waitForSelector('#btnProf', { timeout: 8000 });

const metas = await pg.evaluate(async () => (await (await import('/activites/index.js')).chargerActivites())
  .map((m) => ({ id: m.meta.id, code: m.meta.code, pret: !!m.meta.pret, rubrique: m.meta.rubrique })));
const prepa = metas.find((m) => !m.pret && m.rubrique === 'logisim') || metas.find((m) => !m.pret);
// Logisim est rangé par entreprise (02/10/2026) : le premier nombre du code dit l'entreprise.
const entDe = (m) => (m && m.rubrique === 'logisim' ? String(((m.code || '').match(/-(\d+)/) || [])[1]) : null);
// Une séance prête de la même rubrique (et de la même entreprise), qu'on fermera pour le groupe.
const prete = metas.find((m) => m.pret && m.rubrique === (prepa || {}).rubrique && m.id !== (prepa || {}).id
  && entDe(m) === entDe(prepa));

const tuiles = () => pg.$$eval('.module-tile', (els) => els.map((e) => ({
  id: e.dataset.act, cachee: e.querySelector('[data-cachee]')?.dataset.cachee || null })));
// Retour à l'accueil d'où que l'on soit : la liste d'une entreprise ne mène qu'aux logos.
const versAccueil = async () => {
  if (await pg.$('#btnLogisim')) await pg.click('#btnLogisim');
  await pg.click('#btnAccueil');
};
const ouvrirRubrique = async (rub, ent) => {
  await pg.click('#btnAccueil').catch(() => {});
  await pg.waitForSelector(`[data-rub="${rub}"]`);
  await pg.click(`[data-rub="${rub}"]`);
  if (ent) await pg.click(`[data-ent="${ent}"]`);   // Logisim : le logo de l'entreprise
  await pg.waitForSelector('.module-tile, .ent-bandeau');
};

await v('visibilité : il existe une séance en préparation à éprouver', async () => {
  if (!prepa) throw new Error('aucune séance `pret: false` dans le registre : ce bloc ne prouve rien tant qu’il n’y en a pas');
  if (!prepaForcee && prepa.id === 'cdiscount-regularise') throw new Error('ENT-2.3 n’a pas été mise « en préparation » pour le test');
  if (!prete) throw new Error('aucune séance prête dans la rubrique ' + prepa.rubrique);
});

await v('visibilité : l’enseignant voit la séance en préparation, étiquetée « cachée aux élèves »', async () => {
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
  const x = t.find((y) => y.id === prepa.id);
  if (!x) throw new Error(`${prepa.code} absente chez l’enseignant : ` + t.map((y) => y.id).join(', '));
  if (x.cachee !== 'en préparation') throw new Error('étiquette : ' + x.cachee);
  const p = t.find((y) => y.id === prete.id);
  if (!p || p.cachee) throw new Error(`${prete.code} : ` + JSON.stringify(p));
});

await v('visibilité : la case d’une séance en préparation est grisée dans la conduite de séance', async () => {
  await versAccueil();
  await pg.click('#btnProfEspace');
  await pg.click('[data-ong="seance"]');
  await pg.waitForSelector(`[data-ouvre="${prepa.id}"]`);
  const c = await pg.$eval(`[data-ouvre="${prepa.id}"]`, (e) => ({ dis: e.disabled, coche: e.checked,
    etiq: e.closest('label').textContent.replace(/\s+/g, ' ') }));
  if (!c.dis || c.coche) throw new Error('case : ' + JSON.stringify(c));
  if (!/en préparation/.test(c.etiq)) throw new Error('étiquette : ' + c.etiq);
  // On ferme la séance prête pour ce groupe : elle doit rester visible chez l'enseignant.
  await pg.uncheck(`[data-ouvre="${prete.id}"]`);
  await pg.waitForFunction((id) => !document.querySelector(`[data-ouvre="${id}"]`).checked, prete.id);
});

await v('visibilité : une séance fermée garde sa tuile chez l’enseignant, « fermée pour ce groupe »', async () => {
  await pg.click('#btnRetour');
  await ouvrirRubrique(prepa.rubrique, entDe(prepa));
  const t = await tuiles();
  const p = t.find((y) => y.id === prete.id);
  if (!p || p.cachee !== 'fermée pour ce groupe') throw new Error(JSON.stringify(p));
});

await v('visibilité : l’élève ne voit ni la séance en préparation ni la séance fermée', async () => {
  await versAccueil();
  await pg.click('#btnDeco');
  await pg.waitForSelector('#mat');
  await pg.fill('#mat', '3901');
  await pg.fill('#code', 'vv01');
  await pg.click('#btnEleve');
  await pg.waitForSelector('text=Bonjour Élève');
  const ids = await pg.evaluate(() => [...document.querySelectorAll('[data-rub]')].map((b) => b.dataset.rub));
  if (ids.includes(prepa.rubrique)) {
    await pg.click(`[data-rub="${prepa.rubrique}"]`);
    await pg.waitForTimeout(400);
    // Logisim : une entreprise dont aucune séance n'est ouverte à l'élève n'a pas de carte.
    const ent = entDe(prepa);
    if (ent && await pg.$(`[data-ent="${ent}"]`)) { await pg.click(`[data-ent="${ent}"]`); await pg.waitForTimeout(400); }
  }
  const t = await tuiles();
  if (t.some((y) => y.id === prepa.id || y.id === prete.id)) throw new Error('visible à l’élève : ' + t.map((y) => y.id).join(', '));
  if (t.some((y) => y.cachee)) throw new Error('étiquette d’enseignant chez l’élève');
});

await v('visibilité : aucune erreur JavaScript', async () => {
  if (erreursV.length) throw new Error(erreursV.slice(0, 3).join(' / '));
});

await ctxV.close();
}
