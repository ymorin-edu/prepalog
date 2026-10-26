// Suite de tests de Prepalog — bloc « stellantis-13.5 » : Stellantis ENT-13.5, « évaluation de rentrée » (Terminale, la rentrée, C1.4, C1.5 et C1.6, évaluation, copie rendue).
// `node outils/test.mjs stellantis-13.5` ne lance que ce bloc. Brief : `docs/briefs/ENT-13.5-stellantis-evaluation-rentree.md` §4 à §8.
//
// UN JEU PAR ÉLÈVE : les jeux des élèves d'essai sont cherchés dans les données (anomalies, cause de l'écart) ; les valeurs de CONTRÔLE (poids, classes d'un jeu d'exemple) sont écrites à la main.
// Barème (brief §5) : « Avant de commencer » 4 · palettes 3 (5 × 0,6) · réserves 1,5 + signature 0,5 · cumul 3 · classe 2 · rangement 2 (3 × 2/3) · écart 2 · questions au fil 2 = 20.

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import { ouvrirStellantis, chargerXlsx, proche } from './stellantis/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai, ROOT, baseXlsx }) {

const ID = 'stellantis-evaluation-rentree';
const QID = 'st-quai-135';
const PLAN = 'st-ent135-rangement';
const ACT = '/activites/stellantis-evaluation-rentree.js';
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const XL = await chargerXlsx(baseXlsx);
const S = await imp('contenus/stellantis-ent135-donnees.js');
const ABC = await imp('contenus/stellantis-abc.js');
const U = await imp('contenus/stellantis.js');
const GT = await imp('core/types/export-tableur.js');
const EN = await imp('core/types/entrepot.js');
const TI = await imp('core/tirage.js');

const P = await ouvrirStellantis({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, texte, entrants, clic, allerV, noter, monter } = P;

const qFil = async (R) => {
  for (let i = 0; i < 12; i++) {
    await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 600 }).catch(() => null);
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(R[q], `question au fil « ${q} » sans réponse prévue`);
    await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80);
    if (await pg.$(`${Z} [data-q-repondre="${q}"]`)) { await clic(`[data-q-choix="${R[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); }
    if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); }
  }
};
const fermerCartes = async () => { await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80); };

const OUV = { bl: 'envoye', reserve: 'precis', pct: '15', cumul: '65', ecart: 'moins3', aveugle: 'sans', delai: '3j', annuel: '12' };
const OUV_NSP = Object.fromEntries(Object.keys(OUV).map((k) => [k, '@nsp']));
const OUV_FAUX = { bl: 'facture', reserve: 'abimes', pct: '120', cumul: '25', ecart: 'plus3', aveugle: 'nuit', delai: 'jamais', annuel: 'jamais' };
const RJ = { 'dommage-cache': 'lettre', 'mes-a': 'juste', 'pas-regulariser': 'cause' };
const RF = { 'dommage-cache': 'plus', 'mes-a': 'nb', 'pas-regulariser': 'regle' };
// Trois élèves d'essai (jeux cherchés dans les données, jamais écrits au hasard) : A = écrasés + étiquette d'une autre référence + caisse reposée à côté ;
// B = couche incomplète conforme (piège) + manquants + sortie non saisie ; C = écrasés + manquants + sortie non saisie.
const UID_A = 'st135-3', UID_B = 'st135-10', UID_C = 'st135-23';
const dbNode = (uid) => ({ tirage: { graine: uid } });

// ─────────────────────────────────────────────────────────── le classeur « de l'élève », fabriqué à partir de SON export
// `o` : trie (défaut vrai) · total ('somme' | 'tape') · classe ('si' | 'main').
function classeur(db, o = {}) {
  const ex = GT.construireExport(S.TABLEUR.exports[0], db, {});
  const L = ex.feuilles[0].lignes.map((l) => l.slice());       // [ref, désignation, famille, emplacement, sorties]
  if (o.trie !== false) L.sort((a, b) => b[4] - a[4]);
  const n = L.length, tot = n + 2;
  const T = L.reduce((s, l) => s + l[4], 0);
  const aoa = [[...S.COLONNES, 'Part', 'Cumul', 'Classe'], ...L.map((l) => [...l, null, null, null])];
  const ws = XL.utils.aoa_to_sheet(aoa);
  let cum = 0;
  L.forEach((l, k) => {
    const r = k + 2, part = l[4] / T;
    cum += part;
    ws['F' + r] = { t: 'n', v: part, f: `E${r}/E$${tot}`, z: '0%' };
    ws['G' + r] = { t: 'n', v: cum, f: k === 0 ? `F${r}` : `G${r - 1}+F${r}` };
    const cl = cum <= 0.8 ? 'A' : cum <= 0.95 ? 'B' : 'C';
    ws['H' + r] = o.classe === 'main' ? { t: 's', v: cl } : { t: 's', v: cl, f: `IF(G${r}<=0.8,"A",IF(G${r}<=0.95,"B","C"))` };
  });
  ws['B' + tot] = { t: 's', v: 'Total' };
  ws['E' + tot] = o.total === 'tape' ? { t: 'n', v: T } : { t: 'n', v: T, f: `SUM(E2:E${n + 1})` };
  ws['!ref'] = `A1:H${tot}`;
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
const TOUS_OK = { total: 'ok', part: 'ok', cumul: 'ok', classe: 'ok' };

// Le rangement juste (un emplacement libre de la zone de chaque classe), et ses variantes. `plan` : la déclaration du plan d'un jeu (ses jalons ne dépendent que des identifiants R1 à R3).
const BON = { R1: 'A1-T01-N1-E3', R2: 'A1-T02-N1-E2', R3: 'A1-T03-N1-E3' };
const jalonsPlan = (place, uid = UID_A) => EN.jalonsEntrepot({ entrepots: { [S.ID_PLAN]: { place } } }, S.planDe(uid)).L.map((l) => [l.palette, l.ok]);

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-13.5 : la séance se charge (Tle, C1.4 + C1.5 + C1.6, évaluation, copie rendue) ; jalons 14 + part des questions 6 = 20 ; 3 notées au fil sans retour avant le bilan ; ouverture 4 tirées parmi 8 ; au registre', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/stellantis-evaluation-rentree.js');
    const C = await import('/contenus/stellantis-ent135.js');
    const Q = await import('/contenus/questions/ENT-13.5.js');
    const I = await import('/activites/index.js');
    const L = Q.QUESTIONS.liste;
    return { meta: A.meta, noter: typeof A.noter, poids: C.ETAPES.map((e) => [e.id, e.poids]), part: Q.QUESTIONS.part, partOuv: Q.QUESTIONS.ouverture.part,
      notees: L.filter((q) => q.type === 'fil').map((q) => [q.id, q.poids || 1, q.apres, !!q.reflexion]),
      ouv: Q.QUESTIONS.ouverture.tirage, rubriques: L.filter((q) => q.type === 'ouverture').map((q) => q.rubrique),
      docs: C.DOCUMENTS.map((d) => d.id),
      auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'stellantis-evaluation-rentree') };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture, r.noter],
    ['ENT-13.5', ['tle'], ['C1.4', 'C1.5', 'C1.6'], 'evaluation', 20, true, 'ENT-13.5', true, 'prof', 'function'], 'meta');
  egal(r.poids.map((x) => x[0]), ['palette-P1', 'palette-P2', 'palette-P3', 'palette-P4', 'palette-P5', 'reserves', 'signature', 'cumul', 'classe',
    'palette-R1', 'palette-R2', 'palette-R3', 'ecart'], 'jalons');
  proche(r.poids.reduce((s, x) => s + x[1], 0) + r.part + r.partOuv, 20, 'jalons + questions au fil + « Avant de commencer »');
  egal([r.part, r.partOuv], [2, 4], 'parts des questions');
  egal(r.poids.filter((x) => /^palette-P/.test(x[0])).reduce((s, x) => s + x[1], 0) > 2.99, true, 'palettes du camion : 3 points');
  egal(r.notees, [['dommage-cache', 1, 'bilan', false], ['mes-a', 1, 'bilan', false], ['pas-regulariser', 1, 'bilan', false]], 'questions au fil : notées, correction au bilan');
  egal(r.ouv, { reception: 1, calcul: 1, inventaire: 1, droit: 1 }, 'ouverture tirée');
  egal(r.rubriques.sort(), ['calcul', 'calcul', 'droit', 'droit', 'inventaire', 'inventaire', 'reception', 'reception'], 'banque d’ouverture');
  vrai(!r.docs.includes('methode-133') && !r.docs.some((d) => /methode|abc/.test(d)), 'la fiche méthode n’est PAS dans les documents : ' + r.docs.join(', '));
  vrai(r.auRegistre, 'la séance est au registre');
});

// ─────────────────────────────────────────────────────────── le tirage et son équité
await v('ENT-13.5 : équité sur 500 graines — 3 A / 5 B / 7 C sans égalité, seuils nets ; A = les trois premières références, B les cinq suivantes ; trois palettes propres de trois classes différentes ; deux anomalies par jeu ; aucune graine ne tombe sur le jeu de secours', () => {
  let secours = 0;
  const vus = { avarie: 0, couche: 0, manquant: 0, produit: 0, rayon: 0, regul: 0 };
  for (let i = 0; i < 500; i++) {
    const t = TI.tirerJeu(S.DECL_JEU, `g${i}|${S.ID}`);
    if (t.secours) secours++;
    const j = t.jeu;
    egal(S.verifier(j), [], `graine ${i}`);
    const L = S.REFS15.map((r) => ({ ref: r.ref, v: j.sorties[r.ref] }));
    egal(ABC.ecartsEquite(L, [3, 5, 7]), [], `graine ${i} : équité`);
    const K = ABC.classer(L);
    egal(K.ordre.slice(0, 3).sort(), S.GROUPE_A.slice().sort(), `graine ${i} : les A`);
    egal(K.ordre.slice(3, 8).sort(), S.GROUPE_B.slice().sort(), `graine ${i} : les B`);
    egal(j.palettes.filter((p) => p.role === 'propre').map((p) => K.classe[p.ref]).sort().join(''), 'ABC', `graine ${i} : classes des palettes propres`);
    egal(j.palettes.filter((p) => p.attendu !== 'accepter').length, j.visible === 'avarie' ? 2 : 1, `graine ${i} : palettes à réserver`);
    vus[j.visible]++; vus[j.auBon]++; vus[j.inventaire.cause]++;
  }
  egal(secours, 0, 'tirages de secours');
  vrai(Object.values(vus).every((n) => n > 100), 'chaque cas sort souvent : ' + JSON.stringify(vus));
  egal(S.verifier(S.DECL_JEU.secours), [], 'le jeu de secours est conforme');
});

await v('ENT-13.5 : deux élèves, deux jeux ; le même élève retrouve le sien ; les jeux d’essai A, B et C sont ceux que ce bloc suppose', () => {
  const a = S.jeuDe(UID_A), b = S.jeuDe(UID_B), a2 = S.jeuDe(UID_A);
  vrai(JSON.stringify(a.sorties) !== JSON.stringify(b.sorties), 'deux élèves ont les mêmes sorties');
  vrai(JSON.stringify(a.palettes) !== JSON.stringify(b.palettes), 'deux élèves ont le même camion');
  egal(JSON.stringify(a), JSON.stringify(a2), 'même élève, même jeu');
  egal([a.visible, a.auBon, a.inventaire.cause], ['avarie', 'produit', 'rayon'], 'élève A');
  egal([b.visible, b.auBon, b.inventaire.cause], ['couche', 'manquant', 'regul'], 'élève B');
  egal([S.jeuDe(UID_C).visible, S.jeuDe(UID_C).auBon, S.jeuDe(UID_C).inventaire.cause], ['avarie', 'manquant', 'regul'], 'élève C');
  egal(S.quaiDe(UID_A).camions[0].palettes.length, 5, 'cinq palettes');
  egal(S.planDe(UID_A).palettes.map((p) => [p.id, p.rotation, p.kg]), [['R1', 'A', 220], ['R2', 'B', 260], ['R3', 'C', 180]], 'plan : trois palettes de trois classes (poids écrits à la main)');
});

await v('ENT-13.5 : le jeu d’exemple écrit à la main (total 10 000, 3 A, 5 B, 7 C) — le calcul de la séance donne les classes attendues ; une anomalie d’inventaire reste dans l’intervalle prévu', () => {
  // 15 références, total 10 000 : cumuls 33 / 58 / 74 % (A) ; 81,5 / 85,5 / 89 / 92 / 94,5 % (B) ; 96 % et plus (C).
  const V = [3300, 2500, 1600, 750, 400, 350, 300, 250, 150, 100, 80, 70, 60, 50, 40];
  const K = ABC.classer(V.map((x, i) => ({ ref: `R${i + 1}`, v: x })));
  egal(K.ordre.map((r) => K.classe[r]).join(''), 'AAABBBBBCCCCCCC', 'classes');
  proche(K.total, 10000, 'total');
  proche(K.cumul['R3'], 0.74, 'cumul de la 3e');
  proche(K.cumul['R8'], 0.945, 'cumul de la 8e');
  const I = S.jeuDe(UID_A).inventaire;
  vrai(I.systeme >= 24 && I.systeme <= 60 && I.ecart >= 1 && I.ecart <= 3 && I.compte === I.systeme - I.ecart, `inventaire ${JSON.stringify(I)}`);
});

// ─────────────────────────────────────────────────────────── le plan (rangement)
await v('ENT-13.5 : le plan — le rangement juste donne 3 jalons ; palette A au fond, palette B en travée 1, emplacement hors service → le jalon de la palette tombe, les autres restent', () => {
  egal(jalonsPlan(BON), [['R1', true], ['R2', true], ['R3', true]], 'rangement juste');
  egal(jalonsPlan({}), [['R1', false], ['R2', false], ['R3', false]], 'rien rangé : aucun jalon');
  egal(jalonsPlan({ ...BON, R1: 'A2-T04-N1-E2' }), [['R1', false], ['R2', true], ['R3', true]], 'palette A au fond');
  egal(jalonsPlan({ ...BON, R2: 'A2-T01-N1-E3' }), [['R1', true], ['R2', false], ['R3', true]], 'palette B en travée 1');
  egal(jalonsPlan({ ...BON, R1: 'A1-T01-N2-E2' })[0], ['R1', false], 'emplacement hors service');
  vrai(!!S.STOCK['A1-T01-N1-E1'], 'A1-T01-N1-E1 est occupé au départ (la vue refuse de poser dessus)');
});

// ─────────────────────────────────────────────────────────── l'export et les contrôles du dépôt
await v('ENT-13.5 : l’export — 5 colonnes, 15 lignes dans l’ordre des emplacements, nom du fichier ; aucune aide de retour (indications 4) ; un seul dépôt', () => {
  const e = S.TABLEUR.exports[0];
  egal([e.fichier, e.indications], ['stellantis-sorties-semaine39.xlsx', 4], 'fichier et indications');
  const ex = GT.construireExport(e, dbNode(UID_A), {});
  egal(ex.feuilles[0].colonnes, ['Référence', 'Désignation', 'Famille', 'Emplacement', 'Sorties'], 'colonnes');
  const L = ex.feuilles[0].lignes;
  egal(L.length, 15, 'lignes');
  egal(L.map((l) => l[0]).slice().sort(), U.refsDe(15).map((r) => r.ref).sort(), 'les 15 références');
  egal(L.map((l) => l[3]), L.map((l) => l[3]).slice().sort(), 'ordre des emplacements');
  const j = S.jeuDe(UID_A);
  vrai(L.every((l) => l[4] === j.sorties[l[0]]), 'les sorties de l’export sont celles du jeu');
});

await v('ENT-13.5 : un fichier juste (trié, SOMME, part en %, cumul, SI) — les 4 contrôles sont justes pour deux élèves ; non trié → cumul et classe tombent ; total tapé → refusé ; classe à la main → refusée', () => {
  for (const uid of [UID_A, UID_B]) egal(etat(deposer(dbNode(uid))), TOUS_OK, `fichier juste (${uid})`);
  egal(etat(deposer(dbNode(UID_A), { trie: false })).cumul, 'ko', 'non trié');
  egal(etat(deposer(dbNode(UID_A), { total: 'tape' })), { ...TOUS_OK, total: 'ko' }, 'total tapé');
  egal(etat(deposer(dbNode(UID_A), { classe: 'main' })), { ...TOUS_OK, classe: 'ko' }, 'classe à la main');
});

// ─────────────────────────────────────────────────────────── l'inventaire (données tirées)
await v('ENT-13.5 : l’inventaire — une ligne libre ; la décision attendue suit la cause tirée (caisse reposée → remettre en place ; sortie non saisie → régulariser, motif « Sortie non saisie »)', () => {
  for (const [uid, cause] of [[UID_A, 'rayon'], [UID_B, 'regul']]) {
    const I = S.inventaireDe(uid), l = I.lignes[0], J = S.jeuDe(uid).inventaire;
    egal(I.lignes.length, 1, 'une ligne');
    egal([l.ref, l.systeme, l.compte, l.attendu, l.motif || null], [J.ref, J.systeme, J.compte, cause, cause === 'regul' ? 'Sortie non saisie' : null], `ligne de ${uid}`);
    vrai(l.systeme - l.compte >= 1 && l.systeme - l.compte <= 3, 'écart de 1 à 3');
  }
});

// ─────────────────────────────────────────────────────────── à l'écran
const MENU = { quai: 'quai', plan: 'entrepot', inv: 'inventaire' };
const mont = (uid, o = {}) => monter({ rep: OUV, uid, ...o });
// Le quai : `o.dec` (une décision par palette : [compte, decision, motif]), `o.res` (la valeur écrite, `null` = rien d'écrit), `o.deballage`.
const attendu = (p) => {
  const plein = p.W * p.D * p.L, reel = plein - p.manque.length;
  return [reel, p.attendu, p.attendu === 'accepter' ? null : p.motifAttendu];
};
async function quai(uid, o = {}) {
  const J = S.jeuDe(uid);
  await fermerCartes();
  await allerV(MENU.quai);
  await pg.click(`${Z} [data-q="decharger"]`);
  await pause(200);
  await pg.waitForSelector(`${Z} [data-q="vers3"]:not([disabled])`);
  await pg.click(`${Z} [data-q="vers3"]`); await pause();
  for (const [n, p] of J.palettes.entries()) {
    const [compte, decision, motif] = (o.dec && o.dec[p.id]) || attendu(p);
    await pg.click(`${Z} [data-q="sel"][data-n="${n}"]`); await pause(30);
    await pg.fill(`${Z} #qCompte`, String(compte)); await pg.press(`${Z} #qCompte`, 'Enter');
    await pg.click(`${Z} #qDec-${decision}`);
    if (motif) await pg.click(`${Z} #qMot-${motif}`);
    await pg.click(`${Z} [data-q="valider"]`); await pause(30);
  }
  await pg.click(`${Z} [data-q="vers4"]`); await pg.click(`${Z} [data-q="vers4"]`).catch(() => {}); await pause();
  for (const p of J.palettes) {
    if (!(await pg.$(`${Z} #qRes-${p.id}`))) continue;
    const val = o.res === undefined ? S.reserveAttendue(p) : o.res === null ? null : (p.motifAttendu === 'produit' ? 'XXX' : o.res);
    if (val != null) await pg.fill(`${Z} #qRes-${p.id}`, val);
  }
  if (o.deballage) await pg.check(`${Z} [data-q-deballage]`);
  await pg.click(`${Z} [data-q="ecrire"]`); await pause();
  await qFil(o.R || RJ);
  await pg.click(`${Z} [data-q="signer"]`); await pause();
  await qFil(o.R || RJ);
  await pg.click(`${Z} [data-q="clore"]`); await pg.click(`${Z} [data-q="clore"]`).catch(() => {}); await pause();
  await qFil(o.R || RJ);
}
async function exporter() {
  await allerV('extractions');
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click(`${Z} [data-exporter="sorties39"]`)]);
  return dl;
}
async function deposerEcran(db, o) {
  await allerV('fichiers');
  await pg.setInputFiles('#fichierTableur', { name: 'abc39.xlsx', mimeType: 'application/octet-stream', buffer: classeur(db, o) });
  await pg.waitForFunction((Z) => /Fichier reçu/.test(document.querySelector(Z).innerText), Z);
  await pause(600);
}
async function ranger(place = BON, R2 = RJ) {
  await allerV(MENU.plan);
  for (const [id, a] of Object.entries(place)) {
    await clic(`.pe-bandeau [data-pe-pal="${id}"]`);
    if (await pg.$(`${Z} [data-pe="retour"]`)) { await clic('[data-pe="retour"]'); }
    await clic(`[data-pe-trav="${a.slice(0, 6)}"]`);
    await clic(`[data-pe-emp="${a}"]`);
    await clic('[data-pe="retour"]');
    await qFil(R2);
  }
  await pause();
}
// L'inventaire à l'écran : saisie du relevé, écart calculé, décision, validation. `o.releve`, `o.ecart`, `o.decision` ([action, motif]) écrasent le juste.
async function inventaire(uid, o = {}) {
  const I = S.jeuDe(uid).inventaire;
  const dec = o.decision || (I.cause === 'rayon' ? ['rayon'] : ['regul', 'Sortie non saisie']);
  await allerV(MENU.inv);
  await pg.fill(`${Z} [data-inv-saisie="${I.ref}"]`, String(o.releve != null ? o.releve : I.compte));
  await pg.click(`${Z} [data-inv-aller="2"]`);
  await pause();
  await qFil(o.R || RJ);
  await allerV(MENU.inv);
  await pg.fill(`${Z} [data-inv-ecart="${I.ref}"]`, String(o.ecart != null ? o.ecart : -I.ecart));
  await pg.click(`${Z} [data-inv-aller="3"]`);
  await pause();
  await pg.selectOption(`${Z} [data-inv-action="${I.ref}"]`, dec[0]);
  if (dec[1]) await pg.selectOption(`${Z} [data-inv-motif="${I.ref}"]`, dec[1]);
  await pg.click(`${Z} [data-inv-aller="4"]`);
  await pg.waitForSelector(`${Z} [data-inv-valider]`);
  await pg.click(`${Z} [data-inv-valider]`);
  await pg.waitForSelector(`${Z} [data-inv-valide]`);
  await pause();
  await qFil(o.R || RJ);
}
// Tout le parcours, avec des variantes : `q` (le quai), `place` (le rangement), `fichier` (options du classeur, ou null = pas de dépôt), `inv` (l'inventaire, ou null), `rep` (« Avant de commencer »).
async function jouer(uid, o = {}) {
  await mont(uid, o.rep ? { rep: o.rep } : {});
  const R2 = o.R || RJ;
  await quai(uid, { ...(o.q || {}), R: R2 });
  const db0 = await base();
  if (o.fichier !== null) {
    await exporter();
    await deposerEcran(db0, o.fichier || {});
    await qFil(R2);
  }
  if (o.place !== null) await ranger(o.place || BON, R2);
  if (o.inv !== null) await inventaire(uid, { ...(o.inv || {}), R: R2 });
  await qFil(R2);
  return noter(ACT);
}

await v('ENT-13.5 : à l’écran — les messages de Karim (4 choses, seuils 80/95 dans la consigne, aucune fiche méthode) ; le relevé est un message de relevé ; l’écran Fichiers et l’export donnent le jeu de l’élève', async () => {
  await mont(UID_A);
  const D = await base();
  const M = D.mails.map((m) => [m.subject, m.kind]);
  vrai(M.some((m) => m[0] === 'Aujourd’hui tu fais seul') && M.some((m) => m[0] === 'Le relevé de la nuit' && m[1] === 'releve'), 'messages : ' + JSON.stringify(M));
  const consigne = D.mails.find((m) => m.subject === 'Aujourd’hui tu fais seul').text;
  vrai(/80 %/.test(consigne) && /95 %/.test(consigne) && /une seule fois/.test(consigne), 'la consigne rappelle les seuils et le dépôt unique');
  const dl = await exporter();
  egal(dl.suggestedFilename(), 'stellantis-sorties-semaine39.xlsx', 'nom du fichier');
  const wb = XL.read(fs.readFileSync(await dl.path()), { type: 'buffer' });
  const rows = XL.utils.sheet_to_json(wb.Sheets['Sorties']);
  const J = S.jeuDe(UID_A);
  egal(rows.length, 15, 'lignes exportées');
  vrai(rows.every((r) => J.sorties[r['Référence']] === r['Sorties']), 'l’export ne porte pas les sorties du jeu de l’élève');
  await deposerEcran(await base(), {});
  const t = (await texte()).replace(/\s+/g, ' ');
  vrai(!/Ce qui cloche|résultats? justes? sur/.test(t), 'en évaluation, aucun retour sur les résultats : ' + t.slice(0, 300));
  const n = await noter(ACT);
  vrai(n && n.detail && n.detail.cumul === 'ok', 'le dépôt est bien jugé à la remise');
});

await v('ENT-13.5 : parcours complet juste → 20/20 pour l’élève A (écrasés, étiquette autre, caisse reposée) ; la cause arrive dans la messagerie après l’écart ; toutes les questions tirées bien répondues', async () => {
  const n = await jouer(UID_A);
  proche(n.score, 20, 'tout juste');
  const D = await base();
  vrai(D.mails.some((m) => m.subject === 'Ce qu’on a vu en passant'), 'le message des causes : ' + JSON.stringify(D.mails.map((m) => m.subject)));
  const cause = D.mails.find((m) => m.subject === 'Ce qu’on a vu en passant').text;
  vrai(/posée à côté de son emplacement/.test(cause), 'la cause « caisse reposée à côté » : ' + cause);
  for (const q of ['dommage-cache', 'mes-a', 'pas-regulariser']) vrai(D.questions[ID][q] && D.questions[ID][q].premiere === RJ[q], `question « ${q} » : ${JSON.stringify(D.questions[ID][q])}`);
  vrai(!(await entrants()).some((m) => /fiche|méthode/i.test(m.subject)), 'aucune fiche méthode dans la messagerie');
});

await v('ENT-13.5 : parcours complet juste → 20/20 pour l’élève B (couche incomplète conforme, manquants, sortie non saisie) ; la cause est celle de son jeu', async () => {
  const n = await jouer(UID_B);
  proche(n.score, 20, 'tout juste');
  const D = await base();
  const cause = D.mails.find((m) => m.subject === 'Ce qu’on a vu en passant').text;
  vrai(/sans les scanner/.test(cause), 'la cause « sans les scanner » : ' + cause);
});

await v('ENT-13.5 : inaction → 0 sur le travail (seul « Avant de commencer » rapporte) ; la copie vide ne gagne rien', async () => {
  await mont(UID_A, { rep: OUV });
  const n = await noter(ACT);
  proche(n.score, 4, 'inaction : seules les quatre questions d’ouverture rapportent');
  const d = n.detail;
  vrai(Object.entries(d).filter(([k]) => /^(palette-|reserves|signature|cumul|classe|ecart)/.test(k)).every(([, e]) => e !== 'ok'), 'aucun jalon de travail n’est juste : ' + JSON.stringify(d));
});

await v('ENT-13.5 : tout refuser au quai fait tomber les trois palettes conformes (−1,8 au moins) ; accepter sans réserve ce qui est écrasé fait tomber la palette et la réserve', async () => {
  const J = S.jeuDe(UID_B);   // couche incomplète conforme + manquants : une seule palette « à réserver »
  const refuse = Object.fromEntries(J.palettes.map((p) => [p.id, [p.W * p.D * p.L - p.manque.length, 'refuser', 'manquant']]));
  const n = await jouer(UID_B, { q: { dec: refuse, res: '1' } });
  const d = n.detail;
  const propres = J.palettes.filter((p) => p.role === 'propre' || p.role === 'couche').map((p) => `palette-${p.id}`);
  egal(propres.map((k) => d[k]), propres.map(() => 'ko'), 'les palettes conformes refusées tombent (le piège « tout refuser »)');
  vrai(n.score <= 20 - 0.6 * propres.length + 1e-6, 'score avec tout refusé : ' + n.score);
});

await v('ENT-13.5 : réserves vagues (« 1 carton ») — le jalon « réserves » tombe (−1,5) seul, les décisions restent justes ; « sous réserve de déballage » coché : même jalon, même perte', async () => {
  proche((await jouer(UID_C, { q: { res: '1' } })).score, 18.5, 'réserve imprécise');
  const n = await jouer(UID_C, { q: { deballage: true } });
  proche(n.score, 18.5, 'sous réserve de déballage');
  egal([n.detail.reserves, n.detail['palette-P1'], n.detail.signature], ['ko', 'ok', 'ok'], 'jalons');
  proche((await jouer(UID_C, { q: { res: null } })).score, 18.5, 'rien écrit dans la réserve');
});

await v('ENT-13.5 : fichier non trié → cumul (3) et classe (2) tombent → 15 ; classe à la main : −2 ; pas de dépôt : −5 et la question « tes A » ne se pose pas (−2/3)', async () => {
  proche((await jouer(UID_A, { fichier: { trie: false } })).score, 15, 'non trié');
  proche((await jouer(UID_A, { fichier: { classe: 'main' } })).score, 18, 'classe à la main');
  proche((await jouer(UID_A, { fichier: null })).score, 20 - 5 - 2 / 3, 'pas de dépôt (et la question « tes A » ne se pose pas)');
});

await v('ENT-13.5 : palette A rangée au fond → −2/3 ; rien rangé → −2', async () => {
  proche((await jouer(UID_A, { place: { ...BON, R1: 'A2-T04-N1-E2' } })).score, 20 - 2 / 3, 'palette A au fond');
  proche((await jouer(UID_A, { place: null })).score, 18, 'rien rangé');
});

await v('ENT-13.5 : l’écart régularisé sans chercher (cause « caisse reposée ») → −2 ; l’écart traité à l’inverse pour la cause « sortie non saisie » → −2 ; un mauvais motif → −2 ; pas d’inventaire → −2 (et la question « pourquoi » ne se pose pas)', async () => {
  proche((await jouer(UID_A, { inv: { decision: ['regul', 'Casse'] } })).score, 18, 'A : régularisé sans chercher');
  proche((await jouer(UID_B, { inv: { decision: ['rayon'] } })).score, 18, 'B : remis en place alors que la pièce est sortie');
  proche((await jouer(UID_B, { inv: { decision: ['regul', 'Casse'] } })).score, 18, 'B : mauvais motif');
  proche((await jouer(UID_A, { inv: null })).score, 20 - 2 - 2 / 3, 'pas d’inventaire');
});

await v('ENT-13.5 : « Je ne sais pas » aux quatre questions d’ouverture → 0 point sans pénalité (16 sur le travail) ; toutes fausses → plancher à 0 ; les trois questions au fil fausses → −2', async () => {
  proche((await jouer(UID_A, { rep: OUV_NSP })).score, 16, 'Je ne sais pas');
  proche((await jouer(UID_A, { rep: OUV_FAUX })).score, 16, 'toutes fausses, plancher à 0');
  const n = await jouer(UID_A, { R: RF });
  proche(n.score, 18, 'questions au fil fausses');
  egal(['dommage-cache', 'mes-a', 'pas-regulariser'].map((q) => n.detail[`question:${q}`]), ['ko', 'ko', 'ko'], 'les trois questions');
});

await v('ENT-13.5 : en évaluation, aucune correction avant le bilan — « Merci, je note » à chaque question au fil et « Réponse enregistrée » à l’ouverture', async () => {
  await mont(UID_A);
  await quai(UID_A, { R: RJ });
  const t = await pg.evaluate(() => document.querySelector('#fTest').innerText);
  vrai(!/Code de commerce, art\. L133-3 : il reste trois jours/.test(t), 'le retour de la question L133-3 ne doit pas être montré avant le bilan');
});

await v('ENT-13.5 : le corrigé d’un élève montre SON jeu (camion, classement, plan, inventaire) ; le fichier de corrigé est servi et se charge', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-13.5.js');
    return { code: C.CORRIGE.code, n: C.CORRIGE.items.length, a: C.corrigeEleve({ tirage: { graine: 'st135-3' } }), b: C.corrigeEleve({ tirage: { graine: 'st135-10' } }) };
  });
  egal([r.code, r.n], ['ENT-13.5', 5], 'corrigé');
  vrai(r.a.items.length >= 5 + 1 + 15 + 3 + 1, 'le corrigé de l’élève liste ses 5 palettes, ses 15 références, ses 3 palettes à ranger et son écart : ' + r.a.items.length);
  const t = (c) => c.items.map((x) => `${x.texte} ${x.rep}`).join('\n');
  vrai(t(r.a) !== t(r.b), 'deux élèves, deux corrigés');
  vrai(/remettre en place/.test(t(r.a)) && /régulariser, motif « Sortie non saisie »/.test(t(r.b)), 'la décision de l’inventaire suit le jeu');
});

await v('ENT-13.5 : aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  vrai(P.hotes.size === 0, 'hôtes extérieurs : ' + [...P.hotes].join(', '));
  vrai(P.erreurs.length === 0, 'erreurs : ' + P.erreurs.join(' | '));
});

}
