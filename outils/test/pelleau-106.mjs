// Suite de tests de Prepalog — bloc « pelleau-106 » : Transports Pelleau ENT-10.6, la ramasse du mercredi (CAP OL, entraînement CAP-C1.3).
// `node outils/test.mjs pelleau-106` ne lance que ce bloc (un bloc par séance : `docs/briefs/COORDINATION-pelleau.md` §2 n° 21). Aides communes :
// `outils/test/pelleau/commun.mjs` (`ouvrirPelleau`, et `aidesQuai` pour l'inspection et la dépose, ici avec `parBase` : le quai est TIRÉ par élève).
// Brief : `docs/briefs/ENT-10.6-pelleau-ramasse-du-mercredi.md` §8.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/pelleau-ramasse-du-mercredi.js` → `rendre`), de
// vrais clics à la SOURIS ; les listes des fiches et des phrases par `selectOption`. Mouvement réduit : le camion arrive et Yann pose d'emblée.
//
// Valeurs ÉCRITES À LA MAIN. Le camion de chaque élève vient de sa graine (son identifiant, ici `t106-N`) ; trois graines choisies et leur camion :
//   t106-2  (aucun écart)  : 2+2, ordre de sortie P4 Agri-Kerlann, P3 Ar Vag, P2 Ar Vag, P1 Agri-Kerlann ; défaut = cale absente, en ordre = lampe.
//                            Annonces : Ar Vag 2, Agri-Kerlann 2 ; reçues 2 et 2 ; conforme et conforme.
//   t106-21 (il en manque) : 3+1, sortie P4 Agri, P3 Agri, P2 Ar Vag, P1 Agri ; défaut = Loïc au volant, en ordre = lampe. Annonces : Ar Vag 2 (reçue 1 :
//                            il en manque), Agri-Kerlann 3 (reçues 3 : conforme).
//   t106-6  (en trop)      : 3+1, sortie P4 Ar Vag, P3 Ar Vag, P2 Agri, P1 Ar Vag ; défaut = lampe éteinte, en ordre = cabine. Annonces : Ar Vag 2 (reçues 3 :
//                            il y en a trop), Agri-Kerlann 1 (reçue 1 : conforme).
//   Poids : préparer 3 × 2/3 · accueil 1 × 2 · défaut 2,5, aucun faux 1 · dépose 1 × 4 · rapprocher 0,75 × 4 · écart 1, salutation 0,25, fin 0,25 ;
//   questions A 1,5, B 1, C 1,5 (part 4). Total 20.

import { ouvrirPelleau, aidesQuai, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'pelleau-ramasse-du-mercredi';
const QID = 'pelleau-quai-106';
const DID = 'pelleau-loic-106';
const FP = 'preparer-106', FR = 'rapprocher-106';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: '/activites/pelleau-ramasse-du-mercredi.js', id: ID });
const { pg, Z, pause, base, note, present, texte, entrants, menu, clic, aller, qFil } = P;
const QA = aidesQuai(P, { donnees: '/contenus/pelleau-ent106-donnees.js', id: QID, parBase: 'quaiDeBase' });
const CAPTURES = process.env.CAPTURES_ENT106 || '';
const capture = async (nom) => {
  if (!CAPTURES) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(`${Z} [data-carte-fermer]`); await pause(40); }
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};

const OUV = { annonce: 'message', 'feuille-ramasse': 'charge', 'etiquette-palette': 'qui-quoi', 'zone-reception': 'poser', cale: 'immobiliser',
  gerber: 'empiler', 'img-porteur-quai': 'cale', 'img-sol': 'emplacements' };
const monter = (o = {}) => P.monter({ rep: OUV, ...o });
const Q_JUSTES = { 'pourquoi-cale': 'bouge', 'ecart-qui-dit': 'signaler', 'rendre-meme-2': 'non' };
const Q_FAUSSES = { 'pourquoi-cale': 'repos', 'ecart-qui-dit': 'rien', 'rendre-meme-2': 'voit' };
const DIAL = { feuille: 'feuille', regles: 'local' };
const DIAL_FAUX = { feuille: 'decharge', regles: 'volant' };
const SORTIE = ['P4', 'P3', 'P2', 'P1'];
const SALUT = 'Salut Maëlys,', FIN = 'Je reste à la réception si besoin. Lea';
// Les trois camions. `cases` : la case juste de chaque palette ; `prep` : les trois lignes de « Préparer » (+ `sacs` : la ligne du confirmé) ;
// `rapp` : « Rapprocher » ; `ecart` : la phrase juste du compte rendu ; `question` : l'énoncé de B.
const CAMIONS = {
  aucun: { uid: 't106-2', defaut: 'cale', ok: 'lampe', sortie: ['agri-kerlann', 'ar-vag', 'ar-vag', 'agri-kerlann'],
    cases: { P4: 'AK1', P3: 'AV1', P2: 'AV2', P1: 'AK2' }, prep: { palettes: '4', clients: '2', 'palettes-ar-vag': '2' }, sacs: '80',
    rapp: { 'recues-ar-vag': '2', 'resultat-ar-vag': 'conforme', 'recues-agri-kerlann': '2', 'resultat-agri-kerlann': 'conforme' },
    ecart: 'Tout est conforme aux annonces.', recu: '4 palettes : 2 Ar Vag, 2 Agri-Kerlann, triées en zone de réception.',
    question: 'Tout correspond aux annonces. Imagine qu’il manque une palette d’un client. Que fais-tu ?', merci: 'Merci, je note : tout est conforme.' },
  moins: { uid: 't106-21', defaut: 'cabine', ok: 'lampe', sortie: ['agri-kerlann', 'agri-kerlann', 'ar-vag', 'agri-kerlann'],
    cases: { P4: 'AK1', P3: 'AK2', P2: 'AV1', P1: 'AK3' }, prep: { palettes: '4', clients: '2', 'palettes-ar-vag': '1' }, sacs: '120',
    rapp: { 'recues-ar-vag': '1', 'resultat-ar-vag': 'manque', 'recues-agri-kerlann': '3', 'resultat-agri-kerlann': 'conforme' },
    ecart: 'Ar Vag : 1 palette de moins que l’annonce, pas prête à la ramasse.', recu: '4 palettes : 1 Ar Vag, 3 Agri-Kerlann, triées en zone de réception.',
    question: 'Ar Vag a annoncé 2 palettes, on en reçoit 1. Que fais-tu ?', merci: 'Merci, je préviens Ar Vag.' },
  plus: { uid: 't106-6', defaut: 'lampe', ok: 'cabine', sortie: ['ar-vag', 'ar-vag', 'agri-kerlann', 'ar-vag'],
    cases: { P4: 'AV1', P3: 'AV2', P2: 'AK1', P1: 'AV3' }, prep: { palettes: '4', clients: '2', 'palettes-ar-vag': '3' }, sacs: '40',
    rapp: { 'recues-ar-vag': '3', 'resultat-ar-vag': 'trop', 'recues-agri-kerlann': '1', 'resultat-agri-kerlann': 'conforme' },
    ecart: 'Ar Vag : 1 palette de plus que l’annonce.', recu: '4 palettes : 3 Ar Vag, 1 Agri-Kerlann, triées en zone de réception.',
    question: 'Ar Vag a annoncé 2 palettes, on en reçoit 3. Que fais-tu ?', merci: 'Merci, je préviens Ar Vag.' },
};
const GROUPES = ['Préparer la réception', 'Accueillir Loïc', 'Avant de décharger', 'Trier par client', 'Rapprocher', 'Rendre compte', 'Les questions'];
const JALONS = ['preparer-palettes', 'preparer-clients', 'preparer-palettes-ar-vag', 'accueil-feuille', 'accueil-regles', 'securite-defaut', 'securite-aucun-faux',
  'depose-P1', 'depose-P2', 'depose-P3', 'depose-P4', 'rapprocher-recues-ar-vag', 'rapprocher-resultat-ar-vag', 'rapprocher-recues-agri-kerlann',
  'rapprocher-resultat-agri-kerlann', 'cr-ecart', 'cr-salutation', 'cr-fin'];
const POIDS = [2 / 3, 2 / 3, 2 / 3, 1, 1, 2.5, 1, 1, 1, 1, 1, 0.75, 0.75, 0.75, 0.75, 1, 0.25, 0.25];
const JOURS = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus)\b/i;

// Le menu ne se redessine qu'au changement d'écran : comme l'élève, on passe par la Messagerie.
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const confirmer = async () => { await pause(60); if (await present('[data-confirme-oui]')) { await clic('[data-confirme-oui]'); await pause(); } };
const panneau = () => pg.$eval(`${Z} [data-q-panneau]`, (e) => e.dataset.qPanneau).catch(() => null);
const textePanneau = () => pg.$eval(`${Z} [data-q-panneau]`, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => '');
// Les cartes des messages arrivés (en haut à droite) : fermées, comme le ferait l'élève (déployées, elles couvrent le haut du panneau des questions).
const fermerCartes = async () => { for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(`${Z} [data-carte-fermer]`); await pause(40); } };
// Répond aux questions au fil ouvertes ; `vus` reçoit leurs ids, dans l'ordre ; `textes` leur énoncé tel que l'élève le lit.
async function qrep(R = Q_JUSTES, vus = null, textes = null) {
  for (let i = 0; i < 5; i++) {
    const q = await panneau();
    if (!q) return;
    await fermerCartes();
    if (vus) vus.push(q);
    if (textes) textes[q] = await textePanneau();
    await qFil({ [q]: R[q] });
  }
}
// ① Préparer la réception.
async function preparer(vals, Q = Q_JUSTES, vus = null) {
  await allerV('fiche');
  for (const [c, x] of Object.entries(vals)) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, x); await pause(30); await qrep(Q, vus); }
  await clic('[data-fiche-envoyer]'); await confirmer(); await qrep(Q, vus);
}
// ② Accueillir Loïc : `rep` donne la première réponse de chaque réplique ; une maladroite est suivie de la juste.
const dire = async (val) => { await clic(`[data-dlg-choix="${val}"]`); await pause(); };
async function accueil(rep = DIAL, Q = Q_JUSTES, vus = null) {
  await allerV('telephone');
  await clic(`[data-dlg-appeler="${DID}"]`); await pause();
  for (const r of ['feuille', 'regles']) { await dire(rep[r]); if (rep[r] !== DIAL[r]) await dire(DIAL[r]); }
  await clic('[data-dlg-raccrocher]'); await pause();
  await qrep(Q, vus);
}
// ③ Le quai A : l'inspection (`envois` : les objets marqués à chaque « Signaler »), « C'est bon », puis la dépose (`depose` : pour chaque palette, la liste des
// cases cliquées ; la dernière doit poser). `K` = le camion (ses cases, son défaut).
async function quai(K, o = {}) {
  const Q = o.q || Q_JUSTES;
  await allerV('quai');
  await pg.waitForSelector(QA.SVG);
  for (const ids of (o.envois || [[K.defaut]])) { for (const id of ids) await QA.marquer(id); await QA.signaler(); await qrep(Q, o.vus, o.textes); }
  if (o.avant) await o.avant();
  await QA.cestBon(); await qrep(Q, o.vus, o.textes);
  if (o.apresBon) await o.apresBon();
  await QA.decharger();
  for (const pal of SORTIE) {
    const L = (o.depose && o.depose[pal]) || [K.cases[pal]];
    for (const c of L) {
      if (o.pendant) await o.pendant(pal, c);
      const n = await QA.posees();
      await QA.deposer(c);
      if (c !== L[L.length - 1]) vrai((await QA.posees()) === n, `${pal} : la case ${c} n’aurait pas dû poser la palette`);
      await qrep(Q, o.vus, o.textes);
    }
  }
  await pause(); await qrep(Q, o.vus, o.textes);
}
// ④ Rapprocher (la fiche arrive avec le message d'Erwan).
async function rapprocher(vals, Q = Q_JUSTES, vus = null, textes = null) {
  await P.ouvrirParMessage('Les palettes sont triées', `fiche:${FR}`);
  for (const [c, x] of Object.entries(vals)) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, x); await pause(30); await qrep(Q, vus, textes); }
  await clic('[data-fiche-envoyer]'); await confirmer(); await qrep(Q, vus, textes);
}
// ⑤ Rendre compte à Maëlys (phrases à choisir).
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
const crJuste = (K) => ({ salutation: SALUT, ecart: K.ecart, fin: FIN });
async function parcours(K, o = {}) {
  const Q = o.q || Q_JUSTES;
  await preparer(o.prep || K.prep, Q, o.vus);
  await accueil(o.dial, Q, o.vus);
  await quai(K, { ...o, q: Q });
  await rapprocher(o.rapp || K.rapp, Q, o.vus, o.textes);
  await compteRendu(o.cr || crJuste(K), Q, o.vus);
}
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { fin: b.dataset.fin, lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]),
    corriger: !!b.querySelector('[data-fin-corriger]'), fige: !!b.querySelector('[data-fin-fige]'), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});
const detail = () => pg.$$eval(`${Z} [data-fin-case]`, (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.textContent.replace(/\s+/g, ' ').trim()]));

// ─────────────────────────────────────────────────────────── la déclaration, le registre et le jeu figé
await v('ENT-10.6 : la séance se charge (CAP, CAP-C1.3, entraînement, correction, bilan détaillé, parcours après ENT-10.5) ; poids 16 + part 4 = 20 par jalon écrit à la main ; au registre sous l’entreprise n° 10 ; fermée aux élèves tant que l’enseignant ne l’a pas cochée', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/pelleau-ramasse-du-mercredi.js');
    const S = await import('/contenus/pelleau-ent106.js');
    const Q = await import('/contenus/questions/ENT-10.6.js');
    const I = await import('/activites/index.js');
    const N = await import('/core/niveaux.js');
    const socle = S.ETAPES.filter((e) => !e.bonus);
    const charges = await I.chargerActivites();
    const m = A.meta;
    return { meta: m, ids: socle.map((e) => e.id), poids: socle.map((e) => e.poids), somme: socle.reduce((t, e) => t + e.poids, 0),
      part: Q.QUESTIONS.part, notees: Q.QUESTIONS.liste.filter((q) => q.type === 'fil').map((q) => [q.id, q.de, q.poids, !!q.reflexion, q.apres || 'tout de suite', q.quand.gestes || null]),
      groupes: [...new Set(socle.map((e) => e.groupe))], sansEcran: socle.filter((e) => !e.ecran).map((e) => e.id),
      bonus: S.ETAPES.filter((e) => e.bonus).map((e) => [e.id, e.poids, e.groupe]),
      auRegistre: charges.some((a) => a.meta.id === ID), echecs: (I.activitesEnEchec ? I.activitesEnEchec() : []).map((e) => e.fichier || String(e)).filter((f) => /pelleau/.test(f)),
      entreprise: (I.ENTREPRISES.find((e) => e.n === 10) || {}).nom,
      cap: N.activiteVisible(m, { niveau: 'cap' }), coche: N.activiteVisible(m, { niveau: 'cap', ouverts: { [ID]: true } }), autre: N.activiteVisible(m, { niveau: '1re', ouverts: {} }) };
  }, ID);
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.parcours, m.correction, m.bilanDetail, m.precedente, m.niveauxPrevus,
    m.questions, m.pret, m.ouverture, m.corrige, m.rubrique],
  ['ENT-10.6', ['cap'], [], ['CAP-C1.3'], 'entrainement', 20, true, true, true, 'pelleau-camion-de-ramasse', ['confirme'], 'ENT-10.6', true, 'prof',
    './contenus/corriges/ENT-10.6.js', 'simulog'], 'meta');
  egal(r.ids, JALONS, 'jalons du socle');
  egal(r.poids, POIDS, 'poids jalon par jalon (écrits à la main)');
  proche(r.somme + r.part, 20, 'somme des jalons et de la part des questions');
  egal(r.groupes, GROUPES.slice(0, 6), 'lignes du bandeau (hors questions)');
  egal(r.sansEcran, ['accueil-feuille', 'accueil-regles', 'securite-defaut', 'securite-aucun-faux', 'depose-P1', 'depose-P2', 'depose-P3', 'depose-P4'],
    'ni le dialogue ni le quai ne se rouvrent');
  egal(r.notees, [['pourquoi-cale', 'yann', 1.5, false, 'bilan', ['scene:pelleau-quai-106:signaler']],
    ['ecart-qui-dit', 'erwan', 1, false, 'tout de suite', ['fiche:rapprocher-106:recues-ar-vag']],
    ['rendre-meme-2', 'erwan', 1.5, false, 'tout de suite', ['quai:pelleau-quai-106:dechargement']]], 'questions au fil');
  egal(r.bonus, [['bonus-sacs-agri-kerlann', undefined, undefined]], 'cas bonus sans poids ni groupe');
  egal([r.auRegistre, r.echecs, r.entreprise], [true, [], 'Transports Pelleau'], 'au registre, sans échec');
  egal([r.cap, r.coche, r.autre], [false, true, false], 'fermée, puis ouverte par l’enseignant ; jamais hors CAP');
});

await v('ENT-10.6 : jeu figé — le camion de t106-2, t106-21 et t106-6 est celui écrit à la main (la formule du tirage ne change pas sous les élèves) ; son quai : 8 cases, un défaut et un point en ordre, 2 objets différents', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent106-donnees.js');
    return ['t106-2', 't106-21', 't106-6'].map((g) => {
      const j = D.jeuDe(g), q = D.quaiDe(g);
      return { j, cases: q.depose.cases.map((c) => c.id), points: q.securite.points.map((p) => [p.id, p.ok, p.etat]), palettes: q.camions[0].palettes.map((p) => [p.id, p.client]) };
    });
  });
  egal(r.map((x) => [x.j.repartition, x.j.sortie, x.j.defaut, x.j.ok, x.j.ecart, x.j.clientEcart]), [
    ['2+2', CAMIONS.aucun.sortie, 'cale', 'lampe', 'aucun', null],
    ['3+1', CAMIONS.moins.sortie, 'cabine', 'lampe', 'moins', 'ar-vag'],
    ['3+1', CAMIONS.plus.sortie, 'lampe', 'cabine', 'plus', 'ar-vag']], 'jeu de chaque graine');
  egal(r[0].cases, ['allee-1', 'AV1', 'AV2', 'AV3', 'AK1', 'AK2', 'AK3', 'quaiB-1'], '8 cases');
  egal(r[0].points, [['cale', false, 'absente'], ['lampe', true, 'allumee']], 'points de t106-2 (cale absente, lampe en ordre)');
  egal(r[1].points, [['cabine', false, 'conduite'], ['lampe', true, 'allumee']], 'points de t106-21 (Loïc au volant)');
  egal(r[2].points, [['cabine', true, 'vide'], ['lampe', false, 'eteinte']], 'points de t106-6 (lampe éteinte)');
  egal(r[2].palettes, [['P1', 'ar-vag'], ['P2', 'agri-kerlann'], ['P3', 'ar-vag'], ['P4', 'ar-vag']], 'palettes de t106-6 dans le camion (elles sortent P4, P3, P2, P1)');
});

await v('ENT-10.6 : tirage sur 300 graines — répartition et écart équilibrés, jamais un écart double, cases suffisantes par client (verifierQuai, à trois niveaux), zéro jeu de secours, défauts uniformes, ordres variés sans les blocs d’ENT-10.5, aucune annonce à zéro', async () => {
  const r = await pg.evaluate(async () => {
    const Q = await import('/core/types/quai.js');
    const D = await import('/contenus/pelleau-ent106-donnees.js');
    const c = { rep: {}, ecart: {}, defaut: {}, ok: {}, secours: 0, ordres: new Set(), quai: [], doubles: 0, zero: 0, blocs: 0, memeObjet: 0, plusSurUn: 0, majo: {}, moinsSur: {} };
    const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}`, j = D.jeuDe(g);
      inc(c.rep, j.repartition); inc(c.ecart, j.ecart); inc(c.defaut, j.defaut); inc(c.ok, j.ok);
      if (D.jeuDeSecours(g)) c.secours++;
      c.ordres.add(j.sortie.join(','));
      const n = D.comptesDe(j), a = D.annoncesDe(j);
      if (D.CLIENTS_106.filter((x) => a[x] !== n[x]).length > 1) c.doubles++;
      if (D.CLIENTS_106.some((x) => a[x] < 1)) c.zero++;
      if (j.defaut === j.ok) c.memeObjet++;
      if (j.ecart === 'plus' && n[j.clientEcart] < 2) c.plusSurUn++;
      if (j.sortie.slice(0, 2).every((x) => x === 'ar-vag') && j.sortie.slice(2).every((x) => x === 'agri-kerlann') && j.repartition === '2+2') c.blocs++;
      if (j.ecart === 'moins') inc(c.moinsSur, n[j.clientEcart]);
      for (const niveau of ['standard', 'confirme', 'accompagne']) {
        const e = Q.verifierQuai(D.quaiDe(g, { niveau }));
        if (e.length) c.quai.push([g, niveau, e]);
      }
    }
    return { ...c, ordres: c.ordres.size };
  });
  egal(r.quai, [], 'verifierQuai sur 300 graines × 3 niveaux');
  egal([r.secours, r.doubles, r.zero, r.memeObjet, r.plusSurUn, r.blocs], [0, 0, 0, 0, 0, 0], 'secours, écarts doubles, annonces à zéro, défaut = point en ordre, « en trop » sur une seule palette, blocs d’ENT-10.5');
  vrai(r.rep['2+2'] >= 110 && r.rep['3+1'] >= 110, 'répartition déséquilibrée : ' + JSON.stringify(r.rep));
  vrai(['aucun', 'moins', 'plus'].every((e) => r.ecart[e] >= 70 && r.ecart[e] <= 130), 'écart déséquilibré (un tiers chacun attendu) : ' + JSON.stringify(r.ecart));
  vrai(['cabine', 'cale', 'niveleur', 'lampe'].every((d) => r.defaut[d] >= 45 && r.defaut[d] <= 105 && r.ok[d] >= 45), 'défauts déséquilibrés : ' + JSON.stringify([r.defaut, r.ok]));
  vrai(r.ordres >= 9, 'ordres de sortie trop peu variés : ' + r.ordres);
  vrai(r.moinsSur[1] > 0 && r.moinsSur[2] > 0 && r.moinsSur[3] > 0, 'un « il en manque » sur un client de 1, 2 et 3 palettes : ' + JSON.stringify(r.moinsSur));
});

// ─────────────────────────────────────────────────────────── le contenu (hors écran)
await v('ENT-10.6 : contenu — feuille de ramasse, annonces, phrases et résultats se CALCULENT du camion de chacun (3 graines à la main) ; aucun total sur la feuille ; aucun jour de la semaine, pied imposé sur chaque document ; l’écart se lit sur la feuille (« moins ») ou dans l’annonce (« plus »)', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent106-donnees.js');
    const C = await import('/contenus/pelleau-ent106.js');
    const U = await import('/contenus/pelleau.js');
    const lire = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d; };
    const txt = (html) => lire(html).textContent.replace(/\s+/g, ' ');
    const sortie = {};
    for (const [nom, g] of [['aucun', 't106-2'], ['moins', 't106-21'], ['plus', 't106-6']]) {
      const db = { tirage: { graine: g } }, jeu = D.jeuDe(g);
      sortie[nom] = {
        lignes: [...lire(C.DOC_FEUILLE.html(db)).querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((td) => td.textContent.trim())),
        annonces: C.DOCS_ANNONCES.map((d) => txt(d.html(db))),
        resultats: D.CLIENTS_106.map((c) => D.resultat(jeu, c)), recu: D.ligneRecu(jeu), ecart: D.choixEcart(jeu).map((x) => x.texte),
        arret: D.quaiDe(g).arret.texte, preparer: D.LIGNES_PREPARER.map((l) => l.juste(jeu)), sacs: D.LIGNE_BONUS.juste(jeu),
      };
    }
    const db0 = { tirage: { graine: 't106-6' } };
    const docs = C.DOCUMENTS.map((d) => [d.id, txt(typeof d.html === 'function' ? d.html(db0) : d.html)]);
    return { sortie, docs, pied: U.PIED };
  });
  egal(r.sortie.aucun.lignes, [['Biscuiterie Ar Vag', '2', '80 cartons', '', 'signé'], ['Agri-Kerlann', '2', '80 sacs', '', 'signé']], 'feuille : aucun écart');
  egal(r.sortie.moins.lignes, [['Biscuiterie Ar Vag', '1', '40 cartons', '2e palette pas prête', 'signé'], ['Agri-Kerlann', '3', '120 sacs', '', 'signé']], 'feuille : il en manque');
  egal(r.sortie.plus.lignes, [['Biscuiterie Ar Vag', '3', '120 cartons', '', 'signé'], ['Agri-Kerlann', '1', '40 sacs', '', 'signé']], 'feuille : en trop (rien sur la feuille)');
  vrai(/Nous vous confions ce jour 2 palettes de biscuits au beurre/.test(r.sortie.aucun.annonces[0]) && /\(80 cartons\)/.test(r.sortie.aucun.annonces[0]), 'annonce Ar Vag (aucun) : ' + r.sortie.aucun.annonces[0]);
  vrai(/Nous vous confions ce jour 2 palettes de biscuits/.test(r.sortie.moins.annonces[0]) && /Nous vous confions ce jour 3 palettes de terreau/.test(r.sortie.moins.annonces[1]), 'annonces (il en manque)');
  vrai(/Nous vous confions ce jour 2 palettes de biscuits au beurre/.test(r.sortie.plus.annonces[0]) && /\(80 cartons\)/.test(r.sortie.plus.annonces[0]) && /ce jour 1 palette de terreau/.test(r.sortie.plus.annonces[1]),
    'annonces (en trop : 2 annoncées, 3 reçues) : ' + r.sortie.plus.annonces[0]);
  egal(r.sortie.aucun.resultats, ['conforme', 'conforme'], 'résultats (aucun)');
  egal(r.sortie.moins.resultats, ['manque', 'conforme'], 'résultats (il en manque)');
  egal(r.sortie.plus.resultats, ['trop', 'conforme'], 'résultats (en trop)');
  egal([r.sortie.aucun.recu, r.sortie.moins.recu, r.sortie.plus.recu], [CAMIONS.aucun.recu, CAMIONS.moins.recu, CAMIONS.plus.recu], 'ligne « reçu » imposée');
  egal(r.sortie.aucun.ecart[0], 'Tout est conforme aux annonces.', 'phrase juste (aucun)');
  egal(r.sortie.moins.ecart[0], 'Ar Vag : 1 palette de moins que l’annonce, pas prête à la ramasse.', 'phrase juste (il en manque)');
  egal(r.sortie.plus.ecart[0], 'Ar Vag : 1 palette de plus que l’annonce.', 'phrase juste (en trop)');
  for (const k of ['aucun', 'moins', 'plus']) vrai(new Set(r.sortie[k].ecart).size === 4, `quatre phrases distinctes (${k}) : ` + r.sortie[k].ecart);
  egal([r.sortie.aucun.arret, r.sortie.plus.arret], ['Les 4 palettes sont triées par client. Le contrôle des colis, ce sera la semaine prochaine.', 'Les 4 palettes sont triées par client. Le contrôle des colis, ce sera la semaine prochaine.'], 'texte de l’arrêt');
  egal([r.sortie.aucun.preparer, r.sortie.moins.preparer, r.sortie.plus.preparer], [['4', '2', '2'], ['4', '2', '1'], ['4', '2', '3']], 'réponses de « Préparer » lues sur SA feuille');
  egal([r.sortie.aucun.sacs, r.sortie.moins.sacs, r.sortie.plus.sacs], ['80', '120', '40'], 'sacs Agri-Kerlann (ligne du confirmé)');
  egal(r.docs.filter(([, t]) => JOURS.test(t)).map(([id]) => id), [], 'un jour de la semaine dans un document');
  egal(r.docs.filter(([id, t]) => id !== 'droit-depot' && !t.includes(r.pied.split('.')[0])).map(([id]) => id), [], 'pied « Document pédagogique » manquant');
  for (const k of ['aucun', 'moins', 'plus']) vrai(!/\btotal\b/i.test(r.sortie[k].lignes.flat().join(' ')), `la feuille donne un total (${k})`);
});

// ─────────────────────────────────────────────────────────── l'ouverture
await v('ENT-10.6 : à l’ouverture — un seul message de Maëlys, daté du 13 mai 2026 à 7 h, sans jour de la semaine, feuille + annonces + règles jointes ; « Au quai » et le quai fermés ; la fiche « Préparer » a ses 3 lignes, sans rien qui trahisse la réponse', async () => {
  await monter({ uid: CAMIONS.aucun.uid });
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces, m.ouvreFiche]),
    [['Maëlys', 'La ramasse de Loïc', ['feuille-ramasse-106', 'annonce-ar-vag-106', 'annonce-agri-kerlann-106', 'regles-quai-106'], FP]], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()], [2026, 4, 13, 7], 'date du message');
  vrai(!JOURS.test(E[0].text + E[0].subject), 'un jour de la semaine dans le message');
  vrai(/Je te joins aussi les règles du quai/.test(E[0].text), 'le standard reçoit les règles : ' + E[0].text);
  const M = await menu();
  vrai(M.includes('fermee:telephone') && M.includes('fermee:quai') && !M.includes(`fiche:${FR}`), 'menu au départ : ' + M.join(', '));
  await capture('1-accueil');
  await allerV('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.map((x) => [x.dataset.ficheChamp, x.closest('.champ').querySelector('label').textContent.trim()])),
    [['palettes', 'Combien de palettes arrivent ?'], ['clients', 'Pour combien de clients ?'], ['palettes-ar-vag', 'Combien de palettes Ar Vag ?']], 'lignes de la fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-doc]`, (L) => L.map((x) => x.dataset.ficheDoc)), ['feuille-ramasse-106', 'annonce-ar-vag-106', 'annonce-agri-kerlann-106', 'regles-quai-106'], 'documents à gauche');
  vrai(!/\btotal\b/i.test(await pg.textContent(`${Z} [data-fiche-panneau]`)), 'la feuille de ramasse donne un total');
});

await v('ENT-10.6 : inaction — rien fait → 0/20, aucun jalon juste (même chez un élève dont le camion est « conforme »), pas de bandeau de fin', async () => {
  for (const k of ['aucun', 'moins']) {
    await monter({ uid: CAMIONS[k].uid });
    const n = await note();
    egal([n.score, n.max], [0, 20], 'note ' + k);
    vrai(!Object.values(n.detail).includes('ok'), 'un jalon juste sans rien faire : ' + JSON.stringify(n.detail));
    vrai(!(await present('[data-fin-jalon]')), 'bandeau de fin');
  }
});

// ─────────────────────────────────────────────────────────── les jalons sans écran (bases fabriquées)
// `d.graine` : l'élève ; `d.prep`, `d.rapp` : fiches envoyées ; `d.dial` : premières réponses de l'appel fini ; `d.sec` : l'inspection figée ; `d.depose` :
// { palette: premier choix } (posées ensuite dans la case juste de `K.cases`) ; `d.cr` : { ligne: rang choisi } de la réponse par phrases.
const jalonsSans = (d) => pg.evaluate(async ({ d, QID, DID, FP, FR }) => {
  const S = await import('/contenus/pelleau-ent106.js');
  const db = { fiches: {}, quais: {}, mails: [], tirage: { graine: d.graine } };
  if (d.aisance) db.aisance = d.aisance;
  if (d.prep) db.fiches[FP] = { valeurs: d.prep, envoye: { at: 1 } };
  if (d.rapp) db.fiches[FR] = { valeurs: d.rapp, envoye: { at: 1 } };
  if (d.dial) db.dialogues = { 'pelleau-ramasse-du-mercredi': { [DID]: { appels: [{ debut: 1, fin: 2, pas: Object.entries(d.dial).map(([r, v], i) => ({ r, v, at: i })), reprises: 0 }] } } };
  if (d.sec || d.depose) {
    const q = db.quais[QID] = { depose: {} };
    if (d.sec) q.securite = { mode: 'scene', marques: [], compteur: 0, ouverte: true, arrete: false, chef: '', signaux: d.sec.signaux || [], fait: d.sec.fait !== false };
    if (d.depose) {
      for (const [p, c] of Object.entries(d.depose)) q.depose[p] = { premier: c, essais: c === d.cases[p] ? [c] : [c, d.cases[p]], pose: d.cases[p] };
      q.dechargeFini = d.finDecharge !== false;
    }
  }
  if (d.cr) {
    const P = S.phrasesCompteRendu('Lea', db);
    db.mails.push({ id: 1, folder: 'in', ts: 1, phrases: { id: P.id, lignes: P.lignes.map((l) => (l.texte ? l : { ...l, ordre: l.choix.map((_, i) => i) })) } });
    db.mails.push({ id: 2, folder: 'out', ts: 2, phrases: { id: P.id, choix: d.cr } });
  }
  return Object.fromEntries(S.ETAPES.map((e) => [e.id, (e.verifier(db) || { status: 'null' }).status]));
}, { d, QID, DID, FP, FR });
const juste = (K) => ({ graine: K.uid, cases: K.cases, prep: K.prep, dial: DIAL, depose: { P4: K.cases.P4, P3: K.cases.P3, P2: K.cases.P2, P1: K.cases.P1 }, rapp: K.rapp,
  sec: { signaux: [{ points: [K.defaut], rien: 0, marques: [1], apresArret: false }] }, cr: { salutation: 0, ecart: 0, fin: 0 } });

await v('ENT-10.6 : jalons sans écran — rien : tout « à faire » ; juste : tout ✓ (trois camions) ; chaque faute ne fait tomber que SON jalon ; « aucun faux » faux quand rien n’est signalé ou quand le point en ordre l’est aussi ; une palette posée chez l’autre client = SA palette fausse', async () => {
  for (const k of ['aucun', 'moins', 'plus']) {
    const K = CAMIONS[k];
    const vide = await jalonsSans({ graine: K.uid });
    egal(JALONS.map((j) => vide[j]), JALONS.map(() => 'attente'), 'rien fait ' + k);
    egal(vide['bonus-sacs-agri-kerlann'], 'null', 'standard : pas de cas bonus');
    const s = await jalonsSans(juste(K));
    egal(JALONS.filter((j) => s[j] !== 'ok'), [], 'parcours juste ' + k);
  }
  const K = CAMIONS.moins;
  const ko = async (f) => { const d = JSON.parse(JSON.stringify(juste(K))); f(d); const x = await jalonsSans(d); return JALONS.filter((j) => x[j] !== 'ok'); };
  egal(await ko((d) => { d.prep.palettes = '5'; }), ['preparer-palettes'], '5 palettes (le total des annonces : 2 + 3)');
  egal(await ko((d) => { d.prep['palettes-ar-vag'] = '2'; }), ['preparer-palettes-ar-vag'], '2 palettes Ar Vag (l’annonce, pas la feuille)');
  egal(await ko((d) => { d.dial.regles = 'volant'; }), ['accueil-regles'], 'Loïc laissé au volant');
  egal(await ko((d) => { d.dial.feuille = 'magasin'; d.dial.regles = 'aider'; }), ['accueil-feuille', 'accueil-regles'], 'deux répliques');
  egal(await ko((d) => { d.sec.signaux = []; }), ['securite-defaut', 'securite-aucun-faux'], 'rien signalé, inspection figée (pas d’arrêt en entraînement)');
  egal(await ko((d) => { d.sec.signaux = [{ points: ['cabine', 'lampe'], rien: 0, apresArret: false }]; }), ['securite-aucun-faux'], 'la lampe (en ordre) signalée aussi');
  egal(await ko((d) => { d.sec.signaux = [{ points: ['lampe'], rien: 0, apresArret: false }]; }), ['securite-defaut', 'securite-aucun-faux'], 'seulement le point en ordre signalé');
  egal(await ko((d) => { d.depose.P4 = 'AV1'; }), ['depose-P4'], 'P4 (Agri-Kerlann) dans la zone d’Ar Vag au premier choix');
  egal(await ko((d) => { d.depose.P2 = 'AK1'; d.depose.P3 = 'allee-1'; }), ['depose-P2', 'depose-P3'], 'P2 (Ar Vag) chez Agri-Kerlann, P3 sur l’allée');
  egal(await ko((d) => { d.rapp['resultat-ar-vag'] = 'conforme'; }), ['rapprocher-resultat-ar-vag'], 'Ar Vag « conforme »');
  egal(await ko((d) => { d.rapp['recues-ar-vag'] = '2'; }), ['rapprocher-recues-ar-vag'], 'Ar Vag : 2 reçues (l’annonce)');
  egal(await ko((d) => { d.cr.ecart = 2; }), ['cr-ecart'], 'écart « tout est conforme »');
  egal(await ko((d) => { d.cr.salutation = 1; d.cr.fin = 1; }), ['cr-salutation', 'cr-fin'], 'la forme');
  const enCours = await jalonsSans({ ...juste(K), sec: { ...juste(K).sec, fait: false }, finDecharge: false });
  egal([enCours['securite-defaut'], enCours['securite-aucun-faux'], enCours['depose-P1']], ['attente', 'attente', 'attente'], 'inspection non figée, déchargement pas fini');
  const c = await jalonsSans({ ...juste(K), aisance: 'confirme', prep: { ...K.prep, 'sacs-agri-kerlann': K.sacs } });
  egal([c['bonus-sacs-agri-kerlann'], (await jalonsSans({ ...juste(K), aisance: 'confirme', prep: { ...K.prep, 'sacs-agri-kerlann': '80' } }))['bonus-sacs-agri-kerlann']], ['ok', 'ko'], 'bonus du confirmé');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
async function parcoursJuste(k, avecOuverture, captures) {
  const K = CAMIONS[k];
  await monter({ uid: K.uid, sansOuverture: !!avecOuverture });
  if (avecOuverture) {
    const ov = (await base()).questions[ID]['@tirage'].ids;
    egal([ov.length, ov.filter((id) => /^img-/.test(id)).length], [4, 1], 'questions d’ouverture tirées : 3 + 1 image');
    for (let i = 0; i < 4; i++) {
      await clic(`[data-ouv-aller="${i}"]`); await pause();
      if (i === 0 && captures) await capture('0-avant-de-commencer');
      await clic(`[data-q-choix="${OUV[ov[i]]}"][data-q="${ov[i]}"]`);
      await clic(`[data-q-repondre="${ov[i]}"]`); await pause();
    }
    await clic('[data-ouv-continuer]'); await pause();
  }
  const vus = [], textes = {};
  await preparer(K.prep, Q_JUSTES, vus);
  await accueil(DIAL, Q_JUSTES, vus);
  egal(vus, [], 'aucune question avant le quai');
  const legendes = [];
  let legArrivee = '';
  await quai(K, { vus, textes, apresBon: async () => { legArrivee = await QA.legende(); if (captures) await capture('2-quai-feuille-de-ramasse'); }, pendant: async (pal) => {
    const l = await QA.legende();
    if (!legendes.some((x) => x[0] === pal)) legendes.push([pal, l]);
    if (captures && pal === 'P3' && !legendes.capt) { legendes.capt = true; await pg.$eval(`${Z} [data-q-leg]`, (x) => x.scrollIntoView({ block: 'end' })); await capture('3-quai-choix-etiquette'); }
  } });
  egal(legArrivee, '07:30 — Loïc te remet la feuille de ramasse.', `la légende d’arrivée (${k}) : collègue tutoyé, article féminin, prénom`);
  egal(legendes.map(([p]) => p), SORTIE, 'une pause par palette');
  vrai(!/vous pouvez|le feuille de ramasse|Le chauffeur/.test(await texte()), 'un « vous pouvez », « le feuille » ou « le chauffeur » à l’écran');
  const etiq = (c) => (c === 'ar-vag' ? 'Biscuiterie Ar Vag' : 'Agri-Kerlann');
  SORTIE.forEach((p, i) => vrai(new RegExp(`Yann attend avec la palette ${p} — étiquette : « Expéditeur : ${etiq(K.sortie[i])} » \\(${i + 1} sur 4\\)\\. Où la pose-t-il \\?`).test(legendes[i][1]),
    `légende de ${p} : ` + legendes[i][1]));
  vrai(legendes.every(([, l]) => !/zone/i.test(l)), 'la légende parle de zone');
  egal(vus, ['pourquoi-cale', 'rendre-meme-2'], `A au premier signalement, C à la dernière palette (${k})`);
  vrai(/Les 4 palettes sont triées par client\./.test(await texte()), 'bandeau de fin du quai');
  await rapprocher(K.rapp, Q_JUSTES, vus, textes);
  egal(vus, ['pourquoi-cale', 'rendre-meme-2', 'ecart-qui-dit'], `B au premier choix de « Rapprocher » (${k})`);
  egal(textes['ecart-qui-dit'].includes(K.question), true, `énoncé de B selon l’écart (${k}) : ` + textes['ecart-qui-dit']);
  await compteRendu(crJuste(K), Q_JUSTES, vus);
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), [], 'jalons');
  egal(['question:pourquoi-cale', 'question:ecart-qui-dit', 'question:rendre-meme-2'].map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
  proche(n.score, 20, `note (${k})`);
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  egal(b.fin, 'ok', 'tout juste');
  if (captures) { await pg.$eval(`${Z} [data-fin-seance]`, (x) => x.scrollIntoView({ block: 'start' })); await capture('5-bilan'); }
  const E = await entrants();
  egal(E.map((x) => [x.from, x.subject]), [['Maëlys', 'La ramasse de Loïc'], ['Erwan', 'Loïc arrive'], ['Erwan', 'Yann est prêt'], ['Erwan', 'Les palettes sont triées'],
    ['Maëlys', 'Alors, la ramasse ?'], ['Maëlys', 'RE : Alors, la ramasse ?']], 'les messages, dans l’ordre');
  egal(E[5].text.split('\n')[0], K.merci, 'Maëlys reprend l’écart écrit');
  egal(E.filter((x) => JOURS.test(x.text + x.subject)).map((x) => x.subject), [], 'un jour de la semaine dans un message');
  egal(E.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'un message dit juste / faux / erreur / bonus');
  const ts = E.map((x) => x.ts);
  vrai(ts.every((t, i) => !i || t >= ts[i - 1]), 'heures croissantes');
  vrai(!!((await base()).points && (await base()).points[ID]), 'photo de fin rangée (ENT-10.7 s’ouvrirait)');
  egal(P.erreurs, [], 'erreurs JavaScript');
}
await v('ENT-10.6 : parcours juste à l’écran, camion SANS écart (t106-2, 2+2, cale absente) — 20/20, bandeau 7 lignes ✓ ; A au premier signalement (corrigée au bilan), C à la dernière palette, B au premier choix de « Rapprocher » (« imagine ») ; la légende cite l’étiquette, jamais la zone ; messages dans l’ordre, sans jour de la semaine', async () => {
  await parcoursJuste('aucun', true, true);
});
await v('ENT-10.6 : parcours juste à l’écran, « il en manque » (t106-21, 3+1, Loïc au volant) — 20/20 ; la question B dit « Ar Vag a annoncé 2 palettes, on en reçoit 1 » ; Maëlys « je préviens Ar Vag »', async () => {
  await parcoursJuste('moins', false, false);
});
await v('ENT-10.6 : parcours juste à l’écran, « il y en a trop » (t106-6, 3+1, lampe éteinte) — 20/20 ; la question B dit « Ar Vag a annoncé 2 palettes, on en reçoit 3 » ; Ar Vag a trois cases, la troisième est la bonne pour P1', async () => {
  await parcoursJuste('plus', false, false);
});

await v('ENT-10.6 : pire cas — tout faux (maladroit à chaque réplique, « C’est bon » sans rien signaler puis le point en ordre à tort, chaque palette d’abord chez l’autre client, rapprochement et phrases faux) → premier bilan, 7 lignes ✗, « Corriger » proposé, `finFige` ; aucun arrêt de Yann', async () => {
  const K = CAMIONS.moins;
  await monter({ uid: K.uid });
  const autre = { P4: 'AV1', P3: 'AV2', P2: 'AK3', P1: 'AV3' };   // P4, P3, P1 sont Agri-Kerlann (essayées en AV), P2 est Ar Vag (essayée en AK3, libre : AK1 et AK2 sont prises)
  let arret = null;
  await parcours(K, { q: Q_FAUSSES, prep: { palettes: '5', clients: '3', 'palettes-ar-vag': '2' }, dial: DIAL_FAUX,
    envois: [['lampe']],
    apresBon: async () => { arret = await present('[data-q-secu-arret]'); },
    depose: Object.fromEntries(SORTIE.map((p) => [p, [autre[p], K.cases[p]]])),
    rapp: { 'recues-ar-vag': '2', 'resultat-ar-vag': 'conforme', 'recues-agri-kerlann': '2', 'resultat-agri-kerlann': 'trop' },
    cr: { salutation: 'Yo !', ecart: 'Tout est conforme aux annonces.', fin: 'Bisous' } });
  egal(arret, false, 'Yann n’arrête pas l’élève (entraînement)');
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ko'), [], 'tous les jalons faux');
  egal(['question:pourquoi-cale', 'question:ecart-qui-dit', 'question:rendre-meme-2'].map((j) => n.detail[j]), ['ko', 'ko', 'ko'], 'questions fausses');
  proche(n.score, 0, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ko']), 'bandeau');
  vrai(b.corriger && b.fige, 'Corriger et la phrase du premier essai : ' + b.texte);
  vrai(/Le camion est déchargé : le quai ne se rejoue pas\./.test(b.texte), 'finFige');
  vrai(/Merci, je note : tout est conforme\./.test((await entrants()).slice(-1)[0].text), 'Maëlys reprend « tout est conforme » sans corriger');
});

await v('ENT-10.6 : Loïc au volant non signalé — « C’est bon » sans rien signaler : Yann n’arrête PAS (entraînement), le déchargement se poursuit ; seuls le défaut et « aucun faux signalement » sont ✗ ; tout le reste juste = 16,5 sur 20', async () => {
  const K = CAMIONS.moins;   // défaut = Loïc au volant, moteur allumé
  await monter({ uid: K.uid });
  let arret = null;
  await parcours(K, { envois: [], apresBon: async () => { arret = await present('[data-q-secu-arret]'); } });
  egal(arret, false, 'Yann n’arrête pas');
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['securite-defaut', 'securite-aucun-faux'], 'seuls le défaut et « aucun faux »');
  proche(n.score, 20 - 2.5 - 1, 'note');
  const b = await fin();
  egal(b.lignes.filter(([, x]) => x === 'ko').map(([g]) => g), ['Avant de décharger'], 'une seule ligne fausse');
});

await v('ENT-10.6 : faux signalement — le point en ordre signalé avec le défaut : défaut ✓, « aucun faux » ✗ ; la réponse de Yann est composée point par point (« Bien vu : … » / « Là, je ne vois rien qui cloche »)', async () => {
  const K = CAMIONS.aucun;   // défaut = cale absente, en ordre = lampe
  await monter({ uid: K.uid });
  await preparer(K.prep); await accueil();
  await allerV('quai'); await pg.waitForSelector(QA.SVG);
  vrai(/Avant que Yann entre dans le camion, regarde le quai et le camion\. Clique sur ce qui ne va pas/.test(await texte()), 'la consigne au-dessus de la scène (standard)');
  await QA.marquer('cale'); await QA.marquer('lampe'); await QA.signaler(); await qrep();
  const c = await QA.chef();
  vrai(/Bien vu : je pose la cale\./.test(c) && /Là, je ne vois rien qui cloche\./.test(c), 'la réponse de Yann : ' + c);
  await QA.cestBon(); await QA.decharger();
  for (const p of SORTIE) { await QA.deposer(K.cases[p]); await qrep(); }
  const n = await note();
  egal(['securite-defaut', 'securite-aucun-faux'].map((j) => n.detail[j]), ['ok', 'ko'], 'défaut signalé, point en ordre signalé à tort');
});

await v('ENT-10.6 : dépose par client — P4 (Agri-Kerlann) cliquée en AV1 : Yann réagit (« la zone de Biscuiterie Ar Vag »), AV1 n’est plus proposée pour P4 mais l’est pour P3 qui s’y pose ; seule P4 ✗, une ligne par palette au bilan détaillé', async () => {
  const K = CAMIONS.aucun;   // P4 Agri, P3 Ar Vag, P2 Ar Vag, P1 Agri
  await monter({ uid: K.uid });
  await preparer(K.prep); await accueil();
  let reaction = '', apresRefus = [], pourP3 = [];
  await quai(K, { depose: { P4: ['AV1', 'AK1'], P3: ['AV1'], P2: ['AV2'], P1: ['AK2'] }, pendant: async (pal, c) => {
    if (pal === 'P4' && c === 'AK1') { reaction = await QA.annonce(); apresRefus = await QA.proposees(); }
    if (pal === 'P3') pourP3 = await QA.proposees();
  } });
  vrai(/Yann : « Ça, c’est la zone de Biscuiterie Ar Vag\. Regarde l’étiquette\. »/.test(reaction), 'Yann réagit : ' + reaction);
  vrai(!apresRefus.includes('AV1') && apresRefus.includes('AV2') && apresRefus.includes('AV3') && apresRefus.includes('AK1'), 'AV1 grisée pour P4 seulement : ' + apresRefus);
  vrai(pourP3.includes('AV1'), 'AV1 proposée pour P3 : ' + pourP3);
  const e = (await base()).quais[QID].depose;
  egal([e.P4.premier, e.P4.essais, e.P4.pose, e.P3.pose], ['AV1', ['AV1', 'AK1'], 'AK1', 'AV1'], 'état de la dépose');
  await rapprocher(K.rapp); await compteRendu(crJuste(K));
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['depose-P4'], 'seule P4 fausse');
  proche(n.score, 19, 'note');
  const b = await fin();
  egal(b.lignes.filter(([, x]) => x === 'ko').map(([g]) => g), ['Trier par client'], 'une seule ligne fausse');
  const d = await detail();
  egal(d.filter(([id]) => /^depose-/.test(id)).map(([id, x, t]) => [id, x, /Trier par client : P\d, (Biscuiterie Ar Vag|Agri-Kerlann) : /.test(t)]),
    [['depose-P1', 'ok', true], ['depose-P2', 'ok', true], ['depose-P3', 'ok', true], ['depose-P4', 'ko', true]], 'une ligne par palette : ' + JSON.stringify(d.filter(([id]) => /^depose-/.test(id))));
  vrai(/P4, Agri-Kerlann : d’abord en AV1, posée ensuite en AK1/.test(d.find(([id]) => id === 'depose-P4')[2]), 'la ligne de P4');
});

await v('ENT-10.6 : dialogue — « Oui, reste au volant » : Loïc réagit, la réplique revient, l’entretien finit en DEUX tours ; seul ce jalon ✗ ; « Corriger » ne rouvre pas le dialogue', async () => {
  const K = CAMIONS.plus;
  await monter({ uid: K.uid });
  await preparer(K.prep);
  await allerV('telephone');
  vrai(/Erwan : « Loïc recule au quai A\. Va l’accueillir\. »/.test(await pg.textContent(`${Z} .dlg-repos`).catch(() => '')), 'la consigne d’Erwan en haut');
  egal(await pg.textContent(`${Z} [data-dlg-appeler="${DID}"]`), 'Aller le voir', 'face à face');
  await clic(`[data-dlg-appeler="${DID}"]`); await pause();
  await dire('feuille'); await dire('volant');
  vrai(/Erwan ne serait pas d’accord/.test(await pg.textContent(`${Z} [data-dlg-fil]`)), 'Loïc réagit');
  egal(await pg.$$eval(`${Z} [data-dlg-choix]:not([disabled])`, (L) => L.map((x) => x.dataset.dlgChoix).sort()), ['aider', 'local'], 'la réplique revient, la maladroite grisée');
  await dire('local');
  vrai(await present('[data-dlg-raccrocher]'), 'après deux tours, on peut raccrocher (le 3e tour d’ENT-10.5 a disparu)');
  await clic('[data-dlg-raccrocher]'); await pause(); await qrep();
  await quai(K); await rapprocher(K.rapp); await compteRendu(crJuste(K));
  const n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['accueil-regles'], 'seul « ce qu’il fait pendant le déchargement » est faux');
  const b = await fin();
  vrai(!b.corriger, 'rien à rouvrir : le dialogue ne se rejoue pas');
});

await v('ENT-10.6 : corriger « Rapprocher » et les phrases — Ar Vag « conforme » (il en manque) : seule cette case ✗ (19,25) ; « Corriger » rouvre la fiche (pas le quai), accusé d’Erwan au renvoi juste, note moyennée ; « 5 palettes » et « Tout est conforme » : Maëlys reprend ce que l’élève a écrit', async () => {
  const K = CAMIONS.moins;
  await monter({ uid: K.uid });
  await parcours(K, { rapp: { ...K.rapp, 'resultat-ar-vag': 'conforme' } });
  let n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['rapprocher-resultat-ar-vag'], 'seule cette case');
  proche(n.score, 19.25, 'note');
  const lig = (await detail()).find(([id]) => id === 'rapprocher-resultat-ar-vag');
  vrai(lig && lig[1] === 'ko' && /Rapprocher : Biscuiterie Ar Vag, résultat/.test(lig[2]), 'ligne du bilan détaillé : ' + JSON.stringify(lig));
  await clic('[data-fin-corriger]'); await pause();
  vrai(await present(`[data-fiche="${FR}"]`), '« Corriger » ouvre « Rapprocher »');
  await pg.selectOption(`${Z} [data-fiche-champ="resultat-ar-vag"]`, 'manque'); await pause();
  await clic('[data-fiche-envoyer]'); await confirmer();
  n = await note();
  egal(n.detail['rapprocher-resultat-ar-vag'], 'ok', 'renvoyée juste');
  vrai(n.score > 19.25 && n.score < 20, 'note moyennée : ' + n.score);
  vrai((await entrants()).some((x) => x.from === 'Erwan' && x.subject === 'Bien reçu'), 'accusé d’Erwan');
  vrai(!!(await base()).quais[QID].dechargeFini, 'le quai reste fini');
  // Les phrases : « Tout est conforme » sur un camion où il en manque → la réponse de Maëlys reprend ce que l’élève a écrit.
  await monter({ uid: CAMIONS.plus.uid });
  const Kp = CAMIONS.plus;
  await parcours(Kp, { prep: { ...Kp.prep, palettes: '5' }, cr: { salutation: SALUT, ecart: 'Tout est conforme aux annonces.', fin: FIN } });
  n = await note();
  egal(JALONS.filter((j) => n.detail[j] !== 'ok'), ['preparer-palettes', 'cr-ecart'], 'deux jalons faux');
  proche(n.score, 20 - 2 / 3 - 1, 'note');
  vrai(/Merci, je note : tout est conforme\./.test((await entrants()).slice(-1)[0].text), 'Maëlys reprend sans corriger');
  await clic('[data-fin-corriger]'); await pause();
  if (!(await present(`[data-fiche="${FP}"]`))) await allerV('fiche');
  await pg.selectOption(`${Z} [data-fiche-champ="palettes"]`, '4'); await pause();
  await clic('[data-fiche-envoyer]'); await confirmer();
  await ouvrirMail('Alors, la ramasse ?');
  await pg.click(`${Z} [data-repondre]`);
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(crJuste(Kp))) { await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t }); await pause(30); }
  await pg.click(`${Z} #formPhr button[type="submit"]`); await confirmer();
  n = await note();
  egal([n.detail['preparer-palettes'], n.detail['cr-ecart']], ['ok', 'ok'], 'renvoyés justes');
  vrai(/Merci, je préviens Ar Vag\./.test((await entrants()).slice(-1)[0].text), 'la nouvelle réponse de Maëlys');
});

await v('ENT-10.6 : niveaux — confirmé : une ligne de plus à « Préparer » (sacs Agri-Kerlann), « Règles du quai » non jointes (message et fiche), aides du quai éteintes (consigne courte), note du socle 20 et bandeau identiques, le mot « bonus » jamais à l’écran ; accompagné = standard (même quai, même message)', async () => {
  const K = CAMIONS.plus;
  const quais = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent106-donnees.js');
    const q = (n) => D.quaiDe('t106-6', { niveau: n });
    return { std: JSON.stringify(q('standard')), acc: JSON.stringify(q('accompagne')), conf: { aides: q('confirme').aides, consigne: q('confirme').securite.consigne }, stdAides: q('standard').aides,
      sameJeu: JSON.stringify(q('standard').camions) === JSON.stringify(q('confirme').camions) };
  });
  egal(quais.std === quais.acc, true, 'accompagné = standard');
  egal([quais.conf.aides, quais.stdAides, quais.sameJeu], [{}, { consignes: true }, true], 'aides du confirmé éteintes, le camion est le même');
  egal(quais.conf.consigne, 'Avant que Yann entre dans le camion, regarde le quai et le camion.', 'consigne du confirmé');
  await monter({ uid: K.uid, aisance: 'confirme' });
  const E = await entrants();
  egal(E[0].pieces, ['feuille-ramasse-106', 'annonce-ar-vag-106', 'annonce-agri-kerlann-106'], 'les règles ne sont pas jointes au confirmé');
  vrai(!/règles du quai/i.test(E[0].text), 'le message du confirmé parle des règles : ' + E[0].text);
  await allerV('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.map((x) => x.dataset.ficheChamp)), ['palettes', 'clients', 'palettes-ar-vag', 'sacs-agri-kerlann'], 'quatre lignes');
  egal(await pg.$$eval(`${Z} [data-fiche-doc]`, (L) => L.map((x) => x.dataset.ficheDoc)), ['feuille-ramasse-106', 'annonce-ar-vag-106', 'annonce-agri-kerlann-106'], 'documents du confirmé');
  await parcours(K, { prep: { ...K.prep, 'sacs-agri-kerlann': '80' } });
  const n = await note();
  proche(n.score, 20, 'note du socle');
  egal(n.detail.bonus && [n.detail.bonus.justes, n.detail.bonus.total], [0, 1], 'le cas bonus faux (80 au lieu de 40), compté à part');
  egal((await fin()).lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau identique');
  vrai(!/bonus/i.test(await texte()), 'le mot « bonus » à l’écran');
  await monter({ uid: 'p106-std' });
  await allerV('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.map((x) => x.dataset.ficheChamp)), ['palettes', 'clients', 'palettes-ar-vag'], 'le standard : trois lignes');
  await monter({ uid: 'p106-acc', aisance: 'accompagne' });
  await allerV('fiche');
  egal(await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.length), 3, 'l’accompagné : trois lignes');
});

await v('ENT-10.6 : « Avant de commencer » — 3 notions + 1 image tirées et rangées, menu fermé jusqu’aux réponses, rien n’entre dans la note ; étape suivante : de « Préparer » à « Au quai », puis au quai', async () => {
  await monter({ uid: 'p106-ouv2', sansOuverture: true });
  const db = await base();
  const ids = db.questions[ID]['@tirage'].ids;
  egal(ids.length, 4, '4 notions tirées');
  vrai(ids.every((i) => Object.keys(OUV).includes(i)), 'ids de la banque : ' + ids);
  vrai(await present('[data-ouv-aller="0"]'), 'écran « Avant de commencer »');
  const n = await note();
  vrai(!n || !Object.keys(n.detail).some((k) => /^question:(annonce|feuille|etiquette|zone|cale|gerber|img)/.test(k)), 'une notion d’ouverture dans la note');
  const K = CAMIONS.aucun;
  await monter({ uid: K.uid });
  const barre = () => pg.$eval(`${Z} [data-suite-seance]`, (e) => e.textContent.replace(/\s+/g, ' ').trim()).catch(() => null);
  egal(await barre(), 'Étape suivante : Préparer la réception Y aller →', 'au départ');
  await preparer(K.prep);
  egal(await barre(), 'Étape suivante : Au quai : accueillir Loïc Y aller →', 'après « Préparer »');
  await accueil();
  egal(await barre(), 'Étape suivante : Le quai A : inspecter, puis trier Y aller →', 'après l’accueil');
  await clic('[data-suite-aller]'); await pause();
  vrai(await present('[data-q-inspection]'), 'la barre ouvre le quai');
});

await v('ENT-10.6 : socle — aucune adresse hors du site, aucune erreur JavaScript ; écrans à 1366 × 768 sans défilement horizontal ; huit cases proposées de gauche à droite ; le corrigé de l’enseignant se calcule depuis la graine de chacun (ligne du confirmé marquée)', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-10.6.js');
    const vu = (g, aisance) => C.corrigeEleve({ tirage: { graine: g }, aisance }, 'x').items.map((i) => [i.texte, i.rep, !!i.bonus]);
    return { n: C.CORRIGE.items.length, moins: vu('t106-21', 'confirme'), sans: C.corrigeEleve({}, 'u-jamais-ouvert').texte };
  });
  egal(r.n, 8, 'parties du corrigé commun');
  egal(r.moins, [
    ['Son camion', '4 palettes (3 palettes d’un client, 1 de l’autre) ; ordre de sortie : P4 Agri-Kerlann, P3 Agri-Kerlann, P2 Ar Vag, P1 Agri-Kerlann', false],
    ['Son écart avec les annonces', 'un client a annoncé une palette de plus que ce que Loïc a chargé (la feuille le dit) (Ar Vag)', false],
    ['Combien de palettes arrivent ?', '4', false], ['Pour combien de clients ?', '2', false], ['Combien de palettes Ar Vag ?', '1', false],
    ['Combien de sacs Agri-Kerlann ?', '120', true],
    ['Son défaut au quai', 'Loïc au volant, moteur allumé (en ordre : lampe de quai allumée)', false],
    ['Palette P1 (Agri-Kerlann)', 'AK1 ou AK2 ou AK3', false], ['Palette P2 (Biscuiterie Ar Vag)', 'AV1 ou AV2 ou AV3', false],
    ['Palette P3 (Agri-Kerlann)', 'AK1 ou AK2 ou AK3', false], ['Palette P4 (Agri-Kerlann)', 'AK1 ou AK2 ou AK3', false],
    ['Rapprocher : Biscuiterie Ar Vag', 'annoncées 2, 1 reçues, il en manque', false], ['Rapprocher : Agri-Kerlann', 'annoncées 3, 3 reçues, conforme', false],
    ['Rendre compte à Maëlys', 'Salut Maëlys, 4 palettes : 1 Ar Vag, 3 Agri-Kerlann, triées en zone de réception. Ar Vag : 1 palette de moins que l’annonce, pas prête à la ramasse.', false]],
  'corrigé d’un confirmé (t106-21)');
  vrai(/pas encore ouvert/.test(r.sans), 'élève qui n’a pas ouvert : ' + r.sans);
  const K = CAMIONS.aucun;
  await monter({ uid: K.uid });
  const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await allerV('fiche');
  vrai(await large() <= 0, 'fiche : défilement horizontal');
  await preparer(K.prep); await accueil();
  await allerV('quai'); await pg.waitForSelector(QA.SVG);
  await QA.marquer(K.defaut); await QA.signaler(); await qrep(); await QA.cestBon(); await QA.decharger();
  egal(await QA.proposees(), ['allee-1', 'AV1', 'AV2', 'AV3', 'AK1', 'AK2', 'AK3', 'quaiB-1'], 'huit cases proposées, de gauche à droite');
  egal(await pg.getAttribute(`${Z} [data-q="depose"][data-c="AK1"]`, 'aria-label'), 'Case AGRI 1', 'nom lu au clavier : le lieu, jamais le verdict');
  vrai(await large() <= 0, 'quai : défilement horizontal');
  egal([...P.hotes], [], 'adresses hors du site');
  egal(P.erreurs, [], 'erreurs JavaScript');
});

await P.fermer();
}
