// Suite de tests de Prepalog — bloc « cdiscount-noel » : Cdiscount ENT-2.7 à 2.10, le pic de Noël (1re, C2.2 optimiser les préparations).
// `node outils/test.mjs cdiscount-noel` ne lance que ce bloc. Cadrage : `docs/briefs/cdiscount-noel/CADRAGE-cdiscount-noel-1re.md`. Aides :
// `outils/test/ikea/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (recalculées au brouillon le 26/10/2026 ; le code les calcule, le test les écrit) :
// ENT-2.7 : 2 000 lignes ; ECO-BT-01 700 + BAT-10K 520 + CHG-20W 380 = 1 600 = 80 % ; 3 réf. sur 12 = 25 % ; M-01 ECO, M-02 BAT, M-03 CHG ;
//   marche avant 2×(700×36 + 520×48 + 380×28) = 121 600 m ; après 2×(700×4 + 520×8 + 380×12) = 23 040 m.
// ENT-2.8 : commande par commande 24+96+72+72+96+80+96+72+88+96 = 792 m ; deux lots de 5, chacun jusqu'à M-12 (48 m) : 192 m ; marche gagnée
//   600 s = 10 min ; tri 16 lignes × 15 s = 4 min ; méthode : par lots.
// ENT-2.9 : 9 600 ÷ 420 = 22,86 → 23 préparateurs, 14 intérimaires ; Yanis : 6 000 colis ÷ 420 = 14,29 → 14 ; 9 600 − 14 × 420 = 3 720 lignes en retard.
// ENT-2.10 : 1 500 lignes ; GOU-ISO-75 750 + CLA-SF-01 450 = 1 200 = 80 % ; M-01 et M-02 ; 520 m contre 160 m (lots de 4) ; 7 200 ÷ 420 = 17,14 → 18,
//   9 intérimaires (piège : 4 500 colis → 11, soit 2).

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const S7 = { id: 'cdiscount-bon-endroit', act: '/activites/cdiscount-bon-endroit.js', n: '7', c: '27' };
const S8 = { id: 'cdiscount-par-lots', act: '/activites/cdiscount-par-lots.js', n: '8', c: '28' };
const S9 = { id: 'cdiscount-calcul-yanis', act: '/activites/cdiscount-calcul-yanis.js', n: '9', c: '29' };
const S10 = { id: 'cdiscount-evaluation-noel', act: '/activites/cdiscount-evaluation-noel.js', n: '10', c: '210' };
const OBJET = 'Ta proposition';

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S7.act, id: S7.id });
const { pg, Z, pause, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter } = P;

const OUV = { ligne: '2', 'classe-a': 'peu', 'pres-du-poste': 'demandes', 'par-lots': 'plusieurs', motif: 'accroissement', employeur: 'agence' };
const R = {
  'trier-dabord': 'trier', 'pourquoi-pres': 'marche', 'les-pousses': 'peu', 'interim-motif': 'temporaire',
  'le-plus-loin': '72', 'pourquoi-tri': 'melange', express: 'seule', sante: 'sante',
  'lignes-pas-colis': 'marche', arrondi: 'reste', 'dire-erreur': 'dire', 'pas-assez': 'heures',
  'en-premier': 'interim',
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
let S = S7;
const mont = (s, o = {}) => { S = s; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'cn-' + s.id, ...o }); };
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

const F7 = { cases: { classeA: ['ECO-BT-01', 'BAT-10K', 'CHG-20W'] }, liste: { m1: 'ECO-BT-01', m2: 'BAT-10K', m3: 'CHG-20W' },
  nb: { pctLignes: 80, pctRefs: 25, avant: '121 600', apres: 23040 } };
const F8 = { choix: { methode: 'lots' }, nb: { cmd: 792, lots: 192, marche: 10, tri: 4 } };
const F9 = { cases: { erreurs: ['colis', 'arrondi'] }, nb: { besoin: 23, interim: 14, retard: '3 720' } };
const F10 = { cases: { classeA: ['GOU-ISO-75', 'CLA-SF-01'], emplacements: ['M-01', 'M-02'] }, choix: { methode: 'lots' },
  nb: { pctLignes: '80', cmd: 520, lots: 160, besoin: 18, interim: 9 } };

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-2.7 à 2.10 : les quatre séances se chargent (1re, C2.2 : guidage, entraînement, erreur induite, évaluation) ; jalons + questions = 20 ; au registre, rangées après ENT-2.6', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const toutes = (await I.chargerActivites()).map((a) => a.meta);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/cdiscount-ent2${s.n}.js`);
      const Q = await import(`/contenus/questions/ENT-2.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret, A.meta.ouverture],
        total: C.ETAPES.reduce((t, e) => t + e.poids, 0), part: Q.QUESTIONS.part || 0, ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter,
        reg: toutes.some((m) => m.id === s.id), cat: Object.keys(C.CATALOGUE.VM).length });
    }
    return { out, ordre: toutes.filter((m) => /^ENT-2\./.test(m.code)).map((m) => m.code) };
  }, [S7, S8, S9, S10]);
  egal(r.out.map((x) => x.m), [
    ['ENT-2.7', ['1re'], ['C2.2'], 'guidage', 20, undefined, 'ENT-2.7', true, 'prof'],
    ['ENT-2.8', ['1re'], ['C2.2'], 'entrainement', 20, undefined, 'ENT-2.8', true, 'prof'],
    ['ENT-2.9', ['1re'], ['C2.2'], 'erreur', 20, undefined, 'ENT-2.9', true, 'prof'],
    ['ENT-2.10', ['1re'], ['C2.2'], 'evaluation', 20, true, 'ENT-2.10', true, 'prof'],
  ], 'meta');
  egal(r.out.map((x) => x.total + x.part + x.ouvPart), [20, 20, 20, 20], 'jalons + questions');
  egal(r.out.map((x) => x.noter), ['undefined', 'undefined', 'undefined', 'function'], 'noter seulement en évaluation');
  egal(r.out.map((x) => x.reg), [true, true, true, true], 'au registre');
  egal(r.out.map((x) => x.cat), [12, 12, 1, 10], 'catalogue réduit à l’allée');
  egal(r.ordre.slice(-5), ['ENT-2.6', 'ENT-2.7', 'ENT-2.8', 'ENT-2.9', 'ENT-2.10'], 'ordre');
});

await v('ENT-2.x Noël : les calculs (valeurs écrites à la main) — classe A, implantation, marche, lots, effectif et calcul de Yanis', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/cdiscount-noel-donnees.js');
    const a = (D) => { const A = M.abc(D), I = M.implantation(D); return [A.classeA, A.pctLignes, A.pctRefs, I.places, I.avant, I.apres]; };
    const p = (D) => { const P = M.preparation(D); return [P.cmd, P.lot, P.marche, P.tri, P.methode]; };
    const e = (D) => { const E = M.effectif(D); return [E.besoin, E.interim, E.collegue ? [E.collegue.besoin, E.collegue.interim, E.retard] : null]; };
    return { a7: a(M.D27), a10: a(M.D210), p8: p(M.D28), p10: p(M.D210), e9: e(M.D29), e10: e(M.D210) };
  });
  egal(r.a7, [['ECO-BT-01', 'BAT-10K', 'CHG-20W'], 80, 25, { 'ECO-BT-01': 'M-01', 'BAT-10K': 'M-02', 'CHG-20W': 'M-03' }, 121600, 23040], 'ENT-2.7');
  egal(r.a10, [['GOU-ISO-75', 'CLA-SF-01'], 80, 20, { 'GOU-ISO-75': 'M-01', 'CLA-SF-01': 'M-02' }, 72000, 13200], 'ENT-2.10 ABC');
  egal(r.p8, [792, 192, 10, 4, 'lots'], 'ENT-2.8');
  egal(r.p10, [520, 160, 6, 2.5, 'lots'], 'ENT-2.10 lots');
  egal(r.e9, [23, 14, [14, 5, 3720]], 'ENT-2.9');
  egal(r.e10, [18, 9, null], 'ENT-2.10 effectif');
});

await v('ENT-2.x Noël : les documents — l’export n’est pas trié et ne donne ni total ni pourcentage ; le droit cite L1251-6 ; chaque document reconstitué porte sa mention', async () => {
  const r = await pg.evaluate(async () => {
    const h = (S, id) => { const d = S.DOCUMENTS.find((x) => x.id === id); const e = document.createElement('div'); e.innerHTML = d.html; return e.textContent.replace(/\s+/g, ' '); };
    const S7 = await import('/contenus/cdiscount-ent27.js');
    const S9 = await import('/contenus/cdiscount-ent29.js');
    const S10 = await import('/contenus/cdiscount-ent210.js');
    return { ids: [S7.DOCUMENTS.map((d) => d.id), S10.DOCUMENTS.map((d) => d.id)], lignes: h(S7, 'lignes'), droit: h(S7, 'droit'), allee: h(S7, 'allee'),
      poste: h(S7, 'poste'), yanis: h(S9, 'calcul-yanis'), prev: h(S10, 'prevision'), cmd: h(S10, 'commandes') };
  });
  egal(r.ids, [['poste', 'lignes', 'allee', 'methode-abc', 'droit'],
    ['poste', 'lignes', 'allee', 'commandes', 'prevision', 'methode-abc', 'methode-lots', 'methode-effectif', 'droit']], 'documents');
  vrai(r.lignes.indexOf('PIL-AA-8') < r.lignes.indexOf('ECO-BT-01'), 'l’export est dans l’ordre des emplacements');
  vrai(!/2 000|%|total|classe/i.test(r.lignes), 'l’export donne un total ou une classe : ' + r.lignes.slice(0, 300));
  vrai(r.droit.includes('tâche précise et temporaire') && r.droit.includes('Accroissement temporaire') && /L1251-6/.test(r.droit), 'droit : ' + r.droit.slice(0, 200));
  for (const k of ['lignes', 'allee', 'yanis', 'prev', 'cmd']) vrai(/CONSTRUIT/.test(r[k]) && /reconstitution/.test(r[k]), `mention sur ${k}`);
  vrai(/Skypod/.test(r.poste) && /156 commandes par seconde/.test(r.poste), 'les faits réels dans « Ton poste »');
  vrai(/6 000/.test(r.yanis) && /14 préparateurs/.test(r.yanis) && !/9 600/.test(r.yanis), 'le calcul de Yanis : ' + r.yanis);
});

// ─────────────────────────────────────────────────────────── ENT-2.7
await v('ENT-2.7 : inaction → 0/20 ; à l’ouverture, un message de Nadia avec les pièces ; parcours juste → 20/20 et le message de fin ; aucun message ne juge', async () => {
  await mont(S7, { sansOuverture: true });
  const n0 = await noter(S7.act);
  egal([n0.score, n0.max], [0, 20], 'note');
  vrai(!Object.values(n0.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n0.detail));
  await mont(S7);
  egal((await entrants()).map((m) => [m.from, m.pieces]), [['Nadia Ferrand, cheffe d’équipe', ['poste', 'lignes', 'allee', 'methode-abc', 'droit']]], 'messages');
  vrai(!(await entrants()).some((m) => m.subject === OBJET), 'la demande de proposition avant la fiche');
  await jouer(F7);
  const n = await noter(S7.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail)); egal(n.max, 20, 'sur');
  const E = await entrants();
  egal(E.map((m) => m.subject), ['Le fond de l’allée, à revoir avant Noël', OBJET, 'Merci'], 'messages');
  vrai(!E.some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct)\b/i.test(m.text)), 'un message juge');
});

await v('ENT-2.7 : sabotages — SOU-SF-02 ajouté à la classe A (−4) ; M-01 et M-02 inversés (−3) ; marche avant et après aller simple (−3) ; proposition fausse (−1,5)', async () => {
  const essai = async (F, compte, tombes, score, quoi) => {
    await mont(S7);
    await jouer(F, compte);
    const d = await detail();
    egal(ko(d), tombes, `${quoi} : jalons tombés`);
    proche((await noter(S7.act)).score, score, `${quoi} : note`);
  };
  await essai({ ...F7, cases: { classeA: [...F7.cases.classeA, 'SOU-SF-02'] } }, {}, ['classeA'], 16, 'quatre en A');
  await essai({ ...F7, liste: { m1: 'BAT-10K', m2: 'ECO-BT-01', m3: 'CHG-20W' } }, {}, ['m1', 'm2'], 17, 'inversés');
  await essai({ ...F7, nb: { ...F7.nb, avant: 60800, apres: 11520 } }, {}, ['avant', 'apres'], 17, 'aller simple');
  await essai(F7, { gain: 1 }, ['compte-rendu'], 18.5, 'proposition fausse');
});

await v('ENT-2.7 : questions au fil — les trois notées valent 4 points : toutes fausses → 16 ; la réflexion (intérim) ne compte pas', async () => {
  const sauve = { ...R };
  Object.assign(R, { 'trier-dabord': 'haut', 'pourquoi-pres': 'egal', 'les-pousses': 'rien', 'interim-motif': 'interdit' });
  try { await mont(S7); await jouer(F7); } finally { Object.assign(R, sauve); }
  proche((await noter(S7.act)).score, 16, 'trois fausses');
});

// ─────────────────────────────────────────────────────────── ENT-2.8
await v('ENT-2.8 : parcours juste → 20/20 ; une seule tournée par commande comptée « aller simple » (396) fait tomber la marche ; « commande par commande » choisi → 16', async () => {
  await mont(S8);
  await jouer(F8);
  let n = await noter(S8.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail));
  await mont(S8);
  await jouer({ ...F8, nb: { ...F8.nb, cmd: 396 } });
  egal(ko(await detail()), ['cmd'], 'aller simple'); proche((await noter(S8.act)).score, 16.5, 'aller simple');
  await mont(S8);
  await jouer({ ...F8, choix: { methode: 'commande' } }, { methode: 1 });
  egal(ko(await detail()), ['methode', 'compte-rendu'], 'commande par commande'); proche((await noter(S8.act)).score, 16, 'commande par commande');
});

// ─────────────────────────────────────────────────────────── ENT-2.9
await v('ENT-2.9 : parcours juste → 20/20 ; une seule erreur cochée (−4) ; 22 préparateurs (arrondi vers le bas) et 13 intérimaires (−7) ; « le calcul est juste » → −3', async () => {
  await mont(S9);
  await jouer(F9);
  proche((await noter(S9.act)).score, 20, 'parcours juste');
  await mont(S9);
  await jouer({ ...F9, cases: { erreurs: ['colis'] } });
  egal(ko(await detail()), ['erreurs'], 'une seule erreur'); proche((await noter(S9.act)).score, 16, 'une seule erreur');
  await mont(S9);
  await jouer({ ...F9, nb: { ...F9.nb, besoin: 22, interim: 13 } });
  egal(ko(await detail()), ['besoin', 'interim'], 'arrondi'); proche((await noter(S9.act)).score, 13, 'arrondi');
  await mont(S9);
  await jouer(F9, { erreur: 1 });
  egal(ko(await detail()), ['compte-rendu'], 'calcul dit juste'); proche((await noter(S9.act)).score, 17, 'calcul dit juste');
});

// ─────────────────────────────────────────────────────────── ENT-2.10 (copie rendue)
await v('ENT-2.10 : « Avant de commencer » noté (3 points) ; inaction → 3/20 et aucun jalon juste ; parcours juste → 20/20 ; le piège des colis (11 préparateurs, 2 intérimaires) → 14', async () => {
  await mont(S10);
  let n = await noter(S10.act);
  proche(n.score, 3, 'ouverture seule : ' + JSON.stringify(n.detail));
  vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
  await jouer(F10);
  n = await noter(S10.act);
  proche(n.score, 20, 'parcours juste : ' + JSON.stringify(n.detail));
  await mont(S10);
  await jouer({ ...F10, nb: { ...F10.nb, besoin: 11, interim: 2 } }, { interim: 3 });
  egal(ko(await detail()), ['besoin', 'interim', 'compte-rendu'], 'piège des colis');
  proche((await noter(S10.act)).score, 14, 'piège des colis');
});

}
