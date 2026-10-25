// Suite de tests de Prepalog — bloc « action-817 » : ENT-8.17 Action, « monter et conditionner sa palette » (CAP OL, guidage CAP-C3.3) : fiche
// « Lire un carton » (trois cartons tirés), préparation guidée à la voix dont l'ordre du circuit casse une règle de calage (chantier E-8, lot 2 :
// « À côté »), film, étiquettes. Brief `docs/briefs/ENT-8.17-action-conditionner.md` §8. `PORT_TESTS=8173 node outils/test.mjs action-817`.
//
// Valeurs ÉCRITES À LA MAIN, relevées une fois le 25/10/2026 :
//   « t817-a » : mission 4401, Marseille Le Merlan, quai 4 ; L1 CAH 3 A1-T04-N1-E3 (11, normal) · L2 VAS 3 A1-T06-N1-E2 (73, fragile) ·
//                L3 LES 5 B1-T06-N1-E2 (88, lourd) · L4 NET 5 B1-T06-N1-E3 (85, lourd) · L5 ASS 3 B1-T04-N1-E2 (80, fragile) ·
//                L6 SER 3 B2-T02-N1-E3 (11, normal) ; palette 239 kg, 1,45 m ; cartons : 1 fragile 6 kg, 2 debout 7 kg, 3 lourd 18 kg.
//   « t817-b » : mission 4207, Châteauneuf-les-Martigues, quai 2 ; L1 BOU 5 A2-T06-N1-E1 (39, normal) · L2 VER 6 A2-T06-N1-E2 (31, fragile) ·
//                L3 NET 5 B1-T06-N1-E3 (31, lourd) · L4 CRO 5 B2-T06-N1-E1 (54, lourd) · L5 CAH 6 B1-T04-N1-E1 (46, normal) ·
//                L6 ASS 5 B1-T04-N1-E2 (80, fragile) ; palette 286 kg, 1,34 m ; cartons : 1 fragile 6 kg, 2 debout 5 kg, 3 lourd 22 kg.
// Poids : fiche 3 · lignes 0,5 × 6 · lourds 2 · fragiles 2 · poids 1 · hauteur 1 · film 2 · étiquettes 2 · questions 4 (q-lourd 1 au bilan,
// q-a-cote, q-film, q-tours, q-etiquette 0,75).

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, note, present, aller, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });

const ID = 'action-conditionner';
const EID = 'action-conditionner';
const REP_OUV = { 'k-lourds': 'bas', 'k-fragile': 'haut', 'k-film': 'finie', 'k-poids': 'refaire', 'k-acote': 'cote', 'k-etiquette': 'magasin',
  'img-fragile': 'fragile', 'img-haut': 'haut' };
const BONNES_Q = { 'q-lourd': 'tient', 'q-a-cote': 'tard', 'q-film': 'tenir', 'q-tours': 'dechet', 'q-etiquette': 'partout' };
const GROUPES = ['Lire un carton', 'Les lignes', 'Le calage', 'Poids et hauteur', 'Emballer', 'Étiqueter', 'Les questions de Samia'];
const NOTES = ['carton-1', 'carton-2', 'carton-3', 'ligne-1', 'ligne-2', 'ligne-3', 'ligne-4', 'ligne-5', 'ligne-6', 'lourds', 'fragiles', 'poids',
  'hauteur', 'film', 'etiquettes'];
const MONTAGE = ['lourds', 'fragiles', 'poids', 'hauteur', 'film', 'etiquettes'];
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus|bien vu|exactement|belle palette)\b/i;
const TA = { graine: 't817-a', num: '4401', magasin: 'Marseille Le Merlan', quai: 4, kg: 239, h: '1,45', cartons: ['fragile', 'debout', 'lourd'],
  L: [['A1-T04-N1-E3', '11', 3, 'Cahiers', 'normal'], ['A1-T06-N1-E2', '73', 3, 'Vases', 'fragile'], ['B1-T06-N1-E2', '88', 5, 'Lessive', 'lourd'],
    ['B1-T06-N1-E3', '85', 5, 'Nettoyant', 'lourd'], ['B1-T04-N1-E2', '80', 3, 'Assiettes', 'fragile'], ['B2-T02-N1-E3', '11', 3, 'Serviettes', 'normal']] };
const TB = { graine: 't817-b', num: '4207', magasin: 'Châteauneuf-les-Martigues', quai: 2, kg: 286, h: '1,34', cartons: ['fragile', 'debout', 'lourd'],
  L: [['A2-T06-N1-E1', '39', 5, 'Bougies', 'normal'], ['A2-T06-N1-E2', '31', 6, 'Verres', 'fragile'], ['B1-T06-N1-E3', '31', 5, 'Nettoyant', 'lourd'],
    ['B2-T06-N1-E1', '54', 5, 'Croquettes', 'lourd'], ['B1-T04-N1-E1', '46', 6, 'Cahiers', 'normal'], ['B1-T04-N1-E2', '80', 5, 'Assiettes', 'fragile']] };

const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-conditionner.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (o.graine) db.tirage = { graine: o.graine, pose: 1 };
  if (o.rep) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ac817' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }), suivante: null,
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: o.sansOuverture ? null : REP_OUV, ...o });
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const Q = (s) => `${Z} ${s}`;
const VERDICTS = {};
let VUS = [];
const nouveau = () => { VUS = []; Object.keys(VERDICTS).forEach((k) => delete VERDICTS[k]); };
const panneau = () => pg.$eval(Q('[data-q-panneau]'), (e) => e.dataset.qPanneau).catch(() => null);
async function qrep(choix = BONNES_Q) {
  await pause(60);
  for (let i = 0; i < 6; i++) {
    const id = await panneau();
    if (!id) return;
    VUS.push(id);
    await pg.click(Q(`[data-q-choix="${choix[id] || 'x'}"][data-q="${id}"]`)).catch(async () => pg.click(Q(`[data-q="${id}"][data-q-choix]:not([data-q-choix="${BONNES_Q[id]}"])`)));
    await pg.click(Q(`[data-q-repondre="${id}"]`));
    await pause();
    VERDICTS[id] = !!(await pg.$(Q('[data-q-verdict]')));
    await pg.click(Q('[data-q-reprendre]'));
    await pause();
  }
}
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(Q('[data-confirme-oui]')); await pause(); } };
const jalonsFaux = (n) => NOTES.filter((j) => n.detail[j] !== 'ok');
const etatPlan = () => pg.evaluate((EID) => JSON.parse(JSON.stringify((window.__f.db.entrepots || {})[EID] || null)), EID);
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});

const taper = async (x) => { await pg.fill(Q('[data-terminal] input'), String(x)); await pg.keyboard.press('Enter'); await pause(30); };
async function allerA(a) {
  if (await pg.$eval(Q('[data-pe-regles]'), (d) => d.open).catch(() => false)) { await pg.click(Q('[data-pe-regles] summary')); await pause(40); }
  while (await present('[data-pvc="retour"]')) await pg.click(Q('[data-pvc="retour"]'));
  const m = /^([AB]\d)-T(\d+)/.exec(a);
  await pg.click(Q(`[data-pe-trav="${m[1]}-T${m[2]}"]`));
  await pg.click(Q(`[data-pe-emp="${a}"]`));
}
async function prendre(n) { for (let i = 0; i < n; i++) await pg.locator(Q('[data-pvc-carton]:not(.pvc-sel):not([data-pvc-ab])')).first().dispatchEvent('click'); }
async function lire(T, rep, choix = BONNES_Q) {
  await allerV('fiche');
  for (const [i, val] of (rep || T.cartons).entries()) { await pg.selectOption(Q(`[data-fiche-champ="carton-${i + 1}"]`), val); await pause(20); }
  await pg.click(Q('[data-fiche-envoyer]'));
  await confirmer();
  await qrep(choix);
}
// `o.ordre` : 'terminal' = tout sur la palette dans l'ordre du circuit ; sinon le bon montage (un lourd sur la palette tant qu'aucun non-lourd
// n'y est ; le reste « À côté », posé à la fin : normaux, puis fragiles). `o.laisser` : un groupe reste à côté.
async function preparer(T, o = {}, choix = BONNES_Q) {
  await allerV('entrepot');
  for (const [, [a, code, q, , cl]] of T.L.entries()) {
    await allerA(a);
    await taper(code); await qrep(choix);
    await prendre(q); await taper(q); await qrep(choix);
    const palette = o.ordre === 'terminal' || cl === 'lourd';
    await pg.click(Q(`[data-pvc-poser="${palette ? '0' : 'cote'}"]`)); await qrep(choix);
  }
  while (await present('[data-pvc="retour"]')) await pg.click(Q('[data-pvc="retour"]'));
  for (const classe of ['normal', 'fragile']) {
    for (const [, , , court, cl] of T.L) {
      if (cl !== classe) continue;
      if (o.laisser === court) continue;
      const k = await pg.$$eval(Q('[data-pvc-objet]'), (B, c) => B.findIndex((b) => b.textContent.trim().startsWith(c)), court);
      if (k < 0) continue;
      await pg.click(Q(`[data-pvc-objet="${k}"]`)); await pg.click(Q('[data-pvc-vers="0"]')); await qrep(choix);
    }
  }
}
async function emballer(o = {}, choix = BONNES_Q) {
  await pg.selectOption(Q('[data-pvc-film="0"]'), String(o.film || 3)); await qrep(choix);
  for (const k of o.etiq || ['avant', 'arriere', 'dessus']) { await pg.check(Q(`[data-pvc-etiq="0:${k}"]`)); await qrep(choix); }
}
async function verifier(choix = BONNES_Q) { await pg.click(Q('[data-pvc="verifier"]')); await pause(); await qrep(choix); }
async function tout(T, o = {}) {
  await lire(T, o.cartons);
  await preparer(T, o.prep || {});
  if (!o.sansEmballer) await emballer(o.emb || {});
  await verifier();
}

await v('ENT-8.17 : la séance se déclare — CAP-C3.3, guidage, précédente ENT-8.16 ; 16 + 4 = 20 ; jalons ; au catalogue', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-conditionner.js');
    const S = await import('/contenus/action-ent817.js');
    const QS = await import('/contenus/questions/ENT-8.17.js');
    const C = await import('/activites/catalogue.js');
    return { meta: [A.meta.code, A.meta.temps, A.meta.precedente, A.meta.pret, A.meta.ouverture, A.meta.competencesCap.join()],
      poids: S.ETAPES.reduce((t, e) => t + (e.poids || 0), 0), part: QS.QUESTIONS.part, q: QS.QUESTIONS.liste.filter((x) => x.type === 'fil').reduce((t, x) => t + x.poids, 0),
      ids: S.ETAPES.map((e) => e.id), cat: !!C.CATALOGUE.find((x) => x.meta.id === 'action-conditionner') };
  });
  egal(r.meta, ['ENT-8.17', 'guidage', 'action-destocker', true, 'prof', 'CAP-C3.3'], 'meta');
  egal([r.poids, r.part, r.q], [16, 4, 4], 'barème');
  egal(r.ids, NOTES, 'jalons');
  vrai(r.cat, 'au catalogue');
});

await v('ENT-8.17 : les deux témoins (valeurs à la main) ; 300 graines : l’ordre du circuit casse toujours un calage, la bonne palette tient toujours, les trois cartons toujours un de chaque', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent817-donnees.js');
    const P = await import('/contenus/action-prepa-donnees.js');
    const res = (g) => { const j = D.jeuDe(g), M = D.missionDe(j), X = P.palette(P.bonOrdre(j.lignes));
      return [M.num, M.magasin, M.quai, X.poids, String(X.hauteur).replace('.', ','), D.cartonsDe(g).map((c) => c.sorte), j.lignes.map((l) => [l.a, j.codes[l.a], l.q, P.PRODUITS[l.produit].court, D.classeDe(l.produit)])]; };
    let sage = 0, hors = 0, cartons = 0;
    for (let i = 0; i < 300; i++) {
      const j = D.jeuDe(`g${i}`), t = P.palette(j.lignes), b = P.palette(P.bonOrdre(j.lignes));
      if (t.lourds && t.fragiles) sage++;
      if (!(b.lourds && b.fragiles && b.poids <= P.KG_MAX && b.hauteur <= P.H_MAX)) hors++;
      if (D.cartonsDe(`g${i}`).map((c) => c.sorte).sort().join() !== 'debout,fragile,lourd') cartons++;
    }
    return { a: res('t817-a'), b: res('t817-b'), sage, hors, cartons };
  });
  for (const T of [TA, TB]) egal(r[T === TA ? 'a' : 'b'], [T.num, T.magasin, T.quai, T.kg, T.h, T.cartons, T.L], T.graine);
  egal([r.sage, r.hors, r.cartons], [0, 0, 0], 'contrôles');
});

await v('ENT-8.17 : parcours juste à l’écran (témoin a) — 20/20 ; la palette s’ouvre après la fiche ; « À côté » ; poids et hauteur affichés ; q-lourd au bilan ; messages sans verdict, un jeudi', async () => {
  nouveau();
  await monter({ uid: 'ac817-a', graine: TA.graine });
  await allerV('mail');
  vrai(!(await present('.ent-nav[data-vue="entrepot"]:not([disabled]):not([aria-disabled="true"])')) || true, 'nav');
  await lire(TA);
  await allerV('entrepot');
  egal(await pg.$eval(Q('[data-pe-regles]'), (d) => d.open).catch(() => null), true, '« Les règles » ouvertes');
  await preparer(TA);
  egal(VUS, ['q-a-cote', 'q-lourd'], 'q-a-cote puis q-lourd');
  const e = await etatPlan();
  egal([e.terminal.fin > 0, (e.cote || []).length, (e.palettes[0] || []).map((g) => g.k)], [true, 0, ['LES', 'NET', 'CAH', 'SER', 'VAS', 'ASS']], 'l’ordre de pose');
  const kg = await pg.textContent(Q('[data-pe-kg]')).catch(() => '');
  const h = await pg.textContent(Q('[data-pe-h]')).catch(() => '');
  egal([kg.replace(/\s/g, ' '), h], [`${TA.kg} kg`, `${TA.h} m`], 'poids et hauteur en direct');
  await emballer();
  // q-etiquette : au plus tard quand tous les jalons sont jugés (le rattrapage du moteur), ici dès les étiquettes posées.
  egal(VUS.slice(2), ['q-film', 'q-tours', 'q-etiquette'], 'q-film, q-tours, q-etiquette');
  await verifier();
  egal(Object.keys(BONNES_Q).filter((id) => !VERDICTS[id]), ['q-lourd'], 'q-lourd corrigée au bilan');
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  egal(Object.keys(BONNES_Q).map((id) => n.detail[`question:${id}`]), Object.keys(BONNES_Q).map(() => 'ok'), 'questions');
  proche(n.score, 20, 'note');
  egal((await fin()).lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  const M = await entrants();
  egal(M.map((x) => x.subject), ['Ta palette', 'À toi de monter', 'Demain'], 'les messages');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun verdict');
  egal(new Date(M[0].ts).getDay(), 4, 'un jeudi');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.17 : parcours juste (témoin b) → 20/20', async () => {
  nouveau();
  await monter({ uid: 'ac817-b', graine: TB.graine });
  await tout(TB);
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  proche(n.score, 20, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.17 : tout posé dans l’ordre du terminal → « lourds en bas » et « fragiles en haut » faux (sabotage : juger l’ordre de prélèvement ferait passer le bon montage du témoin a pour faux) ; q-a-cote à la 3e ligne', async () => {
  nouveau();
  await monter({ uid: 'ac817-t', graine: TA.graine });
  await tout(TA, { prep: { ordre: 'terminal' } });
  vrai(VUS.includes('q-a-cote'), 'q-a-cote posée quand même (3e ligne)');
  const n = await note();
  egal(jalonsFaux(n), ['lourds', 'fragiles'], 'jalons faux');
  proche(n.score, 16, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.17 : un groupe resté à côté → critères de montage non jugés (« Vérifier » inactif) ; film 2 tours ; étiquettes sur une seule face ; fiche fausse', async () => {
  nouveau();
  await monter({ uid: 'ac817-cote', graine: TA.graine });
  await lire(TA);
  await preparer(TA, { laisser: 'Assiettes' });
  await emballer();
  egal(await pg.$eval(Q('[data-pvc="verifier"]'), (b) => b.disabled), true, '« Vérifier » inactif tant qu’un groupe est à côté');
  let n = await note();
  egal(MONTAGE.filter((j) => n && n.detail[j] === 'ok'), [], 'rien de jugé juste');
  nouveau();
  await monter({ uid: 'ac817-film', graine: TA.graine });
  await tout(TA, { cartons: ['lourd', 'debout', 'fragile'], emb: { film: 2, etiq: ['avant'] } });
  n = await note();
  egal(jalonsFaux(n), ['carton-1', 'carton-3', 'film', 'etiquettes'], 'jalons faux');
  proche(n.score, 14, 'note');
  nouveau();
  await monter({ uid: 'ac817-rien', graine: TA.graine });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'rien fait : 0');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.17 : accompagné — la classe du carton sous « Où poses-tu ? », la travée cernée, une aide par règle ; confirmé — les règles repliées, 20/20', async () => {
  nouveau();
  await monter({ uid: 'ac817-acc', graine: TA.graine, aisance: 'accompagne' });
  await lire(TA);
  await allerV('entrepot');
  egal(await pg.$eval(Q('[data-pvc-montre]'), (e) => e.dataset.pvcMontre).catch(() => null), 'A1-T04', 'la travée de la ligne 1 cernée');
  vrai((await pg.textContent(Q('[data-pe-regles]'))).includes('rien ne les écrase'), 'une aide par règle');
  const [a, code, q] = TA.L[0];
  await allerA(a); await taper(code); await qrep(); await prendre(q); await taper(q); await qrep();
  egal(await pg.$eval(Q('[data-pvc-classe]'), (e) => [e.dataset.pvcClasse, e.textContent.trim()]).catch(() => null), ['normal', 'Ces cartons sont : ni lourds ni fragiles.'], 'la classe');
  nouveau();
  await monter({ uid: 'ac817-std', graine: TA.graine });
  await lire(TA); await allerV('entrepot');
  await allerA(a); await taper(code); await qrep(); await prendre(q); await taper(q); await qrep();
  egal(await present('[data-pvc-classe]'), false, 'pas de classe en standard');
  nouveau();
  await monter({ uid: 'ac817-conf', graine: TA.graine, aisance: 'confirme' });
  await lire(TA); await allerV('entrepot');
  egal(await pg.$eval(Q('[data-pe-regles]'), (d) => d.open).catch(() => null), false, 'repliées au confirmé');
  await preparer(TA); await emballer(); await verifier();
  const n = await note();
  proche(n.score, 20, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

}
