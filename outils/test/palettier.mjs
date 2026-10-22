// Suite de tests de Prepalog — bloc « palettier » : le mode palettier de la vue Plan d'entrepôt (ranger à l'adresse donnée
// par le système), `core/types/entrepot-palettier.js`, chantier E-7, lot 1 (21/10/2026) ; brief
// `docs/briefs/MOTEUR-palettier-adresse-donnee.md` §7 et décisions du chef `docs/briefs/COORDINATION-palettier.md` §3.
//
// `node outils/test.mjs palettier` ne lance que ce bloc. Il n'a besoin d'aucun autre : il monte l'environnement d'entreprise
// à la main sur le cas d'essai `contenus/palettier-essai.js` (univers `universPalettier`), comme le bloc `entrepot`.
// Le rangement de Smoby (ENT-5.5) et la préparation (ENT-5.6), qui partagent le plan et la travée de face, restent couverts
// par les blocs `entrepot` et `smoby`, sans qu'un cas y bouge.
//
// Valeurs écrites À LA MAIN (jamais relues dans le contenu), recontrôlées contre le moteur le 21/10/2026 :
//   P1 Cahiers 30 ctn × 9 kg + 25 = 295 kg, adresse A1-T03-N1-E2 (sol) · P2 Serviettes 265 kg, B2-T02-N1-E3 (sol) ·
//   P3 Bougies 205 kg, A2-T02-N3-E1 (Kevin) · P4 Peluches 145 kg, B1-T04-N2-E2 (Kevin) ·
//   P5 Lessive 36 × 13 + 25 = 493 kg, A1-T02-N3-E2 : le niveau porte déjà 389 + 400 = 789 kg, 789 + 493 = 1 282 > 1 200 → à
//   signaler (charge), nouvelle adresse A1-T04-N2-E3 · P6 Boîtes 225 kg, B2-T03-N4-E1, au confirmé seulement (bonus).
//   Libres, hors de toute adresse de palette : A1-T01-N1-E2 (sol), A1-T01-N2-E2 (N2). Occupé au sol : A1-T03-N1-E1 (stock).
//   Hors service : B1-T01-N2-E1.

// LOT 2 (22/10/2026, le scan) : les cas du Terminal sont en fin de bloc, section « le scan » ; `monter(pg, { terminal: 'deux' | 'un' })`
// déclare `terminal: { nom: 'Terminal' }` (deux scans) ou `{ nom: 'Terminal', scan: 'emplacement' }` (un clic) ; sans `terminal`, le
// cas d'essai est celui du lot 1, que les 32 premiers cas jouent sans une modification (seul l'aide `monter` a gagné deux options).
// Valeurs du scan écrites à la main : P1 « Cahiers grand format » 30 cartons, A1-T03-N1-E2 · P2 « Serviettes de bain » B2-T02-N1-E3 ·
// P3 « Bougies parfumées » A2-T02-N3-E1 · P4 B1-T04-N2-E2 · P5 « Lessive liquide 3 L », nouvelle adresse A1-T04-N2-E3.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ctx = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const erreurs = [];
const pg = await ctx.newPage();
pg.setDefaultTimeout(6000);
pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

const ID = 'essai-palettier';
const Z = '#palTest .pal';
// Monte l'environnement sur le cas d'essai. `o` : temps, aide (aideCharge), verdict, monte ('base' : Kevin monte quand
// `db.kevinRepondu` est vrai), aisance, role, uid, db, scenario ('signaler' : deux palettes à signaler de plus, P7 sur un
// emplacement hors service, P8 sur un emplacement occupé).
const monter = (p, o = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const C = await import('/contenus/palettier-essai.js');
  document.querySelector('#palTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'palTest'; document.body.appendChild(hote);
  const temps = o.temps || 'guidage';
  let P = C.palettier({ aideCharge: o.aide || 'pose', verdict: o.verdict === undefined ? 'critere' : o.verdict || undefined,
    monte: o.monte === 'base' ? (db) => !!(db && db.kevinRepondu) : undefined,
    terminal: !!o.terminal, scan: o.terminal === 'un' ? 'emplacement' : undefined, reglesOuvertes: !!o.reglesOuvertes });
  if (o.scenario === 'signaler') {
    P = Object.assign({}, P, { palettes: [...P.palettes,
      { id: 'P7', nom: 'Peluches', cartons: 20, kg: 3, adresse: 'B1-T01-N2-E1', aSignaler: true },
      { id: 'P8', nom: 'Bougies parfumées', cartons: 20, kg: 3, adresse: 'A1-T03-N1-E1', aSignaler: true }] });
  }
  const U = C.universPalettier({ temps, entrepot: P, poids: o.scenario !== 'signaler' });
  if (o.volet) {
    // Un message qui attend le geste `monter` (comme Kevin dans ENT-8.11), ou celui que `o.volet` nomme (lot 2 : `scan:P1`).
    const { apresGeste } = await import('/core/declencheurs.js');
    U.volet = { id: 'volet-essai', semer: () => ({ mails: [] }), declencheurs: [{ id: 'kevin', quand: apresGeste(typeof o.volet === 'string' ? o.volet : 'entrepot:essai-palettier:monter'),
      semer: () => ({ mails: [{ folder: 'in', ts: Date.now(), from: 'Kevin', fromMail: 'kevin@essai.example', to: 'Lea', subject: 'Kevin monte', kind: 'text', text: 'Bonjour' }] }) }] };
  }
  const db = o.db || {};
  const moteur = creerEntreprise(U);
  window.__p = { db, P, U, temps, moteur, remis: null };
  moteur.rendre(hote, {
    meta: { id: 'essai-palettier', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps, copie: temps === 'evaluation' },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'u-test' },
    aisance: o.aisance,
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
    rendreCopie: async (res) => { window.__p.remis = res; return { rendu: Date.now() }; },
  });
  document.querySelector('#palTest .ent-nav[data-vue="entrepot"]').click();
}, o);

const blanc = (s) => String(s || '').replace(/[\s  ]+/g, ' ').trim();
const present = async (p, sel) => !!(await p.$(`${Z} ${sel}`));
const texte = async (p, sel) => blanc(await p.textContent(`${Z} ${sel}`));
const etat = (p) => p.evaluate((id) => JSON.parse(JSON.stringify((window.__p.db.entrepots || {})[id] || null)), ID);
const gestes = (p) => p.evaluate((id) => Object.keys((window.__p.db.gestes || {})[id] || {}).sort(), ID);
const jalons = (p) => p.evaluate(async () => {
  const E = await import('/core/types/entrepot.js');
  const W = window.__p;
  return Object.fromEntries(E.jalonsEntrepot(W.db, W.P, W.temps === 'evaluation' ? 'evaluation' : undefined).L.map((l) => [l.id, l.etat]));
});
const tous = (etatJ) => ({ 'place-P1': etatJ, 'place-P2': etatJ, 'place-P3': etatJ, 'place-P4': etatJ, 'signale-P5': etatJ, pasPoseHaut: etatJ, charge: etatJ });
const bouton = (p, k) => p.click(`${Z} [data-pal="${k}"]`);
const prendre = (p, id) => p.click(`${Z} .pe-bandeau [data-pe-pal="${id}"]`);
// Ouvrir un emplacement de près : retour au plan, la travée, puis l'emplacement.
async function ouvrir(p, a) {
  if (await present(p, '[data-pal="retour"]')) await bouton(p, 'retour');
  await p.click(`${Z} [data-pe-trav="${a.slice(0, 6)}"]`);
  await p.click(`${Z} [data-pe-emp="${a}"]`);
}
async function ranger(p, id, a, geste = 'poser') { await prendre(p, id); await ouvrir(p, a); await bouton(p, geste); }
// `garder` : laisser ouverte la fenêtre « Message du système » (nouvelle adresse) ; sinon elle est fermée par « Compris ».
async function signaler(p, id, a, motif, garder = false) {
  await prendre(p, id); await ouvrir(p, a); await bouton(p, 'signaler'); await p.click(`${Z} [data-pal-motif="${motif}"]`);
  if (!garder && await present(p, '[data-pal-modal]')) await p.click(`${Z} [data-pal-modal-ok]`);
}
const fenetre = (p) => p.$$(`${Z} [role="dialog"]`);
async function valider(p) {
  if (await present(p, '[data-pal="retour"]')) await bouton(p, 'retour');
  await bouton(p, 'valider'); await bouton(p, 'validerOui');
}
// Le parcours juste, palette par palette (`sauf` : les palettes laissées de côté).
async function juste(p, sauf = []) {
  if (!sauf.includes('P1')) await ranger(p, 'P1', 'A1-T03-N1-E2');
  if (!sauf.includes('P2')) await ranger(p, 'P2', 'B2-T02-N1-E3');
  if (!sauf.includes('P3')) await ranger(p, 'P3', 'A2-T02-N3-E1', 'confier');
  if (!sauf.includes('P4')) await ranger(p, 'P4', 'B1-T04-N2-E2', 'confier');
  if (!sauf.includes('P5')) { await signaler(p, 'P5', 'A1-T02-N3-E2', 'charge'); await ranger(p, 'P5', 'A1-T04-N2-E3', 'confier'); }
}
const mini = (p, a) => p.getAttribute(`${Z} [data-pe-mini="${a}"]`, 'data-pe-etat');

/* =========================================================== montage */
await v('Palettier : la vue s’ouvre par son entrée de menu ; 5 palettes en réception avec l’adresse du système, 16 travées, 2 zones « À monter », état neuf', async () => {
  await monter(pg);
  egal(blanc(await pg.textContent('#palTest .ent-nav[data-vue="entrepot"]')), 'Plan de l’entrepôt', 'entrée de menu');
  egal(await pg.$$eval(`${Z} .pe-bandeau [data-pe-pal]`, (L) => L.map((b) => b.dataset.pePal)), ['P1', 'P2', 'P3', 'P4', 'P5'], 'cartes (standard : pas de P6)');
  egal(await texte(pg, '[data-pal-etiq="P1"]'), 'Adresse A1-T03-N1-E2', 'étiquette du système sur la carte');
  vrai((await texte(pg, '.pe-bandeau [data-pe-pal="P5"]')).includes('36 cartons · 493 kg'), 'poids de P5 calculé (36 × 13 + 25)');
  egal((await pg.$$(`${Z} [data-pe-trav]`)).length, 16, 'travées');
  egal(await pg.$$eval(`${Z} [data-pal-amonter]`, (L) => L.map((g) => g.dataset.palAmonter)), ['A', 'B'], 'une zone « À monter » au pied de chaque allée');
  egal(await etat(pg), { enMain: null, posees: {}, confiees: {}, signalees: {}, nouvelles: {}, tentativesHaut: 0, valide: false, at: null, premierGeste: null }, 'état neuf');
  egal(await jalons(pg), tous('attente'), 'jalons à faire');
  egal(erreurs, [], 'erreurs JS');
});

await v('Palettier : `signaux` publie un geste par palette et par geste, plus `ouvrir`, `monter` et `valider` ; un `apresGeste` sur chacun se charge, sur un nom inconnu non', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntrepot } = await import('/core/types/entrepot.js');
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const { apresGeste } = await import('/core/declencheurs.js');
    const C = await import('/contenus/palettier-essai.js');
    const S = creerEntrepot(C.PALETTIER).signaux;
    const essai = (noms) => {
      const U = C.universPalettier();
      U.volet = { semer: () => ({ mails: [] }), declencheurs: noms.map((n, i) => ({ id: `d${i}`, quand: apresGeste(n), semer: () => ({ mails: [] }) })) };
      try { creerEntreprise(U); return ''; } catch (e) { return e.message; }
    };
    return { S, tous: essai(S), inconnu: essai(['entrepot:essai-palettier:poser']) };
  });
  const attendus = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].flatMap((id) => ['prendre', 'poser', 'confier', 'signaler'].map((g) => `entrepot:essai-palettier:${g}:${id}`))
    .concat(['entrepot:essai-palettier:ouvrir', 'entrepot:essai-palettier:monter', 'entrepot:essai-palettier:valider']);
  egal(r.S, attendus, 'signaux');
  egal(r.tous, '', 'un apresGeste sur chaque geste publié');
  vrai(r.inconnu.includes('entrepot:essai-palettier:poser'), `geste inconnu : ${r.inconnu}`);
});

await v('Palettier : une déclaration fautive ne se charge pas', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntrepot } = await import('/core/types/entrepot.js');
    const C = await import('/contenus/palettier-essai.js');
    const P0 = C.PALETTIER;
    const essai = (o) => { try { creerEntrepot(Object.assign({}, P0, { id: `x${Math.random()}` }, o)); return ''; } catch (e) { return e.message; } };
    const pal = (k, x) => P0.palettes.map((p) => (p.id === k ? Object.assign({}, p, x) : p));
    return [
      essai({ palettes: pal('P1', { adresse: 'A1-T09-N1-E1' }) }),
      essai({ palettes: pal('P2', { adresse: 'A1-T03-N1-E2' }) }),
      essai({ palettes: pal('P5', { nouvelleAdresse: 'A1-T04-N4-E3' }), cariste: { nom: 'Kevin', niveaux: [2, 3] } }),
      essai({ aideCharge: 'tout' }),
      essai({ verdict: 'detail' }),
      essai({ palettes: pal('P6', { niveaux: ['accompagne'] }) }),
      essai({ palettes: pal('P1', { cartons: 0 }) }),
      essai({ cariste: undefined }),
    ];
  });
  vrai(r[0].includes('adresse inconnue (A1-T09-N1-E1)'), r[0]);
  vrai(r[1].includes('est déjà celle de P1'), r[1]);
  vrai(r[2].includes('que le cariste ne dessert pas'), r[2]);
  vrai(r[3].includes('aideCharge'), r[3]);
  vrai(r[4].includes('verdict'), r[4]);
  vrai(r[5].includes("seul ['confirme']"), r[5]);
  vrai(r[6].includes('cartons'), r[6]);
  vrai(r[7].includes('que le cariste ne dessert pas'), r[7]);
});

/* =========================================================== ranger */
await v('Palettier : parcours juste → tout « à faire » avant « Valider », tout juste après ; gestes publiés ; « ✓ bien rangée » sur chaque carte', async () => {
  await monter(pg);
  await juste(pg);
  egal(await jalons(pg), tous('attente'), 'avant la validation');
  await valider(pg);
  egal(await jalons(pg), tous('ok'), 'après la validation');
  egal(await gestes(pg), ['confier:P3', 'confier:P4', 'confier:P5', 'ouvrir', 'poser:P1', 'poser:P2', 'prendre:P1', 'prendre:P2', 'prendre:P3', 'prendre:P4', 'prendre:P5', 'signaler:P5', 'valider']
    .map((g) => `entrepot:essai-palettier:${g}`).sort(), 'gestes');
  egal(await pg.$$eval(`${Z} [data-pal-verdict]`, (L) => L.map((s) => s.textContent.trim())), Array(5).fill('✓ bien rangée'), 'verdicts');
  const e = await etat(pg);
  egal([e.posees, e.confiees, e.valide], [{ P1: 'A1-T03-N1-E2', P2: 'B2-T02-N1-E3' },
    { P3: 'A2-T02-N3-E1', P4: 'B1-T04-N2-E2', P5: 'A1-T04-N2-E3' }, true], 'état');
  egal(erreurs, [], 'erreurs JS');
});

await v('Palettier : posée au sol ailleurs qu’à son adresse → place ✗ (le reste juste) ; au sol sur un emplacement occupé → refusé, la palette reste en main', async () => {
  await monter(pg);
  await prendre(pg, 'P1'); await ouvrir(pg, 'A1-T03-N1-E1'); await bouton(pg, 'poser');
  egal(await texte(pg, '[data-pal-msg]'), 'Emplacement déjà occupé. La palette reste en main.', 'refus');
  egal((await etat(pg)).enMain, 'P1', 'toujours en main');
  await ouvrir(pg, 'A1-T01-N1-E2'); await bouton(pg, 'poser');
  egal((await etat(pg)).posees, { P1: 'A1-T01-N1-E2' }, 'posée ailleurs');
  await juste(pg, ['P1']);
  await valider(pg);
  egal(await jalons(pg), Object.assign(tous('ok'), { 'place-P1': 'ko' }), 'jalons');
});

await v('Palettier : « Poser ici » au-dessus du sol → refusé et compté, la palette reste en main ; « Confier à Kevin » → zone « À monter » ; place ✓, pasPoseHaut ✗', async () => {
  await monter(pg);
  await prendre(pg, 'P3'); await ouvrir(pg, 'A2-T02-N3-E1');
  egal(await pg.$$eval(`${Z} .pal-boutons [data-pal]`, (L) => L.map((b) => b.dataset.pal)), ['poser', 'confier', 'signaler'], 'les trois boutons, aussi en hauteur');
  await bouton(pg, 'poser');
  egal(await texte(pg, '[data-pal-msg]'), 'Au-dessus du sol, c’est Kevin qui monte la palette.', 'refus');
  vrai(await present(pg, '[data-pal-msg].pe-non'), 'refus en texte rouge (pe-non)');
  let e = await etat(pg);
  egal([e.enMain, e.tentativesHaut, e.posees], ['P3', 1, {}], 'en main, tentative comptée, rien de posé');
  await bouton(pg, 'confier');
  e = await etat(pg);
  egal([e.enMain, e.confiees], [null, { P3: 'A2-T02-N3-E1' }], 'confiée');
  egal(await texte(pg, '[data-pal-etat="P3"]'), 'à monter (Kevin)', 'carte');
  vrai(await present(pg, '[data-pe-reserve="P3"]'), 'la travée la montre réservée, en trait');
  await bouton(pg, 'retour');
  vrai(await present(pg, '[data-pal-amonter="A"] [data-pal-amonter-p="P3"]'), 'P3 dans la zone « À monter » de l’allée A');
  egal(await mini(pg, 'A2-T02-N3-E1'), 'libre', 'pas encore montée');
  await juste(pg, ['P3']);
  await valider(pg);
  egal(await mini(pg, 'A2-T02-N3-E1'), 'eleve', 'Kevin l’a montée à la validation');
  vrai(!(await present(pg, '[data-pal-amonter-p]')), 'plus rien dans « À monter »');
  egal(await jalons(pg), Object.assign(tous('ok'), { pasPoseHaut: 'ko' }), 'jalons');
});

await v('Palettier : « Confier » au sol → « Au sol, tu poses toi-même. » ; une palette confiée se reprend tant que rien n’est validé', async () => {
  await monter(pg);
  await prendre(pg, 'P1'); await ouvrir(pg, 'A1-T03-N1-E2'); await bouton(pg, 'confier');
  egal(await texte(pg, '[data-pal-msg]'), 'Au sol, tu poses toi-même.', 'refus');
  await prendre(pg, 'P3'); await ouvrir(pg, 'A2-T02-N3-E1'); await bouton(pg, 'confier');
  await prendre(pg, 'P3');
  const e = await etat(pg);
  egal([e.enMain, e.confiees, e.tentativesHaut], ['P3', {}, 0], 'reprise en main, plus confiée ; un refus au sol ne compte pas');
});

await v('Palettier : `monte: (db) => …` — Kevin monte quand la base le dit (avant la validation), et une palette montée ne se reprend plus', async () => {
  await monter(pg, { monte: 'base' });
  await ranger(pg, 'P3', 'A2-T02-N3-E1', 'confier');
  await bouton(pg, 'retour');
  egal(await mini(pg, 'A2-T02-N3-E1'), 'libre', 'pas encore');
  await pg.evaluate(() => { window.__p.db.kevinRepondu = true; document.querySelector('#palTest .ent-nav[data-vue="entrepot"]').click(); });
  egal(await mini(pg, 'A2-T02-N3-E1'), 'eleve', 'montée');
  egal(await texte(pg, '[data-pal-etat="P3"]'), 'montée en A2-T02-N3-E1', 'carte');
  await prendre(pg, 'P3');
  egal((await etat(pg)).enMain, null, 'pas reprise');
  vrai((await texte(pg, '[data-pal-msg]')).includes('déjà montée par Kevin'), 'dit');
  // Sans la réponse, la validation ne la monte pas (c'est la base qui décide).
  await monter(pg, { monte: 'base' });
  await ranger(pg, 'P3', 'A2-T02-N3-E1', 'confier');
  await valider(pg);
  egal(await mini(pg, 'A2-T02-N3-E1'), 'libre', 'validée sans réponse : toujours à monter');
});

/* =========================================================== signaler */
await v('Palettier : signaler P5 « charge » à son adresse → le système donne la nouvelle adresse (encart et carte) ; rangée là → signale ✓', async () => {
  await monter(pg);
  await signaler(pg, 'P5', 'A1-T02-N3-E2', 'charge');
  egal(await texte(pg, '[data-pal-systeme] .pal-sys-actu'), 'Nouvelle adresse : A1-T04-N2-E3.', 'le système');
  egal(await texte(pg, '[data-pal-etiq="P5"]'), 'Nouvelle adresse A1-T04-N2-E3', 'la carte');
  egal(await texte(pg, '[data-pal-etat="P5"]'), 'signalée', 'en réception, signalée');
  vrai(!/(juste|bien vu|faux|bravo)/i.test(await texte(pg, '[data-pal-msg]')), 'aucun jugement à l’écran');
  const e = await etat(pg);
  egal([e.enMain, e.signalees, e.nouvelles], [null, { P5: { motif: 'charge', adresse: 'A1-T02-N3-E2' } }, { P5: 'A1-T04-N2-E3' }], 'état');
  await juste(pg, ['P5']);
  await ranger(pg, 'P5', 'A1-T04-N2-E3', 'confier');
  await valider(pg);
  egal(await jalons(pg), tous('ok'), 'jalons');
});

await v('Palettier : signaler à tort (P1, adresse possible) → « Signalement enregistré. », place-P1 ✗ même posée juste ensuite ; le reste inchangé', async () => {
  await monter(pg);
  await signaler(pg, 'P1', 'A1-T03-N1-E2', 'occupe');
  egal(await texte(pg, '[data-pal-systeme] .pal-sys-actu'), 'Signalement enregistré.', 'le système');
  egal(await texte(pg, '[data-pal-etiq="P1"]'), 'Adresse A1-T03-N1-E2', 'pas de nouvelle adresse');
  await juste(pg);
  await valider(pg);
  egal(await jalons(pg), Object.assign(tous('ok'), { 'place-P1': 'ko' }), 'jalons');
  egal(await texte(pg, '[data-pal-verdict]:not([data-pal-verdict="ok"])'), '✗ signalement', 'verdict de P1');
});

await v('Palettier : motif faux, ou signalement depuis un autre emplacement → signale-P5 ✗ (la nouvelle adresse est donnée quand même)', async () => {
  await monter(pg);
  await signaler(pg, 'P5', 'A1-T02-N3-E2', 'occupe');
  egal(await texte(pg, '[data-pal-systeme] .pal-sys-actu'), 'Nouvelle adresse : A1-T04-N2-E3.', 'le système ne juge pas');
  await juste(pg, ['P5']);
  await ranger(pg, 'P5', 'A1-T04-N2-E3', 'confier');
  await valider(pg);
  egal(await jalons(pg), Object.assign(tous('ok'), { 'signale-P5': 'ko' }), 'motif faux');
  await monter(pg);
  await signaler(pg, 'P5', 'A1-T02-N3-E1', 'charge');
  await juste(pg, ['P5']);
  await ranger(pg, 'P5', 'A1-T04-N2-E3', 'confier');
  await valider(pg);
  egal(await jalons(pg), Object.assign(tous('ok'), { 'signale-P5': 'ko' }), 'signalée depuis A1-T02-N3-E1');
});

await v('Palettier : P5 confiée à son adresse d’origine sans signaler → signale ✗ et charge ✗ ; signalée mais pas rangée à la nouvelle adresse → signale ✗', async () => {
  await monter(pg);
  await juste(pg, ['P5']);
  await ranger(pg, 'P5', 'A1-T02-N3-E2', 'confier');
  await valider(pg);
  egal(await jalons(pg), Object.assign(tous('ok'), { 'signale-P5': 'ko', charge: 'ko' }), 'confiée à l’origine');
  egal(await texte(pg, '[data-pe-verd="P5"]'), '✗ signalement, adresse, plaque de charge', 'verdict de P5');
  await monter(pg);
  await juste(pg, ['P5']);
  await signaler(pg, 'P5', 'A1-T02-N3-E2', 'charge');
  await valider(pg);
  egal(await jalons(pg), Object.assign(tous('ok'), { 'signale-P5': 'ko' }), 'pas rangée à la nouvelle adresse');
});

await v('Palettier : la vérité d’un emplacement — hors service → « abîmé », stock → « occupé » ; le motif faux ne passe pas', async () => {
  await monter(pg, { scenario: 'signaler' });
  await signaler(pg, 'P7', 'B1-T01-N2-E1', 'abime');
  await signaler(pg, 'P8', 'A1-T03-N1-E1', 'charge');
  egal(await texte(pg, '[data-pal-systeme] .pal-sys-actu'), 'Signalement enregistré.', 'sans nouvelle adresse');
  await juste(pg);
  await valider(pg);
  const J = await jalons(pg);
  egal([J['signale-P7'], J['signale-P8'], J.pasPoseHaut, J.charge], ['ok', 'ko', 'ok', 'ok'], 'P7 juste (abîmé), P8 faux (charge au lieu d’occupé)');
  await monter(pg, { scenario: 'signaler' });
  await signaler(pg, 'P8', 'A1-T03-N1-E1', 'occupe');
  await signaler(pg, 'P7', 'B1-T01-N2-E1', 'charge');
  await juste(pg);
  await valider(pg);
  const K = await jalons(pg);
  egal([K['signale-P7'], K['signale-P8']], ['ko', 'ok'], 'P8 juste (occupé), P7 faux');
});

/* =========================================================== la fenêtre du système (retour de Tristan, 21/10/2026) */
await v('Palettier : signaler P5 (nouvelle adresse) ouvre la fenêtre « Message du système » — palette, produit, adresse, focus dedans ; rien ne répond derrière ; « Compris » la ferme et le focus revient sur la carte', async () => {
  await monter(pg);
  egal((await fenetre(pg)).length, 0, 'aucune fenêtre au départ');
  await signaler(pg, 'P5', 'A1-T02-N3-E2', 'charge', true);
  egal((await fenetre(pg)).length, 1, 'une fenêtre');
  vrai(await pg.isVisible(`${Z} [role="dialog"]`), 'visible');
  egal(await pg.getAttribute(`${Z} [role="dialog"]`, 'aria-modal'), 'true', 'modale');
  egal(await texte(pg, '[role="dialog"] h3'), 'Message du système', 'titre');
  egal(await texte(pg, '[data-pal-modal-texte]'), 'Nouvelle adresse pour P5 (Lessive liquide 3 L) : A1-T04-N2-E3.', 'texte');
  egal(await pg.$$eval(`${Z} [role="dialog"] button`, (L) => L.map((b) => b.textContent.trim())), ['Compris'], 'un seul bouton');
  egal(await pg.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-pal-modal-ok')), true, 'le focus est dans la fenêtre');
  // La ligne reste dans l'encart « Système », l'étiquette de la carte a changé.
  egal(await texte(pg, '[data-pal-systeme] .pal-sys-actu'), 'Nouvelle adresse : A1-T04-N2-E3.', 'encart Système');
  egal(await texte(pg, '[data-pal-etiq="P5"]'), 'Nouvelle adresse A1-T04-N2-E3', 'la carte');
  // Derrière : un vrai clic sur un emplacement, une carte, « Valider » → rien ne bouge.
  const avant = [await etat(pg), await pg.getAttribute(`${Z} [data-pal-pres]`, 'data-pal-pres')];
  await pg.click(`${Z} [data-pe-emp="A1-T02-N3-E1"]`, { force: true });
  await pg.click(`${Z} .pe-bandeau [data-pe-pal="P1"]`, { force: true });
  await pg.click(`${Z} [data-pal="valider"]`, { force: true });
  egal([await etat(pg), await pg.getAttribute(`${Z} [data-pal-pres]`, 'data-pal-pres')], avant, 'rien n’a bougé derrière la fenêtre');
  vrai(!(await present(pg, '[data-pal-confirme]')), 'pas de confirmation de « Valider »');
  egal((await fenetre(pg)).length, 1, 'toujours ouverte');
  await pg.keyboard.press('Tab');
  egal(await pg.evaluate(() => document.activeElement && document.activeElement.hasAttribute('data-pal-modal-ok')), true, 'Tab ne sort pas de la fenêtre');
  await pg.click(`${Z} [data-pal-modal-ok]`);
  egal((await fenetre(pg)).length, 0, 'fermée par « Compris »');
  egal(await pg.evaluate(() => document.activeElement && document.activeElement.dataset.pePal), 'P5', 'le focus est sur la carte de P5');
  egal(await texte(pg, '[data-pal-systeme] .pal-sys-actu'), 'Nouvelle adresse : A1-T04-N2-E3.', 'la ligne reste');
  // Échap la ferme aussi.
  await monter(pg);
  await signaler(pg, 'P5', 'A1-T02-N3-E2', 'charge', true);
  await pg.keyboard.press('Escape');
  egal((await fenetre(pg)).length, 0, 'Échap la ferme');
  egal(await pg.evaluate(() => document.activeElement && document.activeElement.dataset.pePal), 'P5', 'focus sur la carte après Échap');
  egal(erreurs, [], 'erreurs JS');
});

await v('Palettier : chaque signalement ouvre la fenêtre — sans nouvelle adresse, un accusé de réception NEUTRE au « tu » (motif choisi, aucun jugement) ; en copie, « C’est noté. » sans adresse ; l’encart Système garde sa ligne courte', async () => {
  const texteF = () => texte(pg, '[data-pal-modal-texte]');
  const neutre = (id, nom, motif) => `Signalement enregistré pour ${id} (${nom}) : « ${motif} ». Le système ne donne pas d’autre adresse : la palette retourne en réception.`;
  await monter(pg, { scenario: 'signaler' });
  await signaler(pg, 'P7', 'B1-T01-N2-E1', 'abime', true);
  egal((await fenetre(pg)).length, 1, 'P7 : une fenêtre');
  egal(await texteF(), neutre('P7', 'Peluches', 'L’emplacement est abîmé'), 'P7 : texte neutre');
  egal(await texte(pg, '[data-pal-systeme] .pal-sys-actu'), 'Signalement enregistré.', 'l’encart garde sa ligne courte');
  await pg.click(`${Z} [data-pal-modal-ok]`);
  // Signalement à tort (P3, « occupé ») : le même texte neutre, ni « faux » ni point perdu.
  await signaler(pg, 'P3', 'A2-T02-N3-E1', 'occupe', true);
  egal(await texteF(), neutre('P3', 'Bougies parfumées', 'C’est occupé'), 'P3 à tort : texte neutre');
  vrai(!/(faux|erreur|point|raté|incorrect)/i.test(await texteF()), 'aucun jugement dans le texte');
  egal(await texte(pg, '[data-pal-etiq="P3"]'), 'Adresse A2-T02-N3-E1', 'pas de nouvelle adresse');
  await pg.click(`${Z} [data-pal-modal-ok]`);
  egal((await fenetre(pg)).length, 0, 'fermée');
  // Copie : toujours une fenêtre, jamais d'adresse.
  await monter(pg, { temps: 'evaluation' });
  await signaler(pg, 'P4', 'B1-T04-N2-E2', 'charge', true);
  egal(await texteF(), 'Signalement enregistré pour P4 (Peluches) : « La charge serait dépassée ». C’est noté.', 'copie : texte');
  egal(await texte(pg, '[data-pal-systeme] .pal-sys-actu'), 'C’est noté.', 'copie : encart');
  await pg.click(`${Z} [data-pal-modal-ok]`);
  await signaler(pg, 'P5', 'A1-T02-N3-E2', 'charge', true);
  egal(await texteF(), 'Signalement enregistré pour P5 (Lessive liquide 3 L) : « La charge serait dépassée ». C’est noté.', 'copie : P5 sans nouvelle adresse');
  vrai(!(await texteF()).includes('A1-T04-N2-E3'), 'jamais la nouvelle adresse en copie');
});

/* =========================================================== « Faire monter les palettes » */
await v('Palettier : « Faire monter les palettes » — grisé (avec son titre) tant que rien n’attend, même largeur que « Valider », actif dès qu’une palette est confiée, grisé après « Valider »', async () => {
  await monter(pg);
  egal(await texte(pg, '[data-pal="monter"]'), 'Faire monter les palettes', 'libellé');
  egal(await pg.isDisabled(`${Z} [data-pal="monter"]`), true, 'grisé sans palette à monter');
  vrai((await pg.getAttribute(`${Z} [data-pal="monter"]`, 'title')).includes('Aucune palette n’attend Kevin'), 'le titre dit pourquoi');
  const larg = await pg.evaluate((Z) => [...document.querySelectorAll(`${Z} [data-pal="valider"], ${Z} [data-pal="monter"]`)].map((b) => Math.round(b.getBoundingClientRect().width)), Z);
  egal(larg[0], larg[1], 'même largeur que « Valider mon rangement »');
  await ranger(pg, 'P3', 'A2-T02-N3-E1', 'confier');
  egal(await pg.isDisabled(`${Z} [data-pal="monter"]`), false, 'actif avec P3 « À monter »');
  await valider(pg);
  egal(await pg.isDisabled(`${Z} [data-pal="monter"]`), true, 'grisé après « Valider »');
  vrai((await pg.getAttribute(`${Z} [data-pal="monter"]`, 'title')).includes('validé'), 'titre après validation');
});

await v('Palettier : sans `monte`, « Faire monter » monte tout de suite ce qui attend (emplacement occupé, zone « À monter » vidée), publie `monter` et ouvre le message qui l’attend ; ce qui est confié ensuite attend la validation', async () => {
  await monter(pg, { volet: true });
  await ranger(pg, 'P3', 'A2-T02-N3-E1', 'confier');
  await ranger(pg, 'P4', 'B1-T04-N2-E2', 'confier');
  await bouton(pg, 'retour');
  egal([await mini(pg, 'A2-T02-N3-E1'), await mini(pg, 'B1-T04-N2-E2')], ['libre', 'libre'], 'pas encore montées');
  vrai(await present(pg, '[data-pal-amonter-p="P3"]') && await present(pg, '[data-pal-amonter-p="P4"]'), 'dans « À monter »');
  egal((await gestes(pg)).includes('entrepot:essai-palettier:monter'), false, 'pas de geste avant');
  await bouton(pg, 'monter');
  egal([await mini(pg, 'A2-T02-N3-E1'), await mini(pg, 'B1-T04-N2-E2')], ['eleve', 'eleve'], 'montées tout de suite, emplacements occupés');
  vrai(!(await present(pg, '[data-pal-amonter-p]')), 'la zone « À monter » est vide');
  egal(await texte(pg, '[data-pal-amonter-liste]'), 'À monter (Kevin) : aucune', 'la liste aussi');
  egal(await pg.isDisabled(`${Z} [data-pal="monter"]`), true, 'grisé : plus rien n’attend');
  vrai((await gestes(pg)).includes('entrepot:essai-palettier:monter'), 'geste `monter` publié');
  egal(await pg.evaluate(() => (window.__p.db.mails || []).filter((m) => m.subject === 'Kevin monte').length), 1, 'le message qui attend `monter` est arrivé');
  const e = await etat(pg);
  egal([e.monterDemande, e.monteesIds, e.valide], [true, ['P3', 'P4'], false], 'état : la demande et les palettes montées');
  egal(await texte(pg, '[data-pal-etat="P3"]'), 'montée en A2-T02-N3-E1', 'carte');
  // Une palette confiée APRÈS le bouton attend (la validation la montera : comportement d'avant).
  await ranger(pg, 'P1', 'A1-T03-N1-E2'); await ranger(pg, 'P2', 'B2-T02-N1-E3');
  await signaler(pg, 'P5', 'A1-T02-N3-E2', 'charge'); await ranger(pg, 'P5', 'A1-T04-N2-E3', 'confier');
  await bouton(pg, 'retour');
  egal(await mini(pg, 'A1-T04-N2-E3'), 'libre', 'P5 confiée après le bouton : pas montée');
  egal(await pg.isDisabled(`${Z} [data-pal="monter"]`), false, 'le bouton se réactive');
  await valider(pg);
  egal(await mini(pg, 'A1-T04-N2-E3'), 'eleve', 'la validation monte ce qui reste (`monte: validation`)');
  egal(await jalons(pg), tous('ok'), 'jalons');
});

await v('Palettier : avec `monte: (db) => …`, « Faire monter » envoie la demande (« Demande envoyée à Kevin. », rien ne monte), publie `monter` ; les palettes montent quand la base le dit ; la demande survit à un rechargement', async () => {
  await monter(pg, { monte: 'base', volet: true });
  await ranger(pg, 'P3', 'A2-T02-N3-E1', 'confier');
  await bouton(pg, 'monter');
  egal(await texte(pg, '[data-pal-systeme] .pal-sys-actu'), 'Demande envoyée à Kevin.', 'encart Système');
  await bouton(pg, 'retour');
  egal(await mini(pg, 'A2-T02-N3-E1'), 'libre', 'rien n’a monté');
  vrai(await present(pg, '[data-pal-amonter-p="P3"]'), 'P3 attend toujours');
  egal(await pg.isDisabled(`${Z} [data-pal="monter"]`), false, 'le bouton reste actif');
  vrai((await gestes(pg)).includes('entrepot:essai-palettier:monter'), 'geste publié');
  egal(await pg.evaluate(() => (window.__p.db.mails || []).filter((m) => m.subject === 'Kevin monte').length), 1, 'message arrivé');
  const e = await etat(pg);
  egal([e.monterDemande, e.monteesIds], [true, undefined], 'état : la demande, pas de liste (c’est la base qui décide)');
  // Rechargement : même base, nouvelle vue (le journal de l'écran est perdu).
  const copie = await pg.evaluate(() => JSON.parse(JSON.stringify(window.__p.db)));
  await monter(pg, { monte: 'base', db: copie });
  egal(await texte(pg, '[data-pal-systeme] .pal-sys-actu'), 'Demande envoyée à Kevin.', 'la demande se relit dans l’état');
  await pg.evaluate(() => { window.__p.db.kevinRepondu = true; document.querySelector('#palTest .ent-nav[data-vue="entrepot"]').click(); });
  egal(await mini(pg, 'A2-T02-N3-E1'), 'eleve', 'montée quand la base le dit');
  egal(await pg.isDisabled(`${Z} [data-pal="monter"]`), true, 'grisé : plus rien n’attend');
});

await v('Palettier : « Valider » avec une palette encore à monter (`monte(db)` faux) → confirmation enrichie, place-P3 ✗ ; après « Faire monter » et la réponse de Kevin → ✓ ; avec `monte: validation`, la validation monte et rien n’est dit', async () => {
  await monter(pg, { monte: 'base' });
  await juste(pg, ['P3']);
  await ranger(pg, 'P3', 'A2-T02-N3-E1', 'confier');
  if (await present(pg, '[data-pal="retour"]')) await bouton(pg, 'retour');
  await bouton(pg, 'valider');
  egal(await texte(pg, '[data-pal-confirme]').then((t) => t.split('Oui, valider')[0].trim()),
    'Des palettes attendent Kevin : elles ne compteront pas comme rangées. Valider quand même ? Tu ne pourras plus rien changer.', 'confirmation enrichie');
  await bouton(pg, 'validerOui');
  // Kevin n'a rien monté : les trois palettes confiées (P3, P4, et P5 à sa nouvelle adresse) ne sont pas rangées.
  egal(await jalons(pg), Object.assign(tous('ok'), { 'place-P3': 'ko', 'place-P4': 'ko', 'signale-P5': 'ko' }), 'confiées mais pas montées : pas rangées');
  egal(await texte(pg, '[data-pe-verd="P3"]'), '✗ adresse', 'verdict de P3');
  egal(await mini(pg, 'A2-T02-N3-E1'), 'libre', 'toujours pas montée');
  // Même rangement, mais Kevin a monté avant la validation : ok.
  await monter(pg, { monte: 'base' });
  await juste(pg, ['P3']);
  await ranger(pg, 'P3', 'A2-T02-N3-E1', 'confier');
  await bouton(pg, 'monter');
  await pg.evaluate(() => { window.__p.db.kevinRepondu = true; document.querySelector('#palTest .ent-nav[data-vue="entrepot"]').click(); });
  await valider(pg);
  egal(await jalons(pg), tous('ok'), 'montée avant la validation : rangée');
  egal((await etat(pg)).monteesValidation, ['P4', 'P5', 'P3'], 'état : ce que Kevin avait monté à la validation');
  // `monte: validation` : la validation monte ce qui reste, aucun avertissement, place ✓.
  await monter(pg);
  await juste(pg);
  await bouton(pg, 'retour');
  await bouton(pg, 'valider');
  vrai(!(await texte(pg, '[data-pal-confirme]')).includes('attendent'), 'pas d’avertissement : la validation monte');
  await bouton(pg, 'validerOui');
  egal(await jalons(pg), tous('ok'), 'monte: validation : tout ✓');
  egal(await mini(pg, 'A2-T02-N3-E1'), 'eleve', 'montée par la validation');
});

/* =========================================================== garde et gel */
await v('Palettier : inaction + « Valider » → tout ✗ (pasPoseHaut et charge aussi), jamais « à faire » ; une palette non traitée suffit à faire tomber les deux gardes', async () => {
  await monter(pg);
  await valider(pg);
  egal(await jalons(pg), tous('ko'), 'inaction');
  await monter(pg);
  await juste(pg, ['P4']);
  await valider(pg);
  egal(await jalons(pg), Object.assign(tous('ok'), { 'place-P4': 'ko', pasPoseHaut: 'ko', charge: 'ko' }), 'P4 restée en réception');
});

await v('Palettier : après « Valider », plus aucun geste — cartes désactivées, aucun bouton de pose, aucun geste publié même en ouvrant un emplacement', async () => {
  await monter(pg);
  // Aucun emplacement ouvert avant « Valider » : `ouvrir` n'est pas encore dans la base (elle ne retient que le premier).
  await prendre(pg, 'P1');
  await bouton(pg, 'valider');
  vrai((await texte(pg, '[data-pal-confirme]')).includes('Tu ne pourras plus rien changer'), 'confirmation');
  await bouton(pg, 'validerOui');
  const avant = await gestes(pg);
  vrai(avant.includes('entrepot:essai-palettier:valider'), 'valider publié');
  egal(await pg.$$eval(`${Z} .pe-bandeau [data-pe-pal]`, (L) => L.every((b) => b.disabled)), true, 'cartes désactivées');
  vrai((await texte(pg, '.pe-act')).includes('Rangement validé'), 'bouton');
  await pg.click(`${Z} [data-pe-trav="A1-T02"]`);
  await pg.click(`${Z} [data-pe-emp="A1-T02-N3-E2"]`);
  vrai(!(await present(pg, '[data-pal="poser"]')) && !(await present(pg, '[data-pal="signaler"]')), 'aucun bouton');
  egal(await gestes(pg), avant, 'aucun geste de plus (pas même « ouvrir »)');
  egal(avant, ['entrepot:essai-palettier:prendre:P1', 'entrepot:essai-palettier:valider'], 'gestes avant');
  const e = await etat(pg);
  egal([e.enMain, e.posees, e.valide], [null, {}, true], 'la palette en main retourne en réception, rien n’a bougé');
});

/* =========================================================== ce que montre la vue de près */
await v('Palettier : `aideCharge` — plaque seule : ni capteur, ni « déjà posé », ni somme, ni poids sur la travée ; « pose » : 789 kg déjà posés ; « somme » : 789 + 493 = 1 282 kg', async () => {
  await monter(pg, { aide: 'plaque' });
  await prendre(pg, 'P5'); await ouvrir(pg, 'A1-T02-N3-E2');
  egal(await texte(pg, '[data-pal-plaque]'), 'Charge max 1 200 kg par niveau', 'la plaque');
  vrai(!(await present(pg, '[data-pal-capteur]')) && !(await present(pg, '[data-pal-deja]')) && !(await present(pg, '[data-pal-somme]')) && !(await present(pg, '[data-pe-capteur]')), 'aucun capteur ni somme');
  egal(await pg.$$eval(`${Z} [data-pe-emp]`, (L) => L.filter((g) => /kg/.test(g.textContent) || /kg/.test(g.getAttribute('aria-label'))).length), 0, 'aucun poids sur un emplacement');
  await pg.click(`${Z} [data-pe-emp="A1-T02-N3-E1"]`);
  egal(await texte(pg, '[data-pal-occ]'), 'Occupé : Nettoyant multi-usages 1 L', 'l’occupant, sans son poids');
  await monter(pg, { aide: 'pose' });
  await prendre(pg, 'P5'); await ouvrir(pg, 'A1-T02-N3-E2');
  egal(await texte(pg, '[data-pal-deja]'), '789', 'déjà posé');
  vrai(!(await present(pg, '[data-pal-somme]')), 'pas de somme');
  vrai((await texte(pg, '[data-pe-emp="A1-T02-N3-E1"]')).includes('389 kg'), 'la travée garde ses poids');
  await monter(pg, { aide: 'somme' });
  await prendre(pg, 'P5'); await ouvrir(pg, 'A1-T02-N3-E2');
  egal(await texte(pg, '[data-pal-somme]'), 'Avec ta palette P5 : 789 + 493 = 1 282 kg', 'la somme');
  vrai(!/surcharge|dépass/i.test(await texte(pg, '[data-pal-pres]')), 'aucun jugement');
});

await v('Palettier : au niveau 1 (le sol), ni plaque ni capteur ; un emplacement hors service se dit', async () => {
  await monter(pg, { aide: 'somme' });
  await prendre(pg, 'P1'); await ouvrir(pg, 'A1-T03-N1-E2');
  vrai(!(await present(pg, '[data-pal-plaque]')) && !(await present(pg, '[data-pal-capteur]')) && !(await present(pg, '[data-pal-somme]')), 'rien au sol');
  egal(await texte(pg, '.pal-sol'), 'Au sol : pas de plaque de charge.', 'dit');
  await ouvrir(pg, 'B1-T01-N2-E1');
  egal(await pg.getAttribute(`${Z} [data-pal-occ]`, 'data-pal-occ'), 'hs', 'hors service');
});

await v('Palettier : `verdict` absent → aucun ✓ ni ✗ ; « critere » → le nom seul ; « adresse » → l’adresse attendue', async () => {
  await monter(pg, { verdict: null });
  await juste(pg, ['P2']);
  await valider(pg);
  vrai(!(await present(pg, '[data-pal-verdict]')) && !/[✓✗]/.test(await texte(pg, '.pe-bandeau')), 'rien sur les cartes');
  await monter(pg, { verdict: 'critere' });
  await juste(pg, ['P2']);
  await valider(pg);
  egal(await texte(pg, '[data-pe-verd="P2"]'), '✗ adresse', 'critère seul');
  await monter(pg, { verdict: 'adresse' });
  await juste(pg, ['P2']);
  await valider(pg);
  egal(await texte(pg, '[data-pe-verd="P2"]'), '✗ adresse · adresse attendue : B2-T02-N1-E3', 'critère et adresse');
});

/* =========================================================== copie */
await v('Palettier en copie : « C’est noté. », pas de nouvelle adresse, pas de règles ; « Valider » rend la copie, aucun verdict ; signale-P5 jugé sans nouvelle adresse', async () => {
  await monter(pg, { temps: 'evaluation', verdict: 'critere' });
  vrai(!(await present(pg, '[data-pe-regles]')), 'pas de « Les règles »');
  await signaler(pg, 'P5', 'A1-T02-N3-E2', 'charge');
  egal(await texte(pg, '[data-pal-systeme] .pal-sys-actu'), 'C’est noté.', 'le système');
  egal(await texte(pg, '[data-pal-etiq="P5"]'), 'Adresse A1-T02-N3-E2', 'pas de nouvelle adresse');
  egal((await etat(pg)).nouvelles, {}, 'état');
  await juste(pg, ['P5']);
  await valider(pg);
  vrai(!!(await pg.evaluate(() => window.__p.remis)), 'copie rendue');
  vrai(!(await present(pg, '[data-pal-verdict]')) && !/[✓✗]/.test(await texte(pg, '.pe-bandeau')), 'aucun verdict');
  egal(await jalons(pg), tous('ok'), 'jalons');
});

/* =========================================================== ce qu'une séance lit */
await v('Palettier : `palettesConfiees(db, P)` et `etatPalettier(db, P)` — ce que lira le message à Kevin', async () => {
  await monter(pg);
  const lire = () => pg.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    return { c: E.palettesConfiees(window.__p.db, window.__p.P), e: E.etatPalettier(window.__p.db, window.__p.P) };
  });
  egal((await lire()).c, [], 'rien de confié');
  await ranger(pg, 'P4', 'B1-T04-N2-E2', 'confier');
  await ranger(pg, 'P3', 'A2-T02-N3-E1', 'confier');
  await signaler(pg, 'P5', 'A1-T02-N3-E2', 'charge');
  const r = await lire();
  egal(r.c, [{ id: 'P3', nom: 'Bougies parfumées', adresse: 'A2-T02-N3-E1' }, { id: 'P4', nom: 'Peluches', adresse: 'B1-T04-N2-E2' }], 'confiées');
  egal(r.e, { enMain: null, posees: {}, confiees: { P4: 'B1-T04-N2-E2', P3: 'A2-T02-N3-E1' }, signalees: { P5: 'charge' },
    nouvelles: { P5: 'A1-T04-N2-E3' }, montees: [], tentativesHaut: 0, valide: false }, 'état en clair');
});

/* =========================================================== tiré par élève, niveaux */
await v('Palettier tiré par élève : deux graines, deux plans ; les étapes jugent la déclaration de CHAQUE élève (liste de jalons commune)', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const C = await import('/contenus/palettier-essai.js');
    // u-b : P1 et P2 échangent leurs adresses (valeurs à la main) ; tout autre élève : le cas d'essai.
    const fn = (g) => {
      const P = C.palettier({ aideCharge: 'pose' });
      if (g !== 'u-b') return P;
      return Object.assign({}, P, { palettes: P.palettes.map((p) => (p.id === 'P1' ? Object.assign({}, p, { adresse: 'B2-T02-N1-E3' })
        : p.id === 'P2' ? Object.assign({}, p, { adresse: 'A1-T03-N1-E2' }) : p)) });
    };
    const U = C.universPalettier({ entrepot: fn });
    const moteur = creerEntreprise(U);
    const bases = {}, vus = {};
    for (const uid of ['u-a', 'u-b']) {
      document.querySelector('#palTest')?.remove();
      const hote = document.createElement('div'); hote.id = 'palTest'; document.body.appendChild(hote);
      const db = bases[uid] = {};
      moteur.rendre(hote, { meta: { id: 'essai-palettier', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps: 'guidage' },
        profil: { prenom: 'Lea', role: 'eleve', uid }, jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {},
        codeStock: 'ABC', lireScore: async () => null, rendreCopie: async () => ({}) });
      document.querySelector('#palTest .ent-nav[data-vue="entrepot"]').click();
      vus[uid] = document.querySelector('#palTest [data-pal-etiq="P1"] b').textContent;
      // Les deux élèves posent P1 en A1-T03-N1-E2 et valident.
      db.entrepots['essai-palettier'] = Object.assign(db.entrepots['essai-palettier'], { posees: { P1: 'A1-T03-N1-E2' }, valide: true });
    }
    const J = (uid) => U.etapes.find((e) => e.id === 'place-P1').verifier(bases[uid]).status;
    return { vus, ids: U.etapes.map((e) => e.id), a: J('u-a'), b: J('u-b') };
  });
  egal(r.vus, { 'u-a': 'A1-T03-N1-E2', 'u-b': 'B2-T02-N1-E3' }, 'adresse de P1 à l’écran');
  egal(r.ids, ['place-P1', 'place-P2', 'place-P3', 'place-P4', 'signale-P5', 'place-P6', 'pasPoseHaut', 'charge'], 'jalons communs');
  egal([r.a, r.b], ['ok', 'ko'], 'la même pose est juste pour u-a, fausse pour u-b');
  const f = await pg.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/palettier-essai.js');
    try { E.etapesPalettier((g, { niveau }) => (niveau === 'confirme' ? Object.assign({}, C.PALETTIER, { palettes: C.PALETTIER.palettes.filter((p) => p.id !== 'P6') }) : C.PALETTIER)); return ''; } catch (e) { return e.message; }
  });
  vrai(f.includes('ne sont pas ceux du standard'), `une fonction qui change la liste selon le niveau : ${f}`);
});

await v('Palettier : P6 (`niveaux: [\'confirme\']`) absente en standard, présente au confirmé ; ses jalons sont bonus (null sans elle, jugés avec elle), la note du socle inchangée', async () => {
  await monter(pg, { aisance: 'confirme' });
  egal(await pg.$$eval(`${Z} .pe-bandeau [data-pe-pal]`, (L) => L.map((b) => b.dataset.pePal)), ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'], 'six cartes au confirmé');
  await juste(pg);
  await ranger(pg, 'P6', 'B2-T03-N4-E1', 'confier');
  await valider(pg);
  const r = await pg.evaluate(() => {
    const W = window.__p;
    const e = W.U.etapes.find((x) => x.id === 'place-P6');
    return { bonus: e.bonus, poids: 'poids' in e, conf: e.verifier(W.db), std: e.verifier({ entrepots: W.db.entrepots, aisance: 'standard' }),
      note: W.moteur.noter(W.db) };
  });
  egal([r.bonus, r.poids, r.conf, r.std], [true, false, { status: 'ok' }, null], 'jalon bonus');
  egal([r.note.score, r.note.detail.bonus && r.note.detail.bonus.justes], [20, 1], 'note du socle 20, un cas bonus juste');
  await monter(pg);
  await juste(pg);
  await valider(pg);
  egal(Object.keys(await jalons(pg)).includes('place-P6'), false, 'standard : pas de jalon P6');
  egal((await pg.evaluate(() => window.__p.moteur.noter(window.__p.db))).score, 20, 'standard : 20 sans P6');
});

/* =========================================================== à l'écran */
await v('Palettier : la page d’essai tient en 1366 × 768 et 1280 × 720 sans défiler (plan, travée ouverte avec la vue de près, motifs) ; boutons visibles', async () => {
  const pe = await ctx.newPage();
  const err = [];
  pe.on('pageerror', (e) => err.push(e.message));
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
  await pe.setViewportSize({ width: w, height: h });
  await pe.goto(BASE + 'outils/essai-palettier.html');
  await pe.waitForSelector('.pal');
  await pe.evaluate(() => { document.querySelector('#reglages').style.display = 'none'; document.querySelector('#mention').style.display = 'none'; document.querySelector('.ent-nav[data-vue="entrepot"]').click(); });
  const deborde = () => pe.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
  const d = [await deborde()];
  await pe.click('.pal .pe-bandeau [data-pe-pal="P5"]');
  await pe.click('.pal [data-pe-trav="A1-T02"]');
  await pe.click('.pal [data-pe-emp="A1-T02-N3-E2"]');
  d.push(await deborde());
  const vu = (s) => pe.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth; }, s);
  egal([await vu('.pal [data-pal="poser"]'), await vu('.pal [data-pal="confier"]'), await vu('.pal [data-pal="signaler"]')], [true, true, true], `les trois boutons à ${w} × ${h}`);
  await pe.click('.pal [data-pal="signaler"]');
  d.push(await deborde());
  egal(await vu('.pal [data-pal="signalerNon"]'), true, `les motifs et « Annuler » à ${w} × ${h}`);
  egal(d, [0, 0, 0], `pixels qui dépassent à ${w} × ${h} (plan, vue de près, motifs)`);
  }
  egal(err, [], 'erreurs JS');
  await pe.close();
});

await v('Palettier : Échap referme les motifs, puis la vue de près, puis la travée', async () => {
  await monter(pg);
  await prendre(pg, 'P5'); await ouvrir(pg, 'A1-T02-N3-E2'); await bouton(pg, 'signaler');
  const lu = () => pg.evaluate(() => { const L = document.querySelector('#palTest .pal'); return [!!L.querySelector('[data-pal-motifs]'), L.querySelector('[data-pal-pres]') ? L.querySelector('[data-pal-pres]').dataset.palPres : null, L.dataset.peOuverte]; });
  egal(await lu(), [true, 'A1-T02-N3-E2', 'true'], 'départ');
  await pg.keyboard.press('Escape');
  egal(await lu(), [false, 'A1-T02-N3-E2', 'true'], 'motifs refermés');
  await pg.keyboard.press('Escape');
  egal(await lu(), [false, '', 'true'], 'vue de près refermée');
  await pg.keyboard.press('Escape');
  egal(await lu(), [false, null, 'false'], 'retour au plan');
});

/* =========================================================== le scan (lot 2, 22/10/2026) */
// Aides du scan. Un scan de palette = un clic sur son étiquette (la carte, en haut) ; un scan d'emplacement = un clic sur l'étiquette
// d'adresse de la vue de près (celle de l'emplacement ouvert).
const scanPal = (p, id) => p.click(`${Z} .pe-bandeau [data-pal-scan-pal="${id}"]`);
const scanEmp = (p) => p.click(`${Z} [data-pal-scan-emp]`);
const lignesTerm = (p) => p.$$eval(`${Z} [data-terminal] .vt-passe`, (L) => L.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
const lignesRouges = (p) => p.$$eval(`${Z} [data-terminal] .vt-passe.vt-ko`, (L) => L.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
const derniere = async (p) => { const L = await lignesTerm(p); return L[L.length - 1]; };
const croit = (p, id) => p.evaluate(async (id) => { const E = await import('/core/types/entrepot.js'); return E.ouSystemeCroit(window.__p.db, window.__p.P, id); }, id);
const AD = { P1: 'A1-T03-N1-E2', P2: 'B2-T02-N1-E3', P3: 'A2-T02-N3-E1', P4: 'B1-T04-N2-E2', P5: 'A1-T04-N2-E3' };
// (L'ordre des clés est celui de `jalons` : chaque scan-P juste après son place-P ou signale-P.)
const tousScan = (j) => ({ 'place-P1': j, 'scan-P1': j, 'place-P2': j, 'scan-P2': j, 'place-P3': j, 'scan-P3': j, 'place-P4': j, 'scan-P4': j,
  'signale-P5': j, 'scan-P5': j, pasPoseHaut: j, charge: j });
// Le parcours juste AVEC les deux scans, palette par palette (`sauf` : les palettes laissées de côté).
async function justeScan(p, sauf = []) {
  await juste(p, sauf);
  for (const id of ['P1', 'P2', 'P3', 'P4', 'P5']) {
    if (sauf.includes(id)) continue;
    await scanPal(p, id); await ouvrir(p, AD[id]); await scanEmp(p);
  }
}

await v('Scan : avec `terminal`, le Terminal remplace l’encart « Système » — en-tête TERMINAL, sans champ ni bouton, « Scanne la palette. » ; une étiquette « Scanner » par carte ; 33 gestes ; jalons scan-P1 à scan-P5 à faire', async () => {
  await monter(pg, { terminal: 'deux' });
  egal(await texte(pg, '[data-terminal] .vt-tete'), 'TERMINAL', 'en-tête');
  egal(await pg.getAttribute(`${Z} [data-terminal] [role="group"]`, 'aria-label'), 'Terminal', 'étiquette d’accessibilité');
  vrai(!(await present(pg, '[data-pal-systeme]')), 'plus d’encart « Système »');
  vrai(!/sans son|vocal/i.test(await texte(pg, '[data-terminal]')), 'ni « sans son » ni « vocal »');
  egal(await texte(pg, '[data-vt-actu]'), 'Scanne la palette.', 'la phrase en cours');
  egal(await pg.$$eval(`${Z} [data-terminal] input, ${Z} [data-terminal] button, ${Z} [data-terminal] form`, (L) => L.length), 0, 'aucun champ à taper');
  egal(await pg.$$eval(`${Z} .pe-bandeau [data-pal-scan-pal]`, (L) => L.map((b) => b.dataset.palScanPal)), ['P1', 'P2', 'P3', 'P4', 'P5'], 'une étiquette à scanner par carte');
  const e = await etat(pg);
  egal([e.scan, e.scansRefuses, e.terminal.journal, e.terminal.attente], [{}, 0, [], 'Scanne la palette.'], 'état');
  egal(await jalons(pg), tousScan('attente'), 'jalons à faire');
  const S = await pg.evaluate(async () => { const { creerEntrepot } = await import('/core/types/entrepot.js'); const C = await import('/contenus/palettier-essai.js'); return creerEntrepot(C.palettier({ terminal: true })).signaux; });
  egal([S.length, S.filter((g) => g.includes(':scan:')).sort()], [33, ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map((id) => `entrepot:essai-palettier:scan:${id}`)], 'un geste scan par palette');
  egal(erreurs, [], 'erreurs JS');
});

await v('Scan : palette posée mais jamais scannée + « Valider » → scan-P ko, place-P ok, « ✗ scan » sur la carte ; le système la croit à l’adresse donnée (la nouvelle adresse pour P5)', async () => {
  await monter(pg, { terminal: 'deux' });
  await juste(pg);
  egal(await jalons(pg), tousScan('attente'), 'avant la validation');
  egal(await texte(pg, '[data-pal-etat="P1"]'), 'posée en A1-T03-N1-E2 · à scanner', 'la carte le dit');
  egal(await texte(pg, '[data-pal-etat="P3"]'), 'à monter (Kevin) · à scanner', 'confiée aussi');
  await valider(pg);
  egal(await jalons(pg), Object.assign(tousScan('ko'), { 'place-P1': 'ok', 'place-P2': 'ok', 'place-P3': 'ok', 'place-P4': 'ok', 'signale-P5': 'ok', pasPoseHaut: 'ok', charge: 'ok' }), 'place ok, scan ko');
  egal(await texte(pg, '[data-pe-verd="P1"]'), '✗ scan', 'verdict « critere »');
  egal([await croit(pg, 'P1'), await croit(pg, 'P3'), await croit(pg, 'P5')], ['A1-T03-N1-E2', 'A2-T02-N3-E1', 'A1-T04-N2-E3'], 'ce que le système croit : adresse donnée, nouvelle adresse reçue');
});

await v('Scan : la palette (étiquette), puis l’emplacement juste → « Confirmé. » dans le journal, scan-P ok, geste `scan:P1` publié (un message qui l’attend arrive), la carte dit « scannée »', async () => {
  await monter(pg, { terminal: 'deux', volet: 'entrepot:essai-palettier:scan:P1' });
  await ranger(pg, 'P1', AD.P1);
  await scanPal(pg, 'P1');
  egal(await texte(pg, '[data-vt-actu]'), 'P1 — Cahiers grand format. Scanne l’emplacement.', 'la palette est scannée');
  egal((await etat(pg)).scanAttente, 'P1', 'état : l’emplacement est attendu');
  egal((await gestes(pg)).includes('entrepot:essai-palettier:scan:P1'), false, 'pas de geste au premier scan');
  await scanEmp(pg);
  egal(await derniere(pg), 'A1-T03-N1-E2 — Cahiers grand format — 30 cartons. Confirmé.', 'journal');
  egal(await texte(pg, '[data-vt-actu]'), 'Scanne la palette.', 'on repart');
  egal(await lignesRouges(pg), [], 'aucun refus');
  const e = await etat(pg);
  egal([e.scan, e.scanAttente, e.scansRefuses], [{ P1: AD.P1 }, null, 0], 'état');
  vrai((await gestes(pg)).includes('entrepot:essai-palettier:scan:P1'), 'geste scan:P1');
  egal(await pg.evaluate(() => (window.__p.db.mails || []).filter((m) => m.subject === 'Kevin monte').length), 1, 'le message qui attend scan:P1 est arrivé');
  egal(await texte(pg, '[data-pal-etat="P1"]'), 'posée en A1-T03-N1-E2 · scannée', 'la carte');
  egal(await croit(pg, 'P1'), AD.P1, 'ce que le système croit');
  await justeScan(pg, ['P1']);
  await valider(pg);
  egal(await jalons(pg), tousScan('ok'), 'parcours complet : tout juste');
  egal(await pg.$$eval(`${Z} [data-pal-verdict]`, (L) => L.map((s) => s.textContent.trim())), Array(5).fill('✓ bien rangée'), 'verdicts');
  egal((await pg.evaluate(() => window.__p.moteur.noter(window.__p.db))).score, 20, 'note du socle : 20');
  egal(erreurs, [], 'erreurs JS');
});

await v('Scan : un autre emplacement, ou l’adresse attendue où la palette n’est pas → refus en rouge (sans aplat), compté en trace ; rien d’autre ne change ; scan-P ko après « Valider »', async () => {
  await monter(pg, { terminal: 'deux' });
  await ranger(pg, 'P1', 'A1-T01-N1-E2');
  await scanPal(pg, 'P1'); await scanEmp(pg);
  egal(await lignesRouges(pg), ['Ce n’est pas l’adresse de cette palette.'], 'refus : posée ailleurs');
  egal(await pg.$eval(`${Z} .vt-passe.vt-ko`, (x) => [getComputedStyle(x).backgroundColor, getComputedStyle(x).color]), ['rgba(0, 0, 0, 0)', 'rgb(255, 156, 156)'], 'texte rouge clair, aucun aplat');
  let e = await etat(pg);
  egal([e.scan, e.scansRefuses, e.scanAttente, e.posees], [{}, 1, 'P1', { P1: 'A1-T01-N1-E2' }], 'état : rien confirmé, un refus, la palette attend toujours son emplacement');
  egal(await texte(pg, '[data-vt-actu]'), 'P1 — Cahiers grand format. Scanne l’emplacement.', 'la phrase attendue ne change pas');
  await ouvrir(pg, AD.P1); await scanEmp(pg);
  egal((await lignesRouges(pg)).length, 2, 'refus : l’adresse attendue, mais la palette n’y est pas');
  e = await etat(pg);
  egal([e.scan, e.scansRefuses], [{}, 2], 'deux refus');
  vrai(!(await lignesTerm(pg)).some((l) => l.includes('Confirmé')), 'jamais « Confirmé. »');
  await juste(pg, ['P1']);
  await valider(pg);
  egal(await jalons(pg), Object.assign(tousScan('ko'), { 'place-P1': 'ko', 'place-P2': 'ok', 'place-P3': 'ok', 'place-P4': 'ok', 'signale-P5': 'ok', pasPoseHaut: 'ok', charge: 'ok' }), 'place-P1 et scan-P1 ko');
  // L'enseignant voit la trace, l'élève non.
  await monter(pg, { terminal: 'deux', role: 'prof' });
  await ranger(pg, 'P1', 'A1-T01-N1-E2'); await scanPal(pg, 'P1'); await scanEmp(pg);
  egal(await texte(pg, '[data-pal-scans-refuses]'), 'Scans refusés (trace, non notée) : 1', 'côté enseignant');
  await monter(pg, { terminal: 'deux' });
  vrai(!(await present(pg, '[data-pal-scans-refuses]')), 'rien de tel côté élève');
});

await v('Scan : l’emplacement avant la palette → « Scanne d’abord la palette. » ; une palette en réception ou en main → « Range d’abord la palette. » ; ni l’un ni l’autre ne laisse de trace', async () => {
  await monter(pg, { terminal: 'deux' });
  await ranger(pg, 'P1', AD.P1);
  await scanEmp(pg);
  egal(await lignesRouges(pg), ['Scanne d’abord la palette.'], 'emplacement d’abord');
  let e = await etat(pg);
  egal([e.scan, e.scansRefuses, e.scanAttente ?? null], [{}, 0, null], 'aucune trace');
  await monter(pg, { terminal: 'deux' });
  await scanPal(pg, 'P1');
  egal(await lignesRouges(pg), ['Range d’abord la palette.'], 'palette en réception');
  egal(await texte(pg, '[data-vt-actu]'), 'Scanne la palette.', 'rien n’est en attente');
  await prendre(pg, 'P2'); await scanPal(pg, 'P2');
  egal(await lignesRouges(pg), ['Range d’abord la palette.', 'Range d’abord la palette.'], 'palette en main');
  await signaler(pg, 'P5', 'A1-T02-N3-E2', 'charge'); await scanPal(pg, 'P5');
  egal((await lignesRouges(pg)).length, 3, 'palette signalée (retournée en réception)');
  e = await etat(pg);
  egal([e.scan, e.scansRefuses, e.scanAttente ?? null], [{}, 0, null], 'aucune trace');
});

await v('Scan : P5 signalée — le scan à l’adresse d’origine est refusé (même palette confiée là), à la nouvelle adresse confirmé ; jamais signalée : l’adresse d’origine est celle que le système attend', async () => {
  await monter(pg, { terminal: 'deux' });
  await signaler(pg, 'P5', 'A1-T02-N3-E2', 'charge');
  vrai((await lignesTerm(pg)).includes('Nouvelle adresse : A1-T04-N2-E3.'), 'le système donne la nouvelle adresse (journal du Terminal)');
  await ranger(pg, 'P5', 'A1-T02-N3-E2', 'confier');
  await scanPal(pg, 'P5'); await scanEmp(pg);
  egal(await lignesRouges(pg), ['Ce n’est pas l’adresse de cette palette.'], 'adresse d’origine refusée');
  egal([(await etat(pg)).scan, (await etat(pg)).scansRefuses], [{}, 1], 'rien de confirmé, un refus');
  await ranger(pg, 'P5', AD.P5, 'confier');   // « ranger » reprend la palette confiée à l'origine (sans scan)
  await scanPal(pg, 'P5'); await scanEmp(pg);
  egal(await derniere(pg), 'A1-T04-N2-E3 — Lessive liquide 3 L — 36 cartons. Confirmé.', 'nouvelle adresse confirmée');
  egal([(await etat(pg)).scan, await croit(pg, 'P5')], [{ P5: AD.P5 }, AD.P5], 'état et ce que croit le système');
  // Jamais signalée : le système attend toujours l'adresse d'origine.
  await monter(pg, { terminal: 'deux' });
  await ranger(pg, 'P5', 'A1-T02-N3-E2', 'confier');
  await scanPal(pg, 'P5'); await scanEmp(pg);
  egal(await derniere(pg), 'A1-T02-N3-E2 — Lessive liquide 3 L — 36 cartons. Confirmé.', 'confirmé : le système ne juge pas la charge, le jalon place le fait');
  await valider(pg);
  const J = await jalons(pg);
  egal([J['scan-P5'], J['signale-P5'], J.charge], ['ok', 'ko', 'ko'], 'scan-P5 ok, signale-P5 et charge ko : chaque jalon juge son geste');
  // Une palette signalée SANS nouvelle adresse (P7, P8) ne se range pas, donc ne se scanne pas : pas de jalon scan pour elle.
  await monter(pg, { terminal: 'deux', scenario: 'signaler' });
  const K = Object.keys(await jalons(pg));
  egal([K.includes('scan-P5'), K.includes('signale-P7'), K.includes('scan-P7'), K.includes('scan-P8')], [true, true, false, false], 'jalons scan : P5 oui, P7 et P8 non');
});

await v('Scan : une palette confiée se scanne dans la zone « À monter » (clic, ou Entrée au clavier) puis à son emplacement de destination, montée ou non ; scan-P ok', async () => {
  await monter(pg, { terminal: 'deux' });
  await ranger(pg, 'P3', AD.P3, 'confier');
  await bouton(pg, 'retour');
  await pg.click(`${Z} [data-pal-scan-pal="P3"][data-pe-cle="scanpalzone:P3"]`);
  egal(await texte(pg, '[data-vt-actu]'), 'P3 — Bougies parfumées. Scanne l’emplacement.', 'scannée dans la zone');
  await ouvrir(pg, AD.P3); await scanEmp(pg);
  egal(await derniere(pg), 'A2-T02-N3-E1 — Bougies parfumées — 60 cartons. Confirmé.', 'confirmée, pas encore montée');
  egal(await texte(pg, '[data-pal-etat="P3"]'), 'à monter (Kevin) · scannée', 'la carte');
  // Au clavier, sur la zone de l'allée B.
  await ranger(pg, 'P4', AD.P4, 'confier');
  await bouton(pg, 'retour');
  await pg.focus(`${Z} [data-pal-scan-pal="P4"][data-pe-cle="scanpalzone:P4"]`);
  await pg.keyboard.press('Enter');
  egal(await texte(pg, '[data-vt-actu]'), 'P4 — Peluches. Scanne l’emplacement.', 'Entrée sur la zone');
  await valider(pg);
  const J = await jalons(pg);
  egal([J['scan-P3'], J['scan-P4']], ['ok', 'ko'], 'P3 scannée, P4 non');
});

await v('Scan : la palette de la vue de près se scanne aussi ; une palette reprise perd son scan, et la palette en attente est oubliée', async () => {
  await monter(pg, { terminal: 'deux' });
  await ranger(pg, 'P1', AD.P1);
  await pg.click(`${Z} [data-pal-ta-pal="P1"] [data-pal-scan-pal="P1"]`);
  egal(await texte(pg, '[data-vt-actu]'), 'P1 — Cahiers grand format. Scanne l’emplacement.', 'depuis la vue de près');
  await scanEmp(pg);
  egal((await etat(pg)).scan, { P1: AD.P1 }, 'scannée');
  await prendre(pg, 'P1');
  egal([(await etat(pg)).scan, await texte(pg, '[data-pal-etat="P1"]')], [{}, 'en main'], 'reprise : le scan est effacé');
  await ouvrir(pg, AD.P1); await bouton(pg, 'poser');
  egal(await texte(pg, '[data-pal-etat="P1"]'), 'posée en A1-T03-N1-E2 · à scanner', 'reposée : à scanner de nouveau');
  await scanPal(pg, 'P1');
  egal((await etat(pg)).scanAttente, 'P1', 'en attente');
  await prendre(pg, 'P1');
  egal([(await etat(pg)).scanAttente ?? null, await texte(pg, '[data-vt-actu]')], [null, 'Scanne la palette.'], 'reprise : plus rien en attente');
  // Scanner une autre palette remplace l'attente.
  await bouton(pg, 'poser');
  await ranger(pg, 'P2', AD.P2);
  await scanPal(pg, 'P1'); await scanPal(pg, 'P2');
  egal(await texte(pg, '[data-vt-actu]'), 'P2 — Serviettes de bain. Scanne l’emplacement.', 'un seul scan de palette en attente à la fois');
});

await v('Scan en un clic (`scan: \'emplacement\'`) : l’étiquette de l’emplacement confirme la palette qui s’y trouve ; aucune étiquette de palette ; refus si rien n’y est posé ou si ce n’est pas son adresse', async () => {
  await monter(pg, { terminal: 'un' });
  egal(await texte(pg, '[data-vt-actu]'), 'Scanne l’emplacement.', 'phrase');
  vrai(!(await present(pg, '[data-pal-scan-pal]')) && !(await present(pg, '.pal-cwrap')), 'aucune étiquette de palette à scanner');
  await ranger(pg, 'P1', AD.P1);
  vrai(!(await present(pg, '[data-pal-ta-pal]')), 'ni dans la vue de près');
  await scanEmp(pg);
  egal(await derniere(pg), 'A1-T03-N1-E2 — Cahiers grand format — 30 cartons. Confirmé.', 'un seul clic');
  egal([(await etat(pg)).scan, (await gestes(pg)).includes('entrepot:essai-palettier:scan:P1')], [{ P1: AD.P1 }, true], 'état et geste');
  await ouvrir(pg, 'A1-T01-N1-E2'); await scanEmp(pg);
  egal(await derniere(pg), 'Aucune palette n’est posée ici.', 'emplacement sans palette');
  egal((await etat(pg)).scansRefuses, 0, 'sans trace');
  await ranger(pg, 'P2', 'A1-T01-N1-E2'); await scanEmp(pg);
  egal(await derniere(pg), 'Ce n’est pas l’adresse de cette palette.', 'palette posée ailleurs');
  egal((await etat(pg)).scansRefuses, 1, 'refus compté');
  await juste(pg, ['P1', 'P2']);
  await valider(pg);
  const J = await jalons(pg);
  egal([J['scan-P1'], J['scan-P2'], J['place-P2'], J['scan-P3']], ['ok', 'ko', 'ko', 'ko'], 'jalons');
});

await v('Scan en copie : les phrases du Terminal (« Confirmé. », le refus) restent dites ; « Valider » rend la copie, aucun verdict ni « ✗ » dans la page ; les jalons scan-P sont jugés', async () => {
  await monter(pg, { terminal: 'deux', temps: 'evaluation' });
  await ranger(pg, 'P1', AD.P1);
  await scanPal(pg, 'P1'); await scanEmp(pg);
  egal(await derniere(pg), 'A1-T03-N1-E2 — Cahiers grand format — 30 cartons. Confirmé.', '« Confirmé. » en copie');
  await ranger(pg, 'P2', 'A1-T01-N1-E2');
  await scanPal(pg, 'P2'); await scanEmp(pg);
  egal(await lignesRouges(pg), ['Ce n’est pas l’adresse de cette palette.'], 'le refus aussi');
  await juste(pg, ['P1', 'P2']);
  await valider(pg);
  vrai(!!(await pg.evaluate(() => window.__p.remis)), 'copie rendue');
  vrai(!(await present(pg, '[data-pal-verdict]')) && !(await texte(pg, '')).includes('✗') && !(await texte(pg, '.pe-bandeau')).includes('✓'), 'aucun verdict : pas de ✗ dans la page, pas de ✓ sur les cartes');
  const J = await jalons(pg);
  egal([J['scan-P1'], J['scan-P2'], J['place-P2']], ['ok', 'ko', 'ko'], 'jalons jugés');
  egal(await texte(pg, '[data-vt-actu]'), 'Terminé.', 'le Terminal a fini');
});

await v('Scan : sans `terminal`, le lot 1 tel quel — encart « Système », aucun boîtier, aucune étiquette cliquable, aucun jalon `scan-`, aucune clé de scan dans l’état ni dans `etatPalettier`', async () => {
  await monter(pg);
  vrai(await present(pg, '[data-pal-systeme]'), 'encart « Système »');
  const sel = ['[data-terminal]', '[data-pal-term]', '[data-pal-scan-pal]', '[data-pal-scan-emp]', '.pal-cwrap', '.pal-scannable', '[data-pal-ta-pal]'];
  egal(await pg.$$eval(Z, (R, s) => s.filter((q) => R[0].querySelector(q)), sel), [], 'rien du scan');
  await ranger(pg, 'P1', AD.P1);
  vrai(!(await present(pg, '[data-pal-scan-emp]')) && !(await present(pg, '[data-pal-ta-pal]')), 'ni étiquette cliquable ni palette à scanner dans la vue de près');
  egal(await pg.$eval(`${Z} [data-pal-etiq-emp]`, (x) => x.tagName), 'DIV', 'l’étiquette d’emplacement n’est pas un bouton');
  egal(await texte(pg, '[data-pal-etat="P1"]'), 'posée en A1-T03-N1-E2', 'la carte ne parle pas de scan');
  const e = await etat(pg);
  egal(['scan', 'scansRefuses', 'scanAttente', 'terminal'].filter((k) => k in e), [], 'état sans clé de scan');
  egal(Object.keys(await jalons(pg)).filter((k) => k.startsWith('scan-')), [], 'aucun jalon scan-');
  const r = await pg.evaluate(async () => { const E = await import('/core/types/entrepot.js'); return { e: Object.keys(E.etatPalettier(window.__p.db, window.__p.P)), o: E.ouSystemeCroit(window.__p.db, window.__p.P, 'P1') }; });
  egal([r.e.includes('scans'), r.e.includes('scansRefuses'), r.o], [false, false, AD.P1], 'etatPalettier sans scan ; ouSystemeCroit rend l’adresse donnée');
});

await v('Terminal : `nom` remplace « TERMINAL VOCAL » (en-tête, étiquette d’accessibilité) et retire « sans son » ; absent, tout reste comme avant ; le mode « scanner » n’a ni champ ni bouton et alimente son journal', async () => {
  const r = await pg.evaluate(async () => {
    const T = await import('/core/types/terminal.js');
    const L = [{ id: 'M1', lieu: 'Lieu.', code: '12', question: 'Combien ?' }];
    const lire = (h) => { const d = document.createElement('div'); d.innerHTML = h; return d; };
    const avec = lire(T.creerTerminal({ lignes: L, nom: 'Terminal' }).html(T.terminalNeuf()));
    const sans = lire(T.creerTerminal({ lignes: L }).html(T.terminalNeuf()));
    const S = T.creerTerminal({ nom: 'Terminal', mode: 'scanner' });
    const N = T.terminalScannerNeuf();
    S.dire(N, 'Une ligne.'); S.dire(N, 'Un refus.', { refus: true }); S.attendre(N, 'Scanne la palette.');
    const sc = lire(S.html(N));
    return { avecTete: avec.querySelector('.vt-tete').textContent.trim(), avecLabel: avec.querySelector('[role="group"]').getAttribute('aria-label'), avecSon: !!avec.querySelector('.vt-son'), avecChamp: !!avec.querySelector('input'),
      sansTete: sans.querySelector('.vt-tete').textContent.trim(), sansLabel: sans.querySelector('[role="group"]').getAttribute('aria-label'),
      scTete: sc.querySelector('.vt-tete').textContent.trim(), scChamp: sc.querySelectorAll('input, button, form').length, scRouge: [...sc.querySelectorAll('.vt-ko')].map((x) => x.textContent),
      scPasse: [...sc.querySelectorAll('.vt-passe')].map((x) => x.textContent), scActu: sc.querySelector('[data-vt-actu]').textContent };
  });
  egal([r.avecTete, r.avecLabel, r.avecSon, r.avecChamp], ['TERMINAL', 'Terminal', false, true], 'avec un nom (mode ordinaire : le champ reste)');
  egal([r.sansTete.startsWith('TERMINAL VOCAL'), r.sansTete.endsWith('sans son'), r.sansLabel], [true, true, 'Terminal vocal'], 'sans nom : « TERMINAL VOCAL » et « sans son », comme avant');
  egal([r.scTete, r.scChamp, r.scRouge, r.scPasse, r.scActu], ['TERMINAL', 0, ['Un refus.'], ['Une ligne.', 'Un refus.'], 'Scanne la palette.'], 'mode scanner');
});

await v('Scan : les lignes du système (nouvelle adresse, demande à Kevin) vont dans le journal du Terminal et survivent à un rechargement ; la fenêtre « Message du système » s’ouvre toujours', async () => {
  await monter(pg, { terminal: 'deux', monte: 'base' });
  await ranger(pg, 'P3', AD.P3, 'confier');
  await bouton(pg, 'monter');
  egal(await derniere(pg), 'Demande envoyée à Kevin.', 'demande envoyée');
  await signaler(pg, 'P5', 'A1-T02-N3-E2', 'charge', true);
  egal((await fenetre(pg)).length, 1, 'la fenêtre s’ouvre');
  egal(await texte(pg, '[data-pal-modal-texte]'), 'Nouvelle adresse pour P5 (Lessive liquide 3 L) : A1-T04-N2-E3.', 'texte de la fenêtre');
  await pg.click(`${Z} [data-pal-modal-ok]`);
  egal((await lignesTerm(pg)).slice(-2), ['Demande envoyée à Kevin.', 'Nouvelle adresse : A1-T04-N2-E3.'], 'journal');
  const copie = await pg.evaluate(() => JSON.parse(JSON.stringify(window.__p.db)));
  await monter(pg, { terminal: 'deux', monte: 'base', db: copie });
  egal((await lignesTerm(pg)).slice(-2), ['Demande envoyée à Kevin.', 'Nouvelle adresse : A1-T04-N2-E3.'], 'après un rechargement');
  vrai(!(await present(pg, '[data-pal-systeme]')), 'jamais d’encart « Système »');
});

await v('Scan : verdict « adresse » — « ✗ scan · adresse attendue : … » sur une palette posée juste mais non scannée ; « ✓ bien rangée » une fois scannée', async () => {
  await monter(pg, { terminal: 'deux', verdict: 'adresse' });
  await justeScan(pg, ['P2']);
  await valider(pg);
  egal([await texte(pg, '[data-pe-verd="P2"]'), await texte(pg, '[data-pe-verd="P1"]'), await texte(pg, '[data-pe-verd="P5"]')],
    ['✗ adresse, scan · adresse attendue : B2-T02-N1-E3', '✓ bien rangée', '✓ bien rangée'], 'P2 jamais posée ni scannée');
  await monter(pg, { terminal: 'deux', verdict: 'adresse' });
  await juste(pg, ['P5']);
  await signaler(pg, 'P5', 'A1-T02-N3-E2', 'charge'); await ranger(pg, 'P5', AD.P5, 'confier');
  await valider(pg);
  egal([await texte(pg, '[data-pe-verd="P5"]'), await texte(pg, '[data-pe-verd="P1"]')], ['✗ scan · adresse attendue : A1-T04-N2-E3', '✗ scan · adresse attendue : A1-T03-N1-E2'], 'rien de scanné');
});

await v('Palettier (retouche du 22/10) : une palette bonus du confirmé laissée en réception ne coûte ni `charge` ni `pasPoseHaut` ; une palette du socle laissée en réception les coûte toujours', async () => {
  await monter(pg, { aisance: 'confirme' });
  await juste(pg);
  await valider(pg);
  const J = await jalons(pg);
  egal([J['place-P6'], J.charge, J.pasPoseHaut, J['place-P1']], ['ko', 'ok', 'ok', 'ok'], 'P6 oubliée : place-P6 ko seul');
  await monter(pg, { aisance: 'confirme' });
  await juste(pg, ['P4']);
  await valider(pg);
  const K = await jalons(pg);
  egal([K.charge, K.pasPoseHaut], ['ko', 'ko'], 'P4 (socle) oubliée : les deux gardes tombent');
});

await v('Palettier (retouche du 22/10) : `regles.ouvertes: true` — « Les règles ▾ » dépliées au chargement en guidage, repliées sinon (absent, entraînement, copie : pas de volet) ; l’élève peut les replier et elles le restent', async () => {
  await monter(pg);
  egal(await pg.$eval(`${Z} [data-pe-regles]`, (d) => d.open), false, 'absent : repliées');
  await monter(pg, { reglesOuvertes: true });
  egal(await pg.$eval(`${Z} [data-pe-regles]`, (d) => d.open), true, 'ouvertes en guidage');
  await pg.click(`${Z} [data-pe-regles] summary`);
  egal(await pg.$eval(`${Z} [data-pe-regles]`, (d) => d.open), false, 'repliées par l’élève');
  await prendre(pg, 'P1');
  egal(await pg.$eval(`${Z} [data-pe-regles]`, (d) => d.open), false, 'elles le restent après un nouveau dessin');
  await monter(pg, { reglesOuvertes: true, temps: 'entrainement' });
  egal(await pg.$eval(`${Z} [data-pe-regles]`, (d) => d.open), false, 'entraînement : repliées');
  await monter(pg, { reglesOuvertes: true, temps: 'evaluation' });
  vrai(!(await present(pg, '[data-pe-regles]')), 'copie : pas de volet');
});

// Retouche du 22/10 (volet « Les règles » déplié qui bloquait « Retour au plan » et le Terminal) : le volet flotte toujours et RECOUVRE
// les clics (rien ne se déclenche sous un texte qu'on lit) ; un clic sur lui le referme sans rien faire d'autre, un geste ailleurs le
// referme et agit normalement.
await v('Palettier (volet des règles déplié) : il recouvre le Terminal et « Retour au plan » ; un clic dessus le referme sans rien déclencher dessous ; un clic sur une travée visible l’ouvre et le referme ; le plan tient en 1366 × 768 et 1280 × 720, standard et confirmé', async () => {
  const pe = await ctx.newPage();
  const err = [];
  pe.on('pageerror', (e) => err.push(e.message));
  // Le point au centre de l'élément tombe sur le volet (il recouvre l'élément), ou sur l'élément lui-même.
  const sur = (s) => pe.evaluate((s) => { const e = document.querySelector(s); if (!e) return 'absent'; const b = e.getBoundingClientRect();
    const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); if (!t) return 'rien';
    return t.closest('.pe-regles-corps') ? 'volet' : e.contains(t) ? 'lui' : 'autre'; }, s);
  const clicCentre = (s) => pe.evaluate((s) => { const b = document.querySelector(s).getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; }, s).then(([x, y]) => pe.mouse.click(x, y));
  const ouvert = () => pe.$eval(`${Z} [data-pe-regles]`, (d) => d.open);
  const deborde = () => pe.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
  for (const [w, h, niv] of [[1366, 768, 'standard'], [1280, 720, 'standard'], [1366, 768, 'confirme'], [1280, 720, 'confirme']]) {
    const lib = `${w} × ${h} (${niv})`;
    await pe.setViewportSize({ width: w, height: h });
    await pe.goto(BASE + 'outils/essai-palettier.html');
    await pe.waitForSelector('.pal');
    await pe.evaluate(() => { for (const s of ['#reglages', '#mention', '#hote']) document.querySelector(s).style.display = 'none'; });
    await monter(pe, { reglesOuvertes: true, terminal: 'deux', aisance: niv });
    egal(await ouvert(), true, `volet déplié au chargement, ${lib}`);
    egal(await sur(`${Z} .pal-term`), 'volet', `le volet recouvre le Terminal : le clic tombe sur lui, ${lib}`);
    egal(await sur(`${Z} [data-pe-trav="A1-T03"]`), 'lui', `une travée visible reçoit le clic, ${lib}`);
    egal(await deborde(), 0, `plan, volet déplié : rien ne dépasse, ${lib}`);
    // Un clic sur le volet (là où est le Terminal) : il se referme, rien d'autre ne bouge.
    const avant = await pe.evaluate(() => JSON.stringify(window.__p.db));
    await clicCentre(`${Z} .pal-term`);
    egal([await ouvert(), await pe.getAttribute(Z, 'data-pe-ouverte'), await pe.evaluate(() => JSON.stringify(window.__p.db))], [false, 'false', avant], `un clic sur le volet le referme, sans rien d'autre, ${lib}`);
    egal(await sur(`${Z} .pal-term`), 'lui', `le volet replié, le Terminal reçoit le clic, ${lib}`);
    // Un geste sur une travée visible : elle s'ouvre ET le volet se replie.
    await pe.click(`${Z} [data-pe-regles] summary`);
    egal(await ouvert(), true, `volet rouvert par le bouton, ${lib}`);
    await pe.click(`${Z} [data-pe-trav="A1-T03"]`);
    egal([await ouvert(), await pe.getAttribute(Z, 'data-pe-ouverte')], [false, 'true'], `le clic sur la travée visible l'ouvre et replie le volet, ${lib}`);
    await pe.click(`${Z} [data-pe-emp="A1-T03-N1-E2"]`);
    // Rouvert sur la travée : « Retour au plan » est recouvert ; un clic dessus ne le déclenche pas.
    await pe.click(`${Z} [data-pe-regles] summary`);
    egal(await ouvert(), true, `volet rouvert sur la travée, ${lib}`);
    egal(await sur(`${Z} [data-pal="retour"]`), 'volet', `le volet recouvre « Retour au plan », ${lib}`);
    egal(await deborde(), 0, `travée et vue de près, volet déplié : rien ne dépasse, ${lib}`);
    const bas = await pe.evaluate(() => Math.max(...[...document.querySelectorAll('#palTest .pe-espace, #palTest .pal-cote')].map((x) => x.getBoundingClientRect().bottom)));
    vrai(bas <= h, `le plan et la colonne de droite tiennent dans la fenêtre (bas à ${Math.round(bas)} px), ${lib}`);
    await clicCentre(`${Z} [data-pal="retour"]`);
    egal([await ouvert(), await pe.getAttribute(Z, 'data-pe-ouverte')], [false, 'true'], `un clic sur le volet ne déclenche pas « Retour au plan » dessous : la travée reste ouverte, ${lib}`);
    await pe.click(`${Z} [data-pal="retour"]`);
    egal(await pe.getAttribute(Z, 'data-pe-ouverte'), 'false', `le volet replié, « Retour au plan » fonctionne, ${lib}`);
  }
  egal(err, [], 'erreurs JS');
  await pe.close();
});

await v('Palettier (volet des règles déplié) : le premier geste ailleurs le replie (souris ou clavier), Échap le replie d’abord, et le repli est conservé', async () => {
  await monter(pg, { reglesOuvertes: true });
  const ouvert = () => pg.$eval(`${Z} [data-pe-regles]`, (d) => d.open);
  const trav = () => pg.getAttribute(Z, 'data-pe-ouverte');
  egal([await ouvert(), await trav()], [true, 'false'], 'départ : volet déplié, plan');
  await pg.click(`${Z} [data-pe-trav="A1-T03"]`);
  egal([await ouvert(), await trav()], [false, 'true'], 'souris : la travée s’ouvre et le volet se replie');
  await pg.click(`${Z} [data-pe-emp="A1-T03-N1-E2"]`);
  egal(await ouvert(), false, 'le repli est conservé après un nouveau dessin');
  // Échap : d'abord le volet (la vue de près et la travée restent ouvertes), puis la vue de près, puis la travée.
  await pg.click(`${Z} [data-pe-regles] summary`);
  egal(await ouvert(), true, 'rouvert');
  await pg.keyboard.press('Escape');
  egal([await ouvert(), await trav(), await present(pg, '[data-pal-pres="A1-T03-N1-E2"]')], [false, 'true', true], 'Échap replie le volet, la vue de près et la travée restent ouvertes');
  await pg.keyboard.press('Escape');
  egal([await trav(), await present(pg, '[data-pal-pres="A1-T03-N1-E2"]')], ['true', false], 'le second Échap ferme la vue de près');
  await pg.keyboard.press('Escape');
  egal(await trav(), 'false', 'le troisième Échap ferme la travée');
  // Clavier : Entrée sur un élément du plan (sous le volet) l'ouvre ET replie le volet.
  await pg.click(`${Z} [data-pe-regles] summary`);
  egal(await ouvert(), true, 'rouvert pour le clavier');
  await pg.focus(`${Z} [data-pe-trav="A1-T02"]`);
  await pg.keyboard.press('Enter');
  egal([await ouvert(), await trav()], [false, 'true'], 'clavier : Entrée ouvre la travée et replie le volet');
  // Un clic sur le volet lui-même (son texte) le referme, la travée reste telle quelle.
  await pg.click(`${Z} [data-pe-regles] summary`);
  egal(await ouvert(), true, 'rouvert pour le clic sur le texte');
  await pg.click(`${Z} .pe-regles-corps b`);
  egal([await ouvert(), await trav()], [false, 'true'], 'un clic sur le volet le referme, la travée reste ouverte');
  // Le bouton du volet, lui, ne se replie pas tout seul : cliquer sa propre bascule fait ce qu'elle dit.
  await pg.click(`${Z} [data-pe-regles] summary`);
  egal(await ouvert(), true, 'le bouton déplie');
  await pg.click(`${Z} [data-pe-regles] summary`);
  egal(await ouvert(), false, 'le bouton replie');
});

await v('Scan : après « Valider », les étiquettes ne se cliquent plus, aucun geste de plus, le Terminal dit « Terminé. »', async () => {
  await monter(pg, { terminal: 'deux' });
  await ranger(pg, 'P1', AD.P1);
  await valider(pg);
  const avant = await gestes(pg);
  egal(await texte(pg, '[data-vt-actu]'), 'Terminé.', 'phrase');
  egal(await pg.$$eval(`${Z} .pe-bandeau [data-pal-scan-pal]`, (L) => L.every((b) => b.disabled)), true, 'étiquettes de palettes désactivées');
  await pg.click(`${Z} [data-pe-trav="A1-T03"]`); await pg.click(`${Z} [data-pe-emp="${AD.P1}"]`);
  egal(await pg.isDisabled(`${Z} [data-pal-scan-emp]`), true, 'étiquette d’emplacement désactivée');
  egal([await gestes(pg), (await etat(pg)).scan], [avant, {}], 'rien ne change');
});

await v('Scan : déclaration fautive — `terminal` sans nom, ou `scan` inconnu, ne se charge pas', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntrepot } = await import('/core/types/entrepot.js');
    const C = await import('/contenus/palettier-essai.js');
    const essai = (t) => { try { creerEntrepot(Object.assign({}, C.PALETTIER, { id: `x${Math.random()}`, terminal: t })); return ''; } catch (e) { return e.message; } };
    return [essai({}), essai({ nom: 'Terminal', scan: 'trois' }), essai('Terminal'), essai({ nom: 'Terminal', scan: 'emplacement' })];
  });
  vrai(r[0].includes('terminal') && r[0].includes('nom'), r[0]);
  vrai(r[1].includes('terminal.scan'), r[1]);
  vrai(r[2].includes('terminal'), r[2]);
  egal(r[3], '', 'la variante « un clic » se charge');
});

await v('Scan : la page d’essai (Terminal plein, standard et confirmé) tient en 1366 × 768 et 1280 × 720 sans défiler ; les étiquettes à scanner et la phrase du Terminal sont visibles', async () => {
  const pe = await ctx.newPage();
  const err = [];
  pe.on('pageerror', (e) => err.push(e.message));
  for (const [w, h, niv] of [[1366, 768, 'standard'], [1280, 720, 'standard'], [1366, 768, 'confirme'], [1280, 720, 'confirme']]) {
    await pe.setViewportSize({ width: w, height: h });
    await pe.goto(BASE + 'outils/essai-palettier.html');
    await pe.waitForSelector('.pal');
    if (niv === 'confirme') await pe.evaluate(() => { document.querySelector('select[name="niveau"]').value = 'confirme'; document.querySelector('#reglages').dispatchEvent(new Event('change', { bubbles: true })); });
    await pe.waitForSelector('.pal');
    await pe.evaluate(() => { document.querySelector('#reglages').style.display = 'none'; document.querySelector('#mention').style.display = 'none'; document.querySelector('.ent-nav[data-vue="entrepot"]').click(); });
    const deborde = () => pe.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
    const vu = (s) => pe.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth; }, s);
    await pe.click('.pal .pe-bandeau [data-pe-pal="P1"]');
    await pe.click('.pal [data-pe-trav="A1-T03"]');
    await pe.click('.pal [data-pe-emp="A1-T03-N1-E2"]');
    await pe.click('.pal [data-pal="poser"]');
    await pe.click('.pal .pe-bandeau [data-pal-scan-pal="P1"]');
    await pe.click('.pal [data-pal-scan-emp]');
    for (let i = 0; i < 4; i++) await pe.click('.pal [data-pal-scan-emp]');   // « Scanne d'abord la palette. » : le journal se remplit
    const d = await deborde();
    egal([d, await vu('.pal [data-pal-scan-emp]'), await vu('.pal .pe-bandeau [data-pal-scan-pal="P5"]'), await vu('.pal [data-vt-actu]')], [0, true, true, true], `pixels qui dépassent, étiquettes et phrase visibles à ${w} × ${h} (${niv})`);
    await pe.click('.pal [data-pal="retour"]');
    egal([await deborde(), await vu('.pal [data-vt-actu]')], [0, true], `plan, Terminal plein à ${w} × ${h} (${niv})`);
  }
  egal(err, [], 'erreurs JS');
  await pe.close();
});

await v('Palettier : aucune erreur JavaScript', async () => { egal(erreurs, []); });
await ctx.close();
}
