// Suite de tests de Prepalog — bloc « pelleau-108 » : Transports Pelleau ENT-10.8, évaluation « recevoir le camion de ramasse » (CAP OL, évaluation
// CAP-C1.3, copie rendue). `node outils/test.mjs pelleau-108` ne lance que ce bloc (un bloc par séance : `docs/briefs/COORDINATION-pelleau.md` §2 n° 21).
// Aides communes : `outils/test/pelleau/commun.mjs` (`ouvrirPelleau`, et `aidesQuai` avec `parBase` : le quai est TIRÉ par élève). Brief :
// `docs/briefs/ENT-10.8-pelleau-evaluation-reception.md` §8. Modèle d'évaluation : `outils/test/action-810.mjs`.
//
// La séance est montée dans une page à elle (1366 × 768), avec la fabrique et le moteur réels (`activites/pelleau-evaluation-reception.js` → `rendre`,
// `noter`), de vrais clics à la SOURIS ; les listes des fiches et des phrases par `selectOption`. Mouvement réduit : le camion arrive et Yann pose d'emblée.
//
// Valeurs ÉCRITES À LA MAIN (relevé du tirage le 19/10/2026), jamais recalculées par le code de la séance. Cinq camions (graine → jeu) :
//   t108-1  (aucun)   : planning 1 (Loïc 7 h 30, quai A) ; 2+2, sortie P4 Ar Vag, P3 Agri, P2 Ar Vag, P1 Agri ; défaut = niveleur relevé, en ordre = lampe ;
//                       « Préparer » : Ar Vag. Annonces 2 et 2, feuille 2 et 2, reçues 2 et 2.
//   t108-4  (moins)   : planning 1 ; 2+2, sortie P4 Agri, P3 Agri, P2 Ar Vag, P1 Ar Vag ; défaut = niveleur, en ordre = lampe ; « Préparer » : Agri-Kerlann.
//                       Annonces Ar Vag 2, Agri 3 (il en manque une) ; feuille 2 et 2 ; reçues 2 et 2.
//   t108-12 (plus)    : planning 2 (Loïc 7 h 00, quai B) ; 3+1, sortie P4 Ar Vag, P3 Ar Vag, P2 Agri, P1 Ar Vag ; défaut = niveleur, en ordre = cale ;
//                       « Préparer » : Ar Vag. Annonces Ar Vag 2 (il y en a trop), Agri 1 ; feuille 3 et 1 ; reçues 3 et 1.
//   t108-2  (feuille) : planning 1 ; 2+2, sortie P4 Ar Vag, P3 Ar Vag, P2 Agri, P1 Agri ; défaut = Loïc au volant, en ordre = lampe ; « Préparer » : Ar Vag.
//                       Une palette d'Agri-Kerlann est notée chez Ar Vag : feuille Ar Vag 3, Agri 1 ; annonces 2 et 2 ; reçues 2 et 2.
//   t108-18 (feuille) : planning 2 (quai B) ; 2+2, sortie P4 Ar Vag, P3 Agri, P2 Agri, P1 Ar Vag ; défaut = Loïc au volant, en ordre = cale ; « Préparer » :
//                       Agri-Kerlann. Une palette d'Ar Vag est notée chez Agri-Kerlann : feuille Ar Vag 1, Agri 3 ; annonces 2 et 2 ; reçues 2 et 2.
//   Poids : préparer 3 × 2/3 · accueil 1 × 2 · défaut 2, aucun faux 1 · dépose 1 × 4 · reçues 0,75 × 2, résultat (ou palette / correction) 0,75 × 2 ·
//   écart 1,5, salutation 0,25, fin 0,25 · ouverture 4. Total 20.
// Ce qui vaut son prix : les cinq témoins à 20 et la remise (= `noter`), le quai qui NE rend PAS la copie, la dépose au premier clic sans réaction,
// l'inspection sans arrêt ni réaction, l'inaction à 0, rien qui dise juste ou faux, AUCUN écran qui dise l'écart, des choix qui ne trahissent pas le jeu.

import { ouvrirPelleau, aidesQuai, proche } from './pelleau/commun.mjs';

export default async function bloc({ v, nav, BASE, egal, vrai }) {

const ID = 'pelleau-evaluation-reception';
const QID = 'pelleau-quai-108';
const DID = 'pelleau-loic-108';
const FP = 'preparer-108', FR = 'rapprocher-108';
const P = await ouvrirPelleau({ nav, BASE, vrai, activite: '/activites/pelleau-evaluation-reception.js', id: ID });
const { pg, Z, pause, base, present, texte, entrants, clic, aller } = P;
const QA = aidesQuai(P, { donnees: '/contenus/pelleau-ent108-donnees.js', id: QID, parBase: 'quaiDeBase' });
const CAPTURES = process.env.CAPTURES_ENT108 || '';
const capture = async (nom) => {
  if (!CAPTURES) return;
  for (let i = 0; i < 6 && await present('[data-carte-fermer]'); i++) { await pg.click(`${Z} [data-carte-fermer]`); await pause(40); }
  await pg.screenshot({ path: `${CAPTURES}/${nom}.png` });
};

const OUV = { annonce: 'message', 'feuille-ramasse': 'charge', 'etiquette-palette': 'qui-quoi', 'zone-reception': 'poser', cale: 'immobiliser',
  gerber: 'empiler', 'img-porteur-quai': 'cale', 'img-sol': 'emplacements' };
const OUV_FAUSSES = { annonce: 'pub', 'feuille-ramasse': 'meteo', 'etiquette-palette': 'prix', 'zone-reception': 'engins', cale: 'porte', gerber: 'filmer',
  'img-porteur-quai': 'moteur', 'img-sol': 'parking' };
// Monte la séance comme le site (base en mémoire) ; `copies` reçoit les remises. `o.uid` = la graine ; `o.rep` : réponses d'« Avant de commencer » posées
// d'avance (défaut : justes) ; `o.sansOuverture`.
const monter = (o = {}) => pg.evaluate(async (o) => {
  const A = await import(o.activite);
  document.querySelector('#fTest')?.remove();
  const hote = document.createElement('div'); hote.id = 'fTest'; document.body.prepend(hote);
  const db = o.db ? JSON.parse(JSON.stringify(o.db)) : {};
  if (!o.sansOuverture) {
    const Q = ((db.questions = db.questions || {})[o.id] = db.questions[o.id] || {});
    for (const [k, r] of Object.entries(o.rep)) if (!Q[k]) Q[k] = { arrivee: 1, premiere: r, duree: 1 };
  }
  window.__f = { db, enregistres: [], copies: [] };
  A.rendre(hote, {
    meta: A.meta, aisance: o.aisance || 'standard',
    profil: { prenom: 'Lea', nom: 'Test', role: o.role || 'eleve', uid: o.uid || 't108-1' },
    jeu: { etat: () => db, sauver: () => {} },
    enregistrer: (r) => { window.__f.enregistres.push(JSON.parse(JSON.stringify(r))); }, quitter: () => {}, codeStock: 'PE',
    lireScore: async () => null,
    rendreCopie: async (r) => { window.__f.copies.push(JSON.parse(JSON.stringify(r))); return { rendu: Date.now() }; },
  });
  return JSON.parse(JSON.stringify(db));
}, { activite: '/activites/pelleau-evaluation-reception.js', id: ID, rep: OUV, ...o });
const noter = () => pg.evaluate(async () => { const A = await import('/activites/pelleau-evaluation-reception.js'); return A.noter(window.__f.db); });
const copies = () => pg.evaluate(() => window.__f.copies.length);
const large = () => pg.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

const SORTIE = ['P4', 'P3', 'P2', 'P1'];
const DIAL = { feuille: 'feuille', regles: 'local' };
const SALUT = 'Salut Maëlys,', FIN = 'Je reste à la réception si besoin. Lea';
const PIED = 'Document pédagogique — reconstitution, non contractuel';
const JUGE = /\b(juste|justes|faux|fausse|fausses|correct|correcte|erreur|erreurs|bravo|bien vu|bonne réponse|mauvaise réponse)\b/i;
const JOURS = /\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i;
// Ce qui dirait l'écart : jamais dans un document, un message, une consigne, une légende ni un choix de « Préparer » (la fiche « Rapprocher » et les phrases
// de la fin contiennent ces mots PAR NATURE : ce sont les choix de l'élève).
const DIT_ECART = /pas prête|de (moins|plus) que|manque|trop|écart|se trompe|erreur|mal noté|mauvais client/i;
// Les cinq camions. `cases` : la case juste de chaque palette ; `prep` : les trois lignes de « Préparer » ; `rapp` : « Rapprocher » (six lignes, les mêmes pour tous) ;
// `ecart` : la phrase juste du compte rendu ; `feuilleLignes` : la feuille de ramasse ; `annonces` : le texte attendu dans chaque annonce.
const CAMIONS = {
  aucun: { uid: 't108-1', heure: '7 h 30', quai: 'A', arrivee: '07:30', defaut: 'niveleur', ok: 'lampe', sortie: ['ar-vag', 'agri-kerlann', 'ar-vag', 'agri-kerlann'],
    cases: { P4: 'AV1', P3: 'AK1', P2: 'AV2', P1: 'AK2' }, prep: { heure: '7 h 30', quai: 'A', palettes: '2' },
    rapp: { 'recues-ar-vag': '2', 'resultat-ar-vag': 'conforme', 'recues-agri-kerlann': '2', 'resultat-agri-kerlann': 'conforme', 'feuille-juste': 'juste', 'feuille-corriger': 'rien' },
    ecart: 'Tout est conforme aux annonces.', recu: '4 palettes : 2 Ar Vag, 2 Agri-Kerlann, triées en zone de réception.',
    feuilleLignes: [['Biscuiterie Ar Vag', '2', '80 cartons', 'signé'], ['Agri-Kerlann', '2', '80 sacs', 'signé']], annonces: [/ce jour 2 palettes de biscuits au beurre/, /ce jour 2 palettes de terreau/] },
  moins: { uid: 't108-4', heure: '7 h 30', quai: 'A', arrivee: '07:30', defaut: 'niveleur', ok: 'lampe', sortie: ['agri-kerlann', 'agri-kerlann', 'ar-vag', 'ar-vag'],
    cases: { P4: 'AK1', P3: 'AK2', P2: 'AV1', P1: 'AV2' }, prep: { heure: '7 h 30', quai: 'A', palettes: '3' },
    rapp: { 'recues-ar-vag': '2', 'resultat-ar-vag': 'conforme', 'recues-agri-kerlann': '2', 'resultat-agri-kerlann': 'manque', 'feuille-juste': 'juste', 'feuille-corriger': 'rien' },
    ecart: 'Agri-Kerlann : 1 palette de moins que l’annonce.', recu: '4 palettes : 2 Ar Vag, 2 Agri-Kerlann, triées en zone de réception.',
    feuilleLignes: [['Biscuiterie Ar Vag', '2', '80 cartons', 'signé'], ['Agri-Kerlann', '2', '80 sacs', 'signé']], annonces: [/ce jour 2 palettes de biscuits/, /ce jour 3 palettes de terreau.*\(120 sacs\)/] },
  plus: { uid: 't108-12', heure: '7 h 00', quai: 'B', arrivee: '07:00', defaut: 'niveleur', ok: 'cale', sortie: ['ar-vag', 'ar-vag', 'agri-kerlann', 'ar-vag'],
    cases: { P4: 'AV1', P3: 'AV2', P2: 'AK1', P1: 'AV3' }, prep: { heure: '7 h 00', quai: 'B', palettes: '2' },
    rapp: { 'recues-ar-vag': '3', 'resultat-ar-vag': 'trop', 'recues-agri-kerlann': '1', 'resultat-agri-kerlann': 'conforme', 'feuille-juste': 'juste', 'feuille-corriger': 'rien' },
    ecart: 'Ar Vag : 1 palette de plus que l’annonce.', recu: '4 palettes : 3 Ar Vag, 1 Agri-Kerlann, triées en zone de réception.',
    feuilleLignes: [['Biscuiterie Ar Vag', '3', '120 cartons', 'signé'], ['Agri-Kerlann', '1', '40 sacs', 'signé']], annonces: [/ce jour 2 palettes de biscuits.*\(80 cartons\)/, /ce jour 1 palette de terreau/] },
  feuille: { uid: 't108-2', heure: '7 h 30', quai: 'A', arrivee: '07:30', defaut: 'cabine', ok: 'lampe', sortie: ['ar-vag', 'ar-vag', 'agri-kerlann', 'agri-kerlann'],
    cases: { P4: 'AV1', P3: 'AV2', P2: 'AK1', P1: 'AK2' }, prep: { heure: '7 h 30', quai: 'A', palettes: '2' },
    rapp: { 'recues-ar-vag': '2', 'resultat-ar-vag': 'conforme', 'recues-agri-kerlann': '2', 'resultat-agri-kerlann': 'conforme', 'feuille-juste': 'agri-kerlann>ar-vag', 'feuille-corriger': 'loic' },
    ecart: 'La feuille de ramasse se trompe : une palette d’Agri-Kerlann est notée chez Ar Vag.', recu: '4 palettes : 2 Ar Vag, 2 Agri-Kerlann, triées en zone de réception.',
    feuilleLignes: [['Biscuiterie Ar Vag', '3', '120 cartons', 'signé'], ['Agri-Kerlann', '1', '40 sacs', 'signé']], annonces: [/ce jour 2 palettes de biscuits/, /ce jour 2 palettes de terreau/] },
  feuille2: { uid: 't108-18', heure: '7 h 00', quai: 'B', arrivee: '07:00', defaut: 'cabine', ok: 'cale', sortie: ['ar-vag', 'agri-kerlann', 'agri-kerlann', 'ar-vag'],
    cases: { P4: 'AV1', P3: 'AK1', P2: 'AK2', P1: 'AV2' }, prep: { heure: '7 h 00', quai: 'B', palettes: '2' },
    rapp: { 'recues-ar-vag': '2', 'resultat-ar-vag': 'conforme', 'recues-agri-kerlann': '2', 'resultat-agri-kerlann': 'conforme', 'feuille-juste': 'ar-vag>agri-kerlann', 'feuille-corriger': 'loic' },
    ecart: 'La feuille de ramasse se trompe : une palette d’Ar Vag est notée chez Agri-Kerlann.', recu: '4 palettes : 2 Ar Vag, 2 Agri-Kerlann, triées en zone de réception.',
    feuilleLignes: [['Biscuiterie Ar Vag', '1', '40 cartons', 'signé'], ['Agri-Kerlann', '3', '120 sacs', 'signé']], annonces: [/ce jour 2 palettes de biscuits/, /ce jour 2 palettes de terreau/] },
};
const JALONS = ['preparer-heure', 'preparer-quai', 'preparer-palettes', 'accueil-feuille', 'accueil-regles', 'securite-defaut', 'securite-aucun-faux',
  'depose-P1', 'depose-P2', 'depose-P3', 'depose-P4', 'rapprocher-recues-ar-vag', 'rapprocher-recues-agri-kerlann', 'rapprocher-resultat-ar-vag',
  'rapprocher-resultat-agri-kerlann', 'cr-ecart', 'cr-salutation', 'cr-fin'];
const POIDS = [2 / 3, 2 / 3, 2 / 3, 1, 1, 2, 1, 1, 1, 1, 1, 0.75, 0.75, 0.75, 0.75, 1.5, 0.25, 0.25];
const GROUPES = ['Préparer', 'Accueillir Loïc', 'Avant de décharger', 'Trier par client', 'Rapprocher', 'Rendre compte'];

// Le menu ne se redessine qu'au changement d'écran : comme l'élève, on passe par la Messagerie.
const allerV = async (vue) => { if (!(await present(`.ent-nav[data-vue="${vue}"]`))) await aller('mail'); await aller(vue); };
const confirmer = async () => { await pg.waitForSelector(`${Z} [data-confirme-oui]`, { timeout: 1500 }).catch(() => {}); if (await present('[data-confirme-oui]')) { await pg.click(`${Z} [data-confirme-oui]`); await pause(); } };   // `pg.click` attend que la bulle de confirmation soit immobile (un clic à la souris, au centre d'une bulle qui bouge encore, la rate)
// ① Préparer.
async function preparer(vals) {
  await allerV('fiche');
  for (const [c, x] of Object.entries(vals)) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, x); await pause(30); }
  await clic('[data-fiche-envoyer]'); await confirmer();
}
// ② Accueillir Loïc : en évaluation, la première réponse fait avancer et compte.
const dire = async (val) => { await clic(`[data-dlg-choix="${val}"]`); await pause(); };
async function accueil(rep = DIAL) {
  await allerV('telephone');
  await clic(`[data-dlg-appeler="${DID}"]`); await pause();
  for (const r of ['feuille', 'regles']) await dire(rep[r]);
  await clic('[data-dlg-raccrocher]'); await pause();
}
// ③ Le quai : l'inspection (`envois` : les objets marqués à chaque « Signaler »), « C'est bon », puis la dépose (`depose` : pour chaque palette, LA case cliquée).
async function quai(K, o = {}) {
  await allerV('quai');
  await pg.waitForSelector(QA.SVG);
  if (o.avantInspection) await o.avantInspection();
  for (const ids of (o.envois || [[K.defaut]])) { for (const id of ids) await QA.marquer(id); await QA.signaler(); }
  if (o.avant) await o.avant();
  await QA.cestBon();
  if (o.apresBon) await o.apresBon();
  await QA.decharger();
  for (const pal of SORTIE) {
    const c = (o.depose && o.depose[pal]) || K.cases[pal];
    if (o.pendant) await o.pendant(pal, c);
    const n = await QA.posees();
    await QA.deposer(c);
    egal(await QA.posees(), n + 1, `${pal} : la case ${c} pose la palette au premier clic`);
  }
  await pause();
}
// ④ Rapprocher (la fiche arrive avec le message d'Erwan).
async function rapprocher(vals) {
  await P.ouvrirParMessage('Les palettes sont triées', `fiche:${FR}`);
  for (const [c, x] of Object.entries(vals)) { await pg.selectOption(`${Z} [data-fiche-champ="${c}"]`, x); await pause(30); }
  await clic('[data-fiche-envoyer]'); await confirmer();
}
// ⑤ Rendre compte à Maëlys (phrases à choisir).
async function ouvrirMail(sujet) {
  await allerV('mail');
  await pg.click(`${Z} [data-dossier="in"]`);
  await pg.click(`${Z} .ent-obj:text-is("${sujet}")`);
  await pause();
}
async function compteRendu(lignes) {
  await ouvrirMail('Alors, la ramasse ?');
  await pg.click(`${Z} [data-repondre]`);
  await pg.waitForSelector(`${Z} #formPhr:not([hidden])`);
  for (const [l, t] of Object.entries(lignes)) { await pg.selectOption(`${Z} [data-phrase="${l}"]`, { label: t }); await pause(30); }
  await pg.click(`${Z} #formPhr button[type="submit"]`); await confirmer();
  await pg.waitForFunction(() => (window.__f.db.mails || []).some((m) => m.folder === 'out' && m.phrases), null, { timeout: 4000 });
}
const crJuste = (K) => ({ salutation: SALUT, ecart: K.ecart, fin: FIN });
async function parcours(K, o = {}) {
  await preparer(o.prep || K.prep);
  await accueil(o.dial);
  await quai(K, o);
  await rapprocher(o.rapp || K.rapp);
  await compteRendu(o.cr || crJuste(K));
}
async function rendre() {
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.click(`${Z} [data-copie-rendre]`);
  await pg.waitForFunction(() => window.__f.copies.length === 1);
  await pause();
  return pg.evaluate(() => window.__f.copies[0]);
}
// Les jalons KO d'une note (ids), les jalons du socle seulement.
const ko = (n) => JALONS.filter((j) => n.detail[j] !== 'ok');

// ─────────────────────────────────────────────────────────── la déclaration, le registre et le jeu figé
await v('ENT-10.8 : la séance se charge (CAP, CAP-C1.3, évaluation, copie, sans parcours ni correction ni niveau) ; poids 16 + ouverture 4 = 20 jalon par jalon écrit à la main ; AUCUNE question au fil ; au registre sous l’entreprise n° 10 ; fermée aux élèves tant que l’enseignant ne l’a pas cochée', async () => {
  const r = await pg.evaluate(async (ID) => {
    const A = await import('/activites/pelleau-evaluation-reception.js');
    const S = await import('/contenus/pelleau-ent108.js');
    const Q = await import('/contenus/questions/ENT-10.8.js');
    const D = await import('/contenus/pelleau-ent108-donnees.js');
    const I = await import('/activites/index.js');
    const N = await import('/core/niveaux.js');
    const charges = await I.chargerActivites();
    const m = A.meta;
    return { meta: m, noter: typeof A.noter, ids: S.ETAPES.map((e) => e.id), poids: S.ETAPES.map((e) => e.poids), somme: S.ETAPES.reduce((t, e) => t + (e.poids || 0), 0),
      part: Q.QUESTIONS.part, partOuv: Q.QUESTIONS.ouverture.part, types: [...new Set(Q.QUESTIONS.liste.map((q) => q.type))], nbQ: Q.QUESTIONS.liste.length,
      groupes: [...new Set(S.ETAPES.map((e) => e.groupe))], sansEcran: S.ETAPES.filter((e) => !e.ecran).map((e) => e.id), bonus: S.ETAPES.filter((e) => e.bonus).length,
      quai: (({ rendCopie, aides, arret }) => ({ rendCopie, aides, arret: arret && arret.etape }))(D.quaiDe('x')),
      auRegistre: charges.some((a) => a.meta.id === ID), echecs: (I.activitesEnEchec ? I.activitesEnEchec() : []).map((e) => e.fichier || String(e)).filter((f) => /pelleau/.test(f)),
      entreprise: (I.ENTREPRISES.find((e) => e.n === 10) || {}).nom,
      cap: N.activiteVisible(m, { niveau: 'cap' }), coche: N.activiteVisible(m, { niveau: 'cap', ouverts: { [ID]: true } }), autre: N.activiteVisible(m, { niveau: '1re', ouverts: {} }) };
  }, ID);
  const m = r.meta;
  egal([m.code, m.niveaux, m.competences, m.competencesCap, m.temps, m.bareme, m.copie, m.questions, m.pret, m.ouverture, m.corrige, m.rubrique],
    ['ENT-10.8', ['cap'], [], ['CAP-C1.3'], 'evaluation', 20, true, 'ENT-10.8', true, 'prof', './contenus/corriges/ENT-10.8.js', 'simulog'], 'meta');
  egal([m.parcours, m.correction, m.niveauxPrevus, m.precedente], [undefined, undefined, undefined, undefined], 'ni parcours, ni correction, ni niveau (comme ENT-8.6 et 8.10)');
  egal(r.noter, 'function', 'export noter');
  egal(r.ids, JALONS, 'jalons');
  egal(r.poids, POIDS, 'poids jalon par jalon (écrits à la main)');
  proche(r.somme + r.part, 20, 'somme des jalons et de la part de l’ouverture');
  egal([r.part, r.partOuv, r.types, r.nbQ, r.bonus], [4, 4, ['ouverture'], 8, 0], 'ouverture notée 4, uniquement des questions d’ouverture, aucun bonus');
  egal(r.groupes, GROUPES, 'lignes du bandeau');
  egal(r.sansEcran, ['accueil-feuille', 'accueil-regles', 'securite-defaut', 'securite-aucun-faux', 'depose-P1', 'depose-P2', 'depose-P3', 'depose-P4'],
    'ni le dialogue ni le quai ne se rouvrent');
  egal(r.quai, { rendCopie: false, aides: {}, arret: 'dechargement' }, 'le quai : rendCopie false, aides éteintes, il s’arrête au déchargement');
  egal([r.auRegistre, r.echecs, r.entreprise], [true, [], 'Transports Pelleau'], 'au registre, sans échec');
  egal([r.cap, r.coche, r.autre], [false, true, false], 'fermée, puis ouverte par l’enseignant ; jamais hors CAP');
});

await v('ENT-10.8 : jeu figé — le camion de t108-1, t108-4, t108-12, t108-2 et t108-18 est celui écrit à la main (la formule du tirage ne change pas sous les élèves) ; son quai : 8 cases, un défaut et un point en ordre, l’autre quai nommé', async () => {
  const r = await pg.evaluate(async (g) => {
    const D = await import('/contenus/pelleau-ent108-donnees.js');
    return g.map((x) => {
      const j = D.jeuDe(x), q = D.quaiDe(x);
      return { j, cases: q.depose.cases.map((c) => [c.id, c.client || c.sol || null]), nomAutre: q.depose.cases[7].nom, lieu: q.lieu.nom, arrivee: q.camions[0].arrivee,
        points: q.securite.points.map((p) => [p.id, p.ok, p.etat]), palettes: q.camions[0].palettes.map((p) => [p.id, p.client]), libelle: q.libelle, arret: q.arret.texte };
    });
  }, Object.values(CAMIONS).map((K) => K.uid));
  const K = Object.values(CAMIONS);
  egal(r.map((x) => [x.j.grille, x.j.sortie, x.j.defaut, x.j.ok, x.j.ecart, x.j.clientEcart, x.j.clientPrep]), [
    [0, K[0].sortie, 'niveleur', 'lampe', 'aucun', null, 'ar-vag'],
    [0, K[1].sortie, 'niveleur', 'lampe', 'moins', 'agri-kerlann', 'agri-kerlann'],
    [1, K[2].sortie, 'niveleur', 'cale', 'plus', 'ar-vag', 'ar-vag'],
    [0, K[3].sortie, 'cabine', 'lampe', 'feuille', 'agri-kerlann', 'ar-vag'],
    [1, K[4].sortie, 'cabine', 'cale', 'feuille', 'ar-vag', 'agri-kerlann']], 'jeu de chaque graine');
  egal(r[0].cases, [['allee-1', 'pieton'], ['AV1', 'ar-vag'], ['AV2', 'ar-vag'], ['AV3', 'ar-vag'], ['AK1', 'agri-kerlann'], ['AK2', 'agri-kerlann'], ['AK3', 'agri-kerlann'],
    ['autre-quai-1', 'autre-quai']], '8 cases');
  egal(r.map((x) => [x.lieu, x.arrivee, x.nomAutre, x.libelle]), [['Quai A', '07:30', 'Devant le quai B', 'Le quai'], ['Quai A', '07:30', 'Devant le quai B', 'Le quai'],
    ['Quai B', '07:00', 'Devant le quai A', 'Le quai'], ['Quai A', '07:30', 'Devant le quai B', 'Le quai'], ['Quai B', '07:00', 'Devant le quai A', 'Le quai']],
  'quai et heure du planning ; la case « devant l’autre quai » ; le menu ne dit pas le quai');
  egal(r[0].points, [['niveleur', false, 'releve'], ['lampe', true, 'allumee']], 'points de t108-1 (niveleur relevé, lampe en ordre)');
  egal(r[2].points, [['cale', true, 'posee'], ['niveleur', false, 'releve']], 'points de t108-12 (niveleur relevé, cale en ordre)');
  egal(r[3].points, [['cabine', false, 'conduite'], ['lampe', true, 'allumee']], 'points de t108-2 (Loïc au volant)');
  egal(r[2].palettes, [['P1', 'ar-vag'], ['P2', 'agri-kerlann'], ['P3', 'ar-vag'], ['P4', 'ar-vag']], 'palettes de t108-12 dans le camion (elles sortent P4, P3, P2, P1)');
  egal(r.map((x) => x.arret), Array(5).fill('Les 4 palettes sont triées par client.'), 'texte de l’arrêt : jamais l’écart');
});

await v('ENT-10.8 : tirage sur 300 graines — écart à un quart chacun (aucun · il en manque · il y en a trop · feuille), planning 1 et 2, répartition et défauts équilibrés, EXACTEMENT 1 défaut, 4 palettes, au plus 1 écart, une feuille fausse touche toujours deux lignes (+1 / −1) et jamais les annonces, cases suffisantes par client (verifierQuai), zéro jeu de secours', async () => {
  const r = await pg.evaluate(async () => {
    const Q = await import('/core/types/quai.js');
    const D = await import('/contenus/pelleau-ent108-donnees.js');
    const c = { rep: {}, ecart: {}, defaut: {}, ok: {}, grille: {}, prep: {}, secours: 0, ordres: new Set(), quai: [], fautes: [], sensFeuille: {} };
    const inc = (o, k) => { o[k] = (o[k] || 0) + 1; };
    for (let i = 0; i < 300; i++) {
      const g = `eleve-${i}`, j = D.jeuDe(g);
      inc(c.rep, j.repartition); inc(c.ecart, j.ecart); inc(c.defaut, j.defaut); inc(c.ok, j.ok); inc(c.grille, j.grille); inc(c.prep, j.clientPrep);
      if (D.jeuDeSecours(g)) c.secours++;
      c.ordres.add(j.sortie.join(','));
      const n = D.comptesDe(j), a = D.annoncesDe(j), f = D.feuilleDe(j), q = D.quaiDe(g);
      const surAnnonce = D.CLIENTS_108.filter((x) => a[x] !== n[x]).length, surFeuille = D.CLIENTS_108.filter((x) => f[x] !== n[x]).length;
      if (surAnnonce + (j.ecart === 'feuille' ? 1 : surFeuille) > 1) c.fautes.push([g, 'plus d’un écart']);
      if (j.ecart === 'feuille' && !(surFeuille === 2 && surAnnonce === 0)) c.fautes.push([g, 'feuille mal formée']);
      if (j.ecart !== 'feuille' && surFeuille) c.fautes.push([g, 'feuille fausse hors du cas feuille']);
      if (j.ecart === 'feuille') inc(c.sensFeuille, j.clientEcart);
      if (D.CLIENTS_108.some((x) => a[x] < 1 || f[x] < 1 || n[x] < 1)) c.fautes.push([g, 'une ligne à zéro']);
      if (q.securite.points.filter((p) => !p.ok).length !== 1 || q.securite.points.filter((p) => p.ok).length !== 1) c.fautes.push([g, 'pas exactement 1 défaut et 1 point en ordre']);
      if (q.camions[0].palettes.length !== 4) c.fautes.push([g, 'pas 4 palettes']);
      const e = Q.verifierQuai(q);
      if (e.length) c.quai.push([g, e]);
    }
    return { ...c, ordres: c.ordres.size };
  });
  egal(r.quai, [], 'verifierQuai sur 300 graines');
  egal(r.fautes, [], 'équité : exactement un défaut, 4 palettes, au plus un écart, feuille bien formée');
  egal(r.secours, 0, 'jeu de secours');
  vrai(['aucun', 'moins', 'plus', 'feuille'].every((e) => r.ecart[e] >= 45 && r.ecart[e] <= 105), 'écart déséquilibré (un quart chacun attendu) : ' + JSON.stringify(r.ecart));
  vrai(r.grille[0] >= 110 && r.grille[1] >= 110, 'planning déséquilibré : ' + JSON.stringify(r.grille));
  vrai(r.rep['2+2'] >= 110 && r.rep['3+1'] >= 110, 'répartition déséquilibrée : ' + JSON.stringify(r.rep));
  vrai(r.prep['ar-vag'] >= 110 && r.prep['agri-kerlann'] >= 110, 'client de « Préparer » déséquilibré : ' + JSON.stringify(r.prep));
  vrai(['cabine', 'cale', 'niveleur', 'lampe'].every((d) => r.defaut[d] >= 45 && r.defaut[d] <= 105 && r.ok[d] >= 45), 'défauts déséquilibrés : ' + JSON.stringify([r.defaut, r.ok]));
  vrai(r.sensFeuille['ar-vag'] > 10 && r.sensFeuille['agri-kerlann'] > 10, 'les deux sens de l’erreur de feuille : ' + JSON.stringify(r.sensFeuille));
  vrai(r.ordres >= 9, 'ordres de sortie trop peu variés : ' + r.ordres);
});

await v('ENT-10.8 : tirage stable par graine et différent d’un élève à l’autre — le même jeu et le même quai à chaque appel (les mêmes objets), au moins 20 jeux distincts sur 60 élèves, deux élèves voisins ne se ressemblent pas tous', async () => {
  const r = await pg.evaluate(async () => {
    const D = await import('/contenus/pelleau-ent108-donnees.js');
    const stable = ['t108-1', 'zoé', 'eleve-17'].every((g) => D.jeuDe(g) === D.jeuDe(g) && D.quaiDe(g) === D.quaiDe(g) && JSON.stringify(D.jeuDe(g)) === JSON.stringify(D.jeuDe(g)));
    const jeux = new Set(), voisins = [];
    for (let i = 0; i < 60; i++) { jeux.add(JSON.stringify(D.jeuDe(`el-${i}`))); voisins.push(JSON.stringify(D.jeuDe(`el-${i}`)) === JSON.stringify(D.jeuDe(`el-${i + 1}`))); }
    return { stable, distincts: jeux.size, voisinsPareils: voisins.filter(Boolean).length, vide: D.jeuDe('') === D.jeuDe(undefined) };
  });
  vrai(r.stable, 'un jeu change d’un appel à l’autre');
  vrai(r.distincts >= 20, 'trop peu de jeux distincts : ' + r.distincts);
  vrai(r.voisinsPareils <= 6, 'élèves voisins trop souvent identiques : ' + r.voisinsPareils);
  vrai(r.vide, 'la base vide (enseignant) n’a pas un jeu qui change');
});

// ─────────────────────────────────────────────────────────── le contenu (hors écran)
await v('ENT-10.8 : contenu — planning (une seule case « Loïc », l’heure et le quai du quai en viennent), feuille de ramasse et annonces CALCULÉES du camion de chacun (5 graines à la main) ; la feuille ne porte NI total NI observation ; aucun jour de la semaine, pied imposé sur chaque document ; AUCUN texte (document, message, consigne, légende) ne dit l’écart', async () => {
  const r = await pg.evaluate(async (graines) => {
    const D = await import('/contenus/pelleau-ent108-donnees.js');
    const C = await import('/contenus/pelleau-ent108.js');
    const U = await import('/contenus/pelleau.js');
    const lire = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d; };
    const txt = (html) => lire(html).textContent.replace(/\s+/g, ' ');
    const sortie = {};
    for (const [nom, g] of graines) {
      const db = { tirage: { graine: g }, volets: {} }, jeu = D.jeuDe(g);
      const plan = lire(C.DOC_PLANNING.html(db));
      const cellules = [...plan.querySelectorAll('tbody td')].map((td) => td.textContent.trim());
      const colonnes = [...plan.querySelectorAll('thead th')].map((th) => th.textContent.trim());
      const rangLoic = [...plan.querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((td) => td.textContent.trim())).find((tr) => tr.some((c) => /Loïc/.test(c)));
      const mails = [C.VOLET.semer('Lea', db).mails[0]];
      for (const d of C.VOLET.declencheurs) { const m = d.semer('Lea', db); mails.push(...m.mails); }
      const quai = D.quaiDe(g);
      sortie[nom] = {
        colonnes, nbLoic: cellules.filter((c) => /Loïc/.test(c)).length, rangLoic,
        lignes: [...lire(C.DOC_FEUILLE.html(db)).querySelectorAll('tbody tr')].map((tr) => [...tr.children].map((td) => td.textContent.trim())),
        entetesFeuille: [...lire(C.DOC_FEUILLE.html(db)).querySelectorAll('thead th')].map((th) => th.textContent.trim()),
        annonces: C.DOCS_ANNONCES.map((d) => txt(d.html(db))),
        resultats: D.CLIENTS_108.map((c) => D.resultat(jeu, c)), recu: D.ligneRecu(jeu), ecart: D.choixEcart(jeu),
        arret: quai.arret.texte, preparer: D.LIGNES_PREPARER.map((l) => l.juste(jeu)), labelPrep: D.LIGNES_PREPARER[2].lib(jeu),
        feuilleJuste: D.feuilleJuste(jeu), correction: D.correctionJuste(jeu),
        // tout ce qui est lisible AVANT « Rapprocher » : documents, messages, consigne de la scène, parole de Loïc, textes du dialogue, libellés de « Préparer »
        avant: [txt(C.DOC_PLANNING.html(db)), txt(C.DOC_FEUILLE.html(db)), ...C.DOCS_ANNONCES.map((d) => txt(d.html(db))), txt(C.DOC_REGLES.html), txt(C.DOC_MATINEE.html), txt(C.DOC_ETIQUETTE.html),
          ...mails.filter((m) => m.subject !== 'Alors, la ramasse ?').map((m) => `${m.subject} ${m.text}`), quai.securite.consigne, quai.camions[0].parole, quai.arret.texte,
          C.SITUATION_ACCUEIL, ...D.REPLIQUES.flatMap((x) => [x.dit, ...x.choix.map((c) => c.lib)]), ...D.LIGNES_PREPARER.map((l) => (typeof l.lib === 'function' ? l.lib(jeu) : l.lib)),
          ...C.FICHE_PREPARER.blocs(db).flatMap((b) => [b.lib, b.manque])],
        tout: [...C.DOCUMENTS.map((d) => txt(typeof d.html === 'function' ? d.html(db) : d.html)), ...mails.map((m) => `${m.subject} ${m.text}`)],
        matinee: txt(C.DOC_MATINEE.html), ids: C.DOCUMENTS.map((d) => d.id), heureMail: mails.map((m) => new Date(m.ts).getFullYear()),
      };
    }
    return { sortie, pied: U.PIED };
  }, [['aucun', 't108-1'], ['moins', 't108-4'], ['plus', 't108-12'], ['feuille', 't108-2'], ['feuille2', 't108-18']]);
  for (const [k, K] of Object.entries(CAMIONS)) {
    const s = r.sortie[k];
    egal(s.colonnes, ['Heure', 'Quai A', 'Quai B'], `planning : colonnes (${k})`);
    egal([s.nbLoic, s.rangLoic[0], s.rangLoic.indexOf(s.rangLoic.find((c) => /Loïc/.test(c)))], [1, K.heure, K.quai === 'A' ? 1 : 2], `planning : une seule case « Loïc », à ${K.heure} au quai ${K.quai} (${k})`);
    egal(s.lignes, K.feuilleLignes, `feuille de ramasse (${k})`);
    egal(s.entetesFeuille, ['Expéditeur', 'Palettes', 'Colis', 'Signature du client'], `feuille : colonnes, ni observation ni total (${k})`);
    K.annonces.forEach((re, i) => vrai(re.test(s.annonces[i]), `annonce ${i} (${k}) : ${s.annonces[i]}`));
    egal(s.recu, K.recu, `ligne « reçu » imposée (${k})`);
    egal(s.ecart[0], K.ecart, `phrase juste (${k})`);
    egal(s.preparer, [K.heure, K.quai, K.prep.palettes], `réponses de « Préparer » (${k})`);
    egal([s.feuilleJuste, s.correction], [K.rapp['feuille-juste'], K.rapp['feuille-corriger']], `la feuille et sa correction (${k})`);
    egal(s.resultats, [K.rapp['resultat-ar-vag'], K.rapp['resultat-agri-kerlann']], `résultats contre les annonces (${k})`);
    vrai(new Set(s.ecart).size === 4, `quatre phrases distinctes (${k}) : ` + s.ecart);
    vrai(!/\btotal\b/i.test(s.lignes.flat().join(' ')), `la feuille donne un total (${k})`);
    egal(s.arret, 'Les 4 palettes sont triées par client.', `arrêt du quai (${k})`);
    const dit = s.avant.filter((t) => DIT_ECART.test(t));
    egal(dit, [], `un texte lisible avant « Rapprocher » dit l’écart (${k}) : ${dit.map((t) => t.match(DIT_ECART)[0])}`);
    egal(s.tout.filter((t) => JOURS.test(t)).length, 0, `un jour de la semaine dans un document ou un message (${k})`);
    vrai(s.heureMail.every((a) => a === 2026), `année des messages (${k})`);
    vrai(!/\b\d{1,2} h\b|\d{1,2}:\d{2}/.test(s.matinee), `« Ta matinée » (lue à « Avant de commencer ») donne une heure : la ligne « heure » de « Préparer » se lirait là (${k})`);
  }
  egal(r.sortie.aucun.labelPrep, 'Combien de palettes Ar Vag annonce-t-il ?', 'la ligne « Préparer » nomme le client tiré (aucun)');
  egal(r.sortie.moins.labelPrep, 'Combien de palettes Agri-Kerlann annonce-t-il ?', 'la ligne « Préparer » nomme le client tiré (moins)');
});

await v('ENT-10.8 : pied imposé sur chaque document ; les mêmes choix pour TOUS (la forme ne trahit pas le jeu) — les quatre phrases de l’écart sont toujours « conforme · moins · plus · la feuille se trompe », la fiche « Rapprocher » a les mêmes champs et les mêmes options pour les quatre écarts', async () => {
  const r = await pg.evaluate(async (graines) => {
    const D = await import('/contenus/pelleau-ent108-donnees.js');
    const C = await import('/contenus/pelleau-ent108.js');
    const U = await import('/contenus/pelleau.js');
    const lire = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent.replace(/\s+/g, ' '); };
    const sorte = (t) => (/^Tout est conforme/.test(t) ? 'conforme' : /de moins/.test(t) ? 'moins' : /de plus/.test(t) ? 'plus' : /feuille de ramasse se trompe/.test(t) ? 'feuille' : '?');
    const sortes = graines.map((g) => D.choixEcart(D.jeuDe(g)).map(sorte));
    const champs = (db) => JSON.stringify(C.FICHE_RAPPROCHER.blocs.flatMap((b) => (b.blocs || [b]).map((x) => [x.id, x.choix.map((c) => c.v)])));
    const db0 = { tirage: { graine: 't108-2' } };
    return { sortes, champs: graines.map((g) => champs({ tirage: { graine: g } })), docs: C.DOCUMENTS.map((d) => [d.id, lire(typeof d.html === 'function' ? d.html(db0) : d.html)]), pied: U.PIED };
  }, Object.values(CAMIONS).map((K) => K.uid));
  egal(r.sortes.map((s) => s.slice().sort().join()), Array(5).fill('conforme,feuille,moins,plus'), 'les quatre sortes de phrases, pour chaque écart');
  egal(r.sortes.map((s) => s[0]), ['conforme', 'moins', 'plus', 'feuille', 'feuille'], 'et la juste est la première (ordre déclaré, le moteur mélange)');
  egal(new Set(r.champs).size, 1, 'les champs et options de « Rapprocher » sont les mêmes pour tous');
  vrai(r.champs[0].includes('feuille-corriger') && r.champs[0].includes('"juste"'), 'les lignes de la feuille sont dans la fiche de tous');
  egal(r.docs.filter(([id, t]) => id !== 'droit-depot' && !t.includes(r.pied.split('.')[0])).map(([id]) => id), [], 'pied « Document pédagogique » manquant');
});

// ─────────────────────────────────────────────────────────── l'ouverture, l'inaction
await v('ENT-10.8 : « Avant de commencer » — 4 questions tirées (3 de préparation + 1 image), « Je ne sais pas » en dernier, AUCUNE aide ni mot cliquable ni mot qui juge ; barème : 4 justes = 4, 3 + « Je ne sais pas » = 3, 3 + 1 fausse = 2,5, tout faux = 0 ; rien au Suivi', async () => {
  const db = await monter({ uid: 't108-1', sansOuverture: true });
  const ids = db.questions[ID]['@tirage'].ids;
  egal([ids.length, ids.filter((x) => /^img-/.test(x)).length], [4, 1], 'questions tirées');
  vrai(ids.every((i) => Object.keys(OUV).includes(i)), 'ids de la banque : ' + ids);
  await capture('0-avant-de-commencer');
  const choix = await pg.$$eval(`${Z} [data-q-choix]`, (L) => L.map((b) => b.textContent.trim()));
  egal(choix[choix.length - 1], 'Je ne sais pas', '« Je ne sais pas » en dernier');
  vrai(!(await present('[data-ouv-aide]')) && !(await present('details')), 'une aide à l’écran');
  vrai(!/\[\[|\]\]/.test(await texte()), 'des crochets de mot cliquable à l’écran');
  for (let k = 0; k < 4; k++) {
    const id = await pg.$eval(`${Z} [data-q-repondre]`, (b) => b.dataset.qRepondre);
    await pg.click(`${Z} [data-q-choix="${k === 3 ? '@nsp' : OUV[id]}"][data-q="${id}"]`);
    await pg.click(`${Z} [data-q-repondre="${id}"]`); await pause();
    const t = await pg.$eval(`${Z} [data-ouverture]`, (e) => e.textContent.replace(/\s+/g, ' '));
    vrai(!/\b(bravo|bien vu|bonne réponse|mauvaise réponse|c’est juste|c’est faux)\b/i.test(t), 'une phrase qui juge à l’ouverture : ' + t.slice(0, 300));
    if (k < 3) await pg.click(`${Z} [data-cle="suivante"]`);
  }
  await pg.click(`${Z} [data-ouv-continuer]`); await pause();
  proche((await noter()).score, 3, '3 justes + « Je ne sais pas »');
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
  const pts = async (rep) => { await monter({ uid: 't108-1', rep: { ...OUV, ...rep } }); return (await noter()).score; };
  const prep = ids.find((x) => !/^img-/.test(x));
  proche(await pts({}), 4, 'quatre justes');
  proche(await pts({ [prep]: '@nsp' }), 3, 'trois justes + « Je ne sais pas »');
  proche(await pts({ [prep]: OUV_FAUSSES[prep] }), 2.5, `trois justes + une fausse (${prep}, − 1 ÷ 2)`);
  proche(await pts(OUV_FAUSSES), 0, 'tout faux (plancher 0)');
});

await v('ENT-10.8 : inaction — rien fait (ouverture sans réponse, aucun écran) → 0/20, aucun jalon juste (même chez un élève dont le camion est « sans écart »), copie vide rendue → 0 ; à l’ouverture un seul message de Maëlys, « Au quai » et le quai fermés, le menu ne dit pas le quai', async () => {
  for (const k of ['aucun', 'moins', 'plus', 'feuille']) {
    await monter({ uid: CAMIONS[k].uid, sansOuverture: true });
    const n = await noter();
    egal([n.score, n.max], [0, 20], 'note ' + k);
    egal(JALONS.filter((j) => n.detail[j] === 'ok'), [], `jalons justes sans rien faire (${k})`);
  }
  await monter({ uid: CAMIONS.aucun.uid });
  const n = await noter();
  egal([n.score, n.max], [4, 20], 'ouverture juste seule : 4 sur 20, aucun jalon');
  egal(JALONS.filter((j) => n.detail[j] === 'ok'), [], 'jalons justes sans rien faire, ouverture répondue');
  const E = await entrants();
  egal(E.map((m) => [m.from, m.subject, m.pieces, m.ouvreFiche]), [['Maëlys', 'La ramasse de Loïc', ['planning-108', 'feuille-ramasse-108', 'annonce-ar-vag-108', 'annonce-agri-kerlann-108'], FP]], 'messages à l’ouverture');
  const d = new Date(E[0].ts);
  egal([d.getFullYear(), d.getMonth(), d.getDate()], [2026, 4, 19], 'date du message : 19 mai 2026');
  const M = await P.menu();
  vrai(M.includes('fermee:telephone') && M.includes('fermee:quai') && !M.includes(`fiche:${FR}`), 'menu au départ : ' + M.join(', '));
  const lib = await pg.$$eval(`${Z} .ent-nav`, (L) => L.map((b) => b.textContent.trim()).join(' | '));
  vrai(!/quai [AB]\b/i.test(lib), 'le menu dit le quai avant « Préparer » : ' + lib);
  await capture('1-accueil');
  egal((await rendre()).score, 4, 'copie vide rendue : l’ouverture seule compte');
  await monter({ uid: CAMIONS.aucun.uid, sansOuverture: true });
  egal((await rendre()).score, 0, 'copie vraiment vide rendue → 0');
});

// ─────────────────────────────────────────────────────────── les jalons sans écran (bases fabriquées)
// `d.graine` : l'élève ; `d.prep`, `d.rapp` : fiches envoyées ; `d.dial` : premières réponses de l'appel fini ; `d.sec` : l'inspection figée ; `d.depose` :
// { palette: premier clic } (en copie le premier clic pose) ; `d.cr` : { ligne: rang choisi } de la réponse par phrases.
const jalonsSans = (d) => pg.evaluate(async ({ d, QID, DID, FP, FR }) => {
  const S = await import('/contenus/pelleau-ent108.js');
  const db = { fiches: {}, quais: {}, mails: [], tirage: { graine: d.graine } };
  if (d.prep) db.fiches[FP] = { valeurs: d.prep, envoye: { at: 1 } };
  if (d.rapp) db.fiches[FR] = { valeurs: d.rapp, envoye: { at: 1 } };
  if (d.dial) db.dialogues = { 'pelleau-evaluation-reception': { [DID]: { appels: [{ debut: 1, fin: 2, pas: Object.entries(d.dial).map(([r, v], i) => ({ r, v, at: i })), reprises: 0 }] } } };
  if (d.sec || d.depose) {
    const q = db.quais[QID] = { depose: {} };
    if (d.sec) q.securite = { mode: 'scene', marques: [], compteur: 0, ouverte: true, arrete: false, chef: '', signaux: d.sec.signaux || [], fait: d.sec.fait !== false };
    if (d.depose) {
      for (const [p, c] of Object.entries(d.depose)) q.depose[p] = { premier: c, essais: [c], pose: c };
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
const juste = (K) => ({ graine: K.uid, prep: K.prep, dial: DIAL, depose: { ...K.cases }, rapp: K.rapp,
  sec: { signaux: [{ points: [K.defaut], rien: 0, marques: [1], apresArret: false }] }, cr: { salutation: 0, ecart: 0, fin: 0 } });

await v('ENT-10.8 : jalons sans écran — rien : tout « à faire » ; juste : tout ✓ (les cinq camions, dont les deux sens de l’erreur de feuille) ; chaque faute ne fait tomber que SON jalon ; une palette posée chez l’autre client = SA palette fausse', async () => {
  for (const [k, K] of Object.entries(CAMIONS)) {
    const vide = await jalonsSans({ graine: K.uid });
    egal(JALONS.map((j) => vide[j]), JALONS.map(() => 'attente'), 'rien fait ' + k);
    const s = await jalonsSans(juste(K));
    egal(JALONS.filter((j) => s[j] !== 'ok'), [], 'parcours juste ' + k);
  }
  const fautes = async (K, f) => { const d = JSON.parse(JSON.stringify(juste(K))); f(d); const x = await jalonsSans(d); return JALONS.filter((j) => x[j] !== 'ok'); };
  const A = CAMIONS.aucun, M = CAMIONS.moins, F = CAMIONS.feuille;
  egal(await fautes(A, (d) => { d.prep.heure = '8 h 00'; }), ['preparer-heure'], 'heure du planning fausse');
  egal(await fautes(A, (d) => { d.prep.quai = 'B'; }), ['preparer-quai'], 'quai faux');
  egal(await fautes(M, (d) => { d.prep.palettes = '2'; }), ['preparer-palettes'], 'Agri-Kerlann annonce 3 (pas 2)');
  egal(await fautes(A, (d) => { d.dial.regles = 'volant'; }), ['accueil-regles'], 'Loïc laissé au volant');
  egal(await fautes(A, (d) => { d.dial.feuille = 'magasin'; d.dial.regles = 'aider'; }), ['accueil-feuille', 'accueil-regles'], 'deux répliques');
  egal(await fautes(A, (d) => { d.sec.signaux = []; }), ['securite-defaut', 'securite-aucun-faux'], 'rien signalé, inspection figée');
  egal(await fautes(A, (d) => { d.sec.signaux = [{ points: ['niveleur', 'lampe'], rien: 0, apresArret: false }]; }), ['securite-aucun-faux'], 'la lampe (en ordre) signalée aussi');
  egal(await fautes(A, (d) => { d.sec.signaux = [{ points: ['lampe'], rien: 0, apresArret: false }]; }), ['securite-defaut', 'securite-aucun-faux'], 'seulement le point en ordre signalé');
  egal(await fautes(A, (d) => { d.depose.P4 = 'AK1'; d.depose.P3 = 'AV1'; }), ['depose-P3', 'depose-P4'], 'P4 (Ar Vag) chez Agri-Kerlann et P3 (Agri) chez Ar Vag');
  egal(await fautes(A, (d) => { d.depose.P2 = 'autre-quai-1'; d.depose.P3 = 'allee-1'; }), ['depose-P2', 'depose-P3'], 'P2 devant l’autre quai, P3 sur l’allée');
  egal(await fautes(M, (d) => { d.rapp['resultat-agri-kerlann'] = 'conforme'; }), ['rapprocher-resultat-agri-kerlann'], 'Agri-Kerlann « conforme » (il en manque)');
  egal(await fautes(M, (d) => { d.rapp['recues-agri-kerlann'] = '3'; }), ['rapprocher-recues-agri-kerlann'], 'Agri-Kerlann : 3 reçues (l’annonce, pas le comptage)');
  egal(await fautes(M, (d) => { d.rapp['feuille-juste'] = 'ar-vag>agri-kerlann'; }), ['rapprocher-resultat-ar-vag'], 'crier au loup : la feuille jugée fausse alors qu’elle est juste');
  egal(await fautes(M, (d) => { d.rapp['feuille-corriger'] = 'loic'; }), ['rapprocher-resultat-agri-kerlann'], 'crier au loup : faire corriger une feuille juste');
  egal(await fautes(F, (d) => { d.rapp['feuille-juste'] = 'juste'; }), ['rapprocher-resultat-ar-vag'], 'erreur de feuille : la feuille jugée juste (« la palette »)');
  egal(await fautes(F, (d) => { d.rapp['feuille-juste'] = 'ar-vag>agri-kerlann'; }), ['rapprocher-resultat-ar-vag'], 'erreur de feuille : l’erreur dans le mauvais sens');
  egal(await fautes(F, (d) => { d.rapp['feuille-corriger'] = 'rature'; }), ['rapprocher-resultat-agri-kerlann'], 'erreur de feuille : « je rature moi-même » (« la correction »)');
  egal(await fautes(F, (d) => { d.rapp['feuille-corriger'] = 'rien'; }), ['rapprocher-resultat-agri-kerlann'], 'erreur de feuille : « rien, elle est juste »');
  egal(await fautes(F, (d) => { d.rapp['resultat-ar-vag'] = 'trop'; d.rapp['resultat-agri-kerlann'] = 'manque'; }), [], 'erreur de feuille : les résultats contre les annonces ne sont pas jugés (conformes pour les deux)');
  egal(await fautes(F, (d) => { d.rapp['recues-ar-vag'] = '3'; d.rapp['recues-agri-kerlann'] = '1'; }), ['rapprocher-recues-ar-vag', 'rapprocher-recues-agri-kerlann'], 'erreur de feuille : les palettes reçues recopiées de la feuille (3 et 1) au lieu d’être comptées');
  egal(await fautes(M, (d) => { d.cr.ecart = 2; }), ['cr-ecart'], 'écart « tout est conforme »');
  egal(await fautes(F, (d) => { d.cr.ecart = 1; }), ['cr-ecart'], 'erreur de feuille : « tout est conforme aux annonces » (ordre déclaré : 1 = conforme)');
  egal(await fautes(A, (d) => { d.cr.salutation = 1; d.cr.fin = 1; }), ['cr-salutation', 'cr-fin'], 'la forme');
  const enCours = await jalonsSans({ ...juste(M), sec: { ...juste(M).sec, fait: false }, finDecharge: false });
  egal([enCours['securite-defaut'], enCours['securite-aucun-faux'], enCours['depose-P1']], ['attente', 'attente', 'attente'], 'inspection non figée, déchargement pas fini');
  const nul = await jalonsSans({ ...juste(M), rapp: undefined, prep: undefined, dial: undefined, cr: undefined });
  egal(['preparer-heure', 'rapprocher-recues-ar-vag', 'accueil-feuille', 'cr-ecart'].map((j) => nul[j]), ['attente', 'attente', 'attente', 'attente'], 'fiches et phrases jamais envoyées');
});

// ─────────────────────────────────────────────────────────── le parcours à l'écran
async function parcoursJuste(k, avecOuverture, captures) {
  const K = CAMIONS[k];
  await monter({ uid: K.uid, sansOuverture: !!avecOuverture });
  if (avecOuverture) {
    const ov = (await base()).questions[ID]['@tirage'].ids;
    for (let i = 0; i < 4; i++) {
      await clic(`[data-ouv-aller="${i}"]`); await pause();
      await clic(`[data-q-choix="${OUV[ov[i]]}"][data-q="${ov[i]}"]`);
      await clic(`[data-q-repondre="${ov[i]}"]`); await pause();
    }
    await clic('[data-ouv-continuer]'); await pause();
  }
  const E0 = await entrants();
  vrai(E0.length === 1, 'un seul message à l’ouverture');
  await preparer(K.prep);
  if (captures && k === 'aucun') { await allerV('fiche'); await capture('2-preparer'); }
  await accueil();
  const legendes = [];
  let legArrivee = '';
  await quai(K, { apresBon: async () => { legArrivee = await QA.legende(); const t = await texte(); egal(JUGE.test(t.replace(/Réel.*?exercice\./g, '')), false, 'un mot qui juge sur le quai : ' + (t.match(JUGE) || [])[0]); },
    avant: async () => { if (captures) { await pg.$eval(QA.SVG, (x) => x.scrollIntoView({ block: 'center' })); await capture('3-quai-copie-' + K.quai); } },
    pendant: async (pal) => {
      const l = await QA.legende();
      if (!legendes.some((x) => x[0] === pal)) legendes.push([pal, l]);
      if (captures && pal === 'P3') { await pg.$eval(`${Z} [data-q-leg]`, (x) => x.scrollIntoView({ block: 'end' })); await capture('4-quai-depose-' + K.quai); }
    } });
  egal(legArrivee, `${K.arrivee} — Loïc te remet la feuille de ramasse.`, `la légende d’arrivée (${k}) : l’heure du planning, collègue tutoyé, article féminin, prénom`);
  egal(legendes.map(([p]) => p), SORTIE, 'une pause par palette');
  vrai(!/vous pouvez|le feuille de ramasse|Le chauffeur/.test(await texte()), 'un « vous pouvez », « le feuille » ou « le chauffeur » à l’écran');
  const etiq = (c) => (c === 'ar-vag' ? 'Biscuiterie Ar Vag' : 'Agri-Kerlann');
  SORTIE.forEach((p, i) => vrai(new RegExp(`Yann attend avec la palette ${p} — étiquette : « Expéditeur : ${etiq(K.sortie[i])} » \\(${i + 1} sur 4\\)\\. Où la pose-t-il \\?`).test(legendes[i][1]),
    `légende de ${p} : ` + legendes[i][1]));
  vrai(legendes.every(([, l]) => !/zone/i.test(l)), 'la légende parle de zone');
  vrai(new RegExp(`Quai ${K.quai}`).test(await texte()), `le quai de l’élève est le quai ${K.quai}`);
  vrai(/Les 4 palettes sont triées par client\./.test(await texte()), 'bandeau de fin du quai');
  egal(await copies(), 0, `le quai NE rend PAS la copie (${k})`);
  vrai(!(await present('[data-copie-etat="rendue"]')), 'copie rendue au bandeau après le quai');
  await rapprocher(K.rapp);
  if (captures) { await P.ouvrirParMessage('Les palettes sont triées', `fiche:${FR}`).catch(() => {}); }
  await compteRendu(crJuste(K));
  const E = await entrants();
  egal(E.map((x) => [x.from, x.subject]), [['Maëlys', 'La ramasse de Loïc'], ['Erwan', 'Loïc arrive'], ['Erwan', 'Yann est prêt'], ['Erwan', 'Les palettes sont triées'],
    ['Maëlys', 'Alors, la ramasse ?'], ['Maëlys', 'Merci']], 'les messages, dans l’ordre');
  egal(E.filter((x) => JOURS.test(x.text + x.subject)).map((x) => x.subject), [], 'un jour de la semaine dans un message');
  egal(E.filter((x) => JUGE.test(x.text) || /bonus/i.test(x.text)).map((x) => x.subject), [], 'un message dit juste / faux / erreur');
  vrai(/Rendre ma copie/.test(E[5].text) && !/Merci, je (note|préviens)/.test(E[5].text), 'Maëlys remercie sans reprendre ce que l’élève a écrit');
  const ts = E.map((x) => x.ts);
  vrai(ts.every((t, i) => !i || t >= ts[i - 1]), 'heures croissantes');
  const ecran = await texte();
  vrai(!(await present('[data-fin-jalon]')) && !(await present('[data-fin-seance] [data-fin]')) && !/Corriger/.test(ecran), 'bilan ou « Corriger » à l’écran avant la remise');
  egal(await pg.$$eval(`${Z} [data-pastille]`, (L) => L.map((x) => x.classList.contains('fait'))), [true, true, true, true, true], 'pastilles « fait »');
  const n = await noter();
  egal(ko(n), [], `jalons (${k})`);
  egal([n.score, n.max], [20, 20], 'noter(db) : ' + JSON.stringify(n.detail).slice(0, 400));
  egal(await pg.evaluate(() => window.__f.enregistres.length), 0, 'remontée au Suivi avant la remise');
  if (captures && k === 'aucun') { await pg.$eval(`${Z} [data-copie-rendre]`, (x) => x.scrollIntoView({ block: 'center' })); await capture('6-avant-remise'); }
  const c = await rendre();
  egal([c.score, c.max], [n.score, n.max], 'la note rendue = noter(db)');
  vrai(await present('[data-copie-etat="rendue"]'), 'copie rendue à l’écran');
  if (captures && k === 'aucun') await capture('7-copie-rendue');
  egal(await copies(), 1, 'une seule remise');
  egal(P.erreurs, [], 'erreurs JavaScript');
}
await v('ENT-10.8 : parcours juste à l’écran, SANS écart (t108-1, planning quai A, 2+2, niveleur) — 20/20 à la remise, égal à noter(db) ; le quai ne rend pas la copie ; rien ne dit juste ou faux ; la légende cite l’étiquette, jamais la zone ; messages dans l’ordre, sans jour de la semaine', async () => {
  await parcoursJuste('aucun', true, true);
});
await v('ENT-10.8 : parcours juste à l’écran, « il en manque » (t108-4, Agri-Kerlann annonce 3) — 20/20 ; l’élève compte 2 + 2 au quai et le dit', async () => {
  await parcoursJuste('moins', false, false);
});
await v('ENT-10.8 : parcours juste à l’écran, « il y en a trop » (t108-12, planning quai B à 7 h 00, 3+1) — 20/20 ; Loïc arrive à 7 h 00 ; Ar Vag a trois cases, la troisième est la bonne pour P1 ; « devant l’autre quai » = quai A', async () => {
  await parcoursJuste('plus', false, true);
});
await v('ENT-10.8 : parcours juste à l’écran, ERREUR DE FEUILLE d’Agri-Kerlann vers Ar Vag (t108-2) — 20/20 ; l’élève trie d’après les étiquettes, juge la feuille fausse dans le bon sens et la fait corriger par Loïc avec Maëlys', async () => {
  await parcoursJuste('feuille', false, false);
});
await v('ENT-10.8 : parcours juste à l’écran, ERREUR DE FEUILLE d’Ar Vag vers Agri-Kerlann (t108-18, quai B) — 20/20 ; l’autre sens', async () => {
  await parcoursJuste('feuille2', false, false);
});

// ─────────────────────────────────────────────────────────── inspection, dépose, dialogue en copie
await v('ENT-10.8 : inspection en copie — « C’est bon » sans rien signaler : RIEN n’arrête l’élève, le déchargement s’ouvre ; défaut ✗ et aucun faux ✗ ; un défaut et un point en ordre signalés reçoivent LA MÊME réponse neutre « C’est noté. » (la scène ne se répare pas sous ses yeux)', async () => {
  const K = CAMIONS.aucun;   // défaut = niveleur relevé, en ordre = lampe
  await monter({ uid: K.uid });
  await preparer(K.prep); await accueil();
  await allerV('quai'); await pg.waitForSelector(QA.SVG);
  vrai(/Avant que Yann entre dans le camion, regarde le quai et le camion\. Si quelque chose ne va pas, signale-le à Yann\./.test(await texte()), 'la consigne au-dessus de la scène');
  await QA.marquer('niveleur'); await QA.signaler();
  const c1 = await QA.chef();
  const vue1 = await pg.$eval(QA.SVG, (s) => s.innerHTML.length);
  await QA.marquer('lampe'); await QA.signaler();
  const c2 = await QA.chef();
  egal([c1, c2], ['Yann : « C’est noté. Dis-moi quand on peut décharger. »', 'Yann : « C’est noté. Dis-moi quand on peut décharger. »'], 'réponses du cariste (défaut, objet en ordre)');
  vrai(vue1 > 0, 'scène');
  // Un autre élève : « C’est bon » tout de suite.
  await monter({ uid: CAMIONS.moins.uid });
  await preparer(CAMIONS.moins.prep); await accueil();
  await allerV('quai'); await pg.waitForSelector(QA.SVG);
  await QA.cestBon();
  vrai(!(await present('[data-q-secu-arret]')), 'le cariste arrête l’élève en évaluation');
  vrai(await present('[data-q="decharger"]'), 'le déchargement ne s’ouvre pas');
  const d = (await noter()).detail;
  egal([d['securite-defaut'], d['securite-aucun-faux']], ['ko', 'ko'], 'rien signalé');
});

await v('ENT-10.8 : dépose en copie — le premier clic pose, même sur l’allée piétonne, chez l’autre client ou devant l’autre quai : aucune bulle de réaction, aucune case grisée ; le jalon lit ce premier clic ; seule la palette bien posée est juste', async () => {
  const K = CAMIONS.aucun;   // P4 Ar Vag, P3 Agri, P2 Ar Vag, P1 Agri
  await monter({ uid: K.uid });
  await preparer(K.prep); await accueil();
  await quai(K, { depose: { P4: 'allee-1', P3: 'AV1', P2: 'autre-quai-1', P1: 'AK1' }, pendant: async () => {
    vrai(!(await present('.quai-case-grisee')) && !(await present('[data-case-grisee]')), 'une case grisée en évaluation');
    const a = await QA.annonce();
    vrai(!/ne pose pas|Regarde l’étiquette|Ça, c’est/.test(a), 'une réaction du cariste : ' + a);
  } });
  const e = (await base()).quais[QID].depose;
  egal(Object.fromEntries(Object.entries(e).map(([p, x]) => [p, [x.premier, x.pose]])),
    { P4: ['allee-1', 'allee-1'], P3: ['AV1', 'AV1'], P2: ['autre-quai-1', 'autre-quai-1'], P1: ['AK1', 'AK1'] }, 'état de la dépose');
  const d = (await noter()).detail;
  egal(['depose-P1', 'depose-P2', 'depose-P3', 'depose-P4'].map((j) => d[j]), ['ok', 'ko', 'ko', 'ko'], 'jalons de la dépose');
  vrai(await present('[data-q-fin], [data-q-arret]') || /Les 4 palettes sont triées par client\./.test(await texte()), 'le quai s’arrête après la dernière palette');
  egal(await copies(), 0, 'la dépose ne rend pas la copie');
});

await v('ENT-10.8 : dialogue en copie — « Oui, reste au volant » à la 2e réplique : AUCUNE réaction de Loïc, l’entretien finit en deux tours, un seul appel ; seul ce jalon ✗ (la première réponse compte)', async () => {
  const K = CAMIONS.plus;
  await monter({ uid: K.uid });
  await preparer(K.prep);
  await allerV('telephone');
  vrai(/Loïc arrive avec la ramasse\. Va l’accueillir\./.test(await texte()), 'la situation avant l’entretien');
  egal(await pg.textContent(`${Z} [data-dlg-appeler="${DID}"]`), 'Aller le voir', 'face à face');
  await clic(`[data-dlg-appeler="${DID}"]`); await pause();
  await dire('feuille'); await dire('volant');
  const fil = await pg.textContent(`${Z} [data-dlg-fil]`);
  vrai(!/Erwan ne serait pas d’accord|Euh|Au volant/.test(fil), 'une réaction de Loïc : ' + fil);
  vrai(await present('[data-dlg-raccrocher]'), 'après deux tours, on peut raccrocher');
  await clic('[data-dlg-raccrocher]'); await pause();
  vrai(!(await present(`[data-dlg-appeler="${DID}"]`)) || !/Revenir|Rappeler/.test(await pg.textContent(`${Z} [data-dlg-appeler="${DID}"]`)), 'un second appel est proposé');
  await quai(K); await rapprocher(K.rapp); await compteRendu(crJuste(K));
  const n = await noter();
  egal(ko(n), ['accueil-regles'], 'seul « ce qu’il fait pendant le déchargement » est faux');
});

// ─────────────────────────────────────────────────────────── rapprocher, rendre compte
await v('ENT-10.8 : « Rapprocher » — la fiche a les MÊMES six lignes pour tous (les deux camions « sans écart » et « erreur de feuille » la voient identique) ; l’élève qui recopie les chiffres de la feuille (3 et 1) au lieu de compter perd les deux « reçues » ; « la feuille est juste » sur une erreur de feuille perd « la palette » seule', async () => {
  const K = CAMIONS.feuille;
  await monter({ uid: K.uid });
  await preparer(K.prep); await accueil(); await quai(K);
  await P.ouvrirParMessage('Les palettes sont triées', `fiche:${FR}`);
  const champs = await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.map((x) => [x.dataset.ficheChamp, [...x.options].map((o) => o.value).join('|')]));
  egal(champs.map(([c]) => c), ['recues-ar-vag', 'resultat-ar-vag', 'recues-agri-kerlann', 'resultat-agri-kerlann', 'feuille-juste', 'feuille-corriger'], 'six lignes');
  const options = JSON.stringify(champs);
  await capture('5-rapprocher');
  await pg.evaluate(() => window.scrollTo(0, 0));
  const dg = await pg.$$eval(`${Z} [data-fiche-doc]`, (L) => L.map((x) => x.dataset.ficheDoc));
  egal(dg, ['feuille-ramasse-108', 'annonce-ar-vag-108', 'annonce-agri-kerlann-108'], 'documents à gauche (ni droit, ni règles : aucune aide)');
  const lib = await pg.$$eval(`${Z} [data-fiche-champ] option`, (L) => L.map((o) => o.textContent.trim()));
  vrai(lib.includes('fausse : une palette d’Agri-Kerlann est notée chez Ar Vag') && lib.includes('fausse : une palette d’Ar Vag est notée chez Agri-Kerlann') && lib.includes('juste'), 'options de la feuille : ' + lib);
  await monter({ uid: CAMIONS.aucun.uid });
  await preparer(CAMIONS.aucun.prep); await accueil(); await quai(CAMIONS.aucun);
  await P.ouvrirParMessage('Les palettes sont triées', `fiche:${FR}`);
  const champs2 = await pg.$$eval(`${Z} [data-fiche-champ]`, (L) => L.map((x) => [x.dataset.ficheChamp, [...x.options].map((o) => o.value).join('|')]));
  egal(JSON.stringify(champs2), options, 'fiche identique chez un élève sans écart');
});

await v('ENT-10.8 : erreur de feuille — l’élève qui suit la feuille (reçues 3 et 1, « conforme », « elle est juste ») perd « reçues » ×2 et « la palette » + « la correction » = 3 points sur 3 de « Rapprocher » ; le reste vaut 17 ; Maëlys ne corrige pas et ne reprend pas', async () => {
  const K = CAMIONS.feuille;
  await monter({ uid: K.uid });
  await parcours(K, { rapp: { 'recues-ar-vag': '3', 'resultat-ar-vag': 'trop', 'recues-agri-kerlann': '1', 'resultat-agri-kerlann': 'manque', 'feuille-juste': 'juste', 'feuille-corriger': 'rien' },
    cr: { salutation: SALUT, ecart: 'Ar Vag : 1 palette de plus que l’annonce.', fin: FIN } });
  const n = await noter();
  egal(ko(n), ['rapprocher-recues-ar-vag', 'rapprocher-recues-agri-kerlann', 'rapprocher-resultat-ar-vag', 'rapprocher-resultat-agri-kerlann', 'cr-ecart'], 'jalons faux');
  proche(n.score, 20 - 3 - 1.5, 'note');
  const E = await entrants();
  vrai(!/Merci, je (note|préviens)|corrig/i.test(E[E.length - 1].text), 'Maëlys corrige ou reprend : ' + E[E.length - 1].text);
});

await v('ENT-10.8 : rendre compte — « Tout est conforme aux annonces » sur une erreur de feuille ou sur un camion « il en manque » : seule la ligne de l’écart tombe (−1,5), la forme reste ; les quatre phrases de chaque camion sont bien celles du jeu', async () => {
  for (const k of ['feuille', 'moins']) {
    const K = CAMIONS[k];
    await monter({ uid: K.uid });
    await parcours(K, { cr: { salutation: SALUT, ecart: 'Tout est conforme aux annonces.', fin: FIN } });
    const n = await noter();
    egal(ko(n), ['cr-ecart'], `seul l’écart est faux (${k})`);
    proche(n.score, 18.5, `note (${k})`);
  }
  await monter({ uid: CAMIONS.plus.uid });
  await parcours(CAMIONS.plus, { cr: { salutation: 'Bonjour à tous,', ecart: CAMIONS.plus.ecart, fin: 'Cordialement' } });
  const n = await noter();
  egal(ko(n), ['cr-salutation', 'cr-fin'], 'la forme seule');
  proche(n.score, 19.5, 'note (forme 0,5)');
});

// ─────────────────────────────────────────────────────────── le pire cas, le socle
await v('ENT-10.8 : pire cas — tout faux (ouverture fausse, heure et quai faux, maladroit à chaque réplique, rien signalé, chaque palette sur l’allée ou chez l’autre client, rapprochement faux, phrases fausses) → 0/20 à la remise ; aucune réaction, aucun bilan', async () => {
  const K = CAMIONS.aucun;
  await monter({ uid: K.uid, rep: OUV_FAUSSES });
  await parcours(K, { prep: { heure: '6 h 30', quai: 'B', palettes: '5' }, dial: { feuille: 'decharge', regles: 'volant' }, envois: [],
    depose: { P4: 'AK1', P3: 'AV1', P2: 'allee-1', P1: 'autre-quai-1' },
    rapp: { 'recues-ar-vag': '4', 'resultat-ar-vag': 'trop', 'recues-agri-kerlann': '1', 'resultat-agri-kerlann': 'manque', 'feuille-juste': 'ar-vag>agri-kerlann', 'feuille-corriger': 'rature' },
    cr: { salutation: 'Bonjour à tous,', ecart: 'Ar Vag : 1 palette de moins que l’annonce.', fin: 'Cordialement' } });
  const n = await noter();
  egal(JALONS.filter((j) => n.detail[j] !== 'ko'), [], 'tous les jalons faux');
  proche(n.score, 0, 'note');
  const c = await rendre();
  egal([c.score, c.max], [0, 20], 'la copie rendue vaut 0');
  vrai(!(await present('[data-fin-jalon]')), 'bilan à l’écran');
});

await v('ENT-10.8 : le corrigé de l’enseignant se calcule depuis la graine de chacun (planning, camion, écart, défaut, cases, rapprochement, phrase) et pour un élève qui n’a pas ouvert la séance', async () => {
  const r = await pg.evaluate(async () => {
    const C = await import('/contenus/corriges/ENT-10.8.js');
    const vu = (g) => C.corrigeEleve({ tirage: { graine: g } }, 'x').items.map((i) => [i.texte, i.rep]);
    return { n: C.CORRIGE.items.length, feuille: vu('t108-2'), moins: vu('t108-4'), sans: C.corrigeEleve({}, 'u-jamais-ouvert').texte };
  });
  egal(r.n, 8, 'parties du corrigé commun');
  egal(r.feuille, [
    ['Son planning', 'Loïc arrive à 7 h 30, quai A (grille 1 sur 2)'],
    ['Son camion', '4 palettes (2 palettes de chaque client) ; ordre de sortie : P4 Ar Vag, P3 Ar Vag, P2 Agri-Kerlann, P1 Agri-Kerlann'],
    ['Son écart', 'erreur d’écriture de Loïc : une palette est notée chez le mauvais client sur la feuille (+1 chez l’un, −1 chez l’autre) ; les annonces et les étiquettes sont justes (Agri-Kerlann)'],
    ['À quelle heure arrive le camion de Loïc ?', '7 h 30'], ['À quel quai ?', 'Quai A'], ['Combien de palettes Ar Vag annonce-t-il ?', '2'],
    ['Son défaut au quai', 'Loïc au volant, moteur allumé (en ordre : lampe de quai allumée)'],
    ['Palette P1 (Agri-Kerlann)', 'AK1 ou AK2 ou AK3'], ['Palette P2 (Agri-Kerlann)', 'AK1 ou AK2 ou AK3'], ['Palette P3 (Biscuiterie Ar Vag)', 'AV1 ou AV2 ou AV3'],
    ['Palette P4 (Biscuiterie Ar Vag)', 'AV1 ou AV2 ou AV3'],
    ['Rapprocher : Biscuiterie Ar Vag', 'annoncées 2, feuille 3, 2 reçues, conforme'], ['Rapprocher : Agri-Kerlann', 'annoncées 2, feuille 1, 2 reçues, conforme'],
    ['La feuille de ramasse est…', 'fausse : une palette d’Agri-Kerlann est notée chez Ar Vag'], ['Que fais-tu de la feuille ?', 'Je la fais corriger par Loïc, avec Maëlys'],
    ['Rendre compte à Maëlys', 'Salut Maëlys, 4 palettes : 2 Ar Vag, 2 Agri-Kerlann, triées en zone de réception. La feuille de ramasse se trompe : une palette d’Agri-Kerlann est notée chez Ar Vag.']],
  'corrigé de t108-2 (erreur de feuille)');
  egal(r.moins.filter(([t]) => /Rapprocher|À quel|Combien/.test(t)), [
    ['À quelle heure arrive le camion de Loïc ?', '7 h 30'], ['À quel quai ?', 'Quai A'], ['Combien de palettes Agri-Kerlann annonce-t-il ?', '3'],
    ['Rapprocher : Biscuiterie Ar Vag', 'annoncées 2, feuille 2, 2 reçues, conforme'], ['Rapprocher : Agri-Kerlann', 'annoncées 3, feuille 2, 2 reçues, il en manque']],
  'corrigé de t108-4 (il en manque)');
  vrai(/pas encore ouvert/.test(r.sans), 'élève qui n’a pas ouvert : ' + r.sans);
});

await v('ENT-10.8 : socle — aucune adresse hors du site, aucune erreur JavaScript ; écrans à 1366 × 768 sans défilement horizontal (accueil, fiche « Préparer », quai, « Rapprocher ») ; huit cases proposées de gauche à droite, nom lu au clavier sans verdict', async () => {
  const K = CAMIONS.plus;
  await monter({ uid: K.uid });
  vrai(await large() <= 0, 'accueil : défilement horizontal');
  await allerV('fiche');
  vrai(await large() <= 0, 'fiche : défilement horizontal');
  await preparer(K.prep); await accueil();
  await allerV('quai'); await pg.waitForSelector(QA.SVG);
  await QA.marquer(K.defaut); await QA.signaler(); await QA.cestBon(); await QA.decharger();
  egal(await QA.proposees(), ['allee-1', 'AV1', 'AV2', 'AV3', 'AK1', 'AK2', 'AK3', 'autre-quai-1'], 'huit cases proposées, de gauche à droite');
  egal(await pg.getAttribute(`${Z} [data-q="depose"][data-c="AK1"]`, 'aria-label'), 'Case AGRI 1', 'nom lu au clavier : le lieu, jamais le verdict');
  egal(await pg.getAttribute(`${Z} [data-q="depose"][data-c="autre-quai-1"]`, 'aria-label'), 'Devant le quai A', 'la case devant l’autre quai (Loïc est au quai B)');
  vrai(await large() <= 0, 'quai : défilement horizontal');
  for (const pal of SORTIE) await QA.deposer(K.cases[pal]);
  await rapprocher(K.rapp);
  await P.ouvrirParMessage('Les palettes sont triées', `fiche:${FR}`).catch(() => {});
  vrai(await large() <= 0, 'rapprocher : défilement horizontal');
  egal([...P.hotes], [], 'adresses hors du site');
  egal(P.erreurs, [], 'erreurs JavaScript');
});

await P.fermer();
}
