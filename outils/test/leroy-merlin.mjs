// Suite de tests de Prepalog — bloc « leroy-merlin » : Leroy Merlin ENT-20.1 à 20.8, la plateforme nationale de Réau (1re Bac Pro, C1.2 et C2.1).
// `node outils/test.mjs leroy-merlin` ne lance que ce bloc. Cadrage : `docs/briefs/leroy-merlin/CADRAGE-leroy-merlin-1re.md`. Aides : `outils/test/ikea/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (relues sur les situations, les commandes et les règles le 27/10/2026 ; le code les calcule, le test les écrit) :
// Risques : carrelage tms · allée collision · film chute-objet · quai quai · sable chute-pied · cartons incendie · agv collision · peinture tms.
// Meilleures mesures : carrelage aide · allée passage · film baliser · quai cles · sable nettoyer · agv zone · cartons evacuer · peinture flechir.
// Protocole au quai : accueil, à quai, clé, attente, déchargement, fin.
// ENT-20.2 : TF = 6 × 1 000 000 ÷ 480 000 = 12,5 ; TG = 84 × 1 000 ÷ 480 000 = 0,175 → 0,18 ; niveaux agv supprimer, cartons supprimer, allée collective.
// ENT-20.3 (relevé de Kevin) : ligne 1 mesure (gants), 2 juste, 3 mesure (chaussures), 4 risque (collision au quai), 5 juste.
// ENT-20.4 : jeu 0 (graine « a ») carrelage, agv, cartons, sable, TF 10, TG 0,13 ; jeu 1 (« g ») film, peinture, quai, allée, TF 15, TG 0,225 → 0,23 ;
//   jeu 2 (« b ») sable, allée, agv, carrelage, TF 20, TG 0,24.
// Délais : moins de 30 kg = J+1, 30 kg et plus = J+3, du lundi au samedi (le dimanche ne compte pas).
// ENT-20.5 (lundi 16/11) : W-5521 2,9 kg → mardi 17 ; W-5508 (dimanche 15) 242 kg → mercredi 18 ; W-5530 2,8 kg → mardi 17.
// ENT-20.6 (samedi 21/11) : W-6012 17 kg (ven. 20) → sam. 21 ; W-6015 3,6 kg → sam. 21 ; W-6018 350 kg (sam.) → mer. 25 ; W-6020 29,6 kg (sam.) → lun. 23 ;
//   taux 1 175 ÷ 1 250 = 94 %.
// ENT-20.7 : promesses de Jordan fausses pour W-6101 (38 kg → ven. 27), W-6103 (sam. 21 → lun. 23), W-6104 (30,4 kg → ven. 27) ; justes W-6102 et W-6105.
// ENT-20.8 : jeu 1 (« g ») W-7101 18,2 kg → ven. 27 ; W-7102 39 kg → lun. 30 ; W-7103 38 kg (mer. 25) → sam. 28 ; externe, interne, interne ; 608 ÷ 640 = 95 %.
//   jeu 0 (« a ») W-7001 30,2 kg → mar. 1er déc. ; W-7002 1,6 kg (sam.) → lun. 30 ; W-7003 14,4 kg → sam. 28 ; 93 %.
//   jeu 2 (« b ») W-7201 24,4 kg (sam.) → lun. 30 ; W-7202 32 kg (ven.) → mar. 1er déc. ; W-7203 38 kg (sam.) → mer. 2 déc. ; 91 %.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const SEANCES = [
  ['leroy-merlin-risques', '1'], ['leroy-merlin-quai', '2'], ['leroy-merlin-kevin', '3'], ['leroy-merlin-evaluation-securite', '4'],
  ['leroy-merlin-clients', '5'], ['leroy-merlin-samedi', '6'], ['leroy-merlin-jordan', '7'], ['leroy-merlin-evaluation-clients', '8'],
].map(([id, n]) => ({ id, n, act: `/activites/${id}.js`, pre: `20${n}` }));
const S_ = Object.fromEntries(SEANCES.map((s) => [s.n, s]));
const OBJET = 'Ton compte rendu';

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S_['1'].act, id: S_['1'].id });
const { pg, Z, pause, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter, jouerCarte, ouvrirParMessage } = P;

const OUV = { nationale: 'nationale', auto: 'chariots', clients: 'deux', delai: 'lendemain', prevention: 'source', salarie: 'soin' };
// Les réponses au fil, séance par séance (les réflexions : le premier choix, non noté).
const RF = {
  1: { 'danger-risque': 'danger', gilet: 'voir', 'droit-epi': 'non', zero: 'tous' },
  2: { protocole: 'deux', cle: 'depart', 'tf-sens': 'comparer', presser: 'protocole' },
  3: { 'pourquoi-relever': 'agir', sable: 'supprime', 'droit-unique': 'employeur', dire: 'calme' },
  4: { apres: 'risque' },
  5: { interne: 'meme', total: 'camion', 'droit-delai': 'annuler', ton: 'calme' },
  6: { manque: 'verifier', dimanche: 'dimanche', 'droit-repos': 'repos', promettre: 'sure' },
  7: { roux: 'total', rappeler: 'appeler', 'droit-promesse': 'engage', outil: 'outil' },
  8: { apres: 'type' },
};
let R = RF[1];
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
const mont = (s, o = {}) => { S = s; R = { ...RF[s.n], ...(o.fil || {}) }; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'lm-' + s.id, ...o }); };
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
// Le parcours : `pas` = [{ sujet, fiche }] dans l'ordre de la séance (le premier s'ouvre par le menu), `carte` = fautes de la carte (ENT-20.1),
// `compte` = { ligne: rang du choix } (0 = la phrase juste).
async function jouer(pas, { carte = null, compte = {} } = {}) {
  for (let i = 0; i < pas.length; i++) {
    const p = pas[i];
    // Après un envoi, l'accusé de réception arrive une demi-seconde après le message suivant et redessine sa carte : l'attendre.
    if (i === 0) await allerV('fiche'); else { await pause(700); await ouvrirParMessage(p.sujet, `fiche:f${S.pre}-${p.id}`); }
    await remplir(p.fiche);
    if (i === 0 && carte) { await jouerCarte(carte, R); await qFil(); }
  }
  const L = await pg.evaluate((o) => { const m = window.__f.db.mails.find((x) => x.subject === o); return m ? Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix.slice()])) : null; }, OBJET);
  if (L) {
    const t = Object.fromEntries(Object.entries(L).map(([k, c]) => [k, c[0]]));
    for (const [k, i] of Object.entries(compte)) t[k] = L[k][i];
    await phrases(OBJET, t);
    await qFil();
  }
}
const num = (pfx, L) => Object.fromEntries(L.map((x, i) => [`${pfx}-${i + 1}`, x]));
const QUAI = ['accueil', 'aquai', 'cle', 'attente', 'decharge', 'fin'];

const P1 = () => [
  { id: 'risques', fiche: { liste: num('risque', ['tms', 'collision', 'chute-objet', 'quai', 'chute-pied', 'incendie']) } },
  { id: 'epi', sujet: 'Tes équipements', fiche: { cases: { epi: ['chaussures', 'gilet', 'gants'] } } },
  { id: 'mesures', sujet: 'Que faire ?', fiche: { liste: num('mesure', ['aide', 'baliser', 'nettoyer']) } },
];
const P2 = () => [
  { id: 'quai', fiche: { ordre: { quai: QUAI } } },
  { id: 'situations', sujet: 'Dans les allées', fiche: { liste: { ...num('risque', ['collision', 'incendie', 'tms', 'collision']), ...num('mesure', ['zone', 'evacuer', 'flechir', 'passage']) } } },
  { id: 'niveaux', sujet: 'Le niveau des mesures', fiche: { liste: num('niveau', ['supprimer', 'supprimer', 'collective']) } },
  { id: 'taux', sujet: 'Le tableau de bord', fiche: { nb: { tf: '12,5', tg: '0,18' }, choix: { cause: 'c1' } } },
];
const P3 = () => [
  { id: 'verifier', fiche: { choix: num('etat', ['mesure', 'juste', 'mesure', 'risque', 'juste']) } },
  { id: 'corriger', sujet: 'Le relevé corrigé', fiche: { liste: { ...num('risque', ['tms', 'chute-objet', 'chute-pied', 'quai', 'collision']), ...num('mesure', ['aide', 'baliser', 'nettoyer', 'cles', 'passage']) } } },
  { id: 'cause', sujet: 'Pourquoi ?', fiche: { choix: { cause: 'epi' } } },
];
// ENT-20.4 : les trois jeux, `uid` = la graine qui tire ce jeu.
const J4 = [
  { uid: 'a', risques: ['tms', 'collision', 'incendie', 'chute-pied'], mesures: ['aide', 'zone', 'evacuer', 'nettoyer'], tf: '10', tg: '0,13' },
  { uid: 'g', risques: ['chute-objet', 'tms', 'quai', 'collision'], mesures: ['baliser', 'flechir', 'cles', 'passage'], tf: '15', tg: '0,23' },
  { uid: 'b', risques: ['chute-pied', 'collision', 'collision', 'tms'], mesures: ['nettoyer', 'passage', 'zone', 'aide'], tf: '20', tg: '0,24' },
];
const P4 = (J) => [
  { id: 'situations', fiche: { liste: { ...num('risque', J.risques), ...num('mesure', J.mesures) } } },
  { id: 'quai', sujet: 'Le camion du quai 3', fiche: { ordre: { quai: QUAI } } },
  { id: 'taux', sujet: 'Les taux', fiche: { nb: { tf: J.tf, tg: J.tg } } },
];
const P5 = ({ types = ['interne', 'externe', 'interne', 'externe'], cmd = [['W-5521', '2,9', '2026-11-17'], ['W-5508', '242', '2026-11-18'], ['W-5530', '2,8', '2026-11-17']] } = {}) => [
  { id: 'types', fiche: { choix: Object.fromEntries(types.map((x, i) => [`type-D${i + 1}`, x])) } },
  { id: 'commandes', sujet: 'Trois commandes du site', fiche: { nb: Object.fromEntries(cmd.map(([c, kg]) => [`poids-${c}`, kg])), liste: Object.fromEntries(cmd.map(([c, , d]) => [`date-${c}`, d])) } },
];
const P6 = ({ cmd = [['W-6012', '17', '2026-11-21'], ['W-6015', '3,6', '2026-11-21'], ['W-6018', '350', '2026-11-25'], ['W-6020', '29,6', '2026-11-23']], service = '94' } = {}) => [
  { id: 'types', fiche: { choix: Object.fromEntries(['interne', 'externe', 'externe', 'interne', 'externe'].map((x, i) => [`type-D${i + 1}`, x])) } },
  { id: 'commandes', sujet: 'Quatre commandes', fiche: { nb: Object.fromEntries(cmd.map(([c, kg]) => [`poids-${c}`, kg])), liste: Object.fromEntries(cmd.map(([c, , d]) => [`date-${c}`, d])) } },
  { id: 'service', sujet: 'Le taux de service', fiche: { nb: { service } } },
];
const W7 = ['W-6101', 'W-6102', 'W-6103', 'W-6104', 'W-6105'];
const P7 = ({ verif = ['faux', 'juste', 'faux', 'faux', 'juste'], dates = ['2026-11-27', '2026-11-25', '2026-11-23', '2026-11-27', '2026-11-25'], causes = ['dimanche', 'poids'] } = {}) => [
  { id: 'verifier', fiche: { choix: Object.fromEntries(W7.map((c, i) => [`verif-${c}`, verif[i]])) } },
  { id: 'corriger', sujet: 'Les bonnes dates', fiche: { liste: Object.fromEntries(W7.map((c, i) => [`date-${c}`, dates[i]])) } },
  { id: 'causes', sujet: 'Pourquoi ?', fiche: { cases: { causes } } },
];
const J8 = [
  { uid: 'a', types: ['interne', 'externe', 'externe'], cmd: [['W-7001', '30,2', '2026-12-01'], ['W-7002', '1,6', '2026-11-30'], ['W-7003', '14,4', '2026-11-28']], service: '93' },
  { uid: 'g', types: ['externe', 'interne', 'interne'], cmd: [['W-7101', '18,2', '2026-11-27'], ['W-7102', '39', '2026-11-30'], ['W-7103', '38', '2026-11-28']], service: '95' },
  { uid: 'b', types: ['interne', 'externe', 'externe'], cmd: [['W-7201', '24,4', '2026-11-30'], ['W-7202', '32', '2026-12-01'], ['W-7203', '38', '2026-12-02']], service: '91' },
];
const P8 = (J) => [
  { id: 'types', fiche: { choix: Object.fromEntries(J.types.map((x, i) => [`type-D${i + 1}`, x])) } },
  { id: 'commandes', sujet: 'Trois commandes', fiche: { nb: Object.fromEntries(J.cmd.map(([c, kg]) => [`poids-${c}`, kg])), liste: Object.fromEntries(J.cmd.map(([c, , d]) => [`date-${c}`, d])) } },
  { id: 'service', sujet: 'Le taux de service', fiche: { nb: { service: J.service } } },
];

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-20.x : les huit séances se chargent (1re, C1.2 puis C2.1, les trois temps et l’erreur induite) ; jalons + questions = 20 ; parcours chaîné hors évaluations ; entreprise n° 20 ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/leroy-merlin-ent${s.pre}.js`);
      const Q = await import(`/contenus/questions/ENT-20.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret,
        A.meta.ouverture, A.meta.precedente, A.meta.parcours, A.meta.reinitialisable], total: C.ETAPES.reduce((t, e) => t + (e.poids || 0), 0), part: Q.QUESTIONS.part || 0,
        ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id) });
    }
    return { out, e: I.ENTREPRISES.find((x) => x.n === 20) };
  }, SEANCES);
  egal(r.out.map((x) => x.m), [
    ['ENT-20.1', ['1re'], ['C1.2'], 'guidage', 20, undefined, 'ENT-20.1', true, 'prof', undefined, true, true],
    ['ENT-20.2', ['1re'], ['C1.2'], 'entrainement', 20, undefined, 'ENT-20.2', true, 'prof', 'leroy-merlin-risques', true, undefined],
    ['ENT-20.3', ['1re'], ['C1.2'], 'erreur', 20, undefined, 'ENT-20.3', true, 'prof', 'leroy-merlin-quai', true, undefined],
    ['ENT-20.4', ['1re'], ['C1.2'], 'evaluation', 20, true, 'ENT-20.4', true, 'prof', undefined, undefined, undefined],
    ['ENT-20.5', ['1re'], ['C2.1'], 'guidage', 20, undefined, 'ENT-20.5', true, 'prof', 'leroy-merlin-kevin', true, undefined],
    ['ENT-20.6', ['1re'], ['C2.1'], 'entrainement', 20, undefined, 'ENT-20.6', true, 'prof', 'leroy-merlin-clients', true, undefined],
    ['ENT-20.7', ['1re'], ['C2.1'], 'erreur', 20, undefined, 'ENT-20.7', true, 'prof', 'leroy-merlin-samedi', true, undefined],
    ['ENT-20.8', ['1re'], ['C2.1'], 'evaluation', 20, true, 'ENT-20.8', true, 'prof', undefined, undefined, undefined],
  ], 'meta');
  egal(r.out.map((x) => x.total + x.part + x.ouvPart), Array(8).fill(20), 'jalons + questions');
  egal(r.out.map((x) => x.noter === 'function'), [false, false, false, true, false, false, false, true], 'noter seulement en évaluation');
  egal(r.out.map((x) => x.reg), Array(8).fill(true), 'au registre');
  egal([r.e.nom, r.e.logo], ['Leroy Merlin', './contenus/trames/logos/leroy-merlin.svg'], 'entreprise n° 20');
});

await v('ENT-20.x : les données — risques, mesures, niveaux, relevé de Kevin, taux de fréquence et de gravité, poids et dates (dimanche sauté, 30 kg = encombrant), promesses de Jordan, taux de service (valeurs à la main)', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/leroy-merlin-donnees.js');
    const K = Object.keys(M.SITUATIONS);
    const cmd = (D) => D.commandes.map((c) => [c.id, M.poidsCommande(c), M.livraison(c)]);
    return {
      risques: K.map((k) => [k, M.SITUATIONS[k].risque, M.SITUATIONS[k].juste]),
      niveaux: ['agv', 'cartons', 'allee'].map((k) => M.mesureJuste(k).niveau),
      kevin: M.KEVIN.map(M.etatKevin),
      taux: [M.ACC202, ...M.TOUS_JEUX204.map((J) => J.acc)].map((A) => [M.tf(A), M.tg(A)]),
      d205: cmd(M.D205), d206: cmd(M.D206), t206: M.tauxService(M.D206.service),
      d207: M.D207.commandes.map((c) => [c.id, M.promisJuste(c), M.livraison(c)]),
      d208: M.TOUS_JEUX208.map((J) => [cmd(J), M.tauxService(J.service)]),
      bord: [M.encombrant({ lignes: [{ ref: 'ampoules', qte: 1 }] }), M.plusJours('2026-11-21', 1), M.plusJours('2026-11-21', 3), M.jourLong('2026-12-01')],
    };
  });
  egal(r.risques, [['carrelage', 'tms', 'aide'], ['allee', 'collision', 'passage'], ['film', 'chute-objet', 'baliser'], ['quai', 'quai', 'cles'], ['sable', 'chute-pied', 'nettoyer'],
    ['agv', 'collision', 'zone'], ['cartons', 'incendie', 'evacuer'], ['peinture', 'tms', 'flechir']], 'situations');
  egal(r.niveaux, ['supprimer', 'supprimer', 'collective'], 'niveaux ENT-20.2');
  egal(r.kevin, ['mesure', 'juste', 'mesure', 'risque', 'juste'], 'relevé de Kevin');
  egal(r.taux, [[12.5, 0.18], [10, 0.13], [15, 0.23], [20, 0.24]], 'taux');
  egal(r.d205, [['W-5521', 2.9, '2026-11-17'], ['W-5508', 242, '2026-11-18'], ['W-5530', 2.8, '2026-11-17']], 'ENT-20.5');
  egal(r.d206, [['W-6012', 17, '2026-11-21'], ['W-6015', 3.6, '2026-11-21'], ['W-6018', 350, '2026-11-25'], ['W-6020', 29.6, '2026-11-23']], 'ENT-20.6');
  egal(r.t206, 94, 'taux de service ENT-20.6');
  egal(r.d207, [['W-6101', false, '2026-11-27'], ['W-6102', true, '2026-11-25'], ['W-6103', false, '2026-11-23'], ['W-6104', false, '2026-11-27'], ['W-6105', true, '2026-11-25']], 'ENT-20.7');
  egal(r.d208, [
    [[['W-7001', 30.2, '2026-12-01'], ['W-7002', 1.6, '2026-11-30'], ['W-7003', 14.4, '2026-11-28']], 93],
    [[['W-7101', 18.2, '2026-11-27'], ['W-7102', 39, '2026-11-30'], ['W-7103', 38, '2026-11-28']], 95],
    [[['W-7201', 24.4, '2026-11-30'], ['W-7202', 32, '2026-12-01'], ['W-7203', 38, '2026-12-02']], 91]], 'ENT-20.8');
  egal(r.bord, [false, '2026-11-23', '2026-11-25', 'mardi 1er décembre'], 'dimanche sauté, « 1er »');
});

await v('ENT-20.x : les documents et les messages — mentions, phrases toutes différentes, les commandes ne disent ni le poids total ni la date ; les corrigés se chargent (un par élève en évaluation) ; les graines tirent les trois jeux', async () => {
  const r = await pg.evaluate(async (L) => {
    const txt = (h) => { const e = document.createElement('div'); e.innerHTML = h; return e.textContent.replace(/\s+/g, ' '); };
    const doubles = [], sans = [], corr = [];
    for (const s of L) {
      const C = await import(`/contenus/leroy-merlin-ent${s.pre}.js`);
      for (const db of [{}, { tirage: { graine: 'a' } }, { tirage: { graine: 'b' } }]) {
        const d = C.VOLET.declencheurs.find((x) => x.id === 'compte');
        if (d) for (const l of d.semer('Léa', db).mails[0].phrases.lignes) if (new Set(l.choix).size !== l.choix.length) doubles.push(`${s.n} ${l.id}`);
        for (const D of C.OPTIONS.documents) { const t = txt(typeof D.html === 'function' ? D.html(db) : D.html); if (!/Document pédagogique/.test(t)) sans.push(`${s.n} ${D.id}`); }
      }
      const K = await import(`/contenus/corriges/ENT-20.${s.n}.js`);
      corr.push([K.CORRIGE.code, K.CORRIGE.items.length > 0, K.corrigeEleve({ tirage: { graine: 'b' } }, 'b').items.length > 0]);
    }
    const C5 = await import('/contenus/leroy-merlin-ent205.js');
    const c5 = txt(C5.OPTIONS.documents.find((d) => d.id === 'commandes').html({}));
    const M = await import('/contenus/leroy-merlin-donnees.js');
    const vus4 = new Set(), vus8 = new Set();
    for (let i = 0; i < 300; i++) { const db = { tirage: { graine: `eleve-${i}` } }; vus4.add(M.jeu204(db).situations[0]); vus8.add(M.jeu208(db).commandes[0].id); }
    return { doubles, sans, corr, c5, vus4: [...vus4].sort(), vus8: [...vus8].sort() };
  }, SEANCES);
  egal(r.doubles, [], 'phrases en double');
  egal(r.sans, [], 'documents sans mention');
  egal(r.corr.map((x) => x[0]), SEANCES.map((s) => `ENT-20.${s.n}`), 'corrigés'); vrai(r.corr.every((x) => x[1] && x[2]), 'corrigé vide : ' + JSON.stringify(r.corr));
  vrai(/W-5508/.test(r.c5) && !/242/.test(r.c5) && !/mercredi 18/.test(r.c5) && !/encombrant/i.test(r.c5), 'les commandes trahissent le poids ou la date : ' + r.c5);
  egal(r.vus4, ['carrelage', 'film', 'sable'], 'ENT-20.4 : 300 graines tirent les trois jeux');
  egal(r.vus8, ['W-7001', 'W-7101', 'W-7201'], 'ENT-20.8 : 300 graines tirent les trois jeux');
});

// ─────────────────────────────────────────────────────────── ENT-20.1 à 20.3 (C1.2)
await v('ENT-20.1 : inaction → 0/20 ; un message de Samir ; carte fermée avant la première fiche ; parcours juste → 20/20 ; aucun message ne juge', async () => {
  await mont(S_['1'], { sansOuverture: true });
  const n0 = await noter(S.act);
  egal([n0.score, n0.max], [0, 20], 'note');
  await mont(S_['1']);
  egal((await entrants()).length, 1, 'un seul message');
  vrai(!(await pg.$(`${Z} .ent-nav[data-vue="localiser"]`)), 'la carte est ouverte avant la première fiche');
  await jouer(P1(), { carte: {} });
  const n = await noter(S.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail));
  const E = await entrants();
  vrai(!E.some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct|faux)\b/i.test(m.text)), 'un message juge');
});

await v('ENT-20.1 : sabotages — le quai pris pour une collision (−0,75) ; une erreur de région sur Réau (−0,5) ; la bague cochée (−2) ; des gants pour le carrelage (−1,5) ; compte rendu « l’EPI d’abord » (−2)', async () => {
  await mont(S_['1']);
  const F = P1();
  F[0].fiche.liste['risque-4'] = 'collision'; F[1].fiche.cases.epi.push('bijoux'); F[2].fiche.liste['mesure-1'] = 'gants';
  await jouer(F, { carte: { 'reau:region': 1 }, compte: { ordre: 1 } });
  egal(ko(await detail()), ['risque-4', 'localiser:reau:region', 'epi', 'mesure-1', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 13.25, 'note');
});

await v('ENT-20.2 : parcours juste → 20/20 (TF 12,5, TG 0,18) ; sabotages — le protocole laissé tel quel (−3), l’allée réservée notée « protection collective » (−0,5), TF 125 (−1,5)', async () => {
  await mont(S_['2']);
  await jouer(P2());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['2']);
  const F = P2(); F[0].fiche.ordre = {}; F[2].fiche.liste['niveau-1'] = 'collective'; F[3].fiche.nb.tf = '125';
  await jouer(F);
  egal(ko(await detail()), ['quai-1', 'quai-2', 'quai-3', 'quai-4', 'quai-5', 'quai-6', 'niveau-1', 'tf'], 'jalons tombés');
  proche((await noter(S.act)).score, 15, 'note');
});

await v('ENT-20.3 : parcours juste → 20/20 ; sabotages — le relevé de Kevin recopié (vérifier « juste » partout, corriger avec ses valeurs) et la cause « trop vite » (−7,1)', async () => {
  await mont(S_['3']);
  await jouer(P3());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['3']);
  const F = P3();
  F[0].fiche.choix = num('etat', Array(5).fill('juste'));
  Object.assign(F[1].fiche.liste, { 'risque-4': 'collision', 'mesure-1': 'gants', 'mesure-3': 'chaussures' });
  F[2].fiche.choix.cause = 'vite';
  await jouer(F);
  egal(ko(await detail()), ['etat-1', 'etat-3', 'etat-4', 'risque-4', 'mesure-1', 'mesure-3', 'cause'], 'jalons tombés');
  proche((await noter(S.act)).score, 12.9, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-20.4 (copie rendue)
await v('ENT-20.4 : la graine tire le jeu ; « Avant de commencer » noté 3 ; inaction → 3/20 ; parcours juste → 20/20 dans chacun des trois jeux', async () => {
  for (const J of J4) {
    await mont(S_['4'], { uid: J.uid });
    let n = await noter(S.act);
    proche(n.score, 3, `jeu ${J.uid} : ouverture seule ` + JSON.stringify(n.detail));
    vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
    egal(await pg.evaluate(() => window.__f.db.tirage && window.__f.db.tirage.graine), J.uid, 'graine posée');
    await jouer(P4(J));
    n = await noter(S.act);
    proche(n.score, 20, `jeu ${J.uid} : ` + JSON.stringify(n.detail));
  }
});

await v('ENT-20.4 : jeu « g » — TG 0,225 accepté ; sabotages — la ceinture lombaire (−1), TF 0,15 (−1,5), compte rendu « aucun risque » (−3)', async () => {
  const J = { ...J4[1], tg: '0,225' };
  await mont(S_['4'], { uid: J.uid });
  await jouer(P4(J));
  proche((await noter(S.act)).score, 20, '0,225');
  await mont(S_['4'], { uid: J.uid });
  const F = P4({ ...J, tf: '0,15' }); F[0].fiche.liste['mesure-2'] = 'ceinture';
  await jouer(F, { compte: { situation: 2 } });
  egal(ko(await detail()), ['mesure-2', 'tf', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 14.5, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-20.5 à 20.7 (C2.1)
await v('ENT-20.5 : parcours juste → 20/20 ; sabotages — Créteil pris pour un client externe (−1), 240 kg (−1), la perceuse livrée le jour même (−1,5), compte rendu « Mme Dias » faux (−4,5)', async () => {
  await mont(S_['5']);
  await jouer(P5());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['5']);
  await jouer(P5({ types: ['interne', 'externe', 'externe', 'externe'], cmd: [['W-5521', '2,9', '2026-11-16'], ['W-5508', '240', '2026-11-18'], ['W-5530', '2,8', '2026-11-17']] }),
    { compte: { dias: 1 } });
  egal(ko(await detail()), ['type-3', 'date-1', 'poids-2', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 12, 'note');
});

await v('ENT-20.6 : parcours juste → 20/20 ; sabotages — le dimanche compté pour le ciment (−1) et pour M. Hamon (−1), taux 106 % (−2)', async () => {
  await mont(S_['6']);
  await jouer(P6());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['6']);
  await jouer(P6({ cmd: [['W-6012', '17', '2026-11-21'], ['W-6015', '3,6', '2026-11-21'], ['W-6018', '350', '2026-11-24'], ['W-6020', '29,6', '2026-11-22']], service: '106' }));
  egal(ko(await detail()), ['date-3', 'date-4', 'service'], 'jalons tombés');
  proche((await noter(S.act)).score, 16, 'note');
});

await v('ENT-20.7 : parcours juste → 20/20 ; sabotages — les promesses de Jordan toutes crues justes et recopiées (−6), une seule cause cochée (−2)', async () => {
  await mont(S_['7']);
  await jouer(P7());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['7']);
  await jouer(P7({ verif: Array(5).fill('juste'), dates: ['2026-11-25', '2026-11-25', '2026-11-22', '2026-11-25', '2026-11-25'], causes: ['dimanche'] }));
  egal(ko(await detail()), ['verif-1', 'verif-3', 'verif-4', 'date-1', 'date-3', 'date-4', 'causes'], 'jalons tombés');
  proche((await noter(S.act)).score, 12, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-20.8 (copie rendue)
await v('ENT-20.8 : « Avant de commencer » noté 3 ; inaction → 3/20 ; parcours juste → 20/20 dans chacun des trois jeux', async () => {
  for (const J of J8) {
    await mont(S_['8'], { uid: J.uid });
    let n = await noter(S.act);
    proche(n.score, 3, `jeu ${J.uid} : ouverture seule ` + JSON.stringify(n.detail));
    vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
    await jouer(P8(J));
    n = await noter(S.act);
    proche(n.score, 20, `jeu ${J.uid} : ` + JSON.stringify(n.detail));
  }
});

await v('ENT-20.8 : jeu « g » — sabotages : 36 kg et J+1 pour la commande de 39 kg (−3), taux 5 % (−2)', async () => {
  const J = J8[1];
  await mont(S_['8'], { uid: J.uid });
  await jouer(P8({ ...J, cmd: [J.cmd[0], ['W-7102', '36', '2026-11-27'], J.cmd[2]], service: '5' }));
  egal(ko(await detail()), ['poids-2', 'date-2', 'service'], 'jalons tombés');
  proche((await noter(S.act)).score, 15, 'note');
});

}
