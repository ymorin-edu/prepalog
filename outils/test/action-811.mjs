// Suite de tests de Prepalog — bloc « action-811 » : ENT-8.11 Action, « ranger à la bonne adresse » (CAP OL, guidage CAP-C1.5), première séance du
// palettier à adresse donnée (chantier E-7, lots 0, 1 et 2). Brief `docs/briefs/ENT-8.11-action-ranger.md` §8 ; décisions du chef de chantier :
// `docs/briefs/COORDINATION-palettier.md` §3. `PORT_TESTS=8131 node outils/test.mjs action-811` ne lance que ce bloc. Aides communes (ouvrir la
// page, lire la base) : `outils/test/france-boissons/commun.mjs`. Le plan se joue au clic (comme le bloc `palettier`) ; la fiche par `selectOption`.
//
// Valeurs ÉCRITES À LA MAIN. Poids des palettes (cartons × kg + 25) : LES 36 × 13 → 493 · NET 40 × 13 → 545 · CRO 32 × 12,5 → 425 · CAH 30 × 9 → 295 ·
// SER 40 × 6 → 265 · BOU 60 × 3 → 205 · BOI 24 × 4 → 121 · PEL 24 × 3 → 97. Plaques : N2 1 500, N3 1 200, N4 1 000 ; le sol n'en a pas.
// Deux élèves TÉMOINS (graine posée à la main dans `db.tirage`), relevés une fois le 22/10/2026 et recopiés ici :
//   « temoin-1 » : P1 SER A2-T04-N1-E2 (sol) · P2 LES B1-T03-N1-E3 (sol) · P3 CAH A1-T01-N3-E1 · P4 NET B2-T03-N2-E3 · P5 CRO B2-T01-N3-E1 (le niveau
//                porte 918 kg ; + 425 = 1 343 > 1 200 → à signaler), nouvelle adresse B1-T03-N2-E3 · P6 PEL A2-T01-N2-E2 (confirmé) ;
//                fiche A1-T03-N4-E2 ; q-adresse B1-T04-N2-E3 ; q-plaque 1 000 / 400 / 800.
//   « temoin-2 » : P1 CAH A1-T02-N1-E3 · P2 NET B1-T04-N1-E3 · P3 BOU B1-T04-N2-E1 · P4 SER B2-T01-N3-E1 · P5 LES B2-T04-N4-E1 (850 kg ; + 493 =
//                1 343 > 1 000), nouvelle adresse A2-T04-N2-E1 · P6 CRO B2-T04-N2-E1 ; fiche A2-T01-N4-E3.
// Poids des jalons : fiche 1 × 3 · P1, P2 2 × 2 · signale-P5 2, charge 1 · P3, P4 1 × 2 · scan 0,6 × 5 · forme du message 1 · pasPoseHaut 0 (garde) ;
// questions (part 4) : q-adresse 0,75, q-plaque 0,75, q-kevin 0,5, q-sans-scan 0,75, q-materiel 0,75, q-securite 0,5.

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });
const CAPTURES = process.env.CAPTURES_ENT811 || '';

const ID = 'action-ranger';
const EID = 'action-ranger';
const P = `${Z} .pal`;
const REP_OUV = { 'k-adresse': 'ou', 'k-sol-reserve': 'picking', 'k-plaque': 'kilos', 'k-scan': 'systeme', 'k-reserve': 'reserve', 'k-cariste': 'chariot',
  'k-poids': 'juste', 'img-plaque': 'plaque', 'img-retractable': 'retractable' };
const BONNES_Q = { 'q-adresse': 'niveau', 'q-plaque': 'non', 'q-kevin': 'autorisation', 'q-sans-scan': 'nulle-part', 'q-materiel': 'prestataire', 'q-securite': 'les-deux' };
const FAUSSES_Q = { 'q-adresse': 'allee', 'q-plaque': 'oui', 'q-kevin': 'vite', 'q-sans-scan': 'devine', 'q-materiel': 'patron', 'q-securite': 'personne' };
const GROUPES = ['Lire une adresse', 'Ranger au niveau 1', 'La plaque de charge', 'Passer la main à Kevin', 'Scanner', 'Le message à Kevin', 'Les questions de Samia'];
const JALONS = ['adresse-cote', 'adresse-travee', 'adresse-niveau', 'place-P1', 'place-P2', 'signale-P5', 'charge', 'place-P3', 'place-P4',
  'scan-P1', 'scan-P2', 'scan-P3', 'scan-P4', 'scan-P5', 'kevin-forme'];
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus|bien vu)\b/i;
const T1 = { graine: 'temoin-1', P1: 'A2-T04-N1-E2', P2: 'B1-T03-N1-E3', P3: 'A1-T01-N3-E1', P4: 'B2-T03-N2-E3', P5: 'B2-T01-N3-E1', P5n: 'B1-T03-N2-E3', P6: 'A2-T01-N2-E2',
  noms: { P1: 'Serviettes de bain', P2: 'Lessive liquide 3 L', P3: 'Cahiers grand format', P4: 'Nettoyant multi-usages 1 L', P5: 'Croquettes pour chien 4 kg', P6: 'Peluches' },
  fiche: 'A1-T03-N4-E2', demande: 'peux-tu monter P3 en A1-T01-N3-E1, P4 en B2-T03-N2-E3 et P5 en B1-T03-N2-E3 ?' };
const T2 = { graine: 'temoin-2', P1: 'A1-T02-N1-E3', P2: 'B1-T04-N1-E3', P3: 'B1-T04-N2-E1', P4: 'B2-T01-N3-E1', P5: 'B2-T04-N4-E1', P5n: 'A2-T04-N2-E1', P6: 'B2-T04-N2-E1',
  noms: { P1: 'Cahiers grand format', P2: 'Nettoyant multi-usages 1 L', P5: 'Lessive liquide 3 L' },
  fiche: 'A2-T01-N4-E3', demande: 'peux-tu monter P3 en B1-T04-N2-E1, P4 en B2-T01-N3-E1 et P5 en A2-T04-N2-E1 ?' };
const PHR_JUSTES = (T, prenom = 'Lea') => ({ salutation: 'Bonjour Kevin,', demande: T.demande, politesse: 'Merci !', fin: prenom });

// Monte la séance dans la page. `o.graine` : la graine posée (l'élève témoin) ; les réponses d'« Avant de commencer » sont posées (sauf `sansOuverture`).
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-ranger.js');
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
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ac811' },
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
  for (let i = 0; i < 6; i++) {
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

// ① la fiche « Lire une adresse » (`rep` : la valeur choisie par ligne)
const FICHE_JUSTE = { cote: 'cote', travee: 'travee', niveau: 'niveau' };
async function fiche(rep = FICHE_JUSTE, choix = BONNES_Q) {
  await allerV('fiche');
  for (const [id, val] of Object.entries(rep)) { await pg.selectOption(Q(`[data-fiche-champ="${id}"]`), val); await pause(30); }
  await capture('2-fiche');
  await pg.click(Q('[data-fiche-envoyer]')); await confirmer();
  await qrep(choix);
}
// ② le plan
const bouton = async (k) => { await pg.click(`${P} [data-pal="${k}"]`); await pause(40); };
const prendre = async (id) => { await pg.click(`${P} .pe-bandeau [data-pe-pal="${id}"]`); await pause(40); };
async function ouvrir(a) {
  if (await present('.pal [data-pal="retour"]')) await bouton('retour');
  await pg.click(`${P} [data-pe-trav="${a.slice(0, 6)}"]`); await pause(30);
  await pg.click(`${P} [data-pe-emp="${a}"]`); await pause(40);
}
// Ranger une palette (`geste` : poser ou confier) ; les questions qui arrivent sont répondues.
async function ranger(id, a, geste = 'poser', choix = BONNES_Q) { await prendre(id); await ouvrir(a); await bouton(geste); await qrep(choix); }
// Scanner : l'étiquette de la palette (sous sa carte), puis celle de l'emplacement (vue de près).
async function scanner(id, a, choix = BONNES_Q) {
  await pg.click(`${P} .pe-bandeau [data-pal-scan-pal="${id}"]`); await pause(40);
  if (!(await present(`.pal [data-pal-scan-emp="${a}"]`))) await ouvrir(a);
  await pg.click(`${P} [data-pal-scan-emp="${a}"]`); await pause(40);
  await qrep(choix);
}
async function signaler(id, a, motif = 'charge', choix = BONNES_Q) {
  await prendre(id); await ouvrir(a); await bouton('signaler');
  await pg.click(`${P} [data-pal-motif="${motif}"]`); await pause(40);
  if (await present('.pal [data-pal-modal]')) await pg.click(`${P} [data-pal-modal-ok]`);
  await pause(40);
  await qrep(choix);
}
async function valider(choix = BONNES_Q) {
  await allerV('entrepot');
  if (await present('.pal [data-pal="retour"]')) await bouton('retour');
  await bouton('valider'); await bouton('validerOui'); await pause();
  await qrep(choix);
}
// Le rangement juste d'un témoin (`o.sauf` : palettes laissées ; `o.sansScan` : palettes non scannées ; `o.p6` : la 6e palette, confirmé).
async function ranger5(T, o = {}) {
  const sauf = o.sauf || [], sansScan = o.sansScan || [], choix = o.q || BONNES_Q;
  await allerV('entrepot');
  const un = async (id, a, g) => { if (sauf.includes(id)) return; await ranger(id, a, g, choix); if (!sansScan.includes(id)) await scanner(id, a, choix); };
  await un('P1', T.P1, 'poser');
  await un('P2', T.P2, 'poser');
  await un('P3', T.P3, 'confier');
  await un('P4', T.P4, 'confier');
  if (o.p6) await un('P6', T.P6, 'confier');
  if (!sauf.includes('P5')) { await signaler('P5', T.P5, 'charge', choix); await un('P5', T.P5n, 'confier'); }
}
// ③ le message à Kevin
async function ouvrirMail(sujet) {
  await allerV('mail');
  await pg.click(Q('[data-dossier="in"]'));
  await pg.click(Q(`.ent-obj:text-is("${sujet}")`));
  await pause();
}
const choixDe = (ligne) => pg.$$eval(Q(`[data-phrase="${ligne}"] option`), (L) => L.map((x) => x.textContent.trim()).filter((t) => t && !/^Choisir/.test(t)));
async function repondreKevin(lignes, choix = BONNES_Q, deja = false) {
  if (!deja) { await ouvrirMail('Des palettes pour moi ?'); await pg.click(Q('[data-repondre]')); }
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  for (const [l, t] of Object.entries(lignes)) { await pg.selectOption(Q(`[data-phrase="${l}"]`), { label: t }); await qrep(choix); }
  await capture('5-reponse-kevin');
  await pg.click(Q('#formPhr button[type="submit"]'));
  await confirmer();
  await qrep(choix);
}
async function monterPalettes(choix = BONNES_Q) { await allerV('entrepot'); if (await present('.pal [data-pal="retour"]')) await bouton('retour'); await bouton('monter'); await qrep(choix); }
// Le parcours juste complet d'un témoin.
async function parcours(T, o = {}) {
  await fiche(o.fiche || FICHE_JUSTE, o.q);
  await ranger5(T, o);
  await monterPalettes(o.q);
  await repondreKevin(o.phrases || PHR_JUSTES(T), o.q);
  await valider(o.q);
}
const etatPlan = () => pg.evaluate((EID) => JSON.parse(JSON.stringify((window.__f.db.entrepots || {})[EID] || null)), EID);
const lisible = () => pg.evaluate(async () => { const E = await import('/core/types/entrepot.js'); const S = await import('/contenus/action-ent811-donnees.js');
  return E.etatPalettier(window.__f.db, S.entrepotDe); });
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { fin: b.dataset.fin, lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]),
    corriger: !!b.querySelector('[data-fin-corriger]'), fige: !!b.querySelector('[data-fin-fige]'), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});
const cases = () => pg.$$eval(Q('[data-fin-case]'), (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.textContent.replace(/\s+/g, ' ').trim(),
  l.querySelector('[data-fin-aller]')?.dataset.finAller || '']));
const jalonsFaux = (n) => JALONS.filter((j) => n.detail[j] !== 'ok');
const nouveau = () => { VUS = []; Object.keys(VERDICTS).forEach((k) => delete VERDICTS[k]); };

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-8.11 : déclaration (CAP, C1.5, guidage, 20 points, parcours après ENT-8.9) ; poids par bloc (somme 20 avec la part 4) ; questions rebranchées ; plan palettier avec Terminal', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-ranger.js');
    const S = await import('/contenus/action-ent811.js');
    const Qs = await import('/contenus/questions/ENT-8.11.js');
    const D = await import('/contenus/action-ent811-donnees.js');
    const m = A.meta, E = S.ETAPES.filter((e) => !e.bonus), B = S.ETAPES.filter((e) => e.bonus);
    const poidsDe = (e) => (e.compte === false ? 0 : e.poids);
    const decl = (n) => { const x = D.entrepotDe('temoin-1', { niveau: n }); return [x.id, x.mode, x.aideCharge, x.verdict, JSON.stringify(x.terminal), x.cariste.niveaux, typeof x.cariste.monte,
      x.palettes.map((p) => p.id + (p.nouvelleAdresse ? '+' : '') + (p.niveaux ? '*' : '')).join(' '), x.personnage.texte, !!x.regles]; };
    return {
      m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.parcours, m.correction, m.bilanDetail, m.precedente,
        m.niveauxPrevus, m.questions, m.ouverture, m.corrige],
      ids: E.map((e) => e.id), poids: E.map(poidsDe), somme: E.reduce((t, e) => t + poidsDe(e), 0), part: Qs.QUESTIONS.part,
      parGroupe: Object.entries(E.filter((e) => e.compte !== false).reduce((o, e) => { o[e.groupe] = (o[e.groupe] || 0) + e.poids; return o; }, {})).map(([g, p]) => [g, Math.round(p * 100) / 100]),
      garde: E.filter((e) => e.compte === false).map((e) => [e.id, e.poids, e.groupe]),
      ecrans: [...new Set(E.filter((e) => e.ecran).map((e) => e.ecran))], bonus: B.map((e) => [e.id, e.poids, e.groupe]),
      qFil: Qs.QUESTIONS.liste.filter((x) => x.type === 'fil').map((x) => [x.id, x.de, x.poids, x.apres || 'tout de suite', (x.quand.gestes || []).length]),
      gestesQ: Object.fromEntries(Qs.QUESTIONS.liste.filter((x) => x.type === 'fil').map((x) => [x.id, (x.quand.gestes || []).slice(0, 2)])),
      ouv: [Qs.QUESTIONS.ouverture.tirage, Qs.QUESTIONS.ouverture.questions.length],
      decl: { standard: decl('standard'), accompagne: decl('accompagne'), confirme: decl('confirme') },
      fin: S.OPTIONS.finFige, fermeture: S.OPTIONS.fermetures.entrepot.message,
    };
  });
  egal(r.m, ['action-ranger', 'ENT-8.11', 'simulog', ['cap'], [], ['CAP-C1.5'], 'guidage', 20, true, true, true, 'action-palette-lucas',
    ['confirme', 'accompagne'], 'ENT-8.11', 'prof', './contenus/corriges/ENT-8.11.js'], 'meta ENT-8.11');
  egal(r.ids, ['adresse-cote', 'adresse-travee', 'adresse-niveau', 'place-P1', 'place-P2', 'signale-P5', 'charge', 'place-P3', 'place-P4', 'pasPoseHaut',
    'scan-P1', 'scan-P2', 'scan-P3', 'scan-P4', 'scan-P5', 'kevin-forme'], 'jalons du socle');
  egal(r.poids, [1, 1, 1, 2, 2, 2, 1, 1, 1, 0, 0.6, 0.6, 0.6, 0.6, 0.6, 1], 'poids jalon par jalon (écrits à la main)');
  proche(r.somme + r.part, 20, 'somme des poids des jalons et des questions');
  egal(r.parGroupe, [['Lire une adresse', 3], ['Ranger au niveau 1', 4], ['La plaque de charge', 3], ['Passer la main à Kevin', 2], ['Scanner', 3],
    ['Le message à Kevin', 1]], 'points par ligne du bandeau (brief §5)');
  egal(r.garde, [['pasPoseHaut', 0, undefined]], 'pasPoseHaut : garde à poids 0, sans ligne au bandeau');
  egal(r.ecrans, ['fiche:adresse', 'phrases:kevin'], '« Corriger » rouvre la fiche et le message ; jamais le plan');
  egal(r.bonus, [['place-P6', undefined, undefined], ['scan-P6', undefined, undefined]], 'P6 : deux cas bonus, sans poids ni groupe');
  egal(r.qFil, [['q-adresse', 'samia', 0.75, 'tout de suite', 6], ['q-plaque', 'samia', 0.75, 'bilan', 12], ['q-kevin', 'samia', 0.5, 'tout de suite', 6],
    ['q-sans-scan', 'samia', 0.75, 'tout de suite', 6], ['q-materiel', 'samia', 0.75, 'tout de suite', 0], ['q-securite', 'samia', 0.5, 'tout de suite', 1]], 'questions au fil');
  egal(r.gestesQ, { 'q-adresse': ['entrepot:action-ranger:poser:P1', 'entrepot:action-ranger:poser:P2'],
    'q-plaque': ['entrepot:action-ranger:poser:P1', 'entrepot:action-ranger:confier:P1'], 'q-kevin': ['entrepot:action-ranger:confier:P1', 'entrepot:action-ranger:confier:P2'],
    'q-sans-scan': ['entrepot:action-ranger:scan:P1', 'entrepot:action-ranger:scan:P2'], 'q-materiel': [], 'q-securite': ['entrepot:action-ranger:valider'] }, 'gestes rebranchés');
  egal(r.ouv, [{ preparation: 3, image: 1 }, 9], 'Avant de commencer : 9 notions, 3 + 1 tirées');
  const base = ['action-ranger', 'palettier'];
  egal(r.decl.standard, [...base, 'pose', 'critere', '{"nom":"Terminal"}', [2, 3, 4], 'function', 'P1 P2 P3 P4 P5+ P6*', 'Range les palettes de la réception.', true], 'plan standard');
  egal(r.decl.accompagne.slice(2, 4), ['somme', 'adresse'], 'accompagné : somme de charge et adresse attendue');
  egal(r.decl.confirme.slice(2, 4), ['pose', 'critere'], 'confirmé : comme le standard (P6 en plus)');
  egal(r.fin, 'Ton rangement est validé : il ne se refait pas.', 'finFige');
  egal(r.fermeture, 'Après la fiche « Lire une adresse »', 'le plan fermé jusqu’à la fiche');
});

// ─────────────────────────────────────────────────────────── le tirage et l'équité
await v('ENT-8.11 : tirage — 200 graines : zéro secours ; P5 dépasse TOUJOURS sa plaque, et le niveau ne la dépasse pas sans elle ; P3, P4, P6 et la nouvelle adresse ne dépassent JAMAIS, sur quatre niveaux à part ; adresses libres et différentes ; chaque produit sort ≥ 10 fois', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent811-donnees.js');
    const { tirerJeu } = await import('/core/tirage.js');
    const KG = { LES: 493, NET: 545, CRO: 425, CAH: 295, SER: 265, BOU: 205, BOI: 121, PEL: 97 };   // écrits à la main
    const PLAQUE = { 2: 1500, 3: 1200, 4: 1000 };
    const niv = (a) => a.split('-').slice(0, 3).join('-'), n = (a) => Number(a.split('-')[2].slice(1));
    const charge = (a) => Object.entries(D.STOCK).filter(([x]) => niv(x) === niv(a)).reduce((t, [, s]) => t + KG[s.produit], 0);
    const o = { secours: 0, nonConforme: 0, p5Tient: 0, p5Deja: 0, autreDepasse: 0, memeNiveau: 0, occupee: 0, doublon: 0, sol: 0, lourd: 0, produits: {} };
    for (let i = 0; i < 200; i++) {
      const t = tirerJeu(D.TIRAGE, `eleve-${i}|action-ranger`), j = t.jeu, A = j.adresse, Pd = j.produit;
      if (t.secours) o.secours++;
      if (D.verifier(j).length) o.nonConforme++;
      if (!(charge(A.P5) + KG[Pd.P5] > PLAQUE[n(A.P5)])) o.p5Tient++;
      if (charge(A.P5) > PLAQUE[n(A.P5)]) o.p5Deja++;
      [['P3', A.P3], ['P4', A.P4], ['P6', A.P6], ['P5', j.nouvelle]].forEach(([id, a]) => { if (charge(a) + KG[Pd[id]] > PLAQUE[n(a)]) o.autreDepasse++; });
      const hauts = [A.P3, A.P4, A.P6, j.nouvelle].map(niv);
      if (new Set(hauts).size < 4 || hauts.includes(niv(A.P5))) o.memeNiveau++;
      const toutes = [...Object.values(A), j.nouvelle];
      if (toutes.some((a) => D.STOCK[a] || ['B1-T01-N2-E1', 'A2-T04-N3-E2'].includes(a))) o.occupee++;
      if (new Set(toutes).size !== 7 || new Set(Object.values(Pd)).size !== 6) o.doublon++;
      if (n(A.P1) !== 1 || n(A.P2) !== 1 || A.P1[0] !== 'A' || A.P2[0] !== 'B' || n(j.nouvelle) !== 2) o.sol++;
      if (!['LES', 'NET', 'CRO'].includes(Pd.P5) || ['LES', 'NET', 'CRO'].includes(Pd.P3)) o.lourd++;
      Object.values(Pd).forEach((k) => { o.produits[k] = (o.produits[k] || 0) + 1; });
    }
    // Aucun niveau du stock de départ ne dépasse déjà sa plaque.
    const niveaux = [...new Set(Object.keys(D.STOCK).filter((a) => n(a) > 1).map(niv))];
    o.surcharges = niveaux.filter((x) => charge(`${x}-E1`) > PLAQUE[n(`${x}-E1`)]);
    o.part = Object.keys(D.STOCK).length / 192;
    return o;
  });
  egal([r.secours, r.nonConforme, r.p5Tient, r.p5Deja, r.autreDepasse, r.memeNiveau, r.occupee, r.doublon, r.sol, r.lourd], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'secours, non conformes, P5 qui tient, niveau de P5 déjà surchargé, une autre qui dépasse, même niveau, adresse occupée, doublons, sol, lourds');
  egal(Object.keys(r.produits).sort(), ['BOI', 'BOU', 'CAH', 'CRO', 'LES', 'NET', 'PEL', 'SER'], 'les huit produits sortent');
  vrai(Object.values(r.produits).every((x) => x >= 10), 'chaque produit au moins 10 fois : ' + JSON.stringify(r.produits));
  egal(r.surcharges, [], 'aucun niveau du stock déjà au-delà de sa plaque');
  vrai(r.part > 0.35 && r.part < 0.6, `environ la moitié des emplacements occupés : ${r.part}`);
});

await v('ENT-8.11 : contrôle d’équité — `verifier` refuse un produit en double, une P5 qui tient, une P3 lourde, deux palettes sur un niveau ; témoins et référence passent ; les témoins sont ceux recopiés', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent811-donnees.js');
    const j = () => JSON.parse(JSON.stringify(D.jeuDe('temoin-1')));
    const double = j(); double.produit.P4 = double.produit.P1;
    const tient = j(); tient.adresse.P5 = 'A1-T01-N3-E2';
    const lourd = j(); lourd.produit.P3 = 'NET'; lourd.produit.P4 = 'CAH';
    const niveau = j(); niveau.adresse.P4 = 'A1-T01-N3-E3';
    const t1 = D.jeuDe('temoin-1'), t2 = D.jeuDe('temoin-2');
    return { double: D.verifier(double), tient: D.verifier(tient), lourd: D.verifier(lourd), niveau: D.verifier(niveau),
      bons: [D.verifier(t1), D.verifier(t2), D.verifier(D.jeuDe(''))],
      t1: [t1.adresse, t1.nouvelle, t1.produit], t2: [t2.adresse, t2.nouvelle], fiches: [D.adresseFiche({ tirage: { graine: 'temoin-1' } }), D.adresseFiche({ tirage: { graine: 'temoin-2' } })] };
  });
  vrai(r.double.some((x) => /même produit/.test(x)), 'produit en double : ' + r.double);
  vrai(r.tient.some((x) => /ne dépasse pas/.test(x)), 'P5 qui tient : ' + r.tient);
  vrai(r.lourd.some((x) => /P3 est lourde/.test(x)), 'P3 lourde : ' + r.lourd);
  vrai(r.niveau.some((x) => /même niveau/.test(x)), 'deux palettes sur un niveau : ' + r.niveau);
  egal(r.bons, [[], [], []], 'témoins et référence conformes');
  egal(r.t1, [{ P1: T1.P1, P2: T1.P2, P5: T1.P5, P3: T1.P3, P4: T1.P4, P6: T1.P6 }, T1.P5n, { P5: 'CRO', P3: 'CAH', P1: 'SER', P2: 'LES', P4: 'NET', P6: 'PEL' }], 'témoin 1');
  egal(r.t2, [{ P1: T2.P1, P2: T2.P2, P5: T2.P5, P3: T2.P3, P4: T2.P4, P6: T2.P6 }, T2.P5n], 'témoin 2');
  egal(r.fiches, [T1.fiche, T2.fiche], 'adresses de la fiche');
});

// ─────────────────────────────────────────────────────────── jalons sur bases fabriquées
// Un état du plan validé : tout juste, avec des retouches (`o`).
const etatJuste = (T, o = {}) => Object.assign({
  enMain: null, posees: { P1: T.P1, P2: T.P2 }, confiees: { P3: T.P3, P4: T.P4, P5: T.P5n }, signalees: { P5: { motif: 'charge', adresse: T.P5 } },
  nouvelles: { P5: T.P5n }, tentativesHaut: 0, valide: true, at: 1, premierGeste: 1, monterDemande: true, monteesValidation: ['P3', 'P4', 'P5'],
  scan: { P1: T.P1, P2: T.P2, P3: T.P3, P4: T.P4, P5: T.P5n }, scansRefuses: 0, scanAttente: null,
}, o);
const juger = (etat, o = {}) => pg.evaluate(async ({ etat, g, aisance }) => {
  const S = await import('/contenus/action-ent811.js');
  const db = { tirage: { graine: g }, aisance, entrepots: { 'action-ranger': etat } };
  return Object.fromEntries(S.ETAPES.filter((e) => /^(place|signale|scan|charge|pasPoseHaut)/.test(e.id)).map((e) => { const s = e.verifier(db); return [e.id, s ? s.status : null]; }));
}, { etat, g: o.graine || T1.graine, aisance: o.aisance || 'standard' });
const OK_PLAN = { 'place-P1': 'ok', 'place-P2': 'ok', 'signale-P5': 'ok', charge: 'ok', 'place-P3': 'ok', 'place-P4': 'ok', pasPoseHaut: 'ok',
  'scan-P1': 'ok', 'scan-P2': 'ok', 'scan-P3': 'ok', 'scan-P4': 'ok', 'scan-P5': 'ok', 'place-P6': null, 'scan-P6': null };

await v('ENT-8.11 : jalons du plan (bases fabriquées) — tout juste ✓ ; P5 confiée à son adresse d’origine → signale-P5 et charge ✗ ; P3 signalée à tort → place-P3 ✗ seul ; P2 non scannée → scan-P2 ✗ seul ; P3/P4 pas montées → place ✗ ; rien validé → attente', async () => {
  egal(await juger(etatJuste(T1)), OK_PLAN, 'tout juste');
  const origine = await juger(etatJuste(T1, { confiees: { P3: T1.P3, P4: T1.P4, P5: T1.P5 }, signalees: {}, nouvelles: {}, scan: { P1: T1.P1, P2: T1.P2, P3: T1.P3, P4: T1.P4, P5: T1.P5 } }));
  egal([origine['signale-P5'], origine.charge], ['ko', 'ko'], 'P5 confiée à son adresse d’origine');
  egal(Object.entries(origine).filter(([k, s]) => s === 'ko').map(([k]) => k), ['signale-P5', 'charge'], '… et rien d’autre de faux');
  const tort = await juger(etatJuste(T1, { signalees: { P5: { motif: 'charge', adresse: T1.P5 }, P3: { motif: 'charge', adresse: T1.P3 } } }));
  egal(Object.entries(tort).filter(([k, s]) => s === 'ko').map(([k]) => k), ['place-P3'], 'P3 signalée à tort (charge) : place-P3 seul');
  const sansScan = await juger(etatJuste(T1, { scan: { P1: T1.P1, P3: T1.P3, P4: T1.P4, P5: T1.P5n } }));
  egal(Object.entries(sansScan).filter(([k, s]) => s === 'ko').map(([k]) => k), ['scan-P2'], 'P2 rangée, non scannée : scan-P2 seul');
  const pasMontees = await juger(etatJuste(T1, { monteesValidation: [] }));
  egal(Object.entries(pasMontees).filter(([k, s]) => s === 'ko').map(([k]) => k), ['signale-P5', 'place-P3', 'place-P4'], 'palettes confiées pas montées à la validation');
  const rien = await juger({ enMain: null, posees: {}, confiees: {}, signalees: {}, nouvelles: {}, tentativesHaut: 0, valide: false, at: null, premierGeste: null });
  vrai(Object.entries(rien).every(([k, s]) => s === 'attente' || s === null), 'rien validé : tout à faire ' + JSON.stringify(rien));
  const haut = await juger(etatJuste(T1, { tentativesHaut: 2 }));
  egal(Object.entries(haut).filter(([k, s]) => s === 'ko').map(([k]) => k), ['pasPoseHaut'], 'tentative de pose en hauteur : pasPoseHaut seul (poids 0)');
  const conf = await juger(etatJuste(T1), { aisance: 'confirme' });
  egal([conf['place-P6'], conf['scan-P6']], ['ko', 'ko'], 'confirmé sans P6 rangée : bonus ✗ (sans effet sur la note)');
});

await v('ENT-8.11 : le message à Kevin — la demande est calculée sur ce que l’élève a CONFIÉ (même à une mauvaise adresse : une erreur ne se paie qu’une fois) ; la forme se juge sur la salutation et la politesse seules', async () => {
  const r = await pg.evaluate(async (T1) => {
    const S = await import('/contenus/action-ent811.js');
    const { preparerPhrases } = await import('/core/phrases.js');
    const etat = { enMain: null, posees: {}, confiees: { P3: T1.P3, P4: 'A1-T01-N2-E1' }, signalees: {}, nouvelles: {}, tentativesHaut: 0, valide: false };
    const db = { tirage: { graine: T1.graine }, entrepots: { 'action-ranger': etat }, mails: [] };
    const m = preparerPhrases({ phrases: S.phrasesKevin('Lea') }, db, 'g');
    const L = Object.fromEntries(m.phrases.lignes.map((l) => [l.id, l.choix[l.juste]]));
    const envoi = (choix) => ({ ...db, mails: [{ folder: 'in', phrases: m.phrases }, { folder: 'out', ts: 1, id: 1, phrases: { id: 'kevin', choix } }] });
    const forme = S.ETAPES.find((e) => e.id === 'kevin-forme');
    const juste = m.phrases.lignes.find((l) => l.id === 'demande').juste;
    return { L, demande: m.phrases.lignes.find((l) => l.id === 'demande').choix,
      formeOk: forme.verifier(envoi({ salutation: 0, demande: (juste + 1) % 3, politesse: 0, fin: 1 })).status,
      formeKo: forme.verifier(envoi({ salutation: 1, demande: juste, politesse: 0, fin: 0 })).status, rien: forme.verifier(db).status };
  }, T1);
  egal(r.L, { salutation: 'Bonjour Kevin,', demande: 'peux-tu monter P3 en A1-T01-N3-E1 et P4 en A1-T01-N2-E1 ?', politesse: 'Merci !', fin: 'Lea' }, 'les phrases justes');
  egal(r.demande.length, 3, 'trois choix pour la demande : ' + r.demande);
  egal([r.formeOk, r.formeKo, r.rien], ['ok', 'ko', 'attente'], 'la forme : salutation et politesse seules ; rien d’envoyé = à faire');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await v('ENT-8.11 : parcours juste à l’écran (témoin 1, standard) — 20 / 20 ; Kevin n’écrit qu’au geste « Faire monter » ; ses palettes ne montent qu’après la réponse ; questions aux bons gestes ; Samia commente le signalement', async () => {
  capturer = true; nouveau();
  await monter({ uid: 'ac811-juste', graine: T1.graine, sansOuverture: true });
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
  vrai(await present('.ent-nav[data-vue-fermee="entrepot"]'), 'le plan grisé au départ');
  const M0 = await entrants();
  egal(M0.map((m) => m.subject), ['Cet après-midi : le rangement'], 'le message d’accueil de Samia');
  vrai(/Te revoilà à Ensuès, après Labastide/.test(M0[0].text), 'le retour à Ensuès');
  await fiche();
  egal(await pg.$$eval(Q('[data-fiche-champ]'), (L) => L.every((s) => s.matches(':disabled'))), true, 'la fiche est figée après l’envoi');
  vrai(!!(await entrants()).find((m) => m.subject === 'Au rack !' && /une palette qui n’est pas montée ne compte pas comme rangée/.test(m.text)), 'Samia : au rack, et la règle de « Faire monter »');
  await allerV('entrepot');
  await capture('3-plan');
  egal(await pg.$$eval(`${P} .pe-bandeau [data-pe-pal]`, (L) => L.map((b) => b.dataset.pePal)), ['P1', 'P2', 'P3', 'P4', 'P5'], 'cinq palettes (standard : pas de P6)');
  vrai((await pg.textContent(`${P} .pe-bandeau [data-pe-pal="P5"]`)).replace(/\s+/g, ' ').includes('32 cartons · 425 kg'), 'P5 : 32 cartons × 12,5 + 25 = 425 kg');
  await ranger('P1', T1.P1, 'poser');
  egal(VUS, ['q-adresse'], 'q-adresse à la première pose');
  await scanner('P1', T1.P1);
  egal(VUS, ['q-adresse', 'q-sans-scan'], 'q-sans-scan au premier scan');
  await ranger('P2', T1.P2, 'poser');
  egal(VUS.slice(-1), ['q-plaque'], 'q-plaque à la pose de P2, lourde (lessive, 493 kg)');
  await scanner('P2', T1.P2);
  await ranger('P3', T1.P3, 'confier');
  egal(VUS.slice(-1), ['q-kevin'], 'q-kevin à la première palette confiée');
  await scanner('P3', T1.P3);
  await ranger('P4', T1.P4, 'confier'); await scanner('P4', T1.P4);
  egal((await entrants()).filter((m) => m.fromMail === 'kevin@geodis-ensues.example').length, 0, 'Kevin n’a pas écrit (rien n’est monté par le bouton)');
  await prendre('P5'); await ouvrir(T1.P5); await capture('3b-de-pres'); await prendre('P5');
  await signaler('P5', T1.P5, 'charge');
  const sig = (await entrants()).find((m) => m.subject === 'Ton signalement');
  egal(sig && sig.text, 'C’est noté. Suis ce que te dit le Terminal.\n\nSamia', 'Samia commente le signalement');
  vrai((await pg.textContent(`${P} [data-pal-etiq="P5"]`)).includes(T1.P5n), 'la carte de P5 porte sa nouvelle adresse');
  await ranger('P5', T1.P5n, 'confier'); await scanner('P5', T1.P5n);
  egal((await lisible()).montees, [], 'rien n’est monté avant le geste');
  egal((await entrants()).filter((m) => m.fromMail === 'kevin@geodis-ensues.example').length, 0, 'Kevin n’écrit pas avant « Faire monter »');
  await monterPalettes();
  const K = (await entrants()).find((m) => m.subject === 'Des palettes pour moi ?');
  vrai(!!K && /^Salut Lea ! Tu as des palettes pour moi \?/.test(K.text), 'Kevin écrit au geste « Faire monter »');
  egal((await lisible()).montees, [], 'les palettes attendent la réponse à Kevin');
  await ouvrirMail('Des palettes pour moi ?'); await capture('4-message-kevin'); await pg.click(Q('[data-repondre]'));
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  egal((await choixDe('demande')).sort(), [T1.demande, 'peux-tu monter P1 en A1-T01-N3-E1, P4 en B2-T03-N2-E3 et P5 en B1-T03-N2-E3 ?',
    'peux-tu monter P3 en A1-T01-N3-E2, P4 en B2-T03-N2-E3 et P5 en B1-T03-N2-E3 ?'].sort(), 'la demande calculée sur SES palettes confiées (+ une autre palette, une autre adresse)');
  await repondreKevin(PHR_JUSTES(T1), BONNES_Q, true);
  egal(VUS.slice(-1), ['q-materiel'], 'q-materiel à l’envoi du message à Kevin');
  vrai(!!(await entrants()).find((m) => m.subject === 'Je monte' && m.text.startsWith('OK, je monte ça tout de suite.')), 'Kevin répond');
  egal((await lisible()).montees.sort(), ['P3', 'P4', 'P5'], 'ses palettes montent après la réponse');
  await valider();
  egal(VUS.slice(-1), ['q-securite'], 'q-securite à « Valider »');
  egal(VUS.slice().sort(), Object.keys(BONNES_Q).sort(), 'les six questions, une fois chacune');
  egal(Object.keys(BONNES_Q).filter((id) => !VERDICTS[id]), ['q-plaque'], 'q-plaque corrigée au bilan, les autres tout de suite');
  vrai(!!(await entrants()).find((m) => m.subject === 'Demain matin' && /Demain matin, 6 h : inventaire tournant dans cette allée\./.test(m.text)), 'Samia : demain, 6 h');
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  egal(Object.keys(BONNES_Q).map((id) => n.detail[`question:${id}`]), Object.keys(BONNES_Q).map(() => 'ok'), 'questions notées');
  proche(n.score, 20, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  await pg.$eval(Q('[data-fin-seance]'), (e) => e.scrollIntoView({ block: 'start' })); await capture('6-bilan');
  capturer = false;
  const M = await entrants();
  egal(M.map((x) => x.subject), ['Cet après-midi : le rangement', 'Au rack !', 'Ton signalement', 'Des palettes pour moi ?', 'Je monte', 'Demain matin'], 'les messages, dans l’ordre');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun message ne dit juste / faux / correct / erreur / bonus / bien vu');
  vrai(M.every((x, i) => !i || x.ts >= M[i - 1].ts), 'heures croissantes');
  egal(new Date(M[0].ts).getDay(), 2, 'un mardi');
  const ecrit = [...M.map((x) => x.text), ...(await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent811.js'); return S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html({}) : d.html || '')); }))].join('\n');
  vrai(!/\b20\d\d\b/.test(ecrit.replace(/consulté le \d\d\/\d\d\/20\d\d/g, '')), 'une année dans un message ou un document');
  vrai(!/\b(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b/i.test(ecrit), 'un mois dans un message ou un document');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.11 : témoin 2, accompagné — 20 / 20 ; de près, la somme « déjà posé + ta palette » est faite ; après « Valider », une erreur montre l’adresse attendue', async () => {
  nouveau();
  await monter({ uid: 'ac811-acc', graine: T2.graine, aisance: 'accompagne' });
  await fiche();
  await allerV('entrepot');
  await prendre('P5'); await ouvrir(T2.P5);
  const somme = await pg.textContent(`${P} [data-pal-somme]`).catch(() => '');
  vrai(/Avec ta palette P5 : 850 \+ 493 = 1\s?343 kg/.test(somme.replace(/\s+/g, ' ')), 'accompagné : la somme est faite : ' + somme);
  await prendre('P5');   // la remet en réception
  await ranger5(T2);
  await monterPalettes();
  await repondreKevin(PHR_JUSTES(T2));
  await valider();
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  proche(n.score, 20, 'note');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.11 : standard — de près, la plaque et le « déjà posé », sans la somme', async () => {
  nouveau();
  await monter({ uid: 'ac811-std', graine: T2.graine });
  await fiche();
  await allerV('entrepot');
  await prendre('P5'); await ouvrir(T2.P5);
  egal([await present('.pal [data-pal-plaque]'), await present('.pal [data-pal-capteur]'), await present('.pal [data-pal-somme]')], [true, true, false], 'plaque, déjà posé, pas de somme');
  egal((await pg.textContent(`${P} [data-pal-deja]`)).replace(/\s/g, ''), '850', 'déjà posé : 850 kg (le stock du niveau du témoin)');
});

await v('ENT-8.11 : valider sans « Faire monter » → place-P3, place-P4 (et signale-P5) ✗ ; Kevin écrit alors à « Valider » (personne n’est bloqué) ; « Corriger » rouvre la fiche et le message, jamais le rangement', async () => {
  nouveau();
  await monter({ uid: 'ac811-pasmonte', graine: T1.graine });
  await fiche({ cote: 'emplacement', travee: 'travee', niveau: 'niveau' });
  await ranger5(T1);
  egal((await entrants()).filter((m) => m.fromMail === 'kevin@geodis-ensues.example').length, 0, 'Kevin n’a pas écrit');
  await valider();
  vrai(!!(await entrants()).find((m) => m.subject === 'Des palettes pour moi ?'), 'Kevin écrit à « Valider »');
  await repondreKevin(PHR_JUSTES(T1));
  egal((await lisible()).montees, [], 'rien ne monte après la validation');
  const n = await note();
  egal(jalonsFaux(n), ['adresse-cote', 'signale-P5', 'place-P3', 'place-P4'], 'jalons faux : la ligne 1 de la fiche, les palettes pas montées');
  const b = await fin();
  vrai(b && b.corriger, 'bouton « Corriger »');
  const C = await cases();
  egal(C.filter((c) => c[1] === 'ko' && c[3]).map((c) => c[3]), ['fiche:adresse'], 'seule la fiche se corrige parmi les cases fausses');
  await pg.click(Q('[data-fin-corriger]')); await pause();
  egal((await etatPlan()).valide, true, 'le rangement reste validé');
  await allerV('entrepot');
  egal(await pg.$$eval(`${P} .pe-bandeau [data-pe-pal]`, (L) => L.every((b) => b.disabled)), true, 'les cartes restent figées');
  vrai(await present('.pal [data-pal="valider"]') === false, 'plus de « Valider »');
  await allerV('fiche');
  vrai(await present('[data-fiche-champ="cote"]'), 'la fiche est rouverte');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.11 : inaction → 0 / 20 ; valider sans rien ranger → 0 (charge et pasPoseHaut non comptés : toutes les palettes ne sont pas traitées)', async () => {
  nouveau();
  await monter({ uid: 'ac811-rien', graine: T1.graine });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'rien fait : 0');
  await pg.evaluate(() => { window.__f.db.fiches = { adresse: { valeurs: {}, envoye: { at: 1 } } }; });   // le plan s'ouvre sans rien répondre
  await monter({ uid: 'ac811-rien', graine: T1.graine, db: await base() });
  await valider(FAUSSES_Q);
  const n = await note();
  egal([n.detail.charge, n.detail['place-P1'], n.detail['scan-P1']], ['ko', 'ko', 'ko'], 'charge non comptée, rien rangé ni scanné');
  proche(n.score, 0, 'note');
});

await v('ENT-8.11 : signaler P3 à tort à l’écran → place-P3 ✗, la note perd 1 point et rien d’autre ; le système ne donne pas d’autre adresse', async () => {
  nouveau();
  await monter({ uid: 'ac811-tort', graine: T1.graine });
  await fiche();
  await allerV('entrepot');
  await signaler('P3', T1.P3, 'charge');
  await ranger5(T1);
  await monterPalettes();
  await repondreKevin(PHR_JUSTES(T1));
  await valider();
  const n = await note();
  egal(jalonsFaux(n), ['place-P3'], 'seul place-P3 est faux');
  proche(n.score, 19, 'note');
});

await v('ENT-8.11 : confirmé — P6 présente (6 cartes, bandeau identique) ; la note du socle est 20 sans P6, P6 rangée ajoute le bonus', async () => {
  nouveau();
  await monter({ uid: 'ac811-conf', graine: T1.graine, aisance: 'confirme' });
  await fiche();
  await allerV('entrepot');
  egal(await pg.$$eval(`${P} .pe-bandeau [data-pe-pal]`, (L) => L.map((b) => b.dataset.pePal)), ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'], 'six cartes');
  egal(await pg.textContent(`${P} .pe-perso`).then((t) => t.includes('Range les palettes de la réception.')), true, 'consigne identique');
  await ranger5(T1);
  await monterPalettes();
  await repondreKevin(PHR_JUSTES(T1));
  await valider();
  const n = await note();
  egal(jalonsFaux(n), [], 'socle juste');
  proche(n.score, 20, 'note du socle sans P6');
  egal(n.detail.bonus && n.detail.bonus.etats, { 'place-P6': 'ko', 'scan-P6': 'ko' }, 'P6 non rangée : bonus ✗');
  nouveau();
  await monter({ uid: 'ac811-conf6', graine: T1.graine, aisance: 'confirme' });
  await fiche();
  await ranger5(T1, { p6: true });
  await monterPalettes();
  await repondreKevin({ ...PHR_JUSTES(T1), demande: 'peux-tu monter P3 en A1-T01-N3-E1, P4 en B2-T03-N2-E3, P5 en B1-T03-N2-E3 et P6 en A2-T01-N2-E2 ?' });
  await valider();
  const n6 = await note();
  egal(n6.detail.bonus && n6.detail.bonus.etats, { 'place-P6': 'ok', 'scan-P6': 'ok' }, 'P6 rangée et scannée : bonus ✓');
  proche(n6.score, 20, 'note plafonnée à 20');
  egal(n6.detail.bonus && [n6.detail.bonus.justes, n6.detail.bonus.total], [2, 2], 'deux cas bonus justes');
  egal(erreursF, [], 'erreurs JavaScript');
});

await F.fermer();
}
