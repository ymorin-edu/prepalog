// Suite de tests de Prepalog — bloc « tirage-niveaux » : chantier D-C (brief `docs/briefs/MOTEUR-tirage-et-niveaux.md`,
// 09/10/2026). `node outils/test.mjs tirage-niveaux` ne lance que ce bloc.
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

export default async function bloc({ v, nav, BASE, egal, vrai }) {

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
}
