// Suite de tests de Prepalog — bloc « mr-11.4 » : ENT-11.4 (Mondial Relay, évaluation « le samedi du pic », 2de, OTM-C2.2 et OTM-C3.2, copie rendue).
// `node outils/test.mjs mr-11.4` ne lance que ce bloc. Aides communes : `outils/test/mondial-relay/commun.mjs`. Brief :
// `docs/briefs/ENT-11.4-mondial-relay-evaluation-planning.md`. Modèles : `outils/test/fb-6.8.mjs` (planning), `outils/test/pelleau-108.mjs` (évaluation).
//
// Le planning est TIRÉ par élève : un moteur par graine (`activites/mondial-relay-evaluation-planning.js`). Les valeurs ci-dessous sont ÉCRITES À LA MAIN
// (relevé du tirage le 26/10/2026), jamais recalculées par le code de la séance. Créneaux au quart d'heure depuis 05:00 (06:00 → 4, 06:30 → 6, 07:00 → 8,
// 07:30 → 10, 08:00 → 12, 09:00 → 16). Trois élèves, un imprévu chacun :
//   mr114-1 (T2 doublée) : Jérémy ch1 (C, hier 17:30) · Karine ch2 (B, 18:30) · Aurélie ch3 (C, 17:00) · Farid ch4 (C, 17:30) · Dylan ch5 (C, 19:30 → pas avant 06:30)
//                          · Élodie ch6 (C, 22:30 → pas avant 09:30 : aucune tournée) ; T5 = 4 h 45.
//     1er envoi juste : T1 ch1 P1 06:00 · T2 ch2 F1 06:00 · T3 ch3 P2 06:00 · T4 ch4 F2 06:00 · T5 ch5 P3 06:30.
//     Après l'imprévu : les mêmes + T2 bis ch7 (renfort, dès 07:00) R1 (fourgon de renfort, dès 07:00) 07:00.
//   mr114-2 (chauffeur malade) : Camille ch1 (C, 18:30) · Aurélie ch2 (C, en repos) · Dylan ch3 (B, 17:30) · Kevin ch4 (C, 19:30) · Lucie ch5 (C, 18:30, MALADE)
//                          · Nadège ch6 (C, 23:00 : aucune tournée) ; T5 = 4 h 15.
//     1er envoi juste : T1 ch1 P1 06:00 · T2 ch2 F1 06:00 · T3 ch4 P2 06:30 · T4 ch3 F2 06:00 · T5 ch5 P3 06:00. Après : T5 passe à ch7 (renfort dès 07:30) P3 07:30.
//   mr114-5 (camion P3 en panne) : Camille ch1 (C, en repos) · Lucie ch2 (C, 23:00 : aucune tournée) · Farid ch3 (B, en repos) · Olivier ch4 (C, 20:00 → pas avant 07:00)
//                          · Jérémy ch5 (C, en repos) · Élodie ch6 (C, en repos) ; T5 = 4 h 20.
//     1er envoi juste : T1 ch1 P1 06:00 · T2 ch3 F1 06:00 · T3 ch4 P2 07:00 · T4 ch5 F2 06:00 · T5 ch6 P3 06:00.
//     Après (P3 en panne, porteur de renfort R1 dès 08:00) : T1 ch1 F1 06:00 · T2 ch3 F2 06:00 · T3 ch4 P1 07:00 · T4 ch5 R1 08:00 · T5 ch6 P2 06:00.
// Poids (brief §5, acceptés par Tristan le 26/10/2026) : v1-tous 3 · v1-permis 3 · v1-repos 3 · v1-conduite 3 · v2-replanifier 3 · message 1 · ouverture 4 = 20.

import { ouvrirMR } from './mondial-relay/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirMR({ nav, BASE });
const { pg, Z, pause, base, present, aller, texte, entrants, horodate, proche, erreurs } = F;

const ID = 'mondial-relay-evaluation-planning';
const PLID = 'mr-chauffeurs';
const ACT = '/activites/mondial-relay-evaluation-planning.js';
const OUV = { 'qui-decide-camions': 'samia', 'jours-tournees': 'mar-sam', 'bulle-camion': 'camion', 'permis-porteur': 'c', 'repos-11h': 'onze', 'conduite-9h': 'non',
  'pause-15-30': 'oui', 'affectation-sexe': 'non' };
const OUV_FAUSSES = { 'qui-decide-camions': 'chacun', 'jours-tournees': 'tous', 'bulle-camion': 'client', 'permis-porteur': 'aucun', 'repos-11h': 'huit', 'conduite-9h': 'nuit',
  'pause-15-30': 'dix', 'affectation-sexe': 'decide' };
// Le nombre de mauvaises réponses de chaque question (hors « Je ne sais pas »), écrit à la main.
const MAUVAISES = { 'qui-decide-camions': 3, 'jours-tournees': 2, 'bulle-camion': 2, 'permis-porteur': 2, 'repos-11h': 2, 'conduite-9h': 2, 'pause-15-30': 2, 'affectation-sexe': 2 };

const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import(o.activite);
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [k, r] of Object.entries(o.rep)) if (!Q[k]) Q[k] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [], copies: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'mr114-1' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'MR',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__f.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
  return JSON.parse(JSON.stringify(db));
}, { activite: ACT, id: ID, rep: OUV, ...o });
const noter = () => pg.evaluate(async (a) => { const A = await import(a); return A.noter(window.__f.db); }, ACT);
const copies = () => pg.evaluate(() => window.__f.copies.length);

// ── les trois élèves du relevé (graine → solution à la main)
const P = (L) => Object.fromEntries(L.map(([id, r, s, k]) => [id, k ? { r, s, k } : { r, s }]));
const E = {
  A: { uid: 'mr114-1', alea: 'doublee',
    v1: [['t1', 'ch1', 4, 'P1'], ['t2', 'ch2', 4, 'F1'], ['t3', 'ch3', 4, 'P2'], ['t4', 'ch4', 4, 'F2'], ['t5', 'ch5', 6, 'P3']],
    v2: [['t1', 'ch1', 4, 'P1'], ['t2', 'ch2', 4, 'F1'], ['t3', 'ch3', 4, 'P2'], ['t4', 'ch4', 4, 'F2'], ['t5', 'ch5', 6, 'P3'], ['t2bis', 'ch7', 8, 'R1']],
    changement: 'T2 est doublée : j’ai posé T2 bis avec le chauffeur et le fourgon de renfort, disponibles à 07:00.' },
  B: { uid: 'mr114-2', alea: 'malade',
    v1: [['t1', 'ch1', 4, 'P1'], ['t2', 'ch2', 4, 'F1'], ['t3', 'ch4', 6, 'P2'], ['t4', 'ch3', 4, 'F2'], ['t5', 'ch5', 4, 'P3']],
    v2: [['t1', 'ch1', 4, 'P1'], ['t2', 'ch2', 4, 'F1'], ['t3', 'ch4', 6, 'P2'], ['t4', 'ch3', 4, 'F2'], ['t5', 'ch7', 10, 'P3']],
    changement: 'Lucie est malade : je l’ai retiré du planning et j’ai mis le chauffeur de renfort, disponible à 07:30.' },
  C: { uid: 'mr114-5', alea: 'panne',
    v1: [['t1', 'ch1', 4, 'P1'], ['t2', 'ch3', 4, 'F1'], ['t3', 'ch4', 8, 'P2'], ['t4', 'ch5', 4, 'F2'], ['t5', 'ch6', 4, 'P3']],
    v2: [['t1', 'ch1', 4, 'F1'], ['t2', 'ch3', 4, 'F2'], ['t3', 'ch4', 8, 'P1'], ['t4', 'ch5', 12, 'R1'], ['t5', 'ch6', 4, 'P2']],
    changement: 'Le camion P3 est en panne : j’ai repris le planning avec le porteur de renfort, disponible à 08:00.' },
};
const JALONS = ['v1-tous', 'v1-permis', 'v1-repos', 'v1-conduite', 'v2-replanifier', 'message'];
const POIDS = { 'v1-tous': 3, 'v1-permis': 3, 'v1-repos': 3, 'v1-conduite': 3, 'v2-replanifier': 3, message: 1 };
const ko = (n) => JALONS.filter((j) => n.detail[j] !== 'ok');
const points = (faux, ouverture = 4) => ouverture + JALONS.filter((j) => !faux.includes(j)).reduce((s, j) => s + POIDS[j], 0);

// Juge un envoi (v1, v2) par le vrai moteur, sur le planning de la graine ; rend { jalon: ok } des versions envoyées.
const juge = (graine, v1, v2, planningDeModifie) => pg.evaluate(async ({ graine, v1, v2, P1, P2, modifie }) => {
  const D = await import('/contenus/mondial-relay-ent114-donnees.js');
  const { jalonsPlanning } = await import('/core/types/planning.js');
  const PL = modifie ? modifie(D.planningDe(graine)) : D.planningDe(graine);
  const db = { plannings: { 'mr-chauffeurs': { ...(v1 ? { v1: { place: P1 } } : {}), ...(v2 ? { v2: { place: P2 } } : {}) } } };
  return Object.fromEntries(jalonsPlanning(db, PL).L.filter((l) => l.envoye).map((l) => [l.id, l.ok]));
}, { graine, v1: !!v1, v2: !!v2, P1: v1 ? P(v1) : null, P2: v2 ? P(v2) : null, modifie: null });
const faux1 = (r) => ['tous', 'permis', 'repos', 'conduite'].filter((j) => !r[`v1-${j}`]);

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-11.4 : la séance se charge (2de, OTM-C2.2 et C3.2, évaluation, copie, fermée aux élèves) ; poids écrits à la main, 16 + ouverture 4 = 20 ; au registre sous l’entreprise n° 11 ; ni parcours ni correction ni niveau', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/mondial-relay-evaluation-planning.js');
    const S = await import('/contenus/mondial-relay-ent114.js');
    const Q = await import('/contenus/questions/ENT-11.4.js');
    const I = await import('/activites/index.js');
    const N = await import('/core/niveaux.js');
    const charges = await I.chargerActivites();
    const m = A.meta;
    return { meta: m, noter: typeof A.noter, ids: S.ETAPES.map((e) => e.id), poids: S.ETAPES.map((e) => e.poids), somme: S.ETAPES.reduce((t, e) => t + (e.poids || 0), 0),
      part: Q.QUESTIONS.part, partOuv: Q.QUESTIONS.ouverture.part, types: [...new Set(Q.QUESTIONS.liste.map((q) => q.type))].sort(), nbQ: Q.QUESTIONS.liste.length,
      cles: Q.QUESTIONS.liste.filter((q) => q.cle).map((q) => q.id), reflexions: Q.QUESTIONS.liste.filter((q) => q.type === 'fil').map((q) => !!q.reflexion),
      groupes: [...new Set(S.ETAPES.map((e) => e.groupe))],
      auRegistre: charges.some((a) => a.meta.id === ID), echecs: (I.activitesEnEchec ? I.activitesEnEchec() : []).map((e) => e.fichier || String(e)).filter((f) => /mondial/.test(f)),
      entreprise: (I.ENTREPRISES.find((e) => e.n === 11) || {}).nom,
      deux: N.activiteVisible(m, { niveau: '2de' }), coche: N.activiteVisible(m, { niveau: '2de', ouverts: { [ID]: true } }), autre: N.activiteVisible(m, { niveau: '1re', ouverts: {} }) };
  }, ID);
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture, m.corrige, m.rubrique],
    ['ENT-11.4', ['2de'], ['OTM-C2.2', 'OTM-C3.2'], 'evaluation', 20, true, 'ENT-11.4', true, 'prof', './contenus/corriges/ENT-11.4.js', 'simulog'], 'meta');
  egal([m.parcours, m.correction, m.niveauxPrevus, m.precedente], [undefined, undefined, undefined, undefined], 'ni parcours, ni correction, ni niveau');
  egal(r.noter, 'function', 'export noter');
  egal(r.ids, JALONS, 'jalons');
  egal(r.poids, [3, 3, 3, 3, 3, 1], 'poids jalon par jalon (écrits à la main)');
  proche(r.somme + r.part, 20, 'somme des jalons et de la part de l’ouverture');
  egal([r.part, r.partOuv, r.types, r.nbQ], [4, 4, ['fil', 'ouverture'], 11], 'ouverture notée 4 ; 8 questions d’ouverture et 3 au fil');
  egal(r.reflexions, [true, true, true], 'les 3 questions au fil ne sont pas notées (le brief ne leur laisse aucun point)');
  egal(r.cles, ['qui-decide-camions', 'repos-11h', 'affectation-sexe'], 'les trois questions clés d’ENT-6.8 reprises');
  egal(r.groupes, ['Le planning du samedi', 'Après l’imprévu', 'Rendre compte'], 'lignes du bandeau');
  egal([r.auRegistre, r.echecs, r.entreprise], [true, [], 'Mondial Relay'], 'au registre, sans échec');
  egal([r.deux, r.coche, r.autre], [false, true, false], 'fermée, puis ouverte par l’enseignant ; jamais hors 2de');
});

// ─────────────────────────────────────────────────────────── le jeu figé et le tirage
await v('ENT-11.4 : jeu figé — le jeu de mr114-1, mr114-2 et mr114-5 est celui écrit à la main (la formule du tirage ne change pas sous les élèves)', async () => {
  const r = await pg.evaluate(async (g) => {
    const D = await import('/contenus/mondial-relay-ent114-donnees.js');
    return g.map((x) => { const j = D.jeuDe(x); return { noms: j.noms, roles: j.roles, finHier: j.finHier, t5: j.t5, alea: j.alea, cible: j.cible, secours: j.secours }; });
  }, [E.A.uid, E.B.uid, E.C.uid]);
  egal(r[0], { noms: { ch1: 'Jérémy', ch2: 'Karine', ch3: 'Aurélie', ch4: 'Farid', ch5: 'Dylan', ch6: 'Élodie' },
    roles: { ch1: 'libre', ch2: 'b', ch3: 'libre', ch4: 'libre', ch5: 'tard', ch6: 'repos' },
    finHier: { ch1: '17:30', ch2: '18:30', ch3: '17:00', ch4: '17:30', ch5: '19:30', ch6: '22:30' }, t5: 285, alea: 'doublee', cible: null, secours: false }, 'mr114-1');
  egal(r[1], { noms: { ch1: 'Camille', ch2: 'Aurélie', ch3: 'Dylan', ch4: 'Kevin', ch5: 'Lucie', ch6: 'Nadège' },
    roles: { ch1: 'libre', ch2: 'libre', ch3: 'b', ch4: 'tard', ch5: 'libre', ch6: 'repos' },
    finHier: { ch1: '18:30', ch2: null, ch3: '17:30', ch4: '19:30', ch5: '18:30', ch6: '23:00' }, t5: 255, alea: 'malade', cible: 'ch5', secours: false }, 'mr114-2');
  egal(r[2], { noms: { ch1: 'Camille', ch2: 'Lucie', ch3: 'Farid', ch4: 'Olivier', ch5: 'Jérémy', ch6: 'Élodie' },
    roles: { ch1: 'libre', ch2: 'repos', ch3: 'b', ch4: 'tard', ch5: 'libre', ch6: 'libre' },
    finHier: { ch1: null, ch2: '23:00', ch3: null, ch4: '20:00', ch5: null, ch6: null }, t5: 260, alea: 'panne', cible: 'P3', secours: false }, 'mr114-5');
});

await v('ENT-11.4 : tirage sur 300 graines — zéro jeu de secours ; exactement un chauffeur au repos, un tardif, un permis B, trois libres ; T5 de 4 h 10 à 4 h 50 ; imprévus équilibrés ; une solution juste (jugée par le VRAI moteur) avant et après l’imprévu ; le chauffeur au repos ne peut prendre aucune tournée', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/mondial-relay-ent114-donnees.js');
    const { jalonsPlanning } = await import('/core/types/planning.js');
    const c = { alea: {}, secours: 0, fautes: [], moteur: [], t5: new Set(), noms: new Set() };
    const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}`, j = D.jeuDe(g);
      inc(c.alea, j.alea); if (j.secours) c.secours++;
      c.t5.add(j.t5); c.noms.add(Object.values(j.noms).join(','));
      const roles = Object.values(j.roles).sort().join(',');
      if (roles !== 'b,libre,libre,libre,repos,tard') c.fautes.push([g, 'rôles ' + roles]);
      if (j.t5 < 250 || j.t5 > 290 || j.t5 % 5) c.fautes.push([g, 't5 ' + j.t5]);
      if (new Set(Object.values(j.noms)).size !== 6) c.fautes.push([g, 'noms en double']);
      const P = D.planningDe(g);
      const s1 = D.resoudre(j, 1), s2 = D.resoudre(j, 2);
      if (!s1 || !s2) { c.fautes.push([g, 'pas de solution']); continue; }
      const place = (s) => Object.fromEntries(Object.entries(s).map(([k, p]) => [k, { ...p }]));
      const L = jalonsPlanning({ plannings: { 'mr-chauffeurs': { v1: { place: place(s1) }, v2: { place: place(s2) } } } }, P).L;
      if (L.length !== 5 || L.some((l) => !l.ok)) c.moteur.push([g, L.filter((l) => !l.ok).map((l) => l.id)]);
      // Le chauffeur au repos ne peut partir qu'à 09:30 au plus tôt : plus tard que le dernier départ de toute tournée (jamais utilisable).
      const rep = Object.keys(j.roles).find((id) => j.roles[id] === 'repos');
      const reprise = (() => { const [h, m] = j.finHier[rep].split(':').map(Number); return h * 60 + m + 660 - 1440; })();
      if (reprise < 9 * 60 + 30) c.fautes.push([g, 'reprise du chauffeur au repos ' + reprise]);
      if (Object.values(s1).some((p) => p.r === rep) || Object.values(s2).some((p) => p.r === rep)) c.fautes.push([g, 'le solveur utilise le chauffeur au repos']);
    }
    return { ...c, t5: [...c.t5].sort((a, b) => a - b), noms: c.noms.size };
  });
  egal(r.fautes, [], 'équité du jeu');
  egal(r.moteur, [], 'solutions du solveur jugées justes par le moteur');
  egal(r.secours, 0, 'jeu de secours');
  egal(r.t5, [250, 255, 260, 265, 270, 275, 280, 285, 290], 'les neuf durées de T5 sont tirées');
  vrai(['panne', 'malade', 'doublee'].every((a) => r.alea[a] >= 70 && r.alea[a] <= 130), 'imprévus déséquilibrés : ' + JSON.stringify(r.alea));
  vrai(r.noms >= 150, 'trop peu de tableaux de chauffeurs distincts : ' + r.noms);
});

await v('ENT-11.4 : tirage stable par graine et différent d’un élève à l’autre — le même jeu et le même planning à chaque appel (les mêmes objets), au moins 20 jeux distincts sur 60 élèves, deux élèves voisins ne se ressemblent pas tous', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/mondial-relay-ent114-donnees.js');
    const stable = ['mr114-1', 'zoé', 'eleve-17'].every((g) => D.jeuDe(g) === D.jeuDe(g) && D.planningDe(g) === D.planningDe(g));
    const jeux = new Set(), voisins = [];
    for (let i = 0; i < 60; i++) { jeux.add(JSON.stringify(D.jeuDe(`el-${i}`))); voisins.push(JSON.stringify(D.jeuDe(`el-${i}`)) === JSON.stringify(D.jeuDe(`el-${i + 1}`))); }
    return { stable, distincts: jeux.size, voisinsPareils: voisins.filter(Boolean).length, vide: D.jeuDe('') === D.jeuDe(undefined) };
  });
  vrai(r.stable, 'un jeu change d’un appel à l’autre');
  vrai(r.distincts >= 20, 'trop peu de jeux distincts : ' + r.distincts);
  vrai(r.voisinsPareils <= 6, 'élèves voisins trop souvent identiques : ' + r.voisinsPareils);
  vrai(r.vide, 'la base vide (enseignant) n’a pas un jeu qui change');
});

// ─────────────────────────────────────────────────────────── le calage, jugé par le vrai moteur (sans écran)
const avec = (ref, ...chg) => { const m = Object.fromEntries(ref.map((x) => [x[0], x])); chg.forEach((x) => { m[x[0]] = x; }); return Object.values(m); };
const sans = (ref, ...ids) => ref.filter((x) => !ids.includes(x[0]));
const PIEGES_V1 = [
  // mr114-1 (A) : Élodie ch6 au repos jusqu'à 09:30, Dylan ch5 pas avant 06:30, Karine ch2 permis B.
  ['A', 'Élodie (repos jusqu’à 09:30) sur T1 à 06:00', (r) => avec(r, ['t1', 'ch6', 4, 'P1']), ['repos']],
  ['A', 'Dylan (fin de service hier 19:30) sur T5 à 06:00', (r) => avec(r, ['t5', 'ch5', 4, 'P3']), ['repos']],
  ['A', 'Karine (permis B) sur le porteur de T3', (r) => avec(r, ['t3', 'ch2', 4, 'P2'], ['t2', 'ch3', 4, 'F1']), ['permis']],
  ['A', 'T3 sur un fourgon (un porteur est obligatoire)', (r) => avec(r, ['t3', 'ch3', 4, 'F1'], ['t2', 'ch2', 4, 'P2']), ['permis']],
  ['A', 'Jérémy sur T1 et T2 (deux tournées, plus de 4 h 30 de conduite sans pause)', (r) => avec(r, ['t2', 'ch1', 4, 'F1']), ['permis', 'conduite']],
  ['A', 'P1 sur T1 et sur T3 (un camion, deux tournées)', (r) => avec(r, ['t3', 'ch3', 4, 'P1']), ['permis']],
  ['A', 'T5 posée à 09:00 (rentre trop tard)', (r) => avec(r, ['t5', 'ch5', 16, 'P3']), ['tous']],
  ['A', 'T1 posée à 05:30 (les colis ne sont pas prêts)', (r) => avec(r, ['t1', 'ch1', 2, 'P1']), ['tous']],
  ['A', 'T4 non posée (planning incomplet : tous les jalons du 1er envoi tombent)', (r) => sans(r, 't4'), ['tous', 'permis', 'repos', 'conduite']],
  ['B', 'Nadège (repos jusqu’à 10:00) sur T4', (r) => avec(r, ['t4', 'ch6', 4, 'F2']), ['repos']],
  ['B', 'Kevin (fin de service hier 19:30) sur T3 à 06:00', (r) => avec(r, ['t3', 'ch4', 4, 'P2']), ['repos']],
  ['B', 'Dylan (permis B) sur T5 avec P3', (r) => avec(r, ['t5', 'ch3', 4, 'P3'], ['t4', 'ch5', 4, 'F2']), ['permis']],
  ['C', 'Olivier (fin de service hier 20:00) sur T3 à 06:30', (r) => avec(r, ['t3', 'ch4', 6, 'P2']), ['repos']],
  ['C', 'Lucie (repos jusqu’à 10:00) sur T2', (r) => avec(r, ['t2', 'ch2', 4, 'F1']), ['repos']],
  ['C', 'Farid (permis B) sur T5 avec P3', (r) => avec(r, ['t5', 'ch3', 4, 'P3'], ['t2', 'ch6', 4, 'F1']), ['permis']],
];
const PIEGES_V2 = [
  ['A', 'le 1er envoi renvoyé tel quel (T2 bis n’est pas posée)', (r1) => r1, null],
  ['A', 'T2 bis sur Jérémy, déjà sur T1', (r1) => r1.concat([['t2bis', 'ch1', 8, 'R1']]), 'faux'],
  ['A', 'T2 bis posée à 06:00 (le renfort n’est là qu’à 07:00)', (r1) => r1.concat([['t2bis', 'ch7', 4, 'R1']]), 'faux'],
  ['A', 'T2 bis sur un porteur déjà pris (P1)', (r1) => r1.concat([['t2bis', 'ch7', 8, 'P1']]), 'faux'],
  ['B', 'le 1er envoi renvoyé tel quel (Lucie est retirée : T5 n’est plus posée)', (r1) => r1, 'faux'],
  ['B', 'T5 sur le renfort à 07:00 (il n’est là qu’à 07:30)', (r1) => avec(r1, ['t5', 'ch7', 8, 'P3']), 'faux'],
  ['B', 'T5 sur Camille (déjà sur T1)', (r1) => avec(r1, ['t5', 'ch1', 4, 'P3']), 'faux'],
  ['C', 'le 1er envoi renvoyé tel quel (P3 est en panne)', (r1) => r1, 'faux'],
  ['C', 'T4 sur le porteur de renfort à 07:00 (il n’est là qu’à 08:00)', (r1) => avec(E.C.v2, ['t4', 'ch5', 8, 'R1']), 'faux'],
  ['C', 'P3 en panne gardé pour T5, le renfort inutilisé', (r1) => avec(E.C.v2, ['t5', 'ch6', 4, 'P3'], ['t4', 'ch5', 4, 'P2'], ['t3', 'ch4', 8, 'P1']), 'faux'],
];
const JAL1 = ['tous', 'permis', 'repos', 'conduite'];
await v('ENT-11.4 : calage — les trois solutions sont justes (tous les jalons) ; chaque piège du 1er envoi fait tomber SON jalon (et lui seul) ; chaque piège de la reprise fait tomber « replanifier » ; rien posé = 0', async () => {
  for (const k of ['A', 'B', 'C']) {
    const r = await juge(E[k].uid, E[k].v1, E[k].v2);
    egal(Object.values(r).every(Boolean) && Object.keys(r).length, 5, `${k} : solution juste, 5 jalons`);
    const q = await juge(E[k].uid, [], []);
    egal(Object.values(q).filter(Boolean).length, 0, `${k} : rien posé`);
  }
  for (const [k, nom, f, attendu] of PIEGES_V1) {
    const r = await juge(E[k].uid, f(E[k].v1), null);
    egal(faux1(r), attendu, `piège du 1er envoi : ${nom}`);
  }
  for (const [k, nom, f] of PIEGES_V2) {
    const r = await juge(E[k].uid, E[k].v1, f(E[k].v1));
    egal(r['v2-replanifier'], false, `piège de la reprise : ${nom}`);
  }
  // Sans piège le même scénario est juste (le test d’en face) : la reprise juste de chaque élève est juste.
  for (const k of ['A', 'B', 'C']) egal((await juge(E[k].uid, E[k].v1, E[k].v2))['v2-replanifier'], true, `${k} : reprise juste`);
});

await v('ENT-11.4 : sabotages — sans la règle du repos, le piège du repos ne fait plus rien tomber ; sans la règle de la fenêtre, T5 à 09:00 passe ; sans la règle du porteur, T3 sur un fourgon passe (les tests ne sont pas des décors)', async () => {
  const r = await pg.evaluate(async ({ P1, P2, P3 }) => {
    const D = await import('/contenus/mondial-relay-ent114-donnees.js');
    const { jalonsPlanning } = await import('/core/types/planning.js');
    const P = (L) => Object.fromEntries(L.map(([id, r, s, k]) => [id, { r, s, k }]));
    const sansRegle = (g, ...ids) => { const p = D.planningDe(g); return { ...p, regles: p.regles.filter((x) => !ids.includes(x.id)), jalons: p.jalons.map((j) => ({ ...j, regles: j.regles.filter((x) => !ids.includes(x)) })) }; };
    const lire = (PL, L) => Object.fromEntries(jalonsPlanning({ plannings: { 'mr-chauffeurs': { v1: { place: P(L) } } } }, PL).L.map((l) => [l.jalon, l.ok]));
    return {
      repos: lire(D.planningDe('mr114-1'), P1), reposSans: lire(sansRegle('mr114-1', 'repos'), P1),
      fenetre: lire(D.planningDe('mr114-1'), P2), fenetreSans: lire(sansRegle('mr114-1', 'fenetre'), P2),
      porteur: lire(D.planningDe('mr114-1'), P3), porteurSeul: lire(sansRegle('mr114-1', 'typeCamion'), P3), porteurSans: lire(sansRegle('mr114-1', 'typeCamion', 'permis'), P3),
    };
  }, { P1: avec(E.A.v1, ['t1', 'ch6', 4, 'P1']), P2: avec(E.A.v1, ['t5', 'ch5', 16, 'P3']), P3: avec(E.A.v1, ['t3', 'ch3', 4, 'F1'], ['t2', 'ch2', 4, 'P2']) });
  egal([r.repos.repos, r.reposSans.repos], [false, true], 'repos : avec la règle le piège tombe, sans elle il passe');
  egal([r.fenetre.tous, r.fenetreSans.tous], [false, true], 'fenêtre');
  egal([r.porteur.permis, r.porteurSans.permis], [false, true], 'type de camion (et le permis de Karine sur P2, posé avec lui)');
});

await v('ENT-11.4 : « que, pas de combien » — aucun message de problème des pièges ne donne une heure, des km, des minutes ou un pourcentage', async () => {
  const textes = await pg.evaluate(async ({ L1, L2 }) => {
    const D = await import('/contenus/mondial-relay-ent114-donnees.js');
    const { creerPlanning } = await import('/core/types/planning.js');
    const P = (L) => Object.fromEntries(L.map(([id, r, s, k]) => [id, k ? { r, s, k } : { r, s }]));
    const out = [];
    for (const [g, phase, L] of [...L1, ...L2]) out.push(...creerPlanning(D.planningDe(g)).lire({ phase, place: P(L) }).problemes);
    return out;
  }, { L1: PIEGES_V1.map(([k, , f]) => [E[k].uid, 1, f(E[k].v1)]), L2: PIEGES_V2.map(([k, , f]) => [E[k].uid, 2, f(E[k].v1)]) });
  vrai(textes.length >= 20, `trop peu de messages lus : ${textes.length}`);
  const chiffres = textes.map((t) => t.replace(/4 h 30/g, '')).filter((t) => /\d{1,2}:\d{2}|\bkm\b|\bmin\b|%|\d+ ?h(?! de repos| sans pause| dans la journée)/.test(t));
  egal(chiffres, [], 'messages qui donnent un chiffre');
});

// ─────────────────────────────────────────────────────────── à l'écran
const ligne = (c) => c;
async function poser(id, r, t, k) {
  await pg.click(`${Z} [data-pl-id="${id}"][data-pl-vue="b"]`);
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${r}"][data-t="${t}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  await pause();
  await qrep();
  if (!k) return;
  const place = ((await base()).plannings || {})[PLID].place || {};
  if ((place[id] || {}).k === k) return;
  if (!(await present('.pl-bulle'))) await pg.click(`${Z} [data-pl-id="${id}"][data-pl-vue="b"] [data-pl-act="bulle"]`);
  await pg.click(`${Z} .pl-bulle [data-pl-choix="${k}"]`);
  await pause();
}
const BONNES_FIL = { 'repos-tardif': 'repos', 'pause-t5': 'oui', 'arret-maladie': 'a' };
// Répond au panneau ouvert (puis reprend), tant qu'il y en a un.
async function qrep(choix = BONNES_FIL) {
  for (let i = 0; i < 4; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
async function envoyer() {
  await pg.click(`${Z} [data-pl="envoyer"]`);
  const c = await pg.waitForSelector(`${Z} [data-confirme]`, { timeout: 3000 }).catch(() => null);
  if (!c) throw new Error('pas de confirmation avant l’envoi du planning');
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  await qrep();
}
async function planning(p1, p2, ancien) {
  await aller('planning');
  for (const [id, r, t, k] of p1) await poser(id, r, t, k);
  await envoyer();
  await aller('planning');
  for (const x of p2.filter((y) => JSON.stringify(y) !== JSON.stringify((ancien || p1).find((z) => z[0] === y[0])))) await poser(x[0], x[1], x[2], x[3]);
  await envoyer();
}
async function samia(prenom, lignes) {
  await aller('mail');
  const id = await pg.evaluate(() => window.__f.db.mails.find((x) => x.folder === 'in' && x.subject === 'Qu’est-ce qui change ?').id);
  await pg.click(`${Z} [data-mail="${id}"]`);
  await pause();
  await pg.click(`${Z} [data-repondre]`);
  await pause();
  for (const [l, t] of Object.entries(lignes)) { await pg.selectOption(`${Z} select[data-phrase="${l}"]`, { label: t }); await pause(); }
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await pause();
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
const RAISON = 'J’ai vérifié pour chacun le permis, les 11 h de repos et la conduite.';
const lignesSamia = (k, o = {}) => ({ salutation: 'Salut Samia,', changement: E[k].changement, raison: RAISON, formule: 'À tout à l’heure, Lea', ...o });
async function rendre() {
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.waitForFunction(() => window.__f.copies.length === 1);
  await pause();
  return pg.evaluate(() => window.__f.copies[0]);
}
async function parcours(k, o = {}) {
  await monter({ uid: E[k].uid });
  await planning(o.v1 || E[k].v1, o.v2 || E[k].v2, o.v1);
  await samia('Lea', o.samia || lignesSamia(k));
}

await v('ENT-11.4 : ouverture — un seul message de Samia (samedi 12 décembre 2026, 5 h) et ses pièces ; menu : Avant de commencer, Messagerie, Planning ; pas de « Vérifier » ; les chauffeurs et T5 sont ceux de SA graine ; aucun mot cliquable', async () => {
  await monter({ uid: E.A.uid });
  const M = await entrants();
  egal(M.map((m) => [m.from, m.subject, m.pieces]), [['Samia', 'Le planning du samedi', ['tournees-114', 'moyens-114', 'regles-114']]], 'messages');
  egal(horodate(M[0].ts), [2026, 12, 12, 5, 0], 'heure du scénario');
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue).filter((x) => x !== 'accueil')), ['ouverture', 'mail', 'planning'], 'menu');
  await aller('planning');
  vrai(!(await present('[data-pl="verifier"]')), 'bouton « Vérifier »');
  egal((await pg.$$(`${Z} [data-pl-bac] [data-pl-id]`)).length, 5, 'tournées');
  const noms = await pg.$$eval(`${Z} [data-pl-grille] .pl-res`, (L) => L.map((x) => x.textContent.trim()).join(' | '));
  for (const n of ['Jérémy', 'Karine', 'Aurélie', 'Farid', 'Dylan', 'Élodie']) vrai(noms.includes(n), `${n} absent des lignes : ${noms}`);
  vrai(/4 h 45 de conduite \(avec la pause de 45 min en route\)/.test(await pg.textContent(`${Z} [data-pl-id="t5"][data-pl-vue="b"]`)), 'la carte de T5 dit SA conduite');
  // Un autre élève : d'autres chauffeurs sur les lignes.
  await monter({ uid: E.B.uid });
  await aller('planning');
  const noms2 = await pg.$$eval(`${Z} [data-pl-grille] .pl-res`, (L) => L.map((x) => x.textContent.trim()).join(' | '));
  vrai(/Camille/.test(noms2) && /Nadège/.test(noms2) && !/Jérémy/.test(noms2), `autre élève : ${noms2}`);
  // Le même élève revient : les mêmes lignes.
  await monter({ uid: E.A.uid });
  await aller('planning');
  egal(await pg.$$eval(`${Z} [data-pl-grille] .pl-res`, (L) => L.map((x) => x.textContent.trim()).join(' | ')), noms, 'même élève, mêmes lignes');
  egal(erreurs, [], 'erreurs JS');
});

await v('ENT-11.4 : inaction — rien fait → 0/20 ; ouverture juste seule → 4/20 ; copie vide rendue → 4 (l’ouverture), copie vraiment vide → 0 ; deux envois à vide → aucun jalon juste', async () => {
  await monter({ uid: E.A.uid, sansOuverture: true });
  let n = await noter();
  egal([n.score, n.max], [0, 20], 'note');
  egal(JALONS.filter((j) => n.detail[j] === 'ok'), [], 'jalons justes sans rien faire');
  await monter({ uid: E.A.uid });
  n = await noter();
  egal([n.score, n.max], [4, 20], 'ouverture juste seule');
  egal((await rendre()).score, 4, 'copie vide rendue');
  await monter({ uid: E.B.uid });
  await aller('planning');
  await envoyer();
  await aller('planning');
  await envoyer();
  n = await noter();
  egal(JALONS.filter((j) => n.detail[j] === 'ok'), [], 'deux envois à vide : aucun jalon juste');
});

await v('ENT-11.4 : « Avant de commencer » noté — 4 justes = 4 ; tout faux = 0 (plancher) ; 3 justes + 1 fausse = 3 − 1/(mauvaises réponses de cette question) ; « Je ne sais pas » = 0 ; le tirage est rangé, 2 + 2, et ne change pas', async () => {
  await monter({ uid: E.A.uid, sansOuverture: true });
  const T = (await base()).questions[ID]['@tirage'];
  vrai(T, 'tirage rangé : ' + JSON.stringify(Object.keys((await base()).questions[ID] || {})));
  const ids = Array.isArray(T) ? T : (T.ids || T.questions || Object.values(T).flat());
  egal(ids.length, 4, 'quatre questions tirées : ' + JSON.stringify(T));
  const PREP = ['qui-decide-camions', 'jours-tournees', 'bulle-camion', 'permis-porteur'];
  egal(ids.filter((q) => PREP.includes(q)).length, 2, 'dont deux de préparation');
  await monter({ uid: E.A.uid, db: { questions: { [ID]: { '@tirage': T } } }, rep: Object.fromEntries(ids.map((q) => [q, OUV[q]])) });
  egal((await noter()).score, 4, '4 justes');
  await monter({ uid: E.A.uid, db: { questions: { [ID]: { '@tirage': T } } }, rep: Object.fromEntries(ids.map((q) => [q, OUV_FAUSSES[q]])) });
  egal((await noter()).score, 0, 'tout faux : plancher 0');
  const rep = Object.fromEntries(ids.map((q, i) => [q, i ? OUV[q] : OUV_FAUSSES[q]]));
  await monter({ uid: E.A.uid, db: { questions: { [ID]: { '@tirage': T } } }, rep });
  proche((await noter()).score, 3 - 1 / MAUVAISES[ids[0]], '3 justes + 1 fausse');
  await monter({ uid: E.A.uid, db: { questions: { [ID]: { '@tirage': T } } }, rep: Object.fromEntries(ids.map((q, i) => [q, i ? OUV[q] : '@nsp'])) });
  egal((await noter()).score, 3, '3 justes + « Je ne sais pas »');
  await monter({ uid: E.A.uid });
  const T2 = (await base()).questions[ID]['@tirage'];
  egal([T2.graine, T2.ids, T2.q], [T.graine, T.ids, T.q], 'le tirage rangé ne change pas');
});

for (const k of ['A', 'B', 'C']) {
  await v(`ENT-11.4 : parcours juste à l’écran (${E[k].uid}, imprévu « ${E[k].alea} ») — 20/20 à la remise, égal à noter(db) ; l’imprévu arrive à 5 h 30 avec SON texte ; Samia ne dit ni juste ni faux ; une seule remise ; rien ne remonte avant`, async () => {
    await parcours(k);
    const M = await entrants();
    const imprevu = M.find((m) => m.subject === 'Imprévu : planning à reprendre');
    vrai(imprevu, 'message de l’imprévu');
    const attendu = { doublee: /T2 \(Agglo ouest\) a doublé/, malade: /Lucie est malade/, panne: /camion P3 est en panne/ }[E[k].alea];
    vrai(attendu.test(imprevu.text), `texte de l’imprévu : ${imprevu.text}`);
    vrai(M.every((m, i) => !i || m.ts >= M[i - 1].ts), 'heures croissantes');
    vrai(M.every((m) => !/\b(juste|justes|faux|fausse|fausses|correct|correcte|bravo|bonne réponse|mauvaise réponse)\b/i.test(m.text)), 'un message dit juste ou faux');
    vrai(!(await present('[data-fin-jalon]')) && !/Corriger/.test(await texte()), 'bilan ou « Corriger » à l’écran avant la remise');
    const n = await noter();
    egal(ko(n), [], `jalons (${k}) : ${JSON.stringify(n.detail).slice(0, 300)}`);
    egal([n.score, n.max], [20, 20], 'noter(db)');
    egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
    const c = await rendre();
    egal([c.score, c.max], [20, 20], 'la note rendue = noter(db)');
    vrai(await present('[data-copie-etat="rendue"]'), 'copie rendue à l’écran');
    egal(await copies(), 1, 'une seule remise');
    vrai(!(await present('[data-copie-rendre]')), 'le bouton de remise est encore là après la remise');
    vrai(!(await present('[data-pl="envoyer"]')) || !(await pg.isEnabled(`${Z} [data-pl="envoyer"]`)), 'le planning peut encore être envoyé après la remise (verrou)');
    egal(erreurs, [], 'erreurs JS');
  });
}

await v('ENT-11.4 : un seul jalon tombe à la fois — message à Samia faux (« ce qui change ») → seul « message » ; planning de reprise inchangé (garde d’inaction) → seul « v2-replanifier » ; repos violé au 1er envoi → seul « v1-repos » (puis la reprise juste le garde)', async () => {
  await parcours('A', { samia: lignesSamia('A', { changement: 'T2 est doublée : j’ai mis deux chauffeurs sur la même tournée T2, sans camion en plus.' }) });
  let n = await noter();
  egal([ko(n), n.score], [['message'], points(['message'])], 'message faux');
  await parcours('B', { v2: E.B.v1 });
  n = await noter();
  egal([ko(n), n.score], [['v2-replanifier'], points(['v2-replanifier'])], 'reprise inchangée');
  await parcours('A', { v1: avec(E.A.v1, ['t5', 'ch5', 4, 'P3']) });
  n = await noter();
  egal([ko(n), n.score], [['v1-repos'], points(['v1-repos'])], 'repos violé au 1er envoi');
  await parcours('C', { samia: lignesSamia('C', { raison: 'Je n’ai pas regardé le repos, ça ira.' }) });
  n = await noter();
  egal([ko(n), n.score], [['message'], points(['message'])], 'raison fausse');
  await parcours('C', { samia: lignesSamia('C', { salutation: 'Coucou !', formule: 'Bisous' }) });
  n = await noter();
  egal([ko(n), n.score], [[], 20], 'la forme du message ne coûte rien (salutation et fin non jugées)');
});

await v('ENT-11.4 : les questions au fil sont posées sur SON jeu et rangées pour l’enseignant, sans jamais changer la note ; l’éco-droit (arrêt maladie) n’est posée qu’avec l’imprévu « malade », sinon une question de repos', async () => {
  await parcours('B');
  const Q = (await base()).questions[ID];
  egal(Q['repos-tardif'].premiere, 'repos', 'repos-tardif répondue');
  vrai(/Nadège a fini son service hier à 23:00/.test(Q['repos-tardif'].texte.enonce), 'repos-tardif : ' + JSON.stringify(Q['repos-tardif'].texte));
  vrai(/4 h 15 de conduite/.test(Q['pause-t5'].texte.enonce), 'pause-t5 : ' + JSON.stringify(Q['pause-t5'].texte));
  vrai(/Lucie prévient Samia à 5 h 30 qu’il est malade/.test(Q['arret-maladie'].texte.enonce), 'arret-maladie (malade) : ' + JSON.stringify(Q['arret-maladie'].texte));
  egal((await noter()).score, 20, 'note');
  await parcours('C');
  vrai(/reprendre au plus tôt, avec 11 h de repos/.test((await base()).questions[ID]['arret-maladie'].texte.enonce), 'pas de maladie : question de repos');
  egal((await noter()).score, 20, 'note');
});

await v('ENT-11.4 : le corrigé se calcule depuis la graine (solution avant et après l’imprévu, chauffeur au repos, conduite de T5) ; une base sans graine donne le jeu à venir', async () => {
  const c = await pg.evaluate(async ({ g }) => {
    const C = await import('/contenus/corriges/ENT-11.4.js');
    const a = C.corrigeEleve({ tirage: { graine: g } });
    const b = C.corrigeEleve({}, 'eleve-sans-base');
    return { n: C.CORRIGE.items.length, items: a.items.map((x) => [x.texte, x.rep]), vide: b.texte, nb: b.items.length };
  }, { g: E.A.uid });
  egal(c.n, 6, 'rubriques');
  egal(c.items.find((x) => x[0] === 'Le chauffeur au repos')[1], 'Élodie (fin de service hier 22:30) : aucune tournée possible, il n’en a pas', 'repos');
  egal(c.items.find((x) => x[0] === 'La conduite de T5')[1], '4 h 45 : plus de 4 h 30, donc une pause de 45 min en route', 'conduite');
  vrai(/T3 Sud : Aurélie sur P2 à 06:00/.test(c.items.find((x) => x[0] === 'Premier envoi : une solution juste')[1]), 'solution du 1er envoi : ' + JSON.stringify(c.items));
  vrai(/T2 bis : Chauffeur de renfort sur Fourgon de renfort à 07:00/.test(c.items.find((x) => x[0] === 'Après l’imprévu : une solution juste')[1]), 'solution de la reprise');
  vrai(/pas encore ouvert/.test(c.vide) && c.nb === 6, 'base sans graine');
});

await v('ENT-11.4 : aucune requête hors du domaine, aucune erreur de page pendant le bloc', async () => {
  egal([...F.hotes], [], 'hôtes externes');
  egal(erreurs, [], 'erreurs JS');
});

await F.fermer();
}
