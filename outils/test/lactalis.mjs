// Suite de tests de Prepalog — bloc « lactalis » : Lactalis ENT-14.1 à 14.4, le rappel des laits infantiles (1re, C3.2 traçabilité).
// `node outils/test.mjs lactalis` ne lance que ce bloc. Cadrage : `docs/briefs/lactalis/CADRAGE-lactalis-1re.md`. Aides : `outils/test/ikea/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (relues sur les registres le 26/10/2026 ; le code les calcule, le test les écrit) :
// ENT-14.1 : lots de l'avis passés chez nous CR-170718-A (144 reçues, 72 Laval + 48 Mayenne, reste 24), CR-170905-A (120, 60 Château-Gontier + 60 Laval,
//   reste 0), CR-171003-A (48, 12 Ernée, reste 36) → parties 252, restant 60 ; magasins Laval, Château-Gontier, Mayenne, Ernée. Piège : CR-171012-B (PIC1,
//   96 en stock) n'est pas dans l'avis.
// ENT-14.2 (fabriqué depuis le 15/02/2017) : visés CR-170622-B (parti en entier), CR-170811-A (36), CR-170302-B (24), CR-171109-A (96), CR-171115-C (96)
//   → parties 204, restant 252 ; magasins Laval, Château-Gontier, Mayenne, Évron, Craon. Pas visés : CR-170131-A, CR-170214-C (la veille), CR-170207-A.
// ENT-14.3 : lot oublié CR-170215-B (PIC2, 96 reçues, 24 Laval + 24 Ernée le 26/12, reste 48) ; pas prévenus Laval et Ernée ; après l'avis : Ernée.
// ENT-14.4 : visés CR-170615-A (parti en entier, Évron), CR-170215-C (48), CR-170920-B (48), CR-171102-C (96), CR-171108-A (72) → parties 240,
//   restant 264 ; magasins Château-Gontier, Mayenne, Évron, Ernée ; après l'avis : Château-Gontier. Pas visés : CR-170128-B, CR-170214-A, CR-170112-A.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const S1 = { id: 'lactalis-douze-lots', act: '/activites/lactalis-douze-lots.js', fiche: 'releve-141', objet: 'Avis du 02/12/2017 : votre compte rendu' };
const S2 = { id: 'lactalis-regle-15-fevrier', act: '/activites/lactalis-regle-15-fevrier.js', fiche: 'releve-142', objet: 'Avis du 21/12/2017 : votre compte rendu' };
const S3 = { id: 'lactalis-lot-oublie', act: '/activites/lactalis-lot-oublie.js', fiche: 'releve-143', objet: 'Avis du 21/12/2017 : votre correction' };
const S4 = { id: 'lactalis-evaluation', act: '/activites/lactalis-evaluation.js', fiche: 'releve-144', objet: 'Avis du 21/12/2017 : votre compte rendu' };

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S1.act, id: S1.id });
const { pg, Z, pause, base, present, texte, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter } = P;

const OUV = { tracabilite: 'suivre', aval: 'exp', lot: 'groupe', 'date-lot': 'juste', retrait: 'retrait', distributeur: 'oui' };
const R = {
  'ou-chercher': 'rec', 'parti-en-entier': 'prevenir', 'par-lot': 'lot', attendre: 'non',
  'la-veille': 'non', 'pourquoi-regle': 'tout', lundi: 'maintenant',
  'le-15': 'oui', 'apres-avis': 'vendu', 'double-controle': 'double', 'dire-erreur': 'oui',
  'en-premier': 'matin',
};
// Le 14.2 a sa propre question « parti-en-entier » (même id, autre bonne réponse) : la table est choisie par séance.
const R2 = { ...R, 'parti-en-entier': 'magasins' };
let RR = R;
const qFil = async () => {
  for (let i = 0; i < 8; i++) {
    await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 600 }).catch(() => null);
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(RR[q], `question au fil « ${q} » sans réponse prévue`);
    await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80);
    if (await pg.$(`${Z} [data-q-repondre="${q}"]`)) { await clic(`[data-q-choix="${RR[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); }
    if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); }
  }
};
let S = S1;
const mont = (s, o = {}) => { S = s; RR = s === S2 ? R2 : R; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'lx-' + s.id, ...o }); };
const detail = async () => (await noter(S.act)).detail;

// La fiche : `cases` = { bloc: [valeurs] }, `nb` = { bloc: texte }, `choix` = { bloc: valeur } (boutons radio).
async function fiche({ cases = {}, nb = {}, choix = {} }) {
  await allerV('fiche');
  for (const [b, L] of Object.entries(cases)) for (const x of L) { await pg.check(`${Z} [data-fiche-case="${b}"][value="${x}"]`); await pause(200); await qFil(); }
  for (const [b, x] of Object.entries(choix)) { await pg.check(`${Z} [data-fiche-champ="${b}"][value="${x}"]`); await pause(200); await qFil(); }
  for (const [b, x] of Object.entries(nb)) { await pg.fill(`${Z} [data-fiche-saisie="${b}"]`, String(x)); await pause(20); }
  await pg.keyboard.press('Tab'); await pause(300); await qFil();
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil();
}
// Un blocage à l'écran « Blocage qualité » ; rend le message affiché (refus ou succès).
async function bloquer(lot, ref, q, motif = 'Avis de rappel') {
  await allerV('blocage');
  await pg.fill(`${Z} #blLot`, lot);
  await pg.fill(`${Z} #blRef`, ref);
  await pg.fill(`${Z} #blQte`, String(q));
  await pg.fill(`${Z} #blMotif`, motif);
  await sansToast(); await clic('#formBloc button[type="submit"]');
  await pause(150);
  return pg.$eval(`${Z} .avis-err, ${Z} .avis-ok`, (e) => e.textContent.trim()).catch(() => '');
}
const choixDe = () => pg.evaluate((o) => { const m = window.__f.db.mails.find((x) => x.subject === o); return m ? Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix.slice()])) : null; }, S.objet);
async function rendreCompte(surcharge = {}) {
  const L = await choixDe();
  vrai(L, `le message du service qualité « ${S.objet} » n’est pas arrivé`);
  const t = Object.fromEntries(Object.entries(L).map(([k, c]) => [k, c[0]]));
  for (const [k, i] of Object.entries(surcharge)) t[k] = L[k][i];
  await phrases(S.objet, t);
  await qFil();
}
const resteDuLot = (lot) => pg.evaluate((lot) => window.__f.db.moves.reduce((t, m) => t + (m.lot === lot ? m.delta : 0), 0), lot);

const FICHE1 = { cases: { lots: ['CR-170718-A', 'CR-170905-A', 'CR-171003-A'], magasins: ['laval', 'chateau-gontier', 'mayenne', 'ernee'] }, nb: { partis: 252, restant: 60 } };
const BLOC1 = [['CR-170718-A', 'PIC1-800', 24], ['CR-171003-A', 'PICAR-800', 36]];
const FICHE2 = { cases: { lots: ['CR-170622-B', 'CR-170811-A', 'CR-170302-B', 'CR-171109-A', 'CR-171115-C'], magasins: ['laval', 'chateau-gontier', 'mayenne', 'evron', 'craon'] },
  nb: { partis: 204, restant: 252 } };
const BLOC2 = [['CR-170811-A', 'MILC-900', 36], ['CR-170302-B', 'PICAR-800', 24], ['CR-171109-A', 'PIC1-800', 96], ['CR-171115-C', 'MIL1-900', 96]];
const FICHE3 = { cases: { oublies: ['CR-170215-B'], magasins: ['laval', 'ernee'], apres: ['ernee'] }, choix: { pourquoi: 'borne' }, nb: { reste: 48 } };
const BLOC3 = [['CR-170215-B', 'PIC2-800', 48]];
const FICHE4 = { cases: { lots: ['CR-170615-A', 'CR-170215-C', 'CR-170920-B', 'CR-171102-C', 'CR-171108-A'], magasins: ['chateau-gontier', 'mayenne', 'evron', 'ernee'],
  apres: ['chateau-gontier'] }, nb: { partis: 240, restant: 264 } };
const BLOC4 = [['CR-170215-C', 'MIL1-900', 48], ['CR-170920-B', 'MIL2-900', 48], ['CR-171102-C', 'PIC1-800', 96], ['CR-171108-A', 'MILC-900', 72]];
async function jouer(F, B, o = {}) {
  await fiche(F);
  for (const [lot, ref, q] of B) vrai(/bloquée/.test(await bloquer(lot, ref, q)), `blocage ${lot}`);
  if (!o.sansCompte) await rendreCompte(o.compte);
}

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-14.x : les quatre séances se chargent (1re, C3.2 : guidage, entraînement, erreur induite, évaluation) ; jalons + questions = 20 ; entreprise n° 14 ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/lactalis-ent14${s.n}.js`);
      const Q = await import(`/contenus/questions/ENT-14.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret, A.meta.ouverture],
        total: C.ETAPES.reduce((t, e) => t + e.poids, 0), part: Q.QUESTIONS.part || 0, ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id) });
    }
    return { out, e: I.ENTREPRISES.find((x) => x.n === 14) };
  }, [{ ...S1, n: 1 }, { ...S2, n: 2 }, { ...S3, n: 3 }, { ...S4, n: 4 }]);
  egal(r.out.map((x) => x.m), [
    ['ENT-14.1', ['1re'], ['C3.2'], 'guidage', 20, undefined, 'ENT-14.1', true, 'prof'],
    ['ENT-14.2', ['1re'], ['C3.2'], 'entrainement', 20, undefined, 'ENT-14.2', true, 'prof'],
    ['ENT-14.3', ['1re'], ['C3.2'], 'erreur', 20, undefined, 'ENT-14.3', true, 'prof'],
    ['ENT-14.4', ['1re'], ['C3.2'], 'evaluation', 20, true, 'ENT-14.4', true, 'prof'],
  ], 'meta');
  egal(r.out.map((x) => x.total + x.part + x.ouvPart), [20, 20, 20, 20], 'jalons + questions');
  egal(r.out.map((x) => x.noter), ['undefined', 'undefined', 'undefined', 'function'], 'noter seulement en évaluation');
  egal(r.out.map((x) => x.reg), [true, true, true, true], 'au registre');
  egal([r.e.nom, r.e.logo], ['Rappel Lactalis', './contenus/trames/logos/lactalis-texte.svg'], 'entreprise n° 14');
});

await v('ENT-14.x : les données — lots visés, boîtes parties et restantes, magasins (valeurs écrites à la main) ; la date d’un lot se lit année-mois-jour ; le 15 février est compris', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/lactalis-donnees.js');
    const b = (D) => { const B = M.bilan(D); return [B.vises, B.partis, B.restant, B.magasins, B.apres, B.aBloquer.map((x) => [x.lot, x.reste])]; };
    const T = M.travailDeTheo(M.D143);
    return { d1: b(M.D141), d2: b(M.D142), d4: b(M.D144), t: [T.oublie, T.resteOublie, T.magasinsOublies, T.lots, T.magasins],
      dates: [M.dateDuLot('CR-170412-A'), M.viseParLaRegle('CR-170215-B'), M.viseParLaRegle('CR-170214-C'), M.viseParLaRegle('XX-170301-A')] };
  });
  egal(r.d1, [['CR-170718-A', 'CR-170905-A', 'CR-171003-A'], 252, 60, ['laval', 'chateau-gontier', 'mayenne', 'ernee'], [], [['CR-170718-A', 24], ['CR-171003-A', 36]]], 'ENT-14.1');
  egal(r.d2, [['CR-170622-B', 'CR-170811-A', 'CR-170302-B', 'CR-171109-A', 'CR-171115-C'], 204, 252, ['laval', 'chateau-gontier', 'mayenne', 'evron', 'craon'], [],
    [['CR-170811-A', 36], ['CR-170302-B', 24], ['CR-171109-A', 96], ['CR-171115-C', 96]]], 'ENT-14.2');
  egal(r.d4, [['CR-170615-A', 'CR-170215-C', 'CR-170920-B', 'CR-171102-C', 'CR-171108-A'], 240, 264, ['chateau-gontier', 'mayenne', 'evron', 'ernee'], ['chateau-gontier'],
    [['CR-170215-C', 48], ['CR-170920-B', 48], ['CR-171102-C', 96], ['CR-171108-A', 72]]], 'ENT-14.4');
  egal(r.t, ['CR-170215-B', 48, ['laval', 'ernee'], ['CR-170704-C', 'CR-170823-A', 'CR-171002-B'], ['mayenne', 'meslay']], 'ENT-14.3 (Théo)');
  egal(r.dates, ['2017-04-12', true, false, false], 'lecture du lot');
});

await v('ENT-14.x : les documents — l’avis du 2/12 liste 12 lots sans dire lesquels sont chez nous ; le droit cite l’article 19 ; chaque document reconstitué porte sa mention ; aucun ne donne un total', async () => {
  await mont(S1);
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/lactalis-ent141.js');
    const h = (id) => { const d = S.DOCUMENTS.find((x) => x.id === id); const e = document.createElement('div'); e.innerHTML = d.html; return e.textContent.replace(/\s+/g, ' '); };
    return { ids: S.DOCUMENTS.map((d) => d.id), avis: h('avis'), droit: h('droit'), rec: h('receptions'), exp: h('expeditions'), poste: h('poste') };
  });
  egal(r.ids, ['poste', 'avis', 'lire-lot', 'receptions', 'expeditions', 'droit'], 'documents');
  egal((r.avis.match(/CR-\d{6}-[A-C]/g) || []).length, 12, 'douze lots dans l’avis');
  vrai(r.droit.includes('engage immédiatement les procédures de retrait du marché') && r.droit.includes('distribuée'), 'article 19 : ' + r.droit.slice(0, 300));
  for (const k of ['avis', 'rec', 'exp']) vrai(/CONSTRUIT/.test(r[k]) && /reconstitution|Reconstitution/.test(r[k]), `mention sur ${k}`);
  vrai(!/\b252\b|\b60 boîtes\b|total/i.test(r.rec + r.exp + r.avis), 'un document donne un total');
  vrai(/21 décembre/.test(r.poste) && /Craon/.test(r.poste), 'les faits réels dans « Ton poste »');
});

// ─────────────────────────────────────────────────────────── ENT-14.1
await v('ENT-14.1 : à l’ouverture — un message de Julien avec les pièces ; le stock est posé par lot (CR-171012-B : 96) ; inaction → 0/20, aucun jalon juste', async () => {
  await mont(S1, { sansOuverture: true });
  const n = await noter(S1.act);
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  await mont(S1);
  const E = await entrants();
  egal(E.map((m) => [m.from, m.pieces]), [['Julien, responsable de la plateforme', ['poste', 'avis', 'receptions', 'expeditions', 'lire-lot']]], 'messages');
  egal([await resteDuLot('CR-171012-B'), await resteDuLot('CR-170718-A'), await resteDuLot('CR-170905-A')], [96, 24, 0], 'stock par lot');
});

await v('ENT-14.1 : parcours juste — fiche, deux blocages, compte rendu → 20/20 ; ce qui RESTE : CR-171012-B toujours 96 en stock ; le message de fin arrive ; aucun message ne juge', async () => {
  await mont(S1);
  await jouer(FICHE1, BLOC1);
  const n = await noter(S1.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail)); egal(n.max, 20, 'sur');
  egal([await resteDuLot('CR-171012-B'), await resteDuLot('CR-170718-A'), await resteDuLot('CR-171003-A')], [96, 0, 0], 'reste par lot');
  const E = await entrants();
  egal(E.map((m) => m.from), ['Julien, responsable de la plateforme', 'Service qualité de l’enseigne', 'Julien, responsable de la plateforme'], 'messages');
  vrai(!E.some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct)\b/i.test(m.text)), 'un message juge');
});

await v('ENT-14.1 : l’écran de blocage refuse plus que ce qui reste du lot sans dire combien il en reste, et un lot vide (parti en entier)', async () => {
  await mont(S1);
  const m1 = await bloquer('CR-170718-A', 'PIC1-800', 25);
  vrai(/ne contient pas autant/.test(m1) && !/24/.test(m1), 'refus : ' + m1);
  const m2 = await bloquer('CR-170905-A', 'PIC2-800', 1);
  vrai(/aucune boîte/.test(m2), 'lot vide : ' + m2);
  egal(await resteDuLot('CR-170718-A'), 24, 'rien n’a bougé');
});

await v('ENT-14.1 : sabotages — un lot non visé bloqué (« rien de trop » −1) ; un blocage oublié (−2) ; Ernée oublié (−3) ; parties et restant inversés (−3) ; compte rendu faux (−2)', async () => {
  const essai = async (o, tombes, score, quoi) => {
    await mont(S1);
    await fiche(o.fiche || FICHE1);
    for (const [lot, ref, q] of o.blocs || BLOC1) await bloquer(lot, ref, q);
    await rendreCompte(o.compte);
    const d = await detail();
    egal(Object.keys(d).filter((k) => d[k] === 'ko'), tombes, `${quoi} : jalons tombés`);
    proche((await noter(S1.act)).score, score, `${quoi} : note`);
  };
  await essai({ blocs: [...BLOC1, ['CR-171012-B', 'PIC1-800', 96]] }, ['rien-de-trop'], 19, 'lot non visé bloqué');
  await essai({ blocs: [BLOC1[0]] }, ['bloque-CR-171003-A'], 18, 'un blocage oublié');
  await essai({ fiche: { ...FICHE1, cases: { ...FICHE1.cases, magasins: ['laval', 'chateau-gontier', 'mayenne'] } } }, ['magasins'], 17, 'Ernée oublié');
  await essai({ fiche: { ...FICHE1, nb: { partis: 60, restant: 252 } } }, ['partis', 'restant'], 17, 'inversés');
  await essai({ compte: { bloque: 1 } }, ['compte-rendu'], 18, 'boîtes bloquées fausses dans le compte rendu');
});

await v('ENT-14.1 : sans compte rendu, les blocages ne sont pas jugés (attente) ; sans fiche, le service qualité n’écrit pas', async () => {
  await mont(S1);
  await allerV('blocage');
  vrai(!(await entrants()).some((m) => m.subject === S1.objet), 'message du service qualité avant la fiche');
  await fiche(FICHE1);
  for (const [lot, ref, q] of BLOC1) await bloquer(lot, ref, q);
  const d = await detail();
  egal([d['bloque-CR-170718-A'], d['rien-de-trop'], d['compte-rendu']], ['attente', 'attente', 'attente'], 'avant le compte rendu');
});

await v('ENT-14.1 : questions au fil — les trois notées valent 4 points : toutes fausses → 16 ; la réflexion (article 19) ne compte pas', async () => {
  const sauve = { ...R };
  Object.assign(R, { 'ou-chercher': 'exp', 'parti-en-entier': 'rien', 'par-lot': 'vite', attendre: 'oui' });
  try { await mont(S1); await jouer(FICHE1, BLOC1); } finally { Object.assign(R, sauve); }
  proche((await noter(S1.act)).score, 16, 'trois fausses');
});

// ─────────────────────────────────────────────────────────── ENT-14.2
await v('ENT-14.2 : parcours juste (règle du 15 février) → 20/20 ; le lot de la veille (CR-170214-C) coché fait tomber « les lots » ; le lot parti en entier n’a rien à bloquer', async () => {
  await mont(S2);
  egal((await entrants()).length, 1, 'un message à l’ouverture');
  await jouer(FICHE2, BLOC2);
  const n = await noter(S2.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail)); egal(n.max, 20, 'sur');
  egal([await resteDuLot('CR-170622-B'), await resteDuLot('CR-170214-C'), await resteDuLot('CR-170207-A')], [0, 36, 48], 'ce qui reste : le non visé intact');
  await mont(S2);
  await jouer({ ...FICHE2, cases: { ...FICHE2.cases, lots: [...FICHE2.cases.lots, 'CR-170214-C'] } }, BLOC2);
  const d = await detail();
  egal(Object.keys(d).filter((k) => d[k] === 'ko'), ['lots'], 'la veille cochée');
  proche((await noter(S2.act)).score, 17, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-14.3
await v('ENT-14.3 : les blocages de Théo sont déjà faits (ses trois lots à 0) ; parcours juste → 20/20 ; mauvaise cause → 19 ; Laval oublié → 17', async () => {
  await mont(S3);
  egal([await resteDuLot('CR-170704-C'), await resteDuLot('CR-170823-A'), await resteDuLot('CR-171002-B'), await resteDuLot('CR-170215-B')], [0, 0, 0, 48], 'avant');
  const r = await pg.evaluate(async () => { const S = await import('/contenus/lactalis-ent143.js'); const e = document.createElement('div');
    e.innerHTML = S.DOCUMENTS.find((d) => d.id === 'releve').html; return e.textContent.replace(/\s+/g, ' '); });
  vrai(!/CR-170215-B/.test(r) && /CR-170704-C/.test(r), 'le relevé de Théo : ' + r.slice(0, 200));
  await jouer(FICHE3, BLOC3);
  let n = await noter(S3.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail)); egal(n.max, 20, 'sur');
  await mont(S3);
  await jouer({ ...FICHE3, choix: { pourquoi: 'usine' } }, BLOC3);
  egal((await detail()).pourquoi, 'ko', 'cause'); proche((await noter(S3.act)).score, 19, 'mauvaise cause');
  await mont(S3);
  await jouer({ ...FICHE3, cases: { ...FICHE3.cases, magasins: ['ernee'] } }, BLOC3);
  egal((await detail()).magasins, 'ko', 'Laval oublié'); proche((await noter(S3.act)).score, 17, 'Laval oublié');
});

// ─────────────────────────────────────────────────────────── ENT-14.4 (copie rendue)
await v('ENT-14.4 : « Avant de commencer » noté (3 points) ; inaction → 3/20 et aucun jalon juste ; parcours juste → 20/20 ; Château-Gontier (livré ce matin) oublié → 19', async () => {
  await mont(S4);
  let n = await noter(S4.act);
  proche(n.score, 3, 'ouverture seule : ' + JSON.stringify(n.detail));
  vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
  await jouer(FICHE4, BLOC4);
  n = await noter(S4.act);
  proche(n.score, 20, 'parcours juste : ' + JSON.stringify(n.detail));
  await mont(S4);
  await jouer({ ...FICHE4, cases: { ...FICHE4.cases, apres: [] } }, BLOC4);
  egal((await noter(S4.act)).detail.apres, 'ko', 'après l’avis vide');
  proche((await noter(S4.act)).score, 19, 'Château-Gontier oublié');
});

}
