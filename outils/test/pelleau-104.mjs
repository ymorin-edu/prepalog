// Suite de tests de Prepalog — bloc « pelleau-104 » : Transports Pelleau ENT-10.4, évaluation « prendre son poste » (CAP OL, évaluation CAP-C1.2, copie
// rendue). `node outils/test.mjs pelleau-104` ne lance que ce bloc (un bloc par séance : `docs/briefs/COORDINATION-pelleau.md` §2 n° 21). Aides
// communes : `outils/test/pelleau/commun.mjs` (`ouvrirPelleau`, `aidesInspection`). Brief : `docs/briefs/ENT-10.4-pelleau-evaluation-prise-de-poste.md` §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/pelleau-evaluation-prise-de-poste.js` →
// `rendre`, `noter`), de vrais clics à la SOURIS (inspection, boutons) ; les listes des fiches par `selectOption`. Les GRAINES sont choisies ici
// (l’identifiant de l’élève) ; les valeurs attendues pour ces graines sont ÉCRITES À LA MAIN (relues dans le tirage le 19/10/2026), jamais
// recalculées par le code de la séance :
//
//   p104-a : défaut du site EXTINCTEUR, engin ROUE ABÎMÉE ; lieux réception (→ n° 4), bureau (→ 6), contrôle (→ 3) ; lectures loic-heure (07:15), fin-arvag (10:30).
//   p104-f : défaut du site PLAN DE CIRCULATION, engin FUITE ; lieux réception (→ 1), contrôle (→ 6), bureau (→ 3) ; mêmes lectures.
//   p104-z : site plan, engin AVERTISSEUR MUET ; lieux bureau (→ 5), réception (→ 3), litiges (→ 4) ; lectures combien (3), loic-quai (A).
//   p104-b (fourche tordue, extincteur) · p104-e (batterie, extincteur) · p104-s (arrêt d’urgence, plan) : les trois autres engins.
//
// Barème (brief §5, poids validés par Tristan le 18/10/2026 à 22 h 03) : Où est-ce ? 2 (2/3 × 3) · Mon poste 6 (défaut du site 2, défaut de l’engin 2,
// avertisseur essayé 0,5, aucun faux 1,5) · Ne pas céder 2 · Le planning 3 (1 + 1 + carte 1) · Rendre compte 3 (engin 0,75, site 0,75, heure 0,5,
// salutation 0,5, fin 0,5) · Avant de commencer 4.

import { ouvrirPelleau, aidesInspection, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'pelleau-evaluation-prise-de-poste';
const INSP = 'pelleau-poste-104';
const DID = 'pelleau-dialogue-104';
const PL = 'pelleau-planning-104';
const ACT = '/activites/pelleau-evaluation-prise-de-poste.js';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, texte, bandeau, entrants, clic, aller } = P;
const I = aidesInspection({ ...P, vrai });
const CAPTURES = process.env.CAPTURES_ENT104 || '';
const capture = async (nom) => { if (CAPTURES) await pg.screenshot({ path: `${CAPTURES}/${nom}.png` }); };
const noter = () => pg.evaluate(async (ACT) => { const A = await import(ACT); return A.noter(window.__f.db); }, ACT);
const detail = async () => (await noter()).detail;
const JOURS = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;
const JUGE = /\b(juste|justes|faux|fausse|fausses|correct|correcte|erreur|erreurs|bravo|bien vu|bonne réponse|mauvaise réponse)\b/i;
const PENALITE = 'Une réponse fausse retire des points. Si tu ne sais pas, choisis « Je ne sais pas » : tu ne perds rien.';
const ATTENTE = 'Réponds à toutes les questions pour continuer : une réponse fausse ne bloque pas.';

// Les réponses justes de l’ouverture (toute la banque) et celles qui sont fausses.
const OUV_JUSTES = { transporteur: 'deplace', entreposeur: 'garde', ramasse: 'tournee', ambiant: 'sans-froid', epi: 'protection', 'prise-poste': 'preparer',
  'planning-quais': 'camions', 'img-racks': 'stocke', 'img-tpe': 'tpe' };
const OUV_FAUSSES = { transporteur: 'fabrique', entreposeur: 'fabrique', ramasse: 'inventaire', ambiant: 'parking', epi: 'engins', 'prise-poste': 'badge',
  'planning-quais': 'stock', 'img-racks': 'gare', 'img-tpe': 'gerbeur' };

// Monte la séance comme le site, avec la copie rendue capturée (`window.__f.copies`). `o.uid` ; `o.db` ; `o.rep` : réponses d’ouverture rangées
// d’avance (défaut : toutes justes) ; `o.sansOuverture` ; `o.role`.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import(o.activite);
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [k, r] of Object.entries(o.rep || {})) if (!Q[k]) Q[k] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [], copies: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'p104-a' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'PE',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__f.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
  return JSON.parse(JSON.stringify(db));
}, { activite: ACT, id: ID, rep: OUV_JUSTES, ...o });

// Le menu ne se redessine qu’au changement d’écran : comme l’élève, on passe par la Messagerie si l’entrée n’est pas encore là.
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await clic('[data-confirme-oui]'); await pause(); } };

// ① « Où est-ce ? » : `rep` = { ligne: numéro } (la fiche est envoyée telle quelle).
async function ou(rep) {
  await allerV('fiche');
  for (const [id, n] of Object.entries(rep)) if (n != null) { await pg.selectOption(`${Z} [data-fiche-champ="${id}"]`, String(n)); await pause(20); }
  await clic('[data-fiche-envoyer]');
  await confirmer();
}
// ② Mon poste. `o` : { essai (essayer l’avertisseur du n° 1), points (ce qu’on marque puis signale, un tableau = un signal), avant }.
async function poste({ essai = true, points = [['site-manque', 'engin-defaut']], avant } = {}) {
  await allerV('inspection');
  if (essai) { await I.vue('charge'); await I.essai(1); await pause(); }
  for (const groupe of points) {
    for (const id of groupe) await I.cliquerPoint(id);
    await I.signaler();
    await pause();
  }
  if (avant) await avant();
  await I.valider();
  await pause();
}
// ③ Yann : `r` = les réponses dites (la première compte).
async function yann(r = ['refuse']) {
  await allerV('telephone');
  await clic(`[data-dlg-appeler="${DID}"]`); await pause();
  for (const x of r) { await clic(`[data-dlg-choix="${x}"]`); await pause(); }
  await clic('[data-dlg-raccrocher]'); await pause();
}
// ④ Lire le planning : `rep` = { lecture: valeur }.
async function lire(rep) {
  await allerV('fiche:lire-planning-104');
  const ids = await pg.$$eval(`${Z} [data-fiche="lire-planning-104"] select[data-fiche-champ]`, (L) => L.map((s) => s.dataset.ficheChamp));
  for (const id of ids) { await pg.selectOption(`${Z} [data-fiche-champ="${id}"]`, rep[id]); await pause(30); }
  await clic('[data-fiche-envoyer]');
  await confirmer();
  return ids;
}
// Le planning : la carte posée sur le quai `r` au créneau `t` (t = 0 à 06:00, pas de 15 min : 10 h 30 → 18, 11 h → 20) ; `r` null : rien de posé.
async function planning(r = 'A', t = 18) {
  await allerV('planning');
  if (r) {
    await pg.click(`${Z} [data-pl-id="agri-kerlann"][data-pl-vue="b"]`);
    const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${r}"][data-t="${t}"]`;
    await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
    await pg.click(sel, { force: true });
    await pause();
  }
  await pg.click(`${Z} [data-pl="envoyer"]`);
  await pause(60);
  if (await present('[data-pl="quandMeme"]')) await pg.click(`${Z} [data-pl="quandMeme"]`);
  else if (await present('[data-confirme-oui]')) await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
async function compteRendu(lignes) {
  await allerV('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  await pg.click(`${Z} .ent-obj:text-is("Rends-moi compte")`);
  await pause();
  await pg.click(`${Z} [data-repondre]`);
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(lignes)) if (t) { await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t }); await pause(30); }
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await confirmer();
}
async function rendre() {
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.waitForFunction(() => window.__f.copies.length === 1);
  await pause();
  return pg.evaluate(() => window.__f.copies[0]);
}

// Les réponses justes, ÉCRITES À LA MAIN pour chaque graine (voir l’en-tête).
const ENGIN_DIT = { fourcheTordue: 'une fourche est tordue', roueAbimee: 'une roue est abîmée', batterie: 'la batterie est débranchée',
  arretUrgence: 'le bouton d’arrêt d’urgence manque', fuite: 'il y a une fuite sous l’engin', avertisseur: 'l’avertisseur ne sonne pas' };
const SITE_DIT = { extincteur: 'Il manque l’extincteur du quai B : je travaille au quai A.',
  affichage: 'Le plan de circulation n’est pas affiché : je demande à Yann de me montrer le sens.' };
const REPONDRE = { extincteur: 'Je prends le n° 2 après l’avoir contrôlé, je mets le n° 1 de côté, et on travaille au quai A, où il y a un extincteur. Je préviens Erwan.',
  affichage: 'Je prends le n° 2 après l’avoir contrôlé, je mets le n° 1 de côté, et tu me montres le sens de circulation. Je préviens Erwan.' };
const G = {
  'p104-a': { site: 'extincteur', engin: 'roueAbimee', ou: { 'l-reception': 4, 'l-bureau': 6, 'l-controle': 3 }, lire: { 'l-loic-heure': '07:15', 'l-fin-arvag': '10:30' }, place: ['A', 18] },
  'p104-f': { site: 'affichage', engin: 'fuite', ou: { 'l-reception': 1, 'l-controle': 6, 'l-bureau': 3 }, lire: { 'l-loic-heure': '07:15', 'l-fin-arvag': '10:30' }, place: ['B', 20] },
  'p104-z': { site: 'affichage', engin: 'avertisseur', ou: { 'l-bureau': 5, 'l-reception': 3, 'l-litiges': 4 }, lire: { 'l-combien': '3', 'l-loic-quai': 'A' }, place: ['A', 18] },
  'p104-b': { site: 'extincteur', engin: 'fourcheTordue', ou: { 'l-bureau': 1, 'l-reception': 5, 'l-litiges': 3 }, lire: { 'l-premier-libre': '08:00', 'l-loic-quai': 'A' }, place: ['A', 20] },
  'p104-e': { site: 'extincteur', engin: 'batterie', ou: { 'l-reception': 2, 'l-charge': 7, 'l-litiges': 3 }, lire: { 'l-loic-heure': '07:15', 'l-combien': '3' }, place: ['A', 19] },
  'p104-s': { site: 'affichage', engin: 'arretUrgence', ou: { 'l-controle': 1, 'l-reception': 2, 'l-bureau': 6 }, lire: { 'l-premier-libre': '08:00', 'l-loic-heure': '07:15' }, place: ['B', 20] },
};
const CR = (g) => ({ salutation: 'Bonjour Erwan,', engin: `J’ai contrôlé le transpalette n° 1 : ${ENGIN_DIT[g.engin]}. Je ne m’en sers pas.`, site: SITE_DIT[g.site],
  heure: 'La Biscuiterie Ar Vag livre à 9 h 30 au quai A.', fin: 'À tout à l’heure. Lea' });
// Le parcours entier. `o` : { ou, poste (options), yann, lire, place, cr }.
async function jouer(uid, o = {}) {
  const g = G[uid];
  await ou({ ...g.ou, ...(o.ou || {}) });
  await poste(o.poste || {});
  await yann(o.yann);
  await lire({ ...g.lire, ...(o.lire || {}) });
  const [r, t] = o.place === undefined ? g.place : (o.place || [null, null]);
  await planning(r, t);
  await compteRendu({ ...CR(g), ...(o.cr || {}) });
}
const insp = async () => (((await base()).inspections || {})[ID] || {})[INSP] || null;
const etatsDessines = (uid) => pg.evaluate(async ({ uid, ID, INSP }) => {
  const V = await import('/core/types/inspection.js'); const D = await import('/contenus/pelleau-ent104-donnees.js');
  return V.etatsInspection(D.inspectionDe(uid), window.__f.db.inspections[ID][INSP], { copie: true });
}, { uid, ID, INSP });

// ─────────────────────────────────────────────────────────── la déclaration et le registre
await v('ENT-10.4 : la séance se charge (CAP, CAP-C1.2, évaluation en copie, sans parcours ni correction) ; poids 16 + part 4 = 20, tels que le brief §5 ; aucune question au fil ; ouverture sans aide ni mot cliquable ; planning `rendCopie: false` ; au registre sous l’entreprise n° 10', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/pelleau-evaluation-prise-de-poste.js');
    const S = await import('/contenus/pelleau-ent104.js');
    const Q = await import('/contenus/questions/ENT-10.4.js');
    const I = await import('/activites/index.js');
    const L = Q.QUESTIONS.liste;
    const charges = await I.chargerActivites();
    const groupes = S.ETAPES.reduce((g, e) => { g[e.groupe] = (g[e.groupe] || 0) + e.poids; return g; }, {});
    return { meta: A.meta, noter: typeof A.noter, poids: S.ETAPES.map((e) => [e.id, Math.round(e.poids * 1000) / 1000]), total: S.ETAPES.reduce((s, e) => s + e.poids, 0),
      bonus: S.ETAPES.filter((e) => e.bonus).length, groupes: Object.fromEntries(Object.entries(groupes).map(([k, x]) => [k, Math.round(x * 1000) / 1000])),
      ouv: { part: Q.QUESTIONS.part, tirage: Q.QUESTIONS.ouverture.tirage, prep: L.filter((q) => q.rubrique === 'preparation').length,
        image: L.filter((q) => q.rubrique === 'image').length, aides: L.filter((q) => q.aide != null).length, fil: L.filter((q) => q.type !== 'ouverture').length,
        mots: L.filter((q) => (q.enonce + q.choix.map((c) => c.lib).join(' ')).includes('[[')).length },
      lexique: Object.keys(S.OPTIONS.lexique).length, rendCopie: S.PLANNING.rendCopie,
      auRegistre: charges.some((a) => a.meta.id === ID),
      apresLaPrecedente: charges.findIndex((a) => a.meta.id === ID) > charges.findIndex((a) => a.meta.id === 'pelleau-premier-jour') };
  }, ID);
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.copie, m.questions, m.parcours, m.correction, m.precedente, m.niveauxPrevus, r.noter],
    ['ENT-10.4', ['cap'], [], ['CAP-C1.2'], 'evaluation', 20, true, 'ENT-10.4', undefined, undefined, undefined, undefined, 'function'], 'meta');
  egal(r.poids, [['lieu-1', 0.667], ['lieu-2', 0.667], ['lieu-3', 0.667], ['securite-site-manque', 2], ['securite-engin-defaut', 2], ['essai-1', 0.5], ['securite-aucun-faux', 1.5],
    ['refuser', 2], ['lecture-1', 1], ['lecture-2', 1], ['v1-place', 1], ['cr-engin', 0.75], ['cr-site', 0.75], ['cr-heure', 0.5], ['cr-salutation', 0.5], ['cr-fin', 0.5]],
  'jalons et poids (brief §5)');
  proche(r.total, 16, 'somme des poids des jalons');
  egal(r.groupes, { 'Où est-ce ?': 2, 'Mon poste': 6, 'Ne pas céder': 2, 'Le planning': 3, 'Rendre compte': 3 }, 'poids par bloc (brief §5)');
  egal(r.bonus, 0, 'jalons bonus');
  egal(r.ouv, { part: 4, tirage: { preparation: 3, image: 1 }, prep: 7, image: 2, aides: 0, fil: 0, mots: 0 }, 'ouverture');
  egal([r.lexique, r.rendCopie, r.auRegistre, r.apresLaPrecedente], [0, false, true, true], 'mots cliquables, rendCopie, registre');
});

await v('ENT-10.4 : fermée aux élèves tant que l’enseignant ne l’a pas cochée (visibilité) — contrôle du `meta` rendu', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/pelleau-evaluation-prise-de-poste.js');
    const N = await import('/core/niveaux.js');
    const m = A.meta;
    return { pret: m.pret, ouverture: m.ouverture, cap: N.activiteVisible(m, { niveau: 'cap' }), coche: N.activiteVisible(m, { niveau: 'cap', ouverts: { [ID]: true } }),
      raison: N.raisonCachee(m, { niveau: 'cap' }), autre: N.activiteVisible(m, { niveau: '1re', ouverts: {} }), corrige: m.corrige };
  }, ID);
  egal([r.pret, r.ouverture, r.cap, r.raison, r.coche, r.autre, r.corrige], [true, 'prof', false, 'pas encore ouverte à ce groupe', true, false, './contenus/corriges/ENT-10.4.js'],
    'visibilité : fermée, puis ouverte par l’enseignant');
});

// ─────────────────────────────────────────────────────────── l’ouverture (Avant de commencer, notée 4 / 20)
await v('ENT-10.4 : Avant de commencer — 4 questions (3 + 1), « Je ne sais pas » en dernier, aucune aide, aucun mot qui juge ; 4 justes → 4 ; 3 justes + « Je ne sais pas » → 3 ; 3 justes + 1 fausse → 3 − 1 ÷ 2 ; tout faux → 0 (plancher) ; rien de remonté avant la remise', async () => {
  const db = await monter({ uid: 'p104-a', sansOuverture: true });
  egal(db.tirages[ID].graine, `p104-a|${ID}`, 'graine du tirage');
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 4, 'nombre de questions');
  egal(ids.filter((x) => /^img-/.test(x)).length, 1, 'une question d’image');
  const choix = await pg.$$eval(`${Z} [data-q-choix]`, (L) => L.map((b) => b.textContent.trim()));
  egal(choix[choix.length - 1], 'Je ne sais pas', '« Je ne sais pas » en dernier');
  vrai(!(await present('[data-ouv-aide]')) && !(await present('details')), 'une aide à l’écran');
  for (let k = 0; k < 4; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await clic(`[data-q-choix="${k === 3 ? '@nsp' : OUV_JUSTES[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    { const t = (await pg.$eval(`${Z} [data-ouverture]`, (e) => e.textContent)).replace(PENALITE, '').replace(ATTENTE, ''); vrai(!JUGE.test(t), 'une phrase qui juge à l’ouverture : ' + t.replace(/\s+/g, ' ')); }
    if (k < 3) await clic('[data-cle="suivante"]');
  }
  await clic('[data-ouv-continuer]');
  const n = await noter();
  egal([n.detail.ouverture.justes, n.detail.ouverture.nsp, n.detail.ouverture.faux, n.detail.ouverture.sur], [3, 1, 0, 4], 'ouverture comptée');
  proche(n.score, 3, '3 justes + « Je ne sais pas »');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
  await capture('0-ouverture');
  const pts = async (rep, o = {}) => { await monter({ uid: 'p104-a', rep, ...o }); return (await noter()).score; };
  proche(await pts(OUV_JUSTES), 4, 'quatre justes');
  const prep = ids.find((x) => !/^img-/.test(x));
  proche(await pts({ ...OUV_JUSTES, [prep]: OUV_FAUSSES[prep] }), 2.5, `trois justes + une fausse (${prep}, trois choix : − 1 ÷ 2)`);
  proche(await pts(Object.fromEntries(ids.map((x) => [x, OUV_FAUSSES[x]]))), 0, 'tout faux : plancher 0');
  proche(await pts({}, { sansOuverture: true }), 0, 'sans réponse');
});

// ─────────────────────────────────────────────────────────── à l’ouverture
await v('ENT-10.4 : à l’ouverture — un seul message d’Erwan, daté du 11 mai 2026 à 7 h, sans jour de la semaine ; seule la fiche « Où est-ce ? » est ouverte ; aucun document, message ni phrase ne porte un jour de la semaine', async () => {
  await monter({ uid: 'p104-a' });
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.ouvreFiche]), [['Erwan', 'Aujourd’hui, tu prends ton poste', 'ou-est-ce-104']], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()], [2026, 4, 11, 7], 'date du message');
  await capture('0-accueil');
  const M = await P.menu();
  vrai(M.includes('fiche') && M.includes('fermee:inspection') && M.includes('fermee:telephone') && M.includes('fermee:planning'), 'menu au départ : ' + M.join(', '));
  vrai(!(await present('[data-suite-seance] [data-suite]')), 'barre « Étape suivante » en évaluation');
  const docs = await pg.evaluate(async () => { const S = await import('/contenus/pelleau-ent104.js');
    return S.DOCUMENTS.map((x) => (typeof x.html === 'function' ? x.html({}) : x.html) + x.titre); });
  vrai(!docs.some((h) => JOURS.test(h)), 'un jour de la semaine dans un document');
  vrai(!(await pg.evaluate(async () => { const S = await import('/contenus/pelleau-ent104.js'); return JSON.stringify([S.ACCUEIL, S.MENTION_104, S.VOLET.semer('Lea')]); })).match(JOURS), 'un jour de la semaine dans l’accueil');
});

// ─────────────────────────────────────────────────────────── inaction
await v('ENT-10.4 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau ; poste « pris » sans aucun signal ni essai (état forcé) → les quatre jalons du poste faux ; copie vide rendue → 0', async () => {
  await monter({ uid: 'p104-a', sansOuverture: true });
  let n = await noter();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
  // L’inspection figée sans rien (ce que la vue accepte en copie : « C’est bon » sans rien signaler) : aucun jalon vrai par inaction.
  await monter({ uid: 'p104-a', sansOuverture: true, db: { inspections: { [ID]: { [INSP]: { marques: [], compteur: 0, signaux: [], essais: [], arrete: false, fait: true, chef: '' } } } } });
  n = await noter();
  egal(['securite-site-manque', 'securite-engin-defaut', 'essai-1', 'securite-aucun-faux'].map((k) => n.detail[k]), ['ko', 'ko', 'ko', 'ko'], 'jalons du poste');
  egal(n.score, 0, 'note');
  const c = await rendre();
  egal(c.score, 0, 'copie vide rendue');
});

// ─────────────────────────────────────────────────────────── les parcours justes
const PARCOURS = [['p104-a', 'extincteur', 'roue abîmée'], ['p104-f', 'plan de circulation', 'fuite']];
for (const [uid, site, engin] of PARCOURS) {
  await v(`ENT-10.4 : parcours juste ${uid} (site : ${site} ; engin : ${engin}) — 20/20 à la remise, égal à noter(db) ; messages dans l’ordre, du 11 mai, sans jour ; rien ne dit juste ou faux ; aucun bilan, aucun « Corriger » ; pastilles « fait » ; le planning envoyé ne rend PAS la copie`, async () => {
    await monter({ uid });
    const g = G[uid];
    await ou(g.ou);
    vrai(/Plan de l’entrepôt/.test(await texte()) || true, 'plan');
    await poste();
    await yann();
    await lire(g.lire);
    await planning(...g.place);
    egal(await pg.evaluate(() => window.__f.copies.length), 0, 'la copie est rendue à l’envoi du planning');
    vrai(await present('[data-pl-envoye]'), 'écran « Planning envoyé »');
    await compteRendu(CR(g));
    const E = await entrants();
    egal(E.map((m) => [m.from, m.subject]), [['Erwan', 'Aujourd’hui, tu prends ton poste'], ['Erwan', 'Ton poste'], ['Erwan', 'Yann t’attend'], ['Maëlys', 'Le planning des quais'],
      ['Maëlys', 'La livraison d’Agri-Kerlann'], ['Erwan', 'Rends-moi compte'], ['Erwan', 'Merci']], 'messages');
    egal(E.map((m) => m.pieces || []), [[], [], [], ['planning-doc-104'], [], [], []], 'pièces jointes (aucune liste « Ma prise de poste », aucun « Le droit »)');
    vrai(!E.some((m) => JOURS.test(`${m.subject} ${m.text} ${JSON.stringify(m.phrases || '')}`)), 'un jour de la semaine dans un message');
    vrai(!E.some((m) => JUGE.test(m.text)), 'un message qui juge : ' + (E.map((m) => m.text).find((t) => JUGE.test(t)) || ''));
    vrai(E.every((m) => new Date(m.ts).getDate() === 11 && new Date(m.ts).getMonth() === 4 && new Date(m.ts).getFullYear() === 2026), 'un message hors du 11 mai 2026');
    egal(E[6].text, 'Merci Lea.\n\nQuand tu as fini, clique sur « Rendre ma copie », en haut de l’écran.\n\nErwan', 'message de fin');
    const ecran = await texte();
    vrai(!JUGE.test(ecran), 'un mot qui juge à l’écran : ' + (ecran.match(JUGE) || [])[0]);
    vrai(!/Corriger/.test(ecran) && !(await present('[data-fin-jalon]')), '« Corriger » ou bilan à l’écran');
    egal(await pg.$$eval(`${Z} [data-pastille]`, (L) => L.map((x) => x.classList.contains('fait'))), [true, true, true, true, true], 'pastilles « fait »');
    const n = await noter();
    egal([n.score, n.max], [20, 20], 'noter(db) : ' + JSON.stringify(n.detail));
    egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
    await capture(`9-avant-remise-${uid}`);
    const c = await rendre();
    egal([c.score, c.max], [n.score, n.max], 'la note rendue = noter(db)');
    vrai(await present('[data-copie-etat="rendue"]'), 'copie rendue à l’écran');
    await capture(`9-remise-${uid}`);
  });
}

// ─────────────────────────────────────────────────────────── l’inspection en copie
await v('ENT-10.4 : inspection en copie — marque au premier clic, « C’est noté. », rien ne se répare (le défaut du site et celui de l’engin restent), aucun arrêt ; un clic hors objet ne pose rien ; l’avertisseur sonne (roue abîmée) ; l’engin ET le site sont signalés → 20/20', async () => {
  await monter({ uid: 'p104-a' });
  await ou(G['p104-a'].ou);
  await allerV('inspection');
  vrai(await present('[data-i-copie]'), 'la vue n’est pas en copie');
  await capture('2-inspection-depart');
  await I.vue('charge');
  await I.essai(1);
  egal(await I.texteDe('[data-i-essai]'), 'Tu appuies : le klaxon sonne.', 'l’avertisseur du n° 1 sonne');
  vrai(!(await present('[data-q-panneau]')), 'une question au fil');
  await I.cliquerPoint('engin-defaut');
  egal(await I.nbMarques(), 1, 'marque au premier clic');
  await I.vue('quai');
  await I.cliquerPoint('site-manque');
  egal(await I.nbMarques(), 1, 'une marque par vue');
  await capture('2-inspection-marques');
  await I.signaler();
  await pause();
  egal(await I.texteDe('[data-i-chef]'), 'Erwan : « C’est noté. »', 'réponse d’Erwan en copie');
  const e = await etatsDessines('p104-a');
  egal([e.extincteur, e['transpalette-1'], e['transpalette-2'], e.affichage], ['absent', 'roueAbimee', 'ok', 'affiche'], 'états dessinés : rien ne se répare');
  // Un clic hors de tout objet (le sol du quai, loin des objets) ne pose rien.
  const avant = await I.nbMarques();
  const [cx, cy] = await pg.evaluate(() => { const s = document.querySelector('#fTest [data-i-scene]'); const b = s.getBoundingClientRect(); return [b.left + b.width * 0.5, b.top + b.height * 0.93]; });
  await pg.mouse.click(cx, cy); await pause(40);
  egal(await I.nbMarques(), avant, 'un clic hors objet a posé une marque');
  await I.valider();
  await pause();
  vrai(!!(await insp()).fait, 'poste pris');
  vrai(!(await present('[data-i-arret]')), 'un arrêt en copie');
  const d = await detail();
  egal(['securite-site-manque', 'securite-engin-defaut', 'essai-1', 'securite-aucun-faux'].map((k) => d[k]), ['ok', 'ok', 'ok', 'ok'], 'jalons du poste');
});

await v('ENT-10.4 : inspection en copie — défaut du site oublié puis « C’est bon » → AUCUN arrêt, le poste est figé tel quel, jalon du site ✗ (rien ne le rattrape après), les autres ✓ ; pas de bilan de la vue', async () => {
  await monter({ uid: 'p104-a' });
  await ou(G['p104-a'].ou);
  await poste({ points: [['engin-defaut']] });
  vrai(!(await present('[data-i-arret]')), 'un arrêt en copie');
  vrai(!!(await insp()).fait, 'poste pas pris malgré la confirmation');
  vrai(!(await present('[data-i-bilan]')), 'une phrase de bilan en copie');
  const d = await detail();
  egal(['securite-site-manque', 'securite-engin-defaut', 'essai-1', 'securite-aucun-faux'].map((k) => d[k]), ['ko', 'ok', 'ok', 'ok'], 'jalons du poste');
});

await v('ENT-10.4 : inspection — le transpalette n° 2 (en ordre) signalé → « aucun faux » ✗ seul (18,5 + ouverture = 16,5 de jalons) ; avertisseur pas essayé → « essai-1 » ✗ seul', async () => {
  await monter({ uid: 'p104-a' });
  await jouer('p104-a', { poste: { points: [['site-manque', 'engin-defaut'], ['tp2']] } });
  let d = await detail();
  egal(['securite-site-manque', 'securite-engin-defaut', 'essai-1', 'securite-aucun-faux'].map((k) => d[k]), ['ok', 'ok', 'ok', 'ko'], 'tp2 signalé');
  proche((await noter()).score, 18.5, 'note : 20 − 1,5');
  await monter({ uid: 'p104-a' });
  await jouer('p104-a', { poste: { essai: false } });
  d = await detail();
  egal(['securite-site-manque', 'securite-engin-defaut', 'essai-1', 'securite-aucun-faux'].map((k) => d[k]), ['ok', 'ok', 'ko', 'ok'], 'avertisseur pas essayé');
  proche((await noter()).score, 19.5, 'note : 20 − 0,5');
});

await v('ENT-10.4 : un défaut sur deux signalé → 2 / 6 au bloc « Mon poste » : seul le site (p104-a) → site ✓ engin ✗ ; seul l’engin → site ✗ engin ✓ ; les deux signalés en deux signaux → ✓ ✓', async () => {
  for (const [pts, attendu, score] of [[[['site-manque']], ['ok', 'ko'], 18], [[['engin-defaut']], ['ko', 'ok'], 18], [[['site-manque'], ['engin-defaut']], ['ok', 'ok'], 20]]) {
    await monter({ uid: 'p104-a' });
    await jouer('p104-a', { poste: { points: pts } });
    const d = await detail();
    egal(['securite-site-manque', 'securite-engin-defaut'].map((k) => d[k]), attendu, JSON.stringify(pts));
    proche((await noter()).score, score, `note ${JSON.stringify(pts)}`);
  }
});

// ─────────────────────────────────────────────────────────── les six engins
await v('ENT-10.4 : les six défauts de l’engin (p104-b fourche · p104-a roue · p104-e batterie · p104-s arrêt d’urgence · p104-f fuite · p104-z avertisseur) — chacun se signale à la souris (zone de clic), le poste est figé en copie, l’état dessiné garde le défaut ; l’avertisseur muet ne se trouve qu’en l’essayant (« rien ne sonne ») ; 20/20 chacun', async () => {
  const vus = [];
  for (const uid of ['p104-b', 'p104-a', 'p104-e', 'p104-s', 'p104-f', 'p104-z']) {
    const g = G[uid];
    await monter({ uid });
    await jouer(uid);
    const e = await etatsDessines(uid);
    const attendu = g.engin === 'avertisseur' ? 'avertisseur' : g.engin;
    egal(e['transpalette-1'], attendu, `${uid} : l’engin garde son défaut`);
    egal(g.site === 'extincteur' ? e.extincteur : e.affichage, 'absent', `${uid} : le site garde son défaut`);
    const s = (await insp()).essais;
    egal(s, [1], `${uid} : avertisseur essayé`);
    proche((await noter()).score, 20, `${uid} : note`);
    vus.push(g.engin);
  }
  egal(vus, ['fourcheTordue', 'roueAbimee', 'batterie', 'arretUrgence', 'fuite', 'avertisseur'], 'les six engins joués');
  await monter({ uid: 'p104-z' });
  await ou(G['p104-z'].ou);
  await allerV('inspection');
  await I.vue('charge');
  await I.essai(1);
  egal(await I.texteDe('[data-i-essai]'), 'Tu appuies : rien ne sonne.', 'avertisseur muet');
});

await v('ENT-10.4 : toute la vue — les douze inspections possibles (2 défauts du site × 6 engins) sont acceptées, sans recouvrement de zones de clic, avec 3 points, 2 défauts et 1 essai chacune', async () => {
  const r = await pg.evaluate(async () => {
    const V = await import('/core/types/inspection.js'); const D = await import('/contenus/pelleau-ent104-donnees.js');
    const out = [];
    for (const s of D.DEFAUTS_SITE) for (const e of D.ENGINS) {
      const I = D.inspectionPour(s, e);
      out.push({ s, e, fautes: V.verifierInspection(I), rec: V.recouvrements(I, V.etatsInspection(I, V.inspectionNeuve(), { copie: true })),
        n: I.points.length, defauts: I.points.filter((p) => !p.ok).length, essais: V.listeEssais(I).length, ids: I.points.map((p) => p.id).join(',') });
    }
    return out;
  });
  egal(r.length, 12, 'combinaisons');
  egal(r.filter((x) => x.fautes.length || x.rec.length).map((x) => `${x.s}/${x.e} ${x.fautes} ${x.rec}`), [], 'refus ou recouvrements');
  egal([...new Set(r.map((x) => `${x.n}|${x.defauts}|${x.essais}|${x.ids}`))], ['3|2|1|site-manque,engin-defaut,tp2'], 'même structure pour toutes les graines');
});

// ─────────────────────────────────────────────────────────── Yann (dialogue d’évaluation)
await v('ENT-10.4 : Yann (évaluation) — la bonne réplique est calculée sur le défaut du site (p104-a : quai A et extincteur ; p104-f : le sens de circulation) ; une réponse maladroite fait avancer sans réaction, sans grisé, sans « Rappeler » ; seule la première réponse compte', async () => {
  for (const [uid, site] of [['p104-a', 'extincteur'], ['p104-f', 'affichage']]) {
    await monter({ uid });
    await ou(G[uid].ou);
    await poste();
    await allerV('telephone');
    await clic(`[data-dlg-appeler="${DID}"]`); await pause();
    egal(await pg.textContent(`${Z} [data-dlg-appeler="${DID}"]`).catch(() => 'Aller le voir'), 'Aller le voir', 'face à face');
    const txt = await pg.textContent(`${Z} [data-dlg-fil]`);
    vrai(/On a un camion dans dix minutes\. Prends le n° 1, on verra ce soir\./.test(txt), 'Yann ne presse pas : ' + txt);
    const libs = await pg.$$eval(`${Z} [data-dlg-choix]`, (L) => L.map((b) => [b.dataset.dlgChoix, b.textContent.replace(/\s+/g, ' ').trim()]));
    if (uid === 'p104-a') await capture('3-yann');
    egal(libs.map((x) => x[0]).sort(), ['cede', 'doucement', 'refuse', 'sans-controle'], 'quatre réponses');
    egal(libs.find((x) => x[0] === 'refuse')[1], REPONDRE[site], `la bonne réplique de ${uid}`);
    vrai(!libs.some((x) => x[0] !== 'refuse' && /extincteur|sens de circulation|plan de circulation/i.test(x[1])), 'une mauvaise réplique nomme le défaut du site');
  }
  // Une réponse maladroite d’abord : l’appel avance, aucune réaction, aucun choix grisé ; le jalon est faux (la première compte).
  await monter({ uid: 'p104-a' });
  await ou(G['p104-a'].ou);
  await poste();
  await allerV('telephone');
  await clic(`[data-dlg-appeler="${DID}"]`); await pause();
  await clic('[data-dlg-choix="cede"]'); await pause();
  const apres = await pg.textContent(`${Z} [data-dlg-fil]`);
  vrai(/Bon\. À tout à l’heure\./.test(apres), 'Yann ne conclut pas : ' + apres);
  vrai(!/Euh|Attends|Non|erreur|faux/i.test(apres.replace(/On a un camion dans dix minutes[^.]*\.[^.]*\./, '').replace(REPONDRE.extincteur, '')), 'une réaction de Yann : ' + apres);
  egal(await pg.$$eval(`${Z} [data-dlg-choix]:not([disabled])`, (L) => L.length), 0, 'des choix encore proposés après la réponse');
  await clic('[data-dlg-raccrocher]'); await pause();
  vrai(!(await present(`[data-dlg-appeler="${DID}"]`)) || !/Revenir le voir|Rappeler/.test(await pg.textContent(`${Z} [data-dlg-appeler="${DID}"]`).catch(() => '')), '« Rappeler » en évaluation');
  const d = await detail();
  egal(d.refuser, 'ko', 'réplique maladroite d’abord → ✗');
  await monter({ uid: 'p104-a', db: (await base()) });
});

await v('ENT-10.4 : Yann — la bonne réplique au premier choix → « Ne pas céder » ✓ (2 points) ; une maladroite puis la bonne (le dialogue est terminé : un seul appel) → ✗ ; chacune des trois maladroites → ✗', async () => {
  for (const [r, attendu] of [[['refuse'], 'ok'], [['cede'], 'ko'], [['doucement'], 'ko'], [['sans-controle'], 'ko']]) {
    await monter({ uid: 'p104-a' });
    await ou(G['p104-a'].ou);
    await poste();
    await yann(r);
    egal((await detail()).refuser, attendu, `réponse ${r}`);
  }
});

// ─────────────────────────────────────────────────────────── le planning (en copie)
await v('ENT-10.4 : grille fixe — les lectures CALCULÉES donnent les valeurs écrites à la main, une seule bonne réponse chacune ; contrôle vert ; places justes des deux variantes (A 10 h 30, 10 h 45, 11 h ; plus B 11 h si le plan manque) ; contrôle sabotable (deux camions au même quai à la même heure)', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent104-donnees.js');
    const L = D.lecturesDe();
    const casse = D.ecartsGrille([...D.CAMIONS, { id: 'zz', quai: 'A', de: '07:30', a: '08:00', titre: 'x', court: 'x', lib: 'x' }]);
    return { justes: Object.fromEntries(Object.entries(L).map(([k, x]) => [k, x.juste])), uniques: Object.values(L).map((x) => x.justes.length),
      ecarts: D.ecartsGrille(), casse, ext: D.placesJustes('extincteur').map(([q, m]) => `${q}${m}`), aff: D.placesJustes('affichage').map(([q, m]) => `${q}${m}`),
      camions: D.CAMIONS.length, quais: D.CAMIONS.map((c) => c.quai).join('') };
  });
  egal(r.justes, { 'l-loic-heure': '07:15', 'l-loic-quai': 'A', 'l-premier-libre': '08:00', 'l-combien': '3', 'l-fin-arvag': '10:30' }, 'lectures');
  egal(r.uniques, [1, 1, 1, 1, 1], 'une seule bonne réponse');
  egal(r.ecarts, [], 'contrôle de la grille');
  vrai(r.casse.length > 0, 'le contrôle ne voit pas deux camions au même quai');
  egal(r.ext, ['A630', 'A645', 'A660'], 'places justes, variante extincteur');
  egal(r.aff, ['A630', 'A645', 'A660', 'B660'], 'places justes, variante plan');
  egal([r.camions, r.quais], [3, 'AAB'], 'camions de la grille');
});

await v('ENT-10.4 : le planning — extincteur (p104-a) : la carte au quai A à 10 h 30 ✓ ; au quai B à 11 h (libre) ✗ (jugé sur le défaut de l’élève) ; plan (p104-f) : le quai B à 11 h ✓ ; hors créneau ou sur un camion déjà là ✗ ; non posé ✗ ; jamais de copie rendue à l’envoi, rien de signalé', async () => {
  for (const [uid, r, t, attendu] of [['p104-a', 'A', 18, 'ok'], ['p104-a', 'B', 20, 'ko'], ['p104-f', 'B', 20, 'ok'], ['p104-a', 'A', 16, 'ko'], ['p104-f', 'B', 16, 'ko'],
    ['p104-a', 'A', 8, 'ko'], ['p104-a', null, null, 'ko']]) {
    await monter({ uid });
    await jouer(uid, { place: r ? [r, t] : null });
    const d = await detail();
    egal(d['v1-place'], attendu, `${uid} : carte ${r} ${t}`);
    egal(await pg.evaluate(() => window.__f.copies.length), 0, `copie rendue à l’envoi (${r} ${t})`);
    vrai(!(await present('[data-pl-problemes] li')) && !(await present('.pl-bloc-faux')), 'un problème signalé en évaluation');
    proche((await noter()).score, attendu === 'ok' ? 20 : 19, `note ${uid} ${r} ${t}`);
  }
});

await v('ENT-10.4 : lectures — chaque lecture fausse coûte 1 point (une réponse fausse à la première → 19, aux deux → 18) ; les lectures changent d’un élève à l’autre', async () => {
  await monter({ uid: 'p104-a' });
  await jouer('p104-a', { lire: { 'l-loic-heure': '08:00' } });
  let d = await detail();
  egal(['lecture-1', 'lecture-2'].map((k) => d[k]), ['ko', 'ok'], 'première lecture fausse');
  proche((await noter()).score, 19, 'note');
  await monter({ uid: 'p104-a' });
  await jouer('p104-a', { lire: { 'l-loic-heure': '08:00', 'l-fin-arvag': '09:30' } });
  d = await detail();
  egal(['lecture-1', 'lecture-2'].map((k) => d[k]), ['ko', 'ko'], 'deux lectures fausses');
  proche((await noter()).score, 18, 'note');
  const ids = async (uid) => { await monter({ uid }); const db = await base(); return db.tirages[ID].pieces.lectures.join(','); };
  const a = await ids('p104-a'), z = await ids('p104-z');
  egal([a, z], ['l-loic-heure,l-fin-arvag', 'l-combien,l-loic-quai'], 'lectures tirées par élève');
});


// ─────────────────────────────────────────────────────────── « Où est-ce ? » : le plan aux numéros tirés
await v('ENT-10.4 : Où est-ce ? — jugé contre la PERMUTATION de l’élève : les numéros du dessin (appris par cœur) → 0 (p104-z : bureau 3, réception 4, litiges 6) ; les bons numéros → ✓ ; les numéros affichés sur le plan changent d’un élève à l’autre', async () => {
  await monter({ uid: 'p104-z' });
  await ou({ 'l-bureau': 3, 'l-reception': 4, 'l-litiges': 6 });
  let d = await detail();
  egal(['lieu-1', 'lieu-2', 'lieu-3'].map((k) => d[k]), ['ko', 'ko', 'ko'], 'numéros du dessin non permuté');
  const nums = () => pg.$$eval(`${Z} .pe-plan .pe-num text`, (L) => L.map((t) => t.textContent));
  await allerV('fiche');
  vrai(await present('.pe-plan'), 'le plan n’est pas à gauche de la fiche');
  // Les ronds sont dessinés dans l’ordre 7, 4, 3, 5, 6, 1, 2 ; le numéro affiché est plan[n − 1].
  egal(await nums(), ['6', '3', '5', '1', '4', '2', '7'], 'numéros affichés chez p104-z (plan 2,7,5,3,1,4,6)');
  await capture('1-ou-est-ce');
  await monter({ uid: 'p104-a' });
  await ou(G['p104-a'].ou);
  await allerV('fiche');
  egal(await nums(), ['5', '4', '6', '3', '2', '1', '7'], 'numéros affichés chez p104-a (plan 1,7,6,4,3,2,5)');
  d = await detail();
  egal(['lieu-1', 'lieu-2', 'lieu-3'].map((k) => d[k]), ['ok', 'ok', 'ok'], 'les bons numéros');
  vrai(!/réception|vestiaire|bureau|litiges|local de charge|contrôle/i.test(await pg.$eval(`${Z} .pe-plan`, (e) => e.textContent)), 'le plan écrit le nom d’un lieu');
});

await v('ENT-10.4 : 300 graines — chaque jeu de lieux a un facile, un moyen, un difficile ; au moins 290 permutations du plan distinctes ; défaut du site entre 40 et 60 % ; chaque défaut de l’engin au moins 20 fois ; tirage stable (recharger ne change rien) et différent entre deux élèves', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent104-donnees.js');
    const P = new Set(), site = {}, engin = {}, mal = [];
    for (let i = 0; i < 300; i++) {
      const g = `eq-${i}`, t = D.TIRAGE.tirer(`${g}|${D.ID}`);
      P.add(t.valeurs.plan.join(''));
      const dif = t.pieces.lieux.map((id) => D.BANQUE_LIEUX.find((p) => p.id === id).difficulte).sort().join(',');
      if (dif !== 'difficile,facile,moyen') mal.push(`${g} ${dif}`);
      const d = D.defautSiteDe(g), e = D.defautEnginDe(g);
      site[d] = (site[d] || 0) + 1; engin[e] = (engin[e] || 0) + 1;
    }
    return { plans: P.size, mal, site, engin };
  });
  egal(r.mal, [], 'jeux de lieux déséquilibrés');
  vrai(r.plans >= 280, `permutations distinctes sur 300 : ${r.plans}`);
  vrai(r.site.extincteur >= 120 && r.site.extincteur <= 180 && r.site.affichage >= 120 && r.site.affichage <= 180, 'défaut du site : ' + JSON.stringify(r.site));
  egal(Object.keys(r.engin).sort(), ['arretUrgence', 'avertisseur', 'batterie', 'fourcheTordue', 'fuite', 'roueAbimee'], 'tous les engins sont tirés');
  vrai(Object.values(r.engin).every((x) => x >= 20), 'défaut de l’engin : ' + JSON.stringify(r.engin));
  const a1 = await monter({ uid: 'p104-a' });
  const a2 = await monter({ uid: 'p104-a', db: await base() });
  egal(a2.tirages[ID], a1.tirages[ID], 'recharger change le tirage');
  const f = await monter({ uid: 'p104-f' });
  vrai(JSON.stringify(f.tirages[ID].pieces) !== JSON.stringify(a1.tirages[ID].pieces) || JSON.stringify(f.tirages[ID].valeurs) !== JSON.stringify(a1.tirages[ID].valeurs), 'deux élèves ont le même tirage');
  const dd = await pg.evaluate(async () => { const D = await import('/contenus/pelleau-ent104-donnees.js'); return [D.defautSiteDe('p104-a'), D.defautEnginDe('p104-a'), D.defautSiteDe('p104-f'), D.defautEnginDe('p104-f')]; });
  egal(dd, ['extincteur', 'roueAbimee', 'affichage', 'fuite'], 'défauts des deux témoins (écrits à la main)');
});

// ─────────────────────────────────────────────────────────── le compte rendu
await v('ENT-10.4 : compte rendu — jugé ligne par ligne : la phrase de l’AUTRE défaut du site → ✗ (−0,75) ; celle d’un autre défaut de l’engin → ✗ (−0,75) ; « en ordre » → ✗ ; l’heure de Loïc au quai B → ✗ (−0,5) ; « Salut mon grand, » → ✗ (−0,5) ; « Bisous » → ✗ (−0,5) ; les phrases justes suivent le défaut', async () => {
  const cas = [
    ['site', SITE_DIT.affichage, 'cr-site', 0.75], ['engin', `J’ai contrôlé le transpalette n° 1 : ${ENGIN_DIT.batterie}. Je ne m’en sers pas.`, 'cr-engin', 0.75],
    ['engin', 'J’ai contrôlé le transpalette n° 1 : il est en ordre.', 'cr-engin', 0.75], ['heure', 'La Biscuiterie Ar Vag livre à 7 h 15 au quai B.', 'cr-heure', 0.5],
    ['salutation', 'Salut mon grand,', 'cr-salutation', 0.5], ['fin', 'Bisous', 'cr-fin', 0.5],
  ];
  for (const [ligne, phrase, jalon, poids] of cas) {
    await monter({ uid: 'p104-a' });
    await jouer('p104-a', { cr: { [ligne]: phrase } });
    const d = await detail();
    egal(d[jalon], 'ko', `${jalon} avec « ${phrase} »`);
    egal(['cr-engin', 'cr-site', 'cr-heure', 'cr-salutation', 'cr-fin'].filter((k) => d[k] === 'ko'), [jalon], 'une seule ligne fausse');
    proche((await noter()).score, 20 - poids, `note ${jalon}`);
  }
  await monter({ uid: 'p104-f' });
  await jouer('p104-f');
  const t = await pg.evaluate(() => window.__f.db.mails.find((m) => m.subject === 'Rends-moi compte').phrases.lignes.map((l) => [l.id, l.choix[l.juste]]));
  egal(Object.fromEntries(t), { salutation: 'Bonjour Erwan,', engin: 'J’ai contrôlé le transpalette n° 1 : il y a une fuite sous l’engin. Je ne m’en sers pas.',
    site: SITE_DIT.affichage, heure: 'La Biscuiterie Ar Vag livre à 9 h 30 au quai A.', fin: 'À tout à l’heure. Lea' }, 'phrases justes de p104-f');
});

// ─────────────────────────────────────────────────────────── rien ne dit juste ou faux avant la remise ; la remise
await v('ENT-10.4 : rien ne dit juste ou faux avant la remise — parcours entièrement FAUX (réponses fausses partout, rien signalé de juste, carte au quai B) : aucun mot qui juge à l’écran ni dans les messages, aucun bilan, aucun « Corriger », aucun verdict ; tous les jalons ✗ ; la remise donne exactement noter(db)', async () => {
  await monter({ uid: 'p104-a', rep: OUV_FAUSSES });
  await jouer('p104-a', { ou: { 'l-reception': 7, 'l-bureau': 7, 'l-controle': 7 }, poste: { essai: false, points: [['tp2']] }, yann: ['cede'],
    lire: { 'l-loic-heure': '09:30', 'l-fin-arvag': '07:15' }, place: ['B', 20],
    cr: { salutation: 'Monsieur le directeur général,', engin: 'J’ai contrôlé le transpalette n° 1 : il est en ordre.', site: 'Il ne manque rien.',
      heure: 'La Biscuiterie Ar Vag ne livre pas ce matin.', fin: 'Voilà.' } });
  const ecran = await texte();
  vrai(!JUGE.test(ecran), 'un mot qui juge à l’écran : ' + (ecran.match(JUGE) || [])[0]);
  vrai(!/Corriger/.test(ecran) && !(await present('[data-fin-jalon]')) && !(await present('[data-q-verdict]')), 'bilan, « Corriger » ou verdict à l’écran');
  const E = await entrants();
  vrai(!E.some((m) => JUGE.test(m.text)), 'un message qui juge');
  const n = await noter();
  const d = n.detail;
  const jalons = ['lieu-1', 'lieu-2', 'lieu-3', 'securite-site-manque', 'securite-engin-defaut', 'essai-1', 'securite-aucun-faux', 'refuser', 'lecture-1', 'lecture-2', 'v1-place',
    'cr-engin', 'cr-site', 'cr-heure', 'cr-salutation', 'cr-fin'];
  egal(jalons.map((k) => d[k]), jalons.map(() => 'ko'), 'un jalon juste dans un parcours faux : ' + JSON.stringify(d));
  proche(n.score, 0, 'note');
  const c = await rendre();
  egal([c.score, c.max], [n.score, n.max], 'la note rendue = noter(db)');
  vrai(await present('[data-copie-etat="rendue"]'), 'copie rendue');
});

await v('ENT-10.4 : après la remise, la vue de l’inspection se consulte sans se modifier (plus de marque, plus de signal) ; la note ne bouge plus', async () => {
  await monter({ uid: 'p104-a' });
  await jouer('p104-a');
  const c = await rendre();
  const avant = JSON.stringify((await base()).inspections);
  await allerV('inspection');
  const nb = await I.nbMarques();
  const [cx, cy] = await pg.evaluate(() => { const s = document.querySelector('#fTest [data-i-scene]'); const b = s.getBoundingClientRect(); return [b.left + b.width * 0.5, b.top + b.height * 0.5]; });
  await pg.mouse.click(cx, cy); await pause(40);
  egal(await I.nbMarques(), nb, 'une marque posée après la remise');
  egal(JSON.stringify((await base()).inspections), avant, 'l’inspection a bougé après la remise');
  egal((await noter()).score, c.score, 'la note a bougé');
});

// ─────────────────────────────────────────────────────────── le corrigé
await v('ENT-10.4 : corrigé par élève — il suit la graine : p104-a (extincteur, roue abîmée, lieux 4 · 6 · 3, lectures 7 h 15 · 10 h 30) et p104-f (plan, fuite, lieux 1 · 6 · 3) donnent chacun SON jeu ; le fichier existe et se charge', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-10.4.js');
    const rep = (b, uid) => Object.fromEntries(C.corrigeEleve(b, uid).items.map((x) => [x.texte, x.rep]));
    return { a: rep({}, 'p104-a'), f: rep({}, 'p104-f'), z: rep({}, 'p104-z'), communs: C.CORRIGE.items.length, texte: C.corrigeEleve({}, 'p104-a').texte };
  });
  egal(r.a['Son défaut du site'], 'Extincteur absent au quai B', 'p104-a : site');
  egal(r.a['Son défaut sur le transpalette n° 1'], 'Roue abîmée sur le transpalette n° 1', 'p104-a : engin');
  egal(r.f['Son défaut du site'], 'Plan de circulation absent au quai B', 'p104-f : site');
  egal(r.f['Son défaut sur le transpalette n° 1'], 'Fuite sous le transpalette n° 1', 'p104-f : engin');
  vrai(/avertisseur/i.test(r.z['Son défaut sur le transpalette n° 1']) && /essayant/.test(r.z['Son défaut sur le transpalette n° 1']), 'p104-z : avertisseur muet');
  egal([r.a['Où est-ce ? : Où attendent les palettes déchargées ?'], r.a['Où est-ce ? : Où Maëlys tient-elle le planning ?'], r.a['Où est-ce ? : Où compte-t-on les colis ?']], ['n° 4', 'n° 6', 'n° 3'], 'p104-a : lieux');
  egal([r.f['Où est-ce ? : Où attendent les palettes déchargées ?'], r.f['Où est-ce ? : Où compte-t-on les colis ?'], r.f['Où est-ce ? : Où Maëlys tient-elle le planning ?']], ['n° 1', 'n° 6', 'n° 3'], 'p104-f : lieux');
  egal([r.a['Lecture : À quelle heure Loïc revient-il au quai ?'], r.a['Lecture : À quelle heure la livraison pour Ar Vag libère-t-elle son quai ?']], ['7 h 15', '10 h 30'], 'p104-a : lectures');
  egal(r.a['La carte d’Agri-Kerlann'], 'places justes : Quai A à 10 h 30, Quai A à 10 h 45, Quai A à 11 h', 'p104-a : carte');
  egal(r.f['La carte d’Agri-Kerlann'], 'places justes : Quai A à 10 h 30, Quai A à 10 h 45, Quai A à 11 h, Quai B à 11 h', 'p104-f : carte');
  vrai(r.a['La bonne réplique à Yann'] !== r.f['La bonne réplique à Yann'], 'la réplique ne suit pas le défaut');
  vrai(/pas encore ouvert/.test(r.texte) && r.communs === 6, 'corrigé commun');
  const rep = await pg.evaluate(async () => (await fetch('/contenus/corriges/ENT-10.4.js')).status);
  egal(rep, 200, 'le fichier de corrigé est servi');
});

// ─────────────────────────────────────────────────────────── aucune requête externe, aucune erreur
await v('ENT-10.4 : aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer();
}
