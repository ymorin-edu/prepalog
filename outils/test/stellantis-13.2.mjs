// Suite de tests de Prepalog — bloc « stellantis-13.2 » : Stellantis ENT-13.2, « les camions du matin » (Terminale, la rentrée, C1.3 et C1.4, entraînement).
// `node outils/test.mjs stellantis-13.2` ne lance que ce bloc. Brief : `docs/briefs/ENT-13.2-stellantis-camions-du-matin.md` §4 à §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels, de vrais clics à la SOURIS. La matinée est la même pour tous.
// Valeurs ÉCRITES À LA MAIN (jamais recalculées par le code) :
//   Cinq quais : 1 à 4 (semi-remorques et porteurs), 5 (porteurs seulement). Le quai 2 est pris par un camion de la nuit de 5 h 30 à 6 h 30. Grille : 5 h 30 = créneau 0, 5 h 45 = 1, 6 h = 2,
//   6 h 15 = 3, 6 h 30 = 4, 7 h 30 = 8, 8 h = 10, 9 h = 14 (un créneau = 15 min).
//   Les huit camions (arrivée, palettes à 5 min, durée arrondie au quart d'heure, couverture à la ligne) : Sièges semi 5 h 45, 16 pal → 80 min → 6 créneaux, 3 h 10 · Planches de bord semi
//   5 h 45, 12 pal → 60 min → 4, 2 h 30 (URGENT) · Roues semi 6 h, 14 pal → 70 min → 5, 4 h · Rétroviseurs porteur 6 h, 8 pal → 40 min → 3, 5 h · Faisceaux semi 6 h 15, 6 pal → 30 min → 2,
//   1 h 40 (URGENT ; annonce 45 minutes d'avance : 5 h 30) · Moquettes porteur 7 h 30, 6 pal → 2, 6 h 20 · Batteries semi 8 h, 20 pal → 100 min → 7, 4 h 30 · Joints porteur 9 h, 10 pal → 50 min → 4, 7 h.
//   Seuil d'urgence : moins de 3 h de couverture. Une solution juste, avant l'avance : Sièges quai 1 à 5 h 45 · Planches quai 3 à 5 h 45 · Roues quai 2 à 6 h 30 · Rétroviseurs quai 5 à 6 h ·
//   Faisceaux quai 4 à 6 h 15 · Moquettes quai 5 à 7 h 30 · Batteries quai 1 à 8 h · Joints quai 3 à 9 h. Après l'avance : seuls les faisceaux bougent, quai 4 à 5 h 30.
//   Le camion de faisceaux : BL 100 cartons (P1 24, P2 16, P3 36, P4 24) ; reçus 94 (P2 : couche du dessus incomplète mais conforme au BL 16 ; P4 : 6 cartons manquants) ; 3 cartons écrasés sur P3 ;
//   utilisables 91 ; la ligne en prend 1 par minute : 1 h 31.
//
// Barème : arrivée 1 · chevauchement 2 · quai adapté 1 · priorité 3 · replanification 2 · décisions 4 (0,75 × 4 + comptage 0,25 × 4) · réserves 2 (1 + 1) · déballage 0,5 · signature 0,5 ·
// message 1 (0,5 + 0,5) · questions notées 3 (4 × 0,75) = 20.

import { ouvrirStellantis, proche } from './stellantis/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'stellantis-camions-du-matin';
const PL = 'st-planning-132';
const QID = 'st-quai-132';
const ACT = '/activites/stellantis-camions-du-matin.js';
const P = await ouvrirStellantis({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, texte, entrants, menu, clic, allerV, sansToast, confirmer, noter } = P;

const qFil = async (R) => {
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
const fermerCartes = async () => { await pg.evaluate(() => document.querySelectorAll('[aria-label="Fermer la notification"]').forEach((b) => b.click())); await pause(80); };

const OUV = { bl: 'envoye', reserve: 'ecrit', precise: 'precis', couverture: '4', 'couv-min': '30', delai: '3j', voiturier: 'transporteur' };
const RJ = { priorite: 'faisceaux', quai5: 'hauteur', 'reserve-vague': 'oui', protestation: 'lettre' };
const RF = { priorite: 'sieges', quai5: 'loin', 'reserve-vague': 'non-signe', protestation: 'plus' };
let R = RJ;
const mont = (o = {}) => P.monter({ rep: OUV, uid: 'st132', ...o });
const detail = async () => (await noter(ACT)).detail;

// Le planning juste avant l'avance (écrit à la main) : { camion: [quai, créneau] }.
const V1 = { sieges: ['q1', 1], planches: ['q3', 1], roues: ['q2', 4], retros: ['q5', 2], faisceaux: ['q4', 3], moquettes: ['q5', 8], batteries: ['q1', 10], joints: ['q3', 14] };
const V2 = { faisceaux: ['q4', 0] };

async function poser(id, quai, t) {
  await fermerCartes();
  await pg.click(`${Z} [data-pl-id="${id}"][data-pl-vue="b"]`);
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${quai}"][data-t="${t}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  await pause(40);
  await qFil(R);
}
async function envoyerPlanning() {
  await fermerCartes();
  await sansToast(); await pg.click(`${Z} [data-pl="envoyer"]`);
  await pause(60);
  if (await present('[data-pl="quandMeme"]')) await pg.click(`${Z} [data-pl="quandMeme"]`);
  await confirmer();
  await pause(150);
}
async function planning(v1 = V1, v2 = V2) {
  await allerV('planning');
  for (const [id, [q, t]] of Object.entries(v1)) await poser(id, q, t);
  await envoyerPlanning();
  await qFil(R);
  if (v2 === null) return;
  await allerV('planning');
  for (const [id, [q, t]] of Object.entries(v2)) await poser(id, q, t);
  await envoyerPlanning();
  await qFil(R);
}
const PAL = { P1: [24, 'accepter'], P2: [16, 'accepter'], P3: [36, 'reserves', 'avarie'], P4: [18, 'reserves', 'manquant'] };
const RES = { P3: '3', P4: '6' };
async function quai(o = {}) {
  await fermerCartes();
  await allerV('quai');
  await pg.click(`${Z} [data-q="decharger"]`);
  await pause(200);
  await pg.waitForSelector(`${Z} [data-q="vers3"]:not([disabled])`);
  await pg.click(`${Z} [data-q="vers3"]`); await pause();
  const pal = Object.assign({}, PAL, o.pal || {}), res = Object.assign({}, RES, o.res || {});
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
  await qFil(R);
  await pg.click(`${Z} [data-q="signer"]`); await pause();
  await qFil(R);
  if (!o.sansClore) { await pg.click(`${Z} [data-q="clore"]`); await pg.click(`${Z} [data-q="clore"]`).catch(() => {}); await pause(); }
  await qFil(R);
}
const MESSAGE = { recu: 'J’ai reçu 94 cartons de faisceaux sur les 100 annoncés au bon de livraison.', couverture: 'Avec les 91 cartons utilisables, la ligne tient encore 1 h 31.' };
async function message(lignes = MESSAGE) {
  await P.phrases('Où en est la ligne ?', lignes);
  await qFil(R);
}
async function jouer(o = {}) {
  await planning(o.v1 || V1, o.v2 === undefined ? V2 : o.v2);
  await quai(o.quai);
  await message(o.message);
}

// ─────────────────────────────────────────────────────────── la déclaration et les données
await v('ENT-13.2 : la séance se charge (Tle, C1.3 et C1.4, entraînement) ; poids jalon par jalon (17 + part des questions 3 = 20) ; 4 questions notées de 1 ; ouverture 3 tirées parmi 7 ; au registre', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/stellantis-camions-du-matin.js');
    const C = await import('/contenus/stellantis-ent132.js');
    const Q = await import('/contenus/questions/ENT-13.2.js');
    const I = await import('/activites/index.js');
    const L = Q.QUESTIONS.liste;
    return { meta: A.meta, poids: C.ETAPES.map((e) => [e.id, e.poids]), part: Q.QUESTIONS.part,
      notees: L.filter((q) => q.type === 'fil' && !q.reflexion).map((q) => [q.id, q.poids || 1]), reflexions: L.filter((q) => q.reflexion).map((q) => q.id),
      ouv: Q.QUESTIONS.ouverture.tirage, rubriques: L.filter((q) => q.type === 'ouverture').map((q) => q.rubrique),
      auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'stellantis-camions-du-matin') };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture], ['ENT-13.2', ['tle'], ['C1.3', 'C1.4'], 'entrainement', 20, undefined, 'ENT-13.2', true, 'prof'], 'meta');
  egal(r.poids, [['v1-poses', 1], ['v1-chevauche', 2], ['v1-adapte', 1], ['v1-priorite', 3], ['v2-replanifier', 2],
    ['P1-decision', 0.75], ['P1-comptage', 0.25], ['P2-decision', 0.75], ['P2-comptage', 0.25], ['P3-decision', 0.75], ['P3-comptage', 0.25], ['P4-decision', 0.75], ['P4-comptage', 0.25],
    ['P3-reserve', 1], ['P4-reserve', 1], ['deballage', 0.5], ['signature', 0.5], ['message-recu', 0.5], ['message-couverture', 0.5]], 'jalons et poids');
  proche(r.poids.reduce((s, x) => s + x[1], 0) + r.part, 20, 'jalons + part des questions');
  egal(r.notees, [['priorite', 1], ['quai5', 1], ['reserve-vague', 1], ['protestation', 1]], 'questions notées');
  proche(r.notees.reduce((s, x) => s + x[1], 0), 4, 'quatre questions de poids 1 (0,75 chacune pour une part de 3)');
  egal(r.reflexions, [], 'aucune réflexion : le texte de L133-3 est celui d’Action, relu le 17/10/2026');
  egal(r.ouv, { reception: 1, stock: 1, droit: 1 }, 'ouverture tirée');
  egal(r.rubriques.sort(), ['droit', 'droit', 'reception', 'reception', 'reception', 'stock', 'stock'], 'banque d’ouverture');
  vrai(r.auRegistre, 'la séance est au registre');
});

await v('ENT-13.2 : les données — la solution écrite à la main est juste ; seuls deux camions sont urgents (couverture < 3 h) ; l’ordre d’arrivée laisse les faisceaux sans quai à 6 h 15 ; le même planning après l’avance les fait commencer trop tard ; semi au quai 5, chevauchement et créneau de la nuit repérés', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/stellantis-ent132-donnees.js');
    const place = (o) => Object.fromEntries(Object.entries(o).map(([k, [r, s]]) => [k, { r, s }]));
    const v1 = place({ sieges: ['q1', 1], planches: ['q3', 1], roues: ['q2', 4], retros: ['q5', 2], faisceaux: ['q4', 3], moquettes: ['q5', 8], batteries: ['q1', 10], joints: ['q3', 14] });
    const v2 = { ...v1, faisceaux: { r: 'q4', s: 0 } };
    const arrivee = place({ sieges: ['q1', 1], planches: ['q3', 1], roues: ['q4', 2], retros: ['q5', 2], moquettes: ['q5', 8], batteries: ['q1', 10], joints: ['q3', 14] });
    const sansQuai = ['q1', 'q2', 'q3', 'q4', 'q5'].map((q) => D.chevauchements({ ...arrivee, faisceaux: { r: q, s: 3 } }).length + D.malPlaces({ ...arrivee, faisceaux: { r: q, s: 3 } }).length);
    return {
      ok1: [D.toutesPosees(v1), D.tropTot(v1, 1), D.malPlaces(v1), D.chevauchements(v1), D.urgentsEnRetard(v1, 1)],
      ok2: [D.tropTot(v2, 2), D.chevauchements(v2), D.urgentsEnRetard(v2, 2)],
      reprise: D.urgentsEnRetard(v1, 2),
      urgents: D.URGENTS,
      sansQuai,
      semi: D.malPlaces({ ...v1, sieges: { r: 'q5', s: 1 } }),
      chev: D.chevauchements({ ...v1, batteries: { r: 'q1', s: 5 } }),
      nuit: D.chevauchements({ ...v1, roues: { r: 'q2', s: 2 } }),
      long: D.CAMIONS.map((c) => D.longueur(c)),
      couv: D.CAMIONS.map((c) => c.couv),
      avant: D.ARRIVEE_AVANT,
    };
  });
  egal(r.ok1, [true, [], [], [], []], 'solution juste avant l’avance');
  egal(r.ok2, [[], [], []], 'solution juste après l’avance');
  egal(r.reprise, ['faisceaux'], 'le planning d’avant renvoyé après l’avance : les faisceaux commencent après leur arrivée');
  egal(r.urgents, ['planches', 'faisceaux'], 'camions urgents');
  egal(r.sansQuai.map((n) => n > 0), [true, true, true, true, true], 'rangés dans l’ordre d’arrivée, les faisceaux n’ont aucun quai à 6 h 15');
  egal(r.semi, ['sieges'], 'une semi au quai 5');
  egal(r.chev, [['sieges', 'batteries']], 'un chevauchement');
  egal(r.nuit, [['roues', 'nuit']], 'le créneau de la nuit');
  egal(r.long, [6, 4, 5, 3, 2, 2, 7, 4], 'longueurs en créneaux');
  egal(r.couv, [190, 150, 240, 300, 100, 380, 270, 420], 'couvertures en minutes');
  egal(r.avant, '05:30', 'arrivée des faisceaux après l’avance');
});

await v('ENT-13.2 : le camion de faisceaux — 100 cartons annoncés, 94 reçus, 6 manquants, 3 écrasés, 91 utilisables, couverture 1 h 31 ; la ligne juste est celle du calcul, les autres ne le sont pas', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/stellantis-ent132-donnees.js');
    const Qm = await import('/core/types/quai.js');
    return { totaux: [D.BL_TOTAL, D.RECU, D.MANQUANTS, D.ECRASES, D.UTILISABLES], couv: D.duree(D.couvertureDe(D.UTILISABLES)),
      lignes: D.PHRASES.lignes.map((l) => [l.id, l.choix ? l.choix.length : 0, l.juste]), erreurs: Qm.verifierQuai(D.QUAI),
      pal: D.PALETTES.map((p) => [p.id, p.bl, p.W * p.D * p.L - p.manque.length, p.manque.length, Object.keys(p.avarie).length, p.attendu]) };
  });
  egal(r.totaux, [100, 94, 6, 3, 91], 'totaux');
  egal(r.couv, '1 h 31', 'couverture');
  egal(r.lignes, [['salutation', 0, undefined], ['recu', 3, 0], ['couverture', 4, 0], ['fin', 0, undefined]], 'lignes du message');
  egal(r.erreurs, [], 'le quai est valide');
  egal(r.pal, [['P1', 24, 24, 0, 0, 'accepter'], ['P2', 16, 16, 2, 0, 'accepter'], ['P3', 36, 36, 0, 3, 'reserves'], ['P4', 24, 18, 6, 0, 'reserves']], 'palettes');
});

// ─────────────────────────────────────────────────────────── à l'écran
await v('ENT-13.2 : au départ — un message de Karim ; Planning au menu, Quai fermé ; pas de « Vérifier mon planning » ; l’avance puis le quai arrivent après les envois', async () => {
  await mont();
  const m0 = await entrants();
  egal(m0.map((m) => m.subject), ['Les camions du matin'], 'message de départ');
  vrai(m0[0].text.includes('Huit camions'), 'Karim parle des huit camions');
  const mn = await menu();
  vrai(mn.includes('planning'), 'Planning au menu : ' + mn.join(','));
  vrai(mn.includes('fermee:quai'), 'Quai fermé tant que le planning n’est pas refait : ' + mn.join(','));
  await allerV('planning');
  vrai(!(await present('[data-pl="verifier"]')), 'aucune aide « Vérifier »');
  const t = await texte();
  vrai(t.includes('Couverture à la ligne'), 'la couverture est sur la carte');
  vrai(t.includes('urgent'), 'le mot urgent est dit');
  for (const [id, [q, s]] of Object.entries(V1)) await poser(id, q, s);
  await envoyerPlanning(); await qFil(R);
  egal((await entrants()).map((m) => m.subject), ['Les camions du matin', 'Le camion de faisceaux arrive en avance'], 'l’avance arrive après le 1er planning');
  vrai((await menu()).includes('fermee:quai'), 'quai encore fermé');
  await allerV('planning');
  for (const [id, [q, s]] of Object.entries(V2)) await poser(id, q, s);
  await envoyerPlanning(); await qFil(R);
  egal((await entrants()).map((m) => m.subject), ['Les camions du matin', 'Le camion de faisceaux arrive en avance', 'Le camion de faisceaux est à quai'], 'le quai arrive après le planning refait');
  vrai((await menu()).includes('quai'), 'quai ouvert');
  await quai();
  const e = await entrants();
  vrai(e.some((m) => m.subject === 'Où en est la ligne ?' && m.phrases), 'Karim demande le message par phrases après la signature');
  await message();
  vrai((await entrants()).some((m) => m.subject === 'Merci pour ce matin'), 'Karim remercie');
});

await v('ENT-13.2 : parcours juste = 20/20, tous les jalons justes ; rien ne dit juste ou faux pendant le travail', async () => {
  await mont();
  await jouer();
  const n = await noter(ACT);
  proche(n.score, 20, 'parcours juste');
  const d = n.detail;
  for (const [id, e] of Object.entries(d)) if (/^(v\d-|P\d-|deballage|signature|message-|question:)/.test(id)) egal(e, 'ok', `jalon ${id}`);
});

await v('ENT-13.2 : servir dans l’ordre d’arrivée (les faisceaux à 6 h 30, après le créneau pris) — la priorité tombe (−3), le reste tient ; le même planning refait correctement après l’avance', async () => {
  await mont();
  await jouer({ v1: { ...V1, roues: ['q4', 2], faisceaux: ['q2', 4] } });
  const n = await noter(ACT), d = n.detail;
  egal(d['v1-priorite'], 'ko', 'priorité');
  egal(['v1-poses', 'v1-chevauche', 'v1-adapte', 'v2-replanifier'].map((k) => d[k]), ['ok', 'ok', 'ok', 'ok'], 'le reste du planning');
  proche(n.score, 17, 'score');
});

await v('ENT-13.2 : une semi-remorque au quai 5 — « quai adapté » tombe, et la reprise avec elle aussi ; le quai 5 est refusé aux semi-remorques', async () => {
  await mont();
  await jouer({ v1: { ...V1, planches: ['q5', 1], retros: ['q3', 2] } });
  const n = await noter(ACT), d = n.detail;
  egal([d['v1-adapte'], d['v2-replanifier'], d['v1-chevauche'], d['v1-poses'], d['v1-priorite']], ['ko', 'ko', 'ok', 'ok', 'ok'], 'jalons');
  proche(n.score, 17, 'score (−1 quai adapté, −2 reprise)');
});

await v('ENT-13.2 : reprise identique après l’avance — la replanification ne rapporte rien (−2), tout le reste est juste', async () => {
  await mont();
  await jouer({ v2: {} });
  const n = await noter(ACT), d = n.detail;
  egal(d['v2-replanifier'], 'ko', 'reprise identique');
  egal(d['v1-priorite'], 'ok', 'priorité du 1er envoi');
  proche(n.score, 18, 'score');
});

await v('ENT-13.2 : palette écrasée acceptée sans réserve — décision (−0,75) et réserve (−1) fausses, le comptage reste juste', async () => {
  await mont();
  await jouer({ quai: { pal: { P3: [36, 'accepter'] }, res: { P3: null } } });
  const n = await noter(ACT), d = n.detail;
  egal([d['P3-decision'], d['P3-comptage'], d['P3-reserve'], d['P4-reserve']], ['ko', 'ok', 'ko', 'ok'], 'P3');
  proche(n.score, 18.25, 'score');
});

await v('ENT-13.2 : réserve imprécise (P3 : « 1 carton » au lieu de 3) et « sous réserve de déballage » cochée — réserve (−1) et déballage (−0,5) faux, les décisions restent justes', async () => {
  await mont();
  await jouer({ quai: { res: { P3: '1' }, deballage: true } });
  const n = await noter(ACT), d = n.detail;
  egal([d['P3-reserve'], d['deballage'], d['P3-decision'], d['P4-reserve'], d['signature']], ['ko', 'ko', 'ok', 'ok', 'ok'], 'jalons');
  proche(n.score, 18.5, 'score');
});

await v('ENT-13.2 : message à Karim — « rien à signaler » et « la ligne ne manquera de rien » : −1 ; la couverture du bon de livraison seule : −0,5', async () => {
  await mont();
  await jouer({ message: { recu: 'Le camion est conforme, rien à signaler.', couverture: 'La ligne ne manquera de rien ce matin.' } });
  let n = await noter(ACT);
  egal([n.detail['message-recu'], n.detail['message-couverture']], ['ko', 'ko'], 'message faux');
  proche(n.score, 19, 'score');
  await mont();
  await jouer({ message: { recu: MESSAGE.recu, couverture: 'Avec les 100 cartons du bon de livraison, la ligne tient encore 1 h 40.' } });
  n = await noter(ACT);
  egal([n.detail['message-recu'], n.detail['message-couverture']], ['ok', 'ko'], 'couverture du BL');
  proche(n.score, 19.5, 'score');
});

await v('ENT-13.2 : les quatre questions au fil, toutes fausses : −3 (0,75 chacune), le travail reste juste', async () => {
  R = RF;
  await mont();
  await jouer();
  R = RJ;
  const n = await noter(ACT), d = n.detail;
  egal(['priorite', 'quai5', 'reserve-vague', 'protestation'].map((q) => d[`question:${q}`]), ['ko', 'ko', 'ko', 'ko'], 'questions');
  egal(['v1-priorite', 'P3-reserve', 'signature'].map((k) => d[k]), ['ok', 'ok', 'ok'], 'le travail');
  proche(n.score, 17, 'score');
});

await v('ENT-13.2 : l’inaction ne rapporte rien — séance ouverte, rien fait : 0/20', async () => {
  await mont();
  const n = await noter(ACT);
  proche(n.score, 0, 'rien fait');
});

await v('ENT-13.2 : les questions au fil se posent à leur geste — priorité quand les faisceaux sont posés, quai 5 à l’envoi du premier planning, réserve vague quand le BL est écrit, protestation quand il est signé', async () => {
  await mont();
  await allerV('planning');
  await fermerCartes();
  await pg.click(`${Z} [data-pl-id="faisceaux"][data-pl-vue="b"]`);
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="q4"][data-t="3"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  await pg.waitForSelector(`${Z} [data-q-panneau="priorite"]`);
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'priorite', 'la priorité à la pose des faisceaux');
  await qFil(R);
  for (const [id, [q, s]] of Object.entries(V1)) if (id !== 'faisceaux') await poser(id, q, s);
  await envoyerPlanning();
  await pg.waitForSelector(`${Z} [data-q-panneau="quai5"]`);
  await qFil(R);
  const db = await base();
  egal(['priorite', 'quai5', 'reserve-vague', 'protestation'].map((q) => !!(db.questions[ID][q] && db.questions[ID][q].premiere)), [true, true, false, false], 'les deux premières seulement');
});

}
