// Suite de tests de Prepalog — bloc « entrepot » : la vue « Plan d'entrepôt » (core/types/entrepot.js),
// brief `docs/briefs/MOTEUR-vue-plan-entrepot.md` §11, lots 1 et 2 (le cœur, le mode rangement) et lot 4
// (le mode préparation, en fin de fichier).
//
// `node outils/test.mjs entrepot` ne lance que ce bloc. Il n'a besoin d'aucun autre : il monte
// l'environnement d'entreprise à la main, dans un contexte de navigateur à lui, sur le cas « rangement »
// de la maquette v2 (`contenus/entrepot-essai.js`, univers d'essai `outils/essai-entrepot.js`).
//
// Les bonnes réponses et les critères attendus sont écrits À LA MAIN ici (jamais relus dans le contenu).
// Ils viennent de la maquette (Cowork, 04/10), recontrôlés contre le moteur le 04/10 :
//   P1 Maison (lourd, rotation A) : A1-T01-N1-E3 seule · P2 Cuisine (fragile, B) : B2-T02-N1-E2, B2-T02-N1-E3 ·
//   P3 Établi (litige) : L1, L2 · P4 Porteur (C) : B1-T03-N3-E1, B1-T04-N1-E2, B1-T04-N3-E2.

export default async function bloc({ v, nav }) {

const egal = (a, b, quoi) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${quoi} : ${JSON.stringify(a)} au lieu de ${JSON.stringify(b)}`); };
const vrai = (c, quoi) => { if (!c) throw new Error(quoi); };

const ctxE = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const erreursE = [];
const pg = await ctxE.newPage();
pg.setDefaultTimeout(6000);
pg.on('pageerror', (e) => erreursE.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursE.push('CONSOLE: ' + m.text()); });
await pg.goto('http://127.0.0.1:8099/');
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
  egal(await texte(pg, '[data-pe-deja="2"]'), 'déjà posé : 840 kg', 'aide charge N2');
  await pg.click(`${Z} [data-pe="aideCharge"]`);
  vrai(!(await present(pg, '[data-pe-deja]')), 'aide toujours là une fois décochée');
  egal((await etat(pg)).aideCharge, false, 'aide décochée gardée');
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
  vrai(!(await present(pg, '[data-pe-deja]')), 'aide de charge en évaluation');
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
}
