// Suite de tests de Prepalog — bloc « mr-11.6 » : Mondial Relay ENT-11.6, évaluation « les renforts de décembre » (2de, poste A gestion, AGO-3.2 et AGO-3.1, copie rendue).
// `node outils/test.mjs mr-11.6` ne lance que ce bloc (un bloc par séance). Brief : `docs/briefs/ENT-11.6-mondial-relay-evaluation-renforts.md` (compte rendu).
// Modèle : `outils/test/pelleau-108.mjs` (évaluation tirée par élève, copie rendue).
//
// La séance est montée dans une page à elle (1366 × 768) avec la vraie fabrique et le vrai moteur (`activites/mondial-relay-evaluation-renforts.js` → `rendre`, `noter`),
// de vrais clics à la SOURIS ; les listes des fiches et des phrases par `selectOption`. Mouvement réduit.
//
// Valeurs ÉCRITES À LA MAIN (relevé du tirage le 26/10/2026), jamais recalculées par le code de la séance. Six élèves (graine → jeu), nuits 0 à 11 = lundi 7 … samedi 12,
// lundi 14 … samedi 19 décembre ; pic = jeudi, vendredi, samedi ; CACES 1 = les deux chargeurs :
//   t116-1 : CACES Antoine, Louise ; demandes dans l'ordre affiché : Louise (mardi 8 + mercredi 9, demandé le 10) · Antoine (lundi 7 + mardi 8, le 3) · Yanis (jeudi 10 + vendredi 11, le 1).
//            Décisions : décaler · accorder · refuser. Besoin 6 6 6 9 10 10 / 7 7 7 10 11 11. Renforts 0 0 0 1 2 2 / 0 0 0 2 3 3. À recruter : 3. L'agent qui écrit : Yanis.
//   t116-2 : CACES Laura, Camille ; Bastien (ven. 18 + sam. 19, le 4) · Camille (lun. 7 + mar. 8, le 4) · Laura (mar. 8 + mer. 9, le 13). Refuser · accorder · décaler.
//            Besoin 5 5 5 10 11 11 / 6 6 6 11 12 12. Renforts 0 0 0 2 3 3 / 0 0 0 3 4 4. À recruter : 4. Agent : Bastien.
//   t116-3 : CACES Camille, Yanis ; Yanis (lun. 7 + mar. 8, le 18) · Antoine (jeu. 17 + ven. 18, le 14) · Camille (mar. 8 + mer. 9, le 11). Décaler · refuser · accorder.
//            Besoin 5 5 5 9 10 10 / 6 6 6 10 11 11. Renforts 0 0 0 1 2 2 / 0 0 0 2 3 3. À recruter : 3. Agent : Antoine.
//   t116-4 : CACES Maxime, Nadia ; Antoine (jeu. 10 + ven. 11, le 16) · Maxime (mar. 15 + mer. 16, le 7) · Nadia (lun. 14 + mar. 15, le 9). Refuser · accorder · décaler.
//            Même besoin et mêmes renforts que t116-3. À recruter : 3. Agent : Antoine.
//   t116-5 : CACES Aïcha, Maxime ; Dylan (jeu. 17 + ven. 18, le 19) · Maxime (lun. 14 + mar. 15, le 15) · Aïcha (mar. 15 + mer. 16, le 10). Refuser · décaler · accorder.
//            Même besoin et mêmes renforts que t116-2. À recruter : 4. Agent : Dylan.
//   t116-6 : CACES Thomas, Nadia ; Bastien (jeu. 10 + ven. 11, le 25) · Nadia (mar. 8 + mer. 9, le 6) · Thomas (lun. 7 + mar. 8, le 10). Refuser · accorder · décaler.
//            Même besoin et mêmes renforts que t116-1. À recruter : 3. Agent : Bastien.
// Poids : nuits 2 × 2 · congés 1 × 3 · poste 0,5, contrat 1,5, pourquoi 1 · nombre 0,5, dates 0,75, horaires 0,5, cinq mentions 0,25 · décision 1, raison 1 · salutation 0,5, fin 0,5 ·
// ouverture 4. Total 20.
// Ce qui vaut son prix : le témoin à 20 et la remise (= `noter`), l'inaction à 0, une faute qui ne fait tomber QUE son jalon (dans les deux sens), l'erreur de congé payée une seule fois,
// le tirage (un refus, toujours une solution), deux élèves = deux jeux, rien qui dise juste ou faux, aucune réponse lisible avant l'envoi.

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'mondial-relay-evaluation-renforts';
const FP = 'planning-116', FR = 'recrutement-116', PH = 'reponse-agent-116';
const ctx = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const pg = await ctx.newPage();
pg.setDefaultTimeout(8000);
const erreurs = [];
const hotes = new Set();
pg.on('pageerror', (e) => erreurs.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreurs.push('CONSOLE: ' + m.text()); });
pg.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotes.add(h); } catch (e) {} });
pg.on('dialog', (d) => d.accept());
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });
await pg.emulateMedia({ reducedMotion: 'reduce' });

const Z = '#fTest';
const pause = (ms = 80) => pg.waitForTimeout(ms);
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__f.db)));
const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
const texte = () => pg.evaluate((Z) => document.querySelector(Z).innerText, Z);
const entrants = async () => (await base()).mails.filter((m) => m.folder === 'in');
async function clic(sel) {
  const el = await pg.waitForSelector(`${Z} ${sel}`, { state: 'visible' });
  await el.scrollIntoViewIfNeeded();
  const b = await el.boundingBox();
  vrai(b && b.width > 0 && b.height > 0, `« ${sel} » n’a pas de place à l’écran`);
  await pg.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
}
const aller = async (vue) => { await clic(`.ent-nav[data-vue="${vue}"]`); await pause(); };

// Les réponses d'« Avant de commencer » : la bonne clé de chaque question, et une fausse.
const OUV = { 'qui-decide-conges': 'helene', 'besoin-nuit': 'travail', 'calcul-renforts': 'ecart', 'role-romain': 'besoin', 'conges-acquis': '25', 'plafond-30': '30',
  'bloc-24-jours': 'non24', 'essai-cdd': 'jours' };
const OUV_FAUSSES = { 'qui-decide-conges': 'romain', 'besoin-nuit': 'conge', 'calcul-renforts': 'besoin', 'role-romain': 'paie', 'conges-acquis': '2', 'plafond-30': '24',
  'bloc-24-jours': 'oui', 'essai-cdd': 'mois' };
const PENALITE = { 'qui-decide-conges': 1 / 3 };   // quatre choix : trois mauvaises réponses ; les autres ont trois choix (deux mauvaises) : 1/2
const FIL_REP = { 'pourquoi-refus': 'pic', 'quel-contrat': 'cdd', 'qui-paie-interim': 'agence' };
const FIL_FAUX = { 'pourquoi-refus': 'envie', 'quel-contrat': 'stage', 'qui-paie-interim': 'mr' };

const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/mondial-relay-evaluation-renforts.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [k, r] of Object.entries(o.rep)) if (!Q[k]) Q[k] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [], copies: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 't116-1' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'MR',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__f.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: OUV, ...o });
const noter = () => pg.evaluate(async () => { const A = await import('/activites/mondial-relay-evaluation-renforts.js'); return A.noter(window.__f.db); });
const copies = () => pg.evaluate(() => window.__f.copies.length);
const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

const JUGE = /\b(juste|justes|faux|fausse|fausses|correct|correcte|erreur|erreurs|bravo|bien vu|bonne réponse|mauvaise réponse)\b/i;
const PIED = 'Document pédagogique — reconstitution, non contractuel';

// ───────────────────────────────────────────────────────────── les six jeux écrits à la main
const BESOIN_B6 = [6, 6, 6, 9, 10, 10, 7, 7, 7, 10, 11, 11], BESOIN_B5P9 = [5, 5, 5, 9, 10, 10, 6, 6, 6, 10, 11, 11], BESOIN_B5P10 = [5, 5, 5, 10, 11, 11, 6, 6, 6, 11, 12, 12];
const RENF_P9 = [0, 0, 0, 1, 2, 2, 0, 0, 0, 2, 3, 3], RENF_P10 = [0, 0, 0, 2, 3, 3, 0, 0, 0, 3, 4, 4];
const JEUX = {
  a: { uid: 't116-1', caces: ['Antoine', 'Louise'], dem: [['Louise', [1, 2], 10], ['Antoine', [0, 1], 3], ['Yanis', [3, 4], 1]], dec: ['decaler', 'accorder', 'refuser'],
    besoin: BESOIN_B6, renf: RENF_P9, nb: 3, agent: 'Yanis', nuitsAgent: 'du jeudi 10 et du vendredi 11 décembre', nuitPic: 'jeudi 10' },
  b: { uid: 't116-2', caces: ['Laura', 'Camille'], dem: [['Bastien', [10, 11], 4], ['Camille', [0, 1], 4], ['Laura', [1, 2], 13]], dec: ['refuser', 'accorder', 'decaler'],
    besoin: BESOIN_B5P10, renf: RENF_P10, nb: 4, agent: 'Bastien', nuitsAgent: 'du vendredi 18 et du samedi 19 décembre', nuitPic: 'vendredi 18' },
  c: { uid: 't116-3', caces: ['Camille', 'Yanis'], dem: [['Yanis', [0, 1], 18], ['Antoine', [9, 10], 14], ['Camille', [1, 2], 11]], dec: ['decaler', 'refuser', 'accorder'],
    besoin: BESOIN_B5P9, renf: RENF_P9, nb: 3, agent: 'Antoine', nuitsAgent: 'du jeudi 17 et du vendredi 18 décembre', nuitPic: 'jeudi 17' },
  d: { uid: 't116-4', caces: ['Maxime', 'Nadia'], dem: [['Antoine', [3, 4], 16], ['Maxime', [7, 8], 7], ['Nadia', [6, 7], 9]], dec: ['refuser', 'accorder', 'decaler'],
    besoin: BESOIN_B5P9, renf: RENF_P9, nb: 3, agent: 'Antoine', nuitsAgent: 'du jeudi 10 et du vendredi 11 décembre', nuitPic: 'jeudi 10' },
  e: { uid: 't116-5', caces: ['Aïcha', 'Maxime'], dem: [['Dylan', [9, 10], 19], ['Maxime', [6, 7], 15], ['Aïcha', [7, 8], 10]], dec: ['refuser', 'decaler', 'accorder'],
    besoin: BESOIN_B5P10, renf: RENF_P10, nb: 4, agent: 'Dylan', nuitsAgent: 'du jeudi 17 et du vendredi 18 décembre', nuitPic: 'jeudi 17' },
  f: { uid: 't116-6', caces: ['Thomas', 'Nadia'], dem: [['Bastien', [3, 4], 25], ['Nadia', [1, 2], 6], ['Thomas', [0, 1], 10]], dec: ['refuser', 'accorder', 'decaler'],
    besoin: BESOIN_B6, renf: RENF_P9, nb: 3, agent: 'Bastien', nuitsAgent: 'du jeudi 10 et du vendredi 11 décembre', nuitPic: 'jeudi 10' },
};
// Les nuits 6 à 8 de t116-2 etc. sont des nuits de la 2e semaine : lundi 14 = 6, mardi 15 = 7, mercredi 16 = 8, jeudi 17 = 9, vendredi 18 = 10, samedi 19 = 11.
const JALONS = ['nuits-semaine-1', 'nuits-semaine-2', 'conge-accorder', 'conge-decaler', 'conge-refuser', 'contrat-poste', 'contrat-type', 'contrat-motif', 'demande-nombre',
  'demande-dates', 'demande-horaires', 'mention-chaussures', 'mention-age', 'mention-porter', 'mention-caces', 'mention-sexe', 'reponse-decision', 'reponse-raison',
  'reponse-salutation', 'reponse-fin'];
const POIDS = [2, 2, 1, 1, 1, 0.5, 1.5, 1, 0.5, 0.75, 0.5, 0.25, 0.25, 0.25, 0.25, 0.25, 1, 1, 0.5, 0.5];
const GROUPES = ['Les nuits couvertes', 'Les congés', 'Le contrat des renforts', 'La demande de recrutement', 'Répondre à l’agent', 'Le ton'];
const MENTIONS = { chaussures: true, age: false, porter: true, caces: false, sexe: false };
const REC = { poste: 'tri', contrat: 'cdd', motif: 'saison', dates: 'juste', horaires: 'nuit' };

// ───────────────────────────────────────────────────────────── les jalons sans écran (bases fabriquées)
// `d.graine` : l'élève ; `d.plan` : { 'conge-1'… , 'renforts-0'… } (fiche envoyée) ; `d.rec` : valeurs de la demande de recrutement (envoyée) ; `d.cr` : { ligne: rang } de la réponse.
const jalonsSans = (d) => pg.evaluate(async ({ d, FP, FR }) => {
  const S = await import('/contenus/mondial-relay-ent116.js');
  const db = { fiches: {}, mails: [], tirage: { graine: d.graine } };
  if (d.plan) db.fiches[FP] = { valeurs: d.plan, envoye: { at: 1 } };
  if (d.rec) db.fiches[FR] = { valeurs: d.rec, envoye: { at: 1 } };
  if (d.cr) {
    const P = S.phrasesReponse('Lea', db);
    db.mails.push({ id: 1, folder: 'in', ts: 1, phrases: { id: P.id, lignes: P.lignes.map((l) => (l.texte ? l : { ...l, ordre: l.choix.map((_, i) => i) })) } });
    db.mails.push({ id: 2, folder: 'out', ts: 2, phrases: { id: P.id, choix: d.cr } });
  }
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, (e.verifier(db) || { status: 'null' }).status]));
}, { d, FP, FR });
const planDe = (K, dec = K.dec, renf = K.renf) => ({ ...Object.fromEntries(dec.map((x, k) => [`conge-${k + 1}`, x])), ...Object.fromEntries(renf.map((x, i) => [`renforts-${i}`, String(x)])) });
const recDe = (K, o = {}) => ({ ...REC, nombre: String(K.nb), mentions: Object.fromEntries(Object.entries(MENTIONS).map(([m, oui]) => [m, { ecrire: oui }])), ...o });
const juste = (K) => ({ graine: K.uid, plan: planDe(K), rec: recDe(K), cr: { salutation: 0, decision: 0, raison: 0, fin: 0 } });
const copie = (x) => JSON.parse(JSON.stringify(x));
const ko = (n) => JALONS.filter((j) => n[j] !== 'ok');

// ───────────────────────────────────────────────────────────── la déclaration, le registre, les poids
await v('ENT-11.6 : la séance se charge (2de, AGO-3.2 et AGO-3.1, évaluation, copie, sans parcours ni correction) ; poids 16 + ouverture 4 = 20 jalon par jalon écrit à la main ; trois questions au fil, toutes de réflexion (non notées) ; au registre ; fermée aux élèves tant que l’enseignant ne l’a pas cochée', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/mondial-relay-evaluation-renforts.js');
    const S = await import('/contenus/mondial-relay-ent116.js');
    const Q = await import('/contenus/questions/ENT-11.6.js');
    const I = await import('/activites/index.js');
    const N = await import('/core/niveaux.js');
    const charges = await I.chargerActivites();
    const m = A.meta;
    const fil = Q.QUESTIONS.liste.filter((q) => q.type === 'fil');
    return { meta: m, noter: typeof A.noter, ids: S.ETAPES.map((e) => e.id), poids: S.ETAPES.map((e) => e.poids), somme: S.ETAPES.reduce((t, e) => t + (e.poids || 0), 0),
      part: Q.QUESTIONS.part, partOuv: Q.QUESTIONS.ouverture.part, nbOuv: Q.QUESTIONS.ouverture.questions.length, nbQ: Q.QUESTIONS.liste.length,
      fil: fil.map((q) => [q.id, !!q.reflexion]), groupes: [...new Set(S.ETAPES.map((e) => e.groupe))], sansEcran: S.ETAPES.filter((e) => !e.ecran).map((e) => e.id),
      bonus: S.ETAPES.filter((e) => e.bonus).length, tirage: Q.QUESTIONS.ouverture.tirage,
      auRegistre: charges.some((a) => a.meta.id === ID), echecs: (I.activitesEnEchec ? I.activitesEnEchec() : []).map((e) => e.fichier || String(e)).filter((f) => /mondial/.test(f)),
      deux: N.activiteVisible(m, { niveau: '2de', ouverts: {} }), coche: N.activiteVisible(m, { niveau: '2de', ouverts: { [ID]: true } }),
      autre: N.activiteVisible(m, { niveau: '1re', ouverts: {} }) };
  }, ID);
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture, m.rubrique], ['ENT-11.6', ['2de'], ['AGO-3.2', 'AGO-3.1'], 'evaluation', 20, true,
    'ENT-11.6', true, 'prof', 'simulog'], 'meta');
  egal([m.parcours, m.correction, m.niveauxPrevus, m.precedente], [undefined, undefined, undefined, undefined], 'ni parcours, ni correction, ni niveau');
  egal(r.noter, 'function', 'export noter');
  egal(r.ids, JALONS, 'jalons');
  egal(r.poids, POIDS, 'poids jalon par jalon (écrits à la main)');
  egal(Math.abs(r.somme + r.part - 20) < 1e-9, true, 'somme des jalons et de la part de l’ouverture = 20');
  egal([r.part, r.partOuv, r.nbOuv, r.nbQ, r.bonus, r.tirage], [4, 4, 8, 11, 0, { preparation: 2, droit: 2 }], 'ouverture notée 4 : 8 questions, 4 tirées (2 + 2) ; 3 au fil ; aucun bonus');
  egal(r.fil, [['pourquoi-refus', true], ['quel-contrat', true], ['qui-paie-interim', true]], 'questions au fil : toutes de réflexion, non notées');
  egal(r.groupes, GROUPES, 'lignes du bandeau');
  egal(r.sansEcran, [], 'chaque jalon a son écran');
  egal([r.auRegistre, r.echecs], [true, []], 'au registre, sans échec');
  egal([r.deux, r.coche, r.autre], [false, true, false], 'fermée, puis ouverte par l’enseignant ; jamais hors 2de');
});

// ───────────────────────────────────────────────────────────── les six jeux figés
await v('ENT-11.6 : jeux figés — pour six graines, l’équipe, les trois demandes (ordre, nuits, date), les décisions justes, le besoin, les renforts, le nombre à recruter et l’agent qui écrit sont ceux écrits à la main (la formule du tirage ne change pas sous les élèves)', async () => {
  const r = await pg.evaluate(async (g) => {
    const D = await import('/contenus/mondial-relay-ent116-donnees.js');
    return g.map((x) => {
      const j = D.jeuDe(x);
      return { caces: j.equipe.filter((a) => a.caces).map((a) => a.nom), n: j.equipe.length, dem: j.demandes.map((d) => [j.equipe[d.agent].nom, d.nuits, d.jour]), dec: D.decisionsJustes(j),
        besoin: Array.from({ length: 12 }, (_, i) => D.besoinDe(j, i)), renf: D.renfortsJustes(j), agent: D.nomAgent(j, D.agentRefuse(j)), nuits: D.nuitsTexte(D.agentRefuse(j).nuits) };
    });
  }, Object.values(JEUX).map((K) => K.uid));
  Object.values(JEUX).forEach((K, k) => {
    const x = r[k];
    egal(x.n, 8, `${K.uid} : huit agents`);
    egal([...x.caces].sort(), [...K.caces].sort(), `${K.uid} : les deux CACES 1`);
    egal(x.dem, K.dem, `${K.uid} : les trois demandes`);
    egal(x.dec, K.dec, `${K.uid} : les décisions justes`);
    egal(x.besoin, K.besoin, `${K.uid} : le besoin`);
    egal(x.renf, K.renf, `${K.uid} : les renforts`);
    egal(Math.max(...x.renf), K.nb, `${K.uid} : le nombre à recruter`);
    egal([x.agent, x.nuits], [K.agent, K.nuitsAgent], `${K.uid} : l’agent dont le congé est refusé`);
  });
});

// ───────────────────────────────────────────────────────────── le tirage sur 300 graines
await v('ENT-11.6 : tirage sur 300 graines, jugé par une règle réécrite à part — exactement UN refus (pic), UN accord, UN décalage, deux CACES 1, une solution toujours (renforts de 0 à 6, base à 0, chaque semaine a un renfort), aucun jeu de secours, équilibre des rangs, jamais « tout à 0 » ni « tout au maximum » ; aucun prénom en double', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/mondial-relay-ent116-donnees.js');
    const c = { secours: 0, fautes: [], rangRefus: [0, 0, 0], rangAccord: [0, 0, 0], b: {}, p: {}, semRefus: [0, 0], tousPareils: 0, vus: new Set() };
    const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
    const pic = (i) => i % 6 >= 3;
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}`, j = D.jeuDe(g);
      if (D.jeuDeSecours(g)) c.secours++;
      c.vus.add(JSON.stringify(j));
      // La règle, réécrite : (1) un refus pour toute demande qui touche une nuit de pic ; (2) deux demandes de chargeurs qui partagent une nuit : la plus ancienne reste ; (3) sinon accord.
      const touchePic = j.demandes.map((d) => d.nuits.some(pic));
      const chargeur = j.demandes.map((d) => j.equipe[d.agent].caces);
      const partage = (a, b) => j.demandes[a].nuits.some((n) => j.demandes[b].nuits.includes(n));
      const attendu = j.demandes.map((d, k) => {
        if (touchePic[k]) return 'refuser';
        if (chargeur[k]) {
          for (let o = 0; o < 3; o++) if (o !== k && !touchePic[o] && chargeur[o] && partage(k, o) && j.demandes[o].jour < d.jour) return 'decaler';
        }
        return 'accorder';
      });
      const dec = D.decisionsJustes(j);
      if (JSON.stringify(dec) !== JSON.stringify(attendu)) c.fautes.push([g, 'décisions', dec, attendu]);
      if (touchePic.filter(Boolean).length !== 1) c.fautes.push([g, 'pas exactement un refus']);
      if (dec.filter((x) => x === 'accorder').length !== 1 || dec.filter((x) => x === 'decaler').length !== 1) c.fautes.push([g, 'un accord et un décalage']);
      if (j.equipe.filter((a) => a.caces).length !== 2) c.fautes.push([g, 'deux CACES 1']);
      if (new Set(j.equipe.map((a) => a.nom)).size !== 8) c.fautes.push([g, 'prénoms en double']);
      if (new Set(j.demandes.map((d) => d.agent)).size !== 3) c.fautes.push([g, 'trois agents différents']);
      if (j.demandes.some((d) => d.nuits[1] !== d.nuits[0] + 1 || d.nuits[0] % 6 === 5 || d.jour < 1 || d.jour > 28)) c.fautes.push([g, 'une demande mal formée']);
      const renf = D.renfortsJustes(j);
      if (renf.some((x) => x < 0 || x > 6)) c.fautes.push([g, 'renfort hors de la liste 0 à 6', renf]);
      if (renf.some((x, n) => !pic(n) && x !== 0)) c.fautes.push([g, 'une nuit de base demande un renfort', renf]);
      if (![0, 1].every((s) => renf.slice(6 * s, 6 * s + 6).some((x) => x > 0))) c.fautes.push([g, 'une semaine sans renfort', renf]);
      if (renf.every((x) => x === 0)) c.tousPareils++;
      if (renf.every((x) => x === 6)) c.tousPareils++;
      if (Math.max(...renf) < 1) c.fautes.push([g, 'rien à recruter']);
      // Le refus ne se devine pas à la place : chaque rang revient.
      c.rangRefus[dec.indexOf('refuser')]++; c.rangAccord[dec.indexOf('accorder')]++;
      c.semRefus[j.demandes[dec.indexOf('refuser')].nuits[0] >= 6 ? 1 : 0]++;
      inc(c.b, j.b); inc(c.p, j.p);
      // L'inaction (tout accorder, ou tout à 0) ne donne pas la solution : accorder la demande de pic change les renforts de la nuit de pic.
      const toutAccorder = D.renfortsAttendus(j, ['accorder', 'accorder', 'accorder']);
      if (JSON.stringify(toutAccorder) === JSON.stringify(renf)) c.fautes.push([g, 'tout accorder donne la même solution']);
    }
    return { ...c, vus: c.vus.size };
  });
  egal(r.fautes, [], 'règle réécrite à part, solution, équité');
  egal(r.secours, 0, 'jeu de secours');
  egal(r.tousPareils, 0, '« tout à 0 » ou « tout au maximum » ne sont jamais la solution');
  vrai(r.rangRefus.every((n) => n >= 70) && r.rangAccord.every((n) => n >= 70), 'rang du refus ou de l’accord trop prévisible : ' + JSON.stringify([r.rangRefus, r.rangAccord]));
  vrai(r.semRefus.every((n) => n >= 90), 'semaine du refus déséquilibrée : ' + JSON.stringify(r.semRefus));
  vrai([5, 6].every((x) => r.b[x] >= 100) && [9, 10].every((x) => r.p[x] >= 100), 'besoins déséquilibrés : ' + JSON.stringify([r.b, r.p]));
  vrai(r.vus >= 290, 'jeux trop peu variés : ' + r.vus);
});

await v('ENT-11.6 : tirage stable par graine et différent d’un élève à l’autre — le même jeu à chaque appel, au moins 40 jeux distincts sur 60 élèves, deux élèves voisins ne se ressemblent pas, une base vide a un jeu', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/mondial-relay-ent116-donnees.js');
    const stable = ['t116-1', 'zoé', 'eleve-17'].every((g) => D.jeuDe(g) === D.jeuDe(g) && JSON.stringify(D.jeuDe(g)) === JSON.stringify(D.jeuDe(g)));
    const jeux = new Set(), voisins = [];
    for (let i = 0; i < 60; i++) { jeux.add(JSON.stringify(D.jeuDe(`el-${i}`))); voisins.push(JSON.stringify(D.jeuDe(`el-${i}`)) === JSON.stringify(D.jeuDe(`el-${i + 1}`))); }
    return { stable, distincts: jeux.size, voisinsPareils: voisins.filter(Boolean).length, vide: D.jeuDe('') === D.jeuDe(undefined), videOk: D.ecartsJeu(D.jeuDe('')).length };
  });
  egal(r.stable, true, 'même graine, même jeu');
  vrai(r.distincts >= 40, 'jeux distincts : ' + r.distincts);
  egal(r.voisinsPareils, 0, 'deux voisins pareils');
  egal([r.vide, r.videOk], [true, 0], 'base vide : un jeu conforme');
});

// ───────────────────────────────────────────────────────────── les jalons sans écran
await v('ENT-11.6 : jalons sans écran — rien envoyé : tout « à faire » ; juste : tout ✓ (les six jeux) ; chaque faute ne fait tomber que SON jalon ; renforts tout à 0 ou tout au maximum = les deux semaines tombent ; envoyer avant de décider ne rapporte rien', async () => {
  for (const [k, K] of Object.entries(JEUX)) {
    const vide = await jalonsSans({ graine: K.uid });
    egal(JALONS.map((j) => vide[j]), JALONS.map(() => 'attente'), 'rien fait ' + k);
    const s = await jalonsSans(juste(K));
    egal(ko(s), [], 'parcours juste ' + k);
  }
  const fautes = async (K, f) => { const d = copie(juste(K)); f(d); return ko(await jalonsSans(d)); };
  const A = JEUX.a, D = JEUX.d;
  // les trois décisions
  egal(await fautes(A, (d) => { d.plan['conge-2'] = 'refuser'; }), ['conge-accorder'], 'Antoine (à accorder) refusé : ses nuits ne retirent personne, les renforts restent justes');
  egal(await fautes(A, (d) => { d.plan['conge-1'] = 'accorder'; }), ['conge-decaler'], 'Louise (à décaler) accordée : le besoin de base est couvert quand même');
  egal(await fautes(D, (d) => { d.plan['conge-1'] = 'accorder'; d.plan['renforts-3'] = '2'; d.plan['renforts-4'] = '3'; }), ['conge-refuser'],
    'Antoine (pic) accordé, renforts refaits d’après SON choix (2 et 3 : un agent de moins) : l’erreur de congé ne se paie qu’UNE fois');
  egal(await fautes(D, (d) => { d.plan['conge-1'] = 'accorder'; }), ['nuits-semaine-1', 'conge-refuser'], 'Antoine (pic) accordé, renforts NON refaits : le congé et les nuits tombent');
  egal(await fautes(A, (d) => { d.plan['conge-1'] = 'decaler'; d.plan['conge-2'] = 'accorder'; d.plan['conge-3'] = 'refuser'; }), [], 'les mêmes décisions que le juste (témoin)');
  egal(await fautes(A, (d) => { d.plan['conge-1'] = 'refuser'; d.plan['conge-2'] = 'decaler'; d.plan['conge-3'] = 'accorder'; }), ['nuits-semaine-1', 'conge-accorder', 'conge-decaler', 'conge-refuser'],
    'décisions toutes fausses (Yanis accordé retire un agent le jeudi et le vendredi)');
  // les renforts nuit par nuit
  egal(await fautes(A, (d) => { d.plan['renforts-3'] = '2'; }), ['nuits-semaine-1'], 'un renfort de trop jeudi 10 : la semaine 1 tombe, pas la 2');
  egal(await fautes(A, (d) => { d.plan['renforts-9'] = '1'; }), ['nuits-semaine-2'], 'un renfort de moins jeudi 17 : la semaine 2 tombe, pas la 1');
  egal(await fautes(A, (d) => { d.plan['renforts-0'] = '1'; }), ['nuits-semaine-1'], 'un renfort un lundi de base (l’équipe suffit)');
  egal(await fautes(A, (d) => { for (let i = 0; i < 12; i++) d.plan[`renforts-${i}`] = '0'; }), ['nuits-semaine-1', 'nuits-semaine-2'], 'aucun renfort nulle part : ce n’est pas la solution');
  egal(await fautes(A, (d) => { for (let i = 0; i < 12; i++) d.plan[`renforts-${i}`] = '6'; }), ['nuits-semaine-1', 'nuits-semaine-2'], 'six renforts partout : ce n’est pas la solution');
  egal(await fautes(A, (d) => { delete d.plan['renforts-4']; }), ['nuits-semaine-1'], 'une nuit sans réponse');
  // le contrat des renforts
  egal(await fautes(A, (d) => { d.rec.poste = 'conseiller'; }), ['contrat-poste'], 'poste faux');
  egal(await fautes(A, (d) => { d.rec.contrat = 'cdi'; }), ['contrat-type'], 'CDI au lieu du CDD saisonnier');
  egal(await fautes(A, (d) => { d.rec.contrat = 'apprentissage'; }), ['contrat-type'], 'apprentissage');
  egal(await fautes(A, (d) => { d.rec.motif = 'remplacer'; }), ['contrat-motif'], 'motif faux (remplacer)');
  egal(await fautes(A, (d) => { d.rec.motif = 'essai'; }), ['contrat-motif'], 'motif faux (essai)');
  // la demande de recrutement
  egal(await fautes(A, (d) => { d.rec.nombre = '4'; }), ['demande-nombre'], 'un de trop');
  egal(await fautes(A, (d) => { d.rec.nombre = '2'; }), ['demande-nombre'], 'un de moins');
  egal(await fautes(A, (d) => { d.rec.nombre = ''; }), ['demande-nombre'], 'nombre vide');
  egal(await fautes(A, (d) => { d.rec.nombre = '3,0'; }), [], 'nombre écrit « 3,0 » : le même nombre');
  egal(await fautes(JEUX.b, (d) => { d.rec.nombre = '3'; }), ['demande-nombre'], 'jeu à 4 renforts : 3 est faux (le nombre suit le planning)');
  egal(await fautes(A, (d) => { d.rec.dates = 'tot'; }), ['demande-dates'], 'dates : première semaine seule');
  egal(await fautes(A, (d) => { d.rec.dates = 'tard'; }), ['demande-dates'], 'dates : seconde semaine seule');
  egal(await fautes(A, (d) => { d.rec.horaires = 'jour'; }), ['demande-horaires'], 'horaires de jour');
  for (const m of Object.keys(MENTIONS)) {
    egal(await fautes(A, (d) => { d.rec.mentions[m].ecrire = !MENTIONS[m]; }), [`mention-${m}`], `la mention « ${m} » inversée`);
  }
  egal(await fautes(A, (d) => { for (const m of Object.keys(MENTIONS)) d.rec.mentions[m].ecrire = true; }), ['mention-age', 'mention-caces', 'mention-sexe'], 'tout cocher « oui » : trois mentions fausses');
  egal(await fautes(A, (d) => { for (const m of Object.keys(MENTIONS)) d.rec.mentions[m].ecrire = false; }), ['mention-chaussures', 'mention-porter'], 'tout cocher « non » : deux mentions fausses');
  egal(await fautes(A, (d) => { delete d.rec.mentions.caces; }), ['mention-caces'], 'une mention sans réponse');
  // la réponse à l'agent
  egal(await fautes(A, (d) => { d.cr.decision = 1; }), ['reponse-decision'], 'décision : « accordée »');
  egal(await fautes(A, (d) => { d.cr.decision = 2; }), ['reponse-decision'], 'décision : « annulée »');
  egal(await fautes(A, (d) => { d.cr.raison = 1; }), ['reponse-raison'], 'raison : Romain');
  egal(await fautes(A, (d) => { d.cr.salutation = 1; d.cr.fin = 1; }), ['reponse-salutation', 'reponse-fin'], 'la forme');
  // rien n'est vrai avant un envoi
  const sansPlan = await jalonsSans({ ...juste(A), plan: undefined });
  egal([sansPlan['nuits-semaine-1'], sansPlan['conge-refuser'], sansPlan['demande-nombre']], ['attente', 'attente', 'ko'], 'demande de recrutement envoyée mais planning jamais envoyé : pas de point sur les nuits ni les congés, et le nombre est faux (rien à compter)');
  const sansRec = await jalonsSans({ ...juste(A), rec: undefined });
  egal(JALONS.filter((j) => sansRec[j] === 'attente'), ['contrat-poste', 'contrat-type', 'contrat-motif', 'demande-nombre', 'demande-dates', 'demande-horaires', ...Object.keys(MENTIONS).map((m) => `mention-${m}`)],
    'demande de recrutement jamais envoyée');
  const sansCr = await jalonsSans({ ...juste(A), cr: undefined });
  egal(JALONS.filter((j) => sansCr[j] === 'attente'), ['reponse-decision', 'reponse-raison', 'reponse-salutation', 'reponse-fin'], 'réponse jamais envoyée');
  // Le nombre à recruter sur un planning vide ne vaut jamais 0 point « gratuit » : jamais ok sans planning.
  const sansRenforts = await jalonsSans({ ...juste(A), plan: planDe(A, A.dec, A.renf.map(() => 0)), rec: recDe(A, { nombre: '0' }) });
  egal(sansRenforts['demande-nombre'], 'ko', 'planning à 0 et nombre 0 : pas de point');
});

// ───────────────────────────────────────────────────────────── le contenu écrit : documents, messages, phrases
await v('ENT-11.6 : documents et messages — pied imposé partout (sauf la loi, source Légifrance), aucun mot qui juge, aucun jour de semaine daté dans un message, les trois pièces de départ ; le planning montre le besoin, jamais les renforts ; un jeu différent change le planning et les demandes', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/mondial-relay-ent116.js');
    const D = await import('/contenus/mondial-relay-ent116-donnees.js');
    const dbDe = (g) => ({ tirage: { graine: g }, fiches: {}, mails: [] });
    const brut = (h) => String(typeof h === 'function' ? h(dbDe('t116-1')) : h).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const docs = S.DOCUMENTS.map((d) => ({ id: d.id, texte: brut(d.html), html: String(typeof d.html === 'function' ? d.html(dbDe('t116-1')) : d.html) }));
    const volet = S.VOLET.semer('Lea', dbDe('t116-1'));
    const apres = S.VOLET.declencheurs.find((x) => x.id === 'planning-recu').semer('Lea', dbDe('t116-1'));
    const fin = S.VOLET.declencheurs.find((x) => x.id === 'fin').semer('Lea', dbDe('t116-1'));
    return { docs, ouverture: volet.mails.map((m) => [m.subject, m.text, m.pieces || null, m.ouvreFiche || null]), apres: apres.mails.map((m) => [m.from, m.subject, m.text, !!m.phrases, m.ouvreFiche || null]),
      fin: fin.mails.map((m) => [m.subject, m.text]), planA: String(S.DOC_PLANNING.html(dbDe('t116-1'))), planB: String(S.DOC_PLANNING.html(dbDe('t116-2'))),
      demA: String(S.DOC_DEMANDES.html(dbDe('t116-1'))), demB: String(S.DOC_DEMANDES.html(dbDe('t116-2'))),
      phrases: S.phrasesReponse('Lea', dbDe('t116-1')).lignes.map((l) => [l.id, l.choix, l.juste]), ts: [volet.mails, apres.mails, fin.mails].flat().map((m) => m.ts) };
  });
  for (const d of r.docs) {
    const loi = d.id === 'droit-116';
    vrai(loi ? /Texte de loi \(réel\) — source : Légifrance/.test(d.texte) : d.texte.includes(PIED), `${d.id} : pied imposé`);
    if (!loi) egal(JUGE.test(d.texte), false, `${d.id} : un mot qui juge`);
    vrai(!/seulement le droit|doit être (refus|accord|décal)|renforts? à prévoir/i.test(d.texte), `${d.id} : une réponse lisible`);
  }
  egal(r.ouverture.map((m) => [m[0], m[2], m[3]]), [['Le pic de décembre : les nuits de tri', ['planning-116', 'demandes-116', 'regles-116'], 'planning-116']], 'message d’ouverture, ses trois pièces, la fiche ouverte');
  egal(r.apres.map((m) => [m[0], m[1], m[3], m[4]]), [['Hélène', 'Planning reçu', false, 'recrutement-116'], ['Yanis', 'Mon congé de décembre', true, null]], 'à l’envoi du planning : Hélène ouvre la demande de recrutement, Yanis écrit');
  egal(r.fin.map((m) => m[0]), ['Merci'], 'message de fin');
  for (const m of [...r.ouverture.map((x) => x[1]), ...r.apres.map((x) => x[2]), ...r.fin.map((x) => x[1])]) {
    egal(JUGE.test(m), false, 'un mot qui juge dans un message : ' + m.slice(0, 60));
    egal(/\b(vous|votre|vos)\b/i.test(m), false, 'vouvoiement : ' + m.slice(0, 60));
  }
  egal(/Rendre ma copie/.test(r.fin[0][1]) && !/Merci, je (note|préviens)/.test(r.fin[0][1]), true, 'Hélène remercie et renvoie à la remise, sans reprendre la réponse');
  vrai(r.ts.every((t, i) => !i || t >= r.ts[i - 1]), 'heures croissantes');
  vrai(!/renforts?\s*:\s*\d|\b[0-9] renforts?\b/.test(r.planA), 'le planning ne dit pas les renforts');
  vrai(/Besoin/.test(r.planA) && />6</.test(r.planA) && />11</.test(r.planA), 'le planning de t116-1 montre le besoin (6 … 11)');
  vrai(r.planA !== r.planB && r.demA !== r.demB, 'deux graines, deux plannings et deux listes de demandes');
  vrai(/Louise/.test(r.demA) && /Antoine/.test(r.demA) && /Yanis/.test(r.demA) && !/Bastien/.test(r.demA), 'les demandes de t116-1');
  egal(r.phrases.map((l) => [l[0], l[2]]), [['salutation', 0], ['decision', 0], ['raison', 0], ['fin', 0]], 'quatre lignes, la juste en premier dans la déclaration (le moteur mélange)');
  egal(r.phrases[0][1][0], 'Bonjour Yanis,', 'salutation à l’agent dont le congé est refusé');
  vrai(r.phrases[1][1][0].includes('du jeudi 10 et du vendredi 11 décembre') && /pic/.test(r.phrases[2][1][0]), 'décision et raison');
  vrai(r.phrases.every((l) => new Set(l[1]).size === l[1].length), 'des choix tous différents');
});

// ───────────────────────────────────────────────────────────── Avant de commencer
await v('ENT-11.6 : « Avant de commencer » (4 points) — 4 questions tirées sur 8 (2 de préparation, 2 de droit), les mêmes pour le même élève ; toutes justes = 4 ; « Je ne sais pas » = 0 ; une fausse sur les quatre retire 1 ÷ (nombre de mauvaises réponses) ; tout faux = 0 (plancher) ; sans rien = 0', async () => {
  await monter({ uid: 't116-1' });
  const ids = (await base()).questions[ID]['@tirage'].ids;
  egal(ids.length, 4, 'quatre questions tirées');
  const prep = ['qui-decide-conges', 'besoin-nuit', 'calcul-renforts', 'role-romain'];
  egal([ids.filter((i) => prep.includes(i)).length, ids.filter((i) => !prep.includes(i)).length], [2, 2], '2 de préparation et 2 de droit');
  egal((await noter()).score, 4, 'quatre bonnes réponses = 4 points, aucun jalon');
  await monter({ uid: 't116-1' });
  egal((await base()).questions[ID]['@tirage'].ids, ids, 'le même tirage pour le même élève');
  const sais = Object.fromEntries(Object.keys(OUV).map((k) => [k, '__nsp__']));
  await monter({ uid: 't116-1', rep: sais });
  egal((await noter()).score, 0, '« Je ne sais pas » partout');
  await monter({ uid: 't116-1', rep: { ...OUV, [ids[0]]: OUV_FAUSSES[ids[0]] } });
  const pen = PENALITE[ids[0]] || 0.5;
  const n1 = await noter();
  vrai(Math.abs(n1.score - (3 - pen)) < 1e-6, `une fausse (${ids[0]}) : ${n1.score} au lieu de ${3 - pen}`);
  await monter({ uid: 't116-1', rep: OUV_FAUSSES });
  egal((await noter()).score, 0, 'tout faux : plancher à 0');
  await monter({ uid: 't116-1', sansOuverture: true });
  const n = await noter();
  egal([n.score, n.max], [0, 20], 'rien fait : 0 sur 20');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail).slice(0, 300));
});

// ───────────────────────────────────────────────────────────── le parcours à l'écran
const confirmer = async () => { await pg.waitForSelector(`${Z} [data-confirme-oui]`, { timeout: 2000 }).catch(() => {}); if (await present('[data-confirme-oui]')) { await clic('[data-confirme-oui]'); await pause(); } };
async function qFil(R) {
  for (let i = 0; i < 5; i++) {
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(R[q], `question au fil « ${q} » sans réponse prévue`);
    await clic(`[data-q-choix="${R[q]}"][data-q="${q}"]`);
    await clic(`[data-q-repondre="${q}"]`);
    await pause();
    await clic('[data-q-reprendre]');
    await pause();
  }
}
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
async function planning(K, o = {}) {
  await allerV('fiche');
  const dec = o.dec || K.dec, renf = o.renf || K.renf;
  for (let k = 0; k < 3; k++) { await pg.selectOption(`${Z} [data-fiche-champ="conge-${k + 1}"]`, dec[k]); await pause(30); await qFil(o.fil || FIL_REP); }
  for (let i = 0; i < 12; i++) { await pg.selectOption(`${Z} [data-fiche-champ="renforts-${i}"]`, String(renf[i])); await pause(20); }
  await clic('[data-fiche-envoyer]'); await confirmer();
  await qFil(o.fil || FIL_REP);
}
async function recrutement(K, o = {}) {
  await allerV(`fiche:${FR}`);
  const r = { ...REC, nombre: String(K.nb), ...(o.rec || {}) };
  for (const c of ['poste', 'motif', 'dates', 'horaires']) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, r[c]); await pause(20); }
  await pg.fill(`${Z} [data-fiche-saisie="nombre"]`, r.nombre); await pg.dispatchEvent(`${Z} [data-fiche-saisie="nombre"]`, 'change');
  await pg.check(`${Z} [data-fiche-champ="contrat"][value="${r.contrat}"]`);
  const men = { ...MENTIONS, ...(o.mentions || {}) };
  for (const [m, oui] of Object.entries(men)) { await clic(`[data-ouinon="mentions|${m}|ecrire|${oui ? 1 : 0}"]`); await pause(20); }
  await clic('[data-fiche-envoyer]'); await confirmer();
  await qFil(o.fil || FIL_REP);
}
async function repondre(K, o = {}) {
  await allerV('mail');
  await clic('[data-dossier="in"]');
  const id = await pg.evaluate(() => window.__f.db.mails.filter((m) => m.folder === 'in' && m.subject === 'Mon congé de décembre').pop().id);
  await clic(`[data-mail="${id}"]`); await pause();
  await clic('[data-repondre]');
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  const juste = await pg.evaluate(async () => {
    const S = await import('/contenus/mondial-relay-ent116.js');
    const P = S.phrasesReponse('Lea', window.__f.db);
    return Object.fromEntries(P.lignes.map((l) => [l.id, l.choix]));
  });
  for (const l of ['salutation', 'decision', 'raison', 'fin']) {
    await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: juste[l][(o.cr || {})[l] || 0] }); await pause(30);
  }
  await clic('#formPhr button[type="submit"]'); await confirmer();
  await pg.waitForFunction(() => (window.__f.db.mails || []).some((m) => m.folder === 'out' && m.phrases), null, { timeout: 4000 });
}
async function rendre() {
  await clic('[data-copie-rendre]');
  await clic('[data-copie-rendre]');
  await pg.waitForFunction(() => window.__f.copies.length === 1);
  await pause();
  return pg.evaluate(() => window.__f.copies[0]);
}
async function ouverture(rep) {
  const ids = (await base()).questions[ID]['@tirage'].ids;
  for (let i = 0; i < 4; i++) {
    await clic(`[data-ouv-aller="${i}"]`); await pause();
    await clic(`[data-q-choix="${rep[ids[i]]}"][data-q="${ids[i]}"]`);
    await clic(`[data-q-repondre="${ids[i]}"]`); await pause();
  }
  await clic('[data-ouv-continuer]'); await pause();
}
async function parcoursJuste(k, avecOuverture) {
  const K = JEUX[k];
  await monter({ uid: K.uid, sansOuverture: !!avecOuverture });
  if (avecOuverture) await ouverture(OUV);
  const E0 = await entrants();
  egal(E0.map((m) => m.subject), ['Le pic de décembre : les nuits de tri'], 'un seul message à l’ouverture');
  await planning(K);
  egal((await entrants()).map((m) => m.subject), ['Le pic de décembre : les nuits de tri', 'Planning reçu', 'Mon congé de décembre'], 'à l’envoi du planning : l’accusé et l’agent');
  await recrutement(K);
  await repondre(K);
  const E = await entrants();
  egal(E.map((x) => [x.from, x.subject]), [['Hélène', 'Le pic de décembre : les nuits de tri'], ['Hélène', 'Planning reçu'], [K.agent, 'Mon congé de décembre'], ['Hélène', 'Merci']], 'les messages, dans l’ordre');
  egal(E.filter((x) => JUGE.test(x.text) || /bonus/i.test(x.text)).map((x) => x.subject), [], 'un message dit juste / faux / erreur');
  const ecran = await texte();
  vrai(!(await present('[data-fin-jalon]')) && !/Corriger/.test(ecran), 'bilan ou « Corriger » à l’écran avant la remise');
  egal(await pg.$$eval(`${Z} [data-pastille]`, (L) => L.map((x) => x.classList.contains('fait'))), [true, true, true], 'pastilles « fait »');
  const n = await noter();
  egal(ko(n.detail), [], `jalons (${k})`);
  egal([n.score, n.max], [20, 20], 'noter(db) : ' + JSON.stringify(n.detail).slice(0, 400));
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
  egal(await copies(), 0, 'pas de remise avant le clic');
  const c = await rendre();
  egal([c.score, c.max], [n.score, n.max], 'la note rendue = noter(db)');
  vrai(await present('[data-copie-etat="rendue"]'), 'copie rendue à l’écran');
  egal(await copies(), 1, 'une seule remise');
  egal(await large(), 0, 'défilement horizontal');
  return K;
}
await v('ENT-11.6 : parcours juste à l’écran (t116-1 : décaler · accorder · refuser, Yanis écrit), Avant de commencer répondue sur l’écran — 20/20 à la remise, égal à noter(db) ; rien ne remonte avant la remise ; messages dans l’ordre, aucun mot qui juge', async () => {
  await parcoursJuste('a', true);
});
await v('ENT-11.6 : parcours juste à l’écran (t116-2 : refuser · accorder · décaler, pic à 10, 4 renforts) — 20/20', async () => {
  await parcoursJuste('b', false);
});
await v('ENT-11.6 : parcours juste à l’écran (t116-3 : décaler · refuser · accorder, refus en 2e semaine) — 20/20', async () => {
  await parcoursJuste('c', false);
});
await v('ENT-11.6 : parcours juste à l’écran (t116-5 : refuser · décaler · accorder) — 20/20', async () => {
  await parcoursJuste('e', false);
});

// ───────────────────────────────────────────────────────────── la copie rendue, le verrou, l'erreur de congé payée une fois
await v('ENT-11.6 : après la remise, la copie est verrouillée (plus de champ modifiable, plus de bouton « Envoyer »), la note reste celle de la remise, une seconde remise est impossible', async () => {
  const K = JEUX.d;
  await monter({ uid: K.uid });
  await planning(K); await recrutement(K); await repondre(K);
  const c = await rendre();
  egal(c.score, 20, 'remise à 20');
  egal(await present('[data-copie-rendre]'), false, 'plus de bouton « Rendre ma copie »');
  await allerV('fiche');
  egal(await present('[data-fiche-envoyer]'), false, 'plus de bouton « Envoyer » sur le planning');
  const libres = await pg.evaluate((Z) => [...document.querySelectorAll(`${Z} [data-fiche] [data-fiche-champ], ${Z} [data-fiche] [data-fiche-saisie]`)].filter((e) => !e.disabled && !e.readOnly).length, Z);
  egal(libres, 0, 'champs du planning encore modifiables');
  egal([await copies(), c.score], [1, 20], 'une seule remise, note gardée');
  egal(erreurs, [], 'erreurs JavaScript');
});

await v('ENT-11.6 : à l’écran, une erreur de congé ne se paie qu’UNE fois — t116-4, Antoine (pic) accordé et ses renforts refaits (2 et 3) : 19/20 (le seul jalon du congé à refuser, 1 point) ; renforts au maximum partout : les deux semaines tombent (16/20)', async () => {
  const K = JEUX.d;
  await monter({ uid: K.uid });
  await planning(K, { dec: ['accorder', 'accorder', 'decaler'], renf: [0, 0, 0, 2, 3, 2, 0, 0, 0, 2, 3, 3] });
  await recrutement(K); await repondre(K);
  const n = await noter();
  egal(ko(n.detail), ['conge-refuser'], 'jalons tombés : le congé seulement, les nuits suivent SON choix');
  egal(n.score, 19, 'une erreur de congé = 1 point seulement');
  await monter({ uid: K.uid });
  await planning(K, { renf: Array(12).fill(6) });
  await recrutement(K, { rec: { nombre: '6' } }); await repondre(K);
  const m = await noter();
  egal(ko(m.detail), ['nuits-semaine-1', 'nuits-semaine-2', 'demande-nombre'], 'six renforts partout : rien de gagné');
  egal(m.score, 20 - 4 - 0.5, 'les deux semaines et le nombre');
});

// ───────────────────────────────────────────────────────────── deux élèves, deux jeux ; le même élève, le même jeu
await v('ENT-11.6 : deux élèves, deux jeux — les demandes affichées dans la fiche et les pièces jointes diffèrent ; le même élève retrouve le même jeu ; la fiche de t116-1 nomme Louise, Antoine et Yanis, celle de t116-2 Bastien, Camille et Laura', async () => {
  const lire = async (uid) => {
    await monter({ uid });
    await allerV('fiche');
    return pg.$$eval(`${Z} [data-fiche] label[for^="fi-conge-"]`, (L) => L.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  };
  const a1 = await lire('t116-1'), b = await lire('t116-2'), a2 = await lire('t116-1');
  egal(a1.length, 3, 'trois demandes');
  egal(a1, a2, 'le même élève, le même jeu');
  vrai(JSON.stringify(a1) !== JSON.stringify(b), 'deux élèves, deux jeux');
  egal(a1, ['Louise — du mardi 8 et du mercredi 9 décembre', 'Antoine — du lundi 7 et du mardi 8 décembre', 'Yanis — du jeudi 10 et du vendredi 11 décembre'], 'fiche de t116-1');
  egal(b, ['Bastien — du vendredi 18 et du samedi 19 décembre', 'Camille — du lundi 7 et du mardi 8 décembre', 'Laura — du mardi 8 et du mercredi 9 décembre'], 'fiche de t116-2');
  // le planning montré dans les pièces jointes est celui de l'élève
  const plan = async (uid) => { await monter({ uid }); await allerV('fiche'); return pg.$eval(`${Z} [data-fiche-panneau]`, (e) => e.innerText.replace(/\s+/g, ' ')); };
  const pa = await plan('t116-1'), pb = await plan('t116-2');
  vrai(/Besoin\s*6\s*6\s*6\s*9\s*10\s*10\s*7\s*7\s*7\s*10\s*11\s*11/i.test(pa), 'planning de t116-1 : ' + pa.slice(0, 200));
  vrai(/Besoin\s*5\s*5\s*5\s*10\s*11\s*11\s*6\s*6\s*6\s*11\s*12\s*12/i.test(pb), 'planning de t116-2 : ' + pb.slice(0, 200));
});

// ───────────────────────────────────────────────────────────── les questions au fil, la demande de recrutement fermée
await v('ENT-11.6 : la demande de recrutement est fermée tant que le planning n’est pas envoyé ; les trois questions au fil sont posées (refus puis contrat puis intérim) et NE changent PAS la note, bonne ou fausse réponse', async () => {
  const K = JEUX.a;
  await monter({ uid: K.uid });
  vrai(!(await present(`.ent-nav[data-vue="fiche:${FR}"]`)), 'demande de recrutement ouverte avant l’envoi du planning');
  await planning(K, { fil: FIL_FAUX });
  await recrutement(K, { fil: FIL_FAUX }); await repondre(K);
  const q = (await base()).questions[ID];
  egal(['pourquoi-refus', 'quel-contrat', 'qui-paie-interim'].map((id) => !!q[id]), [true, true, true], 'les trois questions au fil ont été posées et répondues');
  const n = await noter();
  egal([n.score, n.max], [20, 20], 'mauvaises réponses aux questions de réflexion : la note ne bouge pas');
});

await v('ENT-11.6 : le premier texte de la séance ne dit aucune réponse — message d’Hélène, fiche du planning (avant envoi), pièces jointes : pas « refuser » ni « accorder » ni « décaler » imposés, aucun nombre de renforts, aucun jour de la semaine daté dans un message ; aucune requête hors du site ; aucune erreur JavaScript', async () => {
  const K = JEUX.b;
  await monter({ uid: K.uid, sansOuverture: false });
  const E = await entrants();
  egal(/refuser|accorder|décaler|renforts? (à|de)\s*\d/i.test(E[0].text), false, 'le message d’ouverture ne dit pas quoi décider');
  await allerV('fiche');
  const ecran = await texte();
  egal(/\b[0-9] renforts? (à prévoir|nécessaires?)/i.test(ecran), false, 'la fiche ne dit pas combien de renforts');
  egal(JUGE.test(ecran.replace(/PIED/g, '')), false, 'un mot qui juge à l’écran : ' + (ecran.match(JUGE) || [])[0]);
  egal([...hotes], [], 'aucune requête hors du site');
  egal(erreurs, [], 'erreurs JavaScript');
});

await ctx.close();
}
