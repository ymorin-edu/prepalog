// Suite de tests de Prepalog — bloc « fb-6.4 » : ENT-6.4 (France Boissons, le camion de la brasserie).
// `node outils/test.mjs fb-6.4` ne lance que ce bloc. Découpé de l'ancien bloc `france-boissons` le 12/10/2026 : un bloc par
// séance (l'ensemble durait 8 min 20 et bornait toute la suite). Les cas sont ceux d'avant, déplacés tels quels ; les aides
// communes (contexte, page, relevé d'erreurs JavaScript, lecture de la base) sont dans `outils/test/france-boissons/commun.mjs`.

import { ouvrirFB } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, texte, bandeau, entrants, horodate, calcPresente, nettoyerCalc, erreursF } = F;

// ── ENT-6.4 : le camion de la brasserie (brief `docs/briefs/ENT-6.4-france-boissons-reception.md`, chantier moteur D-4) ───────────
// Même montage (la vraie séance, `activites/france-boissons-reception.js`), de vrais clics, À LA SOURIS pour l'inspection (zones du
// moteur lues dans `zonesScene`, clic au centre à la `boundingBox()` du <svg>). Mouvement réduit (le camion arrive et les palettes
// sont déchargées d'emblée, sinon 5 s + 32 s d'animation par cas) ; remis à la fin de la section.
// Valeurs ÉCRITES À LA MAIN :
//   jalons (somme 16) : securite-cabine 2, securite-niveleur 2, securite-aucun-faux 1,5 · P1 1, P4 1,5 (contrôle des palettes) ·
//   P2 2,5, P3 2,5, signature 1 (réserves et BL) · msg-reserves 1, msg-fut-fuit 1 (message) ; questions notées (4) : avant-d-entrer 1,5,
//   droit-de-conduire 1, delai-protestation 1,5 ; les deux autres (ce-qu-on-compare, fut-abime-stock) sont pour réfléchir.
//   Palettes (8 places, BL → réel) : P1 Heineken HEI-30 8 → 8 ; P2 BL Affligem AFF-20, étiquette PEL-20, 8 → 8 ; P3 AFF-20 8 → 8, un fût
//   fuit (place 2, face arrière) ; P4 EDW-20, une place vide, BL 7 → 7. Réserves écrites : « P2 AFF-20 : acceptée sous réserve —
//   référence livrée PEL-20. » et « P3 AFF-20 : acceptée sous réserve — 1 fût endommagé (fuite). ».
await pg.emulateMedia({ reducedMotion: 'reduce' });

const ID64 = 'france-boissons-reception';
const Q64 = 'fb-ent64';
const REP64 = { 'bl-cest-quoi': 'liste', 'reserve-cest-quoi': 'preciser', reassort: 'rupture', 'qui-organise-quai': 'nadia', 'transporteur-garant': 'voiturier',
  'reserve-motivee': 'motivee', protocole: 'protocole', 'droit-retrait': 'alerter', 'fut-cest-quoi': 'futs', 'chariot-frontal': 'palettes' };
const PREP64 = ['bl-cest-quoi', 'reserve-cest-quoi', 'reassort', 'qui-organise-quai'];
const DROIT64 = ['transporteur-garant', 'reserve-motivee', 'protocole', 'droit-retrait'];
const IMAGE64 = ['fut-cest-quoi', 'chariot-frontal'];
const monter64 = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/france-boissons-reception.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})['france-boissons-reception'] = db.questions['france-boissons-reception'] || {});
    for (const [id, v] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: v, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'fb64' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'FB',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { ...o, rep: REP64 });

const BONNES64 = { 'avant-d-entrer': 'immobile', 'droit-de-conduire': 'formation-autorisation', 'ce-qu-on-compare': 'bl', 'delai-protestation': 'trois-jours', 'fut-abime-stock': 'a-part' };
const FAUSSES64 = { 'avant-d-entrer': 'chauffeur', 'droit-de-conduire': 'permis', 'ce-qu-on-compare': 'pleine', 'delai-protestation': 'un-mois', 'fut-abime-stock': 'place' };
// Répond au panneau ouvert (puis reprend), tant qu'il y en a un.
async function qrep64(choix = BONNES64) {
  for (let i = 0; i < 4; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}

// ── L'inspection à la souris : les zones sont celles du moteur, le pixel se retrouve par la `boundingBox()` du <svg> et son `viewBox`.
const SVG64 = `${Z} [data-q-inspection]`;
const zones64 = () => pg.evaluate(async (QID) => {
  const Q = await import('/core/types/quai.js');
  const C = await import('/contenus/france-boissons-ent64.js');
  const q = window.__f.db.quais[QID];
  return Q.zonesScene(C.SECURITE, Q.etatsScene(C.SECURITE, q && q.securite));
}, Q64);
async function cliquerVB64(x, y) {
  const loc = pg.locator(SVG64);
  await loc.scrollIntoViewIfNeeded();
  const bb = await loc.boundingBox();
  const [vx, vy, vw, vh] = await loc.evaluate((s) => s.getAttribute('viewBox').split(' ').map(Number));
  const k = Math.min(bb.width / vw, bb.height / vh);
  await pg.mouse.click(bb.x + (bb.width - vw * k) / 2 + (x - vx) * k, bb.y + (bb.height - vh * k) / 2 + (y - vy) * k);
  await pause(40);
}
async function vue64(vue) {
  if ((await pg.$eval(SVG64, (s) => s.dataset.vue)) === vue) return;
  if (vue === 'dedans' && !(await present('[data-q="sc-vue"]'))) await pg.click(`${Z} [data-q="sc-ouvrir"]`);
  else await pg.click(`${Z} [data-q="sc-vue"]`);
  await pg.waitForFunction(({ Z, v }) => document.querySelector(`${Z} [data-q-inspection]`).dataset.vue === v, { Z, v: vue });
}
const secu64 = async () => (await base()).quais[Q64].securite;
// Un clic au centre de la zone `id` (rectangle `i`), dans la vue de l'objet ; rend la marque posée.
async function zone64(id, i = 0) {
  const z = (await zones64()).find((q) => q.id === id);
  await vue64(z.vue);
  const r = z.rects[i];
  await cliquerVB64(r.x + r.w / 2, r.y + r.h / 2);
  const M = (await secu64()).marques;
  return M[M.length - 1];
}
// Un clic sur le mur de la façade, entre deux portes (hors de toute zone) : depuis le 20/10/2026 il ne pose AUCUNE marque
// (même règle que l'inspection du poste). Rend les marques rangées après le clic.
async function mur64() {
  await vue64('dehors');
  const m = await pg.evaluate(async () => { const K = await import('/core/iso.js'); return K.projection({ unite: 54, origine: [330, 150] }).P(5.5, 0, 1.4); });
  await cliquerVB64(m[0], m[1]);
  return (await secu64()).marques;
}
const signaler64 = async () => { await pg.click(`${Z} [data-q="sc-signaler"]`); await pause(); };
const chef64 = () => pg.$eval(`${Z} [data-q-secu-chef]`, (n) => n.textContent.trim());
const decharger64 = async () => { await pg.click(`${Z} [data-q="sc-decharger"]`); await pg.click(`${Z} [data-q="sc-decharger"]`); await pause(); };

// Le quai en entier : l'inspection (`envois` : une liste d'envois, chacun la liste des points à marquer), le déchargement, les quatre
// palettes (`pal` : [compté, décision, motif]), les réserves (`res`), le BL signé, « Clore ». Chaque question qui arrive est répondue
// (`choix`). Rend la note.
const PAL64 = { P1: [8, 'accepter', null], P2: [8, 'reserves', 'produit'], P3: [8, 'reserves', 'avarie'], P4: [7, 'accepter', null] };
const RES64 = { P2: 'PEL-20', P3: '1' };
async function validerPalette64(n, [compte, decision, motif], choix) {
  await pg.click(`${Z} [data-q="sel"][data-n="${n}"]`);
  await pg.fill(`${Z} #qCompte`, String(compte)); await pg.press(`${Z} #qCompte`, 'Enter');
  await pg.click(`${Z} #qDec-${decision}`);
  if (motif) await pg.click(`${Z} #qMot-${motif}`);
  await pg.click(`${Z} [data-q="valider"]`);
  await pause();
  await qrep64(choix);
}
async function quai64(o = {}) {
  const choix = o.choix || BONNES64, pal = { ...PAL64, ...(o.pal || {}) }, res = o.res || RES64;
  await aller('quai');
  await pg.waitForSelector(SVG64);
  for (const ids of (o.envois || [['cabine'], ['niveleur']])) {
    for (const id of ids) { if (id === 'mur') await mur64(); else await zone64(id); }
    await signaler64();
  }
  if (o.avant) await o.avant();
  await decharger64();
  await qrep64(choix);
  await pg.click(`${Z} [data-q="decharger"]`);
  await pause();
  await qrep64(choix);
  await pg.waitForSelector(`${Z} [data-q="vers3"]:not([disabled])`);
  await pg.click(`${Z} [data-q="vers3"]`);
  for (const [n, id] of ['P1', 'P2', 'P3', 'P4'].entries()) await validerPalette64(n, pal[id], choix);
  await pg.click(`${Z} [data-q="vers4"]`); await pg.click(`${Z} [data-q="vers4"]`);
  for (const [id, v] of Object.entries(res)) if (await present(`#qRes-${id}`)) await pg.fill(`${Z} #qRes-${id}`, v);
  await pg.click(`${Z} [data-q="ecrire"]`);
  await pg.click(`${Z} [data-q="signer"]`);
  await pause();
  await pg.click(`${Z} [data-q="clore"]`);
  await pg.waitForSelector(`${Z} [data-q-bilan]`);
  await pause();
  await qrep64(choix);
  return note();
}
const NOM64 = 'Ton compte rendu de réception';
async function ouvrir64(subject) {
  await aller('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  const id = await pg.evaluate((s) => window.__f.db.mails.filter((m) => m.folder === 'in' && m.subject === s).pop().id, subject);
  await pg.click(`${Z} [data-mail="${id}"]`);
  await pause();
}
// Le point d'étape de Nadia après le BL signé (une question notée), puis « Continuer ».
async function etape64(v = 'trois-jours') {
  await aller('mail');                       // le point d'étape arrive au redessin qui suit le BL signé
  await aller('etape:avant-compte-rendu');
  await pg.click(`${Z} [data-q-choix="${v}"][data-q="delai-protestation"]`);
  await pg.click(`${Z} [data-q-repondre="delai-protestation"]`);
  await pause();
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
}
const MSG64 = { salutation: 'Bonjour Nadia,', reserves: 'Réserves : la palette P2 est de la Pelforth Blonde au lieu de l’Affligem, et un fût d’Affligem fuit.',
  'fut-fuit': 'J’ai mis le fût qui fuit en zone litiges.', fin: 'Cordialement, Lea' };
// Répond par phrases au compte rendu : le premier choix d'une ligne ouvre parfois une question (réflexion), répondue.
async function message64(m = MSG64, choix = BONNES64) {
  await ouvrir64(NOM64);
  await pg.click(`${Z} [data-repondre]`);
  await pause();
  for (const [l, t] of Object.entries(m)) { await pg.selectOption(`${Z} select[data-phrase="${l}"]`, { label: t }); await pause(); await qrep64(choix); }
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await pause();
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
// Le parcours entier : le quai, le point d'étape, le message. `o` : voir `quai64`, plus `msg`, `etape`.
async function parcours64(o = {}) {
  await monter64({ uid: o.uid || 'fb64' });
  await quai64(o);
  await etape64(o.etape || (o.choix || BONNES64)['delai-protestation']);
  await message64({ ...MSG64, ...(o.msg || {}) }, o.choix || BONNES64);
  return note();
}
const JALONS64 = ['securite-cabine', 'securite-niveleur', 'securite-aucun-faux', 'P1', 'P2', 'P3', 'P4', 'signature', 'msg-reserves', 'msg-fut-fuit',
  'question:avant-d-entrer', 'question:droit-de-conduire', 'question:delai-protestation'];
const POIDS64 = { 'securite-cabine': 2, 'securite-niveleur': 2, 'securite-aucun-faux': 1.5, P1: 1, P2: 2.5, P3: 2.5, P4: 1.5, signature: 1, 'msg-reserves': 1, 'msg-fut-fuit': 1,
  'question:avant-d-entrer': 1.5, 'question:droit-de-conduire': 1, 'question:delai-protestation': 1.5 };
const etats64 = (n) => JALONS64.map((j) => [j, n.detail[j]]);
const sauf64 = (faux, etat = 'ko') => JALONS64.map((j) => [j, faux.includes(j) ? etat : 'ok']);
const points64 = (faux) => 20 - faux.reduce((s, j) => s + POIDS64[j], 0);

await v('ENT-6.4 : déclaration — meta, parcours après ENT-6.3, dix jalons aux poids écrits à la main (16) + trois questions notées (4) = 20, quatre groupes, aucun jalon à 0', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/france-boissons-reception.js');
    const S = await import('/contenus/france-boissons-ent64.js');
    const Qs = await import('/contenus/questions/ENT-6.4.js');
    return { meta: A.meta, etapes: S.ETAPES.map((e) => [e.id, e.poids, e.groupe]), part: Qs.QUESTIONS.part,
      notees: Qs.QUESTIONS.liste.filter((q) => q.type !== 'ouverture' && !q.reflexion).map((q) => [q.id, q.poids, q.groupe]),
      reflexions: Qs.QUESTIONS.liste.filter((q) => q.reflexion).map((q) => q.id) };
  });
  const m = r.meta;
  egal([m.id, m.code, m.rubrique, m.niveaux, m.competences, m.domaines, m.temps, m.bareme, m.parcours, m.precedente, m.correction, m.questions, m.corrige, m.portee],
    ['france-boissons-reception', 'ENT-6.4', 'simulog', ['2de', 'cap'], ['C1.2', 'C1.4'], ['D4', 'D5'], 'entrainement', 20, true, 'france-boissons-conges', true, 'ENT-6.4',
      './contenus/corriges/ENT-6.4.js', 'eleve'], 'meta');
  vrai(m.jeuId === undefined, 'une base par séance : aucun jeuId partagé');
  const SEC = 'Sécurité avant de décharger', PAL = 'Contrôle des palettes', RES = 'Réserves et BL', MSG = 'Message à Nadia';
  egal(r.etapes, [['securite-cabine', 2, SEC], ['securite-niveleur', 2, SEC], ['securite-aucun-faux', 1.5, SEC], ['P1', 1, PAL], ['P2', 2.5, RES], ['P3', 2.5, RES],
    ['P4', 1.5, PAL], ['signature', 1, RES], ['msg-reserves', 1, MSG], ['msg-fut-fuit', 1, MSG]], 'jalons, poids et groupes');
  egal(r.etapes.reduce((s, e) => s + e[1], 0), 16, 'somme des jalons');
  vrai(r.etapes.every((e) => e[1] > 0), 'aucun jalon à 0');
  egal(r.part, 4, 'part des questions');
  egal(r.notees, [['avant-d-entrer', 1.5, 'Question de Nadia : avant d’entrer dans la remorque'], ['droit-de-conduire', 1, 'Question de Nadia : conduire le chariot'],
    ['delai-protestation', 1.5, 'Question de Nadia : protester après la signature']], 'questions notées');
  egal(r.notees.reduce((s, q) => s + q[1], 0), 4, 'somme des questions');
  egal(r.reflexions, ['ce-qu-on-compare', 'fut-abime-stock'], 'questions pour réfléchir');
});

await v('ENT-6.4 : livraison — pret: true et ouverture: prof (fermée aux élèves tant que l’enseignant ne l’a pas cochée)', async () => {
  const r = await pg.evaluate(async () => {
    const I = await import('/activites/index.js');
    await I.chargerActivites();
    const A = await import('/activites/france-boissons-reception.js');
    return { pret: A.meta.pret, ouverture: A.meta.ouverture, echecs: I.activitesEnEchec().length };
  });
  egal([r.pret, r.ouverture, r.echecs], [true, 'prof', 0], 'livraison');
});

await v('ENT-6.4 : ouverture — le message de Nadia (3 blocs, mercredi 16 juin 2027, 13 h 50), le menu, rien sur les défauts ; l’état est cloisonné par séance', async () => {
  await monter64({ uid: 'fb64-ouv' });
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue)), ['ouverture', 'accueil', 'mail', 'quai'], 'menu');
  const M = await entrants();
  egal(M.length, 1, 'un seul message au départ');
  egal(M[0].subject, 'Le camion de la brasserie de Mons', 'sujet');
  egal(M[0].text, 'Bonjour Lea, bienvenue au quai ! Ici, l’objectif, c’est zéro accident.\n\n'
    + 'Le camion de la brasserie de Mons arrive au quai 12 : 4 palettes de [[fût|fûts]], dont l’Affligem qu’on attendait.\n\n'
    + 'Ma procédure de réception, pour chaque palette :\n'
    + '1. je compte les fûts ;\n'
    + '2. je lis l’étiquette et je la compare au [[BL]] : même produit, même quantité ;\n'
    + '3. tout est conforme : j’accepte ;\n'
    + '4. il manque des fûts ou un fût est abîmé : j’accepte avec [[reserve|réserves]], en écrivant quoi et combien ;\n'
    + '5. c’est une référence que nous n’avons pas commandée : j’accepte avec réserves, motif « produit différent », et j’écris la référence lue sur l’étiquette, pas celle du BL. On la rangera sous la référence lue, pas sous celle du BL, et la réserve prévient le transporteur.\n\n'
    + 'Avant de décharger, regarde bien la scène.\n\nNadia', 'texte en quatre blocs (avec la procédure de réception)');
  egal(horodate(M[0].ts), [2027, 6, 16, 13, 50], 'date du scénario');
  egal(M[0].pieces, ['droit', 'annuaire'], 'pièces jointes');
  const tout = JSON.stringify(M) + (await texte());
  vrai(!/cale|niveleur|moteur|volant|fum[ée]e|fuit|fuite|Pelforth|litige/i.test(tout), 'un mot de l’exercice dans l’accueil ou le message : ' + (/cale|niveleur|moteur|volant|fum[ée]e|fuit|fuite|Pelforth|litige/i.exec(tout) || [])[0]);
  await aller('quai');
  await pg.waitForSelector(SVG64);
  egal(Object.keys((await base()).quais), ['fb-ent64'], 'l’état du quai est rangé sous l’id de la séance');
  const ecran = await texte();
  vrai(!/cale|niveleur|moteur|volant|fum[ée]e|fuit|fuite|Pelforth|litige/i.test(ecran), 'le quai dit un mot de l’exercice avant l’inspection : ' + (/cale|niveleur|moteur|volant|fum[ée]e|fuit|fuite|Pelforth|litige/i.exec(ecran) || [])[0]);
  egal(await pg.$$eval(`${SVG64} [title], ${SVG64} [tabindex]`, (L) => L.length), 0, 'rien ne trahit les zones (ni title, ni tabindex)');
});

await v('ENT-6.4 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau', async () => {
  await monter64({ uid: 'fb64-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin]')), 'bandeau de fin');
  await aller('quai');
  await pg.waitForSelector(SVG64);
  egal((await note()).score, 0, 'le quai ouvert, toujours 0');
});

await v('ENT-6.4 : parcours juste — 20/20 ; deux envois (cabine, puis niveleur) ; Nadia répond point par point ; réserves et message ; Nadia reprend ce qu’on lui a écrit ; bandeau ✓ ; séance finie (photo)', async () => {
  await monter64({ uid: 'fb64-juste' });
  await aller('quai');
  await pg.waitForSelector(SVG64);
  vrai((await pg.$$eval(`${SVG64} .iso-fumee`, (L) => L.length)) > 0, 'pas de fumée au pot avant le signalement : le moteur doit tourner');
  const m1 = await zone64('cabine');
  egal([m1.point, m1.vue], ['cabine', 'dehors'], 'la cabine est touchée');
  await signaler64();
  egal(await chef64(), 'Nadia : « Bien vu : je fais couper le moteur, le chauffeur me donne les clés et descend. Tu me dis quand on peut décharger. »', 'réponse au 1er envoi');
  vrai((await pg.$$eval(`${SVG64} .iso-fumee`, (L) => L.length)) === 0, 'la fumée continue après le signalement');
  const m2 = await zone64('niveleur');
  egal([m2.point, m2.vue], ['niveleur', 'dedans'], 'le niveleur est touché (vue du dedans)');
  await signaler64();
  egal(await chef64(), 'Nadia : « Bien vu : je pose le niveleur. Tu me dis quand on peut décharger. »', 'réponse au 2e envoi');
  egal((await secu64()).signaux.map((g) => g.points), [['cabine'], ['niveleur']], 'deux signaux');
  await decharger64();
  await qrep64();
  vrai(!(await present('[data-q-secu-arret]')), 'Nadia n’arrête pas l’élève');
  await pg.click(`${Z} [data-q="decharger"]`);
  await pause();
  await qrep64();
  await pg.waitForSelector(`${Z} [data-q="vers3"]:not([disabled])`);
  await pg.click(`${Z} [data-q="vers3"]`);
  for (const [n, id] of ['P1', 'P2', 'P3', 'P4'].entries()) await validerPalette64(n, PAL64[id]);
  await pg.click(`${Z} [data-q="vers4"]`); await pg.click(`${Z} [data-q="vers4"]`);
  await pg.fill(`${Z} #qRes-P2`, 'PEL-20'); await pg.fill(`${Z} #qRes-P3`, '1');
  await pg.click(`${Z} [data-q="ecrire"]`);
  await pg.click(`${Z} [data-q="signer"]`);
  await pause();
  await pg.click(`${Z} [data-q="clore"]`);
  await pg.waitForSelector(`${Z} [data-q-bilan]`);
  egal((await base()).quais[Q64].lignes.map((l) => [l.id, l.texte, l.juste]), [['P2', 'P2 AFF-20 : acceptée sous réserve — référence livrée PEL-20.', true],
    ['P3', 'P3 AFF-20 : acceptée sous réserve — 1 fût endommagé (fuite).', true]], 'les réserves écrites sur le BL');
  const C = (await entrants()).filter((m) => m.subject === NOM64);
  egal(C.length, 1, 'Nadia demande le compte rendu quand le BL est signé');
  egal(C[0].text, 'Le chauffeur est reparti. Fais-moi un compte rendu de ta réception.\n\nClique sur « Répondre » et choisis une phrase par ligne.\n\nNadia', 'texte de la demande');
  await etape64();
  await message64();
  const n = await note();
  egal([n.score, n.max], [20, 20], 'note');
  egal(etats64(n), sauf64([]), 'jalons');
  egal(await bandeau(), [['securite-cabine', 'ok'], ['P1', 'ok'], ['P2', 'ok'], ['msg-reserves', 'ok'], ['question:avant-d-entrer', 'ok'], ['question:droit-de-conduire', 'ok'],
    ['question:delai-protestation', 'ok']], 'bandeau : une ligne par groupe, une par question notée');
  egal((await entrants()).filter((m) => m.subject === `RE : ${NOM64}`).map((m) => m.text),
    ['Noté : la P2 est de la Pelforth Blonde, et un fût fuit. Noté : le fût qui fuit est en zone litiges. Tout à l’heure, on range les fûts.\n\nNadia'], 'réponse de Nadia');
  vrai(!!(await base()).points[ID64], 'photo de fin : la séance suivante peut s’ouvrir');
});

await v('ENT-6.4 : décharger sans rien signaler → les trois jalons de sécurité faux (5,5 points), ② montre moteur coupé et niveleur posé, sans un mot de Nadia ni arrêt', async () => {
  await monter64({ uid: 'fb64-oubli' });
  await aller('quai');
  await pg.waitForSelector(SVG64);
  await decharger64();
  const s = await secu64();
  egal([s.fait, s.arrete, s.signaux.length, s.chef], [true, false, 0, ''], 'figée, pas d’arrêt, aucun signalement, aucun texte');
  egal(await pg.evaluate(async (QID) => {
    const Q = await import('/core/types/quai.js'); const C = await import('/contenus/france-boissons-ent64.js');
    const E = Q.etatsScene(C.SECURITE, window.__f.db.quais[QID].securite);
    return [E.cabine, E.niveleur, E.cale, E.butoirs, E.lampe];
  }, Q64), ['vide', 'pose', 'posee', 'enPlace', 'allumee'], 'à l’étape suivante : moteur coupé, niveleur posé, le reste en ordre');
  await qrep64();
  vrai(!(await present('[data-q-secu-arret]')) && !/Bien vu|Stop|ne vois rien/.test(await texte()), 'un mot de Nadia sur ce qui a été oublié');
  await pg.click(`${Z} [data-q="decharger"]`);
  await pause();
  await qrep64();
  await pg.waitForSelector(`${Z} [data-q="vers3"]:not([disabled])`);
  vrai((await pg.$$eval(`${Z} [data-q-scene2] .iso-fumee`, (L) => L.length)) === 0, 'de la fumée à l’étape ②');
  vrai((await pg.$$eval(`${Z} [data-q-scene2] [data-iso-chariot]`, (L) => L.length)) > 0, 'le chariot frontal n’est pas dessiné à l’étape ② (un cariste décharge)');
  const n = await parcours64({ uid: 'fb64-oubli-2', envois: [] });
  egal(etats64(n), sauf64(['securite-cabine', 'securite-niveleur', 'securite-aucun-faux']), 'jalons');
  egal(n.score, points64(['securite-cabine', 'securite-niveleur', 'securite-aucun-faux']), 'note');
  egal(n.score, 14.5, 'note écrite à la main : 20 − 2 − 2 − 1,5');
  egal(await bandeau(), [['securite-cabine', 'ko'], ['P1', 'ok'], ['P2', 'ok'], ['msg-reserves', 'ok'], ['question:avant-d-entrer', 'ok'], ['question:droit-de-conduire', 'ok'],
    ['question:delai-protestation', 'ok']], 'bandeau : seule la ligne de sécurité est fausse');
});

await v('ENT-6.4 : seule la cabine signalée → le niveleur oublié est le seul jalon faux (2 points), remis en ordre sans un mot', async () => {
  const n = await parcours64({ uid: 'fb64-cabine', envois: [['cabine']] });
  egal(etats64(n), sauf64(['securite-niveleur']), 'jalons');
  egal(n.score, 18, 'note');
});

await v('ENT-6.4 : la cale signalée (un piège) → « aucun faux signalement » faux seul (1,5 point), Nadia ne voit rien qui cloche', async () => {
  await monter64({ uid: 'fb64-cale' });
  await aller('quai');
  await pg.waitForSelector(SVG64);
  await zone64('cale');
  await signaler64();
  egal(await chef64(), 'Nadia : « Là, je ne vois rien qui cloche. Tu me dis quand on peut décharger. »', 'la cale est en ordre');
  const n = await parcours64({ uid: 'fb64-cale-2', envois: [['cabine'], ['niveleur'], ['cale']] });
  egal(etats64(n), sauf64(['securite-aucun-faux']), 'jalons');
  egal(n.score, 18.5, 'note');
});

await v('ENT-6.4 : un clic sur le mur (à côté de tout objet) ne pose rien et dit « Clique un objet du quai. » → aucun faux signalement, tous les jalons justes, 20/20', async () => {
  await monter64({ uid: 'fb64-mur-msg' });
  await aller('quai');
  await pg.waitForSelector(SVG64);
  egal(await mur64(), [], 'le mur : aucune marque rangée');
  egal(await pg.$eval(`${Z} [data-q-nb-marques]`, (x) => x.textContent), 'Clique un objet du quai.', 'le message à la place du compteur');
  const n = await parcours64({ uid: 'fb64-mur', envois: [['cabine', 'niveleur', 'mur']] });
  egal(etats64(n), sauf64([]), 'jalons : le clic sur le mur n’est pas un faux signalement');
  egal(n.score, 20, 'note');
  egal((await secu64()).signaux.map((g) => [g.points, g.rien]), [[['cabine', 'niveleur'], 0]], 'un signal : deux points touchés, aucune marque à côté');
});

await v('ENT-6.4 : une marque fausse retirée AVANT l’envoi ne compte pas ; envoyée, elle compte même si on la retire ensuite', async () => {
  await monter64({ uid: 'fb64-retiree' });
  await aller('quai');
  await pg.waitForSelector(SVG64);
  const m = await zone64('cale');
  egal((await secu64()).marques.length, 1, 'la marque est posée');
  await zone64('cale');                       // un clic sur la marque l'enlève
  egal((await secu64()).marques.length, 0, 'la marque est retirée');
  await zone64('cabine'); await zone64('niveleur');
  await signaler64();
  egal((await secu64()).signaux.map((g) => [g.points, g.rien]), [[['cabine', 'niveleur'], 0]], 'seul ce qui était en place est parti');
  const n = await parcours64({ uid: 'fb64-retiree-2', avant: null, envois: [['cabine', 'niveleur']] });
  egal([n.score, n.max], [20, 20], 'note');
  vrai(m && m.point === 'cale', 'la marque posée était bien sur la cale');
  // Envoyée : elle compte, même retirée ensuite (une marque envoyée est inerte : on ne peut plus l'enlever).
  await monter64({ uid: 'fb64-retiree-3' });
  await aller('quai');
  await pg.waitForSelector(SVG64);
  await zone64('cale'); await zone64('cabine'); await signaler64();
  const avant = (await secu64()).marques.length;
  await zone64('cale');
  vrai((await secu64()).marques.length >= avant, 'une marque envoyée a pu être retirée');
  egal((await secu64()).signaux[0].points, ['cale', 'cabine'], 'le faux signalement est parti');
});

// Les palettes : le parcours entier avec une palette contrôlée de travers.
for (const [nom, o, faux] of [
  ['P2 acceptée sans réserve (le BL a l’air bon)', { pal: { P2: [8, 'accepter', null] }, res: { P3: '1' } }, ['P2']],
  ['P2 avec « AFF-20 » recopié du BL au lieu de la référence lue (PEL-20)', { res: { P2: 'AFF-20', P3: '1' } }, ['P2']],
  ['P2 avec « Affligem » recopié (le nom, pas la référence)', { res: { P2: 'Affligem', P3: '1' } }, ['P2']],
  ['P3 sans réserve (le fût qui fuit n’a pas été vu)', { pal: { P3: [8, 'accepter', null] }, res: { P2: 'PEL-20' } }, ['P3']],
  ['P3 avec 2 fûts endommagés au lieu d’un', { res: { P2: 'PEL-20', P3: '2' } }, ['P3']],
  ['P4 comptée 8 (palette supposée pleine)', { pal: { P4: [8, 'accepter', null] } }, ['P4']],
  ['P4 avec une réserve « manquant » (7 au lieu de 8)', { pal: { P4: [7, 'reserves', 'manquant'] }, res: { P2: 'PEL-20', P3: '1', P4: '1' } }, ['P4']],
  ['P1 comptée 7', { pal: { P1: [7, 'accepter', null] } }, ['P1']],
]) {
  await v(`ENT-6.4 : piège — ${nom} → seul ${faux.join(', ')} faux (${points64(faux)}/20)`, async () => {
    const n = await parcours64({ uid: `fb64-pal-${nom.length}`, ...o });
    egal(etats64(n), sauf64(faux), 'jalons');
    egal(n.score, points64(faux), 'note');
  });
}
await v('ENT-6.4 : la fiche de décision garde les quatre motifs : fût endommagé, manquant, produit différent, conforme ; « température » n’existe pas ; l’unité est le fût', async () => {
  await monter64({ uid: 'fb64-motifs' });
  await quai64();
  const t = await texte();
  vrai(/Fût endommagé/.test(t) && /Produit différent/.test(t), 'les motifs du quai');
  vrai(!/température|Température/.test(t) && !/carton/i.test(t), 'température ou carton à l’écran');
});

await v('ENT-6.4 : message à Nadia — la phrase « en stock avec les autres » → seul msg-fut-fuit faux (1 point) ; Nadia reprend ce qu’on lui a écrit, sans corriger', async () => {
  const n = await parcours64({ uid: 'fb64-stock', msg: { 'fut-fuit': 'J’ai rangé le fût qui fuit en stock avec les autres.' } });
  egal(etats64(n), sauf64(['msg-fut-fuit']), 'jalons');
  egal(n.score, 19, 'note');
  egal((await entrants()).filter((m) => m.subject === `RE : ${NOM64}`).map((m) => m.text),
    ['Noté : la P2 est de la Pelforth Blonde, et un fût fuit. Noté : le fût qui fuit est rangé en stock avec les autres. Tout à l’heure, on range les fûts.\n\nNadia'], 'réponse reprise');
});

await v('ENT-6.4 : message à Nadia — lignes de réserves fausses (« Tout est conforme. ») et ton familier : seule la ligne des réserves coûte (1 point) ; salutation et fin pèsent 0', async () => {
  const n = await parcours64({ uid: 'fb64-ton', msg: { reserves: 'Tout est conforme.', salutation: 'Salut !', fin: 'Bisous' } });
  egal(etats64(n), sauf64(['msg-reserves']), 'jalons');
  egal(n.score, 19, 'note');
  egal((await entrants()).filter((m) => m.subject === `RE : ${NOM64}`).map((m) => m.text),
    ['Noté : tout est conforme. Noté : le fût qui fuit est en zone litiges. Tout à l’heure, on range les fûts.\n\nNadia'], 'réponse reprise, sans corriger');
});

await v('ENT-6.4 : la question « on peut décharger » se pose au figeage, ne dit rien tout de suite, se corrige au bilan ; fausse = 18,5 ; elle ne nomme ni cabine, ni cale, ni niveleur', async () => {
  await monter64({ uid: 'fb64-q1' });
  await aller('quai');
  await pg.waitForSelector(SVG64);
  await zone64('cabine'); await zone64('niveleur'); await signaler64();
  vrai(!(await present('[data-q-panneau]')), 'la question arrive avant le figeage');
  await decharger64();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'avant-d-entrer', 'la question du figeage');
  const enonce = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.innerText);
  vrai(/Avant d’entrer dans une remorque avec le chariot, qu’est-ce qui doit être vrai/.test(enonce) && !/cabine|cale|niveleur|moteur/i.test(enonce), 'énoncé : ' + enonce);
  await pg.click(`${Z} [data-q-choix="chauffeur"][data-q="avant-d-entrer"]`);
  await pg.click(`${Z} [data-q-repondre="avant-d-entrer"]`);
  vrai(await present('[data-q-merci]') && !(await present('[data-q-verdict]')), 'corrigée tout de suite');
  vrai(!/Camion immobile/.test(await texte()), 'le retour de Nadia est affiché avant le bilan');
  await pg.click(`${Z} [data-q-reprendre]`);
  const n = await parcours64({ uid: 'fb64-q1-2', choix: { ...BONNES64, 'avant-d-entrer': 'chauffeur' } });
  egal(etats64(n), sauf64(['question:avant-d-entrer']), 'jalons');
  egal(n.score, 18.5, 'note');
  egal(await bandeau(), [['securite-cabine', 'ok'], ['P1', 'ok'], ['P2', 'ok'], ['msg-reserves', 'ok'], ['question:avant-d-entrer', 'ko'], ['question:droit-de-conduire', 'ok'],
    ['question:delai-protestation', 'ok']], 'bandeau');
});

await v('ENT-6.4 : question du chariot frontal (R4323-56) au premier déchargement, corrigée tout de suite ; fausse = 19 ; question « ce qu’on compare » à la 1re palette validée, pour réfléchir, jamais notée', async () => {
  await monter64({ uid: 'fb64-q2' });
  await aller('quai');
  await pg.waitForSelector(SVG64);
  await zone64('cabine'); await zone64('niveleur'); await signaler64();
  await decharger64();
  await qrep64();
  await pg.click(`${Z} [data-q="decharger"]`);
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'droit-de-conduire', 'la question du premier déchargement');
  const enonce = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.innerText);
  vrai(/R4323-56/.test(enonce) && /autorisation de conduite délivrée par l’employeur/.test(enonce), 'le texte de loi est cité dans l’énoncé');
  await pg.click(`${Z} [data-q-choix="permis"][data-q="droit-de-conduire"]`);
  await pg.click(`${Z} [data-q-repondre="droit-de-conduire"]`);
  vrai(await present('[data-q-verdict]'), 'corrigée tout de suite');
  await pg.click(`${Z} [data-q-reprendre]`);
  await pg.waitForSelector(`${Z} [data-q="vers3"]:not([disabled])`);
  await pg.click(`${Z} [data-q="vers3"]`);
  vrai(!(await present('[data-q-panneau]')), 'la question des palettes arrive avant la 1re validation');
  await pg.click(`${Z} [data-q="sel"][data-n="0"]`);
  await pg.fill(`${Z} #qCompte`, '8'); await pg.press(`${Z} #qCompte`, 'Enter');
  await pg.click(`${Z} #qDec-accepter`);
  await pg.click(`${Z} [data-q="valider"]`);
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'ce-qu-on-compare', 'la question de la 1re palette validée');
  await pg.click(`${Z} [data-q-choix="pleine"][data-q="ce-qu-on-compare"]`);
  await pg.click(`${Z} [data-q-repondre="ce-qu-on-compare"]`);
  vrai(!(await present('[data-q-verdict]')), 'la réflexion corrige avant le bilan');
  await pg.click(`${Z} [data-q-reprendre]`);
  const n = await parcours64({ uid: 'fb64-q2-2', choix: { ...BONNES64, 'droit-de-conduire': 'permis', 'ce-qu-on-compare': 'pleine' } });
  egal(etats64(n), sauf64(['question:droit-de-conduire']), 'jalons');
  egal(n.score, 19, 'note : la réflexion fausse ne coûte rien');
});

await v('ENT-6.4 : le point d’étape sur L133-3 garde fermé « Répondre » à Nadia jusqu’à la réponse (notée 1,5) ; fausse = 18,5 ; « Continuer » rouvre', async () => {
  await monter64({ uid: 'fb64-q4' });
  await quai64();
  await ouvrir64(NOM64);
  vrai(!(await present('[data-repondre]')) && await present('[data-qf-ferme]'), '« Répondre » fermé après le BL signé');
  await aller('etape:avant-compte-rendu');
  const t = await texte();
  vrai(/Le chauffeur est reparti avec le BL signé/.test(t) && /L133-3/.test(t) && /dans les trois jours, non compris les jours fériés/.test(t), 'le point d’étape et le texte de loi cités');
  await pg.click(`${Z} [data-q-choix="un-mois"][data-q="delai-protestation"]`);
  await pg.click(`${Z} [data-q-repondre="delai-protestation"]`);
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
  await ouvrir64(NOM64);
  vrai(await present('[data-repondre]'), '« Répondre » rouvert après la réponse (fausse)');
  egal((await note()).score, 16.5, 'jalons du quai 14 (5,5 + 7,5 + 1) + questions justes 2,5 (1,5 + 1), sans le message (2) ni L133-3 (1,5)');
});

await v('ENT-6.4 : question « fût abîmé » au choix de la phrase du fût qui fuit — pour réfléchir, corrigée au bilan', async () => {
  await monter64({ uid: 'fb64-q5' });
  await quai64();
  await etape64();
  await ouvrir64(NOM64);
  await pg.click(`${Z} [data-repondre]`);
  await pause();
  await pg.selectOption(`${Z} select[data-phrase="salutation"]`, { label: 'Bonjour Nadia,' });
  await pause();
  vrai(!(await present('[data-q-panneau]')), 'la question arrive avant la ligne concernée');
  await pg.selectOption(`${Z} select[data-phrase="fut-fuit"]`, { label: 'J’ai mis le fût qui fuit en zone litiges.' });
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'fut-abime-stock', 'la question du fût');
  await pg.click(`${Z} [data-q-choix="place"][data-q="fut-abime-stock"]`);
  await pg.click(`${Z} [data-q-repondre="fut-abime-stock"]`);
  vrai(!(await present('[data-q-verdict]')), 'corrigée avant le bilan');
});

await v('ENT-6.4 : pire cas — aucun signalement, quatre palettes de travers, message et questions faux → 1/20 (le BL signé), premier bilan sans l’enseignant, photo rangée', async () => {
  const n = await parcours64({ uid: 'fb64-pire', envois: [], choix: FAUSSES64, pal: { P1: [7, 'refuser', 'avarie'], P2: [8, 'accepter', null], P3: [8, 'accepter', null], P4: [8, 'accepter', null] },
    res: { P1: '1' }, msg: { reserves: 'Tout est conforme.', 'fut-fuit': 'J’ai rendu le fût qui fuit au chauffeur.' } });
  egal(n.score, 1, 'seul le BL signé compte');
  egal(etats64(n), sauf64(JALONS64.filter((j) => j !== 'signature')), 'jalons');
  vrai(!!(await base()).points[ID64], 'pas de photo : la séance suivante ne s’ouvrirait pas');
});

await v('ENT-6.4 : « Avant de commencer » — 5 questions tirées (2 + 2 + 1), non notées, la calculette ; menu ouvert après les réponses ; deux élèves n’ont pas toutes les mêmes', async () => {
  await nettoyerCalc();
  await monter64({ sansOuverture: true, uid: 'fb64-ouv-1' });
  vrai(await present('[data-ouverture="avant-de-commencer"]'), 'la séance ne s’ouvre pas sur « Avant de commencer »');
  vrai(await calcPresente(), 'calculette absente');
  const t1 = (await base()).questions[ID64]['@tirage'].ids;
  egal([t1.filter((i) => PREP64.includes(i)).length, t1.filter((i) => DROIT64.includes(i)).length, t1.filter((i) => IMAGE64.includes(i)).length, t1.length], [2, 2, 1, 5], 'répartition : ' + t1);
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue)), ['ouverture'], 'menu fermé tant qu’il reste des questions');
  for (let k = 0; k < t1.length; k++) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    await pg.click(`${Z} [data-q-choix="${REP64[t1[k]]}"][data-q="${t1[k]}"]`);
    await pg.click(`${Z} [data-q-repondre="${t1[k]}"]`);
    await pause();
  }
  vrai((await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue))).includes('quai'), 'menu fermé après les réponses');
  egal((await note()).score, 0, 'l’ouverture ne compte pas');
  const R = new Set();
  for (const uid of ['fb64-a', 'fb64-b', 'fb64-c', 'fb64-d']) { await monter64({ sansOuverture: true, uid }); R.add((await base()).questions[ID64]['@tirage'].ids.slice().sort().join()); }
  vrai(R.size > 1, 'quatre élèves ont exactement les mêmes questions');
  await nettoyerCalc();
});

await v('ENT-6.4 : banque d’ouverture — dix questions, toute la banque sort sur 300 graines (2 + 2 + 1 chaque fois) ; images du dépôt et crédits ; jamais le dessin de la palette qui fuit', async () => {
  const r = await pg.evaluate(async () => {
    const { compilerQuestions, tirerOuverture } = await import('/core/types/questions.js');
    const { QUESTIONS } = await import('/contenus/questions/ENT-6.4.js');
    const M = compilerQuestions(QUESTIONS, null, ['bl', 'annuaire', 'photos', 'droit']);
    const T = [];
    for (let s = 0; s < 300; s++) { const t = tirerOuverture(M, `graine-${s}`); T.push(t.ids); }
    const imgs = QUESTIONS.ouverture.documents.find((d) => d.id === 'photos').images;
    const fetches = [];
    for (const im of imgs) { const f = await fetch(im.src); fetches.push([im.src, f.status]); }
    const cred = await (await fetch('/contenus/images/france-boissons/CREDITS.md')).text();
    return { T, imgs: imgs.map((i) => [i.src, i.credit]), fetches, cred, source: JSON.stringify(QUESTIONS) };
  });
  egal([...new Set(r.T.flat())].sort(), [...PREP64, ...DROIT64, ...IMAGE64].sort(), 'toute la banque sort');
  vrai(r.T.every((ids) => ids.length === 5 && ids.filter((i) => PREP64.includes(i)).length === 2 && ids.filter((i) => DROIT64.includes(i)).length === 2 && ids.filter((i) => IMAGE64.includes(i)).length === 1), 'répartition 2 + 2 + 1');
  egal(r.imgs, [['./contenus/images/france-boissons/futs-vrac.jpg', 'Photo : Belinda Fewings, Unsplash'],
    ['./contenus/images/france-boissons/materiel-chariot-frontal.svg', 'Dessin — document pédagogique']], 'images et crédits affichés');
  egal(r.fetches.map((f) => f[1]), [200, 200], 'les deux images sont servies par le dépôt');
  vrai(r.cred.includes('futs-vrac.jpg') && r.cred.includes('Belinda Fewings') && r.cred.includes('materiel-chariot-frontal.svg') && r.cred.includes('Dessin — document pédagogique'), 'lignes de crédit');
  vrai(!/palette-retention|chariot-boissons/.test(r.source), 'une image interdite dans les questions');
});

await v('ENT-6.4 : « Le droit » cite L133-1, L133-3, R4515-4, R4323-56 et L4131-1 (source Légifrance, à relire pour L133-1 et R4323-56) ; le BL du document est celui du quai ; le corrigé est calculé depuis les palettes', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent64.js');
    const C = await import('/contenus/corriges/ENT-6.4.js');
    return { droit: S.DOCUMENTS.find((d) => d.id === 'droit').html, bl: S.DOCUMENTS.find((d) => d.id === 'bl').html, corrige: JSON.stringify(C.CORRIGE) };
  });
  for (const a of ['L133-1', 'L133-3', 'R4515-4', 'R4323-56', 'L4131-1', 'Texte de loi (réel) — source : Légifrance', 'Le voiturier est garant de la perte des objets à transporter',
    'dans les trois jours, non compris les jours fériés', 'protocole de sécurité', 'est subordonnée à l’obtention d’une autorisation de conduite délivrée par l’employeur', 'Il peut se retirer d’une telle situation']) {
    vrai(r.droit.includes(a), 'le droit : ' + a);
  }
  vrai(r.bl.includes('MON-27-0617') && r.bl.includes('Affligem Blonde fût 20 L') && r.bl.includes('Document pédagogique'), 'BL');
  vrai(/<td>31<\/td>/.test(r.bl), 'BL : total de 31 fûts (8 + 8 + 8 + 7)');
  for (const a of ['P2 AFF-20 : acceptée sous réserve — référence livrée PEL-20.', 'P3 AFF-20 : acceptée sous réserve — 1 fût endommagé (fuite).',
    'Réserves : la palette P2 est de la Pelforth Blonde au lieu de l’Affligem, et un fût d’Affligem fuit.', 'J’ai mis le fût qui fuit en zone litiges.',
    'Accepter avec réserves — Produit différent de la commande', 'Accepter avec réserves — Fût endommagé', 'Accepter — aucun motif', 'Chauffeur au volant, moteur allumé',
    'La scène n’était pas sûre', 'J’ai reçu les 4 palettes de Mons.']) vrai(r.corrige.includes(a), 'corrigé : ' + a);
  const T = JSON.parse(r.corrige).items.find((i) => i.etapeTitre === 'Contrôle des palettes').reponses;
  egal(T.map((l) => [l[0], l[2], l[3]]), [['P1', '8', '8'], ['P2', '8', '8'], ['P3', '8', '8'], ['P4', '7', '7']], 'BL et fûts réels de chaque palette');
});

await v('ENT-6.4 : titres et libellés des jalons neutres — aucun ne nomme la cabine, le moteur, le niveleur, la cale, le fût qui fuit, Pelforth ni la zone litiges', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent64.js');
    const Q = await import('/core/types/quai.js');
    return { titres: S.ETAPES.filter((e) => !/^msg-/.test(e.id)).map((e) => e.titre), libs: Q.jalonsQuai({}, S.QUAI_ENT64).L.map((l) => l.lib) };
  });
  const interdit = /cabine|moteur|volant|niveleur|cale\b|fuit|fuite|Pelforth|litige|chauffeur au|relev/i;
  vrai(![...r.titres, ...r.libs].some((t) => interdit.test(t)), [...r.titres, ...r.libs].filter((t) => interdit.test(t)).join(' | '));
});

await v('ENT-6.4 : enseignant — la séance s’ouvre (quai), rien ne remonte au suivi', async () => {
  await monter64({ role: 'prof', uid: 'prof' });
  await aller('quai');
  await pg.waitForSelector(SVG64);
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontées');
});

await pg.emulateMedia({ reducedMotion: null });

await v('ENT-6.4 : aucune erreur JavaScript', async () => {
  if (erreursF.length) throw new Error(erreursF.slice(0, 4).join(' | '));
});

await F.fermer();
}
