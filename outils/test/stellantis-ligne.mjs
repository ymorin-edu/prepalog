// Suite de tests de Prepalog — bloc « stellantis-ligne » : Stellantis Sochaux, le temps 2 de C2.3 (ENT-13.6 à 13.9, Terminale), le bord de ligne.
// `node outils/test.mjs stellantis-ligne` ne lance que ce bloc. Données : `contenus/stellantis-ligne.js` ; vue : `core/types/ligne.js` (bloc `ligne`).
// Aides : `outils/test/ikea/commun.mjs`. Les minutes de ligne passent par `__ligne.avancer(n)` (aucune attente réelle).
//
// VALEURS ÉCRITES À LA MAIN (relues sur les documents le 27/10/2026 ; le code les calcule, le test les écrit) :
// Poste 2 (13.6) : 12 en cours, 30 d'avance, 2 par voiture → (12 + 30) ÷ 2 = 21 voitures ; 12 ÷ 2 = 6 min ; 30 ÷ 2 = 15 − 5 = 10 min.
// Postes du jour (13.9) : rétroviseurs 8 + 30 → 19, 15 − 5 = 10 ; planches 8 + 10 → 18, 10 − 5 = 5 ; roues 8 + 28 → 9, 7 − 5 = 2 ; roues 20 + 28 → 12, 2.
// Conso (13.7) : 60 × 3 ÷ 10 = 18 ; 18 ÷ 6 = 3 ; 240 ÷ 28 ≈ 8,57 ; 2 × 60 ÷ 6 = 20. Note de Julien (13.8) : 28 × 1 200 = 33 600 min = 560 h.
// Camion de 13.8 (joueur qui envoie tout à temps) : planches de bord 6 + 10 au bord de ligne + 3 racks de 10 = 46 pièces → 06:46 ;
// camion à 07:15 → 75 − 46 = 29 voitures perdues si l'on attend.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const SEANCES = [
  ['stellantis-bord-de-ligne', '6'], ['stellantis-matinee-sans-aide', '7'], ['stellantis-camion-en-retard', '8'], ['stellantis-evaluation-ligne', '9'],
].map(([id, n]) => ({ id, n, act: `/activites/${id}.js`, pre: `13${n}`, lig: `st-ligne-13${n}` }));
const S_ = Object.fromEntries(SEANCES.map((s) => [s.n, s]));
const OBJET = 'Ton compte rendu';

const P = await ouvrirIkea({ nav, BASE, vrai, activite: S_['6'].act, id: S_['6'].id });
const { pg, Z, pause, entrants, clic, allerV, sansToast, confirmer, noter, phrases, monter, ouvrirParMessage, erreurs } = P;

const OUV = { bord: 'pied', minute: '4', carte: 'vide', robot: 'non', grouper: 'un', secours: 'calcul', securite: 'employeur', adaptation: 'oui', partielle: 'partielle' };
const RF = {
  6: { 'deux-vides': 'arret', 'pourquoi-grouper': 'libre', 'peu-de-stock': 'cout', ressenti: 'temps' },
  7: { 'piece-5008': 'siege', 'roues-sept': '7', lourds: 'deux', 'formation-robots': 'travail', ressenti: 'normal' },
  8: { 'qui-prevenir': 'atelier', 'pas-vider': 'total', indemnite: 'indemnite', ressenti: 'calme' },
  9: { ressenti: 'ligne' },
};
let R = RF[6];
const qFil = async () => {
  for (let i = 0; i < 8; i++) {
    await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 600 }).catch(() => null);
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(R[q], `question au fil « ${q} » sans réponse prévue`);
    await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80);
    if (await pg.$(`${Z} [data-q-repondre="${q}"]`)) { await clic(`[data-q-choix="${R[q]}"][data-q="${q}"]`); await clic(`[data-q-repondre="${q}"]`); await pause(); }
    if (await pg.$(`${Z} [data-q-reprendre]`)) { await clic('[data-q-reprendre]'); await pause(); }
  }
};
let S = S_['6'];
const mont = (s, o = {}) => { S = s; R = { ...RF[s.n], ...(o.fil || {}) }; return monter({ activite: s.act, id: s.id, rep: OUV, uid: 'st-' + s.id, ...o }); };
const detail = async () => (await noter(S.act)).detail;
const ko = (d) => Object.keys(d).filter((k) => d[k] === 'ko');
const RL = `${Z} [data-l-ligne]`;

async function remplir({ choix = {}, cases = {}, nb = {} }) {
  for (const [b, x] of Object.entries(choix)) { await pg.check(`${Z} [data-fiche-champ="${b}"][value="${x}"]`); await pause(120); await qFil(); }
  for (const [b, L] of Object.entries(cases)) for (const x of L) { await pg.check(`${Z} [data-fiche-case="${b}"][value="${x}"]`); await pause(120); await qFil(); }
  for (const [b, x] of Object.entries(nb)) { await pg.fill(`${Z} [data-fiche-saisie="${b}"]`, String(x)); await pg.keyboard.press('Tab'); await pause(120); await qFil(); }
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil();
}
// La matinée : « Démarrer », puis un joueur qui envoie les cartes (la plus urgente d'abord), groupées ou une par robot (`seul`), sur l'état
// rangé, avec les fonctions de la vue ; la minute passe par la vue. Au message du camion, il répond par l'écran (`camion` : { heure, perdues,
// decision } ; `juste` = les réponses calculées), puis continue jusqu'à la fin.
async function matinee({ seul = false, camion = null } = {}) {
  await allerV('ligne');
  await pg.waitForSelector(`${RL} [data-l="demarrer"]`);
  await clic('[data-l-ligne] [data-l="demarrer"]');
  const tour = () => pg.evaluate(([RL, sid, seul]) => (async () => {
    const L = await import('/core/types/ligne.js'), el = document.querySelector(RL), D = el.__ligne.declaration;
    const st = window.__f.db.lignes[sid][D.id];
    if (D.temps === 'guidage') st.coach = { carte: true, deux: true, bas: true, arret: true };   // Karim a déjà tout expliqué
    const kg = (c) => D.postes.find((p) => p.id === c.p).kg;
    for (let i = 0; i < 300 && !st.fait && !(st.evt >= 1 && st.evt <= 3); i++) {
      for (let j = 0; j < 4; j++) {
        const C = st.cartes.filter((c) => st.stock[c.p] > 0).sort((a, b) => L.couverture(D, st, a.p) - L.couverture(D, st, b.p));
        if (!C.length) break;
        const ks = [C[0].k];
        if (!seul) { const c2 = C.slice(1).find((c) => kg(C[0]) + kg(c) <= D.robots.kgMax && (c.p !== C[0].p || st.stock[c.p] >= 2)); if (c2) ks.push(c2.k); }
        if (!L.envoyerRobot(D, st, ks).ok) break;
      }
      el.__ligne.avancer(1);
    }
    return { fait: !!st.fait, evt: st.evt, rep: st.rep };
  })(), [RL, S.id, seul]);
  let r = await tour();
  if (!r.fait && camion) {
    const rep = { heure: camion.heure === 'juste' ? r.rep.heureJuste : camion.heure, perdues: camion.perdues === 'juste' ? r.rep.perduesJuste : camion.perdues, decision: camion.decision };
    for (const q of ['heure', 'perdues', 'decision']) {
      await clic(`[data-l-ligne] [data-l="rep"][data-q="${q}"][data-v="${rep[q]}"]`); await pause(60);
      if (await pg.$(`${RL} [data-l="evt-suite"]`)) { await clic('[data-l-ligne] [data-l="evt-suite"]'); await pause(60); }
    }
    r = await tour();
  }
  vrai(r.fait, 'la matinée n’est pas finie');
  await pause(200);
  await qFil();
  return pg.evaluate(([sid, lig]) => JSON.parse(JSON.stringify(window.__f.db.lignes[sid][lig])), [S.id, S.lig]);
}
async function compteRendu(compte = {}) {
  await pause(700);
  const L = await pg.evaluate((o) => { const m = window.__f.db.mails.find((x) => x.subject === o); return m ? Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix.slice()])) : null; }, OBJET);
  vrai(L, 'pas de compte rendu');
  const t = Object.fromEntries(Object.entries(L).map(([k, c]) => [k, c[0]]));
  for (const [k, i] of Object.entries(compte)) t[k] = L[k][i];
  await phrases(OBJET, t);
  await qFil();
  return L;
}
// `id` = null : la première fiche de la séance (vue « fiche »).
const fiche = async (sujet, id, f) => { await pause(700); await ouvrirParMessage(sujet, id ? `fiche:f${S.pre}-${id}` : 'fiche'); await remplir(f); };

// ─────────────────────────────────────────────────────────── la déclaration et les données
await v('ENT-13.6 à 13.9 : les quatre séances se chargent (Terminale, C2.3, les quatre temps) ; jalons + questions = 20 ; elles se suivent ; au registre', async () => {
  const r = await pg.evaluate(async (L) => {
    const I = await import('/activites/index.js');
    const reg = (await I.chargerActivites()).map((a) => a.meta.id);
    const out = [];
    for (const s of L) {
      const A = await import(s.act);
      const C = await import(`/contenus/stellantis-ent${s.pre}.js`);
      const Q = await import(`/contenus/questions/ENT-13.${s.n}.js`);
      out.push({ m: [A.meta.code, A.meta.niveaux, A.meta.competences, A.meta.temps, A.meta.bareme, A.meta.copie, A.meta.questions, A.meta.pret,
        A.meta.ouverture, A.meta.precedente, A.meta.parcours, A.meta.niveauxPrevus], total: C.ETAPES.reduce((t, e) => t + (e.poids || 0), 0), part: Q.QUESTIONS.part || 0,
        ouvPart: Q.QUESTIONS.ouverture.part || 0, noter: typeof A.noter, reg: reg.includes(s.id), suite: C.SUITE.map((x) => x.vue) });
    }
    return out;
  }, SEANCES);
  egal(r.map((x) => x.m), [
    ['ENT-13.6', ['tle'], ['C2.3'], 'guidage', 20, undefined, 'ENT-13.6', true, 'prof', undefined, true, ['accompagne']],
    ['ENT-13.7', ['tle'], ['C2.3'], 'entrainement', 20, undefined, 'ENT-13.7', true, 'prof', 'stellantis-bord-de-ligne', true, ['confirme', 'accompagne']],
    ['ENT-13.8', ['tle'], ['C2.3', 'C3.4'], 'erreur', 20, undefined, 'ENT-13.8', true, 'prof', 'stellantis-matinee-sans-aide', true, ['accompagne']],
    ['ENT-13.9', ['tle'], ['C2.3'], 'evaluation', 20, true, 'ENT-13.9', true, 'prof', undefined, undefined, undefined],
  ], 'meta');
  egal(r.map((x) => x.total + x.part + x.ouvPart), [20, 20, 20, 20], 'jalons + questions');
  egal(r.map((x) => x.noter === 'function'), [false, false, false, true], 'noter seulement en évaluation');
  egal(r.map((x) => x.reg), [true, true, true, true], 'au registre');
  egal(r.map((x) => x.suite.join(' ')), ['fiche ligne fiche:f136-couverture mail', 'fiche ligne mail', 'ligne fiche mail', 'fiche ligne mail'], 'ordre des écrans');
});

await v('ENT-13.6 à 13.9 : les données — couvertures, consommation, note de Julien, les quatre jeux tirés et leur poste du jour (valeurs à la main) ; matinées valides à tous les niveaux', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/stellantis-ligne.js');
    const L = await import('/core/types/ligne.js');
    const jeux = new Set(); for (let i = 0; i < 400; i++) jeux.add(M.indiceJeu139(`eleve-${i}`));
    // Le poste du jour de chaque jeu = ce que la matinée tirée pose à 6 h.
    const accord = M.JEUX_139.map((J, k) => { const P = M.POSTES_139[k]; const id = { rétroviseurs: 'retro', 'planches de bord': 'pdb', roues: 'roue' }[P.piece]; return J.depart[id] === P.enCours; });
    const g = (k) => { for (let i = 0; ; i++) if (M.indiceJeu139(`e${i}`) === k) return `e${i}`; };
    const decls = [M.ligne136('', {}), M.ligne136('', { niveau: 'accompagne' }), M.ligne137('', {}), M.ligne137('', { niveau: 'confirme' }), M.ligne138('', {}),
      ...[0, 1, 2, 3].map((k) => M.ligne139(g(k)))];
    return { p2: M.couv(M.POSTE2), jour: M.POSTES_139.map((P) => [M.couv(P).tient, M.couv(P).tard]), conso: [M.CONSO.cinq, M.CONSO.racks, Math.round(M.CONSO.palettes * 100) / 100, M.CONSO.allers],
      heures: M.HEURES_PERDUES, jeux: [...jeux].sort(), accord,
      verif: decls.map((D) => L.verifierLigne(D, { copie: D.temps === 'evaluation' })), postes: decls.map((D) => D.postes.length),
      vitesse: decls.map((D) => D.secondes), ids: decls.map((D) => D.id) };
  });
  egal(r.p2, { tient: 21, vide: 6, tard: 10 }, 'poste 2');
  egal(r.jour, [[19, 10], [18, 5], [9, 2], [12, 2]], 'postes du jour');
  egal(r.conso, [18, 3, 8.57, 20], 'consommation');
  egal(r.heures, 560, 'heures perdues');
  egal(r.jeux, [0, 1, 2, 3], '400 graines tirent les quatre jeux');
  egal(r.accord, [true, true, true, true], 'le poste du jour est celui de la matinée');
  vrai(r.verif.every((x) => !x || !x.length), 'matinée refusée : ' + JSON.stringify(r.verif));
  egal(r.postes, [4, 4, 4, 5, 4, 4, 4, 4, 4], 'cinq postes pour le confirmé seulement');
  egal(r.vitesse, [2, 3, 1.2, 1.2, 1.2, 1.3, 1.3, 1.3, 1.3], 'secondes par minute de ligne (accompagné × 1,5)');
  egal(r.ids, ['st-ligne-136', 'st-ligne-136', 'st-ligne-137', 'st-ligne-137', 'st-ligne-138', 'st-ligne-139', 'st-ligne-139', 'st-ligne-139', 'st-ligne-139'], 'ids');
});

await v('ENT-13.7 à 13.9 : contrôle d’équité — sur chaque matinée (et chaque jeu de l’évaluation), qui groupe à temps (deux appels urgents au plus) et appelle le convoi n’a aucun arrêt ; qui envoie une carte par robot et attend le camion en a', async () => {
  const r = await pg.evaluate(async () => {
    const M = await import('/contenus/stellantis-ligne.js');
    const L = await import('/core/types/ligne.js');
    const g = (k) => { for (let i = 0; ; i++) if (M.indiceJeu139(`e${i}`) === k) return `e${i}`; };
    const jouer = (D, bon) => {
      const st = L.matineeNeuve(D); st.parti = true;
      const kg = (c) => D.postes.find((p) => p.id === c.p).kg;
      while (!st.fait) {
        if (st.evt >= 1 && st.evt <= 3) { L.repondreCamion(D, st, 'heure', st.rep.heureJuste); L.repondreCamion(D, st, 'perdues', st.rep.perduesJuste); L.repondreCamion(D, st, 'decision', bon ? 'secours' : 'attendre'); }
        for (let j = 0; j < 4; j++) {
          const C = st.cartes.filter((c) => st.stock[c.p] > 0 && st.t - c.t >= 1).sort((a, b) => L.couverture(D, st, a.p) - L.couverture(D, st, b.p));
          if (!C.length) break;
          const ks = [C[0].k];
          if (bon) { const c2 = C.slice(1).find((c) => kg(C[0]) + kg(c) <= D.robots.kgMax && (c.p !== C[0].p || st.stock[c.p] >= 2)); if (c2) ks.push(c2.k); }
          const urgent = bon && L.couverture(D, st, C[0].p) < 5 && st.urgents < D.robots.urgents;
          if (!L.envoyerRobot(D, st, ks, { urgent }).ok) break;
        }
        L.minuteLigne(D, st);
      }
      return L.resumeMatinee(D, st);
    };
    const decls = [['137', M.ligne137('', {})], ['137 confirmé', M.ligne137('', { niveau: 'confirme' })], ['138', M.ligne138('', {})], ...[0, 1, 2, 3].map((k) => [`139 jeu ${k}`, M.ligne139(g(k))])];
    return decls.map(([nom, D]) => { const b = jouer(D, true), n = jouer(D, false); return [nom, b.arret, b.demiVides, n.arret > 0, n.demiVides > 0]; });
  });
  egal(r.map((x) => [x[0], x[1], x[2]]), [['137', 0, 0], ['137 confirmé', 0, 0], ['138', 0, 0], ['139 jeu 0', 0, 0], ['139 jeu 1', 0, 0], ['139 jeu 2', 0, 0], ['139 jeu 3', 0, 0]], 'le bon joueur : aucun arrêt, aucun robot à moitié vide');
  vrai(r.every((x) => x[3] && x[4]), 'le joueur maladroit n’a ni arrêt ni robot à moitié vide : ' + JSON.stringify(r));
});

await v('ENT-13.6 à 13.9 : les documents et les messages — mentions, phrases du compte rendu toutes différentes ; les corrigés se chargent', async () => {
  const r = await pg.evaluate(async (L) => {
    const txt = (h) => { const e = document.createElement('div'); e.innerHTML = h; return e.textContent.replace(/\s+/g, ' '); };
    const doubles = [], sans = [], corr = [];
    for (const s of L) {
      const C = await import(`/contenus/stellantis-ent${s.pre}.js`);
      for (const db of [{}, { tirage: { graine: 'a' } }, { tirage: { graine: 'b' } }]) {
        const d = C.VOLET.declencheurs.find((x) => x.id === 'compte');
        for (const l of d.semer('Léa', db).mails[0].phrases.lignes) if (new Set(l.choix).size !== l.choix.length) doubles.push(`${s.n} ${l.id}`);
        for (const D of C.OPTIONS.documents) { const t = txt(typeof D.html === 'function' ? D.html(db) : D.html); if (!/Document pédagogique|Légifrance/.test(t)) sans.push(`${s.n} ${D.id}`); }
      }
      const K = await import(`/contenus/corriges/ENT-13.${s.n}.js`);
      corr.push([K.CORRIGE.code, K.CORRIGE.items.length > 0, K.corrigeEleve({ tirage: { graine: 'b' } }, 'b').items.length > 0]);
    }
    return { doubles, sans, corr };
  }, SEANCES);
  egal(r.doubles, [], 'phrases en double');
  egal(r.sans, [], 'documents sans mention');
  egal(r.corr.map((x) => x[0]), ['ENT-13.6', 'ENT-13.7', 'ENT-13.8', 'ENT-13.9'], 'corrigés'); vrai(r.corr.every((x) => x[1] && x[2]), 'corrigé vide : ' + JSON.stringify(r.corr));
});

// ─────────────────────────────────────────────────────────── les parcours
await v('ENT-13.6 : inaction → 0/20 ; le Bord de ligne fermé avant le kanban ; parcours juste → 20/20 ; le compte rendu reprend SA matinée', async () => {
  await mont(S_['6'], { sansOuverture: true });
  const n0 = await noter(S.act);
  egal([n0.score, n0.max], [0, 20], 'note');
  await mont(S_['6']);
  egal((await entrants()).length, 1, 'un seul message');
  vrai(!!(await pg.$(`${Z} .ent-nav[data-vue-fermee="ligne"]`)), 'le Bord de ligne est fermé avant le kanban');
  await allerV('fiche'); await remplir({ choix: { quand: 'vide', dit: 'quoi', deux: 'temps' } });
  const st = await matinee();
  egal([st.premier.n, st.premier.arret, st.premier.demiVides], [60, 0, 0], 'matinée parfaite');
  await fiche('Le poste 2 à 6 h 40', 'couverture', { nb: { tient: 21, vide: 6, tard: 10 } });
  const L = await compteRendu();
  egal(L.matinee[0], 'Ce matin, la ligne a monté 60 voitures sur 60, avec aucune minute d’arrêt.', 'sa matinée');
  const n = await noter(S.act);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail));
  vrai(!(await entrants()).some((m) => /\b(bravo|bonne réponse|mauvaise réponse|correct|faux)\b/i.test(m.text) && !/Bravo pour ta première matinée/.test(m.text)), 'un message juge');
  egal(erreurs, [], 'erreurs de page');
});

await v('ENT-13.7 : une carte par robot → la matinée perd les points des robots bien remplis ; le confirmé voit cinq postes', async () => {
  await mont(S_['7']);
  await allerV('fiche'); await remplir({ nb: { cinq: 18, racks: 3, palettes: '8,6', allers: 20 }, choix: { conclusion: 'grouper' } });
  const st = await matinee({ seul: true });
  vrai(st.premier.demiVides > 0, 'aucun robot à moitié vide');
  await compteRendu();
  const d = await detail();
  egal(ko(d), [], 'rien de faux en entier');
  // Note = 20 − 2 × (robots à moitié vides ÷ robots) − 3 × (minutes d'arrêt ÷ 10) − 4 × (1 − (voitures − 10) ÷ 80) (10 voitures sans aucun geste).
  const p = st.premier;
  proche((await noter(S.act)).score, 20 - 2 * p.demiVides / p.envois - 3 * Math.min(1, p.arret / 10) - 4 * (1 - (p.n - 10) / 80), 'note');
  vrai((await noter(S.act)).score < 19.5, 'une carte par robot coûte des points');
  await mont(S_['7'], { aisance: 'confirme' });
  await allerV('fiche'); await remplir({ nb: { cinq: 18, racks: 3, palettes: '8,6', allers: 20 }, choix: { conclusion: 'grouper' } });
  await allerV('ligne');
  egal(await pg.$$eval(`${RL} [data-l-couv]`, (L) => L.length), 0, 'couverture cachée en entraînement');
  egal(await pg.evaluate((RL) => document.querySelector(RL).__ligne.declaration.postes.map((p) => p.id), RL), ['roue', 'retro', 'pdb', 'siege', 'faisceau'], 'cinq postes');
});

await v('ENT-13.8 : le camion en retard — 06:46 et 29 voitures (à la main), convoi ; la note de Julien ; parcours juste → 20/20 ; « attendre » et la note crue → points perdus', async () => {
  await mont(S_['8']);
  const st = await matinee({ camion: { heure: 'juste', perdues: 'juste', decision: 'secours' } });
  egal([st.rep.heureJuste, st.rep.perduesJuste, st.rep.decision, st.premier.arret], [46, 29, 'secours', 0], 'camion');
  await fiche('La note de Julien sur hier', null, { cases: { erreurs: ['heures', 'cause'] }, nb: { heures: 560 } });
  const L = await compteRendu();
  egal(L.heure[0], 'Sans rien faire, la ligne aurait manqué de planches de bord à 06:46.', 'son heure d’arrêt');
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  await mont(S_['8']);
  const s2 = await matinee({ camion: { heure: 'juste', perdues: 'juste', decision: 'attendre' } });
  vrai(s2.premier.arret >= 10, 'attendre le camion arrête la ligne : ' + s2.premier.arret);
  await fiche('La note de Julien sur hier', null, { cases: { erreurs: ['heures'] }, nb: { heures: 33600 } });
  await compteRendu();
  const d = await detail();
  egal(['ligne-arret', 'ligne-decision', 'note-erreurs', 'note-heures'].map((k) => d[k]), ['ko', 'ko', 'ko', 'ko'], 'jalons tombés');
});

await v('ENT-13.9 : évaluation — « Avant de commencer » noté, poste du jour tiré, matinée sans bilan pour l’élève, copie → 20/20 ; une autre graine, un autre poste', async () => {
  await mont(S_['9'], { uid: 'b' });
  const graine = await pg.evaluate(() => window.__f.db.tirage.graine);
  const J = await pg.evaluate(async (g) => { const M = await import('/contenus/stellantis-ligne.js'); return M.couv(M.posteJour(g)); }, graine);
  await allerV('fiche'); await remplir({ nb: { tient: J.tient, tard: J.tard } });
  await matinee({ camion: { heure: 'juste', perdues: 'juste', decision: 'secours' } });
  egal(await pg.$$eval(`${RL} [data-l-ligne="perdues"]`, (L) => L.length), 0, 'pas de bilan pour l’élève');
  await compteRendu();
  proche((await noter(S.act)).score, 20, 'parcours juste : ' + JSON.stringify(await detail()));
  const autres = await pg.evaluate(async () => { const M = await import('/contenus/stellantis-ligne.js'); return ['b', 'y', 'a', 'z', 'k'].map((g) => M.posteJour(g).nom + ' ' + M.posteJour(g).enCours); });
  vrai(new Set(autres).size > 1, 'toutes les graines tirent le même poste : ' + autres);
});

await P.fermer();
}
