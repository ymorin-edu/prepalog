// Suite de tests de Prepalog — bloc « decathlon » : les séances Decathlon (ENT-7.x). ENT-7.1 « ton premier conteneur » d'abord.
// `node outils/test.mjs decathlon` ne lance que ce bloc. Aides communes (ouvrir la page, lire la base) : `outils/test/france-boissons/commun.mjs`.
//
// Valeurs ÉCRITES À LA MAIN (brief §8, recalculées le 13/10/2026 sur les kilomètres de la carte des itinéraires : route 168 km, barge
// 194 + camion 13, rail 162 + camion 46 ; vers Dourges : route 153, barge 263 + 3, rail 162 + 3) :
//   chiffre de contrôle ISO 6346 : PLGU 418207 → 5 ; PRPU 418207 → 2 ; CSQU 305438 → 3 (l'exemple de la norme) ;
//   CO₂ à 14,62 t vers Rouvignies : route 125, barge 66, rail 73 kg ; à 15,8 t : route 135 kg ; vers Dourges à 13,95 t : route 109,
//   barge 76, rail 39 kg (le brief disait 123 / 67 / 78 et 107 / 82 / 49 sur ses distances provisoires).
// Deux élèves TÉMOINS (tirage posé à la main) : 14 620 kg, route 690 €, barge 760 €, rail 800 €, hors liste E-Flux Logistique (590 €, 18 kg).
//   `rt-rail` : le rail arrive vendredi → restent la route et la barge → bonne réponse : la BARGE (66 kg).
//   `rt-barge` : la barge arrive vendredi → restent la route et le rail → bonne réponse : le RAIL (73 kg).
// Poids (validés par Tristan le 13/10/2026) : besoin-date 1,5 · besoin-budget 1,5 · tri-liste 3 · tri-date 4 · comparer 4 · decision-offre 2 ·
// decision-justif 1 ; questions 1 + 1 + 1.

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, entrants, erreursF } = F;
await pg.emulateMedia({ reducedMotion: 'reduce' });

const ID = 'decathlon-choix-transporteur';
const REP_OUV = { r1: 'nord', r2: 'vietnam', p1: 'boite', p2: 'libre', p3: 'derniers', p4: 'verifies', p5: 'une', d1: 'ligne', d2: 'transporteur',
  d3: 'engagement', d4: 'code' };
const VALEURS = { serie: 0, scelle: 7713420, poids: 14620, prixRoute: 690, prixBarge: 760, prixRail: 800 };
const tirage = (retard, o = {}) => ({ graine: `temoin-${retard}|${ID}`, pieces: { retard: [retard], horsListe: ['hl-eflux'], bonus: o.bonus || [] },
  difficultes: { retard: { [retard]: 'moyen' }, horsListe: { 'hl-eflux': 'difficile' }, bonus: {} }, ...(o.bonus ? { bonus: { bonus: o.bonus } } : {}),
  valeurs: { ...VALEURS, ...(o.valeurs || {}) }, essai: 0, secours: false, at: 1 });

// Monte la séance dans la page (montage de test, comme les blocs France Boissons). `o.db` : une base de départ ; les réponses
// d'« Avant de commencer » sont posées (l'écran d'ouverture est essayé dans son propre cas).
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/decathlon-choix-transporteur.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (o.rep) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'dk71' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'DK',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: o.sansOuverture ? null : REP_OUV, ...o });

const BONNES = { 'co2-obligatoire': 'cahier', 'retard-magasins': 'rayon', 'liste-referencee': 'verifie', directeur: 'date-co2' };
// Répond au panneau ouvert (puis reprend), tant qu'il y en a un. La question libre reçoit une phrase.
async function qrep(choix = BONNES) {
  for (let i = 0; i < 6; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    if (await present(`[data-q-libre="${id}"]`)) await pg.fill(`${Z} [data-q-libre="${id}"]`, 'La barge, la moins émettrice, dans le budget.');
    else await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
// Les adresses des cases de la feuille ③ pour chaque offre (l'ordre des lignes est tiré par élève : lu dans la séance, pas une valeur attendue).
const adresses = () => pg.evaluate(async () => {
  const D = await import('/contenus/decathlon-ent71-donnees.js');
  const J = D.jeuEleve(window.__f.db);
  return Object.fromEntries(J.offres.map((o) => [o.slot, { prix: D.casePrix(J, o.slot), co2: D.caseCO2(J, o.slot), lib: `${o.lettre} — ${o.nom}` }]));
});
// Remplit le comparateur comme un élève, puis l'envoie. `r` : les réponses, rangées par offre (route, barge, rail, horsliste, bonus1…).
async function remplir(r, { envoi = true } = {}) {
  await aller('fiche');
  const saisir = async (sel, t) => { await pg.fill(`${Z} ${sel}`, String(t)); await pg.dispatchEvent(`${Z} ${sel}`, 'change'); await pause(30); await qrep(); };
  if (r.limite) await saisir('#fi-limite', r.limite);
  if (r.heure) await saisir('#fi-heure', r.heure);
  if (r.budget) await saisir('#fi-budget', r.budget);
  if (r.critere) { await pg.selectOption(`${Z} #fi-critere`, r.critere); await pause(); await qrep(); }
  for (const [slot, t] of Object.entries(r.tri || {})) {
    for (const col of ['liste', 'date']) {
      if (t[col] == null) continue;
      await pg.click(`${Z} [data-ouinon="tri|${slot}|${col}|${t[col] ? 1 : 0}"]`);
      await pause(30);
      await qrep();
    }
  }
  const A = await adresses();
  for (const [slot, x] of Object.entries(r.chiffres || {})) {
    if (x.prix != null) await saisir(`[data-gr="${A[slot].prix}"]`, x.prix);
    if (x.co2 != null) await saisir(`[data-gr="${A[slot].co2}"]`, x.co2);
  }
  if (r.retenue) { await pg.selectOption(`${Z} #fi-retenue`, r.retenue); await pause(); await qrep(); }
  if (r.justif) { await pg.check(`${Z} input[name="fi-justif"][value="${r.justif}"]`); await pause(); await qrep(); }
  if (!envoi) return;
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause(60);
  if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); }
  await qrep();
}
// Le parcours juste d'un témoin (valeurs écrites à la main).
const TRI = (retard) => ({ route: { liste: true, date: true }, barge: { liste: true, date: retard !== 'barge' }, rail: { liste: true, date: retard !== 'rail' },
  horsliste: { liste: false, date: true } });
const CHIFFRES = { route: { prix: 690, co2: 125 }, barge: { prix: 760, co2: 66 }, rail: { prix: 800, co2: 73 }, horsliste: { prix: 590, co2: 18 } };
const JUSTE = (retard) => ({ limite: '2027-01-28', heure: '14:00', budget: '900', critere: 'co2', tri: TRI(retard), chiffres: CHIFFRES,
  retenue: retard === 'rail' ? 'barge' : 'rail', justif: 'co2' });
const JALONS = ['besoin-date', 'besoin-budget', 'tri-liste', 'tri-date', 'comparer', 'decision-offre', 'decision-justif'];
const QUESTIONS_NOTEES = ['question:co2-obligatoire', 'question:retard-magasins', 'question:liste-referencee'];

// ─────────────────────────────────────────────────────────── les données, calculées par le contenu (valeurs écrites ici à la main)
await v('ENT-7.1 : données — chiffre de contrôle ISO 6346, CO₂ sur les km de la carte (Rouvignies et Dourges), offres des deux témoins (valeurs écrites à la main)', async () => {
  const r = await pg.evaluate(async (V) => {
    const U = await import('/contenus/decathlon.js');
    const D = await import('/contenus/decathlon-ent71-donnees.js');
    const F = await import('/core/types/fiche.js');
    const co = (p, d) => ['route', 'barge', 'rail'].map((m) => U.co2(p, d, m));
    const j = (retard) => { const J = D.jeuDe({ retard, valeurs: V });
      return { offres: Object.fromEntries(J.offres.map((o) => [o.slot, [o.prix, o.co2, o.tient, o.referencee]])), bonne: J.bonne.slot, retard: J.enRetard.slot,
        restantes: J.restantes.map((o) => o.slot).sort(), conteneur: J.conteneur, ecarts: D.ecartsEquite(J) }; };
    const lus = ['6 091', '2,5', '900', 'x', '', ' 14 '].map((s) => [D.lireNombre(s), F.lireNombre(s)]);
    const heures = ['14:00', '14h00', '14 h', '2 pm', '25:00'].map((s) => [D.lireHeure(s), F.lireHeure(s)]);
    return { cc: ['PLGU418207', 'PRPU418207', 'CSQU305438'].map(U.chiffreControle), rouv: co(14620, 'rouvignies'), haut: U.co2(15800, 'rouvignies', 'route'),
      dourges: co(13950, 'dourges'), rail: j('rt-rail'), barge: j('rt-barge'), lus, heures };
  }, VALEURS);
  egal(r.cc, [5, 2, 3], 'chiffres de contrôle');
  egal(r.rouv, [125, 66, 73], 'CO₂ à 14,62 t vers Rouvignies');
  egal(r.haut, 135, 'CO₂ de la route à 15,8 t');
  egal(r.dourges, [109, 76, 39], 'CO₂ à 13,95 t vers Dourges');
  egal(r.rail.conteneur, 'PRPU 418207 2', 'numéro du conteneur témoin');
  egal(r.rail.offres, { route: [690, 125, true, true], barge: [760, 66, true, true], rail: [800, 73, false, true], horsliste: [590, 18, true, false] }, 'témoin rt-rail');
  egal([r.rail.bonne, r.rail.retard, r.rail.restantes], ['barge', 'rail', ['barge', 'route']], 'témoin rt-rail : bonne réponse');
  egal(r.barge.offres, { route: [690, 125, true, true], barge: [760, 66, false, true], rail: [800, 73, true, true], horsliste: [590, 18, true, false] }, 'témoin rt-barge');
  egal([r.barge.bonne, r.barge.retard, r.barge.restantes], ['rail', 'barge', ['rail', 'route']], 'témoin rt-barge : bonne réponse');
  egal([r.rail.ecarts, r.barge.ecarts], [[], []], 'témoins équitables');
  vrai(r.lus.every(([a, b]) => Object.is(a, b)) && r.heures.every(([a, b]) => Object.is(a, b)), 'lireNombre / lireHeure lisent comme la fiche : ' + JSON.stringify([r.lus, r.heures]));
});

// ─────────────────────────────────────────────────────────── les jalons sans écran (bases fabriquées)
// `r` : les réponses (comme `remplir`), converties en valeurs de fiche dans la page.
const jalonsSans = (retard, r, o = {}) => pg.evaluate(async ({ T, r, envoye }) => {
  const S = await import('/contenus/decathlon-ent71.js');
  const D = await import('/contenus/decathlon-ent71-donnees.js');
  const db = { tirages: { 'decathlon-choix-transporteur': T }, fiches: {} };
  if (r) {
    const J = D.jeuEleve(db), cases = {};
    for (const [slot, x] of Object.entries(r.chiffres || {})) { if (x.prix != null) cases[D.casePrix(J, slot)] = String(x.prix); if (x.co2 != null) cases[D.caseCO2(J, slot)] = String(x.co2); }
    db.fiches.cmp = { valeurs: { limite: r.limite, heure: r.heure, budget: r.budget, critere: r.critere, tri: r.tri, offres: { cases }, retenue: r.retenue, justif: r.justif },
      ...(envoye === false ? {} : { envoye: { at: 1 } }) };
  }
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, (e.verifier(db) || { status: 'null' }).status]));
}, { T: tirage(retard, o), r, envoye: o.envoye });
const ko = (r) => JALONS.filter((j) => r[j] !== 'ok');
const avec = (retard, f) => { const r = JSON.parse(JSON.stringify(JUSTE(retard))); f(r); return r; };

await v('ENT-7.1 : jalons sans écran — les deux témoins justes ; chaque piège fait tomber SON jalon ; une erreur ne se paie qu’une fois ; rien de vrai sans envoi', async () => {
  egal(ko(await jalonsSans('rt-rail', JUSTE('rail'))), [], 'témoin rt-rail juste');
  egal(ko(await jalonsSans('rt-barge', JUSTE('barge'))), [], 'témoin rt-barge juste');
  // Contre la copie : le parcours juste de l'un, joué par l'autre.
  egal(ko(await jalonsSans('rt-barge', JUSTE('rail'))), ['tri-date', 'decision-offre'], 'rt-barge qui recopie rt-rail');
  egal(ko(await jalonsSans('rt-rail', JUSTE('barge'))), ['tri-date', 'decision-offre'], 'rt-rail qui recopie rt-barge');
  // Les pièges du brief §8.
  egal(ko(await jalonsSans('rt-rail', avec('rail', (r) => { r.critere = 'prix'; }))), ['besoin-budget'], 'critère « prix »');
  egal(ko(await jalonsSans('rt-rail', avec('rail', (r) => { r.limite = '2027-01-27'; }))), ['besoin-date'], 'date du 27/01');
  egal(ko(await jalonsSans('rt-rail', avec('rail', (r) => { r.heure = '08:00'; }))), ['besoin-date'], 'heure de mise à disposition recopiée');
  egal(ko(await jalonsSans('rt-rail', avec('rail', (r) => { r.tri.horsliste.liste = true; }))), ['tri-liste'], 'hors liste « oui »');
  egal(ko(await jalonsSans('rt-rail', avec('rail', (r) => { r.tri.rail.date = true; }))), ['tri-date'], 'offre en retard « tient »');
  egal(ko(await jalonsSans('rt-rail', avec('rail', (r) => { r.tri.route.date = false; }))), ['tri-date'], 'route marquée en retard');
  egal(ko(await jalonsSans('rt-rail', avec('rail', (r) => { r.chiffres.route.co2 = 66; }))), ['comparer'], 'CO₂ de la barge recopié sur la ligne route');
  egal(ko(await jalonsSans('rt-rail', avec('rail', (r) => { r.chiffres.barge = { prix: 66, co2: 760 }; }))), ['comparer'], 'prix et CO₂ inversés');
  egal(ko(await jalonsSans('rt-rail', avec('rail', (r) => { r.retenue = 'route'; }))), ['decision-offre'], 'route retenue (la moins chère)');
  egal(ko(await jalonsSans('rt-rail', avec('rail', (r) => { r.retenue = 'horsliste'; }))), ['decision-offre'], 'hors liste retenue');
  egal(ko(await jalonsSans('rt-barge', avec('barge', (r) => { r.retenue = 'barge'; }))), ['decision-offre'], 'rt-barge qui retient la barge');
  egal(ko(await jalonsSans('rt-rail', avec('rail', (r) => { r.justif = 'prix'; }))), ['decision-justif'], 'justification « la moins chère »');
  // Une erreur ne se paie qu'une fois : l'offre en retard (bien écartée) mal reportée, l'offre hors liste aussi.
  egal(ko(await jalonsSans('rt-rail', avec('rail', (r) => { r.chiffres.rail = { prix: 999, co2: 1 }; r.chiffres.horsliste = { prix: 1, co2: 1 }; }))), [],
    'offres écartées mal reportées');
  // Jalon 6 jugé sur le réel, même si le tri est faux.
  egal(ko(await jalonsSans('rt-rail', avec('rail', (r) => { r.tri.horsliste.liste = true; }))).includes('decision-offre'), false, 'bonne offre malgré un tri faux');
  // Rien de vrai sans envoi ; rien d'envoyé, tout « à faire ».
  const s = await jalonsSans('rt-rail', JUSTE('rail'), { envoye: false });
  egal(JALONS.map((j) => s[j]), JALONS.map(() => 'attente'), 'fiche remplie, pas envoyée');
  const vide = await jalonsSans('rt-rail', null);
  egal(JALONS.map((j) => vide[j]), JALONS.map(() => 'attente'), 'rien envoyé');
  egal([vide['bonus-1'], vide['bonus-2']], ['null', 'null'], 'standard : pas de cas bonus');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran, pour chaque témoin
for (const retard of ['rail', 'barge']) {
  await v(`ENT-7.1 : parcours juste à l’écran du témoin rt-${retard} — questions au fil sur SES offres, 20 / 20, quatre pastilles, Claire neutre`, async () => {
    await monter({ uid: `dk71-${retard}`, db: { tirages: { [ID]: tirage(`rt-${retard}`) } } });
    egal(await pg.$$eval(`${Z} .ent-pastille.fait`, (L) => L.length), 0, 'aucune pastille faite au départ');
    const menu = await pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => b.dataset.vue || b.dataset.vueFermee));
    vrai(menu.includes('itineraires') && menu.includes('fiche'), 'carte et comparateur au menu : ' + menu.join(', '));
    await remplir(JUSTE(retard));
    const n = await note();
    egal(JALONS.filter((j) => n.detail[j] !== 'ok'), [], 'jalons justes');
    egal(QUESTIONS_NOTEES.map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
    proche(n.score, 20, 'note');
    // Les questions ancrées sur SON tirage.
    const q = (await base()).questions[ID];
    vrai(new RegExp(retard === 'rail' ? 'Rail Flandres-Artois arrive vendredi 29/01/2027' : 'Contargo arrive vendredi 29/01/2027').test(q['retard-magasins'].texte.enonce),
      'question du retard : ' + q['retard-magasins'].texte.enonce);
    vrai(/E-Flux Logistique propose 590 €, 100 € de moins que Routiers du Hainaut/.test(q['liste-referencee'].texte.enonce), q['liste-referencee'].texte.enonce);
    vrai(/125 kg/.test(q['co2-obligatoire'].texte.enonce), q['co2-obligatoire'].texte.enonce);
    await aller('accueil');
    egal(await pg.$$eval(`${Z} .ent-pastille.fait`, (L) => L.length), 4, 'quatre pastilles faites');
    // Claire reprend ce que l'élève a écrit, sans dire si c'est juste.
    const claire = (await entrants()).filter((m) => m.subject === 'Ton choix').map((m) => m.text).join(' | ');
    const att = retard === 'rail' ? 'Contargo, 760 €, 66 kg' : 'Rail Flandres-Artois, 800 €, 73 kg';
    vrai(claire.includes(att), `Claire reprend le choix (${att}) : ${claire}`);
    egal(/juste|faux|erreur|bravo|bon choix|exact/i.test(claire), false, 'Claire neutre : ' + claire);
  });
}

await v('ENT-7.1 : la réponse d’un voisin — le témoin rt-barge qui joue les réponses du témoin rt-rail n’a pas 20 ; Claire reprend SON choix (la barge, 66 kg) sans le corriger', async () => {
  await monter({ uid: 'dk71-copie', db: { tirages: { [ID]: tirage('rt-barge') } } });
  await remplir(JUSTE('rail'));
  const n = await note();
  egal(['tri-date', 'decision-offre'].map((j) => n.detail[j]), ['ko', 'ko'], 'tri et décision faux');
  vrai(n.score < 20, `note ${n.score}`);
  const claire = (await entrants()).filter((m) => m.subject === 'Ton choix').map((m) => m.text).join(' | ');
  vrai(claire.includes('Contargo, 760 €, 66 kg'), claire);
});

await v('ENT-7.1 : inaction 0 — fiche vide refusée (« Il manque »), travail gardé ; fiche à moitié remplie refusée elle aussi', async () => {
  await monter({ uid: 'dk71-vide', db: { tirages: { [ID]: tirage('rt-rail') } } });
  await aller('fiche');
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause();
  const m = await pg.$eval(`${Z} [data-fiche-manque]`, (e) => e.textContent);
  vrai(/Il manque/.test(m) && /la date limite/.test(m) && /tri des offres/.test(m), 'fiche vide refusée : ' + m);
  const n0 = await note();
  egal(n0 ? n0.score : 0, 0, 'inaction : note');
  await remplir({ limite: '2027-01-28', heure: '14:00', budget: '900', critere: 'co2', tri: TRI('rail') }, { envoi: false });
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause();
  const m2 = await pg.$eval(`${Z} [data-fiche-manque]`, (e) => e.textContent);
  vrai(/tableau ③/.test(m2) && /l’offre retenue/.test(m2), 'fiche à moitié refusée : ' + m2);
  const db = await base();
  egal([db.fiches.cmp.envoye, db.fiches.cmp.valeurs.budget], [undefined, '900'], 'pas envoyée, travail gardé');
  // Les deux questions au fil du tri, répondues justes, comptent déjà (1 + 1) : la fiche, elle, ne compte rien tant qu'elle n'est pas partie.
  const n = await note();
  egal(n.score, 2, 'note après le tri (questions seulement)');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-7.1 : tirage — 200 élèves : rail et barge en retard chacun entre 40 et 60 %, zéro secours, zéro écart d’équité ; numéros et pièces hors liste variés', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/decathlon-ent71-donnees.js');
    const out = { rail: 0, barge: 0, secours: 0, ecarts: [], series: new Set(), hl: new Set(), paires: new Set() };
    for (let i = 0; i < 200; i++) {
      const g = `eleve-${i}|${D.ID}`;
      const t = D.TIRAGE.tirer(g, { confirme: i % 4 === 0 });
      if (t.secours) out.secours++;
      out[t.pieces.retard[0] === 'rt-rail' ? 'rail' : 'barge']++;
      const J = D.jeuEleve({ tirages: { [D.ID]: { graine: g, ...t } } });
      const e = D.ecartsEquite(J);
      if (e.length) out.ecarts.push(`${i} : ${e.join(' ; ')}`);
      out.series.add(J.conteneur); out.hl.add(t.pieces.horsListe[0]); out.paires.add(`${J.conteneur}|${t.pieces.horsListe[0]}`);
    }
    return { ...out, series: out.series.size, hl: out.hl.size, paires: out.paires.size };
  });
  vrai(r.rail >= 80 && r.rail <= 120 && r.barge >= 80 && r.barge <= 120, `répartition rail ${r.rail}, barge ${r.barge}`);
  egal([r.secours, r.ecarts], [0, []], 'secours et écarts');
  vrai(r.series === 6 && r.hl === 3 && r.paires >= 15, `variété : ${r.series} numéros, ${r.hl} pièces hors liste, ${r.paires} paires`);
});

await v('ENT-7.1 : confirmé — deux offres de plus (6 lignes), cas bonus jugés « non » dans la bonne colonne ; standard → null ; rien n’est dit à l’élève', async () => {
  await monter({ uid: 'dk71-confirme', aisance: 'confirme' });
  const db = await base();
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/decathlon-ent71-donnees.js');
    const J = D.jeuEleve(window.__f.db);
    return { n: J.offres.length, bonus: J.offres.filter((o) => o.slot.startsWith('bonus')).map((o) => [o.slot, o.piece, o.ecarte]) };
  });
  egal(r.n, 6, 'six offres');
  egal(db.aisance, 'confirme', 'niveau figé');
  await aller('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche="cmp"] table.ent-tri tbody tr`, (L) => L.length), 6, 'six lignes au tri');
  // Jalons bonus : chaque offre bonus écartée dans SA colonne → ok ; « oui » partout → ko.
  const statut = (tri) => pg.evaluate(async ({ tri }) => {
    const S = await import('/contenus/decathlon-ent71.js');
    const db = JSON.parse(JSON.stringify(window.__f.db));
    db.fiches = { cmp: { valeurs: { tri }, envoye: { at: 1 } } };
    return S.ETAPES.filter((e) => e.bonus).map((e) => e.verifier(db).status);
  }, { tri });
  const ecartes = Object.fromEntries(r.bonus.map(([slot, , col]) => [slot, { liste: col !== 'liste', date: col !== 'date' }]));
  egal(await statut(ecartes), ['ok', 'ok'], 'bonus écartés pour la bonne raison');
  egal(await statut(Object.fromEntries(r.bonus.map(([slot]) => [slot, { liste: true, date: true }]))), ['ko', 'ko'], 'bonus gardés');
  vrai(!/bonus/i.test(await pg.evaluate((Z) => document.querySelector(Z).innerText, Z)), 'le mot « bonus » n’est pas à l’écran');
});

await v('ENT-7.1 : Avant de commencer — 5 questions tirées (1 rappel, 2 préparation, 2 droit), la banque en a au moins le double par rubrique', async () => {
  await monter({ uid: 'dk71-ouverture', sansOuverture: true });
  const db = await base();
  const r = await pg.evaluate(async () => {
    const { QUESTIONS } = await import('/contenus/questions/ENT-7.1.js');
    const rub = Object.fromEntries(QUESTIONS.liste.filter((q) => q.type === 'ouverture').map((q) => [q.id, q.rubrique]));
    return { rub, tirage: QUESTIONS.ouverture.tirage };
  });
  const ids = db.questions[ID]['@tirage'].ids;
  const parRub = (L) => L.reduce((o, id) => ({ ...o, [r.rub[id]]: (o[r.rub[id]] || 0) + 1 }), {});
  const tri = (o) => Object.fromEntries(Object.entries(o).sort());
  egal(tri(parRub(ids)), tri({ rappel: 1, preparation: 2, droit: 2 }), 'questions tirées : ' + ids.join(', '));
  const banque = parRub(Object.keys(r.rub));
  vrai(Object.entries(r.tirage).every(([k, n]) => banque[k] >= 2 * n), 'banque : ' + JSON.stringify(banque));
  vrai(await present('.ent-nav[data-vue="ouverture"]'), 'écran d’ouverture au menu');
});

await v('ENT-7.1 : documents — le devis porte le CO₂ calculé sur le poids TIRÉ (15,8 t : route 135 kg) ; la carte liste les offres reçues par mode ; aucun document ne dit l’offre en retard', async () => {
  await monter({ uid: 'dk71-docs', db: { tirages: { [ID]: tirage('rt-rail', { valeurs: { poids: 15800 } }) } } });
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/decathlon-ent71.js');
    const D = await import('/contenus/decathlon-ent71-donnees.js');
    const db = window.__f.db, J = D.jeuEleve(db);
    const i = J.offres.findIndex((o) => o.slot === 'route');
    const doc = S.DOCUMENTS.find((d) => d.id === `devis-${'abcdef'[i]}`).html(db);
    const cahier = S.DOCUMENTS.find((d) => d.id === 'cahier').html(db);
    return { doc, cahier, offresRail: S.CARTE_ITINERAIRES.offres('rail', db), offresRoute: S.CARTE_ITINERAIRES.offres('route', db) };
  });
  vrai(/Information CO₂<\/a>|Information CO₂/.test(r.doc) && /135 kg de CO₂/.test(r.doc), 'devis de la route à 15,8 t');
  vrai(/15[s  ]800 kg/.test(r.cahier), 'poids tiré au cahier des charges');
  egal(r.offresRail, ['Rail Flandres-Artois'], 'offres pour le rail');
  egal(r.offresRoute.sort(), ['E-Flux Logistique', 'Routiers du Hainaut'], 'offres pour la route');
  vrai(!/retard|trop tard/i.test(r.cahier + r.doc), 'aucun document ne parle de retard');
});

// ─────────────────────────────────────────────────────────── l'écran
for (const [w, h] of [[1366, 768], [1280, 720]]) {
  await v(`ENT-7.1 : ergonomie ${w} × ${h} — le comparateur ne fait pas défiler la page avec 6 offres (confirmé), le bouton d’envoi se voit`, async () => {
    await pg.setViewportSize({ width: w, height: h });
    try {
      await monter({ uid: 'dk71-ecran', aisance: 'confirme' });
      await aller('fiche');
      await pg.$$eval('[data-carte-fermer]', (L) => L.forEach((b) => b.click()));
      await pause(200);
      const m = await pg.evaluate(() => { window.scrollTo(0, 0); const p = document.querySelector('#fTest .ent-page');
        const cartes = document.querySelector('#fTest .ent-cartes-ancre').getBoundingClientRect().height;
        const b = document.querySelector('#fTest [data-fiche-envoyer]');
        return { h: p.scrollHeight - cartes, bas: b.getBoundingClientRect().bottom - cartes }; });
      vrai(m.h <= h + 1 && m.bas <= h, `page ${Math.round(m.h)} px, bouton à ${Math.round(m.bas)} (pour ${h})`);
    } finally { await pg.setViewportSize({ width: 1366, height: 900 }); }
  });
}

await v('ENT-7.1 : charte — aucun aplat vert dans la zone de travail (comparateur, carte) ; la carte n’a ni vert ni rouge', async () => {
  await monter({ uid: 'dk71-charte', db: { tirages: { [ID]: tirage('rt-rail') } } });
  const aplats = async () => pg.evaluate(() => {
    const main = document.querySelector('#fTest .ent-main');
    const vert = getComputedStyle(main).getPropertyValue('--vert').trim();
    const rgb = (h) => { const d = document.createElement('i'); d.style.color = h; document.body.append(d); const c = getComputedStyle(d).color; d.remove(); return c; };
    const V = rgb(vert);
    return [...main.querySelectorAll('*')].filter((e) => getComputedStyle(e).backgroundColor === V).map((e) => e.className || e.tagName);
  });
  await aller('fiche');
  await remplir(JUSTE('rail'), { envoi: false });
  egal(await aplats(), [], 'comparateur rempli');
  await aller('itineraires');
  egal(await aplats(), [], 'carte des itinéraires');
});

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ENT-7.2 — Decathlon, « passer la commande » (brief `docs/briefs/ENT-7.2-decathlon-ordre-de-transport.md` §8, décisions du 14/10/2026).
// Valeurs ÉCRITES À LA MAIN (calculées par le coordinateur) :
//   chiffre de contrôle ISO 6346 : PRPU 418270 → 3 ; PRPU 418720 (deux chiffres voisins inversés) → 1 (≠ 3 : le piège n'est pas un numéro valable) ;
//   élève TÉMOIN (tirage posé à la main) : conteneur « PRPU 418270 3 » ; piège de l'appel « PRPU 418720 3 » (le chiffre de contrôle de l'élève gardé) ;
//   scellé « DC 0 771 409 » ; poids brut 14 980 kg ; référence PO-ROU-2027-0412 ; instructions fausses : froid et ADR ; ordre OT-2027-0142.
// Poids (14/10/2026) : ordre 3 · 1,5 · 1,5 · 1,5 · 1,5 · 1 ; courriel 3 · 1 ; appel 1,5 ; créneau 1,5 ; questions 1 + 1 + 1.
// Planning du quai (lundi 01/02, 07:00 → 13:00 par 30 min, t = 0 pour 07:00) : carte de 1 h 30 qui arrive à 09:00 ; bonne réponse unique :
//   Quai 6 à 09:30 (t = 5) ; Quai 5 à 10:30 attend 1 h 30, Quai 7 à 12:00 attend 3 h.
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════
const ID2 = 'decathlon-ordre-transport';
const REP_OUV2 = { p1: 'commande', p2: 'decathlon', p3: 'preuve', p4: 'avis', p5: 'tout', d1: 'oui', d2: 'regle', d3: 'cahier', d5: 'chargeur' };
const tirage2 = (o = {}) => ({ graine: `temoin72|${ID2}`, pieces: { instructions: ['in-froid', 'in-adr'] },
  difficultes: { instructions: { 'in-froid': 'moyen', 'in-adr': 'moyen' } }, ...(o.bonus ? { bonus: { instructions: o.bonus } } : {}),
  valeurs: { serie: 0, scelle: 771409, poids: 14980, ref: 412, ...(o.valeurs || {}) }, essai: 0, secours: false, at: 1 });
const monter2 = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/decathlon-ordre-transport.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (o.rep) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'dk72' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'DK',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID2, rep: o.sansOuverture ? null : REP_OUV2, ...o });

const FIL3 = Object.fromEntries(['chiffre-controle', 'reserves', 'ecrit-et-oral'].map((k) => [k, { arrivee: 1, premiere: 'x', duree: 1 }]));
const BONNES2 = { 'chiffre-controle': 'controle', reserves: 'reserves', 'ecrit-et-oral': 'trace' };
const JUSTE2 = { presta: 'contargo', cont: 'PRPU 418270 3', type: '40hc', scelle: 'DC 0 771 409', poids: '14 980', enl: 'anvers', dispo: '2027-01-28',
  ref: 'PO-ROU-2027-0412', liv: 'rouvignies', limd: '2027-02-02', limh: '14:00', inst: ['rdv', 'scelle', 'vide'] };
const MAIL_JUSTE = { a: 'contargo', objet: 'Ordre de transport OT-2027-0142 — conteneur PRPU 418270 3',
  corps: 'Bonjour,\n\nVeuillez trouver ci-joint notre ordre de transport pour ce conteneur.\n\nCordialement,\nLea', pj: ['fiche:ot'] };
const JUSTES_APPEL = { accueil: 'presente', refs: 'juste', arrivee: 'juste', planning: 'merci' };
const JALONS2 = ['ot-conteneur', 'ot-scelle', 'ot-poids-type', 'ot-presta-enlevement', 'ot-livraison-limite', 'ot-instructions', 'courriel-destinataire', 'courriel-forme',
  'appel-quai', 'creneau'];
const QUESTIONS2 = ['question:chiffre-controle', 'question:reserves', 'question:ecrit-et-oral'];
const PRIS_MSG = /\b(juste|justes|faux|fausse|correct|correcte|erreur|bravo)\b/i;

// L'ordre, rempli comme un élève (réponses du type JUSTE2) ; `enregistrer: false` le laisse en l'état.
async function remplir2(r, { enregistrer = true } = {}) {
  await aller('fiche');
  const saisir = async (champ, t) => { await pg.fill(`${Z} #fi-${champ}`, String(t)); await pg.dispatchEvent(`${Z} #fi-${champ}`, 'change'); await pause(30); await qrep(BONNES2); };
  const liste = async (champ, t) => { await pg.selectOption(`${Z} #fi-${champ}`, t); await pause(30); await qrep(BONNES2); };
  if (r.presta) await liste('presta', r.presta);
  if (r.cont != null) await saisir('cont', r.cont);
  if (r.type) await liste('type', r.type);
  if (r.scelle != null) await saisir('scelle', r.scelle);
  if (r.poids != null) await saisir('poids', r.poids);
  if (r.enl) await liste('enl', r.enl);
  if (r.dispo) await saisir('dispo', r.dispo);
  if (r.ref != null) await saisir('ref', r.ref);
  if (r.liv) await liste('liv', r.liv);
  if (r.limd) await saisir('limd', r.limd);
  if (r.limh) await saisir('limh', r.limh);
  for (const i of r.inst || []) { await pg.check(`${Z} input[data-fiche-case="inst"][value="${i}"]`); await pause(30); await qrep(BONNES2); }
  if (!enregistrer) return;
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pause(60);
  if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); }
  await qrep(BONNES2);
}
async function courriel2({ a, objet = '', corps = '', pj = [] }) {
  await aller('mail');
  if (!(await present('[data-courriel]'))) { await pg.click(`${Z} [data-nouveau]`); await pause(); }
  await pg.selectOption(`${Z} #cA`, a);
  await pg.fill(`${Z} #cObj`, objet);
  await pg.fill(`${Z} #cMsg`, corps);
  for (const id of pj) { await pg.click(`${Z} [data-c-joindre]`); await pg.click(`${Z} [data-c-joint="${id}"]`); await pause(); }
  await pg.click(`${Z} [data-c-envoyer]`);
  await pause();
  if (await present('[data-c-confirme]')) { await pg.click(`${Z} [data-c-oui]`); await pause(); }
  await qrep(BONNES2);
}
// L'appel : `leurres` appelés avant ; `sauf` : réponses maladroites dites avant la juste, par réplique.
async function appel2({ leurres = [], sauf = {} } = {}) {
  await aller('telephone');
  for (const l of leurres) { await pg.click(`${Z} [data-dlg-appeler="${l}"]`); await pause(); await pg.click(`${Z} [data-dlg-raccrocher-leurre]`); await pause(); }
  await pg.click(`${Z} [data-dlg-appeler="quai"]`); await pause();
  for (const r of ['accueil', 'refs', 'arrivee', 'planning']) {
    for (const x of sauf[r] || []) { await pg.click(`${Z} [data-dlg-choix="${x}"]`); await pause(); }
    await pg.click(`${Z} [data-dlg-choix="${JUSTES_APPEL[r]}"]`); await pause();
  }
  await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
  await qrep(BONNES2);
}
async function planning2(r = 'Q6', t = 5) {
  await aller('planning');
  await pg.click(`${Z} [data-pl-id="cont"][data-pl-vue="b"]`);
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${r}"][data-t="${t}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  await pause();
  await pg.click(`${Z} [data-pl="envoyer"]`);
  await pause(60);
  if (await present('[data-pl="quandMeme"]')) await pg.click(`${Z} [data-pl="quandMeme"]`);
  else if (await present('[data-confirme-oui]')) await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  await qrep({ ...BONNES2 });
}
const statuts2 = (n) => Object.fromEntries([...JALONS2, ...QUESTIONS2].map((j) => [j, n.detail[j]]));
const ko2 = (n) => [...JALONS2, ...QUESTIONS2].filter((j) => n.detail[j] !== 'ok');

// ─────────────────────────────────────────────────────────── les données (valeurs écrites à la main)
await v('ENT-7.2 : données — chiffre de contrôle PRPU 418270 → 3 et piège PRPU 418720 → 1 (à la main), témoin, 200 élèves : pièges toujours invalides, aucun secours', async () => {
  const r = await pg.evaluate(async () => {
    const U = await import('/contenus/decathlon.js');
    const D = await import('/contenus/decathlon-ent72-donnees.js');
    const T = D.jeuDe({});
    const out = { secours: 0, ecarts: [], series: new Set(), memes: [], fausses: new Set() };
    for (let i = 0; i < 200; i++) {
      const g = `eleve-${i}|${D.ID}`, t = D.TIRAGE.tirer(g, { confirme: i % 4 === 0 });
      if (t.secours) out.secours++;
      const J = D.jeuEleve({ tirages: { [D.ID]: { graine: g, ...t } } });
      const e = D.ecartsEquite(J); if (e.length) out.ecarts.push(`${i} : ${e.join(' ; ')}`);
      // Contrôle indépendant du générateur : le piège a le chiffre de l'élève, mais le vrai chiffre de ses 10 premiers caractères est différent.
      const p = J.piege.replace(/\s/g, ''), n = J.sansEspaces;
      if (U.chiffreControle(p.slice(0, 10)) === Number(p.slice(-1)) || p === n) out.memes.push(J.conteneur);
      out.series.add(J.conteneur); J.fausses.forEach((f) => out.fausses.add(f));
    }
    return { cc: [U.chiffreControle('PRPU418270'), U.chiffreControle('PRPU418720')], T: [T.conteneur, T.piege, T.scelle, T.reference, T.poids, T.fausses.slice().sort()],
      secours: out.secours, ecarts: out.ecarts, memes: out.memes, series: out.series.size, fausses: [...out.fausses].sort(),
      banque: D.SERIES.map((x) => x.serie) };
  });
  egal(r.cc, [3, 1], 'chiffres de contrôle');
  egal(r.T, ['PRPU 418270 3', 'PRPU 418720 3', 'DC 0 771 409', 'PO-ROU-2027-0412', 14980, ['adr', 'froid']], 'élève témoin');
  egal([r.secours, r.ecarts, r.memes], [0, [], []], 'secours, écarts d’équité, pièges valables');
  vrai(r.series >= 6, `${r.series} numéros différents sur 200 élèves`);
  egal(r.fausses, ['adr', 'douane', 'froid'], 'les fausses tirées sont dans les trois du socle (jamais le hayon, réservé au bonus)');
  const de71 = ['418207', '306552', '527190', '611348', '245873', '739016'];
  vrai(r.banque.length === 6 && r.banque.every((s) => !de71.includes(s)), 'la banque de numéros doit différer de celle d’ENT-7.1 : ' + r.banque);
});

// ─────────────────────────────────────────────────────────── les jalons sans écran (bases fabriquées)
const jalons2 = (d) => pg.evaluate(async ({ T, d }) => {
  const S = await import('/contenus/decathlon-ent72.js');
  const D = await import('/contenus/decathlon-ent72-donnees.js');
  const db = { tirages: { [S.ID]: T }, fiches: {}, mails: [{ folder: 'in', to: 'Lea' }] };
  if (d.ordre) db.fiches.ot = { valeurs: d.ordre, ...(d.enregistre === false ? {} : { envoye: { at: 1 } }) };
  if (d.courriels) db.courriels = { [S.ID]: { envoyes: d.courriels.map((c, i) => ({ pieces: [], objet: '', corps: '', at: 100 + i, ...c })) } };
  if (d.appel) db.dialogues = { [S.ID]: { quai: { appels: [{ debut: 1000, fin: 2000, pas: [], reprises: d.appel.reprises || 0 }] },
    '@leurres': (d.appel.leurres || []).map((id, i) => ({ id, at: 500 + i })) } };
  if (d.leurresApres) db.dialogues[S.ID]['@leurres'] = d.leurresApres.map((id, i) => ({ id, at: 3000 + i }));
  if (d.planning) db.plannings = { [S.ID === 'x' ? '' : 'quai-reception']: { v1: { place: { cont: { r: d.planning[0], s: d.planning[1] } } } } };
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, (e.verifier(db) || { status: 'null' }).status]));
}, { T: tirage2(d.tir || {}), d });
const parfait2 = { ordre: JUSTE2, courriels: [{ a: 'contargo', objet: MAIL_JUSTE.objet, corps: MAIL_JUSTE.corps, pieces: ['fiche:ot'] }], appel: { reprises: 0 }, planning: ['Q6', 5] };
const IDS2 = ['ot-conteneur', 'ot-scelle', 'ot-poids-type', 'ot-presta-enlevement', 'ot-livraison-limite', 'ot-instructions', 'courriel-destinataire', 'courriel-forme', 'appel-quai', 'creneau'];
const faux2 = (r) => IDS2.filter((j) => r[j] !== 'ok');
const avec2 = (f) => { const d = JSON.parse(JSON.stringify(parfait2)); f(d); return d; };
await v('ENT-7.2 : jalons sans écran — le témoin juste ; chaque piège du brief fait tomber SON jalon seulement ; une erreur ne se paie qu’une fois ; rien de vrai avant les gestes', async () => {
  egal(faux2(await jalons2(parfait2)), [], 'témoin juste');
  const o = (f) => avec2((d) => f(d.ordre));
  egal(faux2(await jalons2(o((r) => { r.cont = 'PRPU 418270'; }))), ['ot-conteneur'], 'chiffre de contrôle oublié');
  egal(faux2(await jalons2(o((r) => { r.cont = 'PRPU 418720 3'; }))), ['ot-conteneur'], 'deux chiffres inversés');
  egal(faux2(await jalons2(o((r) => { r.cont = 'PRPU 4I8270 3'; }))), ['ot-conteneur'], 'I pour 1');
  egal(faux2(await jalons2(o((r) => { r.cont = 'prpu4182703'; }))), [], 'espaces et majuscules ignorés');
  egal(faux2(await jalons2(o((r) => { r.scelle = 'DC0771409'; }))), [], 'scellé sans espaces');
  egal(faux2(await jalons2(o((r) => { r.scelle = 'DC 0 771 490'; }))), ['ot-scelle'], 'scellé faux');
  egal(faux2(await jalons2(o((r) => { r.type = '40'; }))), ['ot-poids-type'], '40 pieds au lieu de 40’ HC');
  egal(faux2(await jalons2(o((r) => { r.poids = '14620'; }))), ['ot-poids-type'], 'poids de la séance précédente');
  egal(faux2(await jalons2(o((r) => { r.poids = '14980'; }))), [], 'poids sans espace');
  egal(faux2(await jalons2(o((r) => { r.enl = 'bruay'; }))), ['ot-presta-enlevement'], 'Bruay en enlèvement');
  egal(faux2(await jalons2(o((r) => { r.presta = 'rail'; }))), ['ot-presta-enlevement'], 'autre transporteur');
  egal(faux2(await jalons2(o((r) => { r.liv = 'dourges'; }))), ['ot-livraison-limite'], 'Dourges');
  egal(faux2(await jalons2(o((r) => { r.limd = '2027-01-28'; }))), ['ot-livraison-limite'], 'date de disponibilité en limite');
  egal(faux2(await jalons2(o((r) => { r.limh = '8:00'; }))), ['ot-livraison-limite'], 'heure fausse');
  egal(faux2(await jalons2(o((r) => { r.limh = '14h'; }))), [], 'heure « 14h »');
  egal(faux2(await jalons2(o((r) => { r.inst = ['rdv', 'scelle', 'vide', 'adr']; }))), ['ot-instructions'], 'ADR coché');
  egal(faux2(await jalons2(o((r) => { r.inst = ['rdv', 'scelle', 'vide', 'froid']; }))), ['ot-instructions'], 'froid coché');
  egal(faux2(await jalons2(o((r) => { r.inst = ['rdv', 'scelle']; }))), ['ot-instructions'], 'instruction juste oubliée');
  egal(faux2(await jalons2(o((r) => { r.inst = []; }))), ['ot-instructions'], 'aucune instruction');
  // Le courriel.
  const c = (f) => avec2((d) => f(d.courriels));
  egal(faux2(await jalons2(c((L) => { L[0].a = 'quai'; }))), ['courriel-destinataire'], 'ordre envoyé au quai (la forme, elle, reste juste)');
  egal(faux2(await jalons2(c((L) => { L[0].a = 'claire'; }))), ['courriel-destinataire'], 'ordre envoyé à Claire');
  egal(faux2(await jalons2(c((L) => { L[0].a = 'routiers'; }))), ['courriel-destinataire'], 'ordre envoyé à un autre prestataire');
  egal(faux2(await jalons2(c((L) => { L[0].pieces = []; }))), ['courriel-destinataire'], 'sans pièce jointe');
  egal(faux2(await jalons2(c((L) => { L[0].pieces = ['cahier']; }))), ['courriel-destinataire'], 'mauvaise pièce jointe');
  egal(faux2(await jalons2(c((L) => { L[0].corps = 'Salut,\n\nvoici l’ordre.\n\nLea'; }))), ['courriel-forme'], '« Salut »');
  egal(faux2(await jalons2(c((L) => { L[0].corps = 'Bonjour,\n\nPeux-tu enregistrer ma commande ? Merci à toi.\n\nLea'; }))), ['courriel-forme'], 'tutoiement');
  egal(faux2(await jalons2(c((L) => { L[0].corps = 'Bonjour,\n\nVeuillez trouver ci-joint l’ordre.\n\nCordialement'; }))), ['courriel-forme'], 'sans signature');
  egal(faux2(await jalons2(c((L) => { L[0].corps = 'Bonjour,\n\nVoici l’ordre.\n\nCordialement,\nService transport, Decathlon'; }))), [], 'signature « Decathlon »');
  egal(faux2(await jalons2(c((L) => { L[0].corps = 'Veuillez trouver ci-joint l’ordre.\n\nLea'; }))), ['courriel-forme'], 'sans formule d’appel');
  egal(faux2(await jalons2(c((L) => { L[0].objet = ''; }))), ['courriel-forme'], 'objet vide');
  egal(faux2(await jalons2(c((L) => { L[0].objet = 'Ordre de transport'; }))), [], 'objet « ordre de transport »');
  egal(faux2(await jalons2(c((L) => { L[0].objet = 'PRPU4182703'; }))), [], 'objet = n° sans espaces');
  // L'ordre envoyé au quai : la forme se juge sur ce courriel (une erreur ne se paie qu'une fois).
  egal(faux2(await jalons2(c((L) => { L[0].a = 'quai'; L[0].corps = 'Salut'; }))), ['courriel-destinataire', 'courriel-forme'], 'au quai, mal écrit : deux jalons, chacun une fois');
  // Jalon 8 : un courriel juste suivi d'un autre (à Claire, sans pièce, sans formule) reste juste ; la forme se juge sur le premier.
  egal(faux2(await jalons2(c((L) => { L.push({ a: 'claire', objet: '', corps: 'ok', pieces: [] }); }))), [], 'jalons 8 et 9 jugés sur le courriel qui porte l’ordre, pas sur le dernier');
  // Jalon 9 : le courriel juste, puis un courriel mal écrit à un AUTRE prestataire : la forme reste jugée sur celui qui porte l'ordre à Contargo.
  egal(faux2(await jalons2(c((L) => { L.push({ a: 'rail', objet: '', corps: 'salut, tu fais quoi', pieces: [] }); }))), [], 'courriel juste puis courriel bâclé à un autre prestataire');
  // Sans courriel juste, la forme se juge sur le dernier courriel à un prestataire.
  egal(faux2(await jalons2(c((L) => { L[0].pieces = []; L.push({ a: 'rail', objet: '', corps: 'tu', pieces: [] }); }))), ['courriel-destinataire', 'courriel-forme'], 'sans courriel juste : dernier courriel à un prestataire');
  // L'appel et le créneau.
  const a = (f) => avec2((d) => f(d.appel));
  egal(faux2(await jalons2(a((x) => { x.reprises = 2; }))), [], '2 reprises');
  egal(faux2(await jalons2(a((x) => { x.reprises = 3; }))), ['appel-quai'], '3 reprises');
  egal(faux2(await jalons2(a((x) => { x.reprises = 1; x.leurres = ['contargo']; }))), [], 'mauvais numéro + 1 reprise');
  egal(faux2(await jalons2(a((x) => { x.reprises = 2; x.leurres = ['contargo']; }))), ['appel-quai'], 'mauvais numéro + 2 reprises');
  egal(faux2(await jalons2(a((x) => { x.reprises = 0; x.leurres = ['claire', 'contargo']; }))), [], 'deux mauvais numéros, aucune reprise');
  egal(faux2(await jalons2(a((x) => { x.reprises = 1; x.leurres = ['claire', 'contargo']; }))), ['appel-quai'], 'deux mauvais numéros + 1 reprise');
  egal(faux2(await jalons2(avec2((d) => { d.appel.reprises = 2; d.leurresApres = ['contargo']; }))), [], 'un numéro appelé APRÈS le quai ne compte pas');
  const p = (cr) => avec2((d) => { d.planning = cr; });
  egal(faux2(await jalons2(p(['Q5', 7]))), ['creneau'], 'Quai 5 à 10:30');
  egal(faux2(await jalons2(p(['Q6', 4]))), ['creneau'], 'Quai 6 à 09:00 (sur un créneau pris)');
  egal(faux2(await jalons2(p(['Q6', 3]))), ['creneau'], 'avant l’arrivée du camion');
  egal(faux2(await jalons2(p(['Q7', 10]))), ['creneau'], 'Quai 7 à 12:00 (attend trop)');
  // Une erreur ne se paie qu'une fois : le n° faux dans l'ordre ne coûte que le jalon 1 ; le courriel juste reste juste.
  egal(faux2(await jalons2(o((r) => { r.cont = 'PRPU 418720 3'; r.inst = ['rdv', 'scelle', 'vide']; }))), ['ot-conteneur'], 'n° faux dans l’ordre, courriel juste');
  // Rien de vrai sans le geste.
  const vide = await jalons2({});
  egal(IDS2.map((j) => vide[j]), IDS2.map(() => 'attente'), 'rien fait : tout « à faire »');
  egal([vide['ot-enregistre'], vide['bonus-hayon']], ['attente', 'null'], 'passage à faire, pas de bonus au standard');
  const non = await jalons2({ ordre: JUSTE2, enregistre: false });
  egal(IDS2.slice(0, 6).map((j) => non[j]), IDS2.slice(0, 6).map(() => 'attente'), 'ordre rempli mais pas enregistré');
  const ordreSeul = await jalons2({ ordre: JUSTE2 });
  egal([ordreSeul['ot-enregistre'], ordreSeul['courriel-destinataire'], ordreSeul['courriel-forme'], ordreSeul['appel-quai'], ordreSeul.creneau], ['ok', 'attente', 'attente', 'attente', 'attente'], 'ordre enregistré seulement');
});

// ─────────────────────────────────────────────────────────── l'unicité du créneau (avec et sans le créneau pris de plus)
await v('ENT-7.2 : planning — Quai 6 à 09:30 est la SEULE bonne réponse, avec et sans le créneau pris de plus (tous les quais × tous les créneaux)', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/decathlon-ent72.js');
    const { jalonsPlanning } = await import('/core/types/planning.js');
    const juste = (P) => { const out = [];
      for (const l of P.lignes.liste) for (let t = 0; t < 12; t++) {
        const db = { plannings: { [P.id]: { v1: { place: { cont: { r: l.id, s: t } } } } } };
        if (jalonsPlanning(db, P).L.every((x) => x.ok)) out.push(`${l.id}@${7 + t / 2}`);
      } return out; };
    const complet = S.PLANNING;
    const sans = { ...complet, lignes: { ...complet.lignes, liste: complet.lignes.liste.map((l) => (l.id === 'Q7' ? { ...l, occupe: l.occupe.slice(1) } : l)) } };
    return { complet: juste(complet), sans: juste(sans), pris: complet.lignes.liste.map((l) => l.occupe.length) };
  });
  egal(r.complet, ['Q6@9.5'], 'avec le créneau de plus');
  egal(r.sans, ['Q6@9.5'], 'sans le créneau de plus');
  egal(r.pris, [1, 2, 2], 'créneaux pris par quai (le Quai 7 en a un de plus que dans la version de base : 07:00–08:30)');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await v('ENT-7.2 : parcours juste à l’écran — 20 / 20, 3 questions au fil, quatre pastilles, menu progressif, réponses et messages neutres, Contargo cite le n° de l’ordre', async () => {
  await monter2({ uid: 'dk72-juste', db: { tirages: { [ID2]: tirage2() } } });
  const menu = async () => (await pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => b.dataset.vue || b.dataset.vueFermee)));
  let m = await menu();
  vrai(m.includes('fiche') && m.includes('mail') && !m.includes('telephone') && !m.includes('planning'), 'menu au départ : ' + m);
  egal(await pg.$$eval(`${Z} .ent-pastille.fait`, (L) => L.length), 0, 'aucune pastille faite au départ');
  const a0 = await note(); egal(a0 ? a0.score : 0, 0, 'inaction : 0');
  await remplir2(JUSTE2);
  egal(await pg.$$eval(`${Z} .ent-pastille.fait`, (L) => L.length), 1, 'pastille ordre');
  m = await menu(); vrai(!m.includes('telephone'), 'Téléphone au menu avant le premier courriel');
  await courriel2(MAIL_JUSTE);
  m = await menu(); vrai(m.includes('telephone') && !m.includes('planning'), 'après le courriel : Téléphone oui, Planning non : ' + m);
  const R = (await entrants()).filter((x) => /RE : /.test(x.subject));
  egal(R.length, 1, 'réponse de Contargo');
  vrai(/bien reçu votre ordre de transport OT-2027-0142 pour le conteneur PRPU 418270 3\./.test(R[0].text) && /lundi 01\/02 vers 9 h/.test(R[0].text), 'réponse : ' + R[0].text);
  await appel2();
  m = await menu(); vrai(m.includes('planning'), 'après l’appel : Planning au menu : ' + m);
  await planning2('Q6', 5);
  const n = await note();
  egal(ko2(n), [], 'jalons et questions');
  proche(n.score, 20, 'note');
  egal(await pg.$$eval(`${Z} .ent-pastille.fait`, (L) => L.length), 4, 'quatre pastilles faites');
  // Mehdi puis Claire reprennent le créneau choisi, sans dire si c'est juste.
  const E = await entrants();
  const mehdi = E.filter((x) => x.subject === 'Ton créneau').map((x) => x.text).join(' | '), claire = E.filter((x) => x.subject === 'Commande passée').map((x) => x.text).join(' | ');
  vrai(/Quai 6, lundi 01\/02 à 09:30/.test(mehdi), 'Mehdi reprend le créneau : ' + mehdi);
  vrai(/Commande passée, créneau réservé/.test(claire), claire);
  egal(E.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun message ne dit juste / faux / correct / erreur');
  const q = (await base()).questions[ID2];
  vrai(/Tu viens de taper « PRPU 418270 3 »/.test(q['chiffre-controle'].texte.enonce), 'question 1 ancrée sur ce qu’il a tapé : ' + q['chiffre-controle'].texte.enonce);
});

await v('ENT-7.2 : l’appel — les réactions du chef de quai ; le piège de la 2e réplique est « PRPU 418720 3 » ; le juste est le numéro de l’AVIS ; chaque maladresse compte une reprise', async () => {
  await monter2({ uid: 'dk72-appel', db: { tirages: { [ID2]: tirage2() }, gestes: { [ID2]: { 'courriel:envoyer': 1 } }, questions: { [ID2]: FIL3 } } });
  await aller('telephone');
  await pg.click(`${Z} [data-dlg-appeler="quai"]`); await pause();
  const dire = async (x) => { await pg.click(`${Z} [data-dlg-choix="${x}"]`); await pause(); };
  const fil = () => pg.textContent(`${Z} [data-dlg-fil]`);
  vrai(/Quai de réception de Rouvignies, Mehdi, j’écoute\./.test(await fil()), 'première réplique');
  await dire('camion');
  vrai(/C’est qui, et c’est pour quoi exactement/.test(await fil()), 'réaction à « Salut, c’est pour un camion »');
  await dire('lundi');
  vrai(/De la place pour quoi \? Tu es qui \?/.test(await fil()), 'réaction à « Tu as de la place lundi ? »');
  await dire('presente');
  vrai(/Bonjour, c’est Lea, du transport amont/.test(await fil()), 'présentation avec le prénom');
  const libs = await pg.$$eval(`${Z} [data-dlg-choix]`, (L) => L.map((b) => [b.dataset.dlgChoix, b.textContent.replace(/\s+/g, ' ').trim()]));
  egal(Object.fromEntries(libs.slice().sort()), { collection: 'C’est la collection printemps.', inverse: 'Oui : conteneur PRPU 418720 3, ordre de transport OT-2027-0142.',
    juste: 'Oui : conteneur PRPU 418270 3, ordre de transport OT-2027-0142.' }, 'choix de la 2e réplique (n° de l’avis, piège à deux chiffres inversés)');
  await dire('inverse');
  vrai(/Je ne le trouve pas, ce numéro\. Relis-le sur ton avis\./.test(await fil()), 'réaction au numéro inversé');
  await dire('collection');
  vrai(/dix par semaine/.test(await fil()), 'réaction à « la collection printemps »');
  await dire('juste');
  await dire('bateau');
  vrai(/Un bateau ne vient pas à mon quai/.test(await fil()), 'réaction au bateau');
  await dire('jeudi');
  vrai(/Jeudi, c’est le départ d’Anvers/.test(await fil()), 'réaction à jeudi');
  await dire('juste');
  await dire('salut');
  vrai(/Tu me l’envoies, le planning \?/.test(await fil()), 'réaction à « C’est bon, salut ! »');
  await dire('merci');
  await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
  const E = (await base()).dialogues[ID2];
  egal(E.quai.appels[0].reprises, 7, 'sept maladresses = sept reprises');
  const reactions = await fil();
  vrai(!PRIS_MSG.test(reactions.replace(/Oui : conteneur[^.]*\./g, '')), 'le fil de l’appel ne dit ni juste, ni faux, ni correct, ni erreur : ' + reactions);
});

await v('ENT-7.2 : les contacts du Téléphone (répertoire par ordre alphabétique) ; un mauvais numéro tombe sur une messagerie vocale neutre, rangée et lue par `leurresAppeles`', async () => {
  await monter2({ uid: 'dk72-leurre', db: { tirages: { [ID2]: tirage2() }, gestes: { [ID2]: { 'courriel:envoyer': 1 } }, questions: { [ID2]: FIL3 } } });
  await aller('telephone');
  egal(await pg.$$eval(`${Z} .dlg-contact b`, (L) => L.map((b) => b.textContent)), ['Claire Vasseur', 'Contargo — réservations', 'Quai de réception — Rouvignies'], 'répertoire');
  await pg.click(`${Z} [data-dlg-appeler="contargo"]`); await pause();
  vrai(/messagerie du service réservations de Contargo/.test(await pg.textContent(`${Z} .dlg-droite`)), 'messagerie vocale de Contargo');
  vrai(!PRIS_MSG.test(await pg.textContent(`${Z} .dlg-droite`)), 'messagerie vocale neutre');
  await pg.click(`${Z} [data-dlg-raccrocher-leurre]`); await pause();
  const E = (await base()).dialogues[ID2];
  egal(E['@leurres'].map((x) => x.id), ['contargo'], 'appel rangé');
  vrai(!!(await base()).gestes[ID2]['dialogue:contargo:appeler'], 'geste rangé');
  // La lecture du moteur : ce contact, appelé avant le quai, est compté (le jalon 10 en fait une reprise).
  const avant = await pg.evaluate(async () => {
    const { leurresAppeles } = await import('/core/types/dialogue.js');
    const e = JSON.parse(JSON.stringify(window.__f.db.dialogues['decathlon-ordre-transport']));
    e.quai = { appels: [{ debut: Date.now() + 5000, pas: [], reprises: 0 }] };
    return leurresAppeles(e, { avant: 'quai' });
  });
  egal(avant, ['contargo'], 'leurres appelés avant le quai');
});

// ─────────────────────────────────────────────────────────── les pièges à l'écran
await v('ENT-7.2 : inaction 0 — ordre vide refusé (« Il manque »), ordre incomplet refusé, travail gardé, le menu ne s’ouvre pas', async () => {
  await monter2({ uid: 'dk72-vide', db: { tirages: { [ID2]: tirage2() } } });
  await aller('fiche');
  await pg.click(`${Z} [data-fiche-envoyer]`); await pause();
  const m = await pg.$eval(`${Z} [data-fiche-manque]`, (e) => e.textContent);
  vrai(/Il manque/.test(m) && /le transporteur/.test(m) && /le n° de conteneur/.test(m) && /le poids brut/.test(m), 'ordre vide refusé : ' + m);
  egal((await note() || { score: 0 }).score, 0, 'note de l’inaction');
  await remplir2({ presta: 'contargo', cont: 'PRPU 418270 3', type: '40hc' }, { enregistrer: false });
  await pg.click(`${Z} [data-fiche-envoyer]`); await pause();
  const m2 = await pg.$eval(`${Z} [data-fiche-manque]`, (e) => e.textContent);
  vrai(/le n° de scellé/.test(m2) && !/le n° de conteneur/.test(m2), 'ordre à moitié refusé : ' + m2);
  const db = await base();
  egal([db.fiches.ot.envoye, db.fiches.ot.valeurs.cont], [undefined, 'PRPU 418270 3'], 'pas enregistré, travail gardé');
  vrai(!(await pg.$(`${Z} .ent-nav[data-vue="telephone"]`)), 'Téléphone au menu sans courriel');
  // Le seul geste qui compte (première question notée répondue) : 1 point, rien de plus.
  egal((await note()).score, 1, 'la question du chiffre de contrôle, seule, vaut 1');
});

await v('ENT-7.2 : pièges à l’écran — courriel SANS pièce jointe : jalon 8 faux et réponse « merci de nous transmettre l’ordre » ; ordre envoyé au quai : jalon 8 faux, aucune réponse', async () => {
  await monter2({ uid: 'dk72-sanspj', db: { tirages: { [ID2]: tirage2() } } });
  await remplir2(JUSTE2);
  await courriel2({ ...MAIL_JUSTE, pj: [] });
  let R = (await entrants()).filter((x) => /RE : /.test(x.subject));
  vrai(/nous ne pouvons pas enregistrer votre demande sans l’ordre de transport\. Merci de nous le transmettre en pièce jointe\./.test(R[0].text), 'réponse sans pièce : ' + R[0].text);
  vrai(!/PRPU/.test(R[0].text), 'la réponse sans pièce cite un numéro');
  let n = await note();
  egal([n.detail['courriel-destinataire'], n.detail['courriel-forme']], ['ko', 'ok'], 'jalon 8 faux, forme juste (une erreur, un jalon)');
  // Puis le bon courriel : le jalon 8 devient juste (jugé sur un courriel qui porte l'ordre à Contargo, pas sur le dernier envoyé).
  await courriel2(MAIL_JUSTE);
  n = await note();
  egal(n.detail['courriel-destinataire'], 'ok', 'jalon 8 après le bon courriel');
  await courriel2({ a: 'claire', objet: 'Info', corps: 'ok', pj: [] });
  n = await note();
  egal([n.detail['courriel-destinataire'], n.detail['courriel-forme']], ['ok', 'ok'], 'un courriel de plus, à Claire, ne change rien');
  R = (await entrants()).filter((x) => /RE : /.test(x.subject));
  egal(R.length, 2, 'Claire ne répond pas');
  await monter2({ uid: 'dk72-quai', db: { tirages: { [ID2]: tirage2() } } });
  await remplir2(JUSTE2);
  await courriel2({ ...MAIL_JUSTE, a: 'quai' });
  n = await note();
  egal([n.detail['courriel-destinataire'], n.detail['courriel-forme']], ['ko', 'ok'], 'ordre au quai');
  egal((await entrants()).filter((x) => /RE : /.test(x.subject)).length, 0, 'le quai ne répond pas par courriel');
});

await v('ENT-7.2 : les autres prestataires répondent avec LEURS horaires (route : mardi 02/02 vers 8 h ; rail : mercredi 03/02 vers 10 h), citent le n° de l’ordre, ne disent pas si c’est juste', async () => {
  await monter2({ uid: 'dk72-autres', db: { tirages: { [ID2]: tirage2() } } });
  await remplir2(JUSTE2);
  await courriel2({ ...MAIL_JUSTE, a: 'routiers' });
  await courriel2({ ...MAIL_JUSTE, a: 'rail' });
  const R = (await entrants()).filter((x) => /RE : /.test(x.subject));
  egal(R.length, 2, 'deux réponses');
  vrai(R[0].text.includes('PRPU 418270 3. Enlèvement confirmé : départ du camion vendredi 29/01, livraison à votre quai mardi 02/02 vers 8 h.') && R[0].text.includes('Routiers du Hainaut'), R[0].text);
  vrai(R[1].text.includes('PRPU 418270 3. Enlèvement confirmé : départ du train vendredi 29/01, livraison à votre quai mercredi 03/02 vers 10 h.') && R[1].text.includes('Rail Flandres-Artois'), R[1].text);
  egal(R.filter((x) => PRIS_MSG.test(x.text)).length, 0, 'réponses neutres');
  const n = await note();
  egal([n.detail['courriel-destinataire'], n.detail['courriel-forme']], ['ko', 'ok'], 'ni Contargo ni l’ordre juste : jalon 8 faux, la forme se juge sur le dernier courriel à un prestataire');
});

await v('ENT-7.2 : une erreur ne se paie qu’une fois — n° faux dans l’ordre, courriel juste : jalon 1 faux, jalon 8 vrai, et la réponse de Contargo cite le n° de L’ÉLÈVE (pas celui de l’avis)', async () => {
  await monter2({ uid: 'dk72-une-fois', db: { tirages: { [ID2]: tirage2() } } });
  await remplir2({ ...JUSTE2, cont: 'PRPU 418720 3' });
  await courriel2({ ...MAIL_JUSTE, objet: 'Ordre de transport OT-2027-0142' });
  const R = (await entrants()).filter((x) => /RE : /.test(x.subject));
  vrai(/pour le conteneur PRPU 418720 3\./.test(R[0].text) && !/418270/.test(R[0].text), 'Contargo cite le n° écrit dans l’ordre : ' + R[0].text);
  const n = await note();
  egal([n.detail['ot-conteneur'], n.detail['courriel-destinataire'], n.detail['courriel-forme']], ['ko', 'ok', 'ok'], 'seul le jalon 1 est faux');
  // Le chef de quai, lui, lit l'AVIS : le choix juste de la 2e réplique reste le n° de l'avis.
  await aller('telephone');
  await pg.click(`${Z} [data-dlg-appeler="quai"]`); await pause();
  await pg.click(`${Z} [data-dlg-choix="presente"]`); await pause();
  vrai(/Oui : conteneur PRPU 418270 3, ordre de transport/.test(await pg.textContent(`${Z} [data-dlg-choix="juste"]`)), 'choix juste = n° de l’avis');
});

await v('ENT-7.2 : l’appel compte les reprises à l’écran — 3 maladresses → jalon 10 faux ; mauvais numéro (Claire) puis 1 maladresse → vrai, 2 maladresses → faux', async () => {
  for (const [uid, leurres, sauf, attendu] of [
    ['dk72-r3', [], { accueil: ['camion', 'lundi'], refs: ['inverse'] }, 'ko'],
    ['dk72-r2', [], { accueil: ['camion'], refs: ['inverse'] }, 'ok'],
    ['dk72-l1', ['claire'], { accueil: ['camion'] }, 'ok'],
    ['dk72-l2', ['claire'], { accueil: ['camion', 'lundi'] }, 'ko'],
  ]) {
    await monter2({ uid, db: { tirages: { [ID2]: tirage2() }, gestes: { [ID2]: { 'courriel:envoyer': 1 } }, questions: { [ID2]: FIL3 } } });
    await appel2({ leurres, sauf });
    const n = await note();
    egal(n.detail['appel-quai'], attendu, `${uid} : jalon 10`);
  }
});

await v('ENT-7.2 : le créneau à l’écran — Quai 5 à 10:30 fait tomber le jalon 11 seul ; Quai 6 à 09:30 le rend juste ; le guidage dit QUE le quai est pris', async () => {
  const base2 = { tirages: { [ID2]: tirage2() }, gestes: { [ID2]: { 'courriel:envoyer': 1 } }, questions: { [ID2]: FIL3 },
    dialogues: { [ID2]: { quai: { appels: [{ debut: 1, fin: 2, pas: [], reprises: 0 }] } } } };
  await monter2({ uid: 'dk72-pl5', db: base2 });
  await planning2('Q5', 7);
  let n = await note();
  egal(n.detail.creneau, 'ko', 'Quai 5 à 10:30');
  await monter2({ uid: 'dk72-pl6', db: base2 });
  await aller('planning');
  await pg.click(`${Z} [data-pl-id="cont"][data-pl-vue="b"]`);
  const sel = (r, t) => `${Z} [data-pl-grille] [data-pl-case][data-r="${r}"][data-t="${t}"]`;
  await pg.$eval(sel('Q6', 4), (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel('Q6', 4), { force: true }); await pause();
  const pb = await pg.$$eval(`${Z} [data-pl-problemes] li`, (L) => L.map((x) => x.textContent.trim()));
  egal(pb, ['Quai 6 est déjà pris à ce moment-là.'], 'problème en direct (que, jamais de combien)');
  await planning2('Q6', 5);
  n = await note();
  egal(n.detail.creneau, 'ok', 'Quai 6 à 09:30');
});

// ─────────────────────────────────────────────────────────── confirmé, Avant de commencer
await v('ENT-7.2 : confirmé — une instruction fausse de plus (« Hayon élévateur obligatoire »), +0,5 si elle n’est pas cochée ; standard → null ; le mot « bonus » n’est pas à l’écran', async () => {
  await monter2({ uid: 'dk72-conf', aisance: 'confirme', db: { tirages: { [ID2]: tirage2({ bonus: ['in-hayon'] }) } } });
  await aller('fiche');
  const libs = await pg.$$eval(`${Z} input[data-fiche-case="inst"]`, (L) => L.map((i) => i.value).sort());
  egal(libs, ['adr', 'froid', 'hayon', 'rdv', 'scelle', 'vide'], 'six instructions');
  vrai(/Hayon élévateur obligatoire\./.test(await pg.textContent(`${Z} [data-fiche="ot"]`)), 'texte de la 6e instruction');
  vrai(!/bonus/i.test(await pg.evaluate((Z) => document.querySelector(Z).innerText, Z)), 'le mot « bonus » est à l’écran');
  const statut = (inst) => pg.evaluate(async ({ inst }) => {
    const S = await import('/contenus/decathlon-ent72.js');
    const db = JSON.parse(JSON.stringify(window.__f.db));
    db.fiches = { ot: { valeurs: { inst }, envoye: { at: 1 } } };
    return S.ETAPES.find((e) => e.id === 'bonus-hayon').verifier(db).status;
  }, { inst });
  egal(await statut(['rdv', 'scelle', 'vide']), 'ok', 'hayon non coché');
  egal(await statut(['rdv', 'scelle', 'vide', 'hayon']), 'ko', 'hayon coché');
  // Hayon coché : le jalon 6 (instructions) ne le juge pas (une erreur, un seul endroit).
  const j6 = await pg.evaluate(async () => {
    const S = await import('/contenus/decathlon-ent72.js');
    const db = JSON.parse(JSON.stringify(window.__f.db));
    db.fiches = { ot: { valeurs: { inst: ['rdv', 'scelle', 'vide', 'hayon'] }, envoye: { at: 1 } } };
    return S.ETAPES.find((e) => e.id === 'ot-instructions').verifier(db).status;
  });
  egal(j6, 'ok', 'jalon 6 sur un confirmé qui coche le hayon');
  const standard = await jalons2({});
  egal(standard['bonus-hayon'], 'null', 'standard : rien');
});

await v('ENT-7.2 : Avant de commencer — 4 questions tirées (2 préparation, 2 droit), la banque en a au moins le double par rubrique ; d4 retirée', async () => {
  await monter2({ uid: 'dk72-ouverture', sansOuverture: true });
  const db = await base();
  const r = await pg.evaluate(async () => {
    const { QUESTIONS } = await import('/contenus/questions/ENT-7.2.js');
    return { rub: Object.fromEntries(QUESTIONS.liste.filter((q) => q.type === 'ouverture').map((q) => [q.id, q.rubrique])), tirage: QUESTIONS.ouverture.tirage };
  });
  const ids = db.questions[ID2]['@tirage'].ids;
  const parRub = (L) => L.reduce((o, id) => ({ ...o, [r.rub[id]]: (o[r.rub[id]] || 0) + 1 }), {});
  const tri = (o) => Object.fromEntries(Object.entries(o).sort());
  egal(tri(parRub(ids)), tri({ preparation: 2, droit: 2 }), 'tirées : ' + ids.join(', '));
  egal(Object.keys(r.rub).sort(), ['d1', 'd2', 'd3', 'd5', 'p1', 'p2', 'p3', 'p4', 'p5'], 'la banque (d4 retirée)');
  const banque = parRub(Object.keys(r.rub));
  vrai(Object.entries(r.tirage).every(([k, n]) => banque[k] >= 2 * n), 'banque : ' + JSON.stringify(banque));
  vrai(await present('.ent-nav[data-vue="ouverture"]'), 'écran d’ouverture au menu');
});

// ─────────────────────────────────────────────────────────── l'écran
for (const [w, h] of [[1366, 768], [1280, 720]]) {
  await v(`ENT-7.2 : ergonomie ${w} × ${h} — l’ordre (confirmé, 6 instructions), le courriel (3 pièces jointes), le téléphone en appel et le planning tiennent sans défilement de page`, async () => {
    await pg.setViewportSize({ width: w, height: h });
    try {
      const cree = { tirages: { [ID2]: tirage2({ bonus: ['in-hayon'] }) }, mails: [{ folder: 'in', to: 'Lea', subject: 'x', from: 'C', text: 'x' }] };
      const mesure = async (vue) => pg.evaluate(({ vue }) => {
        window.scrollTo(0, 0);
        const hote = document.querySelector('#fTest'), cartes = document.querySelector('#fTest .ent-cartes-ancre');
        const d = document.scrollingElement;
        const c = cartes ? cartes.getBoundingClientRect().height : 0;
        const p = document.querySelector('#fTest .ent-page');
        return { vue, page: p.scrollHeight - c, h: innerHeight, large: d.scrollWidth - innerWidth }; }, { vue });
      const ferme = async () => { await pg.$$eval('[data-carte-fermer]', (L) => L.forEach((b) => b.click())); await pause(150); };
      // L'ordre : non enregistré, avec son bouton.
      await monter2({ uid: 'dk72-ecran', aisance: 'confirme', db: cree });
      await aller('fiche'); await ferme();
      let m = await mesure('fiche');
      const bouton = await pg.evaluate(() => document.querySelector('#fTest [data-fiche-envoyer]').getBoundingClientRect().bottom);
      vrai(m.page <= h + 1 && bouton <= h && m.large <= 0, `ordre : page ${Math.round(m.page)}, bouton ${Math.round(bouton)}, large ${m.large} (pour ${h})`);
      // Le courriel.
      await remplir2(JUSTE2);
      await aller('mail');
      if (!(await present('[data-courriel]'))) { await pg.click(`${Z} [data-nouveau]`); await pause(); }
      await pg.selectOption(`${Z} #cA`, 'contargo');
      await pg.fill(`${Z} #cObj`, 'Ordre de transport OT-2027-0142');
      await pg.fill(`${Z} #cMsg`, 'Bonjour,\n\nVoici l’ordre.\n\nCordialement,\nLea');
      for (const id of ['cahier', 'avis', 'fiche:ot']) { await pg.click(`${Z} [data-c-joindre]`); await pg.click(`${Z} [data-c-joint="${id}"]`); await pause(); }
      await ferme();
      m = await mesure('courriel');
      vrai(m.page <= h + 1 && m.large <= 0, `courriel : page ${Math.round(m.page)}, large ${m.large} (pour ${h})`);
      await pg.fill(`${Z} #cObj`, '');
      await pg.click(`${Z} [data-c-envoyer]`); await pause();
      const conf = await pg.evaluate(() => document.querySelector('#fTest [data-c-confirme]').getBoundingClientRect().bottom + document.scrollingElement.scrollTop);
      vrai(conf <= h, `confirmation du courriel à ${Math.round(conf)} (pour ${h})`);
      // Le téléphone, en plein appel.
      await monter2({ uid: 'dk72-ecran2', db: { ...cree, gestes: { [ID2]: { 'courriel:envoyer': 1 } }, questions: { [ID2]: FIL3 } } });
      await aller('telephone');
      await pg.click(`${Z} [data-dlg-appeler="quai"]`); await pause();
      for (const x of ['camion', 'presente', 'inverse', 'juste']) { await pg.click(`${Z} [data-dlg-choix="${x}"]`); await pause(); }
      await ferme();
      m = await mesure('telephone');
      vrai(m.page <= h + 1 && m.large <= 0, `téléphone : page ${Math.round(m.page)}, large ${m.large} (pour ${h})`);
      // Le planning.
      await monter2({ uid: 'dk72-ecran3', db: { ...cree, gestes: { [ID2]: { 'courriel:envoyer': 1 } }, questions: { [ID2]: FIL3 }, dialogues: { [ID2]: { quai: { appels: [{ debut: 1, fin: 2, pas: [], reprises: 0 }] } } } } });
      await aller('planning'); await ferme();
      m = await mesure('planning');
      vrai(m.page <= h + 1 && m.large <= 0, `planning : page ${Math.round(m.page)}, large ${m.large} (pour ${h})`);
    } finally { await pg.setViewportSize({ width: 1366, height: 900 }); }
  });
}

await v('ENT-7.2 : documents — l’avis, le cahier et le devis portent les valeurs TIRÉES (poids, scellé, référence, CO₂ calculé sur le poids) ; aucun ne dit quelles instructions sont fausses', async () => {
  await monter2({ uid: 'dk72-docs', db: { tirages: { [ID2]: tirage2({ valeurs: { poids: 15800, ref: 7, scelle: 1234567 } }) } } });
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/decathlon-ent72.js');
    const html = (id) => S.DOCUMENTS.find((d) => d.id === id).html(window.__f.db);
    return { avis: html('avis'), cahier: html('cahier'), devis: html('devis') };
  });
  vrai(/15[s  ]800 kg/.test(r.avis) && /DC 1 234 567/.test(r.avis) && /PO-ROU-2027-0007/.test(r.avis) && /PRPU 418270 3/.test(r.avis), 'avis');
  vrai(/15[s  ]800 kg/.test(r.cahier) && /PO-ROU-2027-0007/.test(r.cahier), 'cahier');
  vrai(/135 kg de CO₂|\d+ kg de CO₂/.test(r.devis), 'devis : CO₂ calculé');
  const tout = r.avis + r.cahier + r.devis;
  vrai(!/frigorifique|ADR|hayon|zone sous douane/i.test(tout.replace(/non dangereuses/g, '')), 'un document donne le texte d’une instruction fausse');
  vrai(PRIS_MSG.test(tout) === false, 'un document dit « juste / faux / correct / erreur »');
});

await v('ENT-7.1 : aucune erreur JavaScript pendant le bloc', async () => { egal(erreursF.filter((e) => !/favicon/.test(e)), [], 'erreurs'); });
await F.fermer();
}
