// Suite de tests de Prepalog — bloc « picard » : la vue « quai de réception » (core/types/quai.js),
// chantier P1 du 03/10/2026 (brief `docs/briefs/MOTEUR-vue-quai.md` §9).
//
// `node outils/test.mjs picard` ne lance que ce bloc. Il n'a besoin d'aucun autre : il monte
// l'environnement d'entreprise à la main, dans un contexte de navigateur à lui, sur le quai
// d'ENT-4.1 (données de la maquette v8, `contenus/picard-ent41.js`, réglages d'essai dans
// `outils/essai-quai.js`).
//
// Les valeurs attendues sont écrites À LA MAIN ici (jamais relues dans le contenu) :
//   P1  4×3×5 − 3 = 57 cartons (BL 57)            accepter
//   P2  3×3×4 = 36, 2 cartons écrasés               réserves — cartons endommagés (2)
//   P3  4×3×4 = 48, −14,2 °C à cœur                 refuser — température (−14,2)
//   P4  3×2×4 − 2 = 22 cartons (BL 24)              réserves — manquant (2)
//   P5  3×2×5 = 30, étiquette EPB-450               refuser — produit différent (EPB-450)
// Parcours juste : 18 jalons ; temps hors froid 20 min (30 s + 5 palettes, 5 sondes, 5 comptages,
// deux tours de P2, l'étiquette de P5, 3 min pour rentrer le lot).

export default async function bloc({ v, nav }) {

const egal = (a, b, quoi) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${quoi} : ${JSON.stringify(a)} au lieu de ${JSON.stringify(b)}`); };
const vrai = (c, quoi) => { if (!c) throw new Error(quoi); };

async function contexte(options = {}) {
  const ctx = await nav.newContext(options);
  const pg = await ctx.newPage();
  pg.setDefaultTimeout(6000);
  const erreurs = [];
  pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  await pg.goto('http://127.0.0.1:8099/');
  await pg.waitForSelector('#btnProf', { timeout: 8000 });
  return { ctx, pg, erreurs };
}
const { ctx: ctxQ, pg, erreurs: erreursQ } = await contexte();
async function nouvellePage() {
  const p = await ctxQ.newPage();
  p.setDefaultTimeout(6000);
  p.on('pageerror', (e) => erreursQ.push('PAGEERROR: ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursQ.push('CONSOLE: ' + m.text()); });
  await p.goto('http://127.0.0.1:8099/');
  await p.waitForSelector('#btnProf', { timeout: 8000 });
  return p;
}
let pg2 = null;

// Monte l'environnement sur le quai d'essai, dans une base neuve ou dans celle rangée dans le
// stockage du navigateur (`garder` : la base y est écrite à chaque sauvegarde, comme le ferait le
// site — c'est ce qui permet de recharger la page et de retrouver le travail).
const monter = (p, opts = {}) => p.evaluate(async (o) => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const E = await import('/outils/essai-quai.js');
  document.querySelector('#quaiTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'quaiTest'; document.body.appendChild(hote);
  const U = E.univers({ evaluation: !!o.evaluation, huit: !!o.huit });
  if (o.sansQuai) delete U.quai;
  const CLE = 'essai-quai-base';
  const db = o.garder ? JSON.parse(localStorage.getItem(CLE) || '{}') : {};
  const moteur = creerEntreprise(U);
  window.__q = { db, U, E, moteur, remis: null };
  moteur.rendre(hote, {
    meta: { id: 'essai-quai', code: 'ESSAI', titre: 'Picard — essai', portee: 'eleve', immersif: true, copie: !!o.evaluation },
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve' },
    tiersTemps: !!o.tiers,
    jeu: { etat: () => db, sauver: () => { if (o.garder) localStorage.setItem(CLE, JSON.stringify(db)); } },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
    rendreCopie: async (res) => { window.__q.remis = res; return { rendu: Date.now() }; },
  });
  if (!o.sansQuai) document.querySelector('#quaiTest .ent-nav[data-vue="quai"]').click();
}, opts);

const Z = '#quaiTest .ent-main';
const ID = (o = {}) => `essai-quai${o.evaluation ? '-eval' : ''}${o.huit ? '-8' : ''}`;
const etat = (p, o = {}) => p.evaluate((id) => JSON.parse(JSON.stringify((window.__q.db.quais || {})[id] || null)), ID(o));
const texte = async (p, sel) => ((await p.textContent(sel)) || '').replace(/\s+/g, ' ').trim();
const clic = async (p, sel) => { await p.click(`${Z} ${sel}`); await p.waitForTimeout(40); };
const jalons = (p, o = {}) => p.evaluate(async () => {
  const { jalonsQuai } = await import('/core/types/quai.js');
  const r = jalonsQuai(window.__q.db, window.__q.U.quai);
  return { pts: r.pts, max: r.max, ko: r.L.filter((l) => l.compte && !l.ok).map((l) => l.id) };
}, o);

const JUSTE = {
  P1: { compte: 57, decision: 'accepter', motif: 'aucun' },
  P2: { compte: 36, decision: 'reserves', motif: 'avarie', res: '2', tours: 2 },
  P3: { compte: 48, decision: 'refuser', motif: 'temperature', res: '-14,2' },
  P4: { compte: 22, decision: 'reserves', motif: 'manquant', res: '2' },
  P5: { compte: 30, decision: 'refuser', motif: 'produit', res: 'EPB-450', etiquette: true },
};
// Le parcours, joué à la souris dans l'écran. `ecarts` remplace ce qu'on veut casser :
//   { P3: { sonder: false } }, { P1: { compte: 60 } }, { ordre: 'papiers' }, { deballage: true },
//   { signer: false }, { clore: false }, { ticket: 'bref' }.
async function jouer(p, ecarts = {}) {
  await clic(p, '[data-q="ticket"]');
  await p.check(`${Z} [data-q="ticketRep"][value="${ecarts.ticket || 'long'}"]`);
  await clic(p, '[data-q="decharger"]');
  if (await p.isVisible(`${Z} [data-q="passer"]`)) await clic(p, '[data-q="passer"]');
  await clic(p, '[data-q="vers3"]');
  const ids = Object.keys(JUSTE);
  for (let n = 0; n < ids.length; n++) {
    const pal = Object.assign({}, JUSTE[ids[n]], ecarts[ids[n]] || {});
    await clic(p, `[data-q="sel"][data-n="${n}"]`);
    if (pal.sonder !== false) await clic(p, '[data-q="sonder"]');
    for (let t = 0; t < (pal.tours || 0); t++) await clic(p, '[data-q="tourner"]');
    // L'étiquette du carton le plus en avant (dessiné en dernier) : celle que l'élève voit.
    if (pal.etiquette) await clic(p, '[data-q-etiq] >> nth=-1');
    if (pal.compte != null) { await p.fill(`${Z} [data-q-compte]`, String(pal.compte)); await clic(p, '[data-q="compter"]'); }
    await p.selectOption(`${Z} [data-q-decision]`, pal.decision);
    await p.selectOption(`${Z} [data-q-motif]`, pal.motif);
  }
  await clic(p, '[data-q="vers4"]');
  const remplir = async () => {
    for (const id of ids) {
      const pal = Object.assign({}, JUSTE[id], ecarts[id] || {});
      if (pal.res != null && await p.$(`${Z} #qRes-${id}`)) await p.fill(`${Z} #qRes-${id}`, pal.res);
    }
    if (ecarts.deballage) await p.check(`${Z} [data-q-deballage]`);
  };
  if (ecarts.ordre === 'papiers') {
    await remplir();
    await clic(p, '[data-q="ecrire"]');
    if (await p.$(`${Z} [data-q="chefPapiers"]`)) await clic(p, '[data-q="chefPapiers"]');
    await clic(p, '[data-q="rentrer"]');
  } else {
    await clic(p, '[data-q="rentrer"]');
    await remplir();
    await clic(p, '[data-q="ecrire"]');
  }
  if (ecarts.signer !== false) await clic(p, '[data-q="signer"]');
  if (ecarts.clore !== false && ecarts.signer !== false) {
    await clic(p, '[data-q="clore"]');
    if (await p.$(`${Z} [data-q="clore"].quai-arme`)) await clic(p, '[data-q="clore"]');
  }
}

/* ============================================================ guidage */

await v('quai : sans déclaration `quai`, aucune entrée de menu', async () => {
  await monter(pg, { sansQuai: true });
  vrai(!(await pg.$('#quaiTest .ent-nav[data-vue="quai"]')), 'entrée « Quai de réception » présente sans quai déclaré');
  vrai(await pg.$('#quaiTest .ent-nav[data-vue="receptions"]'), 'le menu de l’environnement a disparu');
});

await v('quai : écran ① — le camion arrive, portes fermées, étapes ②③④ fermées', async () => {
  await monter(pg);
  const t = await texte(pg, Z);
  vrai(t.includes('Le camion de Transports Givrex (fictif) vient de se mettre à quai'), 'légende de la photo absente');
  vrai(t.includes('5 palettes × 1 min + 30 s d’ouverture = 5 min 30'), 'formule du déchargement absente');
  egal(await pg.$$eval(`${Z} [data-q="etape"]`, (b) => b.map((x) => x.disabled)), [false, true, true, true], 'étapes accessibles');
  vrai(!(await pg.$(`${Z} [data-q-ticket]`)), 'ticket affiché avant d’être lu');
  egal(await pg.getAttribute(`${Z} .quai-photo img`, 'src'), './contenus/picard/quai-remorques.jpg', 'photo de l’arrivée');
});

await v('quai : lire le ticket coûte 2 min de quai et aucun temps hors froid (portes fermées)', async () => {
  await clic(pg, '[data-q="ticket"]');
  const e = await etat(pg);
  egal([e.minute, e.froid, e.ticketLu], [2, 0, true], 'minute / froid / lu');
  const tk = await texte(pg, `${Z} [data-q-ticket]`);
  vrai(tk.includes('03:45 -16.8') && tk.includes('04:00 -12.6') && tk.includes('04:45 -17.4'), 'remontée absente du ticket : ' + tk.slice(0, 200));
  egal(await texte(pg, `${Z} [data-q-heure]`), '06:02', 'horloge du quai');
});

await v('quai : parcours juste en guidage → 18 jalons sur 18, 20 min hors froid', async () => {
  await monter(pg);
  await jouer(pg);
  const j = await jalons(pg);
  egal([j.pts, j.max, j.ko], [18, 18, []], 'jalons');
  const e = await etat(pg);
  egal([e.froid, e.fini, e.signe, e.rentre], [20, true, true, true], 'froid / fini / signé / rentré');
  egal(e.lignes.map((l) => l.texte), [
    'P2 CRB-070 : acceptée sous réserve — 2 cartons endommagés (écrasés).',
    'P3 GVA-1000 : palette REFUSÉE — température à cœur −14,2 °C (−18 °C exigé). 48 cartons repris par le chauffeur.',
    'P4 CAB-400 : acceptée sous réserve — manque 2 cartons (BL 24, reçu 22).',
    'P5 EPH-450 : palette REFUSÉE — produit livré EPB-450 au lieu de EPH-450 commandé. 30 cartons repris par le chauffeur.',
  ], 'lignes de réserve écrites');
  const b = await texte(pg, `${Z} .quai-bilan-bloc`);
  vrai(b.includes('Tu as rentré le lot avant d’écrire les papiers'), 'bilan : la phrase sur l’ordre froid/papiers manque');
  vrai(b.includes('Temps réel passé'), 'bilan : le temps réel mesuré manque');
  vrai(b.includes('art. L133-3'), 'bilan : le « Bon à savoir » manque');
  egal(await pg.$$eval(`${Z} [data-jalon] .quai-ok`, (x) => x.length), 18, 'lignes justes au bilan (le détail du comptage n’est pas rempli ici)');
});

await v('quai : la phrase « 18 jalons » se lit au bilan, détail du comptage non compté', async () => {
  const lignes = await pg.$$eval(`${Z} [data-jalon]`, (x) => x.map((tr) => tr.dataset.jalon));
  egal(lignes.filter((l) => !l.endsWith('-detail')).length, 18, 'lignes comptées au bilan');
  egal(lignes.filter((l) => l.endsWith('-detail')).length, 5, 'lignes « détail » (guidage)');
  const t = await texte(pg, `${Z} [data-jalon="P2-detail"]`);
  vrai(t.includes('(non compté)'), 'la ligne de détail ne dit pas qu’elle ne compte pas');
});

await v('quai : sans sonder P3, la décision « refuser — température » est fausse', async () => {
  await monter(pg);
  await jouer(pg, { P3: { sonder: false } });
  const j = await jalons(pg);
  egal(j.ko, ['P3-decision'], 'jalons faux');
});

await v('quai : faire le tour — les cartons écrasés de P2 ne se voient pas de face', async () => {
  await monter(pg);
  await clic(pg, '[data-q="decharger"]');
  if (await pg.isVisible(`${Z} [data-q="passer"]`)) await clic(pg, '[data-q="passer"]');
  await clic(pg, '[data-q="vers3"]');
  await clic(pg, '[data-q="sel"][data-n="1"]');
  egal(await pg.$$eval(`${Z} [data-q-avarie]`, (x) => x.length), 0, 'avarie visible de face');
  const vues = [];
  for (let t = 0; t < 3; t++) { await clic(pg, '[data-q="tourner"]'); vues.push(await pg.$$eval(`${Z} [data-q-avarie]`, (x) => x.length)); }
  vrai(vues[1] === 2, `de l'arrière, 2 cartons écrasés attendus (vues 1-3 : ${vues})`);
  vrai(vues[2] === 0, `du côté gauche, aucun carton écrasé attendu (vues 1-3 : ${vues})`);
  const e = await etat(pg);
  egal(e.palettes.P2.vues.sort(), [0, 1, 2, 3], 'côtés vus');
  egal(e.minute, 5.5 + 1.5, 'trois tours = 1 min 30 de quai');
});

await v('quai : comptage — couche incomplète conforme (P1) et manquant dans le coin du fond (P4)', async () => {
  await monter(pg);
  await jouer(pg, { P1: { compte: 60 }, P4: { compte: 24 } });
  const j = await jalons(pg);
  egal(j.ko, ['P1-comptage', 'P4-comptage'], 'jalons faux quand on compte « plein »');
});

await v('quai : l’étiquette de P5 — lue de près, elle dit EPB-450 ; une réserve EPH-450 est fausse', async () => {
  await monter(pg);
  await clic(pg, '[data-q="decharger"]');
  if (await pg.isVisible(`${Z} [data-q="passer"]`)) await clic(pg, '[data-q="passer"]');
  await clic(pg, '[data-q="vers3"]');
  await clic(pg, '[data-q="sel"][data-n="4"]');
  vrai(!(await pg.$(`${Z} [data-q-etiquette]`)), 'étiquette zoomée avant le clic');
  await clic(pg, '[data-q-etiq] >> nth=-1');
  const t = await texte(pg, `${Z} [data-q-etiquette]`);
  vrai(t.includes('Réf. EPB-450') && t.includes('ÉPINARDS EN BRANCHES'), 'étiquette zoomée : ' + t);
  egal((await etat(pg)).minute, 6, 'lire l’étiquette coûte 30 s');
  await monter(pg);
  await jouer(pg, { P5: { res: 'EPH-450' } });
  egal((await jalons(pg)).ko, ['P5-reserve'], 'jalons faux');
});

await v('quai : guidage — le chauffeur refuse de signer une réserve vide', async () => {
  await monter(pg);
  await jouer(pg, { P2: { res: '' }, signer: false });
  await clic(pg, '[data-q="signer"]');
  const e = await etat(pg);
  egal(e.signe, false, 'signé malgré une réserve vide');
  vrai((await texte(pg, `${Z} [data-q-parole]`)).includes('Votre réserve sur P2 ne dit pas combien ni quoi'), 'parole du chauffeur');
});

await v('quai : guidage — le chef de quai arrête l’élève qui écrit avant de rentrer le lot (« d’accord »)', async () => {
  await monter(pg);
  await clic(pg, '[data-q="decharger"]');
  if (await pg.isVisible(`${Z} [data-q="passer"]`)) await clic(pg, '[data-q="passer"]');
  await clic(pg, '[data-q="vers3"]');
  for (let n = 0; n < 5; n++) { await clic(pg, `[data-q="sel"][data-n="${n}"]`); await pg.selectOption(`${Z} [data-q-decision]`, 'accepter'); }
  await clic(pg, '[data-q="vers4"]');
  await clic(pg, '[data-q="ecrire"]');
  vrai((await texte(pg, `${Z} [data-q-chef]`)).includes('Rentre d\'abord le lot accepté en chambre froide'), 'chef de quai absent');
  egal((await etat(pg)).ecrit, false, 'réserves écrites malgré l’arrêt du chef');
  await clic(pg, '[data-q="chefRentrer"]');
  const e = await etat(pg);
  egal([e.rentre, e.ecrit, e.ordreFroidDabord], [true, false, true], 'rentré / écrit / ordre');
  vrai(!(await pg.$(`${Z} [data-q-chef]`)), 'le chef reste affiché');
});

await v('quai : guidage — « j’écris quand même » : réserves écrites, le bilan rappelle la règle', async () => {
  await monter(pg);
  await jouer(pg, { ordre: 'papiers' });
  const e = await etat(pg);
  egal([e.passeOutreChef, e.ordreFroidDabord, e.fini], [true, false, true], 'passé outre / ordre / fini');
  egal((await jalons(pg)).ko, [], 'ordre froid/papiers sanctionné en points (il ne doit pas l’être)');
  vrai((await texte(pg, `${Z} .quai-bilan-bloc`)).includes('malgré le chef de quai'), 'le bilan ne le dit pas');
  egal(e.froid, 24, 'temps hors froid : les 4 lignes écrites avant de rentrer comptent (20 + 4)');
});

await v('quai : case « sous réserve de déballage » cochée → jalon faux, le chef explique', async () => {
  await monter(pg);
  await jouer(pg, { deballage: true });
  egal((await jalons(pg)).ko, ['deballage'], 'jalons faux');
  vrai((await texte(pg, `${Z} [data-q-lignes]`)).includes('Sous réserve de déballage.'), 'mention absente du BL');
  vrai((await texte(pg, `${Z} [data-q-chef-deballage]`)).includes('ça ne te protège de rien'), 'explication du chef absente');
});

await v('quai : aucun jalon n’est vrai par inaction', async () => {
  await monter(pg);
  const j = await jalons(pg);
  egal([j.pts, j.max], [0, 18], 'jalons d’une base neuve');
  // Tout décidé « accepter » sans écrire : la mention de déballage « non ajoutée » ne vaut rien.
  await clic(pg, '[data-q="decharger"]');
  if (await pg.isVisible(`${Z} [data-q="passer"]`)) await clic(pg, '[data-q="passer"]');
  const j2 = await jalons(pg);
  vrai(j2.ko.includes('deballage') && j2.ko.includes('rentre') && j2.pts === 0, 'jalon vrai sans geste : ' + JSON.stringify(j2));
});

await v('quai : le temps hors froid s’arrête à l’entrée en chambre froide', async () => {
  await monter(pg);
  await jouer(pg, { signer: false });
  const e1 = await etat(pg);
  await clic(pg, '[data-q="signer"]');
  const e2 = await etat(pg);
  egal([e1.froid, e2.froid, e2.minute - e1.minute], [20, 20, 1], 'froid avant / après la signature, minute de signature');
  vrai((await texte(pg, `${Z} [data-q-nfroid]`)).includes('arrêté : lot en chambre froide'), 'horloge : arrêt non affiché');
});

await v('quai : déchargement — la porte s’ouvre, les palettes arrivent une à une (animation)', async () => {
  await monter(pg);
  await clic(pg, '[data-q="decharger"]');
  await pg.waitForTimeout(1300);
  const e1 = await etat(pg);
  egal([e1.decharge, e1.evts, e1.minute], [true, 1, 0.5], 'porte ouverte : 30 s de quai');
  await pg.waitForFunction(() => /1 \/ 5/.test(document.querySelector('[data-q-nb]')?.textContent || ''), null, { timeout: 6000 });
  vrai(await pg.isDisabled(`${Z} [data-q="vers3"]`), '« Contrôler les palettes » ouvert pendant le déchargement');
  await clic(pg, '[data-q="passer"]');
  const e2 = await etat(pg);
  egal([e2.evts, e2.minute, e2.froid], [6, 5.5, 5.5], 'fin du déchargement : 5 min 30');
  egal(await texte(pg, `${Z} [data-q-nb]`), '5 / 5', 'compteur');
  vrai(!(await pg.isDisabled(`${Z} [data-q="vers3"]`)), '« Contrôler les palettes » fermé après le déchargement');
  // Revoir ne coûte rien.
  await clic(pg, '[data-q="revoir"]');
  await pg.waitForTimeout(600);
  await clic(pg, '[data-q="passer"]');
  egal((await etat(pg)).minute, 5.5, '« Revoir » a coûté du temps');
});

await v('quai : huit palettes — toutes posées sur le quai, 8 min 30 de déchargement', async () => {
  await monter(pg, { huit: true });
  await clic(pg, '[data-q="decharger"]');
  await clic(pg, '[data-q="passer"]');
  const e = await etat(pg, { huit: true });
  egal([e.evts, e.minute], [9, 8.5], 'événements / minutes');
  egal(await texte(pg, `${Z} [data-q-nb]`), '8 / 8', 'compteur');
  // Chaque palette posée a sa place : aucune n'est dessinée par-dessus une autre au même endroit.
  const places = await pg.$$eval(`${Z} [data-g="posees"] text`, (t) => t.map((x) => `${x.getAttribute('x')},${x.getAttribute('y')}`));
  egal(new Set(places).size, 8, 'places distinctes');
  egal(await pg.$$eval(`${Z} [data-q="sel"]`, (x) => x.length), 0, 'onglets à l’étape 2');
  await clic(pg, '[data-q="vers3"]');
  egal(await pg.$$eval(`${Z} [data-q="sel"]`, (x) => x.length), 8, 'onglets des palettes');
});

await v('quai : un déchargement interrompu (page rechargée) se termine à la réouverture', async () => {
  await pg.evaluate(() => localStorage.removeItem('essai-quai-base'));
  await monter(pg, { garder: true });
  await clic(pg, '[data-q="decharger"]');
  await pg.waitForTimeout(1200);
  await pg.reload(); await pg.waitForSelector('#btnProf');
  await monter(pg, { garder: true });
  const e = await etat(pg);
  egal([e.evts, e.minute], [6, 5.5], 'événements appliqués d’un coup');
  vrai(!(await pg.isDisabled(`${Z} [data-q="vers3"]`)), 'contrôle fermé après réouverture');
});

await v('quai : état retrouvé après fermeture de l’onglet (étape, palette sondée, comptage)', async () => {
  await pg.evaluate(() => localStorage.removeItem('essai-quai-base'));
  await monter(pg, { garder: true });
  await clic(pg, '[data-q="decharger"]');
  await clic(pg, '[data-q="passer"]');
  await clic(pg, '[data-q="vers3"]');
  await clic(pg, '[data-q="sonder"]');
  await pg.fill(`${Z} [data-q-compte]`, '57'); await clic(pg, '[data-q="compter"]');
  await pg.close();
  const p2 = await nouvellePage();
  pg2 = p2;
  await monter(p2, { garder: true });
  const e = await etat(p2);
  egal([e.etape, e.palettes.P1.sonde, e.palettes.P1.compte], [3, -21.5, 57], 'étape / sonde / comptage');
  vrai((await texte(p2, `${Z} [data-q-rcompte]`)).includes('Comptage noté : 57 cartons'), 'écran non retrouvé');
});
if (!pg2) pg2 = await nouvellePage();

await v('quai : le temps réel compte, il est rangé dans la base et survit à un rechargement', async () => {
  await pg2.evaluate(() => localStorage.removeItem('essai-quai-base'));
  await monter(pg2, { garder: true });
  await pg2.waitForTimeout(2600);
  await clic(pg2, '[data-q="ticket"]');            // un geste : la base est rangée
  const avant = (await etat(pg2)).reel;
  vrai(avant >= 2, `temps réel compté : ${avant} s`);
  await pg2.reload(); await pg2.waitForSelector('#btnProf');
  await monter(pg2, { garder: true });
  const apres = (await etat(pg2)).reel;
  vrai(apres >= avant, `temps réel perdu au rechargement : ${avant} → ${apres}`);
  // Il compte quel que soit l'écran affiché.
  await pg2.click('#quaiTest .ent-nav[data-vue="mail"]');
  await pg2.waitForTimeout(1600);
  vrai((await etat(pg2)).reel >= apres + 1, 'le temps réel s’arrête hors de l’écran du quai');
});

await v('quai : guidage — le mail d’accueil du chef de quai est dans la messagerie', async () => {
  await monter(pg2);
  await pg2.click('#quaiTest .ent-nav[data-vue="mail"]');
  vrai((await texte(pg2, Z)).includes('Quai 32 : premier camion à 6 h 00'), 'mail d’accueil absent');
});

// Décision de Tristan (03/10/2026) : sur un poste réglé en sombre, le bleu nuit de Picard sur fond
// sombre était illisible. L'entreprise impose le papier de Prepalog (THEME.papier).
await v('quai : poste en mode sombre — l’écran reste sur le fond papier, texte foncé', async () => {
  const { ctx, pg: ps, erreurs } = await contexte({ colorScheme: 'dark' });
  await monter(ps);
  const c = await ps.evaluate(() => {
    const cs = (s) => getComputedStyle(document.querySelector(s));
    return { fond: cs('#quaiTest .ent-page').backgroundColor, carte: cs('#quaiTest .quai-carte').backgroundColor, encre: cs('#quaiTest .quai-carte').color };
  });
  egal(c, { fond: 'rgb(244, 241, 234)', carte: 'rgb(253, 251, 247)', encre: 'rgb(26, 25, 21)' }, 'couleurs calculées');
  egal(erreurs, [], 'erreurs JS');
  await ctx.close();
});

await v('quai : prefers-reduced-motion — pas d’animation, le déchargement est fini d’emblée', async () => {
  const { ctx, pg: pr, erreurs } = await contexte({ reducedMotion: 'reduce' });
  await monter(pr);
  await clic(pr, '[data-q="decharger"]');
  const e = await etat(pr);
  egal([e.evts, e.minute, e.froid, e.etape], [6, 5.5, 5.5, 2], 'état après le clic');
  vrai(!(await pr.isVisible(`${Z} [data-q="passer"]`)), 'bouton « Passer » affiché');
  vrai(!(await pr.isDisabled(`${Z} [data-q="vers3"]`)), '« Contrôler les palettes » fermé');
  egal(erreurs, [], 'erreurs JS');
  await ctx.close();
});

/* ========================================================= évaluation */

await v('quai : évaluation — aucune aide (consignes, règle, détail, repère, chef de quai)', async () => {
  await monter(pg2, { evaluation: true });
  vrai(await pg2.$(`${Z} [data-q-reel]`), 'chrono réel absent');
  await clic(pg2, '[data-q="decharger"]');
  if (await pg2.isVisible(`${Z} [data-q="passer"]`)) await clic(pg2, '[data-q="passer"]');
  egal(await pg2.$$eval(`${Z} .quai-aide`, (x) => x.length), 0, 'consignes à l’étape 2');
  await clic(pg2, '[data-q="vers3"]');
  egal([await pg2.$$eval(`${Z} .quai-aide`, (x) => x.length), !!(await pg2.$(`${Z} [data-q-detail]`)), !!(await pg2.$(`${Z} [data-q-repere]`))],
    [0, false, false], 'aides / détail / repère');
  for (let n = 0; n < 5; n++) { await clic(pg2, `[data-q="sel"][data-n="${n}"]`); await pg2.selectOption(`${Z} [data-q-decision]`, 'accepter'); }
  await clic(pg2, '[data-q="vers4"]');
  await clic(pg2, '[data-q="ecrire"]');
  vrai(!(await pg2.$(`${Z} [data-q-chef]`)), 'chef de quai en évaluation');
  egal((await etat(pg2, { evaluation: true })).ecrit, true, 'réserves non écrites');
});

await v('quai : évaluation — parcours juste en 10 min réelles → copie rendue, 20/20', async () => {
  await monter(pg2, { evaluation: true });
  await jouer(pg2, { clore: false });
  await pg2.evaluate((id) => { window.__q.db.quais[id].reel = 600; }, ID({ evaluation: true }));
  await clic(pg2, '[data-q="clore"]');
  vrai((await texte(pg2, `${Z} [data-q="clore"]`)).includes('Rendre définitivement'), 'la remise ne demande pas de confirmation');
  await clic(pg2, '[data-q="clore"]');
  await pg2.waitForFunction(() => !!window.__q.remis);
  const r = await pg2.evaluate(() => window.__q.remis);
  egal([r.score, r.max, r.detail.quai.jalons, r.detail.quai.horsFroid, r.detail.quai.reelPts, r.detail.quai.rapidite], [20, 20, 18, 3, 2, 5], 'note remise');
  vrai(r.detail.quai.reel >= 600 && r.detail.quai.reel < 605, 'temps réel retenu : ' + r.detail.quai.reel);
  vrai((await texte(pg2, `${Z} [data-q-bilan]`)).includes('Ton enseignant te donnera la note'), 'l’élève voit une correction');
  vrai(!(await pg2.$(`${Z} [data-jalon]`)), 'tableau des jalons montré à l’élève');
  // Copie rendue : on consulte, on ne touche plus — mais les étapes restent consultables.
  await pg2.waitForSelector('#quaiTest .ent-copie-rendue');
  await clic(pg2, '[data-q="etape"][data-n="3"]');
  vrai(await pg2.isDisabled(`${Z} [data-q="sonder"]`), 'le contrôle reste modifiable après la remise');
  const avant = (await etat(pg2, { evaluation: true })).reel;
  await pg2.waitForTimeout(1300);
  egal((await etat(pg2, { evaluation: true })).reel, avant, 'le chrono tourne encore après la remise');
});

await v('quai : note d’évaluation — valeurs du brief (13 min 20, tiers-temps, palette fausse, BL non signé)', async () => {
  const notes = await pg2.evaluate(async () => {
    const { noteQuai, jalonsQuai } = await import('/core/types/quai.js');
    const Q = window.__q.U.quai;
    const base = JSON.parse(JSON.stringify(window.__q.db));
    const avec = (fn) => { const db = JSON.parse(JSON.stringify(base)); fn(db.quais[Q.id]); return noteQuai(db, Q); };
    return {
      dix: avec((e) => { e.reel = 600; }).score,
      treize: avec((e) => { e.reel = 800; }).score,
      treizeTiers: avec((e) => { e.reel = 800; e.tiersTemps = true; }).score,
      seize: avec((e) => { e.reel = 16 * 60 + 1; }).score,
      seizeTiers: avec((e) => { e.reel = 16 * 60 + 1; e.tiersTemps = true; }).score,
      uneFausse: avec((e) => { e.reel = 600; e.palettes.P1.decision = 'reserves'; }).score,
      nonSigne: avec((e) => { e.reel = 600; e.signe = false; }).score,
      froid26: avec((e) => { e.reel = 600; e.froid = 26; }).score,
      max: jalonsQuai(base, Q).max,
    };
  });
  egal(notes, { dix: 20, treize: 19, treizeTiers: 20, seize: 18, seizeTiers: 19, uneFausse: 18.17, nonSigne: 14.17, froid26: 18, max: 18 }, 'notes');
});

await v('quai : évaluation — le tiers-temps de l’élève est rangé dans l’état et lu par la note', async () => {
  await monter(pg2, { evaluation: true, tiers: true });
  egal((await etat(pg2, { evaluation: true })).tiersTemps, true, 'tiers-temps');
  vrai((await texte(pg2, `${Z} .quai-h-reel`)).includes('tiers-temps : seuils × 4/3'), 'le chrono ne dit pas le tiers-temps');
  const r = await pg2.evaluate(() => window.__q.moteur.noter(window.__q.db));
  egal([r.max, r.detail.quai.tiersTemps], [20, true], 'noter() de l’activité');
});

await v('quai : évaluation — l’enseignant voit la note détaillée au bilan, sans copie à rendre', async () => {
  await monter(pg2, { evaluation: true, role: 'prof' });
  await jouer(pg2);
  const t = await texte(pg2, `${Z} [data-q-note]`);
  vrai(t.includes('18/18 jalons') && t.includes('15,0 / 15') && t.includes('réception complète, 5/5 palettes justes'), 'tableau de note : ' + t);
  egal(await pg2.evaluate(() => window.__q.remis), null, 'copie rendue par l’enseignant');
});

/* ========================================================= sabotages */
// Chaque jalon doit tomber quand on casse sa donnée — et lui seul.
await v('quai : sabotages — chaque jalon tombe quand on casse sa donnée, et lui seul', async () => {
  await monter(pg2);
  await jouer(pg2);
  const res = await pg2.evaluate(async () => {
    const { jalonsQuai } = await import('/core/types/quai.js');
    const Q = window.__q.U.quai;
    const base = JSON.parse(JSON.stringify(window.__q.db));
    const ko = (fn) => { const db = JSON.parse(JSON.stringify(base)); fn(db.quais[Q.id]); return jalonsQuai(db, Q).L.filter((l) => l.compte && !l.ok).map((l) => l.id).join(' '); };
    return {
      juste: ko(() => {}),
      ticket: ko((e) => { e.ticketRep = 'bref'; }),
      ticketNonLu: ko((e) => { e.ticketLu = false; }),
      comptage: ko((e) => { e.palettes.P3.compte = 47; }),
      decision: ko((e) => { e.palettes.P2.decision = 'accepter'; }),
      motif: ko((e) => { e.palettes.P4.motif = 'avarie'; }),
      sonde: ko((e) => { e.palettes.P1.sonde = null; }),
      reserve: ko((e) => { e.lignes.find((l) => l.id === 'P3').juste = false; }),
      ligneAbsente: ko((e) => { e.lignes = e.lignes.filter((l) => l.id !== 'P4'); }),
      deballage: ko((e) => { e.mentionEcrite = true; }),
      nonEcrit: ko((e) => { e.ecrit = false; }),
      signature: ko((e) => { e.signe = false; }),
      rentre: ko((e) => { e.rentre = false; }),
    };
  });
  egal(res, {
    juste: '', ticket: 'ticket', ticketNonLu: 'ticket', comptage: 'P3-comptage', decision: 'P2-decision', motif: 'P4-decision',
    sonde: 'P1-decision', reserve: 'P3-reserve', ligneAbsente: 'P4-reserve', deballage: 'deballage',
    nonEcrit: 'P2-reserve P3-reserve P4-reserve P5-reserve deballage', signature: 'signature', rentre: 'rentre',
  }, 'jalons faux après sabotage');
});

await v('quai : les étapes de la séance (etapesQuai) suivent les jalons', async () => {
  const r = await pg2.evaluate(async () => {
    const { etapesQuai } = await import('/core/types/quai.js');
    const et = etapesQuai(window.__q.U.quai);
    return { n: et.length, ok: et.filter((e) => e.verifier(window.__q.db).status === 'ok').length, vide: et.filter((e) => e.verifier({}).status === 'ok').length };
  });
  egal(r, { n: 18, ok: 18, vide: 0 }, 'étapes');
});

await v('quai : guidage — « Recommencer la réception » repart d’un quai neuf (deux clics)', async () => {
  await clic(pg2, '[data-q="recommencer"]');
  egal((await etat(pg2)).fini, true, 'effacé au premier clic');
  await clic(pg2, '[data-q="recommencer"]');
  const e = await etat(pg2);
  egal([e.fini, e.minute, e.decharge, e.etape], [false, 0, false, 1], 'quai neuf');
});

/* ===================================================== ENT-4.1, la séance */

await v('ENT-4.1 : déclaration (C1.4, guidage, 1re, 18 jalons, livrée fermée aux élèves)', async () => {
  const m = await pg2.evaluate(async () => (await import('/activites/picard-ent41.js')).meta);
  egal([m.id, m.code, m.rubrique, m.competences, m.temps, m.niveaux, m.bareme, m.pret, m.ouverture, m.immersif, m.portee, !!m.copie],
    ['picard-ent41', 'ENT-4.1', 'logisim', ['C1.4'], 'guidage', ['1re'], 18, true, 'prof', true, 'eleve', false], 'meta');
});

await v('ENT-4.1 : sous le logo Picard dans Logisim, elle s’ouvre sur l’accueil et le mail du chef de quai', async () => {
  const p = await nouvellePage();
  await p.click('#btnProf');
  await p.click('[data-rub="logisim"]');
  await p.click('[data-ent="4"]');
  vrai((await texte(p, '[data-entreprise="4"]')).includes('Picard'), 'bloc Picard absent');
  await p.click('[data-act="picard-ent41"]');
  await p.waitForSelector('.ent-bandeau');
  vrai((await texte(p, '.ent-bandeau')).includes('ENT-4.1'), 'bandeau de séance');
  vrai((await texte(p, '.ent-main')).includes('Réceptionner le premier camion, dans l’ordre'), 'accueil de la séance');
  await p.click('.ent-nav[data-vue="mail"]');
  vrai((await texte(p, '.ent-main')).includes('Quai 32 : premier camion à 6 h 00'), 'mail du chef de quai');
  await p.click('.ent-nav[data-vue="quai"]');
  vrai((await texte(p, '.ent-main')).includes('Le camion de Transports Givrex (fictif) vient de se mettre à quai'), 'quai');
  await p.close();
});

await v('ENT-4.1 : corrigé — palettes, cartons réels et réserves calculés depuis la séance', async () => {
  const c = await pg2.evaluate(async () => (await import('/contenus/corriges/ENT-4.1.js')).CORRIGE);
  const pal = c.items.find((i) => i.etape === 3).reponses.map((r) => [r[0], r[3], r[5]]);
  egal(pal, [
    ['P1', '57 (4 × 3 × 5 − 3)', 'Accepter — aucun motif'],
    ['P2', '36 (3 × 3 × 4)', 'Accepter avec réserves — Cartons endommagés'],
    ['P3', '48 (4 × 3 × 4)', 'Refuser — Température non conforme'],
    ['P4', '22 (3 × 2 × 4 − 2)', 'Accepter avec réserves — Manquant'],
    ['P5', '30 (3 × 2 × 5)', 'Refuser — Produit différent de la commande'],
  ], 'tableau des palettes');
  const res = c.items.filter((i) => i.genre === 'tableau')[1].reponses;
  egal(res.map((r) => r[0]), ['P2', 'P3', 'P4', 'P5'], 'réserves attendues');
  vrai(res[1][1].includes('température à cœur −14,2 °C') && res[3][1].includes('produit livré EPB-450'), 'lignes de réserve : ' + JSON.stringify(res));
});

await v('quai : aucune erreur JavaScript dans le bloc', async () => {
  egal(erreursQ, [], 'erreurs');
});

await ctxQ.close();
}
