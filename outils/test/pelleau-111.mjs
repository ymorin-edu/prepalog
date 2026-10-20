// Suite de tests de Prepalog — bloc « pelleau-111 » : Transports Pelleau ENT-10.11, la palette qui craint la chaleur (CAP OL, entraînement CAP-C1.4, erreur induite).
// `node outils/test.mjs pelleau-111` ne lance que ce bloc (un bloc par séance : `docs/briefs/COORDINATION-pelleau.md` §2 n° 21). Aides communes :
// `outils/test/pelleau/commun.mjs` (`ouvrirPelleau`, `qFilSelecteur`). Brief : `docs/briefs/ENT-10.11-pelleau-palette-froide.md` §8 (modèle : bloc `pelleau-109`).
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/pelleau-palette-froide.js` → `rendre`).
// Mouvement réduit. Le quai s'ouvre à ③ (`commence: 'controle'`) ; le dialogue avec Loïc (face à face) le précède ; la fiche « Que devient la palette ? »
// vient après la clôture du quai, puis le compte rendu.
//
// Valeurs ÉCRITES À LA MAIN. Les palettes : Ar Vag, cartons 5 couches × 8 = 40 ; Agri-Kerlann, SACS 4 couches × 10 = 40 ; Ferme de Kervéguen, SACS
// 4 couches × 8 = 32 (réf. KG-10633, « Conservation : entre 4 et 8 °C — craint le gel »). Trois élèves TÉMOINS (la graine = l'identifiant), relevés une fois :
//   « temoin-1 » : Kervéguen en P1 · P2 Ar Vag 2 cartons ÉCRASÉS devant (40) · P3 Agri PIÈGE, couche du dessus à 5 sacs sur 10, FR 35 = réel 35 · P4 Ar Vag conforme.
//   « temoin-2 » : P1 Ar Vag 2 cartons MANQUANTS au dessus (FR 40, réel 38) · P2 Agri conforme · P3 Ar Vag conforme · Kervéguen en P4.
//   « temoin-4 » : P1 Ar Vag PIÈGE, couche du dessus à 4 cartons sur 8, FR 36 = réel 36 · Kervéguen en P2 · P3 Agri conforme · P4 Ar Vag 1 carton abîmé DERRIÈRE
//                  (il faut faire le tour).
// Poids : ne pas céder 2 · Kervéguen : décision 3, « que devient-elle ? » 2 · autres palettes : à problème 2, chacune des deux autres 1 · réserves 1 ·
// pas de déballage 0,5 · signature 0,5 · compte rendu : Kervéguen 1, réserves 1, forme 1 · questions Q1 1,5, Q2 1, Q3 1,5 (part 4). Total 20.

import { ouvrirPelleau, qFilSelecteur, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'pelleau-palette-froide';
const SEUL = process.env.SEUL_111 || '';   // pour rejouer quelques cas en travaillant : SEUL_111="la fiche|inaction" (morceaux de titres, séparés par |)
const vv = (nom, f) => ((SEUL && !SEUL.split('|').some((s) => nom.includes(s))) ? Promise.resolve() : v(nom, f));
const QID = 'pelleau-quai-111';
const PHR = 'pelleau-compte-rendu-111';
const DID = 'pelleau-loic-111';
const FICHE = 'kerveguen-111';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: '/activites/pelleau-palette-froide.js', id: ID });
const { pg, Z, pause, base, note, present, texte, entrants, aller, erreurs, hotes } = P;
const qFil = qFilSelecteur(P, vrai);
const CAPTURES = process.env.CAPTURES_ENT111 || '';
const Q = (s) => `${Z} ${s}`;

const OUV = { reserve: 'remarque', avarie: 'abimee', manquant: 'absent', couches: 'juste', depot: 'rendre', 'zone-litiges': 'cote', ambiant: 'sans-froid',
  conservation: 'frais', 'img-sac': 'perce', 'img-carton-ecrase': 'ecrase', 'img-thermometre': 'vingt' };
const monter = (o = {}) => P.monter({ rep: OUV, ...o });
const BONNES_Q = { 'qui-repond-plants': 'pelleau', 'lire-etiquette': 'etiquette', 'chaine-froid': 'chaud', 'dire-non-2': 'etiquette' };
const FAUSSES_Q = { 'qui-repond-plants': 'personne', 'lire-etiquette': 'facture', 'chaine-froid': 'passage', 'dire-non-2': 'rien' };
const GROUPES = ['Ne pas céder', 'La palette de Kervéguen', 'Contrôler les autres palettes', 'Les réserves et la signature', 'Rendre compte', 'Les questions'];
const JALONS = ['ceder', 'kerveguen-decision', 'kerveguen-devient', 'palette-probleme', 'palette-autre-1', 'palette-autre-2', 'reserves', 'deballage', 'signature',
  'cr-kerveguen', 'cr-reserves', 'cr-forme'];
const POIDS = [2, 3, 2, 2, 1, 1, 1, 0.5, 0.5, 1, 1, 1];
const JOURS = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;
const PRIS_MSG = /\b(juste|faux|correct|erreur|bonus)\b/i;
// Ce qui dirait « froid » avant l'étiquette (sans « ambiant », que dit déjà « Pelleau en bref » : l'entrepôt n'a pas de froid, c'est un fait du site).
const FROID = /froid|frais|\bgel\b|gèle|geler|réfrigér|conserv|température|4 à 8|4 et 8/i;
const KG = 'KG-10633';
const CONSERV = 'Conservation : entre 4 et 8 °C — craint le gel';
// Le contrôle juste de chaque témoin : [comptage, décision, motif], puis la valeur de chaque réserve (la référence lue pour la palette refusée).
const T1 = { graine: 'temoin-1', kerv: 'P1', pb: 'P2', pal: { P1: [32, 'refuser', 'produit'], P2: [40, 'reserves', 'avarie'], P3: [35, 'accepter'], P4: [40, 'accepter'] },
  res: { P1: KG, P2: '2' }, cr: { salutation: 'Bonjour Erwan,', reserves: 'Réserves signées par Loïc : P2, 2 cartons abîmés.', fin: 'Je reste au quai. Lea' } };
const T2 = { graine: 'temoin-2', kerv: 'P4', pb: 'P1', pal: { P1: [38, 'reserves', 'manquant'], P2: [40, 'accepter'], P3: [40, 'accepter'], P4: [32, 'refuser', 'produit'] },
  res: { P1: '2', P4: KG }, cr: { salutation: 'Bonjour Erwan,', reserves: 'Réserves signées par Loïc : P1, 2 cartons manquants.', fin: 'Je reste au quai. Lea' } };
const T4 = { graine: 'temoin-4', kerv: 'P2', pb: 'P4', pal: { P1: [36, 'accepter'], P2: [32, 'refuser', 'produit'], P3: [40, 'accepter'], P4: [40, 'reserves', 'avarie'] },
  res: { P2: KG, P4: '1' }, cr: { salutation: 'Bonjour Erwan,', reserves: 'Réserves signées par Loïc : P4, 1 carton abîmé.', fin: 'Je reste au quai. Lea' } };
const KERV = 'Je n’ai pas stocké la palette de Kervéguen : des plants à garder entre 4 et 8 °C.';
const CONTROLE = 'J’ai contrôlé les 4 palettes de la ramasse : 2 Ar Vag, 1 Agri-Kerlann, 1 Kervéguen.';
const crDe = (T) => ({ salutation: T.cr.salutation, kerveguen: KERV, reserves: T.cr.reserves, fin: T.cr.fin });

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
    if (!choix[id]) throw new Error(`qrep : « ${id} » n’a pas de réponse prévue dans ${JSON.stringify(Object.keys(choix))}`);
    // Une seule réponse à la fois (deux panneaux peuvent se suivre) : on les compte tous.
    await pg.click(Q(`[data-q-choix="${choix[id]}"][data-q="${id}"]`));
    await pg.click(Q(`[data-q-repondre="${id}"]`)); await pause();
    await pg.click(Q('[data-q-reprendre]')); await pause();
  }
  return vus;
}
// ① Au quai : voir Loïc. `rep` : la première réponse (les maladroites font avancer l'entretien ; la bonne aussi). Rend les questions vues.
async function loic(rep = 'etiquette', choix = BONNES_Q) {
  await allerV('telephone');
  await pg.click(Q(`[data-dlg-appeler="${DID}"]`)); await pause();
  await pg.click(Q(`[data-dlg-choix="${rep}"]`)); await pause();
  await pg.waitForSelector(Q('[data-dlg-raccrocher]'));
  await pg.click(Q('[data-dlg-raccrocher]')); await pause();
  return qrep(choix);
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
// ② Le quai : chaque palette, puis les réserves, la mention (o.deballage), la signature et la clôture. Rend les questions vues.
async function quai(T, o = {}) {
  const pal = Object.assign({}, T.pal, o.pal || {}), res = Object.assign({}, T.res, o.res || {}), choix = o.q || BONNES_Q;
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  const vus = [];
  const ids = ['P1', 'P2', 'P3', 'P4'];
  for (let n = 0; n < 4; n++) vus.push(...(await palette(n, pal[ids[n]], choix, o.tour === ids[n])));
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
// ③ La fiche « Que devient la palette ? » : coche `coches` (dans l'ordre), envoie. Rend les questions vues.
async function fiche(coches, choix = BONNES_Q) {
  await allerV('fiche');
  const vus = [];
  for (const c of coches) { await pg.click(Q(`[data-fiche-case="devient"][value="${c}"]`)); await pause(40); vus.push(...(await qrep(choix))); }
  await pg.click(Q('[data-fiche-envoyer]')); await confirmer();
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
// ④ Le compte rendu (phrases à choisir) ; `deja` : le message est déjà ouvert en réponse.
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
// La séance entière. `o` : rep (réponse à Loïc), pal / res / tour / deballage (le quai), coches (la fiche), cr (le compte rendu), q (réponses aux questions).
async function jouer(T, o = {}) {
  const choix = o.q || BONNES_Q, vus = [];
  vus.push(...(await loic(o.rep || 'etiquette', choix)));
  vus.push(...(await quai(T, { ...o, q: choix })));
  vus.push(...(await fiche(o.coches || ['repart', 'maelys'], choix)));
  vus.push(...(await compteRendu(o.cr || crDe(T), choix)));
  return vus;
}
const fin = () => pg.evaluate(() => {
  const b = document.querySelector('#fTest [data-fin-seance] [data-fin]');
  return b ? { lignes: [...b.querySelectorAll('[data-fin-etat]')].map((l) => [l.children[1].textContent.trim(), l.dataset.finEtat]),
    corriger: !!b.querySelector('[data-fin-corriger]'), fige: !!b.querySelector('[data-fin-fige]'), texte: b.textContent.replace(/\s+/g, ' ') } : null;
});
const cases = () => pg.$$eval(Q('[data-fin-case]'), (L) => L.map((l) => [l.dataset.finCase, l.dataset.finCaseEtat, l.textContent.replace(/\s+/g, ' ').trim()]));
const jalonsFaux = (n) => JALONS.filter((j) => n.detail[j] !== 'ok');
const etatsEtapes = () => pg.evaluate(async () => {
  const S = await import('/contenus/pelleau-ent111.js');
  return S.ETAPES.map((e) => [e.id, e.verifier(window.__f.db).status]);
});

// ─────────────────────────────────────────────────────────── la déclaration
await vv('ENT-10.11 : la séance se charge (CAP, CAP-C1.4, entraînement, correction, bilan détaillé, parcours après ENT-10.10) ; poids 16 + part 4 = 20 jalon par jalon écrit à la main ; au registre sous l’entreprise n° 10 ; fermée aux élèves tant que l’enseignant ne l’a pas cochée', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/pelleau-palette-froide.js');
    const S = await import('/contenus/pelleau-ent111.js');
    const Qs = await import('/contenus/questions/ENT-10.11.js');
    const I = await import('/activites/index.js');
    const N = await import('/core/niveaux.js');
    const charges = await I.chargerActivites();
    const m = A.meta, E = S.ETAPES;
    return { meta: m, ids: E.map((e) => e.id), poids: E.map((e) => e.poids), somme: E.reduce((t, e) => t + e.poids, 0), part: Qs.QUESTIONS.part,
      parGroupe: Object.entries(E.reduce((o, e) => { o[e.groupe] = (o[e.groupe] || 0) + e.poids; return o; }, {})),
      ecrans: E.filter((e) => e.ecran).map((e) => e.id), bonus: E.filter((e) => e.bonus).length,
      notees: Qs.QUESTIONS.liste.filter((x) => x.type === 'fil').map((x) => [x.id, x.de, x.poids, x.apres || 'tout de suite', !!x.reflexion]),
      ouv: [Qs.QUESTIONS.ouverture.tirage, Qs.QUESTIONS.ouverture.questions.length, Qs.QUESTIONS.ouverture.questions.filter((id) => id.startsWith('img-')).length,
        Qs.QUESTIONS.liste.filter((x) => x.type === 'ouverture' && x.cle).map((x) => x.id)],
      auRegistre: charges.some((a) => a.meta.id === ID), echecs: (I.activitesEnEchec ? I.activitesEnEchec() : []).map((e) => e.fichier || String(e)).filter((f) => /pelleau/.test(f)),
      cap: N.activiteVisible(m, { niveau: 'cap' }), coche: N.activiteVisible(m, { niveau: 'cap', ouverts: { [ID]: true } }), autre: N.activiteVisible(m, { niveau: '1re', ouverts: {} }),
      fin: S.OPTIONS.finFige };
  }, ID);
  const m = r.meta;
  egal([m.id, m.code, m.rubrique, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.parcours, m.correction, m.bilanDetail, m.precedente,
    m.niveauxPrevus, m.questions, m.pret, m.ouverture, m.corrige],
  ['pelleau-palette-froide', 'ENT-10.11', 'simulog', ['cap'], [], ['CAP-C1.4'], 'entrainement', 20, true, true, true, 'pelleau-controle-seul', ['confirme'], 'ENT-10.11',
    true, 'prof', './contenus/corriges/ENT-10.11.js'], 'meta');
  egal(r.ids, JALONS, 'jalons');
  egal(r.poids, POIDS, 'poids jalon par jalon (écrits à la main)');
  proche(r.somme, 16, 'somme des poids des jalons');
  proche(r.somme + r.part, 20, 'jalons + questions');
  egal(r.parGroupe, [['Ne pas céder', 2], ['La palette de Kervéguen', 5], ['Contrôler les autres palettes', 4], ['Les réserves et la signature', 2], ['Rendre compte', 3]],
    'points par ligne du bandeau (brief §5 : 2 + 5 + 4 + 2 + 3)');
  egal(r.ecrans, ['kerveguen-devient', 'cr-kerveguen', 'cr-reserves', 'cr-forme'], '« Corriger » ne rouvre que la fiche et le compte rendu');
  egal(r.bonus, 0, 'aucun cas bonus');
  egal(r.notees, [['qui-repond-plants', 'erwan', 1.5, 'tout de suite', false], ['lire-etiquette', 'erwan', 1, 'bilan', false],
    ['chaine-froid', 'erwan', 1.5, 'tout de suite', false], ['dire-non-2', 'erwan', undefined, 'tout de suite', true]], 'questions au fil (brief §4 bis)');
  egal(r.ouv, [{ preparation: 3, image: 1 }, 11, 3, ['reserve', 'avarie', 'couches', 'depot', 'ambiant', 'conservation', 'img-sac', 'img-thermometre']],
    'Avant de commencer : 11 notions (8 + 3 images), 3 + 1 tirées, ★ du brief');
  egal([r.auRegistre, r.echecs], [true, []], 'au registre, sans échec');
  egal([r.cap, r.coche, r.autre], [false, true, false], 'fermée aux élèves, ouverte par l’enseignant ; jamais hors CAP');
  egal(r.fin, 'Loïc a signé : le contrôle ne se refait pas.', 'finFige');
});

await vv('ENT-10.11 : le quai — commence au contrôle, feuille de ramasse « FR », unité « colis », motifs avarie, manquant et « Ne se stocke pas ici » ; Kervéguen en SACS avec « Conservation » sur SON étiquette seule ; les trois clients ont leur zone ; verifierQuai accepte les 3 niveaux et les 4 rangs', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent111-donnees.js');
    const Qm = await import('/core/types/quai.js');
    const q = D.quaiDe('temoin-1');
    const rangs = [0, 1, 2, 3].map((k) => ({ rang: k, jeu: D.TIRAGE.tirer({ choisir: () => k, melanger: (l) => l.slice(), prendre: (l, n) => l.slice(0, n) }) }));
    return { q: [q.id, q.rendu, q.froid, q.commence, q.document, q.recommencer, q.securite, q.arret, q.unite, q.motifs, q.libelles, q.camions.length,
      q.camions[0].tutoiement, q.camions[0].prenomChauffeur, q.dechargement.nom, q.depose.cases.map((c) => c.id), Object.keys(q.depose.clients)],
      pal: q.camions[0].palettes.map((p) => [p.id, p.client, p.forme || 'cartons', p.W, p.D, p.L, p.ref, p.conservation || null, p.attendu, p.motifAttendu]),
      etiqs: q.camions[0].palettes.map((p) => p.etiq.poids),
      verif: ['standard', 'confirme', 'accompagne'].map((n) => Qm.verifierQuai(D.quaiDe('temoin-1', { niveau: n }))),
      ref: Qm.verifierQuai(D.quaiDe('')),
      rangs: rangs.map((x) => D.disposition(x.rang).map((p) => `${p.id}:${p.client}`).join(' ')) };
  });
  egal(r.q, ['pelleau-quai-111', 'iso', false, 'controle', { nom: 'Feuille de ramasse', court: 'FR', article: 'la' }, false, undefined, undefined,
    { un: 'colis', des: 'colis' }, ['avarie', 'manquant', 'produit'],
    { avarie: { nom: 'Colis abîmé', precision: 'écrasé ou percé', adjectif: 'abîmé' }, produit: { nom: 'Ne se stocke pas ici' } }, 1, true, 'Loïc', 'Yann',
    ['allee-1', 'AV1', 'AV2', 'AK1', 'AK2', 'KV1', 'quaiB-1'], ['ar-vag', 'agri-kerlann', 'kerveguen']], 'déclaration du quai');
  egal(r.pal, [['P1', 'kerveguen', 'sacs', 4, 2, 4, 'KG-10633', 'entre 4 et 8 °C — craint le gel', 'refuser', 'produit'],
    ['P2', 'ar-vag', 'cartons', 4, 2, 5, 'AV-20418', null, 'reserves', 'avarie'], ['P3', 'agri-kerlann', 'sacs', 5, 2, 4, 'AK-31205', null, 'accepter', 'aucun'],
    ['P4', 'ar-vag', 'cartons', 4, 2, 5, 'AV-20418', null, 'accepter', 'aucun']], 'les palettes (temoin-1)');
  egal(r.etiqs, ['1 sac', '1 carton', '1 sac', '1 carton'], 'l’étiquette d’un colis ne dit jamais un total');
  egal(r.verif, [[], [], []], 'verifierQuai, trois niveaux');
  egal(r.ref, [], 'verifierQuai, jeu de référence');
  egal(r.rangs, ['P1:kerveguen P2:ar-vag P3:agri-kerlann P4:ar-vag', 'P1:ar-vag P2:kerveguen P3:agri-kerlann P4:ar-vag',
    'P1:ar-vag P2:agri-kerlann P3:kerveguen P4:ar-vag', 'P1:ar-vag P2:agri-kerlann P3:ar-vag P4:kerveguen'], 'les quatre rangs de la palette de Kervéguen');
});

// ─────────────────────────────────────────────────────────── le tirage
await vv('ENT-10.11 : tirage — 300 graines : zéro secours ; le rang de Kervéguen couvre P1 à P4 (≥ 50 chacun) ; Kervéguen toujours à REFUSER (produit), 32 sacs conformes ; UNE palette à problème parmi les trois autres, cartons écrasés chez Ar Vag, sacs percés chez Agri-Kerlann ; piège une fois sur deux ; chaque anomalie tombe ; la phrase juste nomme SA palette', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent111-donnees.js');
    const { tirerJeu } = await import('/core/tirage.js');
    const MOT = { 'ar-vag': ['carton', 'cartons'], 'agri-kerlann': ['sac', 'sacs'] };
    const MOITIE = { 'ar-vag': 4, 'agri-kerlann': 5 };
    const o = { secours: 0, rangs: [0, 0, 0, 0], kerv: 0, nb: 0, face: 0, qte: 0, fr: 0, phrase: [], pieges: 0, vus: new Set() };
    for (let i = 0; i < 300; i++) {
      const t = tirerJeu(D.TIRAGE, `eleve-${i}|pelleau-palette-froide`);
      if (t.secours) o.secours++;
      const J = t.jeu, P = D.palettesDe(J);
      o.rangs[J.rang]++;
      const kv = P.filter((p) => p.client === 'kerveguen'), pb = P.filter((p) => p.role === 'probleme'), pi = P.filter((p) => p.role === 'piege');
      const [attendu, motif] = D.ATTENDU[kv[0].anomalie];
      if (kv.length !== 1 || kv[0].id !== `P${J.rang + 1}` || attendu !== 'refuser' || motif !== 'produit' || kv[0].bl !== 32 || kv[0].manque.length || Object.keys(kv[0].avarie).length) o.kerv++;
      if (pb.length !== 1 || pi.length > 1 || P.filter((p) => p.role === 'conforme').length + pi.length !== 2) o.nb++;
      o.pieges += pi.length;
      const b = pb[0];
      if (b.anomalie === 'ecrase-face' ? b.client !== 'ar-vag' : b.anomalie === 'perce-face' ? b.client !== 'agri-kerlann' : !['cache', 'manquant'].includes(b.anomalie)) o.face++;
      P.forEach((p) => o.vus.add(`${p.anomalie}@${p.client}`));
      const nAv = (p) => Object.keys(p.avarie).length;
      if (!((b.anomalie === 'manquant' ? b.manque.length === 2 && !nAv(b) : b.anomalie === 'cache' ? nAv(b) === 1 && !b.manque.length : nAv(b) === 2 && !b.manque.length)
        && pi.every((p) => p.manque.length === MOITIE[p.client] && !nAv(p)))) o.qte++;
      if (P.some((p) => p.bl !== (p.role === 'piege' ? 40 - p.manque.length : p.client === 'kerveguen' ? 32 : 40))) o.fr++;
      // La phrase juste, recomposée ici sans le code de la séance.
      const n = b.anomalie === 'cache' ? 1 : 2, [un, des] = MOT[b.client];
      const attend = `Réserves signées par Loïc : ${b.id}, ${n} ${n > 1 ? des : un} ${b.anomalie === 'manquant' ? (n > 1 ? 'manquants' : 'manquant') : (n > 1 ? 'abîmés' : 'abîmé')}.`;
      const C = D.choixReserves(J);
      if (C[0] !== attend || new Set(C).size !== 4 || !C.includes('Tout est conforme, aucune réserve.')) o.phrase.push([i, C[0], attend]);
    }
    return { ...o, vus: [...o.vus].sort(), phrase: o.phrase.slice(0, 3) };
  });
  egal([r.secours, r.kerv, r.nb, r.face, r.qte, r.fr], [0, 0, 0, 0, 0, 0], 'secours, Kervéguen, rôles, face, quantités, feuille');
  vrai(r.rangs.every((n) => n >= 50), `le rang de Kervéguen couvre P1 à P4 : ${r.rangs}`);
  vrai(r.pieges >= 110 && r.pieges <= 190, `un piège une fois sur deux : ${r.pieges} sur 300`);
  egal(r.phrase, [], 'phrase juste des réserves');
  egal(r.vus, ['cache@agri-kerlann', 'cache@ar-vag', 'conforme@agri-kerlann', 'conforme@ar-vag', 'couche-normale@agri-kerlann', 'couche-normale@ar-vag',
    'ecrase-face@ar-vag', 'kerveguen@kerveguen', 'manquant@agri-kerlann', 'manquant@ar-vag', 'perce-face@agri-kerlann'], 'chaque anomalie tombe, chez chaque client possible');
});

await vv('ENT-10.11 : contrôle d’équité — `verifier` refuse deux palettes de Kervéguen, aucune palette à problème, un sac percé chez Ar Vag, un rang qui ne correspond pas, un colis abîmé hors de sa face, une palette de Kervéguen qui manque de sacs ; les témoins et la référence passent', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent111-donnees.js');
    const j = (g = 'temoin-1') => JSON.parse(JSON.stringify(D.jeuDe(g)));
    const deux = j(); deux.palettes[1].client = 'kerveguen'; deux.palettes[1].role = 'kerveguen'; deux.palettes[1].anomalie = 'kerveguen'; deux.palettes[1].avarie = {};
    const sansPb = j(); sansPb.palettes[1].role = 'conforme'; sansPb.palettes[1].anomalie = 'conforme'; sansPb.palettes[1].avarie = {};
    const perceArVag = j(); perceArVag.palettes[1].anomalie = 'perce-face';
    const rang = j(); rang.rang = 2;
    const k = j(); const c = Object.keys(k.palettes[1].avarie)[0]; k.palettes[1].avarie[c] = [0, -1];
    const manque = j(); manque.palettes[0].manque = ['0,0,3'];
    return { deux: D.verifier(deux), sansPb: D.verifier(sansPb), perceArVag: D.verifier(perceArVag), rang: D.verifier(rang), face: D.verifier(k), manque: D.verifier(manque),
      bons: [D.verifier(j()), D.verifier(j('temoin-2')), D.verifier(j('temoin-4')), D.verifier(D.jeuDe(''))] };
  });
  vrai(r.deux.length > 0, 'deux palettes de Kervéguen : ' + r.deux);
  vrai(r.sansPb.some((x) => /rôles/.test(x)), 'aucune palette à problème : ' + r.sansPb);
  vrai(r.perceArVag.some((x) => /P2 : anomalie perce-face/.test(x)), 'sac percé chez Ar Vag : ' + r.perceArVag);
  vrai(r.rang.some((x) => /rang de Kervéguen incohérent/.test(x)), 'rang : ' + r.rang);
  vrai(r.face.some((x) => /P2 : colis abîmé hors de sa face/.test(x)), 'hors de sa face : ' + r.face);
  vrai(r.manque.some((x) => /P1 : quantités hors règle/.test(x)), 'palette de Kervéguen avec un manquant : ' + r.manque);
  egal(r.bons, [[], [], [], []], 'témoins et référence');
});

await vv('ENT-10.11 : les trois témoins (valeurs à la main) — palettes, feuille et réel au quai, décision attendue, phrases justes, ligne « contrôlé »', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent111-donnees.js');
    const lire = (g) => {
      const Qd = D.quaiDe(g), j = D.jeuDe(g);
      return { pal: Qd.camions[0].palettes.map((p) => [p.id, p.bl, p.W * p.D * p.L - p.manque.length, Object.keys(p.avarie).length, p.attendu, p.motifAttendu]),
        res: D.choixReserves(j)[0], kerv: D.choixKerveguen()[0] };
    };
    return { t1: lire('temoin-1'), t2: lire('temoin-2'), t4: lire('temoin-4'), controle: D.ligneControle() };
  });
  egal(r.t1.pal, [['P1', 32, 32, 0, 'refuser', 'produit'], ['P2', 40, 40, 2, 'reserves', 'avarie'], ['P3', 35, 35, 0, 'accepter', 'aucun'], ['P4', 40, 40, 0, 'accepter', 'aucun']], 'temoin-1');
  egal(r.t2.pal, [['P1', 40, 38, 0, 'reserves', 'manquant'], ['P2', 40, 40, 0, 'accepter', 'aucun'], ['P3', 40, 40, 0, 'accepter', 'aucun'], ['P4', 32, 32, 0, 'refuser', 'produit']], 'temoin-2');
  egal(r.t4.pal, [['P1', 36, 36, 0, 'accepter', 'aucun'], ['P2', 32, 32, 0, 'refuser', 'produit'], ['P3', 40, 40, 0, 'accepter', 'aucun'], ['P4', 40, 40, 1, 'reserves', 'avarie']], 'temoin-4');
  egal([r.t1.res, r.t2.res, r.t4.res], [T1.cr.reserves, T2.cr.reserves, T4.cr.reserves], 'phrases des réserves');
  egal([r.t1.kerv, r.controle], [KERV, CONTROLE], 'ligne sur Kervéguen, ligne imposée');
});

// ─────────────────────────────────────────────────────────── « que, jamais de combien » : rien avant l'étiquette ne dit le froid
await vv('ENT-10.11 : rien avant l’étiquette ne dit que la palette est froide — sur 300 graines, ni Loïc (sa phrase, ses réactions, sa fin), ni les messages d’avant le quai, ni la consigne du quai, ni le motif « Ne se stocke pas ici », ni les documents, ni l’accueil ne parlent de froid ni de gel ni de température ni de plants ; le texte du quai ne change pas avec le tirage ; « Conservation » n’est que sur l’étiquette du sac de Kervéguen', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent111-donnees.js');
    const S = await import('/contenus/pelleau-ent111.js');
    const Qs = await import('/contenus/questions/ENT-10.11.js');
    const mails = (f) => f.mails.map((m) => `${m.subject} ${m.text}`).join(' ');
    const docs = S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html({}) : d.html)).join('\n');
    const dial = D.REPLIQUES.map((x) => `${x.dit} ${x.choix.filter((c) => c.v !== 'dehors').map((c) => `${c.lib} ${c.reaction || ''}`).join(' ')}`).join(' ') + ` ${D.FIN_DIALOGUE} ${S.TELEPHONE.situation}`;
    const ouv = JSON.stringify(Qs.QUESTIONS.liste.filter((x) => x.type === 'ouverture' && !['conservation', 'img-thermometre', 'ambiant'].includes(x.id)));
    const fixes = [docs, dial, mails(S.VOLET.semer('Lea')), mails(S.VOLET.declencheurs.find((x) => x.id === 'controle').semer('Lea', {})), JSON.stringify(S.ACCUEIL),
      D.consigneErwan(), D.LIBELLE_PRODUIT, ouv].join('\n');
    const textes = (q) => JSON.stringify([q.titre, q.avertissement, q.camions[0].parole, q.libelles, q.motifs, q.unite, q.depose.clients]);
    const ref = textes(D.quaiDe('')), varient = [], cons = [], fuitesFr = [];
    for (let i = 0; i < 300; i++) {
      const q = D.quaiDe(`g-${i}`);
      if (textes(q) !== ref) varient.push(i);
      const avec = q.camions[0].palettes.filter((p) => p.conservation !== undefined).map((p) => p.client);
      if (avec.length !== 1 || avec[0] !== 'kerveguen' || JSON.stringify(q.camions[0].palettes.filter((p) => p.client !== 'kerveguen')).includes('onservation')) cons.push(i);
      // Les étiquettes des autres palettes ne disent rien non plus.
      if (/froid|gel|4 et 8/i.test(JSON.stringify(q.camions[0].palettes.filter((p) => p.client !== 'kerveguen').map((p) => p.etiq)))) fuitesFr.push(i);
    }
    return { dedans: fixes, varient: varient.slice(0, 5), cons: cons.slice(0, 5), fuitesFr, ref };
  });
  const trouve = r.dedans.match(FROID);
  vrai(!trouve, `un mot du froid avant l’étiquette : « ${trouve && r.dedans.slice(Math.max(0, trouve.index - 60), trouve.index + 60)} »`);
  egal(r.varient, [], 'graines dont le texte du quai diffère du jeu de référence');
  egal(r.cons, [], 'graines où « Conservation » n’est pas sur la seule étiquette de Kervéguen');
  egal(r.fuitesFr, [], 'graines où l’étiquette d’une autre palette parle de froid');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
await vv('ENT-10.11 : parcours juste à l’écran (temoin-1) — Avant de commencer, quai fermé avant Loïc, Q2 à la fin de l’entretien (corrigée au bilan), l’étiquette « Conservation » lue au zoom, Kervéguen refusée, Q3 à la clôture, la fiche (Q1 à la 1re case), le compte rendu (Q4) ; 20 / 20, bandeau de 6 lignes ✓', async () => {
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
  vrai((await etatsEtapes()).every(([, s]) => s !== 'ok'), 'aucun jalon vrai avant d’avoir rien fait');
  // Le quai est fermé tant que Loïc n'a pas été vu.
  egal(await pg.$eval(Q('.ent-nav[data-vue-fermee="quai"], .ent-nav[data-vue="quai"]'), (b) => !!b.dataset.vueFermee), true, 'le quai est fermé avant l’entretien');
  const q2 = await loic('etiquette');
  egal(q2, ['lire-etiquette'], 'Q2 à la fin de l’entretien');
  egal(await pg.$(Q('[data-q-verdict]')), null, 'Q2 non corrigée tout de suite (au bilan)');
  egal((await entrants()).map((x) => x.subject), ['Loïc t’attend', 'Le contrôle des palettes'], 'la consigne du contrôle arrive après l’entretien');
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  egal(await pg.$$eval(Q('[data-q="etape"]'), (L) => L.map((b) => +b.dataset.n)), [3, 4], 'stepper ③ ④');
  vrai(/Les 4 palettes de ce matin sont triées/.test(await pg.textContent(Q('.quai-avert'))), 'la consigne d’Erwan en tête du quai');
  // La palette de Kervéguen (P1) : son étiquette, lue au zoom, dit la conservation ; les autres, non.
  await pg.click(Q('[data-q="sel"][data-n="0"]')); await pause(30);
  await pg.dispatchEvent(Q('svg[data-q-palette] [data-q-carton="5"]'), 'click');
  await pg.waitForSelector(Q('[data-q-etiquette]'));
  egal((await pg.textContent(Q('[data-q-etiquette] [data-q-conservation]'))).trim(), CONSERV, 'l’étiquette du sac de Kervéguen');
  await capture('2-etiquette-au-zoom', '[data-q-etiquette]');
  await pg.fill(Q('#qCompte'), '32'); await pg.press(Q('#qCompte'), 'Enter');
  egal(await pg.$$eval(Q('#qDec-accepter, #qDec-reserves, #qDec-refuser'), (L) => L.map((b) => b.textContent.trim())), ['Accepter', 'Accepter avec réserves', 'Refuser'], 'les trois décisions');
  await pg.click(Q('#qDec-refuser'));
  egal(await pg.$$eval(Q('[data-q="motif"]'), (L) => L.map((b) => b.textContent.trim())), ['Colis abîmé', 'Manquant', 'Ne se stocke pas ici'], 'les motifs du refus');
  await pg.click(Q('#qMot-produit'));
  await capture('3-decision-refuser', '[data-q-bloc="decider"]');
  await pg.click(Q('[data-q="valider"]')); await pause();
  egal(await qrep(), [], 'rien à la validation');
  for (const n of [1, 2, 3]) egal(await palette(n, T1.pal[`P${n + 1}`]), [], `P${n + 1} validée : pas de question`);
  await pg.click(Q('[data-q="vers4"]')); await pg.click(Q('[data-q="vers4"]')); await pause();
  for (const [id, val] of Object.entries(T1.res)) await pg.fill(Q(`#qRes-${id}`), val);
  await pg.click(Q('[data-q="ecrire"]')); await pause();
  const t4 = await pg.textContent(Q('[data-quai]'));
  vrai(/Feuille de ramasse n° RAM-0522/.test(t4), 'le titre du document de ④ : ' + t4.slice(0, 160));
  vrai(/P1 KG-10633 : palette REFUSÉE — produit livré KG-10633 au lieu de KG-10633 commandé\. 32 colis repris par le chauffeur\./.test(t4), 'la ligne du refus : ' + t4.slice(0, 400));
  vrai(/P2 AV-20418 : acceptée sous réserve — 2 colis abîmés \(écrasé ou percé\)/.test(t4), 'réserve de P2');
  await pg.click(Q('[data-q="signer"]')); await pause();
  vrai(/Je recharge les palettes refusées/.test(await pg.textContent(Q('[data-quai]'))), 'Loïc reprend la palette refusée');
  await pg.click(Q('[data-q="clore"]')); await pause();
  egal(await qrep(), ['chaine-froid'], 'Q3 à la clôture du quai');
  vrai(!!(await entrants()).find((x) => x.subject === 'La palette de Kervéguen'), 'la fiche arrive à la clôture');
  egal((await base()).quais[QID].fini, true, 'le quai est clos');
  // La fiche : cinq cases, Q1 à la première cochée.
  await allerV('fiche');
  egal((await pg.$$eval(Q('[data-fiche-case="devient"]'), (L) => L.map((c) => c.value))).sort(), ['dehors', 'fond', 'maelys', 'quai', 'repart'], 'les cinq cases');
  await pg.click(Q('[data-fiche-case="devient"][value="repart"]')); await pause(40);
  egal(await qrep(), ['qui-repond-plants'], 'Q1 à la première case cochée');
  await pg.click(Q('[data-fiche-case="devient"][value="maelys"]')); await pause(40);
  await capture('4-fiche', '[data-fiche-envoyer]');
  await pg.click(Q('[data-fiche-envoyer]')); await confirmer();
  vrai(!!(await entrants()).find((x) => x.subject === 'Ton compte rendu'), 'le compte rendu est demandé après la fiche');
  await ouvrirMail('Ton compte rendu'); await pg.click(Q('[data-repondre]')); await pg.waitForSelector(Q('#formPhr:not([hidden])'));
  egal((await choixDe('reserves')).sort(), ['Réserves signées par Loïc : P2, 2 cartons abîmés.', 'Réserves signées par Loïc : P2, 3 cartons abîmés.',
    'Réserves signées par Loïc : P3, 2 sacs abîmés.', 'Tout est conforme, aucune réserve.'], 'les choix des réserves, calculés sur SON tirage');
  egal((await choixDe('kerveguen')).length, 4, 'quatre choix sur Kervéguen');
  vrai((await texte()).includes(CONTROLE), 'la ligne imposée « contrôlé »');
  const vus = await compteRendu(crDe(T1), BONNES_Q, true);
  egal(vus, ['dire-non-2'], 'Q4 à l’envoi');
  const n = await note();
  egal(jalonsFaux(n), [], 'jalons');
  egal(['question:qui-repond-plants', 'question:lire-etiquette', 'question:chaine-froid'].map((j) => n.detail[j]), ['ok', 'ok', 'ok'], 'questions notées');
  egal(n.detail['question:dire-non-2'], undefined, 'Q4 sans note');
  proche(n.score, 20, 'note');
  const b = await fin();
  egal(b.lignes, GROUPES.map((g) => [g, 'ok']), 'bandeau');
  await capture('5-bilan', '[data-fin-seance]');
  capturer = false;
  const M = await entrants();
  egal(M.map((x) => x.subject), ['Loïc t’attend', 'Le contrôle des palettes', 'La palette de Kervéguen', 'Ton compte rendu', 'Merci'], 'les messages, dans l’ordre');
  egal(M[0].pieces, ['droit-depot'], '« Le droit » joint au premier message');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun message ne dit juste / faux / correct / erreur / bonus');
  egal(M.filter((x) => JOURS.test(x.text) || JOURS.test(x.subject)).map((x) => x.subject), [], 'aucun jour de la semaine');
  vrai(M.every((x, i) => !i || x.ts >= M[i - 1].ts), 'heures croissantes');
  const d0 = new Date(M[0].ts);
  vrai(d0.getMonth() === 4 && d0.getDate() === 22 && d0.getHours() === 8, 'le 22 mai, 8 h : ' + d0);
  vrai(/Bien vu : chez nous, pas de froid, on ne garde pas\. Loïc la reprend\./.test(M[4].text), 'le message de fin quand la palette est refusée : ' + M[4].text);
  egal(erreurs, [], 'erreurs JavaScript');
});

await vv('ENT-10.11 : l’étiquette au zoom — « Conservation : entre 4 et 8 °C — craint le gel » lisible (entièrement à l’écran, police ≥ 11 px), sur le sac de Kervéguen seul ; à ③ le sac de Kervéguen est dessiné (32 sacs), l’étiquette d’un carton ne dit rien ; à ④ chaque palette est dans la zone de SON client, Kervéguen dans la sienne ; 1366 × 768 sans défilement horizontal', async () => {
  await monter({ uid: 'temoin-1' });
  await loic();
  await allerV('quai');
  await pg.waitForSelector(Q('[data-q-palette]'));
  const sacs = async (n) => { await pg.click(Q(`[data-q="sel"][data-n="${n}"]`)); await pause(30); return pg.$$eval(Q('svg[data-q-palette] [data-iso-sac]'), (L) => L.length); };
  egal([await sacs(0), await sacs(1), await sacs(2), await sacs(3)], [32, 0, 35, 0], 'sacs dessinés à ③ (P1 Kervéguen : 32 ; P2, P4 : cartons ; P3 : 35 sacs, le piège)');
  const lire = async (n, carton) => {
    await pg.click(Q(`[data-q="sel"][data-n="${n}"]`)); await pause(30);
    await pg.dispatchEvent(Q(`svg[data-q-palette] [data-q-carton="${carton}"]`), 'click');
    await pg.waitForSelector(Q('[data-q-etiquette]'));
    return pg.$eval(Q('[data-q-etiquette]'), (e) => ({ l1: e.querySelector('.quai-etiq-l1 b').textContent.trim(), tout: e.innerText.replace(/\s+/g, ' '),
      cons: e.querySelector('[data-q-conservation]') ? e.querySelector('[data-q-conservation]').textContent.trim() : null }));
  };
  const e1 = await lire(0, 5);
  egal([e1.l1, e1.cons], ['Expéditeur : Ferme de Kervéguen', CONSERV], 'étiquette du sac de Kervéguen');
  vrai(/KG-10633/.test(e1.tout) && /\b1 sac\b/.test(e1.tout), 'référence et contenu : ' + e1.tout);
  const lisible = await pg.$eval(Q('[data-q-etiquette] [data-q-conservation]'), (n) => { const r = n.getBoundingClientRect(), s = getComputedStyle(n);
    return { dedans: r.left >= 0 && r.right <= window.innerWidth && r.width > 0 && r.height > 0, px: parseFloat(s.fontSize), haut: r.top, bas: r.bottom, vh: window.innerHeight }; });
  vrai(lisible.dedans && lisible.px >= 11, `la ligne de conservation est entièrement à l’écran et lisible : ${JSON.stringify(lisible)}`);
  egal((await lire(1, 2)).cons, null, 'étiquette d’un carton (P2) : pas de conservation');
  egal((await lire(2, 13)).cons, null, 'étiquette d’un sac d’Agri-Kerlann (P3) : pas de conservation');
  await pg.click(Q('[data-q="etape"][data-n="4"]')); await pause();
  const posees = await pg.$$eval(Q('[data-q-cf] [data-iso-posee]'), (L) => Object.fromEntries(L.map((g) => [g.dataset.isoPosee, g.dataset.isoCase]).sort()));
  egal(posees, { P1: 'KV1', P2: 'AV1', P3: 'AK1', P4: 'AV2' }, '④ : chaque palette dans la zone de son client');
  const large = await pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  vrai(large <= 0, '1366 × 768 : défilement horizontal ' + large);
});

await vv('ENT-10.11 : la dépose par client — trois clients, sept cases ; le nom de chaque zone est écrit dans le dessin du sol (KERVÉGUEN compris), et le rang de Kervéguen tiré (temoin-1 en P1, temoin-2 en P4, temoin-4 en P2) place chaque palette dans SA case', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent111-donnees.js');
    return { clients: D.quaiDe('temoin-1').depose.clients, cases: D.quaiDe('temoin-1').depose.cases.filter((c) => c.client).map((c) => [c.id, c.client]),
      rangs: ['temoin-1', 'temoin-2', 'temoin-4'].map((g) => D.jeuDe(g).rang) };
  });
  egal(r.clients['kerveguen'].nom, 'Ferme de Kervéguen', 'nom de la zone de Kervéguen');
  egal(r.cases, [['AV1', 'ar-vag'], ['AV2', 'ar-vag'], ['AK1', 'agri-kerlann'], ['AK2', 'agri-kerlann'], ['KV1', 'kerveguen']], 'cases par client');
  egal(r.rangs, [0, 3, 1], 'rangs des témoins');
  for (const [g, att] of [['temoin-2', { P1: 'AV1', P2: 'AK1', P3: 'AV2', P4: 'KV1' }], ['temoin-4', { P1: 'AV1', P2: 'KV1', P3: 'AK1', P4: 'AV2' }]]) {
    await monter({ uid: g });
    await loic();
    await allerV('quai');
    await pg.waitForSelector(Q('[data-q-palette]'));
    await pg.click(Q('[data-q="etape"][data-n="4"]')); await pause();
    egal(await pg.$$eval(Q('[data-q-cf] [data-iso-posee]'), (L) => Object.fromEntries(L.map((x) => [x.dataset.isoPosee, x.dataset.isoCase]).sort())), att, `${g} : chaque palette dans la zone de son client`);
    if (g === 'temoin-4') {
      capturer = true; await capture('6-zones-des-clients', '[data-q-cf]'); capturer = false;
      const nom = await pg.$$eval(Q('[data-q-cf] text, [data-q-cf] tspan'), (L) => L.map((t) => t.textContent.trim()).filter(Boolean));
      vrai(nom.some((t) => /KERV/i.test(t)), 'le nom de la zone de Kervéguen est écrit au sol : ' + nom.join(' | '));
    }
  }
});

// ─────────────────────────────────────────────────────────── la bonne réaction, et les mauvaises
await vv('ENT-10.11 : « Accepter sans réserve » la palette de Kervéguen est FAUX (temoin-1, tout le reste juste) — sa décision ✗ et la réserve ✗, 16 / 20 ; Erwan répond « Merci. On en reparle. » sans dire faux et sans « Bien vu »', async () => {
  await monter({ uid: 'temoin-1' });
  await jouer(T1, { pal: { P1: [32, 'accepter'] } });
  const n = await note();
  egal(jalonsFaux(n), ['kerveguen-decision', 'reserves'], 'jalons faux');
  proche(n.score, 16, 'note');
  const M = await entrants();
  const fin = M[M.length - 1];
  egal([fin.subject, fin.text.replace(/\s+/g, ' ')], ['Merci', 'Merci. On en reparle. Erwan'], 'le message de fin quand la palette a été rangée');
  egal(M.filter((x) => PRIS_MSG.test(x.text)).map((x) => x.subject), [], 'aucun message ne juge');
  const c = Object.fromEntries((await cases()).map(([id, e, t]) => [id, [e, t]]));
  vrai(c['kerveguen-decision'][0] === 'ko' && /Palette P1/.test(c['kerveguen-decision'][1]), 'le bilan nomme la palette : ' + c['kerveguen-decision']);
});

await vv('ENT-10.11 : « Accepter avec réserves » (motif « Ne se stocke pas ici ») n’est pas un refus — décision ✗, réserve ✗, 16 / 20, Erwan neutre', async () => {
  await monter({ uid: 'temoin-1' });
  await jouer(T1, { pal: { P1: [32, 'reserves', 'produit'] }, res: { P1: KG } });
  const n = await note();
  egal(jalonsFaux(n), ['kerveguen-decision', 'reserves'], 'jalons faux');
  proche(n.score, 16, 'note');
  const M = await entrants();
  vrai(/Merci\. On en reparle\./.test(M[M.length - 1].text), 'message de fin neutre');
});

await vv('ENT-10.11 : refuser avec un autre motif, ou sans lire la référence — la décision seule est juste si le motif est « produit » ; une référence fausse sur la ligne du refus rend la réserve ✗ (la décision reste ✓), 19 / 20', async () => {
  await monter({ uid: 'temoin-2' });
  await jouer(T2, { res: { P4: 'KG-00000' } });
  const n = await note();
  egal(jalonsFaux(n), ['reserves'], 'jalons faux');
  proche(n.score, 19, 'note');
  await monter({ uid: 'temoin-2' });
  await jouer(T2, { pal: { P4: [32, 'refuser', 'avarie'] }, res: { P4: '2' } });
  const n2 = await note();
  egal(jalonsFaux(n2), ['kerveguen-decision', 'reserves'], 'refus pour « Colis abîmé » : faux');
  proche(n2.score, 16, 'note');
  vrai(/Bien vu/.test((await entrants()).pop().text), 'refusée : Erwan confirme (le message ne juge pas le motif)');
});

await vv('ENT-10.11 : l’erreur induite — « D’accord, je la mets au rack » (ou dehors, ou « pas mon client ») : Loïc dit « Comme tu veux. », l’entretien continue, seul « Ne pas céder » est ✗ (18 / 20) ; l’élève qui lit quand même l’étiquette et refuse garde le reste', async () => {
  for (const rep of ['rack', 'dehors', 'ignorer']) {
    await monter({ uid: 'temoin-1' });
    await allerV('telephone');
    await pg.click(Q(`[data-dlg-appeler="${DID}"]`)); await pause();
    await pg.click(Q(`[data-dlg-choix="${rep}"]`)); await pause();
    vrai(/Comme tu veux\./.test(await pg.textContent(Q('[data-dlg-fil]'))), `${rep} : Loïc réagit « Comme tu veux. »`);
    egal((await pg.textContent(Q('[data-dlg-fil]'))).split('Comme tu veux.').length - 1, 1, `${rep} : Loïc réagit une fois, sans leçon`);
    await pg.waitForSelector(Q('[data-dlg-raccrocher]'));
    await pg.click(Q('[data-dlg-raccrocher]')); await pause(); await qrep();
    await quai(T1); await fiche(['repart', 'maelys']); await compteRendu(crDe(T1));
    const n = await note();
    egal(jalonsFaux(n), ['ceder'], `${rep} : jalons faux`);
    proche(n.score, 18, `${rep} : note`);
  }
});

await vv('ENT-10.11 : la fiche « Que devient la palette ? » — les deux justes et rien de trop = ✓ ; « on la range au fond » en plus, ou à la place, ou aucune case : ✗ (2 points perdus) ; la fiche ne s’ouvre qu’une fois le quai clos', async () => {
  await monter({ uid: 'temoin-1' });
  vrai(!(await present('.ent-nav[data-vue="fiche"]')) || await pg.$eval(Q('.ent-nav[data-vue="fiche"]'), (b) => b.disabled || b.getAttribute('aria-disabled') === 'true'), 'fiche fermée avant la clôture du quai');
  const essais = [[['repart', 'maelys', 'fond'], 'un piège en plus'], [['fond'], 'le piège seul'], [['repart'], 'une seule juste'], [[], 'aucune case'],
    [['repart', 'maelys', 'dehors'], 'dehors en plus']];
  for (const [coches, quoi] of essais) {
    await monter({ uid: 'temoin-1' });
    await jouer(T1, { coches });
    const n = await note();
    egal(jalonsFaux(n), ['kerveguen-devient'], `${quoi} : jalons faux`);
    proche(n.score, 18, `${quoi} : note`);
  }
});

await vv('ENT-10.11 : inaction et pire cas (temoin-1) — rien fait : 0 (aucun jalon vrai, même « pas de déballage ») ; seul l’entretien juste : 2 ; tout faux sauf la signature : 0,5 / 20 + 0 ; « Corriger » ne rouvre que la fiche et le compte rendu et RELÈVE la note, le quai reste faux et clos', async () => {
  await monter({ uid: 'temoin-1' });
  const n0 = await note(); egal(n0 ? n0.score : 0, 0, 'inaction');
  egal((await etatsEtapes()).filter(([, s]) => s === 'ok'), [], 'aucun jalon vrai sans rien faire');
  await loic('etiquette', FAUSSES_Q);
  egal((await etatsEtapes()).filter(([, s]) => s === 'ok').map(([id]) => id), ['ceder'], 'seul l’entretien est jugé après l’entretien');
  await allerV('quai'); await pg.waitForSelector(Q('[data-q-palette]'));
  egal((await etatsEtapes()).filter(([, s]) => s === 'ok').map(([id]) => id), ['ceder'], 'le quai ouvert, rien de plus');
  await quai(T1, { pal: { P1: [32, 'accepter'], P2: [40, 'accepter'], P3: [40, 'reserves', 'manquant'], P4: [39, 'reserves', 'avarie'] }, res: { P3: '4', P4: '1' },
    deballage: true, q: FAUSSES_Q });
  await fiche(['fond', 'dehors'], FAUSSES_Q);
  await compteRendu({ salutation: 'Salut mon pote,', kerveguen: 'J’ai rangé la palette de Kervéguen au rack du fond, le plus frais.', reserves: 'Tout est conforme, aucune réserve.', fin: 'Bisous' }, FAUSSES_Q);
  const n = await note();
  proche(n.score, 2 + 0.5, 'note (l’entretien juste et la signature)');
  egal(jalonsFaux(n), JALONS.filter((j) => !['ceder', 'signature'].includes(j)), 'tous les jalons faux sauf l’entretien et la signature');
  const b = await fin();
  egal(b.lignes.slice(0, 5).map(([, e]) => e), ['ok', 'ko', 'ko', 'ko', 'ko'], 'bandeau');
  vrai(b.corriger && b.fige && /Loïc a signé : le contrôle ne se refait pas\./.test(b.texte), 'Corriger et la phrase du quai : ' + b.texte);
  const allers = await pg.$$eval(Q('[data-fin-aller]'), (L) => L.map((x) => x.dataset.finAller));
  vrai(allers.length > 0 && allers.every((x) => x === `phrases:${PHR}` || x === `fiche:${FICHE}`), 'seuls la fiche et le compte rendu se rouvrent : ' + allers);
  await pg.click(Q('[data-fin-corriger]')); await pause();
  vrai(!(await present('[data-q-palette]')), '« Corriger » n’ouvre pas le quai');
  await fiche(['fond', 'dehors', 'repart', 'maelys'], BONNES_Q);   // la fiche rouverte garde les cases cochées : on décoche les deux pièges et on coche les deux justes
  await compteRendu(crDe(T1), BONNES_Q);
  const n2 = await note();
  egal(['kerveguen-devient', 'cr-kerveguen', 'cr-reserves', 'cr-forme'].map((j) => n2.detail[j]), ['ok', 'ok', 'ok', 'ok'], 'fiche et compte rendu corrigés');
  egal(['kerveguen-decision', 'palette-probleme', 'deballage'].map((j) => n2.detail[j]), ['ko', 'ko', 'ko'], 'le quai reste faux');
  vrai(n2.score > n.score, `la correction relève la note : ${n.score} → ${n2.score}`);
  egal((await base()).quais[QID].fini, true, 'le quai reste clos');
});

await vv('ENT-10.11 : erreurs ciblées sur les autres palettes (temoin-4) — le piège compté « plein » : seule sa palette ✗ ; le carton abîmé DERRIÈRE accepté sans faire le tour : palette à problème ✗ et réserves ✗ ; le bilan nomme la palette sans dire le nombre attendu', async () => {
  await monter({ uid: 'temoin-4' });
  await jouer(T4, { pal: { P1: [40, 'accepter'], P4: [40, 'accepter'] }, res: {} });
  const n = await note();
  egal(jalonsFaux(n), ['palette-probleme', 'palette-autre-1', 'reserves'], 'jalons faux (le piège P1 est « autre 1 » : P1 est la première des deux autres)');
  const c = Object.fromEntries((await cases()).map(([id, e, t]) => [id, [e, t]]));
  vrai(c['palette-autre-1'][0] === 'ko' && /Palette P1/.test(c['palette-autre-1'][1]), 'le piège : ' + c['palette-autre-1']);
  vrai(c['palette-probleme'][0] === 'ko' && /Palette P4/.test(c['palette-probleme'][1]), 'le caché : ' + c['palette-probleme']);
  vrai(c['palette-autre-2'][0] === 'ok' && /Palette P3/.test(c['palette-autre-2'][1]), 'l’autre palette juste');
  vrai(!/\b36\b/.test(c['palette-autre-1'][1]), 'le bilan ne dit pas le nombre attendu');
  proche(n.score, 20 - 2 - 1 - 1, 'note');
});

await vv('ENT-10.11 : temoin-4 juste en faisant le tour de P4 — 20 / 20 ; « sous réserve de déballage » ajoutée : déballage ✗ (0,5), le reste juste', async () => {
  await monter({ uid: 'temoin-4' });
  await jouer(T4, { tour: 'P4' });
  proche((await note()).score, 20, 'juste');
  await monter({ uid: 'temoin-4' });
  await jouer(T4, { tour: 'P4', deballage: true });
  vrai((await base()).quais[QID].mentionEcrite === true, 'la mention est écrite');
  const n = await note();
  egal(jalonsFaux(n), ['deballage'], 'jalons faux');
  proche(n.score, 19.5, 'note');
});

await vv('ENT-10.11 : temoin-2 (Kervéguen en P4, deux manquants en P1) — 20 / 20 ; le compte rendu qui dit « Tout est conforme » : réserves ✗ seulement ; la ligne sur Kervéguen « rangée au rack » : ✗ seulement', async () => {
  await monter({ uid: 'temoin-2' });
  await jouer(T2);
  proche((await note()).score, 20, 'juste');
  await monter({ uid: 'temoin-2' });
  await jouer(T2, { cr: { ...crDe(T2), reserves: 'Tout est conforme, aucune réserve.' } });
  egal(jalonsFaux(await note()), ['cr-reserves'], 'réserves du compte rendu');
  await monter({ uid: 'temoin-2' });
  await jouer(T2, { cr: { ...crDe(T2), kerveguen: 'J’ai rangé la palette de Kervéguen au rack du fond, le plus frais.' } });
  egal(jalonsFaux(await note()), ['cr-kerveguen'], 'ligne sur Kervéguen');
});

// ─────────────────────────────────────────────────────────── tirage stable, niveaux, banque, parcours, corrigé
await vv('ENT-10.11 : tirage stable — la même graine rend le même quai et le même ordre de cases à la fiche ; deux graines n’ont pas toutes les mêmes', async () => {
  const lire = async (g) => {
    await monter({ uid: g });
    return pg.evaluate(async ({ g }) => {
      const D = await import('/contenus/pelleau-ent111-donnees.js');
      const S = await import('/contenus/pelleau-ent111.js');
      return { quai: JSON.stringify(D.quaiDe(g)), cases: S.FICHE_DEVIENT.blocs({ tirage: { graine: g } })[0].choix.map((c) => c.v) };
    }, { g });
  };
  const a = await lire('stable-1'), b = await lire('stable-1');
  egal(a, b, 'même graine, même quai, même ordre de cases');
  const autres = [];
  for (let i = 2; i < 8; i++) autres.push(await lire(`stable-${i}`));
  vrai(autres.some((x) => x.quai !== a.quai) && autres.some((x) => x.cases.join() !== a.cases.join()), 'graines différentes : quai et cases différents');
  egal(a.cases.slice().sort(), ['dehors', 'fond', 'maelys', 'quai', 'repart'], 'les cinq cases');
});

await vv('ENT-10.11 : confirmé — aides de comptage ÉTEINTES (ni règle des couches, ni rappel, brouillon libre), aucun bonus, note sur le socle ; accompagné = standard (aides allumées)', async () => {
  await monter({ uid: 'temoin-1', aisance: 'confirme' });
  await loic();
  await allerV('quai'); await pg.waitForSelector(Q('[data-q-palette]'));
  const aides = async () => ({ aide: await pg.$$eval(Q('.quai-aide'), (L) => L.map((x) => x.textContent).join(' ')), rappel: await present('[data-q-rappel]') });
  const A = await aides();
  vrai(!/Règle du quai/.test(A.aide) && !A.rappel, `aides de comptage chez le confirmé : ${A.aide.slice(0, 120)} / ${A.rappel}`);
  egal(await pg.evaluate(async () => { const D = await import('/contenus/pelleau-ent111-donnees.js'); const q = D.quaiDe('temoin-1', { niveau: 'confirme' }); return [q.aides, q.calcul.forme]; }),
    [{ chefDeQuai: true, consignes: true }, 'brouillon'], 'la déclaration du confirmé');
  await quai(T1); await fiche(['repart', 'maelys']); await compteRendu(crDe(T1));
  const n = await note();
  proche(n.score, 20, 'note');
  egal(n.detail.bonus, undefined, 'aucun bonus');
  vrai(!/bonus/i.test(await texte()), 'le mot « bonus » à l’écran');
  await monter({ uid: 'temoin-1', aisance: 'accompagne' });
  await loic();
  await allerV('quai'); await pg.waitForSelector(Q('[data-q-palette]'));
  const B = await aides();
  vrai(/Règle du quai/.test(B.aide) && B.rappel, 'accompagné : les aides du standard');
});

await vv('ENT-10.11 : Avant de commencer — `couches` : 300 graines, jamais 5 × 8, 4 × 10 ni 4 × 8, trois choix distincts, la juste = c × k colis ; la notion « 4 à 8 » est générique (ne nomme ni palette ni client)', async () => {
  const r = await pg.evaluate(async () => {
    const Qs = await import('/contenus/questions/ENT-10.11.js');
    const { hasard } = await import('/core/tirage.js');
    const q = Qs.QUESTIONS.liste.find((x) => x.id === 'couches');
    const faux = [];
    for (let i = 0; i < 300; i++) {
      const x = q.variante(hasard(`g-${i}`));
      const [, c, k] = /pleine de (\d+) couches de (\d+) colis/.exec(x.enonce).map(Number);
      const L = Object.values(x.libs);
      if (['5x8', '4x10', '4x8'].includes(`${c}x${k}`) || c < 3 || c > 6 || k < 4 || k > 10 || new Set(L).size !== 3 || x.libs.juste !== `${c * k} colis`) faux.push(x.enonce);
    }
    const cons = Qs.QUESTIONS.liste.find((x) => x.id === 'conservation');
    return { faux, generique: !/Kervéguen|palette|plants|Pelleau/.test(JSON.stringify(cons)) };
  });
  egal(r.faux, [], 'variantes hors règle');
  egal(r.generique, true, 'la notion « conservation » ne parle d’aucune palette');
});

await vv('ENT-10.11 : parcours — fermée tant qu’ENT-10.10 n’a pas son premier bilan, ouverte ensuite', async () => {
  const r = await pg.evaluate(async () => {
    const { chargerActivites } = await import('/activites/index.js');
    const { verrou } = await import('/core/parcours.js');
    const metas = (await chargerActivites()).map((x) => x.meta);
    const de = (id) => metas.find((x) => x.id === id);
    const uid = 'u-verrou-pelleau111', gid = 'g-verrou-pelleau111', profil = { role: 'eleve', uid };
    const k = `prepalog:prive/${uid}/pelleau-controle-seul`;
    localStorage.removeItem(k);
    const avant = await verrou(metas, de('pelleau-palette-froide'), profil, gid);
    localStorage.setItem(k, JSON.stringify({ data: { v: 1, points: { 'pelleau-controle-seul': { v: 1 } } }, ts: 1 }));
    const apres = await verrou(metas, de('pelleau-palette-froide'), profil, gid);
    localStorage.removeItem(k);
    return { avant, apres };
  });
  egal(r.avant, 'Termine d\'abord ENT-10.10.', 'avant le premier bilan d’ENT-10.10');
  egal(r.apres, null, 'après');
});

await vv('ENT-10.11 : corrigé enseignant — par élève (temoin-4) : ses palettes (anomalie, feuille, réel, décision, réserve ; Kervéguen à REFUSER), ses phrases justes ; un élève qui n’a pas ouvert la séance reçoit déjà le bon', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-10.11.js');
    const e = C.corrigeEleve({ tirage: { graine: 'temoin-4' } }, 'x');
    const vide = C.corrigeEleve({}, 'temoin-4');
    return { items: e.items.map((i) => [i.texte, i.rep]), memes: JSON.stringify(vide.items) === JSON.stringify(e.items), texte: vide.texte.length > 0, n: C.CORRIGE.items.length };
  });
  egal(r.items, [
    ['P1 — Biscuiterie Ar Vag — Biscuits au beurre, cartons de 12 paquets',
      'PIÈGE : couche du dessus à moitié vide, mais la feuille de ramasse dit le même nombre · FR 36 · réel 36 · accepter · aucune réserve'],
    ['P2 — Ferme de Kervéguen — Plants de pommes de terre, sacs de 25 kg',
      'PLANTS DE POMMES DE TERRE : l’étiquette dit « Conservation : entre 4 et 8 °C — craint le gel », l’entrepôt est ambiant · FR 32 · réel 32 · REFUSER (Ne se stocke pas ici) · réserve : palette REFUSÉE, produit livré = la référence de l’étiquette'],
    ['P3 — Agri-Kerlann — Terreau universel, sacs de 40 L', 'conforme, pleine · FR 40 · réel 40 · accepter · aucune réserve'],
    ['P4 — Biscuiterie Ar Vag — Biscuits au beurre, cartons de 12 paquets',
      '1 carton abîmé sur la face arrière (il faut faire le tour) · FR 40 · réel 40 · accepter avec réserves (Colis abîmé) · réserve : 1 colis abîmé(s)'],
    ['Compte rendu : la palette de Kervéguen', KERV],
    ['Compte rendu : la ligne des réserves', T4.cr.reserves],
    ['Compte rendu : salutation et fin', 'Bonjour Erwan, … Je reste au quai. (prénom)']], 'corrigé du témoin');
  vrai(r.memes && r.texte, 'élève qui n’a pas ouvert la séance : son jeu, déjà le bon');
  egal(r.n, 5, 'parties du corrigé commun');
});

await vv('ENT-10.11 : aucune requête hors du site, aucun jour de la semaine ni année dans les documents, aucune erreur JavaScript', async () => {
  const doc = await pg.evaluate(async () => { const S = await import('/contenus/pelleau-ent111.js'); return S.DOCUMENTS.map((d) => (typeof d.html === 'function' ? d.html({}) : d.html)).join('\n'); });
  vrai(!JOURS.test(doc), 'un jour de la semaine dans un document');
  // « Pelleau en bref » (de l'univers, repris tel quel) raconte l'histoire réelle de l'entreprise : ses années sont des faits, pas des dates de scénario.
  const sansHistoire = await pg.evaluate(async () => { const S = await import('/contenus/pelleau-ent111.js'); return S.DOCUMENTS.filter((d) => d.id !== 'pelleau')
    .map((d) => (typeof d.html === 'function' ? d.html({}) : d.html)).join('\n'); });
  vrai(!/\b20\d\d\b/.test(sansHistoire.replace(/consulté le \d\d\/\d\d\/20\d\d/g, '')), 'une année dans un document');
  egal([...hotes], [], 'requêtes hors du site');
  egal(erreurs, [], 'erreurs JavaScript');
});

await P.fermer();
}
