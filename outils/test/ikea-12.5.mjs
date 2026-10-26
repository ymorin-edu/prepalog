// Suite de tests de Prepalog — bloc « ikea-12.5 » : IKEA ENT-12.5, « les quais du mardi » (2de, poste C logistique, découverte de C1.3, guidage).
// `node outils/test.mjs ikea-12.5` ne lance que ce bloc. Brief : `docs/briefs/ENT-12.5-ikea-les-quais-du-mardi.md` §4 à §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels, de vrais clics à la SOURIS (cartes et cases de la grille). Le planning est le même pour tous.
// Les valeurs attendues sont ÉCRITES À LA MAIN (relues le 26/10/2026) :
//
//   Six quais : 21 à 25 (semi-remorques et porteurs), 26 (porteurs seulement). Le quai 22 est pris par un camion de la veille de 6 h à 7 h. Grille : 6 h = créneau 0, 6 h 15 = 1, 6 h 30 = 2, 7 h = 4,
//   7 h 30 = 6, 8 h = 8, 9 h = 12, 9 h 30 = 14, 9 h 45 = 15 (un créneau = 15 min).
//   Les sept camions (arrivée, palettes, durée à 2 min la palette, arrondie au quart d'heure) : Navette 1 semi 6 h, 26 pal → 52 min → 1 h · Fournisseur A porteur 6 h 15, 12 pal → 24 → 30 min ·
//   Navette 2 semi 6 h 30, 28 pal → 56 → 1 h · Fournisseur B semi 7 h, 24 pal → 48 → 1 h · Fournisseur C porteur 7 h 30, 18 pal → 36 → 45 min · Allemagne semi 8 h, 30 pal → 60 → 1 h
//   (annonce 1 h 30 de retard : 9 h 30) · caisse mobile vide porteur 9 h, 30 min.
//   Une solution juste, avant le retard : Navette 1 quai 21 à 6 h · Fournisseur A quai 26 à 6 h 15 · Navette 2 quai 23 à 6 h 30 · Fournisseur B quai 24 à 7 h · Fournisseur C quai 26 à 7 h 30 ·
//   Allemagne quai 21 à 8 h · caisse mobile quai 22 à 9 h. Après le retard : seule l'Allemagne bouge, quai 21 à 9 h 30.
//
// Barème : camions posés et jamais avant leur arrivée 3 · aucun chevauchement 4 · quai adapté 3 · planning refait après le retard 4 · message à Samir 2 · questions notées 4 (1,5 + 1,5 + 1) = 20.

import { ouvrirIkea, proche } from './ikea/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'ikea-quais-du-mardi';
const PL = 'ik-planning-125';
const FICHE = 'samir-125';
const ACT = '/activites/ikea-quais-du-mardi.js';
const P = await ouvrirIkea({ nav, BASE, vrai, activite: ACT, id: ID });
const { pg, Z, pause, base, present, texte, entrants, menu, clic, allerV, sansToast, confirmer, noter } = P;

// Plusieurs questions peuvent se suivre : on ferme les cartes « Nouveau message » (elles couvrent les boutons), on répond, on reprend.
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

const OUV = { quai: 'camion', rdv: 'creneau', duree: 'juste', semi: 'tracteur', attente: 'travail', pause: 'libre' };
const OUV_FAUX = { quai: 'bureau', rdv: 'depart', duree: 'moitie', semi: 'petit', attente: 'repos', pause: 'travail' };
const RJ = { 'pourquoi-rdv': 'attente', 'semi-quai-26': 'hauteur', 'quai-pris': 'heure', 'attente-chauffeur': 'travail' };
const RF = { 'pourquoi-rdv': 'loi', 'semi-quai-26': 'ferme', 'quai-pris': 'demi', 'attente-chauffeur': 'rien' };
let R = RJ;
const mont = (o = {}) => P.monter({ rep: OUV, uid: 'ik125', ...o });
const JALONS = ['v1-poses', 'v1-chevauche', 'v1-adapte', 'v2-replanifier', 'message'];
const detail = async () => (await noter(ACT)).detail;

// Le planning juste avant le retard (écrit à la main) : { camion: [quai, créneau] }.
const V1 = { nav1: ['q21', 0], f1: ['q26', 1], nav2: ['q23', 2], f2: ['q24', 4], f3: ['q26', 6], allemagne: ['q21', 8], caisse: ['q22', 12] };
const V2 = { allemagne: ['q21', 14] };            // seul le camion d'Allemagne bouge

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
  if (await present('[data-pl="quandMeme"]')) await pg.click(`${Z} [data-pl="quandMeme"]`);       // « Il reste des problèmes » : on envoie quand même
  await confirmer();
  await pause(150);
}
// Le premier planning, puis (si `v2` ≠ null) le planning refait avec les camions de `v2` déplacés ; `v2 === undefined` : V2 par défaut.
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
async function messageSamir({ quai = 'q21', heure = '09:30' } = {}) {
  await fermerCartes();
  await allerV('fiche');
  if (quai) { await pg.selectOption(`${Z} [data-fiche-champ="quai"]`, quai); await pause(30); }
  if (heure) { await pg.selectOption(`${Z} [data-fiche-champ="heure"]`, heure); await pause(30); }
  await sansToast(); await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil(R);
}
async function jouer(o = {}) {
  await planning(o.v1 || V1, o.v2 === undefined ? V2 : o.v2);
  await messageSamir(o.message);
}

// ─────────────────────────────────────────────────────────── la déclaration et les données
await v('ENT-12.5 : la séance se charge (2de, C1.3, guidage) ; poids 3 + 4 + 3 + 4 + 2 = 16 et part 4 = 20 ; 3 questions notées, 1 réflexion ; inscrite au registre', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/ikea-quais-du-mardi.js');
    const S = await import('/contenus/ikea-ent125.js');
    const Q = await import('/contenus/questions/ENT-12.5.js');
    const I = await import('/activites/index.js');
    const L = Q.QUESTIONS.liste;
    return { meta: A.meta, poids: S.ETAPES.map((e) => [e.id, e.poids]), total: S.ETAPES.reduce((s, e) => s + e.poids, 0), part: Q.QUESTIONS.part,
      notees: L.filter((q) => q.type === 'fil' && !q.reflexion).map((q) => [q.id, q.poids]), reflexions: L.filter((q) => q.reflexion).map((q) => q.id),
      ouv: Q.QUESTIONS.ouverture.tirage, auRegistre: (await I.chargerActivites()).some((a) => a.meta.id === 'ikea-quais-du-mardi') };
  });
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture], ['ENT-12.5', ['2de'], ['C1.3'], 'guidage', 20, undefined, 'ENT-12.5', true, 'prof'], 'meta');
  egal(r.poids, [['v1-poses', 3], ['v1-chevauche', 4], ['v1-adapte', 3], ['v2-replanifier', 4], ['message', 2]], 'jalons et poids');
  proche(r.total + r.part, 20, 'jalons + part des questions');
  egal(r.notees, [['pourquoi-rdv', 1.5], ['semi-quai-26', 1.5], ['quai-pris', 1]], 'questions notées');
  egal(r.reflexions, ['attente-chauffeur'], 'réflexion non notée');
  egal(r.ouv, { preparation: 2, droit: 1 }, 'ouverture tirée');
  egal(r.auRegistre, true, 'au registre');
});

await v('ENT-12.5 : les données — la solution écrite à la main est juste ; la même renvoyée après le retard fait commencer l’Allemagne trop tôt ; une semi au quai 26, un chevauchement et le créneau de la veille sont repérés', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/ikea-ent125-donnees.js');
    const v1 = { nav1: { r: 'q21', s: 0 }, f1: { r: 'q26', s: 1 }, nav2: { r: 'q23', s: 2 }, f2: { r: 'q24', s: 4 }, f3: { r: 'q26', s: 6 }, allemagne: { r: 'q21', s: 8 }, caisse: { r: 'q22', s: 12 } };
    const v2 = { ...v1, allemagne: { r: 'q21', s: 14 } };
    return {
      ok: [D.toutesPosees(v1), D.tropTot(v1, 1), D.malPlaces(v1), D.chevauchements(v1), D.tropTot(v2, 2), D.chevauchements(v2)],
      reprise: D.tropTot(v1, 2),
      semi: D.malPlaces({ ...v1, nav1: { r: 'q26', s: 0 } }),
      chev: D.chevauchements({ ...v1, nav2: { r: 'q21', s: 2 } }),
      veille: D.chevauchements({ ...v1, f1: { r: 'q22', s: 1 } }),
      long: D.CAMIONS.map((c) => D.longueur(c)),
      arrivee: D.ARRIVEE_APRES,
    };
  });
  egal(r.ok, [true, [], [], [], [], []], 'solution juste');
  egal(r.reprise, ['allemagne'], 'le planning d’avant renvoyé après le retard');
  egal(r.semi, ['nav1'], 'une semi au quai 26');
  egal(r.chev, [['nav1', 'nav2']], 'un chevauchement');
  egal(r.veille, [['f1', 'veille']], 'le créneau de la veille');
  egal(r.long, [4, 2, 4, 4, 3, 4, 2], 'longueurs en créneaux (1 h, 30 min, 1 h, 1 h, 45 min, 1 h, 30 min)');
  egal(r.arrivee, '09:30', 'arrivée après le retard');
});

// ─────────────────────────────────────────────────────────── l'ouverture, le jour normal
await v('ENT-12.5 : Avant de commencer — 3 questions tirées (2 de préparation, 1 de droit), corrigées, jamais notées', async () => {
  const db = await P.monter({ uid: 'ik125', sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 3, 'nombre');
  egal([ids.filter((x) => ['quai', 'rdv', 'duree', 'semi'].includes(x)).length, ids.filter((x) => ['attente', 'pause'].includes(x)).length], [2, 1], 'deux de préparation, une de droit');
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

await v('ENT-12.5 : le matin — un message de Samir (trois documents joints, un mardi de mars), six quais dont le 22 pris par la veille, sept camions à poser ; envoyer fait arriver le retard, l’Allemagne passe à 9 h 30', async () => {
  await mont();
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces]), [['Samir', 'Les quais du mardi', ['poste-125', 'camions-125', 'quais-125']]], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate()], [2027, 2, 9], 'daté du mardi 9 mars 2027');
  vrai(menu && (await menu()).includes('planning'), 'le planning est au menu');
  await allerV('planning');
  const noms = await pg.$$eval(`${Z} [data-pl-grille] .pl-res`, (L) => L.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  vrai(noms.length === 6 && /Quai 21/.test(noms[0]) && /Quai 26/.test(noms[5]) && /porteurs seulement/.test(noms[5]), 'lignes : ' + noms.join(' | '));
  egal((await pg.$$(`${Z} [data-pl-bac] [data-pl-id]:not(.pl-posee)`)).length, 7, 'camions à poser');
  vrai(/Camion de la veille/.test(await pg.evaluate((Z) => document.querySelector(Z).innerText + [...document.querySelectorAll(`${Z} [title], ${Z} [aria-label]`)].map((e) => e.getAttribute('title') || e.getAttribute('aria-label')).join(' '), Z)), 'le créneau de la veille n’est pas montré');
  for (const [id, [q, t]] of Object.entries(V1)) await poser(id, q, t);
  await envoyerPlanning(); await qFil(R);
  vrai((await entrants()).some((m) => m.subject === 'Le camion d’Allemagne est en retard'), 'message du retard');
  const apres = await pg.evaluate((PL) => window.__f.db.plannings[PL].v1 && Object.keys(window.__f.db.plannings[PL].v1.place).length, PL);
  egal(apres, 7, 'sept camions envoyés dans la 1re version');
});

await v('ENT-12.5 : inaction — rien fait → 0/20, aucun jalon juste ; premier planning seul ; second envoi sans rien changer → rien de juste après le retard', async () => {
  await mont({ sansOuverture: true });
  let n = await noter(ACT);
  egal([n.score, n.max], [0, 20], 'note à l’ouverture');
  vrai(!Object.values(n.detail).includes('ok'), 'jalon juste à l’ouverture : ' + JSON.stringify(n.detail));
  await mont();
  await planning(V1, null);
  n = await noter(ACT);
  egal(['v1-poses', 'v1-chevauche', 'v1-adapte'].map((k) => n.detail[k]), ['ok', 'ok', 'ok'], 'les trois jalons du premier planning');
  vrai(!['v2-replanifier', 'message'].some((k) => n.detail[k] === 'ok'), 'jalon juste après le seul premier envoi : ' + JSON.stringify(n.detail));
  await allerV('planning'); await envoyerPlanning(); await qFil(R);       // second envoi sans rien changer
  n = await noter(ACT);
  egal(n.detail['v2-replanifier'], 'ko', 'reprise identique : rien ne tient compte du retard');
});

// ─────────────────────────────────────────────────────────── le parcours juste
await v('ENT-12.5 : parcours juste — planning écrit à la main, Allemagne à 9 h 30 sur le quai 21, message juste → 20/20 ; messages de Samir dans l’ordre ; aucun message ne dit « juste » ou « faux »', async () => {
  await mont({ rep: OUV_FAUX });
  await jouer();
  const n = await noter(ACT);
  proche(n.score, 20, 'note : ' + JSON.stringify(n.detail));
  egal(JALONS.map((k) => n.detail[k]), ['ok', 'ok', 'ok', 'ok', 'ok'], 'jalons');
  const E = await entrants();
  egal(E.map((m) => m.subject), ['Les quais du mardi', 'Le camion d’Allemagne est en retard', 'Où as-tu mis le camion d’Allemagne ?', 'Merci pour ce matin'], 'messages');
  vrai(!E.some((m) => /\b(bravo|bonne réponse|mauvaise réponse)\b/i.test(m.text)), 'un message juge');
  vrai(!!(await base()).points[ID], 'photo de fin rangée');
});

// ─────────────────────────────────────────────────────────── sabotages
await v('ENT-12.5 : sabotages du planning — un chevauchement → 16 (seul « chevauchement » tombe) ; le créneau de la veille pris → 16 ; une semi au quai 26 → 17 ; un camion avant son arrivée → 17', async () => {
  const essai = async (v1, tombes, score, quoi) => {
    await mont(); await planning(v1, V2); await messageSamir();
    const d = await detail();
    egal(JALONS.filter((k) => d[k] === 'ko'), tombes, `${quoi} : jalons tombés`);
    proche((await noter(ACT)).score, score, `${quoi} : note`);
  };
  await essai({ ...V1, nav2: ['q21', 2] }, ['v1-chevauche', 'v2-replanifier'], 12, 'Navette 2 sur le quai de la Navette 1');
  await essai({ ...V1, f1: ['q22', 1] }, ['v1-chevauche', 'v2-replanifier'], 12, 'Fournisseur A sur le créneau de la veille');
  await essai({ ...V1, nav1: ['q26', 0], f1: ['q25', 1] }, ['v1-adapte', 'v2-replanifier'], 13, 'Navette 1 (semi) au quai des porteurs');
  await essai({ ...V1, nav2: ['q23', 1] }, ['v1-poses', 'v2-replanifier'], 13, 'Navette 2 à 6 h 15, avant son arrivée de 6 h 30');
});

await v('ENT-12.5 : le retard — l’Allemagne laissée à 8 h : la reprise tombe (16) ; l’Allemagne à 9 h 30 sur un quai pris : la reprise tombe ; l’Allemagne à 9 h 15 (trop tôt) : la reprise tombe ; un autre quai libre à 9 h 30 : la reprise tient', async () => {
  const essai = async (v2, ok, score, quoi) => {
    await mont(); await planning(V1, v2);
    const d = await detail();
    egal(d['v2-replanifier'], ok ? 'ok' : 'ko', `${quoi} : jalon de la reprise`);
    await messageSamir({ quai: v2 && v2.allemagne ? v2.allemagne[0] : 'q21', heure: v2 && v2.allemagne ? ['06:00', '06:15', '06:30', '06:45', '07:00', '07:15', '07:30', '07:45', '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45'][v2.allemagne[1]] : '08:00' });
    proche((await noter(ACT)).score, score, `${quoi} : note`);
  };
  await essai({}, false, 16, 'rien ne bouge');
  await essai({ allemagne: ['q21', 15], caisse: ['q21', 15] }, false, 16, 'l’Allemagne et la caisse mobile sur le même quai');
  await essai({ allemagne: ['q21', 13] }, false, 16, 'l’Allemagne à 9 h 15');
  await essai({ allemagne: ['q25', 14] }, true, 20, 'l’Allemagne au quai 25 à 9 h 30');
});

await v('ENT-12.5 : message à Samir — juste quand il dit le quai et l’heure du planning refait ; un mauvais quai, ou une mauvaise heure, fait tomber son jalon (18) ; la fiche reste fermée avant le planning refait ; un message à moitié rempli part et son jalon tombe', async () => {
  await mont();
  vrai(!(await menu()).includes('fiche'), 'la fiche est ouverte dès le départ');
  await planning(V1, V2);
  vrai((await menu()).includes('fiche'), 'la fiche est fermée après le planning refait');
  await allerV('fiche');
  await pg.selectOption(`${Z} [data-fiche-champ="quai"]`, 'q21');
  await sansToast(); await clic('[data-fiche-envoyer]'); await pause(120);
  // La fiche déclare `incomplet` : un message à moitié rempli part quand même (rien n'est refusé), et son jalon tombe.
  vrai(await present('[data-confirme-oui]'), 'une fiche à moitié remplie se confirme');
  await confirmer(); await qFil(R);
  vrai(!!(await base()).fiches[FICHE].envoye, 'la fiche à moitié remplie est envoyée');
  egal((await detail()).message, 'ko', 'jalon du message : le quai sans l’heure ne suffit pas');
  const essai = async (message) => { await mont(); await planning(V1, V2); await messageSamir(message); return (await detail()).message; };
  egal(await essai({ quai: 'q21', heure: '09:30' }), 'ok', 'message juste');
  egal(await essai({ quai: 'q23', heure: '09:30' }), 'ko', 'mauvais quai');
  egal(await essai({ quai: 'q21', heure: '08:00' }), 'ko', 'mauvaise heure');
  await mont(); await planning(V1, V2);
  vrai((await detail()).message !== 'ok', 'jalon juste avant l’envoi du message');
});

// ─────────────────────────────────────────────────────────── les questions au fil
await v('ENT-12.5 : questions au fil — « pourquoi-rdv » au premier camion posé, « semi-quai-26 » à l’envoi du premier planning, « quai-pris » après le planning refait (corrigée au bilan), « attente-chauffeur » après le message', async () => {
  await mont();
  await allerV('planning');
  vrai(!(await present('[data-q-panneau]')), 'une question avant tout geste');
  const [id0, [q0, t0]] = Object.entries(V1)[0];
  await fermerCartes();
  await pg.click(`${Z} [data-pl-id="${id0}"][data-pl-vue="b"]`);
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${q0}"][data-t="${t0}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 2000 });
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'pourquoi-rdv', 'question au premier camion posé');
  await qFil(R);
  for (const [id, [q, t]] of Object.entries(V1).slice(1)) await poser(id, q, t);
  await envoyerPlanning();
  await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 2000 });
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'semi-quai-26', 'question à l’envoi du premier planning');
  await qFil(R);
  await allerV('planning');
  for (const [id, [q, t]] of Object.entries(V2)) await poser(id, q, t);
  await envoyerPlanning();
  await pg.waitForSelector(`${Z} [data-q-panneau]`, { timeout: 2000 });
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'quai-pris', 'question après le planning refait');
  await fermerCartes();
  await clic('[data-q-choix="heure"][data-q="quai-pris"]'); await clic('[data-q-repondre="quai-pris"]'); await pause();
  vrai(!(await present('[data-q-verdict]')), 'quai-pris : corrigée au bilan, pas de verdict tout de suite');
  await clic('[data-q-reprendre]'); await pause();
  await messageSamir();
  const b = await base();
  vrai(b.questions[ID]['attente-chauffeur'] && b.questions[ID]['attente-chauffeur'].premiere === 'travail', 'la réflexion est rangée après le message');
});

await v('ENT-12.5 : questions au fil — une fausse ôte son poids (18,5 ; 18,5 ; 19) ; toutes fausses ôtent 4 (16) ; la réflexion ne compte pas', async () => {
  const joue = async (RR) => { await mont(); R = { ...RJ, ...RR }; await jouer(); R = RJ; return (await noter(ACT)).score; };
  proche(await joue({ 'pourquoi-rdv': 'loi' }), 18.5, 'pourquoi-rdv faux');
  proche(await joue({ 'semi-quai-26': 'ferme' }), 18.5, 'semi-quai-26 faux');
  proche(await joue({ 'quai-pris': 'demi' }), 19, 'quai-pris faux');
  proche(await joue(RF), 16, 'toutes fausses (la réflexion ne compte pas)');
});

// ─────────────────────────────────────────────────────────── le corrigé et la fin
await v('ENT-12.5 : le fichier de corrigé est servi et dit les règles (quai 26, retard à 9 h 30)', async () => {
  const r = await pg.evaluate(async () => { const C = await import('/contenus/corriges/ENT-12.5.js'); return { n: C.CORRIGE.items.length, note: C.CORRIGE.items[0].note, rep: C.CORRIGE.items[1].rep, lignes: C.CORRIGE.items[0].reponses.length, status: (await fetch('/contenus/corriges/ENT-12.5.js')).status }; });
  egal(r.status, 200, 'servi'); egal([r.n, r.lignes], [4, 7], 'étapes et camions');
  vrai(/quai 26/i.test(r.note) && /9 h 30/.test(r.rep), 'corrigé : ' + r.note.slice(0, 120));
});

await v('ENT-12.5 : le mot « bonus » n’apparaît pas à l’écran, aucune requête hors du site pendant tout le bloc, aucune erreur de page ni de console', async () => {
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
  egal([...P.hotes], [], 'hôtes externes contactés');
  egal(P.erreurs, [], 'erreurs de page ou de console');
});

await P.fermer?.();
}
