// Suite de tests de Prepalog — bloc `ramasse` : la tournée dont la charge MONTE ET DESCEND (chantier
// MOTEUR-chep lot A, brief `docs/briefs/MOTEUR-chep-ramasse-et-piles.md` §2, 18/10/2026).
//
// Deux montages. Le premier, SANS carte (une tournée sans plan : seuls les cumuls jouent), éprouve le
// moteur seul : profil de charge, pic, dépassement dit sans « de combien », report d'un arrêt, borne du
// quai, gestes publiés, ouverture conditionnelle, et le cas d'origine du lot 4 (on part plein, on dépose,
// on reprend). Le second, SUR LA CARTE DU NORD (`contenus/chep-carte.js`), éprouve les km, les horaires et
// l'accord du calage (`outils/carte/calibrer.mjs`, mode ramasse) avec la vue. Entre les deux, « points par élève »
// (chantier MOTEUR-tournee-points-par-eleve, 18/10/2026) : `points: (db) => […]`, dans une page à part.
//
// VALEURS ÉCRITES À LA MAIN (le code les calcule, le test les écrit) :
// - ramasse : A 140, B 120, C 95, D 70 palettes vides, camion de 390, départ à vide.
//   Tout prendre dans l'ordre A B C D → profil 0 → 140 → 260 → 355 → 425 : pic 425, dépasse.
//   Sans D → 0 → 140 → 260 → 355 : pic 355, tient. Sans A → 0 → 120 → 215 → 285 : pic 285.
// - lot 4 : X 6 pleins / 8 vides, Y 5 / 1, Z 3 / 1, 14 places. Départ = somme des pleins = 14.
//   X Y Z → 14 → 16 → 12 → 10 : pic 16 (après X), dépasse. Y Z X → 14 → 10 → 8 → 10 : pic 14, tient.

import { execFileSync } from 'node:child_process';
import path from 'node:path';

export default async function bloc({ v, nav, BASE, ROOT, egal, vrai }) {

const ctxR = await nav.newContext();
const pg = await ctxR.newPage();
pg.setDefaultTimeout(8000);
const erreurs = [];
pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });

// ── Le montage sans carte ────────────────────────────────────────────────────────────────────
await pg.evaluate(async () => {
  const m = await import('/core/types/entreprise.js');
  const t = await import('/core/types/tournee.js');
  const dec = await import('/core/declencheurs.js');
  const SITES = [
    { id: 'A', nom: 'Site A', vides: 140 }, { id: 'B', nom: 'Site B', vides: 120 },
    { id: 'C', nom: 'Site C', vides: 95 }, { id: 'D', nom: 'Site D', vides: 70 },
  ];
  const MESURE = { id: 'vides', libelle: 'Palettes vides à bord', unite: 'palettes', max: 390, depart: 0, reprend: 'vides',
    libelleDepasse: 'Le camion ne peut pas tout prendre' };
  const RAMASSE = (o = {}) => Object.assign({
    id: 'essai-ramasse', libelle: 'Ramasse', titre: 'Ramasse d\'essai', points: SITES,
    mesures: [MESURE], departAQuai: true, exigeConforme: true,
    quai: { libelle: 'Reporter à vendredi', titre: 'Reportés à la tournée de vendredi', reprendre: 'remettre dans la tournée',
      vide: 'Aucun : tous les sites sont dans la tournée.', max: 1 },
    report: [{ id: 'pic', libelle: 'Au plus, à bord', unite: 'palettes', valeur: (b) => b.pics.vides }],
  }, o);
  const base = () => ({ v: 1, seq: 1, stock: {}, mails: [], orders: [], receptions: [], moves: [], customers: [], suppliers: [], _depart: [] });
  const commun = {
    ENTREPRISE: { nom: 'Essai Ramasse', sousTitre: 'scénario d\'essai' },
    VOCAB: { unit: 'pièce', unitPl: 'pièces', sizeLabel: 'Taille' },
    CATALOGUE: { MODELS: [], MM: {}, VARIANTS: [], VM: {} }, SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {},
    baseDeDepart: base, THEME: {},
  };
  const monter = (hoteId, extra, metaId, role, db) => {
    const hote = document.createElement('div');
    hote.id = hoteId;
    document.body.appendChild(hote);
    db = db || {};
    const act = m.creerEntreprise(Object.assign({}, commun, { etapes: [] }, extra));
    act.rendre(hote, {
      meta: { id: metaId, portee: 'eleve', code: 'ESS-R', titre: 'Essai ramasse' },
      profil: { prenom: 'Léa', nom: 'Dupont', role: role || 'eleve' },
      jeu: { etat: () => db, sauver: () => {} },
      enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
    });
    return { db, hote };
  };
  const parlante = monter('ramParlante', { tournee: RAMASSE() }, 'ess-ram');
  const muette = monter('ramMuette', { tournee: RAMASSE({ jaugesRepere: true }) }, 'ess-ram-muette');
  // Ouverture conditionnelle : la tournée ne paraît qu'une fois `db.feu` posé ; l'enseignant la voit toujours.
  const dbQ = {};
  const quand = monter('ramQuand', { tournee: RAMASSE({ quand: (db) => !!db.feu }) }, 'ess-ram-quand', 'eleve', dbQ);
  const quandProf = monter('ramQuandProf', { tournee: RAMASSE({ quand: (db) => !!db.feu }) }, 'ess-ram-quand', 'prof', {});
  // Le bilan pur, sans écran : la vue elle-même.
  const vue = t.creerTournee(RAMASSE());
  const LOT4 = t.creerTournee({ id: 'lot4', points: [
    { id: 'X', nom: 'X', pleins: 6, vides: 8 }, { id: 'Y', nom: 'Y', pleins: 5, vides: 1 }, { id: 'Z', nom: 'Z', pleins: 3, vides: 1 }],
    mesures: [{ id: 'place', libelle: 'Places au sol', unite: 'pal.', max: 14, depart: 'somme', depose: 'pleins', reprend: 'vides' }] });
  // Un geste connu passe à la création ; un geste inconnu refuse la séance.
  let connu = null, inconnu = null;
  try { m.creerEntreprise(Object.assign({}, commun, { etapes: [], tournee: RAMASSE(),
    volet: { declencheurs: [{ id: 'fin', quand: dec.apresGeste('tournee:essai-ramasse:envoyer'), semer: () => ({ mails: [] }) }] } })); connu = 'ok'; }
  catch (e) { connu = e.message; }
  try { m.creerEntreprise(Object.assign({}, commun, { etapes: [], tournee: RAMASSE(),
    volet: { declencheurs: [{ id: 'fin', quand: dec.apresGeste('tournee:autre:envoyer'), semer: () => ({ mails: [] }) }] } })); inconnu = 'passe'; }
  catch (e) { inconnu = e.message; }
  // Sans quai : `reporter` n'est pas publié, donc une question qui l'attend refuse la séance.
  let sansQuai = null;
  try { m.creerEntreprise(Object.assign({}, commun, { etapes: [], tournee: RAMASSE({ quai: false }),
    volet: { declencheurs: [{ id: 'r', quand: dec.apresGeste('tournee:essai-ramasse:reporter'), semer: () => ({ mails: [] }) }] } })); sansQuai = 'passe'; }
  catch (e) { sansQuai = e.message; }
  window.__ram = { parlante, muette, quand, quandProf, dbQ, vue, LOT4, connu, inconnu, sansQuai };
});

const etatVide = (ordre, quai) => ({ ordre, quai, report: {}, juge: {}, valide: null });
const bilan = (ordre, quai = []) => pg.evaluate(({ ordre, quai }) => {
  const b = window.__ram.vue.bilan({ ordre, quai, report: {}, juge: {}, valide: null });
  return { profil: b.profils.vides, pic: b.pics.vides, cumul: b.cumuls.vides, depasse: b.depassements, charges: b.charges.vides, reportes: b.reportes, trop: b.reportesTrop };
}, { ordre, quai });

await v('ramasse : le profil part de 0 et monte à chaque arrêt ; le pic compte (A B C D → 425, dépasse)', async () => {
  const b = await bilan(['A', 'B', 'C', 'D']);
  egal(b.profil, [0, 140, 260, 355, 425], 'profil');
  egal(b.pic, 425, 'pic'); egal(b.cumul, 425, 'cumul = pic');
  egal(b.depasse, ['vides'], 'dépassement');
  egal(b.charges, { A: 140, B: 260, C: 355, D: 425 }, 'charge après chaque arrêt');
  egal(b.reportes, [], 'rien de reporté');
});

await v('ramasse : un arrêt reporté ne compte plus (sans D → pic 355 ; sans A → 285) ; deux reportés = trop (max 1)', async () => {
  const b = await bilan(['A', 'B', 'C'], ['D']);
  egal(b.profil, [0, 140, 260, 355], 'profil sans D'); egal(b.pic, 355, 'pic'); egal(b.depasse, [], 'tient');
  egal(b.reportes, ['D'], 'reportés'); egal(b.trop, false, 'un seul reporté');
  const c = await bilan(['B', 'C', 'D'], ['A']);
  egal(c.profil, [0, 120, 215, 285], 'profil sans A');
  const d = await bilan(['A', 'B'], ['C', 'D']);
  egal(d.trop, true, 'deux reportés dépassent la borne');
});

await v('lot 4 : on part plein (somme des pleins), on dépose puis on reprend ; le gros retour placé tôt dépasse, placé tard il tient', async () => {
  const r = await pg.evaluate(() => {
    const L = window.__ram.LOT4;
    const b1 = L.bilan({ ordre: ['X', 'Y', 'Z'], quai: [], report: {}, juge: {}, valide: null });
    const b2 = L.bilan({ ordre: ['Y', 'Z', 'X'], quai: [], report: {}, juge: {}, valide: null });
    return { p1: b1.profils.place, pic1: b1.pics.place, d1: b1.depassements, p2: b2.profils.place, pic2: b2.pics.place, d2: b2.depassements, cumul2: b2.cumuls.place };
  });
  egal(r.p1, [14, 16, 12, 10], 'X Y Z'); egal(r.pic1, 16, 'pic tôt'); egal(r.d1, ['place'], 'dépasse');
  egal(r.p2, [14, 10, 8, 10], 'Y Z X'); egal(r.pic2, 14, 'pic tard'); egal(r.d2, [], 'tient'); egal(r.cumul2, 14, 'cumul = pic');
});

const z = '#ramParlante';
const charger = async (id, zone = z) => { await pg.click(`${zone} [data-reprendre="${id}"]`); await pg.waitForTimeout(60); };
// L'activité s'ouvre sur l'accueil : on va à la tournée par le menu, comme l'élève.
const ouvrir = async (zone) => { await pg.click(`${zone} .ent-nav[data-vue="tournee"]`); await pg.waitForTimeout(80); };

await v('ramasse à l’écran : à vide, la ligne d’un site dit ce qu’il y a à reprendre ; tout prendre dessine le profil en marches, le pic en tête, la dernière marche en rouge', async () => {
  await ouvrir(z);
  const t0 = await pg.textContent(`${z} .tour-quai`);
  vrai(/140 palettes à reprendre/.test(t0), 'la puce du site A ne dit pas « 140 palettes à reprendre » : ' + t0.slice(0, 200));
  vrai(/Reportés à la tournée de vendredi \(4\)/.test(t0), 'le titre du quai n’est pas celui déclaré : ' + t0.slice(0, 120));
  for (const id of ['A', 'B', 'C', 'D']) await charger(id);
  const j = await pg.$eval(`${z} [data-tour-profil="vides"]`, (e) => ({
    texte: e.textContent, tete: e.querySelector('.tour-j-tete b').textContent, trop: e.classList.contains('trop'),
    marches: [...e.querySelectorAll('.tour-j-marche')].map((x) => ({ h: parseFloat(x.style.height), trop: x.classList.contains('trop'), titre: x.getAttribute('title') })),
    plafond: !!e.querySelector('.tour-j-plafond'), pastille: (e.querySelector('.pastille') || {}).textContent || '',
  }));
  egal(j.marches.length, 5, 'cinq marches (départ + quatre arrêts)');
  egal(j.marches.map((x) => x.trop), [false, false, false, false, true], 'seule la dernière marche dépasse');
  vrai(j.marches[0].h < j.marches[1].h && j.marches[3].h < j.marches[4].h, 'les marches ne montent pas');
  egal(j.marches[4].titre, 'après Site D : 425 palettes', 'le titre de la dernière marche');
  vrai(/425\s*\/\s*390 palettes/.test(j.tete.replace(/ /g, ' ')), 'la tête ne dit pas « 425 / 390 palettes » : ' + j.tete);
  vrai(j.trop && j.plafond, 'jauge rouge avec son trait de plafond');
  egal(j.pastille, 'Le camion ne peut pas tout prendre', 'la pastille');
  vrai(!/dépassée de/.test(j.texte) && !/\b35 palettes/.test(j.texte), 'la jauge dit de combien : ' + j.texte);
  const ligne = await pg.textContent(`${z} #tourListe`);
  vrai(/Reporter à vendredi/.test(ligne), 'le bouton de la ligne n’est pas « Reporter à vendredi »');
  vrai(/Aucun : tous les sites sont dans la tournée\./.test(await pg.textContent(`${z} .tour-quai`)), 'la phrase du quai vide n’est pas celle déclarée');
});

await v('ramasse à l’écran : valider avec un dépassement est refusé en disant QUE, pas de combien ; reporter D fait tenir, le geste « reporter » est rangé', async () => {
  await pg.fill(`${z} [data-report="pic"]`, '425');
  await pg.click(`${z} [data-tour-valider]`);
  await pg.waitForTimeout(80);
  const refus = await pg.textContent(`${z} .tour-report .avis-err`);
  vrai(/le camion ne peut pas tout prendre/.test(refus) && !/dépassée de|de 35/.test(refus), 'le refus : ' + refus);
  let g = await pg.evaluate(() => Object.keys((window.__ram.parlante.db.gestes || {})['ess-ram'] || {}));
  egal(g, [], 'un report refusé n’est pas un envoi');
  await pg.click(`${z} [data-quai="D"]`);
  await pg.waitForTimeout(60);
  const j = await pg.$eval(`${z} [data-tour-profil="vides"]`, (e) => ({ trop: e.classList.contains('trop'), n: e.querySelectorAll('.tour-j-marche').length, tete: e.querySelector('.tour-j-tete b').textContent }));
  egal(j.trop, false, 'la jauge est encore rouge'); egal(j.n, 4, 'quatre marches');
  vrai(/355/.test(j.tete), 'le pic n’est pas 355 : ' + j.tete);
  const q = await pg.textContent(`${z} .tour-quai`);
  vrai(/Reportés à la tournée de vendredi \(1\)/.test(q) && /remettre dans la tournée/.test(q), 'le quai après report : ' + q.slice(0, 200));
  g = await pg.evaluate(() => Object.keys((window.__ram.parlante.db.gestes || {})['ess-ram'] || {}));
  egal(g, ['tournee:essai-ramasse:reporter'], 'le geste « reporter »');
});

await v('ramasse à l’écran : deux reportés sont refusés (« 1 au plus ») ; un seul, le report est jugé et le geste « envoyer » part', async () => {
  await pg.click(`${z} [data-quai="C"]`);
  await pg.waitForTimeout(60);
  await pg.fill(`${z} [data-report="pic"]`, '260');
  await pg.click(`${z} [data-tour-valider]`);
  await pg.waitForTimeout(80);
  const refus = await pg.textContent(`${z} .tour-report .avis-err`);
  vrai(/2 arrêts reportés : 1 au plus/.test(refus), 'le refus de deux reportés : ' + refus);
  let g = await pg.evaluate(() => Object.keys(window.__ram.parlante.db.gestes['ess-ram']));
  vrai(!g.includes('tournee:essai-ramasse:envoyer'), 'un report refusé a publié « envoyer »');
  await charger('C');
  await pg.fill(`${z} [data-report="pic"]`, '355');
  await pg.click(`${z} [data-tour-valider]`);
  await pg.waitForTimeout(80);
  const juste = await pg.$$eval(`${z} .tour-case .pastille.ok`, (e) => e.length);
  egal(juste, 1, 'le pic reporté (355) est juste');
  g = await pg.evaluate(() => Object.keys(window.__ram.parlante.db.gestes['ess-ram']).sort());
  egal(g, ['tournee:essai-ramasse:envoyer', 'tournee:essai-ramasse:reporter'], 'les deux gestes');
});

await v('ramasse muette (jaugesRepere) : le repère ne dit ni le pic ni le profil, seulement QUE le camion ne peut pas tout prendre', async () => {
  const zm = '#ramMuette';
  await ouvrir(zm);
  for (const id of ['A', 'B', 'C', 'D']) await charger(id, zm);
  const j = await pg.$eval(`${zm} .tour-jauge-repere`, (e) => ({ texte: e.textContent, marches: e.querySelectorAll('.tour-j-marche').length, trop: e.classList.contains('trop') }));
  egal(j.marches, 0, 'un repère dessine le profil');
  vrai(!/425|355|260|140/.test(j.texte), 'le repère donne une charge : ' + j.texte);
  vrai(/max 390 palettes/.test(j.texte.replace(/ /g, ' ')) && /à aucun moment de la tournée/.test(j.texte), 'le repère ne dit pas la limite : ' + j.texte);
  vrai(j.trop && /Le camion ne peut pas tout prendre/.test(j.texte) && !/dépassée de/.test(j.texte), 'le repère ne dit pas (ou dit trop) le dépassement : ' + j.texte);
  await pg.click(`${zm} [data-quai="D"]`);
  await pg.waitForTimeout(60);
  const apres = await pg.$eval(`${zm} .tour-jauge-repere`, (e) => ({ trop: e.classList.contains('trop'), pastille: !!e.querySelector('.pastille.crit') }));
  egal(apres, { trop: false, pastille: false }, 'après le report, le repère se tait');
});

await v('ramasse : la tournée à `quand` reste hors du menu tant que la condition est fausse ; l’enseignant la voit toujours', async () => {
  const zq = '#ramQuand';
  egal(await pg.$$eval(`${zq} .ent-nav[data-vue="tournee"]`, (e) => e.length), 0, 'la tournée est au menu avant la condition');
  egal(await pg.$$eval('#ramQuandProf .ent-nav[data-vue="tournee"]', (e) => e.length), 1, 'l’enseignant ne la voit pas');
  await pg.evaluate(() => { window.__ram.dbQ.feu = true; });
  await pg.click(`${zq} .ent-nav[data-vue="accueil"]`);
  await pg.waitForTimeout(60);
  egal(await pg.$$eval(`${zq} .ent-nav[data-vue="tournee"]`, (e) => e.length), 1, 'la tournée n’apparaît pas une fois la condition vraie');
  await pg.click(`${zq} .ent-nav[data-vue="tournee"]`);
  await pg.waitForTimeout(60);
  vrai(/Ramasse d'essai/.test(await pg.textContent(zq)), 'la tournée ne s’ouvre pas');
});

await v('ramasse : les gestes sont publiés (connu à la création, inconnu refusé, « reporter » absent sans quai)', async () => {
  const r = await pg.evaluate(() => ({ connu: window.__ram.connu, inconnu: window.__ram.inconnu, sansQuai: window.__ram.sansQuai }));
  egal(r.connu, 'ok', 'un geste connu refuse la séance : ' + r.connu);
  vrai(/geste inconnu « tournee:autre:envoyer »/.test(r.inconnu), 'un geste inconnu passe : ' + r.inconnu);
  vrai(/geste inconnu « tournee:essai-ramasse:reporter »/.test(r.sansQuai), 'sans quai, « reporter » est publié : ' + r.sansQuai);
});

// ── Points par élève (chantier MOTEUR-tournee-points-par-eleve, 18/10/2026) ─────────────────────
// `points: (db) => […]` : mêmes sites pour tous, valeurs lues dans la base de l'élève. Une page à part, pour
// que les erreurs ATTENDUES (fonction qui plante, signalée dans la console) ne se mêlent pas à celles du bloc.
// VALEURS ÉCRITES À LA MAIN, plan en ligne droite (1 km entre dépôt, A, B, C, D ; 4 km de D au retour), 60 km/h
// (1 min par km), départ 6 h, service 10 min + 0,2 min par palette :
// - base vide (A 140, B 120, C 95, D 70) : services 38, 34, 29, 24 = 125 ; arrivées A 6 h 01 (361), B 400, C 435,
//   D 465 ; retour 360 + 8 + 125 = 493 (08 h 13) ; pic 425.
// - base { essai: { vides: { A: 200 } } } : service A = 50 ; arrivées A 361, B 412, C 447, D 477 ; retour 505
//   (08 h 25) ; pic 485. Sans D : 0 → 200 → 320 → 415, dépasse 390 (en base vide, 355 tient).
const pp = await ctxR.newPage();
pp.setDefaultTimeout(8000);
const erreursP = [];
pp.on('pageerror', (e) => erreursP.push('PAGEERROR: ' + e.message));
pp.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursP.push(m.text()); });
await pp.goto(BASE);
await pp.waitForSelector('#btnProf', { timeout: 8000 });
await pp.evaluate(async () => {
  const m = await import('/core/types/entreprise.js');
  const t = await import('/core/types/tournee.js');
  const SITES = [
    { id: 'A', nom: 'Site A', vides: 140, x: 120, y: 60 }, { id: 'B', nom: 'Site B', vides: 120, x: 180, y: 60 },
    { id: 'C', nom: 'Site C', vides: 95, x: 240, y: 60 }, { id: 'D', nom: 'Site D', vides: 70, x: 300, y: 60 },
  ];
  const MESURE = { id: 'vides', libelle: 'Palettes vides à bord', unite: 'palettes', max: 390, depart: 0, reprend: 'vides',
    libelleDepasse: 'Le camion ne peut pas tout prendre' };
  const RAMASSE = (o = {}) => Object.assign({
    id: 'essai-ramasse', libelle: 'Ramasse', titre: 'Ramasse d\'essai', points: SITES,
    mesures: [MESURE], departAQuai: true, exigeConforme: true,
    quai: { libelle: 'Reporter à vendredi', titre: 'Reportés à la tournée de vendredi', reprendre: 'remettre dans la tournée',
      vide: 'Aucun : tous les sites sont dans la tournée.', max: 1 },
    report: [{ id: 'pic', libelle: 'Au plus, à bord', unite: 'palettes', valeur: (b) => b.pics.vides }],
  }, o);
  // La fonction de la base du brief : les vides d'un site sont tirés dans `db.essai.vides`, sinon ceux du plan.
  const TIRE = (db) => SITES.map((s) => ({ ...s, vides: (db.essai && db.essai.vides && db.essai.vides[s.id]) || s.vides }));
  const PLAN = { largeur: 400, hauteur: 120, grille: { colonnes: 'ABCD', lignes: 2 }, echelle: { pixels: 60, libelle: '1 km' },
    depart: { nom: 'Dépôt', x: 60, y: 60 }, arrivee: { nom: 'Retour au dépôt', x: 60, y: 60 }, points: SITES };
  const HORAIRE = { depart: 6 * 60, vitesse: 60, service: { base: 10, parColis: 0.2, champ: 'vides', unite: 'palette' } };
  const commun = {
    ENTREPRISE: { nom: 'Essai Points', sousTitre: 'scénario d\'essai' },
    VOCAB: { unit: 'pièce', unitPl: 'pièces', sizeLabel: 'Taille' },
    CATALOGUE: { MODELS: [], MM: {}, VARIANTS: [], VM: {} }, SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {}, THEME: {},
    baseDeDepart: () => ({ v: 1, seq: 1, stock: {}, mails: [], orders: [], receptions: [], moves: [], customers: [], suppliers: [], _depart: [] }),
  };
  const monter = (hoteId, tournee, metaId, db) => {
    const hote = document.createElement('div');
    hote.id = hoteId;
    document.body.appendChild(hote);
    const act = m.creerEntreprise(Object.assign({}, commun, { etapes: [], tournee }));
    act.rendre(hote, {
      meta: { id: metaId, portee: 'eleve', code: 'ESS-P', titre: 'Essai points' },
      profil: { prenom: 'Léa', nom: 'Dupont', role: 'eleve' },
      jeu: { etat: () => db, sauver: () => {} },
      enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC',
    });
    return db;
  };
  const etat = (ordre, quai) => ({ ordre, quai, report: {}, juge: {}, valide: null });
  // Un dessin dans un bloc à part, pour le lire comme l'écran.
  const dessin = (V, e, db) => { const d = document.createElement('div'); d.innerHTML = V.html(e, { db }); return d; };
  window.__pts = { m, t, SITES, RAMASSE, TIRE, PLAN, HORAIRE, commun, monter, etat, dessin };
});
const ouvrirP = async (zone) => { await pp.click(`${zone} .ent-nav[data-vue="tournee"]`); await pp.waitForTimeout(80); };
const accueilP = async (zone) => { await pp.click(`${zone} .ent-nav[data-vue="accueil"]`); await pp.waitForTimeout(60); };

await v('points par élève (1) : une fonction qui rend la liste fixe donne le même bilan et le même écran que la liste fixe (425, 355, rien de reporté)', async () => {
  const r = await pp.evaluate(() => {
    const { t, RAMASSE, SITES, etat } = window.__pts;
    const fixe = t.creerTournee(RAMASSE());
    const fn = t.creerTournee(RAMASSE({ points: () => SITES }));
    const lire = (V, ordre, quai) => {
      const b = V.bilan(etat(ordre, quai));
      return { profil: b.profils.vides, pic: b.pics.vides, charges: b.charges.vides, retenus: b.retenus.map((p) => p.id),
        ecartes: b.ecartes.map((p) => p.id), reportes: b.reportes, depasse: b.depassements, points: b.points.map((p) => p.id) };
    };
    const e = etat(['A', 'B', 'C'], ['D']);
    return { fixe: lire(fixe, ['A', 'B', 'C', 'D'], []), fn: lire(fn, ['A', 'B', 'C', 'D'], []), fnSansD: lire(fn, ['A', 'B', 'C'], ['D']),
      ecranVide: fixe.html({}) === fn.html({}), ecranCharge: fixe.html(e) === fn.html(e), aVide: /140 palettes à reprendre/.test(fn.html({})) };
  });
  egal(r.fixe.profil, [0, 140, 260, 355, 425], 'liste fixe : profil');
  egal(r.fn.profil, [0, 140, 260, 355, 425], 'fonction : profil');
  egal(r.fn.pic, 425, 'fonction : pic'); egal(r.fn.depasse, ['vides'], 'fonction : dépassement');
  egal(r.fn.charges, { A: 140, B: 260, C: 355, D: 425 }, 'fonction : charge après chaque arrêt');
  egal(r.fn.retenus, ['A', 'B', 'C', 'D'], 'fonction : retenus'); egal(r.fn.reportes, [], 'fonction : rien de reporté');
  egal(r.fn.points, ['A', 'B', 'C', 'D'], 'fonction : points du bilan');
  egal(r.fnSansD.pic, 355, 'fonction sans D : pic'); egal(r.fnSansD.ecartes, ['D'], 'fonction sans D : écartés'); egal(r.fnSansD.depasse, [], 'fonction sans D : tient');
  egal(r.fn, r.fixe, 'fonction et liste fixe : bilans différents');
  vrai(r.ecranVide && r.ecranCharge, 'l’écran d’une fonction qui rend la liste fixe n’est pas celui de la liste fixe');
  vrai(r.aVide, 'à l’ouverture, tout n’est pas à quai avec ses 140 palettes');
});

await v('points par élève (2) : deux bases, deux résultats — pic 425 → 485, retour 08 h 13 → 08 h 25, la liste dit « 200 », les marqueurs du plan ne bougent pas', async () => {
  const r = await pp.evaluate(() => {
    const { t, RAMASSE, TIRE, PLAN, HORAIRE, etat, dessin } = window.__pts;
    const V = t.creerTournee(RAMASSE({ plan: PLAN, points: TIRE, horaire: HORAIRE }));
    const e = etat(['A', 'B', 'C', 'D'], []);
    const dbs = [{}, { essai: { vides: { A: 200 } } }];
    const lire = (db) => {
      const b = V.bilan(e, db);
      const d = dessin(V, e, db);
      return { pic: b.pics.vides, km: Math.round(b.km * 100) / 100, retour: Math.round(b.arrivee),
        arrivees: Object.fromEntries(Object.entries(b.arrivees).map(([k, x]) => [k, Math.round(x)])),
        liste: d.querySelector('#tourListe').textContent.replace(/\s+/g, ' '),
        tete: d.querySelector('[data-tour-profil="vides"] .tour-j-tete b').textContent.replace(/\s+/g, ' '),
        horaire: [...d.querySelectorAll('.tour-jauge')].map((j) => j.textContent).join(' ').replace(/\s+/g, ' '),
        plan: d.querySelector('.plan-boite').innerHTML };
    };
    return dbs.map(lire);
  });
  const [a, b] = r;
  egal(a.pic, 425, 'base vide : pic'); egal(b.pic, 485, 'base tirée : pic');
  egal(a.km, 8, 'base vide : km'); egal(b.km, 8, 'base tirée : km');
  egal(a.retour, 493, 'base vide : retour (8 h 13)'); egal(b.retour, 505, 'base tirée : retour (8 h 25)');
  egal(a.arrivees, { A: 361, B: 400, C: 435, D: 465 }, 'base vide : arrivées');
  egal(b.arrivees, { A: 361, B: 412, C: 447, D: 477 }, 'base tirée : arrivées');
  vrai(/140 palettes à reprendre/.test(a.liste) && !/200 palettes/.test(a.liste), 'base vide : la liste : ' + a.liste.slice(0, 200));
  vrai(/200 palettes à reprendre/.test(b.liste) && !/140 palettes/.test(b.liste), 'base tirée : la liste ne dit pas « 200 » : ' + b.liste.slice(0, 200));
  vrai(/425 \/ 390/.test(a.tete.replace(/ /g, ' ')) && /485 \/ 390/.test(b.tete.replace(/ /g, ' ')), 'têtes de jauge : ' + a.tete + ' | ' + b.tete);
  vrai(/08 h 13/.test(a.horaire) && /08 h 25/.test(b.horaire), 'heure de retour à l’écran : ' + a.horaire.slice(0, 160) + ' | ' + b.horaire.slice(0, 160));
  vrai(a.plan.length > 500 && a.plan === b.plan, 'le plan (marqueurs, noms, numéros) change avec la base');
});

await v('points par élève (3) : dans une séance montée, la base change entre deux dessins et l’écran suit sans rien rouvrir ; le refus du report lit la même base', async () => {
  const z3 = '#ptsRelu';
  await pp.evaluate(() => {
    const { RAMASSE, TIRE, monter } = window.__pts;
    window.__pts.dbRelu = monter('ptsRelu', RAMASSE({ id: 'essai-relu', points: TIRE }), 'ess-pts-relu', {});
  });
  await ouvrirP(z3);
  const avant = await pp.textContent(`${z3} .tour-quai`);
  vrai(/140 palettes à reprendre/.test(avant), 'avant le tirage, le site A n’a pas 140 palettes : ' + avant.slice(0, 200));
  // Le tirage arrive dans la base (comme après « Réinitialiser ») : le geste suivant redessine, rien n'est rouvert.
  await pp.evaluate(() => { window.__pts.dbRelu.essai = { vides: { A: 200 } }; });
  await pp.click(`${z3} [data-reprendre="A"]`); await pp.waitForTimeout(60);
  const ligne = await pp.textContent(`${z3} #tourListe`);
  vrai(/200 palettes à reprendre/.test(ligne) && !/140 palettes/.test(ligne), 'après le tirage, la ligne de A : ' + ligne.slice(0, 200));
  for (const id of ['B', 'C']) { await pp.click(`${z3} [data-reprendre="${id}"]`); await pp.waitForTimeout(60); }
  const tete = await pp.textContent(`${z3} [data-tour-profil="vides"] .tour-j-tete b`);
  vrai(/415\s*\/\s*390/.test(tete.replace(/ /g, ' ')), 'A B C avec A = 200 : la tête ne dit pas 415 / 390 : ' + tete);
  // En base vide, A B C tiendrait (355) : le refus prouve que la validation lit la base de l'élève.
  await pp.fill(`${z3} [data-report="pic"]`, '415');
  await pp.click(`${z3} [data-tour-valider]`); await pp.waitForTimeout(80);
  const refus = await pp.textContent(`${z3} .tour-report .avis-err`).catch(() => '');
  vrai(/le camion ne peut pas tout prendre/.test(refus), 'la validation ne lit pas la base de l’élève (A B C passe) : ' + refus);
});

await v('points par élève (4) : `bilan(etat)` sans base = la base vide (compatibilité des contenus), sans aucune erreur', async () => {
  const avant = erreursP.length;
  const r = await pp.evaluate(() => {
    const { t, RAMASSE, TIRE, etat } = window.__pts;
    const V = t.creerTournee(RAMASSE({ points: TIRE }));
    const e = etat(['A', 'B', 'C', 'D'], []);
    return { sans: V.bilan(e).pics.vides, vide: V.bilan(e, {}).pics.vides, tire: V.bilan(e, { essai: { vides: { A: 200 } } }).pics.vides,
      profil: V.bilan(e).profils.vides };
  });
  egal(r.sans, 425, 'bilan(etat) sans base'); egal(r.vide, 425, 'bilan(etat, {})'); egal(r.tire, 485, 'bilan(etat, base tirée)');
  egal(r.profil, [0, 140, 260, 355, 425], 'profil sans base');
  egal(erreursP.slice(avant), [], 'un bilan sans base signale une erreur');
});

await v('points par élève (5) : au chargement, une fonction qui plante sur une base vide, ou qui ne rend pas un tableau de points, fait refuser la séance (message qui nomme la tournée)', async () => {
  const r = await pp.evaluate(() => {
    const { t, m, RAMASSE, commun } = window.__pts;
    const essai = (f) => { try { f(); return 'passe'; } catch (e) { return e.message; } };
    const boum = () => { throw new Error('boum'); };
    return {
      boum: essai(() => t.creerTournee(RAMASSE({ points: boum }))),
      texte: essai(() => t.creerTournee(RAMASSE({ points: () => 'texte' }))),
      sansId: essai(() => t.creerTournee(RAMASSE({ points: () => [{ nom: 'sans id' }] }))),
      seance: essai(() => m.creerEntreprise(Object.assign({}, commun, { etapes: [], tournee: RAMASSE({ id: 'essai-seance', points: boum }) }))),
      bonne: essai(() => m.creerEntreprise(Object.assign({}, commun, { etapes: [], tournee: RAMASSE({ points: (db) => window.__pts.TIRE(db) }) }))),
    };
  });
  vrai(/tournée « essai-ramasse » : « points\(db\) » ne marche pas sur une base vide : boum/.test(r.boum), 'fonction qui plante : ' + r.boum);
  vrai(/tournée « essai-ramasse » : « points\(db\) » ne marche pas sur une base vide : « points\(db\) » rend string au lieu d’un tableau/.test(r.texte), 'fonction qui rend un texte : ' + r.texte);
  vrai(/tournée « essai-ramasse » .*base vide.*sans « id »/.test(r.sansId), 'point sans id : ' + r.sansId);
  vrai(/tournée « essai-seance » : « points\(db\) » ne marche pas sur une base vide : boum/.test(r.seance), 'la séance se charge malgré tout : ' + r.seance);
  egal(r.bonne, 'passe', 'une fonction correcte refuse la séance');
});

await v('points par élève (6) : au dessin, une fonction qui plante (ou rend d’autres sites) montre un avis, signale une fois, n’écrit rien ; le bilan repart de la base vide', async () => {
  const avant = erreursP.length;
  await pp.evaluate(() => {
    const { RAMASSE, SITES, monter } = window.__pts;
    window.__pts.dbErr = monter('ptsErr', RAMASSE({ id: 'essai-err', points: (db) => { if (db.essai) throw new Error('boum'); return SITES; } }),
      'ess-pts-err', { essai: true });
    window.__pts.dbIds = monter('ptsIds', RAMASSE({ id: 'essai-ids', points: (db) => (db.essai ? SITES.filter((s) => s.id !== 'D') : SITES) }),
      'ess-pts-ids', { essai: true });
  });
  for (const zone of ['#ptsErr', '#ptsIds']) {
    await ouvrirP(zone);
    await accueilP(zone);
    await ouvrirP(zone);        // deux dessins : une seule erreur signalée
    vrai(await pp.$(`${zone} [data-tournee-erreur]`), `${zone} : pas d’avis d’erreur`);
    egal(await pp.$$eval(`${zone} #tourListe, ${zone} .tour-quai, ${zone} [data-tour-valider]`, (e) => e.length), 0, `${zone} : la tournée se dessine quand même`);
    vrai(/La tournée ne s’affiche pas \(erreur de la séance\)/.test(await pp.textContent(`${zone} [data-tournee-erreur]`)), `${zone} : texte de l’avis`);
  }
  const ecrit = await pp.evaluate(() => [window.__pts.dbErr, window.__pts.dbIds].map((db) => {
    const e = db.transport && Object.values(db.transport)[0] && Object.values(db.transport)[0].tournee;
    return e ? Object.keys(e) : [];
  }));
  egal(ecrit, [[], []], 'quelque chose est écrit dans l’état de la tournée');
  const nouvelles = erreursP.slice(avant);
  egal(nouvelles.filter((x) => /la tournée « essai-err » ne se dessine pas : boum/.test(x)).length, 1, 'fonction qui plante, signalée une fois : ' + nouvelles.join(' | '));
  egal(nouvelles.filter((x) => /la tournée « essai-ids » ne se dessine pas : « points\(db\) » rend d’autres sites que sur une base vide/.test(x)).length, 1,
    'autres sites, signalés une fois : ' + nouvelles.join(' | '));
  egal(nouvelles.length, 2, 'd’autres erreurs : ' + nouvelles.join(' | '));
  // Le bilan sur cette base : celui de la base vide, sans plantage (signalé une fois, même appelé deux fois).
  const avantB = erreursP.length;
  const b = await pp.evaluate(() => {
    const { t, RAMASSE, SITES, etat } = window.__pts;
    const e = etat(['A', 'B', 'C', 'D'], []);
    const V1 = t.creerTournee(RAMASSE({ points: (db) => { if (db.essai) throw new Error('boum'); return SITES; } }));
    const V2 = t.creerTournee(RAMASSE({ id: 'essai-ids', points: (db) => (db.essai ? SITES.filter((s) => s.id !== 'D') : SITES) }));
    const d = { essai: true };
    return { p1: V1.bilan(e, d).pics.vides, p1bis: V1.bilan(e, d).pics.vides, p2: V2.bilan(e, d).pics.vides, r2: V2.bilan(e, d).retenus.map((p) => p.id) };
  });
  egal(b, { p1: 425, p1bis: 425, p2: 425, r2: ['A', 'B', 'C', 'D'] }, 'le bilan d’une base fautive n’est pas celui de la base vide');
  const nb = erreursP.slice(avantB);
  egal(nb.filter((x) => /\[tournee\] le bilan de la tournée « essai-ramasse » repart de la base vide : boum/.test(x)).length, 1, 'bilan qui plante, signalé une fois : ' + nb.join(' | '));
  egal(nb.filter((x) => /\[tournee\] le bilan de la tournée « essai-ids » repart de la base vide : « points\(db\) » rend d’autres sites/.test(x)).length, 1, 'bilan aux autres sites : ' + nb.join(' | '));
  egal(nb.length, 2, 'd’autres erreurs : ' + nb.join(' | '));
  vrai(!nouvelles.concat(nb).some((x) => /PAGEERROR/.test(x)), 'la page a planté');
  erreursP.splice(avant);   // attendues : elles ne comptent pas dans « aucune erreur » ci-dessous
});

await v('points par élève (7) : `etatInitial` et `passerPhase` avec des points en fonction — l’amorce pose l’ordre déclaré, la phase 2 annule C, comme en liste fixe', async () => {
  const r = await pp.evaluate(() => {
    const { t, RAMASSE, SITES, TIRE, monter, dessin } = window.__pts;
    const opts = { etatInitial: { ordre: ['B', 'A'], quai: ['C', 'D'] }, phases: { 2: { annules: ['C'] } } };
    const essai = (f) => { try { f(); return 'passe'; } catch (e) { return e.message; } };
    const db = { essai: { vides: { A: 200 } } };
    const jouer = (points) => {
      const V = t.creerTournee(RAMASSE(Object.assign({ points }, opts)));
      const e = {};
      const amorce = V.amorcer(e, db);
      const apresAmorce = { ordre: [...e.ordre], quai: [...e.quai], amorce: !!e.amorce };
      const phase = V.passerPhase(e, 2, db);
      const b = V.bilan(e, db);
      const d = dessin(V, e, db);
      return { amorce, apresAmorce, phase, n: e.phase && e.phase.n, ordre: e.ordre, quai: e.quai, annules: b.annules,
        points: b.points.map((p) => p.id), profil: b.profils.vides,
        annuleEcran: (d.querySelector('[data-tour-annules]') || {}).textContent || '', encore: V.amorcer(e, db), rejoue: V.passerPhase(e, 2, db) };
    };
    const ecran = (() => {
      const dbE = { essai: { vides: { A: 200 } } };
      monter('ptsAmorce', RAMASSE(Object.assign({ id: 'essai-amorce', points: TIRE }, opts)), 'ess-pts-amorce', dbE);
      return dbE;
    })();
    window.__pts.dbAmorce = ecran;
    return {
      fn: jouer(TIRE), fixe: jouer(SITES),
      inconnuInit: essai(() => t.creerTournee(RAMASSE({ points: TIRE, etatInitial: { ordre: ['B', 'E'] } }))),
      inconnuPhase: essai(() => t.creerTournee(RAMASSE({ points: TIRE, phases: { 2: { annules: ['E'] } } }))),
    };
  });
  egal(r.fn.amorce, true, 'l’amorce ne s’est pas faite');
  egal(r.fn.apresAmorce, { ordre: ['B', 'A'], quai: ['C', 'D'], amorce: true }, 'l’amorce');
  egal(r.fn.phase, true, 'la phase 2 ne s’applique pas'); egal(r.fn.n, 2, 'numéro de phase');
  egal(r.fn.ordre, ['B', 'A'], 'ordre après la phase'); egal(r.fn.quai, ['D'], 'C annulé reste au quai');
  egal(r.fn.annules, ['C'], 'annulés du bilan'); egal(r.fn.points, ['A', 'B', 'D'], 'points de la phase');
  egal(r.fn.profil, [0, 120, 320], 'profil B puis A = 200 (base de l’élève)');
  vrai(/Commandes annulées \(1\)/.test(r.fn.annuleEcran) && /Site C/.test(r.fn.annuleEcran), 'l’écran ne barre pas C : ' + r.fn.annuleEcran);
  egal([r.fn.encore, r.fn.rejoue], [false, false], 'l’amorce ou la phase se rejouent');
  egal(r.fixe.profil, [0, 120, 260], 'liste fixe : profil B puis A = 140');
  const sansValeurs = (x) => ({ ...x, profil: null });
  egal(sansValeurs(r.fn), sansValeurs(r.fixe), 'fonction et liste fixe : amorce ou phase différentes');
  vrai(/etatInitial cite « E », qui n'est pas un point/.test(r.inconnuInit), 'etatInitial inconnu : ' + r.inconnuInit);
  vrai(/la phase 2 cite « E », qui n'est pas un point/.test(r.inconnuPhase), 'phase inconnue : ' + r.inconnuPhase);
  // Par l'hôte : la tournée du collègue est posée à la première ouverture, avec les valeurs de l'élève.
  await ouvrirP('#ptsAmorce');
  const liste = await pp.$$eval('#ptsAmorce #tourListe .tour-item', (e) => e.map((x) => x.textContent.replace(/\s+/g, ' ')));
  egal(liste.length, 2, 'deux arrêts posés par l’amorce');
  vrai(/Site B/.test(liste[0]) && /Site A/.test(liste[1]) && /200 palettes à reprendre/.test(liste[1]), 'l’ordre ou les valeurs de l’amorce à l’écran : ' + liste.join(' | '));
  const e = await pp.evaluate(() => Object.values(window.__pts.dbAmorce.transport)[0].tournee);
  vrai(e.amorce && e.ordre.join() === 'B,A', 'l’amorce n’est pas rangée dans la base : ' + JSON.stringify(e));
});

await v('points par élève : aucune autre erreur de console dans la page des essais', async () => {
  if (erreursP.length) throw new Error([...new Set(erreursP)].slice(0, 3).join(' | '));
});
await pp.close();

// ── Le montage sur la carte du Nord ──────────────────────────────────────────────────────────
// La journée d'essai (celle de `outils/essai-tournee-ramasse.html` et du calage `outils/carte/chep.json`) :
// départ 6 h de Templemars, 55 km/h, 20 min + 0,05 min par palette à chaque arrêt, boucle.
await v('carte du Nord : un itinéraire porteur pour chaque paire d’arrêts, en boucle depuis Templemars ; la frontière est dessinée', async () => {
  const r = await pg.evaluate(async () => {
    const { CARTE } = await import('/contenus/chep-carte.js');
    const ids = CARTE.clients.map((c) => c.id);
    const manque = [];
    for (const a of ['depart', ...ids]) for (const b of [...ids, 'arrivee']) if (a !== b && !CARTE.trajets[`${a}|${b}`]) manque.push(`${a}|${b}`);
    const km = Object.fromEntries(ids.map((id) => [id, Math.round(CARTE.trajets[`depart|${id}`].m / 100) / 10]));
    return { ids, manque, boucle: CARTE.boucle, depart: CARTE.depart.nom, km, frontiere: (CARTE.couches.frontiere || '').length,
      couches: Object.keys(CARTE.couches).length, attrib: CARTE.attrib, reperes: CARTE.reperes.map((r) => r.n) };
  });
  egal(r.manque, [], 'itinéraires manquants');
  egal(r.ids, ['lesquin', 'douai', 'prouvy', 'roubaix', 'dourges'], 'les cinq plates-formes');
  vrai(r.boucle && /Templemars/.test(r.depart), 'le dépôt n’est pas Templemars en boucle : ' + r.depart);
  vrai(r.frontiere > 100, 'pas de frontière dessinée');
  vrai(/OpenStreetMap/.test(r.attrib), 'mention OSM absente');
  vrai(r.reperes.includes('Lille') && r.reperes.includes('Valenciennes'), 'villes repères : ' + r.reperes.join(', '));
  // Ordres de grandeur routiers (écrits à la main, larges) : le calage fin est dans chep.json.
  vrai(r.km.lesquin > 4 && r.km.lesquin < 15, 'Templemars → Lesquin : ' + r.km.lesquin + ' km');
  vrai(r.km.douai > 22 && r.km.douai < 45, 'Templemars → Douai : ' + r.km.douai + ' km');
  vrai(r.km.prouvy > 35 && r.km.prouvy < 70, 'Templemars → Prouvy : ' + r.km.prouvy + ' km');
  vrai(r.km.roubaix > 15 && r.km.roubaix < 35, 'Templemars → Roubaix : ' + r.km.roubaix + ' km');
  vrai(r.km.dourges > 14 && r.km.dourges < 32, 'Templemars → Dourges : ' + r.km.dourges + ' km');
});

await v('carte du Nord : le calage (calibrer.mjs, mode ramasse) et la vue font la même journée — km, heures d’arrivée, retour, profil', async () => {
  const sortie = execFileSync('node', [path.join(ROOT, 'outils/carte/calibrer.mjs'), 'contenus/chep-carte.js', 'outils/carte/chep.json'], { encoding: 'utf8', cwd: ROOT });
  vrai(/calage tenu/.test(sortie), 'le calage ne tient pas :\n' + sortie.slice(-600));
  const m = sortie.match(/meilleur qui tient tout : (.+?) — ([\d.]+) km, retour (\d+) h (\d+) ; arrivées (.+?) ; profil (.+)/);
  vrai(m, 'pas de « meilleur » dans la sortie :\n' + sortie.slice(-600));
  const ordre = m[1].split(' ');
  const arrivees = Object.fromEntries(m[5].split(', ').map((x) => { const [id, h, , mm] = x.split(' '); return [id, +h * 60 + +mm]; }));
  const r = await pg.evaluate(async ({ ordre }) => {
    const { CARTE } = await import('/contenus/chep-carte.js');
    const t = await import('/core/types/tournee.js');
    const J = (await (await fetch('/outils/carte/chep.json')).json()).calibrage;
    const points = CARTE.clients.filter((c) => J.arrets[c.id]).map((c) => Object.assign({}, c, J.arrets[c.id]));
    const vue = t.creerTournee({ plan: { carte: CARTE, clients: points }, points,
      mesures: [Object.assign({ id: 'vides', libelle: 'Palettes vides à bord', unite: 'palettes' }, J.mesure)],
      horaire: { depart: J.depart, vitesse: J.vitesse, service: J.service }, departAQuai: true });
    const b = vue.bilan({ ordre, quai: Object.keys(J.arrets).filter((id) => !ordre.includes(id)), report: {}, juge: {}, valide: null });
    return { km: Math.round(b.km * 10) / 10, arrivee: Math.round(b.arrivee), // L'heure où l'enlèvement commence : l'arrivée plus l'attente à l'ouverture (ce que le calage imprime).
      arrivees: Object.fromEntries(ordre.map((id) => [id, Math.round(b.arrivees[id] + (b.attentes[id] || 0))])),
      profil: b.profils.vides, rates: b.creneauxRates, depasse: b.depassements };
  }, { ordre });
  egal(r.km, Math.round(+m[2] * 10) / 10, 'km du meilleur ordre');
  egal(r.arrivee, +m[3] * 60 + +m[4], 'heure de retour');
  egal(r.arrivees, arrivees, 'heures d’arrivée');
  egal(r.profil.join(' → '), m[6].trim(), 'profil');
  egal(r.rates, [], 'un créneau raté dans la vue alors que le calage dit tenu');
  egal(r.depasse, [], 'un dépassement dans la vue');
});

// `horaire.libelleRate` (18/10/2026, vu sur ENT-9.2) : la pastille d'un créneau raté après l'heure et le refus du report disent le
// libellé déclaré, jamais « de N min » ; sans lui, « Créneau raté de N min » (Boost, bloc `carte`) ne change pas. Deux montages sur la
// carte du Nord, mêmes arrêts et créneaux que le calage, l'ordre au plus court (Roubaix ferme à 9 h, atteint trop tard).
await v('ramasse à l’écran : `libelleRate` → « Quai fermé à l’arrivée » (pastille et refus du report) sans « de combien » ; sans lui, « Créneau raté de N min »', async () => {
  await pg.evaluate(async () => {
    const m = await import('/core/types/entreprise.js');
    const { CARTE } = await import('/contenus/chep-carte.js');
    const J = (await (await fetch('/outils/carte/chep.json')).json()).calibrage;
    const points = CARTE.clients.filter((c) => J.arrets[c.id]).map((c) => Object.assign({}, c, J.arrets[c.id],
      { creneau: Object.assign({ libelle: 'enlèvement des vides' }, J.arrets[c.id].creneau) }));
    const commun = {
      ENTREPRISE: { nom: 'Essai Ramasse', sousTitre: 'scénario d\'essai' }, VOCAB: { unit: 'pièce', unitPl: 'pièces', sizeLabel: 'Taille' },
      CATALOGUE: { MODELS: [], MM: {}, VARIANTS: [], VM: {} }, SUPPLIERS: [], SUP_BY_ID: {}, CUSTOMERS: [], CM: {}, THEME: {},
      baseDeDepart: () => ({ v: 1, seq: 1, stock: {}, mails: [], orders: [], receptions: [], moves: [], customers: [], suppliers: [], _depart: [] }),
    };
    const tournee = (horaire) => ({ id: 'ess-ferme', libelle: 'Ramasse', titre: 'Ramasse', points, plan: { carte: CARTE, clients: points },
      mesures: [Object.assign({ id: 'vides', libelle: 'Palettes vides à bord', unite: 'palettes' }, J.mesure)],
      horaire: Object.assign({ depart: J.depart, vitesse: J.vitesse, service: J.service }, horaire), departAQuai: true, exigeConforme: true,
      quai: { libelle: 'Reporter', titre: 'Reportés', reprendre: 'remettre', vide: 'Aucun.', max: 1 },
      report: [{ id: 'pic', libelle: 'Au plus, à bord', unite: 'palettes', valeur: (b) => b.pics.vides }] });
    const monter = (hoteId, T) => {
      const hote = document.createElement('div'); hote.id = hoteId; document.body.appendChild(hote);
      const act = m.creerEntreprise(Object.assign({}, commun, { etapes: [], tournee: T }));
      const db = {};
      act.rendre(hote, { meta: { id: hoteId, portee: 'eleve', code: 'ESS-R', titre: 'Essai' }, profil: { prenom: 'Léa', nom: 'Dupont', role: 'eleve' },
        jeu: { etat: () => db, sauver: () => {} }, enregistrer: () => {}, quitter: () => {}, codeStock: 'ABC' });
    };
    monter('ramFerme', tournee({ libelleRate: 'quai fermé à l’arrivée' }));
    monter('ramRate', tournee({}));
  });
  for (const zone of ['#ramFerme', '#ramRate']) {
    await ouvrir(zone);
    for (const id of ['douai', 'prouvy', 'roubaix']) await charger(id, zone);
    await pg.fill(`${zone} [data-report="pic"]`, '355');   // le pic est juste : seul le créneau refuse le report
    await pg.click(`${zone} [data-tour-valider]`); await pg.waitForTimeout(80);
  }
  const lire = (zone) => pg.evaluate((zone) => {
    const e = document.querySelector(`${zone} [data-creneau="roubaix"]`);
    return { texte: e.textContent.replace(/\s+/g, ' '), pastille: ((e.querySelector('.pastille.crit') || {}).textContent || '').trim(),
      refus: ((document.querySelector(`${zone} .tour-report .avis-err`) || {}).textContent || '').replace(/\s+/g, ' ') };
  }, zone);
  const f = await lire('#ramFerme');
  egal(f.pastille, 'Quai fermé à l’arrivée', 'la pastille déclarée');
  vrai(!/raté de|min de retard|réneau raté/.test(f.texte + ' ' + f.refus), 'de combien, ou « créneau raté », malgré le libellé : ' + f.texte + ' | ' + f.refus);
  vrai(/quai fermé à l’arrivée chez MarchéLys/.test(f.refus), 'le refus du report avec le libellé : ' + f.refus);
  const d = await lire('#ramRate');
  vrai(/^Créneau raté de \d+ min$/.test(d.pastille), 'sans libellé, la pastille parlante : ' + d.pastille);
  vrai(/créneau raté chez MarchéLys \(\d+ min de retard\)/.test(d.refus), 'sans libellé, le refus : ' + d.refus);
});

await v('ramasse : aucune erreur de console pendant tout le parcours', async () => {
  if (erreurs.length) throw new Error([...new Set(erreurs)].slice(0, 3).join(' | '));
});

await ctxR.close();
}
