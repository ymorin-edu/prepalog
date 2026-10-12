// Suite de tests de Prepalog — bloc « fb-6.8 » : ENT-6.8 (France Boissons, chauffeurs et camions du vendredi).
// `node outils/test.mjs fb-6.8` ne lance que ce bloc. Les aides communes (contexte, page, relevé d'erreurs JavaScript, lecture de la
// base) sont dans `outils/test/france-boissons/commun.mjs`. Les demandes au moteur (D-8 : `conduite` par carte, ligne qui porte son
// camion ; questions à texte calculé) ont leurs cas dans les blocs `planning` et `questions`.
//
// Valeurs ÉCRITES À LA MAIN (calage `docs/briefs/france-boissons/calage-6.8.py`, option A : la côte sur la ligne de Lucas). Créneaux
// au quart d'heure depuis 05:00 (06:00 → 4, 06:30 → 6, 07:00 → 8, 08:30 → 14, 09:00 → 16).
//   1er envoi de référence : côte Lucas T1 06:00 · Rouen Amandine T2 06:30 · Versailles Fatou E1 06:30 · Mantes Sébastien E2 09:00 ·
//     Évreux Julien VL 06:00. Après l'imprévu : côte Lucas T1 06:00 · Rouen transporteur 07:00 · Versailles Fatou E1 06:30 · Mantes
//     Sébastien porteur de location 09:00 · Évreux Julien VL 06:00.
//   Une 2e solution (après l'imprévu) : côte Lucas T1 06:00 · Rouen transporteur 08:30 · Versailles Sébastien E1 09:00 · Mantes Amandine
//     location 09:00 · Évreux Fatou VL 06:00.
// Jalons : v1-/v2- tous, chauffeurs, camions, fenetre, conduite ; v2-vides ; doc-rouen, doc-mantes ; question:repos-sebastien,
// question:temps-transporteur (1,5 chacune). Poids validés par Tristan le 12/10/2026, écrits à la main ci-dessous.

import { ouvrirFB } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, bandeau, entrants, horodate, erreursF } = F;

const ID68 = 'france-boissons-planning';
const REP68 = { 'tournees-haute-saison': '30', 'qui-decide-camions': 'karim', 'bulle-camion': 'camion', 'sous-traiter': 'transporteur',
  'repos-11h': 'onze', 'conduite-9h': 'non', 'pause-15-30': 'oui', 'affectation-sexe': 'non' };
const monter68 = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/france-boissons-planning.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  const Q = ((db.questions = db.questions || {})['france-boissons-planning'] = db.questions['france-boissons-planning'] || {});
  for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'fb68' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'FB',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { ...o, rep: REP68 });

const BONNES68 = { 'que-verifies-tu': 'permis', 'pourquoi-vehicule': 'recharge', 'qui-transporte-mantes': 'nous' };
// Répond au panneau ouvert (puis reprend), tant qu'il y en a un.
async function qrep68(choix = BONNES68) {
  for (let i = 0; i < 4; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
const etatPl = async () => ((await base()).plannings || {})['fb-chauffeurs'] || {};
// Pose (ou déplace) une tournée : la carte, puis la case ; puis le camion `k` (bulle à la pose, ou lien « Changer le camion »).
async function poser68(id, r, t, k) {
  await pg.click(`${Z} [data-pl-id="${id}"][data-pl-vue="b"]`);
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${r}"][data-t="${t}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  await pause();
  await qrep68();
  if (!k) return;
  if ((((await etatPl()).place || {})[id] || {}).k === k) return;
  if (!(await present('.pl-bulle'))) await pg.click(`${Z} [data-pl-id="${id}"][data-pl-vue="b"] [data-pl-act="bulle"]`);
  await pg.click(`${Z} .pl-bulle [data-pl-choix="${k}"]`);
  await pause();
}
async function envoyerPlanning68() {
  await pg.click(`${Z} [data-pl="envoyer"]`);
  const c = await pg.waitForSelector(`${Z} [data-confirme]`, { timeout: 3000 }).catch(() => null);
  if (!c) throw new Error('pas de confirmation avant l’envoi du planning');
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
// Un point d'étape de Karim : une question, puis « Continuer ».
async function etape68(eid, q, val) {
  // L'élève voit d'abord le bandeau « Karim t'attend pour un point d'étape », avec son bouton : c'est le chemin pris ici.
  if (!(await present(`[data-qf-attend="${eid}"] [data-q-aller-etape]`))) throw new Error(`pas de bandeau « Karim t’attend » pour ${eid}`);
  await pg.click(`${Z} [data-qf-attend="${eid}"] [data-q-aller-etape]`);
  await pause();
  await pg.click(`${Z} [data-q-choix="${val}"][data-q="${q}"]`);
  await pg.click(`${Z} [data-q-repondre="${q}"]`);
  await pause();
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
}
const V1 = [['cote', 'lucas', 4, 'T1'], ['rouen', 'amandine', 6, 'T2'], ['versailles', 'fatou', 6, 'E1'], ['mantes', 'sebastien', 16, 'E2'], ['evreux', 'julien', 4, 'VL']];
const V2 = [['rouen', 'tr', 8], ['mantes', 'sebastien', 16, 'LOC']];
async function plannings68(p1 = V1, p2 = V2, q = { repos: 'calc', transporteur: 'oui' }) {
  await aller('planning');
  for (const [id, r, t, k] of p1) await poser68(id, r, t, k);
  await envoyerPlanning68();
  await etape68('avant-reprise', 'repos-sebastien', q.repos);
  await aller('planning');
  for (const [id, r, t, k] of p2) await poser68(id, r, t, k);
  await envoyerPlanning68();
  await etape68('avant-loueur', 'temps-transporteur', q.transporteur);
}
const LOUEUR68 = { bonjour: 'Bonjour,', vehicule: 'Nous confirmons la location d’un porteur 16 t thermique, sans chauffeur,',
  quand: 'pour ce vendredi 18 juin, de 09:00 jusqu’au retour du camion ce soir.', formule: 'Cordialement, Lea, exploitation France Boissons Buchelay' };
// La confirmation au loueur (le point d'étape a ouvert son message) : une phrase par ligne, envoi, confirmation.
async function loueur68(m = LOUEUR68) {
  if (!(await present('[data-repondre]'))) {
    await aller('mail');
    const id = await pg.evaluate(() => window.__f.db.mails.find((x) => x.folder === 'in' && x.cle === 'loueur').id);
    await pg.click(`${Z} [data-mail="${id}"]`);
    await pause();
  }
  await pg.click(`${Z} [data-repondre]`);
  await pause();
  for (const [l, t] of Object.entries(m)) { await pg.selectOption(`${Z} select[data-phrase="${l}"]`, { label: t }); await pause(); }
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await pause();
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  await qrep68();
}
// La fiche : `[fb, lettre, contrat]` par tournée (oui = true).
const FICHE68 = { cote: [true, false, false], rouen: [false, true, false], versailles: [true, false, false], mantes: [true, false, true], evreux: [true, false, false] };
async function fiche68(f = FICHE68, envoyer = true) {
  await aller('fiche');
  for (const [t, L] of Object.entries(f)) {
    for (const [i, col] of ['fb', 'lettre', 'contrat'].entries()) {
      if (L[i] == null) continue;
      await pg.click(`${Z} [data-ouinon="bord|${t}|${col}|${L[i] ? 1 : 0}"]`);
      await pause(40);
      await qrep68();
    }
  }
  if (!envoyer) return;
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
const JALONS68 = ['v1-tous', 'v1-chauffeurs', 'v1-camions', 'v1-fenetre', 'v1-conduite', 'v2-tous', 'v2-chauffeurs', 'v2-camions', 'v2-fenetre', 'v2-conduite',
  'v2-vides', 'doc-rouen', 'doc-mantes', 'question:repos-sebastien', 'question:temps-transporteur'];
const POIDS68 = { 'v1-tous': 0.5, 'v1-chauffeurs': 1, 'v1-camions': 1.5, 'v1-fenetre': 1, 'v1-conduite': 1, 'v2-tous': 0.5, 'v2-chauffeurs': 1, 'v2-camions': 2,
  'v2-fenetre': 1, 'v2-conduite': 1, 'v2-vides': 1.5, 'doc-rouen': 2.5, 'doc-mantes': 2.5, 'question:repos-sebastien': 1.5, 'question:temps-transporteur': 1.5 };
const etats68 = (n) => JALONS68.map((j) => [j, n.detail[j]]);
const sauf68 = (faux, etat = 'ko') => JALONS68.map((j) => [j, faux.includes(j) ? etat : 'ok']);
const points68 = (faux) => 20 - faux.reduce((s, j) => s + POIDS68[j], 0);
async function parcours68(o = {}) {
  await monter68({ uid: o.uid || 'fb68' });
  await plannings68(o.p1, o.p2, o.q);
  await loueur68(o.loueur);
  await fiche68(o.fiche);
  return note();
}

// ─────────────────────────────────────────────────────────── le calage, jugé par le vrai moteur (sans écran)
// Chaque piège fait tomber SON jalon, et lui seul (sauf « deux tournées » : chauffeurs et conduite, nommés).
const P = (L) => Object.fromEntries(L.map(([id, r, s, k]) => [id, k ? { r, s, k } : { r, s }]));
const REF1 = [['cote', 'lucas', 4, 'T1'], ['rouen', 'amandine', 6, 'T2'], ['versailles', 'fatou', 6, 'E1'], ['mantes', 'sebastien', 16, 'E2'], ['evreux', 'julien', 4, 'VL']];
const REF2 = [['cote', 'lucas', 4, 'T1'], ['rouen', 'tr', 8], ['versailles', 'fatou', 6, 'E1'], ['mantes', 'sebastien', 16, 'LOC'], ['evreux', 'julien', 4, 'VL']];
const avec = (ref, ...chg) => { const m = Object.fromEntries(ref.map((x) => [x[0], x])); chg.forEach((x) => { m[x[0]] = x; }); return Object.values(m); };
const PIEGES_V1 = [
  ['Sébastien sur Rouen à 08:30 (repos)', avec(REF1, ['rouen', 'sebastien', 14, 'T2'], ['mantes', 'amandine', 16, 'E2']), ['conduite']],
  ['Sébastien sur Rouen à 09:00 (les fûts arrivent trop tard)', avec(REF1, ['rouen', 'sebastien', 16, 'T2'], ['mantes', 'amandine', 16, 'E2']), ['fenetre']],
  ['Amandine sur Rouen à 06:00 (repos)', avec(REF1, ['rouen', 'amandine', 4, 'T2']), ['conduite']],
  ['Rouen sur E2, Mantes sur T2 (autonomie)', avec(REF1, ['rouen', 'amandine', 6, 'E2'], ['mantes', 'sebastien', 16, 'T2']), ['camions']],
  ['Versailles sur T1, côte sur E1', avec(REF1, ['cote', 'lucas', 4, 'E1'], ['versailles', 'fatou', 6, 'T1']), ['camions']],
  ['Julien (permis B) sur Mantes avec E2, Sébastien sur Évreux', avec(REF1, ['mantes', 'julien', 4, 'E2'], ['evreux', 'sebastien', 16, 'VL']), ['chauffeurs']],
  ['Mantes posée à 10:30 (rentre trop tard)', avec(REF1, ['mantes', 'sebastien', 22, 'E2']), ['fenetre']],
  ['la côte partie à 08:45 (rentre trop tard)', avec(REF1, ['cote', 'lucas', 15, 'T1']), ['fenetre']],
  ['Fatou fait Versailles puis Évreux (deux tournées)', avec(REF1, ['evreux', 'fatou', 34, 'VL']), ['chauffeurs', 'conduite']],
  ['E1 sur Versailles et Mantes (un camion, deux tournées)', avec(REF1, ['mantes', 'sebastien', 16, 'E1']), ['camions']],
];
const PIEGES_V2 = [
  ['Mantes sur E2 (80 km d’autonomie)', avec(REF2, ['mantes', 'sebastien', 16, 'E2']), ['camions']],
  ['Rouen au transporteur à 06:30', avec(REF2, ['rouen', 'tr', 6]), ['chauffeurs']],
  ['Mantes sur le camion loué à 08:30 (Amandine)', avec(REF2, ['mantes', 'amandine', 14, 'LOC']), ['camions']],
  ['Rouen sur le camion loué à 09:00, Mantes au transporteur', avec(REF2, ['rouen', 'amandine', 16, 'LOC'], ['mantes', 'tr', 8]), ['fenetre', 'vides']],
  ['Évreux au transporteur, Rouen sur le fourgon', avec(REF2, ['evreux', 'tr', 8], ['rouen', 'julien', 4, 'VL']), ['camions', 'vides']],
  ['la côte sur T2 (en panne)', avec(REF2, ['cote', 'lucas', 4, 'T2']), ['camions']],
  ['Versailles sur le camion loué, Mantes sur E1', avec(REF2, ['versailles', 'fatou', 16, 'LOC'], ['mantes', 'sebastien', 16, 'E1']), ['camions']],
];
const J = ['tous', 'chauffeurs', 'camions', 'fenetre', 'conduite'];

await v('ENT-6.8 : calage — les deux plannings de référence et une 2e solution sont justes ; chaque piège fait tomber son jalon (et lui seul) ; le 1er envoi gardé tel quel est faux après l’imprévu ; rien posé = 0', async () => {
  const r = await pg.evaluate(async ({ REF1, REF2, PIEGES_V1, PIEGES_V2 }) => {
    const S = await import('/contenus/france-boissons-ent68.js');
    const { jalonsPlanning } = await import('/core/types/planning.js');
    const P = (L) => Object.fromEntries(L.map(([id, r, s, k]) => [id, k ? { r, s, k } : { r, s }]));
    const juge = (v1, v2) => Object.fromEntries(jalonsPlanning({ plannings: { 'fb-chauffeurs': { v1: { place: P(v1) }, ...(v2 ? { v2: { place: P(v2) } } : {}) } } }, S.PLANNING).L
      .filter((l) => l.envoye).map((l) => [l.id, l.ok]));
    const deux = [['cote', 'lucas', 4, 'T1'], ['rouen', 'tr', 14], ['versailles', 'sebastien', 16, 'E1'], ['mantes', 'amandine', 16, 'LOC'], ['evreux', 'fatou', 4, 'VL']];
    return {
      ref: juge(REF1, REF2), deux: juge(REF1, deux), telQuel: juge(REF1, REF1),
      v1: PIEGES_V1.map(([, L]) => juge(L)), v2: PIEGES_V2.map(([, L]) => juge(REF1, L)), rien: juge([], []),
      solution: S.SOLUTION,
    };
  }, { REF1, REF2, PIEGES_V1, PIEGES_V2 });
  egal(Object.values(r.ref).every(Boolean) && Object.keys(r.ref).length, 11, 'les références : 11 jalons justes');
  egal(Object.values(r.deux).every(Boolean), true, '2e solution : ' + JSON.stringify(r.deux));
  egal(J.map((j) => r.telQuel[`v1-${j}`]).concat([...J, 'vides'].map((j) => r.telQuel[`v2-${j}`])), [...Array(5).fill(true), ...Array(6).fill(false)], '1er envoi gardé tel quel');
  PIEGES_V1.forEach(([nom, , faux], i) => egal(J.filter((j) => !r.v1[i][`v1-${j}`]), faux, `piège du 1er envoi : ${nom}`));
  PIEGES_V2.forEach(([nom, , faux], i) => egal([...J, 'vides'].filter((j) => !r.v2[i][`v2-${j}`]), faux, `piège après l’imprévu : ${nom}`));
  egal(Object.values(r.rien).filter(Boolean).length, 0, 'rien posé');
  egal(r.solution, { v1: P(REF1), v2: P(REF2) }, 'la solution de référence du contenu (corrigé)');
});

await v('ENT-6.8 : sabotages — lire le service au lieu de la conduite fait tomber « conduite » sur la côte (avant et après l’imprévu) ; sans la règle des vides, Mantes au transporteur ne fait plus rien tomber', async () => {
  const r = await pg.evaluate(async ({ REF1, REF2 }) => {
    const S = await import('/contenus/france-boissons-ent68.js');
    const { jalonsPlanning } = await import('/core/types/planning.js');
    const P = (L) => Object.fromEntries(L.map(([id, r, s, k]) => [id, k ? { r, s, k } : { r, s }]));
    const juge = (PL, v2) => Object.fromEntries(jalonsPlanning({ plannings: { 'fb-chauffeurs': { v1: { place: P(REF1) }, v2: { place: P(v2) } } } }, PL).L.map((l) => [l.id, l.ok]));
    const sansConduite = { ...S.PLANNING, cartes: { ...S.PLANNING.cartes, liste: S.PLANNING.cartes.liste.map(({ conduite, ...c }) => c) } };
    const sansVides = { ...S.PLANNING, regles: S.PLANNING.regles.filter((x) => x.id !== 'vides'), jalons: S.PLANNING.jalons.map((j) => (j.id === 'vides' ? { ...j, regles: [] } : j)) };
    const mantesTr = REF2.map((x) => (x[0] === 'mantes' ? ['mantes', 'tr', 8] : x)).concat([]);
    return { conduite: juge(sansConduite, REF2), vides: juge(sansVides, mantesTr), videsVrai: juge(S.PLANNING, mantesTr) };
  }, { REF1, REF2 });
  egal([r.conduite['v1-conduite'], r.conduite['v2-conduite']], [false, false], 'sans `conduite` : la côte (7 h de service) dépasse 4 h 30');
  egal(r.videsVrai['v2-vides'], false, 'avec la règle : Mantes au transporteur fait tomber « vides »');
  egal(r.vides['v2-vides'], true, 'sans la règle : le piège ne fait plus rien tomber (le cas de test l’aurait vu)');
});

await v('ENT-6.8 : « que, pas de combien » — aucun message de problème des pièges ne donne une heure, des km, des minutes ou un pourcentage', async () => {
  const textes = await pg.evaluate(async ({ PIEGES_V1, PIEGES_V2 }) => {
    const S = await import('/contenus/france-boissons-ent68.js');
    const { creerPlanning } = await import('/core/types/planning.js');
    const V = creerPlanning(S.PLANNING);
    const P = (L) => Object.fromEntries(L.map(([id, r, s, k]) => [id, k ? { r, s, k } : { r, s }]));
    return [...PIEGES_V1.map(([, L]) => V.lire({ phase: 1, place: P(L) }).problemes), ...PIEGES_V2.map(([, L]) => V.lire({ phase: 2, place: P(L) }).problemes)].flat();
  }, { PIEGES_V1, PIEGES_V2 });
  vrai(textes.length >= 15, `trop peu de messages lus : ${textes.length}`);
  const chiffres = textes.filter((t) => /\d{1,2}:\d{2}|\bkm\b|\bmin\b|%|\d+ ?h(?! 30 sans| de repos| dans la journée)/.test(t));
  egal(chiffres, [], 'messages qui donnent un chiffre');
});

// ─────────────────────────────────────────────────────────── à l'écran
await v('ENT-6.8 : ouverture — message de Karim et ses pièces (5 h, 18 juin 2027) ; menu sans la fiche ; la carte de Rouen ne dit ni 13:00 ni 08:30 ; pas de « Vérifier » ; la côte ne va que sur la ligne de Lucas', async () => {
  await monter68({ uid: 'fb68-ouv' });
  const E = await entrants();
  egal(E.map((m) => [m.subject, m.pieces]), [['Le planning des chauffeurs du vendredi', ['tournees', 'moyens', 'regles', 'organigramme', 'annuaire']]], 'messages');
  egal(horodate(E[0].ts), [2027, 6, 18, 5, 0], 'heure du scénario');
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue).filter((x) => x !== 'accueil')), ['ouverture', 'mail', 'planning'], 'menu');
  await aller('planning');
  const rouen = await pg.textContent(`${Z} [data-pl-id="rouen"][data-pl-vue="b"]`);
  vrai(/livrés avant 11:00, 2 h 30 après le départ/.test(rouen) && !/13:00|08:30/.test(rouen), `carte de Rouen : ${rouen}`);
  vrai(!/13:00|08:30/.test(await pg.textContent(`${Z} [data-pl-bac]`)), '13:00 ou 08:30 sur les cartes des tournées');
  vrai(!(await present('[data-pl="verifier"]')), 'bouton « Vérifier »');
  egal((await pg.$$(`${Z} [data-pl-bac] [data-pl-id]`)).length, 5, 'tournées');
  await poser68('cote', 'fatou', 8, 'T1');
  egal((await etatPl()).place.cote, { r: 'lucas', s: 8, k: 'T1' }, 'la côte lâchée sur Fatou');
  vrai(!(await present('[data-pl-problemes] li')), 'des problèmes s’affichent avant l’envoi (entraînement)');
  egal(erreursF, [], 'erreurs JS');
});

await v('ENT-6.8 : inaction — rien fait → 0/20 ; deux envois à vide → aucun jalon juste, la fiche n’existe pas avant le 2e envoi', async () => {
  await monter68({ uid: 'fb68-rien' });
  let n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  await aller('planning');
  await envoyerPlanning68();
  vrai(!(await present('.ent-nav[data-vue="fiche"]')), 'la fiche est au menu après le 1er envoi');
  await etape68('avant-reprise', 'repos-sebastien', 'plus');
  await aller('planning');
  await envoyerPlanning68();
  vrai(!(await present('.ent-nav[data-vue="fiche"]')), 'la fiche est au menu avant la confirmation au loueur');
  n = await note();
  vrai(!JALONS68.filter((j) => !j.startsWith('question:')).some((j) => n.detail[j] === 'ok'), 'un jalon juste à vide : ' + JSON.stringify(n.detail));
});

await v('ENT-6.8 : parcours juste — 20/20 ; Karim cite le départ de Sébastien (09:00, 11 h) ; T2 hachuré, location hachurée avant 09:00 ; Rouen chez le transporteur sans bulle ; loueur ; fiche ; bandeau 5 lignes ✓ ; fin vers la côte ; photo', async () => {
  await monter68({ uid: 'fb68-juste' });
  await aller('planning');
  for (const [id, r, t, k] of V1) await poser68(id, r, t, k);
  await envoyerPlanning68();
  vrai((await entrants()).some((m) => m.subject === 'Panne : planning à reprendre' && /E2 n’est chargé qu’à 40 %/.test(m.text)), 'message de la panne');
  await aller('etape:avant-reprise');
  const e = await pg.textContent(`${Z} [data-q-etape]`);
  vrai(/Ton planning le fait partir à 09:00/.test(e), `point d’étape : ${e}`);
  egal(await pg.textContent(`${Z} [data-q-choix="calc"]`), '11 h', 'la bonne réponse calculée');
  await pg.click(`${Z} [data-q-choix="calc"][data-q="repos-sebastien"]`);
  await pg.click(`${Z} [data-q-repondre="repos-sebastien"]`);
  await pause();
  vrai(await present('[data-q-verdict="ok"]'), 'corrigée tout de suite');
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
  await aller('planning');
  // « Utilisation des camions » : T2 hachuré toute la journée, la location jusqu'à 09:00 (créneau 16).
  const hors = await pg.$$eval(`${Z} [data-pl-lecture] .pl-case`, (L) => L.map((x) => x.classList.contains('pl-hors')));
  const n = 56, rang = (i) => hors.slice(i * n, (i + 1) * n);
  egal(rang(3).every(Boolean), true, 'T2 hachuré toute la journée');
  egal([rang(5).slice(0, 16).every(Boolean), rang(5)[16]], [true, false], 'location hachurée avant 09:00');
  await poser68('rouen', 'tr', 8);
  vrai(!(await present('.pl-bulle')), 'bulle sur la ligne du transporteur');
  egal((await etatPl()).place.rouen, { r: 'tr', s: 8 }, 'Rouen chez le transporteur, sans camion');
  await poser68('mantes', 'sebastien', 16, 'LOC');
  await envoyerPlanning68();
  await etape68('avant-loueur', 'temps-transporteur', 'oui');
  vrai(await present('[data-repondre]'), '« Continuer » n’ouvre pas le message du loueur');
  await loueur68();
  vrai((await entrants()).some((m) => m.subject === 'RE : Location d’un porteur — confirmation écrite'), 'accusé du loueur');
  await fiche68();
  const N = await note();
  egal([N.score, N.max], [20, 20], 'note');
  egal(etats68(N), sauf68([]), 'jalons');
  egal(await bandeau(), ['v1-tous', 'v2-tous', 'doc-rouen', 'question:repos-sebastien', 'question:temps-transporteur'].map((l) => [l, 'ok']), 'bandeau');
  vrai((await entrants()).some((m) => m.subject === 'C’est parti' && /Lucas est sur la route de la côte/.test(m.text)), 'message de fin');
  vrai(!!(await base()).points[ID68], 'photo de fin');
  egal(erreursF, [], 'erreurs JS');
});

await v('ENT-6.8 : une 2e solution juste (Rouen chez le transporteur à 08:30, Sébastien sur Versailles, Amandine sur Mantes louée, Fatou sur Évreux) → 20/20', async () => {
  const n = await parcours68({ uid: 'fb68-deux', p2: [['rouen', 'tr', 14], ['versailles', 'sebastien', 16], ['mantes', 'amandine', 16, 'LOC'], ['evreux', 'fatou', 4]] });
  egal(etats68(n), sauf68([]), 'jalons');
  egal(n.score, 20, 'note');
});

await v('ENT-6.8 : le 1er envoi juste renvoyé tel quel après la panne → les six jalons de la reprise faux (garde d’inaction), le reste juste', async () => {
  const n = await parcours68({ uid: 'fb68-tel-quel', p2: [] });
  const V2J = JALONS68.filter((j) => j.startsWith('v2-'));
  egal(etats68(n), sauf68(V2J), 'jalons');
  egal(n.score, points68(V2J), 'note');
});

await v('ENT-6.8 : fiche — Mantes « lettre de voiture : oui » fait tomber Mantes seul ; Rouen « transportée par France Boissons : oui » fait tomber Rouen seul ; fausses ensemble → 15/20', async () => {
  let n = await parcours68({ uid: 'fb68-f1', fiche: { ...FICHE68, mantes: [true, true, true] } });
  egal(etats68(n), sauf68(['doc-mantes']), 'Mantes');
  n = await parcours68({ uid: 'fb68-f2', fiche: { ...FICHE68, rouen: [true, true, false], mantes: [false, true, false] } });
  egal(etats68(n), sauf68(['doc-rouen', 'doc-mantes']), 'Rouen et Mantes');
  egal(n.score, 15, 'note');
});

await v('ENT-6.8 : fiche incomplète → envoi refusé (« Il manque »), la fiche reste ouverte ; les questions de Karim citent ce que l’élève a fait (véhicule demandé, réponses pour Mantes) et sont corrigées au bilan', async () => {
  await monter68({ uid: 'fb68-q' });
  await plannings68();
  await loueur68({ ...LOUEUR68, vehicule: 'Nous confirmons la location d’un fourgon 3,5 t,' });
  // `loueur68` répond à la question à l'envoi ; on relit le texte rangé, figé à l'arrivée.
  const Q = (await base()).questions[ID68];
  egal(Q['pourquoi-vehicule'].texte.enonce, 'Tu as demandé au loueur un fourgon 3,5 t. Pourquoi ce véhicule-là ?', 'question du véhicule');
  await fiche68({ mantes: [true, null, null] }, false);
  egal((await base()).questions[ID68]['qui-transporte-mantes'].texte.enonce,
    'Pour Mantes, tu as répondu « transportée par France Boissons : oui ». Qui transporte la marchandise de Mantes ?', 'question de Mantes');
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause();
  vrai(!(await present('[data-confirme-oui]')), 'une fiche incomplète part');
  vrai(/Il manque/.test(await pg.textContent(`${Z} #entMain`)), '« Il manque » absent');
  vrai(!(await base()).fiches[`documents`].envoye, 'fiche envoyée');
});

await v('ENT-6.8 : le corrigé se calcule (5 rubriques, fiche Rouen « non, oui, non » et Mantes « oui, non, oui »)', async () => {
  const c = await pg.evaluate(async () => (await import('/contenus/corriges/ENT-6.8.js')).CORRIGE);
  egal(c.items.length, 5, 'rubriques');
  const fiche = c.items[3].reponses;
  egal([fiche.find((l) => l[0] === 'Rouen').slice(1), fiche.find((l) => l[0] === 'Mantes').slice(1)], [['non', 'oui', 'non'], ['oui', 'non', 'oui']], 'fiche');
});

await v('ENT-6.8 : aucune erreur de page pendant le bloc', async () => { egal(erreursF, [], 'erreurs JS'); });

await F.fermer();
}
