// Suite de tests de Prepalog — bloc « preparation-vocale » : la préparation de commandes guidée à la voix, en cartons (chantier E-8, brief
// `docs/briefs/MOTEUR-preparation-vocale-cartons.md` §5). `node outils/test.mjs preparation-vocale` ne lance que ce bloc ; il n'a besoin d'aucun
// autre. La préparation de Smoby (ENT-5.6) reste couverte par les blocs `entrepot` et `smoby`, sans qu'un cas y bouge.
//
// LOT 0 (25/10/2026) : l'entrepôt de préparation d'Ensuès et la commande tirée par élève (`contenus/action-prepa-donnees.js`), la fonction de la
// graine acceptée par `etapesEntrepot` (liste commune, chaque élève jugé sur SA déclaration). Valeurs écrites À LA MAIN, relevées une fois le
// 25/10/2026 et recopiées ici (profil `{ id: 'essai-prepa', lignes: 5 }`) :
//   « temoin-1 » : Marseille Saint-Loup, n° 4542, QUAI 6, départ 7 h 00 ; LES 4 en A1-T03-N1-E1 (picking 13, min 9) · CRO 6 en B2-T04-N1-E1 ·
//                  BOU 4 en B2-T03-N1-E2 · SER 5 en B2-T02-N1-E3 · CAH 4 en B2-T01-N1-E3 ; code de contrôle de A1-T03-N1-E1 : 10.
//   « temoin-2 » : Marseille Grand Littoral, n° 4630, QUAI 3, 8 h 15 ; LES 3 en A2-T01-N1-E2 · NET 5 en A2-T05-N1-E3 · CRO 6 en B2-T06-N1-E1 ·
//                  PEL 3 en B2-T06-N1-E3 · CAH 4 en B2-T01-N1-E3.
//   Profil `{ id: 'essai-prepa-ex', lignes: 7, abimes: 1, vides: 1 }`, « temoin-1 » : rupture en B2-T03-N1-E1 (CAH, picking 0, min 8) ; carton
//   abîmé en B1-T02-N1-E1 (SER), remplacement en B2-T02-N1-E3.
//
// LOTS 1-2 (25/10/2026) : le terminal vocal qui guide (`core/types/entrepot-vocal.js`) et le montage « Où poses-tu ? ». Élève témoin de la
// page d'essai (cas « vocal », profil `{ id: 'essai-vocal', lignes: 5 }`, graine « temoin-1 »), relevé une fois et recopié À LA MAIN :
//   Marseille Grand Littoral, n° 4705, QUAI 4, départ 8 h 45 ; L1 NET 5 en A2-T03-N1-E1 (code 69, picking 17) · L2 LES 5 en B1-T06-N1-E2
//   (code 68) · L3 BOU 4 en B2-T06-N1-E2 (39) · L4 PEL 6 en B2-T06-N1-E3 (73) · L5 BOI 6 en B1-T05-N1-E3 (29). NET et LES sont lourds.
//
// LOT 3 (25/10/2026) : le carton abîmé et l'emplacement vide. Cas « vocal-ex » de la page d'essai (profil `{ id: 'essai-vocal-ex', lignes: 7,
// abimes: 1, vides: 1 }`, graine « temoin-1 »), relevé une fois et recopié À LA MAIN : Marseille Le Merlan, n° 4190 ; L1 NET 4 A1-T05-N1-E1 (99) ·
// L2 LES 3 A2-T05-N1-E2 (23 ; 1 carton abîmé devant, picking 13 ; remplacement B1-T06-N1-E2, code 83) · L3 CRO 4 B2-T05-N1-E3 (35) · L4 BOU 3
// B1-T04-N1-E3 (90) · L5 BOI 4 B1-T03-N1-E2 (86) · L6 SER 5 B2-T02-N1-E2 (33 ; VIDE, picking 0) · L7 CAH 5 B2-T01-N1-E3 (84).

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ctx = await nav.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
const erreurs = [];
const pg = await ctx.newPage();
pg.setDefaultTimeout(8000);
pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

/* =========================================================== lot 0 : le tirage */
await v('Préparation tirée (lot 0) : 300 graines pour chacun des quatre profils des séances, aucun secours, chaque déclaration se charge, et le moteur confirme l’équité (ordre favorable ou piège, poids, hauteur, rupture)', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-prepa-donnees.js');
    const E = await import('/core/types/entrepot.js');
    const profils = [
      { id: 'p815', lignes: 5 },
      { id: 'p816', lignes: 7, abimes: 1, vides: 1 },
      { id: 'p817', lignes: 6, lourds: 2, fragiles: 2, ordre: 'piege' },
      { id: 'p819', lignes: 7, fragiles: 1, abimes: 1, vides: 1, ordre: 'piege' },
    ];
    const out = {};
    for (const o of profils) {
      const fn = D.preparation(o);
      const c = { secours: 0, fautes: 0, moteur: 0, ruptures: 0, magasins: new Set() };
      for (let i = 0; i < 300; i++) {
        const { jeu, secours } = fn.jeuDe(`g${i}`);
        if (secours) c.secours++;
        if (D.verifierCommande(fn.options, jeu).length) c.fautes++;
        c.magasins.add(jeu.magasin);
        const Q = fn(`g${i}`, { niveau: 'standard' });
        const L = Q.commande.lignes;
        const juge = (ordre) => Object.fromEntries(E.calculPreparation(Q, { faits: ordre.map((l) => ({ a: l.a, k: l.produit, q: l.q })) }).regles.map((x) => [x.id, x.ok]));
        const bon = juge(D.bonOrdre(L)), circuit = juge(L);
        const okBon = bon.lourds && bon.fragiles && bon.poids && bon.hauteur;
        const okCircuit = o.ordre === 'piege' ? !(circuit.lourds && circuit.fragiles) : circuit.lourds && circuit.fragiles;
        if (!okBon || !okCircuit) c.moteur++;
        if (E.jalonsEntrepot({}, Q).L.some((l) => l.id === 'reappro')) c.ruptures++;
      }
      out[o.id] = { secours: c.secours, fautes: c.fautes, moteur: c.moteur, ruptures: c.ruptures, magasins: c.magasins.size };
    }
    return out;
  });
  egal(r, {
    p815: { secours: 0, fautes: 0, moteur: 0, ruptures: 0, magasins: 8 },
    p816: { secours: 0, fautes: 0, moteur: 0, ruptures: 300, magasins: 8 },
    p817: { secours: 0, fautes: 0, moteur: 0, ruptures: 0, magasins: 8 },
    p819: { secours: 0, fautes: 0, moteur: 0, ruptures: 300, magasins: 8 },
  }, 'équité sur 300 graines');
});

await v('Préparation tirée (lot 0) : le stock de départ (même pour toute la classe) — chaque produit au picking 6 ou 7 fois et au moins deux fois en réserve, aucune plaque dépassée ; les codes de contrôle tous différents dans une allée', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-prepa-donnees.js');
    const pick = {}, res = {}, niveaux = {};
    for (const [a, s] of Object.entries(D.STOCK)) {
      const d = D.decoupe(a);
      if (d.n === 1) pick[s.produit] = (pick[s.produit] || 0) + 1; else res[s.produit] = (res[s.produit] || 0) + 1;
      if (d.n > 1) { const k = `${d.c}-${d.t}-${d.n}`; niveaux[k] = (niveaux[k] || 0) + s.kg; }
    }
    const depasse = Object.entries(niveaux).filter(([k, kg]) => kg > D.PLAQUES[+k.split('-')[2]]).length;
    const { jeu } = D.preparation({ id: 'essai-prepa', lignes: 5 }).jeuDe('temoin-1');
    const codesA = D.PICKING_TOUS.filter((a) => a[0] === 'A').map((a) => jeu.codes[a]);
    return { picking: D.PICKING_TOUS.every((a) => D.STOCK[a]), nbPick: [...new Set(Object.values(pick))].sort(), resMin: Math.min(...D.CODES.map((k) => res[k] || 0)),
      depasse, codesA: [codesA.length, new Set(codesA).size], produits: D.CODES.length, fragiles: D.FRAGILES, lourds: D.LOURDS };
  });
  egal(r.picking, true, 'tout le picking occupé');
  egal(r.nbPick, [6, 7], 'chaque produit 6 ou 7 fois au picking');
  vrai(r.resMin >= 2, `au moins deux palettes de réserve par produit (${r.resMin})`);
  egal(r.depasse, 0, 'aucune plaque dépassée');
  egal(r.codesA, [36, 36], '36 codes différents dans l’allée A');
  egal([r.produits, r.fragiles, r.lourds], [11, ['VER', 'VAS', 'ASS'], ['LES', 'NET', 'CRO']], 'produits et classes');
});

await v('Préparation tirée (lot 0) : les deux élèves témoins (valeurs écrites à la main) ; la rupture, le carton abîmé et sa ligne de remplacement du profil à exceptions', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-prepa-donnees.js');
    const fn = D.preparation({ id: 'essai-prepa', lignes: 5 });
    const resume = (g) => { const Q = fn(g, { niveau: 'standard' }); const C = Q.commande;
      return [C.client, C.num, C.quai, C.heure, C.lignes.map((l) => `${l.produit} ${l.q} ${l.a}`).join(' · ')]; };
    const Q1 = fn('temoin-1', { niveau: 'standard' });
    const fx = D.preparation({ id: 'essai-prepa-ex', lignes: 7, abimes: 1, vides: 1 });
    const X = fx('temoin-1', { niveau: 'standard' });
    return { t1: resume('temoin-1'), t2: resume('temoin-2'), pick1: Q1.picking['A1-T03-N1-E1'], code1: Q1.codes['A1-T03-N1-E1'],
      quais: Q1.plan.zones.quais, rupture: X.picking['B2-T03-N1-E1'], abimes: X.abimes, rempl: X.remplacements,
      memeObjet: fn('temoin-1', { niveau: 'standard' }).commande === Q1.commande };
  });
  egal(r.t1, ['Marseille Saint-Loup', '4542', 'QUAI 6', '7 h 00', 'LES 4 A1-T03-N1-E1 · CRO 6 B2-T04-N1-E1 · BOU 4 B2-T03-N1-E2 · SER 5 B2-T02-N1-E3 · CAH 4 B2-T01-N1-E3'], 'témoin 1');
  egal(r.t2, ['Marseille Grand Littoral', '4630', 'QUAI 3', '8 h 15', 'LES 3 A2-T01-N1-E2 · NET 5 A2-T05-N1-E3 · CRO 6 B2-T06-N1-E1 · PEL 3 B2-T06-N1-E3 · CAH 4 B2-T01-N1-E3'], 'témoin 2');
  egal([r.pick1, r.code1, r.quais], [{ q: 13, min: 9 }, '10', ['QUAI 6']], 'picking, code de contrôle, quai dessiné');
  egal([r.rupture, r.abimes, r.rempl], [{ q: 0, min: 8 }, { 'B1-T02-N1-E1': 1 }, { 'B1-T02-N1-E1': 'B2-T02-N1-E3' }], 'exceptions');
  egal(r.memeObjet, false, 'une déclaration neuve à chaque appel (le moteur garde la sienne par graine)');
});

await v('Préparation tirée (lot 0) : dans l’environnement d’entreprise, deux élèves voient deux commandes ; les étapes sont communes et chaque `verifier` juge la commande de L’ÉLÈVE ; une fonction dont les jalons changent d’une graine à l’autre ne se charge pas', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const E = await import('/core/types/entrepot.js');
    const D = await import('/contenus/action-prepa-donnees.js');
    const C = await import('/contenus/palettier-essai.js');
    const fn = D.preparation({ id: 'essai-prepa', lignes: 5 });
    const etapes = E.etapesEntrepot(fn);
    const U = Object.assign(C.universPalettier({ poids: false }), { entrepot: fn, etapes });
    const moteur = creerEntreprise(U);
    const bases = {}, bons = {};
    for (const uid of ['temoin-1', 'temoin-2']) {
      document.querySelector('#prepTest')?.remove();
      const hote = document.createElement('div'); hote.id = 'prepTest'; document.body.appendChild(hote);
      const db = bases[uid] = {};
      moteur.rendre(hote, { meta: { id: 'essai-prepa', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps: 'guidage' },
        profil: { prenom: 'Lea', role: 'eleve', uid }, jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {},
        codeStock: 'ABC', lireScore: async () => null, rendreCopie: async () => ({}) });
      document.querySelector('#prepTest .ent-nav[data-vue="entrepot"]').click();
      bons[uid] = document.querySelector('#prepTest .pe-bon b').textContent;
    }
    // Chaque élève a prélevé EXACTEMENT la commande du témoin 1 : juste pour lui, faux pour le témoin 2.
    const faits = fn('temoin-1', { niveau: 'standard' }).commande.lignes.map((l) => ({ a: l.a, k: l.produit, q: l.q }));
    for (const uid of Object.keys(bases)) bases[uid].entrepots = { 'essai-prepa': { faits } };
    const J = (uid) => etapes.find((e) => e.id === 'lignesJustes').verifier(bases[uid]).status;
    let erreur = '';
    try { E.etapesEntrepot((g, o) => Object.assign(fn(g, o), g === 'c' ? { jalons: [{ type: 'lignesJustes' }] } : {})); } catch (x) { erreur = x.message; }
    return { bons, graines: Object.fromEntries(Object.entries(bases).map(([u, b]) => [u, b.tirage && b.tirage.graine])), ids: etapes.map((e) => e.id),
      j1: J('temoin-1'), j2: J('temoin-2'), erreur };
  });
  egal(r.bons, { 'temoin-1': '4542', 'temoin-2': '4630' }, 'le numéro de commande à l’écran');
  egal(r.ids, ['lignesJustes', 'lourds', 'fragiles', 'poids', 'hauteur', 'film', 'etiquettes', 'parcours'], 'étapes communes');
  egal([r.j1, r.j2], ['ok', 'attente'], 'les mêmes prélèvements : justes pour le témoin 1, faux pour le témoin 2');
  vrai(r.erreur.includes('graine « c »'), `jalons qui changent selon la graine : ${r.erreur}`);
});

/* ============================================= lots 1-2 : le terminal qui guide, le montage */
const TEMOIN_V = [['L1', 'A2-T03-N1-E1', '69', 5, 'NET'], ['L2', 'B1-T06-N1-E2', '68', 5, 'LES'], ['L3', 'B2-T06-N1-E2', '39', 4, 'BOU'],
  ['L4', 'B2-T06-N1-E3', '73', 6, 'PEL'], ['L5', 'B1-T05-N1-E3', '29', 6, 'BOI']];

await v('Préparation vocale (lots 1-2) : la déclaration avec `terminal` se compile — un jalon par ligne puis les six critères de la palette ; sans `terminal`, les jalons de Smoby ne bougent pas ; ce que le terminal attend (élève témoin, valeurs à la main)', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-prepa-donnees.js');
    const E = await import('/core/types/entrepot.js');
    const fv = D.preparation({ id: 'essai-vocal', lignes: 5, terminal: {} });
    const Q = fv('temoin-1', { niveau: 'standard' });
    let err = '';
    try { E.jalonsEntrepot({}, Object.assign({}, Q, { codes: Object.assign({}, Q.codes, { [Q.commande.lignes[2].a]: 'x' }) })); } catch (x) { err = x.message; }
    return { ids: E.etapesEntrepot(fv).map((x) => x.id), sans: E.etapesEntrepot(D.preparation({ id: 'essai-prepa', lignes: 5 })).map((x) => x.id),
      att: E.bonnesReponses(Q).map((x) => [x.ligne, x.emplacement, x.code, x.prends, x.produit]), C: [Q.commande.client, Q.commande.num, Q.commande.quai, Q.commande.heure], err };
  });
  egal(r.ids, ['ligne-1', 'ligne-2', 'ligne-3', 'ligne-4', 'ligne-5', 'lourds', 'fragiles', 'poids', 'hauteur', 'film', 'etiquettes'], 'jalons du terminal');
  egal(r.sans, ['lignesJustes', 'lourds', 'fragiles', 'poids', 'hauteur', 'film', 'etiquettes', 'parcours'], 'sans terminal : Smoby');
  egal(r.C, ['Marseille Grand Littoral', '4705', 'QUAI 4', '8 h 45'], 'commande du témoin');
  egal(r.att, TEMOIN_V, 'ce que le terminal attend');
  vrai(r.err.includes('code de contrôle'), `un code de contrôle invalide refuse la déclaration : ${r.err}`);
});

await v('Préparation vocale (lots 1-2) : le jugement — rien avant la fin du terminal, palette vide ou cartons à côté = aucun critère gagné ; ordre de POSE juste = tout juste ; un lourd posé en dernier, un fragile sous un normal, trop de film : chaque faute nomme son critère, et lui seul', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-prepa-donnees.js');
    const E = await import('/core/types/entrepot.js');
    const fv = D.preparation({ id: 'essai-vocal', lignes: 5, terminal: {} });
    const Q = fv('temoin-1', { niveau: 'standard' });
    const L = Q.commande.lignes;
    const g = (l, i) => ({ a: l.a, k: l.produit, q: l.q, ligne: `L${i + 1}` });
    const groupes = L.map(g);
    const T = { i: L.length, phase: 'code', reponses: Object.fromEntries(L.map((l, i) => [`L${i + 1}`, l.q])), codesFaux: {}, journal: [], debut: 1, fin: 2 };
    const fini = { terminal: T, film: ['4'], etiq: [{ avant: true, arriere: true, dessus: true }] };
    const bon = [...groupes.filter((x) => ['NET', 'LES'].includes(x.k)), ...groupes.filter((x) => !['NET', 'LES'].includes(x.k))];
    const juge = (e) => { const J = E.jalonsEntrepot({ entrepots: { 'essai-vocal': e } }, Q).L; return J.filter((j) => !j.ok).map((j) => j.id).join(' '); };
    // Un fragile (vase) sous un normal : la même commande, avec une ligne VAS ajoutée à la main sur le plan de pose.
    const vas = { a: 'X', k: 'VAS', q: 2, ligne: 'L9' };
    return {
      neuf: juge({}), encours: juge({ terminal: Object.assign({}, T, { fin: null, i: 2 }), palettes: [bon.slice(0, 2)] }),
      vide: juge(Object.assign({}, fini, { palettes: [[]] })), aCote: juge(Object.assign({}, fini, { palettes: [bon.slice(0, 4)], cote: [bon[4]] })),
      juste: juge(Object.assign({}, fini, { palettes: [bon] })), lourd: juge(Object.assign({}, fini, { palettes: [[...bon.slice(1), bon[0]]] })),
      film: juge(Object.assign({}, fini, { palettes: [bon], film: ['6'] })), etiq: juge(Object.assign({}, fini, { palettes: [bon], etiq: [{ avant: true, dessus: true }] })),
      fragile: juge(Object.assign({}, fini, { palettes: [[...bon.slice(0, 2), vas, ...bon.slice(2)]] })),
    };
  });
  const tout = 'ligne-1 ligne-2 ligne-3 ligne-4 ligne-5 lourds fragiles poids hauteur film etiquettes';
  egal(r.neuf, tout, 'base neuve : rien de gagné');
  egal(r.encours, tout, 'terminal en cours : rien de jugé');
  egal(r.vide, 'lourds fragiles poids hauteur film etiquettes', 'palette vide : les lignes oui, aucun critère');
  egal(r.aCote, 'lourds fragiles poids hauteur film etiquettes', 'un groupe encore à côté : aucun critère');
  egal(r.juste, '', 'ordre de pose juste');
  egal(r.lourd, 'lourds', 'un lourd posé en dernier');
  egal(r.film, 'film', 'six tours de film');
  egal(r.etiq, 'etiquettes', 'étiquettes sur deux côtés non opposés');
  egal(r.fragile, 'fragiles', 'un fragile sous des normaux');
});

await v('Préparation vocale (lots 1-2), page d’essai à 1366 × 768 : le code n’est lu QUE dans la vue de près ; le terminal guide ligne à ligne, le picking baisse ; « À côté » puis posé après la fin, « ↶ Reposer le dernier » ; le bilan juge l’ordre de POSE ; les gestes publiés', async () => {
  const pe = await ctx.newPage();
  pe.on('pageerror', (e) => erreurs.push('PAGEERROR (essai): ' + e.message));
  pe.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE (essai): ' + m.text()); });
  await pe.goto(BASE + 'outils/essai-entrepot.html');
  await pe.selectOption('select[name=cas]', 'vocal');
  await pe.waitForSelector('.pvc [data-terminal]');
  const etat = () => pe.evaluate(() => JSON.parse(JSON.stringify(window.__essai.db.entrepots['essai-vocal'])));
  const ecran = await pe.evaluate(() => ({ cmd: document.querySelector('.pvc-cmd').textContent.replace(/\s+/g, ' ').trim(),
    codes: document.querySelectorAll('[data-pvc-code]').length, cerne: document.querySelector('[data-pvc-montre]')?.dataset.pvcMontre,
    phrase: document.querySelector('[data-terminal]').textContent.replace(/\s+/g, ' ') }));
  egal(ecran.cmd.startsWith('Commande 4705 Marseille Grand Littoral QUAI 4 · départ 8 h 45'), true, `bandeau : ${ecran.cmd}`);
  egal(ecran.codes, 0, 'aucun code de contrôle sur le plan');
  egal(ecran.cerne, 'A2-T03', 'guidage : la travée de la ligne en cours cernée');
  vrai(ecran.phrase.includes('Allée A2, travée 03, niveau 1, emplacement 1. Code de contrôle ?') && !/\b69\b/.test(ecran.phrase), 'le terminal dit l’adresse, jamais le code');
  // un code faux, compté, jamais noté
  await pe.fill('[data-terminal] input', '11'); await pe.keyboard.press('Enter');
  const faces = [];
  for (const [id, a, code, q] of TEMOIN_V) {
    const m = /^([AB]\d)-T(\d+)/.exec(a);
    await pe.click(`[data-pe-trav="${m[1]}-T${m[2]}"]`);
    faces.push(await pe.locator('[data-pvc-code]').count());
    await pe.click(`[data-pe-emp="${a}"]`);
    egal(await pe.textContent('[data-pvc-code]'), code, `${id} : le code sur l’étiquette de la lisse`);
    await pe.fill('[data-terminal] input', code); await pe.keyboard.press('Enter');
    await pe.fill('[data-terminal] input', String(q)); await pe.keyboard.press('Enter');
    if (id === 'L1') {
      egal((await etat()).pick[a], 17 - 5, 'L1 prise : le picking baisse de 5');
      egal(await pe.textContent('[data-pvc-question]'), 'Où poses-tu les 5 cartons Nettoyant ?', 'la question de pose');
    }
    // L1 (un lourd) à côté : il sera posé après la fin, donc en haut — la faute « lourds » attendue au premier bilan.
    await pe.click(id === 'L1' ? '[data-pvc-poser="cote"]' : '[data-pvc-poser="0"]');
    while (await pe.$('[data-pvc="retour"]')) await pe.click('[data-pvc="retour"]');
  }
  egal(faces, [0, 0, 0, 0, 0], 'pas de code dans la travée de face');
  let e = await etat();
  egal([e.terminal.fin > 0, e.cote.map((x) => x.k), e.palettes[0].map((x) => x.k), e.terminal.codesFaux], [true, ['NET'], ['LES', 'BOU', 'PEL', 'BOI'], { L1: 1 }], 'fin du terminal');
  egal(await pe.locator('[data-pvc="verifier"]').isDisabled(), true, 'Vérifier attend que rien ne soit à côté');
  await pe.click('[data-pvc-objet="0"]'); await pe.click('[data-pvc-pal="0"]');
  await pe.selectOption('[data-pvc-film="0"]', '4');
  for (const k of ['avant', 'arriere', 'dessus']) await pe.check(`[data-pvc-etiq="0:${k}"]`);
  await pe.click('[data-pvc="verifier"]');
  const bilan = () => pe.$$eval('[data-pvc-jalon]', (L) => L.filter((x) => x.dataset.ok !== 'true').map((x) => x.dataset.pvcJalon));
  egal(await bilan(), ['lourds'], 'premier bilan : le lourd posé en dernier');
  // on corrige : tout reposer (cinq fois « Reposer le dernier »), puis poser les lourds d'abord
  for (let i = 0; i < 5; i++) await pe.click('[data-pvc-reposer="0"]');
  e = await etat();
  egal([e.palettes[0].length, e.cote.map((x) => x.k), e.verifie], [0, ['NET', 'BOI', 'PEL', 'BOU', 'LES'], false], 'tout est reposé à côté');
  for (const k of ['NET', 'LES', 'BOU', 'PEL', 'BOI']) {
    const i = (await etat()).cote.findIndex((x) => x.k === k);
    await pe.click(`[data-pvc-objet="${i}"]`); await pe.click('[data-pvc-vers="0"]');
  }
  await pe.click('[data-pvc="verifier"]');
  egal(await bilan(), [], 'second bilan : tout juste');
  const G = await pe.evaluate(() => Object.keys((window.__essai.db.gestes || {})['essai-entrepot'] || {}).filter((k) => k.startsWith('entrepot:essai-vocal:')).map((k) => k.slice(21)).sort());
  egal(['code:L1', 'ligne:L5', 'ouvrir:A2-T03-N1-E1', 'poser:cote', 'poser:palette', 'pose:lourd', 'pose:normal', 'fin', 'film', 'etiquettes', 'verifier'].filter((x) => !G.includes(x)), [], `gestes publiés (${G.join(', ')})`);
  await pe.close();
});

await v('Préparation vocale (lots 1-2) : l’écran tient sans défiler à 1366 × 768 et 1280 × 720 — le terminal et sa saisie visibles, le plan entier, aucune barre horizontale ; la colonne du terminal défile seule une fois la palette à finir', async () => {
  const out = {};
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
    const pe = await ctx.newPage();
    await pe.setViewportSize({ width: w, height: h });
    await pe.goto(BASE + 'outils/essai-entrepot.html');
    await pe.selectOption('select[name=cas]', 'vocal');
    await pe.waitForSelector('.pvc [data-terminal]');
    // la page d'essai a ses réglages au-dessus : on mesure depuis le haut de l'écran d'entreprise
    out[`${w}`] = await pe.evaluate(() => {
      const ent = document.querySelector('.pvc').closest('.ent, #hote') || document.body;
      window.scrollTo(0, document.querySelector('#hote').getBoundingClientRect().top + window.scrollY);
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      return { saisie: r('[data-terminal] input').bottom <= innerHeight, plan: r('.pe-plan svg').bottom <= innerHeight + 2,
        large: document.documentElement.scrollWidth <= innerWidth, cote: r('.pvc-cote').bottom <= innerHeight + 2 };
    });
    await pe.close();
  }
  egal(out, { 1366: { saisie: true, plan: true, large: true, cote: true }, 1280: { saisie: true, plan: true, large: true, cote: true } }, 'tient à l’écran');
});

/* ============================================= lot 3 : le carton abîmé, l'emplacement vide */
const TEMOIN_EX = [['L1', 'A1-T05-N1-E1', '99', 4], ['L2', 'A2-T05-N1-E2', '23', 3], ['L3', 'B2-T05-N1-E3', '35', 4], ['L4', 'B1-T04-N1-E3', '90', 3],
  ['L5', 'B1-T03-N1-E2', '86', 4], ['L6', 'B2-T02-N1-E2', '33', 5], ['L7', 'B2-T01-N1-E3', '84', 5]];
async function ouvrirEx(pe) {
  await pe.goto(BASE + 'outils/essai-entrepot.html');
  await pe.selectOption('select[name=cas]', 'vocal-ex');
  await pe.waitForSelector('.pvc [data-terminal]');
}
const etatEx = (pe) => pe.evaluate(() => JSON.parse(JSON.stringify(window.__essai.db.entrepots['essai-vocal-ex'])));
async function allerA(pe, a) {
  while (await pe.$('[data-pvc="retour"]')) await pe.click('[data-pvc="retour"]');
  const m = /^([AB]\d)-T(\d+)/.exec(a);
  await pe.click(`[data-pe-trav="${m[1]}-T${m[2]}"]`);
  await pe.click(`[data-pe-emp="${a}"]`);
}
const taper = async (pe, x) => { await pe.fill('[data-terminal] input', String(x)); await pe.keyboard.press('Enter'); };
const phrase = (pe) => pe.evaluate(() => document.querySelector('[data-terminal]').textContent.replace(/\s+/g, ' '));

await v('Préparation vocale (lot 3) : les jalons du profil à exceptions (mêmes ids pour toutes les graines) ; une déclaration incohérente (abîmé sans remplacement) refusée', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-prepa-donnees.js');
    const E = await import('/core/types/entrepot.js');
    const fx = D.preparation({ id: 'essai-vocal-ex', lignes: 7, abimes: 1, vides: 1, terminal: {} });
    const Q = fx('temoin-1', { niveau: 'standard' });
    let err = '';
    try { E.jalonsEntrepot({}, Object.assign({}, Q, { remplacements: {} })); } catch (x) { err = x.message; }
    return { ids: E.etapesEntrepot(fx).map((x) => x.id), C: [Q.commande.client, Q.commande.num], err };
  });
  egal(r.ids, ['ligne-1', 'ligne-2', 'ligne-3', 'ligne-4', 'ligne-5', 'abime-dit', 'abime-remplacement', 'vide-dit', 'vide-reprise',
    'lourds', 'fragiles', 'poids', 'hauteur', 'film', 'etiquettes', 'rienAbime'], 'jalons');
  egal(r.C, ['Marseille Le Merlan', '4190'], 'commande du témoin');
  vrai(r.err.includes('remplacement'), `abîmé sans remplacement : ${r.err}`);
});

await v('Préparation vocale (lot 3), page d’essai : le carton abîmé se VOIT de près (jamais écrit) ; « Abîmé : 1 » le laisse, le terminal ajoute la ligne de remplacement ; l’emplacement vide refuse la quantité, « Emplacement vide » fait descendre la réserve par Kevin et la ligne est redite ; tout juste au bilan', async () => {
  const pe = await ctx.newPage();
  pe.on('pageerror', (e) => erreurs.push('PAGEERROR (essai lot 3): ' + e.message));
  await ouvrirEx(pe);
  for (const [id, a, code, q] of TEMOIN_EX) {
    await allerA(pe, a);
    if (id === 'L2') {
      const pres = await pe.evaluate(() => ({ dessin: document.querySelectorAll('.pvc-devant [data-pvc-abime]').length,
        texte: /abîm/i.test(document.querySelector('.pvc-pres').textContent) }));
      egal(pres, { dessin: 1, texte: false }, 'un carton abîmé dessiné devant, rien d’écrit');
      await taper(pe, code);
      await pe.click('[data-vt-mot="abime"]'); await taper(pe, 1);
      vrai((await phrase(pe)).includes('Compris : 1 abîmé.'), 'le terminal a compris');
      await taper(pe, 2);
      await pe.click('[data-pvc-poser="0"]');
      vrai((await phrase(pe)).includes('Allée B1, travée 06, niveau 1, emplacement 2. Code de contrôle ?'), 'la ligne de remplacement');
      await allerA(pe, 'B1-T06-N1-E2');
      await taper(pe, '83'); await taper(pe, 1);
      await pe.click('[data-pvc-poser="0"]');
      continue;
    }
    if (id === 'L6') {
      egal(await pe.locator('[data-pvc-vide]').count(), 1, 'de près : emplacement vide');
      await taper(pe, code); await taper(pe, q);
      vrai((await phrase(pe)).includes('Tu dois prendre 5. Si tu ne peux pas, dis'), 'la quantité juste refusée');
      await pe.click('[data-vt-mot="vide"]');
      const e = await etatEx(pe);
      egal([e.reserves.map((x) => x.a), e.vides.length, e.pick[a] > 0], [[a], 1, true], 'Kevin a descendu la réserve');
      vrai((await phrase(pe)).includes('Kevin a descendu la réserve. Allée B2, travée 02, niveau 1, emplacement 2. Code de contrôle ?'), 'la ligne redite');
      await allerA(pe, a);
      egal(await pe.locator('[data-pvc-vide]').count(), 0, 'de près : les cartons sont là');
    }
    await taper(pe, code); await taper(pe, q);
    await pe.click('[data-pvc-poser="0"]');
  }
  while (await pe.$('[data-pvc="retour"]')) await pe.click('[data-pvc="retour"]');
  await pe.selectOption('[data-pvc-film="0"]', '4');
  for (const k of ['avant', 'arriere', 'dessus']) await pe.check(`[data-pvc-etiq="0:${k}"]`);
  await pe.click('[data-pvc="verifier"]');
  egal(await pe.$$eval('[data-pvc-jalon]', (L) => L.filter((x) => x.dataset.ok !== 'true').map((x) => x.dataset.pvcJalon)), [], 'tout juste');
  const G = await pe.evaluate(() => Object.keys((window.__essai.db.gestes || {})['essai-entrepot'] || {}).map((k) => k.replace('entrepot:essai-vocal-ex:', '')));
  egal(['mot:abime', 'mot:vide', 'abime', 'vide', 'reserve'].filter((x) => !G.includes(x)), [], 'gestes du lot 3');
  await pe.close();
});

await v('Préparation vocale (lot 3) : le carton abîmé pris sans rien dire part sur la palette, DESSINÉ abîmé — « abîmé signalé », « remplacement » et « aucun carton abîmé » faux, le reste juste', async () => {
  const pe = await ctx.newPage();
  pe.on('pageerror', (e) => erreurs.push('PAGEERROR (essai lot 3 b): ' + e.message));
  await ouvrirEx(pe);
  for (const [id, a, code, q] of TEMOIN_EX) {
    await allerA(pe, a);
    if (id === 'L6') { await taper(pe, code); await pe.click('[data-vt-mot="vide"]'); await allerA(pe, a); }
    await taper(pe, code); await taper(pe, q);
    await pe.click('[data-pvc-poser="0"]');
  }
  while (await pe.$('[data-pvc="retour"]')) await pe.click('[data-pvc="retour"]');
  const e = await etatEx(pe);
  egal(e.palettes[0].filter((g) => g.abimes).map((g) => [g.a, g.abimes]), [['A2-T05-N1-E2', 1]], 'le groupe porte son carton abîmé');
  egal(await pe.locator('.pvc-pal [data-pvc-abime]').count(), 1, 'dessiné sur la palette');
  await pe.selectOption('[data-pvc-film="0"]', '4');
  for (const k of ['avant', 'arriere', 'dessus']) await pe.check(`[data-pvc-etiq="0:${k}"]`);
  await pe.click('[data-pvc="verifier"]');
  egal(await pe.$$eval('[data-pvc-jalon]', (L) => L.filter((x) => x.dataset.ok !== 'true').map((x) => x.dataset.pvcJalon)),
    ['abime-dit', 'abime-remplacement', 'lourds', 'fragiles', 'poids', 'hauteur', 'film', 'etiquettes', 'rienAbime'], 'les fautes de l’abîmé (et la palette non jugée : une ligne fausse)');
  await pe.close();
});

await v('Préparation vocale (lot 3) : équité sur 300 graines des profils 8.16 et 8.19 — la préparation parfaite (bons mots, remplacement et réserve, pose dans le bon ordre) gagne tous les jalons, palette sous 1,80 m et 600 kg', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-prepa-donnees.js');
    const E = await import('/core/types/entrepot.js');
    const out = {};
    for (const o of [{ id: 'v816', lignes: 7, abimes: 1, vides: 1 }, { id: 'v819', lignes: 7, fragiles: 1, abimes: 1, vides: 1, ordre: 'piege' }]) {
      const fn = D.preparation(Object.assign({ terminal: {} }, o));
      const fautes = {};
      for (let i = 0; i < 300; i++) {
        const Q = fn(`g${i}`, { niveau: 'standard' }), L = Q.commande.lignes;
        const id = (l) => `L${L.indexOf(l) + 1}`;
        const R = {}, EX = {}, groupes = [];
        D.bonOrdre(L).forEach((l) => {
          const ab = (Q.abimes || {})[l.a], vide = Q.picking[l.a] && Q.picking[l.a].q < l.q;
          if (ab) { EX[id(l)] = { mot: 'abime', n: ab }; R[id(l)] = l.q - ab; R[`${id(l)}-r`] = ab;
            groupes.push({ a: l.a, k: l.produit, q: l.q - ab, ligne: id(l) }, { a: Q.remplacements[l.a], k: l.produit, q: ab, ligne: `${id(l)}-r` }); }
          else if (vide) { EX[id(l)] = { mot: 'vide', n: l.q }; R[id(l)] = 0; R[`${id(l)}-r`] = l.q; groupes.push({ a: l.a, k: l.produit, q: l.q, ligne: `${id(l)}-r` }); }
          else { R[id(l)] = l.q; groupes.push({ a: l.a, k: l.produit, q: l.q, ligne: id(l) }); }
        });
        const e = { terminal: { i: 99, phase: 'code', reponses: R, exceptions: EX, codesFaux: {}, journal: [], debut: 1, fin: 2 },
          palettes: [groupes], cote: [], film: ['4'], etiq: [{ avant: true, arriere: true, dessus: true }] };
        E.jalonsEntrepot({ entrepots: { [o.id]: e } }, Q).L.filter((j) => !j.ok).forEach((j) => { fautes[j.id] = (fautes[j.id] || 0) + 1; });
      }
      out[o.id] = fautes;
    }
    return out;
  });
  egal(r, { v816: {}, v819: {} }, 'aucune faute sur la préparation parfaite');
});

egal(erreurs, [], 'aucune erreur dans la page');
await ctx.close();
}
