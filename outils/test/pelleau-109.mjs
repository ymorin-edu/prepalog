// Suite de tests de Prepalog — bloc « pelleau-109 » : Transports Pelleau ENT-10.9, contrôler les palettes des clients (CAP OL, guidage CAP-C1.4).
// `node outils/test.mjs pelleau-109` ne lance que ce bloc (un bloc par séance : `docs/briefs/COORDINATION-pelleau.md` §2 n° 21). Aides communes :
// `outils/test/pelleau/commun.mjs` (`ouvrirPelleau`, `qFilSelecteur`). Brief : `docs/briefs/ENT-10.9-pelleau-controler.md` §8 (modèle : bloc `action-88`).
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/pelleau-controler.js` → `rendre`).
// Mouvement réduit. Le quai s'ouvre à ③ (`commence: 'controle'`).
//
// Valeurs ÉCRITES À LA MAIN. Les palettes : P1, P2 Biscuiterie Ar Vag, cartons 5 couches × 8 = 40 ; P3, P4 Agri-Kerlann, SACS 4 couches × 10 = 40.
// Deux élèves TÉMOINS (la graine = l'identifiant), relevés une fois et recopiés ici :
//   « temoin-1 » : P1 2 cartons MANQUANTS au dessus (FR 40, réel 38) · P2 PIÈGE, couche du dessus à 4 cartons sur 8, FR 36 = réel 36 ·
//                  P3 2 sacs PERCÉS devant (40) · P4 conforme (40).
//   « temoin-2 » : P1 conforme (40) · P2 2 cartons ÉCRASÉS devant (40) · P3 1 sac percé DERRIÈRE (40, il faut faire le tour) ·
//                  P4 PIÈGE, couche du dessus à 5 sacs sur 10, FR 35 = réel 35.
// Poids : palettes 2,5 (facile) · 2,5 (moyen) · 1,5 (piège) · 1,5 (conforme) ; réserves 1,5 × 2 · déballage 1 · signature 1 ; compte rendu 1 · 1 ·
// forme 1 ; questions Q1 1,5 · Q2 1 · Q3 1,5 (part 4). Total 20.

import { ouvrirPelleau, qFilSelecteur, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'pelleau-controler';
const QID = 'pelleau-quai-109';
const PHR = 'pelleau-compte-rendu-109';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: '/activites/pelleau-controler.js', id: ID });
const { pg, Z, pause, base, note, present, texte, entrants, aller, erreurs, hotes } = P;
const qFil = qFilSelecteur(P, vrai);
const CAPTURES = process.env.CAPTURES_ENT109 || '';
const Q = (s) => `${Z} ${s}`;

const OUV = { reserve: 'remarque', avarie: 'abimee', manquant: 'absent', couches: 'juste', depot: 'rendre', 'zone-litiges': 'cote', 'img-sac': 'perce',
  'img-carton-ecrase': 'ecrase' };
const monter = (o = {}) => P.monter({ rep: OUV, ...o });
const BONNES_Q = { 'collegue-reserves': 'prouver', 'sac-perce': 'litiges', 'qui-saisit': 'maelys', 'stock-juste': 'rendre' };
const FAUSSES_Q = { 'collegue-reserves': 'inutile', 'sac-perce': 'rack', 'qui-saisit': 'toi', 'stock-juste': 'sais-pas' };
const GROUPES = ['Contrôler les palettes', 'Les réserves et la signature', 'Rendre compte', 'Les questions'];
const JALONS = ['palette-facile', 'palette-moyen', 'palette-piege', 'palette-conforme', 'reserve-facile', 'reserve-moyen', 'deballage', 'signature',
  'cr-reserves', 'cr-litiges', 'cr-forme'];
const POIDS = [2.5, 2.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, 1];
const JOURS = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus)\b/i;
// Le contrôle juste de chaque témoin : [comptage, décision, motif], puis la valeur de chaque réserve.
const T1 = { graine: 'temoin-1', pal: { P1: [38, 'reserves', 'manquant'], P2: [36, 'accepter'], P3: [40, 'reserves', 'avarie'], P4: [40, 'accepter'] },
  res: { P1: '2', P3: '2' } };
const T2 = { graine: 'temoin-2', pal: { P1: [40, 'accepter'], P2: [40, 'reserves', 'avarie'], P3: [40, 'reserves', 'avarie'], P4: [35, 'accepter'] },
  res: { P2: '2', P3: '1' } };
const CR1 = { salutation: 'Bonjour Erwan,', reserves: 'Réserves signées par Loïc : P1, 2 cartons manquants ; P3, 2 sacs abîmés.',
  litiges: 'J’ai mis les 2 sacs abîmés de P3 en zone litiges.', fin: 'Je reste au quai. Lea' };
const CR2 = { salutation: 'Bonjour Erwan,', reserves: 'Réserves signées par Loïc : P2, 2 cartons abîmés ; P3, 1 sac abîmé.',
  litiges: 'J’ai mis les 2 cartons abîmés de P2 et le sac abîmé de P3 en zone litiges.', fin: 'Je reste au quai. Lea' };
const CONTROLE = 'J’ai contrôlé les 4 palettes de la ramasse : 2 Ar Vag, 2 Agri-Kerlann.';

const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await pg.click(Q('[data-confirme-oui]')); await pause(); } };
const panneau = () => pg.$eval(Q('[data-q-panneau]'), (e) => e.dataset.qPanneau).catch(() => null);
let capturer = false;
const capture = async (nom, cible = null) => {
  if (!CAPTURES || !capturer) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(Q('[data-carte-fermer]')); await pause(40); }
  if (cible) await pg.$eval(Q(cible), (e) => e.scrollIntoView({ block: 'center' }));
  else await pg.evaluate(() => window.scrollTo(0, 0));
  await pause(60);
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};
// Répond aux questions ouvertes (puis reprend) ; rend les ids vus.
async function qrep(choix = BONNES_Q) {
  const vus = [];
  await pause(60);
  for (let i = 0; i < 6; i++) {
    const id = await panneau();
    if (!id) return vus;
    vus.push(id);
    await qFil({ [id]: choix[id] });
  }
  return vus;
}
// Une palette : sélectionnée, (tournée), comptée, décidée, validée ; rend les questions vues.
async function palette(n, [compte, decision, motif], choix = BONNES_Q, tour = false) {
  await pg.click(Q(`[data-q="sel"][data-n="${n}"]`)); await pause(30);
  if (tour) { await pg.click(Q('[data-q="tourner"]')); await pg.click(Q('[data-q="tourner"]')); await pause(30); }
  await pg.fill(Q('#qCompte'), String(compte)); await pg.press(Q('#qCompte'), 'Enter');
  await pg.click(Q(`#qDec-${decision}`));
  if (motif) await pg.click(Q(`#qMot-${motif}`));
  await pg.click(Q('[data-q="valider"]'));
  return qrep(choix);
}
// Le quai : chaque palette, puis les réserves, la mention (o.deballage), la signature et la clôture. Rend les questions vues.
async function quai(T, o = {}) {
  const pal = Object.assign({}, T.pal, o.pal || {}), res = Object.assign({}, T.res, o.res || {}), choix = o.q || BONNES_Q;
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  const vus = [];
  const ids = ['P1', 'P2', 'P3', 'P4'];
  for (let n = o.depuis || 0; n < 4; n++) vus.push(...(await palette(n, pal[ids[n]], choix, o.tour === ids[n])));
  await pg.click(Q('[data-q="vers4"]')); await pg.click(Q('[data-q="vers4"]')); await pause();
  for (const [id, val] of Object.entries(res)) if (await present(`#qRes-${id}`)) await pg.fill(Q(`#qRes-${id}`), val);
  if (o.deballage) await pg.check(Q('[data-q-deballage]'));
  await pg.click(Q('[data-q="ecrire"]')); await pause();
  await pg.click(Q('[data-q="signer"]')); await pause();
  vus.push(...(await qrep(choix)));
  await pg.click(Q('[data-q="clore"]')); await pause();
  vus.push(...(await qrep(choix)));
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
  await pg.click(Q('#formPhr button[type="submit"]'));
  await confirmer();
  vus.push(...(await qrep(choix)));
  return vus;
}
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]),
    corriger: !!b.querySelector('[data-fin-corriger]'), fige: !!b.querySelector('[data-fin-fige]'), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});
const cases = () => pg.$$eval(Q('[data-fin-case]'), (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.textContent.replace(/\s+/g, ' ').trim()]));
const jalonsFaux = (n) => JALONS.filter((j) => n.detail[j] !== 'ok');

// ─────────────────────────────────────────────────────────── la déclaration
await v('ENT-10.9 : la séance se charge (CAP, CAP-C1.4, guidage, correction, bilan détaillé, parcours après ENT-10.8) ; poids 16 + part 4 = 20 jalon par jalon écrit à la main ; au registre sous l’entreprise n° 10 ; fermée aux élèves tant que l’enseignant ne l’a pas cochée', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/pelleau-controler.js');
    const S = await import('/contenus/pelleau-ent109.js');
    const Qs = await import('/contenus/questions/ENT-10.9.js');
    const I = await import('/activites/index.js');
    const N = await import('/core/niveaux.js');
    const charges = await I.chargerActivites();
    const m = A.meta, E = S.ETAPES;
    return { meta: m, ids: E.map((e) => e.id), poids: E.map((e) => e.poids), somme: E.reduce((t, e) => t + e.poids, 0), part: Qs.QUESTIONS.part,
      parGroupe: Object.entries(E.reduce((o, e) => { o[e.groupe] = (o[e.groupe] || 0) + e.poids; return o; }, {})),
      ecrans: E.filter((e) => e.ecran).map((e) => e.id), bonus: E.filter((e) => e.bonus).length,
      notees: Qs.QUESTIONS.liste.filter((x) => x.type === 'fil').map((x) => [x.id, x.de, x.poids, x.apres || 'tout de suite', !!x.reflexion]),
      ouv: [Qs.QUESTIONS.ouverture.tirage, Qs.QUESTIONS.ouverture.questions.length,
        Qs.QUESTIONS.liste.filter((x) => x.type === 'ouverture' && x.cle).map((x) => x.id)],
      auRegistre: charges.some((a) => a.meta.id === ID), echecs: (I.activitesEnEchec ? I.activitesEnEchec() : []).map((e) => e.fichier || String(e)).filter((f) => /pelleau/.test(f)),
      cap: N.activiteVisible(m, { niveau: 'cap' }), coche: N.activiteVisible(m, { niveau: 'cap', ouverts: { [ID]: true } }), autre: N.activiteVisible(m, { niveau: '1re', ouverts: {} }),
      fin: S.OPTIONS.finFige };
  }, ID);
  const m = r.meta;
  egal([m.id, m.code, m.rubrique, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.parcours, m.correction, m.bilanDetail, m.precedente,
    m.niveauxPrevus, m.questions, m.pret, m.ouverture, m.corrige],
  ['pelleau-controler', 'ENT-10.9', 'simulog', ['cap'], [], ['CAP-C1.4'], 'guidage', 20, true, true, true, 'pelleau-evaluation-reception', ['confirme'], 'ENT-10.9',
    true, 'prof', './contenus/corriges/ENT-10.9.js'], 'meta');
  egal(r.ids, JALONS, 'jalons');
  egal(r.poids, POIDS, 'poids jalon par jalon (écrits à la main)');
  proche(r.somme, 16, 'somme des poids des jalons');
  proche(r.somme + r.part, 20, 'jalons + questions');
  egal(r.parGroupe, [['Contrôler les palettes', 8], ['Les réserves et la signature', 5], ['Rendre compte', 3]], 'points par ligne du bandeau (brief §5 : 8 + 5 + 3)');
  egal(r.ecrans, ['cr-reserves', 'cr-litiges', 'cr-forme'], '« Corriger » ne rouvre que le compte rendu');
  egal(r.bonus, 0, 'aucun cas bonus');
  egal(r.notees, [['collegue-reserves', 'erwan', 1.5, 'bilan', false], ['sac-perce', 'yann', 1, 'tout de suite', false],
    ['qui-saisit', 'erwan', 1.5, 'tout de suite', false], ['stock-juste', 'erwan', undefined, 'tout de suite', true]], 'questions au fil (brief §4 bis)');
  egal(r.ouv, [{ preparation: 3, image: 1 }, 8, ['reserve', 'avarie', 'couches', 'depot', 'img-sac']], 'Avant de commencer : 8 notions, 3 + 1 tirées, ★ du brief');
  egal([r.auRegistre, r.echecs], [true, []], 'au registre, sans échec');
  egal([r.cap, r.coche, r.autre], [false, true, false], 'fermée aux élèves, ouverte par l’enseignant ; jamais hors CAP');
  egal(r.fin, 'Loïc a signé : le contrôle ne se refait pas.', 'finFige');
});

await v('ENT-10.9 : le quai — commence au contrôle, feuille de ramasse « FR », unité « colis », motifs avarie et manquant, « Colis abîmé (écrasé ou percé) », P1 P2 en cartons Ar Vag, P3 P4 en SACS Agri-Kerlann ; verifierQuai accepte les trois niveaux', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent109-donnees.js');
    const Qm = await import('/core/types/quai.js');
    const q = D.quaiDe('temoin-1');
    return { q: [q.id, q.rendu, q.froid, q.commence, q.document, q.recommencer, q.securite, q.arret, q.unite, q.motifs, q.libelles, q.camions.length,
      q.camions[0].tutoiement, q.camions[0].prenomChauffeur, q.dechargement.nom, q.depose.cases.map((c) => c.id), Object.keys(q.depose.clients)],
      pal: q.camions[0].palettes.map((p) => [p.id, p.client, p.forme || 'cartons', p.W, p.D, p.L, p.ref]),
      verif: ['standard', 'confirme', 'accompagne'].map((n) => Qm.verifierQuai(D.quaiDe('temoin-1', { niveau: n }))),
      ref: Qm.verifierQuai(D.quaiDe('')) };
  });
  egal(r.q, ['pelleau-quai-109', 'iso', false, 'controle', { nom: 'Feuille de ramasse', court: 'FR', article: 'la' }, false, undefined, undefined,
    { un: 'colis', des: 'colis' }, ['avarie', 'manquant'], { avarie: { nom: 'Colis abîmé', precision: 'écrasé ou percé', adjectif: 'abîmé' } }, 1, true, 'Loïc', 'Yann',
    ['allee-1', 'AV1', 'AV2', 'AK1', 'AK2', 'quaiB-1'], ['ar-vag', 'agri-kerlann']], 'déclaration du quai');
  egal(r.pal, [['P1', 'ar-vag', 'cartons', 4, 2, 5, 'AV-20418'], ['P2', 'ar-vag', 'cartons', 4, 2, 5, 'AV-20418'],
    ['P3', 'agri-kerlann', 'sacs', 5, 2, 4, 'AK-31205'], ['P4', 'agri-kerlann', 'sacs', 5, 2, 4, 'AK-31205']], 'les palettes');
  egal([r.verif, r.ref], [[[], [], []], []], 'verifierQuai');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-10.9 : tirage — 300 graines : zéro secours ; 4 rôles sur 4 palettes ; les deux palettes à problème de DEUX clients ; au moins une avarie ; cartons écrasés chez Ar Vag, sacs percés chez Agri-Kerlann ; chaque anomalie tombe (manquant et caché chez les deux clients, piège sur chaque palette) ; quantités et feuille justes ; la phrase juste nomme SES palettes', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent109-donnees.js');
    const { tirerJeu } = await import('/core/tirage.js');
    const CLIENT = { P1: 'ar-vag', P2: 'ar-vag', P3: 'agri-kerlann', P4: 'agri-kerlann' };
    const MOT = { P1: ['carton', 'cartons'], P2: ['carton', 'cartons'], P3: ['sac', 'sacs'], P4: ['sac', 'sacs'] };
    const MOITIE = { P1: 4, P2: 4, P3: 5, P4: 5 };
    const o = { secours: 0, roles: 0, client: 0, avarie: 0, face: 0, qte: 0, fr: 0, phrase: [], vus: new Set() };
    for (let i = 0; i < 300; i++) {
      const t = tirerJeu(D.TIRAGE, `eleve-${i}|pelleau-controler`);
      if (t.secours) o.secours++;
      const P = t.jeu.palettes, de = (r) => P.find((p) => p.role === r);
      if (new Set(P.map((p) => p.role)).size !== 4) o.roles++;
      const fa = de('facile'), mo = de('moyen'), pi = de('piege');
      if (CLIENT[fa.id] === CLIENT[mo.id]) o.client++;
      if (!P.some((p) => Object.keys(p.avarie).length)) o.avarie++;
      if (fa.anomalie !== (CLIENT[fa.id] === 'ar-vag' ? 'ecrase-face' : 'perce-face')) o.face++;
      P.forEach((p) => o.vus.add(`${p.anomalie}@${p.id}`));
      const nAv = (p) => Object.keys(p.avarie).length;
      if (!(nAv(fa) === 2 && !fa.manque.length && Object.values(fa.avarie).every((d) => d[1] === 1)
        && (mo.anomalie === 'cache' ? nAv(mo) === 1 && !mo.manque.length && Object.values(mo.avarie).every((d) => d[1] === -1)
          : mo.anomalie === 'manquant' && mo.manque.length === 2 && !nAv(mo))
        && pi.manque.length === MOITIE[pi.id] && !nAv(pi))) o.qte++;
      if (P.some((p) => p.bl !== (p.role === 'piege' ? 40 - p.manque.length : 40))) o.fr++;
      // La phrase juste, recomposée ici sans le code de la séance.
      const dit = (p) => { const n = p.anomalie === 'manquant' ? 2 : p.anomalie === 'cache' ? 1 : 2, [un, des] = MOT[p.id];
        return `${p.id}, ${n} ${n > 1 ? des : un} ${p.anomalie === 'manquant' ? 'manquants' : n > 1 ? 'abîmés' : 'abîmé'}`; };
      const attendue = `Réserves signées par Loïc : ${[fa, mo].sort((a, b) => a.id.localeCompare(b.id)).map(dit).join(' ; ')}.`;
      const C = D.choixReserves(t.jeu);
      if (C[0] !== attendue || new Set(C).size !== 4 || !C.includes('Tout est conforme, aucune réserve.')) o.phrase.push([i, C[0], attendue]);
    }
    return { ...o, vus: [...o.vus].sort(), phrase: o.phrase.slice(0, 3) };
  });
  egal([r.secours, r.roles, r.client, r.avarie, r.face, r.qte, r.fr], [0, 0, 0, 0, 0, 0, 0], 'secours, rôles, clients, avarie, face, quantités, feuille');
  egal(r.phrase, [], 'phrase juste des réserves');
  egal(r.vus, ['cache@P1', 'cache@P2', 'cache@P3', 'cache@P4', 'conforme@P1', 'conforme@P2', 'conforme@P3', 'conforme@P4',
    'couche-normale@P1', 'couche-normale@P2', 'couche-normale@P3', 'couche-normale@P4', 'ecrase-face@P1', 'ecrase-face@P2',
    'manquant@P1', 'manquant@P2', 'manquant@P3', 'manquant@P4', 'perce-face@P3', 'perce-face@P4'], 'chaque anomalie sur chaque palette possible');
});

await v('ENT-10.9 : contrôle d’équité — `verifier` refuse deux palettes à problème du même client, un jeu sans avarie, un sac percé chez Ar Vag, un colis abîmé hors de sa face ; les témoins et la référence passent', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent109-donnees.js');
    const j = (g = 'temoin-2') => JSON.parse(JSON.stringify(D.jeuDe(g)));
    // temoin-2 : P2 facile (Ar Vag), P3 moyen (Agri) ; on met le moyen sur P1 (Ar Vag) à la place du conforme.
    const meme = j(); meme.palettes[0].role = 'moyen'; meme.palettes[2].role = 'conforme';
    const sansAvarie = j('temoin-1'); sansAvarie.palettes.forEach((p) => { p.avarie = {}; });
    const perceArVag = j(); perceArVag.palettes[1].anomalie = 'perce-face';
    const face = j(); const k = Object.keys(face.palettes[1].avarie)[0]; face.palettes[1].avarie[k] = [0, -1];
    return { meme: D.verifier(meme), sansAvarie: D.verifier(sansAvarie), perceArVag: D.verifier(perceArVag), face: D.verifier(face),
      bons: [D.verifier(j()), D.verifier(j('temoin-1')), D.verifier(D.jeuDe(''))] };
  });
  vrai(r.meme.some((x) => /même client/.test(x)), 'même client : ' + r.meme);
  vrai(r.sansAvarie.some((x) => /aucune avarie/.test(x)), 'sans avarie : ' + r.sansAvarie);
  vrai(r.perceArVag.some((x) => /P2 : anomalie perce-face/.test(x)), 'sac percé chez Ar Vag : ' + r.perceArVag);
  vrai(r.face.some((x) => /P2 : colis abîmé hors de sa face/.test(x)), 'hors de sa face : ' + r.face);
  egal(r.bons, [[], [], []], 'témoins et référence');
});

await v('ENT-10.9 : les deux témoins (valeurs à la main) — palettes, feuille et réel au quai, décision attendue, phrases justes, ligne « contrôlé »', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent109-donnees.js');
    const lire = (g) => {
      const Qd = D.quaiDe(g), j = D.jeuDe(g);
      return { pal: Qd.camions[0].palettes.map((p) => [p.id, p.bl, p.W * p.D * p.L - p.manque.length, Object.keys(p.avarie).length, p.attendu, p.motifAttendu]),
        res: D.choixReserves(j)[0], lit: D.choixLitiges(j)[0] };
    };
    return { t1: lire('temoin-1'), t2: lire('temoin-2'), controle: D.ligneControle() };
  });
  egal(r.t1.pal, [['P1', 40, 38, 0, 'reserves', 'manquant'], ['P2', 36, 36, 0, 'accepter', 'aucun'], ['P3', 40, 40, 2, 'reserves', 'avarie'],
    ['P4', 40, 40, 0, 'accepter', 'aucun']], 'temoin-1');
  egal([r.t1.res, r.t1.lit], [CR1.reserves, CR1.litiges], 'temoin-1 : phrases');
  egal(r.t2.pal, [['P1', 40, 40, 0, 'accepter', 'aucun'], ['P2', 40, 40, 2, 'reserves', 'avarie'], ['P3', 40, 40, 1, 'reserves', 'avarie'],
    ['P4', 35, 35, 0, 'accepter', 'aucun']], 'temoin-2');
  egal([r.t2.res, r.t2.lit], [CR2.reserves, CR2.litiges], 'temoin-2 : phrases');
  egal(r.controle, CONTROLE, 'la ligne imposée');
});

// ─────────────────────────────────────────────────────────── « que, jamais de combien »
await v('ENT-10.9 : que, jamais de combien — sur 300 graines, aucun texte lu avant la signature (documents, messages, accueil, consigne du quai, étiquettes) ne change avec le tirage ni ne nomme une palette ; l’étiquette dit « 1 carton » / « 1 sac »', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent109-donnees.js');
    const S = await import('/contenus/pelleau-ent109.js');
    const fixes = [...S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html({}) : d.html)), JSON.stringify(S.ACCUEIL),
      S.VOLET.semer('Lea').mails.map((m) => m.text).join(' '),
      S.VOLET.declencheurs.find((x) => x.id === 'compte-rendu').semer('Lea', { tirage: { graine: 'temoin-1' } }).mails.map((m) => m.text).join(' ')].join('\n');
    // Les textes du quai lus à l'écran avant la signature (sans le n° de lot, propre à chaque palette, pas au tirage).
    const textes = (q) => JSON.stringify([q.titre, q.avertissement, q.camions[0].parole, q.camions[0].palettes.map((p) => [p.nom, p.etiq.ref, p.etiq.nom, p.etiq.poids])]);
    const ref = textes(D.quaiDe('')), varient = [], fuites = [];
    for (let i = 0; i < 300; i++) {
      const q = D.quaiDe(`g-${i}`), t = textes(q);
      if (t !== ref) varient.push(i);
      // Le réel d'une palette à manquants, écrit quelque part ?
      D.jeuDe(`g-${i}`).palettes.filter((p) => p.anomalie === 'manquant').forEach((p) => { if (new RegExp(`\\b${D.reelDe(p)}\\b`).test(t + fixes)) fuites.push(i); });
    }
    return { varient: varient.slice(0, 5), fuites: fuites.slice(0, 5), palette: /\bP[1-4]\b/.test(fixes + ref), poids: D.quaiDe('').camions[0].palettes.map((p) => p.etiq.poids) };
  });
  egal(r.varient, [], 'graines dont le texte du quai diffère du jeu de référence');
  egal(r.fuites, [], 'graines dont le réel d’une palette à manquants est écrit');
  egal(r.palette, false, 'un texte lu avant la signature nomme une palette');
  egal(r.poids, ['1 carton', '1 carton', '1 sac', '1 sac'], 'l’étiquette d’un colis');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await v('ENT-10.9 : parcours juste à l’écran (temoin-1) — Avant de commencer, vue ouverte à ③ (stepper ③ ④), Q1 à la 1re palette validée (corrigée au bilan), Q2 à la 1re palette d’Agri-Kerlann validée, Q3 au choix de la fin, Q4 à l’envoi ; 20 / 20, bandeau de 4 lignes ✓', async () => {
  capturer = true;
  await monter({ uid: 'temoin-1', sansOuverture: true });
  const ov = (await base()).questions[ID]['@tirage'].ids;
  egal([ov.length, ov.filter((id) => /^img-/.test(id)).length], [4, 1], '3 notions et 1 image tirées');
  for (let k = 0; k < 4; k++) {
    await pg.click(Q(`[data-ouv-aller="${k}"]`)); await pause();
    await pg.click(Q(`[data-q-choix="${OUV[ov[k]]}"][data-q="${ov[k]}"]`));
    await pg.click(Q(`[data-q-repondre="${ov[k]}"]`)); await pause();
  }
  await pg.click(Q('[data-ouv-continuer]')); await pause();
  await capture('1-accueil');
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'inaction : 0');
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  egal(await pg.$$eval(Q('[data-q="etape"]'), (L) => L.map((b) => +b.dataset.n)), [3, 4], 'stepper ③ ④');
  vrai(/Les 4 palettes de ce matin sont triées/.test(await pg.textContent(Q('.quai-avert'))), 'la consigne d’Erwan en tête du quai');
  // P1 : la première palette validée ouvre Q1 (au bilan : pas de verdict tout de suite).
  await pg.fill(Q('#qCompte'), '38'); await pg.press(Q('#qCompte'), 'Enter'); await pg.click(Q('#qDec-reserves')); await pg.click(Q('#qMot-manquant'));
  vrai(!(await panneau()), 'rien avant de valider');
  await pg.click(Q('[data-q="valider"]')); await pause();
  egal(await panneau(), 'collegue-reserves', 'Q1 au geste quai:valider');
  await pg.click(Q('[data-q-choix="prouver"][data-q="collegue-reserves"]')); await pg.click(Q('[data-q-repondre="collegue-reserves"]')); await pause();
  egal(await pg.$(Q('[data-q-verdict]')), null, 'Q1 non corrigée tout de suite');
  await pg.click(Q('[data-q-reprendre]')); await pause();
  egal(await palette(1, T1.pal.P2), [], 'P2 (Ar Vag) validée : pas de question');
  // P3 (sacs) : l'étiquette d'un sac lue, puis la palette validée → Q2.
  await pg.click(Q('[data-q="sel"][data-n="2"]')); await pause(30);
  await pg.dispatchEvent(Q('svg[data-q-palette] [data-q-carton="13"]'), 'click');
  await pg.waitForSelector(Q('[data-q-etiquette]'));
  await capture('2-quai-sacs-etiquette', '[data-q-etiquette]');
  egal(await palette(2, T1.pal.P3), ['sac-perce'], 'Q2 à la 1re palette d’Agri-Kerlann validée');
  const vus = await palette(3, T1.pal.P4);
  egal(vus, [], 'P4 : plus de question');
  await pg.click(Q('[data-q="vers4"]')); await pg.click(Q('[data-q="vers4"]')); await pause();
  for (const [id, val] of Object.entries(T1.res)) await pg.fill(Q(`#qRes-${id}`), val);
  await pg.click(Q('[data-q="ecrire"]')); await pause();
  const t4 = await pg.textContent(Q('[data-quai]'));
  vrai(/Feuille de ramasse n° RAM-0520/.test(t4), 'le titre du document de ④ : ' + t4.slice(0, 200));
  vrai(/P1 AV-20418 : acceptée sous réserve — manque 2 colis \(FR 40, reçu 38\)/.test(t4), 'réserve de P1');
  vrai(/P3 AK-31205 : acceptée sous réserve — 2 colis abîmés \(écrasé ou percé\)/.test(t4), 'réserve de P3');
  await pg.click(Q('[data-q="signer"]')); await pause();
  // 20/10/2026 : la réplique de Loïc après la signature est celle du contenu (`paroleSignee`), pas « C’est signé. J’y vais. » du moteur.
  egal((await pg.textContent(Q('[data-q-parole]'))).replace(/\s+/g, ' ').trim(), 'Loïc : « Je signe sous tes réserves. Bonne journée ! »', 'la réplique de Loïc à la signature');
  await pg.click(Q('[data-q="clore"]')); await pause();
  vrai(!!(await entrants()).find((x) => x.subject === 'Ton compte rendu'), 'le compte rendu demandé à la signature');
  await ouvrirMail('Ton compte rendu'); await pg.click(Q('[data-repondre]')); await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  egal((await choixDe('reserves')).sort(), ['Réserves signées par Loïc : P1, 2 cartons manquants ; P3, 2 sacs abîmés.',
    'Réserves signées par Loïc : P1, 3 cartons manquants ; P3, 2 sacs abîmés.', 'Réserves signées par Loïc : P2, 2 cartons manquants ; P3, 2 sacs abîmés.',
    'Tout est conforme, aucune réserve.'], 'les choix des réserves, calculés sur SON tirage');
  vrai((await texte()).includes(CONTROLE), 'la ligne imposée « contrôlé »');
  const vus2 = await compteRendu(CR1, BONNES_Q, true);
  egal(vus2, ['qui-saisit', 'stock-juste'], 'Q3 au choix de la fin, Q4 à l’envoi');
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  egal(['question:collegue-reserves', 'question:sac-perce', 'question:qui-saisit'].map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
  egal(n.detail['question:stock-juste'], undefined, 'Q4 sans note');
  proche(n.score, 20, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  await capture('3-bilan', '[data-fin-seance]');
  capturer = false;
  const M = await entrants();
  egal(M.map((x) => x.subject), ['Le contrôle des palettes', 'Ton compte rendu', 'Merci'], 'les messages, dans l’ordre');
  egal(M[0].pieces, ['droit-depot'], '« Le droit » joint au premier message');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun message ne dit juste / faux / correct / erreur / bonus');
  egal(M.filter((x) => JOURS.test(x.text) || JOURS.test(x.subject)).map((x) => x.subject), [], 'aucun jour de la semaine');
  vrai(M.every((x, i) => !i || x.ts >= M[i - 1].ts), 'heures croissantes');
  const d0 = new Date(M[0].ts);
  vrai(d0.getMonth() === 4 && d0.getDate() === 20 && d0.getHours() === 8, 'le 20 mai, 8 h : ' + d0);
  vrai(/Maëlys saisit l’entrée en stock avec tes réserves/.test(M[2].text), 'le message de fin');
  egal(erreurs, [], 'erreurs JavaScript');
});

await v('ENT-10.9 : étiquette lue — un sac de P3 (temoin-1) : « Expéditeur : Agri-Kerlann », AK-31205, « 1 sac », Colis 13 ; un carton de P1 : « Expéditeur : Biscuiterie Ar Vag » ; sacs dessinés sur P3 et P4 seulement ; à ④, chaque palette dans la zone de son client', async () => {
  await monter({ uid: 'temoin-1' });
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  const sacs = async (n) => { await pg.click(Q(`[data-q="sel"][data-n="${n}"]`)); await pause(30); return pg.$$eval(Q('svg[data-q-palette] [data-iso-sac]'), (L) => L.length); };
  egal([await sacs(0), await sacs(1), await sacs(2), await sacs(3)], [0, 0, 40, 40], 'sacs dessinés à ③ (P1, P2 : cartons ; P3, P4 : 40 sacs)');
  await pg.click(Q('[data-q="sel"][data-n="2"]')); await pause(30);
  await pg.dispatchEvent(Q('svg[data-q-palette] [data-q-carton="13"]'), 'click');
  await pg.waitForSelector(Q('[data-q-etiquette]'));
  const et = () => pg.$eval(Q('[data-q-etiquette]'), (e) => ({ l1: e.querySelector('.quai-etiq-l1 b').textContent.trim(), no: e.querySelector('.quai-etiq-l1 span').textContent.replace(/\s+/g, ' ').trim(),
    ref: e.querySelector('.quai-etiq-ref').textContent.trim(), tout: e.innerText.replace(/\s+/g, ' ') }));
  const e3 = await et();
  egal([e3.l1, e3.no, e3.ref], ['Expéditeur : Agri-Kerlann', 'Colis 13', 'AK-31205'], 'étiquette du sac');
  vrai(/TERREAU UNIVERSEL, SACS DE 40 L/.test(e3.tout) && /\b1 sac\b/.test(e3.tout), 'désignation et contenu : ' + e3.tout);
  vrai(((await base()).quais[QID].palettes.P3.etiqLues || []).length > 0, 'l’étiquette lue est rangée');
  await pg.click(Q('[data-q="sel"][data-n="0"]')); await pause(30);
  await pg.dispatchEvent(Q('svg[data-q-palette] [data-q-carton="2"]'), 'click');
  await pg.waitForFunction((s) => /Ar Vag/.test(document.querySelector(s)?.textContent || ''), Q('[data-q-etiquette] .quai-etiq-l1 b'));
  egal((await et()).l1, 'Expéditeur : Biscuiterie Ar Vag', 'étiquette d’un carton de P1');
  await pg.click(Q('[data-q="etape"][data-n="4"]')); await pause();
  const posees = await pg.$$eval(Q('[data-q-cf] [data-iso-posee]'), (L) => Object.fromEntries(L.map((g) => [g.dataset.isoPosee, g.dataset.isoCase]).sort()));
  egal(posees, { P1: 'AV1', P2: 'AV2', P3: 'AK1', P4: 'AK2' }, '④ : chaque palette dans la zone de son client');
  const large = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  vrai(large <= 0, '1366 × 768 : défilement horizontal ' + large);
});

await v('ENT-10.9 : inaction et pire cas (temoin-1) — rien fait : 0 (aucun jalon vrai, même « pas de déballage ») ; tout faux sauf la signature : 1 / 20 ; « Corriger » ne rouvre que le compte rendu et RELÈVE la note, le quai reste faux et clos', async () => {
  await monter({ uid: 'temoin-1' });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'inaction');
  await allerV('quai'); await pg.waitForSelector(Q('[data-q-palette]'));
  const etats = await pg.evaluate(async () => {
    const S = await import('/contenus/pelleau-ent109.js');
    return S.ETAPES.map((e) => [e.id, e.verifier(window.__f.db).status]);
  });
  egal(etats.filter(([, s]) => s === 'ok'), [], 'aucun jalon vrai sans rien faire (quai ouvert)');
  await quai(T1, { pal: { P1: [40, 'accepter'], P2: [40, 'reserves', 'manquant'], P3: [40, 'accepter'], P4: [39, 'reserves', 'avarie'] }, res: { P2: '4', P4: '1' },
    deballage: true, q: FAUSSES_Q });
  await compteRendu({ salutation: 'Salut Erwan,', reserves: 'Tout est conforme, aucune réserve.', litiges: 'J’ai rendu les colis abîmés à Loïc.', fin: 'Cordialement' }, FAUSSES_Q);
  const n = await note();
  proche(n.score, 1, 'note (la signature seule)');
  egal(jalonsFaux(n), JALONS.filter((j) => j !== 'signature'), 'tous les jalons faux sauf la signature');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ko']), 'bandeau');
  vrai(b.corriger && b.fige && /Loïc a signé : le contrôle ne se refait pas\./.test(b.texte), 'Corriger et la phrase du quai : ' + b.texte);
  const allers = await pg.$$eval(Q('[data-fin-aller]'), (L) => L.map((x) => x.dataset.finAller));
  vrai(allers.length > 0 && allers.every((x) => x === `phrases:${PHR}`), 'seul le compte rendu se rouvre : ' + allers);
  await pg.click(Q('[data-fin-corriger]')); await pause();
  vrai(!(await present('[data-q-palette]')), '« Corriger » n’ouvre pas le quai');
  await compteRendu(CR1, BONNES_Q, true);
  const n2 = await note();
  egal(['cr-reserves', 'cr-litiges', 'cr-forme'].map((j) => n2.detail[j]), ['ok', 'ok', 'ok'], 'compte rendu corrigé');
  egal(['palette-facile', 'deballage'].map((j) => n2.detail[j]), ['ko', 'ko'], 'le quai reste faux');
  vrai(n2.score > n.score, `la correction relève la note : ${n.score} → ${n2.score}`);
  vrai((await entrants()).some((x) => x.subject === 'Bien reçu'), 'accusé d’Erwan au renvoi');
  egal((await base()).quais[QID].fini, true, 'le quai reste clos');
});

await v('ENT-10.9 : erreurs ciblées (temoin-2) — le piège compté « plein » : seule sa palette ✗ ; le sac percé DERRIÈRE accepté sans faire le tour : palette et réserve ✗ ; « Tout est conforme » refusé : réserves du compte rendu ✗ ; le bilan nomme la palette sans dire le nombre attendu', async () => {
  await monter({ uid: 'temoin-2' });
  await quai(T2, { pal: { P4: [40, 'accepter'], P3: [40, 'accepter'] } });
  await compteRendu({ ...CR2, reserves: 'Tout est conforme, aucune réserve.' });
  const n = await note();
  egal(jalonsFaux(n), ['palette-moyen', 'palette-piege', 'reserve-moyen', 'cr-reserves'], 'jalons faux');
  proche(n.score, 20 - 2.5 - 1.5 - 1.5 - 1, 'note');
  const c = Object.fromEntries((await cases()).map(([id, e, t]) => [id, [e, t]]));
  vrai(c['palette-piege'][0] === 'ko' && /Palette P4/.test(c['palette-piege'][1]), 'le piège : ' + c['palette-piege']);
  vrai(c['palette-moyen'][0] === 'ko' && /Palette P3/.test(c['palette-moyen'][1]), 'le caché : ' + c['palette-moyen']);
  vrai(c['palette-facile'][0] === 'ok' && /Palette P2/.test(c['palette-facile'][1]), 'la facile juste');
  vrai(!/\b35\b/.test(c['palette-piege'][1]), 'le bilan ne dit pas le nombre attendu');
});

await v('ENT-10.9 : temoin-2 juste en faisant le tour de P3 — 20 / 20 ; « sous réserve de déballage » ajoutée : déballage ✗, le reste juste', async () => {
  await monter({ uid: 'temoin-2' });
  await quai(T2, { tour: 'P3' });
  await compteRendu(CR2);
  proche((await note()).score, 20, 'juste');
  await monter({ uid: 'temoin-2' });
  await quai(T2, { deballage: true });
  vrai((await base()).quais[QID].mentionEcrite === true, 'la mention est écrite');
  await compteRendu(CR2);
  const n = await note();
  egal(jalonsFaux(n), ['deballage'], 'jalons faux');
  proche(n.score, 19, 'note');
});

await v('ENT-10.9 : confirmé — aides de comptage ÉTEINTES (ni règle des couches, ni rappel, brouillon libre), aucun bonus, note sur le socle ; accompagné = standard (aides allumées)', async () => {
  await monter({ uid: 'temoin-1', aisance: 'confirme' });
  await allerV('quai'); await pg.waitForSelector(Q('[data-q-palette]'));
  const aides = async () => ({ aide: await pg.$$eval(Q('.quai-aide'), (L) => L.map((x) => x.textContent).join(' ')), rappel: await present('[data-q-rappel]') });
  const A = await aides();
  vrai(!/Règle du quai/.test(A.aide) && !A.rappel, `aides de comptage chez le confirmé : ${A.aide.slice(0, 120)} / ${A.rappel}`);
  egal(await pg.evaluate(async () => { const D = await import('/contenus/pelleau-ent109-donnees.js'); const q = D.quaiDe('temoin-1', { niveau: 'confirme' }); return [q.aides, q.calcul.forme]; }),
    [{ chefDeQuai: true, consignes: true }, 'brouillon'], 'la déclaration du confirmé');
  await quai(T1);
  await compteRendu(CR1);
  const n = await note();
  proche(n.score, 20, 'note');
  egal(n.detail.bonus, undefined, 'aucun bonus');
  vrai(!/bonus/i.test(await texte()), 'le mot « bonus » à l’écran');
  await monter({ uid: 'temoin-1', aisance: 'accompagne' });
  await allerV('quai'); await pg.waitForSelector(Q('[data-q-palette]'));
  const B = await aides();
  vrai(/Règle du quai/.test(B.aide) && B.rappel, 'accompagné : les aides du standard');
});

await v('ENT-10.9 : Avant de commencer — `couches` : 300 graines, jamais 5 × 8 ni 4 × 10, trois choix distincts, la juste = c × k colis', async () => {
  const r = await pg.evaluate(async () => {
    const Qs = await import('/contenus/questions/ENT-10.9.js');
    const { hasard } = await import('/core/tirage.js');
    const q = Qs.QUESTIONS.liste.find((x) => x.id === 'couches');
    const faux = [];
    for (let i = 0; i < 300; i++) {
      const x = q.variante(hasard(`g-${i}`));
      const [, c, k] = /pleine de (\d+) couches de (\d+) colis/.exec(x.enonce).map(Number);
      const L = Object.values(x.libs);
      if (['5x8', '4x10'].includes(`${c}x${k}`) || c < 3 || c > 6 || k < 4 || k > 10 || new Set(L).size !== 3 || x.libs.juste !== `${c * k} colis`) faux.push(x.enonce);
    }
    return faux;
  });
  egal(r, [], 'variantes hors règle');
});

await v('ENT-10.9 : parcours — fermée tant qu’ENT-10.8 n’a pas son premier bilan, ouverte ensuite', async () => {
  const r = await pg.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const { verrou } = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const de = (id) => metas.find((x) => x.id === id);
    const uid = 'u-verrou-pelleau109', gid = 'g-verrou-pelleau109', profil = { role: 'eleve', uid };
    const k = `prepalog:prive/${uid}/pelleau-evaluation-reception`;
    localStorage.removeItem(k);
    const avant = await verrou(metas, de('pelleau-controler'), profil, gid);
    localStorage.setItem(k, JSON.stringify({ data: { v: 1, points: { 'pelleau-evaluation-reception': { v: 1 } } }, ts: 1 }));
    const apres = await verrou(metas, de('pelleau-controler'), profil, gid);
    localStorage.removeItem(k);
    return { avant, apres };
  });
  egal(r.avant, 'Termine d\'abord ENT-10.8.', 'avant le premier bilan d’ENT-10.8');
  egal(r.apres, null, 'après');
});

await v('ENT-10.9 : corrigé enseignant — par élève (temoin-2) : ses palettes (anomalie, feuille, réel, décision, réserve), ses phrases justes ; un élève qui n’a pas ouvert la séance reçoit déjà le bon', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-10.9.js');
    const e = C.corrigeEleve({ tirage: { graine: 'temoin-2' } }, 'x');
    const vide = C.corrigeEleve({}, 'temoin-2');
    return { items: e.items.map((i) => [i.texte, i.rep]), memes: JSON.stringify(vide.items) === JSON.stringify(e.items), texte: vide.texte.length > 0, n: C.CORRIGE.items.length };
  });
  egal(r.items, [
    ['P1 — Biscuits au beurre, cartons de 12 paquets', 'conforme, pleine · FR 40 · réel 40 · accepter · aucune réserve'],
    ['P2 — Biscuits au beurre, cartons de 12 paquets', '2 cartons écrasés sur la face avant · FR 40 · réel 40 · accepter avec réserves (Colis abîmé) · réserve : 2 colis abîmé(s)'],
    ['P3 — Terreau universel, sacs de 40 L', '1 sac abîmé sur la face arrière (il faut faire le tour) · FR 40 · réel 40 · accepter avec réserves (Colis abîmé) · réserve : 1 colis abîmé(s)'],
    ['P4 — Terreau universel, sacs de 40 L', 'PIÈGE : couche du dessus à moitié vide, mais la feuille de ramasse dit le même nombre · FR 35 · réel 35 · accepter · aucune réserve'],
    ['Compte rendu : la ligne des réserves', CR2.reserves],
    ['Compte rendu : la zone litiges', CR2.litiges],
    ['Compte rendu : salutation et fin', 'Bonjour Erwan, … Je reste au quai. (prénom)']], 'corrigé du témoin');
  vrai(r.memes && r.texte, 'élève qui n’a pas ouvert la séance : son jeu, déjà le bon');
  egal(r.n, 4, 'parties du corrigé commun');
});

await v('ENT-10.9 : aucune requête hors du site, aucun jour de la semaine ni année dans les documents, aucune erreur JavaScript', async () => {
  const doc = await pg.evaluate(async () => { const S = await import('/contenus/pelleau-ent109.js'); return S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html({}) : d.html)).join('\n'); });
  vrai(!JOURS.test(doc), 'un jour de la semaine dans un document');
  vrai(!/\b20\d\d\b/.test(doc.replace(/consulté le \d\d\/\d\d\/20\d\d/g, '')), 'une année dans un document');
  egal([...hotes], [], 'requêtes hors du site');
  egal(erreurs, [], 'erreurs JavaScript');
});

await P.fermer();
}
