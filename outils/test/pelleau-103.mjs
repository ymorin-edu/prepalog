// Suite de tests de Prepalog — bloc « pelleau-103 » : Transports Pelleau ENT-10.3, on commence quand même ? (CAP OL, entraînement CAP-C1.2, erreur induite
// tirée : « le site n'est pas fini » ou « l'engin n'a pas été contrôlé »). `node outils/test.mjs pelleau-103` ne lance que ce bloc (un bloc par séance :
// `docs/briefs/COORDINATION-pelleau.md` §2 n° 21). Aides communes : `outils/test/pelleau/commun.mjs` (`ouvrirPelleau`, `aidesInspection`, `qFilSelecteur`).
// Brief : `docs/briefs/ENT-10.3-pelleau-on-commence-quand-meme.md` §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/pelleau-on-commence-quand-meme.js` → `rendre`), de
// vrais clics à la SOURIS (inspection, dialogues, boutons) ; les listes de la fiche et des phrases par `selectOption`. Les GRAINES sont choisies ici
// (l'identifiant de l'élève) ; les valeurs attendues pour ces graines sont ÉCRITES À LA MAIN (relues dans le tirage le 19/10/2026), jamais recalculées par le
// code de la séance :
//
//   p103-b : variante S, extincteur du quai B absent.        p103-g : variante S, plan de circulation du quai B absent.
//   p103-a : variante E, arrêt d'urgence du n° 2 absent.      p103-f : variante E, avertisseur du n° 2 MUET (seul l'essai le montre).
//   p103-c : variante E, fuite sous le n° 2.                  p103-n : variante E, batterie du n° 2 pas chargée.
//
// Barème (brief §5, poids validés par Tristan le 18/10/2026 à 22 h 03) : Avant le premier geste 1,5 (la bonne réponse à Yann dès la première réponse) ·
// Mon poste 6 (défaut signalé 3,5, avertisseur n° 1 0,5, avertisseur n° 2 0,5, aucun faux 1,5) · Ne pas céder 3 · Signaler par écrit 3 (1 × 3) · Rendre
// compte 2,5 (vu 0,75, fait 0,75, salutation 0,5, fin 0,5) · Les questions d'Erwan 4 (A 1,5 · B 1 · C 1,5 ; D réflexion).

import { ouvrirPelleau, aidesInspection, qFilSelecteur, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'pelleau-on-commence-quand-meme';
const INSP = 'pelleau-poste-103';
const D1 = 'pelleau-yann-103-1', D2 = 'pelleau-yann-103-2';
const FS = 'signalement-103';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: '/activites/pelleau-on-commence-quand-meme.js', id: ID });
const { pg, Z, pause, base, note, present, texte, bandeau, entrants, clic, aller } = P;
const qFil = qFilSelecteur(P, vrai);
const I = aidesInspection({ ...P, vrai });
const CAPTURES = process.env.CAPTURES_ENT103 || '';

const OUV = { epi: 'protection', consigner: 'eviter', 'planning-quais': 'camions', 'allee-pietonne': 'marcher', 'rendre-compte': 'dire',
  'local-charge': 'recharger', 'img-fourche': 'soulever', 'img-batterie': 'recharger' };
const monter = (o = {}) => P.monter({ rep: OUV, ...o });
const Q_JUSTES = { l4122: 'chacun', 'qui-repare': 'entreprise', 'pourquoi-ecrire': 'trace', 'le-plus-dur': 'dire-non' };
const Q_FAUSSES = { l4122: 'ancien', 'qui-repare': 'toi', 'pourquoi-ecrire': 'accuser', 'le-plus-dur': 'rien' };
const JOURS = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;
const REPONSE_ERWAN = 'Erwan : « Reçu. Je lis ça à ma sortie de réunion. »';

// Valeurs ÉCRITES À LA MAIN (voir l’en-tête) : par élève, le défaut, la fiche juste, les phrases justes, la réplique juste de Yann (2e rencontre).
const FICHE_E = (cle) => ({ quoi: cle, pas: 'tp2', fait: 'tp1' });
const PH_E = 'J’ai pris le n° 1 et mis le n° 2 de côté.';
const EL = {
  b: { uid: 'p103-b', variante: 'S', defaut: 'extincteur', fiche: { quoi: 'extincteur', pas: 'quai-b', fait: 'quai-a' }, vu: 'Il manque l’extincteur du quai B.',
    fait: 'On a travaillé au quai A, où il y a un extincteur.', dit: /L’extincteur du quai B arrive cette semaine/, refuse: 'On travaille au quai A, où il y en a un, et je préviens Erwan par écrit.',
    ordre: ['ordre-1', 'ordre-2'] },
  g: { uid: 'p103-g', variante: 'S', defaut: 'affichage', fiche: { quoi: 'affichage', pas: 'sens', fait: 'sens-montre' }, vu: 'Le plan de circulation du quai B n’est pas affiché.',
    fait: 'Yann m’a montré le sens de circulation.', dit: /Le plan de circulation sera affiché cette semaine/,
    refuse: 'Montre-moi le sens de circulation, et je préviens Erwan par écrit.', ordre: ['ordre-1', 'ordre-2'] },
  a: { uid: 'p103-a', variante: 'E', defaut: 'arretUrgence', fiche: FICHE_E('arretUrgence'), vu: 'Le transpalette n° 2 n’a plus son bouton d’arrêt d’urgence.', fait: PH_E,
    dit: /Le n° 2 marche, roule doucement/, refuse: 'Je prends le n° 1, je l’ai contrôlé. Le n° 2, je le mets de côté avec un mot pour Erwan.', ordre: ['ordre-1', 'ordre-2'] },
  f: { uid: 'p103-f', variante: 'E', defaut: 'avertisseur', fiche: FICHE_E('avertisseur'), vu: 'L’avertisseur du transpalette n° 2 ne sonne pas.', fait: PH_E,
    dit: /Le n° 2 marche, roule doucement/, refuse: 'Je prends le n° 1, je l’ai contrôlé. Le n° 2, je le mets de côté avec un mot pour Erwan.', ordre: ['ordre-1', 'ordre-2'] },
  c: { uid: 'p103-c', variante: 'E', defaut: 'fuite', fiche: FICHE_E('fuite'), vu: 'Le transpalette n° 2 fuit : il y a une flaque dessous.', fait: PH_E,
    dit: /Le n° 2 marche/, refuse: 'Je prends le n° 1, je l’ai contrôlé. Le n° 2, je le mets de côté avec un mot pour Erwan.', ordre: ['ordre-1', 'ordre-2'] },
  n: { uid: 'p103-n', variante: 'E', defaut: 'batterie', fiche: FICHE_E('batterie'), vu: 'Le transpalette n° 2 a une batterie pas chargée.', fait: PH_E,
    dit: /Le n° 2 marche/, refuse: 'Je prends le n° 1, je l’ai contrôlé. Le n° 2, je le mets de côté avec un mot pour Erwan.', ordre: ['ordre-1', 'ordre-2'] },
};
const CR = (e) => ({ salutation: 'Bonjour Erwan,', vu: e.vu, fait: e.fait, fin: 'À tout à l’heure. Lea' });

// Le menu ne se redessine qu’au changement d’écran : comme l’élève, on passe par la Messagerie si l’entrée n’est pas encore là.
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const confirmer = async () => { await pg.waitForSelector(`${Z} [data-confirme-oui]`, { timeout: 700 }).catch(() => null); if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); } };
const dire = async (val) => { await pg.click(`${Z} [data-dlg-choix="${val}"]`); await pause(); };

// ① / ③ Yann : `reponses` = les réponses cliquées dans l’ordre (la dernière doit clore la réplique), puis « Terminer ».
async function yann(dialogue, reponses) {
  await allerV('telephone');
  await pg.click(`${Z} [data-dlg-appeler="${dialogue}"]`); await pause();
  for (const r of reponses) await dire(r);
  await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
}
// ② le poste. `essais` : les n° dont on essaie l’avertisseur ; `points` : ce qu’on marque puis signale, un tableau = un signal.
async function poste({ essais = [1, 2], points = [['defaut']], Q = Q_JUSTES } = {}) {
  await allerV('inspection');
  if (essais.length) await I.vue('charge');
  for (const n of essais) { await I.essai(n); await pause(); }
  for (const groupe of points) {
    for (const id of groupe) await I.cliquerPoint(id);
    await I.signaler();
    await pause();
  }
  await I.valider();
  await pause();
  await qFil(Q);
}
async function fiche(vals, Q = Q_JUSTES) {
  await allerV('fiche');
  for (const [c, x] of Object.entries(vals)) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, x); await pause(30); await qFil(Q); }
  await clic('[data-fiche-envoyer]');
  await confirmer();
  await qFil(Q);
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
// Le parcours entier. `o` : { y1 (réponses à Yann, 1re rencontre), y2, poste (options), fiche, cr, q }.
async function jouer(e, o = {}) {
  const Q = { ...Q_JUSTES, ...(o.q || {}) };
  await yann(D1, o.y1 || ['controle']);
  await poste({ Q, ...(o.poste || {}) });
  await yann(D2, o.y2 || ['refuse']);
  await fiche({ ...e.fiche, ...(o.fiche || {}) }, Q);
  await compteRendu({ ...CR(e), ...(o.cr || {}) }, Q);
  await qFil(Q);
}
const LIGNES = ['controle-d-abord', 'securite-defaut', 'ne-pas-ceder', 'signalement-quoi', 'cr-vu', 'question:l4122'];
const tout = (etat) => LIGNES.map((l) => [l, etat]);
const sauf = (ligne, etat = 'ko') => LIGNES.map((l) => [l, l === ligne ? etat : 'ok']);
const JALONS = ['controle-d-abord', 'securite-defaut', 'essai-1', 'essai-2', 'securite-aucun-faux', 'ne-pas-ceder', 'signalement-quoi', 'signalement-pas', 'signalement-fait',
  'cr-vu', 'cr-fait', 'cr-salutation', 'cr-fin'];
const faux = (n) => JALONS.filter((j) => n.detail[j] !== 'ok');
// La page de test porte, sous la séance (#fTest), la page d'accueil du site : `seuleLaSeance(f)` la cache le temps de `f`, puis la remet.
async function seuleLaSeance(f) {
  await pg.evaluate(() => [...document.body.children].forEach((e) => { if (e.id !== 'fTest') { e.dataset.cache103 = e.style.display || '-'; e.style.display = 'none'; } }));
  try { return await f(); } finally {
    await pg.evaluate(() => document.querySelectorAll('[data-cache103]').forEach((e) => { e.style.display = e.dataset.cache103 === '-' ? '' : e.dataset.cache103; delete e.dataset.cache103; }));
  }
}
const insp = async () => (((await base()).inspections || {})[ID] || {})[INSP] || null;

// ─────────────────────────────────────────────────────────── la déclaration et le registre
await v('ENT-10.3 : la séance se charge (CAP, CAP-C1.2, entraînement, correction, bilan détaillé, précédente ENT-10.2) ; poids 16 + part 4 = 20 ; au registre sous ENT-10.2 ; fermée aux élèves tant que l’enseignant ne l’a pas cochée', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/pelleau-on-commence-quand-meme.js');
    const S = await import('/contenus/pelleau-ent103.js');
    const Q = await import('/contenus/questions/ENT-10.3.js');
    const I = await import('/activites/index.js');
    const N = await import('/core/niveaux.js');
    const socle = S.ETAPES.filter((e) => !e.bonus);
    const charges = await I.chargerActivites();
    const m = A.meta;
    return { meta: m, poids: socle.reduce((s, e) => s + e.poids, 0), ids: socle.map((e) => [e.id, e.poids]), bonus: S.ETAPES.filter((e) => e.bonus).length,
      part: Q.QUESTIONS.part, notees: Q.QUESTIONS.liste.filter((q) => q.type !== 'ouverture' && !q.reflexion).map((q) => [q.id, q.poids, q.apres || '']),
      groupes: [...new Set(socle.map((e) => e.groupe))], ecrans: socle.filter((e) => e.ecran).map((e) => e.id),
      auRegistre: charges.some((a) => a.meta.id === ID), rang: charges.findIndex((a) => a.meta.id === ID) - charges.findIndex((a) => a.meta.id === 'pelleau-premier-jour'),
      cap: N.activiteVisible(m, { niveau: 'cap' }), coche: N.activiteVisible(m, { niveau: 'cap', ouverts: { [ID]: true } }),
      raison: N.raisonCachee(m, { niveau: 'cap' }), autreNiveau: N.activiteVisible(m, { niveau: '1re', ouverts: {} }) };
  }, ID);
  egal([r.meta.code, r.meta.niveaux, r.meta.competences, r.meta.competencesCap, r.meta.temps, r.meta.bareme, r.meta.correction, r.meta.bilanDetail,
    r.meta.parcours, r.meta.precedente, r.meta.niveauxPrevus, r.meta.questions, r.meta.corrige],
  ['ENT-10.3', ['cap'], [], ['CAP-C1.2'], 'entrainement', 20, true, true, true, 'pelleau-premier-jour', ['confirme'], 'ENT-10.3', './contenus/corriges/ENT-10.3.js'], 'meta');
  proche(r.poids, 16, 'somme des poids des jalons');
  egal(r.ids, [['controle-d-abord', 1.5], ['securite-defaut', 3.5], ['essai-1', 0.5], ['essai-2', 0.5], ['securite-aucun-faux', 1.5], ['ne-pas-ceder', 3],
    ['signalement-quoi', 1], ['signalement-pas', 1], ['signalement-fait', 1], ['cr-vu', 0.75], ['cr-fait', 0.75], ['cr-salutation', 0.5], ['cr-fin', 0.5]], 'jalons et poids');
  egal([r.part, r.notees, r.bonus], [4, [['l4122', 1.5, 'bilan'], ['qui-repare', 1, ''], ['pourquoi-ecrire', 1.5, '']], 0], 'part, questions notées, aucun bonus');
  egal(r.groupes, ['Avant le premier geste', 'Mon poste', 'Ne pas céder', 'Signaler par écrit', 'Rendre compte'], 'lignes du bandeau (hors questions)');
  egal(r.ecrans, ['signalement-quoi', 'signalement-pas', 'signalement-fait', 'cr-vu', 'cr-fait', 'cr-salutation', 'cr-fin'], '« Corriger » ne rouvre ni les dialogues ni l’inspection');
  egal([r.auRegistre, r.rang], [true, 1], 'au registre, juste après ENT-10.2');
  egal([r.cap, r.raison, r.coche, r.autreNiveau], [false, 'pas encore ouverte à ce groupe', true, false], 'visibilité : fermée, puis ouverte par l’enseignant');
});

await v('ENT-10.3 : à l’ouverture — un seul message d’Erwan, de la veille (5 mai 2026, 18 h), sans jour de la semaine ; « Mon poste » fermé jusqu’à la première rencontre avec Yann ; aucun document ni message ne porte un jour de la semaine', async () => {
  const db = await monter({ uid: EL.b.uid });
  egal(db.tirage.graine, 'p103-b', 'graine de l’élève');
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject]), [['Erwan', 'Demain matin']], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()], [2026, 4, 5, 18], 'date du message');
  vrai(/réunion jusqu’à 8 h/.test(E[0].text) && /écris-le-moi/.test(E[0].text), 'le message d’Erwan : ' + E[0].text);
  egal(E[0].pieces, ['prise-de-poste-103', 'droit-103'], 'pièces jointes du standard');
  const M = await P.menu();
  vrai(M.includes('fermee:inspection') && M.includes('telephone') && !M.some((x) => /^fiche/.test(x)), 'menu au départ : ' + M.join(', '));
  const docs = await pg.evaluate(async () => { const S = await import('/contenus/pelleau-ent103.js'); return S.DOCUMENTS.map((x) => (typeof x.html === 'function' ? x.html() : x.html) + x.titre); });
  vrai(!docs.some((h) => JOURS.test(h)), 'un jour de la semaine dans un document');
});

await v('ENT-10.3 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau de fin ; poste « pris » sans signal ni essai (état forcé) → les quatre jalons du poste faux', async () => {
  await monter({ uid: EL.b.uid });
  let n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
  await monter({ uid: EL.b.uid, db: { inspections: { [ID]: { [INSP]: { marques: [], compteur: 0, signaux: [], essais: [], arrete: false, fait: true, chef: '' } } } } });
  n = await note();
  egal(['securite-defaut', 'essai-1', 'essai-2', 'securite-aucun-faux'].map((k) => n.detail[k]), ['ko', 'ko', 'ko', 'ko'], 'jalons du poste');
  egal(n.score, 0, 'note');
});

// ─────────────────────────────────────────────────────────── les parcours justes, une graine par défaut
for (const k of ['b', 'g']) {
  await v(`ENT-10.3 : parcours juste, variante S « le site n’est pas fini » (${EL[k].uid}, ${EL[k].defaut}) — 20/20, bandeau ✓ ; Yann dit le défaut du site de l’élève ; l’objet reste absent après le signalement ; Erwan répond la même chose ; messages dans l’ordre, du 6 mai`, async () => {
    const e = EL[k];
    await monter({ uid: e.uid });
    await yann(D1, ['controle']);
    await allerV('inspection');
    vrai(!(await present('[data-q-panneau]')), 'une question avant le contrôle');
    await I.vue('charge');
    await I.essai(1); await I.essai(2);
    egal(await I.texteDe('[data-i-essai]'), 'Tu appuies : le klaxon sonne.', 'l’avertisseur du n° 2 sonne');
    await I.cliquerPoint('defaut');
    await I.signaler();
    await pause();
    egal(await I.texteDe('[data-i-chef]'), REPONSE_ERWAN, 'réponse d’Erwan');
    const etats = await pg.evaluate(async ({ ID, INSP, uid }) => {
      const V = await import('/core/types/inspection.js'); const D = await import('/contenus/pelleau-ent103-donnees.js');
      return V.etatsInspection(D.inspectionDe(uid), window.__f.db.inspections[ID][INSP]);
    }, { ID, INSP, uid: e.uid });
    egal(etats[e.defaut], 'absent', 'l’objet reste absent après le signalement (non réparable)');
    egal(etats['transpalette-2'], 'ok', 'le transpalette n° 2 est en ordre en variante S');
    vrai(!(await present('[data-i-arret]')), 'un arrêt');
    await I.valider();
    await pause();
    egal(await I.texteDe('[data-i-fige]'), 'Tu as pris ton poste : l’inspection est figée.', 'poste pris');
    await qFil(Q_JUSTES);
    await yann(D2, ['refuse']);
    await fiche(e.fiche);
    await compteRendu(CR(e));
    await qFil(Q_JUSTES);
    const n = await note();
    egal([n.score, n.max], [20, 20], 'note');
    egal(await bandeau(), tout('ok'), 'bandeau');
    const E = await entrants();
    egal(E.map((m) => [m.from, m.subject]), [['Erwan', 'Demain matin'], ['Yann', 'Alors ?'], ['Erwan', 'Ta fiche'], ['Erwan', 'Rends-moi compte'], ['Erwan', 'Merci']], 'messages');
    vrai(!E.some((m) => JOURS.test(`${m.subject} ${m.text} ${JSON.stringify(m.phrases || '')}`)), 'un jour de la semaine dans un message');
    vrai(E.slice(1).every((m) => new Date(m.ts).getDate() === 6 && new Date(m.ts).getMonth() === 4 && new Date(m.ts).getFullYear() === 2026), 'un message hors du 6 mai 2026');
    vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
  });
}

for (const k of ['f', 'a']) {
  await v(`ENT-10.3 : parcours juste, variante E « l’engin n’a pas été contrôlé » (${EL[k].uid}, ${EL[k].defaut}) — 20/20 ; ${k === 'f' ? 'l’avertisseur du n° 2 est MUET (seul l’essai le montre), le n° 1 sonne' : 'le défaut se voit sur le n° 2 (arrêt d’urgence absent)'} ; Yann parle du n° 2`, async () => {
    const e = EL[k];
    await monter({ uid: e.uid });
    await yann(D1, ['controle']);
    await allerV('inspection');
    await I.vue('charge');
    await I.essai(1);
    egal(await I.texteDe('[data-i-essai]'), 'Tu appuies : le klaxon sonne.', 'l’avertisseur du n° 1 sonne');
    await I.essai(2);
    egal(await I.texteDe('[data-i-essai]'), k === 'f' ? 'Tu appuies : rien ne sonne.' : 'Tu appuies : le klaxon sonne.', 'l’avertisseur du n° 2');
    await I.cliquerPoint('defaut'); await I.signaler(); await pause();
    await I.valider(); await pause(); await qFil(Q_JUSTES);
    await allerV('telephone');
    await pg.click(`${Z} [data-dlg-appeler="${D2}"]`); await pause();
    vrai(e.dit.test(await pg.textContent(`${Z} [data-dlg-fil]`)), 'Yann ne dit pas le texte du défaut : ' + await pg.textContent(`${Z} [data-dlg-fil]`));
    await dire('refuse');
    egal((await pg.textContent(`${Z} [data-dlg-fil]`)).includes(e.refuse), true, 'la réponse juste est calculée sur le défaut');
    await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
    await fiche(e.fiche);
    await compteRendu(CR(e));
    await qFil(Q_JUSTES);
    const n = await note();
    egal([n.score, await bandeau()], [20, tout('ok')], 'note et bandeau ' + JSON.stringify(n.detail));
    vrai((await base()).questions[ID]['qui-repare'].texte.enonce === (k === 'f' || k === 'a' ? 'Qui fait réparer le transpalette n° 2 ?' : ''), 'B ne dit pas SON défaut : ' + JSON.stringify((await base()).questions[ID]['qui-repare'].texte));
  });
}

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-10.3 : tirage — stable après rechargement ; sur 300 graines, S et E entre 40 et 60 %, chaque défaut E au moins 10 fois, chaque défaut S au moins 40 ; mêmes ids d’inspection, fiche, phrases et réplique de Yann conformes au défaut', async () => {
  const a = await monter({ uid: EL.b.uid });
  const b = await monter({ uid: EL.b.uid, db: a });
  egal(b.tirage, a.tirage, 'graine après rechargement');
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent103-donnees.js');
    const V = await import('/core/types/inspection.js');
    const fautes = [], nb = { S: 0, E: 0 }, defs = {};
    const ref = JSON.stringify(D.inspectionDe('').points.map((p) => [p.id, p.ok]).sort());
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}`, jeu = D.jeuDe(g), db = { tirage: { graine: g } }, d = D.D(jeu.defaut);
      nb[jeu.variante]++; defs[jeu.defaut] = (defs[jeu.defaut] || 0) + 1;
      if ((jeu.variante === 'S') !== (d.genre === 'site')) fautes.push(`${g} : variante ${jeu.variante} pour ${jeu.defaut}`);
      const X = D.inspectionDe(g);
      if (V.verifierInspection(X).length) fautes.push(`${g} : ${V.verifierInspection(X)}`);
      if (JSON.stringify(X.points.map((p) => [p.id, p.ok]).sort()) !== ref) fautes.push(`${g} : structure`);
      const m = X.points.find((p) => p.id === 'defaut');
      if (m.etat !== d.etat || m.reparable !== false || m.ok !== false) fautes.push(`${g} : défaut ${m.etat}`);
      if (X.points.filter((p) => !p.ok).length !== 1 || X.arret !== false) fautes.push(`${g} : défauts ou arrêt`);
      const muet = X.essai.filter((e) => e.resultat === 'muet').map((e) => e.n).join();
      if (muet !== (jeu.defaut === 'avertisseur' ? '2' : '')) fautes.push(`${g} : essais muets ${muet}`);
      const C = D.choixSignalement(jeu);
      for (const l of ['quoi', 'pas', 'fait']) {
        if (C[l].filter((c) => c.juste).length !== 1 || C[l].length !== 4 || new Set(C[l].map((c) => c.v)).size !== 4 || new Set(C[l].map((c) => c.lib)).size !== 4) fautes.push(`${g} : ligne ${l}`);
      }
      if (C.quoi.find((c) => c.juste).v !== jeu.defaut || C.quoi.find((c) => c.juste).lib !== d.lib) fautes.push(`${g} : quoi juste`);
      if (C.quoi.filter((c) => !c.juste).some((c) => c.v === jeu.defaut || c.lib === d.lib)) fautes.push(`${g} : le défaut est aussi dans les faux`);
      if (C.pas.find((c) => c.juste).lib !== d.pas.lib || C.fait.find((c) => c.juste).lib !== d.fait.lib) fautes.push(`${g} : pas ou fait`);
      const ph = D.phrasesCompteRendu('x', db).lignes;
      const vu = ph.find((l) => l.id === 'vu'), fa = ph.find((l) => l.id === 'fait');
      if (vu.choix[vu.juste] !== d.vu || fa.choix[fa.juste] !== d.faitPhrase) fautes.push(`${g} : phrases justes`);
      if (vu.choix.filter((t) => t === d.vu).length !== 1) fautes.push(`${g} : la phrase du défaut revient en piège`);
      const dr = D.REPLIQUES_2[0].selon(db);
      if (dr.dit !== d.yann.dit || dr.libs.refuse !== d.yann.refuse) fautes.push(`${g} : Yann`);
      const nommeEngin = /n° 2/.test(dr.dit + Object.values(dr.libs).join(' '));
      if (nommeEngin !== (d.genre === 'engin')) fautes.push(`${g} : Yann parle du n° 2 (${nommeEngin}) pour ${jeu.defaut}`);
      if (/extincteur/.test(dr.dit) !== (jeu.defaut === 'extincteur') || /plan de circulation/.test(dr.dit) !== (jeu.defaut === 'affichage')) fautes.push(`${g} : Yann nomme un autre défaut`);
    }
    return { fautes, nb, defs };
  });
  if (r.fautes.length) throw new Error(r.fautes.slice(0, 5).join(' / '));
  vrai(r.nb.S >= 120 && r.nb.S <= 180 && r.nb.E >= 120 && r.nb.E <= 180, `variantes ${JSON.stringify(r.nb)} sur 300`);
  for (const c of ['fourcheTordue', 'batterie', 'fuite', 'roueAbimee', 'arretUrgence', 'avertisseur']) vrai(r.defs[c] >= 10, `défaut ${c} ${r.defs[c] || 0} fois sur 300`);
  for (const c of ['extincteur', 'affichage']) vrai(r.defs[c] >= 40, `défaut ${c} ${r.defs[c] || 0} fois sur 300`);
});

// ─────────────────────────────────────────────────────────── Yann
await v('ENT-10.3 : Yann (1re rencontre) — « D’accord, j’y vais » puis « je contrôle » : Yann réagit sans corriger, seul « avant le premier geste » est ✗ (18,5) ; « Tu l’as contrôlé, toi ? » le fait dire « Euh… non. Fais-le, alors. » mais ne rachète pas', async () => {
  await monter({ uid: EL.b.uid });
  await allerV('telephone');
  egal(await pg.textContent(`${Z} [data-dlg-appeler="${D1}"]`), 'Aller le voir', 'face à face');
  vrai(!(await present(`[data-dlg-appeler="${D2}"]`)), 'la 2e rencontre est déjà offerte');
  await pg.click(`${Z} [data-dlg-appeler="${D1}"]`); await pause();
  vrai(/Le camion de 6 h 30 arrive, faut aller vite\. J’ai sorti le transpalette n° 2 pour toi, vas-y !/.test(await pg.textContent(`${Z} [data-dlg-fil]`)), 'texte de Yann');
  await dire('tu-as');
  vrai(/Euh… non\. Fais-le, alors\./.test(await pg.textContent(`${Z} [data-dlg-fil]`)), 'la réaction de Yann');
  await dire('controle');
  await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
  await poste();
  await yann(D2, ['refuse']);
  await fiche(EL.b.fiche);
  await compteRendu(CR(EL.b));
  await qFil(Q_JUSTES);
  const n = await note();
  egal(faux(n), ['controle-d-abord'], 'seul ce jalon est faux');
  proche(n.score, 18.5, 'note');
  egal(await bandeau(), sauf('controle-d-abord'), 'bandeau');
  vrai(!(await pg.$$eval(`${Z} [data-fin-aller]`, (L) => L.map((x) => x.dataset.finAller))).some((x) => /inspection|dialogue|telephone/.test(x)), '« Corriger dans » vers un dialogue ou l’inspection');
  vrai(/Yann a déjà entendu ta réponse/.test(await pg.textContent(`${Z} [data-fin-fige]`)), 'phrase `finFige`');
});

await v('ENT-10.3 : Yann (2e rencontre) — « Oui, on commence » : Yann réagit, la réplique revient, l’élève finit ; seul « ne pas céder » est ✗ (17) ; la réaction ne nomme aucun défaut', async () => {
  await monter({ uid: EL.f.uid });
  await yann(D1, ['controle']);
  await poste();
  await allerV('telephone');
  await pg.click(`${Z} [data-dlg-appeler="${D2}"]`); await pause();
  await dire('commence');
  const fil = await pg.textContent(`${Z} [data-dlg-fil]`);
  vrai(/Et si Erwan nous demande pourquoi on n’a rien dit \?/.test(fil), 'la réaction de Yann');
  vrai(!/avertisseur|fourche|batterie|fuite|roue|arrêt d’urgence/i.test(fil), 'Yann nomme le défaut : ' + fil);
  egal(await pg.$$eval(`${Z} [data-dlg-choix]:not([disabled])`, (L) => L.map((x) => x.dataset.dlgChoix).sort()), ['abandon', 'bricole', 'refuse'], 'la réplique revient, la maladroite grisée');
  await dire('refuse');
  await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
  await fiche(EL.f.fiche);
  await compteRendu(CR(EL.f));
  await qFil(Q_JUSTES);
  const n = await note();
  egal(faux(n), ['ne-pas-ceder'], 'seul ce jalon est faux');
  proche(n.score, 17, 'note');
});

// ─────────────────────────────────────────────────────────── l'inspection
await v('ENT-10.3 : inspection — aucun arrêt : défaut oublié → « C’est bon » fige tout de suite, rien ne nomme le point, « securite-defaut » ✗ et « aucun faux » ✗ (rien signalé) ; 15/20', async () => {
  await monter({ uid: EL.b.uid });
  await yann(D1, ['controle']);
  await allerV('inspection');
  await I.vue('charge'); await I.essai(1); await I.essai(2);
  await I.valider();
  await pause();
  vrai(!(await present('[data-i-arret]')), 'un arrêt est affiché');
  vrai(!!(await insp()).fait, 'le poste n’est pas pris');
  vrai(!/extincteur|plan|quai B|transpalette|affich/i.test([await I.texteDe('[data-i-chef]'), await I.texteDe('[data-i-fige]'), await I.texteDe('[data-i-bilan]')].join(' ')), 'le panneau nomme le point');
  await qFil(Q_JUSTES);
  await yann(D2, ['refuse']);
  await fiche(EL.b.fiche);
  await compteRendu(CR(EL.b));
  await qFil(Q_JUSTES);
  const n = await note();
  egal(faux(n), ['securite-defaut', 'securite-aucun-faux'], 'jalons faux');
  proche(n.score, 15, 'note');
  egal(await bandeau(), sauf('securite-defaut'), 'bandeau');
});

await v('ENT-10.3 : inspection — un point en ordre signalé (le transpalette n° 2 en variante S, en plus du défaut) → « aucun faux » ✗ (18,5) ; Erwan répond EXACTEMENT la même chose, défaut ou non ; avertisseurs pas essayés → « essai-1 » et « essai-2 » ✗', async () => {
  await monter({ uid: EL.b.uid });
  await yann(D1, ['controle']);
  await allerV('inspection');
  await I.cliquerPoint('ordre-1');
  await I.signaler(); await pause();
  const faux1 = await I.texteDe('[data-i-chef]');
  await I.cliquerPoint('defaut');
  await I.signaler(); await pause();
  egal([faux1, await I.texteDe('[data-i-chef]')], [REPONSE_ERWAN, REPONSE_ERWAN], 'même réponse pour un point en ordre et pour le défaut');
  await I.valider(); await pause(); await qFil(Q_JUSTES);
  await yann(D2, ['refuse']);
  await fiche(EL.b.fiche);
  await compteRendu(CR(EL.b));
  await qFil(Q_JUSTES);
  const n = await note();
  egal(faux(n), ['essai-1', 'essai-2', 'securite-aucun-faux'], 'jalons faux');
  proche(n.score, 20 - 0.5 - 0.5 - 1.5, 'note');
});

await v('ENT-10.3 : inspection — variante E : le défaut signalé SANS avoir essayé l’avertisseur (n° 2 muet, p103-f) compte ; signaler le n° 1 (qui sonne) est un faux signalement ; « essai-2 » ✗ si le n° 2 n’est pas essayé', async () => {
  await monter({ uid: EL.f.uid });
  await jouer(EL.f, { poste: { essais: [1], points: [['defaut', 'tp1']] } });
  const n = await note();
  egal(faux(n), ['essai-2', 'securite-aucun-faux'], 'jalons faux');
  proche(n.score, 20 - 0.5 - 1.5, 'note');
});

// ─────────────────────────────────────────────────────────── fiche, phrases, correction
await v('ENT-10.3 : fiche « Signalement » et phrases conformes à SA variante — le texte d’un autre défaut n’est jamais la bonne case ; une mauvaise ligne → ✗ ; « Corriger » rouvre la fiche et le compte rendu seulement, renvoi juste → accusé d’Erwan et note moyennée', async () => {
  await monter({ uid: EL.g.uid });
  await yann(D1, ['controle']);
  await poste();
  await yann(D2, ['refuse']);
  await allerV('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.map((x) => x.dataset.ficheChamp)), ['quoi', 'pas', 'fait'], 'trois lignes');
  egal((await pg.$$eval(`${Z} [data-fiche-champ="quoi"] option`, (L) => L.map((x) => x.value))).filter(Boolean).includes('affichage'), true, 'le défaut de l’élève est dans les choix');
  await fiche({ ...EL.g.fiche, pas: 'quai-b' });
  await compteRendu(CR(EL.g));
  await qFil(Q_JUSTES);
  let n = await note();
  egal(faux(n), ['signalement-pas'], 'seule la ligne fausse');
  proche(n.score, 19, 'note');
  const avant = JSON.stringify([(await base()).inspections, (await base()).dialogues]);
  await clic('[data-fin-corriger]');
  await pause();
  const b = await base();
  egal(JSON.stringify([b.inspections, b.dialogues]), avant, 'un dialogue ou l’inspection a bougé');
  egal(!!b.fiches[FS].envoye, false, 'fiche rouverte');
  const n0 = (await entrants()).length;
  await allerV('fiche');
  await pg.selectOption(`${Z} [data-fiche-champ="pas"]`, 'sens'); await pause(30);
  await clic('[data-fiche-envoyer]');
  await confirmer();
  egal((await entrants()).slice(n0).map((m) => [m.from, m.subject]), [['Erwan', 'Bien reçu']], 'accusé');
  n = await note();
  proche(n.score, 19.5, 'note moyennée');
  egal(await bandeau(), tout('ok'), 'bandeau après correction');
});

await v('ENT-10.3 : compte rendu — « ce que j’ai vu » d’un AUTRE défaut, « ce que j’ai fait » faux, salutation familière → ✗ ; Erwan répond toujours le même message (il ne dit pas si le détail est juste)', async () => {
  await monter({ uid: EL.b.uid });
  await jouer(EL.b, { cr: { vu: 'Tout était en ordre.', fait: 'J’ai commencé avec le n° 2.', salutation: 'Salut mon grand,' } });
  const n = await note();
  egal(faux(n), ['cr-vu', 'cr-fait', 'cr-salutation'], 'jalons faux');
  proche(n.score, 20 - 0.75 - 0.75 - 0.5, 'note');
  const m1 = (await entrants()).filter((m) => m.subject === 'Merci').map((m) => m.text);
  const e2 = await monter({ uid: EL.a.uid });
  await jouer(EL.a);
  const m2 = (await entrants()).filter((m) => m.subject === 'Merci').map((m) => m.text);
  egal(m1.length + m2.length, 2, 'un « Merci » chacun');
  egal(m1[0].replace(/Merci \w+,/, ''), m2[0].replace(/Merci \w+,/, ''), 'Erwan dit la même chose à tous');
});

await v('ENT-10.3 : questions — A (au bilan, « Merci, je note ») ; B et C tout de suite ; D réflexion non notée ; A, B, C fausses → 16/20, ligne des questions ✗ seule, retour de A avec le bandeau', async () => {
  await monter({ uid: EL.b.uid });
  await yann(D1, ['controle']);
  await allerV('inspection');
  await I.vue('charge'); await I.essai(1); await I.essai(2);
  await I.cliquerPoint('defaut'); await I.signaler(); await pause();
  await I.valider(); await pause();
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'l4122', 'A à la prise de poste');
  await clic('[data-q-choix="ancien"][data-q="l4122"]');
  await clic('[data-q-repondre="l4122"]');
  await pause();
  vrai(await present('[data-q-merci]') && !(await present('[data-q-verdict]')), 'A : « Merci, je note » sans verdict');
  await clic('[data-q-reprendre]'); await pause();
  await yann(D2, ['refuse']);
  await allerV('fiche');
  await pg.selectOption(`${Z} [data-fiche-champ="quoi"]`, 'extincteur'); await pause(60);
  egal(await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau), 'qui-repare', 'B à la première ligne');
  vrai(/extincteur/.test((await base()).questions[ID]['qui-repare'].texte.enonce), 'B ne dit pas SON défaut');
  await qFil(Q_FAUSSES);
  vrai(await present('[data-fiche]'), 'la fiche est revenue');
  await pg.selectOption(`${Z} [data-fiche-champ="pas"]`, 'quai-b'); await pg.selectOption(`${Z} [data-fiche-champ="fait"]`, 'quai-a'); await pause(40);
  await clic('[data-fiche-envoyer]'); await confirmer(); await qFil(Q_FAUSSES);
  await compteRendu(CR(EL.b), Q_FAUSSES);
  const n = await note();
  egal(['l4122', 'qui-repare', 'pourquoi-ecrire'].map((q) => n.detail[`question:${q}`]), ['ko', 'ko', 'ko'], 'questions notées');
  vrai(!Object.keys(n.detail).some((k) => /le-plus-dur/.test(k)), 'D notée');
  egal((await base()).questions[ID]['le-plus-dur'].premiere, 'rien', 'D rangée');
  proche(n.score, 16, 'note');
  egal(await bandeau(), sauf('question:l4122'), 'bandeau');
  vrai(await present('[data-fin-retour="l4122"]'), 'le retour de A vient avec le bandeau');
});

await v('ENT-10.3 : pire cas — tout faux (mauvaise réponse à Yann deux fois, rien essayé, point en ordre signalé, fiche, phrases, questions) → premier bilan, 0/20, toutes les lignes ✗ ; « Corriger » proposé, `finFige`', async () => {
  await monter({ uid: EL.c.uid });
  await jouer(EL.c, { y1: ['vas-y', 'controle'], y2: ['commence', 'refuse'], q: Q_FAUSSES,
    poste: { essais: [], points: [['ordre-1']], Q: Q_FAUSSES },
    fiche: { quoi: 'arretUrgence', pas: 'quai-b', fait: 'comme-d-habitude' },
    cr: { salutation: 'Yo,', vu: 'Tout était en ordre.', fait: 'J’ai attendu ton retour sans rien faire.', fin: 'Bisous' } });
  const n = await note();
  egal(n.score, 0, 'note : ' + JSON.stringify(n.detail));
  egal(await bandeau(), tout('ko'), 'bandeau');
  vrai(await present('[data-fin-corriger]'), '« Corriger » proposé');
  vrai(/ne se rejoue pas/.test(await pg.textContent(`${Z} [data-fin-fige]`)), 'phrase `finFige`');
});

// ─────────────────────────────────────────────────────────── niveaux, ouverture, socle
await v('ENT-10.3 : confirmé — « Ma prise de poste » n’est pas jointe (« Le droit » oui), rien d’autre ne change : même défaut, même note, aucun bonus, le mot « bonus » absent ; accompagné = standard', async () => {
  await monter({ uid: EL.g.uid, aisance: 'confirme' });
  egal((await entrants())[0].pieces, ['droit-103'], 'pièces jointes du confirmé');
  vrai(!/Ma prise de poste/.test((await entrants())[0].text), 'le message parle de la liste : ' + (await entrants())[0].text);
  const insc = await pg.evaluate(async (uid) => { const D = await import('/contenus/pelleau-ent103-donnees.js');
    return [D.inspectionDe(uid, { niveau: 'confirme' }).points.map((p) => [p.id, p.etat]), D.inspectionDe(uid, { niveau: 'standard' }).points.map((p) => [p.id, p.etat])]; }, EL.g.uid);
  egal(insc[0], insc[1], 'le confirmé a les mêmes points');
  await jouer(EL.g);
  const n = await note();
  egal([n.score, await bandeau()], [20, tout('ok')], 'note et bandeau');
  vrai(!/\bbonus\b/i.test(await texte()), 'le mot « bonus » à l’écran');
  await monter({ uid: EL.g.uid, aisance: 'accompagne' });
  egal((await entrants())[0].pieces, ['prise-de-poste-103', 'droit-103'], 'accompagné = standard');
});

await v('ENT-10.3 : « Avant de commencer » — 3 notions + 1 image tirées et rangées, menu fermé jusqu’aux réponses, rien n’entre dans la note ; les dessins du kit se dessinent', async () => {
  await monter({ uid: 'p103-ouv', sansOuverture: true });
  egal((await P.menu()).filter((x) => !x.startsWith('fermee:')), ['ouverture'], 'entrées ouvertes au départ');
  const T = (await base()).questions[ID]['@tirage'];
  const rub = await pg.evaluate(async (ids) => { const Q = (await import('/contenus/questions/ENT-10.3.js')).QUESTIONS; return ids.map((id) => Q.liste.find((q) => q.id === id).rubrique); }, T.ids);
  egal(rub.slice().sort(), ['image', 'preparation', 'preparation', 'preparation'], 'rubriques tirées');
  const n = await note();
  vrai(!n || !Object.keys(n.detail).some((k) => /ouverture|epi|img-|consigner/.test(k)), 'une question d’ouverture est notée');
  const svg = await pg.evaluate(async () => { const S = await import('/contenus/pelleau-ent103.js');
    return ['dessin-fourches-103', 'dessin-charge-103'].map((id) => { const h = S.DOCUMENTS.find((x) => x.id === id).html; return [/<svg class="pe-dessin" viewBox="[-\d. ]+"/.test(h), (h.match(/<polygon|<rect|<path/g) || []).length > 5]; }); });
  egal(svg, [[true, true], [true, true]], 'dessins');
});

await v('ENT-10.3 : socle — aucune adresse hors du site, aucune erreur JavaScript ; le corrigé se calcule pour un élève (sa variante, son défaut, sa fiche, ses phrases) ; la page ne défile pas sur l’inspection à 1366 × 768, messages lus', async () => {
  await monter({ uid: EL.b.uid });
  await yann(D1, ['controle']);
  await aller('mail');
  await pg.evaluate(() => window.__f.db.mails.forEach((m) => { m.read = true; }));
  await aller('accueil');
  await allerV('inspection');
  const m = await seuleLaSeance(() => pg.evaluate(() => ({ page: document.scrollingElement.scrollHeight, vue: document.querySelector('#fTest [data-i-inspection]').getBoundingClientRect().bottom, h: window.innerHeight })));
  vrai(m.page <= m.h + 1 && m.vue <= m.h, `la page défile sur l’inspection (messages lus) : ${JSON.stringify(m)}`);
  const c = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-10.3.js');
    const e = C.corrigeEleve({ tirage: { graine: 'p103-b' } }, 'p103-b');
    const f = C.corrigeEleve({}, 'p103-f');
    return { n: C.CORRIGE.items.length, b: e.items.map((x) => [x.texte, x.rep]), f: f.items.map((x) => [x.texte, x.rep]), vide: f.texte };
  });
  vrai(c.n >= 5, 'corrigé commun');
  egal(c.b[0], ['Sa variante', 'Le site n’est pas fini'], 'variante de p103-b');
  egal(c.b[1], ['Son défaut', 'Extincteur absent au quai B'], 'défaut de p103-b');
  egal(c.f[0], ['Sa variante', 'L’engin n’a pas été contrôlé'], 'variante de p103-f');
  egal(c.f[1], ['Son défaut', 'Transpalette n° 2 : avertisseur muet'], 'défaut de p103-f');
  vrai(c.b.some(([t, r]) => /phrases justes/.test(t) && r.includes('Il manque l’extincteur du quai B.') && r.includes('On a travaillé au quai A')), 'phrases de p103-b');
  vrai(c.f.some(([t, r]) => /phrases justes/.test(t) && r.includes('L’avertisseur du transpalette n° 2 ne sonne pas.')), 'phrases de p103-f');
  vrai(c.b.some(([t, r]) => /ce qu’on ne fait pas/.test(t) && r === 'Ne pas travailler au quai B'), 'fiche de p103-b');
  vrai(/pas encore ouvert/.test(c.vide), 'corrigé d’un élève qui n’a pas ouvert');
  egal([...P.hotes], [], 'requêtes hors du site');
  egal(P.erreurs, [], 'erreurs JavaScript');
});

// Captures (variable d'environnement CAPTURES_ENT103 = un dossier) : accueil, Yann, inspection après signalement, bilan, à 1366 × 768. Rien n'est vérifié de plus.
if (CAPTURES) {
  await v('ENT-10.3 : captures 1366 × 768 (accueil, Yann, inspection après signalement, bilan)', async () => {
    await pg.setViewportSize({ width: 1366, height: 768 });
    const lus = async (vue) => { await pg.evaluate(() => window.__f.db.mails.forEach((m) => { m.read = true; })); await aller('mail'); await allerV(vue); };
    const cap = (nom) => seuleLaSeance(async () => { await pg.evaluate(() => window.scrollTo(0, 0)); await pg.screenshot({ path: `${CAPTURES}/1366x768-${nom}.png` }); });
    await monter({ uid: EL.b.uid });
    await lus('accueil');
    await cap('1-accueil');
    await allerV('telephone');
    await pg.click(`${Z} [data-dlg-appeler="${D1}"]`); await pause();
    await dire('tu-as');
    await lus('telephone');
    await cap('2-yann');
    await dire('controle');
    await pg.click(`${Z} [data-dlg-raccrocher]`); await pause();
    await allerV('inspection');
    await lus('inspection');
    await I.vue('quai');
    await I.cliquerPoint('defaut');
    await I.signaler(); await pause();
    await cap('3-inspection-apres-signalement');
    await I.vue('charge'); await I.essai(1); await I.essai(2);
    await I.valider(); await pause(); await qFil(Q_JUSTES);
    await yann(D2, ['commence', 'refuse']);
    await fiche(EL.b.fiche);
    await compteRendu(CR(EL.b));
    await qFil(Q_JUSTES);
    await lus('accueil');
    await cap('4-bilan');
  });
}

await P.fermer();
}
