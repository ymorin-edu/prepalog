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
// « Contrôles terminés → réserves » demande une confirmation (deuxième clic) depuis le 03/10/2026.
const vers4 = async (p) => { await clic(p, '[data-q="vers4"]'); if (await p.$(`${Z} [data-q="vers4"].quai-arme`)) await clic(p, '[data-q="vers4"]'); };
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
  await vers4(p);
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
  await vers4(pg);
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
  await vers4(pg2);
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

/* ===================================================== ENT-4.2, deux camions */
// Brief `docs/briefs/ENT-4.2-picard-deux-camions.md` §9. Valeurs écrites À LA MAIN :
//   A1 3×3×4 = 36 · A2 citron 3 couches de 3×2 = 18, framboise 1 couche = 6 · A3 4×3×4 = 48
//   B1 4×3×5 = 60 · B2 36, −14,8 °C → refuser température · B3 30, arrière CFL-1000 → refuser produit
//   B4 4×2×4 − 1 = 31 (BL 32) → réserves manquant (1) · B5 3×3×5 = 45
// Camion A : −18,5 °C au départ, +0,25 °C par minute du quai porte fermée. Règle du quai à trois zones
// (Tristan, 03/10/2026) : ≤ −18 accepter ; entre −18 et −15 réserves — température ; > −15 refuser.
// A d'abord : ouvert à 4 min (deux tickets) → −17,5 °C, réserves — température (−17,5).
// B d'abord, au plus vite : 4 + 5,5 + 1 + 1 + 3 = 14,5 min → −18,5 + 3,625 = −14,875, arrondi −14,9 °C :
// au-dessus de −15, à refuser.
const ID42 = 'picard-ent42';
const monter42 = (p) => p.evaluate(async () => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const P = await import('/contenus/picard.js');
  const S = await import('/contenus/picard-ent42.js');
  document.querySelector('#quaiTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'quaiTest'; document.body.appendChild(hote);
  const U = { ENTREPRISE: P.ENTREPRISE, VOCAB: P.VOCAB, CATALOGUE: P.catalogue(S.PRODUITS_ENT42), SUPPLIERS: P.SUPPLIERS,
    SUP_BY_ID: P.SUP_BY_ID, CUSTOMERS: P.CUSTOMERS, CM: P.CM, THEME: P.THEME, baseDeDepart: P.baseDeDepart,
    etapes: S.ETAPES, exercice: 'ENT-4.2', accueil: S.ACCUEIL, volet: S.VOLET, quai: S.QUAI_ENT42 };
  const db = {};
  window.__q = { db, U, moteur: creerEntreprise(U), remis: null };
  window.__q.moteur.rendre(hote, {
    meta: { id: 'picard-ent42', code: 'ENT-4.2', titre: 'Picard', portee: 'eleve', immersif: true },
    profil: { prenom: 'Lea', nom: 'Test', role: 'eleve' },
    jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null,
  });
  document.querySelector('#quaiTest .ent-nav[data-vue="quai"]').click();
});
const etat42 = (p) => p.evaluate((id) => JSON.parse(JSON.stringify((window.__q.db.quais || {})[id] || null)), ID42);
const JUSTE42 = {
  A1: { compte: 36, decision: 'reserves', motif: 'temperature', res: '-17,5' },
  A2: { comptes: { 'SCI-500': 18, 'SFR-500': 6 }, decision: 'reserves', motif: 'temperature', res: '-17,5' },
  A3: { compte: 48, decision: 'reserves', motif: 'temperature', res: '-17,5' },
  B1: { compte: 60, decision: 'accepter', motif: 'aucun' },
  B2: { compte: 36, decision: 'refuser', motif: 'temperature', res: '-14,8' },
  B3: { compte: 30, decision: 'refuser', motif: 'produit', res: 'CFL-1000', arriere: true },
  B4: { compte: 31, decision: 'reserves', motif: 'manquant', res: '1' },
  B5: { compte: 45, decision: 'accepter', motif: 'aucun' },
};
const N42 = { A1: 0, A2: 1, A3: 2, B1: 3, B2: 4, B3: 5, B4: 6, B5: 7 };
async function decharger42(p, c) {
  await clic(p, `[data-q="decharger"][data-c="${c}"]`);
  if (await p.isVisible(`${Z} [data-q="passer"]`)) await clic(p, '[data-q="passer"]');
  await clic(p, '[data-q="vers3"]');
}
// Contrôle des palettes d'un camion, puis rentrer, écrire, signer. `rapide` : décider sans rien
// contrôler (le chemin le plus court en temps du quai).
async function camion42(p, ids, ecarts = {}, rapide = false) {
  for (const id of ids) {
    const pal = Object.assign({}, JUSTE42[id], ecarts[id] || {});
    await clic(p, `[data-q="sel"][data-n="${N42[id]}"]`);
    if (!rapide) {
      if (pal.sonder !== false) await clic(p, '[data-q="sonder"]');
      if (pal.avant) await clic(p, '[data-q-etiq][data-k="avant"] >> nth=-1');
      if (pal.arriere) { await clic(p, '[data-q="tourner"]'); await clic(p, '[data-q-etiq][data-k="arriere"] >> nth=-1'); }
      if (pal.comptes) {
        for (const [r, n] of Object.entries(pal.comptes)) await p.fill(`${Z} #qCompte-${r}`, String(n));
        await clic(p, '[data-q="compter"]');
      } else if (pal.compte != null) { await p.fill(`${Z} [data-q-compte]`, String(pal.compte)); await clic(p, '[data-q="compter"]'); }
    }
    await p.selectOption(`${Z} [data-q-decision]`, pal.decision);
    await p.selectOption(`${Z} [data-q-motif]`, pal.motif);
  }
  await vers4(p);
  if (!rapide) await clic(p, '[data-q="rentrer"]');
  for (const id of ids) {
    const pal = Object.assign({}, JUSTE42[id], ecarts[id] || {});
    if (pal.res != null && await p.$(`${Z} #qRes-${id}`)) await p.fill(`${Z} #qRes-${id}`, pal.res);
  }
  await clic(p, '[data-q="ecrire"]');
  await clic(p, '[data-q="signer"]');
}
async function debut42(p, { premier = 0, phrase = 'froid' } = {}) {
  await clic(p, '[data-q="ticket"][data-c="0"]');
  await clic(p, '[data-q="ticket"][data-c="1"]');
  await p.check(`${Z} [data-q="ticketRep"][data-c="0"][value="faiblit"]`);
  await p.check(`${Z} [data-q="ticketRep"][data-c="1"][value="rien"]`);
  await p.check(`${Z} [data-q="premier"][value="${premier}"]`); await p.waitForTimeout(40);
  await p.check(`${Z} [data-q="phrase"][value="${phrase}"]`); await p.waitForTimeout(40);
}
async function jouer42(p, ecarts = {}) {
  await debut42(p, ecarts.ordre);
  await decharger42(p, 0);
  await camion42(p, ['A1', 'A2', 'A3'], ecarts);
  await decharger42(p, 1);
  await camion42(p, ['B1', 'B2', 'B3', 'B4', 'B5'], ecarts);
  await clic(p, '[data-q="clore"]');
}

await v('ENT-4.2 : déclaration (C1.4 + C1.3, entraînement, 1re, 30 jalons, livrée fermée aux élèves)', async () => {
  const m = await pg2.evaluate(async () => (await import('/activites/picard-ent42.js')).meta);
  egal([m.id, m.code, m.rubrique, m.competences, m.temps, m.niveaux, m.bareme, m.pret, m.ouverture, m.immersif, !!m.copie],
    ['picard-ent42', 'ENT-4.2', 'logisim', ['C1.4', 'C1.3'], 'entrainement', ['1re'], 30, true, 'prof', true, false], 'meta');
});

await v('ENT-4.2 : écran ① — deux camions, l’ordre ne se choisit qu’après les deux tickets, aucune aide', async () => {
  await monter42(pg2);
  const t = await texte(pg2, Z);
  vrai(t.includes('Deux camions frigorifiques attendent') && t.includes('Camion Glaces Néviane — arrivé à 06:00') && t.includes('Camion Légumes d’Orvalle — arrivé à 06:10'), 'les deux camions');
  egal(await texte(pg2, `${Z} [data-q-heure]`), '06:10', 'heure de prise de poste');
  vrai(!(await pg2.$(`${Z} [data-q="premier"]`)), 'choix de l’ordre avant les tickets');
  vrai(!(await pg2.$(`${Z} [data-q="decharger"]`)), 'bouton de déchargement avant le choix');
  await clic(pg2, '[data-q="ticket"][data-c="0"]');
  vrai(!(await pg2.$(`${Z} [data-q="premier"]`)), 'choix de l’ordre après un seul ticket');
  await clic(pg2, '[data-q="ticket"][data-c="1"]');
  await pg2.check(`${Z} [data-q="premier"][value="1"]`); await pg2.waitForTimeout(40);
  vrai(await pg2.isDisabled(`${Z} [data-q="decharger"][data-c="1"]`), 'déchargement ouvert sans justification');
  egal(await pg2.$$eval(`${Z} .quai-aide, ${Z} [data-q-chef]`, (x) => x.length), 0, 'aides affichées');
  egal(await pg2.$$eval(`${Z} .quai-h-froid`, (x) => x.length), 2, 'une jauge hors froid par camion');
});

await v('ENT-4.2 : parcours juste (A d’abord) → 30 jalons sur 30, glaces à −17,5 °C en réserve, deux jauges indépendantes', async () => {
  await monter42(pg2);
  await jouer42(pg2);
  const j = await jalons(pg2);
  egal([j.pts, j.max, j.ko], [30, 30, []], 'jalons');
  const e = await etat42(pg2);
  egal([e.palettes.A1.sonde, e.palettes.A3.sonde, e.ouvertA], [-17.5, -17.5, 4], 'sonde des glaces / ouverture de A');
  // A : 3 min 30 de déchargement + 3 sondes + 3 comptages (A2 : 2 min) + rentrer 3 = 13 min 30, arrêté là.
  // B : ouvert après la signature de A, il ne compte que ses propres gestes.
  egal([e.froid, e.rentre, e.suivants[0].rentre, e.suivants[0].signe, e.fini], [13.5, true, true, true, true], 'lot A / B');
  // B : 5 min 30 + 5 sondes + tour 30 s + étiquette 30 s + 5 comptages + rentrer 3 = 19 min 30.
  egal(e.suivants[0].froid, 19.5, 'temps hors froid du lot B');
  egal(e.lignes.map((l) => l.texte), [
    'A1 GVA-2500 : acceptée sous réserve — température à cœur −17,5 °C (−18 °C exigé).',
    'A2 SCI-500 + SFR-500 : acceptée sous réserve — température à cœur −17,5 °C (−18 °C exigé).',
    'A3 BCH-060 : acceptée sous réserve — température à cœur −17,5 °C (−18 °C exigé).',
  ], 'réserves du BL de A');
  egal(e.suivants[0].lignes.map((l) => l.texte), [
    'B2 POE-750 : palette REFUSÉE — température à cœur −14,8 °C (−18 °C exigé). 36 cartons repris par le chauffeur.',
    'B3 BRO-1000 : palette REFUSÉE — produit livré CFL-1000 au lieu de BRO-1000 commandé. 30 cartons repris par le chauffeur.',
    'B4 HBE-1000 : acceptée sous réserve — manque 1 carton (BL 32, reçu 31).',
  ], 'réserves du BL de B');
  const b = await texte(pg2, `${Z} .quai-bilan-bloc`);
  vrai(b.includes('Camion Glaces Néviane : temps hors froid du lot 13 min 30') && b.includes('sorties à −17,5 °C à cœur, entre −18 °C et −15 °C : à accepter avec réserves'), 'bilan du camion A : ' + b.slice(0, 400));
  egal(await pg2.$$eval(`${Z} [data-jalon] .quai-ok`, (x) => x.length), 30, 'lignes justes au bilan');
});

await v('ENT-4.2 : B d’abord, au plus vite → les glaces de A à −14,9 °C, à refuser (température réelle)', async () => {
  await monter42(pg2);
  await debut42(pg2, { premier: 1, phrase: 'palettes' });
  await decharger42(pg2, 1);
  // Tout accepter sans contrôler : une seule ligne « Néant » (1 min), le chemin le plus court.
  const toutAccepter = Object.fromEntries(['B1', 'B2', 'B3', 'B4', 'B5'].map((id) => [id, { decision: 'accepter', motif: 'aucun', res: null }]));
  await camion42(pg2, ['B1', 'B2', 'B3', 'B4', 'B5'], toutAccepter, true);
  vrai(await pg2.isDisabled(`${Z} [data-q="clore"]`), 'clore sans le camion A');
  await decharger42(pg2, 0);
  const e = await etat42(pg2);
  egal(e.suivants[0].ouvertA, 4, 'B ouvert après les deux tickets');
  egal(e.ouvertA, 14.5, 'A ouvert au plus tôt après B');
  await clic(pg2, '[data-q="sel"][data-n="0"]');
  await clic(pg2, '[data-q="sonder"]');
  vrai((await texte(pg2, `${Z} [data-q-sonde]`)).includes('−14,9 °C à cœur'), 'sonde de A1');
  const r = await pg2.evaluate(async () => {
    const { jalonsQuai } = await import('/core/types/quai.js');
    const L = jalonsQuai(window.__q.db, window.__q.U.quai).L;
    return Object.fromEntries(['ordre', 'A1-decision', 'A1-reserve'].map((id) => [id, L.find((l) => l.id === id).attendu]));
  });
  egal(r, { ordre: 'camion Glaces Néviane d’abord — « Le ticket des Glaces Néviane montre que leur froid faiblit : les glaces se réchauffent si le camion attend »',
    'A1-decision': 'Refuser — Température non conforme',
    'A1-reserve': 'A1 GVA-2500 : palette REFUSÉE — température à cœur −14,9 °C (−18 °C exigé). 36 cartons repris par le chauffeur.' }, 'attendus');
  // Accepter les glaces est faux ; les refuser pour la température, avec la valeur relevée, est juste.
  await pg2.selectOption(`${Z} [data-q-decision]`, 'accepter');
  vrai((await jalons(pg2)).ko.includes('A1-decision'), 'accepter des glaces à −14,9 °C compte juste');
  await pg2.selectOption(`${Z} [data-q-decision]`, 'refuser');
  await pg2.selectOption(`${Z} [data-q-motif]`, 'temperature');
  vrai(!(await jalons(pg2)).ko.includes('A1-decision'), 'le refus des glaces ne compte pas juste');
});

await v('ENT-4.2 : bon ordre, phrase fausse → seul le jalon d’ordre tombe ; mauvais ordre, bonne phrase aussi', async () => {
  const r = await pg2.evaluate(async () => {
    const { jalonsQuai } = await import('/core/types/quai.js');
    const Q = window.__q.U.quai;
    const ko = (premier, phrase) => jalonsQuai({ quais: { [Q.id]: { minute: 4, decharge: true, ouvertA: 4, palettes: {}, ordre: { premier, phrase }, suivants: [{}] } } }, Q)
      .L.find((l) => l.id === 'ordre').ok;
    return [ko(0, 'froid'), ko(0, 'arrive'), ko(0, 'cher'), ko(1, 'froid'), ko(1, 'palettes')];
  });
  egal(r, [true, false, false, false, false], 'jalon d’ordre');
  await monter42(pg2);
  await jouer42(pg2, { ordre: { premier: 0, phrase: 'arrive' } });
  egal((await jalons(pg2)).ko, ['ordre'], 'jalons faux');
});

await v('ENT-4.2 : A d’abord, glaces à −17,5 °C — accepter ou refuser est faux, seules les réserves sont justes', async () => {
  await monter42(pg2);
  await jouer42(pg2, { A1: { decision: 'accepter', motif: 'aucun', res: null }, A3: { decision: 'refuser', motif: 'temperature' } });
  egal((await jalons(pg2)).ko, ['A1-decision', 'A3-decision', 'A1-reserve', 'A3-reserve'], 'jalons faux');
  await monter42(pg2);
  await jouer42(pg2, { A2: { res: '-18,5' } });
  egal((await jalons(pg2)).ko, ['A2-reserve'], 'réserve avec la température de départ au lieu de la température relevée');
});

await v('ENT-4.2 : A2 multi-références comptée d’un bloc → faux ; B2 non sondée → faux ; B3 sans l’arrière → faux', async () => {
  await monter42(pg2);
  await jouer42(pg2, {
    A2: { comptes: { 'SCI-500': 24, 'SFR-500': 0 } },
    B2: { sonder: false },
    B3: { arriere: false, avant: true },
  });
  egal((await jalons(pg2)).ko, ['A2-comptage', 'B2-decision', 'B3-decision'], 'jalons faux');
  const e = await etat42(pg2);
  egal(e.palettes.B3.etiqLues, ['avant'], 'étiquettes lues de B3');
});

await v('ENT-4.2 : étiquettes — avant déchirée, arrière lisible ; une étiquette par référence sur A2', async () => {
  await monter42(pg2);
  await debut42(pg2);
  await decharger42(pg2, 0);
  await clic(pg2, '[data-q="sel"][data-n="1"]');
  egal(await pg2.$$eval(`${Z} [data-q-etiq]`, (x) => [...new Set(x.map((g) => g.dataset.k))]), ['SCI-500', 'SFR-500'], 'étiquettes de A2');
  vrai((await pg2.$$eval(`${Z} [data-q-bande]`, (x) => x.length)) > 0, 'bandes de couleur des deux références');
  await clic(pg2, '[data-q-etiq][data-k="SFR-500"] >> nth=-1');
  vrai((await texte(pg2, `${Z} [data-q-etiquette]`)).includes('Réf. SFR-500'), 'étiquette framboise');
  egal(await pg2.$$eval(`${Z} [data-q-compte-ref]`, (x) => x.map((i) => i.dataset.qCompteRef)), ['SCI-500', 'SFR-500'], 'un comptage par référence');
  // B3, après le camion A.
  await camion42(pg2, ['A1', 'A2', 'A3']);
  await decharger42(pg2, 1);
  await clic(pg2, '[data-q="sel"][data-n="5"]');
  egal(await pg2.$$eval(`${Z} [data-q-etiq]`, (x) => [...new Set(x.map((g) => g.dataset.k))]), ['avant'], 'de face, seule l’étiquette avant');
  vrai(await pg2.$(`${Z} [data-q-dechiree]`), 'étiquette avant non déchirée');
  await clic(pg2, '[data-q-etiq][data-k="avant"] >> nth=-1');
  const t = await texte(pg2, `${Z} [data-q-etiquette]`);
  vrai(t.includes('étiquette déchirée') && !t.includes('CFL-1000') && !t.includes('BRO-1000'), 'étiquette avant : ' + t);
  await clic(pg2, '[data-q="tourner"]');
  await clic(pg2, '[data-q-etiq][data-k="arriere"] >> nth=-1');
  vrai((await texte(pg2, `${Z} [data-q-etiquette]`)).includes('Réf. CFL-1000'), 'étiquette arrière');
});

await v('ENT-4.2 : un seul quai — B ne se met à quai qu’une fois A reparti ; la manœuvre coûte 3 min', async () => {
  await monter42(pg2);
  await debut42(pg2);
  await decharger42(pg2, 0);
  await clic(pg2, '[data-q="etape"][data-n="1"]');
  vrai(await pg2.isDisabled(`${Z} [data-q="decharger"][data-c="1"]`), 'B se met à quai avant le départ de A');
  await clic(pg2, '[data-q="etape"][data-n="3"]');
  await camion42(pg2, ['A1', 'A2', 'A3']);
  const avant = (await etat42(pg2)).minute;
  await decharger42(pg2, 1);
  const e = await etat42(pg2);
  egal([e.suivants[0].ouvertA - avant, e.actif], [3, 1], 'manœuvre / camion montré');
});

await v('contrôle : « Valider cette palette » coche l’onglet et passe à la suivante ; rien n’est figé', async () => {
  await monter42(pg2);
  await debut42(pg2);
  await decharger42(pg2, 0);
  vrai(await pg2.isDisabled(`${Z} [data-q="valider"]`), 'valider sans décision');
  await pg2.fill(`${Z} [data-q-compte]`, '36');
  await clic(pg2, '[data-q="compter"]');
  await pg2.selectOption(`${Z} [data-q-decision]`, 'accepter');
  await clic(pg2, '[data-q="valider"]');
  const e = await etat42(pg2);
  egal([e.palettes.A1.valide, e.sel], [true, 1], 'A1 validée, A2 sélectionnée');
  vrai((await texte(pg2, `${Z} [data-q="sel"][data-n="0"]`)).includes('✓ validée'), 'onglet de A1');
  // Rien de figé : on revient sur A1 et on change la décision.
  await clic(pg2, '[data-q="sel"][data-n="0"]');
  vrai(!(await pg2.isDisabled(`${Z} [data-q-decision]`)), 'A1 figée après validation');
  await pg2.selectOption(`${Z} [data-q-decision]`, 'reserves');
  egal((await etat42(pg2)).palettes.A1.decision, 'reserves', 'décision changée');
});

await v('contrôle : « Valider » grisé tant qu’il manque le comptage, la décision ou le motif ; actif quand tout est rempli', async () => {
  await monter42(pg2);
  await debut42(pg2);
  await decharger42(pg2, 0);
  const phrase = () => texte(pg2, `${Z} [data-q-valide]`);
  // A1 : rien de rempli.
  vrai(await pg2.isDisabled(`${Z} [data-q="valider"]`), 'actif sans rien');
  vrai((await phrase()).includes('note le comptage'), 'phrase : ' + await phrase());
  // Décision « réserves » sans comptage ni motif : toujours grisé, la phrase dit les deux.
  await pg2.selectOption(`${Z} [data-q-decision]`, 'reserves');
  vrai(await pg2.isDisabled(`${Z} [data-q="valider"]`), 'actif sans comptage');
  vrai((await phrase()).includes('note le comptage') && (await phrase()).includes('motif'), 'phrase : ' + await phrase());
  // Comptage noté, motif encore « aucun » : grisé.
  await pg2.fill(`${Z} [data-q-compte]`, '36');
  await clic(pg2, '[data-q="compter"]');
  vrai(await pg2.isDisabled(`${Z} [data-q="valider"]`), 'actif sans motif');
  vrai(!(await phrase()).includes('comptage') && (await phrase()).includes('motif'), 'phrase : ' + await phrase());
  await pg2.selectOption(`${Z} [data-q-motif]`, 'temperature');
  vrai(!(await pg2.isDisabled(`${Z} [data-q="valider"]`)), 'grisé alors que tout est rempli');
  egal(await phrase(), '', 'phrase quand tout est rempli');
  // A2, deux références : une seule notée ne suffit pas (le bouton « Noter » refuse un champ vide).
  await clic(pg2, '[data-q="sel"][data-n="1"]');
  await pg2.selectOption(`${Z} [data-q-decision]`, 'accepter');
  vrai(await pg2.isDisabled(`${Z} [data-q="valider"]`), 'A2 actif sans comptage');
  vrai((await phrase()).includes('chaque référence'), 'phrase A2 : ' + await phrase());
  await pg2.fill(`${Z} #qCompte-SCI-500`, '18');
  await pg2.fill(`${Z} #qCompte-SFR-500`, '6');
  await clic(pg2, '[data-q="compter"]');
  vrai(!(await pg2.isDisabled(`${Z} [data-q="valider"]`)), 'A2 grisé une fois les deux références notées');
  // Accepter n'exige pas de motif : A2 se valide.
  await clic(pg2, '[data-q="valider"]');
  vrai((await etat42(pg2)).palettes.A2.valide, 'A2 non validée');
});

await v('contrôle : le bouton des réserves est en haut à droite et demande confirmation (palettes non validées comptées)', async () => {
  vrai(await pg2.$(`${Z} .quai-titre-ligne [data-q="vers4"]`), 'bouton absent du haut de l’écran');
  egal(await pg2.$$eval(`${Z} .quai-outils [data-q="vers4"]`, (x) => x.length), 0, 'bouton encore sous la palette');
  await clic(pg2, '[data-q="vers4"]');
  vrai((await texte(pg2, `${Z} [data-q-vers4]`)).includes('2 palettes non validées : passer quand même ? Cliquez pour confirmer'), 'confirmation : ' + await texte(pg2, `${Z} [data-q-vers4]`));
  egal((await etat42(pg2)).etape, 3, 'passé aux réserves au premier clic');
  await clic(pg2, '[data-q="desarmer4"]');
  vrai(!(await pg2.$(`${Z} [data-q="vers4"].quai-arme`)), 'annuler ne désarme pas');
  await clic(pg2, '[data-q="vers4"]');
  await clic(pg2, '[data-q="vers4"]');
  egal((await etat42(pg2)).etape, 4, 'pas aux réserves après confirmation');
  // « Revoir le bon de livraison » porte le nom du camion, en grand.
  await clic(pg2, '[data-q="etape"][data-n="3"]');
  vrai((await texte(pg2, `${Z} .quai-rappel-bl summary`)).includes('Revoir le bon de livraison du camion Glaces Néviane'), 'rappel du BL');
  const taille = await pg2.$eval(`${Z} .quai-rappel-bl summary`, (x) => parseFloat(getComputedStyle(x).fontSize));
  vrai(taille >= 16, 'rappel du BL trop petit : ' + taille);
});

await v('ENT-4.2 : aucun jalon n’est vrai par inaction', async () => {
  await monter42(pg2);
  egal([(await jalons(pg2)).pts, (await jalons(pg2)).max], [0, 30], 'base neuve');
  await debut42(pg2);
  await decharger42(pg2, 0);
  const j = await jalons(pg2);
  // Le seul jalon gagné : l'ordre choisi (et justifié), plus les deux tickets bien lus.
  egal(j.pts, 3, 'jalons après le seul déchargement de A : ' + JSON.stringify(j.ko));
  vrai(j.ko.includes('A1-reserve') && j.ko.includes('deballage') && j.ko.includes('rentre-A'), 'réserve « aucune ligne » vraie sans papiers');
});

await v('ENT-4.2 : corrigé — tickets, ordre, palettes et réserves des deux chemins', async () => {
  const c = await pg2.evaluate(async () => (await import('/contenus/corriges/ENT-4.2.js')).CORRIGE);
  vrai(c.items[1].rep.includes('camion Glaces Néviane d’abord'), 'ordre');
  const pal = c.items.find((i) => i.etape === 3 && i.genre === 'tableau').reponses.map((r) => [r[0], r[3], r[5]]);
  const res = 'Accepter avec réserves — Température non conforme';
  egal(pal, [
    ['A1', '36 (3 × 3 × 4)', res], ['A2', 'SCI-500 : 18 · SFR-500 : 6', res],
    ['A3', '48 (4 × 3 × 4)', res], ['B1', '60 (4 × 3 × 5)', 'Accepter — aucun motif'],
    ['B2', '36 (3 × 3 × 4)', 'Refuser — Température non conforme'], ['B3', '30 (3 × 2 × 5)', 'Refuser — Produit différent de la commande'],
    ['B4', '31 (4 × 2 × 4 − 1)', 'Accepter avec réserves — Manquant'], ['B5', '45 (3 × 3 × 5)', 'Accepter — aucun motif'],
  ], 'tableau des palettes');
  const tard = c.items.find((i) => /d’abord$/.test(i.texte) && i.texte.startsWith('Si le camion Légumes')).reponses;
  egal(tard.map((r) => r[1]), ['Refuser — Température non conforme', 'Refuser — Température non conforme', 'Refuser — Température non conforme'], 'B d’abord');
  vrai(tard[0][2].includes('−14,9 °C'), 'température de A au plus tôt');
  const bl = c.items.filter((i) => i.genre === 'tableau')[1].reponses;
  egal(bl.map((r) => r[0]), ['A1', 'A2', 'A3', 'B2', 'B3', 'B4'], 'réserves attendues, A d’abord');
  vrai(bl[0][1].includes('température à cœur −17,5 °C'), 'réserve de A1 : ' + bl[0][1]);
});

// La règle du quai à trois zones vaut pour TOUTES les séances Picard (ENT-4.1 à 4.4) : une palette
// déclarée dont la seule anomalie est la température doit suivre −18 / −15. Ce cas relit chaque
// contenu `contenus/picard-ent4*.js` : une séance nouvelle y est soumise d'office.
await v('Picard : chaque palette déclarée suit la règle −18 / −15 (accepter, réserves, refuser)', async () => {
  const fs = await import('node:fs');
  const fichiers = fs.readdirSync(new URL('../../contenus/', import.meta.url)).filter((f) => /^picard-ent4\d+\.js$/.test(f));
  vrai(fichiers.length >= 2, 'contenus Picard introuvables : ' + fichiers);
  const fautes = [];
  let n = 0;
  for (const f of fichiers) {
    const m = await import(new URL(`../../contenus/${f}`, import.meta.url));
    for (const Q of Object.values(m).filter((x) => x && Array.isArray(x.camions))) {
      for (const c of Q.camions) for (const p of c.palettes || []) {
        n++;
        if (c.rechauffeEnAttente) continue; // décision recalculée par la vue sur la température réelle
        const autre = (p.manque || []).length || Object.keys(p.avarie || {}).length || p.attendu === 'refuser' && p.motifAttendu === 'produit'
          || (p.attendu === 'reserves' && p.motifAttendu !== 'temperature');
        const zone = p.temp > -15 ? 'refuser' : p.temp > -18 ? 'reserves' : null;
        if (zone && (p.attendu !== zone || p.motifAttendu !== 'temperature')) fautes.push(`${f} ${p.id} ${p.temp} : ${p.attendu}/${p.motifAttendu}`);
        if (!zone && !autre && p.motifAttendu === 'temperature') fautes.push(`${f} ${p.id} ${p.temp} : température conforme mais motif température`);
      }
    }
  }
  vrai(n >= 13, `seulement ${n} palettes lues`);
  egal(fautes, [], 'palettes hors de la règle');
});

await v('ENT-4.2 : sous le logo Picard dans Logisim, elle s’ouvre sur l’accueil et le mail des deux camions', async () => {
  // Contexte neuf : celui du bloc garde la session enseignant ouverte par le test d'ENT-4.1.
  const { ctx, pg: p, erreurs } = await contexte();
  await p.click('#btnProf');
  await p.click('[data-rub="logisim"]');
  await p.click('[data-ent="4"]');
  await p.click('[data-act="picard-ent42"]');
  await p.waitForSelector('.ent-bandeau');
  vrai((await texte(p, '.ent-bandeau')).includes('ENT-4.2'), 'bandeau de séance');
  vrai((await texte(p, '.ent-main')).includes('Deux camions, un seul quai'), 'accueil de la séance');
  await p.click('.ent-nav[data-vue="mail"]');
  vrai((await texte(p, '.ent-main')).includes('Quai 32 : deux camions ce matin'), 'mail du chef de quai');
  egal(erreurs, [], 'erreurs JS');
  await ctx.close();
});

/* ============================================================ ENT-4.3 : la réception de nuit */
// Valeurs écrites à la main (brief §5) : N1 4×3×4 − 4 = 44 = BL (fausse piste) ; N2 fiche −14 °C « OK », sonde
// d'aujourd'hui −21,0 °C → bloquer ; N3 4×2×5 − 3 = 37 pour 40 au BL (fiche : 40) ; BL SL-26-1207, réception 03 h 10.
const ID43 = 'picard-ent43';
const monter43 = (p) => p.evaluate(async () => {
  const { creerEntreprise } = await import('/core/types/entreprise.js');
  const P = await import('/contenus/picard.js');
  const S = await import('/contenus/picard-ent43.js');
  document.querySelector('#quaiTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'quaiTest'; document.body.appendChild(hote);
  const U = { ENTREPRISE: P.ENTREPRISE, VOCAB: P.VOCAB, CATALOGUE: P.catalogue(S.PRODUITS_ENT43), SUPPLIERS: P.SUPPLIERS,
    SUP_BY_ID: P.SUP_BY_ID, CUSTOMERS: P.CUSTOMERS, CM: P.CM, THEME: P.THEME, baseDeDepart: P.baseDeDepart,
    etapes: S.ETAPES, exercice: 'ENT-4.3', accueil: S.ACCUEIL, volet: S.VOLET, quai: S.QUAI_ENT43 };
  const db = {};
  window.__q = { db, U, S, moteur: creerEntreprise(U), remis: null };
  window.__q.moteur.rendre(hote, {
    meta: { id: 'picard-ent43', code: 'ENT-4.3', titre: 'Picard', portee: 'eleve', immersif: true },
    profil: { prenom: 'Lea', nom: 'Test', role: 'eleve' },
    jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC', lireScore: async () => null,
  });
  document.querySelector('#quaiTest .ent-nav[data-vue="quai"]').click();
});
const etat43 = (p) => p.evaluate((id) => JSON.parse(JSON.stringify((window.__q.db.quais || {})[id] || null)), ID43);
const auQuai = async (p) => { await p.click('#quaiTest .ent-nav[data-vue="quai"]'); await p.waitForTimeout(40); };
const jalons43 = (p) => p.evaluate(async () => {
  const { jalonsQuai } = await import('/core/types/quai.js');
  const r = jalonsQuai(window.__q.db, window.__q.U.quai);
  return { pts: r.pts, max: r.max, ok: r.L.filter((l) => l.ok).map((l) => l.id) };
});
// Répondre, dans la messagerie, au message reçu dont l'objet commence par `objet`.
async function repondre(p, objet, texte) {
  await p.click('#quaiTest .ent-nav[data-vue="mail"]');
  await p.click('#quaiTest [data-dossier="in"]');
  const id = await p.evaluate((o) => window.__q.db.mails.find((m) => m.folder === 'in' && m.subject.startsWith(o)).id, objet);
  await p.click(`#quaiTest [data-mail="${id}"]`);
  await p.click('#quaiTest [data-repondre]');
  await p.fill('#quaiTest #repT', texte);
  await p.click('#quaiTest #formRep button[type="submit"]');
  await p.waitForTimeout(60);
}
const DIAG_JUSTE = ['Palette acceptée à tort : N2', 'Preuve : sa fiche dit -14 °C à cœur', 'Manquant : N3, 3 cartons',
  'Réserve : « sous réserve de déballage » ne vaut rien', 'Délai : encore dans le délai'].join('\n');
const protJuste = (jour) => ['BL : SL-26-1207', `Réceptionné le : ${jour.split('-').reverse().join('/')}`, 'Palette : N2 et N3',
  'Constat : N2 température de -14 °C à la réception, N3 cartons manquants', 'Quantité : 3 cartons sur N3'].join('\n');
const bloquer43 = async (p, n) => {
  await clic(p, '[data-q="onglet"][data-v="chambre"]');
  await clic(p, `[data-q="sel"][data-n="${n}"]`);
  await clic(p, '[data-q="bloquer"]');
};
const terminer43 = async (p) => { await clic(p, '[data-q="terminer"]'); await clic(p, '[data-q="terminer"]'); };

await v('ENT-4.3 : meta (erreur induite C1.4, 1re, livrée fermée aux élèves, dix jalons)', async () => {
  const m = await pg2.evaluate(async () => (await import('/activites/picard-ent43.js')).meta);
  egal([m.id, m.code, m.rubrique, m.competences, m.temps, m.niveaux, m.bareme, m.pret, m.ouverture, m.immersif, m.portee, !!m.copie],
    ['picard-ent43', 'ENT-4.3', 'logisim', ['C1.4'], 'erreur', ['1re'], 10, true, 'prof', true, 'eleve', false], 'meta');
});

await v('ENT-4.3 : contenu — N2 acceptée à tort au-dessus de −15 °C, N3 37 pour 40, N1 conforme ; tout à −21 °C aujourd’hui', async () => {
  const S = await import(new URL('../../contenus/picard-ent43.js', import.meta.url));
  const pal = Object.fromEntries(S.PALETTES_ENT43.map((p) => [p.id, p]));
  const fiche = Object.fromEntries(S.FICHE.map((f) => [f.id, f]));
  const reel = (p) => p.W * p.D * p.L - p.manque.length;
  egal([reel(pal.N1), pal.N1.bl, reel(pal.N3), pal.N3.bl, fiche.N3.compte], [44, 44, 37, 40, 40], 'comptages');
  vrai(fiche.N2.temp > -15 && fiche.N2.decision === 'Acceptée', 'N2 doit être acceptée au-dessus de −15 °C sur la fiche');
  vrai(S.FICHE.filter((f) => f.id !== 'N2').every((f) => f.temp <= -18), 'une autre palette hors de la règle sur la fiche');
  vrai(S.PALETTES_ENT43.every((p) => p.temp <= -20.5), 'la sonde d’aujourd’hui trahirait la réponse');
  egal(S.PALETTES_ENT43.filter((p) => p.bloquer).map((p) => p.id), ['N2'], 'palettes à bloquer');
});

await v('ENT-4.3 : temps 1 figé — le dossier de Mathis se lit, aucun bouton Bloquer ni « J’ai terminé », les gestes ne changent pas le dossier', async () => {
  await monter43(pg2);
  vrai((await texte(pg2, `${Z} [data-q-temps]`)).startsWith('Temps 1 — Contrôler'), 'bandeau du temps 1');
  const avant = await texte(pg2, `${Z} [data-q-dossier]`) + await texte(pg2, `${Z} [data-q-fiche-tableau]`);
  vrai(avant.includes('Sous réserve de déballage.') && avant.includes('SL-26-1207'), 'BL signé : ' + avant.slice(0, 200));
  vrai((await texte(pg2, `${Z} [data-q-fiche="N2"]`)).includes('−14 °C'), 'fiche N2');
  await clic(pg2, '[data-q="onglet"][data-v="chambre"]');
  await clic(pg2, '[data-q="sel"][data-n="2"]');
  await clic(pg2, '[data-q="tourner"]');
  await clic(pg2, '[data-q="sonder"]');
  await pg2.fill(`${Z} [data-q-compte]`, '37');
  await clic(pg2, '[data-q="compter"]');
  egal(await pg2.$$eval(`${Z} [data-q="bloquer"], ${Z} [data-q="debloquer"], ${Z} [data-q="terminer"]`, (x) => x.length), 0, 'boutons du temps 2 au temps 1');
  vrai(await pg2.$(`${Z} [data-q-pas-bloquer]`), 'phrase du temps 1');
  vrai((await texte(pg2, `${Z} [data-q-rcompte]`)).includes('Ton comptage : 37 cartons · fiche de Mathis : 40 · BL : 40'), 'comptage noté');
  await clic(pg2, '[data-q="onglet"][data-v="dossier"]');
  egal(await texte(pg2, `${Z} [data-q-dossier]`) + await texte(pg2, `${Z} [data-q-fiche-tableau]`), avant, 'dossier modifié par les gestes');
  const e = await etat43(pg2);
  egal([e.phase, Object.values(e.palettes).some((s) => s.bloque), e.fini], [1, false, false], 'état du temps 1');
});

await v('ENT-4.3 : re-sonder N2 lit −21,0 °C (la sonde ne trahit rien), la fiche dit −14 °C', async () => {
  await clic(pg2, '[data-q="onglet"][data-v="chambre"]');
  await clic(pg2, '[data-q="sel"][data-n="1"]');
  await clic(pg2, '[data-q="sonder"]');
  egal(await texte(pg2, `${Z} [data-q-sonde]`), '−21,0 °C à cœur maintenant', 'sonde N2');
  egal(await texte(pg2, `${Z} [data-q-fiche-temp]`), '−14 °C', 'fiche N2');
});

await v('ENT-4.3 : N3 se regarde de l’arrière et compte 37 cartons dessinés (4 × 2 × 5 − 3)', async () => {
  await clic(pg2, '[data-q="sel"][data-n="2"]');
  // N3 a déjà fait un quart de tour : deux de plus pour la vue de l'arrière.
  while (!(await texte(pg2, `${Z} [data-q-palette]`)).includes('vue de l’arrière')) await clic(pg2, '[data-q="tourner"]');
  // 4 × 2 × 5 − 3 = 37 cartons dessinés.
  const n = await pg2.$$eval(`${Z} [data-q-palette] polygon[fill="#e6cfa3"]`, (x) => x.length);
  egal(n, 37, 'cartons dessinés');
});

await v('ENT-4.3 : un diagnostic FAUX ouvre quand même le temps 2, une seule fois ; le chef ne dit pas quoi corriger', async () => {
  await monter43(pg2);
  await repondre(pg2, 'Réception de nuit', 'Palette acceptée à tort : aucune\nPreuve :\nManquant : aucun\nRéserve :\nDélai :');
  let e = await etat43(pg2);
  egal(e.phase, 2, 'temps 2 non ouvert');
  const reponses = await pg2.evaluate(() => window.__q.db.mails.filter((m) => m.folder === 'in' && m.subject === 'Re : réception de nuit').map((m) => m.text));
  egal(reponses.length, 1, 'réponse du chef');
  vrai(!/N2|N3|déballage/.test(reponses[0]), 'la réponse du chef révèle : ' + reponses[0]);
  await repondre(pg2, 'Réception de nuit', DIAG_JUSTE);
  egal(await pg2.evaluate(() => window.__q.db.mails.filter((m) => m.subject === 'Re : réception de nuit').length), 1, 'réponse du chef en double');
  await auQuai(pg2);
  vrai((await texte(pg2, `${Z} [data-q-temps]`)).startsWith('Temps 2 — Corriger'), 'bandeau du temps 2');
  vrai(await pg2.$(`${Z} [data-q="terminer"]`), '« J’ai terminé » absent au temps 2');
});

await v('ENT-4.3 : parcours juste — diagnostic, N2 bloquée, protestation, « J’ai terminé » : 10/10 et bilan', async () => {
  await monter43(pg2);
  egal((await jalons43(pg2)).pts, 0, 'jalons avant tout');
  await repondre(pg2, 'Réception de nuit', DIAG_JUSTE);
  await auQuai(pg2);
  await bloquer43(pg2, 1);
  const jour = (await etat43(pg2)).jour;
  await repondre(pg2, 'Avis de livraison', protJuste(jour));
  await auQuai(pg2);
  await terminer43(pg2);
  const j = await jalons43(pg2);
  egal([j.pts, j.max], [10, 10], 'jalons : ' + j.ok);
  egal(await pg2.$$eval(`${Z} [data-q-bilan] tr[data-jalon]`, (x) => x.length), 10, 'lignes du bilan');
  vrai((await texte(pg2, `${Z} [data-q-bilan] tr[data-jalon="diag-n2"]`)).includes('sa fiche dit -14 °C à cœur'), 'le bilan montre la ligne telle que tapée');
  const etapes = await pg2.evaluate(() => window.__q.S.ETAPES.map((x) => x.verifier(window.__q.db).status));
  egal(etapes.filter((x) => x === 'ok').length, 10, 'suivi');
});

await v('ENT-4.3 : « J’ai terminé » est définitif (deux clics) — plus de blocage possible, même forcé', async () => {
  const e = await etat43(pg2);
  vrai(e.fini && e.termine, 'non terminé');
  vrai(await pg2.isDisabled(`${Z} [data-q="debloquer"]`), 'débloquer encore actif');
  await pg2.evaluate(() => { const b = document.querySelector('#quaiTest [data-q="debloquer"]'); b.disabled = false; b.click(); });
  egal((await etat43(pg2)).palettes.N2.bloque, true, 'débloquée après « J’ai terminé »');
});

await v('ENT-4.3 : N1 accusée → faux ; N4 bloquée → faux ; protestation sans quantité → faux ; le reste juste', async () => {
  await monter43(pg2);
  await repondre(pg2, 'Réception de nuit', DIAG_JUSTE.replace('Manquant : N3, 3 cartons', 'Manquant : N3, 3 cartons ; N1, 4 cartons'));
  await auQuai(pg2);
  await bloquer43(pg2, 1);
  await clic(pg2, '[data-q="sel"][data-n="3"]');
  await clic(pg2, '[data-q="bloquer"]');
  const jour = (await etat43(pg2)).jour;
  await repondre(pg2, 'Avis de livraison', protJuste(jour).replace('Quantité : 3 cartons sur N3', 'Quantité :'));
  const j = await jalons43(pg2);
  egal(['diag-n1', 'diag-n3', 'bloque-autres', 'prot-constat'].filter((id) => !j.ok.includes(id)), ['diag-n1', 'diag-n3', 'bloque-autres', 'prot-constat'], 'jalons faux');
  egal(j.pts, 6, 'jalons justes : ' + j.ok);
  // Débloquer N4 (permis tant que « J’ai terminé » n’est pas cliqué) répare le jalon du blocage.
  await auQuai(pg2);
  await clic(pg2, '[data-q="onglet"][data-v="chambre"]');
  await clic(pg2, '[data-q="sel"][data-n="3"]');
  await clic(pg2, '[data-q="debloquer"]');
  vrai((await jalons43(pg2)).ok.includes('bloque-autres'), 'débloquer N4 ne répare pas');
});

await v('ENT-4.3 : aucun jalon n’est vrai par inaction (même temps 2 ouvert par un message vide de sens)', async () => {
  await monter43(pg2);
  egal((await jalons43(pg2)).pts, 0, 'base neuve');
  await repondre(pg2, 'Réception de nuit', 'ok');
  await auQuai(pg2);
  await terminer43(pg2);
  const j = await jalons43(pg2);
  // « N1 non accusée » est le seul jalon que donne un diagnostic envoyé sans rien accuser (brief §8).
  egal(j.ok, ['diag-n1'], 'jalons vrais');
});

await v('ENT-4.3 : lecture des lignes — délai (« pas dépassé » juste, « trop tard » faux), date sous trois formes, palettes', async () => {
  const S = await import(new URL('../../contenus/picard-ent43.js', import.meta.url));
  const delai = (l) => S.jalonsDiagnostic({ mails: [{ folder: 'out', toMail: S.CHEF.mail, ts: 1, text: `Délai : ${l}` }] }).find((x) => x.id === 'diag-delai').ok;
  egal(['encore dans le délai', 'pas dépassé', 'oui, 3 jours', 'trop tard', 'non', 'délai dépassé', 'impossible'].map(delai),
    [true, true, true, false, false, false, false], 'délai');
  egal(['13/10/2026', 'le 13/10', '13 octobre 2026', '14/10/2026', '13/11/2026'].map((d) => S.dateJuste(d.toLowerCase(), '2026-10-13')),
    [true, true, true, false, false], 'dates');
  egal([S.palettesCitees('n2 et n3'), S.palettesCitees('N 2, N3, n2')], [['N2', 'N3'], ['N2', 'N3']], 'palettes citées');
});

await v('ENT-4.3 : le bouton Messagerie mène aux messages, un lien ramène au quai', async () => {
  await monter43(pg2);
  await clic(pg2, '[data-q="messagerie"]');
  vrai((await texte(pg2, Z)).includes('Réception de nuit : à vérifier ce matin'), 'messagerie non ouverte');
  await pg2.click('#quaiTest [data-retour-quai]');
  await pg2.waitForTimeout(40);
  vrai(await pg2.$(`${Z} [data-quai="picard-ent43"]`), 'pas revenu au quai');
});

await v('ENT-4.3 : corrigé — palettes, diagnostic et protestation', async () => {
  const { CORRIGE: c } = await import(new URL('../../contenus/corriges/ENT-4.3.js', import.meta.url));
  egal(c.items[0].reponses.map((r) => r[0]), ['N1', 'N2', 'N3', 'N4', 'N5'], 'palettes');
  vrai(c.items[0].reponses[2][2].startsWith('37 cartons (BL 40)'), 'N3 : ' + c.items[0].reponses[2][2]);
  vrai(c.items[1].rep.includes('Palette acceptée à tort : N2') && c.items[3].rep.includes('BL : SL-26-1207'), 'messages');
});

await v('ENT-4.3 : sous le logo Picard dans Logisim, elle s’ouvre sur l’accueil et les trois messages', async () => {
  const { ctx, pg: p, erreurs } = await contexte();
  await p.click('#btnProf');
  await p.click('[data-rub="logisim"]');
  await p.click('[data-ent="4"]');
  await p.click('[data-act="picard-ent43"]');
  await p.waitForSelector('.ent-bandeau');
  vrai((await texte(p, '.ent-bandeau')).includes('ENT-4.3'), 'bandeau de séance');
  vrai((await texte(p, '.ent-main')).includes('La réception de nuit'), 'accueil de la séance');
  await p.click('.ent-nav[data-vue="mail"]');
  const m = await texte(p, '.ent-main');
  vrai(m.includes('Réception de nuit : à vérifier ce matin') && m.includes('Camion Givrex de 3 h') && m.includes('Avis de livraison'), 'messages : ' + m.slice(0, 300));
  egal(erreurs, [], 'erreurs JS');
  await ctx.close();
});

/* ============================================== ENT-4.4 — évaluation, un camion tiré par élève */
// Chantier P6 (03/10/2026, brief `docs/briefs/ENT-4.4-picard-evaluation.md`). Le tirage
// (`core/tirage.js`, `contenus/picard-ent44.js`) est éprouvé hors du navigateur sur des centaines
// de graines ; la séance, montée par son activité (`activites/picard-ent44.js`), à la souris.
//
// Le camion de l'élève « eleve-A », écrit À LA MAIN (relu à l'écran le 03/10/2026) :
//   P1  ECC-4    4×2×5 − 4 = 36 (BL 36)   couche du dessus incomplète   accepter
//   P2  PRO-12   4×2×5 − 1 = 39 (BL 40)   1 manquant + 3 écrasés         réserves — manquant (1) + cartons endommagés (3)
//   P3  PAE-1000 4×2×5 = 40, −14,2 °C                                  refuser — température (−14,2)
//   P4  HAP-800  4×3×5 = 60, 3 écrasés                                 réserves — cartons endommagés (3)
//   P5  TAP-750  3×3×4 = 36, étiquette TAF-750                         refuser — produit différent (TAF-750)
//   P6  GRD-1000 4×3×4 = 48                                            accepter
// Parcours juste sans tour ni étiquette : 6 min 30 + 6 sondes + 6 comptages + 3 min = 21 min 30 hors froid.
const ID44 = 'picard-ent44';
const JUSTE44 = {
  P1: { compte: 36, decision: 'accepter', motif: 'aucun' },
  P2: { compte: 39, decision: 'reserves', motif: 'manquant', res: '1', motif2: 'avarie', res2: '3' },
  P3: { compte: 40, decision: 'refuser', motif: 'temperature', res: '-14,2' },
  P4: { compte: 60, decision: 'reserves', motif: 'avarie', res: '3' },
  P5: { compte: 36, decision: 'refuser', motif: 'produit', res: 'TAF-750' },
  P6: { compte: 48, decision: 'accepter', motif: 'aucun' },
};
// Monte l'activité ENT-4.4 elle-même (son `rendre`), pour l'élève `uid`, dans une base neuve ou
// gardée dans le stockage du navigateur (`garder`).
const monter44 = (p, o = {}) => p.evaluate(async (o) => {
  const A = await import('/activites/picard-ent44.js');
  document.querySelector('#quaiTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'quaiTest'; document.body.appendChild(hote);
  const CLE = 'essai-ent44-base';
  const db = o.garder ? JSON.parse(localStorage.getItem(CLE) || '{}') : {};
  window.__q = { db, A, remis: null };
  A.rendre(hote, {
    meta: A.meta,
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'eleve-A' },
    tiersTemps: !!o.tiers,
    jeu: { etat: () => db, sauver: () => { if (o.garder) localStorage.setItem(CLE, JSON.stringify(db)); } },
    enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
    lireScore: async () => null,
    rendreCopie: async (res) => { window.__q.remis = res; return { rendu: Date.now() }; },
  });
  if (!o.accueil) document.querySelector('#quaiTest .ent-nav[data-vue="quai"]').click();
}, o);
const etat44 = (p) => p.evaluate((id) => JSON.parse(JSON.stringify((window.__q.db.quais || {})[id] || null)), ID44);
async function jouer44(p, ecarts = {}) {
  await clic(p, '[data-q="ticket"]');
  await p.check(`${Z} [data-q="ticketRep"][value="long"]`);
  await clic(p, '[data-q="decharger"]');
  if (await p.isVisible(`${Z} [data-q="passer"]`)) await clic(p, '[data-q="passer"]');
  await clic(p, '[data-q="vers3"]');
  const ids = Object.keys(JUSTE44);
  const pal = (id) => Object.assign({}, JUSTE44[id], ecarts[id] || {});
  for (let n = 0; n < ids.length; n++) {
    const x = pal(ids[n]);
    await clic(p, `[data-q="sel"][data-n="${n}"]`);
    await clic(p, '[data-q="sonder"]');
    await p.fill(`${Z} [data-q-compte]`, String(x.compte)); await clic(p, '[data-q="compter"]');
    await p.selectOption(`${Z} [data-q-decision]`, x.decision);
    await p.selectOption(`${Z} [data-q-motif]`, x.motif);
    if (x.motif2) await p.selectOption(`${Z} [data-q-motif2]`, x.motif2);
  }
  await vers4(p);
  await clic(p, '[data-q="rentrer"]');
  for (const id of ids) {
    const x = pal(id);
    if (x.res != null && await p.$(`${Z} #qRes-${id}`)) await p.fill(`${Z} #qRes-${id}`, x.res);
    if (x.res2 != null && await p.$(`${Z} #qRes2-${id}`)) await p.fill(`${Z} #qRes2-${id}`, x.res2);
  }
  await clic(p, '[data-q="ecrire"]');
  await clic(p, '[data-q="signer"]');
}

await v('ENT-4.4 : tirage — 500 élèves, chaque camion respecte les contraintes d’équité, la règle du quai et la même structure', async () => {
  const S = await import(new URL('../../contenus/picard-ent44.js', import.meta.url));
  const { tirerJeu } = await import(new URL('../../core/tirage.js', import.meta.url));
  const { jalonsQuai } = await import(new URL('../../core/types/quai.js', import.meta.url));
  const structure = (Q) => jalonsQuai({}, Q).L.filter((l) => l.compte).map((l) => l.lib.replace(/^P\d réserve écrite$/, 'réserve'));
  const ref = structure(S.quaiDe('')).join(' | ');
  const fautes = [];
  let secours = 0, retires = 0;
  for (let i = 0; i < 500; i++) {
    const g = `eleve-${i}-${(i * 7919) % 1000}`;
    const r = tirerJeu(S.TIRAGE, g);
    if (r.secours) secours++;
    if (r.essai > 0) retires++;
    const e = S.verifier(r.jeu);
    if (e.length) fautes.push(`${g} : ${e.join(', ')}`);
    const Q = S.quaiDe(g);
    if (structure(Q).join(' | ') !== ref) fautes.push(`${g} : structure des jalons différente`);
    // La règle −18 / −15, relue indépendamment du vérificateur du contenu.
    for (const p of Q.camions[0].palettes) {
      const zone = p.temp > -15 ? 'refuser' : p.temp > -18 ? 'reserves' : null;
      if (zone === 'reserves') fautes.push(`${g} ${p.id} : ${p.temp} dans la zone des réserves`);
      if (zone === 'refuser' && !(p.attendu === 'refuser' && p.motifAttendu === 'temperature')) fautes.push(`${g} ${p.id} : ${p.temp} non refusée`);
    }
    if (Q.camions[0].ticket.releves.filter(([, t]) => t > -15).length !== 3) fautes.push(`${g} : remontée du ticket`);
  }
  egal(fautes.slice(0, 5), [], 'camions hors règle');
  egal([secours, S.ETAPES.length, S.verifier(S.TIRAGE.secours)], [0, 20, []], 'secours / 20 jalons / secours conforme');
  vrai(retires < 25, `${retires} tirages refaits sur 500 : le tirage tire trop souvent hors règle`);
});

await v('ENT-4.4 : tirage — le vérificateur refuse un camion hors règle (cinq sabotages)', async () => {
  const S = await import(new URL('../../contenus/picard-ent44.js', import.meta.url));
  const { tirerJeu } = await import(new URL('../../core/tirage.js', import.meta.url));
  const jeu = () => JSON.parse(JSON.stringify(tirerJeu(S.TIRAGE, 'eleve-A').jeu));
  const casse = (fn) => { const j = jeu(); fn(j, (a) => j.palettes.find((p) => p.alea === a)); return S.verifier(j).length; };
  egal(S.verifier(jeu()), [], 'le camion intact est refusé');
  const n = {
    doubleSansEcrase: casse((j, a) => { a('double').avarie = {}; }),
    conformeTiede: casse((j, a) => { a('conforme').temp = -16.5; }),
    produitSansErreur: casse((j, a) => { const p = a('produit'); p.etiq.ref = p.ref; }),
    deuxConformes: casse((j, a) => { a('couche').alea = 'conforme'; }),
    ticketPlat: casse((j) => { j.remontee = {}; }),
  };
  vrai(Object.values(n).every((x) => x > 0), 'sabotage accepté : ' + JSON.stringify(n));
});

await v('ENT-4.4 : tirage — même élève, même camion ; 300 élèves, 300 camions différents', async () => {
  const S = await import(new URL('../../contenus/picard-ent44.js', import.meta.url));
  const { tirerJeu } = await import(new URL('../../core/tirage.js', import.meta.url));
  const cle = (g) => JSON.stringify(tirerJeu(S.TIRAGE, g).jeu);
  egal(cle('eleve-A') === cle('eleve-A'), true, 'même élève, camions différents');
  const vus = new Set();
  for (let i = 0; i < 300; i++) vus.add(cle(`u${i}`));
  egal(vus.size, 300, 'deux élèves ont reçu le même camion');
});

// Le camion d'un élève ne doit pas changer entre l'ouverture de l'évaluation et le ramassage : ce
// cas tombe si la réserve ou le tirage est modifié. Valeurs écrites à la main (03/10/2026).
await v('ENT-4.4 : tirage — jeu figé (le camion d’un élève ne change pas d’une version à l’autre)', async () => {
  const S = await import(new URL('../../contenus/picard-ent44.js', import.meta.url));
  const c = S.quaiDe('eleve-fige-44').camions[0];
  egal(c.bl, 'CD-26-1410', 'BL');
  egal(c.palettes.map((p) => `${p.id} ${p.alea} ${p.ref}/${p.etiq.ref} ${p.W}x${p.D}x${p.L} bl${p.bl} m${p.manque.length} a${Object.keys(p.avarie).length} ${p.temp}`), [
    'P1 produit PRO-12/CHC-12 4x2x5 bl40 m0 a0 -19.6',
    'P2 couche TIR-4/TIR-4 3x2x5 bl28 m2 a0 -22',
    'P3 avarie MOC-2/MOC-2 4x3x4 bl48 m0 a1 -21.1',
    'P4 temp PAE-1000/PAE-1000 3x2x5 bl30 m0 a0 -13.7',
    'P5 double MAC-12/MAC-12 3x3x4 bl36 m2 a2 -22',
    'P6 conforme BLV-900/BLV-900 3x3x4 bl36 m0 a0 -21.8',
  ], 'palettes');
  egal(c.ticket.releves.filter(([, t]) => t > -18), [['04:30', -16.9], ['04:45', -13], ['05:00', -12.3], ['05:15', -12.8], ['05:30', -16.9]], 'remontée du ticket');
});

await v('ENT-4.4 : meta (évaluation, copie rendue, fermée aux élèves, 20 jalons)', async () => {
  const r = await pg2.evaluate(async () => { const A = await import('/activites/picard-ent44.js'); return { m: A.meta, noter: typeof A.noter }; });
  const m = r.m;
  egal([m.id, m.code, m.rubrique, m.competences, m.temps, m.niveaux, m.bareme, m.immersif, m.ouverture, m.pret, m.portee, m.copie, !!m.reinitialisable, r.noter],
    ['picard-ent44', 'ENT-4.4', 'logisim', ['C1.4'], 'evaluation', ['1re'], 20, true, 'prof', true, 'eleve', true, false, 'function'], 'meta');
});

await v('ENT-4.4 : l’élève reçoit son camion (graine posée), aucune aide, un second motif sur chaque palette', async () => {
  await monter44(pg2);
  egal(await pg2.evaluate(() => window.__q.db.tirage.graine), 'eleve-A', 'graine');
  const t = await texte(pg2, Z);
  vrai(t.includes('CD-26-1810') && t.includes('PRO-12') && t.includes('Les Cuisines de la Deûle (fictif)') && t.includes('Transports Polarix (fictif)'), 'camion de l’élève : ' + t.slice(0, 400));
  vrai(t.includes('6 palettes × 1 min + 30 s d’ouverture = 6 min 30'), 'formule du déchargement');
  await clic(pg2, '[data-q="decharger"]');
  if (await pg2.isVisible(`${Z} [data-q="passer"]`)) await clic(pg2, '[data-q="passer"]');
  await clic(pg2, '[data-q="vers3"]');
  for (let n = 0; n < 6; n++) {
    await clic(pg2, `[data-q="sel"][data-n="${n}"]`);
    vrai(await pg2.$(`${Z} [data-q-motif2]`), `pas de second motif sur la palette ${n + 1}`);
  }
  egal([await pg2.$$eval(`${Z} .quai-aide`, (x) => x.length), !!(await pg2.$(`${Z} [data-q-detail]`)), !!(await pg2.$(`${Z} [data-q-repere]`))],
    [0, false, false], 'aides / détail / repère');
});

await v('ENT-4.4 : parcours juste → aucun verdict avant la remise, copie 20/20 (21 min 30 hors froid ≤ 25), ramassage = même note', async () => {
  await monter44(pg2);
  await jouer44(pg2);
  await pg2.evaluate((id) => { window.__q.db.quais[id].reel = 600; }, ID44);
  // Avant la remise : ni tableau de jalons, ni « juste », ni note.
  const avant = await texte(pg2, Z);
  vrai(!(await pg2.$(`${Z} [data-jalon]`)) && !/✓ juste|✗ à revoir|\/ ?20/.test(avant), 'un verdict est visible avant la remise');
  await clic(pg2, '[data-q="clore"]');
  await clic(pg2, '[data-q="clore"]');
  await pg2.waitForFunction(() => !!window.__q.remis);
  const r = await pg2.evaluate(() => window.__q.remis);
  const q = r.detail.quai;
  egal([r.score, r.max, q.jalons, q.sur, q.horsFroid, q.reelPts, q.graine, q.jeu.length, q.jeu.every((l) => l.ok)], [20, 20, 20, 20, 3, 2, 'eleve-A', 20, true], 'copie');
  egal((await etat44(pg2)).froid, 21.5, 'temps hors froid');
  vrai((await texte(pg2, `${Z} [data-q-bilan]`)).includes('Ton enseignant te donnera la note'), 'l’élève voit une correction');
  const ramasse = await pg2.evaluate(() => window.__q.A.noter(JSON.parse(JSON.stringify(window.__q.db))));
  egal([ramasse.score, ramasse.max], [r.score, r.max], 'ramassage ≠ remise');
});

await v('ENT-4.4 : la palette à deux problèmes — deux constats, deux quantités, et chacun compte', async () => {
  const res = await pg2.evaluate(async (id) => {
    const { jalonsQuai } = await import('/core/types/quai.js');
    const S = await import('/contenus/picard-ent44.js');
    const Q = S.quaiDe('eleve-A');
    const base = JSON.parse(JSON.stringify(window.__q.db));
    const ko = (fn) => { const db = JSON.parse(JSON.stringify(base)); fn(db.quais[id]); return jalonsQuai(db, Q).L.filter((l) => l.compte && !l.ok).map((l) => l.id); };
    return {
      ligne: base.quais[id].lignes.find((l) => l.id === 'P2').texte,
      juste: ko(() => {}),
      unSeulMotif: ko((e) => { e.palettes.P2.motif2 = 'aucun'; }),
      // Les réserves déjà écrites restent : seule la décision est rejouée ici.
      motifsInverses: ko((e) => { e.palettes.P2.motif = 'avarie'; e.palettes.P2.motif2 = 'manquant'; }),
      secondMotifEnTrop: ko((e) => { e.palettes.P4.motif2 = 'manquant'; }),
    };
  }, ID44);
  egal(res.ligne, 'P2 PRO-12 : acceptée sous réserve — manque 1 carton (BL 40, reçu 39) ; 3 cartons endommagés (écrasés).', 'ligne de réserve');
  egal([res.juste, res.unSeulMotif, res.motifsInverses, res.secondMotifEnTrop], [[], ['P2-decision'], [], ['P4-decision']], 'jalons');
});

await v('ENT-4.4 : la seconde quantité fausse fait tomber la réserve, et elle seule', async () => {
  await monter44(pg2);
  await jouer44(pg2, { P2: { res2: '2' } });
  const ko = await pg2.evaluate(async (id) => {
    const { jalonsQuai } = await import('/core/types/quai.js');
    const S = await import('/contenus/picard-ent44.js');
    return jalonsQuai(window.__q.db, S.quaiDe('eleve-A')).L.filter((l) => l.compte && !l.ok).map((l) => l.id);
  }, ID44);
  egal(ko, ['P2-reserve'], 'jalons faux');
});

await v('ENT-4.4 : note — valeurs du brief sur le camion de l’élève (rapide, palette fausse, BL non signé, tiers-temps)', async () => {
  await monter44(pg2);
  await jouer44(pg2);
  const n = await pg2.evaluate(async (id) => {
    const { noteQuai } = await import('/core/types/quai.js');
    const S = await import('/contenus/picard-ent44.js');
    const Q = S.quaiDe('eleve-A');
    const base = JSON.parse(JSON.stringify(window.__q.db));
    const avec = (fn) => { const db = JSON.parse(JSON.stringify(base)); fn(db.quais[id]); return noteQuai(db, Q).score; };
    return {
      rapide: avec((e) => { e.froid = 20; e.reel = 600; }),
      uneFausse: avec((e) => { e.froid = 20; e.reel = 600; e.palettes.P6.decision = 'reserves'; }),
      nonSigne: avec((e) => { e.froid = 20; e.reel = 600; e.signe = false; }),
      treize: avec((e) => { e.froid = 20; e.reel = 800; }),
      treizeTiers: avec((e) => { e.froid = 20; e.reel = 800; e.tiersTemps = true; }),
      dixSept: avec((e) => { e.froid = 20; e.reel = 17 * 60; }),
      dixSeptTiers: avec((e) => { e.froid = 20; e.reel = 17 * 60; e.tiersTemps = true; }),
      // Hors froid (Tristan, 03/10/2026) : ≤ 25 → 3, ≤ 30 → 2, ≤ 35 → 1, au-delà 0.
      froid27: avec((e) => { e.froid = 27; e.reel = 600; }),
      froid36: avec((e) => { e.froid = 36; e.reel = 600; }),
    };
  }, ID44);
  // 19/20 jalons = 14,25 ; rapidité (3 + 2) × 5/6 = 4,17 ; BL non signé : réception incomplète, 0 de rapidité.
  egal(n, { rapide: 20, uneFausse: 18.42, nonSigne: 14.25, treize: 19, treizeTiers: 20, dixSept: 18, dixSeptTiers: 19, froid27: 19, froid36: 17 }, 'notes');
});

await v('ENT-4.4 : après rechargement, l’élève garde son camion et son travail ; la graine n’est jamais remplacée', async () => {
  await pg2.evaluate(() => localStorage.removeItem('essai-ent44-base'));
  await monter44(pg2, { garder: true });
  await clic(pg2, '[data-q="ticket"]');
  await pg2.check(`${Z} [data-q="ticketRep"][value="long"]`);
  await pg2.reload();
  await pg2.waitForLoadState('load');
  await monter44(pg2, { garder: true });
  egal([(await etat44(pg2)).ticketRep, await pg2.evaluate(() => window.__q.db.tirage.graine)], ['long', 'eleve-A'], 'travail / graine après rechargement');
  vrai((await texte(pg2, Z)).includes('CD-26-1810'), 'camion changé après rechargement');
  // Même base ouverte sous un autre identifiant (enseignant qui teste, poste partagé) : le camion reste.
  await monter44(pg2, { garder: true, uid: 'eleve-B' });
  egal(await pg2.evaluate(() => window.__q.db.tirage.graine), 'eleve-A', 'graine remplacée');
  await pg2.evaluate(() => localStorage.removeItem('essai-ent44-base'));
});

await v('ENT-4.4 : deux élèves voisins reçoivent deux camions différents', async () => {
  await monter44(pg2, { uid: 'eleve-A' });
  const a = await texte(pg2, `${Z} .quai-papier, ${Z} .quai-doc`);
  await monter44(pg2, { uid: 'eleve-B' });
  const b = await texte(pg2, `${Z} .quai-papier, ${Z} .quai-doc`);
  vrai(a.includes('CD-26-1810') && !b.includes('CD-26-1810') && a !== b, 'mêmes camions');
});

await v('ENT-4.4 : corrigé — par élève dans l’onglet Corrigés (camion, jalons, note), camion seul s’il n’a pas ouvert', async () => {
  // La base d'un élève qui a fini (celle d'« eleve-A », jouée plus haut) est rangée au nom d'un élève du groupe.
  await monter44(pg2);
  await jouer44(pg2);
  const base = await pg2.evaluate(() => JSON.parse(JSON.stringify(window.__q.db)));
  const { ctx, pg: p, erreurs } = await contexte();
  await p.click('#btnProf');
  await p.waitForSelector('#btnProfEspace');
  await p.click('#btnProfEspace');
  await p.waitForSelector('#gNom');
  await p.fill('#gNom', 'PIC 44');
  await p.click('#btnCreerG');
  await p.waitForSelector('text=PIC 44');
  await p.click('[data-ong="comptes"]');
  await p.waitForSelector('#lot');
  await p.fill('#lot', 'FINI ; Alice ; 4401 ; pc01\nABSENT ; Bruno ; 4402 ; pc02');
  await p.click('#btnLot');
  await p.waitForSelector('[data-tiers]');
  const uids = await p.evaluate(async (b) => {
    const { B } = await import('/core/backend.js');
    const gs = await B.groupesDuProf((await B.profilCourant()).uid);
    const g = gs.find((x) => x.nom === 'PIC 44');
    const el = await B.elevesDuGroupe(g.id);
    const fini = el.find((e) => e.nom === 'FINI'), absent = el.find((e) => e.nom === 'ABSENT');
    await B.ecrireJeuPrive(fini.uid, 'picard-ent44', b);
    return { fini: fini.uid, absent: absent.uid };
  }, base);
  await p.click('[data-ong="corriges"]');
  await p.click('[data-corrige="picard-ent44"]');
  await p.waitForSelector('#corrEleve');
  vrai((await texte(p, '#contenuProf')).includes('Manquant + cartons écrasés sur la même palette'), 'corrigé commun absent');
  await p.selectOption('#corrEleve', uids.fini);
  await p.waitForSelector('[data-corr-eleve] table >> nth=1');
  const t = await texte(p, '[data-corr-eleve]');
  vrai(t.includes('CD-26-1810') && t.includes('TAP-750') && t.includes('étiquette TAF-750'), 'camion de l’élève : ' + t.slice(0, 300));
  egal(await p.$$eval('[data-corr-eleve] table >> nth=1', (x) => x[0].querySelectorAll('tbody tr').length), 20, 'jalons');
  vrai(!t.includes('✗ faux') && t.includes('20 / 20'), 'jalons ou note : ' + t.slice(-400));
  await p.selectOption('#corrEleve', uids.absent);
  await p.waitForFunction(() => document.querySelector('[data-corr-eleve]').textContent.includes('pas encore ouvert'));
  egal(await p.$$eval('[data-corr-eleve] table', (x) => x.length), 1, 'jalons d’un élève qui n’a pas ouvert');
  egal(erreurs, [], 'erreurs JS');
  await ctx.close();
});

await v('ENT-4.4 : sous le logo Picard dans Logisim, elle s’ouvre sur l’accueil et le mail court du chef de quai', async () => {
  const { ctx, pg: p, erreurs } = await contexte();
  await p.click('#btnProf');
  await p.click('[data-rub="logisim"]');
  await p.click('[data-ent="4"]');
  await p.click('[data-act="picard-ent44"]');
  await p.waitForSelector('.ent-bandeau');
  vrai((await texte(p, '.ent-bandeau')).includes('ENT-4.4'), 'bandeau de séance');
  vrai((await texte(p, '.ent-main')).includes('Le rush du lundi'), 'accueil de la séance');
  await p.click('.ent-nav[data-vue="mail"]');
  const m = await texte(p, '.ent-main');
  vrai(m.includes('Quai 32 : le camion de 6 h 00'), 'mail : ' + m.slice(0, 300));
  egal(erreurs, [], 'erreurs JS');
  await ctx.close();
});

await v('quai : aucune erreur JavaScript dans le bloc', async () => {
  egal(erreursQ, [], 'erreurs');
});

await ctxQ.close();
}
