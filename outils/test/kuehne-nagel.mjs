// Suite de tests de Prepalog — bloc « kuehne-nagel » : Kuehne+Nagel ENT-24.1 à 24.5, le hub aérien de Roissy-CDG (1re Bac Pro, C1.3).
// `node outils/test.mjs kuehne-nagel` ne lance que ce bloc. Cadrage : `docs/briefs/kuehne-nagel/CADRAGE-kuehne-nagel-1re.md`. Aides : `outils/test/ikea/commun.mjs`.
// Premières séances « en fiches » avec un écran Planning (la fabrique `contenus/fabrique-fiches.js`, option `planning`, 27/10/2026).
//
// VALEURS ÉCRITES À LA MAIN (relues sur les documents le 27/10/2026 ; le code les calcule, le test les écrit) :
// Durée = 15 min + 10 min par palette : 1 → 25, 2 → 35, 3 → 45, 4 → 55, 5 → 65, 6 → 75. Quais : 1 et 2 froid (2 à 8 °C), 3 de 15 à 25 °C, 4 fret général.
// Le planning se lit en quarts d'heure depuis 6 h (6 h = 0, 6 h 30 = 2, 7 h = 4, 7 h 45 = 7, 8 h = 8, 8 h 15 = 9, 9 h = 12, 10 h = 16).
// ENT-24.2 : A q1 0, C q1 4, B q1 6, I q1 12, D q3 0, E q3 8, G q4 0, H q4 2, F q4 7 ; après l'aléa : I q1 16, F q4 6, J q4 9, H q4 12.
// ENT-24.3 : A q1 0, B q2 0, C q1 6, D q1 9, E q3 2, F q3 6, G q4 2, H q4 5, K q4 9 ; sans le quai 2 : B q1 3.
// ENT-24.4 : Lucas — A juste, B mauvaise zone, C fini trop tard, D commencé trop tôt, E juste ; corrections B quai 3, C 7 h 45, D 8 h.
// ENT-24.5 : A q1 0, E q1 4, G q1 8, B q3 2, F q3 6, D q4 0, C q4 4, H q4 7 ; après l'aléa : E q1 5, J q4 8, H q4 11.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const SEANCES = [['kuehne-nagel-prealertes', '1'], ['kuehne-nagel-planning', '2'], ['kuehne-nagel-lundi', '3'], ['kuehne-nagel-lucas', '4'], ['kuehne-nagel-evaluation', '5']]
  .map(([id, n]) => ({ id, n, pre: `24${n}`, act: `/activites/${id}.js` }));
const S_ = Object.fromEntries(SEANCES.map((s) => [s.n, s]));
const OBJET = 'Ton compte rendu';

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S_['1'].act, id: S_['1'].id });
const { pg, Z, pause, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter, ouvrirParMessage } = P;

const OUV = { metier: 'prestataire', pharma: '60', prealerte: 'annonce', aog: 'sol', froid: 'froid', dispo: 'compagnie' };
const RF = {
  1: { congele: 'part', 'pourquoi-duree': 'quai', 'droit-bpd': 'tout', ordre: 'limite' },
  2: { quart: '30', 'pourquoi-envoyer': 'pret', 'droit-aog': 'cout', aleas: 'libre' },
  3: { 'limite-avant': 'limite', energie: 'energie', 'droit-panne': 'part', seul: 'ordre' },
  4: { verifier: 'tot', chevauche: 'E', 'droit-salarie': 'former', collegue: 'seul' },
  5: { apres: 'planning' },
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
let S = S_['1'];
const mont = (s, o = {}) => { S = s; R = { ...RF[s.n], ...(o.fil || {}) }; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'kn-' + s.id, ...o }); };
const detail = async () => (await noter(S.act)).detail;
const ko = (d) => Object.keys(d).filter((k) => d[k] === 'ko');

async function remplir({ liste = {}, choix = {}, cases = {}, nb = {} }) {
  for (const [b, x] of Object.entries(liste)) { await pg.selectOption(`${Z} select[data-fiche-champ="${b}"]`, x); await pause(120); await qFil(); }
  for (const [b, x] of Object.entries(choix)) { await pg.check(`${Z} [data-fiche-champ="${b}"][value="${x}"]`); await pause(120); await qFil(); }
  for (const [b, L] of Object.entries(cases)) for (const x of L) { await pg.check(`${Z} [data-fiche-case="${b}"][value="${x}"]`); await pause(120); await qFil(); }
  for (const [b, x] of Object.entries(nb)) { await pg.fill(`${Z} [data-fiche-saisie="${b}"]`, String(x)); await pg.keyboard.press('Tab'); await pause(120); await qFil(); }
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil();
}
async function poser(id, ligne, t) {
  await pg.click(`${Z} [data-pl-id="${id}"][data-pl-vue="b"]`);
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${ligne}"][data-t="${t}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  await pause(40);
}
async function envoyerPlanning() {
  await sansToast(); await pg.click(`${Z} [data-pl="envoyer"]`);
  await pause(60);
  // En guidage, un planning qui a encore des problèmes demande « Envoyer quand même ».
  if (await pg.$(`${Z} [data-pl="quandMeme"]`)) await clic('[data-pl="quandMeme"]');
  else await confirmer();
  await pause(150);
  await qFil();
}
// Le planning : `v1` puis (s'il y a un aléa) `v2`, chacun { envoi: [quai, créneau] } ; `v2` ne dit que ce qui bouge.
async function planning({ v1, v2 }) {
  await allerV('planning');
  for (const [id, [q, t]] of Object.entries(v1)) await poser(id, q, t);
  await envoyerPlanning();
  if (v2) {
    await pause(700);
    await allerV('planning');
    for (const [id, [q, t]] of Object.entries(v2)) await poser(id, q, t);
    await envoyerPlanning();
  }
}
// Le parcours : une suite d'écrans { fiche } ou { plan } dans l'ordre de la séance ; le premier s'ouvre par le menu.
async function jouer(ecrans, { compte = {} } = {}) {
  let premiere = true;   // la première fiche de la séance a pour vue « fiche » ; les suivantes « fiche:<id> »
  for (let i = 0; i < ecrans.length; i++) {
    const x = ecrans[i];
    if (x.plan) { if (i > 0) await pause(700); await planning(x.plan); continue; }
    if (i === 0) await allerV('fiche'); else { await pause(700); await ouvrirParMessage(x.sujet, premiere ? 'fiche' : `fiche:f${S.pre}-${x.id}`); }
    premiere = false;
    await remplir(x.fiche);
  }
  const L = await pg.evaluate((o) => { const m = window.__f.db.mails.find((x) => x.subject === o); return m ? Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix.slice()])) : null; }, OBJET);
  vrai(L, 'le compte rendu n’est pas arrivé');
  const t = Object.fromEntries(Object.entries(L).map(([k, c]) => [k, c[0]]));
  for (const [k, i] of Object.entries(compte)) t[k] = L[k][i];
  await phrases(OBJET, t);
  await qFil();
}

const P1 = ({ zones = ['froid', 'ambiant', 'general', 'general', 'froid'], durees = ['55', '65', '45'], preparer = ['temperature', 'quais', 'equipe'], froid = 'A', general = 'C' } = {}) => [
  { id: 'zones', fiche: { liste: Object.fromEntries(['A', 'B', 'C', 'D', 'E'].map((id, i) => [`zone-${id}`, zones[i]])) } },
  { id: 'durees', sujet: 'Combien de temps ?', fiche: { nb: { 'duree-A': durees[0], 'duree-B': durees[1], 'duree-E': durees[2] } } },
  { id: 'preparer', sujet: 'Avant le premier camion', fiche: { cases: { preparer } } },
  { id: 'premier', sujet: 'Qui passe en premier ?', fiche: { choix: { froid, general } } },
];
const PL2 = { v1: { A: ['q1', 0], C: ['q1', 4], B: ['q1', 6], I: ['q1', 12], D: ['q3', 0], E: ['q3', 8], G: ['q4', 0], H: ['q4', 2], F: ['q4', 7] },
  v2: { I: ['q1', 16], H: ['q4', 12], F: ['q4', 6], J: ['q4', 9] } };
const P2 = (plan = PL2, durees = ['25', '65', '75']) => [
  { id: 'durees', fiche: { nb: { 'duree-C': durees[0], 'duree-D': durees[1], 'duree-H': durees[2] } } },
  { plan },
];
const PL3 = { v1: { A: ['q1', 0], B: ['q2', 0], C: ['q1', 6], D: ['q1', 9], E: ['q3', 2], F: ['q3', 6], G: ['q4', 2], H: ['q4', 5], K: ['q4', 9] }, v2: { B: ['q1', 3] } };
const P3 = (plan = PL3, qui = ['karim', 'maintenance']) => [{ plan }, { id: 'prevenir', sujet: 'Qui prévenir ?', fiche: { cases: { qui } } }];
const P4 = ({ defauts = ['juste', 'zone', 'tard', 'tot', 'juste'], corr = { 'quai-B': 'q3', 'heure-C': '07:45', 'heure-D': '08:00' }, oubli = ['zone', 'dispo', 'limite'] } = {}) => [
  { id: 'defauts', fiche: { liste: Object.fromEntries(['A', 'B', 'C', 'D', 'E'].map((id, i) => [`defaut-${id}`, defauts[i]])) } },
  { id: 'corriger', sujet: 'Corrige-le', fiche: { liste: corr } },
  { id: 'regles', sujet: 'Ce qu’il a oublié', fiche: { cases: { oubli } } },
];
const PL5 = { v1: { A: ['q1', 0], E: ['q1', 4], G: ['q1', 8], B: ['q3', 2], F: ['q3', 6], D: ['q4', 0], C: ['q4', 4], H: ['q4', 7] },
  v2: { E: ['q1', 5], H: ['q4', 11], J: ['q4', 8] } };
const P5 = (plan = PL5) => [
  { id: 'zones', fiche: { liste: { 'zone-A': 'froid', 'zone-B': 'ambiant', 'zone-C': 'general', 'zone-D': 'general' } } },
  { id: 'durees', sujet: 'Combien de temps ?', fiche: { nb: { 'duree-A': '55', 'duree-D': '45' } } },
  { plan },
];

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-24.x : les cinq séances se chargent (1re, C1.3 : deux guidages, deux entraînements dont une erreur induite, une évaluation) ; jalons + questions = 20 ; parcours chaîné hors évaluation ; entreprise n° 24 ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/kuehne-nagel-ent${s.pre}.js`);
      const Q = await import(`/contenus/questions/ENT-24.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret,
        A.meta.ouverture, A.meta.precedente, A.meta.parcours, A.meta.reinitialisable], total: C.ETAPES.reduce((t, e) => t + (e.poids || 0), 0), part: Q.QUESTIONS.part || 0,
        ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id) && Q.QUESTIONS.id === s.id, suite: C.SUITE.map((x) => x.vue) });
    }
    return { out, e: I.ENTREPRISES.find((x) => x.n === 24) };
  }, SEANCES);
  egal(r.out.map((x) => x.m), [
    ['ENT-24.1', ['1re'], ['C1.3'], 'guidage', 20, undefined, 'ENT-24.1', true, 'prof', undefined, true, true],
    ['ENT-24.2', ['1re'], ['C1.3'], 'guidage', 20, undefined, 'ENT-24.2', true, 'prof', 'kuehne-nagel-prealertes', true, undefined],
    ['ENT-24.3', ['1re'], ['C1.3'], 'entrainement', 20, undefined, 'ENT-24.3', true, 'prof', 'kuehne-nagel-planning', true, undefined],
    ['ENT-24.4', ['1re'], ['C1.3'], 'entrainement', 20, undefined, 'ENT-24.4', true, 'prof', 'kuehne-nagel-lundi', true, undefined],
    ['ENT-24.5', ['1re'], ['C1.3'], 'evaluation', 20, true, 'ENT-24.5', true, 'prof', undefined, undefined, undefined],
  ], 'meta');
  egal(r.out.map((x) => x.total + x.part + x.ouvPart), Array(5).fill(20), 'jalons + questions');
  egal(r.out.map((x) => x.noter === 'function'), [false, false, false, false, true], 'noter seulement en évaluation');
  egal(r.out.map((x) => x.reg), Array(5).fill(true), 'au registre');
  egal(r.out.map((x) => x.suite), [['fiche', 'fiche:f241-durees', 'fiche:f241-preparer', 'fiche:f241-premier', 'mail'], ['fiche', 'planning', 'mail'], ['planning', 'fiche', 'mail'],
    ['fiche', 'fiche:f244-corriger', 'fiche:f244-regles', 'mail'], ['fiche', 'fiche:f245-durees', 'planning', 'mail']], 'l’ordre des écrans');
  egal([r.e.nom, r.e.logo], ['Kuehne+Nagel', './contenus/trames/logos/kuehne-nagel.svg'], 'entreprise n° 24');
});

await v('ENT-24.x : les données — durées, zones, défauts du planning de Lucas, et chaque planning a une solution avant et après son aléa (valeurs à la main)', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/kuehne-nagel-donnees.js');
    const ok = (E, Q) => !!M.solution(E, Q);
    return {
      durees: [1, 2, 3, 4, 5, 6].map(M.duree),
      zones: M.PRE241.map((x) => x.zone),
      lucas: M.defautsPlanning(M.ENVOIS244, M.LUCAS244),
      corr: M.defautsPlanning(M.ENVOIS244, { ...M.LUCAS244, B: ['q3', '08:00'], C: ['q4', '07:45'], D: ['q2', '08:00'] }),
      c730: M.defautsPlanning(M.ENVOIS244, { ...M.LUCAS244, B: ['q3', '08:00'], C: ['q4', '07:30'], D: ['q2', '08:00'] }).C,
      possibles: [ok(M.ENVOIS242), ok(M.apresAlea(M.ENVOIS242, M.ALEA242)), ok(M.ENVOIS243), ok(M.ENVOIS243, M.quaisApres(M.ALEA243)), ok(M.ENVOIS245), ok(M.apresAlea(M.ENVOIS245, M.ALEA245))],
      // Sans décaler l'électronique H (pas d'heure limite), la pièce urgente J ne tient pas au quai 4 : l'aléa demande vraiment de reprendre.
      sansDecaler: ok(M.apresAlea(M.ENVOIS242, M.ALEA242).map((x) => (x.id === 'H' ? { ...x, avant: '07:45' } : x))),
    };
  });
  egal(r.durees, [25, 35, 45, 55, 65, 75], 'durées');
  egal(r.zones, ['froid', 'ambiant', 'general', 'general', 'froid'], 'zones ENT-24.1');
  egal(r.lucas, { A: 'juste', B: 'zone', C: 'tard', D: 'tot', E: 'juste' }, 'le planning de Lucas');
  egal(r.corr, { A: 'juste', B: 'juste', C: 'juste', D: 'juste', E: 'juste' }, 'corrigé');
  egal(r.c730, 'deux', 'C à 7 h 30 recouvre E');
  egal(r.possibles, Array(6).fill(true), 'plannings possibles');
  egal(r.sansDecaler, false, 'H doit céder la place');
});

await v('ENT-24.x : documents, messages, corrigés — mentions, phrases toutes différentes, aucun message ne juge, les corrigés se chargent', async () => {
  const r = await pg.evaluate(async (L) => {
    const txt = (h) => { const e = document.createElement('div'); e.innerHTML = h; return e.textContent.replace(/\s+/g, ' '); };
    const doubles = [], sans = [], corr = [];
    for (const s of L) {
      const C = await import(`/contenus/kuehne-nagel-ent${s.pre}.js`);
      const d = C.VOLET.declencheurs.find((x) => x.id === 'compte');
      for (const l of d.semer('Léa', {}).mails[0].phrases.lignes) if (new Set(l.choix).size !== l.choix.length) doubles.push(`${s.n} ${l.id}`);
      for (const D of C.OPTIONS.documents) { const t = txt(typeof D.html === 'function' ? D.html({}) : D.html); if (!/Document pédagogique/.test(t)) sans.push(`${s.n} ${D.id}`); }
      const K = await import(`/contenus/corriges/ENT-24.${s.n}.js`);
      corr.push([K.CORRIGE.code, K.CORRIGE.items.length > 0, K.corrigeEleve({}).items.length > 0]);
    }
    return { doubles, sans, corr };
  }, SEANCES);
  egal(r.doubles, [], 'phrases en double');
  egal(r.sans, [], 'documents sans mention');
  egal(r.corr.map((x) => x[0]), SEANCES.map((s) => `ENT-24.${s.n}`), 'corrigés'); vrai(r.corr.every((x) => x[1] && x[2]), 'corrigé vide');
});

// ─────────────────────────────────────────────────────────── ENT-24.1 (fiches)
await v('ENT-24.1 : inaction → 0/20 ; parcours juste → 20/20 ; sabotages — les montres en premier (−1,5), les colis ouverts (−2), 50 minutes pour B (−1)', async () => {
  await mont(S_['1'], { sansOuverture: true });
  egal([(await noter(S.act)).score, (await noter(S.act)).max], [0, 20], 'note');
  await mont(S_['1']);
  await jouer(P1());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  vrai(!(await entrants()).some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct|faux)\b/i.test(m.text)), 'un message juge');
  await mont(S_['1']);
  await jouer(P1({ general: 'D', preparer: ['temperature', 'quais', 'equipe', 'ouvrir'], durees: ['55', '50', '45'] }));
  egal(ko(await detail()), ['duree-B', 'preparer', 'premier-general'], 'jalons tombés');
  proche((await noter(S.act)).score, 15.5, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-24.2 (fiche puis Planning, guidage)
await v('ENT-24.2 : le Planning n’est au menu qu’après la fiche ; parcours juste (avant et après l’aléa) → 20/20 ; l’aléa ajoute la pièce J et décale I', async () => {
  await mont(S_['2']);
  vrai(!(await pg.$(`${Z} .ent-nav[data-vue="planning"]`)), 'le Planning est au menu avant la fiche');
  await jouer(P2());
  const n = await noter(S.act);
  proche(n.score, 20, 'parcours juste : ' + JSON.stringify(n.detail));
  const sujets = (await entrants()).map((m) => m.subject);
  vrai(sujets.includes('Ça change ce matin'), 'le message de l’aléa : ' + JSON.stringify(sujets));
});

await v('ENT-24.2 : sabotages — les comprimés D au quai froid 2 (zones de la 1re version, −2), la reprise renvoyée avec les vaccins I à 9 h (heures, −2)', async () => {
  await mont(S_['2']);
  await jouer(P2({ v1: { ...PL2.v1, D: ['q2', 0] }, v2: { D: ['q3', 0], H: ['q4', 12], F: ['q4', 6], J: ['q4', 9] } }));
  egal(ko(await detail()), ['v1-zones', 'v2-heures'], 'jalons tombés');
  proche((await noter(S.act)).score, 16, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-24.3 (Planning d'abord, entraînement)
await v('ENT-24.3 : parcours juste (l’insuline B passe du quai 2 au quai 1 après la panne) → 20/20 ; la reprise renvoyée sans changement → la reprise vaut 0 (−5,5)', async () => {
  await mont(S_['3']);
  await jouer(P3());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['3']);
  await jouer(P3({ v1: PL3.v1, v2: {} }));
  egal(ko(await detail()), ['v2-zones', 'v2-heures', 'v2-poses'], 'jalons tombés');
  proche((await noter(S.act)).score, 14.5, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-24.4 (erreur induite)
await v('ENT-24.4 : parcours juste → 20/20 ; sabotages — E dit « deux à la fois » (−1), C à 7 h 30 (−1,5), « un à la fois » coché (−2)', async () => {
  await mont(S_['4']);
  await jouer(P4());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['4']);
  await jouer(P4({ defauts: ['juste', 'zone', 'tard', 'tot', 'deux'], corr: { 'quai-B': 'q3', 'heure-C': '07:30', 'heure-D': '08:00' }, oubli: ['zone', 'dispo', 'limite', 'un'] }));
  egal(ko(await detail()), ['defaut-E', 'heure-C', 'oubli'], 'jalons tombés');
  proche((await noter(S.act)).score, 15.5, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-24.5 (évaluation, copie rendue)
await v('ENT-24.5 : « Avant de commencer » noté 3 ; inaction → 3/20 ; le Planning s’ouvre après les deux fiches ; une erreur de zone n’est pas signalée', async () => {
  await mont(S_['5']);
  const n = await noter(S.act);
  proche(n.score, 3, 'ouverture seule ' + JSON.stringify(n.detail));
  vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
  const [f1, f2] = P5();
  await allerV('fiche'); await remplir(f1.fiche);
  await pause(700); await ouvrirParMessage(f2.sujet, 'fiche:f245-durees'); await remplir(f2.fiche);
  await pause(700); await allerV('planning');
  await poser('D', 'q1', 0);
  await pause(300);
  const t = await pg.$eval(Z, (e) => e.textContent);
  vrai(!/pas dans sa zone de température/.test(t), 'une erreur de zone est signalée en évaluation');
});

await v('ENT-24.5 : parcours juste → 20/20 ; la reprise renvoyée sans changement → 15', async () => {
  await mont(S_['5']);
  await jouer(P5());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['5']);
  await jouer(P5({ v1: PL5.v1, v2: {} }));
  egal(ko(await detail()), ['v2-zones', 'v2-heures', 'v2-poses'], 'jalons tombés');
  proche((await noter(S.act)).score, 15, 'note');
});

}
