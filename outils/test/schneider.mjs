// Suite de tests de Prepalog — bloc « schneider » : Schneider Electric ENT-22.1 à 22.10, le centre de distribution d'Évreux (CAP OL).
// `node outils/test.mjs schneider` ne lance que ce bloc. Cadrage : `docs/briefs/schneider/CADRAGE-schneider-cap.md`. Aides : `outils/test/ikea/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (relues sur les documents le 27/10/2026 ; le code les calcule, le test les écrit) :
// Colis à aider : plus de 25 kg (variateur grand modèle 27, onduleur 32, armoire 48). Pré-contrôle : pas planifié ou scellé différent → appeler ;
//   palettes en moins ou abîmées → décharger et noter ; sinon décharger.
// ENT-22.4 : L1 conforme, L2 24/22 il en manque, L3 1 carton écrasé, L4 conforme, L5 6/7 en trop ; 2 manquants, 1 abîmé ; avec réserves.
// ENT-22.5 : L1 conforme, L2 10/9 il en manque, L3 2 abîmés, L4 20/22 en trop, L5 conforme ; Mehdi s'est trompé en L2 et L4.
// Plaque de charge : niveaux 0-1 1 000 kg et 1,6 m, 2-3 800 kg et 1,6 m, 4 500 kg et 1,1 m.
// ENT-22.7 : armoire 920 kg → C3-12-04-0 ou C3-12-05-1 ; 950 kg au niveau 3 → je signale.
// ENT-22.8 : relevé d'accord, à recompter, d'accord, à recompter, d'accord ; C2-04-04-3 le drone s'est trompé ; C2-04-06-2 il manque 3.
// ENT-22.9 : 5 000 cartons × 56 % = 2 800 recyclés.
// ENT-22.6 : graine « b » → jeu 0 (C2 au quai Q6, 21 palettes ; réserve, appeler ; 3 manquants, 1 abîmé) ; « a » → jeu 1 (C3, Q7, 25 ; décharger,
//   appeler ; 1 manquant, 2 abîmés) ; « h » → jeu 2 (C1, Q5, 13 ; réserve, décharger ; 3 manquants, 1 abîmé).
// ENT-22.10 : graine « a » → jeu 0 (C4-07-02-3 il manque, 37 colis) ; « d » → jeu 1 (C6-03-05-2 le drone s'est trompé, 14) ; « b » → jeu 2
//   (C3-01-04-1 en trop, 15) ; la palette trop lourde est à signaler dans les trois jeux.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const SEANCES = [
  ['schneider-bienvenue', '1', '221'], ['schneider-accueil', '2', '222'], ['schneider-mardi', '3', '223'], ['schneider-controle', '4', '224'],
  ['schneider-mehdi', '5', '225'], ['schneider-evaluation-reception', '6', '226'], ['schneider-ranger', '7', '227'], ['schneider-drone', '8', '228'],
  ['schneider-circulaire', '9', '229'], ['schneider-evaluation-stock', '10', '2210'],
].map(([id, n, pre]) => ({ id, n, pre, act: `/activites/${id}.js` }));
const S_ = Object.fromEntries(SEANCES.map((s) => [s.n, s]));
const OBJET = 'Ton compte rendu';
const PRE222 = ['decharger', 'appeler', 'reserve'];

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S_['4'].act, id: S_['4'].id });
const { pg, Z, pause, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter, ouvrirParMessage } = P;

const OUV = { vend: 'distrib', planigramme: 'camions', scelle: 'preuve', reserve: 'precise', plaque: 'charge', drone: 'compte' };
// Les réponses au fil (les réflexions : le premier choix, non noté).
const RF = {
  4: { trop: 'non', avant: 'avant', 'trois-jours': '3', deballage: 'precis' },
  6: { apres: 'precontrole' },
  7: { 'pourquoi-plaque': 'effondre', scanner: 'perdue', niveau0: 'sol', cariste: 'caces' },
  10: { apres: 'ranger' },
};
let R = {};
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
let S = S_['4'];
const mont = (s, o = {}) => { S = s; R = { ...RF[s.n], ...(o.fil || {}) }; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'se-' + s.id, ...o }); };
const detail = async () => (await noter(S.act)).detail;
const ko = (d) => Object.keys(d).filter((k) => d[k] === 'ko');

// Une fiche : `liste` = { bloc: valeur } (menu), `choix` = { bloc: valeur } (radio), `cases` = { bloc: [valeurs] }, `nb` = { bloc: texte },
// `ordre` = { bloc: [valeurs dans l'ordre voulu] } (flèches ↑ à la souris).
async function remplir({ liste = {}, choix = {}, cases = {}, nb = {}, ordre = {} }) {
  for (const [b, x] of Object.entries(liste)) { await pg.selectOption(`${Z} select[data-fiche-champ="${b}"]`, x); await pause(120); await qFil(); }
  for (const [b, x] of Object.entries(choix)) { await pg.check(`${Z} [data-fiche-champ="${b}"][value="${x}"]`); await pause(120); await qFil(); }
  for (const [b, L] of Object.entries(cases)) for (const x of L) { await pg.check(`${Z} [data-fiche-case="${b}"][value="${x}"]`); await pause(120); await qFil(); }
  for (const [b, x] of Object.entries(nb)) { await pg.fill(`${Z} [data-fiche-saisie="${b}"]`, String(x)); await pg.keyboard.press('Tab'); await pause(120); await qFil(); }
  for (const [b, O] of Object.entries(ordre)) {
    for (let k = 0; k < O.length; k++) for (let s = 0; s < 8; s++) {
      const cur = await pg.$$eval(`${Z} [data-fiche-ordre="${b}"] li`, (L) => L.map((x) => x.dataset.v));
      if (cur.indexOf(O[k]) <= k) break;
      await clic(`[data-fiche-ordre="${b}"] li[data-v="${O[k]}"] [data-ordre-sens="-1"]`); await pause(30);
    }
  }
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil();
}
// Le parcours : `pas` = [{ id, sujet, fiche }] dans l'ordre de la séance (le premier s'ouvre par le menu), `compte` = { ligne: rang du choix }
// (0 = la phrase juste, sauf mention contraire).
async function jouer(pas, { compte = {} } = {}) {
  for (let i = 0; i < pas.length; i++) {
    const p = pas[i];
    if (i === 0) await allerV('fiche'); else { await pause(700); await ouvrirParMessage(p.sujet, `fiche:f${S.pre}-${p.id}`); }
    await remplir(p.fiche);
  }
  const L = await pg.evaluate((o) => { const m = window.__f.db.mails.find((x) => x.subject === o); return m ? Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix.slice()])) : null; }, OBJET);
  if (L) {
    const t = Object.fromEntries(Object.entries(L).map(([k, c]) => [k, c[0]]));
    for (const [k, i] of Object.entries(compte)) t[k] = L[k][i];
    await phrases(OBJET, t);
    await qFil();
  }
}
const lignes = (L) => Object.fromEntries(L.map((x, i) => [`ligne-L${i + 1}`, x]));
const adrs = (L) => Object.fromEntries(L.map((x, i) => [`adr-${i + 1}`, x]));
const rels = (L) => Object.fromEntries(L.map((x, i) => [`rel-${i + 1}`, x]));
const PARTS = { 'part-cellule': 'cellule', 'part-allee': 'allee', 'part-colonne': 'colonne', 'part-niveau': 'niveau' };

const P4 = ({ st = ['conforme', 'manquant', 'avarie', 'conforme', 'trop'], manque = '2', abimes = '1', reserve = 'juste' } = {}) => [
  { id: 'lignes', fiche: { liste: lignes(st) } },
  { id: 'quantites', sujet: 'Les quantités', fiche: { nb: { manque, abimes } } },
  { id: 'reserve', sujet: 'La lettre de voiture', fiche: { choix: { decision: 'reserves' }, liste: { reserve } } },
];
const P7 = ({ adr = ['C3-12-04-0', 'C3-12-06-2', 'C3-12-08-4', 'C3-12-05-1'], plaque = 'signaler' } = {}) => [
  { id: 'ranger', fiche: { liste: adrs(adr) } },
  { id: 'gestes', sujet: 'Les gestes', fiche: { ordre: { ordre: ['scan-pal', 'adresse', 'poser', 'scan-adr'] } } },
  { id: 'adresse', sujet: 'Une adresse', fiche: { liste: PARTS } },
  { id: 'plaque', sujet: 'Une palette lourde', fiche: { choix: { plaque } } },
];
const P6 = (J) => [
  { id: 'plani', fiche: { liste: { quai: J.quai }, nb: { palettes: J.palettes } } },
  { id: 'precontrole', sujet: 'Le pré-contrôle', fiche: { choix: { 'sit-1': J.sits[0], 'sit-2': J.sits[1] } } },
  { id: 'lourds', sujet: 'Les colis lourds', fiche: { cases: { lourds: J.lourds } } },
  { id: 'lignes', sujet: 'Le contrôle', fiche: { liste: lignes(J.st) } },
  { id: 'quantites', sujet: 'Les quantités', fiche: { nb: { manque: J.manque, abimes: J.abimes } } },
  { id: 'reserve', sujet: 'La lettre de voiture', fiche: { choix: { decision: 'reserves' }, liste: { reserve: 'juste' } } },
];
const J6 = [
  { uid: 'b', quai: 'Q6', palettes: '21', sits: ['reserve', 'appeler'], lourds: ['onduleur', 'armoire'], st: ['conforme', 'manquant', 'avarie', 'conforme', 'trop'], manque: '3', abimes: '1' },
  { uid: 'a', quai: 'Q7', palettes: '25', sits: ['decharger', 'appeler'], lourds: ['variateur-g', 'onduleur'], st: ['avarie', 'conforme', 'manquant', 'trop', 'conforme'], manque: '1', abimes: '2' },
  { uid: 'h', quai: 'Q5', palettes: '13', sits: ['reserve', 'decharger'], lourds: ['armoire', 'variateur-g'], st: ['trop', 'conforme', 'avarie', 'manquant', 'conforme'], manque: '3', abimes: '1' },
];
const P10 = (J) => [
  { id: 'ranger', fiche: { liste: adrs(J.adr) } },
  { id: 'adresse', sujet: 'Une adresse', fiche: { liste: PARTS } },
  { id: 'plaque', sujet: 'Une palette lourde', fiche: { choix: { plaque: 'signaler' } } },
  { id: 'releve', sujet: 'Le passage du drone', fiche: { choix: rels(J.rel) } },
  { id: 'ecarts', sujet: 'Le recomptage', fiche: { choix: { [`ecart-${J.ecartAdr}`]: J.ecart }, nb: { vrai: J.vrai } } },
];
// `cr` : le rang de la phrase juste de l'écart dans le compte rendu (le drone 0, il manque 1, en trop 2).
const J10 = [
  { uid: 'a', adr: ['C5-02-03-0', 'C5-02-07-4', 'C5-02-05-2', 'C5-02-04-1'], rel: ['ok', 'recompter', 'ok'], ecartAdr: 'C4-07-02-3', ecart: 'manque', vrai: '37', cr: 1 },
  { uid: 'd', adr: ['C1-08-11-0', 'C1-08-12-2', 'C1-08-14-4', 'C1-08-13-1'], rel: ['recompter', 'ok', 'ok'], ecartAdr: 'C6-03-05-2', ecart: 'drone', vrai: '14', cr: 0 },
  { uid: 'b', adr: ['C4-10-22-0', 'C4-10-21-4', 'C4-10-24-1', 'C4-10-23-3'], rel: ['ok', 'ok', 'recompter'], ecartAdr: 'C3-01-04-1', ecart: 'trop', vrai: '15', cr: 2 },
];

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-22.x : les dix séances se chargent (CAP : C1.1, C1.3, C1.4, C1.5, C3.6, C3.7 ; chaque évaluation après un guidage et un entraînement) ; jalons + questions = 20 ; parcours chaîné hors évaluations ; entreprise n° 22 ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/schneider-ent${s.pre}.js`);
      const Q = await import(`/contenus/questions/ENT-22.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.competencesCap, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret,
        A.meta.ouverture, A.meta.precedente, A.meta.parcours, A.meta.reinitialisable], total: C.ETAPES.reduce((t, e) => t + (e.poids || 0), 0), part: Q.QUESTIONS.part || 0,
        ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id), qid: Q.QUESTIONS.id === s.id });
    }
    return { out, e: I.ENTREPRISES.find((x) => x.n === 22) };
  }, SEANCES);
  const cap = (code, comp, temps, prec, o = {}) => [code, ['cap'], [], comp, temps, 20, o.copie, code, true, 'prof', prec, o.copie ? undefined : true, o.reinit];
  egal(r.out.map((x) => x.m), [
    cap('ENT-22.1', ['CAP-C1.1'], 'entrainement', undefined, { reinit: true }),
    cap('ENT-22.2', ['CAP-C1.3'], 'guidage', 'schneider-bienvenue'),
    cap('ENT-22.3', ['CAP-C1.3'], 'entrainement', 'schneider-accueil'),
    cap('ENT-22.4', ['CAP-C1.4'], 'guidage', 'schneider-mardi'),
    cap('ENT-22.5', ['CAP-C1.4'], 'entrainement', 'schneider-controle'),
    cap('ENT-22.6', ['CAP-C1.3', 'CAP-C1.4'], 'evaluation', undefined, { copie: true }),
    cap('ENT-22.7', ['CAP-C1.5'], 'guidage', 'schneider-mehdi'),
    cap('ENT-22.8', ['CAP-C1.5'], 'entrainement', 'schneider-ranger'),
    cap('ENT-22.9', ['CAP-C3.7', 'CAP-C3.6'], 'entrainement', 'schneider-drone'),
    cap('ENT-22.10', ['CAP-C1.5'], 'evaluation', undefined, { copie: true }),
  ], 'meta');
  egal(r.out.map((x) => x.total + x.part + x.ouvPart), Array(10).fill(20), 'jalons + questions');
  egal(r.out.map((x) => x.noter === 'function'), SEANCES.map((s) => s.n === '6' || s.n === '10'), 'noter seulement en évaluation');
  egal(r.out.map((x) => x.reg && x.qid), Array(10).fill(true), 'au registre, questions de la bonne séance');
  egal([r.e.nom, r.e.logo], ['Schneider Electric', './contenus/trames/logos/schneider-electric.svg'], 'entreprise n° 22');
});

await v('ENT-22.x : les données — colis lourds, pré-contrôles, statuts, erreurs de Mehdi, plaque de charge, rangement, drone, cartons recyclés, jeux des évaluations (valeurs à la main)', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/schneider-donnees.js');
    const st = (bl) => bl.lignes.map(M.statut);
    const R = M.R227;
    return {
      aider: M.aAider(Object.keys(M.PRODUITS)),
      pre222: M.SIT222.map(M.precontroleJuste),
      bl224: [st(M.BL224), M.manque(M.BL224.lignes), M.abimes(M.BL224.lignes), M.enTrop(M.BL224.lignes), M.decision(M.BL224.lignes)],
      bl225: [st(M.BL225), M.erreursMehdi(M.BL225, M.MEHDI225)],
      plaque: [0, 1, 2, 3, 4].map((n) => [M.plaqueDe(n).kg, M.plaqueDe(n).h]),
      armoire: M.adressesJustes(R.libres, R.palettes[0]),
      casse: [M.regleCassee(R.libres, R.palettes[0], 'C3-12-08-4'), M.regleCassee(R.libres, R.palettes[0], 'C3-12-09-0'), M.regleCassee(R.libres, R.palettes[1], 'C3-12-04-0', ['C3-12-04-0']),
        M.regleCassee(R.libres, R.palettes[0], 'C3-12-06-2'), M.regleCassee(R.libres, { kg: 100, h: 1.4 }, 'C3-12-08-4')],
      sit227: M.plaqueJuste(M.SIT227.kg, M.SIT227.adr),
      inv228: [M.INV228.map(M.releveJuste), M.INV228.filter((I) => I.drone !== I.systeme).map(M.ecartJuste)],
      recycles: M.recycles(),
      j226: M.TOUS_JEUX226.map((J) => { const c = J.plan.find((x) => x.id === J.mon); return [c.quai, c.palettes, J.sits.map(M.precontroleJuste), M.aAider(J.lourds), st(J.bl),
        M.manque(J.bl.lignes), M.abimes(J.bl.lignes)]; }),
      j2210: M.TOUS_JEUX2210.map((J) => { const I = J.inv.find((x) => x.drone !== x.systeme);
        return [J.palettes.map((p) => M.adressesJustes(J.libres, p).length > 0), M.plaqueJuste(J.plaque.kg, J.plaque.adr), J.inv.map(M.releveJuste), M.ecartJuste(I), I.main]; }),
      graines: [['b', 'a', 'h'].map((g) => M.indiceJeu({ tirage: { graine: g } }, 3, '226')), ['a', 'd', 'b'].map((g) => M.indiceJeu({ tirage: { graine: g } }, 3, '2210'))],
    };
  });
  egal(r.aider, ['variateur-g', 'onduleur', 'armoire'], 'colis de plus de 25 kg');
  egal(r.pre222, PRE222, 'pré-contrôles ENT-22.2');
  egal(r.bl224, [['conforme', 'manquant', 'avarie', 'conforme', 'trop'], 2, 1, 1, 'reserves'], 'ENT-22.4');
  egal(r.bl225, [['conforme', 'manquant', 'avarie', 'trop', 'conforme'], ['L2', 'L4']], 'ENT-22.5');
  egal(r.plaque, [[1000, 1.6], [1000, 1.6], [800, 1.6], [800, 1.6], [500, 1.1]], 'plaque de charge');
  egal(r.armoire, ['C3-12-04-0', 'C3-12-05-1'], 'l’armoire de 920 kg');
  egal(r.casse, ['poids', 'adresse', 'deja', 'poids', 'hauteur'], 'règles cassées');
  egal(r.sit227, 'signaler', '950 kg au niveau 3');
  egal(r.inv228, [['ok', 'recompter', 'ok', 'recompter', 'ok'], ['drone', 'manque']], 'ENT-22.8');
  egal(r.recycles, 2800, 'cartons recyclés');
  egal(r.j226, [
    ['Q6', 21, ['reserve', 'appeler'], ['onduleur', 'armoire'], ['conforme', 'manquant', 'avarie', 'conforme', 'trop'], 3, 1],
    ['Q7', 25, ['decharger', 'appeler'], ['variateur-g', 'onduleur'], ['avarie', 'conforme', 'manquant', 'trop', 'conforme'], 1, 2],
    ['Q5', 13, ['reserve', 'decharger'], ['armoire', 'variateur-g'], ['trop', 'conforme', 'avarie', 'manquant', 'conforme'], 3, 1]], 'ENT-22.6');
  egal(r.j2210, [
    [[true, true, true, true], 'signaler', ['ok', 'recompter', 'ok'], 'manque', 37],
    [[true, true, true, true], 'signaler', ['recompter', 'ok', 'ok'], 'drone', 14],
    [[true, true, true, true], 'signaler', ['ok', 'ok', 'recompter'], 'trop', 15]], 'ENT-22.10');
  egal(r.graines, [[0, 1, 2], [0, 1, 2]], 'les graines du test tirent les trois jeux');
});

await v('ENT-22.x : documents, messages, carte — mentions, phrases toutes différentes, la réserve juste n’est pas toujours la première, les corrigés se chargent, 300 graines tirent les trois jeux, les trois lieux de la carte passent le contrôle de la vue', async () => {
  const r = await pg.evaluate(async (L) => {
    const txt = (h) => { const e = document.createElement('div'); e.innerHTML = h; return e.textContent.replace(/\s+/g, ' '); };
    const doubles = [], sans = [], corr = [];
    for (const s of L) {
      const C = await import(`/contenus/schneider-ent${s.pre}.js`);
      for (const db of [{}, { tirage: { graine: 'a' } }, { tirage: { graine: 'b' } }, { tirage: { graine: 'h' } }, { tirage: { graine: 'd' } }]) {
        const d = C.VOLET.declencheurs.find((x) => x.id === 'compte');
        if (d) for (const l of d.semer('Léa', db).mails[0].phrases.lignes) if (new Set(l.choix).size !== l.choix.length) doubles.push(`${s.n} ${l.id}`);
        for (const D of C.OPTIONS.documents) { const t = txt(typeof D.html === 'function' ? D.html(db) : D.html); if (!/Document pédagogique/.test(t)) sans.push(`${s.n} ${D.id}`); }
      }
      const K = await import(`/contenus/corriges/ENT-22.${s.n}.js`);
      corr.push([K.CORRIGE.code, K.CORRIGE.items.length > 0, K.corrigeEleve({ tirage: { graine: 'b' } }, 'b').items.length > 0]);
    }
    const M = await import('/contenus/schneider-donnees.js');
    const rangs = [M.BL224, M.BL225, ...M.TOUS_JEUX226.map((J) => J.bl)].map((bl) => M.reserves(bl.lignes).findIndex((x) => x.v === 'juste'));
    const v6 = new Set(), v10 = new Set();
    for (let i = 0; i < 300; i++) { const db = { tirage: { graine: `eleve-${i}` } }; v6.add(M.jeu226(db).mon); v10.add(M.jeu2210(db).adr); }
    const { controlerLocaliser } = await import('/core/types/localiser.js');
    const { LOCALISER } = await import('/contenus/schneider.js');
    let carte = null; try { controlerLocaliser(LOCALISER); } catch (e) { carte = e.message; }
    return { doubles, sans, corr, rangs, v6: [...v6].sort(), v10: [...v10].sort(), carte, lieux: LOCALISER.lieux.map((l) => l.id) };
  }, SEANCES);
  egal(r.doubles, [], 'phrases en double');
  egal(r.sans, [], 'documents sans mention');
  egal(r.corr.map((x) => x[0]), SEANCES.map((s) => `ENT-22.${s.n}`), 'corrigés'); vrai(r.corr.every((x) => x[1] && x[2]), 'corrigé vide : ' + JSON.stringify(r.corr));
  vrai(new Set(r.rangs).size > 1, 'la réserve juste est toujours au même rang : ' + JSON.stringify(r.rangs));
  egal(r.v6, ['C1', 'C2', 'C3'], 'ENT-22.6 : 300 graines tirent les trois jeux');
  egal(r.v10, ['C1-08-14-4', 'C4-10-23-3', 'C5-02-06-3'], 'ENT-22.10 : 300 graines tirent les trois jeux');
  egal(r.carte, null, 'contrôle de la carte');
  egal(r.lieux, ['evreux', 'vaudreuil', 'rueil'], 'les trois lieux');
});

// ─────────────────────────────────────────────────────────── ENT-22.4 (guidage C1.4)
await v('ENT-22.4 : inaction → 0/20 ; un message de Nadia ; parcours juste → 20/20 ; aucun message ne juge', async () => {
  await mont(S_['4'], { sansOuverture: true });
  const n0 = await noter(S.act);
  egal([n0.score, n0.max], [0, 20], 'note');
  await mont(S_['4']);
  egal((await entrants()).length, 1, 'un seul message');
  await jouer(P4());
  const n = await noter(S.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail));
  vrai(!(await entrants()).some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct|faux)\b/i.test(m.text)), 'un message juge');
});

await v('ENT-22.4 : sabotages — L2 dite conforme (−1), le carton écrasé oublié (−1,5), « sous réserve de déballage » (−2), compte rendu « il ne manque rien » (−4)', async () => {
  await mont(S_['4']);
  await jouer(P4({ st: ['conforme', 'conforme', 'avarie', 'conforme', 'trop'], abimes: '0', reserve: 'vague' }), { compte: { manque: 2 } });
  egal(ko(await detail()), ['ligne-2', 'abimes', 'reserve', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 11.5, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-22.7 (guidage C1.5)
await v('ENT-22.7 : parcours juste → 20/20 ; sabotages — l’armoire de 920 kg au niveau 4 (−1,5), la palette de 950 kg montée au niveau 3 (−2)', async () => {
  await mont(S_['7']);
  await jouer(P7());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['7']);
  await jouer(P7({ adr: ['C3-12-08-4', 'C3-12-06-2', 'C3-12-07-3', 'C3-12-05-1'], plaque: 'monter' }));
  egal(ko(await detail()), ['adr-1', 'plaque'], 'jalons tombés');
  proche((await noter(S.act)).score, 16.5, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-22.6 et 22.10 (copies rendues)
await v('ENT-22.6 : « Avant de commencer » noté 3 ; inaction → 3/20 ; parcours juste → 20/20 dans chacun des trois jeux', async () => {
  for (const J of J6) {
    await mont(S_['6'], { uid: J.uid });
    let n = await noter(S.act);
    proche(n.score, 3, `jeu ${J.uid} : ouverture seule ` + JSON.stringify(n.detail));
    vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
    await jouer(P6(J));
    n = await noter(S.act);
    proche(n.score, 20, `jeu ${J.uid} : ` + JSON.stringify(n.detail));
  }
});

await v('ENT-22.10 : « Avant de commencer » noté 3 ; inaction → 3/20 ; parcours juste → 20/20 dans chacun des trois jeux', async () => {
  for (const J of J10) {
    await mont(S_['10'], { uid: J.uid });
    let n = await noter(S.act);
    proche(n.score, 3, `jeu ${J.uid} : ouverture seule ` + JSON.stringify(n.detail));
    vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
    await jouer(P10(J), { compte: { ecart: J.cr } });
    n = await noter(S.act);
    proche(n.score, 20, `jeu ${J.uid} : ` + JSON.stringify(n.detail));
  }
});

await v('ENT-22.10 : jeu « a » — sabotages : le nombre du système recopié (−1), « le drone s’est trompé » (−1), compte rendu « le drone s’est trompé » (−4)', async () => {
  const J = J10[0];
  await mont(S_['10'], { uid: J.uid });
  await jouer(P10({ ...J, ecart: 'drone', vrai: '40' }), { compte: { ecart: 0 } });
  egal(ko(await detail()), ['ecart-1', 'vrai', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 14, 'note');
});

}
