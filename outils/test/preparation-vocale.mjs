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

egal(erreurs, [], 'aucune erreur dans la page');
await ctx.close();
}
