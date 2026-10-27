// Suite de tests de Prepalog — bloc « royal-canin » : Royal Canin ENT-16.1 à 16.5, piloter l'entrepôt de produits finis (Tle, C1.6, C2.2 et C3.1).
// `node outils/test.mjs royal-canin` ne lance que ce bloc. Cadrage : `docs/briefs/royal-canin/CADRAGE-royal-canin-tle.md`. Aides : `outils/test/ikea/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (relues sur les fiches méthode le 26/10/2026 ; le code les calcule, le test les écrit) :
// ENT-16.1 : CH-ADU-15 stock moyen 500, rotation 2 000 ÷ 500 = 4, couverture 500 ÷ 100 = 5 j ; CT-STE-04 800, 4 000 ÷ 800 = 5, 1 200 ÷ 200 = 6 j ;
//   rupture CT-INT-02 (2 j / 3) et CH-MIN-08 (3 j / 4) ; surstock CH-CHI-03 (18 j) et VET-REN-02 (25 j) ; service 1 150 ÷ 1 250 = 92 %.
// ENT-16.2 : CH-ADU-15 rotation 3, couverture 8 j ; CT-KIT-04 rotation 3,5, couverture 7 j ; rupture CH-CHI-03 (5 j / 6) et CH-MIN-08 (2 j / 4) ;
//   CT-INT-02 (4 j / 3) n'en est pas une ; surstock CT-STE-04 (16 j) et VET-DIG-10 (20 j) ; service 1 512 ÷ 1 600 = 94,5 %.
// ENT-16.3 : CH-ADU-15 sol, CT-INT-02 canal, VET-REN-02 réserve, CH-MIN-08 sol (8 kg pile), CT-KIT-04 canal, VET-DIG-10 réserve (10 kg mais 4 colis) ;
//   réappros 120 ÷ 24 = 5, 60 ÷ 24 = 2,5 → 3.
// ENT-16.4 : limite 01/03/2027 + 9 mois = 01/12/2027 ; Mehdi (FIFO) a pris L7124 et L7203 (20/11/2027 : trop court de 11 jours) ; FEFO conforme :
//   L7298 1 palette + L7312 3 palettes.
// ENT-16.5 : CT-STE-04 rotation 4, couverture 6 j ; rupture CT-INT-02 ; surstock CH-CHI-03 et CH-MIN-08 ; service 95 % ; VET-REN-02 réserve,
//   CT-STE-04 canal ; limite 01/12/2027 : L8011 écarté, L8056 2 + L8102 1.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const S1 = { id: 'royal-canin-indicateurs', act: '/activites/royal-canin-indicateurs.js', n: '1' };
const S2 = { id: 'royal-canin-indicateurs-novembre', act: '/activites/royal-canin-indicateurs-novembre.js', n: '2' };
const S3 = { id: 'royal-canin-picking', act: '/activites/royal-canin-picking.js', n: '3' };
const S4 = { id: 'royal-canin-export', act: '/activites/royal-canin-export.js', n: '4' };
const S5 = { id: 'royal-canin-evaluation', act: '/activites/royal-canin-evaluation.js', n: '5' };
const OBJET = 'Ton compte rendu';

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S1.act, id: S1.id });
const { pg, Z, pause, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter } = P;

const OUV = { rotation: 'six', couverture: 'rupture', fefo: 'perime', lourd: 'sol', ddm: 'qualite', conforme: 'refuser' };
const R = {
  'rotation-moitie': 'double', 'couverture-delai': 'avancer', 'cout-surstock': 'immobilise', gaspillage: 'donner',
  'pas-rupture': 'non', lent: 'specialise', usine: 'avancer', camions: 'camions',
  'lourd-reserve': 'peu', arrondi: 'manque', dos: 'dos', employeur: 'employeur',
  'a-quelques-jours': 'limite', 'fifo-fefo': 'date', 'ou-vont': 'france', 'retour-export': 'vendeur',
  priorite: 'rupture',
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
const mont = (s, o = {}) => { S = s; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'rc-' + s.id, ...o }); };
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
const F1 = { cases: { rupture: ['CT-INT-02', 'CH-MIN-08'], surstock: ['CH-CHI-03', 'VET-REN-02'] },
  nb: { 'rot-CH-ADU-15': 4, 'couv-CH-ADU-15': 5, 'rot-CT-STE-04': 5, 'couv-CT-STE-04': 6, service: 92 } };
const F2 = { cases: { rupture: ['CH-CHI-03', 'CH-MIN-08'], surstock: ['CT-STE-04', 'VET-DIG-10'] },
  nb: { 'rot-CH-ADU-15': 3, 'couv-CH-ADU-15': 8, 'rot-CT-KIT-04': '3,5', 'couv-CT-KIT-04': 7, service: '94,5' } };
const F3 = { liste: { 'zone-CH-ADU-15': 'sol', 'zone-CT-INT-02': 'canal', 'zone-VET-REN-02': 'reserve', 'zone-CH-MIN-08': 'sol', 'zone-CT-KIT-04': 'canal', 'zone-VET-DIG-10': 'reserve' },
  nb: { 'reappro-CT-INT-02': 5, 'reappro-CT-KIT-04': 3 } };
const F4 = { cases: { nonconformes: ['L7124', 'L7203'] }, choix: { cause: 'fifo' }, nb: { 'q-L7124': 0, 'q-L7203': 0, 'q-L7298': 1, 'q-L7312': 3, 'q-L7335': 0 } };
const F5 = { cases: { rupture: ['CT-INT-02'], surstock: ['CH-CHI-03', 'CH-MIN-08'] }, liste: { 'zone-VET-REN-02': 'reserve', 'zone-CT-STE-04': 'canal' },
  nb: { 'rot-CT-STE-04': 4, 'couv-CT-STE-04': 6, service: 95, 'q-L8011': 0, 'q-L8056': 2, 'q-L8102': 1, 'q-L8140': 0 } };

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-16.x : les cinq séances se chargent (Tle : guidage, entraînement, guidage, erreur induite, évaluation) ; jalons + questions = 20 ; entreprise n° 16 ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/royal-canin-ent16${s.n}.js`);
      const Q = await import(`/contenus/questions/ENT-16.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret, A.meta.ouverture, A.meta.reinitialisable],
        total: C.ETAPES.reduce((t, e) => t + e.poids, 0), part: Q.QUESTIONS.part || 0, ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id) });
    }
    return { out, e: I.ENTREPRISES.find((x) => x.n === 16) };
  }, [S1, S2, S3, S4, S5]);
  egal(r.out.map((x) => x.m), [
    ['ENT-16.1', ['tle'], ['C1.6'], 'guidage', 20, undefined, 'ENT-16.1', true, 'prof', true],
    ['ENT-16.2', ['tle'], ['C1.6'], 'entrainement', 20, undefined, 'ENT-16.2', true, 'prof', undefined],
    ['ENT-16.3', ['tle'], ['C2.2', 'C3.1'], 'guidage', 20, undefined, 'ENT-16.3', true, 'prof', undefined],
    ['ENT-16.4', ['tle'], ['C3.1'], 'erreur', 20, undefined, 'ENT-16.4', true, 'prof', undefined],
    ['ENT-16.5', ['tle'], ['C1.6', 'C2.2', 'C3.1'], 'evaluation', 20, true, 'ENT-16.5', true, 'prof', undefined],
  ], 'meta');
  egal(r.out.map((x) => x.total + x.part + x.ouvPart), [20, 20, 20, 20, 20], 'jalons + questions');
  egal(r.out.map((x) => x.noter), ['undefined', 'undefined', 'undefined', 'undefined', 'function'], 'noter seulement en évaluation');
  egal(r.out.map((x) => x.reg), [true, true, true, true, true], 'au registre');
  egal([r.e.nom, r.e.logo], ['Royal Canin', './contenus/trames/logos/royal-canin.svg'], 'entreprise n° 16');
});

await v('ENT-16.x : les données — rotation, couverture, ruptures, surstocks, service ; l’implantation et ses réappros ; la limite de DDM, le FIFO de Mehdi et le FEFO (valeurs écrites à la main)', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/royal-canin-donnees.js');
    const ind = (D) => { const I = M.indicateurs(D); return [D.calcul.map((x) => [I.par[x].rotation, I.par[x].couverture]), I.rupture, I.surstock, I.service]; };
    const X4 = M.preparationExport(M.D164.export), X5 = M.preparationExport(M.D165.export);
    return { i1: ind(M.D161), i2: ind(M.D162), i5: ind(M.D165), m3: M.implantation(M.D163), m5: M.implantation(M.D165).zones,
      x4: [X4.limite, X4.fifo, X4.fifoNonConformes, X4.prises], x5: [X5.limite, X5.nonConformes, X5.prises],
      z: [M.zoneDe('CH-ADU-15', 4), M.zoneDe('CH-MIN-08', 5), M.zoneDe('CT-INT-02', 5)] };
  });
  egal(r.i1, [[[4, 5], [5, 6]], ['CT-INT-02', 'CH-MIN-08'], ['CH-CHI-03', 'VET-REN-02'], 92], 'ENT-16.1');
  egal(r.i2, [[[3, 8], [3.5, 7]], ['CH-CHI-03', 'CH-MIN-08'], ['CT-STE-04', 'VET-DIG-10'], 94.5], 'ENT-16.2');
  egal(r.i5, [[[4, 6]], ['CT-INT-02'], ['CH-CHI-03', 'CH-MIN-08'], 95], 'ENT-16.5');
  egal(r.z, ['reserve', 'sol', 'canal'], 'la règle d’implantation (demande d’abord, puis 8 kg ou plus)');
  egal(r.m3, { zones: { 'CH-ADU-15': 'sol', 'CT-INT-02': 'canal', 'VET-REN-02': 'reserve', 'CH-MIN-08': 'sol', 'CT-KIT-04': 'canal', 'VET-DIG-10': 'reserve' },
    reappros: { 'CT-INT-02': 5, 'CT-KIT-04': 3 } }, 'ENT-16.3');
  egal(r.m5, { 'VET-REN-02': 'reserve', 'CT-STE-04': 'canal' }, 'ENT-16.5 zones');
  egal(r.x4, ['2027-12-01', [['L7124', 2], ['L7203', 2]], ['L7124', 'L7203'], [['L7298', 1], ['L7312', 3]]], 'ENT-16.4');
  egal(r.x5, ['2027-12-01', ['L8011'], [['L8056', 2], ['L8102', 1]]], 'ENT-16.5 export');
});

await v('ENT-16.x : les documents — le tableau ne donne pas les indicateurs ; la préparation de Mehdi ne dit pas qu’elle est fausse ; le droit distingue DDM et DLC ; chaque document reconstitué porte sa mention', async () => {
  const r = await pg.evaluate(async () => {
    const h = (S, id) => { const d = S.DOCUMENTS.find((x) => x.id === id); const e = document.createElement('div'); e.innerHTML = d.html; return e.textContent.replace(/\s+/g, ' '); };
    const C = {};
    for (const n of ['1', '3', '4', '5']) C[n] = await import(`/contenus/royal-canin-ent16${n}.js`);
    return { ids: ['1', '3', '4', '5'].map((n) => C[n].DOCUMENTS.map((d) => d.id)), tab: h(C['1'], 'tableau'), prep: h(C['4'], 'prep-mehdi'), droit: h(C['1'], 'droit'),
      poste: h(C['1'], 'poste'), lots: h(C['4'], 'lots'), cmd: h(C['4'], 'commande-export'), flux: h(C['3'], 'flux') };
  });
  egal(r.ids, [['poste', 'tableau', 'methode-ind', 'droit'], ['poste', 'flux', 'methode-picking', 'droit'],
    ['poste', 'commande-export', 'lots', 'prep-mehdi', 'methode-export', 'droit'],
    ['poste', 'tableau', 'methode-ind', 'flux', 'methode-picking', 'commande-export', 'lots', 'methode-export', 'droit']], 'documents');
  vrai(!/[Rr]otation|[Cc]ouverture|surstock|rupture/.test(r.tab), 'le tableau donne un indicateur : ' + r.tab);
  vrai(/L7124/.test(r.prep) && !/non conforme|trop court|erreur/i.test(r.prep), 'la préparation de Mehdi : ' + r.prep);
  vrai(/DDM/.test(r.droit) && /DLC/.test(r.droit) && /conforme/.test(r.droit), 'le droit');
  for (const k of ['tab', 'prep', 'lots', 'cmd', 'flux']) vrai(/CONSTRUIT/.test(r[k]) && /reconstitution/.test(r[k]), `mention sur ${k}`);
  vrai(/Aimargues/.test(r.poste) && /349 454 tonnes/.test(r.poste), 'les faits réels dans « Ton poste »');
});

await v('ENT-16.x : le compte rendu — dans chaque séance, les trois phrases d’une ligne sont différentes (sinon la juste se confond avec une fausse)', async () => {
  const r = await pg.evaluate(async () => {
    const out = [];
    for (const n of ['1', '2', '3', '4', '5']) {
      const C = await import(`/contenus/royal-canin-ent16${n}.js`);
      const m = C.VOLET.declencheurs.find((d) => d.id === 'compte').semer('Léa').mails[0];
      for (const l of m.phrases.lignes) if (new Set(l.choix).size !== l.choix.length) out.push(`16.${n} ${l.id} : ${l.choix.join(' | ')}`);
    }
    return out;
  });
  egal(r, [], 'phrases en double');
});

// ─────────────────────────────────────────────────────────── ENT-16.1
await v('ENT-16.1 : inaction → 0/20 ; un message de Sandrine avec les pièces ; parcours juste → 20/20 et le message de fin ; aucun message ne juge', async () => {
  await mont(S1, { sansOuverture: true });
  const n0 = await noter(S1.act);
  egal([n0.score, n0.max], [0, 20], 'note');
  vrai(!Object.values(n0.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n0.detail));
  await mont(S1);
  egal((await entrants()).map((m) => [m.from, m.pieces]), [['Sandrine, responsable de l’entrepôt', ['poste', 'tableau', 'methode-ind']]], 'messages');
  await jouer(F1);
  const n = await noter(S1.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail)); egal(n.max, 20, 'sur');
  const E = await entrants();
  egal(E.map((m) => m.subject), ['Les indicateurs d’octobre', OBJET, 'Merci'], 'messages');
  vrai(!E.some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct)\b/i.test(m.text)), 'un message juge');
});

await v('ENT-16.1 : sabotages — couverture prise sur le stock moyen (−1,5) ; un surstock oublié (−3) ; compte rendu qui inverse ruptures et surstocks (−2) ; questions toutes fausses (−4)', async () => {
  const essai = async (F, compte, tombes, score, quoi) => {
    await mont(S1);
    await jouer(F, compte);
    egal(ko(await detail()), tombes, `${quoi} : jalons tombés`);
    proche((await noter(S1.act)).score, score, `${quoi} : note`);
  };
  await essai({ ...F1, nb: { ...F1.nb, 'couv-CT-STE-04': 4 } }, {}, ['couv-CT-STE-04'], 18.5, 'couverture sur le stock moyen');
  await essai({ ...F1, cases: { ...F1.cases, surstock: ['CH-CHI-03'] } }, {}, ['surstock'], 17, 'un surstock oublié');
  await essai(F1, { rupture: 1 }, ['compte-rendu'], 18, 'compte rendu');
  const sauve = { ...R };
  Object.assign(R, { 'rotation-moitie': 'mieux', 'couverture-delai': 'attendre', 'cout-surstock': 'rien', gaspillage: 'jeter' });
  try { await mont(S1); await jouer(F1); } finally { Object.assign(R, sauve); }
  proche((await noter(S1.act)).score, 16, 'trois fausses (la réflexion ne compte pas)');
});

// ─────────────────────────────────────────────────────────── ENT-16.2
await v('ENT-16.2 : parcours juste → 20/20 ; CT-INT-02 (4 j pour 3 j) cochée en rupture (−2,5) ; taux de service inversé 5,5 % (−2)', async () => {
  await mont(S2);
  await jouer(F2);
  proche((await noter(S2.act)).score, 20, 'parcours juste');
  await mont(S2);
  await jouer({ ...F2, cases: { ...F2.cases, rupture: ['CT-INT-02', 'CH-CHI-03', 'CH-MIN-08'] }, nb: { ...F2.nb, service: '5,5' } });
  egal(ko(await detail()), ['rupture', 'service'], 'rupture et service'); proche((await noter(S2.act)).score, 15.5, 'rupture et service');
});

// ─────────────────────────────────────────────────────────── ENT-16.3
await v('ENT-16.3 : parcours juste → 20/20 ; VET-DIG-10 au sol (−1,5) ; réappros arrondis au-dessous (2) (−2)', async () => {
  await mont(S3);
  await jouer(F3);
  proche((await noter(S3.act)).score, 20, 'parcours juste');
  await mont(S3);
  await jouer({ ...F3, liste: { ...F3.liste, 'zone-VET-DIG-10': 'sol' }, nb: { ...F3.nb, 'reappro-CT-KIT-04': 2 } });
  egal(ko(await detail()), ['zone-VET-DIG-10', 'reappro-CT-KIT-04'], 'VET-DIG-10 et arrondi'); proche((await noter(S3.act)).score, 16.5, 'VET-DIG-10 et arrondi');
});

// ─────────────────────────────────────────────────────────── ENT-16.4
await v('ENT-16.4 : parcours juste → 20/20 ; seul L7124 trouvé (−4) ; la préparation de Mehdi recopiée (lots −4, quantités −2) et compte rendu « conforme » (−4)', async () => {
  await mont(S4);
  await jouer(F4);
  proche((await noter(S4.act)).score, 20, 'parcours juste');
  await mont(S4);
  await jouer({ ...F4, cases: { nonconformes: ['L7124'] } });
  egal(ko(await detail()), ['nonconformes'], 'seul L7124'); proche((await noter(S4.act)).score, 16, 'seul L7124');
  await mont(S4);
  await jouer({ ...F4, nb: { 'q-L7124': 2, 'q-L7203': 2, 'q-L7298': 0, 'q-L7312': 0, 'q-L7335': 0 } }, { erreur: 1, export: 1 });
  egal(ko(await detail()), ['lots', 'quantites', 'compte-rendu'], 'FIFO recopié'); proche((await noter(S4.act)).score, 10, 'FIFO recopié');
});

// ─────────────────────────────────────────────────────────── ENT-16.5 (copie rendue)
await v('ENT-16.5 : « Avant de commencer » noté (3 points) ; inaction → 3/20 et aucun jalon juste ; parcours juste → 20/20 ; lot L8011 pris en FIFO et CT-STE-04 au sol → 12,5 (−1,5 −2 −2 −2)', async () => {
  await mont(S5);
  let n = await noter(S5.act);
  proche(n.score, 3, 'ouverture seule : ' + JSON.stringify(n.detail));
  vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
  await jouer(F5);
  n = await noter(S5.act);
  proche(n.score, 20, 'parcours juste : ' + JSON.stringify(n.detail));
  await mont(S5);
  await jouer({ ...F5, liste: { ...F5.liste, 'zone-CT-STE-04': 'sol' }, nb: { ...F5.nb, 'q-L8011': 1, 'q-L8056': 2, 'q-L8102': 0 } }, { export: 1 });
  egal(ko(await detail()), ['zone-CT-STE-04', 'lots', 'quantites', 'compte-rendu'], 'FIFO et sol');
  proche((await noter(S5.act)).score, 12.5, 'FIFO et sol');
});

}
