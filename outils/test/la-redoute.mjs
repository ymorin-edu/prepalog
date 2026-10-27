// Suite de tests de Prepalog — bloc « la-redoute » : La Redoute ENT-17.1 à 17.5, emballer juste et trier les retours à Quai 30 (Tle, C2.2 et C3.3).
// `node outils/test.mjs la-redoute` ne lance que ce bloc. Cadrage : `docs/briefs/la-redoute/CADRAGE-la-redoute-tle.md`. Aides : `outils/test/ikea/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (relues sur les règles du poste le 27/10/2026 ; le code les calcule, le test les écrit) :
// ENT-17.1 : C-1701 2,5 L souple → pochette ; C-1702 5 L → S (vide 3 ÷ 8 = 37,5 %) ; C-1703 6 L → S ; C-1704 7 L → S ; C-1705 lampe 10 + T-shirt 1 + calage 2
//   = 13 L → M (vide 5 ÷ 16 = 31,25 %) ; 30 + 150 × 3 + 250 = 730 g contre 250 × 5 = 1 250 g : 520 g économisés.
// ENT-17.2 : pochette, S (vase 4 + 2 = 6 L ; vide 4 ÷ 8 = 50 %), S, S, L (lampe + coussin + calage = 17 L), M, M (9 L ; vide 7 ÷ 16 = 43,75 %), pochette ;
//   1 410 g contre 2 150 g : 740 g.
// ENT-17.3 : R-01 stock, R-02 reconditionnement, R-03 don, R-04 stock, R-05 recyclage, R-06 reconditionnement, R-07 stock, R-08 don ; 5 ÷ 8 = 62,5 %.
// ENT-17.4 : Julien a mal trié R-14 (essayé → stock) et R-16 (petite tache → recyclage) ; son 80 % compte les dons ; le vrai : 7 ÷ 10 = 70 %.
// ENT-17.5 : pochette, S (vase, vide 50 %), M, S ; 580 g contre 1 000 g : 420 g ; R-31 recond., R-32 stock, R-33 recyclage, R-34 don, R-35 recond.,
//   R-36 stock ; 4 ÷ 6 = 66,7 %.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const S1 = { id: 'la-redoute-emballage', act: '/activites/la-redoute-emballage.js', n: '1' };
const S2 = { id: 'la-redoute-emballage-fragile', act: '/activites/la-redoute-emballage-fragile.js', n: '2' };
const S3 = { id: 'la-redoute-retours', act: '/activites/la-redoute-retours.js', n: '3' };
const S4 = { id: 'la-redoute-tri-julien', act: '/activites/la-redoute-tri-julien.js', n: '4' };
const S5 = { id: 'la-redoute-evaluation', act: '/activites/la-redoute-evaluation.js', n: '5' };
const OBJET = 'Ton compte rendu';

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S1.act, id: S1.id });
const { pg, Z, pause, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter } = P;

const OUV = { vide: 'air', pochette: 'souple', retour: 'controle', rse: 'effets', agec: 'donner', ppwr: '50' };
const R = {
  'pochette-ou-carton': 'volume', 'vide-cout': 'camion', reduire: 'reduire', 'qui-gagne': 'tous',
  'calage-vide': 'regle', 'trop-grand': 'L', 'une-pochette': 'petite', reutilisable: 'dechets',
  essaye: 'controle', 'pas-detruire': 'agec', 'don-pas-vente': 'revenu', 'retour-gratuit': 'transport',
  r14: 'client', 'chiffre-faux': 'decision', 'dire-julien': 'montrer', reemploi: 'reemploi',
  priorite: 'formats',
};
const qFil = async () => {
  for (let i = 0; i < 8; i++) {
    await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 600 }).catch(() => null);
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(R[q], `question au fil « ${q} » sans réponse prévue`);
    await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80);
    if (await pg.$(`${Z} [data-q-repondre="${q}"]`)) { await clic(`[data-q-choix="${R[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); }
    if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); }
  }
};
let S = S1;
const mont = (s, o = {}) => { S = s; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'lr-' + s.id, ...o }); };
const detail = async () => (await noter(S.act)).detail;
const ko = (d) => Object.keys(d).filter((k) => d[k] === 'ko');

// La fiche : `cases` = { bloc: [valeurs] }, `nb` = { bloc: texte }, `choix` = { bloc: valeur } (radio), `liste` = { bloc: valeur } (menu déroulant).
async function fiche({ cases = {}, nb = {}, choix = {}, liste = {} }) {
  await allerV('fiche');
  for (const [b, L] of Object.entries(cases)) for (const x of L) { await pg.check(`${Z} [data-fiche-case="${b}"][value="${x}"]`); await pause(200); await qFil(); }
  for (const [b, x] of Object.entries(liste)) { await pg.selectOption(`${Z} select[data-fiche-champ="${b}"]`, x); await pause(200); await qFil(); }
  for (const [b, x] of Object.entries(choix)) { await pg.check(`${Z} [data-fiche-champ="${b}"][value="${x}"]`); await pause(200); await qFil(); }
  // Une saisie publie son geste à la sortie de la case : une question peut tomber entre deux saisies.
  for (const [b, x] of Object.entries(nb)) { await pg.fill(`${Z} [data-fiche-saisie="${b}"]`, String(x)); await pg.keyboard.press('Tab'); await pause(200); await qFil(); }
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil();
}
const choixDe = () => pg.evaluate((o) => { const m = window.__f.db.mails.find((x) => x.subject === o); return m ? Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix.slice()])) : null; }, OBJET);
async function proposer(surcharge = {}) {
  const L = await choixDe();
  vrai(L, `le message « ${OBJET} » n’est pas arrivé`);
  const t = Object.fromEntries(Object.entries(L).map(([k, c]) => [k, c[0]]));
  for (const [k, i] of Object.entries(surcharge)) t[k] = L[k][i];
  await phrases(OBJET, t);
  await qFil();
}
async function jouer(F, compte) { await fiche(F); await proposer(compte); }
const fmt = (o) => Object.fromEntries(Object.entries(o).map(([c, f]) => [`fmt-${c}`, f]));
const fil = (o) => Object.fromEntries(Object.entries(o).map(([r, f]) => [`fil-${r}`, f]));
const F1 = { liste: fmt({ 'C-1701': 'pochette', 'C-1702': 'S', 'C-1703': 'S', 'C-1704': 'S', 'C-1705': 'M' }),
  nb: { 'vide-C-1702': '37,5', 'vide-C-1705': '31,25', apres: 730, gain: 520 } };
const F2 = { liste: fmt({ 'C-1711': 'pochette', 'C-1712': 'S', 'C-1713': 'S', 'C-1714': 'S', 'C-1715': 'L', 'C-1716': 'M', 'C-1717': 'M', 'C-1718': 'pochette' }),
  nb: { 'vide-C-1712': 50, 'vide-C-1717': '43,75', apres: '1 410', gain: 740 } };
const F3 = { liste: fil({ 'R-01': 'stock', 'R-02': 'recond', 'R-03': 'don', 'R-04': 'stock', 'R-05': 'recyclage', 'R-06': 'recond', 'R-07': 'stock', 'R-08': 'don' }),
  nb: { taux: '62,5' } };
const F4 = { cases: { erreurs: ['R-14', 'R-16'] }, choix: { cause: 'don' }, nb: { taux: 70 } };
const F5 = { liste: { ...fmt({ 'C-1751': 'pochette', 'C-1752': 'S', 'C-1753': 'M', 'C-1754': 'S' }),
  ...fil({ 'R-31': 'recond', 'R-32': 'stock', 'R-33': 'recyclage', 'R-34': 'don', 'R-35': 'recond', 'R-36': 'stock' }) },
  nb: { 'vide-C-1752': 50, apres: 580, gain: 420, taux: '66,7' } };

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-17.x : les cinq séances se chargent (Tle : guidage, entraînement, guidage, erreur induite, évaluation) ; jalons + questions = 20 ; entreprise n° 17 ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/la-redoute-ent17${s.n}.js`);
      const Q = await import(`/contenus/questions/ENT-17.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret, A.meta.ouverture, A.meta.reinitialisable],
        total: C.ETAPES.reduce((t, e) => t + e.poids, 0), part: Q.QUESTIONS.part || 0, ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id) });
    }
    return { out, e: I.ENTREPRISES.find((x) => x.n === 17) };
  }, [S1, S2, S3, S4, S5]);
  egal(r.out.map((x) => x.m), [
    ['ENT-17.1', ['tle'], ['C2.2', 'C3.3'], 'guidage', 20, undefined, 'ENT-17.1', true, 'prof', true],
    ['ENT-17.2', ['tle'], ['C2.2', 'C3.3'], 'entrainement', 20, undefined, 'ENT-17.2', true, 'prof', undefined],
    ['ENT-17.3', ['tle'], ['C3.3'], 'guidage', 20, undefined, 'ENT-17.3', true, 'prof', undefined],
    ['ENT-17.4', ['tle'], ['C3.3'], 'erreur', 20, undefined, 'ENT-17.4', true, 'prof', undefined],
    ['ENT-17.5', ['tle'], ['C2.2', 'C3.3'], 'evaluation', 20, true, 'ENT-17.5', true, 'prof', undefined],
  ], 'meta');
  egal(r.out.map((x) => x.total + x.part + x.ouvPart), [20, 20, 20, 20, 20], 'jalons + questions');
  egal(r.out.map((x) => x.noter), ['undefined', 'undefined', 'undefined', 'undefined', 'function'], 'noter seulement en évaluation');
  egal(r.out.map((x) => x.reg), [true, true, true, true, true], 'au registre');
  egal([r.e.nom, r.e.logo], ['La Redoute', './contenus/trames/logos/la-redoute.svg'], 'entreprise n° 17');
});

await v('ENT-17.x : les données — le plus petit format (calage des fragiles, pochette pour le souple seulement), le vide, le carton économisé ; les filières des retours, le taux, le tri de Julien (valeurs écrites à la main)', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/la-redoute-donnees.js');
    const e = (D) => { const E = M.emballage(D); return [E.formats, D.vide.map((c) => E.vides[c]), E.apres, E.avant, E.gain]; };
    const t = (D) => { const R = M.retours(D); return [Object.values(R.filieres), R.taux]; };
    const J = M.travailDeJulien(M.D174);
    return { e1: e(M.D171), e2: e(M.D172), e5: e(M.D175), t3: t(M.D173), t4: t(M.D174), t5: t(M.D175), j: [J.faux, J.taux],
      f: [M.formatDe(['TS', 'PU']), M.formatDe(['BA']), M.formatDe(['PL', 'TS']), M.formatDe(['VA', 'TS']), M.formatDe(['PU', 'VA'])] };
  });
  egal(r.f, ['pochette', 'S', 'S', 'S', 'M'], 'la règle (4 L souple → pochette ; 6 L rigide → S ; 5 L souple → S ; vase + T-shirt + calage = 7 L → S ; pull + vase + calage = 9 L → M)');
  egal(r.e1, [{ 'C-1701': 'pochette', 'C-1702': 'S', 'C-1703': 'S', 'C-1704': 'S', 'C-1705': 'M' }, [37.5, 31.25], 730, 1250, 520], 'ENT-17.1');
  egal(r.e2, [{ 'C-1711': 'pochette', 'C-1712': 'S', 'C-1713': 'S', 'C-1714': 'S', 'C-1715': 'L', 'C-1716': 'M', 'C-1717': 'M', 'C-1718': 'pochette' }, [50, 43.75], 1410, 2150, 740], 'ENT-17.2');
  egal(r.e5, [{ 'C-1751': 'pochette', 'C-1752': 'S', 'C-1753': 'M', 'C-1754': 'S' }, [50], 580, 1000, 420], 'ENT-17.5 emballage');
  egal(r.t3, [['stock', 'recond', 'don', 'stock', 'recyclage', 'recond', 'stock', 'don'], 62.5], 'ENT-17.3');
  egal(r.t4[1], 70, 'ENT-17.4'); egal(r.j, [['R-14', 'R-16'], 80], 'le tri de Julien');
  egal(r.t5, [['recond', 'stock', 'recyclage', 'don', 'recond', 'stock'], 66.7], 'ENT-17.5 retours');
});

await v('ENT-17.x : les documents — les retours ne donnent pas la filière ; le tri de Julien ne dit pas qu’il est faux ; le droit cite le règlement 2025/40 et la loi AGEC ; chaque document reconstitué porte sa mention ; les phrases d’une ligne sont toutes différentes', async () => {
  const r = await pg.evaluate(async () => {
    const h = (S, id) => { const d = S.DOCUMENTS.find((x) => x.id === id); const e = document.createElement('div'); e.innerHTML = d.html; return e.textContent.replace(/\s+/g, ' '); };
    const C = {};
    for (const n of ['1', '2', '3', '4', '5']) C[n] = await import(`/contenus/la-redoute-ent17${n}.js`);
    const doubles = [];
    for (const n of ['1', '2', '3', '4', '5']) {
      const m = C[n].VOLET.declencheurs.find((d) => d.id === 'compte').semer('Léa').mails[0];
      for (const l of m.phrases.lignes) if (new Set(l.choix).size !== l.choix.length) doubles.push(`17.${n} ${l.id} : ${l.choix.join(' | ')}`);
    }
    return { ids: ['1', '3', '4', '5'].map((n) => C[n].DOCUMENTS.map((d) => d.id)), ret: h(C['3'], 'retours'), tri: h(C['4'], 'tri-julien'), droit: h(C['1'], 'droit'),
      poste: h(C['1'], 'poste'), cmd: h(C['1'], 'commandes'), doubles };
  });
  egal(r.ids, [['poste', 'commandes', 'articles', 'regle-emballage', 'droit'], ['poste', 'retours', 'regle-retours', 'droit'],
    ['poste', 'retours', 'tri-julien', 'regle-retours', 'droit'], ['poste', 'commandes', 'articles', 'regle-emballage', 'retours', 'regle-retours', 'droit']], 'documents');
  vrai(!/[Rr]emise en stock|[Rr]econditionnement|[Rr]ecyclage|\bdon\b/.test(r.ret), 'les retours donnent une filière : ' + r.ret);
  vrai(/R-14/.test(r.tri) && !/erreur|faux|mal/i.test(r.tri), 'le tri de Julien : ' + r.tri);
  vrai(/2025\/40/.test(r.droit) && /AGEC/.test(r.droit) && /50 %/.test(r.droit), 'le droit');
  for (const k of ['ret', 'tri', 'cmd']) vrai(/CONSTRUIT/.test(r[k]) && /reconstitution/.test(r[k]), `mention sur ${k}`);
  vrai(/Wattrelos/.test(r.poste) && /42 000 m²/.test(r.poste), 'les faits réels dans « Ton poste »');
  egal(r.doubles, [], 'phrases en double');
});

// ─────────────────────────────────────────────────────────── ENT-17.1
await v('ENT-17.1 : inaction → 0/20 ; un message de Claire avec les pièces ; parcours juste → 20/20 et le message de fin ; aucun message ne juge', async () => {
  await mont(S1, { sansOuverture: true });
  const n0 = await noter(S1.act);
  egal([n0.score, n0.max], [0, 20], 'note');
  vrai(!Object.values(n0.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n0.detail));
  await mont(S1);
  egal((await entrants()).map((m) => [m.from, m.pieces]), [['Claire, responsable d’exploitation', ['poste', 'commandes', 'articles', 'regle-emballage']]], 'messages');
  await jouer(F1);
  const n = await noter(S1.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail)); egal(n.max, 20, 'sur');
  const E = await entrants();
  egal(E.map((m) => m.subject), ['Le carton M pour tout, c’est fini ?', OBJET, 'Merci'], 'messages');
  vrai(!E.some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct)\b/i.test(m.text)), 'un message juge');
});

await v('ENT-17.1 : sabotages — C-1702 en pochette (−1,5) ; vide de C-1705 qui ne compte pas le calage comme du vide (−1,5) ; amélioration « tout en carton L » (−3) ; questions toutes fausses (−4)', async () => {
  const essai = async (F, compte, tombes, score, quoi) => {
    await mont(S1);
    await jouer(F, compte);
    egal(ko(await detail()), tombes, `${quoi} : jalons tombés`);
    proche((await noter(S1.act)).score, score, `${quoi} : note`);
  };
  await essai({ ...F1, liste: { ...F1.liste, 'fmt-C-1702': 'pochette' } }, {}, ['fmt-C-1702'], 18.5, 'C-1702 en pochette');
  await essai({ ...F1, nb: { ...F1.nb, 'vide-C-1705': '18,75' } }, {}, ['vide-C-1705'], 18.5, 'calage compté comme du volume utile');
  await essai(F1, { 'axe-emballage': 1 }, ['compte-rendu'], 17, 'tout en carton L');
  const sauve = { ...R };
  Object.assign(R, { 'pochette-ou-carton': 'fragile', 'vide-cout': 'rien', reduire: 'non', 'qui-gagne': 'personne' });
  try { await mont(S1); await jouer(F1); } finally { Object.assign(R, sauve); }
  proche((await noter(S1.act)).score, 16, 'trois fausses (la réflexion ne compte pas)');
});

// ─────────────────────────────────────────────────────────── ENT-17.2
await v('ENT-17.2 : parcours juste → 20/20 ; le vase en pochette, sans calage (−1) ; vide de C-1712 sans compter le calage (25 %) (−1,5)', async () => {
  await mont(S2);
  await jouer(F2);
  proche((await noter(S2.act)).score, 20, 'parcours juste');
  await mont(S2);
  await jouer({ ...F2, liste: { ...F2.liste, 'fmt-C-1712': 'pochette' }, nb: { ...F2.nb, 'vide-C-1712': 25 } });
  egal(ko(await detail()), ['fmt-C-1712', 'vide-C-1712'], 'le vase'); proche((await noter(S2.act)).score, 17.5, 'le vase');
});

// ─────────────────────────────────────────────────────────── ENT-17.3
await v('ENT-17.3 : parcours juste → 20/20 ; R-02 essayé remis en stock (−1,25) ; taux qui compte les dons (75 %) (−3)', async () => {
  await mont(S3);
  await jouer(F3);
  proche((await noter(S3.act)).score, 20, 'parcours juste');
  await mont(S3);
  await jouer({ ...F3, liste: { ...F3.liste, 'fil-R-02': 'stock' }, nb: { taux: 75 } });
  egal(ko(await detail()), ['fil-R-02', 'taux'], 'R-02 et taux'); proche((await noter(S3.act)).score, 15.75, 'R-02 et taux');
});

// ─────────────────────────────────────────────────────────── ENT-17.4
await v('ENT-17.4 : parcours juste → 20/20 ; seul R-14 trouvé (−5) ; « son taux est juste » et 80 % recopié, compte rendu « tri juste » (−3 −4 −4)', async () => {
  await mont(S4);
  await jouer(F4);
  proche((await noter(S4.act)).score, 20, 'parcours juste');
  await mont(S4);
  await jouer({ ...F4, cases: { erreurs: ['R-14'] } });
  egal(ko(await detail()), ['erreurs'], 'seul R-14'); proche((await noter(S4.act)).score, 15, 'seul R-14');
  await mont(S4);
  await jouer({ ...F4, choix: { cause: 'juste' }, nb: { taux: 80 } }, { erreur: 1 });
  egal(ko(await detail()), ['cause', 'taux', 'compte-rendu'], 'taux de Julien recopié'); proche((await noter(S4.act)).score, 9, 'taux de Julien recopié');
});

// ─────────────────────────────────────────────────────────── ENT-17.5 (copie rendue)
await v('ENT-17.5 : « Avant de commencer » noté (3 points) ; inaction → 3/20 et aucun jalon juste ; parcours juste → 20/20 ; le vase en pochette et R-33 jeté au don → 18', async () => {
  await mont(S5);
  let n = await noter(S5.act);
  proche(n.score, 3, 'ouverture seule : ' + JSON.stringify(n.detail));
  vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
  await jouer(F5);
  n = await noter(S5.act);
  proche(n.score, 20, 'parcours juste : ' + JSON.stringify(n.detail));
  await mont(S5);
  await jouer({ ...F5, liste: { ...F5.liste, 'fmt-C-1752': 'pochette', 'fil-R-33': 'don' } });
  egal(ko(await detail()), ['fmt-C-1752', 'fil-R-33'], 'vase et R-33');
  proche((await noter(S5.act)).score, 18, 'vase et R-33');
});

}
