// Suite de tests de Prepalog — bloc « action-88 » : ENT-8.8 Action, « on vérifie qu'il ne manque rien » (CAP OL, guidage CAP-C1.4).
// Brief `docs/briefs/ENT-8.8-action-controler.md` §8 ; décisions du chef de chantier : `docs/briefs/COORDINATION-action.md` §8.
// `node outils/test.mjs action-88` ne lance que ce bloc. Aides communes (ouvrir la page, lire la base) : `outils/test/france-boissons/commun.mjs`.
//
// Valeurs ÉCRITES À LA MAIN. Le camion (CAMION_HAVRE) : P1 bougies 5 × 8 = 40 · P2 assiettes 4 × 6 = 24 · P3 boîtes 4 × 5 = 20 · P4 torchons 6 × 8 = 48.
// Deux élèves TÉMOINS (graine posée à la main dans `db.tirage`), relevés une fois et recopiés ici :
//   « temoin-1 » : P1 conforme (40) · P2 PIÈGE, couche du dessus à 3 cartons sur 6, BL 21 = réel 21 · P3 2 cartons écrasés devant (20) ·
//                  P4 2 cartons manquants (BL 48, réel 46). Q1 cite P2 (les assiettes).
//   « temoin-6 » : P1 conforme (40) · P2 2 cartons écrasés devant (24) · P3 1 carton écrasé DERRIÈRE (20) · P4 PIÈGE, 4 cartons sur 8 au dessus,
//                  BL 44 = réel 44. Q1 cite P1 (P2 avait un problème) : les bougies.
// Poids : palettes 2,5 (facile) · 2,5 (moyen) · 1,5 (piège) · 1,5 (conforme) ; réserves 1,5 × 2 · déballage 1 · signature 1 ; compte rendu 1 · 1 ·
// 0,5 · 0,5 ; questions Q1 1,5 · Q2 1,5 · Q3 1 (part 4).

import { ouvrirFB, proche } from './france-boissons/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const F = await ouvrirFB({ nav, BASE });
const { pg, Z, pause, base, note, present, aller, texte, entrants, erreursF } = F;
await pg.setViewportSize({ width: 1366, height: 768 });
await pg.emulateMedia({ reducedMotion: 'reduce' });
const CAPTURES = process.env.CAPTURES_ENT88 || '';

const ID = 'action-controler';
const QID = 'action-quai2-controler';
const PHR = 'compte-rendu-controle';
const REP_OUV = { reserve: 'remarque', avarie: 'abimee', manquant: 'absent', couches: 'juste', bl: 'apporte', 'lettre-voiture': 'transport',
  'zone-litiges': 'cote', 'img-carton-ecrase': 'ecrase', 'img-film': 'tenir', 'img-etiquette': 'contenu' };
const BONNES_Q = { 'trois-jours': '3j', 'pourquoi-signer': 'reconnaitre', 'qui-saisit': 'julie', 'pourquoi-litiges': 'stock' };
const FAUSSES_Q = { 'trois-jours': 'rien', 'pourquoi-signer': 'partir', 'qui-saisit': 'toi', 'pourquoi-litiges': 'pas-pense' };
const GROUPES = ['Contrôler les palettes', 'Les réserves et la signature', 'Rendre compte', 'Les questions de Samia'];
const JALONS = ['palette-facile', 'palette-moyen', 'palette-piege', 'palette-conforme', 'reserve-facile', 'reserve-moyen', 'deballage', 'signature',
  'cr-reserves', 'cr-litiges', 'cr-salutation', 'cr-fin'];
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus)\b/i;
// Le contrôle juste de chaque témoin : [comptage, décision, motif], puis la valeur de chaque réserve.
const T1 = { graine: 'temoin-1', pal: { P1: [40, 'accepter'], P2: [21, 'accepter'], P3: [20, 'reserves', 'avarie'], P4: [46, 'reserves', 'manquant'] },
  res: { P3: '2', P4: '2' } };
const T6 = { graine: 'temoin-6', pal: { P1: [40, 'accepter'], P2: [24, 'reserves', 'avarie'], P3: [20, 'reserves', 'avarie'], P4: [44, 'accepter'] },
  res: { P2: '2', P3: '1' } };
const CR1 = { salutation: 'Bonjour Samia,', reserves: 'Réserves signées par le chauffeur : P3, 2 cartons abîmés ; P4, 2 cartons manquants.',
  litiges: 'J’ai mis les 2 cartons abîmés de P3 en zone litiges.', fin: 'Je reste au quai. Lea' };
const CR6 = { salutation: 'Bonjour Samia,', reserves: 'Réserves signées par le chauffeur : P2, 2 cartons abîmés ; P3, 1 carton abîmé.',
  litiges: 'J’ai mis les 2 cartons abîmés de P2 et le carton abîmé de P3 en zone litiges.', fin: 'Je reste au quai. Lea' };

// Monte la séance dans la page. `o.graine` : la graine posée (l'élève témoin) ; les réponses d'« Avant de commencer » sont posées (sauf `sansOuverture`).
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import('/activites/action-controler.js');
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
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 'ac88' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'AC',
    lireScore: async () => null, rendreCopie: async () => ({ rendu: Date.now() }), suivante: null,
  });
  return JSON.parse(JSON.stringify(db));
}, { id: ID, rep: o.sansOuverture ? null : REP_OUV, ...o });
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
let capturer = false;
const capture = async (nom, plein = false) => {
  if (!CAPTURES || !capturer) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(`${Z} [data-carte-fermer]`); await pause(40); }
  if (typeof plein === 'string') await pg.$eval(Q(plein), (e) => e.scrollIntoView({ block: 'center' }));
  else if (!plein) await pg.evaluate(() => window.scrollTo(0, 0));
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png`, fullPage: plein === true });
};
// Répond au panneau ouvert (puis reprend), tant qu'il y en a un. Rend les ids des questions vues.
async function qrep(choix = BONNES_Q) {
  const vus = [];
  await pause(60);
  for (let i = 0; i < 6; i++) {
    const id = await pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
    if (!id) return vus;
    vus.push(id);
    await pg.click(`${Z} [data-q-choix="${choix[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`);
    await pause();
    await pg.click(`${Z} [data-q-reprendre]`);
    await pause();
  }
  return vus;
}
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); } };
const Q = (s) => `${Z} ${s}`;
// Le quai : chaque palette comptée, décidée, validée ; puis les réserves, la mention (o.deballage), la signature et la clôture.
async function quai(T, o = {}) {
  const pal = Object.assign({}, T.pal, o.pal || {}), res = Object.assign({}, T.res, o.res || {}), choix = o.q || BONNES_Q;
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  await capture('1-quai-ouverture');
  const ids = ['P1', 'P2', 'P3', 'P4'];
  for (let n = o.depuis || 0; n < 4; n++) {
    const [compte, decision, motif] = pal[ids[n]];
    await pg.click(Q(`[data-q="sel"][data-n="${n}"]`)); await pause(30);
    if (o.tour && o.tour === ids[n]) { await pg.click(Q('[data-q="tourner"]')); await pg.click(Q('[data-q="tourner"]')); await pause(30); }
    await pg.fill(Q('#qCompte'), String(compte)); await pg.press(Q('#qCompte'), 'Enter');
    await pg.click(Q(`#qDec-${decision}`));
    if (motif) await pg.click(Q(`#qMot-${motif}`));
    await pg.click(Q('[data-q="valider"]'));
    await qrep(choix);
  }
  await pg.click(Q('[data-q="vers4"]')); await pg.click(Q('[data-q="vers4"]')); await pause();
  for (const [id, val] of Object.entries(res)) if (await present(`#qRes-${id}`)) await pg.fill(Q(`#qRes-${id}`), val);
  if (o.deballage) await pg.check(Q('[data-q-deballage]'));
  await pg.click(Q('[data-q="ecrire"]')); await pause();
  await capture('3-reserves-ecrites', '[data-q-lignes]');
  await pg.click(Q('[data-q="signer"]')); await pause();
  await qrep(choix);
  await pg.click(Q('[data-q="clore"]')); await pause();
  const vus = await qrep(choix);
  return vus;
}
async function ouvrirMail(sujet) {
  await allerV('mail');
  await pg.click(Q('[data-dossier="in"]'));
  await pg.click(Q(`.ent-obj:text-is("${sujet}")`));
  await pause();
}
const choixDe = (ligne) => pg.$$eval(Q(`[data-phrase="${ligne}"] option`), (L) => L.map((x) => x.textContent.trim()).filter((t) => t && !/^Choisir/.test(t)));
async function compteRendu(lignes, choix = BONNES_Q, deja = false) {
  if (!deja) { await ouvrirMail('Ton compte rendu'); await pg.click(Q('[data-repondre]')); }
  await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  const vus = [];
  for (const [l, t] of Object.entries(lignes)) { await pg.selectOption(Q(`[data-phrase="${l}"]`), { label: t }); vus.push(...(await qrep(choix))); }
  await capture('4-compte-rendu');
  await pg.click(Q('#formPhr button[type="submit"]'));
  await confirmer();
  vus.push(...(await qrep(choix)));
  return vus;
}
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { fin: b.dataset.fin, lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]),
    corriger: !!b.querySelector('[data-fin-corriger]'), fige: !!b.querySelector('[data-fin-fige]'), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});
const cases = () => pg.$$eval(Q('[data-fin-case]'), (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.textContent.replace(/\s+/g, ' ').trim()]));
const jalonsFaux = (n) => JALONS.filter((j) => n.detail[j] !== 'ok');

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-8.8 : déclaration (CAP, CAP-C1.4, guidage, 20 points, parcours après ENT-8.7, livrée fermée aux élèves) ; poids par bloc ; questions Q1 à Q4 ; le quai', async () => {
  const r = await pg.evaluate(async () => {
    const A = await import('/activites/action-controler.js');
    const S = await import('/contenus/action-ent88.js');
    const Qs = await import('/contenus/questions/ENT-8.8.js');
    const D = await import('/contenus/action-ent88-donnees.js');
    const Qm = await import('/core/types/quai.js');
    const m = A.meta, E = S.ETAPES;
    const q = D.quaiDe('');
    return {
      m: [m.id, m.code, m.rubrique, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.parcours, m.correction, m.bilanDetail, m.precedente,
        m.niveauxPrevus, m.questions, m.pret, m.ouverture, m.corrige],
      ids: E.map((e) => e.id), poids: E.map((e) => e.poids), somme: E.reduce((t, e) => t + e.poids, 0), part: Qs.QUESTIONS.part,
      parGroupe: Object.entries(E.reduce((o, e) => { o[e.groupe] = (o[e.groupe] || 0) + e.poids; return o; }, {})),
      ecrans: E.filter((e) => e.ecran).map((e) => [e.id, e.ecran]),
      qPoids: Qs.QUESTIONS.liste.filter((x) => x.type === 'fil').map((x) => [x.id, x.poids, x.apres || 'tout de suite', !!x.reflexion]),
      ouv: [Qs.QUESTIONS.ouverture.tirage, Qs.QUESTIONS.ouverture.questions.length],
      quai: [q.id, q.rendu, q.froid, q.commence, q.document, q.recommencer, q.securite, q.arret, q.motifs, q.camions.length, q.camions[0].palettes.length,
        q.camions[0].transporteur, q.dechargement.nom],
      verifier: Qm.verifierQuai(q), fin: S.OPTIONS.finFige,
    };
  });
  egal(r.m, ['action-controler', 'ENT-8.8', 'simulog', ['cap'], [], ['CAP-C1.4'], 'guidage', 20, true, true, true, 'action-decharger', ['confirme', 'accompagne'], 'ENT-8.8',
    true, 'prof', './contenus/corriges/ENT-8.8.js'], 'meta ENT-8.8');
  egal(r.ids, JALONS, 'jalons');
  egal(r.poids, [2.5, 2.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, 0.5, 0.5], 'poids jalon par jalon (écrits à la main)');
  proche(r.somme, 16, 'somme des poids des jalons');
  egal(r.part, 4, 'part des questions');
  egal(r.parGroupe, [['Contrôler les palettes', 8], ['Les réserves et la signature', 5], ['Rendre compte', 3]], 'points par ligne du bandeau');
  egal(r.ecrans, [['cr-reserves', `phrases:${PHR}`], ['cr-litiges', `phrases:${PHR}`], ['cr-salutation', `phrases:${PHR}`], ['cr-fin', `phrases:${PHR}`]],
    '« Corriger » ne rouvre que le compte rendu');
  egal(r.qPoids, [['trois-jours', 1.5, 'tout de suite', false], ['pourquoi-signer', 1.5, 'bilan', false], ['qui-saisit', 1, 'tout de suite', false],
    ['pourquoi-litiges', undefined, 'tout de suite', true]], 'questions au fil');
  egal(r.ouv, [{ preparation: 3, image: 1 }, 10], 'Avant de commencer : 10 notions, 3 + 1 tirées');
  egal(r.quai, [QID, 'iso', false, 'controle', 'Bon de livraison — lettre de voiture', false, undefined, undefined, ['avarie', 'manquant'], 1, 4,
    'Transports Seine-Provence', 'Kevin'], 'le quai');
  egal(r.verifier, [], 'verifierQuai');
  egal(r.fin, 'Le chauffeur a signé et il est reparti : le contrôle ne se refait pas.', 'finFige');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-8.8 : tirage — 300 graines : 4 rôles sur 4 palettes différentes, au moins une avarie, quantités fixes, BL juste ; la phrase juste du compte rendu nomme SES palettes et SES quantités ; zéro secours', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent88-donnees.js');
    const { tirerJeu } = await import('/core/tirage.js');
    const PLEIN = { P1: 40, P2: 24, P3: 20, P4: 48 };
    const out = { secours: 0, roles: 0, avarie: 0, qte: 0, bl: 0, phrase: [], litiges: [], moyens: new Set(), piegeSur: new Set(), facileSur: new Set() };
    for (let i = 0; i < 300; i++) {
      const t = tirerJeu(D.TIRAGE, `eleve-${i}|action-controler`);
      if (t.secours) out.secours++;
      const j = t.jeu, P = j.palettes, de = (r) => P.find((p) => p.role === r);
      if (new Set(P.map((p) => p.role)).size !== 4) out.roles++;
      if (!P.some((p) => Object.keys(p.avarie).length)) out.avarie++;
      const fa = de('facile'), mo = de('moyen'), pi = de('piege');
      out.moyens.add(mo.anomalie); out.piegeSur.add(pi.id); out.facileSur.add(fa.id);
      const nAv = (p) => Object.keys(p.avarie).length;
      if (!(fa.anomalie === 'ecrase-face' && nAv(fa) === 2 && !fa.manque.length
        && (mo.anomalie === 'ecrase-cache' ? nAv(mo) === 1 && !mo.manque.length : mo.anomalie === 'manquant' && mo.manque.length === 2 && !nAv(mo))
        && pi.manque.length === { P1: 4, P2: 3, P3: 2, P4: 4 }[pi.id] && !nAv(pi))) out.qte++;
      if (P.some((p) => p.bl !== (p.role === 'piege' ? PLEIN[p.id] - p.manque.length : PLEIN[p.id]))) out.bl++;
      // La phrase juste, recomposée ici sans le code de la séance.
      const dit = (p) => (p.anomalie === 'manquant' ? `${p.id}, 2 cartons manquants` : p.anomalie === 'ecrase-cache' ? `${p.id}, 1 carton abîmé` : `${p.id}, 2 cartons abîmés`);
      const attendue = `Réserves signées par le chauffeur : ${[fa, mo].sort((a, b) => a.id.localeCompare(b.id)).map(dit).join(' ; ')}.`;
      const C = D.choixReserves(j);
      if (C[0] !== attendue || new Set(C).size !== 4 || !C.includes('Tout est conforme, aucune réserve.')) out.phrase.push([i, C[0], attendue]);
      const L = D.choixLitiges(j)[0];
      if (!L.includes(`de ${fa.id}`) || (mo.anomalie === 'ecrase-cache') !== L.includes(`le carton abîmé de ${mo.id}`)) out.litiges.push([i, L]);
    }
    return { ...out, moyens: [...out.moyens].sort(), piegeSur: [...out.piegeSur].sort(), facileSur: [...out.facileSur].sort(), phrase: out.phrase.slice(0, 3), litiges: out.litiges.slice(0, 3) };
  });
  egal([r.secours, r.roles, r.avarie, r.qte, r.bl], [0, 0, 0, 0, 0], 'secours, rôles, avarie, quantités, BL');
  egal(r.phrase, [], 'phrase juste des réserves');
  egal(r.litiges, [], 'phrase juste de la zone litiges');
  egal(r.moyens, ['ecrase-cache', 'manquant'], 'les deux problèmes moyens tombent');
  egal(r.piegeSur, ['P1', 'P2', 'P3', 'P4'], 'le piège tombe sur chaque palette');
  egal(r.facileSur, ['P1', 'P2', 'P3', 'P4'], 'la palette facile aussi');
});

await v('ENT-8.8 : contrôle d’équité — `verifier` refuse un jeu sans avarie, un rôle en double, une quantité hors règle, un écrasé hors de sa face ; le jeu de référence passe', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent88-donnees.js');
    const j = () => JSON.parse(JSON.stringify(D.jeuDe('temoin-6')));
    const sansAvarie = j(); sansAvarie.palettes.forEach((p) => { if (Object.keys(p.avarie).length) { p.avarie = {}; } });
    const double = j(); double.palettes[0].role = 'facile';
    const qte = j(); qte.palettes[2].avarie['0,0,0'] = [0, -1];
    const face = j(); const k = Object.keys(face.palettes[1].avarie)[0]; face.palettes[1].avarie[k] = [0, -1];
    return { sansAvarie: D.verifier(sansAvarie), double: D.verifier(double), qte: D.verifier(qte), face: D.verifier(face), bon: D.verifier(j()), ref: D.verifier(D.jeuDe('')) };
  });
  vrai(r.sansAvarie.some((x) => /aucune avarie/.test(x)), 'jeu sans avarie : ' + r.sansAvarie);
  vrai(r.double.some((x) => /rôles/.test(x)), 'rôle en double : ' + r.double);
  vrai(r.qte.some((x) => /P3 : quantités/.test(x)), 'deux écrasés derrière : ' + r.qte);
  vrai(r.face.some((x) => /P2 : carton écrasé hors de sa face/.test(x)), 'écrasé derrière sur la palette facile : ' + r.face);
  egal([r.bon, r.ref], [[], []], 'témoin et référence');
});

await v('ENT-8.8 : les deux témoins (valeurs à la main) — palettes, BL et réel au quai, phrases justes, palette citée par Q1', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/action-ent88-donnees.js');
    const Qs = await import('/contenus/questions/ENT-8.8.js');
    const q1 = Qs.QUESTIONS.liste.find((x) => x.id === 'trois-jours');
    const lire = (g) => {
      const Qd = D.quaiDe(g), j = D.jeuDe(g);
      return { pal: Qd.camions[0].palettes.map((p) => [p.id, p.bl, p.W * p.D * p.L - p.manque.length, Object.keys(p.avarie).length, p.attendu, p.motifAttendu]),
        res: D.choixReserves(j)[0], lit: D.choixLitiges(j)[0], q1: q1.selon({ tirage: { graine: g } }).enonce };
    };
    return { t1: lire('temoin-1'), t6: lire('temoin-6') };
  });
  egal(r.t1.pal, [['P1', 40, 40, 0, 'accepter', 'aucun'], ['P2', 21, 21, 0, 'accepter', 'aucun'], ['P3', 20, 20, 2, 'reserves', 'avarie'],
    ['P4', 48, 46, 0, 'reserves', 'manquant']], 'temoin-1');
  egal([r.t1.res, r.t1.lit], [CR1.reserves, CR1.litiges], 'temoin-1 : phrases');
  vrai(r.t1.q1.startsWith('Demain, Julie ouvre un carton d’assiettes (palette P2, acceptée sans réserve) : des assiettes sont cassées.'), 'Q1 temoin-1 : ' + r.t1.q1);
  egal(r.t6.pal, [['P1', 40, 40, 0, 'accepter', 'aucun'], ['P2', 24, 24, 2, 'reserves', 'avarie'], ['P3', 20, 20, 1, 'reserves', 'avarie'],
    ['P4', 44, 44, 0, 'accepter', 'aucun']], 'temoin-6');
  egal([r.t6.res, r.t6.lit], [CR6.reserves, CR6.litiges], 'temoin-6 : phrases');
  vrai(r.t6.q1.startsWith('Demain, Julie ouvre un carton de bougies (palette P1, acceptée sans réserve) : des bougies sont cassées.'), 'Q1 temoin-6 : ' + r.t6.q1);
  vrai(/Lis le document « Le droit »/.test(r.t6.q1), 'Q1 cite « Le droit »');
});

await v('ENT-8.8 : « Le droit » — L133-3, 1er alinéa recopié de Légifrance, joint au premier message de Samia ; aucune année dans ce qu’écrit la séance', async () => {
  await monter({ uid: 'ac88-droit', graine: 'temoin-1' });
  const m = (await entrants())[0];
  egal([m.subject, m.pieces], ['Le contrôle des palettes', ['droit']], 'premier message et sa pièce jointe');
  const doc = await pg.evaluate(async () => { const S = await import('/contenus/action-ent88.js'); return S.DOCUMENTS.map((d) => d.html).join('\n'); });
  vrai(doc.includes('« La réception des objets transportés éteint toute action contre le voiturier pour avarie ou perte partielle si dans les trois jours, '
    + 'non compris les jours fériés, qui suivent celui de cette réception, le destinataire n’a pas notifié au voiturier, par acte extrajudiciaire ou par '
    + 'lettre recommandée, sa protestation motivée. »'), 'texte de L133-3');
  vrai(/consulté le 17\/10\/2026/.test(doc), 'date de consultation');
  if (CAPTURES) {
    await pg.evaluate(async () => {
      const S = await import('/contenus/action-ent88.js');
      const h = document.querySelector('#fTest');
      h.innerHTML = `<style>.ent-doc{${S.STYLE}}</style><div style="display:flex;flex-wrap:wrap;gap:12px;background:#fff">${S.DOCUMENTS.map((d) => `<div class="ent-doc" style="width:440px;border:1px solid #ccc">${d.html}</div>`).join('')}</div>`;
    });
    await pg.screenshot({ path: `${CAPTURES}/7-documents.png`, fullPage: true });
  }
  const sansDate = doc.replace(/consulté le 17\/10\/2026/, '');
  vrai(!/\b20\d\d\b/.test(sansDate + m.text), 'une année dans un document ou un message');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await v('ENT-8.8 : parcours juste à l’écran (temoin-1) — vue ouverte à ③, Q2 à la 1re palette validée, Q1 à la clôture, Q3 au choix de la fin, Q4 à l’envoi ; 20 / 20, bandeau de 4 lignes ✓', async () => {
  capturer = true;
  await monter({ uid: 'ac88-juste', graine: 'temoin-1', sansOuverture: true });
  const ov = (await base()).questions[ID]['@tirage'].ids;
  egal([ov.length, ov.filter((id) => /^img-/.test(id)).length], [4, 1], '3 notions et 1 image tirées');
  for (let k = 0; k < 4; k++) {
    await pg.click(Q(`[data-ouv-aller="${k}"]`)); await pause();
    if (k === 0) await capture('0-avant-de-commencer');
    await pg.click(Q(`[data-q-choix="${REP_OUV[ov[k]]}"][data-q="${ov[k]}"]`));
    await pg.click(Q(`[data-q-repondre="${ov[k]}"]`)); await pause();
  }
  await pg.click(Q('[data-ouv-continuer]')); await pause();
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'inaction : 0');
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  egal(await pg.$$eval(Q('[data-q="etape"]'), (L) => L.map((b) => +b.dataset.n)), [3, 4], 'stepper ③ ④');
  vrai(/Les 4 palettes sont au sol/.test(await pg.textContent(Q('.quai-avert'))), 'la consigne de Samia en tête du quai');
  // P1 : la première palette validée ouvre Q2 (au bilan : « Merci, je note »).
  await pg.fill(Q('#qCompte'), '40'); await pg.press(Q('#qCompte'), 'Enter'); await pg.click(Q('#qDec-accepter'));
  vrai(!(await present('[data-q-panneau]')), 'rien avant de valider');
  await pg.click(Q('[data-q="valider"]')); await pause();
  egal(await pg.$eval(Q('[data-q-panneau]'), (e) => e.dataset.qPanneau), 'pourquoi-signer', 'Q2 au geste quai:valider');
  await pg.click(Q('[data-q-choix="reconnaitre"][data-q="pourquoi-signer"]')); await pg.click(Q('[data-q-repondre="pourquoi-signer"]')); await pause();
  egal(await pg.$(Q('[data-q-verdict]')), null, 'Q2 non corrigée tout de suite');
  await pg.click(Q('[data-q-reprendre]')); await pause();
  const vus = await quai(T1, { depuis: 1, tour: 'P4' });
  egal(vus, ['trois-jours'], 'Q1 au geste quai:cloturer');
  const t4 = await pg.textContent(Q('[data-quai]'));
  vrai(/Bon de livraison — lettre de voiture n° HAV-1109-02/.test(t4), 'le titre du document de ④');
  vrai(/P3 ACT-31506 : acceptée sous réserve — 2 cartons endommagés/.test(t4) && /P4 ACT-27093 : acceptée sous réserve — manque 2 cartons/.test(t4), 'les deux réserves écrites');
  await capture('5-quai-signe', '[data-q-parole]');
  vrai(!!(await entrants()).find((x) => x.subject === 'Ton compte rendu'), 'le compte rendu demandé à la signature');
  await ouvrirMail('Ton compte rendu'); await pg.click(Q('[data-repondre]')); await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  egal((await choixDe('reserves')).sort(), ['Réserves signées par le chauffeur : P2, 2 cartons manquants ; P3, 2 cartons abîmés.',
    'Réserves signées par le chauffeur : P3, 2 cartons abîmés ; P4, 2 cartons manquants.', 'Réserves signées par le chauffeur : P3, 2 cartons abîmés ; P4, 3 cartons manquants.',
    'Tout est conforme, aucune réserve.'], 'les choix des réserves, calculés sur SON tirage');
  const vus2 = await compteRendu(CR1);
  egal(vus2, ['qui-saisit', 'pourquoi-litiges'], 'Q3 au choix de la fin, Q4 à l’envoi');
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  egal(['question:trois-jours', 'question:pourquoi-signer', 'question:qui-saisit'].map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
  egal(n.detail['question:pourquoi-litiges'], undefined, 'Q4 sans note');
  proche(n.score, 20, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  await pg.$eval(Q('[data-fin-seance]'), (e) => e.scrollIntoView({ block: 'start' })); await capture('6-bilan', true);
  capturer = false;
  const M = await entrants();
  egal(M.map((x) => x.subject), ['Le contrôle des palettes', 'Ton compte rendu', 'Merci'], 'les messages, dans l’ordre');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun message ne dit juste / faux / correct / erreur / bonus');
  vrai(M.every((x, i) => !i || x.ts >= M[i - 1].ts), 'heures croissantes');
  const d0 = new Date(M[0].ts);
  vrai(d0.getMonth() === 10 && d0.getDate() === 9 && d0.getHours() === 7, 'le 9 novembre, 7 h : ' + d0);
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.8 : inaction et pire cas (temoin-1) — rien fait : 0 ; tout faux sauf la signature : 1 / 20, premier bilan, « Corriger » ne rouvre que le compte rendu, phrase du quai figé', async () => {
  await monter({ uid: 'ac88-pire', graine: 'temoin-1' });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'inaction');
  await quai(T1, { pal: { P1: [39, 'reserves', 'manquant'], P2: [24, 'reserves', 'manquant'], P3: [20, 'accepter'], P4: [48, 'accepter'] }, res: { P1: '1', P2: '3' },
    deballage: true, q: FAUSSES_Q });
  await compteRendu({ salutation: 'Salut Samia,', reserves: 'Tout est conforme, aucune réserve.', litiges: 'J’ai rendu les cartons abîmés au chauffeur.', fin: 'Cordialement' }, FAUSSES_Q);
  const n = await note();
  proche(n.score, 1, 'note (la signature seule)');
  egal(jalonsFaux(n), JALONS.filter((j) => j !== 'signature'), 'tous les jalons faux sauf la signature');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ko']), 'bandeau');
  vrai(b.corriger && b.fige, 'Corriger et la phrase du quai : ' + b.texte);
  vrai(/Le chauffeur a signé et il est reparti : le contrôle ne se refait pas\./.test(b.texte), 'finFige');
  const allers = (await pg.$$eval(Q('[data-fin-aller]'), (L) => L.map((x) => x.dataset.finAller)));
  vrai(allers.length > 0 && allers.every((x) => x === `phrases:${PHR}`), 'seul le compte rendu se rouvre : ' + allers);
  vrai(!!((await base()).points && (await base()).points[ID]), 'photo de fin rangée (la séance suivante s’ouvrirait)');
  // « Corriger » : le compte rendu renvoyé juste → ses quatre cases passent justes, le quai reste faux.
  await pg.click(Q('[data-fin-corriger]')); await pause();
  vrai(!(await present('[data-q-palette]')), '« Corriger » n’ouvre pas le quai');
  await compteRendu(CR1, BONNES_Q, true);
  const n2 = await note();
  egal(['cr-reserves', 'cr-litiges', 'cr-salutation', 'cr-fin'].map((j) => n2.detail[j]), ['ok', 'ok', 'ok', 'ok'], 'compte rendu corrigé');
  egal(['palette-facile', 'deballage'].map((j) => n2.detail[j]), ['ko', 'ko'], 'le quai reste faux');
  vrai((await entrants()).some((x) => x.subject === 'Bien reçu'), 'accusé de Samia au renvoi');
  egal((await base()).quais[QID].fini, true, 'le quai reste clos');
});

await v('ENT-8.8 : erreurs ciblées (temoin-6) — le piège compté « plein » : seule sa palette ✗ ; réserve « 2 » au lieu de 1 : réserve ✗, décision ✓ ; « Tout est conforme » ✗ ; le bilan nomme la palette', async () => {
  await monter({ uid: 'ac88-cible', graine: 'temoin-6' });
  await quai(T6, { pal: { P4: [48, 'accepter'] }, res: { P3: '2' } });
  await compteRendu({ ...CR6, reserves: 'Tout est conforme, aucune réserve.' });
  const n = await note();
  egal(jalonsFaux(n), ['palette-piege', 'reserve-moyen', 'cr-reserves'], 'jalons faux');
  proche(n.score, 16, 'note : 20 − 1,5 − 1,5 − 1');
  const c = Object.fromEntries((await cases()).map(([id, e, t]) => [id, [e, t]]));
  vrai(c['palette-piege'][0] === 'ko' && /Palette P4/.test(c['palette-piege'][1]), 'le piège : ' + c['palette-piege']);
  vrai(c['reserve-moyen'][0] === 'ko' && /Réserve de la palette P3/.test(c['reserve-moyen'][1]), 'la réserve : ' + c['reserve-moyen']);
  vrai(c['palette-moyen'][0] === 'ok' && /Palette P3/.test(c['palette-moyen'][1]), 'la décision de P3 juste');
  vrai(!/\b44\b|\b48\b/.test(c['palette-piege'][1]), 'le bilan ne dit pas le nombre attendu');
});

await v('ENT-8.8 : temoin-6 — P3 (écrasé derrière) acceptée sans faire le tour : palette et réserve ✗ ; « sous réserve de déballage » ajoutée : déballage ✗, le reste juste', async () => {
  await monter({ uid: 'ac88-tour', graine: 'temoin-6' });
  await quai(T6, { pal: { P3: [20, 'accepter'] }, deballage: true });
  const db = await base();
  vrai(db.quais[QID].mentionEcrite === true, 'la mention est écrite');
  await compteRendu(CR6);
  const n = await note();
  egal(jalonsFaux(n), ['palette-moyen', 'reserve-moyen', 'deballage'], 'jalons faux');
  proche(n.score, 20 - 2.5 - 1.5 - 1, 'note');
});

await v('ENT-8.8 : étape suivante — la barre mène au quai, puis au compte rendu une fois le quai clos', async () => {
  const barre = () => pg.$eval(Q('[data-suite-seance]'), (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => null);
  await monter({ uid: 'ac88-suite', graine: 'temoin-1' });
  egal(await barre(), 'Étape suivante : Le quai 2 : contrôler les palettes Y aller →', 'au départ');
  await pg.click(Q('[data-suite-aller]')); await pause();
  vrai(await present('[data-q-palette]'), 'la barre ouvre le quai');
  await quai(T1);
  await allerV('mail');
  egal(await barre(), 'Étape suivante : Rendre compte à Samia Y aller →', 'après la clôture');
  await pg.click(Q('[data-suite-aller]')); await pause();
  vrai(await present('[data-repondre]'), 'la barre ouvre le message de Samia');
});

// Les aides du quai à l'écran ③ (texte des aides, rappel de la formule de la feuille de calcul) et la consigne de Samia en tête du quai.
// (Le détail du comptage se saisit dans la feuille quand une zone de calcul est déclarée : pas de cases « qdCouches » ici.)
const aidesEcran = async () => ({
  aide: await pg.$$eval(Q('.quai-aide'), (L) => L.map((x) => x.textContent).join(' ')),
  rappel: await present('[data-q-rappel]'),
  avert: await pg.$eval(Q('.quai-avert'), (n) => n.textContent).catch(() => ''),
});

await v('ENT-8.8 (lot 4) : confirmé — aides de comptage ÉTEINTES (ni règle des couches, ni détail, ni rappel ; Samia explique toujours), bandeau identique, note sur le socle', async () => {
  await monter({ uid: 'ac88-conf', graine: 'temoin-1', aisance: 'confirme' });
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  const A = await aidesEcran();
  vrai(!/Règle du quai/.test(A.aide) && !A.rappel, `aides de comptage présentes chez le confirmé : ${A.aide.slice(0, 120)} / rappel ${A.rappel}`);
  vrai(/Pour compter sans tout compter/.test(A.aide), 'Samia n’explique plus : ' + A.aide.slice(0, 120));
  vrai(!/Fais le tour de la palette avant de décider/.test(A.avert), 'le rappel de l’accompagné chez le confirmé');
  egal(await pg.evaluate(async () => { const D = await import('/contenus/action-ent88-donnees.js'); const q = D.quaiDe('temoin-1', { niveau: 'confirme' }); return [q.aides, q.calcul.forme]; }),
    [{ chefDeQuai: true, consignes: true }, 'brouillon'], 'la déclaration du confirmé');
  await quai(T1);
  await compteRendu(CR1);
  const n = await note();
  proche(n.score, 20, 'note');
  egal(n.detail.bonus, undefined, 'aucun bonus');
  egal((await fin()).lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  vrai(!/bonus/i.test(await texte()), 'le mot « bonus » à l’écran');
});

await v('ENT-8.8 (lot 4) : accompagné — aides du standard ET la consigne de Samia rappelle « Fais le tour de la palette avant de décider. » ; le standard ne l’a pas', async () => {
  await monter({ uid: 'ac88-acc', graine: 'temoin-1', aisance: 'accompagne' });
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  const A = await aidesEcran();
  vrai(/Règle du quai : sur une palette, toutes les couches/.test(A.aide) && A.rappel, `aides du standard absentes chez l’accompagné : ${A.aide.slice(0, 120)} / rappel ${A.rappel}`);
  vrai(/Fais le tour de la palette avant de décider\./.test(A.avert), 'le rappel manque : ' + A.avert.slice(0, 200));
  vrai(!/P[1-4]/.test(A.avert.replace(/.*« /, '').replace(/ ».*/, '')), 'la consigne de Samia nomme une palette');
  await quai(T1);
  await compteRendu(CR1);
  const n = await note();
  proche(n.score, 20, 'note');
  egal(n.detail.bonus, undefined, 'aucun bonus');
  await monter({ uid: 'ac88-std2', graine: 'temoin-1' });
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  const S = await aidesEcran();
  vrai(/Règle du quai/.test(S.aide) && S.rappel && !/avant de décider/.test(S.avert), 'le standard : aides allumées, sans le rappel');
});

await v('ENT-8.8 : Avant de commencer — `couches` : 300 graines, jamais les dimensions d’une palette du camion, trois choix distincts, la juste = c × k', async () => {
  const r = await pg.evaluate(async () => {
    const Qs = await import('/contenus/questions/ENT-8.8.js');
    const { hasard } = await import('/core/tirage.js');
    const q = Qs.QUESTIONS.liste.find((x) => x.id === 'couches');
    const faux = [];
    for (let i = 0; i < 300; i++) {
      const x = q.variante(hasard(`g-${i}`));
      const [, c, k] = /pleine de (\d+) couches de (\d+) cartons/.exec(x.enonce).map(Number);
      const L = Object.values(x.libs);
      if (['5x8', '4x6', '4x5', '6x8'].includes(`${c}x${k}`) || c < 3 || c > 6 || k < 4 || k > 10 || new Set(L).size !== 3 || x.libs.juste !== `${c * k} cartons`) faux.push(x.enonce);
    }
    return faux;
  });
  egal(r, [], 'variantes hors règle');
});

await v('ENT-8.8 : parcours — fermée tant qu’ENT-8.7 n’a pas son premier bilan, ouverte ensuite', async () => {
  const r = await pg.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const { verrou } = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const de = (id) => metas.find((x) => x.id === id);
    const uid = 'u-verrou-action88', gid = 'g-verrou-action88', profil = { role: 'eleve', uid };
    const k = `prepalog:prive/${uid}/action-decharger`;
    localStorage.removeItem(k);
    const avant = await verrou(metas, de('action-controler'), profil, gid);
    localStorage.setItem(k, JSON.stringify({ data: { v: 1, points: { 'action-decharger': { v: 1 } } }, ts: 1 }));
    const apres = await verrou(metas, de('action-controler'), profil, gid);
    localStorage.removeItem(k);
    return { avant, apres };
  });
  egal(r.avant, 'Termine d\'abord ENT-8.7.', 'avant le premier bilan d’ENT-8.7');
  egal(r.apres, null, 'après');
});

await v('ENT-8.8 : écrans à 1366 × 768 — ③, ④ et la réponse par phrases sans défilement horizontal ; une palette vue de dos montre son carton écrasé', async () => {
  capturer = true;
  await monter({ uid: 'ac88-ecran', graine: 'temoin-6' });
  const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  vrai(await large() <= 0, '③ : défilement horizontal');
  // P3 (temoin-6) : le carton écrasé est sur la face arrière : pas d'enfoncement vu de face, un après deux tours.
  await pg.click(Q('[data-q="sel"][data-n="2"]')); await pause();
  const enfonces = () => pg.$$eval(Q('[data-q-palette] [data-iso-avarie]'), (L) => L.length);
  const avant = await enfonces();
  await pg.click(Q('[data-q="tourner"]')); await pause();
  const cote = await enfonces();
  await pg.click(Q('[data-q="tourner"]')); await pause();
  const dos = await enfonces();
  await capture('2-palette-de-dos', '[data-q-palette]');
  egal([avant, dos], [0, 1], 'le carton écrasé : invisible de face, visible de dos');
  vrai(cote <= 1, 'vu du côté : ' + cote);
  // P2 (temoin-6) : les deux cartons écrasés devant se voient sans tourner.
  await pg.click(Q('[data-q="sel"][data-n="1"]')); await pause();
  egal(await enfonces(), 2, 'P2 : deux cartons écrasés vus de face');
  await pg.click(Q('[data-q="etape"][data-n="4"]')); await pause();
  vrai(await large() <= 0, '④ : défilement horizontal');
  await monter({ uid: 'ac88-ecran2', graine: 'temoin-6' });
  await quai(T6);
  await ouvrirMail('Ton compte rendu'); await pg.click(Q('[data-repondre]')); await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  vrai(await large() <= 0, 'compte rendu : défilement horizontal');
  capturer = false;
  egal(erreursF, [], 'erreurs JavaScript');
});

await v('ENT-8.8 : corrigé enseignant — par élève : ses palettes (anomalie, BL, réel, décision, réserve), ses phrases justes, la palette de Q1', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-8.8.js');
    const e = C.corrigeEleve({ tirage: { graine: 'temoin-6' } }, 'x');
    const vide = C.corrigeEleve({}, 'temoin-6');
    return { items: e.items.map((i) => [i.texte, i.rep]), memes: JSON.stringify(vide.items) === JSON.stringify(e.items), texte: vide.texte.length > 0, n: C.CORRIGE.items.length };
  });
  egal(r.items, [
    ['P1 — Bougies parfumées, lot de 3', 'conforme, pleine · BL 40 · réel 40 · accepter · aucune réserve'],
    ['P2 — Assiettes plates en grès, lot de 6', '2 cartons écrasés sur la face avant · BL 24 · réel 24 · accepter avec réserves (Cartons endommagés) · réserve : 2 carton(s) endommagé(s)'],
    ['P3 — Boîtes de rangement plastique', 'un carton écrasé sur la face arrière (il faut faire le tour) · BL 20 · réel 20 · accepter avec réserves (Cartons endommagés) · réserve : 1 carton(s) endommagé(s)'],
    ['P4 — Torchons de cuisine, lot de 3', 'PIÈGE : couche du dessus à moitié vide, mais le BL dit le même nombre · BL 44 · réel 44 · accepter · aucune réserve'],
    ['Compte rendu : la ligne des réserves', CR6.reserves],
    ['Compte rendu : la zone litiges', CR6.litiges],
    ['Compte rendu : salutation et fin', 'Bonjour Samia, … Je reste au quai. (prénom)'],
    ['Question Q1 : la palette citée', 'P1 (un carton de bougies, acceptée sans réserve) → 3 jours, par lettre recommandée']], 'corrigé du témoin');
  vrai(r.memes && r.texte, 'élève qui n’a pas ouvert la séance : son jeu, déjà le bon');
  egal(r.n, 4, 'parties du corrigé commun');
});

await F.fermer();
}
