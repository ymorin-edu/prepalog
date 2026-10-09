// Suite de tests de Prepalog — bloc « tirage-niveaux » : chantier D-C (brief `docs/briefs/MOTEUR-tirage-et-niveaux.md`,
// 09/10/2026). `node outils/test.mjs tirage-niveaux` ne lance que ce bloc.
//
// Lot 2 — tirage mémorisé (banques, pièce fixe, mélange, cas bonus du confirmé), séance d'essai `contenus/tirage-essai.js`.
// Lot 3 — bonus dans la note (+0,5 par cas juste, plafond +2, note ≤ 20, règle du premier bilan), caché à l'élève.
//
// Lot 1 — niveau par scénario : le profil range `niveaux: { '<n° entreprise>': 'confirme' | 'accompagne' }` ; l'onglet
// « Niveaux » de l'enseignant (élèves × entreprises), la migration sans écriture de l'ancien `aisance`, le réglage d'un
// demi-groupe d'un coup, la proposition « Confirmé » ; `ctx.aisance` = le niveau du scénario de la séance ouverte, figé
// dans `db.aisance` à la première ouverture (un changement vaut à la séance suivante).
//
// Pour lire le contexte d'une séance, `core/app.js` est servi à CE navigateur de test avec une ligne de plus (comme le
// bloc `amenagements`) ; `activites/picard-ent42.js` y est servi avec `niveauxPrevus: ['confirme']` (une séance qui
// déclare des niveaux fait apparaître son entreprise en colonne). Rien n'est modifié dans le dépôt.
//
// Valeurs attendues écrites à la main.

export default async function bloc({ v, nav, BASE, ROOT, egal, vrai }) {

const ctxN = await nav.newContext({ viewport: { width: 1366, height: 900 } });
let espion = false, picardDeclare = false;
await ctxN.route('**/core/app.js*', async (route) => {
  const r = await route.fetch();
  const corps = await r.text();
  const ancre = "m.rendre(document.getElementById('hoteActivite'), ctx);";
  espion = corps.includes(ancre);
  await route.fulfill({ response: r, body: corps.replace(ancre, `${ancre}
  try { const b = ctx.jeu && ctx.jeu.etat ? ctx.jeu.etat() : {};
    window.__ctxN = { id: m.meta.id, aisance: ctx.aisance, db: b.aisance, pour: b.aisancePour,
      moves: (b.moves || []).length, mails: (b.mails || []).length, stock: JSON.stringify(b.stock || {}) };
  } catch (e) { window.__ctxN = { erreur: e.message }; }`) });
});
await ctxN.route('**/activites/picard-ent42.js*', async (route) => {
  const r = await route.fetch();
  const corps = await r.text();
  const ancre = "id: 'picard-ent42',";
  picardDeclare = corps.includes(ancre);
  await route.fulfill({ response: r, body: corps.replace(ancre, `${ancre} niveauxPrevus: ['confirme'],`) });
});
const pg = await ctxN.newPage();
pg.setDefaultTimeout(7000);
const erreursN = [];
pg.on('pageerror', (e) => erreursN.push('PAGEERROR: ' + e.message));
pg.on('dialog', (d) => d.accept());
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

// Les élèves du groupe « NIV 1 » : N1, N2 en 1L1 ; N3 en 1L2 ; N4 sans demi-groupe (ancien profil `aisance`).
// P1 à P6 servent à la proposition (résultats posés à la main dans le stockage de démonstration).
const EL = { N1: ['4911', 'nv01'], N2: ['4912', 'nv02'], N3: ['4913', 'nv03'], N4: ['4914', 'nv04'],
  P1: ['4921', 'pp01'], P2: ['4922', 'pp02'], P3: ['4923', 'pp03'], P4: ['4924', 'pp04'], P5: ['4925', 'pp05'], P6: ['4926', 'pp06'] };
const users = () => pg.evaluate(() => JSON.parse(localStorage.getItem('prepalog:users') || '{}'));
const uidDe = async (k) => { const u = await users(); return Object.keys(u).find((x) => u[x].matricule === EL[k][0]); };
const profilDe = async (k) => (await users())[await uidDe(k)];
const groupe = () => pg.evaluate(() => Object.entries(JSON.parse(localStorage.getItem('prepalog:groupes') || '{}'))
  .map(([id, g]) => ({ ...g, id })).find((g) => g.nom === 'NIV 1'));

const versAccueil = async () => {
  await pg.goto(BASE);
  await pg.waitForSelector('#btnProf, #btnDeco', { timeout: 8000 });
};
const commeEleve = async (k) => {
  await versAccueil();
  if (await pg.$('#btnDeco')) { await pg.click('#btnDeco'); }
  await pg.waitForSelector('#mat');
  await pg.fill('#mat', EL[k][0]);
  await pg.fill('#code', EL[k][1]);
  await pg.click('#btnEleve');
  await pg.waitForSelector('text=Bonjour');
};
const commeProf = async () => {
  await versAccueil();
  if (await pg.$('#btnDeco')) await pg.click('#btnDeco');
  await pg.waitForSelector('#btnProf');
  await pg.click('#btnProf');
  await pg.waitForSelector('#btnProfEspace');
};
const ongletProf = async (o) => {
  if (!(await pg.$('[data-ong]'))) { await pg.click('#btnProfEspace'); }
  await pg.click(`[data-ong="${o}"]`);
  if (o === 'niveaux') await pg.waitForSelector('[data-niveaux], .vide');
};
// L'élève connecté ouvre une séance d'entreprise par l'accueil (Simulog, logo, tuile) ; rend ce qu'elle a reçu.
const ouvrir = async (ent, aid) => {
  await versAccueil();
  await pg.evaluate(() => { window.__ctxN = null; });
  await pg.click('[data-rub="simulog"]');
  await pg.click(`[data-ent="${ent}"]`);
  await pg.click(`[data-act="${aid}"]`);
  await pg.waitForFunction(() => window.__ctxN);
  return pg.evaluate(() => window.__ctxN);
};
const choisir = async (k, n, niveau) => {
  const uid = await uidDe(k);
  await pg.selectOption(`[data-niveau-eleve="${uid}"][data-scenario="${n}"]`, niveau);
  await pg.waitForFunction(({ uid, n, niveau }) => {
    const x = JSON.parse(localStorage.getItem('prepalog:users') || '{}')[uid];
    const vu = (x.niveaux && x.niveaux[n]) || 'standard';
    return vu === niveau;
  }, { uid, n, niveau });
};

await v('Niveaux : l’onglet montre élèves × entreprises (Cdiscount, plus celles dont une séance déclare des niveaux), tout en Standard', async () => {
  vrai(espion, 'core/app.js n’a plus la ligne qui ouvre la séance : le relevé du contexte est à revoir');
  await pg.click('#btnProf');
  await pg.waitForSelector('#btnProfEspace');
  await pg.click('#btnProfEspace');
  await pg.waitForSelector('#gNom');
  await pg.fill('#gNom', 'NIV 1');
  await pg.click('#btnCreerG');
  await pg.waitForSelector('text=NIV 1');
  await pg.click('[data-ong="comptes"]');
  await pg.waitForSelector('#lot');
  await pg.fill('#lot', Object.entries(EL).map(([k, [m, c]]) => `NIV${k} ; ${k} ; ${m} ; ${c}`).join('\n'));
  await pg.click('#btnLot');
  await pg.waitForSelector('[data-tiers]');
  // Deux demi-groupes, posés comme le ferait l'onglet Groupes : N1, N2 en 1L1 ; N3 en 1L2 ; N4 et les P sans.
  const g = await groupe();
  const [u1, u2, u3] = [await uidDe('N1'), await uidDe('N2'), await uidDe('N3')];
  await pg.evaluate(async ({ gid, u1, u2, u3 }) => {
    const { B } = await import('/core/backend.js');
    await B.majGroupe(gid, { demis: [{ id: 'dn1', nom: '1L1' }, { id: 'dn2', nom: '1L2' }], demiDe: { [u1]: 'dn1', [u2]: 'dn1', [u3]: 'dn2' } });
  }, { gid: g.id, u1, u2, u3 });
  // L'enseignant ouvre aux élèves les trois séances dont les cas ont besoin (« Conduite de séance »).
  await commeProf();
  await ongletProf('seance');
  for (const id of ['cdiscount-mouvements', 'cdiscount-chiffres', 'picard-ent42']) {
    await pg.waitForSelector(`[data-ouvre="${id}"]`);
    if (!(await pg.isChecked(`[data-ouvre="${id}"]`))) {
      await pg.check(`[data-ouvre="${id}"]`);
      await pg.waitForFunction((x) => document.querySelector(`[data-ouvre="${x}"]`).checked, id);
      await pg.waitForTimeout(250);
    }
  }
  await ongletProf('niveaux');
  vrai(picardDeclare, 'activites/picard-ent42.js n’a plus la ligne « id » attendue : la déclaration d’essai est à revoir');
  const cols = await pg.$$eval('[data-col-scenario]', (L) => L.map((x) => x.dataset.colScenario));
  egal(cols, ['2', '4'], 'colonnes');
  const noms = await pg.$$eval('[data-col-scenario] strong', (L) => L.map((x) => x.textContent.trim()));
  egal(noms, ['Cdiscount', 'Picard'], 'en-têtes');
  const valeurs = await pg.$$eval('[data-niveau-eleve]', (L) => [...new Set(L.map((s) => s.value))]);
  egal(valeurs, ['standard'], 'valeurs');
  egal(await pg.$$eval('[data-niveau-eleve]', (L) => L.length), 2 * Object.keys(EL).length, 'cases');
  egal(await pg.$$eval('[data-niveau-eleve] option', (L) => [...new Set(L.map((o) => o.textContent.trim()))]),
    ['Standard', 'Confirmé', 'Accompagné'], 'choix');
  vrai(/prochaine séance ouverte par l.élève/.test(await pg.textContent('#contenuProf')), 'phrase « Un changement vaut… »');
});

await v('Niveaux : confirmé chez Cdiscount et standard chez Picard → la séance reçoit « confirme » en 2.x, « standard » en 4.x', async () => {
  await choisir('N1', '2', 'confirme');
  // Enregistré sans redessiner : la liste est toujours là, avec sa valeur.
  egal(await pg.$eval(`[data-niveau-eleve="${await uidDe('N1')}"][data-scenario="2"]`, (s) => s.value), 'confirme', 'liste');
  egal((await profilDe('N1')).niveaux, { 2: 'confirme' }, 'profil');
  await commeEleve('N1');
  const c2 = await ouvrir('2', 'cdiscount-mouvements');
  egal([c2.id, c2.aisance, c2.db, c2.pour], ['cdiscount-mouvements', 'confirme', 'confirme', 'cdiscount-mouvements'], 'ENT-2.1');
  const c4 = await ouvrir('4', 'picard-ent42');
  egal([c4.id, c4.aisance, c4.db], ['picard-ent42', 'standard', 'standard'], 'ENT-4.2');
});

await v('Niveaux : un changement vaut à la séance suivante — la séance commencée garde son niveau', async () => {
  await commeEleve('N2');
  const a = await ouvrir('2', 'cdiscount-mouvements');
  egal([a.aisance, a.db], ['standard', 'standard'], '1re ouverture');
  await commeProf();
  await ongletProf('niveaux');
  await choisir('N2', '2', 'confirme');
  await commeEleve('N2');
  const b = await ouvrir('2', 'cdiscount-mouvements');
  egal([b.aisance, b.db], ['confirme', 'standard'], 'séance commencée');
  const c = await ouvrir('2', 'cdiscount-chiffres');
  egal([c.aisance, c.db], ['confirme', 'confirme'], 'séance suivante');
});

await v('Niveaux : « Accompagné » reçoit le contenu standard (même base, mêmes messages, même stock), le niveau est figé', async () => {
  await commeProf();
  await ongletProf('niveaux');
  await choisir('N3', '2', 'accompagne');
  await commeEleve('N3');
  const acc = await ouvrir('2', 'cdiscount-mouvements');
  egal([acc.aisance, acc.db], ['accompagne', 'accompagne'], 'accompagné');
  await commeEleve('N4');   // N4 est encore standard partout à ce moment
  const std = await ouvrir('2', 'cdiscount-mouvements');
  egal(std.db, 'standard', 'témoin standard');
  egal([acc.moves, acc.mails, acc.stock], [std.moves, std.mails, std.stock], 'contenu');
  const conf = (await (async () => { await commeEleve('N1'); return ouvrir('2', 'cdiscount-mouvements'); })());
  vrai(conf.moves !== std.moves || conf.mails !== std.mails || conf.stock !== std.stock, 'le confirmé a le même contenu que le standard : le témoin ne prouve rien');
});

await v('Niveaux : migration — ancien profil « aisance: confirme » lu comme Cdiscount confirmé ; au premier réglage, `aisance` disparaît, le reste demeure', async () => {
  // N4 : comme un profil réglé avant le 09/10/2026 (niveau unique), avec un tiers-temps.
  const u4 = await uidDe('N4');
  await pg.evaluate((u) => {
    const U = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
    U[u] = { ...U[u], aisance: 'confirme', tiersTemps: true };
    delete U[u].niveaux;
    localStorage.setItem('prepalog:users', JSON.stringify(U));
  }, u4);
  // Sans aucune écriture, l'élève est confirmé chez Cdiscount (séance pas encore ouverte : ENT-2.2).
  await commeEleve('N4');
  const c = await ouvrir('2', 'cdiscount-chiffres');
  egal([c.aisance, c.db], ['confirme', 'confirme'], 'lecture migrée');
  const avant = await profilDe('N4');
  egal([avant.aisance, avant.niveaux], ['confirme', undefined], 'rien d’écrit à la lecture');
  await commeProf();
  await ongletProf('niveaux');
  egal(await pg.$eval(`[data-niveau-eleve="${u4}"][data-scenario="2"]`, (s) => s.value), 'confirme', 'case Cdiscount');
  egal(await pg.$eval(`[data-niveau-eleve="${u4}"][data-scenario="4"]`, (s) => s.value), 'standard', 'case Picard');
  await choisir('N4', '4', 'accompagne');
  const apres = await profilDe('N4');
  vrai(!('aisance' in apres), 'aisance encore là : ' + JSON.stringify(apres));
  egal(apres.niveaux, { 2: 'confirme', 4: 'accompagne' }, 'niveaux');
  // Ce qui reste : tiers-temps, identité, groupe.
  egal([apres.tiersTemps, apres.prenom, apres.matricule, apres.role, (apres.groupes || []).length],
    [true, 'N4', EL.N4[0], 'eleve', 1], 'ce qui reste');
});

await v('Niveaux : « Tout 1L1 → Confirmé » chez Picard change N1 et N2, pas N3 (1L2), ni N4 (sans demi-groupe) ; « Annuler » ne change rien', async () => {
  const s = '[data-col-scenario="4"]';
  // Annuler d'abord.
  await pg.selectOption(`${s} [data-lot-demi]`, 'dn1');
  await pg.selectOption(`${s} [data-lot-niveau]`, 'confirme');
  await pg.click(`${s} [data-lot]`);
  await pg.waitForSelector(`${s} [data-lot-phrase]`);
  egal((await pg.textContent(`${s} [data-lot-phrase]`)).replace(/\s+/g, ' ').trim(),
    '2 élèves de 1L1 passent en Confirmé chez Picard à leur prochaine séance.', 'phrase');
  await pg.click(`${s} [data-lot-annuler]`);
  egal(((await profilDe('N1')).niveaux || {})['4'], undefined, 'annulé');
  await pg.click(`${s} [data-lot]`);
  const u2 = await uidDe('N2');
  await pg.click(`${s} [data-lot-oui]`);
  await pg.waitForFunction((u) => { const x = JSON.parse(localStorage.getItem('prepalog:users'))[u]; return x.niveaux && x.niveaux['4'] === 'confirme'; }, u2);
  await pg.waitForSelector(`[data-niveau-eleve="${u2}"][data-scenario="4"]`);
  const P = await users();
  const niv = async (k) => (P[await uidDe(k)].niveaux || {})['4'] || 'standard';
  egal([await niv('N1'), await niv('N2'), await niv('N3'), await niv('N4')], ['confirme', 'confirme', 'standard', 'accompagne'], 'après');
  // Ce qui reste : leurs niveaux chez Cdiscount.
  egal([P[await uidDe('N1')].niveaux['2'], P[await uidDe('N2')].niveaux['2'], P[await uidDe('N3')].niveaux['2']],
    ['confirme', 'confirme', 'accompagne'], 'Cdiscount intact');
  egal(await pg.$eval(`[data-niveau-eleve="${await uidDe('N2')}"][data-scenario="4"]`, (x) => x.value), 'confirme', 'écran');
});

// La proposition : résultats posés à la main (deux séances Picard que personne n'a ouvertes, ENT-4.1 et ENT-4.3, temps
// en secondes). Médianes : ENT-4.1 [200, 220, 240, 900, 950, 1000] → 570 s ; ENT-4.3 [200, 350, 900, 950, 1000] → 900 s.
// P2 : une seule séance ; P3 : rapide mais 12/20 ; P5 : 17/20 mais lent ; P4 et P6 : 15/20, lents.
await v('Niveaux : proposition — 2 séances ≥ 16 et temps sous la médiane → « proposé : Confirmé » ; 1 seule → rien ; rapide à 12/20 → rien ; « Appliquer » enregistre', async () => {
  const g = await groupe();
  const T = {
    P1: { 'picard-ent41': [17, 240], 'picard-ent43': [18, 350, 16.5] },
    P2: { 'picard-ent41': [17, 220] },
    P3: { 'picard-ent41': [12, 200], 'picard-ent43': [12, 200] },
    P4: { 'picard-ent41': [15, 900], 'picard-ent43': [15, 900] },
    P5: { 'picard-ent41': [17, 1000], 'picard-ent43': [17, 1000] },
    P6: { 'picard-ent41': [15, 950], 'picard-ent43': [15, 950] },
  };
  const lignes = [];
  for (const [k, L] of Object.entries(T)) {
    const uid = await uidDe(k);
    Object.entries(L).forEach(([aid, [note, temps, note1]]) => lignes.push({ uid, aid, note, temps, note1 }));
  }
  await pg.evaluate(({ gid, lignes }) => {
    const idx = JSON.parse(localStorage.getItem(`prepalog:travauxIdx/${gid}`) || '[]');
    lignes.forEach(({ uid, aid, note, temps, note1 }) => {
      const ind = { temps };
      if (typeof note1 === 'number') ind.note1 = note1;
      localStorage.setItem(`prepalog:travaux/${gid}/${uid}/${aid}`, JSON.stringify({ uid, aid, gid, score: note, max: 20, meilleur: note,
        tentatives: 1, detail: { indicateurs: { [aid]: ind } }, dateMaj: Date.now() }));
      if (!idx.includes(`${uid}|${aid}`)) idx.push(`${uid}|${aid}`);
    });
    localStorage.setItem(`prepalog:travauxIdx/${gid}`, JSON.stringify(idx));
  }, { gid: g.id, lignes });
  await commeProf();
  await ongletProf('niveaux');
  const marques = await pg.$$eval('[data-proposition]', (L) => L.map((x) => x.dataset.proposition));
  const u1 = await uidDe('P1');
  egal(marques, [`${u1}|4`], 'marques');
  const m = `[data-proposition="${u1}|4"]`;
  egal((await pg.textContent(`${m} summary`)).trim(), 'proposé : Confirmé', 'marque');
  // Ce qui la fonde : les deux séances, leur premier bilan (note1 d'abord), le temps de l'élève et la médiane du groupe.
  await pg.click(`${m} summary`);
  const fond = (await pg.textContent(m)).replace(/\s+/g, ' ');
  vrai(/ENT-4\.1 : premier bilan 17\/20, temps 4 min \(médiane du groupe 10 min\) — retenue/.test(fond), 'ENT-4.1 : ' + fond);
  vrai(/ENT-4\.3 : premier bilan 16,5\/20, temps 6 min \(médiane du groupe 15 min\) — retenue/.test(fond), 'ENT-4.3 : ' + fond);
  // Rien n'a changé sans clic.
  egal((await profilDe('P1')).niveaux, undefined, 'avant le clic');
  await pg.click(`${m} [data-appliquer]`);
  await pg.waitForFunction((u) => { const x = JSON.parse(localStorage.getItem('prepalog:users'))[u]; return x.niveaux && x.niveaux['4'] === 'confirme'; }, u1);
  vrai(!(await pg.$(m)), 'la marque reste après « Appliquer »');
  egal(await pg.$eval(`[data-niveau-eleve="${u1}"][data-scenario="4"]`, (x) => x.value), 'confirme', 'liste');
  // La règle elle-même, sur le réglage unique (sans l'écran).
  const r = await pg.evaluate(async () => {
    const A = await import('/core/amenagements.js');
    const metas = [{ id: 'a', code: 'ENT-6.1', bareme: 20 }, { id: 'b', code: 'ENT-6.2', bareme: 20 }];
    const res = { u: { a: [16, 100], b: [16, 100] }, v: { a: [10, 300], b: [10, 300] }, w: { a: [10, 500], b: [10, 500] } };
    const travaux = (uid, aid) => { const x = res[uid] && res[uid][aid]; return x ? { meilleur: x[0], max: 20, detail: { indicateurs: { [aid]: { temps: x[1] } } } } : null; };
    const p = (profil) => A.proposition({ profil, uid: 'u', n: '6', seances: metas, travaux, uids: ['u', 'v', 'w'] });
    return { std: !!p({}), conf: !!p({ niveaux: { 6: 'confirme' } }), acc: !!p({ niveaux: { 6: 'accompagne' } }), reglage: A.PROPOSITION };
  });
  egal(r, { std: true, conf: false, acc: false, reglage: { seances: 2, noteMin: 16, temps: 'mediane' } }, 'règle');
});

await v('Niveaux : l’onglet ne sort pas — rien dans le Suivi de classe ni dans l’export de la liste ; l’élève ne voit nulle part son niveau', async () => {
  await ongletProf('suivi');
  await pg.waitForTimeout(300);
  const t = await pg.textContent('#contenuProf');
  vrai(!/Confirmé|Accompagné|proposé/.test(t), 'le suivi parle du niveau');
  vrai(!(await pg.$('#contenuProf [data-niveau-eleve], #contenuProf [data-proposition]')), 'case de niveau dans le suivi');
  await commeEleve('N1');
  const texte = await pg.textContent('body');
  vrai(!/Confirmé|Accompagné|niveau\s*:/i.test(texte), 'l’accueil élève parle du niveau');
  vrai(!(await pg.$('[data-ong="niveaux"]')), 'onglet Niveaux visible de l’élève');
});

await v('Niveaux : aucune erreur JavaScript', async () => {
  if (erreursN.length) throw new Error(erreursN.slice(0, 3).join(' / '));
});

await ctxN.close();

// ════════════════════════════════════════════════════════════════════════════════════ lot 2 : tirage mémorisé
// La séance d'essai `contenus/tirage-essai.js` (tri de CV : la pièce fixe cv-yanis + 1 facile, 2 moyens, 1 difficile ;
// bonus du confirmé : 1 moyen, 1 difficile) montée dans la page, avec la fabrique et le moteur réels.
const ctxT = await nav.newContext({ viewport: { width: 1366, height: 900 } });
// Pour l'onglet Corrigés et l'accueil : la séance d'essai servie comme ACTIVITÉ à ce navigateur seulement (le registre
// reçoit une ligne de plus, le fichier d'activité est fabriqué ici). Rien n'est ajouté au dépôt.
let registreTouche = false;
await ctxT.route('**/activites/index.js*', async (route) => {
  const r = await route.fetch();
  const corps = await r.text();
  const ancre = 'export const ACTIVITES = [';
  registreTouche = corps.includes(ancre);
  await route.fulfill({ response: r, body: corps.replace(ancre, `${ancre}\n  () => import('./essai-tirage-injecte.js'),`) });
});
await ctxT.route('**/activites/essai-tirage-injecte.js*', (route) => route.fulfill({ contentType: 'text/javascript', body: `
import { seanceEntreprise } from '../core/types/seance-entreprise.js';
import { ESSAI } from '../contenus/tirage-essai.js';
const s = seanceEntreprise(ESSAI.UNIVERS, ESSAI.SEANCE, { ...ESSAI.META, corrige: './contenus/tirage-essai.js', pret: true }, ESSAI.OPTIONS);
export const meta = s.meta;
export const rendre = s.rendre;
` }));
const pt = await ctxT.newPage();
pt.setDefaultTimeout(7000);
const erreursT = [];
const suivreErreurs = (p, nom) => {
  p.on('pageerror', (e) => erreursT.push(`PAGEERROR ${nom}: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursT.push(`CONSOLE ${nom}: ${m.text()}`); });
  p.on('dialog', (d) => d.accept());
};
suivreErreurs(pt, 'essai');
await pt.goto(BASE);
await pt.waitForSelector('#btnProf', { timeout: 8000 });

// Monte la séance d'essai (fabrique + moteur) avec une base donnée ; rend la base et les scores remontés.
// `o.variante` : options de `essai()` (banque enrichie, pièce supprimée…) ; `o.aisance`, `o.uid`, `o.role`.
const monter = (o = {}, p = pt) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const { composerSeance } = await import('/core/types/seance-entreprise.js');
  const { essai } = await import('/contenus/tirage-essai.js');
  document.querySelector('#tTest')?.remove();
  document.body.classList.remove('immersion');
  const hote = document.createElement('div'); hote.id = 'tTest'; document.body.prepend(hote);
  const E = essai(o.variante || {});
  const { meta, options } = composerSeance(E.UNIVERS, E.SEANCE, E.META, E.OPTIONS);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  window.__t = { db, enregistres: [], E };
  const ctx = {
    meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__t.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'ESSAI',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  };
  const M = creerEntreprise(options);
  window.__t.M = M;
  M.rendre(hote, ctx);
  const rec = db.tirages && db.tirages[meta.id];
  return { db: JSON.parse(JSON.stringify(db)), rec: rec ? JSON.parse(JSON.stringify(rec)) : null,
    socle: E.TIRAGE.piecesTirees(db, 'cv').map((x) => x.id), bonus: E.TIRAGE.piecesBonus(db, 'cv').map((x) => x.id),
    valeurs: E.TIRAGE.valeursTirees(db), avis: hote.querySelector('.avis-err')?.textContent || '' };
}, o, p);
const DIFF = (id) => (id === 'cv-yanis' ? 'fixe' : id.slice(3, 4) === 'f' ? 'facile' : id.slice(3, 4) === 'm' ? 'moyen' : 'difficile');

await v('Tirage : équité sur 300 graines — la pièce fixe toujours là, 1 facile + 2 moyens + 1 difficile, zéro secours ; confirmé = même socle + 1 moyen + 1 difficile', async () => {
  const r = await pt.evaluate(async () => {
    const { essai } = await import('/contenus/tirage-essai.js');
    const T = essai().TIRAGE;
    const out = [];
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}|essai-tirage`;
      out.push({ s: T.tirer(g), c: T.tirer(g, { confirme: true }) });
    }
    return out;
  });
  const fautes = [];
  const sets = new Set(), places = new Set();
  r.forEach(({ s, c }, i) => {
    const L = s.pieces.cv;
    const compte = (l, d) => l.filter((x) => DIFF(x) === d).length;
    if (s.secours || c.secours) fautes.push(`${i} : secours`);
    if (L.length !== 5 || new Set(L).size !== 5) fautes.push(`${i} : ${L}`);
    if (!L.includes('cv-yanis')) fautes.push(`${i} : sans la pièce fixe`);
    if ([compte(L, 'facile'), compte(L, 'moyen'), compte(L, 'difficile')].join() !== '1,2,1') fautes.push(`${i} : mélange ${L}`);
    if (s.bonus) fautes.push(`${i} : un standard a des bonus`);
    if (JSON.stringify(c.pieces) !== JSON.stringify(s.pieces) || JSON.stringify(c.valeurs) !== JSON.stringify(s.valeurs)) fautes.push(`${i} : le confirmé n'a pas le même socle`);
    const B = (c.bonus || {}).cv || [];
    if (B.length !== 2 || compte(B, 'moyen') !== 1 || compte(B, 'difficile') !== 1 || B.some((x) => L.includes(x))) fautes.push(`${i} : bonus ${B}`);
    if (!(s.valeurs.postes >= 2 && s.valeurs.postes <= 4)) fautes.push(`${i} : valeurs ${JSON.stringify(s.valeurs)}`);
    sets.add(L.slice().sort().join());
    places.add(L.indexOf('cv-yanis'));
  });
  if (fautes.length) throw new Error(fautes.slice(0, 5).join(' / '));
  // 4 × 15 × 4 = 240 socles possibles : 300 tirages en donnent environ 170 distincts.
  vrai(sets.size >= 120, `élèves différents, tirages trop semblables : ${sets.size} jeux distincts sur 300`);
  egal([...places].sort(), [0, 1, 2, 3, 4], 'places de la pièce fixe (ordre « melange »)');
});

await v('Tirage : rangé à la première ouverture, jamais refait — banque enrichie de 10 pièces et mélange changé, rechargement, autre poste : mêmes pièces', async () => {
  const a = await monter({ uid: 'u-memo' });
  vrai(a.rec && a.rec.graine === 'u-memo|essai-tirage', 'graine : ' + JSON.stringify(a.rec && a.rec.graine));
  egal(a.rec.pieces.cv, a.socle, 'ids rangés = pièces lues');
  vrai(!('bonus' in a.rec), 'un standard a une clé bonus');
  // La banque change : 10 pièces de plus, un mélange différent. L'élève garde son tirage.
  const b = await monter({ uid: 'u-memo', db: a.db, variante: { plus: 10, melange: { facile: 2, moyen: 1, difficile: 1 } } });
  egal([b.socle, b.valeurs, b.rec.at], [a.socle, a.valeurs, a.rec.at], 'après enrichissement');
  // Pour preuve que la variante tire autre chose : une base neuve du même élève reçoit 2 faciles.
  const neuve = await monter({ uid: 'u-memo', variante: { plus: 10, melange: { facile: 2, moyen: 1, difficile: 1 } } });
  egal(neuve.socle.filter((x) => DIFF(x) === 'facile' || /^cv-n/.test(x)).length >= 2, true, 'la variante ne change rien : le cas ne prouve rien');
  // Rechargement (module neuf, même base) et autre poste (autre page).
  const c = await monter({ uid: 'u-memo', db: a.db });
  egal(c.socle, a.socle, 'rechargement');
  const poste = await ctxT.newPage();
  suivreErreurs(poste, 'poste');
  await poste.goto(BASE);
  await poste.waitForSelector('#btnProf', { timeout: 8000 });
  const d = await monter({ uid: 'u-memo', db: a.db }, poste);
  await poste.close();
  egal([d.socle, d.valeurs], [a.socle, a.valeurs], 'autre poste');
  // Élèves différents : tirages différents (graine = élève + séance).
  const autres = new Set();
  for (let i = 0; i < 12; i++) autres.add((await monter({ uid: `u-autre-${i}` })).socle.join());
  vrai(autres.size >= 9, `12 élèves, ${autres.size} tirages distincts`);
});

await v('Tirage : « Réinitialiser » efface le tirage avec le reste et le refait aussitôt, de la même graine', async () => {
  const a = await monter({ uid: 'u-raz' });
  await pt.click('#tTest [data-raz]');
  await pt.waitForTimeout(150);
  const apres = await pt.evaluate(() => JSON.parse(JSON.stringify(window.__t.db.tirages['essai-tirage'])));
  vrai(apres.at >= a.rec.at, 'tirage pas refait');
  egal([apres.pieces, apres.graine], [a.rec.pieces, a.rec.graine], 'même graine, même banque : mêmes pièces');
});

await v('Tirage : une pièce rangée devenue introuvable est remplacée par une de même difficulté, notée, la séance s’ouvre', async () => {
  const a = await monter({ uid: 'u-perdu' });
  const perdue = a.socle.find((x) => DIFF(x) === 'moyen');
  const b = await monter({ uid: 'u-perdu', db: a.db, variante: { sans: [perdue] } });
  egal(b.avis, '', 'refus');
  const rempl = (b.rec.remplacees || {}).cv || {};
  const par = rempl[perdue];
  vrai(par && DIFF(par) === 'moyen' && !a.socle.includes(par), `remplacement : ${JSON.stringify(rempl)}`);
  egal(b.socle, a.socle.map((x) => (x === perdue ? par : x)), 'pièces lues');
  // Le remplacement est rangé : rouvrir avec la même banque ne le change plus.
  const c = await monter({ uid: 'u-perdu', db: b.db, variante: { sans: [perdue] } });
  egal(c.socle, b.socle, 'réouverture');
});

await v('Tirage : « Accompagné » reçoit exactement le contenu standard (mêmes pièces, mêmes valeurs, mêmes jalons, pas de bonus)', async () => {
  const s = await monter({ uid: 'u-acc', aisance: 'standard' });
  const ac = await monter({ uid: 'u-acc', aisance: 'accompagne' });
  egal([ac.db.aisance, ac.socle, ac.valeurs, ac.bonus], ['accompagne', s.socle, s.valeurs, []], 'accompagné');
  vrai(!('bonus' in ac.rec), 'clé bonus chez un accompagné');
  // Le détail dit « accompagné » à l'enseignant (`niveau`) : les JALONS, eux, sont les mêmes.
  const det = async () => Object.keys((await pt.evaluate(() => window.__t.enregistres.slice(-1)[0] || { detail: {} })).detail).filter((k) => k !== 'niveau').sort();
  await monter({ uid: 'u-acc', aisance: 'standard' }); const ds = await det();
  await monter({ uid: 'u-acc', aisance: 'accompagne' }); const da = await det();
  egal(da, ds, 'jalons du détail');
  const co = await monter({ uid: 'u-acc', aisance: 'confirme' });
  egal([co.socle, co.bonus.length], [s.socle, 2], 'le témoin confirmé');
});

await v('Tirage : évaluation — un confirmé n’a ni bonus ni pièce en plus, le niveau est ignoré', async () => {
  const s = await monter({ uid: 'u-eval', variante: { copie: true }, aisance: 'standard' });
  const c = await monter({ uid: 'u-eval', variante: { copie: true }, aisance: 'confirme' });
  egal(c.avis, '', 'refus');
  vrai(c.rec && !('bonus' in c.rec), 'bonus en évaluation : ' + JSON.stringify(c.rec));
  egal([c.socle, c.bonus], [s.socle, []], 'même socle');
});

await v('Tirage : la fabrique refuse une banque fautive et des cas bonus sans « niveauxPrevus: [\'confirme\'] »', async () => {
  const r = await pt.evaluate(async () => {
    const { composerSeance } = await import('/core/types/seance-entreprise.js');
    const { essai } = await import('/contenus/tirage-essai.js');
    const { declarerTirage } = await import('/core/tirage.js');
    const essaye = (f) => { try { f(); return ''; } catch (e) { return e.message; } };
    const E1 = essai();
    const sansNiveau = essaye(() => composerSeance(E1.UNIVERS, E1.SEANCE, { ...E1.META, niveauxPrevus: undefined }, E1.OPTIONS));
    const E2 = essai();
    const pieces = E2.TIRAGE.decl.banques.cv.pieces;
    const doublon = essaye(() => composerSeance(E2.UNIVERS, { ...E2.SEANCE, TIRAGE: declarerTirage({ banques: { cv: { ...E2.TIRAGE.decl.banques.cv,
      pieces: [...pieces, { ...pieces[3] }] } } }) }, E2.META, E2.OPTIONS));
    const trop = essaye(() => composerSeance(E2.UNIVERS, { ...E2.SEANCE, TIRAGE: declarerTirage({ banques: { cv: { ...E2.TIRAGE.decl.banques.cv,
      melange: { difficile: 4 } } } }) }, E2.META, E2.OPTIONS));
    const E3 = essai();
    const bon = essaye(() => composerSeance(E3.UNIVERS, E3.SEANCE, E3.META, E3.OPTIONS));
    return { sansNiveau, doublon, trop, bon };
  });
  vrai(/niveauxPrevus/.test(r.sansNiveau), 'sans niveauxPrevus : ' + r.sansNiveau);
  vrai(/en double/.test(r.doublon), 'doublon : ' + r.doublon);
  vrai(/difficile.*disponible/.test(r.trop), 'trop demandé : ' + r.trop);
  egal(r.bon, '', 'séance conforme refusée');
});

// La liste FIGÉE des ids de chaque banque déclarée (règle du brief : une banque ne perd jamais un id, elle ne fait que
// s'allonger). Une séance nouvelle qui déclare un tirage ajoute ici sa liste ; un id qui disparaît fait tomber le cas.
const BANQUES_FIGEES = {
  'contenus/tirage-essai.js': { cv: ['cv-yanis', 'cv-f1', 'cv-f2', 'cv-f3', 'cv-f4', 'cv-m1', 'cv-m2', 'cv-m3', 'cv-m4', 'cv-m5',
    'cv-m6', 'cv-d1', 'cv-d2', 'cv-d3', 'cv-d4'] },
};
await v('Tirage : banques stables — aucun id d’une banque déclarée ne disparaît (liste figée), toute banque déclarée est inscrite', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const dir = path.join(ROOT, 'contenus');
  const declarants = fs.readdirSync(dir).filter((f) => f.endsWith('.js') && !f.startsWith('A-SUPPRIMER-')
    && /declarerTirage\s*\(/.test(fs.readFileSync(path.join(dir, f), 'utf8'))).map((f) => `contenus/${f}`);
  vrai(declarants.includes('contenus/tirage-essai.js'), 'le relevé ne voit pas la séance d’essai : il est cassé');
  const inconnus = declarants.filter((f) => !BANQUES_FIGEES[f]);
  if (inconnus.length) throw new Error(`banques à inscrire dans BANQUES_FIGEES (outils/test/tirage-niveaux.mjs) : ${inconnus.join(', ')}`);
  const lues = await pt.evaluate(async (fichiers) => {
    const { estTirage } = await import('/core/tirage.js');
    const out = {};
    for (const f of fichiers) {
      const m = await import('/' + f);
      out[f] = {};
      Object.values(m).filter(estTirage).forEach((T) => Object.entries(T.decl.banques).forEach(([n, b]) => {
        out[f][n] = [...(out[f][n] || []), ...b.pieces.map((p) => p.id)];
      }));
    }
    return out;
  }, declarants);
  const perdus = [];
  for (const [f, B] of Object.entries(BANQUES_FIGEES)) {
    for (const [n, ids] of Object.entries(B)) ids.forEach((id) => { if (!((lues[f] || {})[n] || []).includes(id)) perdus.push(`${f} · ${n} · ${id}`); });
  }
  if (perdus.length) throw new Error('id retiré d’une banque (marquer `retiree: true` au lieu de supprimer) : ' + perdus.join(', '));
});

// L'onglet Corrigés (enseignant) et l'accueil (élève), avec la séance d'essai servie comme activité.
const EL2 = { T1: ['4931', 'tt01'], T2: ['4932', 'tt02'] };
const uidT = (k) => pt.evaluate((m) => { const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}'); return Object.keys(u).find((x) => u[x].matricule === m); }, EL2[k][0]);
const entrerT = async (k) => {
  await pt.goto(BASE);
  await pt.waitForSelector('#btnProf, #btnDeco', { timeout: 8000 });
  if (await pt.$('#btnDeco')) await pt.click('#btnDeco');
  await pt.waitForSelector('#mat');
  if (k === 'prof') { await pt.click('#btnProf'); await pt.waitForSelector('#btnProfEspace'); return; }
  await pt.fill('#mat', EL2[k][0]); await pt.fill('#code', EL2[k][1]);
  await pt.click('#btnEleve');
  await pt.waitForSelector('text=Bonjour');
};
const ouvrirEssai = async () => {
  await pt.click('[data-rub="simulog"]');
  await pt.click('[data-ent="autres"]');
  await pt.click('[data-act="essai-tirage"]');
  await pt.waitForSelector('.ent-shell');
};

await v('Tirage : Corrigés — pour un élève choisi, ses pièces (avec ce qu’attend la fiche), ses valeurs, et ses cas bonus marqués « bonus »', async () => {
  vrai(registreTouche, 'activites/index.js n’a plus « export const ACTIVITES = [ » : l’injection de la séance d’essai est à revoir');
  await pt.click('#btnProf');
  await pt.waitForSelector('#btnProfEspace');
  await pt.click('#btnProfEspace');
  await pt.waitForSelector('#gNom');
  await pt.fill('#gNom', 'TIR 1');
  await pt.click('#btnCreerG');
  await pt.waitForSelector('text=TIR 1');
  await pt.click('[data-ong="comptes"]');
  await pt.fill('#lot', Object.entries(EL2).map(([k, [m, c]]) => `TIR${k} ; ${k} ; ${m} ; ${c}`).join('\n'));
  await pt.click('#btnLot');
  await pt.waitForSelector('[data-tiers]');
  // La séance d'essai déclare `niveauxPrevus` : son entreprise (n° 99, hors table) a sa colonne.
  await pt.click('[data-ong="niveaux"]');
  await pt.waitForSelector('[data-col-scenario="99"]');
  egal((await pt.textContent('[data-col-scenario="99"] strong')).trim(), 'Entreprise 99', 'colonne');
  const u1 = await uidT('T1');
  await pt.selectOption(`[data-niveau-eleve="${u1}"][data-scenario="99"]`, 'confirme');
  await pt.waitForFunction((u) => { const x = JSON.parse(localStorage.getItem('prepalog:users'))[u]; return x.niveaux && x.niveaux['99'] === 'confirme'; }, u1);
  for (const k of ['T1', 'T2']) { await entrerT(k); await ouvrirEssai(); }
  await entrerT('prof');
  await pt.click('#btnProfEspace');
  await pt.click('[data-ong="corriges"]');
  await pt.click('[data-corrige="essai-tirage"]');
  await pt.waitForSelector('#corrEleve');
  const lire = async (k) => {
    await pt.selectOption('#corrEleve', await uidT(k));
    await pt.waitForSelector('[data-corr-eleve] .corr-item');
    return pt.$$eval('[data-corr-eleve] .corr-item', (L) => L.map((x) => ({ bonus: x.hasAttribute('data-corr-bonus'), t: x.textContent.replace(/\s+/g, ' ').trim() })));
  };
  const c1 = await lire('T1');
  const c2 = await lire('T2');
  egal([c1.filter((x) => x.bonus).length, c1.filter((x) => !x.bonus).length], [2, 6], 'confirmé : 2 bonus + valeurs + 5 pièces');
  egal([c2.filter((x) => x.bonus).length, c2.length], [0, 6], 'standard : valeurs + 5 pièces, aucun bonus');
  vrai(c1.filter((x) => x.bonus).every((x) => /^bonus /.test(x.t)), 'marque « bonus » : ' + JSON.stringify(c1));
  vrai(/Valeurs tirées/.test(c1[0].t) && /postes : [234]/.test(c1[0].t), 'valeurs : ' + c1[0].t);
  vrai(c2.slice(1).every((x) => /✓ (Retenir|Écarter)/.test(x.t)), 'attendu : ' + JSON.stringify(c2));
  vrai(c2.some((x) => /CV de Yanis/.test(x.t)), 'la pièce fixe manque');
  egal(await pt.$$eval('#contenuProf .avis-err', (L) => L.length), 0, 'avis d’erreur');
});


await v('Bonus : l’enseignant le lit dans l’infobulle du Suivi (« dont bonus +1 (2 cas sur 2) »), la note le comprend', async () => {
  const gid = await pt.evaluate(() => Object.entries(JSON.parse(localStorage.getItem('prepalog:groupes') || '{}')).find(([, g]) => g.nom === 'TIR 1')[0]);
  const u1 = await uidT('T1');
  await pt.evaluate(({ gid, uid }) => {
    const aid = 'essai-tirage';
    localStorage.setItem(`prepalog:travaux/${gid}/${uid}/${aid}`, JSON.stringify({ uid, aid, gid, score: 17, max: 20, meilleur: 17, tentatives: 1,
      detail: { cv1: 'ko', cv2: 'ok', cv3: 'ok', cv4: 'ok', cv5: 'ok', bonus: { justes: 2, total: 2, points: 1, etats: { bonus1: 'ok', bonus2: 'ok' } } }, dateMaj: Date.now() }));
    const idx = JSON.parse(localStorage.getItem(`prepalog:travauxIdx/${gid}`) || '[]');
    if (!idx.includes(`${uid}|${aid}`)) idx.push(`${uid}|${aid}`);
    localStorage.setItem(`prepalog:travauxIdx/${gid}`, JSON.stringify(idx));
  }, { gid, uid: u1 });
  await pt.click('[data-ong="suivi"]');
  await pt.waitForSelector('#contenuProf td[data-bonus]');
  const cases = await pt.$$eval('#contenuProf td[data-bonus]', (L) => L.map((x) => ({ t: x.getAttribute('title'), lu: x.textContent.replace(/\s+/g, ' ').trim() })));
  egal(cases.length, 1, 'cases avec bonus');
  vrai(/17 sur 20 — dont bonus \+1 \(2 cas sur 2\)/.test(cases[0].t), 'infobulle : ' + cases[0].t);
  vrai(/^17\/20/.test(cases[0].lu), 'note lue : ' + cases[0].lu);
  vrai(!/bonus/i.test(await pt.textContent('#contenuProf')), 'le mot « bonus » est écrit dans le tableau (projetable)');
});

// ════════════════════════════════════════════════════════════════════════════════════ lot 3 : bonus dans la note
// La fiche « Tri des CV » remplie dans la base (comme un envoi) : socle 5 × 4 points, un cas bonus juste = +0,5, au plus +2.
const repondre = (db, o = {}) => pt.evaluate(async ({ db, o }) => {
  const { essai } = await import('/contenus/tirage-essai.js');
  const T = essai(o.variante || {}).TIRAGE;
  const S = T.piecesTirees(db, 'cv'), Bn = T.piecesBonus(db, 'cv');
  const inv = (a) => (a === 'retenir' ? 'ecarter' : 'retenir');
  const valeurs = {};
  S.forEach((p, i) => { valeurs[`r${i + 1}`] = (o.socleFaux || []).includes(i) ? inv(p.attendu) : p.attendu; });
  Bn.forEach((p, i) => { valeurs[`r${S.length + i + 1}`] = i < (o.bonusJustes === undefined ? Bn.length : o.bonusJustes) ? p.attendu : inv(p.attendu); });
  db.fiches = { ...(db.fiches || {}), tri: { envoye: { at: Date.now() }, envois: o.envois || 1, valeurs } };
  return db;
}, { db, o });
const dernier = () => pt.evaluate(() => JSON.parse(JSON.stringify(window.__t.enregistres.slice(-1)[0] || null)));
// Ouvre, répond, rouvre : rend le dernier score remonté et la base.
const noter = async ({ uid, aisance = 'confirme', variante, ...rep }) => {
  const a = await monter({ uid, aisance, variante });
  const db = await repondre(a.db, { variante, ...rep });
  const b = await monter({ uid, aisance, variante, db });
  return { s: await dernier(), db: b.db, bonus: b.bonus };
};

await v('Bonus : confirmé — 2 cas justes → +1 ; 5 justes → plafond +2 ; socle à 20 + bonus → 20 ; cas bonus faux → la note du socle, pas moins ; standard → aucun jalon bonus', async () => {
  const deux = await noter({ uid: 'u-b1', socleFaux: [0] });
  egal([deux.s.score, deux.s.max, deux.s.detail.bonus.justes, deux.s.detail.bonus.total, deux.s.detail.bonus.points], [17, 20, 2, 2, 1], '2 justes');
  const cinq = await noter({ uid: 'u-b2', socleFaux: [0], variante: { bonus: { facile: 2, moyen: 2, difficile: 1 } } });
  egal([cinq.bonus.length, cinq.s.score, cinq.s.detail.bonus.points], [5, 18, 2], '5 justes, plafond');
  const plein = await noter({ uid: 'u-b3' });
  egal([plein.s.score, plein.s.max], [20, 20], 'socle 20 + 1');
  const faux = await noter({ uid: 'u-b4', socleFaux: [0, 1], bonusJustes: 0 });
  egal([faux.s.score, faux.s.detail.bonus.justes, faux.s.detail.bonus.points], [12, 0, 0], 'bonus faux');
  const std = await noter({ uid: 'u-b4', aisance: 'standard', socleFaux: [0, 1] });
  egal([std.s.score, 'bonus' in std.s.detail, std.bonus.length], [12, false, 0], 'standard');
  vrai(!Object.keys(std.s.detail).some((k) => /^bonus\d/.test(k)), 'jalon bonus dans le détail d’un standard');
});

await v('Bonus : règle du premier bilan — bonus1 rangé au premier bilan, à la 1re correction max(bonus1, moyenne), il ne peut que monter', async () => {
  // Premier bilan : socle 16, 1 bonus juste sur 2 (+0,5) → 16,5. Correction : socle 20, 2 justes (+1) → (16+20)/2 + max(0,5 ; 0,75) = 18,75.
  const a = await noter({ uid: 'u-c1', socleFaux: [0], bonusJustes: 1 });
  egal([a.s.score, a.db.indicateurs['essai-tirage'].bonus1], [16.5, 0.5], 'premier bilan');
  const db2 = await repondre(a.db, { envois: 2 });
  await monter({ uid: 'u-c1', aisance: 'confirme', db: db2 });
  const b = await dernier();
  egal([b.score, b.detail.bonus.points], [18.75, 0.75], '1re correction');
  // Dans l'autre sens : 2 justes au premier bilan (+1), plus aucun à la correction → le bonus reste 1, jamais moins.
  const c = await noter({ uid: 'u-c2', socleFaux: [0] });
  egal(c.s.score, 17, 'premier bilan (2 justes)');
  const db3 = await repondre(c.db, { envois: 2, socleFaux: [0], bonusJustes: 0 });
  await monter({ uid: 'u-c2', aisance: 'confirme', db: db3 });
  const d = await dernier();
  egal([d.score, d.detail.bonus.points], [17, 1], 'bonus jamais à la baisse');
});

await v('Bonus : caché à l’élève — même bandeau de fin pour un confirmé et un standard, le mot « bonus » nulle part à l’écran', async () => {
  const lignes = async () => pt.$$eval('#tTest [data-fin-seance] [data-fin-jalon]', (L) => L.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  const c = await noter({ uid: 'u-h1', socleFaux: [3], bonusJustes: 1 });
  const lc = await lignes();
  const texteC = await pt.textContent('#tTest');
  const s = await noter({ uid: 'u-h1', aisance: 'standard', socleFaux: [3] });
  const ls = await lignes();
  vrai(lc.length === 2, 'bandeau absent ou incomplet : ' + JSON.stringify(lc));
  egal(lc, ls, 'lignes du bandeau');
  vrai(c.s.detail.bonus && !s.s.detail.bonus, 'le témoin ne prouve rien');
  vrai(!/bonus/i.test(texteC), 'le mot « bonus » à l’écran de l’élève');
});

await v('Bonus : un changement de niveau vaut à la séance suivante — séance ouverte en standard, passée en confirmé : pas de bonus ; la suivante en a', async () => {
  const a = await monter({ uid: 'u-suite', aisance: 'standard' });
  const b = await monter({ uid: 'u-suite', aisance: 'confirme', db: a.db });
  egal([b.db.aisance, b.bonus.length, 'bonus' in b.rec], ['standard', 0, false], 'séance commencée');
  vrai(!(await dernier()).detail.bonus, 'jalons bonus dans la séance commencée');
  const c = await monter({ uid: 'u-suite', aisance: 'confirme', variante: { id: 'essai-tirage-2' } });
  egal([c.db.aisance, c.bonus.length], ['confirme', 2], 'séance suivante');
});

await v('Bonus : évaluation — aucun jalon bonus, même chez un confirmé', async () => {
  const r = await noter({ uid: 'u-ev', variante: { copie: true }, socleFaux: [0] });
  const n = await pt.evaluate(() => window.__t.M.noter(window.__t.db));
  egal(['bonus' in n.detail, n.score, n.max], [false, 16, 20], 'copie');
  vrai(!r.s || !r.s.detail || !r.s.detail.bonus, 'bonus remonté en évaluation');
});

await v('Tirage : aucune erreur JavaScript', async () => {
  if (erreursT.length) throw new Error(erreursT.slice(0, 3).join(' / '));
});

await ctxT.close();
}
