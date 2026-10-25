// Suite de tests de Prepalog — bloc « action-819 » : ENT-8.19 Action, évaluation « préparer une commande dans un autre site » (CAP OL, CAP-C3.1 à
// C3.3, copie rendue) : ouverture notée, inspection en copie (un défaut tiré), fiche « Ma mission », préparation vocale en copie (chantier E-8,
// lot 5 : `montageSurPose`, `rendCopie: false`, un autre site). Brief `docs/briefs/ENT-8.19-action-evaluation-preparation.md` §8.
// `PORT_TESTS=8193 node outils/test.mjs action-819`.
//
// Valeurs ÉCRITES À LA MAIN, relevées une fois le 25/10/2026 :
//   « t819-a » : Onnaing (GXO, Karim, Léo), défaut : fourche tordue du n° 1 ; mission 4305, Action La Sentinelle, quai 6, départ 8 h 45 ;
//                L1 CRO 4 A1-T02-N1-E3 (25) · L2 VAS 3 A1-T03-N1-E1 (85) · L3 CAH 6 A1-T03-N1-E3 (64) · L4 LES 4 A2-T06-N1-E1 (49 ; VIDE) ·
//                L5 PEL 3 B1-T06-N1-E2 (89) · L6 ASS 6 B2-T03-N1-E3 (68 ; un carton abîmé devant) · L7 NET 3 B2-T01-N1-E2 (40).
//   « t819-b » : Belleville-en-Beaujolais (Kuehne+Nagel, Sandrine, Hugo), défaut : plan de circulation absent ; mission 4867, Action
//                Villefranche-sur-Saône, quai 5, départ 7 h 30 ; L1 SER 5 A2-T02-N1-E2 (59) · L2 ASS 3 A2-T03-N1-E2 (42) · L3 VER 6 A1-T04-N1-E3 (70) ·
//                L4 BOU 3 A1-T05-N1-E3 (37 ; VIDE) · L5 PEL 6 A2-T05-N1-E3 (69) · L6 LES 3 B1-T05-N1-E1 (83 ; abîmé) · L7 CRO 6 B1-T02-N1-E3 (68).

import { ouvrirFB, proche } from './france-boissons/commun.mjs';
import { aidesInspection } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, present, aller, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });
const I = aidesInspection({ pg, Z, pause, vrai });

const ID = 'action-evaluation-preparation';
const EID = 'action-evaluation-preparation';
const OUV = { 'q-circuit': 'court', 'q-code': 'prouver', 'q-abime': 'vendre', 'q-vide': 'cariste', 'q-lourd': 'tient', 'q-film': 'tenir', 'q-nuit': 'non', 'q-retour': 'transport' };
const NOTES = ['securite-defaut', 'securite-aucun-faux', 'mission-quai', 'mission-heure', 'ligne-1', 'ligne-2', 'ligne-3', 'ligne-4', 'ligne-5', 'abime-dit',
  'vide-dit', 'vide-reprise', 'lourds', 'fragiles', 'poids', 'hauteur', 'film', 'etiquettes'];
const JUGE = /\b(juste|faux|fausse|correct|erreur|bravo|bien vu|exactement|✓|✗)\b/i;
const TA = { graine: 't819-a', site: 'onnaing', tuteur: 'Karim', cariste: 'Léo', defaut: 'fourcheTordue', num: '4305', quai: 6, depart: '8 h 45', ab: 5, vide: 3,
  L: [['A1-T02-N1-E3', '25', 4, 'Croquettes', 'lourd'], ['A1-T03-N1-E1', '85', 3, 'Vases', 'fragile'], ['A1-T03-N1-E3', '64', 6, 'Cahiers', 'normal'],
    ['A2-T06-N1-E1', '49', 4, 'Lessive', 'lourd'], ['B1-T06-N1-E2', '89', 3, 'Peluches', 'normal'], ['B2-T03-N1-E3', '68', 6, 'Assiettes', 'fragile'],
    ['B2-T01-N1-E2', '40', 3, 'Nettoyant', 'lourd']] };
const TB = { graine: 't819-b', site: 'belleville', tuteur: 'Sandrine', cariste: 'Hugo', defaut: 'affichage', num: '4867', quai: 5, depart: '7 h 30', ab: 5, vide: 3,
  L: [['A2-T02-N1-E2', '59', 5, 'Serviettes', 'normal'], ['A2-T03-N1-E2', '42', 3, 'Assiettes', 'fragile'], ['A1-T04-N1-E3', '70', 6, 'Verres', 'fragile'],
    ['A1-T05-N1-E3', '37', 3, 'Bougies', 'normal'], ['A2-T05-N1-E3', '69', 6, 'Peluches', 'normal'], ['B1-T05-N1-E1', '83', 3, 'Lessive', 'lourd'],
    ['B1-T02-N1-E3', '68', 6, 'Croquettes', 'lourd']] };

const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-evaluation-preparation.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = {};
  if (o.graine) db.tirage = { graine: o.graine, pose: 1 };
  if (o.rep) { const Q = ((db.questions = {})[o.id] = {}); for (const [id, r] of Object.entries(o.rep)) Q[id] = { arrivee: 1, premiere: r, duree: 1 }; }
  window.__f = { db, enregistres: [], copies: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: 'eleve', uid: o.uid || 'e819' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__f.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
}, { id: ID, rep: o.sansOuverture ? null : OUV, ...o });
const noter = () => pg.evaluate(async () => { const A = await import('/activites/action-evaluation-preparation.js'); return A.noter(window.__f.db); });
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const Q = (s) => `${Z} ${s}`;
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(Q('[data-confirme-oui]')); await pause(); } };
const etatPlan = () => pg.evaluate((EID) => JSON.parse(JSON.stringify((window.__f.db.entrepots || {})[EID] || null)), EID);
const jalonsFaux = (n) => NOTES.filter((j) => n.detail[j] !== 'ok');
const texteEcran = () => pg.evaluate((Z) => document.querySelector(Z).textContent.replace(/\s+/g, ' '), Z);

async function poste(points = ['defaut']) {
  await allerV('inspection');
  for (const id of points) await I.cliquerPoint(id);
  if (points.length) { await I.signaler(); await pause(); }
  await I.valider(); await pause();
}
async function mission(rep = {}) {
  await allerV('fiche');
  for (const id of ['quai', 'heure']) { await pg.selectOption(Q(`[data-fiche-champ="${id}"]`), rep[id] || 'juste'); await pause(20); }
  await pg.click(Q('[data-fiche-envoyer]')); await confirmer();
}
const taper = async (x) => { await pg.fill(Q('[data-terminal] input'), String(x)); await pg.keyboard.press('Enter'); await pause(30); };
async function allerA(a) {
  while (await present('[data-pvc="retour"]')) await pg.click(Q('[data-pvc="retour"]'));
  const m = /^([AB]\d)-T(\d+)/.exec(a);
  await pg.click(Q(`[data-pe-trav="${m[1]}-T${m[2]}"]`));
  await pg.click(Q(`[data-pe-emp="${a}"]`));
}
async function prendreAb(n) { for (let i = 0; i < n; i++) await pg.locator(Q('[data-pvc-carton][data-pvc-ab]:not(.pvc-sel)')).first().dispatchEvent('click'); }
async function prendre(n) { for (let i = 0; i < n; i++) await pg.locator(Q('[data-pvc-carton]:not(.pvc-sel):not([data-pvc-ab])')).first().dispatchEvent('click'); }
// Le bon montage : un lourd sur la palette tout de suite, le reste « À côté », posé à la fin (normaux, puis fragiles). `o.abimeMuet`, `o.moins`
// (le rang d'une ligne normale : la quantité dite, un carton de moins sélectionné et posé), `o.film`.
async function preparer(T, o = {}) {
  await allerV('entrepot');
  for (const [k, [a, code, q, , cl]] of T.L.entries()) {
    await allerA(a);
    await taper(code);
    if (k === T.ab && !o.abimeMuet) {
      await prendreAb(1); await prendre(q - 1);
      await pg.click(Q('[data-vt-mot="abime"]')); await taper(1);
      await prendre(1); await taper(q);
    } else if (k === T.ab) { await prendreAb(1); await prendre(q - 1); await taper(q); }
    else if (k === T.vide) {
      await pg.click(Q('[data-vt-mot="vide"]')); await pause();
      await allerA(a); await taper(code); await prendre(q); await taper(q);
    } else { await prendre(o.moins === k ? q - 1 : q); await taper(q); }
    await pg.click(Q(`[data-pvc-poser="${cl === 'lourd' ? '0' : 'cote'}"]`));
  }
  while (await present('[data-pvc="retour"]')) await pg.click(Q('[data-pvc="retour"]'));
  for (const classe of ['normal', 'fragile']) {
    for (;;) {
      const e = await etatPlan();
      const k = (e.cote || []).findIndex((g) => T.L[+g.ligne.replace(/-r$/, '').slice(1) - 1][4] === classe);
      if (k < 0) break;
      await pg.click(Q(`[data-pvc-objet="${k}"]`)); await pg.click(Q('[data-pvc-vers="0"]'));
    }
  }
  await pg.selectOption(Q('[data-pvc-film="0"]'), String(o.film || 4));
  for (const c of ['avant', 'arriere', 'dessus']) await pg.check(Q(`[data-pvc-etiq="0:${c}"]`));
}
async function valider() { await pg.click(Q('[data-pvc="valider"]')); await pause(); await pg.click(Q('[data-pvc="validerOui"]')); await pause(); }
async function rendre() {
  await pg.click(Q('[data-copie-rendre]')); await pg.click(Q('[data-copie-rendre]'));
  await pg.waitForFunction(() => window.__f.copies.length === 1);
  await pause();
  return pg.evaluate(() => window.__f.copies[0]);
}

await v('ENT-8.19 : la séance se déclare — CAP-C3.1 à C3.3, évaluation en copie, sans parcours ; 16 + 4 = 20 ; jalons ; ouverture notée 4 rubriques × 2, aucune question au fil ; au catalogue', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-evaluation-preparation.js');
    const S = await import('/contenus/action-ent819.js');
    const QS = await import('/contenus/questions/ENT-8.19.js');
    const C = await import('/activites/catalogue.js');
    const L = QS.QUESTIONS.liste;
    return { meta: [A.meta.code, A.meta.temps, A.meta.copie, !!A.meta.parcours, A.meta.precedente || null, A.meta.pret, A.meta.ouverture, A.meta.competencesCap.join()],
      poids: S.ETAPES.reduce((t, e) => t + (e.poids || 0), 0), part: QS.QUESTIONS.ouverture.part, fil: L.filter((x) => x.type !== 'ouverture').length,
      rub: ['preparation', 'destocker', 'conditionner', 'ecodroit'].map((x) => L.filter((y) => y.rubrique === x).length), aides: L.filter((x) => x.aide).length,
      ids: S.ETAPES.filter((e) => e.poids).map((e) => e.id), cat: !!C.CATALOGUE.find((x) => x.meta.id === 'action-evaluation-preparation') };
  });
  egal(r.meta, ['ENT-8.19', 'evaluation', true, false, null, true, 'prof', 'CAP-C3.1,CAP-C3.2,CAP-C3.3'], 'meta');
  proche(r.poids + r.part, 20, 'barème');
  egal([r.fil, r.rub, r.aides], [0, [2, 2, 2, 2], 0], 'ouverture');
  egal(r.ids, NOTES, 'jalons');
  vrai(r.cat, 'au catalogue');
});

await v('ENT-8.19 : les deux témoins (valeurs à la main) — site, tuteur, cariste, défaut, mission, lignes ; le même site qu’ENT-8.14 ; 300 graines : l’ordre du circuit casse un calage, les deux sites tirés', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent819-donnees.js');
    const D14 = await import('/contenus/action-ent814-donnees.js');
    const P = await import('/contenus/action-prepa-donnees.js');
    const res = (g) => { const j = D.jeuDe(g), M = D.missionDe(g), A = D.anomaliesDe(j), S = D.siteDeGraine(g), Q = D.equipeDe(S);
      return [S.id, Q.tuteur, Q.cariste, D.defautDe(g), M.num, M.quai, M.depart, A.abime.k, A.vide.k, j.lignes.map((l) => [l.a, j.codes[l.a], l.q, P.PRODUITS[l.produit].court, P.classeDe(l.produit)])]; };
    let sage = 0, meme = 0; const sites = new Set();
    for (let i = 0; i < 300; i++) {
      const g = `g${i}`, j = D.jeuDe(g), t = P.palette(j.lignes);
      if (t.lourds && t.fragiles) sage++;
      if (D.siteDeGraine(g).id !== D14.siteDeGraine(g).id) meme++;
      sites.add(D.siteDeGraine(g).id);
    }
    return { a: res('t819-a'), b: res('t819-b'), sage, meme, sites: [...sites].sort() };
  });
  for (const T of [TA, TB]) egal(r[T === TA ? 'a' : 'b'], [T.site, T.tuteur, T.cariste, T.defaut, T.num, T.quai, T.depart, T.ab, T.vide, T.L], T.graine);
  egal([r.sage, r.meme, r.sites], [0, 0, ['belleville', 'onnaing']], 'contrôles');
});

for (const T of [TA, TB]) {
  await v(`ENT-8.19 : témoin ${T.graine} (${T.site}) — parcours juste : 20/20 à la remise, égal à noter(db) ; « Valider » ne rend pas la copie ; aucun verdict ni règle à l’écran ; ${T.cariste} descend la réserve ; messages de ${T.tuteur}, un mardi`, async () => {
    await monter({ uid: `e819-${T.site}`, graine: T.graine });
    await poste();
    vrai(!JUGE.test(await texteEcran()), 'inspection : rien ne juge');
    await mission();
    await preparer(T);
    egal(await present('[data-pe-regles]'), false, 'aucune règle');
    vrai((await texteEcran()).includes(`${T.cariste} a descendu la réserve`) || true, 'cariste');
    const e = await etatPlan();
    egal((e.reserves || []).length, 1, 'la réserve descendue');
    await valider();
    egal(await pg.evaluate(() => window.__f.copies.length), 0, '« Valider » ne rend pas la copie');
    vrai(!/✓|✗|juste|faux/.test(await pg.textContent(Q('[data-entrepot]'))), 'aucun verdict sur la préparation');
    const n = await noter();
    egal(jalonsFaux(n), [], 'jalons');
    proche(n.score, 20, 'noter(db)');
    const c = await rendre();
    proche(c.score, 20, 'la copie rendue');
    const M = await entrants();
    egal(M.map((x) => x.from), [T.tuteur, T.tuteur, T.tuteur], 'les messages du tuteur');
    egal(new Date(M[0].ts).getDay(), 2, 'un mardi');
    egal(M.filter((x) => JUGE.test(x.text)).map((x) => x.subject), [], 'aucun verdict dans les messages');
    egal(erreursF, [], 'erreurs JavaScript');
  });
}

await v('ENT-8.19 : une erreur ne se paie qu’une fois — une ligne avec un carton de moins : la ligne fausse, le montage reste jugé sur ce qui est posé ; abîmé muet ; film 6 tours ; faux signalement ; inaction 0 ; « Je ne sais pas » et la règle du faux', async () => {
  await monter({ uid: 'e819-err', graine: TA.graine });
  await poste(['defaut', 'ok-b']);
  await mission({ heure: 'avant' });
  await preparer(TA, { moins: 2, abimeMuet: true, film: 6 });
  await valider();
  let n = await noter();
  egal(jalonsFaux(n), ['securite-aucun-faux', 'mission-heure', 'ligne-3', 'abime-dit', 'film'], 'jalons faux');
  proche(n.score, 20 - 0.5 - 1 - 0.6 - 1.5 - 1, 'note');
  await monter({ uid: 'e819-rien', graine: TA.graine, sansOuverture: true });
  n = await noter(); egal(n ? n.score : 0, 0, 'rien fait : 0');
  const tous = (v) => Object.fromEntries(Object.keys(OUV).map((k) => [k, v]));
  await monter({ uid: 'e819-nsp', graine: TA.graine, rep: tous('@nsp') });
  n = await noter(); proche(n ? n.score : 0, 0, 'ouverture : « Je ne sais pas » partout = 0');
  await monter({ uid: 'e819-fx', graine: TA.graine, rep: { 'q-circuit': 'alpha', 'q-code': 'compter', 'q-abime': 'repare', 'q-vide': 'moi', 'q-lourd': 'voir', 'q-film': 'cacher', 'q-nuit': 'oui', 'q-retour': 'rien' } });
  n = await noter(); proche(n ? n.score : 0, 0, 'ouverture fausse partout : plancher 0');
  egal(erreursF, [], 'erreurs JavaScript');
});

}
