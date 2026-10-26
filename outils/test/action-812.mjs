// Suite de tests de Prepalog — bloc « action-812 » : ENT-8.12 Action, « l'inventaire tournant du matin » (CAP OL, guidage CAP-C1.5), deuxième séance du
// palettier à adresse donnée et première à compter (chantier E-7, lots 0, 1, 2 et 4). Brief `docs/briefs/ENT-8.12-action-inventaire-tournant.md` §8 ;
// décisions du chef de chantier : `docs/briefs/COORDINATION-palettier.md` §3. `PORT_TESTS=8132 node outils/test.mjs action-812` ne lance que ce bloc. Aides
// communes (ouvrir la page, lire la base) : `outils/test/france-boissons/commun.mjs`. Le plan se joue au clic (comme le bloc `palettier`) ; la fiche par
// `selectOption`.
//
// Valeurs ÉCRITES À LA MAIN. Formats de palette (cartons par couche × couches = palette pleine) : LES 3 × 3 × 4 = 36 · NET 2 × 4 × 5 = 40 · SER 2 × 4 × 5 = 40 ·
// CRO 2 × 4 × 4 = 32 · BOI 2 × 3 × 4 = 24 · CAH 2 × 3 × 5 = 30 · PEL 2 × 4 × 3 = 24. Deux élèves TÉMOINS (graine posée à la main dans `db.tirage`), relevés une
// fois le 22/10/2026 et recopiés ici (système = ce que croit le système ; réel = ce qu'il y a sur la palette) :
//   « temoin-1 » : 1 A2-T04-N1-E3 CAH manque (système 30, réel 26) · 2 B1-T03-N1-E1 LES ok 32 · 3 B1-T04-N1-E1 CRO ok 28 · 4 B1-T04-N1-E2 PEL ok 21 ·
//                  5 B2-T01-N1-E1 SER ok 35 · 6 B2-T03-N1-E1 BOI surplus (système 24, réel 25) · 7 (confirmé) A2-T01-N1-E1 NET manque (39 → 35).
//   « temoin-2 » : 1 A2-T01-N1-E2 SER manque (40 → 36) · 2 A2-T03-N1-E2 BOI ok 22 · 3 B1-T03-N1-E1 LES ok 34 · 4 B1-T04-N1-E1 CRO surplus (32 → 33) ·
//                  5 B1-T04-N1-E2 PEL ok 20 · 6 B2-T02-N1-E1 NET ok 36 · 7 (confirmé) A2-T04-N1-E3 CAH manque (30 → 26).
// Poids des jalons : scanAvant 2 · compte-1 à 6 : 5/6 chacun (= 5) · recompte-manque 1,5 + recompte-surplus 1,5 (les recompte-ok-* à 0) · fiche-signaler 3 ·
// fiche-cause 2 · forme du message 1 ; questions (part 4) : q-pourquoi 0,5, q-aveugle 0,5, q-colisage 0,75, q-que-faire 0,75, q-cause 0,75, q-argent 0,75
// (q-robot : réflexion, non notée).

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });
const CAPTURES = process.env.CAPTURES_ENT812 || '';

const ID = 'action-inventaire-tournant';
const EID = 'action-inventaire-tournant';
const GE = (g) => `entrepot:${EID}:${g}`;
const P = `${Z} .pal`;
const REP_OUV = { 'k-tournant': 'partie', 'k-annuel': 'tout', 'k-aveugle': 'sans-voir', 'k-ecart': 'difference', 'k-recompte': 'recompter', 'k-couche': 'juste',
  'k-par-carton': 'articles', 'k-inventoriste': 'compte', 'img-couche-dessus': 'incomplete', 'img-etiquette-lisse': 'adresse' };
const BONNES_Q = { 'q-pourquoi': 'juste', 'q-aveugle': 'sans-influence', 'q-colisage': 'juste', 'q-que-faire': 'signaler', 'q-cause': 'juste', 'q-argent': 'argent', 'q-robot': 'verifier' };
const FAUSSES_Q = { 'q-pourquoi': 'loi', 'q-aveugle': 'panne', 'q-colisage': 'somme', 'q-que-faire': 'corriger', 'q-cause': 'sens', 'q-argent': 'rien', 'q-robot': 'rien' };
const NOTEES = ['q-pourquoi', 'q-aveugle', 'q-colisage', 'q-que-faire', 'q-cause', 'q-argent'];
const GROUPES = ['Scanner avant de compter', 'Compter les cartons', 'Recompter quand ça ne colle pas', 'Signaler sans corriger soi-même', 'Une cause possible',
  'Le compte rendu à Samia', 'Les questions de Samia'];
const JALONS = ['scanAvant', 'compte-1', 'compte-2', 'compte-3', 'compte-4', 'compte-5', 'compte-6', 'recompte-manque', 'recompte-surplus', 'fiche-signaler', 'fiche-cause', 'samia-forme'];
const COMPTAGE = ['scanAvant', 'compte-1', 'compte-2', 'compte-3', 'compte-4', 'compte-5', 'compte-6', 'recompte-manque', 'recompte-surplus', 'recompte-ok1', 'recompte-ok2',
  'recompte-ok3', 'recompte-ok4'];
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus|bien vu)\b/i;
// `L` : la liste dans l'ordre (a : adresse, nom, k : produit, sys, reel, role) ; `bonus` : la 7e adresse du confirmé.
const T1 = { graine: 'temoin-1',
  L: [{ a: 'A2-T04-N1-E3', k: 'CAH', nom: 'Cahiers grand format', sys: 30, reel: 26, role: 'manque' }, { a: 'B1-T03-N1-E1', k: 'LES', nom: 'Lessive liquide 3 L', sys: 32, reel: 32, role: 'ok' },
    { a: 'B1-T04-N1-E1', k: 'CRO', nom: 'Croquettes pour chien 4 kg', sys: 28, reel: 28, role: 'ok' }, { a: 'B1-T04-N1-E2', k: 'PEL', nom: 'Peluches', sys: 21, reel: 21, role: 'ok' },
    { a: 'B2-T01-N1-E1', k: 'SER', nom: 'Serviettes de bain', sys: 35, reel: 35, role: 'ok' }, { a: 'B2-T03-N1-E1', k: 'BOI', nom: 'Boîtes de rangement 10 L', sys: 24, reel: 25, role: 'surplus' }],
  bonus: { a: 'A2-T01-N1-E1', k: 'NET', nom: 'Nettoyant multi-usages 1 L', sys: 39, reel: 35, role: 'bonus' } };
const T2 = { graine: 'temoin-2',
  L: [{ a: 'A2-T01-N1-E2', k: 'SER', nom: 'Serviettes de bain', sys: 40, reel: 36, role: 'manque' }, { a: 'A2-T03-N1-E2', k: 'BOI', nom: 'Boîtes de rangement 10 L', sys: 22, reel: 22, role: 'ok' },
    { a: 'B1-T03-N1-E1', k: 'LES', nom: 'Lessive liquide 3 L', sys: 34, reel: 34, role: 'ok' }, { a: 'B1-T04-N1-E1', k: 'CRO', nom: 'Croquettes pour chien 4 kg', sys: 32, reel: 33, role: 'surplus' },
    { a: 'B1-T04-N1-E2', k: 'PEL', nom: 'Peluches', sys: 20, reel: 20, role: 'ok' }, { a: 'B2-T02-N1-E1', k: 'NET', nom: 'Nettoyant multi-usages 1 L', sys: 36, reel: 36, role: 'ok' }],
  bonus: { a: 'A2-T04-N1-E3', k: 'CAH', nom: 'Cahiers grand format', sys: 30, reel: 26, role: 'bonus' } };
const adr = (T, r) => (r === 7 ? T.bonus : T.L[r - 1]);
const rangDe = (T, role) => T.L.findIndex((x) => x.role === role) + 1;
const SYS_T1 = T1.L.map((x) => x.sys);

// Monte la séance dans la page. `o.graine` : la graine posée (l'élève témoin) ; les réponses d'« Avant de commencer » sont posées (sauf `sansOuverture`).
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-inventaire-tournant.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (o.graine) db.tirage = { graine: o.graine, pose: 1 };
  if (o.rep) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ac812' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }), suivante: null,
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: o.sansOuverture ? null : REP_OUV, ...o });
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const Q = (s) => `${Z} ${s}`;
let capturer = false;
const capture = async (nom) => {
  if (!CAPTURES || !capturer) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(Q('[data-carte-fermer]')); await pause(40); }
  await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};
// Les questions : pour chacune, un verdict s'est-il affiché tout de suite (sinon : corrigée au bilan) ? L'ordre d'arrivée est noté.
const VERDICTS = {};
let VUS = [];
const panneau = () => pg.$eval(Q('[data-q-panneau]'), (e) => e.dataset.qPanneau).catch(() => null);
async function qrep(choix = BONNES_Q) {
  await pause(60);
  for (let i = 0; i < 8; i++) {
    const id = await panneau();
    if (!id) return;
    VUS.push(id);
    await pg.click(Q(`[data-q-choix="${choix[id]}"][data-q="${id}"]`));
    await pg.click(Q(`[data-q-repondre="${id}"]`));
    await pause();
    VERDICTS[id] = !!(await pg.$(Q('[data-q-verdict]')));
    await pg.click(Q('[data-q-reprendre]'));
    await pause();
  }
}
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(Q('[data-confirme-oui]')); await pause(); } };

// ① le comptage
const replier = async () => { if (await pg.$eval(`${P} [data-pe-regles]`, (d) => d.open).catch(() => false)) { await pg.click(`${P} [data-pe-regles] summary`); await pause(40); } };
const bouton = async (k) => { await replier(); await pg.click(`${P} [data-pal="${k}"]`); await pause(40); };
async function ouvrir(a) {
  await replier();
  if (await present('.pal [data-pal="retour"]')) await bouton('retour');
  await pg.click(`${P} [data-pe-trav="${a.slice(0, 6)}"]`); await pause(30);
  await pg.click(`${P} [data-pe-emp="${a}"]`); await pause(40);
}
const taper = async (n) => { await pg.fill(`${P} [data-vt-champ]`, String(n)); await pg.press(`${P} [data-vt-champ]`, 'Enter'); await pause(40); };
const choisirT = async (k) => { await pg.click(`${P} [data-vt-choix="${k}"]`); await pause(40); };
const actu = () => pg.$eval(`${P} [data-vt-actu]`, (e) => e.textContent.replace(/\s+/g, ' ').trim());
// Compter l'adresse de rang `r` : l'ouvrir, la scanner (le clic sur son étiquette), taper `n`, puis la suite (« recompter », « confirmer », un autre nombre…).
async function compter(T, r, n, suite = [], choix = BONNES_Q) {
  await allerV('entrepot');
  await ouvrir(adr(T, r).a);
  await pg.click(`${P} [data-pal-compte-emp]`); await pause(40); await qrep(choix);
  await taper(n); await qrep(choix);
  for (const k of suite) { if (typeof k === 'number') await taper(k); else await choisirT(k); await qrep(choix); }
}
async function terminer(choix = BONNES_Q) {
  await allerV('entrepot');
  if (await present('.pal [data-pal="retour"]')) await bouton('retour');
  await bouton('terminer');
  if (await present('.pal [data-pal="finOui"]')) await bouton('finOui');
  await qrep(choix);
}
// Le parcours juste du comptage : chaque adresse comptée juste ; sur les écarts réels, « Recompter », le même nombre, puis « Confirmer ». `o.sans` : rangs laissés.
async function compterJuste(T, o = {}) {
  const rangs = [1, 2, 3, 4, 5, 6, ...(o.p7 ? [7] : [])].filter((r) => !(o.sans || []).includes(r));
  for (const r of rangs) { const x = adr(T, r); await compter(T, r, x.reel, x.reel !== x.sys ? ['recompter', x.reel, 'confirmer'] : [], o.q); }
}
const etatC = () => pg.evaluate((EID) => JSON.parse(JSON.stringify(((window.__f.db.entrepots || {})[EID] || {}).comptage || null)), EID);

// ② la fiche « Mes écarts » : `rep` = { 'faire-1': 'signaler', 'cause-1': 'abimes', … }
const CAUSE_JUSTE = { manque: 'abimes', surplus: 'dessus' };
const ecartsDe = (T, comptes, p7 = false) => (p7 ? ecartsDe6(T, comptes).concat([{ r: 7, sens: 'manque' }]) : ecartsDe6(T, comptes));
const ecartsDe6 = (T, comptes) => T.L.map((x, i) => ({ r: i + 1, x })).filter(({ r, x }) => (comptes ? comptes[r] : x.reel) != null && (comptes ? comptes[r] : x.reel) !== x.sys)
  .map(({ r, x }) => ({ r, sens: (comptes ? comptes[r] : x.reel) < x.sys ? 'manque' : 'surplus' }));
const repFiche = (ecarts, o = {}) => Object.fromEntries(ecarts.flatMap((e) => [[`faire-${e.r}`, (o.faire && o.faire[e.r]) || 'signaler'], [`cause-${e.r}`, (o.cause && o.cause[e.r]) || CAUSE_JUSTE[e.sens]]]));
async function fiche(rep, choix = BONNES_Q) {
  await allerV('fiche');
  for (const [id, val] of Object.entries(rep)) { await pg.selectOption(Q(`[data-fiche-champ="${id}"]`), val); await pause(30); }
  await capture('5-fiche');
  await pg.click(Q('[data-fiche-envoyer]')); await confirmer();
  await qrep(choix);
}
// ③ le message de compte rendu
async function ouvrirMail(sujet) {
  await allerV('mail');
  await pg.click(Q('[data-dossier="in"]'));
  await pg.click(Q(`.ent-obj:text-is("${sujet}")`));
  await pause();
}
const choixDe = (ligne) => pg.$$eval(Q(`[data-phrase="${ligne}"] option`), (L) => L.map((x) => x.textContent.trim()).filter((t) => t && !/^Choisir/.test(t)));
const bilanJuste = (n, e) => `${n} adresse${n > 1 ? 's' : ''} comptée${n > 1 ? 's' : ''}, ${e} écart${e > 1 ? 's' : ''} signalé${e > 1 ? 's' : ''} dans la fiche.`;
const PHR = (n, e, prenom = 'Lea') => ({ salutation: 'Bonjour Samia,', bilan: bilanJuste(n, e), fin: prenom });
async function repondreSamia(lignes, choix = BONNES_Q, deja = false) {
  if (!deja) { await ouvrirMail('Un mot pour finir'); await pg.click(Q('[data-repondre]')); }
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  for (const [l, t] of Object.entries(lignes)) { await pg.selectOption(Q(`[data-phrase="${l}"]`), { label: t }); await qrep(choix); }
  await capture('6-message');
  await pg.click(Q('#formPhr button[type="submit"]'));
  await confirmer();
  await qrep(choix);
}
// Le parcours juste complet d'un témoin (standard : 6 adresses ; `o.p7` : la 7e aussi, confirmé).
async function parcours(T, o = {}) {
  await compterJuste(T, o);
  await terminer(o.q);
  const E = ecartsDe(T, null, !!o.p7);
  await fiche(o.rep || repFiche(E), o.q);
  await repondreSamia(o.phrases || PHR(o.p7 ? 7 : 6, E.length), o.q);
}
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { fin: b.dataset.fin, lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]),
    corriger: !!b.querySelector('[data-fin-corriger]'), fige: !!b.querySelector('[data-fin-fige]'), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});
const cases = () => pg.$$eval(Q('[data-fin-case]'), (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.textContent.replace(/\s+/g, ' ').trim(),
  l.querySelector('[data-fin-aller]')?.dataset.finAller || '']));
const jalonsFaux = (n, liste = JALONS) => liste.filter((j) => n.detail[j] !== 'ok');
const nouveau = () => { VUS = []; Object.keys(VERDICTS).forEach((k) => delete VERDICTS[k]); };
// Les nombres cherchés partout dans la page (texte, attributs, valeur des champs), sauf la géométrie du dessin : « 30 » n'est pas trouvé dans « 130.5 » ni dans « A2-T04 ».
const fuite = (nombres) => pg.evaluate((nombres) => {
  const GEO = new Set(['points', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'viewbox', 'd', 'transform', 'rx', 'ry', 'r', 'cx', 'cy',
    'font-size', 'stroke-width', 'stroke-dasharray', 'opacity', 'style', 'patterntransform', 'letter-spacing', 'maxlength', 'tabindex', 'stroke', 'fill']);
  const re = nombres.map((n) => [n, new RegExp(`(^|[^\\d.,])${n}(?![\\d.,])`)]);
  const vus = [];
  const test = (ou, s) => re.forEach(([n, r]) => { if (r.test(s)) vus.push(`${n} dans ${ou} : ${String(s).trim().slice(0, 70)}`); });
  const walk = (el) => {
    for (const a of el.attributes || []) if (!GEO.has(a.name.toLowerCase())) test(`${el.tagName.toLowerCase()}[${a.name}]`, a.value);
    if (el.tagName === 'INPUT') test('input.value', el.value);
    for (const c of el.childNodes) { if (c.nodeType === 3) test(`texte de ${el.tagName.toLowerCase()}`, c.nodeValue); else if (c.nodeType === 1) walk(c); }
  };
  walk(document.querySelector('#fTest'));
  return vus;
}, nombres);

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-8.12 : déclaration (CAP, C1.5, guidage, 20 points, parcours après ENT-8.11) ; poids par bloc (somme 20 avec la part 4) ; fiche jalonnée par la séance ; questions rebranchées ; comptage avec Terminal', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-inventaire-tournant.js');
    const S = await import('/contenus/action-ent812.js');
    const Qs = await import('/contenus/questions/ENT-8.12.js');
    const D = await import('/contenus/action-ent812-donnees.js');
    const m = A.meta, E = S.ETAPES.filter((e) => !e.bonus), B = S.ETAPES.filter((e) => e.bonus);
    const poidsDe = (e) => (e.compte === false ? 0 : e.poids);
    const decl = (n) => { const x = D.entrepotDe('temoin-1', { niveau: n }); return [x.id, x.mode, x.aideCharge, x.verdict, JSON.stringify(x.terminal), x.palettes, x.personnage.texte,
      !!x.regles, !!x.regles.ouvertes, x.comptage.adresses.map((a) => a.cle + (a.niveaux ? '*' : '')).join(' '), x.comptage.recompte, !!x.comptage.aideCouche]; };
    const { creerEntrepot } = await import('/core/types/entrepot.js');
    return {
      m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.parcours, m.correction, m.bilanDetail, m.precedente,
        m.niveauxPrevus, m.questions, m.ouverture, m.corrige, m.pret],
      ids: E.map((e) => e.id), poids: E.map(poidsDe), somme: E.reduce((t, e) => t + poidsDe(e), 0), part: Qs.QUESTIONS.part,
      parGroupe: Object.entries(E.filter((e) => e.compte !== false).reduce((o, e) => { o[e.groupe] = (o[e.groupe] || 0) + e.poids; return o; }, {})).map(([g, p]) => [g, Math.round(p * 100) / 100]),
      gardes: E.filter((e) => e.compte === false).map((e) => [e.id, e.poids, e.groupe]),
      ecrans: [...new Set(E.filter((e) => e.ecran).map((e) => e.ecran))], bonus: B.map((e) => [e.id, e.poids, e.groupe]),
      qFil: Qs.QUESTIONS.liste.filter((x) => x.type === 'fil').map((x) => [x.id, x.de, x.reflexion ? 'reflexion' : x.poids, x.apres || 'tout de suite', (x.quand.gestes || []).length]),
      gestesQ: Object.fromEntries(Qs.QUESTIONS.liste.filter((x) => x.type === 'fil').map((x) => [x.id, (x.quand.gestes || []).slice(0, 2)])),
      ouv: [Qs.QUESTIONS.ouverture.tirage, Qs.QUESTIONS.ouverture.questions.length],
      decl: { standard: decl('standard'), accompagne: decl('accompagne'), confirme: decl('confirme') },
      signaux: creerEntrepot(D.entrepotDe('temoin-1')).signaux,
      fin: S.OPTIONS.finFige, fiche: [S.OPTIONS.fiche.id, typeof S.OPTIONS.fiche.blocs, typeof S.OPTIONS.fiche.quand],
      formes: Object.fromEntries(D.PRODUITS_BANQUE.map((k) => [k, [D.FORMATS[k].couche, D.FORMATS[k].couches, D.pleine(k), D.PRODUITS[k].cartons]])),
    };
  });
  egal(r.m, ['action-inventaire-tournant', 'ENT-8.12', 'simulog', ['cap'], [], ['CAP-C1.5'], 'guidage', 20, true, true, true, 'action-ranger',
    ['confirme', 'accompagne'], 'ENT-8.12', 'prof', './contenus/corriges/ENT-8.12.js', true], 'meta ENT-8.12 (livrée : pret true, ouverte par l’enseignant)');
  egal(r.ids, ['scanAvant', 'compte-1', 'compte-2', 'compte-3', 'compte-4', 'compte-5', 'compte-6', 'recompte-manque', 'recompte-surplus', 'recompte-ok1', 'recompte-ok2',
    'recompte-ok3', 'recompte-ok4', 'fiche-signaler', 'fiche-cause', 'samia-forme'], 'jalons du socle');
  egal(r.poids.map((p) => Math.round(p * 1e6) / 1e6), [2, 0.833333, 0.833333, 0.833333, 0.833333, 0.833333, 0.833333, 1.5, 1.5, 0, 0, 0, 0, 3, 2, 1], 'poids jalon par jalon (écrits à la main)');
  proche(r.somme + r.part, 20, 'somme des poids des jalons et des questions');
  egal(r.parGroupe, [['Scanner avant de compter', 2], ['Compter les cartons', 5], ['Recompter quand ça ne colle pas', 3], ['Signaler sans corriger soi-même', 3], ['Une cause possible', 2],
    ['Le compte rendu à Samia', 1]], 'points par ligne du bandeau (brief §5)');
  egal(r.gardes, [['recompte-ok1', 0, undefined], ['recompte-ok2', 0, undefined], ['recompte-ok3', 0, undefined], ['recompte-ok4', 0, undefined]], 'recomptes des adresses conformes : jugés, sans point ni ligne');
  egal(r.ecrans, ['fiche:ecarts', 'phrases:samia'], '« Corriger » rouvre la fiche et le message ; jamais le comptage');
  egal(r.bonus, [['compte-7', undefined, undefined], ['recompte-bonus', undefined, undefined]], 'la 7e adresse : deux cas bonus, sans poids ni groupe');
  egal(r.qFil, [['q-pourquoi', 'samia', 0.5, 'tout de suite', 1], ['q-aveugle', 'samia', 0.5, 'tout de suite', 7], ['q-colisage', 'samia', 0.75, 'tout de suite', 7],
    ['q-que-faire', 'samia', 0.75, 'bilan', 0], ['q-cause', 'samia', 0.75, 'bilan', 0], ['q-argent', 'samia', 0.75, 'tout de suite', 0], ['q-robot', 'samia', 'reflexion', 'tout de suite', 1]], 'questions au fil');
  egal(r.gestesQ, { 'q-pourquoi': [GE('compte:scan')], 'q-aveugle': [GE('compte:1'), GE('compte:2')], 'q-colisage': [GE('compte:1'), GE('compte:2')], 'q-que-faire': [], 'q-cause': [],
    'q-argent': [], 'q-robot': [GE('compte:fin')] }, 'gestes rebranchés');
  egal(r.ouv, [{ preparation: 3, image: 1 }, 10], 'Avant de commencer : 10 notions, 3 + 1 tirées');
  const base = [EID, 'palettier', undefined, 'critere', '{"nom":"Terminal"}', undefined, 'Compte les adresses de la liste.'];
  egal(r.decl.standard, [...base, true, true, 'manque ok1 ok2 ok3 ok4 surplus bonus*', 'ecart', false], 'standard : comptage au Terminal, règles dépliées, verdict « critere », sans palettes ni aide');
  egal(r.decl.accompagne.slice(7), [true, true, 'manque ok1 ok2 ok3 ok4 surplus bonus*', 'ecart', true], 'accompagné : en plus le nombre de cartons par couche');
  egal(r.decl.confirme.slice(7), [true, false, 'manque ok1 ok2 ok3 ok4 surplus bonus*', 'ecart', false], 'confirmé : comme le standard (la 7e adresse est dans la déclaration, marquée)');
  egal(r.signaux, [GE('ouvrir'), ...[1, 2, 3, 4, 5, 6, 7].map((k) => GE(`compte:${k}`)), GE('compte:scan'), GE('compte:fin')], 'gestes publiés par le plan');
  egal(r.fin, 'Ton comptage est terminé : il ne se refait pas.', 'finFige');
  egal(r.fiche, ['ecarts', 'function', 'function'], 'la fiche est une fonction de la base et attend la fin du comptage');
  egal(r.formes, { LES: [[3, 3], 4, 36, 36], NET: [[2, 4], 5, 40, 40], SER: [[2, 4], 5, 40, 40], CRO: [[2, 4], 4, 32, 32], BOI: [[2, 3], 4, 24, 24], CAH: [[2, 3], 5, 30, 30], PEL: [[2, 4], 3, 24, 24] },
    'formats de palette : le même nombre de cartons qu’ENT-8.11');
});

// ─────────────────────────────────────────────────────────── le tirage et l'équité
await v('ENT-8.12 : tirage — 200 graines : zéro secours ; 1 manque, 1 surplus, 4 conformes ; sept produits distincts ; liste dans l’ordre de l’allée ; couche du dessus jamais vide ni pleine (sauf le surplus) ; écarts 2-4 / 1-3 ; chaque rôle sur des adresses et des rangs variés', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent812-donnees.js');
    const { tirerJeu } = await import('/core/tirage.js');
    // Écrits à la main : produit de chaque adresse de la banque, format (par couche, couches).
    const PRODUIT = { 'A1-T03-N1-E2': 'LES', 'B1-T03-N1-E1': 'LES', 'A2-T01-N1-E1': 'NET', 'B2-T02-N1-E1': 'NET', 'A2-T01-N1-E2': 'SER', 'B2-T01-N1-E1': 'SER', 'A2-T03-N1-E1': 'CRO',
      'B1-T04-N1-E1': 'CRO', 'A2-T03-N1-E2': 'BOI', 'B2-T03-N1-E1': 'BOI', 'A2-T04-N1-E3': 'CAH', 'B1-T04-N1-E2': 'PEL' };
    const FMT = { LES: [9, 4], NET: [8, 5], SER: [8, 5], CRO: [8, 4], BOI: [6, 4], CAH: [6, 5], PEL: [8, 3] };
    const o = { secours: 0, nonConforme: 0, roles: 0, produits: 0, ordre: 0, dessus: 0, ecart: 0, banque: 0, deuxFois: 0, manque: {}, surplus: {}, rangM: {}, rangS: {}, produitsVus: {}, ecartsM: {}, ecartsS: {} };
    for (let i = 0; i < 200; i++) {
      const t = tirerJeu(D.TIRAGE, `eleve-${i}|action-inventaire-tournant`), j = t.jeu, L = j.liste, tous = [...L, j.bonus];
      if (t.secours) o.secours++;
      if (D.verifier(j).length) o.nonConforme++;
      const n = (r) => L.filter((x) => x.role === r).length;
      if (n('manque') !== 1 || n('surplus') !== 1 || n('ok') !== 4 || L.length !== 6 || j.bonus.role !== 'bonus') o.roles++;
      if (new Set(tous.map((x) => x.produit)).size !== 7) o.produits++;
      if (new Set(tous.map((x) => x.adresse)).size !== 7) o.deuxFois++;
      if (tous.some((x) => PRODUIT[x.adresse] !== x.produit)) o.banque++;
      if (L.some((x, k) => k && L[k - 1].adresse >= x.adresse)) o.ordre++;
      tous.forEach((x) => {
        const [par, couches] = FMT[x.produit], plein = par * couches, bas = plein - par, e = x.reel - x.systeme;
        if (x.reel <= bas) o.dessus++;
        if (x.role === 'ok' && (e !== 0 || x.reel >= plein || x.reel - bas < 2)) o.dessus++;
        if ((x.role === 'manque' || x.role === 'bonus') && (e < -4 || e > -2 || x.reel >= plein)) o.ecart++;
        if (x.role === 'surplus' && (x.systeme !== plein || e < 1 || e > 3)) o.ecart++;
        if (x.role === 'manque') { o.manque[x.adresse] = 1; o.rangM[x.rang] = (o.rangM[x.rang] || 0) + 1; o.ecartsM[-e] = (o.ecartsM[-e] || 0) + 1; }
        if (x.role === 'surplus') { o.surplus[x.adresse] = 1; o.rangS[x.rang] = (o.rangS[x.rang] || 0) + 1; o.ecartsS[e] = (o.ecartsS[e] || 0) + 1; }
        o.produitsVus[x.produit] = (o.produitsVus[x.produit] || 0) + 1;
      });
    }
    return { ...o, manque: Object.keys(o.manque).length, surplus: Object.keys(o.surplus).length };
  });
  egal([r.secours, r.nonConforme, r.roles, r.produits, r.ordre, r.dessus, r.ecart, r.banque, r.deuxFois], [0, 0, 0, 0, 0, 0, 0, 0, 0],
    'secours, non conformes, rôles, produits, ordre, couche du dessus, écarts, hors banque, adresse en double');
  vrai(r.manque >= 9 && r.surplus >= 9, `le manque et le surplus tombent sur au moins 9 des 12 adresses : ${r.manque} et ${r.surplus}`);
  vrai([1, 2, 3, 4, 5, 6].every((k) => (r.rangM[k] || 0) >= 15 && (r.rangS[k] || 0) >= 15), `chaque rang de la liste porte le manque et le surplus au moins 15 fois : ${JSON.stringify(r.rangM)} ${JSON.stringify(r.rangS)}`);
  egal([Object.keys(r.ecartsM).sort(), Object.keys(r.ecartsS).sort()], [['2', '3', '4'], ['1', '2', '3']], 'les écarts tirés : manque 2 à 4, surplus 1 à 3');
  vrai(Object.keys(r.ecartsM).every((k) => r.ecartsM[k] >= 20) && Object.keys(r.ecartsS).every((k) => r.ecartsS[k] >= 20), 'chaque taille d’écart sort au moins 20 fois');
  egal(Object.keys(r.produitsVus).sort(), ['BOI', 'CAH', 'CRO', 'LES', 'NET', 'PEL', 'SER'], 'les sept produits sortent');
});

await v('ENT-8.12 : contrôle d’équité — `verifier` refuse deux manques, un surplus mal formé, un produit en double, une liste dans le désordre, une couche du dessus pleine ou vide, un écart hors bornes ; témoins et référence passent ; les témoins sont ceux recopiés', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent812-donnees.js');
    const j = () => JSON.parse(JSON.stringify(D.jeuDe('temoin-1')));
    const deuxManques = j(); deuxManques.liste[1].role = 'manque';
    const surplus = j(); surplus.liste[5].systeme = 23; surplus.liste[5].reel = 24;
    const double = j(); double.liste[2].produit = 'LES'; double.liste[2].adresse = 'A1-T03-N1-E2';
    const desordre = j(); desordre.liste.reverse();
    const pleine = j(); pleine.liste[1].systeme = 36; pleine.liste[1].reel = 36;
    const vide = j(); vide.liste[1].systeme = 27; vide.liste[1].reel = 27;
    const petit = j(); petit.liste[0].reel = 29;
    const trop = j(); trop.liste[0].reel = 24;
    const t1 = D.jeuDe('temoin-1'), t2 = D.jeuDe('temoin-2');
    const res = (jeu) => jeu.liste.concat([jeu.bonus]).map((x) => [x.adresse, x.produit, x.role, x.systeme, x.reel]);
    return { deuxManques: D.verifier(deuxManques), surplus: D.verifier(surplus), double: D.verifier(double), desordre: D.verifier(desordre), pleine: D.verifier(pleine), vide: D.verifier(vide),
      petit: D.verifier(petit), trop: D.verifier(trop), bons: [D.verifier(t1), D.verifier(t2), D.verifier(D.jeuDe(''))], t1: res(t1), t2: res(t2) };
  });
  vrai(r.deuxManques.some((x) => /rôles/.test(x)), 'deux manques : ' + r.deuxManques);
  vrai(r.surplus.some((x) => /surplus mal formé/.test(x)), 'surplus non plein : ' + r.surplus);
  vrai(r.double.some((x) => /produit en double/.test(x)), 'produit en double : ' + r.double);
  vrai(r.desordre.some((x) => /ordre de l’allée/.test(x)), 'liste dans le désordre : ' + r.desordre);
  vrai(r.pleine.some((x) => /conforme mal formée/.test(x)), 'conforme à couche du dessus pleine : ' + r.pleine);
  vrai(r.vide.some((x) => /couche du dessus vide/.test(x)), 'couche du dessus vide : ' + r.vide);
  vrai(r.petit.some((x) => /manque mal formé/.test(x)) && r.trop.some((x) => /manque mal formé/.test(x)), `manque de 1 ou de 6 cartons : ${r.petit} / ${r.trop}`);
  egal(r.bons, [[], [], []], 'témoins et référence conformes');
  egal(r.t1, [...T1.L, T1.bonus].map((x) => [x.a, x.k, x.role, x.sys, x.reel]), 'témoin 1');
  egal(r.t2, [...T2.L, T2.bonus].map((x) => [x.a, x.k, x.role, x.sys, x.reel]), 'témoin 2');
});

// ─────────────────────────────────────────────────────────── jalons sur bases fabriquées
// Une base : le comptage d'un témoin (`comptes` : rang → nombre confirmé ; `prop` : rang → propositions du Terminal ; `rec` : rang → « Recompter » choisis), la fiche envoyée (`fiche` :
// valeurs ; `null` = pas envoyée).
const baseDe = (T, { comptes, prop = {}, rec = {}, fini = true, fiche = null, aisance = 'standard', mails = [] }) => ({ tirage: { graine: T.graine }, aisance,
  entrepots: { [EID]: { comptage: { scanne: null, enCours: null, comptes, premiers: comptes, propositions: prop, recomptes: rec, horsListe: [], sansScan: 0, fini, at: 1 } } },
  fiches: fiche ? { ecarts: { valeurs: fiche, envoye: { at: 1 } } } : {}, mails });
const juger = (db) => pg.evaluate(async (db) => {
  const S = await import('/contenus/action-ent812.js');
  return Object.fromEntries(S.ETAPES.map((e) => { const s = e.verifier(db); return [e.id, s ? s.status : null]; }));
}, db);
const faux = (J) => Object.entries(J).filter(([k, s]) => s === 'ko').map(([k]) => k);
const JUSTES1 = { 1: 26, 2: 32, 3: 28, 4: 21, 5: 35, 6: 25 };
const PROP1 = { 1: 1, 6: 1 }, REC1 = { 1: 1, 6: 1 };
const FICHE1 = { 'faire-1': 'signaler', 'cause-1': 'abimes', 'faire-6': 'signaler', 'cause-6': 'dessus' };

await v('ENT-8.12 : jalons (bases fabriquées) — tout juste ✓ ; rien avant « Terminer » ni avant l’envoi → à faire ; une erreur ne se paie qu’une fois (écart manqué : sa fiche, plus courte, reste ✓ ; compte faux sur une adresse conforme : sa ligne est jugée comme les autres)', async () => {
  const juste = await juger(baseDe(T1, { comptes: JUSTES1, prop: PROP1, rec: REC1, fiche: FICHE1 }));
  const sansBonus = Object.entries(juste).filter(([k]) => !['samia-forme', 'compte-7', 'recompte-bonus'].includes(k));
  egal(sansBonus.map(([k, s]) => s), sansBonus.map(() => 'ok'), 'tout juste');
  egal(sansBonus.length, 15, 'quinze jalons du socle jugés (le seizième, le message, attend l’envoi)');
  egal([juste['samia-forme'], juste['compte-7'], juste['recompte-bonus']], ['attente', null, null], 'rien envoyé au message ; la 7e adresse : null chez qui ne l’a pas');
  // Avant « Terminer » : tout le comptage est à faire ; la fiche aussi.
  const avant = await juger(baseDe(T1, { comptes: { 1: 26 }, prop: { 1: 1 }, rec: { 1: 1 }, fini: false }));
  egal(Object.entries(avant).filter(([k, s]) => s !== 'attente' && s !== null).map(([k]) => k), [], 'avant « Terminer » : tout à faire');
  // Terminé, fiche non envoyée : le comptage est jugé, la fiche à faire.
  const sansFiche = await juger(baseDe(T1, { comptes: JUSTES1, prop: PROP1, rec: REC1 }));
  egal([sansFiche['fiche-signaler'], sansFiche['fiche-cause'], sansFiche['compte-1']], ['attente', 'attente', 'ok'], 'fiche non envoyée : à faire');
  // Écart manqué : le manque compté comme le système (rien n'est proposé), le surplus juste. Sa fiche n'a qu'UNE ligne : elle reste ✓ (l'erreur est payée au compte).
  const manque = await juger(baseDe(T1, { comptes: { ...JUSTES1, 1: 30 }, prop: { 6: 1 }, rec: { 6: 1 }, fiche: { 'faire-6': 'signaler', 'cause-6': 'dessus' } }));
  egal(faux(manque), ['compte-1'], 'écart manqué : compte-1 seul est faux (recompte-manque ✓ : rien n’était proposé ; fiche ✓ sur sa seule ligne)');
  // Compte faux confirmé sur une adresse conforme (31 au lieu de 32) : TROIS lignes ; sa ligne est jugée comme les autres, selon SON sens (il manque 1).
  const conforme = await juger(baseDe(T1, { comptes: { ...JUSTES1, 2: 31 }, prop: { ...PROP1, 2: 1 }, rec: REC1,
    fiche: { ...FICHE1, 'faire-2': 'signaler', 'cause-2': 'abimes' } }));
  egal(faux(conforme), ['compte-2', 'recompte-ok1'], 'compte faux confirmé sur une adresse conforme : son compte et son recompte (sans point) ; sa ligne signalée, sa cause selon le sens : ✓');
  const sens = await juger(baseDe(T1, { comptes: { ...JUSTES1, 2: 31 }, prop: { ...PROP1, 2: 1 }, rec: REC1,
    fiche: { ...FICHE1, 'faire-2': 'signaler', 'cause-2': 'dessus' } }));
  egal(faux(sens), ['compte-2', 'recompte-ok1', 'fiche-cause'], 'cause du mauvais sens sur sa ligne (« posés dessus » pour un manque) : fiche-cause ✗ seul');
  const surplus = await juger(baseDe(T1, { comptes: { ...JUSTES1, 3: 29 }, prop: { ...PROP1, 3: 1 }, rec: REC1, fiche: { ...FICHE1, 'faire-3': 'signaler', 'cause-3': 'dessus' } }));
  egal(faux(surplus), ['compte-3', 'recompte-ok2'], '29 au lieu de 28 : « il y a trop de cartons » ; « posés dessus » est la bonne cause de CE sens');
});

await v('ENT-8.12 : jalons du recomptage — écart trouvé du premier coup puis « Confirmer » sans recompter ✗ ; « Recompter » puis même nombre ✓ ; adresse non comptée ✗ ; aucun jalon « à faire » après « Terminer »', async () => {
  const sans = await juger(baseDe(T1, { comptes: JUSTES1, prop: PROP1, rec: { 6: 1 }, fiche: FICHE1 }));
  egal(faux(sans), ['recompte-manque'], 'manque confirmé sans « Recompter » : recompte-manque ✗, le compte reste ✓');
  const avec = await juger(baseDe(T1, { comptes: JUSTES1, prop: PROP1, rec: REC1, fiche: FICHE1 }));
  egal(faux(avec), [], '« Recompter » puis « Confirmer » : ✓');
  const nonCompte = await juger(baseDe(T1, { comptes: { 2: 32, 3: 28, 4: 21, 5: 35, 6: 25 }, prop: { 6: 1 }, rec: { 6: 1 }, fiche: { 'faire-6': 'signaler', 'cause-6': 'dessus' } }));
  egal(faux(nonCompte).sort(), ['compte-1', 'recompte-manque'].sort(), 'adresse à écart non comptée : compte ✗ et recompte ✗ (règle unique)');
  const rien = await juger(baseDe(T1, { comptes: {}, fiche: {} }));
  vrai(COMPTAGE.every((j) => rien[j] === 'ko'), 'rien compté après « Terminer » : tout le comptage ✗, aucun « à faire » : ' + JSON.stringify(rien));
  egal(faux(rien).includes('scanAvant'), true, 'scanAvant ✗ si rien n’est compté (l’inaction ne gagne rien)');
});

await v('ENT-8.12 : jalons de la fiche — « je corrige le stock moi-même » ✗ ; « je ne dis rien » ✗ ; une cause juste de l’autre réponse juste ✓ ; une fiche SANS ligne (aucun écart confirmé) → les deux ✗', async () => {
  const tel = (f) => juger(baseDe(T1, { comptes: JUSTES1, prop: PROP1, rec: REC1, fiche: { ...FICHE1, ...f } }));
  egal(faux(await tel({ 'faire-1': 'corriger' })), ['fiche-signaler'], '« corriger » sur une ligne : fiche-signaler ✗ seul');
  egal(faux(await tel({ 'faire-6': 'rien' })), ['fiche-signaler'], '« rien » sur une ligne : fiche-signaler ✗ seul');
  egal(faux(await tel({ 'cause-1': 'ailleurs', 'cause-6': 'saisie' })), [], 'l’autre réponse juste de chaque sens : ✓');
  egal(faux(await tel({ 'cause-1': 'pluie' })), ['fiche-cause'], 'une cause absurde : fiche-cause ✗ seul');
  const aucune = await juger(baseDe(T1, { comptes: { 1: 30, 2: 32, 3: 28, 4: 21, 5: 35, 6: 24 }, prop: {}, fiche: {} }));
  egal([aucune['fiche-signaler'], aucune['fiche-cause'], aucune['compte-1'], aucune['compte-6']], ['ko', 'ko', 'ko', 'ko'], 'fiche sans ligne : les deux ✗ (il n’a rien trouvé) ; ses comptes aussi');
});

await v('ENT-8.12 : le message à Samia — le bilan est calculé sur SES comptes (adresses comptées, écarts de SA fiche) ; la forme se juge sur la salutation et la fin seules', async () => {
  const r = await pg.evaluate(async ({ T1 }) => {
    const S = await import('/contenus/action-ent812.js');
    const { preparerPhrases } = await import('/core/phrases.js');
    const comptage = (comptes) => ({ scanne: null, enCours: null, comptes, premiers: comptes, propositions: {}, recomptes: {}, horsListe: [], sansScan: 0, fini: true, at: 1 });
    const baseDe = (comptes) => ({ tirage: { graine: T1.graine }, entrepots: { 'action-inventaire-tournant': { comptage: comptage(comptes) } }, mails: [] });
    const lignes = (db) => { const m = preparerPhrases({ phrases: S.phrasesSamia('Lea') }, db, 'g'); return { m, L: Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix[l.juste]])), bilan: m.phrases.lignes.find((l) => l.id === 'bilan').choix }; };
    const trois = lignes(baseDe({ 1: 26, 2: 31, 3: 28, 4: 21, 5: 35, 6: 25 }));       // trois écarts : le manque, un compte faux sur une conforme, le surplus
    const quatre = lignes(baseDe({ 1: 26, 2: 32, 3: 28, 6: 25 }));                      // quatre adresses comptées, deux écarts
    const aucun = lignes(baseDe({ 1: 30, 2: 32 }));                                      // deux adresses comptées, aucun écart
    const un = lignes(baseDe({ 1: 26 }));                                                // une adresse comptée, un écart : le singulier
    const forme = S.ETAPES.find((e) => e.id === 'samia-forme');
    const envoi = (db, m, choix) => ({ ...db, mails: [{ folder: 'in', phrases: m.phrases }, { folder: 'out', ts: 1, id: 1, phrases: { id: 'samia', choix } }] });
    const db3 = baseDe({ 1: 26, 2: 31, 3: 28, 4: 21, 5: 35, 6: 25 });
    const juste = trois.m.phrases.lignes.find((l) => l.id === 'bilan').juste;
    return { trois: trois.L, quatre: quatre.L.bilan, aucun: [aucun.L.bilan, aucun.bilan], un: un.L.bilan, bilan3: trois.bilan,
      formeOk: forme.verifier(envoi(db3, trois.m, { salutation: 0, bilan: (juste + 1) % 3, fin: 0 })).status,
      salutationKo: forme.verifier(envoi(db3, trois.m, { salutation: 1, bilan: juste, fin: 0 })).status,
      finKo: forme.verifier(envoi(db3, trois.m, { salutation: 0, bilan: juste, fin: 2 })).status, rien: forme.verifier(db3).status };
  }, { T1 });
  egal(r.trois, { salutation: 'Bonjour Samia,', bilan: '6 adresses comptées, 3 écarts signalés dans la fiche.', fin: 'Lea' }, 'les phrases justes : trois écarts (dont un compte faux confirmé)');
  egal(r.quatre, '4 adresses comptées, 2 écarts signalés dans la fiche.', 'quatre adresses comptées seulement : quatre');
  egal(r.aucun[0], '2 adresses comptées, 0 écart signalé dans la fiche.', 'aucun écart : « 0 écart »');
  vrai(r.aucun[1].includes('Il y a des écarts partout.') && !r.aucun[1].includes('Tout est bon.'), 'sans écart, le piège n’est pas « Tout est bon. » (qui serait juste) : ' + r.aucun[1]);
  egal(r.un, '1 adresse comptée, 1 écart signalé dans la fiche.', 'le singulier');
  egal(r.bilan3.length, 3, 'trois choix pour le bilan : ' + r.bilan3);
  egal([r.formeOk, r.salutationKo, r.finKo, r.rien], ['ok', 'ko', 'ko', 'attente'], 'la forme : salutation et fin ; le bilan faux ne la fait pas tomber ; rien d’envoyé = à faire');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await v('ENT-8.12 : parcours juste à l’écran (témoin 1, standard) — 20 / 20 ; l’aveugle tient avant « Terminer » ; la fiche attend la fin ; questions aux bons gestes ; Samia écrit à « Terminer » puis à la fiche', async () => {
  capturer = true; nouveau();
  await monter({ uid: 'ac812-juste', graine: T1.graine, sansOuverture: true });
  const ov = (await base()).questions[ID]['@tirage'].ids;
  egal([ov.length, ov.filter((id) => /^img-/.test(id)).length], [4, 1], '3 notions et 1 image tirées');
  for (let k = 0; k < 4; k++) {
    await pg.click(Q(`[data-ouv-aller="${k}"]`)); await pause();
    if (k === 0) await capture('0-avant-de-commencer');
    await pg.click(Q(`[data-q-choix="${REP_OUV[ov[k]]}"][data-q="${ov[k]}"]`));
    await pg.click(Q(`[data-q-repondre="${ov[k]}"]`)); await pause();
  }
  await pg.click(Q('[data-ouv-continuer]')); await pause();
  await capture('1-accueil');
  const M0 = await entrants();
  egal(M0.map((m) => m.subject), ['Ce matin : l’inventaire'], 'le message d’accueil de Samia');
  vrai(/Hier, tu as rangé le camion dans cette allée/.test(M0[0].text) && /Tu ne verras pas ce que dit le système/.test(M0[0].text), 'le lendemain du rangement, même allée ; à l’aveugle');
  vrai(!(await present('.ent-nav[data-vue="fiche"]')), 'pas de fiche « Mes écarts » avant la fin du comptage');
  await allerV('entrepot');
  egal(await pg.$$eval(`${P} [data-pal-acompter] li b`, (L) => L.map((b) => b.textContent)), T1.L.map((x) => x.a), 'la liste « À compter » : six adresses, dans l’ordre de l’allée');
  egal(await pg.$eval(`${P} [data-pe-regles]`, (d) => d.open), true, 'guidage : « Les règles » dépliées au chargement');
  egal(await present('.pal [data-pal-couche]'), false, 'standard : pas de nombre de cartons par couche');
  vrai((await pg.textContent(`${P} .pe-perso`)).includes('Compte les adresses de la liste.'), 'consigne neutre');
  await capture('2-liste-et-plan');
  egal(await fuite(SYS_T1), [], 'aveugle : aucun nombre du système sur le plan, avant tout');
  // La 1re adresse : de près, scannée, comptée (le manque : 26, le système croit 30).
  await ouvrir(T1.L[0].a); await capture('3-de-pres');
  egal(await fuite(SYS_T1), [], 'aveugle : adresse ouverte de près');
  await pg.click(`${P} [data-pal-compte-emp]`); await pause(40);
  egal(await panneau(), 'q-pourquoi', 'q-pourquoi au premier scan');
  await qrep();
  await taper(26);
  egal(await actu(), 'Quantité différente. Recompter ou confirmer ?', 'compte différent du système : le Terminal propose, sans dire ni combien ni dans quel sens');
  await capture('4-recompter-ou-confirmer');
  egal(await fuite(SYS_T1), [], 'aveugle : même à « Recompter ou confirmer ? »');
  await choisirT('recompter'); await taper(26); await choisirT('confirmer'); await qrep();
  egal(VUS.slice(-1), ['q-aveugle'], 'q-aveugle au premier compte confirmé');
  await compter(T1, 2, 32); await compter(T1, 3, 28);
  egal(VUS.slice(-1), ['q-colisage'], 'q-colisage au 3e compte');
  for (const r of [4, 5]) await compter(T1, r, adr(T1, r).reel);
  await compter(T1, 6, 25, ['recompter', 25, 'confirmer']);
  egal(await fuite(SYS_T1), [], 'aveugle : toutes les adresses comptées, avant « Terminer »');
  egal((await entrants()).map((m) => m.subject), ['Ce matin : l’inventaire'], 'Samia n’a pas écrit avant « Terminer le comptage »');
  await terminer();
  egal(VUS.slice(-1), ['q-robot'], 'q-robot à « Terminer le comptage »');
  vrai(await present('.ent-nav[data-vue="fiche"]'), 'la fiche apparaît au menu après « Terminer »');
  const M1 = await entrants();
  egal(M1.map((m) => m.subject), ['Ce matin : l’inventaire', 'Tes écarts'], 'Samia écrit à « Terminer le comptage »');
  vrai(/Pour chaque écart, dis-moi ce que tu fais, et ce qui a pu se passer\./.test(M1[1].text) && M1[1].ouvreFiche === 'ecarts', 'sa consigne et le bouton de la fiche');
  await allerV('fiche');
  egal(await pg.$$eval(Q('.ac812-tab tbody tr'), (L) => L.map((tr) => [...tr.children].map((c) => c.textContent.trim()))),
    [[T1.L[0].a, T1.L[0].nom, '26', '30'], [T1.L[5].a, T1.L[5].nom, '25', '24']], 'à gauche : SES écarts, son compte et — maintenant seulement — le système');
  egal(await pg.$$eval(Q('[data-fiche-champ]'), (L) => L.map((s) => s.dataset.ficheChamp)), ['faire-1', 'cause-1', 'faire-6', 'cause-6'], 'la fiche : une ligne par écart confirmé, deux listes chacune');
  const causes = (id) => pg.$$eval(Q(`[data-fiche-champ="${id}"] option`), (L) => L.map((o) => o.value).filter(Boolean).sort());
  egal([await causes('cause-1'), await causes('cause-6')], [['abimes', 'ailleurs', 'dessus', 'pluie'], ['abimes', 'dessus', 'double', 'saisie']], 'les causes dépendent du SENS de chaque écart');
  await fiche(repFiche(ecartsDe(T1)));
  egal(VUS.filter((id) => id === 'q-que-faire' || id === 'q-cause'), ['q-que-faire', 'q-cause'], 'q-que-faire et q-cause à l’envoi de la fiche');
  const M2 = await entrants();
  egal(M2.map((m) => m.subject), ['Ce matin : l’inventaire', 'Tes écarts', 'Un mot pour finir'], 'Samia écrit à l’envoi de la fiche');
  await ouvrirMail('Un mot pour finir'); await capture('6-message-samia'); await pg.click(Q('[data-repondre]'));
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  egal((await choixDe('bilan')).sort(), [bilanJuste(6, 2), bilanJuste(6, 3), 'Tout est bon.'].sort(), 'le bilan calculé sur SES comptes (6 adresses, 2 écarts) + un autre nombre + « Tout est bon. »');
  egal((await choixDe('salutation')).sort(), ['Bonjour Samia,', 'Salut Samia,', 'Salut,'].sort(), 'salutations');
  egal((await choixDe('fin')).sort(), ['Cordialement', 'Lea', 'À plus'].sort(), 'fins');
  await repondreSamia(PHR(6, 2), BONNES_Q, true);
  egal(VUS.slice(-1), ['q-argent'], 'q-argent à l’envoi du message à Samia');
  egal(VUS, ['q-pourquoi', 'q-aveugle', 'q-colisage', 'q-robot', 'q-que-faire', 'q-cause', 'q-argent'], 'les sept questions, une fois chacune, dans cet ordre');
  egal(Object.keys(BONNES_Q).filter((id) => !VERDICTS[id]), ['q-que-faire', 'q-cause', 'q-robot'], 'q-que-faire et q-cause corrigées au bilan ; q-robot : réflexion, pas de verdict ; les autres tout de suite');
  vrai(!!(await entrants()).find((m) => m.subject === 'Merci' && /Merci Lea\. Je fais vérifier\./.test(m.text)), 'Samia : « Je fais vérifier. »');
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  egal(NOTEES.map((id) => n.detail[`question:${id}`]), NOTEES.map(() => 'ok'), 'questions notées');
  egal(n.detail['question:q-robot'], undefined, 'q-robot : aucun jalon (réflexion)');
  proche(n.score, 20, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  await pg.$eval(Q('[data-fin-seance]'), (e) => e.scrollIntoView({ block: 'start' })); await capture('7-bilan');
  capturer = false;
  const M = await entrants();
  egal(M.map((x) => x.subject), ['Ce matin : l’inventaire', 'Tes écarts', 'Un mot pour finir', 'Merci'], 'les messages, dans l’ordre');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun message ne dit juste / faux / correct / erreur / bonus / bien vu');
  vrai(M.every((x, i) => !i || x.ts >= M[i - 1].ts), 'heures croissantes');
  egal(new Date(M[0].ts).getDay(), 3, 'un mercredi (le lendemain du mardi d’ENT-8.11)');
  const ecrit = [...M.map((x) => x.text), ...(await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent812.js'); return S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html({}) : d.html || '')); }))].join('\n');
  vrai(!/\b20\d\d\b/.test(ecrit), 'une année dans un message ou un document');
  vrai(!/\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b/i.test(ecrit), 'un mois dans un message ou un document');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.12 : témoin 2, accompagné — 20 / 20 ; de près, « n × m = p par couche » pour la palette ouverte, jamais le total ni le système', async () => {
  nouveau();
  await monter({ uid: 'ac812-acc', graine: T2.graine, aisance: 'accompagne' });
  await allerV('entrepot');
  await ouvrir(T2.L[0].a);
  egal((await pg.textContent(`${P} [data-pal-couche]`)).replace(/\s+/g, ' ').trim(), '2 × 4 = 8 par couche', 'aideCouche : cartons par couche, rien d’autre');
  await ouvrir(T2.L[2].a);
  egal((await pg.textContent(`${P} [data-pal-couche]`)).replace(/\s+/g, ' ').trim(), '3 × 3 = 9 par couche', 'la palette ouverte : Lessive 3 × 3');
  egal(await fuite(T2.L.map((x) => x.sys)), [], 'aveugle aussi chez l’accompagné');
  await parcours(T2);
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  proche(n.score, 20, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.12 : réglages du guidage — « Les règles » (Compter une palette) dépliées au chargement en standard et accompagné, repliées au confirmé ; « par couche » chez l’accompagné seulement ; le volet se déplie et se replie d’un clic', async () => {
  // Une graine par niveau : l'état « replié » d'un volet vit avec l'entrepôt de (graine, niveau), gardé en mémoire dans la page.
  const regles = () => pg.$eval(`${P} [data-pe-regles]`, (d) => d.open);
  nouveau();
  await monter({ uid: 'ac812-acc-r', graine: 'regles-acc', aisance: 'accompagne' });
  await allerV('entrepot');
  egal(await regles(), true, 'accompagné : dépliées');
  nouveau();
  await monter({ uid: 'ac812-conf-r', graine: 'regles-conf', aisance: 'confirme' });
  await allerV('entrepot');
  egal(await regles(), false, 'confirmé : repliées');
  nouveau();
  await monter({ uid: 'ac812-std', graine: 'regles-std' });
  await allerV('entrepot');
  egal(await regles(), true, 'standard : dépliées au chargement');
  vrai((await pg.textContent(`${P} [data-pe-regles]`)).includes('couches pleines'), 'le texte du volet : couches pleines + couche du dessus');
  await ouvrir(await pg.$eval(`${P} [data-pal-acompter] li b`, (b) => b.textContent));
  egal([await regles(), await present('.pal [data-pal-couche]')], [false, false], 'un geste sur le plan replie le volet ; standard : pas d’aide par couche');
  await pg.click(`${P} [data-pe-regles] summary`); await pause(40);
  egal(await regles(), true, 'un clic déplie');
});

await v('ENT-8.12 : verdict après « Terminer » — aucun avant ; ensuite « ✓ » ou « ✗ compte » sur chaque ligne de la liste (le nom du critère, jamais le nombre réel), chez tous les niveaux', async () => {
  const verdicts = () => pg.$$eval(`${P} [data-pal-acompter] li`, (L) => L.map((x) => (x.querySelector('[data-pal-cverdict]') || {}).textContent || ''));
  for (const aisance of ['standard', 'accompagne', 'confirme']) {
    nouveau();
    await monter({ uid: `ac812-v-${aisance}`, graine: T1.graine, aisance });
    await compter(T1, 1, 26, ['recompter', 26, 'confirmer']);   // juste
    await compter(T1, 2, 31, ['confirmer']);                      // faux
    await allerV('entrepot');
    if (await present('.pal [data-pal="retour"]')) await bouton('retour');
    egal((await verdicts()).filter(Boolean), [], `${aisance} : aucun verdict avant « Terminer »`);
    await terminer();
    egal(await verdicts(), ['✓', '✗ compte', '✗ compte', '✗ compte', '✗ compte', '✗ compte', ...(aisance === 'confirme' ? ['✗ compte'] : [])], `${aisance} : verdict par ligne (7 lignes au confirmé)`);
    vrai(!/réel/.test(await pg.textContent(`${P} [data-pal-acompter]`)), `${aisance} : jamais le nombre réel`);
  }
});

await v('ENT-8.12 : inaction → 0 / 20 ; « Terminer » sans rien compter (confirmation) → 0 ; la fiche n’a aucune ligne', async () => {
  nouveau();
  await monter({ uid: 'ac812-rien', graine: T1.graine });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'rien fait : 0');
  await terminer(FAUSSES_Q);
  egal((await etatC()).fini, true, 'terminé sans rien compter');
  await fiche({}, FAUSSES_Q);
  egal(await pg.$$eval(Q('[data-fiche-champ]'), (L) => L.length), 0, 'aucune ligne dans la fiche');
  await repondreSamia({ salutation: 'Salut Samia,', bilan: 'Il y a des écarts partout.', fin: 'Cordialement' }, FAUSSES_Q);
  const n = await note();
  vrai(COMPTAGE.every((j) => n.detail[j] === 'ko'), 'tout le comptage ✗, aucun « à faire » : ' + COMPTAGE.map((j) => n.detail[j]));
  egal([n.detail['fiche-signaler'], n.detail['fiche-cause'], n.detail['samia-forme']], ['ko', 'ko', 'ko'], 'fiche sans ligne : les deux ✗ ; forme ✗');
  proche(n.score, 0, 'note');
  const C = await cases();
  egal([...new Set(C.filter((c) => c[1] === 'ko' && c[3]).map((c) => c[3]))].sort(), ['fiche:ecarts', 'phrases:samia'], '« Corriger » ne rouvre que la fiche et le message, jamais le comptage');
});

await v('ENT-8.12 : écart trouvé du premier coup puis « Confirmer » sans recompter → recompte-manque ✗ (compte ✓) ; « Recompter » puis même nombre ✓ ; adresse à écart non comptée ✗ ; aucun jalon « à faire » après « Terminer »', async () => {
  nouveau();
  await monter({ uid: 'ac812-conf', graine: T1.graine });
  await compter(T1, 1, 26, ['confirmer']);                       // le manque, juste du premier coup, confirmé sans recompter
  await compter(T1, 6, 25, ['recompter', 25, 'confirmer']);       // le surplus : « Recompter », même nombre, « Confirmer »
  egal((await etatC()).comptes, { 1: 26, 6: 25 }, 'comptes confirmés');
  await terminer();
  const n = await note();
  egal([n.detail['compte-1'], n.detail['recompte-manque'], n.detail['compte-6'], n.detail['recompte-surplus']], ['ok', 'ko', 'ok', 'ok'], 'confirmé sans recompter ✗, recompté ✓');
  egal([n.detail['compte-2'], n.detail['recompte-ok1'], n.detail.scanAvant], ['ko', 'ko', 'ok'], 'adresses non comptées ✗ (le scan avant, lui, est ✓)');
  vrai(COMPTAGE.every((j) => n.detail[j] === 'ok' || n.detail[j] === 'ko'), 'aucun jalon du comptage « à faire » après « Terminer »');
});

await v('ENT-8.12 : compte faux confirmé sur une adresse conforme (31 au lieu de 32) → compte-2 ✗ ; sa ligne apparaît dans la fiche (3 lignes) ; « je le signale » reste ✓ ; sa cause est jugée selon SON sens (il manque) ; « Corriger » rouvre la fiche, jamais le comptage', async () => {
  nouveau();
  await monter({ uid: 'ac812-faux', graine: T1.graine });
  await compterJuste(T1, { sans: [2] });
  await compter(T1, 2, 31, ['confirmer']);
  await terminer();
  await allerV('fiche');
  egal(await pg.$$eval(Q('.ac812-tab tbody tr td:first-child'), (L) => L.map((c) => c.textContent.trim())), [T1.L[0].a, T1.L[1].a, T1.L[5].a], 'trois lignes : le manque, l’adresse comptée à tort, le surplus');
  await fiche({ 'faire-1': 'signaler', 'cause-1': 'abimes', 'faire-2': 'signaler', 'cause-2': 'dessus', 'faire-6': 'signaler', 'cause-6': 'dessus' });
  await repondreSamia(PHR(6, 3));
  const n = await note();
  egal(jalonsFaux(n), ['compte-2', 'fiche-cause'], 'compte-2 ✗ ; sa ligne signalée ✓ ; sa cause « posés dessus » est celle d’un SURPLUS, il manque 1 : fiche-cause ✗');
  egal(n.detail['recompte-ok1'], 'ko', 'confirmé sans recompter : sans point');
  proche(n.score, 20 - 5 / 6 - 2, 'note : un compte et la cause');
  const b = await fin();
  vrai(b && b.corriger, 'bouton « Corriger »');
  const C = await cases();
  egal(C.filter((c) => c[1] === 'ko' && c[3]).map((c) => c[3]), ['fiche:ecarts'], 'seule la fiche se corrige parmi les cases fausses (le compte-2 ne se rouvre pas)');
  await pg.click(Q('[data-fin-corriger]')); await pause();
  egal((await etatC()).fini, true, 'le comptage reste terminé');
  await allerV('entrepot');
  egal([await present('.pal [data-pal="terminer"]'), await present('.pal [data-vt-champ]')], [false, false], 'plus de « Terminer » ni de champ');
  egal(await actu(), 'Terminé.', 'le Terminal est figé');
  await allerV('fiche');
  vrai(await present('[data-fiche-champ="faire-1"]'), 'la fiche est rouverte');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.12 : écart manqué (le manque compté comme le système) → compte-1 ✗ seul, sa fiche n’a qu’une ligne et reste ✓ ; « je corrige le stock moi-même » → fiche-signaler ✗ ; aucun écart trouvé → fiche sans ligne, les deux ✗', async () => {
  nouveau();
  await monter({ uid: 'ac812-manque', graine: T1.graine });
  await compterJuste(T1, { sans: [1] });
  await compter(T1, 1, 30);
  await terminer();
  await allerV('fiche');
  egal(await pg.$$eval(Q('[data-fiche-champ]'), (L) => L.map((s) => s.dataset.ficheChamp)), ['faire-6', 'cause-6'], 'une seule ligne : le surplus');
  await fiche({ 'faire-6': 'corriger', 'cause-6': 'dessus' });
  await repondreSamia(PHR(6, 1));
  const n = await note();
  egal(jalonsFaux(n), ['compte-1', 'fiche-signaler'], 'compte-1 ✗ ; « corriger » ✗ sur sa ligne ; sa cause ✓');
  nouveau();
  await monter({ uid: 'ac812-aucun', graine: T1.graine });
  for (const r of [1, 2, 3, 4, 5, 6]) await compter(T1, r, adr(T1, r).sys);
  await terminer();
  await allerV('fiche');
  egal(await pg.$$eval(Q('[data-fiche-champ]'), (L) => L.length), 0, 'aucune ligne');
  vrai(/aucun écart/i.test(await pg.textContent(Q('.ent-fiche-droite'))), 'la fiche le dit sans juger');
  await fiche({});
  const m = await note();
  egal(jalonsFaux(m, ['fiche-signaler', 'fiche-cause']), ['fiche-signaler', 'fiche-cause'], 'les deux ✗');
});

await v('ENT-8.12 : confirmé — 7e adresse en fin de liste (un second manque) ; la note du socle est 20 sans elle ; comptée et recomptée, les deux bonus ✓ et la note reste plafonnée à 20', async () => {
  nouveau();
  await monter({ uid: 'ac812-c6', graine: T1.graine, aisance: 'confirme' });
  await allerV('entrepot');
  egal(await pg.$$eval(`${P} [data-pal-acompter] li b`, (L) => L.map((b) => b.textContent)), [...T1.L.map((x) => x.a), T1.bonus.a], 'sept adresses, la 7e en fin de liste');
  await parcours(T1);
  const n = await note();
  egal(jalonsFaux(n), [], 'socle juste');
  proche(n.score, 20, 'note du socle sans la 7e');
  egal(n.detail.bonus && n.detail.bonus.etats, { 'compte-7': 'ko', 'recompte-bonus': 'ko' }, '7e non comptée : bonus ✗ (sans effet sur la note)');
  nouveau();
  await monter({ uid: 'ac812-c7', graine: T1.graine, aisance: 'confirme' });
  await parcours(T1, { p7: true });
  const n7 = await note();
  egal(n7.detail.bonus && n7.detail.bonus.etats, { 'compte-7': 'ok', 'recompte-bonus': 'ok' }, '7e comptée et recomptée : bonus ✓');
  proche(n7.score, 20, 'note plafonnée à 20');
  egal(n7.detail.bonus && [n7.detail.bonus.justes, n7.detail.bonus.total], [2, 2], 'deux cas bonus justes');
  // Un bonus ne retire rien au socle : la ligne de la 7e adresse (mauvais choix partout) n'est pas jugée.
  nouveau();
  await monter({ uid: 'ac812-c7mal', graine: T1.graine, aisance: 'confirme' });
  await parcours(T1, { p7: true, rep: { ...repFiche(ecartsDe(T1, null, true)), 'faire-7': 'rien', 'cause-7': 'pluie' } });
  const nm = await note();
  egal(jalonsFaux(nm), [], 'la ligne de la 7e adresse mal remplie ne coûte rien au socle');
  proche(nm.score, 20, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.12 : corrigé de l’enseignant — la liste de l’élève (adresse, produit, format, réel, système, rôle) calculée sur sa graine ; la fiche attendue et le recomptage', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-8.12.js');
    const e = C.corrigeEleve({ tirage: { graine: 'temoin-1' } }, 'u1');
    return { code: C.CORRIGE.code, etapes: C.CORRIGE.items.map((i) => i.etape), liste: e.items[0].reponses, fiche: e.items[2].rep, recompte: e.items[1].rep };
  });
  egal([r.code, r.etapes], ['ENT-8.12', [1, 2, 3, 4, 5]], 'le corrigé commun');
  egal(r.liste[0], ['1', 'A2-T04-N1-E3', 'Cahiers grand format', '2 × 3 × 5 = 30', '26', '30', 'manque'], 'rang 1 de temoin-1 (recopié)');
  egal(r.liste[5], ['6', 'B2-T03-N1-E1', 'Boîtes de rangement 10 L', '2 × 3 × 4 = 24', '25', '24', 'surplus'], 'rang 6');
  egal(r.liste[6][0], '7 (confirmé)', 'la 7e adresse est marquée');
  vrai(/A2-T04-N1-E3 \(il manque des cartons\) : « je le signale à Samia », cause : « des cartons abîmés ont été retirés sans être déclarés » ou « la palette a été mise à une autre adresse en partie »/.test(r.fiche), 'fiche attendue : ' + r.fiche);
  vrai(/recompte-manque/.test(r.recompte) && /recompte-surplus/.test(r.recompte), 'le recomptage attendu nomme les deux rôles');
});

await F.fermer();
}
