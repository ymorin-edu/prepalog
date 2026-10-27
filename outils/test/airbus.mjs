// Suite de tests de Prepalog — bloc « airbus » : Airbus Helicopters ENT-18.1 à 18.5, confier les expéditions des pièces de rechange (Tle, C2.6 et C3.1).
// `node outils/test.mjs airbus` ne lance que ce bloc. Cadrage : `docs/briefs/airbus/CADRAGE-airbus-tle.md`. Aides : `outils/test/ikea/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (relues sur la grille et la méthode le 27/10/2026 ; le code les calcule, le test les écrit) :
// ENT-18.1 : EXP-1801 messagerie (30 €, minimum) ; EXP-1802 messagerie : 120 × 80 × 60 ÷ 4 000 = 144 kg taxables (12 kg réels), 0,80 × 144 = 115,20 € ;
//   EXP-1803 express (demain : la messagerie met deux jours) ; EXP-1804 messagerie : 82,5 kg volumétriques < 140 kg réels, 0,80 × 140 = 112 €.
// ENT-18.2 : EXP-1811 messagerie (220,5 → 221 kg, 176,80 € ; le coursier 240 €) ; EXP-1812 express (990 km : trop loin pour le coursier) ; EXP-1813
//   messagerie (2,80 m) ; EXP-1814 messagerie ; EXP-1815 messagerie (173,25 → 174 kg, 139,20 €).
// ENT-18.3 : EXP-1821 AOG → coursier 1,5 × 300 = 450 € ; EXP-1822 pale de 5,50 m → affrètement ; EXP-1823 batterie → messagerie, 25 kg, 30 € (minimum)
//   + 40 € = 70 €, déclarée ; EXP-1824 AOG à 1 150 km → express.
// ENT-18.4 : Sofiane : EXP-1831 (AOG) en messagerie 30 € → coursier 720 € ; EXP-1832 30 € → 210 kg taxables, 168 € ; EXP-1833 juste (30 €, 18 kg).
// ENT-18.5 : EXP-1841 messagerie 130 kg, 104 € ; EXP-1842 AOG → coursier ; EXP-1843 batterie → messagerie 25 kg, 70 €, déclarée ; EXP-1844 messagerie
//   (30 € ; le coursier 45 €).

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const S1 = { id: 'airbus-expeditions', act: '/activites/airbus-expeditions.js', n: '1' };
const S2 = { id: 'airbus-expeditions-mardi', act: '/activites/airbus-expeditions-mardi.js', n: '2' };
const S3 = { id: 'airbus-flux-particuliers', act: '/activites/airbus-flux-particuliers.js', n: '3' };
const S4 = { id: 'airbus-reservations-sofiane', act: '/activites/airbus-reservations-sofiane.js', n: '4' };
const S5 = { id: 'airbus-evaluation', act: '/activites/airbus-evaluation.js', n: '5' };
const OBJET = 'Ton compte rendu';

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S1.act, id: S1.id });
const { pg, Z, pause, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter } = P;

const OUV = { taxable: '40', aog: 'sol', gabarit: 'dedie', messagerie: 'groupage', md: 'expediteur', lettre: 'preuve' };
const R = {
  volumetrique: 'place', demain: 'delai', minimum: 'minimum', responsabilite: 'expediteur',
  longueur: 'longueur', 'coursier-proche': 'non', 'trop-loin': 'loin', groupage: 'rempli',
  'secours-au-sol': 'immobilise', pale: 'affretement', lithium: 'feu', avion: 'vol',
  reel: 'facture', 'aog-messagerie': 'au-sol', 'dire-sofiane': 'montrer', 'moins-aog': 'stock',
  priorite: 'aog',
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
const mont = (s, o = {}) => { S = s; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'ah-' + s.id, ...o }); };
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
const pr = (o) => Object.fromEntries(Object.entries(o).map(([e, p]) => [`presta-EXP-${e}`, p]));
const F1 = { liste: pr({ 1801: 'messagerie', 1802: 'messagerie', 1803: 'express', 1804: 'messagerie' }),
  nb: { 'tax-EXP-1802': 144, 'cout-EXP-1802': '115,20', 'tax-EXP-1804': 140, 'cout-EXP-1804': 112 } };
const F2 = { liste: pr({ 1811: 'messagerie', 1812: 'express', 1813: 'messagerie', 1814: 'messagerie', 1815: 'messagerie' }),
  nb: { 'tax-EXP-1811': 221, 'cout-EXP-1811': '176,8', 'tax-EXP-1815': 174, 'cout-EXP-1815': '139,20' } };
const F3 = { liste: pr({ 1821: 'coursier', 1822: 'affretement', 1823: 'messagerie', 1824: 'express' }), cases: { danger: ['EXP-1823'] },
  nb: { 'cout-EXP-1821': 450, 'tax-EXP-1823': 25, 'cout-EXP-1823': 70 } };
const F4 = { cases: { erreurs: ['EXP-1831', 'EXP-1832'] }, choix: { cause: 'reel' }, liste: pr({ 1831: 'coursier', 1832: 'messagerie', 1833: 'messagerie' }),
  nb: { 'cout-EXP-1831': 720, 'tax-EXP-1832': 210, 'cout-EXP-1832': 168, 'tax-EXP-1833': 18, 'cout-EXP-1833': 30 } };
const F5 = { liste: pr({ 1841: 'messagerie', 1842: 'coursier', 1843: 'messagerie', 1844: 'messagerie' }), cases: { danger: ['EXP-1843'] },
  nb: { 'tax-EXP-1841': 130, 'cout-EXP-1841': 104, 'tax-EXP-1843': 25, 'cout-EXP-1843': 70 } };

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-18.x : les cinq séances se chargent (Tle : guidage, entraînement, guidage, erreur induite, évaluation) ; jalons + questions = 20 ; entreprise n° 18 ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/airbus-ent18${s.n}.js`);
      const Q = await import(`/contenus/questions/ENT-18.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret, A.meta.ouverture, A.meta.reinitialisable],
        total: C.ETAPES.reduce((t, e) => t + e.poids, 0), part: Q.QUESTIONS.part || 0, ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id) });
    }
    return { out, e: I.ENTREPRISES.find((x) => x.n === 18) };
  }, [S1, S2, S3, S4, S5]);
  egal(r.out.map((x) => x.m), [
    ['ENT-18.1', ['tle'], ['C2.6'], 'guidage', 20, undefined, 'ENT-18.1', true, 'prof', true],
    ['ENT-18.2', ['tle'], ['C2.6'], 'entrainement', 20, undefined, 'ENT-18.2', true, 'prof', undefined],
    ['ENT-18.3', ['tle'], ['C3.1', 'C2.6'], 'guidage', 20, undefined, 'ENT-18.3', true, 'prof', undefined],
    ['ENT-18.4', ['tle'], ['C2.6', 'C3.1'], 'erreur', 20, undefined, 'ENT-18.4', true, 'prof', undefined],
    ['ENT-18.5', ['tle'], ['C2.6', 'C3.1'], 'evaluation', 20, true, 'ENT-18.5', true, 'prof', undefined],
  ], 'meta');
  egal(r.out.map((x) => x.total + x.part + x.ouvPart), [20, 20, 20, 20, 20], 'jalons + questions');
  egal(r.out.map((x) => x.noter), ['undefined', 'undefined', 'undefined', 'undefined', 'function'], 'noter seulement en évaluation');
  egal(r.out.map((x) => x.reg), [true, true, true, true, true], 'au registre');
  egal([r.e.nom, r.e.logo], ['Airbus Helicopters', './contenus/trames/logos/airbus-texte.svg'], 'entreprise n° 18');
});

await v('ENT-18.x : les données — poids volumétrique et taxable, minimums, supplément, prestataires possibles, AOG au plus rapide, sinon au moins cher ; les réservations de Sofiane (valeurs écrites à la main)', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/airbus-donnees.js');
    const b = (D) => { const B = M.bilan(D); return D.expeditions.map((E) => [B.presta[E.no], B.off[E.no].taxable ?? null, B.off[E.no].cout]); };
    const J = M.travailDeSofiane(M.D184);
    return { b1: b(M.D181), b2: b(M.D182), b3: b(M.D183), b4: b(M.D184), b5: b(M.D185), j: [J.faux, J.couts],
      v: [M.volumetrique({ L: 120, l: 80, h: 60, kg: 12 }, 'messagerie'), M.volumetrique({ L: 120, l: 80, h: 60, kg: 12 }, 'express'), M.taxable({ L: 140, l: 90, h: 70, kg: 15 }, 'messagerie')],
      x: [M.offre(M.D183.expeditions[1], 'messagerie').pourquoi, M.offre(M.D182.expeditions[1], 'coursier').pourquoi, M.offre(M.D181.expeditions[2], 'messagerie').pourquoi] };
  });
  egal(r.v, [144, 115.2, 221], 'volumétrique (÷ 4 000, ÷ 5 000) et taxable arrondi au kg supérieur');
  egal(r.x, ['trop long', 'trop loin', 'trop lent'], 'les exclusions');
  egal(r.b1, [['messagerie', 6, 30], ['messagerie', 144, 115.2], ['express', 2, 60], ['messagerie', 140, 112]], 'ENT-18.1');
  egal(r.b2, [['messagerie', 221, 176.8], ['express', 12, 60], ['messagerie', 63, 50.4], ['messagerie', 8, 30], ['messagerie', 174, 139.2]], 'ENT-18.2');
  egal(r.b3, [['coursier', null, 450], ['affretement', null, 1640], ['messagerie', 25, 70], ['express', 14, 60]], 'ENT-18.3');
  egal(r.b4, [['coursier', null, 720], ['messagerie', 210, 168], ['messagerie', 18, 30]], 'ENT-18.4');
  egal(r.j, [['EXP-1831', 'EXP-1832'], { 'EXP-1831': 30, 'EXP-1832': 30, 'EXP-1833': 30 }], 'Sofiane');
  egal(r.b5, [['messagerie', 130, 104], ['coursier', null, 540], ['messagerie', 25, 70], ['messagerie', 15, 30]], 'ENT-18.5');
});

await v('ENT-18.x : les documents — la liste ne dit pas à qui confier ; les réservations de Sofiane ne disent pas qu’elles sont fausses ; le droit parle du contrat de transport et de l’ADR ; mentions ; phrases toutes différentes', async () => {
  const r = await pg.evaluate(async () => {
    const h = (S, id) => { const d = S.DOCUMENTS.find((x) => x.id === id); const e = document.createElement('div'); e.innerHTML = d.html; return e.textContent.replace(/\s+/g, ' '); };
    const C = {};
    for (const n of ['1', '2', '3', '4', '5']) C[n] = await import(`/contenus/airbus-ent18${n}.js`);
    const doubles = [];
    for (const n of ['1', '2', '3', '4', '5']) {
      const m = C[n].VOLET.declencheurs.find((d) => d.id === 'compte').semer('Léa').mails[0];
      for (const l of m.phrases.lignes) if (new Set(l.choix).size !== l.choix.length) doubles.push(`18.${n} ${l.id} : ${l.choix.join(' | ')}`);
    }
    return { ids: [C['1'].DOCUMENTS.map((d) => d.id), C['4'].DOCUMENTS.map((d) => d.id)], exp: h(C['3'], 'expeditions'), sof: h(C['4'], 'reservations-sofiane'),
      droit: h(C['1'], 'droit'), poste: h(C['1'], 'poste'), tarifs: h(C['1'], 'tarifs'), doubles };
  });
  egal(r.ids, [['poste', 'expeditions', 'tarifs', 'regle', 'droit'], ['poste', 'expeditions', 'tarifs', 'regle', 'reservations-sofiane', 'droit']], 'documents');
  vrai(!/[Mm]essagerie|[Cc]oursier|[Aa]ffrètement|[Ee]xpress/.test(r.exp) && /AOG/.test(r.exp) && /lithium/.test(r.exp), 'la liste des expéditions : ' + r.exp);
  vrai(/EXP-1831/.test(r.sof) && !/erreur|faux|mal/i.test(r.sof), 'les réservations de Sofiane : ' + r.sof);
  vrai(/contrat de transport/.test(r.droit) && /ADR/.test(r.droit) && /lettre de voiture/.test(r.droit), 'le droit');
  for (const k of ['exp', 'sof', 'tarifs']) vrai(/CONSTRUIT/.test(r[k]) && /reconstitution/.test(r[k]), `mention sur ${k}`);
  vrai(/Marignane/.test(r.poste) && /361 hélicoptères/.test(r.poste), 'les faits réels dans « Ton poste »');
  egal(r.doubles, [], 'phrases en double');
});

// ─────────────────────────────────────────────────────────── ENT-18.1
await v('ENT-18.1 : inaction → 0/20 ; un message de Nathalie avec les pièces ; parcours juste → 20/20 et le message de fin ; aucun message ne juge', async () => {
  await mont(S1, { sansOuverture: true });
  const n0 = await noter(S1.act);
  egal([n0.score, n0.max], [0, 20], 'note');
  vrai(!Object.values(n0.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n0.detail));
  await mont(S1);
  egal((await entrants()).map((m) => [m.from, m.pieces]), [['Nathalie, responsable des expéditions', ['poste', 'expeditions', 'tarifs', 'regle']]], 'messages');
  await jouer(F1);
  const n = await noter(S1.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail)); egal(n.max, 20, 'sur');
  const E = await entrants();
  egal(E.map((m) => m.subject), ['Quatre colis à confier ce matin', OBJET, 'Merci'], 'messages');
  vrai(!E.some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct)\b/i.test(m.text)), 'un message juge');
});

await v('ENT-18.1 : sabotages — le capot au poids réel (12 kg, 30 €) (−3) ; EXP-1803 en messagerie (−1,5) ; compte rendu « le moins cher partout » (−4) ; questions toutes fausses (−4)', async () => {
  const essai = async (F, compte, tombes, score, quoi) => {
    await mont(S1);
    await jouer(F, compte);
    egal(ko(await detail()), tombes, `${quoi} : jalons tombés`);
    proche((await noter(S1.act)).score, score, `${quoi} : note`);
  };
  await essai({ ...F1, nb: { ...F1.nb, 'tax-EXP-1802': 12, 'cout-EXP-1802': 30 } }, {}, ['tax-EXP-1802', 'cout-EXP-1802'], 17, 'poids réel');
  await essai({ ...F1, liste: { ...F1.liste, 'presta-EXP-1803': 'messagerie' } }, {}, ['presta-EXP-1803'], 18.5, 'messagerie trop lente');
  await essai(F1, { prestas: 1 }, ['compte-rendu'], 16, 'le moins cher partout');
  const sauve = { ...R };
  Object.assign(R, { volumetrique: 'erreur', demain: 'poids', minimum: 'taxe', responsabilite: 'personne' });
  try { await mont(S1); await jouer(F1); } finally { Object.assign(R, sauve); }
  proche((await noter(S1.act)).score, 16, 'trois fausses (la réflexion ne compte pas)');
});

// ─────────────────────────────────────────────────────────── ENT-18.2
await v('ENT-18.2 : parcours juste → 20/20 ; le coursier pour EXP-1811 (−1,2) ; EXP-1815 au poids réel (28 kg, 30 €) (−3)', async () => {
  await mont(S2);
  await jouer(F2);
  proche((await noter(S2.act)).score, 20, 'parcours juste');
  await mont(S2);
  await jouer({ ...F2, liste: { ...F2.liste, 'presta-EXP-1811': 'coursier' }, nb: { ...F2.nb, 'tax-EXP-1815': 28, 'cout-EXP-1815': 30 } });
  egal(ko(await detail()), ['presta-EXP-1811', 'tax-EXP-1815', 'cout-EXP-1815'], 'coursier et poids réel'); proche((await noter(S2.act)).score, 15.8, 'coursier et poids réel');
});

// ─────────────────────────────────────────────────────────── ENT-18.3
await v('ENT-18.3 : parcours juste → 20/20 ; l’AOG de Grenoble en messagerie (−2) ; la batterie sans supplément (30 €) et sans déclaration (−1,5 −2)', async () => {
  await mont(S3);
  await jouer(F3);
  proche((await noter(S3.act)).score, 20, 'parcours juste');
  await mont(S3);
  await jouer({ ...F3, liste: { ...F3.liste, 'presta-EXP-1821': 'messagerie' }, cases: { danger: [] }, nb: { ...F3.nb, 'cout-EXP-1823': 30 } });
  egal(ko(await detail()), ['presta-EXP-1821', 'cout-EXP-1823', 'danger'], 'AOG et batterie'); proche((await noter(S3.act)).score, 14.5, 'AOG et batterie');
});

// ─────────────────────────────────────────────────────────── ENT-18.4
await v('ENT-18.4 : parcours juste → 20/20 ; seule EXP-1831 trouvée et « le minimum » pour cause (−3 −2) ; les réservations de Sofiane recopiées (−1 −1,5 −0,75 −1,5) et compte rendu « justes » (−2)', async () => {
  await mont(S4);
  await jouer(F4);
  proche((await noter(S4.act)).score, 20, 'parcours juste');
  await mont(S4);
  await jouer({ ...F4, cases: { erreurs: ['EXP-1831'] }, choix: { cause: 'minimum' } });
  egal(ko(await detail()), ['erreurs', 'cause'], 'une seule et mauvaise cause'); proche((await noter(S4.act)).score, 15, 'une seule et mauvaise cause');
  await mont(S4);
  await jouer({ ...F4, liste: { ...F4.liste, 'presta-EXP-1831': 'messagerie' }, nb: { ...F4.nb, 'cout-EXP-1831': 30, 'tax-EXP-1832': 9, 'cout-EXP-1832': 30 } }, { erreur: 1 });
  egal(ko(await detail()), ['presta-EXP-1831', 'cout-EXP-1831', 'tax-EXP-1832', 'cout-EXP-1832', 'compte-rendu'], 'Sofiane recopié');
  proche((await noter(S4.act)).score, 13.25, 'Sofiane recopié');
});

// ─────────────────────────────────────────────────────────── ENT-18.5 (copie rendue)
await v('ENT-18.5 : « Avant de commencer » noté (3 points) ; inaction → 3/20 et aucun jalon juste ; parcours juste → 20/20 ; l’AOG en express et EXP-1844 au coursier → 17', async () => {
  await mont(S5);
  let n = await noter(S5.act);
  proche(n.score, 3, 'ouverture seule : ' + JSON.stringify(n.detail));
  vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
  await jouer(F5);
  n = await noter(S5.act);
  proche(n.score, 20, 'parcours juste : ' + JSON.stringify(n.detail));
  await mont(S5);
  await jouer({ ...F5, liste: { ...F5.liste, 'presta-EXP-1842': 'express', 'presta-EXP-1844': 'coursier' } });
  egal(ko(await detail()), ['presta-EXP-1842', 'presta-EXP-1844'], 'AOG et coursier');
  proche((await noter(S5.act)).score, 17, 'AOG et coursier');
});

}
