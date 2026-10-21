// Suite de tests de Prepalog — bloc « pelleau-110 » : Transports Pelleau ENT-10.10, le contrôle, seul (CAP OL, entraînement CAP-C1.4).
// `node outils/test.mjs pelleau-110` ne lance que ce bloc (un bloc par séance : `docs/briefs/COORDINATION-pelleau.md` §2 n° 21). Aides communes :
// `outils/test/pelleau/commun.mjs` (`ouvrirPelleau`, `qFilSelecteur`). Brief : `docs/briefs/ENT-10.10-pelleau-controle-seul.md` §8 (modèle : bloc `pelleau-109`).
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/pelleau-controle-seul.js` → `rendre`).
// Mouvement réduit. Le quai s'ouvre à ③ (`commence: 'controle'`).
//
// Valeurs ÉCRITES À LA MAIN. La ramasse : 2 palettes Biscuiterie Ar Vag (cartons, 5 couches × 8 = 40) et 2 d'Agri-Kerlann (SACS, 4 couches × 10 = 40), dans un ORDRE
// tiré par élève. Trois élèves TÉMOINS (la graine = l'identifiant), relevés une fois et recopiés ici :
//   « temoin-1 » : P1 (sacs) PIÈGE, couche du dessus à 5 sacs sur 10, FR 35 = réel 35 · P2 (sacs) 2 sacs PERCÉS devant (40) · P3 (cartons) 1 carton abîmé DERRIÈRE
//                  (40, il faut faire le tour) · P4 (cartons) conforme (40).
//   « temoin-2 » : P1 (cartons) 2 cartons ÉCRASÉS devant (40) · P2 (cartons) PIÈGE, 4 cartons sur 8, FR 36 = réel 36 · P3 (sacs) 2 sacs MANQUANTS au dessus (FR 40,
//                  réel 38) · P4 (sacs) conforme (40).
//   « temoin-3 » : P1 (cartons) 2 cartons ÉCRASÉS devant · P2 (cartons) conforme · P3 (sacs) PIÈGE, 5 sacs sur 10, FR 35 = réel 35 · P4 (sacs) ARTICLE DIFFÉRENT : les
//                  sacs portent l'étiquette de l'engrais (AK-40210) alors que la feuille dit le terreau (AK-31205), 40 sacs au bon compte.
// Poids : palettes 2,5 (facile) · 2,5 (moyen ou difficile) · 1,5 (piège) · 1,5 (conforme) ; réserves 1,5 × 2 · déballage 1 · signature 1 ; compte rendu 1 · 1 ·
// forme 1 ; questions Q1 1,5 · Q2 1,5 · Q3 1 (part 4). Total 20.

import { ouvrirPelleau, qFilSelecteur, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'pelleau-controle-seul';
const QID = 'pelleau-quai-110';
const PHR = 'pelleau-compte-rendu-110';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: '/activites/pelleau-controle-seul.js', id: ID });
const { pg, Z, pause, base, note, present, texte, entrants, aller, erreurs, hotes } = P;
const qFil = qFilSelecteur(P, vrai);
const CAPTURES = process.env.CAPTURES_ENT110 || '';
const Q = (s) => `${Z} ${s}`;

const OUV = { reserve: 'remarque', avarie: 'abimee', manquant: 'absent', couches: 'juste', depot: 'rendre', 'zone-litiges': 'cote', article: 'autre', 'img-sac': 'perce',
  'img-carton-ecrase': 'ecrase', 'img-etiquette': 'autre' };
const monter = (o = {}) => P.monter({ rep: OUV, ...o });
const BONNES_Q = { 'reserve-precise': 'precise', 'article-different': 'reserve', 'rendre-meme-3': 'preuve' };
const FAUSSES_Q = { 'reserve-precise': 'etat', 'article-different': 'rien', 'rendre-meme-3': 'payer' };
const GROUPES = ['Contrôler les palettes', 'Les réserves et la signature', 'Rendre compte', 'Les questions'];
const JALONS = ['palette-facile', 'palette-moyen', 'palette-piege', 'palette-conforme', 'reserve-facile', 'reserve-moyen', 'deballage', 'signature',
  'cr-reserves', 'cr-litiges', 'cr-forme'];
const POIDS = [2.5, 2.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, 1];
const JOURS = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus)\b/i;
// Le contrôle juste de chaque témoin : [comptage, décision, motif], puis la valeur de chaque réserve.
const T1 = { graine: 'temoin-1', pal: { P1: [35, 'accepter'], P2: [40, 'reserves', 'avarie'], P3: [40, 'reserves', 'avarie'], P4: [40, 'accepter'] },
  res: { P2: '2', P3: '1' } };
const T2 = { graine: 'temoin-2', pal: { P1: [40, 'reserves', 'avarie'], P2: [36, 'accepter'], P3: [38, 'reserves', 'manquant'], P4: [40, 'accepter'] },
  res: { P1: '2', P3: '2' } };
const T3 = { graine: 'temoin-3', pal: { P1: [40, 'reserves', 'avarie'], P2: [40, 'accepter'], P3: [35, 'accepter'], P4: [40, 'reserves', 'produit'] },
  res: { P1: '2', P4: 'AK-40210' } };
const CR1 = { salutation: 'Bonjour Erwan,', reserves: 'Réserves signées par Loïc : P2, 2 sacs abîmés ; P3, 1 carton abîmé.',
  litiges: 'J’ai mis les 2 sacs abîmés de P2 et le carton abîmé de P3 en zone litiges.', fin: 'Je reste au quai. Lea' };
const CR2 = { salutation: 'Bonjour Erwan,', reserves: 'Réserves signées par Loïc : P1, 2 cartons abîmés ; P3, 2 sacs manquants.',
  litiges: 'J’ai mis les 2 cartons abîmés de P1 en zone litiges.', fin: 'Je reste au quai. Lea' };
const CR3 = { salutation: 'Bonjour Erwan,', reserves: 'Réserves signées par Loïc : P1, 2 cartons abîmés ; P4, article différent (AK-40210).',
  litiges: 'J’ai mis les 2 cartons abîmés de P1 et la palette P4 en zone litiges.', fin: 'Je reste au quai. Lea' };
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
// Le quai : chaque palette, puis les réserves, la mention (o.deballage), la signature et la clôture. Rend les questions vues, dans l'ordre.
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
await v('ENT-10.10 : la séance se charge (CAP, CAP-C1.4, entraînement, correction, bilan détaillé, parcours après ENT-10.9) ; poids 16 + part 4 = 20 jalon par jalon écrit à la main ; au registre sous l’entreprise n° 10 ; fermée aux élèves tant que l’enseignant ne l’a pas cochée', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/pelleau-controle-seul.js');
    const S = await import('/contenus/pelleau-ent110.js');
    const Qs = await import('/contenus/questions/ENT-10.10.js');
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
    m.niveauxPrevus, m.questions, m.pret, m.ouverture, m.corrige, m.copie],
  ['pelleau-controle-seul', 'ENT-10.10', 'simulog', ['cap'], [], ['CAP-C1.4'], 'entrainement', 20, true, true, true, 'pelleau-controler', ['confirme', 'accompagne'], 'ENT-10.10',
    true, 'prof', './contenus/corriges/ENT-10.10.js', undefined], 'meta');
  egal(r.ids, JALONS, 'jalons');
  egal(r.poids, POIDS, 'poids jalon par jalon (écrits à la main)');
  proche(r.somme, 16, 'somme des poids des jalons');
  proche(r.somme + r.part, 20, 'jalons + questions');
  egal(r.parGroupe, [['Contrôler les palettes', 8], ['Les réserves et la signature', 5], ['Rendre compte', 3]], 'points par ligne du bandeau (8 + 5 + 3)');
  egal(r.ecrans, ['cr-reserves', 'cr-litiges', 'cr-forme'], '« Corriger » ne rouvre que le compte rendu');
  egal(r.bonus, 0, 'aucun cas bonus');
  egal(r.notees, [['reserve-precise', 'erwan', 1.5, 'tout de suite', false], ['article-different', 'erwan', 1.5, 'bilan', false],
    ['rendre-meme-3', 'erwan', 1, 'tout de suite', false]], 'questions au fil (brief §4 bis : Q1 1,5, Q2 1,5 au bilan, Q3 1)');
  egal(r.ouv, [{ preparation: 3, image: 1 }, 10, ['reserve', 'avarie', 'couches', 'depot', 'article', 'img-sac', 'img-etiquette']],
    'Avant de commencer : 10 notions (banque d’ENT-10.9 + article + img-etiquette), 3 + 1 tirées, ★');
  egal([r.auRegistre, r.echecs], [true, []], 'au registre, sans échec');
  egal([r.cap, r.coche, r.autre], [false, true, false], 'fermée aux élèves, ouverte par l’enseignant ; jamais hors CAP');
  egal(r.fin, 'Loïc a signé : le contrôle ne se refait pas.', 'finFige');
});

await v('ENT-10.10 : le quai — commence au contrôle, feuille de ramasse « FR », unité « colis », trois motifs dont « Article différent », aides ÉTEINTES au standard et au confirmé, rappel seul à l’accompagné, brouillon libre ; verifierQuai accepte les trois niveaux', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent110-donnees.js');
    const Qm = await import('/core/types/quai.js');
    const q = D.quaiDe('temoin-1');
    const n = (x) => D.quaiDe('temoin-1', { niveau: x });
    return { q: [q.id, q.rendu, q.froid, q.commence, q.document, q.recommencer, q.securite, q.arret, q.unite, q.motifs, q.libelles, q.camions.length,
      q.camions[0].tutoiement, q.camions[0].prenomChauffeur, q.dechargement.nom, q.depose.cases.map((c) => c.id), Object.keys(q.depose.clients)],
      pal: q.camions[0].palettes.map((p) => [p.id, p.client, p.forme || 'cartons', p.W, p.D, p.L, p.ref]),
      aides: ['standard', 'confirme', 'accompagne'].map((x) => [n(x).aides, n(x).calcul]),
      verif: ['standard', 'confirme', 'accompagne'].map((x) => Qm.verifierQuai(n(x))),
      ref: Qm.verifierQuai(D.quaiDe('')) };
  });
  egal(r.q, ['pelleau-quai-110', 'iso', false, 'controle', { nom: 'Feuille de ramasse', court: 'FR', article: 'la' }, false, undefined, undefined,
    { un: 'colis', des: 'colis' }, ['avarie', 'manquant', 'produit'],
    { avarie: { nom: 'Colis abîmé', precision: 'écrasé ou percé', adjectif: 'abîmé' }, produit: { nom: 'Article différent' } }, 1, true, 'Loïc', 'Yann',
    ['allee-1', 'AV1', 'AV2', 'AK1', 'AK2', 'quaiB-1'], ['ar-vag', 'agri-kerlann']], 'déclaration du quai');
  egal(r.pal, [['P1', 'agri-kerlann', 'sacs', 5, 2, 4, 'AK-31205'], ['P2', 'agri-kerlann', 'sacs', 5, 2, 4, 'AK-31205'],
    ['P3', 'ar-vag', 'cartons', 4, 2, 5, 'AV-20418'], ['P4', 'ar-vag', 'cartons', 4, 2, 5, 'AV-20418']], 'la ramasse du témoin 1, dans l’ordre tiré');
  egal(r.aides, [[{}, { forme: 'brouillon' }], [{}, { forme: 'brouillon' }], [{ consignes: true }, { forme: 'brouillon' }]], 'aides : standard et confirmé éteintes, accompagné = le rappel');
  egal([r.verif, r.ref], [[[], [], []], []], 'verifierQuai');
});

// ─────────────────────────────────────────────────────────── le tirage
await v('ENT-10.10 : tirage — 300 graines : zéro secours ; les 6 ordres de ramasse sortent ; 4 rôles ; les deux palettes à problème de DEUX clients ; au moins une avarie ; cartons écrasés chez Ar Vag, sacs percés chez Agri-Kerlann ; l’article différent ≈ un tirage sur trois, SEULEMENT sur des sacs d’Agri-Kerlann, et l’étiquette y dit l’engrais ; quantités, feuille et phrase juste', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent110-donnees.js');
    const { tirerJeu } = await import('/core/tirage.js');
    const UN = { 'ar-vag': ['carton', 'cartons'], 'agri-kerlann': ['sac', 'sacs'] };
    const MOITIE = { 'ar-vag': 4, 'agri-kerlann': 5 };
    const o = { secours: 0, roles: 0, client: 0, avarie: 0, face: 0, qte: 0, fr: 0, produitAilleurs: 0, etiq: 0, phrase: [], ordres: new Set(), vus: new Set(), produit: 0, deux: 0 };
    for (let i = 0; i < 300; i++) {
      const t = tirerJeu(D.TIRAGE, `eleve-${i}|pelleau-controle-seul`);
      if (t.secours) o.secours++;
      const P = t.jeu.palettes, de = (r) => P.find((p) => p.role === r);
      o.ordres.add(P.map((p) => (p.client === 'ar-vag' ? 'V' : 'K')).join(''));
      if (new Set(P.map((p) => p.role)).size !== 4) o.roles++;
      if (P.filter((p) => p.client === 'ar-vag').length !== 2) o.deux++;
      const fa = de('facile'), mo = de('moyen'), pi = de('piege');
      if (fa.client === mo.client) o.client++;
      if (!P.some((p) => Object.keys(p.avarie).length)) o.avarie++;
      if (fa.anomalie !== (fa.client === 'ar-vag' ? 'ecrase-face' : 'perce-face')) o.face++;
      P.forEach((p) => o.vus.add(`${p.anomalie}@${p.client === 'ar-vag' ? 'carton' : 'sac'}`));
      const nAv = (p) => Object.keys(p.avarie).length;
      const bonMoyen = mo.anomalie === 'cache' ? nAv(mo) === 1 && !mo.manque.length && Object.values(mo.avarie).every((d) => d[1] === -1)
        : mo.anomalie === 'manquant' ? mo.manque.length === 2 && !nAv(mo) : mo.anomalie === 'produit' ? !mo.manque.length && !nAv(mo) : false;
      if (!(nAv(fa) === 2 && !fa.manque.length && Object.values(fa.avarie).every((d) => d[1] === 1) && bonMoyen && pi.manque.length === MOITIE[pi.client] && !nAv(pi))) o.qte++;
      if (P.some((p) => p.bl !== (p.role === 'piege' ? 40 - p.manque.length : 40))) o.fr++;
      // L'article différent : sur des sacs d'Agri-Kerlann, l'étiquette dit l'engrais ; partout ailleurs, celle de la feuille.
      if (mo.anomalie === 'produit') o.produit++;
      if (P.some((p) => p.anomalie === 'produit' && p.client !== 'agri-kerlann')) o.produitAilleurs++;
      D.quaiDe(`eleve-${i}`).camions[0].palettes.forEach((p, k) => {
        const attendu = P[k].anomalie === 'produit' ? ['AK-40210', 'ENGRAIS GRANULÉ, SACS DE 25 KG'] : [p.ref, p.nom.toUpperCase()];
        if (p.etiq.ref !== attendu[0] || p.etiq.nom !== attendu[1]) o.etiq++;
      });
      // La phrase juste, recomposée ici sans le code de la séance.
      const dit = (p) => {
        const [un, des] = UN[p.client];
        if (p.anomalie === 'produit') return `${p.id}, article différent (AK-40210)`;
        const n = p.anomalie === 'manquant' ? 2 : p.anomalie === 'cache' ? 1 : 2;
        return `${p.id}, ${n} ${n > 1 ? des : un} ${p.anomalie === 'manquant' ? 'manquants' : n > 1 ? 'abîmés' : 'abîmé'}`;
      };
      const attendue = `Réserves signées par Loïc : ${[fa, mo].sort((a, b) => a.id.localeCompare(b.id)).map(dit).join(' ; ')}.`;
      const C = D.choixReserves(t.jeu);
      if (C[0] !== attendue || new Set(C).size !== 4 || !C.includes('Tout est conforme, aucune réserve.')) o.phrase.push([i, C[0], attendue]);
    }
    return { ...o, ordres: [...o.ordres].sort(), vus: [...o.vus].sort(), phrase: o.phrase.slice(0, 3) };
  });
  egal([r.secours, r.roles, r.deux, r.client, r.avarie, r.face, r.qte, r.fr, r.etiq, r.produitAilleurs], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    'secours, rôles, 2 palettes par client, clients, avarie, face, quantités, feuille, étiquettes, article différent hors Agri-Kerlann');
  egal(r.phrase, [], 'phrase juste des réserves');
  egal(r.ordres, ['KKVV', 'KVKV', 'KVVK', 'VKKV', 'VKVK', 'VVKK'], 'les six ordres de ramasse (V = Ar Vag, K = Agri-Kerlann)');
  vrai(r.produit >= 75 && r.produit <= 126, `article différent : ${r.produit} graines sur 300 (≈ un tiers attendu, entre 75 et 126)`);
  egal(r.vus, ['cache@carton', 'cache@sac', 'conforme@carton', 'conforme@sac', 'couche-normale@carton', 'couche-normale@sac', 'ecrase-face@carton',
    'manquant@carton', 'manquant@sac', 'perce-face@sac', 'produit@sac'], 'chaque anomalie sur chaque client possible (écrasés : cartons ; percés : sacs ; article différent : sacs)');
});

await v('ENT-10.10 : contrôle d’équité — `verifier` refuse deux palettes à problème du même client, un jeu sans avarie, un article différent chez Ar Vag, un colis abîmé hors de sa face ; les trois témoins et la référence passent', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent110-donnees.js');
    const j = (g = 'temoin-2') => JSON.parse(JSON.stringify(D.jeuDe(g)));
    // temoin-3 : P1 facile (cartons Ar Vag), P2 conforme (Ar Vag), P4 moyen (Agri) : on met le moyen sur P2 (Ar Vag) à la place du conforme.
    const meme = j('temoin-3'); meme.palettes[1].role = 'moyen'; meme.palettes[3].role = 'conforme';
    const sansAvarie = j('temoin-1'); sansAvarie.palettes.forEach((p) => { p.avarie = {}; });
    // temoin-1 : P3 (cartons Ar Vag) porte le moyen « cache » ; on lui donne l'article différent.
    const produitArVag = j('temoin-1'); produitArVag.palettes[2].anomalie = 'produit'; produitArVag.palettes[2].avarie = {};
    const face = j('temoin-2'); const k = Object.keys(face.palettes[0].avarie)[0]; face.palettes[0].avarie[k] = [0, -1];
    return { meme: D.verifier(meme), sansAvarie: D.verifier(sansAvarie), produitArVag: D.verifier(produitArVag), face: D.verifier(face),
      bons: [D.verifier(j('temoin-1')), D.verifier(j('temoin-2')), D.verifier(j('temoin-3')), D.verifier(D.jeuDe(''))] };
  });
  vrai(r.meme.some((x) => /même client/.test(x)), 'même client : ' + r.meme);
  vrai(r.sansAvarie.some((x) => /aucune avarie/.test(x)), 'sans avarie : ' + r.sansAvarie);
  vrai(r.produitArVag.some((x) => /P3 : anomalie produit pour le rôle moyen/.test(x)), 'article différent chez Ar Vag : ' + r.produitArVag);
  vrai(r.face.some((x) => /P1 : colis abîmé hors de sa face/.test(x)), 'hors de sa face : ' + r.face);
  egal(r.bons, [[], [], [], []], 'témoins et référence');
});

await v('ENT-10.10 : les trois témoins (valeurs à la main) — palettes, feuille et réel au quai, décision attendue, motif, étiquette, phrases justes, ligne « contrôlé »', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent110-donnees.js');
    const lire = (g) => {
      const Qd = D.quaiDe(g), j = D.jeuDe(g);
      return { pal: Qd.camions[0].palettes.map((p) => [p.id, p.bl, p.W * p.D * p.L - p.manque.length, Object.keys(p.avarie).length, p.attendu, p.motifAttendu, p.etiq.ref]),
        res: D.choixReserves(j)[0], lit: D.choixLitiges(j)[0] };
    };
    return { t1: lire('temoin-1'), t2: lire('temoin-2'), t3: lire('temoin-3'), controle: D.ligneControle() };
  });
  egal(r.t1.pal, [['P1', 35, 35, 0, 'accepter', 'aucun', 'AK-31205'], ['P2', 40, 40, 2, 'reserves', 'avarie', 'AK-31205'], ['P3', 40, 40, 1, 'reserves', 'avarie', 'AV-20418'],
    ['P4', 40, 40, 0, 'accepter', 'aucun', 'AV-20418']], 'temoin-1');
  egal([r.t1.res, r.t1.lit], [CR1.reserves, CR1.litiges], 'temoin-1 : phrases');
  egal(r.t2.pal, [['P1', 40, 40, 2, 'reserves', 'avarie', 'AV-20418'], ['P2', 36, 36, 0, 'accepter', 'aucun', 'AV-20418'], ['P3', 40, 38, 0, 'reserves', 'manquant', 'AK-31205'],
    ['P4', 40, 40, 0, 'accepter', 'aucun', 'AK-31205']], 'temoin-2');
  egal([r.t2.res, r.t2.lit], [CR2.reserves, CR2.litiges], 'temoin-2 : phrases');
  egal(r.t3.pal, [['P1', 40, 40, 2, 'reserves', 'avarie', 'AV-20418'], ['P2', 40, 40, 0, 'accepter', 'aucun', 'AV-20418'], ['P3', 35, 35, 0, 'accepter', 'aucun', 'AK-31205'],
    ['P4', 40, 40, 0, 'reserves', 'produit', 'AK-40210']], 'temoin-3 : la palette P4 porte l’étiquette de l’engrais');
  egal([r.t3.res, r.t3.lit], [CR3.reserves, CR3.litiges], 'temoin-3 : phrases');
  egal(r.controle, CONTROLE, 'la ligne imposée');
});

// ─────────────────────────────────────────────────────────── « que, jamais de combien » et l'article différent n'est jamais annoncé
await v('ENT-10.10 : que, jamais de combien — sur 300 graines, ni le réel d’une palette à manquants ni « engrais » ne sont écrits avant la signature (documents, messages, accueil, consigne du quai) ; la consigne, le titre et la parole de Loïc ne changent pas avec le tirage ; aucun texte ne nomme une palette ; l’étiquette dit « 1 carton » / « 1 sac »', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent110-donnees.js');
    const S = await import('/contenus/pelleau-ent110.js');
    const Qs = await import('/contenus/questions/ENT-10.10.js');
    const fixes = [...S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html({}) : d.html)), JSON.stringify(S.ACCUEIL),
      S.VOLET.semer('Lea').mails.map((m) => m.text).join(' '),
      Qs.QUESTIONS.liste.filter((x) => x.type === 'fil' && x.id !== 'reserve-precise').map((x) => `${x.enonce} ${x.choix.map((c) => c.lib).join(' ')}`).join(' ')].join('\n');
    const fixesQuai = (q) => JSON.stringify([q.titre, q.avertissement, q.camions[0].parole]);
    const ref = fixesQuai(D.quaiDe('')), varient = [], fuites = [], poids = new Set(), noms = new Set();
    for (let i = 0; i < 300; i++) {
      const q = D.quaiDe(`g-${i}`);
      if (fixesQuai(q) !== ref) varient.push(i);
      q.camions[0].palettes.forEach((p) => { poids.add(p.etiq.poids); noms.add(p.nom); });
      // Le réel d'une palette à manquants, écrit quelque part (consigne, textes fixes) ?
      D.jeuDe(`g-${i}`).palettes.filter((p) => p.anomalie === 'manquant').forEach((p) => { if (new RegExp(`\\b${D.reelDe(p)}\\b`).test(ref + fixes)) fuites.push(i); });
    }
    return { varient: varient.slice(0, 5), fuites: fuites.slice(0, 5), palette: /\bP[1-4]\b/.test(fixes + ref), engrais: /engrais/i.test(fixes + ref),
      poids: [...poids].sort(), noms: [...noms].sort() };
  });
  egal(r.varient, [], 'graines dont la consigne, le titre ou la parole de Loïc diffère du jeu de référence');
  egal(r.fuites, [], 'graines dont le réel d’une palette à manquants est écrit');
  egal(r.palette, false, 'un texte lu avant la signature nomme une palette');
  egal(r.engrais, false, '« engrais » écrit avant la signature (hors étiquette lue au zoom)');
  egal(r.poids, ['1 carton', '1 sac'], 'l’étiquette d’un colis');
  egal(r.noms, ['Biscuits au beurre, cartons de 12 paquets', 'Terreau universel, sacs de 40 L'], 'la désignation de la feuille : toujours les deux mêmes, jamais l’engrais');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await v('ENT-10.10 : parcours juste à l’écran (temoin-3, article différent) — Avant de commencer, vue ouverte à ③ (stepper ③ ④), Q2 à la 1re palette validée (corrigée au bilan), étiquette des sacs de P4 lue à ③ (Agri-Kerlann, AK-40210, ENGRAIS), Q1 à la clôture, Q3 au choix de la fin ; 20 / 20, bandeau de 4 lignes ✓', async () => {
  capturer = true;
  await monter({ uid: 'temoin-3', sansOuverture: true });
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
  vrai(/Je suis au bureau : tu contrôles seul/.test(await pg.textContent(Q('.quai-avert'))), 'la consigne d’Erwan en tête du quai');
  await capture('2-quai-3-debut');
  // P1 (cartons écrasés) : la première palette validée ouvre Q2 (au bilan : pas de verdict tout de suite).
  await pg.fill(Q('#qCompte'), '40'); await pg.press(Q('#qCompte'), 'Enter'); await pg.click(Q('#qDec-reserves')); await pg.click(Q('#qMot-avarie'));
  vrai(!(await panneau()), 'rien avant de valider');
  await pg.click(Q('[data-q="valider"]')); await pause();
  egal(await panneau(), 'article-different', 'Q2 au geste quai:valider');
  await pg.click(Q('[data-q-choix="reserve"][data-q="article-different"]')); await pg.click(Q('[data-q-repondre="article-different"]')); await pause();
  egal(await pg.$(Q('[data-q-verdict]')), null, 'Q2 non corrigée tout de suite');
  await pg.click(Q('[data-q-reprendre]')); await pause();
  egal(await palette(1, T3.pal.P2), [], 'P2 validée : pas de question');
  egal(await palette(2, T3.pal.P3), [], 'P3 (le piège, sacs) validée : pas de question');
  // P4 (sacs) : l'étiquette d'un sac lue au zoom, puis la palette décidée « article différent ».
  await pg.click(Q('[data-q="sel"][data-n="3"]')); await pause(30);
  await pg.dispatchEvent(Q('svg[data-q-palette] [data-q-carton="13"]'), 'click');
  await pg.waitForSelector(Q('[data-q-etiquette]'));
  const et = await pg.$eval(Q('[data-q-etiquette]'), (e) => ({ l1: e.querySelector('.quai-etiq-l1 b').textContent.trim(), ref: e.querySelector('.quai-etiq-ref').textContent.trim(),
    tout: e.innerText.replace(/\s+/g, ' ') }));
  egal([et.l1, et.ref], ['Expéditeur : Agri-Kerlann', 'AK-40210'], 'l’étiquette du sac de P4');
  vrai(/ENGRAIS GRANULÉ, SACS DE 25 KG/.test(et.tout) && /\b1 sac\b/.test(et.tout), 'la désignation de l’étiquette : ' + et.tout);
  await capture('3-quai-sac-etiquette-engrais', '[data-q-etiquette]');
  egal(await palette(3, T3.pal.P4), [], 'P4 validée : plus de question');
  await pg.click(Q('[data-q="vers4"]')); await pg.click(Q('[data-q="vers4"]')); await pause();
  for (const [id, val] of Object.entries(T3.res)) await pg.fill(Q(`#qRes-${id}`), val);
  await pg.click(Q('[data-q="ecrire"]')); await pause();
  const t4 = await pg.textContent(Q('[data-quai]'));
  vrai(/Feuille de ramasse n° RAM-0521/.test(t4), 'le titre du document de ④ : ' + t4.slice(0, 200));
  vrai(/P1 AV-20418 : acceptée sous réserve — 2 colis abîmés \(écrasé ou percé\)/.test(t4), 'réserve de P1');
  vrai(/P4 AK-31205 : acceptée sous réserve — référence livrée AK-40210/.test(t4), 'réserve de P4 : la référence lue sur l’étiquette');
  await capture('4-quai-reserves');
  await pg.click(Q('[data-q="signer"]')); await pause();
  egal(await panneau(), null, 'Q1 pas encore : la feuille est signée, le quai n’est pas clos');
  await pg.click(Q('[data-q="clore"]')); await pause();
  egal(await panneau(), 'reserve-precise', 'Q1 à la clôture du quai');
  const libs = await pg.$$eval(Q('[data-q="reserve-precise"], [data-q-choix][data-q="reserve-precise"]'), (L) => L.map((b) => b.textContent.replace(/\s+/g, ' ').trim()));
  vrai(libs.some((t) => /P1 : 2 cartons écrasés/.test(t)), 'Q1 : la bonne réponse nomme SA palette facile : ' + libs);
  await pg.click(Q('[data-q-choix="precise"][data-q="reserve-precise"]')); await pg.click(Q('[data-q-repondre="reserve-precise"]')); await pause();
  vrai(!!(await pg.$(Q('[data-q-verdict]'))), 'Q1 corrigée tout de suite');
  await pg.click(Q('[data-q-reprendre]')); await pause();
  vrai(!!(await entrants()).find((x) => x.subject === 'Ton compte rendu'), 'le compte rendu demandé à la signature');
  await ouvrirMail('Ton compte rendu'); await pg.click(Q('[data-repondre]')); await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  egal((await choixDe('reserves')).sort(), ['Réserves signées par Loïc : P1, 2 cartons abîmés ; P3, article différent (AK-40210).',
    'Réserves signées par Loïc : P1, 2 cartons abîmés ; P4, article différent (AK-31205).', CR3.reserves, 'Tout est conforme, aucune réserve.'].sort(),
  'les choix des réserves, calculés sur SON tirage');
  vrai((await texte()).includes(CONTROLE), 'la ligne imposée « contrôlé »');
  const vus2 = await compteRendu(CR3, BONNES_Q, true);
  egal(vus2, ['rendre-meme-3'], 'Q3 au choix de la fin');
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  egal(['question:reserve-precise', 'question:article-different', 'question:rendre-meme-3'].map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
  proche(n.score, 20, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  await capture('5-bilan', '[data-fin-seance]');
  capturer = false;
  const M = await entrants();
  egal(M.map((x) => x.subject), ['Le contrôle, seul', 'Ton compte rendu', 'Merci'], 'les messages, dans l’ordre');
  egal(M[0].pieces, ['droit-depot'], '« Le droit » joint au premier message');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun message ne dit juste / faux / correct / erreur / bonus');
  egal(M.filter((x) => JOURS.test(x.text) || JOURS.test(x.subject)).map((x) => x.subject), [], 'aucun jour de la semaine');
  vrai(M.every((x, i) => !i || x.ts >= M[i - 1].ts), 'heures croissantes');
  const d0 = new Date(M[0].ts);
  vrai(d0.getMonth() === 4 && d0.getDate() === 21 && d0.getHours() === 8, 'le 21 mai, 8 h : ' + d0);
  vrai(/Maëlys saisit l’entrée en stock avec tes réserves/.test(M[2].text), 'le message de fin');
  egal(erreurs, [], 'erreurs JavaScript');
});

await v('ENT-10.10 : étiquettes lues — un sac de P4 (temoin-3) dit l’engrais, un sac de P3 (même client, même quai) dit le terreau, un carton de P1 dit « Expéditeur : Biscuiterie Ar Vag » ; sacs dessinés sur P3 et P4 seulement ; à ④, chaque palette dans la zone de son client, dans l’ordre de la ramasse', async () => {
  await monter({ uid: 'temoin-3' });
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  const sacs = async (n) => { await pg.click(Q(`[data-q="sel"][data-n="${n}"]`)); await pause(30); return pg.$$eval(Q('svg[data-q-palette] [data-iso-sac]'), (L) => L.length); };
  egal([await sacs(0), await sacs(1), await sacs(2), await sacs(3)], [0, 0, 35, 40], 'sacs dessinés à ③ (P1, P2 : cartons ; P3 : 35 sacs, le piège ; P4 : 40 sacs)');
  const lire = async (n, carton) => {
    await pg.click(Q(`[data-q="sel"][data-n="${n}"]`)); await pause(30);
    await pg.dispatchEvent(Q(`svg[data-q-palette] [data-q-carton="${carton}"]`), 'click');
    await pg.waitForSelector(Q('[data-q-etiquette]'));
    await pause(40);
    return pg.$eval(Q('[data-q-etiquette]'), (e) => ({ l1: e.querySelector('.quai-etiq-l1 b').textContent.trim(), no: e.querySelector('.quai-etiq-l1 span').textContent.replace(/\s+/g, ' ').trim(),
      ref: e.querySelector('.quai-etiq-ref').textContent.trim() }));
  };
  egal(await lire(3, 13), { l1: 'Expéditeur : Agri-Kerlann', no: 'Colis 13', ref: 'AK-40210' }, 'étiquette d’un sac de P4 (article différent)');
  egal(await lire(2, 13), { l1: 'Expéditeur : Agri-Kerlann', no: 'Colis 13', ref: 'AK-31205' }, 'étiquette d’un sac de P3 (le piège : le terreau de la feuille)');
  egal((await lire(0, 2)).l1, 'Expéditeur : Biscuiterie Ar Vag', 'étiquette d’un carton de P1');
  await pg.click(Q('[data-q="etape"][data-n="4"]')); await pause();
  const posees = await pg.$$eval(Q('[data-q-cf] [data-iso-posee]'), (L) => Object.fromEntries(L.map((g) => [g.dataset.isoPosee, g.dataset.isoCase]).sort()));
  egal(posees, { P1: 'AV1', P2: 'AV2', P3: 'AK1', P4: 'AK2' }, '④ : chaque palette dans la zone de son client');
  await monter({ uid: 'temoin-1' });
  await allerV('quai'); await pg.waitForSelector(Q('[data-q-palette]'));
  await pg.click(Q('[data-q="etape"][data-n="4"]')); await pause();
  const posees1 = await pg.$$eval(Q('[data-q-cf] [data-iso-posee]'), (L) => Object.fromEntries(L.map((g) => [g.dataset.isoPosee, g.dataset.isoCase]).sort()));
  egal(posees1, { P1: 'AK1', P2: 'AK2', P3: 'AV1', P4: 'AV2' }, 'temoin-1, ramasse Agri-Kerlann d’abord : les sacs dans les cases d’Agri-Kerlann');
  const large = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  vrai(large <= 0, '1366 × 768 : défilement horizontal ' + large);
});

await v('ENT-10.10 : l’article différent est jugé — la mauvaise référence (celle de la feuille) : réserve ✗, palette ✓ ; la palette acceptée sans voir l’étiquette : palette ✗ et réserve ✗ ; le piège compté « plein » : seule sa palette ✗', async () => {
  await monter({ uid: 'temoin-3' });
  await quai(T3, { res: { P4: 'AK-31205' } });
  await compteRendu(CR3);
  const n = await note();
  egal(jalonsFaux(n), ['reserve-moyen'], 'la mauvaise référence : seule la réserve ✗');
  proche(n.score, 20 - 1.5, 'note');
  await monter({ uid: 'temoin-3' });
  await quai(T3, { pal: { P4: [40, 'accepter'], P3: [40, 'accepter'] } });
  await compteRendu(CR3);
  const n2 = await note();
  egal(jalonsFaux(n2), ['palette-moyen', 'palette-piege', 'reserve-moyen'], 'l’article différent non vu et le piège compté plein');
  proche(n2.score, 20 - 2.5 - 1.5 - 1.5, 'note');
  const c = Object.fromEntries((await cases()).map(([id, e, t]) => [id, [e, t]]));
  vrai(c['palette-moyen'][0] === 'ko' && /Palette P4/.test(c['palette-moyen'][1]), 'le bilan nomme la palette : ' + c['palette-moyen']);
  vrai(c['palette-piege'][0] === 'ko' && /Palette P3/.test(c['palette-piege'][1]) && !/\b35\b/.test(c['palette-piege'][1]), 'le piège : ' + c['palette-piege']);
  vrai(!/AK-40210/.test(c['palette-moyen'][1]) && !/AK-40210/.test(c['reserve-moyen'][1]), 'le bilan ne souffle pas la référence attendue');
});

await v('ENT-10.10 : « tout est conforme » refusé quand il y a des anomalies — compte rendu faux : réserves du compte rendu ✗, le quai juste reste ✓ ; temoin-1 : le carton abîmé DERRIÈRE accepté sans faire le tour : palette et réserve ✗', async () => {
  await monter({ uid: 'temoin-2' });
  await quai(T2);
  await compteRendu({ ...CR2, reserves: 'Tout est conforme, aucune réserve.' });
  const n = await note();
  egal(jalonsFaux(n), ['cr-reserves'], 'jalons faux');
  proche(n.score, 19, 'note');
  await monter({ uid: 'temoin-1' });
  await quai(T1, { pal: { P3: [40, 'accepter'] } });
  await compteRendu(CR1);
  const n1 = await note();
  egal(jalonsFaux(n1), ['palette-moyen', 'reserve-moyen'], 'jalons faux');
  proche(n1.score, 20 - 2.5 - 1.5, 'note');
});

await v('ENT-10.10 : temoin-1 juste en faisant le tour de P3 — 20 / 20 ; « sous réserve de déballage » ajoutée : déballage ✗, le reste juste, et personne ne le reprend à l’écran (Erwan est au bureau)', async () => {
  await monter({ uid: 'temoin-1' });
  await quai(T1, { tour: 'P3' });
  await compteRendu(CR1);
  proche((await note()).score, 20, 'juste');
  await monter({ uid: 'temoin-1' });
  await quai(T1, { deballage: true });
  vrai((await base()).quais[QID].mentionEcrite === true, 'la mention est écrite');
  vrai(!(await present('[data-q-chef-deballage]')), 'aucun chef de quai ne commente la mention');
  await compteRendu(CR1);
  const n = await note();
  egal(jalonsFaux(n), ['deballage'], 'jalons faux');
  proche(n.score, 19, 'note');
});

await v('ENT-10.10 : inaction et pire cas (temoin-2) — rien fait : 0 (aucun jalon vrai, même « pas de déballage ») ; tout faux sauf la signature : 1 / 20 ; « Corriger » ne rouvre que le compte rendu et RELÈVE la note, le quai reste faux et clos', async () => {
  await monter({ uid: 'temoin-2' });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'inaction');
  await allerV('quai'); await pg.waitForSelector(Q('[data-q-palette]'));
  const etats = await pg.evaluate(async () => {
    const S = await import('/contenus/pelleau-ent110.js');
    return S.ETAPES.map((e) => [e.id, e.verifier(window.__f.db).status]);
  });
  egal(etats.filter(([, s]) => s === 'ok'), [], 'aucun jalon vrai sans rien faire (quai ouvert)');
  await quai(T2, { pal: { P1: [40, 'accepter'], P2: [40, 'reserves', 'manquant'], P3: [40, 'accepter'], P4: [39, 'reserves', 'avarie'] }, res: { P2: '4', P4: '1' },
    deballage: true, q: FAUSSES_Q });
  await compteRendu({ salutation: 'Salut mon pote,', reserves: 'Tout est conforme, aucune réserve.', litiges: 'J’ai rendu les colis abîmés à Loïc.', fin: 'Bisous' }, FAUSSES_Q);
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
  await compteRendu(CR2, BONNES_Q, true);
  const n2 = await note();
  egal(['cr-reserves', 'cr-litiges', 'cr-forme'].map((j) => n2.detail[j]), ['ok', 'ok', 'ok'], 'compte rendu corrigé');
  egal(['palette-facile', 'deballage'].map((j) => n2.detail[j]), ['ko', 'ko'], 'le quai reste faux');
  vrai(n2.score > n.score, `la correction relève la note : ${n.score} → ${n2.score}`);
  vrai((await entrants()).some((x) => x.subject === 'Bien reçu'), 'accusé d’Erwan au renvoi');
  egal((await base()).quais[QID].fini, true, 'le quai reste clos');
});

await v('ENT-10.10 : niveaux — standard et confirmé : aucune aide (ni règle des couches, ni rappel de formule, ni « Fais le tour », brouillon libre), aucun bonus, 20 / 20 ; accompagné : le rappel « Fais le tour de la palette » seul', async () => {
  const aides = async () => ({ aide: await pg.$$eval(Q('.quai-aide'), (L) => L.map((x) => x.textContent).join(' ')), rappel: await present('[data-q-rappel]'),
    brouillon: await present('[data-q-calc="brouillon"]') });
  for (const niveau of ['standard', 'confirme']) {
    await monter({ uid: 'temoin-1', aisance: niveau });
    await allerV('quai'); await pg.waitForSelector(Q('[data-q-palette]'));
    const A = await aides();
    egal([A.aide, A.rappel, A.brouillon], ['', false, true], `aides au ${niveau}`);
    if (niveau === 'confirme') {
      await quai(T1);
      await compteRendu(CR1);
      const n = await note();
      proche(n.score, 20, 'note');
      egal(n.detail.bonus, undefined, 'aucun bonus');
      vrai(!/bonus/i.test(await texte()), 'le mot « bonus » à l’écran');
    }
  }
  await monter({ uid: 'temoin-1', aisance: 'accompagne' });
  await allerV('quai'); await pg.waitForSelector(Q('[data-q-palette]'));
  const B = await aides();
  vrai(/Fais le tour de la palette/.test(B.aide) && !/Règle du quai/.test(B.aide) && !B.rappel, 'accompagné : le rappel « Fais le tour de la palette » seul : ' + B.aide.slice(0, 160));
});

await v('ENT-10.10 : Avant de commencer — 10 notions dont « article » et l’image de l’étiquette ; `couches` : 300 graines, jamais 5 × 8 ni 4 × 10, trois choix distincts, la juste = c × k colis', async () => {
  const r = await pg.evaluate(async () => {
    const Qs = await import('/contenus/questions/ENT-10.10.js');
    const { hasard } = await import('/core/tirage.js');
    const q = Qs.QUESTIONS.liste.find((x) => x.id === 'couches');
    const faux = [];
    for (let i = 0; i < 300; i++) {
      const x = q.variante(hasard(`g-${i}`));
      const [, c, k] = /pleine de (\d+) couches de (\d+) colis/.exec(x.enonce).map(Number);
      const L = Object.values(x.libs);
      if (['5x8', '4x10'].includes(`${c}x${k}`) || c < 3 || c > 6 || k < 4 || k > 10 || new Set(L).size !== 3 || x.libs.juste !== `${c * k} colis`) faux.push(x.enonce);
    }
    const art = Qs.QUESTIONS.liste.find((x) => x.id === 'article'), img = Qs.QUESTIONS.liste.find((x) => x.id === 'img-etiquette');
    return { faux, art: [art.rubrique, art.choix.find((c) => c.v === art.juste).lib], img: [img.rubrique, img.doc, img.choix.find((c) => c.v === img.juste).lib] };
  });
  egal(r.faux, [], 'variantes hors règle');
  egal(r.art, ['preparation', 'un produit qui n’est pas celui du document'], 'article : la bonne réponse du brief');
  egal(r.img[0], 'image', 'img-etiquette est une image');
});

await v('ENT-10.10 : les questions au fil — Q2 ne nomme pas le produit (il est tiré) ; Q1 est calculée : sur 300 graines sa bonne réponse nomme la palette « facile » de l’élève, son nombre et son mot (cartons écrasés, sacs percés), trois choix distincts ; Q3 parle d’un « colis »', async () => {
  const r = await pg.evaluate(async () => {
    const Qs = await import('/contenus/questions/ENT-10.10.js');
    const D = await import('/contenus/pelleau-ent110-donnees.js');
    const L = Qs.QUESTIONS.liste, q1 = L.find((x) => x.id === 'reserve-precise'), q2 = L.find((x) => x.id === 'article-different'), q3 = L.find((x) => x.id === 'rendre-meme-3');
    const texte = (q) => `${q.enonce} ${q.choix.map((c) => c.lib).join(' ')} ${q.retour}`;
    const faux = [], vus = new Set();
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}`, F = D.jeuDe(g).palettes.find((p) => p.role === 'facile');
      const t = q1.selon({ tirage: { graine: g } });
      const attendu = F.client === 'ar-vag' ? `${F.id} : 2 cartons écrasés` : `${F.id} : 2 sacs percés`;
      vus.add(attendu.replace(/P\d/, 'P'));
      const libs = q1.choix.map((c) => t.libs[c.v] || c.lib);
      if (t.libs.precise !== attendu || new Set(libs).size !== 3) faux.push([g, t.libs.precise, attendu]);
    }
    return { q2: texte(q2), q3: texte(q3), faux: faux.slice(0, 3), vus: [...vus].sort(), decl: q1.choix.map((c) => c.lib), q1juste: q1.juste };
  });
  vrai(!/engrais|terreau|sac/i.test(r.q2), 'Q2 ne nomme pas le produit : ' + r.q2);
  vrai(/colis/.test(r.q3) && !/\bsac\b/i.test(r.q3), 'Q3 : « colis » : ' + r.q3);
  egal(r.faux, [], 'la réserve juste de Q1, recomposée');
  egal(r.vus, ['P : 2 cartons écrasés', 'P : 2 sacs percés'], 'les deux formes de la bonne réponse');
  egal([r.decl.slice(1), r.q1juste], [['Marchandise en mauvais état', 'Sous réserve de déballage'], 'precise'], 'les deux fausses réponses sont celles du brief');
});

await v('ENT-10.10 : parcours — fermée tant qu’ENT-10.9 n’a pas son premier bilan, ouverte ensuite', async () => {
  const r = await pg.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const { verrou } = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const de = (id) => metas.find((x) => x.id === id);
    const uid = 'u-verrou-pelleau110', gid = 'g-verrou-pelleau110', profil = { role: 'eleve', uid };
    const k = `prepalog:prive/${uid}/pelleau-controler`;
    localStorage.removeItem(k);
    const avant = await verrou(metas, de('pelleau-controle-seul'), profil, gid);
    localStorage.setItem(k, JSON.stringify({ data: { v: 1, points: { 'pelleau-controler': { v: 1 } } }, ts: 1 }));
    const apres = await verrou(metas, de('pelleau-controle-seul'), profil, gid);
    localStorage.removeItem(k);
    return { avant, apres };
  });
  egal(r.avant, 'Termine d\'abord ENT-10.9.', 'avant le premier bilan d’ENT-10.9');
  egal(r.apres, null, 'après');
});

await v('ENT-10.10 : corrigé enseignant — par élève (temoin-3) : ses palettes dans l’ordre de sa ramasse (anomalie, feuille, réel, décision, réserve ; l’article différent avec l’étiquette et la feuille), ses phrases justes ; un élève qui n’a pas ouvert la séance reçoit déjà le bon', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-10.10.js');
    const e = C.corrigeEleve({ tirage: { graine: 'temoin-3' } }, 'x');
    const vide = C.corrigeEleve({}, 'temoin-3');
    return { items: e.items.map((i) => [i.texte, i.rep]), memes: JSON.stringify(vide.items) === JSON.stringify(e.items), texte: vide.texte.length > 0, n: C.CORRIGE.items.length };
  });
  egal(r.items, [
    ['P1 — Ar Vag — Biscuits au beurre, cartons de 12 paquets', '2 cartons écrasés sur la face avant · FR 40 · réel 40 · accepter avec réserves (Colis abîmé) · réserve : 2 colis abîmé(s)'],
    ['P2 — Ar Vag — Biscuits au beurre, cartons de 12 paquets', 'conforme, pleine · FR 40 · réel 40 · accepter · aucune réserve'],
    ['P3 — Agri-Kerlann — Terreau universel, sacs de 40 L', 'PIÈGE : couche du dessus à moitié vide, mais la feuille de ramasse dit le même nombre · FR 35 · réel 35 · accepter · aucune réserve'],
    ['P4 — Agri-Kerlann — Terreau universel, sacs de 40 L', 'ARTICLE DIFFÉRENT : l’étiquette dit Engrais granulé, sacs de 25 kg (AK-40210), la feuille de ramasse dit Terreau universel, sacs de 40 L (AK-31205) · FR 40 · réel 40 · accepter avec réserves (Article différent) · réserve : référence livrée AK-40210'],
    ['Compte rendu : la ligne des réserves', CR3.reserves],
    ['Compte rendu : la zone litiges', CR3.litiges],
    ['Compte rendu : salutation et fin', 'Bonjour Erwan, … Je reste au quai. (prénom)']], 'corrigé du témoin');
  vrai(r.memes && r.texte, 'élève qui n’a pas ouvert la séance : son jeu, déjà le bon');
  egal(r.n, 4, 'parties du corrigé commun');
});

await v('ENT-10.10 : aucune requête hors du site, aucun jour de la semaine ni année dans les documents, aucune erreur JavaScript', async () => {
  const doc = await pg.evaluate(async () => { const S = await import('/contenus/pelleau-ent110.js'); return S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html({}) : d.html)).join('\n'); });
  vrai(!JOURS.test(doc), 'un jour de la semaine dans un document');
  vrai(!/\b20\d\d\b/.test(doc.replace(/consulté le \d\d\/\d\d\/20\d\d/g, '')), 'une année dans un document');
  egal([...hotes], [], 'requêtes hors du site');
  egal(erreurs, [], 'erreurs JavaScript');
});

await P.fermer();
}
