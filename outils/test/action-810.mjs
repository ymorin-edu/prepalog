// Suite de tests de Prepalog — bloc « action-810 » : Action ENT-8.10, évaluation « recevoir un camion dans un nouveau site » (CAP OL, évaluation
// CAP-C1.3 et CAP-C1.4, copie rendue). `node outils/test.mjs action-810` ne lance que ce bloc. Brief : `docs/briefs/ENT-8.10-action-evaluation-reception.md`
// §8 ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §8.2 et §8.5 bis. Aides communes : `outils/test/france-boissons/commun.mjs`.
//
// La séance est montée dans une page (1366 × 768), avec la fabrique et le moteur réels (`activites/action-evaluation-reception.js` → `rendre`,
// `noter`) ; de vrais clics. L’inspection se joue À LA SOURIS (zones du moteur, comme `action-87`) ; la dépose par un clic sur la case.
// Mouvement réduit : le camion arrive et le cariste pose d’emblée.
//
// Valeurs ÉCRITES À LA MAIN (relevé du tirage le 17/10/2026), jamais recalculées par le code de la séance :
//   a85-a → ONNAING (GXO, Karim, Léo) : anomalie cabine ; situations s-aider → c-chauffeur, s-responsable → c-responsable, s-gilet → c-epi ;
//     palettes P1 conforme 40 · P2 PIÈGE BL 18 = réel 18 · P3 1 carton écrasé DERRIÈRE (36) · P4 conforme 18.
//   a85-b → BELLEVILLE (Kuehne+Nagel, Sandrine, Hugo) : anomalie cale ; situations s-pieton → c-pietons, s-aerosols → c-aerosols, s-gilet →
//     c-epi ; palettes P1 PIÈGE BL 36 = réel 36 · P2 1 carton écrasé derrière (20) · P3 conforme 36 · P4 conforme 18.
//   t810-0 → ONNAING : anomalie niveleur ; P1 2 cartons MANQUANTS (BL 40, réel 38) · P2 piège 18 · P3 36 · P4 18.
//   Dialogue juste : arrivee presente, documents bl-ldv, quai quai3, attente local, fin fin-poli. Dépose : R1 à R4 (sortie P4, P3, P2, P1).
//   Poids : protocole 1 × 3 · accueil 0,5 / 0,75 / 0,5 / 0,75 / 0,5 · danger 2, aucun faux 0,5 · dépose 0,25 × 4 · palette à problème 2, piège
//   0,75, conformes 0,375 × 2 · réserve 1, déballage 0,5, signature 0,5 · ma réception 1 · ouverture 4.
// Ce qui vaut son prix : les deux témoins à 20 et la remise (= `noter`), la clôture du quai qui NE rend PAS la copie, le compte rendu jugé sur
// ce que l’élève a décidé (une erreur ne se paie qu’une fois), la dépose au premier clic sans réaction, l’inspection sans arrêt, l’inaction à 0,
// rien qui dise juste ou faux.

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, present, aller, texte, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });
const CAPTURES = process.env.CAPTURES_ENT810 || '';
const hotes = new Set();
pg.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotes.add(h); } catch (e) {} });

const ID = 'action-evaluation-reception';
const ID85 = 'action-evaluation-se-situer';
const QID = 'action-quai-evaluation';
const FID = 'protocole-810';
const JUGE = /\b(juste|justes|faux|fausse|fausses|correct|correcte|erreur|erreurs|bravo|bien vu|bonne réponse|mauvaise réponse)\b/i;
const PENALITE = 'Une réponse fausse retire des points. Si tu ne sais pas, choisis « Je ne sais pas » : tu ne perds rien.';
const ATTENTE = 'Réponds à toutes les questions pour continuer : une réponse fausse ne bloque pas.';
const OUV_JUSTES = { 'k-protocole': 'document', 'k-qui-ecrit': 'ensemble', 'k-plan-circulation': 'passages', 'k-anomalie': 'signale', 'k-attendre': 'attendre',
  'k-reserve': 'remarque', 'k-signer': 'reconnaitre', 'k-trois-jours': '3j', 'k-qui-paie': 'transporteur', 'k-img-cale': 'immobiliser',
  'k-img-carton-ecrase': 'ecrase', 'k-img-niveleur': 'passer' };
const OUV_FAUSSES = { 'k-protocole': 'contrat', 'k-qui-ecrit': 'chauffeur', 'k-plan-circulation': 'rayons', 'k-anomalie': 'pause', 'k-attendre': 'moi',
  'k-reserve': 'stock', 'k-signer': 'paye', 'k-trois-jours': '1a', 'k-qui-paie': 'magasin', 'k-img-cale': 'laver', 'k-img-carton-ecrase': 'neuf', 'k-img-niveleur': 'peser' };
const DIAL = { arrivee: 'presente', documents: 'bl-ldv', quai: 'quai3', attente: 'local', fin: 'fin-poli' };
const ORDRE_DIAL = ['arrivee', 'documents', 'quai', 'attente', 'fin'];
const SORTIE = ['P4', 'P3', 'P2', 'P1'];
const DEPOSE_JUSTE = { P4: 'R1', P3: 'R2', P2: 'R3', P1: 'R4' };
const JALONS = ['situation-facile', 'situation-moyen', 'situation-difficile', 'accueil-salutation', 'accueil-documents', 'accueil-quai', 'accueil-attente',
  'accueil-fin', 'securite-danger', 'securite-aucun-faux', 'depose-P1', 'depose-P2', 'depose-P3', 'depose-P4', 'palette-probleme', 'palette-piege',
  'palette-conforme-1', 'palette-conforme-2', 'reserve', 'deballage', 'signature', 'cr-reception'];
const T = {
  'a85-a': { site: 'Onnaing', tuteur: 'Karim', cariste: 'Léo', anomalie: 'cabine',
    proto: { 's-aider': 'c-chauffeur', 's-responsable': 'c-responsable', 's-gilet': 'c-epi' },
    pal: { P1: [40, 'accepter'], P2: [18, 'accepter'], P3: [36, 'reserves', 'avarie'], P4: [18, 'accepter'] }, res: { P3: '1' },
    cr: { salutation: 'Bonjour Karim,', reception: 'Réserves signées par Thomas : P3, 1 carton abîmé.', fin: 'Je reste au quai. Lea' } },
  'a85-b': { site: 'Belleville-en-Beaujolais', tuteur: 'Sandrine', cariste: 'Hugo', anomalie: 'cale',
    proto: { 's-pieton': 'c-pietons', 's-aerosols': 'c-aerosols', 's-gilet': 'c-epi' },
    pal: { P1: [36, 'accepter'], P2: [20, 'reserves', 'avarie'], P3: [36, 'accepter'], P4: [18, 'accepter'] }, res: { P2: '1' },
    cr: { salutation: 'Bonjour Sandrine,', reception: 'Réserves signées par Thomas : P2, 1 carton abîmé.', fin: 'Je reste au quai. Lea' } },
  't810-0': { site: 'Onnaing', tuteur: 'Karim', cariste: 'Léo', anomalie: 'niveleur',
    proto: { 's-responsable': 'c-responsable', 's-pieton': 'c-pietons', 's-partir': 'c-depart' },
    pal: { P1: [38, 'reserves', 'manquant'], P2: [18, 'accepter'], P3: [36, 'accepter'], P4: [18, 'accepter'] }, res: { P1: '2' },
    cr: { salutation: 'Bonjour Karim,', reception: 'Réserves signées par Thomas : P1, 2 cartons manquants.', fin: 'Je reste au quai. Lea' } },
};

// Monte la séance comme le site. `o.uid` (l’identifiant = la graine) ; `o.rep` : réponses d’ouverture rangées d’avance (défaut : justes) ;
// `o.sansOuverture`.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-evaluation-reception.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [id, r] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [], copies: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'a85-a' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__f.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: OUV_JUSTES, ...o });
const noter = () => pg.evaluate(async () => { const A = await import('/activites/action-evaluation-reception.js'); return A.noter(window.__f.db); });
const detail = async () => (await noter()).detail;
const copies = () => pg.evaluate(() => window.__f.copies.length);
const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); } };
let capturer = false;
const capture = async (nom, sel = null) => {
  if (!CAPTURES || !capturer) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(`${Z} [data-carte-fermer]`); await pause(40); }
  if (sel) await pg.$eval(`${Z} ${sel}`, (x) => x.scrollIntoView({ block: 'center' })); else await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};

// ① la fiche du protocole
async function protocole(rep) {
  await allerV('fiche');
  for (const [id, val] of Object.entries(rep)) { if (val) await pg.check(`${Z} input[data-fiche-champ="${id}"][value="${val}"]`); await pause(20); }
  await capture('1-protocole');
  await pg.click(`${Z} [data-fiche-envoyer]`); await confirmer();
}
// ② l’accueil de Thomas : la première réponse de chaque réplique (en évaluation, chaque réponse fait avancer).
async function accueil(rep = DIAL) {
  await allerV('telephone');
  await pg.click(`${Z} [data-dlg-appeler="thomas"]`); await pause();
  for (const r of ORDRE_DIAL) { await pg.click(`${Z} [data-dlg-choix="${rep[r]}"]`); await pause(); if (r === 'quai') await capture('2-accueil'); }
  await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
}
// ③ le quai : l’inspection (zones du moteur), « C’est bon », la dépose, le contrôle, les réserves, la signature, la clôture.
const SVG = `${Z} [data-q-inspection]`;
const zones = () => pg.evaluate(async (QID) => {
  const Q = await import('/core/types/quai.js');
  const D = await import('/contenus/action-ent810-donnees.js');
  const S = D.quaiDeBase(window.__f.db).securite, q = window.__f.db.quais[QID];
  return Q.zonesScene(S, Q.etatsScene(S, q && q.securite));
}, QID);
async function cliquerVB(x, y) {
  const loc = pg.locator(SVG);
  await loc.scrollIntoViewIfNeeded();
  const bb = await loc.boundingBox();
  const [vx, vy, vw, vh] = await loc.evaluate((s) => s.getAttribute('viewBox').split(' ').map(Number));
  const k = Math.min(bb.width / vw, bb.height / vh);
  await pg.mouse.click(bb.x + (bb.width - vw * k) / 2 + (x - vx) * k, bb.y + (bb.height - vh * k) / 2 + (y - vy) * k);
  await pause(40);
}
async function vueScene(vue) {
  if ((await pg.$eval(SVG, (s) => s.dataset.vue)) === vue) return;
  if (vue === 'dedans' && !(await present('[data-q="sc-vue"]'))) await pg.click(`${Z} [data-q="sc-ouvrir"]`);
  else await pg.click(`${Z} [data-q="sc-vue"]`);
  await pg.waitForFunction(({ Z, v }) => document.querySelector(`${Z} [data-q-inspection]`).dataset.vue === v, { Z, v: vue });
}
async function marquer(id) { const z = (await zones()).find((q) => q.id === id); await vueScene(z.vue); const r = z.rects[0]; await cliquerVB(r.x + r.w / 2, r.y + r.h / 2); }
const signaler = async () => { await pg.click(`${Z} [data-q="sc-signaler"]`); await pause(); };
const chef = () => pg.$eval(`${Z} [data-q-secu-chef]`, (n) => n.textContent.trim()).catch(() => '');
const cestBon = async () => { await pg.click(`${Z} [data-q="sc-decharger"]`); await pg.click(`${Z} [data-q="sc-decharger"]`); await pause(); };
const posees = () => pg.$$eval(`${Z} [data-iso-posee]`, (L) => L.length);
const annonce = () => pg.$eval(`${Z} [data-q-annonce]`, (n) => n.textContent.trim()).catch(() => '');
async function inspecter(envois) {
  await allerV('quai');
  await pg.waitForSelector(SVG);
  await capture('3-quai-inspection');
  for (const ids of envois) { for (const id of ids) await marquer(id); await signaler(); }
  await cestBon();
}
async function deposer(depose = DEPOSE_JUSTE) {
  await pg.click(`${Z} [data-q="decharger"]`);
  await pg.waitForSelector(`${Z} [data-q-phase="choix"]`);
  for (const [k, p] of SORTIE.entries()) {
    if (k === 1) await capture('4-quai-depose', '[data-q-phase]');
    await pg.click(`${Z} [data-q="depose"][data-c="${depose[p]}"]`); await pause();
  }
  await pause();
}
async function controler(J, o = {}) {
  const pal = Object.assign({}, J.pal, o.pal || {}), res = Object.assign({}, J.res, o.res || {});
  await pg.click(`${Z} [data-q="vers3"]`); await pause();
  for (const [n, id] of ['P1', 'P2', 'P3', 'P4'].entries()) {
    const [compte, decision, motif] = pal[id];
    await pg.click(`${Z} [data-q="sel"][data-n="${n}"]`); await pause(30);
    await pg.fill(`${Z} #qCompte`, String(compte)); await pg.press(`${Z} #qCompte`, 'Enter');
    await pg.click(`${Z} #qDec-${decision}`);
    if (motif) await pg.click(`${Z} #qMot-${motif}`);
    await pg.click(`${Z} [data-q="valider"]`); await pause(30);
  }
  await pg.click(`${Z} [data-q="vers4"]`); await pg.click(`${Z} [data-q="vers4"]`).catch(() => {}); await pause();
  for (const [id, val] of Object.entries(res)) if (val != null && await present(`#qRes-${id}`)) await pg.fill(`${Z} #qRes-${id}`, val);
  if (o.deballage) await pg.check(`${Z} [data-q-deballage]`);
  await pg.click(`${Z} [data-q="ecrire"]`); await pause();
  await capture('5-reserves', '[data-q-lignes]');
  await pg.click(`${Z} [data-q="signer"]`); await pause();
  if (!o.sansClore) { await pg.click(`${Z} [data-q="clore"]`); await pg.click(`${Z} [data-q="clore"]`); await pause(); }
}
async function quai(J, o = {}) {
  await inspecter(o.envois || [[J.anomalie]]);
  await deposer(o.depose);
  await controler(J, o);
}
// ④ rendre compte
async function compteRendu(lignes) {
  await allerV('mail');
  const id = await pg.evaluate(() => (window.__f.db.mails.find((m) => m.folder === 'in' && m.subject === 'Fais-moi le point') || {}).id);
  vrai(id != null, 'le message « Fais-moi le point » n’est pas arrivé');
  await pg.click(`${Z} [data-mail="${id}"]`);
  await pg.click(`${Z} [data-repondre]`);
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(lignes)) if (t) await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t });
  await capture('6-compte-rendu');
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await confirmer();
}
const choixPhrase = (l) => pg.$$eval(`${Z} [data-phrase="${l}"] option`, (L) => L.map((o) => o.textContent.trim()).filter((t) => t && !/^Choisir/.test(t)));
async function rendre() {
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.waitForFunction(() => window.__f.copies.length === 1);
  await pause();
  return pg.evaluate(() => window.__f.copies[0]);
}
async function parcours(uid, o = {}) {
  const J = T[uid];
  await protocole({ ...J.proto, ...(o.proto || {}) });
  await accueil({ ...DIAL, ...(o.dial || {}) });
  await quai(J, o);
  await compteRendu({ ...J.cr, ...(o.cr || {}) });
}

// ─────────────────────────────────────────────────────────── la déclaration et le contenu
await v('ENT-8.10 : la séance se charge (CAP, CAP-C1.3 + CAP-C1.4, évaluation en copie, sans parcours) ; poids jalon par jalon 16 + ouverture 4 = 20 ; banque d’ouverture 9 + 3, sans aide ni mot cliquable ; quai complet en copie (`rendCopie: false`, aides éteintes)', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-evaluation-reception.js');
    const S = await import('/contenus/action-ent810.js');
    const Q = await import('/contenus/questions/ENT-8.10.js');
    const D = await import('/contenus/action-ent810-donnees.js');
    const Qm = await import('/core/types/quai.js');
    const L = Q.QUESTIONS.liste;
    const q = D.quaiDe('a85-b');
    return { meta: A.meta, poids: S.ETAPES.map((e) => [e.id, e.poids]), bonus: S.ETAPES.filter((e) => e.bonus).length,
      groupes: S.ETAPES.reduce((g, e) => { g[e.groupe] = (g[e.groupe] || 0) + e.poids; return g; }, {}),
      ouv: { part: Q.QUESTIONS.ouverture.part, tirage: Q.QUESTIONS.ouverture.tirage,
        prep: L.filter((x) => x.rubrique === 'preparation').length, image: L.filter((x) => x.rubrique === 'image').length,
        aides: L.filter((x) => x.aide != null).length, fil: L.filter((x) => x.type !== 'ouverture').length,
        mots: L.filter((x) => (x.enonce + x.choix.map((c) => c.lib).join(' ')).includes('[[')).length,
        droit: L.filter((x) => x.doc === 'droit').map((x) => x.id) },
      lexique: Object.keys(S.OPTIONS.lexique).length,
      quai: [q.id, q.rendu, q.froid, q.rendCopie, q.recommencer, q.document, q.commence, q.arret, JSON.stringify(q.aides), q.camions.length,
        q.camions[0].palettes.length, q.dechargement.nom, q.securite.mode, q.securite.arret, q.depose.cases.map((c) => c.id)],
      verifier: ['a85-a', 'a85-b', 't810-0', ''].map((g) => Qm.verifierQuai(D.quaiDe(g))) };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture, m.parcours, m.precedente,
    m.correction, m.immersif, m.portee, m.corrige],
    ['ENT-8.10', ['cap'], [], ['CAP-C1.3', 'CAP-C1.4'], 'evaluation', 20, true, 'ENT-8.10', true, 'prof', undefined, undefined, undefined, true, 'eleve',
      './contenus/corriges/ENT-8.10.js'], 'meta');
  egal(r.poids, [['situation-facile', 1], ['situation-moyen', 1], ['situation-difficile', 1], ['accueil-salutation', 0.5], ['accueil-documents', 0.75],
    ['accueil-quai', 0.5], ['accueil-attente', 0.75], ['accueil-fin', 0.5], ['securite-danger', 2], ['securite-aucun-faux', 0.5], ['depose-P1', 0.25],
    ['depose-P2', 0.25], ['depose-P3', 0.25], ['depose-P4', 0.25], ['palette-probleme', 2], ['palette-piege', 0.75], ['palette-conforme-1', 0.375],
    ['palette-conforme-2', 0.375], ['reserve', 1], ['deballage', 0.5], ['signature', 0.5], ['cr-reception', 1]], 'poids jalon par jalon (brief §5)');
  egal(r.groupes, { 'Le protocole': 3, 'Accueillir le chauffeur': 3, 'Avant de décharger': 2.5, 'Faire décharger': 1, 'Contrôler les palettes': 3.5,
    'Réserves et signature': 2, 'Rendre compte': 1 }, 'poids par bloc');
  proche(Object.values(r.groupes).reduce((t, x) => t + x, 0) + r.ouv.part, 20, 'somme des poids et de l’ouverture');
  egal(r.bonus, 0, 'jalons bonus');
  egal(r.ouv, { part: 4, tirage: { preparation: 3, image: 1 }, prep: 9, image: 3, aides: 0, fil: 0, mots: 0, droit: ['k-qui-ecrit', 'k-trois-jours', 'k-qui-paie'] }, 'ouverture');
  egal(r.lexique, 0, 'mots cliquables');
  egal(r.quai, [QID, 'iso', false, false, false, 'Bon de livraison — lettre de voiture', undefined, undefined, '{}', 1, 4, 'Hugo', 'scene', undefined,
    ['allee-1', 'R1', 'R2', 'R3', 'R4', 'quai4-1']], 'le quai');
  egal(r.verifier, [[], [], [], []], 'verifierQuai des quais tirés');
});

await v('ENT-8.10 : contenu — chaque situation a une seule consigne qui s’applique ; ses choix sont mot pour mot dans le protocole DU SITE ; les deux protocoles diffèrent ; aucune consigne juste ni bonne réponse du dialogue identique à ENT-8.7', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent810-donnees.js');
    const D87 = await import('/contenus/action-ent87-donnees.js');
    const E = await import('/contenus/action-eval-sites.js');
    const { protocoleSecurite } = await import('/contenus/action.js');
    const out = { ecarts: D.ecartsSituations(), pasDansLeDoc: [], protos: {} };
    for (const id of ['onnaing', 'belleville']) {
      const S = E.SITES[id];
      const doc = document.createElement('div'); doc.innerHTML = protocoleSecurite(D.specProtocole(S));
      const ecrites = Object.fromEntries([...doc.querySelectorAll('[data-consigne]')].map((li) => [li.dataset.consigne, li.textContent]));
      out.protos[id] = ecrites;
      D.BANQUE_SITUATIONS.forEach((s) => D.choixDe(s, S).forEach((c) => { if (ecrites[c.v] !== c.lib) out.pasDansLeDoc.push(`${id}:${s.id}:${c.v}`); }));
    }
    const t87 = Object.values(D87.CONSIGNES).map((c) => c.texte);
    out.memes87 = Object.values(out.protos).flatMap((P) => Object.values(P).filter((t) => t87.includes(t)));
    const j87 = D87.REPLIQUES.map((R) => R.choix.find((c) => c.juste).lib);
    out.dialMemes = D.REPLIQUES.map((R) => R.choix.find((c) => c.juste).lib).filter((l) => j87.includes(l));
    out.differentes = Object.keys(out.protos.onnaing).filter((k) => out.protos.onnaing[k] !== out.protos.belleville[k]);
    const mod = (f) => { const B = JSON.parse(JSON.stringify(D.BANQUE_SITUATIONS)); f(B); return D.ecartsSituations(B); };
    out.deux = mod((B) => { B.find((s) => s.id === 's-partir').choix[1] = 'c-attente'; });
    return out;
  });
  egal(r.ecarts, [], 'contrôle de la banque');
  egal(r.pasDansLeDoc, [], 'un choix de la fiche n’est pas écrit tel quel dans le protocole du site');
  egal(r.memes87, [], 'consignes identiques mot pour mot à ENT-8.7');
  egal(r.dialMemes, [], 'bonnes réponses du dialogue identiques à ENT-8.7');
  egal(r.differentes.sort(), ['c-aerosols', 'c-attente', 'c-chariot', 'c-responsable', 'c-sst', 'c-urgence', 'c-vitesse'], 'consignes qui changent d’un site à l’autre');
  vrai(/15 km\/h/.test(r.protos.onnaing['c-vitesse']) && /20 km\/h/.test(r.protos.belleville['c-vitesse']), 'vitesses des deux sites');
  vrai(r.deux.some((x) => /s-partir : 2 consigne/.test(x)), 'deux consignes qui s’appliquent non vues : ' + r.deux);
});

// ─────────────────────────────────────────────────────────── le site et le tirage
await v('ENT-8.10 : le site — même site qu’en ENT-8.5 pour 50 élèves (y compris le quai, tiré de la graine) ; témoins a85-a Onnaing, a85-b Belleville', async () => {
  const r = await pg.evaluate(async ({ ID, ID85 }) => {
    const E = await import('/contenus/action-eval-sites.js');
    const D = await import('/contenus/action-ent810-donnees.js');
    const diff = [];
    for (let i = 0; i < 50; i++) {
      const uid = `cap-${i}`;
      const b85 = { tirages: { [ID85]: { graine: `${uid}|${ID85}` } } }, b = { tirages: { [ID]: { graine: `${uid}|${ID}` } } };
      if (E.siteDeBase(b85, ID85).id !== D.siteEleve(b).id || D.siteDeGraine(uid).id !== D.siteEleve(b).id) diff.push(uid);
      if (!D.quaiDe(uid).titre.includes(D.siteDeGraine(uid).site)) diff.push(`${uid} (quai)`);
    }
    const eq = (uid) => { const S = D.siteDeGraine(uid), Q = D.equipeDe(S); return [S.id, Q.tuteur, Q.cariste, D.quaiDe(uid).dechargement.nom, D.quaiDe(uid).securite.signaler.qui]; };
    return { diff, a: eq('a85-a'), b: eq('a85-b') };
  }, { ID, ID85 });
  egal(r.diff, [], 'élèves dont le site change');
  egal(r.a, ['onnaing', 'Karim', 'Léo', 'Léo', 'Léo'], 'a85-a');
  egal(r.b, ['belleville', 'Sandrine', 'Hugo', 'Hugo', 'Hugo'], 'a85-b');
});

await v('ENT-8.10 : tirage sur 300 graines — 3 situations (une par difficulté), zéro secours ; une anomalie de scène parmi 4 (jamais les butoirs) ; palettes : 1 problème, 1 piège, 2 conformes, chaque type de problème entre 20 et 45 % sur 200 graines, zéro secours', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent810-donnees.js');
    const { tirerJeu } = await import('/core/tirage.js');
    const out = { secours: 0, mix: new Set(), anomalies: {}, unDanger: 0, roles: 0, probl: {}, secoursPal: 0, dist: 0 };
    for (let i = 0; i < 300; i++) {
      const t = D.TIRAGE.tirer(`el-${i}|${D.ID}`);
      if (t.secours) out.secours++;
      out.mix.add(t.pieces.situations.map((id) => t.difficultes.situations[id]).sort().join(','));
      const dangers = D.quaiDe(`el-${i}`).securite.points.filter((p) => !p.ok);
      if (dangers.length === 1) out.unDanger++;
      out.anomalies[dangers[0].objet] = (out.anomalies[dangers[0].objet] || 0) + 1;
      const j = tirerJeu(D.TIRAGE_PALETTES, `el-${i}|${D.ID}`);
      if (j.secours) out.secoursPal++;
      const P = j.jeu.palettes;
      if (P.map((p) => p.role).sort().join() !== 'conforme-1,conforme-2,piege,probleme') out.roles++;
      if (new Set(['probleme', 'piege', 'conforme-1'].map((x) => P.find((p) => p.role === x).id)).size !== 3) out.dist++;
      if (i < 200) { const a = P.find((p) => p.role === 'probleme').anomalie; out.probl[a] = (out.probl[a] || 0) + 1; }
    }
    return { ...out, mix: [...out.mix] };
  });
  egal([r.secours, r.secoursPal, r.roles, r.dist, r.unDanger], [0, 0, 0, 0, 300], 'secours, rôles, palettes distinctes, un danger');
  egal(r.mix, ['difficile,facile,moyen'], 'mélange des situations');
  egal(Object.keys(r.anomalies).sort(), ['cabine', 'cale', 'lampe', 'niveleur'], 'anomalies de la scène');
  vrai(Object.values(r.anomalies).every((n) => n > 40), 'répartition des anomalies : ' + JSON.stringify(r.anomalies));
  egal(Object.keys(r.probl).sort(), ['ecrase-cache', 'ecrase-face', 'manquant'], 'types de problème');
  vrai(Object.values(r.probl).every((n) => n >= 40 && n <= 90), 'chaque type entre 20 et 45 % sur 200 : ' + JSON.stringify(r.probl));
});

// ─────────────────────────────────────────────────────────── l’ouverture
await v('ENT-8.10 : Avant de commencer — 4 questions (3 + 1), « Je ne sais pas » en dernier, aucune aide, aucun mot qui juge ; « Le droit » à gauche (R4515-4, R4515-8, L133-1, L133-3) ; barème : 4 justes = 4, 3 + « Je ne sais pas » = 3, 3 + 1 fausse (3 choix) = 2,5, tout faux = 0 ; rien au Suivi', async () => {
  capturer = true;
  const db = await monter({ uid: 'a85-a', sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal([ids.length, ids.filter((x) => /img/.test(x)).length], [4, 1], 'questions tirées');
  const choix = await pg.$$eval(`${Z} [data-q-choix]`, (L) => L.map((b) => b.textContent.trim()));
  egal(choix[choix.length - 1], 'Je ne sais pas', '« Je ne sais pas » en dernier');
  vrai(!(await present('[data-ouv-aide]')) && !(await present('details')), 'une aide à l’écran');
  await pg.click(`${Z} [data-ouv-doc="droit"]`); await pause();
  const droit = await pg.$eval(`${Z} .qo-feuille`, (e) => e.textContent);
  vrai(/R4515-4/.test(droit) && /R4515-8/.test(droit) && /L133-1/.test(droit) && /L133-3/.test(droit) && /garant des avaries/.test(droit)
    && /trois jours, non compris les jours fériés/.test(droit), 'le droit : ' + droit.slice(0, 200));
  await capture('0-ouverture-droit');
  capturer = false;
  for (let k = 0; k < 4; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await pg.click(`${Z} [data-q-choix="${k === 3 ? '@nsp' : OUV_JUSTES[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`); await pause();
    const t = (await pg.$eval(`${Z} [data-ouverture]`, (e) => e.textContent)).replace(PENALITE, '').replace(ATTENTE, '').replace(droit, '');
    vrai(!JUGE.test(t), 'une phrase qui juge à l’ouverture : ' + t.replace(/\s+/g, ' ').slice(0, 300));
    if (k < 3) await pg.click(`${Z} [data-cle="suivante"]`);
  }
  await pg.click(`${Z} [data-ouv-continuer]`); await pause();
  proche((await noter()).score, 3, '3 justes + « Je ne sais pas »');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
  const pts = async (rep, o = {}) => { await monter({ uid: 'a85-a', rep: { ...OUV_JUSTES, ...rep }, ...o }); return (await noter()).score; };
  const prep = ids.find((x) => !/img/.test(x));
  proche(await pts({}), 4, 'quatre justes');
  proche(await pts({ [prep]: '@nsp' }), 3, 'trois justes + « Je ne sais pas »');
  proche(await pts({ [prep]: OUV_FAUSSES[prep] }), 2.5, `trois justes + une fausse (${prep}, − 1 ÷ 2)`);
  proche(await pts(OUV_FAUSSES), 0, 'tout faux');
});

// ─────────────────────────────────────────────────────────── les deux témoins
for (const uid of ['a85-a', 'a85-b']) {
  const J = T[uid];
  await v(`ENT-8.10 : témoin ${uid} (${J.site}) — parcours juste à l’écran : 20/20 à la remise, égal à noter(db) ; la clôture du quai NE rend PAS la copie ; messages de ${J.tuteur} (13 janvier, aucune année) ; aucun mot qui juge, aucun « Corriger », aucun bilan ; pastilles « fait » ; « Au quai » et le quai grisés au départ`, async () => {
    capturer = uid === 'a85-a';
    await monter({ uid });
    vrai(await present('.ent-nav[data-vue-fermee="telephone"]') && await present('.ent-nav[data-vue-fermee="quai"]'), '« Au quai » et le quai grisés au départ');
    const E0 = await entrants();
    egal(E0.map((m) => [m.from, m.subject]), [[J.tuteur, 'Ce matin, tu reçois le camion de décoration']], 'message d’accueil');
    vrai(E0[0].text.includes(`${J.cariste} décharge, tu diriges et tu contrôles.`), 'le cariste du site dans l’accueil');
    const d0 = new Date(E0[0].ts);
    egal([d0.getMonth(), d0.getDate(), d0.getHours(), d0.getMinutes()], [0, 13, 6, 30], 'mercredi 13 janvier, 6 h 30');
    await protocole(J.proto);
    await accueil();
    await quai(J);
    egal(await copies(), 0, 'la copie est rendue à la clôture du quai');
    vrai(!(await present('[data-copie-etat="rendue"]')), 'copie rendue au bandeau');
    vrai(/Réception close/.test(await texte()), 'la réception est close');
    await compteRendu(J.cr);
    const E = await entrants();
    egal(E.map((m) => m.subject), ['Ce matin, tu reçois le camion de décoration', 'Le camion est là', 'Le quai 3', 'Fais-moi le point', 'Merci'], 'messages');
    vrai(E.every((m) => m.from === J.tuteur), 'expéditeurs');
    vrai(!E.some((m) => JUGE.test(m.text)), 'un message qui juge : ' + E.map((m) => m.text).find((t) => JUGE.test(t)));
    vrai(!E.some((m) => /20\d\d/.test(m.text)), 'une année dans un message');
    const ecran = await texte();
    vrai(!JUGE.test(ecran), 'un mot qui juge à l’écran : ' + (ecran.match(JUGE) || [])[0]);
    vrai(!/Corriger/.test(ecran) && !(await present('[data-fin-jalon]')) && !(await present('[data-fin-seance] [data-fin]')), '« Corriger » ou bilan à l’écran');
    egal(await pg.$$eval(`${Z} [data-pastille]`, (L) => L.map((x) => x.classList.contains('fait'))), [true, true, true, true], 'pastilles « fait »');
    const n = await noter();
    egal(JALONS.filter((j) => n.detail[j] !== 'ok'), [], 'jalons');
    egal([n.score, n.max], [20, 20], 'noter(db) : ' + JSON.stringify(n.detail).slice(0, 400));
    egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
    await capture('7-avant-remise', '[data-copie-rendre]');
    const c = await rendre();
    egal([c.score, c.max], [n.score, n.max], 'la note rendue = noter(db)');
    vrai(await present('[data-copie-etat="rendue"]'), 'copie rendue à l’écran');
    await capture('8-copie-rendue');
    capturer = false;
    egal(erreursF, [], 'erreurs JavaScript');
  });
}

// ─────────────────────────────────────────────────────────── inaction, dialogue, inspection, dépose, compte rendu
await v('ENT-8.10 : inaction — rien fait (ouverture sans réponse, aucun écran) → 0/20, aucun jalon juste ; copie vide rendue → 0', async () => {
  await monter({ uid: 't810-rien', sansOuverture: true });
  const n = await noter();
  egal([n.score, n.max], [0, 20], 'note');
  egal(JALONS.filter((j) => n.detail[j] === 'ok'), [], 'jalons justes sans rien faire');
  egal((await rendre()).score, 0, 'copie vide rendue');
});

await v('ENT-8.10 : dialogue en évaluation — « Oui, restez dans votre cabine » à « attente » : aucune réaction, Thomas enchaîne sur la réplique suivante, un seul appel ; seul ce jalon ✗ (la première réponse compte)', async () => {
  await monter({ uid: 'a85-a' });
  await protocole(T['a85-a'].proto);
  await allerV('telephone');
  vrai(/Le camion de décoration arrive au quai 3/.test(await texte()), 'la situation avant l’entretien');
  egal(await pg.textContent(`${Z} [data-dlg-appeler="thomas"]`), 'Aller le voir', 'face à face');
  await pg.click(`${Z} [data-dlg-appeler="thomas"]`); await pause();
  vrai(/stagiaire à la réception de GXO/.test(await pg.textContent(`${Z} [data-dlg-fil]`).catch(() => '')) || await present('[data-dlg-choix="presente"]'), 'la présentation du site');
  for (const r of ['arrivee', 'documents', 'quai']) { await pg.click(`${Z} [data-dlg-choix="${DIAL[r]}"]`); await pause(); }
  await pg.click(`${Z} [data-dlg-choix="cabine"]`); await pause();
  vrai(await present('[data-dlg-choix="fin-poli"]'), 'Thomas n’enchaîne pas sur la réplique suivante');
  const fil = await pg.textContent(`${Z} [data-dlg-fil]`);
  vrai(!/protocole ne dit pas|D’accord…|Je n’ai pas le droit/.test(fil), 'une réaction de Thomas : ' + fil);
  await pg.click(`${Z} [data-dlg-choix="fin-poli"]`); await pause();
  vrai(/Très bien, à tout à l’heure\./.test(await pg.textContent(`${Z} [data-dlg-fil]`)), 'la dernière bulle');
  await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
  vrai(!(await present('[data-dlg-appeler="thomas"]')) || !/Revenir/.test(await pg.textContent(`${Z} [data-dlg-appeler="thomas"]`)), 'un second appel est proposé');
  const d = await detail();
  egal(['accueil-salutation', 'accueil-documents', 'accueil-quai', 'accueil-attente', 'accueil-fin'].map((j) => d[j]), ['ok', 'ok', 'ok', 'ko', 'ok'], 'jalons de l’accueil');
});

await v('ENT-8.10 : inspection — « C’est bon » sans rien signaler : rien n’arrête l’élève, le déchargement s’ouvre ; danger ✗ et aucun faux ✗ ; un défaut et une marque à côté reçoivent la même réponse neutre', async () => {
  await monter({ uid: 'a85-b' });
  await protocole(T['a85-b'].proto); await accueil();
  await allerV('quai'); await pg.waitForSelector(SVG);
  vrai(/Avant que Hugo entre dans le camion, regarde le quai et le camion\./.test(await texte()), 'la consigne au-dessus de la scène');
  await marquer('cale'); await signaler();
  const c1 = await chef();
  await marquer('lampe'); await signaler();
  const c2 = await chef();
  egal([c1, c2], ['Hugo : « C’est noté. Dis-moi quand on peut décharger. »', 'Hugo : « C’est noté. Dis-moi quand on peut décharger. »'], 'réponses du cariste (défaut, objet en ordre)');
  // Un autre élève : « C’est bon » tout de suite.
  await monter({ uid: 'a85-b' });
  await protocole(T['a85-b'].proto); await accueil();
  await allerV('quai'); await pg.waitForSelector(SVG);
  await cestBon();
  vrai(!(await present('[data-q-secu-arret]')), 'le cariste arrête l’élève en évaluation');
  vrai(await present('[data-q="decharger"]'), 'le déchargement ne s’ouvre pas');
  const d = await detail();
  egal([d['securite-danger'], d['securite-aucun-faux']], ['ko', 'ko'], 'rien signalé');
});

await v('ENT-8.10 : dépose en copie — le premier clic pose, même sur l’allée piétonne ou devant le quai 4 : aucune bulle de réaction, aucune case grisée ; le jalon lit ce premier clic', async () => {
  await monter({ uid: 'a85-a' });
  await protocole(T['a85-a'].proto); await accueil();
  await inspecter([['cabine']]);
  await pg.click(`${Z} [data-q="decharger"]`);
  await pg.waitForSelector(`${Z} [data-q-phase="choix"]`);
  const avantR = await annonce();
  for (const [p, c] of [['P4', 'allee-1'], ['P3', 'quai4-1'], ['P2', 'R1'], ['P1', 'R2']]) {
    const n = await posees();
    await pg.click(`${Z} [data-q="depose"][data-c="${c}"]`); await pause();
    egal(await posees(), n + 1, `${p} posée en ${c} au premier clic`);
    vrai(!(await present('.quai-case-grisee')) && !(await present('[data-case-grisee]')), 'une case grisée en évaluation');
    const a = await annonce();
    vrai(!/piétonne : je ne pose pas|zone du quai/.test(a), 'une réaction du cariste : ' + a);
  }
  vrai(!/piétonne|zone du quai/.test(avantR), 'la bulle avant la première palette : ' + avantR);
  const e = (await base()).quais[QID].depose;
  egal(Object.fromEntries(Object.entries(e).map(([p, x]) => [p, [x.premier, x.pose]])),
    { P4: ['allee-1', 'allee-1'], P3: ['quai4-1', 'quai4-1'], P2: ['R1', 'R1'], P1: ['R2', 'R2'] }, 'état de la dépose');
  const d = await detail();
  egal(['depose-P1', 'depose-P2', 'depose-P3', 'depose-P4'].map((j) => d[j]), ['ok', 'ok', 'ko', 'ko'], 'jalons de la dépose');
  vrai(await present('[data-q="vers3"]:not([disabled])'), 'le contrôle ne s’ouvre pas');
});

await v('ENT-8.10 : rendre compte — l’élève (t810-0) accepte sa palette à problème sans réserve et écrit « Tout est conforme, aucune réserve. » → contrôle ✗, réserve ✗, compte rendu ✓ ; la phrase des vraies réserves est proposée en piège', async () => {
  await monter({ uid: 't810-0' });
  const J = T['t810-0'];
  await parcours('t810-0', { pal: { P1: [40, 'accepter'] }, res: { P1: null }, cr: { reception: 'Tout est conforme, aucune réserve.' } });
  const d = await detail();
  egal([d['palette-probleme'], d.reserve, d.deballage, d.signature, d['cr-reception'], d['palette-piege']], ['ko', 'ko', 'ok', 'ok', 'ok', 'ok'], 'une erreur payée une fois');
  proche((await noter()).score, 20 - 2 - 1, 'note');
  const decl = (await base()).mails.find((m) => m.folder === 'in' && m.subject === 'Fais-moi le point').phrases.lignes.find((l) => l.id === 'reception');
  egal(decl.choix[decl.juste], 'Tout est conforme, aucune réserve.', 'la phrase juste : ce que l’élève a fait');
  vrai(decl.choix.includes(J.cr.reception), 'la phrase des vraies réserves en piège : ' + decl.choix.join(' / '));
  // Le même élève, réserve juste et compte rendu « tout est conforme » : compte rendu ✗.
  await monter({ uid: 't810-0' });
  await parcours('t810-0', { cr: { reception: 'Tout est conforme, aucune réserve.' } });
  const d2 = await detail();
  egal([d2['palette-probleme'], d2.reserve, d2['cr-reception']], ['ok', 'ok', 'ko'], 'réserve écrite mais compte rendu « tout conforme »');
});

await v('ENT-8.10 : « sous réserve de déballage » ajoutée → déballage ✗ seul ; quantité fausse dans la réserve → réserve ✗ et palette ✓ (le comptage et la décision sont justes)', async () => {
  await monter({ uid: 'a85-b' });
  await parcours('a85-b', { deballage: true, res: { P2: '3' }, cr: { reception: 'Réserves signées par Thomas : P2, 3 cartons abîmés.' } });
  const d = await detail();
  egal(JALONS.filter((j) => d[j] !== 'ok'), ['reserve', 'deballage'], 'jalons faux');
});

// ─────────────────────────────────────────────────────────── l’écran, le corrigé
await v('ENT-8.10 : écrans à 1366 × 768 — la fiche (protocole à gauche, lisible sans défiler), l’accueil, le quai pendant la dépose et aux réserves, le compte rendu : aucun défilement horizontal', async () => {
  capturer = true;
  await monter({ uid: 'a85-b' });
  await allerV('fiche');
  // Comme l’élève qui ouvre l’écran : la page en haut (le cas d’avant a pu la laisser défilée).
  const g = await pg.evaluate((Z) => {
    window.scrollTo(0, 0);
    const doc = document.querySelector(`${Z} [data-fiche-panneau] .pr-doc`).getBoundingClientRect();
    const f = document.querySelector(`${Z} [data-fiche="protocole-810"]`).getBoundingClientRect();
    return { docBas: doc.bottom, docG: doc.left, ficheG: f.left, h: window.innerHeight };
  }, Z);
  await capture('1b-protocole-belleville');
  vrai(g.docG < g.ficheG, 'le protocole est à gauche de la fiche');
  vrai(g.docBas <= g.h + 2, `le protocole dépasse le bas de l’écran (${Math.round(g.docBas)} > ${g.h})`);
  vrai(/Kuehne\+Nagel/.test(await pg.textContent(`${Z} [data-fiche-panneau]`)), 'le protocole du site');
  vrai(await large() <= 0, 'fiche : défilement horizontal');
  await protocole(T['a85-b'].proto);
  await allerV('telephone');
  vrai(await large() <= 0, 'accueil : défilement horizontal');
  await accueil();
  await inspecter([['cale']]);
  await pg.click(`${Z} [data-q="decharger"]`); await pg.waitForSelector(`${Z} [data-q-phase="choix"]`);
  egal(await pg.$$eval(`${Z} [data-q="depose"]`, (L) => L.map((x) => x.dataset.c)), ['allee-1', 'R1', 'R2', 'R3', 'R4', 'quai4-1'], 'six cases proposées');
  vrai(await large() <= 0, 'quai pendant la dépose : défilement horizontal');
  for (const p of SORTIE) { await pg.click(`${Z} [data-q="depose"][data-c="${DEPOSE_JUSTE[p]}"]`); await pause(); }
  await controler(T['a85-b'], { sansClore: true });
  vrai(await large() <= 0, 'quai aux réserves : défilement horizontal');
  await allerV('mail');
  vrai(await large() <= 0, 'messagerie : défilement horizontal');
  capturer = false;
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.10 : le corrigé de l’enseignant se calcule pour un élève (son site, ses situations, son anomalie, ses palettes, sa phrase) et pour un élève qui n’a pas ouvert ; aucune adresse hors du site', async () => {
  const c = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-8.10.js');
    const D = await import('/contenus/action-ent810-donnees.js');
    const g = 'a85-b|action-evaluation-reception';
    const e = C.corrigeEleve({ tirage: { graine: 'a85-b' }, tirages: { [D.ID]: { graine: g, ...D.TIRAGE.tirer(g) } } }, 'a85-b');
    const vide = C.corrigeEleve({}, 't810-0');
    return { n: C.CORRIGE.items.length, items: e.items.map((x) => [x.texte, x.rep]), vide: [vide.texte, vide.items.map((x) => x.rep).join(' | ')] };
  });
  vrai(c.n >= 5, 'corrigé commun');
  vrai(c.items.some(([t, r]) => /Site tiré/.test(t) && /Belleville-en-Beaujolais \(Kuehne\+Nagel\)/.test(r) && /Hugo/.test(r)), 'le site de l’élève');
  vrai(c.items.some(([t, r]) => /Situation \(facile\) : Un collègue à pied traverse devant le quai pendant que Hugo décharge\./.test(t) && /allée piétonne/.test(r)), 'une situation');
  vrai(c.items.some(([t, r]) => /anomalie/.test(t) && r === 'Cale de roue absente'), 'l’anomalie');
  vrai(c.items.some(([t, r]) => /^P2/.test(t) && /face arrière/.test(r) && /réserve : 1/.test(r)), 'la palette à problème');
  vrai(c.items.some(([, r]) => r === 'Réserves signées par Thomas : P2, 1 carton abîmé.'), 'la phrase du compte rendu');
  vrai(/n’a pas encore ouvert/.test(c.vide[0]) && /Onnaing/.test(c.vide[0]) && /manquants/.test(c.vide[1]), 'élève qui n’a pas ouvert : ' + c.vide.join(' / '));
  egal([...hotes], [], 'requêtes hors du site');
  egal(erreursF, [], 'erreurs JavaScript');
});

await F.fermer();
}
