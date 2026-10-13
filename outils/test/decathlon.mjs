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

await v('ENT-7.1 : aucune erreur JavaScript pendant le bloc', async () => { egal(erreursF.filter((e) => !/favicon/.test(e)), [], 'erreurs'); });
F.fermer();
}
