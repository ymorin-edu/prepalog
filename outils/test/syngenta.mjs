// Suite de tests de Prepalog — bloc « syngenta » : Syngenta ENT-15.1 à 15.4, ranger des produits dangereux (1re, C3.1 et C1.5).
// `node outils/test.mjs syngenta` ne lance que ce bloc. Cadrage : `docs/briefs/syngenta/CADRAGE-syngenta-1re.md`. Aides : `outils/test/ikea/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (relues sur la règle le 26/10/2026 ; le code les calcule, le test les écrit) :
// ENT-15.1 : PAL-1 C1, PAL-2 C4, PAL-3 C2, PAL-4 C3, PAL-5 C1 (flamme + tête de mort), PAL-6 C2 ; cellule 1 : 1 200 + 600 + 600 = 2 400 L → 50 % = 1 200 L.
// ENT-15.2 : PAL-11 C2 (SGH08), PAL-12 C3, PAL-13 C1, PAL-14 C4, PAL-15 C1, PAL-16 C2, PAL-17 attente (cellule 1 pleine), PAL-18 C4 ;
//   cellule 1 : 3 000 + 1 200 = 4 200 → 2 100 L (installée 2 000 : ne suffit pas) ; cellule 3 : 2 400 + 800 = 3 200 → 640 → minimum 800 L.
// ENT-15.3 : Lucas a mal rangé PAL-21 (C2 au lieu de C1) et PAL-23 (C4 au lieu de C3), et pris 20 % ; cellule 1 : 1 800 + 600 + 600 + 800 = 3 800 L
//   → 1 900 L (installée 1 500 : ne suffit pas).
// ENT-15.4 : PAL-31 C2, PAL-32 C1, PAL-33 C4, PAL-34 C3, PAL-35 attente (cellule 2 pleine), PAL-36 C1 ; cellule 2 : 2 400 + 600 = 3 000 → 600 → 800 L
//   (installée 1 000 : suffit).

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const S1 = { id: 'syngenta-ranger', act: '/activites/syngenta-ranger.js', n: '1' };
const S2 = { id: 'syngenta-cellule-pleine', act: '/activites/syngenta-cellule-pleine.js', n: '2' };
const S3 = { id: 'syngenta-plan-lucas', act: '/activites/syngenta-plan-lucas.js', n: '3' };
const S4 = { id: 'syngenta-evaluation', act: '/activites/syngenta-evaluation.js', n: '4' };
const OBJET = 'Ton compte rendu';

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S1.act, id: S1.id });
const { pg, Z, pause, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter } = P;

const OUV = { flamme: 'inflammable', 'deux-pictos': 'c1', retention: 'fuite', pleine: 'attente', seveso: 'dangereux', etiquette: 'fournisseur' };
const R = {
  'flamme-dabord': 'feu', 'pourquoi-50': 'feu', fuite: 'alerter', riverains: 'oui',
  sante: 'sgh08', 'pas-ailleurs': 'regle', 'retention-courte': 'stop', nappe: 'eau',
  'oubli-lucas': 'ordre', debordement: 'deborde', 'dire-lucas': 'montrer', responsable: 'exploitant',
  'attente-longue': 'place',
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
const mont = (s, o = {}) => { S = s; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'sy-' + s.id, ...o }); };
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
const F1 = { liste: { pal1: 'C1', pal2: 'C4', pal3: 'C2', pal4: 'C3', pal5: 'C1', pal6: 'C2' }, nb: { 'vol-C1': '2 400', 'ret-C1': 1200 } };
const F2 = { liste: { pal11: 'C2', pal12: 'C3', pal13: 'C1', pal14: 'C4', pal15: 'C1', pal16: 'C2', pal17: 'attente', pal18: 'C4' },
  choix: { 'suf-C1': 'non' }, nb: { 'ret-C1': 2100, 'ret-C3': 800 } };
const F3 = { cases: { erreurs: ['PAL-21', 'PAL-23'] }, choix: { cause: 'part', 'suf-C1': 'non' }, nb: { 'vol-C1': 3800, 'ret-C1': '1 900' } };
const F4 = { liste: { pal31: 'C2', pal32: 'C1', pal33: 'C4', pal34: 'C3', pal35: 'attente', pal36: 'C1' }, choix: { 'suf-C2': 'oui' }, nb: { 'vol-C2': 3000, 'ret-C2': 800 } };

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-15.x : les quatre séances se chargent (1re, C3.1 et C1.5 : guidage, entraînement, erreur induite, évaluation) ; jalons + questions = 20 ; entreprise n° 15 ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/syngenta-ent15${s.n}.js`);
      const Q = await import(`/contenus/questions/ENT-15.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret, A.meta.ouverture, A.meta.reinitialisable],
        total: C.ETAPES.reduce((t, e) => t + e.poids, 0), part: Q.QUESTIONS.part || 0, ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id) });
    }
    return { out, e: I.ENTREPRISES.find((x) => x.n === 15) };
  }, [S1, S2, S3, S4]);
  egal(r.out.map((x) => x.m), [
    ['ENT-15.1', ['1re'], ['C3.1', 'C1.5'], 'guidage', 20, undefined, 'ENT-15.1', true, 'prof', true],
    ['ENT-15.2', ['1re'], ['C3.1', 'C1.5'], 'entrainement', 20, undefined, 'ENT-15.2', true, 'prof', undefined],
    ['ENT-15.3', ['1re'], ['C3.1', 'C1.5'], 'erreur', 20, undefined, 'ENT-15.3', true, 'prof', undefined],
    ['ENT-15.4', ['1re'], ['C3.1', 'C1.5'], 'evaluation', 20, true, 'ENT-15.4', true, 'prof', undefined],
  ], 'meta');
  egal(r.out.map((x) => x.total + x.part + x.ouvPart), [20, 20, 20, 20], 'jalons + questions');
  egal(r.out.map((x) => x.noter), ['undefined', 'undefined', 'undefined', 'function'], 'noter seulement en évaluation');
  egal(r.out.map((x) => x.reg), [true, true, true, true], 'au registre');
  egal([r.e.nom, r.e.logo], ['Syngenta', './contenus/trames/logos/syngenta.svg'], 'entreprise n° 15');
});

await v('ENT-15.x : les données — la cellule du danger le plus fort, la zone d’attente, les rétentions (50 % / 20 %, 800 L au moins), le plan de Lucas (valeurs écrites à la main)', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/syngenta-donnees.js');
    const b = (D) => { const B = M.bilan(D); return [B.rangement, B.volumes, B.retentions, B.suffit, B.attente]; };
    const L = M.travailDeLucas(M.D153);
    return { d1: b(M.D151), d2: b(M.D152), d3: b(M.D153), d4: b(M.D154), l: [L.faux, L.volC1, L.retC1, L.ok],
      c: [M.celluleDe(['SGH02', 'SGH06']), M.celluleDe(['SGH07', 'SGH08']), M.celluleDe(['SGH05', 'SGH07']), M.celluleDe(['SGH07', 'SGH09'])],
      ret: [M.retention('C1', 2400), M.retention('C2', 3000), M.retention('C3', 500), M.retention('C4', 5000)] };
  });
  egal(r.c, ['C1', 'C2', 'C3', 'C4'], 'ordre des dangers');
  egal(r.ret, [1200, 800, 500, 1000], 'règle de rétention');
  egal(r.d1[0], { 'PAL-1': 'C1', 'PAL-2': 'C4', 'PAL-3': 'C2', 'PAL-4': 'C3', 'PAL-5': 'C1', 'PAL-6': 'C2' }, 'ENT-15.1 rangement');
  egal([r.d1[1].C1, r.d1[2].C1], [2400, 1200], 'ENT-15.1 cellule 1');
  egal([r.d2[4], r.d2[1].C1, r.d2[2].C1, r.d2[3].C1, r.d2[1].C3, r.d2[2].C3], [['PAL-17'], 4200, 2100, false, 3200, 800], 'ENT-15.2');
  egal([r.d3[1].C1, r.d3[2].C1, r.d3[3].C1], [3800, 1900, false], 'ENT-15.3');
  egal(r.l, [['PAL-21', 'PAL-23'], 3200, 800, true], 'le plan de Lucas');
  egal([r.d4[4], r.d4[1].C2, r.d4[2].C2, r.d4[3].C2], [['PAL-35'], 3000, 800, true], 'ENT-15.4');
});

await v('ENT-15.x : les documents — le bon donne les pictogrammes sans la cellule ; la règle est dite construite ; le droit parle de Seveso ; chaque document reconstitué porte sa mention', async () => {
  const r = await pg.evaluate(async () => {
    const h = (S, id) => { const d = S.DOCUMENTS.find((x) => x.id === id); const e = document.createElement('div'); e.innerHTML = d.html; return e.textContent.replace(/\s+/g, ' '); };
    const S1 = await import('/contenus/syngenta-ent151.js');
    const S3 = await import('/contenus/syngenta-ent153.js');
    return { ids: [S1.DOCUMENTS.map((d) => d.id), S3.DOCUMENTS.map((d) => d.id)], tr: h(S1, 'transfert'), regle: h(S1, 'regle'), droit: h(S1, 'droit'),
      poste: h(S1, 'poste'), etat: h(S1, 'etat'), plan: h(S3, 'plan-lucas') };
  });
  egal(r.ids, [['poste', 'transfert', 'etat', 'regle', 'pictos', 'droit'], ['poste', 'transfert', 'etat', 'plan-lucas', 'regle', 'pictos', 'droit']], 'documents');
  vrai(/SGH02/.test(r.tr) && !/[Cc]ellule/.test(r.tr), 'le bon de transfert : ' + r.tr.slice(0, 200));
  vrai(/CONSTRUITE/.test(r.regle) && /50 %/.test(r.regle) && /800 litres/.test(r.regle), 'la règle');
  vrai(/Seveso/.test(r.droit) && /2012\/18\/UE/.test(r.droit), 'le droit');
  for (const k of ['tr', 'etat', 'plan']) vrai(/CONSTRUIT/.test(r[k]) && /reconstitution/.test(r[k]), `mention sur ${k}`);
  vrai(/Aigues-Vives/.test(r.poste) && /Seveso seuil haut/.test(r.poste), 'les faits réels dans « Ton poste »');
  vrai(/20 %/.test(r.plan) && /OK/.test(r.plan), 'le plan de Lucas : ' + r.plan);
});

// ─────────────────────────────────────────────────────────── ENT-15.1
await v('ENT-15.1 : inaction → 0/20 ; un message de Karim avec les pièces ; parcours juste → 20/20 et le message de fin ; aucun message ne juge', async () => {
  await mont(S1, { sansOuverture: true });
  const n0 = await noter(S1.act);
  egal([n0.score, n0.max], [0, 20], 'note');
  vrai(!Object.values(n0.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n0.detail));
  await mont(S1);
  egal((await entrants()).map((m) => [m.from, m.pieces]), [['Karim, responsable du magasin', ['poste', 'transfert', 'etat', 'regle', 'pictos']]], 'messages');
  await jouer(F1);
  const n = await noter(S1.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail)); egal(n.max, 20, 'sur');
  const E = await entrants();
  egal(E.map((m) => m.subject), ['Six palettes à ranger ce matin', OBJET, 'Merci'], 'messages');
  vrai(!E.some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct)\b/i.test(m.text)), 'un message juge');
});

await v('ENT-15.1 : sabotages — PAL-5 (flamme + tête de mort) en cellule 2 (−1,5) ; rétention prise à 20 % (−2,5) ; compte rendu qui oublie PAL-5 (−3) ; questions toutes fausses (−4)', async () => {
  const essai = async (F, compte, tombes, score, quoi) => {
    await mont(S1);
    await jouer(F, compte);
    egal(ko(await detail()), tombes, `${quoi} : jalons tombés`);
    proche((await noter(S1.act)).score, score, `${quoi} : note`);
  };
  await essai({ ...F1, liste: { ...F1.liste, pal5: 'C2' } }, {}, ['pal5'], 18.5, 'PAL-5 en cellule 2');
  await essai({ ...F1, nb: { ...F1.nb, 'ret-C1': 480 } }, {}, ['ret-C1'], 17.5, '20 %');
  await essai(F1, { inflammables: 1 }, ['compte-rendu'], 17, 'compte rendu');
  const sauve = { ...R };
  Object.assign(R, { 'flamme-dabord': 'place', 'pourquoi-50': 'cher', fuite: 'essuyer', riverains: 'non' });
  try { await mont(S1); await jouer(F1); } finally { Object.assign(R, sauve); }
  proche((await noter(S1.act)).score, 16, 'trois fausses (la réflexion ne compte pas)');
});

// ─────────────────────────────────────────────────────────── ENT-15.2
await v('ENT-15.2 : parcours juste → 20/20 ; PAL-17 rangée en cellule 4 (−1) ; « la rétention suffit » (−2) ; cellule 3 sans le minimum de 800 L (−2)', async () => {
  await mont(S2);
  await jouer(F2);
  proche((await noter(S2.act)).score, 20, 'parcours juste');
  await mont(S2);
  await jouer({ ...F2, liste: { ...F2.liste, pal17: 'C4' } });
  egal(ko(await detail()), ['pal17'], 'PAL-17 en cellule 4'); proche((await noter(S2.act)).score, 19, 'PAL-17');
  await mont(S2);
  await jouer({ ...F2, choix: { 'suf-C1': 'oui' }, nb: { ...F2.nb, 'ret-C3': 640 } });
  egal(ko(await detail()), ['suf-C1', 'ret-C3'], 'rétentions'); proche((await noter(S2.act)).score, 16, 'rétentions');
});

// ─────────────────────────────────────────────────────────── ENT-15.3
await v('ENT-15.3 : parcours juste → 20/20 ; une seule palette trouvée (−4) ; mauvaise cause (−2) ; le calcul de Lucas recopié (800 L, « suffit ») (−5)', async () => {
  await mont(S3);
  await jouer(F3);
  proche((await noter(S3.act)).score, 20, 'parcours juste');
  await mont(S3);
  await jouer({ ...F3, cases: { erreurs: ['PAL-21'] }, choix: { ...F3.choix, cause: 'minimum' } });
  egal(ko(await detail()), ['erreurs', 'cause'], 'une palette, mauvaise cause'); proche((await noter(S3.act)).score, 14, 'une palette, mauvaise cause');
  await mont(S3);
  await jouer({ ...F3, choix: { cause: 'part', 'suf-C1': 'oui' }, nb: { ...F3.nb, 'ret-C1': 800 } });
  egal(ko(await detail()), ['ret-C1', 'suf-C1'], 'calcul de Lucas'); proche((await noter(S3.act)).score, 15, 'calcul de Lucas');
});

// ─────────────────────────────────────────────────────────── ENT-15.4 (copie rendue)
await v('ENT-15.4 : « Avant de commencer » noté (3 points) ; inaction → 3/20 et aucun jalon juste ; parcours juste → 20/20 ; PAL-35 forcée en cellule 2 et compte rendu sans l’attente → 15,5', async () => {
  await mont(S4);
  let n = await noter(S4.act);
  proche(n.score, 3, 'ouverture seule : ' + JSON.stringify(n.detail));
  vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
  await jouer(F4);
  n = await noter(S4.act);
  proche(n.score, 20, 'parcours juste : ' + JSON.stringify(n.detail));
  await mont(S4);
  await jouer({ ...F4, liste: { ...F4.liste, pal35: 'C2' } }, { attente: 2 });
  egal(ko(await detail()), ['pal35', 'compte-rendu'], 'PAL-35 forcée');
  proche((await noter(S4.act)).score, 15.5, 'PAL-35 forcée');
});

}
