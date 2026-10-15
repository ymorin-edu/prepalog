// Suite de tests de Prepalog — bloc « decathlon-74 » : Decathlon ENT-7.4, l'ÉVALUATION « un conteneur pour Dourges » (un bloc par séance, comme France Boissons).
// `node outils/test.mjs decathlon-74` ne lance que ce bloc. Aides communes : `outils/test/france-boissons/commun.mjs`. Brief : `docs/briefs/ENT-7.4-decathlon-evaluation-dourges.md`.
//
// Valeurs ÉCRITES À LA MAIN (recalculées le 15/10/2026 sur les kilomètres de la carte vers Dourges : route 153 km ; barge 263 + camion 3 ; rail 162 + camion 3) :
//   chiffre de contrôle ISO 6346 : PRPU 602215 → 5 (27 + 58 + 108 + 256 + 96 + 0 + 128 + 256 + 256 + 2560 = 3745 = 340 × 11 + 5) ;
//   CO₂ à 13,95 t vers Dourges : route 109, barge 76, rail 39 kg ; (le brief disait 107 / 82 / 49 sur ses distances provisoires).
// Deux élèves TÉMOINS (tirage posé à la main) : 13 950 kg, route 640 €, barge 720 €, rail 690 €, hors liste E-Flux Logistique (570 €, 18 kg).
//   `rt4-barge` : la barge arrive vendredi 12/03 → restent la route et le rail → bonne réponse : le RAIL (39 kg).
//   `rt4-rail`  : le rail arrive jeudi 11/03 → restent la route et la barge → bonne réponse : la BARGE (76 kg).
// Poids (brief §5, répartis en jalons le 15/10/2026) : besoin 1 + 1 · tri 1,5 + 1,5 · comparaison 1,5 + 1,5 · décision 1 + 1 · ordre 2 + 1 + 1 ·
// courriel 1,5 + 0,5 · appel 1 = 17 ; questions clés 3 (`part`).

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, entrants, erreursF } = F;
await pg.emulateMedia({ reducedMotion: 'reduce' });

const ID = 'decathlon-evaluation-dourges';
const REP_OUV = { 'k-p1': 'long', 'k-p2': 'libre', 'k-p3': 'verifie', 'k-p4': 'commande', 'k-p5': 'ferme', 'k-p6': 'engage',
  'k-d1': 'cahier', 'k-d2': 'oui', 'k-d3': 'non', 'k-d4': 'engagement' };
const tirage = (retard, valeurs = {}) => ({ graine: `temoin74-${retard}|${ID}`,
  pieces: { retard: [retard], horsListe: ['hl4-eflux'], instructions: ['in4-froid', 'in4-adr'] },
  difficultes: { retard: { [retard]: 'moyen' }, horsListe: { 'hl4-eflux': 'difficile' }, instructions: { 'in4-froid': 'moyen', 'in4-adr': 'moyen' } },
  valeurs: { serie: 0, scelle: 772061, poids: 13950, ref: 381, contenu: 0, prixRoute: 640, prixBarge: 720, prixRail: 690, ...valeurs }, essai: 0, secours: false, at: 1 });

// Un constructeur de base d'élève, dans la page : le parcours JUSTE d'un témoin, modifié par des écarts décrits en données (JSON).
//   o.retard : 'rt4-barge' | 'rt4-rail' ; o.retenue : slot retenu (défaut : la bonne réponse) ; o.cmp / o.ot : cases à écraser ; o.tri : { slot: { liste, date } } ;
//   o.mail : { a, corps, objet } ; o.appel : { refs, arrivee } ; o.rien : { cmp, ot, mail, appel } (étapes non faites).
await pg.evaluate(() => {
  window.__b74 = async (o) => {
    const D = await import('/contenus/decathlon-ent74-donnees.js');
    const g = `temoin74-${o.retard}|${D.ID}`;
    const pieces = { retard: [o.retard], horsListe: ['hl4-eflux'], instructions: ['in4-froid', 'in4-adr'] };
    const db = { tirages: { [D.ID]: { graine: g, pieces, difficultes: {}, valeurs: { serie: 0, scelle: 772061, poids: 13950, ref: 381, contenu: 0, prixRoute: 640, prixBarge: 720, prixRail: 690 },
      essai: 0, secours: false, at: 1 } }, mails: [], fiches: {}, courriels: {}, dialogues: {} };
    const J = D.jeuEleve(db);
    const retenue = o.retenue || J.bonne.slot, off = J.offres.find((x) => x.slot === retenue);
    const cases = {};
    J.offres.forEach((x) => { cases[D.casePrix(J, x.slot)] = String(x.prix); cases[D.caseCO2(J, x.slot)] = String(x.co2); });
    const tri = {};
    J.offres.forEach((x) => { tri[x.slot] = { liste: x.referencee, date: x.tient }; });
    Object.entries(o.tri || {}).forEach(([s, t]) => { tri[s] = { ...tri[s], ...t }; });
    const presta = off.referencee ? D.PRESTA_DE[off.slot] : 'rail';
    if (!(o.rien && o.rien.cmp)) {
      db.fiches[D.CMP] = { envoye: true, valeurs: { limite: '2027-03-10', heure: '14:00', budget: 850, critere: 'co2', tri, offres: { cases: { ...cases, ...(o.cases || {}) } },
        retenue, justif: 'date-co2', ...(o.cmp || {}) } };
    }
    if (!(o.rien && o.rien.ot)) {
      db.fiches[D.OT] = { envoye: true, valeurs: { presta, cont: J.conteneur, type: '40hc', scelle: J.scelle, poids: String(J.poids), enl: 'anvers', dispo: '2027-03-01',
        ref: J.reference, liv: 'dourges', limd: '2027-03-10', limh: '14:00', inst: ['rdv', 'scelle', 'vide'], ...(o.ot || {}) } };
    }
    if (!(o.rien && o.rien.mail)) {
      const m = o.mail || {};
      db.courriels[D.ID] = { envoyes: [{ a: m.a || presta, objet: m.objet || `Ordre de transport ${D.OT_NUM} — conteneur ${J.conteneur}`, pieces: m.pieces || [`fiche:${D.OT}`],
        corps: m.corps || `Bonjour,\n\nVeuillez trouver ci-joint l’ordre de transport ${D.OT_NUM} pour le conteneur ${J.conteneur}.\n\nCordialement,\nLea Test, Decathlon`, at: 5 }] };
    }
    if (!(o.rien && o.rien.appel)) {
      const a = o.appel || {};
      db.dialogues[D.ID] = { quai: { appels: [{ debut: 6, fin: 9, ordres: {}, textes: {}, reprises: 0,
        pas: [{ r: 'accueil', v: 'presente', at: 6 }, { r: 'refs', v: a.refs || 'juste', at: 7 }, { r: 'arrivee', v: a.arrivee || 'commandee', at: 8 }] }] } };
    }
    // « Avant de commencer » : les 3 questions tirées (1 de préparation, 2 de droit) et leurs réponses (toutes justes par défaut).
    const JUSTES = { 'k-p1': 'long', 'k-p2': 'libre', 'k-p3': 'verifie', 'k-p4': 'commande', 'k-p5': 'ferme', 'k-p6': 'engage', 'k-d1': 'cahier', 'k-d2': 'oui', 'k-d3': 'non', 'k-d4': 'engagement' };
    const ids = o.tirees || ['k-p1', 'k-d1', 'k-d4'];
    db.questions = { [D.ID]: { '@tirage': { graine: 'essai', ids, q: {}, at: 1 } } };
    ids.forEach((id) => { const r = o.reponses && id in o.reponses ? o.reponses[id] : JUSTES[id]; if (r !== null) db.questions[D.ID][id] = { arrivee: 1, premiere: r, duree: 1 }; });
    return db;
  };
});
const construire = (o) => pg.evaluate((o) => window.__b74(o), o);

// Monte la séance dans la page. Les réponses d'« Avant de commencer » (`rep`) sont posées si la base n'en a pas.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/decathlon-evaluation-dourges.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (o.rep) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'dk74' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'DK',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: REP_OUV, ...o });
const menu = async () => pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => b.dataset.vue || b.dataset.vueFermee));
const IDS = ['besoin-date', 'besoin-budget', 'tri-liste', 'tri-date', 'comparer-route', 'comparer-bonne', 'decision-offre', 'decision-justif',
  'ot-conteneur', 'ot-transport', 'ot-instructions', 'courriel-destinataire', 'courriel-forme', 'appel-quai'];
// Les jalons faux d'une note enregistrée, et sa note.
const kos = (n) => IDS.filter((id) => n.detail[id] === 'ko');
// Une base fabriquée, jugée par l'activité montée : { note, kos }.
async function jugee(o) {
  const n = await pg.evaluate(async (o) => {
    const A = await import('/activites/decathlon-evaluation-dourges.js');
    return A.noter(await window.__b74(o));
  }, o);
  return { n, ko: kos(n) };
}

// ─────────────────────────────────────────────────────────── les données
await v('ENT-7.4 : données — PRPU 602215 → 5, CO₂ à 13,95 t (109 / 76 / 39), témoins, 300 élèves : jeux équitables, aucun secours, 40-60 % de barge en retard, numéros ≠ 7.1 à 7.3, numéro « lu à l’envers » jamais valable', async () => {
  const r = await pg.evaluate(async () => {
    const U = await import('/contenus/decathlon.js');
    const D = await import('/contenus/decathlon-ent74-donnees.js');
    const dt = (retard) => { const J = D.jeuDe({ retard }); return { conteneur: J.conteneur, piege: J.piege, scelle: J.scelle, reference: J.reference, poids: J.poids, bonne: J.bonne.slot,
      offres: Object.fromEntries(J.offres.map((o) => [o.slot, [o.prix, o.co2, o.tient, o.referencee]])) }; };
    const out = { secours: 0, ecarts: [], barge: 0, series: new Set(), contenus: new Set(), fausses: new Set() };
    for (let i = 0; i < 200; i++) {
      const g = `eleve-${i}|${D.ID}`, t = D.TIRAGE.tirer(g);
      if (t.secours) out.secours++;
      const J = D.jeuEleve({ tirages: { [D.ID]: { graine: g, ...t } } });
      const e = D.ecartsEquite(J); if (e.length) out.ecarts.push(`${i} : ${e.join(' ; ')}`);
      if (J.retard === 'barge') out.barge++;
      out.series.add(J.conteneur); out.contenus.add(J.contenu); J.fausses.forEach((f) => out.fausses.add(f));
    }
    const piegesValables = D.SERIES.filter((s) => { const p = D.seriePiege(s); return !p || U.chiffreControle('PRPU' + p) === U.chiffreControle('PRPU' + s); });
    return { cc: U.chiffreControle('PRPU602215'), barge: dt('rt4-barge'), rail: dt('rt4-rail'), secours: out.secours, ecarts: out.ecarts, nbBarge: out.barge, series: out.series.size,
      contenus: out.contenus.size, fausses: [...out.fausses].sort(), banque: D.SERIES, piegesValables };
  });
  egal(r.cc, 5, 'chiffre de contrôle');
  egal(r.barge, { conteneur: 'PRPU 602215 5', piege: 'PRPU 062215 5', scelle: 'DC 0 772 061', reference: 'PO-DOU-2027-0381', poids: 13950, bonne: 'rail',
    offres: { route: [640, 109, true, true], barge: [720, 76, false, true], rail: [690, 39, true, true], horsliste: [570, 18, true, false] } }, 'témoin rt4-barge');
  egal(r.rail.bonne, 'barge', 'témoin rt4-rail : la bonne réponse est la barge');
  egal(r.rail.offres, { route: [640, 109, true, true], barge: [720, 76, true, true], rail: [690, 39, false, true], horsliste: [570, 18, true, false] }, 'témoin rt4-rail');
  egal([r.secours, r.ecarts, r.piegesValables], [0, [], []], 'secours, écarts d’équité, numéros piège valables');
  vrai(r.nbBarge >= 80 && r.nbBarge <= 120, `${r.nbBarge} élèves sur 200 ont la barge en retard (40 à 60 % attendus)`);
  vrai(r.series >= 7 && r.contenus === 3, `${r.series} numéros et ${r.contenus} contenus différents sur 200 élèves`);
  egal(r.fausses, ['adr', 'douane', 'froid'], 'les trois instructions fausses sont tirées');
  const de = ['418207', '306552', '527190', '611348', '245873', '739016', '418270', '530982', '271645', '904316', '362708', '687153', '530641', '184926', '762305', '297814', '846159', '413687'];
  vrai(r.banque.length === 8 && r.banque.every((s) => !de.includes(s)), 'la banque de numéros doit différer de celles d’ENT-7.1 à 7.3 : ' + r.banque);
});

// ─────────────────────────────────────────────────────────── le montage et le menu
await v('ENT-7.4 : montage et menu — évaluation (copie, temps « evaluation », 20 points), pas d’erreur de chargement ; au départ un message de Claude, ni ordre ni téléphone, quatre pastilles à « à faire »', async () => {
  const m = await pg.evaluate(async () => {
    const A = await import('/activites/decathlon-evaluation-dourges.js');
    const R = await import('/activites/index.js');
    return { pret: A.meta.pret, ouverture: A.meta.ouverture, code: A.meta.code, temps: A.meta.temps, bareme: A.meta.bareme, niveaux: A.meta.niveaux, comp: A.meta.competences,
      copie: A.meta.copie, prevus: A.meta.niveauxPrevus, parcours: A.meta.parcours, noter: typeof A.noter, enEchec: (R.activitesEnEchec ? R.activitesEnEchec() : []).map((x) => x.id || x) };
  });
  egal([m.pret, m.code, m.temps, m.bareme, m.niveaux, m.comp, m.copie, m.noter, m.parcours],
    [true, 'ENT-7.4', 'evaluation', 20, ['1re'], ['C2.6'], true, 'function', undefined], 'meta');
  egal(m.ouverture, 'prof', 'ouverture réservée à l’enseignant');
  egal(m.enEchec, [], 'séances écartées du registre');
  await monter({ uid: 'dk74-menu', db: { tirages: { [ID]: tirage('rt4-barge') } } });
  const mn = await menu();
  vrai(mn.includes('fiche') && mn.includes('mail') && mn.includes('itineraires'), 'menu au départ : ' + mn);
  vrai(!mn.includes('fiche:ot4') && !mn.includes('telephone') && !mn.includes('planning'), 'ni ordre de transport ni téléphone au départ : ' + mn);
  egal(await pg.$$eval(`${Z} .ent-pastille.fait`, (L) => L.length), 0, 'aucune pastille faite au départ');
  egal(await pg.$$eval(`${Z} .ent-pastille`, (L) => L.length), 4, 'quatre pastilles');
  const E = await entrants();
  egal(E.length, 1, 'un seul message au départ (Claire)');
  vrai(/Un conteneur pour Dourges/.test(E[0].subject) && /Je suis en déplacement toute la semaine/.test(E[0].text) && E[0].pieces.length === 7, 'message de Claire et ses sept pièces : ' + E[0].pieces);
  egal(E[0].ouvreFiche, 'cmp4', 'le message ouvre le comparateur');
});

// ─────────────────────────────────────────────────────────── l'inaction, le parcours juste
await v('ENT-7.4 : inaction 0 et parcours juste 20 / 20 pour les DEUX témoins (le rail, puis la barge) ; une habitude garde la barge : 17,5', async () => {
  const sansReponses = { 'k-p1': null, 'k-d1': null, 'k-d4': null };
  const vide = await jugee({ retard: 'rt4-barge', rien: { cmp: true, ot: true, mail: true, appel: true }, reponses: sansReponses });
  egal([vide.n.score, vide.ko, Object.values(vide.n.detail).filter((x) => x === 'ok')], [0, [], []], 'inaction : 0, aucun jalon faux, aucun juste');
  const parfait = {};
  for (const retard of ['rt4-barge', 'rt4-rail']) {
    const j = await jugee({ retard });
    parfait[retard] = [j.n.score, j.ko];
  }
  egal(parfait, { 'rt4-barge': [20, []], 'rt4-rail': [20, []] }, 'parcours juste des deux témoins');
  // L'habitude : le témoin rt4-barge garde la BARGE (qui arrive vendredi). Tri « tient la date » faux (1,5) et décision fausse (1) ; la suite est cohérente avec la barge.
  const habitude = await jugee({ retard: 'rt4-barge', retenue: 'barge', tri: { barge: { date: true } } });
  egal(habitude.ko, ['tri-date', 'decision-offre'], 'habitude : jalons faux');
  proche(habitude.n.score, 17.5, 'habitude : 20 − 1,5 − 1');
  // Le parcours de l'UN joué par l'AUTRE : le témoin rt4-rail qui retient le rail (en retard chez lui) comme le témoin rt4-barge → décision fausse.
  const autre = await jugee({ retard: 'rt4-rail', retenue: 'rail', tri: { rail: { date: true } } });
  egal(autre.ko, ['tri-date', 'decision-offre'], 'le rail retenu par le témoin rt4-rail');
  vrai(autre.n.score < 20, 'moins de 20');
});

// ─────────────────────────────────────────────────────────── une erreur ne se paie qu'une fois
await v('ENT-7.4 : chaque piège fait tomber SON jalon seulement — route retenue, Rouvignies en livraison, courriel au mauvais prestataire, tutoiement, instruction fausse, numéro lu à l’envers au quai, hors liste retenu', async () => {
  const cas = [
    // La route (la moins chère) retenue, justifiée par le prix, et commandée de bout en bout : seules la décision et sa justification tombent.
    ['route + prix', { retard: 'rt4-barge', retenue: 'route', cmp: { justif: 'prix' } }, ['decision-offre', 'decision-justif'], 18],
    ['Rouvignies en livraison', { retard: 'rt4-barge', ot: { liv: 'rouvignies' } }, ['ot-transport'], 19],
    ['courriel à un autre prestataire', { retard: 'rt4-barge', mail: { a: 'routiers' } }, ['courriel-destinataire'], 18.5],
    ['courriel sans pièce jointe', { retard: 'rt4-barge', mail: { pieces: [] } }, ['courriel-destinataire'], 18.5],
    ['tutoiement', { retard: 'rt4-rail', mail: { corps: 'Salut,\n\nvoici l’ordre, tu peux le prendre ?\n\nLea' } }, ['courriel-forme'], 19.5],
    ['instruction fausse cochée', { retard: 'rt4-rail', ot: { inst: ['rdv', 'scelle', 'vide', 'froid'] } }, ['ot-instructions'], 19],
    ['numéro lu à l’envers', { retard: 'rt4-rail', appel: { refs: 'inverse' } }, ['appel-quai'], 19],
    ['arrivée d’une autre offre', { retard: 'rt4-rail', appel: { arrivee: 'autre1' } }, ['appel-quai'], 19],
    ['scellé faux dans l’ordre', { retard: 'rt4-barge', ot: { scelle: 'DC 0 772 016' } }, ['ot-conteneur'], 18],
    ['hors liste gardé au tri', { retard: 'rt4-barge', tri: { horsliste: { liste: true } } }, ['tri-liste'], 18.5],
    ['prix faux reporté pour la bonne offre', { retard: 'rt4-rail', cases: { B4: '1' } }, null, null],
  ];
  for (const [nom, o, attendu, score] of cas) {
    if (attendu === null) continue;
    const j = await jugee(o);
    egal(j.ko, attendu, `${nom} : jalons faux`);
    proche(j.n.score, score, `${nom} : note`);
  }
  // Hors liste RETENU (moins cher et moins émetteur, jamais référencé) : le tri, la décision, le transporteur de l'ordre et le destinataire du courriel tombent ;
  // le quai est jugé sur ce que l'élève a commandé (l'offre hors liste) : il reste juste.
  const hl = await jugee({ retard: 'rt4-barge', retenue: 'horsliste', tri: { horsliste: { liste: true } } });
  egal(hl.ko, ['tri-liste', 'decision-offre', 'ot-transport', 'courriel-destinataire'], 'hors liste retenu : jalons faux');
  proche(hl.n.score, 20 - 1.5 - 1 - 1 - 1.5, 'hors liste retenu : note');
});

// ─────────────────────────────────────────────────────────── « Avant de commencer » noté
await v('ENT-7.4 : Avant de commencer — 3 questions tirées notées (3 points), 10 en banque ; 3 justes = 3, 2 justes + « Je ne sais pas » = 2, 2 justes + 1 fausse = 1,5, 3 fausses = plancher 0', async () => {
  const pts = async (reponses) => { const j = await jugee({ retard: 'rt4-barge', rien: { cmp: true, ot: true, mail: true, appel: true }, reponses });
    return [j.n.score, j.n.detail.ouverture.justes, j.n.detail.ouverture.nsp, j.n.detail.ouverture.faux, j.n.detail.ouverture.sur]; };
  egal(await pts({}), [3, 3, 0, 0, 3], 'trois justes');
  egal(await pts({ 'k-d4': '@nsp' }), [2, 2, 1, 0, 3], 'deux justes + « Je ne sais pas »');
  egal(await pts({ 'k-d4': 'loi' }), [1.5, 2, 0, 1, 3], 'deux justes + une fausse (−1 ÷ 2 mauvaises réponses)');
  egal(await pts({ 'k-p1': 'court', 'k-d1': 'loi', 'k-d4': 'loi' }), [0, 0, 0, 3, 3], 'trois fausses : plancher 0');
  // La banque : 6 + 4, tirage 1 + 2 par élève, sans aide ni mot cliquable (le moteur refuse la séance sinon : elle est montée sans erreur plus haut).
  const Q = await pg.evaluate(async () => {
    const M = await import('/contenus/questions/ENT-7.4.js');
    const L = M.QUESTIONS.liste;
    return { banque: L.length, prep: L.filter((q) => q.rubrique === 'preparation').length, droit: L.filter((q) => q.rubrique === 'droit').length, tirage: M.QUESTIONS.ouverture.tirage,
      aides: L.filter((q) => q.aide != null).length, mots: L.filter((q) => (q.enonce + q.choix.map((c) => c.lib).join(' ')).includes('[[')).length,
      suiteAuFil: L.filter((q) => q.type !== 'ouverture').length, part: M.QUESTIONS.part };
  });
  egal(Q, { banque: 10, prep: 6, droit: 4, tirage: { preparation: 1, droit: 2 }, aides: 0, mots: 0, suiteAuFil: 0, part: 3 }, 'la banque d’« Avant de commencer »');
  // Deux élèves : tirages possiblement différents, tous de 3 questions (1 + 2).
  const T = await pg.evaluate(async () => {
    const { tirerOuverture } = await import('/core/types/questions.js');
    const A = await import('/activites/decathlon-evaluation-dourges.js');
    return A.meta.id;
  });
  egal(T, ID, 'séance trouvée');
});


// ─────────────────────────────────────────────────────────── le parcours à l'écran
// Comparateur, ordre, courriel et appel joués comme un élève (la souris et le clavier). Aucun encadré, aucun verdict, jamais un mot « juste » ou « faux ».
const PRIS_MSG = /\b(juste|justes|faux|fausse|correct|correcte|bien|erreur|bravo)\b/i;
const PRIS_MAIL = /\b(juste|justes|faux|fausse|correct|correcte|erreur|bravo)\b/i;   // « Bien reçu » est la phrase neutre de Claire
const adresses = () => pg.evaluate(async () => {
  const D = await import('/contenus/decathlon-ent74-donnees.js');
  const J = D.jeuEleve(window.__f.db);
  return Object.fromEntries(J.offres.map((o) => [o.slot, { prix: D.casePrix(J, o.slot), co2: D.caseCO2(J, o.slot), prixV: o.prix, co2V: o.co2 }]));
});
async function comparateur(r) {
  await aller('fiche');
  const saisir = async (sel, t) => { await pg.fill(`${Z} ${sel}`, String(t)); await pg.dispatchEvent(`${Z} ${sel}`, 'change'); await pause(30); };
  await saisir('#fi-limite', '2027-03-10'); await saisir('#fi-heure', '14:00'); await saisir('#fi-budget', '850');
  await pg.selectOption(`${Z} #fi-critere`, 'co2'); await pause();
  const A = await adresses();
  for (const [slot, t] of Object.entries(r.tri)) {
    for (const col of ['liste', 'date']) { await pg.click(`${Z} [data-ouinon="tri|${slot}|${col}|${t[col] ? 1 : 0}"]`); await pause(30); }
  }
  for (const slot of Object.keys(A)) { await saisir(`[data-gr="${A[slot].prix}"]`, A[slot].prixV); await saisir(`[data-gr="${A[slot].co2}"]`, A[slot].co2V); }
  await pg.selectOption(`${Z} #fi-retenue`, r.retenue); await pause();
  await pg.check(`${Z} input[name="fi-justif"][value="date-co2"]`); await pause();
  await pg.click(`${Z} [data-fiche-envoyer]`); await pause(60);
  if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); }
}
async function ordre(r) {
  await aller('fiche:ot4');
  const saisir = async (champ, t) => { await pg.fill(`${Z} #fi-${champ}`, String(t)); await pg.dispatchEvent(`${Z} #fi-${champ}`, 'change'); await pause(30); };
  const liste = async (champ, t) => { await pg.selectOption(`${Z} #fi-${champ}`, t); await pause(30); };
  await liste('presta', r.presta); await saisir('cont', r.cont); await liste('type', '40hc'); await saisir('scelle', r.scelle); await saisir('poids', r.poids);
  await liste('enl', 'anvers'); await saisir('dispo', '2027-03-01'); await saisir('ref', r.ref); await liste('liv', 'dourges'); await saisir('limd', '2027-03-10'); await saisir('limh', '14:00');
  for (const i of ['rdv', 'scelle', 'vide']) { await pg.check(`${Z} input[data-fiche-case="inst"][value="${i}"]`); await pause(30); }
  await pg.click(`${Z} [data-fiche-envoyer]`); await pause(60);
  if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); }
}
async function courriel({ a, objet, corps, pj }) {
  await aller('mail');
  if (!(await present('[data-courriel]'))) { await pg.click(`${Z} [data-nouveau]`); await pause(); }
  await pg.selectOption(`${Z} #cA`, a); await pg.fill(`${Z} #cObj`, objet); await pg.fill(`${Z} #cMsg`, corps);
  for (const id of pj) { await pg.click(`${Z} [data-c-joindre]`); await pg.click(`${Z} [data-c-joint="${id}"]`); await pause(); }
  await pg.click(`${Z} [data-c-envoyer]`); await pause();
  if (await present('[data-c-confirme]')) { await pg.click(`${Z} [data-c-oui]`); await pause(); }
}
const noterEcran = () => pg.evaluate(async () => { const A = await import('/activites/decathlon-evaluation-dourges.js'); return A.noter(window.__f.db); });

for (const [retard, bonne, presta, arrivee, tri] of [
  ['rt4-barge', 'rail', 'rail', /^Mardi 9 mars vers 15 h, par le train jusqu’au terminal de Dourges, puis 3 km de camion\.$/,
    { route: [1, 1], barge: [1, 0], rail: [1, 1], horsliste: [0, 1] }],
  ['rt4-rail', 'barge', 'contargo', /^Mardi 9 mars vers 9 h, par la barge jusqu’au terminal de Dourges, puis 3 km de camion\.$/,
    { route: [1, 1], barge: [1, 1], rail: [1, 0], horsliste: [0, 1] }],
]) {
  await v(`ENT-7.4 : parcours juste à l’écran (${retard}, la bonne réponse est « ${bonne} ») — 20 / 20 ; le téléphone et l’ordre s’ouvrent à leur tour ; Claire reste neutre ; l’arrivée dite est celle de l’offre commandée ; aucun verdict, aucun encadré`, async () => {
    await monter({ uid: `dk74-e-${retard}`, db: { tirages: { [ID]: tirage(retard) } } });
    vrai(!(await menu()).includes('fiche:ot4') && !(await menu()).includes('telephone'), 'ni ordre ni téléphone au départ');
    await comparateur({ retenue: bonne, tri: Object.fromEntries(Object.entries(tri).map(([s, [l, d]]) => [s, { liste: !!l, date: !!d }])) });
    let E = await entrants();
    egal(E.length, 2, 'Claire a répondu');
    vrai(/Bien reçu, je te fais confiance pour la suite\./.test(E[1].text) && E[1].ouvreFiche === 'ot4', 'réponse neutre de Claire, qui ouvre l’ordre : ' + E[1].text);
    vrai(!PRIS_MAIL.test(E[1].text), 'Claire ne dit ni juste ni faux');
    vrai((await menu()).includes('fiche:ot4') && !(await menu()).includes('telephone'), 'l’ordre est ouvert, pas encore le téléphone : ' + await menu());
    const J = await pg.evaluate(async () => { const D = await import('/contenus/decathlon-ent74-donnees.js'); const J = D.jeuEleve(window.__f.db); return { c: J.conteneur, s: J.scelle, p: J.poids, r: J.reference }; });
    await ordre({ presta, cont: J.c, scelle: J.s, poids: J.p, ref: J.r });
    await courriel({ a: presta, objet: `Ordre de transport OT-2027-0204 — conteneur ${J.c}`, pj: ['fiche:ot4'],
      corps: `Bonjour,\n\nVeuillez trouver ci-joint notre ordre de transport OT-2027-0204 pour le conteneur ${J.c}.\n\nCordialement,\nLea Test, Decathlon` });
    E = await entrants();
    egal(E.length, 3, 'le prestataire a confirmé');
    vrai(E[2].text.includes(J.c) && /Enlèvement confirmé, livraison à votre quai/.test(E[2].text) && !PRIS_MAIL.test(E[2].text), 'confirmation neutre, avec le n° écrit par l’élève : ' + E[2].text);
    vrai((await menu()).includes('telephone'), 'le téléphone s’ouvre après le courriel');
    await aller('telephone');
    await pg.click(`${Z} [data-dlg-appeler="quai"]`); await pause();
    const fil = () => pg.textContent(`${Z} [data-dlg-fil]`);
    await pg.click(`${Z} [data-dlg-choix="presente"]`); await pause();
    vrai((await pg.textContent(`${Z} [data-dlg-choix="juste"]`)).includes(J.c), 'la réplique juste porte le n° de l’AVIS');
    vrai(!(await pg.textContent(`${Z} [data-dlg-choix="inverse"]`)).includes(J.c), 'la réplique piège porte un autre numéro');
    await pg.click(`${Z} [data-dlg-choix="juste"]`); await pause();
    const choix = await pg.$$eval(`${Z} [data-dlg-choix]`, (L) => L.map((b) => [b.dataset.dlgChoix, b.textContent.trim()]));
    egal(choix.length, 3, 'trois arrivées proposées');
    vrai(arrivee.test(Object.fromEntries(choix).commandee), 'l’arrivée de l’offre commandée : ' + JSON.stringify(choix));
    vrai(new Set(choix.map((c) => c[1])).size === 3, 'trois arrivées différentes');
    await pg.click(`${Z} [data-dlg-choix="commandee"]`); await pause();
    vrai(!PRIS_MSG.test(await fil()), 'le fil de l’appel ne dit ni juste, ni faux : ' + await fil());
    await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
    const n = await noterEcran();
    egal([n.score, kos(n)], [20, []], 'parcours juste : 20 / 20');
    egal(await pg.$$eval(`${Z} .ent-pastille.fait`, (L) => L.length), 4, 'quatre pastilles « fait »');
    E = await entrants();
    vrai(E.length === 4 && /je regarde à mon retour/.test(E[3].text), 'dernier mot de Claire, neutre : ' + E.map((m) => m.text).join(' | '));
  });
}

await v('ENT-7.4 : une erreur ne se paie qu’une fois, à l’écran — la route retenue ET commandée : le chef de quai attend l’arrivée de la ROUTE (juste = l’offre commandée), les deux autres sont les pièges ; seule la décision tombe', async () => {
  const db = await construire({ retard: 'rt4-barge', retenue: 'route', cmp: { justif: 'prix' }, rien: { mail: true, appel: true } });
  await monter({ uid: 'dk74-route', db });
  await courriel({ a: 'routiers', objet: 'Ordre de transport OT-2027-0204 — conteneur PRPU 602215 5', pj: ['fiche:ot4'],
    corps: 'Bonjour,\n\nVeuillez trouver ci-joint notre ordre de transport OT-2027-0204.\n\nCordialement,\nLea Test, Decathlon' });
  vrai((await menu()).includes('telephone'), 'le téléphone est ouvert (le courriel est parti) : ' + await menu());
  await aller('telephone');
  await pg.click(`${Z} [data-dlg-appeler="quai"]`); await pause();
  await pg.click(`${Z} [data-dlg-choix="presente"]`); await pause();
  await pg.click(`${Z} [data-dlg-choix="juste"]`); await pause();
  const choix = Object.fromEntries(await pg.$$eval(`${Z} [data-dlg-choix]`, (L) => L.map((b) => [b.dataset.dlgChoix, b.textContent.trim()])));
  egal(choix.commandee, 'Mardi 9 mars vers 10 h, par la route, directement jusqu’à Delta 3.', 'l’arrivée de la route (commandée)');
  egal(Object.keys(choix).sort(), ['autre1', 'autre2', 'commandee'], 'trois arrivées');
  vrai(Object.values(choix).some((t) => /par le train jusqu’au terminal de Dourges, puis 3 km de camion/.test(t)) && Object.values(choix).some((t) => /Vendredi 12 mars vers 9 h, par la barge/.test(t)),
    'les pièges sont les arrivées du rail (mardi 15 h) et de la barge (vendredi 9 h) : ' + JSON.stringify(choix));
  await pg.click(`${Z} [data-dlg-choix="commandee"]`); await pause();
  await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
  const n = await noterEcran();
  egal([kos(n), n.score], [['decision-offre', 'decision-justif'], 18], 'seule la décision (et sa justification « prix ») tombe');
});

await v('ENT-7.4 : aucune erreur JavaScript pendant le bloc', async () => { egal(erreursF.filter((e) => !/favicon/.test(e)), [], 'erreurs'); });
await F.fermer();
}
