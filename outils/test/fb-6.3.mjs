// Suite de tests de Prepalog — bloc « fb-6.3 » : ENT-6.3 (France Boissons, les congés d’été).
// `node outils/test.mjs fb-6.3` ne lance que ce bloc. Découpé de l'ancien bloc `france-boissons` le 12/10/2026 : un bloc par
// séance (l'ensemble durait 8 min 20 et bornait toute la suite). Les cas sont ceux d'avant, déplacés tels quels ; les aides
// communes (contexte, page, relevé d'erreurs JavaScript, lecture de la base) sont dans `outils/test/france-boissons/commun.mjs`.

import { ouvrirFB } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, texte, bandeau, entrants, horodate, calcPresente, nettoyerCalc, erreursF } = F;

// ── ENT-6.3 : les congés d'été (brief `docs/briefs/ENT-6.3-france-boissons-conges.md`, rapport du lot 0) ─────────────────────────
// Même montage (la vraie séance, `activites/france-boissons-conges.js`), de vrais clics. Valeurs ÉCRITES À LA MAIN (calage du lot 0,
// `docs/briefs/france-boissons/calage-6.3.mjs`, relancé le 10/10/2026) :
//   colonnes S1 (5 juillet) à S9 (30 août) = rangs 0 à 8 ; 1er envoi juste : Amandine 2, Sébastien 4, Lucas 0 (décalé), Fatou 5,
//   Yoann 6, Kevin 7, Julien 4 ; après l'imprévu (Kevin parti, saisonnier S2-S8) : Lucas 7 (S8-S9), le reste inchangé.
//   Calage : 1er envoi 331 776 façons, 16 206 valides, minimum 1 congé décalé, 1 solution ; après l'imprévu 36 864, 1 818, 1, 1.
// Jalons : v1-/v2- effectif, cote, julien, priorite, minimum (planning) ; annonce-intitule, -contrat, -dates, -rattache ; mention-permis,
// -age, -manutention, -sexe, -nationalite, -lieu, -famille, -horaires ; msg-decision, -raison, -proposition, -salutation, -fin ;
// question:pourquoi-cdd, question:age-candidat (1,5 chacune). Poids validés par Tristan (10/10/2026), écrits à la main ci-dessous.

const ID63 = 'france-boissons-conges';
const REP63 = { 'qui-decide-conges-2': 'karim', 'besoin-semaine': 'travail', 'demande-ancienne': 'premier', 'annonce-sert': 'candidatures',
  'conges-acquis': '25', 'plafond-30': '30', 'bloc-24-jours': 'non24', 'essai-cdd': 'jours' };
const PREP63 = ['qui-decide-conges-2', 'besoin-semaine', 'demande-ancienne', 'annonce-sert'];
const DROIT63 = ['conges-acquis', 'plafond-30', 'bloc-24-jours', 'essai-cdd'];
const monter63 = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/france-boissons-conges.js');
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})['france-boissons-conges'] = db.questions['france-boissons-conges'] || {});
    for (const [id, v] of Object.entries(o.rep)) if (!Q[id]) Q[id] = { arrivee: 1, premiere: v, duree: 1 };
  }
  window.__f = { db, enregistres: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'fb63' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'FB',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }),
  });
  return JSON.parse(JSON.stringify(db));
}, { ...o, rep: REP63 });

const PLAN1 = { 'conge-amandine': 2, 'conge-sebastien': 4, 'conge-lucas': 0, 'conge-fatou': 5, 'conge-yoann': 6, 'conge-kevin': 7, 'conge-julien': 4 };
const qui63 = (id) => id.replace('conge-', '');
const BONNES63 = { 'que-regardes-tu': 'besoin', 'depart-kevin': 'demission', 'pourquoi-raison': 'comprendre', 'pourquoi-cdd': 'saison', 'age-candidat': 'non' };
const FAUSSES63 = { 'que-regardes-tu': 'rien', 'depart-kevin': 'sanction', 'pourquoi-raison': 'inutile', 'pourquoi-cdd': 'cout', 'age-candidat': 'physique' };
// Répond au panneau ouvert (puis reprend), tant qu'il y en a un.
async function qrep63(choix = BONNES63) {
  for (let i = 0; i < 4; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return;
    await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
// Pose une carte (clic sur la carte, puis sur la case de sa ligne), puis répond à la question au fil si elle arrive.
async function poser63(id, t, choix) {
  await pg.click(`${Z} [data-pl-id="${id}"][data-pl-vue="b"]`);
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${qui63(id)}"][data-t="${t}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  await pause();
  await qrep63(choix);
}
async function envoyerPlanning63() {
  await pg.click(`${Z} [data-pl="envoyer"]`);
  const c = await pg.waitForSelector(`${Z} [data-confirme]`, { timeout: 3000 }).catch(() => null);
  if (!c) throw new Error('pas de confirmation avant l’envoi du planning');
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
// Le point d'étape d'Inès après le 1er envoi (réflexion), puis « Continuer ».
async function etape63(v = 'demission') {
  await aller('etape:avant-reprise');
  await pg.click(`${Z} [data-q-choix="${v}"][data-q="depart-kevin"]`);
  await pg.click(`${Z} [data-q-repondre="depart-kevin"]`);
  await pause();
  await pg.click(`${Z} [data-q-continuer]`);
  await pause();
}
// Les deux plannings : `p1` (1er envoi) ; `p2` : les cartes à déplacer après l'imprévu (rien = renvoyé tel quel).
const PLAN2 = { 'conge-amandine': 2, 'conge-sebastien': 4, 'conge-lucas': 7, 'conge-fatou': 5, 'conge-yoann': 6, 'conge-julien': 4 };
async function plannings63(p1 = PLAN1, p2 = PLAN2, choix = BONNES63) {
  await aller('planning');
  for (const [id, t] of Object.entries(p1)) await poser63(id, t, choix);
  await envoyerPlanning63();
  await etape63(choix['depart-kevin']);
  await aller('planning');
  for (const [id, t] of Object.entries(p2)) await poser63(id, t, choix);
  await envoyerPlanning63();
}
const MSG63 = {
  salutation: 'Bonjour Lucas,',
  decision: 'Ton congé du 12 au 23 juillet ne peut pas être accordé.',
  raison: 'Avec le départ de Kevin, il faut six chauffeurs chaque semaine de juillet, et Amandine avait demandé la semaine du 19 juillet avant toi.',
  proposition: 'Karim te propose du 23 août au 3 septembre.',
  fin: 'Je reste à ta disposition. Cordialement, Lea, pour Inès',
};
async function ouvrir63(subject) {
  await aller('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  const id = await pg.evaluate((s) => window.__f.db.mails.filter((m) => m.folder === 'in' && m.subject === s).pop().id, subject);
  await pg.click(`${Z} [data-mail="${id}"]`);
  await pause();
}
// Répond par phrases au message `subject` : `m` = { ligne: texte choisi }.
async function phrases63(subject, m, choix = BONNES63) {
  await ouvrir63(subject);
  await pg.click(`${Z} [data-repondre]`);
  await pause();
  for (const [l, t] of Object.entries(m)) { await pg.selectOption(`${Z} select[data-phrase="${l}"]`, { label: t }); await pause(); await qrep63(choix); }
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await pause();
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
const ANN63 = { intitule: 'vl', contrat: 'cdd', dates: 'juste', rattache: 'karim',
  mentions: { permis: true, age: false, manutention: true, sexe: false, nationalite: false, lieu: true, famille: false, horaires: true } };
async function annonce63(a = ANN63, choix = BONNES63) {
  await aller('fiche');
  for (const k of ['intitule', 'dates', 'rattache']) await pg.selectOption(`${Z} [data-fiche-champ="${k}"]`, a[k]);
  await pg.check(`${Z} [data-fiche-champ="contrat"][value="${a.contrat}"]`);
  for (const [id, oui] of Object.entries(a.mentions)) await pg.click(`${Z} [data-ouinon="mentions|${id}|ecrire|${oui ? 1 : 0}"]`);
  await pause();
  await pg.click(`${Z} [data-fiche-envoyer]`);
  await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  if (choix) await qrep63(choix);
}
const JALONS63 = ['v1-effectif', 'v1-cote', 'v1-julien', 'v1-priorite', 'v1-minimum', 'v2-effectif', 'v2-cote', 'v2-julien', 'v2-priorite', 'v2-minimum',
  'annonce-intitule', 'annonce-contrat', 'annonce-dates', 'annonce-rattache', 'mention-permis', 'mention-age', 'mention-manutention', 'mention-sexe',
  'mention-nationalite', 'mention-lieu', 'mention-famille', 'mention-horaires', 'msg-decision', 'msg-raison', 'msg-proposition', 'msg-salutation', 'msg-fin'];
const POIDS63 = { 'v1-effectif': 1, 'v1-cote': 0.5, 'v1-julien': 0.5, 'v1-priorite': 1.5, 'v1-minimum': 1, 'v2-effectif': 1.5, 'v2-cote': 0.5, 'v2-julien': 0.5,
  'v2-priorite': 1.5, 'v2-minimum': 1.5, 'annonce-intitule': 0.5, 'annonce-contrat': 0.5, 'annonce-dates': 0.25, 'annonce-rattache': 0.25,
  'mention-permis': 0.25, 'mention-age': 0.5, 'mention-manutention': 0.25, 'mention-sexe': 0.5, 'mention-nationalite': 0.5, 'mention-lieu': 0.25,
  'mention-famille': 0.5, 'mention-horaires': 0.25, 'msg-decision': 0.5, 'msg-raison': 0.5, 'msg-proposition': 0.5, 'msg-salutation': 0.5, 'msg-fin': 0.5 };
const LIGNES63 = ['v1-effectif', 'v2-effectif', 'annonce-intitule', 'mention-permis', 'msg-decision', 'msg-salutation', 'question:pourquoi-cdd', 'question:age-candidat'];
const etats63 = (n) => JALONS63.map((j) => [j, n.detail[j]]);
const sauf63 = (faux, etat = 'ko') => JALONS63.map((j) => [j, faux.includes(j) ? etat : 'ok']);
const points63 = (faux) => 20 - faux.reduce((s, j) => s + (POIDS63[j] || 1.5), 0);
// Le parcours entier, avec des écarts : `p1`, `p2` (plannings), `msg` (lignes changées), `ann` (annonce changée), `choix` (questions).
async function parcours63(o = {}) {
  await monter63({ uid: o.uid || 'fb63' });
  await plannings63(o.p1, o.p2, o.choix || BONNES63);
  await phrases63('Mon congé d’été', { ...MSG63, ...(o.msg || {}) }, o.choix || BONNES63);
  await annonce63({ ...ANN63, ...(o.ann || {}), mentions: { ...ANN63.mentions, ...((o.ann || {}).mentions || {}) } }, o.choix || BONNES63);
  return note();
}

await v('ENT-6.3 : calage — 331 776 façons au 1er envoi, 16 206 valides, minimum 1 congé décalé, une seule solution (Lucas S1-S2) ; après l’imprévu 36 864, 1 818, 1, une seule (Lucas S8-S9) ; jugées par le vrai moteur', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent63.js');
    const { jalonsPlanning } = await import('/core/types/planning.js');
    const place = (pl) => Object.fromEntries(Object.entries(pl).map(([id, s]) => [id, { r: id.replace('conge-', ''), s }]));
    const juge = (v1, v2) => Object.fromEntries(jalonsPlanning({ plannings: { 'fb-conges': { v1: { place: place(v1) }, ...(v2 ? { v2: { place: place(v2) } } : {}) } } }, S.PLANNING).L
      .map((l) => [l.id, l.ok]));
    return { c1: S.calage(S.donneesBrutes(1)), c2: S.calage(S.donneesBrutes(2)), sol: S.SOLUTIONS,
      juste: juge(S.SOLUTIONS.v1[0], S.SOLUTIONS.v2[0]),
      amandine: [0, 3, 8].map((s) => juge({ ...S.SOLUTIONS.v1[0], 'conge-lucas': 1, 'conge-amandine': s })),
      naif: juge(Object.fromEntries(S.DEMANDES.map((c) => [c.id, c.date]))) };
  });
  egal(r.c1, { facons: 331776, valides: 16206, minimum: 1, justes: 1 }, 'calage du 1er envoi');
  egal(r.c2, { facons: 36864, valides: 1818, minimum: 1, justes: 1 }, 'calage après l’imprévu');
  egal(r.sol.v1, [{ 'conge-amandine': 2, 'conge-sebastien': 4, 'conge-lucas': 0, 'conge-fatou': 5, 'conge-yoann': 6, 'conge-kevin': 7, 'conge-julien': 4 }], 'solution du 1er envoi');
  egal(r.sol.v2, [{ 'conge-amandine': 2, 'conge-sebastien': 4, 'conge-lucas': 7, 'conge-fatou': 5, 'conge-yoann': 6, 'conge-julien': 4 }], 'solution après l’imprévu');
  egal(Object.values(r.juste), Array(10).fill(true), 'la solution juste, jugée par le moteur');
  // Amandine décalée (S1, S4 ou S9) à la place de Lucas : seule la priorité tombe.
  for (const j of r.amandine) egal([j['v1-effectif'], j['v1-cote'], j['v1-julien'], j['v1-priorite'], j['v1-minimum']], [true, true, true, false, true], 'Amandine décalée');
  // Tout à la date demandée : l'effectif manque ; priorité et minimum (reliés à l'effectif) ne sont pas gratuits.
  egal([r.naif['v1-effectif'], r.naif['v1-priorite'], r.naif['v1-minimum']], [false, false, false], 'tout à sa date');
});

await v('ENT-6.3 : ouverture — message d’Inès et ses pièces ; menu = Accueil, Messagerie, Planning des congés, Annonce (fermée) ; Kevin et la 9e semaine sur la grille, pas de « Vérifier »', async () => {
  await monter63({ uid: 'fb63-ouv' });
  const E = await entrants();
  egal(E.map((m) => [m.subject, m.pieces]), [['Les congés d’été des chauffeurs', ['cartes', 'regle', 'organigramme', 'annuaire']]], 'messages');
  egal(horodate(E[0].ts), [2027, 6, 15, 14, 5], 'heure du scénario');
  egal(await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue).filter((x) => x !== 'accueil')), ['ouverture', 'mail', 'planning'], 'menu ouvert');
  vrai(await present('[data-vue-fermee="fiche"]'), 'l’annonce n’est pas fermée avant la réponse à Lucas');
  await aller('planning');
  egal(await pg.$$eval(`${Z} [data-pl-grille] .pl-tete`, (L) => L.map((x) => x.textContent.trim())),
    ['S1 · 5 juil.', 'S2 · 12 juil.', 'S3 · 19 juil.', 'S4 · 26 juil.', 'S5 · 2 août', 'S6 · 9 août', 'S7 · 16 août', 'S8 · 23 août', 'S9 · 30 août'], 'semaines');
  egal(await pg.$$eval(`${Z} [data-pl-compte="besoin"]`, (L) => L.map((x) => x.textContent)), ['6', '6', '6', '6', '5', '5', '5', '5', '0'], 'besoin');
  egal((await pg.$$(`${Z} [data-pl-bac] [data-pl-id]`)).length, 7, 'cartes');
  vrai(!(await present('[data-pl="verifier"]')), 'bouton « Vérifier »');
  vrai(/Kevin/.test(await pg.textContent(`${Z} [data-pl-grille]`)), 'ligne de Kevin');
});

await v('ENT-6.3 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau', async () => {
  await monter63({ uid: 'fb63-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin]')), 'bandeau de fin');
});

await v('ENT-6.3 : parcours juste — 20/20 ; Kevin retiré et saisonnier à l’imprévu ; Lucas répond déçu en reprenant le message ; Karim transmet l’annonce à Hélène ; bandeau 8 lignes ✓ ; séance finie (photo)', async () => {
  await monter63({ uid: 'fb63-juste' });
  await aller('planning');
  for (const [id, t] of Object.entries(PLAN1)) await poser63(id, t);
  await envoyerPlanning63();
  vrai((await entrants()).some((m) => m.subject === 'Kevin nous quitte : planning à reprendre' && /lundi 12 juillet/.test(m.text)), 'message de l’imprévu');
  await etape63();
  await aller('planning');
  vrai(!(await present('[data-pl-id="conge-kevin"]')) && !(await present('[data-pl-case][data-r="kevin"]')), 'Kevin encore là après l’imprévu');
  egal(await pg.$$eval(`${Z} [data-pl-case][data-r="saisonnier"]`, (L) => L.map((x) => x.textContent.trim())), ['pas là', '', '', '', '', '', '', '', 'pas là'], 'saisonnier S2 à S8');
  await poser63('conge-lucas', 7);
  await envoyerPlanning63();
  vrai(await present('[data-vue-fermee="fiche"]'), 'l’annonce s’ouvre avant la réponse à Lucas');
  await phrases63('Mon congé d’été', MSG63);
  const L = (await entrants()).filter((m) => m.subject === 'RE : Mon congé d’été');
  egal(L.map((m) => m.text), ['Pas accordé… Dommage, j’avais déjà prévenu ma famille. Du 23 août au 3 septembre, c’est tard, mais je prends.\n\nLucas'], 'réponse de Lucas');
  // La réponse de l'élève à Lucas : non notée, n'importe laquelle.
  await phrases63('RE : Mon congé d’été', { comprendre: 'Ce n’est pas mon problème.', suite: 'Inès va tout arranger.', 'au-revoir': 'Bonne journée.' });
  await annonce63();
  const n = await note();
  egal([n.score, n.max], [20, 20], 'note');
  egal(etats63(n), sauf63([]), 'jalons');
  egal(await bandeau(), LIGNES63.map((l) => [l, 'ok']), 'bandeau');
  egal((await entrants()).filter((m) => m.subject === 'RE : L’annonce du chauffeur saisonnier').map((m) => m.text), ['Merci, je la transmets à Hélène pour validation.\n\nKarim'], 'réponse de Karim');
  vrai(!!(await base()).points[ID63], 'photo de fin');
});

await v('ENT-6.3 : planning du 1er envoi renvoyé tel quel après l’imprévu → les cinq jalons d’après l’imprévu faux (effectif compris), ceux du 1er envoi justes', async () => {
  const n = await parcours63({ uid: 'fb63-tel-quel', p2: {} });
  const V2 = JALONS63.filter((j) => j.startsWith('v2-'));
  egal(etats63(n), sauf63(V2), 'jalons');
  egal(n.score, points63(V2), 'note');
});

await v('ENT-6.3 : Amandine décalée en S1 au lieu de Lucas → seule la priorité du 1er envoi est fausse', async () => {
  const n = await parcours63({ uid: 'fb63-amandine', p1: { ...PLAN1, 'conge-lucas': 1, 'conge-amandine': 0 } });
  egal(etats63(n), sauf63(['v1-priorite']), 'jalons');
  egal(n.score, 18.5, 'note');
});

await v('ENT-6.3 : six congés décalés « chacun bloqué par les autres » (effectif tenu) → « le moins de congés décalés » faux au 1er envoi', async () => {
  const P6 = { 'conge-julien': 4, 'conge-amandine': 0, 'conge-sebastien': 1, 'conge-lucas': 3, 'conge-fatou': 6, 'conge-yoann': 5, 'conge-kevin': 5 };
  const n = await parcours63({ uid: 'fb63-six', p1: P6 });
  egal(etats63(n), sauf63(['v1-minimum']), 'jalons');
  egal(n.score, 19, 'note');
});

const PIEGES63 = [
  ['« Moins de 30 ans » à écrire', { ann: { mentions: { age: true } } }, ['mention-age']],
  ['CDI', { ann: { contrat: 'cdi' } }, ['annonce-contrat']],
  ['dates sans fin, rattaché à Inès', { ann: { dates: 'sans-fin', rattache: 'ines' } }, ['annonce-dates', 'annonce-rattache']],
  ['« Ton congé est annulé »', { msg: { decision: 'Ton congé du 12 au 23 juillet est annulé.' } }, ['msg-decision']],
  ['« Salut Lucas ! » et « Cordialement » seul', { msg: { salutation: 'Salut Lucas !', fin: 'Cordialement' } }, ['msg-salutation', 'msg-fin']],
];
for (const [nom, o, faux] of PIEGES63) {
  await v(`ENT-6.3 : piège ${nom} → seul${faux.length > 1 ? 's' : ''} ${faux.join(', ')} faux (${points63(faux)}/20)`, async () => {
    const n = await parcours63({ uid: 'fb63-piege', ...o });
    egal(etats63(n), sauf63(faux), 'jalons');
    egal(n.score, points63(faux), 'note');
  });
}

await v('ENT-6.3 : Lucas reprend ce qu’on lui a écrit, sans corriger (« Accepté ? », « du 5 au 16 juillet »)', async () => {
  await monter63({ uid: 'fb63-lucas' });
  await plannings63();
  await phrases63('Mon congé d’été', { ...MSG63, decision: 'Ton congé du 12 au 23 juillet est accepté.', proposition: 'Karim te propose du 5 au 16 juillet.' });
  egal((await entrants()).filter((m) => m.subject === 'RE : Mon congé d’été').map((m) => m.text),
    ['Accepté ? Super, merci ! Du 5 au 16 juillet, je vais voir si je peux changer mes réservations.\n\nLucas'], 'réponse de Lucas');
  vrai(!(await present('[data-vue-fermee="fiche"]')), 'l’annonce reste fermée après la réponse à Lucas');
});

await v('ENT-6.3 : le point d’étape d’Inès garde le planning de la reprise fermé jusqu’à la réponse (réflexion, jamais notée) ; « Continuer » rouvre', async () => {
  await monter63({ uid: 'fb63-etape' });
  await aller('planning');
  for (const [id, t] of Object.entries(PLAN1)) await poser63(id, t);
  await envoyerPlanning63();
  vrai(await present('[data-vue-fermee="planning"]'), 'le planning n’est pas fermé par le point d’étape');
  await etape63('sanction');
  vrai(!(await present('[data-vue-fermee="planning"]')), 'le planning reste fermé après la réponse');
  await aller('planning');
  vrai(await present('[data-planning="fb-conges"][data-pl-phase="2"]'), 'le planning de la reprise ne s’ouvre pas');
  vrai(!Object.keys((await note()).detail).includes('question:depart-kevin'), 'la question du départ de Kevin est notée');
});

await v('ENT-6.3 : à l’envoi de l’annonce, Karim pose ses deux questions l’une après l’autre (CDD saisonnier, puis l’âge) ; corrigées au bilan ; fausses → 17/20', async () => {
  await monter63({ uid: 'fb63-karim' });
  await plannings63();
  await phrases63('Mon congé d’été', MSG63);
  await annonce63(ANN63, null);   // aucune réponse automatique : on répond à la main
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'pourquoi-cdd', 'première question');
  await pg.click(`${Z} [data-q-choix="cout"][data-q="pourquoi-cdd"]`);
  await pg.click(`${Z} [data-q-repondre="pourquoi-cdd"]`);
  vrai(await present('[data-q-merci]') && !(await present('[data-q-verdict]')), 'corrigée tout de suite');
  await pg.click(`${Z} [data-q-reprendre]`);
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'age-candidat', 'seconde question');
  await qrep63(FAUSSES63);
  egal((await note()).score, 17, 'les deux questions fausses : 3 points de moins');
  egal(await bandeau(), LIGNES63.map((l) => [l, l.startsWith('question:') ? 'ko' : 'ok']), 'bandeau');
});

await v('ENT-6.3 : pire cas — plannings envoyés vides, tout faux (questions comprises) → premier bilan sans l’enseignant, 0/20, 8 lignes ✗, photo rangée', async () => {
  await monter63({ uid: 'fb63-pire' });
  await aller('planning');
  await envoyerPlanning63();
  await etape63('sanction');
  await aller('planning');
  await envoyerPlanning63();
  await phrases63('Mon congé d’été', { salutation: 'Salut Lucas !', decision: 'Ton congé du 12 au 23 juillet est accepté.', raison: 'Karim ne veut pas que tu partes du 12 au 23 juillet.',
    proposition: 'Tu n’auras pas de congé cet été.', fin: 'Cordialement' }, FAUSSES63);
  await annonce63({ intitule: 'pl', contrat: 'stage', dates: 'tot', rattache: 'nadia',
    mentions: { permis: false, age: true, manutention: false, sexe: true, nationalite: true, lieu: false, famille: true, horaires: false } }, FAUSSES63);
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  egal(etats63(n), sauf63(JALONS63), 'jalons');
  egal(await bandeau(), LIGNES63.map((l) => [l, 'ko']), 'bandeau');
  vrai(await present('[data-fin]'), 'pas de bandeau de fin');
  vrai(!!(await base()).points[ID63], 'pas de photo : la séance suivante ne s’ouvrirait pas');
});

await v('ENT-6.3 : « Avant de commencer » — 4 questions tirées (2 + 2), la calculette ; deux élèves n’ont pas toutes les mêmes ; menu ouvert après les réponses', async () => {
  await nettoyerCalc();
  await monter63({ sansOuverture: true, uid: 'fb63-ouv-1' });
  vrai(await present('[data-ouverture="avant-de-commencer"]'), 'la séance ne s’ouvre pas sur « Avant de commencer »');
  vrai(await calcPresente(), 'calculette absente');
  const t1 = (await base()).questions[ID63]['@tirage'].ids;
  egal([t1.filter((i) => PREP63.includes(i)).length, t1.filter((i) => DROIT63.includes(i)).length, t1.length], [2, 2, 4], 'répartition : ' + t1);
  for (let k = 0; k < t1.length; k++) {
    await pg.click(`${Z} [data-ouv-aller="${k}"]`); await pause();
    await pg.click(`${Z} [data-q-choix="${REP63[t1[k]]}"][data-q="${t1[k]}"]`);
    await pg.click(`${Z} [data-q-repondre="${t1[k]}"]`);
    await pause();
  }
  vrai((await pg.$$eval(`${Z} .ent-nav[data-vue]`, (L) => L.map((x) => x.dataset.vue))).includes('planning'), 'menu fermé après les réponses');
  egal((await note()).score, 0, 'l’ouverture ne compte pas');
  const R = new Set();
  for (const uid of ['fb63-a', 'fb63-b', 'fb63-c', 'fb63-d']) { await monter63({ sansOuverture: true, uid }); R.add((await base()).questions[ID63]['@tirage'].ids.slice().sort().join()); }
  vrai(R.size > 1, 'quatre élèves ont exactement les mêmes questions');
  await nettoyerCalc();
});

await v('ENT-6.3 : banque d’ouverture — toute la banque sort sur 300 graines ; valeurs tirées justes pour 50 graines (demande-ancienne, conges-acquis, plafond-30, essai-cdd)', async () => {
  const r = await pg.evaluate(async () => {
    const { compilerQuestions, tirerOuverture } = await import('/core/types/questions.js');
    const { QUESTIONS } = await import('/contenus/questions/ENT-6.3.js');
    const M = compilerQuestions(QUESTIONS, null, ['cartes', 'regle', 'annuaire', 'fiche-de-poste', 'droit']);
    const T = [];
    for (let s = 0; s < 300; s++) { const t = tirerOuverture(M, `graine-${s}`); T.push({ ids: t.ids, q: t.q }); }
    return T;
  });
  egal([...new Set(r.flatMap((t) => t.ids))].sort(), [...PREP63, ...DROIT63].sort(), 'toute la banque sort');
  const MOIS = { février: 1, mars: 2, avril: 3, mai: 4 };
  const de = (id) => r.filter((t) => t.q[id]).slice(0, 50).map((t) => t.q[id]);
  const n = (x) => String(x).replace('.', ',');
  for (const [id, verifier] of [
    ['demande-ancienne', (q) => {
      const m = /(\S+) a demandé le (1er|\d+) (\S+), (\S+) le (1er|\d+) (\S+)\./.exec(q.enonce);
      vrai(!!m, 'énoncé : ' + q.enonce);
      const d = (j, mo) => MOIS[mo] * 100 + (j === '1er' ? 1 : Number(j));
      vrai(MOIS[m[3]] >= 2 && MOIS[m[6]] >= 2, 'mois hors de mars à mai : ' + q.enonce);
      const [premier, second] = d(m[2], m[3]) < d(m[5], m[6]) ? [m[1], m[4]] : [m[4], m[1]];
      egal([q.libs.premier, q.libs.second], [premier, second], 'qui garde sa date');
      vrai(!['Lucas', 'Amandine', 'Julien', 'Sébastien', 'Fatou', 'Yoann', 'Kevin'].includes(premier) && !['Lucas', 'Amandine', 'Julien', 'Sébastien', 'Fatou', 'Yoann', 'Kevin'].includes(second), 'prénom de l’équipe');
    }],
    ['conges-acquis', (q) => {
      const m = Number(/depuis (\d+) mois/.exec(q.enonce)[1]);
      vrai(m >= 2 && m <= 10 && m % 2 === 0, 'mois : ' + m);
      egal([q.libs['25'], q.libs['2'], q.libs['1']], [`${n(m * 2.5)} jours ouvrables`, `${m * 2} jours ouvrables`, `${m} jours ouvrables`], 'choix');
    }],
    ['plafond-30', (q) => {
      const m = Number(/travaillé (\d+) mois/.exec(q.enonce)[1]);
      vrai(m >= 13 && m <= 16, 'mois : ' + m);
      egal([q.libs['30'], q.libs.calcul], ['30 jours ouvrables', `${n(m * 2.5)} jours ouvrables`], 'choix');
    }],
    ['essai-cdd', (q) => {
      const w = Number(/CDD de (\d+) semaines/.exec(q.enonce)[1]);
      vrai([3, 4, 5, 8, 9, 10, 12].includes(w), 'semaines : ' + w);
      egal(q.libs.jours, `${w} jours`, 'bonne réponse');
    }],
  ]) {
    const L = de(id);
    egal(L.length, 50, `tirages de ${id}`);
    L.forEach(verifier);
    vrai(new Set(L.map((q) => q.enonce)).size > 3, `${id} : les valeurs ne varient pas`);
  }
});

await v('ENT-6.3 : barème — jalons du socle 17 (aucun à 0), questions notées 3 ; « Le droit » cite L3141-3, L3141-17, L1242-10, L1242-2 et L1132-1 (source Légifrance) ; corrigé calculé', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/france-boissons-ent63.js');
    const C = await import('/contenus/corriges/ENT-6.3.js');
    const droit = S.DOCUMENTS.find((d) => d.id === 'droit').html;
    return { poids: Object.fromEntries(S.ETAPES.map((e) => [e.id, e.poids])), droit, corrige: JSON.stringify(C.CORRIGE) };
  });
  egal(r.poids, POIDS63, 'poids');
  for (const a of ['L3141-3', 'L3141-17', 'L1242-10', 'L1242-2', 'L1132-1', 'Texte de loi (réel) — source : Légifrance']) vrai(r.droit.includes(a), 'le droit : ' + a);
  vrai(/deux jours et demi ouvrables par mois/.test(r.droit) && /vingt-quatre jours ouvrables/.test(r.droit) && /un jour par semaine/.test(r.droit), 'textes');
  vrai(r.corrige.includes('du 23 août au 3 septembre') && r.corrige.includes('du 5 au 16 juillet') && r.corrige.includes('CDD saisonnier'), 'corrigé');
});

await v('ENT-6.3 : enseignant — la séance s’ouvre (planning, annonce), rien ne remonte au suivi', async () => {
  await monter63({ role: 'prof', uid: 'prof' });
  await aller('planning');
  vrai(await present('[data-planning="fb-conges"]'), 'planning');
  await aller('fiche');
  vrai(await present('[data-fiche-envoyer]') || /Annonce/.test(await texte()), 'annonce');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontées');
});

await v('ENT-6.3 : aucune erreur JavaScript', async () => {
  if (erreursF.length) throw new Error(erreursF.slice(0, 4).join(' | '));
});

await F.fermer();
}
