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

// LOT 6 (22/10/2026, l'évaluation en copie) : section « l'évaluation en copie », en fin de bloc (cas « Évaluation : … »), sur `evaluation()` de
// `contenus/palettier-essai.js` (valeurs des deux sites écrites à la main en tête de la section). `PALETTIER_SEUL='Évaluation'` ne joue que ces cas.

// LOT 4 (22/10/2026, le comptage à l'aveugle) : section « le comptage », en fin de bloc (cas « Comptage : … »), sur le cas d'essai
// `comptage()` de `contenus/palettier-essai.js` (valeurs écrites à la main en tête de la section). `PALETTIER_SEUL=Comptage` (variable
// d'environnement) ne joue que les cas dont le nom commence ainsi : sert à éprouver les cas dans les deux sens sans rejouer tout le bloc.

export default async function bloc({ v: vTous, nav, BASE, egal, vrai }) {
const SEUL = process.env.PALETTIER_SEUL || '';
const v = SEUL ? (nom, fn) => (nom.startsWith(SEUL) ? vTous(nom, fn) : undefined) : vTous;

// Mouvement réduit : l'animation de 0,6 s du redressement de la travée (`.pe-releve.pe-anim`, styles/entrepot.css) est attendue par
// Playwright avant chaque clic sur un emplacement ; mesuré le 22/10/2026 : bloc de 640 s à 144 s. Aucun cas du bloc (ni de la suite,
// `git grep pe-anim outils/test` ne trouve rien) ne teste cette animation.
const ctx = await nav.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
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
// emplacement hors service, P8 sur un emplacement occupé), libre (lot 3 : la palette P8 à adresse libre, voir plus bas), extra (palettes de plus).
const monter = (p, o = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const C = await import('/contenus/palettier-essai.js');
  document.querySelector('#palTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'palTest'; document.body.appendChild(hote);
  const temps = o.temps || 'guidage';
  let P = C.palettier({ aideCharge: o.aide || 'pose', verdict: o.verdict === undefined ? 'critere' : o.verdict || undefined,
    monte: o.monte === 'base' ? (db) => !!(db && db.kevinRepondu) : undefined,
    terminal: !!o.terminal, scan: o.terminal === 'un' ? 'emplacement' : undefined, reglesOuvertes: !!o.reglesOuvertes, libre: !!o.libre });
  // Lot 3 : `o.extra` ajoute des palettes (jalons sans poids, comme le scénario « signaler »).
  if (o.extra) P = Object.assign({}, P, { palettes: [...P.palettes, ...o.extra] });
  if (o.scenario === 'signaler') {
    P = Object.assign({}, P, { palettes: [...P.palettes,
      { id: 'P7', nom: 'Peluches', cartons: 20, kg: 3, adresse: 'B1-T01-N2-E1', aSignaler: true },
      { id: 'P8', nom: 'Bougies parfumées', cartons: 20, kg: 3, adresse: 'A1-T03-N1-E1', aSignaler: true }] });
  }
  const U = C.universPalettier({ temps, entrepot: P, poids: o.scenario !== 'signaler' && !o.extra && !o.fil });
  if (o.volet) {
    // Un message qui attend le geste `monter` (comme Kevin dans ENT-8.11), ou celui que `o.volet` nomme (lot 2 : `scan:P1`).
    const { apresGeste } = await import('/core/declencheurs.js');
    U.volet = { id: 'volet-essai', semer: () => ({ mails: [] }), declencheurs: [{ id: 'kevin', quand: apresGeste(typeof o.volet === 'string' ? o.volet : 'entrepot:essai-palettier:monter'),
      semer: () => ({ mails: [{ folder: 'in', ts: Date.now(), from: 'Kevin', fromMail: 'kevin@essai.example', to: 'Lea', subject: 'Kevin monte', kind: 'text', text: 'Bonjour' }] }) }] };
  }
  if (o.fil) U.questions = C.questionsFil(o.fil, o.filPart);   // lot 6 : des questions au fil accrochées à des gestes (une par geste) ; filPart : 20 − nombre de jalons
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

/* =========================================================== le comptage (lot 4, 22/10/2026) */
// Valeurs écrites À LA MAIN (jamais relues dans le contenu) :
//   1 A1-T03-N1-E2 Lessive 3 × 3 × 4, réel 33, système 36 (cle manque) · 2 A2-T02-N1-E2 Boîtes (stock) 2 × 4 × 4, réel 26 = système ·
//   3 A2-T04-N1-E3 Cahiers 2 × 3 × 5, réel 27 = système · 4 B1-T02-N1-E2 Serviettes 2 × 4 × 4, réel 34, système 32 (cle surplus) ·
//   5 B1-T04-N1-E1 Bougies (stock) 3 × 3 × 4, réel 31 = système · 6 B2-T04-N1-E3 Peluches (stock) 3 × 3 × 5, réel 39 = système ·
//   7 (confirmé) B2-T03-N1-E2 Nettoyant 3 × 2 × 4, réel 20, système 23 (cle bonus).
// Hors liste : A1-T01-N1-E1 (stock, Lessive) ; libre au sol : A1-T01-N1-E2 ; au-dessus du sol : A1-T03-N2-E1 (Cahiers).
const IDC = 'essai-comptage';
const AC = ['A1-T03-N1-E2', 'A2-T02-N1-E2', 'A2-T04-N1-E3', 'B1-T02-N1-E2', 'B1-T04-N1-E1', 'B2-T04-N1-E3', 'B2-T03-N1-E2'];
const REEL = [33, 26, 27, 34, 31, 39, 20];
const SYS = [36, 26, 27, 32, 31, 39, 23];
// Monte le cas de comptage. `o` : temps, verdict, recompte, aideCouche, aisance, role, palettes (le rangement d'essai AVANT le comptage,
// dans le même entrepôt : ENT-8.14).
const monterC = (p, o = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const C = await import('/contenus/palettier-essai.js');
  document.querySelector('#palTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'palTest'; document.body.appendChild(hote);
  const temps = o.temps || 'guidage';
  let P = C.comptage({ verdict: o.verdict === undefined ? 'critere' : o.verdict || undefined, recompte: o.recompte, aideCouche: !!o.aideCouche });
  if (o.palettes) P = Object.assign({}, C.palettier({ aideCharge: 'pose', verdict: 'critere', terminal: true }), { id: 'essai-comptage', comptage: P.comptage });
  const U = C.universPalettier({ temps, entrepot: P, poids: !o.palettes });
  const db = o.db || {};
  const moteur = creerEntreprise(U);
  window.__p = { db, P, U, temps, moteur, remis: null };
  moteur.rendre(hote, {
    meta: { id: 'essai-palettier', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps, copie: temps === 'evaluation' },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: 'u-test' },
    aisance: o.aisance,
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
    rendreCopie: async (res) => { window.__p.remis = res; return { rendu: Date.now() }; },
  });
  document.querySelector('#palTest .ent-nav[data-vue="entrepot"]').click();
}, o);
const etatC = (p) => p.evaluate((id) => JSON.parse(JSON.stringify(((window.__p.db.entrepots || {})[id] || {}).comptage || null)), IDC);
const scanC = (p) => p.click(`${Z} [data-pal-compte-emp]`);
const taper = async (p, n) => { await p.fill(`${Z} [data-vt-champ]`, String(n)); await p.press(`${Z} [data-vt-champ]`, 'Enter'); };
const choisir = (p, k) => p.click(`${Z} [data-vt-choix="${k}"]`);
const actu = (p) => texte(p, '[data-vt-actu]');
// Compter l'adresse n° i + 1 : l'ouvrir, la scanner, taper `n`, puis la suite (« recompter », « confirmer », un autre nombre…).
async function compter(p, i, n, suite = []) {
  await ouvrir(p, AC[i]); await scanC(p); await taper(p, n);
  for (const k of suite) { if (typeof k === 'number') await taper(p, k); else await choisir(p, k); }
}
async function terminer(p) {
  if (await present(p, '[data-pal="retour"]')) await bouton(p, 'retour');
  await bouton(p, 'terminer');
  if (await present(p, '[data-pal="finOui"]')) await bouton(p, 'finOui');
}
// Le parcours juste : chaque adresse comptée juste ; sur les deux écarts, « Recompter », le même nombre, puis « Confirmer ».
async function justeC(p) { for (let i = 0; i < 6; i++) await compter(p, i, REEL[i], REEL[i] !== SYS[i] ? ['recompter', REEL[i], 'confirmer'] : []); }
const ID_C = ['compte-1', 'compte-2', 'compte-3', 'compte-4', 'compte-5', 'compte-6', 'recompte-manque', 'recompte-2', 'recompte-3', 'recompte-surplus', 'recompte-5', 'recompte-6', 'scanAvant'];
const tousC = (j) => Object.fromEntries(ID_C.map((id) => [id, j]));
const ecartsC = (p) => p.evaluate(async () => { const E = await import('/core/types/entrepot.js'); return E.ecartsConfirmes(window.__p.db, window.__p.P); });
// Les nombres cherchés partout dans la page (texte, attributs, valeur des champs, scripts écrits dans la page), sauf la géométrie du dessin
// (coordonnées SVG, tailles, style) : « 36 » n'est pas trouvé dans « 136.5 » ni dans « A1-T03 ».
const fuite = (p, nombres) => p.evaluate((nombres) => {
  const GEO = new Set(['points', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'viewbox', 'd', 'transform', 'rx', 'ry', 'r', 'cx', 'cy',
    'font-size', 'stroke-width', 'stroke-dasharray', 'opacity', 'style', 'patterntransform', 'letter-spacing', 'maxlength', 'tabindex']);
  const re = nombres.map((n) => [n, new RegExp(`(^|[^\\d.,])${n}(?![\\d.,])`)]);
  const vus = [];
  const test = (ou, s) => re.forEach(([n, r]) => { if (r.test(s)) vus.push(`${n} dans ${ou} : ${String(s).trim().slice(0, 70)}`); });
  const walk = (el) => {
    for (const a of el.attributes || []) if (!GEO.has(a.name.toLowerCase())) test(`${el.tagName.toLowerCase()}[${a.name}]`, a.value);
    if (el.tagName === 'INPUT') test('input.value', el.value);
    for (const c of el.childNodes) { if (c.nodeType === 3) test(`texte de ${el.tagName.toLowerCase()}`, c.nodeValue); else if (c.nodeType === 1) walk(c); }
  };
  walk(document.documentElement);
  return vus;
}, nombres);

await v('Comptage : la vue s’ouvre sur le plan, la liste « À compter » (6 adresses, sans aucun nombre), « Terminer le comptage », le Terminal « Scanne l’adresse. » avec son champ ; état neuf ; 13 jalons à faire ; gestes compte:1 à 7, compte:scan, compte:fin', async () => {
  await monterC(pg);
  egal(await pg.$$eval(`${Z} [data-pal-acompter] li`, (L) => L.map((x) => x.querySelector('b').textContent)), AC.slice(0, 6), 'la liste, dans l’ordre (standard : pas la 7e)');
  const liste = await texte(pg, '[data-pal-acompter]');
  vrai(!/\d/.test(liste.replace(/[A-Z]\d-T\d\d-N\d-E\d/g, '')), `aucun nombre dans la liste hors des adresses : ${liste}`);
  egal(await pg.$$eval(`${Z} [data-pal-acompter] li`, (L) => L.map((x) => x.dataset.palFait)), ['false', 'false', 'false', 'false', 'false', 'false'], 'rien de coché');
  egal([await actu(pg), await present(pg, '[data-vt-champ]'), await present(pg, '[data-vt-choix]')], ['Scanne l’adresse.', true, false], 'Terminal : phrase, champ, pas de choix');
  egal([await present(pg, '[data-pal="terminer"]'), await present(pg, '[data-pal="valider"]'), await present(pg, '.pe-bandeau [data-pe-pal]')], [true, false, false], 'Terminer le comptage ; ni Valider ni palettes');
  egal(await pg.getAttribute(Z, 'data-pe-phase'), 'comptage', 'phase');
  // Aucune surbrillance sur le plan : une adresse de la liste a la même marque qu'un autre emplacement occupé.
  egal([await mini(pg, AC[0]), await mini(pg, 'A1-T01-N1-E1'), await mini(pg, 'A1-T01-N1-E2')], ['stock', 'stock', 'libre'], 'plan : une adresse à compter est un emplacement occupé comme les autres');
  egal(await etatC(pg), { scanne: null, enCours: null, comptes: {}, premiers: {}, propositions: {}, recomptes: {}, horsListe: [], sansScan: 0, fini: false, at: null }, 'état neuf');
  egal(await jalons(pg), tousC('attente'), 'jalons à faire');
  const S = await pg.evaluate(async () => { const { creerEntrepot } = await import('/core/types/entrepot.js'); const C = await import('/contenus/palettier-essai.js'); return creerEntrepot(C.comptage()).signaux; });
  egal(S, ['entrepot:essai-comptage:ouvrir', ...[1, 2, 3, 4, 5, 6, 7].map((r) => `entrepot:essai-comptage:compte:${r}`), 'entrepot:essai-comptage:compte:scan', 'entrepot:essai-comptage:compte:fin'], 'gestes publiés');
  egal(erreurs, [], 'erreurs JS');
});

await v('Comptage : à l’aveugle — aucun nombre du système dans la page (texte, attributs, champ), adresse par adresse ouverte et scannée ; ni « kg », ni plaque, ni capteur dans la travée et la vue de près ; l’enseignant, lui, voit le système (la recherche trouve ce qui est là)', async () => {
  await monterC(pg);
  egal(await fuite(pg, SYS.slice(0, 6)), [], 'plan, avant tout');
  for (let i = 0; i < 6; i++) {
    await ouvrir(pg, AC[i]);
    egal(await fuite(pg, SYS.slice(0, 6)), [], `${AC[i]} ouverte de près`);
    const vus = await pg.evaluate(() => { const f = document.querySelector('#palTest .pe-face'), q = document.querySelector('#palTest [data-pal-pres]');
      return [/kg/i.test(f.innerHTML), /kg/i.test(q.innerHTML), !!document.querySelector('#palTest [data-pe-capteur], #palTest [data-pe-plaque], #palTest [data-pal-capteur], #palTest [data-pal-plaque], #palTest [data-pal-somme]')]; });
    egal(vus, [false, false, false], `${AC[i]} : ni kg dans la travée, ni kg de près, ni capteur ni plaque`);
    await scanC(pg);
    egal(await actu(pg), `${AC[i]} — ${['Lessive liquide 3 L', 'Boîtes de rangement 10 L', 'Cahiers grand format', 'Serviettes de bain', 'Bougies parfumées', 'Peluches'][i]}. Combien de cartons ?`, 'le Terminal demande');
    egal(await fuite(pg, SYS.slice(0, 6)), [], `${AC[i]} scannée`);
  }
  // Au-dessus du sol : la travée de face n'écrit pas non plus la plaque du niveau 2 (rangement : « max 1 500 kg / niveau »).
  await ouvrir(pg, 'A1-T03-N2-E1');
  egal(await pg.evaluate(() => /kg/i.test(document.querySelector('#palTest .pal-partage').innerHTML)), false, 'N2 ouvert : aucun kg');
  // Les deux sens : la même recherche trouve le système chez l'enseignant (ses attendus), et le rangement écrit bien des kg.
  await monterC(pg, { role: 'prof' });
  vrai((await fuite(pg, [36])).length > 0, 'la recherche trouve 36 dans les attendus de l’enseignant');
  await monter(pg, { aide: 'pose' });
  await prendre(pg, 'P5'); await ouvrir(pg, 'A1-T02-N3-E2');
  egal(await pg.evaluate(() => /kg/i.test(document.querySelector('#palTest .pe-face').innerHTML)), true, 'le rangement (aide « pose ») écrit des kg : le test les verrait');
});

await v('Comptage : compte égal au système → « Compris. », adresse cochée, geste compte:2 ; après « Terminer », compte-2 et recompte-2 ok', async () => {
  await monterC(pg);
  await compter(pg, 1, 26);
  egal([await derniere(pg), await actu(pg)], ['Compris.', 'Scanne l’adresse.'], 'Terminal');
  egal(await pg.getAttribute(`${Z} [data-pal-acompter-l="2"]`, 'data-pal-fait'), 'true', 'cochée');
  vrai((await gestes(pg)).includes('entrepot:essai-comptage:compte:2'), 'geste compte:2');
  const e = await etatC(pg);
  egal([e.comptes, e.propositions, e.recomptes], [{ 2: 26 }, {}, {}], 'état');
  egal((await jalons(pg))['compte-2'], 'attente', 'à faire avant la fin');
  await terminer(pg);
  const J = await jalons(pg);
  egal([J['compte-2'], J['recompte-2'], J.scanAvant, J['compte-1']], ['ok', 'ok', 'ok', 'ko'], 'jalons');
});

await v('Comptage : compte différent → « Quantité différente. Recompter ou confirmer ? » sans nombre ni sens, champ fermé, deux boutons ; Recompter redemande (autant de fois) ; Confirmer garde → compte-1 et recompte-manque ok', async () => {
  await monterC(pg);
  await compter(pg, 0, 33);
  egal(await actu(pg), 'Quantité différente. Recompter ou confirmer ?', 'la question');
  egal([await present(pg, '[data-vt-champ]'), await pg.$$eval(`${Z} [data-vt-choix]`, (L) => L.map((b) => b.textContent))], [false, ['Recompter', 'Confirmer']], 'champ fermé, deux boutons');
  const T = await texte(pg, '[data-terminal]');
  vrai(!/plus|moins|trop|manque|surplus|36/i.test(T), `le Terminal ne dit ni le nombre ni le sens : ${T}`);
  egal(await fuite(pg, [36]), [], 'le système nulle part');
  egal(await pg.getAttribute(`${Z} [data-pal-acompter-l="1"]`, 'data-pal-fait'), 'false', 'pas encore cochée');
  await choisir(pg, 'recompter');
  egal([await actu(pg), await present(pg, '[data-vt-champ]')], ['A1-T03-N1-E2 — Lessive liquide 3 L. Combien de cartons ?', true], 'Recompter redemande');
  await taper(pg, 34); await choisir(pg, 'recompter'); await taper(pg, 33);
  egal(await actu(pg), 'Quantité différente. Recompter ou confirmer ?', 'toujours différent');
  await choisir(pg, 'confirmer');
  egal([await derniere(pg), await pg.getAttribute(`${Z} [data-pal-acompter-l="1"]`, 'data-pal-fait')], ['Compris.', 'true'], 'gardé, coché');
  vrai((await gestes(pg)).includes('entrepot:essai-comptage:compte:1'), 'geste compte:1 à la confirmation');
  const e = await etatC(pg);
  egal([e.comptes, e.premiers, e.propositions, e.recomptes], [{ 1: 33 }, { 1: 33 }, { 1: 3 }, { 1: 2 }], 'état : dernier confirmé, premier compte, 3 propositions, 2 recomptes');
  await terminer(pg);
  const J = await jalons(pg);
  egal([J['compte-1'], J['recompte-manque']], ['ok', 'ok'], 'jalons');
});

await v('Comptage : écart confirmé sans recompter → recompte ko (compte ok) ; premier compte égal au système sur l’écart → recompte ok, compte ko (l’erreur se paie une fois)', async () => {
  await monterC(pg);
  await compter(pg, 3, 34, ['confirmer']);   // le surplus, juste du premier coup, confirmé sans recompter
  await compter(pg, 0, 36);                  // le manque, compté comme le système : rien n'est proposé
  egal(await derniere(pg), 'Compris.', '36 = système : « Compris. »');
  await terminer(pg);
  const J = await jalons(pg);
  egal([J['compte-4'], J['recompte-surplus'], J['compte-1'], J['recompte-manque']], ['ok', 'ko', 'ko', 'ok'], 'jalons');
});

await v('Comptage : rien compté puis « Terminer » → confirmation « Il reste 6 adresses à compter. Terminer quand même ? » (Non : rien ne change) ; puis tout ko, scanAvant ko, aucun jalon à faire, geste compte:fin', async () => {
  await monterC(pg);
  await bouton(pg, 'terminer');
  egal(await texte(pg, '[data-pal-confirme-fin]'), 'Il reste 6 adresses à compter. Terminer quand même ? Oui, terminer Non', 'confirmation');
  await bouton(pg, 'finNon');
  egal([await present(pg, '[data-pal="terminer"]'), (await etatC(pg)).fini], [true, false], 'Non : rien ne change');
  await terminer(pg);
  egal(await jalons(pg), tousC('ko'), 'tout ko, aucun « à faire »');
  vrai((await gestes(pg)).includes('entrepot:essai-comptage:compte:fin'), 'geste compte:fin');
  // Toutes comptées : « Terminer » sans confirmation.
  await monterC(pg);
  await justeC(pg);
  await bouton(pg, 'retour'); await bouton(pg, 'terminer');
  egal([await present(pg, '[data-pal-confirme-fin]'), (await etatC(pg)).fini], [false, true], 'toutes comptées : terminé sans confirmation');
  egal(await jalons(pg), tousC('ok'), 'parcours juste : tout ok');
  egal((await pg.evaluate(() => window.__p.moteur.noter(window.__p.db))).score, 20, 'note 20/20 (poids d’essai, 6 × 5/3)');
});

await v('Comptage : taper sans scan → « Scanne d’abord l’adresse. » en rouge, rien compté, trace `sansScan` ; des lettres → « Réponds avec des chiffres. » ; une case vide ne fait rien', async () => {
  await monterC(pg);
  await ouvrir(pg, AC[1]);
  await taper(pg, 26);
  egal([await derniere(pg), (await lignesRouges(pg)).slice(-1)[0]], ['Scanne d’abord l’adresse.', 'Scanne d’abord l’adresse.'], 'refus en rouge');
  await scanC(pg); await taper(pg, 'vingt');
  egal(await derniere(pg), 'Je n’ai pas compris. Réponds avec des chiffres.', 'des lettres');
  const n = (await lignesTerm(pg)).length;
  await taper(pg, '');
  egal((await lignesTerm(pg)).length, n, 'case vide : rien');
  const e = await etatC(pg);
  egal([e.comptes, e.sansScan, e.scanne], [{}, 1, AC[1]], 'rien compté, une trace, l’adresse reste scannée');
  await terminer(pg);
  const d = await pg.evaluate(async () => { const E = await import('/core/types/entrepot.js'); return E.noteEntrepot(window.__p.db, window.__p.P).detail; });
  egal(d && d.comptage && d.comptage.sansScan, 1, 'la trace dans le détail de la note');
});

await v('Comptage : une adresse hors liste se compte (« Compris. »), gardée en trace `horsListe`, jamais notée ; un emplacement libre : « Rien à compter ici. » ; au-dessus du sol, l’étiquette ne se scanne pas', async () => {
  await monterC(pg);
  await ouvrir(pg, 'A1-T01-N1-E1'); await scanC(pg);
  egal(await actu(pg), 'A1-T01-N1-E1 — Lessive liquide 3 L. Combien de cartons ?', 'hors liste : le Terminal demande quand même');
  await taper(pg, 12);
  egal(await derniere(pg), 'Compris.', 'Compris.');
  const e = await etatC(pg);
  egal([e.horsListe, e.comptes], [[{ adresse: 'A1-T01-N1-E1', compte: 12 }], {}], 'trace, aucun compte de la liste');
  egal((await gestes(pg)).filter((g) => /compte:\d/.test(g)), [], 'aucun geste compte:<rang>');
  await ouvrir(pg, 'A1-T01-N1-E2'); await scanC(pg);
  egal([await derniere(pg), (await lignesRouges(pg)).slice(-1)[0], (await etatC(pg)).scanne], ['Rien à compter ici.', 'Rien à compter ici.', null], 'libre : refus');
  await ouvrir(pg, 'A1-T03-N2-E1');
  egal([await present(pg, '[data-pal-compte-emp]'), await present(pg, '[data-pal-etiq-emp]'), await present(pg, '[data-pal-pile]')], [false, true, false], 'N2 : étiquette non cliquable, aucune palette à compter');
  vrai((await texte(pg, '[data-pal-pres]')).includes('on ne compte pas d’ici'), 'N2 : le texte le dit');
  await terminer(pg);
  egal(await jalons(pg), tousC('ko'), 'le hors liste ne rapporte rien (scanAvant ko)');
  egal(await pg.evaluate(async () => { const E = await import('/core/types/entrepot.js'); return E.noteEntrepot(window.__p.db, window.__p.P).detail.comptage.horsListe; }),
    [{ adresse: 'A1-T01-N1-E1', compte: 12 }], 'trace dans le détail');
});

await v('Comptage : un compte se refait (rescanner l’adresse) tant que le comptage n’est pas terminé ; le dernier confirmé compte', async () => {
  await monterC(pg);
  await compter(pg, 4, 30, ['confirmer']);
  egal((await etatC(pg)).comptes, { 5: 30 }, 'premier compte confirmé');
  await compter(pg, 4, 31);
  egal(await derniere(pg), 'Compris.', 'refait juste');
  egal([(await etatC(pg)).comptes, (await etatC(pg)).premiers], [{ 5: 31 }, { 5: 30 }], 'le dernier confirmé ; le premier compte gardé');
  await terminer(pg);
  const J = await jalons(pg);
  egal([J['compte-5'], J['recompte-5']], ['ok', 'ko'], 'compte juste ; le Terminal avait proposé de recompter et l’élève a confirmé : recompte ko');
});

await v('Comptage : `recompte: \'jamais\'` → « Compris. » à tout compte, aucun bouton ; recompte-* ok dès que l’adresse est comptée', async () => {
  await monterC(pg, { recompte: 'jamais' });
  await compter(pg, 0, 33);
  egal([await derniere(pg), await present(pg, '[data-vt-choix]')], ['Compris.', false], 'aucun recomptage proposé');
  await compter(pg, 3, 30);
  egal(await derniere(pg), 'Compris.', 'même faux');
  await terminer(pg);
  const J = await jalons(pg);
  egal([J['compte-1'], J['recompte-manque'], J['compte-4'], J['recompte-surplus'], J['recompte-2']], ['ok', 'ok', 'ko', 'ok', 'ko'], 'jalons');
});

await v('Comptage : `aideCouche` → « 3 × 3 = 9 par couche » pour la palette ouverte, jamais le total ; absent → rien', async () => {
  await monterC(pg, { aideCouche: true });
  await ouvrir(pg, AC[0]);
  egal(await texte(pg, '[data-pal-couche]'), '3 × 3 = 9 par couche', 'Lessive');
  vrai(!/\b36\b|\b33\b/.test(await texte(pg, '[data-pal-pres]')), 'ni la palette pleine ni le réel');
  await ouvrir(pg, AC[1]);
  egal(await texte(pg, '[data-pal-couche]'), '2 × 4 = 8 par couche', 'Boîtes');
  await monterC(pg);
  await ouvrir(pg, AC[0]);
  egal(await present(pg, '[data-pal-couche]'), false, 'sans aideCouche');
});

await v('Comptage : `ecartsConfirmes` vide avant « Terminer » (même avec des écarts confirmés), puis la liste exacte (rang, adresse, produit, compte, système, sens) ; vide sur une base vide ; `etatComptage`', async () => {
  const vide = await pg.evaluate(async () => { const E = await import('/core/types/entrepot.js'); const C = await import('/contenus/palettier-essai.js');
    return [E.ecartsConfirmes({}, C.COMPTAGE), E.ecartsConfirmes(undefined, C.COMPTAGE), E.etatComptage({}, C.COMPTAGE), E.ecartsConfirmes({}, C.PALETTIER)]; });
  egal(vide, [[], [], { comptes: {}, recomptes: {}, horsListe: [], fini: false }, []], 'base vide, sans comptage');
  await monterC(pg);
  await compter(pg, 0, 33, ['recompter', 33, 'confirmer']);
  await compter(pg, 3, 34, ['confirmer']);
  await compter(pg, 4, 30, ['confirmer']);
  await compter(pg, 1, 26);
  egal(await ecartsC(pg), [], 'avant la fin : vide');
  await terminer(pg);
  egal(await ecartsC(pg), [
    { rang: 1, adresse: 'A1-T03-N1-E2', produit: 'Lessive liquide 3 L', compte: 33, systeme: 36, sens: 'manque' },
    { rang: 4, adresse: 'B1-T02-N1-E2', produit: 'Serviettes de bain', compte: 34, systeme: 32, sens: 'surplus' },
    { rang: 5, adresse: 'B1-T04-N1-E1', produit: 'Bougies parfumées', compte: 30, systeme: 31, sens: 'manque' }], 'après : ses écarts confirmés');
  egal(await pg.evaluate(async () => { const E = await import('/core/types/entrepot.js'); return E.etatComptage(window.__p.db, window.__p.P); }),
    { comptes: { 1: 33, 2: 26, 4: 34, 5: 30 }, recomptes: { 1: 1 }, horsListe: [], fini: true }, 'etatComptage');
});

await v('Comptage : adresse du confirmé — absente en standard (ni ligne ni jalon), présente au confirmé, jalons compte-7 et recompte-bonus en bonus ; `cle` → recompte-manque (pas recompte-1)', async () => {
  const L = await pg.evaluate(async () => { const E = await import('/core/types/entrepot.js'); const C = await import('/contenus/palettier-essai.js');
    return E.etapesPalettier(C.COMPTAGE).map((x) => `${x.id}${x.bonus ? ' (bonus)' : ''}`); });
  egal(L, ['compte-1', 'compte-2', 'compte-3', 'compte-4', 'compte-5', 'compte-6', 'compte-7 (bonus)', 'recompte-manque', 'recompte-2', 'recompte-3',
    'recompte-surplus', 'recompte-5', 'recompte-6', 'recompte-bonus (bonus)', 'scanAvant'], 'les étapes');
  await monterC(pg);
  egal([(await pg.$$(`${Z} [data-pal-acompter] li`)).length, Object.keys(await jalons(pg)).includes('compte-7')], [6, false], 'standard');
  await monterC(pg, { aisance: 'confirme' });
  egal(await pg.$$eval(`${Z} [data-pal-acompter] li b`, (L) => L.map((x) => x.textContent)), AC, 'confirmé : 7 adresses');
  await justeC(pg);
  await compter(pg, 6, 20, ['recompter', 20, 'confirmer']);
  await terminer(pg);
  const r = await pg.evaluate(() => { const W = window.__p; const n = W.moteur.noter(W.db);
    return [W.U.etapes.find((x) => x.id === 'compte-7').verifier(W.db), W.U.etapes.find((x) => x.id === 'recompte-bonus').verifier(W.db),
      W.U.etapes.find((x) => x.id === 'compte-7').verifier({ entrepots: W.db.entrepots }), n.score, n.detail.bonus && n.detail.bonus.justes]; });
  egal(r, [{ status: 'ok' }, { status: 'ok' }, null, 20, 2], 'bonus jugés, null en standard, note du socle 20, deux bonus justes');
});

await v('Comptage : après « Terminer », plus rien ne se compte (Terminal « Terminé. » sans champ, étiquette désactivée, aucun geste) ; verdict « critere » → ✓ / ✗ compte, « adresse » → « réel : n », sans verdict rien', async () => {
  await monterC(pg);
  await compter(pg, 1, 26);
  await compter(pg, 4, 30, ['confirmer']);
  await terminer(pg);
  egal([await actu(pg), await present(pg, '[data-vt-champ]'), await present(pg, '[data-vt-choix]')], ['Terminé.', false, false], 'Terminal');
  const avant = await gestes(pg);
  await ouvrir(pg, AC[1]);
  egal(await pg.isDisabled(`${Z} [data-pal-compte-emp]`), true, 'étiquette désactivée');
  egal([await gestes(pg), await pg.getAttribute(Z, 'data-pal-fini')], [avant, 'true'], 'aucun geste');
  egal(await pg.$$eval(`${Z} [data-pal-acompter] li`, (L) => L.map((x) => (x.querySelector('[data-pal-cverdict]') || {}).textContent || '')), ['✗ compte', '✓', '✗ compte', '✗ compte', '✗ compte', '✗ compte'], 'verdicts « critere »');
  await monterC(pg, { verdict: 'adresse' });
  await compter(pg, 4, 30, ['confirmer']);
  await terminer(pg);
  egal(await texte(pg, '[data-pal-acompter-l="5"] [data-pal-cverdict]'), '✗ compte · réel : 31', 'verdict « adresse »');
  await monterC(pg, { verdict: null });
  await compter(pg, 4, 30, ['confirmer']);
  await terminer(pg);
  egal(await present(pg, '[data-pal-cverdict]'), false, 'sans verdict : rien');
});

await v('Comptage : en copie — « Recompter ou confirmer ? » proposé quand même, aucun verdict, « Terminer » rend la copie ; jalons jugés', async () => {
  await monterC(pg, { temps: 'evaluation' });
  await compter(pg, 0, 33);
  egal(await actu(pg), 'Quantité différente. Recompter ou confirmer ?', 'proposé en copie');
  await choisir(pg, 'confirmer');
  egal(await present(pg, '[data-pe-regles]'), false, 'pas de règles en copie');
  egal(await pg.evaluate(() => window.__p.remis), null, 'pas encore rendue');
  await terminer(pg);
  await pg.waitForFunction(() => window.__p.remis !== null);
  egal([await present(pg, '[data-pal-cverdict]'), (await jalons(pg))['compte-1'], (await jalons(pg))['recompte-manque']], [false, 'ok', 'ko'], 'aucun verdict, jalons jugés');
});

await v('Comptage : le dessin — autant de cartons dessinés que le réel (couche du dessus incomplète, cartons en trop posés dessus) ; `pileCartons` sort la palette de la préparation octet pour octet', async () => {
  await monterC(pg);
  const cartons = async (i) => { await ouvrir(pg, AC[i]); return pg.$$eval(`${Z} [data-pal-pile] polygon`, (L) => (L.length - 3) / 5); };
  egal([await cartons(0), await cartons(3), await cartons(1), await cartons(5)], [33, 34, 26, 39], 'cartons dessinés (5 faces par carton, 3 pour le support)');
  // Les cartons en trop sont posés AU-DESSUS de la palette pleine (le haut du dessin monte) ; les manquants sont pris sur la couche du
  // dessus, au fond (le haut du dessin descend), jamais dessous.
  const h = await pg.evaluate(async () => { const { pileCartons } = await import('/core/types/entrepot.js');
    const n = (s) => [...s.matchAll(/fill="#e6c48f"/g)].length;
    const haut = (s) => Math.min(...[...s.matchAll(/<polygon points="([^"]+)" fill="#e6c48f"/g)].flatMap((m) => m[1].split(' ').map((q) => Number(q.split(',')[1]))));
    const [s1, s0, m1, m0] = [pileCartons([2, 4, 4], 2), pileCartons([2, 4, 4], 0), pileCartons([3, 3, 4], -3), pileCartons([3, 3, 4], 0)];
    return [n(s1), n(s0), n(m1), haut(pileCartons([1, 1, 3], 1)) < haut(pileCartons([1, 1, 3], 0)), haut(pileCartons([2, 2, 3], 4)) < haut(pileCartons([2, 2, 3], 0)),
      haut(m1) > haut(m0), n(pileCartons([3, 3, 4], -9))]; });
  egal(h, [34, 32, 33, true, true, true, 27], 'pileCartons : 32 + 2, 32, 36 − 3 ; le carton en trop est posé dessus ; les manquants sont pris sur le dessus (une couche entière : 27)');
  // Les empreintes du dessin AVANT la sortie de la fonction (calculées sur la version du 22/10/2026 avant le lot 4) : rien n'a bougé.
  const E = await pg.evaluate(async () => {
    const { pileCartons } = await import('/core/types/entrepot.js');
    const cas = [[[3, 2, 4], 0], [[3, 2, 4], -3], [[3, 3, 4], -5], [[2, 4, 5], 2], [[3, 3, 3], 4], [[2, 3, 4], -7], [[4, 3, 5], 0], [[3, 3, 4], 11]];
    const hex = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('');
    const r = [];
    for (const [c, e] of cas) r.push((await hex(pileCartons(c, e))).slice(0, 16));
    return r;
  });
  egal(E, ['3708cd507d1c3d7e', '65681038d9ca4442', '6a5901d6de60f4db', 'f949876205efb934', '65027d2fd5f856e9', 'bf674eda04263fb6', '44011e3469671fa0', '4f0ec8c1e84c5118'], 'empreintes identiques');
});

await v('Comptage : déclaration fautive — sans Terminal, adresse au-dessus du sol, hors service, couche du dessus vide, clé en double, bonus avant la fin, produit qui contredit le stock, système non entier, recompte inconnu ; sans comptage, les palettes restent obligatoires', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntrepot } = await import('/core/types/entrepot.js');
    const C = await import('/contenus/palettier-essai.js');
    const A = C.ADRESSES_COMPTAGE;
    const essai = (Q) => { try { creerEntrepot(Object.assign({}, C.COMPTAGE, { id: `x${Math.random()}` }, Q)); return ''; } catch (e) { return e.message; } };
    const liste = (L, o = {}) => essai({ comptage: Object.assign({ adresses: L }, o) });
    return [essai({ terminal: undefined }), liste([{ ...A[0], adresse: 'A1-T03-N2-E2' }]), liste([{ ...A[0], adresse: 'B1-T01-N1-E1' }, A[1]]),
      liste([{ ...A[0], reel: 27 }]), liste([A[0], { ...A[1], cle: 'manque' }]), liste([A[6], A[0]]), liste([{ ...A[1], produit: 'LES' }]),
      liste([{ ...A[0], systeme: 35.5 }]), liste(A, { recompte: 'parfois' }), liste([{ ...A[0], reel: 46 }]),
      essai({ comptage: undefined }), liste(A), liste([A[0], A[0]])];
  });
  vrai(r[0].includes('Terminal'), r[0]);
  vrai(r[1].includes('niveau 1'), r[1]);
  vrai(r[2] === '' , `B1-T01-N1-E1 est au sol et en stock : ${r[2]}`);
  vrai(r[3].includes('couche du dessus vide'), r[3]);
  vrai(r[4].includes('déjà prise'), r[4]);
  vrai(r[5].includes('fin de liste'), r[5]);
  vrai(r[6].includes('le stock de A2-T02-N1-E2 est BOI'), r[6]);
  vrai(r[7].includes('systeme'), r[7]);
  vrai(r[8].includes('comptage.recompte'), r[8]);
  vrai(r[9].includes('une couche au plus'), r[9]);
  vrai(r[10].includes('aucune palette'), r[10]);
  egal(r[11], '', 'la déclaration d’essai se charge');
  vrai(r[12].includes('déjà dans la liste'), r[12]);
});

await v('Comptage : une fonction (adresses tirées) dont la clé change de rang d’un élève à l’autre ne se charge pas ; avec une clé partout, ou aucune, elle se charge', async () => {
  const r = await pg.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/palettier-essai.js');
    const A = C.ADRESSES_COMPTAGE.slice(0, 6);
    const tourne = (g) => { const k = g.charCodeAt(0) % 6; return [...A.slice(k), ...A.slice(0, k)]; };
    const F = (fn) => { try { E.etapesPalettier((g) => Object.assign({}, C.COMPTAGE, { comptage: { adresses: fn(g || 'a') } })); return ''; } catch (e) { return e.message; } };
    return [F(tourne), F((g) => tourne(g).map((x, i) => ({ ...x, cle: `c${A.indexOf(x)}` }))), F((g) => tourne(g).map(({ cle, ...x }) => x))];
  });
  vrai(r[0].includes('les jalons du comptage changent d'), r[0]);
  egal([r[1], r[2]], ['', ''], 'une clé partout, ou aucune');
});

await v('Jalons : une fonction qui déclare une palette de moins pour une graine (même sans comptage) ne se charge pas — le message nomme le premier id qui diffère et la graine ; la même avec les mêmes palettes partout se charge', async () => {
  const r = await pg.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/palettier-essai.js');
    const sans = (id) => Object.assign({}, C.PALETTIER, { palettes: C.PALETTIER.palettes.filter((p) => p.id !== id) });
    const F = (fn) => { try { return { msg: '', n: E.etapesPalettier(fn).length }; } catch (e) { return { msg: e.message, n: 0 }; } };
    return { sans: !C.PALETTIER.comptage, nb: C.PALETTIER.palettes.length, un: F((g) => (g === 'c' ? sans('P2') : C.PALETTIER)),
      deux: F((g) => (g === 'h' ? sans('P5') : C.PALETTIER)), partout: F(() => sans('P2')), ref: F((g) => (g === '' ? sans('P2') : C.PALETTIER)) };
  });
  vrai(r.sans, 'la déclaration d’essai n’a pas de comptage : seul le contrôle de toute la liste peut refuser');
  egal(r.nb, 6, 'six palettes déclarées (P6 au confirmé), cinq avec une de moins');
  vrai(r.un.msg.includes('pas les mêmes pour toutes les graines') && r.un.msg.includes('graine « c »') && r.un.msg.includes('« place-P3 »') && r.un.msg.includes('« place-P2 »'), `une palette de moins pour la graine « c » : ${r.un.msg}`);
  vrai(r.deux.msg.includes('graine « h »'), `la dernière graine essayée l’est aussi : ${r.deux.msg}`);
  vrai(r.ref.msg.includes('pas les mêmes pour toutes les graines'), `la graine de référence (« ») qui diffère des autres : ${r.ref.msg}`);
  vrai(r.partout.msg === '' && r.partout.n > 0, `les mêmes palettes partout : se charge (une palette de moins pour tous, c’est permis) : ${r.partout.msg}`);
});

await v('Comptage : avec des palettes (ENT-8.14), le rangement d’abord (Valider ne rend pas la copie), puis le comptage dans le même entrepôt ; jalons du rangement puis du comptage', async () => {
  await monterC(pg, { palettes: true, temps: 'evaluation' });
  egal([await pg.getAttribute(Z, 'data-pe-phase'), await present(pg, '[data-pal-acompter]'), await present(pg, '[data-pal="valider"]')], ['rangement', false, true], 'rangement d’abord');
  const ids = Object.keys(await jalons(pg));
  egal([ids.slice(0, 2), ids.slice(-3)], [['place-P1', 'scan-P1'], ['recompte-5', 'recompte-6', 'scanAvant']], 'jalons : rangement, puis comptage');
  // (L'adresse de P1, A1-T03-N1-E2, est la n° 1 du comptage : occupée, elle ne se pose pas ; P2 se range.)
  await ranger(pg, 'P2', 'B2-T02-N1-E3');
  await valider(pg);
  egal([await pg.getAttribute(Z, 'data-pe-phase'), await present(pg, '[data-pal-acompter]'), await pg.evaluate(() => window.__p.remis)], ['comptage', true, null], 'puis le comptage ; la copie n’est pas rendue');
  const J = await jalons(pg);
  egal([J['place-P2'], J['place-P1'], J['compte-1']], ['ok', 'ko', 'attente'], 'rangement jugé, comptage à faire');
  await compter(pg, 1, 26);
  await terminer(pg);
  await pg.waitForFunction(() => window.__p.remis !== null);
  egal((await jalons(pg))['compte-2'], 'ok', 'comptage jugé, copie rendue');
});

await v('Comptage, le Terminal : `attendre` sans réglage n’écrit ni `saisie` ni `choix` (le boîtier du lot 2 reste sans champ) ; avec, le champ et les boutons apparaissent ; `dire` de l’élève → « › 33 »', async () => {
  const r = await pg.evaluate(async () => {
    const { creerTerminal, terminalScannerNeuf } = await import('/core/types/terminal.js');
    const TERM = creerTerminal({ nom: 'Terminal', mode: 'scanner' });
    const T = terminalScannerNeuf();
    TERM.attendre(T, 'A', { saisie: true, choix: [['oui', 'Oui']] });
    const avec = [T.saisie, T.choix, /data-vt-champ/.test(TERM.html(T)), /data-vt-choix="oui"/.test(TERM.html(T))];
    TERM.attendre(T, 'B');
    TERM.dire(T, '33', { eleve: true });
    const d = document.createElement('div'); d.innerHTML = TERM.html(T);
    return [avec, Object.keys(T).sort(), d.querySelectorAll('input, button, form').length, d.querySelector('.vt-moi') && d.querySelector('.vt-moi').textContent];
  });
  egal(r, [[true, [['oui', 'Oui']], true, true], ['attente', 'journal'], 0, '› 33'], 'terminal');
});

await v('Comptage : la page d’essai (cas « Comptage », standard et confirmé, avec « Recompter ou confirmer ? ») tient en 1366 × 768 et 1280 × 720 sans défiler ; liste, étiquette, palette dessinée, champ et boutons visibles', async () => {
  const pe = await ctx.newPage();
  const err = [];
  pe.on('pageerror', (e) => err.push(e.message));
  for (const [w, h, niv] of [[1366, 768, 'standard'], [1280, 720, 'standard'], [1366, 768, 'confirme'], [1280, 720, 'confirme']]) {
    await pe.setViewportSize({ width: w, height: h });
    await pe.goto(BASE + 'outils/essai-palettier.html');
    await pe.waitForSelector('.pal');
    await pe.selectOption('#reglages select[name="cas"]', 'comptage');
    if (niv === 'confirme') await pe.selectOption('#reglages select[name="niveau"]', 'confirme');
    await pe.waitForSelector('.pal[data-pe-phase="comptage"]');
    await pe.evaluate(() => { document.querySelector('#reglages').style.display = 'none'; document.querySelector('#mention').style.display = 'none'; document.querySelector('.ent-nav[data-vue="entrepot"]').click(); });
    const deborde = () => pe.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
    const vu = (s) => pe.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth && r.height > 0; }, s);
    const d = [await deborde()];
    egal([await vu('.pal [data-pal-acompter] li:last-child'), await vu('.pal [data-vt-champ]')], [true, true], `liste et champ à ${w} × ${h} (${niv})`);
    await pe.click('.pal [data-pe-trav="A1-T03"]');
    await pe.click('.pal [data-pe-emp="A1-T03-N1-E2"]');
    await pe.click('.pal [data-pal-compte-emp]');
    await pe.fill('.pal [data-vt-champ]', '33'); await pe.press('.pal [data-vt-champ]', 'Enter');
    d.push(await deborde());
    const pile = await pe.evaluate(() => { const r = document.querySelector('.pal [data-pal-pile] svg').getBoundingClientRect(); return [Math.round(r.height), r.bottom <= innerHeight]; });
    egal([await vu('.pal [data-pal-compte-emp]'), await vu('.pal [data-vt-choix="confirmer"]'), pile[1]], [true, true, true], `étiquette, boutons, palette à ${w} × ${h} (${niv})`);
    vrai(pile[0] >= 180, `palette dessinée assez grande (${pile[0]} px de haut) à ${w} × ${h}`);
    egal(d, [0, 0], `pixels qui dépassent à ${w} × ${h} (${niv})`);
  }
  egal(err, [], 'erreurs JS');
  await pe.close();
});

/* =========================================================== adresse prise, adresse libre (lot 3, 22/10/2026) */
// Cas « Adresse libre : … », sur le cas d'essai `palettier({ libre: true })` : une palette de plus, P8, dont l'adresse donnée est OCCUPÉE.
// `PALETTIER_SEUL='Adresse libre'` ne joue que cette section. Valeurs écrites à la main :
//   P8 « Bougies parfumées », 24 cartons × 3 kg, adresse donnée A1-T03-N1-E1 (au sol, occupée : croquettes, 30 cartons, 400 kg),
//   adresse libre A1-T01-N1-E2 (au sol, libre) ; deux autres adresses libres au sol : A1-T02-N1-E1 (« à côté », hors de toute adresse de
//   palette : A1-T03-N1-E2, la voisine, est celle de P1) et A1-T01-N1-E3 (« ailleurs »).
const AL = { donnee: 'A1-T03-N1-E1', libre: 'A1-T01-N1-E2', cote: 'A1-T02-N1-E1', ailleurs: 'A1-T01-N1-E3' };
const TXT_LIBRE = 'Adresse libre pour P8 (Bougies parfumées) : A1-T01-N1-E2.';
const demander = (p) => bouton(p, 'libre');
const compris = async (p) => { if (await present(p, '[data-pal-modal]')) await p.click(`${Z} [data-pal-modal-ok]`); };
const texteFen = (p) => texte(p, '[data-pal-modal-texte]');
const p8Occupe = async (p) => { await prendre(p, 'P8'); await ouvrir(p, AL.donnee); };
// Sans Terminal, l'ordre de `jalons` : P1 à P4, signale-P5, adresseLibre-P8 (jamais place-P8), les deux gardes.
const tousL = (j) => ({ 'place-P1': j, 'place-P2': j, 'place-P3': j, 'place-P4': j, 'signale-P5': j, 'adresseLibre-P8': j, pasPoseHaut: j, charge: j });
const tousLS = (j) => ({ 'place-P1': j, 'scan-P1': j, 'place-P2': j, 'scan-P2': j, 'place-P3': j, 'scan-P3': j, 'place-P4': j, 'scan-P4': j,
  'signale-P5': j, 'scan-P5': j, 'adresseLibre-P8': j, 'scan-P8': j, pasPoseHaut: j, charge: j });
const croitL = (p, id) => p.evaluate(async (id) => { const E = await import('/core/types/entrepot.js'); return E.ouSystemeCroit(window.__p.db, window.__p.P, id); }, id);
const kevinL = (p) => p.evaluate(() => (window.__p.db.mails || []).filter((m) => m.subject === 'Kevin monte').length);

await v('Adresse libre : une palette à `adresseLibre` n’a pas de place-P mais adresseLibre-P ; P8 est en réception, sa carte porte l’adresse donnée ; `libres` est créé vide (absent de l’état neuf) ; sans `adresseLibre`, ni bouton ni clé `libres` ; 33 gestes (40 avec le Terminal), dont occupe:P8 et adresseLibre:P8', async () => {
  await monter(pg, { libre: true });
  egal(await pg.$$eval(`${Z} .pe-bandeau [data-pe-pal]`, (L) => L.map((b) => b.dataset.pePal)), ['P1', 'P2', 'P3', 'P4', 'P5', 'P8'], 'cartes (standard : pas de P6)');
  egal(await texte(pg, '[data-pal-etiq="P8"]'), 'Adresse A1-T03-N1-E1', 'la carte porte l’adresse donnée');
  egal(await jalons(pg), tousL('attente'), 'jalons à faire : adresseLibre-P8, pas de place-P8');
  egal((await etat(pg)).libres, {}, '`libres` créé vide au premier dessin');
  const r = await pg.evaluate(async () => {
    const { creerEntrepot, etatPalettier, ouSystemeCroit } = await import('/core/types/entrepot.js');
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const { apresGeste } = await import('/core/declencheurs.js');
    const C = await import('/contenus/palettier-essai.js');
    const essai = (P, nom) => {
      const U = C.universPalettier({ entrepot: P, poids: false });
      U.volet = { semer: () => ({ mails: [] }), declencheurs: [{ id: 'd', quand: apresGeste(nom), semer: () => ({ mails: [] }) }] };
      try { creerEntreprise(U); return ''; } catch (e) { return e.message; }
    };
    const L = C.palettier({ libre: true }), L2 = C.palettier({ libre: true, terminal: true }), N = C.PALETTIER;
    return { s: creerEntrepot(L).signaux, s2: creerEntrepot(L2).signaux, sN: creerEntrepot(N).signaux,
      occupe: essai(L, 'entrepot:essai-palettier:occupe:P8'), libre: essai(L, 'entrepot:essai-palettier:adresseLibre:P8'),
      sansL: essai(N, 'entrepot:essai-palettier:occupe:P8'), sansL2: essai(L, 'entrepot:essai-palettier:occupe:P1'),
      lisible: Object.keys(etatPalettier(window.__p.db, window.__p.P)), croit: ouSystemeCroit(window.__p.db, window.__p.P, 'P8') };
  });
  egal([r.s.length, r.s2.length, r.sN.length], [33, 40, 27], 'nombre de gestes (le cas ordinaire n’a gagné aucun geste)');
  egal(r.s.filter((g) => /occupe|adresseLibre/.test(g)), ['occupe:P8', 'adresseLibre:P8'].map((g) => `entrepot:essai-palettier:${g}`), 'un occupe et un adresseLibre, pour P8 seulement');
  egal([r.occupe, r.libre], ['', ''], 'un apresGeste sur chacun se charge');
  vrai(r.sansL.includes('occupe:P8') && r.sansL2.includes('occupe:P1'), `sans adresseLibre, ou pour une autre palette, le geste n’existe pas : ${r.sansL} / ${r.sansL2}`);
  egal([r.lisible.includes('libres'), r.croit], [true, AL.donnee], '`etatPalettier` rend `libres` ; avant toute demande le système croit l’adresse donnée');
  // Le cas ordinaire : l'emplacement occupé est ouvert avec une palette en main, aucun bouton ; ni `libres` dans l'état ni dans `etatPalettier`.
  await monter(pg);
  await prendre(pg, 'P1'); await ouvrir(pg, AL.donnee);
  egal([(await texte(pg, '[data-pal-occ]')).startsWith('Occupé'), await present(pg, '[data-pal="libre"]')], [true, false], 'emplacement occupé, aucun bouton « Demander »');
  const e = await etat(pg);
  egal('libres' in e, false, 'pas de clé `libres` dans l’état');
  egal(await pg.evaluate(async () => Object.keys((await import('/core/types/entrepot.js')).etatPalettier(window.__p.db, window.__p.P)).includes('libres')), false, 'pas de `libres` dans etatPalettier');
  egal(erreurs, [], 'erreurs JS');
});

await v('Adresse libre : ouvrir l’adresse donnée avec P8 en main → « Occupé » et le bouton « Demander une adresse libre » ; le bouton → fenêtre « Message du système » et Terminal au texte exact, carte « Nouvelle adresse », `libres`, geste adresseLibre:P8 ; ranger là + scanner → tout juste, 20 sur 20', async () => {
  await monter(pg, { libre: true, terminal: 'deux', aide: 'plaque' });
  await p8Occupe(pg);
  egal([await texte(pg, '[data-pal-occ]'), await pg.getAttribute(`${Z} [data-pal-occ]`, 'data-pal-occ')], ['Occupé : Croquettes pour chien 4 kg', 'stock'], 'l’emplacement est occupé');
  egal(await pg.$$eval(`${Z} .pal-boutons [data-pal]`, (L) => L.map((b) => b.dataset.pal)), ['poser', 'confier', 'libre', 'signaler'], 'les boutons, « Demander » avant « Signaler »');
  egal(await texte(pg, '[data-pal="libre"]'), 'Demander une adresse libre', 'libellé');
  egal((await gestes(pg)).filter((g) => /adresseLibre/.test(g)), [], 'pas encore demandée');
  egal([(await etat(pg)).libres, await croitL(pg, 'P8')], [{}, AL.donnee], 'rien demandé : le système croit l’adresse donnée');
  await demander(pg);
  const fen = await fenetre(pg);
  egal(fen.length, 1, 'la fenêtre s’ouvre');
  egal([await texte(pg, '[role="dialog"] h3'), await texteFen(pg), await pg.getAttribute(`${Z} [role="dialog"]`, 'aria-modal')], ['Message du système', TXT_LIBRE, 'true'], 'fenêtre : texte exact');
  egal(await derniere(pg), TXT_LIBRE, 'le Terminal dit la même chose');
  vrai((await lignesRouges(pg)).length === 0, 'aucun refus en rouge');
  const e = await etat(pg);
  egal([e.libres, e.enMain, e.signalees, e.scansRefuses], [{ P8: AL.libre }, 'P8', {}, 0], 'état : l’adresse libre est donnée, P8 toujours en main, rien signalé');
  // (Recalé le 22/10/2026 : le geste qui ouvre la fenêtre part à sa FERMETURE, pas à l'ouverture.)
  egal((await gestes(pg)).filter((g) => /adresseLibre/.test(g)), [], 'geste pas encore publié : la fenêtre est ouverte');
  egal(await croitL(pg, 'P8'), AL.libre, 'le système attend maintenant l’adresse libre');
  await compris(pg);
  egal((await gestes(pg)).filter((g) => /adresseLibre/.test(g)), ['entrepot:essai-palettier:adresseLibre:P8'], 'geste publié à « Compris »');
  egal(await pg.evaluate(() => document.activeElement && document.activeElement.dataset.peCle), 'pal:P8', 'le focus revient sur la carte');
  egal([await texte(pg, '[data-pal-etiq="P8"]'), await present(pg, '[data-pal-etiq="P8"].pal-nouvelle')], ['Nouvelle adresse A1-T01-N1-E2', true], 'la carte porte la nouvelle adresse');
  await ouvrir(pg, AL.libre); await bouton(pg, 'poser');
  egal((await etat(pg)).posees, { P8: AL.libre }, 'posée à l’adresse libre');
  await scanPal(pg, 'P8'); await scanEmp(pg);
  egal(await derniere(pg), 'A1-T01-N1-E2 — Bougies parfumées — 24 cartons. Confirmé.', 'scan accepté à l’adresse libre');
  egal([(await etat(pg)).scan.P8, await croitL(pg, 'P8')], [AL.libre, AL.libre], 'le système la sait là');
  await justeScan(pg);
  await valider(pg);
  egal(await jalons(pg), tousLS('ok'), 'tout juste, dont adresseLibre-P8 et scan-P8');
  egal(await pg.$$eval(`${Z} [data-pal-verdict]`, (L) => L.map((s) => s.textContent.trim())), Array(6).fill('✓ bien rangée'), 'verdicts');
  egal((await pg.evaluate(() => window.__p.moteur.noter(window.__p.db))).score, 20, 'note : 20 (poids écrits à la main : somme 20)');
  egal(erreurs, [], 'erreurs JS');
});

await v('Adresse libre : posée « à côté » sans rien demander → adresseLibre-P8 ko, scan refusé (« Ce n’est pas l’adresse de cette palette. », trace), le système la croit à l’adresse donnée ; posée à l’adresse libre SANS l’avoir demandée : ko aussi', async () => {
  await monter(pg, { libre: true, terminal: 'deux' });
  await p8Occupe(pg);
  await ouvrir(pg, AL.cote); await bouton(pg, 'poser');
  egal((await etat(pg)).posees, { P8: AL.cote }, 'posée à côté : la vue le permet');
  await scanPal(pg, 'P8'); await scanEmp(pg);
  egal(await lignesRouges(pg), ['Ce n’est pas l’adresse de cette palette.'], 'refus du scan : ce n’est pas l’adresse du système');
  const e = await etat(pg);
  egal([e.scan, e.scansRefuses, e.libres], [{}, 1, {}], 'rien confirmé, un refus en trace, rien demandé');
  egal(await croitL(pg, 'P8'), AL.donnee, 'le système la croit à l’adresse donnée (occupée)');
  await justeScan(pg);
  await valider(pg);
  egal(await jalons(pg), Object.assign(tousLS('ok'), { 'adresseLibre-P8': 'ko', 'scan-P8': 'ko' }), 'jalons : seuls adresseLibre-P8 et scan-P8 sont ko');
  egal(await texte(pg, '[data-pe-verd="P8"]'), '✗ adresse, scan', 'verdict de la carte');
  // Posée à l'adresse libre sans l'avoir demandée.
  await monter(pg, { libre: true, terminal: 'deux' });
  await prendre(pg, 'P8'); await ouvrir(pg, AL.libre); await bouton(pg, 'poser');
  await scanPal(pg, 'P8'); await scanEmp(pg);
  egal(await lignesRouges(pg), ['Ce n’est pas l’adresse de cette palette.'], 'scan refusé : l’adresse libre n’a pas été demandée');
  await justeScan(pg);
  await valider(pg);
  egal(await jalons(pg), Object.assign(tousLS('ok'), { 'adresseLibre-P8': 'ko', 'scan-P8': 'ko' }), 'ko : la bonne adresse, mais sans la demande');
});

await v('Adresse libre : demandée puis posée ailleurs → ko, scan refusé ; demandée, posée à côté, scan refusé puis reprise et rangée à l’adresse libre → tout juste (le dernier geste compte)', async () => {
  await monter(pg, { libre: true, terminal: 'deux' });
  await p8Occupe(pg); await demander(pg); await compris(pg);
  await ouvrir(pg, AL.ailleurs); await bouton(pg, 'poser');
  await scanPal(pg, 'P8'); await scanEmp(pg);
  egal(await lignesRouges(pg), ['Ce n’est pas l’adresse de cette palette.'], 'scan refusé : posée ailleurs que l’adresse libre');
  egal(await croitL(pg, 'P8'), AL.libre, 'le système attend l’adresse libre une fois demandée');
  await justeScan(pg);
  await valider(pg);
  egal(await jalons(pg), Object.assign(tousLS('ok'), { 'adresseLibre-P8': 'ko', 'scan-P8': 'ko' }), 'demandée mais posée ailleurs : ko');
  // Posée à côté après la demande, refusée au scan ; reprise, rangée à l'adresse libre, scannée.
  await monter(pg, { libre: true, terminal: 'deux' });
  await p8Occupe(pg); await demander(pg); await compris(pg);
  await ouvrir(pg, AL.cote); await bouton(pg, 'poser');
  await scanPal(pg, 'P8'); await scanEmp(pg);
  egal((await lignesRouges(pg)).length, 1, 'refusé : à côté, même après la demande');
  await prendre(pg, 'P8');
  egal([(await etat(pg)).libres, (await etat(pg)).posees], [{ P8: AL.libre }, {}], 'reprise : la demande reste, la pose disparaît');
  await ouvrir(pg, AL.libre); await bouton(pg, 'poser');
  await scanPal(pg, 'P8'); await scanEmp(pg);
  egal((await etat(pg)).scan, { P8: AL.libre }, 'scan accepté à l’adresse libre');
  await justeScan(pg);
  await valider(pg);
  egal(await jalons(pg), tousLS('ok'), 'tout juste');
});

await v('Adresse libre : P8 restée en réception → « Valider » reste possible (confirmation « encore en réception ») ; adresseLibre-P8 ko, demandée ou non ; les autres jalons jugés comme avant', async () => {
  for (const demande of [false, true]) {
    await monter(pg, { libre: true });
    if (demande) { await p8Occupe(pg); await demander(pg); await compris(pg); await prendre(pg, 'P8'); }
    await juste(pg);
    egal(await jalons(pg), tousL('attente'), 'avant la validation');
    if (await present(pg, '[data-pal="retour"]')) await bouton(pg, 'retour');
    await bouton(pg, 'valider');
    egal(await present(pg, '[data-pal-confirme]'), true, 'confirmation');
    vrai((await texte(pg, '[data-pal-confirme]')).includes('1 palette encore en réception'), `la confirmation le dit : ${await texte(pg, '[data-pal-confirme]')}`);
    await bouton(pg, 'validerOui');
    // (P8 en réception : les deux gardes « toutes les palettes traitées », pasPoseHaut et charge, sont ko aussi, règle du lot 1.)
    egal(await jalons(pg), Object.assign(tousL('ok'), { 'adresseLibre-P8': 'ko', pasPoseHaut: 'ko', charge: 'ko' }), `après la validation (demandée : ${demande})`);
    egal(await texte(pg, '[data-pal-etat="P8"]'), 'en réception', 'P8 est restée en réception');
  }
});

await v('Adresse libre : `occupe:P8` publié quand l’adresse donnée est ouverte avec P8 en main (un message qui l’attend arrive), pas pour une autre palette ni sans palette ; aussi quand P8 est prise alors que l’emplacement est ouvert ; `adresseLibre:P8` publié à la demande seulement', async () => {
  await monter(pg, { libre: true, volet: 'entrepot:essai-palettier:occupe:P8' });
  await ouvrir(pg, AL.donnee);
  egal([await kevinL(pg), (await gestes(pg)).filter((g) => /occupe/.test(g))], [0, []], 'emplacement ouvert sans palette en main : rien');
  await prendre(pg, 'P1');
  egal([await kevinL(pg), (await gestes(pg)).filter((g) => /occupe/.test(g))], [0, []], 'P1 en main (ce n’est pas son adresse) : rien');
  await ouvrir(pg, AL.cote); await ouvrir(pg, AL.donnee);
  egal(await kevinL(pg), 0, 'P1 en main, adresse de P8 rouverte : toujours rien');
  await prendre(pg, 'P8');   // l'emplacement de P8 est déjà ouvert : prendre P8 publie le geste
  egal([await kevinL(pg), (await gestes(pg)).filter((g) => /occupe/.test(g))], [1, ['entrepot:essai-palettier:occupe:P8']], 'P8 prise, emplacement déjà ouvert : publié, le message arrive');
  egal((await gestes(pg)).filter((g) => /adresseLibre/.test(g)), [], 'rien n’est demandé');
  // L'autre ordre : P8 en main, puis l'emplacement ouvert.
  await monter(pg, { libre: true, volet: 'entrepot:essai-palettier:occupe:P8' });
  await prendre(pg, 'P8');
  egal(await kevinL(pg), 0, 'P8 en main, rien d’ouvert : rien');
  await ouvrir(pg, AL.libre);
  egal(await kevinL(pg), 0, 'un autre emplacement : rien');
  await ouvrir(pg, AL.donnee);
  egal([await kevinL(pg), (await gestes(pg)).filter((g) => /occupe/.test(g))], [1, ['entrepot:essai-palettier:occupe:P8']], 'ouvrir l’adresse de P8 avec P8 en main : publié');
  // La demande publie son geste (un message qui l'attend arrive à ce moment, pas avant).
  await monter(pg, { libre: true, volet: 'entrepot:essai-palettier:adresseLibre:P8' });
  await p8Occupe(pg);
  egal(await kevinL(pg), 0, 'ouvrir l’adresse ne publie pas adresseLibre');
  await demander(pg);
  // (Recalé le 22/10/2026 : la demande ouvre la fenêtre, le geste part à « Compris ».)
  egal([await kevinL(pg), (await gestes(pg)).filter((g) => /adresseLibre/.test(g))], [0, []], 'la fenêtre est ouverte : pas encore publié');
  await compris(pg);
  egal([await kevinL(pg), (await gestes(pg)).filter((g) => /adresseLibre/.test(g))], [1, ['entrepot:essai-palettier:adresseLibre:P8']], 'la demande le publie, à « Compris »');
});

await v('Adresse libre : sur une palette sans adresse libre, « Demander » dit « Pas d’autre adresse : A1-T03-N1-E2 est libre. » (Terminal et fenêtre), rien d’écrit, aucun geste ; si son adresse est prise sans `adresseLibre` : « Pas d’autre adresse pour P9 (Peluches). »', async () => {
  await monter(pg, { libre: true, terminal: 'deux' });
  await prendre(pg, 'P1'); await ouvrir(pg, AL.donnee);
  egal(await present(pg, '[data-pal="libre"]'), true, 'le bouton est là sur tout emplacement occupé, palette en main');
  const avant = await etat(pg);
  await demander(pg);
  egal([await texteFen(pg), await derniere(pg)], ['Pas d’autre adresse : A1-T03-N1-E2 est libre.', 'Pas d’autre adresse : A1-T03-N1-E2 est libre.'], 'fenêtre et Terminal');
  await compris(pg);
  const e = await etat(pg);
  egal([e.libres, e.enMain, e.premierGeste === avant.premierGeste, (await gestes(pg)).filter((g) => /adresseLibre|occupe/.test(g))], [{}, 'P1', true, []], 'rien d’écrit, aucun geste (pas même un premier geste noté)');
  egal(await texte(pg, '[data-pal-etiq="P1"]'), 'Adresse A1-T03-N1-E2', 'la carte ne change pas');
  egal(await croitL(pg, 'P1'), 'A1-T03-N1-E2', 'le système croit toujours l’adresse donnée');
  // Une palette dont l'adresse est prise (stock) sans `adresseLibre`.
  await monter(pg, { libre: true, extra: [{ id: 'P9', nom: 'Peluches', cartons: 20, kg: 3, adresse: 'A1-T03-N1-E3', aSignaler: true }] });
  await prendre(pg, 'P9'); await ouvrir(pg, 'A1-T03-N1-E3'); await demander(pg);
  egal(await texteFen(pg), 'Pas d’autre adresse pour P9 (Peluches).', 'adresse prise, rien à donner');
  egal((await etat(pg)).libres, {}, 'rien d’écrit');
});

await v('Adresse libre : sans Terminal, le bouton existe, la fenêtre et l’encart « Système » disent l’adresse libre ; ranger là → adresseLibre-P8 ok', async () => {
  await monter(pg, { libre: true });
  egal(await present(pg, '[data-terminal]'), false, 'pas de Terminal');
  await p8Occupe(pg); await demander(pg);
  egal(await texteFen(pg), TXT_LIBRE, 'fenêtre');
  await compris(pg);
  egal(await pg.$$eval(`${Z} [data-pal-systeme] .pal-sys-actu`, (L) => L.map((x) => x.textContent.trim())), [TXT_LIBRE], 'encart « Système »');
  await ouvrir(pg, AL.libre); await bouton(pg, 'poser');
  await juste(pg);
  await valider(pg);
  egal(await jalons(pg), tousL('ok'), 'tout juste');
});

await v('Adresse libre : en copie, aucun verdict, mais le Terminal et la fenêtre donnent l’adresse libre (P5 d’ENT-8.14 : l’élève décide seul) ; la copie est rendue à « Valider » ; jalons jugés', async () => {
  await monter(pg, { libre: true, terminal: 'deux', temps: 'evaluation' });
  await p8Occupe(pg); await demander(pg);
  egal([await texteFen(pg), await derniere(pg)], [TXT_LIBRE, TXT_LIBRE], 'fenêtre et Terminal, en copie aussi');
  await compris(pg);
  await ouvrir(pg, AL.libre); await bouton(pg, 'poser');
  await scanPal(pg, 'P8'); await scanEmp(pg);
  await justeScan(pg);
  await valider(pg);
  egal(await pg.$$eval(`${Z} [data-pal-verdict]`, (L) => L.length), 0, 'aucun verdict');
  await pg.waitForFunction(() => window.__p.remis !== null);
  const J = await jalons(pg);
  egal([J['adresseLibre-P8'], J['scan-P8']], ['ok', 'ok'], 'adresseLibre-P8 et scan-P8 jugés');
});

await v('Adresse libre : une déclaration fautive ne se charge pas (adresse libre occupée, adresse donnée libre, avec nouvelleAdresse, inconnue, déjà celle d’une autre palette, hors service, niveau que le cariste ne dessert pas) ; une déclaration juste se charge', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntrepot } = await import('/core/types/entrepot.js');
    const C = await import('/contenus/palettier-essai.js');
    const P0 = C.palettier({ libre: true });
    const essai = (x) => { try { creerEntrepot(Object.assign({}, P0, { id: `x${Math.random()}`, palettes: P0.palettes.map((p) => (p.id === 'P8' ? Object.assign({}, p, x) : p)) })); return ''; } catch (e) { return e.message; } };
    return [
      essai({}),
      essai({ adresseLibre: 'A1-T03-N1-E3' }),
      essai({ adresse: 'A1-T01-N1-E3' }),
      essai({ nouvelleAdresse: 'A1-T04-N2-E1' }),
      essai({ adresseLibre: 'A1-T09-N1-E1' }),
      essai({ adresseLibre: 'A1-T03-N1-E2' }),
      essai({ adresseLibre: 'B1-T01-N2-E1' }),
      essai({ aSignaler: true }),
      essai({ adresseLibre: 'A1-T01-N2-E2' }),
      (() => { try { creerEntrepot(Object.assign({}, P0, { id: 'y', cariste: { nom: 'Kevin', niveaux: [2, 3] },
        palettes: P0.palettes.filter((p) => p.id !== 'P6').map((p) => (p.id === 'P8' ? Object.assign({}, p, { adresseLibre: 'A1-T01-N4-E2' }) : p)) })); return ''; } catch (e) { return e.message; } })(),
    ];
  });
  egal(r[0], '', `la déclaration juste se charge : ${r[0]}`);
  vrai(r[1].includes('adresse libre A1-T03-N1-E3 est occupée dans le stock de départ'), r[1]);
  vrai(r[2].includes('doit être occupée dans le stock de départ'), r[2]);
  vrai(r[3].includes('adresseLibre ne va pas avec nouvelleAdresse'), r[3]);
  vrai(r[4].includes('adresse libre inconnue (A1-T09-N1-E1)'), r[4]);
  vrai(r[5].includes('adresse libre A1-T03-N1-E2 est déjà celle de P1'), r[5]);
  vrai(r[6].includes('adresse libre B1-T01-N2-E1 est hors service'), r[6]);
  vrai(r[7].includes('adresseLibre ne va pas avec nouvelleAdresse ni aSignaler'), r[7]);
  egal(r[8], '', `une adresse libre au niveau N2, que le cariste dessert, se charge : ${r[8]}`);
  vrai(r[9].includes('que le cariste ne dessert pas'), r[9]);
});

await v('Adresse libre : la page d’essai (cas « Rangement », P8 occupée, Kevin qui pousse) tient en 1366 × 768 et 1280 × 720 sans défiler avec le bouton « Demander » visible ; Kevin écrit au premier « Occupé », la demande ouvre la fenêtre', async () => {
  const pe = await ctx.newPage();
  const err = [];
  pe.on('pageerror', (e) => err.push(e.message));
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
    await pe.setViewportSize({ width: w, height: h });
    await pe.goto(BASE + 'outils/essai-palettier.html');
    await pe.waitForSelector('.pal');
    const deborde = () => pe.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
    const vu = (s) => pe.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth && r.height > 0; }, s);
    const kevin = () => pe.evaluate(() => (window.__essai.db.mails || []).filter((m) => m.from === 'Kevin').length);
    const ouvrirP8 = async () => {
      await pe.click('.pal .pe-bandeau [data-pe-pal="P8"]');
      await pe.click('.pal [data-pe-trav="A1-T03"]');
      await pe.click('.pal [data-pe-emp="A1-T03-N1-E1"]');
    };
    egal(await pe.$$eval('.pal .pe-bandeau [data-pe-pal]', (L) => L.map((b) => b.dataset.pePal)), ['P1', 'P2', 'P3', 'P4', 'P5', 'P8'], `P8 dans la page d’essai (${w} × ${h})`);
    // Kevin qui pousse (défaut) : son message arrive au premier « Occupé » (son bandeau « Nouveau message » prend de la place en haut : la mise en page se mesure sans lui).
    await pe.click('.pal .pe-bandeau [data-pe-pal="P8"]');
    egal(await kevin(), 0, 'Kevin n’a rien écrit');
    await pe.click('.pal [data-pe-trav="A1-T03"]');
    await pe.click('.pal [data-pe-emp="A1-T03-N1-E1"]');
    egal(await kevin(), 1, `Kevin écrit au premier « Occupé » (${w} × ${h})`);
    egal(await pe.evaluate(() => (window.__essai.db.mails || []).find((m) => m.from === 'Kevin').text), 'Elle est prise ? Mets-la à côté, on verra demain. Il est tard. Kevin', 'son message');
    // Sans Kevin (réglage « non ») : la mise en page, sans défiler, bouton visible.
    await pe.selectOption('#reglages select[name="pousse"]', 'non');
    await pe.waitForSelector('.pal');
    await pe.evaluate(() => { document.querySelector('#reglages').style.display = 'none'; document.querySelector('#mention').style.display = 'none'; });
    await ouvrirP8();
    egal(await kevin(), 0, 'réglage « non » : Kevin n’écrit pas');
    egal([await vu('.pal [data-pal="libre"]'), await vu('.pal [data-pal="signaler"]'), await vu('.pal [data-pal="poser"]'), await deborde()], [true, true, true, 0], `boutons visibles, rien ne dépasse à ${w} × ${h}`);
    await pe.click('.pal [data-pal="libre"]');
    egal((await pe.textContent('.pal [data-pal-modal-texte]')).replace(/\s+/g, ' ').trim(), TXT_LIBRE, 'la fenêtre donne l’adresse libre');
    await pe.click('.pal [data-pal-modal-ok]');
  }
  egal(err, [], 'erreurs JS');
  await pe.close();
});

/* =========================================================== le lendemain (lot 5, 22/10/2026) */
// Cas « Le lendemain : … », sur le cas d'essai `lendemain()` de `contenus/palettier-essai.js` (imite ENT-8.13). `PALETTIER_SEUL='Le lendemain'`
// ne joue que cette section. Valeurs écrites À LA MAIN :
//   P1 « Cahiers grand format », adresse A1-T03-N1-E2 (libre) · P3 « Bougies parfumées », adresse A1-T02-N1-E3 (prise : Peluches, à évacuer),
//   adresse libre A1-T01-N1-E2, « à côté » A1-T02-N1-E1 ; restée en réception, Kevin la pose la nuit en A1-T02-N1-E2 ·
//   P9 (Kevin) « Peluches », adresse B1-T03-N1-E2 (prise : Nettoyant, à évacuer), posée par Kevin en B1-T03-N1-E3 ;
//   `haut` : B1-T03-N1-E2 reste prise, adresse libre de P9 B1-T03-N2-E1 (niveau 2, Kevin). Poids d'essai : place-P1 2, scan-P1 2,
//   adresseLibre-P3 3, scan-P3 2, pasPoseHaut 1, charge 1, retrouvee 3, trouveeVite 1, transfert-place 2, transfert-scan 3 (somme 20).
const IDL = 'essai-lendemain';
const LA = { p1: 'A1-T03-N1-E2', p3: 'A1-T02-N1-E3', p3Libre: 'A1-T01-N1-E2', p3Cote: 'A1-T02-N1-E1', allee: 'A1-T02-N1-E2',
  p9: 'B1-T03-N1-E2', p9Posee: 'B1-T03-N1-E3', p9Libre: 'B1-T03-N2-E1' };
const NOMS_PRODUITS = ['Lessive', 'Nettoyant', 'Croquettes', 'Cahiers', 'Bougies', 'Boîtes', 'Peluches', 'Serviettes'];
// Monte le cas du lendemain. `o` : temps, verdict, haut, monte ('base'), chemin ('scanne' | 'acote' | 'allee' : le soir déjà validé),
// prerempli (retouches de cet état), kevin (Kevin pousse), yanis (son message au passage), suite (la barre « Étape suivante »), role.
const monterL = (p, o = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const C = await import('/contenus/palettier-essai.js');
  document.querySelector('#palTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'palTest'; document.body.appendChild(hote);
  const temps = o.temps || 'guidage';
  const P = C.lendemain({ verdict: o.verdict === undefined ? 'critere' : o.verdict || undefined, haut: !!o.haut,
    monte: o.monte === 'base' ? (db) => !!(db && db.kevinRepondu) : undefined });
  const U = C.universPalettier({ temps, entrepot: P, kevinPousse: !!o.kevin, yanis: !!o.yanis, suite: !!o.suite, poids: !o.fil });
  if (o.fil) U.questions = C.questionsFil(o.fil, o.filPart);   // lot 6 : des questions au fil accrochées à des gestes
  const db = o.chemin ? { entrepots: { 'essai-lendemain': Object.assign(C.soirPrerempli(o.chemin), o.prerempli || {}) } } : {};
  const moteur = creerEntreprise(U);
  window.__p = { db, P, U, temps, moteur, remis: null };
  moteur.rendre(hote, {
    meta: { id: 'essai-palettier', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps, copie: temps === 'evaluation' },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
    rendreCopie: async (res) => { window.__p.remis = res; return { rendu: Date.now() }; },
  });
  document.querySelector('#palTest .ent-nav[data-vue="entrepot"]').click();
}, o);
const etatL = (p) => p.evaluate((id) => JSON.parse(JSON.stringify((window.__p.db.entrepots || {})[id] || null)), IDL);
const gestesL = (p) => p.evaluate(() => Object.keys((window.__p.db.gestes || {})['essai-palettier'] || {}).sort());   // rangés sous l'id de la séance
const nouveaux = (G) => G.filter((g) => /:(phase|ouvrir:lendemain|trouvee|transfert|valider:lendemain)/.test(g)).map((g) => g.replace('entrepot:essai-lendemain:', ''));
const chercheeL = (p) => p.evaluate(async () => (await import('/core/types/entrepot.js')).paletteCherchee(window.__p.db, window.__p.P));
const croitLd = (p, id) => p.evaluate(async (id) => (await import('/core/types/entrepot.js')).ouSystemeCroit(window.__p.db, window.__p.P, id), id);
const noteL = (p) => p.evaluate(() => window.__p.moteur.noter(window.__p.db).score);
const passer = async (p) => { await bouton(p, 'phase'); await bouton(p, 'phaseOui'); };
const scanPalL = (p, id) => p.click(`${Z} [data-pal-lscan-pal="${id}"]`);
const scanEmpL = (p) => p.click(`${Z} [data-pal-lscan-emp]`);
async function validerL(p) {
  if (await present(p, '[data-pal="retour"]')) await bouton(p, 'retour');
  await bouton(p, 'lvalider'); await bouton(p, 'lvaliderOui');
}
// Transférer la palette cherchée : l'ouvrir (là où elle est), scanner son étiquette, ouvrir la cible, scanner l'étiquette de l'emplacement.
async function transferer(p, id, de, vers) { await ouvrir(p, de); await scanPalL(p, id); await ouvrir(p, vers); await scanEmpL(p); await compris(p); }
const tousLend = (j) => ({ 'place-P1': j, 'scan-P1': j, 'adresseLibre-P3': j, 'scan-P3': j, pasPoseHaut: j, charge: j,
  retrouvee: j, trouveeVite: j, 'transfert-place': j, 'transfert-scan': j });
const LEND = ['retrouvee', 'trouveeVite', 'transfert-place', 'transfert-scan'];
const lend = (j) => Object.fromEntries(LEND.map((id) => [id, j]));
const soirOk = { 'place-P1': 'ok', 'scan-P1': 'ok', 'adresseLibre-P3': 'ok', 'scan-P3': 'ok', pasPoseHaut: 'ok', charge: 'ok' };
// Le texte et les étiquettes d'accessibilité de la travée de face (ce que l'élève lit sans ouvrir un emplacement).
const face = (p) => p.$eval(`${Z} .pe-face`, (f) => [f.textContent, ...[...f.querySelectorAll('[aria-label]')].map((x) => x.getAttribute('aria-label'))].join(' | '));

await v('Le lendemain : montage — 6 gestes de plus dans `signaux` (un apresGeste sur chacun se charge) ; jalons du soir puis du lendemain, tous à faire ; état : `phase` « soir », pas de clé `lendemain` ; P9 posée dès le soir (emplacement occupé « Peluches », ni carte ni étiquette) ; paletteCherchee null', async () => {
  await monterL(pg);
  const r = await pg.evaluate(async () => {
    const { creerEntrepot } = await import('/core/types/entrepot.js');
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const { apresGeste } = await import('/core/declencheurs.js');
    const C = await import('/contenus/palettier-essai.js');
    const S = creerEntrepot(C.LENDEMAIN).signaux;
    const U = C.universPalettier({ entrepot: C.LENDEMAIN });
    U.volet = { semer: () => ({ mails: [] }), declencheurs: S.map((n, i) => ({ id: `d${i}`, quand: apresGeste(n), semer: () => ({ mails: [] }) })) };
    let tous = ''; try { creerEntreprise(U); } catch (e) { tous = e.message; }
    return { S, tous, sansL: creerEntrepot(C.palettier({ libre: true, terminal: true })).signaux.filter((g) => /phase|trouvee|transfert|lendemain/.test(g)) };
  });
  egal(r.S.filter((g) => /phase|ouvrir:lendemain|trouvee|transfert|valider:lendemain/.test(g)).map((g) => g.replace('entrepot:essai-lendemain:', '')),
    ['phase:lendemain', 'ouvrir:lendemain', 'trouvee', 'transfert:scan', 'transfert', 'valider:lendemain'], 'les gestes du lendemain');
  egal([r.tous, r.sansL], ['', []], 'un apresGeste sur chaque geste se charge ; sans lendemain, aucun de ces gestes');
  egal(await jalons(pg), tousLend('attente'), 'jalons : ceux du soir, puis retrouvee, trouveeVite, transfert-place, transfert-scan');
  const e = await etatL(pg);
  egal([e.phase, 'lendemain' in e], ['soir', false], 'phase « soir » créée au premier dessin, pas encore d’état du lendemain');
  egal(await pg.$$eval(`${Z} .pe-bandeau [data-pe-pal]`, (L) => L.map((b) => b.dataset.pePal)), ['P1', 'P3'], 'cartes : P1 et P3 (pas P9)');
  await ouvrir(pg, LA.p9Posee);
  egal([await texte(pg, '[data-pal-occ]'), await pg.getAttribute(`${Z} [data-pal-occ]`, 'data-pal-occ'), await present(pg, '[data-pal-scan-pal="P9"]')],
    ['Occupé : Peluches', 'stock', false], 'P9 posée dès le soir : un emplacement occupé, rien de plus');
  egal(await chercheeL(pg), null, 'paletteCherchee : null avant le lendemain');
  egal(erreurs, [], 'erreurs JS');
});

await v('Le lendemain : le soir joué juste (adresse libre demandée, rangée, scannée) → « Valider » : pas de verdict du soir, le bouton « Le lendemain, 6 h » à sa place ; confirmation ; geste phase:lendemain, Yanis écrit l’adresse de P9 ; on cherche P9', async () => {
  await monterL(pg, { kevin: true, yanis: true });
  await ranger(pg, 'P1', LA.p1); await scanPal(pg, 'P1'); await scanEmp(pg);
  await prendre(pg, 'P3'); await ouvrir(pg, LA.p3);
  egal(await pg.evaluate(() => (window.__p.db.mails || []).filter((m) => m.from === 'Kevin').length), 1, 'Kevin pousse au premier « Occupé » sur P3');
  await demander(pg); await compris(pg);
  await ouvrir(pg, LA.p3Libre); await bouton(pg, 'poser'); await scanPal(pg, 'P3'); await scanEmp(pg);
  await valider(pg);
  egal(await pg.$$eval(`${Z} [data-pal-verdict]`, (L) => L.length), 0, 'aucun verdict du soir (le lendemain dira tout)');
  egal([await present(pg, '[data-pal="valider"]'), await texte(pg, '[data-pal="phase"]')], [false, 'Le lendemain, 6 h'], 'le bouton du lendemain à la place de « Valider »');
  vrai((await texte(pg, '[data-pe-consigne]')).includes('Le lendemain, 6 h'), 'la consigne le dit');
  egal(await jalons(pg), Object.assign(tousLend('attente'), soirOk), 'le soir est jugé, le lendemain à faire');
  egal(nouveaux(await gestesL(pg)), [], 'rien du lendemain publié');
  egal(await pg.evaluate(() => (window.__p.db.mails || []).filter((m) => m.from === 'Yanis').length), 0, 'Yanis n’a rien écrit');
  await bouton(pg, 'phase');
  vrai((await texte(pg, '[data-pal-confirme-phase]')).startsWith('Passer à « Le lendemain, 6 h » ? Oui Non'), 'confirmation');
  await bouton(pg, 'phaseNon');
  egal((await etatL(pg)).phase, 'soir', '« Non » : on reste le soir');
  await passer(pg);
  const e = await etatL(pg);
  egal([e.phase, e.lendemain], ['lendemain', { ouvertures: 0, trouvee: false, trouveeA: null, scanAttente: null, place: null, confiee: null,
    montee: false, libre: null, transfert: null, refus: 0, valide: false, at: null }], 'phase « lendemain », état du lendemain neuf');
  egal(nouveaux(await gestesL(pg)), ['phase:lendemain'], 'geste phase:lendemain');
  egal(await chercheeL(pg), { id: 'P9', nom: 'Peluches', adresseSysteme: LA.p9, adresseReelle: LA.p9Posee }, 'bon geste le soir : on cherche la palette de Kevin');
  egal(await pg.evaluate(() => (window.__p.db.mails || []).find((m) => m.from === 'Yanis').text),
    'Bonjour ! Le terminal m’envoie en B1-T03-N1-E2. C’est vide. Je ne peux pas préparer le magasin. Tu peux regarder ? Yanis', 'Yanis : l’adresse que croit le système');
  egal([await pg.getAttribute(Z, 'data-pe-phase'), await texte(pg, '[data-pal-lcarte]'), await present(pg, '[data-pal="lvalider"]')],
    ['lendemain', 'Pas encore trouvée.', true], 'l’écran du lendemain : rien ne nomme la palette');
  egal(await jalons(pg), Object.assign(tousLend('attente'), soirOk), 'le lendemain toujours à faire');
  egal(erreurs, [], 'erreurs JS');
});

await v('Le lendemain : la nuit — les adresses évacuées sont libres, P9 occupe B1-T03-N1-E3 ; la travée ne montre plus aucun nom (texte ni étiquette d’accessibilité), le plan ne distingue rien ; de près, « palette P9 · Peluches » et son étiquette', async () => {
  // Le soir, la travée B1-T03 nomme ses produits (c'est le dessin d'avant).
  await monterL(pg, { chemin: 'scanne' });
  await pg.click(`${Z} [data-pe-trav="B1-T03"]`);
  vrai(/Nettoyant|Peluches/.test(await face(pg)), 'le soir, la travée nomme les produits');
  await bouton(pg, 'retour');
  await passer(pg);
  egal([await mini(pg, LA.p9), await mini(pg, LA.p3), await mini(pg, LA.p9Posee), await mini(pg, LA.p3Libre), await mini(pg, LA.p1)],
    ['libre', 'libre', 'stock', 'stock', 'stock'], 'plan du matin : évacuées libres, les palettes de l’élève et de Kevin comme du stock');
  await pg.click(`${Z} [data-pe-trav="B1-T03"]`);
  const F = await face(pg);
  egal(NOMS_PRODUITS.filter((n) => F.includes(n)).concat(['P1', 'P3', 'P9'].filter((id) => F.includes(id))), [], `aucun nom dans la travée du matin : ${F.slice(0, 120)}`);
  egal(await pg.$$eval(`${Z} .pe-face [data-pe-etiq-muette]`, (L) => L.length) > 0, true, 'les palettes portent une étiquette muette');
  egal(await pg.$$eval(`${Z} .pe-face [data-pe-emp="${LA.p9Posee}"], ${Z} .pe-face [data-pe-emp="B1-T03-N2-E2"]`, (L) => L.map((g) => g.getAttribute('aria-label'))),
    [`${LA.p9Posee} : occupé`, 'B1-T03-N2-E2 : occupé'], 'palette ou stock : « occupé », rien de plus');
  await pg.click(`${Z} [data-pe-emp="${LA.p9}"]`);
  egal(await texte(pg, '[data-pal-occ]'), 'Libre', 'B1-T03-N1-E2 : évacuée la nuit');
  await pg.click(`${Z} [data-pe-emp="${LA.p9Posee}"]`);
  egal([await texte(pg, '[data-pal-occ]'), await texte(pg, '[data-pal-lscan-pal="P9"]')], ['Occupé : palette P9 · Peluches', 'Scanner P9 · Peluches'], 'de près : l’étiquette de la palette');
  await pg.click(`${Z} [data-pe-emp="B1-T03-N2-E2"]`);
  egal([await texte(pg, '[data-pal-occ]'), await present(pg, '[data-pal-lscan-pal]')], ['Occupé : Bougies parfumées', false], 'du stock : son produit, pas d’étiquette à scanner');
  await ouvrir(pg, LA.p3);
  egal(await texte(pg, '[data-pal-occ]'), 'Libre', 'A1-T02-N1-E3 : évacuée la nuit');
  egal(erreurs, [], 'erreurs JS');
});

await v('Le lendemain : chercher P9 — chaque ouverture compte ; l’adresse vide, puis B1-T03-N1-E3 → trouvée (geste, marque vert pâle, « Palette retrouvée », carte) ; scan → « Scanne l’emplacement où elle doit aller » ; mauvaise cible refusée (trace) ; B1-T03-N1-E2 → « Transfert enregistré » ; Valider → tout juste, 20 sur 20', async () => {
  await monterL(pg, { chemin: 'scanne' });
  await passer(pg);
  await ouvrir(pg, LA.p9);
  egal([(await etatL(pg)).lendemain.ouvertures, (await etatL(pg)).lendemain.trouvee], [1, false], 'l’adresse vide : une ouverture, rien trouvé');
  egal(nouveaux(await gestesL(pg)), ['ouvrir:lendemain', 'phase:lendemain'], 'ouvrir:lendemain publié');
  await pg.click(`${Z} [data-pe-emp="${LA.p9}"]`);
  await ouvrir(pg, LA.p9Posee);
  let L = (await etatL(pg)).lendemain;
  egal([L.ouvertures, L.trouvee, L.trouveeA], [3, true, 3], 'trouvée à la 3e ouverture (rouvrir compte)');
  egal(nouveaux(await gestesL(pg)), ['ouvrir:lendemain', 'phase:lendemain', 'trouvee'], 'geste trouvee');
  egal([await pg.getAttribute(`${Z} .pe-face [data-pe-emp="${LA.p9Posee}"]`, 'class'), await texte(pg, '[data-pal-trouvee]')], ['pe-emp pe-marque pe-choisi', 'Palette retrouvée'], 'la marque « trouvée »');
  egal(await pg.$eval(`${Z} .pe-face [data-pe-emp="${LA.p9Posee}"] .pe-cible`, (r) => r.getAttribute('fill')), 'var(--vert-pale)', 'vert pâle : « juste »');
  vrai((await texte(pg, '[data-pal-lcarte="P9"]')).startsWith('P9 Peluches trouvée en B1-T03-N1-E3 à transférer'), `la carte : ${await texte(pg, '[data-pal-lcarte]')}`);
  await scanPalL(pg, 'P9');
  egal(await actu(pg), 'P9 — Peluches. Scanne l’emplacement où elle doit aller.', 'le Terminal attend l’emplacement');
  vrai((await gestesL(pg)).includes('entrepot:essai-lendemain:transfert:scan'), 'geste transfert:scan');
  egal(await present(pg, '[data-pal="llibre"]'), false, 'pas de « Demander une adresse libre » sur l’emplacement de la palette elle-même');
  await ouvrir(pg, 'B1-T03-N1-E1'); await scanEmpL(pg);
  egal(await lignesRouges(pg), ['Ce n’est pas l’adresse de cette palette.'], 'mauvaise cible : refus en rouge');
  egal([(await etatL(pg)).lendemain.refus, (await etatL(pg)).lendemain.transfert], [1, null], 'trace, rien enregistré');
  await ouvrir(pg, LA.p9); await scanEmpL(pg);
  const T = 'Transfert enregistré : P9 de B1-T03-N1-E3 vers B1-T03-N1-E2.';
  egal([await derniere(pg), await texteFen(pg)], [T, T], 'Terminal et fenêtre « Message du système »');
  await compris(pg);
  L = (await etatL(pg)).lendemain;
  egal([L.place, L.transfert.de, L.transfert.vers, L.scanAttente], [LA.p9, LA.p9Posee, LA.p9, null], 'déplacée et enregistrée');
  egal(await croitLd(pg, 'P9'), LA.p9, 'le système la sait là');
  vrai((await gestesL(pg)).includes('entrepot:essai-lendemain:transfert'), 'geste transfert');
  egal(await texte(pg, '[data-pal-occ]'), 'Occupé : palette P9 · Peluches', 'P9 est à sa place');
  await ouvrir(pg, LA.p9Posee);
  egal(await texte(pg, '[data-pal-occ]'), 'Libre', 'son ancienne place est libre');
  egal(await jalons(pg), Object.assign(tousLend('attente'), soirOk), 'avant « Valider mon transfert » : à faire');
  await validerL(pg);
  egal(await jalons(pg), tousLend('ok'), 'tout juste');
  egal(await noteL(pg), 20, 'note : 20');
  egal(await texte(pg, '[data-pal-verdict]'), '✓ remise en ordre', 'verdict de la carte');
  egal([nouveaux(await gestesL(pg)).includes('valider:lendemain'), await actu(pg), await present(pg, '[data-pal="lvalider"]')], [true, 'Terminé.', false], 'validé, figé');
  const n0 = (await etatL(pg)).lendemain.ouvertures;
  await ouvrir(pg, LA.p9);
  egal([(await etatL(pg)).lendemain.ouvertures, await present(pg, '[data-pal-lscan-emp]:not([disabled])'), await present(pg, '[data-pal-lscan-pal]:not([disabled])')],
    [n0, false, false], 'regarder reste permis : rien ne compte, rien ne se scanne');
  egal(erreurs, [], 'erreurs JS');
});

await v('Le lendemain : posée à côté sans scan → on cherche P3 (le système la croit à son adresse, elle est à côté) ; scanner une autre palette : « Rien à transférer. » ; transfert vers son adresse libérée → le lendemain tout juste, adresseLibre-P3 et scan-P3 ko', async () => {
  await monterL(pg, { chemin: 'acote' });
  await passer(pg);
  egal(await chercheeL(pg), { id: 'P3', nom: 'Bougies parfumées', adresseSysteme: LA.p3, adresseReelle: LA.p3Cote }, 'on cherche SA palette');
  egal(await croitLd(pg, 'P3'), LA.p3, 'le système la croit à son adresse donnée');
  await ouvrir(pg, LA.p1); await scanPalL(pg, 'P1');
  egal(await derniere(pg), 'P1 — Cahiers grand format. Rien à transférer.', 'une autre palette : rien à transférer');
  await ouvrir(pg, LA.p3);
  egal((await etatL(pg)).lendemain.trouvee, false, 'l’adresse donnée est vide');
  await ouvrir(pg, LA.p3Cote);
  egal([(await etatL(pg)).lendemain.trouvee, (await etatL(pg)).lendemain.trouveeA], [true, 3], 'trouvée à côté');
  await scanPalL(pg, 'P3'); await ouvrir(pg, LA.p3); await scanEmpL(pg);
  egal(await derniere(pg), 'Transfert enregistré : P3 de A1-T02-N1-E1 vers A1-T02-N1-E3.', 'Terminal');
  await compris(pg);
  egal(await croitLd(pg, 'P3'), LA.p3, 'le système la sait là');
  await validerL(pg);
  egal(await jalons(pg), Object.assign(tousLend('ok'), { 'adresseLibre-P3': 'ko', 'scan-P3': 'ko' }), 'le piège coûte le soir seulement');
  egal(await noteL(pg), 15, 'note : 20 − 3 − 2');
});

await v('Le lendemain : P3 laissée en réception → Kevin la pose la nuit en A1-T02-N1-E2 (alleeVers), on cherche P3 ; si P1 a pris A1-T02-N1-E2, Kevin la pose au premier emplacement libre au sol ; un emplacement d’adresse libre demandée mais posée ailleurs → P3 aussi', async () => {
  await monterL(pg, { chemin: 'allee' });
  await passer(pg);
  egal(await chercheeL(pg), { id: 'P3', nom: 'Bougies parfumées', adresseSysteme: LA.p3, adresseReelle: LA.allee }, 'P3 posée par Kevin à alleeVers');
  await ouvrir(pg, LA.allee);
  egal([await texte(pg, '[data-pal-occ]'), (await etatL(pg)).lendemain.trouvee], ['Occupé : palette P3 · Bougies parfumées', true], 'elle y est, trouvée');
  // alleeVers déjà prise par P1 (posée là à tort) : le premier emplacement libre au sol, dans l'ordre du plan (A1-T01-N1-E2).
  await monterL(pg, { chemin: 'allee', prerempli: { posees: { P1: LA.allee }, scan: {} } });
  await passer(pg);
  egal((await chercheeL(pg)).adresseReelle, 'A1-T01-N1-E2', 'repli : le premier emplacement libre au sol');
  // Adresse libre demandée, posée à côté : le système la croit à l'adresse libre, elle est ailleurs.
  await monterL(pg, { chemin: 'acote', prerempli: { libres: { P3: LA.p3Libre } } });
  await passer(pg);
  egal(await chercheeL(pg), { id: 'P3', nom: 'Bougies parfumées', adresseSysteme: LA.p3Libre, adresseReelle: LA.p3Cote }, 'demandée mais posée ailleurs : P3, attendue à l’adresse libre');
  // Demandée, rangée là, PAS scannée : le système la croit là où elle est → c'est P9 qu'on cherche.
  await monterL(pg, { chemin: 'scanne', prerempli: { scan: { P1: LA.p1 } } });
  await passer(pg);
  egal((await chercheeL(pg)).id, 'P9', 'rangée à l’adresse libre demandée, non scannée : le système la sait là, on cherche P9');
});

await v('Le lendemain : trouvée en 6 ouvertures → retrouvee ok, trouveeVite ko ; jamais trouvée → les quatre ko ; trouvée sans transfert → transfert-place et transfert-scan ko ; aucun « à faire » après « Valider mon transfert »', async () => {
  await monterL(pg, { chemin: 'scanne' });
  await passer(pg);
  for (const a of ['B1-T03-N1-E1', LA.p9, 'B1-T03-N2-E1', 'B1-T03-N2-E2', 'B1-T03-N2-E3']) await ouvrir(pg, a);
  await ouvrir(pg, LA.p9Posee);
  egal((await etatL(pg)).lendemain.trouveeA, 6, 'trouvée à la 6e');
  await transferer(pg, 'P9', LA.p9Posee, LA.p9);
  await validerL(pg);
  egal(await jalons(pg), Object.assign(tousLend('ok'), { trouveeVite: 'ko' }), '6 ouvertures > trouveEn (4)');
  // Jamais trouvée : « Valider » dit qu'aucun transfert n'est enregistré.
  await monterL(pg, { chemin: 'scanne' });
  await passer(pg);
  await bouton(pg, 'lvalider');
  vrai((await texte(pg, '[data-pal-confirme-l]')).includes('(Aucun transfert enregistré.)'), 'la confirmation le dit');
  await bouton(pg, 'lvaliderOui');
  egal(await jalons(pg), Object.assign(tousLend('ko'), soirOk), 'jamais trouvée : les quatre ko, jamais « à faire »');
  egal(await texte(pg, '[data-pal-lcarte]'), 'P9 Peluches non retrouvée ✗ transfert, scan', 'la carte après la validation');
  // Trouvée, pas transférée.
  await monterL(pg, { chemin: 'scanne' });
  await passer(pg);
  await ouvrir(pg, LA.p9Posee); await scanPalL(pg, 'P9');
  await validerL(pg);
  egal(await jalons(pg), Object.assign(tousLend('ok'), { 'transfert-place': 'ko', 'transfert-scan': 'ko' }), 'trouvée, pas transférée');
  egal(Object.values(await jalons(pg)).filter((x) => x === 'attente'), [], 'aucun « à faire »');
});

await v('Le lendemain : son adresse encore prise (haut) → « Emplacement déjà occupé. » ; « Demander une adresse libre » → B1-T03-N2-E1 (niveau 2) ; scan → « À monter », transfert enregistré ; « Faire monter » → montée, tout juste ; avec `monte(db)`, validée sans monter → transfert-place ko, transfert-scan ok', async () => {
  await monterL(pg, { chemin: 'scanne', haut: true });
  await passer(pg);
  await ouvrir(pg, LA.p9Posee); await scanPalL(pg, 'P9');
  await ouvrir(pg, LA.p9);
  egal(await texte(pg, '[data-pal-occ]'), 'Occupé : Nettoyant multi-usages 1 L', 'pas évacuée cette nuit');
  await scanEmpL(pg);
  egal(await lignesRouges(pg), ['Emplacement déjà occupé.'], 'refus : occupé');
  egal((await etatL(pg)).lendemain.refus, 0, 'pas une trace (c’est la bonne adresse)');
  await bouton(pg, 'llibre');
  const TL = 'Adresse libre pour P9 (Peluches) : B1-T03-N2-E1.';
  egal([await texteFen(pg), await derniere(pg)], [TL, TL], 'fenêtre et Terminal');
  await compris(pg);
  egal((await etatL(pg)).lendemain.libre, LA.p9Libre, 'adresse libre demandée');
  await ouvrir(pg, LA.p9Libre); await scanEmpL(pg);
  egal(await derniere(pg), 'Transfert enregistré : P9 de B1-T03-N1-E3 vers B1-T03-N2-E1.', 'transfert vers le niveau 2');
  vrai((await texteFen(pg)).endsWith('Elle attend Kevin dans la zone « À monter ».'), 'la fenêtre dit qu’elle attend Kevin');
  egal(await croitLd(pg, 'P9'), LA.p9Libre, 'le système la croit à son adresse libre (plus à son adresse donnée)');
  await compris(pg);
  egal([await texte(pg, '[data-pal-occ]'), (await texte(pg, '[data-pal-amonter-liste]')).includes('P9 → B1-T03-N2-E1')], ['Réservé : P9, à monter (Kevin)', true], 'réservée, à monter');
  egal(await pg.$eval(`${Z} [data-pal="lmonter"]`, (b) => b.disabled), false, '« Faire monter » actif');
  await bouton(pg, 'lmonter');
  egal([(await etatL(pg)).lendemain.montee, await texte(pg, '[data-pal-amonter-liste]')], [true, 'À monter (Kevin) : aucune'], 'montée');
  await validerL(pg);
  egal(await jalons(pg), tousLend('ok'), 'tout juste');
  // Avec `monte(db)` (Kevin monte quand la base le dit) : validée sans « Faire monter » → pas remise en ordre, mais le système la sait là.
  await monterL(pg, { chemin: 'scanne', haut: true, monte: 'base' });
  await passer(pg);
  await ouvrir(pg, LA.p9Posee); await scanPalL(pg, 'P9'); await ouvrir(pg, LA.p9); await bouton(pg, 'llibre'); await compris(pg);
  await ouvrir(pg, LA.p9Libre); await scanEmpL(pg); await compris(pg);
  await bouton(pg, 'retour'); await bouton(pg, 'lvalider');
  vrai((await texte(pg, '[data-pal-confirme-l]')).startsWith('La palette attend Kevin : elle ne comptera pas comme remise en ordre.'), 'la confirmation prévient');
  await bouton(pg, 'lvaliderOui');
  egal(await jalons(pg), Object.assign(tousLend('ok'), { 'transfert-place': 'ko' }), 'transfert-place ko, transfert-scan ok');
});

await v('Le lendemain : deux étapes sur l’écran du plan — la barre « Étape suivante » mène au plan le soir, puis le lendemain, sans planter', async () => {
  await monterL(pg, { suite: true, yanis: true });
  egal(await pg.$('#palTest [data-suite]'), null, 'sur l’écran du plan, pas de barre');
  await pg.click('#palTest .ent-nav[data-vue="mail"]');
  const barre = () => pg.$eval('#palTest [data-suite="entrepot"]', (b) => b.textContent.replace(/\s+/g, ' ').trim()).catch(() => '');
  egal(await barre(), 'Étape suivante : Fin de poste : range les palettes Y aller →', 'le soir');
  await pg.click('#palTest [data-suite-aller]');
  egal(!!(await pg.$('#palTest [data-pe-mode="palettier"]')), true, '« Y aller » ouvre le plan');
  await ranger(pg, 'P1', LA.p1); await valider(pg); await passer(pg);
  await pg.click('#palTest .ent-nav[data-vue="mail"]');
  egal(await barre(), 'Étape suivante : Le lendemain : retrouve la palette Y aller →', 'le lendemain : la seconde étape, même écran');
  await pg.click('#palTest [data-suite-aller]');
  egal(await pg.getAttribute(Z, 'data-pe-phase'), 'lendemain', '« Y aller » ouvre le plan du matin');
  egal(erreurs, [], 'erreurs JS (aucune étape ne plante)');
});

await v('Le lendemain : en copie — « Valider mon rangement » ne rend pas la copie, le bouton du lendemain est là ; « Valider mon transfert » la rend ; aucun verdict ; jalons jugés', async () => {
  await monterL(pg, { temps: 'evaluation' });
  await ranger(pg, 'P1', LA.p1); await scanPal(pg, 'P1'); await scanEmp(pg);
  await valider(pg);
  egal([await pg.evaluate(() => window.__p.remis), await texte(pg, '[data-pal="phase"]')], [null, 'Le lendemain, 6 h'], 'pas de copie rendue au soir');
  await passer(pg);
  await ouvrir(pg, LA.p9Posee);
  egal((await etatL(pg)).lendemain.trouvee, false, 'P3 en réception : posée par Kevin à alleeVers, c’est elle qu’on cherche');
  await ouvrir(pg, LA.allee);
  await transferer(pg, 'P3', LA.allee, LA.p3);
  await validerL(pg);
  await pg.waitForFunction(() => window.__p.remis !== null);
  egal(await pg.$$eval(`${Z} [data-pal-verdict]`, (L) => L.length), 0, 'aucun verdict');
  const J = await jalons(pg);
  egal(LEND.map((id) => J[id]), ['ok', 'ok', 'ok', 'ok'], 'le lendemain jugé');
});

await v('Le lendemain : une déclaration fautive ne se charge pas (phases sans lendemain et l’inverse, phases inconnues, sans bouton, P9 = une palette de l’élève, posée occupée ou en hauteur, adresse de Kevin libre, alleeVers occupée, évacuée vide, sans Terminal, trouveEn, avec un comptage)', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntrepot } = await import('/core/types/entrepot.js');
    const C = await import('/contenus/palettier-essai.js');
    const P0 = C.lendemain();
    const essai = (o) => { try { creerEntrepot(Object.assign({}, P0, { id: `x${Math.random()}` }, o)); return ''; } catch (e) { return e.message; } };
    const L = (x) => ({ lendemain: Object.assign({}, P0.lendemain, x) });
    const K = (pal, x = {}) => L({ kevin: Object.assign({}, P0.lendemain.kevin, { palette: Object.assign({}, P0.lendemain.kevin.palette, pal) }, x) });
    return [
      essai({}),
      essai({ lendemain: undefined }),
      essai({ phases: undefined }),
      essai({ phases: [{ id: 'soir' }, { id: 'matin', bouton: 'x' }] }),
      essai({ phases: [{ id: 'soir' }, { id: 'lendemain' }] }),
      essai(K({ id: 'P1' })),
      essai(K({}, { posee: 'A1-T03-N1-E1' })),
      essai(K({}, { posee: 'B1-T03-N2-E1' })),
      essai(K({ adresse: 'B1-T03-N1-E1' })),
      essai(L({ nuit: { evacuees: ['A1-T02-N1-E3'], alleeVers: 'A1-T03-N1-E1' } })),
      essai(L({ nuit: { evacuees: ['A1-T02-N1-E1'], alleeVers: 'A1-T02-N1-E2' } })),
      essai({ terminal: undefined }),
      essai(L({ trouveEn: 0 })),
      essai({ comptage: { adresses: [{ adresse: 'A2-T02-N1-E2', produit: 'BOI', systeme: 26, reel: 26, couche: [2, 4], couches: 4 }] } }),
    ];
  });
  egal(r[0], '', `la déclaration d’essai se charge : ${r[0]}`);
  vrai(r[1].includes('lendemain : une déclaration'), r[1]);
  vrai(r[2].includes('phases : seule'), r[2]);
  vrai(r[3].includes('phases : seule'), r[3]);
  vrai(r[4].includes('a un bouton'), r[4]);
  vrai(r[5].includes('pas celui d’une palette de l’élève'), r[5]);
  vrai(r[6].includes('doit être libre dans le stock'), r[6]);
  vrai(r[7].includes('pas au niveau 1'), r[7]);
  vrai(r[8].includes('doit être occupée le soir'), r[8]);
  vrai(r[9].includes('alleeVers : A1-T03-N1-E1 doit être libre'), r[9]);
  vrai(r[10].includes('A1-T02-N1-E1 est vide le soir'), r[10]);
  vrai(r[11].includes('le transfert se fait au Terminal'), r[11]);
  vrai(r[12].includes('trouveEn'), r[12]);
  vrai(r[13].includes('pas avec un comptage'), r[13]);
});

await v('Le lendemain : la page d’essai (cas « Le lendemain ») tient en 1366 × 768 et 1280 × 720 sans défiler : soir validé et son bouton, plan du matin, travée et vue de près avec les deux étiquettes à scanner, fenêtre du transfert', async () => {
  const pe = await ctx.newPage();
  const err = [];
  pe.on('pageerror', (e) => err.push(e.message));
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
    await pe.setViewportSize({ width: w, height: h });
    await pe.goto(BASE + 'outils/essai-palettier.html');
    await pe.waitForSelector('.pal');
    await pe.selectOption('#reglages select[name="cas"]', 'lendemain');
    await pe.waitForSelector('.pal [data-pe-pal="P3"]');
    await pe.selectOption('#reglages select[name="chemin"]', 'scanne');
    await pe.waitForSelector('.pal [data-pal="phase"]');
    // Les bandeaux de la page d'essai (réglages, mention, bilan des jalons) ne sont pas ceux de la séance : la mise en page se mesure sans eux.
    await pe.addStyleTag({ content: '#reglages, #mention, #essaiNote { display: none !important }' });
    const deborde = () => pe.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
    const vu = (s) => pe.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth && r.height > 0; }, s);
    egal([await vu('.pal [data-pal="phase"]'), await deborde()], [true, 0], `soir validé : le bouton visible, rien ne dépasse (${w} × ${h})`);
    await pe.click('.pal [data-pal="phase"]'); await pe.click('.pal [data-pal="phaseOui"]');
    await pe.waitForSelector('.pal-lendemain');
    // Le message de Yanis pose sa carte « Nouveau message » en haut (le moteur, pour tout message) : la mise en page se mesure sans elle,
    // comme le cas de Kevin.
    egal(await pe.evaluate(() => (window.__essai.db.mails || []).filter((m) => m.from === 'Yanis').length), 1, 'Yanis a écrit');
    await pe.addStyleTag({ content: '.ent-carte, .ent-carte-reste { display: none !important }' });
    egal(await deborde(), 0, `le plan du matin tient (${w} × ${h})`);
    await pe.click('.pal [data-pe-trav="B1-T03"]');
    await pe.click(`.pal [data-pe-emp="${LA.p9Posee}"]`);
    egal([await vu('.pal [data-pal-lscan-pal="P9"]'), await vu('.pal [data-pal-lscan-emp]'), await vu('.pal [data-pal="lvalider"]'), await deborde()], [true, true, true, 0], `travée et vue de près : étiquettes visibles, rien ne dépasse (${w} × ${h})`);
    await pe.click('.pal [data-pal-lscan-pal="P9"]');
    await pe.click(`.pal [data-pe-emp="${LA.p9}"]`);
    await pe.click('.pal [data-pal-lscan-emp]');
    egal([await vu('.pal [data-pal-modal-ok]'), (await pe.textContent('.pal [data-pal-modal-texte]')).replace(/\s+/g, ' ').trim()],
      [true, 'Transfert enregistré : P9 de B1-T03-N1-E3 vers B1-T03-N1-E2.'], `la fenêtre du transfert (${w} × ${h})`);
    await pe.click('.pal [data-pal-modal-ok]');
  }
  egal(err, [], 'erreurs JS');
  await pe.close();
});

/* =========================================================== l'évaluation en copie (lot 6, 22/10/2026) */
// Cas « Évaluation : … », sur le cas d'essai `evaluation()` de `contenus/palettier-essai.js` (imite ENT-8.14) : EN COPIE, un entrepôt à deux
// phases (`rangement`, puis `comptage` derrière « Passer au comptage »), `rendCopie: false`, un plan PAR SITE (fonction de la graine).
// `PALETTIER_SEUL='Évaluation'` ne joue que cette section. Valeurs écrites À LA MAIN (jamais relues dans le contenu) :
//   Onnaing (cariste Léo, 6 côtés A1 à C2 = 24 travées, plaques N2 1 400 / N3 1 200 kg) : P1 C1-T03-N1-E2 · P2 B2-T02-N1-E3 · P3 A2-T02-N3-E1 (à confier) ·
//     P4 A1-T02-N2-E2 (à signaler : 940 kg déjà là + 545 = 1 485 > 1 400) · P5 A1-T03-N1-E1 (prise), adresse libre A1-T01-N1-E2 ;
//     à compter B1-T02-N1-E2, C2-T02-N1-E1, C1-T04-N1-E3, B2-T04-N1-E2 ; réel 26, 31, 27, 29 ; l'écart est au rang 2 : système 34 (manque) ou 29 (surplus).
//   Belleville (cariste Hugo, 4 côtés = 16 travées, plaques N2 1 600 / N3 1 300 kg) : P1 B1-T03-N1-E2 · P2 A2-T04-N1-E1 · P3 B2-T02-N3-E3 ·
//     P4 A1-T03-N2-E2 (1 220 + 545 = 1 765 > 1 600) · P5 B1-T02-N1-E1 (prise), adresse libre A2-T01-N1-E3 ;
//     à compter A1-T02-N1-E3, A2-T03-N1-E2, B2-T04-N1-E1, B1-T04-N1-E3 ; réel 29, 38, 30, 26 ; rang 2 : système 41 (manque) ou 36 (surplus).
//   Poids d'essai (somme 20) : place-P1 à P3 2, signale-P4 3, adresseLibre-P5 2, scan-P1 P2 P3 P5 1, pasPoseHaut 1, charge 0, compte 0,75 × 4, scanAvant 1.
const IDE = 'essai-evaluation';
const SE = {
  onnaing: { cariste: 'Léo', p1: 'C1-T03-N1-E2', p2: 'B2-T02-N1-E3', p3: 'A2-T02-N3-E1', p4: 'A1-T02-N2-E2', p5: 'A1-T03-N1-E1', libre: 'A1-T01-N1-E2',
    compter: ['B1-T02-N1-E2', 'C2-T02-N1-E1', 'C1-T04-N1-E3', 'B2-T04-N1-E2'], reel: [26, 31, 27, 29], travees: 24, allees: ['A', 'B', 'C'],
    plaqueP3: 'Charge max 1 200 kg par niveau', plaqueP4: 'Charge max 1 400 kg par niveau', systeme: { manque: 34, surplus: 29 } },
  belleville: { cariste: 'Hugo', p1: 'B1-T03-N1-E2', p2: 'A2-T04-N1-E1', p3: 'B2-T02-N3-E3', p4: 'A1-T03-N2-E2', p5: 'B1-T02-N1-E1', libre: 'A2-T01-N1-E3',
    compter: ['A1-T02-N1-E3', 'A2-T03-N1-E2', 'B2-T04-N1-E1', 'B1-T04-N1-E3'], reel: [29, 38, 30, 26], travees: 16, allees: ['A', 'B'],
    plaqueP3: 'Charge max 1 300 kg par niveau', plaqueP4: 'Charge max 1 600 kg par niveau', systeme: { manque: 41, surplus: 36 } },
};
// Les adresses de palettes (adresse donnée, adresse libre) de chaque site : aucune n'est à compter.
const ADRESSES_PAL = (S) => [S.p1, S.p2, S.p3, S.p4, S.p5, S.libre];
// Dans l'ordre de `jalons` : chaque scan juste après son place / adresseLibre ; P4 (à signaler, sans nouvelle adresse) n'a pas de scan ; les gardes ; le comptage.
const IDS_E = ['place-P1', 'scan-P1', 'place-P2', 'scan-P2', 'place-P3', 'scan-P3', 'signale-P4', 'adresseLibre-P5', 'scan-P5', 'pasPoseHaut', 'charge',
  'compte-1', 'compte-2', 'compte-3', 'compte-4', 'recompte-1', 'recompte-2', 'recompte-3', 'recompte-4', 'scanAvant'];
const RANGEMENT_E = IDS_E.slice(0, 11), COMPTAGE_E = IDS_E.slice(11);
const toutE = (ids, j) => Object.fromEntries(ids.map((id) => [id, j]));
// Une graine (identifiant d'élève) qui tombe sur le site et le sens d'écart demandés : la première `u<n>` qui convient.
const uidE = (p, site, sens) => p.evaluate(async ([site, sens]) => {
  const C = await import('/contenus/palettier-essai.js');
  const { siteDe } = await import('/contenus/action-eval-sites.js');
  for (let i = 0; i < 400; i++) { const u = `u${i}`; if (siteDe(u) === site && C.sensEcartEval(u) === sens) return u; }
  return null;
}, [site, sens]);
// Monte l'environnement de l'évaluation. `o` : site + sens (la graine), uid, variante ('sansRendCopie' : l'ancien comportement ; 'sansBouton' : phases
// sans bouton ; 'sansPhases' : ni phases ni bouton ; 'palettes' : le rangement seul, avec `rendCopie: false` ; 'palettesSans' : le rangement seul, sans ;
// 'lendemain' / 'lendemainSans' : le cas du lendemain en copie, avec / sans `rendCopie: false` ; 'tout' : la séance déclare TOUT ce qui parle — `verdict`, `regles`
// dépliées — et la copie doit tout taire), role, db.
const monterE = (p, o = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const { declarationDe } = await import('/core/types/entrepot-palettier.js');
  const C = await import('/contenus/palettier-essai.js');
  document.querySelector('#palTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'palTest'; document.body.appendChild(hote);
  const f = C.evaluation({ sansRendCopie: o.variante === 'sansRendCopie' });
  let P = f;
  if (o.variante === 'sansBouton') P = (g, x) => Object.assign(f(g, x), { phases: [{ id: 'rangement' }, { id: 'comptage' }] });
  else if (o.variante === 'tout') P = (g, x) => Object.assign(f(g, x), { verdict: 'adresse', regles: { titre: 'Les règles', lignes: ['Une règle d’essai.'], ouvertes: true } });
  else if (o.variante === 'sansPhases') P = (g, x) => { const D = f(g, x); delete D.phases; return D; };
  else if (o.variante === 'palettes' || o.variante === 'palettesSans') {
    P = (g, x) => { const D = f(g, x); delete D.phases; delete D.comptage; if (o.variante === 'palettesSans') delete D.rendCopie; return D; };
  } else if (o.variante === 'lendemain' || o.variante === 'lendemainSans') {
    P = C.lendemain(); if (o.variante === 'lendemain') P.rendCopie = false;
  }
  const lend = typeof P !== 'function';
  // Le rangement seul n'a pas les 20 points du cas complet : jalons sans poids (la note est alors proportionnelle, sur 20).
  const U = C.universPalettier({ temps: 'evaluation', entrepot: P, suite: lend ? false : 'evaluation', poids: !String(o.variante).startsWith('palettes') });
  const db = lend ? { entrepots: { 'essai-lendemain': C.soirPrerempli('scanne') } } : (o.db || {});
  const moteur = creerEntreprise(U);
  window.__p = { db, P, U, temps: 'evaluation', moteur, remis: null, D: () => declarationDe(P, db, { copie: true }) };
  moteur.rendre(hote, {
    meta: { id: 'essai-palettier', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps: 'evaluation', copie: true },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || C.graineDeSite(o.site || 'onnaing') },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
    rendreCopie: async (res) => { window.__p.remis = res; return { rendu: Date.now() }; },
  });
  document.querySelector('#palTest .ent-nav[data-vue="entrepot"]').click();
}, o);
const etatE = (p) => p.evaluate(() => JSON.parse(JSON.stringify((window.__p.db.entrepots || {})[window.__p.D().id] || null)));
const jalonsE = (p) => p.evaluate(async () => {
  const E = await import('/core/types/entrepot.js');
  const W = window.__p;
  return Object.fromEntries(E.jalonsEntrepot(W.db, W.D(), 'evaluation').L.map((l) => [l.id, l.etat]));
});
const gestesE = (p) => p.evaluate(() => Object.keys((window.__p.db.gestes || {})['essai-palettier'] || {}).sort());
const remisE = (p) => p.evaluate(() => window.__p.remis);
// « Rendre ma copie » : le bouton du bandeau du moteur, hors de la vue (un premier clic arme, le second rend).
const rendreE = async (p) => {
  await p.click('#palTest [data-copie-rendre]'); await p.click('#palTest [data-copie-rendre]');
  await p.waitForFunction(() => window.__p.remis !== null);
};
// Le rangement juste de la matinée : P1 et P2 au sol, P3 confiée, P4 signalée (charge), P5 : adresse prise → adresse libre demandée, posée là.
async function rangerE(p, S) {
  await ranger(p, 'P1', S.p1); await ranger(p, 'P2', S.p2); await ranger(p, 'P3', S.p3, 'confier');
  await signaler(p, 'P4', S.p4, 'charge');
  await prendre(p, 'P5'); await ouvrir(p, S.p5); await bouton(p, 'libre'); await p.click(`${Z} [data-pal-modal-ok]`);
  await ouvrir(p, S.libre); await bouton(p, 'poser');
}
async function scansE(p, S) {
  for (const [id, a] of [['P1', S.p1], ['P2', S.p2], ['P3', S.p3], ['P5', S.libre]]) { await scanPal(p, id); await ouvrir(p, a); await scanEmp(p); }
}
const versComptage = async (p) => { await bouton(p, 'phase'); await bouton(p, 'phaseOui'); };
// Compter la liste : les trois adresses justes d'un coup ; l'écart (rang 2) : « Recompter », le même nombre, puis « Confirmer ».
async function compterE(p, S) {
  for (let i = 0; i < 4; i++) {
    await ouvrir(p, S.compter[i]); await scanC(p);
    if (i === 1) { await taper(p, S.reel[1]); await choisir(p, 'recompter'); await taper(p, S.reel[1]); await choisir(p, 'confirmer'); } else await taper(p, S.reel[i]);
  }
}
// Rien du système dans le DOM (hors enseignant) : aucun verdict, aucun « attendu », aucune réponse.
const sansSysteme = (p) => p.evaluate(() => {
  const z = document.querySelector('#palTest'), h = z.innerHTML, t = z.innerText;
  return [/✗/, /✓ bien rangée/, /✓ remise en ordre/, /bien rangée/, /adresse attendue/, /· réel/, /data-pal-verdict/, /data-pal-cverdict/, /pe-verd pe-/, /pe-prof/, /Côté enseignant/, /Les règles/, /data-pe-regles/]
    .filter((r) => r.test(h) || r.test(t)).map(String);
});

await v('Évaluation : une déclaration fautive ne se charge pas (`rendCopie` autre que false, phases mal écrites, sans palettes ou sans comptage, bouton ou consigne qui ne sont pas du texte, un lendemain en même temps, une adresse à compter qui est celle d’une palette) ; sans bouton ni `rendCopie`, elle se charge', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntrepot } = await import('/core/types/entrepot.js');
    const C = await import('/contenus/palettier-essai.js');
    const D0 = C.evaluation()('u0', { copie: true });
    const essai = (o) => { try { creerEntrepot(Object.assign({}, D0, { id: `x${Math.random()}` }, o)); return ''; } catch (e) { return e.message; } };
    const adr = (i, a) => ({ comptage: { adresses: D0.comptage.adresses.map((x, k) => (k === i ? Object.assign({}, x, { adresse: a }) : x)) } });
    return [essai({}),
      essai({ rendCopie: true }), essai({ rendCopie: 'oui' }), essai({ rendCopie: undefined }),
      essai({ phases: [{ id: 'rangement' }] }), essai({ phases: [{ id: 'rangement' }, { id: 'lendemain', bouton: 'x' }] }),
      essai({ comptage: undefined }), essai({ palettes: undefined }),
      essai({ phases: [{ id: 'rangement' }, { id: 'comptage', bouton: 42 }] }), essai({ phases: [{ id: 'rangement' }, { id: 'comptage', bouton: ' ' }] }),
      essai({ phases: [{ id: 'rangement' }, { id: 'comptage', consigne: 5 }] }),
      essai({ lendemain: { kevin: {} } }),
      essai(adr(0, D0.palettes[0].adresse)), essai(adr(2, D0.palettes[4].adresseLibre)),
      essai({ phases: [{ id: 'rangement' }, { id: 'comptage' }] })];
  });
  egal(r[0], '', `l’évaluation d’essai se charge : ${r[0]}`);
  vrai(r[1].includes('rendCopie : ne prend que la valeur false') && r[2].includes('rendCopie : ne prend que la valeur false'), `rendCopie true / « oui » : ${r[1]} / ${r[2]}`);
  egal(r[3], '', '`rendCopie` absent : se charge (l’ancien comportement)');
  vrai(r[4].includes('seconde phase s’appelle « comptage »') && r[5].includes('seconde phase s’appelle « comptage »'), `phases mal écrites : ${r[4]} / ${r[5]}`);
  vrai(r[6].includes('il faut des palettes à ranger ET un comptage') && r[7].includes('il faut des palettes à ranger ET un comptage'), `sans comptage ou sans palettes : ${r[6]} / ${r[7]}`);
  vrai(r[8].includes('le bouton de la phase « comptage » est un texte') && r[9].includes('le bouton de la phase « comptage » est un texte'), `bouton : ${r[8]} / ${r[9]}`);
  vrai(r[10].includes('la consigne de la phase « comptage » est un texte'), r[10]);
  vrai(r[11].includes('pas de lendemain'), r[11]);
  vrai(r[12].includes('est l’adresse donnée de la palette P1') && r[13].includes('est l’adresse donnée de la palette P5'),
    `une adresse à compter qui est celle d’une palette (donnée ou libre) : ${r[12]} / ${r[13]}`);
  egal(r[14], '', 'phases sans bouton : se charge');
});

await v('Évaluation : les jalons sont les mêmes pour toutes les graines (20 jalons dans l’ordre : le rangement, puis le comptage ; P4 à signaler n’a pas de scan) et les deux sites sont tirés ; en copie les étapes (`etapesPalettier`) sont les mêmes', async () => {
  const r = await pg.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/palettier-essai.js');
    const { siteDe } = await import('/contenus/action-eval-sites.js');
    const f = C.evaluation(), ids = new Set(), sites = new Set();
    for (let i = 0; i < 60; i++) {
      const g = `u${i}`; sites.add(siteDe(g));
      ids.add(E.jalonsEntrepot({}, f(g, { copie: true }), 'evaluation').L.map((l) => l.id).join());
    }
    return { ids: [...ids], sites: [...sites].sort(), etapes: E.etapesPalettier(f, { copie: true }).map((e) => e.id) };
  });
  egal(r.ids, [IDS_E.join()], 'les mêmes ids pour 60 graines');
  egal(r.sites, ['belleville', 'onnaing'], 'les deux sites sont tirés');
  egal(r.etapes, IDS_E, '`etapesPalettier` en copie : mêmes ids, rangement puis comptage');
});

await v('Évaluation : deux sites, deux plans — Onnaing 24 travées, 3 allées, plaques 1 400 / 1 200 kg, cariste Léo ; Belleville 16 travées, 2 allées, plaques 1 600 / 1 300 kg, cariste Hugo ; mêmes cartes P1 à P5 aux deux', async () => {
  const lu = [];
  for (const site of ['onnaing', 'belleville']) {
    const S = SE[site];
    await monterE(pg, { site });
    egal(await pg.$$eval(`${Z} .pe-bandeau [data-pe-pal]`, (L) => L.map((b) => b.dataset.pePal)), ['P1', 'P2', 'P3', 'P4', 'P5'], `${site} : les cartes`);
    egal(await pg.$$eval(`${Z} [data-pe-trav]`, (L) => L.length), S.travees, `${site} : travées`);
    egal(await pg.$$eval(`${Z} [data-pal-amonter]`, (L) => L.map((g) => g.dataset.palAmonter)), S.allees, `${site} : une zone « À monter » par allée`);
    egal(await texte(pg, '[data-pal-amonter-liste]'), `À monter (${S.cariste}) : aucune`, `${site} : le cariste`);
    egal(await texte(pg, '[data-pal-etiq="P1"]'), `Adresse ${S.p1}`, `${site} : l’adresse de P1`);
    await ouvrir(pg, S.p3); const a = await texte(pg, '[data-pal-plaque]');
    await ouvrir(pg, S.p4); const b = await texte(pg, '[data-pal-plaque]');
    egal([a, b], [S.plaqueP3, S.plaqueP4], `${site} : les plaques de charge`);
    lu.push([S.travees, a, b, await texte(pg, '[data-pal-amonter-liste]')]);
  }
  vrai(lu[0].join('|') !== lu[1].join('|'), 'les deux plans diffèrent');
});

await v('Évaluation, Onnaing (le système croit 34 : il MANQUE) : le rangement (P3 confiée, P4 signalée, P5 adresse libre) et ses scans, « Valider » ne rend PAS la copie, le bouton « Passer au comptage » prend la place, le comptage vient après (stock de départ), « Terminer » ne rend pas non plus ; « Rendre ma copie » (le bandeau) rend 20 / 20', async () => {
  const S = SE.onnaing;
  await monterE(pg, { uid: await uidE(pg, 'onnaing', 'manque') });
  egal(await jalonsE(pg), toutE(IDS_E, 'attente'), 'tout à faire');
  egal(await pg.getAttribute(Z, 'data-pe-phase'), 'rangement', 'phase : rangement');
  await rangerE(pg, S); await scansE(pg, S);
  await valider(pg);
  egal([await remisE(pg), await pg.getAttribute(Z, 'data-pe-phase'), await texte(pg, '[data-pal="phase"]'), await present(pg, '[data-pal-acompter]'), await present(pg, '[data-pal="valider"]')],
    [null, 'rangement', 'Passer au comptage', false, false], '« Valider » : pas de copie rendue, le bouton de phase, pas encore de comptage');
  vrai((await texte(pg, '[data-pe-consigne]')).endsWith('Rangement validé. Pour la suite, clique Passer au comptage.'), 'la consigne');
  egal(await texte(pg, '[data-pal-etat="P1"]'), 'posée en C1-T03-N1-E2 · scannée', 'la carte : posée, scannée');
  egal(await texte(pg, '[data-vt-actu]'), 'Terminé.', 'le Terminal : le rangement est terminé');
  egal(await jalonsE(pg), { ...toutE(RANGEMENT_E, 'ok'), ...toutE(COMPTAGE_E, 'attente') }, 'le rangement jugé, le comptage à faire');
  egal(await etatE(pg).then((e) => [e.phase, e.valide, 'comptage' in e]), ['rangement', true, true], 'état : phase « rangement » (le comptage est créé vide au premier dessin)');
  vrai((await gestesE(pg)).includes('entrepot:essai-evaluation:valider') && !(await gestesE(pg)).includes('entrepot:essai-evaluation:phase:comptage'), 'valider publié, phase:comptage pas encore');
  await bouton(pg, 'phase');
  egal(await texte(pg, '[data-pal-confirme-phase]').then((t) => t.startsWith('Passer au comptage ?')), true, 'confirmation');
  await bouton(pg, 'phaseNon');
  egal([await present(pg, '[data-pal="phase"]'), await present(pg, '[data-pal-acompter]')], [true, false], '« Non » : toujours au rangement');
  await versComptage(pg);
  egal([await pg.getAttribute(Z, 'data-pe-phase'), await present(pg, '[data-pal="phase"]'), await present(pg, '[data-pal="terminer"]'), await actu(pg)], ['comptage', false, true, 'Scanne l’adresse.'], 'le comptage');
  egal(await pg.$$eval(`${Z} [data-pal-acompter] li b`, (L) => L.map((x) => x.textContent)), S.compter, 'la liste : quatre adresses du stock de départ');
  vrai(ADRESSES_PAL(S).every((a) => !S.compter.includes(a)), 'aucune adresse à compter n’est une adresse de palette');
  egal(await texte(pg, '.pal-compte-consigne p'), 'Compte les adresses de la liste « À compter », avec le Terminal.', 'la consigne de la phase');
  vrai((await gestesE(pg)).includes('entrepot:essai-evaluation:phase:comptage'), 'phase:comptage publié');
  egal((await etatE(pg)).phase, 'comptage', 'état : phase « comptage »');
  // Le comptage : le Terminal propose de recompter sur l'écart (rang 2), sans dire de combien ni dans quel sens.
  await ouvrir(pg, S.compter[0]); await scanC(pg); await taper(pg, 26);
  egal(await actu(pg), 'Scanne l’adresse.', 'compté juste : « Compris. », adresse suivante');
  await ouvrir(pg, S.compter[1]); await scanC(pg); await taper(pg, 31);
  egal(await actu(pg), 'Quantité différente. Recompter ou confirmer ?', 'le Terminal parle en copie : il propose de recompter');
  await choisir(pg, 'recompter'); await taper(pg, 31); await choisir(pg, 'confirmer');
  for (const i of [2, 3]) { await ouvrir(pg, S.compter[i]); await scanC(pg); await taper(pg, S.reel[i]); }
  egal(await jalonsE(pg), { ...toutE(RANGEMENT_E, 'ok'), ...toutE(COMPTAGE_E, 'attente') }, 'le comptage n’est jugé qu’à « Terminer le comptage »');
  await terminer(pg);
  egal([await remisE(pg), await texte(pg, '.pe-act .btn[disabled]')], [null, 'Comptage terminé'], '« Terminer » ne rend pas la copie : le bouton dit « Comptage terminé », pas « Copie rendue »');
  egal(await jalonsE(pg), toutE(IDS_E, 'ok'), 'tout jugé');
  const ec = await pg.evaluate(async () => (await import('/core/types/entrepot.js')).ecartsConfirmes(window.__p.db, window.__p.D()));
  egal(ec.map((x) => [x.rang, x.adresse, x.compte, x.systeme, x.sens]), [[2, S.compter[1], 31, 34, 'manque']], 'un écart confirmé : l’adresse n° 2, il manque');
  await rendreE(pg);
  const r = await remisE(pg);
  egal([r.score, r.max], [20, 20], 'la copie rendue par le bandeau : 20 sur 20');
  egal([await texte(pg, '.pe-act .btn[disabled]'), (await texte(pg, '[data-pe-consigne]')).endsWith('Copie rendue.')], ['Copie rendue', true], 'après la remise : « Copie rendue »');
  egal(erreurs, [], 'erreurs JS');
});

await v('Évaluation, Belleville (le système croit 36 : il y a un SURPLUS) : le même parcours sur un autre plan (2 allées, plaques 1 600 / 1 300), mêmes jalons, 20 / 20 ; l’écart confirmé dit « surplus »', async () => {
  const S = SE.belleville;
  await monterE(pg, { uid: await uidE(pg, 'belleville', 'surplus') });
  egal(await jalonsE(pg), toutE(IDS_E, 'attente'), 'mêmes jalons');
  await rangerE(pg, S); await scansE(pg, S);
  await valider(pg); await versComptage(pg);
  egal(await pg.$$eval(`${Z} [data-pal-acompter] li b`, (L) => L.map((x) => x.textContent)), S.compter, 'la liste de Belleville');
  await compterE(pg, S);
  await terminer(pg);
  egal([await remisE(pg), await jalonsE(pg)], [null, toutE(IDS_E, 'ok')], 'pas de copie rendue, tout juste');
  const ec = await pg.evaluate(async () => (await import('/core/types/entrepot.js')).ecartsConfirmes(window.__p.db, window.__p.D()));
  egal(ec.map((x) => [x.rang, x.adresse, x.compte, x.systeme, x.sens]), [[2, S.compter[1], 38, 36, 'surplus']], 'l’écart : surplus');
  await rendreE(pg);
  egal([(await remisE(pg)).score, (await remisE(pg)).max], [20, 20], '20 sur 20');
});

await v('Évaluation, l’inaction ne rapporte rien : copie rendue sans rien faire → 0 / 20 ; rangement validé vide, comptage « Terminé » vide → 0 / 20, tous les jalons faux', async () => {
  await monterE(pg, { site: 'onnaing' });
  await rendreE(pg);
  egal((await remisE(pg)).score, 0, 'rien fait : 0');
  await monterE(pg, { site: 'belleville' });
  await valider(pg); await versComptage(pg); await terminer(pg);
  const J = await jalonsE(pg);
  egal(J, toutE(IDS_E, 'ko'), 'tout faux (les gardes aussi : aucune palette traitée)');
  await rendreE(pg);
  egal((await remisE(pg)).score, 0, 'rangement et comptage vides : 0');
});

await v('Évaluation : rien du système dans le DOM, à aucune phase — ni verdict, ni « attendu », ni les règles, ni le nombre du système (34 à Onnaing, 36 à Belleville), même quand la séance déclare `verdict` et `regles` (Belleville) : au rangement, rangement validé, au comptage (avant et après « Terminer »), copie rendue ; et l’enseignant, lui, les voit', async () => {
  for (const [site, sens] of [['onnaing', 'manque'], ['belleville', 'surplus']]) {
    const S = SE[site], N = S.systeme[sens];
    await monterE(pg, { uid: await uidE(pg, site, sens), variante: site === 'belleville' ? 'tout' : undefined });
    const aChaque = async (quand) => { egal(await sansSysteme(pg), [], `${site}, ${quand} : aucun verdict ni attendu`); egal(await fuite(pg, [N]), [], `${site}, ${quand} : le nombre du système (${N}) n’apparaît pas`); };
    await aChaque('rangement, au départ');
    await rangerE(pg, S); await scansE(pg, S);
    await aChaque('rangement fait');
    await valider(pg);
    await aChaque('rangement validé');
    await versComptage(pg);
    await aChaque('comptage, au départ');
    await compterE(pg, S);
    await aChaque('comptage fait, avant « Terminer »');
    await terminer(pg);
    await aChaque('comptage terminé');
    await rendreE(pg);
    await aChaque('copie rendue');
  }
  // Dans les deux sens : l'enseignant voit les attendus (la même recherche trouve le nombre du système).
  await monterE(pg, { uid: await uidE(pg, 'onnaing', 'manque'), role: 'prof', variante: 'sansPhases' });
  await valider(pg);
  vrai((await fuite(pg, [34])).length > 0, 'l’enseignant voit le nombre du système au comptage');
  vrai((await sansSysteme(pg)).length > 0, 'et les attendus (Côté enseignant)');
});

await v('Évaluation : le Terminal parle en copie — « Ce n’est pas l’adresse de cette palette. » (rouge), « Confirmé. », « C’est noté. » au signalement (avec la fenêtre du système, sans nouvelle adresse), l’adresse libre de P5 à la demande ; au comptage « Quantité différente. Recompter ou confirmer ? »', async () => {
  const S = SE.onnaing;
  await monterE(pg, { uid: await uidE(pg, 'onnaing', 'manque') });
  await ranger(pg, 'P1', S.p1); await scanPal(pg, 'P1'); await ouvrir(pg, S.p2); await scanEmp(pg);
  egal(await lignesRouges(pg), ['Ce n’est pas l’adresse de cette palette.'], 'refus, en rouge');
  await ouvrir(pg, S.p1); await scanEmp(pg);
  egal(await derniere(pg), 'C1-T03-N1-E2 — Cahiers grand format — 30 cartons. Confirmé.', 'confirmé');
  await prendre(pg, 'P4'); await ouvrir(pg, S.p4); await bouton(pg, 'signaler'); await pg.click(`${Z} [data-pal-motif="charge"]`);
  egal(await texte(pg, '[data-pal-modal-texte]'), 'Signalement enregistré pour P4 (Lessive liquide 3 L) : « La charge serait dépassée ». C’est noté.', 'la fenêtre du système : jamais une nouvelle adresse');
  await pg.click(`${Z} [data-pal-modal-ok]`);
  egal(await derniere(pg), 'C’est noté.', 'le Terminal : « C’est noté. »');
  await prendre(pg, 'P5'); await ouvrir(pg, S.p5); await bouton(pg, 'libre');
  egal([await texte(pg, '[data-pal-modal-texte]'), await derniere(pg)], ['Adresse libre pour P5 (Bougies parfumées) : A1-T01-N1-E2.', 'Adresse libre pour P5 (Bougies parfumées) : A1-T01-N1-E2.'], 'l’adresse libre de P5, au Terminal et dans la fenêtre');
  await pg.click(`${Z} [data-pal-modal-ok]`);
  egal(await sansSysteme(pg), [], 'aucun verdict');
});

await v('Évaluation, P4 à signaler (sans nouvelle adresse) : signalée « charge » → « C’est noté. », elle reste en réception, `signale-P4` ok, pas de `scan-P4` ; confiée là → `signale-P4` et `charge` ko ; mauvais motif → ko', async () => {
  const S = SE.onnaing;
  await monterE(pg, { uid: await uidE(pg, 'onnaing', 'manque') });
  await signaler(pg, 'P4', S.p4, 'charge');
  const e = await etatE(pg);
  egal([e.signalees, e.nouvelles, e.posees, e.confiees], [{ P4: { motif: 'charge', adresse: S.p4 } }, {}, {}, {}], 'signalée, aucune nouvelle adresse, ni posée ni confiée');
  egal(await texte(pg, '[data-pal-etat="P4"]'), 'signalée', 'la carte : signalée, en réception');
  await valider(pg);
  const J = await jalonsE(pg);
  egal([J['signale-P4'], J['scan-P4']], ['ok', undefined], 'signale-P4 ok, aucun scan-P4');
  egal(await texte(pg, '[data-pal-etat="P4"]'), 'signalée', 'après « Valider » : toujours signalée, en réception');
  // Confiée à son adresse (qui dépasse la plaque) : signale-P4 ko et charge ko.
  await monterE(pg, { uid: await uidE(pg, 'onnaing', 'manque') });
  await ranger(pg, 'P4', S.p4, 'confier'); await valider(pg);
  const K = await jalonsE(pg);
  egal([K['signale-P4'], K.charge, K.pasPoseHaut], ['ko', 'ko', 'ko'], 'P4 confiée là : signale-P4 ko, charge ko (et la garde : les autres palettes ne sont pas traitées)');
  // Signalée avec un motif faux (« c'est occupé » : l'emplacement est libre).
  await monterE(pg, { uid: await uidE(pg, 'belleville', 'manque') });
  await signaler(pg, 'P4', SE.belleville.p4, 'occupe'); await valider(pg);
  egal((await jalonsE(pg))['signale-P4'], 'ko', 'mauvais motif : ko');
});

await v('Évaluation, les phases : avec un bouton, geste `phase:comptage` (un `apresGeste` dessus se charge), état `phase` « rangement » puis « comptage », exportée par `etatPalettier` ; sans bouton, le comptage suit « Valider » et il n’y a pas de geste ; sans `phases`, l’ancien comportement (le comptage suit « Valider », pas d’état `phase`)', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntrepot, etatPalettier } = await import('/core/types/entrepot.js');
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const { apresGeste } = await import('/core/declencheurs.js');
    const C = await import('/contenus/palettier-essai.js');
    const f = C.evaluation();
    const D = f('u0', { copie: true });
    const sans = Object.assign({}, D, { id: 'x1', phases: [{ id: 'rangement' }, { id: 'comptage' }] });
    const aucune = Object.assign({}, D); delete aucune.phases; aucune.id = 'x2';
    const essai = (nom) => {
      const U = C.universPalettier({ temps: 'evaluation', entrepot: f, poids: false });
      U.volet = { semer: () => ({ mails: [] }), declencheurs: [{ id: 'd', quand: apresGeste(nom), semer: () => ({ mails: [] }) }] };
      try { creerEntreprise(U); return ''; } catch (e) { return e.message; }
    };
    return { avec: creerEntrepot(D).signaux.filter((g) => g.includes('phase')), sans: creerEntrepot(sans).signaux.filter((g) => g.includes('phase')),
      aucune: creerEntrepot(aucune).signaux.filter((g) => g.includes('phase')), nb: [creerEntrepot(D).signaux.length, creerEntrepot(sans).signaux.length],
      ok: essai('entrepot:essai-evaluation:phase:comptage'), inconnu: essai('entrepot:essai-evaluation:phase:lendemain'),
      lisible: Object.keys(etatPalettier({}, D, { copie: true })) };
  });
  egal(r.avec, ['entrepot:essai-evaluation:phase:comptage'], 'avec bouton : un geste de phase');
  egal([r.sans, r.aucune], [[], []], 'sans bouton ou sans phases : aucun geste de phase');
  egal(r.nb, [r.nb[1] + 1, r.nb[1]], 'un seul geste de plus');
  egal([r.ok, r.inconnu.includes('phase:lendemain')], ['', true], 'un apresGeste sur phase:comptage se charge, sur phase:lendemain non');
  vrai(r.lisible.includes('phase'), `etatPalettier rend la phase : ${r.lisible}`);
  // Sans bouton : « Valider » ouvre aussitôt le comptage, aucun état `phase`.
  await monterE(pg, { site: 'onnaing', variante: 'sansBouton' });
  await valider(pg);
  egal([await pg.getAttribute(Z, 'data-pe-phase'), await present(pg, '[data-pal="phase"]'), 'phase' in (await etatE(pg)), await remisE(pg)], ['comptage', false, false, null], 'sans bouton : le comptage suit « Valider », pas d’état `phase` ; pas de copie rendue');
  await monterE(pg, { site: 'onnaing', variante: 'sansPhases' });
  await valider(pg);
  egal([await pg.getAttribute(Z, 'data-pe-phase'), await present(pg, '[data-pal="phase"]'), 'phase' in (await etatE(pg)), await remisE(pg)], ['comptage', false, false, null], 'sans phases : pareil, pas d’état `phase` ; `rendCopie: false` : pas de copie rendue');
});

await v('Évaluation, `rendCopie` : absent, « Terminer le comptage » rend la copie (et « Valider » non, un comptage suit) ; `rendCopie: false` sur le rangement seul : « Valider » ne rend pas, sans l’option il rend ; sur le lendemain : « Valider mon transfert » ne rend pas, sans l’option il rend (comme avant)', async () => {
  const S = SE.onnaing;
  // 1. Phases + comptage, SANS rendCopie : l'ancien comportement (le comptage rend la copie).
  await monterE(pg, { site: 'onnaing', variante: 'sansRendCopie' });
  await rangerE(pg, S); await valider(pg); await versComptage(pg);
  egal(await remisE(pg), null, 'sans rendCopie : « Valider » ne rend pas (un comptage suit)');
  await ouvrir(pg, S.compter[0]); await scanC(pg); await taper(pg, 26);
  await terminer(pg);
  await pg.waitForFunction(() => window.__p.remis !== null);
  egal(await texte(pg, '.pe-act .btn[disabled]'), 'Copie rendue', 'sans rendCopie : « Terminer » rend la copie, le bouton dit « Copie rendue »');
  // 2. Le rangement seul.
  await monterE(pg, { site: 'onnaing', variante: 'palettes' });
  await ranger(pg, 'P1', S.p1); await valider(pg);
  egal([await remisE(pg), await texte(pg, '.pe-act .btn[disabled]')], [null, 'Rangement validé'], 'rangement seul, rendCopie false : pas de copie rendue, « Rangement validé »');
  await rendreE(pg);
  egal((await remisE(pg)).max, 20, 'la copie se rend par le bandeau');
  await monterE(pg, { site: 'onnaing', variante: 'palettesSans' });
  await ranger(pg, 'P1', S.p1); await valider(pg);
  await pg.waitForFunction(() => window.__p.remis !== null);
  egal(await texte(pg, '.pe-act .btn[disabled]'), 'Copie rendue', 'rangement seul, sans rendCopie : « Valider » rend la copie');
  // 3. Le lendemain (soir déjà validé, on cherche P9).
  for (const [variante, attendu, bouton2] of [['lendemain', false, 'Transfert validé'], ['lendemainSans', true, 'Copie rendue']]) {
    await monterE(pg, { variante });
    await bouton(pg, 'phase'); await bouton(pg, 'phaseOui');
    await bouton(pg, 'lvalider'); await bouton(pg, 'lvaliderOui');
    if (attendu) await pg.waitForFunction(() => window.__p.remis !== null);
    egal([(await remisE(pg)) !== null, await texte(pg, '.pe-act .btn[disabled]')], [attendu, bouton2], `lendemain, ${variante} : « Valider mon transfert »`);
  }
});

await v('Évaluation : la page d’essai (cas « Évaluation », Onnaing et Belleville) tient en 1366 × 768 et 1280 × 720 sans défiler — plan, travée et vue de près (étiquettes, boutons), phase « comptage » — et « Rendre ma copie » (bandeau) affiche la note des jalons', async () => {
  const pe = await ctx.newPage();
  const err = [];
  pe.on('pageerror', (e) => err.push(e.message));
  for (const site of ['onnaing', 'belleville']) {
    const S = SE[site];
    for (const [w, h] of [[1366, 768], [1280, 720]]) {
      await pe.setViewportSize({ width: w, height: h });
      await pe.goto(BASE + 'outils/essai-palettier.html');
      await pe.waitForSelector('.pal');
      await pe.selectOption('#reglages select[name="cas"]', 'evaluation');
      await pe.selectOption('#reglages select[name="site"]', site);
      await pe.waitForSelector('.pal [data-pe-pal="P5"]');
      egal(await pe.$$eval('.pal [data-pe-trav]', (L) => L.length), S.travees, `${site} : le bon plan`);
      await pe.addStyleTag({ content: '#reglages, #mention, #essaiNote { display: none !important }' });
      const deborde = () => pe.evaluate(() => Math.max(0, document.documentElement.scrollHeight - innerHeight));
      const vu = (s) => pe.evaluate((s) => { const r = document.querySelector(s).getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.right <= innerWidth && r.height > 0; }, s);
      const plan = await pe.evaluate(() => { const r = document.querySelector('.pal .pe-plan svg').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height), r.right <= innerWidth && r.bottom <= innerHeight]; });
      egal([await deborde(), plan[2]], [0, true], `${site} ${w} × ${h} : le plan tient (${plan[0]} × ${plan[1]} px)`);
      await pe.click('.pal [data-pe-pal="P1"]');
      await pe.click(`.pal [data-pe-trav="${S.p1.slice(0, 6)}"]`);
      await pe.click(`.pal [data-pe-emp="${S.p1}"]`);
      egal([await vu('.pal [data-pal="poser"]'), await vu('.pal [data-pal="signaler"]'), await vu('.pal [data-pal-scan-emp]'), await deborde()], [true, true, true, 0], `${site} ${w} × ${h} : travée et vue de près (étiquette, boutons)`);
      // Le comptage : phase suivante, la liste, la palette dessinée.
      await pe.click('.pal [data-pal="retour"]');
      await pe.click('.pal [data-pal="valider"]'); await pe.click('.pal [data-pal="validerOui"]');
      await pe.click('.pal [data-pal="phase"]'); await pe.click('.pal [data-pal="phaseOui"]');
      await pe.waitForSelector('.pal[data-pe-phase="comptage"]');
      await pe.click(`.pal [data-pe-trav="${S.compter[0].slice(0, 6)}"]`);
      await pe.click(`.pal [data-pe-emp="${S.compter[0]}"]`);
      await pe.click('.pal [data-pal-compte-emp]');
      await pe.fill('.pal [data-vt-champ]', '99'); await pe.press('.pal [data-vt-champ]', 'Enter');
      egal([await vu('.pal [data-pal-acompter] li:last-child'), await vu('.pal [data-vt-choix="confirmer"]'), await vu('.pal [data-pal-pile] svg'), await deborde()], [true, true, true, 0], `${site} ${w} × ${h} : le comptage (liste, boutons du Terminal, palette dessinée)`);
    }
  }
  // « Rendre ma copie » : la note des jalons sous les réglages.
  await pe.setViewportSize({ width: 1366, height: 768 });
  await pe.goto(BASE + 'outils/essai-palettier.html');
  await pe.waitForSelector('.pal');
  await pe.selectOption('#reglages select[name="cas"]', 'evaluation');
  await pe.waitForSelector('.pal [data-pe-pal="P5"]');
  await pe.click('[data-copie-rendre]'); await pe.click('[data-copie-rendre]');
  await pe.waitForSelector('#essaiNote:not([hidden])');
  vrai((await pe.textContent('#essaiNote')).includes('COPIE RENDUE : note 0 / 20'), `la note affichée : ${await pe.textContent('#essaiNote')}`);
  egal(err, [], 'erreurs JS');
  await pe.close();
});

/* =========================================================== la fenêtre « Message du système » et les questions au fil (22/10/2026) */
// Un geste qui OUVRE la fenêtre (signaler, adresse libre, transfert) ne part qu'à sa FERMETURE (« Compris » ou Échap) : une question au fil
// accrochée dessus (`apresGeste`) s'ouvrirait sinon SOUS la fenêtre, et son gel empêcherait de cliquer « Compris ». Retour du constructeur d'ENT-8.13.
const panneauQ = (p) => p.$('#palTest [data-q-panneau]').then((e) => !!e);
const repondreQ = async (p, id) => {
  await p.click(`#palTest [data-q-choix="a"][data-q="${id}"]`); await p.click(`#palTest [data-q-repondre="${id}"]`);
  await p.click('#palTest [data-q-reprendre]');
};
const GQ = 'entrepot:essai-palettier:';
async function fenetreAvantQuestion(p, { ferme, geste, ouvrirFenetre }) {
  await ouvrirFenetre();
  egal([(await fenetre(p)).length, await panneauQ(p), (await gestes(p)).includes(geste)], [1, false, false], 'la fenêtre est seule visible : la question n’est pas là, le geste n’est pas encore publié');
  await ferme();
  await p.waitForSelector('#palTest [data-q-panneau]');
  egal([(await fenetre(p)).length, (await gestes(p)).includes(geste)], [0, true], 'fenêtre fermée : le geste est publié, la question est là');
  await repondreQ(p, 'q0');
  egal(await panneauQ(p), false, 'la question répondue, on reprend le travail');
}

await v('Fenêtre du système : `signaler` — une question au fil sur ce geste ne s’ouvre qu’après « Compris » (cliqué à la souris) ; Échap fait de même ; l’état (signalement) est écrit tout de suite', async () => {
  const g = `${GQ}signaler:P5`;
  const ouvrirF = async () => { await prendre(pg, 'P5'); await ouvrir(pg, 'A1-T02-N3-E2'); await bouton(pg, 'signaler'); await pg.click(`${Z} [data-pal-motif="charge"]`); };
  await monter(pg, { terminal: 'deux', fil: [g], filPart: 8 });   // 12 jalons + 8 points de question = 20
  await fenetreAvantQuestion(pg, { geste: g, ouvrirFenetre: ouvrirF, ferme: async () => {
    egal((await etat(pg)).signalees.P5.motif, 'charge', 'le signalement est déjà écrit pendant que la fenêtre est ouverte');
    await pg.click(`${Z} [data-pal-modal-ok]`); } });
  await monter(pg, { terminal: 'deux', fil: [g], filPart: 8 });
  await fenetreAvantQuestion(pg, { geste: g, ouvrirFenetre: ouvrirF, ferme: () => pg.keyboard.press('Escape') });
  egal(erreurs, [], 'erreurs JS');
});

await v('Fenêtre du système : `adresseLibre:<P>` — la question au fil s’ouvre après « Compris » ; un geste sans fenêtre (prendre une palette) part tout de suite', async () => {
  const g = `${GQ}adresseLibre:P8`;
  await monter(pg, { terminal: 'deux', libre: true, fil: [g], filPart: 6 });   // 14 jalons
  await fenetreAvantQuestion(pg, { geste: g, ferme: () => pg.click(`${Z} [data-pal-modal-ok]`),
    ouvrirFenetre: async () => { await prendre(pg, 'P8'); await ouvrir(pg, 'A1-T03-N1-E1'); await bouton(pg, 'libre'); } });
  egal((await etat(pg)).libres.P8, 'A1-T01-N1-E2', 'l’adresse libre est écrite');
  // Un geste SANS fenêtre part tout de suite : prendre une palette publie `prendre:P1` à l'instant, sans attendre rien.
  await monter(pg, { terminal: 'deux', fil: [`${GQ}prendre:P1`], filPart: 8 });
  await prendre(pg, 'P1');
  await pg.waitForSelector('#palTest [data-q-panneau]');
  egal((await gestes(pg)).includes(`${GQ}prendre:P1`), true, 'sans fenêtre, le geste part tout de suite');
});

await v('Fenêtre du système : `transfert` (le lendemain) — la question au fil s’ouvre après « Compris », le transfert est écrit tout de suite', async () => {
  const g = `${GQ.replace('palettier', 'lendemain')}transfert`;
  await monterL(pg, { chemin: 'scanne', fil: [g], filPart: 10 });   // 10 jalons
  await passer(pg);
  await fenetreAvantQuestion(pg, { geste: g, ferme: async () => {
    egal((await etatL(pg)).lendemain.transfert.vers, LA.p9, 'le transfert est écrit pendant que la fenêtre est ouverte');
    await pg.click(`${Z} [data-pal-modal-ok]`); },
  ouvrirFenetre: async () => { await ouvrir(pg, LA.p9Posee); await scanPalL(pg, 'P9'); await ouvrir(pg, LA.p9); await scanEmpL(pg); } });
});

await v('Palettier : aucune erreur JavaScript', async () => { egal(erreurs, []); });
await ctx.close();
}
