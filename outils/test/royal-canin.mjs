// Suite de tests de Prepalog — bloc « royal-canin » : Royal Canin ENT-16.1 à 16.6, piloter l'entrepôt de produits finis (Tle, C1.6, C2.2, C3.1 et C3.4).
// `node outils/test.mjs royal-canin` ne lance que ce bloc. Cadrage : `docs/briefs/royal-canin/CADRAGE-royal-canin-tle.md`. Aides : `outils/test/stellantis/commun.mjs`.
// Réécrit le 27/10/2026 : les indicateurs se calculent au tableur (export, formules, dépôt corrigé) en 16.1, 16.2 et 16.6 ; séance nouvelle ENT-16.3
// « présenter les indicateurs à la réunion » (notée par l'enseignant) ; picking, export et évaluation deviennent 16.4, 16.5 et 16.6.
//
// VALEURS ÉCRITES À LA MAIN (relues sur la fiche méthode le 27/10/2026 ; le code les calcule, le test les écrit) :
// ENT-16.1 (jeu fixe, octobre) : CH-ADU-15 stock moyen (500 + 500) ÷ 2 = 500, rotation 2 000 ÷ 500 = 4, 100 par jour, couverture 500 ÷ 100 = 5 j (délai 4 :
//   OK) ; CT-INT-02 600 ÷ 300 = 2 j pour 3 (rupture) ; CH-MIN-08 300 ÷ 150 = 2 j pour 4 (rupture, la plus urgente : 2 jours manquants) ; CH-SEN-12
//   300 ÷ 60 = 5 j pour 6 (rupture) ; surstocks CH-CHI-03 1 440 ÷ 80 = 18 j, VET-REN-02 500 ÷ 20 = 25 j, CH-LIG-12 1 000 ÷ 50 = 20 j, VET-URI-04
//   700 ÷ 40 = 17,5 j ; CH-MED-10 840 ÷ 140 = 6 j pour 5 et CT-POI-02 900 ÷ 180 = 5 j pour 3 : OK ; taux de service 1 150 ÷ 1 250 = 92 %.
// ENT-16.4 : CH-ADU-15 sol, CT-INT-02 canal, VET-REN-02 réserve, CH-MIN-08 sol (8 kg pile), CT-KIT-04 canal, VET-DIG-10 réserve (10 kg mais 4 colis) ;
//   réappros 120 ÷ 24 = 5, 60 ÷ 24 = 2,5 → 3.
// ENT-16.5 : limite 01/03/2027 + 9 mois = 01/12/2027 ; Mehdi (FIFO) a pris L7124 et L7203 (20/11/2027 : trop court de 11 jours) ; FEFO conforme :
//   L7298 1 palette + L7312 3 palettes.
// ENT-16.6 : VET-REN-02 réserve, CT-STE-04 canal ; limite 01/12/2027 : L8011 écarté, L8056 2 + L8102 1.

import path from 'node:path';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import { ouvrirStellantis, chargerXlsx, proche } from './stellantis/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai, ROOT, baseXlsx }) {

const imp = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const XL = await chargerXlsx(baseXlsx);
const GT = await imp('core/types/export-tableur.js');
const TB = await imp('contenus/royal-canin-tableur.js');
const DN = await imp('contenus/royal-canin-donnees.js');

const S1 = { id: 'royal-canin-indicateurs', act: '/activites/royal-canin-indicateurs.js', n: '1', T: TB.T161 };
const S2 = { id: 'royal-canin-indicateurs-novembre', act: '/activites/royal-canin-indicateurs-novembre.js', n: '2', T: TB.T162 };
const S3 = { id: 'royal-canin-reunion', act: '/activites/royal-canin-reunion.js', n: '3', T: TB.T163 };
const S4 = { id: 'royal-canin-picking', act: '/activites/royal-canin-picking.js', n: '4' };
const S5 = { id: 'royal-canin-export', act: '/activites/royal-canin-export.js', n: '5' };
const S6 = { id: 'royal-canin-evaluation', act: '/activites/royal-canin-evaluation.js', n: '6', T: TB.T166 };
const TOUTES = [S1, S2, S3, S4, S5, S6];
const OBJET = 'Ton compte rendu', PLAN = 'Le plan de tes diapos';

const P = await ouvrirStellantis({ nav, BASE, vrai, activite: S1.act, id: S1.id });
const { pg, Z, pause, base, texte, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter } = P;

const OUV = { rotation: 'six', couverture: 'rupture', fefo: 'perime', lourd: 'sol', ddm: 'qualite', conforme: 'refuser' };
const R = {
  'rotation-moitie': 'double', 'couverture-delai': 'avancer', 'cout-surstock': 'immobilise', gaspillage: 'donner',
  cambrai: 'nos', 'pas-rupture': 'non', usine: 'avancer', camions: 'camions',
  'titre-message': 'message', 'texte-diapo': 'peu', 'question-directeur': 'delai', confidentiel: 'non',
  'lourd-reserve': 'peu', arrondi: 'manque', dos: 'dos', employeur: 'employeur',
  'a-quelques-jours': 'limite', 'fifo-fefo': 'date', 'ou-vont': 'france', 'retour-export': 'vendeur',
  priorite: 'rupture',
};
const qFil = async () => {
  for (let i = 0; i < 10; i++) {
    await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 600 }).catch(() => null);
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(R[q], `question au fil « ${q} » sans réponse prévue`);
    await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80);
    if (await pg.$(`${Z} [data-q-repondre="${q}"]`)) { await clic(`[data-q-choix="${R[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); }
    if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); }
  }
};
let S = S1;
const mont = (s, o = {}) => { S = s; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'rc-' + s.id, ...o }); };
const detail = async () => (await noter(S.act)).detail;
const ko = (d) => Object.keys(d).filter((k) => d[k] === 'ko');
// Une base « de l'élève » sous Node, avec son tirage rangé comme le fait le moteur.
const dbNode = (s, uid = 'eleve-a') => { const db = { aisance: 'standard' }; if (s.T.TIRAGE) { s.T.TIRAGE.lier(s.id); s.T.TIRAGE.assurer(db, { uid, aisance: 'standard' }); } return db; };

// ─────────────────────────────────────────────────────────── le classeur « de l'élève », fabriqué à partir de SON export
// `o` : couv ('juste' | 'moyen' : stock moyen au lieu du stock de fin) · alerte ('si' | 'tape' | 'egal' : <= au lieu de <) · service ('pct' | 'x100') ·
// rotation ('formule' | 'tape') · criteres (ceux de l'export ; absents : la demande).
function classeur(s, db, o = {}) {
  const exp = s.T.TABLEUR.exports[0];
  const ex = GT.construireExport(exp, db, { criteres: o.criteres || null, salissures: false });
  const F = ex.feuilles[0];
  const L = F.lignes;
  const aoa = [[...F.colonnes, 'Stock moyen', 'Rotation', 'Conso par jour', 'Couverture', 'Alerte'], ...L.map((l) => [...l, null, null, null, null, null])];
  const ws = XL.utils.aoa_to_sheet(aoa);
  // Colonnes : A Site, B Référence, C Produit, D début, E fin, F sorties, G délai, H moyen, I rotation, J conso, K couverture, L alerte.
  L.forEach((l, k) => {
    const r = k + 2, [, , , deb, fin, sorties, delai] = l;
    const moy = (deb + fin) / 2, conso = sorties / 20;
    const couv = o.couv === 'moyen' ? moy / conso : fin / conso;
    ws['H' + r] = { t: 'n', v: moy, f: `(D${r}+E${r})/2` };
    ws['I' + r] = o.rotation === 'tape' ? { t: 'n', v: sorties / moy } : { t: 'n', v: sorties / moy, f: `F${r}/H${r}` };
    ws['J' + r] = { t: 'n', v: conso, f: `F${r}/20` };
    ws['K' + r] = { t: 'n', v: couv, f: o.couv === 'moyen' ? `H${r}/J${r}` : `E${r}/J${r}` };
    const a = (o.alerte === 'egal' ? couv <= delai : couv < delai) ? 'Rupture' : couv > 15 ? 'Surstock' : 'OK';
    ws['L' + r] = o.alerte === 'tape' ? { t: 's', v: a } : { t: 's', v: a, f: `IF(K${r}<G${r},"Rupture",IF(K${r}>15,"Surstock","OK"))` };
  });
  const wb = XL.utils.book_new();
  XL.utils.book_append_sheet(wb, ws, 'Stock');
  const C = ex.feuilles[1].lignes;
  const wc = XL.utils.aoa_to_sheet([['Indicateur', 'Valeur'], ...C]);
  const t = C[1][1] / C[0][1];
  wc.B4 = o.service === 'x100' ? { t: 'n', v: t * 100, f: 'B3/B2*100' } : { t: 'n', v: t, f: 'B3/B2', z: '0.0%' };
  XL.utils.book_append_sheet(wb, wc, 'Commandes');
  return XL.write(wb, { bookType: 'xlsx', type: 'buffer' });
}
const controler = (s, db, o = {}) => {
  const ex = GT.construireExport(s.T.TABLEUR.exports[0], db, { criteres: o.criteres || null, salissures: false });
  const wb = XL.read(classeur(s, db, o), { type: 'buffer', cellFormula: true });
  return GT.controlerDepot(wb, s.T.controles(db, ex.propres), ex.propres);
};
const etat = (res) => Object.fromEntries(res.map((r) => [r.id, r.ok ? 'ok' : 'ko']));
const TOUS_OK = { moyen: 'ok', rotation: 'ok', conso: 'ok', couverture: 'ok', alerte: 'ok', service: 'ok' };

// À l'écran : Extractions (critère « Site » si `site`) → Exporter ; puis Fichiers → déposer.
async function exporter(s, site = null) {
  await allerV('extractions');
  if (site) { await pg.selectOption(`${Z} select[data-filtre="site"]`, site); await pause(150); }
  const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click(`${Z} [data-exporter="stock"]`)]);
  await pause(150);
  await qFil();
  return dl;
}
async function deposer(s, o = {}) {
  await allerV('fichiers');
  const db = await base();
  await pg.setInputFiles('#fichierTableur', { name: 'stock.xlsx', mimeType: 'application/octet-stream', buffer: classeur(s, db, o) });
  await pg.waitForFunction((Z) => { const e = document.querySelector(Z); return /résultats? justes? sur|Fichier reçu/.test(e.innerText) || !!e.querySelector('[data-q-panneau]'); }, Z);
  await pause(600);
  await qFil();
}
async function proposer(objet = OBJET, surcharge = {}) {
  const L = await pg.evaluate((o) => { const m = window.__f.db.mails.find((x) => x.subject === o); return m ? Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix.slice()])) : null; }, objet);
  vrai(L, `le message « ${objet} » n’est pas arrivé`);
  const t = Object.fromEntries(Object.entries(L).map(([k, c]) => [k, c[0]]));
  for (const [k, i] of Object.entries(surcharge)) t[k] = L[k][i];
  await phrases(objet, t);
  await qFil();
}
// La fiche (16.4 à 16.6) : `cases` = { bloc: [valeurs] }, `nb` = { bloc: texte }, `choix` = { bloc: valeur } (radio), `liste` = { bloc: valeur } (menu).
async function fiche({ cases = {}, nb = {}, choix = {}, liste = {} }) {
  await allerV('fiche');
  for (const [b, L] of Object.entries(cases)) for (const x of L) { await pg.check(`${Z} [data-fiche-case="${b}"][value="${x}"]`); await pause(200); await qFil(); }
  for (const [b, x] of Object.entries(liste)) { await pg.selectOption(`${Z} select[data-fiche-champ="${b}"]`, x); await pause(200); await qFil(); }
  for (const [b, x] of Object.entries(choix)) { await pg.check(`${Z} [data-fiche-champ="${b}"][value="${x}"]`); await pause(200); await qFil(); }
  for (const [b, x] of Object.entries(nb)) { await pg.fill(`${Z} [data-fiche-saisie="${b}"]`, String(x)); await pg.keyboard.press('Tab'); await pause(200); await qFil(); }
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil();
}
// Le parcours au tableur : exporter (avec le bon site si l'export a un critère), déposer, puis le compte rendu.
async function tableur(s, o = {}, compte = {}) {
  await exporter(s, o.site === undefined ? (s.T.filtre ? 'Aimargues' : null) : o.site);
  await deposer(s, o);
  if (compte !== null) await proposer(s === S3 ? PLAN : OBJET, compte);
}
const F4 = { liste: { 'zone-CH-ADU-15': 'sol', 'zone-CT-INT-02': 'canal', 'zone-VET-REN-02': 'reserve', 'zone-CH-MIN-08': 'sol', 'zone-CT-KIT-04': 'canal', 'zone-VET-DIG-10': 'reserve' },
  nb: { 'reappro-CT-INT-02': 5, 'reappro-CT-KIT-04': 3 } };
const F5 = { cases: { nonconformes: ['L7124', 'L7203'] }, choix: { cause: 'fifo' }, nb: { 'q-L7124': 0, 'q-L7203': 0, 'q-L7298': 1, 'q-L7312': 3, 'q-L7335': 0 } };
const F6 = { liste: { 'zone-VET-REN-02': 'reserve', 'zone-CT-STE-04': 'canal' }, nb: { 'q-L8011': 0, 'q-L8056': 2, 'q-L8102': 1, 'q-L8140': 0 } };

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-16.x : les six séances se chargent (guidage, entraînement, réunion notée par l’enseignant, guidage, erreur induite, évaluation) ; jalons + questions = 20 ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/royal-canin-ent16${s.n}.js`);
      const Q = await import(`/contenus/questions/ENT-16.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.notation, A.meta.questions, A.meta.pret, A.meta.ouverture],
        total: C.ETAPES.reduce((t, e) => t + e.poids, 0), part: Q.QUESTIONS.part || 0, ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id),
        tableur: !!(C.OPTIONS && C.OPTIONS.tableur) });
    }
    return { out, e: I.ENTREPRISES.find((x) => x.n === 16) };
  }, TOUTES.map(({ id, act, n }) => ({ id, act, n })));
  egal(r.out.map((x) => x.m), [
    ['ENT-16.1', ['tle'], ['C1.6'], 'guidage', 20, undefined, undefined, 'ENT-16.1', true, 'prof'],
    ['ENT-16.2', ['tle'], ['C1.6'], 'entrainement', 20, undefined, undefined, 'ENT-16.2', true, 'prof'],
    ['ENT-16.3', ['tle'], ['C1.6', 'C3.4'], 'entrainement', 20, undefined, 'prof', 'ENT-16.3', true, 'prof'],
    ['ENT-16.4', ['tle'], ['C2.2', 'C3.1'], 'guidage', 20, undefined, undefined, 'ENT-16.4', true, 'prof'],
    ['ENT-16.5', ['tle'], ['C3.1'], 'erreur', 20, undefined, undefined, 'ENT-16.5', true, 'prof'],
    ['ENT-16.6', ['tle'], ['C1.6', 'C2.2', 'C3.1'], 'evaluation', 20, true, undefined, 'ENT-16.6', true, 'prof'],
  ], 'meta');
  egal(r.out.map((x) => x.total + x.part + x.ouvPart), [20, 20, 20, 20, 20, 20], 'jalons + questions');
  egal(r.out.map((x) => x.noter), ['undefined', 'undefined', 'undefined', 'undefined', 'undefined', 'function'], 'noter seulement en évaluation');
  egal(r.out.map((x) => x.tableur), [true, true, true, false, false, true], 'le geste tableur');
  egal(r.out.map((x) => x.reg), [true, true, true, true, true, true], 'au registre');
  egal([r.e.nom, r.e.logo], ['Royal Canin', './contenus/trames/logos/royal-canin.svg'], 'entreprise n° 16');
});

// ─────────────────────────────────────────────────────────── les données
await v('ENT-16.x : les données — octobre (jeu fixe de 16.1) ; l’implantation et ses réappros ; la limite de DDM, le FIFO de Mehdi et le FEFO (valeurs écrites à la main)', () => {
  const I = DN.indicateurs(DN.D161);
  egal(DN.D161.ind.length, 20, 'vingt références');
  egal([I.par['CH-ADU-15'].sm, I.par['CH-ADU-15'].rotation, I.par['CH-ADU-15'].conso, I.par['CH-ADU-15'].couverture], [500, 4, 100, 5], 'CH-ADU-15');
  egal([I.par['CT-INT-02'].couverture, I.par['CH-MIN-08'].couverture, I.par['CH-SEN-12'].couverture, I.par['VET-URI-04'].couverture], [2, 2, 5, 17.5], 'couvertures');
  egal(I.rupture, ['CT-INT-02', 'CH-MIN-08', 'CH-SEN-12'], 'ruptures');
  egal(I.surstock, ['CH-CHI-03', 'VET-REN-02', 'CH-LIG-12', 'VET-URI-04'], 'surstocks');
  egal([I.urgente, I.service], ['CH-MIN-08', 92], 'la plus urgente, le taux de service');
  vrai(!I.rupture.includes('CH-MED-10') && !I.rupture.includes('CT-POI-02'), 'CH-MED-10 (6 j / 5) et CT-POI-02 (5 j / 3) ne sont pas des ruptures');
  egal([DN.zoneDe('CH-ADU-15', 4), DN.zoneDe('CH-MIN-08', 5), DN.zoneDe('CT-INT-02', 5)], ['reserve', 'sol', 'canal'], 'la règle d’implantation');
  egal(DN.implantation(DN.D164), { zones: { 'CH-ADU-15': 'sol', 'CT-INT-02': 'canal', 'VET-REN-02': 'reserve', 'CH-MIN-08': 'sol', 'CT-KIT-04': 'canal', 'VET-DIG-10': 'reserve' },
    reappros: { 'CT-INT-02': 5, 'CT-KIT-04': 3 } }, 'ENT-16.4');
  egal(DN.implantation(DN.D166).zones, { 'VET-REN-02': 'reserve', 'CT-STE-04': 'canal' }, 'ENT-16.6 zones');
  const X5 = DN.preparationExport(DN.D165.export), X6 = DN.preparationExport(DN.D166.export);
  egal([X5.limite, X5.fifo, X5.fifoNonConformes, X5.prises], ['2027-12-01', [['L7124', 2], ['L7203', 2]], ['L7124', 'L7203'], [['L7298', 1], ['L7312', 3]]], 'ENT-16.5');
  egal([X6.limite, X6.nonConformes, X6.prises], ['2027-12-01', ['L8011'], [['L8056', 2], ['L8102', 1]]], 'ENT-16.6 export');
});

await v('ENT-16.x : les tirages (16.2, 16.3, 16.6) sur 300 graines — aucun secours ; 3 ruptures, 4 surstocks, une référence presque en rupture, une seule rupture la plus urgente ; aucune couverture à moins d’une demi-journée d’un seuil', () => {
  for (const s of [S2, S3, S6]) {
    s.T.TIRAGE.lier(s.id);
    let secours = 0;
    for (let i = 0; i < 300; i++) {
      const t = s.T.TIRAGE.tirer(`g${i}|${s.id}`);
      if (t.secours) secours++;
      const L = t.valeurs.mois.lignes;
      egal(L.length, 24, `${s.id} graine ${i} : 24 références`);
      egal(TB.ecartsMois(L, { ruptures: 3, surstocks: 4 }), [], `${s.id} graine ${i}`);
      // Recompté ici, sans le code de la séance : couverture = fin ÷ (sorties ÷ 20).
      const cov = L.map(([r, , fin, sorties]) => [r, fin / (sorties / 20), DN.REF[r].delai]);
      egal(cov.filter(([, c, d]) => c < d).length, 3, `${s.id} graine ${i} : ruptures`);
      egal(cov.filter(([, c]) => c > 15).length, 4, `${s.id} graine ${i} : surstocks`);
      vrai(cov.every(([, c, d]) => Math.abs(c - d) >= 0.5 && Math.abs(c - 15) >= 0.5), `${s.id} graine ${i} : une couverture près d’un seuil`);
      if (s.T.filtre) egal(t.valeurs.cambrai.length, 8, `${s.id} graine ${i} : 8 lignes de Cambrai`);
    }
    egal(secours, 0, `${s.id} : tirages de secours`);
  }
  const a = dbNode(S2, 'eleve-a'), b = dbNode(S2, 'eleve-b'), a2 = dbNode(S2, 'eleve-a');
  vrai(JSON.stringify(S2.T.jeu(a)) !== JSON.stringify(S2.T.jeu(b)), 'deux élèves ont le même jeu');
  egal(JSON.stringify(S2.T.jeu(a)), JSON.stringify(S2.T.jeu(a2)), 'même élève, même jeu');
});

await v('ENT-16.x : les exports — 16.1 : 20 lignes, 7 colonnes, la feuille « Commandes » (taux de service vide) ; 16.2 : la demande = 24 lignes d’Aimargues, « Tous les sites » en montre 32, aucune ligne de Cambrai ne passe la demande', () => {
  const e1 = GT.construireExport(S1.T.TABLEUR.exports[0], {}, {});
  egal(e1.feuilles[0].colonnes, ['Site', 'Référence', 'Produit', 'Stock début', 'Stock fin', 'Sorties', 'Délai (j)'], 'colonnes');
  egal(e1.feuilles[0].lignes.length, 20, 'lignes 16.1');
  egal(e1.feuilles[0].lignes[0], ['Aimargues', 'CH-ADU-15', 'Croquettes chien adulte grande taille, sac 15 kg', 500, 500, 2000, 4], 'première ligne');
  egal(e1.feuilles[1].lignes, [['Lignes commandées', 1250], ['Lignes livrées complètes', 1150], ['Taux de service', null]], 'Commandes');
  vrai(!/rotation|couverture|rupture|surstock/i.test(JSON.stringify(e1.feuilles)), 'l’export donne un indicateur');
  const db = dbNode(S2), exp = S2.T.TABLEUR.exports[0];
  egal(GT.construireExport(exp, db, {}).feuilles[0].lignes.length, 24, 'la demande');
  const tous = GT.construireExport(exp, db, { criteres: { site: GT.TOUS } }).feuilles[0].lignes;
  egal([tous.length, tous.filter((l) => l[0] === 'Cambrai').length], [32, 8], 'tous les sites');
  egal(GT.comparerExport(exp, db, { site: 'Aimargues' }).juste, true, 'Aimargues : juste');
  egal(GT.comparerExport(exp, db, { site: GT.TOUS }).juste, false, 'tous les sites : faux');
  egal(exp.indications, 3, 'entraînement : indications 3');
  egal(S6.T.TABLEUR.exports[0].indications, 4, 'évaluation : indications 4');
});

await v('ENT-16.x : les contrôles du dépôt — un fichier juste passe partout (16.1, 16.2, 16.3, 16.6) ; chaque sabotage ne fait tomber que son contrôle', () => {
  for (const s of [S1, S2, S3, S6]) egal(etat(controler(s, s.T.TIRAGE ? dbNode(s) : {})), TOUS_OK, `${s.id} : fichier juste`);
  const r = controler(S1, {});
  egal(r.filter((x) => x.id !== 'service').map((x) => [x.justes, x.total]), [[20, 20], [20, 20], [20, 20], [20, 20], [20, 20]], 'vingt lignes');
  egal(etat(controler(S1, {}, { couv: 'moyen' })), { ...TOUS_OK, couverture: 'ko', alerte: 'ko' }, 'couverture sur le stock moyen');
  egal(etat(controler(S1, {}, { alerte: 'tape' })), { ...TOUS_OK, alerte: 'ko' }, 'alerte tapée');
  egal(etat(controler(S1, {}, { rotation: 'tape' })), { ...TOUS_OK, rotation: 'ko' }, 'rotation tapée');
  const x = controler(S1, {}, { service: 'x100' });
  egal(etat(x), { ...TOUS_OK, service: 'ko' }, 'service ×100');
  vrai(/sans ×100/.test(x.find((c) => c.id === 'service').libelle), 'le libellé dit « sans ×100 »');
  // Une erreur d'export ne se paie qu'une fois : Cambrai gardé, le fichier se contrôle contre CET export (32 lignes justes).
  const db = dbNode(S2), crit = { site: GT.TOUS };
  const rc = controler(S2, db, { criteres: crit });
  egal(etat(rc), TOUS_OK, 'Cambrai gardé : contrôles justes contre son export');
  egal(rc.find((c) => c.id === 'alerte').total, 32, '32 lignes contrôlées');
});

await v('ENT-16.x : les documents — plus de tableau du mois dans les séances au tableur ; la fiche méthode nomme les cinq colonnes et la fonction SI ; la grille de l’oral fait 20, la forme 3 au plus ; le droit cite L1222-1', async () => {
  const r = await pg.evaluate(async () => {
    const h = (S, id) => { const d = S.DOCUMENTS.find((x) => x.id === id); const e = document.createElement('div'); e.innerHTML = d.html; return e.textContent.replace(/\s+/g, ' '); };
    const C = {};
    for (const n of ['1', '2', '3', '4', '5', '6']) C[n] = await import(`/contenus/royal-canin-ent16${n}.js`);
    return { ids: ['1', '2', '3', '4', '5', '6'].map((n) => C[n].DOCUMENTS.map((d) => d.id)), meth: h(C['1'], 'methode-ind'), meth2: h(C['2'], 'methode-ind'),
      grille: C['3'].GRILLE, droit: h(C['3'], 'droit-reunion'), diapos: h(C['3'], 'diapos'), prep: h(C['5'], 'prep-mehdi'), poste: h(C['1'], 'poste') };
  });
  egal(r.ids, [['poste', 'methode-ind', 'droit'], ['poste', 'methode-ind', 'droit'], ['poste', 'methode-ind', 'diapos', 'grille', 'droit-reunion', 'droit'],
    ['poste', 'flux', 'methode-picking', 'droit'], ['poste', 'commande-export', 'lots', 'prep-mehdi', 'methode-export', 'droit'],
    ['poste', 'methode-ind', 'flux', 'methode-picking', 'commande-export', 'lots', 'methode-export', 'droit']], 'documents');
  for (const c of ['Stock moyen', 'Rotation', 'Conso par jour', 'Couverture', 'Alerte', 'SI', 'Commandes']) vrai(r.meth.includes(c), `la fiche méthode : ${c}`);
  vrai(!/Aimargues/.test(r.meth.split('Dans le tableur')[1]) && /Aimargues/.test(r.meth2.split('Dans le tableur')[1]), 'le site à garder n’est dit qu’en 16.2');
  egal(r.grille.reduce((t, g) => t + g[1], 0), 20, 'la grille fait 20');
  vrai(r.grille.find((g) => g[0] === 'L’oral')[1] <= 3, 'la forme pèse 3 au plus');
  vrai(/L1222-1/.test(r.droit) && /bonne foi/.test(r.droit), 'le droit : L1222-1');
  vrai(/PowerPoint/.test(r.diapos) && /Impress/.test(r.diapos) && /ne le reçoit pas/.test(r.diapos), 'le support : logiciels et rendu hors du site');
  vrai(/L7124/.test(r.prep) && !/non conforme|trop court|erreur/i.test(r.prep), 'la préparation de Mehdi ne dit pas qu’elle est fausse');
  vrai(/Aimargues/.test(r.poste) && /349 454 tonnes/.test(r.poste), 'les faits réels dans « Ton poste »');
});

await v('ENT-16.x : les phrases — dans chaque séance, les trois phrases d’une ligne sont différentes (sur 50 élèves pour les séances tirées) ; 16.1 nomme CH-MIN-08 comme la plus urgente', async () => {
  const out = [];
  const voir = (s, db) => {
    const C = s.C;
    const d = C.VOLET.declencheurs.find((x) => x.id === 'compte' || x.id === 'plan');
    for (const l of d.semer('Léa', db).mails[0].phrases.lignes) if (new Set(l.choix).size !== l.choix.length) out.push(`16.${s.n} ${l.id} : ${l.choix.join(' | ')}`);
  };
  for (const s of TOUTES) {
    s.C = await imp(`contenus/royal-canin-ent16${s.n}.js`);
    if (s.T && s.T.TIRAGE) for (let i = 0; i < 50; i++) voir(s, dbNode(s, 'phr-' + i)); else voir(s, {});
  }
  egal(out, [], 'phrases en double');
  const c1 = S1.C.VOLET.declencheurs.find((x) => x.id === 'compte').semer('Léa', {}).mails[0].phrases.lignes.find((l) => l.id === 'priorite');
  vrai(/CH-MIN-08/.test(c1.choix[0]) && /2 jours de stock pour 4/.test(c1.choix[0]), 'la plus urgente : ' + c1.choix[0]);
});

// ─────────────────────────────────────────────────────────── ENT-16.1
await v('ENT-16.1 : inaction → 0/20 ; un message de Sandrine avec les pièces ; Extractions donne le fichier ; parcours juste → 20/20 et le message de fin', async () => {
  await mont(S1, { sansOuverture: true });
  const n0 = await noter(S1.act);
  egal([n0.score, n0.max], [0, 20], 'note');
  vrai(!Object.values(n0.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n0.detail));
  await mont(S1);
  egal((await entrants()).map((m) => [m.from, m.pieces]), [['Sandrine, responsable de l’entrepôt', ['poste', 'methode-ind']]], 'messages');
  const dl = await exporter(S1);
  egal(dl.suggestedFilename(), 'royal-canin-stock-octobre.xlsx', 'nom du fichier');
  const wb = XL.read(fs.readFileSync(await dl.path()), { type: 'buffer' });
  egal(wb.SheetNames, ['Stock', 'Commandes'], 'feuilles');
  egal(XL.utils.sheet_to_json(wb.Sheets.Stock).length, 20, 'lignes exportées');
  await deposer(S1);
  vrai(/Tout est juste/.test(await texte()) || (await base()).questions, 'retour du dépôt');
  await proposer();
  const n = await noter(S1.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail)); egal(n.max, 20, 'sur');
  egal((await entrants()).map((m) => m.subject), ['Les indicateurs d’octobre', OBJET, 'Merci'], 'messages');
});

await v('ENT-16.1 : sabotages — couverture prise sur le stock moyen (couverture −3 et alerte −3,5) ; alerte tapée sans SI (−3,5) ; compte rendu qui se trompe de rupture urgente (−3) ; questions toutes fausses (−3)', async () => {
  const essai = async (o, compte, tombes, score, quoi) => {
    await mont(S1);
    await tableur(S1, o, compte);
    egal(ko(await detail()), tombes, `${quoi} : jalons tombés`);
    proche((await noter(S1.act)).score, score, `${quoi} : note`);
  };
  await essai({ couv: 'moyen' }, {}, ['couverture', 'alerte'], 13.5, 'couverture sur le stock moyen');
  await essai({ alerte: 'tape' }, {}, ['alerte'], 16.5, 'alerte tapée');
  await essai({}, { priorite: 1 }, ['compte-rendu'], 17, 'compte rendu');
  const sauve = { ...R };
  Object.assign(R, { 'rotation-moitie': 'mieux', 'couverture-delai': 'attendre', 'cout-surstock': 'rien', gaspillage: 'jeter' });
  try { await mont(S1); await tableur(S1); } finally { Object.assign(R, sauve); }
  proche((await noter(S1.act)).score, 16, 'trois fausses (la réflexion ne compte pas)');
});

// ─────────────────────────────────────────────────────────── ENT-16.2
await v('ENT-16.2 : parcours juste (site Aimargues) → 20/20 ; Cambrai gardé à l’export → seul le bon export tombe (−2) ; taux de service ×100 (−1,5)', async () => {
  await mont(S2);
  await tableur(S2);
  proche((await noter(S2.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S2);
  await tableur(S2, { site: GT.TOUS, criteres: { site: GT.TOUS } });
  egal(ko(await detail()), ['export'], 'Cambrai gardé'); proche((await noter(S2.act)).score, 18, 'Cambrai gardé');
  await mont(S2);
  await tableur(S2, { service: 'x100' });
  egal(ko(await detail()), ['service'], 'service ×100'); proche((await noter(S2.act)).score, 18.5, 'service ×100');
});

// ─────────────────────────────────────────────────────────── ENT-16.3
await v('ENT-16.3 : inaction → 0 ; le plan des diapos arrive au dépôt du fichier ; parcours juste → 20/20 (note de préparation) ; décisions dans le mauvais ordre (−3) ; titre qui ne dit rien (−2)', async () => {
  await mont(S3, { sansOuverture: true });
  egal((await noter(S3.act)).score, 0, 'inaction');
  await mont(S3);
  const E0 = await entrants();
  egal(E0.map((m) => [m.subject, m.pieces]), [['Jeudi, c’est toi qui présentes', ['poste', 'methode-ind', 'diapos', 'grille']]], 'message de départ');
  vrai(/PowerPoint/.test(E0[0].text) && /professeur/.test(E0[0].text), 'le message dit le logiciel et qui note');
  await exporter(S3);
  egal((await entrants()).length, 1, 'le plan arrive avant le dépôt');
  await deposer(S3);
  await proposer(PLAN);
  const n = await noter(S3.act);
  proche(n.score, 20, 'parcours juste : ' + JSON.stringify(n.detail));
  egal((await entrants()).map((m) => m.subject), ['Jeudi, c’est toi qui présentes', PLAN, 'À jeudi'], 'messages');
  const db = await base();
  egal(Object.keys(db.questions[S3.id]).filter((k) => ['titre-message', 'texte-diapo', 'question-directeur', 'confidentiel'].includes(k)).length, 4, 'les quatre questions posées');
  await mont(S3);
  await tableur(S3, {}, { decision: 1, titre: 2 });
  egal(ko(await detail()), ['titre', 'decision'], 'titre et ordre'); proche((await noter(S3.act)).score, 15, 'titre et ordre');
});

// ─────────────────────────────────────────────────────────── ENT-16.4
await v('ENT-16.4 : parcours juste → 20/20 ; VET-DIG-10 au sol (−1,5) ; réappros arrondis au-dessous (2) (−2)', async () => {
  await mont(S4);
  await fiche(F4); await proposer();
  proche((await noter(S4.act)).score, 20, 'parcours juste');
  await mont(S4);
  await fiche({ ...F4, liste: { ...F4.liste, 'zone-VET-DIG-10': 'sol' }, nb: { ...F4.nb, 'reappro-CT-KIT-04': 2 } }); await proposer();
  egal(ko(await detail()), ['zone-VET-DIG-10', 'reappro-CT-KIT-04'], 'VET-DIG-10 et arrondi'); proche((await noter(S4.act)).score, 16.5, 'VET-DIG-10 et arrondi');
});

// ─────────────────────────────────────────────────────────── ENT-16.5
await v('ENT-16.5 : parcours juste → 20/20 ; seul L7124 trouvé (−4) ; la préparation de Mehdi recopiée (lots −4, quantités −2) et compte rendu « conforme » (−4)', async () => {
  await mont(S5);
  await fiche(F5); await proposer();
  proche((await noter(S5.act)).score, 20, 'parcours juste');
  await mont(S5);
  await fiche({ ...F5, cases: { nonconformes: ['L7124'] } }); await proposer();
  egal(ko(await detail()), ['nonconformes'], 'seul L7124'); proche((await noter(S5.act)).score, 16, 'seul L7124');
  await mont(S5);
  await fiche({ ...F5, nb: { 'q-L7124': 2, 'q-L7203': 2, 'q-L7298': 0, 'q-L7312': 0, 'q-L7335': 0 } }); await proposer(OBJET, { erreur: 1, export: 1 });
  egal(ko(await detail()), ['lots', 'quantites', 'compte-rendu'], 'FIFO recopié'); proche((await noter(S5.act)).score, 10, 'FIFO recopié');
});

// ─────────────────────────────────────────────────────────── ENT-16.6 (copie rendue)
await v('ENT-16.6 : « Avant de commencer » noté (3) ; inaction → 3 ; le compte rendu attend la fiche ET le fichier ; parcours juste → 20/20 ; dépôt unique « Fichier reçu » ; alerte tapée, CT-STE-04 au sol et lot pris en FIFO → 10', async () => {
  await mont(S6);
  let n = await noter(S6.act);
  proche(n.score, 3, 'ouverture seule : ' + JSON.stringify(n.detail));
  vrai(!Object.entries(n.detail).some(([k, x]) => k !== 'ouverture' && x === 'ok'), 'un jalon juste sans rien faire');
  await fiche(F6);
  vrai(!(await entrants()).some((m) => m.subject === OBJET), 'le compte rendu arrive avant le dépôt du fichier');
  await tableur(S6, {}, null);
  vrai(/Fichier reçu/.test(await texte()), 'retour d’évaluation');
  vrai(!(await pg.$('#fichierTableur')), 'second dépôt possible');
  await proposer();
  n = await noter(S6.act);
  proche(n.score, 20, 'parcours juste : ' + JSON.stringify(n.detail));
  await mont(S6);
  await fiche({ ...F6, liste: { ...F6.liste, 'zone-CT-STE-04': 'sol' }, nb: { ...F6.nb, 'q-L8011': 1, 'q-L8056': 2, 'q-L8102': 0 } });
  await tableur(S6, { alerte: 'tape' }, { export: 1 });
  egal(ko(await detail()), ['alerte', 'zone-CT-STE-04', 'lots', 'quantites', 'compte-rendu'], 'alerte, sol et FIFO');
  proche((await noter(S6.act)).score, 10, 'alerte, sol et FIFO');
});

await v('ENT-16.x : le corrigé de chaque séance se charge ; celui d’un élève donne ses 24 références (séances tirées)', async () => {
  const r = await pg.evaluate(async () => {
    const out = [];
    for (const n of ['1', '2', '3', '4', '5', '6']) { const C = await import(`/contenus/corriges/ENT-16.${n}.js`); out.push([C.CORRIGE.code, C.CORRIGE.items.length > 0, C.corrigeEleve({}).items.length]); }
    return out;
  });
  egal(r, [['ENT-16.1', true, 0], ['ENT-16.2', true, 26], ['ENT-16.3', true, 26], ['ENT-16.4', true, 0], ['ENT-16.5', true, 0], ['ENT-16.6', true, 26]], 'corrigés');
});

await v('ENT-16.x : aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  vrai(P.hotes.size === 0, 'hôtes extérieurs : ' + [...P.hotes].join(', '));
  vrai(P.erreurs.length === 0, 'erreurs : ' + P.erreurs.join(' | '));
});

}
