// Suite de tests de Prepalog — bloc « tableur-export » : le GESTE TABLEUR « Exporter, traiter,
// Déposer, décider » (04/10/2026, chantier C5, `core/types/export-tableur.js`).
// `node outils/test.mjs tableur-export` ne lance que ce bloc.
//
// Trois parties :
//   1. sans navigateur : l'export (pur, vraies dates, salissures déterministes), les noms de
//      fonctions, les contrôles par titre de colonne et par clé ;
//   2. les FICHIERS TÉMOINS de l'essai du 03/10 (`outils/test/fichiers/`, faits sous Excel et sous
//      LibreOffice, en .xlsx et en .ods) : valeurs à la tolérance, noms de fonctions trouvés,
//      « nombre tapé » repéré ; et les SABOTAGES qui doivent les faire échouer (contrôle sur le
//      texte exact de la formule, tolérance à 0) ;
//   3. dans le navigateur, sur la mini-séance d'essai (`outils/essai-tableur.js`) : le bouton
//      « Exporter », le menu « Fichiers », le dépôt et les trois retours (guidage, entraînement,
//      évaluation). Le classeur « de l'élève » est fabriqué ici à partir de SON export.
//
// Les valeurs attendues sont écrites à la main quand elles portent sur des données.

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export default async function bloc({ v, nav, ROOT, baseXlsx }) {
  const imp = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);
  const G = await imp('core/types/export-tableur.js');
  const E = await imp('outils/essai-tableur.js');
  const S = await imp('contenus/cdiscount-inventaire.js');
  if (!baseXlsx) throw new Error('module xlsx introuvable — npm install --no-save --no-package-lock xlsx@0.18.5');
  const XLSX = await import(pathToFileURL(path.join(baseXlsx, 'xlsx.mjs')).href);
  const FICH = path.join(ROOT, 'outils', 'test', 'fichiers');
  const lire = (nom) => XLSX.read(fs.readFileSync(path.join(FICH, nom)), { type: 'buffer', cellFormula: true });
  const TEMOINS = ['temoin-excel.xlsx', 'temoin-libreoffice.xlsx', 'temoin-libreoffice.ods'];

  // Une base d'essai, comme l'ouvre le moteur : base de départ, puis volet.
  const baseEssai = () => {
    const U = E.univers('guidage');
    const db = U.baseDeDepart('Léa');
    ['moves', 'mails', 'orders', 'receptions'].forEach((k) => { if (!db[k]) db[k] = []; });
    const g = U.volet.semer('Léa', db);
    g.receptions.forEach((r) => db.receptions.push(r));
    g.orders.forEach((o) => db.orders.push(o));
    g.mouvements.forEach((m) => { db.stock[m.sku] = (db.stock[m.sku] || 0) + m.delta; db.moves.push({ ...m, after: db.stock[m.sku] }); });
    return { U, db };
  };
  const EXP = () => E.tableurEssai('guidage').exports[0];

  /* =========================================================== 1. sans navigateur */

  await v('Tableur : l\'export est une fonction pure de la base — même base, mêmes lignes ; dix lignes, vraies dates', async () => {
    const { db } = baseEssai();
    const a = G.construireExport(EXP(), db, { graine: 'x' });
    const b = G.construireExport(EXP(), JSON.parse(JSON.stringify(db)), { graine: 'x' });
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('deux exports de la même base diffèrent');
    const F = a.feuilles[0];
    if (F.lignes.length !== 10) throw new Error(`${F.lignes.length} lignes au lieu de 10`);
    if (F.colonnes.join('|') !== 'Date|N° bon|Commande|Référence|Désignation|Emplacement|Qté préparée|Stock logiciel|Stock trouvé|Préparateur') throw new Error('colonnes : ' + F.colonnes.join('|'));
    if (F.lignes.some((l) => typeof l[0] !== 'number')) throw new Error('les dates doivent être de vraies dates (horodatage)');
    // Écrit en .xlsx, relu : la colonne Date porte des dates, pas du texte.
    const wb = G.classeurExport(XLSX, a);
    const relu = XLSX.read(XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }), { type: 'buffer', cellDates: true });
    const A2 = relu.Sheets['Préparations'].A2;
    if (!A2 || !(A2.v instanceof Date)) throw new Error('A2 n\'est pas une date : ' + JSON.stringify(A2));
    if (relu.SheetNames.join() !== 'Préparations,Synthèse') throw new Error('feuilles : ' + relu.SheetNames.join());
    // Les premières lignes, écrites à la main (allée A d'ENT-2.3, A-01 à A-04).
    const deb = F.lignes.slice(0, 3).map((l) => [l[1], l[3], l[7], l[8]].join(' '));
    if (deb.join(' ; ') !== 'BP-732101 CAB-USBC-1M 70 73 ; BP-732101 ECO-BT-01 25 25 ; BP-732118 CHG-20W 48 45') throw new Error('lignes : ' + deb.join(' ; '));
  });

  await v('Tableur : salissures déterministes — même élève, même fichier ; deux élèves, positions différentes ; nombres déclarés', async () => {
    const { db } = baseEssai();
    const exp = { ...EXP(), salissures: { vides: 2, doublons: 3, datesTexte: 4 } };
    const un = G.construireExport(exp, db, { graine: G.graineExport('eleve-1', 'essai', 'preparations') });
    const re = G.construireExport(exp, db, { graine: G.graineExport('eleve-1', 'essai', 'preparations') });
    const deux = G.construireExport(exp, db, { graine: G.graineExport('eleve-2', 'essai', 'preparations') });
    if (JSON.stringify(un.feuilles) !== JSON.stringify(re.feuilles)) throw new Error('même élève, fichier différent');
    if (JSON.stringify(un.feuilles[0].lignes) === JSON.stringify(deux.feuilles[0].lignes)) throw new Error('deux élèves, même fichier');
    const L = un.feuilles[0].lignes;
    if (L.length !== 10 + 2 + 3) throw new Error(`${L.length} lignes au lieu de 15`);
    if (L.filter((l) => l.every((x) => x === null)).length !== 2) throw new Error('lignes vides');
    if (L.filter((l) => typeof l[0] === 'string').length !== 4) throw new Error('dates en texte');
    // Les lignes « propres » (contre lesquelles on contrôle) ne sont pas salies.
    if (un.propres.length !== 10) throw new Error('lignes propres : ' + un.propres.length);
  });

  await v('Tableur : salissures visées — au moins n doublons et n dates en texte sur les lignes que la séance désigne', async () => {
    const { db } = baseEssai();
    // Les lignes en écart (4 sur 10 dans l'essai : CAB, CHG, COQ, CHG).
    const vise = (l) => l['Stock trouvé'] !== l['Stock logiciel'];
    const enEcart = (l) => l[8] !== l[7];
    const exp = { ...EXP(), salissures: { vides: 1, doublons: 2, datesTexte: 3, cible: vise, doublonsCible: 1, datesTexteCible: 2 } };
    for (const eleve of ['a', 'b', 'c', 'd', 'e']) {
      const ex = G.construireExport(exp, db, { graine: eleve });
      const L = ex.feuilles[0].lignes;
      const textes = L.filter((l) => typeof l[0] === 'string');
      if (textes.length !== 3 || textes.filter(enEcart).length < 2) throw new Error(`${eleve} : dates en texte ` + textes.map((l) => l[3]).join());
      const cles = L.filter((l) => l[1]).map((l) => l.join('|'));
      const doublons = cles.filter((k, i) => cles.indexOf(k) !== i);
      if (doublons.length !== 2 || !L.filter((l) => l[1] && cles.filter((k) => k === l.join('|')).length > 1).some(enEcart)) throw new Error(`${eleve} : doublons ` + doublons.join(' ; '));
    }
  });

  await v('Tableur : contrôle « lignes » avec colonneDate — une date écrite en texte est signalée ; « fonctionsFeuille » : RECHERCHEV n\'importe où dans la feuille', async () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([['Date', 'X'], [new Date(2026, 9, 1), 1], ['02/10/2026', 2]], { cellDates: true });
    XLSX.utils.book_append_sheet(wb, ws, 'P');
    const relu = XLSX.read(XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }), { type: 'buffer', cellFormula: true });
    const [r] = G.controlerDepot(relu, [{ type: 'lignes', id: 'n', feuille: 'P', attendu: 2, colonneDate: 'Date' }]);
    if (r.ok || !/1 date écrite en texte/.test(r.remarques.join())) throw new Error(JSON.stringify(r));
    const s2 = XLSX.utils.aoa_to_sheet([['Réf', 'Coût', 'Valeur'], ['A', 2, 4], ['B', 3, 9]]);
    s2.B2.f = 'VLOOKUP(A2,T!A:B,2,FALSE)'; s2.C2.f = 'B2*2'; s2.B3.f = 'VLOOKUP(A3,T!A:B,2,FALSE)'; s2.C3.f = 'B3*3';
    const wb2 = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb2, s2, 'S');
    const t = (ff) => G.controlerDepot(wb2, [{ type: 'table', id: 't', feuille: 'S', cle: 'Réf', colonne: 'Valeur', attendu: { A: 4, B: 9 }, formule: true, fonctionsFeuille: ff }])[0];
    if (!t(['VLOOKUP']).ok) throw new Error('VLOOKUP présent dans la feuille non vu : ' + JSON.stringify(t(['VLOOKUP'])));
    if (t(['COUNTIFS']).ok || !/n'utilise pas NB\.SI\.ENS/.test(t(['COUNTIFS']).remarques[0])) throw new Error('fonction absente non vue');
  });

  await v('Tableur : comptage à l\'aveugle — la colonne déclarée « aveugle » n\'est pas exportée tant que le comptage n\'est pas validé', async () => {
    const { db } = baseEssai();
    const exp = { ...EXP(), feuilles: [{ ...EXP().feuilles[0], aveugle: ['Stock logiciel'] }] };
    if (G.construireExport(exp, db, { aveugle: true }).feuilles[0].colonnes.includes('Stock logiciel')) throw new Error('stock du système exporté pendant le comptage');
    if (!G.construireExport(exp, db, { aveugle: false }).feuilles[0].colonnes.includes('Stock logiciel')) throw new Error('colonne perdue hors comptage');
  });

  await v('Tableur : noms de fonctions — nom entier (IF ≠ COUNTIF ≠ COUNTIFS), préfixes et texte ignorés, affichage en français', async () => {
    const f = (x) => [...G.fonctionsDe(x)].sort().join(',');
    if (f('=COUNTIF(A:A,"OUI")') !== 'COUNTIF') throw new Error('COUNTIF : ' + f('=COUNTIF(A:A,"OUI")'));
    if (G.fonctionsDe('COUNTIF(A1:A9,"x")').has('IF')) throw new Error('IF trouvé dans COUNTIF');
    if (G.fonctionsDe('COUNTIFS(A:A,"x",B:B,1)').has('COUNTIF')) throw new Error('COUNTIF trouvé dans COUNTIFS');
    if (f('_xlfn.IFERROR(VLOOKUP(H2,Tarifs!$A$2:$B$4,2,FALSE()),0)') !== 'FALSE,IFERROR,VLOOKUP') throw new Error('préfixe : ' + f('_xlfn.IFERROR(VLOOKUP(H2,Tarifs!$A$2:$B$4,2,FALSE()),0)'));
    if (f('of:=IF([.E2]<[.F2];"SI(";"NON")') !== 'IF') throw new Error('of: et texte : ' + f('of:=IF([.E2]<[.F2];"SI(";"NON")'));
    if (G.nomFr('COUNTIF') !== 'NB.SI' || G.nomFr('vlookup') !== 'RECHERCHEV' || G.nomFr('IF') !== 'SI') throw new Error('noms français');
  });

  await v('Tableur : format du dépôt — .csv refusé avec son motif, .xlsx / .ods acceptés, autre chose : « pas un classeur »', async () => {
    if (G.formatDepot('analyse.csv').message !== 'Ce format perd les formules : enregistrez votre fichier en .xlsx.') throw new Error('csv');
    if (!G.formatDepot('A.XLSX').ok || !G.formatDepot('a.ods').ok || !G.formatDepot('a.xlsm').ok) throw new Error('xlsx / ods');
    if (G.formatDepot('photo.png').message !== 'Ce fichier n\'est pas un classeur.') throw new Error('png');
  });

  // Le classeur que rendrait un élève : son export, avec une colonne Écart, une colonne SI et la
  // synthèse NB.SI. `opts` : ce qu'il fait de travers ou de plus (tri, colonne insérée, nombre tapé…).
  const COL = (n) => XLSX.utils.encode_col(n);
  function classeurEleve(ex, opts = {}) {
    const F = ex.feuilles[0];
    let L = F.lignes.map((l) => l.slice());
    const c = Object.fromEntries(F.colonnes.map((x, i) => [x, i]));
    if (opts.trier) L = L.slice().sort((a, b) => (a[c['Référence']] < b[c['Référence']] ? -1 : 1));
    const ent = F.colonnes.slice();
    const insere = !!opts.insererColonne;
    if (insere) { ent.splice(1, 0, 'Note'); L = L.map((l) => [l[0], 'vu', ...l.slice(1)]); }
    const decal = (i) => (insere && i >= 1 ? i + 1 : i);
    const ws = XLSX.utils.aoa_to_sheet([[...ent, opts.titreEcart || 'Écart', 'Réf. en écart'], ...L]);
    const n = ent.length;
    const iT = decal(c['Stock trouvé']), iL = decal(c['Stock logiciel']), iR = decal(c['Référence']);
    L.forEach((l, k) => {
      const r = k + 2;
      const ec = l[iT] - l[iL];
      ws[COL(n) + r] = opts.tape && k === 0 ? { t: 'n', v: ec } : { t: 'n', v: ec, f: `${COL(iT)}${r}-${COL(iL)}${r}` };
      const val = (opts.fauxSi && k === 1) ? 'X' : (ec !== 0 ? l[iR] : '');
      ws[COL(n + 1) + r] = { t: 's', v: val, f: opts.sansSi ? undefined : `IF(${COL(n)}${r}<>0,${COL(iR)}${r},"")` };
      if (opts.sansSi) delete ws[COL(n + 1) + r].f;
    });
    ws['!ref'] = `A1:${COL(n + 1)}${L.length + 1}`;
    const syn = ex.feuilles[1].lignes.map(([ref]) => {
      const nb = F.lignes.filter((l) => l[c['Référence']] === ref && l[c['Stock trouvé']] !== l[c['Stock logiciel']]).length;
      return [ref, nb];
    });
    const ws2 = XLSX.utils.aoa_to_sheet([['Référence', 'Nb constats'], ...syn]);
    syn.forEach((s, k) => { ws2['B' + (k + 2)] = { t: 'n', v: s[1], f: `${opts.countifs ? 'COUNTIFS' : 'COUNTIF'}(Préparations!${COL(n + 1)}:${COL(n + 1)},A${k + 2})` }; });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Préparations');
    XLSX.utils.book_append_sheet(wb, ws2, 'Synthèse');
    return XLSX.read(XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }), { type: 'buffer', cellFormula: true });
  }
  const controlerEssai = (wb, db, ex) => G.controlerDepot(wb, E.controlesEssai(db), ex.propres);
  const dire = (res) => res.map((r) => `${r.id} ${r.justes}/${r.total}${r.ok ? '' : ' ✗ ' + r.remarques.slice(0, 2).join(' | ')}`).join(' ; ');

  await v('Tableur : le classeur juste passe ; colonne retrouvée après tri et insertion d\'une colonne ; titre « ecart » = « Écart »', async () => {
    const { db } = baseEssai();
    const ex = G.construireExport(EXP(), db, {});
    for (const opts of [{}, { trier: true }, { insererColonne: true }, { trier: true, insererColonne: true, titreEcart: '  ecart ' }]) {
      const res = controlerEssai(classeurEleve(ex, opts), db, ex);
      if (res.some((r) => !r.ok)) throw new Error(JSON.stringify(opts) + ' : ' + dire(res));
    }
    // Les attendus, écrits à la main : 10 lignes, 10 lignes, et les constats par référence.
    const res = controlerEssai(classeurEleve(ex), db, ex);
    if (res.map((r) => `${r.justes}/${r.total}`).join(' ') !== '10/10 10/10 8/8') throw new Error(dire(res));
    const syn = E.controlesEssai(db)[2].attendu;
    if (JSON.stringify(syn) !== JSON.stringify({ 'CAB-USBC-1M': 1, 'CHG-20W': 2, 'ECO-BT-01': 0, 'SOU-SF-02': 0, 'BAT-10K': 0, 'CLE-64G': 0, 'AMP-LED-E27': 0, 'COQ-UNI-01': 1 })) throw new Error('synthèse attendue : ' + JSON.stringify(syn));
  });

  await v('Tableur : titre « Valeur de l\'écart » tapé avec l\'apostrophe du clavier = « Valeur de l’écart » du contenu (Excel)', async () => {
    const { db } = baseEssai();
    const ex = G.construireExport(EXP(), db, {});
    const ctrl = E.controlesEssai(db);
    ctrl[0] = { ...ctrl[0], titre: 'Valeur de l’écart' };
    const res = G.controlerDepot(classeurEleve(ex, { titreEcart: 'Valeur de l\'écart' }), ctrl, ex.propres);
    if (`${res[0].justes}/${res[0].total}` !== '10/10' || !res[0].ok) throw new Error(dire(res));
  });

  await v('Tableur : ce qui cloche est repéré ligne par ligne — nombre tapé, SI absent, valeur fausse, COUNTIFS au lieu de COUNTIF', async () => {
    const { db } = baseEssai();
    const ex = G.construireExport(EXP(), db, {});
    const r1 = controlerEssai(classeurEleve(ex, { tape: true }), db, ex);
    if (r1[0].justes !== 9 || r1[0].ok || !/ligne BP-732101 \/ CAB-USBC-1M : la cellule contient un nombre tapé, pas une formule/.test(r1[0].remarques.join())) throw new Error(dire(r1));
    const r2 = controlerEssai(classeurEleve(ex, { sansSi: true }), db, ex);
    if (r2[1].justes !== 0 || !/valeur tapée|sans formule/.test(r2[1].remarques.join())) throw new Error(dire(r2));
    const r3 = controlerEssai(classeurEleve(ex, { fauxSi: true }), db, ex);
    if (r3[1].justes !== 9 || !/valeur lue X/.test(r3[1].remarques.join())) throw new Error(dire(r3));
    // La table garde ce que l'élève a écrit, clé par clé (un jalon peut en dépendre).
    if (JSON.stringify(r1[2].lu) !== JSON.stringify({ 'CAB-USBC-1M': 1, 'CHG-20W': 2, 'ECO-BT-01': 0, 'SOU-SF-02': 0, 'BAT-10K': 0, 'CLE-64G': 0, 'AMP-LED-E27': 0, 'COQ-UNI-01': 1 })) throw new Error('lu : ' + JSON.stringify(r1[2].lu));
    const r4 = controlerEssai(classeurEleve(ex, { countifs: true }), db, ex);
    if (r4[2].ok || !/n'utilise pas NB\.SI/.test(r4[2].remarques.join())) throw new Error(dire(r4));
    // Une ligne supprimée par l'élève : elle compte faux, et la remarque la nomme.
    const wb = classeurEleve(ex);
    const ws = wb.Sheets['Préparations'];
    Object.keys(ws).filter((k) => /^[A-Z]+2$/.test(k)).forEach((k) => delete ws[k]);
    const r5 = controlerEssai(wb, db, ex);
    if (r5[0].justes !== 9 || !/absente du fichier/.test(r5[0].remarques.join())) throw new Error(dire(r5));
  });

  await v('Tableur : contrôle « lignes » — lignes vides et doublons supprimés, sinon le dire', async () => {
    const aoa = [['A', 'B'], [1, 'x'], [2, 'y'], [null, null], [2, 'y'], [3, 'z']];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), 'Données');
    const [r] = G.controlerDepot(wb, [{ type: 'lignes', id: 'n', feuille: 'Données', attendu: 3 }]);
    if (r.ok || !/1 doublon/.test(r.remarques.join()) || !/4 lignes/.test(r.remarques.join())) throw new Error(JSON.stringify(r));
    const wb2 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb2, XLSX.utils.aoa_to_sheet([['A', 'B'], [1, 'x'], [2, 'y'], [3, 'z']]), 'Données');
    if (!G.controlerDepot(wb2, [{ type: 'lignes', id: 'n', feuille: 'Données', attendu: 3 }])[0].ok) throw new Error('propre refusé');
  });

  /* =========================================================== 2. les fichiers témoins */

  // Les contrôles des témoins (feuille « Stock » de l'essai du 03/10) : valeurs et fonctions.
  // E12 = SOMME(D2:D6) / SOMME(C2:C6) = 82 / 173 : Excel et LibreOffice n'en écrivent pas les
  // mêmes décimales — c'est la tolérance qui les met d'accord.
  const CTRL_TEMOINS = (tol) => [
    { type: 'cellule', id: 'e2', feuille: 'Stock', cellule: 'E2', attendu: 28, fonctions: [], formuleAttendue: true },
    { type: 'cellule', id: 'g2', feuille: 'Stock', cellule: 'G2', attendu: 'NON', fonctions: ['IF'] },
    { type: 'cellule', id: 'i2', feuille: 'Stock', cellule: 'I2', attendu: 49.9, fonctions: ['IFERROR', 'VLOOKUP'], tolerance: tol },
    { type: 'cellule', id: 'e9', feuille: 'Stock', cellule: 'E9', attendu: 2, fonctions: ['COUNTIF'] },
    { type: 'cellule', id: 'e10', feuille: 'Stock', cellule: 'E10', attendu: 30, fonctions: ['SUMIF'] },
    { type: 'cellule', id: 'e12', feuille: 'Stock', cellule: 'E12', attendu: 82 / 173, fonctions: ['SUM'], tolerance: tol },
    { type: 'cellule', id: 'e13', feuille: 'Stock', cellule: 'E13', attendu: 1234.5, fonctions: ['SUM'] },   // nombre tapé
  ];

  await v('Tableur : les trois fichiers témoins (Excel .xlsx, LibreOffice .xlsx et .ods) passent — valeurs à la tolérance, fonctions trouvées, nombre tapé repéré', async () => {
    for (const t of TEMOINS) {
      const res = G.controlerDepot(lire(t), CTRL_TEMOINS(1e-6));
      const ko = res.filter((r) => !r.ok).map((r) => r.id);
      if (ko.join() !== 'e13') throw new Error(`${t} : ${dire(res)}`);
      if (!/nombre tapé/.test(res.find((r) => r.id === 'e13').remarques.join())) throw new Error(`${t} : nombre tapé non dit`);
    }
    // Le SI de G2 n'est pas confondu avec le NB.SI de E9, ni l'inverse.
    const res = G.controlerDepot(lire('temoin-libreoffice.ods'), [
      { type: 'cellule', id: 'x', feuille: 'Stock', cellule: 'E9', attendu: 2, fonctions: ['IF'] },
      { type: 'cellule', id: 'y', feuille: 'Stock', cellule: 'G2', attendu: 'NON', fonctions: ['COUNTIF'] }]);
    if (res.some((r) => r.ok)) throw new Error('IF trouvé dans COUNTIF, ou l\'inverse : ' + dire(res));
  });

  await v('Tableur : SABOTAGE « texte exact de la formule » — le témoin LibreOffice échoue (il fallait comparer les NOMS de fonctions)', async () => {
    // Ce qu'un contrôle naïf ferait : comparer la formule entière à celle d'Excel.
    const parTexte = (wb) => String(wb.Sheets.Stock.I2.f) === 'IFERROR(VLOOKUP(H2,Tarifs!$A$2:$B$4,2,FALSE),0)';
    if (!parTexte(lire('temoin-excel.xlsx'))) throw new Error('le sabotage devrait laisser passer Excel');
    if (parTexte(lire('temoin-libreoffice.xlsx')) || parTexte(lire('temoin-libreoffice.ods'))) throw new Error('le sabotage devrait faire échouer LibreOffice');
    // … alors que le contrôle livré les accepte tous.
    for (const t of TEMOINS) if (!G.controlerDepot(lire(t), [CTRL_TEMOINS(1e-6)[2]])[0].ok) throw new Error(t);
  });

  await v('Tableur : SABOTAGE « tolérance à 0 » (égalité exacte) — le témoin LibreOffice échoue sur les décimales, Excel passe', async () => {
    const e12 = (t, tol) => G.controlerDepot(lire(t), [CTRL_TEMOINS(tol)[5]])[0].ok;
    if (!e12('temoin-excel.xlsx', null)) throw new Error('Excel devrait passer à égalité exacte');
    if (e12('temoin-libreoffice.xlsx', null) || e12('temoin-libreoffice.ods', null)) throw new Error('LibreOffice devrait échouer à égalité exacte');
    if (!e12('temoin-libreoffice.ods', 1e-6)) throw new Error('la tolérance livrée doit accepter LibreOffice');
  });

  await v('Tableur : SheetJS de vendor/ est la version de l\'essai (0.18.5)', async () => {
    const src = fs.readFileSync(path.join(ROOT, 'vendor', 'xlsx.full.min.js'), 'utf8');
    if (!/version="0\.18\.5"/.test(src)) throw new Error('version de vendor/xlsx.full.min.js');
  });

  await v('Tableur : état et jalons — meilleur dépôt retenu (guidage, entraînement), un seul en évaluation', async () => {
    const r = (n) => [{ id: 'a', justes: n, total: 10, ok: n === 10, remarques: [] }];
    const db = {};
    G.enregistrerDepot(db, 'd', r(7), { retour: 'entrainement' });
    G.enregistrerDepot(db, 'd', r(4), { retour: 'entrainement' });
    let x = G.resultatDepot(db, 'd');
    if (!x.depose || x.essais !== 2 || x.controles.a.justes !== 7) throw new Error('meilleur non retenu : ' + JSON.stringify(x));
    G.enregistrerDepot(db, 'd', r(9), { retour: 'entrainement' });
    if (G.resultatDepot(db, 'd').controles.a.justes !== 9) throw new Error('meilleur non remplacé');
    const ev = {};
    if (!G.enregistrerDepot(ev, 'd', r(3), { retour: 'evaluation' })) throw new Error('premier dépôt refusé');
    if (G.enregistrerDepot(ev, 'd', r(10), { retour: 'evaluation' })) throw new Error('second dépôt accepté en évaluation');
    if (G.resultatDepot(ev, 'd').controles.a.justes !== 3) throw new Error('évaluation : ' + JSON.stringify(G.resultatDepot(ev, 'd')));
    if (G.resultatDepot({}, 'd').depose) throw new Error('rien déposé');
    if (G.retourDeTemps('guidage') !== 'guidage' || G.retourDeTemps('erreur') !== 'entrainement' || G.retourDeTemps('evaluation') !== 'evaluation') throw new Error('retour par temps');
  });

  /* =========================================================== 2 bis. export filtré (04/10/2026) */
  // L'élève choisit ce qu'il exporte (brief `MOTEUR-export-filtre.md`). Une liste d'essai : trois
  // ajustements demandés (J-3, J-10, J-25), une réception du mois et un ajustement de J-40 à écarter.
  const AUJ = new Date(2026, 9, 27).getTime();
  const Jm = (j) => AUJ - j * 864e5 + 10 * 3600e3;
  const EXF = (indications = 2) => ({
    id: 'mv', liste: 'Mouvements', fichier: 'mv.xlsx', indications, aujourdhui: () => AUJ,
    feuilles: [{ nom: 'Mouvements', colonnes: ['Date', 'Type', 'N°', 'Motif', 'Document'], types: { Date: 'date' },
      lignes: () => [[Jm(25), 'Ajustement', 'AJ-3', 'Démarque', 'FR-1'], [Jm(10), 'Ajustement', 'AJ-2', 'Casse', ''], [Jm(3), 'Ajustement', 'AJ-1', 'Casse', 'DEM-1']] },
    { nom: 'Synthèse', colonnes: ['Motif', 'Nombre'], lignes: () => [] }],
    autres: () => [[Jm(5), 'Réception', 'REC-1', '', ''], [Jm(40), 'Ajustement', 'AJ-0', 'Casse', 'DEM-0']],
    filtres: [{ id: 'type', libelle: 'Type de mouvement', colonne: 'Type', juste: 'Ajustement' },
      { id: 'periode', libelle: 'Période', periode: 'Date', juste: '30j' }],
  });

  await v('Export filtré : sans critère, la demande exactement ; critères de départ par niveau ; lignes en trop et manquantes comptées par critère', async () => {
    const e = EXF(), db = {};
    const nos = (c) => G.construireExport(e, db, { criteres: c }).feuilles[0].lignes.map((l) => l[2]).join();
    if (nos(null) !== 'AJ-3,AJ-2,AJ-1') throw new Error('sans critère : ' + nos(null));
    if (nos(G.criteresJustes(e, db)) !== 'AJ-3,AJ-2,AJ-1') throw new Error('critères justes : ' + nos(G.criteresJustes(e, db)));
    if (JSON.stringify(G.criteresDepart(EXF(1), db)) !== '{"type":"Ajustement","periode":"30j"}') throw new Error('niveau 1 : critères de la demande');
    if (JSON.stringify(G.criteresDepart(e, db)) !== '{"type":"*","periode":"7j"}') throw new Error('niveau 2 : critères du logiciel');
    const dep = G.comparerExport(e, db, G.criteresDepart(e, db));
    if (dep.juste || dep.nEnTrop !== 1 || dep.enTrop.type !== 1 || dep.manque !== 2 || JSON.stringify(dep.manquePar) !== '{"periode":2}') throw new Error('départ : ' + JSON.stringify(dep));
    const tout = G.comparerExport(e, db, { type: '*', periode: 'tout' });
    if (tout.nEnTrop !== 2 || tout.enTrop.type !== 1 || tout.enTrop.periode !== 1 || tout.manque !== 0) throw new Error('tout : ' + JSON.stringify(tout));
    // Une période personnalisée qui donne les mêmes lignes est juste (on juge les lignes, pas le menu).
    if (!G.comparerExport(e, db, { type: 'Ajustement', periode: 'perso', du: '2026-09-30', au: '2026-10-27' }).juste) throw new Error('période personnalisée équivalente refusée');
    if (G.comparerExport(e, db, { type: 'Ajustement', periode: 'perso', du: '2026-10-05', au: '2026-10-27' }).manque !== 1) throw new Error('période personnalisée trop courte');
    if (G.optionsFiltre(e, db, e.filtres[0]).map(([k]) => k).join() !== '*,Ajustement,Réception') throw new Error('options du filtre');
  });

  await v('Export filtré : le retour au dépôt selon le niveau — 1 dit quel critère choisir, 2 ce qui cloche, 3 « relisez la demande », 4 rien', async () => {
    const db = {};
    const ex = (n) => { const e = EXF(n); const c = { type: '*', periode: '7j' };
      return [e, { juste: false, criteres: c, comparaison: G.comparerExport(e, db, c), justes: G.criteresJustes(e, db) }]; };
    const t = (n) => G.retourExportHtml(...ex(n)).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    if (!/« Type de mouvement » : choisissez « Ajustement »/.test(t(1)) || !/« Période » : choisissez « 30 derniers jours »/.test(t(1))) throw new Error('niveau 1 : ' + t(1));
    if (!/1 ligne en trop : leur « Type de mouvement » ne correspond pas à la demande/.test(t(2)) || !/Il manque 2 lignes demandées : vérifiez « Période »\./.test(t(2)) || /choisissez/.test(t(2))) throw new Error('niveau 2 : ' + t(2));
    if (!/Relisez-la/.test(t(3)) || /en trop|choisissez/.test(t(3))) throw new Error('niveau 3 : ' + t(3));
    if (t(4).trim() !== '') throw new Error('niveau 4 : ' + t(4));
    const e = EXF(2), c = G.criteresJustes(e, db);
    if (!/✓ Export/.test(G.retourExportHtml(e, { juste: true, criteres: c, comparaison: G.comparerExport(e, db, c) }))) throw new Error('export juste');
  });

  await v('Export filtré : une erreur ne se paie qu\'une fois — le dépôt est contrôlé contre l\'export DE L\'ÉLÈVE ; jalon « bon export » à part, en attente avant le dépôt', async () => {
    const e = EXF(2);
    const compte = (propres) => { const o = {}; propres.forEach((l) => { if (l.Motif) o[l.Motif] = (o[l.Motif] || 0) + 1; }); return o; };
    const depot = { id: 'd', export: 'mv', controles: (db, propres) => [{ type: 'table', id: 'syn', feuille: 'Synthèse', cle: 'Motif', colonne: 'Nombre', attendu: compte(propres) }] };
    // Le classeur fabriqué sur un export donné, synthèse juste POUR CET export.
    const classeur = (db, c) => {
      const ex = G.construireExport(e, db, { criteres: c });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([ex.feuilles[0].colonnes, ...ex.feuilles[0].lignes]), 'Mouvements');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Motif', 'Nombre'], ...Object.entries(compte(ex.propres))]), 'Synthèse');
      return XLSX.read(XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }), { type: 'buffer' });
    };
    const faux = { type: '*', periode: 'tout' };
    const db = {};
    if (G.statutExport(db, 'mv', 'd').status !== 'attente') throw new Error('rien fait : attente');
    G.enregistrerExport(db, e, faux, 5);
    if (G.statutExport(db, 'mv', 'd').status !== 'attente') throw new Error('export sans dépôt : le jalon attend le dépôt');
    let r = G.controlerContreExports(classeur(db, faux), e, depot, db);
    if (!r.resultats[0].ok || r.exporte.juste) throw new Error('formules justes sur un export faux : ' + JSON.stringify(r.resultats[0]) + ' ' + r.exporte.juste);
    G.enregistrerDepot(db, 'd', r.resultats, { exporte: r.exporte });
    if (G.statutExport(db, 'mv', 'd').status !== 'ko' || G.resultatDepot(db, 'd').controles.syn.ok !== true) throw new Error('jalons après export faux');
    // Il refait l'export juste puis redépose : le meilleur dépôt est celui de l'export juste.
    G.enregistrerExport(db, e, G.criteresJustes(e, db), 3);
    if (db.tableur.exports.mv.faits.length !== 2 || db.tableur.exports.mv.n !== 5 || db.tableur.exports.mv.essais !== 2) throw new Error('trace des exports : ' + JSON.stringify(db.tableur.exports.mv));
    r = G.controlerContreExports(classeur(db, G.criteresJustes(e, db)), e, depot, db);
    if (!r.exporte.juste) throw new Error('fichier de l\'export juste attribué à l\'export faux');
    G.enregistrerDepot(db, 'd', r.resultats, { exporte: r.exporte });
    if (G.statutExport(db, 'mv', 'd').status !== 'ok') throw new Error('export juste au second dépôt');
    // Le même export refait ne s'empile pas.
    G.enregistrerExport(db, e, G.criteresJustes(e, db), 3);
    if (db.tableur.exports.mv.faits.length !== 2) throw new Error('critères identiques empilés');
  });

  /* =========================================================== 3. dans le navigateur */

  const ctx = await nav.newContext({ acceptDownloads: true });
  const pg = await ctx.newPage();
  pg.setDefaultTimeout(6000);
  const erreurs = [];
  pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
  await pg.goto('http://127.0.0.1:8099/outils/essai-tableur.html');
  await pg.waitForSelector('.ent-nav[data-vue="fichiers"]');
  const Z = '#hote .ent-main';
  const choisir = async (retour) => { await pg.selectOption('select[name="retour"]', retour); await pg.waitForTimeout(150); };
  const ouvrir = async (vue) => { await pg.click(`#hote .ent-nav[data-vue="${vue}"]`); await pg.waitForTimeout(80); };
  const texte = async (sel) => ((await pg.textContent(sel || Z)) || '').replace(/\s+/g, ' ').trim();
  // Exporter depuis l'écran Extractions : le vrai téléchargement, relu par SheetJS (Node).
  const exporter = async () => {
    await ouvrir('extractions');
    const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click(`${Z} [data-exporter="preparations"]`)]);
    const p = await dl.path();
    return { nom: dl.suggestedFilename(), wb: XLSX.read(fs.readFileSync(p), { type: 'buffer', cellDates: true }) };
  };
  // Déposer un classeur par le menu Fichiers.
  const deposer = async (buffer, nom = 'mon-analyse.xlsx') => {
    await ouvrir('fichiers');
    await pg.setInputFiles('#fichierTableur', { name: nom, mimeType: 'application/octet-stream', buffer });
    await pg.waitForTimeout(400);
  };
  // L'export de l'élève (base de la page), et son classeur travaillé.
  const travail = async (opts = {}) => {
    const db = await pg.evaluate(() => JSON.parse(JSON.stringify(window.__essai.db)));
    const ex = G.construireExport(EXP(), db, {});
    return XLSX.write(classeurEleve(ex, opts), { bookType: 'xlsx', type: 'buffer' });
  };

  await v('Tableur (écran) : « Exporter » dans Extractions donne un vrai .xlsx de l\'élève ; Fichiers ne sert qu\'au dépôt ; rappel dans le bandeau d\'aide', async () => {
    await choisir('guidage');
    const { nom, wb } = await exporter();
    if (nom !== 'essai-preparations.xlsx') throw new Error('nom : ' + nom);
    const ws = wb.Sheets['Préparations'];
    if (!ws || !(ws.A2.v instanceof Date) || ws.B2.v !== 'BP-732101') throw new Error('contenu : ' + JSON.stringify(ws && ws.A2));
    const db = await pg.evaluate(() => window.__essai.db.tableur);
    if (!db || !db.exports.preparations || db.exports.preparations.n !== 10) throw new Error('trace de l\'export : ' + JSON.stringify(db));
    // Plus aucun bouton Exporter sur les écrans métier, ni dans Fichiers (retour de Tristan du 04/10).
    for (const vue of ['commandes', 'stock', 'fichiers']) {
      await ouvrir(vue);
      if (await pg.$(`${Z} [data-exporter]`)) throw new Error('bouton Exporter sur l\'écran ' + vue);
    }
    // Le rappel des fonctions : dans le bandeau d'aide, jamais dans l'écran de travail.
    if (await pg.$('[data-aide-tableur-texte]')) throw new Error('aide ouverte d\'office');
    await pg.click('[data-aide-tableur]');
    if (!/NB\.SI\(plage ; critère\)/.test(await texte('[data-aide-tableur-texte]'))) throw new Error('aide absente du bandeau');
    await ouvrir('fichiers');
    if (/NB\.SI\(plage/.test(await texte())) throw new Error('le rappel est dans l\'écran de travail');
    await pg.click('[data-aide-tableur]');
  });

  await v('Tableur (écran) : guidage — retour détaillé case par case ; redépôt illimité', async () => {
    await choisir('guidage');
    await deposer(await travail({ tape: true, fauxSi: true }));
    const t = await texte();
    if (!/26 résultats justes sur 28/.test(t)) throw new Error('total : ' + t.slice(0, 300));
    if (!/ligne BP-732101 \/ CAB-USBC-1M : la cellule contient un nombre tapé, pas une formule/.test(t)) throw new Error('détail absent : ' + t.slice(0, 600));
    await deposer(await travail());
    if (!/28 résultats justes sur 28/.test(await texte())) throw new Error('redépôt : ' + (await texte()).slice(0, 300));
    const d = await pg.evaluate(() => window.__essai.db.tableur.depots.analyse);
    if (d.essais !== 2 || !d.dernier || d.dernier.fichier !== 'mon-analyse.xlsx') throw new Error(JSON.stringify(d).slice(0, 200));
    if (JSON.stringify(d).includes('PK')) throw new Error('le fichier lui-même est stocké');
  });

  await v('Tableur (écran) : entraînement — « n résultats justes sur m », sans dire lesquels ; le meilleur dépôt est retenu', async () => {
    await choisir('entrainement');
    await deposer(await travail({ tape: true }));
    let t = await texte();
    if (!/27 résultats justes sur 28/.test(t)) throw new Error('total : ' + t.slice(0, 300));
    if (/BP-732101|nombre tapé|Colonne Écart/.test(t)) throw new Error('détail montré en entraînement : ' + t.slice(0, 400));
    await deposer(await travail({ tape: true, fauxSi: true, sansSi: true }));
    t = await texte();
    const db = await pg.evaluate(() => JSON.parse(JSON.stringify(window.__essai.db)));
    const x = G.resultatDepot(db, 'analyse');
    if (x.essais !== 2 || G.totalJustes(Object.values(x.controles)) !== 27) throw new Error('meilleur non retenu : ' + JSON.stringify(x).slice(0, 300));
    if (!/2 dépôts, le meilleur est retenu/.test(t)) throw new Error('mention du meilleur : ' + t.slice(0, 300));
  });

  await v('Tableur (écran) : évaluation — « Fichier reçu. », aucun retour, un seul dépôt ; un .csv refusé n\'en est pas un', async () => {
    await choisir('evaluation');
    await deposer(Buffer.from('a;b\n1;2\n'), 'analyse.csv');
    if (!/Ce format perd les formules : enregistrez votre fichier en \.xlsx\./.test(await texte())) throw new Error('csv : ' + (await texte()).slice(0, 300));
    await deposer(Buffer.from('pas un classeur'), 'note.txt');
    if (!/Ce fichier n'est pas un classeur\./.test(await texte())) throw new Error('txt');
    await deposer(Buffer.from('nimporte quoi'), 'faux.xlsx');
    if (!/Ce fichier n'est pas un classeur\./.test(await texte())) throw new Error('faux xlsx');
    if (await pg.evaluate(() => !!(window.__essai.db.tableur && window.__essai.db.tableur.depots))) throw new Error('un fichier refusé a compté comme dépôt');
    await deposer(await travail({ tape: true }));
    const t = await texte();
    if (!/Fichier reçu\./.test(t) || /résultats? justes?|nombre tapé|✓|✗/.test(t)) throw new Error('retour en évaluation : ' + t.slice(0, 400));
    if (await pg.$('#fichierTableur')) throw new Error('la zone de dépôt reste ouverte après le dépôt');
    const d = await pg.evaluate(() => window.__essai.db.tableur.depots.analyse);
    if (d.essais !== 1) throw new Error('essais : ' + d.essais);
  });

  await v('Tableur (écran) : un .ods déposé est accepté', async () => {
    await choisir('guidage');
    await deposer(fs.readFileSync(path.join(FICH, 'temoin-libreoffice.ods')), 'temoin.ods');
    const t = await texte();
    if (!/résultats? justes? sur/.test(t)) throw new Error('ods : ' + t.slice(0, 300));
  });

  await v('Tableur (écran) : aucune erreur de console', async () => {
    await ctx.close();
    if (erreurs.length) throw new Error(erreurs.slice(0, 3).join(' | '));
  });
}
