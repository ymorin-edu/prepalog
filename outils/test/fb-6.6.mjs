// Suite de tests de Prepalog — bloc « fb-6.6 » : ENT-6.6 (France Boissons, l’inventaire tournant à la voix).
// `node outils/test.mjs fb-6.6` ne lance que ce bloc. Découpé de l'ancien bloc `france-boissons` le 12/10/2026 : un bloc par
// séance (l'ensemble durait 8 min 20 et bornait toute la suite). Les cas sont ceux d'avant, déplacés tels quels ; les aides
// communes (contexte, page, relevé d'erreurs JavaScript, lecture de la base) sont dans `outils/test/france-boissons/commun.mjs`.

import { ouvrirFB } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, texte, bandeau, entrants, horodate, calcPresente, nettoyerCalc, erreursF } = F;

// Mouvement réduit, comme dans l'ancien bloc (la section 6.4 le posait pour 6.5 et 6.6) ; remis à la fin.
await pg.emulateMedia({ reducedMotion: 'reduce' });

// ── ENT-6.6 : inventaire tournant à la voix (brief `docs/briefs/ENT-6.6-france-boissons-inventaire.md`, §8 ; moteur D-6) ───────────────
// Même montage (la vraie séance, `activites/france-boissons-inventaire.js`), de vrais clics au terminal, à l'écran Inventaire et dans la
// fiche. Les gestes du terminal et de l'écran Inventaire seuls sont testés au bloc `entrepot`. Valeurs ÉCRITES À LA MAIN (brief §4, §5) :
//   codes 47 · 82 · 15 · 63 · 29 · 54 · 91 ; comptages justes M01 15 · M02 8 · M03 24 · M04 0 · M05 2 · M06 7 · M08 19 ; logiciel
//   16 · 8 · 24 · 8 · 2 · 7 · 22 ; écarts −1 · 0 · 0 · −8 · 0 · 0 · −3 ; M01 régulariser Casse, M04 remettre en place, M08 régulariser
//   Vides manquants ; fiche 3 fûts, 120 €, 4 lignes justes, 57 %.
//   jalons (somme 16) : compte-M01 2, compte-M02 2, compte-M04 1,5, compte-M08 1,5, compte-autres 1 · ecarts 1,5, decision-M04 2,5,
//   decision-M01 1,5 · vides-euros 1,5, taux 1 ; questions notées (4) : aveugle-pourquoi 1, codes-faux 1,5, m04-regul 1,5 (au bilan) ;
//   taux-confiance pour réfléchir.
const ID66 = 'france-boissons-inventaire', P66 = 'fb-ent66-masse';
const COULOIRS66 = ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M08'];
const CODES66 = ['47', '82', '15', '63', '29', '54', '91'];
const JUSTES66 = [15, 8, 24, 0, 2, 7, 19];
const SYS66 = [16, 8, 24, 8, 2, 7, 22];
const REP66 = { aveugle: 'voir', tournant: 'partie', 'ecart-calcul': 'ecart', 'taux-fiabilite': 'taux', 'inventaire-annuel': 'douze',
  'vides-manquants-euros': 'fut', reemploi: 'reemploi', 'terminal-informe': 'avant', 'terminal-mains': 'mains', 'code-controle': 'endroit' };
const PREP66 = ['aveugle', 'tournant', 'ecart-calcul', 'taux-fiabilite'], DROIT66 = ['inventaire-annuel', 'vides-manquants-euros', 'reemploi', 'terminal-informe'],
  IMAGE66 = ['terminal-mains', 'code-controle'];
const monter66 = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/france-boissons-inventaire.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})['france-boissons-inventaire'] = db.questions['france-boissons-inventaire'] || {});
    for (const [id, v] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: v, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'fb66' },
    jeu: { etat: () => db, sauver: () => {} }, ...(o.son ? { sonTerminal: true } : {}),
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'FB',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { ...o, rep: REP66 });

const BONNES66 = { 'aveugle-pourquoi': 'influence', 'codes-faux': 'informe', 'm04-regul': 'faux', 'taux-confiance': 'ecarts' };
const FAUSSES66 = { 'aveugle-pourquoi': 'vite', 'codes-faux': 'terminal', 'm04-regul': 'juste', 'taux-confiance': 'sans' };
let choix66 = BONNES66;
async function qrep66() {
  for (let i = 0; i < 4; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    await pg.click(`${Z} [data-q-choix="${choix66[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
const VT66 = `${Z} [data-terminal]`;
const term66 = () => pg.evaluate((P) => JSON.parse(JSON.stringify(((window.__f.db.entrepots || {})[P] || {}).terminal || null)), P66);
async function rep66(x) {
  const avant = await pg.evaluate((P) => ((((window.__f.db.entrepots || {})[P] || {}).terminal) || { journal: [] }).journal.length, P66);
  await pg.fill(`${VT66} [data-vt-champ]`, String(x));
  await pg.press(`${VT66} [data-vt-champ]`, 'Enter');
  await pg.waitForFunction(({ P, n }) => window.__f.db.entrepots[P].terminal.journal.length > n, { P: P66, n: avant });
}
async function compter66(comptes = JUSTES66) {
  await aller('entrepot');
  await pg.waitForSelector(VT66);
  for (let i = 0; i < comptes.length; i++) { await rep66(CODES66[i]); await rep66(comptes[i]); }
  await pause();
}
async function etape66(c = choix66) {
  await aller('etape:avant-inventaire');
  for (const id of ['aveugle-pourquoi', 'codes-faux']) {
    await pg.click(`${Z} [data-q-choix="${c[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
  }
  await pause();
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
}
// L'écran Inventaire : les 7 écarts (dans l'ordre des couloirs), puis une décision par ligne EN ÉCART ({ M01: ['regul', 'Casse'] }), valider.
async function inventaire66(ecarts, decisions) {
  await aller('inventaire');
  for (let i = 0; i < COULOIRS66.length; i++) await pg.fill(`${Z} [data-inv-ecart="${COULOIRS66[i]}"]`, String(ecarts[i]));
  await pg.click(`${Z} [data-inv-aller="3"]`);
  await pause();
  for (const [c, [action, motif]] of Object.entries(decisions)) {
    await pg.selectOption(`${Z} [data-inv-action="${c}"]`, action);
    if (motif) await pg.selectOption(`${Z} [data-inv-motif="${c}"]`, motif);
  }
  await pg.click(`${Z} [data-inv-aller="4"]`);
  await pg.waitForSelector(`${Z} [data-inv-valider]`);
  await pg.click(`${Z} [data-inv-valider]`);
  await pg.waitForSelector(`${Z} [data-inv-valide]`);
  await pause();
}
const FICHE66 = { 'vides-futs': '3', 'vides-euros': '120', 'lignes-justes': '4', taux: '57' };
async function fiche66(diff = {}, { envoyer = true } = {}) {
  await aller('fiche');
  const val = { ...FICHE66, ...diff };
  for (const k of Object.keys(FICHE66)) {
    await pg.fill(`${Z} [data-fiche-saisie="${k}"]`, val[k]);
    await pg.press(`${Z} [data-fiche-saisie="${k}"]`, 'Tab');
    await pause(40); await qrep66();
  }
  if (!envoyer) return;
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause();
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  await qrep66();
}
const DEC66 = { M01: ['regul', 'Casse'], M04: ['rayon'], M08: ['regul', 'Vides manquants'] };
const ECARTS66 = [-1, 0, 0, -8, 0, 0, -3];
async function parcours66({ comptes = JUSTES66, ecarts = ECARTS66, decisions = DEC66, fiche = {}, envoyer = true } = {}) {
  await compter66(comptes);
  await etape66();
  await inventaire66(ecarts, decisions);
  await fiche66(fiche, { envoyer });
}
const JALONS66 = ['compte-M01', 'compte-M02', 'compte-M04', 'compte-M08', 'compte-autres', 'ecarts', 'decision-M04', 'decision-M01', 'vides-euros', 'taux'];
const POIDS66 = { 'compte-M01': 2, 'compte-M02': 2, 'compte-M04': 1.5, 'compte-M08': 1.5, 'compte-autres': 1, ecarts: 1.5, 'decision-M04': 2.5,
  'decision-M01': 1.5, 'vides-euros': 1.5, taux: 1 };
const etats66 = (n) => JALONS66.map((j) => [j, n.detail[j]]);
const sauf66 = (faux, etat = 'ko') => JALONS66.map((j) => [j, faux.includes(j) ? etat : 'ok']);
const points66 = (faux) => 20 - faux.reduce((s, j) => s + POIDS66[j], 0);

await v('ENT-6.6 : déclaration — meta (guidage C1.6, parcours après ENT-6.5), dix jalons aux poids écrits à la main (16) + trois questions notées (4) = 20, trois groupes, aucun jalon à 0', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/france-boissons-inventaire.js');
    const S = await import('/contenus/france-boissons-ent66.js');
    const Qs = await import('/contenus/questions/ENT-6.6.js');
    return { meta: A.meta, etapes: S.ETAPES.map((e) => [e.id, e.poids, e.groupe]), part: Qs.QUESTIONS.part,
      notees: Qs.QUESTIONS.liste.filter((q) => q.type !== 'ouverture' && !q.reflexion).map((q) => [q.id, q.poids, q.type]),
      reflexions: Qs.QUESTIONS.liste.filter((q) => q.reflexion).map((q) => q.id) };
  });
  const m = r.meta;
  egal([m.id, m.code, m.rubrique, m.niveaux, m.competences, m.domaines, m.temps, m.bareme, m.parcours, m.precedente, m.correction, m.questions, m.corrige, m.portee],
    ['france-boissons-inventaire', 'ENT-6.6', 'simulog', ['2de'], ['C1.6'], ['D2', 'D3', 'D5'], 'guidage', 20, true, 'france-boissons-rangement', true, 'ENT-6.6',
      './contenus/corriges/ENT-6.6.js', 'eleve'], 'meta');
  vrai(m.jeuId === undefined, 'une base par séance : aucun jeuId partagé');
  const C = 'Compter avec le terminal', D = 'Écarts et décisions', R = 'Compte rendu à Nadia';
  egal(r.etapes, [['compte-M01', 2, C], ['compte-M02', 2, C], ['compte-M04', 1.5, C], ['compte-M08', 1.5, C], ['compte-autres', 1, C],
    ['ecarts', 1.5, D], ['decision-M04', 2.5, D], ['decision-M01', 1.5, D], ['vides-euros', 1.5, R], ['taux', 1, R]], 'jalons, poids et groupes');
  egal(r.etapes.reduce((s, e) => s + e[1], 0), 16, 'somme des jalons');
  vrai(r.etapes.every((e) => e[1] > 0), 'aucun jalon à 0');
  egal(r.part, 4, 'part des questions');
  egal(r.notees, [['aveugle-pourquoi', 1, 'transition'], ['codes-faux', 1.5, 'transition'], ['m04-regul', 1.5, 'fil']], 'questions notées');
  egal(r.reflexions, ['taux-confiance'], 'question pour réfléchir');
});

await v('ENT-6.6 : livraison — pret: true et ouverture: prof, rang après ENT-6.5 ; aucune séance en échec au registre', async () => {
  const r = await pg.evaluate(async () => {
    const I = await import('/activites/index.js');
    await I.chargerActivites();
    const A = await import('/activites/france-boissons-inventaire.js');
    return { pret: A.meta.pret, ouverture: A.meta.ouverture, echecs: I.activitesEnEchec().length };
  });
  egal([r.pret, r.ouverture, r.echecs], [true, 'prof', 0], 'livraison');
});

await v('ENT-6.6 : données — stock du logiciel calculé depuis le rangement juste d’ENT-6.5 (16 · 8 · 24 · 8 · 2 · 7 · 22), comptage réel 15 · 8 · 24 · 0 · 2 · 7 · 19, codes, fiche attendue 3 · 120 · 4 · 57', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent66.js');
    const E = await import('/core/types/entrepot.js');
    return { sys: S.LIGNES.map((l) => S.SYSTEME[l.couloir]), reel: S.LIGNES.map((l) => E.futsReels(S.PLAN, l.couloir, l.ref, l.lot)),
      couloirs: S.LIGNES.map((l) => l.couloir), codes: S.LIGNES.map((l) => S.CODES[l.couloir]),
      inv: S.INVENTAIRE.lignes.map((l) => [l.cle, l.systeme, l.attendu || null, l.motif || null]),
      att: S.attenduCompteRendu(Object.fromEntries(S.LIGNES.map((l) => [l.couloir, E.futsReels(S.PLAN, l.couloir, l.ref, l.lot)]))) };
  });
  egal(r.couloirs, COULOIRS66, 'couloirs du terminal (M07 n’est pas compté)');
  egal(r.sys, SYS66, 'stock du logiciel');
  egal(r.reel, JUSTES66, 'ce qui se voit');
  egal(r.codes, CODES66, 'codes de contrôle');
  egal(r.inv, [['M01', 16, 'regul', 'Casse'], ['M02', 8, null, null], ['M03', 24, null, null], ['M04', 8, 'rayon', null], ['M05', 2, null, null],
    ['M06', 7, null, null], ['M08', 22, 'regul', 'Vides manquants']], 'lignes de l’inventaire');
  egal(r.att, { videsManquants: 3, euros: 120, justes: 4, lignes: 7, taux: 57 }, 'compte rendu attendu');
});

await v('ENT-6.6 : ouverture — message de Nadia (17 juin 2027, 6 h 55), menu ; à l’aveugle : aucun chiffre du logiciel avant la fin du comptage (inventaire en attente, « Mon inventaire » vide, aucun indicateur) ; pas de compte rendu', async () => {
  await monter66({ uid: 'fb66-ouv' });
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue)),
    ['ouverture', 'accueil', 'mail', 'animation:fb-ent66-materiel', 'entrepot', 'inventaire'], 'menu (le matériel, la zone de masse, l’inventaire)');
  const M = await entrants();
  egal(M.length, 1, 'un seul message au départ');
  egal(M[0].subject, 'On compte avant le week-end', 'sujet');
  egal(M[0].text, 'Bonjour Lea !\n\nAvant le week-end de la Fête, on compte ce qui part demain chez nos clients, et les vides.\n\n'
    + 'Prends le [[terminal vocal]] : il te dit où aller. Ne regarde pas le stock du logiciel, compte ce que tu vois.\n\nNadia', 'texte');
  egal(horodate(M[0].ts), [2027, 6, 17, 6, 55], 'date du scénario');
  // Partout où l'élève peut aller avant la fin du comptage : aucun nombre du logiciel (22 vides, et aucune table d'inventaire).
  const vus = [];
  await aller('accueil'); vus.push(await texte());
  await aller('entrepot'); await pg.waitForSelector(VT66);
  for (const c of ['M01', 'M04', 'M08']) {
    await pg.click(`${Z} .pm [data-pm-couloir="${c}"] .pm-sol`); await pause();
    vus.push(await texte());
    await pg.click(`${Z} .pm [data-pm="retour"]`); await pause();
  }
  await compter66(JUSTES66.slice(0, 6));
  vus.push(await texte());
  await aller('inventaire');
  vrai(await present('[data-inv-attente]'), 'l’inventaire attend la fin du comptage');
  vrai(!(await present('table')), 'aucun tableau d’inventaire');
  vus.push(await texte());
  const doc = await pg.evaluate(async () => { const S = await import('/contenus/france-boissons-ent66.js');
    return S.DOCUMENTS.find((d) => d.id === 'mon-inventaire').html(window.__f.db); });
  vrai(/se remplit quand ton inventaire est validé/.test(doc) && !/<table/.test(doc), '« Mon inventaire » vide avant la validation');
  vrai(vus.every((t) => !/\b22\b/.test(t) && !/logiciel\s*:?\s*\d/i.test(t)), 'un chiffre du logiciel avant la fin du comptage');
  egal((await base()).inventaires, undefined, 'aucun état d’inventaire');
  vrai(!(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue))).includes('fiche'), 'pas de compte rendu avant l’inventaire');
  vrai(!(await present('.ent-kpi')) || (await pg.$$eval(`${Z} .ent-kpi`, (L) => L.length)) <= 1, 'un seul indicateur (le courrier)');
});

await v('ENT-6.6 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau', async () => {
  await monter66({ uid: 'fb66-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin]')), 'bandeau de fin');
});

await v('ENT-6.6 : parcours juste — le matériel, un code faux (redemandé, trace, rien de perdu), comptage, point d’étape, inventaire, compte rendu → 20/20 ; Nadia répond ; bandeau ✓ ; photo', async () => {
  choix66 = BONNES66;
  await monter66({ uid: 'fb66-juste' });
  await aller('animation:fb-ent66-materiel');
  vrai(/Le terminal vocal/.test(await texte()) && /tu tapes tes réponses au clavier/.test(await texte()), 'écran du terminal vocal');
  await aller('entrepot');
  await pg.waitForSelector(VT66);
  egal(await pg.textContent(`${VT66} [data-vt-actu]`), 'Couloir M01. Code de contrôle ?', 'première phrase');
  await rep66('12');
  egal(await pg.textContent(`${VT66} [data-vt-actu]`), 'Couloir M01. Code de contrôle ?', 'code faux : redemandé');
  await rep66('47');
  egal(await pg.textContent(`${VT66} [data-vt-actu]`), 'Heineken, fût de 30 litres. Lot S20. Combien de fûts ?', 'la question de la référence');
  await rep66('15');
  for (let i = 1; i < 7; i++) { await rep66(CODES66[i]); await rep66(JUSTES66[i]); }
  egal((await term66()).codesFaux, { M01: 1 }, 'trace du code faux');
  egal((await term66()).reponses, Object.fromEntries(COULOIRS66.map((c, i) => [c, JUSTES66[i]])), 'comptages');
  // Le point d'étape garde l'inventaire fermé jusqu'aux réponses.
  const menu = await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue));
  vrai(menu.includes('etape:avant-inventaire') && !menu.includes('inventaire'), 'le point d’étape tient la place de l’inventaire : ' + menu);
  await etape66();
  vrai((await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue))).includes('inventaire'), 'l’inventaire s’ouvre après les réponses');
  await inventaire66(ECARTS66, DEC66);
  vrai((await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue))).includes('fiche'), 'le compte rendu arrive au menu après la validation');
  await aller('fiche');
  vrai(/Pourquoi on compte les vides/.test(await texte()) && /réemploi/.test(await texte()), 'encadré des vides');
  await fiche66();
  const n = await note();
  egal([n.score, n.max], [20, 20], 'note');
  egal(etats66(n), sauf66([]), 'jalons');
  egal(await bandeau(), [['compte-M01', 'ok'], ['ecarts', 'ok'], ['vides-euros', 'ok'], ['question:aveugle-pourquoi', 'ok'], ['question:codes-faux', 'ok'],
    ['question:m04-regul', 'ok']], 'bandeau : une ligne par groupe, une par question notée');
  egal((await entrants()).filter((m) => m.subject === 'RE : le compte rendu d’inventaire').map((m) => m.text),
    ['Merci Lea. Je préviens Karim pour les vides : on vérifiera les bons de reprise de la semaine.\n\n'
      + 'Cet après-midi, tu prépares la commande de Malo avec le même terminal.\n\nNadia'], 'réponse de Nadia');
  vrai(!!(await base()).points[ID66], 'photo de fin : la séance suivante peut s’ouvrir');
});

await v('ENT-6.6 : pas de double peine — M01 compté 16 : jalon 1 faux, écart 0 juste, 5 lignes justes et 71 % justes ; M01 sans écart pour lui : sa décision est fausse', async () => {
  choix66 = BONNES66;
  await monter66({ uid: 'fb66-m01' });
  await parcours66({ comptes: [16, 8, 24, 0, 2, 7, 19], ecarts: [0, 0, 0, -8, 0, 0, -3], decisions: { M04: ['rayon'], M08: ['regul', 'Vides manquants'] },
    fiche: { 'lignes-justes': '5', taux: '71' } });
  const n = await note();
  egal(etats66(n), sauf66(['compte-M01', 'decision-M01']), 'jalons');
  egal(n.score, points66(['compte-M01', 'decision-M01']), 'note');
  // Le bon taux (57 %) avec ses comptages à lui : faux.
  await monter66({ uid: 'fb66-m01b' });
  await parcours66({ comptes: [16, 8, 24, 0, 2, 7, 19], ecarts: [0, 0, 0, -8, 0, 0, -3], decisions: { M04: ['rayon'], M08: ['regul', 'Vides manquants'] } });
  egal(etats66(await note()), sauf66(['compte-M01', 'decision-M01', 'taux']), '57 % sur ses comptages : faux');
});

await v('ENT-6.6 : M02 compté 16 (la Pelforth comptée) → jalon 2 faux ; M08 compté 22 → jalon 4 faux, 0 fût et 0 € justes ; un écart d’un comptage juste recopié → jalon 6 faux', async () => {
  choix66 = BONNES66;
  await monter66({ uid: 'fb66-m02' });
  await parcours66({ comptes: [15, 16, 24, 0, 2, 7, 22], ecarts: [-1, 8, 0, -8, 0, 0, 0], decisions: { M01: ['regul', 'Casse'], M02: ['rayon'], M04: ['rayon'] },
    fiche: { 'vides-futs': '0', 'vides-euros': '0', 'lignes-justes': '4', taux: '57' } });
  let n = await note();
  egal(etats66(n), sauf66(['compte-M02', 'compte-M08']), 'jalons');
  egal(n.score, points66(['compte-M02', 'compte-M08']), 'note');
  await monter66({ uid: 'fb66-ecart' });
  await parcours66({ comptes: [15, 16, 24, 0, 2, 7, 19], ecarts: [-1, 0, 0, -8, 0, 0, -3], decisions: { M01: ['regul', 'Casse'], M02: ['rayon'], M04: ['rayon'], M08: ['regul', 'Vides manquants'] },
    fiche: { 'lignes-justes': '3', taux: '43' } });
  n = await note();
  egal(etats66(n), sauf66(['compte-M02', 'ecarts']), 'écart de M02 = 0 alors qu’il a compté 16 : jalon 6 faux (rien n’est refusé à l’écran)');
});

await v('ENT-6.6 : décisions — M04 régularisé −8 → jalon 7 faux ; M01 « remettre en place » → jalon 8 faux ; M01 régularisé sans le bon motif → faux', async () => {
  choix66 = BONNES66;
  await monter66({ uid: 'fb66-dec' });
  await parcours66({ decisions: { M01: ['rayon'], M04: ['regul', 'Erreur de rangement'], M08: ['regul', 'Vides manquants'] } });
  let n = await note();
  egal(etats66(n), sauf66(['decision-M04', 'decision-M01']), 'jalons');
  egal(n.score, points66(['decision-M04', 'decision-M01']), 'note (20 − 2,5 − 1,5)');
  await monter66({ uid: 'fb66-motif' });
  await parcours66({ decisions: { M01: ['regul', 'Erreur de réception'], M04: ['rayon'], M08: ['regul', 'Vides manquants'] } });
  n = await note();
  egal(etats66(n), sauf66(['decision-M01']), 'M01 régularisé, motif faux');
});

await v('ENT-6.6 : fiche — 3 vides mais 12 € → jalon 9 faux ; taux 4 % → jalon 10 faux ; fiche non envoyée → jalons 9 et 10 jamais justes', async () => {
  choix66 = BONNES66;
  await monter66({ uid: 'fb66-fiche' });
  await parcours66({ fiche: { 'vides-euros': '12', taux: '4' } });
  egal(etats66(await note()), sauf66(['vides-euros', 'taux']), 'jalons');
  await monter66({ uid: 'fb66-futs' });
  await parcours66({ fiche: { 'vides-futs': '19' } });
  egal(etats66(await note()), sauf66(['vides-euros']), '19 vides (le compté) mais 120 € : jalon 9 faux');
  await monter66({ uid: 'fb66-sansenvoi' });
  await parcours66({ envoyer: false });
  const n = await note();
  vrai(n.detail['vides-euros'] !== 'ok' && n.detail.taux !== 'ok', 'fiche non envoyée : ' + JSON.stringify([n.detail['vides-euros'], n.detail.taux]));
});

await v('ENT-6.6 : questions — point d’étape faux (aveugle, codes faux) = −2,5 tout de suite ; « régulariser M04 » faux au bilan = −1,5 ; jalons inchangés', async () => {
  choix66 = FAUSSES66;
  await monter66({ uid: 'fb66-qfaux' });
  await compter66();
  await etape66(FAUSSES66);
  egal((await base()).questions[ID66]['aveugle-pourquoi'].premiere, 'vite', 'réponse rangée');
  await inventaire66(ECARTS66, DEC66);
  await aller('fiche');
  await pg.fill(`${Z} [data-fiche-saisie="vides-futs"]`, '3');
  await pg.press(`${Z} [data-fiche-saisie="vides-futs"]`, 'Tab');
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'm04-regul', 'la question sur M04 arrive à la première case du compte rendu');
  await qrep66();
  await fiche66();
  const n = await note();
  egal(n.score, 16, '20 − 1 − 1,5 − 1,5');
  egal(etats66(n), sauf66([]), 'les jalons ne bougent pas');
  egal(await bandeau(), [['compte-M01', 'ok'], ['ecarts', 'ok'], ['vides-euros', 'ok'], ['question:aveugle-pourquoi', 'ko'], ['question:codes-faux', 'ko'],
    ['question:m04-regul', 'ko']], 'bandeau');
  choix66 = BONNES66;
});

await v('ENT-6.6 : son — coupé par défaut (« sans son », aucun bouton) ; groupe « son activé » → « Couper le son », jamais de bouton pour l’activer quand l’enseignant l’a coupé', async () => {
  await monter66({ uid: 'fb66-son0' });
  await aller('entrepot'); await pg.waitForSelector(VT66);
  vrai(!(await present('[data-vt-son]')), 'aucun bouton de son sans le réglage de l’enseignant');
  vrai(/sans son/.test(await pg.textContent(VT66)), '« sans son »');
  await monter66({ uid: 'fb66-son1', son: true });
  await aller('entrepot'); await pg.waitForSelector(VT66);
  egal(await pg.textContent(`${VT66} [data-vt-son]`), 'Couper le son', 'l’élève peut couper');
});

await v('ENT-6.6 : « Avant de commencer » — 5 questions tirées (2 + 2 + 1), non notées, la calculette ; toute la banque sort sur 300 graines ; valeurs tirées jamais celles de la séance ; le dessin servi et crédité', async () => {
  await nettoyerCalc();
  await monter66({ sansOuverture: true, uid: 'fb66-ouv-1' });
  vrai(await present('[data-ouverture="avant-de-commencer"]'), 'la séance ne s’ouvre pas sur « Avant de commencer »');
  vrai(await calcPresente(), 'calculette absente');
  const t1 = (await base()).questions[ID66]['@tirage'].ids;
  egal([t1.filter((i) => PREP66.includes(i)).length, t1.filter((i) => DROIT66.includes(i)).length, t1.filter((i) => IMAGE66.includes(i)).length], [2, 2, 1], 'répartition : ' + t1);
  for (let k = 0; k < t1.length; k++) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    await pg.click(`${Z} [data-q-choix="${REP66[t1[k]]}"][data-q="${t1[k]}"]`);
    await pg.click(`${Z} [data-q-repondre="${t1[k]}"]`);
    await pause();
  }
  vrai((await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue))).includes('entrepot'), 'menu ouvert après les réponses');
  egal((await note()).score, 0, 'l’ouverture ne compte pas');
  await nettoyerCalc();
  const r = await pg.evaluate(async () => {
    const { compilerQuestions, tirerOuverture } = await import('/core/types/questions.js');
    const { hasard } = await import('/core/tirage.js');
    const { QUESTIONS } = await import('/contenus/questions/ENT-6.6.js');
    const M = compilerQuestions(QUESTIONS, null, ['mots', 'photos', 'droit']);
    const T = [];
    for (let s = 0; s < 300; s++) T.push(tirerOuverture(M, `graine-${s}`).ids);
    const va = (id) => QUESTIONS.liste.find((q) => q.id === id).variante;
    const V = [];
    for (let s = 0; s < 300; s++) V.push([va('ecart-calcul')(hasard(`e${s}`)), va('taux-fiabilite')(hasard(`t${s}`)), va('inventaire-annuel')(hasard(`a${s}`)), va('vides-manquants-euros')(hasard(`v${s}`))]);
    const imgs = QUESTIONS.ouverture.documents.find((d) => d.id === 'photos').images;
    const statuts = [];
    for (const im of imgs) statuts.push((await fetch(im.src)).status);
    const cred = await (await fetch('/contenus/images/france-boissons/CREDITS.md')).text();
    return { T, V, imgs: imgs.map((i) => i.src.split('/').pop()), statuts, cred };
  });
  egal([...new Set(r.T.flat())].sort(), [...PREP66, ...DROIT66, ...IMAGE66].sort(), 'toute la banque sort');
  vrai(r.T.every((ids) => ids.length === 5), '5 questions chaque fois');
  vrai(r.V.every(([e]) => { const [t, c] = e.enonce.match(/\d+/g).map(Number); return e.libs.ecart === `−${t - c}` && ![1, 3, 8].includes(t - c); }), 'écart : compté − théorique, jamais 1, 3 ni 8');
  vrai(r.V.every(([, t]) => { const [n, j] = t.enonce.match(/\d+/g).map(Number); return !(n === 7 && j === 4) && t.libs.taux === `${j / n * 100} %` && new Set(Object.values(t.libs)).size === 3; }), 'taux : jamais 4 sur 7, trois choix différents');
  vrai(r.V.every(([, , a]) => /2026/.test(a.enonce) && /2027$/.test(a.libs.douze) && /2028$/.test(a.libs.vingtquatre)), 'inventaire annuel : 12 mois après');
  vrai(r.V.every(([, , , d]) => { const k = +d.enonce.match(/\d+/)[0]; return k !== 3 && d.libs.fut === `${k * 40} €`; }), 'vides : jamais 3, k × 40 €');
  egal(r.statuts, [200], 'le dessin est servi par le dépôt');
  vrai(r.imgs.every((f) => r.cred.includes(f)), 'ligne de crédit');
});

await v('ENT-6.6 : « Le droit » cite L123-12, L541-1-1, l’arrêté de 2026, L1222-3 et L1222-4 ; « Mon inventaire » après validation ; corrigé calculé', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent66.js');
    const C = await import('/contenus/corriges/ENT-6.6.js');
    return { droit: S.DOCUMENTS.find((d) => d.id === 'droit').html, corrige: JSON.stringify(C.CORRIGE) };
  });
  for (const a of ['L123-12', 'au moins une fois tous les douze mois', 'L541-1-1', 'utilisés de nouveau pour un usage identique', '6 février 2026', 'égale ou supérieure à 20 litres : <b>40 euros</b>', 'Casiers à trous',
    'L1222-3', 'expressément informé, préalablement', 'L1222-4', 'porté préalablement à sa connaissance']) vrai(r.droit.includes(a), 'le droit : ' + a);
  for (const a of ['["M01","47","Heineken 30 L — lot S20","15","16"]', '["M04","63","Pelforth 20 L — lot S19","0","8"]', '["M08","91","Fûts vides","19","22"]',
    '["M04","−8","Remettre en place (sans régulariser)"', '"120 €"', '"57 %"', '"4 sur 7"']) vrai(r.corrige.includes(a), 'corrigé : ' + a);
  // « Mon inventaire » de l'élève qui vient de finir (parcours juste plus haut) : ses comptages et le stock du logiciel, sans juste / faux.
  choix66 = BONNES66;
  await monter66({ uid: 'fb66-doc' });
  await compter66(); await etape66(); await inventaire66(ECARTS66, DEC66);
  const doc = await pg.evaluate(async () => { const S = await import('/contenus/france-boissons-ent66.js');
    return S.DOCUMENTS.find((d) => d.id === 'mon-inventaire').html(window.__f.db); });
  vrai(doc.includes('<td>M01</td><td>Heineken 30 L — lot S20</td><td>15</td><td>16</td><td>−1</td>'), 'ligne M01 : ' + doc.slice(0, 600));
  vrai(!/juste|faux/i.test(doc), 'aucune marque juste / faux');
});

await v('ENT-6.6 : enseignant — la séance s’ouvre (zone de masse, terminal), rien ne remonte au suivi', async () => {
  await monter66({ role: 'prof', uid: 'prof' });
  await aller('entrepot');
  await pg.waitForSelector(VT66);
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontées');
});

await pg.emulateMedia({ reducedMotion: null });

await v('ENT-6.6 : aucune erreur JavaScript', async () => {
  if (erreursF.length) throw new Error(erreursF.slice(0, 4).join(' | '));
});

await F.fermer();
}
