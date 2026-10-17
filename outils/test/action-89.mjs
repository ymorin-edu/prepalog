// Suite de tests de Prepalog — bloc « action-89 » : ENT-8.9 Action, « la palette de Lucas » (CAP OL, entraînement CAP-C1.3 et CAP-C1.4, erreur
// induite). Brief `docs/briefs/ENT-8.9-action-labastide-reception.md` §8 ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §8.5.
// `node outils/test.mjs action-89` ne lance que ce bloc. Aides communes (ouvrir la page, lire la base) : `outils/test/france-boissons/commun.mjs`.
// L'inspection se joue À LA SOURIS (zones du moteur lues dans `zonesScene`, clic au centre à la `boundingBox()` du <svg>, comme action-87) ; la
// dépose, par un clic sur la case ; le contrôle, comme action-88. Mouvement réduit : le camion arrive et Lucas pose d'emblée.
//
// Valeurs ÉCRITES À LA MAIN. Le camion de jouets : P1 peluches 4 × 6 = 24 · P2 jeux de société 5 × 8 = 40 · P3 voitures 5 × 5 = 25 · P4 pâte à
// modeler 6 × 6 = 36. Deux élèves TÉMOINS (graine posée à la main dans `db.tirage`), relevés une fois le 17/10/2026 et recopiés ici :
//   « temoin-4 » (date RÉCENTE, jeudi 17 → on peut protester) : scène cale + niveleur · P1 conforme 24 · P2 conforme 40 · P3 2 cartons MANQUANTS
//                (BL 25, réel 23) · P4 PIÈGE, couche du dessus à 3 sur 6, BL 33 = réel 33.
//   « temoin-1 » (date ANCIENNE, lundi 14 → trop tard) : scène cale + lampe · P1 1 carton écrasé DERRIÈRE (24) · P2 conforme 40 · P3 conforme 25 ·
//                P4 PIÈGE, BL 33 = réel 33.
// Dialogue juste : arrivee bienvenue, documents ldv, quai quai5, attente local, fin merci. Dépose : R1 à R4 justes, allee-1 et quai6-1 pièges ;
// sortie P4, P3, P2, P1. Poids : accueil 0,5 · 0,75 · 0,5 · 0,75 · 0,5 ; dangers 1,25 × 2, aucun faux 0,5 ; dépose 0,25 × 4, conformes 0,5, piège 0,5,
// problème 1,5, sa réserve 1, déballage 0,5, signature 0,5 ; Lucas 1 × 3 ; compte rendu 0,75 × 2 ; questions qui-paie 1,5, refus-signer 1,5,
// rappel-lucas 1 (part 4, se-comprendre non notée).

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, texte, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });
const CAPTURES = process.env.CAPTURES_ENT89 || '';

const ID = 'action-palette-lucas';
const QID = 'action-quai5-labastide';
const PHR = 'compte-rendu-lucas';
const REP_OUV = { pictogramme: 'dessin', transporteur: 'emmene', reserve: 'remarque', avarie: 'abimee', 'jour-ferie': 'fete', couches: 'juste',
  protocole: 'avant', 'img-cale': 'immobiliser', 'img-carton-ecrase': 'ecrase', 'img-feux': 'chauffeur' };
const BONNES_Q = { 'qui-paie': 'transporteur', 'refus-signer': 'noter', 'rappel-lucas': 'rappeler', 'se-comprendre': 'court' };
const FAUSSES_Q = { 'qui-paie': 'jan', 'refus-signer': 'laisser', 'rappel-lucas': 'rien', 'se-comprendre': 'pas-pense' };
const DIAL = { arrivee: 'bienvenue', documents: 'ldv', quai: 'quai5', attente: 'local', fin: 'merci' };
const DIAL_FAUX = { arrivee: 'ouais', documents: 'rien', quai: 'long', attente: 'camion', fin: 'ciao' };
const ORDRE_DIAL = ['arrivee', 'documents', 'quai', 'attente', 'fin'];
const SORTIE = ['P4', 'P3', 'P2', 'P1'];
const DEPOSE_JUSTE = { P4: 'R1', P3: 'R2', P2: 'R3', P1: 'R4' };
const GROUPES = ['Accueillir le chauffeur', 'Avant de décharger', 'Faire décharger et contrôler', 'La palette de Lucas', 'Rendre compte', 'Les questions de Romain'];
const JALONS = ['accueil-salutation', 'accueil-documents', 'accueil-quai', 'accueil-attente', 'accueil-fin', 'securite-1', 'securite-2', 'securite-aucun-faux',
  'depose-P1', 'depose-P2', 'depose-P3', 'depose-P4', 'palettes-conformes', 'palette-piege', 'palette-probleme', 'reserve-probleme', 'deballage', 'signature',
  'lucas-aurait-du', 'lucas-protester', 'lucas-palette', 'cr-reception', 'cr-lucas'];
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus)\b/i;
const P_DANS = 'On est dans les 3 jours : Inès envoie une lettre recommandée au transporteur. La palette est en zone litiges.';
const P_PLUS = 'Plus de 3 jours sont passés : on ne peut plus protester. La palette est en zone litiges.';
// Le contrôle juste de chaque témoin : [comptage, décision, motif] ; la valeur de la réserve ; la fiche ; les phrases justes.
const T4 = { graine: 'temoin-4', scene: ['cale', 'niveleur'], pal: { P1: [24, 'accepter'], P2: [40, 'accepter'], P3: [23, 'reserves', 'manquant'], P4: [33, 'accepter'] },
  res: { P3: '2' }, lucas: { 'aurait-du': 'tour-reserve', protester: 'oui-3j', palette: 'litiges' },
  cr: { salutation: 'Bonjour Romain,', reception: 'Camion de jouets reçu : réserve signée par Jan sur P3, 2 cartons manquants.', lucas: P_DANS, fin: 'Lea' } };
const T1 = { graine: 'temoin-1', scene: ['cale', 'lampe'], pal: { P1: [24, 'reserves', 'avarie'], P2: [40, 'accepter'], P3: [25, 'accepter'], P4: [33, 'accepter'] },
  res: { P1: '1' }, tour: 'P1', lucas: { 'aurait-du': 'tour-reserve', protester: 'non-3j', palette: 'litiges' },
  cr: { salutation: 'Bonjour Romain,', reception: 'Camion de jouets reçu : réserve signée par Jan sur P1, 1 carton abîmé.', lucas: P_PLUS, fin: 'Lea' } };

// Monte la séance dans la page. `o.graine` : la graine posée (l'élève témoin) ; les réponses d'« Avant de commencer » sont posées (sauf `sansOuverture`).
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-palette-lucas.js');
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
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ac89' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }), suivante: null,
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: o.sansOuverture ? null : REP_OUV, ...o });
// Le menu ne se redessine qu'au changement d'écran : comme l'élève, on passe par la Messagerie.
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const Q = (s) => `${Z} ${s}`;
let capturer = false;
const capture = async (nom, sel = null) => {
  if (!CAPTURES || !capturer) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(Q('[data-carte-fermer]')); await pause(40); }
  if (sel) await pg.$eval(sel, (x) => x.scrollIntoView({ block: 'center' })); else await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};
// Pour chaque question répondue : un verdict s'est-il affiché tout de suite (sinon : corrigée au bilan) ?
const VERDICTS = {};
const panneau = () => pg.$eval(Q('[data-q-panneau]'), (e) => e.dataset.qPanneau).catch(() => null);
// Répond au panneau ouvert (puis reprend), tant qu'il y en a un. `vus` : les ids des questions répondues, dans l'ordre.
async function qrep(choix = BONNES_Q, vus = []) {
  await pause(60);
  for (let i = 0; i < 6; i++) {
    const id = await panneau();
    if (!id) return vus;
    vus.push(id);
    await pg.click(Q(`[data-q-choix="${choix[id]}"][data-q="${id}"]`));
    await pg.click(Q(`[data-q-repondre="${id}"]`));
    await pause();
    VERDICTS[id] = !!(await pg.$(Q('[data-q-verdict]')));
    await pg.click(Q('[data-q-reprendre]'));
    await pause();
  }
  return vus;
}
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(Q('[data-confirme-oui]')); await pause(); } };

// ① l'accueil de Jan : `rep` donne la première réponse de chaque réplique ; une maladroite est suivie de la juste (sauf `accepte`, à la fin).
const dire = async (val) => { await pg.click(Q(`[data-dlg-choix="${val}"]`)); await pause(); };
async function accueil(rep = DIAL, choix = BONNES_Q, vus = []) {
  await allerV('telephone');
  await pg.click(Q('[data-dlg-appeler="jan"]')); await pause();
  for (const r of ORDRE_DIAL) {
    await dire(rep[r]);
    if (rep[r] !== DIAL[r] && r !== 'fin') await dire(DIAL[r]);
  }
  await capture('1-accueil-jan');
  await pg.click(Q('[data-dlg-raccrocher]')); await pause();
  await qrep(choix, vus);
}
// ② le quai : l'inspection (zones du moteur), « C'est bon », la dépose, le contrôle, les réserves, la signature, la clôture.
const SVG = `${Z} [data-q-inspection]`;
const zones = () => pg.evaluate(async (QID) => {
  const Qm = await import('/core/types/quai.js');
  const D = await import('/contenus/action-ent89-donnees.js');
  const S = D.quaiDeBase(window.__f.db).securite, q = window.__f.db.quais && window.__f.db.quais[QID];
  return Qm.zonesScene(S, Qm.etatsScene(S, q && q.securite));
}, QID);
async function cliquerVB(x, y) {
  const loc = pg.locator(SVG);
  await loc.scrollIntoViewIfNeeded();
  const bb = await loc.boundingBox();
  const [vx, vy, vw, vh] = await loc.evaluate((s) => s.getAttribute('viewBox').split(' ').map(Number));
  const k = Math.min(bb.width / vw, bb.height / vh);
  await pg.mouse.click(bb.x + (bb.width - vw * k) / 2 + (x - vx) * k, bb.y + (bb.height - vh * k) / 2 + (y - vy) * k);
  await pause(40);
}
async function vueScene(vue) {
  if ((await pg.$eval(SVG, (s) => s.dataset.vue)) === vue) return;
  if (vue === 'dedans' && !(await present('[data-q="sc-vue"]'))) await pg.click(Q('[data-q="sc-ouvrir"]'));
  else await pg.click(Q('[data-q="sc-vue"]'));
  await pg.waitForFunction(({ Z, v }) => document.querySelector(`${Z} [data-q-inspection]`).dataset.vue === v, { Z, v: vue });
}
async function marquer(id) { const z = (await zones()).find((q) => q.id === id); await vueScene(z.vue); const r = z.rects[0]; await cliquerVB(r.x + r.w / 2, r.y + r.h / 2); }
const signaler = async () => { await pg.click(Q('[data-q="sc-signaler"]')); await pause(); };
const cestBon = async () => { await pg.click(Q('[data-q="sc-decharger"]')); await pg.click(Q('[data-q="sc-decharger"]')); await pause(); };
const posees = () => pg.$$eval(Q('[data-iso-posee]'), (L) => L.length);
async function quai(T, o = {}) {
  const choix = o.q || BONNES_Q, vus = o.vus || [];
  const pal = Object.assign({}, T.pal, o.pal || {}), res = o.res || T.res;
  await allerV('quai');
  await pg.waitForSelector(SVG);
  await capture('2-quai-dehors');
  for (const ids of (o.envois || [T.scene])) {
    if (!ids.length) continue;
    for (const id of ids) await marquer(id);
    await signaler();
    await qrep(choix, vus);
  }
  await cestBon();
  await qrep(choix, vus);
  await pg.click(Q('[data-q="decharger"]'));
  await pg.waitForSelector(Q('[data-q-phase="choix"]'));
  for (const [k, p] of SORTIE.entries()) {
    const L = (o.depose && o.depose[p]) || [DEPOSE_JUSTE[p]];
    for (const c of L) {
      const n = await posees();
      await pg.click(Q(`[data-q="depose"][data-c="${c}"]`));
      await pause();
      if (k === 1 && c === L[0]) await capture('3-quai-depose', `${Z} [data-q-phase]`);
      if (c !== L[L.length - 1]) vrai((await posees()) === n, `${p} : la case ${c} n’aurait pas dû poser la palette`);
    }
  }
  await qrep(choix, vus);
  await pg.waitForSelector(Q('[data-q="vers3"]:not([disabled])'));
  await pg.click(Q('[data-q="vers3"]')); await pause();
  for (const [n, id] of ['P1', 'P2', 'P3', 'P4'].entries()) {
    const [compte, decision, motif] = pal[id];
    await pg.click(Q(`[data-q="sel"][data-n="${n}"]`)); await pause(30);
    if ((o.tour || T.tour) === id) { await pg.click(Q('[data-q="tourner"]')); await pg.click(Q('[data-q="tourner"]')); await pause(30); }
    await pg.fill(Q('#qCompte'), String(compte)); await pg.press(Q('#qCompte'), 'Enter');
    await pg.click(Q(`#qDec-${decision}`));
    if (motif) await pg.click(Q(`#qMot-${motif}`));
    await pg.click(Q('[data-q="valider"]'));
    await qrep(choix, vus);
  }
  await pg.click(Q('[data-q="vers4"]')); await pg.click(Q('[data-q="vers4"]')); await pause();
  for (const [id, val] of Object.entries(res)) if (await present(`#qRes-${id}`)) await pg.fill(Q(`#qRes-${id}`), val);
  if (o.deballage) await pg.check(Q('[data-q-deballage]'));
  await pg.click(Q('[data-q="ecrire"]')); await pause();
  await pg.click(Q('[data-q="signer"]')); await pause();
  await qrep(choix, vus);
  if (await present('[data-q="rentrer"]:not([disabled])')) { await pg.click(Q('[data-q="rentrer"]')); await pause(); }
  await pg.click(Q('[data-q="clore"]')); await pause();
  await qrep(choix, vus);
  return vus;
}
// ③ la fiche « La palette de Lucas »
async function ficheLucas(rep, choix = BONNES_Q, vus = []) {
  await allerV('fiche');
  for (const [id, val] of Object.entries(rep)) { await pg.check(Q(`input[data-fiche-champ="${id}"][value="${val}"]`)); await pause(30); }
  await capture('4-fiche-lucas');
  await pg.click(Q('[data-fiche-envoyer]')); await confirmer();
  await qrep(choix, vus);
  return vus;
}
// ④ le compte rendu
async function ouvrirMail(sujet) {
  await allerV('mail');
  await pg.click(Q('[data-dossier="in"]'));
  await pg.click(Q(`.ent-obj:text-is("${sujet}")`));
  await pause();
}
const choixDe = (ligne) => pg.$$eval(Q(`[data-phrase="${ligne}"] option`), (L) => L.map((x) => x.textContent.trim()).filter((t) => t && !/^Choisir/.test(t)));
async function compteRendu(lignes, choix = BONNES_Q, deja = false) {
  if (!deja) { await ouvrirMail('Fais-moi le point'); await pg.click(Q('[data-repondre]')); }
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  const vus = [];
  for (const [l, t] of Object.entries(lignes)) { await pg.selectOption(Q(`[data-phrase="${l}"]`), { label: t }); vus.push(...(await qrep(choix))); }
  await capture('5-compte-rendu');
  await pg.click(Q('#formPhr button[type="submit"]'));
  await confirmer();
  vus.push(...(await qrep(choix)));
  return vus;
}
async function parcours(T, o = {}) {
  const vus = [];
  await accueil(o.dial || DIAL, o.q, vus);
  await quai(T, { ...o, vus });
  await ficheLucas(o.lucas || T.lucas, o.q, vus);
  await compteRendu(o.cr || T.cr, o.q);
  return vus;
}
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { fin: b.dataset.fin, lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]),
    corriger: !!b.querySelector('[data-fin-corriger]'), fige: !!b.querySelector('[data-fin-fige]'), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});
const cases = () => pg.$$eval(Q('[data-fin-case]'), (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.textContent.replace(/\s+/g, ' ').trim(),
  l.querySelector('[data-fin-aller]')?.dataset.finAller || '']));
const jalonsFaux = (n) => JALONS.filter((j) => n.detail[j] !== 'ok');

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-8.9 : déclaration (CAP, C1.3 + C1.4, entraînement, 20 points, parcours après ENT-8.8, livrée fermée aux élèves) ; poids par bloc (somme 20) ; questions ; le quai complet', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-palette-lucas.js');
    const S = await import('/contenus/action-ent89.js');
    const Qs = await import('/contenus/questions/ENT-8.9.js');
    const D = await import('/contenus/action-ent89-donnees.js');
    const Qm = await import('/core/types/quai.js');
    const m = A.meta, E = S.ETAPES;
    const q = D.quaiDe('temoin-1');
    return {
      m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.parcours, m.correction, m.bilanDetail, m.precedente,
        m.niveauxPrevus, m.questions, m.pret, m.ouverture, m.corrige],
      ids: E.map((e) => e.id), poids: E.map((e) => e.poids), somme: E.reduce((t, e) => t + e.poids, 0), part: Qs.QUESTIONS.part,
      parGroupe: Object.entries(E.reduce((o, e) => { o[e.groupe] = (o[e.groupe] || 0) + e.poids; return o; }, {})),
      ecrans: [...new Set(E.filter((e) => e.ecran).map((e) => e.ecran))], bonus: E.filter((e) => e.bonus).length,
      qFil: Qs.QUESTIONS.liste.filter((x) => x.type === 'fil').map((x) => [x.id, x.de, x.poids, x.apres || 'tout de suite', !!x.reflexion, x.quand.gestes]),
      ouv: [Qs.QUESTIONS.ouverture.tirage, Qs.QUESTIONS.ouverture.questions.length],
      quai: [q.id, q.rendu, q.froid, q.commence, q.arret, q.document, q.recommencer, q.securite.mode, q.securite.arret, q.securite.points.filter((p) => !p.ok).map((p) => p.objet),
        q.depose.cases.map((c) => c.id), q.camions.length, q.camions[0].palettes.length, q.dechargement.nom, JSON.stringify(q.aides), q.calcul.forme],
      verifier: Qm.verifierQuai(q), fin: S.OPTIONS.finFige, tel: [S.TELEPHONE.face, S.TELEPHONE.dialogues[0].contact],
    };
  });
  egal(r.m, ['action-palette-lucas', 'ENT-8.9', 'simulog', ['cap'], [], ['CAP-C1.3', 'CAP-C1.4'], 'entrainement', 20, true, true, true, 'action-controler',
    undefined, 'ENT-8.9', true, 'prof', './contenus/corriges/ENT-8.9.js'], 'meta ENT-8.9');
  egal(r.ids, JALONS, 'jalons');
  egal(r.poids, [0.5, 0.75, 0.5, 0.75, 0.5, 1.25, 1.25, 0.5, 0.25, 0.25, 0.25, 0.25, 0.5, 0.5, 1.5, 1, 0.5, 0.5, 1, 1, 1, 0.75, 0.75], 'poids jalon par jalon (écrits à la main)');
  proche(r.somme + r.part, 20, 'somme des poids des jalons et des questions');
  egal(r.parGroupe, [['Accueillir le chauffeur', 3], ['Avant de décharger', 3], ['Faire décharger et contrôler', 5.5], ['La palette de Lucas', 3], ['Rendre compte', 1.5]],
    'points par ligne du bandeau (brief §5)');
  egal(r.ecrans, ['dialogue:jan', 'fiche:lucas', `phrases:${PHR}`], '« Corriger » rouvre le dialogue, la fiche de Lucas et les phrases ; jamais le quai');
  egal(r.bonus, 0, 'aucun cas bonus (le quai ne connaît pas le niveau)');
  egal(r.qFil, [['qui-paie', 'romain', 1.5, 'tout de suite', false, [`quai:${QID}:cloturer`]], ['refus-signer', 'romain', 1.5, 'bilan', false, [`quai:${QID}:valider`]],
    ['rappel-lucas', 'ines', 1, 'tout de suite', false, ['fiche:lucas:envoyer']], ['se-comprendre', 'romain', undefined, 'tout de suite', true, ['dialogue:jan:fin']]], 'questions au fil');
  egal(r.ouv, [{ preparation: 3, image: 1 }, 10], 'Avant de commencer : 10 notions, 3 + 1 tirées');
  egal(r.quai, [QID, 'iso', false, undefined, undefined, 'Bon de livraison — lettre de voiture', false, 'scene', false, ['cale', 'lampe'],
    ['allee-1', 'R1', 'R2', 'R3', 'R4', 'quai6-1'], 1, 4, 'Lucas', '{}', 'brouillon'], 'le quai complet (sans arret ni commence), aides éteintes');
  egal(r.verifier, [], 'verifierQuai');
  egal(r.fin, 'Jan a signé et il est reparti : la réception ne se refait pas.', 'finFige');
  egal(r.tel, [true, { nom: 'Jan', detail: 'chauffeur, camion de jouets' }], 'face à face avec Jan');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-8.9 : tirage — 200 graines : la date de Lucas 50 / 50 (35 à 65 %), 2 anomalies de scène (une facile, une autre), 1 problème + 1 piège + 2 conformes, zéro secours ; « ma réception » juste = ce que l’élève a écrit', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent89-donnees.js');
    const { tirerJeu } = await import('/core/tirage.js');
    const PLEIN = { P1: 24, P2: 40, P3: 25, P4: 36 };
    const o = { secours: 0, recent: 0, ancien: 0, scene: 0, roles: 0, qte: 0, bl: 0, faciles: new Set(), autres: new Set(), probs: new Set(), piegeSur: new Set(), probSur: new Set() };
    for (let i = 0; i < 200; i++) {
      const t = tirerJeu(D.TIRAGE, `eleve-${i}|action-palette-lucas`), j = t.jeu, P = j.palettes, de = (x) => P.filter((p) => p.role === x);
      if (t.secours) o.secours++;
      o[j.lucas]++;
      if (!(j.scene.length === 2 && ['cabine', 'cale'].includes(j.scene[0]) && ['niveleur', 'lampe', 'butoirs'].includes(j.scene[1]))) o.scene++;
      o.faciles.add(j.scene[0]); o.autres.add(j.scene[1]);
      if (de('probleme').length !== 1 || de('piege').length !== 1 || de('conforme').length !== 2) o.roles++;
      const pr = de('probleme')[0], pi = de('piege')[0];
      o.probs.add(pr.anomalie); o.piegeSur.add(pi.id); o.probSur.add(pr.id);
      const nAv = Object.keys(pr.avarie).length;
      if (!((pr.anomalie === 'ecrase-cache' && nAv === 1 && !pr.manque.length) || (pr.anomalie === 'manquant' && pr.manque.length === 2 && !nAv))
        || pi.manque.length !== { P1: 3, P2: 4, P3: 2, P4: 3 }[pi.id]) o.qte++;
      if (P.some((p) => p.bl !== (p.role === 'piege' ? PLEIN[p.id] - p.manque.length : PLEIN[p.id]))) o.bl++;
    }
    // « ma réception » : la juste suit les constats ÉCRITS (une base fabriquée : P2 avec 3 cartons abîmés, ou rien d'écrit).
    const db = (lignes, pal) => ({ tirage: { graine: 'temoin-4' }, quais: { 'action-quai5-labastide': { ecrit: true, lignes, palettes: pal } } });
    const ecrit = D.choixReception(db([{ id: 'P2' }], { P2: { decision: 'reserves', motif: 'avarie', res: '3' } }));
    const rien = D.choixReception(db([], {}));
    return { ...o, faciles: [...o.faciles].sort(), autres: [...o.autres].sort(), probs: [...o.probs].sort(), piegeSur: [...o.piegeSur].sort(), probSur: [...o.probSur].sort(), ecrit, rien };
  });
  egal([r.secours, r.scene, r.roles, r.qte, r.bl], [0, 0, 0, 0, 0], 'secours, scène, rôles, quantités, BL');
  vrai(r.recent >= 70 && r.recent <= 130, `date de Lucas : ${r.recent} récentes, ${r.ancien} anciennes sur 200`);
  egal([r.faciles, r.autres], [['cabine', 'cale'], ['butoirs', 'lampe', 'niveleur']], 'les anomalies tombent toutes');
  egal(r.probs, ['ecrase-cache', 'manquant'], 'les deux problèmes tombent');
  egal([r.piegeSur, r.probSur], [['P1', 'P2', 'P3', 'P4'], ['P1', 'P2', 'P3', 'P4']], 'piège et problème sur chaque palette');
  egal(r.ecrit[0], 'Camion de jouets reçu : réserve signée par Jan sur P2, 3 cartons abîmés.', 'la juste = ce que l’élève a écrit (même faux)');
  vrai(r.ecrit.includes('Tout est conforme, aucune réserve.') && new Set(r.ecrit).size === r.ecrit.length && r.ecrit.length === 4, 'quatre choix distincts : ' + r.ecrit);
  egal(r.rien[0], 'Tout est conforme, aucune réserve.', 'rien écrit : la juste est « Tout est conforme »');
  vrai(r.rien.includes('Camion de jouets reçu : réserve signée par Jan sur P3, 2 cartons manquants.'), 'rien écrit : le vrai problème est un piège : ' + r.rien);
});

await v('ENT-8.9 : contrôle d’équité — `verifier` refuse un rôle en double, une quantité hors règle, une scène sans anomalie facile ; le témoin et la référence passent', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent89-donnees.js');
    const j = () => JSON.parse(JSON.stringify(D.jeuDe('temoin-1')));
    const double = j(); double.palettes[1].role = 'probleme';
    const qte = j(); qte.palettes[0].avarie = { '0,0,0': [0, -1], '1,0,1': [0, -1] };
    const scene = j(); scene.scene = ['niveleur', 'lampe'];
    const date = j(); date.lucas = 'demain';
    return { double: D.verifier(double), qte: D.verifier(qte), scene: D.verifier(scene), date: D.verifier(date), bon: D.verifier(j()), ref: D.verifier(D.jeuDe('')) };
  });
  vrai(r.double.some((x) => /rôles/.test(x)), 'rôle en double : ' + r.double);
  vrai(r.qte.some((x) => /P1 : quantités/.test(x)), 'deux écrasés derrière : ' + r.qte);
  vrai(r.scene.some((x) => /scène/.test(x)), 'scène sans facile : ' + r.scene);
  vrai(r.date.some((x) => /date de Lucas/.test(x)), 'date inconnue : ' + r.date);
  egal([r.bon, r.ref], [[], []], 'témoin et référence');
});

// ─────────────────────────────────────────────────────────── la ligne 2 de la fiche et la phrase de Lucas (bases fabriquées)
await v('ENT-8.9 : la palette de Lucas — ligne 2 jugée contre la DATE TIRÉE (témoin ancien « oui » ✗, récent « oui » ✓) ; la phrase juste suit SA ligne 2 (une erreur ne se paie qu’une fois)', async () => {
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent89.js');
    const D = await import('/contenus/action-ent89-donnees.js');
    const j = (id) => S.ETAPES.find((e) => e.id === id);
    const db = (g, v) => ({ tirage: { graine: g }, fiches: { lucas: { valeurs: { 'aurait-du': 'tour-reserve', protester: v, palette: 'litiges' }, envoye: { at: 1 } } } });
    return {
      ancienOui: j('lucas-protester').verifier(db('temoin-1', 'oui-3j')).status, ancienNon: j('lucas-protester').verifier(db('temoin-1', 'non-3j')).status,
      recentOui: j('lucas-protester').verifier(db('temoin-4', 'oui-3j')).status, recentNon: j('lucas-protester').verifier(db('temoin-4', 'non-3j')).status,
      phraseAncienOui: D.justePhraseLucas(db('temoin-1', 'oui-3j')), phraseAncienNon: D.justePhraseLucas(db('temoin-1', 'non-3j')),
      phraseRecentCourriel: D.justePhraseLucas(db('temoin-4', 'oui-courriel')), phraseAncienAn: D.justePhraseLucas(db('temoin-1', 'oui-an')),
      vide: j('lucas-protester').verifier({ tirage: { graine: 'temoin-1' } }).status,
      dates: [D.dateLucas({ tirage: { graine: 'temoin-1' } }).jour, D.dateLucas({ tirage: { graine: 'temoin-4' } }).jour],
    };
  });
  egal([r.ancienOui, r.ancienNon, r.recentOui, r.recentNon, r.vide], ['ko', 'ok', 'ok', 'ko', 'attente'], 'ligne 2 selon la date');
  egal([r.phraseAncienOui, r.phraseAncienNon, r.phraseRecentCourriel, r.phraseAncienAn], [0, 1, 0, 1], 'la phrase juste suit sa réponse (sinon sa date)');
  egal(r.dates, ['lundi 14 décembre', 'jeudi 17 décembre'], 'dates des témoins');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await v('ENT-8.9 : parcours juste à l’écran (témoin récent, manquant) — 20 / 20, bandeau de 6 lignes ✓ ; se-comprendre au « Terminer », refus-signer à la 1re palette, qui-paie à la clôture, rappel-lucas à l’envoi de la fiche', async () => {
  capturer = true;
  await monter({ uid: 'ac89-juste', graine: 'temoin-4', sansOuverture: true });
  const ov = (await base()).questions[ID]['@tirage'].ids;
  egal([ov.length, ov.filter((id) => /^img-/.test(id)).length], [4, 1], '3 notions et 1 image tirées');
  for (let k = 0; k < 4; k++) {
    await pg.click(Q(`[data-ouv-aller="${k}"]`)); await pause();
    if (k === 0) await capture('0-avant-de-commencer');
    await pg.click(Q(`[data-q-choix="${REP_OUV[ov[k]]}"][data-q="${ov[k]}"]`));
    await pg.click(Q(`[data-q-repondre="${ov[k]}"]`)); await pause();
  }
  await pg.click(Q('[data-ouv-continuer]')); await pause();
  vrai(await present('.ent-nav[data-vue-fermee="quai"]') && await present('.ent-nav[data-vue-fermee="fiche"]'), 'le quai et la fiche grisés au départ');
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'inaction : 0');
  const vus = [];
  await accueil(DIAL, BONNES_Q, vus);
  egal(vus, ['se-comprendre'], 'se-comprendre au « Terminer »');
  vrai(/Je te joins aussi « Le droit »/.test((await entrants()).find((m) => m.subject === 'Le camion est à quai').text), 'le message du quai joint « Le droit »');
  await quai(T4, { vus });
  egal(vus, ['se-comprendre', 'refus-signer', 'qui-paie'], 'refus-signer à la 1re palette validée, qui-paie à la clôture');
  const t4 = await pg.textContent(Q('[data-quai]'));
  vrai(/Bon de livraison — lettre de voiture n° JOU-1812-05/.test(t4), 'le titre du document');
  vrai(!!(await entrants()).find((x) => x.subject === 'La palette de Lucas'), 'le message d’Inès à la signature');
  await ficheLucas(T4.lucas, BONNES_Q, vus);
  egal(vus.slice(-1), ['rappel-lucas'], 'rappel-lucas à l’envoi de la fiche');
  egal(['refus-signer', 'qui-paie', 'rappel-lucas'].map((id) => VERDICTS[id]), [false, true, true], 'refus-signer corrigée au bilan, qui-paie et rappel-lucas tout de suite');
  await ouvrirMail('Fais-moi le point'); await pg.click(Q('[data-repondre]')); await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  egal((await choixDe('reception')).sort(), ['Camion de jouets reçu : réserve signée par Jan sur P1, 2 cartons manquants.',
    'Camion de jouets reçu : réserve signée par Jan sur P3, 2 cartons manquants.', 'Camion de jouets reçu : réserve signée par Jan sur P3, 3 cartons manquants.',
    'Tout est conforme, aucune réserve.'], 'les choix de « ma réception », calculés sur SES réserves');
  await compteRendu(T4.cr, BONNES_Q, true);
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  egal(['question:qui-paie', 'question:refus-signer', 'question:rappel-lucas'].map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
  egal(n.detail['question:se-comprendre'], undefined, 'se-comprendre sans note');
  proche(n.score, 20, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  await pg.$eval(Q('[data-fin-seance]'), (e) => e.scrollIntoView({ block: 'start' })); await capture('6-bilan');
  capturer = false;
  const M = await entrants();
  egal(M.map((x) => x.subject), ['Le camion de jouets', 'Le camion est à quai', 'La palette de Lucas', 'Fais-moi le point', 'Merci'], 'les messages, dans l’ordre');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun message ne dit juste / faux / correct / erreur / bonus');
  vrai(M.every((x, i) => !i || x.ts >= M[i - 1].ts), 'heures croissantes');
  const d0 = new Date(M[0].ts);
  vrai(d0.getMonth() === 11 && d0.getDate() === 18 && d0.getHours() === 6, 'le 18 décembre, 6 h 55 : ' + d0);
  const ecrit = [...M.map((x) => x.text), ...(await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent89.js'); return S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html({}) : d.html || '')); }))].join('\n');
  vrai(!/\b20\d\d\b/.test(ecrit.replace(/consulté le \d\d\/\d\d\/20\d\d/g, '')), 'une année dans un message ou un document (hors date de consultation du droit)');
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.9 : témoin ancien (écrasé derrière) — 20 / 20 avec « non, plus de 3 jours » ; le document de Lucas dit « reçu le lundi 14 décembre », case Réserves vide ; le calendrier entoure vendredi 18', async () => {
  await monter({ uid: 'ac89-ancien', graine: 'temoin-1' });
  await parcours(T1);
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  proche(n.score, 20, 'note');
  await allerV('fiche');
  const docs = await pg.$$eval(Q('[data-fiche-doc]'), (L) => L.map((x) => x.dataset.ficheDoc));
  egal(docs, ['bl-lucas', 'palette-lucas', 'calendrier', 'droit'], 'les quatre documents à gauche de la fiche');
  const bl = await pg.textContent(Q('[data-fiche-panneau]'));
  vrai(/Reçu le\s*lundi 14 décembre/.test(bl) && /Lucas/.test(bl), 'reçu le lundi 14 : ' + bl.slice(0, 300));
  vrai(!!(await pg.$(Q('[data-fiche-panneau] [aria-label="Case réserves, vide"]'))), 'case Réserves vide');
  await pg.click(Q('[data-fiche-doc="calendrier"]')); await pause();
  const cal = await pg.$$eval(Q('[data-fiche-panneau] svg[role="img"]'), (L) => L.map((s) => s.getAttribute('aria-label')).join(' | '));
  vrai(/lundi 14, mardi 15, mercredi 16, jeudi 17, vendredi 18 décembre ; vendredi 18, aujourd’hui, est entouré/.test(cal), 'le calendrier : ' + cal);
  await pg.click(Q('[data-fiche-doc="droit"]')); await pause();
  const droit = await pg.textContent(Q('[data-fiche-panneau]'));
  vrai(droit.includes('« Le voiturier est garant de la perte des objets à transporter, hors les cas de la force majeure.')
    && droit.includes('Il est garant des avaries autres que celles qui proviennent du vice propre de la chose ou de la force majeure. »'), 'L133-1, alinéas 1 et 2 (Légifrance)');
  vrai(droit.includes('« La réception des objets transportés éteint toute action contre le voiturier pour avarie ou perte partielle si dans les trois jours, '
    + 'non compris les jours fériés, qui suivent celui de cette réception, le destinataire n’a pas notifié au voiturier, par acte extrajudiciaire ou par '
    + 'lettre recommandée, sa protestation motivée. »') && /consulté le 17\/10\/2026/.test(droit), 'L133-3, texte identique à ENT-8.8');
});

await v('ENT-8.9 : une erreur ne se paie qu’une fois (témoin ancien) — « oui, dans les 3 jours » à la fiche : ligne 2 ✗ ; la même idée dans le compte rendu : ✓ ; la bonne phrase (« plus de 3 jours ») y serait ✗', async () => {
  await monter({ uid: 'ac89-unefois', graine: 'temoin-1' });
  await parcours(T1, { lucas: { ...T1.lucas, protester: 'oui-3j' }, cr: { ...T1.cr, lucas: P_DANS } });
  const n = await note();
  egal(jalonsFaux(n), ['lucas-protester'], 'seule la ligne 2 est fausse');
  proche(n.score, 19, 'note');
  await monter({ uid: 'ac89-unefois-2', graine: 'temoin-1' });
  await parcours(T1, { lucas: { ...T1.lucas, protester: 'oui-3j' }, cr: { ...T1.cr, lucas: P_PLUS } });
  egal(jalonsFaux(await note()), ['lucas-protester', 'cr-lucas'], 'la phrase de la date, contre sa réponse : fausse');
});

await v('ENT-8.9 : inaction et pire cas (témoin récent) — rien fait : 0 ; tout faux : premier bilan, « Corriger » rouvre le dialogue, la fiche et les phrases, jamais le quai ; finFige', async () => {
  await monter({ uid: 'ac89-pire', graine: 'temoin-4' });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'inaction');
  await accueil(DIAL_FAUX, FAUSSES_Q);
  await quai(T4, { q: FAUSSES_Q, envois: [['butoirs']], depose: { P4: ['allee-1', 'R1'], P3: ['quai6-1', 'R2'], P2: ['R3'], P1: ['R4'] },
    pal: { P1: [23, 'reserves', 'manquant'], P2: [40, 'reserves', 'avarie'], P3: [25, 'accepter'], P4: [36, 'reserves', 'manquant'] },
    res: { P1: '1', P2: '1', P4: '3' }, deballage: true });
  await ficheLucas({ 'aurait-du': 'rien', protester: 'oui-an', palette: 'stock' }, FAUSSES_Q);
  await compteRendu({ salutation: 'Coucou,', reception: 'Tout est conforme, aucune réserve.', lucas: 'Ce n’est pas grave, je la mets en stock.', fin: 'Bisous' }, FAUSSES_Q);
  const n = await note();
  // Restent justes : la signature (obligatoire pour continuer), P2 et P1 posées du premier coup (les deux pièges sont grisés pour tous, comme ENT-8.7).
  egal(JALONS.filter((j) => n.detail[j] === 'ok'), ['depose-P1', 'depose-P2', 'signature'], 'tout faux sauf la signature et les deux dernières palettes');
  proche(n.score, 1, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ko']), 'bandeau');
  vrai(b.corriger && b.fige && /Jan a signé et il est reparti : la réception ne se refait pas\./.test(b.texte), 'Corriger et finFige : ' + b.texte);
  const allers = [...new Set((await cases()).map((c) => c[3]).filter(Boolean))].sort();
  egal(allers, ['dialogue:jan', 'fiche:lucas', `phrases:${PHR}`], 'ce qui se rouvre');
  vrai(!!((await base()).points && (await base()).points[ID]), 'photo de fin rangée (la séance suivante s’ouvrirait)');
});

await v('ENT-8.9 : dialogue — la phrase longue au « quai » : Jan réagit (« Trop vite »), l’entretien finit ; seul ce jalon ✗ ; « Corriger » → « Revenir le voir », rejoué juste : ✓', async () => {
  await monter({ uid: 'ac89-dial', graine: 'temoin-4' });
  await allerV('telephone');
  vrai(/Romain : « Ce matin, tu reçois seul le camion de jouets, quai 5, 7 h\. »/.test(await pg.textContent(Q('.dlg-repos')).catch(() => '')), 'la consigne de Romain en haut de l’écran');
  egal(await pg.textContent(Q('[data-dlg-appeler="jan"]')), 'Aller le voir', 'face à face');
  await pg.click(Q('[data-dlg-appeler="jan"]')); await pause();
  await dire('bienvenue'); await dire('ldv'); await dire('long');
  vrai(/Pardon \? Trop vite\./.test(await pg.textContent(Q('[data-dlg-fil]'))), 'Jan réagit');
  egal((await pg.$$eval(Q('[data-dlg-choix]:not([disabled])'), (L) => L.map((x) => x.dataset.dlgChoix))).sort(), ['ou', 'quai5'], 'la réplique revient');
  await dire('quai5'); await dire('local'); await dire('merci');
  vrai(/D’accord\. J’attends\./.test(await pg.textContent(Q('[data-dlg-fil]'))), 'la dernière bulle de Jan');
  await pg.click(Q('[data-dlg-raccrocher]')); await pause(); await qrep();
  await quai(T4); await ficheLucas(T4.lucas); await compteRendu(T4.cr);
  let n = await note();
  egal(jalonsFaux(n), ['accueil-quai'], 'seul le jalon « quai » est faux');
  await pg.click(Q('[data-fin-corriger]')); await pause();
  await allerV('telephone');
  egal(await pg.textContent(Q('[data-dlg-appeler="jan"]')), 'Revenir le voir', 'le bouton de la correction');
  await pg.click(Q('[data-dlg-appeler="jan"]')); await pause();
  for (const r of ORDRE_DIAL) await dire(DIAL[r]);
  await pg.click(Q('[data-dlg-raccrocher]')); await pause(); await qrep();
  n = await note();
  egal(n.detail['accueil-quai'], 'ok', 'rejoué juste');
  vrai(n.score > 19 && n.score < 20, 'note moyennée après correction : ' + n.score);
});

await v('ENT-8.9 : inspection (entraînement) — une seule anomalie sur deux signalée : 1,25 / 2,5, rien n’arrête l’élève, le défaut oublié est remis en ordre sans un mot ; rien signalé : « aucun faux » ✗', async () => {
  await monter({ uid: 'ac89-insp', graine: 'temoin-4' });
  await accueil();
  await allerV('quai'); await pg.waitForSelector(SVG);
  vrai(/Le camion est à quai\. Tu sais ce qu’il faut regarder avant que Lucas entre\./.test(await texte()), 'la consigne de Romain en tête du quai');
  await marquer('cale'); await signaler();
  await cestBon();
  vrai(!(await present('[data-q-secu-arret]')), 'rien n’arrête l’élève');
  vrai(await present('[data-q="decharger"]'), 'le déchargement est proposé');
  const db = await base();
  egal([db.quais[QID].securite.fait, db.quais[QID].securite.arrete], [true, false], 'inspection figée, sans arrêt');
  const r = await pg.evaluate(async () => {
    const S = await import('/contenus/action-ent89.js');
    const j = (id, db) => S.ETAPES.find((e) => e.id === id).verifier(db).status;
    const db = JSON.parse(JSON.stringify(window.__f.db));
    const vide = JSON.parse(JSON.stringify(db)); vide.quais['action-quai5-labastide'].securite.signaux = [];
    return { s1: j('securite-1', db), s2: j('securite-2', db), af: j('securite-aucun-faux', db), videAf: j('securite-aucun-faux', vide), videS1: j('securite-1', vide) };
  });
  egal([r.s1, r.s2, r.af], ['ok', 'ko', 'ok'], 'cale ✓, niveleur oublié ✗, aucun faux ✓');
  egal([r.videS1, r.videAf], ['ko', 'ko'], 'rien signalé : danger ✗ et « aucun faux » ✗');
});

await v('ENT-8.9 : écrans à 1366 × 768 — l’accueil, le quai pendant le choix d’une case (cases R1 à R4, allée, quai 6), la fiche de Lucas avec ses documents, le compte rendu : aucun défilement horizontal', async () => {
  capturer = true;
  await monter({ uid: 'ac89-ecran', graine: 'temoin-1' });
  const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await allerV('telephone');
  vrai(await large() <= 0, 'accueil : défilement horizontal');
  await accueil();
  await allerV('quai'); await pg.waitForSelector(SVG);
  for (const id of T1.scene) await marquer(id);
  await signaler(); await qrep(); await cestBon(); await qrep();
  await pg.click(Q('[data-q="decharger"]')); await pg.waitForSelector(Q('[data-q-phase="choix"]'));
  egal(await pg.$$eval(Q('[data-q="depose"]'), (L) => L.map((x) => x.dataset.c)), ['allee-1', 'R1', 'R2', 'R3', 'R4', 'quai6-1'], 'six cases, de gauche à droite');
  egal(await pg.getAttribute(Q('[data-q="depose"][data-c="quai6-1"]'), 'aria-label'), 'Devant le quai 6', 'le nom lu au clavier : le lieu');
  await capture('3-quai-choix-case', `${Z} [data-q-phase]`);
  vrai(await large() <= 0, 'quai : défilement horizontal');
  await monter({ uid: 'ac89-ecran2', graine: 'temoin-1' });
  await accueil(); await quai(T1);
  await allerV('fiche');
  await capture('4-fiche-lucas-documents');
  vrai(await large() <= 0, 'fiche : défilement horizontal');
  await ficheLucas(T1.lucas);
  await ouvrirMail('Fais-moi le point'); await pg.click(Q('[data-repondre]')); await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  await capture('5-compte-rendu-ouvert');
  vrai(await large() <= 0, 'compte rendu : défilement horizontal');
  capturer = false;
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.9 : étape suivante — la barre mène à « Au quai », au quai, à la fiche de Lucas, puis au compte rendu', async () => {
  const barre = () => pg.$eval(Q('[data-suite-seance]'), (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => null);
  await monter({ uid: 'ac89-suite', graine: 'temoin-4' });
  egal(await barre(), 'Étape suivante : Au quai : accueillir le chauffeur Y aller →', 'au départ');
  await accueil();
  egal(await barre(), 'Étape suivante : Le quai 5 : inspecter, décharger, contrôler Y aller →', 'après l’accueil');
  await quai(T4);
  await allerV('mail');
  egal(await barre(), 'Étape suivante : La palette de Lucas Y aller →', 'après le quai');
  await pg.click(Q('[data-suite-aller]')); await pause();
  vrai(await present('[data-fiche="lucas"]'), 'la barre ouvre la fiche');
  await ficheLucas(T4.lucas);
  egal(await barre(), 'Étape suivante : Rendre compte à Romain Y aller →', 'après la fiche');
});

await v('ENT-8.9 : confirmé — même contenu que le standard (aucun bonus), bandeau identique, note du socle ; aucun « bonus » écrit', async () => {
  await monter({ uid: 'ac89-conf', graine: 'temoin-4', aisance: 'confirme' });
  await parcours(T4);
  const n = await note();
  proche(n.score, 20, 'note');
  egal(n.detail.bonus, undefined, 'pas de bonus');
  egal((await fin()).lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  vrai(!/bonus/i.test(await texte()), 'le mot « bonus » à l’écran');
});

await v('ENT-8.9 : parcours — fermée tant qu’ENT-8.8 n’a pas son premier bilan, ouverte ensuite', async () => {
  const r = await pg.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const { verrou } = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const de = (id) => metas.find((x) => x.id === id);
    const uid = 'u-verrou-action89', gid = 'g-verrou-action89', profil = { role: 'eleve', uid };
    const k = `prepalog:prive/${uid}/action-controler`;
    localStorage.removeItem(k);
    const avant = await verrou(metas, de('action-palette-lucas'), profil, gid);
    localStorage.setItem(k, JSON.stringify({ data: { v: 1, points: { 'action-controler': { v: 1 } } }, ts: 1 }));
    const apres = await verrou(metas, de('action-palette-lucas'), profil, gid);
    localStorage.removeItem(k);
    return { avant, apres };
  });
  egal(r.avant, 'Termine d\'abord ENT-8.8.', 'avant le premier bilan d’ENT-8.8');
  egal(r.apres, null, 'après');
});

await v('ENT-8.9 : corrigé enseignant — par élève : ses anomalies, ses palettes, la date de Lucas, les phrases d’un parcours juste ; avant ouverture : son jeu déjà le bon', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-8.9.js');
    const e = C.corrigeEleve({ tirage: { graine: 'temoin-4' } }, 'x');
    const vide = C.corrigeEleve({}, 'temoin-4');
    return { items: e.items.map((i) => [i.texte, i.rep]), memes: JSON.stringify(vide.items) === JSON.stringify(e.items), texte: vide.texte.length > 0, n: C.CORRIGE.items.length };
  });
  egal(r.items, [
    ['Ses anomalies au quai', 'Cale de roue absente · Niveleur relevé, pas posé sur la remorque'],
    ['P1 — Peluches', 'conforme, pleine · BL 24 · réel 24 · accepter · aucune réserve'],
    ['P2 — Jeux de société', 'conforme, pleine · BL 40 · réel 40 · accepter · aucune réserve'],
    ['P3 — Voitures miniatures, lot de 5', '2 cartons manquants dans la couche du dessus · BL 25 · réel 23 · accepter avec réserves (Manquant) · réserve : 2 carton(s) manquant(s)'],
    ['P4 — Pâte à modeler, lot de 8', 'PIÈGE : couche du dessus à moitié vide, mais le BL dit le même nombre · BL 33 · réel 33 · accepter · aucune réserve'],
    ['La palette de Lucas : reçue le', 'jeudi 17 décembre → on est dans les 3 jours : on peut protester'],
    ['Compte rendu : ma réception (parcours juste)', T4.cr.reception],
    ['Compte rendu : la palette de Lucas (réponse juste à la ligne 2)', P_DANS]], 'corrigé du témoin');
  vrai(r.memes && r.texte, 'élève qui n’a pas ouvert la séance : son jeu, déjà le bon');
  egal(r.n, 6, 'parties du corrigé commun');
});

await F.fermer();
}
