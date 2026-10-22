// Suite de tests de Prepalog — bloc « action-814 » : Action ENT-8.14, évaluation « ranger et compter dans le site d'évaluation » (CAP OL, évaluation CAP-C1.5, copie rendue), dernière séance
// du palettier à adresse donnée (chantier E-7, lots 0 à 6). `PORT_TESTS=8134 node outils/test.mjs action-814` ne lance que ce bloc. Brief : `docs/briefs/ENT-8.14-action-evaluation-stock.md` §8 ;
// décisions du chef de chantier : `docs/briefs/COORDINATION-palettier.md` §3 et §4. Aides communes : `outils/test/france-boissons/commun.mjs`.
//
// La séance est montée dans une page (1366 × 768) avec la fabrique et le moteur réels (`activites/action-evaluation-stock.js` → `rendre`, `noter`) ; de vrais clics (comme le bloc `palettier`).
//
// Valeurs ÉCRITES À LA MAIN (relevé du tirage le 22/10/2026), jamais recalculées par le code de la séance :
//   Poids d'une palette pleine (cartons × kg d'un carton + 25) : LES 493 · NET 545 · CRO 425 · CAH 295 · SER 265 · BOU 205 · BOI 121 · PEL 97. Lourds : LES, NET, CRO.
//   Plaques : Onnaing N2 1 400 · N3 1 200 · N4 1 000 kg (3 allées, 24 travées) ; Belleville N2 1 600 · N3 1 300 · N4 1 100 kg (2 allées, 16 travées). Pas de plaque au niveau 1.
//   « e814-8 » → ONNAING (GXO, Karim, Léo) : P1 BOI A1-T02-N1-E1 · P2 PEL B2-T01-N1-E2 · P3 SER B2-T03-N2-E2 (niveau vide, plaque 1 400) · P4 CRO B2-T02-N3-E1 (le niveau porte 986 kg,
//     986 + 425 = 1 411 > 1 200) · P5 NET, adresse prise B1-T01-N1-E1 (des bougies), adresse libre A1-T01-N1-E2 ; « à côté » libre : B1-T01-N1-E2 ;
//     à compter A2-T03-N1-E2 LES 30 · B2-T03-N1-E2 NET (le système croit 37, il y a 34 : il MANQUE 3) · C2-T02-N1-E2 SER 36 · C2-T02-N1-E3 BOI 20 ; l'écart est au rang 2.
//   « e814-1 » → BELLEVILLE (Kuehne+Nagel, Sandrine, Hugo) : P1 BOI B1-T04-N1-E2 · P2 NET A1-T03-N1-E2 · P3 CAH B1-T03-N2-E2 (plaque 1 600, niveau vide) · P4 LES A1-T01-N4-E2 (le niveau porte
//     1 038 kg, 1 038 + 493 = 1 531 > 1 100) · P5 SER, adresse prise B2-T04-N1-E3 (des croquettes), adresse libre B2-T02-N1-E2 ; « à côté » libre : A1-T01-N1-E1 ;
//     à compter B1-T02-N1-E1 PEL 19 · B1-T03-N1-E1 BOI 23 · B2-T02-N1-E1 NET 36 · B2-T04-N1-E2 CRO (le système croit 32, il y a 35 : il y a un SURPLUS de 3) ; l'écart est au rang 4.
//   Poids : repérer P1 P2 P3 1 chacune (3) · pasPoseHaut 1 + signale-P4 3 (4) · adresseLibre-P5 2 · scan P1 P2 P3 P5 0,75 chacun (3) · compte-1 à 4 0,5 chacun (2) · fiche-signaler 1 + fiche-cause 1 (2) ·
//   ouverture 4 ; sans point : charge, recompte-1 à 4, scanAvant. Ce qui vaut son prix : les deux témoins à 20, l'inaction à 0, une erreur qui ne se paie qu'une fois, rien à l'écran qui dise juste
//   ou faux, la copie rendue seulement par le bandeau, les mêmes jalons pour toutes les graines, l'équité du tirage (P4 dépasse toujours, P5 prise, aucune adresse à compter n'est celle d'une palette).

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v: vTous, nav, BASE, egal, vrai }) {
// `ACTION814_SEUL='mots du titre'` ne joue que les cas dont le titre contient ce texte : sert à éprouver les cas dans les deux sens sans rejouer tout le bloc.
const SEUL = process.env.ACTION814_SEUL || '';
const v = SEUL ? (nom, fn) => (nom.includes(SEUL) ? vTous(nom, fn) : undefined) : vTous;

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, present, aller, texte, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });
const CAPTURES = process.env.CAPTURES_ENT814 || '';
const hotes = new Set();
pg.on('request', (r) => { try { const h = new URL(r.url()).hostname; if (h && !['127.0.0.1', 'localhost'].includes(h)) hotes.add(h); } catch (e) {} });

const ID = 'action-evaluation-stock';
const GE = (g) => `entrepot:${ID}:${g}`;
const PZ = `${Z} .pal`;
const PENALITE = 'Une réponse fausse retire des points. Si tu ne sais pas, choisis « Je ne sais pas » : tu ne perds rien.';
const ATTENTE = 'Réponds à toutes les questions pour continuer : une réponse fausse ne bloque pas.';
const JUGE = /\b(juste|justes|faux|fausse|fausses|correct|correcte|bravo|bien vu|bonne réponse|mauvaise réponse)\b/i;
const OUV_JUSTES = { 'e-adresse': 'niveau', 'e-adresse-b': 'sol', 'e-couches': 'juste', 'e-couches-b': 'juste', 'e-plaque': 'non', 'e-materiel': 'prestataire', 'e-argent': 'argent',
  'e-consignes': 'scanner', 'e-img-plaque': 'charge', 'e-img-allee': 'palette' };
const OUV_FAUSSES = { 'e-adresse': 'travee', 'e-adresse-b': 'haut', 'e-couches': 'somme', 'e-couches-b': 'somme', 'e-plaque': 'oui', 'e-materiel': 'loue', 'e-argent': 'rien',
  'e-consignes': 'obeir', 'e-img-plaque': 'evacuation', 'e-img-allee': 'rien' };
// L'ordre des jalons de la séance (le bandeau, le Suivi) : bloc par bloc ; `IDS_MOTEUR` : l'ordre du moteur (palette par palette, chaque scan après son place-).
const IDS = ['place-P1', 'place-P2', 'place-P3', 'pasPoseHaut', 'signale-P4', 'charge', 'adresseLibre-P5', 'scan-P1', 'scan-P2', 'scan-P3', 'scan-P5',
  'compte-1', 'compte-2', 'compte-3', 'compte-4', 'recompte-1', 'recompte-2', 'recompte-3', 'recompte-4', 'scanAvant', 'fiche-signaler', 'fiche-cause'];
const IDS_MOTEUR = ['place-P1', 'scan-P1', 'place-P2', 'scan-P2', 'place-P3', 'scan-P3', 'signale-P4', 'adresseLibre-P5', 'scan-P5', 'pasPoseHaut', 'charge',
  'compte-1', 'compte-2', 'compte-3', 'compte-4', 'recompte-1', 'recompte-2', 'recompte-3', 'recompte-4', 'scanAvant'];
const SANS_POINT = ['charge', 'recompte-1', 'recompte-2', 'recompte-3', 'recompte-4', 'scanAvant'];
const T = {
  'e814-8': { site: 'Onnaing', tuteur: 'Karim', cariste: 'Léo', prest: 'GXO', sens: 'manque', rang: 2,
    p1: 'A1-T02-N1-E1', p2: 'B2-T01-N1-E2', p3: 'B2-T03-N2-E2', p4: 'B2-T02-N3-E1', p5: 'B1-T01-N1-E1', libre: 'A1-T01-N1-E2', acote: 'B1-T01-N1-E2',
    noms: { P1: 'Boîtes de rangement 10 L', P2: 'Peluches', P3: 'Serviettes de bain', P4: 'Croquettes pour chien 4 kg', P5: 'Nettoyant multi-usages 1 L' },
    compter: [['A2-T03-N1-E2', 30, 30], ['B2-T03-N1-E2', 34, 37], ['C2-T02-N1-E2', 36, 36], ['C2-T02-N1-E3', 20, 20]], produitEcart: 'Nettoyant multi-usages 1 L', systeme: 37, reel: 34 },
  'e814-1': { site: 'Belleville-en-Beaujolais', tuteur: 'Sandrine', cariste: 'Hugo', prest: 'Kuehne+Nagel', sens: 'surplus', rang: 4,
    p1: 'B1-T04-N1-E2', p2: 'A1-T03-N1-E2', p3: 'B1-T03-N2-E2', p4: 'A1-T01-N4-E2', p5: 'B2-T04-N1-E3', libre: 'B2-T02-N1-E2', acote: 'A1-T01-N1-E1',
    noms: { P1: 'Boîtes de rangement 10 L', P2: 'Nettoyant multi-usages 1 L', P3: 'Cahiers grand format', P4: 'Lessive liquide 3 L', P5: 'Serviettes de bain' },
    compter: [['B1-T02-N1-E1', 19, 19], ['B1-T03-N1-E1', 23, 23], ['B2-T02-N1-E1', 36, 36], ['B2-T04-N1-E2', 35, 32]], produitEcart: 'Croquettes pour chien 4 kg', systeme: 32, reel: 35 },
};
const CAUSE_JUSTE = { manque: 'abimes', surplus: 'dessus' };
const CAUSE_AUTRE_SENS = { manque: 'dessus', surplus: 'abimes' };

// Monte la séance comme le site. `o.uid` (l'identifiant = la graine) ; `o.rep` : réponses d'ouverture rangées d'avance (défaut : justes) ; `o.sansOuverture` ; `o.role`.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-evaluation-stock.js');
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
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'e814-8' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__f.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: OUV_JUSTES, ...o });
const noter = () => pg.evaluate(async () => { const A = await import('/activites/action-evaluation-stock.js'); return A.noter(window.__f.db); });
const detail = async () => (await noter()).detail;
const copies = () => pg.evaluate(() => window.__f.copies.length);
const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); } };
let capturer = false;
const capture = async (nom, force = false) => {
  if (!CAPTURES || !(capturer || force)) return;
  for (let i = 0; i < 6 && await present('[data-pal-modal-ok]'); i++) { await pg.click(`${Z} [data-pal-modal-ok]`); await pause(40); }
  await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};
const blanc = (s) => String(s || '').replace(/[\s  ]+/g, ' ').trim();
const pt = async (sel) => blanc(await pg.textContent(`${PZ} ${sel}`));
const ppresent = async (sel) => !!(await pg.$(`${PZ} ${sel}`));

// ① le plan : mêmes gestes que le bloc `palettier` (un clic = un geste).
const bouton = async (k) => { await pg.click(`${PZ} [data-pal="${k}"]`); await pause(30); };
const prendre = async (id) => { await pg.click(`${PZ} .pe-bandeau [data-pe-pal="${id}"]`); await pause(30); };
async function ouvrir(a) {
  if (await ppresent('[data-pal="retour"]')) await bouton('retour');
  await pg.click(`${PZ} [data-pe-trav="${a.slice(0, 6)}"]`); await pause(20);
  await pg.click(`${PZ} [data-pe-emp="${a}"]`); await pause(30);
}
const fermerFenetre = async () => { if (await ppresent('[data-pal-modal-ok]')) { await pg.click(`${PZ} [data-pal-modal-ok]`); await pause(30); } };
async function ranger(id, a, geste = 'poser') { await prendre(id); await ouvrir(a); await bouton(geste); await fermerFenetre(); }
async function signaler(id, a, motif) { await prendre(id); await ouvrir(a); await bouton('signaler'); await pg.click(`${PZ} [data-pal-motif="${motif}"]`); await pause(30); await fermerFenetre(); }
// P5 : l'adresse donnée est prise ; « Demander une adresse libre », puis ranger là.
async function adresseLibre(J, { poser = true } = {}) { await prendre('P5'); await ouvrir(J.p5); await bouton('libre'); await fermerFenetre(); if (poser) { await ouvrir(J.libre); await bouton('poser'); } }
const scanPal = async (id) => { await pg.click(`${PZ} .pe-bandeau [data-pal-scan-pal="${id}"]`); await pause(30); };
const scanEmp = async () => { await pg.click(`${PZ} [data-pal-scan-emp]`); await pause(30); };
async function scans(J, ids = ['P1', 'P2', 'P3', 'P5']) {
  const A = { P1: J.p1, P2: J.p2, P3: J.p3, P5: J.libre };
  for (const id of ids) { await scanPal(id); await ouvrir(A[id]); await scanEmp(); }
}
async function rangerJuste(J) {
  await aller('entrepot');
  await ranger('P1', J.p1); await ranger('P2', J.p2); await ranger('P3', J.p3, 'confier');
  await signaler('P4', J.p4, 'charge');
  await adresseLibre(J);
}
async function valider() {
  if (await ppresent('[data-pal="retour"]')) await bouton('retour');
  await bouton('valider');
  if (await ppresent('[data-pal="validerOui"]')) await bouton('validerOui');
}
async function versComptage() { await bouton('phase'); await bouton('phaseOui'); }
// ② le comptage : l'adresse, son étiquette (le scan), le nombre ; `suite` : « recompter », un nombre, « confirmer »…
const taper = async (n) => { await pg.fill(`${PZ} [data-vt-champ]`, String(n)); await pg.press(`${PZ} [data-vt-champ]`, 'Enter'); await pause(30); };
const choisir = async (k) => { await pg.click(`${PZ} [data-vt-choix="${k}"]`); await pause(30); };
const actu = () => pt('[data-vt-actu]');
async function compter(J, i, n, suite = []) {
  await ouvrir(J.compter[i][0]); await pg.click(`${PZ} [data-pal-compte-emp]`); await pause(30); await taper(n);
  for (const k of suite) { if (typeof k === 'number') await taper(k); else await choisir(k); }
}
// Le comptage juste : chaque adresse comptée juste ; sur l'écart (le compte diffère du système), « Recompter », le même nombre, puis « Confirmer ».
async function compterJuste(J) { for (let i = 0; i < 4; i++) { const [, reel, sys] = J.compter[i]; await compter(J, i, reel, reel !== sys ? ['recompter', reel, 'confirmer'] : []); } }
async function terminer() {
  if (await ppresent('[data-pal="retour"]')) await bouton('retour');
  await bouton('terminer');
  if (await ppresent('[data-pal="finOui"]')) await bouton('finOui');
}
// ③ la fiche : `rep` = { 'faire-2': 'signaler', 'cause-2': 'abimes' }
async function fiche(rep) {
  await aller('fiche');
  for (const [id, val] of Object.entries(rep)) { await pg.selectOption(`${Z} [data-fiche-champ="${id}"]`, val); await pause(20); }
  await capture('6-fiche');
  await pg.click(`${Z} [data-fiche-envoyer]`); await confirmer();
}
const repFiche = (J, o = {}) => ({ [`faire-${J.rang}`]: o.faire || 'signaler', [`cause-${J.rang}`]: o.cause || CAUSE_JUSTE[J.sens] });
async function rendre() {
  await pg.click(`${Z} [data-copie-rendre]`);
  await capture('8-rendre-ma-copie');
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.waitForFunction(() => window.__f.copies.length === 1);
  await pause();
  await capture('9-copie-rendue');
  return pg.evaluate(() => window.__f.copies[0]);
}
// Le parcours juste complet d'un témoin (rien n'est rendu avant « Rendre ma copie »).
async function parcours(J, o = {}) {
  await rangerJuste(J); await scans(J);
  await valider();
  await versComptage();
  await compterJuste(J);
  await terminer();
  await fiche(repFiche(J));
}
// Rien du système dans le DOM : aucun verdict, aucun « attendu », aucune règle ; aucun mot qui juge.
const sansSysteme = () => pg.evaluate((Z) => {
  const z = document.querySelector(Z), h = z.innerHTML, t = z.innerText;
  return [/✗/, /✓ bien rangée/, /✓ remise en ordre/, /bien rangée/, /adresse attendue/, /· réel/, /data-pal-verdict/, /data-pal-cverdict/, /pe-verd pe-/, /pe-prof/, /Côté enseignant/, /Les règles/, /data-pe-regles/,
    /data-fin-jalon/, /Corriger/, /\[\[/]
    .filter((r) => r.test(h) || r.test(t)).map(String);
}, Z);
const mots = () => texte().then((t) => (JUGE.test(t) ? t.match(JUGE)[0] : ''));
// Les nombres cherchés partout dans la page (texte, attributs, valeur des champs), sauf la géométrie du dessin.
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
const etatE = () => pg.evaluate((ID) => JSON.parse(JSON.stringify((window.__f.db.entrepots || {})[ID] || null)), ID);
const gestes = () => pg.evaluate((ID) => Object.keys((window.__f.db.gestes || {})[ID] || {}).sort(), ID);
const faux = (d) => IDS.filter((j) => d[j] === 'ko');
const points = (d) => IDS.filter((j) => d[j] === 'ok' && !SANS_POINT.includes(j));

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-8.14 : la séance se charge (CAP, CAP-C1.5, évaluation en copie, sans parcours) ; poids jalon par jalon (somme 16 + ouverture 4 = 20) ; bloc par bloc comme le brief §5 ; entrepôt : un seul plan à phases, `rendCopie: false`, ni verdict ni règles ; banque d’ouverture 5 + 3 + 2 sans aide ni mot cliquable ; aucune question au fil', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-evaluation-stock.js');
    const S = await import('/contenus/action-ent814.js');
    const Qs = await import('/contenus/questions/ENT-8.14.js');
    const D = await import('/contenus/action-ent814-donnees.js');
    const E = await import('/core/types/entrepot.js');
    const L = Qs.QUESTIONS.liste, poidsDe = (e) => (e.compte === false ? 0 : e.poids);
    const decl = (g) => { const x = D.entrepotDe(g, { copie: true }); return { id: x.id, mode: x.mode, aide: x.aideCharge, verdict: x.verdict, regles: x.regles, terminal: x.terminal, rendCopie: x.rendCopie,
      phases: x.phases, cariste: x.cariste, recompte: x.comptage.recompte, aideCouche: x.comptage.aideCouche, cles: x.comptage.adresses.map((a) => a.cle), palettes: x.palettes.map((p) => [p.id, !!p.aSignaler, !!p.adresseLibre, !!p.nouvelleAdresse, !!p.niveaux]),
      perso: [x.personnage.nom, x.personnage.date, typeof x.personnage.texte] }; };
    return { meta: A.meta, ids: S.ETAPES.map((e) => e.id), poids: S.ETAPES.map(poidsDe), bonus: S.ETAPES.filter((e) => e.bonus).length, part: Qs.QUESTIONS.part,
      parGroupe: Object.entries(S.ETAPES.filter((e) => e.compte !== false).reduce((o, e) => { o[e.groupe] = (o[e.groupe] || 0) + e.poids; return o; }, {})),
      gardes: S.ETAPES.filter((e) => e.compte === false).map((e) => [e.id, e.poids]), sansGroupe: S.ETAPES.filter((e) => e.compte !== false && !e.groupe).map((e) => e.id),
      ecrans: S.ETAPES.filter((e) => e.ecran).map((e) => e.id),
      ouv: { part: Qs.QUESTIONS.ouverture.part, tirage: Qs.QUESTIONS.ouverture.tirage, prep: L.filter((x) => x.rubrique === 'preparation').length, droit: L.filter((x) => x.rubrique === 'ecodroit').length,
        image: L.filter((x) => x.rubrique === 'image').length, aides: L.filter((x) => x.aide != null).length, fil: L.filter((x) => x.type !== 'ouverture').length,
        mots: L.filter((x) => (x.enonce + x.choix.map((c) => c.lib).join(' ') + (x.retour || '')).includes('[[')).length, droitDoc: L.filter((x) => x.doc === 'droit').map((x) => x.id) },
      lexique: Object.keys(S.OPTIONS.lexique).length, suite: S.OPTIONS.suite.map((s) => [s.vue, s.libelle]), pastilles: S.OPTIONS.pastilles.map((p) => p.libelle), fiche: [S.OPTIONS.fiche.id, typeof S.OPTIONS.fiche.blocs, typeof S.OPTIONS.fiche.quand],
      onnaing: decl('e814-8'), belleville: decl('e814-1'), ref: decl(''),
      signaux: E.creerEntrepot(D.entrepotDe('e814-8', { copie: true }), { copie: true }).signaux };
  });
  const m = r.meta;
  egal([m.id, m.code, m.rubrique, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.copie, m.questions, m.parcours, m.precedente, m.correction, m.niveauxPrevus, m.immersif, m.portee, m.corrige, m.ouverture],
    ['action-evaluation-stock', 'ENT-8.14', 'simulog', ['cap'], [], ['CAP-C1.5'], 'evaluation', 20, true, 'ENT-8.14', undefined, undefined, undefined, undefined, true, 'eleve', './contenus/corriges/ENT-8.14.js', 'prof'], 'meta');
  egal(r.ids, IDS, 'les 22 jalons, dans l’ordre du brief §5 : repérer, ranger et voir la plaque, adresse prise, scanner, comptages, fiche');
  egal(r.poids.map((p) => Math.round(p * 1e6) / 1e6), [1, 1, 1, 1, 3, 0, 2, 0.75, 0.75, 0.75, 0.75, 0.5, 0.5, 0.5, 0.5, 0, 0, 0, 0, 0, 1, 1], 'poids jalon par jalon (brief §5)');
  proche(r.poids.reduce((t, x) => t + x, 0) + r.part, 20, 'somme des poids des jalons et de l’ouverture');
  egal(r.part, 4, 'part des questions');
  egal(r.parGroupe, [['Repérer les adresses du site', 3], ['Ranger et voir la plaque', 4], ['L’adresse prise', 2], ['Scanner', 3], ['Comptages justes', 2], ['Écart signalé, avec une cause', 2]], 'points par bloc (brief §5)');
  egal(r.gardes, [['charge', 0], ['recompte-1', 0], ['recompte-2', 0], ['recompte-3', 0], ['recompte-4', 0], ['scanAvant', 0]], 'jalons sans point : la plaque (déjà dite par signale-P4), les recomptes (l’outil), scanAvant');
  egal([r.sansGroupe, r.bonus], [[], 0], 'jalons sans groupe, jalons bonus');
  egal(r.ecrans, ['fiche-signaler', 'fiche-cause'], 'écrans des jalons');
  egal(r.ouv, { part: 4, tirage: { preparation: 2, ecodroit: 1, image: 1 }, prep: 5, droit: 3, image: 2, aides: 0, fil: 0, mots: 0, droitDoc: ['e-consignes'] }, 'ouverture : 10 notions, aucune aide, aucun mot cliquable, aucune question au fil');
  egal(r.lexique, 0, 'mots cliquables');
  egal(r.suite, [['entrepot', 'Ranger les palettes'], ['entrepot', 'Compter les adresses'], ['fiche', 'Signaler l’écart']], 'l’ordre des écrans');
  egal(r.pastilles, ['Ranger', 'Compter', 'Signaler l’écart'], 'pastilles');
  egal(r.fiche, ['ecarts-814', 'function', 'function'], 'la fiche est une fonction de la base et attend la fin du comptage');
  for (const s of ['onnaing', 'belleville', 'ref']) {
    const d = r[s];
    egal([d.id, d.mode, d.aide, d.verdict, d.regles, d.terminal, d.rendCopie, d.phases, d.recompte, d.aideCouche, d.cles, d.palettes, d.perso[1], d.perso[2]],
      [ID, 'palettier', 'plaque', undefined, undefined, { nom: 'Terminal' }, false, [{ id: 'rangement' }, { id: 'comptage', bouton: 'Passer au comptage',
        consigne: 'Compte les adresses de la liste « À compter », avec le Terminal.' }], 'ecart', undefined, [undefined, undefined, undefined, undefined],
        [['P1', false, false, false, false], ['P2', false, false, false, false], ['P3', false, false, false, false], ['P4', true, false, false, false], ['P5', false, true, false, false]], 'mardi, 6 h', 'object'],
      `entrepôt (${s}) : ni verdict ni règles, Terminal, phases, comptage sans clé, P4 à signaler sans nouvelle adresse, P5 à adresse libre`);
  }
  egal([r.onnaing.cariste, r.belleville.cariste, r.onnaing.perso[0], r.belleville.perso[0]], [{ nom: 'Léo', niveaux: [2, 3, 4] }, { nom: 'Hugo', niveaux: [2, 3, 4] }, 'Karim', 'Sandrine'], 'cariste et personnage du site');
  vrai(['phase:comptage', 'compte:fin', 'compte:scan', 'valider', 'ouvrir', 'signaler:P4', 'poser:P1', 'confier:P3', 'adresseLibre:P5', 'occupe:P5', 'scan:P5'].every((g) => r.signaux.includes(GE(g))),
    'gestes publiés : ' + r.signaux.join(' '));
});

await v('ENT-8.14 : les deux palettiers (écrits à la main) — Onnaing 3 allées, 24 travées, plaques N2 1 400 / N3 1 200 / N4 1 000 ; Belleville 2 allées, 16 travées, plaques 1 600 / 1 300 / 1 100 ; 4 niveaux aux deux, pas de plaque au sol ; les deux plans diffèrent ; le stock est celui du site', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent814-donnees.js');
    const out = {};
    for (const s of ['onnaing', 'belleville']) {
      const P = D.planDe(s);
      out[s] = { allees: P.allees.map((a) => a.id), cotes: Object.keys(P.cotes).length, travees: P.travees, niveaux: P.niveaux, emplacements: P.emplacements, charges: [...new Set(Object.values(P.cotes).map((c) => JSON.stringify(c.charge)))],
        hs: P.horsService, stock: Object.keys(D.stockDe(s)).length > 40, horsStock: Object.keys(D.stockDe(s)).filter((a) => P.horsService.includes(a)).length,
        sansAllee: Object.keys(D.stockDe(s)).filter((a) => !P.allees.some((x) => x.id === a[0])).length };
    }
    return out;
  });
  egal(r.onnaing, { allees: ['A', 'B', 'C'], cotes: 6, travees: 4, niveaux: 4, emplacements: 3, charges: ['{"2":1400,"3":1200,"4":1000}'], hs: ['B1-T01-N2-E1', 'C2-T03-N3-E2'], stock: true, horsStock: 0, sansAllee: 0 }, 'Onnaing');
  egal(r.belleville, { allees: ['A', 'B'], cotes: 4, travees: 4, niveaux: 4, emplacements: 3, charges: ['{"2":1600,"3":1300,"4":1100}'], hs: ['A2-T02-N2-E3', 'B1-T04-N3-E1'], stock: true, horsStock: 0, sansAllee: 0 }, 'Belleville');
  vrai(JSON.stringify(r.onnaing) !== JSON.stringify(r.belleville), 'les deux plans diffèrent');
});

// ─────────────────────────────────────────────────────────── le site et le tirage
await v('ENT-8.14 : le site — le même qu’en ENT-8.5, 8.6 et 8.10 pour 50 élèves ; témoins e814-8 Onnaing (Karim, Léo), e814-1 Belleville (Sandrine, Hugo)', async () => {
  const r = await pg.evaluate(async () => {
    const E = await import('/contenus/action-eval-sites.js');
    const D = await import('/contenus/action-ent814-donnees.js');
    const D10 = await import('/contenus/action-ent810-donnees.js');
    const diff = [];
    for (let i = 0; i < 50; i++) {
      const uid = `cap-${i}`, b = { tirage: { graine: uid } };
      if (E.siteDeBase(b, 'action-evaluation-reception').id !== D.siteEleve(b).id || D10.siteDeGraine(uid).id !== D.siteEleve(b).id || D.jeuDe(uid).site !== D.siteEleve(b).id) diff.push(uid);
    }
    const eq = (uid) => { const S = D.siteDeGraine(uid), Q = D.equipeDe(S); return [S.id, S.prestataire, Q.tuteur, Q.cariste]; };
    return { diff, a: eq('e814-8'), b: eq('e814-1') };
  });
  egal(r.diff, [], 'élèves dont le site change');
  egal(r.a, ['onnaing', 'GXO', 'Karim', 'Léo'], 'e814-8');
  egal(r.b, ['belleville', 'Kuehne+Nagel', 'Sandrine', 'Hugo'], 'e814-1');
});

await v('ENT-8.14 : tirage et équité sur 200 graines (les deux sites) — zéro secours ; P4 : produit LOURD, N3 ou N4, adresse libre, son niveau ne dépasse pas la plaque sans elle et la dépasse avec elle (poids et plaques écrits à la main) ; aucune autre palette ne dépasse ; P5 : adresse prise au sol, adresse libre ; P3 et P4 sur deux niveaux différents ; aucune adresse à compter n’est celle d’une palette ; 3 conformes + 1 écart ; le moteur accepte chaque déclaration', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent814-donnees.js');
    const E = await import('/core/types/entrepot.js');
    const { tirerJeu } = await import('/core/tirage.js');
    const KG = { LES: 493, NET: 545, CRO: 425, CAH: 295, SER: 265, BOU: 205, BOI: 121, PEL: 97 };
    const LOURD = ['LES', 'NET', 'CRO'];
    const PLAQ = { onnaing: { 2: 1400, 3: 1200, 4: 1000 }, belleville: { 2: 1600, 3: 1300, 4: 1100 } };
    const o = { secours: 0, nonConforme: 0, p4: 0, autres: 0, p5: 0, niv: 0, compte: 0, roles: 0, moteur: 0, ids: new Set(), kg: 0, sites: {}, n4: {}, rangs: {}, sens: {}, p1: new Set(), allees: {} };
    const niveau = (a) => a.slice(0, 9);   // « A1-T03-N3 »
    for (let i = 0; i < 200; i++) {
      const uid = `eleve-${i}`, site = D.siteDeGraine(uid).id, j = D.jeuDe(uid), ST = D.stockDe(site), P = j.palettes;
      o.sites[site] = (o.sites[site] || 0) + 1;
      if (tirerJeu(D.TIRAGES[site], `${uid}|${D.ID}`).secours) o.secours++;
      if (D.verifier(j).length) o.nonConforme++;
      Object.values(ST).forEach((s) => { if (s.kg !== KG[s.produit]) o.kg++; });
      const charge = (a) => Object.keys(ST).filter((x) => niveau(x) === niveau(a)).reduce((t, x) => t + ST[x].kg, 0);
      const n = (a) => Number(a.match(/-N(\d)/)[1]);
      // P4 : lourd, N3 ou N4, libre ; le niveau ne dépasse pas sans elle, dépasse avec elle.
      const a4 = P.P4.adresse, p4 = PLAQ[site][n(a4)];
      if (!LOURD.includes(P.P4.produit) || ![3, 4].includes(n(a4)) || ST[a4] || !(charge(a4) <= p4) || !(charge(a4) + KG[P.P4.produit] > p4)) o.p4++;
      o.n4[n(a4)] = (o.n4[n(a4)] || 0) + 1;
      // Les autres : P1, P2 au sol et libres ; P3 en réserve, libre, tient, pas sur le niveau de P4 ; P5 prise au sol, libre au sol.
      const hs = D.PLANS[site].horsService;
      const libre = (a) => !ST[a] && !hs.includes(a);
      if (n(P.P1.adresse) !== 1 || n(P.P2.adresse) !== 1 || !libre(P.P1.adresse) || !libre(P.P2.adresse) || P.P1.adresse[0] === P.P2.adresse[0]) o.autres++;
      const a3 = P.P3.adresse;
      if (n(a3) < 2 || !libre(a3) || LOURD.includes(P.P3.produit) || charge(a3) + KG[P.P3.produit] > PLAQ[site][n(a3)] || niveau(a3) === niveau(a4)) o.autres++;
      if (n(P.P5.adresse) !== 1 || !ST[P.P5.adresse] || n(P.P5.libre) !== 1 || !libre(P.P5.libre) || niveau(P.P5.libre) === niveau(P.P5.adresse)) o.p5++;
      const adr = Object.values(P).flatMap((p) => [p.adresse, p.libre].filter(Boolean));
      if (new Set(adr).size !== 6) o.niv++;
      if (new Set(Object.values(P).map((p) => p.produit)).size !== 5) o.niv++;
      o.p1.add(P.P1.produit);
      const L = j.comptage;
      if (L.some((x) => adr.includes(x.adresse)) || L.some((x) => n(x.adresse) !== 1 || ST[x.adresse].produit !== x.produit) || new Set(L.map((x) => x.produit)).size !== 4) o.compte++;
      const ec = L.filter((x) => x.reel !== x.systeme);
      if (ec.length !== 1 || L.length !== 4) o.roles++;
      else { o.rangs[ec[0].rang] = (o.rangs[ec[0].rang] || 0) + 1; o.sens[ec[0].reel < ec[0].systeme ? 'manque' : 'surplus'] = (o.sens[ec[0].reel < ec[0].systeme ? 'manque' : 'surplus'] || 0) + 1; }
      L.forEach((x) => { o.allees[x.adresse[0]] = (o.allees[x.adresse[0]] || 0) + 1; });
      // Le moteur : la déclaration se charge, les mêmes jalons pour tous.
      try { const dc = D.entrepotDe(uid, { copie: true }); E.creerEntrepot(dc, { copie: true }); o.ids.add(E.jalonsEntrepot({}, dc, 'evaluation').L.map((l) => l.id).join()); } catch (e) { o.moteur++; }
    }
    return { ...o, ids: [...o.ids], p1: [...o.p1].sort() };
  });
  egal([r.secours, r.nonConforme, r.p4, r.autres, r.p5, r.niv, r.compte, r.roles, r.moteur, r.kg], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'secours, non conformes, P4, autres palettes, P5, doublons, comptage, rôles, refus du moteur, poids du stock');
  vrai(r.sites.onnaing >= 70 && r.sites.belleville >= 70, `les deux sites sont tirés : ${JSON.stringify(r.sites)}`);
  vrai(r.n4['3'] >= 50 && r.n4['4'] >= 50, `P4 en N3 et en N4 : ${JSON.stringify(r.n4)}`);
  vrai([1, 2, 3, 4].every((k) => (r.rangs[k] || 0) >= 30), `l’écart tombe sur chaque rang de la liste : ${JSON.stringify(r.rangs)}`);
  vrai(r.sens.manque >= 70 && r.sens.surplus >= 70, `l’écart est un manque ou un surplus : ${JSON.stringify(r.sens)}`);
  vrai(r.p1.length >= 6, `produits variés pour P1 : ${r.p1}`);
  vrai(['A', 'B', 'C'].every((a) => r.allees[a] > 20), `les adresses à compter sont dans toutes les allées : ${JSON.stringify(r.allees)}`);
  egal(r.ids.length, 1, 'les mêmes jalons pour 200 graines : ' + r.ids.length + ' listes différentes');
  egal(r.ids[0], IDS_MOTEUR.join(), 'et ce sont les jalons attendus (rangement puis comptage, chaque scan après son place-)');
});

await v('ENT-8.14 : contrôle d’équité — `verifier` refuse P4 qui ne dépasse pas, P3 sur le niveau de P4, P5 dont l’adresse est libre, une adresse à compter qui est celle d’une palette, deux écarts, un produit en double, une liste dans le désordre ; témoins et référence passent ; les témoins sont ceux recopiés', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent814-donnees.js');
    const j = (u) => JSON.parse(JSON.stringify(D.jeuDe(u)));
    const base = j('e814-8'), erreurs = (f, u = 'e814-8') => { const x = j(u); f(x); return D.verifier(x); };
    const libreN3 = D.toutesDe('onnaing').find((a) => /-N3-/.test(a) && D.libre('onnaing', a) && D.chargeStock('onnaing', a) === 0);
    const out = {
      p4Leger: erreurs((x) => { x.palettes.P4.produit = 'PEL'; }), p4Vide: erreurs((x) => { x.palettes.P4.adresse = libreN3; }),
      p3MemeNiveau: erreurs((x) => { x.palettes.P3.adresse = x.palettes.P4.adresse.replace('-E1', '-E3'); }),
      p5Libre: erreurs((x) => { x.palettes.P5.adresse = x.palettes.P5.libre; }),
      comptePalette: erreurs((x) => { x.comptage[0].adresse = x.palettes.P5.adresse; x.comptage[0].produit = 'BOU'; }),
      deuxEcarts: erreurs((x) => { x.comptage[0].reel = x.comptage[0].systeme + 1; }), doublon: erreurs((x) => { x.palettes.P1.produit = x.palettes.P2.produit; }),
      desordre: erreurs((x) => { x.comptage.reverse(); }), t8: D.verifier(base), t1: D.verifier(j('e814-1')), ref: D.verifier(D.jeuDe('')),
      jeu8: D.jeuDe('e814-8'), jeu1: D.jeuDe('e814-1'),
    };
    return out;
  });
  vrai(r.p4Leger.some((x) => /P4 n’est pas lourde|ne dépasse pas/.test(x)), 'P4 légère : ' + r.p4Leger);
  vrai(r.p4Vide.some((x) => /ne dépasse pas la plaque/.test(x)), 'P4 sur un niveau vide : ' + r.p4Vide);
  vrai(r.p3MemeNiveau.some((x) => /même niveau/.test(x)), 'P3 sur le niveau de P4 : ' + r.p3MemeNiveau);
  vrai(r.p5Libre.some((x) => /deux adresses de palette identiques|n’est pas occupée/.test(x)), 'P5 à une adresse libre : ' + r.p5Libre);
  vrai(r.comptePalette.some((x) => /adresse d’une palette|hors stock|produit en double/.test(x)), 'adresse à compter = adresse d’une palette : ' + r.comptePalette);
  vrai(r.deuxEcarts.some((x) => /rôles|conforme mal formée/.test(x)), 'deux écarts : ' + r.deuxEcarts);
  vrai(r.doublon.some((x) => /même produit/.test(x)), 'produit en double : ' + r.doublon);
  vrai(r.desordre.some((x) => /ordre de l’allée/.test(x)), 'liste dans le désordre : ' + r.desordre);
  egal([r.t8, r.t1, r.ref], [[], [], []], 'témoins et référence conformes');
  const pal = (jeu) => Object.fromEntries(Object.entries(jeu.palettes).map(([k, p]) => [k, [p.produit, p.adresse, p.libre].filter(Boolean)]));
  const cmp = (jeu) => jeu.comptage.map((x) => [x.rang, x.adresse, x.produit, x.reel, x.systeme]);
  const J8 = T['e814-8'], J1 = T['e814-1'];
  egal(pal(r.jeu8), { P1: ['BOI', J8.p1], P2: ['PEL', J8.p2], P3: ['SER', J8.p3], P4: ['CRO', J8.p4], P5: ['NET', J8.p5, J8.libre] }, 'témoin e814-8 (palettes)');
  egal(cmp(r.jeu8), [[1, 'A2-T03-N1-E2', 'LES', 30, 30], [2, 'B2-T03-N1-E2', 'NET', 34, 37], [3, 'C2-T02-N1-E2', 'SER', 36, 36], [4, 'C2-T02-N1-E3', 'BOI', 20, 20]], 'témoin e814-8 (comptage)');
  egal(pal(r.jeu1), { P1: ['BOI', J1.p1], P2: ['NET', J1.p2], P3: ['CAH', J1.p3], P4: ['LES', J1.p4], P5: ['SER', J1.p5, J1.libre] }, 'témoin e814-1 (palettes)');
  egal(cmp(r.jeu1), [[1, 'B1-T02-N1-E1', 'PEL', 19, 19], [2, 'B1-T03-N1-E1', 'BOI', 23, 23], [3, 'B2-T02-N1-E1', 'NET', 36, 36], [4, 'B2-T04-N1-E2', 'CRO', 35, 32]], 'témoin e814-1 (comptage)');
});

// ─────────────────────────────────────────────────────────── l'ouverture
await v('ENT-8.14 : Avant de commencer — 4 questions tirées (2 préparation, 1 éco-droit, 1 image), « Je ne sais pas » en dernier, aucune aide, aucun mot qui juge ; « Le droit » à gauche (L4122-1) ; barème : 4 justes = 4, 3 + « Je ne sais pas » = 3, 3 + 1 fausse = 3 − 1 ÷ (mauvaises réponses), tout faux = 0 ; rien au Suivi', async () => {
  capturer = true;
  const db = await monter({ uid: 'e814-8', sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  const rub = (id) => (id.startsWith('e-img') ? 'image' : ['e-materiel', 'e-argent', 'e-consignes'].includes(id) ? 'ecodroit' : 'preparation');
  egal(ids.map(rub).sort(), ['ecodroit', 'image', 'preparation', 'preparation'], 'questions tirées');
  const choix = await pg.$$eval(`${Z} [data-q-choix]`, (L) => L.map((b) => b.textContent.trim()));
  egal(choix[choix.length - 1], 'Je ne sais pas', '« Je ne sais pas » en dernier');
  vrai(!(await present('[data-ouv-aide]')) && !(await present('details')), 'une aide à l’écran');
  await capture('0-ouverture');
  await pg.click(`${Z} [data-ouv-doc="droit"]`); await pause();
  const droit = await pg.$eval(`${Z} .qo-feuille`, (e) => e.textContent);
  vrai(/L4122-1/.test(droit) && /instructions qui lui sont données par l’employeur/.test(droit), 'le droit : ' + droit.slice(0, 160));
  vrai(!/\[\[/.test(await texte()), 'un mot cliquable');
  capturer = false;
  const t0 = await texte();
  vrai(!/\{tuteur\}|\{prestataire\}|\{site\}|\{cariste\}/.test(t0), 'une variable non remplie à l’écran');
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
  const nbChoix = await pg.evaluate(async ({ id }) => { const Q = await import('/contenus/questions/ENT-8.14.js'); return Object.fromEntries(Q.QUESTIONS.liste.map((x) => [x.id, x.choix.length])); }, { id: ID });
  const pts = async (rep, o = {}) => { await monter({ uid: 'e814-8', rep: { ...OUV_JUSTES, ...rep }, ...o }); return (await noter()).score; };
  const prep = ids.find((x) => rub(x) === 'preparation');
  proche(await pts({}), 4, 'quatre justes');
  proche(await pts({ [prep]: '@nsp' }), 3, 'trois justes + « Je ne sais pas »');
  proche(await pts({ [prep]: OUV_FAUSSES[prep] }), 3 - 1 / (nbChoix[prep] - 1), `trois justes + une fausse (${prep}, − 1 ÷ ${nbChoix[prep] - 1})`);
  proche(await pts(OUV_FAUSSES), 0, 'tout faux');
});

await v('ENT-8.14 : questions d’ouverture — 200 graines : jamais de variable de site, « ton tuteur » / « l’entreprise qui t’accueille » ; e-adresse dans l’allée A ou B (jamais C), chiffre du niveau unique dans l’adresse ; e-adresse-b au sol ; e-couches et e-couches-b : quatre résultats distincts, le juste calculé ; e-plaque : la palette dépasse la plaque (valeurs tirées) ; aucune bonne réponse identique à celles d’ENT-8.11 à 8.13', async () => {
  const r = await pg.evaluate(async () => {
    const Q = await import('/contenus/questions/ENT-8.14.js');
    const { hasard } = await import('/core/tirage.js');
    const L = Object.fromEntries(Q.QUESTIONS.liste.map((q) => [q.id, q]));
    const o = { c: 0, niveau: 0, hauteur: 0, couches: 0, couchesB: 0, plaque: 0, adressesVues: new Set(), variables: 0, autres: [] };
    const texte = (q, v) => [v ? v.enonce : q.enonce, ...q.choix.map((c) => (v && v.libs && v.libs[c.v]) || c.lib)].join(' | ');
    for (let i = 0; i < 200; i++) {
      const h = (k) => hasard(`graine-${i}|${k}`);
      const va = L['e-adresse'].variante(h('a')), m = va.enonce.match(/^(\w\d-T0\d-N(\d)-E(\d)) : que veut dire le (\d) \?$/);
      if (!m) { o.niveau++; continue; }
      o.adressesVues.add(m[1][0]);
      if (m[1][0] === 'C' || m[4] !== m[2] || (m[1].match(new RegExp(m[2], 'g')) || []).length !== 1) o.niveau++;
      const vb = L['e-adresse-b'].variante(h('b')), mb = vb.enonce.match(/^(\w\d-T0(\d)-N1-E\d) : à quelle hauteur \?$/);
      if (!mb || mb[1][0] === 'C' || vb.libs.niveau !== `au ${mb[2]}e niveau`) o.hauteur++;
      const vc = L['e-couches'].variante(h('c')), mc = vc.enonce.match(/^(\d) couches pleines de (\d) cartons, et (\d) cartons sur le dessus/);
      const nbs = (vv) => ['juste', 'sans', 'somme', 'plus', 'pleine'].map((k) => vv.libs[k]).filter(Boolean).map((x) => parseInt(x, 10));
      if (!mc || new Set(nbs(vc)).size !== 4 || vc.libs.juste !== `${mc[1] * mc[2] + Number(mc[3])} cartons sur la palette`) o.couches++;
      const vd = L['e-couches-b'].variante(h('d')), md = vd.enonce.match(/^Une palette de (\d) couches : les (\d) du dessous sont pleines de (\d) cartons, celle du dessus en a (\d)\./);
      if (!md || new Set(nbs(vd)).size !== 4 || vd.libs.juste !== `${(md[1] - 1) * md[3] + Number(md[4])} cartons en tout`) o.couchesB++;
      const vp = L['e-plaque'].variante(h('p')), mp = vp.enonce.replace(/[\s  ]/g, '').match(/Plaque:(\d+)kgparniveau\.Déjà(\d+)kg\.Palettede(\d+)kg/);
      if (!mp || Number(mp[2]) + Number(mp[3]) <= Number(mp[1]) || Number(mp[3]) < 350) o.plaque++;
      Q.QUESTIONS.liste.forEach((q) => { const t = q.variante ? texte(q, q.variante(h(q.id))) : texte(q); if (/\{(tuteur|prestataire|site|cariste)\}/.test(t)) o.variables++; });
    }
    // Les bonnes réponses d'ENT-8.11 à 8.13 : aucune n'est reprise mot pour mot.
    const autres = [];
    for (const f of ['ENT-8.11', 'ENT-8.12', 'ENT-8.13']) {
      const M = await import(`/contenus/questions/${f}.js`);
      M.QUESTIONS.liste.forEach((q) => { const j = (q.choix || []).find((c) => c.v === q.juste); if (j) autres.push(j.lib); });
    }
    const miennes = Q.QUESTIONS.liste.map((q) => [q.id, q.choix.find((c) => c.v === q.juste).lib]);
    o.memes = miennes.filter(([, lib]) => autres.includes(lib)).map(([id]) => id);
    return { ...o, adressesVues: [...o.adressesVues].sort() };
  });
  egal([r.niveau, r.hauteur, r.couches, r.couchesB, r.plaque, r.variables], [0, 0, 0, 0, 0, 0], 'e-adresse, e-adresse-b, e-couches, e-couches-b, e-plaque, variables');
  egal(r.adressesVues, ['A', 'B'], 'e-adresse : les allées A et B seulement');
  egal(r.memes, [], 'bonnes réponses identiques à celles des séances de travail');
});

// ─────────────────────────────────────────────────────────── les deux témoins
for (const uid of ['e814-8', 'e814-1']) {
  const J = T[uid];
  await v(`ENT-8.14 : témoin ${uid} (${J.site}) — parcours juste à l’écran : 20/20 à la remise, égal à noter(db) ; ni « Valider » ni « Terminer » ne rendent la copie (le bandeau seul) ; aucun verdict, aucun nombre du système, aucun mot qui juge à aucun écran ; l’écart (${J.sens}) est dans la fiche ; messages de ${J.tuteur} sans date`, async () => {
    capturer = uid === 'e814-8';
    await monter({ uid });
    const aChaque = async (quand, sys = true) => {
      egal(await sansSysteme(), [], `${uid}, ${quand} : aucun verdict ni règle`);
      if (sys) egal(await fuite([J.systeme]), [], `${uid}, ${quand} : le nombre du système (${J.systeme}) n’apparaît pas`);
      egal(await mots(), '', `${uid}, ${quand} : un mot qui juge`);
    };
    const E0 = await entrants();
    egal(E0.map((m) => [m.from, m.subject]), [[J.tuteur, 'Ce matin : ranger, puis compter']], 'message d’accueil');
    vrai(E0[0].text.includes(`Bonjour Lea, content de te revoir chez ${J.prest} !`) && E0[0].text.includes('la réception d’hier à ranger, puis quelques adresses à compter') && E0[0].text.includes(`${J.cariste} monte les palettes`), 'accueil de ' + J.tuteur + ' : ' + E0[0].text);
    await capture('1-accueil');
    await aller('entrepot');
    await aChaque('au départ');
    egal(await pg.$$eval(`${PZ} .pe-bandeau [data-pe-pal]`, (L) => L.map((b) => b.dataset.pePal)), ['P1', 'P2', 'P3', 'P4', 'P5'], 'cinq palettes à ranger');
    egal(await pt('[data-pal-amonter-liste]'), `À monter (${J.cariste}) : aucune`, 'le cariste du site');
    egal(await pt('[data-pal-etiq="P1"]'), `Adresse ${J.p1}`, 'l’adresse de P1 sur sa carte');
    vrai((await pt('.pe-perso')).includes('Ce matin : la réception d’hier à ranger, puis quelques adresses à compter.'), 'la consigne du plan');
    await capture(uid === 'e814-8' ? '2-plan-onnaing' : '3-plan-belleville', true);
    await rangerJuste(J);
    await aChaque('rangement fait');
    await scans(J);
    egal(await texte().then((t) => /Confirmé\./.test(t)), true, 'le Terminal dit « Confirmé. »');
    await valider();
    await aChaque('rangement validé');
    egal([await copies(), await ppresent('[data-pal-acompter]'), await pt('[data-pal="phase"]')], [0, false, 'Passer au comptage'], '« Valider mon rangement » ne rend pas la copie ; le bouton de phase prend sa place ; le comptage pas encore');
    egal((await entrants()).map((m) => m.subject), ['Ce matin : ranger, puis compter'], 'le tuteur n’a pas encore écrit le message du comptage');
    await versComptage();
    await aChaque('comptage, au départ');
    egal((await entrants()).map((m) => m.subject), ['Ce matin : ranger, puis compter', 'Maintenant, on compte'], 'le message du comptage à « Passer au comptage »');
    vrai((await entrants())[1].text.startsWith('Merci. Maintenant, compte ces 4 adresses.'), 'texte : ' + (await entrants())[1].text);
    egal(await pg.$$eval(`${PZ} [data-pal-acompter] li b`, (L) => L.map((x) => x.textContent)), J.compter.map((c) => c[0]), 'la liste « À compter » : quatre adresses, dans l’ordre de l’allée');
    egal(await actu(), 'Scanne l’adresse.', 'le Terminal');
    await capture('4-comptage');
    await compterJuste(J);
    await aChaque('comptage fait, avant « Terminer »');
    vrai(!(await present('.ent-nav[data-vue="fiche"]')), 'pas de fiche « Signaler l’écart » au menu avant la fin du comptage');
    await terminer();
    vrai(await present('.ent-nav[data-vue="fiche"]'), 'la fiche apparaît au menu après « Terminer le comptage »');
    egal([await copies(), await texte().then((t) => /Comptage terminé/.test(t))], [0, true], '« Terminer le comptage » ne rend pas la copie');
    await aChaque('comptage terminé');
    const M2 = await entrants();
    egal(M2.map((m) => m.subject), ['Ce matin : ranger, puis compter', 'Maintenant, on compte', 'Ton comptage'], 'le message de la fiche à « Terminer le comptage »');
    vrai(M2[2].ouvreFiche === 'ecarts-814' && !/écart(s)? (est|sont|à signaler)|il y a un écart/.test(M2[2].text), 'le message ne dit pas s’il y a un écart : ' + M2[2].text);
    await aller('fiche');
    egal(await pg.$$eval(`${Z} .ac814-tab tbody tr`, (L) => L.map((tr) => [...tr.children].map((c) => c.textContent.trim()))), [[J.compter[J.rang - 1][0], J.produitEcart, String(J.reel), String(J.systeme)]],
      'à gauche : SON écart, son compte et — maintenant seulement — le système');
    egal(await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.map((s) => s.dataset.ficheChamp)), [`faire-${J.rang}`, `cause-${J.rang}`], 'la fiche : une ligne, deux listes');
    egal(await pg.$$eval(`${Z} [data-fiche-champ="cause-${J.rang}"] option`, (L) => L.map((o) => o.value).filter(Boolean).sort()),
      J.sens === 'manque' ? ['abimes', 'ailleurs', 'dessus', 'pluie'] : ['abimes', 'dessus', 'double', 'saisie'], 'les causes dépendent du SENS de l’écart');
    await fiche(repFiche(J));
    egal((await entrants()).map((m) => m.subject), ['Ce matin : ranger, puis compter', 'Maintenant, on compte', 'Ton comptage', 'Merci'], 'le dernier message à l’envoi de la fiche');
    const E = await entrants();
    vrai(E.every((m) => m.from === J.tuteur) && !E.some((m) => JUGE.test(m.text)) && !E.some((m) => /20\d\d/.test(m.text)), 'expéditeurs, mots qui jugent, année : ' + E.map((m) => m.text).join(' / '));
    vrai(/Quand tu as fini, clique sur « Rendre ma copie »/.test(E[3].text), 'la remise est annoncée');
    egal(await pg.$$eval(`${Z} [data-pastille]`, (L) => L.map((x) => x.classList.contains('fait'))), [true, true, true], 'pastilles « fait »');
    const n = await noter();
    egal(faux(n.detail), [], 'jalons faux');
    egal(IDS.filter((j) => n.detail[j] !== 'ok'), [], 'jalons : tous justes, sans point compris');
    egal([n.score, n.max], [20, 20], 'noter(db) : ' + JSON.stringify(n.detail).slice(0, 300));
    egal(await copies(), 0, 'aucune copie rendue avant « Rendre ma copie »');
    egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
    await capture('7-avant-remise');
    const c = await rendre();
    egal([c.score, c.max], [n.score, n.max], 'la note rendue = noter(db)');
    egal(IDS.filter((j) => c.detail[j] !== 'ok'), [], 'le détail rendu : les 22 jalons, un par un');
    vrai(await present('[data-copie-etat="rendue"]'), 'copie rendue à l’écran');
    await aChaque('copie rendue', false);
    capturer = false;
    egal(erreursF, [], 'erreurs JavaScript');
  });
}

// ─────────────────────────────────────────────────────────── l'inaction, le rangement, les erreurs payées une fois
await v('ENT-8.14 : inaction — rien fait (ouverture sans réponse, aucun écran) → 0/20, aucun jalon juste ; copie vide rendue → 0 ; rangement validé vide, comptage terminé vide, fiche vide → 0, tous les jalons faux (les gardes aussi)', async () => {
  await monter({ uid: 'e814-8', sansOuverture: true });
  const n = await noter();
  egal([n.score, n.max], [0, 20], 'note');
  egal(IDS.filter((j) => n.detail[j] === 'ok'), [], 'jalons justes sans rien faire');
  egal((await rendre()).score, 0, 'copie vide rendue');
  await monter({ uid: 'e814-1', rep: OUV_FAUSSES });
  await aller('entrepot'); await valider(); await versComptage(); await terminer();
  egal(faux(await detail()), IDS.slice(0, 20), 'rangement validé vide, comptage terminé vide : tous faux');
  await fiche({});
  const n2 = await noter();
  egal(faux(n2.detail), IDS, 'la fiche vide (aucun écart confirmé) : fiche-signaler et fiche-cause faux aussi');
  egal(n2.score, 0, 'note');
});

await v('ENT-8.14 : signaler P1 à tort → place-P1 faux (pas de signale-P1), le reste inchangé (19) ; P1 posée au-dessus du sol (refusée) → pasPoseHaut faux ; P3 posée par l’élève au lieu d’être confiée → place-P3 et pasPoseHaut faux', async () => {
  const J = T['e814-8'];
  await monter({ uid: 'e814-8' });
  await aller('entrepot');
  await signaler('P1', J.p1, 'occupe');
  egal((await gestes()).filter((g) => /signaler:P1/.test(g)), [GE('signaler:P1')], 'le signalement de P1 est publié (comme celui de P4)');
  await ranger('P1', J.p1);
  await ranger('P2', J.p2); await ranger('P3', J.p3, 'confier'); await signaler('P4', J.p4, 'charge'); await adresseLibre(J);
  await scans(J); await valider(); await versComptage(); await compterJuste(J); await terminer(); await fiche(repFiche(J));
  const d = await detail();
  egal(faux(d), ['place-P1'], 'P1 signalée à tort, puis posée juste : place-P1 faux seul (scan-P1 vrai : le jalon juge son geste)');
  proche((await noter()).score, 19, 'note');
  // Une pose en hauteur tentée : refusée (la palette reste en main), pasPoseHaut faux ; P3 jamais rangée.
  await monter({ uid: 'e814-8' });
  await aller('entrepot');
  await ranger('P1', J.p1); await ranger('P2', J.p2);
  await prendre('P3'); await ouvrir(J.p3); await bouton('poser');
  egal(await texte().then((t) => /Au-dessus du sol, c’est .* qui monte la palette\./.test(t)), true, 'refus de la pose en hauteur, dit au Terminal ou à l’écran');
  await signaler('P4', J.p4, 'charge'); await adresseLibre(J);
  await valider();
  const d2 = await detail();
  egal(faux(d2).filter((j) => !/^(compte|recompte|fiche|scanAvant)/.test(j)), ['place-P3', 'pasPoseHaut', 'charge', 'scan-P1', 'scan-P2', 'scan-P3', 'scan-P5'],
    'pose en hauteur : place-P3, les scans non faits, pasPoseHaut et charge faux ; place-P1, place-P2, signale-P4, adresseLibre-P5 vrais');
  egal([d2['place-P1'], d2['place-P2'], d2['signale-P4'], d2['adresseLibre-P5']], ['ok', 'ok', 'ok', 'ok'], 'ce qui est juste reste juste');
});

await v('ENT-8.14 : P4 — signalée « charge » : elle reste en réception, « C’est noté. », aucune nouvelle adresse, pas de scan-P4 (signale-P4 ✓, pasPoseHaut ✓ : une palette signalée est traitée) ; confiée à son adresse sans signaler → signale-P4 faux ; motif « occupé » → signale-P4 faux ; jamais touchée → signale-P4 et pasPoseHaut faux (l’inaction)', async () => {
  const J = T['e814-1'];
  await monter({ uid: 'e814-1' });
  await aller('entrepot');
  await prendre('P4'); await ouvrir(J.p4); await bouton('signaler'); await pg.click(`${PZ} [data-pal-motif="charge"]`); await pause(30);
  const fen = await pt('[data-pal-modal]');
  vrai(/Signalement enregistré pour P4 \(Lessive liquide 3 L\) : « La charge serait dépassée »\. C’est noté\./.test(fen) && !/Nouvelle adresse|nouvelle adresse|autre adresse/.test(fen), 'la fenêtre du système : ' + fen);
  await fermerFenetre();
  const e = await etatE();
  egal([Object.keys(e.signalees), e.signalees.P4 && e.signalees.P4.motif, e.nouvelles, Object.keys(e.posees), Object.keys(e.confiees)], [['P4'], 'charge', {}, [], []], 'état : signalée, aucune nouvelle adresse, ni posée ni confiée');
  await ranger('P1', J.p1); await ranger('P2', J.p2); await ranger('P3', J.p3, 'confier'); await adresseLibre(J);
  await scans(J); await valider();
  const d = await detail();
  egal([d['signale-P4'], d['pasPoseHaut'], d.charge, 'scan-P4' in d], ['ok', 'ok', 'ok', false], 'P4 signalée : signale-P4, pasPoseHaut et charge vrais ; pas de scan-P4');
  // Confiée là sans signaler.
  await monter({ uid: 'e814-1' });
  await aller('entrepot');
  await ranger('P4', J.p4, 'confier'); await ranger('P1', J.p1); await ranger('P2', J.p2); await ranger('P3', J.p3, 'confier'); await adresseLibre(J);
  await scans(J); await valider();
  const d2 = await detail();
  egal(faux(d2), ['signale-P4', 'charge'], 'P4 confiée là : signale-P4 faux, charge faux (sans point), pasPoseHaut vrai');
  // Signalée avec le mauvais motif.
  await monter({ uid: 'e814-1' });
  await aller('entrepot');
  await signaler('P4', J.p4, 'occupe'); await ranger('P1', J.p1); await ranger('P2', J.p2); await ranger('P3', J.p3, 'confier'); await adresseLibre(J);
  await scans(J); await valider();
  egal(faux(await detail()), ['signale-P4'], 'P4 signalée « C’est occupé » : signale-P4 faux seul');
  // Jamais touchée : le reste est juste.
  await monter({ uid: 'e814-1' });
  await aller('entrepot');
  await ranger('P1', J.p1); await ranger('P2', J.p2); await ranger('P3', J.p3, 'confier'); await adresseLibre(J);
  await scans(J); await valider(); await versComptage(); await compterJuste(J); await terminer(); await fiche(repFiche(J));
  const d3 = await detail();
  egal(faux(d3), ['pasPoseHaut', 'signale-P4', 'charge'], 'P4 laissée en réception : signale-P4 faux ET pasPoseHaut faux (la garde exige toutes les palettes traitées : voulu, l’inaction) ; charge faux (sans point)');
  proche((await noter()).score, 16, 'note : 20 − 3 − 1');
});

await v('ENT-8.14 : P5, l’adresse prise — posée « à côté » sans rien demander → adresseLibre-P5 et scan-P5 faux (le Terminal refuse le scan : « Ce n’est pas l’adresse de cette palette. ») ; adresse libre demandée, rangée, scannée → ✓ ; demandée mais posée ailleurs → faux ; laissée en réception → faux + pasPoseHaut faux ; personne ne pousse à la poser à côté', async () => {
  const J = T['e814-8'];
  const reste = async () => { await ranger('P1', J.p1); await ranger('P2', J.p2); await ranger('P3', J.p3, 'confier'); await signaler('P4', J.p4, 'charge'); };
  await monter({ uid: 'e814-8' });
  await aller('entrepot');
  await reste();
  await prendre('P5'); await ouvrir(J.p5);
  vrai(/Occupé/.test(await texte()), 'l’adresse donnée est occupée');
  await ouvrir(J.acote); await bouton('poser');
  await scans(J, ['P1', 'P2', 'P3']);
  await scanPal('P5'); await ouvrir(J.acote); await scanEmp();
  const refus = await pg.$$eval(`${PZ} [data-terminal] .vt-passe.vt-ko`, (L) => L.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  egal(refus, ['Ce n’est pas l’adresse de cette palette.'], 'le Terminal refuse le scan à côté, en rouge');
  egal((await entrants()).map((m) => m.subject), ['Ce matin : ranger, puis compter'], 'personne n’écrit pour pousser à la poser à côté');
  await valider();
  const d = await detail();
  egal(faux(d), ['adresseLibre-P5', 'scan-P5'], 'à côté : adresseLibre-P5 et scan-P5 faux seuls');
  proche((await noter()).score, 4 + 3 + 2.25 + 3 + 1, 'note du rangement seul : ouverture 4, place P1 à P3 3, scans P1 à P3 2,25, signale-P4 3, pasPoseHaut 1');
  // Demandée, puis posée ailleurs (à côté) : faux.
  await monter({ uid: 'e814-8' });
  await aller('entrepot');
  await reste();
  await prendre('P5'); await ouvrir(J.p5); await bouton('libre'); await fermerFenetre(); await ouvrir(J.acote); await bouton('poser');
  await scans(J, ['P1', 'P2', 'P3']); await valider();
  egal(faux(await detail()), ['adresseLibre-P5', 'scan-P5'], 'demandée mais posée ailleurs : adresseLibre-P5 faux ; le scan à l’adresse libre manque aussi');
  // Rangée à l'adresse libre sans l'avoir demandée est refusé aussi (poser sur le libre sans « demander » : pas de demande = adresse donnée attendue).
  await monter({ uid: 'e814-8' });
  await aller('entrepot');
  await reste();
  await prendre('P5'); await ouvrir(J.libre); await bouton('poser');
  await scans(J, ['P1', 'P2', 'P3']); await valider();
  egal(faux(await detail()).filter((j) => /P5/.test(j)), ['adresseLibre-P5', 'scan-P5'], 'posée à l’adresse libre sans l’avoir demandée : adresseLibre-P5 faux (l’adresse libre n’a pas été donnée)');
  // Laissée en réception.
  await monter({ uid: 'e814-8' });
  await aller('entrepot');
  await reste(); await scans(J, ['P1', 'P2', 'P3']); await valider();
  egal(faux(await detail()), ['pasPoseHaut', 'charge', 'adresseLibre-P5', 'scan-P5'], 'laissée en réception : adresseLibre-P5, scan-P5 faux, et les gardes (une palette non traitée)');
  // Le bon geste jusqu'au bout : demandée, rangée, scannée.
  await monter({ uid: 'e814-8' });
  await aller('entrepot');
  await reste(); await adresseLibre(J); await scans(J); await valider();
  egal(faux(await detail()), [], 'adresse libre demandée, rangée, scannée : tout le rangement juste');
});

await v('ENT-8.14 : comptage en copie — le Terminal propose « Quantité différente. Recompter ou confirmer ? » (ni le nombre ni le sens) ; un compte juste confirmé sans recompter ne coûte aucun point (recompte-* sans poids) ; un compte faux confirmé → compte-<rang> faux seul (19,5) ; un compte faux sur une adresse conforme ajoute une ligne à la fiche, jugée comme les autres (une erreur ne se paie qu’une fois)', async () => {
  const J = T['e814-8'];
  const base = async () => { await monter({ uid: 'e814-8' }); await rangerJuste(J); await scans(J); await valider(); await versComptage(); };
  await base();
  await ouvrir(J.compter[0][0]); await pg.click(`${PZ} [data-pal-compte-emp]`); await taper(30);
  egal(await actu(), 'Scanne l’adresse.', 'compté juste : « Compris. », adresse suivante');
  await ouvrir(J.compter[1][0]); await pg.click(`${PZ} [data-pal-compte-emp]`); await taper(34);
  egal(await actu(), 'Quantité différente. Recompter ou confirmer ?', 'l’écart : le Terminal propose, en copie aussi');
  egal(await fuite([37]), [], 'ni le nombre du système…');
  vrai(!/manque|en trop|surplus|de moins|de plus/.test(await pt('[data-terminal]')), '…ni le sens : ' + await pt('[data-terminal]'));
  await choisir('confirmer');
  await compter(J, 2, 36); await compter(J, 3, 20); await terminer(); await fiche(repFiche(J));
  const d = await detail();
  egal(faux(d), ['recompte-2'], 'écart confirmé du premier coup, sans « Recompter » : seul recompte-2 (sans point) est faux');
  proche((await noter()).score, 20, 'aucun poids ne dépend du recomptage : 20 sur 20');
  // Un compte faux confirmé sur l'écart (35 au lieu de 34).
  await base();
  await compter(J, 0, 30); await compter(J, 1, 35, ['confirmer']); await compter(J, 2, 36); await compter(J, 3, 20); await terminer();
  await fiche(repFiche(J));
  egal(faux(await detail()), ['compte-2', 'recompte-2'], 'compte faux confirmé : compte-2 faux, la fiche (son écart reste un manque) juste');
  proche((await noter()).score, 19.5, 'note : 20 − 0,5');
  // Un compte faux confirmé sur une adresse CONFORME (31 au lieu de 30) : deux lignes dans la fiche.
  await base();
  await compter(J, 0, 31, ['confirmer']); await compter(J, 1, 34, ['recompter', 34, 'confirmer']); await compter(J, 2, 36); await compter(J, 3, 20);
  await terminer();
  await aller('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.map((s) => s.dataset.ficheChamp)), ['faire-1', 'cause-1', 'faire-2', 'cause-2'], 'la fiche porte SES deux écarts confirmés');
  await fiche({ 'faire-1': 'signaler', 'cause-1': 'dessus', 'faire-2': 'signaler', 'cause-2': 'abimes' });
  const d2 = await detail();
  egal(faux(d2).filter((j) => !/^recompte/.test(j)), ['compte-1'], 'le compte faux est payé UNE fois (compte-1) ; sa ligne de fiche, jugée selon SON sens (il y a des cartons en trop → « posés dessus »), est juste');
  proche((await noter()).score, 19.5, 'note');
  await base();
  await compter(J, 0, 31, ['confirmer']); await compter(J, 1, 34, ['recompter', 34, 'confirmer']); await compter(J, 2, 36); await compter(J, 3, 20); await terminer();
  await fiche({ 'faire-1': 'signaler', 'cause-1': 'abimes', 'faire-2': 'signaler', 'cause-2': 'abimes' });
  egal(faux(await detail()).filter((j) => !/^recompte/.test(j)), ['compte-1', 'fiche-cause'], 'sa ligne n° 1 avec la cause d’un manque alors qu’il y a des cartons en trop : fiche-cause faux en plus');
});

await v('ENT-8.14 : la fiche « Signaler l’écart » — « je corrige le stock moi-même » → fiche-signaler faux ; « je ne dis rien » → faux ; l’autre cause juste du sens → ✓ ; la cause de l’autre sens → fiche-cause faux ; une fiche SANS ligne (compte égal au système) → les deux faux ; la fiche part même incomplète', async () => {
  const J = T['e814-1'];
  const parcours2 = async (rep, comptes) => {
    await monter({ uid: 'e814-1' });
    await rangerJuste(J); await scans(J); await valider(); await versComptage();
    for (let i = 0; i < 4; i++) await compter(J, i, comptes ? comptes[i] : J.compter[i][1], i === J.rang - 1 && !comptes ? ['recompter', J.reel, 'confirmer'] : (comptes && comptes[i] !== J.compter[i][2] ? ['confirmer'] : []));
    await terminer(); await fiche(rep);
    return faux(await detail());
  };
  egal(await parcours2(repFiche(J, { faire: 'corriger' })), ['fiche-signaler'], '« corriger » : fiche-signaler faux seul');
  egal(await parcours2(repFiche(J, { faire: 'rien' })), ['fiche-signaler'], '« rien » : fiche-signaler faux seul');
  egal(await parcours2(repFiche(J, { cause: 'saisie' })), [], 'l’autre cause juste du surplus (« une réception saisie avec trop peu de cartons ») : ✓');
  egal(await parcours2(repFiche(J, { cause: CAUSE_AUTRE_SENS[J.sens] })), ['fiche-cause'], 'la cause d’un manque pour un surplus : fiche-cause faux seul');
  egal(await parcours2(repFiche(J, { cause: 'double' })), ['fiche-cause'], 'une cause absurde pour ce sens : fiche-cause faux seul');
  // Le système a dit 32 ; l'élève compte 32 : aucun écart confirmé, la fiche n'a pas de ligne.
  const sans = await parcours2({}, [19, 23, 36, 32]);
  egal(sans.filter((j) => !/^recompte/.test(j)), ['compte-4', 'fiche-signaler', 'fiche-cause'], 'fiche sans ligne : les deux faux, et son compte aussi');
  // La fiche part même incomplète (jamais un élève bloqué).
  await monter({ uid: 'e814-1' });
  await rangerJuste(J); await scans(J); await valider(); await versComptage(); await compterJuste(J); await terminer();
  await aller('fiche');
  await pg.selectOption(`${Z} [data-fiche-champ="faire-4"]`, 'signaler');
  await pg.click(`${Z} [data-fiche-envoyer]`); await confirmer();
  const d = await detail();
  egal([d['fiche-signaler'], d['fiche-cause']], ['ok', 'ko'], 'une fiche à moitié remplie part : seul ce qui est choisi compte');
});

// ─────────────────────────────────────────────────────────── l'écran, le corrigé, les graines
await v('ENT-8.14 : écrans à 1366 × 768 — l’accueil, le plan (Onnaing et Belleville), le comptage, la fiche : aucun défilement horizontal ; la zone de travail garde l’encre (charte bleue)', async () => {
  capturer = true;
  for (const uid of ['e814-8', 'e814-1']) {
    const J = T[uid];
    await monter({ uid });
    vrai(await large() <= 0, `${uid} : accueil, défilement horizontal`);
    await aller('entrepot');
    vrai(await large() <= 0, `${uid} : plan, défilement horizontal`);
    await rangerJuste(J); await scans(J); await valider(); await versComptage();
    vrai(await large() <= 0, `${uid} : comptage, défilement horizontal`);
    await ouvrir(J.compter[0][0]); await pg.click(`${PZ} [data-pal-compte-emp]`);
    if (uid === 'e814-8') await capture('5-comptage-adresse-ouverte');
    await taper(J.compter[0][1]); await compter(J, 1, J.compter[1][1], J.compter[1][1] !== J.compter[1][2] ? ['confirmer'] : []); await compter(J, 2, J.compter[2][1], J.compter[2][1] !== J.compter[2][2] ? ['confirmer'] : []);
    await compter(J, 3, J.compter[3][1], J.compter[3][1] !== J.compter[3][2] ? ['confirmer'] : []); await terminer();
    await aller('fiche');
    vrai(await large() <= 0, `${uid} : fiche, défilement horizontal`);
    await aller('mail');
    vrai(await large() <= 0, `${uid} : messagerie, défilement horizontal`);
  }
  capturer = false;
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.14 : le corrigé de l’enseignant se calcule pour un élève (son site, ses palettes, l’adresse libre de P5, ses quatre adresses et l’écart, la cause juste) et pour un élève qui n’a pas ouvert ; aucune requête hors du site', async () => {
  const c = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-8.14.js');
    const e8 = C.corrigeEleve({ tirage: { graine: 'e814-8' } }, 'e814-8');
    const e1 = C.corrigeEleve({ tirage: { graine: 'e814-1' } }, 'e814-1');
    const vide = C.corrigeEleve({}, 'e814-8');
    return { n: C.CORRIGE.items.length, titres: C.CORRIGE.items.map((x) => x.etapeTitre), e8: e8.items.map((x) => [x.texte, x.rep]), e1: e1.items.map((x) => [x.texte, x.rep]), vide: [vide.texte, vide.items.length], t8: e8.texte };
  });
  egal(c.n, 7, 'corrigé commun : six blocs et l’ouverture');
  egal(c.titres.map((t) => /\((\d)(,\d)? points?\)/.exec(t)[0]), ['(3 points)', '(4 points)', '(2 points)', '(3 points)', '(2 points)', '(2 points)', '(4 points)'], 'points par bloc');
  const plat = (s) => s.replace(/[  ]/g, ' ');   // l'espace fine des milliers
  const t8 = plat(c.e8.map((x) => x.join(' → ')).join('\n')), t1 = plat(c.e1.map((x) => x.join(' → ')).join('\n'));
  vrai(/Onnaing \(GXO\) — Karim, chef d’équipe ; Léo, cariste ; 3 allées/.test(t8), 'le site de e814-8 : ' + t8.slice(0, 200));
  vrai(/P4 — Croquettes pour chien 4 kg → À SIGNALER \(« La charge serait dépassée »\) depuis B2-T02-N3-E1 : plaque 1 200 kg, déjà 986 kg \+ 425 kg = 1 411 kg/.test(t8), 'P4 de e814-8 : ' + t8);
  vrai(/P5 — Nettoyant multi-usages 1 L → l’adresse donnée B1-T01-N1-E1 est prise \(Bougies parfumées\) : demander une adresse libre → A1-T01-N1-E2/.test(t8), 'P5 de e814-8');
  vrai(/À compter n° 2 : B2-T03-N1-E2 \(Nettoyant multi-usages 1 L\) → réel 34 cartons, le système croit 37 \(il manque des cartons : écart à signaler\)/.test(t8), 'l’écart de e814-8');
  vrai(/La fiche « Signaler l’écart » → ligne de l’adresse n° 2 \(il manque des cartons\) : « je le signale », cause juste parmi « des cartons abîmés ont été sortis sans être déclarés » ou « une partie des cartons a été rangée à une autre adresse »/.test(t8), 'la fiche de e814-8');
  vrai(/Belleville-en-Beaujolais \(Kuehne\+Nagel\) — Sandrine, cheffe d’équipe ; Hugo, cariste ; 2 allées/.test(t1)
    && /A1-T01-N4-E2 : plaque 1 100 kg, déjà 1 038 kg \+ 493 kg = 1 531 kg/.test(t1) && /réel 35 cartons, le système croit 32 \(il y a des cartons en trop/.test(t1), 'e814-1 : ' + t1);
  vrai(/n’a pas encore ouvert/.test(c.vide[0]) && /Onnaing|Belleville/.test(c.vide[0]) && c.vide[1] === 11, 'élève qui n’a pas ouvert : ' + c.vide.join(' / '));
  egal([...hotes], [], 'requêtes hors du site');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.14 : l’enseignant ouvre la séance — le plan et les attendus (« Côté enseignant ») s’affichent sans erreur, il n’a pas de bouton « Rendre ma copie » ; l’élève, lui, n’a jamais les attendus', async () => {
  await monter({ uid: 'e814-8', role: 'prof' });
  await aller('entrepot');
  const t = await texte();
  vrai(/Côté enseignant/.test(t), 'l’enseignant voit les attendus');
  vrai(/Évaluation/.test(t) && !(await present('[data-copie-rendre]')), 'pas de bouton « Rendre ma copie » pour l’enseignant');
  await monter({ uid: 'e814-8' });
  await aller('entrepot');
  egal(await sansSysteme(), [], 'l’élève : ni attendus, ni règles, ni verdict');
  egal(erreursF, [], 'erreurs JavaScript');
});

await F.fermer();
}
