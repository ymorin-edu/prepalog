// Suite de tests de Prepalog — bloc « pelleau-107 » : Transports Pelleau ENT-10.7, la feuille de ramasse se trompe (CAP OL, entraînement CAP-C1.3,
// erreur induite). `node outils/test.mjs pelleau-107` ne lance que ce bloc (un bloc par séance : `docs/briefs/COORDINATION-pelleau.md` §2 n° 21). Aides
// communes : `outils/test/pelleau/commun.mjs` (`ouvrirPelleau`, et `aidesQuai` pour l'inspection et la dépose, avec `parBase` pour un quai tiré).
// Brief : `docs/briefs/ENT-10.7-pelleau-feuille-de-ramasse.md` §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/pelleau-feuille-de-ramasse.js` → `rendre`),
// de vrais clics à la SOURIS ; les listes des fiches et des phrases par `selectOption`. Mouvement réduit : le camion arrive et Yann pose d'emblée.
//
// Valeurs ÉCRITES À LA MAIN. Le jeu d'un élève est tiré de sa graine (son uid) : trois élèves sont figés ci-dessous (un cas rappelle qu'on ne touche pas
// à la formule pendant qu'une classe joue). Camion : deux palettes Ar Vag (40 cartons) et deux palettes Agri-Kerlann (40 sacs), dans un ordre tiré ;
// elles sortent P4, P3, P2, P1. Annonces : 2 palettes chacune, JUSTES. La feuille de Loïc met UNE palette (la « mal notée ») chez l'autre client.
//   « p107-a » : P1 P2 Ar Vag, P3 P4 Agri-Kerlann ; mal notée P4 (étiquette Agri-Kerlann, notée Ar Vag) ; feuille : Ar Vag P1 P2 P4, Agri-Kerlann P3 ; autre P2 ; défaut lampe
//   « p107-c » : P1 P3 Agri-Kerlann, P2 P4 Ar Vag ; mal notée P4 (étiquette Ar Vag, notée Agri-Kerlann) ; feuille : Agri-Kerlann P1 P3 P4, Ar Vag P2 ; autre P1 ; défaut cale
//   « p107-d » : P1 P2 Ar Vag, P3 P4 Agri-Kerlann ; mal notée P3 (étiquette Agri-Kerlann, notée Ar Vag) ; feuille : Ar Vag P1 P2 P3, Agri-Kerlann P4 ; autre P2 ; défaut niveleur
//   Préparer : 4 palettes, 2 clients. Rapprocher : 2 reçues et « conforme » pour chaque client ; « La feuille est-elle juste ? » → « Non : la palette <mal> … ».
//   Dépose : AV1 à AV3 (Ar Vag), AK1 à AK3 (Agri-Kerlann) ; pièges allee-1, quaiB-1. Dialogue juste : feuille, etiquette. Qui corrige : loic-maelys.
//   Poids : préparer 0,5 × 2 · accueil 0,5 et 1,5 · défaut 2, aucun faux 1 · dépose : la mal notée 2, les trois autres 0,5 · rapprocher 0,5 × 4 et la feuille 2 ·
//   corriger 1 · erreur 1, salutation 0,25, fin 0,25 ; questions A 1,5, B 1,5, C 1 (part 4).

import { ouvrirPelleau, aidesQuai, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'pelleau-feuille-de-ramasse';
const QID = 'pelleau-quai-107';
const DID = 'pelleau-loic-107';
const FP = 'preparer-107', FR = 'rapprocher-107', FC = 'corriger-107';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: '/activites/pelleau-feuille-de-ramasse.js', id: ID });
const { pg, Z, pause, base, note, present, texte, entrants, menu, clic, aller, qFil } = P;
const QA = aidesQuai(P, { donnees: '/contenus/pelleau-ent107-donnees.js', quai: 'quaiDe', parBase: 'quaiDeBase', id: QID });
const CAPTURES = process.env.CAPTURES_ENT107 || '';
const capture = async (nom) => {
  if (!CAPTURES) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(`${Z} [data-carte-fermer]`); await pause(40); }
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};

// ── trois élèves figés (valeurs écrites à la main, voir l'en-tête)
const AV = 'ar-vag', AK = 'agri-kerlann';
const NOM = { [AV]: 'Ar Vag', [AK]: 'Agri-Kerlann' };
const SORTIE = ['P4', 'P3', 'P2', 'P1'];
const ELEVES = {
  a: { uid: 'p107-a', clients: { P1: AV, P2: AV, P3: AK, P4: AK }, mal: 'P4', autre: 'P2', defaut: 'lampe',
    feuille: { [AV]: ['P1', 'P2', 'P4'], [AK]: ['P3'] },
    erreur: 'La palette P4 est notée chez Ar Vag sur la feuille, mais son étiquette dit Agri-Kerlann.',
    erreurAutre: 'La palette P2 est notée chez Ar Vag sur la feuille, mais son étiquette dit Agri-Kerlann.',
    erreurSens: 'La palette P4 est notée chez Agri-Kerlann sur la feuille, mais son étiquette dit Ar Vag.' },
  c: { uid: 'p107-c', clients: { P1: AK, P2: AV, P3: AK, P4: AV }, mal: 'P4', autre: 'P1', defaut: 'cale',
    feuille: { [AV]: ['P2'], [AK]: ['P1', 'P3', 'P4'] },
    erreur: 'La palette P4 est notée chez Agri-Kerlann sur la feuille, mais son étiquette dit Ar Vag.',
    erreurAutre: 'La palette P1 est notée chez Agri-Kerlann sur la feuille, mais son étiquette dit Ar Vag.',
    erreurSens: 'La palette P4 est notée chez Ar Vag sur la feuille, mais son étiquette dit Agri-Kerlann.' },
  d: { uid: 'p107-d', clients: { P1: AV, P2: AV, P3: AK, P4: AK }, mal: 'P3', autre: 'P2', defaut: 'niveleur',
    feuille: { [AV]: ['P1', 'P2', 'P3'], [AK]: ['P4'] },
    erreur: 'La palette P3 est notée chez Ar Vag sur la feuille, mais son étiquette dit Agri-Kerlann.',
    erreurAutre: 'La palette P2 est notée chez Ar Vag sur la feuille, mais son étiquette dit Agri-Kerlann.',
    erreurSens: 'La palette P3 est notée chez Agri-Kerlann sur la feuille, mais son étiquette dit Ar Vag.' },
};
// Les cases de CHAQUE palette (d'après son étiquette) : la première case libre de son client, dans l'ordre de sortie ; et le piège de la feuille pour la mal notée.
const CASES = { [AV]: ['AV1', 'AV2', 'AV3'], [AK]: ['AK1', 'AK2', 'AK3'] };
for (const E of Object.values(ELEVES)) {
  const pris = { [AV]: 0, [AK]: 0 };
  E.dep = {}; E.suivreFeuille = null;
  for (const p of SORTIE) {
    const c = E.clients[p];
    if (p === E.mal) { const n = E.feuille[AV].includes(p) ? AV : AK; E.suivreFeuille = CASES[n][pris[n]]; }
    E.dep[p] = CASES[c][pris[c]++];
  }
  E.autres = ['P1', 'P2', 'P3', 'P4'].filter((p) => p !== E.mal);
  E.juste = `non-${E.mal}`;
}
const OUV = { annonce: 'message', 'feuille-ramasse': 'charge', 'etiquette-palette': 'qui-quoi', 'zone-reception': 'poser', cale: 'immobiliser',
  gerber: 'empiler', 'img-porteur-quai': 'cale', 'img-sol': 'emplacements' };
const monter = (o = {}) => P.monter({ rep: OUV, ...o });
const Q_JUSTES = { 'croire-quoi': 'etiquette', 'si-on-suit': 'erreur', 'qui-corrige': 'preuve' };
const Q_FAUSSES = { 'croire-quoi': 'arrange', 'si-on-suit': 'rien', 'qui-corrige': 'vite' };
const PREP = { palettes: '4', clients: '2' };
const DIAL = { feuille: 'feuille', etiquette: 'etiquette' };
const DIAL_FAUX = { feuille: 'decharge', etiquette: 'suivre' };
const RAPP = (E) => ({ 'recues-ar-vag': '2', 'resultat-ar-vag': 'conforme', 'recues-agri-kerlann': '2', 'resultat-agri-kerlann': 'conforme', 'feuille-juste': E.juste });
const CR = (E, erreur) => ({ salutation: 'Salut Maëlys,', erreur: erreur || E.erreur, fin: 'Je reste à la réception si besoin. Lea' });
const GROUPES = ['Préparer la réception', 'Accueillir Loïc', 'Avant de décharger', 'Trier par client', 'Rapprocher', 'Faire corriger', 'Rendre compte', 'Les questions'];
const JALONS = ['preparer-palettes', 'preparer-clients', 'accueil-feuille', 'accueil-etiquette', 'securite-defaut', 'securite-aucun-faux', 'depose-mal',
  'depose-autre-1', 'depose-autre-2', 'depose-autre-3', 'rapprocher-recues-ar-vag', 'rapprocher-resultat-ar-vag', 'rapprocher-recues-agri-kerlann',
  'rapprocher-resultat-agri-kerlann', 'rapprocher-feuille', 'corriger-qui', 'cr-erreur', 'cr-salutation', 'cr-fin'];
const POIDS = [0.5, 0.5, 0.5, 1.5, 2, 1, 2, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 2, 1, 1, 0.25, 0.25];
const JOURS = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus)\b/i;

// Le menu ne se redessine qu'au changement d'écran : comme l'élève, on passe par la Messagerie.
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await clic('[data-confirme-oui]'); await pause(); } };
const panneau = () => pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
// Les cartes des messages arrivés (en haut à droite) : fermées, comme le ferait l'élève (déployées, elles couvrent le haut du panneau des questions).
const fermerCartes = async () => { for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(`${Z} [data-carte-fermer]`); await pause(40); } };
// Répond aux questions au fil ouvertes ; `vus` reçoit leurs ids, dans l'ordre.
async function qrep(R = Q_JUSTES, vus = null) {
  for (let i = 0; i < 5; i++) {
    const q = await panneau();
    if (!q) return;
    await fermerCartes();
    if (vus) vus.push(q);
    await qFil({ [q]: R[q] });
  }
}
// ① Préparer la réception.
async function preparer(vals = PREP, Q = Q_JUSTES, vus = null) {
  await allerV('fiche');
  for (const [c, x] of Object.entries(vals)) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, x); await pause(30); await qrep(Q, vus); }
  await clic('[data-fiche-envoyer]'); await confirmer(); await qrep(Q, vus);
}
// ② Accueillir Loïc : `rep` donne la première réponse de chaque réplique ; une maladroite est suivie de la juste.
const dire = async (val) => { await clic(`[data-dlg-choix="${val}"]`); await pause(); };
async function accueil(rep = DIAL, Q = Q_JUSTES, vus = null) {
  await allerV('telephone');
  await clic(`[data-dlg-appeler="${DID}"]`); await pause();
  for (const r of ['feuille', 'etiquette']) { await dire(rep[r]); if (rep[r] !== DIAL[r]) await dire(DIAL[r]); }
  await clic('[data-dlg-raccrocher]'); await pause();
  await qrep(Q, vus);
}
// L'objet marqué sur la scène (zones lues du moteur, pour LE quai de cet élève : `parBase`), dans sa vue.
async function marquer(objet) { await QA.marquer(objet); }
// ③ Le quai A : l'inspection (`envois` : les objets marqués à chaque « Signaler »), « C'est bon », puis la dépose (`depose` : pour chaque palette, la liste
// des cases cliquées ; la dernière doit poser). `E` : l'élève (sa dépose juste, son défaut).
async function quai(E, o = {}) {
  const Q = o.q || Q_JUSTES;
  await allerV('quai');
  await pg.waitForSelector(QA.SVG);
  for (const ids of (o.envois || [[E.defaut]])) { for (const id of ids) await marquer(id); await QA.signaler(); await qrep(Q, o.vus); }
  if (o.avant) await o.avant();
  await QA.cestBon(); await qrep(Q, o.vus);
  if (o.apresBon) await o.apresBon();
  await QA.decharger();
  for (const pal of SORTIE) {
    const L = (o.depose && o.depose[pal]) || [E.dep[pal]];
    for (const c of L) {
      if (o.pendant) await o.pendant(pal, c);
      const n = await QA.posees();
      await QA.deposer(c);
      if (c !== L[L.length - 1]) vrai((await QA.posees()) === n, `${pal} : la case ${c} n’aurait pas dû poser la palette`);
      await qrep(Q, o.vus);
    }
  }
  await pause(); await qrep(Q, o.vus);
}
// ④ Rapprocher (la fiche arrive avec le message d'Erwan).
async function rapprocher(E, vals, Q = Q_JUSTES, vus = null, cap = '') {
  await P.ouvrirParMessage('Les palettes sont triées', `fiche:${FR}`);
  for (const [c, x] of Object.entries(vals || RAPP(E))) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, x); await pause(30); await qrep(Q, vus); }
  if (cap) await capture(cap);
  await clic('[data-fiche-envoyer]'); await confirmer(); await qrep(Q, vus);
}
// ⑤ La feuille de ramasse (fiche d'une ligne, message d'Erwan).
async function corriger(qui = 'loic-maelys', Q = Q_JUSTES, vus = null) {
  await P.ouvrirParMessage('La feuille de ramasse', `fiche:${FC}`);
  await pg.selectOption(`${Z} [data-fiche-champ="qui"]`, qui); await pause(30); await qrep(Q, vus);
  await clic('[data-fiche-envoyer]'); await confirmer(); await qrep(Q, vus);
}
// ⑥ Rendre compte à Maëlys (phrases à choisir).
async function ouvrirMail(sujet) {
  await allerV('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  await pg.click(`${Z} .ent-obj:text-is("${sujet}")`);
  await pause();
}
async function compteRendu(lignes, Q = Q_JUSTES, vus = null) {
  await ouvrirMail('Alors, la ramasse ?');
  await pg.click(`${Z} [data-repondre]`);
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(lignes)) { await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t }); await pause(30); }
  await pg.click(`${Z} #formPhr button[type="submit"]`); await confirmer();
  await qrep(Q, vus);
}
async function parcours(E, o = {}) {
  const Q = o.q || Q_JUSTES;
  await preparer(o.prep, Q, o.vus);
  await accueil(o.dial, Q, o.vus);
  await quai(E, { ...o, q: Q });
  await rapprocher(E, o.rapp, Q, o.vus);
  await corriger(o.qui, Q, o.vus);
  await compteRendu(o.cr || CR(E), Q, o.vus);
}
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { fin: b.dataset.fin, lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]),
    corriger: !!b.querySelector('[data-fin-corriger]'), fige: !!b.querySelector('[data-fin-fige]'), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});
const detail = () => pg.$$eval(`${Z} [data-fin-case]`, (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.textContent.replace(/\s+/g, ' ').trim()]));

// ─────────────────────────────────────────────────────────── la déclaration et le registre
await v('ENT-10.7 : la séance se charge (CAP, CAP-C1.3, entraînement, correction, bilan détaillé, parcours après ENT-10.6) ; poids 16 + part 4 = 20 par jalon écrit à la main ; au registre sous l’entreprise n° 10 ; fermée aux élèves tant que l’enseignant ne l’a pas cochée', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/pelleau-feuille-de-ramasse.js');
    const S = await import('/contenus/pelleau-ent107.js');
    const Q = await import('/contenus/questions/ENT-10.7.js');
    const I = await import('/activites/index.js');
    const N = await import('/core/niveaux.js');
    const socle = S.ETAPES.filter((e) => !e.bonus);
    const charges = await I.chargerActivites();
    const m = A.meta;
    return { meta: m, ids: socle.map((e) => e.id), poids: socle.map((e) => e.poids), somme: socle.reduce((t, e) => t + e.poids, 0),
      part: Q.QUESTIONS.part, notees: Q.QUESTIONS.liste.filter((q) => q.type === 'fil').map((q) => [q.id, q.de, q.poids, !!q.reflexion, q.apres || 'tout de suite', q.quand.gestes || null]),
      groupes: [...new Set(socle.map((e) => e.groupe))], sansEcran: socle.filter((e) => !e.ecran).map((e) => e.id),
      bonus: S.ETAPES.filter((e) => e.bonus).map((e) => e.id),
      auRegistre: charges.some((a) => a.meta.id === ID), echecs: (I.activitesEnEchec ? I.activitesEnEchec() : []).map((e) => e.fichier || String(e)).filter((f) => /pelleau/.test(f)),
      entreprise: (I.ENTREPRISES.find((e) => e.n === 10) || {}).nom,
      cap: N.activiteVisible(m, { niveau: 'cap' }), coche: N.activiteVisible(m, { niveau: 'cap', ouverts: { [ID]: true } }), autre: N.activiteVisible(m, { niveau: '1re', ouverts: {} }) };
  }, ID);
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.parcours, m.correction, m.bilanDetail, m.precedente, m.niveauxPrevus,
    m.questions, m.pret, m.ouverture, m.corrige, m.rubrique],
  ['ENT-10.7', ['cap'], [], ['CAP-C1.3'], 'entrainement', 20, true, true, true, 'pelleau-ramasse-du-mercredi', ['confirme'], 'ENT-10.7', true, 'prof',
    './contenus/corriges/ENT-10.7.js', 'simulog'], 'meta');
  egal(r.ids, JALONS, 'jalons du socle');
  egal(r.poids, POIDS, 'poids jalon par jalon (écrits à la main)');
  proche(r.somme + r.part, 20, 'somme des jalons et de la part des questions');
  egal(r.groupes, GROUPES.slice(0, 7), 'lignes du bandeau (hors questions)');
  egal(r.sansEcran, ['accueil-feuille', 'accueil-etiquette', 'securite-defaut', 'securite-aucun-faux', 'depose-mal', 'depose-autre-1', 'depose-autre-2', 'depose-autre-3'],
    'ni le dialogue ni le quai ne se rouvrent');
  egal(r.notees, [['croire-quoi', 'erwan', 1.5, false, 'bilan', ['dialogue:pelleau-loic-107:fin']],
    ['si-on-suit', 'erwan', 1.5, false, 'tout de suite', ['fiche:rapprocher-107:envoyer']],
    ['qui-corrige', 'maelys', 1, false, 'tout de suite', ['fiche:corriger-107:envoyer']]], 'questions au fil');
  egal(r.bonus, [], 'aucun cas bonus (brief §6 bis)');
  egal([r.auRegistre, r.echecs, r.entreprise], [true, [], 'Transports Pelleau'], 'au registre, sans échec');
  egal([r.cap, r.coche, r.autre], [false, true, false], 'fermée, puis ouverte par l’enseignant ; jamais hors CAP');
});

// ─────────────────────────────────────────────────────────── le jeu tiré (hors écran)
await v('ENT-10.7 : le jeu tiré — 300 graines : toujours 2 palettes par client, UNE seule mal notée (+1 chez un client, −1 chez l’autre), les annonces justes, le quai passe verifierQuai ; la palette mal notée prend les quatre valeurs, l’erreur va dans les DEUX sens, les défauts et les trois ordres de choix sortent', async () => {
  const r = await pg.evaluate(async () => {
    const Q = await import('/core/types/quai.js');
    const D = await import('/contenus/pelleau-ent107-donnees.js');
    const T = { mal: {}, sens: {}, defaut: {}, ordre: {}, echecs: [], autreFaux: 0, graines: 300 };
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}`, j = D.jeuDe(g), q = D.quaiDe(g);
      const e = Q.verifierQuai(q);
      if (e.length) T.echecs.push(`${g} : ${e.join(' ; ')}`);
      const nbAV = j.clients.filter((c) => c === 'ar-vag').length, nbAK = j.clients.filter((c) => c === 'agri-kerlann').length;
      const noteAV = D.notees(j, 'ar-vag').length, noteAK = D.notees(j, 'agri-kerlann').length;
      const ecarts = [noteAV - 2, noteAK - 2].sort();
      if (nbAV !== 2 || nbAK !== 2 || ecarts.join() !== '-1,1') T.echecs.push(`${g} : ${nbAV}/${nbAK} réelles, ${noteAV}/${noteAK} notées`);
      if (D.resultat(j, 'ar-vag') !== 'conforme' || D.resultat(j, 'agri-kerlann') !== 'conforme') T.echecs.push(`${g} : le camion ne colle pas aux annonces`);
      if (D.clientNote(j, j.autre) !== D.clientDe(j, j.autre) || j.autre === j.mal || D.clientNote(j, j.autre) !== j.note) T.autreFaux++;
      T.mal[j.mal] = (T.mal[j.mal] || 0) + 1; T.sens[`${j.note}>${j.vrai}`] = (T.sens[`${j.note}>${j.vrai}`] || 0) + 1;
      T.defaut[j.defaut] = (T.defaut[j.defaut] || 0) + 1; T.ordre[j.ordreChoix.join('')] = (T.ordre[j.ordreChoix.join('')] || 0) + 1;
      if (D.casesDe('ar-vag').length < 3 || D.casesDe('agri-kerlann').length < 3) T.echecs.push('moins de trois cases par client');
    }
    return T;
  });
  egal(r.echecs, [], 'équité du jeu');
  egal(r.autreFaux, 0, 'l’« autre » palette du piège est bien notée chez le même client et DIT ce client');
  egal(Object.keys(r.mal).sort(), ['P1', 'P2', 'P3', 'P4'], 'la palette mal notée prend les quatre valeurs');
  vrai(Object.values(r.mal).every((n) => n >= 40), 'palette mal notée trop rare : ' + JSON.stringify(r.mal));
  egal(Object.keys(r.sens).sort(), ['agri-kerlann>ar-vag', 'ar-vag>agri-kerlann'], 'les deux sens de l’erreur (noté chez > étiquette)');
  vrai(Object.values(r.sens).every((n) => n >= 100), 'un sens trop rare : ' + JSON.stringify(r.sens));
  egal(Object.keys(r.defaut).sort(), ['cale', 'lampe', 'niveleur'], 'les trois défauts de la scène');
  egal(Object.keys(r.ordre).length, 6, 'les six ordres des trois choix');
});

await v('ENT-10.7 : jeu figé — la formule du tirage ne bouge pas pendant qu’une classe joue (trois élèves, valeurs écrites à la main) ; la même graine donne le même jeu ; une graine vide (enseignant) donne un jeu', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent107-donnees.js');
    const lire = (g) => { const j = D.jeuDe(g); return { clients: [...j.clients], mal: j.mal, vrai: j.vrai, note: j.note, autre: j.autre, defaut: j.defaut, ordre: j.ordreChoix.join(''),
      feuille: { av: D.notees(j, 'ar-vag'), ak: D.notees(j, 'agri-kerlann') } }; };
    return { a: lire('p107-a'), c: lire('p107-c'), d: lire('p107-d'), a2: lire('p107-a'), vide: lire(''), vide2: lire(null) };
  });
  egal(r.a, { clients: [AV, AV, AK, AK], mal: 'P4', vrai: AK, note: AV, autre: 'P2', defaut: 'lampe', ordre: '102', feuille: { av: ['P1', 'P2', 'P4'], ak: ['P3'] } }, 'p107-a');
  egal(r.c, { clients: [AK, AV, AK, AV], mal: 'P4', vrai: AV, note: AK, autre: 'P1', defaut: 'cale', ordre: '120', feuille: { av: ['P2'], ak: ['P1', 'P3', 'P4'] } }, 'p107-c');
  egal(r.d, { clients: [AV, AV, AK, AK], mal: 'P3', vrai: AK, note: AV, autre: 'P2', defaut: 'niveleur', ordre: '102', feuille: { av: ['P1', 'P2', 'P3'], ak: ['P4'] } }, 'p107-d');
  egal(r.a2, r.a, 'même graine, même jeu');
  egal(r.vide, r.vide2, 'graine vide ou absente : le même jeu');
  vrai(r.vide.clients.length === 4, 'jeu de la graine vide');
});

// ─────────────────────────────────────────────────────────── le contenu (hors écran)
await v('ENT-10.7 : contenu — la feuille de ramasse suit le jeu de l’élève (palettes notées, colis = palettes notées × 40, jamais le contenu réel), sans total ni observation ; annonces justes ; chiffres calculés ; aucun jour de la semaine, pied imposé sur chaque document', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent107-donnees.js');
    const C = await import('/contenus/pelleau-ent107.js');
    const U = await import('/contenus/pelleau.js');
    const lire = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d; };
    const ht = (d, db) => (typeof d.html === 'function' ? d.html(db) : d.html);
    const dbDe = (g) => ({ tirage: { graine: g } });
    const lignes = (g) => [...lire(ht(C.DOC_FEUILLE, dbDe(g))).querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((td) => td.textContent.trim()));
    const annonces = C.DOCS_ANNONCES.map((d) => lire(ht(d, {})).textContent.replace(/\s+/g, ' '));
    const docs = C.DOCUMENTS.map((d) => [d.id, lire(ht(d, dbDe('p107-a'))).textContent.replace(/\s+/g, ' ')]);
    // Sur 300 graines : la feuille ne dit jamais autre chose que « palettes notées » (unité du client noté, pas de total, pas d'observation, pas de colonne de plus).
    const fautes = [];
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}`, L = lignes(g), html = ht(C.DOC_FEUILLE, dbDe(g));
      if (L.length !== 2 || L[0].length !== 5) fautes.push(`${g} : forme de la feuille`);
      if (!(L[0][2] === '' || /^P\d(, P\d)*$/.test(L[0][2]))) fautes.push(`${g} : numéros ${L[0][2]}`);
      const n = [L[0][1], L[1][1]].map(Number);
      if (L[0][3] !== `${n[0] * 40} cartons` || L[1][3] !== `${n[1] * 40} sacs`) fautes.push(`${g} : colis ${L[0][3]} / ${L[1][3]}`);
      if (/total|observation|erreur|faux|attention|corrig/i.test(html)) fautes.push(`${g} : mot de trop dans la feuille`);
    }
    // Les chiffres suivent les données : une annonce de 3 palettes pour Ar Vag (copie de travail), puis remise.
    const j = D.jeuDe('p107-a');
    const avant = [D.texteArret(), D.ligneRecu(j), D.resultat(j, 'ar-vag'), D.colisAnnonces('ar-vag'), D.LIGNES_PREPARER.map((l) => l.juste())];
    D.ANNONCES['ar-vag'].palettes = 3;
    const plus = [D.ligneRecu(j), D.resultat(j, 'ar-vag'), D.colisAnnonces('ar-vag'), D.ecartFeuille(j, 'ar-vag')];
    D.ANNONCES['ar-vag'].palettes = 2;
    return { fautes, lignesA: lignes('p107-a'), lignesC: lignes('p107-c'), annonces, docs, avant, plus, pied: U.PIED, apres: D.ligneRecu(j) };
  });
  egal(r.fautes, [], 'feuille de ramasse sur 300 graines');
  egal(r.lignesA, [['Biscuiterie Ar Vag', '3', 'P1, P2, P4', '120 cartons', 'signé'], ['Agri-Kerlann', '1', 'P3', '40 sacs', 'signé']], 'feuille de p107-a (mal notée P4, étiquette Agri-Kerlann)');
  egal(r.lignesC, [['Biscuiterie Ar Vag', '1', 'P2', '40 cartons', 'signé'], ['Agri-Kerlann', '3', 'P1, P3, P4', '120 sacs', 'signé']], 'feuille de p107-c : l’autre sens');
  vrai(/Nous vous confions ce jour 2 palettes de biscuits au beurre/.test(r.annonces[0]) && /\(80 cartons\)/.test(r.annonces[0]), 'annonce Ar Vag : ' + r.annonces[0]);
  vrai(/Nous vous confions ce jour 2 palettes de terreau universel/.test(r.annonces[1]) && /\(80 sacs\)/.test(r.annonces[1]), 'annonce Agri-Kerlann : ' + r.annonces[1]);
  egal(r.avant, ['Les 4 palettes sont triées par client. Reste à les rapprocher des annonces.',
    '4 palettes : 2 Ar Vag, 2 Agri-Kerlann, conformes aux annonces.', 'conforme', 80, ['4', '2']], 'valeurs calculées');
  egal(r.plus, ['4 palettes : 2 Ar Vag, 2 Agri-Kerlann.', 'manque', 120, 0], 'une annonce de 3 pour Ar Vag : le résultat, les colis et l’écart suivent');
  egal(r.apres, '4 palettes : 2 Ar Vag, 2 Agri-Kerlann, conformes aux annonces.', 'annonce remise');
  egal(r.docs.filter(([, t]) => JOURS.test(t)).map(([id]) => id), [], 'un jour de la semaine dans un document');
  egal(r.docs.filter(([id, t]) => id !== 'droit-depot' && !t.includes(r.pied.split('.')[0])).map(([id]) => id), [], 'pied « Document pédagogique » manquant');
});

await v('ENT-10.7 : « que, jamais de combien » — sur 300 graines, la feuille et les annonces ne suffisent jamais à désigner la palette mal notée (au moins trois candidates), et rien de ce que lit l’élève avant le quai (messages, fiche « Préparer », dialogue, documents) ne la nomme', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent107-donnees.js');
    const C = await import('/contenus/pelleau-ent107.js');
    const ids = D.IDS_PALETTES;
    const mini = { candidats: new Set(), fuites: [] };
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}`, j = D.jeuDe(g);
      // Ce que l'élève LIT : pour chaque palette, le client noté. Mondes compatibles avec les annonces (2 et 2) : pour chaque palette m prise comme « mal notée »,
      // on retourne son client et on compte si les annonces collent.
      const notes = Object.fromEntries(ids.map((p) => [p, D.clientNote(j, p)]));
      let n = 0;
      for (const m of ids) {
        const vrais = { ...notes, [m]: notes[m] === 'ar-vag' ? 'agri-kerlann' : 'ar-vag' };
        const nbAV = ids.filter((p) => vrais[p] === 'ar-vag').length;
        if (nbAV === 2) n++;
      }
      mini.candidats.add(n);
    }
    // Les textes lus AVANT le quai : le message de Maëlys, celui d'Erwan, la fiche « Préparer », les répliques de Loïc, le texte de Yann à l'arrêt.
    const mal = 'P4', J = D.jeuDe('p107-a');
    const dbA = { tirage: { graine: 'p107-a' } };
    const mails = C.VOLET.semer('Lea', dbA).mails.map((m) => m.text);
    const textes = [...mails, C.FICHE_PREPARER.blocs.map((b) => b.lib).join(' '), D.REPLIQUES.map((x) => x.dit + x.choix.map((c) => c.lib + (c.reaction || '')).join(' ')).join(' '),
      D.SECURITE_ARRET, D.SECURITE_CONSIGNE, ...C.DOCUMENTS.filter((d) => typeof d.html === 'string').map((d) => d.html)];
    for (const t of textes) if (new RegExp(`\\b${mal}\\b`).test(t)) mini.fuites.push(t.slice(0, 60));
    return { candidats: [...mini.candidats], fuites: mini.fuites, mal: J.mal };
  });
  egal(r.candidats, [3], 'nombre de palettes qui pourraient être la mal notée, vu la feuille et les annonces (toujours trois)');
  egal(r.fuites, [], 'un texte lu avant le quai nomme la palette mal notée');
});

// ─────────────────────────────────────────────────────────── l'ouverture
await v('ENT-10.7 : à l’ouverture — un seul message de Maëlys, daté du 18 mai 2026 à 7 h, sans jour de la semaine, feuille + annonces + règles jointes ; « Au quai » et le quai fermés ; la fiche « Préparer » a ses 2 lignes, sans rien qui trahisse la réponse ni l’erreur', async () => {
  await monter({ uid: ELEVES.a.uid });
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces, m.ouvreFiche]),
    [['Maëlys', 'La ramasse de Loïc', ['feuille-ramasse-107', 'annonce-ar-vag-107', 'annonce-agri-kerlann-107', 'regles-quai-107'], FP]], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()], [2026, 4, 18, 7], 'date du message');
  vrai(!JOURS.test(E[0].text + E[0].subject), 'un jour de la semaine dans le message');
  vrai(!PRIS_MSG.test(E[0].text), 'le message parle d’erreur : ' + E[0].text);
  const M = await menu();
  vrai(M.includes('fermee:telephone') && M.includes('fermee:quai') && !M.includes(`fiche:${FR}`) && !M.includes(`fiche:${FC}`), 'menu au départ : ' + M.join(', '));
  await capture('1-accueil');
  await allerV('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.map((x) => [x.dataset.ficheChamp, x.closest('.champ').querySelector('label').textContent.trim()])),
    [['palettes', 'Combien de palettes arrivent ?'], ['clients', 'Pour combien de clients ?']], 'lignes de la fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-doc]`, (L) => L.map((x) => x.dataset.ficheDoc)), ['feuille-ramasse-107', 'annonce-ar-vag-107', 'annonce-agri-kerlann-107', 'regles-quai-107'], 'documents à gauche');
  const panneau = await pg.textContent(`${Z} [data-fiche-panneau]`);
  vrai(!/\btotal\b/i.test(panneau), 'la feuille de ramasse donne un total');
  vrai(/Biscuiterie Ar Vag\s*3\s*P1, P2, P4\s*120 cartons/.test(panneau.replace(/\s+/g, ' ').replace(/ ?(\d)/g, ' $1').replace(/\s+/g, ' ')) || /P1, P2, P4/.test(panneau), 'la feuille de p107-a à l’écran : ' + panneau.slice(0, 200));
  await capture('2-feuille-de-ramasse');
});

await v('ENT-10.7 : inaction — rien fait → 0/20, aucun jalon juste, pas de bandeau de fin', async () => {
  await monter({ uid: ELEVES.a.uid + '-rien' });
  const n = await note();
  egal([n.score, n.max], [0, 20], 'note');
  vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
  vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
});

// ─────────────────────────────────────────────────────────── les jalons sans écran (bases fabriquées)
// `d.prep`, `d.rapp`, `d.corr` : fiches envoyées ; `d.dial` : premières réponses de l'appel fini ; `d.sec` : l'inspection figée ; `d.depose` : { palette: premier
// choix } (posées ensuite dans leur case juste) ; `d.cr` : { ligne: rang choisi } de la réponse par phrases ; `d.graine` : l'élève.
const jalonsSans = (d) => pg.evaluate(async ({ d, QID, DID, FP, FR, FC, ELEVES }) => {
  const S = await import('/contenus/pelleau-ent107.js');
  const db = { fiches: {}, quais: {}, mails: [], tirage: { graine: d.graine } };
  if (d.aisance) db.aisance = d.aisance;
  if (d.prep) db.fiches[FP] = { valeurs: d.prep, envoye: { at: 1 } };
  if (d.rapp) db.fiches[FR] = { valeurs: d.rapp, envoye: { at: 1 } };
  if (d.corr) db.fiches[FC] = { valeurs: d.corr, envoye: { at: 1 } };
  if (d.dial) db.dialogues = { 'pelleau-feuille-de-ramasse': { [DID]: { appels: [{ debut: 1, fin: 2, pas: Object.entries(d.dial).map(([r, v], i) => ({ r, v, at: i })), reprises: 0 }] } } };
  if (d.sec || d.depose) {
    const q = db.quais[QID] = { depose: {} };
    if (d.sec) q.securite = { mode: 'scene', marques: [], compteur: 0, ouverte: true, arrete: false, chef: '', signaux: d.sec.signaux || [], fait: d.sec.fait !== false };
    if (d.depose) {
      const E = Object.values(ELEVES).find((x) => x.uid === d.graine);
      for (const [p, c] of Object.entries(d.depose)) q.depose[p] = { premier: c, essais: c === E.dep[p] ? [c] : [c, E.dep[p]], pose: E.dep[p] };
      q.dechargeFini = d.finDecharge !== false;
    }
  }
  if (d.cr) {
    const P = S.phrasesCompteRendu('Lea', db);
    db.mails.push({ id: 1, folder: 'in', ts: 1, phrases: { id: P.id, lignes: P.lignes.map((l) => (l.texte ? l : { ...l, ordre: l.choix.map((_, i) => i) })) } });
    db.mails.push({ id: 2, folder: 'out', ts: 2, phrases: { id: P.id, choix: d.cr } });
  }
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, (e.verifier(db) || { status: 'null' }).status]));
}, { d, QID, DID, FP, FR, FC, ELEVES });
const JUSTE = (E) => ({ graine: E.uid, prep: PREP, dial: DIAL, sec: { signaux: [{ points: [E.defaut], rien: 0, marques: [1], apresArret: false }] }, depose: { ...E.dep }, rapp: RAPP(E),
  corr: { qui: 'loic-maelys' }, cr: { salutation: 0, erreur: 0, fin: 0 } });
const koSans = async (E, f) => { const d = JSON.parse(JSON.stringify(JUSTE(E))); f(d); const x = await jalonsSans(d); return JALONS.filter((j) => x[j] !== 'ok'); };

await v('ENT-10.7 : jalons sans écran — rien : tout « à faire » ; juste : tout ✓ ; chaque faute ne fait tomber que SON jalon ; « aucun faux » faux quand rien n’est signalé ; la palette mal notée posée chez le client de la FEUILLE = SA palette fausse ; « tout est conforme » et « la feuille est juste » sont faux', async () => {
  const A = ELEVES.a;
  const vide = await jalonsSans({ graine: A.uid });
  egal(JALONS.map((j) => vide[j]), JALONS.map(() => 'attente'), 'rien fait');
  egal(Object.keys(vide).length, JALONS.length, 'aucun cas bonus');
  const s = await jalonsSans(JUSTE(A));
  egal(JALONS.filter((j) => s[j] !== 'ok'), [], 'parcours juste');
  egal(await koSans(A, (d) => { d.prep.palettes = '5'; }), ['preparer-palettes'], '5 palettes');
  egal(await koSans(A, (d) => { d.prep.clients = '3'; }), ['preparer-clients'], '3 clients');
  egal(await koSans(A, (d) => { d.dial.etiquette = 'suivre'; }), ['accueil-etiquette'], 'Loïc : « D’accord, je suis la feuille »');
  egal(await koSans(A, (d) => { d.dial.feuille = 'magasin'; d.dial.etiquette = 'rien'; }), ['accueil-feuille', 'accueil-etiquette'], 'deux répliques');
  egal(await koSans(A, (d) => { d.sec.signaux = []; }), ['securite-defaut', 'securite-aucun-faux'], 'rien signalé, inspection figée');
  egal(await koSans(A, (d) => { d.sec.signaux = [{ points: [A.defaut, 'cale'], rien: 0, apresArret: false }]; }), ['securite-aucun-faux'], 'la cale (en ordre) signalée aussi');
  egal(await koSans(A, (d) => { d.sec.signaux = [{ points: [A.defaut], rien: 0, apresArret: true }]; }), ['securite-defaut'], 'signalé après l’arrêt de Yann');
  // LA PALETTE MAL NOTÉE posée d'abord chez le client de la FEUILLE (AV1 pour P4 de p107-a) : seule SA ligne tombe.
  egal(await koSans(A, (d) => { d.depose.P4 = 'AV1'; }), ['depose-mal'], 'P4 (mal notée) posée chez Ar Vag, comme la feuille');
  // Une autre palette fausse ne fait tomber qu'un des trois petits jalons.
  egal(await koSans(A, (d) => { d.depose.P3 = 'AV1'; }), ['depose-autre-3'], 'P3 (étiquette Agri-Kerlann) chez Ar Vag : un jalon à 0,5');
  egal(await koSans(A, (d) => { d.depose.P1 = 'allee-1'; d.depose.P2 = 'quaiB-1'; }), ['depose-autre-1', 'depose-autre-2'], 'deux palettes sur les pièges');
  egal(await koSans(A, (d) => { d.rapp['resultat-agri-kerlann'] = 'manque'; }), ['rapprocher-resultat-agri-kerlann'], 'Agri-Kerlann « il en manque »');
  egal(await koSans(A, (d) => { d.rapp['recues-ar-vag'] = '3'; }), ['rapprocher-recues-ar-vag'], 'Ar Vag : 3 reçues (ce que dit la feuille)');
  egal(await koSans(A, (d) => { d.rapp['feuille-juste'] = 'oui'; }), ['rapprocher-feuille'], '« La feuille est juste »');
  egal(await koSans(A, (d) => { d.rapp['feuille-juste'] = 'non-P2'; }), ['rapprocher-feuille'], 'une autre palette notée chez le même client');
  egal(await koSans(A, (d) => { d.rapp['feuille-juste'] = 'non-P3'; }), ['rapprocher-feuille'], 'une palette bien notée');
  egal(await koSans(A, (d) => { d.corr.qui = 'seul'; }), ['corriger-qui'], 'rayer et réécrire seul');
  egal(await koSans(A, (d) => { d.cr.erreur = 3; }), ['cr-erreur'], 'compte rendu : « Tout est conforme, la feuille est juste »');
  egal(await koSans(A, (d) => { d.cr.erreur = 1; }), ['cr-erreur'], 'compte rendu : une autre palette');
  egal(await koSans(A, (d) => { d.cr.erreur = 2; }), ['cr-erreur'], 'compte rendu : le sens inversé');
  egal(await koSans(A, (d) => { d.cr.salutation = 1; d.cr.fin = 1; }), ['cr-salutation', 'cr-fin'], 'la forme');
  const enCours = await jalonsSans({ ...JUSTE(A), sec: { signaux: [], fait: false }, finDecharge: false });
  egal([enCours['securite-defaut'], enCours['securite-aucun-faux'], enCours['depose-mal']], ['attente', 'attente', 'attente'], 'inspection non figée, déchargement pas fini');
});

await v('ENT-10.7 : l’écart attendu CHANGE avec la graine — la même réponse (« Non : la palette P4… », « P4 est notée chez Ar Vag… ») est juste pour p107-a, fausse pour p107-d ; le défaut signalé aussi (lampe, cale, niveleur) ; chaque élève a sa réponse', async () => {
  const [a, c, d] = [ELEVES.a, ELEVES.c, ELEVES.d];
  const avecA = (E, f) => { const x = JUSTE(E); f(x); return jalonsSans(x); };
  // la réponse juste de p107-a : « non-P4 » ; pour p107-d (mal notée P3) elle est fausse, et « non-P3 » est juste
  const r1 = await avecA(d, (x) => { x.rapp['feuille-juste'] = 'non-P4'; x.cr.erreur = 0; });
  egal([r1['rapprocher-feuille'], r1['cr-erreur']], ['ko', 'ok'], 'p107-d avec la réponse de p107-a : la fiche est fausse (la phrase du compte rendu est celle de SA graine)');
  const r2 = await avecA(a, (x) => { x.rapp['feuille-juste'] = 'non-P3'; });
  egal(r2['rapprocher-feuille'], 'ko', 'p107-a avec la réponse de p107-d');
  const r3 = await avecA(c, (x) => { x.rapp['feuille-juste'] = 'non-P4'; });
  egal(r3['rapprocher-feuille'], 'ok', 'p107-c : mal notée P4 aussi, mais dans l’AUTRE sens');
  // le même signalement (la lampe) : juste pour p107-a, faux pour p107-c (cale) et p107-d (niveleur)
  const sig = (E, o) => avecA(E, (x) => { x.sec.signaux = [{ points: [o], rien: 0, marques: [1], apresArret: false }]; });
  egal([(await sig(a, 'lampe'))['securite-defaut'], (await sig(c, 'lampe'))['securite-defaut'], (await sig(d, 'lampe'))['securite-defaut']], ['ok', 'ko', 'ko'], 'signaler la lampe');
  egal([(await sig(a, 'cale'))['securite-defaut'], (await sig(c, 'cale'))['securite-defaut'], (await sig(d, 'niveleur'))['securite-defaut']], ['ko', 'ok', 'ok'], 'signaler la cale, la cale, le niveleur');
  // le jalon « dépose-mal » lit la ligne de SA palette : P4 fausse fait tomber depose-mal pour a (mal P4) mais un petit jalon pour d (mal P3)
  const ko = (E, p) => koSans(E, (x) => { x.depose[p] = E.suivreFeuille; });
  egal([await ko(a, 'P4'), await ko(d, 'P4')], [['depose-mal'], ['depose-autre-3']], 'la même palette fausse, pas le même jalon');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await v('ENT-10.7 : parcours juste à l’écran (p107-a : P4 notée chez Ar Vag, étiquette Agri-Kerlann ; défaut lampe) — 20/20, bandeau 8 lignes ✓ ; A au raccrochage (au bilan), B à l’envoi de « Rapprocher », C à l’envoi de la dernière fiche ; la légende cite l’étiquette, jamais la feuille ni la zone ; messages dans l’ordre, sans jour de la semaine', async () => {
  const E = ELEVES.a;
  await monter({ uid: E.uid, sansOuverture: true });
  const ov = (await base()).questions[ID]['@tirage'].ids;
  egal([ov.length, ov.filter((id) => /^img-/.test(id)).length], [4, 1], 'questions d’ouverture tirées : 3 + 1 image');
  for (let k = 0; k < 4; k++) {
    await clic(`[data-ouv-aller="${k}"]`); await pause();
    if (k === 0) await capture('0-avant-de-commencer');
    await clic(`[data-q-choix="${OUV[ov[k]]}"][data-q="${ov[k]}"]`);
    await clic(`[data-q-repondre="${ov[k]}"]`); await pause();
  }
  await clic('[data-ouv-continuer]'); await pause();
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'ouverture faite, rien d’autre : 0');
  const vus = [];
  await preparer(PREP, Q_JUSTES, vus);
  await accueil(DIAL, Q_JUSTES, vus);
  egal(vus, ['croire-quoi'], 'A au raccrochage');
  const legendes = [];
  let legArrivee = '';
  await quai(E, { vus, apresBon: async () => { legArrivee = await QA.legende(); await capture('3-quai-feuille-de-ramasse'); }, pendant: async (pal) => {
    const l = await QA.legende();
    if (!legendes.some((x) => x[0] === pal)) legendes.push([pal, l]);
    if (pal === 'P4' && !legendes.capt) { legendes.capt = true; await pg.$eval(`${Z} [data-q-leg]`, (x) => x.scrollIntoView({ block: 'end' })); await capture('4-quai-choix-etiquette'); }
  } });
  console.log('   (légende à ① après « C’est bon » : ' + legArrivee + ')');
  egal(legendes.map(([p]) => p), SORTIE, 'une pause par palette');
  vrai(/Yann attend avec la palette P4 — étiquette : « Expéditeur : Agri-Kerlann » \(1 sur 4\)\. Où la pose-t-il \?/.test(legendes[0][1]), 'légende de P4 (la mal notée) : ' + legendes[0][1]);
  vrai(/« Expéditeur : Biscuiterie Ar Vag » \(3 sur 4\)/.test(legendes[2][1]), 'légende de P2 : ' + legendes[2][1]);
  vrai(legendes.every(([, l]) => !/zone|feuille/i.test(l)), 'la légende parle de zone ou de feuille');
  egal(vus, ['croire-quoi'], 'rien de plus pendant le quai');
  vrai(/Les 4 palettes sont triées par client\./.test(await texte()), 'bandeau de fin du quai');
  await rapprocher(E, null, Q_JUSTES, vus, '5-rapprocher');
  egal(vus, ['croire-quoi', 'si-on-suit'], 'B à l’envoi de « Rapprocher »');
  await corriger('loic-maelys', Q_JUSTES, vus);
  egal(vus, ['croire-quoi', 'si-on-suit', 'qui-corrige'], 'C à l’envoi de « La feuille de ramasse »');
  await compteRendu(CR(E), Q_JUSTES, vus);
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), [], 'jalons');
  egal(['question:croire-quoi', 'question:si-on-suit', 'question:qui-corrige'].map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
  proche(n.score, 20, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  egal(b.fin, 'ok', 'tout juste');
  await pg.$eval(`${Z} [data-fin-seance]`, (x) => x.scrollIntoView({ block: 'start' })); await capture('6-bilan');
  const M = await entrants();
  egal(M.map((x) => [x.from, x.subject]), [['Maëlys', 'La ramasse de Loïc'], ['Erwan', 'Loïc arrive'], ['Erwan', 'Yann est prêt'], ['Erwan', 'Les palettes sont triées'],
    ['Erwan', 'La feuille de ramasse'], ['Maëlys', 'Alors, la ramasse ?'], ['Maëlys', 'RE : Alors, la ramasse ?']], 'les messages, dans l’ordre');
  vrai(/Merci, je vois ça avec Loïc\./.test(M[6].text), 'Maëlys répond : ' + M[6].text);
  egal(M.filter((x) => JOURS.test(x.text + x.subject)).map((x) => x.subject), [], 'un jour de la semaine dans un message');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'un message dit juste / faux / erreur / bonus');
  const ts = M.map((x) => x.ts);
  vrai(ts.every((t, i) => !i || t >= ts[i - 1]), 'heures croissantes');
  vrai(!!((await base()).points && (await base()).points[ID]), 'photo de fin rangée (ENT-10.8 s’ouvrirait)');
  egal(P.erreurs, [], 'erreurs JavaScript');
});

await v('ENT-10.7 : parcours juste, l’AUTRE sens (p107-c : P4 notée chez Agri-Kerlann, étiquette Ar Vag ; défaut cale, vue dehors) — 20/20 ; la question B nomme les clients de cet élève ; la phrase du compte rendu est la sienne', async () => {
  const E = ELEVES.c;
  await monter({ uid: E.uid });
  let enonceB = '', retourB = '';
  await preparer(); await accueil(); await quai(E);
  await P.ouvrirParMessage('Les palettes sont triées', `fiche:${FR}`);
  for (const [c, x] of Object.entries(RAPP(E))) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, x); await pause(30); await qrep(); }
  const lib = await pg.$$eval(`${Z} [data-fiche-champ="feuille-juste"] option`, (L) => L.map((o) => o.textContent.trim()).filter((t) => t !== 'Choisir…'));
  await clic('[data-fiche-envoyer]'); await confirmer(); await pause(80);
  await fermerCartes();
  enonceB = await pg.textContent(`${Z} [data-q-panneau="si-on-suit"]`).catch(() => '');
  await qFil({ 'si-on-suit': 'erreur' });
  retourB = await pg.textContent(`${Z} [data-q-retour="si-on-suit"]`).catch(() => '');
  await corriger(); await compteRendu(CR(E));
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), [], 'jalons');
  proche(n.score, 20, 'note');
  egal(lib.length, 3, 'trois choix à « La feuille est-elle juste ? »');
  vrai(lib.includes('Non : la palette P4 est notée chez Agri-Kerlann, son étiquette dit Ar Vag.') && lib.includes('Non : la palette P1 est notée chez Agri-Kerlann, son étiquette dit Ar Vag.')
    && lib.includes('Oui, la feuille est juste.'), 'les choix de p107-c : ' + JSON.stringify(lib));
  vrai(/le jour où Agri-Kerlann reprend ses palettes/.test(enonceB) && /On lui rendrait une palette d’Ar Vag/.test(enonceB), 'B pour p107-c : ' + enonceB);
  vrai(/palette d’Ar Vag/.test(retourB) || retourB === '', 'retour de B : ' + retourB);
  vrai(/Merci, je vois ça avec Loïc\./.test((await entrants()).slice(-1)[0].text), 'Maëlys');
  egal(P.erreurs, [], 'erreurs JavaScript');
});

await v('ENT-10.7 : l’élève qui SUIT LA FEUILLE (p107-d) — dialogue « je suis la feuille », la mal notée posée d’abord chez Ar Vag (Yann réagit, la case se grise pour elle seule), puis chez Agri-Kerlann ; « la feuille est juste », « rayer seul », « tout est conforme » : seuls les jalons de l’erreur tombent, ni la préparation ni les comptes', async () => {
  const E = ELEVES.d;
  await monter({ uid: E.uid });
  let reaction = '', apresRefus = [], pourSuivante = [];
  await parcours(E, {
    dial: DIAL_FAUX,
    depose: { [E.mal]: [E.suivreFeuille, E.dep[E.mal]] },
    pendant: async (pal, c) => {
      if (pal === E.mal && c === E.dep[E.mal]) { reaction = await QA.annonce(); apresRefus = await QA.proposees(); }
      if (pal === 'P2') pourSuivante = await QA.proposees();
    },
    rapp: { ...RAPP(E), 'feuille-juste': 'oui' }, qui: 'seul',
    cr: CR(E, 'Tout est conforme, la feuille est juste.'),
  });
  vrai(/Yann : « Ça, c’est la zone de Biscuiterie Ar Vag\. Regarde l’étiquette\. »/.test(reaction), 'Yann réagit : ' + reaction);
  vrai(!apresRefus.includes(E.suivreFeuille) && apresRefus.includes(E.dep[E.mal]), `la case de la feuille (${E.suivreFeuille}) grisée pour P3 seulement : ` + apresRefus);
  vrai(pourSuivante.includes(E.suivreFeuille) || pourSuivante.some((c) => /^AV/.test(c)), 'la zone d’Ar Vag reste proposée aux autres palettes : ' + pourSuivante);
  const e = (await base()).quais[QID].depose;
  egal([e[E.mal].premier, e[E.mal].essais, e[E.mal].pose], [E.suivreFeuille, [E.suivreFeuille, E.dep[E.mal]], E.dep[E.mal]], 'état de la dépose de la mal notée');
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['accueil-feuille', 'accueil-etiquette', 'depose-mal', 'rapprocher-feuille', 'corriger-qui', 'cr-erreur'], 'seuls les jalons de l’erreur (et les deux répliques maladroites)');
  proche(n.score, 20 - 0.5 - 1.5 - 2 - 2 - 1 - 1, 'note (questions justes)');
  const b = await fin();
  egal(b.lignes.filter(([, x]) => x === 'ko').map(([g]) => g), ['Accueillir Loïc', 'Trier par client', 'Rapprocher', 'Faire corriger', 'Rendre compte'], 'lignes fausses');
  const d = await detail();
  const dep = d.filter(([id]) => /^depose-/.test(id));
  egal(dep.map(([, x]) => x), ['ko', 'ok', 'ok', 'ok'], 'la mal notée seule est fausse : ' + JSON.stringify(dep));
  vrai(dep.every(([, , t]) => /Trier par client : P\d, (Biscuiterie Ar Vag|Agri-Kerlann) : /.test(t)), 'une ligne par palette au bilan');
  vrai(/P3, Agri-Kerlann : d’abord en AV1, posée ensuite en AK2/.test(dep[0][2]), 'la ligne de P3 : ' + dep[0][2]);
  vrai(/Merci, je note : la feuille est juste\./.test((await entrants()).slice(-1)[0].text), 'Maëlys reprend « la feuille est juste » sans corriger');
  vrai(b.corriger && b.fige, 'Corriger proposé, finFige');
});

await v('ENT-10.7 : « tout est conforme » — tout juste sauf la phrase de l’erreur du compte rendu : seul cr-erreur ✗ (19) ; Maëlys reprend ce qui est écrit ; renvoyée juste, la ligne passe ✓ et la réponse change', async () => {
  const E = ELEVES.a;
  await monter({ uid: E.uid });
  await parcours(E, { cr: CR(E, 'Tout est conforme, la feuille est juste.') });
  let n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['cr-erreur'], 'seule la phrase de l’erreur');
  proche(n.score, 19, 'note');
  vrai(/Merci, je note : la feuille est juste\./.test((await entrants()).slice(-1)[0].text), 'Maëlys reprend sans corriger');
  egal((await fin()).lignes.filter(([, x]) => x === 'ko').map(([g]) => g), ['Rendre compte'], 'une ligne fausse');
  await clic('[data-fin-corriger]'); await pause();
  if (!(await present('#formPhr:not([hidden])'))) { await ouvrirMail('Alors, la ramasse ?'); await pg.click(`${Z} [data-repondre]`); }
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(CR(E))) { await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t }); await pause(30); }
  await pg.click(`${Z} #formPhr button[type="submit"]`); await confirmer();
  n = await note();
  egal(n.detail['cr-erreur'], 'ok', 'renvoyée juste');
  vrai(/Merci, je vois ça avec Loïc\./.test((await entrants()).slice(-1)[0].text), 'la nouvelle réponse de Maëlys');
});

await v('ENT-10.7 : pire cas — tout faux (maladroit à chaque réplique, « C’est bon » sans signaler puis un faux signalement, la mal notée d’abord chez le client de la feuille, rapprochement, feuille, correction et phrases faux) → premier bilan, 8 lignes ✗, « Corriger » proposé, `finFige` ; Yann arrête sans nommer le défaut', async () => {
  const E = ELEVES.a;
  await monter({ uid: E.uid });
  let arret = '';
  await parcours(E, { q: Q_FAUSSES, prep: { palettes: '5', clients: '3' }, dial: DIAL_FAUX,
    envois: [['cale']],
    avant: async () => { await QA.cestBon(); arret = await pg.textContent(`${Z} [data-q-secu-arret]`).catch(() => ''); await marquer(E.defaut); await QA.signaler(); await qrep(Q_FAUSSES); },
    depose: { P4: [E.suivreFeuille, E.dep.P4], P3: ['allee-1', E.dep.P3], P2: ['quaiB-1', E.dep.P2], P1: ['AK3', E.dep.P1] },
    rapp: { 'recues-ar-vag': '3', 'resultat-ar-vag': 'trop', 'recues-agri-kerlann': '1', 'resultat-agri-kerlann': 'manque', 'feuille-juste': 'oui' },
    qui: 'personne',
    cr: CR(E, 'Tout est conforme, la feuille est juste.') });
  vrai(arret.length > 0 && !/lampe/i.test(arret), 'Yann arrête sans nommer le défaut : ' + arret);
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ko' && !['cr-salutation', 'cr-fin'].includes(j)), [], 'tous les jalons faux (hors la forme du message, juste)');
  egal(['question:croire-quoi', 'question:si-on-suit', 'question:qui-corrige'].map((j) => n.detail[j]), ['ko', 'ko', 'ko'], 'questions fausses');
  proche(n.score, 0.5, 'note : seule la forme du message (0,5)');
  const b = await fin();
  egal(b.lignes.filter(([, x]) => x === 'ko').map(([g]) => g), GROUPES, 'les 8 lignes fausses (la ligne « Rendre compte » l’est aussi : l’erreur y est fausse)');
  vrai(b.corriger && b.fige, 'Corriger et la phrase du premier essai : ' + b.texte);
  vrai(/Le camion est déchargé : le quai ne se rejoue pas\./.test(b.texte), 'finFige');
});

await v('ENT-10.7 : inspection — le défaut TIRÉ (niveleur chez p107-d, vue « dedans ») : « C’est bon » sans rien signaler → Yann arrête (sans nommer) ; le niveleur signalé après l’arrêt, avec la cale à tort : les deux jalons ✗ ; chez p107-c (cale, vue « dehors »), le bon signalement suffit', async () => {
  const E = ELEVES.d;
  await monter({ uid: E.uid });
  await preparer(); await accueil();
  await allerV('quai'); await pg.waitForSelector(QA.SVG);
  vrai(/Avant que Yann entre dans le camion, regarde le quai et le camion\./.test(await texte()), 'la consigne au-dessus de la scène');
  await QA.cestBon();
  vrai(await present('[data-q-secu-arret]'), 'Yann arrête');
  const a = await pg.textContent(`${Z} [data-q-secu-arret]`);
  vrai(/Regarde encore le quai/.test(a) && !/niveleur|lampe|cale/i.test(a), 'l’arrêt ne nomme pas le défaut : ' + a);
  await marquer('niveleur'); await marquer('cale'); await QA.signaler(); await qrep();
  const c = await QA.chef();
  vrai(/Bien vu : je pose le niveleur\./.test(c) && /Là, je ne vois rien qui cloche\./.test(c), 'la réponse de Yann, point par point : ' + c);
  await QA.cestBon(); await QA.decharger();
  for (const p of SORTIE) { await QA.deposer(E.dep[p]); await qrep(); }
  const n = await note();
  egal(['securite-defaut', 'securite-aucun-faux'].map((j) => n.detail[j]), ['ko', 'ko'], 'signalé après l’arrêt, et la cale à tort');
  // chez p107-c : le défaut est la cale (vue dehors)
  const C = ELEVES.c;
  await monter({ uid: C.uid });
  await preparer(); await accueil();
  await allerV('quai'); await pg.waitForSelector(QA.SVG);
  await marquer('cale'); await QA.signaler(); await qrep();
  vrai(/Bien vu : je fais poser la cale\./.test(await QA.chef()), 'Yann répond pour la cale : ' + await QA.chef());
  await QA.cestBon(); await QA.decharger();
  for (const p of SORTIE) { await QA.deposer(C.dep[p]); await qrep(); }
  const n2 = await note();
  egal(['securite-defaut', 'securite-aucun-faux'].map((j) => n2.detail[j]), ['ok', 'ok'], 'le bon signalement chez p107-c');
});

await v('ENT-10.7 : dialogue — « Oui, je suis la feuille » : Loïc réagit, la réplique revient, l’entretien finit ; seul ce jalon ✗ ; « Corriger » ne rouvre pas le dialogue (« Relire » seulement)', async () => {
  const E = ELEVES.a;
  await monter({ uid: E.uid });
  await preparer();
  await allerV('telephone');
  vrai(/Erwan : « Loïc recule au quai A\. Va l’accueillir\. »/.test(await pg.textContent(`${Z} .dlg-repos`).catch(() => '')), 'la consigne d’Erwan en haut');
  egal(await pg.textContent(`${Z} [data-dlg-appeler="${DID}"]`), 'Aller le voir', 'face à face');
  await clic(`[data-dlg-appeler="${DID}"]`); await pause();
  await dire('feuille');
  vrai(/Pose comme c’est écrit sur la feuille/.test(await pg.textContent(`${Z} [data-dlg-fil]`)), 'Loïc presse de suivre la feuille');
  await dire('suivre');
  vrai(/Erwan, lui, dit toujours de regarder les étiquettes/.test(await pg.textContent(`${Z} [data-dlg-fil]`)), 'Loïc réagit');
  egal(await pg.$$eval(`${Z} [data-dlg-choix]:not([disabled])`, (L) => L.map((x) => x.dataset.dlgChoix).sort()), ['etiquette', 'rien'], 'la réplique revient, la maladroite grisée');
  await dire('etiquette');
  await clic('[data-dlg-raccrocher]'); await pause(); await qrep();
  await quai(E); await rapprocher(E); await corriger(); await compteRendu(CR(E));
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['accueil-etiquette'], 'seul « suivre la feuille ou lire les étiquettes » est faux');
  const b = await fin();
  vrai(!b.corriger, 'rien à rouvrir : le dialogue ne se rejoue pas');
  await allerV('telephone');
  vrai(!/Revenir le voir/.test(await pg.textContent(`${Z} [data-dlg-appeler="${DID}"]`).catch(() => '')), 'pas de « Revenir le voir »');
});

await v('ENT-10.7 : corriger « Rapprocher » — « la feuille est juste » : seule cette case ✗ (18) ; « Corriger » rouvre la fiche (pas le quai), accusé d’Erwan au renvoi juste, note moyennée ; le quai reste fini', async () => {
  const E = ELEVES.a;
  await monter({ uid: E.uid });
  await parcours(E, { rapp: { ...RAPP(E), 'feuille-juste': 'oui' } });
  let n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['rapprocher-feuille'], 'seule cette case');
  proche(n.score, 18, 'note');
  const lig = (await detail()).find(([id]) => id === 'rapprocher-feuille');
  vrai(lig && lig[1] === 'ko' && /Rapprocher : la feuille de ramasse est-elle juste \?/.test(lig[2]), 'ligne du bilan détaillé : ' + JSON.stringify(lig));
  await clic('[data-fin-corriger]'); await pause();
  vrai(await present(`[data-fiche="${FR}"]`), '« Corriger » ouvre « Rapprocher »');
  await pg.selectOption(`${Z} [data-fiche-champ="feuille-juste"]`, E.juste); await pause();
  await clic('[data-fiche-envoyer]'); await confirmer();
  n = await note();
  egal(n.detail['rapprocher-feuille'], 'ok', 'renvoyée juste');
  vrai(n.score > 18 && n.score < 20, 'note moyennée : ' + n.score);
  vrai((await entrants()).some((x) => x.from === 'Erwan' && x.subject === 'Bien reçu'), 'accusé d’Erwan');
  vrai(!!(await base()).quais[QID].dechargeFini, 'le quai reste fini');
});

await v('ENT-10.7 : confirmé — les « Règles du quai » ne sont pas jointes (message et fiche) mais rien d’autre ne change : même jeu, même quai, même note, aucun bonus, le mot « bonus » n’apparaît pas ; accompagné = standard', async () => {
  const E = ELEVES.a;
  await monter({ uid: E.uid, aisance: 'confirme' });
  const M = await entrants();
  egal(M[0].pieces, ['feuille-ramasse-107', 'annonce-ar-vag-107', 'annonce-agri-kerlann-107'], 'pièces jointes du confirmé');
  vrai(!/règles du quai/i.test(M[0].text), 'le message parle des règles du quai : ' + M[0].text);
  await allerV('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-doc]`, (L) => L.map((x) => x.dataset.ficheDoc)), ['feuille-ramasse-107', 'annonce-ar-vag-107', 'annonce-agri-kerlann-107'], 'documents à gauche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.map((x) => x.dataset.ficheChamp)), ['palettes', 'clients'], 'deux lignes : aucun bonus');
  await parcours(E);
  const n = await note();
  proche(n.score, 20, 'note du socle');
  vrai(n.detail.bonus === undefined || n.detail.bonus === null, 'un cas bonus : ' + JSON.stringify(n.detail.bonus));
  egal((await fin()).lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau identique');
  vrai(!/bonus/i.test(await texte()), 'le mot « bonus » à l’écran');
  await monter({ uid: E.uid, aisance: 'accompagne' });
  egal((await entrants())[0].pieces.length, 4, 'accompagné = standard : 4 pièces jointes');
});

await v('ENT-10.7 : « Avant de commencer » — 3 notions + 1 image tirées et rangées, rien n’entre dans la note ; étape suivante : de « Préparer » à « Au quai », au quai, à « Rapprocher », à « La feuille de ramasse »', async () => {
  await monter({ uid: 'p107-ouv2', sansOuverture: true });
  const db = await base();
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 4, '4 notions tirées');
  vrai(ids.every((i) => Object.keys(OUV).includes(i)), 'ids de la banque : ' + ids);
  vrai(await present('[data-ouv-aller="0"]'), 'écran « Avant de commencer »');
  const n = await note();
  vrai(!n || !Object.keys(n.detail).some((k) => /^question:(annonce|feuille|etiquette|zone|cale|gerber|img)/.test(k)), 'une notion d’ouverture dans la note');
  const E = ELEVES.a;
  await monter({ uid: E.uid });
  const barre = () => pg.$eval(`${Z} [data-suite-seance]`, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => null);
  egal(await barre(), 'Étape suivante : Préparer la réception Y aller →', 'au départ');
  await preparer();
  egal(await barre(), 'Étape suivante : Au quai : accueillir Loïc Y aller →', 'après « Préparer »');
  await accueil();
  egal(await barre(), 'Étape suivante : Le quai A : inspecter, puis trier Y aller →', 'après l’accueil');
  await quai(E);
  await pause();
  vrai(/Rapprocher des annonces/.test(await barre() || ''), 'après le quai : ' + await barre());
  await rapprocher(E);
  vrai(/La feuille de ramasse/.test(await barre() || ''), 'après « Rapprocher » : ' + await barre());
});

await v('ENT-10.7 : le corrigé de l’enseignant SUIT LA GRAINE — la palette mal notée, le sens, l’ordre de sortie et le défaut de chaque élève ; commun : 9 parties, aucun nombre attendu écrit pour une palette précise', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-10.7.js');
    const lire = (g, ouvert = true) => C.corrigeEleve(ouvert ? { tirage: { graine: g } } : {}, g).items.map((i) => [i.texte, i.rep]);
    return { n: C.CORRIGE.items.length, a: lire('p107-a'), c: lire('p107-c'), d: lire('p107-d'), ferme: C.corrigeEleve({}, 'p107-d'), communTexte: JSON.stringify(C.CORRIGE.items).replace(/\s+/g, ' ') };
  });
  egal(r.n, 9, 'parties du corrigé commun');
  const dit = (L, t) => (L.find(([x]) => x === t) || [])[1];
  egal(dit(r.a, 'Son défaut au quai'), 'Lampe de quai éteinte', 'défaut de p107-a');
  egal(dit(r.c, 'Son défaut au quai'), 'Cale de roue absente', 'défaut de p107-c');
  egal(dit(r.d, 'Son défaut au quai'), 'Niveleur relevé, pas posé sur la remorque', 'défaut de p107-d');
  egal(dit(r.a, 'Ordre de sortie des palettes'), 'P4 (Agri-Kerlann), P3 (Agri-Kerlann), P2 (Ar Vag), P1 (Ar Vag)', 'ordre de p107-a');
  egal(dit(r.c, 'Ordre de sortie des palettes'), 'P4 (Ar Vag), P3 (Agri-Kerlann), P2 (Ar Vag), P1 (Agri-Kerlann)', 'ordre de p107-c');
  vrai(r.a.some(([t]) => t === 'Palette P4 : étiquette Agri-Kerlann, notée chez Ar Vag sur la feuille (la palette mal notée)'), 'la mal notée de p107-a : ' + JSON.stringify(r.a));
  vrai(r.c.some(([t]) => t === 'Palette P4 : étiquette Biscuiterie Ar Vag, notée chez Agri-Kerlann sur la feuille (la palette mal notée)'), 'la mal notée de p107-c : ' + JSON.stringify(r.c));
  vrai(r.d.some(([t]) => /^Palette P3 : .*\(la palette mal notée\)$/.test(t)) && !r.d.some(([t]) => /^Palette P4 : .*mal notée/.test(t)), 'la mal notée de p107-d : ' + JSON.stringify(r.d));
  egal(dit(r.a, 'La feuille de ramasse : ce qu’elle dit'), 'Ar Vag : P1, P2, P4 (3) · Agri-Kerlann : P3 (1)', 'la feuille de p107-a');
  egal(dit(r.c, 'La feuille de ramasse : ce qu’elle dit'), 'Ar Vag : P2 (1) · Agri-Kerlann : P1, P3, P4 (3)', 'la feuille de p107-c');
  egal(dit(r.a, '« La feuille de ramasse est-elle juste ? »'), 'Non : la palette P4 est notée chez Ar Vag, son étiquette dit Agri-Kerlann.', 'la bonne réponse de p107-a');
  egal(dit(r.d, '« La feuille de ramasse est-elle juste ? »'), 'Non : la palette P3 est notée chez Ar Vag, son étiquette dit Agri-Kerlann.', 'la bonne réponse de p107-d');
  egal(dit(r.d, 'La phrase de l’erreur dans le compte rendu'), 'La palette P3 est notée chez Ar Vag sur la feuille, mais son étiquette dit Agri-Kerlann.', 'la phrase de p107-d');
  vrai(/n’a pas encore ouvert/.test(r.ferme.texte), 'élève qui n’a pas ouvert la séance');
  vrai(!/\bP[1-4]\b notée/.test(r.communTexte), 'le corrigé commun nomme une palette précise');
});

await v('ENT-10.7 : socle — aucune adresse hors du site, aucune erreur JavaScript ; écrans à 1366 × 768 sans défilement horizontal ; huit cases de dépose, nom lu au clavier = le lieu', async () => {
  const E = ELEVES.a;
  await monter({ uid: E.uid });
  const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await allerV('fiche');
  vrai(await large() <= 0, 'fiche : défilement horizontal');
  await preparer(); await accueil();
  await allerV('quai'); await pg.waitForSelector(QA.SVG);
  await marquer(E.defaut); await QA.signaler(); await QA.cestBon(); await QA.decharger();
  egal(await QA.proposees(), ['allee-1', 'AV1', 'AV2', 'AV3', 'AK1', 'AK2', 'AK3', 'quaiB-1'], 'huit cases proposées, de gauche à droite');
  egal(await pg.getAttribute(`${Z} [data-q="depose"][data-c="AK1"]`, 'aria-label'), 'Case AGRI 1', 'nom lu au clavier : le lieu, jamais le verdict');
  vrai(await large() <= 0, 'quai : défilement horizontal');
  await capture('5-quai-huit-cases');
  egal([...P.hotes], [], 'adresses hors du site');
  egal(P.erreurs, [], 'erreurs JavaScript');
});

// ── Le rappel des étiquettes lues au quai (décision de Tristan, 21/10/2026) : valeurs écrites à la main, sur les témoins figés.
//   p107-a : P1 P2 = Biscuiterie Ar Vag, P3 P4 = Agri-Kerlann ; p107-c : P1 P3 = Agri-Kerlann, P2 P4 = Biscuiterie Ar Vag.
const TITRE_ETIQ = 'Ce que tu as lu sur les étiquettes, au quai';
const RAPPEL = {
  a: ['P1 — étiquette : Biscuiterie Ar Vag', 'P2 — étiquette : Biscuiterie Ar Vag', 'P3 — étiquette : Agri-Kerlann', 'P4 — étiquette : Agri-Kerlann'],
  c: ['P1 — étiquette : Agri-Kerlann', 'P2 — étiquette : Biscuiterie Ar Vag', 'P3 — étiquette : Agri-Kerlann', 'P4 — étiquette : Biscuiterie Ar Vag'],
};
const rappelEcran = () => pg.$eval(`${Z} section.ent-cadre[aria-label="${TITRE_ETIQ}"] .ent-encadre`, (x) => x.innerText.split('\n').map((s) => s.trim()).filter(Boolean)).catch(() => null);

await v('ENT-10.7 : le rappel des étiquettes (fiche « Rapprocher ») — l’expéditeur lu sur chaque étiquette, « pas encore vue » avant la dépose, absent chez le confirmé, jamais la feuille ni la réponse', async () => {
  const r = await pg.evaluate(async ({ QID, TITRE }) => {
    const C = await import('/contenus/pelleau-ent107.js');
    const poses = (ids) => ({ [QID]: { depose: Object.fromEntries(ids.map((id) => [id, { premier: 'AV1', essais: ['AV1'], pose: 'AV1' }])) } });
    const db = (g, aisance, ids, plus = {}) => ({ tirage: { graine: g }, aisance, quais: poses(ids), ...plus });
    const rappel = (d) => { const b = C.FICHE_RAPPROCHER.blocs(d).find((x) => x.titre === TITRE); return b ? b.blocs.map((x) => x.texte).join('') : null; };
    const tous = ['P4', 'P3', 'P2', 'P1'];
    const essaiSeul = { [QID]: { depose: { P4: { premier: 'AV1', essais: ['AV1'], pose: null } } } };
    return {
      a: rappel(db('p107-a', 'standard', tous)), c: rappel(db('p107-c', 'standard', tous)), accompagne: rappel(db('p107-a', 'accompagne', tous)),
      confirme: rappel(db('p107-a', 'confirme', tous)),
      vide: rappel({ tirage: { graine: 'p107-a' } }), base0: rappel({}),
      deux: rappel(db('p107-a', 'standard', ['P4', 'P3'])), essai: rappel({ tirage: { graine: 'p107-a' }, quais: essaiSeul }),
      nbBlocs: [C.FICHE_RAPPROCHER.blocs(db('p107-a', 'standard', tous)).length, C.FICHE_RAPPROCHER.blocs(db('p107-a', 'confirme', tous)).length],
    };
  }, { QID, TITRE: TITRE_ETIQ });
  egal(r.a, RAPPEL.a.join('\n'), 'rappel de p107-a');
  egal(r.c, RAPPEL.c.join('\n'), 'rappel de p107-c (l’autre sens)');
  egal(r.accompagne, r.a, 'accompagné = standard');
  egal(r.confirme, null, 'le confirmé n’a pas le rappel');
  egal(r.nbBlocs, [4, 3], 'un cadre de plus en standard (deux clients, rappel, feuille), pas chez le confirmé');
  egal(r.vide, ['P1', 'P2', 'P3', 'P4'].map((p) => `${p} — pas encore vue`).join('\n'), 'rien posé : « pas encore vue » partout');
  egal(r.base0, r.vide, 'base vide : même chose');
  egal(r.deux, ['P1 — pas encore vue', 'P2 — pas encore vue', RAPPEL.a[2], RAPPEL.a[3]].join('\n'), 'deux palettes posées seulement');
  egal(r.essai, r.vide, 'une palette essayée mais pas posée n’est pas « vue »');
  for (const t of [r.a, r.c, r.deux, r.vide]) vrai(!/mal not|feuille|ramasse|juste|faux|erreur|attention|différen|écart/i.test(t), 'le rappel parle de la feuille ou de la réponse : ' + t);
});

await v('ENT-10.7 : le rappel à l’écran — standard : les quatre étiquettes lues, sans mise en évidence ; confirmé : rien ; ni l’un ni l’autre ne change le jeu ni la note', async () => {
  for (const [E, cle] of [[ELEVES.a, 'a'], [ELEVES.c, 'c']]) {
    await monter({ uid: E.uid });
    await preparer(); await accueil(); await quai(E);
    await P.ouvrirParMessage('Les palettes sont triées', `fiche:${FR}`);
    egal(await rappelEcran(), RAPPEL[cle], `${E.uid} : rappel à l’écran`);
    egal(await pg.$$eval(`${Z} section.ent-cadre`, (L) => L.map((x) => x.getAttribute('aria-label'))),
      ['Biscuiterie Ar Vag', 'Agri-Kerlann', TITRE_ETIQ, 'La feuille de ramasse de Loïc'], `${E.uid} : les cadres, dans l’ordre`);
    const cadre = `${Z} section.ent-cadre[aria-label="${TITRE_ETIQ}"]`;
    vrai((await pg.$$eval(`${cadre} [class*="juste"], ${cadre} [class*="faux"], ${cadre} mark, ${cadre} strong, ${cadre} em, ${cadre} select`, (L) => L.length)) === 0, 'mise en évidence ou champ dans le rappel');
    if (cle === 'a') await capture('5b-rapprocher-rappel');
    for (const [c, x] of Object.entries(RAPP(E))) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, x); await pause(30); }
    await qrep();
    await clic('[data-fiche-envoyer]'); await confirmer(); await qrep();
    egal(await rappelEcran(), RAPPEL[cle], `${E.uid} : le rappel reste après l’envoi`);
  }
  const E = ELEVES.a;
  await monter({ uid: E.uid, aisance: 'confirme' });
  await preparer(); await accueil(); await quai(E);
  await P.ouvrirParMessage('Les palettes sont triées', `fiche:${FR}`);
  egal(await rappelEcran(), null, 'confirmé : pas de rappel');
  egal(await pg.$$eval(`${Z} section.ent-cadre`, (L) => L.map((x) => x.getAttribute('aria-label'))), ['Biscuiterie Ar Vag', 'Agri-Kerlann', 'La feuille de ramasse de Loïc'], 'confirmé : les cadres');
  egal(P.erreurs, [], 'erreurs JavaScript');
});

await P.fermer();
}
