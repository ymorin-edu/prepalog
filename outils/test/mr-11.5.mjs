// Suite de tests de Prepalog — bloc `mr-11.5` : ENT-11.5 Mondial Relay, évaluation « la tournée Sud et le colis bloqué » (brief
// `docs/briefs/ENT-11.5-mondial-relay-evaluation-tournee.md` §5 et §6 bis). Créé le 26/10/2026. Aides propres au bloc (rien d'ajouté à `commun.mjs`).
//
// La séance est montée dans une page (1366 × 900, mouvement réduit) avec la fabrique et le moteur réels ; de vrais clics. Copie rendue : `noter(db)`
// et une remise enregistrée par le montage.
//
// VALEURS ÉCRITES À LA MAIN (le code les calcule, le test les écrit ; heures relues une fois à la main, départ 7 h 30, 40 km/h, 10 min par arrêt) :
// - `el-2` : Saint-Julien ouvert de 8 h 30 à 12 h, Bréviandes de 9 h 30 à 12 h, Bar-sur-Seine ferme à 11 h, Chaource de 9 h 30 à 11 h 30, Les Riceys de
//   9 h 30 à 13 h ; cause du blocage : étiquette illisible (rang 1 des causes : ouvert 0, étiquette 1, fermé 2) ; deux ordres justes, qui ne diffèrent que
//   par l'échange de Saint-Julien et de Bréviandes.
//     juste  bs>ri>ch>sj>br : conduite 203,7 min, attente 35,7, durée 289,4, retour 12 h 19 → il reporte 204 / 36 / 289
//     juste  bs>ri>ch>br>sj : 191,9 / 35,7 / 277,6 (retour 12 h 08)
//     naturel sj>br>bs>ch>ri : Chaource raté ; 228,0 / 84,3 / 362,3, retour 13 h 32 (en retard)
//     retard  bs>sj>br>ch>ri : horaires tenus ; 271,0 / 0 / 366,0 (pause de 45 min due), retour 13 h 36
//     raté    sj>br>bs>ri>ch : Chaource raté ; 194,8 / 84,3 / 329,1, retour 12 h 59 (à l'heure)
// - `eleve-115-a` : cause « Point Relais fermé » (rang 2), un seul ordre juste sj>ch>ri>bs>br ; `eleve-115-b` : cause « carton ouvert » (rang 0), juste
//   bs>ri>br>sj>ch. Trois élèves, trois jeux (graines trouvées une fois pour toutes puis écrites ici, cas « jeu figé »).
// Poids (brief §5, choix de Tristan du 26/10/2026) : relais 5, règles 2, heures 2, cause 3, prévenir 3, ton 1 = 16 ; ouverture 4 ; total 20.

export default async function bloc({ v, nav, BASE, egal, vrai }) {
const ctxF = await nav.newContext({ viewport: { width: 1366, height: 900 } });
const erreursF = [], externes = [];
const pg = await ctxF.newPage();
pg.setDefaultTimeout(6000);
pg.on('pageerror', (e) => erreursF.push('PAGEERROR: ' + e.message));
pg.on('console', (m) => { if (m.type() === 'error' && !/\b404\b/.test(m.text())) erreursF.push('CONSOLE: ' + m.text()); });
pg.on('request', (r) => { if (!r.url().startsWith(BASE) && !/^(data|blob|about):/.test(r.url())) externes.push(r.url()); });
pg.on('dialog', (d) => d.accept());
await pg.goto(BASE);
await pg.waitForSelector('#btnProf', { timeout: 8000 });
await pg.emulateMedia({ reducedMotion: 'reduce' });

const Z = '#fTest';
const ID = 'mondial-relay-evaluation-tournee';
const ACT = '/activites/mondial-relay-evaluation-tournee.js';
const pause = (ms = 80) => pg.waitForTimeout(ms);
const proche = (a, b, quoi) => { if (Math.abs(a - b) > 1e-3) throw new Error(`${quoi} : ${a} au lieu de ${b}`); };
const base = () => pg.evaluate(() => JSON.parse(JSON.stringify(window.__f.db)));
const present = async (sel) => !!(await pg.$(`${Z} ${sel}`));
const aller = async (vue) => { await pg.evaluate(({ Z, vue }) => document.querySelector(`${Z} .ent-nav[data-vue="${vue}"]`).click(), { Z, vue }); await pause(); };
const menu = () => pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => b.dataset.vue || `fermee:${b.dataset.vueFermee}`));
const entrants = async () => (await base()).mails.filter((m) => m.folder === 'in');
const sortants = async () => (await base()).mails.filter((m) => m.folder === 'out');

const JUGE = /\b(juste|justes|faux|fausse|fausses|correct|correcte|erreur|erreurs|bravo|bien vu|bonne réponse|mauvaise réponse|à revoir|ratée?s?)\b|fermé à l’arrivée|ne tient pas|plus de 4 h 30/i;
// Les deux phrases du moteur en évaluation (le barème de l'ouverture, pas un verdict) : retirées avant de chercher un mot qui juge.
const PENALITE = 'Une réponse fausse retire des points. Si tu ne sais pas, choisis « Je ne sais pas » : tu ne perds rien.';
const ATTENTE = 'Réponds à toutes les questions pour continuer : une réponse fausse ne bloque pas.';
// Le texte de l'écran de travail, documents exclus (le droit, les conditions de vente et le suivi disent « erreur », « retard »…).
const ecran = () => pg.evaluate((Z) => { const c = document.querySelector(Z).cloneNode(true); c.querySelectorAll('.ent-doc, .mr-doc, .qo-feuille').forEach((x) => x.remove()); return c.innerText; }, Z);
const motQuiJuge = (t) => (t.replace(PENALITE, '').replace(ATTENTE, '').match(JUGE) || [null])[0];

const OUV_JUSTES = { 'k-p1': 'juste', 'k-p2': 'juste', 'k-p3': 'attend', 'k-p4': 'suivi', 'k-p5': 'somme', 'k-p6': 'cote',
  'k-d1': 'non', 'k-d2': 'pause', 'k-d3': 'oui', 'k-d4': 'servi', 'k-d5': 'refuser' };
const OUV_FAUSSES = { 'k-p1': 'heures', 'k-p2': 'plus', 'k-p3': 'tout', 'k-p4': 'perdu', 'k-p5': 'facture', 'k-p6': 'part',
  'k-d1': 'autoroute', 'k-d2': 'continuer', 'k-d3': 'non', 'k-d4': 'broye', 'k-d5': 'prendre' };
const OUV_NSP = Object.fromEntries(Object.keys(OUV_JUSTES).map((k) => [k, '@nsp']));

// Monte la séance comme le site (copie : les remises sont enregistrées). `o.graine` (défaut `el-2`), `o.rep` (réponses d'ouverture rangées d'avance,
// défaut : justes), `o.sansOuverture`.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import(o.activite);
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  db.tirage = { graine: o.graine };
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [], copies: [], sauver: 0 };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'mr115' },
    jeu: { etat: () => db, sauver: () => { window.__f.sauver += 1; } },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'MR',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__f.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
  return JSON.parse(JSON.stringify(db));
}, { activite: ACT, id: ID, rep: OUV_JUSTES, graine: 'el-2', ...o });
const noter = () => pg.evaluate(async () => { const A = await import('/activites/mondial-relay-evaluation-tournee.js'); return A.noter(window.__f.db); });
const copies = () => pg.evaluate(() => window.__f.copies.length);
const kos = (n) => Object.entries(n.detail).filter(([, e]) => e === 'ko').map(([j]) => j);
const oks = (n) => Object.entries(n.detail).filter(([, e]) => e === 'ok').map(([j]) => j);

const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); } };
// La tournée : les Points Relais cliqués sur le plan dans l'ordre, puis (si `report`) les trois cases et « Enregistrer mes résultats ».
async function tournee(ordre, report) {
  await aller('tournee');
  for (const id of ordre) { await pg.click(`${Z} [data-clic-point="${id}"]`); await pause(40); }
  if (report) {
    for (const [k, t] of Object.entries(report)) { await pg.fill(`${Z} [data-report="${k}"]`, String(t)); await pg.dispatchEvent(`${Z} [data-report="${k}"]`, 'change'); }
    await pg.click(`${Z} [data-tour-valider]`); await pause();
  }
}
// Un courriel par phrases : `choix` { ligne: rang dans l'ordre DÉCLARÉ } ; la liste est mélangée à l'écran, on choisit par la valeur de l'option.
async function courriel(sujet, choix, { envoyer = true } = {}) {
  await aller('mail');
  if (await present('[data-dossier="in"]')) { await pg.click(`${Z} [data-dossier="in"]`); await pause(40); }   // après un envoi, la liste est sur « Envoyés »
  const m = (await entrants()).find((x) => x.subject.includes(sujet));
  try { await pg.click(`${Z} [data-mail="${m.id}"]`); } catch (e) { throw new Error(`${e.message.split('\n')[0]} / écran : ${(await ecran()).replace(/\s+/g, ' ').slice(0, 600)} / ids ${(await entrants()).map((x) => x.id)}`); }
  await pause();
  await pg.click(`${Z} [data-repondre]`); await pause();
  for (const [ligne, rang] of Object.entries(choix)) { await pg.selectOption(`${Z} select[data-phrase="${ligne}"]`, String(rang)); await pause(30); }
  if (!envoyer) return;
  await pg.click(`${Z} #formPhr button[type="submit"]`); await confirmer();
}
const RELAIS = 'Colis'; // « Colis MR … : où est-il ? »
const EXPE = 'ne bouge plus';
const rel = (c, o = {}) => ({ salut: 0, cause: c, suite: c, delai: 0, fin: 0, ...o });
const exp = (c, o = {}) => ({ salut: 0, cause: c, suite: c, indemnite: 0, fin: 0, ...o });
const deuxCourriels = async (c, oR = {}, oE = {}) => { await courriel(RELAIS, rel(c, oR)); await courriel(EXPE, exp(c, oE)); };
async function rendre() {
  await pg.click(`${Z} [data-copie-rendre]`); await pause(40);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.waitForFunction(() => window.__f.copies.length >= 1);
  await pause();
  return pg.evaluate(() => window.__f.copies[window.__f.copies.length - 1]);
}

const JUSTE = ['bs', 'ri', 'ch', 'sj', 'br'], R_JUSTE = { conduite: 204, attente: 36, duree: 289 };
const NATUREL = ['sj', 'br', 'bs', 'ch', 'ri'], R_NATUREL = { conduite: 228, attente: 84, duree: 362 };
const RETARD = ['bs', 'sj', 'br', 'ch', 'ri'], R_RETARD = { conduite: 271, attente: 0, duree: 366 };
const RATE = ['sj', 'br', 'bs', 'ri', 'ch'], R_RATE = { conduite: 195, attente: 84, duree: 329 };
const CAUSE_EL2 = 1;
const JALONS = ['relais', 'regles', 'heures', 'cause', 'prevenir', 'ton'];
// Le parcours juste d'el-2.
const parcoursJuste = async () => { await tournee(JUSTE, R_JUSTE); await deuxCourriels(CAUSE_EL2); };

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-11.5 : au registre — meta (2de, OTM-C1.3/C2.3/C2.1, évaluation en copie, barème 20, questions, pas de parcours) ; 6 jalons pondérés 5+2+2+3+3+1 = 16, + ouverture 4 = 20 ; aucun écran à rouvrir ; ouverture 4 questions (2 + 2), aucune aide, aucun fil, aucun lexique', async () => {
  const r = await pg.evaluate(async () => {
    const I = await import('/activites/index.js');
    const A = await import('/activites/mondial-relay-evaluation-tournee.js');
    const S = await import('/contenus/mondial-relay-ent115.js');
    const Q = await import('/contenus/questions/ENT-11.5.js');
    const charges = await Promise.all(I.ACTIVITES.map((f) => f().then((x) => x.meta && x.meta.id).catch(() => null)));
    const m = A.meta, L = Q.QUESTIONS.liste;
    return { inscrite: charges.includes('mondial-relay-evaluation-tournee'),
      meta: [m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture, m.parcours || null, m.portee],
      noter: typeof A.noter, poids: S.ETAPES.map((e) => [e.id, e.poids]), ecrans: S.ETAPES.filter((e) => e.ecran).length, bonus: S.ETAPES.filter((e) => e.bonus).length,
      groupes: S.ETAPES.reduce((g, e) => { g[e.groupe] = (g[e.groupe] || 0) + e.poids; return g; }, {}),
      ouv: { part: Q.QUESTIONS.part, partOuv: Q.QUESTIONS.ouverture.part, tirage: Q.QUESTIONS.ouverture.tirage,
        prep: L.filter((x) => x.rubrique === 'preparation').length, droit: L.filter((x) => x.rubrique === 'droit').length,
        aides: L.filter((x) => x.aide != null).length, fil: L.filter((x) => x.type !== 'ouverture').length, cles: L.filter((x) => x.cle).length,
        mots: L.filter((x) => (x.enonce + x.choix.map((c) => c.lib).join(' ')).includes('[[')).length,
        docsConnus: Q.QUESTIONS.ouverture.documents.every((d) => S.DOCUMENTS.some((x) => x.id === d)) },
      lexique: Object.keys(S.OPTIONS.lexique).length, tirage: S.OPTIONS.tirage };
  });
  vrai(r.inscrite, 'la séance n’est pas au registre');
  egal(r.meta, ['ENT-11.5', ['2de'], ['OTM-C1.3', 'OTM-C2.3', 'OTM-C2.1'], 'evaluation', 20, true, 'ENT-11.5', true, 'prof', null, 'eleve'], 'meta');
  egal(r.noter, 'function', 'export noter');
  egal(r.poids.map(([id, p]) => `${id}:${p}`).join(' '), 'relais:5 regles:2 heures:2 cause:3 prevenir:3 ton:1', 'poids');
  egal(r.groupes, { 'La tournée Sud': 9, 'Le colis bloqué': 3, 'Rendre compte': 3, 'La forme des courriels': 1 }, 'groupes');
  proche(r.poids.reduce((s, [, p]) => s + p, 0) + r.ouv.part, 20, 'somme');
  egal([r.ecrans, r.bonus], [0, 0], 'aucun écran à rouvrir, aucun bonus');
  egal([r.ouv.part, r.ouv.partOuv, r.ouv.tirage, r.ouv.prep, r.ouv.droit, r.ouv.aides, r.ouv.fil, r.ouv.mots, r.ouv.docsConnus],
    [4, 4, { preparation: 2, droit: 2 }, 6, 5, 0, 0, 0, true], 'ouverture notée');
  egal(r.ouv.cles, 6, 'questions clés reprises de 6.9 et 6.10 (minutes, solde, indemnité, SMS au volant, scanner, réemploi)');
  egal([r.lexique, r.tirage], [0, true], 'ni lexique ; tirage par élève');
});

// ─────────────────────────────────────────────────────────── les données (valeurs écrites à la main)
await v('ENT-11.5 : données — jeux figés de trois élèves réels (horaires, cause, ordres justes) écrits à la main ; la tournée naturelle nord → sud n’est jamais juste ; même élève = même jeu, deux élèves = deux jeux', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/mondial-relay-ent115-donnees.js');
    const lit = (g) => { const J = D.jeuDe(g); return { f: D.IDS.map((id) => D.libelleFenetre(J.fenetres[id])).join(' | '), cause: J.cause, justes: D.ordresJustes(J).map((o) => o.join('>')),
      naturel: D.tient(D.journee(D.ORDRE_NATUREL, J.fenetres)), e: D.verifier(J) }; };
    return { a: lit('el-2'), b: lit('eleve-115-a'), c: lit('eleve-115-b'), a2: lit('el-2') };
  });
  egal(r.a, { f: 'ouvert de 8 h 30 à 12 h | ouvert de 9 h 30 à 12 h | ferme à 11 h | ouvert de 9 h 30 à 11 h 30 | ouvert de 9 h 30 à 13 h', cause: 1,
    justes: ['bs>ri>ch>sj>br', 'bs>ri>ch>br>sj'], naturel: false, e: [] }, 'el-2');
  egal(r.b, { f: 'ouvert de 8 h 30 à 11 h 30 | ouvert de 10 h 30 à 12 h 30 | n’ouvre qu’à 11 h | ferme à 11 h | ferme à 12 h', cause: 2,
    justes: ['sj>ch>ri>bs>br'], naturel: false, e: [] }, 'eleve-115-a');
  egal(r.c, { f: 'ouvert de 9 h 30 à 11 h 30 | ouvert de 8 h 30 à 10 h 30 | ouvert toute la matinée | ouvert de 10 h à 12 h 30 | ferme à 10 h 30', cause: 0,
    justes: ['bs>ri>br>sj>ch'], naturel: false, e: [] }, 'eleve-115-b');
  egal(r.a2, r.a, 'même élève, même jeu');
  vrai(r.a.f !== r.b.f && r.b.f !== r.c.f && r.a.f !== r.c.f, 'deux élèves ont les mêmes horaires');
});

await v('ENT-11.5 : parité — le calcul des données (jalons, corrigé) et le bilan du moteur de la vue Tournée donnent les mêmes heures, les mêmes créneaux ratés, la même pause et le même retard, sur cinq ordres d’el-2', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/mondial-relay-ent115-donnees.js');
    const S = await import('/contenus/mondial-relay-ent115.js');
    const db = { tirage: { graine: 'el-2' } };
    const J = D.jeuDe('el-2');
    return ['bs>ri>ch>sj>br', 'bs>ri>ch>br>sj', 'sj>br>bs>ch>ri', 'bs>sj>br>ch>ri', 'sj>br>bs>ri>ch', 'sj>br'].map((s) => {
      const o = s.split('>'), a = D.journee(o, J.fenetres), b = S.bilanTournee({ ordre: o }, db);
      return { s, retenus: [a.retenus.join(), b.retenus.map((p) => (p && p.id) || p).join()], rates: [a.creneauxRates.join(), b.creneauxRates.join()], pause: [a.pauseDue, b.pauseDue], retard: [a.enRetard, b.enRetard],
        conduite: [Math.round(a.conduite), Math.round(b.conduite)], attente: [Math.round(a.attente), Math.round(b.attente)], minutes: [Math.round(a.minutes), Math.round(b.minutes)] };
    });
  });
  for (const x of r) for (const k of ['retenus', 'rates', 'pause', 'retard', 'conduite', 'attente', 'minutes']) egal(x[k][0], x[k][1], `${x.s} : ${k} (données ≠ moteur)`);
});

await v('ENT-11.5 : tirage — 400 élèves : zéro secours, zéro écart, une seule famille d’ordres justes (jamais l’ordre nord → sud), les trois causes, plusieurs jeux d’horaires', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/mondial-relay-ent115-donnees.js');
    const out = { secours: 0, ecarts: [], familles: 0, naturel: 0, sansJuste: 0, causes: {}, jeux: new Set(), uniques: 0 };
    for (let k = 0; k < 400; k++) {
      const t = D.tirageDe(`el-${k}`), J = t.jeu;
      if (t.secours) out.secours++;
      const e = D.verifier(J); if (e.length) out.ecarts.push(`${k}: ${e.join(' ; ')}`);
      const justes = D.ordresJustes(J);
      if (!justes.length) out.sansJuste++;
      if (new Set(justes.map(D.familleDe)).size !== 1) out.familles++;
      if (justes.some((o) => o.join() === D.ORDRE_NATUREL.join())) out.naturel++;
      out.causes[J.cause] = (out.causes[J.cause] || 0) + 1;
      out.jeux.add(D.IDS.map((id) => D.libelleFenetre(J.fenetres[id])).join('|'));
    }
    return { ...out, jeux: out.jeux.size };
  });
  egal([r.secours, r.ecarts, r.familles, r.naturel, r.sansJuste], [0, [], 0, 0, 0], 'secours, écarts, familles d’ordres, ordre naturel, jeu sans ordre juste');
  egal(Object.keys(r.causes).sort(), ['0', '1', '2'], 'les trois causes');
  Object.entries(r.causes).forEach(([c, n]) => vrai(n >= 80 && n <= 190, `cause ${c} : ${n} sur 400`));
  vrai(r.jeux >= 150, `variété : ${r.jeux} jeux d’horaires sur 400`);
});

// ─────────────────────────────────────────────────────────── l'ouverture notée
await v('ENT-11.5 : Avant de commencer — 4 questions (2 + 2), « Je ne sais pas » en dernier, aucune aide, aucun mot qui juge ; barème : 4 justes = 4, NSP = 0, tout faux = 0 ; rien au Suivi avant la remise', async () => {
  const db = await monter({ uid: 'mr115-ouv', sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal([ids.length, ids.filter((x) => /^k-p/.test(x)).length, ids.filter((x) => /^k-d/.test(x)).length], [4, 2, 2], 'questions tirées');
  const choix = await pg.$$eval(`${Z} [data-q-choix]`, (L) => L.map((b) => b.textContent.trim()));
  egal(choix[choix.length - 1], 'Je ne sais pas', '« Je ne sais pas » en dernier');
  vrai(!(await present('[data-ouv-aide]')) && !(await present('details')), 'une aide à l’écran');
  for (let k = 0; k < 4; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await pg.click(`${Z} [data-q-choix="${OUV_JUSTES[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`); await pause();
    const mot = motQuiJuge(await ecran());
    vrai(!mot, `une phrase qui juge à l’ouverture (${id}) : ${mot}`);
    if (k < 3) await pg.click(`${Z} [data-cle="suivante"]`);
  }
  await pg.click(`${Z} [data-ouv-continuer]`); await pause();
  proche((await noter()).score, 4, 'quatre justes');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
  const pts = async (rep) => { await monter({ uid: 'mr115-ouv2', rep }); return (await noter()).score; };
  proche(await pts(OUV_NSP), 0, 'tout « Je ne sais pas »');
  proche(await pts(OUV_FAUSSES), 0, 'tout faux : plancher 0');
  proche(await pts(OUV_JUSTES), 4, 'tout juste');
});

await v('ENT-11.5 : tirage de l’ouverture — douze élèves reçoivent chacun 2 questions de préparation et 2 de droit, sans doublon, et les onze questions sont déclarées', async () => {
  const r = await pg.evaluate(async () => {
    const Q = await import('/contenus/questions/ENT-11.5.js');
    const T = await import('/core/tirage.js');
    const L = Q.QUESTIONS.liste;
    // Les questions sont tirées par le moteur à l'entrée de la séance ; on relit ici les rubriques des ids montés dans la page de test.
    return { prep: L.filter((x) => x.rubrique === 'preparation').map((x) => x.id), droit: L.filter((x) => x.rubrique === 'droit').map((x) => x.id), t: typeof T.tirerJeu };
  });
  egal(r.prep, ['k-p1', 'k-p2', 'k-p3', 'k-p4', 'k-p5', 'k-p6'], 'préparation');
  egal(r.droit, ['k-d1', 'k-d2', 'k-d3', 'k-d4', 'k-d5'], 'droit');
  const vus = new Set();
  for (let k = 0; k < 12; k++) {
    const db = await monter({ uid: `mr115-t${k}`, graine: `tirage-${k}`, sansOuverture: true });
    const ids = db.questions[ID]['@tirage'].ids;
    egal([new Set(ids).size, ids.filter((x) => /^k-p/.test(x)).length, ids.filter((x) => /^k-d/.test(x)).length], [4, 2, 2], `élève ${k}`);
    ids.forEach((i) => vus.add(i));
  }
  vrai(vus.size >= 7, 'trop peu de variété sur 12 élèves : ' + [...vus].join());
});

// ─────────────────────────────────────────────────────────── le parcours juste = 20 / 20
await v('ENT-11.5 : parcours juste, el-2 — 20 / 20 à la remise (= noter) ; messages datés du samedi 19/12/2026 ; aucun mot qui juge avant la remise ; copie figée ensuite ; une seule remise', async () => {
  await monter({ uid: 'mr115-juste' });
  const E0 = await entrants();
  egal(E0.map((m) => [m.from, m.subject.replace(/MR \d{4} \d{4}/, 'MR …')]), [['Samia', 'Ta matinée'], ['Georges Régnier', 'Colis MR … : où est-il ?'],
    ['Camille Brisset', 'Mon colis MR … ne bouge plus']], 'messages à l’ouverture');
  vrai(/Rendre ma copie/.test(E0[0].text), 'Samia dit quand rendre');
  vrai(E0.every((m) => { const d = new Date(m.ts); return d.getFullYear() === 2026 && d.getMonth() === 11 && d.getDate() === 19; }), 'date du scénario : ' + E0.map((m) => new Date(m.ts).toISOString()).join());
  const M0 = await menu();
  vrai(M0.includes('mail') && M0.includes('tournee'), 'menu au départ : ' + M0.join(', '));
  await tournee(JUSTE, R_JUSTE);
  egal(motQuiJuge(await ecran()), null, 'tournée enregistrée : un mot qui juge');
  vrai(!(await present('.pastille.crit, .pastille.ok, .tour-j-trop')), 'une pastille de verdict à la tournée');
  await deuxCourriels(CAUSE_EL2);
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject]).slice(3), [['Samia', 'Bien reçu'], ['Georges Régnier', 'RE : bien reçu'], ['Camille Brisset', 'RE : bien reçu']], 'accusés de réception');
  vrai(!E.some((m) => JUGE.test(m.text)), 'un message qui juge');
  const S = await sortants();
  egal(S.length, 2, 'deux courriels envoyés');
  vrai(S.every((m) => !/Salut|Bisous|Coucou|Hello/.test(m.text)), 'un courriel familier : ' + S.map((m) => m.text).join('\n---\n'));
  const n = await noter();
  egal(kos(n), [], 'jalons faux');
  egal(oks(n).sort(), [...JALONS].sort(), 'jalons justes');
  egal([n.score, n.max], [20, 20], 'noter(db)');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
  const c = await rendre();
  egal([c.score, c.max], [20, 20], 'la note rendue');
  vrai(await present('[data-copie-etat="rendue"]'), 'copie rendue à l’écran');
  // Copie figée : plus rien ne se sauve, ni la tournée, ni un courriel.
  const avant = await pg.evaluate(() => [window.__f.sauver, JSON.stringify(window.__f.db.transport), window.__f.db.mails.length]);
  await aller('tournee');
  await pg.$$eval(`${Z} [data-clic-point], ${Z} [data-tour-raz], ${Z} [data-reprendre]`, (L) => L.forEach((b) => b.dispatchEvent(new MouseEvent('click', { bubbles: true }))));
  await pause();
  const apres = await pg.evaluate(() => [window.__f.sauver, JSON.stringify(window.__f.db.transport), window.__f.db.mails.length]);
  egal(apres, avant, 'la copie bouge après la remise');
  egal(await copies(), 1, 'une seule remise');
  vrai(!(await present('[data-copie-rendre]')), 'le bouton « Rendre » est encore là');
});

await v('ENT-11.5 : parcours juste de l’autre ordre juste (échange Saint-Julien / Bréviandes) et de deux autres élèves — 20 / 20 ; les valeurs reportées se jugent sur SA tournée', async () => {
  await monter({ uid: 'mr115-j2' });
  await tournee(['bs', 'ri', 'ch', 'br', 'sj'], { conduite: 192, attente: 36, duree: 278 });
  await deuxCourriels(CAUSE_EL2);
  const n = await noter();
  egal(kos(n), [], 'el-2, autre ordre : jalons faux');
  proche(n.score, 20, 'el-2, autre ordre');
  await monter({ uid: 'mr115-j3', graine: 'eleve-115-a' });
  await tournee(['sj', 'ch', 'ri', 'bs', 'br'], { conduite: 215, attente: 57, duree: 322 });
  await deuxCourriels(2);
  proche((await noter()).score, 20, 'eleve-115-a (cause : Point Relais fermé)');
  await monter({ uid: 'mr115-j4', graine: 'eleve-115-b' });
  await tournee(['bs', 'ri', 'br', 'sj', 'ch'], { conduite: 263, attente: 0, duree: 313 });
  await deuxCourriels(0);
  proche((await noter()).score, 20, 'eleve-115-b (cause : carton ouvert)');
});

// ─────────────────────────────────────────────────────────── sabotages, un par un (éprouvés dans les deux sens)
await v('ENT-11.5 : jalon « relais » (5) — l’ordre naturel nord → sud (Chaource fermé) le fait tomber, et aussi « règles » (retour à 13 h 32) ; ses heures, reportées justes d’après SA tournée, restent justes ; 20 − 5 − 2 = 13', async () => {
  await monter({ uid: 'mr115-nat' });
  await tournee(NATUREL, R_NATUREL);
  await deuxCourriels(CAUSE_EL2);
  const n = await noter();
  egal(kos(n), ['relais', 'regles'], 'jalons faux');
  proche(n.score, 13, 'note');
});

await v('ENT-11.5 : jalon « règles » (2) seul — horaires tenus mais retour 13 h 36 et pause de 45 min due : « relais » reste juste, « règles » tombe ; et l’inverse (Chaource raté, retour 12 h 59) : « relais » tombe, « règles » reste juste', async () => {
  await monter({ uid: 'mr115-ret' });
  await tournee(RETARD, R_RETARD);
  await deuxCourriels(CAUSE_EL2);
  let n = await noter();
  egal(kos(n), ['regles'], 'retard : jalons faux');
  proche(n.score, 18, 'retard');
  await monter({ uid: 'mr115-rate' });
  await tournee(RATE, R_RATE);
  await deuxCourriels(CAUSE_EL2);
  n = await noter();
  egal(kos(n), ['relais'], 'créneau raté : jalons faux');
  proche(n.score, 15, 'créneau raté');
});

await v('ENT-11.5 : jalon « heures » (2) — une conduite fausse, une attente fausse, une durée fausse le font tomber (un par un) ; les bornes : conduite ±1, attente ±2, durée ±3 ; case vide = faux ; le reste de la note ne bouge pas', async () => {
  const essai = async (report, attendu, quoi) => {
    await monter({ uid: 'mr115-h' });
    await tournee(JUSTE, report);
    await deuxCourriels(CAUSE_EL2);
    const n = await noter();
    egal(n.detail.heures === 'ok', attendu, `${quoi} : ${JSON.stringify(report)}`);
    egal(kos(n).filter((j) => j !== 'heures'), [], `${quoi} : un autre jalon tombe`);
  };
  await essai(R_JUSTE, true, 'justes');
  await essai({ ...R_JUSTE, conduite: 250 }, false, 'conduite fausse');
  await essai({ ...R_JUSTE, attente: 0 }, false, 'attente fausse (le piège : l’ordre sans attente)');
  await essai({ ...R_JUSTE, duree: 300 }, false, 'durée fausse');
  await essai({ conduite: 203, attente: 34, duree: 292 }, true, 'dans les tolérances');
  await essai({ conduite: 202, attente: 36, duree: 289 }, false, 'conduite hors tolérance');
  await essai({ conduite: 204, attente: 36, duree: '' }, false, 'durée vide');
  await monter({ uid: 'mr115-h2' });
  await tournee(JUSTE, { conduite: '1h24', attente: 'x', duree: '289' });
  await deuxCourriels(CAUSE_EL2);
  egal((await noter()).detail.heures === 'ok', false, 'texte illisible');
});

await v('ENT-11.5 : tournée incomplète (quatre Points Relais) — « relais » et « règles » tombent ; aucune tournée du tout → ces trois jalons restent « en attente » (jamais justes) et la note est 7 + 4 = 11', async () => {
  await monter({ uid: 'mr115-inc' });
  await tournee(['bs', 'ri', 'ch', 'sj'], { conduite: 180, attente: 36, duree: 270 });
  await deuxCourriels(CAUSE_EL2);
  const n = await noter();
  vrai(kos(n).includes('relais') && kos(n).includes('regles'), 'incomplète : ' + kos(n));
  await monter({ uid: 'mr115-sans' });
  await deuxCourriels(CAUSE_EL2);
  const m = await noter();
  egal(['relais', 'regles', 'heures'].map((j) => m.detail[j]), ['attente', 'attente', 'attente'], 'sans tournée');
  proche(m.score, 11, 'sans tournée : cause 3 + prévenir 3 + ton 1 + ouverture 4');
});

await v('ENT-11.5 : jalon « cause » (3) — une cause fausse dans le courriel au Point Relais le fait tomber ; « prévenir » reste juste (la suite du colis suit la cause CHOISIE : une erreur ne se paie qu’une fois) ; 17', async () => {
  await monter({ uid: 'mr115-cf' });
  await tournee(JUSTE, R_JUSTE);
  await courriel(RELAIS, rel(0));            // carton ouvert, au lieu de l'étiquette illisible
  await courriel(EXPE, exp(CAUSE_EL2));
  const n = await noter();
  egal(kos(n), ['cause'], 'jalons faux');
  proche(n.score, 17, 'note');
  // Dans l'autre sens : la cause fausse dans le courriel à l'expéditrice tombe aussi.
  await monter({ uid: 'mr115-cf2' });
  await tournee(JUSTE, R_JUSTE);
  await courriel(RELAIS, rel(CAUSE_EL2));
  await courriel(EXPE, exp(2));
  egal(kos(await noter()), ['cause'], 'cause fausse à l’expéditrice');
});

await v('ENT-11.5 : jalon « prévenir » (3) — un seul courriel envoyé, une suite qui n’est pas celle de la cause choisie, un délai de garde faux (relais), une indemnité fausse (expéditrice) le font tomber, un par un ; « cause » reste juste ; 17', async () => {
  const essai = async (quoi, jouer, attendu) => {
    await monter({ uid: 'mr115-pr' });
    await tournee(JUSTE, R_JUSTE);
    await jouer();
    const n = await noter();
    egal(kos(n), attendu, quoi);
    return n;
  };
  const un = await essai('un seul courriel', () => courriel(RELAIS, rel(CAUSE_EL2)), ['prevenir']);
  proche(un.score, 17, 'un seul courriel');
  await essai('seulement l’expéditrice', () => courriel(EXPE, exp(CAUSE_EL2)), ['prevenir']);
  await essai('suite incohérente (relais)', async () => { await courriel(RELAIS, rel(CAUSE_EL2, { suite: 0 })); await courriel(EXPE, exp(CAUSE_EL2)); }, ['prevenir']);
  await essai('suite incohérente (expéditrice)', async () => { await courriel(RELAIS, rel(CAUSE_EL2)); await courriel(EXPE, exp(CAUSE_EL2, { suite: 2 })); }, ['prevenir']);
  await essai('délai de garde faux', async () => { await courriel(RELAIS, rel(CAUSE_EL2, { delai: 3 })); await courriel(EXPE, exp(CAUSE_EL2)); }, ['prevenir']);
  await essai('indemnité fausse', async () => { await courriel(RELAIS, rel(CAUSE_EL2)); await courriel(EXPE, exp(CAUSE_EL2, { indemnite: 1 })); }, ['prevenir']);
  await essai('indemnité « sans limite »', async () => { await courriel(RELAIS, rel(CAUSE_EL2)); await courriel(EXPE, exp(CAUSE_EL2, { indemnite: 2 })); }, ['prevenir']);
  // Le sens inverse : les deux courriels justes, jalon juste.
  await essai('les deux courriels justes', async () => { await courriel(RELAIS, rel(CAUSE_EL2)); await courriel(EXPE, exp(CAUSE_EL2)); }, []);
});

await v('ENT-11.5 : jalon « ton » (1) — une formule d’appel familière ou une politesse familière dans l’un des deux courriels le fait tomber, rien d’autre ; 19', async () => {
  const essai = async (oR, oE) => { await monter({ uid: 'mr115-ton' }); await tournee(JUSTE, R_JUSTE); await deuxCourriels(CAUSE_EL2, oR, oE); return noter(); };
  let n = await essai({ salut: 1 }, {});
  egal(kos(n), ['ton'], 'salut familier (relais)'); proche(n.score, 19, 'note');
  n = await essai({}, { fin: 1 });
  egal(kos(n), ['ton'], 'politesse familière (expéditrice)');
  n = await essai({ fin: 2 }, { salut: 2 });
  egal(kos(n), ['ton'], 'les deux');
  n = await essai({}, {});
  egal(kos(n), [], 'ton correct');
});

await v('ENT-11.5 : la copie d’un voisin — la tournée, les heures et les courriels justes d’el-2 rejoués par eleve-115-a : 8 (l’ordre ferme Chaource, Saint-Julien et Bréviandes ; les heures et la cause ne sont pas les siennes ; seuls prévenir et ton passent)', async () => {
  await monter({ uid: 'mr115-voisin', graine: 'eleve-115-a' });
  await parcoursJuste();
  const n = await noter();
  egal(kos(n), ['relais', 'regles', 'heures', 'cause'], 'jalons faux');
  proche(n.score, 8, 'note : prévenir 3 + ton 1 + ouverture 4');
});

await v('ENT-11.5 : inaction 0 — rien fait (ouverture sans réponse) → 0 / 20, aucun jalon juste ; une copie vide se rend à 0 ; « Je ne sais pas » partout avec un travail juste → 16', async () => {
  await monter({ uid: 'mr115-rien', sansOuverture: true });
  const n = await noter();
  egal([n.score, n.max], [0, 20], 'note');
  egal(oks(n), [], 'jalons justes sans rien faire');
  await monter({ uid: 'mr115-rien2', rep: OUV_NSP });
  egal((await rendre()).score, 0, 'copie vide rendue');
  await monter({ uid: 'mr115-nsp', rep: OUV_NSP });
  await parcoursJuste();
  proche((await noter()).score, 16, 'NSP partout, travail juste');
  // Ouvrir les écrans et ne rien enregistrer ne vaut rien : la tournée cliquée mais sans résultats reportés ne rapporte pas les heures.
  await monter({ uid: 'mr115-clic' });
  await tournee(JUSTE, null);
  const m = await noter();
  egal([m.detail.relais, m.detail.regles, m.detail.heures], ['ok', 'ok', 'ko'], 'tournée sans résultats reportés');
});

// ─────────────────────────────────────────────────────────── aucun verdict à l'écran, ergonomie
await v('ENT-11.5 : aucun verdict avant la remise — ni à la tournée (cinq Points Relais, ordre faux), ni après un courriel faux ; aucune requête hors du site ; aucune erreur JavaScript', async () => {
  await monter({ uid: 'mr115-muet' });
  await tournee(NATUREL, null);
  egal(motQuiJuge(await ecran()), null, 'tournée (ordre faux) : un mot qui juge');
  vrai(!(await present('.pastille.crit, .pastille.ok, .tour-j-trop')), 'une pastille de verdict à la tournée');
  await courriel(RELAIS, rel(0, { fin: 1, delai: 2 }));
  egal(motQuiJuge(await ecran()), null, 'courriel faux envoyé : un mot qui juge');
  const E = await entrants();
  vrai(!E.some((m) => JUGE.test(m.text)), 'un message qui juge : ' + E.map((m) => m.text).join('\n'));
  egal(await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth) <= 0, true, 'défilement en largeur');
  egal(externes, [], 'requêtes hors du site');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-11.5 : corrigé par élève — ses horaires, un ordre juste avec heures, les trois résultats attendus, sa cause ; d’après SA tournée quand il l’a faite ; un élève qui n’a rien ouvert reçoit son tirage', async () => {
  await monter({ uid: 'mr115-corr' });
  await tournee(RATE, R_RATE);
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-11.5.js');
    const txt = (o) => o.items.map((i) => `${i.texte} | ${i.rep || JSON.stringify(i.reponses)}`).join('\n');
    return { c: txt(C.corrigeEleve(window.__f.db, 'mr115-corr')), x: C.corrigeEleve({}, 'el-2'), xt: txt(C.corrigeEleve({}, 'el-2')), items: C.CORRIGE.items.length };
  });
  vrai(/Conduite 195 min \(±1\) ; attente 84 min \(±2\) ; durée 329 min \(±3\)/.test(r.c), 'ses résultats attendus d’après SA tournée : ' + r.c);
  vrai(/Ordre : Saint-Julien-les-Villas → Bréviandes → Bar-sur-Seine → Les Riceys → Chaource/.test(r.c) && /Fermé à l’arrivée : Chaource/.test(r.c), 'son ordre dans le corrigé : ' + r.c);
  vrai(/Conduite 204 min/.test(r.xt) && /retour à 12 h 19/.test(r.xt) && /étiquette/.test(r.xt) && /pas encore ouvert/.test(r.x.texte), 'corrigé d’un élève qui n’a rien ouvert : ' + r.xt);
  egal(r.items, 3, 'items communs');
});

await v('ENT-11.5 : Suivi — le détail de la note porte chaque jalon et l’ouverture (justes, tirées) pour l’enseignant', async () => {
  await monter({ uid: 'mr115-suivi' });
  await tournee(JUSTE, R_JUSTE);
  const n = await noter();
  egal(JALONS.filter((j) => !(j in n.detail)), [], 'jalons absents du détail');
  egal(['relais', 'regles', 'heures'].map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'les trois jalons de la tournée');
  vrai(n.detail.ouverture && n.detail.ouverture.sur === 4 && n.detail.ouverture.tirees.length === 4 && n.detail.ouverture.justes === 4, 'ouverture : ' + JSON.stringify(n.detail.ouverture));
});

await ctxF.close();
}
