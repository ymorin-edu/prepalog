// Suite de tests de Prepalog — bloc « fb-6.9 » : ENT-6.9 (France Boissons, la tournée de la côte).
// `node outils/test.mjs fb-6.9` ne lance que ce bloc. Aides communes : `outils/test/france-boissons/commun.mjs`. Les cas du moteur (fenêtres
// d'ouverture, approche, conduite, pause, sans quai, profil porteur) sont dans le bloc `carte` (chantier D-9).
//
// Valeurs ÉCRITES À LA MAIN (calage `docs/briefs/france-boissons/calage-6.9.py`, jeu C retenu par Tristan le 12/10/2026 ; 142 km
// d'autoroute à 90 km/h, 45 km/h sur la côte, 20 min par arrêt, départ 06:00) :
//   tournée de référence D-R-T-V-M-G : sortie à Touques 07 h 35, Café de l'Étal 07 h 44 → 08 h 04, Malo (5e) arrivée 09 h 33, attente,
//     départ 10 h 20 ; conduite 4 h 24 ; retour 12 h 51 (SMS : 12 h 45, pas de pause) ;
//   2e tournée juste D-T-R-V-G-M : retour 12 h 25 (SMS : 12 h 30), aucune attente ;
//   nord → sud R-T-D-V-M-G : le café de Deauville raté (4 h 22, retour 12 h 51) ;
//   zigzag D-R-V-T-M-G : horaires tenus, 4 h 48 de conduite (pause due), retour 13 h 36 ;
//   Malo en premier M-D-R-T-V-G : café de Deauville et Houlgate ratés, 4 h 43, retour 15 h 35 (après 15 h 30).
//   720 ordres : 42 tiennent tout ; 80 tiennent les horaires mais dépassent 4 h 30 (0 si l'autoroute ne comptait pas dans la conduite).
// Jalons (poids validés par Tristan le 12/10/2026, option A) : clients 0,5 · horaires 2,5 · conduite 2 · retour 1,5 · aller 1 · heures 2 ·
// conduite-totale 1,5 · pause 1 · heure-retour 1 · sms-arrets 1 · sms-retour 1 · sms-pause 1 ; questions : qui-attend-retour 1,
// risque-sans-pause 1,5, lire-le-sms 1,5.

import { ouvrirFB } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, entrants, horodate, erreursF } = F;

const ID69 = 'france-boissons-tournee';
const TID = 'fb-ent69';
const REP69 = { 'minutes-90': 'juste', 'pas-avant': 'attend', 'feuille-route': 'ordre', 'jour-de-marche': 'place',
  'sms-au-volant': 'non', 'vitesse-porteur': '90', 'dechargement-pause': 'non', 'rue-pietonne': 'maire' };
const monter69 = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/france-boissons-tournee.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  const Q = ((db.questions = db.questions || {})['france-boissons-tournee'] = db.questions['france-boissons-tournee'] || {});
  for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'fb69' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'FB',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { ...o, rep: REP69 });

const BONNES69 = { 'pourquoi-premier': 'horaire', 'risque-sans-pause': 'amende', 'lire-le-sms': 'arret' };
// Répond au panneau ouvert (puis reprend), tant qu'il y en a un. La question libre reçoit une phrase.
async function qrep69(choix = BONNES69) {
  for (let i = 0; i < 5; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    if (await present(`[data-q-libre="${id}"]`)) await pg.fill(`${Z} [data-q-libre="${id}"]`, 'Il aurait attendu Malo.');
    else await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
const etatT = async () => ((await base()).transport || {})[TID]?.tournee || {};
// Clique les clients sur la carte, dans l'ordre (le clic sur un point de la carte, comme l'élève).
async function cliquer(ordre) {
  await aller('tournee');
  for (const id of ordre) {
    await pg.$eval(`${Z} [data-clic-point="${id}"]`, (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
    await pause(40);
    await qrep69();
  }
}
const taper = async (ref, texte) => {
  await pg.$eval(`${Z} [data-gr-cel="${ref}"]`, (td) => td.click());
  await pg.fill(`${Z} [data-gr-barre]`, texte);
  await pause(30);
};
// Les formules d'un élève qui suit les aides, sur une tournée de six arrêts ; `attente` = le rang (1 à 6) où le camion attend Malo.
const FORMULES = (attente, pauseTapee = '0') => {
  const c = { B10: '=B3/B4*60', B11: '=B2+B10' };
  for (let i = 0; i < 6; i++) {
    const r = 13 + i;
    c[`C${r}`] = i === 0 ? '=B11+B13/B5*60' : `=D${r - 1}+B${r}/B5*60`;
    c[`D${r}`] = i + 1 === attente ? `=E${r}+B6` : `=C${r}+B6`;
  }
  return Object.assign(c, { B21: '=SOMME(B13:B19)', B22: '=B21/B5*60', B23: '=B10+B22+B10', B24: pauseTapee, B25: '=D18+B19/B5*60+B10+B24' });
};
async function remplir(cases) {
  for (const [ref, f] of Object.entries(cases)) await taper(ref, f);
  await pg.click(`${Z} [data-gr-verifier]`);
  await pause(120);
}
async function envoyerTournee() {
  await pg.$eval(`${Z} [data-tour-terminer]`, (b) => b.click());
  await pause(40);
  await pg.$eval(`${Z} [data-tour-terminer]`, (b) => b.click());
  await pause();
}
async function etape69(val = 'quai') {
  if (!(await present('[data-qf-attend="avant-sms"] [data-q-aller-etape]'))) throw new Error('pas de bandeau « Karim t’attend » pour avant-sms');
  await pg.click(`${Z} [data-qf-attend="avant-sms"] [data-q-aller-etape]`);
  await pause();
  await pg.click(`${Z} [data-q-choix="${val}"][data-q="qui-attend-retour"]`);
  await pg.click(`${Z} [data-q-repondre="qui-attend-retour"]`);
  await pause();
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
}
const NOMS = { D: 'Café de l\'Étal (Deauville)', R: 'Le Relais du Phare (Villerville)', T: 'Brasserie Le Cabestan (Trouville-sur-Mer)',
  M: 'La Cabane à Malo (Villers-sur-Mer)', V: 'Hôtel des Vaches Noires (Villers-sur-Mer)', G: 'Le Bistrot de la Digue (Houlgate)' };
const SMS = (a1, a2, a3, retour, pauseP = 'Pas de pause à prévoir.') => ({ a1: `1er arrêt : ${NOMS[a1]}`, a2: `2e arrêt : ${NOMS[a2]}`,
  a3: `3e arrêt : ${NOMS[a3]}`, retour: `Retour prévu à Buchelay vers ${retour}.`, pause: pauseP });
// Le SMS à Lucas (le point d'étape a ouvert son message) : une phrase par ligne (la pause en dernier : elle fait arriver une question).
async function sms69(m) {
  if (!(await present('[data-repondre]'))) {
    await aller('mail');
    const id = await pg.evaluate(() => window.__f.db.mails.find((x) => x.folder === 'in' && x.cle === 'lucas').id);
    await pg.click(`${Z} [data-mail="${id}"]`);
    await pause();
  }
  await pg.click(`${Z} [data-repondre]`);
  await pause();
  for (const [l, t] of Object.entries(m)) {
    if (!(await present(`select[data-phrase="${l}"]`))) {
      await pg.click(`${Z} [data-repondre]`);
      await pause();
    }
    await pg.selectOption(`${Z} select[data-phrase="${l}"]`, { label: t });
    await pause();
    await qrep69();
  }
  if (!(await present('#formPhr button[type="submit"]'))) { await pg.click(`${Z} [data-repondre]`); await pause(); }
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await pause();
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  await qrep69();
}
const JALONS69 = ['clients', 'horaires', 'conduite', 'retour', 'aller', 'heures', 'conduite-totale', 'pause', 'heure-retour',
  'sms-arrets', 'sms-retour', 'sms-pause', 'question:qui-attend-retour', 'question:risque-sans-pause', 'question:lire-le-sms'];
const POIDS69 = { clients: 0.5, horaires: 2.5, conduite: 2, retour: 1.5, aller: 1, heures: 2, 'conduite-totale': 1.5, pause: 1, 'heure-retour': 1,
  'sms-arrets': 1, 'sms-retour': 1, 'sms-pause': 1, 'question:qui-attend-retour': 1, 'question:risque-sans-pause': 1.5, 'question:lire-le-sms': 1.5 };
const etats69 = (n) => JALONS69.map((j) => [j, n.detail[j]]);
const sauf69 = (faux, etat = 'ko') => JALONS69.map((j) => [j, faux.includes(j) ? etat : 'ok']);
const points69 = (faux) => 20 - faux.reduce((s, j) => s + POIDS69[j], 0);
async function parcours69(o) {
  await monter69({ uid: o.uid });
  await cliquer(o.ordre);
  await remplir(o.cases);
  await envoyerTournee();
  await etape69(o.etape);
  await sms69(o.sms);
  return note();
}

// ─────────────────────────────────────────────────────────── le calage, jugé par le vrai moteur (sans écran)
// Les jalons de la tournée et de la feuille, sur une base fabriquée (tournée envoyée, feuille remplie).
const jalonsSans = (ordre, cases, termine = true) => pg.evaluate(async ({ ordre, cases, termine }) => {
  const S = await import('/contenus/france-boissons-ent69.js');
  const db = { transport: { 'fb-ent69': { tournee: { ordre, quai: [], report: {}, juge: {}, valide: null, termine: termine ? 1 : null,
    grille: { cases, juge: {}, valide: null } } } } };
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, e.verifier(db).status]));
}, { ordre, cases, termine });
const TOURNEE_J = ['clients', 'horaires', 'conduite', 'retour'];
const FEUILLE_J = ['aller', 'heures', 'conduite-totale', 'pause', 'heure-retour'];
const ko = (r, L) => L.filter((j) => r[j] !== 'ok');

await v('ENT-6.9 : calage — le moteur retrouve le calage (42 ordres justes sur 720, 80 « horaires tenus mais plus de 4 h 30 ») et le calcul pur du contenu (corrigé, menus du SMS) dit la même chose que lui sur les 720 ordres', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent69.js');
    const D = await import('/contenus/france-boissons-ent69-donnees.js');
    const perm = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perm([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
    let bons = 0, piege3 = 0;
    const ecarts = [];
    for (const o of perm(D.IDS)) {
      const b = S.bilanMoteur({ ordre: o, quai: [], report: {}, juge: {} });
      const p = D.journee(o);
      if (!b.creneauxRates.length && !b.pauseDue && !b.enRetard) bons++;
      if (!b.creneauxRates.length && b.pauseDue) piege3++;
      const diff = Math.abs(b.km - p.km) > 1e-9 || Math.abs(b.conduite - p.conduite) > 1e-9 || Math.abs(b.arrivee - p.arrivee) > 1e-9
        || b.creneauxRates.join() !== p.creneauxRates.join() || b.pauseDue !== p.pauseDue
        || o.some((id) => Math.abs(b.departs[id] - p.departs[id]) > 1e-9 || Math.abs(b.troncons[id] - p.troncons[id]) > 1e-9)
        || Math.abs(b.kmRetour - p.kmRetour) > 1e-9;
      if (diff) ecarts.push(o.join('-'));
    }
    const h = (o) => { const b = S.bilanMoteur({ ordre: o, quai: [], report: {}, juge: {} }); return [D.hhmm(b.arrivee), D.dureeDit(b.conduite), b.creneauxRates.join(), b.pauseDue, b.enRetard]; };
    return { bons, piege3, ecarts: ecarts.slice(0, 3), n: ecarts.length,
      ref: h(['D', 'R', 'T', 'V', 'M', 'G']), deux: h(['D', 'T', 'R', 'V', 'G', 'M']), nordSud: h(['R', 'T', 'D', 'V', 'M', 'G']),
      zigzag: h(['D', 'R', 'V', 'T', 'M', 'G']), malo: h(['M', 'D', 'R', 'T', 'V', 'G']), solution: D.SOLUTION };
  });
  egal([r.bons, r.piege3], [42, 80], 'ordres justes, piège du jalon 3');
  egal(r.n, 0, `calcul pur ≠ moteur : ${r.ecarts.join(' ; ')}`);
  egal(r.ref, ['12 h 51', '4 h 24', '', false, false], 'tournée de référence');
  egal(r.deux, ['12 h 25', '4 h 25', '', false, false], '2e tournée juste');
  egal(r.nordSud, ['12 h 51', '4 h 22', 'D', false, false], 'nord → sud : le café de Deauville raté');
  egal(r.zigzag, ['13 h 36', '4 h 48', '', true, false], 'zigzag : horaires tenus, pause due');
  egal(r.malo, ['15 h 35', '4 h 43', 'D,G', true, true], 'Malo en premier');
  egal(r.solution, ['D', 'R', 'T', 'V', 'M', 'G'], 'la solution de référence du contenu (corrigé)');
});

await v('ENT-6.9 : jalons sans écran — référence juste ; chaque piège fait tomber SON jalon ; une mauvaise tournée bien calculée garde ses points de calcul ; rien de vrai sans envoi', async () => {
  const REF = ['D', 'R', 'T', 'V', 'M', 'G'];
  let r = await jalonsSans(REF, FORMULES(5));
  egal(ko(r, [...TOURNEE_J, ...FEUILLE_J]), [], 'référence');
  r = await jalonsSans(['D', 'T', 'R', 'V', 'G', 'M'], FORMULES(0));
  egal(ko(r, [...TOURNEE_J, ...FEUILLE_J]), [], '2e tournée juste');
  r = await jalonsSans(['R', 'T', 'D', 'V', 'M', 'G'], FORMULES(5));
  egal(ko(r, [...TOURNEE_J, ...FEUILLE_J]), ['horaires'], 'nord → sud');
  r = await jalonsSans(['D', 'R', 'V', 'T', 'M', 'G'], FORMULES(5, '45'));
  egal(ko(r, [...TOURNEE_J, ...FEUILLE_J]), ['conduite'], 'zigzag (bien calculé, pause comprise)');
  r = await jalonsSans(['M', 'D', 'R', 'T', 'V', 'G'], FORMULES(1, '45'));
  egal(ko(r, [...TOURNEE_J, ...FEUILLE_J]), ['horaires', 'conduite', 'retour'], 'Malo en premier, bien calculé : la feuille garde ses points');
  // Pièges de la feuille, sur la tournée de référence.
  r = await jalonsSans(REF, { ...FORMULES(5), D17: '=C17+B6' });
  egal(ko(r, FEUILLE_J), ['heures'], 'attente oubliée chez Malo');
  r = await jalonsSans(REF, { ...FORMULES(5), B23: '=B22' });
  egal(ko(r, FEUILLE_J), ['conduite-totale'], 'conduite sans l’autoroute');
  r = await jalonsSans(REF, { ...FORMULES(5), B22: '=(B21/B5*60)+6*B6' });
  // Sa conduite (fausse) dépasse alors 4 h 30 sur SA feuille : « 0 » de pause y est incohérent, le jalon de la pause tombe aussi.
  egal(ko(r, FEUILLE_J), ['conduite-totale', 'pause'], 'temps aux arrêts compté dans la conduite');
  r = await jalonsSans(['D', 'R', 'V', 'T', 'M', 'G'], FORMULES(5, '0'));
  egal(ko(r, FEUILLE_J), ['pause'], 'pause « non » avec 4 h 48');
  r = await jalonsSans(REF, { ...FORMULES(5), B25: '=D18+B19/B5*60+B10' });
  egal(ko(r, FEUILLE_J), [], 'heure de retour sans « + B24 » quand la pause vaut 0 : juste');
  r = await jalonsSans(['D', 'R', 'V', 'T', 'M', 'G'], { ...FORMULES(5, '45'), B25: '=D18+B19/B5*60+B10' });
  egal(ko(r, FEUILLE_J), ['heure-retour'], 'pause oubliée dans l’heure de retour');
  r = await jalonsSans(REF, { ...FORMULES(5), B10: '94.67' });
  egal(ko(r, FEUILLE_J), ['aller'], 'nombre tapé au lieu d’une formule');
  // Rien de vrai sans envoi, même une feuille complète.
  r = await jalonsSans(REF, FORMULES(5), false);
  egal(Object.values(r).every((s) => s === 'attente'), true, 'avant l’envoi : ' + JSON.stringify(r));
  r = await jalonsSans([], {}, false);
  egal(Object.values(r).every((s) => s === 'attente'), true, 'rien fait');
});

await v('ENT-6.9 : sabotages — sans l’attente à l’ouverture, Malo en premier ne coûte plus le retour ; sans l’autoroute dans la conduite, le piège du jalon 3 disparaît ; avec les arrêts comptés dans la conduite, la tournée de référence dépasserait 4 h 30', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent69.js');
    const D = await import('/contenus/france-boissons-ent69-donnees.js');
    const { creerTournee } = await import('/core/types/tournee.js');
    const sansAttente = creerTournee({ plan: S.PLAN, ...S.TOURNEE, points: S.TOURNEE.points.map((p) => (p.id === 'M' ? { ...p, creneau: undefined } : p)) });
    const e = { ordre: ['M', 'D', 'R', 'T', 'V', 'G'], quai: [], report: {}, juge: {} };
    const perm = (a) => (a.length <= 1 ? [a] : a.flatMap((x, i) => perm([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
    let piegeSansAuto = 0;
    for (const o of perm(D.IDS)) { const b = D.journee(o); if (!b.creneauxRates.length && b.conduite - 2 * D.MIN_AUTOROUTE > 270) piegeSansAuto++; }
    const ref = S.bilanMoteur({ ordre: D.SOLUTION, quai: [], report: {}, juge: {} });
    return { avec: S.bilanMoteur(e).enRetard, sans: sansAttente.bilan(e).enRetard, piegeSansAuto,
      ref: ref.conduite <= 270, refArrets: ref.conduite + 6 * D.JOUR.service > 270 };
  });
  egal([r.avec, r.sans], [true, false], 'Malo en premier : en retard avec l’attente, plus sans elle');
  egal(r.piegeSansAuto, 0, 'sans l’autoroute dans la conduite : aucun ordre « horaires tenus, plus de 4 h 30 »');
  egal([r.ref, r.refArrets], [true, true], 'référence sous 4 h 30, au-dessus si l’on comptait les arrêts');
});

await v('ENT-6.9 : la carte — chaque client dans sa commune ; un itinéraire porteur pour chaque paire d’arrêts (et depuis/vers la sortie de Touques)', async () => {
  const r = await pg.evaluate(async () => {
    const { CARTE } = await import('/contenus/fb-ent69-carte.js');
    const ids = CARTE.clients.map((c) => c.id);
    const manque = [];
    for (const a of ['depart', ...ids]) for (const b of [...ids, 'arrivee']) if (a !== b && !CARTE.trajets[`${a}|${b}`]) manque.push(`${a}|${b}`);
    return { communes: Object.fromEntries(CARTE.clients.map((c) => [c.id, c.quartier])), manque, depart: CARTE.depart.nom };
  });
  egal(r.communes, { D: 'deauville', R: 'villerville', T: 'trouville', M: 'villers', V: 'villers', G: 'houlgate' }, 'communes');
  egal(r.manque, [], 'itinéraires manquants');
  egal(r.depart, 'Sortie de Touques', 'point d’entrée');
});

// ─────────────────────────────────────────────────────────── à l'écran
await v('ENT-6.9 : ouverture — message de Karim et ses pièces (6 h 30, 18 juin 2027) ; menu ; bandeau d’autoroute ; « Envoyer » refusé tant qu’un client manque', async () => {
  await monter69({ uid: 'fb69-ouv' });
  const E = await entrants();
  egal(E.map((m) => [m.subject, m.pieces]), [['La tournée de la côte : à toi d’ordonner les arrêts', ['clients', 'droit', 'organigramme', 'annuaire']]], 'messages');
  egal(horodate(E[0].ts), [2027, 6, 18, 6, 30], 'heure du scénario');
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue).filter((x) => x !== 'accueil')), ['ouverture', 'mail', 'plan', 'tournee'], 'menu');
  await cliquer(['D', 'R', 'T', 'V', 'M']);
  vrai(/A13 Buchelay → sortie de Touques : 142 km d’autoroute, à l’aller et au retour \(90 km\/h\)/.test(await pg.textContent(`${Z} #entMain`)), 'bandeau d’autoroute');
  await envoyerTournee();
  vrai(await present('[data-tour-refus]'), 'pas de refus avec un client à placer');
  egal((await etatT()).termine || null, null, 'tournée envoyée incomplète');
  egal(((await base()).questions[ID69]['pourquoi-premier'] || {}).texte?.enonce, 'Tu mets Café de l\'Étal en premier. Pourquoi ?', 'Karim cite le premier arrêt');
  egal(erreursF, [], 'erreurs JS');
});

await v('ENT-6.9 : « que, pas de combien » — Malo en premier : la page dit QUE les horaires sont ratés, QUE la pause est due, QUE le retour est trop tard, sans heure d’arrivée, sans retard, sans conduite', async () => {
  await monter69({ uid: 'fb69-que' });
  await cliquer(['M', 'D', 'R', 'T', 'V', 'G']);
  const t = (await pg.textContent(`${Z} #entMain`)).replace(/\s+/g, ' ');
  vrai(/Pause de 45 min obligatoire/.test(t), 'la pause due n’est pas dite');
  vrai(/retour à Buchelay manqué/.test(t), 'le retour trop tard n’est pas dit');
  vrai(/Trop tôt/.test(t), 'l’attente chez Malo n’est pas dite');
  // Heures réelles de cet ordre (écrites à la main) : arrivée chez Malo 07 h 53, retour 15 h 35, conduite 4 h 43.
  const interdits = ['07 h 53', '7 h 53', '15 h 35', '4 h 43', 'min d’attente', 'de retard', 'en retard de', 'raté de'].filter((x) => t.includes(x));
  egal(interdits, [], 'chiffres donnés par la page');
});

await v('ENT-6.9 : parcours juste — 20/20 ; feuille vérifiée (07 h 35, attente chez Malo, 12 h 51) ; point d’étape qui cite l’heure de SA feuille ; SMS ; fin de Lucas et de Karim ; photo', async () => {
  await monter69({ uid: 'fb69-juste' });
  await cliquer(['D', 'R', 'T', 'V', 'M', 'G']);
  await remplir(FORMULES(5));
  const cel = (ref) => pg.$eval(`${Z} [data-gr-cel="${ref}"]`, (td) => td.textContent.replace(/\s+/g, ' '));
  vrai((await cel('B11')).includes('07 h 35'), 'sortie à Touques : ' + await cel('B11'));
  vrai((await cel('C17')).includes('09 h 33') && (await cel('D17')).includes('10 h 20'), 'Malo : ' + await cel('C17') + ' / ' + await cel('D17'));
  vrai((await cel('B25')).includes('12 h 51'), 'retour : ' + await cel('B25'));
  egal(Object.values((await etatT()).grille.juge).every((x) => x === 'ok'), true, 'feuille vérifiée toute juste');
  vrai(!(await entrants()).some((m) => m.cle === 'lucas'), 'le SMS de Lucas arrive avant l’envoi');
  await envoyerTournee();
  vrai(!!(await etatT()).termine, 'tournée non envoyée');
  vrai(await present('[data-tour-termine]'), 'la vue ne dit pas que la tournée est envoyée');
  vrai(!(await present('[data-gr-verifier]')), 'la feuille n’est pas figée');
  vrai((await entrants()).some((m) => m.cle === 'lucas' && m.subject === 'SMS de Lucas : l’ordre des arrêts ?'), 'SMS de Lucas');
  await aller('etape:avant-sms');
  vrai(/Ta feuille donne un retour à Buchelay à 12 h 51/.test(await pg.textContent(`${Z} [data-q-etape]`)), 'le point d’étape ne cite pas sa feuille');
  await pg.click(`${Z} [data-q-choix="quai"][data-q="qui-attend-retour"]`);
  await pg.click(`${Z} [data-q-repondre="qui-attend-retour"]`);
  await pause();
  vrai(await present('[data-q-verdict="ok"]'), 'corrigée tout de suite');
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
  // Le menu de l'heure de retour : 4 heures au quart d'heure, dont 12 h 45 (la plus proche de 12 h 51).
  const id = await pg.evaluate(() => window.__f.db.mails.find((x) => x.folder === 'in' && x.cle === 'lucas').id);
  const decl = (await base()).mails.find((m) => m.id === id).phrases.lignes.find((l) => l.id === 'retour');
  egal([decl.choix.length, decl.choix[decl.juste]], [4, 'Retour prévu à Buchelay vers 12 h 45.'], 'menu de l’heure de retour');
  await sms69(SMS('D', 'R', 'T', '12 h 45'));
  const fin = (await entrants()).map((m) => m.subject);
  vrai(fin.includes('RE : SMS') && fin.includes('Merci'), 'fin : ' + fin.join(' | '));
  vrai(/tu l’accueilleras au quai/.test((await entrants()).find((m) => m.subject === 'Merci').text), 'Karim annonce ENT-6.10');
  const Q = (await base()).questions[ID69];
  egal(Q['malo-en-premier'].libre, 'Il aurait attendu Malo.', 'la réflexion libre est rangée');
  const N = await note();
  egal([N.score, N.max], [20, 20], 'note');
  egal(etats69(N), sauf69([]), 'jalons');
  vrai(!!(await base()).points[ID69], 'photo de fin');
  egal(erreursF, [], 'erreurs JS');
});

await v('ENT-6.9 : une 2e tournée juste (D-T-R-V-G-M, Malo en dernier sans attente) → 20/20, le SMS juste dit 12 h 30', async () => {
  const n = await parcours69({ uid: 'fb69-deux', ordre: ['D', 'T', 'R', 'V', 'G', 'M'], cases: FORMULES(0), sms: SMS('D', 'T', 'R', '12 h 30') });
  egal(etats69(n), sauf69([]), 'jalons');
  egal(n.score, 20, 'note');
});

await v('ENT-6.9 : le zigzag bien calculé (pause comprise) — seul « conduite » tombe ; le SMS « pas de pause » fait tomber le jalon de la pause du SMS', async () => {
  const n = await parcours69({ uid: 'fb69-zig', ordre: ['D', 'R', 'V', 'T', 'M', 'G'], cases: FORMULES(5, '45'), sms: SMS('D', 'R', 'V', '13 h 30') });
  egal(etats69(n), sauf69(['conduite', 'sms-pause']), 'jalons');
  egal(n.score, points69(['conduite', 'sms-pause']), 'note');
});

await v('ENT-6.9 : SMS — un autre 1er arrêt fait tomber « les trois premiers arrêts » ; l’heure de SA feuille fausse fait tomber l’heure de retour (calcul et SMS)', async () => {
  const cases = { ...FORMULES(5), B25: '=D18+B19/B5*60' };   // l'autoroute du retour oubliée : 11 h 16 sur sa feuille
  const n = await parcours69({ uid: 'fb69-sms', ordre: ['D', 'R', 'T', 'V', 'M', 'G'], cases, sms: SMS('R', 'R', 'T', '11 h 15') });
  egal(etats69(n), sauf69(['heure-retour', 'sms-arrets', 'sms-retour']), 'jalons');
  egal(n.score, points69(['heure-retour', 'sms-arrets', 'sms-retour']), 'note');
});

await v('ENT-6.9 : inaction — rien fait → 0/20 ; la tournée envoyée sans feuille → les jalons de la feuille faux', async () => {
  await monter69({ uid: 'fb69-rien' });
  let n = await note();
  egal([n.score, n.max], [0, 20], 'note à vide');
  await cliquer(['D', 'R', 'T', 'V', 'M', 'G']);
  await envoyerTournee();
  n = await note();
  egal(FEUILLE_J.map((j) => n.detail[j]), FEUILLE_J.map(() => 'ko'), 'feuille vide envoyée');
  egal(TOURNEE_J.map((j) => n.detail[j]), TOURNEE_J.map(() => 'ok'), 'tournée juste');
});

await v('ENT-6.9 : le corrigé se calcule (tournée de référence, feuille, SMS)', async () => {
  const c = await pg.evaluate(async () => (await import('/contenus/corriges/ENT-6.9.js')).CORRIGE);
  vrai(c.items.length >= 4, 'rubriques : ' + c.items.length);
  const t = JSON.stringify(c);
  vrai(t.includes('12 h 51') && t.includes('07 h 35') && t.includes('Café de l\'Étal'), 'valeurs de la tournée de référence');
});

await v('ENT-6.9 : aucune erreur de page pendant le bloc', async () => { egal(erreursF, [], 'erreurs JS'); });

await F.fermer();
}
