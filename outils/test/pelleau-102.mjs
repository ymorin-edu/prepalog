// Suite de tests de Prepalog — bloc « pelleau-102 » : Transports Pelleau ENT-10.2, mon premier jour dans l’entrepôt neuf (CAP OL, guidage
// CAP-C1.2), première séance à utiliser la vue « Inspection du poste ». `node outils/test.mjs pelleau-102` ne lance que ce bloc (un bloc par
// séance : `docs/briefs/COORDINATION-pelleau.md` §2 n° 21). Aides communes : `outils/test/pelleau/commun.mjs`. Brief :
// `docs/briefs/ENT-10.2-pelleau-premier-jour.md` §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/pelleau-premier-jour.js` → `rendre`),
// de vrais clics à la SOURIS (inspection, boutons) ; les listes des fiches par `selectOption`. Les GRAINES sont choisies ici (l’identifiant de
// l’élève) ; les valeurs attendues pour ces graines sont ÉCRITES À LA MAIN (relues dans le tirage le 19/10/2026), jamais recalculées par le
// code de la séance :
//
//   p102-b (standard) : défaut EXTINCTEUR (quai B) ; lectures l-loic-quai (→ A), l-premier-libre (→ 08:15).
//   p102-f (standard) : défaut PLAN DE CIRCULATION ; lectures l-loic-heure (→ 07:30), l-premier-libre (→ 08:15).
//   p102-a (standard) : défaut plan ; lectures l-loic-heure (→ 07:30), l-combien (→ 2) ; confirmé : même socle + bonus l-fin-agri (→ 10:00).
//
// Barème (brief §5, poids validés par Tristan le 18/10/2026 à 22 h 03) : Repérer l’entrepôt 3 (0,75 × 4) · Mon poste 7 (défaut signalé 2,5,
// avertisseur 1,5, aucun faux 1,5, en attendant 1,5) · Le planning 3 (1 × 3) · Rendre compte 3 (engin et manque 1, heure 1, salutation 0,5,
// fin 0,5) · Les questions d’Erwan 4 (A 1,5 · B 1 · C 1,5 ; D réflexion).

import { ouvrirPelleau, aidesInspection, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'pelleau-premier-jour';
const INSP = 'pelleau-poste-102';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: '/activites/pelleau-premier-jour.js', id: ID });
const { pg, Z, pause, base, note, present, texte, bandeau, entrants, clic, aller } = P;
// Les questions au fil : répond au panneau ouvert (réponse de `R`), puis « Reprendre », tant qu'il y en a une. Clics par le sélecteur (comme le
// bloc `action`) : Playwright attend que rien ne recouvre la cible (les notifications de message s'empilent en haut à droite, sur le panneau).
async function qFil(R) {
  for (let i = 0; i < 6; i++) {
    const q = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!q) return;
    vrai(R[q], `question au fil « ${q} » sans réponse prévue`);
    await pg.click(`${Z} [data-q-choix="${R[q]}"][data-q="${q}"]`);
    await pg.click(`${Z} [data-q-repondre="${q}"]`);
    await pause();
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
}
const I = aidesInspection({ ...P, vrai });
const CAPTURES = process.env.CAPTURES_ENT102 || '';

const OUV = { epi: 'protection', 'prise-poste': 'preparer', 'planning-quais': 'camions', 'allee-pietonne': 'marcher', 'rendre-compte': 'dire',
  'local-charge': 'recharger', 'img-tpe': 'tpe', 'img-extincteur': 'support', 'img-gilet': 'vu' };
const monter = (o = {}) => P.monter({ rep: OUV, ...o });
const Q_JUSTES = { 'mineur-engin': 'derogation', 'qui-affiche': 'employeur', 'retard-loic': 'erwan', 'pourquoi-controler': 'neuf' };
const Q_FAUSSES = { 'mineur-engin': 'jamais', 'qui-affiche': 'toi', 'retard-loic': 'client', 'pourquoi-controler': 'pas-pense' };
const JOURS = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;

// Valeurs ÉCRITES À LA MAIN (voir l’en-tête).
const ATTENTE = { extincteur: ['quai-a', 'noter'], affichage: ['sens', 'noter'] };
const LIRE = { 'l-loic-heure': '07:30', 'l-loic-quai': 'A', 'l-premier-libre': '08:15', 'l-combien': '2', 'l-fin-agri': '10:00' };
const CR = (manque) => ({ salutation: 'Bonjour Erwan,', engin: 'J’ai contrôlé le transpalette n° 1 : il est en ordre.', manque,
  heure: 'Loïc revient à 7 h 30 au quai A.', fin: 'Je suis au quai A. Lea' });
const MANQUE = { extincteur: 'Il manque l’extincteur du quai B : je travaille au quai A.',
  affichage: 'Le plan de circulation n’est pas affiché : Yann m’a montré le sens.' };

// Le menu ne se redessine qu’au changement d’écran : comme l’élève, on passe par la Messagerie si l’entrée n’est pas encore là.
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await clic('[data-confirme-oui]'); await pause(); } };

// ① la visite : le tour (6 arrêts dans l’ordre), puis les 4 photos ; `fautes` : photo → numéro faux cliqué d’abord.
const PHOTOS = { vestiaire: 1, reception: 3, quai: 2, bureau: 6 };
async function visite({ fautes = {} } = {}) {
  await allerV('entrepot');
  const V = `${Z} .pv`;
  await pg.click(`${V} [data-pv="suivant"]`);
  for (const n of [1, 2, 3, 4, 5, 6]) {
    if (await pg.$(`${V} [data-pv="retour"]`)) await pg.click(`${V} [data-pv="retour"]`);
    await pg.click(`${V} g[data-pv-etape="${n}"]`);
  }
  if (await pg.$(`${V} [data-pv="retour"]`)) await pg.click(`${V} [data-pv="retour"]`);
  await pg.click(`${V} [data-pv="suivant"]`);
  for (const [ph, n] of Object.entries(PHOTOS)) {
    if (fautes[ph]) await pg.click(`${V} [data-pv-num="${fautes[ph]}"]`);
    await pg.click(`${V} [data-pv-num="${n}"]`);
  }
  await pg.click(`${V} [data-pv="suivant"]`);
  await pause();
  egal(await pg.$eval(V, (e) => e.dataset.pvEtape), 'fin', 'dernière étape de la visite');
  await allerV('mail');
}
// ② le poste. `o` : { essai (essayer l’avertisseur), points (ce qu’on marque puis signale, dans l’ordre ; un tableau = un signal), Q, apres
// (fonction appelée avant la prise de poste) }.
async function poste({ essai = true, points = [['site-manque']], Q = Q_JUSTES, avant } = {}) {
  await allerV('inspection');
  if (essai) { await I.vue('charge'); await I.essai(1); await pause(); await qFil(Q); }
  for (const groupe of points) {
    for (const id of groupe) await I.cliquerPoint(id);
    await I.signaler();
    await pause();
    await qFil(Q);
  }
  if (avant) await avant();
  await I.valider();
  await pause();
}
async function enAttendant(cases) {
  await allerV('fiche');
  for (const c of cases) { await pg.check(`${Z} input[data-fiche-case="attente"][value="${c}"]`); await pause(20); }
  await clic('[data-fiche-envoyer]');
  await confirmer();
}
async function lire(rep = LIRE) {
  await allerV('fiche:lire-planning');
  const ids = await pg.$$eval(`${Z} [data-fiche="lire-planning"] select[data-fiche-champ]`, (L) => L.map((s) => s.dataset.ficheChamp));
  for (const id of ids) { await pg.selectOption(`${Z} [data-fiche-champ="${id}"]`, rep[id]); await pause(30); }
  await clic('[data-fiche-envoyer]');
  await confirmer();
  return ids;
}
// Le planning : la carte posée sur le quai `r` au créneau `t` (t = 0 à 06:00, pas de 15 min : 10 h → 16, 11 h → 20).
async function planning(r = 'A', t = 16, Q = Q_JUSTES) {
  await allerV('planning');
  await pg.click(`${Z} [data-pl-id="ar-vag"][data-pl-vue="b"]`);
  const sel = `${Z} [data-pl-grille] [data-pl-case][data-r="${r}"][data-t="${t}"]`;
  await pg.$eval(sel, (el) => el.scrollIntoView({ block: 'center', inline: 'center' }));
  await pg.click(sel, { force: true });
  await pause();
  await qFil(Q);
  await pg.click(`${Z} [data-pl="envoyer"]`);
  await pause(60);
  if (await present('[data-pl="quandMeme"]')) await pg.click(`${Z} [data-pl="quandMeme"]`);
  else if (await present('[data-confirme-oui]')) await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
}
async function ouvrirMail(sujet) {
  await allerV('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  await pg.click(`${Z} .ent-obj:text-is("${sujet}")`);
  await pause();
}
async function compteRendu(lignes, Q = Q_JUSTES) {
  await ouvrirMail('Rends-moi compte');
  await pg.click(`${Z} [data-repondre]`);
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(lignes)) {
    await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t }); await pause(30);
    await qFil(Q);
    if (await present('[data-repondre]') && !(await present('#formPhr:not([hidden])'))) await pg.click(`${Z} [data-repondre]`);
  }
  await pg.click(`${Z} #formPhr button[type="submit"]`);
  await confirmer();
  await qFil(Q);
}
// Le parcours entier. `o` : { defaut ('extincteur' | 'affichage', pour les réponses justes), fautesVisite, poste (options), attente, lire, r, t,
// cr, q }.
async function jouer(o = {}) {
  const d = o.defaut || 'extincteur';
  const Q = { ...Q_JUSTES, ...(o.q || {}) };
  await visite({ fautes: o.fautesVisite });
  await poste({ Q, ...(o.poste || {}) });
  await enAttendant(o.attente || ATTENTE[d]);
  await lire(o.lire);
  await planning(o.r || 'A', o.t == null ? 16 : o.t, Q);
  await compteRendu({ ...CR(MANQUE[d]), ...(o.cr || {}) }, Q);
  await qFil(Q);
}
const LIGNES = ['reperer-vestiaire', 'securite-site-manque', 'lecture-1', 'cr-manque', 'question:mineur-engin'];
const tout = (etat) => LIGNES.map((l) => [l, etat]);
const sauf = (ligne, etat = 'ko') => LIGNES.map((l) => [l, l === ligne ? etat : 'ok']);
// La page de test porte, sous la séance (#fTest), la page d'accueil du site : `seuleLaSeance(f)` la cache le temps de `f` (défilement,
// captures), puis la remet.
async function seuleLaSeance(f) {
  await pg.evaluate(() => [...document.body.children].forEach((e) => { if (e.id !== 'fTest') { e.dataset.cache102 = e.style.display || '-'; e.style.display = 'none'; } }));
  try { return await f(); } finally {
    await pg.evaluate(() => document.querySelectorAll('[data-cache102]').forEach((e) => { e.style.display = e.dataset.cache102 === '-' ? '' : e.dataset.cache102; delete e.dataset.cache102; }));
  }
}
const insp = async () => (((await base()).inspections || {})[ID] || {})[INSP] || null;

// ─────────────────────────────────────────────────────────── la déclaration et le registre
await v('ENT-10.2 : la séance se charge (CAP, CAP-C1.2, guidage, correction, bilan détaillé, précédente ENT-10.1) ; poids 16 + part 4 = 20 ; au registre sous l’entreprise n° 10 ; fermée aux élèves tant que l’enseignant ne l’a pas cochée', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/pelleau-premier-jour.js');
    const S = await import('/contenus/pelleau-ent102.js');
    const Q = await import('/contenus/questions/ENT-10.2.js');
    const I = await import('/activites/index.js');
    const N = await import('/core/niveaux.js');
    const socle = S.ETAPES.filter((e) => !e.bonus);
    const charges = await I.chargerActivites();
    const m = A.meta;
    return { meta: m, poids: socle.reduce((s, e) => s + e.poids, 0), ids: socle.map((e) => [e.id, e.poids]), bonus: S.ETAPES.filter((e) => e.bonus).map((e) => e.id),
      part: Q.QUESTIONS.part, notees: Q.QUESTIONS.liste.filter((q) => q.type !== 'ouverture' && !q.reflexion).map((q) => [q.id, q.poids, q.apres || '']),
      groupes: [...new Set(socle.map((e) => e.groupe))], ecrans: socle.filter((e) => e.ecran).map((e) => e.id),
      auRegistre: charges.some((a) => a.meta.id === ID), rang: charges.findIndex((a) => a.meta.id === ID) - charges.findIndex((a) => a.meta.id === 'pelleau-se-situer'),
      cap: N.activiteVisible(m, { niveau: 'cap' }), coche: N.activiteVisible(m, { niveau: 'cap', ouverts: { [ID]: true } }),
      raison: N.raisonCachee(m, { niveau: 'cap' }), autreNiveau: N.activiteVisible(m, { niveau: '1re', ouverts: {} }) };
  }, ID);
  egal([r.meta.code, r.meta.niveaux, r.meta.competences, r.meta.competencesCap, r.meta.temps, r.meta.bareme, r.meta.correction, r.meta.bilanDetail,
    r.meta.parcours, r.meta.precedente, r.meta.niveauxPrevus, r.meta.questions, r.meta.pret, r.meta.ouverture, r.meta.corrige],
  ['ENT-10.2', ['cap'], [], ['CAP-C1.2'], 'guidage', 20, true, true, true, 'pelleau-se-situer', ['confirme'], 'ENT-10.2', true, 'prof',
    './contenus/corriges/ENT-10.2.js'], 'meta');
  proche(r.poids, 16, 'somme des poids des jalons');
  egal(r.ids, [['reperer-vestiaire', 0.75], ['reperer-reception', 0.75], ['reperer-quai', 0.75], ['reperer-bureau', 0.75],
    ['securite-site-manque', 2.5], ['essai-1', 1.5], ['securite-aucun-faux', 1.5], ['en-attendant', 1.5], ['lecture-1', 1], ['lecture-2', 1], ['v1-place', 1],
    ['cr-manque', 1], ['cr-heure', 1], ['cr-salutation', 0.5], ['cr-fin', 0.5]], 'jalons et poids');
  egal([r.part, r.notees], [4, [['mineur-engin', 1.5, ''], ['qui-affiche', 1, ''], ['retard-loic', 1.5, 'bilan']]], 'part, questions notées');
  egal(r.groupes, ['Repérer l’entrepôt', 'Mon poste', 'Le planning', 'Rendre compte'], 'lignes du bandeau (hors questions)');
  egal(r.ecrans, ['en-attendant', 'lecture-1', 'lecture-2', 'v1-place', 'cr-manque', 'cr-heure', 'cr-salutation', 'cr-fin'], '« Corriger » ne rouvre ni la visite ni l’inspection');
  egal(r.bonus, ['bonus-lecture'], 'cas bonus');
  egal([r.auRegistre, r.rang], [true, 1], 'au registre, juste après ENT-10.1');
  egal([r.cap, r.raison, r.coche, r.autreNiveau], [false, 'pas encore ouverte à ce groupe', true, false], 'visibilité : fermée, puis ouverte par l’enseignant');
});

await v('ENT-10.2 : à l’ouverture — un seul message d’Erwan, daté du 5 mai 2026 à 7 h, sans jour de la semaine ; « Mon poste » fermé jusqu’à la visite ; aucun document ni message ne porte un jour de la semaine', async () => {
  const db = await monter({ uid: 'p102-b' });
  egal(db.tirage.graine, 'p102-b', 'graine de l’élève');
  egal(db.tirages[ID].pieces, { lectures: ['l-loic-quai', 'l-premier-libre'] }, 'lectures tirées');
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject]), [['Erwan', 'Ton premier jour']], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()], [2026, 4, 5, 7], 'date du message');
  vrai(/tuteur/.test(E[0].text), 'le premier message ne dit pas qu’Erwan reste le tuteur');
  const M = await P.menu();
  vrai(M.includes('fermee:inspection') && M.includes('entrepot') && !M.some((x) => /^fiche/.test(x)), 'menu au départ : ' + M.join(', '));
  const docs = await pg.evaluate(async () => { const S = await import('/contenus/pelleau-ent102.js'); return S.DOCUMENTS.map((x) => (typeof x.html === 'function' ? x.html() : x.html) + x.titre); });
  vrai(!docs.some((h) => JOURS.test(h)), 'un jour de la semaine dans un document');
});

await v('ENT-10.2 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau de fin ; poste « pris » sans aucun signal ni essai (état forcé) → les trois jalons du poste faux', async () => {
  await monter({ uid: 'p102-rien' });
  let n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
  // L'inspection figée sans rien (ce que la vue refuse en guidage, mais qu'une base pourrait porter) : aucun jalon vrai par inaction.
  await monter({ uid: 'p102-rien', db: { inspections: { [ID]: { [INSP]: { marques: [], compteur: 0, signaux: [], essais: [], arrete: false, fait: true, chef: '' } } } } });
  n = await note();
  egal(['securite-site-manque', 'essai-1', 'securite-aucun-faux'].map((k) => n.detail[k]), ['ko', 'ko', 'ko'], 'jalons du poste');
  egal(n.score, 0, 'note');
});

await v('ENT-10.2 : parcours juste, variante EXTINCTEUR (p102-b) — 20/20, bandeau ✓ ; A à l’essai de l’avertisseur, B dit l’extincteur ; l’extincteur reste absent après le signalement (non réparable) ; messages dans l’ordre, du 5 mai, sans jour de la semaine ; Loïc à 7 h 30 dans le dernier', async () => {
  await monter({ uid: 'p102-b' });
  await visite();
  await allerV('inspection');
  await I.vue('charge');
  vrai(!(await present('[data-q-panneau]')), 'une question avant l’essai');
  await I.essai(1);
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'mineur-engin', 'A à l’essai de l’avertisseur');
  await qFil(Q_JUSTES);
  egal(await I.texteDe('[data-i-essai]'), 'Tu appuies : le klaxon sonne.', 'l’avertisseur du n° 1 sonne');
  await I.cliquerPoint('site-manque');
  await I.signaler();
  await pause();
  const qb = (await base()).questions[ID]['qui-affiche'];
  vrai(qb && /extincteur/i.test(qb.texte.enonce) && !/plan de circulation/i.test(qb.texte.enonce), 'B ne dit pas SON défaut : ' + JSON.stringify(qb && qb.texte));
  await qFil(Q_JUSTES);
  egal(await I.texteDe('[data-i-chef]'), 'Erwan : « Bien vu. L’extincteur du quai B arrive après-demain. Tu me dis quand tu prends ton poste. »', 'réponse d’Erwan');
  const etats = await pg.evaluate(async ({ ID, INSP }) => {
    const V = await import('/core/types/inspection.js'); const D = await import('/contenus/pelleau-ent102-donnees.js');
    return V.etatsInspection(D.inspectionDe('p102-b'), window.__f.db.inspections[ID][INSP]);
  }, { ID, INSP });
  egal([etats.extincteur, etats.affichage, etats['transpalette-1']], ['absent', 'affiche', 'ok'], 'états dessinés après le signalement');
  await I.valider();
  await pause();
  vrai(!!(await insp()).fait, 'poste pris');
  await enAttendant(ATTENTE.extincteur);
  await lire();
  await planning('A', 16);
  await compteRendu(CR(MANQUE.extincteur));
  await qFil(Q_JUSTES);
  const n = await note();
  egal([n.score, n.max], [20, 20], 'note');
  egal(await bandeau(), tout('ok'), 'bandeau');
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject]), [['Erwan', 'Ton premier jour'], ['Erwan', 'Ton poste'], ['Erwan', 'En attendant'], ['Maëlys', 'Le planning des quais'],
    ['Maëlys', 'Le camion de la Biscuiterie'], ['Erwan', 'Rends-moi compte'], ['Erwan', 'Merci']], 'messages');
  egal(E.map((m) => m.pieces || []), [[], ['prise-de-poste', 'droit-102'], [], ['planning-doc'], [], [], []], 'pièces jointes');
  vrai(!E.some((m) => JOURS.test(`${m.subject} ${m.text} ${JSON.stringify(m.phrases || '')}`)), 'un jour de la semaine dans un message');
  vrai(E.every((m) => new Date(m.ts).getDate() === 5 && new Date(m.ts).getMonth() === 4 && new Date(m.ts).getFullYear() === 2026), 'un message hors du 5 mai 2026');
  vrai(/Loïc revient à 7 h 30 au quai A/.test(E[E.length - 1].text), 'le dernier message ne dit pas l’heure lue dans la grille');
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
});

await v('ENT-10.2 : parcours juste, variante PLAN DE CIRCULATION (p102-f) — 20/20 ; « En attendant » et la phrase « ce qui manque » sont ceux du plan ; B dit le plan ; la carte au quai B est juste ici', async () => {
  await monter({ uid: 'p102-f' });
  await visite();
  await poste();
  egal(await I.texteDe('[data-i-chef]'), 'Erwan : « Bien vu. Le plan sera affiché demain. Tu me dis quand tu prends ton poste. »', 'réponse d’Erwan');
  await allerV('fiche');
  egal(await pg.$$eval(`${Z} input[data-fiche-case="attente"]`, (L) => L.map((x) => x.value).sort()), ['dessiner', 'noter', 'ou-je-veux', 'pas-poste', 'sens'], 'choix de la fiche');
  vrai(/plan de circulation n’est pas affiché/.test(await texte()), 'la fiche ne dit pas le défaut');
  await enAttendant(ATTENTE.affichage);
  await lire();
  await planning('B', 20);
  await compteRendu(CR(MANQUE.affichage));
  await qFil(Q_JUSTES);
  egal((await note()).score, 20, 'note');
  vrai(/plan de circulation/i.test((await base()).questions[ID]['qui-affiche'].texte.enonce), 'B ne dit pas le plan');
});

await v('ENT-10.2 : inspection — défaut oublié → Erwan arrête l’élève SANS nommer le point ; signalé après l’arrêt → jalon ✗ (« après l’arrêt »), 17,5/20 ; « Corriger » ne rouvre pas l’inspection', async () => {
  await monter({ uid: 'p102-b' });
  await visite();
  await poste({ points: [], avant: async () => {
    await I.valider();
    await pause();
    const t = await I.texteDe('[data-i-arret]');
    egal(t, 'Erwan : « Attends : regarde encore ton poste avec la liste. »', 'texte de l’arrêt');
    vrai(!/extincteur|plan|quai B|transpalette|affich/i.test(t), 'l’arrêt nomme le point');
    vrai(!(await insp()).fait, 'poste pris malgré le défaut oublié');
    await I.cliquerPoint('site-manque');
    await I.signaler();
    await pause();
    await qFil(Q_JUSTES);
  } });
  await enAttendant(ATTENTE.extincteur);
  await lire();
  await planning('A', 16);
  await compteRendu(CR(MANQUE.extincteur));
  await qFil(Q_JUSTES);
  const n = await note();
  egal([n.detail['securite-site-manque'], n.detail['essai-1'], n.detail['securite-aucun-faux']], ['ko', 'ok', 'ok'], 'jalons du poste');
  proche(n.score, 17.5, 'note');
  egal(await bandeau(), sauf('securite-site-manque'), 'bandeau');
  vrai(/premier essai/.test(await pg.textContent(`${Z} [data-fin-fige]`)), 'phrase `finFige`');
  vrai(!(await pg.$$eval(`${Z} [data-fin-aller]`, (L) => L.map((x) => x.dataset.finAller))).some((x) => /inspection|entrepot/.test(x)), '« Corriger dans » vers l’inspection');
});

await v('ENT-10.2 : inspection — avertisseur pas essayé → « essai-1 » ✗ ; le point en ordre (l’autre objet du site) signalé → « aucun faux » ✗ ; 17/20', async () => {
  await monter({ uid: 'p102-b' });
  await jouer({ poste: { essai: false, points: [['site-manque'], ['site-en-ordre']] } });
  const n = await note();
  egal([n.detail['securite-site-manque'], n.detail['essai-1'], n.detail['securite-aucun-faux']], ['ok', 'ko', 'ko'], 'jalons du poste');
  proche(n.score, 17, 'note');
});

await v('ENT-10.2 : « En attendant » — tout cocher → ✗ (18,5/20) ; « Corriger » la rouvre, renvoi juste → accusé d’Erwan, note moyennée 19,25 ; la visite et l’inspection ne bougent pas', async () => {
  await monter({ uid: 'p102-b' });
  await jouer({ attente: ['quai-a', 'noter', 'quai-b', 'deplacer', 'rentrer'] });
  egal(await bandeau(), sauf('securite-site-manque'), 'bandeau');
  proche((await note()).score, 18.5, 'premier bilan');
  const avant = JSON.stringify([(await base()).inspections, (await base()).entrepots]);
  await clic('[data-fin-corriger]');
  await pause();
  const b = await base();
  egal(JSON.stringify([b.inspections, b.entrepots]), avant, 'la visite ou l’inspection a bougé');
  egal([!!b.fiches['en-attendant'].envoye, !!b.fiches['lire-planning'].envoye], [false, true], 'fiches rouvertes');
  const n0 = (await entrants()).length;
  await allerV('fiche');
  for (const c of ['quai-b', 'deplacer', 'rentrer']) { await pg.uncheck(`${Z} input[data-fiche-case="attente"][value="${c}"]`); await pause(20); }
  await clic('[data-fiche-envoyer]');
  await confirmer();
  egal((await entrants()).slice(n0).map((m) => [m.from, m.subject]), [['Erwan', 'Bien reçu']], 'accusé');
  proche((await note()).score, 19.25, 'note moyennée');
  egal(await bandeau(), tout('ok'), 'bandeau après correction');
});

await v('ENT-10.2 : planning — variante extincteur : la carte au quai B (libre, dans le créneau) → ✗ ; au quai A → ✓ ; le moteur n’y voit aucun problème (le quai B est jugé sur le défaut de l’élève)', async () => {
  await monter({ uid: 'p102-b' });
  await jouer({ r: 'B', t: 16 });
  const n = await note();
  egal(n.detail['v1-place'], 'ko', 'carte au quai B sans extincteur');
  proche(n.score, 19, 'note');
  vrai(!(await present('[data-pl-probleme]')), 'le moteur signale un problème de règle');
});

await v('ENT-10.2 : grille fixe — les lectures CALCULÉES donnent les valeurs écrites à la main, une seule bonne réponse chacune ; contrôle vert ; places justes des deux variantes ; contrôle sabotable (deux camions au même quai à la même heure)', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent102-donnees.js');
    const L = D.lecturesDe();
    const casse = D.ecartsGrille([...D.CAMIONS, { id: 'zz', quai: 'A', de: '07:30', a: '08:00', titre: 'x', court: 'x', lib: 'x' }]);
    return { justes: Object.fromEntries(Object.entries(L).map(([k, x]) => [k, x.juste])), uniques: Object.values(L).map((x) => x.justes.length),
      ecarts: D.ecartsGrille(), casse, ext: D.placesJustes('extincteur').map(([q, m]) => `${q}${m}`), aff: D.placesJustes('affichage').length };
  });
  egal(r.justes, LIRE, 'lectures');
  egal(r.uniques, [1, 1, 1, 1, 1], 'une seule bonne réponse');
  egal(r.ecarts, [], 'contrôle de la grille');
  vrai(r.casse.length > 0, 'le contrôle ne voit pas deux camions au même quai');
  egal(r.ext, ['A600', 'A615', 'A630', 'A645', 'A660'], 'places justes, variante extincteur');
  egal(r.aff, 10, 'places justes, variante plan');
});

await v('ENT-10.2 : compte rendu — la phrase « ce qui manque » de l’AUTRE défaut → ✗ ; « l’heure » de Loïc à 9 h au quai B → ✗ (ligne « Rendre compte » ✗, 18/20)', async () => {
  await monter({ uid: 'p102-b' });
  await jouer({ cr: { manque: MANQUE.affichage, heure: 'Loïc revient à 9 h au quai B.' } });
  const n = await note();
  egal([n.detail['cr-manque'], n.detail['cr-heure'], n.detail['cr-salutation'], n.detail['cr-fin']], ['ko', 'ko', 'ok', 'ok'], 'jalons du compte rendu');
  proche(n.score, 18, 'note');
  egal(await bandeau(), sauf('cr-manque'), 'bandeau');
});

await v('ENT-10.2 : questions — A et B corrigées tout de suite, C au bilan (« Merci, je note », retour avec le bandeau), D réflexion non notée ; A, B, C fausses → 16/20, ligne des questions ✗ seule', async () => {
  await monter({ uid: 'p102-b' });
  await visite();
  await allerV('inspection');
  await I.vue('charge');
  await I.essai(1);
  await pause();
  await clic('[data-q-choix="jamais"][data-q="mineur-engin"]');
  await clic('[data-q-repondre="mineur-engin"]');
  await pause();
  vrai(await present('[data-q-verdict]'), 'A : verdict tout de suite');
  await clic('[data-q-reprendre]');
  await pause();
  await I.cliquerPoint('site-manque');
  await I.signaler();
  await pause();
  await qFil(Q_FAUSSES);
  await I.valider();
  await pause();
  await enAttendant(ATTENTE.extincteur);
  await lire();
  await allerV('planning');
  await pg.click(`${Z} [data-pl-id="ar-vag"][data-pl-vue="b"]`);
  await pg.click(`${Z} [data-pl-grille] [data-pl-case][data-r="A"][data-t="16"]`, { force: true });
  await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'retard-loic', 'C à la première pose');
  await clic('[data-q-choix="client"][data-q="retard-loic"]');
  await clic('[data-q-repondre="retard-loic"]');
  await pause();
  vrai(await present('[data-q-merci]') && !(await present('[data-q-verdict]')), 'C : « Merci, je note » sans verdict');
  await clic('[data-q-reprendre]');
  await pause();
  await pg.click(`${Z} [data-pl="envoyer"]`);
  await pause(60);
  if (await present('[data-confirme-oui]')) await pg.click(`${Z} [data-confirme-oui]`);
  await pause();
  await compteRendu(CR(MANQUE.extincteur), Q_FAUSSES);
  const n = await note();
  egal(['mineur-engin', 'qui-affiche', 'retard-loic'].map((q) => n.detail[`question:${q}`]), ['ko', 'ko', 'ko'], 'questions notées');
  vrai(!Object.keys(n.detail).some((k) => /pourquoi-controler/.test(k)), 'D notée');
  egal((await base()).questions[ID]['pourquoi-controler'].premiere, 'pas-pense', 'D rangée');
  proche(n.score, 16, 'note');
  egal(await bandeau(), sauf('question:mineur-engin'), 'bandeau');
  vrai(await present('[data-fin-retour="retard-loic"]'), 'le retour de C vient avec le bandeau');
});

await v('ENT-10.2 : pire cas — tout faux (photos au premier essai, défaut signalé après l’arrêt, rien essayé, faux signalement, fiches, carte, phrases, questions) → premier bilan, 0/20, toutes les lignes ✗ ; « Corriger » proposé, `finFige`', async () => {
  await monter({ uid: 'p102-b' });
  await jouer({ fautesVisite: { vestiaire: 2, reception: 1, quai: 1, bureau: 1 }, q: Q_FAUSSES,
    poste: { essai: false, points: [['site-en-ordre']], Q: Q_FAUSSES, avant: async () => { await I.valider(); await pause(); await I.cliquerPoint('site-manque'); await I.signaler(); await pause(); await qFil(Q_FAUSSES); } },
    attente: ['quai-b'], lire: { 'l-loic-quai': 'B', 'l-premier-libre': '07:30' }, r: 'B', t: 16,
    cr: { salutation: 'Salut mon grand,', engin: 'Le transpalette n° 1 est en panne.', manque: 'Il ne manque rien.', heure: 'Loïc ne revient pas ce matin.', fin: 'Bisous' } });
  const n = await note();
  egal(n.score, 0, 'note : ' + JSON.stringify(n.detail));
  egal(await bandeau(), tout('ko'), 'bandeau');
  vrai(await present('[data-fin-corriger]'), '« Corriger » proposé');
  vrai(/ne se rejouent pas/.test(await pg.textContent(`${Z} [data-fin-fige]`)), 'phrase `finFige`');
});

await v('ENT-10.2 : tirage — stable après rechargement et sur un autre poste ; sur 300 graines, défaut moitié-moitié (entre 120 et 180), mêmes ids et même structure d’inspection, fiche et phrase « ce qui manque » conformes au défaut ; sabotage « défaut fixe » vu', async () => {
  const a = await monter({ uid: 'p102-b' });
  const b = await monter({ uid: 'p102-b', db: a });
  egal(b.tirages[ID], a.tirages[ID], 'tirage après rechargement');
  egal((await monter({ uid: 'p102-b' })).tirages[ID].pieces, a.tirages[ID].pieces, 'tirage sur un autre poste');
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent102-donnees.js');
    const V = await import('/core/types/inspection.js');
    const fautes = []; let ext = 0;
    const ref = JSON.stringify(D.inspectionDe('').points.map((p) => [p.id, p.ok]));
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}`, d = D.defautDe(g), db = { tirage: { graine: g } };
      if (d === 'extincteur') ext++;
      const X = D.inspectionDe(g);
      if (V.verifierInspection(X).length) fautes.push(`${g} : ${V.verifierInspection(X)}`);
      if (JSON.stringify(X.points.map((p) => [p.id, p.ok])) !== ref) fautes.push(`${g} : structure`);
      const m = X.points.find((p) => p.id === 'site-manque');
      if (m.objet !== d || m.etat !== 'absent' || m.reparable !== false) fautes.push(`${g} : défaut ${m.objet}`);
      const cases = D.casesAttente(db).filter((c) => c.juste).map((c) => c.v).sort().join();
      if (cases !== (d === 'extincteur' ? 'noter,quai-a' : 'noter,sens')) fautes.push(`${g} : fiche ${cases}`);
      const ph = D.phrasesCompteRendu('x', db).lignes.find((l) => l.id === 'manque');
      if (!(d === 'extincteur' ? /extincteur du quai B/ : /plan de circulation/).test(ph.choix[ph.juste])) fautes.push(`${g} : phrase ${ph.choix[ph.juste]}`);
    }
    return { fautes, ext };
  });
  if (r.fautes.length) throw new Error(r.fautes.slice(0, 5).join(' / '));
  vrai(r.ext >= 120 && r.ext <= 180, `défaut extincteur ${r.ext} fois sur 300`);
});

await v('ENT-10.2 : confirmé (p102-a) — 3 lectures, bandeau identique à un standard, mot « bonus » absent ; lecture bonus fausse → 20/20, comptée au détail', async () => {
  await monter({ uid: 'p102-a', aisance: 'confirme' });
  await visite();
  await poste();
  await enAttendant(ATTENTE.affichage);
  const ids = await lire({ ...LIRE, 'l-fin-agri': '09:00' });
  egal(ids, ['l-loic-heure', 'l-combien', 'l-fin-agri'], 'lignes de la fiche');
  await planning('A', 16);
  await compteRendu(CR(MANQUE.affichage));
  await qFil(Q_JUSTES);
  const n = await note();
  egal([n.score, await bandeau()], [20, tout('ok')], 'note et bandeau');
  egal([n.detail.bonus.justes, n.detail.bonus.total], [0, 1], 'cas bonus');
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
});

await v('ENT-10.2 : « Avant de commencer » — 3 notions + 1 image tirées et rangées, menu fermé jusqu’aux réponses, rien n’entre dans la note ; les deux dessins du kit se dessinent', async () => {
  await monter({ uid: 'p102-ouv', sansOuverture: true });
  egal((await P.menu()).filter((x) => !x.startsWith('fermee:')), ['ouverture'], 'entrées ouvertes au départ');
  const T = (await base()).questions[ID]['@tirage'];
  const rub = await pg.evaluate(async (ids) => { const Q = (await import('/contenus/questions/ENT-10.2.js')).QUESTIONS; return ids.map((id) => Q.liste.find((q) => q.id === id).rubrique); }, T.ids);
  egal(rub.slice().sort(), ['image', 'preparation', 'preparation', 'preparation'], 'rubriques tirées');
  const n = await note();
  vrai(!n || !Object.keys(n.detail).some((k) => /ouverture|epi|img-/.test(k)), 'une question d’ouverture est notée');
  const svg = await pg.evaluate(async () => { const S = await import('/contenus/pelleau-ent102.js');
    return ['dessin-engin', 'dessin-extincteur'].map((id) => { const h = S.DOCUMENTS.find((x) => x.id === id).html; return [/<svg class="pe-dessin" viewBox="[-\d. ]+"/.test(h), (h.match(/<polygon|<rect|<path/g) || []).length > 5]; }); });
  egal(svg, [[true, true], [true, true]], 'dessins');
});

await v('ENT-10.2 : socle — aucune adresse hors du site, aucune erreur JavaScript ; le corrigé se calcule pour un élève (son défaut, ses lectures, ses phrases) ; la page ne défile pas sur l’inspection à 1366 × 768, messages lus', async () => {
  await monter({ uid: 'p102-b' });
  await visite();
  await aller('mail');
  await pg.evaluate(() => window.__f.db.mails.forEach((m) => { m.read = true; }));
  await aller('accueil');
  await allerV('inspection');
  const m = await seuleLaSeance(() => pg.evaluate(() => ({ page: document.scrollingElement.scrollHeight, vue: document.querySelector('#fTest [data-i-inspection]').getBoundingClientRect().bottom, h: window.innerHeight })));
  vrai(m.page <= m.h + 1 && m.vue <= m.h, `la page défile sur l’inspection (messages lus) : ${JSON.stringify(m)}`);
  const c = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-10.2.js');
    const e = C.corrigeEleve({ tirage: { graine: 'p102-b' } }, 'p102-b');
    const f = C.corrigeEleve({}, 'p102-f');
    return { n: C.CORRIGE.items.length, b: e.items.map((x) => [x.texte, x.rep]), f: f.items.map((x) => [x.texte, x.rep]), vide: f.texte };
  });
  vrai(c.n >= 5, 'corrigé commun');
  egal(c.b[0], ['Son défaut du site', 'Extincteur absent au quai B'], 'défaut de p102-b');
  egal(c.f[0], ['Son défaut du site', 'Plan de circulation absent au quai B'], 'défaut de p102-f');
  vrai(c.b.some(([t, r]) => /phrases justes/.test(t) && /Il manque l’extincteur du quai B/.test(r) && /Loïc revient à 7 h 30 au quai A/.test(r)), 'phrases de p102-b');
  vrai(c.b.some(([t, r]) => /carte/.test(t) && !/Quai B/.test(r)), 'places de p102-b sans le quai B');
  vrai(/pas encore ouvert/.test(c.vide), 'corrigé d’un élève qui n’a pas ouvert');
  egal([...P.hotes], [], 'requêtes hors du site');
  egal(P.erreurs, [], 'erreurs JavaScript');
});

// Captures (variable d'environnement CAPTURES_ENT102 = un dossier) : accueil, inspection avant clic et après signalement, planning, bilan, à
// 1366 × 768 et 1280 × 720. Rien n'est vérifié de plus que la page sans défilement.
if (CAPTURES) {
  await v('ENT-10.2 : captures 1366 × 768 et 1280 × 720 (accueil, inspection avant et après signalement, planning, bilan)', async () => {
    for (const [w, h] of [[1366, 768], [1280, 720]]) {
      await pg.setViewportSize({ width: w, height: h });
      // Avant chaque capture, l'élève a lu ses messages (sinon les cartes « Nouveau message » s'empilent au-dessus de l'écran de travail).
      const lus = async (vue) => { await pg.evaluate(() => window.__f.db.mails.forEach((m) => { m.read = true; })); await aller('mail'); await allerV(vue); };
      const cap = (nom) => seuleLaSeance(async () => { await pg.evaluate(() => window.scrollTo(0, 0)); await pg.screenshot({ path: `${CAPTURES}/${w}x${h}-${nom}.png` }); });
      await monter({ uid: 'p102-b' });
      await lus('accueil');
      await cap('1-accueil');
      await visite();
      await allerV('inspection');
      await lus('inspection');
      await I.vue('quai');
      await cap('2-inspection-avant');
      await I.vue('charge');
      await I.essai(1); await pause(); await qFil(Q_JUSTES);
      await I.cliquerPoint('site-manque');
      await I.signaler(); await pause(); await qFil(Q_JUSTES);
      await cap('3-inspection-apres-signalement');
      const mes = await seuleLaSeance(() => pg.evaluate(() => ({ page: document.scrollingElement.scrollHeight, bandeau: Math.round(document.querySelector('#fTest .ent-bandeau').getBoundingClientRect().height),
        vue: Math.round(document.querySelector('#fTest [data-i-inspection]').getBoundingClientRect().bottom), h: window.innerHeight })));
      console.log(`    mesure ${w} × ${h} (inspection, messages lus avant d’ouvrir) : ${JSON.stringify(mes)}`);
      await I.valider(); await pause();
      await enAttendant(ATTENTE.extincteur);
      await lire();
      await lus('planning');
      await cap('4-planning');
      await planning('A', 16);
      await compteRendu(CR(MANQUE.extincteur));
      await qFil(Q_JUSTES);
      await lus('accueil');
      await cap('5-bilan');
    }
    await pg.setViewportSize({ width: 1366, height: 768 });
  });
}

await P.fermer();
}
