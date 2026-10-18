// Suite de tests de Prepalog — bloc `chep-94` : ENT-9.4 CHEP, évaluation « la semaine de Légumes de la Lys » (brief
// `docs/briefs/ENT-9.4-chep-evaluation.md` §8). Créé le 18/10/2026. Aides communes : `outils/test/chep/commun.mjs` (rien d'ajouté).
//
// La séance est montée dans une page (1366 × 900, puis 1366 × 768 pour l'ergonomie), avec la fabrique et le moteur réels ; de vrais clics ;
// mouvement réduit (le cariste pose d'emblée). Copie rendue : `noter(db)` (comme `action-810`) et une remise enregistrée par le montage.
//
// VALEURS ÉCRITES À LA MAIN (le code les calcule, le test les écrit) :
// - TÉMOIN 1 (graine `@temoin…`, brief §6) : A S0 150 + E 180 − T 22 (Primeurs du Delta) − 16 CHEP du bordereau `pa-lpr` (20 dont 4 LPR, MarchéLys),
//   `nm-commande` (240) → SOLDE 292 ; documents A émission, B partiel, C transfert, D commande ; relevé : B3 180, C4 16, C5 22, solde en D6.
//   B P1 un Logipal au n° 8, P2 juste, P3 une abîmée au n° 5 (face gauche), P4 à 13 → reçues 58, autre pool 1, À CRÉDITER 57, réparation 1,
//   manquantes 2. C les médianes : Frais du Nord 130, Halles d'Artois 110, Hainaut Primeurs 100, Primeurs du Delta 75 (415 > 390) ; MarchéLys 395.
// - TÉMOIN 2 (graine `@temoin2`) : S0 135 + 200 − 24 − 17 (`pa-europe`, 22 dont 5 Europe, Hainaut Primeurs), `nm-europe` → 294 ; documents A sans
//   mouvement, B transfert, C partiel, D émission ; P1 juste, P2 à 13, P3 deux LPR (n° 5 et 11), P4 deux abîmées (n° 3 avant, n° 12 arrière) →
//   à créditer 56, hors pool 2, réparation 2 ; Halles d'Artois (Douai) a signalé le plus tard.
// - La ramasse (médianes), une tournée juste et une fausse par pièce de `dernier` (l'ordre se raisonne à la main : Douai ferme à 9 h 30, il passe
//   tôt ; Frais du Nord n'ouvre qu'à 13 h, il passe en dernier ; Prouvy ouvre à 9 h ; km et heures relus par la vue) :
//   Frais du Nord reporté (285) : juste Halles d'Artois → Primeurs du Delta → Hainaut Primeurs ; faux Hainaut → Halles → Delta (Douai fermé, le plus court) ;
//   Halles d'Artois reporté (305) : juste Delta → Hainaut → Frais du Nord ; faux Frais du Nord → Hainaut → Delta (le plus court) ;
//   Hainaut reporté (315) : juste Halles → Delta → Frais du Nord (le plus court) ; faux Frais du Nord → Halles → Delta ;
//   Delta reporté (340) : juste Halles → Hainaut → Frais du Nord (le plus court, le seul) ; faux Hainaut → Halles → Frais du Nord (Douai fermé).
// - Deux élèves RÉELS (graines trouvées une fois pour toutes, puis écrites ici, cas « jeu figé ») : `eleve-94-a` et `eleve-94-b` (voir le cas).
// Poids (Cowork, 17/10/2026) : compte 6 (1, 1, 1, 1, 2), retour 6 (0,375 × 4, 1,5, 1,5, 1,5), ramasse 4 (1 × 4), ouverture 4.

import { ouvrirCHEP } from './chep/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {
const F = await ouvrirCHEP({ nav, BASE });
const { pg, Z, pause, base, present, aller, menu, entrants, erreursF, proche } = F;
await pg.emulateMedia({ reducedMotion: 'reduce' });
const CAPTURES = process.env.CAPTURES_ENT94 || '';

const ID = 'chep-evaluation';
const ACT = '/activites/chep-evaluation.js';
const QID = 'chep-retours-eval';
const JUGE = /\b(juste|justes|faux|fausse|fausses|correct|correcte|erreur|erreurs|bravo|bien vu|bonne réponse|mauvaise réponse|à revoir|dépassée?s?|ratée?s?)\b|ne peut pas tout prendre|quai fermé/i;
// Les deux phrases du moteur en évaluation (le barème de l'ouverture, pas un verdict) : retirées avant de chercher un mot qui juge.
const PENALITE = 'Une réponse fausse retire des points. Si tu ne sais pas, choisis « Je ne sais pas » : tu ne perds rien.';
const ATTENTE = 'Réponds à toutes les questions pour continuer : une réponse fausse ne bloque pas.';
const motQuiJuge = (t) => (t.replace(PENALITE, '').replace(ATTENTE, '').match(JUGE) || [null])[0];
const OUV_JUSTES = { 'k-p1': 'loueur', 'k-p2': 'emetteur', 'k-p3': 'hors', 'k-p4': 'reparer', 'k-p5': 'cote', 'k-p6': 'reste',
  'k-d1': 'lys', 'k-d2': 'oui', 'k-d3': 'halles', 'k-d4': 'lys' };
const OUV_FAUSSES = { 'k-p1': 'fabricant', 'k-p2': 'distributeur', 'k-p3': 'declare', 'k-p4': 'jetee', 'k-p5': 'credite', 'k-p6': 'passe',
  'k-d1': 'chep', 'k-d2': 'oubli', 'k-d3': 'chep', 'k-d4': 'chep' };
const OUV_NSP = Object.fromEntries(Object.keys(OUV_JUSTES).map((k) => [k, '@nsp']));

// Monte la séance comme le site (copie : les remises sont enregistrées, les sauvegardes comptées). `o.graine` (défaut `@temoin-dr-dourges`),
// `o.rep` (réponses d'ouverture rangées d'avance, défaut : justes), `o.sansOuverture`.
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
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ch94' },
    jeu: { etat: () => db, sauver: () => { window.__f.sauver += 1; } },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'CH',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__f.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
  return JSON.parse(JSON.stringify(db));
}, { activite: ACT, id: ID, rep: OUV_JUSTES, graine: '@temoin-dr-dourges', ...o });
const noter = () => pg.evaluate(async () => { const A = await import('/activites/chep-evaluation.js'); return A.noter(window.__f.db); });
const copies = () => pg.evaluate(() => window.__f.copies.length);
const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
// Le texte de l'écran de travail, documents exclus (« Le droit » et les conditions disent « faute », « erreur de déclaration »).
const ecran = () => pg.evaluate((Z) => { const c = document.querySelector(Z).cloneNode(true); c.querySelectorAll('.ent-doc, .ch-doc, .qo-feuille').forEach((x) => x.remove()); return c.innerText; }, Z);
const capture = async (nom) => {
  if (!CAPTURES) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(`${Z} [data-carte-fermer]`); await pause(40); }
  await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); } };
const envoyer = async () => { await pg.click(`${Z} [data-fiche-envoyer]`); await confirmer(); };
const saisir = async (sel, t) => { await pg.fill(`${Z} ${sel}`, String(t)); await pg.dispatchEvent(`${Z} ${sel}`, 'change'); await pause(30); };
const choisir = async (sel, val) => { await pg.selectOption(`${Z} ${sel}`, val); await pause(30); };
const vers = async (vue) => { await aller('accueil'); await aller(vue); };
let COPIE_T1 = null;   // la copie rendue du témoin 1 (pour la capture du Suivi, seulement avec CAPTURES_ENT94)

// ─────────────────────────────────────────────────────────── jouer chaque partie
// A — les déclarations par rôle { emission: ['emission', 'templemars', 180], … }, puis le relevé { B3: 180, … }.
async function declarer(D, { envoi = true, cap = '' } = {}) {
  await vers('fiche');
  for (const [role, [type, part, qte]] of Object.entries(D)) {
    if (type != null) await choisir(`#fi-type-${role}`, type);
    if (part != null) await choisir(`#fi-part-${role}`, part);
    if (qte != null) await saisir(`#fi-qte-${role}`, qte);
  }
  if (cap) await capture(cap);
  if (envoi) await envoyer();
}
async function relever(cases, { cap = '' } = {}) {
  await vers('fiche:releve');
  for (const [ref, t] of Object.entries(cases)) await saisir(`[data-gr="${ref}"]`, t);
  if (cap) await capture(cap);
  await envoyer();
}
// B — le quai : { P1: [compte, décision, [[motif, valeur], …]], … } ; la clôture en deux clics (copie) ; puis le crédit.
async function quai(plan, { clore = true, cap = '' } = {}) {
  await vers('quai');
  await pg.click(`${Z} [data-q="decharger"]`); await pause(200);
  if (await present('[data-q="passer"]:not([hidden])')) { await pg.click(`${Z} [data-q="passer"]`); await pause(); }
  await pg.waitForSelector(`${Z} [data-q="vers3"]:not([disabled])`);
  await pg.click(`${Z} [data-q="vers3"]`); await pause();
  if (cap) await capture(cap);
  for (const [id, [n, dec, mot]] of Object.entries(plan)) {
    await pg.click(`${Z} [data-q="sel"]:has-text("${id}")`); await pause(60);
    await pg.fill(`${Z} #qCompte`, String(n)); await pg.press(`${Z} #qCompte`, 'Enter'); await pause(40);
    await pg.click(`${Z} #qDec-${dec}`); for (const [m] of mot) await pg.click(`${Z} #qMot-${m}`);
    await pg.click(`${Z} [data-q="valider"]`); await pause(60);
  }
  await pg.click(`${Z} [data-q="vers4"]`); await pause(60);
  if (await present('.quai-arme')) { await pg.click(`${Z} [data-q="vers4"]`); await pause(60); }
  for (const [id, [, , mot]] of Object.entries(plan)) for (const [k, [, val]] of mot.entries()) await pg.fill(`${Z} [data-q-res${k ? '2' : ''}="${id}"]`, String(val));
  await pg.click(`${Z} [data-q="ecrire"]`); await pause();
  await pg.click(`${Z} [data-q="signer"]`); await pause();
  if (clore) { await pg.click(`${Z} [data-q="clore"]`); await pause(); await pg.click(`${Z} [data-q="clore"]`); await pause(); }
}
async function crediter(c, { cap = '' } = {}) {
  await vers('fiche:credit');
  for (const k of ['annoncees', 'aCrediter', 'horsPool', 'reparation']) await saisir(`#fi-${k}`, c[k]);
  if (cap) await capture(cap);
  await envoyer();
}
// C — le besoin, puis la tournée : les sites cliqués dans l'ordre (le reste reste reporté), « Envoyer la tournée » en deux clics.
async function besoin(b, { cap = '' } = {}) {
  await vers('fiche:besoin');
  await saisir('#fi-capacite', b.capacite);
  await choisir('#fi-complet', b.complet);
  if (cap) await capture(cap);
  await envoyer();
}
async function tournee(ordre, { envoi = true, cap = '' } = {}) {
  await vers('tournee');
  for (const id of ordre) { await pg.click(`${Z} [data-reprendre="${id}"]`); await pause(50); }
  if (cap) await capture(cap);
  if (!envoi) return;
  await pg.click(`${Z} [data-tour-terminer]`); await pause(50);
  await pg.click(`${Z} [data-tour-terminer]`); await pause();
}
async function rendre() {
  await pg.click(`${Z} [data-copie-rendre]`); await pause(40);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.waitForFunction(() => window.__f.copies.length >= 1);
  await pause();
  return pg.evaluate(() => window.__f.copies[window.__f.copies.length - 1]);
}

const T1 = {
  decl: { emission: ['emission', 'templemars', 180], partiel: ['transfert', 'marchelys', 16], transfert: ['transfert', 'dourges', 22], nonmvt: ['aucun', 'aucun', 0] },
  releve: { B3: 180, C3: 0, B4: 0, C4: 16, B5: 0, C5: 22, D6: '=D2+SOMME(B3:B5)-SOMME(C3:C5)' },
  quai: { P1: [15, 'reserves', [['produit', 1]]], P2: [15, 'accepter', []], P3: [15, 'reserves', [['avarie', 1]]], P4: [13, 'reserves', [['manquant', 2]]] },
  credit: { annoncees: 60, aCrediter: 57, horsPool: 1, reparation: 1 },
  besoin: { capacite: 390, complet: 'roubaix' },
};
const T2 = {
  decl: { nonmvt: ['aucun', 'aucun', 0], transfert: ['transfert', 'dourges', 24], partiel: ['transfert', 'hainaut-primeurs', 17], emission: ['emission', 'templemars', 200] },
  releve: { B3: 0, C3: 24, B4: 0, C4: 17, B5: 200, C5: 0, D6: '=D2+SOMME(B3:B5)-SOMME(C3:C5)' },
  quai: { P1: [15, 'accepter', []], P2: [13, 'reserves', [['manquant', 2]]], P3: [15, 'reserves', [['produit', 2]]], P4: [15, 'reserves', [['avarie', 2]]] },
  credit: { annoncees: 60, aCrediter: 56, horsPool: 2, reparation: 2 },
  besoin: { capacite: 390, complet: 'roubaix' },
};
const JUSTES = { 'dr-lesquin': ['douai', 'dourges', 'prouvy'], 'dr-douai': ['dourges', 'prouvy', 'lesquin'], 'dr-prouvy': ['douai', 'dourges', 'lesquin'],
  'dr-dourges': ['douai', 'prouvy', 'lesquin'] };
const FAUX = { 'dr-lesquin': ['prouvy', 'douai', 'dourges'], 'dr-douai': ['lesquin', 'prouvy', 'dourges'], 'dr-prouvy': ['lesquin', 'douai', 'dourges'],
  'dr-dourges': ['prouvy', 'douai', 'lesquin'] };
const JALONS = ['fixes', 'partiel', 'non-mouvement', 'colonnes', 'solde', 'compte-P1', 'compte-P2', 'compte-P3', 'compte-P4', 'autre-pool', 'abimees', 'credit',
  'complet', 'reporte', 'tient', 'horaires'];
const kos = (n) => JALONS.filter((j) => n.detail[j] !== 'ok');
async function parcours(J, ordre, o = {}) {
  await declarer(J.decl, { cap: o.cap ? '2-declarations' : '' });
  await relever(J.releve, { cap: o.cap ? '3-releve' : '' });
  await quai(J.quai, { cap: o.cap ? '4-quai-pile' : '' });
  await crediter(J.credit, { cap: o.cap ? '5-credit' : '' });
  await besoin(J.besoin, { cap: o.cap ? '6-besoin' : '' });
  await tournee(ordre, { cap: o.cap ? '7-tournee' : '' });
}

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-9.4 : au registre — meta (1re, C2.5, évaluation en copie, barème 20, questions, pas de parcours ni de correction ni de niveau) ; 16 jalons pondérés = 16 + ouverture 4 ; aucun écran à rouvrir ; quai en copie (`rendCopie: false`, aucune aide, pas de « Recommencer », aucun arrêt) ; tournée muette, un report au plus ; aucun lexique ; fiches sans aide', async () => {
  const r = await pg.evaluate(async () => {
    const I = await import('/activites/index.js');
    const A = await import('/activites/chep-evaluation.js');
    const S = await import('/contenus/chep-ent94.js');
    const Q = await import('/contenus/questions/ENT-9.4.js');
    const Qm = await import('/core/types/quai.js');
    const charges = await Promise.all(I.ACTIVITES.map((f) => f().then((x) => x.meta && x.meta.id).catch(() => null)));
    const m = A.meta, L = Q.QUESTIONS.liste, q = S.quaiDe('el-1');
    const blocs = (f) => (typeof f.blocs === 'function' ? f.blocs({}) : f.blocs);
    const aplat = (B) => B.flatMap((b) => (b.type === 'cadre' ? aplat(b.blocs) : [b]));
    return { inscrite: charges.includes('chep-evaluation'), apres93: charges.indexOf('chep-evaluation') === charges.indexOf('chep-releve-conteste') + 1,
      meta: [m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture, m.parcours || null, m.precedente || null,
        m.correction || null, m.niveauxPrevus || null, m.rubrique, m.immersif, m.portee, m.corrige, m.reinitialisable === undefined],
      noter: typeof A.noter, poids: S.ETAPES.map((e) => [e.id, e.poids]), ecrans: S.ETAPES.filter((e) => e.ecran).length, bonus: S.ETAPES.filter((e) => e.bonus).length,
      groupes: S.ETAPES.reduce((g, e) => { g[e.groupe] = (g[e.groupe] || 0) + e.poids; return g; }, {}),
      ouv: { part: Q.QUESTIONS.part, partOuv: Q.QUESTIONS.ouverture.part, tirage: Q.QUESTIONS.ouverture.tirage,
        prep: L.filter((x) => x.rubrique === 'preparation').length, droit: L.filter((x) => x.rubrique === 'droit').length,
        aides: L.filter((x) => x.aide != null).length, fil: L.filter((x) => x.type !== 'ouverture').length, cles: L.filter((x) => x.cle).length,
        mots: L.filter((x) => (x.enonce + x.choix.map((c) => c.lib).join(' ')).includes('[[')).length, k5: (L.find((x) => x.id === 'k-p5') || {}).doc,
        docs: Q.QUESTIONS.ouverture.documents, docsConnus: Q.QUESTIONS.ouverture.documents.every((d) => S.DOCUMENTS.some((x) => x.id === d)) },
      lexique: Object.keys(S.OPTIONS.lexique).length, pastilles: S.OPTIONS.pastilles || null,
      quai: [q.id, q.rendCopie, q.recommencer, JSON.stringify(q.aides), q.arret || null, q.commence || null, q.camions[0].palettes.length, /Grégory|Compte chaque/.test(q.avertissement)],
      verifier: ['', '@temoin', '@temoin2', 'el-1', 'eleve-94-a'].map((g) => Qm.verifierQuai(S.quaiDe(g))),
      tournee: [S.TOURNEE.id, S.TOURNEE.sansVerdict, S.TOURNEE.quai.max, S.TOURNEE.points({}).map((p) => p.id), typeof S.TOURNEE.quand],
      encadres: S.OPTIONS.fiches.flatMap((f) => aplat(blocs(f))).filter((b) => b.type === 'encadre' || b.consigne).length,
      notes: S.BLOC_RELEVE.lignes({}).filter((l) => l.note).length, colonneAide: S.BLOC_RELEVE.feuille.colonneAide || null,
      placeholder: S.BLOC_RELEVE.lignes({}).map((l) => l.D && l.D.placeholder).filter(Boolean),
      sort: S.OPTIONS.fiches.flatMap((f) => aplat(blocs(f))).some((b) => b.id === 'sort') };
  });
  vrai(r.inscrite && r.apres93, 'la séance n’est pas au registre, juste après ENT-9.3');
  egal(r.meta, ['ENT-9.4', ['1re'], ['C2.5'], 'evaluation', 20, true, 'ENT-9.4', true, 'prof', null, null, null, null, 'simulog', true, 'eleve', './contenus/corriges/ENT-9.4.js', true], 'meta');
  egal(r.noter, 'function', 'export noter');
  egal(r.poids.map(([id, p]) => `${id}:${p}`).join(' '), 'fixes:1 partiel:1 non-mouvement:1 colonnes:1 solde:2 compte-P1:0.375 compte-P2:0.375 compte-P3:0.375 '
    + 'compte-P4:0.375 autre-pool:1.5 abimees:1.5 credit:1.5 complet:1 reporte:1 tient:1 horaires:1', 'poids');
  egal(r.groupes, { 'Repérer et tenir le compte': 6, 'Contrôler le retour': 6, 'Organiser la ramasse': 4 }, 'groupes');
  proche(r.poids.reduce((s, [, p]) => s + p, 0) + r.ouv.part, 20, 'somme');
  egal([r.ecrans, r.bonus], [0, 0], 'aucun écran à rouvrir, aucun bonus');
  egal([r.ouv.part, r.ouv.partOuv, r.ouv.tirage, r.ouv.prep, r.ouv.droit, r.ouv.aides, r.ouv.fil, r.ouv.cles, r.ouv.mots, r.ouv.k5, r.ouv.docsConnus],
    [4, 4, { preparation: 2, droit: 2 }, 6, 4, 0, 0, 10, 0, 'dessin-lpr', true], 'ouverture notée');
  egal([r.lexique, r.pastilles], [0, null], 'ni lexique, ni pastilles');
  egal(r.quai, ['chep-retours-eval', false, false, '{}', null, null, 4, false], 'quai en copie');
  egal(r.verifier, [[], [], [], [], []], 'verifierQuai');
  egal(r.tournee, ['chep-ramasse-eval', true, 1, ['lesquin', 'douai', 'prouvy', 'dourges'], 'function'], 'tournée');
  egal([r.encadres, r.notes, r.colonneAide, r.placeholder, r.sort], [0, 0, null, [' '], false], 'fiches sans aide (encadré, aide de l’accompagné, colonne « Aide », notes, « = », sort)');
});

// ─────────────────────────────────────────────────────────── les données (valeurs écrites à la main)
await v('ENT-9.4 : données — témoin 1 (solde 292 ; 57 à créditer) et témoin 2 (294 ; 56), écrits à la main ; les documents dans l’ordre ; aucun écart ; aucun crochet de lexique dans les documents', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/chep-ent94-donnees.js');
    const S = await import('/contenus/chep-ent94.js');
    const lit = (g) => { const J = D.jeuDe(g), A = D.partieA(J); return { solde: A.solde, docs: A.documents.map((d) => `${d.lettre}:${d.role}:${d.attendu.type}:${d.attendu.part}:${d.attendu.qte}`),
      piles: D.pilesDuJeu(J).map((p) => `${p.id}:${p.hauteur || 15}:${JSON.stringify(p.intrus || {})}:${JSON.stringify(p.abimee || {})}`), c: D.comptesDe(D.pilesDuJeu(J)), e: D.verifier(J) }; };
    const html = (db) => S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html(db) : d.html)).join('');
    return { t1: lit('@temoin'), t2: lit('@temoin2'), crochets: /\[\[|\]\]/.test(html({}) + html({ tirage: { graine: '@temoin2' } })) };
  });
  egal(r.t1.solde, 292, 'témoin 1 : 150 + 180 − 22 − 16');
  egal(r.t1.docs, ['A:emission:emission:templemars:180', 'B:partiel:transfert:marchelys:16', 'C:transfert:transfert:dourges:22', 'D:nonmvt:aucun:aucun:0'], 'témoin 1 : documents');
  egal(r.t1.piles, ['P1:15:{"8":"logipal"}:{}', 'P2:15:{}:{}', 'P3:15:{}:{"5":"W"}', 'P4:13:{}:{}'], 'témoin 1 : piles');
  egal(r.t1.c, { annoncees: 60, recues: 58, autres: 1, aCrediter: 57, reparation: 1, manquantes: 2 }, 'témoin 1 : comptes');
  egal(r.t2.solde, 294, 'témoin 2 : 135 + 200 − 24 − 17');
  egal(r.t2.docs, ['A:nonmvt:aucun:aucun:0', 'B:transfert:transfert:dourges:24', 'C:partiel:transfert:hainaut-primeurs:17', 'D:emission:emission:templemars:200'], 'témoin 2 : documents');
  egal(r.t2.c, { annoncees: 60, recues: 58, autres: 2, aCrediter: 56, reparation: 2, manquantes: 2 }, 'témoin 2 : comptes');
  egal([r.t1.e, r.t2.e, r.crochets], [[], [], false], 'écarts, crochets');
});

await v('ENT-9.4 : la ramasse (médianes) — pour chaque pièce, l’ordre juste écrit à la main tient (camion, horaires), l’ordre faux rate ; le plus court rate dans deux pièces sur quatre ; MarchéLys au camion complet ; les avis donnent le bon « dernier » ; l’attente du camion relevée', async () => {
  const r = await pg.evaluate(async ({ JUSTES, FAUX }) => {
    const D = await import('/contenus/chep-ent94-donnees.js');
    const V = D.MEDIANES;
    const lire = (o) => { const b = D.bilanOrdre(o, V); return { tard: b.creneaux.filter((c) => c.charge && c.trop === 'tard').map((c) => c.id), trop: b.depassements, rep: b.reportes, attente: Math.round(b.attente) }; };
    const out = {};
    for (const P of D.BANQUE_DERNIER) {
      const o = D.ordresDe({ dernier: P.id, vides: V });
      const dernier = Object.entries(P.signale).sort((a, b) => (a[1] < b[1] ? 1 : -1))[0][0];
      out[P.id] = { juste: lire(JUSTES[P.id]), faux: lire(FAUX[P.id]), court: o.court.ordre.join('>'), courtTient: o.court.tient, justes: o.justes.length, dernier, total: o.total };
    }
    return { out, tous: D.bilanOrdre(['lesquin', 'douai', 'prouvy', 'dourges'], V).depassements, banque: D.equiteBanque(V), complet: D.COMPLET, V: D.jeuDe('@temoin').V,
      signale: D.COMPLET_SIGNALE };
  }, { JUSTES, FAUX });
  egal(r.tous, ['vides'], 'les quatre sites ne tiennent pas dans un camion');
  const O = r.out;
  egal(Object.fromEntries(Object.entries(O).map(([k, x]) => [k, x.dernier])), { 'dr-lesquin': 'lesquin', 'dr-douai': 'douai', 'dr-prouvy': 'prouvy', 'dr-dourges': 'dourges' }, 'le dernier à signaler');
  egal(Object.fromEntries(Object.entries(O).map(([k, x]) => [k, x.total])), { 'dr-lesquin': 285, 'dr-douai': 305, 'dr-prouvy': 315, 'dr-dourges': 340 }, 'totaux sans le site reporté');
  for (const k of Object.keys(O)) egal([O[k].juste.tard, O[k].juste.trop, O[k].juste.rep], [[], [], [k.slice(3)]], `${k} : l’ordre juste`);
  egal([O['dr-lesquin'].faux.tard, O['dr-douai'].faux.tard, O['dr-prouvy'].faux.tard, O['dr-dourges'].faux.tard], [['douai'], ['prouvy', 'dourges'], ['douai', 'dourges'], ['douai']], 'les ordres faux');
  egal(Object.fromEntries(Object.entries(O).map(([k, x]) => [k, x.courtTient])), { 'dr-lesquin': false, 'dr-douai': false, 'dr-prouvy': true, 'dr-dourges': true }, 'l’ordre au plus court');
  egal(Object.fromEntries(Object.entries(O).map(([k, x]) => [k, x.justes])), { 'dr-lesquin': 3, 'dr-douai': 2, 'dr-prouvy': 2, 'dr-dourges': 1 }, 'ordres qui tiennent');
  egal(r.banque, [], 'équité de la banque');
  egal([r.complet, r.V, r.signale], ['roubaix', 395, '2027-01-29 07:40'], 'MarchéLys : camion complet, signalé le premier');
  // L'attente relevée (pour le compte rendu : Frais du Nord n'ouvre qu'à 13 h).
  egal(Object.fromEntries(Object.entries(O).map(([k, x]) => [k, x.juste.attente])), { 'dr-lesquin': 39, 'dr-douai': 250, 'dr-prouvy': 299, 'dr-dourges': 252 }, 'attente du camion (min)');
});

await v('ENT-9.4 : diffère de 9.2 — aucun horaire d’enlèvement n’est celui d’ENT-9.2 ; le camion complet n’est plus Frais du Nord ; une fiche « besoin » remplie comme en 9.2 (Frais du Nord) est fausse', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/chep-ent94-donnees.js');
    const S = await import('/contenus/chep-ent94.js');
    const memes = Object.keys(D.SITES).filter((id) => JSON.stringify(D.SITES[id].horaire) === JSON.stringify(D.SITES_ENT92[id].horaire));
    const db = { tirage: { graine: '@temoin' }, fiches: { besoin: { valeurs: { capacite: '390', complet: 'lesquin' }, envoye: { at: 1 } } } };
    return { memes, complet: D.COMPLET, frais: S.ETAPES.find((e) => e.id === 'complet').verifier(db).status };
  });
  egal(r.memes, [], 'horaires identiques à ENT-9.2');
  vrai(r.complet !== 'lesquin', 'le camion complet est celui d’ENT-9.2');
  egal(r.frais, 'ko', 'Frais du Nord au camion complet (la réponse de 9.2)');
});

// ─────────────────────────────────────────────────────────── l'ouverture notée
await v('ENT-9.4 : Avant de commencer — 4 questions (2 + 2), « Je ne sais pas » en dernier, aucune aide, aucun mot qui juge ; k-p5 montre le dessin ; barème : 4 justes = 4, NSP = 0, tout faux = 0 ; rien au Suivi', async () => {
  const db = await monter({ uid: 'ch94-ouv', sansOuverture: true });
  await capture('0-avant-de-commencer');
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
  // k-p5 : le dessin de la palette rouge à gauche (tirage d'un élève qui la reçoit).
  let g = 0; for (; g < 60; g++) { const d = await monter({ uid: `ch94-k5-${g}`, graine: `k5-${g}`, sansOuverture: true }); if (d.questions[ID]['@tirage'].ids.includes('k-p5')) break; }
  vrai(g < 60, 'k-p5 jamais tirée');
  for (let k = 0; k < 4; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    if (id === 'k-p5') { vrai(await present('svg.ch92-dessin'), 'le dessin de k-p5 à gauche'); break; }
    await pg.click(`${Z} [data-q-choix="${OUV_JUSTES[id]}"][data-q="${id}"]`); await pg.click(`${Z} [data-q-repondre="${id}"]`); await pause();
    await pg.click(`${Z} [data-cle="suivante"]`);
  }
  const pts = async (rep) => { await monter({ uid: 'ch94-ouv2', rep }); return (await noter()).score; };
  proche(await pts(OUV_NSP), 0, 'tout « Je ne sais pas »');
  proche(await pts(OUV_FAUSSES), 0, 'tout faux : plancher 0');
  proche(await pts(OUV_JUSTES), 4, 'tout juste');
});

// ─────────────────────────────────────────────────────────── les parcours justes = 20 / 20
for (const [nom, graine, J, ordre] of [['témoin 1 (Primeurs du Delta reporté)', '@temoin-dr-dourges', T1, JUSTES['dr-dourges']],
  ['témoin 2 (Halles d’Artois reporté)', '@temoin2', T2, JUSTES['dr-douai']]]) {
  await v(`ENT-9.4 : parcours juste, ${nom} — 20 / 20 à la remise (= noter) ; aucun mot qui juge avant la remise ; la clôture du quai NE rend PAS la copie ; messages datés du lundi 01/02/2027, neutres ; copie figée après la remise`, async () => {
    const cap = graine === '@temoin-dr-dourges';
    await monter({ uid: `ch94-${graine}`, graine });
    await pg.setViewportSize({ width: 1366, height: 768 });
    const E0 = await entrants();
    egal(E0.map((m) => [m.from, m.subject]), [['Thomas Deroo', 'Nos documents de la semaine dernière'], ['Sandrine Delattre', 'Ta journée']], 'messages à l’ouverture');
    vrai(/Rendre ma copie/.test(E0[1].text) && /trois parties sont envoyées/.test(E0[1].text), 'Sandrine dit quand rendre');
    const M0 = await menu();
    vrai(M0.includes('fiche') && M0.includes('quai') && M0.includes('fiche:besoin') && !M0.includes('fiche:releve') && !M0.includes('fiche:credit') && !M0.includes('tournee'),
      'menu au départ : ' + M0.join(', '));
    if (cap) {
      await vers('mail');
      const id = E0[1].id;
      await pg.click(`${Z} [data-mail="${id}"]`); await pause();
      await capture('1-accueil-message-sandrine');
    }
    await declarer(J.decl, { cap: cap ? '2-declarations' : '' });
    egal(motQuiJuge(await ecran()), null, 'déclarations : un mot qui juge');
    await relever(J.releve, { cap: cap ? '3-releve' : '' });
    egal(motQuiJuge(await ecran()), null, 'relevé : un mot qui juge');
    await quai(J.quai, { cap: cap ? '4-quai-pile' : '' });
    egal(await copies(), 0, 'la clôture du quai a rendu la copie');
    vrai(!(await present('[data-copie-etat="rendue"]')) && !(await present('[data-q-bilan] table, table.quai-bilan')), 'copie rendue ou bilan au quai');
    egal(motQuiJuge(await ecran()), null, 'quai clos : un mot qui juge');
    await crediter(J.credit, { cap: cap ? '5-credit' : '' });
    await besoin(J.besoin, { cap: cap ? '6-besoin' : '' });
    await tournee(ordre, { cap: cap ? '7-tournee' : '' });
    egal(motQuiJuge(await ecran()), null, 'tournée envoyée : un mot qui juge');
    const E = await entrants();
    egal(E.map((m) => [m.from, m.subject, m.text]), [['Thomas Deroo', 'Nos documents de la semaine dernière', E[0].text], ['Sandrine Delattre', 'Ta journée', E[1].text],
      ['Grégory Vandamme', 'Bien reçu', 'Bien reçu.\n\nGrégory'], ['Yannick Desmet', 'Bien reçu', 'Bien reçu.\n\nYannick']], 'messages');
    vrai(E.every((m) => new Date(m.ts).getFullYear() === 2027 && new Date(m.ts).getMonth() === 1 && new Date(m.ts).getDate() === 1), 'date du scénario : '
      + E.map((m) => new Date(m.ts).toISOString()).join(', '));
    vrai(!E.some((m) => JUGE.test(m.text)), 'un message qui juge');
    const n = await noter();
    egal(kos(n), [], 'jalons faux');
    egal(n.detail.ouverture && n.detail.ouverture.points, 4, 'ouverture');
    egal([n.score, n.max], [20, 20], 'noter(db)');
    egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
    const c = await rendre();
    egal([c.score, c.max], [20, 20], 'la note rendue');
    if (cap) COPIE_T1 = c;
    vrai(await present('[data-copie-etat="rendue"]'), 'copie rendue à l’écran');
    if (cap) await capture('8-apres-remise');
    // Copie figée : plus rien ne se sauve, ni le quai, ni une fiche, ni la tournée.
    const avant = await pg.evaluate(() => [window.__f.sauver, JSON.stringify(window.__f.db.fiches), JSON.stringify(window.__f.db.transport)]);
    await vers('tournee');
    await pg.$$eval(`${Z} [data-reprendre], ${Z} [data-tour-raz], ${Z} [data-tour-terminer]`, (L) => L.forEach((b) => b.dispatchEvent(new MouseEvent('click', { bubbles: true }))));
    await vers('fiche');
    await pg.$$eval(`${Z} [data-fiche-envoyer]`, (L) => L.forEach((b) => b.dispatchEvent(new MouseEvent('click', { bubbles: true }))));
    await pause();
    const apres = await pg.evaluate(() => [window.__f.sauver, JSON.stringify(window.__f.db.fiches), JSON.stringify(window.__f.db.transport)]);
    egal(apres, avant, 'la copie bouge après la remise');
    egal(await copies(), 1, 'une seule remise');
    vrai(!(await present('[data-copie-rendre]')), 'le bouton « Rendre » est encore là');
    await pg.setViewportSize({ width: 1366, height: 900 });
    egal(erreursF, [], 'erreurs JavaScript');
  });
}

// ─────────────────────────────────────────────────────────── voisin, inaction, ramassage
// Raisonné à la main : ses quantités ne sont pas celles du témoin 2 (fixes, partiel) ; ses lignes (B transfert, C partiel, D émission) ne sont pas dans
// l'ordre des cases recopiées (colonnes) ; P2 (13) et P4 (15) mal comptées ; l'autre pool (P3) et les abîmées (P4) pas vus ; le crédit, d'après CE
// contrôle (14 + 15 + 15 + 13 = 57, 1, 1), reste juste ; Primeurs du Delta reporté au lieu de Halles d'Artois. 20 − 7,75 = 12,25.
await v('ENT-9.4 : la copie d’un voisin — les réponses justes du témoin 1 jouées par le témoin 2 : 12,25 (documents, colonnes, deux piles, autres pools, abîmées, site reporté)', async () => {
  await monter({ uid: 'ch94-voisin', graine: '@temoin2' });
  await parcours(T1, JUSTES['dr-dourges']);
  const n = await noter();
  egal(kos(n), ['fixes', 'partiel', 'colonnes', 'compte-P2', 'compte-P4', 'autre-pool', 'abimees', 'reporte'], 'jalons faux');
  proche(n.score, 12.25, 'note');
});

await v('ENT-9.4 : inaction 0 — rien fait (ouverture sans réponse) → 0 / 20, aucun jalon juste ; une copie vide se rend à 0 ; « Je ne sais pas » partout avec un travail juste → 16', async () => {
  await monter({ uid: 'ch94-rien', sansOuverture: true });
  const n = await noter();
  egal([n.score, n.max], [0, 20], 'note');
  egal(JALONS.filter((j) => n.detail[j] === 'ok'), [], 'jalons justes sans rien faire');
  await monter({ uid: 'ch94-rien2', rep: OUV_NSP });
  egal((await rendre()).score, 0, 'copie vide rendue');
  await monter({ uid: 'ch94-nsp', rep: OUV_NSP });
  await parcours(T1, JUSTES['dr-dourges']);
  proche((await noter()).score, 16, 'NSP partout, travail juste');
});

await v('ENT-9.4 : ramassage d’une copie incomplète — seule la partie A envoyée : `ramasser` note la base (6 + ouverture 4 = 10), au nom de l’élève, la fige ; quai jamais ouvert : pas d’erreur', async () => {
  await monter({ uid: 'ch94-ram' });
  await declarer(T1.decl);
  await relever(T1.releve);
  const db = await base();
  const r = await pg.evaluate(async (db) => {
    const { B } = await import('/core/backend.js');
    const { ramasser } = await import('/core/copie.js');
    const A = await import('/activites/chep-evaluation.js');
    await B.ecrireJeuPrive('u-ch94', 'chep-evaluation', db);
    await B.poserNote('g-ch94', 'u-ch94', 'chep-evaluation', null);
    const un = await ramasser(B, { gid: 'g-ch94', eleve: { uid: 'u-ch94', nom: 'Martin', prenom: 'Zoé' }, module: A });
    const deux = await ramasser(B, { gid: 'g-ch94', eleve: { uid: 'u-ch94', nom: 'Martin', prenom: 'Zoé' }, module: A });
    return { un: un.ok && { score: un.travail.score, max: un.travail.max, ramasse: un.travail.ramasse, nom: un.travail.nom, quai: !!un.travail.detail.quai,
      etats: ['fixes', 'solde', 'compte-P1', 'credit', 'tient'].map((j) => un.travail.detail[j]) }, deux: deux.raison };
  }, db);
  egal(r.un, { score: 10, max: 20, ramasse: true, nom: 'Martin', quai: true, etats: ['ok', 'ok', 'attente', 'attente', 'attente'] }, 'copie ramassée');
  egal(r.deux, 'rendue', 'ramassée deux fois');
});

await v('ENT-9.4 : quai en copie noté — la note de la séance est celle des jalons, jamais celle du quai ni de la tournée : quai juste seul → 4,5 + 4 ; le détail du quai est rangé (noteQuai sur des piles) ; quai jamais ouvert → aucun plantage, 4', async () => {
  await monter({ uid: 'ch94-quai' });
  await quai(T1.quai);
  const n = await noter();
  proche(n.score, 8.5, 'quai juste seul : compte 1,5 + autres pools 1,5 + abîmées 1,5 + ouverture 4');
  vrai(n.detail.quai && typeof n.detail.quai.jalons === 'number' && n.detail.quai.reception != null, 'le détail du quai : ' + JSON.stringify(n.detail.quai));
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/chep-evaluation.js');
    const vide = A.noter({ tirage: { graine: 'el-3' }, questions: window.__f.db.questions });
    const T = { tirage: { graine: '@temoin' }, transport: { 'chep-evaluation': { tournee: { ordre: ['douai', 'prouvy', 'lesquin'], quai: ['dourges'], termine: 5 } } } };
    return { vide: [vide.score, !!vide.detail.quai], tournee: A.noter(T).score };
  });
  egal(r.vide, [4, true], 'quai jamais ouvert');
  egal(r.tournee, 3, 'tournée juste seule : reporté 1 + tient 1 + horaires 1 (sans ouverture)');
});

await v('ENT-9.4 : pièges un par un — tout le camion du partiel (2 ✗), commande en émission (3 ✗ ; le relevé lit SES lignes), solde tapé à la main (5 ✗), « 15 » recopié pour la pile à 13 (compte-P4 ✗ ; le crédit d’après son contrôle reste juste), les 60 annoncées créditées (9 ✗), Frais du Nord au camion complet (10 ✗), aucun site reporté (11 ✗, 12 ✗)', async () => {
  await monter({ uid: 'ch94-pieges' });
  const decl = { ...T1.decl, partiel: ['transfert', 'marchelys', 20], nonmvt: ['emission', 'templemars', 240] };
  await declarer(decl);
  // Ses lignes : A émission 180, B partiel 20, C transfert 22, D « émission » 240 → quatre lignes ; solde tapé à la main (juste d'après ses cases).
  await relever({ B3: 180, C3: 0, B4: 0, C4: 20, B5: 0, C5: 22, B6: 240, C6: 0, D7: 150 + 180 - 20 - 22 + 240 });
  await quai({ ...T1.quai, P4: [15, 'accepter', []] });
  await crediter({ annoncees: 60, aCrediter: 60, horsPool: 1, reparation: 1 });
  await besoin({ capacite: 390, complet: 'lesquin' });
  await tournee(['douai', 'dourges', 'prouvy', 'lesquin']);   // les quatre : le camion déborde (12 ✗), les horaires tiennent
  const n = await noter();
  egal(kos(n), ['partiel', 'non-mouvement', 'solde', 'compte-P4', 'credit', 'complet', 'reporte', 'tient'], 'jalons faux');
  const c = await pg.evaluate(async () => (await import('/contenus/chep-ent94-donnees.js')).creditDeSonControle(window.__f.db));
  egal(c, { aCrediter: 59, horsPool: 1, reparation: 1 }, 'crédit d’après son contrôle (P4 comptée 15)');
});

// ─────────────────────────────────────────────────────────── aucun verdict à l'écran
await v('ENT-9.4 : aucun verdict avant la remise — la jauge de la tournée reste muette avec quatre sites (rien de « ne peut pas tout prendre », ni « quai fermé ») ; la fiche incomplète dit seulement « Il manque » ; le quai ne s’arrête jamais', async () => {
  await monter({ uid: 'ch94-muet' });
  await besoin(T1.besoin);
  await tournee(['lesquin', 'prouvy', 'dourges', 'douai'], { envoi: false });
  const j = await pg.evaluate((Z) => { const z = document.querySelector(Z); const t = z.querySelector('.tour-jauges, [data-tour-profil]'); return { jauge: t ? t.innerText : '', crit: z.querySelectorAll('.pastille.crit, .pastille.ok, .tour-j-trop, .jauge-trop').length }; }, Z);
  vrai(!JUGE.test(j.jauge) && !/ne peut pas tout|fermé|dépassée|raté|respecté|tient pas|à quai fermé/i.test(j.jauge), 'la jauge parle : ' + j.jauge.replace(/\s+/g, ' ').slice(0, 400));
  vrai(/max 390 palettes/.test(j.jauge.replace(/\s+/g, ' ')), 'la jauge ne montre plus sa limite : ' + j.jauge.replace(/\s+/g, ' ').slice(0, 200));
  egal(j.crit, 0, 'pastilles de verdict à la tournée');
  egal(motQuiJuge(await ecran()), null, 'tournée : un mot qui juge');
  // Une fiche incomplète : « Il manque », sans jugement.
  await vers('fiche');
  await choisir('#fi-type-emission', 'emission');
  await pg.click(`${Z} [data-fiche-envoyer]`); await pause(80);
  const t = await ecran();
  vrai(/Il manque/.test(t) && !motQuiJuge(t), 'fiche incomplète : ' + (t.match(/Il manque[^\n]*/) || [''])[0]);
  egal((await base()).fiches.decl.envoye, undefined, 'fiche incomplète envoyée');
  // Le quai : « 15 » partout, rien ne l'arrête, aucun chef de quai, aucun tableau de bilan.
  await quai({ P1: [15, 'accepter', []], P2: [15, 'accepter', []], P3: [15, 'accepter', []], P4: [15, 'accepter', []] });
  vrai(!(await present('[data-q-chef], [data-q-chef-deballage], .quai-alerte, table.quai-bilan')), 'le quai arrête ou juge');
  vrai(/Réception close/.test(await ecran()) && !motQuiJuge(await ecran()), 'quai clos : ' + motQuiJuge(await ecran()));
  egal(erreursF, [], 'erreurs JavaScript');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-9.4 : tirage — 300 élèves : zéro secours, zéro écart ; chaque pièce entre 40 et 60 % (A), chaque « dernier » entre 15 et 35 % ; vides, V, histoires, intrus et dégâts variés, dans les bornes', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/chep-ent94-donnees.js');
    const Q = await import('/core/types/quai.js');
    const out = { secours: 0, ecarts: [], partiel: {}, nonMvt: {}, dernier: {}, V: new Set(), vides: {}, combis: new Set(), ordres: new Set(), docs: new Set(), bords: 0, arriere: 0,
      credit: new Set(), soldes: new Set(), i: new Set(), a: new Set(), m: new Set() };
    for (let k = 0; k < 300; k++) {
      const t = D.tirageDe(`el-${k}`), J = t.jeu;
      if (t.secours) out.secours++;
      const e = D.verifier(J); if (e.length) out.ecarts.push(`${k}: ${e.join(' ; ')}`);
      for (const x of ['partiel', 'nonMvt', 'dernier']) out[x][J[x]] = (out[x][J[x]] || 0) + 1;
      out.V.add(J.V); out.combis.add(D.IDS_TOURNEE.map((id) => J.vides[id]).join());
      D.IDS_TOURNEE.forEach((id) => { (out.vides[id] = out.vides[id] || new Set()).add(J.vides[id]); });
      out.ordres.add(J.ordre.join()); out.docs.add(J.ordreDocs); out.i.add(J.i); out.a.add(J.a); out.m.add(J.m);
      const P = D.pilesDuJeu(J);
      out.credit.add(D.comptesDe(P).aCrediter); out.soldes.add(D.partieA(J).solde);
      P.forEach((p) => { const h = Q.comptePile(p).hauteur; Object.keys(p.intrus || {}).forEach((n) => { if (+n === 1 || +n === h) out.bords++; }); });
      if (Object.values(J.abimees).some((f) => f === 'N' || f === 'W')) out.arriere++;
    }
    const tri = (E) => [...E].sort((x, y) => x - y);
    return { ...out, V: tri(out.V), vides: Object.fromEntries(Object.entries(out.vides).map(([id, E]) => [id, tri(E)])), combis: out.combis.size, ordres: out.ordres.size,
      docs: out.docs.size, credit: tri(out.credit), soldes: out.soldes.size, i: tri(out.i), a: tri(out.a), m: tri(out.m) };
  });
  egal([r.secours, r.ecarts, r.bords, r.arriere], [0, [], 0, 300], 'secours, écarts, intrus au bord, dégât de l’arrière');
  for (const x of ['partiel', 'nonMvt']) Object.entries(r[x]).forEach(([id, n]) => { const p = n / 3; vrai(p >= 40 && p <= 60, `${id} : ${p} %`); });
  egal(Object.keys(r.dernier).sort(), ['dr-douai', 'dr-dourges', 'dr-lesquin', 'dr-prouvy'], 'les quatre pièces');
  Object.entries(r.dernier).forEach(([id, n]) => { const p = n / 3; vrai(p >= 15 && p <= 35, `${id} : ${p} %`); });
  egal(r.vides, { lesquin: [125, 130, 135], douai: [105, 110, 115], prouvy: [95, 100, 105], dourges: [70, 75, 80] }, 'les vides, trois valeurs par site');
  egal([r.V, r.i, r.a, r.m, r.credit], [[390, 395, 400], [1, 2], [1, 2], [1, 2], [56, 57, 58]], 'V, intrus, abîmées, manquantes, crédit');
  vrai(r.combis >= 20 && r.ordres >= 20 && r.docs >= 15 && r.soldes >= 50, `variété : ${r.combis} combinaisons de vides, ${r.ordres} ordres de piles, ${r.docs} ordres de documents, ${r.soldes} soldes`);
});

await v('ENT-9.4 : jeu figé — deux élèves réels (graines `eleve-94-a`, `eleve-94-b`) gardent leurs documents, leurs piles et leur ramasse, valeurs écrites à la main ; les deux voisins n’ont ni les mêmes nombres ni le même site reporté', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/chep-ent94-donnees.js');
    const lit = (g) => { const J = D.jeuDe(g), A = D.partieA(J);
      return { docs: A.documents.map((d) => `${d.role}:${d.piece}:${d.attendu.qte}`).join(' '), s0: J.s0, solde: A.solde, piles: D.pilesDuJeu(J).map((p) => `${p.id}:${p.hauteur || 15}:${JSON.stringify(p.intrus || {})}:${JSON.stringify(p.abimee || {})}`).join(' '),
        bc: J.bc, c: D.comptesDe(D.pilesDuJeu(J)).aCrediter, dernier: J.dernier, V: J.V, vides: D.IDS_TOURNEE.map((id) => J.vides[id]).join(',') }; };
    return { a: lit('eleve-94-a'), b: lit('eleve-94-b') };
  });
  egal(r.a, { docs: 'nonmvt:nm-europe:0 transfert:transfert:22 partiel:pa-lpr:17 emission:emission:160', s0: 175, solde: 296,
    piles: 'P1:15:{}:{} P2:13:{}:{} P3:15:{}:{"4":"S","8":"N"} P4:15:{"5":"epal","13":"epal"}:{}', bc: 'BC-27-0113', c: 56, dernier: 'dr-douai', V: 395, vides: '125,105,95,70' }, 'élève a');
  egal(r.b, { docs: 'partiel:pa-europe:17 transfert:transfert:24 emission:emission:180 nonmvt:nm-commande:0', s0: 165, solde: 304,
    piles: 'P1:14:{}:{} P2:15:{}:{} P3:15:{}:{"2":"S","14":"W"} P4:15:{"9":"epal"}:{}', bc: 'BC-27-0534', c: 58, dernier: 'dr-dourges', V: 395, vides: '135,115,100,75' }, 'élève b');
});

// ─────────────────────────────────────────────────────────── corrigé, ergonomie
await v('ENT-9.4 : corrigé par élève — ses documents, son solde, ses piles, son crédit, sa pièce « dernier » et une tournée juste ; d’après SON travail quand il a commencé', async () => {
  await monter({ uid: 'ch94-corr' });
  await declarer(T1.decl);
  await quai(T1.quai);
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-9.4.js');
    const c = C.corrigeEleve(window.__f.db, 'ch94-corr'), x = C.corrigeEleve({}, 'eleve-94-b');
    const txt = (o) => o.items.map((i) => `${i.texte} | ${i.rep || JSON.stringify(i.reponses)}`).join('\n');
    return { c: txt(c), x: txt(x), xTexte: x.texte, items: C.CORRIGE.items.length };
  });
  vrai(/150 \+ 180 − 22 − 16 = 292 palettes/.test(r.c) && /à créditer 57/.test(r.c) && /Primeurs du Delta \(01\/02 à 7 h 45\)/.test(r.c)
    && /Halles d’Artois → Hainaut Primeurs → Frais du Nord/.test(r.c) && /d’après SON contrôle/.test(r.c) && /d’après SES déclarations/.test(r.c), 'corrigé du témoin : ' + r.c);
  vrai(/= 304 palettes/.test(r.x) && /à créditer 58/.test(r.x) && /pas encore ouvert/.test(r.xTexte), 'corrigé d’un élève qui n’a pas ouvert : ' + r.x.slice(0, 300));
  egal(r.items, 4, 'items communs');
});

await v('ENT-9.4 : ergonomie 1366 × 768 — aucun écran ne défile en largeur ; le bouton d’envoi des fiches reste visible', async () => {
  await pg.setViewportSize({ width: 1366, height: 768 });
  try {
    await monter({ uid: 'ch94-ecran' });
    const L = [];
    for (const vue of ['fiche', 'quai', 'fiche:besoin']) { await vers(vue); if (await large() > 0) L.push(vue); }
    await declarer(T1.decl); await vers('fiche:releve'); if (await large() > 0) L.push('releve');
    const b = await pg.$eval(`${Z} [data-fiche-envoyer]`, (e) => { const r = e.getBoundingClientRect(); return r.bottom <= window.innerHeight + 1 && r.top >= 0; });
    vrai(b, 'le bouton d’envoi du relevé sort de l’écran');
    await besoin(T1.besoin); await vers('tournee'); if (await large() > 0) L.push('tournee');
    egal(L, [], 'écrans qui défilent en largeur');
  } finally { await pg.setViewportSize({ width: 1366, height: 900 }); }
});

await v('ENT-9.4 : Suivi — le détail de la note porte chaque jalon, l’ouverture (justes, NSP, faux, tirées) et le quai, pour l’enseignant', async () => {
  await monter({ uid: 'ch94-suivi' });
  await declarer(T1.decl);
  const n = await noter();
  egal(JALONS.filter((j) => !(j in n.detail)), [], 'jalons absents du détail');
  egal(JALONS.map((j) => n.detail[j]).filter((x) => x === 'ok').length, 3, 'les trois jalons des déclarations');
  vrai(n.detail.ouverture && n.detail.ouverture.sur === 4 && n.detail.ouverture.tirees.length === 4 && n.detail.ouverture.justes === 4, 'ouverture : ' + JSON.stringify(n.detail.ouverture));
  vrai(!!n.detail.quai, 'détail du quai');
});

// La capture du Suivi (seulement avec CAPTURES_ENT94 : rien n'est vérifié ici, c'est une photo pour Tristan) : un groupe de démonstration,
// un élève, sa copie du témoin 1 rendue, l'onglet « Suivi » de l'enseignant.
if (CAPTURES && COPIE_T1) {
  await pg.evaluate(() => document.querySelector('#fTest')?.remove());
  await pg.setViewportSize({ width: 1366, height: 768 });
  await pg.click('#btnProf'); await pg.waitForSelector('#btnProfEspace'); await pg.click('#btnProfEspace');
  await pg.waitForSelector('#gNom');
  await pg.fill('#gNom', 'CHEP 1re'); await pg.selectOption('#gNiveau', '1re'); await pg.click('#btnCreerG'); await pause(300);
  await pg.evaluate(async (c) => {
    const { B } = await import('/core/backend.js');
    const g = Object.entries(JSON.parse(localStorage.getItem('prepalog:groupes') || '{}')).find(([, x]) => x.nom === 'CHEP 1re')[0];
    await B.creerEleves(g, [{ nom: 'Martin', prenom: 'Zoé', matricule: '9401', code: 'zz94' }]);
    const u = JSON.parse(localStorage.getItem('prepalog:users') || '{}');
    const uid = Object.keys(u).find((k) => u[k].matricule === '9401');
    await B.rendreCopie(g, uid, 'chep-evaluation', { ...c, nom: 'Martin', prenom: 'Zoé' });
  }, COPIE_T1);
  await pg.click('[data-ong="suivi"]'); await pause(600);
  const titres = await pg.$$eval('#contenuProf td[title]', (L) => L.map((x) => x.title).filter((t) => /sur 20/.test(t)));
  console.log('    infobulles du Suivi : ' + JSON.stringify(titres));
  await pg.evaluate(() => { const t = [...document.querySelectorAll('#contenuProf th, #contenuProf td')].find((x) => /CHEP/.test(x.textContent) && x.tagName === 'TH'); if (t) t.scrollIntoView({ inline: 'start', block: 'nearest' }); });
  await pg.screenshot({ path: `${CAPTURES}/9-suivi-enseignant.png` });
}

await F.fermer();
}
