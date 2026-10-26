// Suite de tests de Prepalog — bloc « stellantis-13.3 » : Stellantis ENT-13.3, « la méthode ABC au tableur » (Terminale, la rentrée, C1.5 et C1.6, guidage).
// `node outils/test.mjs stellantis-13.3` ne lance que ce bloc. Brief : `docs/briefs/ENT-13.3-stellantis-methode-abc.md` §4 à §8.
//
// Valeurs ÉCRITES À LA MAIN (jamais recalculées par le code) : le jeu d'exemple de 18 références, total 10 000 : 3 100, 2 300, 1 400, 800 (cumuls 31, 54, 68, 76 % → les A),
// 520, 400, 320, 300, 240 (81,2 / 85,2 / 88,4 / 91,4 / 93,8 % → les B), 225, 120, 90, 60, 45, 35, 20, 15, 10 (96,05 % et plus → les C).
// Barème (brief §5) : total 2 · part 3 · cumul 4 · classe 4 · questions notées 7 (lire 2, décider 2, pourquoi 1,5, le stock qui dort 1,5) = 20.

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import { ouvrirStellantis, chargerXlsx, proche } from './stellantis/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai, ROOT, baseXlsx }) {

const ID = 'stellantis-methode-abc';
const ACT = '/activites/stellantis-methode-abc.js';
const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const XL = await chargerXlsx(baseXlsx);
const S = await imp('contenus/stellantis-ent133-donnees.js');
const ABC = await imp('contenus/stellantis-abc.js');
const U = await imp('contenus/stellantis.js');
const GT = await imp('core/types/export-tableur.js');

const P = await ouvrirStellantis({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, texte, entrants, clic, allerV, sansToast, noter, monter } = P;

// Les questions au fil : on répond tant qu'un panneau est ouvert (réponse `R[id]`), on reprend s'il y a le bouton.
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

const OUV = { pct: '20', cumul: '80', somme: 'somme', dollar: 'fixer', payer: 'prix', accord: 'accord' };
const R = { pari: 'peu', 'combien-a': 'juste', 'part-a': 'juste', 'pourquoi-a': 'trajets', 'ou-ranger-a': 'devant-main', 'c-mal-placee': 'deplacer', 'stock-dort': 'argent', transstockeur: 'panne' };
const UID = 'st133';
const mont = (o = {}) => monter({ rep: OUV, uid: UID, ...o });
const dbNode = (aisance = 'standard', uid = UID) => { S.TIRAGE.lier(S.ID); const db = { aisance }; S.TIRAGE.assurer(db, { uid, aisance }); return db; };

// ─────────────────────────────────────────────────────────── le classeur « de l'élève », fabriqué à partir de SON export
// `o` : trie (défaut vrai) · total ('somme' | 'tape' | 'absent') · part ('pct' | 'x100') · classe ('si' | 'main') · cumul ('formule' | 'tape').
function classeur(db, o = {}) {
  const ex = GT.construireExport(S.TABLEUR.exports[0], db, {});
  let L = ex.feuilles[0].lignes.map((l) => l.slice());
  if (o.trie !== false) L.sort((a, b) => b[4] - a[4]);
  const n = L.length, tot = n + 2;
  const T = L.reduce((s, l) => s + l[4], 0);
  const aoa = [[...S.COLONNES, 'Part', 'Cumul', 'Classe'], ...L.map((l) => [...l, null, null, null])];
  const ws = XL.utils.aoa_to_sheet(aoa);
  let cum = 0;
  L.forEach((l, k) => {
    const r = k + 2, part = l[4] / T;
    cum += part;
    ws['F' + r] = o.part === 'x100' ? { t: 'n', v: part * 100, f: `E${r}/E$${tot}*100` } : { t: 'n', v: part, f: `E${r}/E$${tot}`, z: '0%' };
    ws['G' + r] = o.cumul === 'tape' ? { t: 'n', v: cum } : { t: 'n', v: cum, f: k === 0 ? `F${r}` : `G${r - 1}+F${r}` };
    const cl = cum <= 0.8 ? 'A' : cum <= 0.95 ? 'B' : 'C';
    ws['H' + r] = o.classe === 'main' ? { t: 's', v: cl } : { t: 's', v: cl, f: `IF(G${r}<=0.8,"A",IF(G${r}<=0.95,"B","C"))` };
  });
  if (o.total !== 'absent') {
    ws['B' + tot] = { t: 's', v: 'Total' };
    ws['E' + tot] = o.total === 'tape' ? { t: 'n', v: T } : { t: 'n', v: T, f: `SUM(E2:E${n + 1})` };
  }
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

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-13.3 : la séance se charge (Tle, C1.5 et C1.6, guidage) ; jalons 13 + part des questions 7 = 20 ; 6 notées + 2 réflexions ; ouverture 3 tirées parmi 6 ; au registre', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/stellantis-methode-abc.js');
    const C = await import('/contenus/stellantis-ent133.js');
    const Q = await import('/contenus/questions/ENT-13.3.js');
    const I = await import('/activites/index.js');
    const L = Q.QUESTIONS.liste;
    return { meta: A.meta, poids: C.ETAPES.map((e) => [e.id, e.poids]), part: Q.QUESTIONS.part,
      notees: L.filter((q) => q.type === 'fil' && !q.reflexion).map((q) => [q.id, q.poids || 1]), reflexions: L.filter((q) => q.reflexion).map((q) => q.id),
      ouv: Q.QUESTIONS.ouverture.tirage, rubriques: L.filter((q) => q.type === 'ouverture').map((q) => q.rubrique),
      auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'stellantis-methode-abc'),
      entreprise: I.ENTREPRISES.some((e) => e.n === 13 && e.nom === 'Stellantis') };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture], ['ENT-13.3', ['tle'], ['C1.5', 'C1.6'], 'guidage', 20, undefined, 'ENT-13.3', true, 'prof'], 'meta');
  egal(r.poids, [['total', 2], ['part', 3], ['cumul', 4], ['classe', 4]], 'jalons et poids');
  proche(r.poids.reduce((s, x) => s + x[1], 0) + r.part, 20, 'jalons + part des questions');
  egal(r.notees, [['combien-a', 1], ['part-a', 1], ['pourquoi-a', 1.5], ['ou-ranger-a', 1], ['c-mal-placee', 1], ['stock-dort', 1.5]], 'questions notées et poids');
  proche(r.notees.reduce((s, x) => s + x[1], 0), r.part, 'poids des questions = part');
  egal(r.reflexions, ['pari', 'transstockeur'], 'réflexions');
  egal(r.ouv, { calcul: 1, tableur: 1, droit: 1 }, 'ouverture tirée');
  egal(r.rubriques.sort(), ['calcul', 'calcul', 'droit', 'droit', 'tableur', 'tableur'], 'banque d’ouverture');
  vrai(r.auRegistre && r.entreprise, 'registre et entreprise n° 13');
});

// ─────────────────────────────────────────────────────────── le calcul ABC et l'équité du tirage
await v('ENT-13.3 : le jeu d’exemple (valeurs écrites à la main) — cumuls 31, 54, 68, 76 / 81,2 … 93,8 / 96,05 …, classes 4 A, 5 B, 9 C, total 10 000', () => {
  const L = ABC.EXEMPLE_18.map((x, i) => ({ ref: `R${i + 1}`, v: x }));
  const K = ABC.classer(L);
  egal(K.total, 10000, 'total');
  const cum = [0.31, 0.54, 0.68, 0.76, 0.812, 0.852, 0.884, 0.914, 0.938, 0.9605, 0.9725, 0.9815, 0.9875, 0.992, 0.9955, 0.9975, 0.999, 1];
  K.ordre.forEach((r, i) => proche(K.cumul[r], cum[i], `cumul ${i + 1}`));
  egal(K.ordre.map((r) => K.classe[r]).join(''), 'AAAABBBBBCCCCCCCCC', 'classes');
  egal(ABC.ecartsEquite(L, [4, 5, 9]), [], 'le jeu d’exemple est équitable');
  // Un seuil franchi pile : 80 % reste A (le test du tableur est « inférieur ou égal »).
  const K2 = ABC.classer([{ ref: 'a', v: 80 }, { ref: 'b', v: 15 }, { ref: 'c', v: 5 }]);
  egal([K2.classe.a, K2.classe.b, K2.classe.c], ['A', 'B', 'C'], '80 % est A, 95 % est B');
});

await v('ENT-13.3 : équité sur 500 graines — aucune égalité, 4 A / 5 B / 9 C (24 références : 5 / 6 / 13), dernier A ≤ 79 %, premier B ≥ 81 %, dernier B ≤ 94 %, premier C ≥ 96 %, la référence au meilleur emplacement est un C', () => {
  S.TIRAGE.lier(S.ID);
  let secours = 0;
  for (let i = 0; i < 500; i++) {
    const t = S.TIRAGE.tirer(`g${i}|${S.ID}`);
    if (t.secours) secours++;
    for (const [cle, n] of [['s18', 18], ['s24', 24]]) {
      const L = U.refsDe(n).map((r, k) => ({ ref: r.ref, v: t.valeurs[cle][k] }));
      const E = ABC.ecartsEquite(L, ABC.REPARTITION[n]);
      vrai(!E.length, `graine ${i}, ${cle} : ${E.join(' ; ')}`);
      egal(new Set(L.map((x) => x.v)).size, n, `graine ${i} : égalité`);
      egal(ABC.classer(L).classe[U.REF_AU_MEILLEUR], 'C', `graine ${i}, ${cle} : ${U.REF_AU_MEILLEUR}`);
    }
  }
  egal(secours, 0, 'tirages de secours');
  // Les références du magasin : 24 adresses distinctes, la meilleure place est T01, niveau 2.
  egal(new Set(U.REFS.map((r) => r.emplacement)).size, 24, 'emplacements distincts');
  egal(U.MEILLEUR_EMPLACEMENT, 'A1-T01-N2-E1', 'meilleur emplacement');
});

await v('ENT-13.3 : deux élèves, deux jeux ; le même élève retrouve le sien ; le tirage ne change pas quand on rouvre', () => {
  const a = dbNode('standard', 'eleve-a'), b = dbNode('standard', 'eleve-b'), a2 = dbNode('standard', 'eleve-a');
  vrai(JSON.stringify(S.sorties(a)) !== JSON.stringify(S.sorties(b)), 'deux élèves ont le même jeu');
  egal(JSON.stringify(S.sorties(a)), JSON.stringify(S.sorties(a2)), 'même élève, même jeu');
  const avant = JSON.stringify(a.tirages);
  S.TIRAGE.assurer(a, { uid: 'autre', aisance: 'standard' });
  egal(JSON.stringify(a.tirages), avant, 'réouverture');
});

// ─────────────────────────────────────────────────────────── l'export
await v('ENT-13.3 : l’export — 5 colonnes, 18 lignes dans l’ordre des emplacements (donc pas triées sur les sorties) ; 24 pour un confirmé ; le fichier porte le bon nom', () => {
  const db = dbNode();
  const e = S.TABLEUR.exports[0];
  egal(e.fichier, 'stellantis-sorties-semaine37.xlsx', 'nom');
  const ex = GT.construireExport(e, db, {});
  egal(ex.feuilles[0].colonnes, ['Référence', 'Désignation', 'Famille', 'Emplacement', 'Sorties'], 'colonnes');
  const L = ex.feuilles[0].lignes;
  egal(L.length, 18, 'lignes');
  egal(L.map((l) => l[3]), L.map((l) => l[3]).slice().sort(), 'ordre des emplacements');
  const s = L.map((l) => l[4]);
  vrai(JSON.stringify(s) !== JSON.stringify(s.slice().sort((a, b) => b - a)), 'la liste est déjà triée sur les sorties');
  egal(new Set(L.map((l) => l[0])).size, 18, 'références distinctes');
  const c = dbNode('confirme', 'conf-1');
  egal(GT.construireExport(e, c, {}).feuilles[0].lignes.length, 24, 'confirmé : 24 lignes');
});

// ─────────────────────────────────────────────────────────── les contrôles du dépôt
await v('ENT-13.3 : un fichier juste (trié, SOMME, part en %, cumul, SI) — les 4 contrôles sont justes, 18 lignes chacun ; idem pour un confirmé (24)', () => {
  const r = deposer(dbNode());
  egal(etat(r), TOUS_OK, 'contrôles');
  egal(r.filter((x) => x.id !== 'total').map((x) => [x.justes, x.total]), [[18, 18], [18, 18], [18, 18]], 'lignes');
  const rc = deposer(dbNode('confirme', 'conf-1'));
  egal(etat(rc), TOUS_OK, 'confirmé');
  egal(rc.find((x) => x.id === 'part').total, 24, 'confirmé : 24 lignes');
});

await v('ENT-13.3 : liste non triée — le cumul tombe (et seulement lui, avec la classe) ; le total et la part restent justes', () => {
  const r = deposer(dbNode(), { trie: false });
  const e = etat(r);
  egal([e.total, e.part, e.cumul], ['ok', 'ok', 'ko'], 'total, part, cumul');
  vrai(r.find((x) => x.id === 'cumul').justes < 18, 'le cumul ne peut pas être juste partout');
});

await v('ENT-13.3 : total tapé à la main → refusé ; ligne « Total » absente → refusé ; le reste intact', () => {
  const t = deposer(dbNode(), { total: 'tape' });
  egal(etat(t), { ...TOUS_OK, total: 'ko' }, 'total tapé');
  vrai(/formule/.test(t.find((x) => x.id === 'total').remarques.join(' ')), 'le retour dit qu’il faut une formule : ' + t.find((x) => x.id === 'total').remarques.join(' '));
  const a = deposer(dbNode(), { total: 'absent' });
  egal(etat(a), { ...TOUS_OK, total: 'ko' }, 'total absent');
});

await v('ENT-13.3 : part multipliée par 100 → refusée (et le libellé le dit) ; cumul tapé → refusé ; classe écrite à la main → refusée', () => {
  const p = deposer(dbNode(), { part: 'x100' });
  egal(etat(p).part, 'ko', 'part ×100');
  vrai(/sans ×100/.test(S.controles(dbNode()).find((c) => c.id === 'part').libelle), 'le libellé dit « sans ×100 »');
  egal(etat(deposer(dbNode(), { cumul: 'tape' })).cumul, 'ko', 'cumul tapé');
  const c = deposer(dbNode(), { classe: 'main' });
  egal(etat(c).classe, 'ko', 'classe à la main');
  vrai(/formule|n'utilise pas/.test(c.find((x) => x.id === 'classe').remarques.join(' ')), 'le retour nomme la fonction manquante : ' + c.find((x) => x.id === 'classe').remarques.join(' '));
});

// ─────────────────────────────────────────────────────────── à l'écran
await v('ENT-13.3 : à l’ouverture — un seul message de Karim avec la fiche méthode et la description de ton poste ; inaction → 0/20, aucun jalon juste', async () => {
  await mont({ sansOuverture: true });
  const n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  await mont();
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces]), [['Karim', 'Refaire le classement ABC du magasin', ['poste-133', 'methode-133']]], 'messages à l’ouverture');
  vrai(/SOMME/.test(E[0].text) && /80 %/.test(E[0].text) && /95 %/.test(E[0].text) && /\$/.test(E[0].text), 'le message dit les fonctions, les seuils et le $');
  vrai(new Date(E[0].ts).getFullYear() === 2027, 'le message porte la date du scénario');
});

await v('ENT-13.3 : la fiche méthode — seuils 80 % et 95 %, exemple à six références calculé (60, 85, 93, 97, 99, 100 %), sources citées', async () => {
  await mont();
  const h = await pg.evaluate(async () => { const C = await import('/contenus/stellantis-ent133.js'); const e = document.createElement('div'); e.innerHTML = C.DOCUMENTS.find((d) => d.id === 'methode-133').html; return e.textContent.replace(/\s+/g, ' '); });
  vrai(/80 %/.test(h) && /95 %/.test(h), 'seuils');
  for (const x of ['60 %', '85 %', '93 %', '97 %', '99 %', '100 %']) vrai(h.includes(x), `exemple : ${x}`);
  vrai(/Office québécois de la langue française/.test(h) && /mecalux/.test(h), 'sources');
  vrai(/règle, pas une loi/.test(h), 'ABC est une règle');
});

await v('ENT-13.3 : Avant de commencer — 3 questions tirées (calcul, tableur, droit), corrigées, jamais notées', async () => {
  const db = await monter({ uid: UID, sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 3, 'nombre');
  egal([ids.filter((x) => ['pct', 'cumul'].includes(x)).length, ids.filter((x) => ['somme', 'dollar'].includes(x)).length, ids.filter((x) => ['payer', 'accord'].includes(x)).length], [1, 1, 1], 'une de chaque');
  for (let k = 0; k < 3; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await clic(`[data-q-choix="${OUV[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    if (k < 2) await clic('[data-cle="suivante"]');
  }
  await clic('[data-ouv-continuer]');
  const n = await noter(ACT);
  vrai(!n || n.score === 0, 'Avant de commencer a compté : ' + JSON.stringify(n && n.score));
});

// Le parcours complet à l'écran : Extractions → Exporter → (classeur) → Fichiers → déposer → questions.
async function exporter() {
  await allerV('extractions');
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click(`${Z} [data-exporter="sorties"]`)]);
  return dl;
}
async function deposerEcran(db, o, n = 0) {
  await allerV('fichiers');
  const avant = await pg.$eval(Z, (e) => e.innerText);
  await pg.setInputFiles('#fichierTableur', { name: 'abc.xlsx', mimeType: 'application/octet-stream', buffer: classeur(db, o) });
  // Un redépôt juste fait arriver la première question au fil, qui prend la place du retour : on attend l'un ou l'autre.
  await pg.waitForFunction(([Z, n]) => { const e = document.querySelector(Z); const t = e.innerText; return /résultats? justes? sur/.test(t) && (!n || e.querySelector('[data-q-panneau]') || new RegExp(n + '\\s+dépôts').test(t)); }, [Z, n]);
  await pause(900);
}

await v('ENT-13.3 : à l’écran — Extractions : « Exporter » donne le fichier de 18 lignes ; un dépôt non trié dit ce qui cloche (guidage) ; un redépôt juste donne 4 jalons ; les questions arrivent', async () => {
  await mont();
  const dl = await exporter();
  egal(dl.suggestedFilename(), 'stellantis-sorties-semaine37.xlsx', 'nom du fichier');
  const wb = XL.read(fs.readFileSync(await dl.path()), { type: 'buffer' });
  const rows = XL.utils.sheet_to_json(wb.Sheets['Sorties']);
  egal(rows.length, 18, 'lignes exportées');
  egal(Object.keys(rows[0]), ['Référence', 'Désignation', 'Famille', 'Emplacement', 'Sorties'], 'colonnes exportées');
  // Les mêmes valeurs que le calcul de la séance, dans les mêmes lignes.
  const db = await base();
  const attendu = Object.fromEntries(S.sorties(db).map((x) => [x.ref, x.v]));
  vrai(rows.every((r) => attendu[r['Référence']] === r['Sorties']), 'l’export ne porte pas les sorties du tirage');
  await qFil(R);   // le pari arrive après l'export
  vrai((await base()).questions[ID].pari, 'la réflexion de départ n’a pas été posée après l’export');
  // Un premier dépôt, non trié : le retour est détaillé, le cumul est faux.
  await deposerEcran(db, { trie: false });
  const t1 = (await texte()).replace(/\s+/g, ' ');
  vrai(/Cumul/.test(t1) && /sur 18|justes? sur/.test(t1), 'retour du dépôt : ' + t1.slice(0, 300));
  let n = await noter(ACT);
  egal(n.detail && n.detail.cumul !== 'ok', true, 'cumul juste avec une liste non triée');
  // Tous les jalons sont jugés : les questions non atteintes arrivent en rattrapage (le moteur les pose dès le premier bilan). On y répond, puis on redépose juste (illimité en guidage).
  await qFil(R);
  await deposerEcran(db, {}, 2);
  await qFil(R);
  n = await noter(ACT);
  vrai(!Object.entries(n.detail).filter(([k]) => ['total', 'part', 'cumul', 'classe'].includes(k)).some(([, e]) => e !== 'ok'), 'jalons : ' + JSON.stringify(n.detail));
  proche(n.score, 20, 'tout juste, toutes les questions bien répondues');
  const F = await base();
  for (const q of ['combien-a', 'part-a', 'pourquoi-a', 'ou-ranger-a', 'c-mal-placee', 'stock-dort', 'transstockeur']) vrai(F.questions[ID][q] && F.questions[ID][q].premiere === R[q], `question « ${q} » : ${JSON.stringify(F.questions[ID][q])}`);
});

await v('ENT-13.3 : les questions lisent son classement — « combien de A » et « quelle part » portent sur ses valeurs, les choix sont tous différents', async () => {
  await mont();
  const r = await pg.evaluate(async (uid) => {
    const Q = await import('/contenus/questions/ENT-13.3.js');
    const D = await import('/contenus/stellantis-ent133-donnees.js');
    const db = { aisance: 'standard' }; D.TIRAGE.lier(D.ID); D.TIRAGE.assurer(db, { uid, aisance: 'standard' });
    const sel = (id) => Q.QUESTIONS.liste.find((q) => q.id === id).selon(db);
    return { A: D.lesA(db), combien: sel('combien-a'), part: sel('part-a'), mal: sel('c-mal-placee') };
  }, UID);
  egal(r.A.n, 4, 'quatre A (répartition 4 / 5 / 9)');
  egal(r.combien.libs.juste, '4', 'bonne réponse : 4');
  egal(new Set(Object.values(r.combien.libs)).size, 4, 'choix de « combien » tous différents');
  egal(r.part.libs.juste, `${Math.round(r.A.part * 100)} %`, 'bonne part');
  vrai(r.A.part > 0.75 && r.A.part < 0.8, 'la part des A est entre 75 et 80 % : ' + r.A.part);
  egal(new Set(Object.values(r.part.libs)).size, 4, 'choix de « part » tous différents');
  vrai(/faisceau de plafonnier/.test(r.mal.enonce) && /A1-T01-N2-E1/.test(r.mal.enonce), 'la référence mal placée : ' + r.mal.enonce);
});

await v('ENT-13.3 : sabotages des questions — une « lire » fausse ôte 1 (19) ; « pourquoi » fausse ôte 1,5 ; « stock qui dort » fausse ôte 1,5 ; toutes fausses ôtent 7 (13) ; les réflexions ne comptent pas', async () => {
  const db0 = await mont();
  const jouer = async (R2) => {
    await mont();
    await exporter();
    await qFil({ ...R, ...R2 });
    const db = await base();
    await deposerEcran(db);
    await qFil({ ...R, ...R2 });
    return noter(ACT);
  };
  const ref = await jouer({});
  proche(ref.score, 20, 'référence');
  proche((await jouer({ 'combien-a': 'moins' })).score, 19, 'combien-a faux');
  proche((await jouer({ 'pourquoi-a': 'cheres' })).score, 18.5, 'pourquoi-a faux');
  proche((await jouer({ 'stock-dort': 'rien' })).score, 18.5, 'stock-dort faux');
  proche((await jouer({ pari: 'toutes', transstockeur: 'vite' })).score, 20, 'les réflexions ne comptent pas');
  proche((await jouer({ 'combien-a': 'moins', 'part-a': 'moitie', 'pourquoi-a': 'cheres', 'ou-ranger-a': 'fond-sol', 'c-mal-placee': 'laisser', 'stock-dort': 'rien' })).score, 13, 'toutes fausses');
  void db0;
});

await v('ENT-13.3 : sabotages du fichier — liste non triée : le cumul (4) et la classe (4) tombent → 12 ; total tapé −2 ; classe à la main −4', async () => {
  const jouerFichier = async (o) => {
    const db = await mont();
    await exporter();
    await qFil(R);
    await deposerEcran(await base(), o);
    await qFil(R);
    return noter(ACT);
  };
  const juste = await jouerFichier({});
  proche(juste.score, 20, 'fichier juste');
  const nt = await jouerFichier({ trie: false });
  proche(nt.score, 12, 'non trié');
  proche((await jouerFichier({ total: 'tape' })).score, 18, 'total tapé');
  proche((await jouerFichier({ classe: 'main' })).score, 16, 'classe à la main');
});

await v('ENT-13.3 : un confirmé voit 24 références à l’écran (même séance, mêmes contrôles) et la note est la même', async () => {
  await mont({ aisance: 'confirme' });
  const dl = await exporter();
  const rows = XL.utils.sheet_to_json(XL.read(fs.readFileSync(await dl.path()), { type: 'buffer' }).Sheets['Sorties']);
  egal(rows.length, 24, 'lignes exportées');
  await qFil(R);
  const db = await base();
  await deposerEcran(db);
  await qFil(R);
  proche((await noter(ACT)).score, 20, 'confirmé : 20/20');
});

await v('ENT-13.3 : le fichier de corrigé est servi et se charge ; le corrigé d’un élève donne son classement', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-13.3.js');
    return { code: C.CORRIGE.code, n: C.CORRIGE.items.length, eleve: C.corrigeEleve({}) };
  });
  egal([r.code, r.n], ['ENT-13.3', 5], 'corrigé');
  vrai(r.eleve.items.length >= 20, 'le corrigé de l’élève liste les 18 références et ses A');
});

await v('ENT-13.3 : aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  vrai(P.hotes.size === 0, 'hôtes extérieurs : ' + [...P.hotes].join(', '));
  vrai(P.erreurs.length === 0, 'erreurs : ' + P.erreurs.join(' | '));
});

}
