// Suite de tests de Prepalog — bloc « mr-11.3 » : ENT-11.3 (Mondial Relay, évaluation « la ligne de tri » ; brief docs/briefs/ENT-11.3-mondial-relay-evaluation-tri.md).
// `node outils/test.mjs mr-11.3` ne lance que ce bloc. La vraie séance (`activites/mondial-relay-evaluation-tri.js`) montée dans la page, de vrais clics
// (le quai À LA SOURIS, comme fb-6.4 ; la ligne de tri aux boutons). Les valeurs attendues sont ÉCRITES À LA MAIN :
//   poids : danger n° 1 1,5 · danger n° 2 1,5 · aucun faux signalement 1 · colis en règle 5 · pièges 2 · écarts 3 · aucun faux écart 1 = 15,
//   + questions au fil 1 + « Avant de commencer » 4 = 20.
//   Inès écartée (colis en règle, 10 sur 10 dans « en règle ») : 9/10 × 5 = 4,5 puis « aucun faux écart » 0 → 20 − 0,5 − 1 = 18,5.
//   Sécurité sautée (« C'est bon » sans rien signaler) : 20 − 4 = 16 ; un seul danger signalé : 20 − 1,5 ; un faux signalement en plus : 20 − 1.
//   Aucune bonne réponse à l'ouverture : 20 − 4 = 16.
// Le tirage (300 graines) : 16 colis, 3 écarts de motifs différents, 3 pièges, 5 sorties, le colis d'Inès ; 2 défauts de quai parmi 5.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'mondial-relay-evaluation-tri', TRI = 'mr-tri-113', QID = 'mr-quai-113';
const ctxM = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const pg = await ctxM.newPage();
pg.setDefaultTimeout(9000);
const erreurs = [];
pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
const hotes = new Set();
pg.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotes.add(h); } catch (e) {} });
await pg.emulateMedia({ reducedMotion: 'reduce' });
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

// « Avant de commencer » : la banque (9), les réponses justes et fausses (l'élève n'en reçoit que 4 : les autres sont rangées pour rien).
const OUV_JUSTES = { 'etiquette-tournee': 'commune', 'colis-32kg': 'non', 'somme-cotes': 'non', 'code-postal': 'cp', 'avant-d-entrer': 'immobile',
  protocole: 'protocole', 'droit-retrait': 'alerter', 'cale-roue': 'bloquer', 'tapis-bloque': 'arret' };
const OUV_FAUSSES = { 'etiquette-tournee': 'numero', 'colis-32kg': 'locker', 'somme-cotes': 'oui', 'code-postal': 'couleur', 'avant-d-entrer': 'retard',
  protocole: 'bl', 'droit-retrait': 'continuer', 'cale-roue': 'peser', 'tapis-bloque': 'main' };
const FIL_JUSTES = { 'ecart-devenir': 'expertise', 'mauvaise-sortie': 'prevenir', 'travail-nuit': 'oui' };
const FIL_FAUSSES = { 'ecart-devenir': 'poubelle', 'mauvaise-sortie': 'laisser', 'travail-nuit': 'non-minuit' };
const MOTIF = { poids: 'Trop lourd', taille: 'Trop grand', carton: 'Carton ouvert', etiquette: 'Étiquette illisible' };

// o : { rep (réponses d'ouverture), uid, db, role }.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/mondial-relay-evaluation-tri.js');
  document.querySelector('#mrTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'mrTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (o.rep !== false) {
    const Q = ((db.questions = db.questions || {})[A.meta.id] = db.questions[A.meta.id] || {});
    for (const [id, x] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: x, duree: 1 };
  }
  window.__m = { db, copies: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'mr113a' },
    jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {}, codeStock: '',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__m.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
  return hote.querySelector('.avis-err') ? hote.querySelector('.avis-err').textContent : null;
}, { rep: OUV_JUSTES, ...o });
const Z = '#mrTest';
const R = `${Z} [data-t-tri]`;
const pause = (ms = 60) => pg.waitForTimeout(ms);
const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
const texte = (sel) => pg.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, sel);
const aller = async (vue) => { await pg.click(`${Z} .ent-nav[data-vue="${vue}"]`); await pause(); };
const note = () => pg.evaluate(async () => { const A = await import('/activites/mondial-relay-evaluation-tri.js'); return A.noter(window.__m.db); });
const arrondi = (x) => Math.round(x * 1000) / 1000;
const graine = () => pg.evaluate(() => (window.__m.db.tirage || {}).graine || '');
const dangers = async () => { const g = await graine(); return pg.evaluate(async (g) => (await import('/contenus/mondial-relay-ent113.js')).dangersDe(g), g); };
const detailTri = async () => (await note()).detail;

// ── les questions au fil : on répond tant qu'un panneau est ouvert, puis on reprend.
async function qrep(choix = FIL_JUSTES) {
  for (let i = 0; i < 4; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}

// ── le quai, À LA SOURIS : les zones sont celles du moteur (`zonesScene`), le pixel se retrouve par la boundingBox() du <svg>.
const SVG = `${Z} [data-q-inspection]`;
const zones = (g) => pg.evaluate(async ({ g, QID }) => {
  const Q = await import('/core/types/quai.js');
  const C = await import('/contenus/mondial-relay-ent113.js');
  const S = C.quaiDe(g).securite, q = window.__m.db.quais && window.__m.db.quais[QID];
  return Q.zonesScene(S, Q.etatsScene(S, q && q.securite));
}, { g, QID });
async function cliquerVB(x, y) {
  const loc = pg.locator(SVG);
  await loc.scrollIntoViewIfNeeded();
  const bb = await loc.boundingBox();
  const [vx, vy, vw, vh] = await loc.evaluate((s) => s.getAttribute('viewBox').split(' ').map(Number));
  const k = Math.min(bb.width / vw, bb.height / vh);
  await pg.mouse.click(bb.x + (bb.width - vw * k) / 2 + (x - vx) * k, bb.y + (bb.height - vh * k) / 2 + (y - vy) * k);
  await pause(40);
}
async function vueQuai(vue) {
  if ((await pg.$eval(SVG, (s) => s.dataset.vue)) === vue) return;
  if (vue === 'dedans' && !(await present('[data-q="sc-vue"]'))) await pg.click(`${Z} [data-q="sc-ouvrir"]`);
  else await pg.click(`${Z} [data-q="sc-vue"]`);
  await pg.waitForFunction(({ Z, v }) => document.querySelector(`${Z} [data-q-inspection]`).dataset.vue === v, { Z, v: vue });
}
async function zone(id) {
  const z = (await zones(await graine())).find((q) => q.id === id);
  await vueQuai(z.vue);
  const r = z.rects[0];
  await cliquerVB(r.x + r.w / 2, r.y + r.h / 2);
}
const signaler = async () => { await pg.click(`${Z} [data-q="sc-signaler"]`); await pause(); };
// « C'est bon, on peut décharger » (deux clics), la question d'éco-droit, puis la suite du quai jusqu'à la navette déchargée.
async function decharger(choix) {
  await pg.click(`${Z} [data-q="sc-decharger"]`);
  await pg.click(`${Z} [data-q="sc-decharger"]`);
  await pause();
  await qrep(choix);
}
// Le quai : `envois` = une liste d'envois, chacun la liste des objets à marquer (défaut : les deux défauts de l'élève, en deux envois).
async function quai(o = {}) {
  await aller('quai');
  await pg.waitForSelector(SVG);
  const envois = o.envois || (await dangers()).map((d) => [d]);
  for (const ids of envois) { for (const id of ids) await zone(id); await signaler(); }
  await decharger(o.choix || FIL_JUSTES);
}

// ── la ligne de tri
const trier = async (choix) => {
  const [s, m] = choix.split(':');
  await pg.click(`${R} button[data-t="sortie"][data-s="${s}"]`);
  if (m) await pg.click(`${R} button[data-t="motif"]:has-text("${MOTIF[m]}")`);
  await pg.click(`${R} button[data-t="envoyer"]`);
  await pause(30);
};
// Le bon tri de la série de CET élève (calculé par la banque, colis par colis, dans l'ordre de la série) ; `piege` : le colis à piège.
const serie = async () => { const g = await graine(); return pg.evaluate(async (g) => {
  const C = await import('/contenus/mondial-relay-colis.js');
  const S = await import('/contenus/mondial-relay-ent113.js');
  return S.triDe(g).series[0].colis.map((x) => { const b = C.bonTriColis(x); return { n: x.n, bon: b.s === 'ecart' ? `ecart:${b.motif}` : b.s, ecart: b.s === 'ecart', piege: !!x.piege }; });
}, g); };
async function jouer(o = {}) {
  await aller('tri');
  await pg.waitForSelector(`${R} [data-t-scene]`);
  const L = await serie();
  for (let k = 0; k < L.length; k++) {
    let choix = L[k].bon;
    if (o.change && o.change[k] != null) choix = o.change[k];
    await trier(choix);
    await qrep(o.choix || FIL_JUSTES);
  }
  await pg.waitForSelector(`${R} [data-t-bilan]`);
  await pause();
  await qrep(o.choix || FIL_JUSTES);
}
async function rendre() {
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.waitForFunction(() => window.__m.copies.length === 1);
  await pause();
  return pg.evaluate(() => window.__m.copies[0]);
}
// Le parcours entier (quai puis ligne de tri), et la note.
async function parcours(o = {}) {
  await monter({ uid: o.uid || 'mr113a', rep: o.rep || OUV_JUSTES });
  await quai(o.quai || {});
  await jouer(o.tri || {});
  return note();
}

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-11.3 : la séance se charge (2de, C1.2 + C1.4 + C2.1, évaluation en copie) ; poids 4 · 5 · 2 · 3 · 1 + questions 1 + ouverture 4 = 20 ; banque d’ouverture 9, sans aide ni mot cliquable ; aucune requête hors du domaine', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/mondial-relay-evaluation-tri.js');
    const S = await import('/contenus/mondial-relay-ent113.js');
    const Q = await import('/contenus/questions/ENT-11.3.js');
    const { secondesSerie } = await import('/core/types/tri.js');
    const L = Q.QUESTIONS.liste;
    const D = S.triDe('x');
    return { meta: [A.meta.id, A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.pret, A.meta.ouverture,
        A.meta.questions, typeof A.noter, A.meta.corrige],
      poids: S.ETAPES.map((e) => [e.id, e.poids, e.groupe]),
      somme: S.ETAPES.reduce((t, e) => t + e.poids, 0) + Q.QUESTIONS.part + Q.QUESTIONS.ouverture.part,
      ouv: { part: Q.QUESTIONS.ouverture.part, tirage: Q.QUESTIONS.ouverture.tirage,
        tri: L.filter((x) => x.rubrique === 'tri').length, securite: L.filter((x) => x.rubrique === 'securite').length,
        aides: L.filter((x) => x.aide != null).length,
        mots: L.filter((x) => (x.enonce + x.choix.map((c) => c.lib).join(' ')).includes('[[')).length,
        fil: L.filter((x) => x.type === 'fil').map((x) => [x.id, x.apres]) },
      secondes: [D.series[0].secondes, D.series[0].temps, secondesSerie(D.series[0]), secondesSerie(D.series[0], { tiersTemps: true })] };
  });
  egal(r.meta, ['mondial-relay-evaluation-tri', 'ENT-11.3', ['2de'], ['C1.2', 'C1.4', 'C2.1'], 'evaluation', 20, true, true, 'prof', 'ENT-11.3', 'function',
    './contenus/corriges/ENT-11.3.js'], 'meta');
  egal(r.poids, [['securite-1', 1.5, 'Avant de décharger'], ['securite-2', 1.5, 'Avant de décharger'], ['securite-aucun-faux', 1, 'Avant de décharger'],
    ['tri-communes', 5, 'Le tri'], ['tri-pieges', 2, 'Le tri'], ['tri-ecarts', 3, 'Les colis qui ne partent pas'], ['tri-fauxEcarts', 1, 'Les colis qui ne partent pas']], 'poids');
  egal(r.somme, 20, 'somme des poids');
  egal(r.ouv, { part: 4, tirage: { tri: 2, securite: 2 }, tri: 4, securite: 5, aides: 0, mots: 0,
    fil: [['ecart-devenir', 'bilan'], ['mauvaise-sortie', 'bilan'], ['travail-nuit', 'bilan']] }, 'ouverture');
  egal(r.secondes, [28, 'evaluation', 28, 37], '28 s par colis, 37 s au tiers-temps');
  egal([...hotes], [], 'requêtes hors du domaine');
});

await v('ENT-11.3 : la séance s’ouvre ; « Avant de commencer » donne 4 questions tirées avec « Je ne sais pas » et sans correction ; la ligne de tri reste fermée tant que le quai n’est pas sécurisé', async () => {
  egal(await monter({ rep: false }), null, 'séance refusée');
  await pg.waitForSelector(`${Z} [data-ouverture]`);
  const n = await pg.$$eval(`${Z} .qo-pas`, (L) => L.length);
  egal(n, 4, '4 questions tirées');
  vrai(/Une réponse fausse retire des points/.test(await texte(`${Z} [data-ouv-penalite]`)), 'phrase de la pénalité');
  vrai((await pg.$$eval(`${Z} [data-q-choix]`, (L) => L.map((b) => b.textContent))).includes('Je ne sais pas'), '« Je ne sais pas »');
  egal(await monter({}), null, 'séance refusée (ouverture répondue)');
  await pg.waitForSelector(`${Z} .ent-nav-ferme[data-vue-fermee="tri"], ${Z} .ent-nav[data-vue="tri"]`);
  vrai(!!(await pg.$(`${Z} .ent-nav-ferme[data-vue-fermee="tri"]`)), 'la ligne de tri est ouverte avant le quai');
  vrai(!!(await pg.$(`${Z} .ent-nav[data-vue="quai"]`)), 'le quai est dans le menu');
  egal(erreurs, [], 'erreurs de page');
});

// ─────────────────────────────────────────────────────────── le parcours juste
await v('ENT-11.3 : tout juste = 20 / 20 ; la ligne de tri s’ouvre après « C’est bon » ; copie rendue une seule fois, puis la note recalculée par `noter` sur la base rendue', async () => {
  await monter({});
  await quai({});
  vrai(!!(await pg.$(`${Z} .ent-nav[data-vue="tri"]`)) && !(await pg.$(`${Z} .ent-nav-ferme[data-vue-fermee="tri"]`)), 'la ligne de tri reste fermée après le quai');
  await jouer({});
  const sujets = await pg.evaluate(() => window.__m.db.mails.map((m) => m.subject));
  vrai(sujets.includes('Bonne nuit de travail'), `message de fin : ${sujets}`);
  const n = await note();
  egal(arrondi(n.score), 20, `note ${JSON.stringify(n.detail)}`);
  const c = await rendre();
  egal(arrondi(c.score), 20, 'score de la copie rendue');
  const rendue = await pg.evaluate(() => window.__m.copies.length);
  egal(rendue, 1, 'une seule remise');
  const n2 = await pg.evaluate(async (db) => (await import('/activites/mondial-relay-evaluation-tri.js')).noter(db), await pg.evaluate(() => window.__m.db));
  egal(arrondi(n2.score), 20, 'note recalculée par noter');
  egal(await pg.evaluate(() => window.__m.db.tris['mondial-relay-evaluation-tri']['mr-tri-113'].series.s1.fait), true, 'série finie rangée');
  egal(erreurs, [], 'erreurs de page');
});

await v('ENT-11.3 : la série est SANS aucun retour (ni ✓ ni ✗, pas de bilan chiffré) et le quai ne dit rien de ce qui était juste', async () => {
  await monter({});
  await quai({});
  await aller('tri');
  const L = await serie();
  await trier(L[0].bon);
  const r = await texte(`${R} [data-t-retour]`);
  vrai(!/✓|✗|Juste|juste|faux/.test(r || ''), `un verdict pendant la série : ${r}`);
  await pg.click(`${Z} .ent-nav[data-vue="quai"]`);
  await pause();
  const t = await texte(Z);
  vrai(!/Bien vu|Stop|ne vois rien|ne cloche/.test(t), `un mot du chef de quai sur ce qui était juste : ${t.slice(0, 200)}`);
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-11.3 : deux élèves, deux séries ; le même élève, la même série (aussi dans la page) ; le quai d’un élève ne change pas', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/mondial-relay-ent113.js');
    const ns = (g) => S.triDe(g).series[0].colis.map((x) => x.n).join();
    return { ab: ns('alice') !== ns('bob'), aa: ns('alice') === ns('alice'), da: S.dangersDe('alice').join(), db: S.dangersDe('bob').join(),
      daa: S.dangersDe('alice').join(), q: S.quaiDe('alice') === S.quaiDe('alice') };
  });
  vrai(r.ab, 'deux élèves ont la même série');
  vrai(r.aa && r.da === r.daa && r.q, 'le même élève n’a pas la même série ou le même quai');
  await monter({ uid: 'alice' });
  const a1 = await serie();
  await monter({ uid: 'bob' });
  const b1 = await serie();
  await monter({ uid: 'alice' });
  const a2 = await serie();
  vrai(JSON.stringify(a1) !== JSON.stringify(b1), 'alice et bob : même série dans la page');
  egal(a2, a1, 'alice retrouve sa série');
});

await v('ENT-11.3 : 300 graines — 16 colis, 3 écarts de motifs différents, 3 pièges, 5 sorties servies, le colis d’Inès (T3, enfoncé) ; un quai valide aux deux défauts distincts parmi cinq ; un seul geste, sur un colis à écarter', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/mondial-relay-ent113.js');
    const C = await import('/contenus/mondial-relay-colis.js');
    const { compositionSerie, verifierTri } = await import('/core/types/tri.js');
    const { verifierQuai } = await import('/core/types/quai.js');
    const fautes = [], vus = new Set(), couples = new Set();
    for (let i = 0; i < 300; i++) {
      const D = S.triDe(`u${i}`), s = D.series[0], c = compositionSerie(D, s);
      vus.add(s.colis.map((x) => x.n).join());
      const ines = s.colis.find((x) => x.n === C.COLIS_INES.n);
      const g = s.colis.filter((x) => x.geste);
      const f = verifierTri(D, { copie: true }), d = S.dangersDe(`u${i}`), fq = verifierQuai(S.quaiDe(`u${i}`));
      couples.add(d.join());
      if (f.length || fq.length || s.colis.length !== 16 || c.nbEcarts !== 3 || Object.keys(c.ecarts).length !== 3 || c.pieges !== 3 || c.sorties.length !== 5
        || !ines || C.bonTriColis(ines).s !== 'T3' || ines.etat !== 'enfonce' || g.length !== 1 || C.bonTriColis(g[0]).s !== 'ecart'
        || d.length !== 2 || new Set(d).size !== 2 || s.temps !== 'evaluation' || D.series.length !== 1 || s.secondes !== 28) fautes.push(`u${i} ${JSON.stringify([f, fq, c, d])}`);
    }
    return { fautes: fautes.slice(0, 3), differentes: vus.size, couples: couples.size };
  });
  egal(r.fautes, [], 'séries ou quais hors des contraintes');
  vrai(r.differentes > 280, `séries différentes : ${r.differentes}`);
  vrai(r.couples >= 8, `couples de défauts différents : ${r.couples} sur 10`);
});

// ─────────────────────────────────────────────────────────── les sabotages
await v('ENT-11.3 : Inès (carton enfoncé mais fermé) écartée à tort → « aucun faux écart » tombe, « en règle » perd un colis sur dix : 20 − 0,5 − 1 = 18,5', async () => {
  await monter({});
  await quai({});
  const L = await serie();
  const k = L.findIndex((x) => x.n === 'MR 4417 2184');
  vrai(k >= 0, 'Inès est dans la série');
  await jouer({ change: { [k]: 'ecart:carton' } });
  const n = await note();
  egal(n.detail['tri-fauxEcarts'], 'ko', 'faux écart');
  egal(n.detail['tri-communes'], 'ok', 'communes : 9 sur 10');
  egal(arrondi(n.score), 18.5, `note ${JSON.stringify(n.detail)}`);
});

await v('ENT-11.3 : la sécurité sautée (« C’est bon » sans rien signaler) donne 0 aux trois jalons de sécurité : 20 − 4 = 16 ; la ligne de tri s’ouvre quand même', async () => {
  await monter({});
  await aller('quai');
  await pg.waitForSelector(SVG);
  await decharger(FIL_JUSTES);
  const n0 = await note();
  egal([n0.detail['securite-1'], n0.detail['securite-2'], n0.detail['securite-aucun-faux']], ['ko', 'ko', 'ko'], 'jalons de sécurité');
  vrai(!(await pg.$(`${Z} .ent-nav-ferme[data-vue-fermee="tri"]`)), 'la ligne de tri reste fermée');
  await jouer({});
  const n = await note();
  egal([n.detail['securite-1'], n.detail['securite-2'], n.detail['securite-aucun-faux']], ['ko', 'ko', 'ko'], 'jalons de sécurité');
  egal(arrondi(n.score), 16, `note ${JSON.stringify(n.detail)}`);
});

await v('ENT-11.3 : un seul danger signalé → 20 − 1,5 ; un faux signalement en plus (un objet en ordre) → « aucun faux signalement » tombe (20 − 1)', async () => {
  await monter({});
  const D = await dangers();
  await quai({ envois: [[D[0]]] });
  await jouer({});
  let n = await note();
  egal([n.detail['securite-1'], n.detail['securite-2'], n.detail['securite-aucun-faux']], ['ok', 'ko', 'ok'], 'un danger sur deux');
  egal(arrondi(n.score), 18.5, `note ${JSON.stringify(n.detail)}`);
  // un objet en ordre signalé en plus des deux défauts
  await monter({ uid: 'mr113b' });
  const E = await dangers();
  const enOrdre = ['cabine', 'cale', 'butoirs', 'niveleur', 'lampe'].find((o) => !E.includes(o));
  await quai({ envois: [[...E, enOrdre]] });
  await jouer({});
  n = await note();
  egal([n.detail['securite-1'], n.detail['securite-2'], n.detail['securite-aucun-faux']], ['ok', 'ok', 'ko'], 'un faux signalement');
  egal(arrondi(n.score), 19, `note ${JSON.stringify(n.detail)}`);
});

await v('ENT-11.3 : une série laissée passer (un seul colis trié, le minuteur fait le reste) → rien ne se gagne sans trier : « aucun faux écart » à 0, tri presque à 0 ; la sécurité et les questions restent acquises', async () => {
  await monter({});
  await quai({});
  await aller('tri');
  await pg.waitForSelector(`${R} [data-t-scene]`);
  const L = await serie();
  await trier(L[0].bon);
  await qrep(FIL_JUSTES);
  for (let i = 0; i < 90 && !(await pg.$(`${R} [data-t-bilan]`)); i++) {
    await pg.evaluate((R) => document.querySelector(R).__tri.avancer(30), R);
    await pause(120);
    await qrep(FIL_JUSTES);
  }
  vrai(!!(await pg.$(`${R} [data-t-bilan]`)), 'la série se finit');
  await qrep(FIL_JUSTES);
  const e = await pg.evaluate(() => JSON.parse(JSON.stringify(window.__m.db.tris['mondial-relay-evaluation-tri']['mr-tri-113'].series.s1)));
  egal(Object.values(e.res).filter((r) => r.s == null).length, 15, 'quinze colis non triés');
  const n = await note();
  egal(n.detail['tri-fauxEcarts'], 'ko', 'faux écarts');
  // sécurité 4 + questions 5 + le seul colis trié : en règle sans piège 0,5 · piège 2/3 · écart 1
  const gain = L[0].ecart ? 3 / 3 : L[0].piege ? 2 / 3 * 1 : 0.5;
  const attendu = 9 + (L[0].ecart ? 3 * 1 / 3 : L[0].piege ? 2 * 1 / 3 : 5 * 1 / 10);
  vrai(gain > 0, 'le seul colis trié rapporte');
  egal(arrondi(n.score), arrondi(attendu), `note ${JSON.stringify(n.detail)}`);
});

await v('ENT-11.3 : « Avant de commencer » toutes fausses → 20 − 4 = 16 (plancher à 0, jamais négatif) ; les questions au fil fausses → 20 − 1 = 19', async () => {
  let n = await parcours({ rep: OUV_FAUSSES });
  egal(arrondi(n.score), 16, `note ${JSON.stringify(n.detail)}`);
  n = await parcours({ quai: { choix: FIL_FAUSSES }, tri: { choix: FIL_FAUSSES } });
  egal(arrondi(n.score), 19, `note ${JSON.stringify(n.detail)}`);
});

await v('ENT-11.3 : l’éco-droit — l’horaire de nuit est tiré par élève (de 21, 22 ou 23 h à 5 ou 6 h), la bonne réponse est la même pour tous', async () => {
  const r = await pg.evaluate(async () => {
    const Qm = await import('/contenus/questions/ENT-11.3.js');
    const q = Qm.QUESTIONS.liste.find((x) => x.id === 'travail-nuit');
    const textes = new Set(), fautes = [];
    for (let i = 0; i < 60; i++) {
      const g = `h${i}`, h = Qm.horaireDe(g), t = q.selon({ tirage: { graine: g } });
      textes.add(t.enonce);
      if (![21, 22, 23].includes(h.debut) || ![5, 6].includes(h.fin) || !t.enonce.includes(`de ${h.debut} h à ${h.fin} h`) || !t.libs.oui.includes(`de ${h.debut} h à ${h.fin} h`)
        || !t.enonce.includes('L3122-2') || !t.enonce.includes('neuf heures')) fautes.push(g);
    }
    return { fautes, variantes: textes.size, juste: q.juste };
  });
  egal(r.fautes, [], 'horaire ou texte hors règle');
  vrai(r.variantes >= 4, `horaires différents : ${r.variantes}`);
  egal(r.juste, 'oui', 'même bonne réponse pour tous');
});

await ctxM.close();
}
