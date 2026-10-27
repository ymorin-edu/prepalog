// Suite de tests de Prepalog — bloc « yves-rocher » : Yves Rocher ENT-23.1 à 23.6, la plateforme de La Villouët à La Gacilly (2de Bac Pro).
// `node outils/test.mjs yves-rocher` ne lance que ce bloc. Cadrage : `docs/briefs/yves-rocher/CADRAGE-yves-rocher-2de.md`. Aides : `outils/test/ikea/commun.mjs`.
//
// VALEURS ÉCRITES À LA MAIN (relues sur les documents le 27/10/2026 ; le code les calcule, le test les écrit) :
// Règle : quantité multiple du colisage → cartons ; plus petite → détail ; entre les deux → les deux. Ordre : allée puis emplacement.
// ENT-23.1 (Rennes) : crème mains 10/36 détail, eau de toilette 15/6 mixte, gel douche 48/24 cartons, rouge 30/48 détail, savon 40/40 cartons ;
//   ordre gel 03-12, crème 07-15, savon 11-06, rouge 14-03, eau de toilette 16-05.
// ENT-23.2 : Vannes gel 6 détail, Vannes savon 40 cartons, Lorient déo 30 cartons, Saint-Malo gel 30 mixte (1 carton, 6 au détail) ;
//   arrêts huile 02-07, gel 03-12, déo 09-08, savon 11-06, vernis 14-11 ; 60 gels (24 + 6 + 30), 42 déos (12 + 30) ; huiles bac 4, vernis bac 3.
// ENT-23.3 : vernis conforme, crème il en manque (10/12), masque en trop (8/6), rouge pas le bon produit (teinte 15 au lieu de 12), crème de jour
//   conforme ; corriger, 2 crèmes à ajouter, 2 masques à retirer ; bons gestes : scanner, lire, compter.
// ENT-23.4 (Vannes, lundi) : comparer d'abord ; gel renvoyer (18/24), eau de toilette remplacer (photo), rouge expliquer (pas commandé) ; mardi.
// ENT-23.5 (heure limite 14 h) : Quimper 11 h 20 ce soir, Lorient 14 h 40 demain, Brest 13 h 10 en partie (36 en stock sur 60 → reliquat 24) ;
//   Quimper gel 24 cartons, huile 5 détail, Brest crème 36 cartons ; masques en stock, coffrets don, laits recyclage.
// ENT-23.6 : graine « i » → jeu 0 (Dinan : détail, mixte, cartons, détail, cartons ; huile, gel, crème, savon, eau de toilette ; 36 gels ;
//   renvoyer, expliquer, remplacer ; mardi) ; « a » → jeu 1 (Auray : mixte, détail, cartons, cartons, détail ; shampooing, lait, déo, rouge, vernis ;
//   30 shampooings ; remplacer, renvoyer, expliquer ; jeudi) ; « b » → jeu 2 (Fougères : cartons, détail, détail, cartons, mixte ; gel, déo, masque,
//   eau de toilette, crème de jour ; 58 masques ; expliquer, remplacer, renvoyer ; lundi).

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const SEANCES = [
  ['yves-rocher-bienvenue', '1', '231'], ['yves-rocher-chariot', '2', '232'], ['yves-rocher-controle', '3', '233'], ['yves-rocher-reclamation', '4', '234'],
  ['yves-rocher-black-friday', '5', '235'], ['yves-rocher-evaluation', '6', '236'],
].map(([id, n, pre]) => ({ id, n, pre, act: `/activites/${id}.js` }));
const S_ = Object.fromEntries(SEANCES.map((s) => [s.n, s]));
const OBJET = 'Ton compte rendu';

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S_['1'].act, id: S_['1'].id });
const { pg, Z, pause, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter, ouvrirParMessage } = P;

const OUV = { livre: 'boutiques', ou: 'gacilly', articles: '280m', panache: 'detail', agec: 'donner', ingredients: 'ingredients' };
// Les réponses au fil (les réflexions : le premier choix, non noté).
const RF = {
  1: { filiale: 'etranger', colisage: 'carton', 'pourquoi-ordre': 'chemin', aimer: 'bouger' },
  2: { quatre: 'pas', 'retour-arriere': 'temps', bac: 'deux', difficile: 'calcul' },
  3: { 'pourquoi-controle': 'avant', teinte: 'erreur', scanner: 'verifie', erreur: 'dire' },
  4: { client: 'client', photo: 'preuve', vous: 'vous', colere: 'calme' },
  5: { limite: 'camion', reliquat: 'reste', detruire: 'loi', pic: 'monde' },
  6: { apres: 'types' },
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
async function jouer(pas, { compte = {}, objet = OBJET } = {}) {
  for (let i = 0; i < pas.length; i++) {
    const p = pas[i];
    if (i === 0) await allerV('fiche'); else { await pause(700); await ouvrirParMessage(p.sujet, `fiche:f${S.pre}-${p.id}`); }
    await remplir(p.fiche);
  }
  const L = await pg.evaluate((o) => { const m = window.__f.db.mails.find((x) => x.subject === o); return m ? Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix.slice()])) : null; }, objet);
  if (L) {
    const t = Object.fromEntries(Object.entries(L).map(([k, c]) => [k, c[0]]));
    for (const [k, i] of Object.entries(compte)) t[k] = L[k][i];
    await phrases(objet, t);
    await qFil();
  }
}
const types = (prods, vals) => Object.fromEntries(prods.map((p, i) => [`type-${p}`, vals[i]]));

const P1 = ({ voyage = ['usine', 'plateforme', 'boutique', 'cliente'], qui = ['boutiques', 'filiales'], t = ['detail', 'mixte', 'carton', 'detail', 'carton'],
  ordre = ['gel', 'creme', 'savon', 'rouge', 'edt'] } = {}) => [
  { id: 'voyage', fiche: { cases: { qui }, ordre: { voyage } } },
  { id: 'types', sujet: 'La commande de Rennes', fiche: { liste: types(['creme', 'edt', 'gel', 'rouge', 'savon'], t) } },
  { id: 'ordre', sujet: 'Le parcours', fiche: { ordre: { ordre } } },
];
const P2 = ({ t = ['detail', 'carton', 'carton', 'mixte'], cartons = '1', detail = '6', ordre = ['huile', 'gel', 'deo', 'savon', 'vernis'], gel = '60', deo = '42', huile = '4', vernis = '3' } = {}) => [
  { id: 'types', fiche: { liste: { 'type-2-gel': t[0], 'type-2-savon': t[1], 'type-3-deo': t[2], 'type-4-gel': t[3] }, nb: { cartons, detail } } },
  { id: 'ordre', sujet: 'Ton parcours', fiche: { ordre: { ordre } } },
  { id: 'chariot', sujet: 'Les bacs', fiche: { nb: { 'total-gel': gel, 'total-deo': deo }, liste: { 'bac-huile': huile, 'bac-vernis': vernis } } },
];
const P3 = ({ st = ['conforme', 'manque', 'trop', 'reference', 'conforme'], decision = 'corriger', ajouter = '2', retirer = '2', pratiques = ['scanner', 'lire', 'compter'] } = {}) => [
  { id: 'controle', fiche: { liste: Object.fromEntries(['vernis', 'creme', 'masque', 'rouge', 'soin'].map((p, i) => [`ligne-${p}`, st[i]])) } },
  { id: 'carton', sujet: 'Le carton de Lorient', fiche: { choix: { decision }, nb: { ajouter, retirer } } },
  { id: 'pratiques', sujet: 'Les bons gestes', fiche: { cases: { pratiques } } },
];
const P4 = ({ abord = 'comparer', rec = ['renvoyer', 'remplacer', 'expliquer'], jour = 'mardi' } = {}) => [
  { id: 'abord', fiche: { choix: { abord } } },
  { id: 'decider', sujet: 'Les trois articles', fiche: { choix: { 'rec-gel': rec[0], 'rec-edt': rec[1], 'rec-rouge': rec[2] } } },
  { id: 'quand', sujet: 'La livraison', fiche: { liste: { jour } } },
];
const P5 = ({ suites = ['soir', 'demain', 'partiel'], reliquat = '24', t = ['carton', 'detail', 'carton'], retours = ['stock', 'don', 'recycler'] } = {}) => [
  { id: 'demandes', fiche: { liste: { 'suite-quimper': suites[0], 'suite-lorient': suites[1], 'suite-brest': suites[2] }, nb: { reliquat } } },
  { id: 'preparer', sujet: 'Pour Maël', fiche: { liste: { 'type-quimper-gel': t[0], 'type-quimper-huile': t[1], 'type-brest-creme': t[2] } } },
  { id: 'retours', sujet: 'Les retours', fiche: { liste: { 'retour-masques': retours[0], 'retour-coffrets': retours[1], 'retour-laits': retours[2] } } },
];
const P6 = (J) => [
  { id: 'types', fiche: { liste: types(J.prods, J.types) } },
  { id: 'ordre', sujet: 'Ton parcours', fiche: { ordre: { ordre: J.ordre } } },
  { id: 'chariot', sujet: 'Ton chariot', fiche: { nb: { total: J.total } } },
  { id: 'reclam', sujet: 'Pour Inès', fiche: { choix: Object.fromEntries(J.rec.map(([p, d]) => [`rec-${p}`, d])) } },
];
const J6 = [
  { uid: 'i', prods: ['creme', 'edt', 'gel', 'huile', 'savon'], types: ['detail', 'mixte', 'carton', 'detail', 'carton'], ordre: ['huile', 'gel', 'creme', 'savon', 'edt'],
    total: '36', rec: [['shamp', 'renvoyer'], ['vernis', 'expliquer'], ['soin', 'remplacer']], jour: 'mardi' },
  { uid: 'a', prods: ['deo', 'lait', 'rouge', 'shamp', 'vernis'], types: ['mixte', 'detail', 'carton', 'carton', 'detail'], ordre: ['shamp', 'lait', 'deo', 'rouge', 'vernis'],
    total: '30', rec: [['edt', 'remplacer'], ['gel', 'renvoyer'], ['huile', 'expliquer']], jour: 'jeudi' },
  { uid: 'b', prods: ['deo', 'edt', 'gel', 'masque', 'soin'], types: ['carton', 'detail', 'detail', 'carton', 'mixte'], ordre: ['gel', 'deo', 'masque', 'edt', 'soin'],
    total: '58', rec: [['deo', 'expliquer'], ['lait', 'remplacer'], ['rouge', 'renvoyer']], jour: 'lundi' },
];

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-23.x : les six séances se chargent (2de : C2.2 guidage, deux entraînements ; C2.1 guidage, entraînement ; une évaluation après) ; jalons + questions = 20 ; parcours chaîné hors évaluation ; entreprise n° 23 ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/yves-rocher-ent${s.pre}.js`);
      const Q = await import(`/contenus/questions/ENT-23.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret,
        A.meta.ouverture, A.meta.precedente, A.meta.parcours, A.meta.reinitialisable], total: C.ETAPES.reduce((t, e) => t + (e.poids || 0), 0), part: Q.QUESTIONS.part || 0,
        ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id), qid: Q.QUESTIONS.id === s.id });
    }
    return { out, e: I.ENTREPRISES.find((x) => x.n === 23) };
  }, SEANCES);
  const m = (code, comp, temps, prec, o = {}) => [code, ['2de'], comp, temps, 20, o.copie, code, true, 'prof', prec, o.copie ? undefined : true, o.reinit];
  egal(r.out.map((x) => x.m), [
    m('ENT-23.1', ['C2.2'], 'guidage', undefined, { reinit: true }),
    m('ENT-23.2', ['C2.2'], 'entrainement', 'yves-rocher-bienvenue'),
    m('ENT-23.3', ['C2.2'], 'entrainement', 'yves-rocher-chariot'),
    m('ENT-23.4', ['C2.1'], 'guidage', 'yves-rocher-controle'),
    m('ENT-23.5', ['C2.1', 'C2.2'], 'entrainement', 'yves-rocher-reclamation'),
    m('ENT-23.6', ['C2.2', 'C2.1'], 'evaluation', undefined, { copie: true }),
  ], 'meta');
  egal(r.out.map((x) => x.total + x.part + x.ouvPart), Array(6).fill(20), 'jalons + questions');
  egal(r.out.map((x) => x.noter === 'function'), SEANCES.map((s) => s.n === '6'), 'noter seulement en évaluation');
  egal(r.out.map((x) => x.reg && x.qid), Array(6).fill(true), 'au registre, questions de la bonne séance');
  egal([r.e.nom, r.e.logo], ['Yves Rocher', './contenus/trames/logos/yves-rocher.svg'], 'entreprise n° 23');
});

await v('ENT-23.x : les données — façons de préparer, ordre de prélèvement, chariot, contrôle, réclamations, demandes du pic, jeux de l’évaluation (valeurs à la main)', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/yves-rocher-donnees.js');
    const C = M.CHARIOT232;
    return {
      t231: M.CMD231.lignes.map(M.typeDe), o231: M.ordreDe(M.CMD231.lignes),
      t232: M.TYPES232.map(([b, p]) => M.typeDe(M.ligneDe(C, b, p))), sm: [M.cartons(M.ligneDe(C, 4, 'gel')), M.detail(M.ligneDe(C, 4, 'gel'))],
      o232: M.ordreChariot(C), tot: [M.totalA(C, 'gel'), M.totalA(C, 'deo')], bacs: [M.bacDe(C, 'huile'), M.bacDe(C, 'vernis')],
      c233: M.CONTROLE233.map(M.statutDe),
      r234: [M.RECLAM234.plaintes.map(M.decisionDe), M.prochaine('Vannes', 'lundi')],
      d235: [M.DEMANDES235.map(M.suiteDe), M.reliquat(M.DEMANDES235[2]), M.PREP235.map(M.typeDe)],
      j236: M.TOUS_JEUX236.map((J) => [J.boutique, J.lignes.map(M.typeDe), M.ordreDe(J.lignes), J.lignes.filter((l) => l.prod === J.voisin.prod).reduce((t, l) => t + l.qte, 0) + J.voisin.qte,
        J.reclam.plaintes.map(M.decisionDe), M.prochaine(J.reclam.boutique, J.reclam.jour)]),
      graines: ['i', 'a', 'b'].map((g) => M.indiceJeu({ tirage: { graine: g } }, 3, '236')),
    };
  });
  egal(r.t231, ['detail', 'mixte', 'carton', 'detail', 'carton'], 'ENT-23.1 : préparer');
  egal(r.o231, ['gel', 'creme', 'savon', 'rouge', 'edt'], 'ENT-23.1 : ordre');
  egal(r.t232, ['detail', 'carton', 'carton', 'mixte'], 'ENT-23.2 : préparer');
  egal(r.sm, [1, 6], 'ENT-23.2 : Saint-Malo');
  egal(r.o232, ['huile', 'gel', 'deo', 'savon', 'vernis'], 'ENT-23.2 : arrêts');
  egal(r.tot, [60, 42], 'ENT-23.2 : en une fois');
  egal(r.bacs, [4, 3], 'ENT-23.2 : bacs');
  egal(r.c233, ['conforme', 'manque', 'trop', 'reference', 'conforme'], 'ENT-23.3');
  egal(r.r234, [['renvoyer', 'remplacer', 'expliquer'], 'mardi'], 'ENT-23.4');
  egal(r.d235, [['soir', 'demain', 'partiel'], 24, ['carton', 'detail', 'carton']], 'ENT-23.5');
  egal(r.j236, [
    ['Dinan', ['detail', 'mixte', 'carton', 'detail', 'carton'], ['huile', 'gel', 'creme', 'savon', 'edt'], 36, ['renvoyer', 'expliquer', 'remplacer'], 'mardi'],
    ['Auray', ['mixte', 'detail', 'carton', 'carton', 'detail'], ['shamp', 'lait', 'deo', 'rouge', 'vernis'], 30, ['remplacer', 'renvoyer', 'expliquer'], 'jeudi'],
    ['Fougères', ['carton', 'detail', 'detail', 'carton', 'mixte'], ['gel', 'deo', 'masque', 'edt', 'soin'], 58, ['expliquer', 'remplacer', 'renvoyer'], 'lundi']], 'ENT-23.6');
  egal(r.graines, [0, 1, 2], 'les graines du test tirent les trois jeux');
});

await v('ENT-23.x : documents et messages — mentions, phrases toutes différentes, les corrigés se chargent, 300 graines tirent les trois jeux, le logo est en tracés purs', async () => {
  const r = await pg.evaluate(async (L) => {
    const txt = (h) => { const e = document.createElement('div'); e.innerHTML = h; return e.textContent.replace(/\s+/g, ' '); };
    const doubles = [], sans = [], corr = [];
    for (const s of L) {
      const C = await import(`/contenus/yves-rocher-ent${s.pre}.js`);
      for (const db of [{}, { tirage: { graine: 'i' } }, { tirage: { graine: 'a' } }, { tirage: { graine: 'b' } }]) {
        const d = C.VOLET.declencheurs.find((x) => x.id === 'compte');
        if (d) for (const l of d.semer('Léa', db).mails[0].phrases.lignes) if (new Set(l.choix).size !== l.choix.length) doubles.push(`${s.n} ${l.id}`);
        for (const D of C.OPTIONS.documents) { const t = txt(typeof D.html === 'function' ? D.html(db) : D.html); if (!/Document pédagogique/.test(t)) sans.push(`${s.n} ${D.id}`); }
      }
      const K = await import(`/contenus/corriges/ENT-23.${s.n}.js`);
      corr.push([K.CORRIGE.code, K.CORRIGE.items.length > 0, K.corrigeEleve({ tirage: { graine: 'b' } }, 'b').items.length > 0]);
    }
    const M = await import('/contenus/yves-rocher-donnees.js');
    const vu = new Set();
    for (let i = 0; i < 300; i++) vu.add(M.jeu236({ tirage: { graine: `eleve-${i}` } }).boutique);
    const logo = await (await fetch('/contenus/trames/logos/yves-rocher.svg')).text();
    return { doubles, sans, corr, vu: [...vu].sort(), logo: [/viewBox="0 0 920 200"/.test(logo), /<(image|text|style)\b|url\(|@import/.test(logo)] };
  }, SEANCES);
  egal(r.doubles, [], 'phrases en double');
  egal(r.sans, [], 'documents sans mention');
  egal(r.corr.map((x) => x[0]), SEANCES.map((s) => `ENT-23.${s.n}`), 'corrigés'); vrai(r.corr.every((x) => x[1] && x[2]), 'corrigé vide : ' + JSON.stringify(r.corr));
  egal(r.vu, ['Auray', 'Dinan', 'Fougères'], 'ENT-23.6 : 300 graines tirent les trois jeux');
  egal(r.logo, [true, false], 'logo : viewBox, rien d’externe');
});

// ─────────────────────────────────────────────────────────── ENT-23.1 (guidage C2.2)
await v('ENT-23.1 : inaction → 0/20 ; un message de Soizic ; parcours juste → 20/20 ; aucun message ne juge', async () => {
  await mont(S_['1'], { sansOuverture: true });
  const n0 = await noter(S.act);
  egal([n0.score, n0.max], [0, 20], 'note');
  await mont(S_['1']);
  egal((await entrants()).length, 1, 'un seul message');
  await jouer(P1());
  const n = await noter(S.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail));
  vrai(!(await entrants()).some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct|faux)\b/i.test(m.text)), 'un message juge');
});

await v('ENT-23.1 : sabotages — l’eau de toilette « au détail » (−1), l’ordre du bon gardé (−2,4 : le rouge y est déjà à sa place), les usines cochées (−1), compte rendu « la première ligne du bon » (−5)', async () => {
  await mont(S_['1']);
  await jouer(P1({ qui: ['boutiques', 'filiales', 'usines'], t: ['detail', 'detail', 'carton', 'detail', 'carton'], ordre: ['creme', 'edt', 'gel', 'rouge', 'savon'] }), { compte: { premier: 1 } });
  egal(ko(await detail()), ['qui', 'type-2', 'ordre-1', 'ordre-2', 'ordre-3', 'ordre-5', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 10.6, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-23.2 et 23.3 (entraînements C2.2)
await v('ENT-23.2 : parcours juste → 20/20 ; sabotages — Saint-Malo en 30 au détail (−0,75 −2), 24 gels au lieu de 60 (−1), les vernis dans le bac de Rennes (−1)', async () => {
  await mont(S_['2']);
  await jouer(P2());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['2']);
  await jouer(P2({ t: ['detail', 'carton', 'carton', 'detail'], cartons: '0', detail: '30', gel: '24', vernis: '1' }));
  egal(ko(await detail()), ['type-4', 'cartons', 'detail', 'total-gel', 'bac-vernis'], 'jalons tombés');
  proche((await noter(S.act)).score, 15.25, 'note');
});

await v('ENT-23.3 : parcours juste → 20/20 ; sabotages — le rouge dit conforme (−1), « je ferme et je préviens » (−2), « aller plus vite » coché (−3)', async () => {
  await mont(S_['3']);
  await jouer(P3());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['3']);
  await jouer(P3({ st: ['conforme', 'manque', 'trop', 'conforme', 'conforme'], decision: 'fermer', pratiques: ['scanner', 'lire', 'compter', 'vite'] }));
  egal(ko(await detail()), ['ligne-4', 'decision', 'pratiques'], 'jalons tombés');
  proche((await noter(S.act)).score, 14, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-23.4 et 23.5 (C2.1)
await v('ENT-23.4 : parcours juste → 20/20 ; sabotages — tout croire (−1,5), renvoyer les rouges (−2), « aujourd’hui » (−1,5), réponse « nous vous les envoyons aujourd’hui » (−7)', async () => {
  await mont(S_['4']);
  await jouer(P4(), { objet: 'La réponse à Vannes' });
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['4']);
  await jouer(P4({ abord: 'croire', rec: ['renvoyer', 'remplacer', 'renvoyer'], jour: 'lundi' }), { objet: 'La réponse à Vannes', compte: { gel: 1 } });
  egal(ko(await detail()), ['abord', 'rec-3', 'jour', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 8, 'note');
});

await v('ENT-23.5 : parcours juste → 20/20 ; sabotages — Lorient ce soir (−1,5), le reliquat oublié (−1,5), les coffrets à la poubelle (−1)', async () => {
  await mont(S_['5']);
  await jouer(P5());
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['5']);
  await jouer(P5({ suites: ['soir', 'soir', 'partiel'], reliquat: '0', retours: ['stock', 'jeter', 'recycler'] }));
  egal(ko(await detail()), ['suite-lorient', 'reliquat', 'retour-coffrets'], 'jalons tombés');
  proche((await noter(S.act)).score, 16, 'note');
});

// ─────────────────────────────────────────────────────────── ENT-23.6 (copie rendue)
await v('ENT-23.6 : « Avant de commencer » noté 3 ; inaction → 3/20 ; parcours juste → 20/20 dans chacun des trois jeux', async () => {
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

await v('ENT-23.6 : jeu « a » — sabotages : le déodorant tout en cartons (−0,8), l’adresse partagée comptée pour une seule boutique (−1,5), compte rendu « ils partent aujourd’hui » (−4,5)', async () => {
  const J = J6[1];
  await mont(S_['6'], { uid: J.uid });
  await jouer(P6({ ...J, types: ['carton', ...J.types.slice(1)], total: '24' }), { compte: { manque: 1 } });
  egal(ko(await detail()), ['type-1', 'total', 'compte-rendu'], 'jalons tombés');
  proche((await noter(S.act)).score, 13.2, 'note');
});

}
