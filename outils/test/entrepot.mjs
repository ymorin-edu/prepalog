// Suite de tests de Prepalog — bloc « entrepot » : la vue « Plan d'entrepôt » (core/types/entrepot.js),
// brief `docs/briefs/MOTEUR-vue-plan-entrepot.md` §11, lots 1 et 2 (le cœur, le mode rangement) et lot 4
// (le mode préparation) ; puis le mode visite (`docs/briefs/MOTEUR-modes-visite.md` §10, en fin de fichier).
//
// `node outils/test.mjs entrepot` ne lance que ce bloc. Il n'a besoin d'aucun autre : il monte
// l'environnement d'entreprise à la main, dans un contexte de navigateur à lui, sur le cas « rangement »
// de la maquette v2 (`contenus/entrepot-essai.js`, univers d'essai `outils/essai-entrepot.js`).
//
// Les bonnes réponses et les critères attendus sont écrits À LA MAIN ici (jamais relus dans le contenu).
// Ils viennent de la maquette (Cowork, 04/10), recontrôlés contre le moteur le 04/10 :
//   P1 Maison (lourd, rotation A) : A1-T01-N1-E3 seule · P2 Cuisine (fragile, B) : B2-T02-N1-E2, B2-T02-N1-E3 ·
//   P3 Établi (litige) : L1, L2 · P4 Porteur (C) : B1-T03-N3-E1, B1-T04-N1-E2, B1-T04-N3-E2.

export default async function bloc({ v, nav, BASE, egal, vrai }) {


const ctxE = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const erreursE = [];
const pg = await ctxE.newPage();
pg.setDefaultTimeout(6000);
pg.on('pageerror', (e) => erreursE.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursE.push('CONSOLE: ' + m.text()); });
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

// Monte l'environnement sur le cas d'essai. `garder` : la base est rangée dans le stockage du navigateur
// à chaque sauvegarde (recharger = la retrouver). `decl(P)` : modifie la déclaration (sabotages).
const monter = (p, o = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-entrepot.js');
  const C = await import('/contenus/entrepot-essai.js');
  document.querySelector('#peTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'peTest'; document.body.appendChild(hote);
  const temps = o.temps || 'guidage';
  let P = o.cas === 'preparation' ? C.PREPARATION : C.RANGEMENT;
  if (o.commande) P = Object.assign({}, P, { commande: Object.assign({}, P.commande, o.commande) });
  if (o.jalons) P = Object.assign({}, P, { jalons: o.jalons });
  if (o.sansCritere) P = Object.assign({}, P, { criteres: P.criteres.filter((c) => c.type !== o.sansCritere) });
  if (o.id) P = Object.assign({}, P, { id: o.id });
  const U = E.univers({ temps, entrepot: P });
  const CLE = 'essai-entrepot-base';
  const db = o.garder ? JSON.parse(localStorage.getItem(CLE) || '{}') : (o.db || {});
  const moteur = creerEntreprise(U);
  window.__e = { db, moteur, remis: null };
  moteur.rendre(hote, {
    meta: { id: 'essai-entrepot', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps, copie: temps === 'evaluation' },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => { if (o.garder) localStorage.setItem(CLE, JSON.stringify(db)); } },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
    rendreCopie: async (res) => { window.__e.remis = res; return { rendu: Date.now() }; },
  });
  document.querySelector('#peTest .ent-nav[data-vue="entrepot"]').click();
}, o);

const Z = '#peTest .pe';
const etat = (p) => p.evaluate(() => JSON.parse(JSON.stringify(((window.__e.db.entrepots) || {})['essai-rangement'] || null)));
const present = async (p, sel) => !!(await p.$(`${Z} ${sel}`));
const texte = async (p, sel) => ((await p.textContent(`${Z} ${sel}`)) || '').replace(/\s+/g, ' ').trim();
const jalons = (p) => p.evaluate(async () => {
  const E = await import('/core/types/entrepot.js');
  const C = await import('/contenus/entrepot-essai.js');
  return E.jalonsEntrepot(window.__e.db, C.RANGEMENT).L.map((l) => l.ok);
});

// Poser une palette : la prendre (carte du bandeau), ouvrir la travée sur le plan, cliquer l'emplacement.
// La zone litiges se clique sur le plan, sans ouvrir de travée.
async function poser(p, id, a) {
  await p.click(`${Z} .pe-bandeau [data-pe-pal="${id}"]`);
  if (/^L\d/.test(a)) { await p.click(`${Z} [data-pe-lit="${a}"]`); return; }
  if (await present(p, '[data-pe="retour"]')) await p.click(`${Z} [data-pe="retour"]`);
  await p.click(`${Z} [data-pe-trav="${a.slice(0, 6)}"]`);
  await p.click(`${Z} [data-pe-emp="${a}"]`);
  await p.click(`${Z} [data-pe="retour"]`);
}
const JUSTE = [['P1', 'A1-T01-N1-E3'], ['P2', 'B2-T02-N1-E2'], ['P3', 'L1'], ['P4', 'B1-T03-N3-E1']];
const poserTout = async (p, L) => { for (const [id, a] of L) await poser(p, id, a); };
// Les fautes d'une palette posée seule à une adresse, lues dans le moteur (noms de critère).
const fautes = (p, id, a, sans) => p.evaluate(async ({ id, a, sans }) => {
  const E = await import('/core/types/entrepot.js');
  const C = await import('/contenus/entrepot-essai.js');
  const P = sans ? Object.assign({}, C.RANGEMENT, { criteres: C.RANGEMENT.criteres.filter((c) => c.type !== sans) }) : C.RANGEMENT;
  return E.fautesEntrepot(P, id, a).map((f) => ({ nom: f.nom, txt: f.txt }));
}, { id, a, sans });

/* =========================================================== montage */
await v('Entrepôt : la vue s’ouvre par son entrée de menu, sans erreur ; 4 palettes, le plan, 16 travées', async () => {
  await monter(pg);
  egal(await pg.textContent('#peTest .ent-nav[data-vue="entrepot"]').then((t) => t.trim()), 'Plan de l’entrepôt', 'entrée de menu');
  egal((await pg.$$(`${Z} .pe-bandeau [data-pe-pal]`)).length, 4, 'cartes de palettes');
  egal((await pg.$$(`${Z} [data-pe-trav]`)).length, 16, 'travées sur le plan');
  egal((await pg.$$(`${Z} [data-pe-mini][data-pe-etat="stock"]`)).length, 99, 'emplacements occupés au départ');
  egal((await pg.$$(`${Z} [data-pe-mini][data-pe-etat="hs"]`)).length, 4, 'emplacements hors service');
  egal(await etat(pg), { place: {}, verifie: false, verifs: 0, premierGeste: null, aideCharge: true }, 'état neuf');
  egal(erreursE, [], 'erreurs JS');
});

await v('Entrepôt : sans `entrepot` déclaré, aucune entrée de menu en plus', async () => {
  await pg.evaluate(async () => {
    const { creerEntreprise } = await import('/core/types/entreprise.js');
    const E = await import('/outils/essai-entrepot.js');
    const U = E.univers({}); delete U.entrepot;
    document.querySelector('#peTest')?.remove();
    const hote = document.createElement('div'); hote.id = 'peTest'; document.body.appendChild(hote);
    creerEntreprise(U).rendre(hote, { meta: { id: 'x', portee: 'eleve' }, profil: { prenom: 'A', role: 'eleve' },
      jeu: { etat: () => ({}), sauver: () => {} }, enregistrer: () => {}, quitter: () => {} });
  });
  vrai(!(await pg.$('#peTest .ent-nav[data-vue="entrepot"]')), 'entrée Plan d’entrepôt présente');
  vrai(!!(await pg.$('#peTest .ent-nav[data-vue="stock"]')), 'le reste du menu manque');
});

await v('Entrepôt : une déclaration fautive ne se charge pas (mode pas encore écrit, adresse inconnue, critère inconnu)', async () => {
  const r = await pg.evaluate(async () => {
    const { creerEntrepot } = await import('/core/types/entrepot.js');
    const C = await import('/contenus/entrepot-essai.js');
    const essai = (P) => { try { creerEntrepot(P); return ''; } catch (e) { return e.message; } };
    return [
      essai(Object.assign({}, C.RANGEMENT, { id: 'x1', mode: 'comptage' })),
      essai(Object.assign({}, C.RANGEMENT, { id: 'x2', stock: { 'A1-T09-N1-E1': { produit: 'MAI', kg: 400 } } })),
      essai(Object.assign({}, C.RANGEMENT, { id: 'x3', criteres: [{ type: 'lourdEnBas' }] })),
      essai(Object.assign({}, C.RANGEMENT, { id: 'x4', stock: { 'A1-T02-N2-E2': { produit: 'MAI', kg: 400 } } })),
    ];
  });
  vrai(r[0].includes('pas encore écrit'), `mode : ${r[0]}`);
  vrai(r[1].includes('adresse inconnue'), `adresse : ${r[1]}`);
  vrai(r[2].includes('critère de type inconnu'), `critère : ${r[2]}`);
  vrai(r[3].includes('hors service'), `stock hors service : ${r[3]}`);
});

/* =========================================================== bonnes réponses */
await v('Entrepôt : bonnes réponses calculées par le moteur = celles de la maquette (écrites à la main)', async () => {
  const B = await pg.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/entrepot-essai.js');
    return E.bonnesReponses(C.RANGEMENT);
  });
  egal(B, {
    P1: ['A1-T01-N1-E3'],
    P2: ['B2-T02-N1-E2', 'B2-T02-N1-E3'],
    P3: ['L1', 'L2'],
    P4: ['B1-T03-N3-E1', 'B1-T04-N1-E2', 'B1-T04-N3-E2'],
  }, 'bonnes réponses');
});

await v('Entrepôt : chaque piège nomme son critère, et lui seul', async () => {
  const PIEGES = [
    ['P1', 'A1-T01-N2-E3', 'poids'], ['P1', 'A1-T02-N1-E2', 'rotation'], ['P1', 'B2-T01-N1-E3', 'parcours'],
    ['P1', 'A1-T03-N1-E1', 'rotation'],
    ['P2', 'B2-T02-N2-E2', 'poids'], ['P2', 'B2-T02-N3-E2', 'produit fragile'], ['P2', 'B2-T03-N1-E3', 'rotation'],
    ['P2', 'B2-T01-N1-E3', 'rotation'], ['P2', 'A2-T02-N1-E2', 'type de produit'],
    ['P4', 'B1-T01-N2-E3', 'rotation'], ['P4', 'B1-T04-N2-E3', 'état'],
    ['P3', 'A1-T01-N1-E3', 'litige'], ['P1', 'L2', 'litige'],
  ];
  for (const [id, a, nom] of PIEGES) egal((await fautes(pg, id, a)).map((f) => f.nom), [nom], `${id} en ${a}`);
});

await v('Entrepôt : « que, pas de combien » — aucun message de faute ne donne un poids ni un écart', async () => {
  const msgs = [];
  for (const [id, a] of [['P1', 'A1-T01-N2-E3'], ['P2', 'B2-T02-N2-E2'], ['P1', 'B2-T01-N1-E3'], ['P2', 'A2-T02-N1-E2'],
    ['P4', 'B1-T04-N2-E3'], ['P3', 'A1-T01-N1-E3'], ['P2', 'B2-T02-N3-E2'], ['P4', 'B1-T01-N2-E3']]) {
    (await fautes(pg, id, a)).forEach((f) => msgs.push(f.txt));
  }
  vrai(msgs.length >= 8, `messages lus : ${msgs.length}`);
  msgs.forEach((m) => vrai(!/\d\s*kg|\bde \d/.test(m), `message chiffré : « ${m} »`));
  vrai(msgs.includes('la charge totale du niveau dépasse son maximum'), 'message du poids');
});

await v('Entrepôt : décision du 04/10 — posée au-dessus d’une plus légère, charge respectée → aucune faute', async () => {
  // B1-T04-N3-E2 est juste au-dessus de B1-T04-N2-E2 (Trotteur, 150 kg) ; P4 pèse 180 kg.
  egal(await pg.evaluate(async () => {
    const C = await import('/contenus/entrepot-essai.js');
    return [C.STOCK['B1-T04-N2-E2'].kg, C.PALETTES.find((p) => p.id === 'P4').kg];
  }), [150, 180], 'les poids du cas');
  egal(await fautes(pg, 'P4', 'B1-T04-N3-E2'), [], 'fautes');
});

await v('Entrepôt : sabotage — sans le critère « poids », le piège du poids passe (le test le voit)', async () => {
  egal((await fautes(pg, 'P1', 'A1-T01-N2-E3', 'charge')).map((f) => f.nom), [], 'sans critère charge');
  egal((await fautes(pg, 'P2', 'B2-T02-N3-E2', 'niveauInterdit')).map((f) => f.nom), [], 'sans critère fragile');
  egal((await fautes(pg, 'P1', 'B2-T01-N1-E3', 'parcours')).map((f) => f.nom), [], 'sans critère parcours');
});

/* =========================================================== parcours */
await v('Entrepôt guidage : parcours juste à la souris (1366 × 768) → 4 / 4 jalons, « bien rangée » partout', async () => {
  await monter(pg);
  // Piloter l'écran : de vrais clics de souris au centre de chaque élément, après l'avoir fait défiler.
  const souris = async (sel) => {
    const el = await pg.$(`${Z} ${sel}`);
    await el.scrollIntoViewIfNeeded();
    const b = await el.boundingBox();
    vrai(b && b.width > 20 && b.height > 20, `${sel} trop petit pour la souris : ${JSON.stringify(b)}`);
    await pg.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  };
  for (const [id, a] of JUSTE) {
    await souris(`.pe-bandeau [data-pe-pal="${id}"]`);
    if (a.startsWith('L')) { await souris(`[data-pe-lit="${a}"]`); continue; }
    await souris(`[data-pe-trav="${a.slice(0, 6)}"]`);
    await souris(`[data-pe-emp="${a}"]`);
    await souris('[data-pe="retour"]');
  }
  egal((await etat(pg)).place, { P1: 'A1-T01-N1-E3', P2: 'B2-T02-N1-E2', P3: 'L1', P4: 'B1-T03-N3-E1' }, 'adresses');
  egal(await jalons(pg), [true, true, true, true], 'jalons');
  vrai(!(await present(pg, '[data-pe-verdict]')), 'verdict affiché avant « Vérifier »');
  await pg.click(`${Z} [data-pe="verifier"]`);
  egal(await pg.$$eval(`${Z} [data-pe-verdict]`, (L) => L.map((x) => x.dataset.peVerdict)), ['ok', 'ok', 'ok', 'ok'], 'verdicts');
  egal((await etat(pg)).verifs, 1, 'clics sur Vérifier');
  // Les étapes du suivi suivent les jalons.
  egal(await pg.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/entrepot-essai.js');
    return E.etapesEntrepot(C.RANGEMENT).map((e) => e.verifier(window.__e.db).status);
  }), ['ok', 'ok', 'ok', 'ok'], 'étapes du suivi');
  egal(erreursE, [], 'erreurs JS');
});

await v('Entrepôt : chaque jalon tombe quand sa palette est mal rangée (sabotages par palette)', async () => {
  const MAUVAIS = { P1: 'A1-T02-N1-E2', P2: 'B2-T02-N3-E2', P3: 'L2', P4: 'B1-T04-N2-E3' };
  for (const [i, [id]] of JUSTE.entries()) {
    await monter(pg);
    await poserTout(pg, JUSTE.map(([x, a]) => [x, x === id ? (id === 'P3' ? 'A1-T01-N1-E3' : MAUVAIS[id]) : a]));
    const J = await jalons(pg);
    egal(J, JUSTE.map((_, k) => k !== i), `jalons avec ${id} mal rangée`);
  }
});

await v('Entrepôt : l’occupé est refusé tout de suite, la palette reste en main ; reprendre une palette posée', async () => {
  await monter(pg);
  await pg.click(`${Z} .pe-bandeau [data-pe-pal="P2"]`);
  await pg.click(`${Z} [data-pe-trav="A2-T02"]`);
  await pg.click(`${Z} [data-pe-emp="A2-T02-N1-E2"]`);
  egal(await texte(pg, '[data-pe-msg]'), 'Emplacement déjà occupé. La palette reste en main.', 'message');
  egal((await etat(pg)).place, {}, 'rien posé');
  vrai(await pg.$eval(`${Z} .pe-bandeau [data-pe-pal="P2"]`, (b) => b.classList.contains('pe-en-main')), 'P2 n’est plus en main');
  // Poser, puis reprendre : la carte la remet en main, l'emplacement se libère.
  await pg.click(`${Z} [data-pe="retour"]`);
  await pg.click(`${Z} [data-pe-trav="B2-T02"]`);
  await pg.click(`${Z} [data-pe-emp="B2-T02-N1-E3"]`);
  egal((await etat(pg)).place, { P2: 'B2-T02-N1-E3' }, 'posée');
  await pg.click(`${Z} .pe-bandeau [data-pe-pal="P2"]`);
  egal((await etat(pg)).place, {}, 'reprise');
  vrai(await pg.$eval(`${Z} .pe-bandeau [data-pe-pal="P2"]`, (b) => b.classList.contains('pe-en-main')), 'reprise sans être en main');
  // La zone litiges occupée est refusée aussi.
  await pg.click(`${Z} [data-pe="retour"]`);
  await poser(pg, 'P3', 'L1');
  await pg.click(`${Z} .pe-bandeau [data-pe-pal="P1"]`);
  await pg.click(`${Z} [data-pe-lit="L1"]`);
  egal((await etat(pg)).place, { P3: 'L1' }, 'litige occupé refusé');
});

await v('Entrepôt : une palette posée sur un niveau dont la charge totale dépasserait → jalon faux ; P3 en rack → faux ; hors service → faux', async () => {
  await monter(pg);
  await poserTout(pg, [['P1', 'A1-T01-N2-E3'], ['P2', 'B2-T02-N1-E2'], ['P3', 'A1-T03-N1-E1'], ['P4', 'B1-T04-N2-E3']]);
  egal(await jalons(pg), [false, true, false, false], 'jalons');
  await pg.click(`${Z} [data-pe="verifier"]`);
  // En guidage aussi, le verdict ne donne que le NOM du critère (brief MOTEUR-entrepot-verdict-guidage).
  egal(await texte(pg, '[data-pe-verd="P1"]'), '✗ critère : poids', 'verdict P1');
  egal(await texte(pg, '[data-pe-verd="P3"]'), '✗ critère : litige', 'verdict P3');
  egal(await texte(pg, '[data-pe-verd="P4"]'), '✗ critère : état', 'verdict P4');
});

await v('Entrepôt guidage : après « Vérifier », aucun verdict ne dit où aller (ni côté, ni travée, ni allée)', async () => {
  await monter(pg);
  const MAL = [['P1', 'A1-T02-N1-E2'], ['P2', 'A1-T03-N2-E2'], ['P3', 'A1-T03-N1-E1'], ['P4', 'B1-T04-N2-E3']];
  await poserTout(pg, MAL);
  egal((await etat(pg)).place, Object.fromEntries(MAL), 'toutes posées');
  await pg.click(`${Z} [data-pe="verifier"]`);
  const V = await pg.$$eval(`${Z} [data-pe-verd]`, (L) => L.map((x) => x.textContent.trim()));
  egal(V.length, 4, 'verdicts');
  for (const t of V) {
    vrai(/^✗ critère : /.test(t), `verdict sans faute signalée : ${t}`);
    vrai(!/[A-Z][12]|T0\d|allée|N[1-9]/.test(t), `verdict qui dit où aller : ${t}`);
  }
});

await v('Entrepôt : inaction → 0 / 4, « Vérifier » grisé ; la note en évaluation vaut 0', async () => {
  await monter(pg);
  egal(await jalons(pg), [false, false, false, false], 'jalons');
  vrai(await pg.$eval(`${Z} [data-pe="verifier"]`, (b) => b.disabled), 'Vérifier actif sans rien posé');
  const n = await pg.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/entrepot-essai.js');
    return E.noteEntrepot({}, C.RANGEMENT).score;
  });
  egal(n, 0, 'note');
});

/* =========================================================== temps pédagogique */
await v('Entrepôt guidage : consigne de la palette en main, bandes de rotation, parcours, règles, aide de charge', async () => {
  await monter(pg);
  egal(await texte(pg, '[data-pe-cons]'), 'Prenez une palette : sa consigne s’affiche ici.', 'consigne à vide');
  await pg.click(`${Z} .pe-bandeau [data-pe-pal="P2"]`);
  egal(await pg.$$eval(`${Z} [data-pe-cons] span`, (L) => L.map((x) => x.textContent)), [
    'gamme Cuisines : côté B2', 'produit fragile : fin de parcours (allée B)', 'rotation moyenne : T02',
    'fragile : pas au niveau N3', 'vérifie la charge du niveau'], 'consigne de P2');
  egal((await pg.$$(`${Z} [data-pe-bande]`)).length, 2, 'bandes de rotation (A et B ; C sans fond)');
  vrai(await present(pg, '[data-pe-parcours]'), 'parcours dessiné');
  vrai(await present(pg, '[data-pe-regles]'), 'Les règles');
  await pg.click(`${Z} [data-pe-trav="A1-T01"]`);
  // Le capteur de charge (05/10/2026) ajoute la palette en main : N2 840 + 270, N3 1 110 + 270 > 1 200.
  egal(await texte(pg, '[data-pe-deja="2"]'), '1 110', 'capteur N2 (840 posés + P2 en main)');
  egal(await texte(pg, '[data-pe-bas="2"]'), 'dont 270 en main', 'bas du capteur N2');
  egal(await texte(pg, '[data-pe-bas="3"]'), 'SURCHARGE', 'capteur N3 dépassé en guidage');
  // Le calcul fait pour l'élève (05/10/2026) : stock de A1-T01 N2 430 + 410, N3 410 + 410 + 290 ; P2 270 kg.
  egal(await texte(pg, '[data-pe-calcul]'),
    'Si vous posez P2 (270 kg) dans cette travée : N3 : 1 110 + 270 = 1 380 kg · N2 : 840 + 270 = 1 110 kg · N1 (sol) : pas de limite', 'calcul de charge');
  // Au sol, ni plaque ni « déjà posé » : pas de limite.
  vrai(await present(pg, '[data-pe-plaque="2"]') && !(await present(pg, '[data-pe-plaque="1"]')), 'plaque de charge au sol');
  vrai(!(await present(pg, '[data-pe-capteur="1"]')) && await present(pg, '[data-pe-capteur="2"]'), 'capteur au sol');
  vrai(!(await pg.$('#calculetteFlottante')), 'calculette en guidage');
  await pg.click(`${Z} [data-pe="aideCharge"]`);
  vrai(!(await present(pg, '[data-pe-capteur]')), 'capteur toujours là une fois décoché');
  vrai(!(await present(pg, '[data-pe-calcul]')), 'calcul toujours là une fois l’aide décochée');
  egal((await etat(pg)).aideCharge, false, 'aide décochée gardée');
});

await v('Entrepôt : au sol, aucune limite de poids (05/10/2026) — même avec une plaque déclarée trop basse', async () => {
  const r = await pg.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/entrepot-essai.js');
    const avec = (charge) => {
      const cotes = Object.assign({}, C.RANGEMENT.plan.cotes, { A1: Object.assign({}, C.RANGEMENT.plan.cotes.A1, { charge }) });
      return Object.assign({}, C.RANGEMENT, { plan: Object.assign({}, C.RANGEMENT.plan, { cotes }) });
    };
    const noms = (P, a) => E.fautesEntrepot(P, 'P1', a).map((f) => f.nom);
    return { sol: noms(avec({ 1: 100, 2: 1200, 3: 1200 }), 'A1-T01-N1-E3'),
      n2: noms(avec({ 1: 3000, 2: 100, 3: 1200 }), 'A1-T01-N2-E3'),
      sansN1: noms(avec({ 2: 1200, 3: 1200 }), 'A1-T01-N1-E3') };
  });
  egal(r.sol, [], 'P1 (420 kg) au sol, plaque N1 à 100 kg');
  vrai(r.n2.includes('poids'), 'le poids reste jugé en N2 : ' + JSON.stringify(r.n2));
  egal(r.sansN1, [], 'déclaration sans charge au sol');
});

await v('Entrepôt : capteur de charge jamais en rouge en évaluation, en rouge en entraînement ; calculette hors guidage, sur le plan seulement', async () => {
  // P1 (420 kg) en A1-T01-N2 : 840 + 420 = 1 260 kg > 1 200.
  const rouge = () => pg.$eval(`${Z} [data-pe-deja="2"]`, (t) => t.getAttribute('fill'));
  for (const [temps, attendu, bas] of [['entrainement', '#ff8a7a', 'SURCHARGE'], ['evaluation', '#f3d04a', 'posé']]) {
    await monter(pg, { temps });
    vrai(!!(await pg.$('#calculetteFlottante')), `calculette en ${temps}`);
    // Son bouton est à l'encre, jamais à l'accent de la charte (rouge chez Smoby : il dirait « faux »).
    egal(await pg.$eval('#calculetteFlottante .calc-fab', (b) => b.style.background), 'var(--encre)', `bouton de la calculette en ${temps}`);
    await poser(pg, 'P1', 'A1-T01-N2-E3');
    await pg.click(`${Z} [data-pe-trav="A1-T01"]`);
    egal(await texte(pg, '[data-pe-deja="2"]'), '1 260', `capteur N2 en ${temps}`);
    egal(await rouge(), attendu, `chiffres du capteur dépassé en ${temps}`);
    egal(await texte(pg, '[data-pe-bas="2"]'), bas, `bas du capteur dépassé en ${temps}`);
    vrai(!(await present(pg, '[data-pe-calcul]')), `calcul de charge en ${temps}`);
  }
  await pg.click('#peTest .ent-nav[data-vue="stock"]');
  vrai(!(await pg.$('#calculetteFlottante')), 'calculette restée hors du plan');
});

await v('Entrepôt évaluation : le capteur ajoute la palette en main, sans rien dire du juste ou du faux', async () => {
  await monter(pg, { temps: 'evaluation' });
  await pg.click(`${Z} .pe-bandeau [data-pe-pal="P1"]`);
  await pg.click(`${Z} [data-pe-trav="A1-T01"]`);
  // N2 : 840 + 420 = 1 260 kg > 1 200 ; N3 : 1 110 + 420.
  egal(await texte(pg, '[data-pe-deja="2"]'), '1 260', 'capteur N2 avec P1 en main');
  egal(await texte(pg, '[data-pe-deja="3"]'), '1 530', 'capteur N3 avec P1 en main');
  egal(await texte(pg, '[data-pe-bas="2"]'), 'dont 420 en main', 'bas du capteur');
  egal(await pg.$$eval(`${Z} [data-pe-deja]`, (L) => L.map((t) => t.getAttribute('fill'))), ['#f3d04a', '#f3d04a'], 'chiffres en rouge');
  egal(await pg.$$eval(`${Z} [data-pe-cadre]`, (L) => L.map((t) => t.getAttribute('stroke'))), ['#1a1915', '#1a1915'], 'cadre en rouge');
});

await v('Entrepôt : carte de palette posée = trait épais brun « votre palette » (plus de contour sur le plan), en évaluation aussi', async () => {
  await monter(pg, { temps: 'evaluation' });
  const bords = () => pg.$$eval(`${Z} .pe-bandeau [data-pe-pal]`, (L) => L.map((b) => `${b.dataset.pePal} ${getComputedStyle(b).borderTopWidth}`));
  egal(await bords(), ['P1 2px', 'P2 2px', 'P3 2px', 'P4 2px'], 'cartes avant de poser');
  await poser(pg, 'P1', 'A1-T01-N2-E3');
  await poser(pg, 'P3', 'L2');
  if (await present(pg, '[data-pe="retour"]')) await pg.click(`${Z} [data-pe="retour"]`);
  egal(await bords(), ['P1 3px', 'P2 2px', 'P3 3px', 'P4 2px'], 'cartes après P1 en rack et P3 en litiges');
  const coul = await pg.$eval(`${Z} .pe-bandeau [data-pe-pal="P1"]`, (b) => [getComputedStyle(b).borderTopColor,
    getComputedStyle(document.querySelector('.pe-pid')).borderTopColor]);
  egal(coul[0], coul[1], 'couleur du trait = celle de « votre palette »');
  egal(await pg.$$eval(`${Z} .pe-fond-trav`, (L) => [...new Set(L.map((r) => r.getAttribute('stroke-width')))]), ['1.2'], 'contour des travées sur le plan');
});

await v('Entrepôt entraînement : parcours seul (pas de bandes, pas de consigne), verdict = nom du critère seul', async () => {
  await monter(pg, { temps: 'entrainement' });
  egal((await pg.$$(`${Z} [data-pe-bande]`)).length, 0, 'bandes');
  vrai(await present(pg, '[data-pe-parcours]'), 'parcours absent');
  vrai(!(await present(pg, '[data-pe-cons]')), 'consigne de palette');
  vrai(await present(pg, '[data-pe-regles]'), 'Les règles absentes');
  await poser(pg, 'P1', 'A1-T02-N1-E2');
  await pg.click(`${Z} [data-pe="verifier"]`);
  egal(await texte(pg, '[data-pe-verd="P1"]'), '✗ critère : rotation', 'verdict');
});

await v('Entrepôt évaluation : rien avant la copie, « Rendre mon travail » en deux clics, note = jalons × 20 / 4', async () => {
  await monter(pg, { temps: 'evaluation' });
  egal((await pg.$$(`${Z} [data-pe-bande]`)).length, 0, 'bandes');
  vrai(!(await present(pg, '[data-pe-parcours]')), 'parcours dessiné');
  vrai(!(await present(pg, '[data-pe-regles]')), 'Les règles');
  vrai(!(await present(pg, '[data-pe="verifier"]')), 'Vérifier');
  await poserTout(pg, [['P1', 'A1-T01-N1-E3'], ['P2', 'B2-T02-N1-E3'], ['P3', 'L2'], ['P4', 'B1-T01-N2-E3']]);
  await pg.click(`${Z} [data-pe-trav="A1-T01"]`);
  // L'aide « déjà posé » reste en évaluation (05/10/2026) ; le calcul fait pour l'élève, non.
  egal(await texte(pg, '[data-pe-deja="2"]'), '840', 'capteur de charge en évaluation');
  vrai(!(await present(pg, '[data-pe-calcul]')), 'calcul de charge en évaluation');
  await pg.click(`${Z} [data-pe="retour"]`);
  egal(await pg.$$eval(`${Z} .pe-verd`, (L) => L.length), 0, 'verdict avant la copie');
  await pg.click(`${Z} [data-pe="rendre"]`);
  egal(await pg.evaluate(() => window.__e.remis), null, 'rendue dès le premier clic');
  await pg.click(`${Z} [data-pe="rendreOui"]`);
  await pg.waitForFunction(() => window.__e.remis);
  const r = await pg.evaluate(() => ({ score: window.__e.remis.score, max: window.__e.remis.max, J: window.__e.remis.detail.entrepot.jalons.map((j) => j.ok) }));
  egal(r, { score: 15, max: 20, J: [true, true, true, false] }, 'note');
  await pg.waitForSelector(`${Z} .pe-bandeau [data-pe-pal="P1"][disabled]`);
  egal(await pg.$$eval(`${Z} .pe-verd`, (L) => L.length), 0, 'verdict montré à l’élève après la copie');
});

/* =========================================================== onglets, clavier, état */
await v('Entrepôt : onglets — une travée ouvre la vue (plan caché) ; Retour et Échap reviennent ; le bandeau ne bouge pas', async () => {
  await monter(pg);
  const h0 = await pg.$eval(`${Z} .pe-bandeau`, (el) => el.getBoundingClientRect().height);
  await pg.click(`${Z} .pe-bandeau [data-pe-pal="P1"]`);
  const h1 = await pg.$eval(`${Z} .pe-bandeau`, (el) => el.getBoundingClientRect().height);
  egal(Math.round(h1), Math.round(h0), 'hauteur du bandeau en prenant une palette');
  await pg.click(`${Z} [data-pe-trav="B1-T04"]`);
  vrai(!(await present(pg, '.pe-plan')), 'plan encore affiché');
  vrai((await texte(pg, '.pe-fil')).includes('B1-T04 (vue depuis l\'allée B)'), 'fil');
  egal(await pg.$$eval(`${Z} [data-pe-adresse] .pe-case b`, (L) => L.map((x) => x.textContent)), ['B1', 'T04', '?', '?'], 'adresse');
  await pg.hover(`${Z} [data-pe-emp="B1-T04-N2-E1"]`);
  egal(await pg.$$eval(`${Z} [data-pe-adresse] .pe-case b`, (L) => L.map((x) => x.textContent)), ['B1', 'T04', 'N2', 'E1'], 'adresse au survol');
  await pg.click(`${Z} [data-pe="retour"]`);
  vrai(await present(pg, '.pe-plan'), 'retour par le bouton');
  await pg.click(`${Z} [data-pe-trav="A2-T03"]`);
  await pg.keyboard.press('Escape');
  vrai(await present(pg, '.pe-plan'), 'retour par Échap');
  egal(Math.round(await pg.$eval(`${Z} .pe-bandeau`, (el) => el.getBoundingClientRect().height)), Math.round(h0), 'hauteur du bandeau à la fin');
  // Le plan et la vue de face tiennent dans l'écran (1366 × 768), page en haut.
  await pg.evaluate(() => window.scrollTo(0, 0));
  const bas = await pg.$eval(`${Z} .pe-plan svg`, (el) => el.getBoundingClientRect().height);
  vrai(bas >= 400, `plan trop petit : ${bas}`);
});

await v('Entrepôt : au clavier — Tab jusqu’à une travée, Entrée l’ouvre, Entrée pose, Échap revient sur la travée', async () => {
  await monter(pg);
  await pg.focus(`${Z} .pe-bandeau [data-pe-pal="P4"]`);
  await pg.keyboard.press('Enter');
  await pg.focus(`${Z} [data-pe-trav="B1-T03"]`);
  await pg.keyboard.press('Enter');
  egal(await pg.evaluate(() => document.activeElement.dataset.peEmp), 'B1-T03-N1-E1', 'focus après ouverture');
  await pg.focus(`${Z} [data-pe-emp="B1-T03-N3-E1"]`);
  await pg.keyboard.press('Enter');
  egal((await etat(pg)).place, { P4: 'B1-T03-N3-E1' }, 'posée au clavier');
  await pg.keyboard.press('Escape');
  egal(await pg.evaluate(() => document.activeElement.dataset.peTrav), 'B1-T03', 'focus après Échap');
});

await v('Entrepôt : état retrouvé après rechargement ; deux séances ne se mélangent pas', async () => {
  await pg.evaluate(() => localStorage.removeItem('essai-entrepot-base'));
  await monter(pg, { garder: true });
  await poser(pg, 'P1', 'A1-T01-N1-E3');
  await pg.reload();
  await pg.waitForSelector('#btnProf');
  await monter(pg, { garder: true });
  egal((await etat(pg)).place, { P1: 'A1-T01-N1-E3' }, 'état retrouvé');
  egal(await pg.$eval(`${Z} .pe-bandeau [data-pe-pal="P1"]`, (b) => b.querySelector('.pe-etat').textContent), 'A1-T01-N1-E3', 'carte');
  // Une autre séance (autre id d'entrepôt) dans la même base : elle part de zéro, la première reste.
  await monter(pg, { garder: true, id: 'autre-seance' });
  egal(await pg.evaluate(() => Object.keys(window.__e.db.entrepots)), ['essai-rangement', 'autre-seance'], 'clés');
  egal(await pg.evaluate(() => window.__e.db.entrepots['autre-seance'].place), {}, 'autre séance');
  await pg.evaluate(() => localStorage.removeItem('essai-entrepot-base'));
});

await v('Entrepôt : côté enseignant, les bonnes réponses ; jamais côté élève', async () => {
  await monter(pg);
  vrai(!(await present(pg, '.pe-prof')), 'bonnes réponses montrées à l’élève');
  await monter(pg, { role: 'prof' });
  vrai((await texte(pg, '.pe-prof')).includes('P2 : B2-T02-N1-E2, B2-T02-N1-E3'), 'bonnes réponses côté enseignant');
  egal(erreursE, [], 'erreurs JS');
});

/* =========================================================== PRÉPARATION (lot 4) */
// Le cas ③ de la maquette (`contenus/entrepot-essai.js`, PREPARATION). Valeurs écrites À LA MAIN (maquette
// du 04/10, recontrôlées contre le moteur) : bon dans l'ordre du serpentin A1-T01-N1-E1 Maison × 2 ·
// A1-T02-N1-E1 Établi × 6 · B1-T02-N1-E3 Tricycle × 4 · B1-T01-N1-E2 Porteur × 6 · B1-T01-N1-E1 Trotteur × 6
// (rupture : 2 au picking, minimum 6 ; réserve juste B1-T01-N2-E2, piège B1-T01-N2-E1 = Porteur) ·
// B2-T01-N1-E1 Cuisine × 8. Serpentin dans l'ordre 47 m ; retour 40 m ; désordre en serpentin 141 m,
// 3 tours ; palette 331 kg, 1,74 m.
const ZP = '#peTest .pe';
const etatP = (p) => p.evaluate(() => JSON.parse(JSON.stringify(((window.__e.db.entrepots) || {})['essai-preparation'] || null)));
const jalonsP = (p, temps) => p.evaluate(async (temps) => {
  const E = await import('/core/types/entrepot.js');
  const C = await import('/contenus/entrepot-essai.js');
  return E.jalonsEntrepot(window.__e.db, C.PREPARATION, temps).L.map((l) => l.ok);
}, temps);
const calculP = (p) => p.evaluate(async () => {
  const E = await import('/core/types/entrepot.js');
  const C = await import('/contenus/entrepot-essai.js');
  const X = E.calculPreparation(C.PREPARATION, window.__e.db.entrepots['essai-preparation']);
  return { m: Math.round(X.metres), tours: X.tours, kg: X.poids, h: Math.round(X.hauteur * 100) / 100,
    regles: Object.fromEntries(X.regles.map((r) => [r.id, r.ok])) };
});
const LIGNES = [['A1-T01-N1-E1', 2], ['A1-T02-N1-E1', 6], ['B1-T02-N1-E3', 4], ['B1-T01-N1-E2', 6], ['B1-T01-N1-E1', 6], ['B2-T01-N1-E1', 8]];
const travDe = (a) => a.slice(0, 6);
// Ouvrir la travée d'une adresse (en revenant d'abord au plan), cliquer le picking, saisir, Prélever.
async function allerA(p, a) {
  for (let i = 0; i < 4 && await present(p, '[data-pe="retour"]'); i++) await p.click(`${ZP} [data-pe="retour"]`);
  await p.click(`${ZP} [data-pe-trav="${travDe(a)}"]`);
}
async function prelever(p, a, q, { ouvrir = true } = {}) {
  if (ouvrir) await allerA(p, a);
  await p.click(`${ZP} [data-pe-emp="${a}"]`);
  await p.fill('#peNb', String(q));
  await p.click(`${ZP} [data-pe="prelever"]`);
}
// La rupture du Trotteur : descente de la palette de réserve B1-T01-N2-E2, puis prélèvement.
async function reapproTrotteur(p) {
  await allerA(p, 'B1-T01-N1-E1');
  await p.click(`${ZP} [data-pe-emp="B1-T01-N1-E1"]`);
  await p.click(`${ZP} [data-pe="reappro"]`);
  await p.click(`${ZP} [data-pe-emp="B1-T01-N2-E2"]`);
}
async function prelevertout(p, ordre = [0, 1, 2, 3, 4, 5]) {
  for (const i of ordre) {
    const [a, q] = LIGNES[i];
    if (a === 'B1-T01-N1-E1') { await reapproTrotteur(p); await prelever(p, a, q, { ouvrir: false }); } else await prelever(p, a, q);
  }
}
async function finir(p, film = '4', etiq = ['avant', 'arriere', 'dessus']) {
  await p.click(`${ZP} [data-pe="terminer"]`);
  await p.selectOption(`${ZP} [data-pe-film]`, film);
  for (const k of etiq) await p.check(`${ZP} [data-pe-etiq="${k}"]`);
}

await v('Préparation : la vue s’ouvre ; bon trié dans l’ordre du serpentin (guidage), heure jeudi 6 h, quai n° 1 · E1', async () => {
  await monter(pg, { cas: 'preparation' });
  egal(await pg.textContent('#peTest .ent-nav[data-vue="entrepot"]').then((t) => t.trim()), 'Préparer la commande', 'entrée de menu');
  egal(await pg.$$eval(`${ZP} [data-pe-ligne] .pe-ttl .pe-mono`, (L) => L.map((x) => x.textContent)), LIGNES.map((l) => l[0]), 'ordre du bon');
  egal(await texte(pg, '[data-pe-heure]'), 'jeudi 10 décembre, 6 h 00', 'heure de l’enlèvement');
  vrai((await texte(pg, '.pe-bon')).includes('quai n° 1'), 'quai');
  vrai(await pg.$eval(`${ZP} .pe-plan svg`, (s) => s.textContent.includes('QUAI 1 · E1')), 'quai sur le plan');
  egal(await pg.$$eval(`${ZP} [data-pe-numero]`, (L) => L.length), 6, 'numéros des lignes sur le plan');
  vrai(await present(pg, '[data-pe-parcours]'), 'parcours dessiné');
  egal(await texte(pg, '[data-pe-m]'), '0 m', 'compteur');
  egal(await jalonsP(pg), [false, false, false, false, false, false, false, false, false], 'inaction : 0 / 9');
});

await v('Préparation guidage, à la souris (1366 × 768) : dans l’ordre → 47 m, 6/6, 331 kg, 1,74 m, 9 / 9', async () => {
  await monter(pg, { cas: 'preparation' });
  const h0 = await pg.$eval(`${ZP} .pe-bandeau`, (el) => el.getBoundingClientRect().height);
  // Première ligne pilotée à la souris : boîte de la travée, puis de l'emplacement, saisie, Prélever.
  const clic = async (sel) => { const el = await pg.$(`${ZP} ${sel}`); await el.scrollIntoViewIfNeeded(); const b = await el.boundingBox(); await pg.mouse.click(b.x + b.width / 2, b.y + b.height / 2); };
  await clic('[data-pe-trav="A1-T01"]');
  await pg.waitForTimeout(700);    // la travée se relève
  await clic('[data-pe-emp="A1-T01-N1-E1"]');
  egal(await pg.evaluate(() => document.activeElement.id), 'peNb', 'la fiche s’ouvre prête à la saisie');
  vrai((await texte(pg, '[data-pe-aide]')).includes('prélevez 2 cartons'), 'aide « reste à prélever »');
  await pg.keyboard.type('2');
  await pg.keyboard.press('Enter');
  egal((await etatP(pg)).faits, [{ a: 'A1-T01-N1-E1', k: 'MAI', q: 2 }], 'premier prélèvement');
  egal(Math.round(await pg.$eval(`${ZP} .pe-bandeau`, (el) => el.getBoundingClientRect().height)), Math.round(h0), 'hauteur du bandeau');
  await prelevertout(pg, [1, 2, 3, 4, 5]);
  egal(await calculP(pg), { m: 47, tours: 1, kg: 331, h: 1.74, regles: { lourds: true, fragiles: true, poids: true, hauteur: true, film: false, etiquettes: false } }, 'calcul');
  egal(await texte(pg, '[data-pe-m]'), '47 m', 'compteur');
  await finir(pg);
  vrai((await texte(pg, '[data-pe-kg]')) === '331 kg' && (await texte(pg, '[data-pe-h]')) === '1,74 m', 'poids et hauteur affichés');
  await pg.click(`${ZP} [data-pe="verifierPrep"]`);
  vrai((await texte(pg, '[data-pe-bilan-l]')).includes('6/6'), 'lignes 6/6');
  vrai((await texte(pg, '[data-pe-bilan-p]')).includes('palette conforme · 6/6'), 'palette conforme');
  egal(await jalonsP(pg), [true, true, true, true, true, true, true, true, true], '9 / 9');
  egal((await etatP(pg)).reappros, [{ pour: 'B1-T01-N1-E1', de: 'B1-T01-N2-E2' }], 'réappro');
  egal(Math.round(await pg.$eval(`${ZP} .pe-bandeau`, (el) => el.getBoundingClientRect().height)), Math.round(h0), 'hauteur du bandeau à la fin');
});

await v('Préparation : réserve refusée ; réappro par le Porteur refusé ; réappro d’un picking au-dessus du minimum refusé ; trop de cartons refusé', async () => {
  await monter(pg, { cas: 'preparation' });
  await allerA(pg, 'B1-T01-N1-E1');
  await pg.click(`${ZP} [data-pe-emp="B1-T01-N2-E2"]`);
  vrai((await texte(pg, '[data-pe-msg]')).includes('palette de réserve : on prélève au niveau N1'), 'prélever en réserve');
  vrai(!(await present(pg, '[data-pe-fiche]')), 'fiche ouverte sur la réserve');
  egal((await etatP(pg)).essaisReserve, ['B1-T01-N2-E2'], 'essai en réserve gardé (repérage)');
  // un picking au-dessus de son minimum : pas de réapprovisionnement
  await pg.click(`${ZP} [data-pe-emp="B1-T01-N1-E2"]`);
  await pg.click(`${ZP} [data-pe="reappro"]`);
  vrai((await texte(pg, '[data-pe-msg]')).includes('pas sous son minimum'), 'réappro au-dessus du minimum');
  // plus que le picking : refusé
  await pg.fill('#peNb', '23');
  await pg.click(`${ZP} [data-pe="prelever"]`);
  vrai((await texte(pg, '[data-pe-msg]')).includes('Il n’y a que 22 cartons'), 'trop de cartons');
  egal((await etatP(pg)).faits, [], 'rien prélevé');
  await pg.click(`${ZP} [data-pe="retour"]`);
  // la rupture : la palette juste au-dessus (B1-T01-N2-E1) est un Porteur
  await pg.click(`${ZP} [data-pe-emp="B1-T01-N1-E1"]`);
  vrai((await texte(pg, '[data-pe-aide]')).includes('sous son minimum'), 'rupture expliquée');
  await pg.click(`${ZP} [data-pe="reappro"]`);
  egal(await texte(pg, '[data-pe="retour"]'), '✕ Annuler le réapprovisionnement', 'bouton pendant le réappro');
  await pg.click(`${ZP} [data-pe-emp="B1-T01-N2-E1"]`);
  vrai((await texte(pg, '[data-pe-msg]')).includes('pas la même référence'), 'réappro par le Porteur');
  await pg.click(`${ZP} [data-pe-emp="B1-T01-N1-E2"]`);
  vrai((await texte(pg, '[data-pe-msg]')).includes('au-dessus du picking'), 'réappro depuis le N1');
  egal((await etatP(pg)).reappros, [], 'aucun réappro');
  await pg.keyboard.press('Escape');
  vrai(!(await texte(pg, '[data-pe="retour"]')).includes('Annuler'), 'Échap annule le réappro');
  await pg.click(`${ZP} [data-pe-emp="B1-T01-N1-E1"]`);
  await pg.click(`${ZP} [data-pe="reappro"]`);
  await pg.click(`${ZP} [data-pe-emp="B1-T01-N3-E1"]`);
  vrai((await texte(pg, '[data-pe-msg]')).includes('Picking : 26 cartons'), 'réappro fait (2 + 24)');
  egal((await etatP(pg)).vides, ['B1-T01-N3-E1'], 'emplacement de réserve libéré');
  vrai((await texte(pg, '[data-pe-emp="B1-T01-N3-E1"]')).includes('libre'), 'libre dans la vue de face');
});

await v('Préparation, écran partagé : travée ouverte → palette à gauche, travée à droite ; fiche à droite, palette toujours à gauche ; la palette grandit après Prélever', async () => {
  await monter(pg, { cas: 'preparation' });
  vrai(!(await present(pg, '[data-pe-palmini]')), 'pas de palette à gauche sur le plan');
  await allerA(pg, 'A1-T01-N1-E1');
  const x = (sel) => pg.$eval(`${ZP} ${sel}`, (el) => el.getBoundingClientRect().x);
  const cartons = () => pg.$$eval(`${ZP} [data-pe-palmini] svg rect[stroke="#6e4a22"]`, (L) => L.length);
  vrai(await present(pg, '[data-pe-palmini]') && await present(pg, '.pe-partage-d .pe-face'), 'palette et travée ensemble');
  vrai(await x('[data-pe-palmini]') < await x('.pe-partage-d .pe-face'), 'palette à gauche de la travée');
  vrai(!(await present(pg, '[data-pe="voir"]')), 'plus de bouton « Palette de commande » dans l’en-tête');
  egal(await cartons(), 0, 'palette vide');
  await pg.click(`${ZP} [data-pe-emp="A1-T01-N1-E1"]`);
  vrai(await present(pg, '.pe-partage-d [data-pe-fiche]') && !(await present(pg, '.pe-partage-d .pe-face')), 'la fiche remplace la travée à droite');
  vrai(await x('[data-pe-palmini]') < await x('[data-pe-fiche]'), 'palette toujours à gauche');
  await pg.fill('#peNb', '2');
  await pg.click(`${ZP} [data-pe="prelever"]`);
  vrai(await present(pg, '.pe-partage-d .pe-face') && await present(pg, '[data-pe-palmini]'), 'retour à la travée, palette à gauche');
  egal(await cartons(), 2, 'deux cartons sur la palette');
  egal(await texte(pg, '[data-pe-palmini] [data-pe-kg]'), '125 kg', 'poids de la palette (2 × 50 kg + palette 25 kg)');
  // la zone d'expédition du plan ouvre toujours la palette entière
  await pg.click(`${ZP} [data-pe="retour"]`);
  await pg.click(`${ZP} [data-pe-voir]`);
  vrai(await present(pg, '.pe-palcmd') && !(await present(pg, '[data-pe-palmini]')), 'palette entière depuis le plan');
});

await v('Préparation : palette vide terminée → 0 / 9 ; une seule ligne puis Terminer → parcours faux (garde « lignes justes »)', async () => {
  await monter(pg, { cas: 'preparation' });
  vrai(await pg.$eval(`${ZP} [data-pe="terminer"]`, (b) => b.disabled), 'Terminer actif sur une palette vide');
  await prelever(pg, 'A1-T01-N1-E1', 2);
  await pg.click(`${ZP} [data-pe="reposer"]`);
  egal((await etatP(pg)).faits, [], 'reposé');
  egal((await etatP(pg)).pick['A1-T01-N1-E1'], 5, 'picking rendu');
  // forcer « terminer » sur une palette vide (le bouton est grisé) : aucun jalon
  await pg.evaluate(() => { window.__e.db.entrepots['essai-preparation'].fin = true; window.__e.db.entrepots['essai-preparation'].film = '4'; window.__e.db.entrepots['essai-preparation'].etiq = { avant: true, arriere: true, dessus: true }; });
  egal(await jalonsP(pg), [false, false, false, false, false, false, false, false, false], 'palette vide terminée');
  await monter(pg, { cas: 'preparation' });
  await prelever(pg, 'A1-T01-N1-E1', 2);
  await finir(pg);
  egal(await jalonsP(pg), [false, false, false, false, false, false, false, false, false], 'une seule ligne');
  // le même tour, avec la garde par défaut (« au moins une ligne ») : le parcours compte
  await monter(pg, { cas: 'preparation', jalons: [{ type: 'lignesJustes' }, { type: 'parcours' }] });
  await prelever(pg, 'A1-T01-N1-E1', 2);
  egal(await pg.evaluate(async () => {
    const E = await import('/core/types/entrepot.js'); const C = await import('/contenus/entrepot-essai.js');
    return E.jalonsEntrepot(window.__e.db, Object.assign({}, C.PREPARATION, { jalons: [{ type: 'lignesJustes' }, { type: 'parcours' }] })).L.map((l) => l.ok);
  }), [false, true], 'garde par défaut');
});

// Le tracé avance avec la préparation (Tristan, 06/10/2026) : du quai au dernier prélèvement, le retour au
// quai seulement une fois terminée. Les mètres comptent toujours le tour entier.
await v('Préparation : le tracé part du quai et s’arrête au dernier prélèvement ; le retour au quai n’apparaît qu’à « Terminer »', async () => {
  await monter(pg, { cas: 'preparation' });
  vrai(!(await present(pg, '[data-pe-trace]')), 'tracé avant tout prélèvement');
  await prelever(pg, 'A1-T01-N1-E1', 2);
  await prelever(pg, 'A1-T02-N1-E1', 6);
  // Le tracé calculé (en mètres) : premier et dernier point.
  const bouts = () => pg.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/entrepot-essai.js');
    const X = E.calculPreparation(C.PREPARATION, window.__e.db.entrepots['essai-preparation']);
    return { d: X.trace[0].join(','), f: X.trace[X.trace.length - 1].join(','), m: Math.round(X.metres) };
  });
  const a = await bouts();
  vrai(a.d !== a.f, `tracé refermé sur le quai en cours de préparation (${a.d} → ${a.f})`);
  // et à l'écran : le tracé du plan s'arrête au même endroit (il n'est pas refermé)
  for (let i = 0; i < 4 && await present(pg, '[data-pe="retour"]'); i++) await pg.click(`${ZP} [data-pe="retour"]`);
  const ecran = await pg.$eval(`${ZP} [data-pe-trace] polyline`, (l) => { const P = l.getAttribute('points').split(' '); return P[0] === P[P.length - 1]; });
  egal(ecran, false, 'tracé du plan refermé en cours de préparation');
  await finir(pg);
  const b = await bouts();
  egal([b.f, b.m], [b.d, a.m], 'tracé revenu au quai une fois terminé ; les mètres comptent le tour entier avant comme après');
});

await v('Préparation : Cuisine avant Porteur et Trotteur → 47 m mais « fragiles en haut » faux ; film 2 tours et étiquettes voisines faux', async () => {
  await monter(pg, { cas: 'preparation' });
  await prelevertout(pg, [0, 1, 2, 5, 3, 4]);
  const X = await calculP(pg);
  egal([X.m, X.regles.fragiles, X.regles.lourds], [47, false, true], 'mètres et règles');
  await finir(pg, '2', ['avant', 'gauche', 'dessus']);
  await pg.click(`${ZP} [data-pe="verifierPrep"]`);
  egal(await pg.$$eval(`${ZP} [data-pe-regle]`, (L) => Object.fromEntries(L.map((x) => [x.dataset.peRegle, x.dataset.ok === 'true']))),
    { lourds: true, fragiles: false, poids: true, hauteur: true, film: false, etiquettes: false }, 'bilan');
  egal(await jalonsP(pg), [true, true, true, false, true, true, false, false, true], 'jalons');
  vrai((await texte(pg, '[data-pe-regle="fragiles"]')).includes('posés sur un carton fragile'), 'expliqué en guidage');
  // « que, pas de combien » : aucun écart chiffré dans le bilan
  vrai(!/de \d+ ?(kg|m|cm)/.test(await texte(pg, '[data-pe-bilan]')), 'écart chiffré dans le bilan');
  // corriger : Reprendre, film 4 tours, étiquettes opposées
  await pg.click(`${ZP} [data-pe="reprendre"]`);
  await pg.click(`${ZP} [data-pe="terminer"]`);
  await pg.selectOption(`${ZP} [data-pe-film]`, '4');
  await pg.uncheck(`${ZP} [data-pe-etiq="gauche"]`);
  await pg.check(`${ZP} [data-pe-etiq="arriere"]`);
  egal(await jalonsP(pg), [true, true, true, false, true, true, true, true, true], 'après correction');
});

await v('Préparation : Trotteur prélevé en deux fois (2, descente de la réserve, puis 4) → une seule couche, 1,74 m', async () => {
  await monter(pg, { cas: 'preparation' });
  await prelevertout(pg, [0, 1, 2, 3]);
  await prelever(pg, 'B1-T01-N1-E1', 2, { ouvrir: false });
  await pg.click(`${ZP} [data-pe-emp="B1-T01-N1-E1"]`);
  await pg.click(`${ZP} [data-pe="reappro"]`);
  await pg.click(`${ZP} [data-pe-emp="B1-T01-N2-E2"]`);
  await prelever(pg, 'B1-T01-N1-E1', 4, { ouvrir: false });
  await prelever(pg, 'B2-T01-N1-E1', 8);
  const X = await calculP(pg);
  egal([X.m, X.h, X.kg], [47, 1.74, 331], 'mètres, hauteur, poids');
  egal(await jalonsP(pg), [true, true, true, true, true, true, false, false, true], 'jalons (film et étiquettes à faire)');
});

await v('Préparation : sabotages — poids et hauteur du transporteur tombent quand on baisse la limite', async () => {
  await monter(pg, { cas: 'preparation', commande: { kgMax: 300, hMax: 1.6 } });
  await prelevertout(pg);
  await finir(pg);
  await pg.click(`${ZP} [data-pe="verifierPrep"]`);
  egal(await pg.$$eval(`${ZP} [data-pe-regle]`, (L) => L.filter((x) => x.dataset.ok !== 'true').map((x) => x.dataset.peRegle)), ['poids', 'hauteur'], 'règles fausses');
  vrai((await texte(pg, '[data-pe-regle="poids"]')).includes('dépasse le poids maximum du transporteur (300 kg)'), 'message poids');
  vrai(!(await texte(pg, '[data-pe-bilan]')).includes('331'), 'le poids réel répété dans le message');
});

await v('Préparation entraînement : liste dans le désordre suivie → 141 m, 3 tours ; bilan = nom du critère seul', async () => {
  await monter(pg, { cas: 'preparation', temps: 'entrainement' });
  egal(await pg.$$eval(`${ZP} [data-pe-ligne] .pe-ttl .pe-mono`, (L) => L.map((x) => x.textContent)),
    ['B1-T01-N1-E1', 'B2-T01-N1-E1', 'B1-T01-N1-E2', 'A1-T01-N1-E1', 'B1-T02-N1-E3', 'A1-T02-N1-E1'], 'désordre');
  egal(await pg.$$eval(`${ZP} [data-pe-numero]`, (L) => L.length), 0, 'numéros en entraînement');
  await prelevertout(pg, [4, 5, 3, 0, 2, 1]);
  const X = await calculP(pg);
  egal([X.m, X.tours, X.regles.lourds, X.regles.fragiles], [141, 3, false, false], 'désordre');
  vrai((await texte(pg, '[data-pe-tours]')).includes('3 tours'), 'tours au compteur');
  await finir(pg);
  await pg.click(`${ZP} [data-pe="verifierPrep"]`);
  egal(await texte(pg, '[data-pe-regle="fragiles"]'), '✗ fragiles en haut', 'nom seul');
  vrai((await texte(pg, '[data-pe-bilan-m]')).includes('3 tours'), 'tours au bilan');
});

await v('Préparation évaluation : parcours à choisir puis verrouillé ; retour → 40 m ; rien avant la copie ; note sur 20', async () => {
  await monter(pg, { cas: 'preparation', temps: 'evaluation' });
  vrai(!(await present(pg, '[data-pe-parcours]')), 'parcours dessiné en évaluation');
  vrai(!(await present(pg, '[data-pe-regles]')), 'Les règles en évaluation');
  await allerA(pg, 'A1-T01-N1-E1');
  await pg.click(`${ZP} [data-pe-emp="A1-T01-N1-E1"]`);
  vrai((await texte(pg, '[data-pe-msg]')).includes('Choisissez d’abord votre parcours'), 'parcours avant de prélever');
  await pg.click(`${ZP} [data-pe="retour"]`);
  await pg.check(`${ZP} input[name="peParcours"][value="retour"]`);
  await prelevertout(pg);
  vrai(await pg.$eval(`${ZP} input[name="peParcours"][value="serpentin"]`, (i) => i.disabled), 'parcours verrouillé');
  egal(await texte(pg, '[data-pe-m]'), '40 m', 'retour');
  await finir(pg);
  vrai(!(await present(pg, '[data-pe="verifierPrep"]')), 'Vérifier en évaluation');
  vrai(!(await present(pg, '[data-pe-bilan]')), 'bilan avant la copie');
  vrai(!(await present(pg, '[data-pe-aide]')), 'aide en évaluation');
  await pg.click(`${ZP} [data-pe="rendre"]`);
  await pg.click(`${ZP} [data-pe="rendreOui"]`);
  await pg.waitForFunction(() => window.__e.remis);
  const r = await pg.evaluate(() => ({ score: window.__e.remis.score, max: window.__e.remis.max, m: window.__e.remis.detail.entrepot.metres, J: window.__e.remis.detail.entrepot.jalons.map((j) => j.ok) }));
  egal(r, { score: 20, max: 20, m: 40, J: [true, true, true, true, true, true, true, true, true] }, 'note');
  vrai(!(await present(pg, '[data-pe-bilan]')), 'bilan montré à l’élève après la copie');
  // le serpentin dans l'ordre (47 m) ne fait pas le meilleur tour possible en évaluation (40 m)
  await monter(pg, { cas: 'preparation', temps: 'evaluation' });
  await pg.check(`${ZP} input[name="peParcours"][value="serpentin"]`);
  await prelevertout(pg);
  egal((await jalonsP(pg, 'evaluation'))[8], false, 'serpentin en évaluation');
});

await v('Préparation : état retrouvé après rechargement ; rangement et préparation ne se mélangent pas ; enseignant seul voit les attendus', async () => {
  await pg.evaluate(() => localStorage.removeItem('essai-entrepot-base'));
  await monter(pg, { cas: 'preparation', garder: true });
  await prelever(pg, 'A1-T01-N1-E1', 2);
  await pg.reload();
  await pg.waitForSelector('#btnProf');
  await monter(pg, { cas: 'preparation', garder: true });
  egal((await etatP(pg)).faits, [{ a: 'A1-T01-N1-E1', k: 'MAI', q: 2 }], 'état retrouvé');
  egal(await texte(pg, '[data-pe-prel="0"]'), '2', 'carte du bon');
  await monter(pg, { garder: true });
  egal(await pg.evaluate(() => Object.keys(window.__e.db.entrepots).sort()), ['essai-preparation', 'essai-rangement'], 'clés');
  egal(await pg.evaluate(() => window.__e.db.entrepots['essai-rangement'].place), {}, 'rangement intact');
  await pg.evaluate(() => localStorage.removeItem('essai-entrepot-base'));
  await monter(pg, { cas: 'preparation' });
  vrai(!(await present(pg, '.pe-prof')), 'attendus montrés à l’élève');
  await monter(pg, { cas: 'preparation', role: 'prof' });
  vrai((await texte(pg, '.pe-prof')).includes('serpentin 47 m, retour 40 m'), 'attendus côté enseignant');
  egal(erreursE, [], 'erreurs JS');
});

await ctxE.close();

/* =========================================================== VISITE (second chantier, 05/10/2026) */
// Brief `docs/briefs/MOTEUR-modes-visite.md` §10, contenu d'ENT-5.3 (`contenus/smoby-ent53.js`). Toutes les
// valeurs attendues sont écrites À LA MAIN ici, reprises du brief (§6 d'ENT-5.3) : zones, coins, bandes,
// trace du parcours, messages. Les clics sur les photos passent par la vraie souris, aux coordonnées de la
// photo converties en position à l'écran (le calque SVG suit la photo, même agrandie).
// Contexte à mouvement réduit : le zoom de la vue du ciel est immédiat (pas d'attente de 1,4 s).
const ctxV = await nav.newContext({ viewport: { width: 1366, height: 768 }, reducedMotion: 'reduce' });
const erreursV = [];
const pv = await ctxV.newPage();
pv.setDefaultTimeout(6000);
pv.on('pageerror', (e) => erreursV.push('PAGEERROR: ' + e.message));
pv.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursV.push('CONSOLE: ' + m.text()); });
await pv.goto(BASE);
await pv.waitForSelector('#btnProf', { timeout: 8000 });

// Monte l'environnement sur la visite. `db` : base de départ (état injecté) ; `garder` : la base est rangée
// dans le stockage du navigateur ; `id` : autre clé d'état ; `sabotage` : casse une règle de la déclaration.
const monterV = (p, o = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-entrepot.js');
  const C = await import('/contenus/entrepot-essai.js');
  document.querySelector('#peTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'peTest'; document.body.appendChild(hote);
  const P = structuredClone(C.VISITE);
  const et = (id) => P.etapes.find((t) => t.id === id);
  if (o.id) P.id = o.id;
  if (o.sabotage === 'zone') et('ciel').puis.questions[0].zones = [[0, 0, 300, 200]];
  if (o.sabotage === 'tolerance') et('travee').tolerance = 0.001;
  if (o.sabotage === 'piege') et('travee').puis.cibles.push({ nom: 'barre du fond', y0: 145, y1: 178 });
  if (o.sabotage === 'adresse') { const s = et('adresse').sens; [s[1], s[2]] = [s[2], s[1]]; }
  if (o.sabotage === 'stock') P.stock = Object.assign({}, P.stock, { 'A1-T03-N2-E1': { produit: 'ETA', kg: 290 } });
  const U = E.univers({ temps: 'guidage', entrepot: P });
  const CLE = 'essai-visite-base';
  const db = o.garder ? JSON.parse(localStorage.getItem(CLE) || '{}') : structuredClone(o.db || {});
  const moteur = creerEntreprise(U);
  window.__e = { db, moteur, P };
  moteur.rendre(hote, {
    meta: { id: 'essai-entrepot', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps: 'guidage' },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => { if (o.garder) localStorage.setItem(CLE, JSON.stringify(db)); } },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null,
  });
  document.querySelector('#peTest .ent-nav[data-vue="entrepot"]').click();
}, o);
const ZV = '#peTest .pv';
const etapeV = (p) => p.$eval(ZV, (e) => e.dataset.pvEtape);
const texteV = async (p, sel) => ((await p.textContent(`${ZV} ${sel}`)) || '').replace(/\s+/g, ' ').trim();
const msgV = (p) => texteV(p, '[data-pv-msg]');
const jalonsV = (p) => p.evaluate(async () => {
  const E = await import('/core/types/entrepot.js');
  return E.jalonsEntrepot(window.__e.db, window.__e.P).L.map((l) => l.etat);
});
const premiersV = (p) => p.evaluate(() => ((window.__e.db.indicateurs || {})['essai-entrepot'] || {}).premier || {});
const xV = (p, id) => p.evaluate((id) => JSON.parse(JSON.stringify(((window.__e.db.entrepots || {})['smoby-visite'] || { x: {} }).x[id] || {})), id);
// La souris sur un point de la photo (repère de la photo), après avoir amené la photo à l'écran.
async function clicPhoto(p, x, y) {
  const [a, b] = await p.evaluate(([x, y]) => {
    const svg = document.querySelector('#peTest .pv-calque');
    svg.scrollIntoView({ block: 'nearest' });
    const q = new DOMPoint(x, y).matrixTransform(svg.getScreenCTM());
    return [q.x, q.y];
  }, [x, y]);
  await p.mouse.click(a, b);
}
// Une base où l'élève est déjà rendu à l'étape `k` (index), sans rien avoir fait ailleurs.
const rendu = (k, x = {}) => ({ entrepots: { 'smoby-visite': { courante: k, atteinte: k, x } } });
const ETAPES_V = ['accueil', 'ciel', 'parcours', 'reperer', 'mots', 'quiz', 'travee', 'adresse', 'fin'];
const TOUT_ATTENTE = Array(17).fill('attente');

// Les gestes justes, étape par étape (valeurs du brief).
async function cielJuste(p) {
  for (const n of [1, 2, 3, 4, 5, 6]) await p.click(`${ZV} button[data-pv-point="${n}"]`);
  await p.click(`${ZV} [data-pv="questions"]`);
  await clicPhoto(p, 1000, 560); await clicPhoto(p, 400, 575); await clicPhoto(p, 500, 400);
}
async function parcoursJuste(p) {
  for (const n of [1, 2, 3, 4, 5, 6]) {
    if (await p.$(`${ZV} [data-pv="retour"]`)) await p.click(`${ZV} [data-pv="retour"]`);
    await p.click(`${ZV} g[data-pv-etape="${n}"]`);
  }
}
// Les photos de « Où est-ce ? », dans l'ordre déclaré : allée A (4), quai (1), bureau (6), réception (2), litiges (5), allée principale (3).
const ASSOCIER = [4, 1, 6, 2, 5, 3];
async function associerJuste(p) { for (const n of ASSOCIER) await p.click(`${ZV} [data-pv-num="${n}"]`); }
async function quizJuste(p) {
  await clicPhoto(p, 300, 500); await clicPhoto(p, 700, 120); await clicPhoto(p, 450, 600); await clicPhoto(p, 800, 1700);
}
async function coins(p, L) { for (const [x, y] of L) await clicPhoto(p, x, y); }
const COINS_JUSTES = [[287, 45], [847, 47], [258, 1175], [876, 1173]];
async function traveeJuste(p) {
  await coins(p, COINS_JUSTES);
  await p.click(`${ZV} [data-pv="verifierCoins"]`);
  await clicPhoto(p, 570, 80); await clicPhoto(p, 570, 454); await clicPhoto(p, 570, 687);
}
async function choisirV(p, L) { for (let i = 0; i < 4; i++) await p.selectOption(`${ZV} [data-pv-choix="${i}"]`, L[i]); }
const SENS_JUSTES = ['allée et côté', 'travée', 'niveau', 'emplacement'];
async function adresseJuste(p) {
  await choisirV(p, SENS_JUSTES);
  await p.click(`${ZV} [data-pv="valider"]`);
  await p.click(`${ZV} [data-pe-trav="A1-T03"]`);
  await p.click(`${ZV} [data-pe-emp="A1-T03-N2-E1"]`);
}
const suivant = (p) => p.click(`${ZV} [data-pv="suivant"]`);

await v('Visite : la vue s’ouvre par son entrée de menu, 8 étapes, l’accueil, aucune erreur ; tout est en attente', async () => {
  await monterV(pv);
  egal(await pv.textContent('#peTest .ent-nav[data-vue="entrepot"]').then((t) => t.trim()), 'Visite de la plateforme', 'entrée de menu');
  egal(await pv.$$eval(`${ZV} .pv-file button`, (L) => L.map((b) => b.lastChild.textContent.trim())),
    ['Accueil', 'Vue du ciel', 'Le parcours', 'Où est-ce ?', 'Les mots du rack', 'Quiz', 'La travée', 'L’adresse', 'Fin'], 'les étapes');
  egal(await etapeV(pv), 'accueil', 'étape de départ');
  vrai((await texteV(pv, '.pv-perso')).startsWith('Bruno, chef de quai · mercredi 9 décembre, 8:00'), 'en-tête de Bruno');
  egal(await jalonsV(pv), TOUT_ATTENTE, 'jalons');
  egal(erreursV, [], 'erreurs JS');
});

await v('Visite : élève — pas de saut en avant, « Suivant » seulement sur une étape finie, retour sans rien perdre', async () => {
  await monterV(pv);
  egal(await pv.$$eval(`${ZV} .pv-file button`, (L) => L.map((b) => b.disabled)), [false, true, true, true, true, true, true, true, true], 'file à l’accueil');
  await suivant(pv);
  egal(await etapeV(pv), 'ciel', 'Suivant depuis l’accueil');
  vrai(await pv.$eval(`${ZV} [data-pv="suivant"]`, (b) => b.disabled), 'Suivant actif sur une étape pas finie');
  vrai(await pv.$eval(`${ZV} [data-pv-aller="2"]`, (b) => b.disabled), 'étape 3 cliquable depuis l’étape 2');
  await pv.click(`${ZV} button[data-pv-point="2"]`);
  await pv.click(`${ZV} [data-pv-aller="0"]`);
  egal(await etapeV(pv), 'accueil', 'retour à l’accueil');
  await pv.click(`${ZV} [data-pv-aller="1"]`);
  egal((await xV(pv, 'ciel')).vus, [2], 'point ouvert gardé');
  vrai(!(await pv.$(`${ZV} .pv-pas.pv-fait`)), '✓ sur une étape pas finie');
  await cielJuste(pv);
  await suivant(pv);
  egal(await pv.$$eval(`${ZV} .pv-pas.pv-fait`, (L) => L.map((b) => b.dataset.pvAller)), ['1'], '✓ seulement sur la vue du ciel finie');
});

await v('Visite : enseignant — navigation libre dans les étapes', async () => {
  await monterV(pv, { role: 'prof' });
  vrai(await pv.$$eval(`${ZV} .pv-file button`, (L) => L.every((b) => !b.disabled)), 'une étape fermée à l’enseignant');
  await pv.click(`${ZV} [data-pv-aller="7"]`);
  egal(await etapeV(pv), 'adresse', 'saut à l’adresse');
});

await v('Visite : vue du ciel — les 6 points ne lancent pas les questions ; le bouton les lance ; clic à côté puis juste', async () => {
  await monterV(pv, { db: rendu(1) });
  // sur la photo, puis par la liste (une fois la photo zoomée, les autres points peuvent être hors du cadre)
  await pv.click(`${ZV} g[data-pv-point="1"]`);
  egal(await pv.$eval(`${ZV} [data-pv-drone]`, (d) => d.style.transform), 'translate(-60.363%, 0%) scale(1.62)', 'zoom sur le point 1 (800 − 1090 × 1,62 = −965,8 sur 1600 ; en haut, bordé à 0)');
  await pv.click(`${ZV} [data-pv="vueEnsemble"]`);
  egal(await pv.$eval(`${ZV} [data-pv-drone]`, (d) => d.style.transform), 'none', 'vue d’ensemble');
  for (const n of [2, 3, 4, 5, 6]) await pv.click(`${ZV} button[data-pv-point="${n}"]`);
  vrai(!(await pv.$(`${ZV} .pv-vise`)), 'photo en mode question avant le bouton');
  vrai(!(await pv.$(`${ZV} [data-pv-q]`)), 'questions affichées avant le bouton');
  vrai((await texteV(pv, '[data-pv-consigne]')).includes('Passer aux 3 questions'), 'consigne du bouton');
  egal(await jalonsV(pv), TOUT_ATTENTE, 'jalons après les 6 points');
  await pv.click(`${ZV} [data-pv="questions"]`);
  vrai(!(await pv.$(`${ZV} g[data-pv-point]`)), 'points encore sur la photo pendant les questions');
  await clicPhoto(pv, 100, 100);
  egal(await msgV(pv), 'Pas ici. Relis le point « Parking poids lourds », dans la liste à gauche.', 'message faux (le nom du point, pas son numéro)');
  egal((await jalonsV(pv))[0], 'ko', 'jalon après le clic faux');
  await clicPhoto(pv, 1000, 560);
  egal(await msgV(pv), 'Oui, c’est bien ici.', 'message juste');
  egal((await jalonsV(pv))[0], 'ok', 'jalon après le bon clic');
  egal((await premiersV(pv))['ciel-camions'], 'ko', 'premier coup');
  // passage piétons : les deux zones comptent
  await clicPhoto(pv, 100, 500);
  egal((await jalonsV(pv))[1], 'ok', 'piétons, seconde zone');
  await monterV(pv, { db: rendu(1, { ciel: { vus: [1, 2, 3, 4, 5, 6], q: true, rep: { camions: true }, essais: { camions: 1 } } }) });
  await clicPhoto(pv, 400, 575);
  egal((await jalonsV(pv))[1], 'ok', 'piétons, première zone');
});

await v('Visite : quiz — une lisse cliquée sur la lisse juste, sur l’allée faux ; « (2 essais) »', async () => {
  await monterV(pv, { db: rendu(5) });
  await clicPhoto(pv, 300, 500);
  egal(await msgV(pv), 'Oui : c’est une échelle.', 'échelle');
  await clicPhoto(pv, 800, 1600);
  egal(await msgV(pv), 'Non, pas ici. Une lisse est la barre horizontale sous la palette : la palette pose dessus.', 'lisse sur l’allée');
  egal((await jalonsV(pv)).slice(9, 11), ['ok', 'ko'], 'jalons échelle, lisse');
  await clicPhoto(pv, 700, 120);
  egal(await msgV(pv), 'Oui : c’est une lisse qui porte une palette filmée.', 'lisse');
  vrai((await texteV(pv, '[data-pv-q="lisse"]')).includes('(2 essais)'), 'essais de la lisse');
  egal((await jalonsV(pv)).slice(9, 11), ['ok', 'ok'], 'jalons après la lisse');
});

// Retours 5.3, A1 (docs/briefs/SMOBY-retours-5.3.md) : des bonnes réponses étaient refusées (une seule zone par
// élément). Clics relevés au parcours élève : échelle du fond (760, 900), lisse de gauche (100, 560), palette filmée
// en haut à gauche (100, 300). La lisse des fûts bleus (800, 400), sans palette filmée, ne compte pas ; le mur du
// fond (1000, 900) n'est rien.
await v('Visite : quiz — les bonnes réponses relevées au parcours élève sont justes ; fûts bleus et mur du fond faux, avec l’aide', async () => {
  await monterV(pv, { db: rendu(5) });
  vrai((await texteV(pv, '[data-pv-consigne]')).endsWith('Sur cette photo d’un autre entrepôt, clique sur une échelle.'), 'consigne au tu');
  await clicPhoto(pv, 1000, 900);
  egal(await msgV(pv), 'Non, pas ici. Une échelle est un montant vertical percé de trous, relié à un autre par des barres en diagonale.', 'mur du fond, échelle');
  await clicPhoto(pv, 760, 900);
  egal(await msgV(pv), 'Oui : c’est une échelle.', 'échelle du fond');
  await clicPhoto(pv, 800, 400);
  egal(await msgV(pv), 'Non, pas ici. Une lisse est la barre horizontale sous la palette : la palette pose dessus.', 'lisse des fûts bleus');
  await clicPhoto(pv, 1000, 900);
  egal((await jalonsV(pv)).slice(9, 13), ['ok', 'ko', 'attente', 'attente'], 'jalons après les faux (échelle trouvée, lisse pas encore)');
  await clicPhoto(pv, 100, 560);
  egal(await msgV(pv), 'Oui : c’est une lisse qui porte une palette filmée.', 'lisse de gauche');
  await clicPhoto(pv, 1000, 900);
  egal(await msgV(pv), 'Non, pas ici. Cherche des cartons ou des seaux entourés de film plastique.', 'mur du fond, palette');
  await clicPhoto(pv, 100, 300);
  egal(await msgV(pv), 'Oui : c’est une palette filmée.', 'palette en haut à gauche');
  await clicPhoto(pv, 1000, 900);
  egal(await msgV(pv), 'Non, pas ici. L’allée est le couloir au sol, entre les racks.', 'mur du fond, allée');
  await clicPhoto(pv, 300, 1450);
  egal((await jalonsV(pv)).slice(9, 13), ['ok', 'ok', 'ok', 'ok'], 'les 4 éléments');
});

// Retours 5.3, A2 et A3 : « Travée » entre deux échelles, « Croisillons » sur une diagonale ; échelle et lisse
// définies sans couleur (la couleur change d'une photo à l'autre), dans l'étape et dans le lexique.
await v('Visite : mots du rack — points 7 et 8 à leur place, définitions d’échelle et de lisse sans couleur', async () => {
  await monterV(pv, { db: rendu(4) });
  const pos = await pv.$$eval(`${ZV} g[data-pv-point] circle`, (L) => L.map((c) => [c.closest('g').dataset.pvPoint, +c.getAttribute('cx'), +c.getAttribute('cy')]));
  const de = (n) => pos.filter((p) => p[0] === String(n)).map((p) => [p[1], p[2]])[0];
  egal([de(7), de(8)], [[330, 330], [1100, 420]], 'points 7 (Travée) et 8 (Croisillons)');
  await pv.click(`${ZV} button[data-pv-point="1"]`);
  egal(await texteV(pv, '.pv-def'), 'Le montant vertical, percé de trous, qui porte les lisses. Deux échelles délimitent une travée.', 'échelle');
  await pv.click(`${ZV} button[data-pv-point="2"]`);
  egal(await texteV(pv, '.pv-def'), 'La barre horizontale sur laquelle on pose les palettes. Sa charge maximale est écrite sur une plaque.', 'lisse');
});

await v('Visite : travée — 4 coins dans le désordre ; coins du bas trop hauts ; enlever un point ; 5e clic sans effet', async () => {
  await monterV(pv, { db: rendu(6) });
  await coins(pv, [[876, 1173], [287, 45], [258, 1175], [847, 47]]);
  await pv.click(`${ZV} [data-pv="verifierCoins"]`);
  vrai(!!(await pv.$(`${ZV} [data-pv-coins-ok]`)), 'coins justes dans le désordre');
  egal((await jalonsV(pv))[13], 'ok', 'jalon des coins');
  vrai(!!(await pv.$(`${ZV} [data-pv-correction]`)), 'correction légendée');
  await monterV(pv, { db: rendu(6) });
  await coins(pv, [[287, 45], [847, 47], [258, 1050], [876, 1050]]);
  await clicPhoto(pv, 550, 600);
  egal(await pv.$$eval(`${ZV} [data-pv-pose]`, (L) => L.length), 4, '5e clic');
  await pv.click(`${ZV} [data-pv="verifierCoins"]`);
  egal(await msgV(pv), 'Pas encore : coins en bas à gauche, en bas à droite. Un coin se place là où une échelle touche le sol ou s’arrête en haut. Clique le point rouge pour l’enlever.', 'message');
  egal(await pv.$$eval(`${ZV} [data-pv-coin]`, (L) => L.map((e) => e.dataset.ok)), ['true', 'true', 'false', 'false'], 'coins jugés');
  egal(await pv.$$eval(`${ZV} [data-pv-pose]`, (L) => L.map((g) => g.dataset.faux)), ['false', 'false', 'true', 'true'], 'seuls les coins du bas en rouge');
  egal((await jalonsV(pv))[13], 'ko', 'jalon après un Vérifier faux');
  await clicPhoto(pv, 258, 1050);
  egal(await pv.$$eval(`${ZV} [data-pv-pose]`, (L) => L.length), 3, 'point enlevé');
  egal((await xV(pv, 'travee')).pts.length, 3, 'état après l’enlèvement');
});

await v('Visite : travée — tolérance 80 (79 juste, 81 faux, écrits dans la base)', async () => {
  const essai = async (d) => {
    await monterV(pv, { db: rendu(6, { travee: { pts: [[287 + d, 45], [847, 47], [258, 1175], [876, 1173]] } }) });
    await pv.click(`${ZV} [data-pv="verifierCoins"]`);
    return (await jalonsV(pv))[13];
  };
  egal(await essai(79), 'ok', 'à 79');
  egal(await essai(81), 'ko', 'à 81');
});

await v('Visite : lisses — fond, travée d’à côté, pas une lisse, déjà trouvée (pas compté) ; sans faute = premier coup', async () => {
  const delimitee = { travee: { pts: COINS_JUSTES, ok: true, verifie: true, verifs: 1, faux: [] } };
  await monterV(pv, { db: rendu(6, delimitee) });
  await clicPhoto(pv, 570, 80);
  egal(await msgV(pv), 'Oui : c’est la lisse du haut.', 'lisse du haut');
  await clicPhoto(pv, 570, 160);
  egal(await msgV(pv), 'Cette barre est au fond, sur le rack de derrière. Cherche les lisses accrochées aux échelles de devant.', 'fond');
  await clicPhoto(pv, 950, 450);
  egal(await msgV(pv), 'C’est bien une lisse, mais celle de la travée d’à côté. Reste entre les deux échelles de ta travée.', 'travée d’à côté');
  await clicPhoto(pv, 570, 600);
  egal(await msgV(pv), 'Ici, ce n’est pas une lisse. Une lisse est une barre horizontale orange, entre les deux échelles.', 'pas une lisse');
  await clicPhoto(pv, 570, 80);
  egal(await msgV(pv), 'Celle-ci est déjà trouvée.', 'déjà trouvée');
  const x = await xV(pv, 'travee');
  egal([x.cibles, x.fauxCibles], [[0], 3], 'cibles et clics faux (le re-clic ne compte pas)');
  egal((await jalonsV(pv))[14], 'ko', 'jalon des lisses en cours, après des fautes');
  await monterV(pv, { db: rendu(6, delimitee) });
  await clicPhoto(pv, 570, 80); await clicPhoto(pv, 570, 454);
  egal((await jalonsV(pv))[14], 'attente', 'deux lisses sans faute : encore en attente');
  await clicPhoto(pv, 570, 687);
  egal((await jalonsV(pv))[14], 'ok', 'trois lisses');
  egal((await premiersV(pv))['travee-cibles'], 'ok', 'premier coup');
  vrai(!(await pv.$(`${ZV} .pv-vise`)), 'photo encore cliquable une fois l’étape finie');
});

await v('Visite : adresse — travée et niveau inversés, puis retrouver (côté, niveau, trouvé, rien de montré avant)', async () => {
  await monterV(pv, { db: rendu(7) });
  vrai(await pv.$eval(`${ZV} [data-pv="valider"]`, (b) => b.disabled), 'Valider actif sans les 4 choix');
  await choisirV(pv, ['allée et côté', 'niveau', 'travée', 'emplacement']);
  await pv.click(`${ZV} [data-pv="valider"]`);
  egal((await jalonsV(pv))[15], 'ko', 'jalon décomposer');
  egal(await pv.$$eval(`${ZV} [data-pv-part]`, (L) => L.map((e) => e.dataset.ok)), ['true', 'false', 'false', 'true'], 'correction affichée');
  vrai((await texteV(pv, '[data-pv-part="1"]')).includes('(vous : niveau)'), 'ce que l’élève a choisi');
  vrai(!(await pv.$(`${ZV} [data-pv-choix]`)), 'second essai de la décomposition');
  await pv.click(`${ZV} [data-pe-trav="A2-T03"]`);
  egal(await pv.$$eval(`${ZV} .pe-cible`, (L) => L.filter((r) => r.getAttribute('stroke') !== 'transparent').length), 0, 'surbrillance avant le clic juste');
  await pv.hover(`${ZV} [data-pe-emp="A2-T03-N2-E1"]`);
  egal(await pv.$$eval(`${ZV} [data-pv-barre] .pe-case b`, (L) => L.map((b) => b.textContent)), ['A2', 'T03', 'N2', 'E1'], 'barre au survol');
  await pv.click(`${ZV} [data-pe-emp="A2-T03-N2-E1"]`);
  egal(await msgV(pv), '✗ A2-T03-N2-E1 : le côté (vous êtes en A2, il faut A1). Revenez au plan.', 'côté faux');
  await pv.click(`${ZV} [data-pv="retour"]`);
  await pv.click(`${ZV} [data-pe-trav="A1-T03"]`);
  await pv.click(`${ZV} [data-pe-emp="A1-T03-N3-E1"]`);
  egal(await msgV(pv), '✗ A1-T03-N3-E1 : le niveau (N3 au lieu de N2 — le sol est N1).', 'niveau faux');
  vrai(!(await pv.$(`${ZV} .pe-marque`)), 'cible montrée avant d’être trouvée');
  await pv.click(`${ZV} [data-pe-emp="A1-T03-N2-E1"]`);
  egal(await msgV(pv), '✓ Trouvé : A1-T03-N2-E1 — une Maison Neo Jura Lodge de 420 kg.', 'trouvé');
  egal(await pv.$$eval(`${ZV} .pe-marque`, (L) => L.map((g) => g.dataset.peEmp)), ['A1-T03-N2-E1'], 'seul l’emplacement trouvé est marqué');
  await pv.click(`${ZV} [data-pe-emp="A1-T03-N1-E1"]`);
  egal((await xV(pv, 'adresse')).clics.length, 3, 'un clic après « Trouvé » ne compte plus');
  egal((await jalonsV(pv)).slice(15), ['ko', 'ok'], 'jalons de l’adresse');
  egal((await premiersV(pv))['adresse-retrouver'], 'ko', 'premier coup de l’emplacement');
  vrai(!(await pv.$eval(`${ZV} [data-pv="suivant"]`, (b) => b.disabled)), 'Suivant une fois l’adresse finie');
});

await v('Visite : le message « Trouvé » lit la désignation et le poids dans le stock (sabotage du stock)', async () => {
  await monterV(pv, { db: rendu(7, { adresse: { choix: SENS_JUSTES, valide: true } }), sabotage: 'stock' });
  await pv.click(`${ZV} [data-pe-trav="A1-T03"]`);
  await pv.click(`${ZV} [data-pe-emp="A1-T03-N2-E1"]`);
  egal(await msgV(pv), '✓ Trouvé : A1-T03-N2-E1 — une Établi Black+Decker de 290 kg.', 'message lu dans le stock saboté');
});

await v('Visite : parcours — ordre imposé, photo en onglet (Échap), deux images aux litiges, trace = celle de la maquette', async () => {
  await monterV(pv, { db: rendu(2) });
  egal(await pv.$eval(`${ZV} [data-pv-trace]`, (e) => e.getAttribute('points')),
    '410,505 680,505 680,400 680,505 220,505 155,505 155,410 155,505 553,505 553,92 553,189', 'trace (allée principale décalée de 80 vers la gauche, étape 4 de 80 vers le bas : demandes de Tristan)');
  vrai(!(await pv.$(`${ZV} [data-pe-trav]`)), 'travées cliquables pendant le parcours');
  await pv.click(`${ZV} g[data-pv-etape="3"]`);
  egal(await msgV(pv), 'Dans l’ordre : l’étape suivante est la n° 1.', 'ordre');
  vrai(!(await pv.$(`${ZV} [data-pv-img]`)), 'photo ouverte hors de l’ordre');
  await pv.click(`${ZV} g[data-pv-etape="1"]`);
  egal(await pv.$$eval(`${ZV} [data-pv-img]`, (L) => L.map((i) => i.dataset.pvImg)), ['quaiInt'], 'photo du quai');
  vrai((await texteV(pv, '.pe-fil')).includes('1. Le quai'), 'fil');
  await pv.keyboard.press('Escape');
  vrai(!!(await pv.$(`${ZV} [data-pv-trace]`)), 'Échap revient au plan');
  vrai(!!(await pv.$(`${ZV} [data-pv="revoir"]`)), 'Revoir la photo');
  for (const n of [2, 3, 4, 5]) {
    if (await pv.$(`${ZV} [data-pv="retour"]`)) await pv.click(`${ZV} [data-pv="retour"]`);
    await pv.click(`${ZV} g[data-pv-etape="${n}"]`);
  }
  egal(await pv.$$eval(`${ZV} [data-pv-img]`, (L) => L.map((i) => i.dataset.pvImg)), ['litiges', 'litigesDessin'], 'deux images aux litiges');
  egal(await pv.$$eval(`${ZV} .pv-mention`, (L) => L.length), 2, 'une mention par image');
  vrai(await pv.$eval(`${ZV} [data-pv="suivant"]`, (b) => b.disabled), 'Suivant avant la 6e étape');
  egal(await jalonsV(pv), TOUT_ATTENTE, 'le parcours ne donne pas de jalon');
});

await v('Visite : « Où est-ce ? » — plan à gauche (numéros seuls), une photo à droite ; faux : on reste ; juste : photo suivante', async () => {
  await monterV(pv, { db: rendu(3) });
  egal(await pv.$$eval(`${ZV} [data-pv-num]`, (L) => L.map((g) => g.dataset.pvNum)), ['1', '2', '3', '4', '5', '6'], 'numéros sur le plan');
  vrai(!(await pv.$(`${ZV} [data-pv-trace]`)), 'trace du parcours sur le plan');
  vrai(!(await pv.$(`${ZV} [data-pe-trav]`)), 'travées cliquables');
  egal(await pv.$eval(`${ZV} [data-pv-photo] img`, (i) => i.dataset.pvImg), 'allee', 'première photo');
  egal(await jalonsV(pv).then((J) => J.slice(3, 9)), Array(6).fill('attente'), 'jalons avant tout clic');
  await pv.click(`${ZV} [data-pv-num="2"]`);
  egal(await msgV(pv), 'Non, pas depuis le n° 2. Regarde bien la photo, ou revois le parcours.', 'faux');
  egal(await pv.$eval(`${ZV} [data-pv-photo] img`, (i) => i.dataset.pvImg), 'allee', 'la photo reste après un faux');
  egal((await jalonsV(pv))[3], 'ko', 'jalon après le faux');
  await pv.click(`${ZV} [data-pv-num="4"]`);
  egal(await msgV(pv), 'Oui : n° 4, Les allées de stockage.', 'juste');
  egal(await pv.$eval(`${ZV} [data-pv-photo] img`, (i) => i.dataset.pvImg), 'quaiInt', 'photo suivante');
  egal(await pv.$eval(`${ZV} [data-pv-num="4"] circle`, (c) => c.getAttribute('fill')), 'var(--pe-visite)', 'numéro trouvé rempli');
  vrai(await pv.$eval(`${ZV} [data-pv="suivant"]`, (b) => b.disabled), 'Suivant avant la fin');
  for (const n of ASSOCIER.slice(1)) await pv.click(`${ZV} [data-pv-num="${n}"]`);
  egal(await jalonsV(pv).then((J) => J.slice(3, 9)), Array(6).fill('ok'), 'jalons des 6 photos (le faux ne fait pas perdre le jalon)');
  egal((await premiersV(pv))['reperer-allee'], 'ko', 'premier coup de la photo ratée une fois');
  egal((await premiersV(pv))['reperer-quai'], 'ok', 'premier coup');
  vrai(!(await pv.$eval(`${ZV} [data-pv="suivant"]`, (b) => b.disabled)), 'Suivant une fois les 6 photos associées');
  await pv.click(`${ZV} [data-pv-num="1"]`);
  egal((await xV(pv, 'reperer')).essais.allee, 2, 'un clic après la fin ne compte plus');
});

await v('Visite : mots du rack — un mot ouvert à la fois (sa définition seule), les autres refermés', async () => {
  await monterV(pv, { db: rendu(4) });
  await pv.click(`${ZV} button[data-pv-point="1"]`);
  await pv.click(`${ZV} button[data-pv-point="2"]`);
  egal(await pv.$$eval(`${ZV} .pv-def`, (L) => L.map((d) => d.closest('[data-pv-point]').dataset.pvPoint)), ['2'], 'définitions ouvertes');
  egal(await pv.$$eval(`${ZV} [data-pv-bulle]`, (L) => L.map((t) => t.dataset.pvBulle)), ['2'], 'étiquette sur la photo');
  egal((await xV(pv, 'mots')).vus, [1, 2], 'mots vus');
});

await v('Visite : inaction 0 / 17 ; toute la découverte sans répondre (points, bouton des questions, parcours, mots) : 0 / 17', async () => {
  await monterV(pv);
  egal(await jalonsV(pv), TOUT_ATTENTE, 'séance ouverte puis rien');
  await suivant(pv);
  for (const n of [1, 2, 3, 4, 5, 6]) await pv.click(`${ZV} button[data-pv-point="${n}"]`);
  await pv.click(`${ZV} [data-pv="questions"]`);
  egal(await jalonsV(pv), TOUT_ATTENTE, 'questions lancées, pas de clic');
  await monterV(pv, { db: rendu(6, { ciel: { vus: [1, 2, 3, 4, 5, 6], q: true }, parcours: { vus: [1, 2, 3, 4, 5, 6] }, mots: { vus: [1, 2, 3, 4, 5, 6, 7, 8] } }) });
  egal(await jalonsV(pv), TOUT_ATTENTE, 'toute la découverte faite');
  egal(await pv.evaluate(async () => { const E = await import('/core/types/entrepot.js'); return E.jalonsEntrepot(window.__e.db, window.__e.P).ok; }), 0, '0 / 17');
});

await v('Visite : parcours juste de bout en bout → 17 / 17, premier coup 17 / 17, la fin', async () => {
  await monterV(pv);
  await suivant(pv); await cielJuste(pv);
  await suivant(pv); await parcoursJuste(pv);
  await suivant(pv); await associerJuste(pv);
  await suivant(pv); for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) await pv.click(`${ZV} button[data-pv-point="${n}"]`);
  await suivant(pv); await quizJuste(pv);
  await suivant(pv); await traveeJuste(pv);
  await suivant(pv); await adresseJuste(pv);
  await suivant(pv);
  egal(await etapeV(pv), 'fin', 'dernière étape');
  vrai(!(await pv.$(`${ZV} [data-pv="suivant"]`)), 'Suivant sur la fin');
  egal(await jalonsV(pv), Array(17).fill('ok'), 'jalons');
  const P = await premiersV(pv);
  egal([Object.keys(P).length, Object.values(P).filter((x) => x === 'ok').length], [17, 17], 'premier coup');
  egal(erreursV, [], 'erreurs JS');
});

await v('Visite : sabotages — chaque jalon tombe quand on casse sa règle (zone, tolérance, piège en cible, adresse)', async () => {
  await monterV(pv, { db: rendu(1, { ciel: { vus: [1, 2, 3, 4, 5, 6], q: true } }), sabotage: 'zone' });
  await clicPhoto(pv, 1000, 560);
  egal((await jalonsV(pv))[0], 'ko', 'zone décalée');
  await monterV(pv, { db: rendu(6), sabotage: 'tolerance' });
  await coins(pv, COINS_JUSTES); await pv.click(`${ZV} [data-pv="verifierCoins"]`);
  egal((await jalonsV(pv))[13], 'ko', 'tolérance à 0');
  await monterV(pv, { db: rendu(6), sabotage: 'piege' });
  await traveeJuste(pv);
  egal((await jalonsV(pv))[14], 'attente', 'piège rangé en cible');
  await monterV(pv, { db: rendu(7), sabotage: 'adresse' });
  await choisirV(pv, SENS_JUSTES); await pv.click(`${ZV} [data-pv="valider"]`);
  egal((await jalonsV(pv))[15], 'ko', 'adresse inversée');
});

await v('Visite : état retrouvé après rechargement ; deux séances ne se mélangent pas', async () => {
  await pv.evaluate(() => localStorage.removeItem('essai-visite-base'));
  await monterV(pv, { garder: true });
  await suivant(pv);
  await pv.click(`${ZV} button[data-pv-point="4"]`);
  await pv.reload();
  await pv.waitForSelector('#btnProf');
  await monterV(pv, { garder: true });
  egal(await etapeV(pv), 'ciel', 'étape retrouvée');
  egal((await xV(pv, 'ciel')).vus, [4], 'point ouvert retrouvé');
  await monterV(pv, { garder: true, id: 'autre-visite' });
  egal(await etapeV(pv), 'accueil', 'autre séance : départ neuf');
  egal(await pv.evaluate(() => Object.keys(window.__e.db.entrepots).sort()), ['autre-visite', 'smoby-visite'], 'clés');
  await pv.evaluate(() => localStorage.removeItem('essai-visite-base'));
});

await v('Visite : chaque image déclarée existe dans le dépôt, repère à la proportion du fichier (≤ 1 %)', async () => {
  const r = await pv.evaluate(async () => {
    const C = await import('/contenus/smoby-ent53.js');
    const out = {};
    for (const [k, im] of Object.entries(C.IMAGES)) {
      const i = new Image(); i.src = im.src.replace(/^\.\//, '/');
      try { await i.decode(); } catch (e) { out[k] = 'introuvable'; continue; }
      const ecart = Math.abs(i.naturalWidth / i.naturalHeight - im.repere[0] / im.repere[1]) / (im.repere[0] / im.repere[1]);
      out[k] = ecart <= 0.01 ? 'ok' : `écart ${(ecart * 100).toFixed(1)} %`;
    }
    return out;
  });
  egal(Object.keys(r).length, 10, 'nombre d’images');
  egal(Object.entries(r).filter(([, x]) => x !== 'ok'), [], 'images');
});

await v('Visite : une déclaration fautive ne se charge pas (ancre, image, type, adresse) ; pas d’évaluation', async () => {
  const r = await pv.evaluate(async () => {
    const { creerEntrepot } = await import('/core/types/entrepot.js');
    const C = await import('/contenus/smoby-ent53.js');
    const essai = (f, o) => { const P = structuredClone(C.VISITE); P.id = `x${Math.random()}`; f(P); try { creerEntrepot(P, o); return ''; } catch (e) { return e.message; } };
    const et = (P, id) => P.etapes.find((t) => t.id === id);
    return [
      essai((P) => { et(P, 'parcours').etapes[0].ancre = 'quai:QUAI 9'; }),
      essai((P) => { et(P, 'quiz').image = 'inconnue'; }),
      essai((P) => { et(P, 'quiz').type = 'carrousel'; }),
      essai((P) => { et(P, 'adresse').code = 'A1-T09-N2-E1'; }),
      essai(() => {}, { copie: true }),
      essai(() => {}),
    ];
  });
  vrai(r[0].includes('ancre inconnue'), `ancre : ${r[0]}`);
  vrai(r[1].includes('image inconnue'), `image : ${r[1]}`);
  vrai(r[2].includes('type inconnu'), `type : ${r[2]}`);
  vrai(r[3].includes('adresse inconnue'), `adresse : ${r[3]}`);
  vrai(r[4].includes('pas d'), `évaluation : ${r[4]}`);
  egal(r[5], '', 'la déclaration d’ENT-5.3');
});

await v('Visite : aucun défilement de page, chaque étape, à 1366 × 768 et 1280 × 720 (page d’essai sans ses bandeaux)', async () => {
  const pe = await ctxV.newPage();
  const err = [];
  pe.on('pageerror', (e) => err.push(e.message));
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
    await pe.setViewportSize({ width: w, height: h });
    await pe.goto(BASE + 'outils/essai-entrepot.html');
    await pe.waitForSelector('.pe');
    await pe.selectOption('#reglages select[name="role"]', 'prof');
    await pe.selectOption('#reglages select[name="cas"]', 'visite');
    await pe.waitForSelector('.pv');
    await pe.evaluate(() => { document.querySelector('#reglages').style.display = 'none'; document.querySelector('#mention').style.display = 'none'; });
    const trop = [];
    for (let k = 0; k < 9; k++) {
      await pe.click(`.pv [data-pv-aller="${k}"]`);
      await pe.evaluate(() => window.dispatchEvent(new Event('resize')));
      const d = await pe.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
      if (d > 0) trop.push(`${k + 1} (+${d} px)`);
    }
    egal(trop, [], `étapes qui défilent à ${w} × ${h}`);
  }
  egal(err, [], 'erreurs JS');
  await pe.close();
});

await ctxV.close();

/* ====================================================================== STOCKAGE DE MASSE (chantier D-5) */
// Le mode « masse » (core/types/entrepot-masse.js) sur le contenu d'essai d'ENT-6.5 (`contenus/entrepot-masse-essai.js`).
// Bonnes places et critères ÉCRITS À LA MAIN, d'après le brief ENT-6.5 §4 et §8 (position 1 = fond, niveau 1 = sol) :
//   P1 Heineken 30 L : M02 ou M06, pos. 1, niv. 1 · P2 Pelforth : M03 pos. 1 niv. 3 (sur la pile de 2) ou M03 pos. 2 niv. 1 ·
//   P3 Affligem : M02 ou M06, pos. 1, niv. 1 · P4 Edelweiss : M07 pos. 2 niv. 1.
// Et, comme le dit la remarque du brief (§4, « aucune règle de plus ») : P2 et P4 dans un couloir VIDE (M02, M06) respectent
// toutes les règles ; le moteur les accepte (il ne reste alors qu'un couloir vide pour P1 et P3).
const ctxM = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const erreursM = [];
const pm = await ctxM.newPage();
pm.setDefaultTimeout(6000);
pm.on('pageerror', (e) => erreursM.push('PAGEERROR: ' + e.message));
pm.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursM.push('CONSOLE: ' + m.text()); });
await pm.goto(BASE);
await pm.waitForSelector('#btnProf', { timeout: 8000 });

const ZM = '#pmTest .pm';
const monterM = (o = {}) => pm.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-entrepot.js');
  const C = await import('/contenus/entrepot-masse-essai.js');
  document.querySelector('#pmTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'pmTest'; document.body.appendChild(hote);
  const temps = o.temps || 'entrainement';
  const db = o.db || {};
  window.__m = { db, remis: null };
  creerEntreprise(E.univers({ temps, entrepot: C.MASSE })).rendre(hote, {
    meta: { id: 'essai-entrepot', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps, copie: temps === 'evaluation' },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null,
    rendreCopie: async (res) => { window.__m.remis = res; return { rendu: Date.now() }; },
  });
  document.querySelector('#pmTest .ent-nav[data-vue="entrepot"]').click();
}, o);
// Ce que le moteur juge, sur la base de l'élève : jalons (true / false / null = pas encore jugé), critères, places.
const jugerM = () => pm.evaluate(async () => {
  const E = await import('/core/types/entrepot.js');
  const C = await import('/contenus/entrepot-masse-essai.js');
  const J = E.jalonsEntrepot(window.__m.db, C.MASSE);
  return { ok: J.ok, L: J.L.map((l) => (l.etat ? l.ok : null)), crit: Object.fromEntries(J.L.map((l) => [l.palette, l.criteres])),
    place: Object.fromEntries(['P1', 'P2', 'P3', 'P4'].map((id) => [id, E.placeMasse(window.__m.db, C.MASSE, id)])) };
});
const presentM = async (sel) => !!(await pm.$(`${ZM} ${sel}`));
const texteM = async (sel) => ((await pm.textContent(`${ZM} ${sel}`)) || '').replace(/\s+/g, ' ').trim();
// Poser une palette : la prendre (sa carte), ouvrir le couloir sur le plan, cliquer la place (position) dans le couloir.
async function poserM(id, c, p) {
  await pm.click(`${ZM} .pm-cartes [data-pm-pal="${id}"]`);
  if (await presentM('[data-pm="retour"]')) await pm.click(`${ZM} [data-pm="retour"]`);
  await pm.click(`${ZM} [data-pm-couloir="${c}"] .pm-sol`);
  await pm.click(`${ZM} [data-pm-place="${p}"]`);
  await pm.click(`${ZM} [data-pm="retour"]`);
}
async function validerM() {
  await pm.click(`${ZM} [data-pm="valider"]`);
  await pm.click(`${ZM} [data-pm="oui"]`);
}

await v('Masse : bonnes places calculées par le moteur (écrites à la main ici)', async () => {
  const B = await pm.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/entrepot-masse-essai.js');
    return E.bonnesReponses(C.MASSE);
  });
  egal(B, {
    P1: ['M02 · position 1 · niveau 1', 'M06 · position 1 · niveau 1'],
    P2: ['M02 · position 1 · niveau 1', 'M03 · position 1 · niveau 3', 'M03 · position 2 · niveau 1', 'M06 · position 1 · niveau 1'],
    P3: ['M02 · position 1 · niveau 1', 'M06 · position 1 · niveau 1'],
    P4: ['M02 · position 1 · niveau 1', 'M06 · position 1 · niveau 1', 'M07 · position 2 · niveau 1'],
  });
});

await v('Masse : chaque piège nomme son critère, et lui seul (fautes jugées sur le stock de départ)', async () => {
  const r = await pm.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/entrepot-masse-essai.js');
    const f = (id, c, p) => E.fautesMasse(C.MASSE, { pos: { [id]: { c, p } }, ordre: [id] }, id);
    return {
      p1Devant: f('P1', 'M01', 2), p1Sur: f('P1', 'M01', 1), p1Pos4: f('P1', 'M02', 4),
      p2M04: f('P2', 'M04', 2), p2M05: f('P2', 'M05', 2), p3Devant: f('P3', 'M05', 2), p3Sur: f('P3', 'M05', 1),
      p4Sur3: f('P4', 'M07', 1), p4Vides: f('P4', 'M08', 3), p4Juste: f('P4', 'M07', 2), nonPosee: E.fautesMasse(C.MASSE, {}, 'P1'),
    };
  });
  egal(r.p1Devant, ['un seul lot par couloir'], 'P1 en M01 devant le S20');
  egal(r.p1Sur, ['un seul lot par couloir', 'hauteur de gerbage'], 'P1 sur la pile de 2 de M01 (30 L : 2 au plus)');
  egal(r.p1Pos4, ['par le fond'], 'P1 en M02 position 4');
  egal(r.p2M04, ['un seul lot par couloir'], 'P2 en M04 (lot S19)');
  egal(r.p2M05, ['une seule référence', 'un seul lot par couloir'], 'P2 en M05 (Affligem S18)');
  egal(r.p3Devant, ['un seul lot par couloir'], 'P3 devant le S18');
  egal(r.p3Sur, ['un seul lot par couloir'], 'P3 sur le S18');
  egal(r.p4Sur3, ['hauteur de gerbage'], 'P4 sur la pile de 3 de M07');
  egal(r.p4Vides, ['couloir VIDES'], 'P4 dans le couloir VIDES : le couloir réservé arrête les autres critères');
  egal(r.p4Juste, [], 'P4 en M07 position 2');
  egal(r.nonPosee, null, 'palette non posée');
});

await v('Masse : rien n’est jugé avant la validation ; inaction = « Valider » fermé, 0 jalon', async () => {
  await monterM();
  egal((await jugerM()).L, [null, null, null, null], 'jalons avant tout geste');
  vrai(await pm.$eval(`${ZM} [data-pm="valider"]`, (b) => b.disabled), '« Valider mon rangement » fermé tant que tout n’est pas posé');
  await poserM('P1', 'M02', 1);
  egal((await jugerM()).L, [null, null, null, null], 'une palette posée (juste) : toujours rien de jugé');
  vrai(await pm.$eval(`${ZM} [data-pm="valider"]`, (b) => b.disabled), 'trois palettes restent');
  egal((await jugerM()).ok, 0, 'aucun jalon juste');
});

await v('Masse : parcours juste (P1 M02, P2 sur la pile de M03, P3 M06, P4 M07 pos. 2) → 4 / 4, rangement figé, bilan ✓', async () => {
  await monterM();
  await poserM('P1', 'M02', 1);
  await poserM('P2', 'M03', 1);
  await poserM('P3', 'M06', 1);
  await poserM('P4', 'M07', 2);
  const avant = await jugerM();
  egal(avant.place, { P1: { couloir: 'M02', position: 1, niveau: 1 }, P2: { couloir: 'M03', position: 1, niveau: 3 },
    P3: { couloir: 'M06', position: 1, niveau: 1 }, P4: { couloir: 'M07', position: 2, niveau: 1 } }, 'places lues pour la fiche (placeMasse)');
  egal(avant.L, [null, null, null, null], 'pas jugé avant la validation');
  await validerM();
  const J = await jugerM();
  egal(J.L, [true, true, true, true], 'jalons');
  egal(await pm.$$eval(`${ZM} [data-pm-verd]`, (L) => L.map((d) => `${d.dataset.pmVerd} ${d.textContent.replace(/\s+/g, ' ').trim()}`)),
    ['P1 ✓ bien rangée', 'P2 ✓ bien rangée', 'P3 ✓ bien rangée', 'P4 ✓ bien rangée'], 'bilan, dans chaque carte');
  vrai(await pm.$eval(`${ZM} .pm-cartes [data-pm-pal="P1"]`, (b) => b.disabled), 'cartes fermées après la validation');
  vrai(!(await presentM('[data-pm-couloir][tabindex]')), 'couloirs plus cliquables');
  vrai(/validé/.test(await texteM('[data-pm-consigne]')), 'la consigne dit que le rangement est validé');
});

await v('Masse : sur le plan, aucune étiquette de pile n’en recouvre une autre (P2 haute en M03 à côté de P1 basse en M02)', async () => {
  // Suite du cas précédent : le rangement juste est validé, le plan est affiché.
  const R = await pm.$$eval(`${ZM} .pm-svg g[pointer-events="none"] rect`, (L) => L.map((r) => r.getBoundingClientRect()).map((b) => [b.left, b.top, b.right, b.bottom]));
  vrai(R.length >= 8, `étiquettes trouvées : ${R.length}`);
  const touche = (a, b) => a[0] < b[2] - 1 && b[0] < a[2] - 1 && a[1] < b[3] - 1 && b[1] < a[3] - 1;
  const paires = [];
  R.forEach((a, i) => R.slice(i + 1).forEach((b, j) => { if (touche(a, b)) paires.push(`${i}-${i + 1 + j}`); }));
  egal(paires, [], 'étiquettes qui se recouvrent');
});

await v('Masse : variante juste (P1 M06, P3 M02, P2 M03 pos. 2) → 4 / 4', async () => {
  await monterM();
  await poserM('P1', 'M06', 1);
  await poserM('P3', 'M02', 1);
  await poserM('P2', 'M03', 2);
  await poserM('P4', 'M07', 2);
  await validerM();
  egal((await jugerM()).L, [true, true, true, true]);
});

await v('Masse : rangement faux — le bilan nomme le critère, jamais la bonne place ; jugé dans l’ordre de pose', async () => {
  await monterM();
  await poserM('P1', 'M01', 2);         // devant le S20
  await poserM('P2', 'M02', 1);         // couloir vide : juste
  await poserM('P3', 'M02', 2);         // devant P2, posée après elle : c'est P3 qui casse la règle
  await poserM('P4', 'M08', 3);         // couloir VIDES
  await validerM();
  const J = await jugerM();
  egal(J.L, [false, true, false, false], 'jalons');
  egal(J.crit, { P1: ['un seul lot par couloir'], P2: [], P3: ['une seule référence'], P4: ['couloir VIDES'] }, 'critères');
  const B = await pm.$$eval(`${ZM} [data-pm-verd]`, (L) => L.map((d) => d.textContent.replace(/\s+/g, ' ').trim()));
  egal(B, ['✗ critère : un seul lot par couloir', '✓ bien rangée', '✗ critère : une seule référence', '✗ critère : couloir VIDES'], 'bilan');
  vrai(!/M0\d|position|niveau/.test(B.join(' ')), 'le bilan ne donne aucune place');
});

await v('Masse : gestes impossibles — derrière une pile, hors de portée, reprendre une palette bloquée', async () => {
  await monterM();
  // M01 : la pile de 2 du stock est en position 1 ; avec P1 en main, on pose sur elle ou devant, jamais derrière.
  await pm.click(`${ZM} .pm-cartes [data-pm-pal="P1"]`);
  await pm.click(`${ZM} [data-pm-couloir="M01"] .pm-sol`);
  egal(await pm.$$eval(`${ZM} [data-pm-place]`, (L) => L.map((g) => g.dataset.pmPlace)), ['1', '2', '3', '4'], 'places de M01 (sur la pile, puis devant)');
  await pm.click(`${ZM} [data-pm="retour"]`);
  await pm.click(`${ZM} .pm-cartes [data-pm-pal="P1"]`);   // la reposer en réception
  // M07 : la pile de 3, puis P4 dessus (4e niveau, accepté) ; ensuite plus rien sur cette pile (portée : 4).
  await poserM('P4', 'M07', 1);
  egal((await jugerM()).place.P4, { couloir: 'M07', position: 1, niveau: 4 }, 'P4 posée au 4e niveau (accepté, jugé à la validation)');
  await pm.click(`${ZM} .pm-cartes [data-pm-pal="P2"]`);
  await pm.click(`${ZM} [data-pm-couloir="M07"] .pm-sol`);
  egal(await pm.$$eval(`${ZM} [data-pm-place]`, (L) => L.map((g) => g.dataset.pmPlace)), ['2', '3', '4'], 'pile de 4 : hors de portée');
  await pm.click(`${ZM} [data-pm="retour"]`);
  await pm.click(`${ZM} .pm-cartes [data-pm-pal="P2"]`);
  // Reprendre : P1 en M02 pos. 1, P3 devant elle en pos. 2 → P1 bloquée ; P3 se reprend.
  await poserM('P1', 'M02', 1);
  await poserM('P3', 'M02', 2);
  await pm.click(`${ZM} .pm-cartes [data-pm-pal="P1"]`);
  vrai(/Impossible de la reprendre : une autre palette la bloque/.test(await texteM('[data-pm-msg]')), 'message de blocage');
  egal((await jugerM()).place.P1, { couloir: 'M02', position: 1, niveau: 1 }, 'P1 reste posée');
  await pm.click(`${ZM} .pm-cartes [data-pm-pal="P3"]`);
  egal((await jugerM()).place.P3, null, 'P3 reprise (rien devant elle)');
  const e = await pm.evaluate(() => window.__m.db.entrepots['essai-masse']);
  egal(e.ordre, ['P4', 'P1'], 'ordre de pose : P3 en est sortie');
});

await v('Masse : couloir ouvert — places possibles en boîtes, « inaccessible » derrière une pile, la palette posée tombe', async () => {
  await monterM();
  await pm.click(`${ZM} .pm-cartes [data-pm-pal="P2"]`);
  await pm.click(`${ZM} [data-pm-couloir="M03"] .pm-sol`);
  egal(await pm.$$eval(`${ZM} [data-pm-place] text`, (L) => L.map((t) => t.textContent)), ['P2 ici · niv. 3', 'P2 ici · niv. 1', 'P2 ici · niv. 1', 'P2 ici · niv. 1'], 'textes des boîtes');
  await pm.click(`${ZM} [data-pm-place="2"]`);
  vrai(await presentM('[data-pm-posee="P2"].pm-tombe'), 'la palette posée tombe');
  await pm.click(`${ZM} [data-pm="retour"]`);
  await poserM('P4', 'M03', 3);
  await pm.click(`${ZM} .pm-cartes [data-pm-pal="P1"]`);
  await pm.click(`${ZM} [data-pm-couloir="M03"] .pm-sol`);
  egal(await pm.$$eval(`${ZM} .pm-svg text`, (L) => L.filter((t) => /inaccessible/.test(t.textContent)).length), 2, 'positions 1 et 2 inaccessibles (P4 devant)');
  egal(await pm.$$eval(`${ZM} [data-pm-place]`, (L) => L.map((g) => g.dataset.pmPlace)), ['3', '4'], 'aucune place derrière la pile de P4');
  vrai(/Couloir M03 en 3D — Pelforth 20 L \+ Edelweiss 20 L · lot S24/.test(await texteM('.pm-fil')), 'le fil décrit le couloir');
  await pm.keyboard.press('Escape');
  vrai(!(await presentM('[data-pm="retour"]')), 'Échap ramène au plan');
});

await v('Masse : évaluation — pas de règles ni de bilan, copie rendue avec la note et les places', async () => {
  await monterM({ temps: 'evaluation' });
  vrai(!(await presentM('[data-pe-regles]')), 'pas de « Les règles » en évaluation');
  await poserM('P1', 'M02', 1);
  await poserM('P2', 'M04', 2);
  await poserM('P3', 'M06', 1);
  await poserM('P4', 'M07', 2);
  egal(await texteM('[data-pm="valider"]'), 'Rendre mon travail', 'bouton');
  await validerM();
  await pm.waitForFunction(() => window.__m.remis);
  const R = await pm.evaluate(() => window.__m.remis);
  egal([R.score, R.max], [15, 20], 'note : 3 jalons sur 4');
  egal(R.detail.entrepot.jalons.map((j) => [j.ok, j.adresse]), [[true, 'M02 · position 1 · niveau 1'], [false, 'M04 · position 2 · niveau 1'],
    [true, 'M06 · position 1 · niveau 1'], [true, 'M07 · position 2 · niveau 1']], 'détail');
  vrai(!(await presentM('[data-pm-verd]')), 'aucun bilan à l’élève');
});

await v('Masse : enseignant — bonnes places dans un encadré ; élève — rien', async () => {
  await monterM({ role: 'prof' });
  vrai(/P4 : .*M07 · position 2 · niveau 1/.test(await texteM('.pe-prof')), 'bonnes places côté enseignant');
  await monterM();
  vrai(!(await presentM('.pe-prof')), 'rien côté élève');
});

await v('Masse : déclaration fautive refusée au chargement, avec un message clair', async () => {
  const r = await pm.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/entrepot-masse-essai.js');
    const copie = () => JSON.parse(JSON.stringify(C.MASSE));
    const essai = (f) => { const x = copie(); f(x); try { E.creerEntrepot(x); return ''; } catch (e) { return e.message; } };
    return {
      bon: essai(() => {}),
      couloir: essai((x) => { x.stock.M09 = [[{ ref: 'HEI30', lot: 'S20' }]]; }),
      lot: essai((x) => { x.palettes[0].lot = 'S99'; }),
      ref: essai((x) => { x.palettes[0].ref = 'XXX'; }),
      crit: essai((x) => { x.criteres.push({ type: 'parcours' }); }),
      hauteur: essai((x) => { delete x.hauteurs['20 L']; }),
      portee: essai((x) => { x.stock.M07 = [[1, 2, 3, 4, 5].map(() => ({ ref: 'EDW20', lot: 'S24' }))]; }),
      reserve: essai((x) => { x.plan.couloirs[7].reserve = 'froid'; }),
    };
  });
  egal(r.bon, '', 'le contenu d’essai se charge');
  vrai(/couloir inconnu : M09/.test(r.couloir), r.couloir);
  vrai(/lot inconnu « S99 »/.test(r.lot), r.lot);
  vrai(/référence inconnue \(XXX\)/.test(r.ref), r.ref);
  vrai(/critère de type inconnu : parcours/.test(r.crit), r.crit);
  vrai(/pas de hauteur de gerbage pour le format « 20 L »/.test(r.hauteur), r.hauteur);
  vrai(/plus haut que la portée du chariot/.test(r.portee), r.portee);
  vrai(/réserve inconnue « froid »/.test(r.reserve), r.reserve);
});

await v('Masse : la page d’essai tient en 1366 × 768 et 1280 × 720 sans défiler (plan et couloir ouvert)', async () => {
  const pe = await ctxM.newPage();
  const err = [];
  pe.on('pageerror', (e) => err.push(e.message));
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
    await pe.setViewportSize({ width: w, height: h });
    await pe.goto(BASE + 'outils/essai-entrepot.html');
    await pe.waitForSelector('.pe');
    await pe.selectOption('#reglages select[name="cas"]', 'masse');
    await pe.waitForSelector('.pm');
    await pe.evaluate(() => { document.querySelector('#reglages').style.display = 'none'; document.querySelector('#mention').style.display = 'none'; window.dispatchEvent(new Event('resize')); });
    const d1 = await pe.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    await pe.click('.pm .pm-cartes [data-pm-pal="P2"]');
    await pe.click('.pm [data-pm-couloir="M03"] .pm-sol');
    await pe.evaluate(() => window.dispatchEvent(new Event('resize')));
    const d2 = await pe.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    egal([Math.max(0, d1), Math.max(0, d2)], [0, 0], `pixels qui dépassent à ${w} × ${h} (plan, couloir)`);
  }
  egal(err, [], 'erreurs JS');
  await pe.close();
});

/* ------------------------------------------------- le sous-mode COMPTAGE (chantier D-6, lot 1 ; brief ENT-6.6 §4 et §7.1) */
// Le contenu d'essai `COMPTAGE` : la zone de masse du jeudi 7 h. Ce qui se compte, ÉCRIT À LA MAIN d'après le tableau du brief
// (§4, étape 1) : M01 15 · M02 8 Heineken (+ 8 Pelforth S19 posée dessus) · M03 24 · M04 0 · M05 2 · M06 7 · M08 19 vides ;
// M07 (non compté par la séance) : 3 × 8 + 7 = 31. Codes de contrôle : M01 47, M02 82, M03 15, M04 63, M05 29, M06 54, M07 31, M08 91.
const monterC = (o = {}) => pm.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-entrepot.js');
  const C = await import('/contenus/entrepot-masse-essai.js');
  document.querySelector('#pmTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'pmTest'; document.body.appendChild(hote);
  const db = o.db || {};
  window.__m = { db, signaux: [] };
  creerEntreprise(E.univers({ temps: 'guidage', entrepot: C.COMPTAGE })).rendre(hote, {
    meta: { id: 'essai-entrepot', code: 'ESSAI', titre: 'Essai', portee: 'eleve', immersif: true, temps: 'guidage' },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: 'u-test' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null, sonTerminal: !!o.son,
  });
  document.querySelector('#pmTest .ent-nav[data-vue="entrepot"]').click();
}, o);
const ouvrirC = async (c) => {
  if (await presentM('[data-pm="retour"]')) await pm.click(`${ZM} [data-pm="retour"]`);
  await pm.click(`${ZM} [data-pm-couloir="${c}"] .pm-sol`);
  await pm.waitForSelector(`${ZM}[data-pm-ouvert="${c}"]`);
};
// Tout ce que l'élève peut lire dans la vue (texte, étiquettes d'accessibilité, infobulles), sans l'encadré « Compter les
// fûts » (il dit « 8 fûts » par palette pleine : une règle, pas le stock). On retire ensuite ce qui a le droit de porter un
// chiffre : couloirs, lots, formats, date et heure, étiquettes de la zone litiges, code de contrôle lu sur le panneau, « 3D »
// et le nombre de couloirs (description du plan).
const chiffresC = () => pm.evaluate((ZM) => {
  const R = document.querySelector(ZM);
  const morceaux = [];
  R.querySelectorAll('*').forEach((el) => {
    if (el.closest('.pe-regles')) return;
    ['aria-label', 'title'].forEach((a) => { if (el.getAttribute(a)) morceaux.push(el.getAttribute(a)); });
    el.childNodes.forEach((n) => { if (n.nodeType === 3 && !el.closest('[data-pm-code]')) morceaux.push(n.textContent); });
  });
  return morceaux.join(' | ').replace(/M0\d|S\d\d|\d\d L|jeudi 17 juin, 7 h|16\/06|19 h|QUAI 1\d|\b3D\b|\b8 couloirs/g, '').match(/\d+/g) || [];
}, ZM);

await v('Masse comptage : ce qui se compte, calculé par le moteur depuis le stock déclaré (écrit à la main ici)', async () => {
  const r = await pm.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/entrepot-masse-essai.js');
    const P = C.COMPTAGE;
    return { reel: E.comptageReel(P), m02Pel: E.futsReels(P, 'M02', 'PEL20', 'S19'), m04Pel: E.futsReels(P, 'M04', 'PEL20', 'S19'),
      m08: E.futsReels(P, 'M08', 'VIDES'), m01Autre: E.futsReels(P, 'M01', 'HEI30', 'S24') };
  });
  egal(r.reel, {
    M01: [{ ref: 'HEI30', lot: 'S20', futs: 15 }],
    M02: [{ ref: 'HEI30', lot: 'S24', futs: 8 }, { ref: 'PEL20', lot: 'S19', futs: 8 }],
    M03: [{ ref: 'PEL20', lot: 'S24', futs: 24 }],
    M04: [],
    M05: [{ ref: 'AFF20', lot: 'S18', futs: 2 }],
    M06: [{ ref: 'AFF20', lot: 'S24', futs: 7 }],
    M07: [{ ref: 'EDW20', lot: 'S24', futs: 31 }],
    M08: [{ ref: 'VIDES', lot: null, futs: 19 }],
  });
  egal([r.m02Pel, r.m04Pel, r.m08, r.m01Autre], [8, 0, 19, 0], 'futsReels : Pelforth en M02, en M04, vides, autre lot');
});

await v('Masse comptage : à l’aveugle — aucune quantité écrite (plan, chaque couloir, zone litiges) ; rien à prendre ni à valider', async () => {
  await monterC();
  await pm.waitForSelector(`${ZM}[data-pm-comptage]`);
  vrai(await presentM('.pe-regles'), 'l’encadré « Compter les fûts » est là');
  egal(await chiffresC(), [], 'chiffres lisibles sur le plan');
  for (const c of ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08']) {
    await ouvrirC(c);
    egal(await chiffresC(), [], `chiffres lisibles dans le couloir ${c}`);
  }
  await pm.click(`${ZM} [data-pm="retour"]`);
  await pm.click(`${ZM} [data-pm-litiges] .pm-sol`);
  await pm.waitForSelector(`${ZM}[data-pm-ouvert="litiges"]`);
  egal(await chiffresC(), [], 'chiffres lisibles dans la zone litiges');
  for (const sel of ['.pm-cartes', '[data-pm="valider"]', '[data-pm-place]', '[data-pm-pal]', '.pe-prof']) vrai(!(await presentM(sel)), `rien de tel côté élève : ${sel}`);
});

await v('Masse comptage : le code de contrôle n’est écrit que dans le couloir ouvert, et c’est le sien', async () => {
  await monterC();
  vrai(!(await presentM('[data-pm-code]')), 'aucun code sur le plan d’ensemble');
  const codes = {};
  for (const c of ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08']) {
    await ouvrirC(c);
    codes[c] = await pm.$$eval(`${ZM} [data-pm-code]`, (L) => L.map((x) => x.textContent));
  }
  egal(codes, { M01: ['47'], M02: ['82'], M03: ['15'], M04: ['63'], M05: ['29'], M06: ['54'], M07: ['31'], M08: ['91'] });
});

await v('Masse comptage : référence et lot en étiquette ; deux étiquettes dans la pile mixte de M02, une seule ailleurs', async () => {
  await monterC();
  const etiq = {};
  for (const c of ['M01', 'M02', 'M03', 'M04', 'M07', 'M08']) {
    await ouvrirC(c);
    etiq[c] = await pm.$$eval(`${ZM} [data-pm-etiq-face]`, (L) => L.map((x) => x.textContent.trim()));
  }
  egal(etiq, {
    M01: ['Heineken 30 L · lot S20'],
    M02: ['Heineken 30 L · lot S24', 'Pelforth 20 L · lot S19'],
    M03: ['Pelforth 20 L · lot S24'],
    M04: [],
    M07: ['Edelweiss 20 L · lot S24', 'Edelweiss 20 L · lot S24'],
    M08: ['VIDES', 'VIDES'],
  });
  await ouvrirC('M02');
  vrai(/Heineken 30 L \+ Pelforth 20 L · lot S24, S19/.test(await texteM('.pm-fil')), 'le titre du couloir nomme les deux références');
});

await v('Masse comptage : la zone litiges se clique, montre ses deux fûts et leurs étiquettes ; Échap revient au plan', async () => {
  await monterC();
  await pm.click(`${ZM} [data-pm-litiges] .pm-sol`);
  await pm.waitForSelector(`${ZM}[data-pm-ouvert="litiges"]`);
  const L = await pm.$$eval(`${ZM} [data-pm-litige]`, (X) => X.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  egal(L, ['Affligem 20 L · lot S24Étiquette : « Réception 16/06 — fuit »', 'Heineken 30 L · lot S20Étiquette : « Percé par une fourche — 16/06, 19 h »']);
  await pm.keyboard.press('Escape');
  await pm.waitForSelector(`${ZM}[data-pm-ouvert=""]`);
  vrai(await presentM('[data-pm-litiges][tabindex="0"]'), 'la zone reste cliquable au clavier');
});

// Réécrit au lot 2 (11/10/2026) : le comptage a maintenant les 5 jalons du terminal (jamais jugés en ouvrant des couloirs),
// et les gestes du terminal s'ajoutent à la liste.
await v('Masse comptage : les couloirs ouverts sont retenus (une fois), aucun jalon jugé ; gestes déclarés', async () => {
  await monterC();
  await ouvrirC('M04');
  await ouvrirC('M02');
  await ouvrirC('M04');
  const r = await pm.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/entrepot-masse-essai.js');
    const e = window.__m.db.entrepots[C.COMPTAGE.id];
    const J = E.jalonsEntrepot(window.__m.db, C.COMPTAGE);
    return { vus: Object.keys(e.vus).sort(), date: typeof e.vus.M04, pos: e.pos, J: [J.total, J.ok, J.L.filter((l) => l.etat).length],
      sig: E.creerEntrepot(C.COMPTAGE).signaux };
  });
  egal([r.vus, r.date, r.pos, r.J], [['M02', 'M04'], 'number', {}, [5, 0, 0]]);
  const S = 'entrepot:essai-masse-comptage:';
  egal(r.sig, ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08'].map((c) => `${S}ouvrir:${c}`).concat(`${S}litiges`,
    ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M08'].map((c) => `${S}compte:${c}`), `${S}compte-fin`));
});

await v('Masse comptage : enseignant — ce qui se compte, dans un encadré', async () => {
  await monterC({ role: 'prof' });
  const t = await texteM('[data-pm-reel]');
  vrai(/M01 : Heineken 30 L lot S20 — 15 fûts/.test(t), t);
  vrai(/M02 : Heineken 30 L lot S24 — 8 fûts ; Pelforth 20 L lot S19 — 8 fûts/.test(t), t);
  vrai(/M04 : vide/.test(t) && /M08 : VIDES — 19 fûts/.test(t), t);
});

await v('Masse comptage : déclaration fautive refusée au chargement, avec un message clair', async () => {
  const r = await pm.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/entrepot-masse-essai.js');
    const copie = () => JSON.parse(JSON.stringify(C.COMPTAGE));
    const essai = (f) => { const x = copie(); f(x); try { E.creerEntrepot(x); return ''; } catch (e) { return e.message; } };
    return {
      bon: essai(() => {}),
      palettes: essai((x) => { x.palettes = [{ id: 'P1', ref: 'HEI30', lot: 'S24' }]; }),
      criteres: essai((x) => { x.criteres = [{ type: 'parLeFond' }]; }),
      code: essai((x) => { x.plan.couloirs[0].code = 'A7'; }),
      litiges: essai((x) => { x.plan.litiges.charges = [1, 2, 3, 4].map(() => ({ ref: 'HEI30', lot: 'S20' })); }),
      lotLitige: essai((x) => { x.plan.litiges.charges[0].lot = 'S99'; }),
    };
  });
  egal(r.bon, '', 'le contenu d’essai se charge');
  vrai(/le comptage ne range rien/.test(r.palettes), r.palettes);
  vrai(/pas de `criteres` ni de `jalons`/.test(r.criteres), r.criteres);
  vrai(/couloir M01 : le code de contrôle/.test(r.code), r.code);
  vrai(/zone litiges : `charges` est une liste de 1 à 3/.test(r.litiges), r.litiges);
  vrai(/zone litiges, charge n° 1 : lot inconnu « S99 »/.test(r.lotLitige), r.lotLitige);
});

await v('Masse comptage : la page d’essai tient en 1366 × 768 et 1280 × 720 sans défiler (plan, couloir ouvert, litiges)', async () => {
  const pe = await ctxM.newPage();
  const err = [];
  pe.on('pageerror', (e) => err.push(e.message));
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
    await pe.setViewportSize({ width: w, height: h });
    await pe.goto(BASE + 'outils/essai-entrepot.html');
    await pe.waitForSelector('.pe');
    await pe.selectOption('#reglages select[name="cas"]', 'comptage');
    await pe.waitForSelector('.pm[data-pm-comptage]');
    await pe.evaluate(() => { document.querySelector('#reglages').style.display = 'none'; document.querySelector('#mention').style.display = 'none'; window.dispatchEvent(new Event('resize')); });
    const d = [];
    d.push(await pe.evaluate(() => document.documentElement.scrollHeight - window.innerHeight));
    await pe.click('.pm [data-pm-couloir="M03"] .pm-sol');
    await pe.evaluate(() => window.dispatchEvent(new Event('resize')));
    d.push(await pe.evaluate(() => document.documentElement.scrollHeight - window.innerHeight));
    await pe.click('.pm [data-pm="retour"]');
    await pe.click('.pm [data-pm-litiges] .pm-sol');
    d.push(await pe.evaluate(() => document.documentElement.scrollHeight - window.innerHeight));
    egal(d.map((x) => Math.max(0, x)), [0, 0, 0], `pixels qui dépassent à ${w} × ${h} (plan, couloir, litiges)`);
  }
  egal(err, [], 'erreurs JS');
  await pe.close();
});

/* --------------------------------------- le TERMINAL VOCAL du comptage (chantier D-6, lot 2 ; brief ENT-6.6 §4 étape 1, §5, §7.2) */
// La liste du contenu d'essai, dans l'ordre : M01 M02 M03 M04 M05 M06 M08. Les comptages justes, ÉCRITS À LA MAIN d'après le
// tableau du brief : 15 · 8 · 24 · 0 · 2 · 7 · 19 ; les codes de contrôle (lus sur les panneaux) : 47 · 82 · 15 · 63 · 29 · 54 · 91.
// Jalons (ordre du contenu) : M01, M02, M04, M08, puis « M03, M05 et M06 » ensemble.
const VT = `${ZM} [data-terminal]`;
const CODES_T = ['47', '82', '15', '63', '29', '54', '91'];
const JUSTES_T = [15, 8, 24, 0, 2, 7, 19];
const termC = () => pm.evaluate(() => JSON.parse(JSON.stringify(((window.__m.db.entrepots || {})['essai-masse-comptage'] || {}).terminal || null)));
const actuC = () => texteM('[data-vt-actu]');
// Taper une réponse au terminal et la valider par Entrée (le panneau se redessine : on attend qu'il ait changé).
async function repondreC(x) {
  const avant = await pm.evaluate(() => (((window.__m.db.entrepots || {})['essai-masse-comptage'] || {}).terminal || { journal: [] }).journal.length);
  await pm.fill(`${VT} [data-vt-champ]`, String(x));
  await pm.press(`${VT} [data-vt-champ]`, 'Enter');
  await pm.waitForFunction((n) => window.__m.db.entrepots['essai-masse-comptage'].terminal.journal.length > n, avant);
}
async function compterC(comptes, { codes = CODES_T } = {}) {
  for (let i = 0; i < comptes.length; i++) { await repondreC(codes[i]); await repondreC(comptes[i]); }
}
// Les jalons du comptage sur la base de l'élève : true / false / null (pas encore jugé), dans l'ordre du contenu.
const jalonsC = () => pm.evaluate(async () => {
  const E = await import('/core/types/entrepot.js');
  const C = await import('/contenus/entrepot-masse-essai.js');
  return E.jalonsEntrepot(window.__m.db, C.COMPTAGE).L.map((l) => (l.etat ? l.ok : null));
});
// Les jalons d'un état construit à la main (réponses, fini ou non) : les pièges du brief §8 sans repasser par l'écran.
const jalonsReponses = (reponses, fin = true) => pm.evaluate(async ({ reponses, fin }) => {
  const E = await import('/core/types/entrepot.js');
  const C = await import('/contenus/entrepot-masse-essai.js');
  const db = { entrepots: { [C.COMPTAGE.id]: { terminal: { i: 7, phase: 'code', reponses, codesFaux: {}, journal: [], fin: fin ? 1 : null } } } };
  const J = E.jalonsEntrepot(db, C.COMPTAGE);
  return { L: J.L.map((l) => (l.etat ? l.ok : null)), ok: J.ok };
}, { reponses, fin });
const REP = (L) => Object.fromEntries(['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M08'].map((id, i) => [id, L[i]]));

await v('Terminal : à droite de la 3D, il commence par le premier couloir de sa liste ; aucun chiffre lisible au départ', async () => {
  await monterC();
  await pm.waitForSelector(VT);
  egal(await actuC(), 'Couloir M01. Code de contrôle ?');
  const b = await pm.evaluate((Z) => {
    const r = (s) => document.querySelector(`${Z} ${s}`).getBoundingClientRect();
    return { term: r('[data-terminal]').left, dessin: r('.pm-dessin').right };
  }, ZM);
  vrai(b.term >= b.dessin, `le terminal (x = ${b.term}) est à droite du dessin (fin x = ${b.dessin})`);
  egal(await chiffresC(), [], 'chiffres lisibles (terminal compris)');
  vrai(/TERMINAL VOCAL · Inventaire tournant/.test(await texteM('.vt-tete')) && /sans son/.test(await texteM('.vt-son')), 'en-tête');
  vrai(!(await presentM('[data-vt-prof]')), 'pas de trace enseignant côté élève');
});

await v('Terminal : parcours juste au clavier → les 5 jalons justes, phrase de fin, champ fermé ; rien n’est jugé avant la fin', async () => {
  await monterC();
  await pm.waitForSelector(VT);
  await repondreC('47');
  egal(await actuC(), 'Heineken fût 30 L. Lot S20. Combien de fûts ?', 'la question de M01 (ni quantité ni théorique)');
  await repondreC('15');
  vrai(/Compris : 15\./.test(await texteM('.vt-ecran')), 'le terminal répète le nombre');
  egal(await actuC(), 'Couloir M02. Code de contrôle ?');
  vrai(await pm.evaluate((s) => document.activeElement === document.querySelector(s), `${VT} [data-vt-champ]`), 'le focus reste dans le champ');
  await compterC(JUSTES_T.slice(1), { codes: CODES_T.slice(1) });
  egal(await jalonsC(), [true, true, true, true, true]);
  egal(await actuC(), 'Comptage terminé : 7 lignes. Merci.');
  vrai(await pm.$eval(`${VT} [data-vt-champ]`, (x) => x.disabled), 'le champ est fermé');
  const T = await termC();
  egal([T.reponses, T.codesFaux, !!T.fin, T.i], [REP(JUSTES_T), {}, true, 7]);
  vrai(T.journal.every((j) => typeof j.h === 'number'), 'journal horodaté');
  // Avant la dernière ligne, rien n'est jugé (le suivi ne dit pas ligne à ligne si le compte est bon).
  egal((await jalonsReponses(REP(JUSTES_T.slice(0, 6)), false)).L, [null, null, null, null, null], '6 lignes sur 7');
});

await v('Terminal : inaction 0 / 5 ; les pièges du brief §8 font tomber leur jalon, et lui seul', async () => {
  await monterC();
  egal(await jalonsC(), [null, null, null, null, null], 'rien fait');
  egal((await jalonsReponses({})).ok, 0, 'terminal fini sans réponse (base forcée) : 0');
  egal((await jalonsReponses(REP(JUSTES_T))).L, [true, true, true, true, true], 'juste');
  egal((await jalonsReponses(REP([16, 8, 24, 0, 2, 7, 19]))).L, [false, true, true, true, true], 'M01 compté 16 (palette du dessus supposée pleine)');
  egal((await jalonsReponses(REP([15, 16, 24, 0, 2, 7, 19]))).L, [true, false, true, true, true], 'M02 compté 16 (la Pelforth posée dessus comptée)');
  egal((await jalonsReponses(REP([15, 8, 24, 8, 2, 7, 19]))).L, [true, true, false, true, true], 'M04 compté 8 (stock supposé)');
  egal((await jalonsReponses(REP([15, 8, 24, 0, 2, 7, 22]))).L, [true, true, true, false, true], 'M08 compté 22');
  egal((await jalonsReponses(REP([15, 8, 24, 0, 2, 8, 19]))).L, [true, true, true, true, false], 'M06 compté 8 : un seul faux = faux');
  const sansM05 = REP(JUSTES_T); delete sansM05.M05;
  egal((await jalonsReponses(sansM05)).L, [true, true, true, true, false], 'M05 non compté = faux');
});

await v('Terminal : code faux → « Code faux », redemandé, trace comptée ; aucun jalon perdu ; l’enseignant voit la trace', async () => {
  await monterC();
  await pm.waitForSelector(VT);
  await repondreC('74');
  egal(await actuC(), 'Couloir M01. Code de contrôle ?', 'le terminal redemande');
  vrai(/Code faux\. Vérifie le couloir\./.test(await texteM('.vt-ecran .vt-ko')), 'le refus, en rouge (texte)');
  await repondreC('47');
  await repondreC('15');
  await repondreC('47');      // le code de M01 au couloir M02
  await compterC(JUSTES_T.slice(1), { codes: CODES_T.slice(1) });
  const T = await termC();
  egal(T.codesFaux, { M01: 1, M02: 1 });
  egal(await jalonsC(), [true, true, true, true, true], 'aucun jalon perdu');
  await monterC({ role: 'prof', db: await pm.evaluate(() => window.__m.db) });
  vrai(/Codes faux \(trace, non notée\) : M01 ×1 · M02 ×1/.test(await texteM('[data-vt-faux]')), await texteM('[data-vt-prof]'));
});

await v('Terminal : case vide → rien ; lettres → « des chiffres » ; Répète ne change rien ; un rechargement reprend à la même ligne', async () => {
  await monterC();
  await pm.waitForSelector(VT);
  await repondreC('47');
  const avant = await termC();
  await pm.fill(`${VT} [data-vt-champ]`, '  ');
  await pm.press(`${VT} [data-vt-champ]`, 'Enter');
  await pm.click(`${VT} [data-vt-valider]`);
  egal((await termC()).journal.length, avant.journal.length, 'une case vide ne fait rien (0 est une réponse, rien n’en est pas une)');
  await repondreC('quinze');
  vrai(/Réponds avec des chiffres/.test(await texteM('.vt-ecran .vt-ko')), 'refus');
  egal(await actuC(), 'Heineken fût 30 L. Lot S20. Combien de fûts ?', 'toujours la même question');
  egal((await termC()).reponses, {}, 'aucune réponse rangée');
  const n = (await termC()).journal.length;
  await pm.click(`${VT} [data-vt-repete]`);
  vrai(await presentM('[data-vt-actu].vt-flash'), 'la phrase en cours clignote');
  egal([(await termC()).journal.length, await actuC()], [n, 'Heineken fût 30 L. Lot S20. Combien de fûts ?'], 'Répète');
  await repondreC('15');
  await monterC({ db: await pm.evaluate(() => window.__m.db) });
  egal(await actuC(), 'Couloir M02. Code de contrôle ?', 'après rechargement');
  vrai(/Compris : 15\./.test(await texteM('.vt-ecran')), 'l’échange est toujours affiché');
  // Ce que l'élève a tapé mais pas validé reste dans le champ quand il ouvre un couloir.
  await pm.fill(`${VT} [data-vt-champ]`, '8');
  await ouvrirC('M02');
  egal(await pm.$eval(`${VT} [data-vt-champ]`, (x) => x.value), '8', 'saisie gardée');
});

// Le SON (chantier D-6, lot 3) : une fausse synthèse vocale remplace celle du navigateur et note ce qu'on lui fait dire.
// `voix` : les voix qu'elle prétend avoir installées.
const fausseVoix = (voix) => pm.evaluate((voix) => {
  window.__dit = []; window.__coupe = 0;
  const synth = { getVoices: () => voix, speak: (u) => window.__dit.push(u.text), cancel: () => { window.__coupe++; } };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; };
}, voix);
const dit = () => pm.evaluate(() => window.__dit.slice());
const FR_LOCALE = { name: 'Hortense', lang: 'fr-FR', localService: true };

await v('Son : le choix de la voix (française, installée sur le poste) et le texte dit', async () => {
  const r = await pm.evaluate(async () => {
    const T = await import('/core/types/terminal.js');
    const lignes = [{ id: 'M01', lieu: 'Couloir M01.', code: '47', question: 'Q1' }, { id: 'M02', lieu: 'Couloir M02.', code: '82', question: 'Q2' }];
    const t = T.terminalNeuf();
    const avant = T.texteParle(t, lignes);
    T.repondreTerminal(t, lignes, '47'); const code = T.texteParle(t, lignes);
    T.repondreTerminal(t, lignes, '15'); const compris = T.texteParle(t, lignes);
    T.repondreTerminal(t, lignes, 'abc'); const refus = T.texteParle(t, lignes);
    T.repondreTerminal(t, lignes, '99'); const faux = T.texteParle(t, lignes);
    return { avant, code, compris, refus, faux, choix: [
      T.choisirVoix([{ lang: 'fr-FR', localService: false, name: 'réseau' }]),
      T.choisirVoix([{ lang: 'en-US', localService: true, name: 'anglais' }]),
      T.choisirVoix([]), T.choisirVoix(undefined),
      (T.choisirVoix([{ lang: 'fr-CA', localService: true, name: 'ca' }, { lang: 'fr-FR', localService: true, name: 'fr' }, { lang: 'fr-FR', localService: false, name: 'web' }]) || {}).name,
      (T.choisirVoix([{ lang: 'fr-BE', localService: true, name: 'be' }]) || {}).name,
    ] };
  });
  egal(r.avant, 'Couloir M01. Code de contrôle ?', 'première phrase seule');
  egal(r.code, 'Q1', 'code juste : la question, rien d’autre');
  egal(r.compris, 'Compris : 15. Couloir M02. Code de contrôle ?', 'Compris + la suite');
  egal(r.refus, 'Je n’ai pas compris. Réponds avec des chiffres. Couloir M02. Code de contrôle ?', 'refus + la phrase attendue');
  egal(r.faux, 'Code faux. Vérifie le lieu. Couloir M02. Code de contrôle ?', 'code faux');
  egal(r.choix, [null, null, null, null, 'fr', 'be'], 'jamais une voix du réseau, jamais une autre langue ; fr-FR préférée');
});

await v('Son : coupé par défaut — bouton absent, rien n’est dit, même avec une voix installée', async () => {
  await monterC();
  await pm.waitForSelector(VT);
  await fausseVoix([FR_LOCALE]);
  vrai(!(await presentM('[data-vt-son]')), 'aucun bouton pour activer le son');
  vrai(/sans son/.test(await texteM('.vt-son')), 'l’en-tête dit « sans son »');
  await repondreC('47'); await repondreC('15');
  await pm.click(`${VT} [data-vt-repete]`);
  egal(await dit(), [], 'rien n’est dit');
});

await v('Son : activé par l’enseignant — la phrase est dite, Répète la redit, l’élève peut couper et remettre, jamais plus que l’enseignant', async () => {
  await monterC({ son: true });
  await pm.waitForSelector(VT);
  await fausseVoix([{ name: 'Web', lang: 'fr-FR', localService: false }, FR_LOCALE]);
  egal((await texteM('.vt-son')).trim(), 'Couper le son', 'le bouton');
  await repondreC('47');
  egal(await dit(), ['Heineken fût 30 L. Lot S20. Combien de fûts ?']);
  await repondreC('15');
  egal((await dit()).pop(), 'Compris : 15. Couloir M02. Code de contrôle ?');
  await pm.click(`${VT} [data-vt-repete]`);
  egal((await dit()).pop(), 'Couloir M02. Code de contrôle ?', 'Répète redit la phrase en cours');
  const avant = (await dit()).length;
  await pm.click(`${VT} [data-vt-son]`);
  egal((await texteM('.vt-son')).trim(), 'Remettre le son');
  vrai(await pm.evaluate(() => window.__coupe > 0), 'la phrase en cours est coupée');
  vrai(await pm.evaluate((s) => document.activeElement === document.querySelector(s), `${VT} [data-vt-son]`), 'le focus reste sur le bouton');
  await repondreC('82'); await pm.click(`${VT} [data-vt-repete]`);
  egal((await dit()).length, avant, 'coupé par l’élève : plus rien n’est dit');
  await pm.click(`${VT} [data-vt-son]`);
  egal((await texteM('.vt-son')).trim(), 'Couper le son');
  vrai((await dit()).length === avant + 1, 'remis : la phrase en cours est redite');
});

await v('Son : aucune voix française installée → texte seul, sans message ni erreur', async () => {
  await monterC({ son: true });
  await pm.waitForSelector(VT);
  await fausseVoix([{ name: 'Web', lang: 'fr-FR', localService: false }, { name: 'Zira', lang: 'en-US', localService: true }]);
  await repondreC('47'); await repondreC('15');
  egal(await dit(), []);
  vrai(!/voix|erreur|impossible/i.test(await texteM('.vt-boitier')), 'aucun message à l’élève');
  await pm.evaluate(() => { delete window.SpeechSynthesisUtterance; });
  await pm.click(`${VT} [data-vt-repete]`);
  egal(await actuC(), 'Couloir M02. Code de contrôle ?', 'le terminal continue sans API de voix');
});

await v('Terminal : déclaration fautive refusée au chargement, avec un message clair', async () => {
  const r = await pm.evaluate(async () => {
    const E = await import('/core/types/entrepot.js');
    const C = await import('/contenus/entrepot-masse-essai.js');
    const essai = (f, base = C.COMPTAGE) => { const x = JSON.parse(JSON.stringify(base)); f(x); try { E.creerEntrepot(x); return ''; } catch (e) { return e.message; } };
    return {
      couloir: essai((x) => { x.terminal.lignes[0].couloir = 'M09'; }),
      sansCode: essai((x) => { delete x.plan.couloirs[0].code; }),
      lot: essai((x) => { x.terminal.lignes[0].lot = 'S99'; }),
      double: essai((x) => { x.terminal.lignes[1].couloir = 'M01'; }),
      jalon: essai((x) => { x.terminal.jalons[0].lignes = ['M07']; }),
      rangement: essai((x) => { x.terminal = JSON.parse(JSON.stringify(C.COMPTAGE.terminal)); }, C.MASSE),
    };
  });
  vrai(/terminal, ligne n° 1 : couloir inconnu \(M09\)/.test(r.couloir), r.couloir);
  vrai(/le couloir M01 n'a pas de code de contrôle/.test(r.sansCode), r.sansCode);
  vrai(/terminal, ligne n° 1 : lot inconnu « S99 »/.test(r.lot), r.lot);
  vrai(/la ligne M01 existe déjà/.test(r.double), r.double);
  vrai(/terminal, jalon compte-M01 : ligne inconnue \(M07\)/.test(r.jalon), r.jalon);
  vrai(/le terminal ne sert qu’au comptage/.test(r.rangement), r.rangement);
});

await v('Masse : aucune erreur JavaScript', async () => { egal(erreursM, []); });
await ctxM.close();
}
