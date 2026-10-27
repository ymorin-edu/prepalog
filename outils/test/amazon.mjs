// Suite de tests de Prepalog — bloc « amazon » : Amazon ENT-19.1 à 19.10, le centre robotisé de Brétigny-sur-Orge (CAP OL).
// `node outils/test.mjs amazon` ne lance que ce bloc. Cadrage : `docs/briefs/amazon/CADRAGE-amazon-cap.md`. Aides : `outils/test/ikea/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (relues sur les armoires, les cartons et les règles le 27/10/2026 ; le code les calcule, le test les écrit) :
// Règles : 3 places par case (petit 1, moyen 2, grand 3), jamais deux articles de la même famille dans une case, plus de 5 kg en A ou B.
// ENT-19.3 (P-0418) : coque transparente B2, livre de poche D1, haltère B1, peluche C1, lampe C3.
// ENT-19.4 (P-1290) : t-shirt M D2, haltère B2, tasse de côté (abîmée), gourde verte C2, plaid D1, puzzle A1 ; gourdes vertes 2 + 3 + 1 = 6 pour 7 : il en manque.
// ENT-19.5, jeu 0 (P-3051) : kettlebell A2, coque C1, cafetière de côté, livre D1, chargeur D2 ; câbles 2 + 2 + 1 = 5 pour 6 (manque).
//   jeu 1 (P-3188) : croquettes B1, gourde C2, t-shirt L D1, tasse de côté, puzzle D3 ; livres 1 + 2 + 1 = 4 pour 4 (juste).
//   jeu 2 (P-3420) : haltère A3, câble D2, peluche B2, bougie de côté, poêle A1 ; tasses 1 + 1 + 2 = 4 pour 3 (trop).
// ENT-19.6 : prendre, autre (coques noires), vide, prendre ; bacs C-111 et C-112.
// ENT-19.7 : 403-1 enveloppe, 403-2 M (gourde 25 cm), 403-3 L (lampe 45 cm), 403-4 S (tasse, à caler) ; 403-2 : 0,35 + 0,25 = 0,60 pour 0,61 → part ;
//   403-3 : 1,2 + 0,5 = 1,70 pour 1,25 → sort.
// ENT-19.8 : prendre, autre (t-shirt L), abîmé, prendre, vide ; 512-1 M, 512-2 M (cafetière, à caler), 512-3 S (jeu de cartes + câble : 15 × 10 × 5) ;
//   512-1 : 0,3 + 0,25 = 0,55 pour 0,82 → sort.
// ENT-19.9 : 9 500 − 2 700 = 6 800 ; 9 500 ÷ 40 = 237,5 (237 ou 238).
// ENT-19.10, jeu 0 : prendre, vide, autre, abîmé ; 780-1 enveloppe (0,19 pour 0,36 → sort), 780-2 M (cafetière, à caler), 780-3 L (1,40 pour 1,42 → part).

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const SEANCES = [
  ['amazon-bienvenue', '1'], ['amazon-poste', '2'], ['amazon-ranger', '3'], ['amazon-bac-mardi', '4'], ['amazon-evaluation-stock', '5'],
  ['amazon-prelever', '6'], ['amazon-emballer', '7'], ['amazon-jeudi', '8'], ['amazon-robots', '9'], ['amazon-evaluation-commandes', '10'],
].map(([id, n]) => ({ id, n, act: `/activites/${id}.js`, pre: n === '10' ? '1910' : `19${n}` }));
const S_ = Object.fromEntries(SEANCES.map((s) => [s.n, s]));
const OBJET = 'Ton compte rendu';

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S_['1'].act, id: S_['1'].id });
const { pg, Z, pause, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter, jouerCarte, carteFaux, carteJuste, lire, aller, ouvrirParMessage } = P;

const OUV = { vient: 'armoire', aleatoire: 'plusieurs', adresse: 'case', barriere: 'jamais', solver: 'collegue', carton: 'grand' };
// Les réponses au fil, séance par séance (les réflexions : le premier choix, non noté).
const RF = {
  1: { 'case-vide': 'theo', pesee: 'verifier', change: 'poste', pres: 'clients' },
  2: { 'pourquoi-barriere': 'heurte', mission: 'ecran', 'pourquoi-rdv': 'organiser', loi: 'deux' },
  3: { haltere: 'dos', coques: 'erreur', scan: 'perdu', 'pourquoi-aleatoire': 'place' },
  4: { abime: 'client', plusieurs: 'aleatoire', ecart: 'vrai', 'pourquoi-inventaire': 'client' },
  5: { apres: 'regles' },
  6: { ressemble: 'client', vide: 'stock', photo: 'verifier', marche: 'marcher' },
  7: { petit: 'moins', leger: 'manque', caler: 'fragile', tri: 'recycle' },
  8: { taille: 'retour', deux: 'ensemble', lourd: 'trop', rythme: 'juste' },
  9: { saisonnier: 'cdd', moyenne: 'non', zone: 'securite', cnil: 'limite' },
  10: { apres: 'ranger' },
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
const mont = (s, o = {}) => { S = s; R = { ...RF[s.n], ...(o.fil || {}) }; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'az-' + s.id, ...o }); };
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
// Le parcours : `pas` = [{ sujet, fiche }] dans l'ordre de la séance (le premier s'ouvre par le menu), `carte` = fautes de la carte (ENT-19.1),
// `compte` = { ligne: rang du choix } (0 = la phrase juste).
async function jouer(pas, { carte = null, apresPremier = null, compte = {} } = {}) {
  for (let i = 0; i < pas.length; i++) {
    const p = pas[i];
    if (i === 0) await allerV('fiche'); else await ouvrirParMessage(p.sujet, `fiche:f${S.pre}-${p.id}`);
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
const cases = (L) => Object.fromEntries(L.map((x, i) => [`case-${i + 1}`, x]));

const P1 = [
  { id: 'qui', fiche: { liste: { 'tache-1': 'theo', 'tache-2': 'karima', 'tache-3': 'ines', 'tache-4': 'moi' } } },
  { id: 'voyage', sujet: 'Le voyage d’un article', fiche: { ordre: { ordre: ['reception', 'rangement', 'prelevement', 'emballage', 'pesee', 'expedition'] } } },
  { id: 'robots', sujet: 'Les robots', fiche: { cases: { robots: ['apporte', 'allees', 'systeme'] } } },
];
const P2 = [
  { id: 'securite', fiche: { liste: { 'secu-1': 'change', 'secu-2': 'aide', 'secu-3': 'dos', 'secu-4': 'signale' } } },
  { id: 'ecran', sujet: 'Ton écran', fiche: { liste: { mission: 'rangement', armoire: 'P-0418', bac: 'T-77' }, nb: { articles: 12 } } },
  { id: 'plani', sujet: 'Les camions du matin', fiche: { liste: { quai: '14' }, choix: { retard: 'refus' }, nb: { palettes: 14 } } },
];
const P3 = (rang = ['B2', 'D1', 'B1', 'C1', 'C3']) => [
  { id: 'ranger', fiche: { liste: cases(rang) } },
  { id: 'gestes', sujet: 'Les gestes', fiche: { ordre: { ordre: ['scan-article', 'pose', 'scan-case', 'adresse'] } } },
  { id: 'adresse', sujet: 'L’adresse', fiche: { liste: { 'adr-1': 'adresse', 'adr-2': 'adresse' } } },
];
const P4 = (rang = ['D2', 'B2', 'cote', 'C2', 'D1', 'A1'], inv = { compte: 6, ecart: 'manque' }) => [
  { id: 'ranger', fiche: { liste: cases(rang) } },
  { id: 'inventaire', sujet: 'Un inventaire', fiche: { nb: { compte: inv.compte }, choix: { ecart: inv.ecart } } },
  { id: 'adresse', sujet: 'L’adresse', fiche: { liste: { adr: 'adresse' } } },
];
// ENT-19.5 : les trois jeux. `uid` = la graine qui tire ce jeu (vérifiée par le numéro d'armoire).
const J5 = [
  { uid: 'g', armoire: 'P-3051', secu: ['aide', 'dos'], rang: ['A2', 'C1', 'cote', 'D1', 'D2'], inv: { compte: 5, ecart: 'manque' } },
  { uid: 'a', armoire: 'P-3188', secu: ['signale', 'attends'], rang: ['B1', 'C2', 'D1', 'cote', 'D3'], inv: { compte: 4, ecart: 'juste' } },
  { uid: 'b', armoire: 'P-3420', secu: ['aide', 'attends'], rang: ['A3', 'D2', 'B2', 'cote', 'A1'], inv: { compte: 4, ecart: 'trop' } },
];
const P5 = (J) => [
  { id: 'securite', fiche: { liste: { 'secu-1': J.secu[0], 'secu-2': J.secu[1] } } },
  { id: 'ranger', sujet: 'Ton bac', fiche: { liste: cases(J.rang) } },
  { id: 'inventaire', sujet: 'Un inventaire', fiche: { nb: { compte: J.inv.compte }, choix: { ecart: J.inv.ecart } } },
  { id: 'adresse', sujet: 'L’adresse', fiche: { liste: { adr: 'adresse' } } },
];
const P6 = (lignes = ['prendre', 'autre', 'vide', 'prendre']) => [
  { id: 'lignes', fiche: { liste: Object.fromEntries(lignes.map((x, i) => [`ligne-${i + 1}`, x])) } },
  { id: 'bacs', sujet: 'Les bacs', fiche: { liste: { 'bac-1': 'C-111', 'bac-4': 'C-112' } } },
  { id: 'gestes', sujet: 'Les gestes', fiche: { ordre: { ordre: ['regarde', 'compare', 'scan', 'bac'] } } },
];
const P7 = ({ cartons = { '403-1': 'env', '403-2': 'M', '403-3': 'L', '403-4': 'S' }, caler = ['403-4'], pesees = { '403-2': 'part', '403-3': 'sortir' }, eco = ['film', 'chutes', 'taille'] } = {}) => [
  { id: 'cartons', fiche: { liste: Object.fromEntries(Object.entries(cartons).map(([k, x]) => [`carton-${k}`, x])), cases: { caler } } },
  { id: 'pesee', sujet: 'La pesée', fiche: { choix: Object.fromEntries(Object.entries(pesees).map(([k, x]) => [`pesee-${k}`, x])) } },
  { id: 'eco', sujet: 'Les écogestes', fiche: { cases: { eco } } },
];
const P8 = (lignes = ['prendre', 'autre', 'abime', 'prendre', 'vide']) => [
  { id: 'lignes', fiche: { liste: Object.fromEntries(lignes.map((x, i) => [`ligne-${i + 1}`, x])) } },
  { id: 'cartons', sujet: 'L’emballage', fiche: { liste: { 'carton-512-1': 'M', 'carton-512-2': 'M', 'carton-512-3': 'S' }, cases: { caler: ['512-2'] } } },
  { id: 'pesee', sujet: 'La pesée', fiche: { choix: { 'pesee-512-1': 'sortir' } } },
];
const P9 = ({ hors = 6800, site = 238 } = {}) => [
  { id: 'liens', fiche: { liste: { 'fait-1': 'commandes', 'fait-2': 'marche', 'fait-3': 'nuit', 'fait-4': 'carton' } } },
  { id: 'calculs', sujet: 'Deux calculs', fiche: { nb: { hors, site } } },
  { id: 'change', sujet: 'Les robots et toi', fiche: { cases: { change: ['poste', 'ecran', 'barriere'] } } },
];
const P10 = ({ lignes = ['prendre', 'vide', 'autre', 'abime'], pesees = { '780-1': 'sortir', '780-3': 'part' } } = {}) => [
  { id: 'lignes', fiche: { liste: Object.fromEntries(lignes.map((x, i) => [`ligne-${i + 1}`, x])) } },
  { id: 'cartons', sujet: 'L’emballage', fiche: { liste: { 'carton-780-1': 'env', 'carton-780-2': 'M', 'carton-780-3': 'L' }, cases: { caler: ['780-2'] } } },
  { id: 'pesee', sujet: 'La pesée', fiche: { choix: Object.fromEntries(Object.entries(pesees).map(([k, x]) => [`pesee-${k}`, x])) } },
];

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-19.x : les dix séances se chargent (CAP : competences vides, competencesCap) ; jalons + questions = 20 ; parcours chaîné hors évaluations ; entreprise n° 19 ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/amazon-ent${s.pre}.js`);
      const Q = await import(`/contenus/questions/ENT-19.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.competencesCap, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret,
        A.meta.ouverture, A.meta.precedente, A.meta.parcours], total: C.ETAPES.reduce((t, e) => t + (e.poids || 0), 0), part: Q.QUESTIONS.part || 0,
        ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id) });
    }
    return { out, e: I.ENTREPRISES.find((x) => x.n === 19) };
  }, SEANCES);
  egal(r.out.map((x) => x.m), [
    ['ENT-19.1', ['cap'], [], ['CAP-C1.1'], 'guidage', 20, undefined, 'ENT-19.1', true, 'prof', undefined, true],
    ['ENT-19.2', ['cap'], [], ['CAP-C1.2'], 'guidage', 20, undefined, 'ENT-19.2', true, 'prof', 'amazon-bienvenue', true],
    ['ENT-19.3', ['cap'], [], ['CAP-C1.5'], 'guidage', 20, undefined, 'ENT-19.3', true, 'prof', 'amazon-poste', true],
    ['ENT-19.4', ['cap'], [], ['CAP-C1.5'], 'entrainement', 20, undefined, 'ENT-19.4', true, 'prof', 'amazon-ranger', true],
    ['ENT-19.5', ['cap'], [], ['CAP-C1.5'], 'evaluation', 20, true, 'ENT-19.5', true, 'prof', undefined, undefined],
    ['ENT-19.6', ['cap'], [], ['CAP-C3.1', 'CAP-C3.2'], 'guidage', 20, undefined, 'ENT-19.6', true, 'prof', 'amazon-bac-mardi', true],
    ['ENT-19.7', ['cap'], [], ['CAP-C3.3', 'CAP-C3.7'], 'guidage', 20, undefined, 'ENT-19.7', true, 'prof', 'amazon-prelever', true],
    ['ENT-19.8', ['cap'], [], ['CAP-C3.1', 'CAP-C3.2', 'CAP-C3.3'], 'entrainement', 20, undefined, 'ENT-19.8', true, 'prof', 'amazon-emballer', true],
    ['ENT-19.9', ['cap'], [], ['CAP-C1.1', 'CAP-C3.6'], 'guidage', 20, undefined, 'ENT-19.9', true, 'prof', 'amazon-jeudi', true],
    ['ENT-19.10', ['cap'], [], ['CAP-C3.1', 'CAP-C3.2', 'CAP-C3.3'], 'evaluation', 20, true, 'ENT-19.10', true, 'prof', undefined, undefined],
  ], 'meta');
  egal(r.out.map((x) => x.total + x.part + x.ouvPart), Array(10).fill(20), 'jalons + questions');
  egal(r.out.map((x) => x.noter === 'function'), [false, false, false, false, true, false, false, false, false, true], 'noter seulement en évaluation');
  egal(r.out.map((x) => x.reg), Array(10).fill(true), 'au registre');
  egal([r.e.nom, r.e.logo], ['Amazon', './contenus/trames/logos/amazon.svg'], 'entreprise n° 19');
});

await v('ENT-19.x : les données — les rangements écrits à la main sont justes, une case de trop, un article qui ressemble ou un lourd en haut tombent ; inventaires, cartons, pesées, prélèvements (valeurs à la main)', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/amazon-donnees.js');
    const J = M.TOUS_JEUX195;
    const ranger = (A, refs, choix, ab = []) => M.jugerRangement(A, refs, choix, ab);
    const E = (X) => X.commandes.map((c) => [c.id, M.cartonJuste(c.refs), M.aCaler(c.refs)]);
    const pes = (X) => X.pesees.map((p) => { const c = X.commandes.find((x) => x.id === p.id); return [p.id, M.poidsAttendu(c.refs, M.cartonJuste(c.refs)), M.pesee(M.poidsAttendu(c.refs, M.cartonJuste(c.refs)), p.lu)]; });
    return {
      justes: [ranger(M.A193, M.R193, ['B2', 'D1', 'B1', 'C1', 'C3']), ranger(M.A194, M.R194, ['D2', 'B2', 'cote', 'C2', 'D1', 'A1'], M.ABIMES194),
        ranger(J[0].armoire, J[0].refs, ['A2', 'C1', 'cote', 'D1', 'D2'], J[0].abimes), ranger(J[1].armoire, J[1].refs, ['B1', 'C2', 'D1', 'cote', 'D3'], J[1].abimes),
        ranger(J[2].armoire, J[2].refs, ['A3', 'D2', 'B2', 'cote', 'A1'], J[2].abimes)],
      fautes: [ranger(M.A193, M.R193, ['A3', 'D1', 'D2', 'B1', 'A2']), ranger(M.A194, M.R194, ['D2', 'B2', 'C3', 'C2', 'D1', 'cote'], M.ABIMES194),
        ranger(M.A193, M.R193, ['B2', 'B2', 'B1', 'C1', 'C3'])],
      inv: [M.INV194, ...J.map((x) => x.inv)].map((I) => [M.compte(I), I.attendu, M.ecart(I)]),
      e: [E(M.E197), E(M.E198), ...M.TOUS_JEUX1910.map((x) => E(x.emb))], p: [pes(M.E197), pes(M.E198), pes(M.TOUS_JEUX1910[0].emb)],
      act: [M.P196, M.P198, M.TOUS_JEUX1910[0].prelev].map((X) => X.lignes.map((L) => M.actionJuste(L))),
    };
  });
  egal(r.justes, [Array(5).fill(null), Array(6).fill(null), Array(5).fill(null), Array(5).fill(null), Array(5).fill(null)], 'rangements justes');
  egal(r.fautes[0], ['ressemble', null, 'lourd', null, 'place'], 'ENT-19.3 : coque à côté de la coque noire, haltère en D, peluche en B1 (juste), lampe en A2 (une place)');
  egal(r.fautes[1], [null, null, 'abime', null, null, 'cote'], 'ENT-19.4 : la tasse rangée, le puzzle mis de côté');
  egal(r.fautes[2], [null, 'place', null, null, null], 'ENT-19.3 : deux articles dans une case à une place');
  egal(r.inv, [[6, 7, 'manque'], [5, 6, 'manque'], [4, 4, 'juste'], [4, 3, 'trop']], 'inventaires');
  egal(r.e[0], [['403-1', 'env', false], ['403-2', 'M', false], ['403-3', 'L', false], ['403-4', 'S', true]], 'cartons ENT-19.7');
  egal(r.e[1], [['512-1', 'M', false], ['512-2', 'M', true], ['512-3', 'S', false]], 'cartons ENT-19.8');
  egal(r.e[2], [['780-1', 'env', false], ['780-2', 'M', true], ['780-3', 'L', false]], 'cartons ENT-19.10, jeu 0');
  egal(r.p, [[['403-2', 0.6, 'part'], ['403-3', 1.7, 'sortir']], [['512-1', 0.55, 'sortir']], [['780-1', 0.19, 'sortir'], ['780-3', 1.4, 'part']]], 'pesées');
  egal(r.act, [['prendre', 'autre', 'vide', 'prendre'], ['prendre', 'autre', 'abime', 'prendre', 'vide'], ['prendre', 'vide', 'autre', 'abime']], 'prélèvements');
});

await v('ENT-19.x : les documents et les messages — mentions, phrases toutes différentes, l’inventaire ne dit pas l’écart, aucun message ne juge ; les corrigés se chargent (un par élève en évaluation) ; les graines tirent les trois jeux', async () => {
  const r = await pg.evaluate(async (L) => {
    const txt = (h) => { const e = document.createElement('div'); e.innerHTML = h; return e.textContent.replace(/\s+/g, ' '); };
    const doubles = [], sans = [], corr = [];
    for (const s of L) {
      const C = await import(`/contenus/amazon-ent${s.pre}.js`);
      for (const db of [{}, { tirage: { graine: 'a' } }, { tirage: { graine: 'b' } }]) {
        const d = C.VOLET.declencheurs.find((x) => x.id === 'compte');
        if (d) for (const l of d.semer('Léa', db).mails[0].phrases.lignes) if (new Set(l.choix).size !== l.choix.length) doubles.push(`${s.n} ${l.id}`);
        for (const D of C.OPTIONS.documents) { const t = txt(typeof D.html === 'function' ? D.html(db) : D.html); if (!/Document pédagogique/.test(t)) sans.push(`${s.n} ${D.id}`); }
      }
      const K = await import(`/contenus/corriges/ENT-19.${s.n}.js`);
      corr.push([K.CORRIGE.code, K.CORRIGE.items.length > 0, K.corrigeEleve({ tirage: { graine: 'b' } }, 'b').items.length > 0]);
    }
    const C5 = await import('/contenus/amazon-ent195.js');
    const inv = txt(C5.OPTIONS.documents.find((d) => d.id === 'inventaire').html({ tirage: { graine: 'g' } }));
    const M = await import('/contenus/amazon-donnees.js');
    const vus = new Set(); for (let i = 0; i < 300; i++) vus.add(M.jeu195({ tirage: { graine: `eleve-${i}` } }).armoire.no);
    const vus10 = new Set(); for (let i = 0; i < 300; i++) vus10.add(M.jeu1910({ tirage: { graine: `eleve-${i}` } }).prelev.armoire);
    return { doubles, sans, corr, inv, vus: [...vus].sort(), vus10: [...vus10].sort() };
  }, SEANCES);
  egal(r.doubles, [], 'phrases en double');
  egal(r.sans, [], 'documents sans mention');
  egal(r.corr.map((x) => x[0]), SEANCES.map((s) => `ENT-19.${s.n}`), 'corrigés'); vrai(r.corr.every((x) => x[1] && x[2]), 'corrigé vide : ' + JSON.stringify(r.corr));
  vrai(/attendu|système/i.test(r.inv) && !/manque|trop/i.test(r.inv), 'l’inventaire trahit l’écart : ' + r.inv);
  egal(r.vus, ['P-3051', 'P-3188', 'P-3420'], 'ENT-19.5 : 300 graines tirent les trois jeux');
  egal(r.vus10, ['P-4012', 'P-4155', 'P-4398'], 'ENT-19.10 : 300 graines tirent les trois jeux');
});

// ─────────────────────────────────────────────────────────── ENT-19.1
await v('ENT-19.1 : inaction → 0/20 ; un message de Karima ; carte fermée avant la première fiche ; parcours juste → 20/20 ; aucun message ne juge', async () => {
  await mont(S_['1'], { sansOuverture: true });
  const n0 = await noter(S.act);
  egal([n0.score, n0.max], [0, 20], 'note');
  await mont(S_['1']);
  egal((await entrants()).map((m) => m.from), ['Karima, manageuse de zone'], 'un seul message');
  vrai(!(await pg.$(`${Z} .ent-nav[data-vue="localiser"]`)), 'la carte est ouverte avant « Qui fait quoi ? »');
  await jouer(P1, { carte: {} });
  const n = await noter(S.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail));
  const E = await entrants();
  vrai(E.some((m) => m.subject === 'Merci'), 'pas de message de fin : ' + E.map((m) => m.subject).join(' | '));
  vrai(!E.some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct|faux)\b/i.test(m.text)), 'un message juge');
});

await v('ENT-19.1 : sabotages — Théo à la place de Karima (−1) ; une erreur de région sur Brétigny (−1) ; le voyage laissé tel quel (−3) ; un robot qui emballe coché (−3)', async () => {
  await mont(S_['1']);
  const F = JSON.parse(JSON.stringify(P1));
  F[0].fiche.liste['tache-2'] = 'theo'; F[1].fiche.ordre = {}; F[2].fiche.cases.robots.push('emballe');
  await jouer(F, { carte: { 'bretigny:region': 1 } });
  egal(ko(await detail()), ['qui-2', 'localiser:bretigny:region', 'voyage-1', 'voyage-2', 'voyage-3', 'voyage-4', 'voyage-5', 'voyage-6', 'robots'], 'jalons tombés');
  proche((await noter(S.act)).score, 12, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-19.2
await v('ENT-19.2 : parcours juste → 20/20 ; inaction → 0 ; sabotages — passer la barrière (−1,25), le bac pris pour l’armoire (−1), le retard déchargé (−1), compte rendu « en prélèvement » (−4)', async () => {
  await mont(S_['2'], { sansOuverture: true });
  egal((await noter(S.act)).score, 0, 'inaction');
  await mont(S_['2']);
  await jouer(P2);
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['2']);
  const F = JSON.parse(JSON.stringify(P2));
  F[0].fiche.liste['secu-2'] = 'vite'; F[1].fiche.liste.armoire = 'T-77'; F[2].fiche.choix.retard = 'rien';
  await jouer(F, { compte: { poste: 1 } });
  egal(ko(await detail()), ['secu-2', 'armoire', 'retard', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 12.75, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-19.3
await v('ENT-19.3 : parcours juste → 20/20 ; sabotages — l’haltère en D2 (−1,6), les gestes laissés tels quels (−2), compte rendu « les coques ensemble » (−4)', async () => {
  await mont(S_['3']);
  await jouer(P3());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['3']);
  const F = P3(['B2', 'D1', 'D2', 'C1', 'C3']); F[1].fiche.ordre = {};
  await jouer(F, { compte: { ressemble: 1 } });
  egal(ko(await detail()), ['case-3', 'gestes', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 12.4, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-19.4
await v('ENT-19.4 : parcours juste → 20/20 ; sabotages — la tasse abîmée rangée en C3 (−1,5), 7 recopié du système et « juste » (−3), compte rendu « 7 gourdes » (−3)', async () => {
  await mont(S_['4']);
  await jouer(P4());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['4']);
  await jouer(P4(['D2', 'B2', 'C3', 'C2', 'D1', 'A1'], { compte: 7, ecart: 'juste' }), { compte: { inventaire: 1 } });
  egal(ko(await detail()), ['case-3', 'compte', 'ecart', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 12.5, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-19.5 (copie rendue)
await v('ENT-19.5 : la graine tire le jeu (armoire lue à l’écran) ; « Avant de commencer » noté 3 ; inaction → 3/20 ; parcours juste → 20/20 dans chacun des trois jeux', async () => {
  for (const J of J5) {
    await mont(S_['5'], { uid: J.uid });
    let n = await noter(S.act);
    proche(n.score, 3, `jeu ${J.armoire} : ouverture seule ` + JSON.stringify(n.detail));
    vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
    const arm = await pg.evaluate(() => window.__f.db.tirage && window.__f.db.tirage.graine);
    egal(arm, J.uid, 'graine posée');
    await jouer(P5(J));
    const docs = await pg.evaluate(async () => { const C = await import('/contenus/amazon-ent195.js'); const d = C.OPTIONS.documents.find((x) => x.id === 'armoire'); return d.html(window.__f.db); });
    vrai(docs.includes(J.armoire), `l’armoire du jeu ${J.armoire} n’est pas celle de la base`);
    n = await noter(S.act);
    proche(n.score, 20, `jeu ${J.armoire} : ` + JSON.stringify(n.detail));
  }
});

await v('ENT-19.5 : sabotages (jeu P-3051) — passer la barrière (−1), la cafetière abîmée rangée (−1,6), 6 recopié du système (−1,5 −1), compte rendu « tout rangé » (−3)', async () => {
  const J = { ...J5[0], secu: ['vite', 'dos'], rang: ['A2', 'C1', 'C3', 'D1', 'D2'], inv: { compte: 6, ecart: 'juste' } };
  await mont(S_['5'], { uid: J.uid });
  await jouer(P5(J), { compte: { abime: 1 } });
  egal(ko(await detail()), ['secu-1', 'case-3', 'compte', 'ecart', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 11.9, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-19.6 à 19.9
await v('ENT-19.6 : parcours juste → 20/20 ; sabotages — la coque noire prise « qui ressemble » (−2), la case vide « prise » (−2), compte rendu « la coque noire » (−3)', async () => {
  await mont(S_['6']);
  await jouer(P6());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['6']);
  await jouer(P6(['prendre', 'ressemble', 'prendre', 'prendre']), { compte: { autre: 1 } });
  egal(ko(await detail()), ['ligne-2', 'ligne-3', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 13, 'note');
});

await v('ENT-19.7 : parcours juste → 20/20 ; sabotages — un grand carton pour le livre (−1,5), rien calé (−1,5), le colis trop léger qui part (−1,5), « toujours un grand carton » coché (−1,5)', async () => {
  await mont(S_['7']);
  await jouer(P7());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['7']);
  await jouer(P7({ cartons: { '403-1': 'L', '403-2': 'M', '403-3': 'L', '403-4': 'S' }, caler: [], pesees: { '403-2': 'part', '403-3': 'part' }, eco: ['film', 'chutes', 'taille', 'grand'] }));
  egal(ko(await detail()), ['carton-1', 'caler', 'pesee-2', 'eco'], 'jalons tombés');
  proche((await noter(S.act)).score, 14, 'note');
});

await v('ENT-19.8 : parcours juste → 20/20 ; sabotages — le t-shirt L pris (−1,3), la bougie abîmée prise (−1,3), compte rendu « tout pris » (−3)', async () => {
  await mont(S_['8']);
  await jouer(P8());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['8']);
  await jouer(P8(['prendre', 'prendre', 'prendre', 'prendre', 'vide']), { compte: { prelev: 1 } });
  egal(ko(await detail()), ['ligne-2', 'ligne-3', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 14.4, 'note');
});

await v('ENT-19.9 : parcours juste → 20/20 ; 237 accepté ; sabotages — 12 200 (addition) (−1,5), 236 (−1,5)', async () => {
  await mont(S_['9']);
  await jouer(P9());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['9']);
  await jouer(P9({ site: 237 }));
  proche((await noter(S.act)).score, 20, '237');
  await mont(S_['9']);
  await jouer(P9({ hors: 12200, site: 236 }));
  egal(ko(await detail()), ['hors', 'site'], 'jalons tombés');
  proche((await noter(S.act)).score, 17, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-19.10 (copie rendue)
await v('ENT-19.10 : « Avant de commencer » noté 3 ; inaction → 3/20 ; parcours juste (jeu P-4012) → 20/20 ; sabotages — la case vide « prise » (−1,5), les pesées inversées (−2,5)', async () => {
  await mont(S_['10'], { uid: 'g' });
  let n = await noter(S.act);
  proche(n.score, 3, 'ouverture seule : ' + JSON.stringify(n.detail));
  await jouer(P10());
  n = await noter(S.act);
  proche(n.score, 20, 'parcours juste : ' + JSON.stringify(n.detail));
  await mont(S_['10'], { uid: 'g' });
  await jouer(P10({ lignes: ['prendre', 'prendre', 'autre', 'abime'], pesees: { '780-1': 'part', '780-3': 'sortir' } }));
  egal(ko(await detail()), ['ligne-2', 'pesee-1', 'pesee-2'], 'jalons tombés');
  proche((await noter(S.act)).score, 16, 'note');
});

}
