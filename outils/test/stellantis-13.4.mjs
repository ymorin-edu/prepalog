// Suite de tests de Prepalog — bloc « stellantis-13.4 » : Stellantis ENT-13.4, « ranger et compter selon ABC » (Terminale, la rentrée, C1.5 et C1.6, entraînement).
// `node outils/test.mjs stellantis-13.4` ne lance que ce bloc. Brief : `docs/briefs/ENT-13.4-stellantis-ranger-compter-abc.md` §4 à §8.
//
// Valeurs ÉCRITES À LA MAIN (jamais recalculées par le code) : valeur = sorties × prix (12 633 × 0,03 € = 378,99 € ; 22 × 82 € = 1 804 €), stock du logiciel et relevé de l'équipe
// (rétroviseur droit 14 / 12, rétroviseur gauche 9 / 9, faisceau d'habitacle 11 / 10, poignée extérieure 20 / 20).
// Barème (brief §5) : quatre palettes 4 · valeur 2 · classement 4 · comptage 2 · écarts 3 · questions notées 5 (quoi compter 2, clips 1, vis 1, écart 1) = 20.

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import { ouvrirStellantis, chargerXlsx, proche } from './stellantis/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai, ROOT, baseXlsx }) {

const ID = 'stellantis-ranger-compter-abc';
const ACT = '/activites/stellantis-ranger-compter-abc.js';
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const XL = await chargerXlsx(baseXlsx);
const S = await imp('contenus/stellantis-ent134-donnees.js');
const ABC = await imp('contenus/stellantis-abc.js');
const U = await imp('contenus/stellantis.js');
const GT = await imp('core/types/export-tableur.js');
const EN = await imp('core/types/entrepot.js');

const P = await ouvrirStellantis({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, texte, clic, allerV, noter, monter } = P;

const qFil = async (R) => {
  for (let i = 0; i < 12; i++) {
    await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 700 }).catch(() => null);
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(R[q], `question au fil « ${q} » sans réponse prévue`);
    await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80);
    if (await pg.$(`${Z} [data-q-repondre="${q}"]`)) { await clic(`[data-q-choix="${R[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); }
    if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); }
  }
};

const OUV = { valeur: '420', part: '20', aveugle: 'sans', ecart: 'moins3', tournant: 'partie', annuel: '12', accord: 'accord' };
const R = { clips: 'clips', 'quoi-compter': 'juste', vis: 'cher', 'ecart-retros': 'cause', 'annuel-tournant': 'chaque' };
const UID = 'st134';
const mont = (o = {}) => monter({ rep: OUV, uid: UID, ...o });
const dbNode = (uid = UID) => { S.TIRAGE.lier(S.ID); const db = { aisance: 'standard' }; S.TIRAGE.assurer(db, { uid, aisance: 'standard' }); return db; };

// Le rangement juste (chaque palette sur un emplacement libre de sa zone), et ses variantes.
const BON = { P1: 'A1-T01-N1-E3', P2: 'A1-T02-N1-E2', P3: 'A1-T03-N1-E3', P4: 'B1-T03-N1-E1' };
const jalonsPlan = (place) => EN.jalonsEntrepot({ entrepots: { [S.ID_PLAN]: { place } } }, S.PLAN).L.map((l) => [l.palette, l.ok]);

// ─────────────────────────────────────────────────────────── le classeur « de l'élève »
// `o` : trie (défaut vrai) · valeur ('formule' | 'tape') · total ('somme' | 'tape') · classement ('valeur' | 'sorties') · classe ('si' | 'main').
function classeur(db, o = {}) {
  const ex = GT.construireExport(S.TABLEUR.exports[0], db, {});
  const L = ex.feuilles[0].lignes.map((l) => l.slice());       // [ref, désignation, famille, sorties, prix]
  const base = (l) => (o.classement === 'sorties' ? l[3] : l[3] * l[4]);
  if (o.trie !== false) L.sort((a, b) => base(b) - base(a));
  const n = L.length, tot = n + 2;
  const T = L.reduce((s, l) => s + base(l), 0);
  const aoa = [[...S.COLONNES, 'Valeur', 'Part', 'Cumul', 'Classe'], ...L.map((l) => [...l, null, null, null, null])];
  const ws = XL.utils.aoa_to_sheet(aoa);
  let cum = 0;
  L.forEach((l, k) => {
    const r = k + 2, val = l[3] * l[4], part = base(l) / T;
    cum += part;
    ws['F' + r] = o.valeur === 'tape' ? { t: 'n', v: val } : { t: 'n', v: val, f: `D${r}*E${r}` };
    ws['G' + r] = { t: 'n', v: val / (L.reduce((s, x) => s + x[3] * x[4], 0)), f: `F${r}/F$${tot}`, z: '0%' };
    ws['H' + r] = { t: 'n', v: cum, f: k === 0 ? `G${r}` : `H${r - 1}+G${r}` };
    const cl = cum <= 0.8 ? 'A' : cum <= 0.95 ? 'B' : 'C';
    ws['I' + r] = o.classe === 'main' ? { t: 's', v: cl } : { t: 's', v: cl, f: `IF(H${r}<=0.8,"A",IF(H${r}<=0.95,"B","C"))` };
  });
  const TV = L.reduce((s, l) => s + l[3] * l[4], 0);
  ws['B' + tot] = { t: 's', v: 'Total' };
  ws['F' + tot] = o.total === 'tape' ? { t: 'n', v: TV } : { t: 'n', v: TV, f: `SUM(F2:F${n + 1})` };
  ws['!ref'] = `A1:I${tot}`;
  const wb = XL.utils.book_new();
  XL.utils.book_append_sheet(wb, ws, 'Sorties');
  return XL.write(wb, { bookType: 'xlsx', type: 'buffer' });
}
const deposer = (db, o) => {
  const ex = GT.construireExport(S.TABLEUR.exports[0], db, {});
  const wb = XL.read(classeur(db, o), { type: 'buffer', cellFormula: true });
  return GT.controlerDepot(wb, S.controles(db, ex.propres), ex.propres);
};
const etat = (res) => Object.fromEntries(res.map((r) => [r.id, r.ok ? 'ok' : 'ko']));
const TOUS_OK = { valeur: 'ok', total: 'ok', part: 'ok', cumul: 'ok', classe: 'ok' };

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-13.4 : la séance se charge (Tle, C1.5 et C1.6, entraînement) ; jalons 15 + part des questions 5 = 20 ; 4 notées + 1 réflexion ; ouverture 3 tirées parmi 7 ; au registre', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/stellantis-ranger-compter-abc.js');
    const C = await import('/contenus/stellantis-ent134.js');
    const Q = await import('/contenus/questions/ENT-13.4.js');
    const I = await import('/activites/index.js');
    const L = Q.QUESTIONS.liste;
    return { meta: A.meta, poids: C.ETAPES.map((e) => [e.id, e.poids]), part: Q.QUESTIONS.part,
      notees: L.filter((q) => q.type === 'fil' && !q.reflexion).map((q) => [q.id, q.poids || 1]), reflexions: L.filter((q) => q.reflexion).map((q) => q.id),
      ouv: Q.QUESTIONS.ouverture.tirage, rubriques: L.filter((q) => q.type === 'ouverture').map((q) => q.rubrique),
      auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'stellantis-ranger-compter-abc') };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture], ['ENT-13.4', ['tle'], ['C1.5', 'C1.6'], 'entrainement', 20, undefined, 'ENT-13.4', true, 'prof'], 'meta');
  egal(r.poids, [['palette-P1', 1], ['palette-P2', 1], ['palette-P3', 1], ['palette-P4', 1], ['valeur', 2], ['classement', 4], ['comptage', 2], ['ecarts', 3]], 'jalons et poids');
  proche(r.poids.reduce((s, x) => s + x[1], 0) + r.part, 20, 'jalons + part des questions');
  egal(r.notees, [['clips', 1], ['quoi-compter', 2], ['vis', 1], ['ecart-retros', 1]], 'questions notées et poids');
  proche(r.notees.reduce((s, x) => s + x[1], 0), r.part, 'poids des questions = part');
  egal(r.reflexions, ['annuel-tournant'], 'réflexion (la règle comptable n’est pas relue mot à mot : question non notée)');
  egal(r.ouv, { calcul: 1, inventaire: 1, droit: 1 }, 'ouverture tirée');
  egal(r.rubriques.sort(), ['calcul', 'calcul', 'droit', 'droit', 'inventaire', 'inventaire', 'inventaire'], 'banque d’ouverture');
  vrai(r.auRegistre, 'la séance est au registre');
});

// ─────────────────────────────────────────────────────────── le calcul et l'équité du tirage
await v('ENT-13.4 : valeur = sorties × prix (écrit à la main) ; les prix du magasin sont ceux de la fiche', () => {
  egal(ABC.valeurDe({ prix: 0.03 }, 12633), 378.99, '12 633 × 0,03 €');
  egal(ABC.valeurDe({ prix: 82 }, 22), 1804, '22 × 82 €');
  egal(U.parRef['VIS-M6'].prix, 0.04, 'prix de la vis');
  egal(U.parRef['RET-DRO'].prix, 82, 'prix du rétroviseur');
});

await v('ENT-13.4 : équité sur 500 graines — aucune égalité de valeur, 4 A / 5 B / 9 C sur la valeur, dernier A ≤ 79 %, premier B ≥ 81 %, A en valeur = les 4 mêmes références ; la vis est A en sorties et C en valeur, le rétroviseur droit A en valeur seulement ; au moins deux références changent de classe', () => {
  S.TIRAGE.lier(S.ID);
  let secours = 0;
  for (let i = 0; i < 500; i++) {
    const t = S.TIRAGE.tirer(`g${i}|${S.ID}`);
    if (t.secours) secours++;
    const jeu = U.refsDe(18).map((r, k) => ({ ref: r.ref, v: t.valeurs.s[k] }));
    const E = ABC.ecarts38(jeu);
    vrai(!E.length, `graine ${i} : ${E.join(' ; ')}`);
    const C = ABC.classements38(jeu);
    egal(C.sorties.classe['VIS-M6'], 'A', `graine ${i} : vis en sorties`);
    egal(C.valeur.classe['VIS-M6'], 'C', `graine ${i} : vis en valeur`);
    egal(C.valeur.classe['RET-DRO'], 'A', `graine ${i} : rétroviseur en valeur`);
    vrai(C.sorties.classe['RET-DRO'] !== 'A', `graine ${i} : rétroviseur en sorties`);
    egal(C.valeur.ordre.slice(0, 4).sort(), ['FAS-HAB', 'POI-EXT', 'RET-DRO', 'RET-GAU'], `graine ${i} : les A en valeur`);
  }
  egal(secours, 0, 'tirages de secours');
});

await v('ENT-13.4 : deux élèves, deux jeux ; le même élève retrouve le sien', () => {
  const a = dbNode('eleve-a'), b = dbNode('eleve-b'), a2 = dbNode('eleve-a');
  vrai(JSON.stringify(S.sorties(a)) !== JSON.stringify(S.sorties(b)), 'deux élèves ont le même jeu');
  egal(JSON.stringify(S.sorties(a)), JSON.stringify(S.sorties(a2)), 'même élève, même jeu');
  egal(S.sorties(dbNode()).length, 18, 'dix-huit références');
});

// ─────────────────────────────────────────────────────────── le plan du magasin (rangement)
await v('ENT-13.4 : le plan — chaque classe a des emplacements libres dans sa zone ; le rangement juste donne 4 jalons ; palette A au fond, caisse lourde en hauteur, emplacement occupé ou hors service → le jalon de la palette tombe, les autres restent', () => {
  egal(jalonsPlan(BON), [['P1', true], ['P2', true], ['P3', true], ['P4', true]], 'rangement juste');
  egal(jalonsPlan({}), [['P1', false], ['P2', false], ['P3', false], ['P4', false]], 'rien rangé : aucun jalon');
  egal(jalonsPlan({ ...BON, P1: 'A2-T04-N1-E2' }), [['P1', false], ['P2', true], ['P3', true], ['P4', true]], 'palette A au fond (travée 4)');
  egal(jalonsPlan({ ...BON, P1: 'A1-T01-N2-E3' }).map((x) => x[1]), [true, true, true, true], 'palette A au niveau 2 : permis');
  egal(jalonsPlan({ ...BON, P2: 'A2-T01-N1-E3' }), [['P1', true], ['P2', false], ['P3', true], ['P4', true]], 'palette B en travée 1');
  egal(jalonsPlan({ ...BON, P4: 'A2-T03-N2-E2' }), [['P1', true], ['P2', true], ['P3', true], ['P4', false]], 'caisse lourde au niveau 2');
  egal(jalonsPlan({ ...BON, P4: 'B1-T04-N3-E2' })[3], ['P4', false], 'caisse lourde au niveau 3');
  egal(jalonsPlan({ ...BON, P1: 'A1-T01-N2-E2' })[0], ['P1', false], 'emplacement hors service');
  vrai(!!S.STOCK['A1-T01-N1-E1'], 'A1-T01-N1-E1 est occupé au départ (la vue refuse de poser dessus)');
  // Le stock : aucun emplacement libre ni hors service n'est occupé ; chaque classe a au moins 3 places libres qui conviennent (la lourde : au sol).
  egal(S.LIBRES.filter((a) => S.STOCK[a] || S.HORS_SERVICE.includes(a)).length, 0, 'libres et stock disjoints');
  const accepte = (p) => S.LIBRES.filter((a) => jalonsPlan({ [p]: a }).find((x) => x[0] === p)[1]);
  vrai(accepte('P1').length >= 3 && accepte('P2').length >= 3 && accepte('P3').length >= 3 && accepte('P4').length >= 2, 'places libres par classe : ' + ['P1', 'P2', 'P3', 'P4'].map((p) => accepte(p).length).join('/'));
});

// ─────────────────────────────────────────────────────────── l'export et les contrôles
await v('ENT-13.4 : l’export — 5 colonnes (dont le prix unitaire), 18 lignes dans l’ordre des références ; le fichier porte le bon nom', () => {
  const db = dbNode();
  const e = S.TABLEUR.exports[0];
  egal(e.fichier, 'stellantis-sorties-semaine38.xlsx', 'nom');
  const ex = GT.construireExport(e, db, {});
  egal(ex.feuilles[0].colonnes, ['Référence', 'Désignation', 'Famille', 'Sorties', 'Prix unitaire'], 'colonnes');
  const L = ex.feuilles[0].lignes;
  egal(L.length, 18, 'lignes');
  egal(L.map((l) => l[0]), U.refsDe(18).map((r) => r.ref), 'ordre des références');
  egal(L.map((l) => l[4]), U.refsDe(18).map((r) => r.prix), 'prix unitaires');
});

await v('ENT-13.4 : un fichier juste (valeur =D*E, trié sur la valeur, SOMME, part en %, cumul, SI) — les 5 contrôles sont justes', () => {
  const r = deposer(dbNode());
  egal(etat(r), TOUS_OK, 'contrôles');
  egal(r.filter((x) => x.id !== 'total').map((x) => [x.justes, x.total]), [[18, 18], [18, 18], [18, 18], [18, 18]], 'lignes');
});

await v('ENT-13.4 : classement sur les sorties au lieu de la valeur → le cumul et la classe tombent, la valeur reste juste ; liste non triée → cumul faux ; valeur tapée → refusée ; total tapé → refusé ; classe à la main → refusée', () => {
  const db = dbNode();
  egal(etat(deposer(db, { classement: 'sorties' })), { valeur: 'ok', total: 'ok', part: 'ok', cumul: 'ko', classe: 'ko' }, 'sur les sorties');
  egal(etat(deposer(db, { trie: false })).cumul, 'ko', 'non trié');
  egal(etat(deposer(db, { valeur: 'tape' })), { ...TOUS_OK, valeur: 'ko' }, 'valeur tapée');
  egal(etat(deposer(db, { total: 'tape' })), { ...TOUS_OK, total: 'ko' }, 'total tapé');
  egal(etat(deposer(db, { classe: 'main' })), { ...TOUS_OK, classe: 'ko' }, 'classe à la main');
});

// ─────────────────────────────────────────────────────────── l'inventaire (données fixes)
await v('ENT-13.4 : l’inventaire — quatre lignes (relevé 12, 9, 10, 20 écrit à la main ; stock du logiciel 14, 9, 11, 20) ; deux écarts de causes différentes (remettre en place, régulariser « Sortie non saisie »)', () => {
  const L = S.LIGNES_COMPTAGE;
  egal(L.map((l) => [l.ref, l.systeme, l.compte]), [['RET-DRO', 14, 12], ['RET-GAU', 9, 9], ['FAS-HAB', 11, 10], ['POI-EXT', 20, 20]], 'stock et relevé');
  egal(L.map((l) => [l.ref, l.attendu || null, l.motif || null]), [['RET-DRO', 'rayon', null], ['RET-GAU', null, null], ['FAS-HAB', 'regul', 'Sortie non saisie'], ['POI-EXT', null, null]], 'décisions attendues');
  egal(S.INVENTAIRE.perimetre({}), null, 'sans la question : rien à compter');
  egal(S.INVENTAIRE.perimetre({ questions: { [S.ID]: { 'quoi-compter': { premiere: 'toutes' } } } }), ['RET-DRO', 'RET-GAU', 'FAS-HAB', 'POI-EXT'], 'après la question (même fausse) : les lignes du bon classement');
  egal(S.MOTIFS.includes('Sortie non saisie'), true, 'motif proposé');
});

// ─────────────────────────────────────────────────────────── à l'écran
const MENU = { plan: 'entrepot', inv: 'inventaire' };
async function ranger(place = BON, R2 = R) {
  await allerV(MENU.plan);
  for (const [id, a] of Object.entries(place)) {
    await clic(`.pe-bandeau [data-pe-pal="${id}"]`);
    if (await pg.$(`${Z} [data-pe="retour"]`)) { await clic('[data-pe="retour"]'); }
    await clic(`[data-pe-trav="${a.slice(0, 6)}"]`);
    await clic(`[data-pe-emp="${a}"]`);
    await clic('[data-pe="retour"]');
    await qFil(R2);   // la question des clips arrive dès que P1 est posée
  }
  await pause();
}
async function exporter() {
  await allerV('extractions');
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click(`${Z} [data-exporter="sorties38"]`)]);
  return dl;
}
async function deposerEcran(db, o, n = 0) {
  await allerV('fichiers');
  await pg.setInputFiles('#fichierTableur', { name: 'abc38.xlsx', mimeType: 'application/octet-stream', buffer: classeur(db, o) });
  await pg.waitForFunction(([Z, n]) => { const e = document.querySelector(Z); const t = e.innerText; return /résultats? justes? sur/.test(t) && (!n || e.querySelector('[data-q-panneau]') || new RegExp(n + '\\s+dépôts').test(t)); }, [Z, n]);
  await pause(900);
}
// L'inventaire à l'écran : saisie du relevé (`releve`), écarts calculés (`ecarts`), une décision par ligne en écart, validation.
const RELEVE = { 'RET-DRO': '12', 'RET-GAU': '9', 'FAS-HAB': '10', 'POI-EXT': '20' };
const ECARTS = { 'RET-DRO': '-2', 'RET-GAU': '0', 'FAS-HAB': '-1', 'POI-EXT': '0' };
const DEC = { 'RET-DRO': ['rayon'], 'FAS-HAB': ['regul', 'Sortie non saisie'] };
async function inventaire({ releve = RELEVE, ecarts = ECARTS, decisions = DEC, R2 = R } = {}) {
  await allerV(MENU.inv);
  for (const [k, x] of Object.entries(releve)) await pg.fill(`${Z} [data-inv-saisie="${k}"]`, x);
  await pg.click(`${Z} [data-inv-aller="2"]`);
  await pause();
  await qFil(R2);
  await allerV(MENU.inv);
  for (const [k, x] of Object.entries(ecarts)) await pg.fill(`${Z} [data-inv-ecart="${k}"]`, x);
  await pg.click(`${Z} [data-inv-aller="3"]`);
  await pause();
  for (const [k, [action, motif]] of Object.entries(decisions)) {
    await pg.selectOption(`${Z} [data-inv-action="${k}"]`, action);
    if (motif) await pg.selectOption(`${Z} [data-inv-motif="${k}"]`, motif);
  }
  await pg.click(`${Z} [data-inv-aller="4"]`);
  await pg.waitForSelector(`${Z} [data-inv-valider]`);
  await pg.click(`${Z} [data-inv-valider]`);
  await pg.waitForSelector(`${Z} [data-inv-valide]`);
  await pause();
  await qFil(R2);
}
// Tout le parcours, avec des variantes : `place` (le rangement), `fichier` (options du classeur, ou null = pas de dépôt), `inv` (options de l'inventaire).
async function jouer({ place = BON, fichier = {}, inv = {}, R2 = R } = {}) {
  await mont();
  await ranger(place, R2);
  const db0 = await base();
  if (fichier) {
    await exporter();
    await deposerEcran(db0, fichier);
    await qFil(R2);
    await inventaire({ ...inv, R2 });
  }
  await qFil(R2);
  return noter(ACT);
}

await v('ENT-13.4 : à l’écran — le magasin se range, Extractions donne le fichier de 18 lignes avec le prix, le dépôt en entraînement dit seulement combien de résultats sont justes', async () => {
  await mont();
  const M = await pg.evaluate(() => window.__f.db.mails.map((m) => [m.subject, m.kind]));
  vrai(M.some((m) => m[0] === 'Les palettes de la nuit') && M.some((m) => m[0] === 'Quelles pièces on compte chaque semaine ?'), 'les deux messages de Karim : ' + JSON.stringify(M));
  vrai(!M.some((m) => m[1] === 'releve'), 'pas de relevé avant la question');
  await ranger();
  await pause();
  const dl = await exporter();
  egal(dl.suggestedFilename(), 'stellantis-sorties-semaine38.xlsx', 'nom du fichier');
  const wb = XL.read(fs.readFileSync(await dl.path()), { type: 'buffer' });
  const rows = XL.utils.sheet_to_json(wb.Sheets['Sorties']);
  egal(rows.length, 18, 'lignes exportées');
  egal(Object.keys(rows[0]), ['Référence', 'Désignation', 'Famille', 'Sorties', 'Prix unitaire'], 'colonnes exportées');
  const db = await base();
  const attendu = Object.fromEntries(S.sorties(db).map((x) => [x.ref, x.v]));
  vrai(rows.every((r) => attendu[r['Référence']] === r['Sorties']), 'l’export ne porte pas les sorties du tirage');
  await qFil(R);
  await deposerEcran(db, { classement: 'sorties' });
  const t = (await texte()).replace(/\s+/g, ' ');
  vrai(/\d+ résultats? justes? sur 73/.test(t), 'le retour compte les résultats (valeur 18 + total 1 + part 18 + cumul 18 + classe 18 = 73) : ' + t.slice(0, 400));
  vrai(!/Ce qui cloche/.test(t), 'en entraînement le détail ne s’affiche pas');
});

await v('ENT-13.4 : parcours complet juste → 20/20 ; la question « quelles références comptes-tu » donne l’inventaire (relevé dans la messagerie, 4 lignes) ; le relevé et les causes arrivent au bon moment', async () => {
  const n = await jouer();
  proche(n.score, 20, 'tout juste');
  const D = await base();
  const M = D.mails.map((m) => [m.subject, m.kind]);
  vrai(M.some((m) => m[0] === 'Le relevé de la nuit' && m[1] === 'releve'), 'relevé : ' + JSON.stringify(M));
  vrai(M.some((m) => m[0] === 'Ce qu’on a vu en passant'), 'les causes : ' + JSON.stringify(M));
  for (const q of ['clips', 'quoi-compter', 'vis', 'ecart-retros', 'annuel-tournant']) vrai(D.questions[ID][q] && D.questions[ID][q].premiere === R[q], `question « ${q} » : ${JSON.stringify(D.questions[ID][q])}`);
});

await v('ENT-13.4 : inaction → 0/20 (aucun jalon juste) ; l’inventaire attend la question', async () => {
  await mont();
  const n = await noter(ACT);
  vrai(!n || n.score === 0, 'inaction : ' + JSON.stringify(n && n.score));
  await allerV(MENU.inv);
  vrai(/Réponds d’abord à la question de Karim/.test(await texte()), 'l’inventaire attend la question');
});

await v('ENT-13.4 : sabotages du rangement — palette A au fond ôte 1 (19) ; caisse lourde en hauteur ôte 1 (19) ; rien rangé ôte 5 (15)', async () => {
  proche((await jouer({ place: { ...BON, P1: 'A2-T04-N1-E2' }, R2: { ...R, clips: 'clips' } })).score, 19, 'palette A au fond');
  proche((await jouer({ place: { ...BON, P4: 'A2-T03-N2-E2' } })).score, 19, 'caisse lourde au niveau 2');
  proche((await jouer({ place: {} })).score, 15, 'rien rangé : 4 palettes + la question des clips, qui se pose quand P1 est rangée');
});

await v('ENT-13.4 : sabotages du fichier — classement sur les sorties : le classement (4) tombe → 16 ; valeur tapée −2 → 18 ; pas de dépôt : valeur, classement et la question « quoi compter » → inventaire fermé', async () => {
  proche((await jouer({ fichier: { classement: 'sorties' } })).score, 16, 'sur les sorties');
  proche((await jouer({ fichier: { valeur: 'tape' } })).score, 18, 'valeur tapée');
});

await v('ENT-13.4 : sabotages de l’inventaire — tout régulariser sans chercher ôte 3 (le jalon « écarts » tombe) ; un écart mal calculé ôte 2 ; la mauvaise réponse à « quoi compter » ôte 2', async () => {
  proche((await jouer({ inv: { decisions: { 'RET-DRO': ['regul', 'Casse'], 'FAS-HAB': ['regul', 'Sortie non saisie'] } } })).score, 17, 'tout régularisé');
  proche((await jouer({ inv: { ecarts: { ...ECARTS, 'POI-EXT': '-1' } } })).score, 18, 'écart faux sur une ligne juste');
  proche((await jouer({ R2: { ...R, 'quoi-compter': 'sorties' } })).score, 18, 'mauvaise réponse à « quoi compter »');
  proche((await jouer({ inv: { ecarts: { ...ECARTS, 'RET-DRO': '2' } } })).score, 18, 'écart faux');
});

await v('ENT-13.4 : un relevé mal recopié est refusé à l’écran (on le recopie juste, ligne par ligne) ; le comptage reste à l’étape 1', async () => {
  await mont();
  await ranger();
  await exporter();
  await deposerEcran(await base(), {});
  await qFil(R);
  await allerV(MENU.inv);
  for (const [k, x] of Object.entries({ ...RELEVE, 'POI-EXT': '19' })) await pg.fill(`${Z} [data-inv-saisie="${k}"]`, x);
  await pg.click(`${Z} [data-inv-aller="2"]`);
  await pause();
  vrai(/ne correspond pas au relevé/.test(await texte()), 'message de refus');
  vrai(!!(await pg.$(`${Z} [data-inv-saisie="POI-EXT"]`)), 'toujours à l’étape 1');
});

await v('ENT-13.4 : le fichier de corrigé est servi et se charge ; le corrigé d’un élève donne son classement sur la valeur', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-13.4.js');
    return { code: C.CORRIGE.code, n: C.CORRIGE.items.length, eleve: C.corrigeEleve({}) };
  });
  egal([r.code, r.n], ['ENT-13.4', 4], 'corrigé');
  vrai(r.eleve.items.length >= 28, 'le corrigé de l’élève liste ses 18 références, ses A, les 4 lignes à compter et les 4 palettes : ' + r.eleve.items.length);
});

await v('ENT-13.4 : aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  vrai(P.hotes.size === 0, 'hôtes extérieurs : ' + [...P.hotes].join(', '));
  vrai(P.erreurs.length === 0, 'erreurs : ' + P.erreurs.join(' | '));
});

}
