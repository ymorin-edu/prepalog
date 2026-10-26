// Suite de tests de Prepalog — bloc « stellantis-13.1 » : Stellantis ENT-13.1, « une voiture par minute » (Terminale, la rentrée, guidage-rappel de C1.1).
// `node outils/test.mjs stellantis-13.1` ne lance que ce bloc. Brief : `docs/briefs/ENT-13.1-stellantis-une-voiture-par-minute.md` §4 à §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels, de vrais clics à la SOURIS (carte, flèches de l'ordre), les listes par `selectOption`.
// Les valeurs attendues sont ÉCRITES À LA MAIN (relues le 27/10/2026) :
//
//   Le voyage d'une pièce (8 étapes) : commande → camion → contrôle → rangement → sortie → robot → montage → expédition.
//   Voitures par heure : 60. 5008 du jour : voitures × part ÷ 100, à 3 % près (au moins 3 voitures) : 1 000 voitures à 30 % → 300 (297 à 303 acceptés, 330 refusé).
//   Peu de stock : « pas de place ». Pièce qui manque : « la ligne s'arrête ». Usine ou entrepôt : client-ligne, stock-heures et piece-montee → usine ; les trois autres → entrepôt.
//
// Barème (brief §5) : situer l'usine et le fournisseur 4 (région et département, 1 point chacun) · le voyage 5 · les chiffres 5 (1 + 2 + 1 + 1) · usine ou entrepôt 3 (6 × 0,5)
// · questions notées 3 (4 × 0,75) = 20.

import { ouvrirStellantis, proche } from './stellantis/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'stellantis-une-voiture-par-minute';
const ACT = '/activites/stellantis-une-voiture-par-minute.js';
const P = await ouvrirStellantis({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, texte, bandeau, entrants, menu, clic, noter, jouerCarte, ouvrirParMessage, ordonnerEnvoyer, aller } = P;

const OUV = { amont: 'fournisseurs', tendu: 'juste', stock: 'heures', quai: 'ligne', externe: 'confier', fournisseur: 'entreprise' };
const OUV_FAUX = { amont: 'clients', tendu: 'gros', stock: 'mois', quai: 'conso', externe: 'fermer', fournisseur: 'client' };
const QJ = { rougegoutte: 'jour', transstockeur: '6', 'un-km': 'cinq', externalisation: 'specialises', 'aval-2022': 'place' };
const QF = { rougegoutte: 'jamais', transstockeur: '1', 'un-km': 'pareil', externalisation: 'rien', 'aval-2022': 'vente' };
const JUSTE = ['commande', 'camion', 'controle', 'rangement', 'sortie', 'robot', 'montage', 'expedition'];
const UNE_INV = ['commande', 'controle', 'camion', 'rangement', 'sortie', 'robot', 'montage', 'expedition'];
const PHJ = { 'client-ligne': 'usine', 'client-conso': 'entrepot', 'stock-heures': 'usine', 'stock-semaines': 'entrepot', 'piece-montee': 'usine', 'colis-livre': 'entrepot' };
const UID = 'st131';
let Q = QJ;
const mont = (o = {}) => P.monter({ rep: OUV, uid: UID, ...o });
const fermerCartes = async () => { await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80); };
const qFil = (R = Q) => P.qFil(R);

async function envoyerVoyage(ordre = JUSTE) { await fermerCartes(); await ouvrirParMessage('Le voyage d’une pièce', 'fiche'); await ordonnerEnvoyer('voyage', ordre, Q); }
// `o` : { parheure, cinq ('juste' ou un nombre), stock, manque }
async function envoyerChiffres(o = {}) {
  await fermerCartes();
  await ouvrirParMessage('Les chiffres de l’usine', 'fiche:chiffres-131');
  const b = await base();
  const t = b.tirages[ID].valeurs;
  const cinq = o.cinq === undefined || o.cinq === 'juste' ? Math.round(t.voitures * t.part / 100) : o.cinq;
  await pg.fill(`${Z} [data-fiche-saisie="parheure"]`, String(o.parheure === undefined ? 60 : o.parheure)); await pause(30);
  await pg.fill(`${Z} [data-fiche-saisie="cinq"]`, String(cinq)); await pause(30);
  await pg.selectOption(`${Z} [data-fiche-champ="stock"]`, o.stock || 'place'); await pause(40); await qFil();
  await pg.selectOption(`${Z} [data-fiche-champ="manque"]`, o.manque || 'arret'); await pause(40); await qFil();
  await fermerCartes();
  await clic('[data-fiche-envoyer]'); await clic('[data-confirme-oui]'); await pause(); await qFil();
}
async function envoyerUsine(ph = PHJ) {
  await fermerCartes();
  await ouvrirParMessage('Usine ou entrepôt ?', 'fiche:usine-131');
  for (const [id, val] of Object.entries(ph)) { await pg.selectOption(`${Z} [data-fiche-champ="phrase_${id}"]`, val); await pause(30); await qFil(); }
  await fermerCartes();
  await clic('[data-fiche-envoyer]'); await clic('[data-confirme-oui]'); await pause(); await qFil();
}
async function jouer(o = {}) {
  Q = o.q || QJ;
  await jouerCarte(o.carte || {}, Q);
  await envoyerVoyage(o.voyage === undefined ? JUSTE : o.voyage);
  await envoyerChiffres(o.chiffres || {});
  await envoyerUsine(o.phrases || PHJ);
  await qFil();
}
// Le bandeau de fin regroupe : une ligne par groupe de jalons (la première), puis une ligne par question notée (la première).
const LIGNES = ['localiser:sochaux:region', 'voyage-ordre', 'voitures-par-heure', 'usine-client-ligne', 'question:rougegoutte'];
const tout = (etat) => LIGNES.map((l) => [l, etat]);

// ─────────────────────────────────────────────────────────── la déclaration et les données
await v('ENT-13.1 : la séance se charge (Tle, C1.1, guidage, correction, confirmé prévu) ; 17 de poids de jalons + part 3 des questions = 20 ; 4 questions notées, 1 réflexion ; inscrite au registre', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/stellantis-une-voiture-par-minute.js');
    const S = await import('/contenus/stellantis-ent131.js');
    const QQ = await import('/contenus/questions/ENT-13.1.js');
    const I = await import('/activites/index.js');
    const L = QQ.QUESTIONS.liste;
    const bonus = S.ETAPES.filter((e) => e.bonus).length;
    return { meta: A.meta, poids: S.ETAPES.filter((e) => !e.bonus).map((e) => [e.id, e.poids]), total: S.ETAPES.filter((e) => !e.bonus).reduce((s, e) => s + e.poids, 0), bonus, part: QQ.QUESTIONS.part,
      notees: L.filter((q) => q.type === 'fil' && !q.reflexion).map((q) => [q.id, q.poids]), reflexions: L.filter((q) => q.reflexion).map((q) => q.id),
      ouv: QQ.QUESTIONS.ouverture.tirage, auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'stellantis-une-voiture-par-minute'), entreprise: (I.ENTREPRISES.find((e) => e.n === 13) || {}).nom };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.correction, m.pret, m.ouverture, m.niveauxPrevus], ['ENT-13.1', ['tle'], ['C1.1'], 'guidage', 20, undefined, 'ENT-13.1', true, true, 'prof', ['confirme']], 'meta');
  egal(r.poids.map((p) => p[0]), ['localiser:sochaux:region', 'localiser:sochaux:departement', 'localiser:smrc:region', 'localiser:smrc:departement', 'voyage-ordre', 'voitures-par-heure', 'voitures-5008', 'peu-de-stock', 'piece-qui-manque',
    'usine-client-ligne', 'usine-client-conso', 'usine-stock-heures', 'usine-stock-semaines', 'usine-piece-montee', 'usine-colis-livre'], 'jalons');
  egal(r.poids.map((p) => p[1]), [1, 1, 1, 1, 5, 1, 2, 1, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], 'poids');
  proche(r.total, 17, 'somme des poids des jalons');
  proche(r.total + r.part, 20, 'jalons + part des questions');
  egal(r.bonus > 0, true, 'le lieu bonus du confirmé a ses jalons à part');
  egal(r.notees, [['rougegoutte', 1], ['transstockeur', 1], ['un-km', 1], ['externalisation', 1]], 'questions notées');
  egal(r.reflexions, ['aval-2022'], 'réflexion non notée');
  egal(r.ouv, { flux: 1, logistique: 1, eco: 1 }, 'ouverture tirée');
  egal([r.auRegistre, r.entreprise], [true, 'Stellantis'], 'registre');
});

await v('ENT-13.1 : le tirage — 300 graines, le voyage part toujours à au moins 2 inversions de l’ordre juste, voitures de 1 030 à 1 070, part de 28 à 32 %, six phrases bien mélangées', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/stellantis-ent131-donnees.js');
    let min = 99, bad = 0, vmin = 9999, vmax = 0, pmin = 99, pmax = 0; const O = new Set(), PH = new Set();
    for (let i = 0; i < 300; i++) {
      const t = D.TIRAGE.tirer(`u${i}|${D.ID}`).valeurs;
      min = Math.min(min, D.inversions(t.voyage, D.ORDRE_VOYAGE));
      if (t.voyage.length !== 8 || new Set(t.voyage).size !== 8 || t.phrases.length !== 6 || new Set(t.phrases).size !== 6) bad++;
      vmin = Math.min(vmin, t.voitures); vmax = Math.max(vmax, t.voitures); pmin = Math.min(pmin, t.part); pmax = Math.max(pmax, t.part);
      O.add(t.voyage.join()); PH.add(t.phrases.join());
    }
    return { min, bad, vmin, vmax, pmin, pmax, o: O.size, ph: PH.size };
  });
  vrai(r.min >= 2, 'un départ à moins de 2 inversions : ' + r.min);
  egal(r.bad, 0, 'permutations fautives');
  vrai(r.vmin >= 1030 && r.vmax <= 1070 && r.pmin >= 28 && r.pmax <= 32, `bornes : ${JSON.stringify(r)}`);
  vrai(r.o > 100 && r.ph > 50, `trop peu de variété : ${r.o} / ${r.ph}`);
});

await v('ENT-13.1 : le calcul des 5008 — 1 000 voitures à 30 % → 300 ; 297 à 309 acceptés (3 %), 310, 330 et 0 refusés ; au moins 3 voitures de marge sur une petite part ; non nombre refusé', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/stellantis-ent131-donnees.js');
    return [D.accepte5008(1000, 30, 300), D.accepte5008(1000, 30, 297), D.accepte5008(1000, 30, 303), D.accepte5008(1000, 30, 330), D.accepte5008(1000, 30, 0), D.accepte5008(1000, 30, 309), D.accepte5008(1000, 30, 310),
      D.accepte5008(100, 10, 13), D.accepte5008(100, 10, 14), D.accepte5008(1000, 30, NaN), D.accepte5008(1000, 30, null)];
  });
  egal(r, [true, true, true, false, false, true, false, true, false, false, false], 'acceptations');
});

// ─────────────────────────────────────────────────────────── l'ouverture
await v('ENT-13.1 : à l’ouverture — le tirage est rangé (graine élève|séance), un seul message de Karim (deux documents joints), la carte seule ouverte, un lundi de septembre 2027', async () => {
  const db = await mont();
  egal(db.tirages[ID].graine, `${UID}|${ID}`, 'graine');
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces]), [['Karim', 'Bienvenue à l’usine de Sochaux', ['sochaux-131', 'chaine-131']]], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate()], [2027, 8, 13], 'daté du lundi 13 septembre 2027');
  const M = await menu();
  vrai(M.includes('localiser') && !M.includes('fiche') && !M.includes('fiche:chiffres-131') && !M.includes('fiche:usine-131'), 'menu au départ : ' + M.join(', '));
  vrai(M.some((m) => m.startsWith('fermee:')), 'les fiches sont fermées : ' + M.join(', '));
});

await v('ENT-13.1 : Avant de commencer — 3 questions tirées (une de flux, une de logistique, une d’éco-droit), corrigées, jamais notées', async () => {
  const db = await P.monter({ uid: UID, sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 3, 'nombre');
  egal([ids.filter((x) => ['amont', 'tendu'].includes(x)).length, ids.filter((x) => ['stock', 'quai'].includes(x)).length, ids.filter((x) => ['externe', 'fournisseur'].includes(x)).length], [1, 1, 1], 'une par rubrique');
  for (let k = 0; k < 3; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await clic(`[data-q-choix="${OUV_FAUX[id]}"][data-q="${id}"]`);
    await clic(`[data-q-repondre="${id}"]`);
    await pause();
    if (k < 2) await clic('[data-cle="suivante"]');
  }
  await clic('[data-ouv-continuer]');
  const n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note après l’ouverture seule');
});

await v('ENT-13.1 : inaction — rien fait → 0/20, rien de jugé « juste », pas de bandeau de fin', async () => {
  await mont({ uid: 'st131-rien' });
  const n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
});

// ─────────────────────────────────────────────────────────── le parcours
await v('ENT-13.1 : parcours juste, ouverture toute fausse — 20/20, bandeau ✓, messages de Karim dans l’ordre, photo de fin rangée, réflexion non notée', async () => {
  await mont({ rep: OUV_FAUX });
  await jouer();
  const n = await noter(ACT);
  proche(n.score, 20, 'note');
  egal(await bandeau(), tout('ok'), 'bandeau');
  egal((await entrants()).map((m) => m.subject), ['Bienvenue à l’usine de Sochaux', 'Le voyage d’une pièce', 'Les chiffres de l’usine', 'Usine ou entrepôt ?', 'Merci pour cette matinée'], 'messages');
  const b = await base();
  vrai(!!b.points[ID], 'photo de fin rangée');
  vrai(!Object.keys(n.detail).some((k) => /aval-2022/.test(k)), 'la réflexion est notée');
});

await v('ENT-13.1 : pire cas — tout faux (région et département faux, voyage jamais touché, chiffres faux, phrases à l’envers, questions fausses) → 0/20, bandeau ✗, « Corriger » proposé', async () => {
  await mont();
  const inverse = Object.fromEntries(Object.entries(PHJ).map(([k, x]) => [k, x === 'usine' ? 'entrepot' : 'usine']));
  await jouer({ carte: { 'sochaux:region': 1, 'sochaux:departement': 1, 'smrc:region': 1, 'smrc:departement': 1 }, voyage: null,
    chiffres: { parheure: 1, cinq: 5, stock: 'ventes', manque: 'sans' }, phrases: inverse, q: QF });
  const n = await noter(ACT);
  egal(n.score, 0, 'note');
  egal(await bandeau(), tout('ko'), 'bandeau');
  vrai(await present('[data-fin-corriger]'), '« Corriger » proposé');
  vrai(/ne se rejouent pas/.test(await pg.textContent(`${Z} [data-fin-fige]`)), 'phrase `finFige`');
  Q = QJ;
});

// ─────────────────────────────────────────────────────────── la carte
await v('ENT-13.1 : carte juste = 4 points ; une erreur à la région de l’usine → −1 ; erreurs à la ville seulement → rien perdu ; texte de fin avec la position approchée', async () => {
  await mont();
  Q = QJ;
  await jouerCarte({}, Q);
  const d = (await noter(ACT)).detail;
  egal([d['localiser:sochaux:region'], d['localiser:sochaux:departement'], d['localiser:smrc:region'], d['localiser:smrc:departement']], ['ok', 'ok', 'ok', 'ok'], 'jalons de la carte (juste)');
  proche((await noter(ACT)).score, 4.75, 'note après la carte seule (4 + « rougegoutte » juste, 0,75)');
  const fin = await pg.textContent(`${P.R} [data-lc-fin]`);
  vrai(/Doubs/.test(fin) && /Rougegoutte/.test(fin) && /approchées/.test(fin), 'texte de fin de la carte : ' + fin);
  await mont();
  await jouer({ carte: { 'sochaux:region': 1 } });
  const d2 = (await noter(ACT)).detail;
  egal([d2['localiser:sochaux:region'], d2['localiser:sochaux:departement']], ['ko', 'ok'], 'jalons (région fausse)');
  proche((await noter(ACT)).score, 19, 'note');
  await mont();
  await jouer({ carte: { 'smrc:ville': 2, 'sochaux:ville': 1 } });
  proche((await noter(ACT)).score, 20, 'erreurs à la ville seulement');
});

await v('ENT-13.1 : le lieu bonus (Lure-Malbouhans) n’est que pour le confirmé et ne rapporte aucun point ; et ses points ne s’ajoutent pas au-delà de 20', async () => {
  await mont();
  Q = QJ;
  await jouerCarte({}, Q);
  const fin0 = await pg.textContent(`${P.R} [data-lc-fin]`);
  vrai(/Doubs/.test(fin0) && !/Lure-Malbouhans/.test(fin0), 'le lieu bonus apparaît en standard : ' + fin0);
  await mont({ aisance: 'confirme' });
  await jouerCarte({}, Q);
  const fin1 = await pg.textContent(`${P.R} [data-lc-fin]`);
  vrai(/Lure-Malbouhans/.test(fin1), 'texte de fin du confirmé : ' + fin1);
  await envoyerVoyage(); await envoyerChiffres(); await envoyerUsine(); await qFil();
  const conf = await noter(ACT);
  proche(conf.score, 20, 'note du confirmé (le lieu bonus ne rapporte rien)');
  egal((await base()).questions[ID]['aval-2022'].premiere, 'place', 'la réflexion du confirmé est rangée');
  await mont();
  await jouer();
  egal((await base()).questions[ID]['aval-2022'].premiere, 'place', 'la réflexion (non notée) est posée aussi au niveau standard, en fin de séance');
  egal((await noter(ACT)).score, 20, 'la réflexion ne rapporte ni ne coûte rien');
});

// ─────────────────────────────────────────────────────────── le voyage
await v('ENT-13.1 : voyage — ordre exact = 5 points ; une seule inversion ne rapporte rien (15) ; jamais touché = 0 et l’ordre envoyé est l’ordre de départ (inaction)', async () => {
  const essai = async (o) => { await mont(); await jouer(o); const n = await noter(ACT); return { d: n.detail, s: n.score }; };
  let r = await essai({});
  egal(r.d['voyage-ordre'], 'ok', 'ordre juste');
  r = await essai({ voyage: UNE_INV });
  egal(r.d['voyage-ordre'], 'ko', 'une inversion');
  proche(r.s, 15, 'note (une inversion)');
  r = await essai({ voyage: null });
  proche(r.s, 15, 'note (ordre jamais touché : rien ne récompense l’inaction)');
  const b = await base();
  egal(b.fiches['voyage-131'].valeurs.voyage, b.tirages[ID].valeurs.voyage, 'ordre envoyé = ordre de départ');
  vrai(b.tirages[ID].valeurs.voyage.join() !== JUSTE.join(), 'le départ est déjà juste');
});

await v('ENT-13.1 : chaque fiche reste fermée tant que la précédente n’est pas envoyée (voyage après la carte, chiffres après le voyage, usine après les chiffres)', async () => {
  await mont();
  await jouerCarte({}, QJ);
  let M = await menu();
  vrai(M.includes('fiche') && !M.includes('fiche:chiffres-131') && !M.includes('fiche:usine-131'), 'après la carte : ' + M.join(', '));
  Q = QJ;
  await envoyerVoyage();
  await fermerCartes();
  M = await menu();
  vrai(M.includes('fiche:chiffres-131') && !M.includes('fiche:usine-131'), 'après le voyage : ' + M.join(', '));
  await envoyerChiffres();
  await fermerCartes();
  M = await menu();
  vrai(M.includes('fiche:usine-131'), 'après les chiffres : ' + M.join(', '));
});

// ─────────────────────────────────────────────────────────── les chiffres
await v('ENT-13.1 : chiffres — chaque réponse fausse ne coûte que son jalon (voitures/heure −1, 5008 −2, stock −1, manque −1) ; l’arrondi de tête est accepté, 10 % d’écart refusé', async () => {
  const essai = async (chiffres) => { await mont(); await jouer({ chiffres }); const n = await noter(ACT); return { d: n.detail, s: n.score }; };
  let r = await essai({ parheure: 50 });
  egal(r.d['voitures-par-heure'], 'ko', 'voitures par heure'); proche(r.s, 19, 'note');
  r = await essai({ cinq: 1 });
  egal(r.d['voitures-5008'], 'ko', '5008'); proche(r.s, 18, 'note');
  const b = await base(); const t = b.tirages[ID].valeurs;
  r = await essai({ cinq: Math.round(t.voitures * t.part / 100 * 1.1) });
  egal(r.d['voitures-5008'], 'ko', '5008 à +10 %');
  r = await essai({ cinq: Math.round(t.voitures * t.part / 100) + 2 });
  egal(r.d['voitures-5008'], 'ok', '5008 à 2 voitures près'); proche(r.s, 20, 'note');
  r = await essai({ stock: 'fournisseurs' });
  egal(r.d['peu-de-stock'], 'ko', 'stock'); proche(r.s, 19, 'note');
  r = await essai({ manque: 'main' });
  egal(r.d['piece-qui-manque'], 'ko', 'manque'); proche(r.s, 19, 'note');
});

await v('ENT-13.1 : le nombre de 5008 se recalcule sur deux élèves (voitures et part tirées par élève) ; la phrase de la fiche cite SES nombres', async () => {
  for (const uid of ['st131-a', 'st131-b']) {
    await mont({ uid });
    await jouerCarte({}, QJ);
    Q = QJ;
    await envoyerVoyage();
    await fermerCartes();
    await ouvrirParMessage('Les chiffres de l’usine', 'fiche:chiffres-131');
    const t = (await base()).tirages[ID].valeurs;
    const ecran = await texte();
    vrai(ecran.replace(/\s/g, ' ').includes(`${t.part} % de 5008`), `la part de l’élève (${t.part} %) n’est pas à l’écran`);
    vrai(ecran.replace(/[\s  ]/g, '').includes(String(t.voitures)), `les voitures de l’élève (${t.voitures}) ne sont pas à l’écran`);
    await envoyerChiffres();
    egal((await noter(ACT)).detail['voitures-5008'], 'ok', `5008 juste pour ${uid}`);
  }
});

// ─────────────────────────────────────────────────────────── usine ou entrepôt
await v('ENT-13.1 : usine ou entrepôt — 0,5 point par phrase ; une phrase fausse → 19,5 ; les six à l’envers → 17 ; l’ordre des phrases est celui du tirage de l’élève', async () => {
  const essai = async (ph) => { await mont(); await jouer({ phrases: ph }); const n = await noter(ACT); return { d: n.detail, s: n.score }; };
  let r = await essai({ ...PHJ, 'stock-heures': 'entrepot' });
  egal(r.d['usine-stock-heures'], 'ko', 'phrase fausse'); proche(r.s, 19.5, 'note');
  const inverse = Object.fromEntries(Object.entries(PHJ).map(([k, x]) => [k, x === 'usine' ? 'entrepot' : 'usine']));
  r = await essai(inverse); proche(r.s, 17, 'note (six fausses)');
  vrai((await base()).tirages[ID].valeurs.phrases.length === 6, 'six phrases tirées');
});

// ─────────────────────────────────────────────────────────── les questions au fil
await v('ENT-13.1 : questions au fil — « rougegoutte » au département du fournisseur (corrigée tout de suite) ; « transstockeur » et « un-km » à l’envoi du voyage ; « externalisation » à l’envoi des chiffres, corrigée AU BILAN', async () => {
  await mont();
  Q = QJ;
  await aller('localiser');
  // les 6 premiers clics justes : région, département, ville de l'usine, bouton, région du fournisseur ; la question n'arrive qu'au département du fournisseur
  const seq = async (n) => { for (let i = 0; i < n; i++) { await P.carteJuste(); await pause(60); } };
  await seq(3);
  const b0 = await pg.$eval(`${P.R} [data-lc-bouton]`, (b) => b.dataset.lcBouton);
  await P.boutonCarte(b0);
  await seq(1);
  vrai(!(await present('[data-q-panneau]')), 'une question avant le département du fournisseur');
  await P.immobile();
  await P.carteJuste(); await pause(300);
  await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 2000 });
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'rougegoutte', 'question au département posé');
  await fermerCartes();
  await clic('[data-q-choix="jour"][data-q="rougegoutte"]'); await clic('[data-q-repondre="rougegoutte"]'); await pause();
  vrai(await present('[data-q-verdict]'), 'rougegoutte : verdict tout de suite');
  await clic('[data-q-reprendre]'); await pause();
  await P.carteJuste(); await qFil();
  const n1 = await pg.$eval(`${P.R} [data-lc-bouton]`, (b) => b.dataset.lcBouton);
  await P.boutonCarte(n1); await qFil();
  // le voyage
  await fermerCartes();
  await ouvrirParMessage('Le voyage d’une pièce', 'fiche');
  await clic('[data-fiche-envoyer]'); await clic('[data-confirme-oui]'); await pause(300);
  await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 2000 });
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'transstockeur', 'première question au voyage');
  await qFil();
  const b = await base();
  egal([b.questions[ID].transstockeur.premiere, b.questions[ID]['un-km'].premiere], ['6', 'cinq'], 'les deux questions du voyage sont rangées');
  // les chiffres : la question arrive à l'envoi, sans verdict avant le bilan
  await envoyerChiffres();
  const c = await base();
  egal(c.questions[ID].externalisation.premiere, 'specialises', 'externalisation rangée');
});

await v('ENT-13.1 : questions au fil — une fausse ôte 0,75 (→ 19,25) ; toutes fausses ôtent 3 (→ 17) ; la réflexion ne compte pas', async () => {
  // Niveau standard : un lieu bonus du confirmé pourrait compenser une perte (règle du moteur).
  const joue = async (RR) => { await mont(); await jouer({ q: { ...QJ, ...RR } }); const s = (await noter(ACT)).score; Q = QJ; return s; };
  proche(await joue({ rougegoutte: 'jamais' }), 19.25, 'rougegoutte faux');
  proche(await joue({ transstockeur: '1' }), 19.25, 'transstockeur faux');
  proche(await joue({ 'un-km': 'pareil' }), 19.25, 'un-km faux');
  proche(await joue({ externalisation: 'rien' }), 19.25, 'externalisation fausse');
  proche(await joue(QF), 17, 'toutes fausses (la réflexion ne compte pas)');
});

// ─────────────────────────────────────────────────────────── le corrigé et la fin
await v('ENT-13.1 : le fichier de corrigé est servi, dit le Doubs et Rougegoutte, les huit étapes et les réponses ; `corrigeEleve` rend le départ et les 5008 de l’élève', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-13.1.js');
    const D = await import('/contenus/stellantis-ent131-donnees.js');
    const e = C.corrigeEleve({}, 'st131');
    const t = D.TIRAGE.tirer('st131|' + D.ID).valeurs;
    return { n: C.CORRIGE.items.length, carte: C.CORRIGE.items[0].rep, voyage: C.CORRIGE.items[1].rep, chiffres: C.CORRIGE.items[2].reponses, status: (await fetch('/contenus/corriges/ENT-13.1.js')).status, eleve: e.items.map((x) => x.rep), t };
  });
  egal(r.status, 200, 'servi'); egal(r.n, 5, 'étapes');
  vrai(/Doubs/.test(r.carte) && /Rougegoutte/.test(r.carte) && /Territoire de Belfort/.test(r.carte), 'corrigé de la carte : ' + r.carte);
  vrai(r.voyage.startsWith('L’usine commande') && r.voyage.endsWith('par la route ou par le rail'), 'corrigé du voyage : ' + r.voyage);
  egal(r.chiffres.map((x) => x[1]).filter((x, i) => i !== 1), ['60', 'Il n’y a pas de place pour en garder : l’usine a deux fois moins de surface depuis 2022, et un stock coûte de l’argent', 'La ligne s’arrête : environ 1 200 personnes attendent'], 'réponses des chiffres');
  vrai(r.eleve[2].includes(`${r.t.voitures} voitures, dont ${r.t.part} %`), 'les 5008 de l’élève : ' + r.eleve[2]);
});

await v('ENT-13.1 : aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console, le mot « bonus » n’apparaît pas à l’écran', async () => {
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer?.();
}
