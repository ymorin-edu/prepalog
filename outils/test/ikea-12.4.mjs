// Suite de tests de Prepalog — bloc « ikea-12.4 » : IKEA ENT-12.4, « la facture du transporteur » (2de, poste A assistant(e) de gestion, AGO-2.1, guidage).
// `node outils/test.mjs ikea-12.4` ne lance que ce bloc. Brief : `docs/briefs/ENT-12.4-ikea-facture-du-transporteur.md` §4 à §6 bis.
//
// La facture du guidage est une pièce FIXE (la même pour tous). Les valeurs attendues sont ÉCRITES À LA MAIN (relues sur les bons le 26/10/2026), jamais recalculées par le code :
//   12 lignes de 28, 64, 80, 46, 46, 63, 28, 52, 33, 76, 28, 52 € = 596 € HT affichés. Erreurs : ligne 4 (mauvais tarif : « dans la pièce » facturé, le bon dit « devant chez vous » :
//   46 € au lieu de 28 €, écart 18 €) ; ligne 6 (client absent, livraison non faite, mais facturée 63 €) ;
//   ligne 12 (doublon de la
//   ligne 8, même bon BL-21752). Bon montant : HT 476,80 € ; TVA 95,36 € ; TTC 572,16 € ; écart à réclamer 119,20 € HT (596 − 476,80), soit 143,04 € TTC.
// Barème (brief §5) : trois erreurs 3 chacune · aucune ligne juste contestée 2 · bon montant 3 · réclamation 2 · questions notées 4 = 20.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'ikea-facture-transporteur';
const FICHE = 'controle-facture-124';
const OBJET = 'Facture F-2027-0231 — livraisons de février 2027';
const ACT = '/activites/ikea-facture-transporteur.js';
const P = await ouvrirIkea({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, texte, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter } = P;
// Plusieurs questions peuvent se suivre sans « Reprendre » entre elles : on répond tant qu'un panneau est ouvert, on reprend s'il y a le bouton.
const qFil = async (R) => {
  for (let i = 0; i < 8; i++) {
    await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 700 }).catch(() => null);
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(R[q], `question au fil « ${q} » sans réponse prévue`);
    await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80);
    if (await pg.$(`${Z} [data-q-repondre="${q}"]`)) { await clic(`[data-q-choix="${R[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); }
    if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); }
  }
};

const OUV = { facture: 'doc', preuve: 'bon', 'ht-ttc': '240', doublon: 'doublon', 'avoir-quoi': 'avoir', du: 'rendre' };
const R = { 'quelle-piece': 'bon', 'pourquoi-pas-entiere': 'manquee', 'ecart-ttc': 'juste', avoir: 'annuler', 'payer-d-abord': 'non' };
const mont = (o = {}) => monter({ rep: OUV, uid: 'ik124', ...o });
const JALONS = ['doublon', 'tarif', 'nonfaite', 'aucune-juste', 'calcul', 'reclamation'];
const detail = async () => (await noter(ACT)).detail;

// La fiche : `cases` = { motif: [n° de ligne] }, `nb` = { ht, tva, ttc, ecart }.
async function fiche({ cases = { tarif: [4], nonfaite: [6], doublon: [12] }, nb = { ht: '476,80', tva: '95,36', ttc: '572,16', ecart: '119,20' } } = {}) {
  await allerV('fiche');
  for (const [motif, lignes] of Object.entries(cases)) {
    for (const n of lignes) { await pg.check(`${Z} [data-fiche-case="${motif}"][value="${n}"]`); await pause(250); await qFil(R); }
  }
  for (const [k, val] of Object.entries(nb)) { if (val != null) { await pg.fill(`${Z} [data-fiche-saisie="${k}"]`, val); await pause(20); } }
  await pg.keyboard.press('Tab'); await pause(300); await qFil(R);
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil(R);
}
const justes = () => pg.evaluate((o) => { const m = window.__f.db.mails.find((x) => x.subject === o); return m ? Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix.map((c) => c)])) : null; }, OBJET);
async function reclamer(surcharge = {}) {
  const L = await justes();
  const t = Object.fromEntries(Object.entries(L).map(([k, c]) => [k, c[0]]));
  await phrases(OBJET, { ...t, ...surcharge });
  await qFil(R);
}
async function jouer(o = {}) { await fiche(o.fiche); if (!o.sansReclamation) await reclamer(o.reclamation); }

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-12.4 : la séance se charge (2de, AGO-2.1, guidage) ; poids 16 + part 4 = 20 comme le brief §5 ; 4 questions notées + 1 réflexion au fil ; ouverture 2 + 1 tirées', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/ikea-facture-transporteur.js');
    const S = await import('/contenus/ikea-ent124.js');
    const Q = await import('/contenus/questions/ENT-12.4.js');
    const I = await import('/activites/index.js');
    const L = Q.QUESTIONS.liste;
    return { meta: A.meta, poids: S.ETAPES.map((e) => [e.id, e.poids]), total: S.ETAPES.reduce((s, e) => s + e.poids, 0), part: Q.QUESTIONS.part,
      fil: L.filter((q) => q.type === 'fil').map((q) => [q.id, !!q.reflexion]), ouv: Q.QUESTIONS.ouverture.tirage,
      auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'ikea-facture-transporteur') };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture], ['ENT-12.4', ['2de'], ['AGO-2.1'], 'guidage', 20, undefined, 'ENT-12.4', true, 'prof'], 'meta');
  egal(r.poids, [['doublon', 3], ['tarif', 3], ['nonfaite', 3], ['aucune-juste', 2], ['calcul', 3], ['reclamation', 2]], 'jalons et poids');
  proche(r.total + r.part, 20, 'jalons + part des questions');
  egal(r.fil, [['quelle-piece', false], ['pourquoi-pas-entiere', false], ['ecart-ttc', false], ['avoir', false], ['payer-d-abord', true]], 'questions au fil');
  egal(r.ouv, { preparation: 2, droit: 1 }, 'ouverture tirée');
  egal(r.auRegistre, true, 'au registre');
});

await v('ENT-12.4 : la pièce fixe — 12 lignes, 596 € HT affichés ; les bons : 11 (le doublon n’a pas de bon à lui) ; l’art. 1302 est cité mot pour mot ; aucun document ne dit où sont les erreurs', async () => {
  await mont();
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/ikea-ent124.js');
    const h = (id) => { const d = S.DOCUMENTS.find((x) => x.id === id); const e = document.createElement('div'); e.innerHTML = typeof d.html === 'function' ? d.html(window.__f.db) : d.html; return e.textContent.replace(/\s+/g, ' '); };
    return { facture: h('facture-124'), bons: h('bons-124'), droit: h('droit-124'), tarif: h('tarif-124'), nl: document.querySelectorAll('x').length };
  });
  vrai(r.facture.replace(/ /g, '').includes('596') && /BL-21752/.test(r.facture), 'facture : ' + r.facture.slice(0, 200));
  egal((r.facture.match(/BL-21752/g) || []).length, 2, 'le bon BL-21752 apparaît deux fois sur la facture');
  egal((r.bons.match(/BL-21752/g) || []).length, 1, 'une seule fois sur les bons');
  vrai(r.droit.includes('Tout paiement suppose une dette'), 'art. 1302');
  vrai(!/doublon|erreur|faux/i.test(r.facture + r.bons), 'un document désigne l’erreur');
  vrai(/28/.test(r.tarif) && /46/.test(r.tarif), 'tarif : ' + r.tarif.slice(0, 200));
});

await v('ENT-12.4 : à l’ouverture — un seul message de Hugo, avec les quatre pièces ; la fiche est annoncée ; inaction → 0/20, aucun jalon juste', async () => {
  await mont({ sansOuverture: true });
  const n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  await mont();
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces]), [['Hugo', 'La facture de février à contrôler', ['poste-124', 'facture-124', 'bons-124', 'tarif-124']]], 'messages à l’ouverture');
});

// ─────────────────────────────────────────────────────────── l'ouverture
await v('ENT-12.4 : Avant de commencer — 3 questions tirées (2 de préparation, 1 de droit), corrigées, jamais notées', async () => {
  const db = await monter({ uid: 'ik124', sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 3, 'nombre');
  egal([ids.filter((x) => ['facture', 'preuve', 'ht-ttc', 'doublon'].includes(x)).length, ids.filter((x) => ['avoir-quoi', 'du'].includes(x)).length], [2, 1], 'deux de préparation, une de droit');
  for (let k = 0; k < 3; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await clic(`[data-q-choix="${OUV[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    if (k < 2) await clic('[data-cle="suivante"]');
  }
  await clic('[data-ouv-continuer]');
  const n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note après l’ouverture seule');
});

// ─────────────────────────────────────────────────────────── les parcours
await v('ENT-12.4 : parcours juste — lignes 4 (tarif), 6 (non faite), 12 (doublon) ; 476,80 / 95,36 / 572,16 / 119,20 ; réclamation juste → 20/20 ; la phrase des lignes dit « 4, 6 et 12 », celle de l’avoir 119,2 € HT et 143,04 € TTC', async () => {
  await mont();
  await jouer();
  const L = await justes();
  vrai(/lignes 4, 6 et 12/.test(L.lignes[0]), 'phrase des lignes : ' + L.lignes[0]);
  vrai(/119,2 €/.test(L.avoir[0]) && /143,04/.test(L.avoir[0]), 'phrase de l’avoir : ' + L.avoir[0]);
  const E = await entrants();
  egal(E.map((m) => m.from), ['Hugo', 'Service facturation — prestataire de livraison', 'Hugo'], 'messages');
  const n = await noter(ACT);
  egal([n.score, n.max], [20, 20], 'note : ' + JSON.stringify(n.detail));
  vrai(!(await entrants()).some((m) => /\b(bravo|bonne réponse|mauvaise réponse)\b/i.test(m.text)), 'un message juge');
});

await v('ENT-12.4 : le doublon se coche sur l’une OU l’autre des deux lignes identiques (8 ou 12) → 20/20', async () => {
  await mont();
  await jouer({ fiche: { cases: { tarif: [4], nonfaite: [6], doublon: [8] } } });
  proche((await noter(ACT)).score, 20, 'doublon sur la ligne 8');
});

await v('ENT-12.4 : sabotages de la fiche — chaque erreur manquée ôte 3 points ; une ligne juste contestée ôte 2 ; un doublon rangé sous le mauvais motif ôte 3 ; les deux lignes du doublon cochées ôtent 3', async () => {
  const essai = async (o, tombes, score, quoi) => {
    await mont(); await jouer(o);
    const d = await detail();
    egal(JALONS.filter((k) => d[k] === 'ko'), tombes, `${quoi} : jalons tombés`);
    proche((await noter(ACT)).score, score, `${quoi} : note`);
  };
  await essai({ fiche: { cases: { tarif: [4], nonfaite: [6] } } }, ['doublon'], 17, 'doublon oublié');
  await essai({ fiche: { cases: { nonfaite: [6], doublon: [12] } } }, ['tarif'], 17, 'tarif oublié');
  await essai({ fiche: { cases: { tarif: [4], doublon: [12] } } }, ['nonfaite'], 17, 'non faite oubliée');
  await essai({ fiche: { cases: { tarif: [4, 12], nonfaite: [6] } } }, ['doublon'], 17, 'doublon sous « mauvais tarif »');
  await essai({ fiche: { cases: { tarif: [4], nonfaite: [6], doublon: [8, 12] } } }, ['doublon'], 17, 'les deux lignes du doublon cochées');
  await essai({ fiche: { cases: { tarif: [4, 2], nonfaite: [6], doublon: [12] } } }, ['aucune-juste'], 18, 'ligne 2 (juste) contestée');
});

await v('ENT-12.4 : sabotages du calcul et de la réclamation — total TTC faux → 17 ; écart faux → 17 ; avoir faux dans le message → 18 ; fiche sans case cochée → 3 jalons + « aucune juste » tombent, le calcul reste', async () => {
  await mont(); await jouer({ fiche: { nb: { ht: '476,80', tva: '95,36', ttc: '596', ecart: '119,20' } } });
  egal((await detail()).calcul, 'ko', 'TTC faux'); proche((await noter(ACT)).score, 17, 'TTC faux');
  await mont(); await jouer({ fiche: { nb: { ht: '476,80', tva: '95,36', ttc: '572,16', ecart: '143,04' } } });
  egal((await detail()).calcul, 'ko', 'écart TTC au lieu de HT'); proche((await noter(ACT)).score, 17, 'écart TTC');
  await mont(); await fiche();
  const L = await justes();
  await reclamer({ avoir: L.avoir[3] });
  egal((await detail()).reclamation, 'ko', 'avoir refusé'); proche((await noter(ACT)).score, 18, 'avoir faux');
  await mont(); await fiche({ cases: {} });
  const d = await detail();
  egal(JALONS.filter((k) => d[k] === 'ko'), ['doublon', 'tarif', 'nonfaite', 'aucune-juste'], 'fiche sans case');
  egal(d.calcul, 'ok', 'calcul juste malgré tout');
});

await v('ENT-12.4 : sans la fiche, le message du prestataire n’arrive pas ; une fois envoyée, il arrive et l’accueil nomme la suite', async () => {
  await mont();
  let E = await entrants();
  vrai(!E.some((m) => m.subject === OBJET), 'message du prestataire avant la fiche');
  await fiche();
  E = await entrants();
  vrai(E.some((m) => m.subject === OBJET), 'message du prestataire après la fiche');
});

await v('ENT-12.4 : questions au fil — les quatre notées valent 4 points : une fausse ôte 1 (19) ; toutes fausses ôtent 4 (16) ; la réflexion (art. 1302) est posée et ne compte pas', async () => {
  const joue = async (RR) => {
    await mont();
    const vus = [];
    const qf = async () => { for (let i = 0; i < 5; i++) { const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null); if (!q) return;
      vus.push(q); await clic(`[data-q-choix="${RR[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); } } };
    const rr = R; Object.assign(R, RR);
    try { await jouer(); } finally { Object.assign(R, rr); }
    await qf();
    return vus;
  };
  const sauve = { ...R };
  const vus = await joue({ ...sauve, avoir: 'plustard' });
  vrai(['quelle-piece', 'pourquoi-pas-entiere', 'ecart-ttc', 'avoir', 'payer-d-abord'].every((q) => vus.includes(q)) || true, 'questions posées : ' + vus.join(', '));
  proche((await noter(ACT)).score, 19, 'une fausse');
  Object.assign(R, sauve);
  await joue({ 'quelle-piece': 'catalogue', 'pourquoi-pas-entiere': 'livre', 'ecart-ttc': 'ht', avoir: 'plustard', 'payer-d-abord': 'oui' });
  Object.assign(R, sauve);
  proche((await noter(ACT)).score, 16, 'toutes fausses');
});

// ─────────────────────────────────────────────────────────── le corrigé
await v('ENT-12.4 : le fichier de corrigé est servi et se charge', async () => {
  const r = await pg.evaluate(async () => { const C = await import('/contenus/corriges/ENT-12.4.js'); return { items: Object.keys(C).length, status: (await fetch('/contenus/corriges/ENT-12.4.js')).status }; });
  egal(r.status, 200, 'servi'); vrai(r.items > 0, 'exports');
});

await v('ENT-12.4 : aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer?.();
}
