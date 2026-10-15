// Suite de tests de Prepalog — bloc « fb-6.5 » : ENT-6.5 (France Boissons, ranger les fûts).
// `node outils/test.mjs fb-6.5` ne lance que ce bloc. Découpé de l'ancien bloc `france-boissons` le 12/10/2026 : un bloc par
// séance (l'ensemble durait 8 min 20 et bornait toute la suite). Les cas sont ceux d'avant, déplacés tels quels ; les aides
// communes (contexte, page, relevé d'erreurs JavaScript, lecture de la base) sont dans `outils/test/france-boissons/commun.mjs`.

import { ouvrirFB } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, texte, bandeau, entrants, horodate, calcPresente, nettoyerCalc, erreursF } = F;

// Mouvement réduit, comme dans l'ancien bloc (la section 6.4 le posait pour 6.5 et 6.6) ; remis à la fin.
await pg.emulateMedia({ reducedMotion: 'reduce' });

// ── ENT-6.5 : ranger les fûts (brief `docs/briefs/ENT-6.5-france-boissons-rangement.md`, §8 ; moteur D-5) ──────────────────────────────
// Même montage (la vraie séance, `activites/france-boissons-rangement.js`), de vrais clics, mouvement réduit (gardé de la section 6.4).
// L'animation n'est jouée pour de vrai qu'une fois (parcours juste : ~30 s d'attentes, même en mouvement réduit) ; ailleurs, ses deux
// premières réponses sont posées dans la base (`anim`). Les gestes impossibles du stockage de masse sont testés au bloc `entrepot`.
// Valeurs ÉCRITES À LA MAIN :
//   jalons (somme 17) : fb-ent65-fifo-q1 1,5, fb-ent65-fifo-q2 2 (FIFO) · palette-P1 2,5, P2 2,5, P3 1,5, P4 2 (rangement) · stock-P1 1,
//   P2 1,5, P3 1,5, P4 1 (entrée en stock) ; questions notées (3) : futs-p3 1,5 (au bilan), lot-tracabilite 1,5 ; verifie-avant-poser
//   pour réfléchir. Fiche juste : P1 Heineken (HEI30) S24 8 fûts, 16 → 24 ; P2 Pelforth (PEL20) S24 8, 24 → 32 ; P3 Affligem (AFF20) S24
//   7, 2 → 9 ; P4 Edelweiss (EDW20) S24 7, 24 → 31 ; couloir = celui où l'élève a posé la palette.
const ID65 = 'france-boissons-rangement', M65 = 'fb-ent65-masse', A65 = 'fb-ent65-fifo';
const REP65 = { 'masse-cest-quoi': 'sol', gerber: 'poser-dessus', 'lot-ancien': 'ancien', 'stock-apres': 'somme', 'ddm-biere': 'avant-date',
  'manutention-meca': 'mecanique', 'securite-collegue': 'oui', 'sol-glissant': 'employeur', 'palette-retention': 'bac', 'racks-ou-sol': 'sol' };
const PREP65 = ['masse-cest-quoi', 'gerber', 'lot-ancien', 'stock-apres'], DROIT65 = ['ddm-biere', 'manutention-meca', 'securite-collegue', 'sol-glissant'],
  IMAGE65 = ['palette-retention', 'racks-ou-sol'];
const ANIM65 = (q1 = 1, q2 = 2) => ({ reponses: { q1: { premiere: q1, juste: q1 === 1, quand: 1 }, q2: { premiere: q2, juste: q2 === 2, quand: 1 } },
  ordres: {}, partie: 1, ecransVus: true });
const monter65 = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/france-boissons-rangement.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})['france-boissons-rangement'] = db.questions['france-boissons-rangement'] || {});
    for (const [id, v] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: v, duree: 1 };
  }
  if (o.anim) (db.animations = db.animations || {})['fb-ent65-fifo'] = o.anim;
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'fb65' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'FB',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { ...o, rep: REP65 });

const BONNES65 = { 'verifie-avant-poser': 'lot', 'futs-p3': 'vraiment', 'lot-tracabilite': 'tracer' };
const FAUSSES65 = { 'verifie-avant-poser': 'rien', 'futs-p3': 'bl', 'lot-tracabilite': 'prix' };
let choix65 = BONNES65;
async function qrep65() {
  for (let i = 0; i < 4; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    await pg.click(`${Z} [data-q-choix="${choix65[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
const ZM65 = `${Z} .pm`;
async function poser65(id, c, p) {
  await pg.click(`${ZM65} .pm-cartes [data-pm-pal="${id}"]`);
  if (await pg.$(`${ZM65} [data-pm="retour"]`)) await pg.click(`${ZM65} [data-pm="retour"]`);
  await pg.click(`${ZM65} [data-pm-couloir="${c}"] .pm-sol`);
  await pg.click(`${ZM65} [data-pm-place="${p}"]`);
  await pause();
  await qrep65();
  await pg.click(`${ZM65} [data-pm="retour"]`);
}
async function ranger65(places = { P1: ['M02', 1], P2: ['M03', 1], P3: ['M06', 1], P4: ['M07', 2] }) {
  await aller('entrepot');
  for (const [id, [c, p]] of Object.entries(places)) await poser65(id, c, p);
  await pg.click(`${ZM65} [data-pm="valider"]`);
  await pg.click(`${ZM65} [data-pm="oui"]`);
  await pause();
  await qrep65();
}
const LIGNES65 = { P1: ['HEI30', 'S24', '8', 'M02', '16', '24'], P2: ['PEL20', 'S24', '8', 'M03', '24', '32'],
  P3: ['AFF20', 'S24', '7', 'M06', '2', '9'], P4: ['EDW20', 'S24', '7', 'M07', '24', '31'] };
// Remplit la fiche (une ligne par palette ; `diff` remplace des cases : { P2: { ref: 'AFF20' } }), puis l'envoie.
async function remplir65(diff = {}, { envoyer = true } = {}) {
  await aller('fiche');
  for (const [id, L] of Object.entries(LIGNES65)) {
    const [ref, lot, futs, couloir, avant, apres] = L, d = diff[id] || {};
    const val = { ref, lot, futs, couloir, avant, apres, ...d };
    for (const k of ['ref', 'lot', 'couloir']) { await pg.selectOption(`${Z} [data-fiche-champ="${id}-${k}"]`, val[k]); await pause(40); await qrep65(); }
    for (const k of ['futs', 'avant', 'apres']) {
      await pg.fill(`${Z} [data-fiche-saisie="${id}-${k}"]`, val[k]);
      await pg.press(`${Z} [data-fiche-saisie="${id}-${k}"]`, 'Tab');
      await pause(40); await qrep65();
    }
  }
  if (!envoyer) return;
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause();
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  await qrep65();
}
const JALONS65 = ['fb-ent65-fifo-q1', 'fb-ent65-fifo-q2', 'palette-P1', 'palette-P2', 'palette-P3', 'palette-P4', 'stock-P1', 'stock-P2', 'stock-P3', 'stock-P4'];
const POIDS65 = { 'fb-ent65-fifo-q1': 1.5, 'fb-ent65-fifo-q2': 2, 'palette-P1': 2.5, 'palette-P2': 2.5, 'palette-P3': 1.5, 'palette-P4': 2,
  'stock-P1': 1, 'stock-P2': 1.5, 'stock-P3': 1.5, 'stock-P4': 1 };
const etats65 = (n) => JALONS65.map((j) => [j, n.detail[j]]);
const sauf65 = (faux, etat = 'ko') => JALONS65.map((j) => [j, faux.includes(j) ? etat : 'ok']);
const points65 = (faux) => 20 - faux.reduce((s, j) => s + POIDS65[j], 0);

await v('ENT-6.5 : déclaration — meta, parcours après ENT-6.4, dix jalons aux poids écrits à la main (17) + deux questions notées (3) = 20, trois groupes, aucun jalon à 0', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/france-boissons-rangement.js');
    const S = await import('/contenus/france-boissons-ent65.js');
    const Qs = await import('/contenus/questions/ENT-6.5.js');
    return { meta: A.meta, etapes: S.ETAPES.map((e) => [e.id, e.poids, e.groupe]), part: Qs.QUESTIONS.part,
      notees: Qs.QUESTIONS.liste.filter((q) => q.type !== 'ouverture' && !q.reflexion).map((q) => [q.id, q.poids, q.groupe]),
      reflexions: Qs.QUESTIONS.liste.filter((q) => q.reflexion).map((q) => q.id) };
  });
  const m = r.meta;
  egal([m.id, m.code, m.rubrique, m.niveaux, m.competences, m.domaines, m.temps, m.bareme, m.parcours, m.precedente, m.correction, m.questions, m.corrige, m.portee],
    ['france-boissons-rangement', 'ENT-6.5', 'simulog', ['2de', 'cap'], ['C1.5', 'C1.6'], ['D4', 'D5'], 'entrainement', 20, true, 'france-boissons-reception', true, 'ENT-6.5',
      './contenus/corriges/ENT-6.5.js', 'eleve'], 'meta');
  vrai(m.jeuId === undefined, 'une base par séance : aucun jeuId partagé');
  const F = 'Comprendre le FIFO', R = 'Rangement dans la zone de masse', S = 'Entrée en stock';
  egal(r.etapes, [['fb-ent65-fifo-q1', 1.5, F], ['fb-ent65-fifo-q2', 2, F], ['palette-P1', 2.5, R], ['palette-P2', 2.5, R], ['palette-P3', 1.5, R], ['palette-P4', 2, R],
    ['stock-P1', 1, S], ['stock-P2', 1.5, S], ['stock-P3', 1.5, S], ['stock-P4', 1, S]], 'jalons, poids et groupes');
  egal(r.etapes.reduce((s, e) => s + e[1], 0), 17, 'somme des jalons');
  vrai(r.etapes.every((e) => e[1] > 0), 'aucun jalon à 0');
  egal(r.part, 3, 'part des questions');
  egal(r.notees, [['futs-p3', 1.5, 'Question de Nadia : les fûts entrés'], ['lot-tracabilite', 1.5, 'Question de Thomas : à quoi sert le lot']], 'questions notées');
  egal(r.reflexions, ['verifie-avant-poser'], 'question pour réfléchir');
});

await v('ENT-6.5 : livraison — pret: true et ouverture: prof ; aucune séance en échec au registre', async () => {
  const r = await pg.evaluate(async () => {
    const I = await import('/activites/index.js');
    await I.chargerActivites();
    const A = await import('/activites/france-boissons-rangement.js');
    return { pret: A.meta.pret, ouverture: A.meta.ouverture, echecs: I.activitesEnEchec().length };
  });
  egal([r.pret, r.ouverture, r.echecs], [true, 'prof', 0], 'livraison');
});

await v('ENT-6.5 : données — palettes reprises d’ENT-6.4 (Pelforth lue, 7 fûts pour P3 et P4), stock de départ du plan = stock de l’univers, fiche attendue 24 / 32 / 9 / 31', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent65.js');
    const E = await import('/core/types/entrepot.js');
    const parRef = {};
    Object.values(S.MASSE.stock).flat().flat().filter((x) => x.ref !== 'VIDES').forEach((x) => { parRef[x.ref] = (parRef[x.ref] || 0) + (x.futs == null ? 8 : x.futs); });
    return { pal: S.PALETTES.map((p) => [p.id, p.ref, p.lot, p.futs, p.kg]), parRef,
      att: ['P1', 'P2', 'P3', 'P4'].map((id) => { const a = S.attenduLigne(id); return [id, a.ref, a.futs, a.avant, a.apres]; }), bonnes: E.bonnesReponses(S.MASSE) };
  });
  egal(r.pal, [['P1', 'HEI30', 'S24', 8, 350], ['P2', 'PEL20', 'S24', 8, 260], ['P3', 'AFF20', 'S24', 7, 230], ['P4', 'EDW20', 'S24', 7, 230]], 'palettes');
  egal(r.parRef, { HEI30: 16, PEL20: 24, AFF20: 2, EDW20: 24 }, 'stock du plan (fûts pleins par référence)');
  egal(r.att, [['P1', 'HEI30', 8, 16, 24], ['P2', 'PEL20', 8, 24, 32], ['P3', 'AFF20', 7, 2, 9], ['P4', 'EDW20', 7, 24, 31]], 'lignes attendues');
  egal(r.bonnes, {
    P1: ['M02 · position 1 · niveau 1', 'M06 · position 1 · niveau 1'],
    P2: ['M02 · position 1 · niveau 1', 'M03 · position 1 · niveau 3', 'M03 · position 2 · niveau 1', 'M06 · position 1 · niveau 1'],
    P3: ['M02 · position 1 · niveau 1', 'M06 · position 1 · niveau 1'],
    P4: ['M02 · position 1 · niveau 1', 'M06 · position 1 · niveau 1', 'M07 · position 2 · niveau 1'],
  }, 'bonnes places (P2 et P4 justes aussi dans un couloir vide : choix de Tristan du 11/10/2026)');
});

await v('ENT-6.5 : ouverture — message de Nadia (3 blocs, 16 juin 2027, 15 h 55), menu ; fiche cachée tant que le rangement n’est pas validé', async () => {
  await monter65({ uid: 'fb65-ouv' });
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue)),
    ['ouverture', 'accueil', 'mail', 'animation:fb-ent65-materiel', 'animation:fb-ent65-fifo', 'entrepot'], 'menu (dans l’ordre : le matériel, le FIFO, la zone de masse)');
  const M = await entrants();
  egal(M.length, 1, 'un seul message au départ');
  egal(M[0].subject, 'On range les palettes de Mons', 'sujet');
  egal(M[0].text, 'Re-bonjour Lea !\n\nLes palettes de Mons sont en zone de réception. Le fût qui fuit reste en [[zone litiges]].\n\n'
    + 'Avant de ranger, regarde comment on travaille ici : la réserve n’est pas dans des racks, les palettes pleines sont posées au sol.\n\nNadia', 'texte');
  egal(horodate(M[0].ts), [2027, 6, 16, 15, 55], 'date du scénario');
  egal(M[0].pieces, ['droit'], 'pièce jointe');
  await aller('entrepot');
  egal(Object.keys((await base()).entrepots), ['fb-ent65-masse'], 'l’état du rangement est rangé sous l’id de la séance');
  egal([(await base()).entrepots[M65].ordre, (await base()).entrepots[M65].valide], [[], false], 'rien de rangé à l’ouverture');
  vrai(!(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue))).includes('fiche'), 'fiche cachée avant la validation');
});

await v('ENT-6.5 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau', async () => {
  await monter65({ uid: 'fb65-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin]')), 'bandeau de fin');
});

await v('ENT-6.5 : parcours juste — le matériel, le mot FIFO, l’animation jouée (deux questions justes), rangement juste, fiche juste → 20/20 ; Nadia remercie ; bandeau ✓ ; photo', async () => {
  choix65 = BONNES65;
  await monter65({ uid: 'fb65-juste' });
  await aller('animation:fb-ent65-materiel');
  vrai(/CACES R489 catégorie 3/.test(await texte()), 'écran du chariot');
  await pg.click(`${Z} [data-anim-ecran="0"] [data-anim-ecran-suiv]`);
  vrai(/palette de rétention/.test(await texte()), 'écran de la palette');
  await aller('animation:fb-ent65-fifo');
  vrai(/premier entré, premier sorti/.test(await texte()), 'le mot FIFO expliqué');
  await pg.click(`${Z} [data-anim-ecran="0"] [data-anim-ecran-suiv]`);
  await pg.waitForSelector(`${Z} [data-anim-q]:not([hidden]) [data-anim-choix]`, { timeout: 40000 });
  await pg.click(`${Z} [data-anim-choix="1"]`); await pg.click(`${Z} [data-anim-valider]`);
  await pg.click(`${Z} [data-anim-suite]`);
  await pg.waitForSelector(`${Z} [data-anim-q][hidden]`, { state: 'attached', timeout: 3000 });
  await pg.waitForSelector(`${Z} [data-anim-q]:not([hidden]) [data-anim-choix]`, { timeout: 40000 });
  await pg.click(`${Z} [data-anim-choix="2"]`); await pg.click(`${Z} [data-anim-valider]`);
  await pause();
  await ranger65();
  egal(await pg.$$eval(`${ZM65} [data-pm-verd]`, (L) => L.map((d) => d.textContent.replace(/\s+/g, ' ').trim())),
    ['✓ bien rangée', '✓ bien rangée', '✓ bien rangée', '✓ bien rangée'], 'bilan du rangement');
  // Le menu se redessine à la validation (correctif moteur du 11/10/2026) : la fiche est là sans autre clic.
  vrai((await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue))).includes('fiche'), '« Entrée en stock » absente du menu juste après la validation');
  await remplir65();
  const n = await note();
  egal([n.score, n.max], [20, 20], 'note');
  egal(etats65(n), sauf65([]), 'jalons');
  egal(await bandeau(), [['fb-ent65-fifo-q1', 'ok'], ['palette-P1', 'ok'], ['stock-P1', 'ok'], ['question:futs-p3', 'ok'], ['question:lot-tracabilite', 'ok']],
    'bandeau : une ligne par groupe, une par question notée');
  egal((await entrants()).filter((m) => m.subject === 'RE : l’entrée en stock').map((m) => m.text),
    ['Merci Lea, c’est rangé. Demain 7 h, on compte le stock avant le week-end de la Fête.\n\nNadia'], 'réponse de Nadia');
  vrai(!!(await base()).points[ID65], 'photo de fin : la séance suivante peut s’ouvrir');
});

await v('ENT-6.5 : variante juste (P1 M06, P3 M02, P2 M03 position 2) et fiche qui suit → 20/20', async () => {
  choix65 = BONNES65;
  await monter65({ uid: 'fb65-var', anim: ANIM65() });
  await ranger65({ P1: ['M06', 1], P3: ['M02', 1], P2: ['M03', 2], P4: ['M07', 2] });
  await remplir65({ P1: { couloir: 'M06' }, P3: { couloir: 'M02' } });
  const n = await note();
  egal([n.score, etats65(n)], [20, sauf65([])], 'note et jalons');
});

await v('ENT-6.5 : P2 et P4 dans les couloirs vides (M02, M06) sont justes ; P1 et P3 n’ont plus de couloir vide → P1 devant le S20 de M01 faux (un seul lot), P3 en M05 faux', async () => {
  choix65 = BONNES65;
  await monter65({ uid: 'fb65-vides', anim: ANIM65() });
  await ranger65({ P2: ['M02', 1], P4: ['M06', 1], P1: ['M01', 2], P3: ['M05', 2] });
  await remplir65({ P1: { couloir: 'M01' }, P2: { couloir: 'M02' }, P3: { couloir: 'M05' }, P4: { couloir: 'M06' } });
  const n = await note();
  egal(etats65(n), sauf65(['palette-P1', 'palette-P3']), 'jalons');
  egal(n.score, points65(['palette-P1', 'palette-P3']), 'note');
});

await v('ENT-6.5 : animation — question 1 fausse puis juste → jalon 1 faux (1,5) ; question 2 fausse → jalon 2 faux (2)', async () => {
  choix65 = BONNES65;
  await monter65({ uid: 'fb65-q1', anim: ANIM65(0, 2) });
  await ranger65();
  await remplir65();
  egal(etats65(await note()), sauf65(['fb-ent65-fifo-q1']), 'Q1 : première réponse fausse');
  egal((await note()).score, 18.5, 'note');
  await monter65({ uid: 'fb65-q2', anim: ANIM65(1, 0) });
  await ranger65();
  await remplir65();
  egal(etats65(await note()), sauf65(['fb-ent65-fifo-q2']), 'Q2 fausse');
  egal((await note()).score, 18, 'note');
});

const PIEGES65 = [
  ['P1 en M01 devant le S20', { P1: ['M01', 2], P2: ['M03', 1], P3: ['M06', 1], P4: ['M07', 2] }, { P1: { couloir: 'M01' } }, ['palette-P1'], ['un seul lot par couloir']],
  ['P1 sur la pile de 2 de M01', { P1: ['M01', 1], P2: ['M03', 1], P3: ['M06', 1], P4: ['M07', 2] }, { P1: { couloir: 'M01' } }, ['palette-P1'], ['un seul lot par couloir', 'hauteur de gerbage']],
  ['P1 en M02 position 4', { P1: ['M02', 4], P2: ['M03', 1], P3: ['M06', 1], P4: ['M07', 2] }, {}, ['palette-P1'], ['par le fond']],
  ['P2 en M04 (lot S19)', { P1: ['M02', 1], P2: ['M04', 2], P3: ['M06', 1], P4: ['M07', 2] }, { P2: { couloir: 'M04' } }, ['palette-P2'], ['un seul lot par couloir']],
  ['P3 en M05 devant le S18', { P1: ['M02', 1], P2: ['M03', 1], P3: ['M05', 2], P4: ['M07', 2] }, { P3: { couloir: 'M05' } }, ['palette-P3'], ['un seul lot par couloir']],
  ['P4 sur la pile de 3 de M07', { P1: ['M02', 1], P2: ['M03', 1], P3: ['M06', 1], P4: ['M07', 1] }, {}, ['palette-P4'], ['hauteur de gerbage']],
  ['P4 dans le couloir VIDES', { P1: ['M02', 1], P2: ['M03', 1], P3: ['M06', 1], P4: ['M08', 3] }, { P4: { couloir: 'M08' } }, ['palette-P4'], ['couloir VIDES']],
];
for (const [nom, places, diff, faux, crit] of PIEGES65) {
  await v(`ENT-6.5 : piège de rangement — ${nom} → seul ${faux[0]} faux (${points65(faux)}/20), le bilan nomme « ${crit.join(', ')} » sans donner de place ; la fiche qui suit l’élève reste juste (pas de double peine)`, async () => {
    choix65 = BONNES65;
    await monter65({ uid: `fb65-${faux[0]}-${crit.length}`, anim: ANIM65() });
    await ranger65(places);
    const pid = faux[0].replace('palette-', '');
    const B = await pg.$eval(`${ZM65} [data-pm-verd="${pid}"]`, (d) => d.textContent.replace(/\s+/g, ' ').trim());
    egal(B, `✗ critère : ${crit.join(', ')}`, 'bilan de la carte');
    vrai(!/M0\d|position|niveau/.test(B), 'le bilan ne donne aucune place');
    await remplir65(diff);
    const n = await note();
    egal(etats65(n), sauf65(faux), 'jalons');
    egal(n.score, points65(faux), 'note');
  });
}

await v('ENT-6.5 : fiche — P2 en Affligem (recopié du BL) → stock-P2 faux seul ; P3 à 8 fûts → stock-P3 faux ; stock après Affligem 10 → stock-P3 faux ; couloir saisi ≠ couloir posé → faux', async () => {
  choix65 = BONNES65;
  const cas = [
    [{ P2: { ref: 'AFF20' } }, ['stock-P2']],
    [{ P3: { futs: '8', apres: '10' } }, ['stock-P3']],
    [{ P3: { apres: '10' } }, ['stock-P3']],
    [{ P4: { futs: '8', apres: '32' } }, ['stock-P4']],
    [{ P1: { couloir: 'M06' } }, ['stock-P1']],
  ];
  for (const [k, [diff, faux]] of cas.entries()) {
    await monter65({ uid: `fb65-fiche-${k}`, anim: ANIM65() });
    await ranger65();
    await remplir65(diff);
    const n = await note();
    egal(etats65(n), sauf65(faux), `cas ${JSON.stringify(diff)}`);
    egal(n.score, points65(faux), `note ${JSON.stringify(diff)}`);
  }
});

await v('ENT-6.5 : le lot et le stock avant ne sont pas notés à part ; fiche non envoyée → les quatre lignes « à faire », jamais justes', async () => {
  choix65 = BONNES65;
  await monter65({ uid: 'fb65-lot', anim: ANIM65() });
  await ranger65();
  await remplir65({ P1: { lot: 'S20', avant: '15' } });
  egal(etats65(await note()), sauf65([]), 'lot et stock avant faux : rien ne tombe');
  await monter65({ uid: 'fb65-non-envoyee', anim: ANIM65() });
  await ranger65();
  await remplir65({}, { envoyer: false });
  const n = await note();
  egal(['stock-P1', 'stock-P2', 'stock-P3', 'stock-P4'].map((j) => n.detail[j]), ['attente', 'attente', 'attente', 'attente'], 'fiche remplie mais pas envoyée');
  egal(n.score, 15, 'FIFO, rangement et questions : 3,5 + 8,5 + 3');
});

await v('ENT-6.5 : questions au fil — « qu’as-tu vérifié » à la 1re palette posée (pour réfléchir) ; « fûts de P3 » au bilan, fausse = 18,5 ; « lot » (178/2002) corrigée tout de suite, fausse = 18,5', async () => {
  choix65 = FAUSSES65;
  await monter65({ uid: 'fb65-qfaux', anim: ANIM65() });
  await aller('entrepot');
  await pg.click(`${ZM65} .pm-cartes [data-pm-pal="P1"]`);
  await pg.click(`${ZM65} [data-pm-couloir="M02"] .pm-sol`);
  await pg.click(`${ZM65} [data-pm-place="1"]`);
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'verifie-avant-poser', 'la question arrive à la première palette posée');
  await qrep65();
  await pg.click(`${ZM65} [data-pm="retour"]`);
  for (const [id, c, p] of [['P2', 'M03', 1], ['P3', 'M06', 1], ['P4', 'M07', 2]]) await poser65(id, c, p);
  await pg.click(`${ZM65} [data-pm="valider"]`); await pg.click(`${ZM65} [data-pm="oui"]`); await pause();
  await remplir65();
  const n = await note();
  egal(n.score, 17, 'les deux questions notées fausses : 20 − 1,5 − 1,5');
  egal(etats65(n), sauf65([]), 'les jalons ne bougent pas');
  egal(await bandeau(), [['fb-ent65-fifo-q1', 'ok'], ['palette-P1', 'ok'], ['stock-P1', 'ok'], ['question:futs-p3', 'ko'], ['question:lot-tracabilite', 'ko']], 'bandeau');
  choix65 = BONNES65;
});

await v('ENT-6.5 : « Avant de commencer » — 5 questions tirées (2 + 2 + 1), non notées, la calculette ; toute la banque sort sur 300 graines ; valeurs tirées jamais celles de la séance ; images servies et créditées', async () => {
  await nettoyerCalc();
  await monter65({ sansOuverture: true, uid: 'fb65-ouv-1' });
  vrai(await present('[data-ouverture="avant-de-commencer"]'), 'la séance ne s’ouvre pas sur « Avant de commencer »');
  vrai(await calcPresente(), 'calculette absente');
  const t1 = (await base()).questions[ID65]['@tirage'].ids;
  egal([t1.filter((i) => PREP65.includes(i)).length, t1.filter((i) => DROIT65.includes(i)).length, t1.filter((i) => IMAGE65.includes(i)).length], [2, 2, 1], 'répartition : ' + t1);
  for (let k = 0; k < t1.length; k++) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    await pg.click(`${Z} [data-q-choix="${REP65[t1[k]]}"][data-q="${t1[k]}"]`);
    await pg.click(`${Z} [data-q-repondre="${t1[k]}"]`);
    await pause();
  }
  vrai((await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue))).includes('animation:fb-ent65-fifo'), 'menu ouvert après les réponses');
  egal((await note()).score, 0, 'l’ouverture ne compte pas');
  await nettoyerCalc();
  const r = await pg.evaluate(async () => {
    const { compilerQuestions, tirerOuverture } = await import('/core/types/questions.js');
    const { hasard } = await import('/core/tirage.js');
    const { QUESTIONS } = await import('/contenus/questions/ENT-6.5.js');
    const M = compilerQuestions(QUESTIONS, null, ['mots', 'photos', 'droit']);
    const T = [];
    for (let s = 0; s < 300; s++) T.push(tirerOuverture(M, `graine-${s}`).ids);
    const lot = QUESTIONS.liste.find((q) => q.id === 'lot-ancien').variante, stock = QUESTIONS.liste.find((q) => q.id === 'stock-apres').variante;
    const V = [];
    for (let s = 0; s < 300; s++) V.push([lot(hasard(`l${s}`)), stock(hasard(`s${s}`))]);
    const imgs = QUESTIONS.ouverture.documents.find((d) => d.id === 'photos').images;
    const statuts = [];
    for (const im of imgs) statuts.push((await fetch(im.src)).status);
    const cred = await (await fetch('/contenus/images/france-boissons/CREDITS.md')).text();
    return { T, V, imgs: imgs.map((i) => i.src.split('/').pop()), statuts, cred };
  });
  egal([...new Set(r.T.flat())].sort(), [...PREP65, ...DROIT65, ...IMAGE65].sort(), 'toute la banque sort');
  vrai(r.T.every((ids) => ids.length === 5), '5 questions chaque fois');
  vrai(r.V.every(([l]) => !/S(18|19|20|24)\b/.test(l.enonce) && l.libs.ancien !== l.libs.recent), 'un lot de la séance dans « lot-ancien »');
  vrai(r.V.every(([l]) => +l.libs.ancien.slice(1) < +l.libs.recent.slice(1)), 'le plus ancien est le plus petit numéro');
  vrai(r.V.every(([, s]) => !/ (16|24) fûts en stock ; il en entre 8|24 fûts en stock ; il en entre 7/.test(s.enonce)), 'un calcul de la séance dans « stock-apres »');
  vrai(r.V.every(([, s]) => { const [a, b] = s.enonce.match(/\d+/g).map(Number); return s.libs.somme === `${a + b} fûts`; }), 'stock après = avant + entrée');
  egal(r.statuts, [200, 200, 200], 'les trois images sont servies par le dépôt');
  vrai(r.imgs.every((f) => r.cred.includes(f)), 'lignes de crédit');
});

await v('ENT-6.5 : « Le droit » cite R4541-3, L4122-1, L4121-1, 178/2002 art. 18 et 1169/2011 ; l’état du stock et le BL avec ses réserves ; corrigé calculé', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent65.js');
    const C = await import('/contenus/corriges/ENT-6.5.js');
    const doc = (id) => S.DOCUMENTS.find((d) => d.id === id).html;
    return { droit: doc('droit'), stock: doc('etat-stock'), bl: doc('bl'), mots: doc('mots'), corrige: JSON.stringify(C.CORRIGE) };
  });
  for (const a of ['R4541-3', 'L4122-1', 'L4121-1', '178/2002', '1169/2011', 'notamment les équipements mécaniques', 'de celles des autres personnes concernées',
    'assurer la sécurité et protéger la santé physique et mentale', 'identifier les entreprises auxquelles leurs produits ont été fournis',
    'des boissons titrant 10 % ou plus en volume d’alcool']) vrai(r.droit.includes(a), 'le droit : ' + a);
  for (const a of ['Heineken fût 30 L</td><td>16 fûts', 'Affligem Blonde fût 20 L</td><td>2 fûts', 'Pelforth Blonde fût 20 L</td><td>24 fûts', 'Edelweiss fût 20 L</td><td>24 fûts']) vrai(r.stock.includes(a), 'état du stock : ' + a);
  vrai(r.bl.includes('MON-27-0617') && r.bl.includes('Produit différent : étiquette PELFORTH BLONDE FÛT 20 L') && r.bl.includes('1 fût endommagé (fuite)'), 'BL et réserves');
  vrai(!/couloir|M0\d|devant|hauteur/i.test(r.mots), 'les mots ne disent aucune règle de rangement');
  for (const a of ['M02 · position 1 · niveau 1', 'M03 · position 1 · niveau 3', 'M07 · position 2 · niveau 1', '16 → 24', '24 → 32', '2 → 9', '24 → 31',
    'Le chariot entre par l’allée : il ne peut prendre que la palette de devant.', 'En M03, au fond.', 'C1.5 = 12, C1.6 = 8']) vrai(r.corrige.includes(a), 'corrigé : ' + a);
});

await v('ENT-6.5 : aucun texte de la séance ne laisse croire « premier posé = premier sorti » dans un couloir', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent65.js');
    const Q = await import('/contenus/questions/ENT-6.5.js');
    return JSON.stringify([S.FIFO, S.MATERIEL, S.MASSE, S.FICHE, S.LEXIQUE, S.ACCUEIL, Q.QUESTIONS]);
  });
  vrai(!/premi[eè]re? pos[ée]e?s?,? (sort|premi)|posée en premier sort/i.test(r), 'contresens « premier posé, premier sorti »');
});

await v('ENT-6.5 : enseignant — la séance s’ouvre (zone de masse), rien ne remonte au suivi', async () => {
  await monter65({ role: 'prof', uid: 'prof' });
  await aller('entrepot');
  await pg.waitForSelector(`${ZM65}`);
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontées');
});

await pg.emulateMedia({ reducedMotion: null });

await v('ENT-6.5 : aucune erreur JavaScript', async () => {
  if (erreursF.length) throw new Error(erreursF.slice(0, 4).join(' | '));
});

await F.fermer();
}
